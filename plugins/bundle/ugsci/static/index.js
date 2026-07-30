function jt() {
  var t;
  const e = (t = window.QwenPaw) == null ? void 0 : t.host;
  if (!e) throw new Error("[ugsci] QwenPaw.host not available");
  return e;
}
function Oa(e) {
  const t = jt().getApiToken() || "";
  return {
    "Content-Type": "application/json",
    ...t ? { Authorization: `Bearer ${t}` } : {},
    "X-Agent-Id": e
  };
}
async function Pa(e, t) {
  try {
    const l = await fetch(jt().getApiUrl(e), {
      headers: Oa(t)
    });
    return l.ok ? await l.json() : null;
  } catch {
    return null;
  }
}
function bn(e) {
  return Pa("/ugsci/team/state", e);
}
const Aa = {
  plan: { label: "规划", color: "#1677ff", icon: "📋" },
  dispatch: { label: "分派", color: "#13c2c2", icon: "🚀" },
  verify: { label: "验证", color: "#fa8c16", icon: "🔍" },
  synthesize: { label: "综合", color: "#722ed1", icon: "📊" },
  completed: { label: "完成", color: "#52c41a", icon: "✅" }
}, Sn = [
  "plan",
  "dispatch",
  "verify",
  "synthesize",
  "completed"
], Ma = 3;
function $a() {
  const e = jt(), t = e.React, { useState: l, useEffect: a, useCallback: n, useRef: s } = t, { Card: r, Tag: o, Typography: d, Button: c, Steps: u, Empty: b, Alert: _ } = e.antd, { ReloadOutlined: S } = e.antdIcons || {}, { Text: h, Paragraph: f } = d, I = e.useSelectedAgent ? e.useSelectedAgent() : { id: "default" }, A = (I == null ? void 0 : I.id) || "default", [D, M] = l(null), [ne, F] = l(!1), G = s(null), w = s(0), x = n(async () => {
    F(!0);
    const Z = await bn(A);
    Z ? (w.current = 0, G.current = Z, M(Z)) : w.current += 1, F(!1);
  }, [A]);
  if (a(() => {
    w.current = 0, G.current = null, M(null), x();
    const Z = window.setInterval(async () => {
      var p;
      if (w.current >= Ma) return;
      const C = await bn(A);
      if (!C) {
        w.current += 1;
        return;
      }
      w.current = 0, (C.active || (p = G.current) != null && p.active) && (G.current = C, M(C));
    }, 5e3);
    return () => window.clearInterval(Z);
  }, [A, x]), (D == null ? void 0 : D.status) === "unreadable")
    return t.createElement(_, {
      type: "warning",
      showIcon: !0,
      message: "专家团状态暂时无法读取",
      description: `实例 ${D.instance_id || "未知"} 的状态文件需要检查。`,
      style: { marginBottom: 16 },
      action: t.createElement(
        c,
        { size: "small", onClick: x, loading: ne },
        "重试"
      )
    });
  if (!D || !D.active)
    return t.createElement(b, {
      description: "暂无活跃的专家团工作流",
      style: { padding: 24 }
    });
  const k = D.state, K = k.current_phase || "plan", N = Sn.indexOf(K), $ = k.team_name || "未知团队", y = k.team_mode || "pipeline", g = k.iteration || 0, P = k.members || [], J = k.verify_retries || 0, q = {
    pipeline: "流水线模式",
    coordinator: "协调者模式",
    roundtable: "圆桌讨论"
  };
  return t.createElement(
    r,
    {
      size: "small",
      style: { marginBottom: 16 },
      title: t.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 8 } },
        t.createElement("span", { style: { fontSize: 16 } }, "🔄"),
        t.createElement(h, { strong: !0 }, `${$} — 工作流状态`),
        t.createElement(
          o,
          { color: "blue", style: { fontSize: 10 } },
          q[y] || y
        ),
        t.createElement(
          o,
          { style: { fontSize: 10 } },
          `迭代 ${g}`
        ),
        J > 0 ? t.createElement(
          o,
          { color: "orange", style: { fontSize: 10 } },
          `验证重试 ${J}`
        ) : null
      ),
      extra: t.createElement(
        c,
        {
          size: "small",
          type: "text",
          icon: S ? t.createElement(S) : void 0,
          onClick: x,
          loading: ne
        },
        "刷新"
      )
    },
    t.createElement(u, {
      current: N,
      size: "small",
      items: Sn.map((Z) => {
        const C = Aa[Z];
        return {
          title: `${C.icon} ${C.label}`,
          description: Z === "plan" ? "分析任务，创建任务分解" : Z === "dispatch" ? "分派专家执行任务" : Z === "verify" ? "交叉验证专家结果" : Z === "synthesize" ? "综合形成最终报告" : "工作流完成"
        };
      })
    }),
    t.createElement(
      "div",
      {
        style: {
          marginTop: 12,
          display: "flex",
          gap: 6,
          flexWrap: "wrap"
        }
      },
      ...P.map(
        (Z, C) => t.createElement(
          o,
          { key: `${Z.name}-${C}`, style: { fontSize: 11 } },
          `${Z.emoji || ""} ${Z.name}（${Z.role}）`
        )
      )
    ),
    k.task ? t.createElement(
      f,
      {
        style: {
          fontSize: 12,
          marginTop: 8,
          marginBottom: 0,
          color: "#666"
        },
        ellipsis: { rows: 2 }
      },
      `任务: ${k.task}`
    ) : null
  );
}
function z() {
  var t;
  const e = (t = window.QwenPaw) == null ? void 0 : t.host;
  if (!e) throw new Error("[ugsci] QwenPaw.host not available");
  return e;
}
function Ra() {
  try {
    return z().getApiToken() || "";
  } catch {
    return "";
  }
}
function Qe(e) {
  return z().getApiUrl(e);
}
function jn(e) {
  const t = Ra();
  return {
    "Content-Type": "application/json",
    ...t ? { Authorization: `Bearer ${t}` } : {},
    ...e
  };
}
const At = /* @__PURE__ */ new Map(), La = 15e3;
function Ze() {
  At.clear();
}
async function re(e, t) {
  const l = ((t == null ? void 0 : t.method) || "GET").toUpperCase(), { bypassCache: a, ...n } = t || {};
  if (l !== "GET" && Ze(), l === "GET" && !a) {
    const o = At.get(e);
    if (o && Date.now() - o.ts < La)
      return o.data;
  }
  const s = await fetch(Qe(e), {
    ...n,
    headers: { ...jn(), ...n.headers || {} }
  });
  if (!s.ok) {
    const o = await s.text().catch(() => "");
    throw new Error(o || `HTTP ${s.status}`);
  }
  if (s.status === 204) return null;
  const r = await s.json();
  return l === "GET" && At.set(e, { data: r, ts: Date.now() }), r;
}
async function Bt() {
  const e = await re("/agents");
  return (e == null ? void 0 : e.agents) || [];
}
async function Ut(e) {
  return re(`/agents/${encodeURIComponent(e)}`);
}
async function wt(e) {
  return await re("/skills", {
    headers: { "X-Agent-Id": e }
  }) || [];
}
async function Nt(e = !1) {
  return await re(`/skills/pool${e ? "?summary=true" : ""}`) || [];
}
async function ja(e) {
  const t = await re(
    `/skills/pool/${encodeURIComponent(e)}/content`
  );
  return (t == null ? void 0 : t.content) || "";
}
async function Ba() {
  return await re("/skills/workspaces") || [];
}
async function Ua(e) {
  return await re("/mcp", {
    headers: { "X-Agent-Id": e }
  }) || [];
}
async function Na(e, t) {
  return re(
    `/mcp/toggle/${encodeURIComponent(t)}`,
    {
      method: "PATCH",
      headers: { "X-Agent-Id": e }
    }
  );
}
async function Da(e, t) {
  await re(`/mcp/${encodeURIComponent(t)}`, {
    method: "DELETE",
    headers: { "X-Agent-Id": e }
  });
}
async function Fa(e, t, l) {
  return re("/mcp", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify({ client_key: t, client: l })
  });
}
async function Ga(e, t, l) {
  return re(
    `/mcp/${encodeURIComponent(t)}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json", "X-Agent-Id": e },
      body: JSON.stringify(l)
    }
  );
}
async function Ha(e, t) {
  return await re(
    `/mcp/tools/${encodeURIComponent(t)}`,
    { headers: { "X-Agent-Id": e } }
  ) || [];
}
async function Wa(e, t) {
  return re(
    `/mcp/policy/${encodeURIComponent(t)}`,
    { headers: { "X-Agent-Id": e } }
  );
}
async function Ja(e, t, l) {
  return re(
    `/mcp/policy/${encodeURIComponent(t)}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json", "X-Agent-Id": e },
      body: JSON.stringify(l)
    }
  );
}
async function Xa(e) {
  return await re(
    "/mcp/access-principals",
    { headers: { "X-Agent-Id": e } }
  ) || [];
}
async function Ka(e, t, l) {
  return re(
    `/mcp/oauth/start/${encodeURIComponent(t)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Agent-Id": e },
      body: JSON.stringify(l)
    }
  );
}
async function Va(e, t) {
  return re(
    `/mcp/oauth/status/${encodeURIComponent(t)}`,
    { headers: { "X-Agent-Id": e } }
  );
}
async function qa(e, t) {
  await re(
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
function Ke() {
  try {
    return localStorage.getItem("qwenpaw_sidebar_mode") === "simple";
  } catch {
    return !1;
  }
}
function Dt(e, t) {
  const l = z();
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
function Ya(e) {
  if (!e.env) return !1;
  const t = Object.entries(e.env);
  return t.length === 0 ? !1 : t.some(([, l]) => typeof l == "string" && l.length > 0);
}
const Qa = [
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
], Za = Qa, Bn = "ugsci_custom_teams";
function Et() {
  try {
    const e = localStorage.getItem(Bn);
    return e ? JSON.parse(e) : [];
  } catch {
    return [];
  }
}
function Un(e) {
  try {
    localStorage.setItem(Bn, JSON.stringify(e));
  } catch {
  }
}
const el = [
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
async function tl(e, t) {
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
  await fetch(Qe("/console/chat"), {
    method: "POST",
    headers: {
      ...jn(),
      "X-Agent-Id": e
    },
    body: JSON.stringify(l)
  });
}
function vt(e, t) {
  const l = e.find(
    (n) => n.name === t || n.name === t.replace(/\s+/g, "")
  );
  if (l) return l.id;
  const a = e.find(
    (n) => n.name.includes(t) || t.includes(n.name) || n.name.replace(/\s+/g, "").includes(t.replace(/\s+/g, ""))
  );
  return a ? a.id : null;
}
function nl({ team: e }) {
  const t = z().React, { Typography: l, Tag: a } = z().antd, { Text: n } = l, s = {
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
      ...d ? o.map((c, u) => (e.members.find(
        (b) => b.name === c.agentName
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
          t.createElement(Re, {
            name: c.agentName,
            size: 24
          }),
          t.createElement(
            "div",
            null,
            t.createElement(
              n,
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
          t.createElement(Re, { name: c.name, size: 24 }),
          t.createElement(
            "div",
            null,
            t.createElement(
              n,
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
function al({
  open: e,
  onClose: t,
  agents: l,
  editingTeam: a,
  onSaved: n
}) {
  const s = z().React, { useState: r, useEffect: o, useCallback: d } = s, {
    Modal: c,
    Input: u,
    Button: b,
    Select: _,
    Tag: S,
    Typography: h,
    Switch: f,
    Empty: I,
    message: A,
    Divider: D,
    Steps: M
  } = z().antd, { PlusOutlined: ne, DeleteOutlined: F, SaveOutlined: G, ArrowRightOutlined: w } = z().antdIcons || {}, { Text: x, Paragraph: k } = h, [K, N] = r(""), [$, y] = r("🤝"), [g, P] = r(""), [J, q] = r(
    "pipeline"
  ), [Z, C] = r(""), [p, E] = r(""), [j, ae] = r([]), [B, Y] = r([]), [ie, H] = r(!1);
  o(() => {
    e && (a ? (N(a.name), y(a.emoji), P(a.description), q(a.mode), C(a.coordinatorName || ""), E(a.taskTemplate), ae(a.steps || []), Y(a.members.map((R) => R.name))) : (N(""), y("🤝"), P(""), q("pipeline"), C(""), E(`请执行以下任务：
任务描述：{任务描述}`), ae([]), Y([])));
  }, [e, a]);
  const Q = d(() => {
    if (J === "roundtable") {
      const R = B.map((se) => ({
        agentName: se,
        instruction: "请给出你的专业评估意见",
        passContext: !1
      }));
      ae(R);
    } else if (J === "pipeline") {
      const R = new Map(j.map((de) => [de.agentName, de])), se = B.map((de) => R.get(de) || {
        agentName: de,
        instruction: "请完成你的专业部分",
        passContext: !0
      });
      ae(se);
    }
  }, [J, B, j]), ce = (R) => {
    B.includes(R) || (Y([...B, R]), J === "coordinator" && !Z && C(R));
  }, v = (R) => {
    Y(B.filter((se) => se !== R)), ae(j.filter((se) => se.agentName !== R)), Z === R && C(B[0] || "");
  }, ee = (R, se, de) => {
    const Ee = [...j];
    Ee[R] = { ...Ee[R], [se]: de }, ae(Ee);
  }, m = () => {
    if (!K.trim()) {
      A.warning("请输入团队名称");
      return;
    }
    if (B.length < 2) {
      A.warning("至少需要选择 2 个成员");
      return;
    }
    if (!p.trim()) {
      A.warning("请输入任务模板");
      return;
    }
    if (J === "coordinator" && !Z) {
      A.warning("请选择协调者");
      return;
    }
    H(!0);
    try {
      const R = B.map(
        (pe) => {
          var U;
          const le = l.find((T) => T.name === pe);
          return {
            name: pe,
            role: ((U = le == null ? void 0 : le.description) == null ? void 0 : U.slice(0, 30)) || "团队成员",
            emoji: ""
          };
        }
      );
      let se = j;
      (j.length === 0 || j.length !== B.length) && (se = B.map((pe) => ({
        agentName: pe,
        instruction: "请完成你的专业部分",
        passContext: J === "pipeline"
      })));
      const de = {
        id: (a == null ? void 0 : a.id) || `custom-${Date.now()}`,
        name: K.trim(),
        emoji: $,
        category: "自定义",
        description: g.trim() || `${K.trim()}（${B.length}人团队）`,
        mode: J,
        members: R,
        coordinatorName: J === "coordinator" ? Z : void 0,
        taskTemplate: p.trim(),
        orchestrationPrompt: "",
        // Custom teams use steps-based instructions
        steps: se,
        custom: !0,
        createdAt: (a == null ? void 0 : a.createdAt) || Date.now()
      }, Ee = Et(), ye = Ee.findIndex((pe) => pe.id === de.id);
      ye >= 0 ? Ee[ye] = de : Ee.push(de), Un(Ee), A.success(a ? "团队已更新" : "团队已创建"), n(), t();
    } catch (R) {
      A.error(R.message || "保存失败");
    } finally {
      H(!1);
    }
  }, X = l.filter(
    (R) => !B.includes(R.name)
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
        icon: G ? s.createElement(G) : void 0
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
        B.length > 0 ? s.createElement(Jt, {
          members: B,
          size: 36
        }) : null,
        s.createElement(u, {
          placeholder: "团队名称（如：储层评价团队）",
          value: K,
          onChange: (R) => N(R.target.value),
          style: { flex: 1 }
        })
      ),
      s.createElement(u.TextArea, {
        placeholder: "团队描述（简述团队的目标和适用场景）",
        value: g,
        onChange: (R) => P(R.target.value),
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
        s.createElement(_, {
          value: J,
          onChange: (R) => q(R),
          style: { width: 160 },
          options: [
            { value: "pipeline", label: "🔄 流水线（依次执行）" },
            { value: "roundtable", label: "🔀 圆桌讨论（独立评估）" },
            { value: "coordinator", label: "🎯 协调者（由协调者主导）" }
          ]
        })
      )
    ),
    s.createElement(D, { style: { margin: "12px 0" } }),
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
      X.length > 0 ? s.createElement(
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
        ...X.map(
          (R) => s.createElement(
            b,
            {
              key: R.id,
              size: "small",
              icon: ne ? s.createElement(ne) : void 0,
              onClick: () => ce(R.name)
            },
            R.name
          )
        )
      ) : null,
      // Selected members
      B.length === 0 ? s.createElement(I, {
        description: "请从上方添加团队成员",
        image: I.PRESENTED_IMAGE_SIMPLE
      }) : s.createElement(
        "div",
        { style: { display: "flex", flexDirection: "column", gap: 4 } },
        ...B.map(
          (R) => s.createElement(
            "div",
            {
              key: R,
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
              s.createElement(Re, { name: R, size: 24 }),
              s.createElement(
                x,
                { strong: !0, style: { fontSize: 13 } },
                R
              ),
              J === "coordinator" && Z === R ? s.createElement(
                S,
                { color: "blue", style: { fontSize: 10 } },
                "协调者"
              ) : null
            ),
            s.createElement(
              "div",
              { style: { display: "flex", gap: 4 } },
              J === "coordinator" ? s.createElement(
                b,
                {
                  size: "small",
                  type: "link",
                  onClick: () => C(R)
                },
                "设为协调者"
              ) : null,
              s.createElement(
                b,
                {
                  size: "small",
                  type: "link",
                  danger: !0,
                  icon: F ? s.createElement(F) : void 0,
                  onClick: () => v(R)
                },
                "移除"
              )
            )
          )
        )
      )
    ),
    s.createElement(D, { style: { margin: "12px 0" } }),
    // Step 3: Define execution steps (for pipeline/roundtable)
    B.length > 0 ? s.createElement(
      "div",
      { style: { marginBottom: 16 } },
      s.createElement(
        x,
        {
          strong: !0,
          style: { display: "block", marginBottom: 8, fontSize: 13 }
        },
        `3. 编排执行步骤${J === "roundtable" ? "（各步独立执行）" : J === "pipeline" ? "（依次执行，可传递上下文）" : "（由协调者决定调用顺序）"}`
      ),
      // Auto-sync button
      s.createElement(
        b,
        {
          size: "small",
          type: "dashed",
          onClick: Q,
          style: { marginBottom: 8 }
        },
        "自动生成步骤"
      ),
      // Steps list
      j.length === 0 ? s.createElement(
        x,
        { type: "secondary", style: { fontSize: 12 } },
        "点击「自动生成步骤」或手动配置每步的指令"
      ) : s.createElement(
        "div",
        { style: { display: "flex", flexDirection: "column", gap: 6 } },
        ...j.map(
          (R, se) => s.createElement(
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
              J === "pipeline" ? s.createElement(
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
                R.agentName
              ),
              s.createElement(
                "div",
                { style: { flex: 1 } },
                s.createElement(u, {
                  placeholder: "请输入该步骤的指令...",
                  value: R.instruction,
                  onChange: (de) => ee(se, "instruction", de.target.value),
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
              s.createElement(f, {
                size: "small",
                checked: R.passContext,
                onChange: (de) => ee(se, "passContext", de)
              }),
              s.createElement(
                x,
                { type: "secondary", style: { fontSize: 11 } },
                R.passContext ? "传递上一步结果作为上下文" : "独立执行"
              )
            )
          )
        )
      )
    ) : null,
    s.createElement(D, { style: { margin: "12px 0" } }),
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
        `${B.length > 0 ? "4" : "3"}. 任务模板`
      ),
      s.createElement(u.TextArea, {
        placeholder: `输入任务模板，可用 {参数名} 作为占位符...

例如：
请对区块 {区块名} 的井 {井号} 进行储层评价`,
        value: p,
        onChange: (R) => E(R.target.value),
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
function Cn({
  team: e,
  agents: t,
  onLaunch: l,
  onEdit: a,
  onDelete: n
}) {
  var y;
  const s = z().React, { useState: r } = s, { Card: o, Tag: d, Typography: c, Button: u, Tooltip: b } = z().antd, {
    TeamOutlined: _,
    RocketOutlined: S,
    UserOutlined: h,
    EditOutlined: f,
    DeleteOutlined: I,
    DownOutlined: A,
    UpOutlined: D
  } = z().antdIcons || {}, { Text: M, Paragraph: ne } = c, [F, G] = r(!1), w = {
    coordinator: { label: "协调者模式", color: "blue" },
    pipeline: { label: "流水线模式", color: "cyan" },
    roundtable: { label: "圆桌讨论", color: "purple" }
  }, x = w[e.mode] || w.coordinator, k = e.members.map((g) => {
    const P = vt(t, g.name);
    return { ...g, found: !!P, agentId: P };
  }), K = k.filter((g) => g.found).length, N = e.coordinatorName || ((y = e.members[0]) == null ? void 0 : y.name), $ = N ? vt(t, N) : null;
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
      s.createElement(Jt, {
        members: e.members.map((g) => g.name),
        size: 36
      }),
      s.createElement(
        "div",
        { style: { flex: 1 } },
        s.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 6 } },
          s.createElement(
            M,
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
            { color: "green", style: { fontSize: 10 } },
            `${e.members.length} 位专家`
          ),
          K < e.members.length ? s.createElement(
            b,
            {
              title: `OMP 架构下，未创建的专家将通过 spawn_subagent 自动派发，
控制器会根据角色 prompt 创建子 agent 执行任务。`
            },
            s.createElement(
              d,
              { color: "blue", style: { fontSize: 10 } },
              "OMP 自动派发"
            )
          ) : s.createElement(
            d,
            { color: "green", style: { fontSize: 10 } },
            "全部就绪"
          )
        )
      ),
      // Edit/delete for custom teams
      e.custom ? s.createElement(
        "div",
        { style: { display: "flex", gap: 2 } },
        a ? s.createElement(
          b,
          { title: "编辑" },
          s.createElement(u, {
            type: "text",
            size: "small",
            icon: f ? s.createElement(f) : void 0,
            onClick: (g) => {
              g.stopPropagation(), a(e);
            }
          })
        ) : null,
        n ? s.createElement(
          b,
          { title: "删除" },
          s.createElement(u, {
            type: "text",
            size: "small",
            danger: !0,
            icon: I ? s.createElement(I) : void 0,
            onClick: (g) => {
              g.stopPropagation(), n(e);
            }
          })
        ) : null
      ) : null
    ),
    // Description
    s.createElement(
      ne,
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
        (g) => s.createElement(
          b,
          {
            key: g.name,
            title: `${g.name}（${g.role}）${g.found ? "" : " - 未创建"}`
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
                background: g.found ? "#f0f5ff" : "#f0f0ff",
                border: `1px solid ${g.found ? "#d6e4ff" : "#d3adf7"}`,
                fontSize: 11
              }
            },
            s.createElement(Re, { name: g.name, size: 18 }),
            s.createElement(
              M,
              {
                style: { fontSize: 11, color: g.found ? "#1f4e8c" : "#531dab" }
              },
              g.name
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
        onClick: (g) => {
          g.stopPropagation(), G(!F);
        },
        icon: F ? D ? s.createElement(D) : "▲" : A ? s.createElement(A) : "▼"
      },
      F ? "收起流程" : "查看执行流程"
    ),
    F ? s.createElement(nl, { team: e }) : null,
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
        M,
        { type: "secondary", style: { fontSize: 11 } },
        N ? `协调者: ${N}` : ""
      ),
      s.createElement(
        u,
        {
          type: "primary",
          size: "small",
          icon: S ? s.createElement(S) : void 0,
          disabled: !$,
          onClick: () => l(e),
          style: Oe
        },
        "发起团队任务"
      )
    )
  );
}
function ll({
  agents: e,
  onLaunch: t
}) {
  const l = z().React, { useMemo: a, useState: n, useCallback: s, useEffect: r } = l, {
    Row: o,
    Col: d,
    Input: c,
    Empty: u,
    Typography: b,
    Tag: _,
    Button: S,
    Divider: h,
    Tabs: f,
    message: I,
    Popconfirm: A
  } = z().antd, { SearchOutlined: D, TeamOutlined: M, PlusOutlined: ne, RocketOutlined: F } = z().antdIcons || {}, { Text: G } = b, [w, x] = n(""), [k, K] = n([]), [N, $] = n(!1), [y, g] = n(null);
  r(() => {
    K(Et());
  }, []);
  const P = s(() => {
    K(Et());
  }, []), J = s(
    (ae) => {
      const Y = Et().filter((ie) => ie.id !== ae.id);
      Un(Y), K(Y), I.success(`团队「${ae.name}」已删除`);
    },
    [I]
  ), q = s((ae) => {
    g(ae), $(!0);
  }, []), Z = s(() => {
    g(null), $(!0);
  }, []), C = a(() => [...k, ...el], [k]), p = a(() => {
    if (!w.trim()) return C;
    const ae = w.toLowerCase();
    return C.filter(
      (B) => B.name.toLowerCase().includes(ae) || B.description.toLowerCase().includes(ae) || B.category.toLowerCase().includes(ae)
    );
  }, [C, w]), E = p.filter((ae) => ae.custom), j = p.filter((ae) => !ae.custom);
  return l.createElement(
    "div",
    null,
    // Workflow status card (OMP-backed)
    l.createElement($a),
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
        G,
        { style: { fontSize: 13, color: "#389e0d" } },
        "OMP 驱动的专家团工作流 — 5 阶段状态机（规划→分派→验证→综合→完成），支持结构化交接、角色工具隔离、fork 并行执行和自动重试。"
      ),
      l.createElement(
        S,
        {
          type: "primary",
          size: "small",
          icon: ne ? l.createElement(ne) : void 0,
          onClick: Z,
          style: Oe
        },
        "创建专家团"
      )
    ),
    // Search
    l.createElement(c, {
      placeholder: "搜索团队名称、描述或类别...",
      prefix: D ? l.createElement(D) : void 0,
      value: w,
      onChange: (ae) => x(ae.target.value),
      allowClear: !0,
      style: { marginBottom: 16, maxWidth: 400 }
    }),
    // Tabs: preset teams vs custom teams
    l.createElement(
      f,
      {
        defaultActiveKey: "preset",
        items: [
          {
            key: "preset",
            label: `预设团队${j.length ? ` (${j.length})` : ""}`,
            children: l.createElement(
              "div",
              null,
              j.length > 0 ? l.createElement(
                o,
                { gutter: [12, 12] },
                ...j.map(
                  (ae) => l.createElement(
                    d,
                    { key: ae.id, xs: 24, sm: 12, md: 8 },
                    l.createElement(Cn, {
                      team: ae,
                      agents: e,
                      onLaunch: t
                    })
                  )
                )
              ) : l.createElement(u, {
                description: "未找到匹配的预设团队",
                image: u.PRESENTED_IMAGE_SIMPLE
              })
            )
          },
          {
            key: "custom",
            label: `自定义团队${E.length ? ` (${E.length})` : ""}`,
            children: l.createElement(
              "div",
              null,
              E.length > 0 ? l.createElement(
                o,
                { gutter: [12, 12] },
                ...E.map(
                  (ae) => l.createElement(
                    d,
                    { key: ae.id, xs: 24, sm: 12, md: 8 },
                    l.createElement(Cn, {
                      team: ae,
                      agents: e,
                      onLaunch: t,
                      onEdit: q,
                      onDelete: J
                    })
                  )
                )
              ) : l.createElement(u, {
                description: "暂无自定义团队，点击「创建专家团」自定义",
                image: u.PRESENTED_IMAGE_SIMPLE
              })
            )
          }
        ]
      }
    ),
    // Team Builder Modal
    l.createElement(al, {
      open: N,
      onClose: () => {
        $(!1), g(null);
      },
      agents: e,
      editingTeam: y,
      onSaved: P
    })
  );
}
function Nn(e) {
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
async function sl(e) {
  return await re("/workspace/files", {
    headers: { "X-Agent-Id": e }
  }) || [];
}
async function bt(e, t, l) {
  await re(`/workspace/files/${encodeURIComponent(t)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify({ content: l })
  });
}
async function xn(e, t) {
  const l = await Ut(e);
  l.system_prompt_files = t, await re(`/agents/${encodeURIComponent(e)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(l)
  });
}
async function Ft(e, t) {
  await re("/skills/pool/download", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      skill_name: t,
      targets: [{ workspace_id: e }],
      overwrite: !1
    })
  });
}
async function Dn(e, t) {
  await re(`/skills/${encodeURIComponent(t)}/enable`, {
    method: "POST",
    headers: { "X-Agent-Id": e }
  });
}
async function Gt(e, t) {
  await re(`/skills/${encodeURIComponent(t)}`, {
    method: "DELETE",
    headers: { "X-Agent-Id": e }
  });
}
async function ol(e, t) {
  return re("/skills/batch-enable", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify(t)
  });
}
async function rl(e, t) {
  return re("/skills/batch-disable", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify(t)
  });
}
async function il(e, t) {
  return re("/skills/batch-delete", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify(t)
  });
}
async function Ht(e) {
  return await re("/mcp", {
    headers: { "X-Agent-Id": e }
  }) || [];
}
async function Fn(e, t) {
  await re(`/mcp/${encodeURIComponent(t)}`, {
    method: "DELETE",
    headers: { "X-Agent-Id": e }
  });
}
async function Gn(e, t) {
  return re("/mcp", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify(t)
  });
}
async function cl(e, t) {
  return re(
    `/mcp/toggle/${encodeURIComponent(t)}`,
    {
      method: "PATCH",
      headers: { "X-Agent-Id": e }
    }
  );
}
async function Hn(e, t) {
  await re(`/skills/${encodeURIComponent(t)}/disable`, {
    method: "POST",
    headers: { "X-Agent-Id": e }
  });
}
async function ml(e) {
  await re(`/skills/pool/${encodeURIComponent(e)}`, {
    method: "DELETE"
  });
}
function dl(e) {
  const t = (e || "").trim();
  if (!t) return { number: 6, unit: "h" };
  const l = t.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/i);
  if (!l) return { number: 6, unit: "h" };
  const a = parseInt(l[1] || "0", 10), n = parseInt(l[2] || "0", 10), s = parseInt(l[3] || "0", 10), r = a * 60 + n + Math.round(s / 60);
  return r <= 0 ? { number: 6, unit: "h" } : r >= 60 && r % 60 === 0 ? { number: r / 60, unit: "h" } : { number: r, unit: "m" };
}
function ul(e) {
  return e.unit === "h" ? `${e.number}h` : `${e.number}m`;
}
async function pl(e) {
  return re("/config/heartbeat", {
    headers: { "X-Agent-Id": e }
  });
}
async function gl(e, t) {
  return re("/config/heartbeat", {
    method: "PUT",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify(t)
  });
}
async function fl(e) {
  await re("/config/heartbeat/run", {
    method: "POST",
    headers: { "X-Agent-Id": e }
  });
}
async function yl(e) {
  return re("/workspace/running-config", {
    headers: { "X-Agent-Id": e }
  });
}
async function El(e, t) {
  return re("/workspace/running-config", {
    method: "PUT",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify(t)
  });
}
async function hl(e) {
  return (await re("/workspace/language", {
    headers: { "X-Agent-Id": e }
  })).language || "zh";
}
async function vl(e, t) {
  await re("/workspace/language", {
    method: "PUT",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify({ language: t })
  });
}
async function bl() {
  return (await re("/config/user-timezone")).timezone || "UTC";
}
async function Sl(e) {
  await re("/config/user-timezone", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ timezone: e })
  });
}
async function wl(e) {
  return await re("/workspace/system-prompt-files", {
    headers: { "X-Agent-Id": e }
  }) || [];
}
const kn = ["AGENTS.md", "SOUL.md", "PROFILE.md"];
function Ct({
  title: e,
  subtitle: t,
  extra: l
}) {
  const a = z().React, { Space: n } = z().antd;
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
  const n = z().React, { Tag: s } = z().antd;
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
function Wn({
  open: e,
  onClose: t,
  poolSkills: l,
  installedSkillNames: a,
  loading: n,
  onInstall: s
}) {
  const r = z().React, { useState: o, useEffect: d, useMemo: c } = r, { Modal: u, Button: b, Empty: _, Spin: S, Input: h, Tag: f, Tooltip: I, Typography: A } = z().antd, { CheckOutlined: D, SearchOutlined: M } = z().antdIcons || {}, { Text: ne } = A, [F, G] = o([]), [w, x] = o("");
  d(() => {
    e && (G([]), x(""));
  }, [e]);
  const k = c(() => {
    if (!w.trim()) return l;
    const y = w.toLowerCase();
    return l.filter(
      (g) => {
        var P, J;
        return g.name.toLowerCase().includes(y) || ((P = g.description) == null ? void 0 : P.toLowerCase().includes(y)) || ((J = g.tags) == null ? void 0 : J.some((q) => q.toLowerCase().includes(y)));
      }
    );
  }, [l, w]), K = k.filter(
    (y) => !a.includes(y.name)
  ), N = (y) => {
    G(
      (g) => g.includes(y) ? g.filter((P) => P !== y) : [...g, y]
    );
  }, $ = async () => {
    F.length !== 0 && (await s(F), G([]));
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
          ne,
          { type: "secondary", style: { fontSize: 13 } },
          `已选择 ${F.length} 个技能`
        ),
        r.createElement(
          "div",
          { style: { display: "flex", gap: 8 } },
          r.createElement(b, { onClick: t }, "取消"),
          r.createElement(
            b,
            {
              type: "primary",
              onClick: $,
              disabled: F.length === 0
            },
            F.length > 0 ? `添加 (${F.length})` : "添加"
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
      r.createElement(h, {
        placeholder: "搜索技能名称、描述或标签...",
        prefix: M ? r.createElement(M) : void 0,
        value: w,
        onChange: (y) => x(y.target.value),
        allowClear: !0,
        style: { flex: 1 }
      }),
      r.createElement(
        b,
        {
          size: "small",
          type: "primary",
          onClick: () => G(K.map((y) => y.name))
        },
        "全选"
      ),
      r.createElement(
        b,
        {
          size: "small",
          onClick: () => G([])
        },
        "清空"
      )
    ),
    // Skill grid (card style matching Skill Center)
    n ? r.createElement(
      "div",
      { style: { textAlign: "center", padding: 40 } },
      r.createElement(S, { size: "large" })
    ) : k.length === 0 ? r.createElement(_, {
      description: w ? "未找到匹配的技能" : "技能池暂无可用技能",
      image: _.PRESENTED_IMAGE_SIMPLE
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
      ...k.map((y) => {
        const g = F.includes(y.name), P = a.includes(y.name);
        return r.createElement(
          "div",
          {
            key: y.name,
            onClick: () => !P && N(y.name),
            style: {
              position: "relative",
              padding: "10px 12px",
              border: `1px solid ${g ? "#0072f5" : "#e8e8e8"}`,
              borderRadius: 6,
              cursor: P ? "not-allowed" : "pointer",
              transition: "all 0.15s ease",
              background: g ? "rgba(0, 114, 245, 0.06)" : P ? "#fafafa" : "#fff",
              opacity: P ? 0.5 : 1,
              minHeight: 64
            }
          },
          g ? r.createElement(
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
            D ? r.createElement(D) : "✓"
          ) : null,
          P ? r.createElement(
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
                paddingRight: P || g ? 24 : 0
              }
            },
            r.createElement(
              "span",
              { style: { fontSize: 16 } },
              y.emoji || "⚡"
            ),
            r.createElement(
              I,
              { title: y.name },
              r.createElement(
                ne,
                {
                  strong: !0,
                  style: {
                    fontSize: 13,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap"
                  }
                },
                y.name
              )
            )
          ),
          y.description ? r.createElement(
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
            y.description
          ) : null,
          y.tags && y.tags.length > 0 ? r.createElement(
            "div",
            {
              style: {
                marginTop: 4,
                display: "flex",
                gap: 2,
                flexWrap: "wrap"
              }
            },
            ...y.tags.slice(0, 2).map(
              (J, q) => r.createElement(
                f,
                {
                  key: q,
                  color: "cyan",
                  style: { fontSize: 10, marginRight: 0 }
                },
                J
              )
            )
          ) : null
        );
      })
    )
  );
}
const Ve = {
  marginBottom: 4,
  fontSize: 13,
  fontWeight: 500,
  color: "rgba(0,0,0,0.85)",
  display: "flex",
  alignItems: "center",
  gap: 4
}, Jn = { marginBottom: 16 }, Xn = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "0 16px",
  marginBottom: 16
}, Be = {
  fontSize: 13,
  fontWeight: 600,
  color: "rgba(0,0,0,0.85)",
  marginBottom: 12,
  paddingBottom: 8,
  borderBottom: "1px solid #f0f0f0"
}, Kn = {
  fontSize: 12,
  color: "rgba(0,0,0,0.45)",
  marginLeft: 8
};
function Cl({ agentId: e }) {
  const t = z().React, { useState: l, useEffect: a, useCallback: n } = t, {
    Switch: s,
    InputNumber: r,
    Select: o,
    Button: d,
    Spin: c,
    Space: u,
    Typography: b,
    message: _
  } = z().antd, { PlayCircleOutlined: S, SaveOutlined: h } = z().antdIcons || {}, { Text: f } = b, [I, A] = l(!0), [D, M] = l(!1), [ne, F] = l(!1), [G, w] = l(!1), [x, k] = l(6), [K, N] = l("h"), [$, y] = l("main"), [g, P] = l(300), [J, q] = l(!1), [Z, C] = l("08:00"), [p, E] = l("22:00"), j = n(async () => {
    var Q, ce;
    A(!0);
    try {
      const v = await pl(e), ee = dl(v.every ?? "6h");
      w(v.enabled ?? !1), k(ee.number), N(ee.unit), y(v.target ?? "main"), P(v.timeoutSeconds ?? 300), q(!!v.activeHours), C(((Q = v.activeHours) == null ? void 0 : Q.start) ?? "08:00"), E(((ce = v.activeHours) == null ? void 0 : ce.end) ?? "22:00");
    } catch (v) {
      _.error(v.message || "加载心跳配置失败");
    } finally {
      A(!1);
    }
  }, [e]);
  a(() => {
    j();
  }, [j]);
  const ae = async () => {
    M(!0);
    try {
      await gl(e, {
        enabled: G,
        every: ul({ number: x, unit: K }),
        target: $,
        timeoutSeconds: g,
        activeHours: J && Z && p ? { start: Z, end: p } : void 0
      }), _.success("心跳配置已保存");
    } catch (Q) {
      _.error(Q.message || "保存心跳配置失败");
    } finally {
      M(!1);
    }
  }, B = async () => {
    F(!0);
    try {
      await fl(e), _.success("已触发心跳检查");
    } catch (Q) {
      _.error(Q.message || "触发心跳失败");
    } finally {
      F(!1);
    }
  };
  if (I)
    return t.createElement(
      "div",
      { style: { textAlign: "center", padding: 40 } },
      t.createElement(c, { size: "large" })
    );
  const Y = (Q, ce, v) => t.createElement(
    "div",
    { style: Jn },
    t.createElement("div", { style: Ve }, Q),
    ce,
    v ? t.createElement(
      f,
      { type: "secondary", style: Kn },
      v
    ) : null
  ), ie = (Q, ce, v, ee) => t.createElement(
    "div",
    { style: Xn },
    t.createElement(
      "div",
      null,
      t.createElement("div", { style: Ve }, Q),
      ce
    ),
    t.createElement(
      "div",
      null,
      t.createElement("div", { style: Ve }, v),
      ee
    )
  ), { Divider: H } = z().antd;
  return t.createElement(
    "div",
    { style: { paddingBottom: 8 } },
    // ── Section: 基本设置 ──
    t.createElement("div", { style: Be }, "基本设置"),
    Y(
      "启用心跳",
      t.createElement(s, {
        checked: G,
        onChange: (Q) => w(Q)
      }),
      G ? "已启用，专家将定期自检" : "已停用"
    ),
    ie(
      "检查频率",
      t.createElement(
        u,
        null,
        t.createElement(r, {
          min: 1,
          value: x,
          onChange: (Q) => k(Q ?? 1),
          style: { width: "100%" }
        }),
        t.createElement(o, {
          value: K,
          onChange: (Q) => N(Q),
          style: { width: 90 },
          options: [
            { value: "m", label: "分钟" },
            { value: "h", label: "小时" }
          ]
        })
      ),
      "心跳目标",
      t.createElement(o, {
        value: $,
        onChange: (Q) => y(Q),
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
        value: g,
        onChange: (Q) => P(Q ?? 300),
        style: { width: 200 }
      })
    ),
    // ── Section: 活跃时段 ──
    t.createElement(H, { style: { margin: "8px 0 16px" } }),
    t.createElement("div", { style: Be }, "活跃时段"),
    Y(
      "启用活跃时段限制",
      t.createElement(s, {
        checked: J,
        onChange: (Q) => q(Q)
      }),
      "仅在指定时段内触发心跳"
    ),
    J ? ie(
      "开始时间",
      t.createElement("input", {
        type: "time",
        value: Z,
        onChange: (Q) => C(Q.target.value),
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
        onChange: (Q) => E(Q.target.value),
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
          icon: h ? t.createElement(h) : void 0,
          loading: D,
          onClick: ae,
          style: Oe
        },
        "保存配置"
      ),
      t.createElement(
        d,
        {
          icon: S ? t.createElement(S) : void 0,
          loading: ne,
          onClick: B
        },
        "立即执行"
      )
    )
  );
}
function xl({
  agentId: e,
  onRefresh: t
}) {
  const l = z().React, { useState: a, useEffect: n, useCallback: s } = l, {
    List: r,
    Tag: o,
    Switch: d,
    Button: c,
    Empty: u,
    Spin: b,
    Typography: _,
    message: S
  } = z().antd, { PlusOutlined: h, ReloadOutlined: f, DeleteOutlined: I } = z().antdIcons || {}, { Text: A, Paragraph: D } = _, [M, ne] = a([]), [F, G] = a(!0), [w, x] = a(!1), [k, K] = a([]), [N, $] = a(!1), y = s(async () => {
    G(!0);
    try {
      const C = await wt(e);
      ne(C);
    } catch (C) {
      S.error(C.message || "加载技能失败"), ne([]);
    } finally {
      G(!1);
    }
  }, [e]);
  n(() => {
    y();
  }, [y]);
  const g = async () => {
    x(!0), $(!0);
    try {
      const C = await Nt(!0);
      K(C);
    } catch (C) {
      S.error(C.message || "加载技能池失败");
    } finally {
      $(!1);
    }
  }, P = async (C) => {
    let p = 0, E = 0;
    for (const j of C)
      try {
        await Ft(e, j), p++;
      } catch {
        E++;
      }
    p > 0 ? (S.success(
      `成功添加 ${p} 个技能${E > 0 ? `，${E} 个失败` : ""}`
    ), y(), t()) : E > 0 && S.error("添加技能失败"), x(!1);
  }, J = async (C, p) => {
    try {
      p ? await Dn(e, C.name) : await Hn(e, C.name), S.success(p ? "已启用" : "已停用"), y(), t();
    } catch (E) {
      S.error(E.message || "操作失败");
    }
  }, q = async (C) => {
    try {
      await Gt(e, C), S.success(`技能「${C}」已移除`), y(), t();
    } catch (p) {
      S.error(p.message || "移除技能失败");
    }
  };
  if (F)
    return l.createElement(
      "div",
      { style: { textAlign: "center", padding: 40 } },
      l.createElement(b, { size: "large" })
    );
  const Z = M.filter((C) => C.enabled !== !1);
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
        A,
        { strong: !0 },
        `技能列表 (${M.length}，已启用 ${Z.length})`
      ),
      l.createElement(
        "div",
        { style: { display: "flex", gap: 8 } },
        l.createElement(
          c,
          {
            size: "small",
            icon: f ? l.createElement(f) : void 0,
            onClick: () => {
              Ze(), y();
            }
          },
          "刷新"
        ),
        l.createElement(
          c,
          {
            type: "primary",
            size: "small",
            icon: h ? l.createElement(h) : void 0,
            onClick: g,
            style: Oe
          },
          "从技能池添加"
        )
      )
    ),
    M.length === 0 ? l.createElement(u, {
      description: "该专家暂无技能",
      image: u.PRESENTED_IMAGE_SIMPLE
    }) : l.createElement(r, {
      dataSource: M,
      renderItem: (C) => l.createElement(
        r.Item,
        {
          actions: [
            l.createElement(d, {
              key: "toggle",
              size: "small",
              checked: C.enabled !== !1,
              onChange: (p) => J(C, p)
            }),
            l.createElement(
              c,
              {
                key: "del",
                type: "link",
                size: "small",
                danger: !0,
                icon: I ? l.createElement(I) : void 0,
                onClick: () => q(C.name)
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
            C.emoji ? l.createElement(
              "span",
              { style: { fontSize: 16 } },
              C.emoji
            ) : null,
            l.createElement(A, { strong: !0 }, C.name),
            C.version_text ? l.createElement(
              o,
              { style: { fontSize: 10 } },
              `v${C.version_text}`
            ) : null
          ),
          C.description ? l.createElement(
            D,
            {
              type: "secondary",
              style: { fontSize: 12, margin: 0 },
              ellipsis: { rows: 2 }
            },
            C.description
          ) : null
        )
      )
    }),
    l.createElement(Wn, {
      open: w,
      onClose: () => x(!1),
      poolSkills: k,
      installedSkillNames: M.map((C) => C.name),
      loading: N,
      onInstall: P
    })
  );
}
function kl({
  agentId: e,
  onRefresh: t,
  isActive: l
}) {
  const a = z().React, { useState: n, useEffect: s, useCallback: r } = a, {
    List: o,
    Tag: d,
    Button: c,
    Empty: u,
    Spin: b,
    Modal: _,
    Input: S,
    Typography: h,
    message: f
  } = z().antd, { PlusOutlined: I, ReloadOutlined: A, DeleteOutlined: D } = z().antdIcons || {}, { Text: M, Paragraph: ne } = h, { TextArea: F } = S, [G, w] = n([]), [x, k] = n(!0), [K, N] = n(!1), [$, y] = n(`{
  "mcpServers": {
    "example-client": {
      "command": "npx",
      "args": ["-y", "@example/mcp-server"],
      "env": {}
    }
  }
}`), [g, P] = n(!1), J = r(async () => {
    k(!0);
    try {
      const p = await Ht(e);
      w(p);
    } catch (p) {
      f.error(p.message || "加载 MCP 失败"), w([]);
    } finally {
      k(!1);
    }
  }, [e]);
  s(() => {
    J();
  }, [J]), s(() => {
    l && J();
  }, [l, J]);
  const q = async (p) => {
    try {
      await cl(e, p), f.success("已切换 MCP 状态"), J(), t();
    } catch (E) {
      f.error(E.message || "切换失败");
    }
  }, Z = async (p) => {
    try {
      await Fn(e, p), f.success(`MCP「${p}」已移除`), J(), t();
    } catch (E) {
      f.error(E.message || "移除 MCP 失败");
    }
  }, C = async () => {
    P(!0);
    try {
      const p = JSON.parse($), E = p.mcpServers || p, j = Object.entries(E);
      if (j.length === 0) {
        f.warning("未找到 MCP 客户端配置");
        return;
      }
      for (const [ae, B] of j) {
        const Y = B, ie = Y.url ? "streamable_http" : "stdio";
        await Gn(e, {
          client_key: ae,
          client: {
            name: Y.name || ae,
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
      f.success("MCP 客户端已创建"), N(!1), J(), t();
    } catch (p) {
      p instanceof SyntaxError ? f.error("JSON 格式错误：" + p.message) : f.error(p.message || "创建 MCP 失败");
    } finally {
      P(!1);
    }
  };
  return x ? a.createElement(
    "div",
    { style: { textAlign: "center", padding: 40 } },
    a.createElement(b, { size: "large" })
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
      a.createElement(M, { strong: !0 }, `MCP 客户端 (${G.length})`),
      a.createElement(
        "div",
        { style: { display: "flex", gap: 8 } },
        a.createElement(
          c,
          {
            size: "small",
            icon: A ? a.createElement(A) : void 0,
            onClick: () => {
              Ze(), J();
            }
          },
          "刷新"
        ),
        a.createElement(
          c,
          {
            type: "primary",
            size: "small",
            icon: I ? a.createElement(I) : void 0,
            onClick: () => N(!0),
            style: Oe
          },
          "添加 MCP"
        )
      )
    ),
    G.length === 0 ? a.createElement(u, {
      description: "该专家暂无 MCP 客户端",
      image: u.PRESENTED_IMAGE_SIMPLE
    }) : a.createElement(o, {
      dataSource: G,
      renderItem: (p) => a.createElement(
        o.Item,
        {
          actions: [
            a.createElement(
              c,
              {
                key: "toggle",
                size: "small",
                onClick: () => q(p.key)
              },
              p.enabled ? "停用" : "启用"
            ),
            a.createElement(
              c,
              {
                key: "del",
                type: "link",
                size: "small",
                danger: !0,
                icon: D ? a.createElement(D) : void 0,
                onClick: () => Z(p.key)
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
            a.createElement(M, { strong: !0 }, p.name || p.key),
            a.createElement(
              d,
              {
                color: p.enabled ? "green" : "default",
                style: { fontSize: 10 }
              },
              p.enabled ? "启用" : "停用"
            ),
            a.createElement(
              d,
              { color: "purple", style: { fontSize: 10 } },
              p.transport
            )
          ),
          p.description ? a.createElement(
            ne,
            {
              type: "secondary",
              style: { fontSize: 12, margin: 0 },
              ellipsis: { rows: 2 }
            },
            p.description
          ) : null,
          p.tools && p.tools.length > 0 ? a.createElement(
            "div",
            { style: { marginTop: 4, fontSize: 11, color: "#8c8c8c" } },
            `提供 ${p.tools.length} 个工具`
          ) : null
        )
      )
    }),
    // Create MCP modal
    a.createElement(
      _,
      {
        open: K,
        title: "添加 MCP 客户端 (JSON)",
        onCancel: () => N(!1),
        onOk: C,
        confirmLoading: g,
        okText: "创建",
        width: 560
      },
      a.createElement(
        "div",
        { style: { marginBottom: 8, fontSize: 12, color: "#8c8c8c" } },
        "粘贴 MCP 配置 JSON（支持 mcpServers 格式），将创建到当前专家工作区："
      ),
      a.createElement(F, {
        value: $,
        onChange: (p) => y(p.target.value),
        rows: 12,
        style: { fontFamily: "monospace", fontSize: 12 }
      })
    )
  );
}
function _l({ agentId: e }) {
  const t = z().React, { useState: l, useEffect: a, useCallback: n, useRef: s } = t, {
    Card: r,
    InputNumber: o,
    Input: d,
    Select: c,
    Switch: u,
    Button: b,
    Spin: _,
    Space: S,
    Typography: h,
    Divider: f,
    message: I
  } = z().antd, { SaveOutlined: A } = z().antdIcons || {}, { Text: D } = h, [M, ne] = l(!0), [F, G] = l(!1), w = s(null), [x, k] = l(60), [K, N] = l(""), [$, y] = l(!0), [g, P] = l(30), [J, q] = l("zh"), [Z, C] = l("UTC"), [p, E] = l(!0), [j, ae] = l(100), [B, Y] = l(!0), [ie, H] = l(3), [Q, ce] = l(1), [v, ee] = l(!0), [m, X] = l(3), [R, se] = l(2), [de, Ee] = l(60), [ye, pe] = l(1), [le, U] = l(0), [T, V] = l(1), [oe, W] = l(0), [ue, ve] = l(30), [we, xe] = l(50), [_e, Ne] = l("light"), [it, ct] = l("scroll"), [et, Ae] = l("remelight"), [tt, mt] = l("AUTO"), Ge = n(async () => {
    var te, Ce, Se, ze, He, nt;
    ne(!0);
    try {
      const [he, kt, dt] = await Promise.all([
        yl(e),
        hl(e).catch(() => "zh"),
        bl().catch(() => "UTC")
      ]);
      w.current = he, k(he.shell_command_timeout ?? 60), N(he.shell_command_executable ?? "");
      const at = he.auto_title_config ?? { enabled: !0, timeout_seconds: 30 };
      y(at.enabled ?? !0), P(at.timeout_seconds ?? 30), q(kt), C(dt);
      const Pe = he.loop ?? {};
      E(((te = Pe.iteration) == null ? void 0 : te.enabled) ?? !0), ae(((Ce = Pe.iteration) == null ? void 0 : Ce.max_iterations) ?? he.max_iters ?? 100), Y(((Se = Pe.doom_loop) == null ? void 0 : Se.enabled) ?? !0), H(((ze = Pe.doom_loop) == null ? void 0 : ze.window_size) ?? 3), ce(((He = Pe.doom_loop) == null ? void 0 : He.similarity_threshold) ?? 1), ee(he.llm_retry_enabled ?? !0), X(he.llm_max_retries ?? 3), se(he.llm_backoff_base ?? 2), Ee(he.llm_backoff_cap ?? 60), pe(he.llm_max_concurrent ?? 1), U(he.llm_max_qpm ?? 0), V(he.llm_rate_limit_pause ?? 1), W(he.llm_rate_limit_jitter ?? 0), ve(he.llm_acquire_timeout ?? 30), xe(he.history_max_length ?? 50), Ne(he.context_manager_backend ?? "light"), ct(((nt = he.light_context_config) == null ? void 0 : nt.strategy) ?? "scroll"), Ae(he.memory_manager_backend ?? "remelight"), mt(he.approval_level ?? "AUTO");
    } catch (he) {
      I.error(he.message || "加载运行配置失败");
    } finally {
      ne(!1);
    }
  }, [e]);
  a(() => {
    Ge();
  }, [Ge]);
  const Te = async () => {
    var Ce, Se;
    const te = w.current;
    if (te) {
      G(!0);
      try {
        const ze = {
          ...te,
          max_iters: j,
          loop: {
            ...te.loop ?? {},
            iteration: { enabled: p, max_iterations: j },
            doom_loop: {
              enabled: B,
              window_size: ie,
              similarity_threshold: Q,
              stages: ((Se = (Ce = te.loop) == null ? void 0 : Ce.doom_loop) == null ? void 0 : Se.stages) ?? []
            }
          },
          shell_command_timeout: x,
          shell_command_executable: K,
          auto_title_config: {
            enabled: $,
            timeout_seconds: g
          },
          llm_retry_enabled: v,
          llm_max_retries: m,
          llm_backoff_base: R,
          llm_backoff_cap: de,
          llm_max_concurrent: ye,
          llm_max_qpm: le,
          llm_rate_limit_pause: T,
          llm_rate_limit_jitter: oe,
          llm_acquire_timeout: ue,
          history_max_length: we,
          context_manager_backend: _e,
          light_context_config: {
            ...te.light_context_config ?? {},
            strategy: it
          },
          memory_manager_backend: et,
          approval_level: tt
        };
        await El(e, ze), w.current = ze, J && await vl(e, J).catch(() => {
        }), Z && await Sl(Z).catch(() => {
        }), I.success("运行配置已保存");
      } catch (ze) {
        I.error(ze.message || "保存运行配置失败");
      } finally {
        G(!1);
      }
    }
  };
  if (M)
    return t.createElement(
      "div",
      { style: { textAlign: "center", padding: 40 } },
      t.createElement(_, { size: "large" })
    );
  const Ie = (te, Ce, Se) => t.createElement(
    "div",
    { style: Jn },
    t.createElement("div", { style: Ve }, te),
    Ce,
    Se ? t.createElement(
      D,
      { type: "secondary", style: Kn },
      Se
    ) : null
  ), ke = (te, Ce, Se, ze) => t.createElement(
    "div",
    { style: Xn },
    t.createElement(
      "div",
      null,
      t.createElement("div", { style: Ve }, te),
      Ce
    ),
    t.createElement(
      "div",
      null,
      t.createElement("div", { style: Ve }, Se),
      ze
    )
  );
  return t.createElement(
    "div",
    { style: { paddingBottom: 8 } },
    // ── Section: 基础设置 ──
    t.createElement(
      "div",
      { style: Be },
      "基础设置"
    ),
    ke(
      "Shell 命令超时 (秒)",
      t.createElement(o, {
        min: 1,
        value: x,
        onChange: (te) => k(te ?? 60),
        style: { width: "100%" }
      }),
      "Shell 可执行文件",
      t.createElement(d, {
        value: K,
        onChange: (te) => N(te.target.value),
        placeholder: "留空使用系统默认",
        style: { width: "100%" }
      })
    ),
    ke(
      "语言",
      t.createElement(c, {
        value: J,
        onChange: (te) => q(te),
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
        value: Z,
        onChange: (te) => C(te),
        style: { width: "100%" },
        showSearch: !0,
        filterOption: (te, Ce) => {
          var Se;
          return (((Se = Ce == null ? void 0 : Ce.label) == null ? void 0 : Se.toString()) || "").toLowerCase().includes(te.toLowerCase());
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
        ].map((te) => ({ value: te, label: te }))
      })
    ),
    ke(
      "自动生成会话标题",
      t.createElement(S, null, t.createElement(u, {
        checked: $,
        onChange: (te) => y(te)
      })),
      "标题生成超时 (秒)",
      t.createElement(o, {
        min: 5,
        value: g,
        onChange: (te) => P(te ?? 30),
        style: { width: "100%" },
        disabled: !$
      })
    ),
    // ── Section: 审批级别 ──
    t.createElement(f, { style: { margin: "8px 0 16px" } }),
    t.createElement("div", { style: Be }, "审批级别"),
    Ie(
      "工具执行审批",
      t.createElement(c, {
        value: tt,
        onChange: (te) => mt(te),
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
    t.createElement(f, { style: { margin: "8px 0 16px" } }),
    t.createElement("div", { style: Be }, "迭代与循环"),
    Ie(
      "启用迭代限制",
      t.createElement(u, {
        checked: p,
        onChange: (te) => E(te)
      }),
      "停止 Agent 前的最大循环轮次"
    ),
    p ? Ie(
      "最大迭代次数",
      t.createElement(o, {
        min: 1,
        max: 500,
        value: j,
        onChange: (te) => ae(te ?? 100),
        style: { width: "100%" }
      })
    ) : null,
    Ie(
      "启用重复循环保护",
      t.createElement(u, {
        checked: B,
        onChange: (te) => Y(te)
      }),
      "检测并阻止重复操作循环"
    ),
    B ? ke(
      "检测窗口大小",
      t.createElement(o, {
        min: 2,
        max: 20,
        value: ie,
        onChange: (te) => H(te ?? 3),
        style: { width: "100%" }
      }),
      "相似度阈值",
      t.createElement(o, {
        min: 0,
        max: 1,
        step: 0.05,
        value: Q,
        onChange: (te) => ce(te ?? 1),
        style: { width: "100%" }
      })
    ) : null,
    // ── Section: LLM 重试 ──
    t.createElement(f, { style: { margin: "8px 0 16px" } }),
    t.createElement("div", { style: Be }, "LLM 重试"),
    Ie(
      "启用 LLM 重试",
      t.createElement(u, {
        checked: v,
        onChange: (te) => ee(te)
      })
    ),
    ke(
      "最大重试次数",
      t.createElement(o, {
        min: 1,
        value: m,
        onChange: (te) => X(te ?? 3),
        style: { width: "100%" },
        disabled: !v
      }),
      "退避基数 (秒)",
      t.createElement(o, {
        min: 0.1,
        step: 0.1,
        value: R,
        onChange: (te) => se(te ?? 2),
        style: { width: "100%" },
        disabled: !v
      })
    ),
    Ie(
      "退避上限 (秒)",
      t.createElement(o, {
        min: 0.5,
        step: 0.5,
        value: de,
        onChange: (te) => Ee(te ?? 60),
        style: { width: 200 },
        disabled: !v
      })
    ),
    // ── Section: LLM 限流 ──
    t.createElement(f, { style: { margin: "8px 0 16px" } }),
    t.createElement("div", { style: Be }, "LLM 限流"),
    ke(
      "最大并发数",
      t.createElement(o, {
        min: 1,
        value: ye,
        onChange: (te) => pe(te ?? 1),
        style: { width: "100%" }
      }),
      "最大 QPM (0=不限)",
      t.createElement(o, {
        min: 0,
        step: 10,
        value: le,
        onChange: (te) => U(te ?? 0),
        style: { width: "100%" }
      })
    ),
    ke(
      "限流暂停时间 (秒)",
      t.createElement(o, {
        min: 1,
        step: 0.5,
        value: T,
        onChange: (te) => V(te ?? 1),
        style: { width: "100%" }
      }),
      "限流抖动 (秒)",
      t.createElement(o, {
        min: 0,
        step: 0.5,
        value: oe,
        onChange: (te) => W(te ?? 0),
        style: { width: "100%" }
      })
    ),
    Ie(
      "获取超时 (秒)",
      t.createElement(o, {
        min: 10,
        step: 10,
        value: ue,
        onChange: (te) => ve(te ?? 30),
        style: { width: 200 }
      }),
      "应大于 限流暂停 + 抖动"
    ),
    // ── Section: 上下文与记忆 ──
    t.createElement(f, { style: { margin: "8px 0 16px" } }),
    t.createElement("div", { style: Be }, "上下文与记忆"),
    ke(
      "上下文管理后端",
      t.createElement(c, {
        value: _e,
        onChange: (te) => Ne(te),
        style: { width: "100%" },
        options: [{ value: "light", label: "light" }]
      }),
      "上下文策略",
      t.createElement(c, {
        value: it,
        onChange: (te) => ct(te),
        style: { width: "100%" },
        options: [
          { value: "scroll", label: "scroll (滚动窗口)" },
          { value: "native", label: "native (原生)" }
        ]
      })
    ),
    ke(
      "记忆管理后端",
      t.createElement(c, {
        value: et,
        onChange: (te) => Ae(te),
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
        onChange: (te) => xe(te ?? 50),
        style: { width: "100%" }
      })
    ),
    // ── Save button ──
    t.createElement(
      "div",
      { style: { display: "flex", justifyContent: "flex-end", marginTop: 16 } },
      t.createElement(
        b,
        {
          type: "primary",
          icon: A ? t.createElement(A) : void 0,
          loading: F,
          onClick: Te,
          style: Oe
        },
        "保存运行配置"
      )
    )
  );
}
function Tl({
  expert: e,
  open: t,
  onClose: l,
  onRefresh: a
}) {
  const n = z().React, { useState: s, useEffect: r, useCallback: o } = n, { Modal: d, Tabs: c, Spin: u, Typography: b } = z().antd, { SettingOutlined: _ } = z().antdIcons || {}, { Text: S } = b, [h, f] = s([]), [I, A] = s(!1), [D, M] = s("heartbeat"), ne = o(async () => {
    if (e) {
      A(!0);
      try {
        const x = await wl(e.agent.id);
        f(x);
      } catch {
        f([]);
      } finally {
        A(!1);
      }
    }
  }, [e]);
  if (r(() => {
    t && e && ne();
  }, [t, e, ne]), !e) return null;
  const { agent: F } = e, G = () => {
    ne(), a();
  }, w = [
    {
      key: "heartbeat",
      label: "心跳",
      children: n.createElement(Cl, {
        agentId: F.id
      })
    },
    {
      key: "files",
      label: "文件",
      children: I ? n.createElement(
        "div",
        { style: { textAlign: "center", padding: 40 } },
        n.createElement(u, { size: "large" })
      ) : n.createElement(Vn, {
        agentId: F.id,
        systemPromptFiles: h,
        onRefresh: G
      })
    },
    {
      key: "skills",
      label: `技能 (${e.skills.filter((x) => x.enabled !== !1).length})`,
      children: n.createElement(xl, {
        agentId: F.id,
        onRefresh: a
      })
    },
    {
      key: "mcp",
      label: `MCP (${e.mcps.length})`,
      children: n.createElement(kl, {
        agentId: F.id,
        onRefresh: a,
        isActive: D === "mcp"
      })
    },
    {
      key: "running",
      label: "运行配置",
      children: n.createElement(_l, {
        agentId: F.id
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
        _ ? n.createElement(_, { style: { fontSize: 18 } }) : null,
        n.createElement("span", null, `配置 - ${F.name}`),
        n.createElement(
          S,
          { type: "secondary", style: { fontSize: 12, fontWeight: 400 } },
          F.id
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
    n.createElement(c, {
      items: w,
      activeKey: D,
      onChange: (x) => M(x),
      size: "small",
      tabBarStyle: { marginBottom: 16 }
    })
  );
}
function zl({
  expert: e,
  onClick: t,
  onSummon: l,
  onConfigure: a
}) {
  const n = z().React, { Card: s, Tag: r, Badge: o, Typography: d, Spin: c, Button: u, Tooltip: b } = z().antd, { Text: _ } = d, { ThunderboltOutlined: S, SettingOutlined: h } = z().antdIcons || {}, { agent: f, skills: I, mcps: A, loading: D } = e, M = f.enabled, ne = I.filter((w) => w.enabled !== !1).map((w) => w.name), F = A.map((w) => w.name || w.key), G = f.active_model ? `${f.active_model.provider_id}/${f.active_model.model}` : null;
  return n.createElement(
    s,
    {
      hoverable: !0,
      onClick: t,
      size: "small",
      style: {
        cursor: "pointer",
        transition: "all 0.2s ease",
        borderColor: M ? void 0 : "#d9d9d9",
        opacity: M ? 1 : 0.7,
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
        n.createElement(Re, { name: f.name, size: 36 }),
        n.createElement(
          "div",
          null,
          n.createElement(
            _,
            { strong: !0, style: { fontSize: 15 } },
            f.name
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
            f.id
          )
        )
      ),
      n.createElement(o, {
        status: M ? "success" : "default",
        text: M ? "启用" : "停用"
      })
    ),
    // Description (rendered as markdown)
    f.description ? n.createElement(
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
      Dt(f.description, n)
    ) : n.createElement(
      "div",
      { style: { fontSize: 12, color: "#bfbfbf", marginBottom: 10, minHeight: 54, flex: "1 0 auto" } },
      "暂无描述"
    ),
    // Model info
    G ? n.createElement(
      "div",
      { style: { marginBottom: 8 } },
      n.createElement(
        r,
        { color: "geekblue", style: { fontSize: 11 } },
        `🤖 ${G}`
      )
    ) : null,
    // Skills
    D ? n.createElement(c, { size: "small" }) : n.createElement(
      "div",
      { style: { marginBottom: 6 } },
      n.createElement(
        "div",
        { style: { fontSize: 11, color: "#8c8c8c", marginBottom: 4 } },
        `技能 (${ne.length})`
      ),
      n.createElement(_n, {
        items: ne,
        max: 4,
        color: "cyan",
        emptyText: "未配置技能"
      })
    ),
    // MCP
    !D && F.length > 0 ? n.createElement(
      "div",
      { style: { marginTop: "auto" } },
      n.createElement(
        "div",
        { style: { fontSize: 11, color: "#8c8c8c", marginBottom: 4 } },
        `MCP (${F.length})`
      ),
      n.createElement(_n, {
        items: F,
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
        b,
        { title: "配置专家", placement: "top" },
        n.createElement(
          u,
          {
            type: "text",
            size: "small",
            icon: h ? n.createElement(h, {
              style: { fontSize: 16, color: "#8c8c8c" }
            }) : void 0,
            onClick: (w) => {
              w.stopPropagation(), a && a();
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
          disabled: !M,
          onClick: (w) => {
            w.stopPropagation(), l && l();
          },
          style: Oe
        },
        "召唤专家"
      )
    )
  );
}
function Il({
  expert: e,
  open: t,
  onClose: l,
  onRefresh: a
}) {
  const n = z().React, {
    Drawer: s,
    Descriptions: r,
    Tag: o,
    Typography: d,
    Space: c,
    Button: u,
    Empty: b,
    Tabs: _,
    List: S,
    Spin: h,
    Modal: f,
    message: I
  } = z().antd, { Text: A, Paragraph: D } = d, {
    EditOutlined: M,
    ThunderboltOutlined: ne,
    FileTextOutlined: F,
    ToolOutlined: G,
    PlusOutlined: w
  } = z().antdIcons || {}, [x, k] = n.useState(!1), [K, N] = n.useState(
    []
  ), [$, y] = n.useState(!1);
  if (!e) return null;
  const { agent: g, config: P, skills: J, mcps: q, loading: Z } = e, C = J.filter((v) => v.enabled !== !1), p = (v) => {
    window.history.pushState({}, "", v), window.dispatchEvent(new PopStateEvent("popstate"));
  }, E = n.createElement(
    "div",
    null,
    n.createElement(
      r,
      { column: 1, bordered: !0, size: "small" },
      n.createElement(r.Item, { label: "专家名称" }, g.name),
      n.createElement(
        r.Item,
        { label: "专家 ID" },
        n.createElement("code", { style: { fontSize: 12 } }, g.id)
      ),
      n.createElement(
        r.Item,
        { label: "状态" },
        n.createElement(
          o,
          { color: g.enabled ? "green" : "default" },
          g.enabled ? "启用" : "停用"
        )
      ),
      n.createElement(
        r.Item,
        { label: "功能简介" },
        g.description ? Dt(g.description, n) : "暂无描述"
      ),
      n.createElement(
        r.Item,
        { label: "使用模型" },
        g.active_model ? `${g.active_model.provider_id} / ${g.active_model.model}` : "使用全局默认模型"
      ),
      P != null && P.workspace_dir ? n.createElement(
        r.Item,
        { label: "工作区路径" },
        n.createElement(
          "code",
          { style: { fontSize: 11 } },
          P.workspace_dir
        )
      ) : null,
      P != null && P.approval_level ? n.createElement(
        r.Item,
        { label: "审批级别" },
        P.approval_level
      ) : null
    ),
    // System prompt files
    P != null && P.system_prompt_files && P.system_prompt_files.length > 0 ? n.createElement(
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
        F ? n.createElement(F, {
          style: { fontSize: 14, color: "#1677ff" }
        }) : null,
        n.createElement(A, { strong: !0 }, "系统提示词文件")
      ),
      n.createElement(
        c,
        { wrap: !0 },
        ...P.system_prompt_files.map(
          (v, ee) => n.createElement(
            o,
            {
              key: ee,
              icon: F ? n.createElement(F) : void 0,
              style: { fontSize: 12 }
            },
            v
          )
        )
      )
    ) : null
  ), j = async () => {
    k(!0), y(!0);
    try {
      const v = await Nt(!0);
      N(v);
    } catch (v) {
      I.error(v.message || "加载技能池失败");
    } finally {
      y(!1);
    }
  }, ae = async (v) => {
    let ee = 0, m = 0;
    for (const X of v)
      try {
        await Ft(g.id, X), ee++;
      } catch {
        m++;
      }
    ee > 0 ? (I.success(
      `成功添加 ${ee} 个技能${m > 0 ? `，${m} 个失败` : ""}`
    ), a()) : m > 0 && I.error("添加技能失败"), k(!1);
  }, B = async (v) => {
    try {
      await Gt(g.id, v), I.success(`技能「${v}」已移除`), a();
    } catch (ee) {
      I.error(ee.message || "移除技能失败");
    }
  }, Y = async (v) => {
    try {
      await Fn(g.id, v), I.success(`MCP「${v}」已移除`), a();
    } catch (ee) {
      I.error(ee.message || "移除 MCP 失败");
    }
  }, ie = Z ? n.createElement(
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
        A,
        { strong: !0 },
        `已启用技能 (${C.length})`
      ),
      n.createElement(
        u,
        {
          type: "primary",
          size: "small",
          icon: w ? n.createElement(w) : void 0,
          onClick: j
        },
        "从技能池添加"
      )
    ),
    C.length === 0 ? n.createElement(b, {
      description: "该专家暂无已启用的技能",
      image: b.PRESENTED_IMAGE_SIMPLE
    }) : n.createElement(S, {
      dataSource: C,
      renderItem: (v) => n.createElement(
        S.Item,
        {
          actions: [
            n.createElement(
              u,
              {
                type: "link",
                size: "small",
                danger: !0,
                onClick: () => B(v.name)
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
            v.emoji ? n.createElement(
              "span",
              { style: { fontSize: 16 } },
              v.emoji
            ) : null,
            n.createElement(A, { strong: !0 }, v.name),
            v.version_text ? n.createElement(
              o,
              { style: { fontSize: 10 } },
              `v${v.version_text}`
            ) : null
          ),
          v.description ? n.createElement(
            D,
            {
              type: "secondary",
              style: { fontSize: 12, margin: 0 },
              ellipsis: { rows: 2 }
            },
            v.description
          ) : null,
          v.tags && v.tags.length > 0 ? n.createElement(
            "div",
            { style: { marginTop: 4 } },
            ...v.tags.map(
              (ee, m) => n.createElement(
                o,
                {
                  key: m,
                  color: "cyan",
                  style: { fontSize: 10 }
                },
                ee
              )
            )
          ) : null
        )
      )
    }),
    // Skill Picker Modal (card-grid style, consistent with Skill Center)
    n.createElement(Wn, {
      open: x,
      onClose: () => k(!1),
      poolSkills: K,
      installedSkillNames: C.map((v) => v.name),
      loading: $,
      onInstall: ae
    })
  ), H = Z ? n.createElement(
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
        A,
        { strong: !0 },
        `MCP 客户端 (${q.length})`
      ),
      n.createElement(
        u,
        {
          type: "primary",
          size: "small",
          icon: w ? n.createElement(w) : void 0,
          onClick: () => {
            window.history.pushState({}, "", `/agents/${g.id}/mcp`), window.dispatchEvent(new PopStateEvent("popstate"));
          }
        },
        "配置 MCP"
      )
    ),
    q.length === 0 ? n.createElement(b, {
      description: "该专家暂无关联的 MCP 客户端，点击「配置 MCP」添加",
      image: b.PRESENTED_IMAGE_SIMPLE
    }) : n.createElement(S, {
      dataSource: q,
      renderItem: (v) => n.createElement(
        S.Item,
        {
          actions: [
            n.createElement(
              u,
              {
                type: "link",
                size: "small",
                danger: !0,
                onClick: () => Y(v.key)
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
              A,
              { strong: !0 },
              v.name || v.key
            ),
            n.createElement(
              o,
              {
                color: v.enabled ? "green" : "default",
                style: { fontSize: 10 }
              },
              v.enabled ? "启用" : "停用"
            ),
            n.createElement(
              o,
              { color: "purple", style: { fontSize: 10 } },
              v.transport
            )
          ),
          v.description ? n.createElement(
            D,
            {
              type: "secondary",
              style: { fontSize: 12, margin: 0 },
              ellipsis: { rows: 2 }
            },
            v.description
          ) : null,
          v.tools && v.tools.length > 0 ? n.createElement(
            "div",
            {
              style: {
                marginTop: 4,
                fontSize: 11,
                color: "#8c8c8c"
              }
            },
            `提供 ${v.tools.length} 个工具`
          ) : null
        )
      )
    })
  ), Q = P != null && P.tools ? n.createElement(
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
        G ? n.createElement(G, {
          style: { fontSize: 14, color: "#1677ff" }
        }) : null,
        n.createElement(A, { strong: !0 }, "工具配置")
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
        JSON.stringify(P.tools, null, 2)
      )
    )
  ) : n.createElement(b, {
    description: "暂无工具配置",
    image: b.PRESENTED_IMAGE_SIMPLE
  }), ce = [
    { key: "basic", label: "基本信息", children: E },
    {
      key: "skills",
      label: `技能 (${C.length})`,
      children: ie
    },
    {
      key: "prompts",
      label: "推荐提问",
      children: n.createElement(Al, {
        skills: C,
        agentId: g.id
      })
    },
    {
      key: "knowledge",
      label: "专家记忆",
      children: n.createElement(Vn, {
        agentId: g.id,
        systemPromptFiles: (P == null ? void 0 : P.system_prompt_files) || [],
        onRefresh: () => a()
      })
    },
    { key: "mcp", label: `MCP (${q.length})`, children: H },
    { key: "tools", label: "工具配置", children: Q }
  ];
  return n.createElement(
    s,
    {
      title: n.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 8 } },
        n.createElement(Re, { name: g.name, size: 28 }),
        n.createElement("span", null, g.name)
      ),
      open: t,
      onClose: l,
      width: 560,
      extra: n.createElement(
        c,
        null,
        n.createElement(
          u,
          {
            size: "small",
            icon: M ? n.createElement(M) : void 0,
            onClick: () => {
              l();
              try {
                const v = z();
                v.setSelectedAgent && v.setSelectedAgent(g.id);
              } catch (v) {
                console.warn("[ugsci] Failed to set selected agent:", v);
              }
              setTimeout(() => p("/agents"), 0);
            }
          },
          "编辑专家"
        ),
        n.createElement(
          u,
          {
            type: "primary",
            size: "small",
            icon: ne ? n.createElement(ne) : void 0,
            onClick: () => {
              l();
              try {
                const v = z();
                v.setSelectedAgent && v.setSelectedAgent(g.id);
              } catch (v) {
                console.warn("[ugsci] Failed to set selected agent:", v);
              }
              setTimeout(() => p("/chat"), 0);
            }
          },
          "开始对话"
        )
      )
    },
    n.createElement(_, {
      items: ce,
      defaultActiveKey: "basic"
    })
  );
}
function Ol({
  open: e,
  onClose: t,
  onCreated: l
}) {
  const a = z().React, { useState: n } = a, {
    Modal: s,
    Card: r,
    Tag: o,
    Input: d,
    Row: c,
    Col: u,
    Spin: b,
    message: _,
    Typography: S
  } = z().antd, { Text: h } = S, { FileAddOutlined: f } = z().antdIcons || {}, [I, A] = n(!1), [D, M] = n(""), [ne, F] = n(!1), G = async (k, K) => {
    A(!0);
    try {
      const N = await re("/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: k || "新专家",
          description: K || "",
          skill_names: []
        })
      });
      await bt(
        N.id,
        "AGENTS.md",
        `# ${k || "新专家"}

请在此处编写该专家的系统提示词。
`
      ), _.success("专家「" + (k || "新专家") + "」创建成功"), F(!1), setTimeout(() => {
        t(), l();
      }, 0);
    } catch (N) {
      _.error(N.message || "创建专家失败");
    } finally {
      A(!1);
    }
  }, w = Za.filter((k) => {
    if (!D.trim()) return !0;
    const K = D.toLowerCase();
    return k.name.toLowerCase().includes(K) || k.description.toLowerCase().includes(K) || k.category.toLowerCase().includes(K);
  }), x = async (k) => {
    A(!0);
    try {
      const K = await re("/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: k.name,
          description: k.description,
          skill_names: k.recommended_skills
        })
      });
      await bt(K.id, "AGENTS.md", k.system_prompt);
      const N = await Ut(K.id);
      N.approval_level = k.approval_level, await re(`/agents/${encodeURIComponent(K.id)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(N)
      }), _.success(`专家「${k.name}」创建成功`), t(), l();
    } catch (K) {
      _.error(K.message || "创建专家失败");
    } finally {
      A(!1);
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
          value: D,
          onChange: (k) => M(k.target.value),
          allowClear: !0
        })
      ),
      I ? a.createElement(
        "div",
        { style: { textAlign: "center", padding: 60 } },
        a.createElement(b, { size: "large" }),
        a.createElement(
          "div",
          { style: { marginTop: 12, color: "#8c8c8c" } },
          "正在创建专家..."
        )
      ) : a.createElement(
        c,
        { gutter: [12, 12] },
        // ── Blank template card (always first) ──
        D.trim() ? null : a.createElement(
          u,
          { xs: 24, sm: 12 },
          a.createElement(
            r,
            {
              hoverable: !0,
              size: "small",
              onClick: () => F(!0),
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
                f ? a.createElement(f) : "📝"
              ),
              a.createElement(
                "div",
                { style: { flex: 1 } },
                a.createElement(
                  h,
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
        ...w.map(
          (k) => a.createElement(
            u,
            { key: k.id, xs: 24, sm: 12 },
            a.createElement(
              r,
              {
                hoverable: !0,
                size: "small",
                onClick: () => x(k),
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
                  name: k.name,
                  size: 40
                }),
                a.createElement(
                  "div",
                  { style: { flex: 1 } },
                  a.createElement(
                    h,
                    { strong: !0, style: { fontSize: 15 } },
                    k.name
                  ),
                  a.createElement(
                    "div",
                    null,
                    a.createElement(
                      o,
                      { color: "blue", style: { fontSize: 10 } },
                      k.category
                    ),
                    k.approval_level === "MANUAL" ? a.createElement(
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
                Dt(k.description, a)
              )
            )
          )
        )
      )
    ),
    // ── Blank template creation modal (sibling, not nested inside Modal) ──
    a.createElement(Pl, {
      open: ne,
      onCancel: () => F(!1),
      onCreate: G
    })
  );
}
function Pl({
  open: e,
  onCancel: t,
  onCreate: l
}) {
  const a = z().React, { useState: n, useEffect: s } = a, { Modal: r, Input: o, message: d } = z().antd, [c, u] = n(""), [b, _] = n(""), [S, h] = n(!1);
  return s(() => {
    e && (u(""), _(""), h(!1));
  }, [e]), a.createElement(
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
        h(!0), Promise.resolve(l(c.trim(), b.trim())).finally(() => {
          h(!1);
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
        value: c,
        onChange: (f) => u(f.target.value),
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
        value: b,
        onChange: (f) => _(f.target.value),
        rows: 3,
        maxLength: 200
      })
    )
  );
}
function Vn({
  agentId: e,
  systemPromptFiles: t,
  onRefresh: l
}) {
  const a = z().React, { useState: n, useEffect: s, useCallback: r } = a, {
    List: o,
    Tag: d,
    Switch: c,
    Button: u,
    Modal: b,
    Input: _,
    Spin: S,
    Empty: h,
    message: f,
    Typography: I
  } = z().antd, { FileTextOutlined: A, PlusOutlined: D, EditOutlined: M, ReloadOutlined: ne } = z().antdIcons || {}, { Text: F } = I, [G, w] = n([]), [x, k] = n(!0), [K, N] = n(
    t || []
  ), [$, y] = n(!1), [g, P] = n(null), [J, q] = n(""), [Z, C] = n(""), [p, E] = n(!1), j = r(async () => {
    k(!0);
    try {
      const H = await sl(e);
      w(H);
    } catch (H) {
      f.error(H.message || "加载记忆文件失败"), w([]);
    } finally {
      k(!1);
    }
  }, [e]);
  s(() => {
    j();
  }, [j]), s(() => {
    N(t || []);
  }, [t]);
  const ae = async (H, Q) => {
    const ce = new Set(K);
    if (Q)
      ce.add(H);
    else {
      if (kn.includes(H) && H === "AGENTS.md") {
        f.warning("AGENTS.md 是核心文件，不能停用");
        return;
      }
      ce.delete(H);
    }
    const v = Array.from(ce);
    N(v);
    try {
      await xn(e, v), f.success(Q ? "已启用记忆文件" : "已停用记忆文件"), l();
    } catch (ee) {
      f.error(ee.message || "更新失败"), N(t || []);
    }
  }, B = async (H) => {
    try {
      const Q = await re(
        `/workspace/files/${encodeURIComponent(H)}`,
        { headers: { "X-Agent-Id": e } }
      );
      P(H), q(Q.content || ""), y(!0);
    } catch (Q) {
      f.error(Q.message || "读取文件失败");
    }
  }, Y = () => {
    P(null), q(""), C(""), y(!0);
  }, ie = async () => {
    const H = g || Z.trim();
    if (!H) {
      f.warning("请输入文件名");
      return;
    }
    const Q = H.endsWith(".md") ? H : `${H}.md`;
    E(!0);
    try {
      if (await bt(e, Q, J), !g && !K.includes(Q)) {
        const ce = [...K, Q];
        N(ce), await xn(e, ce);
      }
      f.success("保存成功"), y(!1), j(), l();
    } catch (ce) {
      f.error(ce.message || "保存失败");
    } finally {
      E(!1);
    }
  };
  return x ? a.createElement(
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
        A ? a.createElement(A, {
          style: { fontSize: 14, color: "#1677ff" }
        }) : null,
        a.createElement(
          F,
          { strong: !0 },
          `记忆文件 (${G.length})`
        ),
        a.createElement(
          F,
          { type: "secondary", style: { fontSize: 12 } },
          `· 已挂载 ${K.length} 个到专家记忆`
        )
      ),
      a.createElement(
        "div",
        { style: { display: "flex", gap: 8 } },
        a.createElement(
          u,
          {
            size: "small",
            icon: ne ? a.createElement(ne) : void 0,
            onClick: j
          },
          "刷新"
        ),
        a.createElement(
          u,
          {
            type: "primary",
            size: "small",
            icon: D ? a.createElement(D) : void 0,
            onClick: Y
          },
          "新建记忆文件"
        )
      )
    ),
    G.length === 0 ? a.createElement(h, {
      description: "暂无记忆文件，点击「新建记忆文件」添加",
      image: h.PRESENTED_IMAGE_SIMPLE
    }) : a.createElement(o, {
      dataSource: G,
      renderItem: (H) => {
        const Q = K.includes(H.filename), ce = kn.includes(H.filename);
        return a.createElement(
          o.Item,
          {
            actions: [
              a.createElement(
                u,
                {
                  type: "link",
                  size: "small",
                  icon: M ? a.createElement(M) : void 0,
                  onClick: () => B(H.filename)
                },
                "编辑"
              )
            ]
          },
          a.createElement(o.Item.Meta, {
            avatar: a.createElement(A, {
              style: {
                fontSize: 20,
                color: Q ? "#1677ff" : "#bfbfbf"
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
              a.createElement(F, null, H.filename),
              ce ? a.createElement(
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
              `${(H.size / 1024).toFixed(1)} KB · 修改于 ${new Date(H.modified_time).toLocaleString()}`
            )
          }),
          a.createElement(c, {
            checked: Q,
            size: "small",
            onChange: (v) => ae(H.filename, v)
          })
        );
      }
    }),
    // Edit/New file modal
    a.createElement(
      b,
      {
        open: $,
        onCancel: () => y(!1),
        title: g ? `编辑 ${g}` : "新建记忆文件",
        width: 700,
        onOk: ie,
        confirmLoading: p,
        okText: "保存"
      },
      g ? null : a.createElement(
        "div",
        { style: { marginBottom: 12 } },
        a.createElement(_, {
          placeholder: "文件名（如：油藏工程记忆库.md）",
          value: Z,
          onChange: (H) => C(H.target.value),
          addonAfter: Z.endsWith(".md") ? "" : ".md"
        })
      ),
      a.createElement(_.TextArea, {
        value: J,
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
function Al({
  skills: e,
  agentId: t
}) {
  const l = z().React, { useMemo: a } = l, {
    List: n,
    Tag: s,
    Typography: r,
    Empty: o,
    Button: d,
    message: c
  } = z().antd, { ThunderboltOutlined: u, CopyOutlined: b } = z().antdIcons || {}, { Text: _ } = r, S = a(() => Nn(e), [e]), h = (I) => {
    try {
      const A = z();
      A.setSelectedAgent && A.setSelectedAgent(t);
    } catch {
    }
    try {
      sessionStorage.setItem("ugsci_pending_prompt", I.value);
    } catch {
    }
    window.history.pushState({}, "", "/chat"), window.dispatchEvent(new PopStateEvent("popstate"));
  }, f = (I) => {
    var A;
    (A = navigator.clipboard) == null || A.writeText(I.value).then(() => {
      c.success("已复制到剪贴板");
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
        _,
        { strong: !0 },
        `推荐提问 (${S.length})`
      ),
      l.createElement(
        _,
        { type: "secondary", style: { fontSize: 12 } },
        "· 从技能描述中自动提取"
      )
    ),
    l.createElement(n, {
      dataSource: S,
      renderItem: (I, A) => l.createElement(
        n.Item,
        {
          actions: [
            l.createElement(
              d,
              {
                type: "link",
                size: "small",
                icon: b ? l.createElement(b) : void 0,
                onClick: () => f(I)
              },
              "复制"
            )
          ]
        },
        l.createElement(n.Item.Meta, {
          avatar: l.createElement(
            s,
            { color: "blue", style: { borderRadius: "50%" } },
            `${A + 1}`
          ),
          title: l.createElement(
            "div",
            {
              style: {
                cursor: "pointer",
                color: "#1677ff"
              },
              onClick: () => h(I)
            },
            I.value
          ),
          description: l.createElement(
            _,
            { type: "secondary", style: { fontSize: 12 } },
            I.label
          )
        })
      )
    })
  );
}
function Ml() {
  var oe;
  const e = z().React, { useState: t, useEffect: l, useCallback: a, useMemo: n } = e, {
    Spin: s,
    Empty: r,
    Input: o,
    Button: d,
    message: c,
    Row: u,
    Col: b,
    Tabs: _,
    Modal: S,
    Typography: h
  } = z().antd, {
    ReloadOutlined: f,
    PlusOutlined: I,
    SearchOutlined: A,
    TeamOutlined: D,
    UserOutlined: M
  } = z().antdIcons || {}, { Text: ne, Paragraph: F } = h, [G, w] = t([]), [x, k] = t(!0), [K, N] = t(!1), [$, y] = t(null), [g, P] = t(""), [J, q] = t(!1), [Z, C] = t("experts"), [p, E] = t(
    null
  ), [j, ae] = t(""), [B, Y] = t(!1), [ie, H] = t(!1), [Q, ce] = t(null), [v, ee] = t([]), m = a(async () => {
    k(!0);
    try {
      const W = await Bt(), ue = await Promise.all(
        W.map(async (ve) => {
          try {
            const [we, xe, _e] = await Promise.all([
              Ut(ve.id).catch(() => null),
              wt(ve.id).catch(() => []),
              Ht(ve.id).catch(() => [])
            ]);
            return {
              agent: ve,
              config: we,
              skills: xe,
              mcps: _e,
              loading: !1
            };
          } catch {
            return {
              agent: ve,
              config: null,
              skills: [],
              mcps: [],
              loading: !1
            };
          }
        })
      );
      w(ue), ee(W);
    } catch (W) {
      c.error(W.message || "加载专家列表失败"), w([]);
    } finally {
      k(!1);
    }
  }, []);
  l(() => {
    m();
  }, [m]), l(() => {
    if (Q && ie) {
      const W = G.find(
        (ue) => ue.agent.id === Q.agent.id
      );
      W && W !== Q && ce(W);
    }
  }, [G, Q, ie]);
  const X = a(
    async (W) => {
      var xe;
      const ue = W.coordinatorName || ((xe = W.members[0]) == null ? void 0 : xe.name);
      let ve = null;
      if (ue && (ve = vt(v, ue)), !ve) {
        const _e = v[0];
        if (_e)
          ve = _e.id, c.warning(
            `未找到专家「${ue || "协调者"}」，将使用「${_e.name}」作为工作流控制器。控制器将通过 spawn_subagent 分派子任务。`
          );
        else {
          c.error("没有可用的 Agent 作为工作流控制器");
          return;
        }
      }
      if (/\{.+?\}/.test(W.taskTemplate)) {
        ae(""), E(W);
        return;
      }
      await R(W, ve, W.taskTemplate);
    },
    [v, c]
  ), R = a(
    async (W, ue, ve) => {
      Y(!0);
      try {
        const we = ve || W.taskTemplate, xe = `/ugsci-team ${W.mode} ${W.name} ${we}`, _e = z();
        _e.setSelectedAgent && _e.setSelectedAgent(ue), await tl(ue, xe), c.success(
          `OMP 工作流已启动：${W.name}（${W.mode}模式）`
        ), E(null), se("/chat");
      } catch (we) {
        c.error(we.message || "发起团队任务失败");
      } finally {
        Y(!1);
      }
    },
    [c]
  ), se = (W) => {
    window.history.pushState({}, "", W), window.dispatchEvent(new PopStateEvent("popstate"));
  }, de = a((W) => {
    y(W), N(!0);
  }, []), Ee = a((W) => {
    ce(W), H(!0);
  }, []), ye = a(
    (W) => {
      if (!W.agent.enabled) {
        c.warning(`专家「${W.agent.name}」未启用，请先启用`);
        return;
      }
      try {
        const ue = z();
        ue.setSelectedAgent && ue.setSelectedAgent(W.agent.id);
      } catch (ue) {
        console.warn("[ugsci] Failed to set selected agent:", ue);
      }
      c.success(`已召唤专家「${W.agent.name}」，正在跳转至对话...`), se("/chat");
    },
    [c]
  ), pe = n(() => {
    if (!g.trim()) return G;
    const W = g.toLowerCase();
    return G.filter(
      (ue) => {
        var ve;
        return ue.agent.name.toLowerCase().includes(W) || ((ve = ue.agent.description) == null ? void 0 : ve.toLowerCase().includes(W)) || ue.agent.id.toLowerCase().includes(W) || ue.skills.some((we) => we.name.toLowerCase().includes(W));
      }
    );
  }, [G, g]), le = G.filter((W) => W.agent.enabled).length, U = G.reduce(
    (W, ue) => W + ue.skills.filter((ve) => ve.enabled !== !1).length,
    0
  ), T = G.reduce((W, ue) => W + ue.mcps.length, 0), V = [
    {
      key: "experts",
      label: e.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        M ? e.createElement(M, { style: { fontSize: 14 } }) : null,
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
            prefix: A ? e.createElement(A) : void 0,
            value: g,
            onChange: (W) => P(W.target.value),
            allowClear: !0,
            style: { maxWidth: 400 }
          })
        ),
        // Content
        x ? e.createElement(
          "div",
          { style: { textAlign: "center", padding: 60 } },
          e.createElement(s, { size: "large" })
        ) : pe.length === 0 ? e.createElement(r, {
          description: g ? "未找到匹配的专家" : "暂无专家，点击「创建专家」添加"
        }) : e.createElement(
          u,
          { gutter: [12, 12], align: "stretch" },
          ...pe.map(
            (W) => e.createElement(
              b,
              {
                key: W.agent.id,
                xs: 24,
                sm: 12,
                md: 8,
                lg: 6,
                style: { display: "flex" }
              },
              e.createElement(zl, {
                expert: W,
                onClick: () => de(W),
                onSummon: () => ye(W),
                onConfigure: () => Ee(W)
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
        D ? e.createElement(D, { style: { fontSize: 14 } }) : null,
        "专家团"
      ),
      children: e.createElement(ll, {
        agents: v,
        onLaunch: X
      })
    }
  ];
  return e.createElement(
    "div",
    { style: { padding: 24 } },
    e.createElement(Ct, {
      title: "专家",
      subtitle: `共 ${G.length} 位专家（${le} 位启用）· ${U} 个技能 · ${T} 个 MCP 客户端`,
      extra: e.createElement(
        e.Fragment,
        null,
        e.createElement(
          d,
          {
            icon: f ? e.createElement(f) : void 0,
            onClick: () => {
              Ze(), m();
            },
            loading: x
          },
          "刷新"
        ),
        e.createElement(
          d,
          {
            type: "primary",
            icon: I ? e.createElement(I) : void 0,
            onClick: () => q(!0),
            style: Oe
          },
          "创建专家"
        )
      )
    }),
    e.createElement(_, {
      items: V,
      activeKey: Z,
      onChange: (W) => C(W)
    }),
    // Drawer
    e.createElement(Il, {
      expert: $,
      open: K,
      onClose: () => N(!1),
      onRefresh: () => m()
    }),
    // Template Modal
    e.createElement(Ol, {
      open: J,
      onClose: () => q(!1),
      onCreated: () => m()
    }),
    // Config Modal (gear icon)
    e.createElement(Tl, {
      expert: Q,
      open: ie,
      onClose: () => H(!1),
      onRefresh: () => m()
    }),
    // Team Launch Modal (for filling placeholders)
    p ? e.createElement(
      S,
      {
        open: !0,
        title: e.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 8 } },
          e.createElement(Jt, {
            members: p.members.map((W) => W.name),
            size: 28
          }),
          e.createElement(
            "span",
            null,
            `发起团队任务 - ${p.name}`
          )
        ),
        onCancel: () => E(null),
        onOk: () => {
          var we;
          const W = p.coordinatorName || ((we = p.members[0]) == null ? void 0 : we.name), ue = W ? vt(v, W) : null;
          if (!ue) {
            c.error("无法找到协调者专家");
            return;
          }
          let ve = p.taskTemplate;
          j.trim() && (ve = j.trim()), R(p, ue, ve);
        },
        confirmLoading: B,
        okText: "发起任务",
        width: 600
      },
      e.createElement(
        "div",
        { style: { marginBottom: 12 } },
        e.createElement(
          ne,
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
          ne,
          {
            type: "secondary",
            style: { fontSize: 12, display: "block", marginBottom: 8 }
          },
          "输入具体任务描述（替换上面的占位符内容）："
        ),
        e.createElement(o.TextArea, {
          value: j,
          onChange: (W) => ae(W.target.value),
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
          ne,
          { style: { fontSize: 12, color: "#0958d9" } },
          `协调者: ${p.coordinatorName || ((oe = p.members[0]) == null ? void 0 : oe.name) || "—"} · 成员: ${p.members.map((W) => W.name).join("、")}`
        )
      )
    ) : null
  );
}
const qn = [
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
], $l = {
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
function Fe(e) {
  return (e || "").trim() || "channel";
}
function qe(e) {
  return (e || "").trim();
}
function Yn(e) {
  const t = qe(e);
  return t === "" || t === "*";
}
function xt(e) {
  return e === "user" ? "user" : "all";
}
function Ue(e) {
  const t = xt(e.subject_type);
  return {
    source_type: Fe(e.source_type),
    source_value: qe(e.source_value),
    subject_type: t,
    subject_value: t === "all" ? "" : (e.subject_value || "").trim(),
    effect: e.effect
  };
}
function Ye(e) {
  return { tool_name: e.tool_name || "*", ...Ue(e) };
}
function Qn(e) {
  return { tool_name: e.tool_name || "*", effect: e.effect };
}
function Zn(e) {
  return [...e].map(Ue).sort(
    (t, l) => t.source_type.localeCompare(l.source_type) || t.source_value.localeCompare(l.source_value) || t.subject_type.localeCompare(l.subject_type) || t.subject_value.localeCompare(l.subject_value)
  );
}
function St(e) {
  return [...e].map(Ye).sort(
    (t, l) => t.tool_name.localeCompare(l.tool_name) || t.source_type.localeCompare(l.source_type) || t.source_value.localeCompare(l.source_value) || t.subject_type.localeCompare(l.subject_type) || t.subject_value.localeCompare(l.subject_value)
  );
}
function ea(e) {
  return [...e].map(Qn).sort((t, l) => t.tool_name.localeCompare(l.tool_name));
}
function Le(e) {
  return {
    default_effect: e.default_effect || "deny",
    client_overrides: Zn(e.client_overrides || []),
    tool_defaults: ea(e.tool_defaults || []),
    tool_overrides: St(e.tool_overrides || []),
    unmanaged_rules_count: e.unmanaged_rules_count || 0
  };
}
function Me(e) {
  return [Fe(e.source_type), qe(e.source_value), xt(e.subject_type), e.subject_type === "all" ? "" : (e.subject_value || "").trim()].join("\0");
}
function $e(e) {
  return [e.tool_name || "*", Fe(e.source_type), qe(e.source_value), xt(e.subject_type), e.subject_type === "all" ? "" : (e.subject_value || "").trim()].join("\0");
}
function Rl(e, t) {
  const l = Le(t), a = /* @__PURE__ */ new Map();
  l.tool_overrides.forEach((c) => {
    const u = Ye(c), b = a.get(u.tool_name) || [];
    b.push(u), a.set(u.tool_name, b);
  });
  const n = new Map(l.tool_defaults.map((c) => [c.tool_name, Qn(c)])), s = new Set(e.map((c) => c.name)), r = e.map((c) => {
    var u;
    return {
      toolName: c.name,
      description: c.description,
      inputSchema: c.input_schema,
      stale: !1,
      defaultEffect: ((u = n.get(c.name)) == null ? void 0 : u.effect) || l.default_effect,
      hasExplicitDefault: n.has(c.name),
      rules: St(a.get(c.name) || [])
    };
  }), o = /* @__PURE__ */ new Set([...a.keys(), ...n.keys()]), d = Array.from(o).filter((c) => c !== "*" && !s.has(c)).map((c) => {
    var u;
    return {
      toolName: c,
      description: "",
      inputSchema: {},
      stale: !0,
      defaultEffect: ((u = n.get(c)) == null ? void 0 : u.effect) || l.default_effect,
      hasExplicitDefault: n.has(c),
      rules: St(a.get(c) || [])
    };
  });
  return [...r, ...d];
}
function ta(e, t) {
  const l = Le(e), a = new Set(
    t === null ? l.client_overrides.map((n) => Me(Ue(n))) : l.tool_overrides.filter((n) => n.tool_name === t).map((n) => $e(Ye(n)))
  );
  for (const n of qn) {
    const s = t === null ? Me({ source_type: "channel", source_value: n, subject_type: "all", subject_value: "" }) : $e({ tool_name: t, source_type: "channel", source_value: n, subject_type: "all", subject_value: "" });
    if (!a.has(s)) return n;
  }
  return "console";
}
function Ll(e) {
  return Mt(e, { source_type: "channel", source_value: ta(e, null), subject_type: "all", subject_value: "", effect: "ask" });
}
function jl(e, t) {
  return $t(e, { tool_name: t, source_type: "channel", source_value: ta(e, t), subject_type: "all", subject_value: "", effect: "ask" });
}
function Mt(e, t, l) {
  const a = Le(e), n = Ue(t), s = Me(l || n), r = Me(n), o = a.client_overrides.filter((d) => {
    const c = Me(Ue(d));
    return c !== s && c !== r;
  });
  return o.push(n), { ...a, client_overrides: Zn(o) };
}
function $t(e, t, l) {
  const a = Le(e), n = Ye(t), s = $e(l || n), r = $e(n), o = a.tool_overrides.filter((d) => {
    const c = $e(Ye(d));
    return c !== s && c !== r;
  });
  return o.push(n), { ...a, tool_overrides: St(o) };
}
function Bl(e, t, l) {
  const a = Le(e), n = a.tool_defaults.filter((s) => s.tool_name !== t);
  return n.push({ tool_name: t, effect: l }), { ...a, tool_defaults: ea(n) };
}
function Ul(e, t) {
  const l = Le(e), a = Me(t);
  return { ...l, client_overrides: l.client_overrides.filter((n) => Me(Ue(n)) !== a) };
}
function Nl(e, t) {
  const l = Le(e), a = $e(t);
  return { ...l, tool_overrides: l.tool_overrides.filter((n) => $e(Ye(n)) !== a) };
}
function na(e, t) {
  const l = Fe(t.source_type), a = qe(t.source_value);
  if (Yn(a)) return [];
  const n = /* @__PURE__ */ new Map();
  return e.forEach((s) => {
    if (Fe(s.source_type) !== l || qe(s.source_value) !== a) return;
    const r = (s.subject_value || "").trim();
    !r || n.has(r) || n.set(r, s);
  }), Array.from(n.values());
}
function Dl(e, t) {
  return na(e, t).map((l) => ({ label: l.subject_value, value: l.subject_value }));
}
function Wt(e) {
  return Fe(e.source_type) === "channel" && Yn(e.source_value) && xt(e.subject_type) === "user" && !!(e.subject_value || "").trim();
}
function Fl(e, t) {
  const l = Ue(t);
  return l.subject_type === "user" && !!l.subject_value && l.subject_value !== "*" && e.some((a) => Fe(a.source_type) === l.source_type) && !Wt(l) && !na(e, l).some((a) => a.subject_value === l.subject_value);
}
function Gl(e) {
  const t = [...e.client_overrides || [], ...e.tool_overrides || []];
  for (const l of t) {
    const a = Ue(l);
    if (a.subject_type === "user") {
      if (!a.subject_value || a.subject_value === "*" || !a.source_value) return { reason: "missingUserValue", rule: l };
      if (Wt(a)) return { reason: "ambiguousUserSource", rule: l };
    }
  }
  return null;
}
function Tn(e, t) {
  const l = { ...e, ...t };
  return t.subject_type && (l.subject_value = ""), (t.source_type !== void 0 || t.source_value !== void 0) && t.subject_value === void 0 && l.subject_type === "user" && (l.subject_value = ""), l;
}
function Pt(e) {
  return JSON.stringify(Le(e));
}
function Hl({
  client: e,
  agentId: t,
  open: l,
  onClose: a,
  onSave: n
}) {
  const s = z().React, { useState: r, useEffect: o, useMemo: d, useCallback: c } = s, { Modal: u, Spin: b, Empty: _, Button: S, Tag: h, Segmented: f, Select: I, Input: A, AutoComplete: D, Typography: M, message: ne } = z().antd, { PlusOutlined: F, DeleteOutlined: G } = z().antdIcons || {}, { Text: w } = M, [x, k] = r(null), [K, N] = r([]), [$, y] = r([]), [g, P] = r(!1), [J, q] = r(!1), [Z, C] = r(""), [p, E] = r("");
  o(() => {
    if (!l) return;
    let m = !1;
    return (async () => {
      P(!0), N([]), y([]), C("");
      try {
        const R = await Wa(t, e.key);
        if (!m) {
          const se = Le(R);
          k(se), E(Pt(se));
        }
        try {
          const se = await Xa(t);
          m || y(se);
        } catch {
          m || y([]);
        }
        if (!e.enabled) {
          m || C("MCP 客户端未启用，无法获取工具列表");
          return;
        }
        try {
          const se = await Ha(t, e.key);
          m || N(se);
        } catch (se) {
          m || C((se == null ? void 0 : se.message) || "无法加载工具列表");
        }
      } catch {
        m || (k(null), E(""), C("加载访问策略失败"));
      } finally {
        m || P(!1);
      }
    })(), () => {
      m = !0;
    };
  }, [l, e.key, e.enabled, t]);
  const j = d(() => x ? Rl(K, x) : [], [K, x]), ae = d(() => !!(x && Pt(x) !== p), [x, p]), B = (m) => $l[m] || m, Y = c((m) => {
    k((X) => X && { ...X, default_effect: m });
  }, []), ie = c((m, X) => {
    k((R) => R && Mt(R, Tn(m, X), { source_type: m.source_type, source_value: m.source_value, subject_type: m.subject_type, subject_value: m.subject_value }));
  }, []), H = c((m, X) => {
    k((R) => R && $t(R, Tn(m, X), { tool_name: m.tool_name, source_type: m.source_type, source_value: m.source_value, subject_type: m.subject_type, subject_value: m.subject_value }));
  }, []), Q = c(async () => {
    if (!x) return;
    const m = Gl(x);
    if (m) {
      ne.error(m.reason === "missingUserValue" ? "用户规则缺少用户标识" : "用户来源不明确");
      return;
    }
    q(!0);
    try {
      await n(e.key, x) && (E(Pt(x)), a());
    } finally {
      q(!1);
    }
  }, [x, e.key, n, a, ne]), ce = c(() => {
    if (!ae || J) {
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
  }, [ae, J, a]), v = c((m, X) => {
    const R = Dl($, m), se = Wt(m), de = Fl($, m), Ee = [{ label: "所有渠道", value: "*" }, ...qn.map((V) => ({ label: B(V), value: V }))], ye = [{ label: "所有人", value: "all" }, { label: "指定用户", value: "user" }], pe = X ? H : ie, le = (V) => {
      k(X ? (oe) => oe && $t(oe, { ...m, effect: V }) : (oe) => oe && Mt(oe, { ...m, effect: V }));
    }, U = () => {
      k(X ? (V) => V && Nl(V, { tool_name: m.tool_name, source_type: m.source_type, source_value: m.source_value, subject_type: m.subject_type, subject_value: m.subject_value }) : (V) => V && Ul(V, { source_type: m.source_type, source_value: m.source_value, subject_type: m.subject_type, subject_value: m.subject_value }));
    }, T = X ? $e(m) : Me(m);
    return s.createElement(
      "div",
      { key: T, style: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr auto", gap: 6, alignItems: "end", padding: "6px 0", borderBottom: "1px solid #f5f5f5" } },
      // source_type
      s.createElement(
        "div",
        null,
        s.createElement(w, { style: { fontSize: 11, color: "#999", display: "block", marginBottom: 2 } }, "来源类型"),
        s.createElement(I, {
          size: "small",
          style: { width: "100%" },
          value: m.source_type || "channel",
          onChange: (V) => pe(m, { source_type: V, source_value: V === "channel" ? m.source_value || "*" : m.source_value }),
          options: [{ label: "渠道", value: "channel" }, ...m.source_type && m.source_type !== "channel" ? [{ label: m.source_type, value: m.source_type }] : []]
        })
      ),
      // source_value
      s.createElement(
        "div",
        null,
        s.createElement(w, { style: { fontSize: 11, color: "#999", display: "block", marginBottom: 2 } }, "来源"),
        m.source_type === "channel" ? s.createElement(I, { size: "small", style: { width: "100%" }, value: m.source_value || "*", onChange: (V) => pe(m, { source_value: V }), options: Ee }) : s.createElement(A, { size: "small", placeholder: "来源标识", value: m.source_value, onChange: (V) => pe(m, { source_value: V.target.value }) })
      ),
      // subject_type
      s.createElement(
        "div",
        null,
        s.createElement(w, { style: { fontSize: 11, color: "#999", display: "block", marginBottom: 2 } }, "对象类型"),
        s.createElement(I, { size: "small", style: { width: "100%" }, value: m.subject_type, onChange: (V) => pe(m, { subject_type: V }), options: ye })
      ),
      // subject_value
      s.createElement(
        "div",
        null,
        s.createElement(w, { style: { fontSize: 11, color: "#999", display: "block", marginBottom: 2 } }, "对象"),
        m.subject_type === "user" ? s.createElement(
          "div",
          null,
          s.createElement(D, {
            size: "small",
            style: { width: "100%" },
            value: m.subject_value,
            options: R,
            placeholder: R.length > 0 ? "用户 ID" : "无近期用户",
            onChange: (V) => pe(m, { subject_value: V }),
            onSelect: (V) => pe(m, { subject_value: V }),
            filterOption: (V, oe) => String((oe == null ? void 0 : oe.value) || "").toLowerCase().includes(V.toLowerCase())
          }),
          se ? s.createElement(w, { style: { fontSize: 10, color: "#fa8c16", display: "block" } }, "请先选择具体渠道") : null,
          de ? s.createElement(w, { style: { fontSize: 10, color: "#fa8c16", display: "block" } }, "未知的用户标识") : null
        ) : s.createElement(A, { size: "small", disabled: !0, value: "所有人" })
      ),
      // effect
      s.createElement(
        "div",
        null,
        s.createElement(w, { style: { fontSize: 11, color: "#999", display: "block", marginBottom: 2 } }, "效果"),
        s.createElement(I, {
          size: "small",
          style: { width: "100%" },
          value: m.effect,
          onChange: (V) => le(V),
          options: [{ label: "允许", value: "allow" }, { label: "询问", value: "ask" }, { label: "拒绝", value: "deny" }]
        })
      ),
      // delete
      s.createElement(S, { size: "small", type: "text", icon: s.createElement(G), onClick: U, title: "删除规则" })
    );
  }, [$, ie, H]), ee = (m, X) => {
    const se = {
      ask: { bg: "rgba(245,158,11,0.24)", border: "rgba(217,119,6,0.36)", text: "#8a4b00" },
      allow: { bg: "rgba(34,197,94,0.22)", border: "rgba(22,163,74,0.35)", text: "#17643a" },
      deny: { bg: "rgba(239,68,68,0.2)", border: "rgba(220,38,38,0.34)", text: "#9f1f26" }
    }[m];
    return s.createElement(f, {
      size: "small",
      value: m,
      onChange: (de) => X(de),
      style: { "--mcp-policy-segment-bg": se.bg, "--mcp-policy-segment-border": se.border, "--mcp-policy-segment-text": se.text },
      options: [{ label: "询问", value: "ask" }, { label: "允许", value: "allow" }, { label: "拒绝", value: "deny" }]
    });
  };
  return s.createElement(
    u,
    {
      title: `${e.name || e.key} - 工具与访问策略`,
      open: l,
      onCancel: ce,
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
        s.createElement(S, { onClick: ce, style: { marginRight: 8 } }, "取消"),
        s.createElement(S, { type: "primary", onClick: Q, loading: J, disabled: !x || g }, "保存")
      )
    },
    g && !x ? s.createElement("div", { style: { textAlign: "center", padding: 40 } }, s.createElement(b)) : x ? s.createElement(
      "div",
      null,
      // ── Client-level panel ──
      s.createElement(
        "div",
        { style: { marginBottom: 16, padding: "12px 16px", background: "#fafafa", borderRadius: 8, border: "1px solid #f0f0f0" } },
        s.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 } },
          s.createElement(w, { strong: !0 }, "客户端访问策略"),
          s.createElement(
            "div",
            { style: { display: "flex", alignItems: "center", gap: 8 } },
            s.createElement(w, { style: { fontSize: 12, color: "#666" } }, "默认:"),
            ee(x.default_effect, Y),
            s.createElement(S, { size: "small", icon: s.createElement(F), onClick: () => k((m) => m && Ll(m)) }, "添加规则")
          )
        ),
        x.client_overrides.length === 0 ? s.createElement(w, { style: { fontSize: 12, color: "#999" } }, "暂无客户端级覆盖规则") : s.createElement("div", null, ...x.client_overrides.map((m) => v(m, !1)))
      ),
      // ── Error message ──
      Z ? s.createElement("div", { style: { color: "#ff4d4f", fontSize: 12, marginBottom: 8 } }, Z) : null,
      // ── Tool-level panel ──
      s.createElement(w, { strong: !0, style: { display: "block", marginBottom: 8 } }, "工具访问策略"),
      j.length === 0 ? s.createElement(_, { description: "暂无工具" }) : s.createElement(
        "div",
        null,
        ...j.map(
          (m) => s.createElement(
            "div",
            { key: m.toolName, style: { marginBottom: 12, padding: "10px 12px", background: "#fafafa", borderRadius: 6, border: "1px solid #f0f0f0" } },
            s.createElement(
              "div",
              { style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 } },
              s.createElement(
                "div",
                { style: { display: "flex", alignItems: "center", gap: 6 } },
                s.createElement(h, { color: m.stale ? "default" : "blue" }, m.toolName),
                m.stale ? s.createElement(h, { color: "orange" }, "已失效") : null
              ),
              s.createElement(
                "div",
                { style: { display: "flex", alignItems: "center", gap: 8 } },
                s.createElement(w, { style: { fontSize: 12, color: "#666" } }, "默认:"),
                ee(m.defaultEffect, (X) => k((R) => R && Bl(R, m.toolName, X))),
                s.createElement(S, { size: "small", icon: s.createElement(F), onClick: () => k((X) => X && jl(X, m.toolName)) }, "添加规则")
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
            m.rules.length === 0 ? s.createElement(w, { style: { fontSize: 12, color: "#999" } }, "暂无工具级覆盖规则") : s.createElement("div", null, ...m.rules.map((X) => v(X, !0)))
          )
        )
      )
    ) : s.createElement("div", { style: { color: "#ff4d4f" } }, "加载访问策略失败")
  );
}
function Wl({
  client: e,
  agentId: t,
  open: l,
  onClose: a,
  onAuthChanged: n
}) {
  var q, Z, C, p, E;
  const s = z().React, { useState: r, useCallback: o, useEffect: d } = s, { Modal: c, Button: u, Input: b, Typography: _, message: S } = z().antd, { Text: h } = _, [f, I] = r("idle"), [A, D] = r(""), [M, ne] = r(!1), [F, G] = r(((q = e.oauth_status) == null ? void 0 : q.client_id) || ""), [w, x] = r(((Z = e.oauth_status) == null ? void 0 : Z.scope) || ""), [k, K] = r(""), [N, $] = r("");
  d(() => {
    if (f !== "waiting") return;
    const j = setInterval(async () => {
      try {
        (await Va(t, e.key)).authorized && (I("success"), n());
      } catch {
      }
    }, 2e3);
    return () => clearInterval(j);
  }, [f, e.key, t, n]);
  const y = f === "success" || f === "idle" && ((C = e.oauth_status) == null ? void 0 : C.authorized) === !0, g = f === "idle" && ((p = e.oauth_status) == null ? void 0 : p.authorized) && e.oauth_status.expires_at > 0 && e.oauth_status.expires_at < Date.now() / 1e3, P = o(async () => {
    var j;
    if (!((j = e.url) != null && j.trim())) {
      D("缺少 URL");
      return;
    }
    I("starting"), D("");
    try {
      const ae = await Ka(t, e.key, {
        url: e.url,
        scope: w,
        client_id: F,
        auth_endpoint: k,
        token_endpoint: N
      });
      I("waiting"), window.open(ae.auth_url, "_blank", "popup,width=600,height=700");
    } catch (ae) {
      I("error"), D((ae == null ? void 0 : ae.message) || "OAuth 启动失败");
    }
  }, [t, e.key, e.url, w, F, k, N]), J = o(async () => {
    I("revoking");
    try {
      await qa(t, e.key), I("idle"), n();
    } catch {
      I("idle");
    }
  }, [t, e.key, n]);
  return s.createElement(
    c,
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
          { style: { fontSize: 12, padding: "2px 8px", borderRadius: 12, border: "1px solid", color: g ? "#e67e22" : y ? "#27ae60" : "#7f8c8d", borderColor: g ? "#e67e22" : y ? "#27ae60" : "#7f8c8d", background: "white" } },
          g ? "已过期" : y ? "已授权" : f === "waiting" ? "等待授权..." : f === "error" ? "授权失败" : "未授权"
        ),
        s.createElement(
          "div",
          { style: { display: "flex", gap: 8 } },
          y || g ? s.createElement(u, { size: "small", onClick: J, loading: f === "revoking" }, "撤销") : null,
          s.createElement(u, { size: "small", type: y && !g ? "default" : "primary", onClick: P, loading: f === "starting" || f === "waiting", disabled: !((E = e.url) != null && E.trim()) }, y && !g ? "重新授权" : "授权")
        )
      ),
      A ? s.createElement("p", { style: { color: "#c0392b", fontSize: 12 } }, A) : null,
      // Advanced
      s.createElement(
        "div",
        { style: { marginTop: 8, cursor: "pointer", color: "#888", fontSize: 12 }, onClick: () => ne((j) => !j) },
        M ? "收起高级设置" : "展开高级设置"
      ),
      M ? s.createElement(
        "div",
        { style: { marginTop: 8, padding: "10px 12px", background: "white", borderRadius: 6, border: "1px solid #e9ecef" } },
        s.createElement(h, { style: { fontSize: 11, color: "#888", display: "block", marginBottom: 2 } }, "Client ID"),
        s.createElement(b, { size: "small", placeholder: "留空则使用动态注册", value: F, onChange: (j) => G(j.target.value) }),
        s.createElement(h, { style: { fontSize: 11, color: "#888", display: "block", marginBottom: 2, marginTop: 8 } }, "Scope"),
        s.createElement(b, { size: "small", placeholder: "OAuth scope", value: w, onChange: (j) => x(j.target.value) }),
        s.createElement(h, { style: { fontSize: 11, color: "#888", display: "block", marginBottom: 2, marginTop: 8 } }, "授权端点"),
        s.createElement(b, { size: "small", placeholder: "https://auth.example.com/authorize", value: k, onChange: (j) => K(j.target.value) }),
        s.createElement(h, { style: { fontSize: 11, color: "#888", display: "block", marginBottom: 2, marginTop: 8 } }, "令牌端点"),
        s.createElement(b, { size: "small", placeholder: "https://auth.example.com/token", value: N, onChange: (j) => $(j.target.value) })
      ) : null
    )
  );
}
function Jl({
  mcp: e,
  agentId: t,
  onToggle: l,
  onDelete: a,
  onUpdate: n,
  onUpdatePolicy: s,
  onRefresh: r
}) {
  const o = z().React, { useState: d } = o, { Card: c, Tag: u, Tooltip: b, Modal: _, Input: S, Button: h, Typography: f } = z().antd, { Text: I } = f, {
    EyeOutlined: A,
    EyeInvisibleOutlined: D,
    DeleteOutlined: M,
    ToolOutlined: ne
  } = z().antdIcons || {}, [F, G] = d(!1), [w, x] = d(!1), [k, K] = d(!1), [N, $] = d(""), [y, g] = d(!1), [P, J] = d(!1), q = e.transport === "streamable_http" || e.transport === "sse", Z = q ? "Remote" : "Local", C = e.oauth_status, p = Date.now() / 1e3, E = !!(C != null && C.authorized) && C.expires_at > p, j = !!(C != null && C.authorized) && C.expires_at <= p, ae = !!C, B = () => {
    $(JSON.stringify(e, null, 2)), g(!1), G(!0);
  }, Y = async () => {
    try {
      const H = JSON.parse(N), Q = [
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
      ], ce = {};
      for (const ee of Q)
        ee in H && (ce[ee] = H[ee]);
      await n(e.key, ce) && (G(!1), g(!1));
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
        onClick: B,
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
            b,
            { title: e.name },
            o.createElement(I, { strong: !0, style: { fontSize: 14, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" } }, e.name || e.key)
          ),
          o.createElement(
            "span",
            { style: { fontSize: 10, padding: "1px 6px", borderRadius: 4, background: q ? "#e6f4ff" : "#f9f0ff", color: q ? "#1677ff" : "#722ed1", flexShrink: 0 } },
            Z
          ),
          // OAuth status icons
          ae && j ? o.createElement("span", { style: { fontSize: 11, color: "#e67e22", flexShrink: 0 } }, "⚠") : null,
          ae && E ? o.createElement("span", { style: { fontSize: 11, color: "#27ae60", flexShrink: 0 } }, "✓") : null,
          ae && !E && !j ? o.createElement("span", { style: { fontSize: 11, color: "#7f8c8d", flexShrink: 0 } }, "🔒") : null
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
          h,
          {
            size: "small",
            icon: ne ? o.createElement(ne) : void 0,
            onClick: (H) => {
              H.stopPropagation(), K(!0);
            },
            style: { width: "100%" }
          },
          "工具与访问策略"
        ),
        // Secondary actions: oauth (remote only) + toggle + delete
        o.createElement(
          "div",
          { style: { display: "grid", gridTemplateColumns: q ? "1fr 1fr 1fr" : "1fr 1fr", gap: 8 } },
          q ? o.createElement(
            h,
            {
              size: "small",
              onClick: (H) => {
                H.stopPropagation(), J(!0);
              },
              style: {
                color: E ? "#27ae60" : j ? "#e67e22" : void 0,
                borderColor: E ? "#27ae60" : j ? "#e67e22" : void 0,
                background: E ? "rgba(39,174,96,0.06)" : j ? "rgba(230,126,34,0.06)" : void 0
              }
            },
            E ? "已授权" : j ? "已过期" : "授权"
          ) : null,
          o.createElement(
            h,
            {
              size: "small",
              icon: e.enabled ? D ? o.createElement(D) : void 0 : A ? o.createElement(A) : void 0,
              onClick: l
            },
            e.enabled ? "禁用" : "启用"
          ),
          o.createElement(
            h,
            {
              size: "small",
              danger: !0,
              icon: M ? o.createElement(M) : void 0,
              onClick: (H) => {
                H.stopPropagation(), x(!0);
              }
            },
            "删除"
          )
        )
      )
    ),
    // ── Delete Confirmation Modal ──
    o.createElement(
      _,
      {
        title: "确认删除",
        open: w,
        onOk: () => {
          x(!1), a();
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
      _,
      {
        title: `${e.name || e.key} - 配置`,
        open: F,
        onCancel: () => {
          G(!1), g(!1);
        },
        footer: o.createElement(
          "div",
          { style: { textAlign: "right" } },
          o.createElement(h, { onClick: () => {
            G(!1), g(!1);
          }, style: { marginRight: 8 } }, "取消"),
          y ? o.createElement(h, { type: "primary", onClick: Y }, "保存") : o.createElement(h, { type: "primary", onClick: () => g(!0) }, "编辑")
        ),
        width: 700
      },
      o.createElement(
        "div",
        { style: { marginBottom: 8, fontSize: 12, color: "#8c8c8c" } },
        "密钥类字段（如 API_KEY）可能已被后端脱敏，保存时不会覆盖脱敏值。"
      ),
      y ? o.createElement(S.TextArea, {
        value: N,
        onChange: (H) => $(H.target.value),
        autoSize: { minRows: 15, maxRows: 25 },
        style: { fontFamily: "Monaco, Courier New, monospace", fontSize: 13 }
      }) : o.createElement(
        "pre",
        { style: { backgroundColor: "#f5f5f5", padding: 16, borderRadius: 8, maxHeight: 400, overflow: "auto", fontSize: 13, fontFamily: "Monaco, Courier New, monospace" } },
        ie
      )
    ),
    // ── Access Modal (tools + access policy) ──
    o.createElement(Hl, {
      client: e,
      agentId: t,
      open: k,
      onClose: () => K(!1),
      onSave: s
    }),
    // ── OAuth Modal (remote clients only) ──
    q ? o.createElement(Wl, {
      client: e,
      agentId: t,
      open: P,
      onClose: () => J(!1),
      onAuthChanged: async () => {
        await (r == null ? void 0 : r());
      }
    }) : null
  );
}
const Rt = {
  reservoir_simulation: "油藏数值模拟",
  geological_modeling: "地质建模",
  well_log_analysis: "测井分析",
  production_engineering: "采油工程",
  post_processing: "后处理与可视化",
  multiphysics: "多物理场仿真"
}, aa = {
  reservoir_simulation: "🛢️",
  geological_modeling: "🏔️",
  well_log_analysis: "📡",
  production_engineering: "⚙️",
  post_processing: "📊",
  multiphysics: "🔬"
}, la = /* @__PURE__ */ new Set(["cmg", "comsol", "tnavigator", "eclipse", "intersect", "visage"]);
function sa(e) {
  return Qe(`/ugsci/engines/icon/${encodeURIComponent(e)}`);
}
function zn(e) {
  return Qe(`/ugsci/avatar/${encodeURIComponent(e)}`);
}
function In(e) {
  const t = e.map(encodeURIComponent).join(",");
  return Qe(`/ugsci/avatar/team/${t}`);
}
function Re({
  name: e,
  size: t = 32,
  borderRadius: l = "50%"
}) {
  const a = z().React, [n, s] = a.useState(0), r = n === 0 ? zn(e) : `${zn(e)}?_r=${n}`;
  return a.createElement("img", {
    src: r,
    alt: e,
    onError: () => {
      n < 1 && s(n + 1);
    },
    style: { width: t, height: t, borderRadius: l, objectFit: "cover", flexShrink: 0 }
  });
}
function Jt({
  members: e,
  size: t = 32,
  borderRadius: l = "50%"
}) {
  const a = z().React, [n, s] = a.useState(0);
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
async function Xl() {
  return re("/ugsci/engines/list");
}
async function Kl(e) {
  return re("/ugsci/engines/", {
    method: "POST",
    body: JSON.stringify(e)
  });
}
async function Vl(e, t) {
  return re(`/ugsci/engines/${encodeURIComponent(e)}`, {
    method: "PUT",
    body: JSON.stringify(t)
  });
}
async function ql(e) {
  return re(
    `/ugsci/engines/${encodeURIComponent(e)}`,
    { method: "DELETE" }
  );
}
async function Yl() {
  return re("/ugsci/engines/detect/refresh", {
    method: "POST"
  });
}
function Ql({
  engine: e,
  onClick: t
}) {
  const l = z().React, { Card: a, Tag: n, Typography: s } = z().antd, { Text: r } = s, o = e.status === "detected", d = aa[e.category] || "📦", u = la.has(e.id) ? l.createElement("img", {
    src: sa(e.id),
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
        Rt[e.category] || e.category
      ) : null,
      e.version ? l.createElement(
        n,
        { color: "blue", style: { fontSize: 11 } },
        `v${e.version}`
      ) : null,
      ...(e.modules || []).map(
        (b) => l.createElement(
          n,
          { key: b, color: "cyan", style: { fontSize: 10 } },
          b
        )
      )
    )
  );
}
function Zl() {
  const e = z().React, { useState: t, useEffect: l, useCallback: a, useMemo: n } = e, {
    Spin: s,
    Empty: r,
    Button: o,
    message: d,
    Row: c,
    Col: u,
    Drawer: b,
    Descriptions: _,
    Tag: S,
    Typography: h,
    Modal: f,
    Input: I,
    Select: A,
    Popconfirm: D,
    Space: M
  } = z().antd, {
    ReloadOutlined: ne,
    SearchOutlined: F,
    PlusOutlined: G,
    EditOutlined: w,
    DeleteOutlined: x,
    CopyOutlined: k,
    ExperimentOutlined: K
  } = z().antdIcons || {}, { Text: N, Paragraph: $ } = h, [y, g] = t([]), [P, J] = t(!0), [q, Z] = t(""), [C, p] = t(!1), [E, j] = t(null), [ae, B] = t(!1), [Y, ie] = t(null), [H, Q] = t({}), [ce, v] = t(!1), ee = a(async () => {
    J(!0);
    try {
      const le = await Xl();
      g(le.engines || []);
    } catch (le) {
      d.error(le.message || "加载引擎列表失败"), g([]);
    } finally {
      J(!1);
    }
  }, []);
  l(() => {
    ee();
  }, [ee]);
  const m = n(() => {
    if (!q.trim()) return y;
    const le = q.toLowerCase();
    return y.filter(
      (U) => {
        var T;
        return U.name.toLowerCase().includes(le) || U.vendor.toLowerCase().includes(le) || U.category.toLowerCase().includes(le) || ((T = U.description) == null ? void 0 : T.toLowerCase().includes(le));
      }
    );
  }, [y, q]);
  y.filter((le) => le.status === "detected").length;
  const X = a((le) => {
    navigator.clipboard.writeText(le).then(() => d.success("路径已复制")).catch(() => d.error("复制失败"));
  }, []), R = a(() => {
    ie(null), Q({
      name: "",
      vendor: "",
      version: "",
      executable_path: "",
      category: "",
      description: "",
      invocation_hint: ""
    }), B(!0);
  }, []), se = a((le) => {
    ie(le), Q({ ...le }), B(!0), p(!1);
  }, []), de = a(async () => {
    var le;
    if (!((le = H.name) != null && le.trim())) {
      d.warning("请输入引擎名称");
      return;
    }
    v(!0);
    try {
      Y ? (await Vl(Y.id, H), d.success("引擎已更新")) : (await Kl(H), d.success("引擎已添加")), B(!1), ee();
    } catch (U) {
      d.error(U.message || "保存失败");
    } finally {
      v(!1);
    }
  }, [H, Y, ee]), Ee = a(
    async (le) => {
      try {
        await ql(le), d.success("引擎已删除"), p(!1), ee();
      } catch (U) {
        d.error(U.message || "删除失败");
      }
    },
    [ee]
  ), ye = a(async () => {
    J(!0);
    try {
      const le = await Yl();
      g(le.engines || []), d.success("自动检测完成");
    } catch (le) {
      d.error(le.message || "检测失败");
    } finally {
      J(!1);
    }
  }, []), pe = a(
    (le, U, T) => {
      const V = H[U] || "";
      return e.createElement(
        "div",
        { style: { marginBottom: 12 } },
        e.createElement(
          N,
          { style: { fontSize: 13, display: "block", marginBottom: 4 } },
          le
        ),
        T != null && T.select ? e.createElement(A, {
          value: V || void 0,
          onChange: (oe) => Q((W) => ({ ...W, [U]: oe })),
          style: { width: "100%" },
          options: T.select.options,
          allowClear: !0,
          placeholder: `选择${le}`
        }) : T != null && T.textarea ? e.createElement(I.TextArea, {
          value: V,
          onChange: (oe) => Q((W) => ({ ...W, [U]: oe.target.value })),
          rows: 3,
          placeholder: `输入${le}`
        }) : e.createElement(I, {
          value: V,
          onChange: (oe) => Q((W) => ({ ...W, [U]: oe.target.value })),
          placeholder: `输入${le}`
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
      e.createElement(I, {
        placeholder: "搜索引擎名称、厂商...",
        prefix: F ? e.createElement(F) : void 0,
        value: q,
        onChange: (le) => Z(le.target.value),
        allowClear: !0,
        style: { maxWidth: 280 }
      }),
      e.createElement(
        o,
        {
          icon: ne ? e.createElement(ne) : void 0,
          onClick: ye,
          loading: P
        },
        "自动检测"
      ),
      e.createElement(
        o,
        {
          type: "primary",
          icon: G ? e.createElement(G) : void 0,
          onClick: R,
          style: Oe
        },
        "添加引擎"
      )
    ),
    // Content
    P ? e.createElement(
      "div",
      { style: { textAlign: "center", padding: 60 } },
      e.createElement(s, {
        size: "large",
        tip: "正在加载计算引擎..."
      })
    ) : m.length === 0 ? e.createElement(r, {
      description: q ? "无匹配引擎" : "暂无引擎，点击「添加引擎」开始"
    }) : e.createElement(
      c,
      { gutter: [12, 12], align: "stretch" },
      ...m.map(
        (le) => e.createElement(
          u,
          {
            key: le.id,
            xs: 24,
            sm: 12,
            md: 8,
            lg: 6,
            style: { display: "flex" }
          },
          e.createElement(Ql, {
            engine: le,
            onClick: () => {
              j(le), p(!0);
            }
          })
        )
      )
    ),
    // Detail drawer
    E ? e.createElement(
      b,
      {
        title: e.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 8 } },
          e.createElement(
            "span",
            { style: { display: "flex", alignItems: "center" } },
            la.has(E.id) ? e.createElement("img", {
              src: sa(E.id),
              alt: E.name,
              style: { width: 20, height: 20, objectFit: "contain" }
            }) : e.createElement(
              "span",
              { style: { fontSize: 18 } },
              aa[E.category] || "📦"
            )
          ),
          e.createElement("span", null, E.name)
        ),
        open: C,
        onClose: () => p(!1),
        width: 520,
        extra: e.createElement(
          M,
          null,
          e.createElement(
            o,
            {
              size: "small",
              icon: w ? e.createElement(w) : void 0,
              onClick: () => se(E)
            },
            "编辑"
          ),
          E.is_default ? null : e.createElement(
            D,
            {
              title: "确认删除此引擎？",
              description: E.name,
              onConfirm: () => Ee(E.id),
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
        _,
        { column: 1, bordered: !0, size: "small" },
        e.createElement(
          _.Item,
          { label: "引擎名称" },
          E.name
        ),
        e.createElement(
          _.Item,
          { label: "厂商" },
          E.vendor || "—"
        ),
        e.createElement(
          _.Item,
          { label: "分类" },
          E.category ? Rt[E.category] || E.category : "—"
        ),
        e.createElement(
          _.Item,
          { label: "状态" },
          e.createElement(
            S,
            {
              color: E.status === "detected" ? "success" : E.status === "not_found" ? "error" : "default"
            },
            E.status === "detected" ? "✅ 已检测" : E.status === "not_found" ? "❌ 路径无效" : "🔧 待配置"
          )
        ),
        e.createElement(
          _.Item,
          { label: "版本" },
          E.version || "—"
        ),
        E.executable_path ? e.createElement(
          _.Item,
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
              o,
              {
                size: "small",
                type: "text",
                icon: k ? e.createElement(k) : void 0,
                onClick: () => X(E.executable_path)
              }
            )
          )
        ) : null,
        E.install_dir ? e.createElement(
          _.Item,
          { label: "安装目录" },
          e.createElement(
            "code",
            { style: { fontSize: 12, wordBreak: "break-all" } },
            E.install_dir
          )
        ) : null,
        // Display detected modules with paths
        E.modules && E.modules.length > 0 ? e.createElement(
          _.Item,
          { label: "已检测模块" },
          e.createElement(
            "div",
            { style: { display: "flex", flexDirection: "column", gap: 4 } },
            ...E.modules.map(
              (le) => e.createElement(
                "div",
                {
                  key: le,
                  style: { display: "flex", alignItems: "center", gap: 8 }
                },
                e.createElement(
                  S,
                  { color: "cyan", style: { fontSize: 11 } },
                  le
                ),
                E.module_paths && E.module_paths[le] ? e.createElement(
                  "code",
                  { style: { fontSize: 11, wordBreak: "break-all" } },
                  E.module_paths[le]
                ) : null
              )
            )
          )
        ) : null,
        E.license_server ? e.createElement(
          _.Item,
          { label: "许可证服务器" },
          E.license_server
        ) : null,
        e.createElement(
          _.Item,
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
          N,
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
          S,
          { color: "blue" },
          "默认引擎"
        ) : E.is_custom ? e.createElement(
          S,
          { color: "purple" },
          "自定义引擎"
        ) : null
      )
    ) : null,
    // Add/Edit modal
    e.createElement(
      f,
      {
        title: Y ? "编辑引擎" : "添加计算引擎",
        open: ae,
        onOk: de,
        onCancel: () => B(!1),
        okText: Y ? "保存" : "添加",
        cancelText: "取消",
        confirmLoading: ce,
        width: 560
      },
      e.createElement(
        "div",
        { style: { maxHeight: 480, overflow: "auto", paddingRight: 8 } },
        pe("引擎名称 *", "name"),
        pe("厂商", "vendor"),
        pe("版本", "version"),
        pe("可执行文件路径", "executable_path"),
        pe("安装目录", "install_dir"),
        pe("分类", "category", {
          select: {
            options: Object.entries(Rt).map(([le, U]) => ({
              label: U,
              value: le
            }))
          }
        }),
        pe("描述", "description", { textarea: !0 }),
        pe("调用方式提示", "invocation_hint", { textarea: !0 }),
        pe("许可证服务器", "license_server")
      )
    )
  );
}
function es() {
  const e = z().React, { useState: t, useEffect: l, useCallback: a, useMemo: n } = e, {
    Spin: s,
    Empty: r,
    Input: o,
    Button: d,
    message: c,
    Row: u,
    Col: b,
    Tabs: _,
    Modal: S
  } = z().antd, {
    ReloadOutlined: h,
    PlusOutlined: f,
    SearchOutlined: I,
    ApiOutlined: A,
    RocketOutlined: D
  } = z().antdIcons || {}, { TextArea: M } = o, F = z().useSelectedAgent, G = F ? F() : null, w = (G == null ? void 0 : G.id) || "default", [x, k] = t([]), [K, N] = t(!0), [$, y] = t(""), [g, P] = t("mcp"), [J, q] = t(!1), [Z, C] = t(`{
  "mcpServers": {
    "example-client": {
      "command": "npx",
      "args": ["-y", "@example/mcp-server"],
      "env": {}
    }
  }
}`), [p, E] = t(!1), j = a(async () => {
    N(!0);
    try {
      const m = await Ua(w);
      k(m);
    } catch (m) {
      c.error(m.message || "加载 MCP 列表失败"), k([]);
    } finally {
      N(!1);
    }
  }, [w]);
  l(() => {
    j();
  }, [j]);
  const ae = a(
    async (m) => {
      try {
        await Na(w, m.key), c.success(m.enabled ? "已禁用" : "已启用"), j();
      } catch (X) {
        c.error(X.message || "切换状态失败");
      }
    },
    [w, j]
  ), B = a(async (m) => {
    try {
      await Da(w, m.key), c.success(`MCP「${m.key}」已删除`), j();
    } catch (X) {
      c.error(X.message || "删除失败");
    }
  }, [w, j]), Y = a(async () => {
    E(!0);
    try {
      const m = JSON.parse(Z), X = m.mcpServers || m, R = Object.entries(X);
      if (R.length === 0) {
        c.warning("未找到 MCP 客户端配置");
        return;
      }
      let se = !0;
      for (const [de, Ee] of R) {
        const ye = Ee, pe = ye.url ? "streamable_http" : "stdio", le = {
          name: ye.name || de,
          description: ye.description || "",
          enabled: !0,
          transport: pe,
          url: ye.url || "",
          command: ye.command || "",
          args: ye.args || [],
          env: ye.env || {},
          cwd: ye.cwd || "",
          headers: ye.headers || {}
        };
        try {
          await Fa(
            w,
            de,
            le
          );
        } catch {
          se = !1;
        }
      }
      se && (c.success("MCP 客户端已创建"), q(!1), j());
    } catch (m) {
      m instanceof SyntaxError ? c.error("JSON 格式错误：" + m.message) : c.error(m.message || "创建 MCP 失败");
    } finally {
      E(!1);
    }
  }, [Z, w, j]), ie = n(() => {
    if (!$.trim()) return x;
    const m = $.toLowerCase();
    return x.filter(
      (X) => {
        var R;
        return X.name.toLowerCase().includes(m) || X.key.toLowerCase().includes(m) || ((R = X.description) == null ? void 0 : R.toLowerCase().includes(m)) || X.transport.toLowerCase().includes(m);
      }
    );
  }, [x, $]), H = x.filter((m) => m.enabled).length, Q = x.reduce((m, X) => {
    var R;
    return m + (((R = X.tools) == null ? void 0 : R.length) || 0);
  }, 0), ce = (m) => {
    window.history.pushState({}, "", m), window.dispatchEvent(new PopStateEvent("popstate"));
  }, v = e.createElement(
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
        prefix: I ? e.createElement(I) : void 0,
        value: $,
        onChange: (m) => y(m.target.value),
        allowClear: !0,
        style: { maxWidth: 400 }
      }),
      e.createElement(
        d,
        {
          type: "primary",
          icon: f ? e.createElement(f) : void 0,
          onClick: () => q(!0),
          style: Oe
        },
        "添加 MCP"
      ),
      e.createElement(
        d,
        {
          icon: A ? e.createElement(A) : void 0,
          onClick: () => ce("/mcp")
        },
        "前往 MCP 管理"
      )
    ),
    K ? e.createElement(
      "div",
      { style: { textAlign: "center", padding: 60 } },
      e.createElement(s, { size: "large" })
    ) : ie.length === 0 ? e.createElement(r, {
      description: $ ? "未找到匹配的能力" : "暂无 MCP 客户端，点击「添加 MCP」创建"
    }) : e.createElement(
      u,
      { gutter: [12, 12], align: "stretch" },
      ...ie.map(
        (m) => e.createElement(
          b,
          {
            key: m.key,
            xs: 24,
            sm: 12,
            md: 8,
            lg: 6,
            style: { display: "flex" }
          },
          e.createElement(Jl, {
            mcp: m,
            agentId: w,
            onToggle: (X) => {
              X.stopPropagation(), ae(m);
            },
            onDelete: () => {
              B(m);
            },
            onUpdate: async (X, R) => {
              try {
                return await Ga(w, X, R), c.success("MCP 配置已更新"), j(), !0;
              } catch (se) {
                return c.error(se.message || "更新 MCP 失败"), !1;
              }
            },
            onUpdatePolicy: async (X, R) => {
              try {
                return await Ja(w, X, R), c.success("访问策略已保存"), j(), !0;
              } catch (se) {
                return c.error(se.message || "保存访问策略失败"), !1;
              }
            },
            onRefresh: async () => {
              j();
            }
          })
        )
      )
    )
  ), ee = [
    {
      key: "mcp",
      label: e.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        A ? e.createElement(A, { style: { fontSize: 14 } }) : null,
        "MCP 客户端"
      ),
      children: v
    },
    {
      key: "software",
      label: e.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        D ? e.createElement(D, { style: { fontSize: 14 } }) : null,
        "计算引擎"
      ),
      children: e.createElement(Zl)
    }
  ];
  return e.createElement(
    "div",
    { style: { padding: 24 } },
    e.createElement(Ct, {
      title: "工具",
      subtitle: `MCP: ${x.length} 个客户端（${H} 个启用）· ${Q} 个工具`,
      extra: e.createElement(
        e.Fragment,
        null,
        e.createElement(
          d,
          {
            icon: h ? e.createElement(h) : void 0,
            onClick: () => {
              Ze(), j();
            },
            loading: K
          },
          "刷新"
        )
      )
    }),
    e.createElement(_, {
      items: ee,
      activeKey: g,
      onChange: (m) => P(m)
    }),
    // ── Create MCP Modal (mirror console /mcp JSON import) ──
    e.createElement(
      S,
      {
        title: "添加 MCP 客户端 (JSON)",
        open: J,
        onCancel: () => q(!1),
        onOk: Y,
        confirmLoading: p,
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
        value: Z,
        onChange: (m) => C(m.target.value),
        autoSize: { minRows: 12, maxRows: 20 },
        style: { fontFamily: "Monaco, Courier New, monospace", fontSize: 13 }
      })
    )
  );
}
function ts({
  agentId: e,
  agentName: t,
  onNavigate: l
}) {
  const a = z().React, { useState: n, useEffect: s, useCallback: r } = a, {
    Spin: o,
    Empty: d,
    Button: c,
    Row: u,
    Col: b,
    Card: _,
    Tag: S,
    Checkbox: h,
    Modal: f,
    Typography: I,
    Drawer: A,
    Descriptions: D,
    message: M
  } = z().antd, {
    ReloadOutlined: ne,
    ThunderboltOutlined: F,
    SettingOutlined: G,
    CheckSquareOutlined: w,
    EyeOutlined: x,
    EyeInvisibleOutlined: k,
    DeleteOutlined: K,
    CloseOutlined: N
  } = z().antdIcons || {}, { Text: $, Paragraph: y } = I, [g, P] = n([]), [J, q] = n(!0), [Z, C] = n(!1), [p, E] = n(null), [j, ae] = n(!1), [B, Y] = n(
    /* @__PURE__ */ new Set()
  ), [ie, H] = n(!1), [Q, ce] = n(null), [v, ee] = n(!1), m = r(async () => {
    if (e) {
      q(!0);
      try {
        const T = await wt(e);
        P(T);
      } catch (T) {
        M.error(T.message || "加载技能失败"), P([]);
      } finally {
        q(!1);
      }
    }
  }, [e]);
  s(() => {
    m();
  }, [m]);
  const X = (T) => {
    Y((V) => {
      const oe = new Set(V);
      return oe.has(T) ? oe.delete(T) : oe.add(T), oe;
    });
  }, R = () => Y(/* @__PURE__ */ new Set()), se = () => Y(new Set(g.map((T) => T.name))), de = () => {
    j ? (R(), ae(!1)) : ae(!0);
  }, Ee = async () => {
    const T = Array.from(B);
    if (T.length !== 0) {
      H(!0);
      try {
        const { results: V } = await ol(e, T), oe = Object.entries(V).filter(
          ([, ue]) => ue.success === !1
        ), W = T.length - oe.length;
        oe.length > 0 ? M.warning(
          `批量启用完成：成功 ${W} 个，失败 ${oe.length} 个`
        ) : M.success(`成功启用 ${T.length} 个技能`), R(), await m();
      } catch (V) {
        M.error(V.message || "批量启用失败");
      } finally {
        H(!1);
      }
    }
  }, ye = async () => {
    const T = Array.from(B);
    if (T.length !== 0) {
      H(!0);
      try {
        const { results: V } = await rl(e, T), oe = Object.entries(V).filter(
          ([, ue]) => ue.success === !1
        ), W = T.length - oe.length;
        oe.length > 0 ? M.warning(
          `批量停用完成：成功 ${W} 个，失败 ${oe.length} 个`
        ) : M.success(`成功停用 ${T.length} 个技能`), R(), await m();
      } catch (V) {
        M.error(V.message || "批量停用失败");
      } finally {
        H(!1);
      }
    }
  }, pe = () => {
    const T = Array.from(B);
    T.length !== 0 && f.confirm({
      title: `确认删除 ${T.length} 个技能？`,
      content: "删除后技能将从当前专家工作区移除，此操作不可撤销。技能池中的原始技能不受影响。",
      okText: "确认删除",
      cancelText: "取消",
      okButtonProps: { danger: !0 },
      onOk: async () => {
        H(!0);
        try {
          const { results: V } = await il(e, T), oe = Object.entries(V).filter(
            ([, ue]) => ue.success === !1
          ), W = T.length - oe.length;
          oe.length > 0 ? M.warning(
            `批量删除完成：成功 ${W} 个，失败 ${oe.length} 个`
          ) : M.success(`成功删除 ${T.length} 个技能`), R(), await m();
        } catch (V) {
          M.error(V.message || "批量删除失败");
        } finally {
          H(!1);
        }
      }
    });
  }, le = async (T) => {
    ee(!0);
    try {
      T.enabled === !1 ? (await Dn(e, T.name), M.success(`已启用技能「${T.name}」`)) : (await Hn(e, T.name), M.success(`已禁用技能「${T.name}」`)), await m();
    } catch (V) {
      M.error(V.message || "操作失败");
    } finally {
      ee(!1);
    }
  }, U = (T) => {
    f.confirm({
      title: `确认删除技能「${T.name}」？`,
      content: "删除后技能将从当前专家工作区移除，此操作不可撤销。技能池中的原始技能不受影响。",
      okText: "确认删除",
      cancelText: "取消",
      okButtonProps: { danger: !0 },
      onOk: async () => {
        ee(!0);
        try {
          await Gt(e, T.name), M.success(`已删除技能「${T.name}」`), await m();
        } catch (V) {
          M.error(V.message || "删除失败");
        } finally {
          ee(!1);
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
        $,
        { type: "secondary", style: { fontSize: 13 } },
        j ? `已选择 ${B.size} / ${g.length} 个技能` : `共 ${g.length} 个技能`
      ),
      a.createElement(
        "div",
        { style: { display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" } },
        j ? a.createElement(
          a.Fragment,
          null,
          a.createElement(
            c,
            { size: "small", onClick: se },
            "全选"
          ),
          a.createElement(
            c,
            {
              size: "small",
              icon: N ? a.createElement(N) : void 0,
              onClick: R
            },
            "取消选择"
          ),
          a.createElement(
            c,
            {
              size: "small",
              type: "default",
              icon: x ? a.createElement(x) : void 0,
              disabled: B.size === 0 || ie,
              loading: ie,
              onClick: Ee
            },
            "批量启用"
          ),
          a.createElement(
            c,
            {
              size: "small",
              danger: !0,
              icon: k ? a.createElement(k) : void 0,
              disabled: B.size === 0 || ie,
              loading: ie,
              onClick: ye
            },
            "批量停用"
          ),
          a.createElement(
            c,
            {
              size: "small",
              danger: !0,
              icon: K ? a.createElement(K) : void 0,
              disabled: B.size === 0 || ie,
              loading: ie,
              onClick: pe
            },
            `删除 (${B.size})`
          ),
          a.createElement(
            c,
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
            c,
            {
              size: "small",
              icon: w ? a.createElement(w) : void 0,
              onClick: de,
              disabled: g.length === 0
            },
            "批量管理"
          ),
          a.createElement(
            c,
            {
              icon: ne ? a.createElement(ne) : void 0,
              onClick: () => {
                Ze(), m();
              }
            },
            "刷新"
          )
        )
      )
    ),
    J ? a.createElement(
      "div",
      { style: { textAlign: "center", padding: 60 } },
      a.createElement(o, { size: "large" })
    ) : g.length === 0 ? a.createElement(d, {
      description: "当前智能体未加载任何技能"
    }) : a.createElement(
      u,
      { gutter: [12, 12] },
      ...g.map(
        (T) => a.createElement(
          b,
          { key: T.name, xs: 24, sm: 12, md: 8, lg: 6 },
          a.createElement(
            _,
            {
              hoverable: !0,
              size: "small",
              style: {
                cursor: j ? "default" : "pointer",
                height: "100%",
                position: "relative",
                borderColor: j && B.has(T.name) ? "#0072f5" : void 0,
                borderWidth: j && B.has(T.name) ? 2 : 1
              },
              onClick: () => {
                j ? X(T.name) : (E(T), C(!0));
              },
              onMouseEnter: () => {
                j || ce(T.name);
              },
              onMouseLeave: () => ce(null)
            },
            j ? a.createElement(
              "div",
              {
                style: {
                  position: "absolute",
                  top: 8,
                  right: 8,
                  zIndex: 1
                },
                onClick: (V) => {
                  V.stopPropagation(), X(T.name);
                }
              },
              a.createElement(h, {
                checked: B.has(T.name)
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
              T.emoji ? a.createElement(
                "span",
                { style: { fontSize: 18 } },
                T.emoji
              ) : a.createElement(
                "span",
                { style: { fontSize: 18 } },
                "⚡"
              ),
              a.createElement(
                $,
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
                T.name
              ),
              T.enabled === !1 ? a.createElement(
                S,
                { color: "default", style: { fontSize: 10 } },
                "已禁用"
              ) : a.createElement(
                S,
                { color: "green", style: { fontSize: 10 } },
                "已启用"
              )
            ),
            T.description ? a.createElement(
              y,
              {
                type: "secondary",
                style: { fontSize: 11, margin: 0, lineHeight: 1.4 },
                ellipsis: { rows: 2 }
              },
              T.description
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
              T.version_text ? a.createElement(
                S,
                { style: { fontSize: 10 } },
                `v${T.version_text}`
              ) : null,
              ...(T.tags || []).slice(0, 3).map(
                (V, oe) => a.createElement(
                  S,
                  { key: oe, color: "blue", style: { fontSize: 10 } },
                  V
                )
              )
            ),
            // Hover action footer (not in batch mode)
            !j && Q === T.name ? a.createElement(
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
                c,
                {
                  size: "small",
                  type: "default",
                  icon: T.enabled === !1 ? x ? a.createElement(x) : void 0 : k ? a.createElement(k) : void 0,
                  disabled: v,
                  onClick: (V) => {
                    V.stopPropagation(), le(T);
                  }
                },
                T.enabled === !1 ? "启用" : "禁用"
              ),
              a.createElement(
                c,
                {
                  size: "small",
                  danger: !0,
                  icon: K ? a.createElement(K) : void 0,
                  disabled: v,
                  onClick: (V) => {
                    V.stopPropagation(), U(T);
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
    p ? a.createElement(
      A,
      {
        title: a.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 8 } },
          a.createElement(
            "span",
            { style: { fontSize: 18 } },
            p.emoji || "⚡"
          ),
          a.createElement("span", null, p.name)
        ),
        open: Z,
        onClose: () => C(!1),
        width: 520,
        extra: a.createElement(
          c,
          {
            type: "primary",
            size: "small",
            icon: G ? a.createElement(G) : void 0,
            onClick: () => l("/skills")
          },
          "管理技能"
        )
      },
      a.createElement(
        D,
        { column: 1, bordered: !0, size: "small" },
        a.createElement(
          D.Item,
          { label: "技能名称" },
          p.name
        ),
        a.createElement(
          D.Item,
          { label: "描述" },
          p.description || "-"
        ),
        p.version_text ? a.createElement(
          D.Item,
          { label: "版本" },
          p.version_text
        ) : null,
        a.createElement(
          D.Item,
          { label: "来源" },
          p.source || "-"
        ),
        a.createElement(
          D.Item,
          { label: "状态" },
          p.enabled === !1 ? "已禁用" : "已启用"
        ),
        p.installed_from ? a.createElement(
          D.Item,
          { label: "安装来源" },
          p.installed_from
        ) : null
      ),
      // Tags
      p.tags && p.tags.length > 0 ? a.createElement(
        "div",
        { style: { marginTop: 16 } },
        a.createElement(
          $,
          {
            strong: !0,
            style: { display: "block", marginBottom: 8 }
          },
          "标签"
        ),
        a.createElement(
          "div",
          { style: { display: "flex", flexWrap: "wrap", gap: 4 } },
          ...p.tags.map(
            (T, V) => a.createElement(S, { key: V, color: "blue" }, T)
          )
        )
      ) : null,
      // Skill content preview
      p.content ? a.createElement(
        "div",
        { style: { marginTop: 16 } },
        a.createElement(
          $,
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
          p.content.slice(0, 2e3) + (p.content.length > 2e3 ? `

... (内容已截断)` : "")
        )
      ) : null
    ) : null
  );
}
function ns({
  poolSkills: e,
  workspaceSkills: t,
  agents: l,
  loading: a,
  onReload: n,
  agentId: s,
  agentName: r
}) {
  const o = z().React, { useState: d, useMemo: c, useCallback: u } = o, {
    Spin: b,
    Empty: _,
    Input: S,
    Button: h,
    Row: f,
    Col: I,
    Card: A,
    Tag: D,
    Typography: M,
    Drawer: ne,
    Descriptions: F,
    List: G,
    Modal: w,
    message: x
  } = z().antd, {
    ReloadOutlined: k,
    SearchOutlined: K,
    DownloadOutlined: N,
    ThunderboltOutlined: $,
    DeleteOutlined: y,
    PlusOutlined: g
  } = z().antdIcons || {}, { Text: P, Paragraph: J } = M, [q, Z] = d(""), [C, p] = d(!1), [E, j] = d(null), [ae, B] = d([]), [Y, ie] = d(!1), [H, Q] = d(24), [ce, v] = d(null), [ee, m] = d(!1), X = c(() => {
    if (!q.trim()) return e;
    const U = q.toLowerCase();
    return e.filter(
      (T) => {
        var V, oe;
        return T.name.toLowerCase().includes(U) || ((V = T.description) == null ? void 0 : V.toLowerCase().includes(U)) || ((oe = T.tags) == null ? void 0 : oe.some((W) => W.toLowerCase().includes(U)));
      }
    );
  }, [e, q]), R = c(
    () => X.slice(0, H),
    [X, H]
  ), se = u((U) => {
    Z(U), Q(24);
  }, []), de = u(
    (U) => {
      const T = [];
      for (const V of t)
        if (V.skills.some((oe) => oe.name === U)) {
          const oe = l.find((W) => W.id === V.agent_id);
          T.push((oe == null ? void 0 : oe.name) || V.agent_name || V.agent_id);
        }
      return T;
    },
    [t, l]
  ), Ee = u(
    async (U) => {
      if (j(U), B(de(U.name)), p(!0), !U.content) {
        ie(!0);
        try {
          const T = await ja(U.name);
          j({ ...U, content: T });
        } catch {
        } finally {
          ie(!1);
        }
      }
    },
    [de]
  ), ye = async (U) => {
    m(!0);
    try {
      await Ft(s, U.name), x.success(
        `已将技能「${U.name}」加载到当前专家「${r}」`
      ), n();
    } catch (T) {
      x.error(T.message || "加载技能失败");
    } finally {
      m(!1);
    }
  }, pe = (U) => {
    if (U.protected) {
      x.warning("内置技能不可删除");
      return;
    }
    w.confirm({
      title: `确认从技能池删除「${U.name}」？`,
      content: "删除后所有已安装此技能的专家将不受影响，但技能池中将不再包含此技能。此操作不可撤销。",
      okText: "确认删除",
      cancelText: "取消",
      okButtonProps: { danger: !0 },
      onOk: async () => {
        m(!0);
        try {
          await ml(U.name), x.success(`已从技能池删除「${U.name}」`), n();
        } catch (T) {
          x.error(T.message || "删除失败");
        } finally {
          m(!1);
        }
      }
    });
  }, le = (U) => {
    window.history.pushState({}, "", U), window.dispatchEvent(new PopStateEvent("popstate"));
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
        prefix: K ? o.createElement(K) : void 0,
        value: q,
        onChange: (U) => se(U.target.value),
        allowClear: !0,
        style: { maxWidth: 400 }
      }),
      o.createElement(
        "div",
        { style: { display: "flex", gap: 8 } },
        o.createElement(
          h,
          {
            icon: k ? o.createElement(k) : void 0,
            onClick: n,
            loading: a,
            size: "small"
          },
          "刷新"
        ),
        o.createElement(
          h,
          {
            type: "primary",
            icon: N ? o.createElement(N) : void 0,
            onClick: () => le("/skill-pool"),
            size: "small",
            style: Oe
          },
          "管理技能池"
        )
      )
    ),
    a ? o.createElement(
      "div",
      { style: { textAlign: "center", padding: 60 } },
      o.createElement(b, { size: "large" })
    ) : X.length === 0 ? o.createElement(_, {
      description: q ? "未找到匹配的技能" : "技能池为空"
    }) : o.createElement(
      o.Fragment,
      null,
      o.createElement(
        f,
        { gutter: [12, 12] },
        ...R.map(
          (U) => o.createElement(
            I,
            { key: U.name, xs: 24, sm: 12, md: 8, lg: 6 },
            o.createElement(
              A,
              {
                hoverable: !0,
                size: "small",
                style: { cursor: "pointer", height: "100%" },
                onClick: () => Ee(U),
                onMouseEnter: () => v(U.name),
                onMouseLeave: () => v(null)
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
                U.emoji ? o.createElement(
                  "span",
                  { style: { fontSize: 18 } },
                  U.emoji
                ) : o.createElement(
                  "span",
                  { style: { fontSize: 18 } },
                  "⚡"
                ),
                o.createElement(
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
                  U.name
                ),
                U.protected ? o.createElement(
                  D,
                  { color: "gold", style: { fontSize: 10 } },
                  "内置"
                ) : null
              ),
              U.description ? o.createElement(
                J,
                {
                  type: "secondary",
                  style: { fontSize: 11, margin: 0, lineHeight: 1.4 },
                  ellipsis: { rows: 2 }
                },
                U.description
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
                U.version_text ? o.createElement(
                  D,
                  { style: { fontSize: 10 } },
                  `v${U.version_text}`
                ) : null,
                ...(U.tags || []).slice(0, 3).map(
                  (T, V) => o.createElement(
                    D,
                    { key: V, color: "cyan", style: { fontSize: 10 } },
                    T
                  )
                )
              ),
              // Hover action footer
              ce === U.name ? o.createElement(
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
                  h,
                  {
                    size: "small",
                    type: "primary",
                    icon: g ? o.createElement(g) : void 0,
                    disabled: ee,
                    onClick: (T) => {
                      T.stopPropagation(), ye(U);
                    }
                  },
                  "加载到当前Agent"
                ),
                o.createElement(
                  h,
                  {
                    size: "small",
                    danger: !0,
                    icon: y ? o.createElement(y) : void 0,
                    disabled: ee || U.protected,
                    onClick: (T) => {
                      T.stopPropagation(), pe(U);
                    }
                  },
                  "删除"
                )
              ) : null
            )
          )
        ),
        // Load more button
        R.length < X.length ? o.createElement(
          "div",
          { style: { textAlign: "center", marginTop: 16 } },
          o.createElement(
            h,
            {
              onClick: () => Q((U) => U + 24),
              size: "small"
            },
            `加载更多 (剩余 ${X.length - R.length} 个)`
          )
        ) : null
      )
    ),
    // Skill detail drawer
    E ? o.createElement(
      ne,
      {
        title: o.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 8 } },
          o.createElement(
            "span",
            { style: { fontSize: 18 } },
            E.emoji || "⚡"
          ),
          o.createElement("span", null, E.name)
        ),
        open: C,
        onClose: () => p(!1),
        width: 520,
        extra: o.createElement(
          h,
          {
            type: "primary",
            size: "small",
            icon: $ ? o.createElement($) : void 0,
            onClick: () => le("/skills")
          },
          "管理技能"
        )
      },
      o.createElement(
        F,
        { column: 1, bordered: !0, size: "small" },
        o.createElement(
          F.Item,
          { label: "技能名称" },
          E.name
        ),
        o.createElement(
          F.Item,
          { label: "描述" },
          E.description || "-"
        ),
        E.version_text ? o.createElement(
          F.Item,
          { label: "版本" },
          E.version_text
        ) : null,
        o.createElement(
          F.Item,
          { label: "来源" },
          E.source || "-"
        ),
        o.createElement(
          F.Item,
          { label: "受保护" },
          E.protected ? "是（内置）" : "否"
        ),
        E.sync_status ? o.createElement(
          F.Item,
          { label: "同步状态" },
          E.sync_status
        ) : null,
        E.installed_from ? o.createElement(
          F.Item,
          { label: "安装来源" },
          E.installed_from
        ) : null
      ),
      // Tags
      E.tags && E.tags.length > 0 ? o.createElement(
        "div",
        { style: { marginTop: 16 } },
        o.createElement(
          P,
          {
            strong: !0,
            style: { display: "block", marginBottom: 8 }
          },
          "标签"
        ),
        o.createElement(
          "div",
          { style: { display: "flex", flexWrap: "wrap", gap: 4 } },
          ...E.tags.map(
            (U, T) => o.createElement(D, { key: T, color: "cyan" }, U)
          )
        )
      ) : null,
      // Installed agents
      o.createElement(
        "div",
        { style: { marginTop: 16 } },
        o.createElement(
          P,
          { strong: !0, style: { display: "block", marginBottom: 8 } },
          `已安装此技能的专家 (${ae.length})`
        ),
        ae.length > 0 ? o.createElement(G, {
          size: "small",
          dataSource: ae,
          renderItem: (U) => o.createElement(
            G.Item,
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
              o.createElement(Re, { name: U, size: 20 }),
              o.createElement(
                P,
                { style: { fontSize: 13 } },
                U
              )
            )
          )
        }) : o.createElement(
          P,
          { type: "secondary", style: { fontSize: 12 } },
          "暂无专家安装此技能"
        )
      ),
      // Skill content preview (lazy-loaded)
      Y ? o.createElement(
        "div",
        { style: { marginTop: 16, textAlign: "center" } },
        o.createElement(b, { size: "small" })
      ) : E.content ? o.createElement(
        "div",
        { style: { marginTop: 16 } },
        o.createElement(
          P,
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
          E.content.slice(0, 2e3) + (E.content.length > 2e3 ? `

... (内容已截断)` : "")
        )
      ) : null
    ) : null
  );
}
function as() {
  const e = z().React, { useState: t, useEffect: l, useCallback: a, useMemo: n } = e, { Tabs: s, message: r } = z().antd, { ThunderboltOutlined: o, AppstoreOutlined: d } = z().antdIcons || {}, u = z().useSelectedAgent, b = u ? u() : null, _ = (b == null ? void 0 : b.id) || "default", [S, h] = t([]), [f, I] = t([]), [A, D] = t([]), [M, ne] = t(!0), [F, G] = t("agent-skills"), w = a(async () => {
    ne(!0);
    try {
      const [N, $, y] = await Promise.all([
        Nt(!0),
        Bt(),
        Ba()
      ]);
      I(N), h($), D(y);
    } catch (N) {
      r.error(N.message || "加载技能列表失败"), I([]);
    } finally {
      ne(!1);
    }
  }, []);
  l(() => {
    w();
  }, [w]);
  const x = n(() => {
    const N = S.find(($) => $.id === _);
    return (N == null ? void 0 : N.name) || _;
  }, [S, _]), k = (N) => {
    window.history.pushState({}, "", N), window.dispatchEvent(new PopStateEvent("popstate"));
  }, K = [
    {
      key: "agent-skills",
      label: e.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        o ? e.createElement(o, { style: { fontSize: 14 } }) : null,
        "当前Agent加载技能"
      ),
      children: e.createElement(ts, {
        agentId: _,
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
      children: e.createElement(ns, {
        poolSkills: f,
        workspaceSkills: A,
        agents: S,
        loading: M,
        onReload: w,
        agentId: _,
        agentName: x
      })
    }
  ];
  return e.createElement(
    "div",
    { style: { padding: 24 } },
    e.createElement(Ct, {
      title: "技能",
      subtitle: `技能池共 ${f.length} 个技能 · 当前智能体：${x}`
    }),
    e.createElement(s, {
      items: K,
      activeKey: F,
      onChange: (N) => G(N)
    })
  );
}
const ht = "ugsci.market.githubSources", On = "https://github.com/anthropics/skills/tree/main/skills", oa = "https://ugsci-awesome-tools.oss-cn-beijing.aliyuncs.com", ls = `${oa}/skills`;
function ot(e) {
  const t = e.replace(/^\/+/, "");
  return Qe(`/plugins/oss-proxy?path=${encodeURIComponent(t)}`);
}
async function Xt(e) {
  const t = e.replace(/^\/+/, ""), l = await fetch(ot(t));
  if (!l.ok)
    throw new Error(`OSS fetch failed (${l.status}): ${t}`);
  return await l.json();
}
function rt(e) {
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
function ss(e) {
  var n, s;
  const t = {};
  if (e.env && e.env.length > 0)
    for (const r of e.env)
      t[r] = `your-${r.toLowerCase().replace(/_/g, "-")}`;
  let l = "🔌";
  const a = (e.icon || "").toLowerCase();
  return a.includes("folder") ? l = "📁" : a.includes("git") ? l = "🌿" : a.includes("github") ? l = "🐙" : a.includes("database") || a.includes("postgres") || a.includes("sqlite") ? l = "🗄️" : a.includes("search") || a.includes("brave") ? l = "🔍" : a.includes("browser") || a.includes("puppeteer") ? l = "🎭" : a.includes("memory") || a.includes("brain") ? l = "🧠" : a.includes("file") || a.includes("fetch") ? l = "🌐" : a.includes("slack") ? l = "💬" : a.includes("google") ? l = "📁" : a.includes("notion") ? l = "📝" : a.includes("jupyter") ? l = "📊" : a.includes("science") || a.includes("flask") ? l = "🔬" : a.includes("book") || a.includes("arxiv") ? l = "📚" : a.includes("patent") && (l = "📜"), {
    id: e.id,
    name: e.name,
    emoji: l,
    iconUrl: e.icon_url ? ot(e.icon_url) : void 0,
    category: e.category ? rt(e.category) : "",
    description: e.description,
    transport: e.transport || "stdio",
    command: ((n = e.config) == null ? void 0 : n.command) || "",
    args: ((s = e.config) == null ? void 0 : s.args) || [],
    env: Object.keys(t).length > 0 ? t : void 0
  };
}
const ra = "ugsci.market.mcpSources", ia = "ugsci.market.expertSources";
function ca(e, t) {
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
function ma(e, t) {
  try {
    localStorage.setItem(e, JSON.stringify(t));
  } catch {
  }
}
function os() {
  return ca(ra, "mcp");
}
function gt(e) {
  ma(ra, e);
}
function rs() {
  return ca(ia, "expert");
}
function ft(e) {
  ma(ia, e);
}
function da(e) {
  try {
    const t = new URL(e.trim()), l = t.hostname.toLowerCase();
    let a;
    if (l === "github.com" || l === "www.github.com")
      a = "github";
    else if (l === "gitee.com" || l === "www.gitee.com")
      a = "gitee";
    else
      return null;
    const n = t.pathname.split("/").filter((c) => c.length > 0);
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
function ua(e, t, l, a = "github") {
  return a === "oss" ? `oss:${e}/${l || "/"}` : `${a}:${e}/${t}:${l || "/"}`;
}
function is(e) {
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
function cs() {
  try {
    const e = localStorage.getItem(ht);
    if (!e) {
      const a = [], n = da(On);
      return n && a.push({
        id: ua(
          n.owner,
          n.repo,
          n.skillsPath,
          n.platform
        ),
        url: On,
        label: n.label,
        owner: n.owner,
        repo: n.repo,
        ref: n.ref,
        skillsPath: n.skillsPath,
        enabled: !1,
        platform: n.platform
      }), localStorage.setItem(ht, JSON.stringify(a)), a;
    }
    const t = JSON.parse(e);
    if (!Array.isArray(t)) return [];
    const l = t.filter(
      (a) => a && typeof a.id == "string" && (typeof a.owner == "string" || a.platform === "oss") && !(a.platform === "oss" && a.url === ls)
    ).map((a) => ({
      ...a,
      platform: a.platform || "github",
      owner: a.owner || "",
      repo: a.repo || "",
      ref: a.ref || "",
      skillsPath: a.skillsPath || ""
    }));
    return l.length !== t.length && localStorage.setItem(
      ht,
      JSON.stringify(l)
    ), l;
  } catch {
    return [];
  }
}
function yt(e) {
  try {
    localStorage.setItem(
      ht,
      JSON.stringify(e)
    );
  } catch {
  }
}
function ms(e) {
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
async function ds(e) {
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
    (c) => c.type === "dir" && c.name
  );
  return await Promise.all(
    o.map(async (c) => {
      const u = e.skillsPath ? e.skillsPath + "/" : "", b = t ? `https://gitee.com/${e.owner}/${e.repo}/raw/${e.ref}/${u}${c.name}/SKILL.md` : `https://raw.githubusercontent.com/${e.owner}/${e.repo}/${e.ref}/${u}${c.name}/SKILL.md`, _ = t ? `https://gitee.com/${e.owner}/${e.repo}/tree/${e.ref}/${u}${c.name}` : `https://github.com/${e.owner}/${e.repo}/tree/${e.ref}/${u}${c.name}`, S = {
        sourceId: e.id,
        sourceLabel: e.label,
        name: c.name,
        description: "",
        source_url: _,
        html_url: _,
        version: null,
        author: null
      };
      try {
        const h = {};
        t && e.accessToken && (h.Authorization = `token ${e.accessToken}`);
        const f = await fetch(b, {
          headers: h
        });
        if (!f.ok) return S;
        const I = await f.text(), A = ms(I);
        return {
          ...S,
          name: A.name || c.name,
          description: A.description || "",
          version: A.version || null,
          author: A.author || null
        };
      } catch {
        return S;
      }
    })
  );
}
async function us(e) {
  const t = is(e.url);
  if (!t)
    throw new Error(`Invalid OSS URL: ${e.url}`);
  const { endpoint: l, prefix: a } = t, n = a.split("/").map(encodeURIComponent).join("/"), s = ot(`${n}/manifest.json`), r = await fetch(s);
  if (!r.ok)
    throw new Error(
      `无法获取技能列表: manifest.json (${r.status})`
    );
  const o = await r.json(), d = [];
  if (o && o.tag_groups && typeof o.tag_groups == "object")
    for (const [b, _] of Object.entries(o.tag_groups))
      Array.isArray(_) && d.push({
        id: b,
        label: rt(b),
        tags: _
      });
  const c = [];
  function u(b, _) {
    for (const S of b) {
      if (S.type === "collection" && Array.isArray(S.children)) {
        u(S.children, S.name);
        continue;
      }
      const h = S.path || S.name || "";
      if (!h) continue;
      const f = h.split("/").map(encodeURIComponent).join("/"), I = `${l}/${n}/${f}`;
      let A = null;
      if (S.metadata) {
        const M = S.metadata.match(/version:\s*"?([\d.]+)"?/);
        M && (A = M[1]);
      }
      const D = _ ? `${e.label}/${_}` : e.label;
      c.push({
        sourceId: e.id,
        sourceLabel: e.label,
        sourcePath: D,
        name: S.name || h.split("/").pop() || h,
        description: S.description || "",
        source_url: I,
        html_url: I,
        version: A,
        author: null,
        tag: S.tag || void 0,
        isOfficial: !0
      });
    }
  }
  if (Array.isArray(o) ? u(
    o.map(
      (b) => typeof b == "string" ? { name: b, path: b } : b
    )
  ) : o && Array.isArray(o.skills) && u(o.skills), c.length === 0)
    throw new Error(
      `manifest.json 中未找到技能。请检查 ${e.url}/manifest.json`
    );
  return { skills: c, categories: d };
}
async function ps() {
  const e = await Xt("mcp/manifest.json"), t = [], l = {};
  if (e.tag_groups && typeof e.tag_groups == "object")
    for (const [n, s] of Object.entries(e.tag_groups))
      Array.isArray(s) && (l[n] = s, t.push({
        id: n,
        label: rt(n),
        tags: s
      }));
  return { servers: (e.servers || []).map((n) => {
    let s = "";
    const r = n.tags || [];
    for (const [o, d] of Object.entries(l))
      if (d.some((c) => r.includes(c))) {
        s = o;
        break;
      }
    return {
      id: n.id || n.name,
      name: n.name || n.id,
      description: n.description || "",
      tags: r,
      transport: n.transport || "stdio",
      config: n.config,
      env: Array.isArray(n.env) ? n.env : void 0,
      source: n.source,
      icon: n.icon,
      icon_url: n.icon_url || n.icon_path || void 0,
      category: s
    };
  }), categories: t };
}
async function gs() {
  const e = await Xt("skills/manifest.json"), t = [], l = /* @__PURE__ */ new Set();
  function a(n, s) {
    for (const r of n) {
      if ((r == null ? void 0 : r.type) === "collection" && Array.isArray(r.children)) {
        a(r.children, r.name || s);
        continue;
      }
      const o = String((r == null ? void 0 : r.path) || (r == null ? void 0 : r.name) || "").trim();
      if (!o) continue;
      const d = o.split("/").map(encodeURIComponent).join("/"), c = `${oa}/skills/${d}`, u = typeof r.tag == "string" && r.tag.trim() ? r.tag.trim() : void 0;
      u && l.add(u);
      let b = null;
      if (typeof r.metadata == "string") {
        const _ = r.metadata.match(/version:\s*"?([\d.]+)"?/);
        _ && (b = _[1]);
      }
      t.push({
        sourceId: "oss:ugsci-official",
        sourceLabel: "UGSci",
        sourcePath: s ? `UGSci/${s}` : "UGSci",
        name: r.name || o.split("/").pop() || o,
        description: r.description || "",
        source_url: c,
        html_url: c,
        version: b,
        author: null,
        tag: u,
        isOfficial: !0
      });
    }
  }
  if (Array.isArray(e) ? a(
    e.map(
      (n) => typeof n == "string" ? { name: n, path: n } : n
    )
  ) : e && Array.isArray(e.skills) && a(e.skills), t.length === 0)
    throw new Error("OSS 技能清单中没有可用技能");
  return {
    skills: t,
    categories: Array.from(l).map((n) => ({
      id: n,
      label: n
    }))
  };
}
async function fs() {
  const e = await Xt("agents/manifest.json"), t = [], l = {};
  if (e.tag_groups && typeof e.tag_groups == "object")
    for (const [n, s] of Object.entries(e.tag_groups))
      Array.isArray(s) && (l[n] = s, t.push({
        id: n,
        label: rt(n),
        tags: s
      }));
  return { agents: (e.agents || []).map((n) => {
    let s = "";
    const r = n.tags || [];
    for (const [o, d] of Object.entries(l))
      if (d.some((c) => r.includes(c))) {
        s = o;
        break;
      }
    return {
      id: n.id || n.name,
      name: n.name || n.id,
      description: n.description || "",
      path: n.path || "",
      tags: r,
      config: n.config,
      instructions: n.instructions,
      skills_manifest: n.skills_manifest,
      drivers: n.drivers,
      category: s
    };
  }), categories: t };
}
async function ys(e) {
  const t = e.filter((r) => r.enabled), l = await Promise.all(
    t.map(async (r) => {
      try {
        if (r.platform === "oss") {
          const { skills: o, categories: d } = await us(r);
          return { skills: o, categories: d, error: null, label: r.label };
        } else
          return { skills: await ds(r), categories: [], error: null, label: r.label };
      } catch (o) {
        return {
          skills: [],
          categories: [],
          error: o.message || String(o),
          label: r.label
        };
      }
    })
  ), a = [], n = [], s = [];
  for (const r of l)
    a.push(...r.skills), n.push(...r.categories), r.error && s.push({ label: r.label, message: r.error });
  return { skills: a, errors: s, categories: n };
}
function Es({
  open: e,
  onClose: t,
  sources: l,
  onChange: a
}) {
  const n = z().React, { useState: s } = n, {
    Modal: r,
    Input: o,
    Button: d,
    List: c,
    Tag: u,
    Switch: b,
    Typography: _,
    Tooltip: S,
    message: h
  } = z().antd, {
    PlusOutlined: f,
    DeleteOutlined: I,
    LinkOutlined: A,
    GithubOutlined: D
  } = z().antdIcons || {}, { Text: M } = _, [ne, F] = s(""), [G, w] = s(""), x = () => {
    const $ = ne.trim();
    if (!$) return;
    const y = da($);
    if (!y) {
      h.error("无效的仓库 URL，请输入类似 https://github.com/owner/repo/tree/main/skills 或 https://gitee.com/owner/repo/tree/master/skills 的链接");
      return;
    }
    const g = ua(y.owner, y.repo, y.skillsPath, y.platform);
    if (l.some((q) => q.id === g)) {
      h.warning("该源已存在");
      return;
    }
    const P = {
      id: g,
      url: $,
      label: y.label,
      owner: y.owner,
      repo: y.repo,
      ref: y.ref,
      skillsPath: y.skillsPath,
      enabled: !0,
      platform: y.platform,
      accessToken: G.trim() || void 0
    }, J = [...l, P];
    yt(J), a(J), F(""), w(""), h.success(`已添加源: ${y.label}`);
  }, k = ($, y) => {
    const g = l.map(
      (P) => P.id === $ ? { ...P, enabled: y } : P
    );
    yt(g), a(g);
  }, K = ($, y) => {
    const g = l.map(
      (P) => P.id === $ ? { ...P, accessToken: y.trim() || void 0 } : P
    );
    yt(g), a(g);
  }, N = ($) => {
    const y = l.filter((g) => g.id !== $);
    yt(y), a(y), h.success("已移除源");
  };
  return n.createElement(
    r,
    {
      open: e,
      onCancel: t,
      title: n.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 8 } },
        D ? n.createElement(D, { style: { fontSize: 18 } }) : null,
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
        M,
        { type: "secondary", style: { fontSize: 12, display: "block", marginBottom: 8 } },
        "添加 GitHub 或 Gitee 仓库作为技能源，系统将从该仓库的指定目录获取技能列表。支持格式："
      ),
      n.createElement(
        "div",
        { style: { display: "flex", gap: 8, alignItems: "center" } },
        n.createElement(o, {
          placeholder: "https://github.com/owner/repo/tree/main/skills 或 https://gitee.com/owner/repo/tree/master/skills",
          value: ne,
          onChange: ($) => F($.target.value),
          onPressEnter: x,
          prefix: A ? n.createElement(A) : void 0,
          style: { flex: 1 }
        }),
        n.createElement(
          d,
          {
            type: "primary",
            icon: f ? n.createElement(f) : void 0,
            onClick: x
          },
          "添加"
        )
      ),
      // Gitee token input (shown when URL looks like a Gitee link)
      ne.trim() && ne.trim().toLowerCase().includes("gitee.com") ? n.createElement(
        "div",
        { style: { marginTop: 8, display: "flex", gap: 8, alignItems: "center" } },
        n.createElement(
          M,
          { type: "secondary", style: { fontSize: 12, whiteSpace: "nowrap" } },
          "Gitee Token:"
        ),
        n.createElement(o.Password, {
          placeholder: "私有仓库请填写 Gitee 私人令牌（可选）",
          value: G,
          onChange: ($) => w($.target.value),
          style: { flex: 1 }
        })
      ) : null
    ),
    n.createElement(
      "div",
      { style: { marginBottom: 8, display: "flex", alignItems: "center", justifyContent: "space-between" } },
      n.createElement(M, { strong: !0 }, `已配置源 (${l.length})`)
    ),
    n.createElement(c, {
      size: "small",
      bordered: !0,
      dataSource: l,
      renderItem: ($) => n.createElement(
        c.Item,
        {
          actions: [
            n.createElement(
              S,
              { title: $.enabled ? "点击禁用" : "点击启用" },
              n.createElement(b, {
                size: "small",
                checked: $.enabled,
                onChange: (y) => k($.id, y)
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
                  icon: I ? n.createElement(I) : void 0,
                  onClick: () => N($.id)
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
              { color: $.platform === "gitee" ? "orange" : $.platform === "oss" ? "green" : "blue", style: { fontSize: 11 } },
              $.platform === "gitee" ? "Gitee" : $.platform === "oss" ? "OSS" : "GitHub"
            ),
            n.createElement(
              u,
              { style: { fontSize: 11 } },
              $.label
            ),
            $.skillsPath ? n.createElement(
              M,
              { type: "secondary", style: { fontSize: 11 } },
              `/${$.skillsPath}`
            ) : null,
            $.platform !== "oss" ? n.createElement(
              M,
              { type: "secondary", style: { fontSize: 11 } },
              `@${$.ref}`
            ) : null
          ),
          n.createElement(
            M,
            {
              type: "secondary",
              style: { fontSize: 11, wordBreak: "break-all" }
            },
            $.url
          ),
          // Gitee token input for existing Gitee sources
          $.platform === "gitee" ? n.createElement(
            "div",
            { style: { marginTop: 6, display: "flex", gap: 6, alignItems: "center" } },
            n.createElement(
              M,
              { type: "secondary", style: { fontSize: 11, whiteSpace: "nowrap" } },
              "Token:"
            ),
            n.createElement(o.Password, {
              size: "small",
              placeholder: "Gitee 私人令牌（可选，用于私有仓库）",
              value: $.accessToken || "",
              onChange: (y) => K($.id, y.target.value),
              style: { flex: 1 }
            })
          ) : null
        )
      )
    })
  );
}
function Pn({
  open: e,
  onClose: t,
  sources: l,
  onChange: a,
  type: n
}) {
  const s = z().React, { useState: r } = s, {
    Modal: o,
    Input: d,
    Button: c,
    List: u,
    Tag: b,
    Switch: _,
    Typography: S,
    Tooltip: h,
    message: f
  } = z().antd, {
    PlusOutlined: I,
    DeleteOutlined: A,
    LinkOutlined: D,
    ApiOutlined: M,
    UserOutlined: ne,
    ImportOutlined: F,
    ExportOutlined: G,
    CopyOutlined: w
  } = z().antdIcons || {}, { Text: x } = S, [k, K] = r(""), [N, $] = r(""), [y, g] = r(""), [P, J] = r(!1), q = n === "mcp" ? "MCP" : "专家模板", Z = n === "mcp" ? M ? s.createElement(M, { style: { fontSize: 18 } }) : null : ne ? s.createElement(ne, { style: { fontSize: 18 } }) : null, C = () => {
    const B = k.trim(), Y = N.trim();
    if (!B) return;
    const ie = Y || B.slice(0, 40), H = `${n}:${B}`;
    if (l.some((v) => v.id === H)) {
      f.warning("该源已存在");
      return;
    }
    const Q = {
      id: H,
      label: ie,
      url: B,
      enabled: !0,
      type: n
    }, ce = [...l, Q];
    n === "mcp" ? gt(ce) : ft(ce), a(ce), K(""), $(""), f.success(`已添加${q}源: ${ie}`);
  }, p = (B, Y) => {
    const ie = l.map(
      (H) => H.id === B ? { ...H, enabled: Y } : H
    );
    n === "mcp" ? gt(ie) : ft(ie), a(ie);
  }, E = (B) => {
    const Y = l.filter((ie) => ie.id !== B);
    n === "mcp" ? gt(Y) : ft(Y), a(Y), f.success("已移除源");
  }, j = () => {
    const B = JSON.stringify(
      { type: n, sources: l },
      null,
      2
    );
    try {
      navigator.clipboard.writeText(B), f.success(`${q}源已复制到剪贴板（${l.length} 个源）`);
    } catch {
      const Y = document.createElement("textarea");
      Y.value = B, document.body.appendChild(Y), Y.select(), document.execCommand("copy"), document.body.removeChild(Y), f.success(`${q}源已复制到剪贴板（${l.length} 个源）`);
    }
  }, ae = () => {
    const B = y.trim();
    if (!B) {
      f.warning("请粘贴 JSON 内容");
      return;
    }
    try {
      const Y = JSON.parse(B);
      let ie = [];
      if (Array.isArray(Y))
        ie = Y;
      else if (Y && Array.isArray(Y.sources))
        ie = Y.sources;
      else if (Y && typeof Y == "object")
        ie = [Y];
      else
        throw new Error("Invalid format");
      const H = ie.filter(
        (ee) => ee && typeof ee.url == "string" && typeof ee.label == "string"
      );
      if (H.length === 0) {
        f.error("未找到有效的源数据");
        return;
      }
      const Q = new Set(l.map((ee) => ee.id)), ce = [];
      for (const ee of H) {
        const m = ee.id || `${n}:${ee.url}`;
        Q.has(m) || ce.push({
          id: m,
          label: ee.label,
          url: ee.url,
          enabled: ee.enabled !== !1,
          type: n
        });
      }
      if (ce.length === 0) {
        f.info("所有源均已存在，无新增");
        return;
      }
      const v = [...l, ...ce];
      n === "mcp" ? gt(v) : ft(v), a(v), g(""), J(!1), f.success(`成功导入 ${ce.length} 个${q}源`);
    } catch (Y) {
      f.error(`JSON 解析失败: ${Y.message || "格式错误"}`);
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
        Z,
        s.createElement("span", null, `配置${q}源`)
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
              icon: G ? s.createElement(G) : void 0,
              onClick: j,
              disabled: l.length === 0,
              size: "small"
            },
            "导出到剪贴板"
          ),
          s.createElement(
            c,
            {
              icon: F ? s.createElement(F) : void 0,
              onClick: () => J(!P),
              size: "small"
            },
            P ? "隐藏导入" : "导入JSON"
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
      `配置${q}源地址，支持从远程仓库或团队共享的 JSON 导入${q}配置。`
    ),
    // Import section (collapsible)
    P ? s.createElement(
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
        `粘贴${q}源 JSON（支持从导出的剪贴板内容粘贴）`
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
        value: y,
        onChange: (B) => g(B.target.value),
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
            onClick: ae
          },
          "导入"
        ),
        s.createElement(
          c,
          {
            size: "small",
            onClick: () => g("")
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
        value: N,
        onChange: (B) => $(B.target.value),
        style: { width: 200 }
      }),
      s.createElement(d, {
        placeholder: n === "mcp" ? "https://raw.githubusercontent.com/team/mcp-registry/main/mcp.json" : "https://raw.githubusercontent.com/team/expert-registry/main/experts.json",
        value: k,
        onChange: (B) => K(B.target.value),
        onPressEnter: C,
        prefix: D ? s.createElement(D) : void 0,
        style: { flex: 1 }
      }),
      s.createElement(
        c,
        {
          type: "primary",
          icon: I ? s.createElement(I) : void 0,
          onClick: C
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
        `已配置源 (${l.length})`
      )
    ),
    s.createElement(u, {
      size: "small",
      bordered: !0,
      dataSource: l,
      renderItem: (B) => s.createElement(
        u.Item,
        {
          actions: [
            s.createElement(
              h,
              { title: B.enabled ? "点击禁用" : "点击启用" },
              s.createElement(_, {
                size: "small",
                checked: B.enabled,
                onChange: (Y) => p(B.id, Y)
              })
            ),
            s.createElement(
              h,
              { title: "移除此源" },
              s.createElement(
                c,
                {
                  size: "small",
                  type: "text",
                  danger: !0,
                  icon: A ? s.createElement(A) : void 0,
                  onClick: () => E(B.id)
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
              b,
              {
                color: n === "mcp" ? "purple" : "blue",
                style: { fontSize: 11 }
              },
              B.label
            ),
            B.enabled ? null : s.createElement(
              b,
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
            B.url
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
async function hs() {
  return re("/market/providers");
}
async function vs(e) {
  return re(
    `/market/categories?lang=${encodeURIComponent(e)}`
  );
}
async function bs(e, t, l, a, n) {
  return re("/market/search", {
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
function An(e) {
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
async function Mn(e, t) {
  const l = { bundle_url: e };
  return t && (l.access_token = t), re("/skills/pool/import", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(l)
  });
}
function Ss() {
  const e = z().React, { useState: t, useEffect: l, useCallback: a, useMemo: n, useRef: s } = e, {
    Spin: r,
    Empty: o,
    Input: d,
    Button: c,
    message: u,
    Row: b,
    Col: _,
    Card: S,
    Tag: h,
    Tooltip: f,
    Typography: I,
    Select: A,
    Drawer: D,
    Descriptions: M,
    Tabs: ne,
    Badge: F,
    Progress: G,
    Modal: w,
    Alert: x
  } = z().antd, {
    ReloadOutlined: k,
    SearchOutlined: K,
    DownloadOutlined: N,
    AppstoreOutlined: $,
    ShopOutlined: y,
    CheckCircleOutlined: g,
    LoadingOutlined: P,
    UserOutlined: J,
    SettingOutlined: q,
    GithubOutlined: Z,
    ApiOutlined: C
  } = z().antdIcons || {}, { Text: p, Paragraph: E, Title: j } = I, [ae, B] = t("skills"), [Y, ie] = t([]), [H, Q] = t([]), [ce, v] = t([]), [ee, m] = t(""), [X, R] = t(""), [se, de] = t(!1), [Ee, ye] = t(!1), [pe, le] = t(
    {}
  ), [U, T] = t(null), [V, oe] = t({}), [W, ue] = t([]), [ve, we] = t(""), [xe, _e] = t(""), [Ne, it] = t(""), [ct, et] = t({}), [Ae, tt] = t(""), [mt, Ge] = t(/* @__PURE__ */ new Set()), [Te, Ie] = t(null), [ke, te] = t({}), [Ce, Se] = t([]), [ze, He] = t([]), [nt, he] = t([]), [kt, dt] = t(""), [at, Pe] = t(!1), [pa, Kt] = t(!1), [ga, Vt] = t([]), [fa, qt] = t(!1), [ya, Yt] = t([]), [Ea, Qt] = t(!1), [Zt, en] = t([]), [tn, nn] = t([]), [an, ln] = t(!1), [We, sn] = t(""), [on, rn] = t([]), [cn, mn] = t([]), [dn, un] = t(!1), [Je, pn] = t(""), [_t, gn] = t(!1), [lt, ha] = t([]), st = s(null);
  l(() => {
    Promise.all([
      hs().catch(() => []),
      vs("zh").catch(() => []),
      Bt().catch(() => [])
    ]).then(([i, O, L]) => {
      ie(i), Q(O), ue(L), L.length > 0 && (we(L[0].id), tt(L[0].id));
    });
  }, []);
  const ut = a(async (i) => {
    const O = i ?? cs();
    if (Se(i || O), O.filter((me) => me.enabled).length === 0) {
      He([]);
      return;
    }
    Pe(!0);
    try {
      const { skills: me, errors: ge, categories: be } = await ys(O);
      if (He(me), ha(be), ge.length > 0) {
        for (const fe of ge)
          console.warn(`[ugsci] GitHub source '${fe.label}' error: ${fe.message}`);
        u.warning(
          `部分源加载失败: ${ge.map((fe) => fe.label).join(", ")}`
        );
      }
    } catch (me) {
      u.error(me.message || "加载技能源失败"), He([]);
    } finally {
      Pe(!1);
    }
  }, []), Tt = a(async () => {
    var me, ge, be;
    ln(!0), un(!0), Pe(!0);
    const [i, O, L] = await Promise.allSettled([
      ps(),
      fs(),
      gs()
    ]);
    if (i.status === "fulfilled" ? (en(i.value.servers), nn(i.value.categories)) : (console.warn(`[ugsci] MCP manifest error: ${((me = i.reason) == null ? void 0 : me.message) || i.reason}`), en([]), nn([])), ln(!1), O.status === "fulfilled" ? (rn(O.value.agents), mn(O.value.categories)) : (console.warn(`[ugsci] Agents manifest error: ${((ge = O.reason) == null ? void 0 : ge.message) || O.reason}`), rn([]), mn([])), un(!1), L.status === "fulfilled")
      he(L.value.skills), dt("");
    else {
      const fe = ((be = L.reason) == null ? void 0 : be.message) || String(L.reason);
      console.warn(`[ugsci] Skills manifest error: ${fe}`), he([]), dt(fe);
    }
    Pe(!1);
  }, []);
  l(() => {
    ut(), Tt(), Vt(os()), Yt(rs());
  }, [ut, Tt]);
  const pt = a(
    async (i, O, L) => {
      de(!0);
      try {
        const me = await bs(
          i,
          L,
          20,
          "zh",
          O || void 0
        );
        L === void 0 || Object.keys(L).length === 0 ? v(me.results) : v((fe) => [...fe, ...me.results]);
        const ge = Object.values(me.by_provider || {}).some(
          (fe) => fe.has_more
        );
        ye(ge);
        const be = {};
        for (const [fe, je] of Object.entries(me.by_provider || {}))
          be[fe] = (L[fe] || 1) + 1;
        if (le(be), me.errors.length > 0)
          for (const fe of me.errors)
            console.warn(
              `[ugsci] Market provider '${fe.provider}' error: ${fe.message}`
            );
      } catch (me) {
        u.error(me.message || "搜索市场失败"), v([]);
      } finally {
        de(!1);
      }
    },
    []
  );
  l(() => (st.current && clearTimeout(st.current), st.current = setTimeout(() => {
    pt(ee, X, {});
  }, 400), () => {
    st.current && clearTimeout(st.current);
  }), [ee, X, pt]);
  const va = () => {
    pt(ee, X, pe);
  }, fn = async (i) => {
    const O = `${i.source}:${i.slug}`;
    try {
      oe((me) => ({ ...me, [O]: "installing" }));
      const L = await Mn(i.source_url);
      L.installed && u.success(
        `技能「${L.name || i.name}」已安装到技能池，可在技能中心查看`
      ), oe((me) => {
        const ge = { ...me };
        return delete ge[O], ge;
      });
    } catch (L) {
      u.error(An(L) || "安装技能失败"), oe((me) => {
        const ge = { ...me };
        return delete ge[O], ge;
      });
    }
  }, ba = (i) => {
    window.history.pushState({}, "", i), window.dispatchEvent(new PopStateEvent("popstate"));
  }, Sa = async (i) => {
    const O = `github:${i.sourceId}:${i.name}`, L = Ce.find((ge) => ge.id === i.sourceId), me = (L == null ? void 0 : L.accessToken) || void 0;
    try {
      oe((be) => ({ ...be, [O]: "installing" }));
      const ge = await Mn(i.source_url, me);
      ge.installed && u.success(
        `技能「${ge.name || i.name}」已安装到技能池，可在技能中心查看`
      ), oe((be) => {
        const fe = { ...be };
        return delete fe[O], fe;
      });
    } catch (ge) {
      u.error(An(ge) || "安装技能失败"), oe((be) => {
        const fe = { ...be };
        return delete fe[O], fe;
      });
    }
  }, De = n(() => {
    const i = [], O = /* @__PURE__ */ new Set();
    for (const L of [...nt, ...ze]) {
      const me = L.source_url || `${L.sourceLabel}:${L.name}`;
      O.has(me) || (O.add(me), i.push(L));
    }
    return i;
  }, [nt, ze]), yn = n(() => {
    const i = [], O = /* @__PURE__ */ new Set();
    if (lt.length > 0)
      for (const L of lt)
        O.has(L.id) || (O.add(L.id), i.push(L));
    for (const L of De)
      L.tag && !O.has(L.tag) && (O.add(L.tag), i.push({ id: L.tag, label: L.tag }));
    for (const L of De)
      !L.isOfficial && L.sourceLabel && !O.has(L.sourceLabel) && (O.add(L.sourceLabel), i.push({ id: L.sourceLabel, label: L.sourceLabel }));
    return i;
  }, [De, lt]), zt = n(() => {
    let i = De;
    if (X) {
      const O = lt.find((L) => L.id === X);
      O && O.tags ? i = i.filter(
        (L) => L.tag && O.tags.includes(L.tag) || L.sourceLabel === X
      ) : i = i.filter(
        (L) => L.tag === X || L.sourceLabel === X
      );
    }
    if (ee.trim()) {
      const O = ee.toLowerCase();
      i = i.filter(
        (L) => {
          var me;
          return L.name.toLowerCase().includes(O) || ((me = L.description) == null ? void 0 : me.toLowerCase().includes(O));
        }
      );
    }
    return i;
  }, [De, ee, X, lt]), En = Y.filter((i) => i.available), Xe = n(() => X ? ce.filter((i) => {
    const O = En.find((L) => L.key === i.source);
    return (O == null ? void 0 : O.label) === X;
  }) : ce, [ce, X, En]), wa = e.createElement(
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
        prefix: K ? e.createElement(K) : void 0,
        value: ee,
        onChange: (i) => m(i.target.value),
        allowClear: !0,
        style: { flex: 1, minWidth: 200, maxWidth: 400 }
      }),
      // Pool install info
      e.createElement(
        p,
        { type: "secondary", style: { fontSize: 12 } },
        "安装后进入技能池"
      ),
      // Configure skill source button
      e.createElement(
        c,
        {
          icon: Z ? e.createElement(Z) : void 0,
          onClick: () => Kt(!0),
          size: "small"
        },
        "配置技能源"
      )
    ),
    // Dynamic category filter tags (from OSS manifest tags + imported sources)
    kt && De.length === 0 ? e.createElement(x, {
      type: "warning",
      showIcon: !0,
      message: "UGSci 官方 OSS 技能库加载失败",
      description: "请检查网络或后端 OSS 代理服务，然后点击右上角“刷新”重试。",
      style: { marginBottom: 12 }
    }) : null,
    yn.length > 0 ? e.createElement(
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
        p,
        { type: "secondary", style: { fontSize: 12, marginRight: 4 } },
        "分类:"
      ),
      e.createElement(
        h,
        {
          style: {
            fontSize: 11,
            cursor: "pointer",
            borderRadius: 12
          },
          color: X === "" ? "blue" : void 0,
          onClick: () => R("")
        },
        "全部"
      ),
      ...yn.map((i) => {
        const O = ze.some(
          (L) => !L.isOfficial && L.sourceLabel === i.id
        );
        return e.createElement(
          h,
          {
            key: i.id,
            style: {
              fontSize: 11,
              cursor: "pointer",
              borderRadius: 12
            },
            color: X === i.id ? O ? "blue" : "geekblue" : void 0,
            icon: O && Z ? e.createElement(Z) : void 0,
            onClick: () => R(
              X === i.id ? "" : i.id
            )
          },
          i.label
        );
      })
    ) : null,
    // GitHub skills section
    at && De.length === 0 ? e.createElement(
      "div",
      { style: { textAlign: "center", padding: 40, marginBottom: 16 } },
      e.createElement(r, { size: "large" }, e.createElement("div", { style: { minHeight: 60, display: "flex", alignItems: "center", justifyContent: "center" } }, "正在加载技能..."))
    ) : zt.length > 0 ? e.createElement(
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
        Z ? e.createElement(Z, {
          style: { fontSize: 14, color: "#1677ff" }
        }) : null,
        e.createElement(
          p,
          { strong: !0, style: { fontSize: 13 } },
          `技能市场 (${zt.length})`
        )
      ),
      e.createElement(
        b,
        { gutter: [12, 12] },
        ...zt.map((i) => {
          const O = `github:${i.sourceId}:${i.name}`, L = V[O];
          return e.createElement(
            _,
            { key: O, xs: 24, sm: 12, md: 8, lg: 6 },
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
                Z ? e.createElement(Z, {
                  style: { fontSize: 18, color: "#57606a" }
                }) : e.createElement(
                  "span",
                  { style: { fontSize: 18 } },
                  "📦"
                ),
                e.createElement(
                  f,
                  { title: i.name },
                  e.createElement(
                    p,
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
                E,
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
                    C ? e.createElement(C, { style: { fontSize: 10 } }) : null,
                    i.sourcePath || i.sourceLabel
                  ) : null,
                  // Show tag as category badge
                  i.tag ? e.createElement(
                    h,
                    { color: "geekblue", style: { fontSize: 10 } },
                    i.tag
                  ) : null,
                  i.version ? e.createElement(
                    h,
                    { style: { fontSize: 10 } },
                    `v${i.version}`
                  ) : null
                ),
                L ? e.createElement(
                  c,
                  {
                    size: "small",
                    disabled: !0,
                    icon: P ? e.createElement(P) : void 0
                  },
                  "安装中"
                ) : e.createElement(
                  c,
                  {
                    type: "primary",
                    size: "small",
                    icon: N ? e.createElement(N) : void 0,
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
    Xe.length > 0 || se ? e.createElement(
      "div",
      {
        style: {
          marginBottom: 10,
          display: "flex",
          alignItems: "center",
          gap: 6
        }
      },
      y ? e.createElement(y, {
        style: { fontSize: 14, color: "#1677ff" }
      }) : null,
      e.createElement(
        p,
        { strong: !0, style: { fontSize: 13 } },
        `技能市场${Xe.length > 0 ? ` (${Xe.length})` : ""}`
      )
    ) : null,
    // Results grid
    se && Xe.length === 0 ? e.createElement(
      "div",
      { style: { textAlign: "center", padding: 60 } },
      e.createElement(r, { size: "large" })
    ) : Xe.length === 0 ? e.createElement(o, {
      description: ee ? `未找到匹配「${ee}」的技能` : "输入关键词搜索技能市场",
      image: o.PRESENTED_IMAGE_SIMPLE
    }) : e.createElement(
      b,
      { gutter: [12, 12] },
      ...Xe.map((i) => {
        const O = `${i.source}:${i.slug}`, L = V[O];
        return e.createElement(
          _,
          { key: O, xs: 24, sm: 12, md: 8, lg: 6 },
          e.createElement(
            S,
            {
              hoverable: !0,
              size: "small",
              style: { height: "100%", cursor: "pointer" },
              onClick: () => T(i)
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
                f,
                { title: i.name },
                e.createElement(
                  p,
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
              E,
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
                  h,
                  { color: "geekblue", style: { fontSize: 10 } },
                  i.source
                ),
                i.version ? e.createElement(
                  h,
                  { style: { fontSize: 10 } },
                  `v${i.version}`
                ) : null
              ),
              L ? e.createElement(
                c,
                {
                  size: "small",
                  disabled: !0,
                  icon: P ? e.createElement(P) : void 0
                },
                "安装中"
              ) : e.createElement(
                c,
                {
                  type: "primary",
                  size: "small",
                  icon: N ? e.createElement(N) : void 0,
                  onClick: (me) => {
                    me.stopPropagation(), fn(i);
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
    Ee && !se ? e.createElement(
      "div",
      { style: { textAlign: "center", marginTop: 16 } },
      e.createElement(
        c,
        { onClick: va, loading: se },
        "加载更多"
      )
    ) : null,
    // Detail Drawer
    U ? e.createElement(
      D,
      {
        title: e.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 8 } },
          U.icon_url ? e.createElement("img", {
            src: U.icon_url,
            alt: U.name,
            style: { width: 28, height: 28, borderRadius: 4 }
          }) : e.createElement(
            "span",
            { style: { fontSize: 20 } },
            "📦"
          ),
          e.createElement("span", null, U.name)
        ),
        open: !0,
        onClose: () => T(null),
        width: 480,
        extra: e.createElement(
          c,
          {
            type: "primary",
            icon: N ? e.createElement(N) : void 0,
            onClick: () => {
              fn(U);
            }
          },
          "安装到技能池"
        )
      },
      e.createElement(
        M,
        { column: 1, bordered: !0, size: "small" },
        e.createElement(
          M.Item,
          { label: "来源" },
          U.source
        ),
        e.createElement(
          M.Item,
          { label: "描述" },
          U.description || "-"
        ),
        U.version ? e.createElement(
          M.Item,
          { label: "版本" },
          U.version
        ) : null,
        U.author ? e.createElement(
          M.Item,
          { label: "作者" },
          U.author
        ) : null,
        e.createElement(
          M.Item,
          { label: "来源链接" },
          e.createElement(
            "a",
            { href: U.source_url, target: "_blank" },
            U.source_url
          )
        )
      ),
      U.stats ? e.createElement(
        "div",
        { style: { marginTop: 16 } },
        e.createElement(
          p,
          {
            strong: !0,
            style: { display: "block", marginBottom: 8 }
          },
          "统计"
        ),
        e.createElement(
          "div",
          { style: { display: "flex", gap: 12, flexWrap: "wrap" } },
          ...Object.entries(U.stats).map(
            ([i, O]) => e.createElement(
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
                String(O)
              ),
              e.createElement(
                p,
                { type: "secondary", style: { fontSize: 11 } },
                i
              )
            )
          )
        )
      ) : null
    ) : null
  ), It = n(() => {
    let i = on;
    if (Je && (i = i.filter((O) => O.category === Je)), xe.trim()) {
      const O = xe.toLowerCase();
      i = i.filter(
        (L) => L.name.toLowerCase().includes(O) || L.description.toLowerCase().includes(O) || L.tags.some((me) => me.toLowerCase().includes(O))
      );
    }
    return i;
  }, [on, xe, Je]), Ca = async (i) => {
    if (!_t) {
      gn(!0);
      try {
        let O = i.description;
        if (i.instructions)
          try {
            const ge = i.instructions.replace(/^\/+/, ""), be = await fetch(ot(ge));
            be.ok && (O = await be.text());
          } catch {
          }
        let L = [];
        if (i.skills_manifest)
          try {
            const ge = i.skills_manifest.replace(/^\/+/, ""), be = await fetch(ot(ge));
            if (be.ok) {
              const fe = await be.json();
              Array.isArray(fe) ? L = fe.map((je) => typeof je == "string" ? je : je.name).filter(Boolean) : fe.skills && (L = fe.skills.map((je) => typeof je == "string" ? je : je.name).filter(Boolean));
            }
          } catch {
          }
        const me = await re("/agents", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: i.name,
            description: i.description,
            skill_names: L
          })
        });
        await bt(me.id, "AGENTS.md", O), u.success(`专家「${i.name}」创建成功，已跳转至专家`), ba("/ugsci-experts");
      } catch (O) {
        u.error(O.message || "创建专家失败");
      } finally {
        gn(!1);
      }
    }
  }, hn = a(async (i) => {
    if (i)
      try {
        const O = await Ht(i);
        Ge(new Set(O.map((L) => L.key)));
      } catch {
        Ge(/* @__PURE__ */ new Set());
      }
  }, []);
  l(() => {
    Ae && hn(Ae);
  }, [Ae, hn]);
  const xa = async (i) => {
    if (!Ae) {
      u.warning("请先选择目标专家");
      return;
    }
    if (Ya(i)) {
      const O = Object.entries(i.env), L = {};
      for (const [me] of O)
        L[me] = "";
      te(L), Ie(i);
      return;
    }
    await vn(i, i.env || {});
  }, vn = async (i, O) => {
    et((L) => ({ ...L, [i.id]: !0 }));
    try {
      const L = i.id;
      await Gn(Ae, {
        client_key: L,
        client: {
          name: i.name,
          description: i.description,
          enabled: !0,
          transport: i.transport,
          url: i.url || "",
          command: i.command || "",
          args: i.args || [],
          env: O,
          cwd: i.cwd || "",
          headers: i.headers || {}
        }
      }), u.success(`MCP「${i.name}」已添加到当前专家`), Ge((me) => new Set(me).add(L));
    } catch (L) {
      u.error(L.message || `添加 MCP「${i.name}」失败`);
    } finally {
      et((L) => ({ ...L, [i.id]: !1 }));
    }
  }, ka = async () => {
    if (!Te) return;
    const i = [];
    for (const [L, me] of Object.entries(ke))
      if (!me || !me.trim()) {
        const ge = wn[L];
        i.push((ge == null ? void 0 : ge.label) || L);
      }
    if (i.length > 0) {
      u.warning(`请填写以下配置项: ${i.join(", ")}`);
      return;
    }
    const O = Te;
    Ie(null), te({}), await vn(O, { ...ke });
  }, Ot = n(() => {
    let i = Zt;
    if (We && (i = i.filter((O) => O.category === We)), Ne.trim()) {
      const O = Ne.toLowerCase();
      i = i.filter(
        (L) => L.name.toLowerCase().includes(O) || L.description.toLowerCase().includes(O) || L.tags.some((me) => me.toLowerCase().includes(O))
      );
    }
    return i.map(ss);
  }, [Zt, Ne, We]), _a = e.createElement(
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
        prefix: K ? e.createElement(K) : void 0,
        value: Ne,
        onChange: (i) => it(i.target.value),
        allowClear: !0,
        style: { maxWidth: 300 }
      }),
      e.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        e.createElement(
          p,
          { type: "secondary", style: { fontSize: 12, whiteSpace: "nowrap" } },
          "安装到："
        ),
        e.createElement(A, {
          value: Ae,
          onChange: (i) => tt(i),
          style: { minWidth: 180 },
          size: "small",
          options: W.map((i) => ({ value: i.id, label: i.name }))
        })
      ),
      // Configure MCP source button
      e.createElement(
        c,
        {
          icon: C ? e.createElement(C) : void 0,
          onClick: () => qt(!0),
          size: "small"
        },
        "配置 MCP 源"
      )
    ),
    // Dynamic category tag row (from OSS manifest tag_groups)
    tn.length > 0 ? e.createElement(
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
        p,
        { type: "secondary", style: { fontSize: 12, marginRight: 4 } },
        "分类:"
      ),
      e.createElement(
        h,
        {
          style: { fontSize: 11, cursor: "pointer", borderRadius: 12 },
          color: We === "" ? "blue" : void 0,
          onClick: () => sn("")
        },
        "全部"
      ),
      ...tn.map(
        (i) => e.createElement(
          h,
          {
            key: i.id,
            style: { fontSize: 11, cursor: "pointer", borderRadius: 12 },
            color: We === i.id ? "geekblue" : void 0,
            onClick: () => sn(
              We === i.id ? "" : i.id
            )
          },
          i.label
        )
      )
    ) : null,
    // MCP server cards (dynamic from OSS)
    an && Ot.length === 0 ? e.createElement(
      "div",
      { style: { textAlign: "center", padding: 40 } },
      e.createElement(r, { size: "large" }, e.createElement("div", { style: { minHeight: 60, display: "flex", alignItems: "center", justifyContent: "center" } }, "正在加载 MCP 服务器..."))
    ) : Ot.length === 0 ? e.createElement(o, {
      description: "未找到匹配的 MCP 服务器",
      image: o.PRESENTED_IMAGE_SIMPLE
    }) : e.createElement(
      b,
      { gutter: [12, 12] },
      ...Ot.map(
        (i) => e.createElement(
          _,
          { key: i.id, xs: 24, sm: 12, md: 8 },
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
                i.iconUrl ? e.createElement("img", {
                  src: i.iconUrl,
                  alt: i.name,
                  style: { width: 28, height: 28, objectFit: "contain" },
                  onError: (O) => {
                    O.target.style.display = "none";
                  }
                }) : i.emoji
              ),
              e.createElement(
                "div",
                { style: { flex: 1 } },
                e.createElement(
                  p,
                  { strong: !0, style: { fontSize: 14 } },
                  i.name
                ),
                e.createElement(
                  "div",
                  { style: { display: "flex", gap: 4, marginTop: 4, flexWrap: "wrap" } },
                  e.createElement(
                    h,
                    { color: "blue", style: { fontSize: 10 } },
                    i.category
                  ),
                  e.createElement(
                    h,
                    {
                      color: i.transport === "stdio" ? "purple" : "cyan",
                      style: { fontSize: 10 }
                    },
                    i.transport
                  ),
                  i.env && Object.keys(i.env).length > 0 ? e.createElement(
                    h,
                    { color: "orange", style: { fontSize: 10 } },
                    "需配置密钥"
                  ) : null
                )
              )
            ),
            // Description
            e.createElement(
              E,
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
                p,
                { type: "secondary", style: { fontSize: 11 } },
                i.transport === "stdio" ? `${i.command} ${(i.args || []).join(" ")}` : i.url || ""
              ),
              mt.has(i.id) ? e.createElement(
                c,
                { size: "small", disabled: !0 },
                "已安装"
              ) : e.createElement(
                c,
                {
                  type: "primary",
                  size: "small",
                  loading: !!ct[i.id],
                  icon: C ? e.createElement(C) : void 0,
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
      y ? e.createElement(y, {
        style: { fontSize: 24, color: "#bfbfbf", marginBottom: 8 }
      }) : null,
      e.createElement(
        p,
        { type: "secondary", style: { fontSize: 12 } },
        "MCP 服务器列表来自 UGSci 官方源，自动同步更新"
      )
    )
  ), Ta = Te ? e.createElement(
    w,
    {
      title: e.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 8 } },
        e.createElement("span", { style: { fontSize: 20, display: "inline-flex", alignItems: "center", justifyContent: "center", width: 24, height: 24 } }, Te.iconUrl ? e.createElement("img", { src: Te.iconUrl, alt: Te.name, style: { width: 22, height: 22, objectFit: "contain" }, onError: (i) => {
          i.target.style.display = "none";
        } }) : Te.emoji),
        e.createElement("span", null, `配置 ${Te.name} 密钥`)
      ),
      open: !!Te,
      onCancel: () => {
        Ie(null), te({});
      },
      onOk: ka,
      okText: "安装",
      cancelText: "取消",
      width: 520,
      destroyOnClose: !0
    },
    // Description
    e.createElement(
      p,
      { type: "secondary", style: { display: "block", marginBottom: 16, fontSize: 12 } },
      Te.description
    ),
    ...Object.entries(Te.env || {}).map(([i]) => {
      const O = wn[i], L = (O == null ? void 0 : O.isSecret) !== !1;
      return e.createElement(
        "div",
        { key: i, style: { marginBottom: 16 } },
        e.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 6, marginBottom: 4 } },
          e.createElement(
            p,
            { strong: !0, style: { fontSize: 13 } },
            (O == null ? void 0 : O.label) || i
          ),
          e.createElement(
            h,
            { color: "orange", style: { fontSize: 10 } },
            "必填"
          )
        ),
        // Help text with optional link
        O ? e.createElement(
          "div",
          { style: { marginBottom: 6, fontSize: 12, color: "#8c8c8c" } },
          O.help,
          O.link ? e.createElement(
            "a",
            {
              href: O.link,
              target: "_blank",
              rel: "noopener noreferrer",
              style: { marginLeft: 4, fontSize: 12 }
            },
            "获取方式 ↗"
          ) : null
        ) : null,
        // Input field
        L ? e.createElement(d.Password, {
          placeholder: `请输入 ${(O == null ? void 0 : O.label) || i}`,
          value: ke[i] || "",
          onChange: (me) => te((ge) => ({
            ...ge,
            [i]: me.target.value
          })),
          style: { width: "100%" }
        }) : e.createElement(d, {
          placeholder: `请输入 ${(O == null ? void 0 : O.label) || i}`,
          value: ke[i] || "",
          onChange: (me) => te((ge) => ({
            ...ge,
            [i]: me.target.value
          })),
          style: { width: "100%" }
        }),
        // Show env key name for reference
        e.createElement(
          p,
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
      e.createElement(d, {
        placeholder: "搜索专家模板...",
        prefix: K ? e.createElement(K) : void 0,
        value: xe,
        onChange: (i) => _e(i.target.value),
        allowClear: !0,
        style: { maxWidth: 400, flex: 1, minWidth: 200 }
      }),
      e.createElement(
        c,
        {
          icon: J ? e.createElement(J) : void 0,
          onClick: () => Qt(!0),
          size: "small"
        },
        "配置专家源"
      )
    ),
    // Dynamic category tag row (from OSS manifest tag_groups)
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
        p,
        { type: "secondary", style: { fontSize: 12, marginRight: 4 } },
        "分类:"
      ),
      e.createElement(
        h,
        {
          style: { fontSize: 11, cursor: "pointer", borderRadius: 12 },
          color: Je === "" ? "blue" : void 0,
          onClick: () => pn("")
        },
        "全部"
      ),
      ...cn.map(
        (i) => e.createElement(
          h,
          {
            key: i.id,
            style: { fontSize: 11, cursor: "pointer", borderRadius: 12 },
            color: Je === i.id ? "geekblue" : void 0,
            onClick: () => pn(
              Je === i.id ? "" : i.id
            )
          },
          i.label
        )
      )
    ) : null,
    // Agent cards (dynamic from OSS)
    dn && It.length === 0 ? e.createElement(
      "div",
      { style: { textAlign: "center", padding: 40 } },
      e.createElement(r, { size: "large" }, e.createElement("div", { style: { minHeight: 60, display: "flex", alignItems: "center", justifyContent: "center" } }, "正在加载专家模板..."))
    ) : It.length === 0 ? e.createElement(o, {
      description: "未找到匹配的专家模板",
      image: o.PRESENTED_IMAGE_SIMPLE
    }) : e.createElement(
      b,
      { gutter: [12, 12] },
      ...It.map(
        (i) => e.createElement(
          _,
          { key: i.id, xs: 24, sm: 12, md: 8 },
          e.createElement(
            S,
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
              e.createElement(Re, {
                name: i.name,
                size: 40
              }),
              e.createElement(
                "div",
                { style: { flex: 1 } },
                e.createElement(
                  p,
                  { strong: !0, style: { fontSize: 14 } },
                  i.name
                ),
                e.createElement(
                  "div",
                  { style: { display: "flex", gap: 4, marginTop: 4, flexWrap: "wrap" } },
                  i.category ? e.createElement(
                    h,
                    { color: "blue", style: { fontSize: 10 } },
                    rt(i.category)
                  ) : null,
                  i.tags.includes("mcp") ? e.createElement(
                    h,
                    { color: "purple", style: { fontSize: 10 } },
                    "MCP"
                  ) : null
                )
              )
            ),
            e.createElement(
              E,
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
                p,
                { type: "secondary", style: { fontSize: 11 } },
                i.tags.filter((O) => O !== "agent" && O !== "template" && O !== "workspace").slice(0, 3).join(" · ") || "专家模板"
              ),
              e.createElement(
                c,
                {
                  type: "primary",
                  size: "small",
                  loading: _t,
                  disabled: _t,
                  icon: $ ? e.createElement($) : void 0
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
      y ? e.createElement(y, {
        style: { fontSize: 24, color: "#bfbfbf", marginBottom: 8 }
      }) : null,
      e.createElement(
        p,
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
        $ ? e.createElement($, { style: { fontSize: 14 } }) : null,
        "技能市场"
      ),
      children: wa
    },
    {
      key: "mcp",
      label: e.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        C ? e.createElement(C, { style: { fontSize: 14 } }) : null,
        "MCP 市场"
      ),
      children: _a
    },
    {
      key: "experts",
      label: e.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        J ? e.createElement(J, { style: { fontSize: 14 } }) : null,
        "专家模板"
      ),
      children: za
    }
  ];
  return e.createElement(
    "div",
    { style: { padding: 24 } },
    e.createElement(Ct, {
      title: "市场",
      subtitle: "浏览技能市场 · 选择 MCP 服务器 · 创建专家模板 · 随时更新能力和专家",
      extra: e.createElement(
        "div",
        { style: { display: "flex", gap: 8 } },
        e.createElement(
          c,
          {
            type: "primary",
            icon: k ? e.createElement(k) : void 0,
            onClick: () => {
              pt(ee, X, {}), ut(), Tt();
            },
            loading: se || at || an || dn
          },
          "刷新"
        )
      )
    }),
    e.createElement(ne, {
      items: Ia,
      activeKey: ae,
      onChange: (i) => B(i)
    }),
    // Skill source config modal
    e.createElement(Es, {
      open: pa,
      onClose: () => Kt(!1),
      sources: Ce,
      onChange: (i) => {
        Se(i), ut(i);
      }
    }),
    // MCP source config modal
    e.createElement(Pn, {
      open: fa,
      onClose: () => qt(!1),
      sources: ga,
      onChange: (i) => Vt(i),
      type: "mcp"
    }),
    // MCP token config modal (for templates requiring secrets)
    Ta,
    // Expert source config modal
    e.createElement(Pn, {
      open: Ea,
      onClose: () => Qt(!1),
      sources: ya,
      onChange: (i) => Yt(i),
      type: "expert"
    })
  );
}
function ws() {
  try {
    const t = localStorage.getItem("language") || "";
    if (t) return t.split("-")[0];
  } catch {
  }
  return ((typeof navigator < "u" ? navigator.language : "") || "").split("-")[0] || "en";
}
const $n = {
  zh: "您好，UGSci 智能助手在线。无论是油气藏分析、数值模拟还是工程决策，描述您的场景，我来交付结果。",
  en: "UGSci AI assistant is online. From reservoir analysis to numerical simulation and engineering decisions — describe your scenario and I'll deliver results.",
  ja: "UGSci AIアシスタントがオンラインです。油層解析、数値シミュレーション、エンジニアリングの意思決定など、シナリオを描写してください。結果をお届けします。",
  ru: "UGSci AI-ассистент онлайн. От анализа пласта до численного моделирования и инженерных решений — опишите свой сценарий, и я предоставлю результат.",
  vi: "Trợ lý AI UGSci đang trực tuyến. Từ phân tích mỏ, mô phỏng số đến ra quyết định kỹ thuật — mô tả kịch bản của bạn, tôi sẽ giao kết quả.",
  id: "Asisten AI UGSci sedang online. Dari analisis reservoir, simulasi numerik hingga keputusan engineering — jelaskan skenario Anda, saya akan memberikan hasilnya."
}, Rn = {
  zh: { label: "能告诉我你都能做点什么吗？", value: "能告诉我你都能做点什么吗" },
  en: { label: "Can you tell me what you can do?", value: "Can you tell me what you can do?" },
  ja: { label: "あなたができることを教えてください", value: "あなたができることを教えてください" },
  ru: { label: "Расскажи, что ты умеешь делать?", value: "Расскажи, что ты умеешь делать?" },
  vi: { label: "Bạn có thể cho tôi biết bạn làm được gì không?", value: "Bạn có thể cho tôi biết bạn làm được gì không?" },
  id: { label: "Bisa cerita apa saja yang bisa Anda lakukan?", value: "Bisa cerita apa saja yang bisa Anda lakukan?" }
};
function Cs() {
  const e = z(), t = e.React, { useEffect: l, useRef: a } = t, n = e.useSelectedAgent ? e.useSelectedAgent() : { id: "default" }, s = (n == null ? void 0 : n.id) || "default", r = a(null), o = a(null);
  return l(() => {
    if (r.current === s) return;
    r.current = s;
    const d = ws(), c = $n[d] || $n.en, u = Rn[d] || Rn.en;
    let b = !1;
    return (async () => {
      var _, S;
      try {
        const h = await wt(s);
        if (b) return;
        const f = Nn(h);
        if (o.current) {
          try {
            o.current();
          } catch {
          }
          o.current = null;
        }
        const I = window.QwenPaw;
        (_ = I == null ? void 0 : I.chat) != null && _.welcome && (f.length > 0 ? (o.current = I.chat.welcome.set("ugsci", {
          description: c,
          prompts: f
        }), console.info(
          `[ugsci] Injected ${f.length} welcome prompts for agent "${s}"`
        )) : (o.current = I.chat.welcome.set("ugsci", {
          description: c,
          prompts: [u]
        }), console.info(
          `[ugsci] No skills for agent "${s}" — using default prompt`
        )));
      } catch (h) {
        console.warn(
          `[ugsci] Failed to inject welcome prompts for agent "${s}":`,
          h
        );
        const f = window.QwenPaw;
        if ((S = f == null ? void 0 : f.chat) != null && S.welcome && !b) {
          if (o.current) {
            try {
              o.current();
            } catch {
            }
            o.current = null;
          }
          o.current = f.chat.welcome.set("ugsci", {
            description: c,
            prompts: [u]
          });
        }
      }
    })(), () => {
      b = !0;
    };
  }, [s]), null;
}
function xs() {
  var c, u, b;
  const e = window.QwenPaw;
  if (!(e != null && e.menu) || !(e != null && e.route)) {
    console.warn(
      "[ugsci] QwenPaw.menu/route API not available — plugin disabled"
    );
    return;
  }
  const t = z().React, l = "ugsci";
  (u = (c = e.chat) == null ? void 0 : c.rightHeader) != null && u.add ? (e.chat.rightHeader.add(l, t.createElement(Cs), {
    id: "ugsci.welcome-injector",
    order: -1
    // render before other right-header items (invisible anyway)
  }), console.info("[ugsci] WelcomePromptsInjector registered via rightHeader")) : console.warn(
    "[ugsci] QP.chat.rightHeader.add not available — agent-specific welcome prompts disabled"
  );
  const a = z().antdIcons || {}, n = a.UserSwitchOutlined, s = a.ToolOutlined, r = a.ThunderboltOutlined, o = a.ShopOutlined;
  e.route.add(l, {
    id: "ugsci.experts",
    path: "/ugsci-experts",
    component: Ml
  }), e.menu.add(l, {
    id: "ugsci.experts",
    location: "primary.agentScoped",
    label: () => "专家",
    icon: n ? t.createElement(n, { style: { fontSize: 16 } }) : void 0,
    route: "ugsci.experts",
    order: 5,
    visible: () => Ke()
  }), e.route.add(l, {
    id: "ugsci.capabilities",
    path: "/ugsci-capabilities",
    component: es
  }), e.menu.add(l, {
    id: "ugsci.capabilities",
    location: "primary.agentScoped",
    label: () => "工具",
    icon: s ? t.createElement(s, { style: { fontSize: 16 } }) : void 0,
    route: "ugsci.capabilities",
    order: 6,
    visible: () => Ke()
  }), e.route.add(l, {
    id: "ugsci.skills-center",
    path: "/ugsci-skills",
    component: as
  }), e.menu.add(l, {
    id: "ugsci.skills-center",
    location: "primary.agentScoped",
    label: () => "技能",
    icon: r ? t.createElement(r, { style: { fontSize: 16 } }) : void 0,
    route: "ugsci.skills-center",
    order: 7,
    visible: () => Ke()
  }), e.route.add(l, {
    id: "ugsci.market",
    path: "/ugsci-market",
    component: Ss
  }), e.menu.add(l, {
    id: "ugsci.market",
    location: "primary.agentScoped",
    label: () => "市场",
    icon: o ? t.createElement(o, { style: { fontSize: 16 } }) : void 0,
    route: "ugsci.market",
    order: 8,
    visible: () => Ke()
  }), (b = e.sidebar) != null && b.registerSimpleModeItems ? (e.sidebar.registerSimpleModeItems([
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
  for (const _ of d) {
    try {
      const h = e.menu.snapshot("primary.agentScoped").find((f) => f.id === _);
      h && e.menu.replace(l, _, {
        ...h,
        visible: () => !Ke()
      });
    } catch {
    }
    try {
      const h = e.menu.snapshot("primary.settings").find((f) => f.id === _);
      h && e.menu.replace(l, _, {
        ...h,
        visible: () => !Ke()
      });
    } catch {
    }
  }
  console.info(
    "[ugsci] Plugin registered: 4 routes + menu items, simple-mode whitelist + simplified navigation active"
  );
}
function Lt() {
  try {
    xs();
  } catch (e) {
    console.error("[ugsci] Failed to build plugin:", e), setTimeout(Lt, 500);
  }
}
var Ln;
if ((Ln = window.QwenPaw) != null && Ln.host)
  Lt();
else {
  const e = setInterval(() => {
    var t;
    (t = window.QwenPaw) != null && t.host && (clearInterval(e), Lt());
  }, 200);
  setTimeout(() => clearInterval(e), 1e4);
}
