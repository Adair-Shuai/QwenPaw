function b() {
  var n;
  const e = (n = window.QwenPaw) == null ? void 0 : n.host;
  if (!e) throw new Error("[ugsci] QwenPaw.host not available");
  return e;
}
function qe() {
  try {
    return b().getApiToken() || "";
  } catch {
    return "";
  }
}
function Be(e) {
  return b().getApiUrl(e);
}
function je(e) {
  const n = qe();
  return {
    "Content-Type": "application/json",
    ...n ? { Authorization: `Bearer ${n}` } : {},
    ...e
  };
}
async function ne(e, n) {
  const t = await fetch(Be(e), {
    ...n,
    headers: { ...je(), ...(n == null ? void 0 : n.headers) || {} }
  });
  if (!t.ok) {
    const r = await t.text().catch(() => "");
    throw new Error(r || `HTTP ${t.status}`);
  }
  return t.status === 204 ? null : t.json();
}
async function ze() {
  const e = await ne("/agents");
  return (e == null ? void 0 : e.agents) || [];
}
async function xe(e) {
  return ne(`/agents/${encodeURIComponent(e)}`);
}
async function Qe(e) {
  return await ne("/skills", {
    headers: { "X-Agent-Id": e }
  }) || [];
}
async function Ne() {
  return await ne("/skills/pool") || [];
}
async function Ye() {
  return await ne("/skills/workspaces") || [];
}
async function De() {
  return await ne("/mcp") || [];
}
function Ze(e) {
  if (!e || typeof e != "object") return [];
  const n = e, t = n.mcpServers || n;
  return !t || typeof t != "object" ? [] : Object.keys(t).filter((r) => r !== "mcpServers");
}
function he() {
  try {
    return localStorage.getItem("qwenpaw_sidebar_mode") === "simple";
  } catch {
    return !1;
  }
}
function Ie(e, n) {
  const t = b();
  return t.ReactMarkdown && t.remarkGfm ? n.createElement(
    t.ReactMarkdown,
    { remarkPlugins: [t.remarkGfm] },
    e
  ) : e.replace(/\*\*(.+?)\*\*/g, "$1").replace(/\*(.+?)\*/g, "$1").replace(/`(.+?)`/g, "$1").replace(/^#+\s*/gm, "").replace(/^[-*]\s+/gm, "• ");
}
const Ce = [
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
], Fe = "ugsci_custom_teams";
function be() {
  try {
    const e = localStorage.getItem(Fe);
    return e ? JSON.parse(e) : [];
  } catch {
    return [];
  }
}
function We(e) {
  try {
    localStorage.setItem(Fe, JSON.stringify(e));
  } catch {
  }
}
const et = [
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
async function tt(e, n) {
  const t = {
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
  await fetch(Be("/console/chat"), {
    method: "POST",
    headers: {
      ...je(),
      "X-Agent-Id": e
    },
    body: JSON.stringify(t)
  });
}
function we(e, n) {
  const t = e.find(
    (l) => l.name === n || l.name === n.replace(/\s+/g, "")
  );
  if (t) return t.id;
  const r = e.find(
    (l) => l.name.includes(n) || n.includes(l.name) || l.name.replace(/\s+/g, "").includes(n.replace(/\s+/g, ""))
  );
  return r ? r.id : null;
}
function nt(e) {
  var t;
  const n = e.members.map((r) => `- ${r.emoji} ${r.name}（${r.role}）`).join(`
`);
  if (e.custom && e.steps && e.steps.length > 0) {
    const r = e.steps.map((a, o) => {
      const h = a.passContext ? "（传递上一步的结果作为上下文）" : "（独立执行，不传递上下文）";
      return `${o + 1}. 向「${a.agentName}」发送请求：${a.instruction} ${h}`;
    }).join(`
`);
    return `${e.mode === "pipeline" ? "请按顺序依次执行以下步骤，每步使用 chat_with_agent 咨询对应专家：" : e.mode === "roundtable" ? "请同时向以下专家分别发送独立请求（不传递上下文），收集所有结果后综合：" : `你是团队协调者（${e.coordinatorName || ((t = e.members[0]) == null ? void 0 : t.name) || ""}），请按需调用以下专家完成任务：`}

---

## 团队任务

${e.taskTemplate}

---

## 执行步骤

${r}

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
function lt({ team: e }) {
  const n = b().React, { Typography: t, Tag: r } = b().antd, { Text: l } = t, a = {
    pipeline: "→",
    roundtable: "⇄",
    coordinator: "⊙"
  }, o = {
    pipeline: "#13c2c2",
    roundtable: "#722ed1",
    coordinator: "#1677ff"
  }, h = e.steps || [], I = h.length > 0;
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
      ...I ? h.map((f, E) => {
        const T = e.members.find(
          (j) => j.name === f.agentName
        );
        return [
          E > 0 && e.mode !== "roundtable" ? n.createElement(
            "div",
            {
              key: `arrow-${E}`,
              style: {
                textAlign: "center",
                color: o[e.mode],
                fontSize: 14
              }
            },
            a[e.mode]
          ) : null,
          n.createElement(
            "div",
            {
              key: `step-${E}`,
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
            n.createElement(
              "span",
              { style: { fontSize: 16 } },
              (T == null ? void 0 : T.emoji) || "👤"
            ),
            n.createElement(
              "div",
              null,
              n.createElement(
                l,
                { strong: !0, style: { fontSize: 12 } },
                f.agentName
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
                f.instruction
              ),
              f.passContext ? n.createElement(
                r,
                {
                  color: "blue",
                  style: { fontSize: 9, marginTop: 2 }
                },
                "传递上下文"
              ) : n.createElement(
                r,
                { style: { fontSize: 9, marginTop: 2 } },
                "独立"
              )
            )
          )
        ];
      }).flat() : e.members.map((f, E) => [
        E > 0 && e.mode !== "roundtable" ? n.createElement(
          "div",
          {
            key: `arrow-${E}`,
            style: {
              textAlign: "center",
              color: o[e.mode],
              fontSize: 14
            }
          },
          a[e.mode]
        ) : null,
        n.createElement(
          "div",
          {
            key: `member-${E}`,
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
          n.createElement("span", { style: { fontSize: 16 } }, f.emoji),
          n.createElement(
            "div",
            null,
            n.createElement(
              l,
              { strong: !0, style: { fontSize: 12 } },
              f.name
            ),
            n.createElement(
              "div",
              { style: { fontSize: 11, color: "#8c8c8c" } },
              f.role
            )
          )
        )
      ]).flat()
    )
  );
}
function at({
  open: e,
  onClose: n,
  agents: t,
  editingTeam: r,
  onSaved: l
}) {
  const a = b().React, { useState: o, useEffect: h, useCallback: I } = a, {
    Modal: f,
    Input: E,
    Button: T,
    Select: j,
    Tag: C,
    Typography: D,
    Switch: R,
    Empty: w,
    message: y,
    Divider: H,
    Steps: A
  } = b().antd, { PlusOutlined: K, DeleteOutlined: p, SaveOutlined: x, ArrowRightOutlined: N } = b().antdIcons || {}, { Text: M, Paragraph: F } = D, [_, G] = o(""), [Z, g] = o("🤝"), [s, i] = o(""), [P, V] = o(
    "pipeline"
  ), [q, $] = o(""), [O, z] = o(""), [v, U] = o([]), [B, J] = o([]), [me, k] = o(!1);
  h(() => {
    e && (r ? (G(r.name), g(r.emoji), i(r.description), V(r.mode), $(r.coordinatorName || ""), z(r.taskTemplate), U(r.steps || []), J(r.members.map((m) => m.name))) : (G(""), g("🤝"), i(""), V("pipeline"), $(""), z(`请执行以下任务：
任务描述：{任务描述}`), U([]), J([])));
  }, [e, r]);
  const S = I(() => {
    if (P === "roundtable") {
      const m = B.map((ee) => ({
        agentName: ee,
        instruction: "请给出你的专业评估意见",
        passContext: !1
      }));
      U(m);
    } else if (P === "pipeline") {
      const m = new Map(v.map((le) => [le.agentName, le])), ee = B.map((le) => m.get(le) || {
        agentName: le,
        instruction: "请完成你的专业部分",
        passContext: !0
      });
      U(ee);
    }
  }, [P, B, v]), L = (m) => {
    B.includes(m) || (J([...B, m]), P === "coordinator" && !q && $(m));
  }, c = (m) => {
    J(B.filter((ee) => ee !== m)), U(v.filter((ee) => ee.agentName !== m)), q === m && $(B[0] || "");
  }, W = (m, ee, le) => {
    const u = [...v];
    u[m] = { ...u[m], [ee]: le }, U(u);
  }, re = () => {
    if (!_.trim()) {
      y.warning("请输入团队名称");
      return;
    }
    if (B.length < 2) {
      y.warning("至少需要选择 2 个成员");
      return;
    }
    if (!O.trim()) {
      y.warning("请输入任务模板");
      return;
    }
    if (P === "coordinator" && !q) {
      y.warning("请选择协调者");
      return;
    }
    k(!0);
    try {
      const m = B.map(
        (Q) => {
          var ae;
          const te = t.find((de) => de.name === Q);
          return {
            name: Q,
            role: ((ae = te == null ? void 0 : te.description) == null ? void 0 : ae.slice(0, 30)) || "团队成员",
            emoji: "👤"
          };
        }
      );
      let ee = v;
      (v.length === 0 || v.length !== B.length) && (ee = B.map((Q) => ({
        agentName: Q,
        instruction: "请完成你的专业部分",
        passContext: P === "pipeline"
      })));
      const le = {
        id: (r == null ? void 0 : r.id) || `custom-${Date.now()}`,
        name: _.trim(),
        emoji: Z,
        category: "自定义",
        description: s.trim() || `${_.trim()}（${B.length}人团队）`,
        mode: P,
        members: m,
        coordinatorName: P === "coordinator" ? q : void 0,
        taskTemplate: O.trim(),
        orchestrationPrompt: "",
        // Custom teams use steps-based instructions
        steps: ee,
        custom: !0,
        createdAt: (r == null ? void 0 : r.createdAt) || Date.now()
      }, u = be(), X = u.findIndex((Q) => Q.id === le.id);
      X >= 0 ? u[X] = le : u.push(le), We(u), y.success(r ? "团队已更新" : "团队已创建"), l(), n();
    } catch (m) {
      y.error(m.message || "保存失败");
    } finally {
      k(!1);
    }
  }, pe = [
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
  ], fe = t.filter(
    (m) => !B.includes(m.name)
  );
  return a.createElement(
    f,
    {
      open: e,
      onCancel: n,
      title: a.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 8 } },
        a.createElement(
          "span",
          { style: { fontSize: 20 } },
          r ? "✏️" : "➕"
        ),
        a.createElement(
          "span",
          null,
          r ? "编辑专家团" : "创建专家团"
        )
      ),
      width: 720,
      onOk: re,
      okText: "保存团队",
      confirmLoading: me,
      okButtonProps: {
        icon: x ? a.createElement(x) : void 0
      }
    },
    // Step 1: Basic info
    a.createElement(
      "div",
      { style: { marginBottom: 16 } },
      a.createElement(
        M,
        {
          strong: !0,
          style: { display: "block", marginBottom: 8, fontSize: 13 }
        },
        "1. 基本信息"
      ),
      a.createElement(
        "div",
        { style: { display: "flex", gap: 8, marginBottom: 8 } },
        a.createElement(j, {
          value: Z,
          onChange: (m) => g(m),
          style: { width: 60 },
          options: pe.map((m) => ({ value: m, label: m })),
          optionRender: (m) => a.createElement("span", { style: { fontSize: 18 } }, m.value)
        }),
        a.createElement(E, {
          placeholder: "团队名称（如：储层评价团队）",
          value: _,
          onChange: (m) => G(m.target.value),
          style: { flex: 1 }
        })
      ),
      a.createElement(E.TextArea, {
        placeholder: "团队描述（简述团队的目标和适用场景）",
        value: s,
        onChange: (m) => i(m.target.value),
        rows: 2,
        style: { marginBottom: 8 }
      }),
      a.createElement(
        "div",
        { style: { display: "flex", gap: 8, alignItems: "center" } },
        a.createElement(
          M,
          { type: "secondary", style: { fontSize: 12 } },
          "协同模式："
        ),
        a.createElement(j, {
          value: P,
          onChange: (m) => V(m),
          style: { width: 160 },
          options: [
            { value: "pipeline", label: "🔄 流水线（依次执行）" },
            { value: "roundtable", label: "🔀 圆桌讨论（独立评估）" },
            { value: "coordinator", label: "🎯 协调者（由协调者主导）" }
          ]
        })
      )
    ),
    a.createElement(H, { style: { margin: "12px 0" } }),
    // Step 2: Select members
    a.createElement(
      "div",
      { style: { marginBottom: 16 } },
      a.createElement(
        M,
        {
          strong: !0,
          style: { display: "block", marginBottom: 8, fontSize: 13 }
        },
        "2. 选择团队成员"
      ),
      // Available agents
      fe.length > 0 ? a.createElement(
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
          (m) => a.createElement(
            T,
            {
              key: m.id,
              size: "small",
              icon: K ? a.createElement(K) : void 0,
              onClick: () => L(m.name)
            },
            m.name
          )
        )
      ) : null,
      // Selected members
      B.length === 0 ? a.createElement(w, {
        description: "请从上方添加团队成员",
        image: w.PRESENTED_IMAGE_SIMPLE
      }) : a.createElement(
        "div",
        { style: { display: "flex", flexDirection: "column", gap: 4 } },
        ...B.map(
          (m) => a.createElement(
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
            a.createElement(
              "div",
              { style: { display: "flex", alignItems: "center", gap: 6 } },
              a.createElement("span", null, "👤"),
              a.createElement(
                M,
                { strong: !0, style: { fontSize: 13 } },
                m
              ),
              P === "coordinator" && q === m ? a.createElement(
                C,
                { color: "blue", style: { fontSize: 10 } },
                "协调者"
              ) : null
            ),
            a.createElement(
              "div",
              { style: { display: "flex", gap: 4 } },
              P === "coordinator" ? a.createElement(
                T,
                {
                  size: "small",
                  type: "link",
                  onClick: () => $(m)
                },
                "设为协调者"
              ) : null,
              a.createElement(
                T,
                {
                  size: "small",
                  type: "link",
                  danger: !0,
                  icon: p ? a.createElement(p) : void 0,
                  onClick: () => c(m)
                },
                "移除"
              )
            )
          )
        )
      )
    ),
    a.createElement(H, { style: { margin: "12px 0" } }),
    // Step 3: Define execution steps (for pipeline/roundtable)
    B.length > 0 ? a.createElement(
      "div",
      { style: { marginBottom: 16 } },
      a.createElement(
        M,
        {
          strong: !0,
          style: { display: "block", marginBottom: 8, fontSize: 13 }
        },
        `3. 编排执行步骤${P === "roundtable" ? "（各步独立执行）" : P === "pipeline" ? "（依次执行，可传递上下文）" : "（由协调者决定调用顺序）"}`
      ),
      // Auto-sync button
      a.createElement(
        T,
        {
          size: "small",
          type: "dashed",
          onClick: S,
          style: { marginBottom: 8 }
        },
        "自动生成步骤"
      ),
      // Steps list
      v.length === 0 ? a.createElement(
        M,
        { type: "secondary", style: { fontSize: 12 } },
        "点击「自动生成步骤」或手动配置每步的指令"
      ) : a.createElement(
        "div",
        { style: { display: "flex", flexDirection: "column", gap: 6 } },
        ...v.map(
          (m, ee) => a.createElement(
            "div",
            {
              key: ee,
              style: {
                padding: 8,
                background: "#fff",
                borderRadius: 6,
                border: "1px solid #e8e8e8"
              }
            },
            a.createElement(
              "div",
              {
                style: {
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  marginBottom: 6
                }
              },
              P === "pipeline" ? a.createElement(
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
                `${ee + 1}`
              ) : a.createElement(
                "span",
                { style: { fontSize: 14 } },
                "🔀"
              ),
              a.createElement(
                C,
                { color: "blue", style: { fontSize: 11 } },
                m.agentName
              ),
              a.createElement(
                "div",
                { style: { flex: 1 } },
                a.createElement(E, {
                  placeholder: "请输入该步骤的指令...",
                  value: m.instruction,
                  onChange: (le) => W(ee, "instruction", le.target.value),
                  size: "small"
                })
              )
            ),
            a.createElement(
              "div",
              {
                style: {
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  paddingLeft: 28
                }
              },
              a.createElement(R, {
                size: "small",
                checked: m.passContext,
                onChange: (le) => W(ee, "passContext", le)
              }),
              a.createElement(
                M,
                { type: "secondary", style: { fontSize: 11 } },
                m.passContext ? "传递上一步结果作为上下文" : "独立执行"
              )
            )
          )
        )
      )
    ) : null,
    a.createElement(H, { style: { margin: "12px 0" } }),
    // Step 4: Task template
    a.createElement(
      "div",
      null,
      a.createElement(
        M,
        {
          strong: !0,
          style: { display: "block", marginBottom: 8, fontSize: 13 }
        },
        `${B.length > 0 ? "4" : "3"}. 任务模板`
      ),
      a.createElement(E.TextArea, {
        placeholder: `输入任务模板，可用 {参数名} 作为占位符...

例如：
请对区块 {区块名} 的井 {井号} 进行储层评价`,
        value: O,
        onChange: (m) => z(m.target.value),
        rows: 4,
        style: { fontFamily: "monospace", fontSize: 13 }
      }),
      a.createElement(
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
function Oe({
  team: e,
  agents: n,
  onLaunch: t,
  onEdit: r,
  onDelete: l
}) {
  var s;
  const a = b().React, { useState: o } = a, { Card: h, Tag: I, Typography: f, Button: E, Tooltip: T } = b().antd, {
    TeamOutlined: j,
    RocketOutlined: C,
    UserOutlined: D,
    EditOutlined: R,
    DeleteOutlined: w,
    DownOutlined: y,
    UpOutlined: H
  } = b().antdIcons || {}, { Text: A, Paragraph: K } = f, [p, x] = o(!1), N = {
    coordinator: { label: "协调者模式", color: "blue" },
    pipeline: { label: "流水线模式", color: "cyan" },
    roundtable: { label: "圆桌讨论", color: "purple" }
  }, M = N[e.mode] || N.coordinator, F = e.members.map((i) => {
    const P = we(n, i.name);
    return { ...i, found: !!P, agentId: P };
  }), _ = F.filter((i) => i.found).length, G = _ === e.members.length, Z = e.coordinatorName || ((s = e.members[0]) == null ? void 0 : s.name), g = Z ? we(n, Z) : null;
  return a.createElement(
    h,
    {
      hoverable: !0,
      size: "small",
      style: { height: "100%", display: "flex", flexDirection: "column" }
    },
    // Header: emoji + name + mode tag + custom badge
    a.createElement(
      "div",
      {
        style: {
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 10
        }
      },
      a.createElement("span", { style: { fontSize: 24 } }, e.emoji),
      a.createElement(
        "div",
        { style: { flex: 1 } },
        a.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 6 } },
          a.createElement(
            A,
            { strong: !0, style: { fontSize: 14 } },
            e.name
          ),
          e.custom ? a.createElement(
            I,
            { color: "gold", style: { fontSize: 9 } },
            "自定义"
          ) : null
        ),
        a.createElement(
          "div",
          { style: { display: "flex", gap: 4, marginTop: 4 } },
          a.createElement(
            I,
            { color: M.color, style: { fontSize: 10 } },
            M.label
          ),
          a.createElement(
            I,
            { style: { fontSize: 10 } },
            `${_}/${e.members.length}`
          ),
          G ? null : a.createElement(
            I,
            { color: "orange", style: { fontSize: 10 } },
            "缺少成员"
          )
        )
      ),
      // Edit/delete for custom teams
      e.custom ? a.createElement(
        "div",
        { style: { display: "flex", gap: 2 } },
        r ? a.createElement(
          T,
          { title: "编辑" },
          a.createElement(E, {
            type: "text",
            size: "small",
            icon: R ? a.createElement(R) : void 0,
            onClick: (i) => {
              i.stopPropagation(), r(e);
            }
          })
        ) : null,
        l ? a.createElement(
          T,
          { title: "删除" },
          a.createElement(E, {
            type: "text",
            size: "small",
            danger: !0,
            icon: w ? a.createElement(w) : void 0,
            onClick: (i) => {
              i.stopPropagation(), l(e);
            }
          })
        ) : null
      ) : null
    ),
    // Description
    a.createElement(
      K,
      {
        type: "secondary",
        style: { fontSize: 12, margin: 0, marginBottom: 10, lineHeight: 1.5 },
        ellipsis: { rows: 2 }
      },
      e.description
    ),
    // Member avatars
    a.createElement(
      "div",
      {
        style: {
          display: "flex",
          gap: 6,
          marginBottom: 10,
          flexWrap: "wrap"
        }
      },
      ...F.map(
        (i) => a.createElement(
          T,
          {
            key: i.name,
            title: `${i.name}（${i.role}）${i.found ? "" : " - 未创建"}`
          },
          a.createElement(
            "div",
            {
              style: {
                display: "flex",
                alignItems: "center",
                gap: 4,
                padding: "2px 8px",
                borderRadius: 12,
                background: i.found ? "#f0f5ff" : "#fff2f0",
                border: `1px solid ${i.found ? "#d6e4ff" : "#ffccc7"}`,
                fontSize: 11
              }
            },
            a.createElement("span", null, i.emoji),
            a.createElement(
              A,
              {
                style: { fontSize: 11, color: i.found ? "#1f4e8c" : "#cf1322" }
              },
              i.name
            )
          )
        )
      )
    ),
    // Toggle flow diagram
    a.createElement(
      E,
      {
        type: "link",
        size: "small",
        style: { padding: "0 0 4px 0", fontSize: 11, height: "auto" },
        onClick: (i) => {
          i.stopPropagation(), x(!p);
        },
        icon: p ? H ? a.createElement(H) : "▲" : y ? a.createElement(y) : "▼"
      },
      p ? "收起流程" : "查看执行流程"
    ),
    p ? a.createElement(lt, { team: e }) : null,
    // Footer: launch button
    a.createElement(
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
      a.createElement(
        A,
        { type: "secondary", style: { fontSize: 11 } },
        Z ? `协调者: ${Z}` : ""
      ),
      a.createElement(
        E,
        {
          type: "primary",
          size: "small",
          icon: C ? a.createElement(C) : void 0,
          disabled: !g,
          onClick: () => t(e)
        },
        "发起团队任务"
      )
    )
  );
}
function rt({
  agents: e,
  onLaunch: n
}) {
  const t = b().React, { useMemo: r, useState: l, useCallback: a, useEffect: o } = t, {
    Row: h,
    Col: I,
    Input: f,
    Empty: E,
    Typography: T,
    Tag: j,
    Button: C,
    Divider: D,
    message: R,
    Popconfirm: w
  } = b().antd, { SearchOutlined: y, TeamOutlined: H, PlusOutlined: A, RocketOutlined: K } = b().antdIcons || {}, { Text: p } = T, [x, N] = l(""), [M, F] = l([]), [_, G] = l(!1), [Z, g] = l(null);
  o(() => {
    F(be());
  }, []);
  const s = a(() => {
    F(be());
  }, []), i = a(
    (v) => {
      const B = be().filter((J) => J.id !== v.id);
      We(B), F(B), R.success(`团队「${v.name}」已删除`);
    },
    [R]
  ), P = a((v) => {
    g(v), G(!0);
  }, []), V = a(() => {
    g(null), G(!0);
  }, []), q = r(() => [...M, ...et], [M]), $ = r(() => {
    if (!x.trim()) return q;
    const v = x.toLowerCase();
    return q.filter(
      (U) => U.name.toLowerCase().includes(v) || U.description.toLowerCase().includes(v) || U.category.toLowerCase().includes(v)
    );
  }, [q, x]), O = $.filter((v) => v.custom), z = $.filter((v) => !v.custom);
  return t.createElement(
    "div",
    null,
    // Info banner
    t.createElement(
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
      t.createElement(
        p,
        { style: { fontSize: 13, color: "#389e0d" } },
        "多智能体协同 — 选择预设团队或创建自定义团队，支持流水线、圆桌讨论、协调者三种编排模式。"
      ),
      t.createElement(
        C,
        {
          type: "primary",
          size: "small",
          icon: A ? t.createElement(A) : void 0,
          onClick: V
        },
        "创建专家团"
      )
    ),
    // Search
    t.createElement(f, {
      placeholder: "搜索团队名称、描述或类别...",
      prefix: y ? t.createElement(y) : void 0,
      value: x,
      onChange: (v) => N(v.target.value),
      allowClear: !0,
      style: { marginBottom: 16, maxWidth: 400 }
    }),
    // Custom teams section
    O.length > 0 ? t.createElement(
      "div",
      { style: { marginBottom: 20 } },
      t.createElement(
        "div",
        {
          style: {
            display: "flex",
            alignItems: "center",
            gap: 6,
            marginBottom: 10
          }
        },
        t.createElement("span", { style: { fontSize: 16 } }, "⭐"),
        t.createElement(
          p,
          { strong: !0, style: { fontSize: 14 } },
          `自定义团队 (${O.length})`
        )
      ),
      t.createElement(
        h,
        { gutter: [12, 12] },
        ...O.map(
          (v) => t.createElement(
            I,
            { key: v.id, xs: 24, sm: 12, md: 8 },
            t.createElement(Oe, {
              team: v,
              agents: e,
              onLaunch: n,
              onEdit: P,
              onDelete: i
            })
          )
        )
      ),
      t.createElement(D, { style: { margin: "16px 0" } })
    ) : null,
    // Preset teams section
    z.length > 0 ? t.createElement(
      "div",
      null,
      t.createElement(
        "div",
        {
          style: {
            display: "flex",
            alignItems: "center",
            gap: 6,
            marginBottom: 10
          }
        },
        t.createElement("span", { style: { fontSize: 16 } }, "📋"),
        t.createElement(
          p,
          { strong: !0, style: { fontSize: 14 } },
          `预设团队 (${z.length})`
        ),
        t.createElement(
          p,
          { type: "secondary", style: { fontSize: 12 } },
          "· 行业典型工作流模板"
        )
      ),
      t.createElement(
        h,
        { gutter: [12, 12] },
        ...z.map(
          (v) => t.createElement(
            I,
            { key: v.id, xs: 24, sm: 12, md: 8 },
            t.createElement(Oe, {
              team: v,
              agents: e,
              onLaunch: n
            })
          )
        )
      )
    ) : null,
    // Empty state
    $.length === 0 ? t.createElement(E, {
      description: "未找到匹配的专家团队，点击「创建专家团」自定义",
      image: E.PRESENTED_IMAGE_SIMPLE
    }) : null,
    // Team Builder Modal
    t.createElement(at, {
      open: _,
      onClose: () => {
        G(!1), g(null);
      },
      agents: e,
      editingTeam: Z,
      onSaved: s
    })
  );
}
function ot(e) {
  var t;
  const n = [];
  for (const r of e) {
    if (r.enabled === !1) continue;
    const l = (t = r.description) == null ? void 0 : t.trim();
    if (!l) continue;
    let a = l;
    if (a = a.replace(/\*\*(.+?)\*\*/g, "$1").replace(/\*(.+?)\*/g, "$1").replace(/`(.+?)`/g, "$1").replace(/^#+\s*/gm, "").trim(), /^(用于|帮助|提供|支持|实现|完成|分析|计算|生成|创建|检查)/.test(a) ? a = `请${a}` : /^(a |an |the )/i.test(a) ? a = `Help me with ${a}` : /[。？！.?!]$/.test(a) || (a = `帮我${a}`), a.length > 80 && (a = a.substring(0, 77) + "..."), n.push(a), n.length >= 4) break;
  }
  return n;
}
async function st(e) {
  return await ne("/workspace/files", {
    headers: { "X-Agent-Id": e }
  }) || [];
}
async function Pe(e, n, t) {
  await ne(`/workspace/files/${encodeURIComponent(n)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify({ content: t })
  });
}
async function Re(e, n) {
  const t = await xe(e);
  t.system_prompt_files = n, await ne(`/agents/${encodeURIComponent(e)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(t)
  });
}
async function it(e, n) {
  await ne("/skills/pool/download", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      skill_name: n,
      targets: [{ workspace_id: e }],
      overwrite: !1
    })
  });
}
async function ct(e, n) {
  await ne(`/skills/${encodeURIComponent(n)}`, {
    method: "DELETE",
    headers: { "X-Agent-Id": e }
  });
}
async function mt(e, n) {
  await ne(`/mcp/${encodeURIComponent(n)}`, {
    method: "DELETE",
    headers: { "X-Agent-Id": e }
  });
}
const _e = ["AGENTS.md", "SOUL.md", "PROFILE.md"];
function ke({
  title: e,
  subtitle: n,
  extra: t
}) {
  const r = b().React, { Space: l } = b().antd;
  return r.createElement(
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
    r.createElement(
      "div",
      null,
      r.createElement(
        "h2",
        { style: { margin: 0, fontSize: 20, fontWeight: 600 } },
        e
      ),
      n ? r.createElement(
        "div",
        { style: { marginTop: 4, fontSize: 13, color: "#8c8c8c" } },
        n
      ) : null
    ),
    t ? r.createElement(l, null, t) : null
  );
}
function Le({
  items: e,
  max: n = 5,
  color: t = "blue",
  emptyText: r = "无"
}) {
  const l = b().React, { Tag: a } = b().antd;
  return !e || e.length === 0 ? l.createElement(
    "span",
    { style: { fontSize: 12, color: "#bfbfbf" } },
    r
  ) : l.createElement(
    "div",
    { style: { display: "flex", flexWrap: "wrap", gap: 4 } },
    ...e.slice(0, n).map(
      (o, h) => l.createElement(
        a,
        { key: h, color: t, style: { fontSize: 11, marginRight: 0 } },
        o
      )
    ),
    e.length > n ? l.createElement(
      a,
      { style: { fontSize: 11, marginRight: 0 } },
      `+${e.length - n}`
    ) : null
  );
}
function dt({
  open: e,
  onClose: n,
  poolSkills: t,
  installedSkillNames: r,
  loading: l,
  onInstall: a
}) {
  const o = b().React, { useState: h, useEffect: I, useMemo: f } = o, { Modal: E, Button: T, Empty: j, Spin: C, Input: D, Tag: R, Tooltip: w, Typography: y } = b().antd, { CheckOutlined: H, SearchOutlined: A } = b().antdIcons || {}, { Text: K } = y, [p, x] = h([]), [N, M] = h("");
  I(() => {
    e && (x([]), M(""));
  }, [e]);
  const F = f(() => {
    if (!N.trim()) return t;
    const g = N.toLowerCase();
    return t.filter(
      (s) => {
        var i, P;
        return s.name.toLowerCase().includes(g) || ((i = s.description) == null ? void 0 : i.toLowerCase().includes(g)) || ((P = s.tags) == null ? void 0 : P.some((V) => V.toLowerCase().includes(g)));
      }
    );
  }, [t, N]), _ = F.filter(
    (g) => !r.includes(g.name)
  ), G = (g) => {
    x(
      (s) => s.includes(g) ? s.filter((i) => i !== g) : [...s, g]
    );
  }, Z = async () => {
    p.length !== 0 && (await a(p), x([]));
  };
  return o.createElement(
    E,
    {
      open: e,
      onCancel: n,
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
          K,
          { type: "secondary", style: { fontSize: 13 } },
          `已选择 ${p.length} 个技能`
        ),
        o.createElement(
          "div",
          { style: { display: "flex", gap: 8 } },
          o.createElement(T, { onClick: n }, "取消"),
          o.createElement(
            T,
            {
              type: "primary",
              onClick: Z,
              disabled: p.length === 0
            },
            p.length > 0 ? `添加 (${p.length})` : "添加"
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
      o.createElement(D, {
        placeholder: "搜索技能名称、描述或标签...",
        prefix: A ? o.createElement(A) : void 0,
        value: N,
        onChange: (g) => M(g.target.value),
        allowClear: !0,
        style: { flex: 1 }
      }),
      o.createElement(
        T,
        {
          size: "small",
          type: "primary",
          onClick: () => x(_.map((g) => g.name))
        },
        "全选"
      ),
      o.createElement(
        T,
        {
          size: "small",
          onClick: () => x([])
        },
        "清空"
      )
    ),
    // Skill grid (card style matching Skill Center)
    l ? o.createElement(
      "div",
      { style: { textAlign: "center", padding: 40 } },
      o.createElement(C, { size: "large" })
    ) : F.length === 0 ? o.createElement(j, {
      description: N ? "未找到匹配的技能" : "技能池暂无可用技能",
      image: j.PRESENTED_IMAGE_SIMPLE
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
      ...F.map((g) => {
        const s = p.includes(g.name), i = r.includes(g.name);
        return o.createElement(
          "div",
          {
            key: g.name,
            onClick: () => !i && G(g.name),
            style: {
              position: "relative",
              padding: "10px 12px",
              border: `1px solid ${s ? "#0072f5" : "#e8e8e8"}`,
              borderRadius: 6,
              cursor: i ? "not-allowed" : "pointer",
              transition: "all 0.15s ease",
              background: s ? "rgba(0, 114, 245, 0.06)" : i ? "#fafafa" : "#fff",
              opacity: i ? 0.5 : 1,
              minHeight: 64
            }
          },
          s ? o.createElement(
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
            H ? o.createElement(H) : "✓"
          ) : null,
          i ? o.createElement(
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
                paddingRight: i || s ? 24 : 0
              }
            },
            o.createElement(
              "span",
              { style: { fontSize: 16 } },
              g.emoji || "⚡"
            ),
            o.createElement(
              w,
              { title: g.name },
              o.createElement(
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
                g.name
              )
            )
          ),
          g.description ? o.createElement(
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
            g.description
          ) : null,
          g.tags && g.tags.length > 0 ? o.createElement(
            "div",
            {
              style: {
                marginTop: 4,
                display: "flex",
                gap: 2,
                flexWrap: "wrap"
              }
            },
            ...g.tags.slice(0, 2).map(
              (P, V) => o.createElement(
                R,
                {
                  key: V,
                  color: "cyan",
                  style: { fontSize: 10, marginRight: 0 }
                },
                P
              )
            )
          ) : null
        );
      })
    )
  );
}
function pt({
  expert: e,
  onClick: n
}) {
  const t = b().React, { Card: r, Tag: l, Badge: a, Typography: o, Spin: h } = b().antd, { Text: I } = o, { agent: f, skills: E, mcps: T, loading: j } = e, C = f.enabled, D = E.filter((y) => y.enabled !== !1).map((y) => y.name), R = T.map((y) => y.name || y.key), w = f.active_model ? `${f.active_model.provider_id}/${f.active_model.model}` : null;
  return t.createElement(
    r,
    {
      hoverable: !0,
      onClick: n,
      size: "small",
      style: {
        cursor: "pointer",
        transition: "all 0.2s ease",
        borderColor: C ? void 0 : "#d9d9d9",
        opacity: C ? 1 : 0.7
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
            I,
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
      t.createElement(a, {
        status: C ? "success" : "default",
        text: C ? "启用" : "停用"
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
          overflow: "hidden"
        }
      },
      Ie(f.description, t)
    ) : t.createElement(
      "div",
      { style: { fontSize: 12, color: "#bfbfbf", marginBottom: 10 } },
      "暂无描述"
    ),
    // Model info
    w ? t.createElement(
      "div",
      { style: { marginBottom: 8 } },
      t.createElement(
        l,
        { color: "geekblue", style: { fontSize: 11 } },
        `🤖 ${w}`
      )
    ) : null,
    // Skills
    j ? t.createElement(h, { size: "small" }) : t.createElement(
      "div",
      { style: { marginBottom: 6 } },
      t.createElement(
        "div",
        { style: { fontSize: 11, color: "#8c8c8c", marginBottom: 4 } },
        `技能 (${D.length})`
      ),
      t.createElement(Le, {
        items: D,
        max: 4,
        color: "cyan",
        emptyText: "未配置技能"
      })
    ),
    // MCP
    !j && R.length > 0 ? t.createElement(
      "div",
      null,
      t.createElement(
        "div",
        { style: { fontSize: 11, color: "#8c8c8c", marginBottom: 4 } },
        `MCP (${R.length})`
      ),
      t.createElement(Le, {
        items: R,
        max: 3,
        color: "purple"
      })
    ) : null
  );
}
function ut({
  expert: e,
  open: n,
  onClose: t,
  onRefresh: r
}) {
  const l = b().React, {
    Drawer: a,
    Descriptions: o,
    Tag: h,
    Typography: I,
    Space: f,
    Button: E,
    Empty: T,
    Tabs: j,
    List: C,
    Spin: D,
    Modal: R,
    message: w
  } = b().antd, { Text: y, Paragraph: H } = I, {
    EditOutlined: A,
    ThunderboltOutlined: K,
    FileTextOutlined: p,
    ToolOutlined: x,
    PlusOutlined: N
  } = b().antdIcons || {}, [M, F] = l.useState(!1), [_, G] = l.useState(
    []
  ), [Z, g] = l.useState(!1);
  if (!e) return null;
  const { agent: s, config: i, skills: P, mcps: V, loading: q } = e, $ = P.filter((c) => c.enabled !== !1), O = (c) => {
    window.history.pushState({}, "", c), window.dispatchEvent(new PopStateEvent("popstate"));
  }, z = l.createElement(
    "div",
    null,
    l.createElement(
      o,
      { column: 1, bordered: !0, size: "small" },
      l.createElement(o.Item, { label: "专家名称" }, s.name),
      l.createElement(
        o.Item,
        { label: "专家 ID" },
        l.createElement("code", { style: { fontSize: 12 } }, s.id)
      ),
      l.createElement(
        o.Item,
        { label: "状态" },
        l.createElement(
          h,
          { color: s.enabled ? "green" : "default" },
          s.enabled ? "启用" : "停用"
        )
      ),
      l.createElement(
        o.Item,
        { label: "功能简介" },
        s.description ? Ie(s.description, l) : "暂无描述"
      ),
      l.createElement(
        o.Item,
        { label: "使用模型" },
        s.active_model ? `${s.active_model.provider_id} / ${s.active_model.model}` : "使用全局默认模型"
      ),
      i != null && i.workspace_dir ? l.createElement(
        o.Item,
        { label: "工作区路径" },
        l.createElement(
          "code",
          { style: { fontSize: 11 } },
          i.workspace_dir
        )
      ) : null,
      i != null && i.approval_level ? l.createElement(
        o.Item,
        { label: "审批级别" },
        i.approval_level
      ) : null
    ),
    // System prompt files
    i != null && i.system_prompt_files && i.system_prompt_files.length > 0 ? l.createElement(
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
        l.createElement(y, { strong: !0 }, "系统提示词文件")
      ),
      l.createElement(
        f,
        { wrap: !0 },
        ...i.system_prompt_files.map(
          (c, W) => l.createElement(
            h,
            {
              key: W,
              icon: p ? l.createElement(p) : void 0,
              style: { fontSize: 12 }
            },
            c
          )
        )
      )
    ) : null
  ), v = async () => {
    F(!0), g(!0);
    try {
      const c = await Ne();
      G(c);
    } catch (c) {
      w.error(c.message || "加载技能池失败");
    } finally {
      g(!1);
    }
  }, U = async (c) => {
    let W = 0, re = 0;
    for (const pe of c)
      try {
        await it(s.id, pe), W++;
      } catch {
        re++;
      }
    W > 0 ? (w.success(
      `成功添加 ${W} 个技能${re > 0 ? `，${re} 个失败` : ""}`
    ), r()) : re > 0 && w.error("添加技能失败"), F(!1);
  }, B = async (c) => {
    try {
      await ct(s.id, c), w.success(`技能「${c}」已移除`), r();
    } catch (W) {
      w.error(W.message || "移除技能失败");
    }
  }, J = async (c) => {
    try {
      await mt(s.id, c), w.success(`MCP「${c}」已移除`), r();
    } catch (W) {
      w.error(W.message || "移除 MCP 失败");
    }
  }, me = q ? l.createElement(
    "div",
    { style: { textAlign: "center", padding: 40 } },
    l.createElement(D, { size: "large" })
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
        y,
        { strong: !0 },
        `已启用技能 (${$.length})`
      ),
      l.createElement(
        E,
        {
          type: "primary",
          size: "small",
          icon: N ? l.createElement(N) : void 0,
          onClick: v
        },
        "从技能池添加"
      )
    ),
    $.length === 0 ? l.createElement(T, {
      description: "该专家暂无已启用的技能",
      image: T.PRESENTED_IMAGE_SIMPLE
    }) : l.createElement(C, {
      dataSource: $,
      renderItem: (c) => l.createElement(
        C.Item,
        {
          actions: [
            l.createElement(
              E,
              {
                type: "link",
                size: "small",
                danger: !0,
                onClick: () => B(c.name)
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
            l.createElement(y, { strong: !0 }, c.name),
            c.version_text ? l.createElement(
              h,
              { style: { fontSize: 10 } },
              `v${c.version_text}`
            ) : null
          ),
          c.description ? l.createElement(
            H,
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
              (W, re) => l.createElement(
                h,
                {
                  key: re,
                  color: "cyan",
                  style: { fontSize: 10 }
                },
                W
              )
            )
          ) : null
        )
      )
    }),
    // Skill Picker Modal (card-grid style, consistent with Skill Center)
    l.createElement(dt, {
      open: M,
      onClose: () => F(!1),
      poolSkills: _,
      installedSkillNames: $.map((c) => c.name),
      loading: Z,
      onInstall: U
    })
  ), k = q ? l.createElement(
    "div",
    { style: { textAlign: "center", padding: 40 } },
    l.createElement(D, { size: "large" })
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
        y,
        { strong: !0 },
        `MCP 客户端 (${V.length})`
      ),
      l.createElement(
        E,
        {
          type: "primary",
          size: "small",
          icon: N ? l.createElement(N) : void 0,
          onClick: () => {
            window.history.pushState({}, "", `/agents/${s.id}/mcp`), window.dispatchEvent(new PopStateEvent("popstate"));
          }
        },
        "配置 MCP"
      )
    ),
    V.length === 0 ? l.createElement(T, {
      description: "该专家暂无关联的 MCP 客户端，点击「配置 MCP」添加",
      image: T.PRESENTED_IMAGE_SIMPLE
    }) : l.createElement(C, {
      dataSource: V,
      renderItem: (c) => l.createElement(
        C.Item,
        {
          actions: [
            l.createElement(
              E,
              {
                type: "link",
                size: "small",
                danger: !0,
                onClick: () => J(c.key)
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
              y,
              { strong: !0 },
              c.name || c.key
            ),
            l.createElement(
              h,
              {
                color: c.enabled ? "green" : "default",
                style: { fontSize: 10 }
              },
              c.enabled ? "启用" : "停用"
            ),
            l.createElement(
              h,
              { color: "purple", style: { fontSize: 10 } },
              c.transport
            )
          ),
          c.description ? l.createElement(
            H,
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
  ), S = i != null && i.tools ? l.createElement(
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
        x ? l.createElement(x, {
          style: { fontSize: 14, color: "#1677ff" }
        }) : null,
        l.createElement(y, { strong: !0 }, "工具配置")
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
        JSON.stringify(i.tools, null, 2)
      )
    )
  ) : l.createElement(T, {
    description: "暂无工具配置",
    image: T.PRESENTED_IMAGE_SIMPLE
  }), L = [
    { key: "basic", label: "基本信息", children: z },
    {
      key: "skills",
      label: `技能 (${$.length})`,
      children: me
    },
    {
      key: "prompts",
      label: "推荐提问",
      children: l.createElement(ft, {
        skills: $,
        agentId: s.id
      })
    },
    {
      key: "knowledge",
      label: "专家记忆",
      children: l.createElement(yt, {
        agentId: s.id,
        systemPromptFiles: (i == null ? void 0 : i.system_prompt_files) || [],
        onRefresh: () => r()
      })
    },
    { key: "mcp", label: `MCP (${V.length})`, children: k },
    { key: "tools", label: "工具配置", children: S }
  ];
  return l.createElement(
    a,
    {
      title: l.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 8 } },
        l.createElement("span", { style: { fontSize: 20 } }, "🧑‍🔬"),
        l.createElement("span", null, s.name)
      ),
      open: n,
      onClose: t,
      width: 560,
      extra: l.createElement(
        f,
        null,
        l.createElement(
          E,
          {
            size: "small",
            icon: A ? l.createElement(A) : void 0,
            onClick: () => O("/agents")
          },
          "编辑专家"
        ),
        l.createElement(
          E,
          {
            type: "primary",
            size: "small",
            icon: K ? l.createElement(K) : void 0,
            onClick: () => {
              try {
                const c = b();
                c.setSelectedAgent && c.setSelectedAgent(s.id);
              } catch (c) {
                console.warn("[ugsci] Failed to set selected agent:", c);
              }
              O("/chat");
            }
          },
          "开始对话"
        )
      )
    },
    l.createElement(j, {
      items: L,
      defaultActiveKey: "basic"
    })
  );
}
function gt({
  open: e,
  onClose: n,
  onCreated: t
}) {
  const r = b().React, { useState: l } = r, {
    Modal: a,
    Card: o,
    Tag: h,
    Input: I,
    Row: f,
    Col: E,
    Spin: T,
    message: j,
    Typography: C
  } = b().antd, { Text: D } = C, [R, w] = l(!1), [y, H] = l(""), A = Ce.filter((p) => {
    if (!y.trim()) return !0;
    const x = y.toLowerCase();
    return p.name.toLowerCase().includes(x) || p.description.toLowerCase().includes(x) || p.category.toLowerCase().includes(x);
  }), K = async (p) => {
    w(!0);
    try {
      const x = await ne("/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: p.name,
          description: p.description,
          skill_names: p.recommendedSkills
        })
      });
      await Pe(x.id, "AGENTS.md", p.systemPrompt);
      const N = await xe(x.id);
      N.approval_level = p.approvalLevel, await ne(`/agents/${encodeURIComponent(x.id)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(N)
      }), j.success(`专家「${p.name}」创建成功`), n(), t();
    } catch (x) {
      j.error(x.message || "创建专家失败");
    } finally {
      w(!1);
    }
  };
  return r.createElement(
    a,
    {
      open: e,
      onCancel: n,
      footer: null,
      title: "选择专家模板",
      width: 800
    },
    r.createElement(
      "div",
      { style: { marginBottom: 16 } },
      r.createElement(I, {
        placeholder: "搜索模板名称或类别...",
        value: y,
        onChange: (p) => H(p.target.value),
        allowClear: !0
      })
    ),
    R ? r.createElement(
      "div",
      { style: { textAlign: "center", padding: 60 } },
      r.createElement(T, { size: "large" }),
      r.createElement(
        "div",
        { style: { marginTop: 12, color: "#8c8c8c" } },
        "正在创建专家..."
      )
    ) : r.createElement(
      f,
      { gutter: [12, 12] },
      ...A.map(
        (p) => r.createElement(
          E,
          { key: p.id, xs: 24, sm: 12 },
          r.createElement(
            o,
            {
              hoverable: !0,
              size: "small",
              onClick: () => K(p),
              style: { cursor: "pointer", height: "100%" }
            },
            r.createElement(
              "div",
              {
                style: {
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 10,
                  marginBottom: 8
                }
              },
              r.createElement(
                "span",
                { style: { fontSize: 28 } },
                p.emoji
              ),
              r.createElement(
                "div",
                { style: { flex: 1 } },
                r.createElement(
                  D,
                  { strong: !0, style: { fontSize: 15 } },
                  p.name
                ),
                r.createElement(
                  "div",
                  null,
                  r.createElement(
                    h,
                    { color: "blue", style: { fontSize: 10 } },
                    p.category
                  ),
                  p.approvalLevel === "MANUAL" ? r.createElement(
                    h,
                    { color: "orange", style: { fontSize: 10 } },
                    "需审批"
                  ) : null
                )
              )
            ),
            r.createElement(
              "div",
              {
                style: {
                  fontSize: 12,
                  color: "#595959",
                  lineHeight: 1.5
                }
              },
              Ie(p.description, r)
            )
          )
        )
      )
    )
  );
}
function yt({
  agentId: e,
  systemPromptFiles: n,
  onRefresh: t
}) {
  const r = b().React, { useState: l, useEffect: a, useCallback: o } = r, {
    List: h,
    Tag: I,
    Switch: f,
    Button: E,
    Modal: T,
    Input: j,
    Spin: C,
    Empty: D,
    message: R,
    Typography: w
  } = b().antd, { FileTextOutlined: y, PlusOutlined: H, EditOutlined: A, ReloadOutlined: K } = b().antdIcons || {}, { Text: p } = w, [x, N] = l([]), [M, F] = l(!0), [_, G] = l(
    n || []
  ), [Z, g] = l(!1), [s, i] = l(null), [P, V] = l(""), [q, $] = l(""), [O, z] = l(!1), v = o(async () => {
    F(!0);
    try {
      const k = await st(e);
      N(k);
    } catch (k) {
      R.error(k.message || "加载记忆文件失败"), N([]);
    } finally {
      F(!1);
    }
  }, [e]);
  a(() => {
    v();
  }, [v]), a(() => {
    G(n || []);
  }, [n]);
  const U = async (k, S) => {
    const L = new Set(_);
    if (S)
      L.add(k);
    else {
      if (_e.includes(k) && k === "AGENTS.md") {
        R.warning("AGENTS.md 是核心文件，不能停用");
        return;
      }
      L.delete(k);
    }
    const c = Array.from(L);
    G(c);
    try {
      await Re(e, c), R.success(S ? "已启用记忆文件" : "已停用记忆文件"), t();
    } catch (W) {
      R.error(W.message || "更新失败"), G(n || []);
    }
  }, B = async (k) => {
    try {
      const S = await ne(
        `/workspace/files/${encodeURIComponent(k)}`,
        { headers: { "X-Agent-Id": e } }
      );
      i(k), V(S.content || ""), g(!0);
    } catch (S) {
      R.error(S.message || "读取文件失败");
    }
  }, J = () => {
    i(null), V(""), $(""), g(!0);
  }, me = async () => {
    const k = s || q.trim();
    if (!k) {
      R.warning("请输入文件名");
      return;
    }
    const S = k.endsWith(".md") ? k : `${k}.md`;
    z(!0);
    try {
      if (await Pe(e, S, P), !s && !_.includes(S)) {
        const L = [..._, S];
        G(L), await Re(e, L);
      }
      R.success("保存成功"), g(!1), v(), t();
    } catch (L) {
      R.error(L.message || "保存失败");
    } finally {
      z(!1);
    }
  };
  return M ? r.createElement(
    "div",
    { style: { textAlign: "center", padding: 40 } },
    r.createElement(C, { size: "large" })
  ) : r.createElement(
    "div",
    null,
    r.createElement(
      "div",
      {
        style: {
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 12
        }
      },
      r.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        y ? r.createElement(y, {
          style: { fontSize: 14, color: "#1677ff" }
        }) : null,
        r.createElement(
          p,
          { strong: !0 },
          `记忆文件 (${x.length})`
        ),
        r.createElement(
          p,
          { type: "secondary", style: { fontSize: 12 } },
          `· 已挂载 ${_.length} 个到专家记忆`
        )
      ),
      r.createElement(
        "div",
        { style: { display: "flex", gap: 8 } },
        r.createElement(
          E,
          {
            size: "small",
            icon: K ? r.createElement(K) : void 0,
            onClick: v
          },
          "刷新"
        ),
        r.createElement(
          E,
          {
            type: "primary",
            size: "small",
            icon: H ? r.createElement(H) : void 0,
            onClick: J
          },
          "新建记忆文件"
        )
      )
    ),
    x.length === 0 ? r.createElement(D, {
      description: "暂无记忆文件，点击「新建记忆文件」添加",
      image: D.PRESENTED_IMAGE_SIMPLE
    }) : r.createElement(h, {
      dataSource: x,
      renderItem: (k) => {
        const S = _.includes(k.filename), L = _e.includes(k.filename);
        return r.createElement(
          h.Item,
          {
            actions: [
              r.createElement(
                E,
                {
                  type: "link",
                  size: "small",
                  icon: A ? r.createElement(A) : void 0,
                  onClick: () => B(k.filename)
                },
                "编辑"
              )
            ]
          },
          r.createElement(h.Item.Meta, {
            avatar: r.createElement(y, {
              style: {
                fontSize: 20,
                color: S ? "#1677ff" : "#bfbfbf"
              }
            }),
            title: r.createElement(
              "div",
              {
                style: {
                  display: "flex",
                  alignItems: "center",
                  gap: 6
                }
              },
              r.createElement(p, null, k.filename),
              L ? r.createElement(
                I,
                { color: "default", style: { fontSize: 10 } },
                "内置"
              ) : r.createElement(
                I,
                { color: "cyan", style: { fontSize: 10 } },
                "记忆库"
              )
            ),
            description: r.createElement(
              "div",
              { style: { fontSize: 12 } },
              `${(k.size / 1024).toFixed(1)} KB · 修改于 ${new Date(k.modified_time).toLocaleString()}`
            )
          }),
          r.createElement(f, {
            checked: S,
            size: "small",
            onChange: (c) => U(k.filename, c)
          })
        );
      }
    }),
    // Edit/New file modal
    r.createElement(
      T,
      {
        open: Z,
        onCancel: () => g(!1),
        title: s ? `编辑 ${s}` : "新建记忆文件",
        width: 700,
        onOk: me,
        confirmLoading: O,
        okText: "保存"
      },
      s ? null : r.createElement(
        "div",
        { style: { marginBottom: 12 } },
        r.createElement(j, {
          placeholder: "文件名（如：油藏工程记忆库.md）",
          value: q,
          onChange: (k) => $(k.target.value),
          addonAfter: q.endsWith(".md") ? "" : ".md"
        })
      ),
      r.createElement(j.TextArea, {
        value: P,
        onChange: (k) => V(k.target.value),
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
function ft({
  skills: e,
  agentId: n
}) {
  const t = b().React, { useMemo: r } = t, {
    List: l,
    Tag: a,
    Typography: o,
    Empty: h,
    Button: I,
    message: f
  } = b().antd, { ThunderboltOutlined: E, CopyOutlined: T } = b().antdIcons || {}, { Text: j } = o, C = r(() => ot(e), [e]), D = (w) => {
    try {
      const y = b();
      y.setSelectedAgent && y.setSelectedAgent(n);
    } catch {
    }
    try {
      sessionStorage.setItem("ugsci_pending_prompt", w);
    } catch {
    }
    window.history.pushState({}, "", "/chat"), window.dispatchEvent(new PopStateEvent("popstate"));
  }, R = (w) => {
    var y;
    (y = navigator.clipboard) == null || y.writeText(w).then(() => {
      f.success("已复制到剪贴板");
    });
  };
  return C.length === 0 ? t.createElement(h, {
    description: "暂无推荐提问，请先为专家添加技能",
    image: h.PRESENTED_IMAGE_SIMPLE
  }) : t.createElement(
    "div",
    null,
    t.createElement(
      "div",
      {
        style: {
          display: "flex",
          alignItems: "center",
          gap: 6,
          marginBottom: 12
        }
      },
      E ? t.createElement(E, {
        style: { fontSize: 14, color: "#1677ff" }
      }) : null,
      t.createElement(
        j,
        { strong: !0 },
        `推荐提问 (${C.length})`
      ),
      t.createElement(
        j,
        { type: "secondary", style: { fontSize: 12 } },
        "· 从技能描述中自动提取"
      )
    ),
    t.createElement(l, {
      dataSource: C,
      renderItem: (w, y) => t.createElement(
        l.Item,
        {
          actions: [
            t.createElement(
              I,
              {
                type: "link",
                size: "small",
                icon: T ? t.createElement(T) : void 0,
                onClick: () => R(w)
              },
              "复制"
            )
          ]
        },
        t.createElement(l.Item.Meta, {
          avatar: t.createElement(
            a,
            { color: "blue", style: { borderRadius: "50%" } },
            `${y + 1}`
          ),
          title: t.createElement(
            "div",
            {
              style: {
                cursor: "pointer",
                color: "#1677ff"
              },
              onClick: () => D(w)
            },
            w
          ),
          description: t.createElement(
            j,
            { type: "secondary", style: { fontSize: 12 } },
            "点击直接发送给专家"
          )
        })
      )
    })
  );
}
function Et() {
  var le;
  const e = b().React, { useState: n, useEffect: t, useCallback: r, useMemo: l } = e, {
    Spin: a,
    Empty: o,
    Input: h,
    Button: I,
    message: f,
    Row: E,
    Col: T,
    Tabs: j,
    Modal: C,
    Typography: D
  } = b().antd, { ReloadOutlined: R, PlusOutlined: w, SearchOutlined: y, TeamOutlined: H } = b().antdIcons || {}, { Text: A, Paragraph: K } = D, [p, x] = n([]), [N, M] = n(!0), [F, _] = n(!1), [G, Z] = n(null), [g, s] = n(""), [i, P] = n(!1), [V, q] = n("experts"), [$, O] = n(
    null
  ), [z, v] = n(""), [U, B] = n(!1), [J, me] = n([]), k = r(async () => {
    M(!0);
    try {
      const u = await ze(), X = await De().catch(
        () => []
      ), Q = await Promise.all(
        u.map(async (te) => {
          try {
            const [ae, de] = await Promise.all([
              xe(te.id).catch(() => null),
              Qe(te.id).catch(() => [])
            ]), ue = Ze(ae == null ? void 0 : ae.mcp), ge = X.filter(
              (ye) => ue.includes(ye.key) || ue.includes(ye.name)
            );
            return {
              agent: te,
              config: ae,
              skills: de,
              mcps: ge,
              loading: !1
            };
          } catch {
            return {
              agent: te,
              config: null,
              skills: [],
              mcps: [],
              loading: !1
            };
          }
        })
      );
      x(Q), me(u);
    } catch (u) {
      f.error(u.message || "加载专家列表失败"), x([]);
    } finally {
      M(!1);
    }
  }, []);
  t(() => {
    k();
  }, [k]);
  const S = r(
    async (u) => {
      var ae;
      const X = u.coordinatorName || ((ae = u.members[0]) == null ? void 0 : ae.name);
      if (!X) {
        f.error("无法确定协调者专家");
        return;
      }
      const Q = we(J, X);
      if (!Q) {
        f.error(`未找到协调者专家「${X}」，请先创建该专家`);
        return;
      }
      if (/\{.+?\}/.test(u.taskTemplate)) {
        v(""), O(u);
        return;
      }
      await L(u, Q, u.taskTemplate);
    },
    [J, f]
  ), L = r(
    async (u, X, Q) => {
      var te;
      B(!0);
      try {
        const ae = nt(u), de = Q ? ae.replace(u.taskTemplate, Q) : ae, ue = b();
        ue.setSelectedAgent && ue.setSelectedAgent(X), await tt(X, de), f.success(
          `团队任务已发起，协调者：${u.coordinatorName || ((te = u.members[0]) == null ? void 0 : te.name)}`
        ), O(null), c("/chat");
      } catch (ae) {
        f.error(ae.message || "发起团队任务失败");
      } finally {
        B(!1);
      }
    },
    [f]
  ), c = (u) => {
    window.history.pushState({}, "", u), window.dispatchEvent(new PopStateEvent("popstate"));
  }, W = r((u) => {
    Z(u), _(!0);
  }, []), re = l(() => {
    if (!g.trim()) return p;
    const u = g.toLowerCase();
    return p.filter(
      (X) => {
        var Q;
        return X.agent.name.toLowerCase().includes(u) || ((Q = X.agent.description) == null ? void 0 : Q.toLowerCase().includes(u)) || X.agent.id.toLowerCase().includes(u) || X.skills.some((te) => te.name.toLowerCase().includes(u));
      }
    );
  }, [p, g]), pe = p.filter((u) => u.agent.enabled).length, fe = p.reduce(
    (u, X) => u + X.skills.filter((Q) => Q.enabled !== !1).length,
    0
  ), m = p.reduce((u, X) => u + X.mcps.length, 0), ee = [
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
          e.createElement(h, {
            placeholder: "搜索专家名称、描述或技能...",
            prefix: y ? e.createElement(y) : void 0,
            value: g,
            onChange: (u) => s(u.target.value),
            allowClear: !0,
            style: { maxWidth: 400 }
          })
        ),
        // Content
        N ? e.createElement(
          "div",
          { style: { textAlign: "center", padding: 60 } },
          e.createElement(a, { size: "large" })
        ) : re.length === 0 ? e.createElement(o, {
          description: g ? "未找到匹配的专家" : "暂无专家，点击「创建专家」添加"
        }) : e.createElement(
          E,
          { gutter: [12, 12] },
          ...re.map(
            (u) => e.createElement(
              T,
              { key: u.agent.id, xs: 24, sm: 12, md: 8, lg: 6 },
              e.createElement(pt, {
                expert: u,
                onClick: () => W(u)
              })
            )
          )
        )
      )
    },
    {
      key: "teams",
      label: e.createElement("span", null, "🤝 专家团"),
      children: e.createElement(rt, {
        agents: J,
        onLaunch: S
      })
    }
  ];
  return e.createElement(
    "div",
    { style: { padding: 24 } },
    e.createElement(ke, {
      title: "专家中心",
      subtitle: `共 ${p.length} 位专家（${pe} 位启用）· ${fe} 个技能 · ${m} 个 MCP 客户端`,
      extra: e.createElement(
        e.Fragment,
        null,
        e.createElement(
          I,
          {
            icon: R ? e.createElement(R) : void 0,
            onClick: k,
            loading: N
          },
          "刷新"
        ),
        e.createElement(
          I,
          {
            type: "primary",
            icon: w ? e.createElement(w) : void 0,
            onClick: () => P(!0)
          },
          "创建专家"
        )
      )
    }),
    e.createElement(j, {
      items: ee,
      activeKey: V,
      onChange: (u) => q(u)
    }),
    // Drawer
    e.createElement(ut, {
      expert: G,
      open: F,
      onClose: () => _(!1),
      onRefresh: () => k()
    }),
    // Template Modal
    e.createElement(gt, {
      open: i,
      onClose: () => P(!1),
      onCreated: () => k()
    }),
    // Team Launch Modal (for filling placeholders)
    $ ? e.createElement(
      C,
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
        onCancel: () => O(null),
        onOk: () => {
          var te;
          const u = $.coordinatorName || ((te = $.members[0]) == null ? void 0 : te.name), X = u ? we(J, u) : null;
          if (!X) {
            f.error("无法找到协调者专家");
            return;
          }
          let Q = $.taskTemplate;
          z.trim() && (Q = z.trim()), L($, X, Q);
        },
        confirmLoading: U,
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
        e.createElement(h.TextArea, {
          value: z,
          onChange: (u) => v(u.target.value),
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
          `协调者: ${$.coordinatorName || ((le = $.members[0]) == null ? void 0 : le.name) || "—"} · 成员: ${$.members.map((u) => u.name).join("、")}`
        )
      )
    ) : null
  );
}
function ht({
  mcp: e,
  onClick: n
}) {
  const t = b().React, { Card: r, Tag: l, Badge: a, Typography: o } = b().antd, { Text: h } = o, I = {
    stdio: "💻",
    streamable_http: "🌐",
    sse: "📡"
  };
  return t.createElement(
    r,
    {
      hoverable: !0,
      onClick: n,
      size: "small",
      style: {
        cursor: "pointer",
        borderColor: e.enabled ? void 0 : "#d9d9d9",
        opacity: e.enabled ? 1 : 0.7
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
        t.createElement(
          "span",
          { style: { fontSize: 18 } },
          I[e.transport] || "🔌"
        ),
        t.createElement(
          h,
          { strong: !0, style: { fontSize: 14 } },
          e.name || e.key
        )
      ),
      t.createElement(a, {
        status: e.enabled ? "success" : "default",
        text: e.enabled ? "启用" : "停用"
      })
    ),
    e.description ? t.createElement(
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
          overflow: "hidden"
        }
      },
      e.description
    ) : null,
    t.createElement(
      "div",
      { style: { display: "flex", gap: 6, flexWrap: "wrap" } },
      t.createElement(
        l,
        { color: "purple", style: { fontSize: 11 } },
        e.transport
      ),
      e.tools && e.tools.length > 0 ? t.createElement(
        l,
        { color: "blue", style: { fontSize: 11 } },
        `${e.tools.length} 个工具`
      ) : t.createElement(l, { style: { fontSize: 11 } }, "全部工具"),
      e.url ? t.createElement(
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
function vt() {
  const e = b().React, { useState: n, useEffect: t, useCallback: r, useMemo: l } = e, {
    Spin: a,
    Empty: o,
    Input: h,
    Button: I,
    message: f,
    Row: E,
    Col: T,
    Drawer: j,
    Descriptions: C,
    Tag: D,
    Typography: R,
    List: w
  } = b().antd, { ReloadOutlined: y, PlusOutlined: H, SearchOutlined: A, ApiOutlined: K } = b().antdIcons || {}, { Text: p } = R, [x, N] = n([]), [M, F] = n(!0), [_, G] = n(""), [Z, g] = n(!1), [s, i] = n(null), P = r(async () => {
    F(!0);
    try {
      const z = await De();
      N(z);
    } catch (z) {
      f.error(z.message || "加载能力列表失败"), N([]);
    } finally {
      F(!1);
    }
  }, []);
  t(() => {
    P();
  }, [P]);
  const V = l(() => {
    if (!_.trim()) return x;
    const z = _.toLowerCase();
    return x.filter(
      (v) => {
        var U;
        return v.name.toLowerCase().includes(z) || v.key.toLowerCase().includes(z) || ((U = v.description) == null ? void 0 : U.toLowerCase().includes(z)) || v.transport.toLowerCase().includes(z);
      }
    );
  }, [x, _]), q = x.filter((z) => z.enabled).length, $ = x.reduce((z, v) => {
    var U;
    return z + (((U = v.tools) == null ? void 0 : U.length) || 0);
  }, 0), O = (z) => {
    window.history.pushState({}, "", z), window.dispatchEvent(new PopStateEvent("popstate"));
  };
  return e.createElement(
    "div",
    { style: { padding: 24 } },
    e.createElement(ke, {
      title: "能力中心",
      subtitle: `共 ${x.length} 个 MCP 客户端（${q} 个启用）· ${$} 个工具`,
      extra: e.createElement(
        e.Fragment,
        null,
        e.createElement(
          I,
          {
            icon: y ? e.createElement(y) : void 0,
            onClick: P,
            loading: M
          },
          "刷新"
        ),
        e.createElement(
          I,
          {
            type: "primary",
            icon: H ? e.createElement(H) : void 0,
            onClick: () => O("/mcp")
          },
          "管理 MCP"
        )
      )
    }),
    e.createElement(
      "div",
      { style: { marginBottom: 16 } },
      e.createElement(h, {
        placeholder: "搜索能力名称、描述...",
        prefix: A ? e.createElement(A) : void 0,
        value: _,
        onChange: (z) => G(z.target.value),
        allowClear: !0,
        style: { maxWidth: 400 }
      })
    ),
    M ? e.createElement(
      "div",
      { style: { textAlign: "center", padding: 60 } },
      e.createElement(a, { size: "large" })
    ) : V.length === 0 ? e.createElement(o, {
      description: _ ? "未找到匹配的能力" : "暂无 MCP 客户端，点击「管理 MCP」添加"
    }) : e.createElement(
      E,
      { gutter: [12, 12] },
      ...V.map(
        (z) => e.createElement(
          T,
          { key: z.key, xs: 24, sm: 12, md: 8, lg: 6 },
          e.createElement(ht, {
            mcp: z,
            onClick: () => {
              i(z), g(!0);
            }
          })
        )
      )
    ),
    // Detail drawer
    s ? e.createElement(
      j,
      {
        title: e.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 8 } },
          e.createElement("span", { style: { fontSize: 18 } }, "🔌"),
          e.createElement(
            "span",
            null,
            s.name || s.key
          )
        ),
        open: Z,
        onClose: () => g(!1),
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
            s.key
          )
        ),
        e.createElement(
          C.Item,
          { label: "名称" },
          s.name || "-"
        ),
        e.createElement(
          C.Item,
          { label: "描述" },
          s.description || "-"
        ),
        e.createElement(
          C.Item,
          { label: "状态" },
          e.createElement(
            D,
            { color: s.enabled ? "green" : "default" },
            s.enabled ? "启用" : "停用"
          )
        ),
        e.createElement(
          C.Item,
          { label: "传输方式" },
          s.transport
        ),
        s.url ? e.createElement(
          C.Item,
          { label: "URL" },
          s.url
        ) : null,
        s.command ? e.createElement(
          C.Item,
          { label: "命令" },
          e.createElement(
            "code",
            { style: { fontSize: 11 } },
            s.command
          )
        ) : null,
        s.args && s.args.length > 0 ? e.createElement(
          C.Item,
          { label: "参数" },
          s.args.join(" ")
        ) : null
      ),
      s.tools && s.tools.length > 0 ? e.createElement(
        "div",
        { style: { marginTop: 16 } },
        e.createElement(
          p,
          {
            strong: !0,
            style: { display: "block", marginBottom: 8 }
          },
          "提供的工具"
        ),
        e.createElement(w, {
          size: "small",
          dataSource: s.tools,
          renderItem: (z) => e.createElement(
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
              K ? e.createElement(K, {
                style: { fontSize: 12, color: "#1677ff" }
              }) : null,
              e.createElement(
                p,
                { style: { fontSize: 12 } },
                z
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
function St() {
  const e = b().React, { useState: n, useEffect: t, useCallback: r, useMemo: l } = e, {
    Spin: a,
    Empty: o,
    Input: h,
    Button: I,
    message: f,
    Row: E,
    Col: T,
    Card: j,
    Tag: C,
    Typography: D,
    Drawer: R,
    Descriptions: w,
    List: y
  } = b().antd, {
    ReloadOutlined: H,
    SearchOutlined: A,
    DownloadOutlined: K,
    ThunderboltOutlined: p
  } = b().antdIcons || {}, { Text: x, Paragraph: N } = D, [M, F] = n([]), [_, G] = n([]), [Z, g] = n([]), [s, i] = n(!0), [P, V] = n(""), [q, $] = n(!1), [O, z] = n(null), [v, U] = n([]), B = r(async () => {
    i(!0);
    try {
      const [S, L, c] = await Promise.all([
        Ne(),
        ze(),
        Ye()
      ]);
      F(S), g(L), G(c);
    } catch (S) {
      f.error(S.message || "加载技能列表失败"), F([]);
    } finally {
      i(!1);
    }
  }, []);
  t(() => {
    B();
  }, [B]);
  const J = l(() => {
    if (!P.trim()) return M;
    const S = P.toLowerCase();
    return M.filter(
      (L) => {
        var c, W;
        return L.name.toLowerCase().includes(S) || ((c = L.description) == null ? void 0 : c.toLowerCase().includes(S)) || ((W = L.tags) == null ? void 0 : W.some((re) => re.toLowerCase().includes(S)));
      }
    );
  }, [M, P]), me = r(
    (S) => {
      const L = [];
      for (const c of _)
        if (c.skills.some((W) => W.name === S)) {
          const W = Z.find((re) => re.id === c.agent_id);
          L.push((W == null ? void 0 : W.name) || c.agent_name || c.agent_id);
        }
      return L;
    },
    [_, Z]
  ), k = (S) => {
    window.history.pushState({}, "", S), window.dispatchEvent(new PopStateEvent("popstate"));
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
          I,
          {
            icon: H ? e.createElement(H) : void 0,
            onClick: B,
            loading: s
          },
          "刷新"
        ),
        e.createElement(
          I,
          {
            type: "primary",
            icon: K ? e.createElement(K) : void 0,
            onClick: () => k("/skill-pool")
          },
          "管理技能池"
        )
      )
    }),
    e.createElement(
      "div",
      { style: { marginBottom: 16 } },
      e.createElement(h, {
        placeholder: "搜索技能名称、描述或标签...",
        prefix: A ? e.createElement(A) : void 0,
        value: P,
        onChange: (S) => V(S.target.value),
        allowClear: !0,
        style: { maxWidth: 400 }
      })
    ),
    s ? e.createElement(
      "div",
      { style: { textAlign: "center", padding: 60 } },
      e.createElement(a, { size: "large" })
    ) : J.length === 0 ? e.createElement(o, {
      description: P ? "未找到匹配的技能" : "技能池为空"
    }) : e.createElement(
      E,
      { gutter: [12, 12] },
      ...J.map(
        (S) => {
          var L;
          return e.createElement(
            T,
            { key: S.name, xs: 24, sm: 12, md: 8, lg: 6 },
            e.createElement(
              j,
              {
                hoverable: !0,
                size: "small",
                style: { cursor: "pointer", height: "100%" },
                onClick: () => {
                  z(S), U(me(S.name)), $(!0);
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
                S.emoji ? e.createElement(
                  "span",
                  { style: { fontSize: 18 } },
                  S.emoji
                ) : e.createElement(
                  "span",
                  { style: { fontSize: 18 } },
                  "⚡"
                ),
                e.createElement(
                  x,
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
                  S.name
                ),
                S.protected ? e.createElement(
                  C,
                  { color: "gold", style: { fontSize: 10 } },
                  "内置"
                ) : null
              ),
              S.description ? e.createElement(
                N,
                {
                  type: "secondary",
                  style: { fontSize: 11, margin: 0, lineHeight: 1.4 },
                  ellipsis: { rows: 2 }
                },
                S.description
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
                S.version_text ? e.createElement(
                  C,
                  { style: { fontSize: 10 } },
                  `v${S.version_text}`
                ) : null,
                ...(L = S.tags) == null ? void 0 : L.slice(0, 3).map(
                  (c, W) => e.createElement(
                    C,
                    { key: W, color: "cyan", style: { fontSize: 10 } },
                    c
                  )
                )
              )
            )
          );
        }
      )
    ),
    // Skill detail drawer
    O ? e.createElement(
      R,
      {
        title: e.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 8 } },
          e.createElement(
            "span",
            { style: { fontSize: 18 } },
            O.emoji || "⚡"
          ),
          e.createElement("span", null, O.name)
        ),
        open: q,
        onClose: () => $(!1),
        width: 520,
        extra: e.createElement(
          I,
          {
            type: "primary",
            size: "small",
            icon: p ? e.createElement(p) : void 0,
            onClick: () => k("/skills")
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
          O.name
        ),
        e.createElement(
          w.Item,
          { label: "描述" },
          O.description || "-"
        ),
        O.version_text ? e.createElement(
          w.Item,
          { label: "版本" },
          O.version_text
        ) : null,
        e.createElement(
          w.Item,
          { label: "来源" },
          O.source || "-"
        ),
        e.createElement(
          w.Item,
          { label: "受保护" },
          O.protected ? "是（内置）" : "否"
        ),
        O.sync_status ? e.createElement(
          w.Item,
          { label: "同步状态" },
          O.sync_status
        ) : null,
        O.installed_from ? e.createElement(
          w.Item,
          { label: "安装来源" },
          O.installed_from
        ) : null
      ),
      // Tags
      O.tags && O.tags.length > 0 ? e.createElement(
        "div",
        { style: { marginTop: 16 } },
        e.createElement(
          x,
          {
            strong: !0,
            style: { display: "block", marginBottom: 8 }
          },
          "标签"
        ),
        e.createElement(
          "div",
          { style: { display: "flex", flexWrap: "wrap", gap: 4 } },
          ...O.tags.map(
            (S, L) => e.createElement(C, { key: L, color: "cyan" }, S)
          )
        )
      ) : null,
      // Installed agents
      e.createElement(
        "div",
        { style: { marginTop: 16 } },
        e.createElement(
          x,
          { strong: !0, style: { display: "block", marginBottom: 8 } },
          `已安装此技能的专家 (${v.length})`
        ),
        v.length > 0 ? e.createElement(y, {
          size: "small",
          dataSource: v,
          renderItem: (S) => e.createElement(
            y.Item,
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
                x,
                { style: { fontSize: 13 } },
                S
              )
            )
          )
        }) : e.createElement(
          x,
          { type: "secondary", style: { fontSize: 12 } },
          "暂无专家安装此技能"
        )
      )
    ) : null
  );
}
async function bt() {
  return ne("/market/providers");
}
async function wt(e) {
  return ne(
    `/market/categories?lang=${encodeURIComponent(e)}`
  );
}
async function xt(e, n, t, r, l) {
  return ne("/market/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: e,
      provider_pages: n,
      limit: t,
      lang: r,
      category: l || void 0
    })
  });
}
async function kt(e, n, t) {
  return ne("/skills/hub/install/start", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify({
      bundle_url: n,
      enable: t
    })
  });
}
async function Ct(e, n) {
  return ne(
    `/skills/hub/install/status/${encodeURIComponent(n)}`,
    {
      headers: { "X-Agent-Id": e }
    }
  );
}
function Tt() {
  const e = b().React, { useState: n, useEffect: t, useCallback: r, useMemo: l, useRef: a } = e, {
    Spin: o,
    Empty: h,
    Input: I,
    Button: f,
    message: E,
    Row: T,
    Col: j,
    Card: C,
    Tag: D,
    Tooltip: R,
    Typography: w,
    Select: y,
    Drawer: H,
    Descriptions: A,
    Tabs: K,
    Badge: p,
    Progress: x
  } = b().antd, {
    ReloadOutlined: N,
    SearchOutlined: M,
    DownloadOutlined: F,
    AppstoreOutlined: _,
    ShopOutlined: G,
    CheckCircleOutlined: Z,
    LoadingOutlined: g
  } = b().antdIcons || {}, { Text: s, Paragraph: i, Title: P } = w, [V, q] = n("skills"), [$, O] = n([]), [z, v] = n([]), [U, B] = n([]), [J, me] = n(""), [k, S] = n(""), [L, c] = n(!1), [W, re] = n(!1), [pe, fe] = n(
    {}
  ), [m, ee] = n(null), [le, u] = n({}), [X, Q] = n([]), [te, ae] = n(""), [de, ue] = n(""), ge = a(null);
  t(() => {
    Promise.all([
      bt().catch(() => []),
      wt("zh").catch(() => []),
      ze().catch(() => [])
    ]).then(([d, Y, oe]) => {
      O(d), v(Y), Q(oe), oe.length > 0 && ae(oe[0].id);
    });
  }, []);
  const ye = r(
    async (d, Y, oe) => {
      c(!0);
      try {
        const ie = await xt(
          d,
          oe,
          20,
          "zh",
          Y || void 0
        );
        oe === void 0 || Object.keys(oe).length === 0 ? B(ie.results) : B((se) => [...se, ...ie.results]);
        const ve = Object.values(ie.by_provider || {}).some(
          (se) => se.has_more
        );
        re(ve);
        const ce = {};
        for (const [se, Ee] of Object.entries(ie.by_provider || {}))
          ce[se] = (oe[se] || 1) + 1;
        if (fe(ce), ie.errors.length > 0)
          for (const se of ie.errors)
            console.warn(
              `[ugsci] Market provider '${se.provider}' error: ${se.message}`
            );
      } catch (ie) {
        E.error(ie.message || "搜索市场失败"), B([]);
      } finally {
        c(!1);
      }
    },
    []
  );
  t(() => (ge.current && clearTimeout(ge.current), ge.current = setTimeout(() => {
    ye(J, k, {});
  }, 400), () => {
    ge.current && clearTimeout(ge.current);
  }), [J, k, ye]);
  const Ue = () => {
    ye(J, k, pe);
  }, $e = async (d) => {
    var oe;
    if (!te) {
      E.warning("请先选择安装目标专家");
      return;
    }
    const Y = `${d.source}:${d.slug}`;
    try {
      u((ce) => ({ ...ce, [Y]: "starting" }));
      const ie = await kt(
        te,
        d.source_url,
        !0
      );
      u((ce) => ({ ...ce, [Y]: "installing" }));
      const ve = 60;
      for (let ce = 0; ce < ve; ce++) {
        await new Promise((Ee) => setTimeout(Ee, 2e3));
        const se = await Ct(
          te,
          ie.task_id
        );
        if (se.status === "completed" && ((oe = se.result) != null && oe.installed)) {
          E.success(`技能「${se.result.name || d.name}」安装成功`), u((Ee) => {
            const Se = { ...Ee };
            return delete Se[Y], Se;
          });
          return;
        }
        if (se.status === "failed")
          throw new Error(se.error || "安装失败");
        if (se.status === "cancelled") {
          E.info("安装已取消"), u((Ee) => {
            const Se = { ...Ee };
            return delete Se[Y], Se;
          });
          return;
        }
      }
      throw new Error("安装超时");
    } catch (ie) {
      E.error(ie.message || "安装技能失败"), u((ve) => {
        const ce = { ...ve };
        return delete ce[Y], ce;
      });
    }
  }, He = (d) => {
    window.history.pushState({}, "", d), window.dispatchEvent(new PopStateEvent("popstate"));
  }, Me = $.filter((d) => d.available), Ge = e.createElement(
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
      e.createElement(I, {
        placeholder: "搜索技能市场...",
        prefix: M ? e.createElement(M) : void 0,
        value: J,
        onChange: (d) => me(d.target.value),
        allowClear: !0,
        style: { flex: 1, minWidth: 200, maxWidth: 400 }
      }),
      z.length > 0 ? e.createElement(y, {
        value: k || void 0,
        onChange: (d) => S(d || ""),
        placeholder: "全部分类",
        allowClear: !0,
        style: { minWidth: 150 },
        options: [
          { value: "", label: "全部分类" },
          ...z.map((d) => ({ value: d.id, label: d.label }))
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
        e.createElement(y, {
          value: te || void 0,
          onChange: (d) => ae(d),
          style: { minWidth: 140 },
          placeholder: "选择专家",
          options: X.map((d) => ({ value: d.id, label: d.name }))
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
          D,
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
    L && U.length === 0 ? e.createElement(
      "div",
      { style: { textAlign: "center", padding: 60 } },
      e.createElement(o, { size: "large" })
    ) : U.length === 0 ? e.createElement(h, {
      description: J ? `未找到匹配「${J}」的技能` : "输入关键词搜索技能市场",
      image: h.PRESENTED_IMAGE_SIMPLE
    }) : e.createElement(
      T,
      { gutter: [12, 12] },
      ...U.map((d) => {
        const Y = `${d.source}:${d.slug}`, oe = le[Y];
        return e.createElement(
          j,
          { key: Y, xs: 24, sm: 12, md: 8, lg: 6 },
          e.createElement(
            C,
            {
              hoverable: !0,
              size: "small",
              style: { height: "100%", cursor: "pointer" },
              onClick: () => ee(d)
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
                R,
                { title: d.name },
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
                  d.name
                )
              )
            ),
            e.createElement(
              i,
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
                  D,
                  { color: "geekblue", style: { fontSize: 10 } },
                  d.source
                ),
                d.version ? e.createElement(
                  D,
                  { style: { fontSize: 10 } },
                  `v${d.version}`
                ) : null
              ),
              oe ? e.createElement(
                f,
                {
                  size: "small",
                  disabled: !0,
                  icon: g ? e.createElement(g) : void 0
                },
                oe === "starting" ? "启动中" : "安装中"
              ) : e.createElement(
                f,
                {
                  type: "primary",
                  size: "small",
                  icon: F ? e.createElement(F) : void 0,
                  onClick: (ie) => {
                    ie.stopPropagation(), $e(d);
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
    W && !L ? e.createElement(
      "div",
      { style: { textAlign: "center", marginTop: 16 } },
      e.createElement(
        f,
        { onClick: Ue, loading: L },
        "加载更多"
      )
    ) : null,
    // Detail Drawer
    m ? e.createElement(
      H,
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
        onClose: () => ee(null),
        width: 480,
        extra: e.createElement(
          f,
          {
            type: "primary",
            icon: F ? e.createElement(F) : void 0,
            onClick: () => {
              $e(m);
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
          ...Object.entries(m.stats).map(
            ([d, Y]) => e.createElement(
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
                String(Y)
              ),
              e.createElement(
                s,
                { type: "secondary", style: { fontSize: 11 } },
                d
              )
            )
          )
        )
      ) : null
    ) : null
  ), Ve = l(() => {
    if (!de.trim()) return Ce;
    const d = de.toLowerCase();
    return Ce.filter(
      (Y) => Y.name.toLowerCase().includes(d) || Y.description.toLowerCase().includes(d) || Y.category.toLowerCase().includes(d)
    );
  }, [de]), Je = async (d) => {
    try {
      const Y = await ne("/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: d.name,
          description: d.description,
          skill_names: d.recommendedSkills
        })
      });
      await Pe(Y.id, "AGENTS.md", d.systemPrompt);
      const oe = await xe(Y.id);
      oe.approval_level = d.approvalLevel, await ne(`/agents/${encodeURIComponent(Y.id)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(oe)
      }), E.success(`专家「${d.name}」创建成功，已跳转至专家中心`), He("/ugsci-experts");
    } catch (Y) {
      E.error(Y.message || "创建专家失败");
    }
  }, Ke = e.createElement(
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
    e.createElement(I, {
      placeholder: "搜索专家模板...",
      prefix: M ? e.createElement(M) : void 0,
      value: de,
      onChange: (d) => ue(d.target.value),
      allowClear: !0,
      style: { marginBottom: 16, maxWidth: 400 }
    }),
    e.createElement(
      T,
      { gutter: [12, 12] },
      ...Ve.map(
        (d) => e.createElement(
          j,
          { key: d.id, xs: 24, sm: 12, md: 8 },
          e.createElement(
            C,
            {
              hoverable: !0,
              size: "small",
              style: { height: "100%", cursor: "pointer" },
              onClick: () => Je(d)
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
                  s,
                  { strong: !0, style: { fontSize: 14 } },
                  d.name
                ),
                e.createElement(
                  "div",
                  { style: { display: "flex", gap: 4, marginTop: 4 } },
                  e.createElement(
                    D,
                    { color: "blue", style: { fontSize: 10 } },
                    d.category
                  ),
                  d.approvalLevel === "MANUAL" ? e.createElement(
                    D,
                    { color: "orange", style: { fontSize: 10 } },
                    "需审批"
                  ) : e.createElement(
                    D,
                    { color: "green", style: { fontSize: 10 } },
                    "自动"
                  )
                )
              )
            ),
            e.createElement(
              i,
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
                s,
                { type: "secondary", style: { fontSize: 11 } },
                `推荐 ${d.recommendedSkills.length} 个技能`
              ),
              e.createElement(
                f,
                {
                  type: "primary",
                  size: "small",
                  icon: _ ? e.createElement(_) : void 0
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
      G ? e.createElement(G, {
        style: { fontSize: 24, color: "#bfbfbf", marginBottom: 8 }
      }) : null,
      e.createElement(
        s,
        { type: "secondary", style: { fontSize: 12 } },
        "更多专家模板持续更新中，未来将支持 OpenScience、RPA 等行业扩展"
      )
    )
  ), Xe = [
    {
      key: "skills",
      label: e.createElement(
        "span",
        null,
        _ ? e.createElement(_) : null,
        " 技能市场"
      ),
      children: Ge
    },
    {
      key: "experts",
      label: e.createElement("span", null, "🧑‍🔬 专家模板"),
      children: Ke
    }
  ];
  return e.createElement(
    "div",
    { style: { padding: 24 } },
    e.createElement(ke, {
      title: "市场",
      subtitle: "浏览技能市场 · 选择专家模板 · 随时更新能力和专家",
      extra: e.createElement(
        f,
        {
          icon: N ? e.createElement(N) : void 0,
          onClick: () => ye(J, k, {}),
          loading: L
        },
        "刷新"
      )
    }),
    e.createElement(K, {
      items: Xe,
      activeKey: V,
      onChange: (d) => q(d)
    })
  );
}
function zt() {
  var l;
  const e = window.QwenPaw;
  if (!(e != null && e.menu) || !(e != null && e.route)) {
    console.warn(
      "[ugsci] QwenPaw.menu/route API not available — plugin disabled"
    );
    return;
  }
  const n = b().React, t = "ugsci";
  e.route.add(t, {
    id: "ugsci.experts",
    path: "/ugsci-experts",
    component: Et
  }), e.menu.add(t, {
    id: "ugsci.experts",
    location: "primary.agentScoped",
    label: () => "专家中心",
    icon: n.createElement("span", { style: { fontSize: 16 } }, "🧑‍🔬"),
    route: "ugsci.experts",
    order: 5,
    visible: () => he()
  }), e.route.add(t, {
    id: "ugsci.capabilities",
    path: "/ugsci-capabilities",
    component: vt
  }), e.menu.add(t, {
    id: "ugsci.capabilities",
    location: "primary.agentScoped",
    label: () => "能力中心",
    icon: n.createElement("span", { style: { fontSize: 16 } }, "🔌"),
    route: "ugsci.capabilities",
    order: 6,
    visible: () => he()
  }), e.route.add(t, {
    id: "ugsci.skills-center",
    path: "/ugsci-skills",
    component: St
  }), e.menu.add(t, {
    id: "ugsci.skills-center",
    location: "primary.agentScoped",
    label: () => "技能中心",
    icon: n.createElement("span", { style: { fontSize: 16 } }, "⚡"),
    route: "ugsci.skills-center",
    order: 7,
    visible: () => he()
  }), e.route.add(t, {
    id: "ugsci.market",
    path: "/ugsci-market",
    component: Tt
  }), e.menu.add(t, {
    id: "ugsci.market",
    location: "primary.agentScoped",
    label: () => "市场",
    icon: n.createElement("span", { style: { fontSize: 16 } }, "🏪"),
    route: "ugsci.market",
    order: 8,
    visible: () => he()
  }), (l = e.sidebar) != null && l.registerSimpleModeItems ? (e.sidebar.registerSimpleModeItems([
    "ugsci.experts",
    "ugsci.capabilities",
    "ugsci.skills-center",
    "ugsci.market"
  ]), console.info("[ugsci] Registered 4 items for simple-mode visibility")) : console.warn(
    "[ugsci] window.QwenPaw.sidebar.registerSimpleModeItems not available — items will not appear in simple mode"
  );
  const r = [
    "core.skills",
    "core.tools",
    "core.mcp",
    "core.acp",
    "core.agent-config",
    "core.agent-stats",
    "core.skill-pool"
  ];
  for (const a of r) {
    try {
      const h = e.menu.snapshot("primary.agentScoped").find((I) => I.id === a);
      h && e.menu.replace(t, a, {
        ...h,
        visible: () => !he()
      });
    } catch {
    }
    try {
      const h = e.menu.snapshot("primary.settings").find((I) => I.id === a);
      h && e.menu.replace(t, a, {
        ...h,
        visible: () => !he()
      });
    } catch {
    }
  }
  console.info(
    "[ugsci] Plugin registered: 4 routes + menu items, simple-mode whitelist + simplified navigation active"
  );
}
function Te() {
  try {
    zt();
  } catch (e) {
    console.error("[ugsci] Failed to build plugin:", e), setTimeout(Te, 500);
  }
}
var Ae;
if ((Ae = window.QwenPaw) != null && Ae.host)
  Te();
else {
  const e = setInterval(() => {
    var n;
    (n = window.QwenPaw) != null && n.host && (clearInterval(e), Te());
  }, 200);
  setTimeout(() => clearInterval(e), 1e4);
}
