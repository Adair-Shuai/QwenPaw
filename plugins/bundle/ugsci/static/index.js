function E() {
  var n;
  const e = (n = window.QwenPaw) == null ? void 0 : n.host;
  if (!e) throw new Error("[ugsci] QwenPaw.host not available");
  return e;
}
function Qe() {
  try {
    return E().getApiToken() || "";
  } catch {
    return "";
  }
}
function De(e) {
  return E().getApiUrl(e);
}
function Ne(e) {
  const n = Qe();
  return {
    "Content-Type": "application/json",
    ...n ? { Authorization: `Bearer ${n}` } : {},
    ...e
  };
}
async function te(e, n) {
  const a = await fetch(De(e), {
    ...n,
    headers: { ...Ne(), ...(n == null ? void 0 : n.headers) || {} }
  });
  if (!a.ok) {
    const t = await a.text().catch(() => "");
    throw new Error(t || `HTTP ${a.status}`);
  }
  return a.status === 204 ? null : a.json();
}
async function Pe() {
  const e = await te("/agents");
  return (e == null ? void 0 : e.agents) || [];
}
async function Ce(e) {
  return te(`/agents/${encodeURIComponent(e)}`);
}
async function Ze(e) {
  return await te("/skills", {
    headers: { "X-Agent-Id": e }
  }) || [];
}
async function Fe() {
  return await te("/skills/pool") || [];
}
async function et() {
  return await te("/skills/workspaces") || [];
}
async function We() {
  return await te("/mcp") || [];
}
function tt(e) {
  if (!e || typeof e != "object") return [];
  const n = e, a = n.mcpServers || n;
  return !a || typeof a != "object" ? [] : Object.keys(a).filter((t) => t !== "mcpServers");
}
function ve() {
  try {
    return localStorage.getItem("qwenpaw_sidebar_mode") === "simple";
  } catch {
    return !1;
  }
}
function _e(e, n) {
  const a = E();
  return a.ReactMarkdown && a.remarkGfm ? n.createElement(
    a.ReactMarkdown,
    { remarkPlugins: [a.remarkGfm] },
    e
  ) : e.replace(/\*\*(.+?)\*\*/g, "$1").replace(/\*(.+?)\*/g, "$1").replace(/`(.+?)`/g, "$1").replace(/^#+\s*/gm, "").replace(/^[-*]\s+/gm, "• ");
}
const Te = [
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
], Ue = "ugsci_custom_teams";
function xe() {
  try {
    const e = localStorage.getItem(Ue);
    return e ? JSON.parse(e) : [];
  } catch {
    return [];
  }
}
function He(e) {
  try {
    localStorage.setItem(Ue, JSON.stringify(e));
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
async function lt(e, n) {
  const a = {
    channel: "console",
    user_id: "default",
    session_id: `team-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    input: [
      {
        role: "user",
        content: [{ type: "text", text: n }]
      }
    ]
  };
  await fetch(De("/console/chat"), {
    method: "POST",
    headers: {
      ...Ne(),
      "X-Agent-Id": e
    },
    body: JSON.stringify(a)
  });
}
function we(e, n) {
  const a = e.find(
    (l) => l.name === n || l.name === n.replace(/\s+/g, "")
  );
  if (a) return a.id;
  const t = e.find(
    (l) => l.name.includes(n) || n.includes(l.name) || l.name.replace(/\s+/g, "").includes(n.replace(/\s+/g, ""))
  );
  return t ? t.id : null;
}
function at(e) {
  var a;
  const n = e.members.map((t) => `- ${t.emoji} ${t.name}（${t.role}）`).join(`
`);
  if (e.custom && e.steps && e.steps.length > 0) {
    const t = e.steps.map((r, s) => {
      const y = r.passContext ? "（传递上一步的结果作为上下文）" : "（独立执行，不传递上下文）";
      return `${s + 1}. 向「${r.agentName}」发送请求：${r.instruction} ${y}`;
    }).join(`
`);
    return `${e.mode === "pipeline" ? "请按顺序依次执行以下步骤，每步使用 chat_with_agent 咨询对应专家：" : e.mode === "roundtable" ? "请同时向以下专家分别发送独立请求（不传递上下文），收集所有结果后综合：" : `你是团队协调者（${e.coordinatorName || ((a = e.members[0]) == null ? void 0 : a.name) || ""}），请按需调用以下专家完成任务：`}

---

## 团队任务

${e.taskTemplate}

---

## 执行步骤

${t}

---

## 团队成员

${n}

---

请现在开始执行团队任务。首先使用 list_agents() 确认可用专家，然后按照上述步骤依次/同时咨询各成员。每步结果请明确标注来自哪位专家。`;
  }
  return `${e.orchestrationPrompt}

---

## 团队任务

${e.taskTemplate}

---

## 团队成员

${n}

---

请现在开始执行团队任务。首先使用 list_agents() 查看可用专家，然后按照上述流程依次咨询各成员。`;
}
function rt({ team: e }) {
  const n = E().React, { Typography: a, Tag: t } = E().antd, { Text: l } = a, r = {
    pipeline: "→",
    roundtable: "⇄",
    coordinator: "⊙"
  }, s = {
    pipeline: "#13c2c2",
    roundtable: "#722ed1",
    coordinator: "#1677ff"
  }, y = e.steps || [], S = y.length > 0;
  return n.createElement(
    "div",
    {
      style: {
        padding: "12px 16px",
        background: "#fafafa",
        borderRadius: 8,
        border: "1px dashed #d9d9d9"
      }
    },
    n.createElement(
      l,
      {
        type: "secondary",
        style: { fontSize: 12, display: "block", marginBottom: 8 }
      },
      `执行流程 (${e.mode === "pipeline" ? "流水线" : e.mode === "roundtable" ? "圆桌讨论" : "协调者模式"})`
    ),
    // Visual flow
    n.createElement(
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
      ...S ? y.map((k, x) => {
        const P = e.members.find(
          (T) => T.name === k.agentName
        );
        return [
          x > 0 && e.mode !== "roundtable" ? n.createElement(
            "div",
            {
              key: `arrow-${x}`,
              style: {
                textAlign: "center",
                color: s[e.mode],
                fontSize: 14
              }
            },
            r[e.mode]
          ) : null,
          n.createElement(
            "div",
            {
              key: `step-${x}`,
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
            n.createElement(
              "span",
              { style: { fontSize: 16 } },
              (P == null ? void 0 : P.emoji) || "👤"
            ),
            n.createElement(
              "div",
              null,
              n.createElement(
                l,
                { strong: !0, style: { fontSize: 12 } },
                k.agentName
              ),
              n.createElement(
                "div",
                {
                  style: {
                    fontSize: 11,
                    color: "#8c8c8c",
                    maxWidth: 250
                  }
                },
                k.instruction
              ),
              k.passContext ? n.createElement(
                t,
                {
                  color: "blue",
                  style: { fontSize: 9, marginTop: 2 }
                },
                "传递上下文"
              ) : n.createElement(
                t,
                { style: { fontSize: 9, marginTop: 2 } },
                "独立"
              )
            )
          )
        ];
      }).flat() : e.members.map((k, x) => [
        x > 0 && e.mode !== "roundtable" ? n.createElement(
          "div",
          {
            key: `arrow-${x}`,
            style: {
              textAlign: "center",
              color: s[e.mode],
              fontSize: 14
            }
          },
          r[e.mode]
        ) : null,
        n.createElement(
          "div",
          {
            key: `member-${x}`,
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
          n.createElement("span", { style: { fontSize: 16 } }, k.emoji),
          n.createElement(
            "div",
            null,
            n.createElement(
              l,
              { strong: !0, style: { fontSize: 12 } },
              k.name
            ),
            n.createElement(
              "div",
              { style: { fontSize: 11, color: "#8c8c8c" } },
              k.role
            )
          )
        )
      ]).flat()
    )
  );
}
function ot({
  open: e,
  onClose: n,
  agents: a,
  editingTeam: t,
  onSaved: l
}) {
  const r = E().React, { useState: s, useEffect: y, useCallback: S } = r, {
    Modal: k,
    Input: x,
    Button: P,
    Select: T,
    Tag: z,
    Typography: V,
    Switch: D,
    Empty: w,
    message: C,
    Divider: J,
    Steps: A
  } = E().antd, { PlusOutlined: N, DeleteOutlined: p, SaveOutlined: I, ArrowRightOutlined: L } = E().antdIcons || {}, { Text: M, Paragraph: H } = V, [F, X] = s(""), [ne, h] = s("🤝"), [u, o] = s(""), [_, Y] = s(
    "pipeline"
  ), [Q, $] = s(""), [B, Z] = s(""), [i, ee] = s([]), [j, K] = s([]), [O, v] = s(!1);
  y(() => {
    e && (t ? (X(t.name), h(t.emoji), o(t.description), Y(t.mode), $(t.coordinatorName || ""), Z(t.taskTemplate), ee(t.steps || []), K(t.members.map((m) => m.name))) : (X(""), h("🤝"), o(""), Y("pipeline"), $(""), Z(`请执行以下任务：
任务描述：{任务描述}`), ee([]), K([])));
  }, [e, t]);
  const g = S(() => {
    if (_ === "roundtable") {
      const m = j.map((le) => ({
        agentName: le,
        instruction: "请给出你的专业评估意见",
        passContext: !1
      }));
      ee(m);
    } else if (_ === "pipeline") {
      const m = new Map(i.map((oe) => [oe.agentName, oe])), le = j.map((oe) => m.get(oe) || {
        agentName: oe,
        instruction: "请完成你的专业部分",
        passContext: !0
      });
      ee(le);
    }
  }, [_, j, i]), R = (m) => {
    j.includes(m) || (K([...j, m]), _ === "coordinator" && !Q && $(m));
  }, c = (m) => {
    K(j.filter((le) => le !== m)), ee(i.filter((le) => le.agentName !== m)), Q === m && $(j[0] || "");
  }, q = (m, le, oe) => {
    const se = [...i];
    se[m] = { ...se[m], [le]: oe }, ee(se);
  }, re = () => {
    if (!F.trim()) {
      C.warning("请输入团队名称");
      return;
    }
    if (j.length < 2) {
      C.warning("至少需要选择 2 个成员");
      return;
    }
    if (!B.trim()) {
      C.warning("请输入任务模板");
      return;
    }
    if (_ === "coordinator" && !Q) {
      C.warning("请选择协调者");
      return;
    }
    v(!0);
    try {
      const m = j.map(
        (W) => {
          var b;
          const G = a.find((U) => U.name === W);
          return {
            name: W,
            role: ((b = G == null ? void 0 : G.description) == null ? void 0 : b.slice(0, 30)) || "团队成员",
            emoji: "👤"
          };
        }
      );
      let le = i;
      (i.length === 0 || i.length !== j.length) && (le = j.map((W) => ({
        agentName: W,
        instruction: "请完成你的专业部分",
        passContext: _ === "pipeline"
      })));
      const oe = {
        id: (t == null ? void 0 : t.id) || `custom-${Date.now()}`,
        name: F.trim(),
        emoji: ne,
        category: "自定义",
        description: u.trim() || `${F.trim()}（${j.length}人团队）`,
        mode: _,
        members: m,
        coordinatorName: _ === "coordinator" ? Q : void 0,
        taskTemplate: B.trim(),
        orchestrationPrompt: "",
        // Custom teams use steps-based instructions
        steps: le,
        custom: !0,
        createdAt: (t == null ? void 0 : t.createdAt) || Date.now()
      }, se = xe(), f = se.findIndex((W) => W.id === oe.id);
      f >= 0 ? se[f] = oe : se.push(oe), He(se), C.success(t ? "团队已更新" : "团队已创建"), l(), n();
    } catch (m) {
      C.error(m.message || "保存失败");
    } finally {
      v(!1);
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
  ], fe = a.filter(
    (m) => !j.includes(m.name)
  );
  return r.createElement(
    k,
    {
      open: e,
      onCancel: n,
      title: r.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 8 } },
        r.createElement(
          "span",
          { style: { fontSize: 20 } },
          t ? "✏️" : "➕"
        ),
        r.createElement(
          "span",
          null,
          t ? "编辑专家团" : "创建专家团"
        )
      ),
      width: 720,
      onOk: re,
      okText: "保存团队",
      confirmLoading: O,
      okButtonProps: {
        icon: I ? r.createElement(I) : void 0
      }
    },
    // Step 1: Basic info
    r.createElement(
      "div",
      { style: { marginBottom: 16 } },
      r.createElement(
        M,
        {
          strong: !0,
          style: { display: "block", marginBottom: 8, fontSize: 13 }
        },
        "1. 基本信息"
      ),
      r.createElement(
        "div",
        { style: { display: "flex", gap: 8, marginBottom: 8 } },
        r.createElement(T, {
          value: ne,
          onChange: (m) => h(m),
          style: { width: 60 },
          options: ye.map((m) => ({ value: m, label: m })),
          optionRender: (m) => r.createElement("span", { style: { fontSize: 18 } }, m.value)
        }),
        r.createElement(x, {
          placeholder: "团队名称（如：储层评价团队）",
          value: F,
          onChange: (m) => X(m.target.value),
          style: { flex: 1 }
        })
      ),
      r.createElement(x.TextArea, {
        placeholder: "团队描述（简述团队的目标和适用场景）",
        value: u,
        onChange: (m) => o(m.target.value),
        rows: 2,
        style: { marginBottom: 8 }
      }),
      r.createElement(
        "div",
        { style: { display: "flex", gap: 8, alignItems: "center" } },
        r.createElement(
          M,
          { type: "secondary", style: { fontSize: 12 } },
          "协同模式："
        ),
        r.createElement(T, {
          value: _,
          onChange: (m) => Y(m),
          style: { width: 160 },
          options: [
            { value: "pipeline", label: "🔄 流水线（依次执行）" },
            { value: "roundtable", label: "🔀 圆桌讨论（独立评估）" },
            { value: "coordinator", label: "🎯 协调者（由协调者主导）" }
          ]
        })
      )
    ),
    r.createElement(J, { style: { margin: "12px 0" } }),
    // Step 2: Select members
    r.createElement(
      "div",
      { style: { marginBottom: 16 } },
      r.createElement(
        M,
        {
          strong: !0,
          style: { display: "block", marginBottom: 8, fontSize: 13 }
        },
        "2. 选择团队成员"
      ),
      // Available agents
      fe.length > 0 ? r.createElement(
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
          (m) => r.createElement(
            P,
            {
              key: m.id,
              size: "small",
              icon: N ? r.createElement(N) : void 0,
              onClick: () => R(m.name)
            },
            m.name
          )
        )
      ) : null,
      // Selected members
      j.length === 0 ? r.createElement(w, {
        description: "请从上方添加团队成员",
        image: w.PRESENTED_IMAGE_SIMPLE
      }) : r.createElement(
        "div",
        { style: { display: "flex", flexDirection: "column", gap: 4 } },
        ...j.map(
          (m) => r.createElement(
            "div",
            {
              key: m,
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
                M,
                { strong: !0, style: { fontSize: 13 } },
                m
              ),
              _ === "coordinator" && Q === m ? r.createElement(
                z,
                { color: "blue", style: { fontSize: 10 } },
                "协调者"
              ) : null
            ),
            r.createElement(
              "div",
              { style: { display: "flex", gap: 4 } },
              _ === "coordinator" ? r.createElement(
                P,
                {
                  size: "small",
                  type: "link",
                  onClick: () => $(m)
                },
                "设为协调者"
              ) : null,
              r.createElement(
                P,
                {
                  size: "small",
                  type: "link",
                  danger: !0,
                  icon: p ? r.createElement(p) : void 0,
                  onClick: () => c(m)
                },
                "移除"
              )
            )
          )
        )
      )
    ),
    r.createElement(J, { style: { margin: "12px 0" } }),
    // Step 3: Define execution steps (for pipeline/roundtable)
    j.length > 0 ? r.createElement(
      "div",
      { style: { marginBottom: 16 } },
      r.createElement(
        M,
        {
          strong: !0,
          style: { display: "block", marginBottom: 8, fontSize: 13 }
        },
        `3. 编排执行步骤${_ === "roundtable" ? "（各步独立执行）" : _ === "pipeline" ? "（依次执行，可传递上下文）" : "（由协调者决定调用顺序）"}`
      ),
      // Auto-sync button
      r.createElement(
        P,
        {
          size: "small",
          type: "dashed",
          onClick: g,
          style: { marginBottom: 8 }
        },
        "自动生成步骤"
      ),
      // Steps list
      i.length === 0 ? r.createElement(
        M,
        { type: "secondary", style: { fontSize: 12 } },
        "点击「自动生成步骤」或手动配置每步的指令"
      ) : r.createElement(
        "div",
        { style: { display: "flex", flexDirection: "column", gap: 6 } },
        ...i.map(
          (m, le) => r.createElement(
            "div",
            {
              key: le,
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
              _ === "pipeline" ? r.createElement(
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
                `${le + 1}`
              ) : r.createElement(
                "span",
                { style: { fontSize: 14 } },
                "🔀"
              ),
              r.createElement(
                z,
                { color: "blue", style: { fontSize: 11 } },
                m.agentName
              ),
              r.createElement(
                "div",
                { style: { flex: 1 } },
                r.createElement(x, {
                  placeholder: "请输入该步骤的指令...",
                  value: m.instruction,
                  onChange: (oe) => q(le, "instruction", oe.target.value),
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
              r.createElement(D, {
                size: "small",
                checked: m.passContext,
                onChange: (oe) => q(le, "passContext", oe)
              }),
              r.createElement(
                M,
                { type: "secondary", style: { fontSize: 11 } },
                m.passContext ? "传递上一步结果作为上下文" : "独立执行"
              )
            )
          )
        )
      )
    ) : null,
    r.createElement(J, { style: { margin: "12px 0" } }),
    // Step 4: Task template
    r.createElement(
      "div",
      null,
      r.createElement(
        M,
        {
          strong: !0,
          style: { display: "block", marginBottom: 8, fontSize: 13 }
        },
        `${j.length > 0 ? "4" : "3"}. 任务模板`
      ),
      r.createElement(x.TextArea, {
        placeholder: `输入任务模板，可用 {参数名} 作为占位符...

例如：
请对区块 {区块名} 的井 {井号} 进行储层评价`,
        value: B,
        onChange: (m) => Z(m.target.value),
        rows: 4,
        style: { fontFamily: "monospace", fontSize: 13 }
      }),
      r.createElement(
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
function Re({
  team: e,
  agents: n,
  onLaunch: a,
  onEdit: t,
  onDelete: l
}) {
  var u;
  const r = E().React, { useState: s } = r, { Card: y, Tag: S, Typography: k, Button: x, Tooltip: P } = E().antd, {
    TeamOutlined: T,
    RocketOutlined: z,
    UserOutlined: V,
    EditOutlined: D,
    DeleteOutlined: w,
    DownOutlined: C,
    UpOutlined: J
  } = E().antdIcons || {}, { Text: A, Paragraph: N } = k, [p, I] = s(!1), L = {
    coordinator: { label: "协调者模式", color: "blue" },
    pipeline: { label: "流水线模式", color: "cyan" },
    roundtable: { label: "圆桌讨论", color: "purple" }
  }, M = L[e.mode] || L.coordinator, H = e.members.map((o) => {
    const _ = we(n, o.name);
    return { ...o, found: !!_, agentId: _ };
  }), F = H.filter((o) => o.found).length, X = F === e.members.length, ne = e.coordinatorName || ((u = e.members[0]) == null ? void 0 : u.name), h = ne ? we(n, ne) : null;
  return r.createElement(
    y,
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
            A,
            { strong: !0, style: { fontSize: 14 } },
            e.name
          ),
          e.custom ? r.createElement(
            S,
            { color: "gold", style: { fontSize: 9 } },
            "自定义"
          ) : null
        ),
        r.createElement(
          "div",
          { style: { display: "flex", gap: 4, marginTop: 4 } },
          r.createElement(
            S,
            { color: M.color, style: { fontSize: 10 } },
            M.label
          ),
          r.createElement(
            S,
            { style: { fontSize: 10 } },
            `${F}/${e.members.length}`
          ),
          X ? null : r.createElement(
            S,
            { color: "orange", style: { fontSize: 10 } },
            "缺少成员"
          )
        )
      ),
      // Edit/delete for custom teams
      e.custom ? r.createElement(
        "div",
        { style: { display: "flex", gap: 2 } },
        t ? r.createElement(
          P,
          { title: "编辑" },
          r.createElement(x, {
            type: "text",
            size: "small",
            icon: D ? r.createElement(D) : void 0,
            onClick: (o) => {
              o.stopPropagation(), t(e);
            }
          })
        ) : null,
        l ? r.createElement(
          P,
          { title: "删除" },
          r.createElement(x, {
            type: "text",
            size: "small",
            danger: !0,
            icon: w ? r.createElement(w) : void 0,
            onClick: (o) => {
              o.stopPropagation(), l(e);
            }
          })
        ) : null
      ) : null
    ),
    // Description
    r.createElement(
      N,
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
      ...H.map(
        (o) => r.createElement(
          P,
          {
            key: o.name,
            title: `${o.name}（${o.role}）${o.found ? "" : " - 未创建"}`
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
                background: o.found ? "#f0f5ff" : "#fff2f0",
                border: `1px solid ${o.found ? "#d6e4ff" : "#ffccc7"}`,
                fontSize: 11
              }
            },
            r.createElement("span", null, o.emoji),
            r.createElement(
              A,
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
    r.createElement(
      x,
      {
        type: "link",
        size: "small",
        style: { padding: "0 0 4px 0", fontSize: 11, height: "auto" },
        onClick: (o) => {
          o.stopPropagation(), I(!p);
        },
        icon: p ? J ? r.createElement(J) : "▲" : C ? r.createElement(C) : "▼"
      },
      p ? "收起流程" : "查看执行流程"
    ),
    p ? r.createElement(rt, { team: e }) : null,
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
        A,
        { type: "secondary", style: { fontSize: 11 } },
        ne ? `协调者: ${ne}` : ""
      ),
      r.createElement(
        x,
        {
          type: "primary",
          size: "small",
          icon: z ? r.createElement(z) : void 0,
          disabled: !h,
          onClick: () => a(e)
        },
        "发起团队任务"
      )
    )
  );
}
function st({
  agents: e,
  onLaunch: n
}) {
  const a = E().React, { useMemo: t, useState: l, useCallback: r, useEffect: s } = a, {
    Row: y,
    Col: S,
    Input: k,
    Empty: x,
    Typography: P,
    Tag: T,
    Button: z,
    Divider: V,
    message: D,
    Popconfirm: w
  } = E().antd, { SearchOutlined: C, TeamOutlined: J, PlusOutlined: A, RocketOutlined: N } = E().antdIcons || {}, { Text: p } = P, [I, L] = l(""), [M, H] = l([]), [F, X] = l(!1), [ne, h] = l(null);
  s(() => {
    H(xe());
  }, []);
  const u = r(() => {
    H(xe());
  }, []), o = r(
    (i) => {
      const j = xe().filter((K) => K.id !== i.id);
      He(j), H(j), D.success(`团队「${i.name}」已删除`);
    },
    [D]
  ), _ = r((i) => {
    h(i), X(!0);
  }, []), Y = r(() => {
    h(null), X(!0);
  }, []), Q = t(() => [...M, ...nt], [M]), $ = t(() => {
    if (!I.trim()) return Q;
    const i = I.toLowerCase();
    return Q.filter(
      (ee) => ee.name.toLowerCase().includes(i) || ee.description.toLowerCase().includes(i) || ee.category.toLowerCase().includes(i)
    );
  }, [Q, I]), B = $.filter((i) => i.custom), Z = $.filter((i) => !i.custom);
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
        p,
        { style: { fontSize: 13, color: "#389e0d" } },
        "多智能体协同 — 选择预设团队或创建自定义团队，支持流水线、圆桌讨论、协调者三种编排模式。"
      ),
      a.createElement(
        z,
        {
          type: "primary",
          size: "small",
          icon: A ? a.createElement(A) : void 0,
          onClick: Y
        },
        "创建专家团"
      )
    ),
    // Search
    a.createElement(k, {
      placeholder: "搜索团队名称、描述或类别...",
      prefix: C ? a.createElement(C) : void 0,
      value: I,
      onChange: (i) => L(i.target.value),
      allowClear: !0,
      style: { marginBottom: 16, maxWidth: 400 }
    }),
    // Custom teams section
    B.length > 0 ? a.createElement(
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
        a.createElement("span", { style: { fontSize: 16 } }, "⭐"),
        a.createElement(
          p,
          { strong: !0, style: { fontSize: 14 } },
          `自定义团队 (${B.length})`
        )
      ),
      a.createElement(
        y,
        { gutter: [12, 12] },
        ...B.map(
          (i) => a.createElement(
            S,
            { key: i.id, xs: 24, sm: 12, md: 8 },
            a.createElement(Re, {
              team: i,
              agents: e,
              onLaunch: n,
              onEdit: _,
              onDelete: o
            })
          )
        )
      ),
      a.createElement(V, { style: { margin: "16px 0" } })
    ) : null,
    // Preset teams section
    Z.length > 0 ? a.createElement(
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
        a.createElement("span", { style: { fontSize: 16 } }, "📋"),
        a.createElement(
          p,
          { strong: !0, style: { fontSize: 14 } },
          `预设团队 (${Z.length})`
        ),
        a.createElement(
          p,
          { type: "secondary", style: { fontSize: 12 } },
          "· 行业典型工作流模板"
        )
      ),
      a.createElement(
        y,
        { gutter: [12, 12] },
        ...Z.map(
          (i) => a.createElement(
            S,
            { key: i.id, xs: 24, sm: 12, md: 8 },
            a.createElement(Re, {
              team: i,
              agents: e,
              onLaunch: n
            })
          )
        )
      )
    ) : null,
    // Empty state
    $.length === 0 ? a.createElement(x, {
      description: "未找到匹配的专家团队，点击「创建专家团」自定义",
      image: x.PRESENTED_IMAGE_SIMPLE
    }) : null,
    // Team Builder Modal
    a.createElement(ot, {
      open: F,
      onClose: () => {
        X(!1), h(null);
      },
      agents: e,
      editingTeam: ne,
      onSaved: u
    })
  );
}
function it(e) {
  var a;
  const n = [];
  for (const t of e) {
    if (t.enabled === !1) continue;
    const l = (a = t.description) == null ? void 0 : a.trim();
    if (!l) continue;
    let r = l;
    if (r = r.replace(/\*\*(.+?)\*\*/g, "$1").replace(/\*(.+?)\*/g, "$1").replace(/`(.+?)`/g, "$1").replace(/^#+\s*/gm, "").trim(), /^(用于|帮助|提供|支持|实现|完成|分析|计算|生成|创建|检查)/.test(r) ? r = `请${r}` : /^(a |an |the )/i.test(r) ? r = `Help me with ${r}` : /[。？！.?!]$/.test(r) || (r = `帮我${r}`), r.length > 80 && (r = r.substring(0, 77) + "..."), n.push(r), n.length >= 4) break;
  }
  return n;
}
async function ct(e) {
  return await te("/workspace/files", {
    headers: { "X-Agent-Id": e }
  }) || [];
}
async function $e(e, n, a) {
  await te(`/workspace/files/${encodeURIComponent(n)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify({ content: a })
  });
}
async function Ae(e, n) {
  const a = await Ce(e);
  a.system_prompt_files = n, await te(`/agents/${encodeURIComponent(e)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(a)
  });
}
async function mt(e, n) {
  await te("/skills/pool/download", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      skill_name: n,
      targets: [{ workspace_id: e }],
      overwrite: !1
    })
  });
}
async function dt(e, n) {
  await te(`/skills/${encodeURIComponent(n)}`, {
    method: "DELETE",
    headers: { "X-Agent-Id": e }
  });
}
async function pt(e, n) {
  await te(`/mcp/${encodeURIComponent(n)}`, {
    method: "DELETE",
    headers: { "X-Agent-Id": e }
  });
}
const Le = ["AGENTS.md", "SOUL.md", "PROFILE.md"];
function ke({
  title: e,
  subtitle: n,
  extra: a
}) {
  const t = E().React, { Space: l } = E().antd;
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
      n ? t.createElement(
        "div",
        { style: { marginTop: 4, fontSize: 13, color: "#8c8c8c" } },
        n
      ) : null
    ),
    a ? t.createElement(l, null, a) : null
  );
}
function Be({
  items: e,
  max: n = 5,
  color: a = "blue",
  emptyText: t = "无"
}) {
  const l = E().React, { Tag: r } = E().antd;
  return !e || e.length === 0 ? l.createElement(
    "span",
    { style: { fontSize: 12, color: "#bfbfbf" } },
    t
  ) : l.createElement(
    "div",
    { style: { display: "flex", flexWrap: "wrap", gap: 4 } },
    ...e.slice(0, n).map(
      (s, y) => l.createElement(
        r,
        { key: y, color: a, style: { fontSize: 11, marginRight: 0 } },
        s
      )
    ),
    e.length > n ? l.createElement(
      r,
      { style: { fontSize: 11, marginRight: 0 } },
      `+${e.length - n}`
    ) : null
  );
}
function ut({
  open: e,
  onClose: n,
  poolSkills: a,
  installedSkillNames: t,
  loading: l,
  onInstall: r
}) {
  const s = E().React, { useState: y, useEffect: S, useMemo: k } = s, { Modal: x, Button: P, Empty: T, Spin: z, Input: V, Tag: D, Tooltip: w, Typography: C } = E().antd, { CheckOutlined: J, SearchOutlined: A } = E().antdIcons || {}, { Text: N } = C, [p, I] = y([]), [L, M] = y("");
  S(() => {
    e && (I([]), M(""));
  }, [e]);
  const H = k(() => {
    if (!L.trim()) return a;
    const h = L.toLowerCase();
    return a.filter(
      (u) => {
        var o, _;
        return u.name.toLowerCase().includes(h) || ((o = u.description) == null ? void 0 : o.toLowerCase().includes(h)) || ((_ = u.tags) == null ? void 0 : _.some((Y) => Y.toLowerCase().includes(h)));
      }
    );
  }, [a, L]), F = H.filter(
    (h) => !t.includes(h.name)
  ), X = (h) => {
    I(
      (u) => u.includes(h) ? u.filter((o) => o !== h) : [...u, h]
    );
  }, ne = async () => {
    p.length !== 0 && (await r(p), I([]));
  };
  return s.createElement(
    x,
    {
      open: e,
      onCancel: n,
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
          N,
          { type: "secondary", style: { fontSize: 13 } },
          `已选择 ${p.length} 个技能`
        ),
        s.createElement(
          "div",
          { style: { display: "flex", gap: 8 } },
          s.createElement(P, { onClick: n }, "取消"),
          s.createElement(
            P,
            {
              type: "primary",
              onClick: ne,
              disabled: p.length === 0
            },
            p.length > 0 ? `添加 (${p.length})` : "添加"
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
      s.createElement(V, {
        placeholder: "搜索技能名称、描述或标签...",
        prefix: A ? s.createElement(A) : void 0,
        value: L,
        onChange: (h) => M(h.target.value),
        allowClear: !0,
        style: { flex: 1 }
      }),
      s.createElement(
        P,
        {
          size: "small",
          type: "primary",
          onClick: () => I(F.map((h) => h.name))
        },
        "全选"
      ),
      s.createElement(
        P,
        {
          size: "small",
          onClick: () => I([])
        },
        "清空"
      )
    ),
    // Skill grid (card style matching Skill Center)
    l ? s.createElement(
      "div",
      { style: { textAlign: "center", padding: 40 } },
      s.createElement(z, { size: "large" })
    ) : H.length === 0 ? s.createElement(T, {
      description: L ? "未找到匹配的技能" : "技能池暂无可用技能",
      image: T.PRESENTED_IMAGE_SIMPLE
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
      ...H.map((h) => {
        const u = p.includes(h.name), o = t.includes(h.name);
        return s.createElement(
          "div",
          {
            key: h.name,
            onClick: () => !o && X(h.name),
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
          u ? s.createElement(
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
            J ? s.createElement(J) : "✓"
          ) : null,
          o ? s.createElement(
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
                paddingRight: o || u ? 24 : 0
              }
            },
            s.createElement(
              "span",
              { style: { fontSize: 16 } },
              h.emoji || "⚡"
            ),
            s.createElement(
              w,
              { title: h.name },
              s.createElement(
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
                h.name
              )
            )
          ),
          h.description ? s.createElement(
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
            h.description
          ) : null,
          h.tags && h.tags.length > 0 ? s.createElement(
            "div",
            {
              style: {
                marginTop: 4,
                display: "flex",
                gap: 2,
                flexWrap: "wrap"
              }
            },
            ...h.tags.slice(0, 2).map(
              (_, Y) => s.createElement(
                D,
                {
                  key: Y,
                  color: "cyan",
                  style: { fontSize: 10, marginRight: 0 }
                },
                _
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
  onClick: n,
  onSummon: a
}) {
  const t = E().React, { Card: l, Tag: r, Badge: s, Typography: y, Spin: S, Button: k } = E().antd, { Text: x } = y, { ThunderboltOutlined: P } = E().antdIcons || {}, { agent: T, skills: z, mcps: V, loading: D } = e, w = T.enabled, C = z.filter((N) => N.enabled !== !1).map((N) => N.name), J = V.map((N) => N.name || N.key), A = T.active_model ? `${T.active_model.provider_id}/${T.active_model.model}` : null;
  return t.createElement(
    l,
    {
      hoverable: !0,
      onClick: n,
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
            x,
            { strong: !0, style: { fontSize: 15 } },
            T.name
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
            T.id
          )
        )
      ),
      t.createElement(s, {
        status: w ? "success" : "default",
        text: w ? "启用" : "停用"
      })
    ),
    // Description (rendered as markdown)
    T.description ? t.createElement(
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
      _e(T.description, t)
    ) : t.createElement(
      "div",
      { style: { fontSize: 12, color: "#bfbfbf", marginBottom: 10, minHeight: 54, flex: "1 0 auto" } },
      "暂无描述"
    ),
    // Model info
    A ? t.createElement(
      "div",
      { style: { marginBottom: 8 } },
      t.createElement(
        r,
        { color: "geekblue", style: { fontSize: 11 } },
        `🤖 ${A}`
      )
    ) : null,
    // Skills
    D ? t.createElement(S, { size: "small" }) : t.createElement(
      "div",
      { style: { marginBottom: 6 } },
      t.createElement(
        "div",
        { style: { fontSize: 11, color: "#8c8c8c", marginBottom: 4 } },
        `技能 (${C.length})`
      ),
      t.createElement(Be, {
        items: C,
        max: 4,
        color: "cyan",
        emptyText: "未配置技能"
      })
    ),
    // MCP
    !D && J.length > 0 ? t.createElement(
      "div",
      { style: { marginTop: "auto" } },
      t.createElement(
        "div",
        { style: { fontSize: 11, color: "#8c8c8c", marginBottom: 4 } },
        `MCP (${J.length})`
      ),
      t.createElement(Be, {
        items: J,
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
        k,
        {
          type: "primary",
          size: "small",
          icon: P ? t.createElement(P) : void 0,
          disabled: !w,
          onClick: (N) => {
            N.stopPropagation(), a && a();
          }
        },
        "召唤专家"
      )
    )
  );
}
function yt({
  expert: e,
  open: n,
  onClose: a,
  onRefresh: t
}) {
  const l = E().React, {
    Drawer: r,
    Descriptions: s,
    Tag: y,
    Typography: S,
    Space: k,
    Button: x,
    Empty: P,
    Tabs: T,
    List: z,
    Spin: V,
    Modal: D,
    message: w
  } = E().antd, { Text: C, Paragraph: J } = S, {
    EditOutlined: A,
    ThunderboltOutlined: N,
    FileTextOutlined: p,
    ToolOutlined: I,
    PlusOutlined: L
  } = E().antdIcons || {}, [M, H] = l.useState(!1), [F, X] = l.useState(
    []
  ), [ne, h] = l.useState(!1);
  if (!e) return null;
  const { agent: u, config: o, skills: _, mcps: Y, loading: Q } = e, $ = _.filter((c) => c.enabled !== !1), B = (c) => {
    window.history.pushState({}, "", c), window.dispatchEvent(new PopStateEvent("popstate"));
  }, Z = l.createElement(
    "div",
    null,
    l.createElement(
      s,
      { column: 1, bordered: !0, size: "small" },
      l.createElement(s.Item, { label: "专家名称" }, u.name),
      l.createElement(
        s.Item,
        { label: "专家 ID" },
        l.createElement("code", { style: { fontSize: 12 } }, u.id)
      ),
      l.createElement(
        s.Item,
        { label: "状态" },
        l.createElement(
          y,
          { color: u.enabled ? "green" : "default" },
          u.enabled ? "启用" : "停用"
        )
      ),
      l.createElement(
        s.Item,
        { label: "功能简介" },
        u.description ? _e(u.description, l) : "暂无描述"
      ),
      l.createElement(
        s.Item,
        { label: "使用模型" },
        u.active_model ? `${u.active_model.provider_id} / ${u.active_model.model}` : "使用全局默认模型"
      ),
      o != null && o.workspace_dir ? l.createElement(
        s.Item,
        { label: "工作区路径" },
        l.createElement(
          "code",
          { style: { fontSize: 11 } },
          o.workspace_dir
        )
      ) : null,
      o != null && o.approval_level ? l.createElement(
        s.Item,
        { label: "审批级别" },
        o.approval_level
      ) : null
    ),
    // System prompt files
    o != null && o.system_prompt_files && o.system_prompt_files.length > 0 ? l.createElement(
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
        p ? l.createElement(p, {
          style: { fontSize: 14, color: "#1677ff" }
        }) : null,
        l.createElement(C, { strong: !0 }, "系统提示词文件")
      ),
      l.createElement(
        k,
        { wrap: !0 },
        ...o.system_prompt_files.map(
          (c, q) => l.createElement(
            y,
            {
              key: q,
              icon: p ? l.createElement(p) : void 0,
              style: { fontSize: 12 }
            },
            c
          )
        )
      )
    ) : null
  ), i = async () => {
    H(!0), h(!0);
    try {
      const c = await Fe();
      X(c);
    } catch (c) {
      w.error(c.message || "加载技能池失败");
    } finally {
      h(!1);
    }
  }, ee = async (c) => {
    let q = 0, re = 0;
    for (const ye of c)
      try {
        await mt(u.id, ye), q++;
      } catch {
        re++;
      }
    q > 0 ? (w.success(
      `成功添加 ${q} 个技能${re > 0 ? `，${re} 个失败` : ""}`
    ), t()) : re > 0 && w.error("添加技能失败"), H(!1);
  }, j = async (c) => {
    try {
      await dt(u.id, c), w.success(`技能「${c}」已移除`), t();
    } catch (q) {
      w.error(q.message || "移除技能失败");
    }
  }, K = async (c) => {
    try {
      await pt(u.id, c), w.success(`MCP「${c}」已移除`), t();
    } catch (q) {
      w.error(q.message || "移除 MCP 失败");
    }
  }, O = Q ? l.createElement(
    "div",
    { style: { textAlign: "center", padding: 40 } },
    l.createElement(V, { size: "large" })
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
        C,
        { strong: !0 },
        `已启用技能 (${$.length})`
      ),
      l.createElement(
        x,
        {
          type: "primary",
          size: "small",
          icon: L ? l.createElement(L) : void 0,
          onClick: i
        },
        "从技能池添加"
      )
    ),
    $.length === 0 ? l.createElement(P, {
      description: "该专家暂无已启用的技能",
      image: P.PRESENTED_IMAGE_SIMPLE
    }) : l.createElement(z, {
      dataSource: $,
      renderItem: (c) => l.createElement(
        z.Item,
        {
          actions: [
            l.createElement(
              x,
              {
                type: "link",
                size: "small",
                danger: !0,
                onClick: () => j(c.name)
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
            c.emoji ? l.createElement(
              "span",
              { style: { fontSize: 16 } },
              c.emoji
            ) : null,
            l.createElement(C, { strong: !0 }, c.name),
            c.version_text ? l.createElement(
              y,
              { style: { fontSize: 10 } },
              `v${c.version_text}`
            ) : null
          ),
          c.description ? l.createElement(
            J,
            {
              type: "secondary",
              style: { fontSize: 12, margin: 0 },
              ellipsis: { rows: 2 }
            },
            c.description
          ) : null,
          c.tags && c.tags.length > 0 ? l.createElement(
            "div",
            { style: { marginTop: 4 } },
            ...c.tags.map(
              (q, re) => l.createElement(
                y,
                {
                  key: re,
                  color: "cyan",
                  style: { fontSize: 10 }
                },
                q
              )
            )
          ) : null
        )
      )
    }),
    // Skill Picker Modal (card-grid style, consistent with Skill Center)
    l.createElement(ut, {
      open: M,
      onClose: () => H(!1),
      poolSkills: F,
      installedSkillNames: $.map((c) => c.name),
      loading: ne,
      onInstall: ee
    })
  ), v = Q ? l.createElement(
    "div",
    { style: { textAlign: "center", padding: 40 } },
    l.createElement(V, { size: "large" })
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
        C,
        { strong: !0 },
        `MCP 客户端 (${Y.length})`
      ),
      l.createElement(
        x,
        {
          type: "primary",
          size: "small",
          icon: L ? l.createElement(L) : void 0,
          onClick: () => {
            window.history.pushState({}, "", `/agents/${u.id}/mcp`), window.dispatchEvent(new PopStateEvent("popstate"));
          }
        },
        "配置 MCP"
      )
    ),
    Y.length === 0 ? l.createElement(P, {
      description: "该专家暂无关联的 MCP 客户端，点击「配置 MCP」添加",
      image: P.PRESENTED_IMAGE_SIMPLE
    }) : l.createElement(z, {
      dataSource: Y,
      renderItem: (c) => l.createElement(
        z.Item,
        {
          actions: [
            l.createElement(
              x,
              {
                type: "link",
                size: "small",
                danger: !0,
                onClick: () => K(c.key)
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
              C,
              { strong: !0 },
              c.name || c.key
            ),
            l.createElement(
              y,
              {
                color: c.enabled ? "green" : "default",
                style: { fontSize: 10 }
              },
              c.enabled ? "启用" : "停用"
            ),
            l.createElement(
              y,
              { color: "purple", style: { fontSize: 10 } },
              c.transport
            )
          ),
          c.description ? l.createElement(
            J,
            {
              type: "secondary",
              style: { fontSize: 12, margin: 0 },
              ellipsis: { rows: 2 }
            },
            c.description
          ) : null,
          c.tools && c.tools.length > 0 ? l.createElement(
            "div",
            {
              style: {
                marginTop: 4,
                fontSize: 11,
                color: "#8c8c8c"
              }
            },
            `提供 ${c.tools.length} 个工具`
          ) : null
        )
      )
    })
  ), g = o != null && o.tools ? l.createElement(
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
        I ? l.createElement(I, {
          style: { fontSize: 14, color: "#1677ff" }
        }) : null,
        l.createElement(C, { strong: !0 }, "工具配置")
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
        JSON.stringify(o.tools, null, 2)
      )
    )
  ) : l.createElement(P, {
    description: "暂无工具配置",
    image: P.PRESENTED_IMAGE_SIMPLE
  }), R = [
    { key: "basic", label: "基本信息", children: Z },
    {
      key: "skills",
      label: `技能 (${$.length})`,
      children: O
    },
    {
      key: "prompts",
      label: "推荐提问",
      children: l.createElement(ht, {
        skills: $,
        agentId: u.id
      })
    },
    {
      key: "knowledge",
      label: "专家记忆",
      children: l.createElement(Et, {
        agentId: u.id,
        systemPromptFiles: (o == null ? void 0 : o.system_prompt_files) || [],
        onRefresh: () => t()
      })
    },
    { key: "mcp", label: `MCP (${Y.length})`, children: v },
    { key: "tools", label: "工具配置", children: g }
  ];
  return l.createElement(
    r,
    {
      title: l.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 8 } },
        l.createElement("span", { style: { fontSize: 20 } }, "🧑‍🔬"),
        l.createElement("span", null, u.name)
      ),
      open: n,
      onClose: a,
      width: 560,
      extra: l.createElement(
        k,
        null,
        l.createElement(
          x,
          {
            size: "small",
            icon: A ? l.createElement(A) : void 0,
            onClick: () => B("/agents")
          },
          "编辑专家"
        ),
        l.createElement(
          x,
          {
            type: "primary",
            size: "small",
            icon: N ? l.createElement(N) : void 0,
            onClick: () => {
              try {
                const c = E();
                c.setSelectedAgent && c.setSelectedAgent(u.id);
              } catch (c) {
                console.warn("[ugsci] Failed to set selected agent:", c);
              }
              B("/chat");
            }
          },
          "开始对话"
        )
      )
    },
    l.createElement(T, {
      items: R,
      defaultActiveKey: "basic"
    })
  );
}
function ft({
  open: e,
  onClose: n,
  onCreated: a
}) {
  const t = E().React, { useState: l } = t, {
    Modal: r,
    Card: s,
    Tag: y,
    Input: S,
    Row: k,
    Col: x,
    Spin: P,
    message: T,
    Typography: z
  } = E().antd, { Text: V } = z, [D, w] = l(!1), [C, J] = l(""), A = Te.filter((p) => {
    if (!C.trim()) return !0;
    const I = C.toLowerCase();
    return p.name.toLowerCase().includes(I) || p.description.toLowerCase().includes(I) || p.category.toLowerCase().includes(I);
  }), N = async (p) => {
    w(!0);
    try {
      const I = await te("/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: p.name,
          description: p.description,
          skill_names: p.recommendedSkills
        })
      });
      await $e(I.id, "AGENTS.md", p.systemPrompt);
      const L = await Ce(I.id);
      L.approval_level = p.approvalLevel, await te(`/agents/${encodeURIComponent(I.id)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(L)
      }), T.success(`专家「${p.name}」创建成功`), n(), a();
    } catch (I) {
      T.error(I.message || "创建专家失败");
    } finally {
      w(!1);
    }
  };
  return t.createElement(
    r,
    {
      open: e,
      onCancel: n,
      footer: null,
      title: "选择专家模板",
      width: 800
    },
    t.createElement(
      "div",
      { style: { marginBottom: 16 } },
      t.createElement(S, {
        placeholder: "搜索模板名称或类别...",
        value: C,
        onChange: (p) => J(p.target.value),
        allowClear: !0
      })
    ),
    D ? t.createElement(
      "div",
      { style: { textAlign: "center", padding: 60 } },
      t.createElement(P, { size: "large" }),
      t.createElement(
        "div",
        { style: { marginTop: 12, color: "#8c8c8c" } },
        "正在创建专家..."
      )
    ) : t.createElement(
      k,
      { gutter: [12, 12] },
      ...A.map(
        (p) => t.createElement(
          x,
          { key: p.id, xs: 24, sm: 12 },
          t.createElement(
            s,
            {
              hoverable: !0,
              size: "small",
              onClick: () => N(p),
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
                p.emoji
              ),
              t.createElement(
                "div",
                { style: { flex: 1 } },
                t.createElement(
                  V,
                  { strong: !0, style: { fontSize: 15 } },
                  p.name
                ),
                t.createElement(
                  "div",
                  null,
                  t.createElement(
                    y,
                    { color: "blue", style: { fontSize: 10 } },
                    p.category
                  ),
                  p.approvalLevel === "MANUAL" ? t.createElement(
                    y,
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
              _e(p.description, t)
            )
          )
        )
      )
    )
  );
}
function Et({
  agentId: e,
  systemPromptFiles: n,
  onRefresh: a
}) {
  const t = E().React, { useState: l, useEffect: r, useCallback: s } = t, {
    List: y,
    Tag: S,
    Switch: k,
    Button: x,
    Modal: P,
    Input: T,
    Spin: z,
    Empty: V,
    message: D,
    Typography: w
  } = E().antd, { FileTextOutlined: C, PlusOutlined: J, EditOutlined: A, ReloadOutlined: N } = E().antdIcons || {}, { Text: p } = w, [I, L] = l([]), [M, H] = l(!0), [F, X] = l(
    n || []
  ), [ne, h] = l(!1), [u, o] = l(null), [_, Y] = l(""), [Q, $] = l(""), [B, Z] = l(!1), i = s(async () => {
    H(!0);
    try {
      const v = await ct(e);
      L(v);
    } catch (v) {
      D.error(v.message || "加载记忆文件失败"), L([]);
    } finally {
      H(!1);
    }
  }, [e]);
  r(() => {
    i();
  }, [i]), r(() => {
    X(n || []);
  }, [n]);
  const ee = async (v, g) => {
    const R = new Set(F);
    if (g)
      R.add(v);
    else {
      if (Le.includes(v) && v === "AGENTS.md") {
        D.warning("AGENTS.md 是核心文件，不能停用");
        return;
      }
      R.delete(v);
    }
    const c = Array.from(R);
    X(c);
    try {
      await Ae(e, c), D.success(g ? "已启用记忆文件" : "已停用记忆文件"), a();
    } catch (q) {
      D.error(q.message || "更新失败"), X(n || []);
    }
  }, j = async (v) => {
    try {
      const g = await te(
        `/workspace/files/${encodeURIComponent(v)}`,
        { headers: { "X-Agent-Id": e } }
      );
      o(v), Y(g.content || ""), h(!0);
    } catch (g) {
      D.error(g.message || "读取文件失败");
    }
  }, K = () => {
    o(null), Y(""), $(""), h(!0);
  }, O = async () => {
    const v = u || Q.trim();
    if (!v) {
      D.warning("请输入文件名");
      return;
    }
    const g = v.endsWith(".md") ? v : `${v}.md`;
    Z(!0);
    try {
      if (await $e(e, g, _), !u && !F.includes(g)) {
        const R = [...F, g];
        X(R), await Ae(e, R);
      }
      D.success("保存成功"), h(!1), i(), a();
    } catch (R) {
      D.error(R.message || "保存失败");
    } finally {
      Z(!1);
    }
  };
  return M ? t.createElement(
    "div",
    { style: { textAlign: "center", padding: 40 } },
    t.createElement(z, { size: "large" })
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
        C ? t.createElement(C, {
          style: { fontSize: 14, color: "#1677ff" }
        }) : null,
        t.createElement(
          p,
          { strong: !0 },
          `记忆文件 (${I.length})`
        ),
        t.createElement(
          p,
          { type: "secondary", style: { fontSize: 12 } },
          `· 已挂载 ${F.length} 个到专家记忆`
        )
      ),
      t.createElement(
        "div",
        { style: { display: "flex", gap: 8 } },
        t.createElement(
          x,
          {
            size: "small",
            icon: N ? t.createElement(N) : void 0,
            onClick: i
          },
          "刷新"
        ),
        t.createElement(
          x,
          {
            type: "primary",
            size: "small",
            icon: J ? t.createElement(J) : void 0,
            onClick: K
          },
          "新建记忆文件"
        )
      )
    ),
    I.length === 0 ? t.createElement(V, {
      description: "暂无记忆文件，点击「新建记忆文件」添加",
      image: V.PRESENTED_IMAGE_SIMPLE
    }) : t.createElement(y, {
      dataSource: I,
      renderItem: (v) => {
        const g = F.includes(v.filename), R = Le.includes(v.filename);
        return t.createElement(
          y.Item,
          {
            actions: [
              t.createElement(
                x,
                {
                  type: "link",
                  size: "small",
                  icon: A ? t.createElement(A) : void 0,
                  onClick: () => j(v.filename)
                },
                "编辑"
              )
            ]
          },
          t.createElement(y.Item.Meta, {
            avatar: t.createElement(C, {
              style: {
                fontSize: 20,
                color: g ? "#1677ff" : "#bfbfbf"
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
              t.createElement(p, null, v.filename),
              R ? t.createElement(
                S,
                { color: "default", style: { fontSize: 10 } },
                "内置"
              ) : t.createElement(
                S,
                { color: "cyan", style: { fontSize: 10 } },
                "记忆库"
              )
            ),
            description: t.createElement(
              "div",
              { style: { fontSize: 12 } },
              `${(v.size / 1024).toFixed(1)} KB · 修改于 ${new Date(v.modified_time).toLocaleString()}`
            )
          }),
          t.createElement(k, {
            checked: g,
            size: "small",
            onChange: (c) => ee(v.filename, c)
          })
        );
      }
    }),
    // Edit/New file modal
    t.createElement(
      P,
      {
        open: ne,
        onCancel: () => h(!1),
        title: u ? `编辑 ${u}` : "新建记忆文件",
        width: 700,
        onOk: O,
        confirmLoading: B,
        okText: "保存"
      },
      u ? null : t.createElement(
        "div",
        { style: { marginBottom: 12 } },
        t.createElement(T, {
          placeholder: "文件名（如：油藏工程记忆库.md）",
          value: Q,
          onChange: (v) => $(v.target.value),
          addonAfter: Q.endsWith(".md") ? "" : ".md"
        })
      ),
      t.createElement(T.TextArea, {
        value: _,
        onChange: (v) => Y(v.target.value),
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
  agentId: n
}) {
  const a = E().React, { useMemo: t } = a, {
    List: l,
    Tag: r,
    Typography: s,
    Empty: y,
    Button: S,
    message: k
  } = E().antd, { ThunderboltOutlined: x, CopyOutlined: P } = E().antdIcons || {}, { Text: T } = s, z = t(() => it(e), [e]), V = (w) => {
    try {
      const C = E();
      C.setSelectedAgent && C.setSelectedAgent(n);
    } catch {
    }
    try {
      sessionStorage.setItem("ugsci_pending_prompt", w);
    } catch {
    }
    window.history.pushState({}, "", "/chat"), window.dispatchEvent(new PopStateEvent("popstate"));
  }, D = (w) => {
    var C;
    (C = navigator.clipboard) == null || C.writeText(w).then(() => {
      k.success("已复制到剪贴板");
    });
  };
  return z.length === 0 ? a.createElement(y, {
    description: "暂无推荐提问，请先为专家添加技能",
    image: y.PRESENTED_IMAGE_SIMPLE
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
      x ? a.createElement(x, {
        style: { fontSize: 14, color: "#1677ff" }
      }) : null,
      a.createElement(
        T,
        { strong: !0 },
        `推荐提问 (${z.length})`
      ),
      a.createElement(
        T,
        { type: "secondary", style: { fontSize: 12 } },
        "· 从技能描述中自动提取"
      )
    ),
    a.createElement(l, {
      dataSource: z,
      renderItem: (w, C) => a.createElement(
        l.Item,
        {
          actions: [
            a.createElement(
              S,
              {
                type: "link",
                size: "small",
                icon: P ? a.createElement(P) : void 0,
                onClick: () => D(w)
              },
              "复制"
            )
          ]
        },
        a.createElement(l.Item.Meta, {
          avatar: a.createElement(
            r,
            { color: "blue", style: { borderRadius: "50%" } },
            `${C + 1}`
          ),
          title: a.createElement(
            "div",
            {
              style: {
                cursor: "pointer",
                color: "#1677ff"
              },
              onClick: () => V(w)
            },
            w
          ),
          description: a.createElement(
            T,
            { type: "secondary", style: { fontSize: 12 } },
            "点击直接发送给专家"
          )
        })
      )
    })
  );
}
function vt() {
  var se;
  const e = E().React, { useState: n, useEffect: a, useCallback: t, useMemo: l } = e, {
    Spin: r,
    Empty: s,
    Input: y,
    Button: S,
    message: k,
    Row: x,
    Col: P,
    Tabs: T,
    Modal: z,
    Typography: V
  } = E().antd, { ReloadOutlined: D, PlusOutlined: w, SearchOutlined: C, TeamOutlined: J } = E().antdIcons || {}, { Text: A, Paragraph: N } = V, [p, I] = n([]), [L, M] = n(!0), [H, F] = n(!1), [X, ne] = n(null), [h, u] = n(""), [o, _] = n(!1), [Y, Q] = n("experts"), [$, B] = n(
    null
  ), [Z, i] = n(""), [ee, j] = n(!1), [K, O] = n([]), v = t(async () => {
    M(!0);
    try {
      const f = await Pe(), W = await We().catch(
        () => []
      ), G = await Promise.all(
        f.map(async (b) => {
          try {
            const [U, ce] = await Promise.all([
              Ce(b.id).catch(() => null),
              Ze(b.id).catch(() => [])
            ]), de = tt(U == null ? void 0 : U.mcp), ue = W.filter(
              (Ee) => de.includes(Ee.key) || de.includes(Ee.name)
            );
            return {
              agent: b,
              config: U,
              skills: ce,
              mcps: ue,
              loading: !1
            };
          } catch {
            return {
              agent: b,
              config: null,
              skills: [],
              mcps: [],
              loading: !1
            };
          }
        })
      );
      I(G), O(f);
    } catch (f) {
      k.error(f.message || "加载专家列表失败"), I([]);
    } finally {
      M(!1);
    }
  }, []);
  a(() => {
    v();
  }, [v]);
  const g = t(
    async (f) => {
      var U;
      const W = f.coordinatorName || ((U = f.members[0]) == null ? void 0 : U.name);
      if (!W) {
        k.error("无法确定协调者专家");
        return;
      }
      const G = we(K, W);
      if (!G) {
        k.error(`未找到协调者专家「${W}」，请先创建该专家`);
        return;
      }
      if (/\{.+?\}/.test(f.taskTemplate)) {
        i(""), B(f);
        return;
      }
      await R(f, G, f.taskTemplate);
    },
    [K, k]
  ), R = t(
    async (f, W, G) => {
      var b;
      j(!0);
      try {
        const U = at(f), ce = G ? U.replace(f.taskTemplate, G) : U, de = E();
        de.setSelectedAgent && de.setSelectedAgent(W), await lt(W, ce), k.success(
          `团队任务已发起，协调者：${f.coordinatorName || ((b = f.members[0]) == null ? void 0 : b.name)}`
        ), B(null), c("/chat");
      } catch (U) {
        k.error(U.message || "发起团队任务失败");
      } finally {
        j(!1);
      }
    },
    [k]
  ), c = (f) => {
    window.history.pushState({}, "", f), window.dispatchEvent(new PopStateEvent("popstate"));
  }, q = t((f) => {
    ne(f), F(!0);
  }, []), re = t(
    (f) => {
      if (!f.agent.enabled) {
        k.warning(`专家「${f.agent.name}」未启用，请先启用`);
        return;
      }
      try {
        const W = E();
        W.setSelectedAgent && W.setSelectedAgent(f.agent.id);
      } catch (W) {
        console.warn("[ugsci] Failed to set selected agent:", W);
      }
      k.success(`已召唤专家「${f.agent.name}」，正在跳转至对话...`), c("/chat");
    },
    [k]
  ), ye = l(() => {
    if (!h.trim()) return p;
    const f = h.toLowerCase();
    return p.filter(
      (W) => {
        var G;
        return W.agent.name.toLowerCase().includes(f) || ((G = W.agent.description) == null ? void 0 : G.toLowerCase().includes(f)) || W.agent.id.toLowerCase().includes(f) || W.skills.some((b) => b.name.toLowerCase().includes(f));
      }
    );
  }, [p, h]), fe = p.filter((f) => f.agent.enabled).length, m = p.reduce(
    (f, W) => f + W.skills.filter((G) => G.enabled !== !1).length,
    0
  ), le = p.reduce((f, W) => f + W.mcps.length, 0), oe = [
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
          e.createElement(y, {
            placeholder: "搜索专家名称、描述或技能...",
            prefix: C ? e.createElement(C) : void 0,
            value: h,
            onChange: (f) => u(f.target.value),
            allowClear: !0,
            style: { maxWidth: 400 }
          })
        ),
        // Content
        L ? e.createElement(
          "div",
          { style: { textAlign: "center", padding: 60 } },
          e.createElement(r, { size: "large" })
        ) : ye.length === 0 ? e.createElement(s, {
          description: h ? "未找到匹配的专家" : "暂无专家，点击「创建专家」添加"
        }) : e.createElement(
          x,
          { gutter: [12, 12], align: "stretch" },
          ...ye.map(
            (f) => e.createElement(
              P,
              {
                key: f.agent.id,
                xs: 24,
                sm: 12,
                md: 8,
                lg: 6,
                style: { display: "flex" }
              },
              e.createElement(gt, {
                expert: f,
                onClick: () => q(f),
                onSummon: () => re(f)
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
        agents: K,
        onLaunch: g
      })
    }
  ];
  return e.createElement(
    "div",
    { style: { padding: 24 } },
    e.createElement(ke, {
      title: "专家中心",
      subtitle: `共 ${p.length} 位专家（${fe} 位启用）· ${m} 个技能 · ${le} 个 MCP 客户端`,
      extra: e.createElement(
        e.Fragment,
        null,
        e.createElement(
          S,
          {
            icon: D ? e.createElement(D) : void 0,
            onClick: v,
            loading: L
          },
          "刷新"
        ),
        e.createElement(
          S,
          {
            type: "primary",
            icon: w ? e.createElement(w) : void 0,
            onClick: () => _(!0)
          },
          "创建专家"
        )
      )
    }),
    e.createElement(T, {
      items: oe,
      activeKey: Y,
      onChange: (f) => Q(f)
    }),
    // Drawer
    e.createElement(yt, {
      expert: X,
      open: H,
      onClose: () => F(!1),
      onRefresh: () => v()
    }),
    // Template Modal
    e.createElement(ft, {
      open: o,
      onClose: () => _(!1),
      onCreated: () => v()
    }),
    // Team Launch Modal (for filling placeholders)
    $ ? e.createElement(
      z,
      {
        open: !0,
        title: e.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 8 } },
          e.createElement(
            "span",
            { style: { fontSize: 20 } },
            $.emoji
          ),
          e.createElement(
            "span",
            null,
            `发起团队任务 - ${$.name}`
          )
        ),
        onCancel: () => B(null),
        onOk: () => {
          var b;
          const f = $.coordinatorName || ((b = $.members[0]) == null ? void 0 : b.name), W = f ? we(K, f) : null;
          if (!W) {
            k.error("无法找到协调者专家");
            return;
          }
          let G = $.taskTemplate;
          Z.trim() && (G = Z.trim()), R($, W, G);
        },
        confirmLoading: ee,
        okText: "发起任务",
        width: 600
      },
      e.createElement(
        "div",
        { style: { marginBottom: 12 } },
        e.createElement(
          A,
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
          $.taskTemplate
        )
      ),
      e.createElement(
        "div",
        null,
        e.createElement(
          A,
          {
            type: "secondary",
            style: { fontSize: 12, display: "block", marginBottom: 8 }
          },
          "输入具体任务描述（替换上面的占位符内容）："
        ),
        e.createElement(y.TextArea, {
          value: Z,
          onChange: (f) => i(f.target.value),
          rows: 5,
          placeholder: $.taskTemplate,
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
          A,
          { style: { fontSize: 12, color: "#0958d9" } },
          `协调者: ${$.coordinatorName || ((se = $.members[0]) == null ? void 0 : se.name) || "—"} · 成员: ${$.members.map((f) => f.name).join("、")}`
        )
      )
    ) : null
  );
}
function St({
  mcp: e,
  onClick: n
}) {
  const a = E().React, { Card: t, Tag: l, Badge: r, Typography: s } = E().antd, { Text: y } = s, S = {
    stdio: "💻",
    streamable_http: "🌐",
    sse: "📡"
  };
  return a.createElement(
    t,
    {
      hoverable: !0,
      onClick: n,
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
        a.createElement(
          "span",
          { style: { fontSize: 18 } },
          S[e.transport] || "🔌"
        ),
        a.createElement(
          y,
          { strong: !0, style: { fontSize: 14 } },
          e.name || e.key
        )
      ),
      a.createElement(r, {
        status: e.enabled ? "success" : "default",
        text: e.enabled ? "启用" : "停用"
      })
    ),
    e.description ? a.createElement(
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
    ) : a.createElement(
      "div",
      { style: { fontSize: 12, color: "#bfbfbf", marginBottom: 8, minHeight: 36, flex: "1 0 auto" } },
      "暂无描述"
    ),
    a.createElement(
      "div",
      { style: { display: "flex", gap: 6, flexWrap: "wrap" } },
      a.createElement(
        l,
        { color: "purple", style: { fontSize: 11 } },
        e.transport
      ),
      e.tools && e.tools.length > 0 ? a.createElement(
        l,
        { color: "blue", style: { fontSize: 11 } },
        `${e.tools.length} 个工具`
      ) : a.createElement(l, { style: { fontSize: 11 } }, "全部工具"),
      e.url ? a.createElement(
        l,
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
}, Ge = {
  reservoir_simulation: "🛢️",
  geological_modeling: "🏔️",
  well_log_analysis: "📡",
  production_engineering: "⚙️",
  post_processing: "📊",
  multiphysics: "🔬"
};
async function bt() {
  return te("/ugsci/engines/list");
}
async function xt(e) {
  return te("/ugsci/engines/", {
    method: "POST",
    body: JSON.stringify(e)
  });
}
async function wt(e, n) {
  return te(`/ugsci/engines/${encodeURIComponent(e)}`, {
    method: "PUT",
    body: JSON.stringify(n)
  });
}
async function Ct(e) {
  return te(
    `/ugsci/engines/${encodeURIComponent(e)}`,
    { method: "DELETE" }
  );
}
async function kt() {
  return te("/ugsci/engines/detect", {
    method: "POST"
  });
}
function Tt({
  engine: e,
  onClick: n
}) {
  const a = E().React, { Card: t, Tag: l, Typography: r } = E().antd, { Text: s } = r, y = e.status === "detected", S = Ge[e.category] || "📦";
  return a.createElement(
    t,
    {
      hoverable: !0,
      onClick: n,
      size: "small",
      style: {
        cursor: "pointer",
        borderColor: y ? void 0 : "#d9d9d9",
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
        a.createElement("span", { style: { fontSize: 20 } }, S),
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
        y ? a.createElement(
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
        ze[e.category] || e.category
      ) : null,
      e.version ? a.createElement(
        l,
        { color: "blue", style: { fontSize: 11 } },
        `v${e.version}`
      ) : null
    )
  );
}
function zt() {
  const e = E().React, { useState: n, useEffect: a, useCallback: t, useMemo: l } = e, {
    Spin: r,
    Empty: s,
    Button: y,
    message: S,
    Row: k,
    Col: x,
    Drawer: P,
    Descriptions: T,
    Tag: z,
    Typography: V,
    Modal: D,
    Input: w,
    Alert: C,
    Select: J,
    Popconfirm: A,
    Space: N
  } = E().antd, {
    ReloadOutlined: p,
    SearchOutlined: I,
    PlusOutlined: L,
    EditOutlined: M,
    DeleteOutlined: H,
    CopyOutlined: F,
    ExperimentOutlined: X
  } = E().antdIcons || {}, { Text: ne, Paragraph: h } = V, [u, o] = n([]), [_, Y] = n(!0), [Q, $] = n(""), [B, Z] = n(!1), [i, ee] = n(null), [j, K] = n(!1), [O, v] = n(null), [g, R] = n({}), [c, q] = n(!1), re = t(async () => {
    Y(!0);
    try {
      const b = await bt();
      o(b.engines || []);
    } catch (b) {
      S.error(b.message || "加载引擎列表失败"), o([]);
    } finally {
      Y(!1);
    }
  }, []);
  a(() => {
    re();
  }, [re]);
  const ye = l(() => {
    if (!Q.trim()) return u;
    const b = Q.toLowerCase();
    return u.filter(
      (U) => {
        var ce;
        return U.name.toLowerCase().includes(b) || U.vendor.toLowerCase().includes(b) || U.category.toLowerCase().includes(b) || ((ce = U.description) == null ? void 0 : ce.toLowerCase().includes(b));
      }
    );
  }, [u, Q]), fe = u.filter((b) => b.status === "detected").length, m = t((b) => {
    navigator.clipboard.writeText(b).then(() => S.success("路径已复制")).catch(() => S.error("复制失败"));
  }, []), le = t(() => {
    v(null), R({
      name: "",
      vendor: "",
      version: "",
      executable_path: "",
      category: "",
      description: "",
      invocation_hint: ""
    }), K(!0);
  }, []), oe = t((b) => {
    v(b), R({ ...b }), K(!0), Z(!1);
  }, []), se = t(async () => {
    var b;
    if (!((b = g.name) != null && b.trim())) {
      S.warning("请输入引擎名称");
      return;
    }
    q(!0);
    try {
      O ? (await wt(O.id, g), S.success("引擎已更新")) : (await xt(g), S.success("引擎已添加")), K(!1), re();
    } catch (U) {
      S.error(U.message || "保存失败");
    } finally {
      q(!1);
    }
  }, [g, O, re]), f = t(
    async (b) => {
      try {
        await Ct(b), S.success("引擎已删除"), Z(!1), re();
      } catch (U) {
        S.error(U.message || "删除失败");
      }
    },
    [re]
  ), W = t(async () => {
    Y(!0);
    try {
      const b = await kt();
      o(b.engines || []), S.success("自动检测完成");
    } catch (b) {
      S.error(b.message || "检测失败");
    } finally {
      Y(!1);
    }
  }, []), G = t(
    (b, U, ce) => {
      const de = g[U] || "";
      return e.createElement(
        "div",
        { style: { marginBottom: 12 } },
        e.createElement(
          ne,
          { style: { fontSize: 13, display: "block", marginBottom: 4 } },
          b
        ),
        ce != null && ce.select ? e.createElement(J, {
          value: de || void 0,
          onChange: (ue) => R((Ee) => ({ ...Ee, [U]: ue })),
          style: { width: "100%" },
          options: ce.select.options,
          allowClear: !0,
          placeholder: `选择${b}`
        }) : ce != null && ce.textarea ? e.createElement(w.TextArea, {
          value: de,
          onChange: (ue) => R((Ee) => ({ ...Ee, [U]: ue.target.value })),
          rows: 3,
          placeholder: `输入${b}`
        }) : e.createElement(w, {
          value: de,
          onChange: (ue) => R((Ee) => ({ ...Ee, [U]: ue.target.value })),
          placeholder: `输入${b}`
        })
      );
    },
    [g]
  );
  return e.createElement(
    "div",
    null,
    // Summary alert
    e.createElement(
      C,
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
      e.createElement(w, {
        placeholder: "搜索引擎名称、厂商...",
        prefix: I ? e.createElement(I) : void 0,
        value: Q,
        onChange: (b) => $(b.target.value),
        allowClear: !0,
        style: { maxWidth: 280 }
      }),
      e.createElement(
        y,
        {
          icon: p ? e.createElement(p) : void 0,
          onClick: W,
          loading: _
        },
        "自动检测"
      ),
      e.createElement(
        y,
        {
          type: "primary",
          icon: L ? e.createElement(L) : void 0,
          onClick: le
        },
        "添加引擎"
      )
    ),
    // Content
    _ ? e.createElement(
      "div",
      { style: { textAlign: "center", padding: 60 } },
      e.createElement(r, {
        size: "large",
        tip: "正在加载计算引擎..."
      })
    ) : ye.length === 0 ? e.createElement(s, {
      description: Q ? "无匹配引擎" : "暂无引擎，点击「添加引擎」开始"
    }) : e.createElement(
      k,
      { gutter: [12, 12], align: "stretch" },
      ...ye.map(
        (b) => e.createElement(
          x,
          {
            key: b.id,
            xs: 24,
            sm: 12,
            md: 8,
            lg: 6,
            style: { display: "flex" }
          },
          e.createElement(Tt, {
            engine: b,
            onClick: () => {
              ee(b), Z(!0);
            }
          })
        )
      )
    ),
    // Detail drawer
    i ? e.createElement(
      P,
      {
        title: e.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 8 } },
          e.createElement(
            "span",
            { style: { fontSize: 18 } },
            Ge[i.category] || "📦"
          ),
          e.createElement("span", null, i.name)
        ),
        open: B,
        onClose: () => Z(!1),
        width: 520,
        extra: e.createElement(
          N,
          null,
          e.createElement(
            y,
            {
              size: "small",
              icon: M ? e.createElement(M) : void 0,
              onClick: () => oe(i)
            },
            "编辑"
          ),
          i.is_default ? null : e.createElement(
            A,
            {
              title: "确认删除此引擎？",
              description: i.name,
              onConfirm: () => f(i.id),
              okText: "删除",
              cancelText: "取消",
              okButtonProps: { danger: !0 }
            },
            e.createElement(
              y,
              {
                size: "small",
                danger: !0,
                icon: H ? e.createElement(H) : void 0
              },
              "删除"
            )
          )
        )
      },
      e.createElement(
        T,
        { column: 1, bordered: !0, size: "small" },
        e.createElement(
          T.Item,
          { label: "引擎名称" },
          i.name
        ),
        e.createElement(
          T.Item,
          { label: "厂商" },
          i.vendor || "—"
        ),
        e.createElement(
          T.Item,
          { label: "分类" },
          i.category ? ze[i.category] || i.category : "—"
        ),
        e.createElement(
          T.Item,
          { label: "状态" },
          e.createElement(
            z,
            {
              color: i.status === "detected" ? "success" : i.status === "not_found" ? "error" : "default"
            },
            i.status === "detected" ? "✅ 已检测" : i.status === "not_found" ? "❌ 路径无效" : "🔧 待配置"
          )
        ),
        e.createElement(
          T.Item,
          { label: "版本" },
          i.version || "—"
        ),
        i.executable_path ? e.createElement(
          T.Item,
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
              i.executable_path
            ),
            e.createElement(
              y,
              {
                size: "small",
                type: "text",
                icon: F ? e.createElement(F) : void 0,
                onClick: () => m(i.executable_path)
              }
            )
          )
        ) : null,
        i.install_dir ? e.createElement(
          T.Item,
          { label: "安装目录" },
          e.createElement(
            "code",
            { style: { fontSize: 12, wordBreak: "break-all" } },
            i.install_dir
          )
        ) : null,
        i.license_server ? e.createElement(
          T.Item,
          { label: "许可证服务器" },
          i.license_server
        ) : null,
        e.createElement(
          T.Item,
          { label: "描述" },
          i.description || "—"
        )
      ),
      // Invocation hint
      i.invocation_hint ? e.createElement(
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
          ne,
          { strong: !0, style: { fontSize: 13 } },
          "💡 调用方式"
        ),
        e.createElement(
          "div",
          { style: { marginTop: 8, fontSize: 13, lineHeight: 1.6 } },
          i.invocation_hint
        )
      ) : null,
      // Type badge
      e.createElement(
        "div",
        { style: { marginTop: 12 } },
        i.is_default ? e.createElement(
          z,
          { color: "blue" },
          "默认引擎"
        ) : i.is_custom ? e.createElement(
          z,
          { color: "purple" },
          "自定义引擎"
        ) : null
      )
    ) : null,
    // Add/Edit modal
    e.createElement(
      D,
      {
        title: O ? "编辑引擎" : "添加计算引擎",
        open: j,
        onOk: se,
        onCancel: () => K(!1),
        okText: O ? "保存" : "添加",
        cancelText: "取消",
        confirmLoading: c,
        width: 560
      },
      e.createElement(
        "div",
        { style: { maxHeight: 480, overflow: "auto", paddingRight: 8 } },
        G("引擎名称 *", "name"),
        G("厂商", "vendor"),
        G("版本", "version"),
        G("可执行文件路径", "executable_path"),
        G("安装目录", "install_dir"),
        G("分类", "category", {
          select: {
            options: Object.entries(ze).map(([b, U]) => ({
              label: U,
              value: b
            }))
          }
        }),
        G("描述", "description", { textarea: !0 }),
        G("调用方式提示", "invocation_hint", { textarea: !0 }),
        G("许可证服务器", "license_server")
      )
    )
  );
}
function It() {
  const e = E().React, { useState: n, useEffect: a, useCallback: t, useMemo: l } = e, {
    Spin: r,
    Empty: s,
    Input: y,
    Button: S,
    message: k,
    Row: x,
    Col: P,
    Drawer: T,
    Descriptions: z,
    Tag: V,
    Typography: D,
    List: w,
    Tabs: C
  } = E().antd, { ReloadOutlined: J, PlusOutlined: A, SearchOutlined: N, ApiOutlined: p } = E().antdIcons || {}, { Text: I } = D, [L, M] = n([]), [H, F] = n(!0), [X, ne] = n(""), [h, u] = n(!1), [o, _] = n(null), [Y, Q] = n("mcp"), $ = t(async () => {
    F(!0);
    try {
      const O = await We();
      M(O);
    } catch (O) {
      k.error(O.message || "加载能力列表失败"), M([]);
    } finally {
      F(!1);
    }
  }, []);
  a(() => {
    $();
  }, [$]);
  const B = l(() => {
    if (!X.trim()) return L;
    const O = X.toLowerCase();
    return L.filter(
      (v) => {
        var g;
        return v.name.toLowerCase().includes(O) || v.key.toLowerCase().includes(O) || ((g = v.description) == null ? void 0 : g.toLowerCase().includes(O)) || v.transport.toLowerCase().includes(O);
      }
    );
  }, [L, X]), Z = L.filter((O) => O.enabled).length, i = L.reduce((O, v) => {
    var g;
    return O + (((g = v.tools) == null ? void 0 : g.length) || 0);
  }, 0), ee = (O) => {
    window.history.pushState({}, "", O), window.dispatchEvent(new PopStateEvent("popstate"));
  }, j = e.createElement(
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
      e.createElement(y, {
        placeholder: "搜索能力名称、描述...",
        prefix: N ? e.createElement(N) : void 0,
        value: X,
        onChange: (O) => ne(O.target.value),
        allowClear: !0,
        style: { maxWidth: 400 }
      }),
      e.createElement(
        S,
        {
          type: "primary",
          icon: A ? e.createElement(A) : void 0,
          onClick: () => ee("/mcp")
        },
        "管理 MCP"
      )
    ),
    H ? e.createElement(
      "div",
      { style: { textAlign: "center", padding: 60 } },
      e.createElement(r, { size: "large" })
    ) : B.length === 0 ? e.createElement(s, {
      description: X ? "未找到匹配的能力" : "暂无 MCP 客户端，点击「管理 MCP」添加"
    }) : e.createElement(
      x,
      { gutter: [12, 12], align: "stretch" },
      ...B.map(
        (O) => e.createElement(
          P,
          {
            key: O.key,
            xs: 24,
            sm: 12,
            md: 8,
            lg: 6,
            style: { display: "flex" }
          },
          e.createElement(St, {
            mcp: O,
            onClick: () => {
              _(O), u(!0);
            }
          })
        )
      )
    )
  ), K = [
    {
      key: "mcp",
      label: e.createElement("span", null, "🔌 MCP 客户端"),
      children: j
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
    e.createElement(ke, {
      title: "能力中心",
      subtitle: `MCP: ${L.length} 个客户端（${Z} 个启用）· ${i} 个工具`,
      extra: e.createElement(
        e.Fragment,
        null,
        e.createElement(
          S,
          {
            icon: J ? e.createElement(J) : void 0,
            onClick: $,
            loading: H
          },
          "刷新"
        )
      )
    }),
    e.createElement(C, {
      items: K,
      activeKey: Y,
      onChange: (O) => Q(O)
    }),
    // MCP Detail drawer
    o ? e.createElement(
      T,
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
        open: h,
        onClose: () => u(!1),
        width: 480
      },
      e.createElement(
        z,
        { column: 1, bordered: !0, size: "small" },
        e.createElement(
          z.Item,
          { label: "Key" },
          e.createElement(
            "code",
            { style: { fontSize: 12 } },
            o.key
          )
        ),
        e.createElement(
          z.Item,
          { label: "名称" },
          o.name || "-"
        ),
        e.createElement(
          z.Item,
          { label: "描述" },
          o.description || "-"
        ),
        e.createElement(
          z.Item,
          { label: "状态" },
          e.createElement(
            V,
            { color: o.enabled ? "green" : "default" },
            o.enabled ? "启用" : "停用"
          )
        ),
        e.createElement(
          z.Item,
          { label: "传输方式" },
          o.transport
        ),
        o.url ? e.createElement(
          z.Item,
          { label: "URL" },
          o.url
        ) : null,
        o.command ? e.createElement(
          z.Item,
          { label: "命令" },
          e.createElement(
            "code",
            { style: { fontSize: 11 } },
            o.command
          )
        ) : null,
        o.args && o.args.length > 0 ? e.createElement(
          z.Item,
          { label: "参数" },
          o.args.join(" ")
        ) : null
      ),
      o.tools && o.tools.length > 0 ? e.createElement(
        "div",
        { style: { marginTop: 16 } },
        e.createElement(
          I,
          {
            strong: !0,
            style: { display: "block", marginBottom: 8 }
          },
          "提供的工具"
        ),
        e.createElement(w, {
          size: "small",
          dataSource: o.tools,
          renderItem: (O) => e.createElement(
            w.Item,
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
              p ? e.createElement(p, {
                style: { fontSize: 12, color: "#1677ff" }
              }) : null,
              e.createElement(
                I,
                { style: { fontSize: 12 } },
                O
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
function Pt() {
  const e = E().React, { useState: n, useEffect: a, useCallback: t, useMemo: l } = e, {
    Spin: r,
    Empty: s,
    Input: y,
    Button: S,
    message: k,
    Row: x,
    Col: P,
    Card: T,
    Tag: z,
    Typography: V,
    Drawer: D,
    Descriptions: w,
    List: C
  } = E().antd, {
    ReloadOutlined: J,
    SearchOutlined: A,
    DownloadOutlined: N,
    ThunderboltOutlined: p
  } = E().antdIcons || {}, { Text: I, Paragraph: L } = V, [M, H] = n([]), [F, X] = n([]), [ne, h] = n([]), [u, o] = n(!0), [_, Y] = n(""), [Q, $] = n(!1), [B, Z] = n(null), [i, ee] = n([]), j = t(async () => {
    o(!0);
    try {
      const [g, R, c] = await Promise.all([
        Fe(),
        Pe(),
        et()
      ]);
      H(g), h(R), X(c);
    } catch (g) {
      k.error(g.message || "加载技能列表失败"), H([]);
    } finally {
      o(!1);
    }
  }, []);
  a(() => {
    j();
  }, [j]);
  const K = l(() => {
    if (!_.trim()) return M;
    const g = _.toLowerCase();
    return M.filter(
      (R) => {
        var c, q;
        return R.name.toLowerCase().includes(g) || ((c = R.description) == null ? void 0 : c.toLowerCase().includes(g)) || ((q = R.tags) == null ? void 0 : q.some((re) => re.toLowerCase().includes(g)));
      }
    );
  }, [M, _]), O = t(
    (g) => {
      const R = [];
      for (const c of F)
        if (c.skills.some((q) => q.name === g)) {
          const q = ne.find((re) => re.id === c.agent_id);
          R.push((q == null ? void 0 : q.name) || c.agent_name || c.agent_id);
        }
      return R;
    },
    [F, ne]
  ), v = (g) => {
    window.history.pushState({}, "", g), window.dispatchEvent(new PopStateEvent("popstate"));
  };
  return e.createElement(
    "div",
    { style: { padding: 24 } },
    e.createElement(ke, {
      title: "技能中心",
      subtitle: `技能池共 ${M.length} 个技能`,
      extra: e.createElement(
        e.Fragment,
        null,
        e.createElement(
          S,
          {
            icon: J ? e.createElement(J) : void 0,
            onClick: j,
            loading: u
          },
          "刷新"
        ),
        e.createElement(
          S,
          {
            type: "primary",
            icon: N ? e.createElement(N) : void 0,
            onClick: () => v("/skill-pool")
          },
          "管理技能池"
        )
      )
    }),
    e.createElement(
      "div",
      { style: { marginBottom: 16 } },
      e.createElement(y, {
        placeholder: "搜索技能名称、描述或标签...",
        prefix: A ? e.createElement(A) : void 0,
        value: _,
        onChange: (g) => Y(g.target.value),
        allowClear: !0,
        style: { maxWidth: 400 }
      })
    ),
    u ? e.createElement(
      "div",
      { style: { textAlign: "center", padding: 60 } },
      e.createElement(r, { size: "large" })
    ) : K.length === 0 ? e.createElement(s, {
      description: _ ? "未找到匹配的技能" : "技能池为空"
    }) : e.createElement(
      x,
      { gutter: [12, 12] },
      ...K.map(
        (g) => e.createElement(
          P,
          { key: g.name, xs: 24, sm: 12, md: 8, lg: 6 },
          e.createElement(
            T,
            {
              hoverable: !0,
              size: "small",
              style: { cursor: "pointer", height: "100%" },
              onClick: () => {
                Z(g), ee(O(g.name)), $(!0);
              }
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
              g.emoji ? e.createElement(
                "span",
                { style: { fontSize: 18 } },
                g.emoji
              ) : e.createElement(
                "span",
                { style: { fontSize: 18 } },
                "⚡"
              ),
              e.createElement(
                I,
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
              g.protected ? e.createElement(
                z,
                { color: "gold", style: { fontSize: 10 } },
                "内置"
              ) : null
            ),
            g.description ? e.createElement(
              L,
              {
                type: "secondary",
                style: { fontSize: 11, margin: 0, lineHeight: 1.4 },
                ellipsis: { rows: 2 }
              },
              g.description
            ) : null,
            e.createElement(
              "div",
              {
                style: {
                  marginTop: 8,
                  display: "flex",
                  gap: 4,
                  flexWrap: "wrap"
                }
              },
              g.version_text ? e.createElement(
                z,
                { style: { fontSize: 10 } },
                `v${g.version_text}`
              ) : null,
              ...(g.tags || []).slice(0, 3).map(
                (R, c) => e.createElement(
                  z,
                  { key: c, color: "cyan", style: { fontSize: 10 } },
                  R
                )
              )
            )
          )
        )
      )
    ),
    // Skill detail drawer
    B ? e.createElement(
      D,
      {
        title: e.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 8 } },
          e.createElement(
            "span",
            { style: { fontSize: 18 } },
            B.emoji || "⚡"
          ),
          e.createElement("span", null, B.name)
        ),
        open: Q,
        onClose: () => $(!1),
        width: 520,
        extra: e.createElement(
          S,
          {
            type: "primary",
            size: "small",
            icon: p ? e.createElement(p) : void 0,
            onClick: () => v("/skills")
          },
          "管理技能"
        )
      },
      e.createElement(
        w,
        { column: 1, bordered: !0, size: "small" },
        e.createElement(
          w.Item,
          { label: "技能名称" },
          B.name
        ),
        e.createElement(
          w.Item,
          { label: "描述" },
          B.description || "-"
        ),
        B.version_text ? e.createElement(
          w.Item,
          { label: "版本" },
          B.version_text
        ) : null,
        e.createElement(
          w.Item,
          { label: "来源" },
          B.source || "-"
        ),
        e.createElement(
          w.Item,
          { label: "受保护" },
          B.protected ? "是（内置）" : "否"
        ),
        B.sync_status ? e.createElement(
          w.Item,
          { label: "同步状态" },
          B.sync_status
        ) : null,
        B.installed_from ? e.createElement(
          w.Item,
          { label: "安装来源" },
          B.installed_from
        ) : null
      ),
      // Tags
      B.tags && B.tags.length > 0 ? e.createElement(
        "div",
        { style: { marginTop: 16 } },
        e.createElement(
          I,
          {
            strong: !0,
            style: { display: "block", marginBottom: 8 }
          },
          "标签"
        ),
        e.createElement(
          "div",
          { style: { display: "flex", flexWrap: "wrap", gap: 4 } },
          ...B.tags.map(
            (g, R) => e.createElement(z, { key: R, color: "cyan" }, g)
          )
        )
      ) : null,
      // Installed agents
      e.createElement(
        "div",
        { style: { marginTop: 16 } },
        e.createElement(
          I,
          { strong: !0, style: { display: "block", marginBottom: 8 } },
          `已安装此技能的专家 (${i.length})`
        ),
        i.length > 0 ? e.createElement(C, {
          size: "small",
          dataSource: i,
          renderItem: (g) => e.createElement(
            C.Item,
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
              e.createElement("span", null, "🧑‍🔬"),
              e.createElement(
                I,
                { style: { fontSize: 13 } },
                g
              )
            )
          )
        }) : e.createElement(
          I,
          { type: "secondary", style: { fontSize: 12 } },
          "暂无专家安装此技能"
        )
      )
    ) : null
  );
}
async function _t() {
  return te("/market/providers");
}
async function $t(e) {
  return te(
    `/market/categories?lang=${encodeURIComponent(e)}`
  );
}
async function Ot(e, n, a, t, l) {
  return te("/market/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: e,
      provider_pages: n,
      limit: a,
      lang: t,
      category: l || void 0
    })
  });
}
async function Mt(e, n, a) {
  return te("/skills/hub/install/start", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify({
      bundle_url: n,
      enable: a
    })
  });
}
async function Rt(e, n) {
  return te(
    `/skills/hub/install/status/${encodeURIComponent(n)}`,
    {
      headers: { "X-Agent-Id": e }
    }
  );
}
function At() {
  const e = E().React, { useState: n, useEffect: a, useCallback: t, useMemo: l, useRef: r } = e, {
    Spin: s,
    Empty: y,
    Input: S,
    Button: k,
    message: x,
    Row: P,
    Col: T,
    Card: z,
    Tag: V,
    Tooltip: D,
    Typography: w,
    Select: C,
    Drawer: J,
    Descriptions: A,
    Tabs: N,
    Badge: p,
    Progress: I
  } = E().antd, {
    ReloadOutlined: L,
    SearchOutlined: M,
    DownloadOutlined: H,
    AppstoreOutlined: F,
    ShopOutlined: X,
    CheckCircleOutlined: ne,
    LoadingOutlined: h
  } = E().antdIcons || {}, { Text: u, Paragraph: o, Title: _ } = w, [Y, Q] = n("skills"), [$, B] = n([]), [Z, i] = n([]), [ee, j] = n([]), [K, O] = n(""), [v, g] = n(""), [R, c] = n(!1), [q, re] = n(!1), [ye, fe] = n(
    {}
  ), [m, le] = n(null), [oe, se] = n({}), [f, W] = n([]), [G, b] = n(""), [U, ce] = n(""), de = r(null);
  a(() => {
    Promise.all([
      _t().catch(() => []),
      $t("zh").catch(() => []),
      Pe().catch(() => [])
    ]).then(([d, ae, ie]) => {
      B(d), i(ae), W(ie), ie.length > 0 && b(ie[0].id);
    });
  }, []);
  const ue = t(
    async (d, ae, ie) => {
      c(!0);
      try {
        const pe = await Ot(
          d,
          ie,
          20,
          "zh",
          ae || void 0
        );
        ie === void 0 || Object.keys(ie).length === 0 ? j(pe.results) : j((me) => [...me, ...pe.results]);
        const Se = Object.values(pe.by_provider || {}).some(
          (me) => me.has_more
        );
        re(Se);
        const ge = {};
        for (const [me, he] of Object.entries(pe.by_provider || {}))
          ge[me] = (ie[me] || 1) + 1;
        if (fe(ge), pe.errors.length > 0)
          for (const me of pe.errors)
            console.warn(
              `[ugsci] Market provider '${me.provider}' error: ${me.message}`
            );
      } catch (pe) {
        x.error(pe.message || "搜索市场失败"), j([]);
      } finally {
        c(!1);
      }
    },
    []
  );
  a(() => (de.current && clearTimeout(de.current), de.current = setTimeout(() => {
    ue(K, v, {});
  }, 400), () => {
    de.current && clearTimeout(de.current);
  }), [K, v, ue]);
  const Ee = () => {
    ue(K, v, ye);
  }, Oe = async (d) => {
    var ie;
    if (!G) {
      x.warning("请先选择安装目标专家");
      return;
    }
    const ae = `${d.source}:${d.slug}`;
    try {
      se((ge) => ({ ...ge, [ae]: "starting" }));
      const pe = await Mt(
        G,
        d.source_url,
        !0
      );
      se((ge) => ({ ...ge, [ae]: "installing" }));
      const Se = 60;
      for (let ge = 0; ge < Se; ge++) {
        await new Promise((he) => setTimeout(he, 2e3));
        const me = await Rt(
          G,
          pe.task_id
        );
        if (me.status === "completed" && ((ie = me.result) != null && ie.installed)) {
          x.success(`技能「${me.result.name || d.name}」安装成功`), se((he) => {
            const be = { ...he };
            return delete be[ae], be;
          });
          return;
        }
        if (me.status === "failed")
          throw new Error(me.error || "安装失败");
        if (me.status === "cancelled") {
          x.info("安装已取消"), se((he) => {
            const be = { ...he };
            return delete be[ae], be;
          });
          return;
        }
      }
      throw new Error("安装超时");
    } catch (pe) {
      x.error(pe.message || "安装技能失败"), se((Se) => {
        const ge = { ...Se };
        return delete ge[ae], ge;
      });
    }
  }, Ve = (d) => {
    window.history.pushState({}, "", d), window.dispatchEvent(new PopStateEvent("popstate"));
  }, Me = $.filter((d) => d.available), Je = e.createElement(
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
      e.createElement(S, {
        placeholder: "搜索技能市场...",
        prefix: M ? e.createElement(M) : void 0,
        value: K,
        onChange: (d) => O(d.target.value),
        allowClear: !0,
        style: { flex: 1, minWidth: 200, maxWidth: 400 }
      }),
      Z.length > 0 ? e.createElement(C, {
        value: v || void 0,
        onChange: (d) => g(d || ""),
        placeholder: "全部分类",
        allowClear: !0,
        style: { minWidth: 150 },
        options: [
          { value: "", label: "全部分类" },
          ...Z.map((d) => ({ value: d.id, label: d.label }))
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
        e.createElement(C, {
          value: G || void 0,
          onChange: (d) => b(d),
          style: { minWidth: 140 },
          placeholder: "选择专家",
          options: f.map((d) => ({ value: d.id, label: d.name }))
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
        (d) => e.createElement(
          V,
          {
            key: d.key,
            color: d.supports_browse ? "blue" : "default",
            style: { fontSize: 11 }
          },
          `${d.label}${d.supports_browse ? "" : " (搜索)"}`
        )
      )
    ) : null,
    // Results grid
    R && ee.length === 0 ? e.createElement(
      "div",
      { style: { textAlign: "center", padding: 60 } },
      e.createElement(s, { size: "large" })
    ) : ee.length === 0 ? e.createElement(y, {
      description: K ? `未找到匹配「${K}」的技能` : "输入关键词搜索技能市场",
      image: y.PRESENTED_IMAGE_SIMPLE
    }) : e.createElement(
      P,
      { gutter: [12, 12] },
      ...ee.map((d) => {
        const ae = `${d.source}:${d.slug}`, ie = oe[ae];
        return e.createElement(
          T,
          { key: ae, xs: 24, sm: 12, md: 8, lg: 6 },
          e.createElement(
            z,
            {
              hoverable: !0,
              size: "small",
              style: { height: "100%", cursor: "pointer" },
              onClick: () => le(d)
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
              d.icon_url ? e.createElement("img", {
                src: d.icon_url,
                alt: d.name,
                style: { width: 24, height: 24, borderRadius: 4 }
              }) : e.createElement(
                "span",
                { style: { fontSize: 18 } },
                "📦"
              ),
              e.createElement(
                D,
                { title: d.name },
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
                  d.name
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
              d.description || "暂无描述"
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
                  V,
                  { color: "geekblue", style: { fontSize: 10 } },
                  d.source
                ),
                d.version ? e.createElement(
                  V,
                  { style: { fontSize: 10 } },
                  `v${d.version}`
                ) : null
              ),
              ie ? e.createElement(
                k,
                {
                  size: "small",
                  disabled: !0,
                  icon: h ? e.createElement(h) : void 0
                },
                ie === "starting" ? "启动中" : "安装中"
              ) : e.createElement(
                k,
                {
                  type: "primary",
                  size: "small",
                  icon: H ? e.createElement(H) : void 0,
                  onClick: (pe) => {
                    pe.stopPropagation(), Oe(d);
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
    q && !R ? e.createElement(
      "div",
      { style: { textAlign: "center", marginTop: 16 } },
      e.createElement(
        k,
        { onClick: Ee, loading: R },
        "加载更多"
      )
    ) : null,
    // Detail Drawer
    m ? e.createElement(
      J,
      {
        title: e.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 8 } },
          m.icon_url ? e.createElement("img", {
            src: m.icon_url,
            alt: m.name,
            style: { width: 28, height: 28, borderRadius: 4 }
          }) : e.createElement(
            "span",
            { style: { fontSize: 20 } },
            "📦"
          ),
          e.createElement("span", null, m.name)
        ),
        open: !0,
        onClose: () => le(null),
        width: 480,
        extra: e.createElement(
          k,
          {
            type: "primary",
            icon: H ? e.createElement(H) : void 0,
            onClick: () => {
              Oe(m);
            }
          },
          "安装到专家"
        )
      },
      e.createElement(
        A,
        { column: 1, bordered: !0, size: "small" },
        e.createElement(
          A.Item,
          { label: "来源" },
          m.source
        ),
        e.createElement(
          A.Item,
          { label: "描述" },
          m.description || "-"
        ),
        m.version ? e.createElement(
          A.Item,
          { label: "版本" },
          m.version
        ) : null,
        m.author ? e.createElement(
          A.Item,
          { label: "作者" },
          m.author
        ) : null,
        e.createElement(
          A.Item,
          { label: "来源链接" },
          e.createElement(
            "a",
            { href: m.source_url, target: "_blank" },
            m.source_url
          )
        )
      ),
      m.stats ? e.createElement(
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
          ...Object.entries(m.stats).map(
            ([d, ae]) => e.createElement(
              "div",
              { key: d, style: { textAlign: "center" } },
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
                u,
                { type: "secondary", style: { fontSize: 11 } },
                d
              )
            )
          )
        )
      ) : null
    ) : null
  ), Ke = l(() => {
    if (!U.trim()) return Te;
    const d = U.toLowerCase();
    return Te.filter(
      (ae) => ae.name.toLowerCase().includes(d) || ae.description.toLowerCase().includes(d) || ae.category.toLowerCase().includes(d)
    );
  }, [U]), Xe = async (d) => {
    try {
      const ae = await te("/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: d.name,
          description: d.description,
          skill_names: d.recommendedSkills
        })
      });
      await $e(ae.id, "AGENTS.md", d.systemPrompt);
      const ie = await Ce(ae.id);
      ie.approval_level = d.approvalLevel, await te(`/agents/${encodeURIComponent(ae.id)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ie)
      }), x.success(`专家「${d.name}」创建成功，已跳转至专家中心`), Ve("/ugsci-experts");
    } catch (ae) {
      x.error(ae.message || "创建专家失败");
    }
  }, qe = e.createElement(
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
    e.createElement(S, {
      placeholder: "搜索专家模板...",
      prefix: M ? e.createElement(M) : void 0,
      value: U,
      onChange: (d) => ce(d.target.value),
      allowClear: !0,
      style: { marginBottom: 16, maxWidth: 400 }
    }),
    e.createElement(
      P,
      { gutter: [12, 12] },
      ...Ke.map(
        (d) => e.createElement(
          T,
          { key: d.id, xs: 24, sm: 12, md: 8 },
          e.createElement(
            z,
            {
              hoverable: !0,
              size: "small",
              style: { height: "100%", cursor: "pointer" },
              onClick: () => Xe(d)
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
                d.emoji
              ),
              e.createElement(
                "div",
                { style: { flex: 1 } },
                e.createElement(
                  u,
                  { strong: !0, style: { fontSize: 14 } },
                  d.name
                ),
                e.createElement(
                  "div",
                  { style: { display: "flex", gap: 4, marginTop: 4 } },
                  e.createElement(
                    V,
                    { color: "blue", style: { fontSize: 10 } },
                    d.category
                  ),
                  d.approvalLevel === "MANUAL" ? e.createElement(
                    V,
                    { color: "orange", style: { fontSize: 10 } },
                    "需审批"
                  ) : e.createElement(
                    V,
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
              d.description.replace(/\*\*(.+?)\*\*/g, "$1")
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
                `推荐 ${d.recommendedSkills.length} 个技能`
              ),
              e.createElement(
                k,
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
      X ? e.createElement(X, {
        style: { fontSize: 24, color: "#bfbfbf", marginBottom: 8 }
      }) : null,
      e.createElement(
        u,
        { type: "secondary", style: { fontSize: 12 } },
        "更多专家模板持续更新中，未来将支持 OpenScience、RPA 等行业扩展"
      )
    )
  ), Ye = [
    {
      key: "skills",
      label: e.createElement(
        "span",
        null,
        F ? e.createElement(F) : null,
        " 技能市场"
      ),
      children: Je
    },
    {
      key: "experts",
      label: e.createElement("span", null, "🧑‍🔬 专家模板"),
      children: qe
    }
  ];
  return e.createElement(
    "div",
    { style: { padding: 24 } },
    e.createElement(ke, {
      title: "市场",
      subtitle: "浏览技能市场 · 选择专家模板 · 随时更新能力和专家",
      extra: e.createElement(
        k,
        {
          icon: L ? e.createElement(L) : void 0,
          onClick: () => ue(K, v, {}),
          loading: R
        },
        "刷新"
      )
    }),
    e.createElement(N, {
      items: Ye,
      activeKey: Y,
      onChange: (d) => Q(d)
    })
  );
}
function Lt() {
  var l;
  const e = window.QwenPaw;
  if (!(e != null && e.menu) || !(e != null && e.route)) {
    console.warn(
      "[ugsci] QwenPaw.menu/route API not available — plugin disabled"
    );
    return;
  }
  const n = E().React, a = "ugsci";
  e.route.add(a, {
    id: "ugsci.experts",
    path: "/ugsci-experts",
    component: vt
  }), e.menu.add(a, {
    id: "ugsci.experts",
    location: "primary.agentScoped",
    label: () => "专家中心",
    icon: n.createElement("span", { style: { fontSize: 16 } }, "🧑‍🔬"),
    route: "ugsci.experts",
    order: 5,
    visible: () => ve()
  }), e.route.add(a, {
    id: "ugsci.capabilities",
    path: "/ugsci-capabilities",
    component: It
  }), e.menu.add(a, {
    id: "ugsci.capabilities",
    location: "primary.agentScoped",
    label: () => "能力中心",
    icon: n.createElement("span", { style: { fontSize: 16 } }, "🔌"),
    route: "ugsci.capabilities",
    order: 6,
    visible: () => ve()
  }), e.route.add(a, {
    id: "ugsci.skills-center",
    path: "/ugsci-skills",
    component: Pt
  }), e.menu.add(a, {
    id: "ugsci.skills-center",
    location: "primary.agentScoped",
    label: () => "技能中心",
    icon: n.createElement("span", { style: { fontSize: 16 } }, "⚡"),
    route: "ugsci.skills-center",
    order: 7,
    visible: () => ve()
  }), e.route.add(a, {
    id: "ugsci.market",
    path: "/ugsci-market",
    component: At
  }), e.menu.add(a, {
    id: "ugsci.market",
    location: "primary.agentScoped",
    label: () => "市场",
    icon: n.createElement("span", { style: { fontSize: 16 } }, "🏪"),
    route: "ugsci.market",
    order: 8,
    visible: () => ve()
  }), (l = e.sidebar) != null && l.registerSimpleModeItems ? (e.sidebar.registerSimpleModeItems([
    "ugsci.experts",
    "ugsci.capabilities",
    "ugsci.skills-center",
    "ugsci.market"
  ]), console.info("[ugsci] Registered 4 items for simple-mode visibility")) : console.warn(
    "[ugsci] window.QwenPaw.sidebar.registerSimpleModeItems not available — items will not appear in simple mode"
  );
  const t = [
    "core.skills",
    "core.tools",
    "core.mcp",
    "core.acp",
    "core.agent-config",
    "core.agent-stats",
    "core.skill-pool"
  ];
  for (const r of t) {
    try {
      const y = e.menu.snapshot("primary.agentScoped").find((S) => S.id === r);
      y && e.menu.replace(a, r, {
        ...y,
        visible: () => !ve()
      });
    } catch {
    }
    try {
      const y = e.menu.snapshot("primary.settings").find((S) => S.id === r);
      y && e.menu.replace(a, r, {
        ...y,
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
    Lt();
  } catch (e) {
    console.error("[ugsci] Failed to build plugin:", e), setTimeout(Ie, 500);
  }
}
var je;
if ((je = window.QwenPaw) != null && je.host)
  Ie();
else {
  const e = setInterval(() => {
    var n;
    (n = window.QwenPaw) != null && n.host && (clearInterval(e), Ie());
  }, 200);
  setTimeout(() => clearInterval(e), 1e4);
}
