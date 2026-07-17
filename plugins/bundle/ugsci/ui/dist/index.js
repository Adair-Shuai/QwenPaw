function p() {
  var a;
  const e = (a = window.QwenPaw) == null ? void 0 : a.host;
  if (!e) throw new Error("[ugsci] QwenPaw.host not available");
  return e;
}
function tt() {
  try {
    return p().getApiToken() || "";
  } catch {
    return "";
  }
}
function Fe(e) {
  return p().getApiUrl(e);
}
function We(e) {
  const a = tt();
  return {
    "Content-Type": "application/json",
    ...a ? { Authorization: `Bearer ${a}` } : {},
    ...e
  };
}
async function ee(e, a) {
  const r = await fetch(Fe(e), {
    ...a,
    headers: { ...We(), ...(a == null ? void 0 : a.headers) || {} }
  });
  if (!r.ok) {
    const t = await r.text().catch(() => "");
    throw new Error(t || `HTTP ${r.status}`);
  }
  return r.status === 204 ? null : r.json();
}
async function $e() {
  const e = await ee("/agents");
  return (e == null ? void 0 : e.agents) || [];
}
async function Ie(e) {
  return ee(`/agents/${encodeURIComponent(e)}`);
}
async function Ue(e) {
  return await ee("/skills", {
    headers: { "X-Agent-Id": e }
  }) || [];
}
async function He() {
  return await ee("/skills/pool") || [];
}
async function nt() {
  return await ee("/skills/workspaces") || [];
}
async function Ge() {
  return await ee("/mcp") || [];
}
function lt(e) {
  if (!e || typeof e != "object") return [];
  const a = e, r = a.mcpServers || a;
  return !r || typeof r != "object" ? [] : Object.keys(r).filter((t) => t !== "mcpServers");
}
const Se = {
  background: "#0072f5",
  color: "#fff",
  fontSize: 13,
  fontWeight: 600,
  border: "none",
  borderRadius: 8
};
function xe() {
  try {
    return localStorage.getItem("qwenpaw_sidebar_mode") === "simple";
  } catch {
    return !1;
  }
}
function Me(e, a) {
  const r = p();
  return r.ReactMarkdown && r.remarkGfm ? a.createElement(
    r.ReactMarkdown,
    { remarkPlugins: [r.remarkGfm] },
    e
  ) : e.replace(/\*\*(.+?)\*\*/g, "$1").replace(/\*(.+?)\*/g, "$1").replace(/`(.+?)`/g, "$1").replace(/^#+\s*/gm, "").replace(/^[-*]\s+/gm, "• ");
}
const Oe = [
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
], Ve = "ugsci_custom_teams";
function Te() {
  try {
    const e = localStorage.getItem(Ve);
    return e ? JSON.parse(e) : [];
  } catch {
    return [];
  }
}
function Je(e) {
  try {
    localStorage.setItem(Ve, JSON.stringify(e));
  } catch {
  }
}
const at = [
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
async function rt(e, a) {
  const r = {
    channel: "console",
    user_id: "default",
    session_id: `team-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    input: [
      {
        role: "user",
        content: [{ type: "text", text: a }]
      }
    ]
  };
  await fetch(Fe("/console/chat"), {
    method: "POST",
    headers: {
      ...We(),
      "X-Agent-Id": e
    },
    body: JSON.stringify(r)
  });
}
function ke(e, a) {
  const r = e.find(
    (l) => l.name === a || l.name === a.replace(/\s+/g, "")
  );
  if (r) return r.id;
  const t = e.find(
    (l) => l.name.includes(a) || a.includes(l.name) || l.name.replace(/\s+/g, "").includes(a.replace(/\s+/g, ""))
  );
  return t ? t.id : null;
}
function ot(e) {
  var r;
  const a = e.members.map((t) => `- ${t.emoji} ${t.name}（${t.role}）`).join(`
`);
  if (e.custom && e.steps && e.steps.length > 0) {
    const t = e.steps.map((n, i) => {
      const y = n.passContext ? "（传递上一步的结果作为上下文）" : "（独立执行，不传递上下文）";
      return `${i + 1}. 向「${n.agentName}」发送请求：${n.instruction} ${y}`;
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

${a}

---

请现在开始执行团队任务。首先使用 list_agents() 确认可用专家，然后按照上述步骤依次/同时咨询各成员。每步结果请明确标注来自哪位专家。`;
  }
  return `${e.orchestrationPrompt}

---

## 团队任务

${e.taskTemplate}

---

## 团队成员

${a}

---

请现在开始执行团队任务。首先使用 list_agents() 查看可用专家，然后按照上述流程依次咨询各成员。`;
}
function st({ team: e }) {
  const a = p().React, { Typography: r, Tag: t } = p().antd, { Text: l } = r, n = {
    pipeline: "→",
    roundtable: "⇄",
    coordinator: "⊙"
  }, i = {
    pipeline: "#13c2c2",
    roundtable: "#722ed1",
    coordinator: "#1677ff"
  }, y = e.steps || [], S = y.length > 0;
  return a.createElement(
    "div",
    {
      style: {
        padding: "12px 16px",
        background: "#fafafa",
        borderRadius: 8,
        border: "1px dashed #d9d9d9"
      }
    },
    a.createElement(
      l,
      {
        type: "secondary",
        style: { fontSize: 12, display: "block", marginBottom: 8 }
      },
      `执行流程 (${e.mode === "pipeline" ? "流水线" : e.mode === "roundtable" ? "圆桌讨论" : "协调者模式"})`
    ),
    // Visual flow
    a.createElement(
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
      ...S ? y.map((x, m) => {
        const z = e.members.find(
          (c) => c.name === x.agentName
        );
        return [
          m > 0 && e.mode !== "roundtable" ? a.createElement(
            "div",
            {
              key: `arrow-${m}`,
              style: {
                textAlign: "center",
                color: i[e.mode],
                fontSize: 14
              }
            },
            n[e.mode]
          ) : null,
          a.createElement(
            "div",
            {
              key: `step-${m}`,
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
            a.createElement(
              "span",
              { style: { fontSize: 16 } },
              (z == null ? void 0 : z.emoji) || "👤"
            ),
            a.createElement(
              "div",
              null,
              a.createElement(
                l,
                { strong: !0, style: { fontSize: 12 } },
                x.agentName
              ),
              a.createElement(
                "div",
                {
                  style: {
                    fontSize: 11,
                    color: "#8c8c8c",
                    maxWidth: 250
                  }
                },
                x.instruction
              ),
              x.passContext ? a.createElement(
                t,
                {
                  color: "blue",
                  style: { fontSize: 9, marginTop: 2 }
                },
                "传递上下文"
              ) : a.createElement(
                t,
                { style: { fontSize: 9, marginTop: 2 } },
                "独立"
              )
            )
          )
        ];
      }).flat() : e.members.map((x, m) => [
        m > 0 && e.mode !== "roundtable" ? a.createElement(
          "div",
          {
            key: `arrow-${m}`,
            style: {
              textAlign: "center",
              color: i[e.mode],
              fontSize: 14
            }
          },
          n[e.mode]
        ) : null,
        a.createElement(
          "div",
          {
            key: `member-${m}`,
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
          a.createElement("span", { style: { fontSize: 16 } }, x.emoji),
          a.createElement(
            "div",
            null,
            a.createElement(
              l,
              { strong: !0, style: { fontSize: 12 } },
              x.name
            ),
            a.createElement(
              "div",
              { style: { fontSize: 11, color: "#8c8c8c" } },
              x.role
            )
          )
        )
      ]).flat()
    )
  );
}
function it({
  open: e,
  onClose: a,
  agents: r,
  editingTeam: t,
  onSaved: l
}) {
  const n = p().React, { useState: i, useEffect: y, useCallback: S } = n, {
    Modal: x,
    Input: m,
    Button: z,
    Select: c,
    Tag: w,
    Typography: U,
    Switch: j,
    Empty: b,
    message: C,
    Divider: W,
    Steps: R
  } = p().antd, { PlusOutlined: B, DeleteOutlined: $, SaveOutlined: A, ArrowRightOutlined: D } = p().antdIcons || {}, { Text: O, Paragraph: u } = U, [M, I] = i(""), [_, T] = i("🤝"), [g, o] = i(""), [h, G] = i(
    "pipeline"
  ), [X, q] = i(""), [V, Z] = i(""), [s, J] = i([]), [L, K] = i([]), [Y, f] = i(!1);
  y(() => {
    e && (t ? (I(t.name), T(t.emoji), o(t.description), G(t.mode), q(t.coordinatorName || ""), Z(t.taskTemplate), J(t.steps || []), K(t.members.map((k) => k.name))) : (I(""), T("🤝"), o(""), G("pipeline"), q(""), Z(`请执行以下任务：
任务描述：{任务描述}`), J([]), K([])));
  }, [e, t]);
  const N = S(() => {
    if (h === "roundtable") {
      const k = L.map((H) => ({
        agentName: H,
        instruction: "请给出你的专业评估意见",
        passContext: !1
      }));
      J(k);
    } else if (h === "pipeline") {
      const k = new Map(s.map((ae) => [ae.agentName, ae])), H = L.map((ae) => k.get(ae) || {
        agentName: ae,
        instruction: "请完成你的专业部分",
        passContext: !0
      });
      J(H);
    }
  }, [h, L, s]), Q = (k) => {
    L.includes(k) || (K([...L, k]), h === "coordinator" && !X && q(k));
  }, E = (k) => {
    K(L.filter((H) => H !== k)), J(s.filter((H) => H.agentName !== k)), X === k && q(L[0] || "");
  }, te = (k, H, ae) => {
    const de = [...s];
    de[k] = { ...de[k], [H]: ae }, J(de);
  }, ie = () => {
    if (!M.trim()) {
      C.warning("请输入团队名称");
      return;
    }
    if (L.length < 2) {
      C.warning("至少需要选择 2 个成员");
      return;
    }
    if (!V.trim()) {
      C.warning("请输入任务模板");
      return;
    }
    if (h === "coordinator" && !X) {
      C.warning("请选择协调者");
      return;
    }
    f(!0);
    try {
      const k = L.map(
        (v) => {
          var ne;
          const F = r.find((se) => se.name === v);
          return {
            name: v,
            role: ((ne = F == null ? void 0 : F.description) == null ? void 0 : ne.slice(0, 30)) || "团队成员",
            emoji: "👤"
          };
        }
      );
      let H = s;
      (s.length === 0 || s.length !== L.length) && (H = L.map((v) => ({
        agentName: v,
        instruction: "请完成你的专业部分",
        passContext: h === "pipeline"
      })));
      const ae = {
        id: (t == null ? void 0 : t.id) || `custom-${Date.now()}`,
        name: M.trim(),
        emoji: _,
        category: "自定义",
        description: g.trim() || `${M.trim()}（${L.length}人团队）`,
        mode: h,
        members: k,
        coordinatorName: h === "coordinator" ? X : void 0,
        taskTemplate: V.trim(),
        orchestrationPrompt: "",
        // Custom teams use steps-based instructions
        steps: H,
        custom: !0,
        createdAt: (t == null ? void 0 : t.createdAt) || Date.now()
      }, de = Te(), ue = de.findIndex((v) => v.id === ae.id);
      ue >= 0 ? de[ue] = ae : de.push(ae), Je(de), C.success(t ? "团队已更新" : "团队已创建"), l(), a();
    } catch (k) {
      C.error(k.message || "保存失败");
    } finally {
      f(!1);
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
    (k) => !L.includes(k.name)
  );
  return n.createElement(
    x,
    {
      open: e,
      onCancel: a,
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
      onOk: ie,
      okText: "保存团队",
      confirmLoading: Y,
      okButtonProps: {
        icon: A ? n.createElement(A) : void 0
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
        n.createElement(c, {
          value: _,
          onChange: (k) => T(k),
          style: { width: 60 },
          options: fe.map((k) => ({ value: k, label: k })),
          optionRender: (k) => n.createElement("span", { style: { fontSize: 18 } }, k.value)
        }),
        n.createElement(m, {
          placeholder: "团队名称（如：储层评价团队）",
          value: M,
          onChange: (k) => I(k.target.value),
          style: { flex: 1 }
        })
      ),
      n.createElement(m.TextArea, {
        placeholder: "团队描述（简述团队的目标和适用场景）",
        value: g,
        onChange: (k) => o(k.target.value),
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
        n.createElement(c, {
          value: h,
          onChange: (k) => G(k),
          style: { width: 160 },
          options: [
            { value: "pipeline", label: "🔄 流水线（依次执行）" },
            { value: "roundtable", label: "🔀 圆桌讨论（独立评估）" },
            { value: "coordinator", label: "🎯 协调者（由协调者主导）" }
          ]
        })
      )
    ),
    n.createElement(W, { style: { margin: "12px 0" } }),
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
            z,
            {
              key: k.id,
              size: "small",
              icon: B ? n.createElement(B) : void 0,
              onClick: () => Q(k.name)
            },
            k.name
          )
        )
      ) : null,
      // Selected members
      L.length === 0 ? n.createElement(b, {
        description: "请从上方添加团队成员",
        image: b.PRESENTED_IMAGE_SIMPLE
      }) : n.createElement(
        "div",
        { style: { display: "flex", flexDirection: "column", gap: 4 } },
        ...L.map(
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
              h === "coordinator" && X === k ? n.createElement(
                w,
                { color: "blue", style: { fontSize: 10 } },
                "协调者"
              ) : null
            ),
            n.createElement(
              "div",
              { style: { display: "flex", gap: 4 } },
              h === "coordinator" ? n.createElement(
                z,
                {
                  size: "small",
                  type: "link",
                  onClick: () => q(k)
                },
                "设为协调者"
              ) : null,
              n.createElement(
                z,
                {
                  size: "small",
                  type: "link",
                  danger: !0,
                  icon: $ ? n.createElement($) : void 0,
                  onClick: () => E(k)
                },
                "移除"
              )
            )
          )
        )
      )
    ),
    n.createElement(W, { style: { margin: "12px 0" } }),
    // Step 3: Define execution steps (for pipeline/roundtable)
    L.length > 0 ? n.createElement(
      "div",
      { style: { marginBottom: 16 } },
      n.createElement(
        O,
        {
          strong: !0,
          style: { display: "block", marginBottom: 8, fontSize: 13 }
        },
        `3. 编排执行步骤${h === "roundtable" ? "（各步独立执行）" : h === "pipeline" ? "（依次执行，可传递上下文）" : "（由协调者决定调用顺序）"}`
      ),
      // Auto-sync button
      n.createElement(
        z,
        {
          size: "small",
          type: "dashed",
          onClick: N,
          style: { marginBottom: 8 }
        },
        "自动生成步骤"
      ),
      // Steps list
      s.length === 0 ? n.createElement(
        O,
        { type: "secondary", style: { fontSize: 12 } },
        "点击「自动生成步骤」或手动配置每步的指令"
      ) : n.createElement(
        "div",
        { style: { display: "flex", flexDirection: "column", gap: 6 } },
        ...s.map(
          (k, H) => n.createElement(
            "div",
            {
              key: H,
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
              h === "pipeline" ? n.createElement(
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
                `${H + 1}`
              ) : n.createElement(
                "span",
                { style: { fontSize: 14 } },
                "🔀"
              ),
              n.createElement(
                w,
                { color: "blue", style: { fontSize: 11 } },
                k.agentName
              ),
              n.createElement(
                "div",
                { style: { flex: 1 } },
                n.createElement(m, {
                  placeholder: "请输入该步骤的指令...",
                  value: k.instruction,
                  onChange: (ae) => te(H, "instruction", ae.target.value),
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
                onChange: (ae) => te(H, "passContext", ae)
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
    n.createElement(W, { style: { margin: "12px 0" } }),
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
        `${L.length > 0 ? "4" : "3"}. 任务模板`
      ),
      n.createElement(m.TextArea, {
        placeholder: `输入任务模板，可用 {参数名} 作为占位符...

例如：
请对区块 {区块名} 的井 {井号} 进行储层评价`,
        value: V,
        onChange: (k) => Z(k.target.value),
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
function Be({
  team: e,
  agents: a,
  onLaunch: r,
  onEdit: t,
  onDelete: l
}) {
  var g;
  const n = p().React, { useState: i } = n, { Card: y, Tag: S, Typography: x, Button: m, Tooltip: z } = p().antd, {
    TeamOutlined: c,
    RocketOutlined: w,
    UserOutlined: U,
    EditOutlined: j,
    DeleteOutlined: b,
    DownOutlined: C,
    UpOutlined: W
  } = p().antdIcons || {}, { Text: R, Paragraph: B } = x, [$, A] = i(!1), D = {
    coordinator: { label: "协调者模式", color: "blue" },
    pipeline: { label: "流水线模式", color: "cyan" },
    roundtable: { label: "圆桌讨论", color: "purple" }
  }, O = D[e.mode] || D.coordinator, u = e.members.map((o) => {
    const h = ke(a, o.name);
    return { ...o, found: !!h, agentId: h };
  }), M = u.filter((o) => o.found).length, I = M === e.members.length, _ = e.coordinatorName || ((g = e.members[0]) == null ? void 0 : g.name), T = _ ? ke(a, _) : null;
  return n.createElement(
    y,
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
            R,
            { strong: !0, style: { fontSize: 14 } },
            e.name
          ),
          e.custom ? n.createElement(
            S,
            { color: "gold", style: { fontSize: 9 } },
            "自定义"
          ) : null
        ),
        n.createElement(
          "div",
          { style: { display: "flex", gap: 4, marginTop: 4 } },
          n.createElement(
            S,
            { color: O.color, style: { fontSize: 10 } },
            O.label
          ),
          n.createElement(
            S,
            { style: { fontSize: 10 } },
            `${M}/${e.members.length}`
          ),
          I ? null : n.createElement(
            S,
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
          z,
          { title: "编辑" },
          n.createElement(m, {
            type: "text",
            size: "small",
            icon: j ? n.createElement(j) : void 0,
            onClick: (o) => {
              o.stopPropagation(), t(e);
            }
          })
        ) : null,
        l ? n.createElement(
          z,
          { title: "删除" },
          n.createElement(m, {
            type: "text",
            size: "small",
            danger: !0,
            icon: b ? n.createElement(b) : void 0,
            onClick: (o) => {
              o.stopPropagation(), l(e);
            }
          })
        ) : null
      ) : null
    ),
    // Description
    n.createElement(
      B,
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
      ...u.map(
        (o) => n.createElement(
          z,
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
              R,
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
      m,
      {
        type: "link",
        size: "small",
        style: { padding: "0 0 4px 0", fontSize: 11, height: "auto" },
        onClick: (o) => {
          o.stopPropagation(), A(!$);
        },
        icon: $ ? W ? n.createElement(W) : "▲" : C ? n.createElement(C) : "▼"
      },
      $ ? "收起流程" : "查看执行流程"
    ),
    $ ? n.createElement(st, { team: e }) : null,
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
        R,
        { type: "secondary", style: { fontSize: 11 } },
        _ ? `协调者: ${_}` : ""
      ),
      n.createElement(
        m,
        {
          type: "primary",
          size: "small",
          icon: w ? n.createElement(w) : void 0,
          disabled: !T,
          onClick: () => r(e),
          style: Se
        },
        "发起团队任务"
      )
    )
  );
}
function ct({
  agents: e,
  onLaunch: a
}) {
  const r = p().React, { useMemo: t, useState: l, useCallback: n, useEffect: i } = r, {
    Row: y,
    Col: S,
    Input: x,
    Empty: m,
    Typography: z,
    Tag: c,
    Button: w,
    Divider: U,
    message: j,
    Popconfirm: b
  } = p().antd, { SearchOutlined: C, TeamOutlined: W, PlusOutlined: R, RocketOutlined: B } = p().antdIcons || {}, { Text: $ } = z, [A, D] = l(""), [O, u] = l([]), [M, I] = l(!1), [_, T] = l(null);
  i(() => {
    u(Te());
  }, []);
  const g = n(() => {
    u(Te());
  }, []), o = n(
    (s) => {
      const L = Te().filter((K) => K.id !== s.id);
      Je(L), u(L), j.success(`团队「${s.name}」已删除`);
    },
    [j]
  ), h = n((s) => {
    T(s), I(!0);
  }, []), G = n(() => {
    T(null), I(!0);
  }, []), X = t(() => [...O, ...at], [O]), q = t(() => {
    if (!A.trim()) return X;
    const s = A.toLowerCase();
    return X.filter(
      (J) => J.name.toLowerCase().includes(s) || J.description.toLowerCase().includes(s) || J.category.toLowerCase().includes(s)
    );
  }, [X, A]), V = q.filter((s) => s.custom), Z = q.filter((s) => !s.custom);
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
        $,
        { style: { fontSize: 13, color: "#389e0d" } },
        "多智能体协同 — 选择预设团队或创建自定义团队，支持流水线、圆桌讨论、协调者三种编排模式。"
      ),
      r.createElement(
        w,
        {
          type: "primary",
          size: "small",
          icon: R ? r.createElement(R) : void 0,
          onClick: G,
          style: Se
        },
        "创建专家团"
      )
    ),
    // Search
    r.createElement(x, {
      placeholder: "搜索团队名称、描述或类别...",
      prefix: C ? r.createElement(C) : void 0,
      value: A,
      onChange: (s) => D(s.target.value),
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
          $,
          { strong: !0, style: { fontSize: 14 } },
          `自定义团队 (${V.length})`
        )
      ),
      r.createElement(
        y,
        { gutter: [12, 12] },
        ...V.map(
          (s) => r.createElement(
            S,
            { key: s.id, xs: 24, sm: 12, md: 8 },
            r.createElement(Be, {
              team: s,
              agents: e,
              onLaunch: a,
              onEdit: h,
              onDelete: o
            })
          )
        )
      ),
      r.createElement(U, { style: { margin: "16px 0" } })
    ) : null,
    // Preset teams section
    Z.length > 0 ? r.createElement(
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
          $,
          { strong: !0, style: { fontSize: 14 } },
          `预设团队 (${Z.length})`
        ),
        r.createElement(
          $,
          { type: "secondary", style: { fontSize: 12 } },
          "· 行业典型工作流模板"
        )
      ),
      r.createElement(
        y,
        { gutter: [12, 12] },
        ...Z.map(
          (s) => r.createElement(
            S,
            { key: s.id, xs: 24, sm: 12, md: 8 },
            r.createElement(Be, {
              team: s,
              agents: e,
              onLaunch: a
            })
          )
        )
      )
    ) : null,
    // Empty state
    q.length === 0 ? r.createElement(m, {
      description: "未找到匹配的专家团队，点击「创建专家团」自定义",
      image: m.PRESENTED_IMAGE_SIMPLE
    }) : null,
    // Team Builder Modal
    r.createElement(it, {
      open: M,
      onClose: () => {
        I(!1), T(null);
      },
      agents: e,
      editingTeam: _,
      onSaved: g
    })
  );
}
function mt(e) {
  var r;
  const a = [];
  for (const t of e) {
    if (t.enabled === !1) continue;
    const l = (r = t.description) == null ? void 0 : r.trim();
    if (!l) continue;
    let n = l;
    if (n = n.replace(/\*\*(.+?)\*\*/g, "$1").replace(/\*(.+?)\*/g, "$1").replace(/`(.+?)`/g, "$1").replace(/^#+\s*/gm, "").trim(), /^(用于|帮助|提供|支持|实现|完成|分析|计算|生成|创建|检查)/.test(n) ? n = `请${n}` : /^(a |an |the )/i.test(n) ? n = `Help me with ${n}` : /[。？！.?!]$/.test(n) || (n = `帮我${n}`), n.length > 80 && (n = n.substring(0, 77) + "..."), a.push(n), a.length >= 4) break;
  }
  return a;
}
async function dt(e) {
  return await ee("/workspace/files", {
    headers: { "X-Agent-Id": e }
  }) || [];
}
async function ze(e, a, r) {
  await ee(`/workspace/files/${encodeURIComponent(a)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify({ content: r })
  });
}
async function Le(e, a) {
  const r = await Ie(e);
  r.system_prompt_files = a, await ee(`/agents/${encodeURIComponent(e)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(r)
  });
}
async function pt(e, a) {
  await ee("/skills/pool/download", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      skill_name: a,
      targets: [{ workspace_id: e }],
      overwrite: !1
    })
  });
}
async function ut(e, a) {
  await ee(`/skills/${encodeURIComponent(a)}`, {
    method: "DELETE",
    headers: { "X-Agent-Id": e }
  });
}
async function gt(e, a) {
  await ee(`/mcp/${encodeURIComponent(a)}`, {
    method: "DELETE",
    headers: { "X-Agent-Id": e }
  });
}
const je = ["AGENTS.md", "SOUL.md", "PROFILE.md"];
function Pe({
  title: e,
  subtitle: a,
  extra: r
}) {
  const t = p().React, { Space: l } = p().antd;
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
      a ? t.createElement(
        "div",
        { style: { marginTop: 4, fontSize: 13, color: "#8c8c8c" } },
        a
      ) : null
    ),
    r ? t.createElement(l, null, r) : null
  );
}
function De({
  items: e,
  max: a = 5,
  color: r = "blue",
  emptyText: t = "无"
}) {
  const l = p().React, { Tag: n } = p().antd;
  return !e || e.length === 0 ? l.createElement(
    "span",
    { style: { fontSize: 12, color: "#bfbfbf" } },
    t
  ) : l.createElement(
    "div",
    { style: { display: "flex", flexWrap: "wrap", gap: 4 } },
    ...e.slice(0, a).map(
      (i, y) => l.createElement(
        n,
        { key: y, color: r, style: { fontSize: 11, marginRight: 0 } },
        i
      )
    ),
    e.length > a ? l.createElement(
      n,
      { style: { fontSize: 11, marginRight: 0 } },
      `+${e.length - a}`
    ) : null
  );
}
function yt({
  open: e,
  onClose: a,
  poolSkills: r,
  installedSkillNames: t,
  loading: l,
  onInstall: n
}) {
  const i = p().React, { useState: y, useEffect: S, useMemo: x } = i, { Modal: m, Button: z, Empty: c, Spin: w, Input: U, Tag: j, Tooltip: b, Typography: C } = p().antd, { CheckOutlined: W, SearchOutlined: R } = p().antdIcons || {}, { Text: B } = C, [$, A] = y([]), [D, O] = y("");
  S(() => {
    e && (A([]), O(""));
  }, [e]);
  const u = x(() => {
    if (!D.trim()) return r;
    const T = D.toLowerCase();
    return r.filter(
      (g) => {
        var o, h;
        return g.name.toLowerCase().includes(T) || ((o = g.description) == null ? void 0 : o.toLowerCase().includes(T)) || ((h = g.tags) == null ? void 0 : h.some((G) => G.toLowerCase().includes(T)));
      }
    );
  }, [r, D]), M = u.filter(
    (T) => !t.includes(T.name)
  ), I = (T) => {
    A(
      (g) => g.includes(T) ? g.filter((o) => o !== T) : [...g, T]
    );
  }, _ = async () => {
    $.length !== 0 && (await n($), A([]));
  };
  return i.createElement(
    m,
    {
      open: e,
      onCancel: a,
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
          B,
          { type: "secondary", style: { fontSize: 13 } },
          `已选择 ${$.length} 个技能`
        ),
        i.createElement(
          "div",
          { style: { display: "flex", gap: 8 } },
          i.createElement(z, { onClick: a }, "取消"),
          i.createElement(
            z,
            {
              type: "primary",
              onClick: _,
              disabled: $.length === 0
            },
            $.length > 0 ? `添加 (${$.length})` : "添加"
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
      i.createElement(U, {
        placeholder: "搜索技能名称、描述或标签...",
        prefix: R ? i.createElement(R) : void 0,
        value: D,
        onChange: (T) => O(T.target.value),
        allowClear: !0,
        style: { flex: 1 }
      }),
      i.createElement(
        z,
        {
          size: "small",
          type: "primary",
          onClick: () => A(M.map((T) => T.name))
        },
        "全选"
      ),
      i.createElement(
        z,
        {
          size: "small",
          onClick: () => A([])
        },
        "清空"
      )
    ),
    // Skill grid (card style matching Skill Center)
    l ? i.createElement(
      "div",
      { style: { textAlign: "center", padding: 40 } },
      i.createElement(w, { size: "large" })
    ) : u.length === 0 ? i.createElement(c, {
      description: D ? "未找到匹配的技能" : "技能池暂无可用技能",
      image: c.PRESENTED_IMAGE_SIMPLE
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
      ...u.map((T) => {
        const g = $.includes(T.name), o = t.includes(T.name);
        return i.createElement(
          "div",
          {
            key: T.name,
            onClick: () => !o && I(T.name),
            style: {
              position: "relative",
              padding: "10px 12px",
              border: `1px solid ${g ? "#0072f5" : "#e8e8e8"}`,
              borderRadius: 6,
              cursor: o ? "not-allowed" : "pointer",
              transition: "all 0.15s ease",
              background: g ? "rgba(0, 114, 245, 0.06)" : o ? "#fafafa" : "#fff",
              opacity: o ? 0.5 : 1,
              minHeight: 64
            }
          },
          g ? i.createElement(
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
            W ? i.createElement(W) : "✓"
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
                paddingRight: o || g ? 24 : 0
              }
            },
            i.createElement(
              "span",
              { style: { fontSize: 16 } },
              T.emoji || "⚡"
            ),
            i.createElement(
              b,
              { title: T.name },
              i.createElement(
                B,
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
          T.description ? i.createElement(
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
          T.tags && T.tags.length > 0 ? i.createElement(
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
              (h, G) => i.createElement(
                j,
                {
                  key: G,
                  color: "cyan",
                  style: { fontSize: 10, marginRight: 0 }
                },
                h
              )
            )
          ) : null
        );
      })
    )
  );
}
function ft({
  expert: e,
  onClick: a,
  onSummon: r
}) {
  const t = p().React, { Card: l, Tag: n, Badge: i, Typography: y, Spin: S, Button: x } = p().antd, { Text: m } = y, { ThunderboltOutlined: z } = p().antdIcons || {}, { agent: c, skills: w, mcps: U, loading: j } = e, b = c.enabled, C = w.filter((B) => B.enabled !== !1).map((B) => B.name), W = U.map((B) => B.name || B.key), R = c.active_model ? `${c.active_model.provider_id}/${c.active_model.model}` : null;
  return t.createElement(
    l,
    {
      hoverable: !0,
      onClick: a,
      size: "small",
      style: {
        cursor: "pointer",
        transition: "all 0.2s ease",
        borderColor: b ? void 0 : "#d9d9d9",
        opacity: b ? 1 : 0.7,
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
            m,
            { strong: !0, style: { fontSize: 15 } },
            c.name
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
            c.id
          )
        )
      ),
      t.createElement(i, {
        status: b ? "success" : "default",
        text: b ? "启用" : "停用"
      })
    ),
    // Description (rendered as markdown)
    c.description ? t.createElement(
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
      Me(c.description, t)
    ) : t.createElement(
      "div",
      { style: { fontSize: 12, color: "#bfbfbf", marginBottom: 10, minHeight: 54, flex: "1 0 auto" } },
      "暂无描述"
    ),
    // Model info
    R ? t.createElement(
      "div",
      { style: { marginBottom: 8 } },
      t.createElement(
        n,
        { color: "geekblue", style: { fontSize: 11 } },
        `🤖 ${R}`
      )
    ) : null,
    // Skills
    j ? t.createElement(S, { size: "small" }) : t.createElement(
      "div",
      { style: { marginBottom: 6 } },
      t.createElement(
        "div",
        { style: { fontSize: 11, color: "#8c8c8c", marginBottom: 4 } },
        `技能 (${C.length})`
      ),
      t.createElement(De, {
        items: C,
        max: 4,
        color: "cyan",
        emptyText: "未配置技能"
      })
    ),
    // MCP
    !j && W.length > 0 ? t.createElement(
      "div",
      { style: { marginTop: "auto" } },
      t.createElement(
        "div",
        { style: { fontSize: 11, color: "#8c8c8c", marginBottom: 4 } },
        `MCP (${W.length})`
      ),
      t.createElement(De, {
        items: W,
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
        x,
        {
          type: "primary",
          size: "small",
          icon: z ? t.createElement(z) : void 0,
          disabled: !b,
          onClick: (B) => {
            B.stopPropagation(), r && r();
          },
          style: Se
        },
        "召唤专家"
      )
    )
  );
}
function Et({
  expert: e,
  open: a,
  onClose: r,
  onRefresh: t
}) {
  const l = p().React, {
    Drawer: n,
    Descriptions: i,
    Tag: y,
    Typography: S,
    Space: x,
    Button: m,
    Empty: z,
    Tabs: c,
    List: w,
    Spin: U,
    Modal: j,
    message: b
  } = p().antd, { Text: C, Paragraph: W } = S, {
    EditOutlined: R,
    ThunderboltOutlined: B,
    FileTextOutlined: $,
    ToolOutlined: A,
    PlusOutlined: D
  } = p().antdIcons || {}, [O, u] = l.useState(!1), [M, I] = l.useState(
    []
  ), [_, T] = l.useState(!1);
  if (!e) return null;
  const { agent: g, config: o, skills: h, mcps: G, loading: X } = e, q = h.filter((E) => E.enabled !== !1), V = (E) => {
    window.history.pushState({}, "", E), window.dispatchEvent(new PopStateEvent("popstate"));
  }, Z = l.createElement(
    "div",
    null,
    l.createElement(
      i,
      { column: 1, bordered: !0, size: "small" },
      l.createElement(i.Item, { label: "专家名称" }, g.name),
      l.createElement(
        i.Item,
        { label: "专家 ID" },
        l.createElement("code", { style: { fontSize: 12 } }, g.id)
      ),
      l.createElement(
        i.Item,
        { label: "状态" },
        l.createElement(
          y,
          { color: g.enabled ? "green" : "default" },
          g.enabled ? "启用" : "停用"
        )
      ),
      l.createElement(
        i.Item,
        { label: "功能简介" },
        g.description ? Me(g.description, l) : "暂无描述"
      ),
      l.createElement(
        i.Item,
        { label: "使用模型" },
        g.active_model ? `${g.active_model.provider_id} / ${g.active_model.model}` : "使用全局默认模型"
      ),
      o != null && o.workspace_dir ? l.createElement(
        i.Item,
        { label: "工作区路径" },
        l.createElement(
          "code",
          { style: { fontSize: 11 } },
          o.workspace_dir
        )
      ) : null,
      o != null && o.approval_level ? l.createElement(
        i.Item,
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
        $ ? l.createElement($, {
          style: { fontSize: 14, color: "#1677ff" }
        }) : null,
        l.createElement(C, { strong: !0 }, "系统提示词文件")
      ),
      l.createElement(
        x,
        { wrap: !0 },
        ...o.system_prompt_files.map(
          (E, te) => l.createElement(
            y,
            {
              key: te,
              icon: $ ? l.createElement($) : void 0,
              style: { fontSize: 12 }
            },
            E
          )
        )
      )
    ) : null
  ), s = async () => {
    u(!0), T(!0);
    try {
      const E = await He();
      I(E);
    } catch (E) {
      b.error(E.message || "加载技能池失败");
    } finally {
      T(!1);
    }
  }, J = async (E) => {
    let te = 0, ie = 0;
    for (const fe of E)
      try {
        await pt(g.id, fe), te++;
      } catch {
        ie++;
      }
    te > 0 ? (b.success(
      `成功添加 ${te} 个技能${ie > 0 ? `，${ie} 个失败` : ""}`
    ), t()) : ie > 0 && b.error("添加技能失败"), u(!1);
  }, L = async (E) => {
    try {
      await ut(g.id, E), b.success(`技能「${E}」已移除`), t();
    } catch (te) {
      b.error(te.message || "移除技能失败");
    }
  }, K = async (E) => {
    try {
      await gt(g.id, E), b.success(`MCP「${E}」已移除`), t();
    } catch (te) {
      b.error(te.message || "移除 MCP 失败");
    }
  }, Y = X ? l.createElement(
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
        C,
        { strong: !0 },
        `已启用技能 (${q.length})`
      ),
      l.createElement(
        m,
        {
          type: "primary",
          size: "small",
          icon: D ? l.createElement(D) : void 0,
          onClick: s
        },
        "从技能池添加"
      )
    ),
    q.length === 0 ? l.createElement(z, {
      description: "该专家暂无已启用的技能",
      image: z.PRESENTED_IMAGE_SIMPLE
    }) : l.createElement(w, {
      dataSource: q,
      renderItem: (E) => l.createElement(
        w.Item,
        {
          actions: [
            l.createElement(
              m,
              {
                type: "link",
                size: "small",
                danger: !0,
                onClick: () => L(E.name)
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
            E.emoji ? l.createElement(
              "span",
              { style: { fontSize: 16 } },
              E.emoji
            ) : null,
            l.createElement(C, { strong: !0 }, E.name),
            E.version_text ? l.createElement(
              y,
              { style: { fontSize: 10 } },
              `v${E.version_text}`
            ) : null
          ),
          E.description ? l.createElement(
            W,
            {
              type: "secondary",
              style: { fontSize: 12, margin: 0 },
              ellipsis: { rows: 2 }
            },
            E.description
          ) : null,
          E.tags && E.tags.length > 0 ? l.createElement(
            "div",
            { style: { marginTop: 4 } },
            ...E.tags.map(
              (te, ie) => l.createElement(
                y,
                {
                  key: ie,
                  color: "cyan",
                  style: { fontSize: 10 }
                },
                te
              )
            )
          ) : null
        )
      )
    }),
    // Skill Picker Modal (card-grid style, consistent with Skill Center)
    l.createElement(yt, {
      open: O,
      onClose: () => u(!1),
      poolSkills: M,
      installedSkillNames: q.map((E) => E.name),
      loading: _,
      onInstall: J
    })
  ), f = X ? l.createElement(
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
        C,
        { strong: !0 },
        `MCP 客户端 (${G.length})`
      ),
      l.createElement(
        m,
        {
          type: "primary",
          size: "small",
          icon: D ? l.createElement(D) : void 0,
          onClick: () => {
            window.history.pushState({}, "", `/agents/${g.id}/mcp`), window.dispatchEvent(new PopStateEvent("popstate"));
          }
        },
        "配置 MCP"
      )
    ),
    G.length === 0 ? l.createElement(z, {
      description: "该专家暂无关联的 MCP 客户端，点击「配置 MCP」添加",
      image: z.PRESENTED_IMAGE_SIMPLE
    }) : l.createElement(w, {
      dataSource: G,
      renderItem: (E) => l.createElement(
        w.Item,
        {
          actions: [
            l.createElement(
              m,
              {
                type: "link",
                size: "small",
                danger: !0,
                onClick: () => K(E.key)
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
              E.name || E.key
            ),
            l.createElement(
              y,
              {
                color: E.enabled ? "green" : "default",
                style: { fontSize: 10 }
              },
              E.enabled ? "启用" : "停用"
            ),
            l.createElement(
              y,
              { color: "purple", style: { fontSize: 10 } },
              E.transport
            )
          ),
          E.description ? l.createElement(
            W,
            {
              type: "secondary",
              style: { fontSize: 12, margin: 0 },
              ellipsis: { rows: 2 }
            },
            E.description
          ) : null,
          E.tools && E.tools.length > 0 ? l.createElement(
            "div",
            {
              style: {
                marginTop: 4,
                fontSize: 11,
                color: "#8c8c8c"
              }
            },
            `提供 ${E.tools.length} 个工具`
          ) : null
        )
      )
    })
  ), N = o != null && o.tools ? l.createElement(
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
        A ? l.createElement(A, {
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
  ) : l.createElement(z, {
    description: "暂无工具配置",
    image: z.PRESENTED_IMAGE_SIMPLE
  }), Q = [
    { key: "basic", label: "基本信息", children: Z },
    {
      key: "skills",
      label: `技能 (${q.length})`,
      children: Y
    },
    {
      key: "prompts",
      label: "推荐提问",
      children: l.createElement(bt, {
        skills: q,
        agentId: g.id
      })
    },
    {
      key: "knowledge",
      label: "专家记忆",
      children: l.createElement(St, {
        agentId: g.id,
        systemPromptFiles: (o == null ? void 0 : o.system_prompt_files) || [],
        onRefresh: () => t()
      })
    },
    { key: "mcp", label: `MCP (${G.length})`, children: f },
    { key: "tools", label: "工具配置", children: N }
  ];
  return l.createElement(
    n,
    {
      title: l.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 8 } },
        l.createElement("span", { style: { fontSize: 20 } }, "🧑‍🔬"),
        l.createElement("span", null, g.name)
      ),
      open: a,
      onClose: r,
      width: 560,
      extra: l.createElement(
        x,
        null,
        l.createElement(
          m,
          {
            size: "small",
            icon: R ? l.createElement(R) : void 0,
            onClick: () => V("/agents")
          },
          "编辑专家"
        ),
        l.createElement(
          m,
          {
            type: "primary",
            size: "small",
            icon: B ? l.createElement(B) : void 0,
            onClick: () => {
              try {
                const E = p();
                E.setSelectedAgent && E.setSelectedAgent(g.id);
              } catch (E) {
                console.warn("[ugsci] Failed to set selected agent:", E);
              }
              V("/chat");
            }
          },
          "开始对话"
        )
      )
    },
    l.createElement(c, {
      items: Q,
      defaultActiveKey: "basic"
    })
  );
}
function ht({
  open: e,
  onClose: a,
  onCreated: r
}) {
  const t = p().React, { useState: l } = t, {
    Modal: n,
    Card: i,
    Tag: y,
    Input: S,
    Row: x,
    Col: m,
    Spin: z,
    message: c,
    Typography: w
  } = p().antd, { Text: U } = w, { FileAddOutlined: j } = p().antdIcons || {}, [b, C] = l(!1), [W, R] = l(""), [B, $] = l(!1), A = async (u, M) => {
    C(!0);
    try {
      const I = await ee("/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: u || "新专家",
          description: M || "",
          skill_names: []
        })
      });
      await ze(
        I.id,
        "AGENTS.md",
        `# ${u || "新专家"}

请在此处编写该专家的系统提示词。
`
      ), c.success("专家「" + (u || "新专家") + "」创建成功"), $(!1), a(), r();
    } catch (I) {
      c.error(I.message || "创建专家失败");
    } finally {
      C(!1);
    }
  }, D = Oe.filter((u) => {
    if (!W.trim()) return !0;
    const M = W.toLowerCase();
    return u.name.toLowerCase().includes(M) || u.description.toLowerCase().includes(M) || u.category.toLowerCase().includes(M);
  }), O = async (u) => {
    C(!0);
    try {
      const M = await ee("/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: u.name,
          description: u.description,
          skill_names: u.recommendedSkills
        })
      });
      await ze(M.id, "AGENTS.md", u.systemPrompt);
      const I = await Ie(M.id);
      I.approval_level = u.approvalLevel, await ee(`/agents/${encodeURIComponent(M.id)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(I)
      }), c.success(`专家「${u.name}」创建成功`), a(), r();
    } catch (M) {
      c.error(M.message || "创建专家失败");
    } finally {
      C(!1);
    }
  };
  return t.createElement(
    n,
    {
      open: e,
      onCancel: a,
      footer: null,
      title: "选择专家模板",
      width: 800
    },
    t.createElement(
      "div",
      { style: { marginBottom: 16 } },
      t.createElement(S, {
        placeholder: "搜索模板名称或类别...",
        value: W,
        onChange: (u) => R(u.target.value),
        allowClear: !0
      })
    ),
    b ? t.createElement(
      "div",
      { style: { textAlign: "center", padding: 60 } },
      t.createElement(z, { size: "large" }),
      t.createElement(
        "div",
        { style: { marginTop: 12, color: "#8c8c8c" } },
        "正在创建专家..."
      )
    ) : t.createElement(
      x,
      { gutter: [12, 12] },
      // ── Blank template card (always first) ──
      W.trim() ? null : t.createElement(
        m,
        { xs: 24, sm: 12 },
        t.createElement(
          i,
          {
            hoverable: !0,
            size: "small",
            onClick: () => $(!0),
            style: {
              cursor: "pointer",
              height: "100%",
              border: "2px dashed #d9d9d9",
              background: "#fafafa"
            }
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
              { style: { fontSize: 28, color: "#8c8c8c" } },
              j ? t.createElement(j) : "📝"
            ),
            t.createElement(
              "div",
              { style: { flex: 1 } },
              t.createElement(
                U,
                { strong: !0, style: { fontSize: 15 } },
                "从空白模版开始创建"
              ),
              t.createElement(
                "div",
                null,
                t.createElement(
                  y,
                  { color: "default", style: { fontSize: 10 } },
                  "空白"
                )
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
            "创建一个全新的专家，不使用任何预设模板。创建后可自行配置系统提示词、技能和 MCP 客户端。"
          )
        )
      ),
      ...D.map(
        (u) => t.createElement(
          m,
          { key: u.id, xs: 24, sm: 12 },
          t.createElement(
            i,
            {
              hoverable: !0,
              size: "small",
              onClick: () => O(u),
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
                u.emoji
              ),
              t.createElement(
                "div",
                { style: { flex: 1 } },
                t.createElement(
                  U,
                  { strong: !0, style: { fontSize: 15 } },
                  u.name
                ),
                t.createElement(
                  "div",
                  null,
                  t.createElement(
                    y,
                    { color: "blue", style: { fontSize: 10 } },
                    u.category
                  ),
                  u.approvalLevel === "MANUAL" ? t.createElement(
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
              Me(u.description, t)
            )
          )
        )
      )
    ),
    // ── Blank template creation modal ──
    t.createElement(vt, {
      open: B,
      onCancel: () => $(!1),
      onCreate: A
    })
  );
}
function vt({
  open: e,
  onCancel: a,
  onCreate: r
}) {
  const t = p().React, { useState: l } = t, { Modal: n, Input: i, message: y } = p().antd, [S, x] = l(""), [m, z] = l("");
  return t.createElement(
    n,
    {
      open: e,
      title: "从空白模版创建专家",
      onCancel: a,
      onOk: () => {
        if (!S.trim()) {
          y.warning("请输入专家名称");
          return;
        }
        r(S.trim(), m.trim());
      },
      okText: "创建",
      cancelText: "取消",
      destroyOnClose: !0
    },
    t.createElement(
      "div",
      { style: { marginBottom: 16 } },
      t.createElement(
        "div",
        { style: { fontSize: 13, marginBottom: 6, color: "#595959" } },
        "专家名称"
      ),
      t.createElement(i, {
        placeholder: "输入专家名称",
        value: S,
        onChange: (c) => x(c.target.value),
        maxLength: 50
      })
    ),
    t.createElement(
      "div",
      null,
      t.createElement(
        "div",
        { style: { fontSize: 13, marginBottom: 6, color: "#595959" } },
        "专家描述（可选）"
      ),
      t.createElement(i.TextArea, {
        placeholder: "简要描述该专家的职责和能力...",
        value: m,
        onChange: (c) => z(c.target.value),
        rows: 3,
        maxLength: 200
      })
    )
  );
}
function St({
  agentId: e,
  systemPromptFiles: a,
  onRefresh: r
}) {
  const t = p().React, { useState: l, useEffect: n, useCallback: i } = t, {
    List: y,
    Tag: S,
    Switch: x,
    Button: m,
    Modal: z,
    Input: c,
    Spin: w,
    Empty: U,
    message: j,
    Typography: b
  } = p().antd, { FileTextOutlined: C, PlusOutlined: W, EditOutlined: R, ReloadOutlined: B } = p().antdIcons || {}, { Text: $ } = b, [A, D] = l([]), [O, u] = l(!0), [M, I] = l(
    a || []
  ), [_, T] = l(!1), [g, o] = l(null), [h, G] = l(""), [X, q] = l(""), [V, Z] = l(!1), s = i(async () => {
    u(!0);
    try {
      const f = await dt(e);
      D(f);
    } catch (f) {
      j.error(f.message || "加载记忆文件失败"), D([]);
    } finally {
      u(!1);
    }
  }, [e]);
  n(() => {
    s();
  }, [s]), n(() => {
    I(a || []);
  }, [a]);
  const J = async (f, N) => {
    const Q = new Set(M);
    if (N)
      Q.add(f);
    else {
      if (je.includes(f) && f === "AGENTS.md") {
        j.warning("AGENTS.md 是核心文件，不能停用");
        return;
      }
      Q.delete(f);
    }
    const E = Array.from(Q);
    I(E);
    try {
      await Le(e, E), j.success(N ? "已启用记忆文件" : "已停用记忆文件"), r();
    } catch (te) {
      j.error(te.message || "更新失败"), I(a || []);
    }
  }, L = async (f) => {
    try {
      const N = await ee(
        `/workspace/files/${encodeURIComponent(f)}`,
        { headers: { "X-Agent-Id": e } }
      );
      o(f), G(N.content || ""), T(!0);
    } catch (N) {
      j.error(N.message || "读取文件失败");
    }
  }, K = () => {
    o(null), G(""), q(""), T(!0);
  }, Y = async () => {
    const f = g || X.trim();
    if (!f) {
      j.warning("请输入文件名");
      return;
    }
    const N = f.endsWith(".md") ? f : `${f}.md`;
    Z(!0);
    try {
      if (await ze(e, N, h), !g && !M.includes(N)) {
        const Q = [...M, N];
        I(Q), await Le(e, Q);
      }
      j.success("保存成功"), T(!1), s(), r();
    } catch (Q) {
      j.error(Q.message || "保存失败");
    } finally {
      Z(!1);
    }
  };
  return O ? t.createElement(
    "div",
    { style: { textAlign: "center", padding: 40 } },
    t.createElement(w, { size: "large" })
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
          $,
          { strong: !0 },
          `记忆文件 (${A.length})`
        ),
        t.createElement(
          $,
          { type: "secondary", style: { fontSize: 12 } },
          `· 已挂载 ${M.length} 个到专家记忆`
        )
      ),
      t.createElement(
        "div",
        { style: { display: "flex", gap: 8 } },
        t.createElement(
          m,
          {
            size: "small",
            icon: B ? t.createElement(B) : void 0,
            onClick: s
          },
          "刷新"
        ),
        t.createElement(
          m,
          {
            type: "primary",
            size: "small",
            icon: W ? t.createElement(W) : void 0,
            onClick: K
          },
          "新建记忆文件"
        )
      )
    ),
    A.length === 0 ? t.createElement(U, {
      description: "暂无记忆文件，点击「新建记忆文件」添加",
      image: U.PRESENTED_IMAGE_SIMPLE
    }) : t.createElement(y, {
      dataSource: A,
      renderItem: (f) => {
        const N = M.includes(f.filename), Q = je.includes(f.filename);
        return t.createElement(
          y.Item,
          {
            actions: [
              t.createElement(
                m,
                {
                  type: "link",
                  size: "small",
                  icon: R ? t.createElement(R) : void 0,
                  onClick: () => L(f.filename)
                },
                "编辑"
              )
            ]
          },
          t.createElement(y.Item.Meta, {
            avatar: t.createElement(C, {
              style: {
                fontSize: 20,
                color: N ? "#1677ff" : "#bfbfbf"
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
              t.createElement($, null, f.filename),
              Q ? t.createElement(
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
              `${(f.size / 1024).toFixed(1)} KB · 修改于 ${new Date(f.modified_time).toLocaleString()}`
            )
          }),
          t.createElement(x, {
            checked: N,
            size: "small",
            onChange: (E) => J(f.filename, E)
          })
        );
      }
    }),
    // Edit/New file modal
    t.createElement(
      z,
      {
        open: _,
        onCancel: () => T(!1),
        title: g ? `编辑 ${g}` : "新建记忆文件",
        width: 700,
        onOk: Y,
        confirmLoading: V,
        okText: "保存"
      },
      g ? null : t.createElement(
        "div",
        { style: { marginBottom: 12 } },
        t.createElement(c, {
          placeholder: "文件名（如：油藏工程记忆库.md）",
          value: X,
          onChange: (f) => q(f.target.value),
          addonAfter: X.endsWith(".md") ? "" : ".md"
        })
      ),
      t.createElement(c.TextArea, {
        value: h,
        onChange: (f) => G(f.target.value),
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
function bt({
  skills: e,
  agentId: a
}) {
  const r = p().React, { useMemo: t } = r, {
    List: l,
    Tag: n,
    Typography: i,
    Empty: y,
    Button: S,
    message: x
  } = p().antd, { ThunderboltOutlined: m, CopyOutlined: z } = p().antdIcons || {}, { Text: c } = i, w = t(() => mt(e), [e]), U = (b) => {
    try {
      const C = p();
      C.setSelectedAgent && C.setSelectedAgent(a);
    } catch {
    }
    try {
      sessionStorage.setItem("ugsci_pending_prompt", b);
    } catch {
    }
    window.history.pushState({}, "", "/chat"), window.dispatchEvent(new PopStateEvent("popstate"));
  }, j = (b) => {
    var C;
    (C = navigator.clipboard) == null || C.writeText(b).then(() => {
      x.success("已复制到剪贴板");
    });
  };
  return w.length === 0 ? r.createElement(y, {
    description: "暂无推荐提问，请先为专家添加技能",
    image: y.PRESENTED_IMAGE_SIMPLE
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
      m ? r.createElement(m, {
        style: { fontSize: 14, color: "#1677ff" }
      }) : null,
      r.createElement(
        c,
        { strong: !0 },
        `推荐提问 (${w.length})`
      ),
      r.createElement(
        c,
        { type: "secondary", style: { fontSize: 12 } },
        "· 从技能描述中自动提取"
      )
    ),
    r.createElement(l, {
      dataSource: w,
      renderItem: (b, C) => r.createElement(
        l.Item,
        {
          actions: [
            r.createElement(
              S,
              {
                type: "link",
                size: "small",
                icon: z ? r.createElement(z) : void 0,
                onClick: () => j(b)
              },
              "复制"
            )
          ]
        },
        r.createElement(l.Item.Meta, {
          avatar: r.createElement(
            n,
            { color: "blue", style: { borderRadius: "50%" } },
            `${C + 1}`
          ),
          title: r.createElement(
            "div",
            {
              style: {
                cursor: "pointer",
                color: "#1677ff"
              },
              onClick: () => U(b)
            },
            b
          ),
          description: r.createElement(
            c,
            { type: "secondary", style: { fontSize: 12 } },
            "点击直接发送给专家"
          )
        })
      )
    })
  );
}
function xt() {
  var ue;
  const e = p().React, { useState: a, useEffect: r, useCallback: t, useMemo: l } = e, {
    Spin: n,
    Empty: i,
    Input: y,
    Button: S,
    message: x,
    Row: m,
    Col: z,
    Tabs: c,
    Modal: w,
    Typography: U
  } = p().antd, {
    ReloadOutlined: j,
    PlusOutlined: b,
    SearchOutlined: C,
    TeamOutlined: W,
    UserOutlined: R
  } = p().antdIcons || {}, { Text: B, Paragraph: $ } = U, [A, D] = a([]), [O, u] = a(!0), [M, I] = a(!1), [_, T] = a(null), [g, o] = a(""), [h, G] = a(!1), [X, q] = a("experts"), [V, Z] = a(
    null
  ), [s, J] = a(""), [L, K] = a(!1), [Y, f] = a([]), N = t(async () => {
    u(!0);
    try {
      const v = await $e(), F = await Ge().catch(
        () => []
      ), ne = await Promise.all(
        v.map(async (se) => {
          try {
            const [P, oe] = await Promise.all([
              Ie(se.id).catch(() => null),
              Ue(se.id).catch(() => [])
            ]), re = lt(P == null ? void 0 : P.mcp), Ee = F.filter(
              (he) => re.includes(he.key) || re.includes(he.name)
            );
            return {
              agent: se,
              config: P,
              skills: oe,
              mcps: Ee,
              loading: !1
            };
          } catch {
            return {
              agent: se,
              config: null,
              skills: [],
              mcps: [],
              loading: !1
            };
          }
        })
      );
      D(ne), f(v);
    } catch (v) {
      x.error(v.message || "加载专家列表失败"), D([]);
    } finally {
      u(!1);
    }
  }, []);
  r(() => {
    N();
  }, [N]);
  const Q = t(
    async (v) => {
      var P;
      const F = v.coordinatorName || ((P = v.members[0]) == null ? void 0 : P.name);
      if (!F) {
        x.error("无法确定协调者专家");
        return;
      }
      const ne = ke(Y, F);
      if (!ne) {
        x.error(`未找到协调者专家「${F}」，请先创建该专家`);
        return;
      }
      if (/\{.+?\}/.test(v.taskTemplate)) {
        J(""), Z(v);
        return;
      }
      await E(v, ne, v.taskTemplate);
    },
    [Y, x]
  ), E = t(
    async (v, F, ne) => {
      var se;
      K(!0);
      try {
        const P = ot(v), oe = ne ? P.replace(v.taskTemplate, ne) : P, re = p();
        re.setSelectedAgent && re.setSelectedAgent(F), await rt(F, oe), x.success(
          `团队任务已发起，协调者：${v.coordinatorName || ((se = v.members[0]) == null ? void 0 : se.name)}`
        ), Z(null), te("/chat");
      } catch (P) {
        x.error(P.message || "发起团队任务失败");
      } finally {
        K(!1);
      }
    },
    [x]
  ), te = (v) => {
    window.history.pushState({}, "", v), window.dispatchEvent(new PopStateEvent("popstate"));
  }, ie = t((v) => {
    T(v), I(!0);
  }, []), fe = t(
    (v) => {
      if (!v.agent.enabled) {
        x.warning(`专家「${v.agent.name}」未启用，请先启用`);
        return;
      }
      try {
        const F = p();
        F.setSelectedAgent && F.setSelectedAgent(v.agent.id);
      } catch (F) {
        console.warn("[ugsci] Failed to set selected agent:", F);
      }
      x.success(`已召唤专家「${v.agent.name}」，正在跳转至对话...`), te("/chat");
    },
    [x]
  ), ye = l(() => {
    if (!g.trim()) return A;
    const v = g.toLowerCase();
    return A.filter(
      (F) => {
        var ne;
        return F.agent.name.toLowerCase().includes(v) || ((ne = F.agent.description) == null ? void 0 : ne.toLowerCase().includes(v)) || F.agent.id.toLowerCase().includes(v) || F.skills.some((se) => se.name.toLowerCase().includes(v));
      }
    );
  }, [A, g]), k = A.filter((v) => v.agent.enabled).length, H = A.reduce(
    (v, F) => v + F.skills.filter((ne) => ne.enabled !== !1).length,
    0
  ), ae = A.reduce((v, F) => v + F.mcps.length, 0), de = [
    {
      key: "experts",
      label: e.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        R ? e.createElement(R, { style: { fontSize: 14 } }) : null,
        "专家列表"
      ),
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
            value: g,
            onChange: (v) => o(v.target.value),
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
          description: g ? "未找到匹配的专家" : "暂无专家，点击「创建专家」添加"
        }) : e.createElement(
          m,
          { gutter: [12, 12], align: "stretch" },
          ...ye.map(
            (v) => e.createElement(
              z,
              {
                key: v.agent.id,
                xs: 24,
                sm: 12,
                md: 8,
                lg: 6,
                style: { display: "flex" }
              },
              e.createElement(ft, {
                expert: v,
                onClick: () => ie(v),
                onSummon: () => fe(v)
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
      children: e.createElement(ct, {
        agents: Y,
        onLaunch: Q
      })
    }
  ];
  return e.createElement(
    "div",
    { style: { padding: 24 } },
    e.createElement(Pe, {
      title: "专家",
      subtitle: `共 ${A.length} 位专家（${k} 位启用）· ${H} 个技能 · ${ae} 个 MCP 客户端`,
      extra: e.createElement(
        e.Fragment,
        null,
        e.createElement(
          S,
          {
            icon: j ? e.createElement(j) : void 0,
            onClick: N,
            loading: O
          },
          "刷新"
        ),
        e.createElement(
          S,
          {
            type: "primary",
            icon: b ? e.createElement(b) : void 0,
            onClick: () => G(!0),
            style: Se
          },
          "创建专家"
        )
      )
    }),
    e.createElement(c, {
      items: de,
      activeKey: X,
      onChange: (v) => q(v)
    }),
    // Drawer
    e.createElement(Et, {
      expert: _,
      open: M,
      onClose: () => I(!1),
      onRefresh: () => N()
    }),
    // Template Modal
    e.createElement(ht, {
      open: h,
      onClose: () => G(!1),
      onCreated: () => N()
    }),
    // Team Launch Modal (for filling placeholders)
    V ? e.createElement(
      w,
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
        onCancel: () => Z(null),
        onOk: () => {
          var se;
          const v = V.coordinatorName || ((se = V.members[0]) == null ? void 0 : se.name), F = v ? ke(Y, v) : null;
          if (!F) {
            x.error("无法找到协调者专家");
            return;
          }
          let ne = V.taskTemplate;
          s.trim() && (ne = s.trim()), E(V, F, ne);
        },
        confirmLoading: L,
        okText: "发起任务",
        width: 600
      },
      e.createElement(
        "div",
        { style: { marginBottom: 12 } },
        e.createElement(
          B,
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
          B,
          {
            type: "secondary",
            style: { fontSize: 12, display: "block", marginBottom: 8 }
          },
          "输入具体任务描述（替换上面的占位符内容）："
        ),
        e.createElement(y.TextArea, {
          value: s,
          onChange: (v) => J(v.target.value),
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
          B,
          { style: { fontSize: 12, color: "#0958d9" } },
          `协调者: ${V.coordinatorName || ((ue = V.members[0]) == null ? void 0 : ue.name) || "—"} · 成员: ${V.members.map((v) => v.name).join("、")}`
        )
      )
    ) : null
  );
}
function wt({
  mcp: e,
  onClick: a
}) {
  const r = p().React, { Card: t, Tag: l, Badge: n, Typography: i } = p().antd, { Text: y } = i, S = {
    stdio: "💻",
    streamable_http: "🌐",
    sse: "📡"
  };
  return r.createElement(
    t,
    {
      hoverable: !0,
      onClick: a,
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
          S[e.transport] || "🔌"
        ),
        r.createElement(
          y,
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
const _e = {
  reservoir_simulation: "油藏数值模拟",
  geological_modeling: "地质建模",
  well_log_analysis: "测井分析",
  production_engineering: "采油工程",
  post_processing: "后处理与可视化",
  multiphysics: "多物理场仿真"
}, Ke = {
  reservoir_simulation: "🛢️",
  geological_modeling: "🏔️",
  well_log_analysis: "📡",
  production_engineering: "⚙️",
  post_processing: "📊",
  multiphysics: "🔬"
};
async function Ct() {
  return ee("/ugsci/engines/list");
}
async function Tt(e) {
  return ee("/ugsci/engines/", {
    method: "POST",
    body: JSON.stringify(e)
  });
}
async function kt(e, a) {
  return ee(`/ugsci/engines/${encodeURIComponent(e)}`, {
    method: "PUT",
    body: JSON.stringify(a)
  });
}
async function zt(e) {
  return ee(
    `/ugsci/engines/${encodeURIComponent(e)}`,
    { method: "DELETE" }
  );
}
async function It() {
  return ee("/ugsci/engines/detect", {
    method: "POST"
  });
}
function Pt({
  engine: e,
  onClick: a
}) {
  const r = p().React, { Card: t, Tag: l, Typography: n } = p().antd, { Text: i } = n, y = e.status === "detected", S = Ke[e.category] || "📦";
  return r.createElement(
    t,
    {
      hoverable: !0,
      onClick: a,
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
        r.createElement("span", { style: { fontSize: 20 } }, S),
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
        y ? r.createElement(
          l,
          { color: "success", style: { fontSize: 11 } },
          "✅ 已检测"
        ) : e.executable_path ? r.createElement(
          l,
          { color: "warning", style: { fontSize: 11 } },
          "⚠ 路径无效"
        ) : r.createElement(
          l,
          { style: { fontSize: 11 } },
          "🔧 待配置"
        ),
        e.is_default ? r.createElement(
          l,
          { color: "blue", style: { fontSize: 10 } },
          "默认"
        ) : e.is_custom ? r.createElement(
          l,
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
        l,
        { style: { fontSize: 11 } },
        _e[e.category] || e.category
      ) : null,
      e.version ? r.createElement(
        l,
        { color: "blue", style: { fontSize: 11 } },
        `v${e.version}`
      ) : null
    )
  );
}
function Ot() {
  const e = p().React, { useState: a, useEffect: r, useCallback: t, useMemo: l } = e, {
    Spin: n,
    Empty: i,
    Button: y,
    message: S,
    Row: x,
    Col: m,
    Drawer: z,
    Descriptions: c,
    Tag: w,
    Typography: U,
    Modal: j,
    Input: b,
    Alert: C,
    Select: W,
    Popconfirm: R,
    Space: B
  } = p().antd, {
    ReloadOutlined: $,
    SearchOutlined: A,
    PlusOutlined: D,
    EditOutlined: O,
    DeleteOutlined: u,
    CopyOutlined: M,
    ExperimentOutlined: I
  } = p().antdIcons || {}, { Text: _, Paragraph: T } = U, [g, o] = a([]), [h, G] = a(!0), [X, q] = a(""), [V, Z] = a(!1), [s, J] = a(null), [L, K] = a(!1), [Y, f] = a(null), [N, Q] = a({}), [E, te] = a(!1), ie = t(async () => {
    G(!0);
    try {
      const P = await Ct();
      o(P.engines || []);
    } catch (P) {
      S.error(P.message || "加载引擎列表失败"), o([]);
    } finally {
      G(!1);
    }
  }, []);
  r(() => {
    ie();
  }, [ie]);
  const fe = l(() => {
    if (!X.trim()) return g;
    const P = X.toLowerCase();
    return g.filter(
      (oe) => {
        var re;
        return oe.name.toLowerCase().includes(P) || oe.vendor.toLowerCase().includes(P) || oe.category.toLowerCase().includes(P) || ((re = oe.description) == null ? void 0 : re.toLowerCase().includes(P));
      }
    );
  }, [g, X]), ye = g.filter((P) => P.status === "detected").length, k = t((P) => {
    navigator.clipboard.writeText(P).then(() => S.success("路径已复制")).catch(() => S.error("复制失败"));
  }, []), H = t(() => {
    f(null), Q({
      name: "",
      vendor: "",
      version: "",
      executable_path: "",
      category: "",
      description: "",
      invocation_hint: ""
    }), K(!0);
  }, []), ae = t((P) => {
    f(P), Q({ ...P }), K(!0), Z(!1);
  }, []), de = t(async () => {
    var P;
    if (!((P = N.name) != null && P.trim())) {
      S.warning("请输入引擎名称");
      return;
    }
    te(!0);
    try {
      Y ? (await kt(Y.id, N), S.success("引擎已更新")) : (await Tt(N), S.success("引擎已添加")), K(!1), ie();
    } catch (oe) {
      S.error(oe.message || "保存失败");
    } finally {
      te(!1);
    }
  }, [N, Y, ie]), ue = t(
    async (P) => {
      try {
        await zt(P), S.success("引擎已删除"), Z(!1), ie();
      } catch (oe) {
        S.error(oe.message || "删除失败");
      }
    },
    [ie]
  ), v = t(async () => {
    G(!0);
    try {
      const P = await It();
      o(P.engines || []), S.success("自动检测完成");
    } catch (P) {
      S.error(P.message || "检测失败");
    } finally {
      G(!1);
    }
  }, []), F = t(
    (P, oe, re) => {
      const Ee = N[oe] || "";
      return e.createElement(
        "div",
        { style: { marginBottom: 12 } },
        e.createElement(
          _,
          { style: { fontSize: 13, display: "block", marginBottom: 4 } },
          P
        ),
        re != null && re.select ? e.createElement(W, {
          value: Ee || void 0,
          onChange: (he) => Q((ve) => ({ ...ve, [oe]: he })),
          style: { width: "100%" },
          options: re.select.options,
          allowClear: !0,
          placeholder: `选择${P}`
        }) : re != null && re.textarea ? e.createElement(b.TextArea, {
          value: Ee,
          onChange: (he) => Q((ve) => ({ ...ve, [oe]: he.target.value })),
          rows: 3,
          placeholder: `输入${P}`
        }) : e.createElement(b, {
          value: Ee,
          onChange: (he) => Q((ve) => ({ ...ve, [oe]: he.target.value })),
          placeholder: `输入${P}`
        })
      );
    },
    [N]
  ), [ne, se] = a(!0);
  return e.createElement(
    "div",
    null,
    // Summary alert (closable)
    ne ? e.createElement(
      C,
      {
        type: ye > 0 ? "success" : "info",
        message: `共 ${g.length} 个引擎 · ${ye} 个已检测`,
        description: ye > 0 ? "部分引擎已自动检测到安装路径，可在卡片中查看详情。" : "尚未检测到已安装的引擎。可点击「自动检测」或手动添加计算引擎。",
        showIcon: !0,
        closable: !0,
        onClose: () => se(!1),
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
      e.createElement(b, {
        placeholder: "搜索引擎名称、厂商...",
        prefix: A ? e.createElement(A) : void 0,
        value: X,
        onChange: (P) => q(P.target.value),
        allowClear: !0,
        style: { maxWidth: 280 }
      }),
      e.createElement(
        y,
        {
          icon: $ ? e.createElement($) : void 0,
          onClick: v,
          loading: h
        },
        "自动检测"
      ),
      e.createElement(
        y,
        {
          type: "primary",
          icon: D ? e.createElement(D) : void 0,
          onClick: H,
          style: Se
        },
        "添加引擎"
      )
    ),
    // Content
    h ? e.createElement(
      "div",
      { style: { textAlign: "center", padding: 60 } },
      e.createElement(n, {
        size: "large",
        tip: "正在加载计算引擎..."
      })
    ) : fe.length === 0 ? e.createElement(i, {
      description: X ? "无匹配引擎" : "暂无引擎，点击「添加引擎」开始"
    }) : e.createElement(
      x,
      { gutter: [12, 12], align: "stretch" },
      ...fe.map(
        (P) => e.createElement(
          m,
          {
            key: P.id,
            xs: 24,
            sm: 12,
            md: 8,
            lg: 6,
            style: { display: "flex" }
          },
          e.createElement(Pt, {
            engine: P,
            onClick: () => {
              J(P), Z(!0);
            }
          })
        )
      )
    ),
    // Detail drawer
    s ? e.createElement(
      z,
      {
        title: e.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 8 } },
          e.createElement(
            "span",
            { style: { fontSize: 18 } },
            Ke[s.category] || "📦"
          ),
          e.createElement("span", null, s.name)
        ),
        open: V,
        onClose: () => Z(!1),
        width: 520,
        extra: e.createElement(
          B,
          null,
          e.createElement(
            y,
            {
              size: "small",
              icon: O ? e.createElement(O) : void 0,
              onClick: () => ae(s)
            },
            "编辑"
          ),
          s.is_default ? null : e.createElement(
            R,
            {
              title: "确认删除此引擎？",
              description: s.name,
              onConfirm: () => ue(s.id),
              okText: "删除",
              cancelText: "取消",
              okButtonProps: { danger: !0 }
            },
            e.createElement(
              y,
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
        c,
        { column: 1, bordered: !0, size: "small" },
        e.createElement(
          c.Item,
          { label: "引擎名称" },
          s.name
        ),
        e.createElement(
          c.Item,
          { label: "厂商" },
          s.vendor || "—"
        ),
        e.createElement(
          c.Item,
          { label: "分类" },
          s.category ? _e[s.category] || s.category : "—"
        ),
        e.createElement(
          c.Item,
          { label: "状态" },
          e.createElement(
            w,
            {
              color: s.status === "detected" ? "success" : s.status === "not_found" ? "error" : "default"
            },
            s.status === "detected" ? "✅ 已检测" : s.status === "not_found" ? "❌ 路径无效" : "🔧 待配置"
          )
        ),
        e.createElement(
          c.Item,
          { label: "版本" },
          s.version || "—"
        ),
        s.executable_path ? e.createElement(
          c.Item,
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
              y,
              {
                size: "small",
                type: "text",
                icon: M ? e.createElement(M) : void 0,
                onClick: () => k(s.executable_path)
              }
            )
          )
        ) : null,
        s.install_dir ? e.createElement(
          c.Item,
          { label: "安装目录" },
          e.createElement(
            "code",
            { style: { fontSize: 12, wordBreak: "break-all" } },
            s.install_dir
          )
        ) : null,
        s.license_server ? e.createElement(
          c.Item,
          { label: "许可证服务器" },
          s.license_server
        ) : null,
        e.createElement(
          c.Item,
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
          _,
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
          w,
          { color: "blue" },
          "默认引擎"
        ) : s.is_custom ? e.createElement(
          w,
          { color: "purple" },
          "自定义引擎"
        ) : null
      )
    ) : null,
    // Add/Edit modal
    e.createElement(
      j,
      {
        title: Y ? "编辑引擎" : "添加计算引擎",
        open: L,
        onOk: de,
        onCancel: () => K(!1),
        okText: Y ? "保存" : "添加",
        cancelText: "取消",
        confirmLoading: E,
        width: 560
      },
      e.createElement(
        "div",
        { style: { maxHeight: 480, overflow: "auto", paddingRight: 8 } },
        F("引擎名称 *", "name"),
        F("厂商", "vendor"),
        F("版本", "version"),
        F("可执行文件路径", "executable_path"),
        F("安装目录", "install_dir"),
        F("分类", "category", {
          select: {
            options: Object.entries(_e).map(([P, oe]) => ({
              label: oe,
              value: P
            }))
          }
        }),
        F("描述", "description", { textarea: !0 }),
        F("调用方式提示", "invocation_hint", { textarea: !0 }),
        F("许可证服务器", "license_server")
      )
    )
  );
}
function _t() {
  const e = p().React, { useState: a, useEffect: r, useCallback: t, useMemo: l } = e, {
    Spin: n,
    Empty: i,
    Input: y,
    Button: S,
    message: x,
    Row: m,
    Col: z,
    Drawer: c,
    Descriptions: w,
    Tag: U,
    Typography: j,
    List: b,
    Tabs: C
  } = p().antd, {
    ReloadOutlined: W,
    PlusOutlined: R,
    SearchOutlined: B,
    ApiOutlined: $,
    RocketOutlined: A
  } = p().antdIcons || {}, { Text: D } = j, [O, u] = a([]), [M, I] = a(!0), [_, T] = a(""), [g, o] = a(!1), [h, G] = a(null), [X, q] = a("mcp"), V = t(async () => {
    I(!0);
    try {
      const f = await Ge();
      u(f);
    } catch (f) {
      x.error(f.message || "加载能力列表失败"), u([]);
    } finally {
      I(!1);
    }
  }, []);
  r(() => {
    V();
  }, [V]);
  const Z = l(() => {
    if (!_.trim()) return O;
    const f = _.toLowerCase();
    return O.filter(
      (N) => {
        var Q;
        return N.name.toLowerCase().includes(f) || N.key.toLowerCase().includes(f) || ((Q = N.description) == null ? void 0 : Q.toLowerCase().includes(f)) || N.transport.toLowerCase().includes(f);
      }
    );
  }, [O, _]), s = O.filter((f) => f.enabled).length, J = O.reduce((f, N) => {
    var Q;
    return f + (((Q = N.tools) == null ? void 0 : Q.length) || 0);
  }, 0), L = (f) => {
    window.history.pushState({}, "", f), window.dispatchEvent(new PopStateEvent("popstate"));
  }, K = e.createElement(
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
        prefix: B ? e.createElement(B) : void 0,
        value: _,
        onChange: (f) => T(f.target.value),
        allowClear: !0,
        style: { maxWidth: 400 }
      }),
      e.createElement(
        S,
        {
          type: "primary",
          icon: R ? e.createElement(R) : void 0,
          onClick: () => L("/mcp"),
          style: Se
        },
        "管理 MCP"
      )
    ),
    M ? e.createElement(
      "div",
      { style: { textAlign: "center", padding: 60 } },
      e.createElement(n, { size: "large" })
    ) : Z.length === 0 ? e.createElement(i, {
      description: _ ? "未找到匹配的能力" : "暂无 MCP 客户端，点击「管理 MCP」添加"
    }) : e.createElement(
      m,
      { gutter: [12, 12], align: "stretch" },
      ...Z.map(
        (f) => e.createElement(
          z,
          {
            key: f.key,
            xs: 24,
            sm: 12,
            md: 8,
            lg: 6,
            style: { display: "flex" }
          },
          e.createElement(wt, {
            mcp: f,
            onClick: () => {
              G(f), o(!0);
            }
          })
        )
      )
    )
  ), Y = [
    {
      key: "mcp",
      label: e.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        $ ? e.createElement($, { style: { fontSize: 14 } }) : null,
        "MCP 客户端"
      ),
      children: K
    },
    {
      key: "software",
      label: e.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        A ? e.createElement(A, { style: { fontSize: 14 } }) : null,
        "计算引擎"
      ),
      children: e.createElement(Ot)
    }
  ];
  return e.createElement(
    "div",
    { style: { padding: 24 } },
    e.createElement(Pe, {
      title: "工具",
      subtitle: `MCP: ${O.length} 个客户端（${s} 个启用）· ${J} 个工具`,
      extra: e.createElement(
        e.Fragment,
        null,
        e.createElement(
          S,
          {
            icon: W ? e.createElement(W) : void 0,
            onClick: V,
            loading: M
          },
          "刷新"
        )
      )
    }),
    e.createElement(C, {
      items: Y,
      activeKey: X,
      onChange: (f) => q(f)
    }),
    // MCP Detail drawer
    h ? e.createElement(
      c,
      {
        title: e.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 8 } },
          e.createElement("span", { style: { fontSize: 18 } }, "🔌"),
          e.createElement(
            "span",
            null,
            h.name || h.key
          )
        ),
        open: g,
        onClose: () => o(!1),
        width: 480
      },
      e.createElement(
        w,
        { column: 1, bordered: !0, size: "small" },
        e.createElement(
          w.Item,
          { label: "Key" },
          e.createElement(
            "code",
            { style: { fontSize: 12 } },
            h.key
          )
        ),
        e.createElement(
          w.Item,
          { label: "名称" },
          h.name || "-"
        ),
        e.createElement(
          w.Item,
          { label: "描述" },
          h.description || "-"
        ),
        e.createElement(
          w.Item,
          { label: "状态" },
          e.createElement(
            U,
            { color: h.enabled ? "green" : "default" },
            h.enabled ? "启用" : "停用"
          )
        ),
        e.createElement(
          w.Item,
          { label: "传输方式" },
          h.transport
        ),
        h.url ? e.createElement(
          w.Item,
          { label: "URL" },
          h.url
        ) : null,
        h.command ? e.createElement(
          w.Item,
          { label: "命令" },
          e.createElement(
            "code",
            { style: { fontSize: 11 } },
            h.command
          )
        ) : null,
        h.args && h.args.length > 0 ? e.createElement(
          w.Item,
          { label: "参数" },
          h.args.join(" ")
        ) : null
      ),
      h.tools && h.tools.length > 0 ? e.createElement(
        "div",
        { style: { marginTop: 16 } },
        e.createElement(
          D,
          {
            strong: !0,
            style: { display: "block", marginBottom: 8 }
          },
          "提供的工具"
        ),
        e.createElement(b, {
          size: "small",
          dataSource: h.tools,
          renderItem: (f) => e.createElement(
            b.Item,
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
              $ ? e.createElement($, {
                style: { fontSize: 12, color: "#1677ff" }
              }) : null,
              e.createElement(
                D,
                { style: { fontSize: 12 } },
                f
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
function Rt({
  agentId: e,
  agentName: a,
  onNavigate: r
}) {
  const t = p().React, { useState: l, useEffect: n, useCallback: i } = t, {
    Spin: y,
    Empty: S,
    Button: x,
    Row: m,
    Col: z,
    Card: c,
    Tag: w,
    Typography: U,
    Drawer: j,
    Descriptions: b
  } = p().antd, {
    ReloadOutlined: C,
    ThunderboltOutlined: W,
    SettingOutlined: R
  } = p().antdIcons || {}, { Text: B, Paragraph: $ } = U, [A, D] = l([]), [O, u] = l(!0), [M, I] = l(!1), [_, T] = l(null), g = i(async () => {
    if (e) {
      u(!0);
      try {
        const o = await Ue(e);
        D(o);
      } catch {
        D([]);
      } finally {
        u(!1);
      }
    }
  }, [e]);
  return n(() => {
    g();
  }, [g]), t.createElement(
    "div",
    null,
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
        B,
        { type: "secondary", style: { fontSize: 13 } },
        `共 ${A.length} 个技能`
      ),
      t.createElement(
        x,
        {
          icon: C ? t.createElement(C) : void 0,
          onClick: g,
          loading: O,
          size: "small"
        },
        "刷新"
      )
    ),
    O ? t.createElement(
      "div",
      { style: { textAlign: "center", padding: 60 } },
      t.createElement(y, { size: "large" })
    ) : A.length === 0 ? t.createElement(S, {
      description: "当前智能体未加载任何技能"
    }) : t.createElement(
      m,
      { gutter: [12, 12] },
      ...A.map(
        (o) => t.createElement(
          z,
          { key: o.name, xs: 24, sm: 12, md: 8, lg: 6 },
          t.createElement(
            c,
            {
              hoverable: !0,
              size: "small",
              style: { cursor: "pointer", height: "100%" },
              onClick: () => {
                T(o), I(!0);
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
              o.emoji ? t.createElement(
                "span",
                { style: { fontSize: 18 } },
                o.emoji
              ) : t.createElement(
                "span",
                { style: { fontSize: 18 } },
                "⚡"
              ),
              t.createElement(
                B,
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
              o.enabled === !1 ? t.createElement(
                w,
                { color: "default", style: { fontSize: 10 } },
                "已禁用"
              ) : t.createElement(
                w,
                { color: "green", style: { fontSize: 10 } },
                "已启用"
              )
            ),
            o.description ? t.createElement(
              $,
              {
                type: "secondary",
                style: { fontSize: 11, margin: 0, lineHeight: 1.4 },
                ellipsis: { rows: 2 }
              },
              o.description
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
              o.version_text ? t.createElement(
                w,
                { style: { fontSize: 10 } },
                `v${o.version_text}`
              ) : null,
              ...(o.tags || []).slice(0, 3).map(
                (h, G) => t.createElement(
                  w,
                  { key: G, color: "blue", style: { fontSize: 10 } },
                  h
                )
              )
            )
          )
        )
      )
    ),
    // Skill detail drawer
    _ ? t.createElement(
      j,
      {
        title: t.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 8 } },
          t.createElement(
            "span",
            { style: { fontSize: 18 } },
            _.emoji || "⚡"
          ),
          t.createElement("span", null, _.name)
        ),
        open: M,
        onClose: () => I(!1),
        width: 520,
        extra: t.createElement(
          x,
          {
            type: "primary",
            size: "small",
            icon: R ? t.createElement(R) : void 0,
            onClick: () => r("/skills")
          },
          "管理技能"
        )
      },
      t.createElement(
        b,
        { column: 1, bordered: !0, size: "small" },
        t.createElement(
          b.Item,
          { label: "技能名称" },
          _.name
        ),
        t.createElement(
          b.Item,
          { label: "描述" },
          _.description || "-"
        ),
        _.version_text ? t.createElement(
          b.Item,
          { label: "版本" },
          _.version_text
        ) : null,
        t.createElement(
          b.Item,
          { label: "来源" },
          _.source || "-"
        ),
        t.createElement(
          b.Item,
          { label: "状态" },
          _.enabled === !1 ? "已禁用" : "已启用"
        ),
        _.installed_from ? t.createElement(
          b.Item,
          { label: "安装来源" },
          _.installed_from
        ) : null
      ),
      // Tags
      _.tags && _.tags.length > 0 ? t.createElement(
        "div",
        { style: { marginTop: 16 } },
        t.createElement(
          B,
          {
            strong: !0,
            style: { display: "block", marginBottom: 8 }
          },
          "标签"
        ),
        t.createElement(
          "div",
          { style: { display: "flex", flexWrap: "wrap", gap: 4 } },
          ..._.tags.map(
            (o, h) => t.createElement(w, { key: h, color: "blue" }, o)
          )
        )
      ) : null,
      // Skill content preview
      _.content ? t.createElement(
        "div",
        { style: { marginTop: 16 } },
        t.createElement(
          B,
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
          _.content.slice(0, 2e3) + (_.content.length > 2e3 ? `

... (内容已截断)` : "")
        )
      ) : null
    ) : null
  );
}
function $t({
  poolSkills: e,
  workspaceSkills: a,
  agents: r,
  loading: t,
  onReload: l
}) {
  const n = p().React, { useState: i, useMemo: y, useCallback: S } = n, {
    Spin: x,
    Empty: m,
    Input: z,
    Button: c,
    Row: w,
    Col: U,
    Card: j,
    Tag: b,
    Typography: C,
    Drawer: W,
    Descriptions: R,
    List: B
  } = p().antd, {
    ReloadOutlined: $,
    SearchOutlined: A,
    DownloadOutlined: D,
    ThunderboltOutlined: O
  } = p().antdIcons || {}, { Text: u, Paragraph: M } = C, [I, _] = i(""), [T, g] = i(!1), [o, h] = i(null), [G, X] = i([]), q = y(() => {
    if (!I.trim()) return e;
    const s = I.toLowerCase();
    return e.filter(
      (J) => {
        var L, K;
        return J.name.toLowerCase().includes(s) || ((L = J.description) == null ? void 0 : L.toLowerCase().includes(s)) || ((K = J.tags) == null ? void 0 : K.some((Y) => Y.toLowerCase().includes(s)));
      }
    );
  }, [e, I]), V = S(
    (s) => {
      const J = [];
      for (const L of a)
        if (L.skills.some((K) => K.name === s)) {
          const K = r.find((Y) => Y.id === L.agent_id);
          J.push((K == null ? void 0 : K.name) || L.agent_name || L.agent_id);
        }
      return J;
    },
    [a, r]
  ), Z = (s) => {
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
      n.createElement(z, {
        placeholder: "搜索技能名称、描述或标签...",
        prefix: A ? n.createElement(A) : void 0,
        value: I,
        onChange: (s) => _(s.target.value),
        allowClear: !0,
        style: { maxWidth: 400 }
      }),
      n.createElement(
        "div",
        { style: { display: "flex", gap: 8 } },
        n.createElement(
          c,
          {
            icon: $ ? n.createElement($) : void 0,
            onClick: l,
            loading: t,
            size: "small"
          },
          "刷新"
        ),
        n.createElement(
          c,
          {
            type: "primary",
            icon: D ? n.createElement(D) : void 0,
            onClick: () => Z("/skill-pool"),
            size: "small",
            style: Se
          },
          "管理技能池"
        )
      )
    ),
    t ? n.createElement(
      "div",
      { style: { textAlign: "center", padding: 60 } },
      n.createElement(x, { size: "large" })
    ) : q.length === 0 ? n.createElement(m, {
      description: I ? "未找到匹配的技能" : "技能池为空"
    }) : n.createElement(
      w,
      { gutter: [12, 12] },
      ...q.map(
        (s) => n.createElement(
          U,
          { key: s.name, xs: 24, sm: 12, md: 8, lg: 6 },
          n.createElement(
            j,
            {
              hoverable: !0,
              size: "small",
              style: { cursor: "pointer", height: "100%" },
              onClick: () => {
                h(s), X(V(s.name)), g(!0);
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
              s.protected ? n.createElement(
                b,
                { color: "gold", style: { fontSize: 10 } },
                "内置"
              ) : null
            ),
            s.description ? n.createElement(
              M,
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
                b,
                { style: { fontSize: 10 } },
                `v${s.version_text}`
              ) : null,
              ...(s.tags || []).slice(0, 3).map(
                (J, L) => n.createElement(
                  b,
                  { key: L, color: "cyan", style: { fontSize: 10 } },
                  J
                )
              )
            )
          )
        )
      )
    ),
    // Skill detail drawer
    o ? n.createElement(
      W,
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
        open: T,
        onClose: () => g(!1),
        width: 520,
        extra: n.createElement(
          c,
          {
            type: "primary",
            size: "small",
            icon: O ? n.createElement(O) : void 0,
            onClick: () => Z("/skills")
          },
          "管理技能"
        )
      },
      n.createElement(
        R,
        { column: 1, bordered: !0, size: "small" },
        n.createElement(
          R.Item,
          { label: "技能名称" },
          o.name
        ),
        n.createElement(
          R.Item,
          { label: "描述" },
          o.description || "-"
        ),
        o.version_text ? n.createElement(
          R.Item,
          { label: "版本" },
          o.version_text
        ) : null,
        n.createElement(
          R.Item,
          { label: "来源" },
          o.source || "-"
        ),
        n.createElement(
          R.Item,
          { label: "受保护" },
          o.protected ? "是（内置）" : "否"
        ),
        o.sync_status ? n.createElement(
          R.Item,
          { label: "同步状态" },
          o.sync_status
        ) : null,
        o.installed_from ? n.createElement(
          R.Item,
          { label: "安装来源" },
          o.installed_from
        ) : null
      ),
      // Tags
      o.tags && o.tags.length > 0 ? n.createElement(
        "div",
        { style: { marginTop: 16 } },
        n.createElement(
          u,
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
            (s, J) => n.createElement(b, { key: J, color: "cyan" }, s)
          )
        )
      ) : null,
      // Installed agents
      n.createElement(
        "div",
        { style: { marginTop: 16 } },
        n.createElement(
          u,
          { strong: !0, style: { display: "block", marginBottom: 8 } },
          `已安装此技能的专家 (${G.length})`
        ),
        G.length > 0 ? n.createElement(B, {
          size: "small",
          dataSource: G,
          renderItem: (s) => n.createElement(
            B.Item,
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
                u,
                { style: { fontSize: 13 } },
                s
              )
            )
          )
        }) : n.createElement(
          u,
          { type: "secondary", style: { fontSize: 12 } },
          "暂无专家安装此技能"
        )
      )
    ) : null
  );
}
function Mt() {
  const e = p().React, { useState: a, useEffect: r, useCallback: t, useMemo: l } = e, { Tabs: n, message: i } = p().antd, { ThunderboltOutlined: y, AppstoreOutlined: S } = p().antdIcons || {}, m = p().useSelectedAgent, z = m ? m() : null, c = (z == null ? void 0 : z.id) || "default", [w, U] = a([]), [j, b] = a([]), [C, W] = a([]), [R, B] = a(!0), [$, A] = a("agent-skills"), D = t(async () => {
    B(!0);
    try {
      const [I, _, T] = await Promise.all([
        He(),
        $e(),
        nt()
      ]);
      b(I), U(_), W(T);
    } catch (I) {
      i.error(I.message || "加载技能列表失败"), b([]);
    } finally {
      B(!1);
    }
  }, []);
  r(() => {
    D();
  }, [D]);
  const O = l(() => {
    const I = w.find((_) => _.id === c);
    return (I == null ? void 0 : I.name) || c;
  }, [w, c]), u = (I) => {
    window.history.pushState({}, "", I), window.dispatchEvent(new PopStateEvent("popstate"));
  }, M = [
    {
      key: "agent-skills",
      label: e.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        y ? e.createElement(y, { style: { fontSize: 14 } }) : null,
        "当前Agent加载技能"
      ),
      children: e.createElement(Rt, {
        agentId: c,
        agentName: O,
        onNavigate: u
      })
    },
    {
      key: "skill-pool",
      label: e.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        S ? e.createElement(S, { style: { fontSize: 14 } }) : null,
        "技能池"
      ),
      children: e.createElement($t, {
        poolSkills: j,
        workspaceSkills: C,
        agents: w,
        loading: R,
        onReload: D
      })
    }
  ];
  return e.createElement(
    "div",
    { style: { padding: 24 } },
    e.createElement(Pe, {
      title: "技能",
      subtitle: `技能池共 ${j.length} 个技能 · 当前智能体：${O}`
    }),
    e.createElement(n, {
      items: M,
      activeKey: $,
      onChange: (I) => A(I)
    })
  );
}
async function At() {
  return ee("/market/providers");
}
async function Bt(e) {
  return ee(
    `/market/categories?lang=${encodeURIComponent(e)}`
  );
}
async function Lt(e, a, r, t, l) {
  return ee("/market/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: e,
      provider_pages: a,
      limit: r,
      lang: t,
      category: l || void 0
    })
  });
}
async function jt(e, a, r) {
  return ee("/skills/hub/install/start", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify({
      bundle_url: a,
      enable: r
    })
  });
}
async function Dt(e, a) {
  return ee(
    `/skills/hub/install/status/${encodeURIComponent(a)}`,
    {
      headers: { "X-Agent-Id": e }
    }
  );
}
function Nt() {
  const e = p().React, { useState: a, useEffect: r, useCallback: t, useMemo: l, useRef: n } = e, {
    Spin: i,
    Empty: y,
    Input: S,
    Button: x,
    message: m,
    Row: z,
    Col: c,
    Card: w,
    Tag: U,
    Tooltip: j,
    Typography: b,
    Select: C,
    Drawer: W,
    Descriptions: R,
    Tabs: B,
    Badge: $,
    Progress: A
  } = p().antd, {
    ReloadOutlined: D,
    SearchOutlined: O,
    DownloadOutlined: u,
    AppstoreOutlined: M,
    ShopOutlined: I,
    CheckCircleOutlined: _,
    LoadingOutlined: T,
    UserOutlined: g
  } = p().antdIcons || {}, { Text: o, Paragraph: h, Title: G } = b, [X, q] = a("skills"), [V, Z] = a([]), [s, J] = a([]), [L, K] = a([]), [Y, f] = a(""), [N, Q] = a(""), [E, te] = a(!1), [ie, fe] = a(!1), [ye, k] = a(
    {}
  ), [H, ae] = a(null), [de, ue] = a({}), [v, F] = a([]), [ne, se] = a(""), [P, oe] = a(""), re = n(null);
  r(() => {
    Promise.all([
      At().catch(() => []),
      Bt("zh").catch(() => []),
      $e().catch(() => [])
    ]).then(([d, le, ce]) => {
      Z(d), J(le), F(ce), ce.length > 0 && se(ce[0].id);
    });
  }, []);
  const Ee = t(
    async (d, le, ce) => {
      te(!0);
      try {
        const pe = await Lt(
          d,
          ce,
          20,
          "zh",
          le || void 0
        );
        ce === void 0 || Object.keys(ce).length === 0 ? K(pe.results) : K((me) => [...me, ...pe.results]);
        const we = Object.values(pe.by_provider || {}).some(
          (me) => me.has_more
        );
        fe(we);
        const ge = {};
        for (const [me, be] of Object.entries(pe.by_provider || {}))
          ge[me] = (ce[me] || 1) + 1;
        if (k(ge), pe.errors.length > 0)
          for (const me of pe.errors)
            console.warn(
              `[ugsci] Market provider '${me.provider}' error: ${me.message}`
            );
      } catch (pe) {
        m.error(pe.message || "搜索市场失败"), K([]);
      } finally {
        te(!1);
      }
    },
    []
  );
  r(() => (re.current && clearTimeout(re.current), re.current = setTimeout(() => {
    Ee(Y, N, {});
  }, 400), () => {
    re.current && clearTimeout(re.current);
  }), [Y, N, Ee]);
  const he = () => {
    Ee(Y, N, ye);
  }, ve = async (d) => {
    var ce;
    if (!ne) {
      m.warning("请先选择安装目标专家");
      return;
    }
    const le = `${d.source}:${d.slug}`;
    try {
      ue((ge) => ({ ...ge, [le]: "starting" }));
      const pe = await jt(
        ne,
        d.source_url,
        !0
      );
      ue((ge) => ({ ...ge, [le]: "installing" }));
      const we = 60;
      for (let ge = 0; ge < we; ge++) {
        await new Promise((be) => setTimeout(be, 2e3));
        const me = await Dt(
          ne,
          pe.task_id
        );
        if (me.status === "completed" && ((ce = me.result) != null && ce.installed)) {
          m.success(`技能「${me.result.name || d.name}」安装成功`), ue((be) => {
            const Ce = { ...be };
            return delete Ce[le], Ce;
          });
          return;
        }
        if (me.status === "failed")
          throw new Error(me.error || "安装失败");
        if (me.status === "cancelled") {
          m.info("安装已取消"), ue((be) => {
            const Ce = { ...be };
            return delete Ce[le], Ce;
          });
          return;
        }
      }
      throw new Error("安装超时");
    } catch (pe) {
      m.error(pe.message || "安装技能失败"), ue((we) => {
        const ge = { ...we };
        return delete ge[le], ge;
      });
    }
  }, Xe = (d) => {
    window.history.pushState({}, "", d), window.dispatchEvent(new PopStateEvent("popstate"));
  }, Ae = V.filter((d) => d.available), qe = e.createElement(
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
        prefix: O ? e.createElement(O) : void 0,
        value: Y,
        onChange: (d) => f(d.target.value),
        allowClear: !0,
        style: { flex: 1, minWidth: 200, maxWidth: 400 }
      }),
      s.length > 0 ? e.createElement(C, {
        value: N || void 0,
        onChange: (d) => Q(d || ""),
        placeholder: "全部分类",
        allowClear: !0,
        style: { minWidth: 150 },
        options: [
          { value: "", label: "全部分类" },
          ...s.map((d) => ({ value: d.id, label: d.label }))
        ]
      }) : null,
      // Install target selector
      e.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 4 } },
        e.createElement(
          o,
          { type: "secondary", style: { fontSize: 12 } },
          "安装到"
        ),
        e.createElement(C, {
          value: ne || void 0,
          onChange: (d) => se(d),
          style: { minWidth: 140 },
          placeholder: "选择专家",
          options: v.map((d) => ({ value: d.id, label: d.name }))
        })
      )
    ),
    // Provider badges
    Ae.length > 0 ? e.createElement(
      "div",
      {
        style: {
          marginBottom: 12,
          display: "flex",
          gap: 4,
          flexWrap: "wrap"
        }
      },
      ...Ae.map(
        (d) => e.createElement(
          U,
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
    E && L.length === 0 ? e.createElement(
      "div",
      { style: { textAlign: "center", padding: 60 } },
      e.createElement(i, { size: "large" })
    ) : L.length === 0 ? e.createElement(y, {
      description: Y ? `未找到匹配「${Y}」的技能` : "输入关键词搜索技能市场",
      image: y.PRESENTED_IMAGE_SIMPLE
    }) : e.createElement(
      z,
      { gutter: [12, 12] },
      ...L.map((d) => {
        const le = `${d.source}:${d.slug}`, ce = de[le];
        return e.createElement(
          c,
          { key: le, xs: 24, sm: 12, md: 8, lg: 6 },
          e.createElement(
            w,
            {
              hoverable: !0,
              size: "small",
              style: { height: "100%", cursor: "pointer" },
              onClick: () => ae(d)
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
                j,
                { title: d.name },
                e.createElement(
                  o,
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
              h,
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
                  U,
                  { color: "geekblue", style: { fontSize: 10 } },
                  d.source
                ),
                d.version ? e.createElement(
                  U,
                  { style: { fontSize: 10 } },
                  `v${d.version}`
                ) : null
              ),
              ce ? e.createElement(
                x,
                {
                  size: "small",
                  disabled: !0,
                  icon: T ? e.createElement(T) : void 0
                },
                ce === "starting" ? "启动中" : "安装中"
              ) : e.createElement(
                x,
                {
                  type: "primary",
                  size: "small",
                  icon: u ? e.createElement(u) : void 0,
                  onClick: (pe) => {
                    pe.stopPropagation(), ve(d);
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
    ie && !E ? e.createElement(
      "div",
      { style: { textAlign: "center", marginTop: 16 } },
      e.createElement(
        x,
        { onClick: he, loading: E },
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
        onClose: () => ae(null),
        width: 480,
        extra: e.createElement(
          x,
          {
            type: "primary",
            icon: u ? e.createElement(u) : void 0,
            onClick: () => {
              ve(H);
            }
          },
          "安装到专家"
        )
      },
      e.createElement(
        R,
        { column: 1, bordered: !0, size: "small" },
        e.createElement(
          R.Item,
          { label: "来源" },
          H.source
        ),
        e.createElement(
          R.Item,
          { label: "描述" },
          H.description || "-"
        ),
        H.version ? e.createElement(
          R.Item,
          { label: "版本" },
          H.version
        ) : null,
        H.author ? e.createElement(
          R.Item,
          { label: "作者" },
          H.author
        ) : null,
        e.createElement(
          R.Item,
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
          o,
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
            ([d, le]) => e.createElement(
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
                String(le)
              ),
              e.createElement(
                o,
                { type: "secondary", style: { fontSize: 11 } },
                d
              )
            )
          )
        )
      ) : null
    ) : null
  ), Ye = l(() => {
    if (!P.trim()) return Oe;
    const d = P.toLowerCase();
    return Oe.filter(
      (le) => le.name.toLowerCase().includes(d) || le.description.toLowerCase().includes(d) || le.category.toLowerCase().includes(d)
    );
  }, [P]), Qe = async (d) => {
    try {
      const le = await ee("/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: d.name,
          description: d.description,
          skill_names: d.recommendedSkills
        })
      });
      await ze(le.id, "AGENTS.md", d.systemPrompt);
      const ce = await Ie(le.id);
      ce.approval_level = d.approvalLevel, await ee(`/agents/${encodeURIComponent(le.id)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ce)
      }), m.success(`专家「${d.name}」创建成功，已跳转至专家`), Xe("/ugsci-experts");
    } catch (le) {
      m.error(le.message || "创建专家失败");
    }
  }, Ze = e.createElement(
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
        o,
        { style: { fontSize: 13, color: "#1f4e8c" } },
        "从专家模板库选择预设专家，一键创建并配置系统提示词、审批级别和推荐技能。未来将支持从远程市场获取更多行业专家模板。"
      )
    ),
    e.createElement(S, {
      placeholder: "搜索专家模板...",
      prefix: O ? e.createElement(O) : void 0,
      value: P,
      onChange: (d) => oe(d.target.value),
      allowClear: !0,
      style: { marginBottom: 16, maxWidth: 400 }
    }),
    e.createElement(
      z,
      { gutter: [12, 12] },
      ...Ye.map(
        (d) => e.createElement(
          c,
          { key: d.id, xs: 24, sm: 12, md: 8 },
          e.createElement(
            w,
            {
              hoverable: !0,
              size: "small",
              style: { height: "100%", cursor: "pointer" },
              onClick: () => Qe(d)
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
                  o,
                  { strong: !0, style: { fontSize: 14 } },
                  d.name
                ),
                e.createElement(
                  "div",
                  { style: { display: "flex", gap: 4, marginTop: 4 } },
                  e.createElement(
                    U,
                    { color: "blue", style: { fontSize: 10 } },
                    d.category
                  ),
                  d.approvalLevel === "MANUAL" ? e.createElement(
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
              h,
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
                o,
                { type: "secondary", style: { fontSize: 11 } },
                `推荐 ${d.recommendedSkills.length} 个技能`
              ),
              e.createElement(
                x,
                {
                  type: "primary",
                  size: "small",
                  icon: M ? e.createElement(M) : void 0
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
        o,
        { type: "secondary", style: { fontSize: 12 } },
        "更多专家模板持续更新中，未来将支持 OpenScience、RPA 等行业扩展"
      )
    )
  ), et = [
    {
      key: "skills",
      label: e.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        M ? e.createElement(M, { style: { fontSize: 14 } }) : null,
        "技能市场"
      ),
      children: qe
    },
    {
      key: "experts",
      label: e.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        g ? e.createElement(g, { style: { fontSize: 14 } }) : null,
        "专家模板"
      ),
      children: Ze
    }
  ];
  return e.createElement(
    "div",
    { style: { padding: 24 } },
    e.createElement(Pe, {
      title: "市场",
      subtitle: "浏览技能市场 · 选择专家模板 · 随时更新能力和专家",
      extra: e.createElement(
        x,
        {
          icon: D ? e.createElement(D) : void 0,
          onClick: () => Ee(Y, N, {}),
          loading: E
        },
        "刷新"
      )
    }),
    e.createElement(B, {
      items: et,
      activeKey: X,
      onChange: (d) => q(d)
    })
  );
}
function Ft() {
  var x;
  const e = window.QwenPaw;
  if (!(e != null && e.menu) || !(e != null && e.route)) {
    console.warn(
      "[ugsci] QwenPaw.menu/route API not available — plugin disabled"
    );
    return;
  }
  const a = p().React, r = "ugsci", t = p().antdIcons || {}, l = t.UserSwitchOutlined, n = t.ToolOutlined, i = t.ThunderboltOutlined, y = t.ShopOutlined;
  e.route.add(r, {
    id: "ugsci.experts",
    path: "/ugsci-experts",
    component: xt
  }), e.menu.add(r, {
    id: "ugsci.experts",
    location: "primary.agentScoped",
    label: () => "专家",
    icon: l ? a.createElement(l, { style: { fontSize: 16 } }) : void 0,
    route: "ugsci.experts",
    order: 5,
    visible: () => xe()
  }), e.route.add(r, {
    id: "ugsci.capabilities",
    path: "/ugsci-capabilities",
    component: _t
  }), e.menu.add(r, {
    id: "ugsci.capabilities",
    location: "primary.agentScoped",
    label: () => "工具",
    icon: n ? a.createElement(n, { style: { fontSize: 16 } }) : void 0,
    route: "ugsci.capabilities",
    order: 6,
    visible: () => xe()
  }), e.route.add(r, {
    id: "ugsci.skills-center",
    path: "/ugsci-skills",
    component: Mt
  }), e.menu.add(r, {
    id: "ugsci.skills-center",
    location: "primary.agentScoped",
    label: () => "技能",
    icon: i ? a.createElement(i, { style: { fontSize: 16 } }) : void 0,
    route: "ugsci.skills-center",
    order: 7,
    visible: () => xe()
  }), e.route.add(r, {
    id: "ugsci.market",
    path: "/ugsci-market",
    component: Nt
  }), e.menu.add(r, {
    id: "ugsci.market",
    location: "primary.agentScoped",
    label: () => "市场",
    icon: y ? a.createElement(y, { style: { fontSize: 16 } }) : void 0,
    route: "ugsci.market",
    order: 8,
    visible: () => xe()
  }), (x = e.sidebar) != null && x.registerSimpleModeItems ? (e.sidebar.registerSimpleModeItems([
    "ugsci.experts",
    "ugsci.capabilities",
    "ugsci.skills-center",
    "ugsci.market"
  ]), console.info("[ugsci] Registered 4 items for simple-mode visibility")) : console.warn(
    "[ugsci] window.QwenPaw.sidebar.registerSimpleModeItems not available — items will not appear in simple mode"
  );
  const S = [
    "core.skills",
    "core.tools",
    "core.mcp",
    "core.acp",
    "core.agent-config",
    "core.agent-stats",
    "core.skill-pool"
  ];
  for (const m of S) {
    try {
      const c = e.menu.snapshot("primary.agentScoped").find((w) => w.id === m);
      c && e.menu.replace(r, m, {
        ...c,
        visible: () => !xe()
      });
    } catch {
    }
    try {
      const c = e.menu.snapshot("primary.settings").find((w) => w.id === m);
      c && e.menu.replace(r, m, {
        ...c,
        visible: () => !xe()
      });
    } catch {
    }
  }
  console.info(
    "[ugsci] Plugin registered: 4 routes + menu items, simple-mode whitelist + simplified navigation active"
  );
}
function Re() {
  try {
    Ft();
  } catch (e) {
    console.error("[ugsci] Failed to build plugin:", e), setTimeout(Re, 500);
  }
}
var Ne;
if ((Ne = window.QwenPaw) != null && Ne.host)
  Re();
else {
  const e = setInterval(() => {
    var a;
    (a = window.QwenPaw) != null && a.host && (clearInterval(e), Re());
  }, 200);
  setTimeout(() => clearInterval(e), 1e4);
}
