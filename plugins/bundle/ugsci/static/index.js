function f() {
  var t;
  const e = (t = window.QwenPaw) == null ? void 0 : t.host;
  if (!e) throw new Error("[ugsci] QwenPaw.host not available");
  return e;
}
function Ut() {
  try {
    return f().getApiToken() || "";
  } catch {
    return "";
  }
}
function Ke(e) {
  return f().getApiUrl(e);
}
function xt(e) {
  const t = Ut();
  return {
    "Content-Type": "application/json",
    ...t ? { Authorization: `Bearer ${t}` } : {},
    ...e
  };
}
async function ee(e, t) {
  const a = await fetch(Ke(e), {
    ...t,
    headers: { ...xt(), ...(t == null ? void 0 : t.headers) || {} }
  });
  if (!a.ok) {
    const n = await a.text().catch(() => "");
    throw new Error(n || `HTTP ${a.status}`);
  }
  return a.status === 204 ? null : a.json();
}
async function it() {
  const e = await ee("/agents");
  return (e == null ? void 0 : e.agents) || [];
}
async function Ze(e) {
  return ee(`/agents/${encodeURIComponent(e)}`);
}
async function ct(e) {
  return await ee("/skills", {
    headers: { "X-Agent-Id": e }
  }) || [];
}
async function mt() {
  return await ee("/skills/pool") || [];
}
async function Ft() {
  return await ee("/skills/workspaces") || [];
}
async function Ht(e) {
  return await ee("/mcp", {
    headers: { "X-Agent-Id": e }
  }) || [];
}
async function Wt(e, t) {
  return ee(
    `/mcp/toggle/${encodeURIComponent(t)}`,
    {
      method: "PATCH",
      headers: { "X-Agent-Id": e }
    }
  );
}
async function Gt(e, t) {
  await ee(`/mcp/${encodeURIComponent(t)}`, {
    method: "DELETE",
    headers: { "X-Agent-Id": e }
  });
}
async function Jt(e, t, a) {
  return ee("/mcp", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify({ client_key: t, client: a })
  });
}
async function Xt(e, t) {
  return await ee(
    `/mcp/tools/${encodeURIComponent(t)}`,
    { headers: { "X-Agent-Id": e } }
  ) || [];
}
const Re = {
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
function dt(e, t) {
  const a = f();
  return a.ReactMarkdown && a.remarkGfm ? t.createElement(
    a.ReactMarkdown,
    { remarkPlugins: [a.remarkGfm] },
    e
  ) : e.replace(/\*\*(.+?)\*\*/g, "$1").replace(/\*(.+?)\*/g, "$1").replace(/`(.+?)`/g, "$1").replace(/^#+\s*/gm, "").replace(/^[-*]\s+/gm, "• ");
}
const at = [
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
], Ct = "ugsci_custom_teams";
function qe() {
  try {
    const e = localStorage.getItem(Ct);
    return e ? JSON.parse(e) : [];
  } catch {
    return [];
  }
}
function kt(e) {
  try {
    localStorage.setItem(Ct, JSON.stringify(e));
  } catch {
  }
}
const Kt = [
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
async function Vt(e, t) {
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
  await fetch(Ke("/console/chat"), {
    method: "POST",
    headers: {
      ...xt(),
      "X-Agent-Id": e
    },
    body: JSON.stringify(a)
  });
}
function Ye(e, t) {
  const a = e.find(
    (l) => l.name === t || l.name === t.replace(/\s+/g, "")
  );
  if (a) return a.id;
  const n = e.find(
    (l) => l.name.includes(t) || t.includes(l.name) || l.name.replace(/\s+/g, "").includes(t.replace(/\s+/g, ""))
  );
  return n ? n.id : null;
}
function qt(e) {
  var a;
  const t = e.members.map((n) => `- ${n.name}（${n.role}）`).join(`
`);
  if (e.custom && e.steps && e.steps.length > 0) {
    const n = e.steps.map((r, s) => {
      const o = r.passContext ? "（传递上一步的结果作为上下文）" : "（独立执行，不传递上下文）";
      return `${s + 1}. 向「${r.agentName}」发送请求：${r.instruction} ${o}`;
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
function Yt({ team: e }) {
  const t = f().React, { Typography: a, Tag: n } = f().antd, { Text: l } = a, r = {
    pipeline: "→",
    roundtable: "⇄",
    coordinator: "⊙"
  }, s = {
    pipeline: "#13c2c2",
    roundtable: "#722ed1",
    coordinator: "#1677ff"
  }, o = e.steps || [], h = o.length > 0;
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
      ...h ? o.map((i, d) => (e.members.find(
        (I) => I.name === i.agentName
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
          r[e.mode]
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
          t.createElement(Ne, {
            name: i.agentName,
            size: 24
          }),
          t.createElement(
            "div",
            null,
            t.createElement(
              l,
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
      ])).flat() : e.members.map((i, d) => [
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
          r[e.mode]
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
          t.createElement(Ne, { name: i.name, size: 24 }),
          t.createElement(
            "div",
            null,
            t.createElement(
              l,
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
function Qt({
  open: e,
  onClose: t,
  agents: a,
  editingTeam: n,
  onSaved: l
}) {
  const r = f().React, { useState: s, useEffect: o, useCallback: h } = r, {
    Modal: i,
    Input: d,
    Button: I,
    Select: b,
    Tag: E,
    Typography: U,
    Switch: v,
    Empty: $,
    message: A,
    Divider: H,
    Steps: w
  } = f().antd, { PlusOutlined: K, DeleteOutlined: L, SaveOutlined: P, ArrowRightOutlined: j } = f().antdIcons || {}, { Text: F, Paragraph: y } = U, [O, z] = s(""), [Z, C] = s("🤝"), [x, u] = s(""), [M, D] = s(
    "pipeline"
  ), [te, R] = s(""), [m, S] = s(""), [g, ne] = s([]), [N, Y] = s([]), [V, G] = s(!1);
  o(() => {
    e && (n ? (z(n.name), C(n.emoji), u(n.description), D(n.mode), R(n.coordinatorName || ""), S(n.taskTemplate), ne(n.steps || []), Y(n.members.map((J) => J.name))) : (z(""), C("🤝"), u(""), D("pipeline"), R(""), S(`请执行以下任务：
任务描述：{任务描述}`), ne([]), Y([])));
  }, [e, n]);
  const k = h(() => {
    if (M === "roundtable") {
      const J = N.map((me) => ({
        agentName: me,
        instruction: "请给出你的专业评估意见",
        passContext: !1
      }));
      ne(J);
    } else if (M === "pipeline") {
      const J = new Map(g.map((B) => [B.agentName, B])), me = N.map((B) => J.get(B) || {
        agentName: B,
        instruction: "请完成你的专业部分",
        passContext: !0
      });
      ne(me);
    }
  }, [M, N, g]), oe = (J) => {
    N.includes(J) || (Y([...N, J]), M === "coordinator" && !te && R(J));
  }, p = (J) => {
    Y(N.filter((me) => me !== J)), ne(g.filter((me) => me.agentName !== J)), te === J && R(N[0] || "");
  }, ae = (J, me, B) => {
    const le = [...g];
    le[J] = { ...le[J], [me]: B }, ne(le);
  }, ce = () => {
    if (!O.trim()) {
      A.warning("请输入团队名称");
      return;
    }
    if (N.length < 2) {
      A.warning("至少需要选择 2 个成员");
      return;
    }
    if (!m.trim()) {
      A.warning("请输入任务模板");
      return;
    }
    if (M === "coordinator" && !te) {
      A.warning("请选择协调者");
      return;
    }
    G(!0);
    try {
      const J = N.map(
        (ie) => {
          var re;
          const W = a.find((Ee) => Ee.name === ie);
          return {
            name: ie,
            role: ((re = W == null ? void 0 : W.description) == null ? void 0 : re.slice(0, 30)) || "团队成员",
            emoji: ""
          };
        }
      );
      let me = g;
      (g.length === 0 || g.length !== N.length) && (me = N.map((ie) => ({
        agentName: ie,
        instruction: "请完成你的专业部分",
        passContext: M === "pipeline"
      })));
      const B = {
        id: (n == null ? void 0 : n.id) || `custom-${Date.now()}`,
        name: O.trim(),
        emoji: Z,
        category: "自定义",
        description: x.trim() || `${O.trim()}（${N.length}人团队）`,
        mode: M,
        members: J,
        coordinatorName: M === "coordinator" ? te : void 0,
        taskTemplate: m.trim(),
        orchestrationPrompt: "",
        // Custom teams use steps-based instructions
        steps: me,
        custom: !0,
        createdAt: (n == null ? void 0 : n.createdAt) || Date.now()
      }, le = qe(), q = le.findIndex((ie) => ie.id === B.id);
      q >= 0 ? le[q] = B : le.push(B), kt(le), A.success(n ? "团队已更新" : "团队已创建"), l(), t();
    } catch (J) {
      A.error(J.message || "保存失败");
    } finally {
      G(!1);
    }
  }, xe = a.filter(
    (J) => !N.includes(J.name)
  );
  return r.createElement(
    i,
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
      onOk: ce,
      okText: "保存团队",
      confirmLoading: V,
      okButtonProps: {
        icon: P ? r.createElement(P) : void 0
      }
    },
    // Step 1: Basic info
    r.createElement(
      "div",
      { style: { marginBottom: 16 } },
      r.createElement(
        F,
        {
          strong: !0,
          style: { display: "block", marginBottom: 8, fontSize: 13 }
        },
        "1. 基本信息"
      ),
      r.createElement(
        "div",
        { style: { display: "flex", gap: 8, marginBottom: 8, alignItems: "center" } },
        N.length > 0 ? r.createElement(ut, {
          members: N,
          size: 36
        }) : null,
        r.createElement(d, {
          placeholder: "团队名称（如：储层评价团队）",
          value: O,
          onChange: (J) => z(J.target.value),
          style: { flex: 1 }
        })
      ),
      r.createElement(d.TextArea, {
        placeholder: "团队描述（简述团队的目标和适用场景）",
        value: x,
        onChange: (J) => u(J.target.value),
        rows: 2,
        style: { marginBottom: 8 }
      }),
      r.createElement(
        "div",
        { style: { display: "flex", gap: 8, alignItems: "center" } },
        r.createElement(
          F,
          { type: "secondary", style: { fontSize: 12 } },
          "协同模式："
        ),
        r.createElement(b, {
          value: M,
          onChange: (J) => D(J),
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
        F,
        {
          strong: !0,
          style: { display: "block", marginBottom: 8, fontSize: 13 }
        },
        "2. 选择团队成员"
      ),
      // Available agents
      xe.length > 0 ? r.createElement(
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
        ...xe.map(
          (J) => r.createElement(
            I,
            {
              key: J.id,
              size: "small",
              icon: K ? r.createElement(K) : void 0,
              onClick: () => oe(J.name)
            },
            J.name
          )
        )
      ) : null,
      // Selected members
      N.length === 0 ? r.createElement($, {
        description: "请从上方添加团队成员",
        image: $.PRESENTED_IMAGE_SIMPLE
      }) : r.createElement(
        "div",
        { style: { display: "flex", flexDirection: "column", gap: 4 } },
        ...N.map(
          (J) => r.createElement(
            "div",
            {
              key: J,
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
              r.createElement(Ne, { name: J, size: 24 }),
              r.createElement(
                F,
                { strong: !0, style: { fontSize: 13 } },
                J
              ),
              M === "coordinator" && te === J ? r.createElement(
                E,
                { color: "blue", style: { fontSize: 10 } },
                "协调者"
              ) : null
            ),
            r.createElement(
              "div",
              { style: { display: "flex", gap: 4 } },
              M === "coordinator" ? r.createElement(
                I,
                {
                  size: "small",
                  type: "link",
                  onClick: () => R(J)
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
                  onClick: () => p(J)
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
    N.length > 0 ? r.createElement(
      "div",
      { style: { marginBottom: 16 } },
      r.createElement(
        F,
        {
          strong: !0,
          style: { display: "block", marginBottom: 8, fontSize: 13 }
        },
        `3. 编排执行步骤${M === "roundtable" ? "（各步独立执行）" : M === "pipeline" ? "（依次执行，可传递上下文）" : "（由协调者决定调用顺序）"}`
      ),
      // Auto-sync button
      r.createElement(
        I,
        {
          size: "small",
          type: "dashed",
          onClick: k,
          style: { marginBottom: 8 }
        },
        "自动生成步骤"
      ),
      // Steps list
      g.length === 0 ? r.createElement(
        F,
        { type: "secondary", style: { fontSize: 12 } },
        "点击「自动生成步骤」或手动配置每步的指令"
      ) : r.createElement(
        "div",
        { style: { display: "flex", flexDirection: "column", gap: 6 } },
        ...g.map(
          (J, me) => r.createElement(
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
              M === "pipeline" ? r.createElement(
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
              ) : r.createElement(
                "span",
                { style: { fontSize: 14 } },
                "🔀"
              ),
              r.createElement(
                E,
                { color: "blue", style: { fontSize: 11 } },
                J.agentName
              ),
              r.createElement(
                "div",
                { style: { flex: 1 } },
                r.createElement(d, {
                  placeholder: "请输入该步骤的指令...",
                  value: J.instruction,
                  onChange: (B) => ae(me, "instruction", B.target.value),
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
              r.createElement(v, {
                size: "small",
                checked: J.passContext,
                onChange: (B) => ae(me, "passContext", B)
              }),
              r.createElement(
                F,
                { type: "secondary", style: { fontSize: 11 } },
                J.passContext ? "传递上一步结果作为上下文" : "独立执行"
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
        F,
        {
          strong: !0,
          style: { display: "block", marginBottom: 8, fontSize: 13 }
        },
        `${N.length > 0 ? "4" : "3"}. 任务模板`
      ),
      r.createElement(d.TextArea, {
        placeholder: `输入任务模板，可用 {参数名} 作为占位符...

例如：
请对区块 {区块名} 的井 {井号} 进行储层评价`,
        value: m,
        onChange: (J) => S(J.target.value),
        rows: 4,
        style: { fontFamily: "monospace", fontSize: 13 }
      }),
      r.createElement(
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
function pt({
  team: e,
  agents: t,
  onLaunch: a,
  onEdit: n,
  onDelete: l
}) {
  var x;
  const r = f().React, { useState: s } = r, { Card: o, Tag: h, Typography: i, Button: d, Tooltip: I } = f().antd, {
    TeamOutlined: b,
    RocketOutlined: E,
    UserOutlined: U,
    EditOutlined: v,
    DeleteOutlined: $,
    DownOutlined: A,
    UpOutlined: H
  } = f().antdIcons || {}, { Text: w, Paragraph: K } = i, [L, P] = s(!1), j = {
    coordinator: { label: "协调者模式", color: "blue" },
    pipeline: { label: "流水线模式", color: "cyan" },
    roundtable: { label: "圆桌讨论", color: "purple" }
  }, F = j[e.mode] || j.coordinator, y = e.members.map((u) => {
    const M = Ye(t, u.name);
    return { ...u, found: !!M, agentId: M };
  }), O = y.filter((u) => u.found).length, z = O === e.members.length, Z = e.coordinatorName || ((x = e.members[0]) == null ? void 0 : x.name), C = Z ? Ye(t, Z) : null;
  return r.createElement(
    o,
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
      r.createElement(ut, {
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
            w,
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
            { color: F.color, style: { fontSize: 10 } },
            F.label
          ),
          r.createElement(
            h,
            { style: { fontSize: 10 } },
            `${O}/${e.members.length}`
          ),
          z ? null : r.createElement(
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
          r.createElement(d, {
            type: "text",
            size: "small",
            icon: v ? r.createElement(v) : void 0,
            onClick: (u) => {
              u.stopPropagation(), n(e);
            }
          })
        ) : null,
        l ? r.createElement(
          I,
          { title: "删除" },
          r.createElement(d, {
            type: "text",
            size: "small",
            danger: !0,
            icon: $ ? r.createElement($) : void 0,
            onClick: (u) => {
              u.stopPropagation(), l(e);
            }
          })
        ) : null
      ) : null
    ),
    // Description
    r.createElement(
      K,
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
      ...y.map(
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
            r.createElement(Ne, { name: u.name, size: 18 }),
            r.createElement(
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
    r.createElement(
      d,
      {
        type: "link",
        size: "small",
        style: { padding: "0 0 4px 0", fontSize: 11, height: "auto" },
        onClick: (u) => {
          u.stopPropagation(), P(!L);
        },
        icon: L ? H ? r.createElement(H) : "▲" : A ? r.createElement(A) : "▼"
      },
      L ? "收起流程" : "查看执行流程"
    ),
    L ? r.createElement(Yt, { team: e }) : null,
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
        w,
        { type: "secondary", style: { fontSize: 11 } },
        Z ? `协调者: ${Z}` : ""
      ),
      r.createElement(
        d,
        {
          type: "primary",
          size: "small",
          icon: E ? r.createElement(E) : void 0,
          disabled: !C,
          onClick: () => a(e),
          style: Re
        },
        "发起团队任务"
      )
    )
  );
}
function Zt({
  agents: e,
  onLaunch: t
}) {
  const a = f().React, { useMemo: n, useState: l, useCallback: r, useEffect: s } = a, {
    Row: o,
    Col: h,
    Input: i,
    Empty: d,
    Typography: I,
    Tag: b,
    Button: E,
    Divider: U,
    message: v,
    Popconfirm: $
  } = f().antd, { SearchOutlined: A, TeamOutlined: H, PlusOutlined: w, RocketOutlined: K } = f().antdIcons || {}, { Text: L } = I, [P, j] = l(""), [F, y] = l([]), [O, z] = l(!1), [Z, C] = l(null);
  s(() => {
    y(qe());
  }, []);
  const x = r(() => {
    y(qe());
  }, []), u = r(
    (g) => {
      const N = qe().filter((Y) => Y.id !== g.id);
      kt(N), y(N), v.success(`团队「${g.name}」已删除`);
    },
    [v]
  ), M = r((g) => {
    C(g), z(!0);
  }, []), D = r(() => {
    C(null), z(!0);
  }, []), te = n(() => [...F, ...Kt], [F]), R = n(() => {
    if (!P.trim()) return te;
    const g = P.toLowerCase();
    return te.filter(
      (ne) => ne.name.toLowerCase().includes(g) || ne.description.toLowerCase().includes(g) || ne.category.toLowerCase().includes(g)
    );
  }, [te, P]), m = R.filter((g) => g.custom), S = R.filter((g) => !g.custom);
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
        E,
        {
          type: "primary",
          size: "small",
          icon: w ? a.createElement(w) : void 0,
          onClick: D,
          style: Re
        },
        "创建专家团"
      )
    ),
    // Search
    a.createElement(i, {
      placeholder: "搜索团队名称、描述或类别...",
      prefix: A ? a.createElement(A) : void 0,
      value: P,
      onChange: (g) => j(g.target.value),
      allowClear: !0,
      style: { marginBottom: 16, maxWidth: 400 }
    }),
    // Custom teams section
    m.length > 0 ? a.createElement(
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
          `自定义团队 (${m.length})`
        )
      ),
      a.createElement(
        o,
        { gutter: [12, 12] },
        ...m.map(
          (g) => a.createElement(
            h,
            { key: g.id, xs: 24, sm: 12, md: 8 },
            a.createElement(pt, {
              team: g,
              agents: e,
              onLaunch: t,
              onEdit: M,
              onDelete: u
            })
          )
        )
      ),
      a.createElement(U, { style: { margin: "16px 0" } })
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
        o,
        { gutter: [12, 12] },
        ...S.map(
          (g) => a.createElement(
            h,
            { key: g.id, xs: 24, sm: 12, md: 8 },
            a.createElement(pt, {
              team: g,
              agents: e,
              onLaunch: t
            })
          )
        )
      )
    ) : null,
    // Empty state
    R.length === 0 ? a.createElement(d, {
      description: "未找到匹配的专家团队，点击「创建专家团」自定义",
      image: d.PRESENTED_IMAGE_SIMPLE
    }) : null,
    // Team Builder Modal
    a.createElement(Qt, {
      open: O,
      onClose: () => {
        z(!1), C(null);
      },
      agents: e,
      editingTeam: Z,
      onSaved: x
    })
  );
}
function en(e) {
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
async function tn(e) {
  return await ee("/workspace/files", {
    headers: { "X-Agent-Id": e }
  }) || [];
}
async function Qe(e, t, a) {
  await ee(`/workspace/files/${encodeURIComponent(t)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify({ content: a })
  });
}
async function gt(e, t) {
  const a = await Ze(e);
  a.system_prompt_files = t, await ee(`/agents/${encodeURIComponent(e)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(a)
  });
}
async function Tt(e, t) {
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
async function nn(e, t) {
  await ee(`/skills/${encodeURIComponent(t)}/enable`, {
    method: "POST",
    headers: { "X-Agent-Id": e }
  });
}
async function zt(e, t) {
  await ee(`/skills/${encodeURIComponent(t)}`, {
    method: "DELETE",
    headers: { "X-Agent-Id": e }
  });
}
async function ln(e, t) {
  return ee("/skills/batch-enable", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify(t)
  });
}
async function an(e, t) {
  return ee("/skills/batch-disable", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify(t)
  });
}
async function rn(e, t) {
  return ee("/skills/batch-delete", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify(t)
  });
}
async function It(e) {
  return await ee("/mcp", {
    headers: { "X-Agent-Id": e }
  }) || [];
}
async function _t(e, t) {
  await ee(`/mcp/${encodeURIComponent(t)}`, {
    method: "DELETE",
    headers: { "X-Agent-Id": e }
  });
}
async function sn(e, t) {
  return ee("/mcp", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify(t)
  });
}
async function on(e, t) {
  return ee(
    `/mcp/toggle/${encodeURIComponent(t)}`,
    {
      method: "PATCH",
      headers: { "X-Agent-Id": e }
    }
  );
}
async function cn(e, t) {
  await ee(`/skills/${encodeURIComponent(t)}/disable`, {
    method: "POST",
    headers: { "X-Agent-Id": e }
  });
}
function mn(e) {
  const t = (e || "").trim();
  if (!t) return { number: 6, unit: "h" };
  const a = t.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/i);
  if (!a) return { number: 6, unit: "h" };
  const n = parseInt(a[1] || "0", 10), l = parseInt(a[2] || "0", 10), r = parseInt(a[3] || "0", 10), s = n * 60 + l + Math.round(r / 60);
  return s <= 0 ? { number: 6, unit: "h" } : s >= 60 && s % 60 === 0 ? { number: s / 60, unit: "h" } : { number: s, unit: "m" };
}
function dn(e) {
  return e.unit === "h" ? `${e.number}h` : `${e.number}m`;
}
async function un(e) {
  return ee("/config/heartbeat", {
    headers: { "X-Agent-Id": e }
  });
}
async function pn(e, t) {
  return ee("/config/heartbeat", {
    method: "PUT",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify(t)
  });
}
async function gn(e) {
  await ee("/config/heartbeat/run", {
    method: "POST",
    headers: { "X-Agent-Id": e }
  });
}
async function yn(e) {
  return ee("/workspace/running-config", {
    headers: { "X-Agent-Id": e }
  });
}
async function fn(e, t) {
  return ee("/workspace/running-config", {
    method: "PUT",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify(t)
  });
}
async function En(e) {
  return (await ee("/workspace/language", {
    headers: { "X-Agent-Id": e }
  })).language || "zh";
}
async function hn(e, t) {
  await ee("/workspace/language", {
    method: "PUT",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify({ language: t })
  });
}
async function vn() {
  return (await ee("/config/user-timezone")).timezone || "UTC";
}
async function bn(e) {
  await ee("/config/user-timezone", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ timezone: e })
  });
}
async function Sn(e) {
  return await ee("/workspace/system-prompt-files", {
    headers: { "X-Agent-Id": e }
  }) || [];
}
const yt = ["AGENTS.md", "SOUL.md", "PROFILE.md"];
function et({
  title: e,
  subtitle: t,
  extra: a
}) {
  const n = f().React, { Space: l } = f().antd;
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
function ft({
  items: e,
  max: t = 5,
  color: a = "blue",
  emptyText: n = "无"
}) {
  const l = f().React, { Tag: r } = f().antd;
  return !e || e.length === 0 ? l.createElement(
    "span",
    { style: { fontSize: 12, color: "#bfbfbf" } },
    n
  ) : l.createElement(
    "div",
    { style: { display: "flex", flexWrap: "wrap", gap: 4 } },
    ...e.slice(0, t).map(
      (s, o) => l.createElement(
        r,
        { key: o, color: a, style: { fontSize: 11, marginRight: 0 } },
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
function Pt({
  open: e,
  onClose: t,
  poolSkills: a,
  installedSkillNames: n,
  loading: l,
  onInstall: r
}) {
  const s = f().React, { useState: o, useEffect: h, useMemo: i } = s, { Modal: d, Button: I, Empty: b, Spin: E, Input: U, Tag: v, Tooltip: $, Typography: A } = f().antd, { CheckOutlined: H, SearchOutlined: w } = f().antdIcons || {}, { Text: K } = A, [L, P] = o([]), [j, F] = o("");
  h(() => {
    e && (P([]), F(""));
  }, [e]);
  const y = i(() => {
    if (!j.trim()) return a;
    const C = j.toLowerCase();
    return a.filter(
      (x) => {
        var u, M;
        return x.name.toLowerCase().includes(C) || ((u = x.description) == null ? void 0 : u.toLowerCase().includes(C)) || ((M = x.tags) == null ? void 0 : M.some((D) => D.toLowerCase().includes(C)));
      }
    );
  }, [a, j]), O = y.filter(
    (C) => !n.includes(C.name)
  ), z = (C) => {
    P(
      (x) => x.includes(C) ? x.filter((u) => u !== C) : [...x, C]
    );
  }, Z = async () => {
    L.length !== 0 && (await r(L), P([]));
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
          K,
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
              onClick: Z,
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
      s.createElement(U, {
        placeholder: "搜索技能名称、描述或标签...",
        prefix: w ? s.createElement(w) : void 0,
        value: j,
        onChange: (C) => F(C.target.value),
        allowClear: !0,
        style: { flex: 1 }
      }),
      s.createElement(
        I,
        {
          size: "small",
          type: "primary",
          onClick: () => P(O.map((C) => C.name))
        },
        "全选"
      ),
      s.createElement(
        I,
        {
          size: "small",
          onClick: () => P([])
        },
        "清空"
      )
    ),
    // Skill grid (card style matching Skill Center)
    l ? s.createElement(
      "div",
      { style: { textAlign: "center", padding: 40 } },
      s.createElement(E, { size: "large" })
    ) : y.length === 0 ? s.createElement(b, {
      description: j ? "未找到匹配的技能" : "技能池暂无可用技能",
      image: b.PRESENTED_IMAGE_SIMPLE
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
      ...y.map((C) => {
        const x = L.includes(C.name), u = n.includes(C.name);
        return s.createElement(
          "div",
          {
            key: C.name,
            onClick: () => !u && z(C.name),
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
                paddingRight: u || x ? 24 : 0
              }
            },
            s.createElement(
              "span",
              { style: { fontSize: 16 } },
              C.emoji || "⚡"
            ),
            s.createElement(
              $,
              { title: C.name },
              s.createElement(
                K,
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
              (M, D) => s.createElement(
                v,
                {
                  key: D,
                  color: "cyan",
                  style: { fontSize: 10, marginRight: 0 }
                },
                M
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
}, Ot = { marginBottom: 16 }, At = {
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
}, $t = {
  fontSize: 12,
  color: "rgba(0,0,0,0.45)",
  marginLeft: 8
};
function wn({ agentId: e }) {
  const t = f().React, { useState: a, useEffect: n, useCallback: l } = t, {
    Switch: r,
    InputNumber: s,
    Select: o,
    Button: h,
    Spin: i,
    Space: d,
    Typography: I,
    message: b
  } = f().antd, { PlayCircleOutlined: E, SaveOutlined: U } = f().antdIcons || {}, { Text: v } = I, [$, A] = a(!0), [H, w] = a(!1), [K, L] = a(!1), [P, j] = a(!1), [F, y] = a(6), [O, z] = a("h"), [Z, C] = a("main"), [x, u] = a(300), [M, D] = a(!1), [te, R] = a("08:00"), [m, S] = a("22:00"), g = l(async () => {
    var k, oe;
    A(!0);
    try {
      const p = await un(e), ae = mn(p.every ?? "6h");
      j(p.enabled ?? !1), y(ae.number), z(ae.unit), C(p.target ?? "main"), u(p.timeoutSeconds ?? 300), D(!!p.activeHours), R(((k = p.activeHours) == null ? void 0 : k.start) ?? "08:00"), S(((oe = p.activeHours) == null ? void 0 : oe.end) ?? "22:00");
    } catch (p) {
      b.error(p.message || "加载心跳配置失败");
    } finally {
      A(!1);
    }
  }, [e]);
  n(() => {
    g();
  }, [g]);
  const ne = async () => {
    w(!0);
    try {
      await pn(e, {
        enabled: P,
        every: dn({ number: F, unit: O }),
        target: Z,
        timeoutSeconds: x,
        activeHours: M && te && m ? { start: te, end: m } : void 0
      }), b.success("心跳配置已保存");
    } catch (k) {
      b.error(k.message || "保存心跳配置失败");
    } finally {
      w(!1);
    }
  }, N = async () => {
    L(!0);
    try {
      await gn(e), b.success("已触发心跳检查");
    } catch (k) {
      b.error(k.message || "触发心跳失败");
    } finally {
      L(!1);
    }
  };
  if ($)
    return t.createElement(
      "div",
      { style: { textAlign: "center", padding: 40 } },
      t.createElement(i, { size: "large" })
    );
  const Y = (k, oe, p) => t.createElement(
    "div",
    { style: Ot },
    t.createElement("div", { style: Xe }, k),
    oe,
    p ? t.createElement(
      v,
      { type: "secondary", style: $t },
      p
    ) : null
  ), V = (k, oe, p, ae) => t.createElement(
    "div",
    { style: At },
    t.createElement(
      "div",
      null,
      t.createElement("div", { style: Xe }, k),
      oe
    ),
    t.createElement(
      "div",
      null,
      t.createElement("div", { style: Xe }, p),
      ae
    )
  ), { Divider: G } = f().antd;
  return t.createElement(
    "div",
    { style: { paddingBottom: 8 } },
    // ── Section: 基本设置 ──
    t.createElement("div", { style: De }, "基本设置"),
    Y(
      "启用心跳",
      t.createElement(r, {
        checked: P,
        onChange: (k) => j(k)
      }),
      P ? "已启用，专家将定期自检" : "已停用"
    ),
    V(
      "检查频率",
      t.createElement(
        d,
        null,
        t.createElement(s, {
          min: 1,
          value: F,
          onChange: (k) => y(k ?? 1),
          style: { width: "100%" }
        }),
        t.createElement(o, {
          value: O,
          onChange: (k) => z(k),
          style: { width: 90 },
          options: [
            { value: "m", label: "分钟" },
            { value: "h", label: "小时" }
          ]
        })
      ),
      "心跳目标",
      t.createElement(o, {
        value: Z,
        onChange: (k) => C(k),
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
        value: x,
        onChange: (k) => u(k ?? 300),
        style: { width: 200 }
      })
    ),
    // ── Section: 活跃时段 ──
    t.createElement(G, { style: { margin: "8px 0 16px" } }),
    t.createElement("div", { style: De }, "活跃时段"),
    Y(
      "启用活跃时段限制",
      t.createElement(r, {
        checked: M,
        onChange: (k) => D(k)
      }),
      "仅在指定时段内触发心跳"
    ),
    M ? V(
      "开始时间",
      t.createElement("input", {
        type: "time",
        value: te,
        onChange: (k) => R(k.target.value),
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
        value: m,
        onChange: (k) => S(k.target.value),
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
          icon: U ? t.createElement(U) : void 0,
          loading: H,
          onClick: ne,
          style: Re
        },
        "保存配置"
      ),
      t.createElement(
        h,
        {
          icon: E ? t.createElement(E) : void 0,
          loading: K,
          onClick: N
        },
        "立即执行"
      )
    )
  );
}
function xn({
  agentId: e,
  onRefresh: t
}) {
  const a = f().React, { useState: n, useEffect: l, useCallback: r } = a, {
    List: s,
    Tag: o,
    Switch: h,
    Button: i,
    Empty: d,
    Spin: I,
    Typography: b,
    message: E
  } = f().antd, { PlusOutlined: U, ReloadOutlined: v, DeleteOutlined: $ } = f().antdIcons || {}, { Text: A, Paragraph: H } = b, [w, K] = n([]), [L, P] = n(!0), [j, F] = n(!1), [y, O] = n([]), [z, Z] = n(!1), C = r(async () => {
    P(!0);
    try {
      const R = await ct(e);
      K(R);
    } catch (R) {
      E.error(R.message || "加载技能失败"), K([]);
    } finally {
      P(!1);
    }
  }, [e]);
  l(() => {
    C();
  }, [C]);
  const x = async () => {
    F(!0), Z(!0);
    try {
      const R = await mt();
      O(R);
    } catch (R) {
      E.error(R.message || "加载技能池失败");
    } finally {
      Z(!1);
    }
  }, u = async (R) => {
    let m = 0, S = 0;
    for (const g of R)
      try {
        await Tt(e, g), m++;
      } catch {
        S++;
      }
    m > 0 ? (E.success(
      `成功添加 ${m} 个技能${S > 0 ? `，${S} 个失败` : ""}`
    ), C(), t()) : S > 0 && E.error("添加技能失败"), F(!1);
  }, M = async (R, m) => {
    try {
      m ? await nn(e, R.name) : await cn(e, R.name), E.success(m ? "已启用" : "已停用"), C(), t();
    } catch (S) {
      E.error(S.message || "操作失败");
    }
  }, D = async (R) => {
    try {
      await zt(e, R), E.success(`技能「${R}」已移除`), C(), t();
    } catch (m) {
      E.error(m.message || "移除技能失败");
    }
  };
  if (L)
    return a.createElement(
      "div",
      { style: { textAlign: "center", padding: 40 } },
      a.createElement(I, { size: "large" })
    );
  const te = w.filter((R) => R.enabled !== !1);
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
        A,
        { strong: !0 },
        `技能列表 (${w.length}，已启用 ${te.length})`
      ),
      a.createElement(
        "div",
        { style: { display: "flex", gap: 8 } },
        a.createElement(
          i,
          {
            size: "small",
            icon: v ? a.createElement(v) : void 0,
            onClick: C
          },
          "刷新"
        ),
        a.createElement(
          i,
          {
            type: "primary",
            size: "small",
            icon: U ? a.createElement(U) : void 0,
            onClick: x,
            style: Re
          },
          "从技能池添加"
        )
      )
    ),
    w.length === 0 ? a.createElement(d, {
      description: "该专家暂无技能",
      image: d.PRESENTED_IMAGE_SIMPLE
    }) : a.createElement(s, {
      dataSource: w,
      renderItem: (R) => a.createElement(
        s.Item,
        {
          actions: [
            a.createElement(h, {
              key: "toggle",
              size: "small",
              checked: R.enabled !== !1,
              onChange: (m) => M(R, m)
            }),
            a.createElement(
              i,
              {
                key: "del",
                type: "link",
                size: "small",
                danger: !0,
                icon: $ ? a.createElement($) : void 0,
                onClick: () => D(R.name)
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
            R.emoji ? a.createElement(
              "span",
              { style: { fontSize: 16 } },
              R.emoji
            ) : null,
            a.createElement(A, { strong: !0 }, R.name),
            R.version_text ? a.createElement(
              o,
              { style: { fontSize: 10 } },
              `v${R.version_text}`
            ) : null
          ),
          R.description ? a.createElement(
            H,
            {
              type: "secondary",
              style: { fontSize: 12, margin: 0 },
              ellipsis: { rows: 2 }
            },
            R.description
          ) : null
        )
      )
    }),
    a.createElement(Pt, {
      open: j,
      onClose: () => F(!1),
      poolSkills: y,
      installedSkillNames: w.map((R) => R.name),
      loading: z,
      onInstall: u
    })
  );
}
function Cn({
  agentId: e,
  onRefresh: t,
  isActive: a
}) {
  const n = f().React, { useState: l, useEffect: r, useCallback: s } = n, {
    List: o,
    Tag: h,
    Button: i,
    Empty: d,
    Spin: I,
    Modal: b,
    Input: E,
    Typography: U,
    message: v
  } = f().antd, { PlusOutlined: $, ReloadOutlined: A, DeleteOutlined: H } = f().antdIcons || {}, { Text: w, Paragraph: K } = U, { TextArea: L } = E, [P, j] = l([]), [F, y] = l(!0), [O, z] = l(!1), [Z, C] = l(`{
  "mcpServers": {
    "example-client": {
      "command": "npx",
      "args": ["-y", "@example/mcp-server"],
      "env": {}
    }
  }
}`), [x, u] = l(!1), M = s(async () => {
    y(!0);
    try {
      const m = await It(e);
      j(m);
    } catch (m) {
      v.error(m.message || "加载 MCP 失败"), j([]);
    } finally {
      y(!1);
    }
  }, [e]);
  r(() => {
    M();
  }, [M]), r(() => {
    a && M();
  }, [a, M]);
  const D = async (m) => {
    try {
      await on(e, m), v.success("已切换 MCP 状态"), M(), t();
    } catch (S) {
      v.error(S.message || "切换失败");
    }
  }, te = async (m) => {
    try {
      await _t(e, m), v.success(`MCP「${m}」已移除`), M(), t();
    } catch (S) {
      v.error(S.message || "移除 MCP 失败");
    }
  }, R = async () => {
    u(!0);
    try {
      const m = JSON.parse(Z), S = m.mcpServers || m, g = Object.entries(S);
      if (g.length === 0) {
        v.warning("未找到 MCP 客户端配置");
        return;
      }
      for (const [ne, N] of g) {
        const Y = N, V = Y.url ? "streamable_http" : "stdio";
        await sn(e, {
          client_key: ne,
          client: {
            name: Y.name || ne,
            description: Y.description || "",
            enabled: !0,
            transport: V,
            url: Y.url || "",
            command: Y.command || "",
            args: Y.args || [],
            env: Y.env || {},
            cwd: Y.cwd || "",
            headers: Y.headers || {}
          }
        });
      }
      v.success("MCP 客户端已创建"), z(!1), M(), t();
    } catch (m) {
      m instanceof SyntaxError ? v.error("JSON 格式错误：" + m.message) : v.error(m.message || "创建 MCP 失败");
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
      n.createElement(w, { strong: !0 }, `MCP 客户端 (${P.length})`),
      n.createElement(
        "div",
        { style: { display: "flex", gap: 8 } },
        n.createElement(
          i,
          {
            size: "small",
            icon: A ? n.createElement(A) : void 0,
            onClick: M
          },
          "刷新"
        ),
        n.createElement(
          i,
          {
            type: "primary",
            size: "small",
            icon: $ ? n.createElement($) : void 0,
            onClick: () => z(!0),
            style: Re
          },
          "添加 MCP"
        )
      )
    ),
    P.length === 0 ? n.createElement(d, {
      description: "该专家暂无 MCP 客户端",
      image: d.PRESENTED_IMAGE_SIMPLE
    }) : n.createElement(o, {
      dataSource: P,
      renderItem: (m) => n.createElement(
        o.Item,
        {
          actions: [
            n.createElement(
              i,
              {
                key: "toggle",
                size: "small",
                onClick: () => D(m.key)
              },
              m.enabled ? "停用" : "启用"
            ),
            n.createElement(
              i,
              {
                key: "del",
                type: "link",
                size: "small",
                danger: !0,
                icon: H ? n.createElement(H) : void 0,
                onClick: () => te(m.key)
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
            n.createElement(w, { strong: !0 }, m.name || m.key),
            n.createElement(
              h,
              {
                color: m.enabled ? "green" : "default",
                style: { fontSize: 10 }
              },
              m.enabled ? "启用" : "停用"
            ),
            n.createElement(
              h,
              { color: "purple", style: { fontSize: 10 } },
              m.transport
            )
          ),
          m.description ? n.createElement(
            K,
            {
              type: "secondary",
              style: { fontSize: 12, margin: 0 },
              ellipsis: { rows: 2 }
            },
            m.description
          ) : null,
          m.tools && m.tools.length > 0 ? n.createElement(
            "div",
            { style: { marginTop: 4, fontSize: 11, color: "#8c8c8c" } },
            `提供 ${m.tools.length} 个工具`
          ) : null
        )
      )
    }),
    // Create MCP modal
    n.createElement(
      b,
      {
        open: O,
        title: "添加 MCP 客户端 (JSON)",
        onCancel: () => z(!1),
        onOk: R,
        confirmLoading: x,
        okText: "创建",
        width: 560
      },
      n.createElement(
        "div",
        { style: { marginBottom: 8, fontSize: 12, color: "#8c8c8c" } },
        "粘贴 MCP 配置 JSON（支持 mcpServers 格式），将创建到当前专家工作区："
      ),
      n.createElement(L, {
        value: Z,
        onChange: (m) => C(m.target.value),
        rows: 12,
        style: { fontFamily: "monospace", fontSize: 12 }
      })
    )
  );
}
function kn({ agentId: e }) {
  const t = f().React, { useState: a, useEffect: n, useCallback: l, useRef: r } = t, {
    Card: s,
    InputNumber: o,
    Input: h,
    Select: i,
    Switch: d,
    Button: I,
    Spin: b,
    Space: E,
    Typography: U,
    Divider: v,
    message: $
  } = f().antd, { SaveOutlined: A } = f().antdIcons || {}, { Text: H } = U, [w, K] = a(!0), [L, P] = a(!1), j = r(null), [F, y] = a(60), [O, z] = a(""), [Z, C] = a(!0), [x, u] = a(30), [M, D] = a("zh"), [te, R] = a("UTC"), [m, S] = a(!0), [g, ne] = a(100), [N, Y] = a(!0), [V, G] = a(3), [k, oe] = a(1), [p, ae] = a(!0), [ce, xe] = a(3), [J, me] = a(2), [B, le] = a(60), [q, ie] = a(1), [W, re] = a(0), [Ee, _e] = a(1), [ve, _] = a(0), [se, ue] = a(30), [be, we] = a(50), [Se, Ae] = a("light"), [Ue, Fe] = a("scroll"), [Ge, Be] = a("remelight"), [Ie, He] = a("AUTO"), Le = l(async () => {
    var T, Ce, ke, ze, Te, $e;
    K(!0);
    try {
      const [pe, tt, nt] = await Promise.all([
        yn(e),
        En(e).catch(() => "zh"),
        vn().catch(() => "UTC")
      ]);
      j.current = pe, y(pe.shell_command_timeout ?? 60), z(pe.shell_command_executable ?? "");
      const Ve = pe.auto_title_config ?? { enabled: !0, timeout_seconds: 30 };
      C(Ve.enabled ?? !0), u(Ve.timeout_seconds ?? 30), D(tt), R(nt);
      const We = pe.loop ?? {};
      S(((T = We.iteration) == null ? void 0 : T.enabled) ?? !0), ne(((Ce = We.iteration) == null ? void 0 : Ce.max_iterations) ?? pe.max_iters ?? 100), Y(((ke = We.doom_loop) == null ? void 0 : ke.enabled) ?? !0), G(((ze = We.doom_loop) == null ? void 0 : ze.window_size) ?? 3), oe(((Te = We.doom_loop) == null ? void 0 : Te.similarity_threshold) ?? 1), ae(pe.llm_retry_enabled ?? !0), xe(pe.llm_max_retries ?? 3), me(pe.llm_backoff_base ?? 2), le(pe.llm_backoff_cap ?? 60), ie(pe.llm_max_concurrent ?? 1), re(pe.llm_max_qpm ?? 0), _e(pe.llm_rate_limit_pause ?? 1), _(pe.llm_rate_limit_jitter ?? 0), ue(pe.llm_acquire_timeout ?? 30), we(pe.history_max_length ?? 50), Ae(pe.context_manager_backend ?? "light"), Fe((($e = pe.light_context_config) == null ? void 0 : $e.strategy) ?? "scroll"), Be(pe.memory_manager_backend ?? "remelight"), He(pe.approval_level ?? "AUTO");
    } catch (pe) {
      $.error(pe.message || "加载运行配置失败");
    } finally {
      K(!1);
    }
  }, [e]);
  n(() => {
    Le();
  }, [Le]);
  const je = async () => {
    var Ce, ke;
    const T = j.current;
    if (T) {
      P(!0);
      try {
        const ze = {
          ...T,
          max_iters: g,
          loop: {
            ...T.loop ?? {},
            iteration: { enabled: m, max_iterations: g },
            doom_loop: {
              enabled: N,
              window_size: V,
              similarity_threshold: k,
              stages: ((ke = (Ce = T.loop) == null ? void 0 : Ce.doom_loop) == null ? void 0 : ke.stages) ?? []
            }
          },
          shell_command_timeout: F,
          shell_command_executable: O,
          auto_title_config: {
            enabled: Z,
            timeout_seconds: x
          },
          llm_retry_enabled: p,
          llm_max_retries: ce,
          llm_backoff_base: J,
          llm_backoff_cap: B,
          llm_max_concurrent: q,
          llm_max_qpm: W,
          llm_rate_limit_pause: Ee,
          llm_rate_limit_jitter: ve,
          llm_acquire_timeout: se,
          history_max_length: be,
          context_manager_backend: Se,
          light_context_config: {
            ...T.light_context_config ?? {},
            strategy: Ue
          },
          memory_manager_backend: Ge,
          approval_level: Ie
        };
        await fn(e, ze), j.current = ze, M && await hn(e, M).catch(() => {
        }), te && await bn(te).catch(() => {
        }), $.success("运行配置已保存");
      } catch (ze) {
        $.error(ze.message || "保存运行配置失败");
      } finally {
        P(!1);
      }
    }
  };
  if (w)
    return t.createElement(
      "div",
      { style: { textAlign: "center", padding: 40 } },
      t.createElement(b, { size: "large" })
    );
  const X = (T, Ce, ke) => t.createElement(
    "div",
    { style: Ot },
    t.createElement("div", { style: Xe }, T),
    Ce,
    ke ? t.createElement(
      H,
      { type: "secondary", style: $t },
      ke
    ) : null
  ), de = (T, Ce, ke, ze) => t.createElement(
    "div",
    { style: At },
    t.createElement(
      "div",
      null,
      t.createElement("div", { style: Xe }, T),
      Ce
    ),
    t.createElement(
      "div",
      null,
      t.createElement("div", { style: Xe }, ke),
      ze
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
    de(
      "Shell 命令超时 (秒)",
      t.createElement(o, {
        min: 1,
        value: F,
        onChange: (T) => y(T ?? 60),
        style: { width: "100%" }
      }),
      "Shell 可执行文件",
      t.createElement(h, {
        value: O,
        onChange: (T) => z(T.target.value),
        placeholder: "留空使用系统默认",
        style: { width: "100%" }
      })
    ),
    de(
      "语言",
      t.createElement(i, {
        value: M,
        onChange: (T) => D(T),
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
        value: te,
        onChange: (T) => R(T),
        style: { width: "100%" },
        showSearch: !0,
        filterOption: (T, Ce) => {
          var ke;
          return (((ke = Ce == null ? void 0 : Ce.label) == null ? void 0 : ke.toString()) || "").toLowerCase().includes(T.toLowerCase());
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
        ].map((T) => ({ value: T, label: T }))
      })
    ),
    de(
      "自动生成会话标题",
      t.createElement(E, null, t.createElement(d, {
        checked: Z,
        onChange: (T) => C(T)
      })),
      "标题生成超时 (秒)",
      t.createElement(o, {
        min: 5,
        value: x,
        onChange: (T) => u(T ?? 30),
        style: { width: "100%" },
        disabled: !Z
      })
    ),
    // ── Section: 审批级别 ──
    t.createElement(v, { style: { margin: "8px 0 16px" } }),
    t.createElement("div", { style: De }, "审批级别"),
    X(
      "工具执行审批",
      t.createElement(i, {
        value: Ie,
        onChange: (T) => He(T),
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
    t.createElement("div", { style: De }, "迭代与循环"),
    X(
      "启用迭代限制",
      t.createElement(d, {
        checked: m,
        onChange: (T) => S(T)
      }),
      "停止 Agent 前的最大循环轮次"
    ),
    m ? X(
      "最大迭代次数",
      t.createElement(o, {
        min: 1,
        max: 500,
        value: g,
        onChange: (T) => ne(T ?? 100),
        style: { width: "100%" }
      })
    ) : null,
    X(
      "启用重复循环保护",
      t.createElement(d, {
        checked: N,
        onChange: (T) => Y(T)
      }),
      "检测并阻止重复操作循环"
    ),
    N ? de(
      "检测窗口大小",
      t.createElement(o, {
        min: 2,
        max: 20,
        value: V,
        onChange: (T) => G(T ?? 3),
        style: { width: "100%" }
      }),
      "相似度阈值",
      t.createElement(o, {
        min: 0,
        max: 1,
        step: 0.05,
        value: k,
        onChange: (T) => oe(T ?? 1),
        style: { width: "100%" }
      })
    ) : null,
    // ── Section: LLM 重试 ──
    t.createElement(v, { style: { margin: "8px 0 16px" } }),
    t.createElement("div", { style: De }, "LLM 重试"),
    X(
      "启用 LLM 重试",
      t.createElement(d, {
        checked: p,
        onChange: (T) => ae(T)
      })
    ),
    de(
      "最大重试次数",
      t.createElement(o, {
        min: 1,
        value: ce,
        onChange: (T) => xe(T ?? 3),
        style: { width: "100%" },
        disabled: !p
      }),
      "退避基数 (秒)",
      t.createElement(o, {
        min: 0.1,
        step: 0.1,
        value: J,
        onChange: (T) => me(T ?? 2),
        style: { width: "100%" },
        disabled: !p
      })
    ),
    X(
      "退避上限 (秒)",
      t.createElement(o, {
        min: 0.5,
        step: 0.5,
        value: B,
        onChange: (T) => le(T ?? 60),
        style: { width: 200 },
        disabled: !p
      })
    ),
    // ── Section: LLM 限流 ──
    t.createElement(v, { style: { margin: "8px 0 16px" } }),
    t.createElement("div", { style: De }, "LLM 限流"),
    de(
      "最大并发数",
      t.createElement(o, {
        min: 1,
        value: q,
        onChange: (T) => ie(T ?? 1),
        style: { width: "100%" }
      }),
      "最大 QPM (0=不限)",
      t.createElement(o, {
        min: 0,
        step: 10,
        value: W,
        onChange: (T) => re(T ?? 0),
        style: { width: "100%" }
      })
    ),
    de(
      "限流暂停时间 (秒)",
      t.createElement(o, {
        min: 1,
        step: 0.5,
        value: Ee,
        onChange: (T) => _e(T ?? 1),
        style: { width: "100%" }
      }),
      "限流抖动 (秒)",
      t.createElement(o, {
        min: 0,
        step: 0.5,
        value: ve,
        onChange: (T) => _(T ?? 0),
        style: { width: "100%" }
      })
    ),
    X(
      "获取超时 (秒)",
      t.createElement(o, {
        min: 10,
        step: 10,
        value: se,
        onChange: (T) => ue(T ?? 30),
        style: { width: 200 }
      }),
      "应大于 限流暂停 + 抖动"
    ),
    // ── Section: 上下文与记忆 ──
    t.createElement(v, { style: { margin: "8px 0 16px" } }),
    t.createElement("div", { style: De }, "上下文与记忆"),
    de(
      "上下文管理后端",
      t.createElement(i, {
        value: Se,
        onChange: (T) => Ae(T),
        style: { width: "100%" },
        options: [{ value: "light", label: "light" }]
      }),
      "上下文策略",
      t.createElement(i, {
        value: Ue,
        onChange: (T) => Fe(T),
        style: { width: "100%" },
        options: [
          { value: "scroll", label: "scroll (滚动窗口)" },
          { value: "native", label: "native (原生)" }
        ]
      })
    ),
    de(
      "记忆管理后端",
      t.createElement(i, {
        value: Ge,
        onChange: (T) => Be(T),
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
        value: be,
        onChange: (T) => we(T ?? 50),
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
          icon: A ? t.createElement(A) : void 0,
          loading: L,
          onClick: je,
          style: Re
        },
        "保存运行配置"
      )
    )
  );
}
function Tn({
  expert: e,
  open: t,
  onClose: a,
  onRefresh: n
}) {
  const l = f().React, { useState: r, useEffect: s, useCallback: o } = l, { Modal: h, Tabs: i, Spin: d, Typography: I } = f().antd, { SettingOutlined: b } = f().antdIcons || {}, { Text: E } = I, [U, v] = r([]), [$, A] = r(!1), [H, w] = r("heartbeat"), K = o(async () => {
    if (e) {
      A(!0);
      try {
        const F = await Sn(e.agent.id);
        v(F);
      } catch {
        v([]);
      } finally {
        A(!1);
      }
    }
  }, [e]);
  if (s(() => {
    t && e && K();
  }, [t, e, K]), !e) return null;
  const { agent: L } = e, P = () => {
    K(), n();
  }, j = [
    {
      key: "heartbeat",
      label: "心跳",
      children: l.createElement(wn, {
        agentId: L.id
      })
    },
    {
      key: "files",
      label: "文件",
      children: $ ? l.createElement(
        "div",
        { style: { textAlign: "center", padding: 40 } },
        l.createElement(d, { size: "large" })
      ) : l.createElement(Mt, {
        agentId: L.id,
        systemPromptFiles: U,
        onRefresh: P
      })
    },
    {
      key: "skills",
      label: `技能 (${e.skills.filter((F) => F.enabled !== !1).length})`,
      children: l.createElement(xn, {
        agentId: L.id,
        onRefresh: n
      })
    },
    {
      key: "mcp",
      label: `MCP (${e.mcps.length})`,
      children: l.createElement(Cn, {
        agentId: L.id,
        onRefresh: n,
        isActive: H === "mcp"
      })
    },
    {
      key: "running",
      label: "运行配置",
      children: l.createElement(kn, {
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
        b ? l.createElement(b, { style: { fontSize: 18 } }) : null,
        l.createElement("span", null, `配置 - ${L.name}`),
        l.createElement(
          E,
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
    l.createElement(i, {
      items: j,
      activeKey: H,
      onChange: (F) => w(F),
      size: "small",
      tabBarStyle: { marginBottom: 16, sticky: 0 }
    })
  );
}
function zn({
  expert: e,
  onClick: t,
  onSummon: a,
  onConfigure: n
}) {
  const l = f().React, { Card: r, Tag: s, Badge: o, Typography: h, Spin: i, Button: d, Tooltip: I } = f().antd, { Text: b } = h, { ThunderboltOutlined: E, SettingOutlined: U } = f().antdIcons || {}, { agent: v, skills: $, mcps: A, loading: H } = e, w = v.enabled, K = $.filter((j) => j.enabled !== !1).map((j) => j.name), L = A.map((j) => j.name || j.key), P = v.active_model ? `${v.active_model.provider_id}/${v.active_model.model}` : null;
  return l.createElement(
    r,
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
        l.createElement(Ne, { name: v.name, size: 36 }),
        l.createElement(
          "div",
          null,
          l.createElement(
            b,
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
      l.createElement(o, {
        status: w ? "success" : "default",
        text: w ? "启用" : "停用"
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
      dt(v.description, l)
    ) : l.createElement(
      "div",
      { style: { fontSize: 12, color: "#bfbfbf", marginBottom: 10, minHeight: 54, flex: "1 0 auto" } },
      "暂无描述"
    ),
    // Model info
    P ? l.createElement(
      "div",
      { style: { marginBottom: 8 } },
      l.createElement(
        s,
        { color: "geekblue", style: { fontSize: 11 } },
        `🤖 ${P}`
      )
    ) : null,
    // Skills
    H ? l.createElement(i, { size: "small" }) : l.createElement(
      "div",
      { style: { marginBottom: 6 } },
      l.createElement(
        "div",
        { style: { fontSize: 11, color: "#8c8c8c", marginBottom: 4 } },
        `技能 (${K.length})`
      ),
      l.createElement(ft, {
        items: K,
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
      l.createElement(ft, {
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
          d,
          {
            type: "text",
            size: "small",
            icon: U ? l.createElement(U, {
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
        d,
        {
          type: "primary",
          size: "small",
          icon: E ? l.createElement(E) : void 0,
          disabled: !w,
          onClick: (j) => {
            j.stopPropagation(), a && a();
          },
          style: Re
        },
        "召唤专家"
      )
    )
  );
}
function In({
  expert: e,
  open: t,
  onClose: a,
  onRefresh: n
}) {
  const l = f().React, {
    Drawer: r,
    Descriptions: s,
    Tag: o,
    Typography: h,
    Space: i,
    Button: d,
    Empty: I,
    Tabs: b,
    List: E,
    Spin: U,
    Modal: v,
    message: $
  } = f().antd, { Text: A, Paragraph: H } = h, {
    EditOutlined: w,
    ThunderboltOutlined: K,
    FileTextOutlined: L,
    ToolOutlined: P,
    PlusOutlined: j
  } = f().antdIcons || {}, [F, y] = l.useState(!1), [O, z] = l.useState(
    []
  ), [Z, C] = l.useState(!1);
  if (!e) return null;
  const { agent: x, config: u, skills: M, mcps: D, loading: te } = e, R = M.filter((p) => p.enabled !== !1), m = (p) => {
    window.history.pushState({}, "", p), window.dispatchEvent(new PopStateEvent("popstate"));
  }, S = l.createElement(
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
          o,
          { color: x.enabled ? "green" : "default" },
          x.enabled ? "启用" : "停用"
        )
      ),
      l.createElement(
        s.Item,
        { label: "功能简介" },
        x.description ? dt(x.description, l) : "暂无描述"
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
        L ? l.createElement(L, {
          style: { fontSize: 14, color: "#1677ff" }
        }) : null,
        l.createElement(A, { strong: !0 }, "系统提示词文件")
      ),
      l.createElement(
        i,
        { wrap: !0 },
        ...u.system_prompt_files.map(
          (p, ae) => l.createElement(
            o,
            {
              key: ae,
              icon: L ? l.createElement(L) : void 0,
              style: { fontSize: 12 }
            },
            p
          )
        )
      )
    ) : null
  ), g = async () => {
    y(!0), C(!0);
    try {
      const p = await mt();
      z(p);
    } catch (p) {
      $.error(p.message || "加载技能池失败");
    } finally {
      C(!1);
    }
  }, ne = async (p) => {
    let ae = 0, ce = 0;
    for (const xe of p)
      try {
        await Tt(x.id, xe), ae++;
      } catch {
        ce++;
      }
    ae > 0 ? ($.success(
      `成功添加 ${ae} 个技能${ce > 0 ? `，${ce} 个失败` : ""}`
    ), n()) : ce > 0 && $.error("添加技能失败"), y(!1);
  }, N = async (p) => {
    try {
      await zt(x.id, p), $.success(`技能「${p}」已移除`), n();
    } catch (ae) {
      $.error(ae.message || "移除技能失败");
    }
  }, Y = async (p) => {
    try {
      await _t(x.id, p), $.success(`MCP「${p}」已移除`), n();
    } catch (ae) {
      $.error(ae.message || "移除 MCP 失败");
    }
  }, V = te ? l.createElement(
    "div",
    { style: { textAlign: "center", padding: 40 } },
    l.createElement(U, { size: "large" })
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
        A,
        { strong: !0 },
        `已启用技能 (${R.length})`
      ),
      l.createElement(
        d,
        {
          type: "primary",
          size: "small",
          icon: j ? l.createElement(j) : void 0,
          onClick: g
        },
        "从技能池添加"
      )
    ),
    R.length === 0 ? l.createElement(I, {
      description: "该专家暂无已启用的技能",
      image: I.PRESENTED_IMAGE_SIMPLE
    }) : l.createElement(E, {
      dataSource: R,
      renderItem: (p) => l.createElement(
        E.Item,
        {
          actions: [
            l.createElement(
              d,
              {
                type: "link",
                size: "small",
                danger: !0,
                onClick: () => N(p.name)
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
            p.emoji ? l.createElement(
              "span",
              { style: { fontSize: 16 } },
              p.emoji
            ) : null,
            l.createElement(A, { strong: !0 }, p.name),
            p.version_text ? l.createElement(
              o,
              { style: { fontSize: 10 } },
              `v${p.version_text}`
            ) : null
          ),
          p.description ? l.createElement(
            H,
            {
              type: "secondary",
              style: { fontSize: 12, margin: 0 },
              ellipsis: { rows: 2 }
            },
            p.description
          ) : null,
          p.tags && p.tags.length > 0 ? l.createElement(
            "div",
            { style: { marginTop: 4 } },
            ...p.tags.map(
              (ae, ce) => l.createElement(
                o,
                {
                  key: ce,
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
    l.createElement(Pt, {
      open: F,
      onClose: () => y(!1),
      poolSkills: O,
      installedSkillNames: R.map((p) => p.name),
      loading: Z,
      onInstall: ne
    })
  ), G = te ? l.createElement(
    "div",
    { style: { textAlign: "center", padding: 40 } },
    l.createElement(U, { size: "large" })
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
        A,
        { strong: !0 },
        `MCP 客户端 (${D.length})`
      ),
      l.createElement(
        d,
        {
          type: "primary",
          size: "small",
          icon: j ? l.createElement(j) : void 0,
          onClick: () => {
            window.history.pushState({}, "", `/agents/${x.id}/mcp`), window.dispatchEvent(new PopStateEvent("popstate"));
          }
        },
        "配置 MCP"
      )
    ),
    D.length === 0 ? l.createElement(I, {
      description: "该专家暂无关联的 MCP 客户端，点击「配置 MCP」添加",
      image: I.PRESENTED_IMAGE_SIMPLE
    }) : l.createElement(E, {
      dataSource: D,
      renderItem: (p) => l.createElement(
        E.Item,
        {
          actions: [
            l.createElement(
              d,
              {
                type: "link",
                size: "small",
                danger: !0,
                onClick: () => Y(p.key)
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
              A,
              { strong: !0 },
              p.name || p.key
            ),
            l.createElement(
              o,
              {
                color: p.enabled ? "green" : "default",
                style: { fontSize: 10 }
              },
              p.enabled ? "启用" : "停用"
            ),
            l.createElement(
              o,
              { color: "purple", style: { fontSize: 10 } },
              p.transport
            )
          ),
          p.description ? l.createElement(
            H,
            {
              type: "secondary",
              style: { fontSize: 12, margin: 0 },
              ellipsis: { rows: 2 }
            },
            p.description
          ) : null,
          p.tools && p.tools.length > 0 ? l.createElement(
            "div",
            {
              style: {
                marginTop: 4,
                fontSize: 11,
                color: "#8c8c8c"
              }
            },
            `提供 ${p.tools.length} 个工具`
          ) : null
        )
      )
    })
  ), k = u != null && u.tools ? l.createElement(
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
        P ? l.createElement(P, {
          style: { fontSize: 14, color: "#1677ff" }
        }) : null,
        l.createElement(A, { strong: !0 }, "工具配置")
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
  }), oe = [
    { key: "basic", label: "基本信息", children: S },
    {
      key: "skills",
      label: `技能 (${R.length})`,
      children: V
    },
    {
      key: "prompts",
      label: "推荐提问",
      children: l.createElement(On, {
        skills: R,
        agentId: x.id
      })
    },
    {
      key: "knowledge",
      label: "专家记忆",
      children: l.createElement(Mt, {
        agentId: x.id,
        systemPromptFiles: (u == null ? void 0 : u.system_prompt_files) || [],
        onRefresh: () => n()
      })
    },
    { key: "mcp", label: `MCP (${D.length})`, children: G },
    { key: "tools", label: "工具配置", children: k }
  ];
  return l.createElement(
    r,
    {
      title: l.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 8 } },
        l.createElement(Ne, { name: x.name, size: 28 }),
        l.createElement("span", null, x.name)
      ),
      open: t,
      onClose: a,
      width: 560,
      extra: l.createElement(
        i,
        null,
        l.createElement(
          d,
          {
            size: "small",
            icon: w ? l.createElement(w) : void 0,
            onClick: () => {
              a();
              try {
                const p = f();
                p.setSelectedAgent && p.setSelectedAgent(x.id);
              } catch (p) {
                console.warn("[ugsci] Failed to set selected agent:", p);
              }
              setTimeout(() => m("/agents"), 0);
            }
          },
          "编辑专家"
        ),
        l.createElement(
          d,
          {
            type: "primary",
            size: "small",
            icon: K ? l.createElement(K) : void 0,
            onClick: () => {
              a();
              try {
                const p = f();
                p.setSelectedAgent && p.setSelectedAgent(x.id);
              } catch (p) {
                console.warn("[ugsci] Failed to set selected agent:", p);
              }
              setTimeout(() => m("/chat"), 0);
            }
          },
          "开始对话"
        )
      )
    },
    l.createElement(b, {
      items: oe,
      defaultActiveKey: "basic"
    })
  );
}
function _n({
  open: e,
  onClose: t,
  onCreated: a
}) {
  const n = f().React, { useState: l } = n, {
    Modal: r,
    Card: s,
    Tag: o,
    Input: h,
    Row: i,
    Col: d,
    Spin: I,
    message: b,
    Typography: E
  } = f().antd, { Text: U } = E, { FileAddOutlined: v } = f().antdIcons || {}, [$, A] = l(!1), [H, w] = l(""), [K, L] = l(!1), P = async (y, O) => {
    A(!0);
    try {
      const z = await ee("/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: y || "新专家",
          description: O || "",
          skill_names: []
        })
      });
      await Qe(
        z.id,
        "AGENTS.md",
        `# ${y || "新专家"}

请在此处编写该专家的系统提示词。
`
      ), b.success("专家「" + (y || "新专家") + "」创建成功"), L(!1), setTimeout(() => {
        t(), a();
      }, 0);
    } catch (z) {
      b.error(z.message || "创建专家失败");
    } finally {
      A(!1);
    }
  }, j = at.filter((y) => {
    if (!H.trim()) return !0;
    const O = H.toLowerCase();
    return y.name.toLowerCase().includes(O) || y.description.toLowerCase().includes(O) || y.category.toLowerCase().includes(O);
  }), F = async (y) => {
    A(!0);
    try {
      const O = await ee("/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: y.name,
          description: y.description,
          skill_names: y.recommendedSkills
        })
      });
      await Qe(O.id, "AGENTS.md", y.systemPrompt);
      const z = await Ze(O.id);
      z.approval_level = y.approvalLevel, await ee(`/agents/${encodeURIComponent(O.id)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(z)
      }), b.success(`专家「${y.name}」创建成功`), t(), a();
    } catch (O) {
      b.error(O.message || "创建专家失败");
    } finally {
      A(!1);
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
          onChange: (y) => w(y.target.value),
          allowClear: !0
        })
      ),
      $ ? n.createElement(
        "div",
        { style: { textAlign: "center", padding: 60 } },
        n.createElement(I, { size: "large" }),
        n.createElement(
          "div",
          { style: { marginTop: 12, color: "#8c8c8c" } },
          "正在创建专家..."
        )
      ) : n.createElement(
        i,
        { gutter: [12, 12] },
        // ── Blank template card (always first) ──
        H.trim() ? null : n.createElement(
          d,
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
                v ? n.createElement(v) : "📝"
              ),
              n.createElement(
                "div",
                { style: { flex: 1 } },
                n.createElement(
                  U,
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
        ...j.map(
          (y) => n.createElement(
            d,
            { key: y.id, xs: 24, sm: 12 },
            n.createElement(
              s,
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
                n.createElement(Ne, {
                  name: y.name,
                  size: 40
                }),
                n.createElement(
                  "div",
                  { style: { flex: 1 } },
                  n.createElement(
                    U,
                    { strong: !0, style: { fontSize: 15 } },
                    y.name
                  ),
                  n.createElement(
                    "div",
                    null,
                    n.createElement(
                      o,
                      { color: "blue", style: { fontSize: 10 } },
                      y.category
                    ),
                    y.approvalLevel === "MANUAL" ? n.createElement(
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
                dt(y.description, n)
              )
            )
          )
        )
      )
    ),
    // ── Blank template creation modal (sibling, not nested inside Modal) ──
    n.createElement(Pn, {
      open: K,
      onCancel: () => L(!1),
      onCreate: P
    })
  );
}
function Pn({
  open: e,
  onCancel: t,
  onCreate: a
}) {
  const n = f().React, { useState: l, useEffect: r } = n, { Modal: s, Input: o, message: h } = f().antd, [i, d] = l(""), [I, b] = l(""), [E, U] = l(!1);
  return r(() => {
    e && (d(""), b(""), U(!1));
  }, [e]), n.createElement(
    s,
    {
      open: e,
      title: "从空白模版创建专家",
      onCancel: t,
      onOk: () => {
        if (!i.trim()) {
          h.warning("请输入专家名称");
          return;
        }
        U(!0), Promise.resolve(a(i.trim(), I.trim())).finally(() => {
          U(!1);
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
      n.createElement(o, {
        placeholder: "输入专家名称",
        value: i,
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
      n.createElement(o.TextArea, {
        placeholder: "简要描述该专家的职责和能力...",
        value: I,
        onChange: (v) => b(v.target.value),
        rows: 3,
        maxLength: 200
      })
    )
  );
}
function Mt({
  agentId: e,
  systemPromptFiles: t,
  onRefresh: a
}) {
  const n = f().React, { useState: l, useEffect: r, useCallback: s } = n, {
    List: o,
    Tag: h,
    Switch: i,
    Button: d,
    Modal: I,
    Input: b,
    Spin: E,
    Empty: U,
    message: v,
    Typography: $
  } = f().antd, { FileTextOutlined: A, PlusOutlined: H, EditOutlined: w, ReloadOutlined: K } = f().antdIcons || {}, { Text: L } = $, [P, j] = l([]), [F, y] = l(!0), [O, z] = l(
    t || []
  ), [Z, C] = l(!1), [x, u] = l(null), [M, D] = l(""), [te, R] = l(""), [m, S] = l(!1), g = s(async () => {
    y(!0);
    try {
      const G = await tn(e);
      j(G);
    } catch (G) {
      v.error(G.message || "加载记忆文件失败"), j([]);
    } finally {
      y(!1);
    }
  }, [e]);
  r(() => {
    g();
  }, [g]), r(() => {
    z(t || []);
  }, [t]);
  const ne = async (G, k) => {
    const oe = new Set(O);
    if (k)
      oe.add(G);
    else {
      if (yt.includes(G) && G === "AGENTS.md") {
        v.warning("AGENTS.md 是核心文件，不能停用");
        return;
      }
      oe.delete(G);
    }
    const p = Array.from(oe);
    z(p);
    try {
      await gt(e, p), v.success(k ? "已启用记忆文件" : "已停用记忆文件"), a();
    } catch (ae) {
      v.error(ae.message || "更新失败"), z(t || []);
    }
  }, N = async (G) => {
    try {
      const k = await ee(
        `/workspace/files/${encodeURIComponent(G)}`,
        { headers: { "X-Agent-Id": e } }
      );
      u(G), D(k.content || ""), C(!0);
    } catch (k) {
      v.error(k.message || "读取文件失败");
    }
  }, Y = () => {
    u(null), D(""), R(""), C(!0);
  }, V = async () => {
    const G = x || te.trim();
    if (!G) {
      v.warning("请输入文件名");
      return;
    }
    const k = G.endsWith(".md") ? G : `${G}.md`;
    S(!0);
    try {
      if (await Qe(e, k, M), !x && !O.includes(k)) {
        const oe = [...O, k];
        z(oe), await gt(e, oe);
      }
      v.success("保存成功"), C(!1), g(), a();
    } catch (oe) {
      v.error(oe.message || "保存失败");
    } finally {
      S(!1);
    }
  };
  return F ? n.createElement(
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
          L,
          { strong: !0 },
          `记忆文件 (${P.length})`
        ),
        n.createElement(
          L,
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
            icon: K ? n.createElement(K) : void 0,
            onClick: g
          },
          "刷新"
        ),
        n.createElement(
          d,
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
    P.length === 0 ? n.createElement(U, {
      description: "暂无记忆文件，点击「新建记忆文件」添加",
      image: U.PRESENTED_IMAGE_SIMPLE
    }) : n.createElement(o, {
      dataSource: P,
      renderItem: (G) => {
        const k = O.includes(G.filename), oe = yt.includes(G.filename);
        return n.createElement(
          o.Item,
          {
            actions: [
              n.createElement(
                d,
                {
                  type: "link",
                  size: "small",
                  icon: w ? n.createElement(w) : void 0,
                  onClick: () => N(G.filename)
                },
                "编辑"
              )
            ]
          },
          n.createElement(o.Item.Meta, {
            avatar: n.createElement(A, {
              style: {
                fontSize: 20,
                color: k ? "#1677ff" : "#bfbfbf"
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
              oe ? n.createElement(
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
          n.createElement(i, {
            checked: k,
            size: "small",
            onChange: (p) => ne(G.filename, p)
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
        onOk: V,
        confirmLoading: m,
        okText: "保存"
      },
      x ? null : n.createElement(
        "div",
        { style: { marginBottom: 12 } },
        n.createElement(b, {
          placeholder: "文件名（如：油藏工程记忆库.md）",
          value: te,
          onChange: (G) => R(G.target.value),
          addonAfter: te.endsWith(".md") ? "" : ".md"
        })
      ),
      n.createElement(b.TextArea, {
        value: M,
        onChange: (G) => D(G.target.value),
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
function On({
  skills: e,
  agentId: t
}) {
  const a = f().React, { useMemo: n } = a, {
    List: l,
    Tag: r,
    Typography: s,
    Empty: o,
    Button: h,
    message: i
  } = f().antd, { ThunderboltOutlined: d, CopyOutlined: I } = f().antdIcons || {}, { Text: b } = s, E = n(() => en(e), [e]), U = ($) => {
    try {
      const A = f();
      A.setSelectedAgent && A.setSelectedAgent(t);
    } catch {
    }
    try {
      sessionStorage.setItem("ugsci_pending_prompt", $);
    } catch {
    }
    window.history.pushState({}, "", "/chat"), window.dispatchEvent(new PopStateEvent("popstate"));
  }, v = ($) => {
    var A;
    (A = navigator.clipboard) == null || A.writeText($).then(() => {
      i.success("已复制到剪贴板");
    });
  };
  return E.length === 0 ? a.createElement(o, {
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
      d ? a.createElement(d, {
        style: { fontSize: 14, color: "#1677ff" }
      }) : null,
      a.createElement(
        b,
        { strong: !0 },
        `推荐提问 (${E.length})`
      ),
      a.createElement(
        b,
        { type: "secondary", style: { fontSize: 12 } },
        "· 从技能描述中自动提取"
      )
    ),
    a.createElement(l, {
      dataSource: E,
      renderItem: ($, A) => a.createElement(
        l.Item,
        {
          actions: [
            a.createElement(
              h,
              {
                type: "link",
                size: "small",
                icon: I ? a.createElement(I) : void 0,
                onClick: () => v($)
              },
              "复制"
            )
          ]
        },
        a.createElement(l.Item.Meta, {
          avatar: a.createElement(
            r,
            { color: "blue", style: { borderRadius: "50%" } },
            `${A + 1}`
          ),
          title: a.createElement(
            "div",
            {
              style: {
                cursor: "pointer",
                color: "#1677ff"
              },
              onClick: () => U($)
            },
            $
          ),
          description: a.createElement(
            b,
            { type: "secondary", style: { fontSize: 12 } },
            "点击直接发送给专家"
          )
        })
      )
    })
  );
}
function An() {
  var ve;
  const e = f().React, { useState: t, useEffect: a, useCallback: n, useMemo: l } = e, {
    Spin: r,
    Empty: s,
    Input: o,
    Button: h,
    message: i,
    Row: d,
    Col: I,
    Tabs: b,
    Modal: E,
    Typography: U
  } = f().antd, {
    ReloadOutlined: v,
    PlusOutlined: $,
    SearchOutlined: A,
    TeamOutlined: H,
    UserOutlined: w
  } = f().antdIcons || {}, { Text: K, Paragraph: L } = U, [P, j] = t([]), [F, y] = t(!0), [O, z] = t(!1), [Z, C] = t(null), [x, u] = t(""), [M, D] = t(!1), [te, R] = t("experts"), [m, S] = t(
    null
  ), [g, ne] = t(""), [N, Y] = t(!1), [V, G] = t(!1), [k, oe] = t(null), [p, ae] = t([]), ce = n(async () => {
    y(!0);
    try {
      const _ = await it(), se = await Promise.all(
        _.map(async (ue) => {
          try {
            const [be, we, Se] = await Promise.all([
              Ze(ue.id).catch(() => null),
              ct(ue.id).catch(() => []),
              It(ue.id).catch(() => [])
            ]);
            return {
              agent: ue,
              config: be,
              skills: we,
              mcps: Se,
              loading: !1
            };
          } catch {
            return {
              agent: ue,
              config: null,
              skills: [],
              mcps: [],
              loading: !1
            };
          }
        })
      );
      j(se), ae(_);
    } catch (_) {
      i.error(_.message || "加载专家列表失败"), j([]);
    } finally {
      y(!1);
    }
  }, []);
  a(() => {
    ce();
  }, [ce]), a(() => {
    if (k && V) {
      const _ = P.find(
        (se) => se.agent.id === k.agent.id
      );
      _ && _ !== k && oe(_);
    }
  }, [P, k, V]);
  const xe = n(
    async (_) => {
      var we;
      const se = _.coordinatorName || ((we = _.members[0]) == null ? void 0 : we.name);
      if (!se) {
        i.error("无法确定协调者专家");
        return;
      }
      const ue = Ye(p, se);
      if (!ue) {
        i.error(`未找到协调者专家「${se}」，请先创建该专家`);
        return;
      }
      if (/\{.+?\}/.test(_.taskTemplate)) {
        ne(""), S(_);
        return;
      }
      await J(_, ue, _.taskTemplate);
    },
    [p, i]
  ), J = n(
    async (_, se, ue) => {
      var be;
      Y(!0);
      try {
        const we = qt(_), Se = ue ? we.replace(_.taskTemplate, ue) : we, Ae = f();
        Ae.setSelectedAgent && Ae.setSelectedAgent(se), await Vt(se, Se), i.success(
          `团队任务已发起，协调者：${_.coordinatorName || ((be = _.members[0]) == null ? void 0 : be.name)}`
        ), S(null), me("/chat");
      } catch (we) {
        i.error(we.message || "发起团队任务失败");
      } finally {
        Y(!1);
      }
    },
    [i]
  ), me = (_) => {
    window.history.pushState({}, "", _), window.dispatchEvent(new PopStateEvent("popstate"));
  }, B = n((_) => {
    C(_), z(!0);
  }, []), le = n((_) => {
    oe(_), G(!0);
  }, []), q = n(
    (_) => {
      if (!_.agent.enabled) {
        i.warning(`专家「${_.agent.name}」未启用，请先启用`);
        return;
      }
      try {
        const se = f();
        se.setSelectedAgent && se.setSelectedAgent(_.agent.id);
      } catch (se) {
        console.warn("[ugsci] Failed to set selected agent:", se);
      }
      i.success(`已召唤专家「${_.agent.name}」，正在跳转至对话...`), me("/chat");
    },
    [i]
  ), ie = l(() => {
    if (!x.trim()) return P;
    const _ = x.toLowerCase();
    return P.filter(
      (se) => {
        var ue;
        return se.agent.name.toLowerCase().includes(_) || ((ue = se.agent.description) == null ? void 0 : ue.toLowerCase().includes(_)) || se.agent.id.toLowerCase().includes(_) || se.skills.some((be) => be.name.toLowerCase().includes(_));
      }
    );
  }, [P, x]), W = P.filter((_) => _.agent.enabled).length, re = P.reduce(
    (_, se) => _ + se.skills.filter((ue) => ue.enabled !== !1).length,
    0
  ), Ee = P.reduce((_, se) => _ + se.mcps.length, 0), _e = [
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
          e.createElement(o, {
            placeholder: "搜索专家名称、描述或技能...",
            prefix: A ? e.createElement(A) : void 0,
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
          e.createElement(r, { size: "large" })
        ) : ie.length === 0 ? e.createElement(s, {
          description: x ? "未找到匹配的专家" : "暂无专家，点击「创建专家」添加"
        }) : e.createElement(
          d,
          { gutter: [12, 12], align: "stretch" },
          ...ie.map(
            (_) => e.createElement(
              I,
              {
                key: _.agent.id,
                xs: 24,
                sm: 12,
                md: 8,
                lg: 6,
                style: { display: "flex" }
              },
              e.createElement(zn, {
                expert: _,
                onClick: () => B(_),
                onSummon: () => q(_),
                onConfigure: () => le(_)
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
      children: e.createElement(Zt, {
        agents: p,
        onLaunch: xe
      })
    }
  ];
  return e.createElement(
    "div",
    { style: { padding: 24 } },
    e.createElement(et, {
      title: "专家",
      subtitle: `共 ${P.length} 位专家（${W} 位启用）· ${re} 个技能 · ${Ee} 个 MCP 客户端`,
      extra: e.createElement(
        e.Fragment,
        null,
        e.createElement(
          h,
          {
            icon: v ? e.createElement(v) : void 0,
            onClick: ce,
            loading: F
          },
          "刷新"
        ),
        e.createElement(
          h,
          {
            type: "primary",
            icon: $ ? e.createElement($) : void 0,
            onClick: () => D(!0),
            style: Re
          },
          "创建专家"
        )
      )
    }),
    e.createElement(b, {
      items: _e,
      activeKey: te,
      onChange: (_) => R(_)
    }),
    // Drawer
    e.createElement(In, {
      expert: Z,
      open: O,
      onClose: () => z(!1),
      onRefresh: () => ce()
    }),
    // Template Modal
    e.createElement(_n, {
      open: M,
      onClose: () => D(!1),
      onCreated: () => ce()
    }),
    // Config Modal (gear icon)
    e.createElement(Tn, {
      expert: k,
      open: V,
      onClose: () => G(!1),
      onRefresh: () => ce()
    }),
    // Team Launch Modal (for filling placeholders)
    m ? e.createElement(
      E,
      {
        open: !0,
        title: e.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 8 } },
          e.createElement(ut, {
            members: m.members.map((_) => _.name),
            size: 28
          }),
          e.createElement(
            "span",
            null,
            `发起团队任务 - ${m.name}`
          )
        ),
        onCancel: () => S(null),
        onOk: () => {
          var be;
          const _ = m.coordinatorName || ((be = m.members[0]) == null ? void 0 : be.name), se = _ ? Ye(p, _) : null;
          if (!se) {
            i.error("无法找到协调者专家");
            return;
          }
          let ue = m.taskTemplate;
          g.trim() && (ue = g.trim()), J(m, se, ue);
        },
        confirmLoading: N,
        okText: "发起任务",
        width: 600
      },
      e.createElement(
        "div",
        { style: { marginBottom: 12 } },
        e.createElement(
          K,
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
          m.taskTemplate
        )
      ),
      e.createElement(
        "div",
        null,
        e.createElement(
          K,
          {
            type: "secondary",
            style: { fontSize: 12, display: "block", marginBottom: 8 }
          },
          "输入具体任务描述（替换上面的占位符内容）："
        ),
        e.createElement(o.TextArea, {
          value: g,
          onChange: (_) => ne(_.target.value),
          rows: 5,
          placeholder: m.taskTemplate,
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
          K,
          { style: { fontSize: 12, color: "#0958d9" } },
          `协调者: ${m.coordinatorName || ((ve = m.members[0]) == null ? void 0 : ve.name) || "—"} · 成员: ${m.members.map((_) => _.name).join("、")}`
        )
      )
    ) : null
  );
}
function $n({
  mcp: e,
  onClick: t,
  onToggle: a,
  onDelete: n,
  onViewTools: l
}) {
  const r = f().React, { Card: s, Tag: o, Badge: h, Typography: i, Button: d } = f().antd, { Text: I } = i, {
    EyeOutlined: b,
    EyeInvisibleOutlined: E,
    DeleteOutlined: U,
    ToolOutlined: v
  } = f().antdIcons || {}, $ = {
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
          $[e.transport] || "🔌"
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
        o,
        { color: "purple", style: { fontSize: 11 } },
        e.transport
      ),
      e.tools && e.tools.length > 0 ? r.createElement(
        o,
        { color: "blue", style: { fontSize: 11 } },
        `${e.tools.length} 个工具`
      ) : r.createElement(o, { style: { fontSize: 11 } }, "全部工具"),
      e.url ? r.createElement(
        o,
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
        d,
        {
          size: "small",
          icon: v ? r.createElement(v) : void 0,
          onClick: l
        },
        "工具"
      ),
      r.createElement(
        d,
        {
          size: "small",
          icon: e.enabled ? E ? r.createElement(E) : void 0 : b ? r.createElement(b) : void 0,
          onClick: a
        },
        e.enabled ? "禁用" : "启用"
      ),
      r.createElement(
        d,
        {
          size: "small",
          danger: !0,
          icon: U ? r.createElement(U) : void 0,
          onClick: n
        },
        "删除"
      )
    )
  );
}
const rt = {
  reservoir_simulation: "油藏数值模拟",
  geological_modeling: "地质建模",
  well_log_analysis: "测井分析",
  production_engineering: "采油工程",
  post_processing: "后处理与可视化",
  multiphysics: "多物理场仿真"
}, Rt = {
  reservoir_simulation: "🛢️",
  geological_modeling: "🏔️",
  well_log_analysis: "📡",
  production_engineering: "⚙️",
  post_processing: "📊",
  multiphysics: "🔬"
}, Lt = /* @__PURE__ */ new Set(["cmg", "comsol", "tnavigator", "eclipse", "intersect", "visage"]);
function Bt(e) {
  return Ke(`/ugsci/engines/icon/${encodeURIComponent(e)}`);
}
function Et(e) {
  return Ke(`/ugsci/avatar/${encodeURIComponent(e)}`);
}
function ht(e) {
  const t = e.map(encodeURIComponent).join(",");
  return Ke(`/ugsci/avatar/team/${t}`);
}
function Ne({
  name: e,
  size: t = 32,
  borderRadius: a = "50%"
}) {
  const n = f().React, [l, r] = n.useState(0), s = l === 0 ? Et(e) : `${Et(e)}?_r=${l}`;
  return n.createElement("img", {
    src: s,
    alt: e,
    onError: () => {
      l < 1 && r(l + 1);
    },
    style: { width: t, height: t, borderRadius: a, objectFit: "cover", flexShrink: 0 }
  });
}
function ut({
  members: e,
  size: t = 32,
  borderRadius: a = "50%"
}) {
  const n = f().React, [l, r] = n.useState(0);
  if (!e || e.length === 0)
    return n.createElement("span", {
      style: { width: t, height: t, display: "inline-block" }
    });
  const s = e.slice(0, 5), o = l === 0 ? ht(s) : `${ht(s)}?_r=${l}`;
  return n.createElement("img", {
    src: o,
    alt: "team",
    onError: () => {
      l < 1 && r(l + 1);
    },
    style: { width: t, height: t, borderRadius: a, objectFit: "cover", flexShrink: 0 }
  });
}
async function Mn() {
  return ee("/ugsci/engines/list");
}
async function Rn(e) {
  return ee("/ugsci/engines/", {
    method: "POST",
    body: JSON.stringify(e)
  });
}
async function Ln(e, t) {
  return ee(`/ugsci/engines/${encodeURIComponent(e)}`, {
    method: "PUT",
    body: JSON.stringify(t)
  });
}
async function Bn(e) {
  return ee(
    `/ugsci/engines/${encodeURIComponent(e)}`,
    { method: "DELETE" }
  );
}
async function jn() {
  return ee("/ugsci/engines/detect", {
    method: "POST"
  });
}
function Dn({
  engine: e,
  onClick: t
}) {
  const a = f().React, { Card: n, Tag: l, Typography: r } = f().antd, { Text: s } = r, o = e.status === "detected", h = Rt[e.category] || "📦", d = Lt.has(e.id) ? a.createElement("img", {
    src: Bt(e.id),
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
        borderColor: o ? void 0 : "#d9d9d9",
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
        d,
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
        rt[e.category] || e.category
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
function Nn() {
  const e = f().React, { useState: t, useEffect: a, useCallback: n, useMemo: l } = e, {
    Spin: r,
    Empty: s,
    Button: o,
    message: h,
    Row: i,
    Col: d,
    Drawer: I,
    Descriptions: b,
    Tag: E,
    Typography: U,
    Modal: v,
    Input: $,
    Select: A,
    Popconfirm: H,
    Space: w
  } = f().antd, {
    ReloadOutlined: K,
    SearchOutlined: L,
    PlusOutlined: P,
    EditOutlined: j,
    DeleteOutlined: F,
    CopyOutlined: y,
    ExperimentOutlined: O
  } = f().antdIcons || {}, { Text: z, Paragraph: Z } = U, [C, x] = t([]), [u, M] = t(!0), [D, te] = t(""), [R, m] = t(!1), [S, g] = t(null), [ne, N] = t(!1), [Y, V] = t(null), [G, k] = t({}), [oe, p] = t(!1), ae = n(async () => {
    M(!0);
    try {
      const W = await Mn();
      x(W.engines || []);
    } catch (W) {
      h.error(W.message || "加载引擎列表失败"), x([]);
    } finally {
      M(!1);
    }
  }, []);
  a(() => {
    ae();
  }, [ae]);
  const ce = l(() => {
    if (!D.trim()) return C;
    const W = D.toLowerCase();
    return C.filter(
      (re) => {
        var Ee;
        return re.name.toLowerCase().includes(W) || re.vendor.toLowerCase().includes(W) || re.category.toLowerCase().includes(W) || ((Ee = re.description) == null ? void 0 : Ee.toLowerCase().includes(W));
      }
    );
  }, [C, D]);
  C.filter((W) => W.status === "detected").length;
  const xe = n((W) => {
    navigator.clipboard.writeText(W).then(() => h.success("路径已复制")).catch(() => h.error("复制失败"));
  }, []), J = n(() => {
    V(null), k({
      name: "",
      vendor: "",
      version: "",
      executable_path: "",
      category: "",
      description: "",
      invocation_hint: ""
    }), N(!0);
  }, []), me = n((W) => {
    V(W), k({ ...W }), N(!0), m(!1);
  }, []), B = n(async () => {
    var W;
    if (!((W = G.name) != null && W.trim())) {
      h.warning("请输入引擎名称");
      return;
    }
    p(!0);
    try {
      Y ? (await Ln(Y.id, G), h.success("引擎已更新")) : (await Rn(G), h.success("引擎已添加")), N(!1), ae();
    } catch (re) {
      h.error(re.message || "保存失败");
    } finally {
      p(!1);
    }
  }, [G, Y, ae]), le = n(
    async (W) => {
      try {
        await Bn(W), h.success("引擎已删除"), m(!1), ae();
      } catch (re) {
        h.error(re.message || "删除失败");
      }
    },
    [ae]
  ), q = n(async () => {
    M(!0);
    try {
      const W = await jn();
      x(W.engines || []), h.success("自动检测完成");
    } catch (W) {
      h.error(W.message || "检测失败");
    } finally {
      M(!1);
    }
  }, []), ie = n(
    (W, re, Ee) => {
      const _e = G[re] || "";
      return e.createElement(
        "div",
        { style: { marginBottom: 12 } },
        e.createElement(
          z,
          { style: { fontSize: 13, display: "block", marginBottom: 4 } },
          W
        ),
        Ee != null && Ee.select ? e.createElement(A, {
          value: _e || void 0,
          onChange: (ve) => k((_) => ({ ..._, [re]: ve })),
          style: { width: "100%" },
          options: Ee.select.options,
          allowClear: !0,
          placeholder: `选择${W}`
        }) : Ee != null && Ee.textarea ? e.createElement($.TextArea, {
          value: _e,
          onChange: (ve) => k((_) => ({ ..._, [re]: ve.target.value })),
          rows: 3,
          placeholder: `输入${W}`
        }) : e.createElement($, {
          value: _e,
          onChange: (ve) => k((_) => ({ ..._, [re]: ve.target.value })),
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
      e.createElement($, {
        placeholder: "搜索引擎名称、厂商...",
        prefix: L ? e.createElement(L) : void 0,
        value: D,
        onChange: (W) => te(W.target.value),
        allowClear: !0,
        style: { maxWidth: 280 }
      }),
      e.createElement(
        o,
        {
          icon: K ? e.createElement(K) : void 0,
          onClick: q,
          loading: u
        },
        "自动检测"
      ),
      e.createElement(
        o,
        {
          type: "primary",
          icon: P ? e.createElement(P) : void 0,
          onClick: J,
          style: Re
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
    ) : ce.length === 0 ? e.createElement(s, {
      description: D ? "无匹配引擎" : "暂无引擎，点击「添加引擎」开始"
    }) : e.createElement(
      i,
      { gutter: [12, 12], align: "stretch" },
      ...ce.map(
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
          e.createElement(Dn, {
            engine: W,
            onClick: () => {
              g(W), m(!0);
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
            Lt.has(S.id) ? e.createElement("img", {
              src: Bt(S.id),
              alt: S.name,
              style: { width: 20, height: 20, objectFit: "contain" }
            }) : e.createElement(
              "span",
              { style: { fontSize: 18 } },
              Rt[S.category] || "📦"
            )
          ),
          e.createElement("span", null, S.name)
        ),
        open: R,
        onClose: () => m(!1),
        width: 520,
        extra: e.createElement(
          w,
          null,
          e.createElement(
            o,
            {
              size: "small",
              icon: j ? e.createElement(j) : void 0,
              onClick: () => me(S)
            },
            "编辑"
          ),
          S.is_default ? null : e.createElement(
            H,
            {
              title: "确认删除此引擎？",
              description: S.name,
              onConfirm: () => le(S.id),
              okText: "删除",
              cancelText: "取消",
              okButtonProps: { danger: !0 }
            },
            e.createElement(
              o,
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
          S.name
        ),
        e.createElement(
          b.Item,
          { label: "厂商" },
          S.vendor || "—"
        ),
        e.createElement(
          b.Item,
          { label: "分类" },
          S.category ? rt[S.category] || S.category : "—"
        ),
        e.createElement(
          b.Item,
          { label: "状态" },
          e.createElement(
            E,
            {
              color: S.status === "detected" ? "success" : S.status === "not_found" ? "error" : "default"
            },
            S.status === "detected" ? "✅ 已检测" : S.status === "not_found" ? "❌ 路径无效" : "🔧 待配置"
          )
        ),
        e.createElement(
          b.Item,
          { label: "版本" },
          S.version || "—"
        ),
        S.executable_path ? e.createElement(
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
              S.executable_path
            ),
            e.createElement(
              o,
              {
                size: "small",
                type: "text",
                icon: y ? e.createElement(y) : void 0,
                onClick: () => xe(S.executable_path)
              }
            )
          )
        ) : null,
        S.install_dir ? e.createElement(
          b.Item,
          { label: "安装目录" },
          e.createElement(
            "code",
            { style: { fontSize: 12, wordBreak: "break-all" } },
            S.install_dir
          )
        ) : null,
        // Display detected modules with paths
        S.modules && S.modules.length > 0 ? e.createElement(
          b.Item,
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
                  E,
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
          b.Item,
          { label: "许可证服务器" },
          S.license_server
        ) : null,
        e.createElement(
          b.Item,
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
          z,
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
          E,
          { color: "blue" },
          "默认引擎"
        ) : S.is_custom ? e.createElement(
          E,
          { color: "purple" },
          "自定义引擎"
        ) : null
      )
    ) : null,
    // Add/Edit modal
    e.createElement(
      v,
      {
        title: Y ? "编辑引擎" : "添加计算引擎",
        open: ne,
        onOk: B,
        onCancel: () => N(!1),
        okText: Y ? "保存" : "添加",
        cancelText: "取消",
        confirmLoading: oe,
        width: 560
      },
      e.createElement(
        "div",
        { style: { maxHeight: 480, overflow: "auto", paddingRight: 8 } },
        ie("引擎名称 *", "name"),
        ie("厂商", "vendor"),
        ie("版本", "version"),
        ie("可执行文件路径", "executable_path"),
        ie("安装目录", "install_dir"),
        ie("分类", "category", {
          select: {
            options: Object.entries(rt).map(([W, re]) => ({
              label: re,
              value: W
            }))
          }
        }),
        ie("描述", "description", { textarea: !0 }),
        ie("调用方式提示", "invocation_hint", { textarea: !0 }),
        ie("许可证服务器", "license_server")
      )
    )
  );
}
function Un() {
  const e = f().React, { useState: t, useEffect: a, useCallback: n, useMemo: l } = e, {
    Spin: r,
    Empty: s,
    Input: o,
    Button: h,
    message: i,
    Row: d,
    Col: I,
    Drawer: b,
    Descriptions: E,
    Tag: U,
    Typography: v,
    List: $,
    Tabs: A,
    Modal: H
  } = f().antd, {
    ReloadOutlined: w,
    PlusOutlined: K,
    SearchOutlined: L,
    ApiOutlined: P,
    RocketOutlined: j,
    ToolOutlined: F,
    DeleteOutlined: y,
    EyeOutlined: O,
    EyeInvisibleOutlined: z
  } = f().antdIcons || {}, { Text: Z } = v, { TextArea: C } = o, u = f().useSelectedAgent, M = u ? u() : null, D = (M == null ? void 0 : M.id) || "default", [te, R] = t([]), [m, S] = t(!0), [g, ne] = t(""), [N, Y] = t(!1), [V, G] = t(null), [k, oe] = t("mcp"), [p, ae] = t(!1), [ce, xe] = t(`{
  "mcpServers": {
    "example-client": {
      "command": "npx",
      "args": ["-y", "@example/mcp-server"],
      "env": {}
    }
  }
}`), [J, me] = t(!1), [B, le] = t(!1), [q, ie] = t(null), [W, re] = t(!1), [Ee, _e] = t(null), [ve, _] = t([]), [se, ue] = t(!1), [be, we] = t(""), Se = n(async () => {
    S(!0);
    try {
      const X = await Ht(D);
      R(X);
    } catch (X) {
      i.error(X.message || "加载 MCP 列表失败"), R([]);
    } finally {
      S(!1);
    }
  }, [D]);
  a(() => {
    Se();
  }, [Se]);
  const Ae = n(
    async (X) => {
      try {
        await Wt(D, X.key), i.success(X.enabled ? "已禁用" : "已启用"), Se();
      } catch (de) {
        i.error(de.message || "切换状态失败");
      }
    },
    [D, Se]
  ), Ue = n(async () => {
    if (q)
      try {
        await Gt(D, q.key), i.success(`MCP「${q.key}」已删除`), le(!1), ie(null), Se();
      } catch (X) {
        i.error(X.message || "删除失败");
      }
  }, [D, q, Se]), Fe = n(async () => {
    me(!0);
    try {
      const X = JSON.parse(ce), de = X.mcpServers || X, T = Object.entries(de);
      if (T.length === 0) {
        i.warning("未找到 MCP 客户端配置");
        return;
      }
      let Ce = !0;
      for (const [ke, ze] of T) {
        const Te = ze, $e = Te.url ? "streamable_http" : "stdio", pe = {
          name: Te.name || ke,
          description: Te.description || "",
          enabled: !0,
          transport: $e,
          url: Te.url || "",
          command: Te.command || "",
          args: Te.args || [],
          env: Te.env || {},
          cwd: Te.cwd || "",
          headers: Te.headers || {}
        };
        try {
          await Jt(
            D,
            ke,
            pe
          );
        } catch {
          Ce = !1;
        }
      }
      Ce && (i.success("MCP 客户端已创建"), ae(!1), Se());
    } catch (X) {
      X instanceof SyntaxError ? i.error("JSON 格式错误：" + X.message) : i.error(X.message || "创建 MCP 失败");
    } finally {
      me(!1);
    }
  }, [ce, D, Se]), Ge = n(
    async (X) => {
      _e(X), re(!0), _([]), we(""), ue(!0);
      try {
        const de = await Xt(
          D,
          X.key
        );
        _(de);
      } catch (de) {
        we(
          de.message || "无法加载工具列表（MCP 服务可能未运行）"
        );
      } finally {
        ue(!1);
      }
    },
    [D]
  ), Be = l(() => {
    if (!g.trim()) return te;
    const X = g.toLowerCase();
    return te.filter(
      (de) => {
        var T;
        return de.name.toLowerCase().includes(X) || de.key.toLowerCase().includes(X) || ((T = de.description) == null ? void 0 : T.toLowerCase().includes(X)) || de.transport.toLowerCase().includes(X);
      }
    );
  }, [te, g]), Ie = te.filter((X) => X.enabled).length, He = te.reduce((X, de) => {
    var T;
    return X + (((T = de.tools) == null ? void 0 : T.length) || 0);
  }, 0), Le = e.createElement(
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
        prefix: L ? e.createElement(L) : void 0,
        value: g,
        onChange: (X) => ne(X.target.value),
        allowClear: !0,
        style: { maxWidth: 400 }
      }),
      e.createElement(
        h,
        {
          type: "primary",
          icon: K ? e.createElement(K) : void 0,
          onClick: () => ae(!0),
          style: Re
        },
        "添加 MCP"
      )
    ),
    m ? e.createElement(
      "div",
      { style: { textAlign: "center", padding: 60 } },
      e.createElement(r, { size: "large" })
    ) : Be.length === 0 ? e.createElement(s, {
      description: g ? "未找到匹配的能力" : "暂无 MCP 客户端，点击「添加 MCP」创建"
    }) : e.createElement(
      d,
      { gutter: [12, 12], align: "stretch" },
      ...Be.map(
        (X) => e.createElement(
          I,
          {
            key: X.key,
            xs: 24,
            sm: 12,
            md: 8,
            lg: 6,
            style: { display: "flex" }
          },
          e.createElement($n, {
            mcp: X,
            onClick: () => {
              G(X), Y(!0);
            },
            onToggle: (de) => {
              de.stopPropagation(), Ae(X);
            },
            onDelete: (de) => {
              de.stopPropagation(), ie(X), le(!0);
            },
            onViewTools: (de) => {
              de.stopPropagation(), Ge(X);
            }
          })
        )
      )
    )
  ), je = [
    {
      key: "mcp",
      label: e.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        P ? e.createElement(P, { style: { fontSize: 14 } }) : null,
        "MCP 客户端"
      ),
      children: Le
    },
    {
      key: "software",
      label: e.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        j ? e.createElement(j, { style: { fontSize: 14 } }) : null,
        "计算引擎"
      ),
      children: e.createElement(Nn)
    }
  ];
  return e.createElement(
    "div",
    { style: { padding: 24 } },
    e.createElement(et, {
      title: "工具",
      subtitle: `MCP: ${te.length} 个客户端（${Ie} 个启用）· ${He} 个工具`,
      extra: e.createElement(
        e.Fragment,
        null,
        e.createElement(
          h,
          {
            icon: w ? e.createElement(w) : void 0,
            onClick: Se,
            loading: m
          },
          "刷新"
        )
      )
    }),
    e.createElement(A, {
      items: je,
      activeKey: k,
      onChange: (X) => oe(X)
    }),
    // MCP Detail drawer
    V ? e.createElement(
      b,
      {
        title: e.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 8 } },
          e.createElement("span", { style: { fontSize: 18 } }, "🔌"),
          e.createElement(
            "span",
            null,
            V.name || V.key
          )
        ),
        open: N,
        onClose: () => Y(!1),
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
            V.key
          )
        ),
        e.createElement(
          E.Item,
          { label: "名称" },
          V.name || "-"
        ),
        e.createElement(
          E.Item,
          { label: "描述" },
          V.description || "-"
        ),
        e.createElement(
          E.Item,
          { label: "状态" },
          e.createElement(
            U,
            { color: V.enabled ? "green" : "default" },
            V.enabled ? "启用" : "停用"
          )
        ),
        e.createElement(
          E.Item,
          { label: "传输方式" },
          V.transport
        ),
        V.url ? e.createElement(
          E.Item,
          { label: "URL" },
          V.url
        ) : null,
        V.command ? e.createElement(
          E.Item,
          { label: "命令" },
          e.createElement(
            "code",
            { style: { fontSize: 11 } },
            V.command
          )
        ) : null,
        V.args && V.args.length > 0 ? e.createElement(
          E.Item,
          { label: "参数" },
          V.args.join(" ")
        ) : null
      ),
      V.tools && V.tools.length > 0 ? e.createElement(
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
        e.createElement($, {
          size: "small",
          dataSource: V.tools,
          renderItem: (X) => e.createElement(
            $.Item,
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
                Z,
                { style: { fontSize: 12 } },
                X
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
        open: p,
        onCancel: () => ae(!1),
        onOk: Fe,
        confirmLoading: J,
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
        value: ce,
        onChange: (X) => xe(X.target.value),
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
          le(!1), ie(null);
        },
        okText: "确认删除",
        cancelText: "取消",
        okButtonProps: { danger: !0 }
      },
      e.createElement(
        "p",
        null,
        `确定要删除 MCP 客户端「${(q == null ? void 0 : q.name) || (q == null ? void 0 : q.key)}」吗？此操作不可撤销。`
      )
    ),
    // ── Tools Viewer Modal (mirror console /mcp tools) ──
    e.createElement(
      H,
      {
        title: Ee ? `${Ee.name || Ee.key} - 工具列表` : "工具列表",
        open: W,
        onCancel: () => {
          re(!1), _e(null);
        },
        footer: e.createElement(
          h,
          { onClick: () => re(!1) },
          "关闭"
        ),
        width: 640
      },
      se ? e.createElement(
        "div",
        { style: { textAlign: "center", padding: 40 } },
        e.createElement(r, { size: "large" })
      ) : be ? e.createElement(
        "div",
        { style: { color: "#ff4d4f", padding: 16 } },
        be
      ) : ve.length === 0 ? e.createElement(s, {
        description: "此 MCP 客户端暂无可用工具（可能服务未启动）"
      }) : e.createElement($, {
        size: "small",
        dataSource: ve,
        renderItem: (X) => e.createElement(
          $.Item,
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
                Z,
                { strong: !0, style: { fontSize: 13 } },
                X.name || X.key
              )
            ),
            X.description ? e.createElement(
              Z,
              { type: "secondary", style: { fontSize: 12 } },
              X.description
            ) : null
          )
        )
      })
    )
  );
}
function Fn({
  agentId: e,
  agentName: t,
  onNavigate: a
}) {
  const n = f().React, { useState: l, useEffect: r, useCallback: s } = n, {
    Spin: o,
    Empty: h,
    Button: i,
    Row: d,
    Col: I,
    Card: b,
    Tag: E,
    Checkbox: U,
    Modal: v,
    Typography: $,
    Drawer: A,
    Descriptions: H,
    message: w
  } = f().antd, {
    ReloadOutlined: K,
    ThunderboltOutlined: L,
    SettingOutlined: P,
    CheckSquareOutlined: j,
    EyeOutlined: F,
    EyeInvisibleOutlined: y,
    DeleteOutlined: O,
    CloseOutlined: z
  } = f().antdIcons || {}, { Text: Z, Paragraph: C } = $, [x, u] = l([]), [M, D] = l(!0), [te, R] = l(!1), [m, S] = l(null), [g, ne] = l(!1), [N, Y] = l(
    /* @__PURE__ */ new Set()
  ), [V, G] = l(!1), k = s(async () => {
    if (e) {
      D(!0);
      try {
        const B = await ct(e);
        u(B);
      } catch (B) {
        w.error(B.message || "加载技能失败"), u([]);
      } finally {
        D(!1);
      }
    }
  }, [e]);
  r(() => {
    k();
  }, [k]);
  const oe = (B) => {
    Y((le) => {
      const q = new Set(le);
      return q.has(B) ? q.delete(B) : q.add(B), q;
    });
  }, p = () => Y(/* @__PURE__ */ new Set()), ae = () => Y(new Set(x.map((B) => B.name))), ce = () => {
    g ? (p(), ne(!1)) : ne(!0);
  }, xe = async () => {
    const B = Array.from(N);
    if (B.length !== 0) {
      G(!0);
      try {
        const { results: le } = await ln(e, B), q = Object.entries(le).filter(
          ([, W]) => W.success === !1
        ), ie = B.length - q.length;
        q.length > 0 ? w.warning(
          `批量启用完成：成功 ${ie} 个，失败 ${q.length} 个`
        ) : w.success(`成功启用 ${B.length} 个技能`), p(), await k();
      } catch (le) {
        w.error(le.message || "批量启用失败");
      } finally {
        G(!1);
      }
    }
  }, J = async () => {
    const B = Array.from(N);
    if (B.length !== 0) {
      G(!0);
      try {
        const { results: le } = await an(e, B), q = Object.entries(le).filter(
          ([, W]) => W.success === !1
        ), ie = B.length - q.length;
        q.length > 0 ? w.warning(
          `批量停用完成：成功 ${ie} 个，失败 ${q.length} 个`
        ) : w.success(`成功停用 ${B.length} 个技能`), p(), await k();
      } catch (le) {
        w.error(le.message || "批量停用失败");
      } finally {
        G(!1);
      }
    }
  }, me = () => {
    const B = Array.from(N);
    B.length !== 0 && v.confirm({
      title: `确认删除 ${B.length} 个技能？`,
      content: "删除后技能将从当前专家工作区移除，此操作不可撤销。技能池中的原始技能不受影响。",
      okText: "确认删除",
      cancelText: "取消",
      okButtonProps: { danger: !0 },
      onOk: async () => {
        G(!0);
        try {
          const { results: le } = await rn(e, B), q = Object.entries(le).filter(
            ([, W]) => W.success === !1
          ), ie = B.length - q.length;
          q.length > 0 ? w.warning(
            `批量删除完成：成功 ${ie} 个，失败 ${q.length} 个`
          ) : w.success(`成功删除 ${B.length} 个技能`), p(), await k();
        } catch (le) {
          w.error(le.message || "批量删除失败");
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
        Z,
        { type: "secondary", style: { fontSize: 13 } },
        g ? `已选择 ${N.size} / ${x.length} 个技能` : `共 ${x.length} 个技能`
      ),
      n.createElement(
        "div",
        { style: { display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" } },
        g ? n.createElement(
          n.Fragment,
          null,
          n.createElement(
            i,
            { size: "small", onClick: ae },
            "全选"
          ),
          n.createElement(
            i,
            {
              size: "small",
              icon: z ? n.createElement(z) : void 0,
              onClick: p
            },
            "取消选择"
          ),
          n.createElement(
            i,
            {
              size: "small",
              type: "default",
              icon: F ? n.createElement(F) : void 0,
              disabled: N.size === 0 || V,
              loading: V,
              onClick: xe
            },
            "批量启用"
          ),
          n.createElement(
            i,
            {
              size: "small",
              danger: !0,
              icon: y ? n.createElement(y) : void 0,
              disabled: N.size === 0 || V,
              loading: V,
              onClick: J
            },
            "批量停用"
          ),
          n.createElement(
            i,
            {
              size: "small",
              danger: !0,
              icon: O ? n.createElement(O) : void 0,
              disabled: N.size === 0 || V,
              loading: V,
              onClick: me
            },
            `删除 (${N.size})`
          ),
          n.createElement(
            i,
            {
              size: "small",
              type: "primary",
              onClick: ce
            },
            "退出批量"
          )
        ) : n.createElement(
          n.Fragment,
          null,
          n.createElement(
            i,
            {
              size: "small",
              icon: j ? n.createElement(j) : void 0,
              onClick: ce,
              disabled: x.length === 0
            },
            "批量管理"
          ),
          n.createElement(
            i,
            {
              icon: K ? n.createElement(K) : void 0,
              onClick: k,
              loading: M,
              size: "small"
            },
            "刷新"
          )
        )
      )
    ),
    M ? n.createElement(
      "div",
      { style: { textAlign: "center", padding: 60 } },
      n.createElement(o, { size: "large" })
    ) : x.length === 0 ? n.createElement(h, {
      description: "当前智能体未加载任何技能"
    }) : n.createElement(
      d,
      { gutter: [12, 12] },
      ...x.map(
        (B) => n.createElement(
          I,
          { key: B.name, xs: 24, sm: 12, md: 8, lg: 6 },
          n.createElement(
            b,
            {
              hoverable: !0,
              size: "small",
              style: {
                cursor: g ? "default" : "pointer",
                height: "100%",
                position: "relative",
                borderColor: g && N.has(B.name) ? "#0072f5" : void 0,
                borderWidth: g && N.has(B.name) ? 2 : 1
              },
              onClick: () => {
                g ? oe(B.name) : (S(B), R(!0));
              }
            },
            g ? n.createElement(
              "div",
              {
                style: {
                  position: "absolute",
                  top: 8,
                  right: 8,
                  zIndex: 1
                },
                onClick: (le) => {
                  le.stopPropagation(), oe(B.name);
                }
              },
              n.createElement(U, {
                checked: N.has(B.name)
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
                B.name
              ),
              B.enabled === !1 ? n.createElement(
                E,
                { color: "default", style: { fontSize: 10 } },
                "已禁用"
              ) : n.createElement(
                E,
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
                E,
                { style: { fontSize: 10 } },
                `v${B.version_text}`
              ) : null,
              ...(B.tags || []).slice(0, 3).map(
                (le, q) => n.createElement(
                  E,
                  { key: q, color: "blue", style: { fontSize: 10 } },
                  le
                )
              )
            )
          )
        )
      )
    ),
    // Skill detail drawer
    m ? n.createElement(
      A,
      {
        title: n.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 8 } },
          n.createElement(
            "span",
            { style: { fontSize: 18 } },
            m.emoji || "⚡"
          ),
          n.createElement("span", null, m.name)
        ),
        open: te,
        onClose: () => R(!1),
        width: 520,
        extra: n.createElement(
          i,
          {
            type: "primary",
            size: "small",
            icon: P ? n.createElement(P) : void 0,
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
          m.name
        ),
        n.createElement(
          H.Item,
          { label: "描述" },
          m.description || "-"
        ),
        m.version_text ? n.createElement(
          H.Item,
          { label: "版本" },
          m.version_text
        ) : null,
        n.createElement(
          H.Item,
          { label: "来源" },
          m.source || "-"
        ),
        n.createElement(
          H.Item,
          { label: "状态" },
          m.enabled === !1 ? "已禁用" : "已启用"
        ),
        m.installed_from ? n.createElement(
          H.Item,
          { label: "安装来源" },
          m.installed_from
        ) : null
      ),
      // Tags
      m.tags && m.tags.length > 0 ? n.createElement(
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
          ...m.tags.map(
            (B, le) => n.createElement(E, { key: le, color: "blue" }, B)
          )
        )
      ) : null,
      // Skill content preview
      m.content ? n.createElement(
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
          m.content.slice(0, 2e3) + (m.content.length > 2e3 ? `

... (内容已截断)` : "")
        )
      ) : null
    ) : null
  );
}
function Hn({
  poolSkills: e,
  workspaceSkills: t,
  agents: a,
  loading: n,
  onReload: l
}) {
  const r = f().React, { useState: s, useMemo: o, useCallback: h } = r, {
    Spin: i,
    Empty: d,
    Input: I,
    Button: b,
    Row: E,
    Col: U,
    Card: v,
    Tag: $,
    Typography: A,
    Drawer: H,
    Descriptions: w,
    List: K
  } = f().antd, {
    ReloadOutlined: L,
    SearchOutlined: P,
    DownloadOutlined: j,
    ThunderboltOutlined: F
  } = f().antdIcons || {}, { Text: y, Paragraph: O } = A, [z, Z] = s(""), [C, x] = s(!1), [u, M] = s(null), [D, te] = s([]), R = o(() => {
    if (!z.trim()) return e;
    const g = z.toLowerCase();
    return e.filter(
      (ne) => {
        var N, Y;
        return ne.name.toLowerCase().includes(g) || ((N = ne.description) == null ? void 0 : N.toLowerCase().includes(g)) || ((Y = ne.tags) == null ? void 0 : Y.some((V) => V.toLowerCase().includes(g)));
      }
    );
  }, [e, z]), m = h(
    (g) => {
      const ne = [];
      for (const N of t)
        if (N.skills.some((Y) => Y.name === g)) {
          const Y = a.find((V) => V.id === N.agent_id);
          ne.push((Y == null ? void 0 : Y.name) || N.agent_name || N.agent_id);
        }
      return ne;
    },
    [t, a]
  ), S = (g) => {
    window.history.pushState({}, "", g), window.dispatchEvent(new PopStateEvent("popstate"));
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
        prefix: P ? r.createElement(P) : void 0,
        value: z,
        onChange: (g) => Z(g.target.value),
        allowClear: !0,
        style: { maxWidth: 400 }
      }),
      r.createElement(
        "div",
        { style: { display: "flex", gap: 8 } },
        r.createElement(
          b,
          {
            icon: L ? r.createElement(L) : void 0,
            onClick: l,
            loading: n,
            size: "small"
          },
          "刷新"
        ),
        r.createElement(
          b,
          {
            type: "primary",
            icon: j ? r.createElement(j) : void 0,
            onClick: () => S("/skill-pool"),
            size: "small",
            style: Re
          },
          "管理技能池"
        )
      )
    ),
    n ? r.createElement(
      "div",
      { style: { textAlign: "center", padding: 60 } },
      r.createElement(i, { size: "large" })
    ) : R.length === 0 ? r.createElement(d, {
      description: z ? "未找到匹配的技能" : "技能池为空"
    }) : r.createElement(
      E,
      { gutter: [12, 12] },
      ...R.map(
        (g) => r.createElement(
          U,
          { key: g.name, xs: 24, sm: 12, md: 8, lg: 6 },
          r.createElement(
            v,
            {
              hoverable: !0,
              size: "small",
              style: { cursor: "pointer", height: "100%" },
              onClick: () => {
                M(g), te(m(g.name)), x(!0);
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
              g.emoji ? r.createElement(
                "span",
                { style: { fontSize: 18 } },
                g.emoji
              ) : r.createElement(
                "span",
                { style: { fontSize: 18 } },
                "⚡"
              ),
              r.createElement(
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
                g.name
              ),
              g.protected ? r.createElement(
                $,
                { color: "gold", style: { fontSize: 10 } },
                "内置"
              ) : null
            ),
            g.description ? r.createElement(
              O,
              {
                type: "secondary",
                style: { fontSize: 11, margin: 0, lineHeight: 1.4 },
                ellipsis: { rows: 2 }
              },
              g.description
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
              g.version_text ? r.createElement(
                $,
                { style: { fontSize: 10 } },
                `v${g.version_text}`
              ) : null,
              ...(g.tags || []).slice(0, 3).map(
                (ne, N) => r.createElement(
                  $,
                  { key: N, color: "cyan", style: { fontSize: 10 } },
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
        onClose: () => x(!1),
        width: 520,
        extra: r.createElement(
          b,
          {
            type: "primary",
            size: "small",
            icon: F ? r.createElement(F) : void 0,
            onClick: () => S("/skills")
          },
          "管理技能"
        )
      },
      r.createElement(
        w,
        { column: 1, bordered: !0, size: "small" },
        r.createElement(
          w.Item,
          { label: "技能名称" },
          u.name
        ),
        r.createElement(
          w.Item,
          { label: "描述" },
          u.description || "-"
        ),
        u.version_text ? r.createElement(
          w.Item,
          { label: "版本" },
          u.version_text
        ) : null,
        r.createElement(
          w.Item,
          { label: "来源" },
          u.source || "-"
        ),
        r.createElement(
          w.Item,
          { label: "受保护" },
          u.protected ? "是（内置）" : "否"
        ),
        u.sync_status ? r.createElement(
          w.Item,
          { label: "同步状态" },
          u.sync_status
        ) : null,
        u.installed_from ? r.createElement(
          w.Item,
          { label: "安装来源" },
          u.installed_from
        ) : null
      ),
      // Tags
      u.tags && u.tags.length > 0 ? r.createElement(
        "div",
        { style: { marginTop: 16 } },
        r.createElement(
          y,
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
            (g, ne) => r.createElement($, { key: ne, color: "cyan" }, g)
          )
        )
      ) : null,
      // Installed agents
      r.createElement(
        "div",
        { style: { marginTop: 16 } },
        r.createElement(
          y,
          { strong: !0, style: { display: "block", marginBottom: 8 } },
          `已安装此技能的专家 (${D.length})`
        ),
        D.length > 0 ? r.createElement(K, {
          size: "small",
          dataSource: D,
          renderItem: (g) => r.createElement(
            K.Item,
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
              r.createElement(Ne, { name: g, size: 20 }),
              r.createElement(
                y,
                { style: { fontSize: 13 } },
                g
              )
            )
          )
        }) : r.createElement(
          y,
          { type: "secondary", style: { fontSize: 12 } },
          "暂无专家安装此技能"
        )
      )
    ) : null
  );
}
function Wn() {
  const e = f().React, { useState: t, useEffect: a, useCallback: n, useMemo: l } = e, { Tabs: r, message: s } = f().antd, { ThunderboltOutlined: o, AppstoreOutlined: h } = f().antdIcons || {}, d = f().useSelectedAgent, I = d ? d() : null, b = (I == null ? void 0 : I.id) || "default", [E, U] = t([]), [v, $] = t([]), [A, H] = t([]), [w, K] = t(!0), [L, P] = t("agent-skills"), j = n(async () => {
    K(!0);
    try {
      const [z, Z, C] = await Promise.all([
        mt(),
        it(),
        Ft()
      ]);
      $(z), U(Z), H(C);
    } catch (z) {
      s.error(z.message || "加载技能列表失败"), $([]);
    } finally {
      K(!1);
    }
  }, []);
  a(() => {
    j();
  }, [j]);
  const F = l(() => {
    const z = E.find((Z) => Z.id === b);
    return (z == null ? void 0 : z.name) || b;
  }, [E, b]), y = (z) => {
    window.history.pushState({}, "", z), window.dispatchEvent(new PopStateEvent("popstate"));
  }, O = [
    {
      key: "agent-skills",
      label: e.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        o ? e.createElement(o, { style: { fontSize: 14 } }) : null,
        "当前Agent加载技能"
      ),
      children: e.createElement(Fn, {
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
        h ? e.createElement(h, { style: { fontSize: 14 } }) : null,
        "技能池"
      ),
      children: e.createElement(Hn, {
        poolSkills: v,
        workspaceSkills: A,
        agents: E,
        loading: w,
        onReload: j
      })
    }
  ];
  return e.createElement(
    "div",
    { style: { padding: 24 } },
    e.createElement(et, {
      title: "技能",
      subtitle: `技能池共 ${v.length} 个技能 · 当前智能体：${F}`
    }),
    e.createElement(r, {
      items: O,
      activeKey: L,
      onChange: (z) => P(z)
    })
  );
}
const st = "ugsci.market.githubSources", vt = "https://github.com/anthropics/skills/tree/main/skills";
function jt(e) {
  try {
    const t = new URL(e.trim()), a = t.hostname.toLowerCase();
    if (a !== "github.com" && a !== "www.github.com") return null;
    const n = t.pathname.split("/").filter((h) => h.length > 0);
    if (n.length < 2) return null;
    const l = decodeURIComponent(n[0]), r = decodeURIComponent(n[1]);
    let s = "main", o = "";
    return n.length >= 4 && (n[2] === "tree" || n[2] === "blob") ? (s = decodeURIComponent(n[3]), n.length > 4 && (o = n.slice(4).map(decodeURIComponent).join("/"))) : n.length > 2 && (o = n.slice(2).map(decodeURIComponent).join("/")), o = o.replace(/\/+$/, "").replace(/^\/+/, ""), {
      owner: l,
      repo: r,
      ref: s || "main",
      skillsPath: o,
      label: `${l}/${r}`
    };
  } catch {
    return null;
  }
}
function Dt(e, t, a) {
  return `${e}/${t}:${a || "/"}`;
}
function Gn() {
  try {
    const e = localStorage.getItem(st);
    if (!e) {
      const a = jt(vt);
      if (a) {
        const n = [
          {
            id: Dt(
              a.owner,
              a.repo,
              a.skillsPath
            ),
            url: vt,
            label: a.label,
            owner: a.owner,
            repo: a.repo,
            ref: a.ref,
            skillsPath: a.skillsPath,
            enabled: !0
          }
        ];
        return localStorage.setItem(st, JSON.stringify(n)), n;
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
function lt(e) {
  try {
    localStorage.setItem(
      st,
      JSON.stringify(e)
    );
  } catch {
  }
}
function Jn(e) {
  const t = e.match(/^---\s*\n([\s\S]*?)\n---/);
  if (!t) return {};
  const a = t[1], n = {}, l = a.split(`
`);
  let r = "";
  for (const s of l) {
    const o = s.match(/^(\w[\w-]*)\s*:\s*(.*)$/);
    if (o) {
      r = o[1];
      let h = o[2].trim();
      (h.startsWith('"') && h.endsWith('"') || h.startsWith("'") && h.endsWith("'")) && (h = h.slice(1, -1)), r === "name" ? n.name = h : r === "description" ? n.description = h : r === "version" ? n.version = h : r === "author" && (n.author = h);
    }
  }
  return n;
}
async function Xn(e) {
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
    (o) => o.type === "dir" && o.name
  );
  return await Promise.all(
    r.map(async (o) => {
      const h = `https://raw.githubusercontent.com/${e.owner}/${e.repo}/${e.ref}/${e.skillsPath ? e.skillsPath + "/" : ""}${o.name}/SKILL.md`, i = `https://github.com/${e.owner}/${e.repo}/tree/${e.ref}/${e.skillsPath ? e.skillsPath + "/" : ""}${o.name}`, d = {
        sourceId: e.id,
        sourceLabel: e.label,
        name: o.name,
        description: "",
        source_url: i,
        html_url: i,
        version: null,
        author: null
      };
      try {
        const I = await fetch(h);
        if (!I.ok) return d;
        const b = await I.text(), E = Jn(b);
        return {
          ...d,
          name: E.name || o.name,
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
async function Kn(e) {
  const t = e.filter((r) => r.enabled), a = await Promise.all(
    t.map(async (r) => {
      try {
        return { skills: await Xn(r), error: null, label: r.label };
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
function Vn({
  open: e,
  onClose: t,
  sources: a,
  onChange: n
}) {
  const l = f().React, { useState: r } = l, {
    Modal: s,
    Input: o,
    Button: h,
    List: i,
    Tag: d,
    Switch: I,
    Typography: b,
    Tooltip: E,
    message: U
  } = f().antd, {
    PlusOutlined: v,
    DeleteOutlined: $,
    LinkOutlined: A,
    GithubOutlined: H
  } = f().antdIcons || {}, { Text: w } = b, [K, L] = r(""), P = () => {
    const y = K.trim();
    if (!y) return;
    const O = jt(y);
    if (!O) {
      U.error("无效的 GitHub URL，请输入类似 https://github.com/owner/repo/tree/main/skills 的链接");
      return;
    }
    const z = Dt(O.owner, O.repo, O.skillsPath);
    if (a.some((x) => x.id === z)) {
      U.warning("该源已存在");
      return;
    }
    const Z = {
      id: z,
      url: y,
      label: O.label,
      owner: O.owner,
      repo: O.repo,
      ref: O.ref,
      skillsPath: O.skillsPath,
      enabled: !0
    }, C = [...a, Z];
    lt(C), n(C), L(""), U.success(`已添加源: ${O.label}`);
  }, j = (y, O) => {
    const z = a.map(
      (Z) => Z.id === y ? { ...Z, enabled: O } : Z
    );
    lt(z), n(z);
  }, F = (y) => {
    const O = a.filter((z) => z.id !== y);
    lt(O), n(O), U.success("已移除源");
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
        w,
        { type: "secondary", style: { fontSize: 12, display: "block", marginBottom: 8 } },
        "添加 GitHub 仓库作为技能源，系统将从该仓库的指定目录获取技能列表。支持格式："
      ),
      l.createElement(
        "div",
        { style: { display: "flex", gap: 8, alignItems: "center" } },
        l.createElement(o, {
          placeholder: "https://github.com/anthropics/skills/tree/main/skills",
          value: K,
          onChange: (y) => L(y.target.value),
          onPressEnter: P,
          prefix: A ? l.createElement(A) : void 0,
          style: { flex: 1 }
        }),
        l.createElement(
          h,
          {
            type: "primary",
            icon: v ? l.createElement(v) : void 0,
            onClick: P
          },
          "添加"
        )
      )
    ),
    l.createElement(
      "div",
      { style: { marginBottom: 8, display: "flex", alignItems: "center", justifyContent: "space-between" } },
      l.createElement(w, { strong: !0 }, `已配置源 (${a.length})`)
    ),
    l.createElement(i, {
      size: "small",
      bordered: !0,
      dataSource: a,
      renderItem: (y) => l.createElement(
        i.Item,
        {
          actions: [
            l.createElement(
              E,
              { title: y.enabled ? "点击禁用" : "点击启用" },
              l.createElement(I, {
                size: "small",
                checked: y.enabled,
                onChange: (O) => j(y.id, O)
              })
            ),
            l.createElement(
              E,
              { title: "移除此源" },
              l.createElement(
                h,
                {
                  size: "small",
                  type: "text",
                  danger: !0,
                  icon: $ ? l.createElement($) : void 0,
                  onClick: () => F(y.id)
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
              y.label
            ),
            y.skillsPath ? l.createElement(
              w,
              { type: "secondary", style: { fontSize: 11 } },
              `/${y.skillsPath}`
            ) : null,
            l.createElement(
              w,
              { type: "secondary", style: { fontSize: 11 } },
              `@${y.ref}`
            )
          ),
          l.createElement(
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
async function qn() {
  return ee("/market/providers");
}
async function Yn(e) {
  return ee(
    `/market/categories?lang=${encodeURIComponent(e)}`
  );
}
async function Qn(e, t, a, n, l) {
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
async function bt(e, t, a) {
  return ee("/skills/hub/install/start", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify({
      bundle_url: t,
      enable: a
    })
  });
}
async function St(e, t) {
  return ee(
    `/skills/hub/install/status/${encodeURIComponent(t)}`,
    {
      headers: { "X-Agent-Id": e }
    }
  );
}
function Zn() {
  const e = f().React, { useState: t, useEffect: a, useCallback: n, useMemo: l, useRef: r } = e, {
    Spin: s,
    Empty: o,
    Input: h,
    Button: i,
    message: d,
    Row: I,
    Col: b,
    Card: E,
    Tag: U,
    Tooltip: v,
    Typography: $,
    Select: A,
    Drawer: H,
    Descriptions: w,
    Tabs: K,
    Badge: L,
    Progress: P
  } = f().antd, {
    ReloadOutlined: j,
    SearchOutlined: F,
    DownloadOutlined: y,
    AppstoreOutlined: O,
    ShopOutlined: z,
    CheckCircleOutlined: Z,
    LoadingOutlined: C,
    UserOutlined: x,
    SettingOutlined: u,
    GithubOutlined: M
  } = f().antdIcons || {}, { Text: D, Paragraph: te, Title: R } = $, [m, S] = t("skills"), [g, ne] = t([]), [N, Y] = t([]), [V, G] = t([]), [k, oe] = t(""), [p, ae] = t(""), [ce, xe] = t(!1), [J, me] = t(!1), [B, le] = t(
    {}
  ), [q, ie] = t(null), [W, re] = t({}), [Ee, _e] = t([]), [ve, _] = t(""), [se, ue] = t(""), [be, we] = t([]), [Se, Ae] = t([]), [Ue, Fe] = t(!1), [Ge, Be] = t(!1), [Ie, He] = t(""), Le = r(null);
  a(() => {
    Promise.all([
      qn().catch(() => []),
      Yn("zh").catch(() => []),
      it().catch(() => [])
    ]).then(([c, Q, ge]) => {
      ne(c), Y(Q), _e(ge), ge.length > 0 && _(ge[0].id);
    });
  }, []);
  const je = n(async (c) => {
    const Q = c ?? Gn();
    if (we(c || Q), Q.filter((ye) => ye.enabled).length === 0) {
      Ae([]);
      return;
    }
    Fe(!0);
    try {
      const { skills: ye, errors: Pe } = await Kn(Q);
      if (Ae(ye), Pe.length > 0) {
        for (const fe of Pe)
          console.warn(`[ugsci] GitHub source '${fe.label}' error: ${fe.message}`);
        d.warning(
          `部分源加载失败: ${Pe.map((fe) => fe.label).join(", ")}`
        );
      }
    } catch (ye) {
      d.error(ye.message || "加载 GitHub 技能源失败"), Ae([]);
    } finally {
      Fe(!1);
    }
  }, []);
  a(() => {
    je();
  }, [je]);
  const X = n(
    async (c, Q, ge) => {
      xe(!0);
      try {
        const ye = await Qn(
          c,
          ge,
          20,
          "zh",
          Q || void 0
        );
        ge === void 0 || Object.keys(ge).length === 0 ? G(ye.results) : G((he) => [...he, ...ye.results]);
        const Pe = Object.values(ye.by_provider || {}).some(
          (he) => he.has_more
        );
        me(Pe);
        const fe = {};
        for (const [he, Oe] of Object.entries(ye.by_provider || {}))
          fe[he] = (ge[he] || 1) + 1;
        if (le(fe), ye.errors.length > 0)
          for (const he of ye.errors)
            console.warn(
              `[ugsci] Market provider '${he.provider}' error: ${he.message}`
            );
      } catch (ye) {
        d.error(ye.message || "搜索市场失败"), G([]);
      } finally {
        xe(!1);
      }
    },
    []
  );
  a(() => (Le.current && clearTimeout(Le.current), Le.current = setTimeout(() => {
    X(k, p, {});
  }, 400), () => {
    Le.current && clearTimeout(Le.current);
  }), [k, p, X]);
  const de = () => {
    X(k, p, B);
  }, T = async (c) => {
    var ge;
    if (!ve) {
      d.warning("请先选择安装目标专家");
      return;
    }
    const Q = `${c.source}:${c.slug}`;
    try {
      re((fe) => ({ ...fe, [Q]: "starting" }));
      const ye = await bt(
        ve,
        c.source_url,
        !0
      );
      re((fe) => ({ ...fe, [Q]: "installing" }));
      const Pe = 60;
      for (let fe = 0; fe < Pe; fe++) {
        await new Promise((Oe) => setTimeout(Oe, 2e3));
        const he = await St(
          ve,
          ye.task_id
        );
        if (he.status === "completed" && ((ge = he.result) != null && ge.installed)) {
          d.success(`技能「${he.result.name || c.name}」安装成功`), re((Oe) => {
            const Me = { ...Oe };
            return delete Me[Q], Me;
          });
          return;
        }
        if (he.status === "failed")
          throw new Error(he.error || "安装失败");
        if (he.status === "cancelled") {
          d.info("安装已取消"), re((Oe) => {
            const Me = { ...Oe };
            return delete Me[Q], Me;
          });
          return;
        }
      }
      throw new Error("安装超时");
    } catch (ye) {
      d.error(ye.message || "安装技能失败"), re((Pe) => {
        const fe = { ...Pe };
        return delete fe[Q], fe;
      });
    }
  }, Ce = (c) => {
    window.history.pushState({}, "", c), window.dispatchEvent(new PopStateEvent("popstate"));
  }, ke = async (c) => {
    var ge;
    if (!ve) {
      d.warning("请先选择安装目标专家");
      return;
    }
    const Q = `github:${c.sourceId}:${c.name}`;
    try {
      re((fe) => ({ ...fe, [Q]: "starting" }));
      const ye = await bt(
        ve,
        c.source_url,
        !0
      );
      re((fe) => ({ ...fe, [Q]: "installing" }));
      const Pe = 60;
      for (let fe = 0; fe < Pe; fe++) {
        await new Promise((Oe) => setTimeout(Oe, 2e3));
        const he = await St(
          ve,
          ye.task_id
        );
        if (he.status === "completed" && ((ge = he.result) != null && ge.installed)) {
          d.success(`技能「${he.result.name || c.name}」安装成功`), re((Oe) => {
            const Me = { ...Oe };
            return delete Me[Q], Me;
          });
          return;
        }
        if (he.status === "failed")
          throw new Error(he.error || "安装失败");
        if (he.status === "cancelled") {
          d.info("安装已取消"), re((Oe) => {
            const Me = { ...Oe };
            return delete Me[Q], Me;
          });
          return;
        }
      }
      throw new Error("安装超时");
    } catch (ye) {
      d.error(ye.message || "安装技能失败"), re((Pe) => {
        const fe = { ...Pe };
        return delete fe[Q], fe;
      });
    }
  }, ze = l(() => {
    let c = Se;
    if (Ie && (c = c.filter((Q) => Q.sourceLabel === Ie)), k.trim()) {
      const Q = k.toLowerCase();
      c = c.filter(
        (ge) => {
          var ye;
          return ge.name.toLowerCase().includes(Q) || ((ye = ge.description) == null ? void 0 : ye.toLowerCase().includes(Q));
        }
      );
    }
    return c;
  }, [Se, k, Ie]), Te = g.filter((c) => c.available), $e = l(() => {
    if (!Ie) return V;
    const c = Te.find(
      (Q) => Q.label === Ie
    );
    return c ? V.filter((Q) => Q.source === c.key) : V;
  }, [V, Ie, Te]), pe = l(() => {
    const c = /* @__PURE__ */ new Set();
    return be.filter((Q) => Q.enabled).forEach((Q) => c.add(Q.label)), Te.forEach((Q) => c.add(Q.label)), Array.from(c);
  }, [be, Te]), tt = e.createElement(
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
        prefix: F ? e.createElement(F) : void 0,
        value: k,
        onChange: (c) => oe(c.target.value),
        allowClear: !0,
        style: { flex: 1, minWidth: 200, maxWidth: 400 }
      }),
      N.length > 0 ? e.createElement(A, {
        value: p || void 0,
        onChange: (c) => ae(c || ""),
        placeholder: "全部分类",
        allowClear: !0,
        style: { minWidth: 150 },
        options: [
          { value: "", label: "全部分类" },
          ...N.map((c) => ({ value: c.id, label: c.label }))
        ]
      }) : null,
      // Install target selector
      e.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 4 } },
        e.createElement(
          D,
          { type: "secondary", style: { fontSize: 12 } },
          "安装到"
        ),
        e.createElement(A, {
          value: ve || void 0,
          onChange: (c) => _(c),
          style: { minWidth: 140 },
          placeholder: "选择专家",
          options: Ee.map((c) => ({ value: c.id, label: c.name }))
        })
      )
    ),
    // Source filter tags (GitHub sources + market providers)
    pe.length > 0 ? e.createElement(
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
        D,
        { type: "secondary", style: { fontSize: 12, marginRight: 4 } },
        "来源筛选:"
      ),
      e.createElement(
        U,
        {
          style: {
            fontSize: 11,
            cursor: "pointer",
            borderRadius: 12
          },
          color: Ie === "" ? "blue" : void 0,
          onClick: () => He("")
        },
        "全部"
      ),
      ...pe.map(
        (c) => e.createElement(
          U,
          {
            key: c,
            style: {
              fontSize: 11,
              cursor: "pointer",
              borderRadius: 12
            },
            color: Ie === c ? "blue" : void 0,
            icon: M && be.some((Q) => Q.label === c) ? e.createElement(M) : void 0,
            onClick: () => He(
              Ie === c ? "" : c
            )
          },
          c
        )
      )
    ) : null,
    // GitHub skills section
    Ue && Se.length === 0 ? e.createElement(
      "div",
      { style: { textAlign: "center", padding: 40, marginBottom: 16 } },
      e.createElement(s, {
        tip: "正在从 GitHub 加载技能...",
        size: "large"
      })
    ) : ze.length > 0 ? e.createElement(
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
        M ? e.createElement(M, {
          style: { fontSize: 14, color: "#1677ff" }
        }) : null,
        e.createElement(
          D,
          { strong: !0, style: { fontSize: 13 } },
          `GitHub 技能源 (${ze.length})`
        )
      ),
      e.createElement(
        I,
        { gutter: [12, 12] },
        ...ze.map((c) => {
          const Q = `github:${c.sourceId}:${c.name}`, ge = W[Q];
          return e.createElement(
            b,
            { key: Q, xs: 24, sm: 12, md: 8, lg: 6 },
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
                M ? e.createElement(M, {
                  style: { fontSize: 18, color: "#57606a" }
                }) : e.createElement(
                  "span",
                  { style: { fontSize: 18 } },
                  "📦"
                ),
                e.createElement(
                  v,
                  { title: c.name },
                  e.createElement(
                    D,
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
                te,
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
                  { style: { display: "flex", gap: 4, flexWrap: "wrap" } },
                  e.createElement(
                    U,
                    { color: "blue", style: { fontSize: 10 } },
                    c.sourceLabel
                  ),
                  c.version ? e.createElement(
                    U,
                    { style: { fontSize: 10 } },
                    `v${c.version}`
                  ) : null
                ),
                ge ? e.createElement(
                  i,
                  {
                    size: "small",
                    disabled: !0,
                    icon: C ? e.createElement(C) : void 0
                  },
                  ge === "starting" ? "启动中" : "安装中"
                ) : e.createElement(
                  i,
                  {
                    type: "primary",
                    size: "small",
                    icon: y ? e.createElement(y) : void 0,
                    onClick: () => ke(c)
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
    $e.length > 0 || ce ? e.createElement(
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
        D,
        { strong: !0, style: { fontSize: 13 } },
        `技能市场${$e.length > 0 ? ` (${$e.length})` : ""}`
      )
    ) : null,
    // Results grid
    ce && $e.length === 0 ? e.createElement(
      "div",
      { style: { textAlign: "center", padding: 60 } },
      e.createElement(s, { size: "large" })
    ) : $e.length === 0 ? e.createElement(o, {
      description: k ? `未找到匹配「${k}」的技能` : "输入关键词搜索技能市场",
      image: o.PRESENTED_IMAGE_SIMPLE
    }) : e.createElement(
      I,
      { gutter: [12, 12] },
      ...$e.map((c) => {
        const Q = `${c.source}:${c.slug}`, ge = W[Q];
        return e.createElement(
          b,
          { key: Q, xs: 24, sm: 12, md: 8, lg: 6 },
          e.createElement(
            E,
            {
              hoverable: !0,
              size: "small",
              style: { height: "100%", cursor: "pointer" },
              onClick: () => ie(c)
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
                v,
                { title: c.name },
                e.createElement(
                  D,
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
              te,
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
                  U,
                  { color: "geekblue", style: { fontSize: 10 } },
                  c.source
                ),
                c.version ? e.createElement(
                  U,
                  { style: { fontSize: 10 } },
                  `v${c.version}`
                ) : null
              ),
              ge ? e.createElement(
                i,
                {
                  size: "small",
                  disabled: !0,
                  icon: C ? e.createElement(C) : void 0
                },
                ge === "starting" ? "启动中" : "安装中"
              ) : e.createElement(
                i,
                {
                  type: "primary",
                  size: "small",
                  icon: y ? e.createElement(y) : void 0,
                  onClick: (ye) => {
                    ye.stopPropagation(), T(c);
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
    J && !ce ? e.createElement(
      "div",
      { style: { textAlign: "center", marginTop: 16 } },
      e.createElement(
        i,
        { onClick: de, loading: ce },
        "加载更多"
      )
    ) : null,
    // Detail Drawer
    q ? e.createElement(
      H,
      {
        title: e.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 8 } },
          q.icon_url ? e.createElement("img", {
            src: q.icon_url,
            alt: q.name,
            style: { width: 28, height: 28, borderRadius: 4 }
          }) : e.createElement(
            "span",
            { style: { fontSize: 20 } },
            "📦"
          ),
          e.createElement("span", null, q.name)
        ),
        open: !0,
        onClose: () => ie(null),
        width: 480,
        extra: e.createElement(
          i,
          {
            type: "primary",
            icon: y ? e.createElement(y) : void 0,
            onClick: () => {
              T(q);
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
          q.source
        ),
        e.createElement(
          w.Item,
          { label: "描述" },
          q.description || "-"
        ),
        q.version ? e.createElement(
          w.Item,
          { label: "版本" },
          q.version
        ) : null,
        q.author ? e.createElement(
          w.Item,
          { label: "作者" },
          q.author
        ) : null,
        e.createElement(
          w.Item,
          { label: "来源链接" },
          e.createElement(
            "a",
            { href: q.source_url, target: "_blank" },
            q.source_url
          )
        )
      ),
      q.stats ? e.createElement(
        "div",
        { style: { marginTop: 16 } },
        e.createElement(
          D,
          {
            strong: !0,
            style: { display: "block", marginBottom: 8 }
          },
          "统计"
        ),
        e.createElement(
          "div",
          { style: { display: "flex", gap: 12, flexWrap: "wrap" } },
          ...Object.entries(q.stats).map(
            ([c, Q]) => e.createElement(
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
                String(Q)
              ),
              e.createElement(
                D,
                { type: "secondary", style: { fontSize: 11 } },
                c
              )
            )
          )
        )
      ) : null
    ) : null
  ), nt = l(() => {
    if (!se.trim()) return at;
    const c = se.toLowerCase();
    return at.filter(
      (Q) => Q.name.toLowerCase().includes(c) || Q.description.toLowerCase().includes(c) || Q.category.toLowerCase().includes(c)
    );
  }, [se]), Ve = async (c) => {
    try {
      const Q = await ee("/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: c.name,
          description: c.description,
          skill_names: c.recommendedSkills
        })
      });
      await Qe(Q.id, "AGENTS.md", c.systemPrompt);
      const ge = await Ze(Q.id);
      ge.approval_level = c.approvalLevel, await ee(`/agents/${encodeURIComponent(Q.id)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ge)
      }), d.success(`专家「${c.name}」创建成功，已跳转至专家`), Ce("/ugsci-experts");
    } catch (Q) {
      d.error(Q.message || "创建专家失败");
    }
  }, We = e.createElement(
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
        D,
        { style: { fontSize: 13, color: "#1f4e8c" } },
        "从专家模板库选择预设专家，一键创建并配置系统提示词、审批级别和推荐技能。未来将支持从远程市场获取更多行业专家模板。"
      )
    ),
    e.createElement(h, {
      placeholder: "搜索专家模板...",
      prefix: F ? e.createElement(F) : void 0,
      value: se,
      onChange: (c) => ue(c.target.value),
      allowClear: !0,
      style: { marginBottom: 16, maxWidth: 400 }
    }),
    e.createElement(
      I,
      { gutter: [12, 12] },
      ...nt.map(
        (c) => e.createElement(
          b,
          { key: c.id, xs: 24, sm: 12, md: 8 },
          e.createElement(
            E,
            {
              hoverable: !0,
              size: "small",
              style: { height: "100%", cursor: "pointer" },
              onClick: () => Ve(c)
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
              e.createElement(
                "span",
                { style: { fontSize: 28 } },
                c.emoji
              ),
              e.createElement(
                "div",
                { style: { flex: 1 } },
                e.createElement(
                  D,
                  { strong: !0, style: { fontSize: 14 } },
                  c.name
                ),
                e.createElement(
                  "div",
                  { style: { display: "flex", gap: 4, marginTop: 4 } },
                  e.createElement(
                    U,
                    { color: "blue", style: { fontSize: 10 } },
                    c.category
                  ),
                  c.approvalLevel === "MANUAL" ? e.createElement(
                    U,
                    { color: "orange", style: { fontSize: 10 } },
                    "需审批"
                  ) : e.createElement(
                    U,
                    { color: "green", style: { fontSize: 10 } },
                    "自动"
                  )
                )
              )
            ),
            e.createElement(
              te,
              {
                type: "secondary",
                style: { fontSize: 12, margin: 0, lineHeight: 1.5 },
                ellipsis: { rows: 3 }
              },
              c.description.replace(/\*\*(.+?)\*\*/g, "$1")
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
                D,
                { type: "secondary", style: { fontSize: 11 } },
                `推荐 ${c.recommendedSkills.length} 个技能`
              ),
              e.createElement(
                i,
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
      z ? e.createElement(z, {
        style: { fontSize: 24, color: "#bfbfbf", marginBottom: 8 }
      }) : null,
      e.createElement(
        D,
        { type: "secondary", style: { fontSize: 12 } },
        "更多专家模板持续更新中，未来将支持 OpenScience、RPA 等行业扩展"
      )
    )
  ), Nt = [
    {
      key: "skills",
      label: e.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        O ? e.createElement(O, { style: { fontSize: 14 } }) : null,
        "技能市场"
      ),
      children: tt
    },
    {
      key: "experts",
      label: e.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        x ? e.createElement(x, { style: { fontSize: 14 } }) : null,
        "专家模板"
      ),
      children: We
    }
  ];
  return e.createElement(
    "div",
    { style: { padding: 24 } },
    e.createElement(et, {
      title: "市场",
      subtitle: "浏览技能市场 · 选择专家模板 · 随时更新能力和专家",
      extra: e.createElement(
        "div",
        { style: { display: "flex", gap: 8 } },
        e.createElement(
          i,
          {
            icon: M ? e.createElement(M) : void 0,
            onClick: () => Be(!0)
          },
          "配置源"
        ),
        e.createElement(
          i,
          {
            type: "primary",
            icon: j ? e.createElement(j) : void 0,
            onClick: () => {
              X(k, p, {}), je();
            },
            loading: ce || Ue
          },
          "刷新"
        )
      )
    }),
    e.createElement(K, {
      items: Nt,
      activeKey: m,
      onChange: (c) => S(c)
    }),
    // Source config modal
    e.createElement(Vn, {
      open: Ge,
      onClose: () => Be(!1),
      sources: be,
      onChange: (c) => {
        we(c), je(c);
      }
    })
  );
}
function el() {
  var i;
  const e = window.QwenPaw;
  if (!(e != null && e.menu) || !(e != null && e.route)) {
    console.warn(
      "[ugsci] QwenPaw.menu/route API not available — plugin disabled"
    );
    return;
  }
  const t = f().React, a = "ugsci", n = f().antdIcons || {}, l = n.UserSwitchOutlined, r = n.ToolOutlined, s = n.ThunderboltOutlined, o = n.ShopOutlined;
  e.route.add(a, {
    id: "ugsci.experts",
    path: "/ugsci-experts",
    component: An
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
    component: Un
  }), e.menu.add(a, {
    id: "ugsci.capabilities",
    location: "primary.agentScoped",
    label: () => "工具",
    icon: r ? t.createElement(r, { style: { fontSize: 16 } }) : void 0,
    route: "ugsci.capabilities",
    order: 6,
    visible: () => Je()
  }), e.route.add(a, {
    id: "ugsci.skills-center",
    path: "/ugsci-skills",
    component: Wn
  }), e.menu.add(a, {
    id: "ugsci.skills-center",
    location: "primary.agentScoped",
    label: () => "技能",
    icon: s ? t.createElement(s, { style: { fontSize: 16 } }) : void 0,
    route: "ugsci.skills-center",
    order: 7,
    visible: () => Je()
  }), e.route.add(a, {
    id: "ugsci.market",
    path: "/ugsci-market",
    component: Zn
  }), e.menu.add(a, {
    id: "ugsci.market",
    location: "primary.agentScoped",
    label: () => "市场",
    icon: o ? t.createElement(o, { style: { fontSize: 16 } }) : void 0,
    route: "ugsci.market",
    order: 8,
    visible: () => Je()
  }), (i = e.sidebar) != null && i.registerSimpleModeItems ? (e.sidebar.registerSimpleModeItems([
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
  for (const d of h) {
    try {
      const b = e.menu.snapshot("primary.agentScoped").find((E) => E.id === d);
      b && e.menu.replace(a, d, {
        ...b,
        visible: () => !Je()
      });
    } catch {
    }
    try {
      const b = e.menu.snapshot("primary.settings").find((E) => E.id === d);
      b && e.menu.replace(a, d, {
        ...b,
        visible: () => !Je()
      });
    } catch {
    }
  }
  console.info(
    "[ugsci] Plugin registered: 4 routes + menu items, simple-mode whitelist + simplified navigation active"
  );
}
function ot() {
  try {
    el();
  } catch (e) {
    console.error("[ugsci] Failed to build plugin:", e), setTimeout(ot, 500);
  }
}
var wt;
if ((wt = window.QwenPaw) != null && wt.host)
  ot();
else {
  const e = setInterval(() => {
    var t;
    (t = window.QwenPaw) != null && t.host && (clearInterval(e), ot());
  }, 200);
  setTimeout(() => clearInterval(e), 1e4);
}
