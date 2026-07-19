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
    ...(t ? { Authorization: `Bearer ${t}` } : {}),
    ...e,
  };
}
async function Z(e, t) {
  const n = await fetch(ht(e), {
    ...t,
    headers: { ...vt(), ...((t == null ? void 0 : t.headers) || {}) },
  });
  if (!n.ok) {
    const l = await n.text().catch(() => "");
    throw new Error(l || `HTTP ${n.status}`);
  }
  return n.status === 204 ? null : n.json();
}
async function st() {
  const e = await Z("/agents");
  return (e == null ? void 0 : e.agents) || [];
}
async function Ye(e) {
  return Z(`/agents/${encodeURIComponent(e)}`);
}
async function ot(e) {
  return (
    (await Z("/skills", {
      headers: { "X-Agent-Id": e },
    })) || []
  );
}
async function it() {
  return (await Z("/skills/pool")) || [];
}
async function Mt() {
  return (await Z("/skills/workspaces")) || [];
}
async function Bt() {
  return (await Z("/mcp")) || [];
}
const Pe = {
  background: "#0072f5",
  color: "#fff",
  fontSize: 13,
  fontWeight: 600,
  border: "none",
  borderRadius: 8,
};
function Ne() {
  try {
    return localStorage.getItem("qwenpaw_sidebar_mode") === "simple";
  } catch {
    return !1;
  }
}
function ct(e, t) {
  const n = E();
  return n.ReactMarkdown && n.remarkGfm
    ? t.createElement(n.ReactMarkdown, { remarkPlugins: [n.remarkGfm] }, e)
    : e
        .replace(/\*\*(.+?)\*\*/g, "$1")
        .replace(/\*(.+?)\*/g, "$1")
        .replace(/`(.+?)`/g, "$1")
        .replace(/^#+\s*/gm, "")
        .replace(/^[-*]\s+/gm, "• ");
}
const nt = [
    {
      id: "reservoir-engineer",
      name: "油藏工程师",
      emoji: "🛢️",
      category: "油气开发",
      description:
        "**油藏工程师** —— 擅长储量评估、物质平衡计算、递减曲线分析、油藏数值模拟方案设计。",
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
      approvalLevel: "AUTO",
    },
    {
      id: "drilling-engineer",
      name: "钻井工程师",
      emoji: "⛏️",
      category: "钻完井",
      description:
        "**钻井工程师** —— 擅长井身结构设计、钻井液优化、套管设计、固井方案和钻井风险管理。",
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
      approvalLevel: "MANUAL",
    },
    {
      id: "well-logging-analyst",
      name: "测井分析师",
      emoji: "📡",
      category: "测井试油",
      description:
        "**测井分析师** —— 擅长测井曲线解释、岩性识别、孔隙度/饱和度计算和储层评价。",
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
      approvalLevel: "AUTO",
    },
    {
      id: "production-engineer",
      name: "采油工程师",
      emoji: "⚙️",
      category: "油气生产",
      description:
        "**采油工程师** —— 擅长举升工艺设计、注水管理、增产措施工艺设计和生产动态监测。",
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
      approvalLevel: "AUTO",
    },
    {
      id: "geophysicist",
      name: "地球物理专家",
      emoji: "🌍",
      category: "地球物理",
      description:
        "**地球物理专家** —— 擅长地震资料解释、属性分析、反演处理和储层预测。",
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
      approvalLevel: "AUTO",
    },
    {
      id: "pvt-analyst",
      name: "PVT 分析师",
      emoji: "🧪",
      category: "流体性质",
      description:
        "**PVT 分析师** —— 擅长油气流体物性计算、相态分析、PVT 实验拟合和组分模型。",
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
      approvalLevel: "AUTO",
    },
  ],
  bt = "ugsci_custom_teams";
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
  } catch {}
}
const jt = [
  {
    id: "reservoir-eval-team",
    name: "储层评价团队",
    emoji: "🛢️",
    category: "油气勘探",
    mode: "pipeline",
    description:
      "从测井解释到储量计算的完整储层评价流程，依次调用测井分析师、地球物理专家和油藏工程师",
    members: [
      { name: "测井分析师", role: "岩性识别与孔隙度计算", emoji: "📡" },
      { name: "地球物理专家", role: "储层预测与含油气检测", emoji: "🌍" },
      { name: "油藏工程师", role: "储量评估与开发建议", emoji: "🛢️" },
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

重要：每步咨询使用 chat_with_agent，传递上一步的结果作为上下文。`,
  },
  {
    id: "drilling-design-team",
    name: "钻井设计团队",
    emoji: "⛏️",
    category: "钻完井",
    mode: "coordinator",
    description:
      "由钻井工程师主导，协调地球物理专家（地层预测）和采油工程师（完井方案），完成钻井工程设计",
    members: [
      { name: "钻井工程师", role: "井身结构与套管设计", emoji: "⛏️" },
      { name: "地球物理专家", role: "地层压力预测", emoji: "🌍" },
      { name: "采油工程师", role: "完井方案建议", emoji: "⚙️" },
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

注意：每步使用 chat_with_agent 咨询，传递已获取的参数。`,
  },
  {
    id: "development-plan-team",
    name: "开发方案评审团队",
    emoji: "📋",
    category: "油气开发",
    mode: "roundtable",
    description:
      "油藏工程师、钻井工程师和采油工程师独立评估同一区块的开发方案，对比不同视角后综合出最优方案",
    members: [
      { name: "油藏工程师", role: "储量与开发方式评估", emoji: "🛢️" },
      { name: "钻井工程师", role: "工程可行性评估", emoji: "⛏️" },
      { name: "采油工程师", role: "生产工艺评估", emoji: "⚙️" },
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

重要：三位专家应独立评估，不要将一位专家的意见传递给另一位。`,
  },
  {
    id: "pvt-analysis-team",
    name: "流体性质分析团队",
    emoji: "🧪",
    category: "流体性质",
    mode: "pipeline",
    description:
      "PVT分析师进行流体物性计算，地球物理专家辅助相态验证，油藏工程师完成开发方案适配",
    members: [
      { name: "PVT 分析师", role: "PVT实验拟合与物性计算", emoji: "🧪" },
      { name: "地球物理专家", role: "相态行为验证", emoji: "🌍" },
      { name: "油藏工程师", role: "开发方式适配", emoji: "🛢️" },
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

注意：每步使用 chat_with_agent 咨询，传递上一步的完整结果。`,
  },
];
async function Dt(e, t) {
  const n = {
    channel: "console",
    user_id: "default",
    session_id: `team-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    input: [
      {
        role: "user",
        content: [{ type: "text", text: t }],
      },
    ],
  };
  await fetch(ht("/console/chat"), {
    method: "POST",
    headers: {
      ...vt(),
      "X-Agent-Id": e,
    },
    body: JSON.stringify(n),
  });
}
function Ve(e, t) {
  const n = e.find((a) => a.name === t || a.name === t.replace(/\s+/g, ""));
  if (n) return n.id;
  const l = e.find(
    (a) =>
      a.name.includes(t) ||
      t.includes(a.name) ||
      a.name.replace(/\s+/g, "").includes(t.replace(/\s+/g, "")),
  );
  return l ? l.id : null;
}
function Nt(e) {
  var n;
  const t = e.members.map((l) => `- ${l.emoji} ${l.name}（${l.role}）`).join(`
`);
  if (e.custom && e.steps && e.steps.length > 0) {
    const l = e.steps.map((r, s) => {
      const i = r.passContext
        ? "（传递上一步的结果作为上下文）"
        : "（独立执行，不传递上下文）";
      return `${s + 1}. 向「${r.agentName}」发送请求：${r.instruction} ${i}`;
    }).join(`
`);
    return `${
      e.mode === "pipeline"
        ? "请按顺序依次执行以下步骤，每步使用 chat_with_agent 咨询对应专家："
        : e.mode === "roundtable"
        ? "请同时向以下专家分别发送独立请求（不传递上下文），收集所有结果后综合："
        : `你是团队协调者（${
            e.coordinatorName ||
            ((n = e.members[0]) == null ? void 0 : n.name) ||
            ""
          }），请按需调用以下专家完成任务：`
    }

---

## 团队任务

${e.taskTemplate}

---

## 执行步骤

${l}

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
  const t = E().React,
    { Typography: n, Tag: l } = E().antd,
    { Text: a } = n,
    r = {
      pipeline: "→",
      roundtable: "⇄",
      coordinator: "⊙",
    },
    s = {
      pipeline: "#13c2c2",
      roundtable: "#722ed1",
      coordinator: "#1677ff",
    },
    i = e.steps || [],
    g = i.length > 0;
  return t.createElement(
    "div",
    {
      style: {
        padding: "12px 16px",
        background: "#fafafa",
        borderRadius: 8,
        border: "1px dashed #d9d9d9",
      },
    },
    t.createElement(
      a,
      {
        type: "secondary",
        style: { fontSize: 12, display: "block", marginBottom: 8 },
      },
      `执行流程 (${
        e.mode === "pipeline"
          ? "流水线"
          : e.mode === "roundtable"
          ? "圆桌讨论"
          : "协调者模式"
      })`,
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
          flexWrap: "wrap",
        },
      },
      ...(g
        ? i
            .map((y, p) => {
              const $ = e.members.find((b) => b.name === y.agentName);
              return [
                p > 0 && e.mode !== "roundtable"
                  ? t.createElement(
                      "div",
                      {
                        key: `arrow-${p}`,
                        style: {
                          textAlign: "center",
                          color: s[e.mode],
                          fontSize: 14,
                        },
                      },
                      r[e.mode],
                    )
                  : null,
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
                      flex: e.mode === "roundtable" ? "1 1 200px" : "initial",
                    },
                  },
                  t.createElement(
                    "span",
                    { style: { fontSize: 16 } },
                    ($ == null ? void 0 : $.emoji) || "👤",
                  ),
                  t.createElement(
                    "div",
                    null,
                    t.createElement(
                      a,
                      { strong: !0, style: { fontSize: 12 } },
                      y.agentName,
                    ),
                    t.createElement(
                      "div",
                      {
                        style: {
                          fontSize: 11,
                          color: "#8c8c8c",
                          maxWidth: 250,
                        },
                      },
                      y.instruction,
                    ),
                    y.passContext
                      ? t.createElement(
                          l,
                          {
                            color: "blue",
                            style: { fontSize: 9, marginTop: 2 },
                          },
                          "传递上下文",
                        )
                      : t.createElement(
                          l,
                          { style: { fontSize: 9, marginTop: 2 } },
                          "独立",
                        ),
                  ),
                ),
              ];
            })
            .flat()
        : e.members
            .map((y, p) => [
              p > 0 && e.mode !== "roundtable"
                ? t.createElement(
                    "div",
                    {
                      key: `arrow-${p}`,
                      style: {
                        textAlign: "center",
                        color: s[e.mode],
                        fontSize: 14,
                      },
                    },
                    r[e.mode],
                  )
                : null,
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
                    flex: e.mode === "roundtable" ? "1 1 150px" : "initial",
                  },
                },
                t.createElement("span", { style: { fontSize: 16 } }, y.emoji),
                t.createElement(
                  "div",
                  null,
                  t.createElement(
                    a,
                    { strong: !0, style: { fontSize: 12 } },
                    y.name,
                  ),
                  t.createElement(
                    "div",
                    { style: { fontSize: 11, color: "#8c8c8c" } },
                    y.role,
                  ),
                ),
              ),
            ])
            .flat()),
    ),
  );
}
function Ft({ open: e, onClose: t, agents: n, editingTeam: l, onSaved: a }) {
  const r = E().React,
    { useState: s, useEffect: i, useCallback: g } = r,
    {
      Modal: y,
      Input: p,
      Button: $,
      Select: b,
      Tag: h,
      Typography: U,
      Switch: M,
      Empty: D,
      message: O,
      Divider: H,
      Steps: w,
    } = E().antd,
    {
      PlusOutlined: G,
      DeleteOutlined: P,
      SaveOutlined: B,
      ArrowRightOutlined: N,
    } = E().antdIcons || {},
    { Text: A, Paragraph: u } = U,
    [x, _] = s(""),
    [J, z] = s("🤝"),
    [S, c] = s(""),
    [k, W] = s("pipeline"),
    [Y, d] = s(""),
    [I, q] = s(""),
    [o, ee] = s([]),
    [R, te] = s([]),
    [ae, T] = s(!1);
  i(() => {
    e &&
      (l
        ? (_(l.name),
          z(l.emoji),
          c(l.description),
          W(l.mode),
          d(l.coordinatorName || ""),
          q(l.taskTemplate),
          ee(l.steps || []),
          te(l.members.map((F) => F.name)))
        : (_(""),
          z("🤝"),
          c(""),
          W("pipeline"),
          d(""),
          q(`请执行以下任务：
任务描述：{任务描述}`),
          ee([]),
          te([])));
  }, [e, l]);
  const v = g(() => {
      if (k === "roundtable") {
        const F = R.map((L) => ({
          agentName: L,
          instruction: "请给出你的专业评估意见",
          passContext: !1,
        }));
        ee(F);
      } else if (k === "pipeline") {
        const F = new Map(o.map((le) => [le.agentName, le])),
          L = R.map(
            (le) =>
              F.get(le) || {
                agentName: le,
                instruction: "请完成你的专业部分",
                passContext: !0,
              },
          );
        ee(L);
      }
    }, [k, R, o]),
    ne = (F) => {
      R.includes(F) || (te([...R, F]), k === "coordinator" && !Y && d(F));
    },
    f = (F) => {
      te(R.filter((L) => L !== F)),
        ee(o.filter((L) => L.agentName !== F)),
        Y === F && d(R[0] || "");
    },
    se = (F, L, le) => {
      const K = [...o];
      (K[F] = { ...K[F], [L]: le }), ee(K);
    },
    re = () => {
      if (!x.trim()) {
        O.warning("请输入团队名称");
        return;
      }
      if (R.length < 2) {
        O.warning("至少需要选择 2 个成员");
        return;
      }
      if (!I.trim()) {
        O.warning("请输入任务模板");
        return;
      }
      if (k === "coordinator" && !Y) {
        O.warning("请选择协调者");
        return;
      }
      T(!0);
      try {
        const F = R.map((ye) => {
          var ze;
          const oe = n.find((Oe) => Oe.name === ye);
          return {
            name: ye,
            role:
              ((ze = oe == null ? void 0 : oe.description) == null
                ? void 0
                : ze.slice(0, 30)) || "团队成员",
            emoji: "👤",
          };
        });
        let L = o;
        (o.length === 0 || o.length !== R.length) &&
          (L = R.map((ye) => ({
            agentName: ye,
            instruction: "请完成你的专业部分",
            passContext: k === "pipeline",
          })));
        const le = {
            id: (l == null ? void 0 : l.id) || `custom-${Date.now()}`,
            name: x.trim(),
            emoji: J,
            category: "自定义",
            description: S.trim() || `${x.trim()}（${R.length}人团队）`,
            mode: k,
            members: F,
            coordinatorName: k === "coordinator" ? Y : void 0,
            taskTemplate: I.trim(),
            orchestrationPrompt: "",
            // Custom teams use steps-based instructions
            steps: L,
            custom: !0,
            createdAt: (l == null ? void 0 : l.createdAt) || Date.now(),
          },
          K = Ke(),
          Ee = K.findIndex((ye) => ye.id === le.id);
        Ee >= 0 ? (K[Ee] = le) : K.push(le),
          St(K),
          O.success(l ? "团队已更新" : "团队已创建"),
          a(),
          t();
      } catch (F) {
        O.error(F.message || "保存失败");
      } finally {
        T(!1);
      }
    },
    he = [
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
      "💡",
    ],
    ve = n.filter((F) => !R.includes(F.name));
  return r.createElement(
    y,
    {
      open: e,
      onCancel: t,
      title: r.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 8 } },
        r.createElement("span", { style: { fontSize: 20 } }, l ? "✏️" : "➕"),
        r.createElement("span", null, l ? "编辑专家团" : "创建专家团"),
      ),
      width: 720,
      onOk: re,
      okText: "保存团队",
      confirmLoading: ae,
      okButtonProps: {
        icon: B ? r.createElement(B) : void 0,
      },
    },
    // Step 1: Basic info
    r.createElement(
      "div",
      { style: { marginBottom: 16 } },
      r.createElement(
        A,
        {
          strong: !0,
          style: { display: "block", marginBottom: 8, fontSize: 13 },
        },
        "1. 基本信息",
      ),
      r.createElement(
        "div",
        { style: { display: "flex", gap: 8, marginBottom: 8 } },
        r.createElement(b, {
          value: J,
          onChange: (F) => z(F),
          style: { width: 60 },
          options: he.map((F) => ({ value: F, label: F })),
          optionRender: (F) =>
            r.createElement("span", { style: { fontSize: 18 } }, F.value),
        }),
        r.createElement(p, {
          placeholder: "团队名称（如：储层评价团队）",
          value: x,
          onChange: (F) => _(F.target.value),
          style: { flex: 1 },
        }),
      ),
      r.createElement(p.TextArea, {
        placeholder: "团队描述（简述团队的目标和适用场景）",
        value: S,
        onChange: (F) => c(F.target.value),
        rows: 2,
        style: { marginBottom: 8 },
      }),
      r.createElement(
        "div",
        { style: { display: "flex", gap: 8, alignItems: "center" } },
        r.createElement(
          A,
          { type: "secondary", style: { fontSize: 12 } },
          "协同模式：",
        ),
        r.createElement(b, {
          value: k,
          onChange: (F) => W(F),
          style: { width: 160 },
          options: [
            { value: "pipeline", label: "🔄 流水线（依次执行）" },
            { value: "roundtable", label: "🔀 圆桌讨论（独立评估）" },
            { value: "coordinator", label: "🎯 协调者（由协调者主导）" },
          ],
        }),
      ),
    ),
    r.createElement(H, { style: { margin: "12px 0" } }),
    // Step 2: Select members
    r.createElement(
      "div",
      { style: { marginBottom: 16 } },
      r.createElement(
        A,
        {
          strong: !0,
          style: { display: "block", marginBottom: 8, fontSize: 13 },
        },
        "2. 选择团队成员",
      ),
      // Available agents
      ve.length > 0
        ? r.createElement(
            "div",
            {
              style: {
                display: "flex",
                gap: 6,
                flexWrap: "wrap",
                marginBottom: 8,
                padding: 8,
                background: "#f5f5f5",
                borderRadius: 6,
              },
            },
            ...ve.map((F) =>
              r.createElement(
                $,
                {
                  key: F.id,
                  size: "small",
                  icon: G ? r.createElement(G) : void 0,
                  onClick: () => ne(F.name),
                },
                F.name,
              ),
            ),
          )
        : null,
      // Selected members
      R.length === 0
        ? r.createElement(D, {
            description: "请从上方添加团队成员",
            image: D.PRESENTED_IMAGE_SIMPLE,
          })
        : r.createElement(
            "div",
            { style: { display: "flex", flexDirection: "column", gap: 4 } },
            ...R.map((F) =>
              r.createElement(
                "div",
                {
                  key: F,
                  style: {
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "6px 10px",
                    background: "#f0f5ff",
                    borderRadius: 6,
                    border: "1px solid #d6e4ff",
                  },
                },
                r.createElement(
                  "div",
                  { style: { display: "flex", alignItems: "center", gap: 6 } },
                  r.createElement("span", null, "👤"),
                  r.createElement(
                    A,
                    { strong: !0, style: { fontSize: 13 } },
                    F,
                  ),
                  k === "coordinator" && Y === F
                    ? r.createElement(
                        h,
                        { color: "blue", style: { fontSize: 10 } },
                        "协调者",
                      )
                    : null,
                ),
                r.createElement(
                  "div",
                  { style: { display: "flex", gap: 4 } },
                  k === "coordinator"
                    ? r.createElement(
                        $,
                        {
                          size: "small",
                          type: "link",
                          onClick: () => d(F),
                        },
                        "设为协调者",
                      )
                    : null,
                  r.createElement(
                    $,
                    {
                      size: "small",
                      type: "link",
                      danger: !0,
                      icon: P ? r.createElement(P) : void 0,
                      onClick: () => f(F),
                    },
                    "移除",
                  ),
                ),
              ),
            ),
          ),
    ),
    r.createElement(H, { style: { margin: "12px 0" } }),
    // Step 3: Define execution steps (for pipeline/roundtable)
    R.length > 0
      ? r.createElement(
          "div",
          { style: { marginBottom: 16 } },
          r.createElement(
            A,
            {
              strong: !0,
              style: { display: "block", marginBottom: 8, fontSize: 13 },
            },
            `3. 编排执行步骤${
              k === "roundtable"
                ? "（各步独立执行）"
                : k === "pipeline"
                ? "（依次执行，可传递上下文）"
                : "（由协调者决定调用顺序）"
            }`,
          ),
          // Auto-sync button
          r.createElement(
            $,
            {
              size: "small",
              type: "dashed",
              onClick: v,
              style: { marginBottom: 8 },
            },
            "自动生成步骤",
          ),
          // Steps list
          o.length === 0
            ? r.createElement(
                A,
                { type: "secondary", style: { fontSize: 12 } },
                "点击「自动生成步骤」或手动配置每步的指令",
              )
            : r.createElement(
                "div",
                { style: { display: "flex", flexDirection: "column", gap: 6 } },
                ...o.map((F, L) =>
                  r.createElement(
                    "div",
                    {
                      key: L,
                      style: {
                        padding: 8,
                        background: "#fff",
                        borderRadius: 6,
                        border: "1px solid #e8e8e8",
                      },
                    },
                    r.createElement(
                      "div",
                      {
                        style: {
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          marginBottom: 6,
                        },
                      },
                      k === "pipeline"
                        ? r.createElement(
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
                                fontWeight: 600,
                              },
                            },
                            `${L + 1}`,
                          )
                        : r.createElement(
                            "span",
                            { style: { fontSize: 14 } },
                            "🔀",
                          ),
                      r.createElement(
                        h,
                        { color: "blue", style: { fontSize: 11 } },
                        F.agentName,
                      ),
                      r.createElement(
                        "div",
                        { style: { flex: 1 } },
                        r.createElement(p, {
                          placeholder: "请输入该步骤的指令...",
                          value: F.instruction,
                          onChange: (le) =>
                            se(L, "instruction", le.target.value),
                          size: "small",
                        }),
                      ),
                    ),
                    r.createElement(
                      "div",
                      {
                        style: {
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          paddingLeft: 28,
                        },
                      },
                      r.createElement(M, {
                        size: "small",
                        checked: F.passContext,
                        onChange: (le) => se(L, "passContext", le),
                      }),
                      r.createElement(
                        A,
                        { type: "secondary", style: { fontSize: 11 } },
                        F.passContext ? "传递上一步结果作为上下文" : "独立执行",
                      ),
                    ),
                  ),
                ),
              ),
        )
      : null,
    r.createElement(H, { style: { margin: "12px 0" } }),
    // Step 4: Task template
    r.createElement(
      "div",
      null,
      r.createElement(
        A,
        {
          strong: !0,
          style: { display: "block", marginBottom: 8, fontSize: 13 },
        },
        `${R.length > 0 ? "4" : "3"}. 任务模板`,
      ),
      r.createElement(p.TextArea, {
        placeholder: `输入任务模板，可用 {参数名} 作为占位符...

例如：
请对区块 {区块名} 的井 {井号} 进行储层评价`,
        value: I,
        onChange: (F) => q(F.target.value),
        rows: 4,
        style: { fontFamily: "monospace", fontSize: 13 },
      }),
      r.createElement(
        A,
        {
          type: "secondary",
          style: { fontSize: 11, display: "block", marginTop: 4 },
        },
        "占位符 {参数名} 在发起任务时可由用户填写替换",
      ),
    ),
  );
}
function mt({ team: e, agents: t, onLaunch: n, onEdit: l, onDelete: a }) {
  var S;
  const r = E().React,
    { useState: s } = r,
    { Card: i, Tag: g, Typography: y, Button: p, Tooltip: $ } = E().antd,
    {
      TeamOutlined: b,
      RocketOutlined: h,
      UserOutlined: U,
      EditOutlined: M,
      DeleteOutlined: D,
      DownOutlined: O,
      UpOutlined: H,
    } = E().antdIcons || {},
    { Text: w, Paragraph: G } = y,
    [P, B] = s(!1),
    N = {
      coordinator: { label: "协调者模式", color: "blue" },
      pipeline: { label: "流水线模式", color: "cyan" },
      roundtable: { label: "圆桌讨论", color: "purple" },
    },
    A = N[e.mode] || N.coordinator,
    u = e.members.map((c) => {
      const k = Ve(t, c.name);
      return { ...c, found: !!k, agentId: k };
    }),
    x = u.filter((c) => c.found).length,
    _ = x === e.members.length,
    J = e.coordinatorName || ((S = e.members[0]) == null ? void 0 : S.name),
    z = J ? Ve(t, J) : null;
  return r.createElement(
    i,
    {
      hoverable: !0,
      size: "small",
      style: { height: "100%", display: "flex", flexDirection: "column" },
    },
    // Header: emoji + name + mode tag + custom badge
    r.createElement(
      "div",
      {
        style: {
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 10,
        },
      },
      r.createElement("span", { style: { fontSize: 24 } }, e.emoji),
      r.createElement(
        "div",
        { style: { flex: 1 } },
        r.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 6 } },
          r.createElement(w, { strong: !0, style: { fontSize: 14 } }, e.name),
          e.custom
            ? r.createElement(
                g,
                { color: "gold", style: { fontSize: 9 } },
                "自定义",
              )
            : null,
        ),
        r.createElement(
          "div",
          { style: { display: "flex", gap: 4, marginTop: 4 } },
          r.createElement(
            g,
            { color: A.color, style: { fontSize: 10 } },
            A.label,
          ),
          r.createElement(
            g,
            { style: { fontSize: 10 } },
            `${x}/${e.members.length}`,
          ),
          _
            ? null
            : r.createElement(
                g,
                { color: "orange", style: { fontSize: 10 } },
                "缺少成员",
              ),
        ),
      ),
      // Edit/delete for custom teams
      e.custom
        ? r.createElement(
            "div",
            { style: { display: "flex", gap: 2 } },
            l
              ? r.createElement(
                  $,
                  { title: "编辑" },
                  r.createElement(p, {
                    type: "text",
                    size: "small",
                    icon: M ? r.createElement(M) : void 0,
                    onClick: (c) => {
                      c.stopPropagation(), l(e);
                    },
                  }),
                )
              : null,
            a
              ? r.createElement(
                  $,
                  { title: "删除" },
                  r.createElement(p, {
                    type: "text",
                    size: "small",
                    danger: !0,
                    icon: D ? r.createElement(D) : void 0,
                    onClick: (c) => {
                      c.stopPropagation(), a(e);
                    },
                  }),
                )
              : null,
          )
        : null,
    ),
    // Description
    r.createElement(
      G,
      {
        type: "secondary",
        style: { fontSize: 12, margin: 0, marginBottom: 10, lineHeight: 1.5 },
        ellipsis: { rows: 2 },
      },
      e.description,
    ),
    // Member avatars
    r.createElement(
      "div",
      {
        style: {
          display: "flex",
          gap: 6,
          marginBottom: 10,
          flexWrap: "wrap",
        },
      },
      ...u.map((c) =>
        r.createElement(
          $,
          {
            key: c.name,
            title: `${c.name}（${c.role}）${c.found ? "" : " - 未创建"}`,
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
                background: c.found ? "#f0f5ff" : "#fff2f0",
                border: `1px solid ${c.found ? "#d6e4ff" : "#ffccc7"}`,
                fontSize: 11,
              },
            },
            r.createElement("span", null, c.emoji),
            r.createElement(
              w,
              {
                style: { fontSize: 11, color: c.found ? "#1f4e8c" : "#cf1322" },
              },
              c.name,
            ),
          ),
        ),
      ),
    ),
    // Toggle flow diagram
    r.createElement(
      p,
      {
        type: "link",
        size: "small",
        style: { padding: "0 0 4px 0", fontSize: 11, height: "auto" },
        onClick: (c) => {
          c.stopPropagation(), B(!P);
        },
        icon: P ? (H ? r.createElement(H) : "▲") : O ? r.createElement(O) : "▼",
      },
      P ? "收起流程" : "查看执行流程",
    ),
    P ? r.createElement(Ut, { team: e }) : null,
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
          alignItems: "center",
        },
      },
      r.createElement(
        w,
        { type: "secondary", style: { fontSize: 11 } },
        J ? `协调者: ${J}` : "",
      ),
      r.createElement(
        p,
        {
          type: "primary",
          size: "small",
          icon: h ? r.createElement(h) : void 0,
          disabled: !z,
          onClick: () => n(e),
          style: Pe,
        },
        "发起团队任务",
      ),
    ),
  );
}
function Ht({ agents: e, onLaunch: t }) {
  const n = E().React,
    { useMemo: l, useState: a, useCallback: r, useEffect: s } = n,
    {
      Row: i,
      Col: g,
      Input: y,
      Empty: p,
      Typography: $,
      Tag: b,
      Button: h,
      Divider: U,
      message: M,
      Popconfirm: D,
    } = E().antd,
    {
      SearchOutlined: O,
      TeamOutlined: H,
      PlusOutlined: w,
      RocketOutlined: G,
    } = E().antdIcons || {},
    { Text: P } = $,
    [B, N] = a(""),
    [A, u] = a([]),
    [x, _] = a(!1),
    [J, z] = a(null);
  s(() => {
    u(Ke());
  }, []);
  const S = r(() => {
      u(Ke());
    }, []),
    c = r(
      (o) => {
        const R = Ke().filter((te) => te.id !== o.id);
        St(R), u(R), M.success(`团队「${o.name}」已删除`);
      },
      [M],
    ),
    k = r((o) => {
      z(o), _(!0);
    }, []),
    W = r(() => {
      z(null), _(!0);
    }, []),
    Y = l(() => [...A, ...jt], [A]),
    d = l(() => {
      if (!B.trim()) return Y;
      const o = B.toLowerCase();
      return Y.filter(
        (ee) =>
          ee.name.toLowerCase().includes(o) ||
          ee.description.toLowerCase().includes(o) ||
          ee.category.toLowerCase().includes(o),
      );
    }, [Y, B]),
    I = d.filter((o) => o.custom),
    q = d.filter((o) => !o.custom);
  return n.createElement(
    "div",
    null,
    // Info banner
    n.createElement(
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
          alignItems: "center",
        },
      },
      n.createElement(
        P,
        { style: { fontSize: 13, color: "#389e0d" } },
        "多智能体协同 — 选择预设团队或创建自定义团队，支持流水线、圆桌讨论、协调者三种编排模式。",
      ),
      n.createElement(
        h,
        {
          type: "primary",
          size: "small",
          icon: w ? n.createElement(w) : void 0,
          onClick: W,
          style: Pe,
        },
        "创建专家团",
      ),
    ),
    // Search
    n.createElement(y, {
      placeholder: "搜索团队名称、描述或类别...",
      prefix: O ? n.createElement(O) : void 0,
      value: B,
      onChange: (o) => N(o.target.value),
      allowClear: !0,
      style: { marginBottom: 16, maxWidth: 400 },
    }),
    // Custom teams section
    I.length > 0
      ? n.createElement(
          "div",
          { style: { marginBottom: 20 } },
          n.createElement(
            "div",
            {
              style: {
                display: "flex",
                alignItems: "center",
                gap: 6,
                marginBottom: 10,
              },
            },
            n.createElement("span", { style: { fontSize: 16 } }),
            n.createElement(
              P,
              { strong: !0, style: { fontSize: 14 } },
              `自定义团队 (${I.length})`,
            ),
          ),
          n.createElement(
            i,
            { gutter: [12, 12] },
            ...I.map((o) =>
              n.createElement(
                g,
                { key: o.id, xs: 24, sm: 12, md: 8 },
                n.createElement(mt, {
                  team: o,
                  agents: e,
                  onLaunch: t,
                  onEdit: k,
                  onDelete: c,
                }),
              ),
            ),
          ),
          n.createElement(U, { style: { margin: "16px 0" } }),
        )
      : null,
    // Preset teams section
    q.length > 0
      ? n.createElement(
          "div",
          null,
          n.createElement(
            "div",
            {
              style: {
                display: "flex",
                alignItems: "center",
                gap: 6,
                marginBottom: 10,
              },
            },
            n.createElement("span", { style: { fontSize: 16 } }),
            n.createElement(
              P,
              { strong: !0, style: { fontSize: 14 } },
              `预设团队 (${q.length})`,
            ),
            n.createElement(
              P,
              { type: "secondary", style: { fontSize: 12 } },
              "· 行业典型工作流模板",
            ),
          ),
          n.createElement(
            i,
            { gutter: [12, 12] },
            ...q.map((o) =>
              n.createElement(
                g,
                { key: o.id, xs: 24, sm: 12, md: 8 },
                n.createElement(mt, {
                  team: o,
                  agents: e,
                  onLaunch: t,
                }),
              ),
            ),
          ),
        )
      : null,
    // Empty state
    d.length === 0
      ? n.createElement(p, {
          description: "未找到匹配的专家团队，点击「创建专家团」自定义",
          image: p.PRESENTED_IMAGE_SIMPLE,
        })
      : null,
    // Team Builder Modal
    n.createElement(Ft, {
      open: x,
      onClose: () => {
        _(!1), z(null);
      },
      agents: e,
      editingTeam: J,
      onSaved: S,
    }),
  );
}
function Wt(e) {
  var n;
  const t = [];
  for (const l of e) {
    if (l.enabled === !1) continue;
    const a = (n = l.description) == null ? void 0 : n.trim();
    if (!a) continue;
    let r = a;
    if (
      ((r = r
        .replace(/\*\*(.+?)\*\*/g, "$1")
        .replace(/\*(.+?)\*/g, "$1")
        .replace(/`(.+?)`/g, "$1")
        .replace(/^#+\s*/gm, "")
        .trim()),
      /^(用于|帮助|提供|支持|实现|完成|分析|计算|生成|创建|检查)/.test(r)
        ? (r = `请${r}`)
        : /^(a |an |the )/i.test(r)
        ? (r = `Help me with ${r}`)
        : /[。？！.?!]$/.test(r) || (r = `帮我${r}`),
      r.length > 80 && (r = r.substring(0, 77) + "..."),
      t.push(r),
      t.length >= 4)
    )
      break;
  }
  return t;
}
async function Gt(e) {
  return (
    (await Z("/workspace/files", {
      headers: { "X-Agent-Id": e },
    })) || []
  );
}
async function qe(e, t, n) {
  await Z(`/workspace/files/${encodeURIComponent(t)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify({ content: n }),
  });
}
async function dt(e, t) {
  const n = await Ye(e);
  (n.system_prompt_files = t),
    await Z(`/agents/${encodeURIComponent(e)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(n),
    });
}
async function wt(e, t) {
  await Z("/skills/pool/download", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      skill_name: t,
      targets: [{ workspace_id: e }],
      overwrite: !1,
    }),
  });
}
async function Jt(e, t) {
  await Z(`/skills/${encodeURIComponent(t)}/enable`, {
    method: "POST",
    headers: { "X-Agent-Id": e },
  });
}
async function xt(e, t) {
  await Z(`/skills/${encodeURIComponent(t)}`, {
    method: "DELETE",
    headers: { "X-Agent-Id": e },
  });
}
async function Xt(e, t) {
  return Z("/skills/batch-enable", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify(t),
  });
}
async function Kt(e, t) {
  return Z("/skills/batch-disable", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify(t),
  });
}
async function Vt(e, t) {
  return Z("/skills/batch-delete", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify(t),
  });
}
async function Ct(e) {
  return (
    (await Z("/mcp", {
      headers: { "X-Agent-Id": e },
    })) || []
  );
}
async function kt(e, t) {
  await Z(`/mcp/${encodeURIComponent(t)}`, {
    method: "DELETE",
    headers: { "X-Agent-Id": e },
  });
}
async function qt(e, t) {
  return Z("/mcp", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify(t),
  });
}
async function Yt(e, t) {
  return Z(`/mcp/toggle/${encodeURIComponent(t)}`, {
    method: "PATCH",
    headers: { "X-Agent-Id": e },
  });
}
async function Qt(e, t) {
  await Z(`/skills/${encodeURIComponent(t)}/disable`, {
    method: "POST",
    headers: { "X-Agent-Id": e },
  });
}
function Zt(e) {
  const t = (e || "").trim();
  if (!t) return { number: 6, unit: "h" };
  const n = t.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/i);
  if (!n) return { number: 6, unit: "h" };
  const l = parseInt(n[1] || "0", 10),
    a = parseInt(n[2] || "0", 10),
    r = parseInt(n[3] || "0", 10),
    s = l * 60 + a + Math.round(r / 60);
  return s <= 0
    ? { number: 6, unit: "h" }
    : s >= 60 && s % 60 === 0
    ? { number: s / 60, unit: "h" }
    : { number: s, unit: "m" };
}
function en(e) {
  return e.unit === "h" ? `${e.number}h` : `${e.number}m`;
}
async function tn(e) {
  return Z("/config/heartbeat", {
    headers: { "X-Agent-Id": e },
  });
}
async function nn(e, t) {
  return Z("/config/heartbeat", {
    method: "PUT",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify(t),
  });
}
async function ln(e) {
  await Z("/config/heartbeat/run", {
    method: "POST",
    headers: { "X-Agent-Id": e },
  });
}
async function an(e) {
  return Z("/workspace/running-config", {
    headers: { "X-Agent-Id": e },
  });
}
async function rn(e, t) {
  return Z("/workspace/running-config", {
    method: "PUT",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify(t),
  });
}
async function sn(e) {
  return (
    (
      await Z("/workspace/language", {
        headers: { "X-Agent-Id": e },
      })
    ).language || "zh"
  );
}
async function on(e, t) {
  await Z("/workspace/language", {
    method: "PUT",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify({ language: t }),
  });
}
async function cn() {
  return (await Z("/config/user-timezone")).timezone || "UTC";
}
async function mn(e) {
  await Z("/config/user-timezone", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ timezone: e }),
  });
}
async function dn(e) {
  return (
    (await Z("/workspace/system-prompt-files", {
      headers: { "X-Agent-Id": e },
    })) || []
  );
}
const ut = ["AGENTS.md", "SOUL.md", "PROFILE.md"];
function Qe({ title: e, subtitle: t, extra: n }) {
  const l = E().React,
    { Space: a } = E().antd;
  return l.createElement(
    "div",
    {
      style: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20,
        paddingBottom: 12,
        borderBottom: "1px solid #f0f0f0",
      },
    },
    l.createElement(
      "div",
      null,
      l.createElement(
        "h2",
        { style: { margin: 0, fontSize: 20, fontWeight: 600 } },
        e,
      ),
      t
        ? l.createElement(
            "div",
            { style: { marginTop: 4, fontSize: 13, color: "#8c8c8c" } },
            t,
          )
        : null,
    ),
    n ? l.createElement(a, null, n) : null,
  );
}
function pt({ items: e, max: t = 5, color: n = "blue", emptyText: l = "无" }) {
  const a = E().React,
    { Tag: r } = E().antd;
  return !e || e.length === 0
    ? a.createElement("span", { style: { fontSize: 12, color: "#bfbfbf" } }, l)
    : a.createElement(
        "div",
        { style: { display: "flex", flexWrap: "wrap", gap: 4 } },
        ...e
          .slice(0, t)
          .map((s, i) =>
            a.createElement(
              r,
              { key: i, color: n, style: { fontSize: 11, marginRight: 0 } },
              s,
            ),
          ),
        e.length > t
          ? a.createElement(
              r,
              { style: { fontSize: 11, marginRight: 0 } },
              `+${e.length - t}`,
            )
          : null,
      );
}
function Tt({
  open: e,
  onClose: t,
  poolSkills: n,
  installedSkillNames: l,
  loading: a,
  onInstall: r,
}) {
  const s = E().React,
    { useState: i, useEffect: g, useMemo: y } = s,
    {
      Modal: p,
      Button: $,
      Empty: b,
      Spin: h,
      Input: U,
      Tag: M,
      Tooltip: D,
      Typography: O,
    } = E().antd,
    { CheckOutlined: H, SearchOutlined: w } = E().antdIcons || {},
    { Text: G } = O,
    [P, B] = i([]),
    [N, A] = i("");
  g(() => {
    e && (B([]), A(""));
  }, [e]);
  const u = y(() => {
      if (!N.trim()) return n;
      const z = N.toLowerCase();
      return n.filter((S) => {
        var c, k;
        return (
          S.name.toLowerCase().includes(z) ||
          ((c = S.description) == null
            ? void 0
            : c.toLowerCase().includes(z)) ||
          ((k = S.tags) == null
            ? void 0
            : k.some((W) => W.toLowerCase().includes(z)))
        );
      });
    }, [n, N]),
    x = u.filter((z) => !l.includes(z.name)),
    _ = (z) => {
      B((S) => (S.includes(z) ? S.filter((c) => c !== z) : [...S, z]));
    },
    J = async () => {
      P.length !== 0 && (await r(P), B([]));
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
            alignItems: "center",
          },
        },
        s.createElement(
          G,
          { type: "secondary", style: { fontSize: 13 } },
          `已选择 ${P.length} 个技能`,
        ),
        s.createElement(
          "div",
          { style: { display: "flex", gap: 8 } },
          s.createElement($, { onClick: t }, "取消"),
          s.createElement(
            $,
            {
              type: "primary",
              onClick: J,
              disabled: P.length === 0,
            },
            P.length > 0 ? `添加 (${P.length})` : "添加",
          ),
        ),
      ),
    },
    // Search + bulk actions bar
    s.createElement(
      "div",
      {
        style: {
          marginBottom: 12,
          display: "flex",
          gap: 8,
          alignItems: "center",
        },
      },
      s.createElement(U, {
        placeholder: "搜索技能名称、描述或标签...",
        prefix: w ? s.createElement(w) : void 0,
        value: N,
        onChange: (z) => A(z.target.value),
        allowClear: !0,
        style: { flex: 1 },
      }),
      s.createElement(
        $,
        {
          size: "small",
          type: "primary",
          onClick: () => B(x.map((z) => z.name)),
        },
        "全选",
      ),
      s.createElement(
        $,
        {
          size: "small",
          onClick: () => B([]),
        },
        "清空",
      ),
    ),
    // Skill grid (card style matching Skill Center)
    a
      ? s.createElement(
          "div",
          { style: { textAlign: "center", padding: 40 } },
          s.createElement(h, { size: "large" }),
        )
      : u.length === 0
      ? s.createElement(b, {
          description: N ? "未找到匹配的技能" : "技能池暂无可用技能",
          image: b.PRESENTED_IMAGE_SIMPLE,
        })
      : s.createElement(
          "div",
          {
            style: {
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(145px, 1fr))",
              gap: 8,
              maxHeight: 360,
              overflowY: "auto",
              padding: 2,
            },
          },
          ...u.map((z) => {
            const S = P.includes(z.name),
              c = l.includes(z.name);
            return s.createElement(
              "div",
              {
                key: z.name,
                onClick: () => !c && _(z.name),
                style: {
                  position: "relative",
                  padding: "10px 12px",
                  border: `1px solid ${S ? "#0072f5" : "#e8e8e8"}`,
                  borderRadius: 6,
                  cursor: c ? "not-allowed" : "pointer",
                  transition: "all 0.15s ease",
                  background: S
                    ? "rgba(0, 114, 245, 0.06)"
                    : c
                    ? "#fafafa"
                    : "#fff",
                  opacity: c ? 0.5 : 1,
                  minHeight: 64,
                },
              },
              S
                ? s.createElement(
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
                        fontSize: 10,
                      },
                    },
                    H ? s.createElement(H) : "✓",
                  )
                : null,
              c
                ? s.createElement(
                    "span",
                    {
                      style: {
                        position: "absolute",
                        top: 6,
                        right: 8,
                        fontSize: 10,
                        color: "#bbb",
                      },
                    },
                    "已安装",
                  )
                : null,
              s.createElement(
                "div",
                {
                  style: {
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    marginBottom: 4,
                    paddingRight: c || S ? 24 : 0,
                  },
                },
                s.createElement(
                  "span",
                  { style: { fontSize: 16 } },
                  z.emoji || "⚡",
                ),
                s.createElement(
                  D,
                  { title: z.name },
                  s.createElement(
                    G,
                    {
                      strong: !0,
                      style: {
                        fontSize: 13,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      },
                    },
                    z.name,
                  ),
                ),
              ),
              z.description
                ? s.createElement(
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
                        lineHeight: "1.4",
                      },
                    },
                    z.description,
                  )
                : null,
              z.tags && z.tags.length > 0
                ? s.createElement(
                    "div",
                    {
                      style: {
                        marginTop: 4,
                        display: "flex",
                        gap: 2,
                        flexWrap: "wrap",
                      },
                    },
                    ...z.tags.slice(0, 2).map((k, W) =>
                      s.createElement(
                        M,
                        {
                          key: W,
                          color: "cyan",
                          style: { fontSize: 10, marginRight: 0 },
                        },
                        k,
                      ),
                    ),
                  )
                : null,
            );
          }),
        ),
  );
}
const Ue = {
    marginBottom: 4,
    fontSize: 13,
    fontWeight: 500,
    color: "rgba(0,0,0,0.85)",
    display: "flex",
    alignItems: "center",
    gap: 4,
  },
  zt = { marginBottom: 16 },
  It = {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "0 16px",
    marginBottom: 16,
  },
  Me = {
    fontSize: 13,
    fontWeight: 600,
    color: "rgba(0,0,0,0.85)",
    marginBottom: 12,
    paddingBottom: 8,
    borderBottom: "1px solid #f0f0f0",
  },
  _t = {
    fontSize: 12,
    color: "rgba(0,0,0,0.45)",
    marginLeft: 8,
  };
