function h() {
  var t;
  const e = (t = window.QwenPaw) == null ? void 0 : t.host;
  if (!e) throw new Error("[ugsci] QwenPaw.host not available");
  return e;
}
function Rt() {
  try {
    return h().getApiToken() || "";
  } catch {
    return "";
  }
}
function ht(e) {
  return h().getApiUrl(e);
}
function vt(e) {
  const t = Rt();
  return {
    "Content-Type": "application/json",
    ...t ? { Authorization: `Bearer ${t}` } : {},
    ...e
  };
}
async function te(e, t) {
  const a = await fetch(ht(e), {
    ...t,
    headers: { ...vt(), ...(t == null ? void 0 : t.headers) || {} }
  });
  if (!a.ok) {
    const n = await a.text().catch(() => "");
    throw new Error(n || `HTTP ${a.status}`);
  }
  return a.status === 204 ? null : a.json();
}
async function ot() {
  const e = await te("/agents");
  return (e == null ? void 0 : e.agents) || [];
}
async function Ye(e) {
  return te(`/agents/${encodeURIComponent(e)}`);
}
async function st(e) {
  return await te("/skills", {
    headers: { "X-Agent-Id": e }
  }) || [];
}
async function it() {
  return await te("/skills/pool") || [];
}
async function Lt() {
  return await te("/skills/workspaces") || [];
}
async function Bt(e) {
  return await te("/mcp", {
    headers: { "X-Agent-Id": e }
  }) || [];
}
async function jt(e, t) {
  return te(
    `/mcp/toggle/${encodeURIComponent(t)}`,
    {
      method: "PATCH",
      headers: { "X-Agent-Id": e }
    }
  );
}
async function Dt(e, t) {
  await te(`/mcp/${encodeURIComponent(t)}`, {
    method: "DELETE",
    headers: { "X-Agent-Id": e }
  });
}
async function Nt(e, t, a) {
  return te("/mcp", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify({ client_key: t, client: a })
  });
}
async function Ut(e, t) {
  return await te(
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
function Ge() {
  try {
    return localStorage.getItem("qwenpaw_sidebar_mode") === "simple";
  } catch {
    return !1;
  }
}
function ct(e, t) {
  const a = h();
  return a.ReactMarkdown && a.remarkGfm ? t.createElement(
    a.ReactMarkdown,
    { remarkPlugins: [a.remarkGfm] },
    e
  ) : e.replace(/\*\*(.+?)\*\*/g, "$1").replace(/\*(.+?)\*/g, "$1").replace(/`(.+?)`/g, "$1").replace(/^#+\s*/gm, "").replace(/^[-*]\s+/gm, "• ");
}
const nt = [
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
], bt = "ugsci_custom_teams";
function Ke() {
  try {
    const e = localStorage.getItem(bt);
    return e ? JSON.parse(e) : [];
  } catch {
    return [];
  }
}
function St(e) {
  try {
    localStorage.setItem(bt, JSON.stringify(e));
  } catch {
  }
}
const Ft = [
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
async function Ht(e, t) {
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
  await fetch(ht("/console/chat"), {
    method: "POST",
    headers: {
      ...vt(),
      "X-Agent-Id": e
    },
    body: JSON.stringify(a)
  });
}
function Ve(e, t) {
  const a = e.find(
    (l) => l.name === t || l.name === t.replace(/\s+/g, "")
  );
  if (a) return a.id;
  const n = e.find(
    (l) => l.name.includes(t) || t.includes(l.name) || l.name.replace(/\s+/g, "").includes(t.replace(/\s+/g, ""))
  );
  return n ? n.id : null;
}
function Wt(e) {
  var a;
  const t = e.members.map((n) => `- ${n.emoji} ${n.name}（${n.role}）`).join(`
`);
  if (e.custom && e.steps && e.steps.length > 0) {
    const n = e.steps.map((r, s) => {
      const i = r.passContext ? "（传递上一步的结果作为上下文）" : "（独立执行，不传递上下文）";
      return `${s + 1}. 向「${r.agentName}」发送请求：${r.instruction} ${i}`;
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
function Gt({ team: e }) {
  const t = h().React, { Typography: a, Tag: n } = h().antd, { Text: l } = a, r = {
    pipeline: "→",
    roundtable: "⇄",
    coordinator: "⊙"
  }, s = {
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
      ...f ? i.map((c, p) => {
        const P = e.members.find(
          (v) => v.name === c.agentName
        );
        return [
          p > 0 && e.mode !== "roundtable" ? t.createElement(
            "div",
            {
              key: `arrow-${p}`,
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
              key: `step-${p}`,
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
            t.createElement(
              "span",
              { style: { fontSize: 16 } },
              (P == null ? void 0 : P.emoji) || "👤"
            ),
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
        ];
      }).flat() : e.members.map((c, p) => [
        p > 0 && e.mode !== "roundtable" ? t.createElement(
          "div",
          {
            key: `arrow-${p}`,
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
            key: `member-${p}`,
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
          t.createElement("span", { style: { fontSize: 16 } }, c.emoji),
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
function Jt({
  open: e,
  onClose: t,
  agents: a,
  editingTeam: n,
  onSaved: l
}) {
  const r = h().React, { useState: s, useEffect: i, useCallback: f } = r, {
    Modal: c,
    Input: p,
    Button: P,
    Select: v,
    Tag: E,
    Typography: H,
    Switch: x,
    Empty: A,
    message: O,
    Divider: W,
    Steps: S
  } = h().antd, { PlusOutlined: V, DeleteOutlined: R, SaveOutlined: _, ArrowRightOutlined: B } = h().antdIcons || {}, { Text: N, Paragraph: g } = H, [z, I] = s(""), [q, T] = s("🤝"), [w, d] = s(""), [L, j] = s(
    "pipeline"
  ), [Z, M] = s(""), [u, ee] = s(""), [o, ae] = s([]), [U, Q] = s([]), [J, K] = s(!1);
  i(() => {
    e && (n ? (I(n.name), T(n.emoji), d(n.description), j(n.mode), M(n.coordinatorName || ""), ee(n.taskTemplate), ae(n.steps || []), Q(n.members.map((D) => D.name))) : (I(""), T("🤝"), d(""), j("pipeline"), M(""), ee(`请执行以下任务：
任务描述：{任务描述}`), ae([]), Q([])));
  }, [e, n]);
  const C = f(() => {
    if (L === "roundtable") {
      const D = U.map(($) => ({
        agentName: $,
        instruction: "请给出你的专业评估意见",
        passContext: !1
      }));
      ae(D);
    } else if (L === "pipeline") {
      const D = new Map(o.map((ne) => [ne.agentName, ne])), $ = U.map((ne) => D.get(ne) || {
        agentName: ne,
        instruction: "请完成你的专业部分",
        passContext: !0
      });
      ae($);
    }
  }, [L, U, o]), re = (D) => {
    U.includes(D) || (Q([...U, D]), L === "coordinator" && !Z && M(D));
  }, y = (D) => {
    Q(U.filter(($) => $ !== D)), ae(o.filter(($) => $.agentName !== D)), Z === D && M(U[0] || "");
  }, se = (D, $, ne) => {
    const F = [...o];
    F[D] = { ...F[D], [$]: ne }, ae(F);
  }, oe = () => {
    if (!z.trim()) {
      O.warning("请输入团队名称");
      return;
    }
    if (U.length < 2) {
      O.warning("至少需要选择 2 个成员");
      return;
    }
    if (!u.trim()) {
      O.warning("请输入任务模板");
      return;
    }
    if (L === "coordinator" && !Z) {
      O.warning("请选择协调者");
      return;
    }
    K(!0);
    try {
      const D = U.map(
        (Ee) => {
          var Te;
          const ie = a.find((_e) => _e.name === Ee);
          return {
            name: Ee,
            role: ((Te = ie == null ? void 0 : ie.description) == null ? void 0 : Te.slice(0, 30)) || "团队成员",
            emoji: "👤"
          };
        }
      );
      let $ = o;
      (o.length === 0 || o.length !== U.length) && ($ = U.map((Ee) => ({
        agentName: Ee,
        instruction: "请完成你的专业部分",
        passContext: L === "pipeline"
      })));
      const ne = {
        id: (n == null ? void 0 : n.id) || `custom-${Date.now()}`,
        name: z.trim(),
        emoji: q,
        category: "自定义",
        description: w.trim() || `${z.trim()}（${U.length}人团队）`,
        mode: L,
        members: D,
        coordinatorName: L === "coordinator" ? Z : void 0,
        taskTemplate: u.trim(),
        orchestrationPrompt: "",
        // Custom teams use steps-based instructions
        steps: $,
        custom: !0,
        createdAt: (n == null ? void 0 : n.createdAt) || Date.now()
      }, F = Ke(), he = F.findIndex((Ee) => Ee.id === ne.id);
      he >= 0 ? F[he] = ne : F.push(ne), St(F), O.success(n ? "团队已更新" : "团队已创建"), l(), t();
    } catch (D) {
      O.error(D.message || "保存失败");
    } finally {
      K(!1);
    }
  }, Se = [
    "🤝",
    "🛢️",
    "⛏️",
    "📋",
    "🧪",
    "🌍",
    "📡",
    "⚙️",
    "🔬",
    "📊",
    "🏗️",
    "💡"
  ], we = a.filter(
    (D) => !U.includes(D.name)
  );
  return r.createElement(
    c,
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
      onOk: oe,
      okText: "保存团队",
      confirmLoading: J,
      okButtonProps: {
        icon: _ ? r.createElement(_) : void 0
      }
    },
    // Step 1: Basic info
    r.createElement(
      "div",
      { style: { marginBottom: 16 } },
      r.createElement(
        N,
        {
          strong: !0,
          style: { display: "block", marginBottom: 8, fontSize: 13 }
        },
        "1. 基本信息"
      ),
      r.createElement(
        "div",
        { style: { display: "flex", gap: 8, marginBottom: 8 } },
        r.createElement(v, {
          value: q,
          onChange: (D) => T(D),
          style: { width: 60 },
          options: Se.map((D) => ({ value: D, label: D })),
          optionRender: (D) => r.createElement("span", { style: { fontSize: 18 } }, D.value)
        }),
        r.createElement(p, {
          placeholder: "团队名称（如：储层评价团队）",
          value: z,
          onChange: (D) => I(D.target.value),
          style: { flex: 1 }
        })
      ),
      r.createElement(p.TextArea, {
        placeholder: "团队描述（简述团队的目标和适用场景）",
        value: w,
        onChange: (D) => d(D.target.value),
        rows: 2,
        style: { marginBottom: 8 }
      }),
      r.createElement(
        "div",
        { style: { display: "flex", gap: 8, alignItems: "center" } },
        r.createElement(
          N,
          { type: "secondary", style: { fontSize: 12 } },
          "协同模式："
        ),
        r.createElement(v, {
          value: L,
          onChange: (D) => j(D),
          style: { width: 160 },
          options: [
            { value: "pipeline", label: "🔄 流水线（依次执行）" },
            { value: "roundtable", label: "🔀 圆桌讨论（独立评估）" },
            { value: "coordinator", label: "🎯 协调者（由协调者主导）" }
          ]
        })
      )
    ),
    r.createElement(W, { style: { margin: "12px 0" } }),
    // Step 2: Select members
    r.createElement(
      "div",
      { style: { marginBottom: 16 } },
      r.createElement(
        N,
        {
          strong: !0,
          style: { display: "block", marginBottom: 8, fontSize: 13 }
        },
        "2. 选择团队成员"
      ),
      // Available agents
      we.length > 0 ? r.createElement(
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
        ...we.map(
          (D) => r.createElement(
            P,
            {
              key: D.id,
              size: "small",
              icon: V ? r.createElement(V) : void 0,
              onClick: () => re(D.name)
            },
            D.name
          )
        )
      ) : null,
      // Selected members
      U.length === 0 ? r.createElement(A, {
        description: "请从上方添加团队成员",
        image: A.PRESENTED_IMAGE_SIMPLE
      }) : r.createElement(
        "div",
        { style: { display: "flex", flexDirection: "column", gap: 4 } },
        ...U.map(
          (D) => r.createElement(
            "div",
            {
              key: D,
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
              r.createElement("span", null, "👤"),
              r.createElement(
                N,
                { strong: !0, style: { fontSize: 13 } },
                D
              ),
              L === "coordinator" && Z === D ? r.createElement(
                E,
                { color: "blue", style: { fontSize: 10 } },
                "协调者"
              ) : null
            ),
            r.createElement(
              "div",
              { style: { display: "flex", gap: 4 } },
              L === "coordinator" ? r.createElement(
                P,
                {
                  size: "small",
                  type: "link",
                  onClick: () => M(D)
                },
                "设为协调者"
              ) : null,
              r.createElement(
                P,
                {
                  size: "small",
                  type: "link",
                  danger: !0,
                  icon: R ? r.createElement(R) : void 0,
                  onClick: () => y(D)
                },
                "移除"
              )
            )
          )
        )
      )
    ),
    r.createElement(W, { style: { margin: "12px 0" } }),
    // Step 3: Define execution steps (for pipeline/roundtable)
    U.length > 0 ? r.createElement(
      "div",
      { style: { marginBottom: 16 } },
      r.createElement(
        N,
        {
          strong: !0,
          style: { display: "block", marginBottom: 8, fontSize: 13 }
        },
        `3. 编排执行步骤${L === "roundtable" ? "（各步独立执行）" : L === "pipeline" ? "（依次执行，可传递上下文）" : "（由协调者决定调用顺序）"}`
      ),
      // Auto-sync button
      r.createElement(
        P,
        {
          size: "small",
          type: "dashed",
          onClick: C,
          style: { marginBottom: 8 }
        },
        "自动生成步骤"
      ),
      // Steps list
      o.length === 0 ? r.createElement(
        N,
        { type: "secondary", style: { fontSize: 12 } },
        "点击「自动生成步骤」或手动配置每步的指令"
      ) : r.createElement(
        "div",
        { style: { display: "flex", flexDirection: "column", gap: 6 } },
        ...o.map(
          (D, $) => r.createElement(
            "div",
            {
              key: $,
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
              L === "pipeline" ? r.createElement(
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
                `${$ + 1}`
              ) : r.createElement(
                "span",
                { style: { fontSize: 14 } },
                "🔀"
              ),
              r.createElement(
                E,
                { color: "blue", style: { fontSize: 11 } },
                D.agentName
              ),
              r.createElement(
                "div",
                { style: { flex: 1 } },
                r.createElement(p, {
                  placeholder: "请输入该步骤的指令...",
                  value: D.instruction,
                  onChange: (ne) => se($, "instruction", ne.target.value),
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
              r.createElement(x, {
                size: "small",
                checked: D.passContext,
                onChange: (ne) => se($, "passContext", ne)
              }),
              r.createElement(
                N,
                { type: "secondary", style: { fontSize: 11 } },
                D.passContext ? "传递上一步结果作为上下文" : "独立执行"
              )
            )
          )
        )
      )
    ) : null,
    r.createElement(W, { style: { margin: "12px 0" } }),
    // Step 4: Task template
    r.createElement(
      "div",
      null,
      r.createElement(
        N,
        {
          strong: !0,
          style: { display: "block", marginBottom: 8, fontSize: 13 }
        },
        `${U.length > 0 ? "4" : "3"}. 任务模板`
      ),
      r.createElement(p.TextArea, {
        placeholder: `输入任务模板，可用 {参数名} 作为占位符...

例如：
请对区块 {区块名} 的井 {井号} 进行储层评价`,
        value: u,
        onChange: (D) => ee(D.target.value),
        rows: 4,
        style: { fontFamily: "monospace", fontSize: 13 }
      }),
      r.createElement(
        N,
        {
          type: "secondary",
          style: { fontSize: 11, display: "block", marginTop: 4 }
        },
        "占位符 {参数名} 在发起任务时可由用户填写替换"
      )
    )
  );
}
function mt({
  team: e,
  agents: t,
  onLaunch: a,
  onEdit: n,
  onDelete: l
}) {
  var w;
  const r = h().React, { useState: s } = r, { Card: i, Tag: f, Typography: c, Button: p, Tooltip: P } = h().antd, {
    TeamOutlined: v,
    RocketOutlined: E,
    UserOutlined: H,
    EditOutlined: x,
    DeleteOutlined: A,
    DownOutlined: O,
    UpOutlined: W
  } = h().antdIcons || {}, { Text: S, Paragraph: V } = c, [R, _] = s(!1), B = {
    coordinator: { label: "协调者模式", color: "blue" },
    pipeline: { label: "流水线模式", color: "cyan" },
    roundtable: { label: "圆桌讨论", color: "purple" }
  }, N = B[e.mode] || B.coordinator, g = e.members.map((d) => {
    const L = Ve(t, d.name);
    return { ...d, found: !!L, agentId: L };
  }), z = g.filter((d) => d.found).length, I = z === e.members.length, q = e.coordinatorName || ((w = e.members[0]) == null ? void 0 : w.name), T = q ? Ve(t, q) : null;
  return r.createElement(
    i,
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
      r.createElement("span", { style: { fontSize: 24 } }, e.emoji),
      r.createElement(
        "div",
        { style: { flex: 1 } },
        r.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 6 } },
          r.createElement(
            S,
            { strong: !0, style: { fontSize: 14 } },
            e.name
          ),
          e.custom ? r.createElement(
            f,
            { color: "gold", style: { fontSize: 9 } },
            "自定义"
          ) : null
        ),
        r.createElement(
          "div",
          { style: { display: "flex", gap: 4, marginTop: 4 } },
          r.createElement(
            f,
            { color: N.color, style: { fontSize: 10 } },
            N.label
          ),
          r.createElement(
            f,
            { style: { fontSize: 10 } },
            `${z}/${e.members.length}`
          ),
          I ? null : r.createElement(
            f,
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
          P,
          { title: "编辑" },
          r.createElement(p, {
            type: "text",
            size: "small",
            icon: x ? r.createElement(x) : void 0,
            onClick: (d) => {
              d.stopPropagation(), n(e);
            }
          })
        ) : null,
        l ? r.createElement(
          P,
          { title: "删除" },
          r.createElement(p, {
            type: "text",
            size: "small",
            danger: !0,
            icon: A ? r.createElement(A) : void 0,
            onClick: (d) => {
              d.stopPropagation(), l(e);
            }
          })
        ) : null
      ) : null
    ),
    // Description
    r.createElement(
      V,
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
      ...g.map(
        (d) => r.createElement(
          P,
          {
            key: d.name,
            title: `${d.name}（${d.role}）${d.found ? "" : " - 未创建"}`
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
                background: d.found ? "#f0f5ff" : "#fff2f0",
                border: `1px solid ${d.found ? "#d6e4ff" : "#ffccc7"}`,
                fontSize: 11
              }
            },
            r.createElement("span", null, d.emoji),
            r.createElement(
              S,
              {
                style: { fontSize: 11, color: d.found ? "#1f4e8c" : "#cf1322" }
              },
              d.name
            )
          )
        )
      )
    ),
    // Toggle flow diagram
    r.createElement(
      p,
      {
        type: "link",
        size: "small",
        style: { padding: "0 0 4px 0", fontSize: 11, height: "auto" },
        onClick: (d) => {
          d.stopPropagation(), _(!R);
        },
        icon: R ? W ? r.createElement(W) : "▲" : O ? r.createElement(O) : "▼"
      },
      R ? "收起流程" : "查看执行流程"
    ),
    R ? r.createElement(Gt, { team: e }) : null,
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
        S,
        { type: "secondary", style: { fontSize: 11 } },
        q ? `协调者: ${q}` : ""
      ),
      r.createElement(
        p,
        {
          type: "primary",
          size: "small",
          icon: E ? r.createElement(E) : void 0,
          disabled: !T,
          onClick: () => a(e),
          style: Re
        },
        "发起团队任务"
      )
    )
  );
}
function Xt({
  agents: e,
  onLaunch: t
}) {
  const a = h().React, { useMemo: n, useState: l, useCallback: r, useEffect: s } = a, {
    Row: i,
    Col: f,
    Input: c,
    Empty: p,
    Typography: P,
    Tag: v,
    Button: E,
    Divider: H,
    message: x,
    Popconfirm: A
  } = h().antd, { SearchOutlined: O, TeamOutlined: W, PlusOutlined: S, RocketOutlined: V } = h().antdIcons || {}, { Text: R } = P, [_, B] = l(""), [N, g] = l([]), [z, I] = l(!1), [q, T] = l(null);
  s(() => {
    g(Ke());
  }, []);
  const w = r(() => {
    g(Ke());
  }, []), d = r(
    (o) => {
      const U = Ke().filter((Q) => Q.id !== o.id);
      St(U), g(U), x.success(`团队「${o.name}」已删除`);
    },
    [x]
  ), L = r((o) => {
    T(o), I(!0);
  }, []), j = r(() => {
    T(null), I(!0);
  }, []), Z = n(() => [...N, ...Ft], [N]), M = n(() => {
    if (!_.trim()) return Z;
    const o = _.toLowerCase();
    return Z.filter(
      (ae) => ae.name.toLowerCase().includes(o) || ae.description.toLowerCase().includes(o) || ae.category.toLowerCase().includes(o)
    );
  }, [Z, _]), u = M.filter((o) => o.custom), ee = M.filter((o) => !o.custom);
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
        R,
        { style: { fontSize: 13, color: "#389e0d" } },
        "多智能体协同 — 选择预设团队或创建自定义团队，支持流水线、圆桌讨论、协调者三种编排模式。"
      ),
      a.createElement(
        E,
        {
          type: "primary",
          size: "small",
          icon: S ? a.createElement(S) : void 0,
          onClick: j,
          style: Re
        },
        "创建专家团"
      )
    ),
    // Search
    a.createElement(c, {
      placeholder: "搜索团队名称、描述或类别...",
      prefix: O ? a.createElement(O) : void 0,
      value: _,
      onChange: (o) => B(o.target.value),
      allowClear: !0,
      style: { marginBottom: 16, maxWidth: 400 }
    }),
    // Custom teams section
    u.length > 0 ? a.createElement(
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
          R,
          { strong: !0, style: { fontSize: 14 } },
          `自定义团队 (${u.length})`
        )
      ),
      a.createElement(
        i,
        { gutter: [12, 12] },
        ...u.map(
          (o) => a.createElement(
            f,
            { key: o.id, xs: 24, sm: 12, md: 8 },
            a.createElement(mt, {
              team: o,
              agents: e,
              onLaunch: t,
              onEdit: L,
              onDelete: d
            })
          )
        )
      ),
      a.createElement(H, { style: { margin: "16px 0" } })
    ) : null,
    // Preset teams section
    ee.length > 0 ? a.createElement(
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
          R,
          { strong: !0, style: { fontSize: 14 } },
          `预设团队 (${ee.length})`
        ),
        a.createElement(
          R,
          { type: "secondary", style: { fontSize: 12 } },
          "· 行业典型工作流模板"
        )
      ),
      a.createElement(
        i,
        { gutter: [12, 12] },
        ...ee.map(
          (o) => a.createElement(
            f,
            { key: o.id, xs: 24, sm: 12, md: 8 },
            a.createElement(mt, {
              team: o,
              agents: e,
              onLaunch: t
            })
          )
        )
      )
    ) : null,
    // Empty state
    M.length === 0 ? a.createElement(p, {
      description: "未找到匹配的专家团队，点击「创建专家团」自定义",
      image: p.PRESENTED_IMAGE_SIMPLE
    }) : null,
    // Team Builder Modal
    a.createElement(Jt, {
      open: z,
      onClose: () => {
        I(!1), T(null);
      },
      agents: e,
      editingTeam: q,
      onSaved: w
    })
  );
}
function Kt(e) {
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
async function Vt(e) {
  return await te("/workspace/files", {
    headers: { "X-Agent-Id": e }
  }) || [];
}
async function qe(e, t, a) {
  await te(`/workspace/files/${encodeURIComponent(t)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify({ content: a })
  });
}
async function dt(e, t) {
  const a = await Ye(e);
  a.system_prompt_files = t, await te(`/agents/${encodeURIComponent(e)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(a)
  });
}
async function wt(e, t) {
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
async function qt(e, t) {
  await te(`/skills/${encodeURIComponent(t)}/enable`, {
    method: "POST",
    headers: { "X-Agent-Id": e }
  });
}
async function xt(e, t) {
  await te(`/skills/${encodeURIComponent(t)}`, {
    method: "DELETE",
    headers: { "X-Agent-Id": e }
  });
}
async function Yt(e, t) {
  return te("/skills/batch-enable", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify(t)
  });
}
async function Qt(e, t) {
  return te("/skills/batch-disable", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify(t)
  });
}
async function Zt(e, t) {
  return te("/skills/batch-delete", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify(t)
  });
}
async function Ct(e) {
  return await te("/mcp", {
    headers: { "X-Agent-Id": e }
  }) || [];
}
async function kt(e, t) {
  await te(`/mcp/${encodeURIComponent(t)}`, {
    method: "DELETE",
    headers: { "X-Agent-Id": e }
  });
}
async function en(e, t) {
  return te("/mcp", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify(t)
  });
}
async function tn(e, t) {
  return te(
    `/mcp/toggle/${encodeURIComponent(t)}`,
    {
      method: "PATCH",
      headers: { "X-Agent-Id": e }
    }
  );
}
async function nn(e, t) {
  await te(`/skills/${encodeURIComponent(t)}/disable`, {
    method: "POST",
    headers: { "X-Agent-Id": e }
  });
}
function ln(e) {
  const t = (e || "").trim();
  if (!t) return { number: 6, unit: "h" };
  const a = t.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/i);
  if (!a) return { number: 6, unit: "h" };
  const n = parseInt(a[1] || "0", 10), l = parseInt(a[2] || "0", 10), r = parseInt(a[3] || "0", 10), s = n * 60 + l + Math.round(r / 60);
  return s <= 0 ? { number: 6, unit: "h" } : s >= 60 && s % 60 === 0 ? { number: s / 60, unit: "h" } : { number: s, unit: "m" };
}
function an(e) {
  return e.unit === "h" ? `${e.number}h` : `${e.number}m`;
}
async function rn(e) {
  return te("/config/heartbeat", {
    headers: { "X-Agent-Id": e }
  });
}
async function on(e, t) {
  return te("/config/heartbeat", {
    method: "PUT",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify(t)
  });
}
async function sn(e) {
  await te("/config/heartbeat/run", {
    method: "POST",
    headers: { "X-Agent-Id": e }
  });
}
async function cn(e) {
  return te("/workspace/running-config", {
    headers: { "X-Agent-Id": e }
  });
}
async function mn(e, t) {
  return te("/workspace/running-config", {
    method: "PUT",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify(t)
  });
}
async function dn(e) {
  return (await te("/workspace/language", {
    headers: { "X-Agent-Id": e }
  })).language || "zh";
}
async function un(e, t) {
  await te("/workspace/language", {
    method: "PUT",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify({ language: t })
  });
}
async function pn() {
  return (await te("/config/user-timezone")).timezone || "UTC";
}
async function gn(e) {
  await te("/config/user-timezone", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ timezone: e })
  });
}
async function yn(e) {
  return await te("/workspace/system-prompt-files", {
    headers: { "X-Agent-Id": e }
  }) || [];
}
const ut = ["AGENTS.md", "SOUL.md", "PROFILE.md"];
function Qe({
  title: e,
  subtitle: t,
  extra: a
}) {
  const n = h().React, { Space: l } = h().antd;
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
function pt({
  items: e,
  max: t = 5,
  color: a = "blue",
  emptyText: n = "无"
}) {
  const l = h().React, { Tag: r } = h().antd;
  return !e || e.length === 0 ? l.createElement(
    "span",
    { style: { fontSize: 12, color: "#bfbfbf" } },
    n
  ) : l.createElement(
    "div",
    { style: { display: "flex", flexWrap: "wrap", gap: 4 } },
    ...e.slice(0, t).map(
      (s, i) => l.createElement(
        r,
        { key: i, color: a, style: { fontSize: 11, marginRight: 0 } },
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
function Tt({
  open: e,
  onClose: t,
  poolSkills: a,
  installedSkillNames: n,
  loading: l,
  onInstall: r
}) {
  const s = h().React, { useState: i, useEffect: f, useMemo: c } = s, { Modal: p, Button: P, Empty: v, Spin: E, Input: H, Tag: x, Tooltip: A, Typography: O } = h().antd, { CheckOutlined: W, SearchOutlined: S } = h().antdIcons || {}, { Text: V } = O, [R, _] = i([]), [B, N] = i("");
  f(() => {
    e && (_([]), N(""));
  }, [e]);
  const g = c(() => {
    if (!B.trim()) return a;
    const T = B.toLowerCase();
    return a.filter(
      (w) => {
        var d, L;
        return w.name.toLowerCase().includes(T) || ((d = w.description) == null ? void 0 : d.toLowerCase().includes(T)) || ((L = w.tags) == null ? void 0 : L.some((j) => j.toLowerCase().includes(T)));
      }
    );
  }, [a, B]), z = g.filter(
    (T) => !n.includes(T.name)
  ), I = (T) => {
    _(
      (w) => w.includes(T) ? w.filter((d) => d !== T) : [...w, T]
    );
  }, q = async () => {
    R.length !== 0 && (await r(R), _([]));
  };
  return s.createElement(
    p,
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
          V,
          { type: "secondary", style: { fontSize: 13 } },
          `已选择 ${R.length} 个技能`
        ),
        s.createElement(
          "div",
          { style: { display: "flex", gap: 8 } },
          s.createElement(P, { onClick: t }, "取消"),
          s.createElement(
            P,
            {
              type: "primary",
              onClick: q,
              disabled: R.length === 0
            },
            R.length > 0 ? `添加 (${R.length})` : "添加"
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
      s.createElement(H, {
        placeholder: "搜索技能名称、描述或标签...",
        prefix: S ? s.createElement(S) : void 0,
        value: B,
        onChange: (T) => N(T.target.value),
        allowClear: !0,
        style: { flex: 1 }
      }),
      s.createElement(
        P,
        {
          size: "small",
          type: "primary",
          onClick: () => _(z.map((T) => T.name))
        },
        "全选"
      ),
      s.createElement(
        P,
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
      s.createElement(E, { size: "large" })
    ) : g.length === 0 ? s.createElement(v, {
      description: B ? "未找到匹配的技能" : "技能池暂无可用技能",
      image: v.PRESENTED_IMAGE_SIMPLE
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
      ...g.map((T) => {
        const w = R.includes(T.name), d = n.includes(T.name);
        return s.createElement(
          "div",
          {
            key: T.name,
            onClick: () => !d && I(T.name),
            style: {
              position: "relative",
              padding: "10px 12px",
              border: `1px solid ${w ? "#0072f5" : "#e8e8e8"}`,
              borderRadius: 6,
              cursor: d ? "not-allowed" : "pointer",
              transition: "all 0.15s ease",
              background: w ? "rgba(0, 114, 245, 0.06)" : d ? "#fafafa" : "#fff",
              opacity: d ? 0.5 : 1,
              minHeight: 64
            }
          },
          w ? s.createElement(
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
            W ? s.createElement(W) : "✓"
          ) : null,
          d ? s.createElement(
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
                paddingRight: d || w ? 24 : 0
              }
            },
            s.createElement(
              "span",
              { style: { fontSize: 16 } },
              T.emoji || "⚡"
            ),
            s.createElement(
              A,
              { title: T.name },
              s.createElement(
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
                T.name
              )
            )
          ),
          T.description ? s.createElement(
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
          T.tags && T.tags.length > 0 ? s.createElement(
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
              (L, j) => s.createElement(
                x,
                {
                  key: j,
                  color: "cyan",
                  style: { fontSize: 10, marginRight: 0 }
                },
                L
              )
            )
          ) : null
        );
      })
    )
  );
}
const Je = {
  marginBottom: 4,
  fontSize: 13,
  fontWeight: 500,
  color: "rgba(0,0,0,0.85)",
  display: "flex",
  alignItems: "center",
  gap: 4
}, zt = { marginBottom: 16 }, It = {
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
}, _t = {
  fontSize: 12,
  color: "rgba(0,0,0,0.45)",
  marginLeft: 8
};
function fn({ agentId: e }) {
  const t = h().React, { useState: a, useEffect: n, useCallback: l } = t, {
    Switch: r,
    InputNumber: s,
    Select: i,
    Button: f,
    Spin: c,
    Space: p,
    Typography: P,
    message: v
  } = h().antd, { PlayCircleOutlined: E, SaveOutlined: H } = h().antdIcons || {}, { Text: x } = P, [A, O] = a(!0), [W, S] = a(!1), [V, R] = a(!1), [_, B] = a(!1), [N, g] = a(6), [z, I] = a("h"), [q, T] = a("main"), [w, d] = a(300), [L, j] = a(!1), [Z, M] = a("08:00"), [u, ee] = a("22:00"), o = l(async () => {
    var C, re;
    O(!0);
    try {
      const y = await rn(e), se = ln(y.every ?? "6h");
      B(y.enabled ?? !1), g(se.number), I(se.unit), T(y.target ?? "main"), d(y.timeoutSeconds ?? 300), j(!!y.activeHours), M(((C = y.activeHours) == null ? void 0 : C.start) ?? "08:00"), ee(((re = y.activeHours) == null ? void 0 : re.end) ?? "22:00");
    } catch (y) {
      v.error(y.message || "加载心跳配置失败");
    } finally {
      O(!1);
    }
  }, [e]);
  n(() => {
    o();
  }, [o]);
  const ae = async () => {
    S(!0);
    try {
      await on(e, {
        enabled: _,
        every: an({ number: N, unit: z }),
        target: q,
        timeoutSeconds: w,
        activeHours: L && Z && u ? { start: Z, end: u } : void 0
      }), v.success("心跳配置已保存");
    } catch (C) {
      v.error(C.message || "保存心跳配置失败");
    } finally {
      S(!1);
    }
  }, U = async () => {
    R(!0);
    try {
      await sn(e), v.success("已触发心跳检查");
    } catch (C) {
      v.error(C.message || "触发心跳失败");
    } finally {
      R(!1);
    }
  };
  if (A)
    return t.createElement(
      "div",
      { style: { textAlign: "center", padding: 40 } },
      t.createElement(c, { size: "large" })
    );
  const Q = (C, re, y) => t.createElement(
    "div",
    { style: zt },
    t.createElement("div", { style: Je }, C),
    re,
    y ? t.createElement(
      x,
      { type: "secondary", style: _t },
      y
    ) : null
  ), J = (C, re, y, se) => t.createElement(
    "div",
    { style: It },
    t.createElement(
      "div",
      null,
      t.createElement("div", { style: Je }, C),
      re
    ),
    t.createElement(
      "div",
      null,
      t.createElement("div", { style: Je }, y),
      se
    )
  ), { Divider: K } = h().antd;
  return t.createElement(
    "div",
    { style: { paddingBottom: 8 } },
    // ── Section: 基本设置 ──
    t.createElement("div", { style: De }, "基本设置"),
    Q(
      "启用心跳",
      t.createElement(r, {
        checked: _,
        onChange: (C) => B(C)
      }),
      _ ? "已启用，专家将定期自检" : "已停用"
    ),
    J(
      "检查频率",
      t.createElement(
        p,
        null,
        t.createElement(s, {
          min: 1,
          value: N,
          onChange: (C) => g(C ?? 1),
          style: { width: "100%" }
        }),
        t.createElement(i, {
          value: z,
          onChange: (C) => I(C),
          style: { width: 90 },
          options: [
            { value: "m", label: "分钟" },
            { value: "h", label: "小时" }
          ]
        })
      ),
      "心跳目标",
      t.createElement(i, {
        value: q,
        onChange: (C) => T(C),
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
      t.createElement(s, {
        min: 1,
        max: 3600,
        value: w,
        onChange: (C) => d(C ?? 300),
        style: { width: 200 }
      })
    ),
    // ── Section: 活跃时段 ──
    t.createElement(K, { style: { margin: "8px 0 16px" } }),
    t.createElement("div", { style: De }, "活跃时段"),
    Q(
      "启用活跃时段限制",
      t.createElement(r, {
        checked: L,
        onChange: (C) => j(C)
      }),
      "仅在指定时段内触发心跳"
    ),
    L ? J(
      "开始时间",
      t.createElement("input", {
        type: "time",
        value: Z,
        onChange: (C) => M(C.target.value),
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
        value: u,
        onChange: (C) => ee(C.target.value),
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
          icon: H ? t.createElement(H) : void 0,
          loading: W,
          onClick: ae,
          style: Re
        },
        "保存配置"
      ),
      t.createElement(
        f,
        {
          icon: E ? t.createElement(E) : void 0,
          loading: V,
          onClick: U
        },
        "立即执行"
      )
    )
  );
}
function En({
  agentId: e,
  onRefresh: t
}) {
  const a = h().React, { useState: n, useEffect: l, useCallback: r } = a, {
    List: s,
    Tag: i,
    Switch: f,
    Button: c,
    Empty: p,
    Spin: P,
    Typography: v,
    message: E
  } = h().antd, { PlusOutlined: H, ReloadOutlined: x, DeleteOutlined: A } = h().antdIcons || {}, { Text: O, Paragraph: W } = v, [S, V] = n([]), [R, _] = n(!0), [B, N] = n(!1), [g, z] = n([]), [I, q] = n(!1), T = r(async () => {
    _(!0);
    try {
      const M = await st(e);
      V(M);
    } catch (M) {
      E.error(M.message || "加载技能失败"), V([]);
    } finally {
      _(!1);
    }
  }, [e]);
  l(() => {
    T();
  }, [T]);
  const w = async () => {
    N(!0), q(!0);
    try {
      const M = await it();
      z(M);
    } catch (M) {
      E.error(M.message || "加载技能池失败");
    } finally {
      q(!1);
    }
  }, d = async (M) => {
    let u = 0, ee = 0;
    for (const o of M)
      try {
        await wt(e, o), u++;
      } catch {
        ee++;
      }
    u > 0 ? (E.success(
      `成功添加 ${u} 个技能${ee > 0 ? `，${ee} 个失败` : ""}`
    ), T(), t()) : ee > 0 && E.error("添加技能失败"), N(!1);
  }, L = async (M, u) => {
    try {
      u ? await qt(e, M.name) : await nn(e, M.name), E.success(u ? "已启用" : "已停用"), T(), t();
    } catch (ee) {
      E.error(ee.message || "操作失败");
    }
  }, j = async (M) => {
    try {
      await xt(e, M), E.success(`技能「${M}」已移除`), T(), t();
    } catch (u) {
      E.error(u.message || "移除技能失败");
    }
  };
  if (R)
    return a.createElement(
      "div",
      { style: { textAlign: "center", padding: 40 } },
      a.createElement(P, { size: "large" })
    );
  const Z = S.filter((M) => M.enabled !== !1);
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
        O,
        { strong: !0 },
        `技能列表 (${S.length}，已启用 ${Z.length})`
      ),
      a.createElement(
        "div",
        { style: { display: "flex", gap: 8 } },
        a.createElement(
          c,
          {
            size: "small",
            icon: x ? a.createElement(x) : void 0,
            onClick: T
          },
          "刷新"
        ),
        a.createElement(
          c,
          {
            type: "primary",
            size: "small",
            icon: H ? a.createElement(H) : void 0,
            onClick: w,
            style: Re
          },
          "从技能池添加"
        )
      )
    ),
    S.length === 0 ? a.createElement(p, {
      description: "该专家暂无技能",
      image: p.PRESENTED_IMAGE_SIMPLE
    }) : a.createElement(s, {
      dataSource: S,
      renderItem: (M) => a.createElement(
        s.Item,
        {
          actions: [
            a.createElement(f, {
              key: "toggle",
              size: "small",
              checked: M.enabled !== !1,
              onChange: (u) => L(M, u)
            }),
            a.createElement(
              c,
              {
                key: "del",
                type: "link",
                size: "small",
                danger: !0,
                icon: A ? a.createElement(A) : void 0,
                onClick: () => j(M.name)
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
            M.emoji ? a.createElement(
              "span",
              { style: { fontSize: 16 } },
              M.emoji
            ) : null,
            a.createElement(O, { strong: !0 }, M.name),
            M.version_text ? a.createElement(
              i,
              { style: { fontSize: 10 } },
              `v${M.version_text}`
            ) : null
          ),
          M.description ? a.createElement(
            W,
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
    a.createElement(Tt, {
      open: B,
      onClose: () => N(!1),
      poolSkills: g,
      installedSkillNames: S.map((M) => M.name),
      loading: I,
      onInstall: d
    })
  );
}
function hn({
  agentId: e,
  onRefresh: t,
  isActive: a
}) {
  const n = h().React, { useState: l, useEffect: r, useCallback: s } = n, {
    List: i,
    Tag: f,
    Button: c,
    Empty: p,
    Spin: P,
    Modal: v,
    Input: E,
    Typography: H,
    message: x
  } = h().antd, { PlusOutlined: A, ReloadOutlined: O, DeleteOutlined: W } = h().antdIcons || {}, { Text: S, Paragraph: V } = H, { TextArea: R } = E, [_, B] = l([]), [N, g] = l(!0), [z, I] = l(!1), [q, T] = l(`{
  "mcpServers": {
    "example-client": {
      "command": "npx",
      "args": ["-y", "@example/mcp-server"],
      "env": {}
    }
  }
}`), [w, d] = l(!1), L = s(async () => {
    g(!0);
    try {
      const u = await Ct(e);
      B(u);
    } catch (u) {
      x.error(u.message || "加载 MCP 失败"), B([]);
    } finally {
      g(!1);
    }
  }, [e]);
  r(() => {
    L();
  }, [L]), r(() => {
    a && L();
  }, [a, L]);
  const j = async (u) => {
    try {
      await tn(e, u), x.success("已切换 MCP 状态"), L(), t();
    } catch (ee) {
      x.error(ee.message || "切换失败");
    }
  }, Z = async (u) => {
    try {
      await kt(e, u), x.success(`MCP「${u}」已移除`), L(), t();
    } catch (ee) {
      x.error(ee.message || "移除 MCP 失败");
    }
  }, M = async () => {
    d(!0);
    try {
      const u = JSON.parse(q), ee = u.mcpServers || u, o = Object.entries(ee);
      if (o.length === 0) {
        x.warning("未找到 MCP 客户端配置");
        return;
      }
      for (const [ae, U] of o) {
        const Q = U, J = Q.url ? "streamable_http" : "stdio";
        await en(e, {
          client_key: ae,
          client: {
            name: Q.name || ae,
            description: Q.description || "",
            enabled: !0,
            transport: J,
            url: Q.url || "",
            command: Q.command || "",
            args: Q.args || [],
            env: Q.env || {},
            cwd: Q.cwd || "",
            headers: Q.headers || {}
          }
        });
      }
      x.success("MCP 客户端已创建"), I(!1), L(), t();
    } catch (u) {
      u instanceof SyntaxError ? x.error("JSON 格式错误：" + u.message) : x.error(u.message || "创建 MCP 失败");
    } finally {
      d(!1);
    }
  };
  return N ? n.createElement(
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
      n.createElement(S, { strong: !0 }, `MCP 客户端 (${_.length})`),
      n.createElement(
        "div",
        { style: { display: "flex", gap: 8 } },
        n.createElement(
          c,
          {
            size: "small",
            icon: O ? n.createElement(O) : void 0,
            onClick: L
          },
          "刷新"
        ),
        n.createElement(
          c,
          {
            type: "primary",
            size: "small",
            icon: A ? n.createElement(A) : void 0,
            onClick: () => I(!0),
            style: Re
          },
          "添加 MCP"
        )
      )
    ),
    _.length === 0 ? n.createElement(p, {
      description: "该专家暂无 MCP 客户端",
      image: p.PRESENTED_IMAGE_SIMPLE
    }) : n.createElement(i, {
      dataSource: _,
      renderItem: (u) => n.createElement(
        i.Item,
        {
          actions: [
            n.createElement(
              c,
              {
                key: "toggle",
                size: "small",
                onClick: () => j(u.key)
              },
              u.enabled ? "停用" : "启用"
            ),
            n.createElement(
              c,
              {
                key: "del",
                type: "link",
                size: "small",
                danger: !0,
                icon: W ? n.createElement(W) : void 0,
                onClick: () => Z(u.key)
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
            n.createElement(S, { strong: !0 }, u.name || u.key),
            n.createElement(
              f,
              {
                color: u.enabled ? "green" : "default",
                style: { fontSize: 10 }
              },
              u.enabled ? "启用" : "停用"
            ),
            n.createElement(
              f,
              { color: "purple", style: { fontSize: 10 } },
              u.transport
            )
          ),
          u.description ? n.createElement(
            V,
            {
              type: "secondary",
              style: { fontSize: 12, margin: 0 },
              ellipsis: { rows: 2 }
            },
            u.description
          ) : null,
          u.tools && u.tools.length > 0 ? n.createElement(
            "div",
            { style: { marginTop: 4, fontSize: 11, color: "#8c8c8c" } },
            `提供 ${u.tools.length} 个工具`
          ) : null
        )
      )
    }),
    // Create MCP modal
    n.createElement(
      v,
      {
        open: z,
        title: "添加 MCP 客户端 (JSON)",
        onCancel: () => I(!1),
        onOk: M,
        confirmLoading: w,
        okText: "创建",
        width: 560
      },
      n.createElement(
        "div",
        { style: { marginBottom: 8, fontSize: 12, color: "#8c8c8c" } },
        "粘贴 MCP 配置 JSON（支持 mcpServers 格式），将创建到当前专家工作区："
      ),
      n.createElement(R, {
        value: q,
        onChange: (u) => T(u.target.value),
        rows: 12,
        style: { fontFamily: "monospace", fontSize: 12 }
      })
    )
  );
}
function vn({ agentId: e }) {
  const t = h().React, { useState: a, useEffect: n, useCallback: l, useRef: r } = t, {
    Card: s,
    InputNumber: i,
    Input: f,
    Select: c,
    Switch: p,
    Button: P,
    Spin: v,
    Space: E,
    Typography: H,
    Divider: x,
    message: A
  } = h().antd, { SaveOutlined: O } = h().antdIcons || {}, { Text: W } = H, [S, V] = a(!0), [R, _] = a(!1), B = r(null), [N, g] = a(60), [z, I] = a(""), [q, T] = a(!0), [w, d] = a(30), [L, j] = a("zh"), [Z, M] = a("UTC"), [u, ee] = a(!0), [o, ae] = a(100), [U, Q] = a(!0), [J, K] = a(3), [C, re] = a(1), [y, se] = a(!0), [oe, Se] = a(3), [we, D] = a(2), [$, ne] = a(60), [F, he] = a(1), [Ee, ie] = a(0), [Te, _e] = a(1), [X, b] = a(0), [le, me] = a(30), [de, fe] = a(50), [be, Ae] = a("light"), [Ne, Ue] = a("scroll"), [We, Be] = a("remelight"), [Ie, Fe] = a("AUTO"), Le = l(async () => {
    var k, xe, Ce, ze, ke, $e;
    V(!0);
    try {
      const [ue, Ze, et] = await Promise.all([
        cn(e),
        dn(e).catch(() => "zh"),
        pn().catch(() => "UTC")
      ]);
      B.current = ue, g(ue.shell_command_timeout ?? 60), I(ue.shell_command_executable ?? "");
      const Xe = ue.auto_title_config ?? { enabled: !0, timeout_seconds: 30 };
      T(Xe.enabled ?? !0), d(Xe.timeout_seconds ?? 30), j(Ze), M(et);
      const He = ue.loop ?? {};
      ee(((k = He.iteration) == null ? void 0 : k.enabled) ?? !0), ae(((xe = He.iteration) == null ? void 0 : xe.max_iterations) ?? ue.max_iters ?? 100), Q(((Ce = He.doom_loop) == null ? void 0 : Ce.enabled) ?? !0), K(((ze = He.doom_loop) == null ? void 0 : ze.window_size) ?? 3), re(((ke = He.doom_loop) == null ? void 0 : ke.similarity_threshold) ?? 1), se(ue.llm_retry_enabled ?? !0), Se(ue.llm_max_retries ?? 3), D(ue.llm_backoff_base ?? 2), ne(ue.llm_backoff_cap ?? 60), he(ue.llm_max_concurrent ?? 1), ie(ue.llm_max_qpm ?? 0), _e(ue.llm_rate_limit_pause ?? 1), b(ue.llm_rate_limit_jitter ?? 0), me(ue.llm_acquire_timeout ?? 30), fe(ue.history_max_length ?? 50), Ae(ue.context_manager_backend ?? "light"), Ue((($e = ue.light_context_config) == null ? void 0 : $e.strategy) ?? "scroll"), Be(ue.memory_manager_backend ?? "remelight"), Fe(ue.approval_level ?? "AUTO");
    } catch (ue) {
      A.error(ue.message || "加载运行配置失败");
    } finally {
      V(!1);
    }
  }, [e]);
  n(() => {
    Le();
  }, [Le]);
  const je = async () => {
    var xe, Ce;
    const k = B.current;
    if (k) {
      _(!0);
      try {
        const ze = {
          ...k,
          max_iters: o,
          loop: {
            ...k.loop ?? {},
            iteration: { enabled: u, max_iterations: o },
            doom_loop: {
              enabled: U,
              window_size: J,
              similarity_threshold: C,
              stages: ((Ce = (xe = k.loop) == null ? void 0 : xe.doom_loop) == null ? void 0 : Ce.stages) ?? []
            }
          },
          shell_command_timeout: N,
          shell_command_executable: z,
          auto_title_config: {
            enabled: q,
            timeout_seconds: w
          },
          llm_retry_enabled: y,
          llm_max_retries: oe,
          llm_backoff_base: we,
          llm_backoff_cap: $,
          llm_max_concurrent: F,
          llm_max_qpm: Ee,
          llm_rate_limit_pause: Te,
          llm_rate_limit_jitter: X,
          llm_acquire_timeout: le,
          history_max_length: de,
          context_manager_backend: be,
          light_context_config: {
            ...k.light_context_config ?? {},
            strategy: Ne
          },
          memory_manager_backend: We,
          approval_level: Ie
        };
        await mn(e, ze), B.current = ze, L && await un(e, L).catch(() => {
        }), Z && await gn(Z).catch(() => {
        }), A.success("运行配置已保存");
      } catch (ze) {
        A.error(ze.message || "保存运行配置失败");
      } finally {
        _(!1);
      }
    }
  };
  if (S)
    return t.createElement(
      "div",
      { style: { textAlign: "center", padding: 40 } },
      t.createElement(v, { size: "large" })
    );
  const G = (k, xe, Ce) => t.createElement(
    "div",
    { style: zt },
    t.createElement("div", { style: Je }, k),
    xe,
    Ce ? t.createElement(
      W,
      { type: "secondary", style: _t },
      Ce
    ) : null
  ), ce = (k, xe, Ce, ze) => t.createElement(
    "div",
    { style: It },
    t.createElement(
      "div",
      null,
      t.createElement("div", { style: Je }, k),
      xe
    ),
    t.createElement(
      "div",
      null,
      t.createElement("div", { style: Je }, Ce),
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
    ce(
      "Shell 命令超时 (秒)",
      t.createElement(i, {
        min: 1,
        value: N,
        onChange: (k) => g(k ?? 60),
        style: { width: "100%" }
      }),
      "Shell 可执行文件",
      t.createElement(f, {
        value: z,
        onChange: (k) => I(k.target.value),
        placeholder: "留空使用系统默认",
        style: { width: "100%" }
      })
    ),
    ce(
      "语言",
      t.createElement(c, {
        value: L,
        onChange: (k) => j(k),
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
        onChange: (k) => M(k),
        style: { width: "100%" },
        showSearch: !0,
        filterOption: (k, xe) => {
          var Ce;
          return (((Ce = xe == null ? void 0 : xe.label) == null ? void 0 : Ce.toString()) || "").toLowerCase().includes(k.toLowerCase());
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
        ].map((k) => ({ value: k, label: k }))
      })
    ),
    ce(
      "自动生成会话标题",
      t.createElement(E, null, t.createElement(p, {
        checked: q,
        onChange: (k) => T(k)
      })),
      "标题生成超时 (秒)",
      t.createElement(i, {
        min: 5,
        value: w,
        onChange: (k) => d(k ?? 30),
        style: { width: "100%" },
        disabled: !q
      })
    ),
    // ── Section: 审批级别 ──
    t.createElement(x, { style: { margin: "8px 0 16px" } }),
    t.createElement("div", { style: De }, "审批级别"),
    G(
      "工具执行审批",
      t.createElement(c, {
        value: Ie,
        onChange: (k) => Fe(k),
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
    t.createElement(x, { style: { margin: "8px 0 16px" } }),
    t.createElement("div", { style: De }, "迭代与循环"),
    G(
      "启用迭代限制",
      t.createElement(p, {
        checked: u,
        onChange: (k) => ee(k)
      }),
      "停止 Agent 前的最大循环轮次"
    ),
    u ? G(
      "最大迭代次数",
      t.createElement(i, {
        min: 1,
        max: 500,
        value: o,
        onChange: (k) => ae(k ?? 100),
        style: { width: "100%" }
      })
    ) : null,
    G(
      "启用重复循环保护",
      t.createElement(p, {
        checked: U,
        onChange: (k) => Q(k)
      }),
      "检测并阻止重复操作循环"
    ),
    U ? ce(
      "检测窗口大小",
      t.createElement(i, {
        min: 2,
        max: 20,
        value: J,
        onChange: (k) => K(k ?? 3),
        style: { width: "100%" }
      }),
      "相似度阈值",
      t.createElement(i, {
        min: 0,
        max: 1,
        step: 0.05,
        value: C,
        onChange: (k) => re(k ?? 1),
        style: { width: "100%" }
      })
    ) : null,
    // ── Section: LLM 重试 ──
    t.createElement(x, { style: { margin: "8px 0 16px" } }),
    t.createElement("div", { style: De }, "LLM 重试"),
    G(
      "启用 LLM 重试",
      t.createElement(p, {
        checked: y,
        onChange: (k) => se(k)
      })
    ),
    ce(
      "最大重试次数",
      t.createElement(i, {
        min: 1,
        value: oe,
        onChange: (k) => Se(k ?? 3),
        style: { width: "100%" },
        disabled: !y
      }),
      "退避基数 (秒)",
      t.createElement(i, {
        min: 0.1,
        step: 0.1,
        value: we,
        onChange: (k) => D(k ?? 2),
        style: { width: "100%" },
        disabled: !y
      })
    ),
    G(
      "退避上限 (秒)",
      t.createElement(i, {
        min: 0.5,
        step: 0.5,
        value: $,
        onChange: (k) => ne(k ?? 60),
        style: { width: 200 },
        disabled: !y
      })
    ),
    // ── Section: LLM 限流 ──
    t.createElement(x, { style: { margin: "8px 0 16px" } }),
    t.createElement("div", { style: De }, "LLM 限流"),
    ce(
      "最大并发数",
      t.createElement(i, {
        min: 1,
        value: F,
        onChange: (k) => he(k ?? 1),
        style: { width: "100%" }
      }),
      "最大 QPM (0=不限)",
      t.createElement(i, {
        min: 0,
        step: 10,
        value: Ee,
        onChange: (k) => ie(k ?? 0),
        style: { width: "100%" }
      })
    ),
    ce(
      "限流暂停时间 (秒)",
      t.createElement(i, {
        min: 1,
        step: 0.5,
        value: Te,
        onChange: (k) => _e(k ?? 1),
        style: { width: "100%" }
      }),
      "限流抖动 (秒)",
      t.createElement(i, {
        min: 0,
        step: 0.5,
        value: X,
        onChange: (k) => b(k ?? 0),
        style: { width: "100%" }
      })
    ),
    G(
      "获取超时 (秒)",
      t.createElement(i, {
        min: 10,
        step: 10,
        value: le,
        onChange: (k) => me(k ?? 30),
        style: { width: 200 }
      }),
      "应大于 限流暂停 + 抖动"
    ),
    // ── Section: 上下文与记忆 ──
    t.createElement(x, { style: { margin: "8px 0 16px" } }),
    t.createElement("div", { style: De }, "上下文与记忆"),
    ce(
      "上下文管理后端",
      t.createElement(c, {
        value: be,
        onChange: (k) => Ae(k),
        style: { width: "100%" },
        options: [{ value: "light", label: "light" }]
      }),
      "上下文策略",
      t.createElement(c, {
        value: Ne,
        onChange: (k) => Ue(k),
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
        value: We,
        onChange: (k) => Be(k),
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
        value: de,
        onChange: (k) => fe(k ?? 50),
        style: { width: "100%" }
      })
    ),
    // ── Save button ──
    t.createElement(
      "div",
      { style: { display: "flex", justifyContent: "flex-end", marginTop: 16 } },
      t.createElement(
        P,
        {
          type: "primary",
          icon: O ? t.createElement(O) : void 0,
          loading: R,
          onClick: je,
          style: Re
        },
        "保存运行配置"
      )
    )
  );
}
function bn({
  expert: e,
  open: t,
  onClose: a,
  onRefresh: n
}) {
  const l = h().React, { useState: r, useEffect: s, useCallback: i } = l, { Modal: f, Tabs: c, Spin: p, Typography: P } = h().antd, { SettingOutlined: v } = h().antdIcons || {}, { Text: E } = P, [H, x] = r([]), [A, O] = r(!1), [W, S] = r("heartbeat"), V = i(async () => {
    if (e) {
      O(!0);
      try {
        const N = await yn(e.agent.id);
        x(N);
      } catch {
        x([]);
      } finally {
        O(!1);
      }
    }
  }, [e]);
  if (s(() => {
    t && e && V();
  }, [t, e, V]), !e) return null;
  const { agent: R } = e, _ = () => {
    V(), n();
  }, B = [
    {
      key: "heartbeat",
      label: "心跳",
      children: l.createElement(fn, {
        agentId: R.id
      })
    },
    {
      key: "files",
      label: "文件",
      children: A ? l.createElement(
        "div",
        { style: { textAlign: "center", padding: 40 } },
        l.createElement(p, { size: "large" })
      ) : l.createElement(Pt, {
        agentId: R.id,
        systemPromptFiles: H,
        onRefresh: _
      })
    },
    {
      key: "skills",
      label: `技能 (${e.skills.filter((N) => N.enabled !== !1).length})`,
      children: l.createElement(En, {
        agentId: R.id,
        onRefresh: n
      })
    },
    {
      key: "mcp",
      label: `MCP (${e.mcps.length})`,
      children: l.createElement(hn, {
        agentId: R.id,
        onRefresh: n,
        isActive: W === "mcp"
      })
    },
    {
      key: "running",
      label: "运行配置",
      children: l.createElement(vn, {
        agentId: R.id
      })
    }
  ];
  return l.createElement(
    f,
    {
      open: t,
      title: l.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 8 } },
        v ? l.createElement(v, { style: { fontSize: 18 } }) : null,
        l.createElement("span", null, `配置 - ${R.name}`),
        l.createElement(
          E,
          { type: "secondary", style: { fontSize: 12, fontWeight: 400 } },
          R.id
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
    l.createElement(c, {
      items: B,
      activeKey: W,
      onChange: (N) => S(N),
      size: "small",
      tabBarStyle: { marginBottom: 16, sticky: 0 }
    })
  );
}
function Sn({
  expert: e,
  onClick: t,
  onSummon: a,
  onConfigure: n
}) {
  const l = h().React, { Card: r, Tag: s, Badge: i, Typography: f, Spin: c, Button: p, Tooltip: P } = h().antd, { Text: v } = f, { ThunderboltOutlined: E, SettingOutlined: H } = h().antdIcons || {}, { agent: x, skills: A, mcps: O, loading: W } = e, S = x.enabled, V = A.filter((B) => B.enabled !== !1).map((B) => B.name), R = O.map((B) => B.name || B.key), _ = x.active_model ? `${x.active_model.provider_id}/${x.active_model.model}` : null;
  return l.createElement(
    r,
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
        l.createElement("span", { style: { fontSize: 20 } }, "🧑‍🔬"),
        l.createElement(
          "div",
          null,
          l.createElement(
            v,
            { strong: !0, style: { fontSize: 15 } },
            x.name
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
            x.id
          )
        )
      ),
      l.createElement(i, {
        status: S ? "success" : "default",
        text: S ? "启用" : "停用"
      })
    ),
    // Description (rendered as markdown)
    x.description ? l.createElement(
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
      ct(x.description, l)
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
    W ? l.createElement(c, { size: "small" }) : l.createElement(
      "div",
      { style: { marginBottom: 6 } },
      l.createElement(
        "div",
        { style: { fontSize: 11, color: "#8c8c8c", marginBottom: 4 } },
        `技能 (${V.length})`
      ),
      l.createElement(pt, {
        items: V,
        max: 4,
        color: "cyan",
        emptyText: "未配置技能"
      })
    ),
    // MCP
    !W && R.length > 0 ? l.createElement(
      "div",
      { style: { marginTop: "auto" } },
      l.createElement(
        "div",
        { style: { fontSize: 11, color: "#8c8c8c", marginBottom: 4 } },
        `MCP (${R.length})`
      ),
      l.createElement(pt, {
        items: R,
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
        P,
        { title: "配置专家", placement: "top" },
        l.createElement(
          p,
          {
            type: "text",
            size: "small",
            icon: H ? l.createElement(H, {
              style: { fontSize: 16, color: "#8c8c8c" }
            }) : void 0,
            onClick: (B) => {
              B.stopPropagation(), n && n();
            }
          }
        )
      ),
      // Summon button (bottom-right)
      l.createElement(
        p,
        {
          type: "primary",
          size: "small",
          icon: E ? l.createElement(E) : void 0,
          disabled: !S,
          onClick: (B) => {
            B.stopPropagation(), a && a();
          },
          style: Re
        },
        "召唤专家"
      )
    )
  );
}
function wn({
  expert: e,
  open: t,
  onClose: a,
  onRefresh: n
}) {
  const l = h().React, {
    Drawer: r,
    Descriptions: s,
    Tag: i,
    Typography: f,
    Space: c,
    Button: p,
    Empty: P,
    Tabs: v,
    List: E,
    Spin: H,
    Modal: x,
    message: A
  } = h().antd, { Text: O, Paragraph: W } = f, {
    EditOutlined: S,
    ThunderboltOutlined: V,
    FileTextOutlined: R,
    ToolOutlined: _,
    PlusOutlined: B
  } = h().antdIcons || {}, [N, g] = l.useState(!1), [z, I] = l.useState(
    []
  ), [q, T] = l.useState(!1);
  if (!e) return null;
  const { agent: w, config: d, skills: L, mcps: j, loading: Z } = e, M = L.filter((y) => y.enabled !== !1), u = (y) => {
    window.history.pushState({}, "", y), window.dispatchEvent(new PopStateEvent("popstate"));
  }, ee = l.createElement(
    "div",
    null,
    l.createElement(
      s,
      { column: 1, bordered: !0, size: "small" },
      l.createElement(s.Item, { label: "专家名称" }, w.name),
      l.createElement(
        s.Item,
        { label: "专家 ID" },
        l.createElement("code", { style: { fontSize: 12 } }, w.id)
      ),
      l.createElement(
        s.Item,
        { label: "状态" },
        l.createElement(
          i,
          { color: w.enabled ? "green" : "default" },
          w.enabled ? "启用" : "停用"
        )
      ),
      l.createElement(
        s.Item,
        { label: "功能简介" },
        w.description ? ct(w.description, l) : "暂无描述"
      ),
      l.createElement(
        s.Item,
        { label: "使用模型" },
        w.active_model ? `${w.active_model.provider_id} / ${w.active_model.model}` : "使用全局默认模型"
      ),
      d != null && d.workspace_dir ? l.createElement(
        s.Item,
        { label: "工作区路径" },
        l.createElement(
          "code",
          { style: { fontSize: 11 } },
          d.workspace_dir
        )
      ) : null,
      d != null && d.approval_level ? l.createElement(
        s.Item,
        { label: "审批级别" },
        d.approval_level
      ) : null
    ),
    // System prompt files
    d != null && d.system_prompt_files && d.system_prompt_files.length > 0 ? l.createElement(
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
        R ? l.createElement(R, {
          style: { fontSize: 14, color: "#1677ff" }
        }) : null,
        l.createElement(O, { strong: !0 }, "系统提示词文件")
      ),
      l.createElement(
        c,
        { wrap: !0 },
        ...d.system_prompt_files.map(
          (y, se) => l.createElement(
            i,
            {
              key: se,
              icon: R ? l.createElement(R) : void 0,
              style: { fontSize: 12 }
            },
            y
          )
        )
      )
    ) : null
  ), o = async () => {
    g(!0), T(!0);
    try {
      const y = await it();
      I(y);
    } catch (y) {
      A.error(y.message || "加载技能池失败");
    } finally {
      T(!1);
    }
  }, ae = async (y) => {
    let se = 0, oe = 0;
    for (const Se of y)
      try {
        await wt(w.id, Se), se++;
      } catch {
        oe++;
      }
    se > 0 ? (A.success(
      `成功添加 ${se} 个技能${oe > 0 ? `，${oe} 个失败` : ""}`
    ), n()) : oe > 0 && A.error("添加技能失败"), g(!1);
  }, U = async (y) => {
    try {
      await xt(w.id, y), A.success(`技能「${y}」已移除`), n();
    } catch (se) {
      A.error(se.message || "移除技能失败");
    }
  }, Q = async (y) => {
    try {
      await kt(w.id, y), A.success(`MCP「${y}」已移除`), n();
    } catch (se) {
      A.error(se.message || "移除 MCP 失败");
    }
  }, J = Z ? l.createElement(
    "div",
    { style: { textAlign: "center", padding: 40 } },
    l.createElement(H, { size: "large" })
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
        O,
        { strong: !0 },
        `已启用技能 (${M.length})`
      ),
      l.createElement(
        p,
        {
          type: "primary",
          size: "small",
          icon: B ? l.createElement(B) : void 0,
          onClick: o
        },
        "从技能池添加"
      )
    ),
    M.length === 0 ? l.createElement(P, {
      description: "该专家暂无已启用的技能",
      image: P.PRESENTED_IMAGE_SIMPLE
    }) : l.createElement(E, {
      dataSource: M,
      renderItem: (y) => l.createElement(
        E.Item,
        {
          actions: [
            l.createElement(
              p,
              {
                type: "link",
                size: "small",
                danger: !0,
                onClick: () => U(y.name)
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
            l.createElement(O, { strong: !0 }, y.name),
            y.version_text ? l.createElement(
              i,
              { style: { fontSize: 10 } },
              `v${y.version_text}`
            ) : null
          ),
          y.description ? l.createElement(
            W,
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
              (se, oe) => l.createElement(
                i,
                {
                  key: oe,
                  color: "cyan",
                  style: { fontSize: 10 }
                },
                se
              )
            )
          ) : null
        )
      )
    }),
    // Skill Picker Modal (card-grid style, consistent with Skill Center)
    l.createElement(Tt, {
      open: N,
      onClose: () => g(!1),
      poolSkills: z,
      installedSkillNames: M.map((y) => y.name),
      loading: q,
      onInstall: ae
    })
  ), K = Z ? l.createElement(
    "div",
    { style: { textAlign: "center", padding: 40 } },
    l.createElement(H, { size: "large" })
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
        O,
        { strong: !0 },
        `MCP 客户端 (${j.length})`
      ),
      l.createElement(
        p,
        {
          type: "primary",
          size: "small",
          icon: B ? l.createElement(B) : void 0,
          onClick: () => {
            window.history.pushState({}, "", `/agents/${w.id}/mcp`), window.dispatchEvent(new PopStateEvent("popstate"));
          }
        },
        "配置 MCP"
      )
    ),
    j.length === 0 ? l.createElement(P, {
      description: "该专家暂无关联的 MCP 客户端，点击「配置 MCP」添加",
      image: P.PRESENTED_IMAGE_SIMPLE
    }) : l.createElement(E, {
      dataSource: j,
      renderItem: (y) => l.createElement(
        E.Item,
        {
          actions: [
            l.createElement(
              p,
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
              O,
              { strong: !0 },
              y.name || y.key
            ),
            l.createElement(
              i,
              {
                color: y.enabled ? "green" : "default",
                style: { fontSize: 10 }
              },
              y.enabled ? "启用" : "停用"
            ),
            l.createElement(
              i,
              { color: "purple", style: { fontSize: 10 } },
              y.transport
            )
          ),
          y.description ? l.createElement(
            W,
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
  ), C = d != null && d.tools ? l.createElement(
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
        l.createElement(O, { strong: !0 }, "工具配置")
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
        JSON.stringify(d.tools, null, 2)
      )
    )
  ) : l.createElement(P, {
    description: "暂无工具配置",
    image: P.PRESENTED_IMAGE_SIMPLE
  }), re = [
    { key: "basic", label: "基本信息", children: ee },
    {
      key: "skills",
      label: `技能 (${M.length})`,
      children: J
    },
    {
      key: "prompts",
      label: "推荐提问",
      children: l.createElement(kn, {
        skills: M,
        agentId: w.id
      })
    },
    {
      key: "knowledge",
      label: "专家记忆",
      children: l.createElement(Pt, {
        agentId: w.id,
        systemPromptFiles: (d == null ? void 0 : d.system_prompt_files) || [],
        onRefresh: () => n()
      })
    },
    { key: "mcp", label: `MCP (${j.length})`, children: K },
    { key: "tools", label: "工具配置", children: C }
  ];
  return l.createElement(
    r,
    {
      title: l.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 8 } },
        l.createElement("span", { style: { fontSize: 20 } }, "🧑‍🔬"),
        l.createElement("span", null, w.name)
      ),
      open: t,
      onClose: a,
      width: 560,
      extra: l.createElement(
        c,
        null,
        l.createElement(
          p,
          {
            size: "small",
            icon: S ? l.createElement(S) : void 0,
            onClick: () => u("/agents")
          },
          "编辑专家"
        ),
        l.createElement(
          p,
          {
            type: "primary",
            size: "small",
            icon: V ? l.createElement(V) : void 0,
            onClick: () => {
              try {
                const y = h();
                y.setSelectedAgent && y.setSelectedAgent(w.id);
              } catch (y) {
                console.warn("[ugsci] Failed to set selected agent:", y);
              }
              u("/chat");
            }
          },
          "开始对话"
        )
      )
    },
    l.createElement(v, {
      items: re,
      defaultActiveKey: "basic"
    })
  );
}
function xn({
  open: e,
  onClose: t,
  onCreated: a
}) {
  const n = h().React, { useState: l } = n, {
    Modal: r,
    Card: s,
    Tag: i,
    Input: f,
    Row: c,
    Col: p,
    Spin: P,
    message: v,
    Typography: E
  } = h().antd, { Text: H } = E, { FileAddOutlined: x } = h().antdIcons || {}, [A, O] = l(!1), [W, S] = l(""), [V, R] = l(!1), _ = async (g, z) => {
    O(!0);
    try {
      const I = await te("/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: g || "新专家",
          description: z || "",
          skill_names: []
        })
      });
      await qe(
        I.id,
        "AGENTS.md",
        `# ${g || "新专家"}

请在此处编写该专家的系统提示词。
`
      ), v.success("专家「" + (g || "新专家") + "」创建成功"), R(!1), t(), a();
    } catch (I) {
      v.error(I.message || "创建专家失败");
    } finally {
      O(!1);
    }
  }, B = nt.filter((g) => {
    if (!W.trim()) return !0;
    const z = W.toLowerCase();
    return g.name.toLowerCase().includes(z) || g.description.toLowerCase().includes(z) || g.category.toLowerCase().includes(z);
  }), N = async (g) => {
    O(!0);
    try {
      const z = await te("/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: g.name,
          description: g.description,
          skill_names: g.recommendedSkills
        })
      });
      await qe(z.id, "AGENTS.md", g.systemPrompt);
      const I = await Ye(z.id);
      I.approval_level = g.approvalLevel, await te(`/agents/${encodeURIComponent(z.id)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(I)
      }), v.success(`专家「${g.name}」创建成功`), t(), a();
    } catch (z) {
      v.error(z.message || "创建专家失败");
    } finally {
      O(!1);
    }
  };
  return n.createElement(
    r,
    {
      open: e,
      onCancel: t,
      footer: null,
      title: "选择专家模板",
      width: 800
    },
    n.createElement(
      "div",
      { style: { marginBottom: 16 } },
      n.createElement(f, {
        placeholder: "搜索模板名称或类别...",
        value: W,
        onChange: (g) => S(g.target.value),
        allowClear: !0
      })
    ),
    A ? n.createElement(
      "div",
      { style: { textAlign: "center", padding: 60 } },
      n.createElement(P, { size: "large" }),
      n.createElement(
        "div",
        { style: { marginTop: 12, color: "#8c8c8c" } },
        "正在创建专家..."
      )
    ) : n.createElement(
      c,
      { gutter: [12, 12] },
      // ── Blank template card (always first) ──
      W.trim() ? null : n.createElement(
        p,
        { xs: 24, sm: 12 },
        n.createElement(
          s,
          {
            hoverable: !0,
            size: "small",
            onClick: () => R(!0),
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
              x ? n.createElement(x) : "📝"
            ),
            n.createElement(
              "div",
              { style: { flex: 1 } },
              n.createElement(
                H,
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
      ...B.map(
        (g) => n.createElement(
          p,
          { key: g.id, xs: 24, sm: 12 },
          n.createElement(
            s,
            {
              hoverable: !0,
              size: "small",
              onClick: () => N(g),
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
              n.createElement(
                "span",
                { style: { fontSize: 28 } },
                g.emoji
              ),
              n.createElement(
                "div",
                { style: { flex: 1 } },
                n.createElement(
                  H,
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
              ct(g.description, n)
            )
          )
        )
      )
    ),
    // ── Blank template creation modal ──
    n.createElement(Cn, {
      open: V,
      onCancel: () => R(!1),
      onCreate: _
    })
  );
}
function Cn({
  open: e,
  onCancel: t,
  onCreate: a
}) {
  const n = h().React, { useState: l } = n, { Modal: r, Input: s, message: i } = h().antd, [f, c] = l(""), [p, P] = l("");
  return n.createElement(
    r,
    {
      open: e,
      title: "从空白模版创建专家",
      onCancel: t,
      onOk: () => {
        if (!f.trim()) {
          i.warning("请输入专家名称");
          return;
        }
        a(f.trim(), p.trim());
      },
      okText: "创建",
      cancelText: "取消",
      destroyOnClose: !0
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
        value: f,
        onChange: (v) => c(v.target.value),
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
        value: p,
        onChange: (v) => P(v.target.value),
        rows: 3,
        maxLength: 200
      })
    )
  );
}
function Pt({
  agentId: e,
  systemPromptFiles: t,
  onRefresh: a
}) {
  const n = h().React, { useState: l, useEffect: r, useCallback: s } = n, {
    List: i,
    Tag: f,
    Switch: c,
    Button: p,
    Modal: P,
    Input: v,
    Spin: E,
    Empty: H,
    message: x,
    Typography: A
  } = h().antd, { FileTextOutlined: O, PlusOutlined: W, EditOutlined: S, ReloadOutlined: V } = h().antdIcons || {}, { Text: R } = A, [_, B] = l([]), [N, g] = l(!0), [z, I] = l(
    t || []
  ), [q, T] = l(!1), [w, d] = l(null), [L, j] = l(""), [Z, M] = l(""), [u, ee] = l(!1), o = s(async () => {
    g(!0);
    try {
      const K = await Vt(e);
      B(K);
    } catch (K) {
      x.error(K.message || "加载记忆文件失败"), B([]);
    } finally {
      g(!1);
    }
  }, [e]);
  r(() => {
    o();
  }, [o]), r(() => {
    I(t || []);
  }, [t]);
  const ae = async (K, C) => {
    const re = new Set(z);
    if (C)
      re.add(K);
    else {
      if (ut.includes(K) && K === "AGENTS.md") {
        x.warning("AGENTS.md 是核心文件，不能停用");
        return;
      }
      re.delete(K);
    }
    const y = Array.from(re);
    I(y);
    try {
      await dt(e, y), x.success(C ? "已启用记忆文件" : "已停用记忆文件"), a();
    } catch (se) {
      x.error(se.message || "更新失败"), I(t || []);
    }
  }, U = async (K) => {
    try {
      const C = await te(
        `/workspace/files/${encodeURIComponent(K)}`,
        { headers: { "X-Agent-Id": e } }
      );
      d(K), j(C.content || ""), T(!0);
    } catch (C) {
      x.error(C.message || "读取文件失败");
    }
  }, Q = () => {
    d(null), j(""), M(""), T(!0);
  }, J = async () => {
    const K = w || Z.trim();
    if (!K) {
      x.warning("请输入文件名");
      return;
    }
    const C = K.endsWith(".md") ? K : `${K}.md`;
    ee(!0);
    try {
      if (await qe(e, C, L), !w && !z.includes(C)) {
        const re = [...z, C];
        I(re), await dt(e, re);
      }
      x.success("保存成功"), T(!1), o(), a();
    } catch (re) {
      x.error(re.message || "保存失败");
    } finally {
      ee(!1);
    }
  };
  return N ? n.createElement(
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
        O ? n.createElement(O, {
          style: { fontSize: 14, color: "#1677ff" }
        }) : null,
        n.createElement(
          R,
          { strong: !0 },
          `记忆文件 (${_.length})`
        ),
        n.createElement(
          R,
          { type: "secondary", style: { fontSize: 12 } },
          `· 已挂载 ${z.length} 个到专家记忆`
        )
      ),
      n.createElement(
        "div",
        { style: { display: "flex", gap: 8 } },
        n.createElement(
          p,
          {
            size: "small",
            icon: V ? n.createElement(V) : void 0,
            onClick: o
          },
          "刷新"
        ),
        n.createElement(
          p,
          {
            type: "primary",
            size: "small",
            icon: W ? n.createElement(W) : void 0,
            onClick: Q
          },
          "新建记忆文件"
        )
      )
    ),
    _.length === 0 ? n.createElement(H, {
      description: "暂无记忆文件，点击「新建记忆文件」添加",
      image: H.PRESENTED_IMAGE_SIMPLE
    }) : n.createElement(i, {
      dataSource: _,
      renderItem: (K) => {
        const C = z.includes(K.filename), re = ut.includes(K.filename);
        return n.createElement(
          i.Item,
          {
            actions: [
              n.createElement(
                p,
                {
                  type: "link",
                  size: "small",
                  icon: S ? n.createElement(S) : void 0,
                  onClick: () => U(K.filename)
                },
                "编辑"
              )
            ]
          },
          n.createElement(i.Item.Meta, {
            avatar: n.createElement(O, {
              style: {
                fontSize: 20,
                color: C ? "#1677ff" : "#bfbfbf"
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
              n.createElement(R, null, K.filename),
              re ? n.createElement(
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
              `${(K.size / 1024).toFixed(1)} KB · 修改于 ${new Date(K.modified_time).toLocaleString()}`
            )
          }),
          n.createElement(c, {
            checked: C,
            size: "small",
            onChange: (y) => ae(K.filename, y)
          })
        );
      }
    }),
    // Edit/New file modal
    n.createElement(
      P,
      {
        open: q,
        onCancel: () => T(!1),
        title: w ? `编辑 ${w}` : "新建记忆文件",
        width: 700,
        onOk: J,
        confirmLoading: u,
        okText: "保存"
      },
      w ? null : n.createElement(
        "div",
        { style: { marginBottom: 12 } },
        n.createElement(v, {
          placeholder: "文件名（如：油藏工程记忆库.md）",
          value: Z,
          onChange: (K) => M(K.target.value),
          addonAfter: Z.endsWith(".md") ? "" : ".md"
        })
      ),
      n.createElement(v.TextArea, {
        value: L,
        onChange: (K) => j(K.target.value),
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
function kn({
  skills: e,
  agentId: t
}) {
  const a = h().React, { useMemo: n } = a, {
    List: l,
    Tag: r,
    Typography: s,
    Empty: i,
    Button: f,
    message: c
  } = h().antd, { ThunderboltOutlined: p, CopyOutlined: P } = h().antdIcons || {}, { Text: v } = s, E = n(() => Kt(e), [e]), H = (A) => {
    try {
      const O = h();
      O.setSelectedAgent && O.setSelectedAgent(t);
    } catch {
    }
    try {
      sessionStorage.setItem("ugsci_pending_prompt", A);
    } catch {
    }
    window.history.pushState({}, "", "/chat"), window.dispatchEvent(new PopStateEvent("popstate"));
  }, x = (A) => {
    var O;
    (O = navigator.clipboard) == null || O.writeText(A).then(() => {
      c.success("已复制到剪贴板");
    });
  };
  return E.length === 0 ? a.createElement(i, {
    description: "暂无推荐提问，请先为专家添加技能",
    image: i.PRESENTED_IMAGE_SIMPLE
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
      p ? a.createElement(p, {
        style: { fontSize: 14, color: "#1677ff" }
      }) : null,
      a.createElement(
        v,
        { strong: !0 },
        `推荐提问 (${E.length})`
      ),
      a.createElement(
        v,
        { type: "secondary", style: { fontSize: 12 } },
        "· 从技能描述中自动提取"
      )
    ),
    a.createElement(l, {
      dataSource: E,
      renderItem: (A, O) => a.createElement(
        l.Item,
        {
          actions: [
            a.createElement(
              f,
              {
                type: "link",
                size: "small",
                icon: P ? a.createElement(P) : void 0,
                onClick: () => x(A)
              },
              "复制"
            )
          ]
        },
        a.createElement(l.Item.Meta, {
          avatar: a.createElement(
            r,
            { color: "blue", style: { borderRadius: "50%" } },
            `${O + 1}`
          ),
          title: a.createElement(
            "div",
            {
              style: {
                cursor: "pointer",
                color: "#1677ff"
              },
              onClick: () => H(A)
            },
            A
          ),
          description: a.createElement(
            v,
            { type: "secondary", style: { fontSize: 12 } },
            "点击直接发送给专家"
          )
        })
      )
    })
  );
}
function Tn() {
  var X;
  const e = h().React, { useState: t, useEffect: a, useCallback: n, useMemo: l } = e, {
    Spin: r,
    Empty: s,
    Input: i,
    Button: f,
    message: c,
    Row: p,
    Col: P,
    Tabs: v,
    Modal: E,
    Typography: H
  } = h().antd, {
    ReloadOutlined: x,
    PlusOutlined: A,
    SearchOutlined: O,
    TeamOutlined: W,
    UserOutlined: S
  } = h().antdIcons || {}, { Text: V, Paragraph: R } = H, [_, B] = t([]), [N, g] = t(!0), [z, I] = t(!1), [q, T] = t(null), [w, d] = t(""), [L, j] = t(!1), [Z, M] = t("experts"), [u, ee] = t(
    null
  ), [o, ae] = t(""), [U, Q] = t(!1), [J, K] = t(!1), [C, re] = t(null), [y, se] = t([]), oe = n(async () => {
    g(!0);
    try {
      const b = await ot(), le = await Promise.all(
        b.map(async (me) => {
          try {
            const [de, fe, be] = await Promise.all([
              Ye(me.id).catch(() => null),
              st(me.id).catch(() => []),
              Ct(me.id).catch(() => [])
            ]);
            return {
              agent: me,
              config: de,
              skills: fe,
              mcps: be,
              loading: !1
            };
          } catch {
            return {
              agent: me,
              config: null,
              skills: [],
              mcps: [],
              loading: !1
            };
          }
        })
      );
      B(le), se(b);
    } catch (b) {
      c.error(b.message || "加载专家列表失败"), B([]);
    } finally {
      g(!1);
    }
  }, []);
  a(() => {
    oe();
  }, [oe]), a(() => {
    if (C && J) {
      const b = _.find(
        (le) => le.agent.id === C.agent.id
      );
      b && b !== C && re(b);
    }
  }, [_, C, J]);
  const Se = n(
    async (b) => {
      var fe;
      const le = b.coordinatorName || ((fe = b.members[0]) == null ? void 0 : fe.name);
      if (!le) {
        c.error("无法确定协调者专家");
        return;
      }
      const me = Ve(y, le);
      if (!me) {
        c.error(`未找到协调者专家「${le}」，请先创建该专家`);
        return;
      }
      if (/\{.+?\}/.test(b.taskTemplate)) {
        ae(""), ee(b);
        return;
      }
      await we(b, me, b.taskTemplate);
    },
    [y, c]
  ), we = n(
    async (b, le, me) => {
      var de;
      Q(!0);
      try {
        const fe = Wt(b), be = me ? fe.replace(b.taskTemplate, me) : fe, Ae = h();
        Ae.setSelectedAgent && Ae.setSelectedAgent(le), await Ht(le, be), c.success(
          `团队任务已发起，协调者：${b.coordinatorName || ((de = b.members[0]) == null ? void 0 : de.name)}`
        ), ee(null), D("/chat");
      } catch (fe) {
        c.error(fe.message || "发起团队任务失败");
      } finally {
        Q(!1);
      }
    },
    [c]
  ), D = (b) => {
    window.history.pushState({}, "", b), window.dispatchEvent(new PopStateEvent("popstate"));
  }, $ = n((b) => {
    T(b), I(!0);
  }, []), ne = n((b) => {
    re(b), K(!0);
  }, []), F = n(
    (b) => {
      if (!b.agent.enabled) {
        c.warning(`专家「${b.agent.name}」未启用，请先启用`);
        return;
      }
      try {
        const le = h();
        le.setSelectedAgent && le.setSelectedAgent(b.agent.id);
      } catch (le) {
        console.warn("[ugsci] Failed to set selected agent:", le);
      }
      c.success(`已召唤专家「${b.agent.name}」，正在跳转至对话...`), D("/chat");
    },
    [c]
  ), he = l(() => {
    if (!w.trim()) return _;
    const b = w.toLowerCase();
    return _.filter(
      (le) => {
        var me;
        return le.agent.name.toLowerCase().includes(b) || ((me = le.agent.description) == null ? void 0 : me.toLowerCase().includes(b)) || le.agent.id.toLowerCase().includes(b) || le.skills.some((de) => de.name.toLowerCase().includes(b));
      }
    );
  }, [_, w]), Ee = _.filter((b) => b.agent.enabled).length, ie = _.reduce(
    (b, le) => b + le.skills.filter((me) => me.enabled !== !1).length,
    0
  ), Te = _.reduce((b, le) => b + le.mcps.length, 0), _e = [
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
            prefix: O ? e.createElement(O) : void 0,
            value: w,
            onChange: (b) => d(b.target.value),
            allowClear: !0,
            style: { maxWidth: 400 }
          })
        ),
        // Content
        N ? e.createElement(
          "div",
          { style: { textAlign: "center", padding: 60 } },
          e.createElement(r, { size: "large" })
        ) : he.length === 0 ? e.createElement(s, {
          description: w ? "未找到匹配的专家" : "暂无专家，点击「创建专家」添加"
        }) : e.createElement(
          p,
          { gutter: [12, 12], align: "stretch" },
          ...he.map(
            (b) => e.createElement(
              P,
              {
                key: b.agent.id,
                xs: 24,
                sm: 12,
                md: 8,
                lg: 6,
                style: { display: "flex" }
              },
              e.createElement(Sn, {
                expert: b,
                onClick: () => $(b),
                onSummon: () => F(b),
                onConfigure: () => ne(b)
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
        W ? e.createElement(W, { style: { fontSize: 14 } }) : null,
        "专家团"
      ),
      children: e.createElement(Xt, {
        agents: y,
        onLaunch: Se
      })
    }
  ];
  return e.createElement(
    "div",
    { style: { padding: 24 } },
    e.createElement(Qe, {
      title: "专家",
      subtitle: `共 ${_.length} 位专家（${Ee} 位启用）· ${ie} 个技能 · ${Te} 个 MCP 客户端`,
      extra: e.createElement(
        e.Fragment,
        null,
        e.createElement(
          f,
          {
            icon: x ? e.createElement(x) : void 0,
            onClick: oe,
            loading: N
          },
          "刷新"
        ),
        e.createElement(
          f,
          {
            type: "primary",
            icon: A ? e.createElement(A) : void 0,
            onClick: () => j(!0),
            style: Re
          },
          "创建专家"
        )
      )
    }),
    e.createElement(v, {
      items: _e,
      activeKey: Z,
      onChange: (b) => M(b)
    }),
    // Drawer
    e.createElement(wn, {
      expert: q,
      open: z,
      onClose: () => I(!1),
      onRefresh: () => oe()
    }),
    // Template Modal
    e.createElement(xn, {
      open: L,
      onClose: () => j(!1),
      onCreated: () => oe()
    }),
    // Config Modal (gear icon)
    e.createElement(bn, {
      expert: C,
      open: J,
      onClose: () => K(!1),
      onRefresh: () => oe()
    }),
    // Team Launch Modal (for filling placeholders)
    u ? e.createElement(
      E,
      {
        open: !0,
        title: e.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 8 } },
          e.createElement(
            "span",
            { style: { fontSize: 20 } },
            u.emoji
          ),
          e.createElement(
            "span",
            null,
            `发起团队任务 - ${u.name}`
          )
        ),
        onCancel: () => ee(null),
        onOk: () => {
          var de;
          const b = u.coordinatorName || ((de = u.members[0]) == null ? void 0 : de.name), le = b ? Ve(y, b) : null;
          if (!le) {
            c.error("无法找到协调者专家");
            return;
          }
          let me = u.taskTemplate;
          o.trim() && (me = o.trim()), we(u, le, me);
        },
        confirmLoading: U,
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
          u.taskTemplate
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
          value: o,
          onChange: (b) => ae(b.target.value),
          rows: 5,
          placeholder: u.taskTemplate,
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
          `协调者: ${u.coordinatorName || ((X = u.members[0]) == null ? void 0 : X.name) || "—"} · 成员: ${u.members.map((b) => b.name).join("、")}`
        )
      )
    ) : null
  );
}
function zn({
  mcp: e,
  onClick: t,
  onToggle: a,
  onDelete: n,
  onViewTools: l
}) {
  const r = h().React, { Card: s, Tag: i, Badge: f, Typography: c, Button: p } = h().antd, { Text: P } = c, {
    EyeOutlined: v,
    EyeInvisibleOutlined: E,
    DeleteOutlined: H,
    ToolOutlined: x
  } = h().antdIcons || {}, A = {
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
          A[e.transport] || "🔌"
        ),
        r.createElement(
          P,
          { strong: !0, style: { fontSize: 14 } },
          e.name || e.key
        )
      ),
      r.createElement(f, {
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
        i,
        { color: "purple", style: { fontSize: 11 } },
        e.transport
      ),
      e.tools && e.tools.length > 0 ? r.createElement(
        i,
        { color: "blue", style: { fontSize: 11 } },
        `${e.tools.length} 个工具`
      ) : r.createElement(i, { style: { fontSize: 11 } }, "全部工具"),
      e.url ? r.createElement(
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
        p,
        {
          size: "small",
          icon: x ? r.createElement(x) : void 0,
          onClick: l
        },
        "工具"
      ),
      r.createElement(
        p,
        {
          size: "small",
          icon: e.enabled ? E ? r.createElement(E) : void 0 : v ? r.createElement(v) : void 0,
          onClick: a
        },
        e.enabled ? "禁用" : "启用"
      ),
      r.createElement(
        p,
        {
          size: "small",
          danger: !0,
          icon: H ? r.createElement(H) : void 0,
          onClick: n
        },
        "删除"
      )
    )
  );
}
const lt = {
  reservoir_simulation: "油藏数值模拟",
  geological_modeling: "地质建模",
  well_log_analysis: "测井分析",
  production_engineering: "采油工程",
  post_processing: "后处理与可视化",
  multiphysics: "多物理场仿真"
}, Ot = {
  reservoir_simulation: "🛢️",
  geological_modeling: "🏔️",
  well_log_analysis: "📡",
  production_engineering: "⚙️",
  post_processing: "📊",
  multiphysics: "🔬"
};
async function In() {
  return te("/ugsci/engines/list");
}
async function _n(e) {
  return te("/ugsci/engines/", {
    method: "POST",
    body: JSON.stringify(e)
  });
}
async function Pn(e, t) {
  return te(`/ugsci/engines/${encodeURIComponent(e)}`, {
    method: "PUT",
    body: JSON.stringify(t)
  });
}
async function On(e) {
  return te(
    `/ugsci/engines/${encodeURIComponent(e)}`,
    { method: "DELETE" }
  );
}
async function An() {
  return te("/ugsci/engines/detect", {
    method: "POST"
  });
}
function $n({
  engine: e,
  onClick: t
}) {
  const a = h().React, { Card: n, Tag: l, Typography: r } = h().antd, { Text: s } = r, i = e.status === "detected", f = Ot[e.category] || "📦";
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
        a.createElement("span", { style: { fontSize: 20 } }, f),
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
        i ? a.createElement(
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
        lt[e.category] || e.category
      ) : null,
      e.version ? a.createElement(
        l,
        { color: "blue", style: { fontSize: 11 } },
        `v${e.version}`
      ) : null,
      ...(e.modules || []).map(
        (c) => a.createElement(
          l,
          { key: c, color: "cyan", style: { fontSize: 10 } },
          c
        )
      )
    )
  );
}
function Mn() {
  const e = h().React, { useState: t, useEffect: a, useCallback: n, useMemo: l } = e, {
    Spin: r,
    Empty: s,
    Button: i,
    message: f,
    Row: c,
    Col: p,
    Drawer: P,
    Descriptions: v,
    Tag: E,
    Typography: H,
    Modal: x,
    Input: A,
    Alert: O,
    Select: W,
    Popconfirm: S,
    Space: V
  } = h().antd, {
    ReloadOutlined: R,
    SearchOutlined: _,
    PlusOutlined: B,
    EditOutlined: N,
    DeleteOutlined: g,
    CopyOutlined: z,
    ExperimentOutlined: I
  } = h().antdIcons || {}, { Text: q, Paragraph: T } = H, [w, d] = t([]), [L, j] = t(!0), [Z, M] = t(""), [u, ee] = t(!1), [o, ae] = t(null), [U, Q] = t(!1), [J, K] = t(null), [C, re] = t({}), [y, se] = t(!1), oe = n(async () => {
    j(!0);
    try {
      const X = await In();
      d(X.engines || []);
    } catch (X) {
      f.error(X.message || "加载引擎列表失败"), d([]);
    } finally {
      j(!1);
    }
  }, []);
  a(() => {
    oe();
  }, [oe]);
  const Se = l(() => {
    if (!Z.trim()) return w;
    const X = Z.toLowerCase();
    return w.filter(
      (b) => {
        var le;
        return b.name.toLowerCase().includes(X) || b.vendor.toLowerCase().includes(X) || b.category.toLowerCase().includes(X) || ((le = b.description) == null ? void 0 : le.toLowerCase().includes(X));
      }
    );
  }, [w, Z]), we = w.filter((X) => X.status === "detected").length, D = n((X) => {
    navigator.clipboard.writeText(X).then(() => f.success("路径已复制")).catch(() => f.error("复制失败"));
  }, []), $ = n(() => {
    K(null), re({
      name: "",
      vendor: "",
      version: "",
      executable_path: "",
      category: "",
      description: "",
      invocation_hint: ""
    }), Q(!0);
  }, []), ne = n((X) => {
    K(X), re({ ...X }), Q(!0), ee(!1);
  }, []), F = n(async () => {
    var X;
    if (!((X = C.name) != null && X.trim())) {
      f.warning("请输入引擎名称");
      return;
    }
    se(!0);
    try {
      J ? (await Pn(J.id, C), f.success("引擎已更新")) : (await _n(C), f.success("引擎已添加")), Q(!1), oe();
    } catch (b) {
      f.error(b.message || "保存失败");
    } finally {
      se(!1);
    }
  }, [C, J, oe]), he = n(
    async (X) => {
      try {
        await On(X), f.success("引擎已删除"), ee(!1), oe();
      } catch (b) {
        f.error(b.message || "删除失败");
      }
    },
    [oe]
  ), Ee = n(async () => {
    j(!0);
    try {
      const X = await An();
      d(X.engines || []), f.success("自动检测完成");
    } catch (X) {
      f.error(X.message || "检测失败");
    } finally {
      j(!1);
    }
  }, []), ie = n(
    (X, b, le) => {
      const me = C[b] || "";
      return e.createElement(
        "div",
        { style: { marginBottom: 12 } },
        e.createElement(
          q,
          { style: { fontSize: 13, display: "block", marginBottom: 4 } },
          X
        ),
        le != null && le.select ? e.createElement(W, {
          value: me || void 0,
          onChange: (de) => re((fe) => ({ ...fe, [b]: de })),
          style: { width: "100%" },
          options: le.select.options,
          allowClear: !0,
          placeholder: `选择${X}`
        }) : le != null && le.textarea ? e.createElement(A.TextArea, {
          value: me,
          onChange: (de) => re((fe) => ({ ...fe, [b]: de.target.value })),
          rows: 3,
          placeholder: `输入${X}`
        }) : e.createElement(A, {
          value: me,
          onChange: (de) => re((fe) => ({ ...fe, [b]: de.target.value })),
          placeholder: `输入${X}`
        })
      );
    },
    [C]
  ), [Te, _e] = t(!0);
  return e.createElement(
    "div",
    null,
    // Summary alert (closable)
    Te ? e.createElement(
      O,
      {
        type: we > 0 ? "success" : "info",
        message: `共 ${w.length} 个引擎 · ${we} 个已检测`,
        description: we > 0 ? "部分引擎已自动检测到安装路径，可在卡片中查看详情。" : "尚未检测到已安装的引擎。可点击「自动检测」或手动添加计算引擎。",
        showIcon: !0,
        closable: !0,
        onClose: () => _e(!1),
        style: { marginBottom: 16 }
      }
    ) : null,
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
      e.createElement(A, {
        placeholder: "搜索引擎名称、厂商...",
        prefix: _ ? e.createElement(_) : void 0,
        value: Z,
        onChange: (X) => M(X.target.value),
        allowClear: !0,
        style: { maxWidth: 280 }
      }),
      e.createElement(
        i,
        {
          icon: R ? e.createElement(R) : void 0,
          onClick: Ee,
          loading: L
        },
        "自动检测"
      ),
      e.createElement(
        i,
        {
          type: "primary",
          icon: B ? e.createElement(B) : void 0,
          onClick: $,
          style: Re
        },
        "添加引擎"
      )
    ),
    // Content
    L ? e.createElement(
      "div",
      { style: { textAlign: "center", padding: 60 } },
      e.createElement(r, {
        size: "large",
        tip: "正在加载计算引擎..."
      })
    ) : Se.length === 0 ? e.createElement(s, {
      description: Z ? "无匹配引擎" : "暂无引擎，点击「添加引擎」开始"
    }) : e.createElement(
      c,
      { gutter: [12, 12], align: "stretch" },
      ...Se.map(
        (X) => e.createElement(
          p,
          {
            key: X.id,
            xs: 24,
            sm: 12,
            md: 8,
            lg: 6,
            style: { display: "flex" }
          },
          e.createElement($n, {
            engine: X,
            onClick: () => {
              ae(X), ee(!0);
            }
          })
        )
      )
    ),
    // Detail drawer
    o ? e.createElement(
      P,
      {
        title: e.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 8 } },
          e.createElement(
            "span",
            { style: { fontSize: 18 } },
            Ot[o.category] || "📦"
          ),
          e.createElement("span", null, o.name)
        ),
        open: u,
        onClose: () => ee(!1),
        width: 520,
        extra: e.createElement(
          V,
          null,
          e.createElement(
            i,
            {
              size: "small",
              icon: N ? e.createElement(N) : void 0,
              onClick: () => ne(o)
            },
            "编辑"
          ),
          o.is_default ? null : e.createElement(
            S,
            {
              title: "确认删除此引擎？",
              description: o.name,
              onConfirm: () => he(o.id),
              okText: "删除",
              cancelText: "取消",
              okButtonProps: { danger: !0 }
            },
            e.createElement(
              i,
              {
                size: "small",
                danger: !0,
                icon: g ? e.createElement(g) : void 0
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
          o.name
        ),
        e.createElement(
          v.Item,
          { label: "厂商" },
          o.vendor || "—"
        ),
        e.createElement(
          v.Item,
          { label: "分类" },
          o.category ? lt[o.category] || o.category : "—"
        ),
        e.createElement(
          v.Item,
          { label: "状态" },
          e.createElement(
            E,
            {
              color: o.status === "detected" ? "success" : o.status === "not_found" ? "error" : "default"
            },
            o.status === "detected" ? "✅ 已检测" : o.status === "not_found" ? "❌ 路径无效" : "🔧 待配置"
          )
        ),
        e.createElement(
          v.Item,
          { label: "版本" },
          o.version || "—"
        ),
        o.executable_path ? e.createElement(
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
              o.executable_path
            ),
            e.createElement(
              i,
              {
                size: "small",
                type: "text",
                icon: z ? e.createElement(z) : void 0,
                onClick: () => D(o.executable_path)
              }
            )
          )
        ) : null,
        o.install_dir ? e.createElement(
          v.Item,
          { label: "安装目录" },
          e.createElement(
            "code",
            { style: { fontSize: 12, wordBreak: "break-all" } },
            o.install_dir
          )
        ) : null,
        // Display detected modules with paths
        o.modules && o.modules.length > 0 ? e.createElement(
          v.Item,
          { label: "已检测模块" },
          e.createElement(
            "div",
            { style: { display: "flex", flexDirection: "column", gap: 4 } },
            ...o.modules.map(
              (X) => e.createElement(
                "div",
                {
                  key: X,
                  style: { display: "flex", alignItems: "center", gap: 8 }
                },
                e.createElement(
                  E,
                  { color: "cyan", style: { fontSize: 11 } },
                  X
                ),
                o.module_paths && o.module_paths[X] ? e.createElement(
                  "code",
                  { style: { fontSize: 11, wordBreak: "break-all" } },
                  o.module_paths[X]
                ) : null
              )
            )
          )
        ) : null,
        o.license_server ? e.createElement(
          v.Item,
          { label: "许可证服务器" },
          o.license_server
        ) : null,
        e.createElement(
          v.Item,
          { label: "描述" },
          o.description || "—"
        )
      ),
      // Invocation hint
      o.invocation_hint ? e.createElement(
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
          q,
          { strong: !0, style: { fontSize: 13 } },
          "💡 调用方式"
        ),
        e.createElement(
          "div",
          { style: { marginTop: 8, fontSize: 13, lineHeight: 1.6 } },
          o.invocation_hint
        )
      ) : null,
      // Type badge
      e.createElement(
        "div",
        { style: { marginTop: 12 } },
        o.is_default ? e.createElement(
          E,
          { color: "blue" },
          "默认引擎"
        ) : o.is_custom ? e.createElement(
          E,
          { color: "purple" },
          "自定义引擎"
        ) : null
      )
    ) : null,
    // Add/Edit modal
    e.createElement(
      x,
      {
        title: J ? "编辑引擎" : "添加计算引擎",
        open: U,
        onOk: F,
        onCancel: () => Q(!1),
        okText: J ? "保存" : "添加",
        cancelText: "取消",
        confirmLoading: y,
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
            options: Object.entries(lt).map(([X, b]) => ({
              label: b,
              value: X
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
function Rn() {
  const e = h().React, { useState: t, useEffect: a, useCallback: n, useMemo: l } = e, {
    Spin: r,
    Empty: s,
    Input: i,
    Button: f,
    message: c,
    Row: p,
    Col: P,
    Drawer: v,
    Descriptions: E,
    Tag: H,
    Typography: x,
    List: A,
    Tabs: O,
    Modal: W
  } = h().antd, {
    ReloadOutlined: S,
    PlusOutlined: V,
    SearchOutlined: R,
    ApiOutlined: _,
    RocketOutlined: B,
    ToolOutlined: N,
    DeleteOutlined: g,
    EyeOutlined: z,
    EyeInvisibleOutlined: I
  } = h().antdIcons || {}, { Text: q } = x, { TextArea: T } = i, d = h().useSelectedAgent, L = d ? d() : null, j = (L == null ? void 0 : L.id) || "default", [Z, M] = t([]), [u, ee] = t(!0), [o, ae] = t(""), [U, Q] = t(!1), [J, K] = t(null), [C, re] = t("mcp"), [y, se] = t(!1), [oe, Se] = t(`{
  "mcpServers": {
    "example-client": {
      "command": "npx",
      "args": ["-y", "@example/mcp-server"],
      "env": {}
    }
  }
}`), [we, D] = t(!1), [$, ne] = t(!1), [F, he] = t(null), [Ee, ie] = t(!1), [Te, _e] = t(null), [X, b] = t([]), [le, me] = t(!1), [de, fe] = t(""), be = n(async () => {
    ee(!0);
    try {
      const G = await Bt(j);
      M(G);
    } catch (G) {
      c.error(G.message || "加载 MCP 列表失败"), M([]);
    } finally {
      ee(!1);
    }
  }, [j]);
  a(() => {
    be();
  }, [be]);
  const Ae = n(
    async (G) => {
      try {
        await jt(j, G.key), c.success(G.enabled ? "已禁用" : "已启用"), be();
      } catch (ce) {
        c.error(ce.message || "切换状态失败");
      }
    },
    [j, be]
  ), Ne = n(async () => {
    if (F)
      try {
        await Dt(j, F.key), c.success(`MCP「${F.key}」已删除`), ne(!1), he(null), be();
      } catch (G) {
        c.error(G.message || "删除失败");
      }
  }, [j, F, be]), Ue = n(async () => {
    D(!0);
    try {
      const G = JSON.parse(oe), ce = G.mcpServers || G, k = Object.entries(ce);
      if (k.length === 0) {
        c.warning("未找到 MCP 客户端配置");
        return;
      }
      let xe = !0;
      for (const [Ce, ze] of k) {
        const ke = ze, $e = ke.url ? "streamable_http" : "stdio", ue = {
          name: ke.name || Ce,
          description: ke.description || "",
          enabled: !0,
          transport: $e,
          url: ke.url || "",
          command: ke.command || "",
          args: ke.args || [],
          env: ke.env || {},
          cwd: ke.cwd || "",
          headers: ke.headers || {}
        };
        try {
          await Nt(
            j,
            Ce,
            ue
          );
        } catch {
          xe = !1;
        }
      }
      xe && (c.success("MCP 客户端已创建"), se(!1), be());
    } catch (G) {
      G instanceof SyntaxError ? c.error("JSON 格式错误：" + G.message) : c.error(G.message || "创建 MCP 失败");
    } finally {
      D(!1);
    }
  }, [oe, j, be]), We = n(
    async (G) => {
      _e(G), ie(!0), b([]), fe(""), me(!0);
      try {
        const ce = await Ut(
          j,
          G.key
        );
        b(ce);
      } catch (ce) {
        fe(
          ce.message || "无法加载工具列表（MCP 服务可能未运行）"
        );
      } finally {
        me(!1);
      }
    },
    [j]
  ), Be = l(() => {
    if (!o.trim()) return Z;
    const G = o.toLowerCase();
    return Z.filter(
      (ce) => {
        var k;
        return ce.name.toLowerCase().includes(G) || ce.key.toLowerCase().includes(G) || ((k = ce.description) == null ? void 0 : k.toLowerCase().includes(G)) || ce.transport.toLowerCase().includes(G);
      }
    );
  }, [Z, o]), Ie = Z.filter((G) => G.enabled).length, Fe = Z.reduce((G, ce) => {
    var k;
    return G + (((k = ce.tools) == null ? void 0 : k.length) || 0);
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
      e.createElement(i, {
        placeholder: "搜索能力名称、描述...",
        prefix: R ? e.createElement(R) : void 0,
        value: o,
        onChange: (G) => ae(G.target.value),
        allowClear: !0,
        style: { maxWidth: 400 }
      }),
      e.createElement(
        f,
        {
          type: "primary",
          icon: V ? e.createElement(V) : void 0,
          onClick: () => se(!0),
          style: Re
        },
        "添加 MCP"
      )
    ),
    u ? e.createElement(
      "div",
      { style: { textAlign: "center", padding: 60 } },
      e.createElement(r, { size: "large" })
    ) : Be.length === 0 ? e.createElement(s, {
      description: o ? "未找到匹配的能力" : "暂无 MCP 客户端，点击「添加 MCP」创建"
    }) : e.createElement(
      p,
      { gutter: [12, 12], align: "stretch" },
      ...Be.map(
        (G) => e.createElement(
          P,
          {
            key: G.key,
            xs: 24,
            sm: 12,
            md: 8,
            lg: 6,
            style: { display: "flex" }
          },
          e.createElement(zn, {
            mcp: G,
            onClick: () => {
              K(G), Q(!0);
            },
            onToggle: (ce) => {
              ce.stopPropagation(), Ae(G);
            },
            onDelete: (ce) => {
              ce.stopPropagation(), he(G), ne(!0);
            },
            onViewTools: (ce) => {
              ce.stopPropagation(), We(G);
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
        _ ? e.createElement(_, { style: { fontSize: 14 } }) : null,
        "MCP 客户端"
      ),
      children: Le
    },
    {
      key: "software",
      label: e.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        B ? e.createElement(B, { style: { fontSize: 14 } }) : null,
        "计算引擎"
      ),
      children: e.createElement(Mn)
    }
  ];
  return e.createElement(
    "div",
    { style: { padding: 24 } },
    e.createElement(Qe, {
      title: "工具",
      subtitle: `MCP: ${Z.length} 个客户端（${Ie} 个启用）· ${Fe} 个工具`,
      extra: e.createElement(
        e.Fragment,
        null,
        e.createElement(
          f,
          {
            icon: S ? e.createElement(S) : void 0,
            onClick: be,
            loading: u
          },
          "刷新"
        )
      )
    }),
    e.createElement(O, {
      items: je,
      activeKey: C,
      onChange: (G) => re(G)
    }),
    // MCP Detail drawer
    J ? e.createElement(
      v,
      {
        title: e.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 8 } },
          e.createElement("span", { style: { fontSize: 18 } }, "🔌"),
          e.createElement(
            "span",
            null,
            J.name || J.key
          )
        ),
        open: U,
        onClose: () => Q(!1),
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
            J.key
          )
        ),
        e.createElement(
          E.Item,
          { label: "名称" },
          J.name || "-"
        ),
        e.createElement(
          E.Item,
          { label: "描述" },
          J.description || "-"
        ),
        e.createElement(
          E.Item,
          { label: "状态" },
          e.createElement(
            H,
            { color: J.enabled ? "green" : "default" },
            J.enabled ? "启用" : "停用"
          )
        ),
        e.createElement(
          E.Item,
          { label: "传输方式" },
          J.transport
        ),
        J.url ? e.createElement(
          E.Item,
          { label: "URL" },
          J.url
        ) : null,
        J.command ? e.createElement(
          E.Item,
          { label: "命令" },
          e.createElement(
            "code",
            { style: { fontSize: 11 } },
            J.command
          )
        ) : null,
        J.args && J.args.length > 0 ? e.createElement(
          E.Item,
          { label: "参数" },
          J.args.join(" ")
        ) : null
      ),
      J.tools && J.tools.length > 0 ? e.createElement(
        "div",
        { style: { marginTop: 16 } },
        e.createElement(
          q,
          {
            strong: !0,
            style: { display: "block", marginBottom: 8 }
          },
          "提供的工具"
        ),
        e.createElement(A, {
          size: "small",
          dataSource: J.tools,
          renderItem: (G) => e.createElement(
            A.Item,
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
                q,
                { style: { fontSize: 12 } },
                G
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
      W,
      {
        title: "添加 MCP 客户端 (JSON)",
        open: y,
        onCancel: () => se(!1),
        onOk: Ue,
        confirmLoading: we,
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
        value: oe,
        onChange: (G) => Se(G.target.value),
        autoSize: { minRows: 12, maxRows: 20 },
        style: { fontFamily: "Monaco, Courier New, monospace", fontSize: 13 }
      })
    ),
    // ── Delete Confirmation Modal ──
    e.createElement(
      W,
      {
        title: "确认删除",
        open: $,
        onOk: Ne,
        onCancel: () => {
          ne(!1), he(null);
        },
        okText: "确认删除",
        cancelText: "取消",
        okButtonProps: { danger: !0 }
      },
      e.createElement(
        "p",
        null,
        `确定要删除 MCP 客户端「${(F == null ? void 0 : F.name) || (F == null ? void 0 : F.key)}」吗？此操作不可撤销。`
      )
    ),
    // ── Tools Viewer Modal (mirror console /mcp tools) ──
    e.createElement(
      W,
      {
        title: Te ? `${Te.name || Te.key} - 工具列表` : "工具列表",
        open: Ee,
        onCancel: () => {
          ie(!1), _e(null);
        },
        footer: e.createElement(
          f,
          { onClick: () => ie(!1) },
          "关闭"
        ),
        width: 640
      },
      le ? e.createElement(
        "div",
        { style: { textAlign: "center", padding: 40 } },
        e.createElement(r, { size: "large" })
      ) : de ? e.createElement(
        "div",
        { style: { color: "#ff4d4f", padding: 16 } },
        de
      ) : X.length === 0 ? e.createElement(s, {
        description: "此 MCP 客户端暂无可用工具（可能服务未启动）"
      }) : e.createElement(A, {
        size: "small",
        dataSource: X,
        renderItem: (G) => e.createElement(
          A.Item,
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
                q,
                { strong: !0, style: { fontSize: 13 } },
                G.name || G.key
              )
            ),
            G.description ? e.createElement(
              q,
              { type: "secondary", style: { fontSize: 12 } },
              G.description
            ) : null
          )
        )
      })
    )
  );
}
function Ln({
  agentId: e,
  agentName: t,
  onNavigate: a
}) {
  const n = h().React, { useState: l, useEffect: r, useCallback: s } = n, {
    Spin: i,
    Empty: f,
    Button: c,
    Row: p,
    Col: P,
    Card: v,
    Tag: E,
    Checkbox: H,
    Modal: x,
    Typography: A,
    Drawer: O,
    Descriptions: W,
    message: S
  } = h().antd, {
    ReloadOutlined: V,
    ThunderboltOutlined: R,
    SettingOutlined: _,
    CheckSquareOutlined: B,
    EyeOutlined: N,
    EyeInvisibleOutlined: g,
    DeleteOutlined: z,
    CloseOutlined: I
  } = h().antdIcons || {}, { Text: q, Paragraph: T } = A, [w, d] = l([]), [L, j] = l(!0), [Z, M] = l(!1), [u, ee] = l(null), [o, ae] = l(!1), [U, Q] = l(
    /* @__PURE__ */ new Set()
  ), [J, K] = l(!1), C = s(async () => {
    if (e) {
      j(!0);
      try {
        const $ = await st(e);
        d($);
      } catch ($) {
        S.error($.message || "加载技能失败"), d([]);
      } finally {
        j(!1);
      }
    }
  }, [e]);
  r(() => {
    C();
  }, [C]);
  const re = ($) => {
    Q((ne) => {
      const F = new Set(ne);
      return F.has($) ? F.delete($) : F.add($), F;
    });
  }, y = () => Q(/* @__PURE__ */ new Set()), se = () => Q(new Set(w.map(($) => $.name))), oe = () => {
    o ? (y(), ae(!1)) : ae(!0);
  }, Se = async () => {
    const $ = Array.from(U);
    if ($.length !== 0) {
      K(!0);
      try {
        const { results: ne } = await Yt(e, $), F = Object.entries(ne).filter(
          ([, Ee]) => Ee.success === !1
        ), he = $.length - F.length;
        F.length > 0 ? S.warning(
          `批量启用完成：成功 ${he} 个，失败 ${F.length} 个`
        ) : S.success(`成功启用 ${$.length} 个技能`), y(), await C();
      } catch (ne) {
        S.error(ne.message || "批量启用失败");
      } finally {
        K(!1);
      }
    }
  }, we = async () => {
    const $ = Array.from(U);
    if ($.length !== 0) {
      K(!0);
      try {
        const { results: ne } = await Qt(e, $), F = Object.entries(ne).filter(
          ([, Ee]) => Ee.success === !1
        ), he = $.length - F.length;
        F.length > 0 ? S.warning(
          `批量停用完成：成功 ${he} 个，失败 ${F.length} 个`
        ) : S.success(`成功停用 ${$.length} 个技能`), y(), await C();
      } catch (ne) {
        S.error(ne.message || "批量停用失败");
      } finally {
        K(!1);
      }
    }
  }, D = () => {
    const $ = Array.from(U);
    $.length !== 0 && x.confirm({
      title: `确认删除 ${$.length} 个技能？`,
      content: "删除后技能将从当前专家工作区移除，此操作不可撤销。技能池中的原始技能不受影响。",
      okText: "确认删除",
      cancelText: "取消",
      okButtonProps: { danger: !0 },
      onOk: async () => {
        K(!0);
        try {
          const { results: ne } = await Zt(e, $), F = Object.entries(ne).filter(
            ([, Ee]) => Ee.success === !1
          ), he = $.length - F.length;
          F.length > 0 ? S.warning(
            `批量删除完成：成功 ${he} 个，失败 ${F.length} 个`
          ) : S.success(`成功删除 ${$.length} 个技能`), y(), await C();
        } catch (ne) {
          S.error(ne.message || "批量删除失败");
        } finally {
          K(!1);
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
        q,
        { type: "secondary", style: { fontSize: 13 } },
        o ? `已选择 ${U.size} / ${w.length} 个技能` : `共 ${w.length} 个技能`
      ),
      n.createElement(
        "div",
        { style: { display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" } },
        o ? n.createElement(
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
              icon: I ? n.createElement(I) : void 0,
              onClick: y
            },
            "取消选择"
          ),
          n.createElement(
            c,
            {
              size: "small",
              type: "default",
              icon: N ? n.createElement(N) : void 0,
              disabled: U.size === 0 || J,
              loading: J,
              onClick: Se
            },
            "批量启用"
          ),
          n.createElement(
            c,
            {
              size: "small",
              danger: !0,
              icon: g ? n.createElement(g) : void 0,
              disabled: U.size === 0 || J,
              loading: J,
              onClick: we
            },
            "批量停用"
          ),
          n.createElement(
            c,
            {
              size: "small",
              danger: !0,
              icon: z ? n.createElement(z) : void 0,
              disabled: U.size === 0 || J,
              loading: J,
              onClick: D
            },
            `删除 (${U.size})`
          ),
          n.createElement(
            c,
            {
              size: "small",
              type: "primary",
              onClick: oe
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
              icon: B ? n.createElement(B) : void 0,
              onClick: oe,
              disabled: w.length === 0
            },
            "批量管理"
          ),
          n.createElement(
            c,
            {
              icon: V ? n.createElement(V) : void 0,
              onClick: C,
              loading: L,
              size: "small"
            },
            "刷新"
          )
        )
      )
    ),
    L ? n.createElement(
      "div",
      { style: { textAlign: "center", padding: 60 } },
      n.createElement(i, { size: "large" })
    ) : w.length === 0 ? n.createElement(f, {
      description: "当前智能体未加载任何技能"
    }) : n.createElement(
      p,
      { gutter: [12, 12] },
      ...w.map(
        ($) => n.createElement(
          P,
          { key: $.name, xs: 24, sm: 12, md: 8, lg: 6 },
          n.createElement(
            v,
            {
              hoverable: !0,
              size: "small",
              style: {
                cursor: o ? "default" : "pointer",
                height: "100%",
                position: "relative",
                borderColor: o && U.has($.name) ? "#0072f5" : void 0,
                borderWidth: o && U.has($.name) ? 2 : 1
              },
              onClick: () => {
                o ? re($.name) : (ee($), M(!0));
              }
            },
            o ? n.createElement(
              "div",
              {
                style: {
                  position: "absolute",
                  top: 8,
                  right: 8,
                  zIndex: 1
                },
                onClick: (ne) => {
                  ne.stopPropagation(), re($.name);
                }
              },
              n.createElement(H, {
                checked: U.has($.name)
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
              $.emoji ? n.createElement(
                "span",
                { style: { fontSize: 18 } },
                $.emoji
              ) : n.createElement(
                "span",
                { style: { fontSize: 18 } },
                "⚡"
              ),
              n.createElement(
                q,
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
                $.name
              ),
              $.enabled === !1 ? n.createElement(
                E,
                { color: "default", style: { fontSize: 10 } },
                "已禁用"
              ) : n.createElement(
                E,
                { color: "green", style: { fontSize: 10 } },
                "已启用"
              )
            ),
            $.description ? n.createElement(
              T,
              {
                type: "secondary",
                style: { fontSize: 11, margin: 0, lineHeight: 1.4 },
                ellipsis: { rows: 2 }
              },
              $.description
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
              $.version_text ? n.createElement(
                E,
                { style: { fontSize: 10 } },
                `v${$.version_text}`
              ) : null,
              ...($.tags || []).slice(0, 3).map(
                (ne, F) => n.createElement(
                  E,
                  { key: F, color: "blue", style: { fontSize: 10 } },
                  ne
                )
              )
            )
          )
        )
      )
    ),
    // Skill detail drawer
    u ? n.createElement(
      O,
      {
        title: n.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 8 } },
          n.createElement(
            "span",
            { style: { fontSize: 18 } },
            u.emoji || "⚡"
          ),
          n.createElement("span", null, u.name)
        ),
        open: Z,
        onClose: () => M(!1),
        width: 520,
        extra: n.createElement(
          c,
          {
            type: "primary",
            size: "small",
            icon: _ ? n.createElement(_) : void 0,
            onClick: () => a("/skills")
          },
          "管理技能"
        )
      },
      n.createElement(
        W,
        { column: 1, bordered: !0, size: "small" },
        n.createElement(
          W.Item,
          { label: "技能名称" },
          u.name
        ),
        n.createElement(
          W.Item,
          { label: "描述" },
          u.description || "-"
        ),
        u.version_text ? n.createElement(
          W.Item,
          { label: "版本" },
          u.version_text
        ) : null,
        n.createElement(
          W.Item,
          { label: "来源" },
          u.source || "-"
        ),
        n.createElement(
          W.Item,
          { label: "状态" },
          u.enabled === !1 ? "已禁用" : "已启用"
        ),
        u.installed_from ? n.createElement(
          W.Item,
          { label: "安装来源" },
          u.installed_from
        ) : null
      ),
      // Tags
      u.tags && u.tags.length > 0 ? n.createElement(
        "div",
        { style: { marginTop: 16 } },
        n.createElement(
          q,
          {
            strong: !0,
            style: { display: "block", marginBottom: 8 }
          },
          "标签"
        ),
        n.createElement(
          "div",
          { style: { display: "flex", flexWrap: "wrap", gap: 4 } },
          ...u.tags.map(
            ($, ne) => n.createElement(E, { key: ne, color: "blue" }, $)
          )
        )
      ) : null,
      // Skill content preview
      u.content ? n.createElement(
        "div",
        { style: { marginTop: 16 } },
        n.createElement(
          q,
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
          u.content.slice(0, 2e3) + (u.content.length > 2e3 ? `

... (内容已截断)` : "")
        )
      ) : null
    ) : null
  );
}
function Bn({
  poolSkills: e,
  workspaceSkills: t,
  agents: a,
  loading: n,
  onReload: l
}) {
  const r = h().React, { useState: s, useMemo: i, useCallback: f } = r, {
    Spin: c,
    Empty: p,
    Input: P,
    Button: v,
    Row: E,
    Col: H,
    Card: x,
    Tag: A,
    Typography: O,
    Drawer: W,
    Descriptions: S,
    List: V
  } = h().antd, {
    ReloadOutlined: R,
    SearchOutlined: _,
    DownloadOutlined: B,
    ThunderboltOutlined: N
  } = h().antdIcons || {}, { Text: g, Paragraph: z } = O, [I, q] = s(""), [T, w] = s(!1), [d, L] = s(null), [j, Z] = s([]), M = i(() => {
    if (!I.trim()) return e;
    const o = I.toLowerCase();
    return e.filter(
      (ae) => {
        var U, Q;
        return ae.name.toLowerCase().includes(o) || ((U = ae.description) == null ? void 0 : U.toLowerCase().includes(o)) || ((Q = ae.tags) == null ? void 0 : Q.some((J) => J.toLowerCase().includes(o)));
      }
    );
  }, [e, I]), u = f(
    (o) => {
      const ae = [];
      for (const U of t)
        if (U.skills.some((Q) => Q.name === o)) {
          const Q = a.find((J) => J.id === U.agent_id);
          ae.push((Q == null ? void 0 : Q.name) || U.agent_name || U.agent_id);
        }
      return ae;
    },
    [t, a]
  ), ee = (o) => {
    window.history.pushState({}, "", o), window.dispatchEvent(new PopStateEvent("popstate"));
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
      r.createElement(P, {
        placeholder: "搜索技能名称、描述或标签...",
        prefix: _ ? r.createElement(_) : void 0,
        value: I,
        onChange: (o) => q(o.target.value),
        allowClear: !0,
        style: { maxWidth: 400 }
      }),
      r.createElement(
        "div",
        { style: { display: "flex", gap: 8 } },
        r.createElement(
          v,
          {
            icon: R ? r.createElement(R) : void 0,
            onClick: l,
            loading: n,
            size: "small"
          },
          "刷新"
        ),
        r.createElement(
          v,
          {
            type: "primary",
            icon: B ? r.createElement(B) : void 0,
            onClick: () => ee("/skill-pool"),
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
      r.createElement(c, { size: "large" })
    ) : M.length === 0 ? r.createElement(p, {
      description: I ? "未找到匹配的技能" : "技能池为空"
    }) : r.createElement(
      E,
      { gutter: [12, 12] },
      ...M.map(
        (o) => r.createElement(
          H,
          { key: o.name, xs: 24, sm: 12, md: 8, lg: 6 },
          r.createElement(
            x,
            {
              hoverable: !0,
              size: "small",
              style: { cursor: "pointer", height: "100%" },
              onClick: () => {
                L(o), Z(u(o.name)), w(!0);
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
              o.emoji ? r.createElement(
                "span",
                { style: { fontSize: 18 } },
                o.emoji
              ) : r.createElement(
                "span",
                { style: { fontSize: 18 } },
                "⚡"
              ),
              r.createElement(
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
                o.name
              ),
              o.protected ? r.createElement(
                A,
                { color: "gold", style: { fontSize: 10 } },
                "内置"
              ) : null
            ),
            o.description ? r.createElement(
              z,
              {
                type: "secondary",
                style: { fontSize: 11, margin: 0, lineHeight: 1.4 },
                ellipsis: { rows: 2 }
              },
              o.description
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
              o.version_text ? r.createElement(
                A,
                { style: { fontSize: 10 } },
                `v${o.version_text}`
              ) : null,
              ...(o.tags || []).slice(0, 3).map(
                (ae, U) => r.createElement(
                  A,
                  { key: U, color: "cyan", style: { fontSize: 10 } },
                  ae
                )
              )
            )
          )
        )
      )
    ),
    // Skill detail drawer
    d ? r.createElement(
      W,
      {
        title: r.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 8 } },
          r.createElement(
            "span",
            { style: { fontSize: 18 } },
            d.emoji || "⚡"
          ),
          r.createElement("span", null, d.name)
        ),
        open: T,
        onClose: () => w(!1),
        width: 520,
        extra: r.createElement(
          v,
          {
            type: "primary",
            size: "small",
            icon: N ? r.createElement(N) : void 0,
            onClick: () => ee("/skills")
          },
          "管理技能"
        )
      },
      r.createElement(
        S,
        { column: 1, bordered: !0, size: "small" },
        r.createElement(
          S.Item,
          { label: "技能名称" },
          d.name
        ),
        r.createElement(
          S.Item,
          { label: "描述" },
          d.description || "-"
        ),
        d.version_text ? r.createElement(
          S.Item,
          { label: "版本" },
          d.version_text
        ) : null,
        r.createElement(
          S.Item,
          { label: "来源" },
          d.source || "-"
        ),
        r.createElement(
          S.Item,
          { label: "受保护" },
          d.protected ? "是（内置）" : "否"
        ),
        d.sync_status ? r.createElement(
          S.Item,
          { label: "同步状态" },
          d.sync_status
        ) : null,
        d.installed_from ? r.createElement(
          S.Item,
          { label: "安装来源" },
          d.installed_from
        ) : null
      ),
      // Tags
      d.tags && d.tags.length > 0 ? r.createElement(
        "div",
        { style: { marginTop: 16 } },
        r.createElement(
          g,
          {
            strong: !0,
            style: { display: "block", marginBottom: 8 }
          },
          "标签"
        ),
        r.createElement(
          "div",
          { style: { display: "flex", flexWrap: "wrap", gap: 4 } },
          ...d.tags.map(
            (o, ae) => r.createElement(A, { key: ae, color: "cyan" }, o)
          )
        )
      ) : null,
      // Installed agents
      r.createElement(
        "div",
        { style: { marginTop: 16 } },
        r.createElement(
          g,
          { strong: !0, style: { display: "block", marginBottom: 8 } },
          `已安装此技能的专家 (${j.length})`
        ),
        j.length > 0 ? r.createElement(V, {
          size: "small",
          dataSource: j,
          renderItem: (o) => r.createElement(
            V.Item,
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
              r.createElement("span", null, "🧑‍🔬"),
              r.createElement(
                g,
                { style: { fontSize: 13 } },
                o
              )
            )
          )
        }) : r.createElement(
          g,
          { type: "secondary", style: { fontSize: 12 } },
          "暂无专家安装此技能"
        )
      )
    ) : null
  );
}
function jn() {
  const e = h().React, { useState: t, useEffect: a, useCallback: n, useMemo: l } = e, { Tabs: r, message: s } = h().antd, { ThunderboltOutlined: i, AppstoreOutlined: f } = h().antdIcons || {}, p = h().useSelectedAgent, P = p ? p() : null, v = (P == null ? void 0 : P.id) || "default", [E, H] = t([]), [x, A] = t([]), [O, W] = t([]), [S, V] = t(!0), [R, _] = t("agent-skills"), B = n(async () => {
    V(!0);
    try {
      const [I, q, T] = await Promise.all([
        it(),
        ot(),
        Lt()
      ]);
      A(I), H(q), W(T);
    } catch (I) {
      s.error(I.message || "加载技能列表失败"), A([]);
    } finally {
      V(!1);
    }
  }, []);
  a(() => {
    B();
  }, [B]);
  const N = l(() => {
    const I = E.find((q) => q.id === v);
    return (I == null ? void 0 : I.name) || v;
  }, [E, v]), g = (I) => {
    window.history.pushState({}, "", I), window.dispatchEvent(new PopStateEvent("popstate"));
  }, z = [
    {
      key: "agent-skills",
      label: e.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        i ? e.createElement(i, { style: { fontSize: 14 } }) : null,
        "当前Agent加载技能"
      ),
      children: e.createElement(Ln, {
        agentId: v,
        agentName: N,
        onNavigate: g
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
      children: e.createElement(Bn, {
        poolSkills: x,
        workspaceSkills: O,
        agents: E,
        loading: S,
        onReload: B
      })
    }
  ];
  return e.createElement(
    "div",
    { style: { padding: 24 } },
    e.createElement(Qe, {
      title: "技能",
      subtitle: `技能池共 ${x.length} 个技能 · 当前智能体：${N}`
    }),
    e.createElement(r, {
      items: z,
      activeKey: R,
      onChange: (I) => _(I)
    })
  );
}
const at = "ugsci.market.githubSources", gt = "https://github.com/anthropics/skills/tree/main/skills";
function At(e) {
  try {
    const t = new URL(e.trim()), a = t.hostname.toLowerCase();
    if (a !== "github.com" && a !== "www.github.com") return null;
    const n = t.pathname.split("/").filter((f) => f.length > 0);
    if (n.length < 2) return null;
    const l = decodeURIComponent(n[0]), r = decodeURIComponent(n[1]);
    let s = "main", i = "";
    return n.length >= 4 && (n[2] === "tree" || n[2] === "blob") ? (s = decodeURIComponent(n[3]), n.length > 4 && (i = n.slice(4).map(decodeURIComponent).join("/"))) : n.length > 2 && (i = n.slice(2).map(decodeURIComponent).join("/")), i = i.replace(/\/+$/, "").replace(/^\/+/, ""), {
      owner: l,
      repo: r,
      ref: s || "main",
      skillsPath: i,
      label: `${l}/${r}`
    };
  } catch {
    return null;
  }
}
function $t(e, t, a) {
  return `${e}/${t}:${a || "/"}`;
}
function Dn() {
  try {
    const e = localStorage.getItem(at);
    if (!e) {
      const a = At(gt);
      if (a) {
        const n = [
          {
            id: $t(
              a.owner,
              a.repo,
              a.skillsPath
            ),
            url: gt,
            label: a.label,
            owner: a.owner,
            repo: a.repo,
            ref: a.ref,
            skillsPath: a.skillsPath,
            enabled: !0
          }
        ];
        return localStorage.setItem(at, JSON.stringify(n)), n;
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
function tt(e) {
  try {
    localStorage.setItem(
      at,
      JSON.stringify(e)
    );
  } catch {
  }
}
function Nn(e) {
  const t = e.match(/^---\s*\n([\s\S]*?)\n---/);
  if (!t) return {};
  const a = t[1], n = {}, l = a.split(`
`);
  let r = "";
  for (const s of l) {
    const i = s.match(/^(\w[\w-]*)\s*:\s*(.*)$/);
    if (i) {
      r = i[1];
      let f = i[2].trim();
      (f.startsWith('"') && f.endsWith('"') || f.startsWith("'") && f.endsWith("'")) && (f = f.slice(1, -1)), r === "name" ? n.name = f : r === "description" ? n.description = f : r === "version" ? n.version = f : r === "author" && (n.author = f);
    }
  }
  return n;
}
async function Un(e) {
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
    (i) => i.type === "dir" && i.name
  );
  return await Promise.all(
    r.map(async (i) => {
      const f = `https://raw.githubusercontent.com/${e.owner}/${e.repo}/${e.ref}/${e.skillsPath ? e.skillsPath + "/" : ""}${i.name}/SKILL.md`, c = `https://github.com/${e.owner}/${e.repo}/tree/${e.ref}/${e.skillsPath ? e.skillsPath + "/" : ""}${i.name}`, p = {
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
        const P = await fetch(f);
        if (!P.ok) return p;
        const v = await P.text(), E = Nn(v);
        return {
          ...p,
          name: E.name || i.name,
          description: E.description || "",
          version: E.version || null,
          author: E.author || null
        };
      } catch {
        return p;
      }
    })
  );
}
async function Fn(e) {
  const t = e.filter((r) => r.enabled), a = await Promise.all(
    t.map(async (r) => {
      try {
        return { skills: await Un(r), error: null, label: r.label };
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
function Hn({
  open: e,
  onClose: t,
  sources: a,
  onChange: n
}) {
  const l = h().React, { useState: r } = l, {
    Modal: s,
    Input: i,
    Button: f,
    List: c,
    Tag: p,
    Switch: P,
    Typography: v,
    Tooltip: E,
    message: H
  } = h().antd, {
    PlusOutlined: x,
    DeleteOutlined: A,
    LinkOutlined: O,
    GithubOutlined: W
  } = h().antdIcons || {}, { Text: S } = v, [V, R] = r(""), _ = () => {
    const g = V.trim();
    if (!g) return;
    const z = At(g);
    if (!z) {
      H.error("无效的 GitHub URL，请输入类似 https://github.com/owner/repo/tree/main/skills 的链接");
      return;
    }
    const I = $t(z.owner, z.repo, z.skillsPath);
    if (a.some((w) => w.id === I)) {
      H.warning("该源已存在");
      return;
    }
    const q = {
      id: I,
      url: g,
      label: z.label,
      owner: z.owner,
      repo: z.repo,
      ref: z.ref,
      skillsPath: z.skillsPath,
      enabled: !0
    }, T = [...a, q];
    tt(T), n(T), R(""), H.success(`已添加源: ${z.label}`);
  }, B = (g, z) => {
    const I = a.map(
      (q) => q.id === g ? { ...q, enabled: z } : q
    );
    tt(I), n(I);
  }, N = (g) => {
    const z = a.filter((I) => I.id !== g);
    tt(z), n(z), H.success("已移除源");
  };
  return l.createElement(
    s,
    {
      open: e,
      onCancel: t,
      title: l.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 8 } },
        W ? l.createElement(W, { style: { fontSize: 18 } }) : null,
        l.createElement("span", null, "配置技能源")
      ),
      footer: l.createElement(
        f,
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
          value: V,
          onChange: (g) => R(g.target.value),
          onPressEnter: _,
          prefix: O ? l.createElement(O) : void 0,
          style: { flex: 1 }
        }),
        l.createElement(
          f,
          {
            type: "primary",
            icon: x ? l.createElement(x) : void 0,
            onClick: _
          },
          "添加"
        )
      )
    ),
    l.createElement(
      "div",
      { style: { marginBottom: 8, display: "flex", alignItems: "center", justifyContent: "space-between" } },
      l.createElement(S, { strong: !0 }, `已配置源 (${a.length})`)
    ),
    l.createElement(c, {
      size: "small",
      bordered: !0,
      dataSource: a,
      renderItem: (g) => l.createElement(
        c.Item,
        {
          actions: [
            l.createElement(
              E,
              { title: g.enabled ? "点击禁用" : "点击启用" },
              l.createElement(P, {
                size: "small",
                checked: g.enabled,
                onChange: (z) => B(g.id, z)
              })
            ),
            l.createElement(
              E,
              { title: "移除此源" },
              l.createElement(
                f,
                {
                  size: "small",
                  type: "text",
                  danger: !0,
                  icon: A ? l.createElement(A) : void 0,
                  onClick: () => N(g.id)
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
              p,
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
async function Wn() {
  return te("/market/providers");
}
async function Gn(e) {
  return te(
    `/market/categories?lang=${encodeURIComponent(e)}`
  );
}
async function Jn(e, t, a, n, l) {
  return te("/market/search", {
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
async function yt(e, t, a) {
  return te("/skills/hub/install/start", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify({
      bundle_url: t,
      enable: a
    })
  });
}
async function ft(e, t) {
  return te(
    `/skills/hub/install/status/${encodeURIComponent(t)}`,
    {
      headers: { "X-Agent-Id": e }
    }
  );
}
function Xn() {
  const e = h().React, { useState: t, useEffect: a, useCallback: n, useMemo: l, useRef: r } = e, {
    Spin: s,
    Empty: i,
    Input: f,
    Button: c,
    message: p,
    Row: P,
    Col: v,
    Card: E,
    Tag: H,
    Tooltip: x,
    Typography: A,
    Select: O,
    Drawer: W,
    Descriptions: S,
    Tabs: V,
    Badge: R,
    Progress: _
  } = h().antd, {
    ReloadOutlined: B,
    SearchOutlined: N,
    DownloadOutlined: g,
    AppstoreOutlined: z,
    ShopOutlined: I,
    CheckCircleOutlined: q,
    LoadingOutlined: T,
    UserOutlined: w,
    SettingOutlined: d,
    GithubOutlined: L
  } = h().antdIcons || {}, { Text: j, Paragraph: Z, Title: M } = A, [u, ee] = t("skills"), [o, ae] = t([]), [U, Q] = t([]), [J, K] = t([]), [C, re] = t(""), [y, se] = t(""), [oe, Se] = t(!1), [we, D] = t(!1), [$, ne] = t(
    {}
  ), [F, he] = t(null), [Ee, ie] = t({}), [Te, _e] = t([]), [X, b] = t(""), [le, me] = t(""), [de, fe] = t([]), [be, Ae] = t([]), [Ne, Ue] = t(!1), [We, Be] = t(!1), [Ie, Fe] = t(""), Le = r(null);
  a(() => {
    Promise.all([
      Wn().catch(() => []),
      Gn("zh").catch(() => []),
      ot().catch(() => [])
    ]).then(([m, Y, pe]) => {
      ae(m), Q(Y), _e(pe), pe.length > 0 && b(pe[0].id);
    });
  }, []);
  const je = n(async (m) => {
    const Y = m ?? Dn();
    if (fe(m || Y), Y.filter((ge) => ge.enabled).length === 0) {
      Ae([]);
      return;
    }
    Ue(!0);
    try {
      const { skills: ge, errors: Pe } = await Fn(Y);
      if (Ae(ge), Pe.length > 0) {
        for (const ye of Pe)
          console.warn(`[ugsci] GitHub source '${ye.label}' error: ${ye.message}`);
        p.warning(
          `部分源加载失败: ${Pe.map((ye) => ye.label).join(", ")}`
        );
      }
    } catch (ge) {
      p.error(ge.message || "加载 GitHub 技能源失败"), Ae([]);
    } finally {
      Ue(!1);
    }
  }, []);
  a(() => {
    je();
  }, [je]);
  const G = n(
    async (m, Y, pe) => {
      Se(!0);
      try {
        const ge = await Jn(
          m,
          pe,
          20,
          "zh",
          Y || void 0
        );
        pe === void 0 || Object.keys(pe).length === 0 ? K(ge.results) : K((ve) => [...ve, ...ge.results]);
        const Pe = Object.values(ge.by_provider || {}).some(
          (ve) => ve.has_more
        );
        D(Pe);
        const ye = {};
        for (const [ve, Oe] of Object.entries(ge.by_provider || {}))
          ye[ve] = (pe[ve] || 1) + 1;
        if (ne(ye), ge.errors.length > 0)
          for (const ve of ge.errors)
            console.warn(
              `[ugsci] Market provider '${ve.provider}' error: ${ve.message}`
            );
      } catch (ge) {
        p.error(ge.message || "搜索市场失败"), K([]);
      } finally {
        Se(!1);
      }
    },
    []
  );
  a(() => (Le.current && clearTimeout(Le.current), Le.current = setTimeout(() => {
    G(C, y, {});
  }, 400), () => {
    Le.current && clearTimeout(Le.current);
  }), [C, y, G]);
  const ce = () => {
    G(C, y, $);
  }, k = async (m) => {
    var pe;
    if (!X) {
      p.warning("请先选择安装目标专家");
      return;
    }
    const Y = `${m.source}:${m.slug}`;
    try {
      ie((ye) => ({ ...ye, [Y]: "starting" }));
      const ge = await yt(
        X,
        m.source_url,
        !0
      );
      ie((ye) => ({ ...ye, [Y]: "installing" }));
      const Pe = 60;
      for (let ye = 0; ye < Pe; ye++) {
        await new Promise((Oe) => setTimeout(Oe, 2e3));
        const ve = await ft(
          X,
          ge.task_id
        );
        if (ve.status === "completed" && ((pe = ve.result) != null && pe.installed)) {
          p.success(`技能「${ve.result.name || m.name}」安装成功`), ie((Oe) => {
            const Me = { ...Oe };
            return delete Me[Y], Me;
          });
          return;
        }
        if (ve.status === "failed")
          throw new Error(ve.error || "安装失败");
        if (ve.status === "cancelled") {
          p.info("安装已取消"), ie((Oe) => {
            const Me = { ...Oe };
            return delete Me[Y], Me;
          });
          return;
        }
      }
      throw new Error("安装超时");
    } catch (ge) {
      p.error(ge.message || "安装技能失败"), ie((Pe) => {
        const ye = { ...Pe };
        return delete ye[Y], ye;
      });
    }
  }, xe = (m) => {
    window.history.pushState({}, "", m), window.dispatchEvent(new PopStateEvent("popstate"));
  }, Ce = async (m) => {
    var pe;
    if (!X) {
      p.warning("请先选择安装目标专家");
      return;
    }
    const Y = `github:${m.sourceId}:${m.name}`;
    try {
      ie((ye) => ({ ...ye, [Y]: "starting" }));
      const ge = await yt(
        X,
        m.source_url,
        !0
      );
      ie((ye) => ({ ...ye, [Y]: "installing" }));
      const Pe = 60;
      for (let ye = 0; ye < Pe; ye++) {
        await new Promise((Oe) => setTimeout(Oe, 2e3));
        const ve = await ft(
          X,
          ge.task_id
        );
        if (ve.status === "completed" && ((pe = ve.result) != null && pe.installed)) {
          p.success(`技能「${ve.result.name || m.name}」安装成功`), ie((Oe) => {
            const Me = { ...Oe };
            return delete Me[Y], Me;
          });
          return;
        }
        if (ve.status === "failed")
          throw new Error(ve.error || "安装失败");
        if (ve.status === "cancelled") {
          p.info("安装已取消"), ie((Oe) => {
            const Me = { ...Oe };
            return delete Me[Y], Me;
          });
          return;
        }
      }
      throw new Error("安装超时");
    } catch (ge) {
      p.error(ge.message || "安装技能失败"), ie((Pe) => {
        const ye = { ...Pe };
        return delete ye[Y], ye;
      });
    }
  }, ze = l(() => {
    let m = be;
    if (Ie && (m = m.filter((Y) => Y.sourceLabel === Ie)), C.trim()) {
      const Y = C.toLowerCase();
      m = m.filter(
        (pe) => {
          var ge;
          return pe.name.toLowerCase().includes(Y) || ((ge = pe.description) == null ? void 0 : ge.toLowerCase().includes(Y));
        }
      );
    }
    return m;
  }, [be, C, Ie]), ke = o.filter((m) => m.available), $e = l(() => {
    if (!Ie) return J;
    const m = ke.find(
      (Y) => Y.label === Ie
    );
    return m ? J.filter((Y) => Y.source === m.key) : J;
  }, [J, Ie, ke]), ue = l(() => {
    const m = /* @__PURE__ */ new Set();
    return de.filter((Y) => Y.enabled).forEach((Y) => m.add(Y.label)), ke.forEach((Y) => m.add(Y.label)), Array.from(m);
  }, [de, ke]), Ze = e.createElement(
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
        prefix: N ? e.createElement(N) : void 0,
        value: C,
        onChange: (m) => re(m.target.value),
        allowClear: !0,
        style: { flex: 1, minWidth: 200, maxWidth: 400 }
      }),
      U.length > 0 ? e.createElement(O, {
        value: y || void 0,
        onChange: (m) => se(m || ""),
        placeholder: "全部分类",
        allowClear: !0,
        style: { minWidth: 150 },
        options: [
          { value: "", label: "全部分类" },
          ...U.map((m) => ({ value: m.id, label: m.label }))
        ]
      }) : null,
      // Install target selector
      e.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 4 } },
        e.createElement(
          j,
          { type: "secondary", style: { fontSize: 12 } },
          "安装到"
        ),
        e.createElement(O, {
          value: X || void 0,
          onChange: (m) => b(m),
          style: { minWidth: 140 },
          placeholder: "选择专家",
          options: Te.map((m) => ({ value: m.id, label: m.name }))
        })
      )
    ),
    // Source filter tags (GitHub sources + market providers)
    ue.length > 0 ? e.createElement(
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
        j,
        { type: "secondary", style: { fontSize: 12, marginRight: 4 } },
        "来源筛选:"
      ),
      e.createElement(
        H,
        {
          style: {
            fontSize: 11,
            cursor: "pointer",
            borderRadius: 12
          },
          color: Ie === "" ? "blue" : void 0,
          onClick: () => Fe("")
        },
        "全部"
      ),
      ...ue.map(
        (m) => e.createElement(
          H,
          {
            key: m,
            style: {
              fontSize: 11,
              cursor: "pointer",
              borderRadius: 12
            },
            color: Ie === m ? "blue" : void 0,
            icon: L && de.some((Y) => Y.label === m) ? e.createElement(L) : void 0,
            onClick: () => Fe(
              Ie === m ? "" : m
            )
          },
          m
        )
      )
    ) : null,
    // GitHub skills section
    Ne && be.length === 0 ? e.createElement(
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
        L ? e.createElement(L, {
          style: { fontSize: 14, color: "#1677ff" }
        }) : null,
        e.createElement(
          j,
          { strong: !0, style: { fontSize: 13 } },
          `GitHub 技能源 (${ze.length})`
        )
      ),
      e.createElement(
        P,
        { gutter: [12, 12] },
        ...ze.map((m) => {
          const Y = `github:${m.sourceId}:${m.name}`, pe = Ee[Y];
          return e.createElement(
            v,
            { key: Y, xs: 24, sm: 12, md: 8, lg: 6 },
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
                L ? e.createElement(L, {
                  style: { fontSize: 18, color: "#57606a" }
                }) : e.createElement(
                  "span",
                  { style: { fontSize: 18 } },
                  "📦"
                ),
                e.createElement(
                  x,
                  { title: m.name },
                  e.createElement(
                    j,
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
                    m.name
                  )
                )
              ),
              e.createElement(
                Z,
                {
                  type: "secondary",
                  style: { fontSize: 11, margin: 0, lineHeight: 1.4 },
                  ellipsis: { rows: 2 }
                },
                m.description || "暂无描述"
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
                    H,
                    { color: "blue", style: { fontSize: 10 } },
                    m.sourceLabel
                  ),
                  m.version ? e.createElement(
                    H,
                    { style: { fontSize: 10 } },
                    `v${m.version}`
                  ) : null
                ),
                pe ? e.createElement(
                  c,
                  {
                    size: "small",
                    disabled: !0,
                    icon: T ? e.createElement(T) : void 0
                  },
                  pe === "starting" ? "启动中" : "安装中"
                ) : e.createElement(
                  c,
                  {
                    type: "primary",
                    size: "small",
                    icon: g ? e.createElement(g) : void 0,
                    onClick: () => Ce(m)
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
    $e.length > 0 || oe ? e.createElement(
      "div",
      {
        style: {
          marginBottom: 10,
          display: "flex",
          alignItems: "center",
          gap: 6
        }
      },
      I ? e.createElement(I, {
        style: { fontSize: 14, color: "#1677ff" }
      }) : null,
      e.createElement(
        j,
        { strong: !0, style: { fontSize: 13 } },
        `技能市场${$e.length > 0 ? ` (${$e.length})` : ""}`
      )
    ) : null,
    // Results grid
    oe && $e.length === 0 ? e.createElement(
      "div",
      { style: { textAlign: "center", padding: 60 } },
      e.createElement(s, { size: "large" })
    ) : $e.length === 0 ? e.createElement(i, {
      description: C ? `未找到匹配「${C}」的技能` : "输入关键词搜索技能市场",
      image: i.PRESENTED_IMAGE_SIMPLE
    }) : e.createElement(
      P,
      { gutter: [12, 12] },
      ...$e.map((m) => {
        const Y = `${m.source}:${m.slug}`, pe = Ee[Y];
        return e.createElement(
          v,
          { key: Y, xs: 24, sm: 12, md: 8, lg: 6 },
          e.createElement(
            E,
            {
              hoverable: !0,
              size: "small",
              style: { height: "100%", cursor: "pointer" },
              onClick: () => he(m)
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
              m.icon_url ? e.createElement("img", {
                src: m.icon_url,
                alt: m.name,
                style: { width: 24, height: 24, borderRadius: 4 }
              }) : e.createElement(
                "span",
                { style: { fontSize: 18 } },
                "📦"
              ),
              e.createElement(
                x,
                { title: m.name },
                e.createElement(
                  j,
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
                  m.name
                )
              )
            ),
            e.createElement(
              Z,
              {
                type: "secondary",
                style: { fontSize: 11, margin: 0, lineHeight: 1.4 },
                ellipsis: { rows: 2 }
              },
              m.description || "暂无描述"
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
                  H,
                  { color: "geekblue", style: { fontSize: 10 } },
                  m.source
                ),
                m.version ? e.createElement(
                  H,
                  { style: { fontSize: 10 } },
                  `v${m.version}`
                ) : null
              ),
              pe ? e.createElement(
                c,
                {
                  size: "small",
                  disabled: !0,
                  icon: T ? e.createElement(T) : void 0
                },
                pe === "starting" ? "启动中" : "安装中"
              ) : e.createElement(
                c,
                {
                  type: "primary",
                  size: "small",
                  icon: g ? e.createElement(g) : void 0,
                  onClick: (ge) => {
                    ge.stopPropagation(), k(m);
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
    we && !oe ? e.createElement(
      "div",
      { style: { textAlign: "center", marginTop: 16 } },
      e.createElement(
        c,
        { onClick: ce, loading: oe },
        "加载更多"
      )
    ) : null,
    // Detail Drawer
    F ? e.createElement(
      W,
      {
        title: e.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 8 } },
          F.icon_url ? e.createElement("img", {
            src: F.icon_url,
            alt: F.name,
            style: { width: 28, height: 28, borderRadius: 4 }
          }) : e.createElement(
            "span",
            { style: { fontSize: 20 } },
            "📦"
          ),
          e.createElement("span", null, F.name)
        ),
        open: !0,
        onClose: () => he(null),
        width: 480,
        extra: e.createElement(
          c,
          {
            type: "primary",
            icon: g ? e.createElement(g) : void 0,
            onClick: () => {
              k(F);
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
          F.source
        ),
        e.createElement(
          S.Item,
          { label: "描述" },
          F.description || "-"
        ),
        F.version ? e.createElement(
          S.Item,
          { label: "版本" },
          F.version
        ) : null,
        F.author ? e.createElement(
          S.Item,
          { label: "作者" },
          F.author
        ) : null,
        e.createElement(
          S.Item,
          { label: "来源链接" },
          e.createElement(
            "a",
            { href: F.source_url, target: "_blank" },
            F.source_url
          )
        )
      ),
      F.stats ? e.createElement(
        "div",
        { style: { marginTop: 16 } },
        e.createElement(
          j,
          {
            strong: !0,
            style: { display: "block", marginBottom: 8 }
          },
          "统计"
        ),
        e.createElement(
          "div",
          { style: { display: "flex", gap: 12, flexWrap: "wrap" } },
          ...Object.entries(F.stats).map(
            ([m, Y]) => e.createElement(
              "div",
              { key: m, style: { textAlign: "center" } },
              e.createElement(
                "div",
                {
                  style: {
                    fontSize: 18,
                    fontWeight: 600,
                    color: "#1677ff"
                  }
                },
                String(Y)
              ),
              e.createElement(
                j,
                { type: "secondary", style: { fontSize: 11 } },
                m
              )
            )
          )
        )
      ) : null
    ) : null
  ), et = l(() => {
    if (!le.trim()) return nt;
    const m = le.toLowerCase();
    return nt.filter(
      (Y) => Y.name.toLowerCase().includes(m) || Y.description.toLowerCase().includes(m) || Y.category.toLowerCase().includes(m)
    );
  }, [le]), Xe = async (m) => {
    try {
      const Y = await te("/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: m.name,
          description: m.description,
          skill_names: m.recommendedSkills
        })
      });
      await qe(Y.id, "AGENTS.md", m.systemPrompt);
      const pe = await Ye(Y.id);
      pe.approval_level = m.approvalLevel, await te(`/agents/${encodeURIComponent(Y.id)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pe)
      }), p.success(`专家「${m.name}」创建成功，已跳转至专家`), xe("/ugsci-experts");
    } catch (Y) {
      p.error(Y.message || "创建专家失败");
    }
  }, He = e.createElement(
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
        j,
        { style: { fontSize: 13, color: "#1f4e8c" } },
        "从专家模板库选择预设专家，一键创建并配置系统提示词、审批级别和推荐技能。未来将支持从远程市场获取更多行业专家模板。"
      )
    ),
    e.createElement(f, {
      placeholder: "搜索专家模板...",
      prefix: N ? e.createElement(N) : void 0,
      value: le,
      onChange: (m) => me(m.target.value),
      allowClear: !0,
      style: { marginBottom: 16, maxWidth: 400 }
    }),
    e.createElement(
      P,
      { gutter: [12, 12] },
      ...et.map(
        (m) => e.createElement(
          v,
          { key: m.id, xs: 24, sm: 12, md: 8 },
          e.createElement(
            E,
            {
              hoverable: !0,
              size: "small",
              style: { height: "100%", cursor: "pointer" },
              onClick: () => Xe(m)
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
                m.emoji
              ),
              e.createElement(
                "div",
                { style: { flex: 1 } },
                e.createElement(
                  j,
                  { strong: !0, style: { fontSize: 14 } },
                  m.name
                ),
                e.createElement(
                  "div",
                  { style: { display: "flex", gap: 4, marginTop: 4 } },
                  e.createElement(
                    H,
                    { color: "blue", style: { fontSize: 10 } },
                    m.category
                  ),
                  m.approvalLevel === "MANUAL" ? e.createElement(
                    H,
                    { color: "orange", style: { fontSize: 10 } },
                    "需审批"
                  ) : e.createElement(
                    H,
                    { color: "green", style: { fontSize: 10 } },
                    "自动"
                  )
                )
              )
            ),
            e.createElement(
              Z,
              {
                type: "secondary",
                style: { fontSize: 12, margin: 0, lineHeight: 1.5 },
                ellipsis: { rows: 3 }
              },
              m.description.replace(/\*\*(.+?)\*\*/g, "$1")
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
                j,
                { type: "secondary", style: { fontSize: 11 } },
                `推荐 ${m.recommendedSkills.length} 个技能`
              ),
              e.createElement(
                c,
                {
                  type: "primary",
                  size: "small",
                  icon: z ? e.createElement(z) : void 0
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
      I ? e.createElement(I, {
        style: { fontSize: 24, color: "#bfbfbf", marginBottom: 8 }
      }) : null,
      e.createElement(
        j,
        { type: "secondary", style: { fontSize: 12 } },
        "更多专家模板持续更新中，未来将支持 OpenScience、RPA 等行业扩展"
      )
    )
  ), Mt = [
    {
      key: "skills",
      label: e.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        z ? e.createElement(z, { style: { fontSize: 14 } }) : null,
        "技能市场"
      ),
      children: Ze
    },
    {
      key: "experts",
      label: e.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        w ? e.createElement(w, { style: { fontSize: 14 } }) : null,
        "专家模板"
      ),
      children: He
    }
  ];
  return e.createElement(
    "div",
    { style: { padding: 24 } },
    e.createElement(Qe, {
      title: "市场",
      subtitle: "浏览技能市场 · 选择专家模板 · 随时更新能力和专家",
      extra: e.createElement(
        "div",
        { style: { display: "flex", gap: 8 } },
        e.createElement(
          c,
          {
            icon: L ? e.createElement(L) : void 0,
            onClick: () => Be(!0)
          },
          "配置源"
        ),
        e.createElement(
          c,
          {
            type: "primary",
            icon: B ? e.createElement(B) : void 0,
            onClick: () => {
              G(C, y, {}), je();
            },
            loading: oe || Ne
          },
          "刷新"
        )
      )
    }),
    e.createElement(V, {
      items: Mt,
      activeKey: u,
      onChange: (m) => ee(m)
    }),
    // Source config modal
    e.createElement(Hn, {
      open: We,
      onClose: () => Be(!1),
      sources: de,
      onChange: (m) => {
        fe(m), je(m);
      }
    })
  );
}
function Kn() {
  var c;
  const e = window.QwenPaw;
  if (!(e != null && e.menu) || !(e != null && e.route)) {
    console.warn(
      "[ugsci] QwenPaw.menu/route API not available — plugin disabled"
    );
    return;
  }
  const t = h().React, a = "ugsci", n = h().antdIcons || {}, l = n.UserSwitchOutlined, r = n.ToolOutlined, s = n.ThunderboltOutlined, i = n.ShopOutlined;
  e.route.add(a, {
    id: "ugsci.experts",
    path: "/ugsci-experts",
    component: Tn
  }), e.menu.add(a, {
    id: "ugsci.experts",
    location: "primary.agentScoped",
    label: () => "专家",
    icon: l ? t.createElement(l, { style: { fontSize: 16 } }) : void 0,
    route: "ugsci.experts",
    order: 5,
    visible: () => Ge()
  }), e.route.add(a, {
    id: "ugsci.capabilities",
    path: "/ugsci-capabilities",
    component: Rn
  }), e.menu.add(a, {
    id: "ugsci.capabilities",
    location: "primary.agentScoped",
    label: () => "工具",
    icon: r ? t.createElement(r, { style: { fontSize: 16 } }) : void 0,
    route: "ugsci.capabilities",
    order: 6,
    visible: () => Ge()
  }), e.route.add(a, {
    id: "ugsci.skills-center",
    path: "/ugsci-skills",
    component: jn
  }), e.menu.add(a, {
    id: "ugsci.skills-center",
    location: "primary.agentScoped",
    label: () => "技能",
    icon: s ? t.createElement(s, { style: { fontSize: 16 } }) : void 0,
    route: "ugsci.skills-center",
    order: 7,
    visible: () => Ge()
  }), e.route.add(a, {
    id: "ugsci.market",
    path: "/ugsci-market",
    component: Xn
  }), e.menu.add(a, {
    id: "ugsci.market",
    location: "primary.agentScoped",
    label: () => "市场",
    icon: i ? t.createElement(i, { style: { fontSize: 16 } }) : void 0,
    route: "ugsci.market",
    order: 8,
    visible: () => Ge()
  }), (c = e.sidebar) != null && c.registerSimpleModeItems ? (e.sidebar.registerSimpleModeItems([
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
  for (const p of f) {
    try {
      const v = e.menu.snapshot("primary.agentScoped").find((E) => E.id === p);
      v && e.menu.replace(a, p, {
        ...v,
        visible: () => !Ge()
      });
    } catch {
    }
    try {
      const v = e.menu.snapshot("primary.settings").find((E) => E.id === p);
      v && e.menu.replace(a, p, {
        ...v,
        visible: () => !Ge()
      });
    } catch {
    }
  }
  console.info(
    "[ugsci] Plugin registered: 4 routes + menu items, simple-mode whitelist + simplified navigation active"
  );
}
function rt() {
  try {
    Kn();
  } catch (e) {
    console.error("[ugsci] Failed to build plugin:", e), setTimeout(rt, 500);
  }
}
var Et;
if ((Et = window.QwenPaw) != null && Et.host)
  rt();
else {
  const e = setInterval(() => {
    var t;
    (t = window.QwenPaw) != null && t.host && (clearInterval(e), rt());
  }, 200);
  setTimeout(() => clearInterval(e), 1e4);
}
