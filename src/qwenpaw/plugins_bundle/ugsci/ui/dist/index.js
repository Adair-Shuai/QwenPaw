function y() {
  var l;
  const e = (l = window.QwenPaw) == null ? void 0 : l.host;
  if (!e) throw new Error("[ugsci] QwenPaw.host not available");
  return e;
}
function Ze() {
  try {
    return y().getApiToken() || "";
  } catch {
    return "";
  }
}
function De(e) {
  return y().getApiUrl(e);
}
function Ne(e) {
  const l = Ze();
  return {
    "Content-Type": "application/json",
    ...l ? { Authorization: `Bearer ${l}` } : {},
    ...e
  };
}
async function ee(e, l) {
  const r = await fetch(De(e), {
    ...l,
    headers: { ...Ne(), ...(l == null ? void 0 : l.headers) || {} }
  });
  if (!r.ok) {
    const t = await r.text().catch(() => "");
    throw new Error(t || `HTTP ${r.status}`);
  }
  return r.status === 204 ? null : r.json();
}
async function Pe() {
  const e = await ee("/agents");
  return (e == null ? void 0 : e.agents) || [];
}
async function Ce(e) {
  return ee(`/agents/${encodeURIComponent(e)}`);
}
async function Fe(e) {
  return await ee("/skills", {
    headers: { "X-Agent-Id": e }
  }) || [];
}
async function We() {
  return await ee("/skills/pool") || [];
}
async function et() {
  return await ee("/skills/workspaces") || [];
}
async function Ue() {
  return await ee("/mcp") || [];
}
function tt(e) {
  if (!e || typeof e != "object") return [];
  const l = e, r = l.mcpServers || l;
  return !r || typeof r != "object" ? [] : Object.keys(r).filter((t) => t !== "mcpServers");
}
function ve() {
  try {
    return localStorage.getItem("qwenpaw_sidebar_mode") === "simple";
  } catch {
    return !1;
  }
}
function _e(e, l) {
  const r = y();
  return r.ReactMarkdown && r.remarkGfm ? l.createElement(
    r.ReactMarkdown,
    { remarkPlugins: [r.remarkGfm] },
    e
  ) : e.replace(/\*\*(.+?)\*\*/g, "$1").replace(/\*(.+?)\*/g, "$1").replace(/`(.+?)`/g, "$1").replace(/^#+\s*/gm, "").replace(/^[-*]\s+/gm, "• ");
}
const ke = [
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
], He = "ugsci_custom_teams";
function xe() {
  try {
    const e = localStorage.getItem(He);
    return e ? JSON.parse(e) : [];
  } catch {
    return [];
  }
}
function Ge(e) {
  try {
    localStorage.setItem(He, JSON.stringify(e));
  } catch {
  }
}
const nt = [
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
async function lt(e, l) {
  const r = {
    channel: "console",
    user_id: "default",
    session_id: `team-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    input: [
      {
        role: "user",
        content: [{ type: "text", text: l }]
      }
    ]
  };
  await fetch(De("/console/chat"), {
    method: "POST",
    headers: {
      ...Ne(),
      "X-Agent-Id": e
    },
    body: JSON.stringify(r)
  });
}
function we(e, l) {
  const r = e.find(
    (a) => a.name === l || a.name === l.replace(/\s+/g, "")
  );
  if (r) return r.id;
  const t = e.find(
    (a) => a.name.includes(l) || l.includes(a.name) || a.name.replace(/\s+/g, "").includes(l.replace(/\s+/g, ""))
  );
  return t ? t.id : null;
}
function at(e) {
  var r;
  const l = e.members.map((t) => `- ${t.emoji} ${t.name}（${t.role}）`).join(`
`);
  if (e.custom && e.steps && e.steps.length > 0) {
    const t = e.steps.map((n, i) => {
      const f = n.passContext ? "（传递上一步的结果作为上下文）" : "（独立执行，不传递上下文）";
      return `${i + 1}. 向「${n.agentName}」发送请求：${n.instruction} ${f}`;
    }).join(`
`);
    return `${e.mode === "pipeline" ? "请按顺序依次执行以下步骤，每步使用 chat_with_agent 咨询对应专家：" : e.mode === "roundtable" ? "请同时向以下专家分别发送独立请求（不传递上下文），收集所有结果后综合：" : `你是团队协调者（${e.coordinatorName || ((r = e.members[0]) == null ? void 0 : r.name) || ""}），请按需调用以下专家完成任务：`}

---

## 团队任务

${e.taskTemplate}

---

## 执行步骤

${t}

---

## 团队成员

${l}

---

请现在开始执行团队任务。首先使用 list_agents() 确认可用专家，然后按照上述步骤依次/同时咨询各成员。每步结果请明确标注来自哪位专家。`;
  }
  return `${e.orchestrationPrompt}

---

## 团队任务

${e.taskTemplate}

---

## 团队成员

${l}

---

请现在开始执行团队任务。首先使用 list_agents() 查看可用专家，然后按照上述流程依次咨询各成员。`;
}
function rt({ team: e }) {
  const l = y().React, { Typography: r, Tag: t } = y().antd, { Text: a } = r, n = {
    pipeline: "→",
    roundtable: "⇄",
    coordinator: "⊙"
  }, i = {
    pipeline: "#13c2c2",
    roundtable: "#722ed1",
    coordinator: "#1677ff"
  }, f = e.steps || [], T = f.length > 0;
  return l.createElement(
    "div",
    {
      style: {
        padding: "12px 16px",
        background: "#fafafa",
        borderRadius: 8,
        border: "1px dashed #d9d9d9"
      }
    },
    l.createElement(
      a,
      {
        type: "secondary",
        style: { fontSize: 12, display: "block", marginBottom: 8 }
      },
      `执行流程 (${e.mode === "pipeline" ? "流水线" : e.mode === "roundtable" ? "圆桌讨论" : "协调者模式"})`
    ),
    // Visual flow
    l.createElement(
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
      ...T ? f.map((S, g) => {
        const k = e.members.find(
          (E) => E.name === S.agentName
        );
        return [
          g > 0 && e.mode !== "roundtable" ? l.createElement(
            "div",
            {
              key: `arrow-${g}`,
              style: {
                textAlign: "center",
                color: i[e.mode],
                fontSize: 14
              }
            },
            n[e.mode]
          ) : null,
          l.createElement(
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
                border: `1px solid ${i[e.mode]}33`,
                fontSize: 12,
                flex: e.mode === "roundtable" ? "1 1 200px" : "initial"
              }
            },
            l.createElement(
              "span",
              { style: { fontSize: 16 } },
              (k == null ? void 0 : k.emoji) || "👤"
            ),
            l.createElement(
              "div",
              null,
              l.createElement(
                a,
                { strong: !0, style: { fontSize: 12 } },
                S.agentName
              ),
              l.createElement(
                "div",
                {
                  style: {
                    fontSize: 11,
                    color: "#8c8c8c",
                    maxWidth: 250
                  }
                },
                S.instruction
              ),
              S.passContext ? l.createElement(
                t,
                {
                  color: "blue",
                  style: { fontSize: 9, marginTop: 2 }
                },
                "传递上下文"
              ) : l.createElement(
                t,
                { style: { fontSize: 9, marginTop: 2 } },
                "独立"
              )
            )
          )
        ];
      }).flat() : e.members.map((S, g) => [
        g > 0 && e.mode !== "roundtable" ? l.createElement(
          "div",
          {
            key: `arrow-${g}`,
            style: {
              textAlign: "center",
              color: i[e.mode],
              fontSize: 14
            }
          },
          n[e.mode]
        ) : null,
        l.createElement(
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
              border: `1px solid ${i[e.mode]}33`,
              fontSize: 12,
              flex: e.mode === "roundtable" ? "1 1 150px" : "initial"
            }
          },
          l.createElement("span", { style: { fontSize: 16 } }, S.emoji),
          l.createElement(
            "div",
            null,
            l.createElement(
              a,
              { strong: !0, style: { fontSize: 12 } },
              S.name
            ),
            l.createElement(
              "div",
              { style: { fontSize: 11, color: "#8c8c8c" } },
              S.role
            )
          )
        )
      ]).flat()
    )
  );
}
function ot({
  open: e,
  onClose: l,
  agents: r,
  editingTeam: t,
  onSaved: a
}) {
  const n = y().React, { useState: i, useEffect: f, useCallback: T } = n, {
    Modal: S,
    Input: g,
    Button: k,
    Select: E,
    Tag: x,
    Typography: W,
    Switch: B,
    Empty: v,
    message: z,
    Divider: U,
    Steps: _
  } = y().antd, { PlusOutlined: N, DeleteOutlined: m, SaveOutlined: P, ArrowRightOutlined: $ } = y().antdIcons || {}, { Text: M, Paragraph: j } = W, [O, D] = i(""), [Y, c] = i("🤝"), [u, o] = i(""), [w, H] = i(
    "pipeline"
  ), [q, L] = i(""), [te, Q] = i(""), [s, G] = i([]), [R, F] = i([]), [A, I] = i(!1);
  f(() => {
    e && (t ? (D(t.name), c(t.emoji), o(t.description), H(t.mode), L(t.coordinatorName || ""), Q(t.taskTemplate), G(t.steps || []), F(t.members.map((d) => d.name))) : (D(""), c("🤝"), o(""), H("pipeline"), L(""), Q(`请执行以下任务：
任务描述：{任务描述}`), G([]), F([])));
  }, [e, t]);
  const K = T(() => {
    if (w === "roundtable") {
      const d = R.map((ne) => ({
        agentName: ne,
        instruction: "请给出你的专业评估意见",
        passContext: !1
      }));
      G(d);
    } else if (w === "pipeline") {
      const d = new Map(s.map((re) => [re.agentName, re])), ne = R.map((re) => d.get(re) || {
        agentName: re,
        instruction: "请完成你的专业部分",
        passContext: !0
      });
      G(ne);
    }
  }, [w, R, s]), Z = (d) => {
    R.includes(d) || (F([...R, d]), w === "coordinator" && !q && L(d));
  }, h = (d) => {
    F(R.filter((ne) => ne !== d)), G(s.filter((ne) => ne.agentName !== d)), q === d && L(R[0] || "");
  }, ae = (d, ne, re) => {
    const oe = [...s];
    oe[d] = { ...oe[d], [ne]: re }, G(oe);
  }, se = () => {
    if (!O.trim()) {
      z.warning("请输入团队名称");
      return;
    }
    if (R.length < 2) {
      z.warning("至少需要选择 2 个成员");
      return;
    }
    if (!te.trim()) {
      z.warning("请输入任务模板");
      return;
    }
    if (w === "coordinator" && !q) {
      z.warning("请选择协调者");
      return;
    }
    I(!0);
    try {
      const d = R.map(
        (V) => {
          var C;
          const X = r.find((J) => J.name === V);
          return {
            name: V,
            role: ((C = X == null ? void 0 : X.description) == null ? void 0 : C.slice(0, 30)) || "团队成员",
            emoji: "👤"
          };
        }
      );
      let ne = s;
      (s.length === 0 || s.length !== R.length) && (ne = R.map((V) => ({
        agentName: V,
        instruction: "请完成你的专业部分",
        passContext: w === "pipeline"
      })));
      const re = {
        id: (t == null ? void 0 : t.id) || `custom-${Date.now()}`,
        name: O.trim(),
        emoji: Y,
        category: "自定义",
        description: u.trim() || `${O.trim()}（${R.length}人团队）`,
        mode: w,
        members: d,
        coordinatorName: w === "coordinator" ? q : void 0,
        taskTemplate: te.trim(),
        orchestrationPrompt: "",
        // Custom teams use steps-based instructions
        steps: ne,
        custom: !0,
        createdAt: (t == null ? void 0 : t.createdAt) || Date.now()
      }, oe = xe(), b = oe.findIndex((V) => V.id === re.id);
      b >= 0 ? oe[b] = re : oe.push(re), Ge(oe), z.success(t ? "团队已更新" : "团队已创建"), a(), l();
    } catch (d) {
      z.error(d.message || "保存失败");
    } finally {
      I(!1);
    }
  }, ye = [
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
  ], fe = r.filter(
    (d) => !R.includes(d.name)
  );
  return n.createElement(
    S,
    {
      open: e,
      onCancel: l,
      title: n.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 8 } },
        n.createElement(
          "span",
          { style: { fontSize: 20 } },
          t ? "✏️" : "➕"
        ),
        n.createElement(
          "span",
          null,
          t ? "编辑专家团" : "创建专家团"
        )
      ),
      width: 720,
      onOk: se,
      okText: "保存团队",
      confirmLoading: A,
      okButtonProps: {
        icon: P ? n.createElement(P) : void 0
      }
    },
    // Step 1: Basic info
    n.createElement(
      "div",
      { style: { marginBottom: 16 } },
      n.createElement(
        M,
        {
          strong: !0,
          style: { display: "block", marginBottom: 8, fontSize: 13 }
        },
        "1. 基本信息"
      ),
      n.createElement(
        "div",
        { style: { display: "flex", gap: 8, marginBottom: 8 } },
        n.createElement(E, {
          value: Y,
          onChange: (d) => c(d),
          style: { width: 60 },
          options: ye.map((d) => ({ value: d, label: d })),
          optionRender: (d) => n.createElement("span", { style: { fontSize: 18 } }, d.value)
        }),
        n.createElement(g, {
          placeholder: "团队名称（如：储层评价团队）",
          value: O,
          onChange: (d) => D(d.target.value),
          style: { flex: 1 }
        })
      ),
      n.createElement(g.TextArea, {
        placeholder: "团队描述（简述团队的目标和适用场景）",
        value: u,
        onChange: (d) => o(d.target.value),
        rows: 2,
        style: { marginBottom: 8 }
      }),
      n.createElement(
        "div",
        { style: { display: "flex", gap: 8, alignItems: "center" } },
        n.createElement(
          M,
          { type: "secondary", style: { fontSize: 12 } },
          "协同模式："
        ),
        n.createElement(E, {
          value: w,
          onChange: (d) => H(d),
          style: { width: 160 },
          options: [
            { value: "pipeline", label: "🔄 流水线（依次执行）" },
            { value: "roundtable", label: "🔀 圆桌讨论（独立评估）" },
            { value: "coordinator", label: "🎯 协调者（由协调者主导）" }
          ]
        })
      )
    ),
    n.createElement(U, { style: { margin: "12px 0" } }),
    // Step 2: Select members
    n.createElement(
      "div",
      { style: { marginBottom: 16 } },
      n.createElement(
        M,
        {
          strong: !0,
          style: { display: "block", marginBottom: 8, fontSize: 13 }
        },
        "2. 选择团队成员"
      ),
      // Available agents
      fe.length > 0 ? n.createElement(
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
        ...fe.map(
          (d) => n.createElement(
            k,
            {
              key: d.id,
              size: "small",
              icon: N ? n.createElement(N) : void 0,
              onClick: () => Z(d.name)
            },
            d.name
          )
        )
      ) : null,
      // Selected members
      R.length === 0 ? n.createElement(v, {
        description: "请从上方添加团队成员",
        image: v.PRESENTED_IMAGE_SIMPLE
      }) : n.createElement(
        "div",
        { style: { display: "flex", flexDirection: "column", gap: 4 } },
        ...R.map(
          (d) => n.createElement(
            "div",
            {
              key: d,
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
            n.createElement(
              "div",
              { style: { display: "flex", alignItems: "center", gap: 6 } },
              n.createElement("span", null, "👤"),
              n.createElement(
                M,
                { strong: !0, style: { fontSize: 13 } },
                d
              ),
              w === "coordinator" && q === d ? n.createElement(
                x,
                { color: "blue", style: { fontSize: 10 } },
                "协调者"
              ) : null
            ),
            n.createElement(
              "div",
              { style: { display: "flex", gap: 4 } },
              w === "coordinator" ? n.createElement(
                k,
                {
                  size: "small",
                  type: "link",
                  onClick: () => L(d)
                },
                "设为协调者"
              ) : null,
              n.createElement(
                k,
                {
                  size: "small",
                  type: "link",
                  danger: !0,
                  icon: m ? n.createElement(m) : void 0,
                  onClick: () => h(d)
                },
                "移除"
              )
            )
          )
        )
      )
    ),
    n.createElement(U, { style: { margin: "12px 0" } }),
    // Step 3: Define execution steps (for pipeline/roundtable)
    R.length > 0 ? n.createElement(
      "div",
      { style: { marginBottom: 16 } },
      n.createElement(
        M,
        {
          strong: !0,
          style: { display: "block", marginBottom: 8, fontSize: 13 }
        },
        `3. 编排执行步骤${w === "roundtable" ? "（各步独立执行）" : w === "pipeline" ? "（依次执行，可传递上下文）" : "（由协调者决定调用顺序）"}`
      ),
      // Auto-sync button
      n.createElement(
        k,
        {
          size: "small",
          type: "dashed",
          onClick: K,
          style: { marginBottom: 8 }
        },
        "自动生成步骤"
      ),
      // Steps list
      s.length === 0 ? n.createElement(
        M,
        { type: "secondary", style: { fontSize: 12 } },
        "点击「自动生成步骤」或手动配置每步的指令"
      ) : n.createElement(
        "div",
        { style: { display: "flex", flexDirection: "column", gap: 6 } },
        ...s.map(
          (d, ne) => n.createElement(
            "div",
            {
              key: ne,
              style: {
                padding: 8,
                background: "#fff",
                borderRadius: 6,
                border: "1px solid #e8e8e8"
              }
            },
            n.createElement(
              "div",
              {
                style: {
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  marginBottom: 6
                }
              },
              w === "pipeline" ? n.createElement(
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
                `${ne + 1}`
              ) : n.createElement(
                "span",
                { style: { fontSize: 14 } },
                "🔀"
              ),
              n.createElement(
                x,
                { color: "blue", style: { fontSize: 11 } },
                d.agentName
              ),
              n.createElement(
                "div",
                { style: { flex: 1 } },
                n.createElement(g, {
                  placeholder: "请输入该步骤的指令...",
                  value: d.instruction,
                  onChange: (re) => ae(ne, "instruction", re.target.value),
                  size: "small"
                })
              )
            ),
            n.createElement(
              "div",
              {
                style: {
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  paddingLeft: 28
                }
              },
              n.createElement(B, {
                size: "small",
                checked: d.passContext,
                onChange: (re) => ae(ne, "passContext", re)
              }),
              n.createElement(
                M,
                { type: "secondary", style: { fontSize: 11 } },
                d.passContext ? "传递上一步结果作为上下文" : "独立执行"
              )
            )
          )
        )
      )
    ) : null,
    n.createElement(U, { style: { margin: "12px 0" } }),
    // Step 4: Task template
    n.createElement(
      "div",
      null,
      n.createElement(
        M,
        {
          strong: !0,
          style: { display: "block", marginBottom: 8, fontSize: 13 }
        },
        `${R.length > 0 ? "4" : "3"}. 任务模板`
      ),
      n.createElement(g.TextArea, {
        placeholder: `输入任务模板，可用 {参数名} 作为占位符...

例如：
请对区块 {区块名} 的井 {井号} 进行储层评价`,
        value: te,
        onChange: (d) => Q(d.target.value),
        rows: 4,
        style: { fontFamily: "monospace", fontSize: 13 }
      }),
      n.createElement(
        M,
        {
          type: "secondary",
          style: { fontSize: 11, display: "block", marginTop: 4 }
        },
        "占位符 {参数名} 在发起任务时可由用户填写替换"
      )
    )
  );
}
function Me({
  team: e,
  agents: l,
  onLaunch: r,
  onEdit: t,
  onDelete: a
}) {
  var u;
  const n = y().React, { useState: i } = n, { Card: f, Tag: T, Typography: S, Button: g, Tooltip: k } = y().antd, {
    TeamOutlined: E,
    RocketOutlined: x,
    UserOutlined: W,
    EditOutlined: B,
    DeleteOutlined: v,
    DownOutlined: z,
    UpOutlined: U
  } = y().antdIcons || {}, { Text: _, Paragraph: N } = S, [m, P] = i(!1), $ = {
    coordinator: { label: "协调者模式", color: "blue" },
    pipeline: { label: "流水线模式", color: "cyan" },
    roundtable: { label: "圆桌讨论", color: "purple" }
  }, M = $[e.mode] || $.coordinator, j = e.members.map((o) => {
    const w = we(l, o.name);
    return { ...o, found: !!w, agentId: w };
  }), O = j.filter((o) => o.found).length, D = O === e.members.length, Y = e.coordinatorName || ((u = e.members[0]) == null ? void 0 : u.name), c = Y ? we(l, Y) : null;
  return n.createElement(
    f,
    {
      hoverable: !0,
      size: "small",
      style: { height: "100%", display: "flex", flexDirection: "column" }
    },
    // Header: emoji + name + mode tag + custom badge
    n.createElement(
      "div",
      {
        style: {
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 10
        }
      },
      n.createElement("span", { style: { fontSize: 24 } }, e.emoji),
      n.createElement(
        "div",
        { style: { flex: 1 } },
        n.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 6 } },
          n.createElement(
            _,
            { strong: !0, style: { fontSize: 14 } },
            e.name
          ),
          e.custom ? n.createElement(
            T,
            { color: "gold", style: { fontSize: 9 } },
            "自定义"
          ) : null
        ),
        n.createElement(
          "div",
          { style: { display: "flex", gap: 4, marginTop: 4 } },
          n.createElement(
            T,
            { color: M.color, style: { fontSize: 10 } },
            M.label
          ),
          n.createElement(
            T,
            { style: { fontSize: 10 } },
            `${O}/${e.members.length}`
          ),
          D ? null : n.createElement(
            T,
            { color: "orange", style: { fontSize: 10 } },
            "缺少成员"
          )
        )
      ),
      // Edit/delete for custom teams
      e.custom ? n.createElement(
        "div",
        { style: { display: "flex", gap: 2 } },
        t ? n.createElement(
          k,
          { title: "编辑" },
          n.createElement(g, {
            type: "text",
            size: "small",
            icon: B ? n.createElement(B) : void 0,
            onClick: (o) => {
              o.stopPropagation(), t(e);
            }
          })
        ) : null,
        a ? n.createElement(
          k,
          { title: "删除" },
          n.createElement(g, {
            type: "text",
            size: "small",
            danger: !0,
            icon: v ? n.createElement(v) : void 0,
            onClick: (o) => {
              o.stopPropagation(), a(e);
            }
          })
        ) : null
      ) : null
    ),
    // Description
    n.createElement(
      N,
      {
        type: "secondary",
        style: { fontSize: 12, margin: 0, marginBottom: 10, lineHeight: 1.5 },
        ellipsis: { rows: 2 }
      },
      e.description
    ),
    // Member avatars
    n.createElement(
      "div",
      {
        style: {
          display: "flex",
          gap: 6,
          marginBottom: 10,
          flexWrap: "wrap"
        }
      },
      ...j.map(
        (o) => n.createElement(
          k,
          {
            key: o.name,
            title: `${o.name}（${o.role}）${o.found ? "" : " - 未创建"}`
          },
          n.createElement(
            "div",
            {
              style: {
                display: "flex",
                alignItems: "center",
                gap: 4,
                padding: "2px 8px",
                borderRadius: 12,
                background: o.found ? "#f0f5ff" : "#fff2f0",
                border: `1px solid ${o.found ? "#d6e4ff" : "#ffccc7"}`,
                fontSize: 11
              }
            },
            n.createElement("span", null, o.emoji),
            n.createElement(
              _,
              {
                style: { fontSize: 11, color: o.found ? "#1f4e8c" : "#cf1322" }
              },
              o.name
            )
          )
        )
      )
    ),
    // Toggle flow diagram
    n.createElement(
      g,
      {
        type: "link",
        size: "small",
        style: { padding: "0 0 4px 0", fontSize: 11, height: "auto" },
        onClick: (o) => {
          o.stopPropagation(), P(!m);
        },
        icon: m ? U ? n.createElement(U) : "▲" : z ? n.createElement(z) : "▼"
      },
      m ? "收起流程" : "查看执行流程"
    ),
    m ? n.createElement(rt, { team: e }) : null,
    // Footer: launch button
    n.createElement(
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
      n.createElement(
        _,
        { type: "secondary", style: { fontSize: 11 } },
        Y ? `协调者: ${Y}` : ""
      ),
      n.createElement(
        g,
        {
          type: "primary",
          size: "small",
          icon: x ? n.createElement(x) : void 0,
          disabled: !c,
          onClick: () => r(e)
        },
        "发起团队任务"
      )
    )
  );
}
function st({
  agents: e,
  onLaunch: l
}) {
  const r = y().React, { useMemo: t, useState: a, useCallback: n, useEffect: i } = r, {
    Row: f,
    Col: T,
    Input: S,
    Empty: g,
    Typography: k,
    Tag: E,
    Button: x,
    Divider: W,
    message: B,
    Popconfirm: v
  } = y().antd, { SearchOutlined: z, TeamOutlined: U, PlusOutlined: _, RocketOutlined: N } = y().antdIcons || {}, { Text: m } = k, [P, $] = a(""), [M, j] = a([]), [O, D] = a(!1), [Y, c] = a(null);
  i(() => {
    j(xe());
  }, []);
  const u = n(() => {
    j(xe());
  }, []), o = n(
    (s) => {
      const R = xe().filter((F) => F.id !== s.id);
      Ge(R), j(R), B.success(`团队「${s.name}」已删除`);
    },
    [B]
  ), w = n((s) => {
    c(s), D(!0);
  }, []), H = n(() => {
    c(null), D(!0);
  }, []), q = t(() => [...M, ...nt], [M]), L = t(() => {
    if (!P.trim()) return q;
    const s = P.toLowerCase();
    return q.filter(
      (G) => G.name.toLowerCase().includes(s) || G.description.toLowerCase().includes(s) || G.category.toLowerCase().includes(s)
    );
  }, [q, P]), te = L.filter((s) => s.custom), Q = L.filter((s) => !s.custom);
  return r.createElement(
    "div",
    null,
    // Info banner
    r.createElement(
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
      r.createElement(
        m,
        { style: { fontSize: 13, color: "#389e0d" } },
        "多智能体协同 — 选择预设团队或创建自定义团队，支持流水线、圆桌讨论、协调者三种编排模式。"
      ),
      r.createElement(
        x,
        {
          type: "primary",
          size: "small",
          icon: _ ? r.createElement(_) : void 0,
          onClick: H
        },
        "创建专家团"
      )
    ),
    // Search
    r.createElement(S, {
      placeholder: "搜索团队名称、描述或类别...",
      prefix: z ? r.createElement(z) : void 0,
      value: P,
      onChange: (s) => $(s.target.value),
      allowClear: !0,
      style: { marginBottom: 16, maxWidth: 400 }
    }),
    // Custom teams section
    te.length > 0 ? r.createElement(
      "div",
      { style: { marginBottom: 20 } },
      r.createElement(
        "div",
        {
          style: {
            display: "flex",
            alignItems: "center",
            gap: 6,
            marginBottom: 10
          }
        },
        r.createElement("span", { style: { fontSize: 16 } }, "⭐"),
        r.createElement(
          m,
          { strong: !0, style: { fontSize: 14 } },
          `自定义团队 (${te.length})`
        )
      ),
      r.createElement(
        f,
        { gutter: [12, 12] },
        ...te.map(
          (s) => r.createElement(
            T,
            { key: s.id, xs: 24, sm: 12, md: 8 },
            r.createElement(Me, {
              team: s,
              agents: e,
              onLaunch: l,
              onEdit: w,
              onDelete: o
            })
          )
        )
      ),
      r.createElement(W, { style: { margin: "16px 0" } })
    ) : null,
    // Preset teams section
    Q.length > 0 ? r.createElement(
      "div",
      null,
      r.createElement(
        "div",
        {
          style: {
            display: "flex",
            alignItems: "center",
            gap: 6,
            marginBottom: 10
          }
        },
        r.createElement("span", { style: { fontSize: 16 } }, "📋"),
        r.createElement(
          m,
          { strong: !0, style: { fontSize: 14 } },
          `预设团队 (${Q.length})`
        ),
        r.createElement(
          m,
          { type: "secondary", style: { fontSize: 12 } },
          "· 行业典型工作流模板"
        )
      ),
      r.createElement(
        f,
        { gutter: [12, 12] },
        ...Q.map(
          (s) => r.createElement(
            T,
            { key: s.id, xs: 24, sm: 12, md: 8 },
            r.createElement(Me, {
              team: s,
              agents: e,
              onLaunch: l
            })
          )
        )
      )
    ) : null,
    // Empty state
    L.length === 0 ? r.createElement(g, {
      description: "未找到匹配的专家团队，点击「创建专家团」自定义",
      image: g.PRESENTED_IMAGE_SIMPLE
    }) : null,
    // Team Builder Modal
    r.createElement(ot, {
      open: O,
      onClose: () => {
        D(!1), c(null);
      },
      agents: e,
      editingTeam: Y,
      onSaved: u
    })
  );
}
function it(e) {
  var r;
  const l = [];
  for (const t of e) {
    if (t.enabled === !1) continue;
    const a = (r = t.description) == null ? void 0 : r.trim();
    if (!a) continue;
    let n = a;
    if (n = n.replace(/\*\*(.+?)\*\*/g, "$1").replace(/\*(.+?)\*/g, "$1").replace(/`(.+?)`/g, "$1").replace(/^#+\s*/gm, "").trim(), /^(用于|帮助|提供|支持|实现|完成|分析|计算|生成|创建|检查)/.test(n) ? n = `请${n}` : /^(a |an |the )/i.test(n) ? n = `Help me with ${n}` : /[。？！.?!]$/.test(n) || (n = `帮我${n}`), n.length > 80 && (n = n.substring(0, 77) + "..."), l.push(n), l.length >= 4) break;
  }
  return l;
}
async function ct(e) {
  return await ee("/workspace/files", {
    headers: { "X-Agent-Id": e }
  }) || [];
}
async function Oe(e, l, r) {
  await ee(`/workspace/files/${encodeURIComponent(l)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify({ content: r })
  });
}
async function Ae(e, l) {
  const r = await Ce(e);
  r.system_prompt_files = l, await ee(`/agents/${encodeURIComponent(e)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(r)
  });
}
async function mt(e, l) {
  await ee("/skills/pool/download", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      skill_name: l,
      targets: [{ workspace_id: e }],
      overwrite: !1
    })
  });
}
async function dt(e, l) {
  await ee(`/skills/${encodeURIComponent(l)}`, {
    method: "DELETE",
    headers: { "X-Agent-Id": e }
  });
}
async function pt(e, l) {
  await ee(`/mcp/${encodeURIComponent(l)}`, {
    method: "DELETE",
    headers: { "X-Agent-Id": e }
  });
}
const Le = ["AGENTS.md", "SOUL.md", "PROFILE.md"];
function Te({
  title: e,
  subtitle: l,
  extra: r
}) {
  const t = y().React, { Space: a } = y().antd;
  return t.createElement(
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
    t.createElement(
      "div",
      null,
      t.createElement(
        "h2",
        { style: { margin: 0, fontSize: 20, fontWeight: 600 } },
        e
      ),
      l ? t.createElement(
        "div",
        { style: { marginTop: 4, fontSize: 13, color: "#8c8c8c" } },
        l
      ) : null
    ),
    r ? t.createElement(a, null, r) : null
  );
}
function Be({
  items: e,
  max: l = 5,
  color: r = "blue",
  emptyText: t = "无"
}) {
  const a = y().React, { Tag: n } = y().antd;
  return !e || e.length === 0 ? a.createElement(
    "span",
    { style: { fontSize: 12, color: "#bfbfbf" } },
    t
  ) : a.createElement(
    "div",
    { style: { display: "flex", flexWrap: "wrap", gap: 4 } },
    ...e.slice(0, l).map(
      (i, f) => a.createElement(
        n,
        { key: f, color: r, style: { fontSize: 11, marginRight: 0 } },
        i
      )
    ),
    e.length > l ? a.createElement(
      n,
      { style: { fontSize: 11, marginRight: 0 } },
      `+${e.length - l}`
    ) : null
  );
}
function ut({
  open: e,
  onClose: l,
  poolSkills: r,
  installedSkillNames: t,
  loading: a,
  onInstall: n
}) {
  const i = y().React, { useState: f, useEffect: T, useMemo: S } = i, { Modal: g, Button: k, Empty: E, Spin: x, Input: W, Tag: B, Tooltip: v, Typography: z } = y().antd, { CheckOutlined: U, SearchOutlined: _ } = y().antdIcons || {}, { Text: N } = z, [m, P] = f([]), [$, M] = f("");
  T(() => {
    e && (P([]), M(""));
  }, [e]);
  const j = S(() => {
    if (!$.trim()) return r;
    const c = $.toLowerCase();
    return r.filter(
      (u) => {
        var o, w;
        return u.name.toLowerCase().includes(c) || ((o = u.description) == null ? void 0 : o.toLowerCase().includes(c)) || ((w = u.tags) == null ? void 0 : w.some((H) => H.toLowerCase().includes(c)));
      }
    );
  }, [r, $]), O = j.filter(
    (c) => !t.includes(c.name)
  ), D = (c) => {
    P(
      (u) => u.includes(c) ? u.filter((o) => o !== c) : [...u, c]
    );
  }, Y = async () => {
    m.length !== 0 && (await n(m), P([]));
  };
  return i.createElement(
    g,
    {
      open: e,
      onCancel: l,
      title: "从技能池选择技能",
      width: 680,
      footer: i.createElement(
        "div",
        {
          style: {
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }
        },
        i.createElement(
          N,
          { type: "secondary", style: { fontSize: 13 } },
          `已选择 ${m.length} 个技能`
        ),
        i.createElement(
          "div",
          { style: { display: "flex", gap: 8 } },
          i.createElement(k, { onClick: l }, "取消"),
          i.createElement(
            k,
            {
              type: "primary",
              onClick: Y,
              disabled: m.length === 0
            },
            m.length > 0 ? `添加 (${m.length})` : "添加"
          )
        )
      )
    },
    // Search + bulk actions bar
    i.createElement(
      "div",
      {
        style: {
          marginBottom: 12,
          display: "flex",
          gap: 8,
          alignItems: "center"
        }
      },
      i.createElement(W, {
        placeholder: "搜索技能名称、描述或标签...",
        prefix: _ ? i.createElement(_) : void 0,
        value: $,
        onChange: (c) => M(c.target.value),
        allowClear: !0,
        style: { flex: 1 }
      }),
      i.createElement(
        k,
        {
          size: "small",
          type: "primary",
          onClick: () => P(O.map((c) => c.name))
        },
        "全选"
      ),
      i.createElement(
        k,
        {
          size: "small",
          onClick: () => P([])
        },
        "清空"
      )
    ),
    // Skill grid (card style matching Skill Center)
    a ? i.createElement(
      "div",
      { style: { textAlign: "center", padding: 40 } },
      i.createElement(x, { size: "large" })
    ) : j.length === 0 ? i.createElement(E, {
      description: $ ? "未找到匹配的技能" : "技能池暂无可用技能",
      image: E.PRESENTED_IMAGE_SIMPLE
    }) : i.createElement(
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
      ...j.map((c) => {
        const u = m.includes(c.name), o = t.includes(c.name);
        return i.createElement(
          "div",
          {
            key: c.name,
            onClick: () => !o && D(c.name),
            style: {
              position: "relative",
              padding: "10px 12px",
              border: `1px solid ${u ? "#0072f5" : "#e8e8e8"}`,
              borderRadius: 6,
              cursor: o ? "not-allowed" : "pointer",
              transition: "all 0.15s ease",
              background: u ? "rgba(0, 114, 245, 0.06)" : o ? "#fafafa" : "#fff",
              opacity: o ? 0.5 : 1,
              minHeight: 64
            }
          },
          u ? i.createElement(
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
            U ? i.createElement(U) : "✓"
          ) : null,
          o ? i.createElement(
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
          i.createElement(
            "div",
            {
              style: {
                display: "flex",
                alignItems: "center",
                gap: 6,
                marginBottom: 4,
                paddingRight: o || u ? 24 : 0
              }
            },
            i.createElement(
              "span",
              { style: { fontSize: 16 } },
              c.emoji || "⚡"
            ),
            i.createElement(
              v,
              { title: c.name },
              i.createElement(
                N,
                {
                  strong: !0,
                  style: {
                    fontSize: 13,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap"
                  }
                },
                c.name
              )
            )
          ),
          c.description ? i.createElement(
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
            c.description
          ) : null,
          c.tags && c.tags.length > 0 ? i.createElement(
            "div",
            {
              style: {
                marginTop: 4,
                display: "flex",
                gap: 2,
                flexWrap: "wrap"
              }
            },
            ...c.tags.slice(0, 2).map(
              (w, H) => i.createElement(
                B,
                {
                  key: H,
                  color: "cyan",
                  style: { fontSize: 10, marginRight: 0 }
                },
                w
              )
            )
          ) : null
        );
      })
    )
  );
}
function gt({
  expert: e,
  onClick: l,
  onSummon: r
}) {
  const t = y().React, { Card: a, Tag: n, Badge: i, Typography: f, Spin: T, Button: S } = y().antd, { Text: g } = f, { ThunderboltOutlined: k } = y().antdIcons || {}, { agent: E, skills: x, mcps: W, loading: B } = e, v = E.enabled, z = x.filter((N) => N.enabled !== !1).map((N) => N.name), U = W.map((N) => N.name || N.key), _ = E.active_model ? `${E.active_model.provider_id}/${E.active_model.model}` : null;
  return t.createElement(
    a,
    {
      hoverable: !0,
      onClick: l,
      size: "small",
      style: {
        cursor: "pointer",
        transition: "all 0.2s ease",
        borderColor: v ? void 0 : "#d9d9d9",
        opacity: v ? 1 : 0.7,
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
    t.createElement(
      "div",
      {
        style: {
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 8
        }
      },
      t.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 8 } },
        t.createElement("span", { style: { fontSize: 20 } }, "🧑‍🔬"),
        t.createElement(
          "div",
          null,
          t.createElement(
            g,
            { strong: !0, style: { fontSize: 15 } },
            E.name
          ),
          t.createElement(
            "div",
            {
              style: {
                fontSize: 11,
                color: "#bfbfbf",
                fontFamily: "monospace"
              }
            },
            E.id
          )
        )
      ),
      t.createElement(i, {
        status: v ? "success" : "default",
        text: v ? "启用" : "停用"
      })
    ),
    // Description (rendered as markdown)
    E.description ? t.createElement(
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
      _e(E.description, t)
    ) : t.createElement(
      "div",
      { style: { fontSize: 12, color: "#bfbfbf", marginBottom: 10, minHeight: 54, flex: "1 0 auto" } },
      "暂无描述"
    ),
    // Model info
    _ ? t.createElement(
      "div",
      { style: { marginBottom: 8 } },
      t.createElement(
        n,
        { color: "geekblue", style: { fontSize: 11 } },
        `🤖 ${_}`
      )
    ) : null,
    // Skills
    B ? t.createElement(T, { size: "small" }) : t.createElement(
      "div",
      { style: { marginBottom: 6 } },
      t.createElement(
        "div",
        { style: { fontSize: 11, color: "#8c8c8c", marginBottom: 4 } },
        `技能 (${z.length})`
      ),
      t.createElement(Be, {
        items: z,
        max: 4,
        color: "cyan",
        emptyText: "未配置技能"
      })
    ),
    // MCP
    !B && U.length > 0 ? t.createElement(
      "div",
      { style: { marginTop: "auto" } },
      t.createElement(
        "div",
        { style: { fontSize: 11, color: "#8c8c8c", marginBottom: 4 } },
        `MCP (${U.length})`
      ),
      t.createElement(Be, {
        items: U,
        max: 3,
        color: "purple"
      })
    ) : null,
    // Summon button (bottom-right)
    t.createElement(
      "div",
      {
        style: {
          display: "flex",
          justifyContent: "flex-end",
          marginTop: 10,
          paddingTop: 8,
          borderTop: "1px solid #f0f0f0"
        }
      },
      t.createElement(
        S,
        {
          type: "primary",
          size: "small",
          icon: k ? t.createElement(k) : void 0,
          disabled: !v,
          onClick: (N) => {
            N.stopPropagation(), r && r();
          }
        },
        "召唤专家"
      )
    )
  );
}
function yt({
  expert: e,
  open: l,
  onClose: r,
  onRefresh: t
}) {
  const a = y().React, {
    Drawer: n,
    Descriptions: i,
    Tag: f,
    Typography: T,
    Space: S,
    Button: g,
    Empty: k,
    Tabs: E,
    List: x,
    Spin: W,
    Modal: B,
    message: v
  } = y().antd, { Text: z, Paragraph: U } = T, {
    EditOutlined: _,
    ThunderboltOutlined: N,
    FileTextOutlined: m,
    ToolOutlined: P,
    PlusOutlined: $
  } = y().antdIcons || {}, [M, j] = a.useState(!1), [O, D] = a.useState(
    []
  ), [Y, c] = a.useState(!1);
  if (!e) return null;
  const { agent: u, config: o, skills: w, mcps: H, loading: q } = e, L = w.filter((h) => h.enabled !== !1), te = (h) => {
    window.history.pushState({}, "", h), window.dispatchEvent(new PopStateEvent("popstate"));
  }, Q = a.createElement(
    "div",
    null,
    a.createElement(
      i,
      { column: 1, bordered: !0, size: "small" },
      a.createElement(i.Item, { label: "专家名称" }, u.name),
      a.createElement(
        i.Item,
        { label: "专家 ID" },
        a.createElement("code", { style: { fontSize: 12 } }, u.id)
      ),
      a.createElement(
        i.Item,
        { label: "状态" },
        a.createElement(
          f,
          { color: u.enabled ? "green" : "default" },
          u.enabled ? "启用" : "停用"
        )
      ),
      a.createElement(
        i.Item,
        { label: "功能简介" },
        u.description ? _e(u.description, a) : "暂无描述"
      ),
      a.createElement(
        i.Item,
        { label: "使用模型" },
        u.active_model ? `${u.active_model.provider_id} / ${u.active_model.model}` : "使用全局默认模型"
      ),
      o != null && o.workspace_dir ? a.createElement(
        i.Item,
        { label: "工作区路径" },
        a.createElement(
          "code",
          { style: { fontSize: 11 } },
          o.workspace_dir
        )
      ) : null,
      o != null && o.approval_level ? a.createElement(
        i.Item,
        { label: "审批级别" },
        o.approval_level
      ) : null
    ),
    // System prompt files
    o != null && o.system_prompt_files && o.system_prompt_files.length > 0 ? a.createElement(
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
        m ? a.createElement(m, {
          style: { fontSize: 14, color: "#1677ff" }
        }) : null,
        a.createElement(z, { strong: !0 }, "系统提示词文件")
      ),
      a.createElement(
        S,
        { wrap: !0 },
        ...o.system_prompt_files.map(
          (h, ae) => a.createElement(
            f,
            {
              key: ae,
              icon: m ? a.createElement(m) : void 0,
              style: { fontSize: 12 }
            },
            h
          )
        )
      )
    ) : null
  ), s = async () => {
    j(!0), c(!0);
    try {
      const h = await We();
      D(h);
    } catch (h) {
      v.error(h.message || "加载技能池失败");
    } finally {
      c(!1);
    }
  }, G = async (h) => {
    let ae = 0, se = 0;
    for (const ye of h)
      try {
        await mt(u.id, ye), ae++;
      } catch {
        se++;
      }
    ae > 0 ? (v.success(
      `成功添加 ${ae} 个技能${se > 0 ? `，${se} 个失败` : ""}`
    ), t()) : se > 0 && v.error("添加技能失败"), j(!1);
  }, R = async (h) => {
    try {
      await dt(u.id, h), v.success(`技能「${h}」已移除`), t();
    } catch (ae) {
      v.error(ae.message || "移除技能失败");
    }
  }, F = async (h) => {
    try {
      await pt(u.id, h), v.success(`MCP「${h}」已移除`), t();
    } catch (ae) {
      v.error(ae.message || "移除 MCP 失败");
    }
  }, A = q ? a.createElement(
    "div",
    { style: { textAlign: "center", padding: 40 } },
    a.createElement(W, { size: "large" })
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
        z,
        { strong: !0 },
        `已启用技能 (${L.length})`
      ),
      a.createElement(
        g,
        {
          type: "primary",
          size: "small",
          icon: $ ? a.createElement($) : void 0,
          onClick: s
        },
        "从技能池添加"
      )
    ),
    L.length === 0 ? a.createElement(k, {
      description: "该专家暂无已启用的技能",
      image: k.PRESENTED_IMAGE_SIMPLE
    }) : a.createElement(x, {
      dataSource: L,
      renderItem: (h) => a.createElement(
        x.Item,
        {
          actions: [
            a.createElement(
              g,
              {
                type: "link",
                size: "small",
                danger: !0,
                onClick: () => R(h.name)
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
            h.emoji ? a.createElement(
              "span",
              { style: { fontSize: 16 } },
              h.emoji
            ) : null,
            a.createElement(z, { strong: !0 }, h.name),
            h.version_text ? a.createElement(
              f,
              { style: { fontSize: 10 } },
              `v${h.version_text}`
            ) : null
          ),
          h.description ? a.createElement(
            U,
            {
              type: "secondary",
              style: { fontSize: 12, margin: 0 },
              ellipsis: { rows: 2 }
            },
            h.description
          ) : null,
          h.tags && h.tags.length > 0 ? a.createElement(
            "div",
            { style: { marginTop: 4 } },
            ...h.tags.map(
              (ae, se) => a.createElement(
                f,
                {
                  key: se,
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
    a.createElement(ut, {
      open: M,
      onClose: () => j(!1),
      poolSkills: O,
      installedSkillNames: L.map((h) => h.name),
      loading: Y,
      onInstall: G
    })
  ), I = q ? a.createElement(
    "div",
    { style: { textAlign: "center", padding: 40 } },
    a.createElement(W, { size: "large" })
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
        z,
        { strong: !0 },
        `MCP 客户端 (${H.length})`
      ),
      a.createElement(
        g,
        {
          type: "primary",
          size: "small",
          icon: $ ? a.createElement($) : void 0,
          onClick: () => {
            window.history.pushState({}, "", `/agents/${u.id}/mcp`), window.dispatchEvent(new PopStateEvent("popstate"));
          }
        },
        "配置 MCP"
      )
    ),
    H.length === 0 ? a.createElement(k, {
      description: "该专家暂无关联的 MCP 客户端，点击「配置 MCP」添加",
      image: k.PRESENTED_IMAGE_SIMPLE
    }) : a.createElement(x, {
      dataSource: H,
      renderItem: (h) => a.createElement(
        x.Item,
        {
          actions: [
            a.createElement(
              g,
              {
                type: "link",
                size: "small",
                danger: !0,
                onClick: () => F(h.key)
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
              z,
              { strong: !0 },
              h.name || h.key
            ),
            a.createElement(
              f,
              {
                color: h.enabled ? "green" : "default",
                style: { fontSize: 10 }
              },
              h.enabled ? "启用" : "停用"
            ),
            a.createElement(
              f,
              { color: "purple", style: { fontSize: 10 } },
              h.transport
            )
          ),
          h.description ? a.createElement(
            U,
            {
              type: "secondary",
              style: { fontSize: 12, margin: 0 },
              ellipsis: { rows: 2 }
            },
            h.description
          ) : null,
          h.tools && h.tools.length > 0 ? a.createElement(
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
  ), K = o != null && o.tools ? a.createElement(
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
        P ? a.createElement(P, {
          style: { fontSize: 14, color: "#1677ff" }
        }) : null,
        a.createElement(z, { strong: !0 }, "工具配置")
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
        JSON.stringify(o.tools, null, 2)
      )
    )
  ) : a.createElement(k, {
    description: "暂无工具配置",
    image: k.PRESENTED_IMAGE_SIMPLE
  }), Z = [
    { key: "basic", label: "基本信息", children: Q },
    {
      key: "skills",
      label: `技能 (${L.length})`,
      children: A
    },
    {
      key: "prompts",
      label: "推荐提问",
      children: a.createElement(ht, {
        skills: L,
        agentId: u.id
      })
    },
    {
      key: "knowledge",
      label: "专家记忆",
      children: a.createElement(Et, {
        agentId: u.id,
        systemPromptFiles: (o == null ? void 0 : o.system_prompt_files) || [],
        onRefresh: () => t()
      })
    },
    { key: "mcp", label: `MCP (${H.length})`, children: I },
    { key: "tools", label: "工具配置", children: K }
  ];
  return a.createElement(
    n,
    {
      title: a.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 8 } },
        a.createElement("span", { style: { fontSize: 20 } }, "🧑‍🔬"),
        a.createElement("span", null, u.name)
      ),
      open: l,
      onClose: r,
      width: 560,
      extra: a.createElement(
        S,
        null,
        a.createElement(
          g,
          {
            size: "small",
            icon: _ ? a.createElement(_) : void 0,
            onClick: () => te("/agents")
          },
          "编辑专家"
        ),
        a.createElement(
          g,
          {
            type: "primary",
            size: "small",
            icon: N ? a.createElement(N) : void 0,
            onClick: () => {
              try {
                const h = y();
                h.setSelectedAgent && h.setSelectedAgent(u.id);
              } catch (h) {
                console.warn("[ugsci] Failed to set selected agent:", h);
              }
              te("/chat");
            }
          },
          "开始对话"
        )
      )
    },
    a.createElement(E, {
      items: Z,
      defaultActiveKey: "basic"
    })
  );
}
function ft({
  open: e,
  onClose: l,
  onCreated: r
}) {
  const t = y().React, { useState: a } = t, {
    Modal: n,
    Card: i,
    Tag: f,
    Input: T,
    Row: S,
    Col: g,
    Spin: k,
    message: E,
    Typography: x
  } = y().antd, { Text: W } = x, [B, v] = a(!1), [z, U] = a(""), _ = ke.filter((m) => {
    if (!z.trim()) return !0;
    const P = z.toLowerCase();
    return m.name.toLowerCase().includes(P) || m.description.toLowerCase().includes(P) || m.category.toLowerCase().includes(P);
  }), N = async (m) => {
    v(!0);
    try {
      const P = await ee("/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: m.name,
          description: m.description,
          skill_names: m.recommendedSkills
        })
      });
      await Oe(P.id, "AGENTS.md", m.systemPrompt);
      const $ = await Ce(P.id);
      $.approval_level = m.approvalLevel, await ee(`/agents/${encodeURIComponent(P.id)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify($)
      }), E.success(`专家「${m.name}」创建成功`), l(), r();
    } catch (P) {
      E.error(P.message || "创建专家失败");
    } finally {
      v(!1);
    }
  };
  return t.createElement(
    n,
    {
      open: e,
      onCancel: l,
      footer: null,
      title: "选择专家模板",
      width: 800
    },
    t.createElement(
      "div",
      { style: { marginBottom: 16 } },
      t.createElement(T, {
        placeholder: "搜索模板名称或类别...",
        value: z,
        onChange: (m) => U(m.target.value),
        allowClear: !0
      })
    ),
    B ? t.createElement(
      "div",
      { style: { textAlign: "center", padding: 60 } },
      t.createElement(k, { size: "large" }),
      t.createElement(
        "div",
        { style: { marginTop: 12, color: "#8c8c8c" } },
        "正在创建专家..."
      )
    ) : t.createElement(
      S,
      { gutter: [12, 12] },
      ..._.map(
        (m) => t.createElement(
          g,
          { key: m.id, xs: 24, sm: 12 },
          t.createElement(
            i,
            {
              hoverable: !0,
              size: "small",
              onClick: () => N(m),
              style: { cursor: "pointer", height: "100%" }
            },
            t.createElement(
              "div",
              {
                style: {
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 10,
                  marginBottom: 8
                }
              },
              t.createElement(
                "span",
                { style: { fontSize: 28 } },
                m.emoji
              ),
              t.createElement(
                "div",
                { style: { flex: 1 } },
                t.createElement(
                  W,
                  { strong: !0, style: { fontSize: 15 } },
                  m.name
                ),
                t.createElement(
                  "div",
                  null,
                  t.createElement(
                    f,
                    { color: "blue", style: { fontSize: 10 } },
                    m.category
                  ),
                  m.approvalLevel === "MANUAL" ? t.createElement(
                    f,
                    { color: "orange", style: { fontSize: 10 } },
                    "需审批"
                  ) : null
                )
              )
            ),
            t.createElement(
              "div",
              {
                style: {
                  fontSize: 12,
                  color: "#595959",
                  lineHeight: 1.5
                }
              },
              _e(m.description, t)
            )
          )
        )
      )
    )
  );
}
function Et({
  agentId: e,
  systemPromptFiles: l,
  onRefresh: r
}) {
  const t = y().React, { useState: a, useEffect: n, useCallback: i } = t, {
    List: f,
    Tag: T,
    Switch: S,
    Button: g,
    Modal: k,
    Input: E,
    Spin: x,
    Empty: W,
    message: B,
    Typography: v
  } = y().antd, { FileTextOutlined: z, PlusOutlined: U, EditOutlined: _, ReloadOutlined: N } = y().antdIcons || {}, { Text: m } = v, [P, $] = a([]), [M, j] = a(!0), [O, D] = a(
    l || []
  ), [Y, c] = a(!1), [u, o] = a(null), [w, H] = a(""), [q, L] = a(""), [te, Q] = a(!1), s = i(async () => {
    j(!0);
    try {
      const I = await ct(e);
      $(I);
    } catch (I) {
      B.error(I.message || "加载记忆文件失败"), $([]);
    } finally {
      j(!1);
    }
  }, [e]);
  n(() => {
    s();
  }, [s]), n(() => {
    D(l || []);
  }, [l]);
  const G = async (I, K) => {
    const Z = new Set(O);
    if (K)
      Z.add(I);
    else {
      if (Le.includes(I) && I === "AGENTS.md") {
        B.warning("AGENTS.md 是核心文件，不能停用");
        return;
      }
      Z.delete(I);
    }
    const h = Array.from(Z);
    D(h);
    try {
      await Ae(e, h), B.success(K ? "已启用记忆文件" : "已停用记忆文件"), r();
    } catch (ae) {
      B.error(ae.message || "更新失败"), D(l || []);
    }
  }, R = async (I) => {
    try {
      const K = await ee(
        `/workspace/files/${encodeURIComponent(I)}`,
        { headers: { "X-Agent-Id": e } }
      );
      o(I), H(K.content || ""), c(!0);
    } catch (K) {
      B.error(K.message || "读取文件失败");
    }
  }, F = () => {
    o(null), H(""), L(""), c(!0);
  }, A = async () => {
    const I = u || q.trim();
    if (!I) {
      B.warning("请输入文件名");
      return;
    }
    const K = I.endsWith(".md") ? I : `${I}.md`;
    Q(!0);
    try {
      if (await Oe(e, K, w), !u && !O.includes(K)) {
        const Z = [...O, K];
        D(Z), await Ae(e, Z);
      }
      B.success("保存成功"), c(!1), s(), r();
    } catch (Z) {
      B.error(Z.message || "保存失败");
    } finally {
      Q(!1);
    }
  };
  return M ? t.createElement(
    "div",
    { style: { textAlign: "center", padding: 40 } },
    t.createElement(x, { size: "large" })
  ) : t.createElement(
    "div",
    null,
    t.createElement(
      "div",
      {
        style: {
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 12
        }
      },
      t.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        z ? t.createElement(z, {
          style: { fontSize: 14, color: "#1677ff" }
        }) : null,
        t.createElement(
          m,
          { strong: !0 },
          `记忆文件 (${P.length})`
        ),
        t.createElement(
          m,
          { type: "secondary", style: { fontSize: 12 } },
          `· 已挂载 ${O.length} 个到专家记忆`
        )
      ),
      t.createElement(
        "div",
        { style: { display: "flex", gap: 8 } },
        t.createElement(
          g,
          {
            size: "small",
            icon: N ? t.createElement(N) : void 0,
            onClick: s
          },
          "刷新"
        ),
        t.createElement(
          g,
          {
            type: "primary",
            size: "small",
            icon: U ? t.createElement(U) : void 0,
            onClick: F
          },
          "新建记忆文件"
        )
      )
    ),
    P.length === 0 ? t.createElement(W, {
      description: "暂无记忆文件，点击「新建记忆文件」添加",
      image: W.PRESENTED_IMAGE_SIMPLE
    }) : t.createElement(f, {
      dataSource: P,
      renderItem: (I) => {
        const K = O.includes(I.filename), Z = Le.includes(I.filename);
        return t.createElement(
          f.Item,
          {
            actions: [
              t.createElement(
                g,
                {
                  type: "link",
                  size: "small",
                  icon: _ ? t.createElement(_) : void 0,
                  onClick: () => R(I.filename)
                },
                "编辑"
              )
            ]
          },
          t.createElement(f.Item.Meta, {
            avatar: t.createElement(z, {
              style: {
                fontSize: 20,
                color: K ? "#1677ff" : "#bfbfbf"
              }
            }),
            title: t.createElement(
              "div",
              {
                style: {
                  display: "flex",
                  alignItems: "center",
                  gap: 6
                }
              },
              t.createElement(m, null, I.filename),
              Z ? t.createElement(
                T,
                { color: "default", style: { fontSize: 10 } },
                "内置"
              ) : t.createElement(
                T,
                { color: "cyan", style: { fontSize: 10 } },
                "记忆库"
              )
            ),
            description: t.createElement(
              "div",
              { style: { fontSize: 12 } },
              `${(I.size / 1024).toFixed(1)} KB · 修改于 ${new Date(I.modified_time).toLocaleString()}`
            )
          }),
          t.createElement(S, {
            checked: K,
            size: "small",
            onChange: (h) => G(I.filename, h)
          })
        );
      }
    }),
    // Edit/New file modal
    t.createElement(
      k,
      {
        open: Y,
        onCancel: () => c(!1),
        title: u ? `编辑 ${u}` : "新建记忆文件",
        width: 700,
        onOk: A,
        confirmLoading: te,
        okText: "保存"
      },
      u ? null : t.createElement(
        "div",
        { style: { marginBottom: 12 } },
        t.createElement(E, {
          placeholder: "文件名（如：油藏工程记忆库.md）",
          value: q,
          onChange: (I) => L(I.target.value),
          addonAfter: q.endsWith(".md") ? "" : ".md"
        })
      ),
      t.createElement(E.TextArea, {
        value: w,
        onChange: (I) => H(I.target.value),
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
function ht({
  skills: e,
  agentId: l
}) {
  const r = y().React, { useMemo: t } = r, {
    List: a,
    Tag: n,
    Typography: i,
    Empty: f,
    Button: T,
    message: S
  } = y().antd, { ThunderboltOutlined: g, CopyOutlined: k } = y().antdIcons || {}, { Text: E } = i, x = t(() => it(e), [e]), W = (v) => {
    try {
      const z = y();
      z.setSelectedAgent && z.setSelectedAgent(l);
    } catch {
    }
    try {
      sessionStorage.setItem("ugsci_pending_prompt", v);
    } catch {
    }
    window.history.pushState({}, "", "/chat"), window.dispatchEvent(new PopStateEvent("popstate"));
  }, B = (v) => {
    var z;
    (z = navigator.clipboard) == null || z.writeText(v).then(() => {
      S.success("已复制到剪贴板");
    });
  };
  return x.length === 0 ? r.createElement(f, {
    description: "暂无推荐提问，请先为专家添加技能",
    image: f.PRESENTED_IMAGE_SIMPLE
  }) : r.createElement(
    "div",
    null,
    r.createElement(
      "div",
      {
        style: {
          display: "flex",
          alignItems: "center",
          gap: 6,
          marginBottom: 12
        }
      },
      g ? r.createElement(g, {
        style: { fontSize: 14, color: "#1677ff" }
      }) : null,
      r.createElement(
        E,
        { strong: !0 },
        `推荐提问 (${x.length})`
      ),
      r.createElement(
        E,
        { type: "secondary", style: { fontSize: 12 } },
        "· 从技能描述中自动提取"
      )
    ),
    r.createElement(a, {
      dataSource: x,
      renderItem: (v, z) => r.createElement(
        a.Item,
        {
          actions: [
            r.createElement(
              T,
              {
                type: "link",
                size: "small",
                icon: k ? r.createElement(k) : void 0,
                onClick: () => B(v)
              },
              "复制"
            )
          ]
        },
        r.createElement(a.Item.Meta, {
          avatar: r.createElement(
            n,
            { color: "blue", style: { borderRadius: "50%" } },
            `${z + 1}`
          ),
          title: r.createElement(
            "div",
            {
              style: {
                cursor: "pointer",
                color: "#1677ff"
              },
              onClick: () => W(v)
            },
            v
          ),
          description: r.createElement(
            E,
            { type: "secondary", style: { fontSize: 12 } },
            "点击直接发送给专家"
          )
        })
      )
    })
  );
}
function vt() {
  var oe;
  const e = y().React, { useState: l, useEffect: r, useCallback: t, useMemo: a } = e, {
    Spin: n,
    Empty: i,
    Input: f,
    Button: T,
    message: S,
    Row: g,
    Col: k,
    Tabs: E,
    Modal: x,
    Typography: W
  } = y().antd, { ReloadOutlined: B, PlusOutlined: v, SearchOutlined: z, TeamOutlined: U } = y().antdIcons || {}, { Text: _, Paragraph: N } = W, [m, P] = l([]), [$, M] = l(!0), [j, O] = l(!1), [D, Y] = l(null), [c, u] = l(""), [o, w] = l(!1), [H, q] = l("experts"), [L, te] = l(
    null
  ), [Q, s] = l(""), [G, R] = l(!1), [F, A] = l([]), I = t(async () => {
    M(!0);
    try {
      const b = await Pe(), V = await Ue().catch(
        () => []
      ), X = await Promise.all(
        b.map(async (C) => {
          try {
            const [J, ce] = await Promise.all([
              Ce(C.id).catch(() => null),
              Fe(C.id).catch(() => [])
            ]), de = tt(J == null ? void 0 : J.mcp), ue = V.filter(
              (Ee) => de.includes(Ee.key) || de.includes(Ee.name)
            );
            return {
              agent: C,
              config: J,
              skills: ce,
              mcps: ue,
              loading: !1
            };
          } catch {
            return {
              agent: C,
              config: null,
              skills: [],
              mcps: [],
              loading: !1
            };
          }
        })
      );
      P(X), A(b);
    } catch (b) {
      S.error(b.message || "加载专家列表失败"), P([]);
    } finally {
      M(!1);
    }
  }, []);
  r(() => {
    I();
  }, [I]);
  const K = t(
    async (b) => {
      var J;
      const V = b.coordinatorName || ((J = b.members[0]) == null ? void 0 : J.name);
      if (!V) {
        S.error("无法确定协调者专家");
        return;
      }
      const X = we(F, V);
      if (!X) {
        S.error(`未找到协调者专家「${V}」，请先创建该专家`);
        return;
      }
      if (/\{.+?\}/.test(b.taskTemplate)) {
        s(""), te(b);
        return;
      }
      await Z(b, X, b.taskTemplate);
    },
    [F, S]
  ), Z = t(
    async (b, V, X) => {
      var C;
      R(!0);
      try {
        const J = at(b), ce = X ? J.replace(b.taskTemplate, X) : J, de = y();
        de.setSelectedAgent && de.setSelectedAgent(V), await lt(V, ce), S.success(
          `团队任务已发起，协调者：${b.coordinatorName || ((C = b.members[0]) == null ? void 0 : C.name)}`
        ), te(null), h("/chat");
      } catch (J) {
        S.error(J.message || "发起团队任务失败");
      } finally {
        R(!1);
      }
    },
    [S]
  ), h = (b) => {
    window.history.pushState({}, "", b), window.dispatchEvent(new PopStateEvent("popstate"));
  }, ae = t((b) => {
    Y(b), O(!0);
  }, []), se = t(
    (b) => {
      if (!b.agent.enabled) {
        S.warning(`专家「${b.agent.name}」未启用，请先启用`);
        return;
      }
      try {
        const V = y();
        V.setSelectedAgent && V.setSelectedAgent(b.agent.id);
      } catch (V) {
        console.warn("[ugsci] Failed to set selected agent:", V);
      }
      S.success(`已召唤专家「${b.agent.name}」，正在跳转至对话...`), h("/chat");
    },
    [S]
  ), ye = a(() => {
    if (!c.trim()) return m;
    const b = c.toLowerCase();
    return m.filter(
      (V) => {
        var X;
        return V.agent.name.toLowerCase().includes(b) || ((X = V.agent.description) == null ? void 0 : X.toLowerCase().includes(b)) || V.agent.id.toLowerCase().includes(b) || V.skills.some((C) => C.name.toLowerCase().includes(b));
      }
    );
  }, [m, c]), fe = m.filter((b) => b.agent.enabled).length, d = m.reduce(
    (b, V) => b + V.skills.filter((X) => X.enabled !== !1).length,
    0
  ), ne = m.reduce((b, V) => b + V.mcps.length, 0), re = [
    {
      key: "experts",
      label: e.createElement("span", null, "🧑‍🔬 专家列表"),
      children: e.createElement(
        "div",
        null,
        // Search bar
        e.createElement(
          "div",
          { style: { marginBottom: 16 } },
          e.createElement(f, {
            placeholder: "搜索专家名称、描述或技能...",
            prefix: z ? e.createElement(z) : void 0,
            value: c,
            onChange: (b) => u(b.target.value),
            allowClear: !0,
            style: { maxWidth: 400 }
          })
        ),
        // Content
        $ ? e.createElement(
          "div",
          { style: { textAlign: "center", padding: 60 } },
          e.createElement(n, { size: "large" })
        ) : ye.length === 0 ? e.createElement(i, {
          description: c ? "未找到匹配的专家" : "暂无专家，点击「创建专家」添加"
        }) : e.createElement(
          g,
          { gutter: [12, 12], align: "stretch" },
          ...ye.map(
            (b) => e.createElement(
              k,
              {
                key: b.agent.id,
                xs: 24,
                sm: 12,
                md: 8,
                lg: 6,
                style: { display: "flex" }
              },
              e.createElement(gt, {
                expert: b,
                onClick: () => ae(b),
                onSummon: () => se(b)
              })
            )
          )
        )
      )
    },
    {
      key: "teams",
      label: e.createElement("span", null, "🤝 专家团"),
      children: e.createElement(st, {
        agents: F,
        onLaunch: K
      })
    }
  ];
  return e.createElement(
    "div",
    { style: { padding: 24 } },
    e.createElement(Te, {
      title: "专家中心",
      subtitle: `共 ${m.length} 位专家（${fe} 位启用）· ${d} 个技能 · ${ne} 个 MCP 客户端`,
      extra: e.createElement(
        e.Fragment,
        null,
        e.createElement(
          T,
          {
            icon: B ? e.createElement(B) : void 0,
            onClick: I,
            loading: $
          },
          "刷新"
        ),
        e.createElement(
          T,
          {
            type: "primary",
            icon: v ? e.createElement(v) : void 0,
            onClick: () => w(!0)
          },
          "创建专家"
        )
      )
    }),
    e.createElement(E, {
      items: re,
      activeKey: H,
      onChange: (b) => q(b)
    }),
    // Drawer
    e.createElement(yt, {
      expert: D,
      open: j,
      onClose: () => O(!1),
      onRefresh: () => I()
    }),
    // Template Modal
    e.createElement(ft, {
      open: o,
      onClose: () => w(!1),
      onCreated: () => I()
    }),
    // Team Launch Modal (for filling placeholders)
    L ? e.createElement(
      x,
      {
        open: !0,
        title: e.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 8 } },
          e.createElement(
            "span",
            { style: { fontSize: 20 } },
            L.emoji
          ),
          e.createElement(
            "span",
            null,
            `发起团队任务 - ${L.name}`
          )
        ),
        onCancel: () => te(null),
        onOk: () => {
          var C;
          const b = L.coordinatorName || ((C = L.members[0]) == null ? void 0 : C.name), V = b ? we(F, b) : null;
          if (!V) {
            S.error("无法找到协调者专家");
            return;
          }
          let X = L.taskTemplate;
          Q.trim() && (X = Q.trim()), Z(L, V, X);
        },
        confirmLoading: G,
        okText: "发起任务",
        width: 600
      },
      e.createElement(
        "div",
        { style: { marginBottom: 12 } },
        e.createElement(
          _,
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
          L.taskTemplate
        )
      ),
      e.createElement(
        "div",
        null,
        e.createElement(
          _,
          {
            type: "secondary",
            style: { fontSize: 12, display: "block", marginBottom: 8 }
          },
          "输入具体任务描述（替换上面的占位符内容）："
        ),
        e.createElement(f.TextArea, {
          value: Q,
          onChange: (b) => s(b.target.value),
          rows: 5,
          placeholder: L.taskTemplate,
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
          _,
          { style: { fontSize: 12, color: "#0958d9" } },
          `协调者: ${L.coordinatorName || ((oe = L.members[0]) == null ? void 0 : oe.name) || "—"} · 成员: ${L.members.map((b) => b.name).join("、")}`
        )
      )
    ) : null
  );
}
function St({
  mcp: e,
  onClick: l
}) {
  const r = y().React, { Card: t, Tag: a, Badge: n, Typography: i } = y().antd, { Text: f } = i, T = {
    stdio: "💻",
    streamable_http: "🌐",
    sse: "📡"
  };
  return r.createElement(
    t,
    {
      hoverable: !0,
      onClick: l,
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
          T[e.transport] || "🔌"
        ),
        r.createElement(
          f,
          { strong: !0, style: { fontSize: 14 } },
          e.name || e.key
        )
      ),
      r.createElement(n, {
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
      { style: { display: "flex", gap: 6, flexWrap: "wrap" } },
      r.createElement(
        a,
        { color: "purple", style: { fontSize: 11 } },
        e.transport
      ),
      e.tools && e.tools.length > 0 ? r.createElement(
        a,
        { color: "blue", style: { fontSize: 11 } },
        `${e.tools.length} 个工具`
      ) : r.createElement(a, { style: { fontSize: 11 } }, "全部工具"),
      e.url ? r.createElement(
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
const ze = {
  reservoir_simulation: "油藏数值模拟",
  geological_modeling: "地质建模",
  well_log_analysis: "测井分析",
  production_engineering: "采油工程",
  post_processing: "后处理与可视化",
  multiphysics: "多物理场仿真"
}, Ve = {
  reservoir_simulation: "🛢️",
  geological_modeling: "🏔️",
  well_log_analysis: "📡",
  production_engineering: "⚙️",
  post_processing: "📊",
  multiphysics: "🔬"
};
async function bt() {
  return ee("/ugsci/engines/list");
}
async function xt(e) {
  return ee("/ugsci/engines/", {
    method: "POST",
    body: JSON.stringify(e)
  });
}
async function wt(e, l) {
  return ee(`/ugsci/engines/${encodeURIComponent(e)}`, {
    method: "PUT",
    body: JSON.stringify(l)
  });
}
async function Ct(e) {
  return ee(
    `/ugsci/engines/${encodeURIComponent(e)}`,
    { method: "DELETE" }
  );
}
async function Tt() {
  return ee("/ugsci/engines/detect", {
    method: "POST"
  });
}
function kt({
  engine: e,
  onClick: l
}) {
  const r = y().React, { Card: t, Tag: a, Typography: n } = y().antd, { Text: i } = n, f = e.status === "detected", T = Ve[e.category] || "📦";
  return r.createElement(
    t,
    {
      hoverable: !0,
      onClick: l,
      size: "small",
      style: {
        cursor: "pointer",
        borderColor: f ? void 0 : "#d9d9d9",
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
        r.createElement("span", { style: { fontSize: 20 } }, T),
        r.createElement(
          "div",
          null,
          r.createElement(
            i,
            { strong: !0, style: { fontSize: 14 } },
            e.name
          ),
          r.createElement("br"),
          r.createElement(
            i,
            { type: "secondary", style: { fontSize: 11 } },
            e.vendor || "—"
          )
        )
      ),
      r.createElement(
        "div",
        { style: { display: "flex", flexDirection: "column", gap: 4, alignItems: "flex-end" } },
        f ? r.createElement(
          a,
          { color: "success", style: { fontSize: 11 } },
          "✅ 已检测"
        ) : e.executable_path ? r.createElement(
          a,
          { color: "warning", style: { fontSize: 11 } },
          "⚠ 路径无效"
        ) : r.createElement(
          a,
          { style: { fontSize: 11 } },
          "🔧 待配置"
        ),
        e.is_default ? r.createElement(
          a,
          { color: "blue", style: { fontSize: 10 } },
          "默认"
        ) : e.is_custom ? r.createElement(
          a,
          { color: "purple", style: { fontSize: 10 } },
          "自定义"
        ) : null
      )
    ),
    r.createElement(
      "div",
      { style: { flex: 1, minHeight: 32 } },
      r.createElement(
        i,
        { type: "secondary", style: { fontSize: 12 } },
        e.description || "暂无描述"
      )
    ),
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
      e.category ? r.createElement(
        a,
        { style: { fontSize: 11 } },
        ze[e.category] || e.category
      ) : null,
      e.version ? r.createElement(
        a,
        { color: "blue", style: { fontSize: 11 } },
        `v${e.version}`
      ) : null
    )
  );
}
function zt() {
  const e = y().React, { useState: l, useEffect: r, useCallback: t, useMemo: a } = e, {
    Spin: n,
    Empty: i,
    Button: f,
    message: T,
    Row: S,
    Col: g,
    Drawer: k,
    Descriptions: E,
    Tag: x,
    Typography: W,
    Modal: B,
    Input: v,
    Alert: z,
    Select: U,
    Popconfirm: _,
    Space: N
  } = y().antd, {
    ReloadOutlined: m,
    SearchOutlined: P,
    PlusOutlined: $,
    EditOutlined: M,
    DeleteOutlined: j,
    CopyOutlined: O,
    ExperimentOutlined: D
  } = y().antdIcons || {}, { Text: Y, Paragraph: c } = W, [u, o] = l([]), [w, H] = l(!0), [q, L] = l(""), [te, Q] = l(!1), [s, G] = l(null), [R, F] = l(!1), [A, I] = l(null), [K, Z] = l({}), [h, ae] = l(!1), se = t(async () => {
    H(!0);
    try {
      const C = await bt();
      o(C.engines || []);
    } catch (C) {
      T.error(C.message || "加载引擎列表失败"), o([]);
    } finally {
      H(!1);
    }
  }, []);
  r(() => {
    se();
  }, [se]);
  const ye = a(() => {
    if (!q.trim()) return u;
    const C = q.toLowerCase();
    return u.filter(
      (J) => {
        var ce;
        return J.name.toLowerCase().includes(C) || J.vendor.toLowerCase().includes(C) || J.category.toLowerCase().includes(C) || ((ce = J.description) == null ? void 0 : ce.toLowerCase().includes(C));
      }
    );
  }, [u, q]), fe = u.filter((C) => C.status === "detected").length, d = t((C) => {
    navigator.clipboard.writeText(C).then(() => T.success("路径已复制")).catch(() => T.error("复制失败"));
  }, []), ne = t(() => {
    I(null), Z({
      name: "",
      vendor: "",
      version: "",
      executable_path: "",
      category: "",
      description: "",
      invocation_hint: ""
    }), F(!0);
  }, []), re = t((C) => {
    I(C), Z({ ...C }), F(!0), Q(!1);
  }, []), oe = t(async () => {
    var C;
    if (!((C = K.name) != null && C.trim())) {
      T.warning("请输入引擎名称");
      return;
    }
    ae(!0);
    try {
      A ? (await wt(A.id, K), T.success("引擎已更新")) : (await xt(K), T.success("引擎已添加")), F(!1), se();
    } catch (J) {
      T.error(J.message || "保存失败");
    } finally {
      ae(!1);
    }
  }, [K, A, se]), b = t(
    async (C) => {
      try {
        await Ct(C), T.success("引擎已删除"), Q(!1), se();
      } catch (J) {
        T.error(J.message || "删除失败");
      }
    },
    [se]
  ), V = t(async () => {
    H(!0);
    try {
      const C = await Tt();
      o(C.engines || []), T.success("自动检测完成");
    } catch (C) {
      T.error(C.message || "检测失败");
    } finally {
      H(!1);
    }
  }, []), X = t(
    (C, J, ce) => {
      const de = K[J] || "";
      return e.createElement(
        "div",
        { style: { marginBottom: 12 } },
        e.createElement(
          Y,
          { style: { fontSize: 13, display: "block", marginBottom: 4 } },
          C
        ),
        ce != null && ce.select ? e.createElement(U, {
          value: de || void 0,
          onChange: (ue) => Z((Ee) => ({ ...Ee, [J]: ue })),
          style: { width: "100%" },
          options: ce.select.options,
          allowClear: !0,
          placeholder: `选择${C}`
        }) : ce != null && ce.textarea ? e.createElement(v.TextArea, {
          value: de,
          onChange: (ue) => Z((Ee) => ({ ...Ee, [J]: ue.target.value })),
          rows: 3,
          placeholder: `输入${C}`
        }) : e.createElement(v, {
          value: de,
          onChange: (ue) => Z((Ee) => ({ ...Ee, [J]: ue.target.value })),
          placeholder: `输入${C}`
        })
      );
    },
    [K]
  );
  return e.createElement(
    "div",
    null,
    // Summary alert
    e.createElement(
      z,
      {
        type: fe > 0 ? "success" : "info",
        message: `共 ${u.length} 个引擎 · ${fe} 个已检测`,
        description: fe > 0 ? "部分引擎已自动检测到安装路径，可在卡片中查看详情。" : "尚未检测到已安装的引擎。可点击「自动检测」或手动添加计算引擎。",
        showIcon: !0,
        style: { marginBottom: 16 }
      }
    ),
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
      e.createElement(v, {
        placeholder: "搜索引擎名称、厂商...",
        prefix: P ? e.createElement(P) : void 0,
        value: q,
        onChange: (C) => L(C.target.value),
        allowClear: !0,
        style: { maxWidth: 280 }
      }),
      e.createElement(
        f,
        {
          icon: m ? e.createElement(m) : void 0,
          onClick: V,
          loading: w
        },
        "自动检测"
      ),
      e.createElement(
        f,
        {
          type: "primary",
          icon: $ ? e.createElement($) : void 0,
          onClick: ne
        },
        "添加引擎"
      )
    ),
    // Content
    w ? e.createElement(
      "div",
      { style: { textAlign: "center", padding: 60 } },
      e.createElement(n, {
        size: "large",
        tip: "正在加载计算引擎..."
      })
    ) : ye.length === 0 ? e.createElement(i, {
      description: q ? "无匹配引擎" : "暂无引擎，点击「添加引擎」开始"
    }) : e.createElement(
      S,
      { gutter: [12, 12], align: "stretch" },
      ...ye.map(
        (C) => e.createElement(
          g,
          {
            key: C.id,
            xs: 24,
            sm: 12,
            md: 8,
            lg: 6,
            style: { display: "flex" }
          },
          e.createElement(kt, {
            engine: C,
            onClick: () => {
              G(C), Q(!0);
            }
          })
        )
      )
    ),
    // Detail drawer
    s ? e.createElement(
      k,
      {
        title: e.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 8 } },
          e.createElement(
            "span",
            { style: { fontSize: 18 } },
            Ve[s.category] || "📦"
          ),
          e.createElement("span", null, s.name)
        ),
        open: te,
        onClose: () => Q(!1),
        width: 520,
        extra: e.createElement(
          N,
          null,
          e.createElement(
            f,
            {
              size: "small",
              icon: M ? e.createElement(M) : void 0,
              onClick: () => re(s)
            },
            "编辑"
          ),
          s.is_default ? null : e.createElement(
            _,
            {
              title: "确认删除此引擎？",
              description: s.name,
              onConfirm: () => b(s.id),
              okText: "删除",
              cancelText: "取消",
              okButtonProps: { danger: !0 }
            },
            e.createElement(
              f,
              {
                size: "small",
                danger: !0,
                icon: j ? e.createElement(j) : void 0
              },
              "删除"
            )
          )
        )
      },
      e.createElement(
        E,
        { column: 1, bordered: !0, size: "small" },
        e.createElement(
          E.Item,
          { label: "引擎名称" },
          s.name
        ),
        e.createElement(
          E.Item,
          { label: "厂商" },
          s.vendor || "—"
        ),
        e.createElement(
          E.Item,
          { label: "分类" },
          s.category ? ze[s.category] || s.category : "—"
        ),
        e.createElement(
          E.Item,
          { label: "状态" },
          e.createElement(
            x,
            {
              color: s.status === "detected" ? "success" : s.status === "not_found" ? "error" : "default"
            },
            s.status === "detected" ? "✅ 已检测" : s.status === "not_found" ? "❌ 路径无效" : "🔧 待配置"
          )
        ),
        e.createElement(
          E.Item,
          { label: "版本" },
          s.version || "—"
        ),
        s.executable_path ? e.createElement(
          E.Item,
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
              f,
              {
                size: "small",
                type: "text",
                icon: O ? e.createElement(O) : void 0,
                onClick: () => d(s.executable_path)
              }
            )
          )
        ) : null,
        s.install_dir ? e.createElement(
          E.Item,
          { label: "安装目录" },
          e.createElement(
            "code",
            { style: { fontSize: 12, wordBreak: "break-all" } },
            s.install_dir
          )
        ) : null,
        s.license_server ? e.createElement(
          E.Item,
          { label: "许可证服务器" },
          s.license_server
        ) : null,
        e.createElement(
          E.Item,
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
          Y,
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
          x,
          { color: "blue" },
          "默认引擎"
        ) : s.is_custom ? e.createElement(
          x,
          { color: "purple" },
          "自定义引擎"
        ) : null
      )
    ) : null,
    // Add/Edit modal
    e.createElement(
      B,
      {
        title: A ? "编辑引擎" : "添加计算引擎",
        open: R,
        onOk: oe,
        onCancel: () => F(!1),
        okText: A ? "保存" : "添加",
        cancelText: "取消",
        confirmLoading: h,
        width: 560
      },
      e.createElement(
        "div",
        { style: { maxHeight: 480, overflow: "auto", paddingRight: 8 } },
        X("引擎名称 *", "name"),
        X("厂商", "vendor"),
        X("版本", "version"),
        X("可执行文件路径", "executable_path"),
        X("安装目录", "install_dir"),
        X("分类", "category", {
          select: {
            options: Object.entries(ze).map(([C, J]) => ({
              label: J,
              value: C
            }))
          }
        }),
        X("描述", "description", { textarea: !0 }),
        X("调用方式提示", "invocation_hint", { textarea: !0 }),
        X("许可证服务器", "license_server")
      )
    )
  );
}
function It() {
  const e = y().React, { useState: l, useEffect: r, useCallback: t, useMemo: a } = e, {
    Spin: n,
    Empty: i,
    Input: f,
    Button: T,
    message: S,
    Row: g,
    Col: k,
    Drawer: E,
    Descriptions: x,
    Tag: W,
    Typography: B,
    List: v,
    Tabs: z
  } = y().antd, { ReloadOutlined: U, PlusOutlined: _, SearchOutlined: N, ApiOutlined: m } = y().antdIcons || {}, { Text: P } = B, [$, M] = l([]), [j, O] = l(!0), [D, Y] = l(""), [c, u] = l(!1), [o, w] = l(null), [H, q] = l("mcp"), L = t(async () => {
    O(!0);
    try {
      const A = await Ue();
      M(A);
    } catch (A) {
      S.error(A.message || "加载能力列表失败"), M([]);
    } finally {
      O(!1);
    }
  }, []);
  r(() => {
    L();
  }, [L]);
  const te = a(() => {
    if (!D.trim()) return $;
    const A = D.toLowerCase();
    return $.filter(
      (I) => {
        var K;
        return I.name.toLowerCase().includes(A) || I.key.toLowerCase().includes(A) || ((K = I.description) == null ? void 0 : K.toLowerCase().includes(A)) || I.transport.toLowerCase().includes(A);
      }
    );
  }, [$, D]), Q = $.filter((A) => A.enabled).length, s = $.reduce((A, I) => {
    var K;
    return A + (((K = I.tools) == null ? void 0 : K.length) || 0);
  }, 0), G = (A) => {
    window.history.pushState({}, "", A), window.dispatchEvent(new PopStateEvent("popstate"));
  }, R = e.createElement(
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
      e.createElement(f, {
        placeholder: "搜索能力名称、描述...",
        prefix: N ? e.createElement(N) : void 0,
        value: D,
        onChange: (A) => Y(A.target.value),
        allowClear: !0,
        style: { maxWidth: 400 }
      }),
      e.createElement(
        T,
        {
          type: "primary",
          icon: _ ? e.createElement(_) : void 0,
          onClick: () => G("/mcp")
        },
        "管理 MCP"
      )
    ),
    j ? e.createElement(
      "div",
      { style: { textAlign: "center", padding: 60 } },
      e.createElement(n, { size: "large" })
    ) : te.length === 0 ? e.createElement(i, {
      description: D ? "未找到匹配的能力" : "暂无 MCP 客户端，点击「管理 MCP」添加"
    }) : e.createElement(
      g,
      { gutter: [12, 12], align: "stretch" },
      ...te.map(
        (A) => e.createElement(
          k,
          {
            key: A.key,
            xs: 24,
            sm: 12,
            md: 8,
            lg: 6,
            style: { display: "flex" }
          },
          e.createElement(St, {
            mcp: A,
            onClick: () => {
              w(A), u(!0);
            }
          })
        )
      )
    )
  ), F = [
    {
      key: "mcp",
      label: e.createElement("span", null, "🔌 MCP 客户端"),
      children: R
    },
    {
      key: "software",
      label: e.createElement("span", null, "🖥️ 计算引擎"),
      children: e.createElement(zt)
    }
  ];
  return e.createElement(
    "div",
    { style: { padding: 24 } },
    e.createElement(Te, {
      title: "能力中心",
      subtitle: `MCP: ${$.length} 个客户端（${Q} 个启用）· ${s} 个工具`,
      extra: e.createElement(
        e.Fragment,
        null,
        e.createElement(
          T,
          {
            icon: U ? e.createElement(U) : void 0,
            onClick: L,
            loading: j
          },
          "刷新"
        )
      )
    }),
    e.createElement(z, {
      items: F,
      activeKey: H,
      onChange: (A) => q(A)
    }),
    // MCP Detail drawer
    o ? e.createElement(
      E,
      {
        title: e.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 8 } },
          e.createElement("span", { style: { fontSize: 18 } }, "🔌"),
          e.createElement(
            "span",
            null,
            o.name || o.key
          )
        ),
        open: c,
        onClose: () => u(!1),
        width: 480
      },
      e.createElement(
        x,
        { column: 1, bordered: !0, size: "small" },
        e.createElement(
          x.Item,
          { label: "Key" },
          e.createElement(
            "code",
            { style: { fontSize: 12 } },
            o.key
          )
        ),
        e.createElement(
          x.Item,
          { label: "名称" },
          o.name || "-"
        ),
        e.createElement(
          x.Item,
          { label: "描述" },
          o.description || "-"
        ),
        e.createElement(
          x.Item,
          { label: "状态" },
          e.createElement(
            W,
            { color: o.enabled ? "green" : "default" },
            o.enabled ? "启用" : "停用"
          )
        ),
        e.createElement(
          x.Item,
          { label: "传输方式" },
          o.transport
        ),
        o.url ? e.createElement(
          x.Item,
          { label: "URL" },
          o.url
        ) : null,
        o.command ? e.createElement(
          x.Item,
          { label: "命令" },
          e.createElement(
            "code",
            { style: { fontSize: 11 } },
            o.command
          )
        ) : null,
        o.args && o.args.length > 0 ? e.createElement(
          x.Item,
          { label: "参数" },
          o.args.join(" ")
        ) : null
      ),
      o.tools && o.tools.length > 0 ? e.createElement(
        "div",
        { style: { marginTop: 16 } },
        e.createElement(
          P,
          {
            strong: !0,
            style: { display: "block", marginBottom: 8 }
          },
          "提供的工具"
        ),
        e.createElement(v, {
          size: "small",
          dataSource: o.tools,
          renderItem: (A) => e.createElement(
            v.Item,
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
              m ? e.createElement(m, {
                style: { fontSize: 12, color: "#1677ff" }
              }) : null,
              e.createElement(
                P,
                { style: { fontSize: 12 } },
                A
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
function Pt({
  agentId: e,
  agentName: l,
  onNavigate: r
}) {
  const t = y().React, { useState: a, useEffect: n, useCallback: i } = t, {
    Spin: f,
    Empty: T,
    Button: S,
    Row: g,
    Col: k,
    Card: E,
    Tag: x,
    Typography: W,
    Drawer: B,
    Descriptions: v,
    Alert: z
  } = y().antd, {
    ReloadOutlined: U,
    ThunderboltOutlined: _,
    SettingOutlined: N
  } = y().antdIcons || {}, { Text: m, Paragraph: P } = W, [$, M] = a([]), [j, O] = a(!0), [D, Y] = a(!1), [c, u] = a(null), o = i(async () => {
    if (e) {
      O(!0);
      try {
        const w = await Fe(e);
        M(w);
      } catch {
        M([]);
      } finally {
        O(!1);
      }
    }
  }, [e]);
  return n(() => {
    o();
  }, [o]), t.createElement(
    "div",
    null,
    t.createElement(z, {
      type: "info",
      showIcon: !0,
      message: `当前智能体：${l}`,
      description: `已加载 ${$.length} 个技能。切换智能体时自动同步。`,
      style: { marginBottom: 16 }
    }),
    t.createElement(
      "div",
      {
        style: {
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16
        }
      },
      t.createElement(
        m,
        { type: "secondary", style: { fontSize: 13 } },
        `共 ${$.length} 个技能`
      ),
      t.createElement(
        S,
        {
          icon: U ? t.createElement(U) : void 0,
          onClick: o,
          loading: j,
          size: "small"
        },
        "刷新"
      )
    ),
    j ? t.createElement(
      "div",
      { style: { textAlign: "center", padding: 60 } },
      t.createElement(f, { size: "large" })
    ) : $.length === 0 ? t.createElement(T, {
      description: "当前智能体未加载任何技能"
    }) : t.createElement(
      g,
      { gutter: [12, 12] },
      ...$.map(
        (w) => t.createElement(
          k,
          { key: w.name, xs: 24, sm: 12, md: 8, lg: 6 },
          t.createElement(
            E,
            {
              hoverable: !0,
              size: "small",
              style: { cursor: "pointer", height: "100%" },
              onClick: () => {
                u(w), Y(!0);
              }
            },
            t.createElement(
              "div",
              {
                style: {
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 8
                }
              },
              w.emoji ? t.createElement(
                "span",
                { style: { fontSize: 18 } },
                w.emoji
              ) : t.createElement(
                "span",
                { style: { fontSize: 18 } },
                "⚡"
              ),
              t.createElement(
                m,
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
                w.name
              ),
              w.enabled === !1 ? t.createElement(
                x,
                { color: "default", style: { fontSize: 10 } },
                "已禁用"
              ) : t.createElement(
                x,
                { color: "green", style: { fontSize: 10 } },
                "已启用"
              )
            ),
            w.description ? t.createElement(
              P,
              {
                type: "secondary",
                style: { fontSize: 11, margin: 0, lineHeight: 1.4 },
                ellipsis: { rows: 2 }
              },
              w.description
            ) : null,
            t.createElement(
              "div",
              {
                style: {
                  marginTop: 8,
                  display: "flex",
                  gap: 4,
                  flexWrap: "wrap"
                }
              },
              w.version_text ? t.createElement(
                x,
                { style: { fontSize: 10 } },
                `v${w.version_text}`
              ) : null,
              ...(w.tags || []).slice(0, 3).map(
                (H, q) => t.createElement(
                  x,
                  { key: q, color: "blue", style: { fontSize: 10 } },
                  H
                )
              )
            )
          )
        )
      )
    ),
    // Skill detail drawer
    c ? t.createElement(
      B,
      {
        title: t.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 8 } },
          t.createElement(
            "span",
            { style: { fontSize: 18 } },
            c.emoji || "⚡"
          ),
          t.createElement("span", null, c.name)
        ),
        open: D,
        onClose: () => Y(!1),
        width: 520,
        extra: t.createElement(
          S,
          {
            type: "primary",
            size: "small",
            icon: N ? t.createElement(N) : void 0,
            onClick: () => r("/skills")
          },
          "管理技能"
        )
      },
      t.createElement(
        v,
        { column: 1, bordered: !0, size: "small" },
        t.createElement(
          v.Item,
          { label: "技能名称" },
          c.name
        ),
        t.createElement(
          v.Item,
          { label: "描述" },
          c.description || "-"
        ),
        c.version_text ? t.createElement(
          v.Item,
          { label: "版本" },
          c.version_text
        ) : null,
        t.createElement(
          v.Item,
          { label: "来源" },
          c.source || "-"
        ),
        t.createElement(
          v.Item,
          { label: "状态" },
          c.enabled === !1 ? "已禁用" : "已启用"
        ),
        c.installed_from ? t.createElement(
          v.Item,
          { label: "安装来源" },
          c.installed_from
        ) : null
      ),
      // Tags
      c.tags && c.tags.length > 0 ? t.createElement(
        "div",
        { style: { marginTop: 16 } },
        t.createElement(
          m,
          {
            strong: !0,
            style: { display: "block", marginBottom: 8 }
          },
          "标签"
        ),
        t.createElement(
          "div",
          { style: { display: "flex", flexWrap: "wrap", gap: 4 } },
          ...c.tags.map(
            (w, H) => t.createElement(x, { key: H, color: "blue" }, w)
          )
        )
      ) : null,
      // Skill content preview
      c.content ? t.createElement(
        "div",
        { style: { marginTop: 16 } },
        t.createElement(
          m,
          {
            strong: !0,
            style: { display: "block", marginBottom: 8 }
          },
          "技能内容"
        ),
        t.createElement(
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
          c.content.slice(0, 2e3) + (c.content.length > 2e3 ? `

... (内容已截断)` : "")
        )
      ) : null
    ) : null
  );
}
function _t({
  poolSkills: e,
  workspaceSkills: l,
  agents: r,
  loading: t,
  onReload: a
}) {
  const n = y().React, { useState: i, useMemo: f, useCallback: T } = n, {
    Spin: S,
    Empty: g,
    Input: k,
    Button: E,
    Row: x,
    Col: W,
    Card: B,
    Tag: v,
    Typography: z,
    Drawer: U,
    Descriptions: _,
    List: N
  } = y().antd, {
    ReloadOutlined: m,
    SearchOutlined: P,
    DownloadOutlined: $,
    ThunderboltOutlined: M
  } = y().antdIcons || {}, { Text: j, Paragraph: O } = z, [D, Y] = i(""), [c, u] = i(!1), [o, w] = i(null), [H, q] = i([]), L = f(() => {
    if (!D.trim()) return e;
    const s = D.toLowerCase();
    return e.filter(
      (G) => {
        var R, F;
        return G.name.toLowerCase().includes(s) || ((R = G.description) == null ? void 0 : R.toLowerCase().includes(s)) || ((F = G.tags) == null ? void 0 : F.some((A) => A.toLowerCase().includes(s)));
      }
    );
  }, [e, D]), te = T(
    (s) => {
      const G = [];
      for (const R of l)
        if (R.skills.some((F) => F.name === s)) {
          const F = r.find((A) => A.id === R.agent_id);
          G.push((F == null ? void 0 : F.name) || R.agent_name || R.agent_id);
        }
      return G;
    },
    [l, r]
  ), Q = (s) => {
    window.history.pushState({}, "", s), window.dispatchEvent(new PopStateEvent("popstate"));
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
          marginBottom: 16
        }
      },
      n.createElement(k, {
        placeholder: "搜索技能名称、描述或标签...",
        prefix: P ? n.createElement(P) : void 0,
        value: D,
        onChange: (s) => Y(s.target.value),
        allowClear: !0,
        style: { maxWidth: 400 }
      }),
      n.createElement(
        "div",
        { style: { display: "flex", gap: 8 } },
        n.createElement(
          E,
          {
            icon: m ? n.createElement(m) : void 0,
            onClick: a,
            loading: t,
            size: "small"
          },
          "刷新"
        ),
        n.createElement(
          E,
          {
            type: "primary",
            icon: $ ? n.createElement($) : void 0,
            onClick: () => Q("/skill-pool"),
            size: "small"
          },
          "管理技能池"
        )
      )
    ),
    t ? n.createElement(
      "div",
      { style: { textAlign: "center", padding: 60 } },
      n.createElement(S, { size: "large" })
    ) : L.length === 0 ? n.createElement(g, {
      description: D ? "未找到匹配的技能" : "技能池为空"
    }) : n.createElement(
      x,
      { gutter: [12, 12] },
      ...L.map(
        (s) => n.createElement(
          W,
          { key: s.name, xs: 24, sm: 12, md: 8, lg: 6 },
          n.createElement(
            B,
            {
              hoverable: !0,
              size: "small",
              style: { cursor: "pointer", height: "100%" },
              onClick: () => {
                w(s), q(te(s.name)), u(!0);
              }
            },
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
              s.emoji ? n.createElement(
                "span",
                { style: { fontSize: 18 } },
                s.emoji
              ) : n.createElement(
                "span",
                { style: { fontSize: 18 } },
                "⚡"
              ),
              n.createElement(
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
                s.name
              ),
              s.protected ? n.createElement(
                v,
                { color: "gold", style: { fontSize: 10 } },
                "内置"
              ) : null
            ),
            s.description ? n.createElement(
              O,
              {
                type: "secondary",
                style: { fontSize: 11, margin: 0, lineHeight: 1.4 },
                ellipsis: { rows: 2 }
              },
              s.description
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
              s.version_text ? n.createElement(
                v,
                { style: { fontSize: 10 } },
                `v${s.version_text}`
              ) : null,
              ...(s.tags || []).slice(0, 3).map(
                (G, R) => n.createElement(
                  v,
                  { key: R, color: "cyan", style: { fontSize: 10 } },
                  G
                )
              )
            )
          )
        )
      )
    ),
    // Skill detail drawer
    o ? n.createElement(
      U,
      {
        title: n.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 8 } },
          n.createElement(
            "span",
            { style: { fontSize: 18 } },
            o.emoji || "⚡"
          ),
          n.createElement("span", null, o.name)
        ),
        open: c,
        onClose: () => u(!1),
        width: 520,
        extra: n.createElement(
          E,
          {
            type: "primary",
            size: "small",
            icon: M ? n.createElement(M) : void 0,
            onClick: () => Q("/skills")
          },
          "管理技能"
        )
      },
      n.createElement(
        _,
        { column: 1, bordered: !0, size: "small" },
        n.createElement(
          _.Item,
          { label: "技能名称" },
          o.name
        ),
        n.createElement(
          _.Item,
          { label: "描述" },
          o.description || "-"
        ),
        o.version_text ? n.createElement(
          _.Item,
          { label: "版本" },
          o.version_text
        ) : null,
        n.createElement(
          _.Item,
          { label: "来源" },
          o.source || "-"
        ),
        n.createElement(
          _.Item,
          { label: "受保护" },
          o.protected ? "是（内置）" : "否"
        ),
        o.sync_status ? n.createElement(
          _.Item,
          { label: "同步状态" },
          o.sync_status
        ) : null,
        o.installed_from ? n.createElement(
          _.Item,
          { label: "安装来源" },
          o.installed_from
        ) : null
      ),
      // Tags
      o.tags && o.tags.length > 0 ? n.createElement(
        "div",
        { style: { marginTop: 16 } },
        n.createElement(
          j,
          {
            strong: !0,
            style: { display: "block", marginBottom: 8 }
          },
          "标签"
        ),
        n.createElement(
          "div",
          { style: { display: "flex", flexWrap: "wrap", gap: 4 } },
          ...o.tags.map(
            (s, G) => n.createElement(v, { key: G, color: "cyan" }, s)
          )
        )
      ) : null,
      // Installed agents
      n.createElement(
        "div",
        { style: { marginTop: 16 } },
        n.createElement(
          j,
          { strong: !0, style: { display: "block", marginBottom: 8 } },
          `已安装此技能的专家 (${H.length})`
        ),
        H.length > 0 ? n.createElement(N, {
          size: "small",
          dataSource: H,
          renderItem: (s) => n.createElement(
            N.Item,
            null,
            n.createElement(
              "div",
              {
                style: {
                  display: "flex",
                  alignItems: "center",
                  gap: 6
                }
              },
              n.createElement("span", null, "🧑‍🔬"),
              n.createElement(
                j,
                { style: { fontSize: 13 } },
                s
              )
            )
          )
        }) : n.createElement(
          j,
          { type: "secondary", style: { fontSize: 12 } },
          "暂无专家安装此技能"
        )
      )
    ) : null
  );
}
function Ot() {
  const e = y().React, { useState: l, useEffect: r, useCallback: t, useMemo: a } = e, { Tabs: n, message: i } = y().antd, { ThunderboltOutlined: f } = y().antdIcons || {}, S = y().useSelectedAgent, g = S ? S() : null, k = (g == null ? void 0 : g.id) || "default", [E, x] = l([]), [W, B] = l([]), [v, z] = l([]), [U, _] = l(!0), [N, m] = l("agent-skills"), P = t(async () => {
    _(!0);
    try {
      const [O, D, Y] = await Promise.all([
        We(),
        Pe(),
        et()
      ]);
      B(O), x(D), z(Y);
    } catch (O) {
      i.error(O.message || "加载技能列表失败"), B([]);
    } finally {
      _(!1);
    }
  }, []);
  r(() => {
    P();
  }, [P]);
  const $ = a(() => {
    const O = E.find((D) => D.id === k);
    return (O == null ? void 0 : O.name) || k;
  }, [E, k]), M = (O) => {
    window.history.pushState({}, "", O), window.dispatchEvent(new PopStateEvent("popstate"));
  }, j = [
    {
      key: "agent-skills",
      label: e.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        f ? e.createElement(f, { style: { fontSize: 14 } }) : null,
        "当前Agent加载技能"
      ),
      children: e.createElement(Pt, {
        agentId: k,
        agentName: $,
        onNavigate: M
      })
    },
    {
      key: "skill-pool",
      label: e.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        "技能池"
      ),
      children: e.createElement(_t, {
        poolSkills: W,
        workspaceSkills: v,
        agents: E,
        loading: U,
        onReload: P
      })
    }
  ];
  return e.createElement(
    "div",
    { style: { padding: 24 } },
    e.createElement(Te, {
      title: "技能",
      subtitle: `技能池共 ${W.length} 个技能 · 当前智能体：${$}`
    }),
    e.createElement(n, {
      items: j,
      activeKey: N,
      onChange: (O) => m(O)
    })
  );
}
async function $t() {
  return ee("/market/providers");
}
async function Rt(e) {
  return ee(
    `/market/categories?lang=${encodeURIComponent(e)}`
  );
}
async function Mt(e, l, r, t, a) {
  return ee("/market/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: e,
      provider_pages: l,
      limit: r,
      lang: t,
      category: a || void 0
    })
  });
}
async function At(e, l, r) {
  return ee("/skills/hub/install/start", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify({
      bundle_url: l,
      enable: r
    })
  });
}
async function Lt(e, l) {
  return ee(
    `/skills/hub/install/status/${encodeURIComponent(l)}`,
    {
      headers: { "X-Agent-Id": e }
    }
  );
}
function Bt() {
  const e = y().React, { useState: l, useEffect: r, useCallback: t, useMemo: a, useRef: n } = e, {
    Spin: i,
    Empty: f,
    Input: T,
    Button: S,
    message: g,
    Row: k,
    Col: E,
    Card: x,
    Tag: W,
    Tooltip: B,
    Typography: v,
    Select: z,
    Drawer: U,
    Descriptions: _,
    Tabs: N,
    Badge: m,
    Progress: P
  } = y().antd, {
    ReloadOutlined: $,
    SearchOutlined: M,
    DownloadOutlined: j,
    AppstoreOutlined: O,
    ShopOutlined: D,
    CheckCircleOutlined: Y,
    LoadingOutlined: c
  } = y().antdIcons || {}, { Text: u, Paragraph: o, Title: w } = v, [H, q] = l("skills"), [L, te] = l([]), [Q, s] = l([]), [G, R] = l([]), [F, A] = l(""), [I, K] = l(""), [Z, h] = l(!1), [ae, se] = l(!1), [ye, fe] = l(
    {}
  ), [d, ne] = l(null), [re, oe] = l({}), [b, V] = l([]), [X, C] = l(""), [J, ce] = l(""), de = n(null);
  r(() => {
    Promise.all([
      $t().catch(() => []),
      Rt("zh").catch(() => []),
      Pe().catch(() => [])
    ]).then(([p, le, ie]) => {
      te(p), s(le), V(ie), ie.length > 0 && C(ie[0].id);
    });
  }, []);
  const ue = t(
    async (p, le, ie) => {
      h(!0);
      try {
        const pe = await Mt(
          p,
          ie,
          20,
          "zh",
          le || void 0
        );
        ie === void 0 || Object.keys(ie).length === 0 ? R(pe.results) : R((me) => [...me, ...pe.results]);
        const Se = Object.values(pe.by_provider || {}).some(
          (me) => me.has_more
        );
        se(Se);
        const ge = {};
        for (const [me, he] of Object.entries(pe.by_provider || {}))
          ge[me] = (ie[me] || 1) + 1;
        if (fe(ge), pe.errors.length > 0)
          for (const me of pe.errors)
            console.warn(
              `[ugsci] Market provider '${me.provider}' error: ${me.message}`
            );
      } catch (pe) {
        g.error(pe.message || "搜索市场失败"), R([]);
      } finally {
        h(!1);
      }
    },
    []
  );
  r(() => (de.current && clearTimeout(de.current), de.current = setTimeout(() => {
    ue(F, I, {});
  }, 400), () => {
    de.current && clearTimeout(de.current);
  }), [F, I, ue]);
  const Ee = () => {
    ue(F, I, ye);
  }, $e = async (p) => {
    var ie;
    if (!X) {
      g.warning("请先选择安装目标专家");
      return;
    }
    const le = `${p.source}:${p.slug}`;
    try {
      oe((ge) => ({ ...ge, [le]: "starting" }));
      const pe = await At(
        X,
        p.source_url,
        !0
      );
      oe((ge) => ({ ...ge, [le]: "installing" }));
      const Se = 60;
      for (let ge = 0; ge < Se; ge++) {
        await new Promise((he) => setTimeout(he, 2e3));
        const me = await Lt(
          X,
          pe.task_id
        );
        if (me.status === "completed" && ((ie = me.result) != null && ie.installed)) {
          g.success(`技能「${me.result.name || p.name}」安装成功`), oe((he) => {
            const be = { ...he };
            return delete be[le], be;
          });
          return;
        }
        if (me.status === "failed")
          throw new Error(me.error || "安装失败");
        if (me.status === "cancelled") {
          g.info("安装已取消"), oe((he) => {
            const be = { ...he };
            return delete be[le], be;
          });
          return;
        }
      }
      throw new Error("安装超时");
    } catch (pe) {
      g.error(pe.message || "安装技能失败"), oe((Se) => {
        const ge = { ...Se };
        return delete ge[le], ge;
      });
    }
  }, Je = (p) => {
    window.history.pushState({}, "", p), window.dispatchEvent(new PopStateEvent("popstate"));
  }, Re = L.filter((p) => p.available), Ke = e.createElement(
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
      e.createElement(T, {
        placeholder: "搜索技能市场...",
        prefix: M ? e.createElement(M) : void 0,
        value: F,
        onChange: (p) => A(p.target.value),
        allowClear: !0,
        style: { flex: 1, minWidth: 200, maxWidth: 400 }
      }),
      Q.length > 0 ? e.createElement(z, {
        value: I || void 0,
        onChange: (p) => K(p || ""),
        placeholder: "全部分类",
        allowClear: !0,
        style: { minWidth: 150 },
        options: [
          { value: "", label: "全部分类" },
          ...Q.map((p) => ({ value: p.id, label: p.label }))
        ]
      }) : null,
      // Install target selector
      e.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 4 } },
        e.createElement(
          u,
          { type: "secondary", style: { fontSize: 12 } },
          "安装到"
        ),
        e.createElement(z, {
          value: X || void 0,
          onChange: (p) => C(p),
          style: { minWidth: 140 },
          placeholder: "选择专家",
          options: b.map((p) => ({ value: p.id, label: p.name }))
        })
      )
    ),
    // Provider badges
    Re.length > 0 ? e.createElement(
      "div",
      {
        style: {
          marginBottom: 12,
          display: "flex",
          gap: 4,
          flexWrap: "wrap"
        }
      },
      ...Re.map(
        (p) => e.createElement(
          W,
          {
            key: p.key,
            color: p.supports_browse ? "blue" : "default",
            style: { fontSize: 11 }
          },
          `${p.label}${p.supports_browse ? "" : " (搜索)"}`
        )
      )
    ) : null,
    // Results grid
    Z && G.length === 0 ? e.createElement(
      "div",
      { style: { textAlign: "center", padding: 60 } },
      e.createElement(i, { size: "large" })
    ) : G.length === 0 ? e.createElement(f, {
      description: F ? `未找到匹配「${F}」的技能` : "输入关键词搜索技能市场",
      image: f.PRESENTED_IMAGE_SIMPLE
    }) : e.createElement(
      k,
      { gutter: [12, 12] },
      ...G.map((p) => {
        const le = `${p.source}:${p.slug}`, ie = re[le];
        return e.createElement(
          E,
          { key: le, xs: 24, sm: 12, md: 8, lg: 6 },
          e.createElement(
            x,
            {
              hoverable: !0,
              size: "small",
              style: { height: "100%", cursor: "pointer" },
              onClick: () => ne(p)
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
              p.icon_url ? e.createElement("img", {
                src: p.icon_url,
                alt: p.name,
                style: { width: 24, height: 24, borderRadius: 4 }
              }) : e.createElement(
                "span",
                { style: { fontSize: 18 } },
                "📦"
              ),
              e.createElement(
                B,
                { title: p.name },
                e.createElement(
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
                  p.name
                )
              )
            ),
            e.createElement(
              o,
              {
                type: "secondary",
                style: { fontSize: 11, margin: 0, lineHeight: 1.4 },
                ellipsis: { rows: 2 }
              },
              p.description || "暂无描述"
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
                  W,
                  { color: "geekblue", style: { fontSize: 10 } },
                  p.source
                ),
                p.version ? e.createElement(
                  W,
                  { style: { fontSize: 10 } },
                  `v${p.version}`
                ) : null
              ),
              ie ? e.createElement(
                S,
                {
                  size: "small",
                  disabled: !0,
                  icon: c ? e.createElement(c) : void 0
                },
                ie === "starting" ? "启动中" : "安装中"
              ) : e.createElement(
                S,
                {
                  type: "primary",
                  size: "small",
                  icon: j ? e.createElement(j) : void 0,
                  onClick: (pe) => {
                    pe.stopPropagation(), $e(p);
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
    ae && !Z ? e.createElement(
      "div",
      { style: { textAlign: "center", marginTop: 16 } },
      e.createElement(
        S,
        { onClick: Ee, loading: Z },
        "加载更多"
      )
    ) : null,
    // Detail Drawer
    d ? e.createElement(
      U,
      {
        title: e.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 8 } },
          d.icon_url ? e.createElement("img", {
            src: d.icon_url,
            alt: d.name,
            style: { width: 28, height: 28, borderRadius: 4 }
          }) : e.createElement(
            "span",
            { style: { fontSize: 20 } },
            "📦"
          ),
          e.createElement("span", null, d.name)
        ),
        open: !0,
        onClose: () => ne(null),
        width: 480,
        extra: e.createElement(
          S,
          {
            type: "primary",
            icon: j ? e.createElement(j) : void 0,
            onClick: () => {
              $e(d);
            }
          },
          "安装到专家"
        )
      },
      e.createElement(
        _,
        { column: 1, bordered: !0, size: "small" },
        e.createElement(
          _.Item,
          { label: "来源" },
          d.source
        ),
        e.createElement(
          _.Item,
          { label: "描述" },
          d.description || "-"
        ),
        d.version ? e.createElement(
          _.Item,
          { label: "版本" },
          d.version
        ) : null,
        d.author ? e.createElement(
          _.Item,
          { label: "作者" },
          d.author
        ) : null,
        e.createElement(
          _.Item,
          { label: "来源链接" },
          e.createElement(
            "a",
            { href: d.source_url, target: "_blank" },
            d.source_url
          )
        )
      ),
      d.stats ? e.createElement(
        "div",
        { style: { marginTop: 16 } },
        e.createElement(
          u,
          {
            strong: !0,
            style: { display: "block", marginBottom: 8 }
          },
          "统计"
        ),
        e.createElement(
          "div",
          { style: { display: "flex", gap: 12, flexWrap: "wrap" } },
          ...Object.entries(d.stats).map(
            ([p, le]) => e.createElement(
              "div",
              { key: p, style: { textAlign: "center" } },
              e.createElement(
                "div",
                {
                  style: {
                    fontSize: 18,
                    fontWeight: 600,
                    color: "#1677ff"
                  }
                },
                String(le)
              ),
              e.createElement(
                u,
                { type: "secondary", style: { fontSize: 11 } },
                p
              )
            )
          )
        )
      ) : null
    ) : null
  ), Xe = a(() => {
    if (!J.trim()) return ke;
    const p = J.toLowerCase();
    return ke.filter(
      (le) => le.name.toLowerCase().includes(p) || le.description.toLowerCase().includes(p) || le.category.toLowerCase().includes(p)
    );
  }, [J]), qe = async (p) => {
    try {
      const le = await ee("/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: p.name,
          description: p.description,
          skill_names: p.recommendedSkills
        })
      });
      await Oe(le.id, "AGENTS.md", p.systemPrompt);
      const ie = await Ce(le.id);
      ie.approval_level = p.approvalLevel, await ee(`/agents/${encodeURIComponent(le.id)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ie)
      }), g.success(`专家「${p.name}」创建成功，已跳转至专家中心`), Je("/ugsci-experts");
    } catch (le) {
      g.error(le.message || "创建专家失败");
    }
  }, Ye = e.createElement(
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
        u,
        { style: { fontSize: 13, color: "#1f4e8c" } },
        "从专家模板库选择预设专家，一键创建并配置系统提示词、审批级别和推荐技能。未来将支持从远程市场获取更多行业专家模板。"
      )
    ),
    e.createElement(T, {
      placeholder: "搜索专家模板...",
      prefix: M ? e.createElement(M) : void 0,
      value: J,
      onChange: (p) => ce(p.target.value),
      allowClear: !0,
      style: { marginBottom: 16, maxWidth: 400 }
    }),
    e.createElement(
      k,
      { gutter: [12, 12] },
      ...Xe.map(
        (p) => e.createElement(
          E,
          { key: p.id, xs: 24, sm: 12, md: 8 },
          e.createElement(
            x,
            {
              hoverable: !0,
              size: "small",
              style: { height: "100%", cursor: "pointer" },
              onClick: () => qe(p)
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
                p.emoji
              ),
              e.createElement(
                "div",
                { style: { flex: 1 } },
                e.createElement(
                  u,
                  { strong: !0, style: { fontSize: 14 } },
                  p.name
                ),
                e.createElement(
                  "div",
                  { style: { display: "flex", gap: 4, marginTop: 4 } },
                  e.createElement(
                    W,
                    { color: "blue", style: { fontSize: 10 } },
                    p.category
                  ),
                  p.approvalLevel === "MANUAL" ? e.createElement(
                    W,
                    { color: "orange", style: { fontSize: 10 } },
                    "需审批"
                  ) : e.createElement(
                    W,
                    { color: "green", style: { fontSize: 10 } },
                    "自动"
                  )
                )
              )
            ),
            e.createElement(
              o,
              {
                type: "secondary",
                style: { fontSize: 12, margin: 0, lineHeight: 1.5 },
                ellipsis: { rows: 3 }
              },
              p.description.replace(/\*\*(.+?)\*\*/g, "$1")
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
                u,
                { type: "secondary", style: { fontSize: 11 } },
                `推荐 ${p.recommendedSkills.length} 个技能`
              ),
              e.createElement(
                S,
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
      D ? e.createElement(D, {
        style: { fontSize: 24, color: "#bfbfbf", marginBottom: 8 }
      }) : null,
      e.createElement(
        u,
        { type: "secondary", style: { fontSize: 12 } },
        "更多专家模板持续更新中，未来将支持 OpenScience、RPA 等行业扩展"
      )
    )
  ), Qe = [
    {
      key: "skills",
      label: e.createElement(
        "span",
        null,
        O ? e.createElement(O) : null,
        " 技能市场"
      ),
      children: Ke
    },
    {
      key: "experts",
      label: e.createElement("span", null, "🧑‍🔬 专家模板"),
      children: Ye
    }
  ];
  return e.createElement(
    "div",
    { style: { padding: 24 } },
    e.createElement(Te, {
      title: "市场",
      subtitle: "浏览技能市场 · 选择专家模板 · 随时更新能力和专家",
      extra: e.createElement(
        S,
        {
          icon: $ ? e.createElement($) : void 0,
          onClick: () => ue(F, I, {}),
          loading: Z
        },
        "刷新"
      )
    }),
    e.createElement(N, {
      items: Qe,
      activeKey: H,
      onChange: (p) => q(p)
    })
  );
}
function jt() {
  var S;
  const e = window.QwenPaw;
  if (!(e != null && e.menu) || !(e != null && e.route)) {
    console.warn(
      "[ugsci] QwenPaw.menu/route API not available — plugin disabled"
    );
    return;
  }
  const l = y().React, r = "ugsci", t = y().antdIcons || {}, a = t.UserSwitchOutlined, n = t.ToolOutlined, i = t.ThunderboltOutlined, f = t.ShopOutlined;
  e.route.add(r, {
    id: "ugsci.experts",
    path: "/ugsci-experts",
    component: vt
  }), e.menu.add(r, {
    id: "ugsci.experts",
    location: "primary.agentScoped",
    label: () => "专家",
    icon: a ? l.createElement(a, { style: { fontSize: 16 } }) : void 0,
    route: "ugsci.experts",
    order: 5,
    visible: () => ve()
  }), e.route.add(r, {
    id: "ugsci.capabilities",
    path: "/ugsci-capabilities",
    component: It
  }), e.menu.add(r, {
    id: "ugsci.capabilities",
    location: "primary.agentScoped",
    label: () => "工具",
    icon: n ? l.createElement(n, { style: { fontSize: 16 } }) : void 0,
    route: "ugsci.capabilities",
    order: 6,
    visible: () => ve()
  }), e.route.add(r, {
    id: "ugsci.skills-center",
    path: "/ugsci-skills",
    component: Ot
  }), e.menu.add(r, {
    id: "ugsci.skills-center",
    location: "primary.agentScoped",
    label: () => "技能",
    icon: i ? l.createElement(i, { style: { fontSize: 16 } }) : void 0,
    route: "ugsci.skills-center",
    order: 7,
    visible: () => ve()
  }), e.route.add(r, {
    id: "ugsci.market",
    path: "/ugsci-market",
    component: Bt
  }), e.menu.add(r, {
    id: "ugsci.market",
    location: "primary.agentScoped",
    label: () => "市场",
    icon: f ? l.createElement(f, { style: { fontSize: 16 } }) : void 0,
    route: "ugsci.market",
    order: 8,
    visible: () => ve()
  }), (S = e.sidebar) != null && S.registerSimpleModeItems ? (e.sidebar.registerSimpleModeItems([
    "ugsci.experts",
    "ugsci.capabilities",
    "ugsci.skills-center",
    "ugsci.market"
  ]), console.info("[ugsci] Registered 4 items for simple-mode visibility")) : console.warn(
    "[ugsci] window.QwenPaw.sidebar.registerSimpleModeItems not available — items will not appear in simple mode"
  );
  const T = [
    "core.skills",
    "core.tools",
    "core.mcp",
    "core.acp",
    "core.agent-config",
    "core.agent-stats",
    "core.skill-pool"
  ];
  for (const g of T) {
    try {
      const E = e.menu.snapshot("primary.agentScoped").find((x) => x.id === g);
      E && e.menu.replace(r, g, {
        ...E,
        visible: () => !ve()
      });
    } catch {
    }
    try {
      const E = e.menu.snapshot("primary.settings").find((x) => x.id === g);
      E && e.menu.replace(r, g, {
        ...E,
        visible: () => !ve()
      });
    } catch {
    }
  }
  console.info(
    "[ugsci] Plugin registered: 4 routes + menu items, simple-mode whitelist + simplified navigation active"
  );
}
function Ie() {
  try {
    jt();
  } catch (e) {
    console.error("[ugsci] Failed to build plugin:", e), setTimeout(Ie, 500);
  }
}
var je;
if ((je = window.QwenPaw) != null && je.host)
  Ie();
else {
  const e = setInterval(() => {
    var l;
    (l = window.QwenPaw) != null && l.host && (clearInterval(e), Ie());
  }, 200);
  setTimeout(() => clearInterval(e), 1e4);
}