function un({ agentId: e }) {
  const t = E().React,
    { useState: n, useEffect: l, useCallback: a } = t,
    {
      Switch: r,
      InputNumber: s,
      Select: i,
      Button: g,
      Spin: y,
      Space: p,
      Typography: $,
      message: b,
    } = E().antd,
    { PlayCircleOutlined: h, SaveOutlined: U } = E().antdIcons || {},
    { Text: M } = $,
    [D, O] = n(!0),
    [H, w] = n(!1),
    [G, P] = n(!1),
    [B, N] = n(!1),
    [A, u] = n(6),
    [x, _] = n("h"),
    [J, z] = n("main"),
    [S, c] = n(300),
    [k, W] = n(!1),
    [Y, d] = n("08:00"),
    [I, q] = n("22:00"),
    o = a(async () => {
      var v, ne;
      O(!0);
      try {
        const f = await tn(e),
          se = Zt(f.every ?? "6h");
        N(f.enabled ?? !1),
          u(se.number),
          _(se.unit),
          z(f.target ?? "main"),
          c(f.timeoutSeconds ?? 300),
          W(!!f.activeHours),
          d(((v = f.activeHours) == null ? void 0 : v.start) ?? "08:00"),
          q(((ne = f.activeHours) == null ? void 0 : ne.end) ?? "22:00");
      } catch (f) {
        b.error(f.message || "加载心跳配置失败");
      } finally {
        O(!1);
      }
    }, [e]);
  l(() => {
    o();
  }, [o]);
  const ee = async () => {
      w(!0);
      try {
        await nn(e, {
          enabled: B,
          every: en({ number: A, unit: x }),
          target: J,
          timeoutSeconds: S,
          activeHours: k && Y && I ? { start: Y, end: I } : void 0,
        }),
          b.success("心跳配置已保存");
      } catch (v) {
        b.error(v.message || "保存心跳配置失败");
      } finally {
        w(!1);
      }
    },
    R = async () => {
      P(!0);
      try {
        await ln(e), b.success("已触发心跳检查");
      } catch (v) {
        b.error(v.message || "触发心跳失败");
      } finally {
        P(!1);
      }
    };
  if (D)
    return t.createElement(
      "div",
      { style: { textAlign: "center", padding: 40 } },
      t.createElement(y, { size: "large" }),
    );
  const te = (v, ne, f) =>
      t.createElement(
        "div",
        { style: zt },
        t.createElement("div", { style: Ue }, v),
        ne,
        f ? t.createElement(M, { type: "secondary", style: _t }, f) : null,
      ),
    ae = (v, ne, f, se) =>
      t.createElement(
        "div",
        { style: It },
        t.createElement(
          "div",
          null,
          t.createElement("div", { style: Ue }, v),
          ne,
        ),
        t.createElement(
          "div",
          null,
          t.createElement("div", { style: Ue }, f),
          se,
        ),
      ),
    { Divider: T } = E().antd;
  return t.createElement(
    "div",
    { style: { paddingBottom: 8 } },
    // ── Section: 基本设置 ──
    t.createElement("div", { style: Me }, "基本设置"),
    te(
      "启用心跳",
      t.createElement(r, {
        checked: B,
        onChange: (v) => N(v),
      }),
      B ? "已启用，专家将定期自检" : "已停用",
    ),
    ae(
      "检查频率",
      t.createElement(
        p,
        null,
        t.createElement(s, {
          min: 1,
          value: A,
          onChange: (v) => u(v ?? 1),
          style: { width: "100%" },
        }),
        t.createElement(i, {
          value: x,
          onChange: (v) => _(v),
          style: { width: 90 },
          options: [
            { value: "m", label: "分钟" },
            { value: "h", label: "小时" },
          ],
        }),
      ),
      "心跳目标",
      t.createElement(i, {
        value: J,
        onChange: (v) => z(v),
        style: { width: "100%" },
        options: [
          { value: "main", label: "主会话 (main)" },
          { value: "last", label: "最近会话 (last)" },
          { value: "inbox", label: "收件箱 (inbox)" },
        ],
      }),
    ),
    te(
      "超时时间 (秒)",
      t.createElement(s, {
        min: 1,
        max: 3600,
        value: S,
        onChange: (v) => c(v ?? 300),
        style: { width: 200 },
      }),
    ),
    // ── Section: 活跃时段 ──
    t.createElement(T, { style: { margin: "8px 0 16px" } }),
    t.createElement("div", { style: Me }, "活跃时段"),
    te(
      "启用活跃时段限制",
      t.createElement(r, {
        checked: k,
        onChange: (v) => W(v),
      }),
      "仅在指定时段内触发心跳",
    ),
    k
      ? ae(
          "开始时间",
          t.createElement("input", {
            type: "time",
            value: Y,
            onChange: (v) => d(v.target.value),
            style: {
              width: "100%",
              padding: "4px 11px",
              borderRadius: 6,
              border: "1px solid #d9d9d9",
              fontSize: 14,
            },
          }),
          "结束时间",
          t.createElement("input", {
            type: "time",
            value: I,
            onChange: (v) => q(v.target.value),
            style: {
              width: "100%",
              padding: "4px 11px",
              borderRadius: 6,
              border: "1px solid #d9d9d9",
              fontSize: 14,
            },
          }),
        )
      : null,
    // ── Action buttons ──
    t.createElement(
      "div",
      {
        style: {
          display: "flex",
          justifyContent: "flex-end",
          marginTop: 16,
          gap: 8,
        },
      },
      t.createElement(
        g,
        {
          type: "primary",
          icon: U ? t.createElement(U) : void 0,
          loading: H,
          onClick: ee,
          style: Pe,
        },
        "保存配置",
      ),
      t.createElement(
        g,
        {
          icon: h ? t.createElement(h) : void 0,
          loading: G,
          onClick: R,
        },
        "立即执行",
      ),
    ),
  );
}
function pn({ agentId: e, onRefresh: t }) {
  const n = E().React,
    { useState: l, useEffect: a, useCallback: r } = n,
    {
      List: s,
      Tag: i,
      Switch: g,
      Button: y,
      Empty: p,
      Spin: $,
      Typography: b,
      message: h,
    } = E().antd,
    {
      PlusOutlined: U,
      ReloadOutlined: M,
      DeleteOutlined: D,
    } = E().antdIcons || {},
    { Text: O, Paragraph: H } = b,
    [w, G] = l([]),
    [P, B] = l(!0),
    [N, A] = l(!1),
    [u, x] = l([]),
    [_, J] = l(!1),
    z = r(async () => {
      B(!0);
      try {
        const d = await ot(e);
        G(d);
      } catch (d) {
        h.error(d.message || "加载技能失败"), G([]);
      } finally {
        B(!1);
      }
    }, [e]);
  a(() => {
    z();
  }, [z]);
  const S = async () => {
      A(!0), J(!0);
      try {
        const d = await it();
        x(d);
      } catch (d) {
        h.error(d.message || "加载技能池失败");
      } finally {
        J(!1);
      }
    },
    c = async (d) => {
      let I = 0,
        q = 0;
      for (const o of d)
        try {
          await wt(e, o), I++;
        } catch {
          q++;
        }
      I > 0
        ? (h.success(`成功添加 ${I} 个技能${q > 0 ? `，${q} 个失败` : ""}`),
          z(),
          t())
        : q > 0 && h.error("添加技能失败"),
        A(!1);
    },
    k = async (d, I) => {
      try {
        I ? await Jt(e, d.name) : await Qt(e, d.name),
          h.success(I ? "已启用" : "已停用"),
          z(),
          t();
      } catch (q) {
        h.error(q.message || "操作失败");
      }
    },
    W = async (d) => {
      try {
        await xt(e, d), h.success(`技能「${d}」已移除`), z(), t();
      } catch (I) {
        h.error(I.message || "移除技能失败");
      }
    };
  if (P)
    return n.createElement(
      "div",
      { style: { textAlign: "center", padding: 40 } },
      n.createElement($, { size: "large" }),
    );
  const Y = w.filter((d) => d.enabled !== !1);
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
          marginBottom: 12,
        },
      },
      n.createElement(
        O,
        { strong: !0 },
        `技能列表 (${w.length}，已启用 ${Y.length})`,
      ),
      n.createElement(
        "div",
        { style: { display: "flex", gap: 8 } },
        n.createElement(
          y,
          {
            size: "small",
            icon: M ? n.createElement(M) : void 0,
            onClick: z,
          },
          "刷新",
        ),
        n.createElement(
          y,
          {
            type: "primary",
            size: "small",
            icon: U ? n.createElement(U) : void 0,
            onClick: S,
            style: Pe,
          },
          "从技能池添加",
        ),
      ),
    ),
    w.length === 0
      ? n.createElement(p, {
          description: "该专家暂无技能",
          image: p.PRESENTED_IMAGE_SIMPLE,
        })
      : n.createElement(s, {
          dataSource: w,
          renderItem: (d) =>
            n.createElement(
              s.Item,
              {
                actions: [
                  n.createElement(g, {
                    key: "toggle",
                    size: "small",
                    checked: d.enabled !== !1,
                    onChange: (I) => k(d, I),
                  }),
                  n.createElement(
                    y,
                    {
                      key: "del",
                      type: "link",
                      size: "small",
                      danger: !0,
                      icon: D ? n.createElement(D) : void 0,
                      onClick: () => W(d.name),
                    },
                    "移除",
                  ),
                ],
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
                      marginBottom: 4,
                    },
                  },
                  d.emoji
                    ? n.createElement(
                        "span",
                        { style: { fontSize: 16 } },
                        d.emoji,
                      )
                    : null,
                  n.createElement(O, { strong: !0 }, d.name),
                  d.version_text
                    ? n.createElement(
                        i,
                        { style: { fontSize: 10 } },
                        `v${d.version_text}`,
                      )
                    : null,
                ),
                d.description
                  ? n.createElement(
                      H,
                      {
                        type: "secondary",
                        style: { fontSize: 12, margin: 0 },
                        ellipsis: { rows: 2 },
                      },
                      d.description,
                    )
                  : null,
              ),
            ),
        }),
    n.createElement(Tt, {
      open: N,
      onClose: () => A(!1),
      poolSkills: u,
      installedSkillNames: w.map((d) => d.name),
      loading: _,
      onInstall: c,
    }),
  );
}
function gn({ agentId: e, onRefresh: t }) {
  const n = E().React,
    { useState: l, useEffect: a, useCallback: r } = n,
    {
      List: s,
      Tag: i,
      Button: g,
      Empty: y,
      Spin: p,
      Modal: $,
      Input: b,
      Typography: h,
      message: U,
    } = E().antd,
    {
      PlusOutlined: M,
      ReloadOutlined: D,
      DeleteOutlined: O,
    } = E().antdIcons || {},
    { Text: H, Paragraph: w } = h,
    { TextArea: G } = b,
    [P, B] = l([]),
    [N, A] = l(!0),
    [u, x] = l(!1),
    [_, J] = l(`{
  "mcpServers": {
    "example-client": {
      "command": "npx",
      "args": ["-y", "@example/mcp-server"],
      "env": {}
    }
  }
}`),
    [z, S] = l(!1),
    c = r(async () => {
      A(!0);
      try {
        const d = await Ct(e);
        B(d);
      } catch (d) {
        U.error(d.message || "加载 MCP 失败"), B([]);
      } finally {
        A(!1);
      }
    }, [e]);
  a(() => {
    c();
  }, [c]);
  const k = async (d) => {
      try {
        await Yt(e, d), U.success("已切换 MCP 状态"), c(), t();
      } catch (I) {
        U.error(I.message || "切换失败");
      }
    },
    W = async (d) => {
      try {
        await kt(e, d), U.success(`MCP「${d}」已移除`), c(), t();
      } catch (I) {
        U.error(I.message || "移除 MCP 失败");
      }
    },
    Y = async () => {
      S(!0);
      try {
        const d = JSON.parse(_),
          I = d.mcpServers || d,
          q = Object.entries(I);
        if (q.length === 0) {
          U.warning("未找到 MCP 客户端配置");
          return;
        }
        for (const [o, ee] of q) {
          const R = ee,
            te = R.url ? "streamable_http" : "stdio";
          await qt(e, {
            client_key: o,
            client: {
              name: R.name || o,
              description: R.description || "",
              enabled: !0,
              transport: te,
              url: R.url || "",
              command: R.command || "",
              args: R.args || [],
              env: R.env || {},
              cwd: R.cwd || "",
              headers: R.headers || {},
            },
          });
        }
        U.success("MCP 客户端已创建"), x(!1), c(), t();
      } catch (d) {
        d instanceof SyntaxError
          ? U.error("JSON 格式错误：" + d.message)
          : U.error(d.message || "创建 MCP 失败");
      } finally {
        S(!1);
      }
    };
  return N
    ? n.createElement(
        "div",
        { style: { textAlign: "center", padding: 40 } },
        n.createElement(p, { size: "large" }),
      )
    : n.createElement(
        "div",
        null,
        n.createElement(
          "div",
          {
            style: {
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 12,
            },
          },
          n.createElement(H, { strong: !0 }, `MCP 客户端 (${P.length})`),
          n.createElement(
            "div",
            { style: { display: "flex", gap: 8 } },
            n.createElement(
              g,
              {
                size: "small",
                icon: D ? n.createElement(D) : void 0,
                onClick: c,
              },
              "刷新",
            ),
            n.createElement(
              g,
              {
                type: "primary",
                size: "small",
                icon: M ? n.createElement(M) : void 0,
                onClick: () => x(!0),
                style: Pe,
              },
              "添加 MCP",
            ),
          ),
        ),
        P.length === 0
          ? n.createElement(y, {
              description: "该专家暂无 MCP 客户端",
              image: y.PRESENTED_IMAGE_SIMPLE,
            })
          : n.createElement(s, {
              dataSource: P,
              renderItem: (d) =>
                n.createElement(
                  s.Item,
                  {
                    actions: [
                      n.createElement(
                        g,
                        {
                          key: "toggle",
                          size: "small",
                          onClick: () => k(d.key),
                        },
                        d.enabled ? "停用" : "启用",
                      ),
                      n.createElement(
                        g,
                        {
                          key: "del",
                          type: "link",
                          size: "small",
                          danger: !0,
                          icon: O ? n.createElement(O) : void 0,
                          onClick: () => W(d.key),
                        },
                        "移除",
                      ),
                    ],
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
                          marginBottom: 4,
                        },
                      },
                      n.createElement(
                        "span",
                        { style: { fontSize: 14 } },
                        "🔌",
                      ),
                      n.createElement(H, { strong: !0 }, d.name || d.key),
                      n.createElement(
                        i,
                        {
                          color: d.enabled ? "green" : "default",
                          style: { fontSize: 10 },
                        },
                        d.enabled ? "启用" : "停用",
                      ),
                      n.createElement(
                        i,
                        { color: "purple", style: { fontSize: 10 } },
                        d.transport,
                      ),
                    ),
                    d.description
                      ? n.createElement(
                          w,
                          {
                            type: "secondary",
                            style: { fontSize: 12, margin: 0 },
                            ellipsis: { rows: 2 },
                          },
                          d.description,
                        )
                      : null,
                    d.tools && d.tools.length > 0
                      ? n.createElement(
                          "div",
                          {
                            style: {
                              marginTop: 4,
                              fontSize: 11,
                              color: "#8c8c8c",
                            },
                          },
                          `提供 ${d.tools.length} 个工具`,
                        )
                      : null,
                  ),
                ),
            }),
        // Create MCP modal
        n.createElement(
          $,
          {
            open: u,
            title: "添加 MCP 客户端 (JSON)",
            onCancel: () => x(!1),
            onOk: Y,
            confirmLoading: z,
            okText: "创建",
            width: 560,
          },
          n.createElement(
            "div",
            { style: { marginBottom: 8, fontSize: 12, color: "#8c8c8c" } },
            "粘贴 MCP 配置 JSON（支持 mcpServers 格式），将创建到当前专家工作区：",
          ),
          n.createElement(G, {
            value: _,
            onChange: (d) => J(d.target.value),
            rows: 12,
            style: { fontFamily: "monospace", fontSize: 12 },
          }),
        ),
      );
}
function yn({ agentId: e }) {
  const t = E().React,
    { useState: n, useEffect: l, useCallback: a, useRef: r } = t,
    {
      Card: s,
      InputNumber: i,
      Input: g,
      Select: y,
      Switch: p,
      Button: $,
      Spin: b,
      Space: h,
      Typography: U,
      Divider: M,
      message: D,
    } = E().antd,
    { SaveOutlined: O } = E().antdIcons || {},
    { Text: H } = U,
    [w, G] = n(!0),
    [P, B] = n(!1),
    N = r(null),
    [A, u] = n(60),
    [x, _] = n(""),
    [J, z] = n(!0),
    [S, c] = n(30),
    [k, W] = n("zh"),
    [Y, d] = n("UTC"),
    [I, q] = n(!0),
    [o, ee] = n(100),
    [R, te] = n(!0),
    [ae, T] = n(3),
    [v, ne] = n(1),
    [f, se] = n(!0),
    [re, he] = n(3),
    [ve, F] = n(2),
    [L, le] = n(60),
    [K, Ee] = n(1),
    [ye, oe] = n(0),
    [ze, Oe] = n(1),
    [V, C] = n(0),
    [Q, ie] = n(30),
    [pe, fe] = n(50),
    [$e, Ae] = n("light"),
    [Fe, He] = n("scroll"),
    [Je, We] = n("remelight"),
    [Ce, Ge] = n("AUTO"),
    Le = a(async () => {
      var j, be, Se, we, Be, Re;
      G(!0);
      try {
        const [ue, Ze, et] = await Promise.all([
          an(e),
          sn(e).catch(() => "zh"),
          cn().catch(() => "UTC"),
        ]);
        (N.current = ue),
          u(ue.shell_command_timeout ?? 60),
          _(ue.shell_command_executable ?? "");
        const Xe = ue.auto_title_config ?? { enabled: !0, timeout_seconds: 30 };
        z(Xe.enabled ?? !0), c(Xe.timeout_seconds ?? 30), W(Ze), d(et);
        const je = ue.loop ?? {};
        q(((j = je.iteration) == null ? void 0 : j.enabled) ?? !0),
          ee(
            ((be = je.iteration) == null ? void 0 : be.max_iterations) ??
              ue.max_iters ??
              100,
          ),
          te(((Se = je.doom_loop) == null ? void 0 : Se.enabled) ?? !0),
          T(((we = je.doom_loop) == null ? void 0 : we.window_size) ?? 3),
          ne(
            ((Be = je.doom_loop) == null ? void 0 : Be.similarity_threshold) ??
              1,
          ),
          se(ue.llm_retry_enabled ?? !0),
          he(ue.llm_max_retries ?? 3),
          F(ue.llm_backoff_base ?? 2),
          le(ue.llm_backoff_cap ?? 60),
          Ee(ue.llm_max_concurrent ?? 1),
          oe(ue.llm_max_qpm ?? 0),
          Oe(ue.llm_rate_limit_pause ?? 1),
          C(ue.llm_rate_limit_jitter ?? 0),
          ie(ue.llm_acquire_timeout ?? 30),
          fe(ue.history_max_length ?? 50),
          Ae(ue.context_manager_backend ?? "light"),
          He(
            ((Re = ue.light_context_config) == null ? void 0 : Re.strategy) ??
              "scroll",
          ),
          We(ue.memory_manager_backend ?? "remelight"),
          Ge(ue.approval_level ?? "AUTO");
      } catch (ue) {
        D.error(ue.message || "加载运行配置失败");
      } finally {
        G(!1);
      }
    }, [e]);
  l(() => {
    Le();
  }, [Le]);
  const De = async () => {
    var be, Se;
    const j = N.current;
    if (j) {
      B(!0);
      try {
        const we = {
          ...j,
          max_iters: o,
          loop: {
            ...(j.loop ?? {}),
            iteration: { enabled: I, max_iterations: o },
            doom_loop: {
              enabled: R,
              window_size: ae,
              similarity_threshold: v,
              stages:
                ((Se = (be = j.loop) == null ? void 0 : be.doom_loop) == null
                  ? void 0
                  : Se.stages) ?? [],
            },
          },
          shell_command_timeout: A,
          shell_command_executable: x,
          auto_title_config: {
            enabled: J,
            timeout_seconds: S,
          },
          llm_retry_enabled: f,
          llm_max_retries: re,
          llm_backoff_base: ve,
          llm_backoff_cap: L,
          llm_max_concurrent: K,
          llm_max_qpm: ye,
          llm_rate_limit_pause: ze,
          llm_rate_limit_jitter: V,
          llm_acquire_timeout: Q,
          history_max_length: pe,
          context_manager_backend: $e,
          light_context_config: {
            ...(j.light_context_config ?? {}),
            strategy: Fe,
          },
          memory_manager_backend: Je,
          approval_level: Ce,
        };
        await rn(e, we),
          (N.current = we),
          k && (await on(e, k).catch(() => {})),
          Y && (await mn(Y).catch(() => {})),
          D.success("运行配置已保存");
      } catch (we) {
        D.error(we.message || "保存运行配置失败");
      } finally {
        B(!1);
      }
    }
  };
  if (w)
    return t.createElement(
      "div",
      { style: { textAlign: "center", padding: 40 } },
      t.createElement(b, { size: "large" }),
    );
  const ke = (j, be, Se) =>
      t.createElement(
        "div",
        { style: zt },
        t.createElement("div", { style: Ue }, j),
        be,
        Se ? t.createElement(H, { type: "secondary", style: _t }, Se) : null,
      ),
    Ie = (j, be, Se, we) =>
      t.createElement(
        "div",
        { style: It },
        t.createElement(
          "div",
          null,
          t.createElement("div", { style: Ue }, j),
          be,
        ),
        t.createElement(
          "div",
          null,
          t.createElement("div", { style: Ue }, Se),
          we,
        ),
      );
  return t.createElement(
    "div",
    { style: { paddingBottom: 8 } },
    // ── Section: 基础设置 ──
    t.createElement("div", { style: Me }, "基础设置"),
    Ie(
      "Shell 命令超时 (秒)",
      t.createElement(i, {
        min: 1,
        value: A,
        onChange: (j) => u(j ?? 60),
        style: { width: "100%" },
      }),
      "Shell 可执行文件",
      t.createElement(g, {
        value: x,
        onChange: (j) => _(j.target.value),
        placeholder: "留空使用系统默认",
        style: { width: "100%" },
      }),
    ),
    Ie(
      "语言",
      t.createElement(y, {
        value: k,
        onChange: (j) => W(j),
        style: { width: "100%" },
        options: [
          { value: "zh", label: "中文" },
          { value: "en", label: "English" },
          { value: "id", label: "Bahasa Indonesia" },
          { value: "ru", label: "Русский" },
        ],
      }),
      "时区",
      t.createElement(y, {
        value: Y,
        onChange: (j) => d(j),
        style: { width: "100%" },
        showSearch: !0,
        filterOption: (j, be) => {
          var Se;
          return (
            ((Se = be == null ? void 0 : be.label) == null
              ? void 0
              : Se.toString()) || ""
          )
            .toLowerCase()
            .includes(j.toLowerCase());
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
          "Australia/Sydney",
        ].map((j) => ({ value: j, label: j })),
      }),
    ),
    Ie(
      "自动生成会话标题",
      t.createElement(
        h,
        null,
        t.createElement(p, {
          checked: J,
          onChange: (j) => z(j),
        }),
      ),
      "标题生成超时 (秒)",
      t.createElement(i, {
        min: 5,
        value: S,
        onChange: (j) => c(j ?? 30),
        style: { width: "100%" },
        disabled: !J,
      }),
    ),
    // ── Section: 审批级别 ──
    t.createElement(M, { style: { margin: "8px 0 16px" } }),
    t.createElement("div", { style: Me }, "审批级别"),
    ke(
      "工具执行审批",
      t.createElement(y, {
        value: Ce,
        onChange: (j) => Ge(j),
        style: { width: "100%" },
        options: [
          { value: "STRICT", label: "严格 (STRICT) — 每次工具调用需审批" },
          { value: "SMART", label: "智能 (SMART) — 高风险操作需审批" },
          { value: "AUTO", label: "自动 (AUTO) — 自动执行" },
          { value: "OFF", label: "关闭 (OFF) — 无限制" },
        ],
      }),
    ),
    // ── Section: 迭代与循环 ──
    t.createElement(M, { style: { margin: "8px 0 16px" } }),
    t.createElement("div", { style: Me }, "迭代与循环"),
    ke(
      "启用迭代限制",
      t.createElement(p, {
        checked: I,
        onChange: (j) => q(j),
      }),
      "停止 Agent 前的最大循环轮次",
    ),
    I
      ? ke(
          "最大迭代次数",
          t.createElement(i, {
            min: 1,
            max: 500,
            value: o,
            onChange: (j) => ee(j ?? 100),
            style: { width: "100%" },
          }),
        )
      : null,
    ke(
      "启用重复循环保护",
      t.createElement(p, {
        checked: R,
        onChange: (j) => te(j),
      }),
      "检测并阻止重复操作循环",
    ),
    R
      ? Ie(
          "检测窗口大小",
          t.createElement(i, {
            min: 2,
            max: 20,
            value: ae,
            onChange: (j) => T(j ?? 3),
            style: { width: "100%" },
          }),
          "相似度阈值",
          t.createElement(i, {
            min: 0,
            max: 1,
            step: 0.05,
            value: v,
            onChange: (j) => ne(j ?? 1),
            style: { width: "100%" },
          }),
        )
      : null,
    // ── Section: LLM 重试 ──
    t.createElement(M, { style: { margin: "8px 0 16px" } }),
    t.createElement("div", { style: Me }, "LLM 重试"),
    ke(
      "启用 LLM 重试",
      t.createElement(p, {
        checked: f,
        onChange: (j) => se(j),
      }),
    ),
    Ie(
      "最大重试次数",
      t.createElement(i, {
        min: 1,
        value: re,
        onChange: (j) => he(j ?? 3),
        style: { width: "100%" },
        disabled: !f,
      }),
      "退避基数 (秒)",
      t.createElement(i, {
        min: 0.1,
        step: 0.1,
        value: ve,
        onChange: (j) => F(j ?? 2),
        style: { width: "100%" },
        disabled: !f,
      }),
    ),
    ke(
      "退避上限 (秒)",
      t.createElement(i, {
        min: 0.5,
        step: 0.5,
        value: L,
        onChange: (j) => le(j ?? 60),
        style: { width: 200 },
        disabled: !f,
      }),
    ),
    // ── Section: LLM 限流 ──
    t.createElement(M, { style: { margin: "8px 0 16px" } }),
    t.createElement("div", { style: Me }, "LLM 限流"),
    Ie(
      "最大并发数",
      t.createElement(i, {
        min: 1,
        value: K,
        onChange: (j) => Ee(j ?? 1),
        style: { width: "100%" },
      }),
      "最大 QPM (0=不限)",
      t.createElement(i, {
        min: 0,
        step: 10,
        value: ye,
        onChange: (j) => oe(j ?? 0),
        style: { width: "100%" },
      }),
    ),
    Ie(
      "限流暂停时间 (秒)",
      t.createElement(i, {
        min: 1,
        step: 0.5,
        value: ze,
        onChange: (j) => Oe(j ?? 1),
        style: { width: "100%" },
      }),
      "限流抖动 (秒)",
      t.createElement(i, {
        min: 0,
        step: 0.5,
        value: V,
        onChange: (j) => C(j ?? 0),
        style: { width: "100%" },
      }),
    ),
    ke(
      "获取超时 (秒)",
      t.createElement(i, {
        min: 10,
        step: 10,
        value: Q,
        onChange: (j) => ie(j ?? 30),
        style: { width: 200 },
      }),
      "应大于 限流暂停 + 抖动",
    ),
    // ── Section: 上下文与记忆 ──
    t.createElement(M, { style: { margin: "8px 0 16px" } }),
    t.createElement("div", { style: Me }, "上下文与记忆"),
    Ie(
      "上下文管理后端",
      t.createElement(y, {
        value: $e,
        onChange: (j) => Ae(j),
        style: { width: "100%" },
        options: [{ value: "light", label: "light" }],
      }),
      "上下文策略",
      t.createElement(y, {
        value: Fe,
        onChange: (j) => He(j),
        style: { width: "100%" },
        options: [
          { value: "scroll", label: "scroll (滚动窗口)" },
          { value: "native", label: "native (原生)" },
        ],
      }),
    ),
    Ie(
      "记忆管理后端",
      t.createElement(y, {
        value: Je,
        onChange: (j) => We(j),
        style: { width: "100%" },
        options: [
          { value: "remelight", label: "remelight" },
          { value: "adbpg", label: "adbpg" },
          { value: "none", label: "none (禁用)" },
        ],
      }),
      "历史消息最大长度",
      t.createElement(i, {
        min: 1,
        value: pe,
        onChange: (j) => fe(j ?? 50),
        style: { width: "100%" },
      }),
    ),
    // ── Save button ──
    t.createElement(
      "div",
      { style: { display: "flex", justifyContent: "flex-end", marginTop: 16 } },
      t.createElement(
        $,
        {
          type: "primary",
          icon: O ? t.createElement(O) : void 0,
          loading: P,
          onClick: De,
          style: Pe,
        },
        "保存运行配置",
      ),
    ),
  );
}
function fn({ expert: e, open: t, onClose: n, onRefresh: l }) {
  const a = E().React,
    { useState: r, useEffect: s, useCallback: i } = a,
    { Modal: g, Tabs: y, Spin: p, Typography: $ } = E().antd,
    { SettingOutlined: b } = E().antdIcons || {},
    { Text: h } = $,
    [U, M] = r([]),
    [D, O] = r(!1),
    [H, w] = r("heartbeat"),
    G = i(async () => {
      if (e) {
        O(!0);
        try {
          const A = await dn(e.agent.id);
          M(A);
        } catch {
          M([]);
        } finally {
          O(!1);
        }
      }
    }, [e]);
  if (
    (s(() => {
      t && e && G();
    }, [t, e, G]),
    !e)
  )
    return null;
  const { agent: P } = e,
    B = () => {
      G(), l();
    },
    N = [
      {
        key: "heartbeat",
        label: "心跳",
        children: a.createElement(un, {
          agentId: P.id,
        }),
      },
      {
        key: "files",
        label: "文件",
        children: D
          ? a.createElement(
              "div",
              { style: { textAlign: "center", padding: 40 } },
              a.createElement(p, { size: "large" }),
            )
          : a.createElement(Pt, {
              agentId: P.id,
              systemPromptFiles: U,
              onRefresh: B,
            }),
      },
      {
        key: "skills",
        label: `技能 (${e.skills.filter((A) => A.enabled !== !1).length})`,
        children: a.createElement(pn, {
          agentId: P.id,
          onRefresh: l,
        }),
      },
      {
        key: "mcp",
        label: `MCP (${e.mcps.length})`,
        children: a.createElement(gn, {
          agentId: P.id,
          onRefresh: l,
        }),
      },
      {
        key: "running",
        label: "运行配置",
        children: a.createElement(yn, {
          agentId: P.id,
        }),
      },
    ];
  return a.createElement(
    g,
    {
      open: t,
      title: a.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 8 } },
        b ? a.createElement(b, { style: { fontSize: 18 } }) : null,
        a.createElement("span", null, `配置 - ${P.name}`),
        a.createElement(
          h,
          { type: "secondary", style: { fontSize: 12, fontWeight: 400 } },
          P.id,
        ),
      ),
      onCancel: n,
      footer: null,
      width: 800,
      centered: !0,
      styles: {
        body: {
          maxHeight: "70vh",
          overflowY: "auto",
          paddingTop: 0,
        },
      },
    },
    a.createElement(y, {
      items: N,
      activeKey: H,
      onChange: (A) => w(A),
      size: "small",
      tabBarStyle: { marginBottom: 16, sticky: 0 },
    }),
  );
}
function En({ expert: e, onClick: t, onSummon: n, onConfigure: l }) {
  const a = E().React,
    {
      Card: r,
      Tag: s,
      Badge: i,
      Typography: g,
      Spin: y,
      Button: p,
      Tooltip: $,
    } = E().antd,
    { Text: b } = g,
    { ThunderboltOutlined: h, SettingOutlined: U } = E().antdIcons || {},
    { agent: M, skills: D, mcps: O, loading: H } = e,
    w = M.enabled,
    G = D.filter((N) => N.enabled !== !1).map((N) => N.name),
    P = O.map((N) => N.name || N.key),
    B = M.active_model
      ? `${M.active_model.provider_id}/${M.active_model.model}`
      : null;
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
        flexDirection: "column",
      },
      bodyStyle: {
        display: "flex",
        flexDirection: "column",
        height: "100%",
        flex: 1,
      },
    },
    a.createElement(
      "div",
      {
        style: {
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 8,
        },
      },
      a.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 8 } },
        a.createElement("span", { style: { fontSize: 20 } }, "🧑‍🔬"),
        a.createElement(
          "div",
          null,
          a.createElement(b, { strong: !0, style: { fontSize: 15 } }, M.name),
          a.createElement(
            "div",
            {
              style: {
                fontSize: 11,
                color: "#bfbfbf",
                fontFamily: "monospace",
              },
            },
            M.id,
          ),
        ),
      ),
      a.createElement(i, {
        status: w ? "success" : "default",
        text: w ? "启用" : "停用",
      }),
    ),
    // Description (rendered as markdown)
    M.description
      ? a.createElement(
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
              flex: "1 0 auto",
            },
          },
          ct(M.description, a),
        )
      : a.createElement(
          "div",
          {
            style: {
              fontSize: 12,
              color: "#bfbfbf",
              marginBottom: 10,
              minHeight: 54,
              flex: "1 0 auto",
            },
          },
          "暂无描述",
        ),
    // Model info
    B
      ? a.createElement(
          "div",
          { style: { marginBottom: 8 } },
          a.createElement(
            s,
            { color: "geekblue", style: { fontSize: 11 } },
            `🤖 ${B}`,
          ),
        )
      : null,
    // Skills
    H
      ? a.createElement(y, { size: "small" })
      : a.createElement(
          "div",
          { style: { marginBottom: 6 } },
          a.createElement(
            "div",
            { style: { fontSize: 11, color: "#8c8c8c", marginBottom: 4 } },
            `技能 (${G.length})`,
          ),
          a.createElement(pt, {
            items: G,
            max: 4,
            color: "cyan",
            emptyText: "未配置技能",
          }),
        ),
    // MCP
    !H && P.length > 0
      ? a.createElement(
          "div",
          { style: { marginTop: "auto" } },
          a.createElement(
            "div",
            { style: { fontSize: 11, color: "#8c8c8c", marginBottom: 4 } },
            `MCP (${P.length})`,
          ),
          a.createElement(pt, {
            items: P,
            max: 3,
            color: "purple",
          }),
        )
      : null,
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
          borderTop: "1px solid #f0f0f0",
        },
      },
      // Gear icon (bottom-left) — opens configuration modal
      a.createElement(
        $,
        { title: "配置专家", placement: "top" },
        a.createElement(p, {
          type: "text",
          size: "small",
          icon: U
            ? a.createElement(U, {
                style: { fontSize: 16, color: "#8c8c8c" },
              })
            : void 0,
          onClick: (N) => {
            N.stopPropagation(), l && l();
          },
        }),
      ),
      // Summon button (bottom-right)
      a.createElement(
        p,
        {
          type: "primary",
          size: "small",
          icon: h ? a.createElement(h) : void 0,
          disabled: !w,
          onClick: (N) => {
            N.stopPropagation(), n && n();
          },
          style: Pe,
        },
        "召唤专家",
      ),
    ),
  );
}
function hn({ expert: e, open: t, onClose: n, onRefresh: l }) {
  const a = E().React,
    {
      Drawer: r,
      Descriptions: s,
      Tag: i,
      Typography: g,
      Space: y,
      Button: p,
      Empty: $,
      Tabs: b,
      List: h,
      Spin: U,
      Modal: M,
      message: D,
    } = E().antd,
    { Text: O, Paragraph: H } = g,
    {
      EditOutlined: w,
      ThunderboltOutlined: G,
      FileTextOutlined: P,
      ToolOutlined: B,
      PlusOutlined: N,
    } = E().antdIcons || {},
    [A, u] = a.useState(!1),
    [x, _] = a.useState([]),
    [J, z] = a.useState(!1);
  if (!e) return null;
  const { agent: S, config: c, skills: k, mcps: W, loading: Y } = e,
    d = k.filter((f) => f.enabled !== !1),
    I = (f) => {
      window.history.pushState({}, "", f),
        window.dispatchEvent(new PopStateEvent("popstate"));
    },
    q = a.createElement(
      "div",
      null,
      a.createElement(
        s,
        { column: 1, bordered: !0, size: "small" },
        a.createElement(s.Item, { label: "专家名称" }, S.name),
        a.createElement(
          s.Item,
          { label: "专家 ID" },
          a.createElement("code", { style: { fontSize: 12 } }, S.id),
        ),
        a.createElement(
          s.Item,
          { label: "状态" },
          a.createElement(
            i,
            { color: S.enabled ? "green" : "default" },
            S.enabled ? "启用" : "停用",
          ),
        ),
        a.createElement(
          s.Item,
          { label: "功能简介" },
          S.description ? ct(S.description, a) : "暂无描述",
        ),
        a.createElement(
          s.Item,
          { label: "使用模型" },
          S.active_model
            ? `${S.active_model.provider_id} / ${S.active_model.model}`
            : "使用全局默认模型",
        ),
        c != null && c.workspace_dir
          ? a.createElement(
              s.Item,
              { label: "工作区路径" },
              a.createElement(
                "code",
                { style: { fontSize: 11 } },
                c.workspace_dir,
              ),
            )
          : null,
        c != null && c.approval_level
          ? a.createElement(s.Item, { label: "审批级别" }, c.approval_level)
          : null,
      ),
      // System prompt files
      c != null && c.system_prompt_files && c.system_prompt_files.length > 0
        ? a.createElement(
            "div",
            { style: { marginTop: 16 } },
            a.createElement(
              "div",
              {
                style: {
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  marginBottom: 8,
                },
              },
              P
                ? a.createElement(P, {
                    style: { fontSize: 14, color: "#1677ff" },
                  })
                : null,
              a.createElement(O, { strong: !0 }, "系统提示词文件"),
            ),
            a.createElement(
              y,
              { wrap: !0 },
              ...c.system_prompt_files.map((f, se) =>
                a.createElement(
                  i,
                  {
                    key: se,
                    icon: P ? a.createElement(P) : void 0,
                    style: { fontSize: 12 },
                  },
                  f,
                ),
              ),
            ),
          )
        : null,
    ),
    o = async () => {
      u(!0), z(!0);
      try {
        const f = await it();
        _(f);
      } catch (f) {
        D.error(f.message || "加载技能池失败");
      } finally {
        z(!1);
      }
    },
    ee = async (f) => {
      let se = 0,
        re = 0;
      for (const he of f)
        try {
          await wt(S.id, he), se++;
        } catch {
          re++;
        }
      se > 0
        ? (D.success(`成功添加 ${se} 个技能${re > 0 ? `，${re} 个失败` : ""}`),
          l())
        : re > 0 && D.error("添加技能失败"),
        u(!1);
    },
    R = async (f) => {
      try {
        await xt(S.id, f), D.success(`技能「${f}」已移除`), l();
      } catch (se) {
        D.error(se.message || "移除技能失败");
      }
    },
    te = async (f) => {
      try {
        await kt(S.id, f), D.success(`MCP「${f}」已移除`), l();
      } catch (se) {
        D.error(se.message || "移除 MCP 失败");
      }
    },
    ae = Y
      ? a.createElement(
          "div",
          { style: { textAlign: "center", padding: 40 } },
          a.createElement(U, { size: "large" }),
        )
      : a.createElement(
          "div",
          null,
          a.createElement(
            "div",
            {
              style: {
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 12,
              },
            },
            a.createElement(O, { strong: !0 }, `已启用技能 (${d.length})`),
            a.createElement(
              p,
              {
                type: "primary",
                size: "small",
                icon: N ? a.createElement(N) : void 0,
                onClick: o,
              },
              "从技能池添加",
            ),
          ),
          d.length === 0
            ? a.createElement($, {
                description: "该专家暂无已启用的技能",
                image: $.PRESENTED_IMAGE_SIMPLE,
              })
            : a.createElement(h, {
                dataSource: d,
                renderItem: (f) =>
                  a.createElement(
                    h.Item,
                    {
                      actions: [
                        a.createElement(
                          p,
                          {
                            type: "link",
                            size: "small",
                            danger: !0,
                            onClick: () => R(f.name),
                          },
                          "移除",
                        ),
                      ],
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
                            marginBottom: 4,
                          },
                        },
                        f.emoji
                          ? a.createElement(
                              "span",
                              { style: { fontSize: 16 } },
                              f.emoji,
                            )
                          : null,
                        a.createElement(O, { strong: !0 }, f.name),
                        f.version_text
                          ? a.createElement(
                              i,
                              { style: { fontSize: 10 } },
                              `v${f.version_text}`,
                            )
                          : null,
                      ),
                      f.description
                        ? a.createElement(
                            H,
                            {
                              type: "secondary",
                              style: { fontSize: 12, margin: 0 },
                              ellipsis: { rows: 2 },
                            },
                            f.description,
                          )
                        : null,
                      f.tags && f.tags.length > 0
                        ? a.createElement(
                            "div",
                            { style: { marginTop: 4 } },
                            ...f.tags.map((se, re) =>
                              a.createElement(
                                i,
                                {
                                  key: re,
                                  color: "cyan",
                                  style: { fontSize: 10 },
                                },
                                se,
                              ),
                            ),
                          )
                        : null,
                    ),
                  ),
              }),
          // Skill Picker Modal (card-grid style, consistent with Skill Center)
          a.createElement(Tt, {
            open: A,
            onClose: () => u(!1),
            poolSkills: x,
            installedSkillNames: d.map((f) => f.name),
            loading: J,
            onInstall: ee,
          }),
        ),
    T = Y
      ? a.createElement(
          "div",
          { style: { textAlign: "center", padding: 40 } },
          a.createElement(U, { size: "large" }),
        )
      : a.createElement(
          "div",
          null,
          a.createElement(
            "div",
            {
              style: {
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 12,
              },
            },
            a.createElement(O, { strong: !0 }, `MCP 客户端 (${W.length})`),
            a.createElement(
              p,
              {
                type: "primary",
                size: "small",
                icon: N ? a.createElement(N) : void 0,
                onClick: () => {
                  window.history.pushState({}, "", `/agents/${S.id}/mcp`),
                    window.dispatchEvent(new PopStateEvent("popstate"));
                },
              },
              "配置 MCP",
            ),
          ),
          W.length === 0
            ? a.createElement($, {
                description:
                  "该专家暂无关联的 MCP 客户端，点击「配置 MCP」添加",
                image: $.PRESENTED_IMAGE_SIMPLE,
              })
            : a.createElement(h, {
                dataSource: W,
                renderItem: (f) =>
                  a.createElement(
                    h.Item,
                    {
                      actions: [
                        a.createElement(
                          p,
                          {
                            type: "link",
                            size: "small",
                            danger: !0,
                            onClick: () => te(f.key),
                          },
                          "移除",
                        ),
                      ],
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
                            marginBottom: 4,
                          },
                        },
                        a.createElement(
                          "span",
                          { style: { fontSize: 14 } },
                          "🔌",
                        ),
                        a.createElement(O, { strong: !0 }, f.name || f.key),
                        a.createElement(
                          i,
                          {
                            color: f.enabled ? "green" : "default",
                            style: { fontSize: 10 },
                          },
                          f.enabled ? "启用" : "停用",
                        ),
                        a.createElement(
                          i,
                          { color: "purple", style: { fontSize: 10 } },
                          f.transport,
                        ),
                      ),
                      f.description
                        ? a.createElement(
                            H,
                            {
                              type: "secondary",
                              style: { fontSize: 12, margin: 0 },
                              ellipsis: { rows: 2 },
                            },
                            f.description,
                          )
                        : null,
                      f.tools && f.tools.length > 0
                        ? a.createElement(
                            "div",
                            {
                              style: {
                                marginTop: 4,
                                fontSize: 11,
                                color: "#8c8c8c",
                              },
                            },
                            `提供 ${f.tools.length} 个工具`,
                          )
                        : null,
                    ),
                  ),
              }),
        ),
    v =
      c != null && c.tools
        ? a.createElement(
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
                    marginBottom: 8,
                  },
                },
                B
                  ? a.createElement(B, {
                      style: { fontSize: 14, color: "#1677ff" },
                    })
                  : null,
                a.createElement(O, { strong: !0 }, "工具配置"),
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
                    maxHeight: 300,
                  },
                },
                JSON.stringify(c.tools, null, 2),
              ),
            ),
          )
        : a.createElement($, {
            description: "暂无工具配置",
            image: $.PRESENTED_IMAGE_SIMPLE,
          }),
    ne = [
      { key: "basic", label: "基本信息", children: q },
      {
        key: "skills",
        label: `技能 (${d.length})`,
        children: ae,
      },
      {
        key: "prompts",
        label: "推荐提问",
        children: a.createElement(Sn, {
          skills: d,
          agentId: S.id,
        }),
      },
      {
        key: "knowledge",
        label: "专家记忆",
        children: a.createElement(Pt, {
          agentId: S.id,
          systemPromptFiles: (c == null ? void 0 : c.system_prompt_files) || [],
          onRefresh: () => l(),
        }),
      },
      { key: "mcp", label: `MCP (${W.length})`, children: T },
      { key: "tools", label: "工具配置", children: v },
    ];
  return a.createElement(
    r,
    {
      title: a.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 8 } },
        a.createElement("span", { style: { fontSize: 20 } }, "🧑‍🔬"),
        a.createElement("span", null, S.name),
      ),
      open: t,
      onClose: n,
      width: 560,
      extra: a.createElement(
        y,
        null,
        a.createElement(
          p,
          {
            size: "small",
            icon: w ? a.createElement(w) : void 0,
            onClick: () => I("/agents"),
          },
          "编辑专家",
        ),
        a.createElement(
          p,
          {
            type: "primary",
            size: "small",
            icon: G ? a.createElement(G) : void 0,
            onClick: () => {
              try {
                const f = E();
                f.setSelectedAgent && f.setSelectedAgent(S.id);
              } catch (f) {
                console.warn("[ugsci] Failed to set selected agent:", f);
              }
              I("/chat");
            },
          },
          "开始对话",
        ),
      ),
    },
    a.createElement(b, {
      items: ne,
      defaultActiveKey: "basic",
    }),
  );
}
function vn({ open: e, onClose: t, onCreated: n }) {
  const l = E().React,
    { useState: a } = l,
    {
      Modal: r,
      Card: s,
      Tag: i,
      Input: g,
      Row: y,
      Col: p,
      Spin: $,
      message: b,
      Typography: h,
    } = E().antd,
    { Text: U } = h,
    { FileAddOutlined: M } = E().antdIcons || {},
    [D, O] = a(!1),
    [H, w] = a(""),
    [G, P] = a(!1),
    B = async (u, x) => {
      O(!0);
      try {
        const _ = await Z("/agents", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: u || "新专家",
            description: x || "",
            skill_names: [],
          }),
        });
        await qe(
          _.id,
          "AGENTS.md",
          `# ${u || "新专家"}

请在此处编写该专家的系统提示词。
`,
        ),
          b.success("专家「" + (u || "新专家") + "」创建成功"),
          P(!1),
          t(),
          n();
      } catch (_) {
        b.error(_.message || "创建专家失败");
      } finally {
        O(!1);
      }
    },
    N = nt.filter((u) => {
      if (!H.trim()) return !0;
      const x = H.toLowerCase();
      return (
        u.name.toLowerCase().includes(x) ||
        u.description.toLowerCase().includes(x) ||
        u.category.toLowerCase().includes(x)
      );
    }),
    A = async (u) => {
      O(!0);
      try {
        const x = await Z("/agents", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: u.name,
            description: u.description,
            skill_names: u.recommendedSkills,
          }),
        });
        await qe(x.id, "AGENTS.md", u.systemPrompt);
        const _ = await Ye(x.id);
        (_.approval_level = u.approvalLevel),
          await Z(`/agents/${encodeURIComponent(x.id)}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(_),
          }),
          b.success(`专家「${u.name}」创建成功`),
          t(),
          n();
      } catch (x) {
        b.error(x.message || "创建专家失败");
      } finally {
        O(!1);
      }
    };
  return l.createElement(
    r,
    {
      open: e,
      onCancel: t,
      footer: null,
      title: "选择专家模板",
      width: 800,
    },
    l.createElement(
      "div",
      { style: { marginBottom: 16 } },
      l.createElement(g, {
        placeholder: "搜索模板名称或类别...",
        value: H,
        onChange: (u) => w(u.target.value),
        allowClear: !0,
      }),
    ),
    D
      ? l.createElement(
          "div",
          { style: { textAlign: "center", padding: 60 } },
          l.createElement($, { size: "large" }),
          l.createElement(
            "div",
            { style: { marginTop: 12, color: "#8c8c8c" } },
            "正在创建专家...",
          ),
        )
      : l.createElement(
          y,
          { gutter: [12, 12] },
          // ── Blank template card (always first) ──
          H.trim()
            ? null
            : l.createElement(
                p,
                { xs: 24, sm: 12 },
                l.createElement(
                  s,
                  {
                    hoverable: !0,
                    size: "small",
                    onClick: () => P(!0),
                    style: {
                      cursor: "pointer",
                      height: "100%",
                      border: "2px dashed #d9d9d9",
                      background: "#fafafa",
                    },
                  },
                  l.createElement(
                    "div",
                    {
                      style: {
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 10,
                        marginBottom: 8,
                      },
                    },
                    l.createElement(
                      "span",
                      { style: { fontSize: 28, color: "#8c8c8c" } },
                      M ? l.createElement(M) : "📝",
                    ),
                    l.createElement(
                      "div",
                      { style: { flex: 1 } },
                      l.createElement(
                        U,
                        { strong: !0, style: { fontSize: 15 } },
                        "从空白模版开始创建",
                      ),
                      l.createElement(
                        "div",
                        null,
                        l.createElement(
                          i,
                          { color: "default", style: { fontSize: 10 } },
                          "空白",
                        ),
                      ),
                    ),
                  ),
                  l.createElement(
                    "div",
                    {
                      style: {
                        fontSize: 12,
                        color: "#595959",
                        lineHeight: 1.5,
                      },
                    },
                    "创建一个全新的专家，不使用任何预设模板。创建后可自行配置系统提示词、技能和 MCP 客户端。",
                  ),
                ),
              ),
          ...N.map((u) =>
            l.createElement(
              p,
              { key: u.id, xs: 24, sm: 12 },
              l.createElement(
                s,
                {
                  hoverable: !0,
                  size: "small",
                  onClick: () => A(u),
                  style: { cursor: "pointer", height: "100%" },
                },
                l.createElement(
                  "div",
                  {
                    style: {
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 10,
                      marginBottom: 8,
                    },
                  },
                  l.createElement("span", { style: { fontSize: 28 } }, u.emoji),
                  l.createElement(
                    "div",
                    { style: { flex: 1 } },
                    l.createElement(
                      U,
                      { strong: !0, style: { fontSize: 15 } },
                      u.name,
                    ),
                    l.createElement(
                      "div",
                      null,
                      l.createElement(
                        i,
                        { color: "blue", style: { fontSize: 10 } },
                        u.category,
                      ),
                      u.approvalLevel === "MANUAL"
                        ? l.createElement(
                            i,
                            { color: "orange", style: { fontSize: 10 } },
                            "需审批",
                          )
                        : null,
                    ),
                  ),
                ),
                l.createElement(
                  "div",
                  {
                    style: {
                      fontSize: 12,
                      color: "#595959",
                      lineHeight: 1.5,
                    },
                  },
                  ct(u.description, l),
                ),
              ),
            ),
          ),
        ),
    // ── Blank template creation modal ──
    l.createElement(bn, {
      open: G,
      onCancel: () => P(!1),
      onCreate: B,
    }),
  );
}
function bn({ open: e, onCancel: t, onCreate: n }) {
  const l = E().React,
    { useState: a } = l,
    { Modal: r, Input: s, message: i } = E().antd,
    [g, y] = a(""),
    [p, $] = a("");
  return l.createElement(
    r,
    {
      open: e,
      title: "从空白模版创建专家",
      onCancel: t,
      onOk: () => {
        if (!g.trim()) {
          i.warning("请输入专家名称");
          return;
        }
        n(g.trim(), p.trim());
      },
      okText: "创建",
      cancelText: "取消",
      destroyOnClose: !0,
    },
    l.createElement(
      "div",
      { style: { marginBottom: 16 } },
      l.createElement(
        "div",
        { style: { fontSize: 13, marginBottom: 6, color: "#595959" } },
        "专家名称",
      ),
      l.createElement(s, {
        placeholder: "输入专家名称",
        value: g,
        onChange: (b) => y(b.target.value),
        maxLength: 50,
      }),
    ),
    l.createElement(
      "div",
      null,
      l.createElement(
        "div",
        { style: { fontSize: 13, marginBottom: 6, color: "#595959" } },
        "专家描述（可选）",
      ),
      l.createElement(s.TextArea, {
        placeholder: "简要描述该专家的职责和能力...",
        value: p,
        onChange: (b) => $(b.target.value),
        rows: 3,
        maxLength: 200,
      }),
    ),
  );
}
function Pt({ agentId: e, systemPromptFiles: t, onRefresh: n }) {
  const l = E().React,
    { useState: a, useEffect: r, useCallback: s } = l,
    {
      List: i,
      Tag: g,
      Switch: y,
      Button: p,
      Modal: $,
      Input: b,
      Spin: h,
      Empty: U,
      message: M,
      Typography: D,
    } = E().antd,
    {
      FileTextOutlined: O,
      PlusOutlined: H,
      EditOutlined: w,
      ReloadOutlined: G,
    } = E().antdIcons || {},
    { Text: P } = D,
    [B, N] = a([]),
    [A, u] = a(!0),
    [x, _] = a(t || []),
    [J, z] = a(!1),
    [S, c] = a(null),
    [k, W] = a(""),
    [Y, d] = a(""),
    [I, q] = a(!1),
    o = s(async () => {
      u(!0);
      try {
        const T = await Gt(e);
        N(T);
      } catch (T) {
        M.error(T.message || "加载记忆文件失败"), N([]);
      } finally {
        u(!1);
      }
    }, [e]);
  r(() => {
    o();
  }, [o]),
    r(() => {
      _(t || []);
    }, [t]);
  const ee = async (T, v) => {
      const ne = new Set(x);
      if (v) ne.add(T);
      else {
        if (ut.includes(T) && T === "AGENTS.md") {
          M.warning("AGENTS.md 是核心文件，不能停用");
          return;
        }
        ne.delete(T);
      }
      const f = Array.from(ne);
      _(f);
      try {
        await dt(e, f), M.success(v ? "已启用记忆文件" : "已停用记忆文件"), n();
      } catch (se) {
        M.error(se.message || "更新失败"), _(t || []);
      }
    },
    R = async (T) => {
      try {
        const v = await Z(`/workspace/files/${encodeURIComponent(T)}`, {
          headers: { "X-Agent-Id": e },
        });
        c(T), W(v.content || ""), z(!0);
      } catch (v) {
        M.error(v.message || "读取文件失败");
      }
    },
    te = () => {
      c(null), W(""), d(""), z(!0);
    },
    ae = async () => {
      const T = S || Y.trim();
      if (!T) {
        M.warning("请输入文件名");
        return;
      }
      const v = T.endsWith(".md") ? T : `${T}.md`;
      q(!0);
      try {
        if ((await qe(e, v, k), !S && !x.includes(v))) {
          const ne = [...x, v];
          _(ne), await dt(e, ne);
        }
        M.success("保存成功"), z(!1), o(), n();
      } catch (ne) {
        M.error(ne.message || "保存失败");
      } finally {
        q(!1);
      }
    };
  return A
    ? l.createElement(
        "div",
        { style: { textAlign: "center", padding: 40 } },
        l.createElement(h, { size: "large" }),
      )
    : l.createElement(
        "div",
        null,
        l.createElement(
          "div",
          {
            style: {
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 12,
            },
          },
          l.createElement(
            "div",
            { style: { display: "flex", alignItems: "center", gap: 6 } },
            O
              ? l.createElement(O, {
                  style: { fontSize: 14, color: "#1677ff" },
                })
              : null,
            l.createElement(P, { strong: !0 }, `记忆文件 (${B.length})`),
            l.createElement(
              P,
              { type: "secondary", style: { fontSize: 12 } },
              `· 已挂载 ${x.length} 个到专家记忆`,
            ),
          ),
          l.createElement(
            "div",
            { style: { display: "flex", gap: 8 } },
            l.createElement(
              p,
              {
                size: "small",
                icon: G ? l.createElement(G) : void 0,
                onClick: o,
              },
              "刷新",
            ),
            l.createElement(
              p,
              {
                type: "primary",
                size: "small",
                icon: H ? l.createElement(H) : void 0,
                onClick: te,
              },
              "新建记忆文件",
            ),
          ),
        ),
        B.length === 0
          ? l.createElement(U, {
              description: "暂无记忆文件，点击「新建记忆文件」添加",
              image: U.PRESENTED_IMAGE_SIMPLE,
            })
          : l.createElement(i, {
              dataSource: B,
              renderItem: (T) => {
                const v = x.includes(T.filename),
                  ne = ut.includes(T.filename);
                return l.createElement(
                  i.Item,
                  {
                    actions: [
                      l.createElement(
                        p,
                        {
                          type: "link",
                          size: "small",
                          icon: w ? l.createElement(w) : void 0,
                          onClick: () => R(T.filename),
                        },
                        "编辑",
                      ),
                    ],
                  },
                  l.createElement(i.Item.Meta, {
                    avatar: l.createElement(O, {
                      style: {
                        fontSize: 20,
                        color: v ? "#1677ff" : "#bfbfbf",
                      },
                    }),
                    title: l.createElement(
                      "div",
                      {
                        style: {
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                        },
                      },
                      l.createElement(P, null, T.filename),
                      ne
                        ? l.createElement(
                            g,
                            { color: "default", style: { fontSize: 10 } },
                            "内置",
                          )
                        : l.createElement(
                            g,
                            { color: "cyan", style: { fontSize: 10 } },
                            "记忆库",
                          ),
                    ),
                    description: l.createElement(
                      "div",
                      { style: { fontSize: 12 } },
                      `${(T.size / 1024).toFixed(1)} KB · 修改于 ${new Date(
                        T.modified_time,
                      ).toLocaleString()}`,
                    ),
                  }),
                  l.createElement(y, {
                    checked: v,
                    size: "small",
                    onChange: (f) => ee(T.filename, f),
                  }),
                );
              },
            }),
        // Edit/New file modal
        l.createElement(
          $,
          {
            open: J,
            onCancel: () => z(!1),
            title: S ? `编辑 ${S}` : "新建记忆文件",
            width: 700,
            onOk: ae,
            confirmLoading: I,
            okText: "保存",
          },
          S
            ? null
            : l.createElement(
                "div",
                { style: { marginBottom: 12 } },
                l.createElement(b, {
                  placeholder: "文件名（如：油藏工程记忆库.md）",
                  value: Y,
                  onChange: (T) => d(T.target.value),
                  addonAfter: Y.endsWith(".md") ? "" : ".md",
                }),
              ),
          l.createElement(b.TextArea, {
            value: k,
            onChange: (T) => W(T.target.value),
            rows: 12,
            placeholder: `输入记忆内容（支持 Markdown 格式）...

例如：
# 某区块油藏基础参数

- 地层压力: 25 MPa
- 地层温度: 85°C
- 原油密度: 0.85 g/cm³`,
            style: { fontFamily: "monospace", fontSize: 13 },
          }),
        ),
      );
}
function Sn({ skills: e, agentId: t }) {
  const n = E().React,
    { useMemo: l } = n,
    {
      List: a,
      Tag: r,
      Typography: s,
      Empty: i,
      Button: g,
      message: y,
    } = E().antd,
    { ThunderboltOutlined: p, CopyOutlined: $ } = E().antdIcons || {},
    { Text: b } = s,
    h = l(() => Wt(e), [e]),
    U = (D) => {
      try {
        const O = E();
        O.setSelectedAgent && O.setSelectedAgent(t);
      } catch {}
      try {
        sessionStorage.setItem("ugsci_pending_prompt", D);
      } catch {}
      window.history.pushState({}, "", "/chat"),
        window.dispatchEvent(new PopStateEvent("popstate"));
    },
    M = (D) => {
      var O;
      (O = navigator.clipboard) == null ||
        O.writeText(D).then(() => {
          y.success("已复制到剪贴板");
        });
    };
  return h.length === 0
    ? n.createElement(i, {
        description: "暂无推荐提问，请先为专家添加技能",
        image: i.PRESENTED_IMAGE_SIMPLE,
      })
    : n.createElement(
        "div",
        null,
        n.createElement(
          "div",
          {
            style: {
              display: "flex",
              alignItems: "center",
              gap: 6,
              marginBottom: 12,
            },
          },
          p
            ? n.createElement(p, {
                style: { fontSize: 14, color: "#1677ff" },
              })
            : null,
          n.createElement(b, { strong: !0 }, `推荐提问 (${h.length})`),
          n.createElement(
            b,
            { type: "secondary", style: { fontSize: 12 } },
            "· 从技能描述中自动提取",
          ),
        ),
        n.createElement(a, {
          dataSource: h,
          renderItem: (D, O) =>
            n.createElement(
              a.Item,
              {
                actions: [
                  n.createElement(
                    g,
                    {
                      type: "link",
                      size: "small",
                      icon: $ ? n.createElement($) : void 0,
                      onClick: () => M(D),
                    },
                    "复制",
                  ),
                ],
              },
              n.createElement(a.Item.Meta, {
                avatar: n.createElement(
                  r,
                  { color: "blue", style: { borderRadius: "50%" } },
                  `${O + 1}`,
                ),
                title: n.createElement(
                  "div",
                  {
                    style: {
                      cursor: "pointer",
                      color: "#1677ff",
                    },
                    onClick: () => U(D),
                  },
                  D,
                ),
                description: n.createElement(
                  b,
                  { type: "secondary", style: { fontSize: 12 } },
                  "点击直接发送给专家",
                ),
              }),
            ),
        }),
      );
}
function wn() {
  var V;
  const e = E().React,
    { useState: t, useEffect: n, useCallback: l, useMemo: a } = e,
    {
      Spin: r,
      Empty: s,
      Input: i,
      Button: g,
      message: y,
      Row: p,
      Col: $,
      Tabs: b,
      Modal: h,
      Typography: U,
    } = E().antd,
    {
      ReloadOutlined: M,
      PlusOutlined: D,
      SearchOutlined: O,
      TeamOutlined: H,
      UserOutlined: w,
    } = E().antdIcons || {},
    { Text: G, Paragraph: P } = U,
    [B, N] = t([]),
    [A, u] = t(!0),
    [x, _] = t(!1),
    [J, z] = t(null),
    [S, c] = t(""),
    [k, W] = t(!1),
    [Y, d] = t("experts"),
    [I, q] = t(null),
    [o, ee] = t(""),
    [R, te] = t(!1),
    [ae, T] = t(!1),
    [v, ne] = t(null),
    [f, se] = t([]),
    re = l(async () => {
      u(!0);
      try {
        const C = await st(),
          Q = await Promise.all(
            C.map(async (ie) => {
              try {
                const [pe, fe, $e] = await Promise.all([
                  Ye(ie.id).catch(() => null),
                  ot(ie.id).catch(() => []),
                  Ct(ie.id).catch(() => []),
                ]);
                return {
                  agent: ie,
                  config: pe,
                  skills: fe,
                  mcps: $e,
                  loading: !1,
                };
              } catch {
                return {
                  agent: ie,
                  config: null,
                  skills: [],
                  mcps: [],
                  loading: !1,
                };
              }
            }),
          );
        N(Q), se(C);
      } catch (C) {
        y.error(C.message || "加载专家列表失败"), N([]);
      } finally {
        u(!1);
      }
    }, []);
  n(() => {
    re();
  }, [re]),
    n(() => {
      if (v && ae) {
        const C = B.find((Q) => Q.agent.id === v.agent.id);
        C && C !== v && ne(C);
      }
    }, [B, v, ae]);
  const he = l(
      async (C) => {
        var fe;
        const Q =
          C.coordinatorName || ((fe = C.members[0]) == null ? void 0 : fe.name);
        if (!Q) {
          y.error("无法确定协调者专家");
          return;
        }
        const ie = Ve(f, Q);
        if (!ie) {
          y.error(`未找到协调者专家「${Q}」，请先创建该专家`);
          return;
        }
        if (/\{.+?\}/.test(C.taskTemplate)) {
          ee(""), q(C);
          return;
        }
        await ve(C, ie, C.taskTemplate);
      },
      [f, y],
    ),
    ve = l(
      async (C, Q, ie) => {
        var pe;
        te(!0);
        try {
          const fe = Nt(C),
            $e = ie ? fe.replace(C.taskTemplate, ie) : fe,
            Ae = E();
          Ae.setSelectedAgent && Ae.setSelectedAgent(Q),
            await Dt(Q, $e),
            y.success(
              `团队任务已发起，协调者：${
                C.coordinatorName ||
                ((pe = C.members[0]) == null ? void 0 : pe.name)
              }`,
            ),
            q(null),
            F("/chat");
        } catch (fe) {
          y.error(fe.message || "发起团队任务失败");
        } finally {
          te(!1);
        }
      },
      [y],
    ),
    F = (C) => {
      window.history.pushState({}, "", C),
        window.dispatchEvent(new PopStateEvent("popstate"));
    },
    L = l((C) => {
      z(C), _(!0);
    }, []),
    le = l((C) => {
      ne(C), T(!0);
    }, []),
    K = l(
      (C) => {
        if (!C.agent.enabled) {
          y.warning(`专家「${C.agent.name}」未启用，请先启用`);
          return;
        }
        try {
          const Q = E();
          Q.setSelectedAgent && Q.setSelectedAgent(C.agent.id);
        } catch (Q) {
          console.warn("[ugsci] Failed to set selected agent:", Q);
        }
        y.success(`已召唤专家「${C.agent.name}」，正在跳转至对话...`),
          F("/chat");
      },
      [y],
    ),
    Ee = a(() => {
      if (!S.trim()) return B;
      const C = S.toLowerCase();
      return B.filter((Q) => {
        var ie;
        return (
          Q.agent.name.toLowerCase().includes(C) ||
          ((ie = Q.agent.description) == null
            ? void 0
            : ie.toLowerCase().includes(C)) ||
          Q.agent.id.toLowerCase().includes(C) ||
          Q.skills.some((pe) => pe.name.toLowerCase().includes(C))
        );
      });
    }, [B, S]),
    ye = B.filter((C) => C.agent.enabled).length,
    oe = B.reduce(
      (C, Q) => C + Q.skills.filter((ie) => ie.enabled !== !1).length,
      0,
    ),
    ze = B.reduce((C, Q) => C + Q.mcps.length, 0),
    Oe = [
      {
        key: "experts",
        label: e.createElement(
          "span",
          { style: { display: "flex", alignItems: "center", gap: 6 } },
          w ? e.createElement(w, { style: { fontSize: 14 } }) : null,
          "专家列表",
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
              value: S,
              onChange: (C) => c(C.target.value),
              allowClear: !0,
              style: { maxWidth: 400 },
            }),
          ),
          // Content
          A
            ? e.createElement(
                "div",
                { style: { textAlign: "center", padding: 60 } },
                e.createElement(r, { size: "large" }),
              )
            : Ee.length === 0
            ? e.createElement(s, {
                description: S
                  ? "未找到匹配的专家"
                  : "暂无专家，点击「创建专家」添加",
              })
            : e.createElement(
                p,
                { gutter: [12, 12], align: "stretch" },
                ...Ee.map((C) =>
                  e.createElement(
                    $,
                    {
                      key: C.agent.id,
                      xs: 24,
                      sm: 12,
                      md: 8,
                      lg: 6,
                      style: { display: "flex" },
                    },
                    e.createElement(En, {
                      expert: C,
                      onClick: () => L(C),
                      onSummon: () => K(C),
                      onConfigure: () => le(C),
                    }),
                  ),
                ),
              ),
        ),
      },
      {
        key: "teams",
        label: e.createElement(
          "span",
          { style: { display: "flex", alignItems: "center", gap: 6 } },
          H ? e.createElement(H, { style: { fontSize: 14 } }) : null,
          "专家团",
        ),
        children: e.createElement(Ht, {
          agents: f,
          onLaunch: he,
        }),
      },
    ];
  return e.createElement(
    "div",
    { style: { padding: 24 } },
    e.createElement(Qe, {
      title: "专家",
      subtitle: `共 ${B.length} 位专家（${ye} 位启用）· ${oe} 个技能 · ${ze} 个 MCP 客户端`,
      extra: e.createElement(
        e.Fragment,
        null,
        e.createElement(
          g,
          {
            icon: M ? e.createElement(M) : void 0,
            onClick: re,
            loading: A,
          },
          "刷新",
        ),
        e.createElement(
          g,
          {
            type: "primary",
            icon: D ? e.createElement(D) : void 0,
            onClick: () => W(!0),
            style: Pe,
          },
          "创建专家",
        ),
      ),
    }),
    e.createElement(b, {
      items: Oe,
      activeKey: Y,
      onChange: (C) => d(C),
    }),
    // Drawer
    e.createElement(hn, {
      expert: J,
      open: x,
      onClose: () => _(!1),
      onRefresh: () => re(),
    }),
    // Template Modal
    e.createElement(vn, {
      open: k,
      onClose: () => W(!1),
      onCreated: () => re(),
    }),
    // Config Modal (gear icon)
    e.createElement(fn, {
      expert: v,
      open: ae,
      onClose: () => T(!1),
      onRefresh: () => re(),
    }),
    // Team Launch Modal (for filling placeholders)
    I
      ? e.createElement(
          h,
          {
            open: !0,
            title: e.createElement(
              "div",
              { style: { display: "flex", alignItems: "center", gap: 8 } },
              e.createElement("span", { style: { fontSize: 20 } }, I.emoji),
              e.createElement("span", null, `发起团队任务 - ${I.name}`),
            ),
            onCancel: () => q(null),
            onOk: () => {
              var pe;
              const C =
                  I.coordinatorName ||
                  ((pe = I.members[0]) == null ? void 0 : pe.name),
                Q = C ? Ve(f, C) : null;
              if (!Q) {
                y.error("无法找到协调者专家");
                return;
              }
              let ie = I.taskTemplate;
              o.trim() && (ie = o.trim()), ve(I, Q, ie);
            },
            confirmLoading: R,
            okText: "发起任务",
            width: 600,
          },
          e.createElement(
            "div",
            { style: { marginBottom: 12 } },
            e.createElement(
              G,
              {
                type: "secondary",
                style: { fontSize: 12, display: "block", marginBottom: 8 },
              },
              "任务模板（包含占位符 {参数名}，可在下方编辑替换）：",
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
                  lineHeight: 1.6,
                },
              },
              I.taskTemplate,
            ),
          ),
          e.createElement(
            "div",
            null,
            e.createElement(
              G,
              {
                type: "secondary",
                style: { fontSize: 12, display: "block", marginBottom: 8 },
              },
              "输入具体任务描述（替换上面的占位符内容）：",
            ),
            e.createElement(i.TextArea, {
              value: o,
              onChange: (C) => ee(C.target.value),
              rows: 5,
              placeholder: I.taskTemplate,
              style: { fontSize: 13 },
            }),
          ),
          e.createElement(
            "div",
            {
              style: {
                marginTop: 12,
                padding: "8px 12px",
                background: "#e6f4ff",
                borderRadius: 6,
              },
            },
            e.createElement(
              G,
              { style: { fontSize: 12, color: "#0958d9" } },
              `协调者: ${
                I.coordinatorName ||
                ((V = I.members[0]) == null ? void 0 : V.name) ||
                "—"
              } · 成员: ${I.members.map((C) => C.name).join("、")}`,
            ),
          ),
        )
      : null,
  );
}
function xn({ mcp: e, onClick: t }) {
  const n = E().React,
    { Card: l, Tag: a, Badge: r, Typography: s } = E().antd,
    { Text: i } = s,
    g = {
      stdio: "💻",
      streamable_http: "🌐",
      sse: "📡",
    };
  return n.createElement(
    l,
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
        flexDirection: "column",
      },
      bodyStyle: {
        display: "flex",
        flexDirection: "column",
        height: "100%",
        flex: 1,
      },
    },
    n.createElement(
      "div",
      {
        style: {
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 8,
        },
      },
      n.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 8 } },
        n.createElement(
          "span",
          { style: { fontSize: 18 } },
          g[e.transport] || "🔌",
        ),
        n.createElement(
          i,
          { strong: !0, style: { fontSize: 14 } },
          e.name || e.key,
        ),
      ),
      n.createElement(r, {
        status: e.enabled ? "success" : "default",
        text: e.enabled ? "启用" : "停用",
      }),
    ),
    e.description
      ? n.createElement(
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
              flex: "1 0 auto",
            },
          },
          e.description,
        )
      : n.createElement(
          "div",
          {
            style: {
              fontSize: 12,
              color: "#bfbfbf",
              marginBottom: 8,
              minHeight: 36,
              flex: "1 0 auto",
            },
          },
          "暂无描述",
        ),
    n.createElement(
      "div",
      { style: { display: "flex", gap: 6, flexWrap: "wrap" } },
      n.createElement(
        a,
        { color: "purple", style: { fontSize: 11 } },
        e.transport,
      ),
      e.tools && e.tools.length > 0
        ? n.createElement(
            a,
            { color: "blue", style: { fontSize: 11 } },
            `${e.tools.length} 个工具`,
          )
        : n.createElement(a, { style: { fontSize: 11 } }, "全部工具"),
      e.url
        ? n.createElement(
            a,
            {
              color: "geekblue",
              style: {
                fontSize: 11,
                maxWidth: 200,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              },
            },
            e.url,
          )
        : null,
    ),
  );
}
const lt = {
    reservoir_simulation: "油藏数值模拟",
    geological_modeling: "地质建模",
    well_log_analysis: "测井分析",
    production_engineering: "采油工程",
    post_processing: "后处理与可视化",
    multiphysics: "多物理场仿真",
  },
  Ot = {
    reservoir_simulation: "🛢️",
    geological_modeling: "🏔️",
    well_log_analysis: "📡",
    production_engineering: "⚙️",
    post_processing: "📊",
    multiphysics: "🔬",
  };
async function Cn() {
  return Z("/ugsci/engines/list");
}
async function kn(e) {
  return Z("/ugsci/engines/", {
    method: "POST",
    body: JSON.stringify(e),
  });
}
async function Tn(e, t) {
  return Z(`/ugsci/engines/${encodeURIComponent(e)}`, {
    method: "PUT",
    body: JSON.stringify(t),
  });
}
async function zn(e) {
  return Z(`/ugsci/engines/${encodeURIComponent(e)}`, { method: "DELETE" });
}
async function In() {
  return Z("/ugsci/engines/detect", {
    method: "POST",
  });
}
function _n({ engine: e, onClick: t }) {
  const n = E().React,
    { Card: l, Tag: a, Typography: r } = E().antd,
    { Text: s } = r,
    i = e.status === "detected",
    g = Ot[e.category] || "📦";
  return n.createElement(
    l,
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
        flexDirection: "column",
      },
      bodyStyle: {
        display: "flex",
        flexDirection: "column",
        height: "100%",
        flex: 1,
      },
    },
    n.createElement(
      "div",
      {
        style: {
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 8,
        },
      },
      n.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 8 } },
        n.createElement("span", { style: { fontSize: 20 } }, g),
        n.createElement(
          "div",
          null,
          n.createElement(s, { strong: !0, style: { fontSize: 14 } }, e.name),
          n.createElement("br"),
          n.createElement(
            s,
            { type: "secondary", style: { fontSize: 11 } },
            e.vendor || "—",
          ),
        ),
      ),
      n.createElement(
        "div",
        {
          style: {
            display: "flex",
            flexDirection: "column",
            gap: 4,
            alignItems: "flex-end",
          },
        },
        i
          ? n.createElement(
              a,
              { color: "success", style: { fontSize: 11 } },
              "✅ 已检测",
            )
          : e.executable_path
          ? n.createElement(
              a,
              { color: "warning", style: { fontSize: 11 } },
              "⚠ 路径无效",
            )
          : n.createElement(a, { style: { fontSize: 11 } }, "🔧 待配置"),
        e.is_default
          ? n.createElement(
              a,
              { color: "blue", style: { fontSize: 10 } },
              "默认",
            )
          : e.is_custom
          ? n.createElement(
              a,
              { color: "purple", style: { fontSize: 10 } },
              "自定义",
            )
          : null,
      ),
    ),
    n.createElement(
      "div",
      { style: { flex: 1, minHeight: 32 } },
      n.createElement(
        s,
        { type: "secondary", style: { fontSize: 12 } },
        e.description || "暂无描述",
      ),
    ),
    n.createElement(
      "div",
      {
        style: {
          marginTop: 8,
          display: "flex",
          gap: 4,
          flexWrap: "wrap",
        },
      },
      e.category
        ? n.createElement(
            a,
            { style: { fontSize: 11 } },
            lt[e.category] || e.category,
          )
        : null,
      e.version
        ? n.createElement(
            a,
            { color: "blue", style: { fontSize: 11 } },
            `v${e.version}`,
          )
        : null,
    ),
  );
}
function Pn() {
  const e = E().React,
    { useState: t, useEffect: n, useCallback: l, useMemo: a } = e,
    {
      Spin: r,
      Empty: s,
      Button: i,
      message: g,
      Row: y,
      Col: p,
      Drawer: $,
      Descriptions: b,
      Tag: h,
      Typography: U,
      Modal: M,
      Input: D,
      Alert: O,
      Select: H,
      Popconfirm: w,
      Space: G,
    } = E().antd,
    {
      ReloadOutlined: P,
      SearchOutlined: B,
      PlusOutlined: N,
      EditOutlined: A,
      DeleteOutlined: u,
      CopyOutlined: x,
      ExperimentOutlined: _,
    } = E().antdIcons || {},
    { Text: J, Paragraph: z } = U,
    [S, c] = t([]),
    [k, W] = t(!0),
    [Y, d] = t(""),
    [I, q] = t(!1),
    [o, ee] = t(null),
    [R, te] = t(!1),
    [ae, T] = t(null),
    [v, ne] = t({}),
    [f, se] = t(!1),
    re = l(async () => {
      W(!0);
      try {
        const V = await Cn();
        c(V.engines || []);
      } catch (V) {
        g.error(V.message || "加载引擎列表失败"), c([]);
      } finally {
        W(!1);
      }
    }, []);
  n(() => {
    re();
  }, [re]);
  const he = a(() => {
      if (!Y.trim()) return S;
      const V = Y.toLowerCase();
      return S.filter((C) => {
        var Q;
        return (
          C.name.toLowerCase().includes(V) ||
          C.vendor.toLowerCase().includes(V) ||
          C.category.toLowerCase().includes(V) ||
          ((Q = C.description) == null ? void 0 : Q.toLowerCase().includes(V))
        );
      });
    }, [S, Y]),
    ve = S.filter((V) => V.status === "detected").length,
    F = l((V) => {
      navigator.clipboard
        .writeText(V)
        .then(() => g.success("路径已复制"))
        .catch(() => g.error("复制失败"));
    }, []),
    L = l(() => {
      T(null),
        ne({
          name: "",
          vendor: "",
          version: "",
          executable_path: "",
          category: "",
          description: "",
          invocation_hint: "",
        }),
        te(!0);
    }, []),
    le = l((V) => {
      T(V), ne({ ...V }), te(!0), q(!1);
    }, []),
    K = l(async () => {
      var V;
      if (!((V = v.name) != null && V.trim())) {
        g.warning("请输入引擎名称");
        return;
      }
      se(!0);
      try {
        ae
          ? (await Tn(ae.id, v), g.success("引擎已更新"))
          : (await kn(v), g.success("引擎已添加")),
          te(!1),
          re();
      } catch (C) {
        g.error(C.message || "保存失败");
      } finally {
        se(!1);
      }
    }, [v, ae, re]),
    Ee = l(
      async (V) => {
        try {
          await zn(V), g.success("引擎已删除"), q(!1), re();
        } catch (C) {
          g.error(C.message || "删除失败");
        }
      },
      [re],
    ),
    ye = l(async () => {
      W(!0);
      try {
        const V = await In();
        c(V.engines || []), g.success("自动检测完成");
      } catch (V) {
        g.error(V.message || "检测失败");
      } finally {
        W(!1);
      }
    }, []),
    oe = l(
      (V, C, Q) => {
        const ie = v[C] || "";
        return e.createElement(
          "div",
          { style: { marginBottom: 12 } },
          e.createElement(
            J,
            { style: { fontSize: 13, display: "block", marginBottom: 4 } },
            V,
          ),
          Q != null && Q.select
            ? e.createElement(H, {
                value: ie || void 0,
                onChange: (pe) => ne((fe) => ({ ...fe, [C]: pe })),
                style: { width: "100%" },
                options: Q.select.options,
                allowClear: !0,
                placeholder: `选择${V}`,
              })
            : Q != null && Q.textarea
            ? e.createElement(D.TextArea, {
                value: ie,
                onChange: (pe) => ne((fe) => ({ ...fe, [C]: pe.target.value })),
                rows: 3,
                placeholder: `输入${V}`,
              })
            : e.createElement(D, {
                value: ie,
                onChange: (pe) => ne((fe) => ({ ...fe, [C]: pe.target.value })),
                placeholder: `输入${V}`,
              }),
        );
      },
      [v],
    ),
    [ze, Oe] = t(!0);
  return e.createElement(
    "div",
    null,
    // Summary alert (closable)
    ze
      ? e.createElement(O, {
          type: ve > 0 ? "success" : "info",
          message: `共 ${S.length} 个引擎 · ${ve} 个已检测`,
          description:
            ve > 0
              ? "部分引擎已自动检测到安装路径，可在卡片中查看详情。"
              : "尚未检测到已安装的引擎。可点击「自动检测」或手动添加计算引擎。",
          showIcon: !0,
          closable: !0,
          onClose: () => Oe(!1),
          style: { marginBottom: 16 },
        })
      : null,
    // Action bar
    e.createElement(
      "div",
      {
        style: {
          marginBottom: 16,
          display: "flex",
          gap: 8,
          alignItems: "center",
          flexWrap: "wrap",
        },
      },
      e.createElement(D, {
        placeholder: "搜索引擎名称、厂商...",
        prefix: B ? e.createElement(B) : void 0,
        value: Y,
        onChange: (V) => d(V.target.value),
        allowClear: !0,
        style: { maxWidth: 280 },
      }),
      e.createElement(
        i,
        {
          icon: P ? e.createElement(P) : void 0,
          onClick: ye,
          loading: k,
        },
        "自动检测",
      ),
      e.createElement(
        i,
        {
          type: "primary",
          icon: N ? e.createElement(N) : void 0,
          onClick: L,
          style: Pe,
        },
        "添加引擎",
      ),
    ),
    // Content
    k
      ? e.createElement(
          "div",
          { style: { textAlign: "center", padding: 60 } },
          e.createElement(r, {
            size: "large",
            tip: "正在加载计算引擎...",
          }),
        )
      : he.length === 0
      ? e.createElement(s, {
          description: Y ? "无匹配引擎" : "暂无引擎，点击「添加引擎」开始",
        })
      : e.createElement(
          y,
          { gutter: [12, 12], align: "stretch" },
          ...he.map((V) =>
            e.createElement(
              p,
              {
                key: V.id,
                xs: 24,
                sm: 12,
                md: 8,
                lg: 6,
                style: { display: "flex" },
              },
              e.createElement(_n, {
                engine: V,
                onClick: () => {
                  ee(V), q(!0);
                },
              }),
            ),
          ),
        ),
    // Detail drawer
    o
      ? e.createElement(
          $,
          {
            title: e.createElement(
              "div",
              { style: { display: "flex", alignItems: "center", gap: 8 } },
              e.createElement(
                "span",
                { style: { fontSize: 18 } },
                Ot[o.category] || "📦",
              ),
              e.createElement("span", null, o.name),
            ),
            open: I,
            onClose: () => q(!1),
            width: 520,
            extra: e.createElement(
              G,
              null,
              e.createElement(
                i,
                {
                  size: "small",
                  icon: A ? e.createElement(A) : void 0,
                  onClick: () => le(o),
                },
                "编辑",
              ),
              o.is_default
                ? null
                : e.createElement(
                    w,
                    {
                      title: "确认删除此引擎？",
                      description: o.name,
                      onConfirm: () => Ee(o.id),
                      okText: "删除",
                      cancelText: "取消",
                      okButtonProps: { danger: !0 },
                    },
                    e.createElement(
                      i,
                      {
                        size: "small",
                        danger: !0,
                        icon: u ? e.createElement(u) : void 0,
                      },
                      "删除",
                    ),
                  ),
            ),
          },
          e.createElement(
            b,
            { column: 1, bordered: !0, size: "small" },
            e.createElement(b.Item, { label: "引擎名称" }, o.name),
            e.createElement(b.Item, { label: "厂商" }, o.vendor || "—"),
            e.createElement(
              b.Item,
              { label: "分类" },
              o.category ? lt[o.category] || o.category : "—",
            ),
            e.createElement(
              b.Item,
              { label: "状态" },
              e.createElement(
                h,
                {
                  color:
                    o.status === "detected"
                      ? "success"
                      : o.status === "not_found"
                      ? "error"
                      : "default",
                },
                o.status === "detected"
                  ? "✅ 已检测"
                  : o.status === "not_found"
                  ? "❌ 路径无效"
                  : "🔧 待配置",
              ),
            ),
            e.createElement(b.Item, { label: "版本" }, o.version || "—"),
            o.executable_path
              ? e.createElement(
                  b.Item,
                  { label: "可执行文件" },
                  e.createElement(
                    "div",
                    {
                      style: {
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                      },
                    },
                    e.createElement(
                      "code",
                      {
                        style: {
                          fontSize: 12,
                          wordBreak: "break-all",
                        },
                      },
                      o.executable_path,
                    ),
                    e.createElement(i, {
                      size: "small",
                      type: "text",
                      icon: x ? e.createElement(x) : void 0,
                      onClick: () => F(o.executable_path),
                    }),
                  ),
                )
              : null,
            o.install_dir
              ? e.createElement(
                  b.Item,
                  { label: "安装目录" },
                  e.createElement(
                    "code",
                    { style: { fontSize: 12, wordBreak: "break-all" } },
                    o.install_dir,
                  ),
                )
              : null,
            o.license_server
              ? e.createElement(
                  b.Item,
                  { label: "许可证服务器" },
                  o.license_server,
                )
              : null,
            e.createElement(b.Item, { label: "描述" }, o.description || "—"),
          ),
          // Invocation hint
          o.invocation_hint
            ? e.createElement(
                "div",
                {
                  style: {
                    marginTop: 16,
                    padding: 12,
                    background: "#e6f4ff",
                    borderRadius: 8,
                  },
                },
                e.createElement(
                  J,
                  { strong: !0, style: { fontSize: 13 } },
                  "💡 调用方式",
                ),
                e.createElement(
                  "div",
                  { style: { marginTop: 8, fontSize: 13, lineHeight: 1.6 } },
                  o.invocation_hint,
                ),
              )
            : null,
          // Type badge
          e.createElement(
            "div",
            { style: { marginTop: 12 } },
            o.is_default
              ? e.createElement(h, { color: "blue" }, "默认引擎")
              : o.is_custom
              ? e.createElement(h, { color: "purple" }, "自定义引擎")
              : null,
          ),
        )
      : null,
    // Add/Edit modal
    e.createElement(
      M,
      {
        title: ae ? "编辑引擎" : "添加计算引擎",
        open: R,
        onOk: K,
        onCancel: () => te(!1),
        okText: ae ? "保存" : "添加",
        cancelText: "取消",
        confirmLoading: f,
        width: 560,
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
            options: Object.entries(lt).map(([V, C]) => ({
              label: C,
              value: V,
            })),
          },
        }),
        oe("描述", "description", { textarea: !0 }),
        oe("调用方式提示", "invocation_hint", { textarea: !0 }),
        oe("许可证服务器", "license_server"),
      ),
    ),
  );
}
function On() {
  const e = E().React,
    { useState: t, useEffect: n, useCallback: l, useMemo: a } = e,
    {
      Spin: r,
      Empty: s,
      Input: i,
      Button: g,
      message: y,
      Row: p,
      Col: $,
      Drawer: b,
      Descriptions: h,
      Tag: U,
      Typography: M,
      List: D,
      Tabs: O,
    } = E().antd,
    {
      ReloadOutlined: H,
      PlusOutlined: w,
      SearchOutlined: G,
      ApiOutlined: P,
      RocketOutlined: B,
    } = E().antdIcons || {},
    { Text: N } = M,
    [A, u] = t([]),
    [x, _] = t(!0),
    [J, z] = t(""),
    [S, c] = t(!1),
    [k, W] = t(null),
    [Y, d] = t("mcp"),
    I = l(async () => {
      _(!0);
      try {
        const T = await Bt();
        u(T);
      } catch (T) {
        y.error(T.message || "加载能力列表失败"), u([]);
      } finally {
        _(!1);
      }
    }, []);
  n(() => {
    I();
  }, [I]);
  const q = a(() => {
      if (!J.trim()) return A;
      const T = J.toLowerCase();
      return A.filter((v) => {
        var ne;
        return (
          v.name.toLowerCase().includes(T) ||
          v.key.toLowerCase().includes(T) ||
          ((ne = v.description) == null
            ? void 0
            : ne.toLowerCase().includes(T)) ||
          v.transport.toLowerCase().includes(T)
        );
      });
    }, [A, J]),
    o = A.filter((T) => T.enabled).length,
    ee = A.reduce((T, v) => {
      var ne;
      return T + (((ne = v.tools) == null ? void 0 : ne.length) || 0);
    }, 0),
    R = (T) => {
      window.history.pushState({}, "", T),
        window.dispatchEvent(new PopStateEvent("popstate"));
    },
    te = e.createElement(
      e.Fragment,
      null,
      e.createElement(
        "div",
        {
          style: {
            marginBottom: 16,
            display: "flex",
            gap: 8,
            alignItems: "center",
          },
        },
        e.createElement(i, {
          placeholder: "搜索能力名称、描述...",
          prefix: G ? e.createElement(G) : void 0,
          value: J,
          onChange: (T) => z(T.target.value),
          allowClear: !0,
          style: { maxWidth: 400 },
        }),
        e.createElement(
          g,
          {
            type: "primary",
            icon: w ? e.createElement(w) : void 0,
            onClick: () => R("/mcp"),
            style: Pe,
          },
          "管理 MCP",
        ),
      ),
      x
        ? e.createElement(
            "div",
            { style: { textAlign: "center", padding: 60 } },
            e.createElement(r, { size: "large" }),
          )
        : q.length === 0
        ? e.createElement(s, {
            description: J
              ? "未找到匹配的能力"
              : "暂无 MCP 客户端，点击「管理 MCP」添加",
          })
        : e.createElement(
            p,
            { gutter: [12, 12], align: "stretch" },
            ...q.map((T) =>
              e.createElement(
                $,
                {
                  key: T.key,
                  xs: 24,
                  sm: 12,
                  md: 8,
                  lg: 6,
                  style: { display: "flex" },
                },
                e.createElement(xn, {
                  mcp: T,
                  onClick: () => {
                    W(T), c(!0);
                  },
                }),
              ),
            ),
          ),
    ),
    ae = [
      {
        key: "mcp",
        label: e.createElement(
          "span",
          { style: { display: "flex", alignItems: "center", gap: 6 } },
          P ? e.createElement(P, { style: { fontSize: 14 } }) : null,
          "MCP 客户端",
        ),
        children: te,
      },
      {
        key: "software",
        label: e.createElement(
          "span",
          { style: { display: "flex", alignItems: "center", gap: 6 } },
          B ? e.createElement(B, { style: { fontSize: 14 } }) : null,
          "计算引擎",
        ),
        children: e.createElement(Pn),
      },
    ];
  return e.createElement(
    "div",
    { style: { padding: 24 } },
    e.createElement(Qe, {
      title: "工具",
      subtitle: `MCP: ${A.length} 个客户端（${o} 个启用）· ${ee} 个工具`,
      extra: e.createElement(
        e.Fragment,
        null,
        e.createElement(
          g,
          {
            icon: H ? e.createElement(H) : void 0,
            onClick: I,
            loading: x,
          },
          "刷新",
        ),
      ),
    }),
    e.createElement(O, {
      items: ae,
      activeKey: Y,
      onChange: (T) => d(T),
    }),
    // MCP Detail drawer
    k
      ? e.createElement(
          b,
          {
            title: e.createElement(
              "div",
              { style: { display: "flex", alignItems: "center", gap: 8 } },
              e.createElement("span", { style: { fontSize: 18 } }, "🔌"),
              e.createElement("span", null, k.name || k.key),
            ),
            open: S,
            onClose: () => c(!1),
            width: 480,
          },
          e.createElement(
            h,
            { column: 1, bordered: !0, size: "small" },
            e.createElement(
              h.Item,
              { label: "Key" },
              e.createElement("code", { style: { fontSize: 12 } }, k.key),
            ),
            e.createElement(h.Item, { label: "名称" }, k.name || "-"),
            e.createElement(h.Item, { label: "描述" }, k.description || "-"),
            e.createElement(
              h.Item,
              { label: "状态" },
              e.createElement(
                U,
                { color: k.enabled ? "green" : "default" },
                k.enabled ? "启用" : "停用",
              ),
            ),
            e.createElement(h.Item, { label: "传输方式" }, k.transport),
            k.url ? e.createElement(h.Item, { label: "URL" }, k.url) : null,
            k.command
              ? e.createElement(
                  h.Item,
                  { label: "命令" },
                  e.createElement(
                    "code",
                    { style: { fontSize: 11 } },
                    k.command,
                  ),
                )
              : null,
            k.args && k.args.length > 0
              ? e.createElement(h.Item, { label: "参数" }, k.args.join(" "))
              : null,
          ),
          k.tools && k.tools.length > 0
            ? e.createElement(
                "div",
                { style: { marginTop: 16 } },
                e.createElement(
                  N,
                  {
                    strong: !0,
                    style: { display: "block", marginBottom: 8 },
                  },
                  "提供的工具",
                ),
                e.createElement(D, {
                  size: "small",
                  dataSource: k.tools,
                  renderItem: (T) =>
                    e.createElement(
                      D.Item,
                      null,
                      e.createElement(
                        "div",
                        {
                          style: {
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                          },
                        },
                        P
                          ? e.createElement(P, {
                              style: { fontSize: 12, color: "#1677ff" },
                            })
                          : null,
                        e.createElement(N, { style: { fontSize: 12 } }, T),
                      ),
                    ),
                }),
              )
            : e.createElement(
                "div",
                { style: { marginTop: 16, fontSize: 12, color: "#8c8c8c" } },
                "此 MCP 客户端未设置工具白名单（所有工具均可用）",
              ),
        )
      : null,
  );
}
function $n({ agentId: e, agentName: t, onNavigate: n }) {
  const l = E().React,
    { useState: a, useEffect: r, useCallback: s } = l,
    {
      Spin: i,
      Empty: g,
      Button: y,
      Row: p,
      Col: $,
      Card: b,
      Tag: h,
      Checkbox: U,
      Modal: M,
      Typography: D,
      Drawer: O,
      Descriptions: H,
      message: w,
    } = E().antd,
    {
      ReloadOutlined: G,
      ThunderboltOutlined: P,
      SettingOutlined: B,
      CheckSquareOutlined: N,
      EyeOutlined: A,
      EyeInvisibleOutlined: u,
      DeleteOutlined: x,
      CloseOutlined: _,
    } = E().antdIcons || {},
    { Text: J, Paragraph: z } = D,
    [S, c] = a([]),
    [k, W] = a(!0),
    [Y, d] = a(!1),
    [I, q] = a(null),
    [o, ee] = a(!1),
    [R, te] = a(/* @__PURE__ */ new Set()),
    [ae, T] = a(!1),
    v = s(async () => {
      if (e) {
        W(!0);
        try {
          const L = await ot(e);
          c(L);
        } catch (L) {
          w.error(L.message || "加载技能失败"), c([]);
        } finally {
          W(!1);
        }
      }
    }, [e]);
  r(() => {
    v();
  }, [v]);
  const ne = (L) => {
      te((le) => {
        const K = new Set(le);
        return K.has(L) ? K.delete(L) : K.add(L), K;
      });
    },
    f = () => te(/* @__PURE__ */ new Set()),
    se = () => te(new Set(S.map((L) => L.name))),
    re = () => {
      o ? (f(), ee(!1)) : ee(!0);
    },
    he = async () => {
      const L = Array.from(R);
      if (L.length !== 0) {
        T(!0);
        try {
          const { results: le } = await Xt(e, L),
            K = Object.entries(le).filter(([, ye]) => ye.success === !1),
            Ee = L.length - K.length;
          K.length > 0
            ? w.warning(`批量启用完成：成功 ${Ee} 个，失败 ${K.length} 个`)
            : w.success(`成功启用 ${L.length} 个技能`),
            f(),
            await v();
        } catch (le) {
          w.error(le.message || "批量启用失败");
        } finally {
          T(!1);
        }
      }
    },
    ve = async () => {
      const L = Array.from(R);
      if (L.length !== 0) {
        T(!0);
        try {
          const { results: le } = await Kt(e, L),
            K = Object.entries(le).filter(([, ye]) => ye.success === !1),
            Ee = L.length - K.length;
          K.length > 0
            ? w.warning(`批量停用完成：成功 ${Ee} 个，失败 ${K.length} 个`)
            : w.success(`成功停用 ${L.length} 个技能`),
            f(),
            await v();
        } catch (le) {
          w.error(le.message || "批量停用失败");
        } finally {
          T(!1);
        }
      }
    },
    F = () => {
      const L = Array.from(R);
      L.length !== 0 &&
        M.confirm({
          title: `确认删除 ${L.length} 个技能？`,
          content:
            "删除后技能将从当前专家工作区移除，此操作不可撤销。技能池中的原始技能不受影响。",
          okText: "确认删除",
          cancelText: "取消",
          okButtonProps: { danger: !0 },
          onOk: async () => {
            T(!0);
            try {
              const { results: le } = await Vt(e, L),
                K = Object.entries(le).filter(([, ye]) => ye.success === !1),
                Ee = L.length - K.length;
              K.length > 0
                ? w.warning(`批量删除完成：成功 ${Ee} 个，失败 ${K.length} 个`)
                : w.success(`成功删除 ${L.length} 个技能`),
                f(),
                await v();
            } catch (le) {
              w.error(le.message || "批量删除失败");
            } finally {
              T(!1);
            }
          },
        });
    };
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
          marginBottom: 16,
          flexWrap: "wrap",
          gap: 8,
        },
      },
      l.createElement(
        J,
        { type: "secondary", style: { fontSize: 13 } },
        o ? `已选择 ${R.size} / ${S.length} 个技能` : `共 ${S.length} 个技能`,
      ),
      l.createElement(
        "div",
        {
          style: {
            display: "flex",
            gap: 8,
            alignItems: "center",
            flexWrap: "wrap",
          },
        },
        o
          ? l.createElement(
              l.Fragment,
              null,
              l.createElement(y, { size: "small", onClick: se }, "全选"),
              l.createElement(
                y,
                {
                  size: "small",
                  icon: _ ? l.createElement(_) : void 0,
                  onClick: f,
                },
                "取消选择",
              ),
              l.createElement(
                y,
                {
                  size: "small",
                  type: "default",
                  icon: A ? l.createElement(A) : void 0,
                  disabled: R.size === 0 || ae,
                  loading: ae,
                  onClick: he,
                },
                "批量启用",
              ),
              l.createElement(
                y,
                {
                  size: "small",
                  danger: !0,
                  icon: u ? l.createElement(u) : void 0,
                  disabled: R.size === 0 || ae,
                  loading: ae,
                  onClick: ve,
                },
                "批量停用",
              ),
              l.createElement(
                y,
                {
                  size: "small",
                  danger: !0,
                  icon: x ? l.createElement(x) : void 0,
                  disabled: R.size === 0 || ae,
                  loading: ae,
                  onClick: F,
                },
                `删除 (${R.size})`,
              ),
              l.createElement(
                y,
                {
                  size: "small",
                  type: "primary",
                  onClick: re,
                },
                "退出批量",
              ),
            )
          : l.createElement(
              l.Fragment,
              null,
              l.createElement(
                y,
                {
                  size: "small",
                  icon: N ? l.createElement(N) : void 0,
                  onClick: re,
                  disabled: S.length === 0,
                },
                "批量管理",
              ),
              l.createElement(
                y,
                {
                  icon: G ? l.createElement(G) : void 0,
                  onClick: v,
                  loading: k,
                  size: "small",
                },
                "刷新",
              ),
            ),
      ),
    ),
    k
      ? l.createElement(
          "div",
          { style: { textAlign: "center", padding: 60 } },
          l.createElement(i, { size: "large" }),
        )
      : S.length === 0
      ? l.createElement(g, {
          description: "当前智能体未加载任何技能",
        })
      : l.createElement(
          p,
          { gutter: [12, 12] },
          ...S.map((L) =>
            l.createElement(
              $,
              { key: L.name, xs: 24, sm: 12, md: 8, lg: 6 },
              l.createElement(
                b,
                {
                  hoverable: !0,
                  size: "small",
                  style: {
                    cursor: o ? "default" : "pointer",
                    height: "100%",
                    position: "relative",
                    borderColor: o && R.has(L.name) ? "#0072f5" : void 0,
                    borderWidth: o && R.has(L.name) ? 2 : 1,
                  },
                  onClick: () => {
                    o ? ne(L.name) : (q(L), d(!0));
                  },
                },
                o
                  ? l.createElement(
                      "div",
                      {
                        style: {
                          position: "absolute",
                          top: 8,
                          right: 8,
                          zIndex: 1,
                        },
                        onClick: (le) => {
                          le.stopPropagation(), ne(L.name);
                        },
                      },
                      l.createElement(U, {
                        checked: R.has(L.name),
                      }),
                    )
                  : null,
                l.createElement(
                  "div",
                  {
                    style: {
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      marginBottom: 8,
                    },
                  },
                  L.emoji
                    ? l.createElement(
                        "span",
                        { style: { fontSize: 18 } },
                        L.emoji,
                      )
                    : l.createElement(
                        "span",
                        { style: { fontSize: 18 } },
                        "⚡",
                      ),
                  l.createElement(
                    J,
                    {
                      strong: !0,
                      style: {
                        fontSize: 13,
                        flex: 1,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      },
                    },
                    L.name,
                  ),
                  L.enabled === !1
                    ? l.createElement(
                        h,
                        { color: "default", style: { fontSize: 10 } },
                        "已禁用",
                      )
                    : l.createElement(
                        h,
                        { color: "green", style: { fontSize: 10 } },
                        "已启用",
                      ),
                ),
                L.description
                  ? l.createElement(
                      z,
                      {
                        type: "secondary",
                        style: { fontSize: 11, margin: 0, lineHeight: 1.4 },
                        ellipsis: { rows: 2 },
                      },
                      L.description,
                    )
                  : null,
                l.createElement(
                  "div",
                  {
                    style: {
                      marginTop: 8,
                      display: "flex",
                      gap: 4,
                      flexWrap: "wrap",
                    },
                  },
                  L.version_text
                    ? l.createElement(
                        h,
                        { style: { fontSize: 10 } },
                        `v${L.version_text}`,
                      )
                    : null,
                  ...(L.tags || [])
                    .slice(0, 3)
                    .map((le, K) =>
                      l.createElement(
                        h,
                        { key: K, color: "blue", style: { fontSize: 10 } },
                        le,
                      ),
                    ),
                ),
              ),
            ),
          ),
        ),
    // Skill detail drawer
    I
      ? l.createElement(
          O,
          {
            title: l.createElement(
              "div",
              { style: { display: "flex", alignItems: "center", gap: 8 } },
              l.createElement(
                "span",
                { style: { fontSize: 18 } },
                I.emoji || "⚡",
              ),
              l.createElement("span", null, I.name),
            ),
            open: Y,
            onClose: () => d(!1),
            width: 520,
            extra: l.createElement(
              y,
              {
                type: "primary",
                size: "small",
                icon: B ? l.createElement(B) : void 0,
                onClick: () => n("/skills"),
              },
              "管理技能",
            ),
          },
          l.createElement(
            H,
            { column: 1, bordered: !0, size: "small" },
            l.createElement(H.Item, { label: "技能名称" }, I.name),
            l.createElement(H.Item, { label: "描述" }, I.description || "-"),
            I.version_text
              ? l.createElement(H.Item, { label: "版本" }, I.version_text)
              : null,
            l.createElement(H.Item, { label: "来源" }, I.source || "-"),
            l.createElement(
              H.Item,
              { label: "状态" },
              I.enabled === !1 ? "已禁用" : "已启用",
            ),
            I.installed_from
              ? l.createElement(H.Item, { label: "安装来源" }, I.installed_from)
              : null,
          ),
          // Tags
          I.tags && I.tags.length > 0
            ? l.createElement(
                "div",
                { style: { marginTop: 16 } },
                l.createElement(
                  J,
                  {
                    strong: !0,
                    style: { display: "block", marginBottom: 8 },
                  },
                  "标签",
                ),
                l.createElement(
                  "div",
                  { style: { display: "flex", flexWrap: "wrap", gap: 4 } },
                  ...I.tags.map((L, le) =>
                    l.createElement(h, { key: le, color: "blue" }, L),
                  ),
                ),
              )
            : null,
          // Skill content preview
          I.content
            ? l.createElement(
                "div",
                { style: { marginTop: 16 } },
                l.createElement(
                  J,
                  {
                    strong: !0,
                    style: { display: "block", marginBottom: 8 },
                  },
                  "技能内容",
                ),
                l.createElement(
                  "div",
                  {
                    style: {
                      maxHeight: 300,
                      overflow: "auto",
                      padding: 12,
                      background: "#f5f5f5",
                      borderRadius: 6,
                      fontSize: 12,
                      whiteSpace: "pre-wrap",
                    },
                  },
                  I.content.slice(0, 2e3) +
                    (I.content.length > 2e3
                      ? `

... (内容已截断)`
                      : ""),
                ),
              )
            : null,
        )
      : null,
  );
}
function An({
  poolSkills: e,
  workspaceSkills: t,
  agents: n,
  loading: l,
  onReload: a,
}) {
  const r = E().React,
    { useState: s, useMemo: i, useCallback: g } = r,
    {
      Spin: y,
      Empty: p,
      Input: $,
      Button: b,
      Row: h,
      Col: U,
      Card: M,
      Tag: D,
      Typography: O,
      Drawer: H,
      Descriptions: w,
      List: G,
    } = E().antd,
    {
      ReloadOutlined: P,
      SearchOutlined: B,
      DownloadOutlined: N,
      ThunderboltOutlined: A,
    } = E().antdIcons || {},
    { Text: u, Paragraph: x } = O,
    [_, J] = s(""),
    [z, S] = s(!1),
    [c, k] = s(null),
    [W, Y] = s([]),
    d = i(() => {
      if (!_.trim()) return e;
      const o = _.toLowerCase();
      return e.filter((ee) => {
        var R, te;
        return (
          ee.name.toLowerCase().includes(o) ||
          ((R = ee.description) == null
            ? void 0
            : R.toLowerCase().includes(o)) ||
          ((te = ee.tags) == null
            ? void 0
            : te.some((ae) => ae.toLowerCase().includes(o)))
        );
      });
    }, [e, _]),
    I = g(
      (o) => {
        const ee = [];
        for (const R of t)
          if (R.skills.some((te) => te.name === o)) {
            const te = n.find((ae) => ae.id === R.agent_id);
            ee.push(
              (te == null ? void 0 : te.name) || R.agent_name || R.agent_id,
            );
          }
        return ee;
      },
      [t, n],
    ),
    q = (o) => {
      window.history.pushState({}, "", o),
        window.dispatchEvent(new PopStateEvent("popstate"));
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
          marginBottom: 16,
        },
      },
      r.createElement($, {
        placeholder: "搜索技能名称、描述或标签...",
        prefix: B ? r.createElement(B) : void 0,
        value: _,
        onChange: (o) => J(o.target.value),
        allowClear: !0,
        style: { maxWidth: 400 },
      }),
      r.createElement(
        "div",
        { style: { display: "flex", gap: 8 } },
        r.createElement(
          b,
          {
            icon: P ? r.createElement(P) : void 0,
            onClick: a,
            loading: l,
            size: "small",
          },
          "刷新",
        ),
        r.createElement(
          b,
          {
            type: "primary",
            icon: N ? r.createElement(N) : void 0,
            onClick: () => q("/skill-pool"),
            size: "small",
            style: Pe,
          },
          "管理技能池",
        ),
      ),
    ),
    l
      ? r.createElement(
          "div",
          { style: { textAlign: "center", padding: 60 } },
          r.createElement(y, { size: "large" }),
        )
      : d.length === 0
      ? r.createElement(p, {
          description: _ ? "未找到匹配的技能" : "技能池为空",
        })
      : r.createElement(
          h,
          { gutter: [12, 12] },
          ...d.map((o) =>
            r.createElement(
              U,
              { key: o.name, xs: 24, sm: 12, md: 8, lg: 6 },
              r.createElement(
                M,
                {
                  hoverable: !0,
                  size: "small",
                  style: { cursor: "pointer", height: "100%" },
                  onClick: () => {
                    k(o), Y(I(o.name)), S(!0);
                  },
                },
                r.createElement(
                  "div",
                  {
                    style: {
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      marginBottom: 8,
                    },
                  },
                  o.emoji
                    ? r.createElement(
                        "span",
                        { style: { fontSize: 18 } },
                        o.emoji,
                      )
                    : r.createElement(
                        "span",
                        { style: { fontSize: 18 } },
                        "⚡",
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
                        whiteSpace: "nowrap",
                      },
                    },
                    o.name,
                  ),
                  o.protected
                    ? r.createElement(
                        D,
                        { color: "gold", style: { fontSize: 10 } },
                        "内置",
                      )
                    : null,
                ),
                o.description
                  ? r.createElement(
                      x,
                      {
                        type: "secondary",
                        style: { fontSize: 11, margin: 0, lineHeight: 1.4 },
                        ellipsis: { rows: 2 },
                      },
                      o.description,
                    )
                  : null,
                r.createElement(
                  "div",
                  {
                    style: {
                      marginTop: 8,
                      display: "flex",
                      gap: 4,
                      flexWrap: "wrap",
                    },
                  },
                  o.version_text
                    ? r.createElement(
                        D,
                        { style: { fontSize: 10 } },
                        `v${o.version_text}`,
                      )
                    : null,
                  ...(o.tags || [])
                    .slice(0, 3)
                    .map((ee, R) =>
                      r.createElement(
                        D,
                        { key: R, color: "cyan", style: { fontSize: 10 } },
                        ee,
                      ),
                    ),
                ),
              ),
            ),
          ),
        ),
    // Skill detail drawer
    c
      ? r.createElement(
          H,
          {
            title: r.createElement(
              "div",
              { style: { display: "flex", alignItems: "center", gap: 8 } },
              r.createElement(
                "span",
                { style: { fontSize: 18 } },
                c.emoji || "⚡",
              ),
              r.createElement("span", null, c.name),
            ),
            open: z,
            onClose: () => S(!1),
            width: 520,
            extra: r.createElement(
              b,
              {
                type: "primary",
                size: "small",
                icon: A ? r.createElement(A) : void 0,
                onClick: () => q("/skills"),
              },
              "管理技能",
            ),
          },
          r.createElement(
            w,
            { column: 1, bordered: !0, size: "small" },
            r.createElement(w.Item, { label: "技能名称" }, c.name),
            r.createElement(w.Item, { label: "描述" }, c.description || "-"),
            c.version_text
              ? r.createElement(w.Item, { label: "版本" }, c.version_text)
              : null,
            r.createElement(w.Item, { label: "来源" }, c.source || "-"),
            r.createElement(
              w.Item,
              { label: "受保护" },
              c.protected ? "是（内置）" : "否",
            ),
            c.sync_status
              ? r.createElement(w.Item, { label: "同步状态" }, c.sync_status)
              : null,
            c.installed_from
              ? r.createElement(w.Item, { label: "安装来源" }, c.installed_from)
              : null,
          ),
          // Tags
          c.tags && c.tags.length > 0
            ? r.createElement(
                "div",
                { style: { marginTop: 16 } },
                r.createElement(
                  u,
                  {
                    strong: !0,
                    style: { display: "block", marginBottom: 8 },
                  },
                  "标签",
                ),
                r.createElement(
                  "div",
                  { style: { display: "flex", flexWrap: "wrap", gap: 4 } },
                  ...c.tags.map((o, ee) =>
                    r.createElement(D, { key: ee, color: "cyan" }, o),
                  ),
                ),
              )
            : null,
          // Installed agents
          r.createElement(
            "div",
            { style: { marginTop: 16 } },
            r.createElement(
              u,
              { strong: !0, style: { display: "block", marginBottom: 8 } },
              `已安装此技能的专家 (${W.length})`,
            ),
            W.length > 0
              ? r.createElement(G, {
                  size: "small",
                  dataSource: W,
                  renderItem: (o) =>
                    r.createElement(
                      G.Item,
                      null,
                      r.createElement(
                        "div",
                        {
                          style: {
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                          },
                        },
                        r.createElement("span", null, "🧑‍🔬"),
                        r.createElement(u, { style: { fontSize: 13 } }, o),
                      ),
                    ),
                })
              : r.createElement(
                  u,
                  { type: "secondary", style: { fontSize: 12 } },
                  "暂无专家安装此技能",
                ),
          ),
        )
      : null,
  );
}
function Rn() {
  const e = E().React,
    { useState: t, useEffect: n, useCallback: l, useMemo: a } = e,
    { Tabs: r, message: s } = E().antd,
    { ThunderboltOutlined: i, AppstoreOutlined: g } = E().antdIcons || {},
    p = E().useSelectedAgent,
    $ = p ? p() : null,
    b = ($ == null ? void 0 : $.id) || "default",
    [h, U] = t([]),
    [M, D] = t([]),
    [O, H] = t([]),
    [w, G] = t(!0),
    [P, B] = t("agent-skills"),
    N = l(async () => {
      G(!0);
      try {
        const [_, J, z] = await Promise.all([it(), st(), Mt()]);
        D(_), U(J), H(z);
      } catch (_) {
        s.error(_.message || "加载技能列表失败"), D([]);
      } finally {
        G(!1);
      }
    }, []);
  n(() => {
    N();
  }, [N]);
  const A = a(() => {
      const _ = h.find((J) => J.id === b);
      return (_ == null ? void 0 : _.name) || b;
    }, [h, b]),
    u = (_) => {
      window.history.pushState({}, "", _),
        window.dispatchEvent(new PopStateEvent("popstate"));
    },
    x = [
      {
        key: "agent-skills",
        label: e.createElement(
          "span",
          { style: { display: "flex", alignItems: "center", gap: 6 } },
          i ? e.createElement(i, { style: { fontSize: 14 } }) : null,
          "当前Agent加载技能",
        ),
        children: e.createElement($n, {
          agentId: b,
          agentName: A,
          onNavigate: u,
        }),
      },
      {
        key: "skill-pool",
        label: e.createElement(
          "span",
          { style: { display: "flex", alignItems: "center", gap: 6 } },
          g ? e.createElement(g, { style: { fontSize: 14 } }) : null,
          "技能池",
        ),
        children: e.createElement(An, {
          poolSkills: M,
          workspaceSkills: O,
          agents: h,
          loading: w,
          onReload: N,
        }),
      },
    ];
  return e.createElement(
    "div",
    { style: { padding: 24 } },
    e.createElement(Qe, {
      title: "技能",
      subtitle: `技能池共 ${M.length} 个技能 · 当前智能体：${A}`,
    }),
    e.createElement(r, {
      items: x,
      activeKey: P,
      onChange: (_) => B(_),
    }),
  );
}
const at = "ugsci.market.githubSources",
  gt = "https://github.com/anthropics/skills/tree/main/skills";
function $t(e) {
  try {
    const t = new URL(e.trim()),
      n = t.hostname.toLowerCase();
    if (n !== "github.com" && n !== "www.github.com") return null;
    const l = t.pathname.split("/").filter((g) => g.length > 0);
    if (l.length < 2) return null;
    const a = decodeURIComponent(l[0]),
      r = decodeURIComponent(l[1]);
    let s = "main",
      i = "";
    return (
      l.length >= 4 && (l[2] === "tree" || l[2] === "blob")
        ? ((s = decodeURIComponent(l[3])),
          l.length > 4 && (i = l.slice(4).map(decodeURIComponent).join("/")))
        : l.length > 2 && (i = l.slice(2).map(decodeURIComponent).join("/")),
      (i = i.replace(/\/+$/, "").replace(/^\/+/, "")),
      {
        owner: a,
        repo: r,
        ref: s || "main",
        skillsPath: i,
        label: `${a}/${r}`,
      }
    );
  } catch {
    return null;
  }
}
function At(e, t, n) {
  return `${e}/${t}:${n || "/"}`;
}
function Ln() {
  try {
    const e = localStorage.getItem(at);
    if (!e) {
      const n = $t(gt);
      if (n) {
        const l = [
          {
            id: At(n.owner, n.repo, n.skillsPath),
            url: gt,
            label: n.label,
            owner: n.owner,
            repo: n.repo,
            ref: n.ref,
            skillsPath: n.skillsPath,
            enabled: !0,
          },
        ];
        return localStorage.setItem(at, JSON.stringify(l)), l;
      }
      return [];
    }
    const t = JSON.parse(e);
    return Array.isArray(t)
      ? t.filter(
          (n) =>
            n &&
            typeof n.id == "string" &&
            typeof n.owner == "string" &&
            typeof n.repo == "string",
        )
      : [];
  } catch {
    return [];
  }
}
function tt(e) {
  try {
    localStorage.setItem(at, JSON.stringify(e));
  } catch {}
}
function Mn(e) {
  const t = e.match(/^---\s*\n([\s\S]*?)\n---/);
  if (!t) return {};
  const n = t[1],
    l = {},
    a = n.split(`
`);
  let r = "";
  for (const s of a) {
    const i = s.match(/^(\w[\w-]*)\s*:\s*(.*)$/);
    if (i) {
      r = i[1];
      let g = i[2].trim();
      ((g.startsWith('"') && g.endsWith('"')) ||
        (g.startsWith("'") && g.endsWith("'"))) &&
        (g = g.slice(1, -1)),
        r === "name"
          ? (l.name = g)
          : r === "description"
          ? (l.description = g)
          : r === "version"
          ? (l.version = g)
          : r === "author" && (l.author = g);
    }
  }
  return l;
}
async function Bn(e) {
  const t = e.skillsPath
      ? encodeURIComponent(e.skillsPath).replace(/%2F/g, "/")
      : "",
    n = `https://api.github.com/repos/${e.owner}/${
      e.repo
    }/contents/${t}?ref=${encodeURIComponent(e.ref)}`,
    l = await fetch(n, {
      headers: { Accept: "application/vnd.github+json" },
    });
  if (!l.ok)
    throw new Error(
      `GitHub API ${l.status}: ${e.label} (${e.skillsPath || "/"})`,
    );
  const a = await l.json();
  if (!Array.isArray(a)) return [];
  const r = a.filter((i) => i.type === "dir" && i.name);
  return await Promise.all(
    r.map(async (i) => {
      const g = `https://raw.githubusercontent.com/${e.owner}/${e.repo}/${
          e.ref
        }/${e.skillsPath ? e.skillsPath + "/" : ""}${i.name}/SKILL.md`,
        y = `https://github.com/${e.owner}/${e.repo}/tree/${e.ref}/${
          e.skillsPath ? e.skillsPath + "/" : ""
        }${i.name}`,
        p = {
          sourceId: e.id,
          sourceLabel: e.label,
          name: i.name,
          description: "",
          source_url: y,
          html_url: y,
          version: null,
          author: null,
        };
      try {
        const $ = await fetch(g);
        if (!$.ok) return p;
        const b = await $.text(),
          h = Mn(b);
        return {
          ...p,
          name: h.name || i.name,
          description: h.description || "",
          version: h.version || null,
          author: h.author || null,
        };
      } catch {
        return p;
      }
    }),
  );
}
async function jn(e) {
  const t = e.filter((r) => r.enabled),
    n = await Promise.all(
      t.map(async (r) => {
        try {
          return { skills: await Bn(r), error: null, label: r.label };
        } catch (s) {
          return {
            skills: [],
            error: s.message || String(s),
            label: r.label,
          };
        }
      }),
    ),
    l = [],
    a = [];
  for (const r of n)
    l.push(...r.skills),
      r.error && a.push({ label: r.label, message: r.error });
  return { skills: l, errors: a };
}
function Dn({ open: e, onClose: t, sources: n, onChange: l }) {
  const a = E().React,
    { useState: r } = a,
    {
      Modal: s,
      Input: i,
      Button: g,
      List: y,
      Tag: p,
      Switch: $,
      Typography: b,
      Tooltip: h,
      message: U,
    } = E().antd,
    {
      PlusOutlined: M,
      DeleteOutlined: D,
      LinkOutlined: O,
      GithubOutlined: H,
    } = E().antdIcons || {},
    { Text: w } = b,
    [G, P] = r(""),
    B = () => {
      const u = G.trim();
      if (!u) return;
      const x = $t(u);
      if (!x) {
        U.error(
          "无效的 GitHub URL，请输入类似 https://github.com/owner/repo/tree/main/skills 的链接",
        );
        return;
      }
      const _ = At(x.owner, x.repo, x.skillsPath);
      if (n.some((S) => S.id === _)) {
        U.warning("该源已存在");
        return;
      }
      const J = {
          id: _,
          url: u,
          label: x.label,
          owner: x.owner,
          repo: x.repo,
          ref: x.ref,
          skillsPath: x.skillsPath,
          enabled: !0,
        },
        z = [...n, J];
      tt(z), l(z), P(""), U.success(`已添加源: ${x.label}`);
    },
    N = (u, x) => {
      const _ = n.map((J) => (J.id === u ? { ...J, enabled: x } : J));
      tt(_), l(_);
    },
    A = (u) => {
      const x = n.filter((_) => _.id !== u);
      tt(x), l(x), U.success("已移除源");
    };
  return a.createElement(
    s,
    {
      open: e,
      onCancel: t,
      title: a.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 8 } },
        H ? a.createElement(H, { style: { fontSize: 18 } }) : null,
        a.createElement("span", null, "配置技能源"),
      ),
      footer: a.createElement(g, { onClick: t }, "关闭"),
      width: 640,
    },
    a.createElement(
      "div",
      { style: { marginBottom: 16 } },
      a.createElement(
        w,
        {
          type: "secondary",
          style: { fontSize: 12, display: "block", marginBottom: 8 },
        },
        "添加 GitHub 仓库作为技能源，系统将从该仓库的指定目录获取技能列表。支持格式：",
      ),
      a.createElement(
        "div",
        { style: { display: "flex", gap: 8, alignItems: "center" } },
        a.createElement(i, {
          placeholder: "https://github.com/anthropics/skills/tree/main/skills",
          value: G,
          onChange: (u) => P(u.target.value),
          onPressEnter: B,
          prefix: O ? a.createElement(O) : void 0,
          style: { flex: 1 },
        }),
        a.createElement(
          g,
          {
            type: "primary",
            icon: M ? a.createElement(M) : void 0,
            onClick: B,
          },
          "添加",
        ),
      ),
    ),
    a.createElement(
      "div",
      {
        style: {
          marginBottom: 8,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        },
      },
      a.createElement(w, { strong: !0 }, `已配置源 (${n.length})`),
    ),
    a.createElement(y, {
      size: "small",
      bordered: !0,
      dataSource: n,
      renderItem: (u) =>
        a.createElement(
          y.Item,
          {
            actions: [
              a.createElement(
                h,
                { title: u.enabled ? "点击禁用" : "点击启用" },
                a.createElement($, {
                  size: "small",
                  checked: u.enabled,
                  onChange: (x) => N(u.id, x),
                }),
              ),
              a.createElement(
                h,
                { title: "移除此源" },
                a.createElement(g, {
                  size: "small",
                  type: "text",
                  danger: !0,
                  icon: D ? a.createElement(D) : void 0,
                  onClick: () => A(u.id),
                }),
              ),
            ],
          },
          a.createElement(
            "div",
            { style: { flex: 1, minWidth: 0 } },
            a.createElement(
              "div",
              {
                style: {
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  marginBottom: 4,
                },
              },
              a.createElement(
                p,
                { color: "blue", style: { fontSize: 11 } },
                u.label,
              ),
              u.skillsPath
                ? a.createElement(
                    w,
                    { type: "secondary", style: { fontSize: 11 } },
                    `/${u.skillsPath}`,
                  )
                : null,
              a.createElement(
                w,
                { type: "secondary", style: { fontSize: 11 } },
                `@${u.ref}`,
              ),
            ),
            a.createElement(
              w,
              {
                type: "secondary",
                style: { fontSize: 11, wordBreak: "break-all" },
              },
              u.url,
            ),
          ),
        ),
    }),
  );
}
async function Nn() {
  return Z("/market/providers");
}
async function Un(e) {
  return Z(`/market/categories?lang=${encodeURIComponent(e)}`);
}
async function Fn(e, t, n, l, a) {
  return Z("/market/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: e,
      provider_pages: t,
      limit: n,
      lang: l,
      category: a || void 0,
    }),
  });
}
async function yt(e, t, n) {
  return Z("/skills/hub/install/start", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify({
      bundle_url: t,
      enable: n,
    }),
  });
}
async function ft(e, t) {
  return Z(`/skills/hub/install/status/${encodeURIComponent(t)}`, {
    headers: { "X-Agent-Id": e },
  });
}
function Hn() {
  const e = E().React,
    { useState: t, useEffect: n, useCallback: l, useMemo: a, useRef: r } = e,
    {
      Spin: s,
      Empty: i,
      Input: g,
      Button: y,
      message: p,
      Row: $,
      Col: b,
      Card: h,
      Tag: U,
      Tooltip: M,
      Typography: D,
      Select: O,
      Drawer: H,
      Descriptions: w,
      Tabs: G,
      Badge: P,
      Progress: B,
    } = E().antd,
    {
      ReloadOutlined: N,
      SearchOutlined: A,
      DownloadOutlined: u,
      AppstoreOutlined: x,
      ShopOutlined: _,
      CheckCircleOutlined: J,
      LoadingOutlined: z,
      UserOutlined: S,
      SettingOutlined: c,
      GithubOutlined: k,
    } = E().antdIcons || {},
    { Text: W, Paragraph: Y, Title: d } = D,
    [I, q] = t("skills"),
    [o, ee] = t([]),
    [R, te] = t([]),
    [ae, T] = t([]),
    [v, ne] = t(""),
    [f, se] = t(""),
    [re, he] = t(!1),
    [ve, F] = t(!1),
    [L, le] = t({}),
    [K, Ee] = t(null),
    [ye, oe] = t({}),
    [ze, Oe] = t([]),
    [V, C] = t(""),
    [Q, ie] = t(""),
    [pe, fe] = t([]),
    [$e, Ae] = t([]),
    [Fe, He] = t(!1),
    [Je, We] = t(!1),
    [Ce, Ge] = t(""),
    Le = r(null);
  n(() => {
    Promise.all([
      Nn().catch(() => []),
      Un("zh").catch(() => []),
      st().catch(() => []),
    ]).then(([m, X, ce]) => {
      ee(m), te(X), Oe(ce), ce.length > 0 && C(ce[0].id);
    });
  }, []);
  const De = l(async (m) => {
    const X = m ?? Ln();
    if ((fe(m || X), X.filter((me) => me.enabled).length === 0)) {
      Ae([]);
      return;
    }
    He(!0);
    try {
      const { skills: me, errors: xe } = await jn(X);
      if ((Ae(me), xe.length > 0)) {
        for (const de of xe)
          console.warn(
            `[ugsci] GitHub source '${de.label}' error: ${de.message}`,
          );
        p.warning(`部分源加载失败: ${xe.map((de) => de.label).join(", ")}`);
      }
    } catch (me) {
      p.error(me.message || "加载 GitHub 技能源失败"), Ae([]);
    } finally {
      He(!1);
    }
  }, []);
  n(() => {
    De();
  }, [De]);
  const ke = l(async (m, X, ce) => {
    he(!0);
    try {
      const me = await Fn(m, ce, 20, "zh", X || void 0);
      ce === void 0 || Object.keys(ce).length === 0
        ? T(me.results)
        : T((ge) => [...ge, ...me.results]);
      const xe = Object.values(me.by_provider || {}).some((ge) => ge.has_more);
      F(xe);
      const de = {};
      for (const [ge, Te] of Object.entries(me.by_provider || {}))
        de[ge] = (ce[ge] || 1) + 1;
      if ((le(de), me.errors.length > 0))
        for (const ge of me.errors)
          console.warn(
            `[ugsci] Market provider '${ge.provider}' error: ${ge.message}`,
          );
    } catch (me) {
      p.error(me.message || "搜索市场失败"), T([]);
    } finally {
      he(!1);
    }
  }, []);
  n(
    () => (
      Le.current && clearTimeout(Le.current),
      (Le.current = setTimeout(() => {
        ke(v, f, {});
      }, 400)),
      () => {
        Le.current && clearTimeout(Le.current);
      }
    ),
    [v, f, ke],
  );
  const Ie = () => {
      ke(v, f, L);
    },
    j = async (m) => {
      var ce;
      if (!V) {
        p.warning("请先选择安装目标专家");
        return;
      }
      const X = `${m.source}:${m.slug}`;
      try {
        oe((de) => ({ ...de, [X]: "starting" }));
        const me = await yt(V, m.source_url, !0);
        oe((de) => ({ ...de, [X]: "installing" }));
        const xe = 60;
        for (let de = 0; de < xe; de++) {
          await new Promise((Te) => setTimeout(Te, 2e3));
          const ge = await ft(V, me.task_id);
          if (
            ge.status === "completed" &&
            (ce = ge.result) != null &&
            ce.installed
          ) {
            p.success(`技能「${ge.result.name || m.name}」安装成功`),
              oe((Te) => {
                const _e = { ...Te };
                return delete _e[X], _e;
              });
            return;
          }
          if (ge.status === "failed") throw new Error(ge.error || "安装失败");
          if (ge.status === "cancelled") {
            p.info("安装已取消"),
              oe((Te) => {
                const _e = { ...Te };
                return delete _e[X], _e;
              });
            return;
          }
        }
        throw new Error("安装超时");
      } catch (me) {
        p.error(me.message || "安装技能失败"),
          oe((xe) => {
            const de = { ...xe };
            return delete de[X], de;
          });
      }
    },
    be = (m) => {
      window.history.pushState({}, "", m),
        window.dispatchEvent(new PopStateEvent("popstate"));
    },
    Se = async (m) => {
      var ce;
      if (!V) {
        p.warning("请先选择安装目标专家");
        return;
      }
      const X = `github:${m.sourceId}:${m.name}`;
      try {
        oe((de) => ({ ...de, [X]: "starting" }));
        const me = await yt(V, m.source_url, !0);
        oe((de) => ({ ...de, [X]: "installing" }));
        const xe = 60;
        for (let de = 0; de < xe; de++) {
          await new Promise((Te) => setTimeout(Te, 2e3));
          const ge = await ft(V, me.task_id);
          if (
            ge.status === "completed" &&
            (ce = ge.result) != null &&
            ce.installed
          ) {
            p.success(`技能「${ge.result.name || m.name}」安装成功`),
              oe((Te) => {
                const _e = { ...Te };
                return delete _e[X], _e;
              });
            return;
          }
          if (ge.status === "failed") throw new Error(ge.error || "安装失败");
          if (ge.status === "cancelled") {
            p.info("安装已取消"),
              oe((Te) => {
                const _e = { ...Te };
                return delete _e[X], _e;
              });
            return;
          }
        }
        throw new Error("安装超时");
      } catch (me) {
        p.error(me.message || "安装技能失败"),
          oe((xe) => {
            const de = { ...xe };
            return delete de[X], de;
          });
      }
    },
    we = a(() => {
      let m = $e;
      if ((Ce && (m = m.filter((X) => X.sourceLabel === Ce)), v.trim())) {
        const X = v.toLowerCase();
        m = m.filter((ce) => {
          var me;
          return (
            ce.name.toLowerCase().includes(X) ||
            ((me = ce.description) == null
              ? void 0
              : me.toLowerCase().includes(X))
          );
        });
      }
      return m;
    }, [$e, v, Ce]),
    Be = o.filter((m) => m.available),
    Re = a(() => {
      if (!Ce) return ae;
      const m = Be.find((X) => X.label === Ce);
      return m ? ae.filter((X) => X.source === m.key) : ae;
    }, [ae, Ce, Be]),
    ue = a(() => {
      const m = /* @__PURE__ */ new Set();
      return (
        pe.filter((X) => X.enabled).forEach((X) => m.add(X.label)),
        Be.forEach((X) => m.add(X.label)),
        Array.from(m)
      );
    }, [pe, Be]),
    Ze = e.createElement(
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
            flexWrap: "wrap",
          },
        },
        e.createElement(g, {
          placeholder: "搜索技能市场...",
          prefix: A ? e.createElement(A) : void 0,
          value: v,
          onChange: (m) => ne(m.target.value),
          allowClear: !0,
          style: { flex: 1, minWidth: 200, maxWidth: 400 },
        }),
        R.length > 0
          ? e.createElement(O, {
              value: f || void 0,
              onChange: (m) => se(m || ""),
              placeholder: "全部分类",
              allowClear: !0,
              style: { minWidth: 150 },
              options: [
                { value: "", label: "全部分类" },
                ...R.map((m) => ({ value: m.id, label: m.label })),
              ],
            })
          : null,
        // Install target selector
        e.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 4 } },
          e.createElement(
            W,
            { type: "secondary", style: { fontSize: 12 } },
            "安装到",
          ),
          e.createElement(O, {
            value: V || void 0,
            onChange: (m) => C(m),
            style: { minWidth: 140 },
            placeholder: "选择专家",
            options: ze.map((m) => ({ value: m.id, label: m.name })),
          }),
        ),
      ),
      // Source filter tags (GitHub sources + market providers)
      ue.length > 0
        ? e.createElement(
            "div",
            {
              style: {
                marginBottom: 12,
                display: "flex",
                gap: 6,
                flexWrap: "wrap",
                alignItems: "center",
              },
            },
            e.createElement(
              W,
              { type: "secondary", style: { fontSize: 12, marginRight: 4 } },
              "来源筛选:",
            ),
            e.createElement(
              U,
              {
                style: {
                  fontSize: 11,
                  cursor: "pointer",
                  borderRadius: 12,
                },
                color: Ce === "" ? "blue" : void 0,
                onClick: () => Ge(""),
              },
              "全部",
            ),
            ...ue.map((m) =>
              e.createElement(
                U,
                {
                  key: m,
                  style: {
                    fontSize: 11,
                    cursor: "pointer",
                    borderRadius: 12,
                  },
                  color: Ce === m ? "blue" : void 0,
                  icon:
                    k && pe.some((X) => X.label === m)
                      ? e.createElement(k)
                      : void 0,
                  onClick: () => Ge(Ce === m ? "" : m),
                },
                m,
              ),
            ),
          )
        : null,
      // GitHub skills section
      Fe && $e.length === 0
        ? e.createElement(
            "div",
            { style: { textAlign: "center", padding: 40, marginBottom: 16 } },
            e.createElement(s, {
              tip: "正在从 GitHub 加载技能...",
              size: "large",
            }),
          )
        : we.length > 0
        ? e.createElement(
            "div",
            { style: { marginBottom: 20 } },
            e.createElement(
              "div",
              {
                style: {
                  marginBottom: 10,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                },
              },
              k
                ? e.createElement(k, {
                    style: { fontSize: 14, color: "#1677ff" },
                  })
                : null,
              e.createElement(
                W,
                { strong: !0, style: { fontSize: 13 } },
                `GitHub 技能源 (${we.length})`,
              ),
            ),
            e.createElement(
              $,
              { gutter: [12, 12] },
              ...we.map((m) => {
                const X = `github:${m.sourceId}:${m.name}`,
                  ce = ye[X];
                return e.createElement(
                  b,
                  { key: X, xs: 24, sm: 12, md: 8, lg: 6 },
                  e.createElement(
                    h,
                    {
                      hoverable: !0,
                      size: "small",
                      style: { height: "100%" },
                    },
                    e.createElement(
                      "div",
                      {
                        style: {
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          marginBottom: 8,
                        },
                      },
                      k
                        ? e.createElement(k, {
                            style: { fontSize: 18, color: "#57606a" },
                          })
                        : e.createElement(
                            "span",
                            { style: { fontSize: 18 } },
                            "📦",
                          ),
                      e.createElement(
                        M,
                        { title: m.name },
                        e.createElement(
                          W,
                          {
                            strong: !0,
                            style: {
                              fontSize: 13,
                              flex: 1,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            },
                          },
                          m.name,
                        ),
                      ),
                    ),
                    e.createElement(
                      Y,
                      {
                        type: "secondary",
                        style: { fontSize: 11, margin: 0, lineHeight: 1.4 },
                        ellipsis: { rows: 2 },
                      },
                      m.description || "暂无描述",
                    ),
                    e.createElement(
                      "div",
                      {
                        style: {
                          marginTop: 8,
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        },
                      },
                      e.createElement(
                        "div",
                        {
                          style: { display: "flex", gap: 4, flexWrap: "wrap" },
                        },
                        e.createElement(
                          U,
                          { color: "blue", style: { fontSize: 10 } },
                          m.sourceLabel,
                        ),
                        m.version
                          ? e.createElement(
                              U,
                              { style: { fontSize: 10 } },
                              `v${m.version}`,
                            )
                          : null,
                      ),
                      ce
                        ? e.createElement(
                            y,
                            {
                              size: "small",
                              disabled: !0,
                              icon: z ? e.createElement(z) : void 0,
                            },
                            ce === "starting" ? "启动中" : "安装中",
                          )
                        : e.createElement(
                            y,
                            {
                              type: "primary",
                              size: "small",
                              icon: u ? e.createElement(u) : void 0,
                              onClick: () => Se(m),
                            },
                            "安装",
                          ),
                    ),
                  ),
                );
              }),
            ),
          )
        : null,
      // Market results section title
      Re.length > 0 || re
        ? e.createElement(
            "div",
            {
              style: {
                marginBottom: 10,
                display: "flex",
                alignItems: "center",
                gap: 6,
              },
            },
            _
              ? e.createElement(_, {
                  style: { fontSize: 14, color: "#1677ff" },
                })
              : null,
            e.createElement(
              W,
              { strong: !0, style: { fontSize: 13 } },
              `技能市场${Re.length > 0 ? ` (${Re.length})` : ""}`,
            ),
          )
        : null,
      // Results grid
      re && Re.length === 0
        ? e.createElement(
            "div",
            { style: { textAlign: "center", padding: 60 } },
            e.createElement(s, { size: "large" }),
          )
        : Re.length === 0
        ? e.createElement(i, {
            description: v
              ? `未找到匹配「${v}」的技能`
              : "输入关键词搜索技能市场",
            image: i.PRESENTED_IMAGE_SIMPLE,
          })
        : e.createElement(
            $,
            { gutter: [12, 12] },
            ...Re.map((m) => {
              const X = `${m.source}:${m.slug}`,
                ce = ye[X];
              return e.createElement(
                b,
                { key: X, xs: 24, sm: 12, md: 8, lg: 6 },
                e.createElement(
                  h,
                  {
                    hoverable: !0,
                    size: "small",
                    style: { height: "100%", cursor: "pointer" },
                    onClick: () => Ee(m),
                  },
                  e.createElement(
                    "div",
                    {
                      style: {
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        marginBottom: 8,
                      },
                    },
                    m.icon_url
                      ? e.createElement("img", {
                          src: m.icon_url,
                          alt: m.name,
                          style: { width: 24, height: 24, borderRadius: 4 },
                        })
                      : e.createElement(
                          "span",
                          { style: { fontSize: 18 } },
                          "📦",
                        ),
                    e.createElement(
                      M,
                      { title: m.name },
                      e.createElement(
                        W,
                        {
                          strong: !0,
                          style: {
                            fontSize: 13,
                            flex: 1,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          },
                        },
                        m.name,
                      ),
                    ),
                  ),
                  e.createElement(
                    Y,
                    {
                      type: "secondary",
                      style: { fontSize: 11, margin: 0, lineHeight: 1.4 },
                      ellipsis: { rows: 2 },
                    },
                    m.description || "暂无描述",
                  ),
                  e.createElement(
                    "div",
                    {
                      style: {
                        marginTop: 8,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      },
                    },
                    e.createElement(
                      "div",
                      { style: { display: "flex", gap: 4 } },
                      e.createElement(
                        U,
                        { color: "geekblue", style: { fontSize: 10 } },
                        m.source,
                      ),
                      m.version
                        ? e.createElement(
                            U,
                            { style: { fontSize: 10 } },
                            `v${m.version}`,
                          )
                        : null,
                    ),
                    ce
                      ? e.createElement(
                          y,
                          {
                            size: "small",
                            disabled: !0,
                            icon: z ? e.createElement(z) : void 0,
                          },
                          ce === "starting" ? "启动中" : "安装中",
                        )
                      : e.createElement(
                          y,
                          {
                            type: "primary",
                            size: "small",
                            icon: u ? e.createElement(u) : void 0,
                            onClick: (me) => {
                              me.stopPropagation(), j(m);
                            },
                          },
                          "安装",
                        ),
                  ),
                ),
              );
            }),
          ),
      // Load more button
      ve && !re
        ? e.createElement(
            "div",
            { style: { textAlign: "center", marginTop: 16 } },
            e.createElement(y, { onClick: Ie, loading: re }, "加载更多"),
          )
        : null,
      // Detail Drawer
      K
        ? e.createElement(
            H,
            {
              title: e.createElement(
                "div",
                { style: { display: "flex", alignItems: "center", gap: 8 } },
                K.icon_url
                  ? e.createElement("img", {
                      src: K.icon_url,
                      alt: K.name,
                      style: { width: 28, height: 28, borderRadius: 4 },
                    })
                  : e.createElement("span", { style: { fontSize: 20 } }, "📦"),
                e.createElement("span", null, K.name),
              ),
              open: !0,
              onClose: () => Ee(null),
              width: 480,
              extra: e.createElement(
                y,
                {
                  type: "primary",
                  icon: u ? e.createElement(u) : void 0,
                  onClick: () => {
                    j(K);
                  },
                },
                "安装到专家",
              ),
            },
            e.createElement(
              w,
              { column: 1, bordered: !0, size: "small" },
              e.createElement(w.Item, { label: "来源" }, K.source),
              e.createElement(w.Item, { label: "描述" }, K.description || "-"),
              K.version
                ? e.createElement(w.Item, { label: "版本" }, K.version)
                : null,
              K.author
                ? e.createElement(w.Item, { label: "作者" }, K.author)
                : null,
              e.createElement(
                w.Item,
                { label: "来源链接" },
                e.createElement(
                  "a",
                  { href: K.source_url, target: "_blank" },
                  K.source_url,
                ),
              ),
            ),
            K.stats
              ? e.createElement(
                  "div",
                  { style: { marginTop: 16 } },
                  e.createElement(
                    W,
                    {
                      strong: !0,
                      style: { display: "block", marginBottom: 8 },
                    },
                    "统计",
                  ),
                  e.createElement(
                    "div",
                    { style: { display: "flex", gap: 12, flexWrap: "wrap" } },
                    ...Object.entries(K.stats).map(([m, X]) =>
                      e.createElement(
                        "div",
                        { key: m, style: { textAlign: "center" } },
                        e.createElement(
                          "div",
                          {
                            style: {
                              fontSize: 18,
                              fontWeight: 600,
                              color: "#1677ff",
                            },
                          },
                          String(X),
                        ),
                        e.createElement(
                          W,
                          { type: "secondary", style: { fontSize: 11 } },
                          m,
                        ),
                      ),
                    ),
                  ),
                )
              : null,
          )
        : null,
    ),
    et = a(() => {
      if (!Q.trim()) return nt;
      const m = Q.toLowerCase();
      return nt.filter(
        (X) =>
          X.name.toLowerCase().includes(m) ||
          X.description.toLowerCase().includes(m) ||
          X.category.toLowerCase().includes(m),
      );
    }, [Q]),
    Xe = async (m) => {
      try {
        const X = await Z("/agents", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: m.name,
            description: m.description,
            skill_names: m.recommendedSkills,
          }),
        });
        await qe(X.id, "AGENTS.md", m.systemPrompt);
        const ce = await Ye(X.id);
        (ce.approval_level = m.approvalLevel),
          await Z(`/agents/${encodeURIComponent(X.id)}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(ce),
          }),
          p.success(`专家「${m.name}」创建成功，已跳转至专家`),
          be("/ugsci-experts");
      } catch (X) {
        p.error(X.message || "创建专家失败");
      }
    },
    je = e.createElement(
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
            border: "1px solid #d6e4ff",
          },
        },
        e.createElement(
          W,
          { style: { fontSize: 13, color: "#1f4e8c" } },
          "从专家模板库选择预设专家，一键创建并配置系统提示词、审批级别和推荐技能。未来将支持从远程市场获取更多行业专家模板。",
        ),
      ),
      e.createElement(g, {
        placeholder: "搜索专家模板...",
        prefix: A ? e.createElement(A) : void 0,
        value: Q,
        onChange: (m) => ie(m.target.value),
        allowClear: !0,
        style: { marginBottom: 16, maxWidth: 400 },
      }),
      e.createElement(
        $,
        { gutter: [12, 12] },
        ...et.map((m) =>
          e.createElement(
            b,
            { key: m.id, xs: 24, sm: 12, md: 8 },
            e.createElement(
              h,
              {
                hoverable: !0,
                size: "small",
                style: { height: "100%", cursor: "pointer" },
                onClick: () => Xe(m),
              },
              e.createElement(
                "div",
                {
                  style: {
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 10,
                    marginBottom: 8,
                  },
                },
                e.createElement("span", { style: { fontSize: 28 } }, m.emoji),
                e.createElement(
                  "div",
                  { style: { flex: 1 } },
                  e.createElement(
                    W,
                    { strong: !0, style: { fontSize: 14 } },
                    m.name,
                  ),
                  e.createElement(
                    "div",
                    { style: { display: "flex", gap: 4, marginTop: 4 } },
                    e.createElement(
                      U,
                      { color: "blue", style: { fontSize: 10 } },
                      m.category,
                    ),
                    m.approvalLevel === "MANUAL"
                      ? e.createElement(
                          U,
                          { color: "orange", style: { fontSize: 10 } },
                          "需审批",
                        )
                      : e.createElement(
                          U,
                          { color: "green", style: { fontSize: 10 } },
                          "自动",
                        ),
                  ),
                ),
              ),
              e.createElement(
                Y,
                {
                  type: "secondary",
                  style: { fontSize: 12, margin: 0, lineHeight: 1.5 },
                  ellipsis: { rows: 3 },
                },
                m.description.replace(/\*\*(.+?)\*\*/g, "$1"),
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
                    alignItems: "center",
                  },
                },
                e.createElement(
                  W,
                  { type: "secondary", style: { fontSize: 11 } },
                  `推荐 ${m.recommendedSkills.length} 个技能`,
                ),
                e.createElement(
                  y,
                  {
                    type: "primary",
                    size: "small",
                    icon: x ? e.createElement(x) : void 0,
                  },
                  "一键创建",
                ),
              ),
            ),
          ),
        ),
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
            background: "#fafafa",
          },
        },
        _
          ? e.createElement(_, {
              style: { fontSize: 24, color: "#bfbfbf", marginBottom: 8 },
            })
          : null,
        e.createElement(
          W,
          { type: "secondary", style: { fontSize: 12 } },
          "更多专家模板持续更新中，未来将支持 OpenScience、RPA 等行业扩展",
        ),
      ),
    ),
    Rt = [
      {
        key: "skills",
        label: e.createElement(
          "span",
          { style: { display: "flex", alignItems: "center", gap: 6 } },
          x ? e.createElement(x, { style: { fontSize: 14 } }) : null,
          "技能市场",
        ),
        children: Ze,
      },
      {
        key: "experts",
        label: e.createElement(
          "span",
          { style: { display: "flex", alignItems: "center", gap: 6 } },
          S ? e.createElement(S, { style: { fontSize: 14 } }) : null,
          "专家模板",
        ),
        children: je,
      },
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
          y,
          {
            icon: k ? e.createElement(k) : void 0,
            onClick: () => We(!0),
          },
          "配置源",
        ),
        e.createElement(
          y,
          {
            type: "primary",
            icon: N ? e.createElement(N) : void 0,
            onClick: () => {
              ke(v, f, {}), De();
            },
            loading: re || Fe,
          },
          "刷新",
        ),
      ),
    }),
    e.createElement(G, {
      items: Rt,
      activeKey: I,
      onChange: (m) => q(m),
    }),
    // Source config modal
    e.createElement(Dn, {
      open: Je,
      onClose: () => We(!1),
      sources: pe,
      onChange: (m) => {
        fe(m), De(m);
      },
    }),
  );
}
function Wn() {
  var y;
  const e = window.QwenPaw;
  if (!(e != null && e.menu) || !(e != null && e.route)) {
    console.warn(
      "[ugsci] QwenPaw.menu/route API not available — plugin disabled",
    );
    return;
  }
  const t = E().React,
    n = "ugsci",
    l = E().antdIcons || {},
    a = l.UserSwitchOutlined,
    r = l.ToolOutlined,
    s = l.ThunderboltOutlined,
    i = l.ShopOutlined;
  e.route.add(n, {
    id: "ugsci.experts",
    path: "/ugsci-experts",
    component: wn,
  }),
    e.menu.add(n, {
      id: "ugsci.experts",
      location: "primary.agentScoped",
      label: () => "专家",
      icon: a ? t.createElement(a, { style: { fontSize: 16 } }) : void 0,
      route: "ugsci.experts",
      order: 5,
      visible: () => Ne(),
    }),
    e.route.add(n, {
      id: "ugsci.capabilities",
      path: "/ugsci-capabilities",
      component: On,
    }),
    e.menu.add(n, {
      id: "ugsci.capabilities",
      location: "primary.agentScoped",
      label: () => "工具",
      icon: r ? t.createElement(r, { style: { fontSize: 16 } }) : void 0,
      route: "ugsci.capabilities",
      order: 6,
      visible: () => Ne(),
    }),
    e.route.add(n, {
      id: "ugsci.skills-center",
      path: "/ugsci-skills",
      component: Rn,
    }),
    e.menu.add(n, {
      id: "ugsci.skills-center",
      location: "primary.agentScoped",
      label: () => "技能",
      icon: s ? t.createElement(s, { style: { fontSize: 16 } }) : void 0,
      route: "ugsci.skills-center",
      order: 7,
      visible: () => Ne(),
    }),
    e.route.add(n, {
      id: "ugsci.market",
      path: "/ugsci-market",
      component: Hn,
    }),
    e.menu.add(n, {
      id: "ugsci.market",
      location: "primary.agentScoped",
      label: () => "市场",
      icon: i ? t.createElement(i, { style: { fontSize: 16 } }) : void 0,
      route: "ugsci.market",
      order: 8,
      visible: () => Ne(),
    }),
    (y = e.sidebar) != null && y.registerSimpleModeItems
      ? (e.sidebar.registerSimpleModeItems([
          "ugsci.experts",
          "ugsci.capabilities",
          "ugsci.skills-center",
          "ugsci.market",
        ]),
        console.info("[ugsci] Registered 4 items for simple-mode visibility"))
      : console.warn(
          "[ugsci] window.QwenPaw.sidebar.registerSimpleModeItems not available — items will not appear in simple mode",
        );
  const g = [
    "core.skills",
    "core.tools",
    "core.mcp",
    "core.acp",
    "core.agent-config",
    "core.agent-stats",
    "core.skill-pool",
  ];
  for (const p of g) {
    try {
      const b = e.menu.snapshot("primary.agentScoped").find((h) => h.id === p);
      b &&
        e.menu.replace(n, p, {
          ...b,
          visible: () => !Ne(),
        });
    } catch {}
    try {
      const b = e.menu.snapshot("primary.settings").find((h) => h.id === p);
      b &&
        e.menu.replace(n, p, {
          ...b,
          visible: () => !Ne(),
        });
    } catch {}
  }
  console.info(
    "[ugsci] Plugin registered: 4 routes + menu items, simple-mode whitelist + simplified navigation active",
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
if ((Et = window.QwenPaw) != null && Et.host) rt();
else {
  const e = setInterval(() => {
    var t;
    (t = window.QwenPaw) != null && t.host && (clearInterval(e), rt());
  }, 200);
  setTimeout(() => clearInterval(e), 1e4);
}
