function u() {
  var l;
  const e = (l = window.QwenPaw) == null ? void 0 : l.host;
  if (!e) throw new Error("[ugsci] QwenPaw.host not available");
  return e;
}
function et() {
  try {
    return u().getApiToken() || "";
  } catch {
    return "";
  }
}
function Ne(e) {
  return u().getApiUrl(e);
}
function Fe(e) {
  const l = et();
  return {
    "Content-Type": "application/json",
    ...l ? { Authorization: `Bearer ${l}` } : {},
    ...e
  };
}
async function ne(e, l) {
  const r = await fetch(Ne(e), {
    ...l,
    headers: { ...Fe(), ...(l == null ? void 0 : l.headers) || {} }
  });
  if (!r.ok) {
    const t = await r.text().catch(() => "");
    throw new Error(t || `HTTP ${r.status}`);
  }
  return r.status === 204 ? null : r.json();
}
async function Oe() {
  const e = await ne("/agents");
  return (e == null ? void 0 : e.agents) || [];
}
async function Te(e) {
  return ne(`/agents/${encodeURIComponent(e)}`);
}
async function Ue(e) {
  return await ne("/skills", {
    headers: { "X-Agent-Id": e }
  }) || [];
}
async function We() {
  return await ne("/skills/pool") || [];
}
async function tt() {
  return await ne("/skills/workspaces") || [];
}
async function He() {
  return await ne("/mcp") || [];
}
function nt(e) {
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
  const r = u();
  return r.ReactMarkdown && r.remarkGfm ? l.createElement(
    r.ReactMarkdown,
    { remarkPlugins: [r.remarkGfm] },
    e
  ) : e.replace(/\*\*(.+?)\*\*/g, "$1").replace(/\*(.+?)\*/g, "$1").replace(/`(.+?)`/g, "$1").replace(/^#+\s*/gm, "").replace(/^[-*]\s+/gm, "• ");
}
const ze = [
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
], Ge = "ugsci_custom_teams";
function we() {
  try {
    const e = localStorage.getItem(Ge);
    return e ? JSON.parse(e) : [];
  } catch {
    return [];
  }
}
function Ve(e) {
  try {
    localStorage.setItem(Ge, JSON.stringify(e));
  } catch {
  }
}
const lt = [
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
async function at(e, l) {
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
  await fetch(Ne("/console/chat"), {
    method: "POST",
    headers: {
      ...Fe(),
      "X-Agent-Id": e
    },
    body: JSON.stringify(r)
  });
}
function Ce(e, l) {
  const r = e.find(
    (a) => a.name === l || a.name === l.replace(/\s+/g, "")
  );
  if (r) return r.id;
  const t = e.find(
    (a) => a.name.includes(l) || l.includes(a.name) || a.name.replace(/\s+/g, "").includes(l.replace(/\s+/g, ""))
  );
  return t ? t.id : null;
}
function rt(e) {
  var r;
  const l = e.members.map((t) => `- ${t.emoji} ${t.name}（${t.role}）`).join(`
`);
  if (e.custom && e.steps && e.steps.length > 0) {
    const t = e.steps.map((n, i) => {
      const v = n.passContext ? "（传递上一步的结果作为上下文）" : "（独立执行，不传递上下文）";
      return `${i + 1}. 向「${n.agentName}」发送请求：${n.instruction} ${v}`;
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
function ot({ team: e }) {
  const l = u().React, { Typography: r, Tag: t } = u().antd, { Text: a } = r, n = {
    pipeline: "→",
    roundtable: "⇄",
    coordinator: "⊙"
  }, i = {
    pipeline: "#13c2c2",
    roundtable: "#722ed1",
    coordinator: "#1677ff"
  }, v = e.steps || [], T = v.length > 0;
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
      ...T ? v.map((w, g) => {
        const I = e.members.find(
          (f) => f.name === w.agentName
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
              (I == null ? void 0 : I.emoji) || "👤"
            ),
            l.createElement(
              "div",
              null,
              l.createElement(
                a,
                { strong: !0, style: { fontSize: 12 } },
                w.agentName
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
                w.instruction
              ),
              w.passContext ? l.createElement(
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
      }).flat() : e.members.map((w, g) => [
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
          l.createElement("span", { style: { fontSize: 16 } }, w.emoji),
          l.createElement(
            "div",
            null,
            l.createElement(
              a,
              { strong: !0, style: { fontSize: 12 } },
              w.name
            ),
            l.createElement(
              "div",
              { style: { fontSize: 11, color: "#8c8c8c" } },
              w.role
            )
          )
        )
      ]).flat()
    )
  );
}
function st({
  open: e,
  onClose: l,
  agents: r,
  editingTeam: t,
  onSaved: a
}) {
  const n = u().React, { useState: i, useEffect: v, useCallback: T } = n, {
    Modal: w,
    Input: g,
    Button: I,
    Select: f,
    Tag: C,
    Typography: W,
    Switch: j,
    Empty: S,
    message: z,
    Divider: N,
    Steps: _
  } = u().antd, { PlusOutlined: M, DeleteOutlined: d, SaveOutlined: P, ArrowRightOutlined: R } = u().antdIcons || {}, { Text: O, Paragraph: L } = W, [F, $] = i(""), [G, m] = i("🤝"), [y, s] = i(""), [c, H] = i(
    "pipeline"
  ), [q, Y] = i(""), [V, ee] = i(""), [o, J] = i([]), [A, X] = i([]), [Q, E] = i(!1);
  v(() => {
    e && (t ? ($(t.name), m(t.emoji), s(t.description), H(t.mode), Y(t.coordinatorName || ""), ee(t.taskTemplate), J(t.steps || []), X(t.members.map((k) => k.name))) : ($(""), m("🤝"), s(""), H("pipeline"), Y(""), ee(`请执行以下任务：
任务描述：{任务描述}`), J([]), X([])));
  }, [e, t]);
  const B = T(() => {
    if (c === "roundtable") {
      const k = A.map((U) => ({
        agentName: U,
        instruction: "请给出你的专业评估意见",
        passContext: !1
      }));
      J(k);
    } else if (c === "pipeline") {
      const k = new Map(o.map((re) => [re.agentName, re])), U = A.map((re) => k.get(re) || {
        agentName: re,
        instruction: "请完成你的专业部分",
        passContext: !0
      });
      J(U);
    }
  }, [c, A, o]), Z = (k) => {
    A.includes(k) || (X([...A, k]), c === "coordinator" && !q && Y(k));
  }, h = (k) => {
    X(A.filter((U) => U !== k)), J(o.filter((U) => U.agentName !== k)), q === k && Y(A[0] || "");
  }, le = (k, U, re) => {
    const me = [...o];
    me[k] = { ...me[k], [U]: re }, J(me);
  }, oe = () => {
    if (!F.trim()) {
      z.warning("请输入团队名称");
      return;
    }
    if (A.length < 2) {
      z.warning("至少需要选择 2 个成员");
      return;
    }
    if (!V.trim()) {
      z.warning("请输入任务模板");
      return;
    }
    if (c === "coordinator" && !q) {
      z.warning("请选择协调者");
      return;
    }
    E(!0);
    try {
      const k = A.map(
        (b) => {
          var x;
          const D = r.find((K) => K.name === b);
          return {
            name: b,
            role: ((x = D == null ? void 0 : D.description) == null ? void 0 : x.slice(0, 30)) || "团队成员",
            emoji: "👤"
          };
        }
      );
      let U = o;
      (o.length === 0 || o.length !== A.length) && (U = A.map((b) => ({
        agentName: b,
        instruction: "请完成你的专业部分",
        passContext: c === "pipeline"
      })));
      const re = {
        id: (t == null ? void 0 : t.id) || `custom-${Date.now()}`,
        name: F.trim(),
        emoji: G,
        category: "自定义",
        description: y.trim() || `${F.trim()}（${A.length}人团队）`,
        mode: c,
        members: k,
        coordinatorName: c === "coordinator" ? q : void 0,
        taskTemplate: V.trim(),
        orchestrationPrompt: "",
        // Custom teams use steps-based instructions
        steps: U,
        custom: !0,
        createdAt: (t == null ? void 0 : t.createdAt) || Date.now()
      }, me = we(), pe = me.findIndex((b) => b.id === re.id);
      pe >= 0 ? me[pe] = re : me.push(re), Ve(me), z.success(t ? "团队已更新" : "团队已创建"), a(), l();
    } catch (k) {
      z.error(k.message || "保存失败");
    } finally {
      E(!1);
    }
  }, fe = [
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
  ], ye = r.filter(
    (k) => !A.includes(k.name)
  );
  return n.createElement(
    w,
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
      onOk: oe,
      okText: "保存团队",
      confirmLoading: Q,
      okButtonProps: {
        icon: P ? n.createElement(P) : void 0
      }
    },
    // Step 1: Basic info
    n.createElement(
      "div",
      { style: { marginBottom: 16 } },
      n.createElement(
        O,
        {
          strong: !0,
          style: { display: "block", marginBottom: 8, fontSize: 13 }
        },
        "1. 基本信息"
      ),
      n.createElement(
        "div",
        { style: { display: "flex", gap: 8, marginBottom: 8 } },
        n.createElement(f, {
          value: G,
          onChange: (k) => m(k),
          style: { width: 60 },
          options: fe.map((k) => ({ value: k, label: k })),
          optionRender: (k) => n.createElement("span", { style: { fontSize: 18 } }, k.value)
        }),
        n.createElement(g, {
          placeholder: "团队名称（如：储层评价团队）",
          value: F,
          onChange: (k) => $(k.target.value),
          style: { flex: 1 }
        })
      ),
      n.createElement(g.TextArea, {
        placeholder: "团队描述（简述团队的目标和适用场景）",
        value: y,
        onChange: (k) => s(k.target.value),
        rows: 2,
        style: { marginBottom: 8 }
      }),
      n.createElement(
        "div",
        { style: { display: "flex", gap: 8, alignItems: "center" } },
        n.createElement(
          O,
          { type: "secondary", style: { fontSize: 12 } },
          "协同模式："
        ),
        n.createElement(f, {
          value: c,
          onChange: (k) => H(k),
          style: { width: 160 },
          options: [
            { value: "pipeline", label: "🔄 流水线（依次执行）" },
            { value: "roundtable", label: "🔀 圆桌讨论（独立评估）" },
            { value: "coordinator", label: "🎯 协调者（由协调者主导）" }
          ]
        })
      )
    ),
    n.createElement(N, { style: { margin: "12px 0" } }),
    // Step 2: Select members
    n.createElement(
      "div",
      { style: { marginBottom: 16 } },
      n.createElement(
        O,
        {
          strong: !0,
          style: { display: "block", marginBottom: 8, fontSize: 13 }
        },
        "2. 选择团队成员"
      ),
      // Available agents
      ye.length > 0 ? n.createElement(
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
        ...ye.map(
          (k) => n.createElement(
            I,
            {
              key: k.id,
              size: "small",
              icon: M ? n.createElement(M) : void 0,
              onClick: () => Z(k.name)
            },
            k.name
          )
        )
      ) : null,
      // Selected members
      A.length === 0 ? n.createElement(S, {
        description: "请从上方添加团队成员",
        image: S.PRESENTED_IMAGE_SIMPLE
      }) : n.createElement(
        "div",
        { style: { display: "flex", flexDirection: "column", gap: 4 } },
        ...A.map(
          (k) => n.createElement(
            "div",
            {
              key: k,
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
                O,
                { strong: !0, style: { fontSize: 13 } },
                k
              ),
              c === "coordinator" && q === k ? n.createElement(
                C,
                { color: "blue", style: { fontSize: 10 } },
                "协调者"
              ) : null
            ),
            n.createElement(
              "div",
              { style: { display: "flex", gap: 4 } },
              c === "coordinator" ? n.createElement(
                I,
                {
                  size: "small",
                  type: "link",
                  onClick: () => Y(k)
                },
                "设为协调者"
              ) : null,
              n.createElement(
                I,
                {
                  size: "small",
                  type: "link",
                  danger: !0,
                  icon: d ? n.createElement(d) : void 0,
                  onClick: () => h(k)
                },
                "移除"
              )
            )
          )
        )
      )
    ),
    n.createElement(N, { style: { margin: "12px 0" } }),
    // Step 3: Define execution steps (for pipeline/roundtable)
    A.length > 0 ? n.createElement(
      "div",
      { style: { marginBottom: 16 } },
      n.createElement(
        O,
        {
          strong: !0,
          style: { display: "block", marginBottom: 8, fontSize: 13 }
        },
        `3. 编排执行步骤${c === "roundtable" ? "（各步独立执行）" : c === "pipeline" ? "（依次执行，可传递上下文）" : "（由协调者决定调用顺序）"}`
      ),
      // Auto-sync button
      n.createElement(
        I,
        {
          size: "small",
          type: "dashed",
          onClick: B,
          style: { marginBottom: 8 }
        },
        "自动生成步骤"
      ),
      // Steps list
      o.length === 0 ? n.createElement(
        O,
        { type: "secondary", style: { fontSize: 12 } },
        "点击「自动生成步骤」或手动配置每步的指令"
      ) : n.createElement(
        "div",
        { style: { display: "flex", flexDirection: "column", gap: 6 } },
        ...o.map(
          (k, U) => n.createElement(
            "div",
            {
              key: U,
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
              c === "pipeline" ? n.createElement(
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
                `${U + 1}`
              ) : n.createElement(
                "span",
                { style: { fontSize: 14 } },
                "🔀"
              ),
              n.createElement(
                C,
                { color: "blue", style: { fontSize: 11 } },
                k.agentName
              ),
              n.createElement(
                "div",
                { style: { flex: 1 } },
                n.createElement(g, {
                  placeholder: "请输入该步骤的指令...",
                  value: k.instruction,
                  onChange: (re) => le(U, "instruction", re.target.value),
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
              n.createElement(j, {
                size: "small",
                checked: k.passContext,
                onChange: (re) => le(U, "passContext", re)
              }),
              n.createElement(
                O,
                { type: "secondary", style: { fontSize: 11 } },
                k.passContext ? "传递上一步结果作为上下文" : "独立执行"
              )
            )
          )
        )
      )
    ) : null,
    n.createElement(N, { style: { margin: "12px 0" } }),
    // Step 4: Task template
    n.createElement(
      "div",
      null,
      n.createElement(
        O,
        {
          strong: !0,
          style: { display: "block", marginBottom: 8, fontSize: 13 }
        },
        `${A.length > 0 ? "4" : "3"}. 任务模板`
      ),
      n.createElement(g.TextArea, {
        placeholder: `输入任务模板，可用 {参数名} 作为占位符...

例如：
请对区块 {区块名} 的井 {井号} 进行储层评价`,
        value: V,
        onChange: (k) => ee(k.target.value),
        rows: 4,
        style: { fontFamily: "monospace", fontSize: 13 }
      }),
      n.createElement(
        O,
        {
          type: "secondary",
          style: { fontSize: 11, display: "block", marginTop: 4 }
        },
        "占位符 {参数名} 在发起任务时可由用户填写替换"
      )
    )
  );
}
function Ae({
  team: e,
  agents: l,
  onLaunch: r,
  onEdit: t,
  onDelete: a
}) {
  var y;
  const n = u().React, { useState: i } = n, { Card: v, Tag: T, Typography: w, Button: g, Tooltip: I } = u().antd, {
    TeamOutlined: f,
    RocketOutlined: C,
    UserOutlined: W,
    EditOutlined: j,
    DeleteOutlined: S,
    DownOutlined: z,
    UpOutlined: N
  } = u().antdIcons || {}, { Text: _, Paragraph: M } = w, [d, P] = i(!1), R = {
    coordinator: { label: "协调者模式", color: "blue" },
    pipeline: { label: "流水线模式", color: "cyan" },
    roundtable: { label: "圆桌讨论", color: "purple" }
  }, O = R[e.mode] || R.coordinator, L = e.members.map((s) => {
    const c = Ce(l, s.name);
    return { ...s, found: !!c, agentId: c };
  }), F = L.filter((s) => s.found).length, $ = F === e.members.length, G = e.coordinatorName || ((y = e.members[0]) == null ? void 0 : y.name), m = G ? Ce(l, G) : null;
  return n.createElement(
    v,
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
            { color: O.color, style: { fontSize: 10 } },
            O.label
          ),
          n.createElement(
            T,
            { style: { fontSize: 10 } },
            `${F}/${e.members.length}`
          ),
          $ ? null : n.createElement(
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
          I,
          { title: "编辑" },
          n.createElement(g, {
            type: "text",
            size: "small",
            icon: j ? n.createElement(j) : void 0,
            onClick: (s) => {
              s.stopPropagation(), t(e);
            }
          })
        ) : null,
        a ? n.createElement(
          I,
          { title: "删除" },
          n.createElement(g, {
            type: "text",
            size: "small",
            danger: !0,
            icon: S ? n.createElement(S) : void 0,
            onClick: (s) => {
              s.stopPropagation(), a(e);
            }
          })
        ) : null
      ) : null
    ),
    // Description
    n.createElement(
      M,
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
      ...L.map(
        (s) => n.createElement(
          I,
          {
            key: s.name,
            title: `${s.name}（${s.role}）${s.found ? "" : " - 未创建"}`
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
                background: s.found ? "#f0f5ff" : "#fff2f0",
                border: `1px solid ${s.found ? "#d6e4ff" : "#ffccc7"}`,
                fontSize: 11
              }
            },
            n.createElement("span", null, s.emoji),
            n.createElement(
              _,
              {
                style: { fontSize: 11, color: s.found ? "#1f4e8c" : "#cf1322" }
              },
              s.name
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
        onClick: (s) => {
          s.stopPropagation(), P(!d);
        },
        icon: d ? N ? n.createElement(N) : "▲" : z ? n.createElement(z) : "▼"
      },
      d ? "收起流程" : "查看执行流程"
    ),
    d ? n.createElement(ot, { team: e }) : null,
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
        G ? `协调者: ${G}` : ""
      ),
      n.createElement(
        g,
        {
          type: "primary",
          size: "small",
          icon: C ? n.createElement(C) : void 0,
          disabled: !m,
          onClick: () => r(e)
        },
        "发起团队任务"
      )
    )
  );
}
function it({
  agents: e,
  onLaunch: l
}) {
  const r = u().React, { useMemo: t, useState: a, useCallback: n, useEffect: i } = r, {
    Row: v,
    Col: T,
    Input: w,
    Empty: g,
    Typography: I,
    Tag: f,
    Button: C,
    Divider: W,
    message: j,
    Popconfirm: S
  } = u().antd, { SearchOutlined: z, TeamOutlined: N, PlusOutlined: _, RocketOutlined: M } = u().antdIcons || {}, { Text: d } = I, [P, R] = a(""), [O, L] = a([]), [F, $] = a(!1), [G, m] = a(null);
  i(() => {
    L(we());
  }, []);
  const y = n(() => {
    L(we());
  }, []), s = n(
    (o) => {
      const A = we().filter((X) => X.id !== o.id);
      Ve(A), L(A), j.success(`团队「${o.name}」已删除`);
    },
    [j]
  ), c = n((o) => {
    m(o), $(!0);
  }, []), H = n(() => {
    m(null), $(!0);
  }, []), q = t(() => [...O, ...lt], [O]), Y = t(() => {
    if (!P.trim()) return q;
    const o = P.toLowerCase();
    return q.filter(
      (J) => J.name.toLowerCase().includes(o) || J.description.toLowerCase().includes(o) || J.category.toLowerCase().includes(o)
    );
  }, [q, P]), V = Y.filter((o) => o.custom), ee = Y.filter((o) => !o.custom);
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
        d,
        { style: { fontSize: 13, color: "#389e0d" } },
        "多智能体协同 — 选择预设团队或创建自定义团队，支持流水线、圆桌讨论、协调者三种编排模式。"
      ),
      r.createElement(
        C,
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
    r.createElement(w, {
      placeholder: "搜索团队名称、描述或类别...",
      prefix: z ? r.createElement(z) : void 0,
      value: P,
      onChange: (o) => R(o.target.value),
      allowClear: !0,
      style: { marginBottom: 16, maxWidth: 400 }
    }),
    // Custom teams section
    V.length > 0 ? r.createElement(
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
        r.createElement("span", { style: { fontSize: 16 } }),
        r.createElement(
          d,
          { strong: !0, style: { fontSize: 14 } },
          `自定义团队 (${V.length})`
        )
      ),
      r.createElement(
        v,
        { gutter: [12, 12] },
        ...V.map(
          (o) => r.createElement(
            T,
            { key: o.id, xs: 24, sm: 12, md: 8 },
            r.createElement(Ae, {
              team: o,
              agents: e,
              onLaunch: l,
              onEdit: c,
              onDelete: s
            })
          )
        )
      ),
      r.createElement(W, { style: { margin: "16px 0" } })
    ) : null,
    // Preset teams section
    ee.length > 0 ? r.createElement(
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
        r.createElement("span", { style: { fontSize: 16 } }),
        r.createElement(
          d,
          { strong: !0, style: { fontSize: 14 } },
          `预设团队 (${ee.length})`
        ),
        r.createElement(
          d,
          { type: "secondary", style: { fontSize: 12 } },
          "· 行业典型工作流模板"
        )
      ),
      r.createElement(
        v,
        { gutter: [12, 12] },
        ...ee.map(
          (o) => r.createElement(
            T,
            { key: o.id, xs: 24, sm: 12, md: 8 },
            r.createElement(Ae, {
              team: o,
              agents: e,
              onLaunch: l
            })
          )
        )
      )
    ) : null,
    // Empty state
    Y.length === 0 ? r.createElement(g, {
      description: "未找到匹配的专家团队，点击「创建专家团」自定义",
      image: g.PRESENTED_IMAGE_SIMPLE
    }) : null,
    // Team Builder Modal
    r.createElement(st, {
      open: F,
      onClose: () => {
        $(!1), m(null);
      },
      agents: e,
      editingTeam: G,
      onSaved: y
    })
  );
}
function ct(e) {
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
async function mt(e) {
  return await ne("/workspace/files", {
    headers: { "X-Agent-Id": e }
  }) || [];
}
async function $e(e, l, r) {
  await ne(`/workspace/files/${encodeURIComponent(l)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify({ content: r })
  });
}
async function Le(e, l) {
  const r = await Te(e);
  r.system_prompt_files = l, await ne(`/agents/${encodeURIComponent(e)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(r)
  });
}
async function dt(e, l) {
  await ne("/skills/pool/download", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      skill_name: l,
      targets: [{ workspace_id: e }],
      overwrite: !1
    })
  });
}
async function pt(e, l) {
  await ne(`/skills/${encodeURIComponent(l)}`, {
    method: "DELETE",
    headers: { "X-Agent-Id": e }
  });
}
async function ut(e, l) {
  await ne(`/mcp/${encodeURIComponent(l)}`, {
    method: "DELETE",
    headers: { "X-Agent-Id": e }
  });
}
const Be = ["AGENTS.md", "SOUL.md", "PROFILE.md"];
function ke({
  title: e,
  subtitle: l,
  extra: r
}) {
  const t = u().React, { Space: a } = u().antd;
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
function je({
  items: e,
  max: l = 5,
  color: r = "blue",
  emptyText: t = "无"
}) {
  const a = u().React, { Tag: n } = u().antd;
  return !e || e.length === 0 ? a.createElement(
    "span",
    { style: { fontSize: 12, color: "#bfbfbf" } },
    t
  ) : a.createElement(
    "div",
    { style: { display: "flex", flexWrap: "wrap", gap: 4 } },
    ...e.slice(0, l).map(
      (i, v) => a.createElement(
        n,
        { key: v, color: r, style: { fontSize: 11, marginRight: 0 } },
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
function gt({
  open: e,
  onClose: l,
  poolSkills: r,
  installedSkillNames: t,
  loading: a,
  onInstall: n
}) {
  const i = u().React, { useState: v, useEffect: T, useMemo: w } = i, { Modal: g, Button: I, Empty: f, Spin: C, Input: W, Tag: j, Tooltip: S, Typography: z } = u().antd, { CheckOutlined: N, SearchOutlined: _ } = u().antdIcons || {}, { Text: M } = z, [d, P] = v([]), [R, O] = v("");
  T(() => {
    e && (P([]), O(""));
  }, [e]);
  const L = w(() => {
    if (!R.trim()) return r;
    const m = R.toLowerCase();
    return r.filter(
      (y) => {
        var s, c;
        return y.name.toLowerCase().includes(m) || ((s = y.description) == null ? void 0 : s.toLowerCase().includes(m)) || ((c = y.tags) == null ? void 0 : c.some((H) => H.toLowerCase().includes(m)));
      }
    );
  }, [r, R]), F = L.filter(
    (m) => !t.includes(m.name)
  ), $ = (m) => {
    P(
      (y) => y.includes(m) ? y.filter((s) => s !== m) : [...y, m]
    );
  }, G = async () => {
    d.length !== 0 && (await n(d), P([]));
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
          M,
          { type: "secondary", style: { fontSize: 13 } },
          `已选择 ${d.length} 个技能`
        ),
        i.createElement(
          "div",
          { style: { display: "flex", gap: 8 } },
          i.createElement(I, { onClick: l }, "取消"),
          i.createElement(
            I,
            {
              type: "primary",
              onClick: G,
              disabled: d.length === 0
            },
            d.length > 0 ? `添加 (${d.length})` : "添加"
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
        value: R,
        onChange: (m) => O(m.target.value),
        allowClear: !0,
        style: { flex: 1 }
      }),
      i.createElement(
        I,
        {
          size: "small",
          type: "primary",
          onClick: () => P(F.map((m) => m.name))
        },
        "全选"
      ),
      i.createElement(
        I,
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
      i.createElement(C, { size: "large" })
    ) : L.length === 0 ? i.createElement(f, {
      description: R ? "未找到匹配的技能" : "技能池暂无可用技能",
      image: f.PRESENTED_IMAGE_SIMPLE
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
      ...L.map((m) => {
        const y = d.includes(m.name), s = t.includes(m.name);
        return i.createElement(
          "div",
          {
            key: m.name,
            onClick: () => !s && $(m.name),
            style: {
              position: "relative",
              padding: "10px 12px",
              border: `1px solid ${y ? "#0072f5" : "#e8e8e8"}`,
              borderRadius: 6,
              cursor: s ? "not-allowed" : "pointer",
              transition: "all 0.15s ease",
              background: y ? "rgba(0, 114, 245, 0.06)" : s ? "#fafafa" : "#fff",
              opacity: s ? 0.5 : 1,
              minHeight: 64
            }
          },
          y ? i.createElement(
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
            N ? i.createElement(N) : "✓"
          ) : null,
          s ? i.createElement(
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
                paddingRight: s || y ? 24 : 0
              }
            },
            i.createElement(
              "span",
              { style: { fontSize: 16 } },
              m.emoji || "⚡"
            ),
            i.createElement(
              S,
              { title: m.name },
              i.createElement(
                M,
                {
                  strong: !0,
                  style: {
                    fontSize: 13,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap"
                  }
                },
                m.name
              )
            )
          ),
          m.description ? i.createElement(
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
            m.description
          ) : null,
          m.tags && m.tags.length > 0 ? i.createElement(
            "div",
            {
              style: {
                marginTop: 4,
                display: "flex",
                gap: 2,
                flexWrap: "wrap"
              }
            },
            ...m.tags.slice(0, 2).map(
              (c, H) => i.createElement(
                j,
                {
                  key: H,
                  color: "cyan",
                  style: { fontSize: 10, marginRight: 0 }
                },
                c
              )
            )
          ) : null
        );
      })
    )
  );
}
function yt({
  expert: e,
  onClick: l,
  onSummon: r
}) {
  const t = u().React, { Card: a, Tag: n, Badge: i, Typography: v, Spin: T, Button: w } = u().antd, { Text: g } = v, { ThunderboltOutlined: I } = u().antdIcons || {}, { agent: f, skills: C, mcps: W, loading: j } = e, S = f.enabled, z = C.filter((M) => M.enabled !== !1).map((M) => M.name), N = W.map((M) => M.name || M.key), _ = f.active_model ? `${f.active_model.provider_id}/${f.active_model.model}` : null;
  return t.createElement(
    a,
    {
      hoverable: !0,
      onClick: l,
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
            f.name
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
            f.id
          )
        )
      ),
      t.createElement(i, {
        status: S ? "success" : "default",
        text: S ? "启用" : "停用"
      })
    ),
    // Description (rendered as markdown)
    f.description ? t.createElement(
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
      _e(f.description, t)
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
    j ? t.createElement(T, { size: "small" }) : t.createElement(
      "div",
      { style: { marginBottom: 6 } },
      t.createElement(
        "div",
        { style: { fontSize: 11, color: "#8c8c8c", marginBottom: 4 } },
        `技能 (${z.length})`
      ),
      t.createElement(je, {
        items: z,
        max: 4,
        color: "cyan",
        emptyText: "未配置技能"
      })
    ),
    // MCP
    !j && N.length > 0 ? t.createElement(
      "div",
      { style: { marginTop: "auto" } },
      t.createElement(
        "div",
        { style: { fontSize: 11, color: "#8c8c8c", marginBottom: 4 } },
        `MCP (${N.length})`
      ),
      t.createElement(je, {
        items: N,
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
        w,
        {
          type: "primary",
          size: "small",
          icon: I ? t.createElement(I) : void 0,
          disabled: !S,
          onClick: (M) => {
            M.stopPropagation(), r && r();
          }
        },
        "召唤专家"
      )
    )
  );
}
function ft({
  expert: e,
  open: l,
  onClose: r,
  onRefresh: t
}) {
  const a = u().React, {
    Drawer: n,
    Descriptions: i,
    Tag: v,
    Typography: T,
    Space: w,
    Button: g,
    Empty: I,
    Tabs: f,
    List: C,
    Spin: W,
    Modal: j,
    message: S
  } = u().antd, { Text: z, Paragraph: N } = T, {
    EditOutlined: _,
    ThunderboltOutlined: M,
    FileTextOutlined: d,
    ToolOutlined: P,
    PlusOutlined: R
  } = u().antdIcons || {}, [O, L] = a.useState(!1), [F, $] = a.useState(
    []
  ), [G, m] = a.useState(!1);
  if (!e) return null;
  const { agent: y, config: s, skills: c, mcps: H, loading: q } = e, Y = c.filter((h) => h.enabled !== !1), V = (h) => {
    window.history.pushState({}, "", h), window.dispatchEvent(new PopStateEvent("popstate"));
  }, ee = a.createElement(
    "div",
    null,
    a.createElement(
      i,
      { column: 1, bordered: !0, size: "small" },
      a.createElement(i.Item, { label: "专家名称" }, y.name),
      a.createElement(
        i.Item,
        { label: "专家 ID" },
        a.createElement("code", { style: { fontSize: 12 } }, y.id)
      ),
      a.createElement(
        i.Item,
        { label: "状态" },
        a.createElement(
          v,
          { color: y.enabled ? "green" : "default" },
          y.enabled ? "启用" : "停用"
        )
      ),
      a.createElement(
        i.Item,
        { label: "功能简介" },
        y.description ? _e(y.description, a) : "暂无描述"
      ),
      a.createElement(
        i.Item,
        { label: "使用模型" },
        y.active_model ? `${y.active_model.provider_id} / ${y.active_model.model}` : "使用全局默认模型"
      ),
      s != null && s.workspace_dir ? a.createElement(
        i.Item,
        { label: "工作区路径" },
        a.createElement(
          "code",
          { style: { fontSize: 11 } },
          s.workspace_dir
        )
      ) : null,
      s != null && s.approval_level ? a.createElement(
        i.Item,
        { label: "审批级别" },
        s.approval_level
      ) : null
    ),
    // System prompt files
    s != null && s.system_prompt_files && s.system_prompt_files.length > 0 ? a.createElement(
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
        d ? a.createElement(d, {
          style: { fontSize: 14, color: "#1677ff" }
        }) : null,
        a.createElement(z, { strong: !0 }, "系统提示词文件")
      ),
      a.createElement(
        w,
        { wrap: !0 },
        ...s.system_prompt_files.map(
          (h, le) => a.createElement(
            v,
            {
              key: le,
              icon: d ? a.createElement(d) : void 0,
              style: { fontSize: 12 }
            },
            h
          )
        )
      )
    ) : null
  ), o = async () => {
    L(!0), m(!0);
    try {
      const h = await We();
      $(h);
    } catch (h) {
      S.error(h.message || "加载技能池失败");
    } finally {
      m(!1);
    }
  }, J = async (h) => {
    let le = 0, oe = 0;
    for (const fe of h)
      try {
        await dt(y.id, fe), le++;
      } catch {
        oe++;
      }
    le > 0 ? (S.success(
      `成功添加 ${le} 个技能${oe > 0 ? `，${oe} 个失败` : ""}`
    ), t()) : oe > 0 && S.error("添加技能失败"), L(!1);
  }, A = async (h) => {
    try {
      await pt(y.id, h), S.success(`技能「${h}」已移除`), t();
    } catch (le) {
      S.error(le.message || "移除技能失败");
    }
  }, X = async (h) => {
    try {
      await ut(y.id, h), S.success(`MCP「${h}」已移除`), t();
    } catch (le) {
      S.error(le.message || "移除 MCP 失败");
    }
  }, Q = q ? a.createElement(
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
        `已启用技能 (${Y.length})`
      ),
      a.createElement(
        g,
        {
          type: "primary",
          size: "small",
          icon: R ? a.createElement(R) : void 0,
          onClick: o
        },
        "从技能池添加"
      )
    ),
    Y.length === 0 ? a.createElement(I, {
      description: "该专家暂无已启用的技能",
      image: I.PRESENTED_IMAGE_SIMPLE
    }) : a.createElement(C, {
      dataSource: Y,
      renderItem: (h) => a.createElement(
        C.Item,
        {
          actions: [
            a.createElement(
              g,
              {
                type: "link",
                size: "small",
                danger: !0,
                onClick: () => A(h.name)
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
              v,
              { style: { fontSize: 10 } },
              `v${h.version_text}`
            ) : null
          ),
          h.description ? a.createElement(
            N,
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
              (le, oe) => a.createElement(
                v,
                {
                  key: oe,
                  color: "cyan",
                  style: { fontSize: 10 }
                },
                le
              )
            )
          ) : null
        )
      )
    }),
    // Skill Picker Modal (card-grid style, consistent with Skill Center)
    a.createElement(gt, {
      open: O,
      onClose: () => L(!1),
      poolSkills: F,
      installedSkillNames: Y.map((h) => h.name),
      loading: G,
      onInstall: J
    })
  ), E = q ? a.createElement(
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
          icon: R ? a.createElement(R) : void 0,
          onClick: () => {
            window.history.pushState({}, "", `/agents/${y.id}/mcp`), window.dispatchEvent(new PopStateEvent("popstate"));
          }
        },
        "配置 MCP"
      )
    ),
    H.length === 0 ? a.createElement(I, {
      description: "该专家暂无关联的 MCP 客户端，点击「配置 MCP」添加",
      image: I.PRESENTED_IMAGE_SIMPLE
    }) : a.createElement(C, {
      dataSource: H,
      renderItem: (h) => a.createElement(
        C.Item,
        {
          actions: [
            a.createElement(
              g,
              {
                type: "link",
                size: "small",
                danger: !0,
                onClick: () => X(h.key)
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
              v,
              {
                color: h.enabled ? "green" : "default",
                style: { fontSize: 10 }
              },
              h.enabled ? "启用" : "停用"
            ),
            a.createElement(
              v,
              { color: "purple", style: { fontSize: 10 } },
              h.transport
            )
          ),
          h.description ? a.createElement(
            N,
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
  ), B = s != null && s.tools ? a.createElement(
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
        JSON.stringify(s.tools, null, 2)
      )
    )
  ) : a.createElement(I, {
    description: "暂无工具配置",
    image: I.PRESENTED_IMAGE_SIMPLE
  }), Z = [
    { key: "basic", label: "基本信息", children: ee },
    {
      key: "skills",
      label: `技能 (${Y.length})`,
      children: Q
    },
    {
      key: "prompts",
      label: "推荐提问",
      children: a.createElement(vt, {
        skills: Y,
        agentId: y.id
      })
    },
    {
      key: "knowledge",
      label: "专家记忆",
      children: a.createElement(ht, {
        agentId: y.id,
        systemPromptFiles: (s == null ? void 0 : s.system_prompt_files) || [],
        onRefresh: () => t()
      })
    },
    { key: "mcp", label: `MCP (${H.length})`, children: E },
    { key: "tools", label: "工具配置", children: B }
  ];
  return a.createElement(
    n,
    {
      title: a.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 8 } },
        a.createElement("span", { style: { fontSize: 20 } }, "🧑‍🔬"),
        a.createElement("span", null, y.name)
      ),
      open: l,
      onClose: r,
      width: 560,
      extra: a.createElement(
        w,
        null,
        a.createElement(
          g,
          {
            size: "small",
            icon: _ ? a.createElement(_) : void 0,
            onClick: () => V("/agents")
          },
          "编辑专家"
        ),
        a.createElement(
          g,
          {
            type: "primary",
            size: "small",
            icon: M ? a.createElement(M) : void 0,
            onClick: () => {
              try {
                const h = u();
                h.setSelectedAgent && h.setSelectedAgent(y.id);
              } catch (h) {
                console.warn("[ugsci] Failed to set selected agent:", h);
              }
              V("/chat");
            }
          },
          "开始对话"
        )
      )
    },
    a.createElement(f, {
      items: Z,
      defaultActiveKey: "basic"
    })
  );
}
function Et({
  open: e,
  onClose: l,
  onCreated: r
}) {
  const t = u().React, { useState: a } = t, {
    Modal: n,
    Card: i,
    Tag: v,
    Input: T,
    Row: w,
    Col: g,
    Spin: I,
    message: f,
    Typography: C
  } = u().antd, { Text: W } = C, [j, S] = a(!1), [z, N] = a(""), _ = ze.filter((d) => {
    if (!z.trim()) return !0;
    const P = z.toLowerCase();
    return d.name.toLowerCase().includes(P) || d.description.toLowerCase().includes(P) || d.category.toLowerCase().includes(P);
  }), M = async (d) => {
    S(!0);
    try {
      const P = await ne("/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: d.name,
          description: d.description,
          skill_names: d.recommendedSkills
        })
      });
      await $e(P.id, "AGENTS.md", d.systemPrompt);
      const R = await Te(P.id);
      R.approval_level = d.approvalLevel, await ne(`/agents/${encodeURIComponent(P.id)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(R)
      }), f.success(`专家「${d.name}」创建成功`), l(), r();
    } catch (P) {
      f.error(P.message || "创建专家失败");
    } finally {
      S(!1);
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
        onChange: (d) => N(d.target.value),
        allowClear: !0
      })
    ),
    j ? t.createElement(
      "div",
      { style: { textAlign: "center", padding: 60 } },
      t.createElement(I, { size: "large" }),
      t.createElement(
        "div",
        { style: { marginTop: 12, color: "#8c8c8c" } },
        "正在创建专家..."
      )
    ) : t.createElement(
      w,
      { gutter: [12, 12] },
      ..._.map(
        (d) => t.createElement(
          g,
          { key: d.id, xs: 24, sm: 12 },
          t.createElement(
            i,
            {
              hoverable: !0,
              size: "small",
              onClick: () => M(d),
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
                d.emoji
              ),
              t.createElement(
                "div",
                { style: { flex: 1 } },
                t.createElement(
                  W,
                  { strong: !0, style: { fontSize: 15 } },
                  d.name
                ),
                t.createElement(
                  "div",
                  null,
                  t.createElement(
                    v,
                    { color: "blue", style: { fontSize: 10 } },
                    d.category
                  ),
                  d.approvalLevel === "MANUAL" ? t.createElement(
                    v,
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
              _e(d.description, t)
            )
          )
        )
      )
    )
  );
}
function ht({
  agentId: e,
  systemPromptFiles: l,
  onRefresh: r
}) {
  const t = u().React, { useState: a, useEffect: n, useCallback: i } = t, {
    List: v,
    Tag: T,
    Switch: w,
    Button: g,
    Modal: I,
    Input: f,
    Spin: C,
    Empty: W,
    message: j,
    Typography: S
  } = u().antd, { FileTextOutlined: z, PlusOutlined: N, EditOutlined: _, ReloadOutlined: M } = u().antdIcons || {}, { Text: d } = S, [P, R] = a([]), [O, L] = a(!0), [F, $] = a(
    l || []
  ), [G, m] = a(!1), [y, s] = a(null), [c, H] = a(""), [q, Y] = a(""), [V, ee] = a(!1), o = i(async () => {
    L(!0);
    try {
      const E = await mt(e);
      R(E);
    } catch (E) {
      j.error(E.message || "加载记忆文件失败"), R([]);
    } finally {
      L(!1);
    }
  }, [e]);
  n(() => {
    o();
  }, [o]), n(() => {
    $(l || []);
  }, [l]);
  const J = async (E, B) => {
    const Z = new Set(F);
    if (B)
      Z.add(E);
    else {
      if (Be.includes(E) && E === "AGENTS.md") {
        j.warning("AGENTS.md 是核心文件，不能停用");
        return;
      }
      Z.delete(E);
    }
    const h = Array.from(Z);
    $(h);
    try {
      await Le(e, h), j.success(B ? "已启用记忆文件" : "已停用记忆文件"), r();
    } catch (le) {
      j.error(le.message || "更新失败"), $(l || []);
    }
  }, A = async (E) => {
    try {
      const B = await ne(
        `/workspace/files/${encodeURIComponent(E)}`,
        { headers: { "X-Agent-Id": e } }
      );
      s(E), H(B.content || ""), m(!0);
    } catch (B) {
      j.error(B.message || "读取文件失败");
    }
  }, X = () => {
    s(null), H(""), Y(""), m(!0);
  }, Q = async () => {
    const E = y || q.trim();
    if (!E) {
      j.warning("请输入文件名");
      return;
    }
    const B = E.endsWith(".md") ? E : `${E}.md`;
    ee(!0);
    try {
      if (await $e(e, B, c), !y && !F.includes(B)) {
        const Z = [...F, B];
        $(Z), await Le(e, Z);
      }
      j.success("保存成功"), m(!1), o(), r();
    } catch (Z) {
      j.error(Z.message || "保存失败");
    } finally {
      ee(!1);
    }
  };
  return O ? t.createElement(
    "div",
    { style: { textAlign: "center", padding: 40 } },
    t.createElement(C, { size: "large" })
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
          d,
          { strong: !0 },
          `记忆文件 (${P.length})`
        ),
        t.createElement(
          d,
          { type: "secondary", style: { fontSize: 12 } },
          `· 已挂载 ${F.length} 个到专家记忆`
        )
      ),
      t.createElement(
        "div",
        { style: { display: "flex", gap: 8 } },
        t.createElement(
          g,
          {
            size: "small",
            icon: M ? t.createElement(M) : void 0,
            onClick: o
          },
          "刷新"
        ),
        t.createElement(
          g,
          {
            type: "primary",
            size: "small",
            icon: N ? t.createElement(N) : void 0,
            onClick: X
          },
          "新建记忆文件"
        )
      )
    ),
    P.length === 0 ? t.createElement(W, {
      description: "暂无记忆文件，点击「新建记忆文件」添加",
      image: W.PRESENTED_IMAGE_SIMPLE
    }) : t.createElement(v, {
      dataSource: P,
      renderItem: (E) => {
        const B = F.includes(E.filename), Z = Be.includes(E.filename);
        return t.createElement(
          v.Item,
          {
            actions: [
              t.createElement(
                g,
                {
                  type: "link",
                  size: "small",
                  icon: _ ? t.createElement(_) : void 0,
                  onClick: () => A(E.filename)
                },
                "编辑"
              )
            ]
          },
          t.createElement(v.Item.Meta, {
            avatar: t.createElement(z, {
              style: {
                fontSize: 20,
                color: B ? "#1677ff" : "#bfbfbf"
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
              t.createElement(d, null, E.filename),
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
              `${(E.size / 1024).toFixed(1)} KB · 修改于 ${new Date(E.modified_time).toLocaleString()}`
            )
          }),
          t.createElement(w, {
            checked: B,
            size: "small",
            onChange: (h) => J(E.filename, h)
          })
        );
      }
    }),
    // Edit/New file modal
    t.createElement(
      I,
      {
        open: G,
        onCancel: () => m(!1),
        title: y ? `编辑 ${y}` : "新建记忆文件",
        width: 700,
        onOk: Q,
        confirmLoading: V,
        okText: "保存"
      },
      y ? null : t.createElement(
        "div",
        { style: { marginBottom: 12 } },
        t.createElement(f, {
          placeholder: "文件名（如：油藏工程记忆库.md）",
          value: q,
          onChange: (E) => Y(E.target.value),
          addonAfter: q.endsWith(".md") ? "" : ".md"
        })
      ),
      t.createElement(f.TextArea, {
        value: c,
        onChange: (E) => H(E.target.value),
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
function vt({
  skills: e,
  agentId: l
}) {
  const r = u().React, { useMemo: t } = r, {
    List: a,
    Tag: n,
    Typography: i,
    Empty: v,
    Button: T,
    message: w
  } = u().antd, { ThunderboltOutlined: g, CopyOutlined: I } = u().antdIcons || {}, { Text: f } = i, C = t(() => ct(e), [e]), W = (S) => {
    try {
      const z = u();
      z.setSelectedAgent && z.setSelectedAgent(l);
    } catch {
    }
    try {
      sessionStorage.setItem("ugsci_pending_prompt", S);
    } catch {
    }
    window.history.pushState({}, "", "/chat"), window.dispatchEvent(new PopStateEvent("popstate"));
  }, j = (S) => {
    var z;
    (z = navigator.clipboard) == null || z.writeText(S).then(() => {
      w.success("已复制到剪贴板");
    });
  };
  return C.length === 0 ? r.createElement(v, {
    description: "暂无推荐提问，请先为专家添加技能",
    image: v.PRESENTED_IMAGE_SIMPLE
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
        f,
        { strong: !0 },
        `推荐提问 (${C.length})`
      ),
      r.createElement(
        f,
        { type: "secondary", style: { fontSize: 12 } },
        "· 从技能描述中自动提取"
      )
    ),
    r.createElement(a, {
      dataSource: C,
      renderItem: (S, z) => r.createElement(
        a.Item,
        {
          actions: [
            r.createElement(
              T,
              {
                type: "link",
                size: "small",
                icon: I ? r.createElement(I) : void 0,
                onClick: () => j(S)
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
              onClick: () => W(S)
            },
            S
          ),
          description: r.createElement(
            f,
            { type: "secondary", style: { fontSize: 12 } },
            "点击直接发送给专家"
          )
        })
      )
    })
  );
}
function St() {
  var pe;
  const e = u().React, { useState: l, useEffect: r, useCallback: t, useMemo: a } = e, {
    Spin: n,
    Empty: i,
    Input: v,
    Button: T,
    message: w,
    Row: g,
    Col: I,
    Tabs: f,
    Modal: C,
    Typography: W
  } = u().antd, {
    ReloadOutlined: j,
    PlusOutlined: S,
    SearchOutlined: z,
    TeamOutlined: N,
    UserOutlined: _
  } = u().antdIcons || {}, { Text: M, Paragraph: d } = W, [P, R] = l([]), [O, L] = l(!0), [F, $] = l(!1), [G, m] = l(null), [y, s] = l(""), [c, H] = l(!1), [q, Y] = l("experts"), [V, ee] = l(
    null
  ), [o, J] = l(""), [A, X] = l(!1), [Q, E] = l([]), B = t(async () => {
    L(!0);
    try {
      const b = await Oe(), D = await He().catch(
        () => []
      ), x = await Promise.all(
        b.map(async (K) => {
          try {
            const [te, Ee] = await Promise.all([
              Te(K.id).catch(() => null),
              Ue(K.id).catch(() => [])
            ]), se = nt(te == null ? void 0 : te.mcp), ue = D.filter(
              (xe) => se.includes(xe.key) || se.includes(xe.name)
            );
            return {
              agent: K,
              config: te,
              skills: Ee,
              mcps: ue,
              loading: !1
            };
          } catch {
            return {
              agent: K,
              config: null,
              skills: [],
              mcps: [],
              loading: !1
            };
          }
        })
      );
      R(x), E(b);
    } catch (b) {
      w.error(b.message || "加载专家列表失败"), R([]);
    } finally {
      L(!1);
    }
  }, []);
  r(() => {
    B();
  }, [B]);
  const Z = t(
    async (b) => {
      var te;
      const D = b.coordinatorName || ((te = b.members[0]) == null ? void 0 : te.name);
      if (!D) {
        w.error("无法确定协调者专家");
        return;
      }
      const x = Ce(Q, D);
      if (!x) {
        w.error(`未找到协调者专家「${D}」，请先创建该专家`);
        return;
      }
      if (/\{.+?\}/.test(b.taskTemplate)) {
        J(""), ee(b);
        return;
      }
      await h(b, x, b.taskTemplate);
    },
    [Q, w]
  ), h = t(
    async (b, D, x) => {
      var K;
      X(!0);
      try {
        const te = rt(b), Ee = x ? te.replace(b.taskTemplate, x) : te, se = u();
        se.setSelectedAgent && se.setSelectedAgent(D), await at(D, Ee), w.success(
          `团队任务已发起，协调者：${b.coordinatorName || ((K = b.members[0]) == null ? void 0 : K.name)}`
        ), ee(null), le("/chat");
      } catch (te) {
        w.error(te.message || "发起团队任务失败");
      } finally {
        X(!1);
      }
    },
    [w]
  ), le = (b) => {
    window.history.pushState({}, "", b), window.dispatchEvent(new PopStateEvent("popstate"));
  }, oe = t((b) => {
    m(b), $(!0);
  }, []), fe = t(
    (b) => {
      if (!b.agent.enabled) {
        w.warning(`专家「${b.agent.name}」未启用，请先启用`);
        return;
      }
      try {
        const D = u();
        D.setSelectedAgent && D.setSelectedAgent(b.agent.id);
      } catch (D) {
        console.warn("[ugsci] Failed to set selected agent:", D);
      }
      w.success(`已召唤专家「${b.agent.name}」，正在跳转至对话...`), le("/chat");
    },
    [w]
  ), ye = a(() => {
    if (!y.trim()) return P;
    const b = y.toLowerCase();
    return P.filter(
      (D) => {
        var x;
        return D.agent.name.toLowerCase().includes(b) || ((x = D.agent.description) == null ? void 0 : x.toLowerCase().includes(b)) || D.agent.id.toLowerCase().includes(b) || D.skills.some((K) => K.name.toLowerCase().includes(b));
      }
    );
  }, [P, y]), k = P.filter((b) => b.agent.enabled).length, U = P.reduce(
    (b, D) => b + D.skills.filter((x) => x.enabled !== !1).length,
    0
  ), re = P.reduce((b, D) => b + D.mcps.length, 0), me = [
    {
      key: "experts",
      label: e.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        _ ? e.createElement(_, { style: { fontSize: 14 } }) : null,
        "专家列表"
      ),
      children: e.createElement(
        "div",
        null,
        // Search bar
        e.createElement(
          "div",
          { style: { marginBottom: 16 } },
          e.createElement(v, {
            placeholder: "搜索专家名称、描述或技能...",
            prefix: z ? e.createElement(z) : void 0,
            value: y,
            onChange: (b) => s(b.target.value),
            allowClear: !0,
            style: { maxWidth: 400 }
          })
        ),
        // Content
        O ? e.createElement(
          "div",
          { style: { textAlign: "center", padding: 60 } },
          e.createElement(n, { size: "large" })
        ) : ye.length === 0 ? e.createElement(i, {
          description: y ? "未找到匹配的专家" : "暂无专家，点击「创建专家」添加"
        }) : e.createElement(
          g,
          { gutter: [12, 12], align: "stretch" },
          ...ye.map(
            (b) => e.createElement(
              I,
              {
                key: b.agent.id,
                xs: 24,
                sm: 12,
                md: 8,
                lg: 6,
                style: { display: "flex" }
              },
              e.createElement(yt, {
                expert: b,
                onClick: () => oe(b),
                onSummon: () => fe(b)
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
        N ? e.createElement(N, { style: { fontSize: 14 } }) : null,
        "专家团"
      ),
      children: e.createElement(it, {
        agents: Q,
        onLaunch: Z
      })
    }
  ];
  return e.createElement(
    "div",
    { style: { padding: 24 } },
    e.createElement(ke, {
      title: "专家",
      subtitle: `共 ${P.length} 位专家（${k} 位启用）· ${U} 个技能 · ${re} 个 MCP 客户端`,
      extra: e.createElement(
        e.Fragment,
        null,
        e.createElement(
          T,
          {
            icon: j ? e.createElement(j) : void 0,
            onClick: B,
            loading: O
          },
          "刷新"
        ),
        e.createElement(
          T,
          {
            type: "primary",
            icon: S ? e.createElement(S) : void 0,
            onClick: () => H(!0)
          },
          "创建专家"
        )
      )
    }),
    e.createElement(f, {
      items: me,
      activeKey: q,
      onChange: (b) => Y(b)
    }),
    // Drawer
    e.createElement(ft, {
      expert: G,
      open: F,
      onClose: () => $(!1),
      onRefresh: () => B()
    }),
    // Template Modal
    e.createElement(Et, {
      open: c,
      onClose: () => H(!1),
      onCreated: () => B()
    }),
    // Team Launch Modal (for filling placeholders)
    V ? e.createElement(
      C,
      {
        open: !0,
        title: e.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 8 } },
          e.createElement(
            "span",
            { style: { fontSize: 20 } },
            V.emoji
          ),
          e.createElement(
            "span",
            null,
            `发起团队任务 - ${V.name}`
          )
        ),
        onCancel: () => ee(null),
        onOk: () => {
          var K;
          const b = V.coordinatorName || ((K = V.members[0]) == null ? void 0 : K.name), D = b ? Ce(Q, b) : null;
          if (!D) {
            w.error("无法找到协调者专家");
            return;
          }
          let x = V.taskTemplate;
          o.trim() && (x = o.trim()), h(V, D, x);
        },
        confirmLoading: A,
        okText: "发起任务",
        width: 600
      },
      e.createElement(
        "div",
        { style: { marginBottom: 12 } },
        e.createElement(
          M,
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
          V.taskTemplate
        )
      ),
      e.createElement(
        "div",
        null,
        e.createElement(
          M,
          {
            type: "secondary",
            style: { fontSize: 12, display: "block", marginBottom: 8 }
          },
          "输入具体任务描述（替换上面的占位符内容）："
        ),
        e.createElement(v.TextArea, {
          value: o,
          onChange: (b) => J(b.target.value),
          rows: 5,
          placeholder: V.taskTemplate,
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
          M,
          { style: { fontSize: 12, color: "#0958d9" } },
          `协调者: ${V.coordinatorName || ((pe = V.members[0]) == null ? void 0 : pe.name) || "—"} · 成员: ${V.members.map((b) => b.name).join("、")}`
        )
      )
    ) : null
  );
}
function bt({
  mcp: e,
  onClick: l
}) {
  const r = u().React, { Card: t, Tag: a, Badge: n, Typography: i } = u().antd, { Text: v } = i, T = {
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
          v,
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
const Ie = {
  reservoir_simulation: "油藏数值模拟",
  geological_modeling: "地质建模",
  well_log_analysis: "测井分析",
  production_engineering: "采油工程",
  post_processing: "后处理与可视化",
  multiphysics: "多物理场仿真"
}, Je = {
  reservoir_simulation: "🛢️",
  geological_modeling: "🏔️",
  well_log_analysis: "📡",
  production_engineering: "⚙️",
  post_processing: "📊",
  multiphysics: "🔬"
};
async function xt() {
  return ne("/ugsci/engines/list");
}
async function wt(e) {
  return ne("/ugsci/engines/", {
    method: "POST",
    body: JSON.stringify(e)
  });
}
async function Ct(e, l) {
  return ne(`/ugsci/engines/${encodeURIComponent(e)}`, {
    method: "PUT",
    body: JSON.stringify(l)
  });
}
async function Tt(e) {
  return ne(
    `/ugsci/engines/${encodeURIComponent(e)}`,
    { method: "DELETE" }
  );
}
async function kt() {
  return ne("/ugsci/engines/detect", {
    method: "POST"
  });
}
function zt({
  engine: e,
  onClick: l
}) {
  const r = u().React, { Card: t, Tag: a, Typography: n } = u().antd, { Text: i } = n, v = e.status === "detected", T = Je[e.category] || "📦";
  return r.createElement(
    t,
    {
      hoverable: !0,
      onClick: l,
      size: "small",
      style: {
        cursor: "pointer",
        borderColor: v ? void 0 : "#d9d9d9",
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
        v ? r.createElement(
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
        Ie[e.category] || e.category
      ) : null,
      e.version ? r.createElement(
        a,
        { color: "blue", style: { fontSize: 11 } },
        `v${e.version}`
      ) : null
    )
  );
}
function It() {
  const e = u().React, { useState: l, useEffect: r, useCallback: t, useMemo: a } = e, {
    Spin: n,
    Empty: i,
    Button: v,
    message: T,
    Row: w,
    Col: g,
    Drawer: I,
    Descriptions: f,
    Tag: C,
    Typography: W,
    Modal: j,
    Input: S,
    Alert: z,
    Select: N,
    Popconfirm: _,
    Space: M
  } = u().antd, {
    ReloadOutlined: d,
    SearchOutlined: P,
    PlusOutlined: R,
    EditOutlined: O,
    DeleteOutlined: L,
    CopyOutlined: F,
    ExperimentOutlined: $
  } = u().antdIcons || {}, { Text: G, Paragraph: m } = W, [y, s] = l([]), [c, H] = l(!0), [q, Y] = l(""), [V, ee] = l(!1), [o, J] = l(null), [A, X] = l(!1), [Q, E] = l(null), [B, Z] = l({}), [h, le] = l(!1), oe = t(async () => {
    H(!0);
    try {
      const x = await xt();
      s(x.engines || []);
    } catch (x) {
      T.error(x.message || "加载引擎列表失败"), s([]);
    } finally {
      H(!1);
    }
  }, []);
  r(() => {
    oe();
  }, [oe]);
  const fe = a(() => {
    if (!q.trim()) return y;
    const x = q.toLowerCase();
    return y.filter(
      (K) => {
        var te;
        return K.name.toLowerCase().includes(x) || K.vendor.toLowerCase().includes(x) || K.category.toLowerCase().includes(x) || ((te = K.description) == null ? void 0 : te.toLowerCase().includes(x));
      }
    );
  }, [y, q]), ye = y.filter((x) => x.status === "detected").length, k = t((x) => {
    navigator.clipboard.writeText(x).then(() => T.success("路径已复制")).catch(() => T.error("复制失败"));
  }, []), U = t(() => {
    E(null), Z({
      name: "",
      vendor: "",
      version: "",
      executable_path: "",
      category: "",
      description: "",
      invocation_hint: ""
    }), X(!0);
  }, []), re = t((x) => {
    E(x), Z({ ...x }), X(!0), ee(!1);
  }, []), me = t(async () => {
    var x;
    if (!((x = B.name) != null && x.trim())) {
      T.warning("请输入引擎名称");
      return;
    }
    le(!0);
    try {
      Q ? (await Ct(Q.id, B), T.success("引擎已更新")) : (await wt(B), T.success("引擎已添加")), X(!1), oe();
    } catch (K) {
      T.error(K.message || "保存失败");
    } finally {
      le(!1);
    }
  }, [B, Q, oe]), pe = t(
    async (x) => {
      try {
        await Tt(x), T.success("引擎已删除"), ee(!1), oe();
      } catch (K) {
        T.error(K.message || "删除失败");
      }
    },
    [oe]
  ), b = t(async () => {
    H(!0);
    try {
      const x = await kt();
      s(x.engines || []), T.success("自动检测完成");
    } catch (x) {
      T.error(x.message || "检测失败");
    } finally {
      H(!1);
    }
  }, []), D = t(
    (x, K, te) => {
      const Ee = B[K] || "";
      return e.createElement(
        "div",
        { style: { marginBottom: 12 } },
        e.createElement(
          G,
          { style: { fontSize: 13, display: "block", marginBottom: 4 } },
          x
        ),
        te != null && te.select ? e.createElement(N, {
          value: Ee || void 0,
          onChange: (se) => Z((ue) => ({ ...ue, [K]: se })),
          style: { width: "100%" },
          options: te.select.options,
          allowClear: !0,
          placeholder: `选择${x}`
        }) : te != null && te.textarea ? e.createElement(S.TextArea, {
          value: Ee,
          onChange: (se) => Z((ue) => ({ ...ue, [K]: se.target.value })),
          rows: 3,
          placeholder: `输入${x}`
        }) : e.createElement(S, {
          value: Ee,
          onChange: (se) => Z((ue) => ({ ...ue, [K]: se.target.value })),
          placeholder: `输入${x}`
        })
      );
    },
    [B]
  );
  return e.createElement(
    "div",
    null,
    // Summary alert
    e.createElement(
      z,
      {
        type: ye > 0 ? "success" : "info",
        message: `共 ${y.length} 个引擎 · ${ye} 个已检测`,
        description: ye > 0 ? "部分引擎已自动检测到安装路径，可在卡片中查看详情。" : "尚未检测到已安装的引擎。可点击「自动检测」或手动添加计算引擎。",
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
      e.createElement(S, {
        placeholder: "搜索引擎名称、厂商...",
        prefix: P ? e.createElement(P) : void 0,
        value: q,
        onChange: (x) => Y(x.target.value),
        allowClear: !0,
        style: { maxWidth: 280 }
      }),
      e.createElement(
        v,
        {
          icon: d ? e.createElement(d) : void 0,
          onClick: b,
          loading: c
        },
        "自动检测"
      ),
      e.createElement(
        v,
        {
          type: "primary",
          icon: R ? e.createElement(R) : void 0,
          onClick: U
        },
        "添加引擎"
      )
    ),
    // Content
    c ? e.createElement(
      "div",
      { style: { textAlign: "center", padding: 60 } },
      e.createElement(n, {
        size: "large",
        tip: "正在加载计算引擎..."
      })
    ) : fe.length === 0 ? e.createElement(i, {
      description: q ? "无匹配引擎" : "暂无引擎，点击「添加引擎」开始"
    }) : e.createElement(
      w,
      { gutter: [12, 12], align: "stretch" },
      ...fe.map(
        (x) => e.createElement(
          g,
          {
            key: x.id,
            xs: 24,
            sm: 12,
            md: 8,
            lg: 6,
            style: { display: "flex" }
          },
          e.createElement(zt, {
            engine: x,
            onClick: () => {
              J(x), ee(!0);
            }
          })
        )
      )
    ),
    // Detail drawer
    o ? e.createElement(
      I,
      {
        title: e.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 8 } },
          e.createElement(
            "span",
            { style: { fontSize: 18 } },
            Je[o.category] || "📦"
          ),
          e.createElement("span", null, o.name)
        ),
        open: V,
        onClose: () => ee(!1),
        width: 520,
        extra: e.createElement(
          M,
          null,
          e.createElement(
            v,
            {
              size: "small",
              icon: O ? e.createElement(O) : void 0,
              onClick: () => re(o)
            },
            "编辑"
          ),
          o.is_default ? null : e.createElement(
            _,
            {
              title: "确认删除此引擎？",
              description: o.name,
              onConfirm: () => pe(o.id),
              okText: "删除",
              cancelText: "取消",
              okButtonProps: { danger: !0 }
            },
            e.createElement(
              v,
              {
                size: "small",
                danger: !0,
                icon: L ? e.createElement(L) : void 0
              },
              "删除"
            )
          )
        )
      },
      e.createElement(
        f,
        { column: 1, bordered: !0, size: "small" },
        e.createElement(
          f.Item,
          { label: "引擎名称" },
          o.name
        ),
        e.createElement(
          f.Item,
          { label: "厂商" },
          o.vendor || "—"
        ),
        e.createElement(
          f.Item,
          { label: "分类" },
          o.category ? Ie[o.category] || o.category : "—"
        ),
        e.createElement(
          f.Item,
          { label: "状态" },
          e.createElement(
            C,
            {
              color: o.status === "detected" ? "success" : o.status === "not_found" ? "error" : "default"
            },
            o.status === "detected" ? "✅ 已检测" : o.status === "not_found" ? "❌ 路径无效" : "🔧 待配置"
          )
        ),
        e.createElement(
          f.Item,
          { label: "版本" },
          o.version || "—"
        ),
        o.executable_path ? e.createElement(
          f.Item,
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
              v,
              {
                size: "small",
                type: "text",
                icon: F ? e.createElement(F) : void 0,
                onClick: () => k(o.executable_path)
              }
            )
          )
        ) : null,
        o.install_dir ? e.createElement(
          f.Item,
          { label: "安装目录" },
          e.createElement(
            "code",
            { style: { fontSize: 12, wordBreak: "break-all" } },
            o.install_dir
          )
        ) : null,
        o.license_server ? e.createElement(
          f.Item,
          { label: "许可证服务器" },
          o.license_server
        ) : null,
        e.createElement(
          f.Item,
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
          G,
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
          C,
          { color: "blue" },
          "默认引擎"
        ) : o.is_custom ? e.createElement(
          C,
          { color: "purple" },
          "自定义引擎"
        ) : null
      )
    ) : null,
    // Add/Edit modal
    e.createElement(
      j,
      {
        title: Q ? "编辑引擎" : "添加计算引擎",
        open: A,
        onOk: me,
        onCancel: () => X(!1),
        okText: Q ? "保存" : "添加",
        cancelText: "取消",
        confirmLoading: h,
        width: 560
      },
      e.createElement(
        "div",
        { style: { maxHeight: 480, overflow: "auto", paddingRight: 8 } },
        D("引擎名称 *", "name"),
        D("厂商", "vendor"),
        D("版本", "version"),
        D("可执行文件路径", "executable_path"),
        D("安装目录", "install_dir"),
        D("分类", "category", {
          select: {
            options: Object.entries(Ie).map(([x, K]) => ({
              label: K,
              value: x
            }))
          }
        }),
        D("描述", "description", { textarea: !0 }),
        D("调用方式提示", "invocation_hint", { textarea: !0 }),
        D("许可证服务器", "license_server")
      )
    )
  );
}
function Pt() {
  const e = u().React, { useState: l, useEffect: r, useCallback: t, useMemo: a } = e, {
    Spin: n,
    Empty: i,
    Input: v,
    Button: T,
    message: w,
    Row: g,
    Col: I,
    Drawer: f,
    Descriptions: C,
    Tag: W,
    Typography: j,
    List: S,
    Tabs: z
  } = u().antd, {
    ReloadOutlined: N,
    PlusOutlined: _,
    SearchOutlined: M,
    ApiOutlined: d,
    RocketOutlined: P
  } = u().antdIcons || {}, { Text: R } = j, [O, L] = l([]), [F, $] = l(!0), [G, m] = l(""), [y, s] = l(!1), [c, H] = l(null), [q, Y] = l("mcp"), V = t(async () => {
    $(!0);
    try {
      const E = await He();
      L(E);
    } catch (E) {
      w.error(E.message || "加载能力列表失败"), L([]);
    } finally {
      $(!1);
    }
  }, []);
  r(() => {
    V();
  }, [V]);
  const ee = a(() => {
    if (!G.trim()) return O;
    const E = G.toLowerCase();
    return O.filter(
      (B) => {
        var Z;
        return B.name.toLowerCase().includes(E) || B.key.toLowerCase().includes(E) || ((Z = B.description) == null ? void 0 : Z.toLowerCase().includes(E)) || B.transport.toLowerCase().includes(E);
      }
    );
  }, [O, G]), o = O.filter((E) => E.enabled).length, J = O.reduce((E, B) => {
    var Z;
    return E + (((Z = B.tools) == null ? void 0 : Z.length) || 0);
  }, 0), A = (E) => {
    window.history.pushState({}, "", E), window.dispatchEvent(new PopStateEvent("popstate"));
  }, X = e.createElement(
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
      e.createElement(v, {
        placeholder: "搜索能力名称、描述...",
        prefix: M ? e.createElement(M) : void 0,
        value: G,
        onChange: (E) => m(E.target.value),
        allowClear: !0,
        style: { maxWidth: 400 }
      }),
      e.createElement(
        T,
        {
          type: "primary",
          icon: _ ? e.createElement(_) : void 0,
          onClick: () => A("/mcp")
        },
        "管理 MCP"
      )
    ),
    F ? e.createElement(
      "div",
      { style: { textAlign: "center", padding: 60 } },
      e.createElement(n, { size: "large" })
    ) : ee.length === 0 ? e.createElement(i, {
      description: G ? "未找到匹配的能力" : "暂无 MCP 客户端，点击「管理 MCP」添加"
    }) : e.createElement(
      g,
      { gutter: [12, 12], align: "stretch" },
      ...ee.map(
        (E) => e.createElement(
          I,
          {
            key: E.key,
            xs: 24,
            sm: 12,
            md: 8,
            lg: 6,
            style: { display: "flex" }
          },
          e.createElement(bt, {
            mcp: E,
            onClick: () => {
              H(E), s(!0);
            }
          })
        )
      )
    )
  ), Q = [
    {
      key: "mcp",
      label: e.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        d ? e.createElement(d, { style: { fontSize: 14 } }) : null,
        "MCP 客户端"
      ),
      children: X
    },
    {
      key: "software",
      label: e.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        P ? e.createElement(P, { style: { fontSize: 14 } }) : null,
        "计算引擎"
      ),
      children: e.createElement(It)
    }
  ];
  return e.createElement(
    "div",
    { style: { padding: 24 } },
    e.createElement(ke, {
      title: "工具",
      subtitle: `MCP: ${O.length} 个客户端（${o} 个启用）· ${J} 个工具`,
      extra: e.createElement(
        e.Fragment,
        null,
        e.createElement(
          T,
          {
            icon: N ? e.createElement(N) : void 0,
            onClick: V,
            loading: F
          },
          "刷新"
        )
      )
    }),
    e.createElement(z, {
      items: Q,
      activeKey: q,
      onChange: (E) => Y(E)
    }),
    // MCP Detail drawer
    c ? e.createElement(
      f,
      {
        title: e.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 8 } },
          e.createElement("span", { style: { fontSize: 18 } }, "🔌"),
          e.createElement(
            "span",
            null,
            c.name || c.key
          )
        ),
        open: y,
        onClose: () => s(!1),
        width: 480
      },
      e.createElement(
        C,
        { column: 1, bordered: !0, size: "small" },
        e.createElement(
          C.Item,
          { label: "Key" },
          e.createElement(
            "code",
            { style: { fontSize: 12 } },
            c.key
          )
        ),
        e.createElement(
          C.Item,
          { label: "名称" },
          c.name || "-"
        ),
        e.createElement(
          C.Item,
          { label: "描述" },
          c.description || "-"
        ),
        e.createElement(
          C.Item,
          { label: "状态" },
          e.createElement(
            W,
            { color: c.enabled ? "green" : "default" },
            c.enabled ? "启用" : "停用"
          )
        ),
        e.createElement(
          C.Item,
          { label: "传输方式" },
          c.transport
        ),
        c.url ? e.createElement(
          C.Item,
          { label: "URL" },
          c.url
        ) : null,
        c.command ? e.createElement(
          C.Item,
          { label: "命令" },
          e.createElement(
            "code",
            { style: { fontSize: 11 } },
            c.command
          )
        ) : null,
        c.args && c.args.length > 0 ? e.createElement(
          C.Item,
          { label: "参数" },
          c.args.join(" ")
        ) : null
      ),
      c.tools && c.tools.length > 0 ? e.createElement(
        "div",
        { style: { marginTop: 16 } },
        e.createElement(
          R,
          {
            strong: !0,
            style: { display: "block", marginBottom: 8 }
          },
          "提供的工具"
        ),
        e.createElement(S, {
          size: "small",
          dataSource: c.tools,
          renderItem: (E) => e.createElement(
            S.Item,
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
              d ? e.createElement(d, {
                style: { fontSize: 12, color: "#1677ff" }
              }) : null,
              e.createElement(
                R,
                { style: { fontSize: 12 } },
                E
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
function Ot({
  agentId: e,
  agentName: l,
  onNavigate: r
}) {
  const t = u().React, { useState: a, useEffect: n, useCallback: i } = t, {
    Spin: v,
    Empty: T,
    Button: w,
    Row: g,
    Col: I,
    Card: f,
    Tag: C,
    Typography: W,
    Drawer: j,
    Descriptions: S,
    Alert: z
  } = u().antd, {
    ReloadOutlined: N,
    ThunderboltOutlined: _,
    SettingOutlined: M
  } = u().antdIcons || {}, { Text: d, Paragraph: P } = W, [R, O] = a([]), [L, F] = a(!0), [$, G] = a(!1), [m, y] = a(null), s = i(async () => {
    if (e) {
      F(!0);
      try {
        const c = await Ue(e);
        O(c);
      } catch {
        O([]);
      } finally {
        F(!1);
      }
    }
  }, [e]);
  return n(() => {
    s();
  }, [s]), t.createElement(
    "div",
    null,
    t.createElement(z, {
      type: "info",
      showIcon: !0,
      message: `当前智能体：${l}`,
      description: `已加载 ${R.length} 个技能。切换智能体时自动同步。`,
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
        d,
        { type: "secondary", style: { fontSize: 13 } },
        `共 ${R.length} 个技能`
      ),
      t.createElement(
        w,
        {
          icon: N ? t.createElement(N) : void 0,
          onClick: s,
          loading: L,
          size: "small"
        },
        "刷新"
      )
    ),
    L ? t.createElement(
      "div",
      { style: { textAlign: "center", padding: 60 } },
      t.createElement(v, { size: "large" })
    ) : R.length === 0 ? t.createElement(T, {
      description: "当前智能体未加载任何技能"
    }) : t.createElement(
      g,
      { gutter: [12, 12] },
      ...R.map(
        (c) => t.createElement(
          I,
          { key: c.name, xs: 24, sm: 12, md: 8, lg: 6 },
          t.createElement(
            f,
            {
              hoverable: !0,
              size: "small",
              style: { cursor: "pointer", height: "100%" },
              onClick: () => {
                y(c), G(!0);
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
              c.emoji ? t.createElement(
                "span",
                { style: { fontSize: 18 } },
                c.emoji
              ) : t.createElement(
                "span",
                { style: { fontSize: 18 } },
                "⚡"
              ),
              t.createElement(
                d,
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
              ),
              c.enabled === !1 ? t.createElement(
                C,
                { color: "default", style: { fontSize: 10 } },
                "已禁用"
              ) : t.createElement(
                C,
                { color: "green", style: { fontSize: 10 } },
                "已启用"
              )
            ),
            c.description ? t.createElement(
              P,
              {
                type: "secondary",
                style: { fontSize: 11, margin: 0, lineHeight: 1.4 },
                ellipsis: { rows: 2 }
              },
              c.description
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
              c.version_text ? t.createElement(
                C,
                { style: { fontSize: 10 } },
                `v${c.version_text}`
              ) : null,
              ...(c.tags || []).slice(0, 3).map(
                (H, q) => t.createElement(
                  C,
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
    m ? t.createElement(
      j,
      {
        title: t.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 8 } },
          t.createElement(
            "span",
            { style: { fontSize: 18 } },
            m.emoji || "⚡"
          ),
          t.createElement("span", null, m.name)
        ),
        open: $,
        onClose: () => G(!1),
        width: 520,
        extra: t.createElement(
          w,
          {
            type: "primary",
            size: "small",
            icon: M ? t.createElement(M) : void 0,
            onClick: () => r("/skills")
          },
          "管理技能"
        )
      },
      t.createElement(
        S,
        { column: 1, bordered: !0, size: "small" },
        t.createElement(
          S.Item,
          { label: "技能名称" },
          m.name
        ),
        t.createElement(
          S.Item,
          { label: "描述" },
          m.description || "-"
        ),
        m.version_text ? t.createElement(
          S.Item,
          { label: "版本" },
          m.version_text
        ) : null,
        t.createElement(
          S.Item,
          { label: "来源" },
          m.source || "-"
        ),
        t.createElement(
          S.Item,
          { label: "状态" },
          m.enabled === !1 ? "已禁用" : "已启用"
        ),
        m.installed_from ? t.createElement(
          S.Item,
          { label: "安装来源" },
          m.installed_from
        ) : null
      ),
      // Tags
      m.tags && m.tags.length > 0 ? t.createElement(
        "div",
        { style: { marginTop: 16 } },
        t.createElement(
          d,
          {
            strong: !0,
            style: { display: "block", marginBottom: 8 }
          },
          "标签"
        ),
        t.createElement(
          "div",
          { style: { display: "flex", flexWrap: "wrap", gap: 4 } },
          ...m.tags.map(
            (c, H) => t.createElement(C, { key: H, color: "blue" }, c)
          )
        )
      ) : null,
      // Skill content preview
      m.content ? t.createElement(
        "div",
        { style: { marginTop: 16 } },
        t.createElement(
          d,
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
          m.content.slice(0, 2e3) + (m.content.length > 2e3 ? `

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
  const n = u().React, { useState: i, useMemo: v, useCallback: T } = n, {
    Spin: w,
    Empty: g,
    Input: I,
    Button: f,
    Row: C,
    Col: W,
    Card: j,
    Tag: S,
    Typography: z,
    Drawer: N,
    Descriptions: _,
    List: M
  } = u().antd, {
    ReloadOutlined: d,
    SearchOutlined: P,
    DownloadOutlined: R,
    ThunderboltOutlined: O
  } = u().antdIcons || {}, { Text: L, Paragraph: F } = z, [$, G] = i(""), [m, y] = i(!1), [s, c] = i(null), [H, q] = i([]), Y = v(() => {
    if (!$.trim()) return e;
    const o = $.toLowerCase();
    return e.filter(
      (J) => {
        var A, X;
        return J.name.toLowerCase().includes(o) || ((A = J.description) == null ? void 0 : A.toLowerCase().includes(o)) || ((X = J.tags) == null ? void 0 : X.some((Q) => Q.toLowerCase().includes(o)));
      }
    );
  }, [e, $]), V = T(
    (o) => {
      const J = [];
      for (const A of l)
        if (A.skills.some((X) => X.name === o)) {
          const X = r.find((Q) => Q.id === A.agent_id);
          J.push((X == null ? void 0 : X.name) || A.agent_name || A.agent_id);
        }
      return J;
    },
    [l, r]
  ), ee = (o) => {
    window.history.pushState({}, "", o), window.dispatchEvent(new PopStateEvent("popstate"));
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
      n.createElement(I, {
        placeholder: "搜索技能名称、描述或标签...",
        prefix: P ? n.createElement(P) : void 0,
        value: $,
        onChange: (o) => G(o.target.value),
        allowClear: !0,
        style: { maxWidth: 400 }
      }),
      n.createElement(
        "div",
        { style: { display: "flex", gap: 8 } },
        n.createElement(
          f,
          {
            icon: d ? n.createElement(d) : void 0,
            onClick: a,
            loading: t,
            size: "small"
          },
          "刷新"
        ),
        n.createElement(
          f,
          {
            type: "primary",
            icon: R ? n.createElement(R) : void 0,
            onClick: () => ee("/skill-pool"),
            size: "small"
          },
          "管理技能池"
        )
      )
    ),
    t ? n.createElement(
      "div",
      { style: { textAlign: "center", padding: 60 } },
      n.createElement(w, { size: "large" })
    ) : Y.length === 0 ? n.createElement(g, {
      description: $ ? "未找到匹配的技能" : "技能池为空"
    }) : n.createElement(
      C,
      { gutter: [12, 12] },
      ...Y.map(
        (o) => n.createElement(
          W,
          { key: o.name, xs: 24, sm: 12, md: 8, lg: 6 },
          n.createElement(
            j,
            {
              hoverable: !0,
              size: "small",
              style: { cursor: "pointer", height: "100%" },
              onClick: () => {
                c(o), q(V(o.name)), y(!0);
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
              o.emoji ? n.createElement(
                "span",
                { style: { fontSize: 18 } },
                o.emoji
              ) : n.createElement(
                "span",
                { style: { fontSize: 18 } },
                "⚡"
              ),
              n.createElement(
                L,
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
              o.protected ? n.createElement(
                S,
                { color: "gold", style: { fontSize: 10 } },
                "内置"
              ) : null
            ),
            o.description ? n.createElement(
              F,
              {
                type: "secondary",
                style: { fontSize: 11, margin: 0, lineHeight: 1.4 },
                ellipsis: { rows: 2 }
              },
              o.description
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
              o.version_text ? n.createElement(
                S,
                { style: { fontSize: 10 } },
                `v${o.version_text}`
              ) : null,
              ...(o.tags || []).slice(0, 3).map(
                (J, A) => n.createElement(
                  S,
                  { key: A, color: "cyan", style: { fontSize: 10 } },
                  J
                )
              )
            )
          )
        )
      )
    ),
    // Skill detail drawer
    s ? n.createElement(
      N,
      {
        title: n.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 8 } },
          n.createElement(
            "span",
            { style: { fontSize: 18 } },
            s.emoji || "⚡"
          ),
          n.createElement("span", null, s.name)
        ),
        open: m,
        onClose: () => y(!1),
        width: 520,
        extra: n.createElement(
          f,
          {
            type: "primary",
            size: "small",
            icon: O ? n.createElement(O) : void 0,
            onClick: () => ee("/skills")
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
          s.name
        ),
        n.createElement(
          _.Item,
          { label: "描述" },
          s.description || "-"
        ),
        s.version_text ? n.createElement(
          _.Item,
          { label: "版本" },
          s.version_text
        ) : null,
        n.createElement(
          _.Item,
          { label: "来源" },
          s.source || "-"
        ),
        n.createElement(
          _.Item,
          { label: "受保护" },
          s.protected ? "是（内置）" : "否"
        ),
        s.sync_status ? n.createElement(
          _.Item,
          { label: "同步状态" },
          s.sync_status
        ) : null,
        s.installed_from ? n.createElement(
          _.Item,
          { label: "安装来源" },
          s.installed_from
        ) : null
      ),
      // Tags
      s.tags && s.tags.length > 0 ? n.createElement(
        "div",
        { style: { marginTop: 16 } },
        n.createElement(
          L,
          {
            strong: !0,
            style: { display: "block", marginBottom: 8 }
          },
          "标签"
        ),
        n.createElement(
          "div",
          { style: { display: "flex", flexWrap: "wrap", gap: 4 } },
          ...s.tags.map(
            (o, J) => n.createElement(S, { key: J, color: "cyan" }, o)
          )
        )
      ) : null,
      // Installed agents
      n.createElement(
        "div",
        { style: { marginTop: 16 } },
        n.createElement(
          L,
          { strong: !0, style: { display: "block", marginBottom: 8 } },
          `已安装此技能的专家 (${H.length})`
        ),
        H.length > 0 ? n.createElement(M, {
          size: "small",
          dataSource: H,
          renderItem: (o) => n.createElement(
            M.Item,
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
                L,
                { style: { fontSize: 13 } },
                o
              )
            )
          )
        }) : n.createElement(
          L,
          { type: "secondary", style: { fontSize: 12 } },
          "暂无专家安装此技能"
        )
      )
    ) : null
  );
}
function $t() {
  const e = u().React, { useState: l, useEffect: r, useCallback: t, useMemo: a } = e, { Tabs: n, message: i } = u().antd, { ThunderboltOutlined: v, AppstoreOutlined: T } = u().antdIcons || {}, g = u().useSelectedAgent, I = g ? g() : null, f = (I == null ? void 0 : I.id) || "default", [C, W] = l([]), [j, S] = l([]), [z, N] = l([]), [_, M] = l(!0), [d, P] = l("agent-skills"), R = t(async () => {
    M(!0);
    try {
      const [$, G, m] = await Promise.all([
        We(),
        Oe(),
        tt()
      ]);
      S($), W(G), N(m);
    } catch ($) {
      i.error($.message || "加载技能列表失败"), S([]);
    } finally {
      M(!1);
    }
  }, []);
  r(() => {
    R();
  }, [R]);
  const O = a(() => {
    const $ = C.find((G) => G.id === f);
    return ($ == null ? void 0 : $.name) || f;
  }, [C, f]), L = ($) => {
    window.history.pushState({}, "", $), window.dispatchEvent(new PopStateEvent("popstate"));
  }, F = [
    {
      key: "agent-skills",
      label: e.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        v ? e.createElement(v, { style: { fontSize: 14 } }) : null,
        "当前Agent加载技能"
      ),
      children: e.createElement(Ot, {
        agentId: f,
        agentName: O,
        onNavigate: L
      })
    },
    {
      key: "skill-pool",
      label: e.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        T ? e.createElement(T, { style: { fontSize: 14 } }) : null,
        "技能池"
      ),
      children: e.createElement(_t, {
        poolSkills: j,
        workspaceSkills: z,
        agents: C,
        loading: _,
        onReload: R
      })
    }
  ];
  return e.createElement(
    "div",
    { style: { padding: 24 } },
    e.createElement(ke, {
      title: "技能",
      subtitle: `技能池共 ${j.length} 个技能 · 当前智能体：${O}`
    }),
    e.createElement(n, {
      items: F,
      activeKey: d,
      onChange: ($) => P($)
    })
  );
}
async function Rt() {
  return ne("/market/providers");
}
async function Mt(e) {
  return ne(
    `/market/categories?lang=${encodeURIComponent(e)}`
  );
}
async function At(e, l, r, t, a) {
  return ne("/market/search", {
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
async function Lt(e, l, r) {
  return ne("/skills/hub/install/start", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify({
      bundle_url: l,
      enable: r
    })
  });
}
async function Bt(e, l) {
  return ne(
    `/skills/hub/install/status/${encodeURIComponent(l)}`,
    {
      headers: { "X-Agent-Id": e }
    }
  );
}
function jt() {
  const e = u().React, { useState: l, useEffect: r, useCallback: t, useMemo: a, useRef: n } = e, {
    Spin: i,
    Empty: v,
    Input: T,
    Button: w,
    message: g,
    Row: I,
    Col: f,
    Card: C,
    Tag: W,
    Tooltip: j,
    Typography: S,
    Select: z,
    Drawer: N,
    Descriptions: _,
    Tabs: M,
    Badge: d,
    Progress: P
  } = u().antd, {
    ReloadOutlined: R,
    SearchOutlined: O,
    DownloadOutlined: L,
    AppstoreOutlined: F,
    ShopOutlined: $,
    CheckCircleOutlined: G,
    LoadingOutlined: m,
    UserOutlined: y
  } = u().antdIcons || {}, { Text: s, Paragraph: c, Title: H } = S, [q, Y] = l("skills"), [V, ee] = l([]), [o, J] = l([]), [A, X] = l([]), [Q, E] = l(""), [B, Z] = l(""), [h, le] = l(!1), [oe, fe] = l(!1), [ye, k] = l(
    {}
  ), [U, re] = l(null), [me, pe] = l({}), [b, D] = l([]), [x, K] = l(""), [te, Ee] = l(""), se = n(null);
  r(() => {
    Promise.all([
      Rt().catch(() => []),
      Mt("zh").catch(() => []),
      Oe().catch(() => [])
    ]).then(([p, ae, ie]) => {
      ee(p), J(ae), D(ie), ie.length > 0 && K(ie[0].id);
    });
  }, []);
  const ue = t(
    async (p, ae, ie) => {
      le(!0);
      try {
        const de = await At(
          p,
          ie,
          20,
          "zh",
          ae || void 0
        );
        ie === void 0 || Object.keys(ie).length === 0 ? X(de.results) : X((ce) => [...ce, ...de.results]);
        const Se = Object.values(de.by_provider || {}).some(
          (ce) => ce.has_more
        );
        fe(Se);
        const ge = {};
        for (const [ce, he] of Object.entries(de.by_provider || {}))
          ge[ce] = (ie[ce] || 1) + 1;
        if (k(ge), de.errors.length > 0)
          for (const ce of de.errors)
            console.warn(
              `[ugsci] Market provider '${ce.provider}' error: ${ce.message}`
            );
      } catch (de) {
        g.error(de.message || "搜索市场失败"), X([]);
      } finally {
        le(!1);
      }
    },
    []
  );
  r(() => (se.current && clearTimeout(se.current), se.current = setTimeout(() => {
    ue(Q, B, {});
  }, 400), () => {
    se.current && clearTimeout(se.current);
  }), [Q, B, ue]);
  const xe = () => {
    ue(Q, B, ye);
  }, Re = async (p) => {
    var ie;
    if (!x) {
      g.warning("请先选择安装目标专家");
      return;
    }
    const ae = `${p.source}:${p.slug}`;
    try {
      pe((ge) => ({ ...ge, [ae]: "starting" }));
      const de = await Lt(
        x,
        p.source_url,
        !0
      );
      pe((ge) => ({ ...ge, [ae]: "installing" }));
      const Se = 60;
      for (let ge = 0; ge < Se; ge++) {
        await new Promise((he) => setTimeout(he, 2e3));
        const ce = await Bt(
          x,
          de.task_id
        );
        if (ce.status === "completed" && ((ie = ce.result) != null && ie.installed)) {
          g.success(`技能「${ce.result.name || p.name}」安装成功`), pe((he) => {
            const be = { ...he };
            return delete be[ae], be;
          });
          return;
        }
        if (ce.status === "failed")
          throw new Error(ce.error || "安装失败");
        if (ce.status === "cancelled") {
          g.info("安装已取消"), pe((he) => {
            const be = { ...he };
            return delete be[ae], be;
          });
          return;
        }
      }
      throw new Error("安装超时");
    } catch (de) {
      g.error(de.message || "安装技能失败"), pe((Se) => {
        const ge = { ...Se };
        return delete ge[ae], ge;
      });
    }
  }, Ke = (p) => {
    window.history.pushState({}, "", p), window.dispatchEvent(new PopStateEvent("popstate"));
  }, Me = V.filter((p) => p.available), Xe = e.createElement(
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
        prefix: O ? e.createElement(O) : void 0,
        value: Q,
        onChange: (p) => E(p.target.value),
        allowClear: !0,
        style: { flex: 1, minWidth: 200, maxWidth: 400 }
      }),
      o.length > 0 ? e.createElement(z, {
        value: B || void 0,
        onChange: (p) => Z(p || ""),
        placeholder: "全部分类",
        allowClear: !0,
        style: { minWidth: 150 },
        options: [
          { value: "", label: "全部分类" },
          ...o.map((p) => ({ value: p.id, label: p.label }))
        ]
      }) : null,
      // Install target selector
      e.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 4 } },
        e.createElement(
          s,
          { type: "secondary", style: { fontSize: 12 } },
          "安装到"
        ),
        e.createElement(z, {
          value: x || void 0,
          onChange: (p) => K(p),
          style: { minWidth: 140 },
          placeholder: "选择专家",
          options: b.map((p) => ({ value: p.id, label: p.name }))
        })
      )
    ),
    // Provider badges
    Me.length > 0 ? e.createElement(
      "div",
      {
        style: {
          marginBottom: 12,
          display: "flex",
          gap: 4,
          flexWrap: "wrap"
        }
      },
      ...Me.map(
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
    h && A.length === 0 ? e.createElement(
      "div",
      { style: { textAlign: "center", padding: 60 } },
      e.createElement(i, { size: "large" })
    ) : A.length === 0 ? e.createElement(v, {
      description: Q ? `未找到匹配「${Q}」的技能` : "输入关键词搜索技能市场",
      image: v.PRESENTED_IMAGE_SIMPLE
    }) : e.createElement(
      I,
      { gutter: [12, 12] },
      ...A.map((p) => {
        const ae = `${p.source}:${p.slug}`, ie = me[ae];
        return e.createElement(
          f,
          { key: ae, xs: 24, sm: 12, md: 8, lg: 6 },
          e.createElement(
            C,
            {
              hoverable: !0,
              size: "small",
              style: { height: "100%", cursor: "pointer" },
              onClick: () => re(p)
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
                j,
                { title: p.name },
                e.createElement(
                  s,
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
              c,
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
                w,
                {
                  size: "small",
                  disabled: !0,
                  icon: m ? e.createElement(m) : void 0
                },
                ie === "starting" ? "启动中" : "安装中"
              ) : e.createElement(
                w,
                {
                  type: "primary",
                  size: "small",
                  icon: L ? e.createElement(L) : void 0,
                  onClick: (de) => {
                    de.stopPropagation(), Re(p);
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
    oe && !h ? e.createElement(
      "div",
      { style: { textAlign: "center", marginTop: 16 } },
      e.createElement(
        w,
        { onClick: xe, loading: h },
        "加载更多"
      )
    ) : null,
    // Detail Drawer
    U ? e.createElement(
      N,
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
        onClose: () => re(null),
        width: 480,
        extra: e.createElement(
          w,
          {
            type: "primary",
            icon: L ? e.createElement(L) : void 0,
            onClick: () => {
              Re(U);
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
          U.source
        ),
        e.createElement(
          _.Item,
          { label: "描述" },
          U.description || "-"
        ),
        U.version ? e.createElement(
          _.Item,
          { label: "版本" },
          U.version
        ) : null,
        U.author ? e.createElement(
          _.Item,
          { label: "作者" },
          U.author
        ) : null,
        e.createElement(
          _.Item,
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
          s,
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
            ([p, ae]) => e.createElement(
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
                String(ae)
              ),
              e.createElement(
                s,
                { type: "secondary", style: { fontSize: 11 } },
                p
              )
            )
          )
        )
      ) : null
    ) : null
  ), qe = a(() => {
    if (!te.trim()) return ze;
    const p = te.toLowerCase();
    return ze.filter(
      (ae) => ae.name.toLowerCase().includes(p) || ae.description.toLowerCase().includes(p) || ae.category.toLowerCase().includes(p)
    );
  }, [te]), Ye = async (p) => {
    try {
      const ae = await ne("/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: p.name,
          description: p.description,
          skill_names: p.recommendedSkills
        })
      });
      await $e(ae.id, "AGENTS.md", p.systemPrompt);
      const ie = await Te(ae.id);
      ie.approval_level = p.approvalLevel, await ne(`/agents/${encodeURIComponent(ae.id)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ie)
      }), g.success(`专家「${p.name}」创建成功，已跳转至专家`), Ke("/ugsci-experts");
    } catch (ae) {
      g.error(ae.message || "创建专家失败");
    }
  }, Qe = e.createElement(
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
        s,
        { style: { fontSize: 13, color: "#1f4e8c" } },
        "从专家模板库选择预设专家，一键创建并配置系统提示词、审批级别和推荐技能。未来将支持从远程市场获取更多行业专家模板。"
      )
    ),
    e.createElement(T, {
      placeholder: "搜索专家模板...",
      prefix: O ? e.createElement(O) : void 0,
      value: te,
      onChange: (p) => Ee(p.target.value),
      allowClear: !0,
      style: { marginBottom: 16, maxWidth: 400 }
    }),
    e.createElement(
      I,
      { gutter: [12, 12] },
      ...qe.map(
        (p) => e.createElement(
          f,
          { key: p.id, xs: 24, sm: 12, md: 8 },
          e.createElement(
            C,
            {
              hoverable: !0,
              size: "small",
              style: { height: "100%", cursor: "pointer" },
              onClick: () => Ye(p)
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
                  s,
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
              c,
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
                s,
                { type: "secondary", style: { fontSize: 11 } },
                `推荐 ${p.recommendedSkills.length} 个技能`
              ),
              e.createElement(
                w,
                {
                  type: "primary",
                  size: "small",
                  icon: F ? e.createElement(F) : void 0
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
      $ ? e.createElement($, {
        style: { fontSize: 24, color: "#bfbfbf", marginBottom: 8 }
      }) : null,
      e.createElement(
        s,
        { type: "secondary", style: { fontSize: 12 } },
        "更多专家模板持续更新中，未来将支持 OpenScience、RPA 等行业扩展"
      )
    )
  ), Ze = [
    {
      key: "skills",
      label: e.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        F ? e.createElement(F, { style: { fontSize: 14 } }) : null,
        "技能市场"
      ),
      children: Xe
    },
    {
      key: "experts",
      label: e.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        y ? e.createElement(y, { style: { fontSize: 14 } }) : null,
        "专家模板"
      ),
      children: Qe
    }
  ];
  return e.createElement(
    "div",
    { style: { padding: 24 } },
    e.createElement(ke, {
      title: "市场",
      subtitle: "浏览技能市场 · 选择专家模板 · 随时更新能力和专家",
      extra: e.createElement(
        w,
        {
          icon: R ? e.createElement(R) : void 0,
          onClick: () => ue(Q, B, {}),
          loading: h
        },
        "刷新"
      )
    }),
    e.createElement(M, {
      items: Ze,
      activeKey: q,
      onChange: (p) => Y(p)
    })
  );
}
function Dt() {
  var w;
  const e = window.QwenPaw;
  if (!(e != null && e.menu) || !(e != null && e.route)) {
    console.warn(
      "[ugsci] QwenPaw.menu/route API not available — plugin disabled"
    );
    return;
  }
  const l = u().React, r = "ugsci", t = u().antdIcons || {}, a = t.UserSwitchOutlined, n = t.ToolOutlined, i = t.ThunderboltOutlined, v = t.ShopOutlined;
  e.route.add(r, {
    id: "ugsci.experts",
    path: "/ugsci-experts",
    component: St
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
    component: Pt
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
    component: $t
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
    component: jt
  }), e.menu.add(r, {
    id: "ugsci.market",
    location: "primary.agentScoped",
    label: () => "市场",
    icon: v ? l.createElement(v, { style: { fontSize: 16 } }) : void 0,
    route: "ugsci.market",
    order: 8,
    visible: () => ve()
  }), (w = e.sidebar) != null && w.registerSimpleModeItems ? (e.sidebar.registerSimpleModeItems([
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
      const f = e.menu.snapshot("primary.agentScoped").find((C) => C.id === g);
      f && e.menu.replace(r, g, {
        ...f,
        visible: () => !ve()
      });
    } catch {
    }
    try {
      const f = e.menu.snapshot("primary.settings").find((C) => C.id === g);
      f && e.menu.replace(r, g, {
        ...f,
        visible: () => !ve()
      });
    } catch {
    }
  }
  console.info(
    "[ugsci] Plugin registered: 4 routes + menu items, simple-mode whitelist + simplified navigation active"
  );
}
function Pe() {
  try {
    Dt();
  } catch (e) {
    console.error("[ugsci] Failed to build plugin:", e), setTimeout(Pe, 500);
  }
}
var De;
if ((De = window.QwenPaw) != null && De.host)
  Pe();
else {
  const e = setInterval(() => {
    var l;
    (l = window.QwenPaw) != null && l.host && (clearInterval(e), Pe());
  }, 200);
  setTimeout(() => clearInterval(e), 1e4);
}
