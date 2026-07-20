function E() {
  var t;
  const e = (t = window.QwenPaw) == null ? void 0 : t.host;
  if (!e) throw new Error("[ugsci] QwenPaw.host not available");
  return e;
}
function Lt() {
  try {
    return E().getApiToken() || "";
  } catch {
    return "";
  }
}
function ht(e) {
  return E().getApiUrl(e);
}
function vt(e) {
  const t = Lt();
  return {
    "Content-Type": "application/json",
    ...t ? { Authorization: `Bearer ${t}` } : {},
    ...e
  };
}
async function te(e, t) {
  const l = await fetch(ht(e), {
    ...t,
    headers: { ...vt(), ...(t == null ? void 0 : t.headers) || {} }
  });
  if (!l.ok) {
    const n = await l.text().catch(() => "");
    throw new Error(n || `HTTP ${l.status}`);
  }
  return l.status === 204 ? null : l.json();
}
async function st() {
  const e = await te("/agents");
  return (e == null ? void 0 : e.agents) || [];
}
async function Ye(e) {
  return te(`/agents/${encodeURIComponent(e)}`);
}
async function ot(e) {
  return await te("/skills", {
    headers: { "X-Agent-Id": e }
  }) || [];
}
async function it() {
  return await te("/skills/pool") || [];
}
async function Mt() {
  return await te("/skills/workspaces") || [];
}
async function Bt() {
  return await te("/mcp") || [];
}
const Pe = {
  background: "#0072f5",
  color: "#fff",
  fontSize: 13,
  fontWeight: 600,
  border: "none",
  borderRadius: 8
};
function Ne() {
  try {
    return localStorage.getItem("qwenpaw_sidebar_mode") === "simple";
  } catch {
    return !1;
  }
}
function ct(e, t) {
  const l = E();
  return l.ReactMarkdown && l.remarkGfm ? t.createElement(
    l.ReactMarkdown,
    { remarkPlugins: [l.remarkGfm] },
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
const jt = [
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
async function Dt(e, t) {
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
  await fetch(ht("/console/chat"), {
    method: "POST",
    headers: {
      ...vt(),
      "X-Agent-Id": e
    },
    body: JSON.stringify(l)
  });
}
function Ve(e, t) {
  const l = e.find(
    (a) => a.name === t || a.name === t.replace(/\s+/g, "")
  );
  if (l) return l.id;
  const n = e.find(
    (a) => a.name.includes(t) || t.includes(a.name) || a.name.replace(/\s+/g, "").includes(t.replace(/\s+/g, ""))
  );
  return n ? n.id : null;
}
function Nt(e) {
  var l;
  const t = e.members.map((n) => `- ${n.emoji} ${n.name}（${n.role}）`).join(`
`);
  if (e.custom && e.steps && e.steps.length > 0) {
    const n = e.steps.map((r, o) => {
      const i = r.passContext ? "（传递上一步的结果作为上下文）" : "（独立执行，不传递上下文）";
      return `${o + 1}. 向「${r.agentName}」发送请求：${r.instruction} ${i}`;
    }).join(`
`);
    return `${e.mode === "pipeline" ? "请按顺序依次执行以下步骤，每步使用 chat_with_agent 咨询对应专家：" : e.mode === "roundtable" ? "请同时向以下专家分别发送独立请求（不传递上下文），收集所有结果后综合：" : `你是团队协调者（${e.coordinatorName || ((l = e.members[0]) == null ? void 0 : l.name) || ""}），请按需调用以下专家完成任务：`}

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
function Ut({ team: e }) {
  const t = E().React, { Typography: l, Tag: n } = E().antd, { Text: a } = l, r = {
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
      ...f ? i.map((p, g) => {
        const $ = e.members.find(
          (b) => b.name === p.agentName
        );
        return [
          g > 0 && e.mode !== "roundtable" ? t.createElement(
            "div",
            {
              key: `arrow-${g}`,
              style: {
                textAlign: "center",
                color: o[e.mode],
                fontSize: 14
              }
            },
            r[e.mode]
          ) : null,
          t.createElement(
            "div",
            {
              key: `step-${g}`,
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
            t.createElement(
              "span",
              { style: { fontSize: 16 } },
              ($ == null ? void 0 : $.emoji) || "👤"
            ),
            t.createElement(
              "div",
              null,
              t.createElement(
                a,
                { strong: !0, style: { fontSize: 12 } },
                p.agentName
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
                p.instruction
              ),
              p.passContext ? t.createElement(
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
      }).flat() : e.members.map((p, g) => [
        g > 0 && e.mode !== "roundtable" ? t.createElement(
          "div",
          {
            key: `arrow-${g}`,
            style: {
              textAlign: "center",
              color: o[e.mode],
              fontSize: 14
            }
          },
          r[e.mode]
        ) : null,
        t.createElement(
          "div",
          {
            key: `member-${g}`,
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
          t.createElement("span", { style: { fontSize: 16 } }, p.emoji),
          t.createElement(
            "div",
            null,
            t.createElement(
              a,
              { strong: !0, style: { fontSize: 12 } },
              p.name
            ),
            t.createElement(
              "div",
              { style: { fontSize: 11, color: "#8c8c8c" } },
              p.role
            )
          )
        )
      ]).flat()
    )
  );
}
function Ft({
  open: e,
  onClose: t,
  agents: l,
  editingTeam: n,
  onSaved: a
}) {
  const r = E().React, { useState: o, useEffect: i, useCallback: f } = r, {
    Modal: p,
    Input: g,
    Button: $,
    Select: b,
    Tag: h,
    Typography: H,
    Switch: _,
    Empty: D,
    message: P,
    Divider: F,
    Steps: w
  } = E().antd, { PlusOutlined: J, DeleteOutlined: O, SaveOutlined: A, ArrowRightOutlined: B } = E().antdIcons || {}, { Text: R, Paragraph: u } = H, [T, z] = o(""), [G, I] = o("🤝"), [x, d] = o(""), [v, W] = o(
    "pipeline"
  ), [Q, L] = o(""), [m, Y] = o(""), [s, Z] = o([]), [U, V] = o([]), [ae, k] = o(!1);
  i(() => {
    e && (n ? (z(n.name), I(n.emoji), d(n.description), W(n.mode), L(n.coordinatorName || ""), Y(n.taskTemplate), Z(n.steps || []), V(n.members.map((N) => N.name))) : (z(""), I("🤝"), d(""), W("pipeline"), L(""), Y(`请执行以下任务：
任务描述：{任务描述}`), Z([]), V([])));
  }, [e, n]);
  const S = f(() => {
    if (v === "roundtable") {
      const N = U.map((M) => ({
        agentName: M,
        instruction: "请给出你的专业评估意见",
        passContext: !1
      }));
      Z(N);
    } else if (v === "pipeline") {
      const N = new Map(s.map((le) => [le.agentName, le])), M = U.map((le) => N.get(le) || {
        agentName: le,
        instruction: "请完成你的专业部分",
        passContext: !0
      });
      Z(M);
    }
  }, [v, U, s]), ne = (N) => {
    U.includes(N) || (V([...U, N]), v === "coordinator" && !Q && L(N));
  }, y = (N) => {
    V(U.filter((M) => M !== N)), Z(s.filter((M) => M.agentName !== N)), Q === N && L(U[0] || "");
  }, se = (N, M, le) => {
    const q = [...s];
    q[N] = { ...q[N], [M]: le }, Z(q);
  }, re = () => {
    if (!T.trim()) {
      P.warning("请输入团队名称");
      return;
    }
    if (U.length < 2) {
      P.warning("至少需要选择 2 个成员");
      return;
    }
    if (!m.trim()) {
      P.warning("请输入任务模板");
      return;
    }
    if (v === "coordinator" && !Q) {
      P.warning("请选择协调者");
      return;
    }
    k(!0);
    try {
      const N = U.map(
        (ye) => {
          var ze;
          const oe = l.find((Oe) => Oe.name === ye);
          return {
            name: ye,
            role: ((ze = oe == null ? void 0 : oe.description) == null ? void 0 : ze.slice(0, 30)) || "团队成员",
            emoji: "👤"
          };
        }
      );
      let M = s;
      (s.length === 0 || s.length !== U.length) && (M = U.map((ye) => ({
        agentName: ye,
        instruction: "请完成你的专业部分",
        passContext: v === "pipeline"
      })));
      const le = {
        id: (n == null ? void 0 : n.id) || `custom-${Date.now()}`,
        name: T.trim(),
        emoji: G,
        category: "自定义",
        description: x.trim() || `${T.trim()}（${U.length}人团队）`,
        mode: v,
        members: N,
        coordinatorName: v === "coordinator" ? Q : void 0,
        taskTemplate: m.trim(),
        orchestrationPrompt: "",
        // Custom teams use steps-based instructions
        steps: M,
        custom: !0,
        createdAt: (n == null ? void 0 : n.createdAt) || Date.now()
      }, q = Ke(), Ee = q.findIndex((ye) => ye.id === le.id);
      Ee >= 0 ? q[Ee] = le : q.push(le), St(q), P.success(n ? "团队已更新" : "团队已创建"), a(), t();
    } catch (N) {
      P.error(N.message || "保存失败");
    } finally {
      k(!1);
    }
  }, he = [
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
  ], ve = l.filter(
    (N) => !U.includes(N.name)
  );
  return r.createElement(
    p,
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
      onOk: re,
      okText: "保存团队",
      confirmLoading: ae,
      okButtonProps: {
        icon: A ? r.createElement(A) : void 0
      }
    },
    // Step 1: Basic info
    r.createElement(
      "div",
      { style: { marginBottom: 16 } },
      r.createElement(
        R,
        {
          strong: !0,
          style: { display: "block", marginBottom: 8, fontSize: 13 }
        },
        "1. 基本信息"
      ),
      r.createElement(
        "div",
        { style: { display: "flex", gap: 8, marginBottom: 8 } },
        r.createElement(b, {
          value: G,
          onChange: (N) => I(N),
          style: { width: 60 },
          options: he.map((N) => ({ value: N, label: N })),
          optionRender: (N) => r.createElement("span", { style: { fontSize: 18 } }, N.value)
        }),
        r.createElement(g, {
          placeholder: "团队名称（如：储层评价团队）",
          value: T,
          onChange: (N) => z(N.target.value),
          style: { flex: 1 }
        })
      ),
      r.createElement(g.TextArea, {
        placeholder: "团队描述（简述团队的目标和适用场景）",
        value: x,
        onChange: (N) => d(N.target.value),
        rows: 2,
        style: { marginBottom: 8 }
      }),
      r.createElement(
        "div",
        { style: { display: "flex", gap: 8, alignItems: "center" } },
        r.createElement(
          R,
          { type: "secondary", style: { fontSize: 12 } },
          "协同模式："
        ),
        r.createElement(b, {
          value: v,
          onChange: (N) => W(N),
          style: { width: 160 },
          options: [
            { value: "pipeline", label: "🔄 流水线（依次执行）" },
            { value: "roundtable", label: "🔀 圆桌讨论（独立评估）" },
            { value: "coordinator", label: "🎯 协调者（由协调者主导）" }
          ]
        })
      )
    ),
    r.createElement(F, { style: { margin: "12px 0" } }),
    // Step 2: Select members
    r.createElement(
      "div",
      { style: { marginBottom: 16 } },
      r.createElement(
        R,
        {
          strong: !0,
          style: { display: "block", marginBottom: 8, fontSize: 13 }
        },
        "2. 选择团队成员"
      ),
      // Available agents
      ve.length > 0 ? r.createElement(
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
        ...ve.map(
          (N) => r.createElement(
            $,
            {
              key: N.id,
              size: "small",
              icon: J ? r.createElement(J) : void 0,
              onClick: () => ne(N.name)
            },
            N.name
          )
        )
      ) : null,
      // Selected members
      U.length === 0 ? r.createElement(D, {
        description: "请从上方添加团队成员",
        image: D.PRESENTED_IMAGE_SIMPLE
      }) : r.createElement(
        "div",
        { style: { display: "flex", flexDirection: "column", gap: 4 } },
        ...U.map(
          (N) => r.createElement(
            "div",
            {
              key: N,
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
                R,
                { strong: !0, style: { fontSize: 13 } },
                N
              ),
              v === "coordinator" && Q === N ? r.createElement(
                h,
                { color: "blue", style: { fontSize: 10 } },
                "协调者"
              ) : null
            ),
            r.createElement(
              "div",
              { style: { display: "flex", gap: 4 } },
              v === "coordinator" ? r.createElement(
                $,
                {
                  size: "small",
                  type: "link",
                  onClick: () => L(N)
                },
                "设为协调者"
              ) : null,
              r.createElement(
                $,
                {
                  size: "small",
                  type: "link",
                  danger: !0,
                  icon: O ? r.createElement(O) : void 0,
                  onClick: () => y(N)
                },
                "移除"
              )
            )
          )
        )
      )
    ),
    r.createElement(F, { style: { margin: "12px 0" } }),
    // Step 3: Define execution steps (for pipeline/roundtable)
    U.length > 0 ? r.createElement(
      "div",
      { style: { marginBottom: 16 } },
      r.createElement(
        R,
        {
          strong: !0,
          style: { display: "block", marginBottom: 8, fontSize: 13 }
        },
        `3. 编排执行步骤${v === "roundtable" ? "（各步独立执行）" : v === "pipeline" ? "（依次执行，可传递上下文）" : "（由协调者决定调用顺序）"}`
      ),
      // Auto-sync button
      r.createElement(
        $,
        {
          size: "small",
          type: "dashed",
          onClick: S,
          style: { marginBottom: 8 }
        },
        "自动生成步骤"
      ),
      // Steps list
      s.length === 0 ? r.createElement(
        R,
        { type: "secondary", style: { fontSize: 12 } },
        "点击「自动生成步骤」或手动配置每步的指令"
      ) : r.createElement(
        "div",
        { style: { display: "flex", flexDirection: "column", gap: 6 } },
        ...s.map(
          (N, M) => r.createElement(
            "div",
            {
              key: M,
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
              v === "pipeline" ? r.createElement(
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
                `${M + 1}`
              ) : r.createElement(
                "span",
                { style: { fontSize: 14 } },
                "🔀"
              ),
              r.createElement(
                h,
                { color: "blue", style: { fontSize: 11 } },
                N.agentName
              ),
              r.createElement(
                "div",
                { style: { flex: 1 } },
                r.createElement(g, {
                  placeholder: "请输入该步骤的指令...",
                  value: N.instruction,
                  onChange: (le) => se(M, "instruction", le.target.value),
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
              r.createElement(_, {
                size: "small",
                checked: N.passContext,
                onChange: (le) => se(M, "passContext", le)
              }),
              r.createElement(
                R,
                { type: "secondary", style: { fontSize: 11 } },
                N.passContext ? "传递上一步结果作为上下文" : "独立执行"
              )
            )
          )
        )
      )
    ) : null,
    r.createElement(F, { style: { margin: "12px 0" } }),
    // Step 4: Task template
    r.createElement(
      "div",
      null,
      r.createElement(
        R,
        {
          strong: !0,
          style: { display: "block", marginBottom: 8, fontSize: 13 }
        },
        `${U.length > 0 ? "4" : "3"}. 任务模板`
      ),
      r.createElement(g.TextArea, {
        placeholder: `输入任务模板，可用 {参数名} 作为占位符...

例如：
请对区块 {区块名} 的井 {井号} 进行储层评价`,
        value: m,
        onChange: (N) => Y(N.target.value),
        rows: 4,
        style: { fontFamily: "monospace", fontSize: 13 }
      }),
      r.createElement(
        R,
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
  onLaunch: l,
  onEdit: n,
  onDelete: a
}) {
  var x;
  const r = E().React, { useState: o } = r, { Card: i, Tag: f, Typography: p, Button: g, Tooltip: $ } = E().antd, {
    TeamOutlined: b,
    RocketOutlined: h,
    UserOutlined: H,
    EditOutlined: _,
    DeleteOutlined: D,
    DownOutlined: P,
    UpOutlined: F
  } = E().antdIcons || {}, { Text: w, Paragraph: J } = p, [O, A] = o(!1), B = {
    coordinator: { label: "协调者模式", color: "blue" },
    pipeline: { label: "流水线模式", color: "cyan" },
    roundtable: { label: "圆桌讨论", color: "purple" }
  }, R = B[e.mode] || B.coordinator, u = e.members.map((d) => {
    const v = Ve(t, d.name);
    return { ...d, found: !!v, agentId: v };
  }), T = u.filter((d) => d.found).length, z = T === e.members.length, G = e.coordinatorName || ((x = e.members[0]) == null ? void 0 : x.name), I = G ? Ve(t, G) : null;
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
            { color: R.color, style: { fontSize: 10 } },
            R.label
          ),
          r.createElement(
            f,
            { style: { fontSize: 10 } },
            `${T}/${e.members.length}`
          ),
          z ? null : r.createElement(
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
          $,
          { title: "编辑" },
          r.createElement(g, {
            type: "text",
            size: "small",
            icon: _ ? r.createElement(_) : void 0,
            onClick: (d) => {
              d.stopPropagation(), n(e);
            }
          })
        ) : null,
        a ? r.createElement(
          $,
          { title: "删除" },
          r.createElement(g, {
            type: "text",
            size: "small",
            danger: !0,
            icon: D ? r.createElement(D) : void 0,
            onClick: (d) => {
              d.stopPropagation(), a(e);
            }
          })
        ) : null
      ) : null
    ),
    // Description
    r.createElement(
      J,
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
      ...u.map(
        (d) => r.createElement(
          $,
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
              w,
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
      g,
      {
        type: "link",
        size: "small",
        style: { padding: "0 0 4px 0", fontSize: 11, height: "auto" },
        onClick: (d) => {
          d.stopPropagation(), A(!O);
        },
        icon: O ? F ? r.createElement(F) : "▲" : P ? r.createElement(P) : "▼"
      },
      O ? "收起流程" : "查看执行流程"
    ),
    O ? r.createElement(Ut, { team: e }) : null,
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
        G ? `协调者: ${G}` : ""
      ),
      r.createElement(
        g,
        {
          type: "primary",
          size: "small",
          icon: h ? r.createElement(h) : void 0,
          disabled: !I,
          onClick: () => l(e),
          style: Pe
        },
        "发起团队任务"
      )
    )
  );
}
function Ht({
  agents: e,
  onLaunch: t
}) {
  const l = E().React, { useMemo: n, useState: a, useCallback: r, useEffect: o } = l, {
    Row: i,
    Col: f,
    Input: p,
    Empty: g,
    Typography: $,
    Tag: b,
    Button: h,
    Divider: H,
    message: _,
    Popconfirm: D
  } = E().antd, { SearchOutlined: P, TeamOutlined: F, PlusOutlined: w, RocketOutlined: J } = E().antdIcons || {}, { Text: O } = $, [A, B] = a(""), [R, u] = a([]), [T, z] = a(!1), [G, I] = a(null);
  o(() => {
    u(Ke());
  }, []);
  const x = r(() => {
    u(Ke());
  }, []), d = r(
    (s) => {
      const U = Ke().filter((V) => V.id !== s.id);
      St(U), u(U), _.success(`团队「${s.name}」已删除`);
    },
    [_]
  ), v = r((s) => {
    I(s), z(!0);
  }, []), W = r(() => {
    I(null), z(!0);
  }, []), Q = n(() => [...R, ...jt], [R]), L = n(() => {
    if (!A.trim()) return Q;
    const s = A.toLowerCase();
    return Q.filter(
      (Z) => Z.name.toLowerCase().includes(s) || Z.description.toLowerCase().includes(s) || Z.category.toLowerCase().includes(s)
    );
  }, [Q, A]), m = L.filter((s) => s.custom), Y = L.filter((s) => !s.custom);
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
        O,
        { style: { fontSize: 13, color: "#389e0d" } },
        "多智能体协同 — 选择预设团队或创建自定义团队，支持流水线、圆桌讨论、协调者三种编排模式。"
      ),
      l.createElement(
        h,
        {
          type: "primary",
          size: "small",
          icon: w ? l.createElement(w) : void 0,
          onClick: W,
          style: Pe
        },
        "创建专家团"
      )
    ),
    // Search
    l.createElement(p, {
      placeholder: "搜索团队名称、描述或类别...",
      prefix: P ? l.createElement(P) : void 0,
      value: A,
      onChange: (s) => B(s.target.value),
      allowClear: !0,
      style: { marginBottom: 16, maxWidth: 400 }
    }),
    // Custom teams section
    m.length > 0 ? l.createElement(
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
          O,
          { strong: !0, style: { fontSize: 14 } },
          `自定义团队 (${m.length})`
        )
      ),
      l.createElement(
        i,
        { gutter: [12, 12] },
        ...m.map(
          (s) => l.createElement(
            f,
            { key: s.id, xs: 24, sm: 12, md: 8 },
            l.createElement(mt, {
              team: s,
              agents: e,
              onLaunch: t,
              onEdit: v,
              onDelete: d
            })
          )
        )
      ),
      l.createElement(H, { style: { margin: "16px 0" } })
    ) : null,
    // Preset teams section
    Y.length > 0 ? l.createElement(
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
          O,
          { strong: !0, style: { fontSize: 14 } },
          `预设团队 (${Y.length})`
        ),
        l.createElement(
          O,
          { type: "secondary", style: { fontSize: 12 } },
          "· 行业典型工作流模板"
        )
      ),
      l.createElement(
        i,
        { gutter: [12, 12] },
        ...Y.map(
          (s) => l.createElement(
            f,
            { key: s.id, xs: 24, sm: 12, md: 8 },
            l.createElement(mt, {
              team: s,
              agents: e,
              onLaunch: t
            })
          )
        )
      )
    ) : null,
    // Empty state
    L.length === 0 ? l.createElement(g, {
      description: "未找到匹配的专家团队，点击「创建专家团」自定义",
      image: g.PRESENTED_IMAGE_SIMPLE
    }) : null,
    // Team Builder Modal
    l.createElement(Ft, {
      open: T,
      onClose: () => {
        z(!1), I(null);
      },
      agents: e,
      editingTeam: G,
      onSaved: x
    })
  );
}
function Wt(e) {
  var l;
  const t = [];
  for (const n of e) {
    if (n.enabled === !1) continue;
    const a = (l = n.description) == null ? void 0 : l.trim();
    if (!a) continue;
    let r = a;
    if (r = r.replace(/\*\*(.+?)\*\*/g, "$1").replace(/\*(.+?)\*/g, "$1").replace(/`(.+?)`/g, "$1").replace(/^#+\s*/gm, "").trim(), /^(用于|帮助|提供|支持|实现|完成|分析|计算|生成|创建|检查)/.test(r) ? r = `请${r}` : /^(a |an |the )/i.test(r) ? r = `Help me with ${r}` : /[。？！.?!]$/.test(r) || (r = `帮我${r}`), r.length > 80 && (r = r.substring(0, 77) + "..."), t.push(r), t.length >= 4) break;
  }
  return t;
}
async function Gt(e) {
  return await te("/workspace/files", {
    headers: { "X-Agent-Id": e }
  }) || [];
}
async function qe(e, t, l) {
  await te(`/workspace/files/${encodeURIComponent(t)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify({ content: l })
  });
}
async function dt(e, t) {
  const l = await Ye(e);
  l.system_prompt_files = t, await te(`/agents/${encodeURIComponent(e)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(l)
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
async function Jt(e, t) {
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
async function Xt(e, t) {
  return te("/skills/batch-enable", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify(t)
  });
}
async function Kt(e, t) {
  return te("/skills/batch-disable", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify(t)
  });
}
async function Vt(e, t) {
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
async function qt(e, t) {
  return te("/mcp", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify(t)
  });
}
async function Yt(e, t) {
  return te(
    `/mcp/toggle/${encodeURIComponent(t)}`,
    {
      method: "PATCH",
      headers: { "X-Agent-Id": e }
    }
  );
}
async function Qt(e, t) {
  await te(`/skills/${encodeURIComponent(t)}/disable`, {
    method: "POST",
    headers: { "X-Agent-Id": e }
  });
}
function Zt(e) {
  const t = (e || "").trim();
  if (!t) return { number: 6, unit: "h" };
  const l = t.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/i);
  if (!l) return { number: 6, unit: "h" };
  const n = parseInt(l[1] || "0", 10), a = parseInt(l[2] || "0", 10), r = parseInt(l[3] || "0", 10), o = n * 60 + a + Math.round(r / 60);
  return o <= 0 ? { number: 6, unit: "h" } : o >= 60 && o % 60 === 0 ? { number: o / 60, unit: "h" } : { number: o, unit: "m" };
}
function en(e) {
  return e.unit === "h" ? `${e.number}h` : `${e.number}m`;
}
async function tn(e) {
  return te("/config/heartbeat", {
    headers: { "X-Agent-Id": e }
  });
}
async function nn(e, t) {
  return te("/config/heartbeat", {
    method: "PUT",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify(t)
  });
}
async function ln(e) {
  await te("/config/heartbeat/run", {
    method: "POST",
    headers: { "X-Agent-Id": e }
  });
}
async function an(e) {
  return te("/workspace/running-config", {
    headers: { "X-Agent-Id": e }
  });
}
async function rn(e, t) {
  return te("/workspace/running-config", {
    method: "PUT",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify(t)
  });
}
async function sn(e) {
  return (await te("/workspace/language", {
    headers: { "X-Agent-Id": e }
  })).language || "zh";
}
async function on(e, t) {
  await te("/workspace/language", {
    method: "PUT",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify({ language: t })
  });
}
async function cn() {
  return (await te("/config/user-timezone")).timezone || "UTC";
}
async function mn(e) {
  await te("/config/user-timezone", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ timezone: e })
  });
}
async function dn(e) {
  return await te("/workspace/system-prompt-files", {
    headers: { "X-Agent-Id": e }
  }) || [];
}
const ut = ["AGENTS.md", "SOUL.md", "PROFILE.md"];
function Qe({
  title: e,
  subtitle: t,
  extra: l
}) {
  const n = E().React, { Space: a } = E().antd;
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
    l ? n.createElement(a, null, l) : null
  );
}
function pt({
  items: e,
  max: t = 5,
  color: l = "blue",
  emptyText: n = "无"
}) {
  const a = E().React, { Tag: r } = E().antd;
  return !e || e.length === 0 ? a.createElement(
    "span",
    { style: { fontSize: 12, color: "#bfbfbf" } },
    n
  ) : a.createElement(
    "div",
    { style: { display: "flex", flexWrap: "wrap", gap: 4 } },
    ...e.slice(0, t).map(
      (o, i) => a.createElement(
        r,
        { key: i, color: l, style: { fontSize: 11, marginRight: 0 } },
        o
      )
    ),
    e.length > t ? a.createElement(
      r,
      { style: { fontSize: 11, marginRight: 0 } },
      `+${e.length - t}`
    ) : null
  );
}
function Tt({
  open: e,
  onClose: t,
  poolSkills: l,
  installedSkillNames: n,
  loading: a,
  onInstall: r
}) {
  const o = E().React, { useState: i, useEffect: f, useMemo: p } = o, { Modal: g, Button: $, Empty: b, Spin: h, Input: H, Tag: _, Tooltip: D, Typography: P } = E().antd, { CheckOutlined: F, SearchOutlined: w } = E().antdIcons || {}, { Text: J } = P, [O, A] = i([]), [B, R] = i("");
  f(() => {
    e && (A([]), R(""));
  }, [e]);
  const u = p(() => {
    if (!B.trim()) return l;
    const I = B.toLowerCase();
    return l.filter(
      (x) => {
        var d, v;
        return x.name.toLowerCase().includes(I) || ((d = x.description) == null ? void 0 : d.toLowerCase().includes(I)) || ((v = x.tags) == null ? void 0 : v.some((W) => W.toLowerCase().includes(I)));
      }
    );
  }, [l, B]), T = u.filter(
    (I) => !n.includes(I.name)
  ), z = (I) => {
    A(
      (x) => x.includes(I) ? x.filter((d) => d !== I) : [...x, I]
    );
  }, G = async () => {
    O.length !== 0 && (await r(O), A([]));
  };
  return o.createElement(
    g,
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
          J,
          { type: "secondary", style: { fontSize: 13 } },
          `已选择 ${O.length} 个技能`
        ),
        o.createElement(
          "div",
          { style: { display: "flex", gap: 8 } },
          o.createElement($, { onClick: t }, "取消"),
          o.createElement(
            $,
            {
              type: "primary",
              onClick: G,
              disabled: O.length === 0
            },
            O.length > 0 ? `添加 (${O.length})` : "添加"
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
      o.createElement(H, {
        placeholder: "搜索技能名称、描述或标签...",
        prefix: w ? o.createElement(w) : void 0,
        value: B,
        onChange: (I) => R(I.target.value),
        allowClear: !0,
        style: { flex: 1 }
      }),
      o.createElement(
        $,
        {
          size: "small",
          type: "primary",
          onClick: () => A(T.map((I) => I.name))
        },
        "全选"
      ),
      o.createElement(
        $,
        {
          size: "small",
          onClick: () => A([])
        },
        "清空"
      )
    ),
    // Skill grid (card style matching Skill Center)
    a ? o.createElement(
      "div",
      { style: { textAlign: "center", padding: 40 } },
      o.createElement(h, { size: "large" })
    ) : u.length === 0 ? o.createElement(b, {
      description: B ? "未找到匹配的技能" : "技能池暂无可用技能",
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
      ...u.map((I) => {
        const x = O.includes(I.name), d = n.includes(I.name);
        return o.createElement(
          "div",
          {
            key: I.name,
            onClick: () => !d && z(I.name),
            style: {
              position: "relative",
              padding: "10px 12px",
              border: `1px solid ${x ? "#0072f5" : "#e8e8e8"}`,
              borderRadius: 6,
              cursor: d ? "not-allowed" : "pointer",
              transition: "all 0.15s ease",
              background: x ? "rgba(0, 114, 245, 0.06)" : d ? "#fafafa" : "#fff",
              opacity: d ? 0.5 : 1,
              minHeight: 64
            }
          },
          x ? o.createElement(
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
            F ? o.createElement(F) : "✓"
          ) : null,
          d ? o.createElement(
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
                paddingRight: d || x ? 24 : 0
              }
            },
            o.createElement(
              "span",
              { style: { fontSize: 16 } },
              I.emoji || "⚡"
            ),
            o.createElement(
              D,
              { title: I.name },
              o.createElement(
                J,
                {
                  strong: !0,
                  style: {
                    fontSize: 13,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap"
                  }
                },
                I.name
              )
            )
          ),
          I.description ? o.createElement(
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
            I.description
          ) : null,
          I.tags && I.tags.length > 0 ? o.createElement(
            "div",
            {
              style: {
                marginTop: 4,
                display: "flex",
                gap: 2,
                flexWrap: "wrap"
              }
            },
            ...I.tags.slice(0, 2).map(
              (v, W) => o.createElement(
                _,
                {
                  key: W,
                  color: "cyan",
                  style: { fontSize: 10, marginRight: 0 }
                },
                v
              )
            )
          ) : null
        );
      })
    )
  );
}
const Ue = {
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
}, Me = {
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
function un({ agentId: e }) {
  const t = E().React, { useState: l, useEffect: n, useCallback: a } = t, {
    Switch: r,
    InputNumber: o,
    Select: i,
    Button: f,
    Spin: p,
    Space: g,
    Typography: $,
    message: b
  } = E().antd, { PlayCircleOutlined: h, SaveOutlined: H } = E().antdIcons || {}, { Text: _ } = $, [D, P] = l(!0), [F, w] = l(!1), [J, O] = l(!1), [A, B] = l(!1), [R, u] = l(6), [T, z] = l("h"), [G, I] = l("main"), [x, d] = l(300), [v, W] = l(!1), [Q, L] = l("08:00"), [m, Y] = l("22:00"), s = a(async () => {
    var S, ne;
    P(!0);
    try {
      const y = await tn(e), se = Zt(y.every ?? "6h");
      B(y.enabled ?? !1), u(se.number), z(se.unit), I(y.target ?? "main"), d(y.timeoutSeconds ?? 300), W(!!y.activeHours), L(((S = y.activeHours) == null ? void 0 : S.start) ?? "08:00"), Y(((ne = y.activeHours) == null ? void 0 : ne.end) ?? "22:00");
    } catch (y) {
      b.error(y.message || "加载心跳配置失败");
    } finally {
      P(!1);
    }
  }, [e]);
  n(() => {
    s();
  }, [s]);
  const Z = async () => {
    w(!0);
    try {
      await nn(e, {
        enabled: A,
        every: en({ number: R, unit: T }),
        target: G,
        timeoutSeconds: x,
        activeHours: v && Q && m ? { start: Q, end: m } : void 0
      }), b.success("心跳配置已保存");
    } catch (S) {
      b.error(S.message || "保存心跳配置失败");
    } finally {
      w(!1);
    }
  }, U = async () => {
    O(!0);
    try {
      await ln(e), b.success("已触发心跳检查");
    } catch (S) {
      b.error(S.message || "触发心跳失败");
    } finally {
      O(!1);
    }
  };
  if (D)
    return t.createElement(
      "div",
      { style: { textAlign: "center", padding: 40 } },
      t.createElement(p, { size: "large" })
    );
  const V = (S, ne, y) => t.createElement(
    "div",
    { style: zt },
    t.createElement("div", { style: Ue }, S),
    ne,
    y ? t.createElement(
      _,
      { type: "secondary", style: _t },
      y
    ) : null
  ), ae = (S, ne, y, se) => t.createElement(
    "div",
    { style: It },
    t.createElement(
      "div",
      null,
      t.createElement("div", { style: Ue }, S),
      ne
    ),
    t.createElement(
      "div",
      null,
      t.createElement("div", { style: Ue }, y),
      se
    )
  ), { Divider: k } = E().antd;
  return t.createElement(
    "div",
    { style: { paddingBottom: 8 } },
    // ── Section: 基本设置 ──
    t.createElement("div", { style: Me }, "基本设置"),
    V(
      "启用心跳",
      t.createElement(r, {
        checked: A,
        onChange: (S) => B(S)
      }),
      A ? "已启用，专家将定期自检" : "已停用"
    ),
    ae(
      "检查频率",
      t.createElement(
        g,
        null,
        t.createElement(o, {
          min: 1,
          value: R,
          onChange: (S) => u(S ?? 1),
          style: { width: "100%" }
        }),
        t.createElement(i, {
          value: T,
          onChange: (S) => z(S),
          style: { width: 90 },
          options: [
            { value: "m", label: "分钟" },
            { value: "h", label: "小时" }
          ]
        })
      ),
      "心跳目标",
      t.createElement(i, {
        value: G,
        onChange: (S) => I(S),
        style: { width: "100%" },
        options: [
          { value: "main", label: "主会话 (main)" },
          { value: "last", label: "最近会话 (last)" },
          { value: "inbox", label: "收件箱 (inbox)" }
        ]
      })
    ),
    V(
      "超时时间 (秒)",
      t.createElement(o, {
        min: 1,
        max: 3600,
        value: x,
        onChange: (S) => d(S ?? 300),
        style: { width: 200 }
      })
    ),
    // ── Section: 活跃时段 ──
    t.createElement(k, { style: { margin: "8px 0 16px" } }),
    t.createElement("div", { style: Me }, "活跃时段"),
    V(
      "启用活跃时段限制",
      t.createElement(r, {
        checked: v,
        onChange: (S) => W(S)
      }),
      "仅在指定时段内触发心跳"
    ),
    v ? ae(
      "开始时间",
      t.createElement("input", {
        type: "time",
        value: Q,
        onChange: (S) => L(S.target.value),
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
        onChange: (S) => Y(S.target.value),
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
          loading: F,
          onClick: Z,
          style: Pe
        },
        "保存配置"
      ),
      t.createElement(
        f,
        {
          icon: h ? t.createElement(h) : void 0,
          loading: J,
          onClick: U
        },
        "立即执行"
      )
    )
  );
}
function pn({
  agentId: e,
  onRefresh: t
}) {
  const l = E().React, { useState: n, useEffect: a, useCallback: r } = l, {
    List: o,
    Tag: i,
    Switch: f,
    Button: p,
    Empty: g,
    Spin: $,
    Typography: b,
    message: h
  } = E().antd, { PlusOutlined: H, ReloadOutlined: _, DeleteOutlined: D } = E().antdIcons || {}, { Text: P, Paragraph: F } = b, [w, J] = n([]), [O, A] = n(!0), [B, R] = n(!1), [u, T] = n([]), [z, G] = n(!1), I = r(async () => {
    A(!0);
    try {
      const L = await ot(e);
      J(L);
    } catch (L) {
      h.error(L.message || "加载技能失败"), J([]);
    } finally {
      A(!1);
    }
  }, [e]);
  a(() => {
    I();
  }, [I]);
  const x = async () => {
    R(!0), G(!0);
    try {
      const L = await it();
      T(L);
    } catch (L) {
      h.error(L.message || "加载技能池失败");
    } finally {
      G(!1);
    }
  }, d = async (L) => {
    let m = 0, Y = 0;
    for (const s of L)
      try {
        await wt(e, s), m++;
      } catch {
        Y++;
      }
    m > 0 ? (h.success(
      `成功添加 ${m} 个技能${Y > 0 ? `，${Y} 个失败` : ""}`
    ), I(), t()) : Y > 0 && h.error("添加技能失败"), R(!1);
  }, v = async (L, m) => {
    try {
      m ? await Jt(e, L.name) : await Qt(e, L.name), h.success(m ? "已启用" : "已停用"), I(), t();
    } catch (Y) {
      h.error(Y.message || "操作失败");
    }
  }, W = async (L) => {
    try {
      await xt(e, L), h.success(`技能「${L}」已移除`), I(), t();
    } catch (m) {
      h.error(m.message || "移除技能失败");
    }
  };
  if (O)
    return l.createElement(
      "div",
      { style: { textAlign: "center", padding: 40 } },
      l.createElement($, { size: "large" })
    );
  const Q = w.filter((L) => L.enabled !== !1);
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
        P,
        { strong: !0 },
        `技能列表 (${w.length}，已启用 ${Q.length})`
      ),
      l.createElement(
        "div",
        { style: { display: "flex", gap: 8 } },
        l.createElement(
          p,
          {
            size: "small",
            icon: _ ? l.createElement(_) : void 0,
            onClick: I
          },
          "刷新"
        ),
        l.createElement(
          p,
          {
            type: "primary",
            size: "small",
            icon: H ? l.createElement(H) : void 0,
            onClick: x,
            style: Pe
          },
          "从技能池添加"
        )
      )
    ),
    w.length === 0 ? l.createElement(g, {
      description: "该专家暂无技能",
      image: g.PRESENTED_IMAGE_SIMPLE
    }) : l.createElement(o, {
      dataSource: w,
      renderItem: (L) => l.createElement(
        o.Item,
        {
          actions: [
            l.createElement(f, {
              key: "toggle",
              size: "small",
              checked: L.enabled !== !1,
              onChange: (m) => v(L, m)
            }),
            l.createElement(
              p,
              {
                key: "del",
                type: "link",
                size: "small",
                danger: !0,
                icon: D ? l.createElement(D) : void 0,
                onClick: () => W(L.name)
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
            L.emoji ? l.createElement(
              "span",
              { style: { fontSize: 16 } },
              L.emoji
            ) : null,
            l.createElement(P, { strong: !0 }, L.name),
            L.version_text ? l.createElement(
              i,
              { style: { fontSize: 10 } },
              `v${L.version_text}`
            ) : null
          ),
          L.description ? l.createElement(
            F,
            {
              type: "secondary",
              style: { fontSize: 12, margin: 0 },
              ellipsis: { rows: 2 }
            },
            L.description
          ) : null
        )
      )
    }),
    l.createElement(Tt, {
      open: B,
      onClose: () => R(!1),
      poolSkills: u,
      installedSkillNames: w.map((L) => L.name),
      loading: z,
      onInstall: d
    })
  );
}
function gn({
  agentId: e,
  onRefresh: t,
  isActive: l
}) {
  const n = E().React, { useState: a, useEffect: r, useCallback: o } = n, {
    List: i,
    Tag: f,
    Button: p,
    Empty: g,
    Spin: $,
    Modal: b,
    Input: h,
    Typography: H,
    message: _
  } = E().antd, { PlusOutlined: D, ReloadOutlined: P, DeleteOutlined: F } = E().antdIcons || {}, { Text: w, Paragraph: J } = H, { TextArea: O } = h, [A, B] = a([]), [R, u] = a(!0), [T, z] = a(!1), [G, I] = a(`{
  "mcpServers": {
    "example-client": {
      "command": "npx",
      "args": ["-y", "@example/mcp-server"],
      "env": {}
    }
  }
}`), [x, d] = a(!1), v = o(async () => {
    u(!0);
    try {
      const m = await Ct(e);
      B(m);
    } catch (m) {
      _.error(m.message || "加载 MCP 失败"), B([]);
    } finally {
      u(!1);
    }
  }, [e]);
  r(() => {
    v();
  }, [v]), r(() => {
    l && v();
  }, [l, v]);
  const W = async (m) => {
    try {
      await Yt(e, m), _.success("已切换 MCP 状态"), v(), t();
    } catch (Y) {
      _.error(Y.message || "切换失败");
    }
  }, Q = async (m) => {
    try {
      await kt(e, m), _.success(`MCP「${m}」已移除`), v(), t();
    } catch (Y) {
      _.error(Y.message || "移除 MCP 失败");
    }
  }, L = async () => {
    d(!0);
    try {
      const m = JSON.parse(G), Y = m.mcpServers || m, s = Object.entries(Y);
      if (s.length === 0) {
        _.warning("未找到 MCP 客户端配置");
        return;
      }
      for (const [Z, U] of s) {
        const V = U, ae = V.url ? "streamable_http" : "stdio";
        await qt(e, {
          client_key: Z,
          client: {
            name: V.name || Z,
            description: V.description || "",
            enabled: !0,
            transport: ae,
            url: V.url || "",
            command: V.command || "",
            args: V.args || [],
            env: V.env || {},
            cwd: V.cwd || "",
            headers: V.headers || {}
          }
        });
      }
      _.success("MCP 客户端已创建"), z(!1), v(), t();
    } catch (m) {
      m instanceof SyntaxError ? _.error("JSON 格式错误：" + m.message) : _.error(m.message || "创建 MCP 失败");
    } finally {
      d(!1);
    }
  };
  return R ? n.createElement(
    "div",
    { style: { textAlign: "center", padding: 40 } },
    n.createElement($, { size: "large" })
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
      n.createElement(w, { strong: !0 }, `MCP 客户端 (${A.length})`),
      n.createElement(
        "div",
        { style: { display: "flex", gap: 8 } },
        n.createElement(
          p,
          {
            size: "small",
            icon: P ? n.createElement(P) : void 0,
            onClick: v
          },
          "刷新"
        ),
        n.createElement(
          p,
          {
            type: "primary",
            size: "small",
            icon: D ? n.createElement(D) : void 0,
            onClick: () => z(!0),
            style: Pe
          },
          "添加 MCP"
        )
      )
    ),
    A.length === 0 ? n.createElement(g, {
      description: "该专家暂无 MCP 客户端",
      image: g.PRESENTED_IMAGE_SIMPLE
    }) : n.createElement(i, {
      dataSource: A,
      renderItem: (m) => n.createElement(
        i.Item,
        {
          actions: [
            n.createElement(
              p,
              {
                key: "toggle",
                size: "small",
                onClick: () => W(m.key)
              },
              m.enabled ? "停用" : "启用"
            ),
            n.createElement(
              p,
              {
                key: "del",
                type: "link",
                size: "small",
                danger: !0,
                icon: F ? n.createElement(F) : void 0,
                onClick: () => Q(m.key)
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
              f,
              {
                color: m.enabled ? "green" : "default",
                style: { fontSize: 10 }
              },
              m.enabled ? "启用" : "停用"
            ),
            n.createElement(
              f,
              { color: "purple", style: { fontSize: 10 } },
              m.transport
            )
          ),
          m.description ? n.createElement(
            J,
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
        open: T,
        title: "添加 MCP 客户端 (JSON)",
        onCancel: () => z(!1),
        onOk: L,
        confirmLoading: x,
        okText: "创建",
        width: 560
      },
      n.createElement(
        "div",
        { style: { marginBottom: 8, fontSize: 12, color: "#8c8c8c" } },
        "粘贴 MCP 配置 JSON（支持 mcpServers 格式），将创建到当前专家工作区："
      ),
      n.createElement(O, {
        value: G,
        onChange: (m) => I(m.target.value),
        rows: 12,
        style: { fontFamily: "monospace", fontSize: 12 }
      })
    )
  );
}
function yn({ agentId: e }) {
  const t = E().React, { useState: l, useEffect: n, useCallback: a, useRef: r } = t, {
    Card: o,
    InputNumber: i,
    Input: f,
    Select: p,
    Switch: g,
    Button: $,
    Spin: b,
    Space: h,
    Typography: H,
    Divider: _,
    message: D
  } = E().antd, { SaveOutlined: P } = E().antdIcons || {}, { Text: F } = H, [w, J] = l(!0), [O, A] = l(!1), B = r(null), [R, u] = l(60), [T, z] = l(""), [G, I] = l(!0), [x, d] = l(30), [v, W] = l("zh"), [Q, L] = l("UTC"), [m, Y] = l(!0), [s, Z] = l(100), [U, V] = l(!0), [ae, k] = l(3), [S, ne] = l(1), [y, se] = l(!0), [re, he] = l(3), [ve, N] = l(2), [M, le] = l(60), [q, Ee] = l(1), [ye, oe] = l(0), [ze, Oe] = l(1), [X, C] = l(0), [ee, ie] = l(30), [pe, fe] = l(50), [$e, Ae] = l("light"), [Fe, He] = l("scroll"), [Je, We] = l("remelight"), [Ce, Ge] = l("AUTO"), Le = a(async () => {
    var j, be, Se, we, Be, Re;
    J(!0);
    try {
      const [ue, Ze, et] = await Promise.all([
        an(e),
        sn(e).catch(() => "zh"),
        cn().catch(() => "UTC")
      ]);
      B.current = ue, u(ue.shell_command_timeout ?? 60), z(ue.shell_command_executable ?? "");
      const Xe = ue.auto_title_config ?? { enabled: !0, timeout_seconds: 30 };
      I(Xe.enabled ?? !0), d(Xe.timeout_seconds ?? 30), W(Ze), L(et);
      const je = ue.loop ?? {};
      Y(((j = je.iteration) == null ? void 0 : j.enabled) ?? !0), Z(((be = je.iteration) == null ? void 0 : be.max_iterations) ?? ue.max_iters ?? 100), V(((Se = je.doom_loop) == null ? void 0 : Se.enabled) ?? !0), k(((we = je.doom_loop) == null ? void 0 : we.window_size) ?? 3), ne(((Be = je.doom_loop) == null ? void 0 : Be.similarity_threshold) ?? 1), se(ue.llm_retry_enabled ?? !0), he(ue.llm_max_retries ?? 3), N(ue.llm_backoff_base ?? 2), le(ue.llm_backoff_cap ?? 60), Ee(ue.llm_max_concurrent ?? 1), oe(ue.llm_max_qpm ?? 0), Oe(ue.llm_rate_limit_pause ?? 1), C(ue.llm_rate_limit_jitter ?? 0), ie(ue.llm_acquire_timeout ?? 30), fe(ue.history_max_length ?? 50), Ae(ue.context_manager_backend ?? "light"), He(((Re = ue.light_context_config) == null ? void 0 : Re.strategy) ?? "scroll"), We(ue.memory_manager_backend ?? "remelight"), Ge(ue.approval_level ?? "AUTO");
    } catch (ue) {
      D.error(ue.message || "加载运行配置失败");
    } finally {
      J(!1);
    }
  }, [e]);
  n(() => {
    Le();
  }, [Le]);
  const De = async () => {
    var be, Se;
    const j = B.current;
    if (j) {
      A(!0);
      try {
        const we = {
          ...j,
          max_iters: s,
          loop: {
            ...j.loop ?? {},
            iteration: { enabled: m, max_iterations: s },
            doom_loop: {
              enabled: U,
              window_size: ae,
              similarity_threshold: S,
              stages: ((Se = (be = j.loop) == null ? void 0 : be.doom_loop) == null ? void 0 : Se.stages) ?? []
            }
          },
          shell_command_timeout: R,
          shell_command_executable: T,
          auto_title_config: {
            enabled: G,
            timeout_seconds: x
          },
          llm_retry_enabled: y,
          llm_max_retries: re,
          llm_backoff_base: ve,
          llm_backoff_cap: M,
          llm_max_concurrent: q,
          llm_max_qpm: ye,
          llm_rate_limit_pause: ze,
          llm_rate_limit_jitter: X,
          llm_acquire_timeout: ee,
          history_max_length: pe,
          context_manager_backend: $e,
          light_context_config: {
            ...j.light_context_config ?? {},
            strategy: Fe
          },
          memory_manager_backend: Je,
          approval_level: Ce
        };
        await rn(e, we), B.current = we, v && await on(e, v).catch(() => {
        }), Q && await mn(Q).catch(() => {
        }), D.success("运行配置已保存");
      } catch (we) {
        D.error(we.message || "保存运行配置失败");
      } finally {
        A(!1);
      }
    }
  };
  if (w)
    return t.createElement(
      "div",
      { style: { textAlign: "center", padding: 40 } },
      t.createElement(b, { size: "large" })
    );
  const ke = (j, be, Se) => t.createElement(
    "div",
    { style: zt },
    t.createElement("div", { style: Ue }, j),
    be,
    Se ? t.createElement(
      F,
      { type: "secondary", style: _t },
      Se
    ) : null
  ), Ie = (j, be, Se, we) => t.createElement(
    "div",
    { style: It },
    t.createElement(
      "div",
      null,
      t.createElement("div", { style: Ue }, j),
      be
    ),
    t.createElement(
      "div",
      null,
      t.createElement("div", { style: Ue }, Se),
      we
    )
  );
  return t.createElement(
    "div",
    { style: { paddingBottom: 8 } },
    // ── Section: 基础设置 ──
    t.createElement(
      "div",
      { style: Me },
      "基础设置"
    ),
    Ie(
      "Shell 命令超时 (秒)",
      t.createElement(i, {
        min: 1,
        value: R,
        onChange: (j) => u(j ?? 60),
        style: { width: "100%" }
      }),
      "Shell 可执行文件",
      t.createElement(f, {
        value: T,
        onChange: (j) => z(j.target.value),
        placeholder: "留空使用系统默认",
        style: { width: "100%" }
      })
    ),
    Ie(
      "语言",
      t.createElement(p, {
        value: v,
        onChange: (j) => W(j),
        style: { width: "100%" },
        options: [
          { value: "zh", label: "中文" },
          { value: "en", label: "English" },
          { value: "id", label: "Bahasa Indonesia" },
          { value: "ru", label: "Русский" }
        ]
      }),
      "时区",
      t.createElement(p, {
        value: Q,
        onChange: (j) => L(j),
        style: { width: "100%" },
        showSearch: !0,
        filterOption: (j, be) => {
          var Se;
          return (((Se = be == null ? void 0 : be.label) == null ? void 0 : Se.toString()) || "").toLowerCase().includes(j.toLowerCase());
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
        ].map((j) => ({ value: j, label: j }))
      })
    ),
    Ie(
      "自动生成会话标题",
      t.createElement(h, null, t.createElement(g, {
        checked: G,
        onChange: (j) => I(j)
      })),
      "标题生成超时 (秒)",
      t.createElement(i, {
        min: 5,
        value: x,
        onChange: (j) => d(j ?? 30),
        style: { width: "100%" },
        disabled: !G
      })
    ),
    // ── Section: 审批级别 ──
    t.createElement(_, { style: { margin: "8px 0 16px" } }),
    t.createElement("div", { style: Me }, "审批级别"),
    ke(
      "工具执行审批",
      t.createElement(p, {
        value: Ce,
        onChange: (j) => Ge(j),
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
    t.createElement(_, { style: { margin: "8px 0 16px" } }),
    t.createElement("div", { style: Me }, "迭代与循环"),
    ke(
      "启用迭代限制",
      t.createElement(g, {
        checked: m,
        onChange: (j) => Y(j)
      }),
      "停止 Agent 前的最大循环轮次"
    ),
    m ? ke(
      "最大迭代次数",
      t.createElement(i, {
        min: 1,
        max: 500,
        value: s,
        onChange: (j) => Z(j ?? 100),
        style: { width: "100%" }
      })
    ) : null,
    ke(
      "启用重复循环保护",
      t.createElement(g, {
        checked: U,
        onChange: (j) => V(j)
      }),
      "检测并阻止重复操作循环"
    ),
    U ? Ie(
      "检测窗口大小",
      t.createElement(i, {
        min: 2,
        max: 20,
        value: ae,
        onChange: (j) => k(j ?? 3),
        style: { width: "100%" }
      }),
      "相似度阈值",
      t.createElement(i, {
        min: 0,
        max: 1,
        step: 0.05,
        value: S,
        onChange: (j) => ne(j ?? 1),
        style: { width: "100%" }
      })
    ) : null,
    // ── Section: LLM 重试 ──
    t.createElement(_, { style: { margin: "8px 0 16px" } }),
    t.createElement("div", { style: Me }, "LLM 重试"),
    ke(
      "启用 LLM 重试",
      t.createElement(g, {
        checked: y,
        onChange: (j) => se(j)
      })
    ),
    Ie(
      "最大重试次数",
      t.createElement(i, {
        min: 1,
        value: re,
        onChange: (j) => he(j ?? 3),
        style: { width: "100%" },
        disabled: !y
      }),
      "退避基数 (秒)",
      t.createElement(i, {
        min: 0.1,
        step: 0.1,
        value: ve,
        onChange: (j) => N(j ?? 2),
        style: { width: "100%" },
        disabled: !y
      })
    ),
    ke(
      "退避上限 (秒)",
      t.createElement(i, {
        min: 0.5,
        step: 0.5,
        value: M,
        onChange: (j) => le(j ?? 60),
        style: { width: 200 },
        disabled: !y
      })
    ),
    // ── Section: LLM 限流 ──
    t.createElement(_, { style: { margin: "8px 0 16px" } }),
    t.createElement("div", { style: Me }, "LLM 限流"),
    Ie(
      "最大并发数",
      t.createElement(i, {
        min: 1,
        value: q,
        onChange: (j) => Ee(j ?? 1),
        style: { width: "100%" }
      }),
      "最大 QPM (0=不限)",
      t.createElement(i, {
        min: 0,
        step: 10,
        value: ye,
        onChange: (j) => oe(j ?? 0),
        style: { width: "100%" }
      })
    ),
    Ie(
      "限流暂停时间 (秒)",
      t.createElement(i, {
        min: 1,
        step: 0.5,
        value: ze,
        onChange: (j) => Oe(j ?? 1),
        style: { width: "100%" }
      }),
      "限流抖动 (秒)",
      t.createElement(i, {
        min: 0,
        step: 0.5,
        value: X,
        onChange: (j) => C(j ?? 0),
        style: { width: "100%" }
      })
    ),
    ke(
      "获取超时 (秒)",
      t.createElement(i, {
        min: 10,
        step: 10,
        value: ee,
        onChange: (j) => ie(j ?? 30),
        style: { width: 200 }
      }),
      "应大于 限流暂停 + 抖动"
    ),
    // ── Section: 上下文与记忆 ──
    t.createElement(_, { style: { margin: "8px 0 16px" } }),
    t.createElement("div", { style: Me }, "上下文与记忆"),
    Ie(
      "上下文管理后端",
      t.createElement(p, {
        value: $e,
        onChange: (j) => Ae(j),
        style: { width: "100%" },
        options: [{ value: "light", label: "light" }]
      }),
      "上下文策略",
      t.createElement(p, {
        value: Fe,
        onChange: (j) => He(j),
        style: { width: "100%" },
        options: [
          { value: "scroll", label: "scroll (滚动窗口)" },
          { value: "native", label: "native (原生)" }
        ]
      })
    ),
    Ie(
      "记忆管理后端",
      t.createElement(p, {
        value: Je,
        onChange: (j) => We(j),
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
        value: pe,
        onChange: (j) => fe(j ?? 50),
        style: { width: "100%" }
      })
    ),
    // ── Save button ──
    t.createElement(
      "div",
      { style: { display: "flex", justifyContent: "flex-end", marginTop: 16 } },
      t.createElement(
        $,
        {
          type: "primary",
          icon: P ? t.createElement(P) : void 0,
          loading: O,
          onClick: De,
          style: Pe
        },
        "保存运行配置"
      )
    )
  );
}
function fn({
  expert: e,
  open: t,
  onClose: l,
  onRefresh: n
}) {
  const a = E().React, { useState: r, useEffect: o, useCallback: i } = a, { Modal: f, Tabs: p, Spin: g, Typography: $ } = E().antd, { SettingOutlined: b } = E().antdIcons || {}, { Text: h } = $, [H, _] = r([]), [D, P] = r(!1), [F, w] = r("heartbeat"), J = i(async () => {
    if (e) {
      P(!0);
      try {
        const R = await dn(e.agent.id);
        _(R);
      } catch {
        _([]);
      } finally {
        P(!1);
      }
    }
  }, [e]);
  if (o(() => {
    t && e && J();
  }, [t, e, J]), !e) return null;
  const { agent: O } = e, A = () => {
    J(), n();
  }, B = [
    {
      key: "heartbeat",
      label: "心跳",
      children: a.createElement(un, {
        agentId: O.id
      })
    },
    {
      key: "files",
      label: "文件",
      children: D ? a.createElement(
        "div",
        { style: { textAlign: "center", padding: 40 } },
        a.createElement(g, { size: "large" })
      ) : a.createElement(Pt, {
        agentId: O.id,
        systemPromptFiles: H,
        onRefresh: A
      })
    },
    {
      key: "skills",
      label: `技能 (${e.skills.filter((R) => R.enabled !== !1).length})`,
      children: a.createElement(pn, {
        agentId: O.id,
        onRefresh: n
      })
    },
    {
      key: "mcp",
      label: `MCP (${e.mcps.length})`,
      children: a.createElement(gn, {
        agentId: O.id,
        onRefresh: n,
        isActive: F === "mcp"
      })
    },
    {
      key: "running",
      label: "运行配置",
      children: a.createElement(yn, {
        agentId: O.id
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
        b ? a.createElement(b, { style: { fontSize: 18 } }) : null,
        a.createElement("span", null, `配置 - ${O.name}`),
        a.createElement(
          h,
          { type: "secondary", style: { fontSize: 12, fontWeight: 400 } },
          O.id
        )
      ),
      onCancel: l,
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
    a.createElement(p, {
      items: B,
      activeKey: F,
      onChange: (R) => w(R),
      size: "small",
      tabBarStyle: { marginBottom: 16, sticky: 0 }
    })
  );
}
function En({
  expert: e,
  onClick: t,
  onSummon: l,
  onConfigure: n
}) {
  const a = E().React, { Card: r, Tag: o, Badge: i, Typography: f, Spin: p, Button: g, Tooltip: $ } = E().antd, { Text: b } = f, { ThunderboltOutlined: h, SettingOutlined: H } = E().antdIcons || {}, { agent: _, skills: D, mcps: P, loading: F } = e, w = _.enabled, J = D.filter((B) => B.enabled !== !1).map((B) => B.name), O = P.map((B) => B.name || B.key), A = _.active_model ? `${_.active_model.provider_id}/${_.active_model.model}` : null;
  return a.createElement(
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
        a.createElement("span", { style: { fontSize: 20 } }, "🧑‍🔬"),
        a.createElement(
          "div",
          null,
          a.createElement(
            b,
            { strong: !0, style: { fontSize: 15 } },
            _.name
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
            _.id
          )
        )
      ),
      a.createElement(i, {
        status: w ? "success" : "default",
        text: w ? "启用" : "停用"
      })
    ),
    // Description (rendered as markdown)
    _.description ? a.createElement(
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
      ct(_.description, a)
    ) : a.createElement(
      "div",
      { style: { fontSize: 12, color: "#bfbfbf", marginBottom: 10, minHeight: 54, flex: "1 0 auto" } },
      "暂无描述"
    ),
    // Model info
    A ? a.createElement(
      "div",
      { style: { marginBottom: 8 } },
      a.createElement(
        o,
        { color: "geekblue", style: { fontSize: 11 } },
        `🤖 ${A}`
      )
    ) : null,
    // Skills
    F ? a.createElement(p, { size: "small" }) : a.createElement(
      "div",
      { style: { marginBottom: 6 } },
      a.createElement(
        "div",
        { style: { fontSize: 11, color: "#8c8c8c", marginBottom: 4 } },
        `技能 (${J.length})`
      ),
      a.createElement(pt, {
        items: J,
        max: 4,
        color: "cyan",
        emptyText: "未配置技能"
      })
    ),
    // MCP
    !F && O.length > 0 ? a.createElement(
      "div",
      { style: { marginTop: "auto" } },
      a.createElement(
        "div",
        { style: { fontSize: 11, color: "#8c8c8c", marginBottom: 4 } },
        `MCP (${O.length})`
      ),
      a.createElement(pt, {
        items: O,
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
        $,
        { title: "配置专家", placement: "top" },
        a.createElement(
          g,
          {
            type: "text",
            size: "small",
            icon: H ? a.createElement(H, {
              style: { fontSize: 16, color: "#8c8c8c" }
            }) : void 0,
            onClick: (B) => {
              B.stopPropagation(), n && n();
            }
          }
        )
      ),
      // Summon button (bottom-right)
      a.createElement(
        g,
        {
          type: "primary",
          size: "small",
          icon: h ? a.createElement(h) : void 0,
          disabled: !w,
          onClick: (B) => {
            B.stopPropagation(), l && l();
          },
          style: Pe
        },
        "召唤专家"
      )
    )
  );
}
function hn({
  expert: e,
  open: t,
  onClose: l,
  onRefresh: n
}) {
  const a = E().React, {
    Drawer: r,
    Descriptions: o,
    Tag: i,
    Typography: f,
    Space: p,
    Button: g,
    Empty: $,
    Tabs: b,
    List: h,
    Spin: H,
    Modal: _,
    message: D
  } = E().antd, { Text: P, Paragraph: F } = f, {
    EditOutlined: w,
    ThunderboltOutlined: J,
    FileTextOutlined: O,
    ToolOutlined: A,
    PlusOutlined: B
  } = E().antdIcons || {}, [R, u] = a.useState(!1), [T, z] = a.useState(
    []
  ), [G, I] = a.useState(!1);
  if (!e) return null;
  const { agent: x, config: d, skills: v, mcps: W, loading: Q } = e, L = v.filter((y) => y.enabled !== !1), m = (y) => {
    window.history.pushState({}, "", y), window.dispatchEvent(new PopStateEvent("popstate"));
  }, Y = a.createElement(
    "div",
    null,
    a.createElement(
      o,
      { column: 1, bordered: !0, size: "small" },
      a.createElement(o.Item, { label: "专家名称" }, x.name),
      a.createElement(
        o.Item,
        { label: "专家 ID" },
        a.createElement("code", { style: { fontSize: 12 } }, x.id)
      ),
      a.createElement(
        o.Item,
        { label: "状态" },
        a.createElement(
          i,
          { color: x.enabled ? "green" : "default" },
          x.enabled ? "启用" : "停用"
        )
      ),
      a.createElement(
        o.Item,
        { label: "功能简介" },
        x.description ? ct(x.description, a) : "暂无描述"
      ),
      a.createElement(
        o.Item,
        { label: "使用模型" },
        x.active_model ? `${x.active_model.provider_id} / ${x.active_model.model}` : "使用全局默认模型"
      ),
      d != null && d.workspace_dir ? a.createElement(
        o.Item,
        { label: "工作区路径" },
        a.createElement(
          "code",
          { style: { fontSize: 11 } },
          d.workspace_dir
        )
      ) : null,
      d != null && d.approval_level ? a.createElement(
        o.Item,
        { label: "审批级别" },
        d.approval_level
      ) : null
    ),
    // System prompt files
    d != null && d.system_prompt_files && d.system_prompt_files.length > 0 ? a.createElement(
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
        O ? a.createElement(O, {
          style: { fontSize: 14, color: "#1677ff" }
        }) : null,
        a.createElement(P, { strong: !0 }, "系统提示词文件")
      ),
      a.createElement(
        p,
        { wrap: !0 },
        ...d.system_prompt_files.map(
          (y, se) => a.createElement(
            i,
            {
              key: se,
              icon: O ? a.createElement(O) : void 0,
              style: { fontSize: 12 }
            },
            y
          )
        )
      )
    ) : null
  ), s = async () => {
    u(!0), I(!0);
    try {
      const y = await it();
      z(y);
    } catch (y) {
      D.error(y.message || "加载技能池失败");
    } finally {
      I(!1);
    }
  }, Z = async (y) => {
    let se = 0, re = 0;
    for (const he of y)
      try {
        await wt(x.id, he), se++;
      } catch {
        re++;
      }
    se > 0 ? (D.success(
      `成功添加 ${se} 个技能${re > 0 ? `，${re} 个失败` : ""}`
    ), n()) : re > 0 && D.error("添加技能失败"), u(!1);
  }, U = async (y) => {
    try {
      await xt(x.id, y), D.success(`技能「${y}」已移除`), n();
    } catch (se) {
      D.error(se.message || "移除技能失败");
    }
  }, V = async (y) => {
    try {
      await kt(x.id, y), D.success(`MCP「${y}」已移除`), n();
    } catch (se) {
      D.error(se.message || "移除 MCP 失败");
    }
  }, ae = Q ? a.createElement(
    "div",
    { style: { textAlign: "center", padding: 40 } },
    a.createElement(H, { size: "large" })
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
        P,
        { strong: !0 },
        `已启用技能 (${L.length})`
      ),
      a.createElement(
        g,
        {
          type: "primary",
          size: "small",
          icon: B ? a.createElement(B) : void 0,
          onClick: s
        },
        "从技能池添加"
      )
    ),
    L.length === 0 ? a.createElement($, {
      description: "该专家暂无已启用的技能",
      image: $.PRESENTED_IMAGE_SIMPLE
    }) : a.createElement(h, {
      dataSource: L,
      renderItem: (y) => a.createElement(
        h.Item,
        {
          actions: [
            a.createElement(
              g,
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
            y.emoji ? a.createElement(
              "span",
              { style: { fontSize: 16 } },
              y.emoji
            ) : null,
            a.createElement(P, { strong: !0 }, y.name),
            y.version_text ? a.createElement(
              i,
              { style: { fontSize: 10 } },
              `v${y.version_text}`
            ) : null
          ),
          y.description ? a.createElement(
            F,
            {
              type: "secondary",
              style: { fontSize: 12, margin: 0 },
              ellipsis: { rows: 2 }
            },
            y.description
          ) : null,
          y.tags && y.tags.length > 0 ? a.createElement(
            "div",
            { style: { marginTop: 4 } },
            ...y.tags.map(
              (se, re) => a.createElement(
                i,
                {
                  key: re,
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
    a.createElement(Tt, {
      open: R,
      onClose: () => u(!1),
      poolSkills: T,
      installedSkillNames: L.map((y) => y.name),
      loading: G,
      onInstall: Z
    })
  ), k = Q ? a.createElement(
    "div",
    { style: { textAlign: "center", padding: 40 } },
    a.createElement(H, { size: "large" })
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
        P,
        { strong: !0 },
        `MCP 客户端 (${W.length})`
      ),
      a.createElement(
        g,
        {
          type: "primary",
          size: "small",
          icon: B ? a.createElement(B) : void 0,
          onClick: () => {
            window.history.pushState({}, "", `/agents/${x.id}/mcp`), window.dispatchEvent(new PopStateEvent("popstate"));
          }
        },
        "配置 MCP"
      )
    ),
    W.length === 0 ? a.createElement($, {
      description: "该专家暂无关联的 MCP 客户端，点击「配置 MCP」添加",
      image: $.PRESENTED_IMAGE_SIMPLE
    }) : a.createElement(h, {
      dataSource: W,
      renderItem: (y) => a.createElement(
        h.Item,
        {
          actions: [
            a.createElement(
              g,
              {
                type: "link",
                size: "small",
                danger: !0,
                onClick: () => V(y.key)
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
              P,
              { strong: !0 },
              y.name || y.key
            ),
            a.createElement(
              i,
              {
                color: y.enabled ? "green" : "default",
                style: { fontSize: 10 }
              },
              y.enabled ? "启用" : "停用"
            ),
            a.createElement(
              i,
              { color: "purple", style: { fontSize: 10 } },
              y.transport
            )
          ),
          y.description ? a.createElement(
            F,
            {
              type: "secondary",
              style: { fontSize: 12, margin: 0 },
              ellipsis: { rows: 2 }
            },
            y.description
          ) : null,
          y.tools && y.tools.length > 0 ? a.createElement(
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
  ), S = d != null && d.tools ? a.createElement(
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
        A ? a.createElement(A, {
          style: { fontSize: 14, color: "#1677ff" }
        }) : null,
        a.createElement(P, { strong: !0 }, "工具配置")
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
        JSON.stringify(d.tools, null, 2)
      )
    )
  ) : a.createElement($, {
    description: "暂无工具配置",
    image: $.PRESENTED_IMAGE_SIMPLE
  }), ne = [
    { key: "basic", label: "基本信息", children: Y },
    {
      key: "skills",
      label: `技能 (${L.length})`,
      children: ae
    },
    {
      key: "prompts",
      label: "推荐提问",
      children: a.createElement(Sn, {
        skills: L,
        agentId: x.id
      })
    },
    {
      key: "knowledge",
      label: "专家记忆",
      children: a.createElement(Pt, {
        agentId: x.id,
        systemPromptFiles: (d == null ? void 0 : d.system_prompt_files) || [],
        onRefresh: () => n()
      })
    },
    { key: "mcp", label: `MCP (${W.length})`, children: k },
    { key: "tools", label: "工具配置", children: S }
  ];
  return a.createElement(
    r,
    {
      title: a.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 8 } },
        a.createElement("span", { style: { fontSize: 20 } }, "🧑‍🔬"),
        a.createElement("span", null, x.name)
      ),
      open: t,
      onClose: l,
      width: 560,
      extra: a.createElement(
        p,
        null,
        a.createElement(
          g,
          {
            size: "small",
            icon: w ? a.createElement(w) : void 0,
            onClick: () => m("/agents")
          },
          "编辑专家"
        ),
        a.createElement(
          g,
          {
            type: "primary",
            size: "small",
            icon: J ? a.createElement(J) : void 0,
            onClick: () => {
              try {
                const y = E();
                y.setSelectedAgent && y.setSelectedAgent(x.id);
              } catch (y) {
                console.warn("[ugsci] Failed to set selected agent:", y);
              }
              m("/chat");
            }
          },
          "开始对话"
        )
      )
    },
    a.createElement(b, {
      items: ne,
      defaultActiveKey: "basic"
    })
  );
}
function vn({
  open: e,
  onClose: t,
  onCreated: l
}) {
  const n = E().React, { useState: a } = n, {
    Modal: r,
    Card: o,
    Tag: i,
    Input: f,
    Row: p,
    Col: g,
    Spin: $,
    message: b,
    Typography: h
  } = E().antd, { Text: H } = h, { FileAddOutlined: _ } = E().antdIcons || {}, [D, P] = a(!1), [F, w] = a(""), [J, O] = a(!1), A = async (u, T) => {
    P(!0);
    try {
      const z = await te("/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: u || "新专家",
          description: T || "",
          skill_names: []
        })
      });
      await qe(
        z.id,
        "AGENTS.md",
        `# ${u || "新专家"}

请在此处编写该专家的系统提示词。
`
      ), b.success("专家「" + (u || "新专家") + "」创建成功"), O(!1), t(), l();
    } catch (z) {
      b.error(z.message || "创建专家失败");
    } finally {
      P(!1);
    }
  }, B = nt.filter((u) => {
    if (!F.trim()) return !0;
    const T = F.toLowerCase();
    return u.name.toLowerCase().includes(T) || u.description.toLowerCase().includes(T) || u.category.toLowerCase().includes(T);
  }), R = async (u) => {
    P(!0);
    try {
      const T = await te("/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: u.name,
          description: u.description,
          skill_names: u.recommendedSkills
        })
      });
      await qe(T.id, "AGENTS.md", u.systemPrompt);
      const z = await Ye(T.id);
      z.approval_level = u.approvalLevel, await te(`/agents/${encodeURIComponent(T.id)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(z)
      }), b.success(`专家「${u.name}」创建成功`), t(), l();
    } catch (T) {
      b.error(T.message || "创建专家失败");
    } finally {
      P(!1);
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
        value: F,
        onChange: (u) => w(u.target.value),
        allowClear: !0
      })
    ),
    D ? n.createElement(
      "div",
      { style: { textAlign: "center", padding: 60 } },
      n.createElement($, { size: "large" }),
      n.createElement(
        "div",
        { style: { marginTop: 12, color: "#8c8c8c" } },
        "正在创建专家..."
      )
    ) : n.createElement(
      p,
      { gutter: [12, 12] },
      // ── Blank template card (always first) ──
      F.trim() ? null : n.createElement(
        g,
        { xs: 24, sm: 12 },
        n.createElement(
          o,
          {
            hoverable: !0,
            size: "small",
            onClick: () => O(!0),
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
              _ ? n.createElement(_) : "📝"
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
        (u) => n.createElement(
          g,
          { key: u.id, xs: 24, sm: 12 },
          n.createElement(
            o,
            {
              hoverable: !0,
              size: "small",
              onClick: () => R(u),
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
                u.emoji
              ),
              n.createElement(
                "div",
                { style: { flex: 1 } },
                n.createElement(
                  H,
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
              ct(u.description, n)
            )
          )
        )
      )
    ),
    // ── Blank template creation modal ──
    n.createElement(bn, {
      open: J,
      onCancel: () => O(!1),
      onCreate: A
    })
  );
}
function bn({
  open: e,
  onCancel: t,
  onCreate: l
}) {
  const n = E().React, { useState: a } = n, { Modal: r, Input: o, message: i } = E().antd, [f, p] = a(""), [g, $] = a("");
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
        l(f.trim(), g.trim());
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
      n.createElement(o, {
        placeholder: "输入专家名称",
        value: f,
        onChange: (b) => p(b.target.value),
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
        value: g,
        onChange: (b) => $(b.target.value),
        rows: 3,
        maxLength: 200
      })
    )
  );
}
function Pt({
  agentId: e,
  systemPromptFiles: t,
  onRefresh: l
}) {
  const n = E().React, { useState: a, useEffect: r, useCallback: o } = n, {
    List: i,
    Tag: f,
    Switch: p,
    Button: g,
    Modal: $,
    Input: b,
    Spin: h,
    Empty: H,
    message: _,
    Typography: D
  } = E().antd, { FileTextOutlined: P, PlusOutlined: F, EditOutlined: w, ReloadOutlined: J } = E().antdIcons || {}, { Text: O } = D, [A, B] = a([]), [R, u] = a(!0), [T, z] = a(
    t || []
  ), [G, I] = a(!1), [x, d] = a(null), [v, W] = a(""), [Q, L] = a(""), [m, Y] = a(!1), s = o(async () => {
    u(!0);
    try {
      const k = await Gt(e);
      B(k);
    } catch (k) {
      _.error(k.message || "加载记忆文件失败"), B([]);
    } finally {
      u(!1);
    }
  }, [e]);
  r(() => {
    s();
  }, [s]), r(() => {
    z(t || []);
  }, [t]);
  const Z = async (k, S) => {
    const ne = new Set(T);
    if (S)
      ne.add(k);
    else {
      if (ut.includes(k) && k === "AGENTS.md") {
        _.warning("AGENTS.md 是核心文件，不能停用");
        return;
      }
      ne.delete(k);
    }
    const y = Array.from(ne);
    z(y);
    try {
      await dt(e, y), _.success(S ? "已启用记忆文件" : "已停用记忆文件"), l();
    } catch (se) {
      _.error(se.message || "更新失败"), z(t || []);
    }
  }, U = async (k) => {
    try {
      const S = await te(
        `/workspace/files/${encodeURIComponent(k)}`,
        { headers: { "X-Agent-Id": e } }
      );
      d(k), W(S.content || ""), I(!0);
    } catch (S) {
      _.error(S.message || "读取文件失败");
    }
  }, V = () => {
    d(null), W(""), L(""), I(!0);
  }, ae = async () => {
    const k = x || Q.trim();
    if (!k) {
      _.warning("请输入文件名");
      return;
    }
    const S = k.endsWith(".md") ? k : `${k}.md`;
    Y(!0);
    try {
      if (await qe(e, S, v), !x && !T.includes(S)) {
        const ne = [...T, S];
        z(ne), await dt(e, ne);
      }
      _.success("保存成功"), I(!1), s(), l();
    } catch (ne) {
      _.error(ne.message || "保存失败");
    } finally {
      Y(!1);
    }
  };
  return R ? n.createElement(
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
        "div",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        P ? n.createElement(P, {
          style: { fontSize: 14, color: "#1677ff" }
        }) : null,
        n.createElement(
          O,
          { strong: !0 },
          `记忆文件 (${A.length})`
        ),
        n.createElement(
          O,
          { type: "secondary", style: { fontSize: 12 } },
          `· 已挂载 ${T.length} 个到专家记忆`
        )
      ),
      n.createElement(
        "div",
        { style: { display: "flex", gap: 8 } },
        n.createElement(
          g,
          {
            size: "small",
            icon: J ? n.createElement(J) : void 0,
            onClick: s
          },
          "刷新"
        ),
        n.createElement(
          g,
          {
            type: "primary",
            size: "small",
            icon: F ? n.createElement(F) : void 0,
            onClick: V
          },
          "新建记忆文件"
        )
      )
    ),
    A.length === 0 ? n.createElement(H, {
      description: "暂无记忆文件，点击「新建记忆文件」添加",
      image: H.PRESENTED_IMAGE_SIMPLE
    }) : n.createElement(i, {
      dataSource: A,
      renderItem: (k) => {
        const S = T.includes(k.filename), ne = ut.includes(k.filename);
        return n.createElement(
          i.Item,
          {
            actions: [
              n.createElement(
                g,
                {
                  type: "link",
                  size: "small",
                  icon: w ? n.createElement(w) : void 0,
                  onClick: () => U(k.filename)
                },
                "编辑"
              )
            ]
          },
          n.createElement(i.Item.Meta, {
            avatar: n.createElement(P, {
              style: {
                fontSize: 20,
                color: S ? "#1677ff" : "#bfbfbf"
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
              n.createElement(O, null, k.filename),
              ne ? n.createElement(
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
              `${(k.size / 1024).toFixed(1)} KB · 修改于 ${new Date(k.modified_time).toLocaleString()}`
            )
          }),
          n.createElement(p, {
            checked: S,
            size: "small",
            onChange: (y) => Z(k.filename, y)
          })
        );
      }
    }),
    // Edit/New file modal
    n.createElement(
      $,
      {
        open: G,
        onCancel: () => I(!1),
        title: x ? `编辑 ${x}` : "新建记忆文件",
        width: 700,
        onOk: ae,
        confirmLoading: m,
        okText: "保存"
      },
      x ? null : n.createElement(
        "div",
        { style: { marginBottom: 12 } },
        n.createElement(b, {
          placeholder: "文件名（如：油藏工程记忆库.md）",
          value: Q,
          onChange: (k) => L(k.target.value),
          addonAfter: Q.endsWith(".md") ? "" : ".md"
        })
      ),
      n.createElement(b.TextArea, {
        value: v,
        onChange: (k) => W(k.target.value),
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
function Sn({
  skills: e,
  agentId: t
}) {
  const l = E().React, { useMemo: n } = l, {
    List: a,
    Tag: r,
    Typography: o,
    Empty: i,
    Button: f,
    message: p
  } = E().antd, { ThunderboltOutlined: g, CopyOutlined: $ } = E().antdIcons || {}, { Text: b } = o, h = n(() => Wt(e), [e]), H = (D) => {
    try {
      const P = E();
      P.setSelectedAgent && P.setSelectedAgent(t);
    } catch {
    }
    try {
      sessionStorage.setItem("ugsci_pending_prompt", D);
    } catch {
    }
    window.history.pushState({}, "", "/chat"), window.dispatchEvent(new PopStateEvent("popstate"));
  }, _ = (D) => {
    var P;
    (P = navigator.clipboard) == null || P.writeText(D).then(() => {
      p.success("已复制到剪贴板");
    });
  };
  return h.length === 0 ? l.createElement(i, {
    description: "暂无推荐提问，请先为专家添加技能",
    image: i.PRESENTED_IMAGE_SIMPLE
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
      g ? l.createElement(g, {
        style: { fontSize: 14, color: "#1677ff" }
      }) : null,
      l.createElement(
        b,
        { strong: !0 },
        `推荐提问 (${h.length})`
      ),
      l.createElement(
        b,
        { type: "secondary", style: { fontSize: 12 } },
        "· 从技能描述中自动提取"
      )
    ),
    l.createElement(a, {
      dataSource: h,
      renderItem: (D, P) => l.createElement(
        a.Item,
        {
          actions: [
            l.createElement(
              f,
              {
                type: "link",
                size: "small",
                icon: $ ? l.createElement($) : void 0,
                onClick: () => _(D)
              },
              "复制"
            )
          ]
        },
        l.createElement(a.Item.Meta, {
          avatar: l.createElement(
            r,
            { color: "blue", style: { borderRadius: "50%" } },
            `${P + 1}`
          ),
          title: l.createElement(
            "div",
            {
              style: {
                cursor: "pointer",
                color: "#1677ff"
              },
              onClick: () => H(D)
            },
            D
          ),
          description: l.createElement(
            b,
            { type: "secondary", style: { fontSize: 12 } },
            "点击直接发送给专家"
          )
        })
      )
    })
  );
}
function wn() {
  var X;
  const e = E().React, { useState: t, useEffect: l, useCallback: n, useMemo: a } = e, {
    Spin: r,
    Empty: o,
    Input: i,
    Button: f,
    message: p,
    Row: g,
    Col: $,
    Tabs: b,
    Modal: h,
    Typography: H
  } = E().antd, {
    ReloadOutlined: _,
    PlusOutlined: D,
    SearchOutlined: P,
    TeamOutlined: F,
    UserOutlined: w
  } = E().antdIcons || {}, { Text: J, Paragraph: O } = H, [A, B] = t([]), [R, u] = t(!0), [T, z] = t(!1), [G, I] = t(null), [x, d] = t(""), [v, W] = t(!1), [Q, L] = t("experts"), [m, Y] = t(
    null
  ), [s, Z] = t(""), [U, V] = t(!1), [ae, k] = t(!1), [S, ne] = t(null), [y, se] = t([]), re = n(async () => {
    u(!0);
    try {
      const C = await st(), ee = await Promise.all(
        C.map(async (ie) => {
          try {
            const [pe, fe, $e] = await Promise.all([
              Ye(ie.id).catch(() => null),
              ot(ie.id).catch(() => []),
              Ct(ie.id).catch(() => [])
            ]);
            return {
              agent: ie,
              config: pe,
              skills: fe,
              mcps: $e,
              loading: !1
            };
          } catch {
            return {
              agent: ie,
              config: null,
              skills: [],
              mcps: [],
              loading: !1
            };
          }
        })
      );
      B(ee), se(C);
    } catch (C) {
      p.error(C.message || "加载专家列表失败"), B([]);
    } finally {
      u(!1);
    }
  }, []);
  l(() => {
    re();
  }, [re]), l(() => {
    if (S && ae) {
      const C = A.find(
        (ee) => ee.agent.id === S.agent.id
      );
      C && C !== S && ne(C);
    }
  }, [A, S, ae]);
  const he = n(
    async (C) => {
      var fe;
      const ee = C.coordinatorName || ((fe = C.members[0]) == null ? void 0 : fe.name);
      if (!ee) {
        p.error("无法确定协调者专家");
        return;
      }
      const ie = Ve(y, ee);
      if (!ie) {
        p.error(`未找到协调者专家「${ee}」，请先创建该专家`);
        return;
      }
      if (/\{.+?\}/.test(C.taskTemplate)) {
        Z(""), Y(C);
        return;
      }
      await ve(C, ie, C.taskTemplate);
    },
    [y, p]
  ), ve = n(
    async (C, ee, ie) => {
      var pe;
      V(!0);
      try {
        const fe = Nt(C), $e = ie ? fe.replace(C.taskTemplate, ie) : fe, Ae = E();
        Ae.setSelectedAgent && Ae.setSelectedAgent(ee), await Dt(ee, $e), p.success(
          `团队任务已发起，协调者：${C.coordinatorName || ((pe = C.members[0]) == null ? void 0 : pe.name)}`
        ), Y(null), N("/chat");
      } catch (fe) {
        p.error(fe.message || "发起团队任务失败");
      } finally {
        V(!1);
      }
    },
    [p]
  ), N = (C) => {
    window.history.pushState({}, "", C), window.dispatchEvent(new PopStateEvent("popstate"));
  }, M = n((C) => {
    I(C), z(!0);
  }, []), le = n((C) => {
    ne(C), k(!0);
  }, []), q = n(
    (C) => {
      if (!C.agent.enabled) {
        p.warning(`专家「${C.agent.name}」未启用，请先启用`);
        return;
      }
      try {
        const ee = E();
        ee.setSelectedAgent && ee.setSelectedAgent(C.agent.id);
      } catch (ee) {
        console.warn("[ugsci] Failed to set selected agent:", ee);
      }
      p.success(`已召唤专家「${C.agent.name}」，正在跳转至对话...`), N("/chat");
    },
    [p]
  ), Ee = a(() => {
    if (!x.trim()) return A;
    const C = x.toLowerCase();
    return A.filter(
      (ee) => {
        var ie;
        return ee.agent.name.toLowerCase().includes(C) || ((ie = ee.agent.description) == null ? void 0 : ie.toLowerCase().includes(C)) || ee.agent.id.toLowerCase().includes(C) || ee.skills.some((pe) => pe.name.toLowerCase().includes(C));
      }
    );
  }, [A, x]), ye = A.filter((C) => C.agent.enabled).length, oe = A.reduce(
    (C, ee) => C + ee.skills.filter((ie) => ie.enabled !== !1).length,
    0
  ), ze = A.reduce((C, ee) => C + ee.mcps.length, 0), Oe = [
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
            prefix: P ? e.createElement(P) : void 0,
            value: x,
            onChange: (C) => d(C.target.value),
            allowClear: !0,
            style: { maxWidth: 400 }
          })
        ),
        // Content
        R ? e.createElement(
          "div",
          { style: { textAlign: "center", padding: 60 } },
          e.createElement(r, { size: "large" })
        ) : Ee.length === 0 ? e.createElement(o, {
          description: x ? "未找到匹配的专家" : "暂无专家，点击「创建专家」添加"
        }) : e.createElement(
          g,
          { gutter: [12, 12], align: "stretch" },
          ...Ee.map(
            (C) => e.createElement(
              $,
              {
                key: C.agent.id,
                xs: 24,
                sm: 12,
                md: 8,
                lg: 6,
                style: { display: "flex" }
              },
              e.createElement(En, {
                expert: C,
                onClick: () => M(C),
                onSummon: () => q(C),
                onConfigure: () => le(C)
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
        F ? e.createElement(F, { style: { fontSize: 14 } }) : null,
        "专家团"
      ),
      children: e.createElement(Ht, {
        agents: y,
        onLaunch: he
      })
    }
  ];
  return e.createElement(
    "div",
    { style: { padding: 24 } },
    e.createElement(Qe, {
      title: "专家",
      subtitle: `共 ${A.length} 位专家（${ye} 位启用）· ${oe} 个技能 · ${ze} 个 MCP 客户端`,
      extra: e.createElement(
        e.Fragment,
        null,
        e.createElement(
          f,
          {
            icon: _ ? e.createElement(_) : void 0,
            onClick: re,
            loading: R
          },
          "刷新"
        ),
        e.createElement(
          f,
          {
            type: "primary",
            icon: D ? e.createElement(D) : void 0,
            onClick: () => W(!0),
            style: Pe
          },
          "创建专家"
        )
      )
    }),
    e.createElement(b, {
      items: Oe,
      activeKey: Q,
      onChange: (C) => L(C)
    }),
    // Drawer
    e.createElement(hn, {
      expert: G,
      open: T,
      onClose: () => z(!1),
      onRefresh: () => re()
    }),
    // Template Modal
    e.createElement(vn, {
      open: v,
      onClose: () => W(!1),
      onCreated: () => re()
    }),
    // Config Modal (gear icon)
    e.createElement(fn, {
      expert: S,
      open: ae,
      onClose: () => k(!1),
      onRefresh: () => re()
    }),
    // Team Launch Modal (for filling placeholders)
    m ? e.createElement(
      h,
      {
        open: !0,
        title: e.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 8 } },
          e.createElement(
            "span",
            { style: { fontSize: 20 } },
            m.emoji
          ),
          e.createElement(
            "span",
            null,
            `发起团队任务 - ${m.name}`
          )
        ),
        onCancel: () => Y(null),
        onOk: () => {
          var pe;
          const C = m.coordinatorName || ((pe = m.members[0]) == null ? void 0 : pe.name), ee = C ? Ve(y, C) : null;
          if (!ee) {
            p.error("无法找到协调者专家");
            return;
          }
          let ie = m.taskTemplate;
          s.trim() && (ie = s.trim()), ve(m, ee, ie);
        },
        confirmLoading: U,
        okText: "发起任务",
        width: 600
      },
      e.createElement(
        "div",
        { style: { marginBottom: 12 } },
        e.createElement(
          J,
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
          J,
          {
            type: "secondary",
            style: { fontSize: 12, display: "block", marginBottom: 8 }
          },
          "输入具体任务描述（替换上面的占位符内容）："
        ),
        e.createElement(i.TextArea, {
          value: s,
          onChange: (C) => Z(C.target.value),
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
          J,
          { style: { fontSize: 12, color: "#0958d9" } },
          `协调者: ${m.coordinatorName || ((X = m.members[0]) == null ? void 0 : X.name) || "—"} · 成员: ${m.members.map((C) => C.name).join("、")}`
        )
      )
    ) : null
  );
}
function xn({
  mcp: e,
  onClick: t
}) {
  const l = E().React, { Card: n, Tag: a, Badge: r, Typography: o } = E().antd, { Text: i } = o, f = {
    stdio: "💻",
    streamable_http: "🌐",
    sse: "📡"
  };
  return l.createElement(
    n,
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
          f[e.transport] || "🔌"
        ),
        l.createElement(
          i,
          { strong: !0, style: { fontSize: 14 } },
          e.name || e.key
        )
      ),
      l.createElement(r, {
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
      { style: { display: "flex", gap: 6, flexWrap: "wrap" } },
      l.createElement(
        a,
        { color: "purple", style: { fontSize: 11 } },
        e.transport
      ),
      e.tools && e.tools.length > 0 ? l.createElement(
        a,
        { color: "blue", style: { fontSize: 11 } },
        `${e.tools.length} 个工具`
      ) : l.createElement(a, { style: { fontSize: 11 } }, "全部工具"),
      e.url ? l.createElement(
        a,
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
async function Cn() {
  return te("/ugsci/engines/list");
}
async function kn(e) {
  return te("/ugsci/engines/", {
    method: "POST",
    body: JSON.stringify(e)
  });
}
async function Tn(e, t) {
  return te(`/ugsci/engines/${encodeURIComponent(e)}`, {
    method: "PUT",
    body: JSON.stringify(t)
  });
}
async function zn(e) {
  return te(
    `/ugsci/engines/${encodeURIComponent(e)}`,
    { method: "DELETE" }
  );
}
async function In() {
  return te("/ugsci/engines/detect", {
    method: "POST"
  });
}
function _n({
  engine: e,
  onClick: t
}) {
  const l = E().React, { Card: n, Tag: a, Typography: r } = E().antd, { Text: o } = r, i = e.status === "detected", f = Ot[e.category] || "📦";
  return l.createElement(
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
        l.createElement("span", { style: { fontSize: 20 } }, f),
        l.createElement(
          "div",
          null,
          l.createElement(
            o,
            { strong: !0, style: { fontSize: 14 } },
            e.name
          ),
          l.createElement("br"),
          l.createElement(
            o,
            { type: "secondary", style: { fontSize: 11 } },
            e.vendor || "—"
          )
        )
      ),
      l.createElement(
        "div",
        { style: { display: "flex", flexDirection: "column", gap: 4, alignItems: "flex-end" } },
        i ? l.createElement(
          a,
          { color: "success", style: { fontSize: 11 } },
          "✅ 已检测"
        ) : e.executable_path ? l.createElement(
          a,
          { color: "warning", style: { fontSize: 11 } },
          "⚠ 路径无效"
        ) : l.createElement(
          a,
          { style: { fontSize: 11 } },
          "🔧 待配置"
        ),
        e.is_default ? l.createElement(
          a,
          { color: "blue", style: { fontSize: 10 } },
          "默认"
        ) : e.is_custom ? l.createElement(
          a,
          { color: "purple", style: { fontSize: 10 } },
          "自定义"
        ) : null
      )
    ),
    l.createElement(
      "div",
      { style: { flex: 1, minHeight: 32 } },
      l.createElement(
        o,
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
        a,
        { style: { fontSize: 11 } },
        lt[e.category] || e.category
      ) : null,
      e.version ? l.createElement(
        a,
        { color: "blue", style: { fontSize: 11 } },
        `v${e.version}`
      ) : null,
      ...(e.modules || []).map(
        (p) => l.createElement(
          a,
          { key: p, color: "cyan", style: { fontSize: 10 } },
          p
        )
      )
    )
  );
}
function Pn() {
  const e = E().React, { useState: t, useEffect: l, useCallback: n, useMemo: a } = e, {
    Spin: r,
    Empty: o,
    Button: i,
    message: f,
    Row: p,
    Col: g,
    Drawer: $,
    Descriptions: b,
    Tag: h,
    Typography: H,
    Modal: _,
    Input: D,
    Alert: P,
    Select: F,
    Popconfirm: w,
    Space: J
  } = E().antd, {
    ReloadOutlined: O,
    SearchOutlined: A,
    PlusOutlined: B,
    EditOutlined: R,
    DeleteOutlined: u,
    CopyOutlined: T,
    ExperimentOutlined: z
  } = E().antdIcons || {}, { Text: G, Paragraph: I } = H, [x, d] = t([]), [v, W] = t(!0), [Q, L] = t(""), [m, Y] = t(!1), [s, Z] = t(null), [U, V] = t(!1), [ae, k] = t(null), [S, ne] = t({}), [y, se] = t(!1), re = n(async () => {
    W(!0);
    try {
      const X = await Cn();
      d(X.engines || []);
    } catch (X) {
      f.error(X.message || "加载引擎列表失败"), d([]);
    } finally {
      W(!1);
    }
  }, []);
  l(() => {
    re();
  }, [re]);
  const he = a(() => {
    if (!Q.trim()) return x;
    const X = Q.toLowerCase();
    return x.filter(
      (C) => {
        var ee;
        return C.name.toLowerCase().includes(X) || C.vendor.toLowerCase().includes(X) || C.category.toLowerCase().includes(X) || ((ee = C.description) == null ? void 0 : ee.toLowerCase().includes(X));
      }
    );
  }, [x, Q]), ve = x.filter((X) => X.status === "detected").length, N = n((X) => {
    navigator.clipboard.writeText(X).then(() => f.success("路径已复制")).catch(() => f.error("复制失败"));
  }, []), M = n(() => {
    k(null), ne({
      name: "",
      vendor: "",
      version: "",
      executable_path: "",
      category: "",
      description: "",
      invocation_hint: ""
    }), V(!0);
  }, []), le = n((X) => {
    k(X), ne({ ...X }), V(!0), Y(!1);
  }, []), q = n(async () => {
    var X;
    if (!((X = S.name) != null && X.trim())) {
      f.warning("请输入引擎名称");
      return;
    }
    se(!0);
    try {
      ae ? (await Tn(ae.id, S), f.success("引擎已更新")) : (await kn(S), f.success("引擎已添加")), V(!1), re();
    } catch (C) {
      f.error(C.message || "保存失败");
    } finally {
      se(!1);
    }
  }, [S, ae, re]), Ee = n(
    async (X) => {
      try {
        await zn(X), f.success("引擎已删除"), Y(!1), re();
      } catch (C) {
        f.error(C.message || "删除失败");
      }
    },
    [re]
  ), ye = n(async () => {
    W(!0);
    try {
      const X = await In();
      d(X.engines || []), f.success("自动检测完成");
    } catch (X) {
      f.error(X.message || "检测失败");
    } finally {
      W(!1);
    }
  }, []), oe = n(
    (X, C, ee) => {
      const ie = S[C] || "";
      return e.createElement(
        "div",
        { style: { marginBottom: 12 } },
        e.createElement(
          G,
          { style: { fontSize: 13, display: "block", marginBottom: 4 } },
          X
        ),
        ee != null && ee.select ? e.createElement(F, {
          value: ie || void 0,
          onChange: (pe) => ne((fe) => ({ ...fe, [C]: pe })),
          style: { width: "100%" },
          options: ee.select.options,
          allowClear: !0,
          placeholder: `选择${X}`
        }) : ee != null && ee.textarea ? e.createElement(D.TextArea, {
          value: ie,
          onChange: (pe) => ne((fe) => ({ ...fe, [C]: pe.target.value })),
          rows: 3,
          placeholder: `输入${X}`
        }) : e.createElement(D, {
          value: ie,
          onChange: (pe) => ne((fe) => ({ ...fe, [C]: pe.target.value })),
          placeholder: `输入${X}`
        })
      );
    },
    [S]
  ), [ze, Oe] = t(!0);
  return e.createElement(
    "div",
    null,
    // Summary alert (closable)
    ze ? e.createElement(
      P,
      {
        type: ve > 0 ? "success" : "info",
        message: `共 ${x.length} 个引擎 · ${ve} 个已检测`,
        description: ve > 0 ? "部分引擎已自动检测到安装路径，可在卡片中查看详情。" : "尚未检测到已安装的引擎。可点击「自动检测」或手动添加计算引擎。",
        showIcon: !0,
        closable: !0,
        onClose: () => Oe(!1),
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
      e.createElement(D, {
        placeholder: "搜索引擎名称、厂商...",
        prefix: A ? e.createElement(A) : void 0,
        value: Q,
        onChange: (X) => L(X.target.value),
        allowClear: !0,
        style: { maxWidth: 280 }
      }),
      e.createElement(
        i,
        {
          icon: O ? e.createElement(O) : void 0,
          onClick: ye,
          loading: v
        },
        "自动检测"
      ),
      e.createElement(
        i,
        {
          type: "primary",
          icon: B ? e.createElement(B) : void 0,
          onClick: M,
          style: Pe
        },
        "添加引擎"
      )
    ),
    // Content
    v ? e.createElement(
      "div",
      { style: { textAlign: "center", padding: 60 } },
      e.createElement(r, {
        size: "large",
        tip: "正在加载计算引擎..."
      })
    ) : he.length === 0 ? e.createElement(o, {
      description: Q ? "无匹配引擎" : "暂无引擎，点击「添加引擎」开始"
    }) : e.createElement(
      p,
      { gutter: [12, 12], align: "stretch" },
      ...he.map(
        (X) => e.createElement(
          g,
          {
            key: X.id,
            xs: 24,
            sm: 12,
            md: 8,
            lg: 6,
            style: { display: "flex" }
          },
          e.createElement(_n, {
            engine: X,
            onClick: () => {
              Z(X), Y(!0);
            }
          })
        )
      )
    ),
    // Detail drawer
    s ? e.createElement(
      $,
      {
        title: e.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 8 } },
          e.createElement(
            "span",
            { style: { fontSize: 18 } },
            Ot[s.category] || "📦"
          ),
          e.createElement("span", null, s.name)
        ),
        open: m,
        onClose: () => Y(!1),
        width: 520,
        extra: e.createElement(
          J,
          null,
          e.createElement(
            i,
            {
              size: "small",
              icon: R ? e.createElement(R) : void 0,
              onClick: () => le(s)
            },
            "编辑"
          ),
          s.is_default ? null : e.createElement(
            w,
            {
              title: "确认删除此引擎？",
              description: s.name,
              onConfirm: () => Ee(s.id),
              okText: "删除",
              cancelText: "取消",
              okButtonProps: { danger: !0 }
            },
            e.createElement(
              i,
              {
                size: "small",
                danger: !0,
                icon: u ? e.createElement(u) : void 0
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
          s.name
        ),
        e.createElement(
          b.Item,
          { label: "厂商" },
          s.vendor || "—"
        ),
        e.createElement(
          b.Item,
          { label: "分类" },
          s.category ? lt[s.category] || s.category : "—"
        ),
        e.createElement(
          b.Item,
          { label: "状态" },
          e.createElement(
            h,
            {
              color: s.status === "detected" ? "success" : s.status === "not_found" ? "error" : "default"
            },
            s.status === "detected" ? "✅ 已检测" : s.status === "not_found" ? "❌ 路径无效" : "🔧 待配置"
          )
        ),
        e.createElement(
          b.Item,
          { label: "版本" },
          s.version || "—"
        ),
        s.executable_path ? e.createElement(
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
              s.executable_path
            ),
            e.createElement(
              i,
              {
                size: "small",
                type: "text",
                icon: T ? e.createElement(T) : void 0,
                onClick: () => N(s.executable_path)
              }
            )
          )
        ) : null,
        s.install_dir ? e.createElement(
          b.Item,
          { label: "安装目录" },
          e.createElement(
            "code",
            { style: { fontSize: 12, wordBreak: "break-all" } },
            s.install_dir
          )
        ) : null,
        // Display detected modules with paths
        s.modules && s.modules.length > 0 ? e.createElement(
          b.Item,
          { label: "已检测模块" },
          e.createElement(
            "div",
            { style: { display: "flex", flexDirection: "column", gap: 4 } },
            ...s.modules.map(
              (X) => e.createElement(
                "div",
                {
                  key: X,
                  style: { display: "flex", alignItems: "center", gap: 8 }
                },
                e.createElement(
                  h,
                  { color: "cyan", style: { fontSize: 11 } },
                  X
                ),
                s.module_paths && s.module_paths[X] ? e.createElement(
                  "code",
                  { style: { fontSize: 11, wordBreak: "break-all" } },
                  s.module_paths[X]
                ) : null
              )
            )
          )
        ) : null,
        s.license_server ? e.createElement(
          b.Item,
          { label: "许可证服务器" },
          s.license_server
        ) : null,
        e.createElement(
          b.Item,
          { label: "描述" },
          s.description || "—"
        )
      ),
      // Invocation hint
      s.invocation_hint ? e.createElement(
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
          G,
          { strong: !0, style: { fontSize: 13 } },
          "💡 调用方式"
        ),
        e.createElement(
          "div",
          { style: { marginTop: 8, fontSize: 13, lineHeight: 1.6 } },
          s.invocation_hint
        )
      ) : null,
      // Type badge
      e.createElement(
        "div",
        { style: { marginTop: 12 } },
        s.is_default ? e.createElement(
          h,
          { color: "blue" },
          "默认引擎"
        ) : s.is_custom ? e.createElement(
          h,
          { color: "purple" },
          "自定义引擎"
        ) : null
      )
    ) : null,
    // Add/Edit modal
    e.createElement(
      _,
      {
        title: ae ? "编辑引擎" : "添加计算引擎",
        open: U,
        onOk: q,
        onCancel: () => V(!1),
        okText: ae ? "保存" : "添加",
        cancelText: "取消",
        confirmLoading: y,
        width: 560
      },
      e.createElement(
        "div",
        { style: { maxHeight: 480, overflow: "auto", paddingRight: 8 } },
        oe("引擎名称 *", "name"),
        oe("厂商", "vendor"),
        oe("版本", "version"),
        oe("可执行文件路径", "executable_path"),
        oe("安装目录", "install_dir"),
        oe("分类", "category", {
          select: {
            options: Object.entries(lt).map(([X, C]) => ({
              label: C,
              value: X
            }))
          }
        }),
        oe("描述", "description", { textarea: !0 }),
        oe("调用方式提示", "invocation_hint", { textarea: !0 }),
        oe("许可证服务器", "license_server")
      )
    )
  );
}
function On() {
  const e = E().React, { useState: t, useEffect: l, useCallback: n, useMemo: a } = e, {
    Spin: r,
    Empty: o,
    Input: i,
    Button: f,
    message: p,
    Row: g,
    Col: $,
    Drawer: b,
    Descriptions: h,
    Tag: H,
    Typography: _,
    List: D,
    Tabs: P
  } = E().antd, {
    ReloadOutlined: F,
    PlusOutlined: w,
    SearchOutlined: J,
    ApiOutlined: O,
    RocketOutlined: A
  } = E().antdIcons || {}, { Text: B } = _, [R, u] = t([]), [T, z] = t(!0), [G, I] = t(""), [x, d] = t(!1), [v, W] = t(null), [Q, L] = t("mcp"), m = n(async () => {
    z(!0);
    try {
      const k = await Bt();
      u(k);
    } catch (k) {
      p.error(k.message || "加载能力列表失败"), u([]);
    } finally {
      z(!1);
    }
  }, []);
  l(() => {
    m();
  }, [m]);
  const Y = a(() => {
    if (!G.trim()) return R;
    const k = G.toLowerCase();
    return R.filter(
      (S) => {
        var ne;
        return S.name.toLowerCase().includes(k) || S.key.toLowerCase().includes(k) || ((ne = S.description) == null ? void 0 : ne.toLowerCase().includes(k)) || S.transport.toLowerCase().includes(k);
      }
    );
  }, [R, G]), s = R.filter((k) => k.enabled).length, Z = R.reduce((k, S) => {
    var ne;
    return k + (((ne = S.tools) == null ? void 0 : ne.length) || 0);
  }, 0), U = (k) => {
    window.history.pushState({}, "", k), window.dispatchEvent(new PopStateEvent("popstate"));
  }, V = e.createElement(
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
        prefix: J ? e.createElement(J) : void 0,
        value: G,
        onChange: (k) => I(k.target.value),
        allowClear: !0,
        style: { maxWidth: 400 }
      }),
      e.createElement(
        f,
        {
          type: "primary",
          icon: w ? e.createElement(w) : void 0,
          onClick: () => U("/mcp"),
          style: Pe
        },
        "管理 MCP"
      )
    ),
    T ? e.createElement(
      "div",
      { style: { textAlign: "center", padding: 60 } },
      e.createElement(r, { size: "large" })
    ) : Y.length === 0 ? e.createElement(o, {
      description: G ? "未找到匹配的能力" : "暂无 MCP 客户端，点击「管理 MCP」添加"
    }) : e.createElement(
      g,
      { gutter: [12, 12], align: "stretch" },
      ...Y.map(
        (k) => e.createElement(
          $,
          {
            key: k.key,
            xs: 24,
            sm: 12,
            md: 8,
            lg: 6,
            style: { display: "flex" }
          },
          e.createElement(xn, {
            mcp: k,
            onClick: () => {
              W(k), d(!0);
            }
          })
        )
      )
    )
  ), ae = [
    {
      key: "mcp",
      label: e.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        O ? e.createElement(O, { style: { fontSize: 14 } }) : null,
        "MCP 客户端"
      ),
      children: V
    },
    {
      key: "software",
      label: e.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        A ? e.createElement(A, { style: { fontSize: 14 } }) : null,
        "计算引擎"
      ),
      children: e.createElement(Pn)
    }
  ];
  return e.createElement(
    "div",
    { style: { padding: 24 } },
    e.createElement(Qe, {
      title: "工具",
      subtitle: `MCP: ${R.length} 个客户端（${s} 个启用）· ${Z} 个工具`,
      extra: e.createElement(
        e.Fragment,
        null,
        e.createElement(
          f,
          {
            icon: F ? e.createElement(F) : void 0,
            onClick: m,
            loading: T
          },
          "刷新"
        )
      )
    }),
    e.createElement(P, {
      items: ae,
      activeKey: Q,
      onChange: (k) => L(k)
    }),
    // MCP Detail drawer
    v ? e.createElement(
      b,
      {
        title: e.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 8 } },
          e.createElement("span", { style: { fontSize: 18 } }, "🔌"),
          e.createElement(
            "span",
            null,
            v.name || v.key
          )
        ),
        open: x,
        onClose: () => d(!1),
        width: 480
      },
      e.createElement(
        h,
        { column: 1, bordered: !0, size: "small" },
        e.createElement(
          h.Item,
          { label: "Key" },
          e.createElement(
            "code",
            { style: { fontSize: 12 } },
            v.key
          )
        ),
        e.createElement(
          h.Item,
          { label: "名称" },
          v.name || "-"
        ),
        e.createElement(
          h.Item,
          { label: "描述" },
          v.description || "-"
        ),
        e.createElement(
          h.Item,
          { label: "状态" },
          e.createElement(
            H,
            { color: v.enabled ? "green" : "default" },
            v.enabled ? "启用" : "停用"
          )
        ),
        e.createElement(
          h.Item,
          { label: "传输方式" },
          v.transport
        ),
        v.url ? e.createElement(
          h.Item,
          { label: "URL" },
          v.url
        ) : null,
        v.command ? e.createElement(
          h.Item,
          { label: "命令" },
          e.createElement(
            "code",
            { style: { fontSize: 11 } },
            v.command
          )
        ) : null,
        v.args && v.args.length > 0 ? e.createElement(
          h.Item,
          { label: "参数" },
          v.args.join(" ")
        ) : null
      ),
      v.tools && v.tools.length > 0 ? e.createElement(
        "div",
        { style: { marginTop: 16 } },
        e.createElement(
          B,
          {
            strong: !0,
            style: { display: "block", marginBottom: 8 }
          },
          "提供的工具"
        ),
        e.createElement(D, {
          size: "small",
          dataSource: v.tools,
          renderItem: (k) => e.createElement(
            D.Item,
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
              O ? e.createElement(O, {
                style: { fontSize: 12, color: "#1677ff" }
              }) : null,
              e.createElement(
                B,
                { style: { fontSize: 12 } },
                k
              )
            )
          )
        })
      ) : e.createElement(
        "div",
        { style: { marginTop: 16, fontSize: 12, color: "#8c8c8c" } },
        "此 MCP 客户端未设置工具白名单（所有工具均可用）"
      )
    ) : null
  );
}
function $n({
  agentId: e,
  agentName: t,
  onNavigate: l
}) {
  const n = E().React, { useState: a, useEffect: r, useCallback: o } = n, {
    Spin: i,
    Empty: f,
    Button: p,
    Row: g,
    Col: $,
    Card: b,
    Tag: h,
    Checkbox: H,
    Modal: _,
    Typography: D,
    Drawer: P,
    Descriptions: F,
    message: w
  } = E().antd, {
    ReloadOutlined: J,
    ThunderboltOutlined: O,
    SettingOutlined: A,
    CheckSquareOutlined: B,
    EyeOutlined: R,
    EyeInvisibleOutlined: u,
    DeleteOutlined: T,
    CloseOutlined: z
  } = E().antdIcons || {}, { Text: G, Paragraph: I } = D, [x, d] = a([]), [v, W] = a(!0), [Q, L] = a(!1), [m, Y] = a(null), [s, Z] = a(!1), [U, V] = a(
    /* @__PURE__ */ new Set()
  ), [ae, k] = a(!1), S = o(async () => {
    if (e) {
      W(!0);
      try {
        const M = await ot(e);
        d(M);
      } catch (M) {
        w.error(M.message || "加载技能失败"), d([]);
      } finally {
        W(!1);
      }
    }
  }, [e]);
  r(() => {
    S();
  }, [S]);
  const ne = (M) => {
    V((le) => {
      const q = new Set(le);
      return q.has(M) ? q.delete(M) : q.add(M), q;
    });
  }, y = () => V(/* @__PURE__ */ new Set()), se = () => V(new Set(x.map((M) => M.name))), re = () => {
    s ? (y(), Z(!1)) : Z(!0);
  }, he = async () => {
    const M = Array.from(U);
    if (M.length !== 0) {
      k(!0);
      try {
        const { results: le } = await Xt(e, M), q = Object.entries(le).filter(
          ([, ye]) => ye.success === !1
        ), Ee = M.length - q.length;
        q.length > 0 ? w.warning(
          `批量启用完成：成功 ${Ee} 个，失败 ${q.length} 个`
        ) : w.success(`成功启用 ${M.length} 个技能`), y(), await S();
      } catch (le) {
        w.error(le.message || "批量启用失败");
      } finally {
        k(!1);
      }
    }
  }, ve = async () => {
    const M = Array.from(U);
    if (M.length !== 0) {
      k(!0);
      try {
        const { results: le } = await Kt(e, M), q = Object.entries(le).filter(
          ([, ye]) => ye.success === !1
        ), Ee = M.length - q.length;
        q.length > 0 ? w.warning(
          `批量停用完成：成功 ${Ee} 个，失败 ${q.length} 个`
        ) : w.success(`成功停用 ${M.length} 个技能`), y(), await S();
      } catch (le) {
        w.error(le.message || "批量停用失败");
      } finally {
        k(!1);
      }
    }
  }, N = () => {
    const M = Array.from(U);
    M.length !== 0 && _.confirm({
      title: `确认删除 ${M.length} 个技能？`,
      content: "删除后技能将从当前专家工作区移除，此操作不可撤销。技能池中的原始技能不受影响。",
      okText: "确认删除",
      cancelText: "取消",
      okButtonProps: { danger: !0 },
      onOk: async () => {
        k(!0);
        try {
          const { results: le } = await Vt(e, M), q = Object.entries(le).filter(
            ([, ye]) => ye.success === !1
          ), Ee = M.length - q.length;
          q.length > 0 ? w.warning(
            `批量删除完成：成功 ${Ee} 个，失败 ${q.length} 个`
          ) : w.success(`成功删除 ${M.length} 个技能`), y(), await S();
        } catch (le) {
          w.error(le.message || "批量删除失败");
        } finally {
          k(!1);
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
        G,
        { type: "secondary", style: { fontSize: 13 } },
        s ? `已选择 ${U.size} / ${x.length} 个技能` : `共 ${x.length} 个技能`
      ),
      n.createElement(
        "div",
        { style: { display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" } },
        s ? n.createElement(
          n.Fragment,
          null,
          n.createElement(
            p,
            { size: "small", onClick: se },
            "全选"
          ),
          n.createElement(
            p,
            {
              size: "small",
              icon: z ? n.createElement(z) : void 0,
              onClick: y
            },
            "取消选择"
          ),
          n.createElement(
            p,
            {
              size: "small",
              type: "default",
              icon: R ? n.createElement(R) : void 0,
              disabled: U.size === 0 || ae,
              loading: ae,
              onClick: he
            },
            "批量启用"
          ),
          n.createElement(
            p,
            {
              size: "small",
              danger: !0,
              icon: u ? n.createElement(u) : void 0,
              disabled: U.size === 0 || ae,
              loading: ae,
              onClick: ve
            },
            "批量停用"
          ),
          n.createElement(
            p,
            {
              size: "small",
              danger: !0,
              icon: T ? n.createElement(T) : void 0,
              disabled: U.size === 0 || ae,
              loading: ae,
              onClick: N
            },
            `删除 (${U.size})`
          ),
          n.createElement(
            p,
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
            p,
            {
              size: "small",
              icon: B ? n.createElement(B) : void 0,
              onClick: re,
              disabled: x.length === 0
            },
            "批量管理"
          ),
          n.createElement(
            p,
            {
              icon: J ? n.createElement(J) : void 0,
              onClick: S,
              loading: v,
              size: "small"
            },
            "刷新"
          )
        )
      )
    ),
    v ? n.createElement(
      "div",
      { style: { textAlign: "center", padding: 60 } },
      n.createElement(i, { size: "large" })
    ) : x.length === 0 ? n.createElement(f, {
      description: "当前智能体未加载任何技能"
    }) : n.createElement(
      g,
      { gutter: [12, 12] },
      ...x.map(
        (M) => n.createElement(
          $,
          { key: M.name, xs: 24, sm: 12, md: 8, lg: 6 },
          n.createElement(
            b,
            {
              hoverable: !0,
              size: "small",
              style: {
                cursor: s ? "default" : "pointer",
                height: "100%",
                position: "relative",
                borderColor: s && U.has(M.name) ? "#0072f5" : void 0,
                borderWidth: s && U.has(M.name) ? 2 : 1
              },
              onClick: () => {
                s ? ne(M.name) : (Y(M), L(!0));
              }
            },
            s ? n.createElement(
              "div",
              {
                style: {
                  position: "absolute",
                  top: 8,
                  right: 8,
                  zIndex: 1
                },
                onClick: (le) => {
                  le.stopPropagation(), ne(M.name);
                }
              },
              n.createElement(H, {
                checked: U.has(M.name)
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
              M.emoji ? n.createElement(
                "span",
                { style: { fontSize: 18 } },
                M.emoji
              ) : n.createElement(
                "span",
                { style: { fontSize: 18 } },
                "⚡"
              ),
              n.createElement(
                G,
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
                M.name
              ),
              M.enabled === !1 ? n.createElement(
                h,
                { color: "default", style: { fontSize: 10 } },
                "已禁用"
              ) : n.createElement(
                h,
                { color: "green", style: { fontSize: 10 } },
                "已启用"
              )
            ),
            M.description ? n.createElement(
              I,
              {
                type: "secondary",
                style: { fontSize: 11, margin: 0, lineHeight: 1.4 },
                ellipsis: { rows: 2 }
              },
              M.description
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
              M.version_text ? n.createElement(
                h,
                { style: { fontSize: 10 } },
                `v${M.version_text}`
              ) : null,
              ...(M.tags || []).slice(0, 3).map(
                (le, q) => n.createElement(
                  h,
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
      P,
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
        open: Q,
        onClose: () => L(!1),
        width: 520,
        extra: n.createElement(
          p,
          {
            type: "primary",
            size: "small",
            icon: A ? n.createElement(A) : void 0,
            onClick: () => l("/skills")
          },
          "管理技能"
        )
      },
      n.createElement(
        F,
        { column: 1, bordered: !0, size: "small" },
        n.createElement(
          F.Item,
          { label: "技能名称" },
          m.name
        ),
        n.createElement(
          F.Item,
          { label: "描述" },
          m.description || "-"
        ),
        m.version_text ? n.createElement(
          F.Item,
          { label: "版本" },
          m.version_text
        ) : null,
        n.createElement(
          F.Item,
          { label: "来源" },
          m.source || "-"
        ),
        n.createElement(
          F.Item,
          { label: "状态" },
          m.enabled === !1 ? "已禁用" : "已启用"
        ),
        m.installed_from ? n.createElement(
          F.Item,
          { label: "安装来源" },
          m.installed_from
        ) : null
      ),
      // Tags
      m.tags && m.tags.length > 0 ? n.createElement(
        "div",
        { style: { marginTop: 16 } },
        n.createElement(
          G,
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
            (M, le) => n.createElement(h, { key: le, color: "blue" }, M)
          )
        )
      ) : null,
      // Skill content preview
      m.content ? n.createElement(
        "div",
        { style: { marginTop: 16 } },
        n.createElement(
          G,
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
function An({
  poolSkills: e,
  workspaceSkills: t,
  agents: l,
  loading: n,
  onReload: a
}) {
  const r = E().React, { useState: o, useMemo: i, useCallback: f } = r, {
    Spin: p,
    Empty: g,
    Input: $,
    Button: b,
    Row: h,
    Col: H,
    Card: _,
    Tag: D,
    Typography: P,
    Drawer: F,
    Descriptions: w,
    List: J
  } = E().antd, {
    ReloadOutlined: O,
    SearchOutlined: A,
    DownloadOutlined: B,
    ThunderboltOutlined: R
  } = E().antdIcons || {}, { Text: u, Paragraph: T } = P, [z, G] = o(""), [I, x] = o(!1), [d, v] = o(null), [W, Q] = o([]), L = i(() => {
    if (!z.trim()) return e;
    const s = z.toLowerCase();
    return e.filter(
      (Z) => {
        var U, V;
        return Z.name.toLowerCase().includes(s) || ((U = Z.description) == null ? void 0 : U.toLowerCase().includes(s)) || ((V = Z.tags) == null ? void 0 : V.some((ae) => ae.toLowerCase().includes(s)));
      }
    );
  }, [e, z]), m = f(
    (s) => {
      const Z = [];
      for (const U of t)
        if (U.skills.some((V) => V.name === s)) {
          const V = l.find((ae) => ae.id === U.agent_id);
          Z.push((V == null ? void 0 : V.name) || U.agent_name || U.agent_id);
        }
      return Z;
    },
    [t, l]
  ), Y = (s) => {
    window.history.pushState({}, "", s), window.dispatchEvent(new PopStateEvent("popstate"));
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
      r.createElement($, {
        placeholder: "搜索技能名称、描述或标签...",
        prefix: A ? r.createElement(A) : void 0,
        value: z,
        onChange: (s) => G(s.target.value),
        allowClear: !0,
        style: { maxWidth: 400 }
      }),
      r.createElement(
        "div",
        { style: { display: "flex", gap: 8 } },
        r.createElement(
          b,
          {
            icon: O ? r.createElement(O) : void 0,
            onClick: a,
            loading: n,
            size: "small"
          },
          "刷新"
        ),
        r.createElement(
          b,
          {
            type: "primary",
            icon: B ? r.createElement(B) : void 0,
            onClick: () => Y("/skill-pool"),
            size: "small",
            style: Pe
          },
          "管理技能池"
        )
      )
    ),
    n ? r.createElement(
      "div",
      { style: { textAlign: "center", padding: 60 } },
      r.createElement(p, { size: "large" })
    ) : L.length === 0 ? r.createElement(g, {
      description: z ? "未找到匹配的技能" : "技能池为空"
    }) : r.createElement(
      h,
      { gutter: [12, 12] },
      ...L.map(
        (s) => r.createElement(
          H,
          { key: s.name, xs: 24, sm: 12, md: 8, lg: 6 },
          r.createElement(
            _,
            {
              hoverable: !0,
              size: "small",
              style: { cursor: "pointer", height: "100%" },
              onClick: () => {
                v(s), Q(m(s.name)), x(!0);
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
              s.emoji ? r.createElement(
                "span",
                { style: { fontSize: 18 } },
                s.emoji
              ) : r.createElement(
                "span",
                { style: { fontSize: 18 } },
                "⚡"
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
                    whiteSpace: "nowrap"
                  }
                },
                s.name
              ),
              s.protected ? r.createElement(
                D,
                { color: "gold", style: { fontSize: 10 } },
                "内置"
              ) : null
            ),
            s.description ? r.createElement(
              T,
              {
                type: "secondary",
                style: { fontSize: 11, margin: 0, lineHeight: 1.4 },
                ellipsis: { rows: 2 }
              },
              s.description
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
              s.version_text ? r.createElement(
                D,
                { style: { fontSize: 10 } },
                `v${s.version_text}`
              ) : null,
              ...(s.tags || []).slice(0, 3).map(
                (Z, U) => r.createElement(
                  D,
                  { key: U, color: "cyan", style: { fontSize: 10 } },
                  Z
                )
              )
            )
          )
        )
      )
    ),
    // Skill detail drawer
    d ? r.createElement(
      F,
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
        open: I,
        onClose: () => x(!1),
        width: 520,
        extra: r.createElement(
          b,
          {
            type: "primary",
            size: "small",
            icon: R ? r.createElement(R) : void 0,
            onClick: () => Y("/skills")
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
          d.name
        ),
        r.createElement(
          w.Item,
          { label: "描述" },
          d.description || "-"
        ),
        d.version_text ? r.createElement(
          w.Item,
          { label: "版本" },
          d.version_text
        ) : null,
        r.createElement(
          w.Item,
          { label: "来源" },
          d.source || "-"
        ),
        r.createElement(
          w.Item,
          { label: "受保护" },
          d.protected ? "是（内置）" : "否"
        ),
        d.sync_status ? r.createElement(
          w.Item,
          { label: "同步状态" },
          d.sync_status
        ) : null,
        d.installed_from ? r.createElement(
          w.Item,
          { label: "安装来源" },
          d.installed_from
        ) : null
      ),
      // Tags
      d.tags && d.tags.length > 0 ? r.createElement(
        "div",
        { style: { marginTop: 16 } },
        r.createElement(
          u,
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
            (s, Z) => r.createElement(D, { key: Z, color: "cyan" }, s)
          )
        )
      ) : null,
      // Installed agents
      r.createElement(
        "div",
        { style: { marginTop: 16 } },
        r.createElement(
          u,
          { strong: !0, style: { display: "block", marginBottom: 8 } },
          `已安装此技能的专家 (${W.length})`
        ),
        W.length > 0 ? r.createElement(J, {
          size: "small",
          dataSource: W,
          renderItem: (s) => r.createElement(
            J.Item,
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
                u,
                { style: { fontSize: 13 } },
                s
              )
            )
          )
        }) : r.createElement(
          u,
          { type: "secondary", style: { fontSize: 12 } },
          "暂无专家安装此技能"
        )
      )
    ) : null
  );
}
function Rn() {
  const e = E().React, { useState: t, useEffect: l, useCallback: n, useMemo: a } = e, { Tabs: r, message: o } = E().antd, { ThunderboltOutlined: i, AppstoreOutlined: f } = E().antdIcons || {}, g = E().useSelectedAgent, $ = g ? g() : null, b = ($ == null ? void 0 : $.id) || "default", [h, H] = t([]), [_, D] = t([]), [P, F] = t([]), [w, J] = t(!0), [O, A] = t("agent-skills"), B = n(async () => {
    J(!0);
    try {
      const [z, G, I] = await Promise.all([
        it(),
        st(),
        Mt()
      ]);
      D(z), H(G), F(I);
    } catch (z) {
      o.error(z.message || "加载技能列表失败"), D([]);
    } finally {
      J(!1);
    }
  }, []);
  l(() => {
    B();
  }, [B]);
  const R = a(() => {
    const z = h.find((G) => G.id === b);
    return (z == null ? void 0 : z.name) || b;
  }, [h, b]), u = (z) => {
    window.history.pushState({}, "", z), window.dispatchEvent(new PopStateEvent("popstate"));
  }, T = [
    {
      key: "agent-skills",
      label: e.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        i ? e.createElement(i, { style: { fontSize: 14 } }) : null,
        "当前Agent加载技能"
      ),
      children: e.createElement($n, {
        agentId: b,
        agentName: R,
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
      children: e.createElement(An, {
        poolSkills: _,
        workspaceSkills: P,
        agents: h,
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
      subtitle: `技能池共 ${_.length} 个技能 · 当前智能体：${R}`
    }),
    e.createElement(r, {
      items: T,
      activeKey: O,
      onChange: (z) => A(z)
    })
  );
}
const at = "ugsci.market.githubSources", gt = "https://github.com/anthropics/skills/tree/main/skills";
function $t(e) {
  try {
    const t = new URL(e.trim()), l = t.hostname.toLowerCase();
    if (l !== "github.com" && l !== "www.github.com") return null;
    const n = t.pathname.split("/").filter((f) => f.length > 0);
    if (n.length < 2) return null;
    const a = decodeURIComponent(n[0]), r = decodeURIComponent(n[1]);
    let o = "main", i = "";
    return n.length >= 4 && (n[2] === "tree" || n[2] === "blob") ? (o = decodeURIComponent(n[3]), n.length > 4 && (i = n.slice(4).map(decodeURIComponent).join("/"))) : n.length > 2 && (i = n.slice(2).map(decodeURIComponent).join("/")), i = i.replace(/\/+$/, "").replace(/^\/+/, ""), {
      owner: a,
      repo: r,
      ref: o || "main",
      skillsPath: i,
      label: `${a}/${r}`
    };
  } catch {
    return null;
  }
}
function At(e, t, l) {
  return `${e}/${t}:${l || "/"}`;
}
function Ln() {
  try {
    const e = localStorage.getItem(at);
    if (!e) {
      const l = $t(gt);
      if (l) {
        const n = [
          {
            id: At(
              l.owner,
              l.repo,
              l.skillsPath
            ),
            url: gt,
            label: l.label,
            owner: l.owner,
            repo: l.repo,
            ref: l.ref,
            skillsPath: l.skillsPath,
            enabled: !0
          }
        ];
        return localStorage.setItem(at, JSON.stringify(n)), n;
      }
      return [];
    }
    const t = JSON.parse(e);
    return Array.isArray(t) ? t.filter(
      (l) => l && typeof l.id == "string" && typeof l.owner == "string" && typeof l.repo == "string"
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
function Mn(e) {
  const t = e.match(/^---\s*\n([\s\S]*?)\n---/);
  if (!t) return {};
  const l = t[1], n = {}, a = l.split(`
`);
  let r = "";
  for (const o of a) {
    const i = o.match(/^(\w[\w-]*)\s*:\s*(.*)$/);
    if (i) {
      r = i[1];
      let f = i[2].trim();
      (f.startsWith('"') && f.endsWith('"') || f.startsWith("'") && f.endsWith("'")) && (f = f.slice(1, -1)), r === "name" ? n.name = f : r === "description" ? n.description = f : r === "version" ? n.version = f : r === "author" && (n.author = f);
    }
  }
  return n;
}
async function Bn(e) {
  const t = e.skillsPath ? encodeURIComponent(e.skillsPath).replace(/%2F/g, "/") : "", l = `https://api.github.com/repos/${e.owner}/${e.repo}/contents/${t}?ref=${encodeURIComponent(e.ref)}`, n = await fetch(l, {
    headers: { Accept: "application/vnd.github+json" }
  });
  if (!n.ok)
    throw new Error(
      `GitHub API ${n.status}: ${e.label} (${e.skillsPath || "/"})`
    );
  const a = await n.json();
  if (!Array.isArray(a)) return [];
  const r = a.filter(
    (i) => i.type === "dir" && i.name
  );
  return await Promise.all(
    r.map(async (i) => {
      const f = `https://raw.githubusercontent.com/${e.owner}/${e.repo}/${e.ref}/${e.skillsPath ? e.skillsPath + "/" : ""}${i.name}/SKILL.md`, p = `https://github.com/${e.owner}/${e.repo}/tree/${e.ref}/${e.skillsPath ? e.skillsPath + "/" : ""}${i.name}`, g = {
        sourceId: e.id,
        sourceLabel: e.label,
        name: i.name,
        description: "",
        source_url: p,
        html_url: p,
        version: null,
        author: null
      };
      try {
        const $ = await fetch(f);
        if (!$.ok) return g;
        const b = await $.text(), h = Mn(b);
        return {
          ...g,
          name: h.name || i.name,
          description: h.description || "",
          version: h.version || null,
          author: h.author || null
        };
      } catch {
        return g;
      }
    })
  );
}
async function jn(e) {
  const t = e.filter((r) => r.enabled), l = await Promise.all(
    t.map(async (r) => {
      try {
        return { skills: await Bn(r), error: null, label: r.label };
      } catch (o) {
        return {
          skills: [],
          error: o.message || String(o),
          label: r.label
        };
      }
    })
  ), n = [], a = [];
  for (const r of l)
    n.push(...r.skills), r.error && a.push({ label: r.label, message: r.error });
  return { skills: n, errors: a };
}
function Dn({
  open: e,
  onClose: t,
  sources: l,
  onChange: n
}) {
  const a = E().React, { useState: r } = a, {
    Modal: o,
    Input: i,
    Button: f,
    List: p,
    Tag: g,
    Switch: $,
    Typography: b,
    Tooltip: h,
    message: H
  } = E().antd, {
    PlusOutlined: _,
    DeleteOutlined: D,
    LinkOutlined: P,
    GithubOutlined: F
  } = E().antdIcons || {}, { Text: w } = b, [J, O] = r(""), A = () => {
    const u = J.trim();
    if (!u) return;
    const T = $t(u);
    if (!T) {
      H.error("无效的 GitHub URL，请输入类似 https://github.com/owner/repo/tree/main/skills 的链接");
      return;
    }
    const z = At(T.owner, T.repo, T.skillsPath);
    if (l.some((x) => x.id === z)) {
      H.warning("该源已存在");
      return;
    }
    const G = {
      id: z,
      url: u,
      label: T.label,
      owner: T.owner,
      repo: T.repo,
      ref: T.ref,
      skillsPath: T.skillsPath,
      enabled: !0
    }, I = [...l, G];
    tt(I), n(I), O(""), H.success(`已添加源: ${T.label}`);
  }, B = (u, T) => {
    const z = l.map(
      (G) => G.id === u ? { ...G, enabled: T } : G
    );
    tt(z), n(z);
  }, R = (u) => {
    const T = l.filter((z) => z.id !== u);
    tt(T), n(T), H.success("已移除源");
  };
  return a.createElement(
    o,
    {
      open: e,
      onCancel: t,
      title: a.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 8 } },
        F ? a.createElement(F, { style: { fontSize: 18 } }) : null,
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
        w,
        { type: "secondary", style: { fontSize: 12, display: "block", marginBottom: 8 } },
        "添加 GitHub 仓库作为技能源，系统将从该仓库的指定目录获取技能列表。支持格式："
      ),
      a.createElement(
        "div",
        { style: { display: "flex", gap: 8, alignItems: "center" } },
        a.createElement(i, {
          placeholder: "https://github.com/anthropics/skills/tree/main/skills",
          value: J,
          onChange: (u) => O(u.target.value),
          onPressEnter: A,
          prefix: P ? a.createElement(P) : void 0,
          style: { flex: 1 }
        }),
        a.createElement(
          f,
          {
            type: "primary",
            icon: _ ? a.createElement(_) : void 0,
            onClick: A
          },
          "添加"
        )
      )
    ),
    a.createElement(
      "div",
      { style: { marginBottom: 8, display: "flex", alignItems: "center", justifyContent: "space-between" } },
      a.createElement(w, { strong: !0 }, `已配置源 (${l.length})`)
    ),
    a.createElement(p, {
      size: "small",
      bordered: !0,
      dataSource: l,
      renderItem: (u) => a.createElement(
        p.Item,
        {
          actions: [
            a.createElement(
              h,
              { title: u.enabled ? "点击禁用" : "点击启用" },
              a.createElement($, {
                size: "small",
                checked: u.enabled,
                onChange: (T) => B(u.id, T)
              })
            ),
            a.createElement(
              h,
              { title: "移除此源" },
              a.createElement(
                f,
                {
                  size: "small",
                  type: "text",
                  danger: !0,
                  icon: D ? a.createElement(D) : void 0,
                  onClick: () => R(u.id)
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
              g,
              { color: "blue", style: { fontSize: 11 } },
              u.label
            ),
            u.skillsPath ? a.createElement(
              w,
              { type: "secondary", style: { fontSize: 11 } },
              `/${u.skillsPath}`
            ) : null,
            a.createElement(
              w,
              { type: "secondary", style: { fontSize: 11 } },
              `@${u.ref}`
            )
          ),
          a.createElement(
            w,
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
async function Nn() {
  return te("/market/providers");
}
async function Un(e) {
  return te(
    `/market/categories?lang=${encodeURIComponent(e)}`
  );
}
async function Fn(e, t, l, n, a) {
  return te("/market/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: e,
      provider_pages: t,
      limit: l,
      lang: n,
      category: a || void 0
    })
  });
}
async function yt(e, t, l) {
  return te("/skills/hub/install/start", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify({
      bundle_url: t,
      enable: l
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
function Hn() {
  const e = E().React, { useState: t, useEffect: l, useCallback: n, useMemo: a, useRef: r } = e, {
    Spin: o,
    Empty: i,
    Input: f,
    Button: p,
    message: g,
    Row: $,
    Col: b,
    Card: h,
    Tag: H,
    Tooltip: _,
    Typography: D,
    Select: P,
    Drawer: F,
    Descriptions: w,
    Tabs: J,
    Badge: O,
    Progress: A
  } = E().antd, {
    ReloadOutlined: B,
    SearchOutlined: R,
    DownloadOutlined: u,
    AppstoreOutlined: T,
    ShopOutlined: z,
    CheckCircleOutlined: G,
    LoadingOutlined: I,
    UserOutlined: x,
    SettingOutlined: d,
    GithubOutlined: v
  } = E().antdIcons || {}, { Text: W, Paragraph: Q, Title: L } = D, [m, Y] = t("skills"), [s, Z] = t([]), [U, V] = t([]), [ae, k] = t([]), [S, ne] = t(""), [y, se] = t(""), [re, he] = t(!1), [ve, N] = t(!1), [M, le] = t(
    {}
  ), [q, Ee] = t(null), [ye, oe] = t({}), [ze, Oe] = t([]), [X, C] = t(""), [ee, ie] = t(""), [pe, fe] = t([]), [$e, Ae] = t([]), [Fe, He] = t(!1), [Je, We] = t(!1), [Ce, Ge] = t(""), Le = r(null);
  l(() => {
    Promise.all([
      Nn().catch(() => []),
      Un("zh").catch(() => []),
      st().catch(() => [])
    ]).then(([c, K, ce]) => {
      Z(c), V(K), Oe(ce), ce.length > 0 && C(ce[0].id);
    });
  }, []);
  const De = n(async (c) => {
    const K = c ?? Ln();
    if (fe(c || K), K.filter((me) => me.enabled).length === 0) {
      Ae([]);
      return;
    }
    He(!0);
    try {
      const { skills: me, errors: xe } = await jn(K);
      if (Ae(me), xe.length > 0) {
        for (const de of xe)
          console.warn(`[ugsci] GitHub source '${de.label}' error: ${de.message}`);
        g.warning(
          `部分源加载失败: ${xe.map((de) => de.label).join(", ")}`
        );
      }
    } catch (me) {
      g.error(me.message || "加载 GitHub 技能源失败"), Ae([]);
    } finally {
      He(!1);
    }
  }, []);
  l(() => {
    De();
  }, [De]);
  const ke = n(
    async (c, K, ce) => {
      he(!0);
      try {
        const me = await Fn(
          c,
          ce,
          20,
          "zh",
          K || void 0
        );
        ce === void 0 || Object.keys(ce).length === 0 ? k(me.results) : k((ge) => [...ge, ...me.results]);
        const xe = Object.values(me.by_provider || {}).some(
          (ge) => ge.has_more
        );
        N(xe);
        const de = {};
        for (const [ge, Te] of Object.entries(me.by_provider || {}))
          de[ge] = (ce[ge] || 1) + 1;
        if (le(de), me.errors.length > 0)
          for (const ge of me.errors)
            console.warn(
              `[ugsci] Market provider '${ge.provider}' error: ${ge.message}`
            );
      } catch (me) {
        g.error(me.message || "搜索市场失败"), k([]);
      } finally {
        he(!1);
      }
    },
    []
  );
  l(() => (Le.current && clearTimeout(Le.current), Le.current = setTimeout(() => {
    ke(S, y, {});
  }, 400), () => {
    Le.current && clearTimeout(Le.current);
  }), [S, y, ke]);
  const Ie = () => {
    ke(S, y, M);
  }, j = async (c) => {
    var ce;
    if (!X) {
      g.warning("请先选择安装目标专家");
      return;
    }
    const K = `${c.source}:${c.slug}`;
    try {
      oe((de) => ({ ...de, [K]: "starting" }));
      const me = await yt(
        X,
        c.source_url,
        !0
      );
      oe((de) => ({ ...de, [K]: "installing" }));
      const xe = 60;
      for (let de = 0; de < xe; de++) {
        await new Promise((Te) => setTimeout(Te, 2e3));
        const ge = await ft(
          X,
          me.task_id
        );
        if (ge.status === "completed" && ((ce = ge.result) != null && ce.installed)) {
          g.success(`技能「${ge.result.name || c.name}」安装成功`), oe((Te) => {
            const _e = { ...Te };
            return delete _e[K], _e;
          });
          return;
        }
        if (ge.status === "failed")
          throw new Error(ge.error || "安装失败");
        if (ge.status === "cancelled") {
          g.info("安装已取消"), oe((Te) => {
            const _e = { ...Te };
            return delete _e[K], _e;
          });
          return;
        }
      }
      throw new Error("安装超时");
    } catch (me) {
      g.error(me.message || "安装技能失败"), oe((xe) => {
        const de = { ...xe };
        return delete de[K], de;
      });
    }
  }, be = (c) => {
    window.history.pushState({}, "", c), window.dispatchEvent(new PopStateEvent("popstate"));
  }, Se = async (c) => {
    var ce;
    if (!X) {
      g.warning("请先选择安装目标专家");
      return;
    }
    const K = `github:${c.sourceId}:${c.name}`;
    try {
      oe((de) => ({ ...de, [K]: "starting" }));
      const me = await yt(
        X,
        c.source_url,
        !0
      );
      oe((de) => ({ ...de, [K]: "installing" }));
      const xe = 60;
      for (let de = 0; de < xe; de++) {
        await new Promise((Te) => setTimeout(Te, 2e3));
        const ge = await ft(
          X,
          me.task_id
        );
        if (ge.status === "completed" && ((ce = ge.result) != null && ce.installed)) {
          g.success(`技能「${ge.result.name || c.name}」安装成功`), oe((Te) => {
            const _e = { ...Te };
            return delete _e[K], _e;
          });
          return;
        }
        if (ge.status === "failed")
          throw new Error(ge.error || "安装失败");
        if (ge.status === "cancelled") {
          g.info("安装已取消"), oe((Te) => {
            const _e = { ...Te };
            return delete _e[K], _e;
          });
          return;
        }
      }
      throw new Error("安装超时");
    } catch (me) {
      g.error(me.message || "安装技能失败"), oe((xe) => {
        const de = { ...xe };
        return delete de[K], de;
      });
    }
  }, we = a(() => {
    let c = $e;
    if (Ce && (c = c.filter((K) => K.sourceLabel === Ce)), S.trim()) {
      const K = S.toLowerCase();
      c = c.filter(
        (ce) => {
          var me;
          return ce.name.toLowerCase().includes(K) || ((me = ce.description) == null ? void 0 : me.toLowerCase().includes(K));
        }
      );
    }
    return c;
  }, [$e, S, Ce]), Be = s.filter((c) => c.available), Re = a(() => {
    if (!Ce) return ae;
    const c = Be.find(
      (K) => K.label === Ce
    );
    return c ? ae.filter((K) => K.source === c.key) : ae;
  }, [ae, Ce, Be]), ue = a(() => {
    const c = /* @__PURE__ */ new Set();
    return pe.filter((K) => K.enabled).forEach((K) => c.add(K.label)), Be.forEach((K) => c.add(K.label)), Array.from(c);
  }, [pe, Be]), Ze = e.createElement(
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
        prefix: R ? e.createElement(R) : void 0,
        value: S,
        onChange: (c) => ne(c.target.value),
        allowClear: !0,
        style: { flex: 1, minWidth: 200, maxWidth: 400 }
      }),
      U.length > 0 ? e.createElement(P, {
        value: y || void 0,
        onChange: (c) => se(c || ""),
        placeholder: "全部分类",
        allowClear: !0,
        style: { minWidth: 150 },
        options: [
          { value: "", label: "全部分类" },
          ...U.map((c) => ({ value: c.id, label: c.label }))
        ]
      }) : null,
      // Install target selector
      e.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 4 } },
        e.createElement(
          W,
          { type: "secondary", style: { fontSize: 12 } },
          "安装到"
        ),
        e.createElement(P, {
          value: X || void 0,
          onChange: (c) => C(c),
          style: { minWidth: 140 },
          placeholder: "选择专家",
          options: ze.map((c) => ({ value: c.id, label: c.name }))
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
        W,
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
          color: Ce === "" ? "blue" : void 0,
          onClick: () => Ge("")
        },
        "全部"
      ),
      ...ue.map(
        (c) => e.createElement(
          H,
          {
            key: c,
            style: {
              fontSize: 11,
              cursor: "pointer",
              borderRadius: 12
            },
            color: Ce === c ? "blue" : void 0,
            icon: v && pe.some((K) => K.label === c) ? e.createElement(v) : void 0,
            onClick: () => Ge(
              Ce === c ? "" : c
            )
          },
          c
        )
      )
    ) : null,
    // GitHub skills section
    Fe && $e.length === 0 ? e.createElement(
      "div",
      { style: { textAlign: "center", padding: 40, marginBottom: 16 } },
      e.createElement(o, {
        tip: "正在从 GitHub 加载技能...",
        size: "large"
      })
    ) : we.length > 0 ? e.createElement(
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
        v ? e.createElement(v, {
          style: { fontSize: 14, color: "#1677ff" }
        }) : null,
        e.createElement(
          W,
          { strong: !0, style: { fontSize: 13 } },
          `GitHub 技能源 (${we.length})`
        )
      ),
      e.createElement(
        $,
        { gutter: [12, 12] },
        ...we.map((c) => {
          const K = `github:${c.sourceId}:${c.name}`, ce = ye[K];
          return e.createElement(
            b,
            { key: K, xs: 24, sm: 12, md: 8, lg: 6 },
            e.createElement(
              h,
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
                v ? e.createElement(v, {
                  style: { fontSize: 18, color: "#57606a" }
                }) : e.createElement(
                  "span",
                  { style: { fontSize: 18 } },
                  "📦"
                ),
                e.createElement(
                  _,
                  { title: c.name },
                  e.createElement(
                    W,
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
                Q,
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
                    H,
                    { color: "blue", style: { fontSize: 10 } },
                    c.sourceLabel
                  ),
                  c.version ? e.createElement(
                    H,
                    { style: { fontSize: 10 } },
                    `v${c.version}`
                  ) : null
                ),
                ce ? e.createElement(
                  p,
                  {
                    size: "small",
                    disabled: !0,
                    icon: I ? e.createElement(I) : void 0
                  },
                  ce === "starting" ? "启动中" : "安装中"
                ) : e.createElement(
                  p,
                  {
                    type: "primary",
                    size: "small",
                    icon: u ? e.createElement(u) : void 0,
                    onClick: () => Se(c)
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
    Re.length > 0 || re ? e.createElement(
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
        W,
        { strong: !0, style: { fontSize: 13 } },
        `技能市场${Re.length > 0 ? ` (${Re.length})` : ""}`
      )
    ) : null,
    // Results grid
    re && Re.length === 0 ? e.createElement(
      "div",
      { style: { textAlign: "center", padding: 60 } },
      e.createElement(o, { size: "large" })
    ) : Re.length === 0 ? e.createElement(i, {
      description: S ? `未找到匹配「${S}」的技能` : "输入关键词搜索技能市场",
      image: i.PRESENTED_IMAGE_SIMPLE
    }) : e.createElement(
      $,
      { gutter: [12, 12] },
      ...Re.map((c) => {
        const K = `${c.source}:${c.slug}`, ce = ye[K];
        return e.createElement(
          b,
          { key: K, xs: 24, sm: 12, md: 8, lg: 6 },
          e.createElement(
            h,
            {
              hoverable: !0,
              size: "small",
              style: { height: "100%", cursor: "pointer" },
              onClick: () => Ee(c)
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
                _,
                { title: c.name },
                e.createElement(
                  W,
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
              Q,
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
                  H,
                  { color: "geekblue", style: { fontSize: 10 } },
                  c.source
                ),
                c.version ? e.createElement(
                  H,
                  { style: { fontSize: 10 } },
                  `v${c.version}`
                ) : null
              ),
              ce ? e.createElement(
                p,
                {
                  size: "small",
                  disabled: !0,
                  icon: I ? e.createElement(I) : void 0
                },
                ce === "starting" ? "启动中" : "安装中"
              ) : e.createElement(
                p,
                {
                  type: "primary",
                  size: "small",
                  icon: u ? e.createElement(u) : void 0,
                  onClick: (me) => {
                    me.stopPropagation(), j(c);
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
    ve && !re ? e.createElement(
      "div",
      { style: { textAlign: "center", marginTop: 16 } },
      e.createElement(
        p,
        { onClick: Ie, loading: re },
        "加载更多"
      )
    ) : null,
    // Detail Drawer
    q ? e.createElement(
      F,
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
        onClose: () => Ee(null),
        width: 480,
        extra: e.createElement(
          p,
          {
            type: "primary",
            icon: u ? e.createElement(u) : void 0,
            onClick: () => {
              j(q);
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
          W,
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
            ([c, K]) => e.createElement(
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
                String(K)
              ),
              e.createElement(
                W,
                { type: "secondary", style: { fontSize: 11 } },
                c
              )
            )
          )
        )
      ) : null
    ) : null
  ), et = a(() => {
    if (!ee.trim()) return nt;
    const c = ee.toLowerCase();
    return nt.filter(
      (K) => K.name.toLowerCase().includes(c) || K.description.toLowerCase().includes(c) || K.category.toLowerCase().includes(c)
    );
  }, [ee]), Xe = async (c) => {
    try {
      const K = await te("/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: c.name,
          description: c.description,
          skill_names: c.recommendedSkills
        })
      });
      await qe(K.id, "AGENTS.md", c.systemPrompt);
      const ce = await Ye(K.id);
      ce.approval_level = c.approvalLevel, await te(`/agents/${encodeURIComponent(K.id)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ce)
      }), g.success(`专家「${c.name}」创建成功，已跳转至专家`), be("/ugsci-experts");
    } catch (K) {
      g.error(K.message || "创建专家失败");
    }
  }, je = e.createElement(
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
        W,
        { style: { fontSize: 13, color: "#1f4e8c" } },
        "从专家模板库选择预设专家，一键创建并配置系统提示词、审批级别和推荐技能。未来将支持从远程市场获取更多行业专家模板。"
      )
    ),
    e.createElement(f, {
      placeholder: "搜索专家模板...",
      prefix: R ? e.createElement(R) : void 0,
      value: ee,
      onChange: (c) => ie(c.target.value),
      allowClear: !0,
      style: { marginBottom: 16, maxWidth: 400 }
    }),
    e.createElement(
      $,
      { gutter: [12, 12] },
      ...et.map(
        (c) => e.createElement(
          b,
          { key: c.id, xs: 24, sm: 12, md: 8 },
          e.createElement(
            h,
            {
              hoverable: !0,
              size: "small",
              style: { height: "100%", cursor: "pointer" },
              onClick: () => Xe(c)
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
                  W,
                  { strong: !0, style: { fontSize: 14 } },
                  c.name
                ),
                e.createElement(
                  "div",
                  { style: { display: "flex", gap: 4, marginTop: 4 } },
                  e.createElement(
                    H,
                    { color: "blue", style: { fontSize: 10 } },
                    c.category
                  ),
                  c.approvalLevel === "MANUAL" ? e.createElement(
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
              Q,
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
                W,
                { type: "secondary", style: { fontSize: 11 } },
                `推荐 ${c.recommendedSkills.length} 个技能`
              ),
              e.createElement(
                p,
                {
                  type: "primary",
                  size: "small",
                  icon: T ? e.createElement(T) : void 0
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
        W,
        { type: "secondary", style: { fontSize: 12 } },
        "更多专家模板持续更新中，未来将支持 OpenScience、RPA 等行业扩展"
      )
    )
  ), Rt = [
    {
      key: "skills",
      label: e.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        T ? e.createElement(T, { style: { fontSize: 14 } }) : null,
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
      children: je
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
          p,
          {
            icon: v ? e.createElement(v) : void 0,
            onClick: () => We(!0)
          },
          "配置源"
        ),
        e.createElement(
          p,
          {
            type: "primary",
            icon: B ? e.createElement(B) : void 0,
            onClick: () => {
              ke(S, y, {}), De();
            },
            loading: re || Fe
          },
          "刷新"
        )
      )
    }),
    e.createElement(J, {
      items: Rt,
      activeKey: m,
      onChange: (c) => Y(c)
    }),
    // Source config modal
    e.createElement(Dn, {
      open: Je,
      onClose: () => We(!1),
      sources: pe,
      onChange: (c) => {
        fe(c), De(c);
      }
    })
  );
}
function Wn() {
  var p;
  const e = window.QwenPaw;
  if (!(e != null && e.menu) || !(e != null && e.route)) {
    console.warn(
      "[ugsci] QwenPaw.menu/route API not available — plugin disabled"
    );
    return;
  }
  const t = E().React, l = "ugsci", n = E().antdIcons || {}, a = n.UserSwitchOutlined, r = n.ToolOutlined, o = n.ThunderboltOutlined, i = n.ShopOutlined;
  e.route.add(l, {
    id: "ugsci.experts",
    path: "/ugsci-experts",
    component: wn
  }), e.menu.add(l, {
    id: "ugsci.experts",
    location: "primary.agentScoped",
    label: () => "专家",
    icon: a ? t.createElement(a, { style: { fontSize: 16 } }) : void 0,
    route: "ugsci.experts",
    order: 5,
    visible: () => Ne()
  }), e.route.add(l, {
    id: "ugsci.capabilities",
    path: "/ugsci-capabilities",
    component: On
  }), e.menu.add(l, {
    id: "ugsci.capabilities",
    location: "primary.agentScoped",
    label: () => "工具",
    icon: r ? t.createElement(r, { style: { fontSize: 16 } }) : void 0,
    route: "ugsci.capabilities",
    order: 6,
    visible: () => Ne()
  }), e.route.add(l, {
    id: "ugsci.skills-center",
    path: "/ugsci-skills",
    component: Rn
  }), e.menu.add(l, {
    id: "ugsci.skills-center",
    location: "primary.agentScoped",
    label: () => "技能",
    icon: o ? t.createElement(o, { style: { fontSize: 16 } }) : void 0,
    route: "ugsci.skills-center",
    order: 7,
    visible: () => Ne()
  }), e.route.add(l, {
    id: "ugsci.market",
    path: "/ugsci-market",
    component: Hn
  }), e.menu.add(l, {
    id: "ugsci.market",
    location: "primary.agentScoped",
    label: () => "市场",
    icon: i ? t.createElement(i, { style: { fontSize: 16 } }) : void 0,
    route: "ugsci.market",
    order: 8,
    visible: () => Ne()
  }), (p = e.sidebar) != null && p.registerSimpleModeItems ? (e.sidebar.registerSimpleModeItems([
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
  for (const g of f) {
    try {
      const b = e.menu.snapshot("primary.agentScoped").find((h) => h.id === g);
      b && e.menu.replace(l, g, {
        ...b,
        visible: () => !Ne()
      });
    } catch {
    }
    try {
      const b = e.menu.snapshot("primary.settings").find((h) => h.id === g);
      b && e.menu.replace(l, g, {
        ...b,
        visible: () => !Ne()
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
    Wn();
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
