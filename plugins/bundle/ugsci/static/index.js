function f() {
  var n;
  const e = (n = window.QwenPaw) == null ? void 0 : n.host;
  if (!e) throw new Error("[ugsci] QwenPaw.host not available");
  return e;
}
function qe() {
  try {
    return f().getApiToken() || "";
  } catch {
    return "";
  }
}
function je(e) {
  return f().getApiUrl(e);
}
function De(e) {
  const n = qe();
  return {
    "Content-Type": "application/json",
    ...n ? { Authorization: `Bearer ${n}` } : {},
    ...e
  };
}
async function te(e, n) {
  const r = await fetch(je(e), {
    ...n,
    headers: { ...De(), ...(n == null ? void 0 : n.headers) || {} }
  });
  if (!r.ok) {
    const t = await r.text().catch(() => "");
    throw new Error(t || `HTTP ${r.status}`);
  }
  return r.status === 204 ? null : r.json();
}
async function Ie() {
  const e = await te("/agents");
  return (e == null ? void 0 : e.agents) || [];
}
async function ke(e) {
  return te(`/agents/${encodeURIComponent(e)}`);
}
async function Qe(e) {
  return await te("/skills", {
    headers: { "X-Agent-Id": e }
  }) || [];
}
async function Ne() {
  return await te("/skills/pool") || [];
}
async function Ye() {
  return await te("/skills/workspaces") || [];
}
async function Fe() {
  return await te("/mcp") || [];
}
function Ze(e) {
  if (!e || typeof e != "object") return [];
  const n = e, r = n.mcpServers || n;
  return !r || typeof r != "object" ? [] : Object.keys(r).filter((t) => t !== "mcpServers");
}
function Ee() {
  try {
    return localStorage.getItem("qwenpaw_sidebar_mode") === "simple";
  } catch {
    return !1;
  }
}
function Pe(e, n) {
  const r = f();
  return r.ReactMarkdown && r.remarkGfm ? n.createElement(
    r.ReactMarkdown,
    { remarkPlugins: [r.remarkGfm] },
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
], We = "ugsci_custom_teams";
function we() {
  try {
    const e = localStorage.getItem(We);
    return e ? JSON.parse(e) : [];
  } catch {
    return [];
  }
}
function Ue(e) {
  try {
    localStorage.setItem(We, JSON.stringify(e));
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
  const r = {
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
  await fetch(je("/console/chat"), {
    method: "POST",
    headers: {
      ...De(),
      "X-Agent-Id": e
    },
    body: JSON.stringify(r)
  });
}
function xe(e, n) {
  const r = e.find(
    (l) => l.name === n || l.name === n.replace(/\s+/g, "")
  );
  if (r) return r.id;
  const t = e.find(
    (l) => l.name.includes(n) || n.includes(l.name) || l.name.replace(/\s+/g, "").includes(n.replace(/\s+/g, ""))
  );
  return t ? t.id : null;
}
function nt(e) {
  var r;
  const n = e.members.map((t) => `- ${t.emoji} ${t.name}（${t.role}）`).join(`
`);
  if (e.custom && e.steps && e.steps.length > 0) {
    const t = e.steps.map((a, o) => {
      const E = a.passContext ? "（传递上一步的结果作为上下文）" : "（独立执行，不传递上下文）";
      return `${o + 1}. 向「${a.agentName}」发送请求：${a.instruction} ${E}`;
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
  const n = f().React, { Typography: r, Tag: t } = f().antd, { Text: l } = r, a = {
    pipeline: "→",
    roundtable: "⇄",
    coordinator: "⊙"
  }, o = {
    pipeline: "#13c2c2",
    roundtable: "#722ed1",
    coordinator: "#1677ff"
  }, E = e.steps || [], I = E.length > 0;
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
      ...I ? E.map((w, y) => {
        const C = e.members.find(
          ($) => $.name === w.agentName
        );
        return [
          y > 0 && e.mode !== "roundtable" ? n.createElement(
            "div",
            {
              key: `arrow-${y}`,
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
              key: `step-${y}`,
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
              (C == null ? void 0 : C.emoji) || "👤"
            ),
            n.createElement(
              "div",
              null,
              n.createElement(
                l,
                { strong: !0, style: { fontSize: 12 } },
                w.agentName
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
                w.instruction
              ),
              w.passContext ? n.createElement(
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
      }).flat() : e.members.map((w, y) => [
        y > 0 && e.mode !== "roundtable" ? n.createElement(
          "div",
          {
            key: `arrow-${y}`,
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
            key: `member-${y}`,
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
          n.createElement("span", { style: { fontSize: 16 } }, w.emoji),
          n.createElement(
            "div",
            null,
            n.createElement(
              l,
              { strong: !0, style: { fontSize: 12 } },
              w.name
            ),
            n.createElement(
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
function at({
  open: e,
  onClose: n,
  agents: r,
  editingTeam: t,
  onSaved: l
}) {
  const a = f().React, { useState: o, useEffect: E, useCallback: I } = a, {
    Modal: w,
    Input: y,
    Button: C,
    Select: $,
    Tag: T,
    Typography: W,
    Switch: B,
    Empty: v,
    message: S,
    Divider: U,
    Steps: O
  } = f().antd, { PlusOutlined: D, DeleteOutlined: p, SaveOutlined: x, ArrowRightOutlined: F } = f().antdIcons || {}, { Text: R, Paragraph: H } = W, [A, J] = o(""), [Z, u] = o("🤝"), [s, c] = o(""), [P, K] = o(
    "pipeline"
  ), [q, M] = o(""), [_, z] = o(""), [h, V] = o([]), [j, X] = o([]), [de, k] = o(!1);
  E(() => {
    e && (t ? (J(t.name), u(t.emoji), c(t.description), K(t.mode), M(t.coordinatorName || ""), z(t.taskTemplate), V(t.steps || []), X(t.members.map((m) => m.name))) : (J(""), u("🤝"), c(""), K("pipeline"), M(""), z(`请执行以下任务：
任务描述：{任务描述}`), V([]), X([])));
  }, [e, t]);
  const b = I(() => {
    if (P === "roundtable") {
      const m = j.map((ee) => ({
        agentName: ee,
        instruction: "请给出你的专业评估意见",
        passContext: !1
      }));
      V(m);
    } else if (P === "pipeline") {
      const m = new Map(h.map((ne) => [ne.agentName, ne])), ee = j.map((ne) => m.get(ne) || {
        agentName: ne,
        instruction: "请完成你的专业部分",
        passContext: !0
      });
      V(ee);
    }
  }, [P, j, h]), L = (m) => {
    j.includes(m) || (X([...j, m]), P === "coordinator" && !q && M(m));
  }, i = (m) => {
    X(j.filter((ee) => ee !== m)), V(h.filter((ee) => ee.agentName !== m)), q === m && M(j[0] || "");
  }, G = (m, ee, ne) => {
    const re = [...h];
    re[m] = { ...re[m], [ee]: ne }, V(re);
  }, se = () => {
    if (!A.trim()) {
      S.warning("请输入团队名称");
      return;
    }
    if (j.length < 2) {
      S.warning("至少需要选择 2 个成员");
      return;
    }
    if (!_.trim()) {
      S.warning("请输入任务模板");
      return;
    }
    if (P === "coordinator" && !q) {
      S.warning("请选择协调者");
      return;
    }
    k(!0);
    try {
      const m = j.map(
        (N) => {
          var le;
          const Q = r.find((ae) => ae.name === N);
          return {
            name: N,
            role: ((le = Q == null ? void 0 : Q.description) == null ? void 0 : le.slice(0, 30)) || "团队成员",
            emoji: "👤"
          };
        }
      );
      let ee = h;
      (h.length === 0 || h.length !== j.length) && (ee = j.map((N) => ({
        agentName: N,
        instruction: "请完成你的专业部分",
        passContext: P === "pipeline"
      })));
      const ne = {
        id: (t == null ? void 0 : t.id) || `custom-${Date.now()}`,
        name: A.trim(),
        emoji: Z,
        category: "自定义",
        description: s.trim() || `${A.trim()}（${j.length}人团队）`,
        mode: P,
        members: m,
        coordinatorName: P === "coordinator" ? q : void 0,
        taskTemplate: _.trim(),
        orchestrationPrompt: "",
        // Custom teams use steps-based instructions
        steps: ee,
        custom: !0,
        createdAt: (t == null ? void 0 : t.createdAt) || Date.now()
      }, re = we(), g = re.findIndex((N) => N.id === ne.id);
      g >= 0 ? re[g] = ne : re.push(ne), Ue(re), S.success(t ? "团队已更新" : "团队已创建"), l(), n();
    } catch (m) {
      S.error(m.message || "保存失败");
    } finally {
      k(!1);
    }
  }, ue = [
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
  ], ge = r.filter(
    (m) => !j.includes(m.name)
  );
  return a.createElement(
    w,
    {
      open: e,
      onCancel: n,
      title: a.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 8 } },
        a.createElement(
          "span",
          { style: { fontSize: 20 } },
          t ? "✏️" : "➕"
        ),
        a.createElement(
          "span",
          null,
          t ? "编辑专家团" : "创建专家团"
        )
      ),
      width: 720,
      onOk: se,
      okText: "保存团队",
      confirmLoading: de,
      okButtonProps: {
        icon: x ? a.createElement(x) : void 0
      }
    },
    // Step 1: Basic info
    a.createElement(
      "div",
      { style: { marginBottom: 16 } },
      a.createElement(
        R,
        {
          strong: !0,
          style: { display: "block", marginBottom: 8, fontSize: 13 }
        },
        "1. 基本信息"
      ),
      a.createElement(
        "div",
        { style: { display: "flex", gap: 8, marginBottom: 8 } },
        a.createElement($, {
          value: Z,
          onChange: (m) => u(m),
          style: { width: 60 },
          options: ue.map((m) => ({ value: m, label: m })),
          optionRender: (m) => a.createElement("span", { style: { fontSize: 18 } }, m.value)
        }),
        a.createElement(y, {
          placeholder: "团队名称（如：储层评价团队）",
          value: A,
          onChange: (m) => J(m.target.value),
          style: { flex: 1 }
        })
      ),
      a.createElement(y.TextArea, {
        placeholder: "团队描述（简述团队的目标和适用场景）",
        value: s,
        onChange: (m) => c(m.target.value),
        rows: 2,
        style: { marginBottom: 8 }
      }),
      a.createElement(
        "div",
        { style: { display: "flex", gap: 8, alignItems: "center" } },
        a.createElement(
          R,
          { type: "secondary", style: { fontSize: 12 } },
          "协同模式："
        ),
        a.createElement($, {
          value: P,
          onChange: (m) => K(m),
          style: { width: 160 },
          options: [
            { value: "pipeline", label: "🔄 流水线（依次执行）" },
            { value: "roundtable", label: "🔀 圆桌讨论（独立评估）" },
            { value: "coordinator", label: "🎯 协调者（由协调者主导）" }
          ]
        })
      )
    ),
    a.createElement(U, { style: { margin: "12px 0" } }),
    // Step 2: Select members
    a.createElement(
      "div",
      { style: { marginBottom: 16 } },
      a.createElement(
        R,
        {
          strong: !0,
          style: { display: "block", marginBottom: 8, fontSize: 13 }
        },
        "2. 选择团队成员"
      ),
      // Available agents
      ge.length > 0 ? a.createElement(
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
        ...ge.map(
          (m) => a.createElement(
            C,
            {
              key: m.id,
              size: "small",
              icon: D ? a.createElement(D) : void 0,
              onClick: () => L(m.name)
            },
            m.name
          )
        )
      ) : null,
      // Selected members
      j.length === 0 ? a.createElement(v, {
        description: "请从上方添加团队成员",
        image: v.PRESENTED_IMAGE_SIMPLE
      }) : a.createElement(
        "div",
        { style: { display: "flex", flexDirection: "column", gap: 4 } },
        ...j.map(
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
                R,
                { strong: !0, style: { fontSize: 13 } },
                m
              ),
              P === "coordinator" && q === m ? a.createElement(
                T,
                { color: "blue", style: { fontSize: 10 } },
                "协调者"
              ) : null
            ),
            a.createElement(
              "div",
              { style: { display: "flex", gap: 4 } },
              P === "coordinator" ? a.createElement(
                C,
                {
                  size: "small",
                  type: "link",
                  onClick: () => M(m)
                },
                "设为协调者"
              ) : null,
              a.createElement(
                C,
                {
                  size: "small",
                  type: "link",
                  danger: !0,
                  icon: p ? a.createElement(p) : void 0,
                  onClick: () => i(m)
                },
                "移除"
              )
            )
          )
        )
      )
    ),
    a.createElement(U, { style: { margin: "12px 0" } }),
    // Step 3: Define execution steps (for pipeline/roundtable)
    j.length > 0 ? a.createElement(
      "div",
      { style: { marginBottom: 16 } },
      a.createElement(
        R,
        {
          strong: !0,
          style: { display: "block", marginBottom: 8, fontSize: 13 }
        },
        `3. 编排执行步骤${P === "roundtable" ? "（各步独立执行）" : P === "pipeline" ? "（依次执行，可传递上下文）" : "（由协调者决定调用顺序）"}`
      ),
      // Auto-sync button
      a.createElement(
        C,
        {
          size: "small",
          type: "dashed",
          onClick: b,
          style: { marginBottom: 8 }
        },
        "自动生成步骤"
      ),
      // Steps list
      h.length === 0 ? a.createElement(
        R,
        { type: "secondary", style: { fontSize: 12 } },
        "点击「自动生成步骤」或手动配置每步的指令"
      ) : a.createElement(
        "div",
        { style: { display: "flex", flexDirection: "column", gap: 6 } },
        ...h.map(
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
                T,
                { color: "blue", style: { fontSize: 11 } },
                m.agentName
              ),
              a.createElement(
                "div",
                { style: { flex: 1 } },
                a.createElement(y, {
                  placeholder: "请输入该步骤的指令...",
                  value: m.instruction,
                  onChange: (ne) => G(ee, "instruction", ne.target.value),
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
              a.createElement(B, {
                size: "small",
                checked: m.passContext,
                onChange: (ne) => G(ee, "passContext", ne)
              }),
              a.createElement(
                R,
                { type: "secondary", style: { fontSize: 11 } },
                m.passContext ? "传递上一步结果作为上下文" : "独立执行"
              )
            )
          )
        )
      )
    ) : null,
    a.createElement(U, { style: { margin: "12px 0" } }),
    // Step 4: Task template
    a.createElement(
      "div",
      null,
      a.createElement(
        R,
        {
          strong: !0,
          style: { display: "block", marginBottom: 8, fontSize: 13 }
        },
        `${j.length > 0 ? "4" : "3"}. 任务模板`
      ),
      a.createElement(y.TextArea, {
        placeholder: `输入任务模板，可用 {参数名} 作为占位符...

例如：
请对区块 {区块名} 的井 {井号} 进行储层评价`,
        value: _,
        onChange: (m) => z(m.target.value),
        rows: 4,
        style: { fontFamily: "monospace", fontSize: 13 }
      }),
      a.createElement(
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
function Re({
  team: e,
  agents: n,
  onLaunch: r,
  onEdit: t,
  onDelete: l
}) {
  var s;
  const a = f().React, { useState: o } = a, { Card: E, Tag: I, Typography: w, Button: y, Tooltip: C } = f().antd, {
    TeamOutlined: $,
    RocketOutlined: T,
    UserOutlined: W,
    EditOutlined: B,
    DeleteOutlined: v,
    DownOutlined: S,
    UpOutlined: U
  } = f().antdIcons || {}, { Text: O, Paragraph: D } = w, [p, x] = o(!1), F = {
    coordinator: { label: "协调者模式", color: "blue" },
    pipeline: { label: "流水线模式", color: "cyan" },
    roundtable: { label: "圆桌讨论", color: "purple" }
  }, R = F[e.mode] || F.coordinator, H = e.members.map((c) => {
    const P = xe(n, c.name);
    return { ...c, found: !!P, agentId: P };
  }), A = H.filter((c) => c.found).length, J = A === e.members.length, Z = e.coordinatorName || ((s = e.members[0]) == null ? void 0 : s.name), u = Z ? xe(n, Z) : null;
  return a.createElement(
    E,
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
            O,
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
            { color: R.color, style: { fontSize: 10 } },
            R.label
          ),
          a.createElement(
            I,
            { style: { fontSize: 10 } },
            `${A}/${e.members.length}`
          ),
          J ? null : a.createElement(
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
        t ? a.createElement(
          C,
          { title: "编辑" },
          a.createElement(y, {
            type: "text",
            size: "small",
            icon: B ? a.createElement(B) : void 0,
            onClick: (c) => {
              c.stopPropagation(), t(e);
            }
          })
        ) : null,
        l ? a.createElement(
          C,
          { title: "删除" },
          a.createElement(y, {
            type: "text",
            size: "small",
            danger: !0,
            icon: v ? a.createElement(v) : void 0,
            onClick: (c) => {
              c.stopPropagation(), l(e);
            }
          })
        ) : null
      ) : null
    ),
    // Description
    a.createElement(
      D,
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
      ...H.map(
        (c) => a.createElement(
          C,
          {
            key: c.name,
            title: `${c.name}（${c.role}）${c.found ? "" : " - 未创建"}`
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
                background: c.found ? "#f0f5ff" : "#fff2f0",
                border: `1px solid ${c.found ? "#d6e4ff" : "#ffccc7"}`,
                fontSize: 11
              }
            },
            a.createElement("span", null, c.emoji),
            a.createElement(
              O,
              {
                style: { fontSize: 11, color: c.found ? "#1f4e8c" : "#cf1322" }
              },
              c.name
            )
          )
        )
      )
    ),
    // Toggle flow diagram
    a.createElement(
      y,
      {
        type: "link",
        size: "small",
        style: { padding: "0 0 4px 0", fontSize: 11, height: "auto" },
        onClick: (c) => {
          c.stopPropagation(), x(!p);
        },
        icon: p ? U ? a.createElement(U) : "▲" : S ? a.createElement(S) : "▼"
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
        O,
        { type: "secondary", style: { fontSize: 11 } },
        Z ? `协调者: ${Z}` : ""
      ),
      a.createElement(
        y,
        {
          type: "primary",
          size: "small",
          icon: T ? a.createElement(T) : void 0,
          disabled: !u,
          onClick: () => r(e)
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
  const r = f().React, { useMemo: t, useState: l, useCallback: a, useEffect: o } = r, {
    Row: E,
    Col: I,
    Input: w,
    Empty: y,
    Typography: C,
    Tag: $,
    Button: T,
    Divider: W,
    message: B,
    Popconfirm: v
  } = f().antd, { SearchOutlined: S, TeamOutlined: U, PlusOutlined: O, RocketOutlined: D } = f().antdIcons || {}, { Text: p } = C, [x, F] = l(""), [R, H] = l([]), [A, J] = l(!1), [Z, u] = l(null);
  o(() => {
    H(we());
  }, []);
  const s = a(() => {
    H(we());
  }, []), c = a(
    (h) => {
      const j = we().filter((X) => X.id !== h.id);
      Ue(j), H(j), B.success(`团队「${h.name}」已删除`);
    },
    [B]
  ), P = a((h) => {
    u(h), J(!0);
  }, []), K = a(() => {
    u(null), J(!0);
  }, []), q = t(() => [...R, ...et], [R]), M = t(() => {
    if (!x.trim()) return q;
    const h = x.toLowerCase();
    return q.filter(
      (V) => V.name.toLowerCase().includes(h) || V.description.toLowerCase().includes(h) || V.category.toLowerCase().includes(h)
    );
  }, [q, x]), _ = M.filter((h) => h.custom), z = M.filter((h) => !h.custom);
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
        p,
        { style: { fontSize: 13, color: "#389e0d" } },
        "多智能体协同 — 选择预设团队或创建自定义团队，支持流水线、圆桌讨论、协调者三种编排模式。"
      ),
      r.createElement(
        T,
        {
          type: "primary",
          size: "small",
          icon: O ? r.createElement(O) : void 0,
          onClick: K
        },
        "创建专家团"
      )
    ),
    // Search
    r.createElement(w, {
      placeholder: "搜索团队名称、描述或类别...",
      prefix: S ? r.createElement(S) : void 0,
      value: x,
      onChange: (h) => F(h.target.value),
      allowClear: !0,
      style: { marginBottom: 16, maxWidth: 400 }
    }),
    // Custom teams section
    _.length > 0 ? r.createElement(
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
          p,
          { strong: !0, style: { fontSize: 14 } },
          `自定义团队 (${_.length})`
        )
      ),
      r.createElement(
        E,
        { gutter: [12, 12] },
        ..._.map(
          (h) => r.createElement(
            I,
            { key: h.id, xs: 24, sm: 12, md: 8 },
            r.createElement(Re, {
              team: h,
              agents: e,
              onLaunch: n,
              onEdit: P,
              onDelete: c
            })
          )
        )
      ),
      r.createElement(W, { style: { margin: "16px 0" } })
    ) : null,
    // Preset teams section
    z.length > 0 ? r.createElement(
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
          p,
          { strong: !0, style: { fontSize: 14 } },
          `预设团队 (${z.length})`
        ),
        r.createElement(
          p,
          { type: "secondary", style: { fontSize: 12 } },
          "· 行业典型工作流模板"
        )
      ),
      r.createElement(
        E,
        { gutter: [12, 12] },
        ...z.map(
          (h) => r.createElement(
            I,
            { key: h.id, xs: 24, sm: 12, md: 8 },
            r.createElement(Re, {
              team: h,
              agents: e,
              onLaunch: n
            })
          )
        )
      )
    ) : null,
    // Empty state
    M.length === 0 ? r.createElement(y, {
      description: "未找到匹配的专家团队，点击「创建专家团」自定义",
      image: y.PRESENTED_IMAGE_SIMPLE
    }) : null,
    // Team Builder Modal
    r.createElement(at, {
      open: A,
      onClose: () => {
        J(!1), u(null);
      },
      agents: e,
      editingTeam: Z,
      onSaved: s
    })
  );
}
function ot(e) {
  var r;
  const n = [];
  for (const t of e) {
    if (t.enabled === !1) continue;
    const l = (r = t.description) == null ? void 0 : r.trim();
    if (!l) continue;
    let a = l;
    if (a = a.replace(/\*\*(.+?)\*\*/g, "$1").replace(/\*(.+?)\*/g, "$1").replace(/`(.+?)`/g, "$1").replace(/^#+\s*/gm, "").trim(), /^(用于|帮助|提供|支持|实现|完成|分析|计算|生成|创建|检查)/.test(a) ? a = `请${a}` : /^(a |an |the )/i.test(a) ? a = `Help me with ${a}` : /[。？！.?!]$/.test(a) || (a = `帮我${a}`), a.length > 80 && (a = a.substring(0, 77) + "..."), n.push(a), n.length >= 4) break;
  }
  return n;
}
async function st(e) {
  return await te("/workspace/files", {
    headers: { "X-Agent-Id": e }
  }) || [];
}
async function $e(e, n, r) {
  await te(`/workspace/files/${encodeURIComponent(n)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify({ content: r })
  });
}
async function _e(e, n) {
  const r = await ke(e);
  r.system_prompt_files = n, await te(`/agents/${encodeURIComponent(e)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(r)
  });
}
async function it(e, n) {
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
async function ct(e, n) {
  await te(`/skills/${encodeURIComponent(n)}`, {
    method: "DELETE",
    headers: { "X-Agent-Id": e }
  });
}
async function mt(e, n) {
  await te(`/mcp/${encodeURIComponent(n)}`, {
    method: "DELETE",
    headers: { "X-Agent-Id": e }
  });
}
const Ae = ["AGENTS.md", "SOUL.md", "PROFILE.md"];
function Ce({
  title: e,
  subtitle: n,
  extra: r
}) {
  const t = f().React, { Space: l } = f().antd;
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
    r ? t.createElement(l, null, r) : null
  );
}
function Le({
  items: e,
  max: n = 5,
  color: r = "blue",
  emptyText: t = "无"
}) {
  const l = f().React, { Tag: a } = f().antd;
  return !e || e.length === 0 ? l.createElement(
    "span",
    { style: { fontSize: 12, color: "#bfbfbf" } },
    t
  ) : l.createElement(
    "div",
    { style: { display: "flex", flexWrap: "wrap", gap: 4 } },
    ...e.slice(0, n).map(
      (o, E) => l.createElement(
        a,
        { key: E, color: r, style: { fontSize: 11, marginRight: 0 } },
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
  poolSkills: r,
  installedSkillNames: t,
  loading: l,
  onInstall: a
}) {
  const o = f().React, { useState: E, useEffect: I, useMemo: w } = o, { Modal: y, Button: C, Empty: $, Spin: T, Input: W, Tag: B, Tooltip: v, Typography: S } = f().antd, { CheckOutlined: U, SearchOutlined: O } = f().antdIcons || {}, { Text: D } = S, [p, x] = E([]), [F, R] = E("");
  I(() => {
    e && (x([]), R(""));
  }, [e]);
  const H = w(() => {
    if (!F.trim()) return r;
    const u = F.toLowerCase();
    return r.filter(
      (s) => {
        var c, P;
        return s.name.toLowerCase().includes(u) || ((c = s.description) == null ? void 0 : c.toLowerCase().includes(u)) || ((P = s.tags) == null ? void 0 : P.some((K) => K.toLowerCase().includes(u)));
      }
    );
  }, [r, F]), A = H.filter(
    (u) => !t.includes(u.name)
  ), J = (u) => {
    x(
      (s) => s.includes(u) ? s.filter((c) => c !== u) : [...s, u]
    );
  }, Z = async () => {
    p.length !== 0 && (await a(p), x([]));
  };
  return o.createElement(
    y,
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
          D,
          { type: "secondary", style: { fontSize: 13 } },
          `已选择 ${p.length} 个技能`
        ),
        o.createElement(
          "div",
          { style: { display: "flex", gap: 8 } },
          o.createElement(C, { onClick: n }, "取消"),
          o.createElement(
            C,
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
      o.createElement(W, {
        placeholder: "搜索技能名称、描述或标签...",
        prefix: O ? o.createElement(O) : void 0,
        value: F,
        onChange: (u) => R(u.target.value),
        allowClear: !0,
        style: { flex: 1 }
      }),
      o.createElement(
        C,
        {
          size: "small",
          type: "primary",
          onClick: () => x(A.map((u) => u.name))
        },
        "全选"
      ),
      o.createElement(
        C,
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
      o.createElement(T, { size: "large" })
    ) : H.length === 0 ? o.createElement($, {
      description: F ? "未找到匹配的技能" : "技能池暂无可用技能",
      image: $.PRESENTED_IMAGE_SIMPLE
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
      ...H.map((u) => {
        const s = p.includes(u.name), c = t.includes(u.name);
        return o.createElement(
          "div",
          {
            key: u.name,
            onClick: () => !c && J(u.name),
            style: {
              position: "relative",
              padding: "10px 12px",
              border: `1px solid ${s ? "#0072f5" : "#e8e8e8"}`,
              borderRadius: 6,
              cursor: c ? "not-allowed" : "pointer",
              transition: "all 0.15s ease",
              background: s ? "rgba(0, 114, 245, 0.06)" : c ? "#fafafa" : "#fff",
              opacity: c ? 0.5 : 1,
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
            U ? o.createElement(U) : "✓"
          ) : null,
          c ? o.createElement(
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
                paddingRight: c || s ? 24 : 0
              }
            },
            o.createElement(
              "span",
              { style: { fontSize: 16 } },
              u.emoji || "⚡"
            ),
            o.createElement(
              v,
              { title: u.name },
              o.createElement(
                D,
                {
                  strong: !0,
                  style: {
                    fontSize: 13,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap"
                  }
                },
                u.name
              )
            )
          ),
          u.description ? o.createElement(
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
            u.description
          ) : null,
          u.tags && u.tags.length > 0 ? o.createElement(
            "div",
            {
              style: {
                marginTop: 4,
                display: "flex",
                gap: 2,
                flexWrap: "wrap"
              }
            },
            ...u.tags.slice(0, 2).map(
              (P, K) => o.createElement(
                B,
                {
                  key: K,
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
  onClick: n,
  onSummon: r
}) {
  const t = f().React, { Card: l, Tag: a, Badge: o, Typography: E, Spin: I, Button: w } = f().antd, { Text: y } = E, { ThunderboltOutlined: C } = f().antdIcons || {}, { agent: $, skills: T, mcps: W, loading: B } = e, v = $.enabled, S = T.filter((D) => D.enabled !== !1).map((D) => D.name), U = W.map((D) => D.name || D.key), O = $.active_model ? `${$.active_model.provider_id}/${$.active_model.model}` : null;
  return t.createElement(
    l,
    {
      hoverable: !0,
      onClick: n,
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
            y,
            { strong: !0, style: { fontSize: 15 } },
            $.name
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
            $.id
          )
        )
      ),
      t.createElement(o, {
        status: v ? "success" : "default",
        text: v ? "启用" : "停用"
      })
    ),
    // Description (rendered as markdown)
    $.description ? t.createElement(
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
      Pe($.description, t)
    ) : t.createElement(
      "div",
      { style: { fontSize: 12, color: "#bfbfbf", marginBottom: 10, minHeight: 54, flex: "1 0 auto" } },
      "暂无描述"
    ),
    // Model info
    O ? t.createElement(
      "div",
      { style: { marginBottom: 8 } },
      t.createElement(
        a,
        { color: "geekblue", style: { fontSize: 11 } },
        `🤖 ${O}`
      )
    ) : null,
    // Skills
    B ? t.createElement(I, { size: "small" }) : t.createElement(
      "div",
      { style: { marginBottom: 6 } },
      t.createElement(
        "div",
        { style: { fontSize: 11, color: "#8c8c8c", marginBottom: 4 } },
        `技能 (${S.length})`
      ),
      t.createElement(Le, {
        items: S,
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
      t.createElement(Le, {
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
        w,
        {
          type: "primary",
          size: "small",
          icon: C ? t.createElement(C) : void 0,
          disabled: !v,
          onClick: (D) => {
            D.stopPropagation(), r && r();
          }
        },
        "召唤专家"
      )
    )
  );
}
function ut({
  expert: e,
  open: n,
  onClose: r,
  onRefresh: t
}) {
  const l = f().React, {
    Drawer: a,
    Descriptions: o,
    Tag: E,
    Typography: I,
    Space: w,
    Button: y,
    Empty: C,
    Tabs: $,
    List: T,
    Spin: W,
    Modal: B,
    message: v
  } = f().antd, { Text: S, Paragraph: U } = I, {
    EditOutlined: O,
    ThunderboltOutlined: D,
    FileTextOutlined: p,
    ToolOutlined: x,
    PlusOutlined: F
  } = f().antdIcons || {}, [R, H] = l.useState(!1), [A, J] = l.useState(
    []
  ), [Z, u] = l.useState(!1);
  if (!e) return null;
  const { agent: s, config: c, skills: P, mcps: K, loading: q } = e, M = P.filter((i) => i.enabled !== !1), _ = (i) => {
    window.history.pushState({}, "", i), window.dispatchEvent(new PopStateEvent("popstate"));
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
          E,
          { color: s.enabled ? "green" : "default" },
          s.enabled ? "启用" : "停用"
        )
      ),
      l.createElement(
        o.Item,
        { label: "功能简介" },
        s.description ? Pe(s.description, l) : "暂无描述"
      ),
      l.createElement(
        o.Item,
        { label: "使用模型" },
        s.active_model ? `${s.active_model.provider_id} / ${s.active_model.model}` : "使用全局默认模型"
      ),
      c != null && c.workspace_dir ? l.createElement(
        o.Item,
        { label: "工作区路径" },
        l.createElement(
          "code",
          { style: { fontSize: 11 } },
          c.workspace_dir
        )
      ) : null,
      c != null && c.approval_level ? l.createElement(
        o.Item,
        { label: "审批级别" },
        c.approval_level
      ) : null
    ),
    // System prompt files
    c != null && c.system_prompt_files && c.system_prompt_files.length > 0 ? l.createElement(
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
        l.createElement(S, { strong: !0 }, "系统提示词文件")
      ),
      l.createElement(
        w,
        { wrap: !0 },
        ...c.system_prompt_files.map(
          (i, G) => l.createElement(
            E,
            {
              key: G,
              icon: p ? l.createElement(p) : void 0,
              style: { fontSize: 12 }
            },
            i
          )
        )
      )
    ) : null
  ), h = async () => {
    H(!0), u(!0);
    try {
      const i = await Ne();
      J(i);
    } catch (i) {
      v.error(i.message || "加载技能池失败");
    } finally {
      u(!1);
    }
  }, V = async (i) => {
    let G = 0, se = 0;
    for (const ue of i)
      try {
        await it(s.id, ue), G++;
      } catch {
        se++;
      }
    G > 0 ? (v.success(
      `成功添加 ${G} 个技能${se > 0 ? `，${se} 个失败` : ""}`
    ), t()) : se > 0 && v.error("添加技能失败"), H(!1);
  }, j = async (i) => {
    try {
      await ct(s.id, i), v.success(`技能「${i}」已移除`), t();
    } catch (G) {
      v.error(G.message || "移除技能失败");
    }
  }, X = async (i) => {
    try {
      await mt(s.id, i), v.success(`MCP「${i}」已移除`), t();
    } catch (G) {
      v.error(G.message || "移除 MCP 失败");
    }
  }, de = q ? l.createElement(
    "div",
    { style: { textAlign: "center", padding: 40 } },
    l.createElement(W, { size: "large" })
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
        S,
        { strong: !0 },
        `已启用技能 (${M.length})`
      ),
      l.createElement(
        y,
        {
          type: "primary",
          size: "small",
          icon: F ? l.createElement(F) : void 0,
          onClick: h
        },
        "从技能池添加"
      )
    ),
    M.length === 0 ? l.createElement(C, {
      description: "该专家暂无已启用的技能",
      image: C.PRESENTED_IMAGE_SIMPLE
    }) : l.createElement(T, {
      dataSource: M,
      renderItem: (i) => l.createElement(
        T.Item,
        {
          actions: [
            l.createElement(
              y,
              {
                type: "link",
                size: "small",
                danger: !0,
                onClick: () => j(i.name)
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
            i.emoji ? l.createElement(
              "span",
              { style: { fontSize: 16 } },
              i.emoji
            ) : null,
            l.createElement(S, { strong: !0 }, i.name),
            i.version_text ? l.createElement(
              E,
              { style: { fontSize: 10 } },
              `v${i.version_text}`
            ) : null
          ),
          i.description ? l.createElement(
            U,
            {
              type: "secondary",
              style: { fontSize: 12, margin: 0 },
              ellipsis: { rows: 2 }
            },
            i.description
          ) : null,
          i.tags && i.tags.length > 0 ? l.createElement(
            "div",
            { style: { marginTop: 4 } },
            ...i.tags.map(
              (G, se) => l.createElement(
                E,
                {
                  key: se,
                  color: "cyan",
                  style: { fontSize: 10 }
                },
                G
              )
            )
          ) : null
        )
      )
    }),
    // Skill Picker Modal (card-grid style, consistent with Skill Center)
    l.createElement(dt, {
      open: R,
      onClose: () => H(!1),
      poolSkills: A,
      installedSkillNames: M.map((i) => i.name),
      loading: Z,
      onInstall: V
    })
  ), k = q ? l.createElement(
    "div",
    { style: { textAlign: "center", padding: 40 } },
    l.createElement(W, { size: "large" })
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
        S,
        { strong: !0 },
        `MCP 客户端 (${K.length})`
      ),
      l.createElement(
        y,
        {
          type: "primary",
          size: "small",
          icon: F ? l.createElement(F) : void 0,
          onClick: () => {
            window.history.pushState({}, "", `/agents/${s.id}/mcp`), window.dispatchEvent(new PopStateEvent("popstate"));
          }
        },
        "配置 MCP"
      )
    ),
    K.length === 0 ? l.createElement(C, {
      description: "该专家暂无关联的 MCP 客户端，点击「配置 MCP」添加",
      image: C.PRESENTED_IMAGE_SIMPLE
    }) : l.createElement(T, {
      dataSource: K,
      renderItem: (i) => l.createElement(
        T.Item,
        {
          actions: [
            l.createElement(
              y,
              {
                type: "link",
                size: "small",
                danger: !0,
                onClick: () => X(i.key)
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
              S,
              { strong: !0 },
              i.name || i.key
            ),
            l.createElement(
              E,
              {
                color: i.enabled ? "green" : "default",
                style: { fontSize: 10 }
              },
              i.enabled ? "启用" : "停用"
            ),
            l.createElement(
              E,
              { color: "purple", style: { fontSize: 10 } },
              i.transport
            )
          ),
          i.description ? l.createElement(
            U,
            {
              type: "secondary",
              style: { fontSize: 12, margin: 0 },
              ellipsis: { rows: 2 }
            },
            i.description
          ) : null,
          i.tools && i.tools.length > 0 ? l.createElement(
            "div",
            {
              style: {
                marginTop: 4,
                fontSize: 11,
                color: "#8c8c8c"
              }
            },
            `提供 ${i.tools.length} 个工具`
          ) : null
        )
      )
    })
  ), b = c != null && c.tools ? l.createElement(
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
        l.createElement(S, { strong: !0 }, "工具配置")
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
        JSON.stringify(c.tools, null, 2)
      )
    )
  ) : l.createElement(C, {
    description: "暂无工具配置",
    image: C.PRESENTED_IMAGE_SIMPLE
  }), L = [
    { key: "basic", label: "基本信息", children: z },
    {
      key: "skills",
      label: `技能 (${M.length})`,
      children: de
    },
    {
      key: "prompts",
      label: "推荐提问",
      children: l.createElement(ft, {
        skills: M,
        agentId: s.id
      })
    },
    {
      key: "knowledge",
      label: "专家记忆",
      children: l.createElement(yt, {
        agentId: s.id,
        systemPromptFiles: (c == null ? void 0 : c.system_prompt_files) || [],
        onRefresh: () => t()
      })
    },
    { key: "mcp", label: `MCP (${K.length})`, children: k },
    { key: "tools", label: "工具配置", children: b }
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
      onClose: r,
      width: 560,
      extra: l.createElement(
        w,
        null,
        l.createElement(
          y,
          {
            size: "small",
            icon: O ? l.createElement(O) : void 0,
            onClick: () => _("/agents")
          },
          "编辑专家"
        ),
        l.createElement(
          y,
          {
            type: "primary",
            size: "small",
            icon: D ? l.createElement(D) : void 0,
            onClick: () => {
              try {
                const i = f();
                i.setSelectedAgent && i.setSelectedAgent(s.id);
              } catch (i) {
                console.warn("[ugsci] Failed to set selected agent:", i);
              }
              _("/chat");
            }
          },
          "开始对话"
        )
      )
    },
    l.createElement($, {
      items: L,
      defaultActiveKey: "basic"
    })
  );
}
function gt({
  open: e,
  onClose: n,
  onCreated: r
}) {
  const t = f().React, { useState: l } = t, {
    Modal: a,
    Card: o,
    Tag: E,
    Input: I,
    Row: w,
    Col: y,
    Spin: C,
    message: $,
    Typography: T
  } = f().antd, { Text: W } = T, [B, v] = l(!1), [S, U] = l(""), O = Te.filter((p) => {
    if (!S.trim()) return !0;
    const x = S.toLowerCase();
    return p.name.toLowerCase().includes(x) || p.description.toLowerCase().includes(x) || p.category.toLowerCase().includes(x);
  }), D = async (p) => {
    v(!0);
    try {
      const x = await te("/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: p.name,
          description: p.description,
          skill_names: p.recommendedSkills
        })
      });
      await $e(x.id, "AGENTS.md", p.systemPrompt);
      const F = await ke(x.id);
      F.approval_level = p.approvalLevel, await te(`/agents/${encodeURIComponent(x.id)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(F)
      }), $.success(`专家「${p.name}」创建成功`), n(), r();
    } catch (x) {
      $.error(x.message || "创建专家失败");
    } finally {
      v(!1);
    }
  };
  return t.createElement(
    a,
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
      t.createElement(I, {
        placeholder: "搜索模板名称或类别...",
        value: S,
        onChange: (p) => U(p.target.value),
        allowClear: !0
      })
    ),
    B ? t.createElement(
      "div",
      { style: { textAlign: "center", padding: 60 } },
      t.createElement(C, { size: "large" }),
      t.createElement(
        "div",
        { style: { marginTop: 12, color: "#8c8c8c" } },
        "正在创建专家..."
      )
    ) : t.createElement(
      w,
      { gutter: [12, 12] },
      ...O.map(
        (p) => t.createElement(
          y,
          { key: p.id, xs: 24, sm: 12 },
          t.createElement(
            o,
            {
              hoverable: !0,
              size: "small",
              onClick: () => D(p),
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
                  W,
                  { strong: !0, style: { fontSize: 15 } },
                  p.name
                ),
                t.createElement(
                  "div",
                  null,
                  t.createElement(
                    E,
                    { color: "blue", style: { fontSize: 10 } },
                    p.category
                  ),
                  p.approvalLevel === "MANUAL" ? t.createElement(
                    E,
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
              Pe(p.description, t)
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
  onRefresh: r
}) {
  const t = f().React, { useState: l, useEffect: a, useCallback: o } = t, {
    List: E,
    Tag: I,
    Switch: w,
    Button: y,
    Modal: C,
    Input: $,
    Spin: T,
    Empty: W,
    message: B,
    Typography: v
  } = f().antd, { FileTextOutlined: S, PlusOutlined: U, EditOutlined: O, ReloadOutlined: D } = f().antdIcons || {}, { Text: p } = v, [x, F] = l([]), [R, H] = l(!0), [A, J] = l(
    n || []
  ), [Z, u] = l(!1), [s, c] = l(null), [P, K] = l(""), [q, M] = l(""), [_, z] = l(!1), h = o(async () => {
    H(!0);
    try {
      const k = await st(e);
      F(k);
    } catch (k) {
      B.error(k.message || "加载记忆文件失败"), F([]);
    } finally {
      H(!1);
    }
  }, [e]);
  a(() => {
    h();
  }, [h]), a(() => {
    J(n || []);
  }, [n]);
  const V = async (k, b) => {
    const L = new Set(A);
    if (b)
      L.add(k);
    else {
      if (Ae.includes(k) && k === "AGENTS.md") {
        B.warning("AGENTS.md 是核心文件，不能停用");
        return;
      }
      L.delete(k);
    }
    const i = Array.from(L);
    J(i);
    try {
      await _e(e, i), B.success(b ? "已启用记忆文件" : "已停用记忆文件"), r();
    } catch (G) {
      B.error(G.message || "更新失败"), J(n || []);
    }
  }, j = async (k) => {
    try {
      const b = await te(
        `/workspace/files/${encodeURIComponent(k)}`,
        { headers: { "X-Agent-Id": e } }
      );
      c(k), K(b.content || ""), u(!0);
    } catch (b) {
      B.error(b.message || "读取文件失败");
    }
  }, X = () => {
    c(null), K(""), M(""), u(!0);
  }, de = async () => {
    const k = s || q.trim();
    if (!k) {
      B.warning("请输入文件名");
      return;
    }
    const b = k.endsWith(".md") ? k : `${k}.md`;
    z(!0);
    try {
      if (await $e(e, b, P), !s && !A.includes(b)) {
        const L = [...A, b];
        J(L), await _e(e, L);
      }
      B.success("保存成功"), u(!1), h(), r();
    } catch (L) {
      B.error(L.message || "保存失败");
    } finally {
      z(!1);
    }
  };
  return R ? t.createElement(
    "div",
    { style: { textAlign: "center", padding: 40 } },
    t.createElement(T, { size: "large" })
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
        S ? t.createElement(S, {
          style: { fontSize: 14, color: "#1677ff" }
        }) : null,
        t.createElement(
          p,
          { strong: !0 },
          `记忆文件 (${x.length})`
        ),
        t.createElement(
          p,
          { type: "secondary", style: { fontSize: 12 } },
          `· 已挂载 ${A.length} 个到专家记忆`
        )
      ),
      t.createElement(
        "div",
        { style: { display: "flex", gap: 8 } },
        t.createElement(
          y,
          {
            size: "small",
            icon: D ? t.createElement(D) : void 0,
            onClick: h
          },
          "刷新"
        ),
        t.createElement(
          y,
          {
            type: "primary",
            size: "small",
            icon: U ? t.createElement(U) : void 0,
            onClick: X
          },
          "新建记忆文件"
        )
      )
    ),
    x.length === 0 ? t.createElement(W, {
      description: "暂无记忆文件，点击「新建记忆文件」添加",
      image: W.PRESENTED_IMAGE_SIMPLE
    }) : t.createElement(E, {
      dataSource: x,
      renderItem: (k) => {
        const b = A.includes(k.filename), L = Ae.includes(k.filename);
        return t.createElement(
          E.Item,
          {
            actions: [
              t.createElement(
                y,
                {
                  type: "link",
                  size: "small",
                  icon: O ? t.createElement(O) : void 0,
                  onClick: () => j(k.filename)
                },
                "编辑"
              )
            ]
          },
          t.createElement(E.Item.Meta, {
            avatar: t.createElement(S, {
              style: {
                fontSize: 20,
                color: b ? "#1677ff" : "#bfbfbf"
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
              t.createElement(p, null, k.filename),
              L ? t.createElement(
                I,
                { color: "default", style: { fontSize: 10 } },
                "内置"
              ) : t.createElement(
                I,
                { color: "cyan", style: { fontSize: 10 } },
                "记忆库"
              )
            ),
            description: t.createElement(
              "div",
              { style: { fontSize: 12 } },
              `${(k.size / 1024).toFixed(1)} KB · 修改于 ${new Date(k.modified_time).toLocaleString()}`
            )
          }),
          t.createElement(w, {
            checked: b,
            size: "small",
            onChange: (i) => V(k.filename, i)
          })
        );
      }
    }),
    // Edit/New file modal
    t.createElement(
      C,
      {
        open: Z,
        onCancel: () => u(!1),
        title: s ? `编辑 ${s}` : "新建记忆文件",
        width: 700,
        onOk: de,
        confirmLoading: _,
        okText: "保存"
      },
      s ? null : t.createElement(
        "div",
        { style: { marginBottom: 12 } },
        t.createElement($, {
          placeholder: "文件名（如：油藏工程记忆库.md）",
          value: q,
          onChange: (k) => M(k.target.value),
          addonAfter: q.endsWith(".md") ? "" : ".md"
        })
      ),
      t.createElement($.TextArea, {
        value: P,
        onChange: (k) => K(k.target.value),
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
  const r = f().React, { useMemo: t } = r, {
    List: l,
    Tag: a,
    Typography: o,
    Empty: E,
    Button: I,
    message: w
  } = f().antd, { ThunderboltOutlined: y, CopyOutlined: C } = f().antdIcons || {}, { Text: $ } = o, T = t(() => ot(e), [e]), W = (v) => {
    try {
      const S = f();
      S.setSelectedAgent && S.setSelectedAgent(n);
    } catch {
    }
    try {
      sessionStorage.setItem("ugsci_pending_prompt", v);
    } catch {
    }
    window.history.pushState({}, "", "/chat"), window.dispatchEvent(new PopStateEvent("popstate"));
  }, B = (v) => {
    var S;
    (S = navigator.clipboard) == null || S.writeText(v).then(() => {
      w.success("已复制到剪贴板");
    });
  };
  return T.length === 0 ? r.createElement(E, {
    description: "暂无推荐提问，请先为专家添加技能",
    image: E.PRESENTED_IMAGE_SIMPLE
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
      y ? r.createElement(y, {
        style: { fontSize: 14, color: "#1677ff" }
      }) : null,
      r.createElement(
        $,
        { strong: !0 },
        `推荐提问 (${T.length})`
      ),
      r.createElement(
        $,
        { type: "secondary", style: { fontSize: 12 } },
        "· 从技能描述中自动提取"
      )
    ),
    r.createElement(l, {
      dataSource: T,
      renderItem: (v, S) => r.createElement(
        l.Item,
        {
          actions: [
            r.createElement(
              I,
              {
                type: "link",
                size: "small",
                icon: C ? r.createElement(C) : void 0,
                onClick: () => B(v)
              },
              "复制"
            )
          ]
        },
        r.createElement(l.Item.Meta, {
          avatar: r.createElement(
            a,
            { color: "blue", style: { borderRadius: "50%" } },
            `${S + 1}`
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
            $,
            { type: "secondary", style: { fontSize: 12 } },
            "点击直接发送给专家"
          )
        })
      )
    })
  );
}
function Et() {
  var re;
  const e = f().React, { useState: n, useEffect: r, useCallback: t, useMemo: l } = e, {
    Spin: a,
    Empty: o,
    Input: E,
    Button: I,
    message: w,
    Row: y,
    Col: C,
    Tabs: $,
    Modal: T,
    Typography: W
  } = f().antd, { ReloadOutlined: B, PlusOutlined: v, SearchOutlined: S, TeamOutlined: U } = f().antdIcons || {}, { Text: O, Paragraph: D } = W, [p, x] = n([]), [F, R] = n(!0), [H, A] = n(!1), [J, Z] = n(null), [u, s] = n(""), [c, P] = n(!1), [K, q] = n("experts"), [M, _] = n(
    null
  ), [z, h] = n(""), [V, j] = n(!1), [X, de] = n([]), k = t(async () => {
    R(!0);
    try {
      const g = await Ie(), N = await Fe().catch(
        () => []
      ), Q = await Promise.all(
        g.map(async (le) => {
          try {
            const [ae, he] = await Promise.all([
              ke(le.id).catch(() => null),
              Qe(le.id).catch(() => [])
            ]), pe = Ze(ae == null ? void 0 : ae.mcp), ye = N.filter(
              (be) => pe.includes(be.key) || pe.includes(be.name)
            );
            return {
              agent: le,
              config: ae,
              skills: he,
              mcps: ye,
              loading: !1
            };
          } catch {
            return {
              agent: le,
              config: null,
              skills: [],
              mcps: [],
              loading: !1
            };
          }
        })
      );
      x(Q), de(g);
    } catch (g) {
      w.error(g.message || "加载专家列表失败"), x([]);
    } finally {
      R(!1);
    }
  }, []);
  r(() => {
    k();
  }, [k]);
  const b = t(
    async (g) => {
      var ae;
      const N = g.coordinatorName || ((ae = g.members[0]) == null ? void 0 : ae.name);
      if (!N) {
        w.error("无法确定协调者专家");
        return;
      }
      const Q = xe(X, N);
      if (!Q) {
        w.error(`未找到协调者专家「${N}」，请先创建该专家`);
        return;
      }
      if (/\{.+?\}/.test(g.taskTemplate)) {
        h(""), _(g);
        return;
      }
      await L(g, Q, g.taskTemplate);
    },
    [X, w]
  ), L = t(
    async (g, N, Q) => {
      var le;
      j(!0);
      try {
        const ae = nt(g), he = Q ? ae.replace(g.taskTemplate, Q) : ae, pe = f();
        pe.setSelectedAgent && pe.setSelectedAgent(N), await tt(N, he), w.success(
          `团队任务已发起，协调者：${g.coordinatorName || ((le = g.members[0]) == null ? void 0 : le.name)}`
        ), _(null), i("/chat");
      } catch (ae) {
        w.error(ae.message || "发起团队任务失败");
      } finally {
        j(!1);
      }
    },
    [w]
  ), i = (g) => {
    window.history.pushState({}, "", g), window.dispatchEvent(new PopStateEvent("popstate"));
  }, G = t((g) => {
    Z(g), A(!0);
  }, []), se = t(
    (g) => {
      if (!g.agent.enabled) {
        w.warning(`专家「${g.agent.name}」未启用，请先启用`);
        return;
      }
      try {
        const N = f();
        N.setSelectedAgent && N.setSelectedAgent(g.agent.id);
      } catch (N) {
        console.warn("[ugsci] Failed to set selected agent:", N);
      }
      w.success(`已召唤专家「${g.agent.name}」，正在跳转至对话...`), i("/chat");
    },
    [w]
  ), ue = l(() => {
    if (!u.trim()) return p;
    const g = u.toLowerCase();
    return p.filter(
      (N) => {
        var Q;
        return N.agent.name.toLowerCase().includes(g) || ((Q = N.agent.description) == null ? void 0 : Q.toLowerCase().includes(g)) || N.agent.id.toLowerCase().includes(g) || N.skills.some((le) => le.name.toLowerCase().includes(g));
      }
    );
  }, [p, u]), ge = p.filter((g) => g.agent.enabled).length, m = p.reduce(
    (g, N) => g + N.skills.filter((Q) => Q.enabled !== !1).length,
    0
  ), ee = p.reduce((g, N) => g + N.mcps.length, 0), ne = [
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
          e.createElement(E, {
            placeholder: "搜索专家名称、描述或技能...",
            prefix: S ? e.createElement(S) : void 0,
            value: u,
            onChange: (g) => s(g.target.value),
            allowClear: !0,
            style: { maxWidth: 400 }
          })
        ),
        // Content
        F ? e.createElement(
          "div",
          { style: { textAlign: "center", padding: 60 } },
          e.createElement(a, { size: "large" })
        ) : ue.length === 0 ? e.createElement(o, {
          description: u ? "未找到匹配的专家" : "暂无专家，点击「创建专家」添加"
        }) : e.createElement(
          y,
          { gutter: [12, 12], align: "stretch" },
          ...ue.map(
            (g) => e.createElement(
              C,
              {
                key: g.agent.id,
                xs: 24,
                sm: 12,
                md: 8,
                lg: 6,
                style: { display: "flex" }
              },
              e.createElement(pt, {
                expert: g,
                onClick: () => G(g),
                onSummon: () => se(g)
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
        agents: X,
        onLaunch: b
      })
    }
  ];
  return e.createElement(
    "div",
    { style: { padding: 24 } },
    e.createElement(Ce, {
      title: "专家中心",
      subtitle: `共 ${p.length} 位专家（${ge} 位启用）· ${m} 个技能 · ${ee} 个 MCP 客户端`,
      extra: e.createElement(
        e.Fragment,
        null,
        e.createElement(
          I,
          {
            icon: B ? e.createElement(B) : void 0,
            onClick: k,
            loading: F
          },
          "刷新"
        ),
        e.createElement(
          I,
          {
            type: "primary",
            icon: v ? e.createElement(v) : void 0,
            onClick: () => P(!0)
          },
          "创建专家"
        )
      )
    }),
    e.createElement($, {
      items: ne,
      activeKey: K,
      onChange: (g) => q(g)
    }),
    // Drawer
    e.createElement(ut, {
      expert: J,
      open: H,
      onClose: () => A(!1),
      onRefresh: () => k()
    }),
    // Template Modal
    e.createElement(gt, {
      open: c,
      onClose: () => P(!1),
      onCreated: () => k()
    }),
    // Team Launch Modal (for filling placeholders)
    M ? e.createElement(
      T,
      {
        open: !0,
        title: e.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 8 } },
          e.createElement(
            "span",
            { style: { fontSize: 20 } },
            M.emoji
          ),
          e.createElement(
            "span",
            null,
            `发起团队任务 - ${M.name}`
          )
        ),
        onCancel: () => _(null),
        onOk: () => {
          var le;
          const g = M.coordinatorName || ((le = M.members[0]) == null ? void 0 : le.name), N = g ? xe(X, g) : null;
          if (!N) {
            w.error("无法找到协调者专家");
            return;
          }
          let Q = M.taskTemplate;
          z.trim() && (Q = z.trim()), L(M, N, Q);
        },
        confirmLoading: V,
        okText: "发起任务",
        width: 600
      },
      e.createElement(
        "div",
        { style: { marginBottom: 12 } },
        e.createElement(
          O,
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
          M.taskTemplate
        )
      ),
      e.createElement(
        "div",
        null,
        e.createElement(
          O,
          {
            type: "secondary",
            style: { fontSize: 12, display: "block", marginBottom: 8 }
          },
          "输入具体任务描述（替换上面的占位符内容）："
        ),
        e.createElement(E.TextArea, {
          value: z,
          onChange: (g) => h(g.target.value),
          rows: 5,
          placeholder: M.taskTemplate,
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
          O,
          { style: { fontSize: 12, color: "#0958d9" } },
          `协调者: ${M.coordinatorName || ((re = M.members[0]) == null ? void 0 : re.name) || "—"} · 成员: ${M.members.map((g) => g.name).join("、")}`
        )
      )
    ) : null
  );
}
function ht({
  mcp: e,
  onClick: n
}) {
  const r = f().React, { Card: t, Tag: l, Badge: a, Typography: o } = f().antd, { Text: E } = o, I = {
    stdio: "💻",
    streamable_http: "🌐",
    sse: "📡"
  };
  return r.createElement(
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
          I[e.transport] || "🔌"
        ),
        r.createElement(
          E,
          { strong: !0, style: { fontSize: 14 } },
          e.name || e.key
        )
      ),
      r.createElement(a, {
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
        l,
        { color: "purple", style: { fontSize: 11 } },
        e.transport
      ),
      e.tools && e.tools.length > 0 ? r.createElement(
        l,
        { color: "blue", style: { fontSize: 11 } },
        `${e.tools.length} 个工具`
      ) : r.createElement(l, { style: { fontSize: 11 } }, "全部工具"),
      e.url ? r.createElement(
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
  const e = f().React, { useState: n, useEffect: r, useCallback: t, useMemo: l } = e, {
    Spin: a,
    Empty: o,
    Input: E,
    Button: I,
    message: w,
    Row: y,
    Col: C,
    Drawer: $,
    Descriptions: T,
    Tag: W,
    Typography: B,
    List: v
  } = f().antd, { ReloadOutlined: S, PlusOutlined: U, SearchOutlined: O, ApiOutlined: D } = f().antdIcons || {}, { Text: p } = B, [x, F] = n([]), [R, H] = n(!0), [A, J] = n(""), [Z, u] = n(!1), [s, c] = n(null), P = t(async () => {
    H(!0);
    try {
      const z = await Fe();
      F(z);
    } catch (z) {
      w.error(z.message || "加载能力列表失败"), F([]);
    } finally {
      H(!1);
    }
  }, []);
  r(() => {
    P();
  }, [P]);
  const K = l(() => {
    if (!A.trim()) return x;
    const z = A.toLowerCase();
    return x.filter(
      (h) => {
        var V;
        return h.name.toLowerCase().includes(z) || h.key.toLowerCase().includes(z) || ((V = h.description) == null ? void 0 : V.toLowerCase().includes(z)) || h.transport.toLowerCase().includes(z);
      }
    );
  }, [x, A]), q = x.filter((z) => z.enabled).length, M = x.reduce((z, h) => {
    var V;
    return z + (((V = h.tools) == null ? void 0 : V.length) || 0);
  }, 0), _ = (z) => {
    window.history.pushState({}, "", z), window.dispatchEvent(new PopStateEvent("popstate"));
  };
  return e.createElement(
    "div",
    { style: { padding: 24 } },
    e.createElement(Ce, {
      title: "能力中心",
      subtitle: `共 ${x.length} 个 MCP 客户端（${q} 个启用）· ${M} 个工具`,
      extra: e.createElement(
        e.Fragment,
        null,
        e.createElement(
          I,
          {
            icon: S ? e.createElement(S) : void 0,
            onClick: P,
            loading: R
          },
          "刷新"
        ),
        e.createElement(
          I,
          {
            type: "primary",
            icon: U ? e.createElement(U) : void 0,
            onClick: () => _("/mcp")
          },
          "管理 MCP"
        )
      )
    }),
    e.createElement(
      "div",
      { style: { marginBottom: 16 } },
      e.createElement(E, {
        placeholder: "搜索能力名称、描述...",
        prefix: O ? e.createElement(O) : void 0,
        value: A,
        onChange: (z) => J(z.target.value),
        allowClear: !0,
        style: { maxWidth: 400 }
      })
    ),
    R ? e.createElement(
      "div",
      { style: { textAlign: "center", padding: 60 } },
      e.createElement(a, { size: "large" })
    ) : K.length === 0 ? e.createElement(o, {
      description: A ? "未找到匹配的能力" : "暂无 MCP 客户端，点击「管理 MCP」添加"
    }) : e.createElement(
      y,
      { gutter: [12, 12], align: "stretch" },
      ...K.map(
        (z) => e.createElement(
          C,
          {
            key: z.key,
            xs: 24,
            sm: 12,
            md: 8,
            lg: 6,
            style: { display: "flex" }
          },
          e.createElement(ht, {
            mcp: z,
            onClick: () => {
              c(z), u(!0);
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
          e.createElement("span", { style: { fontSize: 18 } }, "🔌"),
          e.createElement(
            "span",
            null,
            s.name || s.key
          )
        ),
        open: Z,
        onClose: () => u(!1),
        width: 480
      },
      e.createElement(
        T,
        { column: 1, bordered: !0, size: "small" },
        e.createElement(
          T.Item,
          { label: "Key" },
          e.createElement(
            "code",
            { style: { fontSize: 12 } },
            s.key
          )
        ),
        e.createElement(
          T.Item,
          { label: "名称" },
          s.name || "-"
        ),
        e.createElement(
          T.Item,
          { label: "描述" },
          s.description || "-"
        ),
        e.createElement(
          T.Item,
          { label: "状态" },
          e.createElement(
            W,
            { color: s.enabled ? "green" : "default" },
            s.enabled ? "启用" : "停用"
          )
        ),
        e.createElement(
          T.Item,
          { label: "传输方式" },
          s.transport
        ),
        s.url ? e.createElement(
          T.Item,
          { label: "URL" },
          s.url
        ) : null,
        s.command ? e.createElement(
          T.Item,
          { label: "命令" },
          e.createElement(
            "code",
            { style: { fontSize: 11 } },
            s.command
          )
        ) : null,
        s.args && s.args.length > 0 ? e.createElement(
          T.Item,
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
        e.createElement(v, {
          size: "small",
          dataSource: s.tools,
          renderItem: (z) => e.createElement(
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
              D ? e.createElement(D, {
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
  const e = f().React, { useState: n, useEffect: r, useCallback: t, useMemo: l } = e, {
    Spin: a,
    Empty: o,
    Input: E,
    Button: I,
    message: w,
    Row: y,
    Col: C,
    Card: $,
    Tag: T,
    Typography: W,
    Drawer: B,
    Descriptions: v,
    List: S
  } = f().antd, {
    ReloadOutlined: U,
    SearchOutlined: O,
    DownloadOutlined: D,
    ThunderboltOutlined: p
  } = f().antdIcons || {}, { Text: x, Paragraph: F } = W, [R, H] = n([]), [A, J] = n([]), [Z, u] = n([]), [s, c] = n(!0), [P, K] = n(""), [q, M] = n(!1), [_, z] = n(null), [h, V] = n([]), j = t(async () => {
    c(!0);
    try {
      const [b, L, i] = await Promise.all([
        Ne(),
        Ie(),
        Ye()
      ]);
      H(b), u(L), J(i);
    } catch (b) {
      w.error(b.message || "加载技能列表失败"), H([]);
    } finally {
      c(!1);
    }
  }, []);
  r(() => {
    j();
  }, [j]);
  const X = l(() => {
    if (!P.trim()) return R;
    const b = P.toLowerCase();
    return R.filter(
      (L) => {
        var i, G;
        return L.name.toLowerCase().includes(b) || ((i = L.description) == null ? void 0 : i.toLowerCase().includes(b)) || ((G = L.tags) == null ? void 0 : G.some((se) => se.toLowerCase().includes(b)));
      }
    );
  }, [R, P]), de = t(
    (b) => {
      const L = [];
      for (const i of A)
        if (i.skills.some((G) => G.name === b)) {
          const G = Z.find((se) => se.id === i.agent_id);
          L.push((G == null ? void 0 : G.name) || i.agent_name || i.agent_id);
        }
      return L;
    },
    [A, Z]
  ), k = (b) => {
    window.history.pushState({}, "", b), window.dispatchEvent(new PopStateEvent("popstate"));
  };
  return e.createElement(
    "div",
    { style: { padding: 24 } },
    e.createElement(Ce, {
      title: "技能中心",
      subtitle: `技能池共 ${R.length} 个技能`,
      extra: e.createElement(
        e.Fragment,
        null,
        e.createElement(
          I,
          {
            icon: U ? e.createElement(U) : void 0,
            onClick: j,
            loading: s
          },
          "刷新"
        ),
        e.createElement(
          I,
          {
            type: "primary",
            icon: D ? e.createElement(D) : void 0,
            onClick: () => k("/skill-pool")
          },
          "管理技能池"
        )
      )
    }),
    e.createElement(
      "div",
      { style: { marginBottom: 16 } },
      e.createElement(E, {
        placeholder: "搜索技能名称、描述或标签...",
        prefix: O ? e.createElement(O) : void 0,
        value: P,
        onChange: (b) => K(b.target.value),
        allowClear: !0,
        style: { maxWidth: 400 }
      })
    ),
    s ? e.createElement(
      "div",
      { style: { textAlign: "center", padding: 60 } },
      e.createElement(a, { size: "large" })
    ) : X.length === 0 ? e.createElement(o, {
      description: P ? "未找到匹配的技能" : "技能池为空"
    }) : e.createElement(
      y,
      { gutter: [12, 12] },
      ...X.map(
        (b) => {
          var L;
          return e.createElement(
            C,
            { key: b.name, xs: 24, sm: 12, md: 8, lg: 6 },
            e.createElement(
              $,
              {
                hoverable: !0,
                size: "small",
                style: { cursor: "pointer", height: "100%" },
                onClick: () => {
                  z(b), V(de(b.name)), M(!0);
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
                b.emoji ? e.createElement(
                  "span",
                  { style: { fontSize: 18 } },
                  b.emoji
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
                  b.name
                ),
                b.protected ? e.createElement(
                  T,
                  { color: "gold", style: { fontSize: 10 } },
                  "内置"
                ) : null
              ),
              b.description ? e.createElement(
                F,
                {
                  type: "secondary",
                  style: { fontSize: 11, margin: 0, lineHeight: 1.4 },
                  ellipsis: { rows: 2 }
                },
                b.description
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
                b.version_text ? e.createElement(
                  T,
                  { style: { fontSize: 10 } },
                  `v${b.version_text}`
                ) : null,
                ...(L = b.tags) == null ? void 0 : L.slice(0, 3).map(
                  (i, G) => e.createElement(
                    T,
                    { key: G, color: "cyan", style: { fontSize: 10 } },
                    i
                  )
                )
              )
            )
          );
        }
      )
    ),
    // Skill detail drawer
    _ ? e.createElement(
      B,
      {
        title: e.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 8 } },
          e.createElement(
            "span",
            { style: { fontSize: 18 } },
            _.emoji || "⚡"
          ),
          e.createElement("span", null, _.name)
        ),
        open: q,
        onClose: () => M(!1),
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
        v,
        { column: 1, bordered: !0, size: "small" },
        e.createElement(
          v.Item,
          { label: "技能名称" },
          _.name
        ),
        e.createElement(
          v.Item,
          { label: "描述" },
          _.description || "-"
        ),
        _.version_text ? e.createElement(
          v.Item,
          { label: "版本" },
          _.version_text
        ) : null,
        e.createElement(
          v.Item,
          { label: "来源" },
          _.source || "-"
        ),
        e.createElement(
          v.Item,
          { label: "受保护" },
          _.protected ? "是（内置）" : "否"
        ),
        _.sync_status ? e.createElement(
          v.Item,
          { label: "同步状态" },
          _.sync_status
        ) : null,
        _.installed_from ? e.createElement(
          v.Item,
          { label: "安装来源" },
          _.installed_from
        ) : null
      ),
      // Tags
      _.tags && _.tags.length > 0 ? e.createElement(
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
          ..._.tags.map(
            (b, L) => e.createElement(T, { key: L, color: "cyan" }, b)
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
          `已安装此技能的专家 (${h.length})`
        ),
        h.length > 0 ? e.createElement(S, {
          size: "small",
          dataSource: h,
          renderItem: (b) => e.createElement(
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
              e.createElement("span", null, "🧑‍🔬"),
              e.createElement(
                x,
                { style: { fontSize: 13 } },
                b
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
  return te("/market/providers");
}
async function wt(e) {
  return te(
    `/market/categories?lang=${encodeURIComponent(e)}`
  );
}
async function xt(e, n, r, t, l) {
  return te("/market/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: e,
      provider_pages: n,
      limit: r,
      lang: t,
      category: l || void 0
    })
  });
}
async function kt(e, n, r) {
  return te("/skills/hub/install/start", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify({
      bundle_url: n,
      enable: r
    })
  });
}
async function Ct(e, n) {
  return te(
    `/skills/hub/install/status/${encodeURIComponent(n)}`,
    {
      headers: { "X-Agent-Id": e }
    }
  );
}
function Tt() {
  const e = f().React, { useState: n, useEffect: r, useCallback: t, useMemo: l, useRef: a } = e, {
    Spin: o,
    Empty: E,
    Input: I,
    Button: w,
    message: y,
    Row: C,
    Col: $,
    Card: T,
    Tag: W,
    Tooltip: B,
    Typography: v,
    Select: S,
    Drawer: U,
    Descriptions: O,
    Tabs: D,
    Badge: p,
    Progress: x
  } = f().antd, {
    ReloadOutlined: F,
    SearchOutlined: R,
    DownloadOutlined: H,
    AppstoreOutlined: A,
    ShopOutlined: J,
    CheckCircleOutlined: Z,
    LoadingOutlined: u
  } = f().antdIcons || {}, { Text: s, Paragraph: c, Title: P } = v, [K, q] = n("skills"), [M, _] = n([]), [z, h] = n([]), [V, j] = n([]), [X, de] = n(""), [k, b] = n(""), [L, i] = n(!1), [G, se] = n(!1), [ue, ge] = n(
    {}
  ), [m, ee] = n(null), [ne, re] = n({}), [g, N] = n([]), [Q, le] = n(""), [ae, he] = n(""), pe = a(null);
  r(() => {
    Promise.all([
      bt().catch(() => []),
      wt("zh").catch(() => []),
      Ie().catch(() => [])
    ]).then(([d, Y, oe]) => {
      _(d), h(Y), N(oe), oe.length > 0 && le(oe[0].id);
    });
  }, []);
  const ye = t(
    async (d, Y, oe) => {
      i(!0);
      try {
        const ce = await xt(
          d,
          oe,
          20,
          "zh",
          Y || void 0
        );
        oe === void 0 || Object.keys(oe).length === 0 ? j(ce.results) : j((ie) => [...ie, ...ce.results]);
        const ve = Object.values(ce.by_provider || {}).some(
          (ie) => ie.has_more
        );
        se(ve);
        const me = {};
        for (const [ie, fe] of Object.entries(ce.by_provider || {}))
          me[ie] = (oe[ie] || 1) + 1;
        if (ge(me), ce.errors.length > 0)
          for (const ie of ce.errors)
            console.warn(
              `[ugsci] Market provider '${ie.provider}' error: ${ie.message}`
            );
      } catch (ce) {
        y.error(ce.message || "搜索市场失败"), j([]);
      } finally {
        i(!1);
      }
    },
    []
  );
  r(() => (pe.current && clearTimeout(pe.current), pe.current = setTimeout(() => {
    ye(X, k, {});
  }, 400), () => {
    pe.current && clearTimeout(pe.current);
  }), [X, k, ye]);
  const be = () => {
    ye(X, k, ue);
  }, Me = async (d) => {
    var oe;
    if (!Q) {
      y.warning("请先选择安装目标专家");
      return;
    }
    const Y = `${d.source}:${d.slug}`;
    try {
      re((me) => ({ ...me, [Y]: "starting" }));
      const ce = await kt(
        Q,
        d.source_url,
        !0
      );
      re((me) => ({ ...me, [Y]: "installing" }));
      const ve = 60;
      for (let me = 0; me < ve; me++) {
        await new Promise((fe) => setTimeout(fe, 2e3));
        const ie = await Ct(
          Q,
          ce.task_id
        );
        if (ie.status === "completed" && ((oe = ie.result) != null && oe.installed)) {
          y.success(`技能「${ie.result.name || d.name}」安装成功`), re((fe) => {
            const Se = { ...fe };
            return delete Se[Y], Se;
          });
          return;
        }
        if (ie.status === "failed")
          throw new Error(ie.error || "安装失败");
        if (ie.status === "cancelled") {
          y.info("安装已取消"), re((fe) => {
            const Se = { ...fe };
            return delete Se[Y], Se;
          });
          return;
        }
      }
      throw new Error("安装超时");
    } catch (ce) {
      y.error(ce.message || "安装技能失败"), re((ve) => {
        const me = { ...ve };
        return delete me[Y], me;
      });
    }
  }, He = (d) => {
    window.history.pushState({}, "", d), window.dispatchEvent(new PopStateEvent("popstate"));
  }, Oe = M.filter((d) => d.available), Ge = e.createElement(
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
        prefix: R ? e.createElement(R) : void 0,
        value: X,
        onChange: (d) => de(d.target.value),
        allowClear: !0,
        style: { flex: 1, minWidth: 200, maxWidth: 400 }
      }),
      z.length > 0 ? e.createElement(S, {
        value: k || void 0,
        onChange: (d) => b(d || ""),
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
        e.createElement(S, {
          value: Q || void 0,
          onChange: (d) => le(d),
          style: { minWidth: 140 },
          placeholder: "选择专家",
          options: g.map((d) => ({ value: d.id, label: d.name }))
        })
      )
    ),
    // Provider badges
    Oe.length > 0 ? e.createElement(
      "div",
      {
        style: {
          marginBottom: 12,
          display: "flex",
          gap: 4,
          flexWrap: "wrap"
        }
      },
      ...Oe.map(
        (d) => e.createElement(
          W,
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
    L && V.length === 0 ? e.createElement(
      "div",
      { style: { textAlign: "center", padding: 60 } },
      e.createElement(o, { size: "large" })
    ) : V.length === 0 ? e.createElement(E, {
      description: X ? `未找到匹配「${X}」的技能` : "输入关键词搜索技能市场",
      image: E.PRESENTED_IMAGE_SIMPLE
    }) : e.createElement(
      C,
      { gutter: [12, 12] },
      ...V.map((d) => {
        const Y = `${d.source}:${d.slug}`, oe = ne[Y];
        return e.createElement(
          $,
          { key: Y, xs: 24, sm: 12, md: 8, lg: 6 },
          e.createElement(
            T,
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
                B,
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
              c,
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
                  W,
                  { color: "geekblue", style: { fontSize: 10 } },
                  d.source
                ),
                d.version ? e.createElement(
                  W,
                  { style: { fontSize: 10 } },
                  `v${d.version}`
                ) : null
              ),
              oe ? e.createElement(
                w,
                {
                  size: "small",
                  disabled: !0,
                  icon: u ? e.createElement(u) : void 0
                },
                oe === "starting" ? "启动中" : "安装中"
              ) : e.createElement(
                w,
                {
                  type: "primary",
                  size: "small",
                  icon: H ? e.createElement(H) : void 0,
                  onClick: (ce) => {
                    ce.stopPropagation(), Me(d);
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
    G && !L ? e.createElement(
      "div",
      { style: { textAlign: "center", marginTop: 16 } },
      e.createElement(
        w,
        { onClick: be, loading: L },
        "加载更多"
      )
    ) : null,
    // Detail Drawer
    m ? e.createElement(
      U,
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
          w,
          {
            type: "primary",
            icon: H ? e.createElement(H) : void 0,
            onClick: () => {
              Me(m);
            }
          },
          "安装到专家"
        )
      },
      e.createElement(
        O,
        { column: 1, bordered: !0, size: "small" },
        e.createElement(
          O.Item,
          { label: "来源" },
          m.source
        ),
        e.createElement(
          O.Item,
          { label: "描述" },
          m.description || "-"
        ),
        m.version ? e.createElement(
          O.Item,
          { label: "版本" },
          m.version
        ) : null,
        m.author ? e.createElement(
          O.Item,
          { label: "作者" },
          m.author
        ) : null,
        e.createElement(
          O.Item,
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
    if (!ae.trim()) return Te;
    const d = ae.toLowerCase();
    return Te.filter(
      (Y) => Y.name.toLowerCase().includes(d) || Y.description.toLowerCase().includes(d) || Y.category.toLowerCase().includes(d)
    );
  }, [ae]), Je = async (d) => {
    try {
      const Y = await te("/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: d.name,
          description: d.description,
          skill_names: d.recommendedSkills
        })
      });
      await $e(Y.id, "AGENTS.md", d.systemPrompt);
      const oe = await ke(Y.id);
      oe.approval_level = d.approvalLevel, await te(`/agents/${encodeURIComponent(Y.id)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(oe)
      }), y.success(`专家「${d.name}」创建成功，已跳转至专家中心`), He("/ugsci-experts");
    } catch (Y) {
      y.error(Y.message || "创建专家失败");
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
      prefix: R ? e.createElement(R) : void 0,
      value: ae,
      onChange: (d) => he(d.target.value),
      allowClear: !0,
      style: { marginBottom: 16, maxWidth: 400 }
    }),
    e.createElement(
      C,
      { gutter: [12, 12] },
      ...Ve.map(
        (d) => e.createElement(
          $,
          { key: d.id, xs: 24, sm: 12, md: 8 },
          e.createElement(
            T,
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
                    W,
                    { color: "blue", style: { fontSize: 10 } },
                    d.category
                  ),
                  d.approvalLevel === "MANUAL" ? e.createElement(
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
                w,
                {
                  type: "primary",
                  size: "small",
                  icon: A ? e.createElement(A) : void 0
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
      J ? e.createElement(J, {
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
        A ? e.createElement(A) : null,
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
    e.createElement(Ce, {
      title: "市场",
      subtitle: "浏览技能市场 · 选择专家模板 · 随时更新能力和专家",
      extra: e.createElement(
        w,
        {
          icon: F ? e.createElement(F) : void 0,
          onClick: () => ye(X, k, {}),
          loading: L
        },
        "刷新"
      )
    }),
    e.createElement(D, {
      items: Xe,
      activeKey: K,
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
  const n = f().React, r = "ugsci";
  e.route.add(r, {
    id: "ugsci.experts",
    path: "/ugsci-experts",
    component: Et
  }), e.menu.add(r, {
    id: "ugsci.experts",
    location: "primary.agentScoped",
    label: () => "专家中心",
    icon: n.createElement("span", { style: { fontSize: 16 } }, "🧑‍🔬"),
    route: "ugsci.experts",
    order: 5,
    visible: () => Ee()
  }), e.route.add(r, {
    id: "ugsci.capabilities",
    path: "/ugsci-capabilities",
    component: vt
  }), e.menu.add(r, {
    id: "ugsci.capabilities",
    location: "primary.agentScoped",
    label: () => "能力中心",
    icon: n.createElement("span", { style: { fontSize: 16 } }, "🔌"),
    route: "ugsci.capabilities",
    order: 6,
    visible: () => Ee()
  }), e.route.add(r, {
    id: "ugsci.skills-center",
    path: "/ugsci-skills",
    component: St
  }), e.menu.add(r, {
    id: "ugsci.skills-center",
    location: "primary.agentScoped",
    label: () => "技能中心",
    icon: n.createElement("span", { style: { fontSize: 16 } }, "⚡"),
    route: "ugsci.skills-center",
    order: 7,
    visible: () => Ee()
  }), e.route.add(r, {
    id: "ugsci.market",
    path: "/ugsci-market",
    component: Tt
  }), e.menu.add(r, {
    id: "ugsci.market",
    location: "primary.agentScoped",
    label: () => "市场",
    icon: n.createElement("span", { style: { fontSize: 16 } }, "🏪"),
    route: "ugsci.market",
    order: 8,
    visible: () => Ee()
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
  for (const a of t) {
    try {
      const E = e.menu.snapshot("primary.agentScoped").find((I) => I.id === a);
      E && e.menu.replace(r, a, {
        ...E,
        visible: () => !Ee()
      });
    } catch {
    }
    try {
      const E = e.menu.snapshot("primary.settings").find((I) => I.id === a);
      E && e.menu.replace(r, a, {
        ...E,
        visible: () => !Ee()
      });
    } catch {
    }
  }
  console.info(
    "[ugsci] Plugin registered: 4 routes + menu items, simple-mode whitelist + simplified navigation active"
  );
}
function ze() {
  try {
    zt();
  } catch (e) {
    console.error("[ugsci] Failed to build plugin:", e), setTimeout(ze, 500);
  }
}
var Be;
if ((Be = window.QwenPaw) != null && Be.host)
  ze();
else {
  const e = setInterval(() => {
    var n;
    (n = window.QwenPaw) != null && n.host && (clearInterval(e), ze());
  }, 200);
  setTimeout(() => clearInterval(e), 1e4);
}
