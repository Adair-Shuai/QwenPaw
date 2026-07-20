function h() {
  var t;
  const e = (t = window.QwenPaw) == null ? void 0 : t.host;
  if (!e) throw new Error("[ugsci] QwenPaw.host not available");
  return e;
}
function Bt() {
  try {
    return h().getApiToken() || "";
  } catch {
    return "";
  }
}
function ot(e) {
  return h().getApiUrl(e);
}
function vt(e) {
  const t = Bt();
  return {
    "Content-Type": "application/json",
    ...t ? { Authorization: `Bearer ${t}` } : {},
    ...e
  };
}
async function te(e, t) {
  const a = await fetch(ot(e), {
    ...t,
    headers: { ...vt(), ...(t == null ? void 0 : t.headers) || {} }
  });
  if (!a.ok) {
    const n = await a.text().catch(() => "");
    throw new Error(n || `HTTP ${a.status}`);
  }
  return a.status === 204 ? null : a.json();
}
async function st() {
  const e = await te("/agents");
  return (e == null ? void 0 : e.agents) || [];
}
async function Ye(e) {
  return te(`/agents/${encodeURIComponent(e)}`);
}
async function it(e) {
  return await te("/skills", {
    headers: { "X-Agent-Id": e }
  }) || [];
}
async function ct() {
  return await te("/skills/pool") || [];
}
async function jt() {
  return await te("/skills/workspaces") || [];
}
async function Dt(e) {
  return await te("/mcp", {
    headers: { "X-Agent-Id": e }
  }) || [];
}
async function Nt(e, t) {
  return te(
    `/mcp/toggle/${encodeURIComponent(t)}`,
    {
      method: "PATCH",
      headers: { "X-Agent-Id": e }
    }
  );
}
async function Ut(e, t) {
  await te(`/mcp/${encodeURIComponent(t)}`, {
    method: "DELETE",
    headers: { "X-Agent-Id": e }
  });
}
async function Ft(e, t, a) {
  return te("/mcp", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify({ client_key: t, client: a })
  });
}
async function Ht(e, t) {
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
function mt(e, t) {
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
const Wt = [
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
async function Gt(e, t) {
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
  await fetch(ot("/console/chat"), {
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
function Jt(e) {
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
function Xt({ team: e }) {
  const t = h().React, { Typography: a, Tag: n } = h().antd, { Text: l } = a, r = {
    pipeline: "→",
    roundtable: "⇄",
    coordinator: "⊙"
  }, s = {
    pipeline: "#13c2c2",
    roundtable: "#722ed1",
    coordinator: "#1677ff"
  }, i = e.steps || [], E = i.length > 0;
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
      ...E ? i.map((c, d) => {
        const T = e.members.find(
          (v) => v.name === c.agentName
        );
        return [
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
            t.createElement(
              "span",
              { style: { fontSize: 16 } },
              (T == null ? void 0 : T.emoji) || "👤"
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
      }).flat() : e.members.map((c, d) => [
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
function Kt({
  open: e,
  onClose: t,
  agents: a,
  editingTeam: n,
  onSaved: l
}) {
  const r = h().React, { useState: s, useEffect: i, useCallback: E } = r, {
    Modal: c,
    Input: d,
    Button: T,
    Select: v,
    Tag: f,
    Typography: N,
    Switch: b,
    Empty: A,
    message: O,
    Divider: W,
    Steps: w
  } = h().antd, { PlusOutlined: V, DeleteOutlined: R, SaveOutlined: P, ArrowRightOutlined: B } = h().antdIcons || {}, { Text: U, Paragraph: y } = N, [I, _] = s(""), [q, z] = s("🤝"), [x, u] = s(""), [L, j] = s(
    "pipeline"
  ), [Z, M] = s(""), [p, ee] = s(""), [o, ae] = s([]), [F, Q] = s([]), [J, K] = s(!1);
  i(() => {
    e && (n ? (_(n.name), z(n.emoji), u(n.description), j(n.mode), M(n.coordinatorName || ""), ee(n.taskTemplate), ae(n.steps || []), Q(n.members.map((D) => D.name))) : (_(""), z("🤝"), u(""), j("pipeline"), M(""), ee(`请执行以下任务：
任务描述：{任务描述}`), ae([]), Q([])));
  }, [e, n]);
  const C = E(() => {
    if (L === "roundtable") {
      const D = F.map(($) => ({
        agentName: $,
        instruction: "请给出你的专业评估意见",
        passContext: !1
      }));
      ae(D);
    } else if (L === "pipeline") {
      const D = new Map(o.map((ne) => [ne.agentName, ne])), $ = F.map((ne) => D.get(ne) || {
        agentName: ne,
        instruction: "请完成你的专业部分",
        passContext: !0
      });
      ae($);
    }
  }, [L, F, o]), re = (D) => {
    F.includes(D) || (Q([...F, D]), L === "coordinator" && !Z && M(D));
  }, g = (D) => {
    Q(F.filter(($) => $ !== D)), ae(o.filter(($) => $.agentName !== D)), Z === D && M(F[0] || "");
  }, se = (D, $, ne) => {
    const H = [...o];
    H[D] = { ...H[D], [$]: ne }, ae(H);
  }, oe = () => {
    if (!I.trim()) {
      O.warning("请输入团队名称");
      return;
    }
    if (F.length < 2) {
      O.warning("至少需要选择 2 个成员");
      return;
    }
    if (!p.trim()) {
      O.warning("请输入任务模板");
      return;
    }
    if (L === "coordinator" && !Z) {
      O.warning("请选择协调者");
      return;
    }
    K(!0);
    try {
      const D = F.map(
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
      (o.length === 0 || o.length !== F.length) && ($ = F.map((Ee) => ({
        agentName: Ee,
        instruction: "请完成你的专业部分",
        passContext: L === "pipeline"
      })));
      const ne = {
        id: (n == null ? void 0 : n.id) || `custom-${Date.now()}`,
        name: I.trim(),
        emoji: q,
        category: "自定义",
        description: x.trim() || `${I.trim()}（${F.length}人团队）`,
        mode: L,
        members: D,
        coordinatorName: L === "coordinator" ? Z : void 0,
        taskTemplate: p.trim(),
        orchestrationPrompt: "",
        // Custom teams use steps-based instructions
        steps: $,
        custom: !0,
        createdAt: (n == null ? void 0 : n.createdAt) || Date.now()
      }, H = Ke(), he = H.findIndex((Ee) => Ee.id === ne.id);
      he >= 0 ? H[he] = ne : H.push(ne), St(H), O.success(n ? "团队已更新" : "团队已创建"), l(), t();
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
    (D) => !F.includes(D.name)
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
        icon: P ? r.createElement(P) : void 0
      }
    },
    // Step 1: Basic info
    r.createElement(
      "div",
      { style: { marginBottom: 16 } },
      r.createElement(
        U,
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
          onChange: (D) => z(D),
          style: { width: 60 },
          options: Se.map((D) => ({ value: D, label: D })),
          optionRender: (D) => r.createElement("span", { style: { fontSize: 18 } }, D.value)
        }),
        r.createElement(d, {
          placeholder: "团队名称（如：储层评价团队）",
          value: I,
          onChange: (D) => _(D.target.value),
          style: { flex: 1 }
        })
      ),
      r.createElement(d.TextArea, {
        placeholder: "团队描述（简述团队的目标和适用场景）",
        value: x,
        onChange: (D) => u(D.target.value),
        rows: 2,
        style: { marginBottom: 8 }
      }),
      r.createElement(
        "div",
        { style: { display: "flex", gap: 8, alignItems: "center" } },
        r.createElement(
          U,
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
        U,
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
            T,
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
      F.length === 0 ? r.createElement(A, {
        description: "请从上方添加团队成员",
        image: A.PRESENTED_IMAGE_SIMPLE
      }) : r.createElement(
        "div",
        { style: { display: "flex", flexDirection: "column", gap: 4 } },
        ...F.map(
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
                U,
                { strong: !0, style: { fontSize: 13 } },
                D
              ),
              L === "coordinator" && Z === D ? r.createElement(
                f,
                { color: "blue", style: { fontSize: 10 } },
                "协调者"
              ) : null
            ),
            r.createElement(
              "div",
              { style: { display: "flex", gap: 4 } },
              L === "coordinator" ? r.createElement(
                T,
                {
                  size: "small",
                  type: "link",
                  onClick: () => M(D)
                },
                "设为协调者"
              ) : null,
              r.createElement(
                T,
                {
                  size: "small",
                  type: "link",
                  danger: !0,
                  icon: R ? r.createElement(R) : void 0,
                  onClick: () => g(D)
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
    F.length > 0 ? r.createElement(
      "div",
      { style: { marginBottom: 16 } },
      r.createElement(
        U,
        {
          strong: !0,
          style: { display: "block", marginBottom: 8, fontSize: 13 }
        },
        `3. 编排执行步骤${L === "roundtable" ? "（各步独立执行）" : L === "pipeline" ? "（依次执行，可传递上下文）" : "（由协调者决定调用顺序）"}`
      ),
      // Auto-sync button
      r.createElement(
        T,
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
        U,
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
                f,
                { color: "blue", style: { fontSize: 11 } },
                D.agentName
              ),
              r.createElement(
                "div",
                { style: { flex: 1 } },
                r.createElement(d, {
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
              r.createElement(b, {
                size: "small",
                checked: D.passContext,
                onChange: (ne) => se($, "passContext", ne)
              }),
              r.createElement(
                U,
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
        U,
        {
          strong: !0,
          style: { display: "block", marginBottom: 8, fontSize: 13 }
        },
        `${F.length > 0 ? "4" : "3"}. 任务模板`
      ),
      r.createElement(d.TextArea, {
        placeholder: `输入任务模板，可用 {参数名} 作为占位符...

例如：
请对区块 {区块名} 的井 {井号} 进行储层评价`,
        value: p,
        onChange: (D) => ee(D.target.value),
        rows: 4,
        style: { fontFamily: "monospace", fontSize: 13 }
      }),
      r.createElement(
        U,
        {
          type: "secondary",
          style: { fontSize: 11, display: "block", marginTop: 4 }
        },
        "占位符 {参数名} 在发起任务时可由用户填写替换"
      )
    )
  );
}
function dt({
  team: e,
  agents: t,
  onLaunch: a,
  onEdit: n,
  onDelete: l
}) {
  var x;
  const r = h().React, { useState: s } = r, { Card: i, Tag: E, Typography: c, Button: d, Tooltip: T } = h().antd, {
    TeamOutlined: v,
    RocketOutlined: f,
    UserOutlined: N,
    EditOutlined: b,
    DeleteOutlined: A,
    DownOutlined: O,
    UpOutlined: W
  } = h().antdIcons || {}, { Text: w, Paragraph: V } = c, [R, P] = s(!1), B = {
    coordinator: { label: "协调者模式", color: "blue" },
    pipeline: { label: "流水线模式", color: "cyan" },
    roundtable: { label: "圆桌讨论", color: "purple" }
  }, U = B[e.mode] || B.coordinator, y = e.members.map((u) => {
    const L = Ve(t, u.name);
    return { ...u, found: !!L, agentId: L };
  }), I = y.filter((u) => u.found).length, _ = I === e.members.length, q = e.coordinatorName || ((x = e.members[0]) == null ? void 0 : x.name), z = q ? Ve(t, q) : null;
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
            w,
            { strong: !0, style: { fontSize: 14 } },
            e.name
          ),
          e.custom ? r.createElement(
            E,
            { color: "gold", style: { fontSize: 9 } },
            "自定义"
          ) : null
        ),
        r.createElement(
          "div",
          { style: { display: "flex", gap: 4, marginTop: 4 } },
          r.createElement(
            E,
            { color: U.color, style: { fontSize: 10 } },
            U.label
          ),
          r.createElement(
            E,
            { style: { fontSize: 10 } },
            `${I}/${e.members.length}`
          ),
          _ ? null : r.createElement(
            E,
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
          T,
          { title: "编辑" },
          r.createElement(d, {
            type: "text",
            size: "small",
            icon: b ? r.createElement(b) : void 0,
            onClick: (u) => {
              u.stopPropagation(), n(e);
            }
          })
        ) : null,
        l ? r.createElement(
          T,
          { title: "删除" },
          r.createElement(d, {
            type: "text",
            size: "small",
            danger: !0,
            icon: A ? r.createElement(A) : void 0,
            onClick: (u) => {
              u.stopPropagation(), l(e);
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
      ...y.map(
        (u) => r.createElement(
          T,
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
            r.createElement("span", null, u.emoji),
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
          u.stopPropagation(), P(!R);
        },
        icon: R ? W ? r.createElement(W) : "▲" : O ? r.createElement(O) : "▼"
      },
      R ? "收起流程" : "查看执行流程"
    ),
    R ? r.createElement(Xt, { team: e }) : null,
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
        q ? `协调者: ${q}` : ""
      ),
      r.createElement(
        d,
        {
          type: "primary",
          size: "small",
          icon: f ? r.createElement(f) : void 0,
          disabled: !z,
          onClick: () => a(e),
          style: Re
        },
        "发起团队任务"
      )
    )
  );
}
function Vt({
  agents: e,
  onLaunch: t
}) {
  const a = h().React, { useMemo: n, useState: l, useCallback: r, useEffect: s } = a, {
    Row: i,
    Col: E,
    Input: c,
    Empty: d,
    Typography: T,
    Tag: v,
    Button: f,
    Divider: N,
    message: b,
    Popconfirm: A
  } = h().antd, { SearchOutlined: O, TeamOutlined: W, PlusOutlined: w, RocketOutlined: V } = h().antdIcons || {}, { Text: R } = T, [P, B] = l(""), [U, y] = l([]), [I, _] = l(!1), [q, z] = l(null);
  s(() => {
    y(Ke());
  }, []);
  const x = r(() => {
    y(Ke());
  }, []), u = r(
    (o) => {
      const F = Ke().filter((Q) => Q.id !== o.id);
      St(F), y(F), b.success(`团队「${o.name}」已删除`);
    },
    [b]
  ), L = r((o) => {
    z(o), _(!0);
  }, []), j = r(() => {
    z(null), _(!0);
  }, []), Z = n(() => [...U, ...Wt], [U]), M = n(() => {
    if (!P.trim()) return Z;
    const o = P.toLowerCase();
    return Z.filter(
      (ae) => ae.name.toLowerCase().includes(o) || ae.description.toLowerCase().includes(o) || ae.category.toLowerCase().includes(o)
    );
  }, [Z, P]), p = M.filter((o) => o.custom), ee = M.filter((o) => !o.custom);
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
        f,
        {
          type: "primary",
          size: "small",
          icon: w ? a.createElement(w) : void 0,
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
      value: P,
      onChange: (o) => B(o.target.value),
      allowClear: !0,
      style: { marginBottom: 16, maxWidth: 400 }
    }),
    // Custom teams section
    p.length > 0 ? a.createElement(
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
          `自定义团队 (${p.length})`
        )
      ),
      a.createElement(
        i,
        { gutter: [12, 12] },
        ...p.map(
          (o) => a.createElement(
            E,
            { key: o.id, xs: 24, sm: 12, md: 8 },
            a.createElement(dt, {
              team: o,
              agents: e,
              onLaunch: t,
              onEdit: L,
              onDelete: u
            })
          )
        )
      ),
      a.createElement(N, { style: { margin: "16px 0" } })
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
            E,
            { key: o.id, xs: 24, sm: 12, md: 8 },
            a.createElement(dt, {
              team: o,
              agents: e,
              onLaunch: t
            })
          )
        )
      )
    ) : null,
    // Empty state
    M.length === 0 ? a.createElement(d, {
      description: "未找到匹配的专家团队，点击「创建专家团」自定义",
      image: d.PRESENTED_IMAGE_SIMPLE
    }) : null,
    // Team Builder Modal
    a.createElement(Kt, {
      open: I,
      onClose: () => {
        _(!1), z(null);
      },
      agents: e,
      editingTeam: q,
      onSaved: x
    })
  );
}
function qt(e) {
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
async function Yt(e) {
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
async function ut(e, t) {
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
async function Qt(e, t) {
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
async function Zt(e, t) {
  return te("/skills/batch-enable", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify(t)
  });
}
async function en(e, t) {
  return te("/skills/batch-disable", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify(t)
  });
}
async function tn(e, t) {
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
async function nn(e, t) {
  return te("/mcp", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify(t)
  });
}
async function ln(e, t) {
  return te(
    `/mcp/toggle/${encodeURIComponent(t)}`,
    {
      method: "PATCH",
      headers: { "X-Agent-Id": e }
    }
  );
}
async function an(e, t) {
  await te(`/skills/${encodeURIComponent(t)}/disable`, {
    method: "POST",
    headers: { "X-Agent-Id": e }
  });
}
function rn(e) {
  const t = (e || "").trim();
  if (!t) return { number: 6, unit: "h" };
  const a = t.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/i);
  if (!a) return { number: 6, unit: "h" };
  const n = parseInt(a[1] || "0", 10), l = parseInt(a[2] || "0", 10), r = parseInt(a[3] || "0", 10), s = n * 60 + l + Math.round(r / 60);
  return s <= 0 ? { number: 6, unit: "h" } : s >= 60 && s % 60 === 0 ? { number: s / 60, unit: "h" } : { number: s, unit: "m" };
}
function on(e) {
  return e.unit === "h" ? `${e.number}h` : `${e.number}m`;
}
async function sn(e) {
  return te("/config/heartbeat", {
    headers: { "X-Agent-Id": e }
  });
}
async function cn(e, t) {
  return te("/config/heartbeat", {
    method: "PUT",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify(t)
  });
}
async function mn(e) {
  await te("/config/heartbeat/run", {
    method: "POST",
    headers: { "X-Agent-Id": e }
  });
}
async function dn(e) {
  return te("/workspace/running-config", {
    headers: { "X-Agent-Id": e }
  });
}
async function un(e, t) {
  return te("/workspace/running-config", {
    method: "PUT",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify(t)
  });
}
async function pn(e) {
  return (await te("/workspace/language", {
    headers: { "X-Agent-Id": e }
  })).language || "zh";
}
async function gn(e, t) {
  await te("/workspace/language", {
    method: "PUT",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify({ language: t })
  });
}
async function yn() {
  return (await te("/config/user-timezone")).timezone || "UTC";
}
async function fn(e) {
  await te("/config/user-timezone", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ timezone: e })
  });
}
async function En(e) {
  return await te("/workspace/system-prompt-files", {
    headers: { "X-Agent-Id": e }
  }) || [];
}
const pt = ["AGENTS.md", "SOUL.md", "PROFILE.md"];
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
function gt({
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
  const s = h().React, { useState: i, useEffect: E, useMemo: c } = s, { Modal: d, Button: T, Empty: v, Spin: f, Input: N, Tag: b, Tooltip: A, Typography: O } = h().antd, { CheckOutlined: W, SearchOutlined: w } = h().antdIcons || {}, { Text: V } = O, [R, P] = i([]), [B, U] = i("");
  E(() => {
    e && (P([]), U(""));
  }, [e]);
  const y = c(() => {
    if (!B.trim()) return a;
    const z = B.toLowerCase();
    return a.filter(
      (x) => {
        var u, L;
        return x.name.toLowerCase().includes(z) || ((u = x.description) == null ? void 0 : u.toLowerCase().includes(z)) || ((L = x.tags) == null ? void 0 : L.some((j) => j.toLowerCase().includes(z)));
      }
    );
  }, [a, B]), I = y.filter(
    (z) => !n.includes(z.name)
  ), _ = (z) => {
    P(
      (x) => x.includes(z) ? x.filter((u) => u !== z) : [...x, z]
    );
  }, q = async () => {
    R.length !== 0 && (await r(R), P([]));
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
          V,
          { type: "secondary", style: { fontSize: 13 } },
          `已选择 ${R.length} 个技能`
        ),
        s.createElement(
          "div",
          { style: { display: "flex", gap: 8 } },
          s.createElement(T, { onClick: t }, "取消"),
          s.createElement(
            T,
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
      s.createElement(N, {
        placeholder: "搜索技能名称、描述或标签...",
        prefix: w ? s.createElement(w) : void 0,
        value: B,
        onChange: (z) => U(z.target.value),
        allowClear: !0,
        style: { flex: 1 }
      }),
      s.createElement(
        T,
        {
          size: "small",
          type: "primary",
          onClick: () => P(I.map((z) => z.name))
        },
        "全选"
      ),
      s.createElement(
        T,
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
      s.createElement(f, { size: "large" })
    ) : y.length === 0 ? s.createElement(v, {
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
      ...y.map((z) => {
        const x = R.includes(z.name), u = n.includes(z.name);
        return s.createElement(
          "div",
          {
            key: z.name,
            onClick: () => !u && _(z.name),
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
            W ? s.createElement(W) : "✓"
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
              z.emoji || "⚡"
            ),
            s.createElement(
              A,
              { title: z.name },
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
                z.name
              )
            )
          ),
          z.description ? s.createElement(
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
            z.description
          ) : null,
          z.tags && z.tags.length > 0 ? s.createElement(
            "div",
            {
              style: {
                marginTop: 4,
                display: "flex",
                gap: 2,
                flexWrap: "wrap"
              }
            },
            ...z.tags.slice(0, 2).map(
              (L, j) => s.createElement(
                b,
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
function hn({ agentId: e }) {
  const t = h().React, { useState: a, useEffect: n, useCallback: l } = t, {
    Switch: r,
    InputNumber: s,
    Select: i,
    Button: E,
    Spin: c,
    Space: d,
    Typography: T,
    message: v
  } = h().antd, { PlayCircleOutlined: f, SaveOutlined: N } = h().antdIcons || {}, { Text: b } = T, [A, O] = a(!0), [W, w] = a(!1), [V, R] = a(!1), [P, B] = a(!1), [U, y] = a(6), [I, _] = a("h"), [q, z] = a("main"), [x, u] = a(300), [L, j] = a(!1), [Z, M] = a("08:00"), [p, ee] = a("22:00"), o = l(async () => {
    var C, re;
    O(!0);
    try {
      const g = await sn(e), se = rn(g.every ?? "6h");
      B(g.enabled ?? !1), y(se.number), _(se.unit), z(g.target ?? "main"), u(g.timeoutSeconds ?? 300), j(!!g.activeHours), M(((C = g.activeHours) == null ? void 0 : C.start) ?? "08:00"), ee(((re = g.activeHours) == null ? void 0 : re.end) ?? "22:00");
    } catch (g) {
      v.error(g.message || "加载心跳配置失败");
    } finally {
      O(!1);
    }
  }, [e]);
  n(() => {
    o();
  }, [o]);
  const ae = async () => {
    w(!0);
    try {
      await cn(e, {
        enabled: P,
        every: on({ number: U, unit: I }),
        target: q,
        timeoutSeconds: x,
        activeHours: L && Z && p ? { start: Z, end: p } : void 0
      }), v.success("心跳配置已保存");
    } catch (C) {
      v.error(C.message || "保存心跳配置失败");
    } finally {
      w(!1);
    }
  }, F = async () => {
    R(!0);
    try {
      await mn(e), v.success("已触发心跳检查");
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
  const Q = (C, re, g) => t.createElement(
    "div",
    { style: zt },
    t.createElement("div", { style: Je }, C),
    re,
    g ? t.createElement(
      b,
      { type: "secondary", style: _t },
      g
    ) : null
  ), J = (C, re, g, se) => t.createElement(
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
      t.createElement("div", { style: Je }, g),
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
        checked: P,
        onChange: (C) => B(C)
      }),
      P ? "已启用，专家将定期自检" : "已停用"
    ),
    J(
      "检查频率",
      t.createElement(
        d,
        null,
        t.createElement(s, {
          min: 1,
          value: U,
          onChange: (C) => y(C ?? 1),
          style: { width: "100%" }
        }),
        t.createElement(i, {
          value: I,
          onChange: (C) => _(C),
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
        onChange: (C) => z(C),
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
        value: x,
        onChange: (C) => u(C ?? 300),
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
        value: p,
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
        E,
        {
          type: "primary",
          icon: N ? t.createElement(N) : void 0,
          loading: W,
          onClick: ae,
          style: Re
        },
        "保存配置"
      ),
      t.createElement(
        E,
        {
          icon: f ? t.createElement(f) : void 0,
          loading: V,
          onClick: F
        },
        "立即执行"
      )
    )
  );
}
function vn({
  agentId: e,
  onRefresh: t
}) {
  const a = h().React, { useState: n, useEffect: l, useCallback: r } = a, {
    List: s,
    Tag: i,
    Switch: E,
    Button: c,
    Empty: d,
    Spin: T,
    Typography: v,
    message: f
  } = h().antd, { PlusOutlined: N, ReloadOutlined: b, DeleteOutlined: A } = h().antdIcons || {}, { Text: O, Paragraph: W } = v, [w, V] = n([]), [R, P] = n(!0), [B, U] = n(!1), [y, I] = n([]), [_, q] = n(!1), z = r(async () => {
    P(!0);
    try {
      const M = await it(e);
      V(M);
    } catch (M) {
      f.error(M.message || "加载技能失败"), V([]);
    } finally {
      P(!1);
    }
  }, [e]);
  l(() => {
    z();
  }, [z]);
  const x = async () => {
    U(!0), q(!0);
    try {
      const M = await ct();
      I(M);
    } catch (M) {
      f.error(M.message || "加载技能池失败");
    } finally {
      q(!1);
    }
  }, u = async (M) => {
    let p = 0, ee = 0;
    for (const o of M)
      try {
        await wt(e, o), p++;
      } catch {
        ee++;
      }
    p > 0 ? (f.success(
      `成功添加 ${p} 个技能${ee > 0 ? `，${ee} 个失败` : ""}`
    ), z(), t()) : ee > 0 && f.error("添加技能失败"), U(!1);
  }, L = async (M, p) => {
    try {
      p ? await Qt(e, M.name) : await an(e, M.name), f.success(p ? "已启用" : "已停用"), z(), t();
    } catch (ee) {
      f.error(ee.message || "操作失败");
    }
  }, j = async (M) => {
    try {
      await xt(e, M), f.success(`技能「${M}」已移除`), z(), t();
    } catch (p) {
      f.error(p.message || "移除技能失败");
    }
  };
  if (R)
    return a.createElement(
      "div",
      { style: { textAlign: "center", padding: 40 } },
      a.createElement(T, { size: "large" })
    );
  const Z = w.filter((M) => M.enabled !== !1);
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
        `技能列表 (${w.length}，已启用 ${Z.length})`
      ),
      a.createElement(
        "div",
        { style: { display: "flex", gap: 8 } },
        a.createElement(
          c,
          {
            size: "small",
            icon: b ? a.createElement(b) : void 0,
            onClick: z
          },
          "刷新"
        ),
        a.createElement(
          c,
          {
            type: "primary",
            size: "small",
            icon: N ? a.createElement(N) : void 0,
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
      renderItem: (M) => a.createElement(
        s.Item,
        {
          actions: [
            a.createElement(E, {
              key: "toggle",
              size: "small",
              checked: M.enabled !== !1,
              onChange: (p) => L(M, p)
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
      onClose: () => U(!1),
      poolSkills: y,
      installedSkillNames: w.map((M) => M.name),
      loading: _,
      onInstall: u
    })
  );
}
function bn({
  agentId: e,
  onRefresh: t,
  isActive: a
}) {
  const n = h().React, { useState: l, useEffect: r, useCallback: s } = n, {
    List: i,
    Tag: E,
    Button: c,
    Empty: d,
    Spin: T,
    Modal: v,
    Input: f,
    Typography: N,
    message: b
  } = h().antd, { PlusOutlined: A, ReloadOutlined: O, DeleteOutlined: W } = h().antdIcons || {}, { Text: w, Paragraph: V } = N, { TextArea: R } = f, [P, B] = l([]), [U, y] = l(!0), [I, _] = l(!1), [q, z] = l(`{
  "mcpServers": {
    "example-client": {
      "command": "npx",
      "args": ["-y", "@example/mcp-server"],
      "env": {}
    }
  }
}`), [x, u] = l(!1), L = s(async () => {
    y(!0);
    try {
      const p = await Ct(e);
      B(p);
    } catch (p) {
      b.error(p.message || "加载 MCP 失败"), B([]);
    } finally {
      y(!1);
    }
  }, [e]);
  r(() => {
    L();
  }, [L]), r(() => {
    a && L();
  }, [a, L]);
  const j = async (p) => {
    try {
      await ln(e, p), b.success("已切换 MCP 状态"), L(), t();
    } catch (ee) {
      b.error(ee.message || "切换失败");
    }
  }, Z = async (p) => {
    try {
      await kt(e, p), b.success(`MCP「${p}」已移除`), L(), t();
    } catch (ee) {
      b.error(ee.message || "移除 MCP 失败");
    }
  }, M = async () => {
    u(!0);
    try {
      const p = JSON.parse(q), ee = p.mcpServers || p, o = Object.entries(ee);
      if (o.length === 0) {
        b.warning("未找到 MCP 客户端配置");
        return;
      }
      for (const [ae, F] of o) {
        const Q = F, J = Q.url ? "streamable_http" : "stdio";
        await nn(e, {
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
      b.success("MCP 客户端已创建"), _(!1), L(), t();
    } catch (p) {
      p instanceof SyntaxError ? b.error("JSON 格式错误：" + p.message) : b.error(p.message || "创建 MCP 失败");
    } finally {
      u(!1);
    }
  };
  return U ? n.createElement(
    "div",
    { style: { textAlign: "center", padding: 40 } },
    n.createElement(T, { size: "large" })
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
            onClick: () => _(!0),
            style: Re
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
      renderItem: (p) => n.createElement(
        i.Item,
        {
          actions: [
            n.createElement(
              c,
              {
                key: "toggle",
                size: "small",
                onClick: () => j(p.key)
              },
              p.enabled ? "停用" : "启用"
            ),
            n.createElement(
              c,
              {
                key: "del",
                type: "link",
                size: "small",
                danger: !0,
                icon: W ? n.createElement(W) : void 0,
                onClick: () => Z(p.key)
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
            n.createElement(w, { strong: !0 }, p.name || p.key),
            n.createElement(
              E,
              {
                color: p.enabled ? "green" : "default",
                style: { fontSize: 10 }
              },
              p.enabled ? "启用" : "停用"
            ),
            n.createElement(
              E,
              { color: "purple", style: { fontSize: 10 } },
              p.transport
            )
          ),
          p.description ? n.createElement(
            V,
            {
              type: "secondary",
              style: { fontSize: 12, margin: 0 },
              ellipsis: { rows: 2 }
            },
            p.description
          ) : null,
          p.tools && p.tools.length > 0 ? n.createElement(
            "div",
            { style: { marginTop: 4, fontSize: 11, color: "#8c8c8c" } },
            `提供 ${p.tools.length} 个工具`
          ) : null
        )
      )
    }),
    // Create MCP modal
    n.createElement(
      v,
      {
        open: I,
        title: "添加 MCP 客户端 (JSON)",
        onCancel: () => _(!1),
        onOk: M,
        confirmLoading: x,
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
        onChange: (p) => z(p.target.value),
        rows: 12,
        style: { fontFamily: "monospace", fontSize: 12 }
      })
    )
  );
}
function Sn({ agentId: e }) {
  const t = h().React, { useState: a, useEffect: n, useCallback: l, useRef: r } = t, {
    Card: s,
    InputNumber: i,
    Input: E,
    Select: c,
    Switch: d,
    Button: T,
    Spin: v,
    Space: f,
    Typography: N,
    Divider: b,
    message: A
  } = h().antd, { SaveOutlined: O } = h().antdIcons || {}, { Text: W } = N, [w, V] = a(!0), [R, P] = a(!1), B = r(null), [U, y] = a(60), [I, _] = a(""), [q, z] = a(!0), [x, u] = a(30), [L, j] = a("zh"), [Z, M] = a("UTC"), [p, ee] = a(!0), [o, ae] = a(100), [F, Q] = a(!0), [J, K] = a(3), [C, re] = a(1), [g, se] = a(!0), [oe, Se] = a(3), [we, D] = a(2), [$, ne] = a(60), [H, he] = a(1), [Ee, ie] = a(0), [Te, _e] = a(1), [X, S] = a(0), [le, me] = a(30), [de, fe] = a(50), [be, Ae] = a("light"), [Ne, Ue] = a("scroll"), [We, Be] = a("remelight"), [Ie, Fe] = a("AUTO"), Le = l(async () => {
    var k, xe, Ce, ze, ke, $e;
    V(!0);
    try {
      const [ue, Ze, et] = await Promise.all([
        dn(e),
        pn(e).catch(() => "zh"),
        yn().catch(() => "UTC")
      ]);
      B.current = ue, y(ue.shell_command_timeout ?? 60), _(ue.shell_command_executable ?? "");
      const Xe = ue.auto_title_config ?? { enabled: !0, timeout_seconds: 30 };
      z(Xe.enabled ?? !0), u(Xe.timeout_seconds ?? 30), j(Ze), M(et);
      const He = ue.loop ?? {};
      ee(((k = He.iteration) == null ? void 0 : k.enabled) ?? !0), ae(((xe = He.iteration) == null ? void 0 : xe.max_iterations) ?? ue.max_iters ?? 100), Q(((Ce = He.doom_loop) == null ? void 0 : Ce.enabled) ?? !0), K(((ze = He.doom_loop) == null ? void 0 : ze.window_size) ?? 3), re(((ke = He.doom_loop) == null ? void 0 : ke.similarity_threshold) ?? 1), se(ue.llm_retry_enabled ?? !0), Se(ue.llm_max_retries ?? 3), D(ue.llm_backoff_base ?? 2), ne(ue.llm_backoff_cap ?? 60), he(ue.llm_max_concurrent ?? 1), ie(ue.llm_max_qpm ?? 0), _e(ue.llm_rate_limit_pause ?? 1), S(ue.llm_rate_limit_jitter ?? 0), me(ue.llm_acquire_timeout ?? 30), fe(ue.history_max_length ?? 50), Ae(ue.context_manager_backend ?? "light"), Ue((($e = ue.light_context_config) == null ? void 0 : $e.strategy) ?? "scroll"), Be(ue.memory_manager_backend ?? "remelight"), Fe(ue.approval_level ?? "AUTO");
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
      P(!0);
      try {
        const ze = {
          ...k,
          max_iters: o,
          loop: {
            ...k.loop ?? {},
            iteration: { enabled: p, max_iterations: o },
            doom_loop: {
              enabled: F,
              window_size: J,
              similarity_threshold: C,
              stages: ((Ce = (xe = k.loop) == null ? void 0 : xe.doom_loop) == null ? void 0 : Ce.stages) ?? []
            }
          },
          shell_command_timeout: U,
          shell_command_executable: I,
          auto_title_config: {
            enabled: q,
            timeout_seconds: x
          },
          llm_retry_enabled: g,
          llm_max_retries: oe,
          llm_backoff_base: we,
          llm_backoff_cap: $,
          llm_max_concurrent: H,
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
        await un(e, ze), B.current = ze, L && await gn(e, L).catch(() => {
        }), Z && await fn(Z).catch(() => {
        }), A.success("运行配置已保存");
      } catch (ze) {
        A.error(ze.message || "保存运行配置失败");
      } finally {
        P(!1);
      }
    }
  };
  if (w)
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
        value: U,
        onChange: (k) => y(k ?? 60),
        style: { width: "100%" }
      }),
      "Shell 可执行文件",
      t.createElement(E, {
        value: I,
        onChange: (k) => _(k.target.value),
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
      t.createElement(f, null, t.createElement(d, {
        checked: q,
        onChange: (k) => z(k)
      })),
      "标题生成超时 (秒)",
      t.createElement(i, {
        min: 5,
        value: x,
        onChange: (k) => u(k ?? 30),
        style: { width: "100%" },
        disabled: !q
      })
    ),
    // ── Section: 审批级别 ──
    t.createElement(b, { style: { margin: "8px 0 16px" } }),
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
    t.createElement(b, { style: { margin: "8px 0 16px" } }),
    t.createElement("div", { style: De }, "迭代与循环"),
    G(
      "启用迭代限制",
      t.createElement(d, {
        checked: p,
        onChange: (k) => ee(k)
      }),
      "停止 Agent 前的最大循环轮次"
    ),
    p ? G(
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
      t.createElement(d, {
        checked: F,
        onChange: (k) => Q(k)
      }),
      "检测并阻止重复操作循环"
    ),
    F ? ce(
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
    t.createElement(b, { style: { margin: "8px 0 16px" } }),
    t.createElement("div", { style: De }, "LLM 重试"),
    G(
      "启用 LLM 重试",
      t.createElement(d, {
        checked: g,
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
        disabled: !g
      }),
      "退避基数 (秒)",
      t.createElement(i, {
        min: 0.1,
        step: 0.1,
        value: we,
        onChange: (k) => D(k ?? 2),
        style: { width: "100%" },
        disabled: !g
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
        disabled: !g
      })
    ),
    // ── Section: LLM 限流 ──
    t.createElement(b, { style: { margin: "8px 0 16px" } }),
    t.createElement("div", { style: De }, "LLM 限流"),
    ce(
      "最大并发数",
      t.createElement(i, {
        min: 1,
        value: H,
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
        onChange: (k) => S(k ?? 0),
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
    t.createElement(b, { style: { margin: "8px 0 16px" } }),
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
        T,
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
function wn({
  expert: e,
  open: t,
  onClose: a,
  onRefresh: n
}) {
  const l = h().React, { useState: r, useEffect: s, useCallback: i } = l, { Modal: E, Tabs: c, Spin: d, Typography: T } = h().antd, { SettingOutlined: v } = h().antdIcons || {}, { Text: f } = T, [N, b] = r([]), [A, O] = r(!1), [W, w] = r("heartbeat"), V = i(async () => {
    if (e) {
      O(!0);
      try {
        const U = await En(e.agent.id);
        b(U);
      } catch {
        b([]);
      } finally {
        O(!1);
      }
    }
  }, [e]);
  if (s(() => {
    t && e && V();
  }, [t, e, V]), !e) return null;
  const { agent: R } = e, P = () => {
    V(), n();
  }, B = [
    {
      key: "heartbeat",
      label: "心跳",
      children: l.createElement(hn, {
        agentId: R.id
      })
    },
    {
      key: "files",
      label: "文件",
      children: A ? l.createElement(
        "div",
        { style: { textAlign: "center", padding: 40 } },
        l.createElement(d, { size: "large" })
      ) : l.createElement(Pt, {
        agentId: R.id,
        systemPromptFiles: N,
        onRefresh: P
      })
    },
    {
      key: "skills",
      label: `技能 (${e.skills.filter((U) => U.enabled !== !1).length})`,
      children: l.createElement(vn, {
        agentId: R.id,
        onRefresh: n
      })
    },
    {
      key: "mcp",
      label: `MCP (${e.mcps.length})`,
      children: l.createElement(bn, {
        agentId: R.id,
        onRefresh: n,
        isActive: W === "mcp"
      })
    },
    {
      key: "running",
      label: "运行配置",
      children: l.createElement(Sn, {
        agentId: R.id
      })
    }
  ];
  return l.createElement(
    E,
    {
      open: t,
      title: l.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 8 } },
        v ? l.createElement(v, { style: { fontSize: 18 } }) : null,
        l.createElement("span", null, `配置 - ${R.name}`),
        l.createElement(
          f,
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
      onChange: (U) => w(U),
      size: "small",
      tabBarStyle: { marginBottom: 16, sticky: 0 }
    })
  );
}
function xn({
  expert: e,
  onClick: t,
  onSummon: a,
  onConfigure: n
}) {
  const l = h().React, { Card: r, Tag: s, Badge: i, Typography: E, Spin: c, Button: d, Tooltip: T } = h().antd, { Text: v } = E, { ThunderboltOutlined: f, SettingOutlined: N } = h().antdIcons || {}, { agent: b, skills: A, mcps: O, loading: W } = e, w = b.enabled, V = A.filter((B) => B.enabled !== !1).map((B) => B.name), R = O.map((B) => B.name || B.key), P = b.active_model ? `${b.active_model.provider_id}/${b.active_model.model}` : null;
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
        l.createElement("span", { style: { fontSize: 20 } }, "🧑‍🔬"),
        l.createElement(
          "div",
          null,
          l.createElement(
            v,
            { strong: !0, style: { fontSize: 15 } },
            b.name
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
            b.id
          )
        )
      ),
      l.createElement(i, {
        status: w ? "success" : "default",
        text: w ? "启用" : "停用"
      })
    ),
    // Description (rendered as markdown)
    b.description ? l.createElement(
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
      mt(b.description, l)
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
    W ? l.createElement(c, { size: "small" }) : l.createElement(
      "div",
      { style: { marginBottom: 6 } },
      l.createElement(
        "div",
        { style: { fontSize: 11, color: "#8c8c8c", marginBottom: 4 } },
        `技能 (${V.length})`
      ),
      l.createElement(gt, {
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
      l.createElement(gt, {
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
        T,
        { title: "配置专家", placement: "top" },
        l.createElement(
          d,
          {
            type: "text",
            size: "small",
            icon: N ? l.createElement(N, {
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
        d,
        {
          type: "primary",
          size: "small",
          icon: f ? l.createElement(f) : void 0,
          disabled: !w,
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
function Cn({
  expert: e,
  open: t,
  onClose: a,
  onRefresh: n
}) {
  const l = h().React, {
    Drawer: r,
    Descriptions: s,
    Tag: i,
    Typography: E,
    Space: c,
    Button: d,
    Empty: T,
    Tabs: v,
    List: f,
    Spin: N,
    Modal: b,
    message: A
  } = h().antd, { Text: O, Paragraph: W } = E, {
    EditOutlined: w,
    ThunderboltOutlined: V,
    FileTextOutlined: R,
    ToolOutlined: P,
    PlusOutlined: B
  } = h().antdIcons || {}, [U, y] = l.useState(!1), [I, _] = l.useState(
    []
  ), [q, z] = l.useState(!1);
  if (!e) return null;
  const { agent: x, config: u, skills: L, mcps: j, loading: Z } = e, M = L.filter((g) => g.enabled !== !1), p = (g) => {
    window.history.pushState({}, "", g), window.dispatchEvent(new PopStateEvent("popstate"));
  }, ee = l.createElement(
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
          i,
          { color: x.enabled ? "green" : "default" },
          x.enabled ? "启用" : "停用"
        )
      ),
      l.createElement(
        s.Item,
        { label: "功能简介" },
        x.description ? mt(x.description, l) : "暂无描述"
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
        R ? l.createElement(R, {
          style: { fontSize: 14, color: "#1677ff" }
        }) : null,
        l.createElement(O, { strong: !0 }, "系统提示词文件")
      ),
      l.createElement(
        c,
        { wrap: !0 },
        ...u.system_prompt_files.map(
          (g, se) => l.createElement(
            i,
            {
              key: se,
              icon: R ? l.createElement(R) : void 0,
              style: { fontSize: 12 }
            },
            g
          )
        )
      )
    ) : null
  ), o = async () => {
    y(!0), z(!0);
    try {
      const g = await ct();
      _(g);
    } catch (g) {
      A.error(g.message || "加载技能池失败");
    } finally {
      z(!1);
    }
  }, ae = async (g) => {
    let se = 0, oe = 0;
    for (const Se of g)
      try {
        await wt(x.id, Se), se++;
      } catch {
        oe++;
      }
    se > 0 ? (A.success(
      `成功添加 ${se} 个技能${oe > 0 ? `，${oe} 个失败` : ""}`
    ), n()) : oe > 0 && A.error("添加技能失败"), y(!1);
  }, F = async (g) => {
    try {
      await xt(x.id, g), A.success(`技能「${g}」已移除`), n();
    } catch (se) {
      A.error(se.message || "移除技能失败");
    }
  }, Q = async (g) => {
    try {
      await kt(x.id, g), A.success(`MCP「${g}」已移除`), n();
    } catch (se) {
      A.error(se.message || "移除 MCP 失败");
    }
  }, J = Z ? l.createElement(
    "div",
    { style: { textAlign: "center", padding: 40 } },
    l.createElement(N, { size: "large" })
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
        d,
        {
          type: "primary",
          size: "small",
          icon: B ? l.createElement(B) : void 0,
          onClick: o
        },
        "从技能池添加"
      )
    ),
    M.length === 0 ? l.createElement(T, {
      description: "该专家暂无已启用的技能",
      image: T.PRESENTED_IMAGE_SIMPLE
    }) : l.createElement(f, {
      dataSource: M,
      renderItem: (g) => l.createElement(
        f.Item,
        {
          actions: [
            l.createElement(
              d,
              {
                type: "link",
                size: "small",
                danger: !0,
                onClick: () => F(g.name)
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
            g.emoji ? l.createElement(
              "span",
              { style: { fontSize: 16 } },
              g.emoji
            ) : null,
            l.createElement(O, { strong: !0 }, g.name),
            g.version_text ? l.createElement(
              i,
              { style: { fontSize: 10 } },
              `v${g.version_text}`
            ) : null
          ),
          g.description ? l.createElement(
            W,
            {
              type: "secondary",
              style: { fontSize: 12, margin: 0 },
              ellipsis: { rows: 2 }
            },
            g.description
          ) : null,
          g.tags && g.tags.length > 0 ? l.createElement(
            "div",
            { style: { marginTop: 4 } },
            ...g.tags.map(
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
      open: U,
      onClose: () => y(!1),
      poolSkills: I,
      installedSkillNames: M.map((g) => g.name),
      loading: q,
      onInstall: ae
    })
  ), K = Z ? l.createElement(
    "div",
    { style: { textAlign: "center", padding: 40 } },
    l.createElement(N, { size: "large" })
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
        d,
        {
          type: "primary",
          size: "small",
          icon: B ? l.createElement(B) : void 0,
          onClick: () => {
            window.history.pushState({}, "", `/agents/${x.id}/mcp`), window.dispatchEvent(new PopStateEvent("popstate"));
          }
        },
        "配置 MCP"
      )
    ),
    j.length === 0 ? l.createElement(T, {
      description: "该专家暂无关联的 MCP 客户端，点击「配置 MCP」添加",
      image: T.PRESENTED_IMAGE_SIMPLE
    }) : l.createElement(f, {
      dataSource: j,
      renderItem: (g) => l.createElement(
        f.Item,
        {
          actions: [
            l.createElement(
              d,
              {
                type: "link",
                size: "small",
                danger: !0,
                onClick: () => Q(g.key)
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
              g.name || g.key
            ),
            l.createElement(
              i,
              {
                color: g.enabled ? "green" : "default",
                style: { fontSize: 10 }
              },
              g.enabled ? "启用" : "停用"
            ),
            l.createElement(
              i,
              { color: "purple", style: { fontSize: 10 } },
              g.transport
            )
          ),
          g.description ? l.createElement(
            W,
            {
              type: "secondary",
              style: { fontSize: 12, margin: 0 },
              ellipsis: { rows: 2 }
            },
            g.description
          ) : null,
          g.tools && g.tools.length > 0 ? l.createElement(
            "div",
            {
              style: {
                marginTop: 4,
                fontSize: 11,
                color: "#8c8c8c"
              }
            },
            `提供 ${g.tools.length} 个工具`
          ) : null
        )
      )
    })
  ), C = u != null && u.tools ? l.createElement(
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
        JSON.stringify(u.tools, null, 2)
      )
    )
  ) : l.createElement(T, {
    description: "暂无工具配置",
    image: T.PRESENTED_IMAGE_SIMPLE
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
      children: l.createElement(zn, {
        skills: M,
        agentId: x.id
      })
    },
    {
      key: "knowledge",
      label: "专家记忆",
      children: l.createElement(Pt, {
        agentId: x.id,
        systemPromptFiles: (u == null ? void 0 : u.system_prompt_files) || [],
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
        l.createElement("span", null, x.name)
      ),
      open: t,
      onClose: a,
      width: 560,
      extra: l.createElement(
        c,
        null,
        l.createElement(
          d,
          {
            size: "small",
            icon: w ? l.createElement(w) : void 0,
            onClick: () => {
              a();
              try {
                const g = h();
                g.setSelectedAgent && g.setSelectedAgent(x.id);
              } catch (g) {
                console.warn("[ugsci] Failed to set selected agent:", g);
              }
              setTimeout(() => p("/agents"), 0);
            }
          },
          "编辑专家"
        ),
        l.createElement(
          d,
          {
            type: "primary",
            size: "small",
            icon: V ? l.createElement(V) : void 0,
            onClick: () => {
              a();
              try {
                const g = h();
                g.setSelectedAgent && g.setSelectedAgent(x.id);
              } catch (g) {
                console.warn("[ugsci] Failed to set selected agent:", g);
              }
              setTimeout(() => p("/chat"), 0);
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
function kn({
  open: e,
  onClose: t,
  onCreated: a
}) {
  const n = h().React, { useState: l } = n, {
    Modal: r,
    Card: s,
    Tag: i,
    Input: E,
    Row: c,
    Col: d,
    Spin: T,
    message: v,
    Typography: f
  } = h().antd, { Text: N } = f, { FileAddOutlined: b } = h().antdIcons || {}, [A, O] = l(!1), [W, w] = l(""), [V, R] = l(!1), P = async (y, I) => {
    O(!0);
    try {
      const _ = await te("/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: y || "新专家",
          description: I || "",
          skill_names: []
        })
      });
      await qe(
        _.id,
        "AGENTS.md",
        `# ${y || "新专家"}

请在此处编写该专家的系统提示词。
`
      ), v.success("专家「" + (y || "新专家") + "」创建成功"), R(!1), t(), a();
    } catch (_) {
      v.error(_.message || "创建专家失败");
    } finally {
      O(!1);
    }
  }, B = nt.filter((y) => {
    if (!W.trim()) return !0;
    const I = W.toLowerCase();
    return y.name.toLowerCase().includes(I) || y.description.toLowerCase().includes(I) || y.category.toLowerCase().includes(I);
  }), U = async (y) => {
    O(!0);
    try {
      const I = await te("/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: y.name,
          description: y.description,
          skill_names: y.recommendedSkills
        })
      });
      await qe(I.id, "AGENTS.md", y.systemPrompt);
      const _ = await Ye(I.id);
      _.approval_level = y.approvalLevel, await te(`/agents/${encodeURIComponent(I.id)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(_)
      }), v.success(`专家「${y.name}」创建成功`), t(), a();
    } catch (I) {
      v.error(I.message || "创建专家失败");
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
      width: 800,
      maskClosable: !0,
      keyboard: !0
    },
    n.createElement(
      "div",
      { style: { marginBottom: 16 } },
      n.createElement(E, {
        placeholder: "搜索模板名称或类别...",
        value: W,
        onChange: (y) => w(y.target.value),
        allowClear: !0
      })
    ),
    A ? n.createElement(
      "div",
      { style: { textAlign: "center", padding: 60 } },
      n.createElement(T, { size: "large" }),
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
        d,
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
              b ? n.createElement(b) : "📝"
            ),
            n.createElement(
              "div",
              { style: { flex: 1 } },
              n.createElement(
                N,
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
        (y) => n.createElement(
          d,
          { key: y.id, xs: 24, sm: 12 },
          n.createElement(
            s,
            {
              hoverable: !0,
              size: "small",
              onClick: () => U(y),
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
                y.emoji
              ),
              n.createElement(
                "div",
                { style: { flex: 1 } },
                n.createElement(
                  N,
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
              mt(y.description, n)
            )
          )
        )
      )
    ),
    // ── Blank template creation modal ──
    n.createElement(Tn, {
      open: V,
      onCancel: () => R(!1),
      onCreate: P
    })
  );
}
function Tn({
  open: e,
  onCancel: t,
  onCreate: a
}) {
  const n = h().React, { useState: l, useEffect: r } = n, { Modal: s, Input: i, message: E } = h().antd, [c, d] = l(""), [T, v] = l(""), [f, N] = l(!1);
  return r(() => {
    e && (d(""), v(""), N(!1));
  }, [e]), n.createElement(
    s,
    {
      open: e,
      title: "从空白模版创建专家",
      onCancel: t,
      onOk: () => {
        if (!c.trim()) {
          E.warning("请输入专家名称");
          return;
        }
        N(!0), a(c.trim(), T.trim()).finally(() => {
          N(!1);
        });
      },
      okText: "创建",
      cancelText: "取消",
      okButtonProps: { loading: f },
      maskClosable: !0,
      keyboard: !0,
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
      n.createElement(i, {
        placeholder: "输入专家名称",
        value: c,
        onChange: (b) => d(b.target.value),
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
        value: T,
        onChange: (b) => v(b.target.value),
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
    Tag: E,
    Switch: c,
    Button: d,
    Modal: T,
    Input: v,
    Spin: f,
    Empty: N,
    message: b,
    Typography: A
  } = h().antd, { FileTextOutlined: O, PlusOutlined: W, EditOutlined: w, ReloadOutlined: V } = h().antdIcons || {}, { Text: R } = A, [P, B] = l([]), [U, y] = l(!0), [I, _] = l(
    t || []
  ), [q, z] = l(!1), [x, u] = l(null), [L, j] = l(""), [Z, M] = l(""), [p, ee] = l(!1), o = s(async () => {
    y(!0);
    try {
      const K = await Yt(e);
      B(K);
    } catch (K) {
      b.error(K.message || "加载记忆文件失败"), B([]);
    } finally {
      y(!1);
    }
  }, [e]);
  r(() => {
    o();
  }, [o]), r(() => {
    _(t || []);
  }, [t]);
  const ae = async (K, C) => {
    const re = new Set(I);
    if (C)
      re.add(K);
    else {
      if (pt.includes(K) && K === "AGENTS.md") {
        b.warning("AGENTS.md 是核心文件，不能停用");
        return;
      }
      re.delete(K);
    }
    const g = Array.from(re);
    _(g);
    try {
      await ut(e, g), b.success(C ? "已启用记忆文件" : "已停用记忆文件"), a();
    } catch (se) {
      b.error(se.message || "更新失败"), _(t || []);
    }
  }, F = async (K) => {
    try {
      const C = await te(
        `/workspace/files/${encodeURIComponent(K)}`,
        { headers: { "X-Agent-Id": e } }
      );
      u(K), j(C.content || ""), z(!0);
    } catch (C) {
      b.error(C.message || "读取文件失败");
    }
  }, Q = () => {
    u(null), j(""), M(""), z(!0);
  }, J = async () => {
    const K = x || Z.trim();
    if (!K) {
      b.warning("请输入文件名");
      return;
    }
    const C = K.endsWith(".md") ? K : `${K}.md`;
    ee(!0);
    try {
      if (await qe(e, C, L), !x && !I.includes(C)) {
        const re = [...I, C];
        _(re), await ut(e, re);
      }
      b.success("保存成功"), z(!1), o(), a();
    } catch (re) {
      b.error(re.message || "保存失败");
    } finally {
      ee(!1);
    }
  };
  return U ? n.createElement(
    "div",
    { style: { textAlign: "center", padding: 40 } },
    n.createElement(f, { size: "large" })
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
          `记忆文件 (${P.length})`
        ),
        n.createElement(
          R,
          { type: "secondary", style: { fontSize: 12 } },
          `· 已挂载 ${I.length} 个到专家记忆`
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
            onClick: o
          },
          "刷新"
        ),
        n.createElement(
          d,
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
    P.length === 0 ? n.createElement(N, {
      description: "暂无记忆文件，点击「新建记忆文件」添加",
      image: N.PRESENTED_IMAGE_SIMPLE
    }) : n.createElement(i, {
      dataSource: P,
      renderItem: (K) => {
        const C = I.includes(K.filename), re = pt.includes(K.filename);
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
                  onClick: () => F(K.filename)
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
                E,
                { color: "default", style: { fontSize: 10 } },
                "内置"
              ) : n.createElement(
                E,
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
            onChange: (g) => ae(K.filename, g)
          })
        );
      }
    }),
    // Edit/New file modal
    n.createElement(
      T,
      {
        open: q,
        onCancel: () => z(!1),
        title: x ? `编辑 ${x}` : "新建记忆文件",
        width: 700,
        onOk: J,
        confirmLoading: p,
        okText: "保存"
      },
      x ? null : n.createElement(
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
function zn({
  skills: e,
  agentId: t
}) {
  const a = h().React, { useMemo: n } = a, {
    List: l,
    Tag: r,
    Typography: s,
    Empty: i,
    Button: E,
    message: c
  } = h().antd, { ThunderboltOutlined: d, CopyOutlined: T } = h().antdIcons || {}, { Text: v } = s, f = n(() => qt(e), [e]), N = (A) => {
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
  }, b = (A) => {
    var O;
    (O = navigator.clipboard) == null || O.writeText(A).then(() => {
      c.success("已复制到剪贴板");
    });
  };
  return f.length === 0 ? a.createElement(i, {
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
      d ? a.createElement(d, {
        style: { fontSize: 14, color: "#1677ff" }
      }) : null,
      a.createElement(
        v,
        { strong: !0 },
        `推荐提问 (${f.length})`
      ),
      a.createElement(
        v,
        { type: "secondary", style: { fontSize: 12 } },
        "· 从技能描述中自动提取"
      )
    ),
    a.createElement(l, {
      dataSource: f,
      renderItem: (A, O) => a.createElement(
        l.Item,
        {
          actions: [
            a.createElement(
              E,
              {
                type: "link",
                size: "small",
                icon: T ? a.createElement(T) : void 0,
                onClick: () => b(A)
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
              onClick: () => N(A)
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
function In() {
  var X;
  const e = h().React, { useState: t, useEffect: a, useCallback: n, useMemo: l } = e, {
    Spin: r,
    Empty: s,
    Input: i,
    Button: E,
    message: c,
    Row: d,
    Col: T,
    Tabs: v,
    Modal: f,
    Typography: N
  } = h().antd, {
    ReloadOutlined: b,
    PlusOutlined: A,
    SearchOutlined: O,
    TeamOutlined: W,
    UserOutlined: w
  } = h().antdIcons || {}, { Text: V, Paragraph: R } = N, [P, B] = t([]), [U, y] = t(!0), [I, _] = t(!1), [q, z] = t(null), [x, u] = t(""), [L, j] = t(!1), [Z, M] = t("experts"), [p, ee] = t(
    null
  ), [o, ae] = t(""), [F, Q] = t(!1), [J, K] = t(!1), [C, re] = t(null), [g, se] = t([]), oe = n(async () => {
    y(!0);
    try {
      const S = await st(), le = await Promise.all(
        S.map(async (me) => {
          try {
            const [de, fe, be] = await Promise.all([
              Ye(me.id).catch(() => null),
              it(me.id).catch(() => []),
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
      B(le), se(S);
    } catch (S) {
      c.error(S.message || "加载专家列表失败"), B([]);
    } finally {
      y(!1);
    }
  }, []);
  a(() => {
    oe();
  }, [oe]), a(() => {
    if (C && J) {
      const S = P.find(
        (le) => le.agent.id === C.agent.id
      );
      S && S !== C && re(S);
    }
  }, [P, C, J]);
  const Se = n(
    async (S) => {
      var fe;
      const le = S.coordinatorName || ((fe = S.members[0]) == null ? void 0 : fe.name);
      if (!le) {
        c.error("无法确定协调者专家");
        return;
      }
      const me = Ve(g, le);
      if (!me) {
        c.error(`未找到协调者专家「${le}」，请先创建该专家`);
        return;
      }
      if (/\{.+?\}/.test(S.taskTemplate)) {
        ae(""), ee(S);
        return;
      }
      await we(S, me, S.taskTemplate);
    },
    [g, c]
  ), we = n(
    async (S, le, me) => {
      var de;
      Q(!0);
      try {
        const fe = Jt(S), be = me ? fe.replace(S.taskTemplate, me) : fe, Ae = h();
        Ae.setSelectedAgent && Ae.setSelectedAgent(le), await Gt(le, be), c.success(
          `团队任务已发起，协调者：${S.coordinatorName || ((de = S.members[0]) == null ? void 0 : de.name)}`
        ), ee(null), D("/chat");
      } catch (fe) {
        c.error(fe.message || "发起团队任务失败");
      } finally {
        Q(!1);
      }
    },
    [c]
  ), D = (S) => {
    window.history.pushState({}, "", S), window.dispatchEvent(new PopStateEvent("popstate"));
  }, $ = n((S) => {
    z(S), _(!0);
  }, []), ne = n((S) => {
    re(S), K(!0);
  }, []), H = n(
    (S) => {
      if (!S.agent.enabled) {
        c.warning(`专家「${S.agent.name}」未启用，请先启用`);
        return;
      }
      try {
        const le = h();
        le.setSelectedAgent && le.setSelectedAgent(S.agent.id);
      } catch (le) {
        console.warn("[ugsci] Failed to set selected agent:", le);
      }
      c.success(`已召唤专家「${S.agent.name}」，正在跳转至对话...`), D("/chat");
    },
    [c]
  ), he = l(() => {
    if (!x.trim()) return P;
    const S = x.toLowerCase();
    return P.filter(
      (le) => {
        var me;
        return le.agent.name.toLowerCase().includes(S) || ((me = le.agent.description) == null ? void 0 : me.toLowerCase().includes(S)) || le.agent.id.toLowerCase().includes(S) || le.skills.some((de) => de.name.toLowerCase().includes(S));
      }
    );
  }, [P, x]), Ee = P.filter((S) => S.agent.enabled).length, ie = P.reduce(
    (S, le) => S + le.skills.filter((me) => me.enabled !== !1).length,
    0
  ), Te = P.reduce((S, le) => S + le.mcps.length, 0), _e = [
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
            prefix: O ? e.createElement(O) : void 0,
            value: x,
            onChange: (S) => u(S.target.value),
            allowClear: !0,
            style: { maxWidth: 400 }
          })
        ),
        // Content
        U ? e.createElement(
          "div",
          { style: { textAlign: "center", padding: 60 } },
          e.createElement(r, { size: "large" })
        ) : he.length === 0 ? e.createElement(s, {
          description: x ? "未找到匹配的专家" : "暂无专家，点击「创建专家」添加"
        }) : e.createElement(
          d,
          { gutter: [12, 12], align: "stretch" },
          ...he.map(
            (S) => e.createElement(
              T,
              {
                key: S.agent.id,
                xs: 24,
                sm: 12,
                md: 8,
                lg: 6,
                style: { display: "flex" }
              },
              e.createElement(xn, {
                expert: S,
                onClick: () => $(S),
                onSummon: () => H(S),
                onConfigure: () => ne(S)
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
      children: e.createElement(Vt, {
        agents: g,
        onLaunch: Se
      })
    }
  ];
  return e.createElement(
    "div",
    { style: { padding: 24 } },
    e.createElement(Qe, {
      title: "专家",
      subtitle: `共 ${P.length} 位专家（${Ee} 位启用）· ${ie} 个技能 · ${Te} 个 MCP 客户端`,
      extra: e.createElement(
        e.Fragment,
        null,
        e.createElement(
          E,
          {
            icon: b ? e.createElement(b) : void 0,
            onClick: oe,
            loading: U
          },
          "刷新"
        ),
        e.createElement(
          E,
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
      onChange: (S) => M(S)
    }),
    // Drawer
    e.createElement(Cn, {
      expert: q,
      open: I,
      onClose: () => _(!1),
      onRefresh: () => oe()
    }),
    // Template Modal
    e.createElement(kn, {
      open: L,
      onClose: () => j(!1),
      onCreated: () => oe()
    }),
    // Config Modal (gear icon)
    e.createElement(wn, {
      expert: C,
      open: J,
      onClose: () => K(!1),
      onRefresh: () => oe()
    }),
    // Team Launch Modal (for filling placeholders)
    p ? e.createElement(
      f,
      {
        open: !0,
        title: e.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 8 } },
          e.createElement(
            "span",
            { style: { fontSize: 20 } },
            p.emoji
          ),
          e.createElement(
            "span",
            null,
            `发起团队任务 - ${p.name}`
          )
        ),
        onCancel: () => ee(null),
        onOk: () => {
          var de;
          const S = p.coordinatorName || ((de = p.members[0]) == null ? void 0 : de.name), le = S ? Ve(g, S) : null;
          if (!le) {
            c.error("无法找到协调者专家");
            return;
          }
          let me = p.taskTemplate;
          o.trim() && (me = o.trim()), we(p, le, me);
        },
        confirmLoading: F,
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
          p.taskTemplate
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
          onChange: (S) => ae(S.target.value),
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
          V,
          { style: { fontSize: 12, color: "#0958d9" } },
          `协调者: ${p.coordinatorName || ((X = p.members[0]) == null ? void 0 : X.name) || "—"} · 成员: ${p.members.map((S) => S.name).join("、")}`
        )
      )
    ) : null
  );
}
function _n({
  mcp: e,
  onClick: t,
  onToggle: a,
  onDelete: n,
  onViewTools: l
}) {
  const r = h().React, { Card: s, Tag: i, Badge: E, Typography: c, Button: d } = h().antd, { Text: T } = c, {
    EyeOutlined: v,
    EyeInvisibleOutlined: f,
    DeleteOutlined: N,
    ToolOutlined: b
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
          T,
          { strong: !0, style: { fontSize: 14 } },
          e.name || e.key
        )
      ),
      r.createElement(E, {
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
        d,
        {
          size: "small",
          icon: b ? r.createElement(b) : void 0,
          onClick: l
        },
        "工具"
      ),
      r.createElement(
        d,
        {
          size: "small",
          icon: e.enabled ? f ? r.createElement(f) : void 0 : v ? r.createElement(v) : void 0,
          onClick: a
        },
        e.enabled ? "禁用" : "启用"
      ),
      r.createElement(
        d,
        {
          size: "small",
          danger: !0,
          icon: N ? r.createElement(N) : void 0,
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
}, At = /* @__PURE__ */ new Set(["cmg", "comsol", "tnavigator"]);
function $t(e) {
  return ot(`/ugsci/engines/icon/${encodeURIComponent(e)}`);
}
async function Pn() {
  return te("/ugsci/engines/list");
}
async function On(e) {
  return te("/ugsci/engines/", {
    method: "POST",
    body: JSON.stringify(e)
  });
}
async function An(e, t) {
  return te(`/ugsci/engines/${encodeURIComponent(e)}`, {
    method: "PUT",
    body: JSON.stringify(t)
  });
}
async function $n(e) {
  return te(
    `/ugsci/engines/${encodeURIComponent(e)}`,
    { method: "DELETE" }
  );
}
async function Mn() {
  return te("/ugsci/engines/detect", {
    method: "POST"
  });
}
function Rn({
  engine: e,
  onClick: t
}) {
  const a = h().React, { Card: n, Tag: l, Typography: r } = h().antd, { Text: s } = r, i = e.status === "detected", E = Ot[e.category] || "📦", d = At.has(e.id) ? a.createElement("img", {
    src: $t(e.id),
    alt: e.name,
    style: { width: 24, height: 24, objectFit: "contain" }
  }) : a.createElement("span", { style: { fontSize: 20 } }, E);
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
        (T) => a.createElement(
          l,
          { key: T, color: "cyan", style: { fontSize: 10 } },
          T
        )
      )
    )
  );
}
function Ln() {
  const e = h().React, { useState: t, useEffect: a, useCallback: n, useMemo: l } = e, {
    Spin: r,
    Empty: s,
    Button: i,
    message: E,
    Row: c,
    Col: d,
    Drawer: T,
    Descriptions: v,
    Tag: f,
    Typography: N,
    Modal: b,
    Input: A,
    Alert: O,
    Select: W,
    Popconfirm: w,
    Space: V
  } = h().antd, {
    ReloadOutlined: R,
    SearchOutlined: P,
    PlusOutlined: B,
    EditOutlined: U,
    DeleteOutlined: y,
    CopyOutlined: I,
    ExperimentOutlined: _
  } = h().antdIcons || {}, { Text: q, Paragraph: z } = N, [x, u] = t([]), [L, j] = t(!0), [Z, M] = t(""), [p, ee] = t(!1), [o, ae] = t(null), [F, Q] = t(!1), [J, K] = t(null), [C, re] = t({}), [g, se] = t(!1), oe = n(async () => {
    j(!0);
    try {
      const X = await Pn();
      u(X.engines || []);
    } catch (X) {
      E.error(X.message || "加载引擎列表失败"), u([]);
    } finally {
      j(!1);
    }
  }, []);
  a(() => {
    oe();
  }, [oe]);
  const Se = l(() => {
    if (!Z.trim()) return x;
    const X = Z.toLowerCase();
    return x.filter(
      (S) => {
        var le;
        return S.name.toLowerCase().includes(X) || S.vendor.toLowerCase().includes(X) || S.category.toLowerCase().includes(X) || ((le = S.description) == null ? void 0 : le.toLowerCase().includes(X));
      }
    );
  }, [x, Z]), we = x.filter((X) => X.status === "detected").length, D = n((X) => {
    navigator.clipboard.writeText(X).then(() => E.success("路径已复制")).catch(() => E.error("复制失败"));
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
  }, []), H = n(async () => {
    var X;
    if (!((X = C.name) != null && X.trim())) {
      E.warning("请输入引擎名称");
      return;
    }
    se(!0);
    try {
      J ? (await An(J.id, C), E.success("引擎已更新")) : (await On(C), E.success("引擎已添加")), Q(!1), oe();
    } catch (S) {
      E.error(S.message || "保存失败");
    } finally {
      se(!1);
    }
  }, [C, J, oe]), he = n(
    async (X) => {
      try {
        await $n(X), E.success("引擎已删除"), ee(!1), oe();
      } catch (S) {
        E.error(S.message || "删除失败");
      }
    },
    [oe]
  ), Ee = n(async () => {
    j(!0);
    try {
      const X = await Mn();
      u(X.engines || []), E.success("自动检测完成");
    } catch (X) {
      E.error(X.message || "检测失败");
    } finally {
      j(!1);
    }
  }, []), ie = n(
    (X, S, le) => {
      const me = C[S] || "";
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
          onChange: (de) => re((fe) => ({ ...fe, [S]: de })),
          style: { width: "100%" },
          options: le.select.options,
          allowClear: !0,
          placeholder: `选择${X}`
        }) : le != null && le.textarea ? e.createElement(A.TextArea, {
          value: me,
          onChange: (de) => re((fe) => ({ ...fe, [S]: de.target.value })),
          rows: 3,
          placeholder: `输入${X}`
        }) : e.createElement(A, {
          value: me,
          onChange: (de) => re((fe) => ({ ...fe, [S]: de.target.value })),
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
        message: `共 ${x.length} 个引擎 · ${we} 个已检测`,
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
        prefix: P ? e.createElement(P) : void 0,
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
          d,
          {
            key: X.id,
            xs: 24,
            sm: 12,
            md: 8,
            lg: 6,
            style: { display: "flex" }
          },
          e.createElement(Rn, {
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
      T,
      {
        title: e.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 8 } },
          e.createElement(
            "span",
            { style: { display: "flex", alignItems: "center" } },
            At.has(o.id) ? e.createElement("img", {
              src: $t(o.id),
              alt: o.name,
              style: { width: 20, height: 20, objectFit: "contain" }
            }) : e.createElement(
              "span",
              { style: { fontSize: 18 } },
              Ot[o.category] || "📦"
            )
          ),
          e.createElement("span", null, o.name)
        ),
        open: p,
        onClose: () => ee(!1),
        width: 520,
        extra: e.createElement(
          V,
          null,
          e.createElement(
            i,
            {
              size: "small",
              icon: U ? e.createElement(U) : void 0,
              onClick: () => ne(o)
            },
            "编辑"
          ),
          o.is_default ? null : e.createElement(
            w,
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
                icon: y ? e.createElement(y) : void 0
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
            f,
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
                icon: I ? e.createElement(I) : void 0,
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
                  f,
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
          f,
          { color: "blue" },
          "默认引擎"
        ) : o.is_custom ? e.createElement(
          f,
          { color: "purple" },
          "自定义引擎"
        ) : null
      )
    ) : null,
    // Add/Edit modal
    e.createElement(
      b,
      {
        title: J ? "编辑引擎" : "添加计算引擎",
        open: F,
        onOk: H,
        onCancel: () => Q(!1),
        okText: J ? "保存" : "添加",
        cancelText: "取消",
        confirmLoading: g,
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
            options: Object.entries(lt).map(([X, S]) => ({
              label: S,
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
function Bn() {
  const e = h().React, { useState: t, useEffect: a, useCallback: n, useMemo: l } = e, {
    Spin: r,
    Empty: s,
    Input: i,
    Button: E,
    message: c,
    Row: d,
    Col: T,
    Drawer: v,
    Descriptions: f,
    Tag: N,
    Typography: b,
    List: A,
    Tabs: O,
    Modal: W
  } = h().antd, {
    ReloadOutlined: w,
    PlusOutlined: V,
    SearchOutlined: R,
    ApiOutlined: P,
    RocketOutlined: B,
    ToolOutlined: U,
    DeleteOutlined: y,
    EyeOutlined: I,
    EyeInvisibleOutlined: _
  } = h().antdIcons || {}, { Text: q } = b, { TextArea: z } = i, u = h().useSelectedAgent, L = u ? u() : null, j = (L == null ? void 0 : L.id) || "default", [Z, M] = t([]), [p, ee] = t(!0), [o, ae] = t(""), [F, Q] = t(!1), [J, K] = t(null), [C, re] = t("mcp"), [g, se] = t(!1), [oe, Se] = t(`{
  "mcpServers": {
    "example-client": {
      "command": "npx",
      "args": ["-y", "@example/mcp-server"],
      "env": {}
    }
  }
}`), [we, D] = t(!1), [$, ne] = t(!1), [H, he] = t(null), [Ee, ie] = t(!1), [Te, _e] = t(null), [X, S] = t([]), [le, me] = t(!1), [de, fe] = t(""), be = n(async () => {
    ee(!0);
    try {
      const G = await Dt(j);
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
        await Nt(j, G.key), c.success(G.enabled ? "已禁用" : "已启用"), be();
      } catch (ce) {
        c.error(ce.message || "切换状态失败");
      }
    },
    [j, be]
  ), Ne = n(async () => {
    if (H)
      try {
        await Ut(j, H.key), c.success(`MCP「${H.key}」已删除`), ne(!1), he(null), be();
      } catch (G) {
        c.error(G.message || "删除失败");
      }
  }, [j, H, be]), Ue = n(async () => {
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
          await Ft(
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
      _e(G), ie(!0), S([]), fe(""), me(!0);
      try {
        const ce = await Ht(
          j,
          G.key
        );
        S(ce);
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
        E,
        {
          type: "primary",
          icon: V ? e.createElement(V) : void 0,
          onClick: () => se(!0),
          style: Re
        },
        "添加 MCP"
      )
    ),
    p ? e.createElement(
      "div",
      { style: { textAlign: "center", padding: 60 } },
      e.createElement(r, { size: "large" })
    ) : Be.length === 0 ? e.createElement(s, {
      description: o ? "未找到匹配的能力" : "暂无 MCP 客户端，点击「添加 MCP」创建"
    }) : e.createElement(
      d,
      { gutter: [12, 12], align: "stretch" },
      ...Be.map(
        (G) => e.createElement(
          T,
          {
            key: G.key,
            xs: 24,
            sm: 12,
            md: 8,
            lg: 6,
            style: { display: "flex" }
          },
          e.createElement(_n, {
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
        B ? e.createElement(B, { style: { fontSize: 14 } }) : null,
        "计算引擎"
      ),
      children: e.createElement(Ln)
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
          E,
          {
            icon: w ? e.createElement(w) : void 0,
            onClick: be,
            loading: p
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
        open: F,
        onClose: () => Q(!1),
        width: 480
      },
      e.createElement(
        f,
        { column: 1, bordered: !0, size: "small" },
        e.createElement(
          f.Item,
          { label: "Key" },
          e.createElement(
            "code",
            { style: { fontSize: 12 } },
            J.key
          )
        ),
        e.createElement(
          f.Item,
          { label: "名称" },
          J.name || "-"
        ),
        e.createElement(
          f.Item,
          { label: "描述" },
          J.description || "-"
        ),
        e.createElement(
          f.Item,
          { label: "状态" },
          e.createElement(
            N,
            { color: J.enabled ? "green" : "default" },
            J.enabled ? "启用" : "停用"
          )
        ),
        e.createElement(
          f.Item,
          { label: "传输方式" },
          J.transport
        ),
        J.url ? e.createElement(
          f.Item,
          { label: "URL" },
          J.url
        ) : null,
        J.command ? e.createElement(
          f.Item,
          { label: "命令" },
          e.createElement(
            "code",
            { style: { fontSize: 11 } },
            J.command
          )
        ) : null,
        J.args && J.args.length > 0 ? e.createElement(
          f.Item,
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
              P ? e.createElement(P, {
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
        open: g,
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
      e.createElement(z, {
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
        `确定要删除 MCP 客户端「${(H == null ? void 0 : H.name) || (H == null ? void 0 : H.key)}」吗？此操作不可撤销。`
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
          E,
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
              P ? e.createElement(P, {
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
function jn({
  agentId: e,
  agentName: t,
  onNavigate: a
}) {
  const n = h().React, { useState: l, useEffect: r, useCallback: s } = n, {
    Spin: i,
    Empty: E,
    Button: c,
    Row: d,
    Col: T,
    Card: v,
    Tag: f,
    Checkbox: N,
    Modal: b,
    Typography: A,
    Drawer: O,
    Descriptions: W,
    message: w
  } = h().antd, {
    ReloadOutlined: V,
    ThunderboltOutlined: R,
    SettingOutlined: P,
    CheckSquareOutlined: B,
    EyeOutlined: U,
    EyeInvisibleOutlined: y,
    DeleteOutlined: I,
    CloseOutlined: _
  } = h().antdIcons || {}, { Text: q, Paragraph: z } = A, [x, u] = l([]), [L, j] = l(!0), [Z, M] = l(!1), [p, ee] = l(null), [o, ae] = l(!1), [F, Q] = l(
    /* @__PURE__ */ new Set()
  ), [J, K] = l(!1), C = s(async () => {
    if (e) {
      j(!0);
      try {
        const $ = await it(e);
        u($);
      } catch ($) {
        w.error($.message || "加载技能失败"), u([]);
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
      const H = new Set(ne);
      return H.has($) ? H.delete($) : H.add($), H;
    });
  }, g = () => Q(/* @__PURE__ */ new Set()), se = () => Q(new Set(x.map(($) => $.name))), oe = () => {
    o ? (g(), ae(!1)) : ae(!0);
  }, Se = async () => {
    const $ = Array.from(F);
    if ($.length !== 0) {
      K(!0);
      try {
        const { results: ne } = await Zt(e, $), H = Object.entries(ne).filter(
          ([, Ee]) => Ee.success === !1
        ), he = $.length - H.length;
        H.length > 0 ? w.warning(
          `批量启用完成：成功 ${he} 个，失败 ${H.length} 个`
        ) : w.success(`成功启用 ${$.length} 个技能`), g(), await C();
      } catch (ne) {
        w.error(ne.message || "批量启用失败");
      } finally {
        K(!1);
      }
    }
  }, we = async () => {
    const $ = Array.from(F);
    if ($.length !== 0) {
      K(!0);
      try {
        const { results: ne } = await en(e, $), H = Object.entries(ne).filter(
          ([, Ee]) => Ee.success === !1
        ), he = $.length - H.length;
        H.length > 0 ? w.warning(
          `批量停用完成：成功 ${he} 个，失败 ${H.length} 个`
        ) : w.success(`成功停用 ${$.length} 个技能`), g(), await C();
      } catch (ne) {
        w.error(ne.message || "批量停用失败");
      } finally {
        K(!1);
      }
    }
  }, D = () => {
    const $ = Array.from(F);
    $.length !== 0 && b.confirm({
      title: `确认删除 ${$.length} 个技能？`,
      content: "删除后技能将从当前专家工作区移除，此操作不可撤销。技能池中的原始技能不受影响。",
      okText: "确认删除",
      cancelText: "取消",
      okButtonProps: { danger: !0 },
      onOk: async () => {
        K(!0);
        try {
          const { results: ne } = await tn(e, $), H = Object.entries(ne).filter(
            ([, Ee]) => Ee.success === !1
          ), he = $.length - H.length;
          H.length > 0 ? w.warning(
            `批量删除完成：成功 ${he} 个，失败 ${H.length} 个`
          ) : w.success(`成功删除 ${$.length} 个技能`), g(), await C();
        } catch (ne) {
          w.error(ne.message || "批量删除失败");
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
        o ? `已选择 ${F.size} / ${x.length} 个技能` : `共 ${x.length} 个技能`
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
              icon: _ ? n.createElement(_) : void 0,
              onClick: g
            },
            "取消选择"
          ),
          n.createElement(
            c,
            {
              size: "small",
              type: "default",
              icon: U ? n.createElement(U) : void 0,
              disabled: F.size === 0 || J,
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
              icon: y ? n.createElement(y) : void 0,
              disabled: F.size === 0 || J,
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
              icon: I ? n.createElement(I) : void 0,
              disabled: F.size === 0 || J,
              loading: J,
              onClick: D
            },
            `删除 (${F.size})`
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
              disabled: x.length === 0
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
    ) : x.length === 0 ? n.createElement(E, {
      description: "当前智能体未加载任何技能"
    }) : n.createElement(
      d,
      { gutter: [12, 12] },
      ...x.map(
        ($) => n.createElement(
          T,
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
                borderColor: o && F.has($.name) ? "#0072f5" : void 0,
                borderWidth: o && F.has($.name) ? 2 : 1
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
              n.createElement(N, {
                checked: F.has($.name)
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
                f,
                { color: "default", style: { fontSize: 10 } },
                "已禁用"
              ) : n.createElement(
                f,
                { color: "green", style: { fontSize: 10 } },
                "已启用"
              )
            ),
            $.description ? n.createElement(
              z,
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
                f,
                { style: { fontSize: 10 } },
                `v${$.version_text}`
              ) : null,
              ...($.tags || []).slice(0, 3).map(
                (ne, H) => n.createElement(
                  f,
                  { key: H, color: "blue", style: { fontSize: 10 } },
                  ne
                )
              )
            )
          )
        )
      )
    ),
    // Skill detail drawer
    p ? n.createElement(
      O,
      {
        title: n.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 8 } },
          n.createElement(
            "span",
            { style: { fontSize: 18 } },
            p.emoji || "⚡"
          ),
          n.createElement("span", null, p.name)
        ),
        open: Z,
        onClose: () => M(!1),
        width: 520,
        extra: n.createElement(
          c,
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
        W,
        { column: 1, bordered: !0, size: "small" },
        n.createElement(
          W.Item,
          { label: "技能名称" },
          p.name
        ),
        n.createElement(
          W.Item,
          { label: "描述" },
          p.description || "-"
        ),
        p.version_text ? n.createElement(
          W.Item,
          { label: "版本" },
          p.version_text
        ) : null,
        n.createElement(
          W.Item,
          { label: "来源" },
          p.source || "-"
        ),
        n.createElement(
          W.Item,
          { label: "状态" },
          p.enabled === !1 ? "已禁用" : "已启用"
        ),
        p.installed_from ? n.createElement(
          W.Item,
          { label: "安装来源" },
          p.installed_from
        ) : null
      ),
      // Tags
      p.tags && p.tags.length > 0 ? n.createElement(
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
          ...p.tags.map(
            ($, ne) => n.createElement(f, { key: ne, color: "blue" }, $)
          )
        )
      ) : null,
      // Skill content preview
      p.content ? n.createElement(
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
          p.content.slice(0, 2e3) + (p.content.length > 2e3 ? `

... (内容已截断)` : "")
        )
      ) : null
    ) : null
  );
}
function Dn({
  poolSkills: e,
  workspaceSkills: t,
  agents: a,
  loading: n,
  onReload: l
}) {
  const r = h().React, { useState: s, useMemo: i, useCallback: E } = r, {
    Spin: c,
    Empty: d,
    Input: T,
    Button: v,
    Row: f,
    Col: N,
    Card: b,
    Tag: A,
    Typography: O,
    Drawer: W,
    Descriptions: w,
    List: V
  } = h().antd, {
    ReloadOutlined: R,
    SearchOutlined: P,
    DownloadOutlined: B,
    ThunderboltOutlined: U
  } = h().antdIcons || {}, { Text: y, Paragraph: I } = O, [_, q] = s(""), [z, x] = s(!1), [u, L] = s(null), [j, Z] = s([]), M = i(() => {
    if (!_.trim()) return e;
    const o = _.toLowerCase();
    return e.filter(
      (ae) => {
        var F, Q;
        return ae.name.toLowerCase().includes(o) || ((F = ae.description) == null ? void 0 : F.toLowerCase().includes(o)) || ((Q = ae.tags) == null ? void 0 : Q.some((J) => J.toLowerCase().includes(o)));
      }
    );
  }, [e, _]), p = E(
    (o) => {
      const ae = [];
      for (const F of t)
        if (F.skills.some((Q) => Q.name === o)) {
          const Q = a.find((J) => J.id === F.agent_id);
          ae.push((Q == null ? void 0 : Q.name) || F.agent_name || F.agent_id);
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
      r.createElement(T, {
        placeholder: "搜索技能名称、描述或标签...",
        prefix: P ? r.createElement(P) : void 0,
        value: _,
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
    ) : M.length === 0 ? r.createElement(d, {
      description: _ ? "未找到匹配的技能" : "技能池为空"
    }) : r.createElement(
      f,
      { gutter: [12, 12] },
      ...M.map(
        (o) => r.createElement(
          N,
          { key: o.name, xs: 24, sm: 12, md: 8, lg: 6 },
          r.createElement(
            b,
            {
              hoverable: !0,
              size: "small",
              style: { cursor: "pointer", height: "100%" },
              onClick: () => {
                L(o), Z(p(o.name)), x(!0);
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
                o.name
              ),
              o.protected ? r.createElement(
                A,
                { color: "gold", style: { fontSize: 10 } },
                "内置"
              ) : null
            ),
            o.description ? r.createElement(
              I,
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
                (ae, F) => r.createElement(
                  A,
                  { key: F, color: "cyan", style: { fontSize: 10 } },
                  ae
                )
              )
            )
          )
        )
      )
    ),
    // Skill detail drawer
    u ? r.createElement(
      W,
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
        open: z,
        onClose: () => x(!1),
        width: 520,
        extra: r.createElement(
          v,
          {
            type: "primary",
            size: "small",
            icon: U ? r.createElement(U) : void 0,
            onClick: () => ee("/skills")
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
            (o, ae) => r.createElement(A, { key: ae, color: "cyan" }, o)
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
                y,
                { style: { fontSize: 13 } },
                o
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
function Nn() {
  const e = h().React, { useState: t, useEffect: a, useCallback: n, useMemo: l } = e, { Tabs: r, message: s } = h().antd, { ThunderboltOutlined: i, AppstoreOutlined: E } = h().antdIcons || {}, d = h().useSelectedAgent, T = d ? d() : null, v = (T == null ? void 0 : T.id) || "default", [f, N] = t([]), [b, A] = t([]), [O, W] = t([]), [w, V] = t(!0), [R, P] = t("agent-skills"), B = n(async () => {
    V(!0);
    try {
      const [_, q, z] = await Promise.all([
        ct(),
        st(),
        jt()
      ]);
      A(_), N(q), W(z);
    } catch (_) {
      s.error(_.message || "加载技能列表失败"), A([]);
    } finally {
      V(!1);
    }
  }, []);
  a(() => {
    B();
  }, [B]);
  const U = l(() => {
    const _ = f.find((q) => q.id === v);
    return (_ == null ? void 0 : _.name) || v;
  }, [f, v]), y = (_) => {
    window.history.pushState({}, "", _), window.dispatchEvent(new PopStateEvent("popstate"));
  }, I = [
    {
      key: "agent-skills",
      label: e.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        i ? e.createElement(i, { style: { fontSize: 14 } }) : null,
        "当前Agent加载技能"
      ),
      children: e.createElement(jn, {
        agentId: v,
        agentName: U,
        onNavigate: y
      })
    },
    {
      key: "skill-pool",
      label: e.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        E ? e.createElement(E, { style: { fontSize: 14 } }) : null,
        "技能池"
      ),
      children: e.createElement(Dn, {
        poolSkills: b,
        workspaceSkills: O,
        agents: f,
        loading: w,
        onReload: B
      })
    }
  ];
  return e.createElement(
    "div",
    { style: { padding: 24 } },
    e.createElement(Qe, {
      title: "技能",
      subtitle: `技能池共 ${b.length} 个技能 · 当前智能体：${U}`
    }),
    e.createElement(r, {
      items: I,
      activeKey: R,
      onChange: (_) => P(_)
    })
  );
}
const at = "ugsci.market.githubSources", yt = "https://github.com/anthropics/skills/tree/main/skills";
function Mt(e) {
  try {
    const t = new URL(e.trim()), a = t.hostname.toLowerCase();
    if (a !== "github.com" && a !== "www.github.com") return null;
    const n = t.pathname.split("/").filter((E) => E.length > 0);
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
function Rt(e, t, a) {
  return `${e}/${t}:${a || "/"}`;
}
function Un() {
  try {
    const e = localStorage.getItem(at);
    if (!e) {
      const a = Mt(yt);
      if (a) {
        const n = [
          {
            id: Rt(
              a.owner,
              a.repo,
              a.skillsPath
            ),
            url: yt,
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
function Fn(e) {
  const t = e.match(/^---\s*\n([\s\S]*?)\n---/);
  if (!t) return {};
  const a = t[1], n = {}, l = a.split(`
`);
  let r = "";
  for (const s of l) {
    const i = s.match(/^(\w[\w-]*)\s*:\s*(.*)$/);
    if (i) {
      r = i[1];
      let E = i[2].trim();
      (E.startsWith('"') && E.endsWith('"') || E.startsWith("'") && E.endsWith("'")) && (E = E.slice(1, -1)), r === "name" ? n.name = E : r === "description" ? n.description = E : r === "version" ? n.version = E : r === "author" && (n.author = E);
    }
  }
  return n;
}
async function Hn(e) {
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
      const E = `https://raw.githubusercontent.com/${e.owner}/${e.repo}/${e.ref}/${e.skillsPath ? e.skillsPath + "/" : ""}${i.name}/SKILL.md`, c = `https://github.com/${e.owner}/${e.repo}/tree/${e.ref}/${e.skillsPath ? e.skillsPath + "/" : ""}${i.name}`, d = {
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
        const T = await fetch(E);
        if (!T.ok) return d;
        const v = await T.text(), f = Fn(v);
        return {
          ...d,
          name: f.name || i.name,
          description: f.description || "",
          version: f.version || null,
          author: f.author || null
        };
      } catch {
        return d;
      }
    })
  );
}
async function Wn(e) {
  const t = e.filter((r) => r.enabled), a = await Promise.all(
    t.map(async (r) => {
      try {
        return { skills: await Hn(r), error: null, label: r.label };
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
function Gn({
  open: e,
  onClose: t,
  sources: a,
  onChange: n
}) {
  const l = h().React, { useState: r } = l, {
    Modal: s,
    Input: i,
    Button: E,
    List: c,
    Tag: d,
    Switch: T,
    Typography: v,
    Tooltip: f,
    message: N
  } = h().antd, {
    PlusOutlined: b,
    DeleteOutlined: A,
    LinkOutlined: O,
    GithubOutlined: W
  } = h().antdIcons || {}, { Text: w } = v, [V, R] = r(""), P = () => {
    const y = V.trim();
    if (!y) return;
    const I = Mt(y);
    if (!I) {
      N.error("无效的 GitHub URL，请输入类似 https://github.com/owner/repo/tree/main/skills 的链接");
      return;
    }
    const _ = Rt(I.owner, I.repo, I.skillsPath);
    if (a.some((x) => x.id === _)) {
      N.warning("该源已存在");
      return;
    }
    const q = {
      id: _,
      url: y,
      label: I.label,
      owner: I.owner,
      repo: I.repo,
      ref: I.ref,
      skillsPath: I.skillsPath,
      enabled: !0
    }, z = [...a, q];
    tt(z), n(z), R(""), N.success(`已添加源: ${I.label}`);
  }, B = (y, I) => {
    const _ = a.map(
      (q) => q.id === y ? { ...q, enabled: I } : q
    );
    tt(_), n(_);
  }, U = (y) => {
    const I = a.filter((_) => _.id !== y);
    tt(I), n(I), N.success("已移除源");
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
        E,
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
        l.createElement(i, {
          placeholder: "https://github.com/anthropics/skills/tree/main/skills",
          value: V,
          onChange: (y) => R(y.target.value),
          onPressEnter: P,
          prefix: O ? l.createElement(O) : void 0,
          style: { flex: 1 }
        }),
        l.createElement(
          E,
          {
            type: "primary",
            icon: b ? l.createElement(b) : void 0,
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
    l.createElement(c, {
      size: "small",
      bordered: !0,
      dataSource: a,
      renderItem: (y) => l.createElement(
        c.Item,
        {
          actions: [
            l.createElement(
              f,
              { title: y.enabled ? "点击禁用" : "点击启用" },
              l.createElement(T, {
                size: "small",
                checked: y.enabled,
                onChange: (I) => B(y.id, I)
              })
            ),
            l.createElement(
              f,
              { title: "移除此源" },
              l.createElement(
                E,
                {
                  size: "small",
                  type: "text",
                  danger: !0,
                  icon: A ? l.createElement(A) : void 0,
                  onClick: () => U(y.id)
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
async function Jn() {
  return te("/market/providers");
}
async function Xn(e) {
  return te(
    `/market/categories?lang=${encodeURIComponent(e)}`
  );
}
async function Kn(e, t, a, n, l) {
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
async function ft(e, t, a) {
  return te("/skills/hub/install/start", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify({
      bundle_url: t,
      enable: a
    })
  });
}
async function Et(e, t) {
  return te(
    `/skills/hub/install/status/${encodeURIComponent(t)}`,
    {
      headers: { "X-Agent-Id": e }
    }
  );
}
function Vn() {
  const e = h().React, { useState: t, useEffect: a, useCallback: n, useMemo: l, useRef: r } = e, {
    Spin: s,
    Empty: i,
    Input: E,
    Button: c,
    message: d,
    Row: T,
    Col: v,
    Card: f,
    Tag: N,
    Tooltip: b,
    Typography: A,
    Select: O,
    Drawer: W,
    Descriptions: w,
    Tabs: V,
    Badge: R,
    Progress: P
  } = h().antd, {
    ReloadOutlined: B,
    SearchOutlined: U,
    DownloadOutlined: y,
    AppstoreOutlined: I,
    ShopOutlined: _,
    CheckCircleOutlined: q,
    LoadingOutlined: z,
    UserOutlined: x,
    SettingOutlined: u,
    GithubOutlined: L
  } = h().antdIcons || {}, { Text: j, Paragraph: Z, Title: M } = A, [p, ee] = t("skills"), [o, ae] = t([]), [F, Q] = t([]), [J, K] = t([]), [C, re] = t(""), [g, se] = t(""), [oe, Se] = t(!1), [we, D] = t(!1), [$, ne] = t(
    {}
  ), [H, he] = t(null), [Ee, ie] = t({}), [Te, _e] = t([]), [X, S] = t(""), [le, me] = t(""), [de, fe] = t([]), [be, Ae] = t([]), [Ne, Ue] = t(!1), [We, Be] = t(!1), [Ie, Fe] = t(""), Le = r(null);
  a(() => {
    Promise.all([
      Jn().catch(() => []),
      Xn("zh").catch(() => []),
      st().catch(() => [])
    ]).then(([m, Y, pe]) => {
      ae(m), Q(Y), _e(pe), pe.length > 0 && S(pe[0].id);
    });
  }, []);
  const je = n(async (m) => {
    const Y = m ?? Un();
    if (fe(m || Y), Y.filter((ge) => ge.enabled).length === 0) {
      Ae([]);
      return;
    }
    Ue(!0);
    try {
      const { skills: ge, errors: Pe } = await Wn(Y);
      if (Ae(ge), Pe.length > 0) {
        for (const ye of Pe)
          console.warn(`[ugsci] GitHub source '${ye.label}' error: ${ye.message}`);
        d.warning(
          `部分源加载失败: ${Pe.map((ye) => ye.label).join(", ")}`
        );
      }
    } catch (ge) {
      d.error(ge.message || "加载 GitHub 技能源失败"), Ae([]);
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
        const ge = await Kn(
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
        d.error(ge.message || "搜索市场失败"), K([]);
      } finally {
        Se(!1);
      }
    },
    []
  );
  a(() => (Le.current && clearTimeout(Le.current), Le.current = setTimeout(() => {
    G(C, g, {});
  }, 400), () => {
    Le.current && clearTimeout(Le.current);
  }), [C, g, G]);
  const ce = () => {
    G(C, g, $);
  }, k = async (m) => {
    var pe;
    if (!X) {
      d.warning("请先选择安装目标专家");
      return;
    }
    const Y = `${m.source}:${m.slug}`;
    try {
      ie((ye) => ({ ...ye, [Y]: "starting" }));
      const ge = await ft(
        X,
        m.source_url,
        !0
      );
      ie((ye) => ({ ...ye, [Y]: "installing" }));
      const Pe = 60;
      for (let ye = 0; ye < Pe; ye++) {
        await new Promise((Oe) => setTimeout(Oe, 2e3));
        const ve = await Et(
          X,
          ge.task_id
        );
        if (ve.status === "completed" && ((pe = ve.result) != null && pe.installed)) {
          d.success(`技能「${ve.result.name || m.name}」安装成功`), ie((Oe) => {
            const Me = { ...Oe };
            return delete Me[Y], Me;
          });
          return;
        }
        if (ve.status === "failed")
          throw new Error(ve.error || "安装失败");
        if (ve.status === "cancelled") {
          d.info("安装已取消"), ie((Oe) => {
            const Me = { ...Oe };
            return delete Me[Y], Me;
          });
          return;
        }
      }
      throw new Error("安装超时");
    } catch (ge) {
      d.error(ge.message || "安装技能失败"), ie((Pe) => {
        const ye = { ...Pe };
        return delete ye[Y], ye;
      });
    }
  }, xe = (m) => {
    window.history.pushState({}, "", m), window.dispatchEvent(new PopStateEvent("popstate"));
  }, Ce = async (m) => {
    var pe;
    if (!X) {
      d.warning("请先选择安装目标专家");
      return;
    }
    const Y = `github:${m.sourceId}:${m.name}`;
    try {
      ie((ye) => ({ ...ye, [Y]: "starting" }));
      const ge = await ft(
        X,
        m.source_url,
        !0
      );
      ie((ye) => ({ ...ye, [Y]: "installing" }));
      const Pe = 60;
      for (let ye = 0; ye < Pe; ye++) {
        await new Promise((Oe) => setTimeout(Oe, 2e3));
        const ve = await Et(
          X,
          ge.task_id
        );
        if (ve.status === "completed" && ((pe = ve.result) != null && pe.installed)) {
          d.success(`技能「${ve.result.name || m.name}」安装成功`), ie((Oe) => {
            const Me = { ...Oe };
            return delete Me[Y], Me;
          });
          return;
        }
        if (ve.status === "failed")
          throw new Error(ve.error || "安装失败");
        if (ve.status === "cancelled") {
          d.info("安装已取消"), ie((Oe) => {
            const Me = { ...Oe };
            return delete Me[Y], Me;
          });
          return;
        }
      }
      throw new Error("安装超时");
    } catch (ge) {
      d.error(ge.message || "安装技能失败"), ie((Pe) => {
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
      e.createElement(E, {
        placeholder: "搜索技能市场...",
        prefix: U ? e.createElement(U) : void 0,
        value: C,
        onChange: (m) => re(m.target.value),
        allowClear: !0,
        style: { flex: 1, minWidth: 200, maxWidth: 400 }
      }),
      F.length > 0 ? e.createElement(O, {
        value: g || void 0,
        onChange: (m) => se(m || ""),
        placeholder: "全部分类",
        allowClear: !0,
        style: { minWidth: 150 },
        options: [
          { value: "", label: "全部分类" },
          ...F.map((m) => ({ value: m.id, label: m.label }))
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
          onChange: (m) => S(m),
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
        N,
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
          N,
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
        T,
        { gutter: [12, 12] },
        ...ze.map((m) => {
          const Y = `github:${m.sourceId}:${m.name}`, pe = Ee[Y];
          return e.createElement(
            v,
            { key: Y, xs: 24, sm: 12, md: 8, lg: 6 },
            e.createElement(
              f,
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
                  b,
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
                    N,
                    { color: "blue", style: { fontSize: 10 } },
                    m.sourceLabel
                  ),
                  m.version ? e.createElement(
                    N,
                    { style: { fontSize: 10 } },
                    `v${m.version}`
                  ) : null
                ),
                pe ? e.createElement(
                  c,
                  {
                    size: "small",
                    disabled: !0,
                    icon: z ? e.createElement(z) : void 0
                  },
                  pe === "starting" ? "启动中" : "安装中"
                ) : e.createElement(
                  c,
                  {
                    type: "primary",
                    size: "small",
                    icon: y ? e.createElement(y) : void 0,
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
      _ ? e.createElement(_, {
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
      T,
      { gutter: [12, 12] },
      ...$e.map((m) => {
        const Y = `${m.source}:${m.slug}`, pe = Ee[Y];
        return e.createElement(
          v,
          { key: Y, xs: 24, sm: 12, md: 8, lg: 6 },
          e.createElement(
            f,
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
                b,
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
                  N,
                  { color: "geekblue", style: { fontSize: 10 } },
                  m.source
                ),
                m.version ? e.createElement(
                  N,
                  { style: { fontSize: 10 } },
                  `v${m.version}`
                ) : null
              ),
              pe ? e.createElement(
                c,
                {
                  size: "small",
                  disabled: !0,
                  icon: z ? e.createElement(z) : void 0
                },
                pe === "starting" ? "启动中" : "安装中"
              ) : e.createElement(
                c,
                {
                  type: "primary",
                  size: "small",
                  icon: y ? e.createElement(y) : void 0,
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
    H ? e.createElement(
      W,
      {
        title: e.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 8 } },
          H.icon_url ? e.createElement("img", {
            src: H.icon_url,
            alt: H.name,
            style: { width: 28, height: 28, borderRadius: 4 }
          }) : e.createElement(
            "span",
            { style: { fontSize: 20 } },
            "📦"
          ),
          e.createElement("span", null, H.name)
        ),
        open: !0,
        onClose: () => he(null),
        width: 480,
        extra: e.createElement(
          c,
          {
            type: "primary",
            icon: y ? e.createElement(y) : void 0,
            onClick: () => {
              k(H);
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
          H.source
        ),
        e.createElement(
          w.Item,
          { label: "描述" },
          H.description || "-"
        ),
        H.version ? e.createElement(
          w.Item,
          { label: "版本" },
          H.version
        ) : null,
        H.author ? e.createElement(
          w.Item,
          { label: "作者" },
          H.author
        ) : null,
        e.createElement(
          w.Item,
          { label: "来源链接" },
          e.createElement(
            "a",
            { href: H.source_url, target: "_blank" },
            H.source_url
          )
        )
      ),
      H.stats ? e.createElement(
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
          ...Object.entries(H.stats).map(
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
      }), d.success(`专家「${m.name}」创建成功，已跳转至专家`), xe("/ugsci-experts");
    } catch (Y) {
      d.error(Y.message || "创建专家失败");
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
    e.createElement(E, {
      placeholder: "搜索专家模板...",
      prefix: U ? e.createElement(U) : void 0,
      value: le,
      onChange: (m) => me(m.target.value),
      allowClear: !0,
      style: { marginBottom: 16, maxWidth: 400 }
    }),
    e.createElement(
      T,
      { gutter: [12, 12] },
      ...et.map(
        (m) => e.createElement(
          v,
          { key: m.id, xs: 24, sm: 12, md: 8 },
          e.createElement(
            f,
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
                    N,
                    { color: "blue", style: { fontSize: 10 } },
                    m.category
                  ),
                  m.approvalLevel === "MANUAL" ? e.createElement(
                    N,
                    { color: "orange", style: { fontSize: 10 } },
                    "需审批"
                  ) : e.createElement(
                    N,
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
                  icon: I ? e.createElement(I) : void 0
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
        j,
        { type: "secondary", style: { fontSize: 12 } },
        "更多专家模板持续更新中，未来将支持 OpenScience、RPA 等行业扩展"
      )
    )
  ), Lt = [
    {
      key: "skills",
      label: e.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        I ? e.createElement(I, { style: { fontSize: 14 } }) : null,
        "技能市场"
      ),
      children: Ze
    },
    {
      key: "experts",
      label: e.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        x ? e.createElement(x, { style: { fontSize: 14 } }) : null,
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
              G(C, g, {}), je();
            },
            loading: oe || Ne
          },
          "刷新"
        )
      )
    }),
    e.createElement(V, {
      items: Lt,
      activeKey: p,
      onChange: (m) => ee(m)
    }),
    // Source config modal
    e.createElement(Gn, {
      open: We,
      onClose: () => Be(!1),
      sources: de,
      onChange: (m) => {
        fe(m), je(m);
      }
    })
  );
}
function qn() {
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
    component: In
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
    component: Bn
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
    component: Nn
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
    component: Vn
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
  const E = [
    "core.skills",
    "core.tools",
    "core.mcp",
    "core.acp",
    "core.agent-config",
    "core.agent-stats",
    "core.skill-pool"
  ];
  for (const d of E) {
    try {
      const v = e.menu.snapshot("primary.agentScoped").find((f) => f.id === d);
      v && e.menu.replace(a, d, {
        ...v,
        visible: () => !Ge()
      });
    } catch {
    }
    try {
      const v = e.menu.snapshot("primary.settings").find((f) => f.id === d);
      v && e.menu.replace(a, d, {
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
    qn();
  } catch (e) {
    console.error("[ugsci] Failed to build plugin:", e), setTimeout(rt, 500);
  }
}
var ht;
if ((ht = window.QwenPaw) != null && ht.host)
  rt();
else {
  const e = setInterval(() => {
    var t;
    (t = window.QwenPaw) != null && t.host && (clearInterval(e), rt());
  }, 200);
  setTimeout(() => clearInterval(e), 1e4);
}
