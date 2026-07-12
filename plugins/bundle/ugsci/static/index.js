function v() {
  var a;
  const e = (a = window.QwenPaw) == null ? void 0 : a.host;
  if (!e) throw new Error("[ugsci] QwenPaw.host not available");
  return e;
}
function de() {
  try {
    return v().getApiToken() || "";
  } catch {
    return "";
  }
}
function pe(e) {
  return v().getApiUrl(e);
}
function ge(e) {
  const a = de();
  return {
    "Content-Type": "application/json",
    ...a ? { Authorization: `Bearer ${a}` } : {},
    ...e
  };
}
async function G(e, a) {
  const n = await fetch(pe(e), {
    ...a,
    headers: { ...ge(), ...(a == null ? void 0 : a.headers) || {} }
  });
  if (!n.ok) {
    const l = await n.text().catch(() => "");
    throw new Error(l || `HTTP ${n.status}`);
  }
  return n.status === 204 ? null : n.json();
}
async function se() {
  const e = await G("/agents");
  return (e == null ? void 0 : e.agents) || [];
}
async function Z(e) {
  return G(`/agents/${encodeURIComponent(e)}`);
}
async function ue(e) {
  return await G("/skills", {
    headers: { "X-Agent-Id": e }
  }) || [];
}
async function oe() {
  return await G("/skills/pool") || [];
}
async function ye() {
  return await G("/skills/workspaces") || [];
}
async function ie() {
  return await G("/mcp") || [];
}
function Ee(e) {
  if (!e || typeof e != "object") return [];
  const a = e, n = a.mcpServers || a;
  return !n || typeof n != "object" ? [] : Object.keys(n).filter((l) => l !== "mcpServers");
}
function Q() {
  try {
    return localStorage.getItem("qwenpaw_sidebar_mode") === "simple";
  } catch {
    return !1;
  }
}
function ee(e, a) {
  const n = v();
  return n.ReactMarkdown && n.remarkGfm ? a.createElement(
    n.ReactMarkdown,
    { remarkPlugins: [n.remarkGfm] },
    e
  ) : e.replace(/\*\*(.+?)\*\*/g, "$1").replace(/\*(.+?)\*/g, "$1").replace(/`(.+?)`/g, "$1").replace(/^#+\s*/gm, "").replace(/^[-*]\s+/gm, "• ");
}
const fe = [
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
];
function he(e) {
  var n;
  const a = [];
  for (const l of e) {
    if (l.enabled === !1) continue;
    const t = (n = l.description) == null ? void 0 : n.trim();
    if (!t) continue;
    let m = t;
    if (m = m.replace(/\*\*(.+?)\*\*/g, "$1").replace(/\*(.+?)\*/g, "$1").replace(/`(.+?)`/g, "$1").replace(/^#+\s*/gm, "").trim(), /^(用于|帮助|提供|支持|实现|完成|分析|计算|生成|创建|检查)/.test(m) ? m = `请${m}` : /^(a |an |the )/i.test(m) ? m = `Help me with ${m}` : /[。？！.?!]$/.test(m) || (m = `帮我${m}`), m.length > 80 && (m = m.substring(0, 77) + "..."), a.push(m), a.length >= 4) break;
  }
  return a;
}
async function ve(e) {
  return await G("/workspace/files", {
    headers: { "X-Agent-Id": e }
  }) || [];
}
async function ce(e, a, n) {
  await G(`/workspace/files/${encodeURIComponent(a)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify({ content: n })
  });
}
async function ne(e, a) {
  const n = await Z(e);
  n.system_prompt_files = a, await G(`/agents/${encodeURIComponent(e)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(n)
  });
}
async function we(e, a) {
  await G("/skills/pool/download", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      skill_name: a,
      targets: [{ workspace_id: e }],
      overwrite: !1
    })
  });
}
async function Se(e, a) {
  await G(`/skills/${encodeURIComponent(a)}`, {
    method: "DELETE",
    headers: { "X-Agent-Id": e }
  });
}
async function be(e, a) {
  await G(`/mcp/${encodeURIComponent(a)}`, {
    method: "DELETE",
    headers: { "X-Agent-Id": e }
  });
}
const le = ["AGENTS.md", "SOUL.md", "PROFILE.md"];
function te({
  title: e,
  subtitle: a,
  extra: n
}) {
  const l = v().React, { Space: t } = v().antd;
  return l.createElement(
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
    l.createElement(
      "div",
      null,
      l.createElement(
        "h2",
        { style: { margin: 0, fontSize: 20, fontWeight: 600 } },
        e
      ),
      a ? l.createElement(
        "div",
        { style: { marginTop: 4, fontSize: 13, color: "#8c8c8c" } },
        a
      ) : null
    ),
    n ? l.createElement(t, null, n) : null
  );
}
function ae({
  items: e,
  max: a = 5,
  color: n = "blue",
  emptyText: l = "无"
}) {
  const t = v().React, { Tag: m } = v().antd;
  return !e || e.length === 0 ? t.createElement(
    "span",
    { style: { fontSize: 12, color: "#bfbfbf" } },
    l
  ) : t.createElement(
    "div",
    { style: { display: "flex", flexWrap: "wrap", gap: 4 } },
    ...e.slice(0, a).map(
      (o, E) => t.createElement(
        m,
        { key: E, color: n, style: { fontSize: 11, marginRight: 0 } },
        o
      )
    ),
    e.length > a ? t.createElement(
      m,
      { style: { fontSize: 11, marginRight: 0 } },
      `+${e.length - a}`
    ) : null
  );
}
function Ce({
  open: e,
  onClose: a,
  poolSkills: n,
  installedSkillNames: l,
  loading: t,
  onInstall: m
}) {
  const o = v().React, { useState: E, useEffect: k, useMemo: z } = o, { Modal: P, Button: T, Empty: M, Spin: f, Input: R, Tag: b, Tooltip: g, Typography: u } = v().antd, { CheckOutlined: B, SearchOutlined: N } = v().antdIcons || {}, { Text: j } = u, [c, h] = E([]), [x, W] = E("");
  k(() => {
    e && (h([]), W(""));
  }, [e]);
  const D = z(() => {
    if (!x.trim()) return n;
    const d = x.toLowerCase();
    return n.filter(
      (s) => {
        var p, A;
        return s.name.toLowerCase().includes(d) || ((p = s.description) == null ? void 0 : p.toLowerCase().includes(d)) || ((A = s.tags) == null ? void 0 : A.some((y) => y.toLowerCase().includes(d)));
      }
    );
  }, [n, x]), O = D.filter(
    (d) => !l.includes(d.name)
  ), U = (d) => {
    h(
      (s) => s.includes(d) ? s.filter((p) => p !== d) : [...s, d]
    );
  }, V = async () => {
    c.length !== 0 && (await m(c), h([]));
  };
  return o.createElement(
    P,
    {
      open: e,
      onCancel: a,
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
          j,
          { type: "secondary", style: { fontSize: 13 } },
          `已选择 ${c.length} 个技能`
        ),
        o.createElement(
          "div",
          { style: { display: "flex", gap: 8 } },
          o.createElement(T, { onClick: a }, "取消"),
          o.createElement(
            T,
            {
              type: "primary",
              onClick: V,
              disabled: c.length === 0
            },
            c.length > 0 ? `添加 (${c.length})` : "添加"
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
      o.createElement(R, {
        placeholder: "搜索技能名称、描述或标签...",
        prefix: N ? o.createElement(N) : void 0,
        value: x,
        onChange: (d) => W(d.target.value),
        allowClear: !0,
        style: { flex: 1 }
      }),
      o.createElement(
        T,
        {
          size: "small",
          type: "primary",
          onClick: () => h(O.map((d) => d.name))
        },
        "全选"
      ),
      o.createElement(
        T,
        {
          size: "small",
          onClick: () => h([])
        },
        "清空"
      )
    ),
    // Skill grid (card style matching Skill Center)
    t ? o.createElement(
      "div",
      { style: { textAlign: "center", padding: 40 } },
      o.createElement(f, { size: "large" })
    ) : D.length === 0 ? o.createElement(M, {
      description: x ? "未找到匹配的技能" : "技能池暂无可用技能",
      image: M.PRESENTED_IMAGE_SIMPLE
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
      ...D.map((d) => {
        const s = c.includes(d.name), p = l.includes(d.name);
        return o.createElement(
          "div",
          {
            key: d.name,
            onClick: () => !p && U(d.name),
            style: {
              position: "relative",
              padding: "10px 12px",
              border: `1px solid ${s ? "#0072f5" : "#e8e8e8"}`,
              borderRadius: 6,
              cursor: p ? "not-allowed" : "pointer",
              transition: "all 0.15s ease",
              background: s ? "rgba(0, 114, 245, 0.06)" : p ? "#fafafa" : "#fff",
              opacity: p ? 0.5 : 1,
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
            B ? o.createElement(B) : "✓"
          ) : null,
          p ? o.createElement(
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
                paddingRight: p || s ? 24 : 0
              }
            },
            o.createElement(
              "span",
              { style: { fontSize: 16 } },
              d.emoji || "⚡"
            ),
            o.createElement(
              g,
              { title: d.name },
              o.createElement(
                j,
                {
                  strong: !0,
                  style: {
                    fontSize: 13,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap"
                  }
                },
                d.name
              )
            )
          ),
          d.description ? o.createElement(
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
            d.description
          ) : null,
          d.tags && d.tags.length > 0 ? o.createElement(
            "div",
            {
              style: {
                marginTop: 4,
                display: "flex",
                gap: 2,
                flexWrap: "wrap"
              }
            },
            ...d.tags.slice(0, 2).map(
              (A, y) => o.createElement(
                b,
                {
                  key: y,
                  color: "cyan",
                  style: { fontSize: 10, marginRight: 0 }
                },
                A
              )
            )
          ) : null
        );
      })
    )
  );
}
function ke({
  expert: e,
  onClick: a
}) {
  const n = v().React, { Card: l, Tag: t, Badge: m, Typography: o, Spin: E } = v().antd, { Text: k } = o, { agent: z, skills: P, mcps: T, loading: M } = e, f = z.enabled, R = P.filter((u) => u.enabled !== !1).map((u) => u.name), b = T.map((u) => u.name || u.key), g = z.active_model ? `${z.active_model.provider_id}/${z.active_model.model}` : null;
  return n.createElement(
    l,
    {
      hoverable: !0,
      onClick: a,
      size: "small",
      style: {
        cursor: "pointer",
        transition: "all 0.2s ease",
        borderColor: f ? void 0 : "#d9d9d9",
        opacity: f ? 1 : 0.7
      }
    },
    n.createElement(
      "div",
      {
        style: {
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 8
        }
      },
      n.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 8 } },
        n.createElement("span", { style: { fontSize: 20 } }, "🧑‍🔬"),
        n.createElement(
          "div",
          null,
          n.createElement(
            k,
            { strong: !0, style: { fontSize: 15 } },
            z.name
          ),
          n.createElement(
            "div",
            {
              style: {
                fontSize: 11,
                color: "#bfbfbf",
                fontFamily: "monospace"
              }
            },
            z.id
          )
        )
      ),
      n.createElement(m, {
        status: f ? "success" : "default",
        text: f ? "启用" : "停用"
      })
    ),
    // Description (rendered as markdown)
    z.description ? n.createElement(
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
      ee(z.description, n)
    ) : n.createElement(
      "div",
      { style: { fontSize: 12, color: "#bfbfbf", marginBottom: 10 } },
      "暂无描述"
    ),
    // Model info
    g ? n.createElement(
      "div",
      { style: { marginBottom: 8 } },
      n.createElement(
        t,
        { color: "geekblue", style: { fontSize: 11 } },
        `🤖 ${g}`
      )
    ) : null,
    // Skills
    M ? n.createElement(E, { size: "small" }) : n.createElement(
      "div",
      { style: { marginBottom: 6 } },
      n.createElement(
        "div",
        { style: { fontSize: 11, color: "#8c8c8c", marginBottom: 4 } },
        `技能 (${R.length})`
      ),
      n.createElement(ae, {
        items: R,
        max: 4,
        color: "cyan",
        emptyText: "未配置技能"
      })
    ),
    // MCP
    !M && b.length > 0 ? n.createElement(
      "div",
      null,
      n.createElement(
        "div",
        { style: { fontSize: 11, color: "#8c8c8c", marginBottom: 4 } },
        `MCP (${b.length})`
      ),
      n.createElement(ae, {
        items: b,
        max: 3,
        color: "purple"
      })
    ) : null
  );
}
function xe({
  expert: e,
  open: a,
  onClose: n,
  onRefresh: l
}) {
  const t = v().React, {
    Drawer: m,
    Descriptions: o,
    Tag: E,
    Typography: k,
    Space: z,
    Button: P,
    Empty: T,
    Tabs: M,
    List: f,
    Spin: R,
    Modal: b,
    message: g
  } = v().antd, { Text: u, Paragraph: B } = k, { EditOutlined: N, ThunderboltOutlined: j, FileTextOutlined: c, ToolOutlined: h, PlusOutlined: x } = v().antdIcons || {}, [W, D] = t.useState(!1), [O, U] = t.useState([]), [V, d] = t.useState(!1);
  if (!e) return null;
  const { agent: s, config: p, skills: A, mcps: y, loading: $ } = e, _ = A.filter((r) => r.enabled !== !1), C = (r) => {
    window.history.pushState({}, "", r), window.dispatchEvent(new PopStateEvent("popstate"));
  }, w = t.createElement(
    "div",
    null,
    t.createElement(
      o,
      { column: 1, bordered: !0, size: "small" },
      t.createElement(o.Item, { label: "专家名称" }, s.name),
      t.createElement(
        o.Item,
        { label: "专家 ID" },
        t.createElement("code", { style: { fontSize: 12 } }, s.id)
      ),
      t.createElement(
        o.Item,
        { label: "状态" },
        t.createElement(
          E,
          { color: s.enabled ? "green" : "default" },
          s.enabled ? "启用" : "停用"
        )
      ),
      t.createElement(
        o.Item,
        { label: "功能简介" },
        s.description ? ee(s.description, t) : "暂无描述"
      ),
      t.createElement(
        o.Item,
        { label: "使用模型" },
        s.active_model ? `${s.active_model.provider_id} / ${s.active_model.model}` : "使用全局默认模型"
      ),
      p != null && p.workspace_dir ? t.createElement(
        o.Item,
        { label: "工作区路径" },
        t.createElement(
          "code",
          { style: { fontSize: 11 } },
          p.workspace_dir
        )
      ) : null,
      p != null && p.approval_level ? t.createElement(
        o.Item,
        { label: "审批级别" },
        p.approval_level
      ) : null
    ),
    // System prompt files
    p != null && p.system_prompt_files && p.system_prompt_files.length > 0 ? t.createElement(
      "div",
      { style: { marginTop: 16 } },
      t.createElement(
        "div",
        {
          style: {
            display: "flex",
            alignItems: "center",
            gap: 6,
            marginBottom: 8
          }
        },
        c ? t.createElement(c, {
          style: { fontSize: 14, color: "#1677ff" }
        }) : null,
        t.createElement(u, { strong: !0 }, "系统提示词文件")
      ),
      t.createElement(
        z,
        { wrap: !0 },
        ...p.system_prompt_files.map(
          (r, L) => t.createElement(
            E,
            {
              key: L,
              icon: c ? t.createElement(c) : void 0,
              style: { fontSize: 12 }
            },
            r
          )
        )
      )
    ) : null
  ), F = async () => {
    D(!0), d(!0);
    try {
      const r = await oe();
      U(r);
    } catch (r) {
      g.error(r.message || "加载技能池失败");
    } finally {
      d(!1);
    }
  }, H = async (r) => {
    let L = 0, K = 0;
    for (const me of r)
      try {
        await we(s.id, me), L++;
      } catch {
        K++;
      }
    L > 0 ? (g.success(
      `成功添加 ${L} 个技能${K > 0 ? `，${K} 个失败` : ""}`
    ), l()) : K > 0 && g.error("添加技能失败"), D(!1);
  }, X = async (r) => {
    try {
      await Se(s.id, r), g.success(`技能「${r}」已移除`), l();
    } catch (L) {
      g.error(L.message || "移除技能失败");
    }
  }, q = async (r) => {
    try {
      await be(s.id, r), g.success(`MCP「${r}」已移除`), l();
    } catch (L) {
      g.error(L.message || "移除 MCP 失败");
    }
  }, J = $ ? t.createElement(
    "div",
    { style: { textAlign: "center", padding: 40 } },
    t.createElement(R, { size: "large" })
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
        u,
        { strong: !0 },
        `已启用技能 (${_.length})`
      ),
      t.createElement(
        P,
        {
          type: "primary",
          size: "small",
          icon: x ? t.createElement(x) : void 0,
          onClick: F
        },
        "从技能池添加"
      )
    ),
    _.length === 0 ? t.createElement(T, {
      description: "该专家暂无已启用的技能",
      image: T.PRESENTED_IMAGE_SIMPLE
    }) : t.createElement(f, {
      dataSource: _,
      renderItem: (r) => t.createElement(
        f.Item,
        {
          actions: [
            t.createElement(
              P,
              {
                type: "link",
                size: "small",
                danger: !0,
                onClick: () => X(r.name)
              },
              "移除"
            )
          ]
        },
        t.createElement(
          "div",
          { style: { width: "100%" } },
          t.createElement(
            "div",
            {
              style: {
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 4
              }
            },
            r.emoji ? t.createElement(
              "span",
              { style: { fontSize: 16 } },
              r.emoji
            ) : null,
            t.createElement(u, { strong: !0 }, r.name),
            r.version_text ? t.createElement(
              E,
              { style: { fontSize: 10 } },
              `v${r.version_text}`
            ) : null
          ),
          r.description ? t.createElement(
            B,
            {
              type: "secondary",
              style: { fontSize: 12, margin: 0 },
              ellipsis: { rows: 2 }
            },
            r.description
          ) : null,
          r.tags && r.tags.length > 0 ? t.createElement(
            "div",
            { style: { marginTop: 4 } },
            ...r.tags.map(
              (L, K) => t.createElement(
                E,
                { key: K, color: "cyan", style: { fontSize: 10 } },
                L
              )
            )
          ) : null
        )
      )
    }),
    // Skill Picker Modal (card-grid style, consistent with Skill Center)
    t.createElement(Ce, {
      open: W,
      onClose: () => D(!1),
      poolSkills: O,
      installedSkillNames: _.map((r) => r.name),
      loading: V,
      onInstall: H
    })
  ), S = $ ? t.createElement(
    "div",
    { style: { textAlign: "center", padding: 40 } },
    t.createElement(R, { size: "large" })
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
        u,
        { strong: !0 },
        `MCP 客户端 (${y.length})`
      ),
      t.createElement(
        P,
        {
          type: "primary",
          size: "small",
          icon: x ? t.createElement(x) : void 0,
          onClick: () => {
            window.history.pushState({}, "", `/agents/${s.id}/mcp`), window.dispatchEvent(new PopStateEvent("popstate"));
          }
        },
        "配置 MCP"
      )
    ),
    y.length === 0 ? t.createElement(T, {
      description: "该专家暂无关联的 MCP 客户端，点击「配置 MCP」添加",
      image: T.PRESENTED_IMAGE_SIMPLE
    }) : t.createElement(f, {
      dataSource: y,
      renderItem: (r) => t.createElement(
        f.Item,
        {
          actions: [
            t.createElement(
              P,
              {
                type: "link",
                size: "small",
                danger: !0,
                onClick: () => q(r.key)
              },
              "移除"
            )
          ]
        },
        t.createElement(
          "div",
          { style: { width: "100%" } },
          t.createElement(
            "div",
            {
              style: {
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 4
              }
            },
            t.createElement("span", { style: { fontSize: 14 } }, "🔌"),
            t.createElement(
              u,
              { strong: !0 },
              r.name || r.key
            ),
            t.createElement(
              E,
              {
                color: r.enabled ? "green" : "default",
                style: { fontSize: 10 }
              },
              r.enabled ? "启用" : "停用"
            ),
            t.createElement(
              E,
              { color: "purple", style: { fontSize: 10 } },
              r.transport
            )
          ),
          r.description ? t.createElement(
            B,
            {
              type: "secondary",
              style: { fontSize: 12, margin: 0 },
              ellipsis: { rows: 2 }
            },
            r.description
          ) : null,
          r.tools && r.tools.length > 0 ? t.createElement(
            "div",
            {
              style: {
                marginTop: 4,
                fontSize: 11,
                color: "#8c8c8c"
              }
            },
            `提供 ${r.tools.length} 个工具`
          ) : null
        )
      )
    })
  ), i = p != null && p.tools ? t.createElement(
    "div",
    { style: { padding: 16 } },
    t.createElement(
      "div",
      { style: { marginBottom: 12 } },
      t.createElement(
        "div",
        {
          style: {
            display: "flex",
            alignItems: "center",
            gap: 6,
            marginBottom: 8
          }
        },
        h ? t.createElement(h, {
          style: { fontSize: 14, color: "#1677ff" }
        }) : null,
        t.createElement(u, { strong: !0 }, "工具配置")
      ),
      t.createElement(
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
        JSON.stringify(p.tools, null, 2)
      )
    )
  ) : t.createElement(T, {
    description: "暂无工具配置",
    image: T.PRESENTED_IMAGE_SIMPLE
  }), I = [
    { key: "basic", label: "基本信息", children: w },
    {
      key: "skills",
      label: `技能 (${_.length})`,
      children: J
    },
    {
      key: "prompts",
      label: "推荐提问",
      children: t.createElement(ze, {
        skills: _,
        agentId: s.id
      })
    },
    {
      key: "knowledge",
      label: "专家记忆",
      children: t.createElement(Ie, {
        agentId: s.id,
        systemPromptFiles: (p == null ? void 0 : p.system_prompt_files) || [],
        onRefresh: () => l()
      })
    },
    { key: "mcp", label: `MCP (${y.length})`, children: S },
    { key: "tools", label: "工具配置", children: i }
  ];
  return t.createElement(
    m,
    {
      title: t.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 8 } },
        t.createElement("span", { style: { fontSize: 20 } }, "🧑‍🔬"),
        t.createElement("span", null, s.name)
      ),
      open: a,
      onClose: n,
      width: 560,
      extra: t.createElement(
        z,
        null,
        t.createElement(
          P,
          {
            size: "small",
            icon: N ? t.createElement(N) : void 0,
            onClick: () => C("/agents")
          },
          "编辑专家"
        ),
        t.createElement(
          P,
          {
            type: "primary",
            size: "small",
            icon: j ? t.createElement(j) : void 0,
            onClick: () => {
              try {
                const r = v();
                r.setSelectedAgent && r.setSelectedAgent(s.id);
              } catch (r) {
                console.warn("[ugsci] Failed to set selected agent:", r);
              }
              C("/chat");
            }
          },
          "开始对话"
        )
      )
    },
    t.createElement(M, {
      items: I,
      defaultActiveKey: "basic"
    })
  );
}
function Te({
  open: e,
  onClose: a,
  onCreated: n
}) {
  const l = v().React, { useState: t } = l, { Modal: m, Card: o, Tag: E, Input: k, Row: z, Col: P, Spin: T, message: M, Typography: f } = v().antd, { Text: R } = f, [b, g] = t(!1), [u, B] = t(""), N = fe.filter((c) => {
    if (!u.trim()) return !0;
    const h = u.toLowerCase();
    return c.name.toLowerCase().includes(h) || c.description.toLowerCase().includes(h) || c.category.toLowerCase().includes(h);
  }), j = async (c) => {
    g(!0);
    try {
      const h = await G("/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: c.name,
          description: c.description,
          skill_names: c.recommendedSkills
        })
      });
      await ce(h.id, "AGENTS.md", c.systemPrompt);
      const x = await Z(h.id);
      x.approval_level = c.approvalLevel, await G(`/agents/${encodeURIComponent(h.id)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(x)
      }), M.success(`专家「${c.name}」创建成功`), a(), n();
    } catch (h) {
      M.error(h.message || "创建专家失败");
    } finally {
      g(!1);
    }
  };
  return l.createElement(
    m,
    {
      open: e,
      onCancel: a,
      footer: null,
      title: "选择专家模板",
      width: 800
    },
    l.createElement(
      "div",
      { style: { marginBottom: 16 } },
      l.createElement(k, {
        placeholder: "搜索模板名称或类别...",
        value: u,
        onChange: (c) => B(c.target.value),
        allowClear: !0
      })
    ),
    b ? l.createElement(
      "div",
      { style: { textAlign: "center", padding: 60 } },
      l.createElement(T, { size: "large" }),
      l.createElement(
        "div",
        { style: { marginTop: 12, color: "#8c8c8c" } },
        "正在创建专家..."
      )
    ) : l.createElement(
      z,
      { gutter: [12, 12] },
      ...N.map(
        (c) => l.createElement(
          P,
          { key: c.id, xs: 24, sm: 12 },
          l.createElement(
            o,
            {
              hoverable: !0,
              size: "small",
              onClick: () => j(c),
              style: { cursor: "pointer", height: "100%" }
            },
            l.createElement(
              "div",
              {
                style: {
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 10,
                  marginBottom: 8
                }
              },
              l.createElement(
                "span",
                { style: { fontSize: 28 } },
                c.emoji
              ),
              l.createElement(
                "div",
                { style: { flex: 1 } },
                l.createElement(
                  R,
                  { strong: !0, style: { fontSize: 15 } },
                  c.name
                ),
                l.createElement(
                  "div",
                  null,
                  l.createElement(
                    E,
                    { color: "blue", style: { fontSize: 10 } },
                    c.category
                  ),
                  c.approvalLevel === "MANUAL" ? l.createElement(
                    E,
                    { color: "orange", style: { fontSize: 10 } },
                    "需审批"
                  ) : null
                )
              )
            ),
            l.createElement(
              "div",
              {
                style: {
                  fontSize: 12,
                  color: "#595959",
                  lineHeight: 1.5
                }
              },
              ee(c.description, l)
            )
          )
        )
      )
    )
  );
}
function Ie({
  agentId: e,
  systemPromptFiles: a,
  onRefresh: n
}) {
  const l = v().React, { useState: t, useEffect: m, useCallback: o } = l, {
    List: E,
    Tag: k,
    Switch: z,
    Button: P,
    Modal: T,
    Input: M,
    Spin: f,
    Empty: R,
    message: b,
    Typography: g
  } = v().antd, {
    FileTextOutlined: u,
    PlusOutlined: B,
    EditOutlined: N,
    ReloadOutlined: j
  } = v().antdIcons || {}, { Text: c } = g, [h, x] = t([]), [W, D] = t(!0), [O, U] = t(
    a || []
  ), [V, d] = t(!1), [s, p] = t(null), [A, y] = t(""), [$, _] = t(""), [C, w] = t(!1), F = o(async () => {
    D(!0);
    try {
      const S = await ve(e);
      x(S);
    } catch (S) {
      b.error(S.message || "加载记忆文件失败"), x([]);
    } finally {
      D(!1);
    }
  }, [e]);
  m(() => {
    F();
  }, [F]), m(() => {
    U(a || []);
  }, [a]);
  const H = async (S, i) => {
    const I = new Set(O);
    if (i)
      I.add(S);
    else {
      if (le.includes(S) && S === "AGENTS.md") {
        b.warning("AGENTS.md 是核心文件，不能停用");
        return;
      }
      I.delete(S);
    }
    const r = Array.from(I);
    U(r);
    try {
      await ne(e, r), b.success(i ? "已启用记忆文件" : "已停用记忆文件"), n();
    } catch (L) {
      b.error(L.message || "更新失败"), U(a || []);
    }
  }, X = async (S) => {
    try {
      const i = await G(
        `/workspace/files/${encodeURIComponent(S)}`,
        { headers: { "X-Agent-Id": e } }
      );
      p(S), y(i.content || ""), d(!0);
    } catch (i) {
      b.error(i.message || "读取文件失败");
    }
  }, q = () => {
    p(null), y(""), _(""), d(!0);
  }, J = async () => {
    const S = s || $.trim();
    if (!S) {
      b.warning("请输入文件名");
      return;
    }
    const i = S.endsWith(".md") ? S : `${S}.md`;
    w(!0);
    try {
      if (await ce(e, i, A), !s && !O.includes(i)) {
        const I = [...O, i];
        U(I), await ne(e, I);
      }
      b.success("保存成功"), d(!1), F(), n();
    } catch (I) {
      b.error(I.message || "保存失败");
    } finally {
      w(!1);
    }
  };
  return W ? l.createElement(
    "div",
    { style: { textAlign: "center", padding: 40 } },
    l.createElement(f, { size: "large" })
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
        "div",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        u ? l.createElement(u, {
          style: { fontSize: 14, color: "#1677ff" }
        }) : null,
        l.createElement(
          c,
          { strong: !0 },
          `记忆文件 (${h.length})`
        ),
        l.createElement(
          c,
          { type: "secondary", style: { fontSize: 12 } },
          `· 已挂载 ${O.length} 个到专家记忆`
        )
      ),
      l.createElement(
        "div",
        { style: { display: "flex", gap: 8 } },
        l.createElement(
          P,
          {
            size: "small",
            icon: j ? l.createElement(j) : void 0,
            onClick: F
          },
          "刷新"
        ),
        l.createElement(
          P,
          {
            type: "primary",
            size: "small",
            icon: B ? l.createElement(B) : void 0,
            onClick: q
          },
          "新建记忆文件"
        )
      )
    ),
    h.length === 0 ? l.createElement(R, {
      description: "暂无记忆文件，点击「新建记忆文件」添加",
      image: R.PRESENTED_IMAGE_SIMPLE
    }) : l.createElement(E, {
      dataSource: h,
      renderItem: (S) => {
        const i = O.includes(S.filename), I = le.includes(S.filename);
        return l.createElement(
          E.Item,
          {
            actions: [
              l.createElement(
                P,
                {
                  type: "link",
                  size: "small",
                  icon: N ? l.createElement(N) : void 0,
                  onClick: () => X(S.filename)
                },
                "编辑"
              )
            ]
          },
          l.createElement(
            E.Item.Meta,
            {
              avatar: l.createElement(
                u,
                {
                  style: {
                    fontSize: 20,
                    color: i ? "#1677ff" : "#bfbfbf"
                  }
                }
              ),
              title: l.createElement(
                "div",
                {
                  style: {
                    display: "flex",
                    alignItems: "center",
                    gap: 6
                  }
                },
                l.createElement(c, null, S.filename),
                I ? l.createElement(
                  k,
                  { color: "default", style: { fontSize: 10 } },
                  "内置"
                ) : l.createElement(
                  k,
                  { color: "cyan", style: { fontSize: 10 } },
                  "记忆库"
                )
              ),
              description: l.createElement(
                "div",
                { style: { fontSize: 12 } },
                `${(S.size / 1024).toFixed(1)} KB · 修改于 ${new Date(S.modified_time).toLocaleString()}`
              )
            }
          ),
          l.createElement(z, {
            checked: i,
            size: "small",
            onChange: (r) => H(S.filename, r)
          })
        );
      }
    }),
    // Edit/New file modal
    l.createElement(
      T,
      {
        open: V,
        onCancel: () => d(!1),
        title: s ? `编辑 ${s}` : "新建记忆文件",
        width: 700,
        onOk: J,
        confirmLoading: C,
        okText: "保存"
      },
      s ? null : l.createElement(
        "div",
        { style: { marginBottom: 12 } },
        l.createElement(M, {
          placeholder: "文件名（如：油藏工程记忆库.md）",
          value: $,
          onChange: (S) => _(S.target.value),
          addonAfter: $.endsWith(".md") ? "" : ".md"
        })
      ),
      l.createElement(M.TextArea, {
        value: A,
        onChange: (S) => y(S.target.value),
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
function ze({
  skills: e,
  agentId: a
}) {
  const n = v().React, { useMemo: l } = n, { List: t, Tag: m, Typography: o, Empty: E, Button: k, message: z } = v().antd, { ThunderboltOutlined: P, CopyOutlined: T } = v().antdIcons || {}, { Text: M } = o, f = l(
    () => he(e),
    [e]
  ), R = (g) => {
    try {
      const u = v();
      u.setSelectedAgent && u.setSelectedAgent(a);
    } catch {
    }
    try {
      sessionStorage.setItem("ugsci_pending_prompt", g);
    } catch {
    }
    window.history.pushState({}, "", "/chat"), window.dispatchEvent(new PopStateEvent("popstate"));
  }, b = (g) => {
    var u;
    (u = navigator.clipboard) == null || u.writeText(g).then(() => {
      z.success("已复制到剪贴板");
    });
  };
  return f.length === 0 ? n.createElement(E, {
    description: "暂无推荐提问，请先为专家添加技能",
    image: E.PRESENTED_IMAGE_SIMPLE
  }) : n.createElement(
    "div",
    null,
    n.createElement(
      "div",
      {
        style: {
          display: "flex",
          alignItems: "center",
          gap: 6,
          marginBottom: 12
        }
      },
      P ? n.createElement(P, {
        style: { fontSize: 14, color: "#1677ff" }
      }) : null,
      n.createElement(
        M,
        { strong: !0 },
        `推荐提问 (${f.length})`
      ),
      n.createElement(
        M,
        { type: "secondary", style: { fontSize: 12 } },
        "· 从技能描述中自动提取"
      )
    ),
    n.createElement(t, {
      dataSource: f,
      renderItem: (g, u) => n.createElement(
        t.Item,
        {
          actions: [
            n.createElement(
              k,
              {
                type: "link",
                size: "small",
                icon: T ? n.createElement(T) : void 0,
                onClick: () => b(g)
              },
              "复制"
            )
          ]
        },
        n.createElement(
          t.Item.Meta,
          {
            avatar: n.createElement(
              m,
              { color: "blue", style: { borderRadius: "50%" } },
              `${u + 1}`
            ),
            title: n.createElement(
              "div",
              {
                style: {
                  cursor: "pointer",
                  color: "#1677ff"
                },
                onClick: () => R(g)
              },
              g
            ),
            description: n.createElement(
              M,
              { type: "secondary", style: { fontSize: 12 } },
              "点击直接发送给专家"
            )
          }
        )
      )
    })
  );
}
function Pe() {
  const e = v().React, { useState: a, useEffect: n, useCallback: l, useMemo: t } = e, {
    Spin: m,
    Empty: o,
    Input: E,
    Button: k,
    message: z,
    Row: P,
    Col: T
  } = v().antd, { ReloadOutlined: M, PlusOutlined: f, SearchOutlined: R } = v().antdIcons || {}, [b, g] = a([]), [u, B] = a(!0), [N, j] = a(!1), [c, h] = a(null), [x, W] = a(""), [D, O] = a(!1), U = l(async () => {
    B(!0);
    try {
      const y = await se(), $ = await ie().catch(
        () => []
      ), _ = await Promise.all(
        y.map(async (C) => {
          try {
            const [w, F] = await Promise.all([
              Z(C.id).catch(() => null),
              ue(C.id).catch(() => [])
            ]), H = Ee(w == null ? void 0 : w.mcp), X = $.filter(
              (q) => H.includes(q.key) || H.includes(q.name)
            );
            return {
              agent: C,
              config: w,
              skills: F,
              mcps: X,
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
      g(_);
    } catch (y) {
      z.error(y.message || "加载专家列表失败"), g([]);
    } finally {
      B(!1);
    }
  }, []);
  n(() => {
    U();
  }, [U]);
  const V = l((y) => {
    h(y), j(!0);
  }, []), d = t(() => {
    if (!x.trim()) return b;
    const y = x.toLowerCase();
    return b.filter(
      ($) => {
        var _;
        return $.agent.name.toLowerCase().includes(y) || ((_ = $.agent.description) == null ? void 0 : _.toLowerCase().includes(y)) || $.agent.id.toLowerCase().includes(y) || $.skills.some((C) => C.name.toLowerCase().includes(y));
      }
    );
  }, [b, x]), s = b.filter((y) => y.agent.enabled).length, p = b.reduce(
    (y, $) => y + $.skills.filter((_) => _.enabled !== !1).length,
    0
  ), A = b.reduce((y, $) => y + $.mcps.length, 0);
  return e.createElement(
    "div",
    { style: { padding: 24 } },
    e.createElement(te, {
      title: "专家中心",
      subtitle: `共 ${b.length} 位专家（${s} 位启用）· ${p} 个技能 · ${A} 个 MCP 客户端`,
      extra: e.createElement(
        e.Fragment,
        null,
        e.createElement(
          k,
          {
            icon: M ? e.createElement(M) : void 0,
            onClick: U,
            loading: u
          },
          "刷新"
        ),
        e.createElement(
          k,
          {
            type: "primary",
            icon: f ? e.createElement(f) : void 0,
            onClick: () => O(!0)
          },
          "创建专家"
        )
      )
    }),
    // Search bar
    e.createElement(
      "div",
      { style: { marginBottom: 16 } },
      e.createElement(E, {
        placeholder: "搜索专家名称、描述或技能...",
        prefix: R ? e.createElement(R) : void 0,
        value: x,
        onChange: (y) => W(y.target.value),
        allowClear: !0,
        style: { maxWidth: 400 }
      })
    ),
    // Content
    u ? e.createElement(
      "div",
      { style: { textAlign: "center", padding: 60 } },
      e.createElement(m, { size: "large" })
    ) : d.length === 0 ? e.createElement(o, {
      description: x ? "未找到匹配的专家" : "暂无专家，点击「创建专家」添加"
    }) : e.createElement(
      P,
      { gutter: [12, 12] },
      ...d.map(
        (y) => e.createElement(
          T,
          { key: y.agent.id, xs: 24, sm: 12, md: 8, lg: 6 },
          e.createElement(ke, {
            expert: y,
            onClick: () => V(y)
          })
        )
      )
    ),
    // Drawer
    e.createElement(xe, {
      expert: c,
      open: N,
      onClose: () => j(!1),
      onRefresh: () => U()
    }),
    // Template Modal
    e.createElement(Te, {
      open: D,
      onClose: () => O(!1),
      onCreated: () => U()
    })
  );
}
function Me({
  mcp: e,
  onClick: a
}) {
  const n = v().React, { Card: l, Tag: t, Badge: m, Typography: o } = v().antd, { Text: E } = o, k = {
    stdio: "💻",
    streamable_http: "🌐",
    sse: "📡"
  };
  return n.createElement(
    l,
    {
      hoverable: !0,
      onClick: a,
      size: "small",
      style: {
        cursor: "pointer",
        borderColor: e.enabled ? void 0 : "#d9d9d9",
        opacity: e.enabled ? 1 : 0.7
      }
    },
    n.createElement(
      "div",
      {
        style: {
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 8
        }
      },
      n.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 8 } },
        n.createElement(
          "span",
          { style: { fontSize: 18 } },
          k[e.transport] || "🔌"
        ),
        n.createElement(
          E,
          { strong: !0, style: { fontSize: 14 } },
          e.name || e.key
        )
      ),
      n.createElement(m, {
        status: e.enabled ? "success" : "default",
        text: e.enabled ? "启用" : "停用"
      })
    ),
    e.description ? n.createElement(
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
    n.createElement(
      "div",
      { style: { display: "flex", gap: 6, flexWrap: "wrap" } },
      n.createElement(
        t,
        { color: "purple", style: { fontSize: 11 } },
        e.transport
      ),
      e.tools && e.tools.length > 0 ? n.createElement(
        t,
        { color: "blue", style: { fontSize: 11 } },
        `${e.tools.length} 个工具`
      ) : n.createElement(t, { style: { fontSize: 11 } }, "全部工具"),
      e.url ? n.createElement(
        t,
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
function Le() {
  const e = v().React, { useState: a, useEffect: n, useCallback: l, useMemo: t } = e, {
    Spin: m,
    Empty: o,
    Input: E,
    Button: k,
    message: z,
    Row: P,
    Col: T,
    Drawer: M,
    Descriptions: f,
    Tag: R,
    Typography: b,
    List: g
  } = v().antd, { ReloadOutlined: u, PlusOutlined: B, SearchOutlined: N, ApiOutlined: j } = v().antdIcons || {}, { Text: c } = b, [h, x] = a([]), [W, D] = a(!0), [O, U] = a(""), [V, d] = a(!1), [s, p] = a(null), A = l(async () => {
    D(!0);
    try {
      const w = await ie();
      x(w);
    } catch (w) {
      z.error(w.message || "加载能力列表失败"), x([]);
    } finally {
      D(!1);
    }
  }, []);
  n(() => {
    A();
  }, [A]);
  const y = t(() => {
    if (!O.trim()) return h;
    const w = O.toLowerCase();
    return h.filter(
      (F) => {
        var H;
        return F.name.toLowerCase().includes(w) || F.key.toLowerCase().includes(w) || ((H = F.description) == null ? void 0 : H.toLowerCase().includes(w)) || F.transport.toLowerCase().includes(w);
      }
    );
  }, [h, O]), $ = h.filter((w) => w.enabled).length, _ = h.reduce((w, F) => {
    var H;
    return w + (((H = F.tools) == null ? void 0 : H.length) || 0);
  }, 0), C = (w) => {
    window.history.pushState({}, "", w), window.dispatchEvent(new PopStateEvent("popstate"));
  };
  return e.createElement(
    "div",
    { style: { padding: 24 } },
    e.createElement(te, {
      title: "能力中心",
      subtitle: `共 ${h.length} 个 MCP 客户端（${$} 个启用）· ${_} 个工具`,
      extra: e.createElement(
        e.Fragment,
        null,
        e.createElement(
          k,
          {
            icon: u ? e.createElement(u) : void 0,
            onClick: A,
            loading: W
          },
          "刷新"
        ),
        e.createElement(
          k,
          {
            type: "primary",
            icon: B ? e.createElement(B) : void 0,
            onClick: () => C("/mcp")
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
        prefix: N ? e.createElement(N) : void 0,
        value: O,
        onChange: (w) => U(w.target.value),
        allowClear: !0,
        style: { maxWidth: 400 }
      })
    ),
    W ? e.createElement(
      "div",
      { style: { textAlign: "center", padding: 60 } },
      e.createElement(m, { size: "large" })
    ) : y.length === 0 ? e.createElement(o, {
      description: O ? "未找到匹配的能力" : "暂无 MCP 客户端，点击「管理 MCP」添加"
    }) : e.createElement(
      P,
      { gutter: [12, 12] },
      ...y.map(
        (w) => e.createElement(
          T,
          { key: w.key, xs: 24, sm: 12, md: 8, lg: 6 },
          e.createElement(Me, {
            mcp: w,
            onClick: () => {
              p(w), d(!0);
            }
          })
        )
      )
    ),
    // Detail drawer
    s ? e.createElement(
      M,
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
        open: V,
        onClose: () => d(!1),
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
            s.key
          )
        ),
        e.createElement(
          f.Item,
          { label: "名称" },
          s.name || "-"
        ),
        e.createElement(
          f.Item,
          { label: "描述" },
          s.description || "-"
        ),
        e.createElement(
          f.Item,
          { label: "状态" },
          e.createElement(
            R,
            { color: s.enabled ? "green" : "default" },
            s.enabled ? "启用" : "停用"
          )
        ),
        e.createElement(
          f.Item,
          { label: "传输方式" },
          s.transport
        ),
        s.url ? e.createElement(
          f.Item,
          { label: "URL" },
          s.url
        ) : null,
        s.command ? e.createElement(
          f.Item,
          { label: "命令" },
          e.createElement(
            "code",
            { style: { fontSize: 11 } },
            s.command
          )
        ) : null,
        s.args && s.args.length > 0 ? e.createElement(
          f.Item,
          { label: "参数" },
          s.args.join(" ")
        ) : null
      ),
      s.tools && s.tools.length > 0 ? e.createElement(
        "div",
        { style: { marginTop: 16 } },
        e.createElement(
          c,
          {
            strong: !0,
            style: { display: "block", marginBottom: 8 }
          },
          "提供的工具"
        ),
        e.createElement(g, {
          size: "small",
          dataSource: s.tools,
          renderItem: (w) => e.createElement(
            g.Item,
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
              j ? e.createElement(j, {
                style: { fontSize: 12, color: "#1677ff" }
              }) : null,
              e.createElement(
                c,
                { style: { fontSize: 12 } },
                w
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
function Re() {
  const e = v().React, { useState: a, useEffect: n, useCallback: l, useMemo: t } = e, {
    Spin: m,
    Empty: o,
    Input: E,
    Button: k,
    message: z,
    Row: P,
    Col: T,
    Card: M,
    Tag: f,
    Typography: R,
    Drawer: b,
    Descriptions: g,
    List: u
  } = v().antd, {
    ReloadOutlined: B,
    SearchOutlined: N,
    DownloadOutlined: j,
    ThunderboltOutlined: c
  } = v().antdIcons || {}, { Text: h, Paragraph: x } = R, [W, D] = a([]), [O, U] = a([]), [V, d] = a([]), [s, p] = a(!0), [A, y] = a(""), [$, _] = a(!1), [C, w] = a(null), [F, H] = a([]), X = l(async () => {
    p(!0);
    try {
      const [i, I, r] = await Promise.all([
        oe(),
        se(),
        ye()
      ]);
      D(i), d(I), U(r);
    } catch (i) {
      z.error(i.message || "加载技能列表失败"), D([]);
    } finally {
      p(!1);
    }
  }, []);
  n(() => {
    X();
  }, [X]);
  const q = t(() => {
    if (!A.trim()) return W;
    const i = A.toLowerCase();
    return W.filter(
      (I) => {
        var r, L;
        return I.name.toLowerCase().includes(i) || ((r = I.description) == null ? void 0 : r.toLowerCase().includes(i)) || ((L = I.tags) == null ? void 0 : L.some((K) => K.toLowerCase().includes(i)));
      }
    );
  }, [W, A]), J = l(
    (i) => {
      const I = [];
      for (const r of O)
        if (r.skills.some((L) => L.name === i)) {
          const L = V.find((K) => K.id === r.agent_id);
          I.push((L == null ? void 0 : L.name) || r.agent_name || r.agent_id);
        }
      return I;
    },
    [O, V]
  ), S = (i) => {
    window.history.pushState({}, "", i), window.dispatchEvent(new PopStateEvent("popstate"));
  };
  return e.createElement(
    "div",
    { style: { padding: 24 } },
    e.createElement(te, {
      title: "技能中心",
      subtitle: `技能池共 ${W.length} 个技能`,
      extra: e.createElement(
        e.Fragment,
        null,
        e.createElement(
          k,
          {
            icon: B ? e.createElement(B) : void 0,
            onClick: X,
            loading: s
          },
          "刷新"
        ),
        e.createElement(
          k,
          {
            type: "primary",
            icon: j ? e.createElement(j) : void 0,
            onClick: () => S("/skill-pool")
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
        prefix: N ? e.createElement(N) : void 0,
        value: A,
        onChange: (i) => y(i.target.value),
        allowClear: !0,
        style: { maxWidth: 400 }
      })
    ),
    s ? e.createElement(
      "div",
      { style: { textAlign: "center", padding: 60 } },
      e.createElement(m, { size: "large" })
    ) : q.length === 0 ? e.createElement(o, {
      description: A ? "未找到匹配的技能" : "技能池为空"
    }) : e.createElement(
      P,
      { gutter: [12, 12] },
      ...q.map(
        (i) => {
          var I;
          return e.createElement(
            T,
            { key: i.name, xs: 24, sm: 12, md: 8, lg: 6 },
            e.createElement(
              M,
              {
                hoverable: !0,
                size: "small",
                style: { cursor: "pointer", height: "100%" },
                onClick: () => {
                  w(i), H(J(i.name)), _(!0);
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
                i.emoji ? e.createElement(
                  "span",
                  { style: { fontSize: 18 } },
                  i.emoji
                ) : e.createElement(
                  "span",
                  { style: { fontSize: 18 } },
                  "⚡"
                ),
                e.createElement(
                  h,
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
                  i.name
                ),
                i.protected ? e.createElement(
                  f,
                  { color: "gold", style: { fontSize: 10 } },
                  "内置"
                ) : null
              ),
              i.description ? e.createElement(
                x,
                {
                  type: "secondary",
                  style: { fontSize: 11, margin: 0, lineHeight: 1.4 },
                  ellipsis: { rows: 2 }
                },
                i.description
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
                i.version_text ? e.createElement(
                  f,
                  { style: { fontSize: 10 } },
                  `v${i.version_text}`
                ) : null,
                ...(I = i.tags) == null ? void 0 : I.slice(0, 3).map(
                  (r, L) => e.createElement(
                    f,
                    { key: L, color: "cyan", style: { fontSize: 10 } },
                    r
                  )
                )
              )
            )
          );
        }
      )
    ),
    // Skill detail drawer
    C ? e.createElement(
      b,
      {
        title: e.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 8 } },
          e.createElement(
            "span",
            { style: { fontSize: 18 } },
            C.emoji || "⚡"
          ),
          e.createElement("span", null, C.name)
        ),
        open: $,
        onClose: () => _(!1),
        width: 520,
        extra: e.createElement(
          k,
          {
            type: "primary",
            size: "small",
            icon: c ? e.createElement(c) : void 0,
            onClick: () => S("/skills")
          },
          "管理技能"
        )
      },
      e.createElement(
        g,
        { column: 1, bordered: !0, size: "small" },
        e.createElement(
          g.Item,
          { label: "技能名称" },
          C.name
        ),
        e.createElement(
          g.Item,
          { label: "描述" },
          C.description || "-"
        ),
        C.version_text ? e.createElement(
          g.Item,
          { label: "版本" },
          C.version_text
        ) : null,
        e.createElement(
          g.Item,
          { label: "来源" },
          C.source || "-"
        ),
        e.createElement(
          g.Item,
          { label: "受保护" },
          C.protected ? "是（内置）" : "否"
        ),
        C.sync_status ? e.createElement(
          g.Item,
          { label: "同步状态" },
          C.sync_status
        ) : null,
        C.installed_from ? e.createElement(
          g.Item,
          { label: "安装来源" },
          C.installed_from
        ) : null
      ),
      // Tags
      C.tags && C.tags.length > 0 ? e.createElement(
        "div",
        { style: { marginTop: 16 } },
        e.createElement(
          h,
          {
            strong: !0,
            style: { display: "block", marginBottom: 8 }
          },
          "标签"
        ),
        e.createElement(
          "div",
          { style: { display: "flex", flexWrap: "wrap", gap: 4 } },
          ...C.tags.map(
            (i, I) => e.createElement(f, { key: I, color: "cyan" }, i)
          )
        )
      ) : null,
      // Installed agents
      e.createElement(
        "div",
        { style: { marginTop: 16 } },
        e.createElement(
          h,
          { strong: !0, style: { display: "block", marginBottom: 8 } },
          `已安装此技能的专家 (${F.length})`
        ),
        F.length > 0 ? e.createElement(u, {
          size: "small",
          dataSource: F,
          renderItem: (i) => e.createElement(
            u.Item,
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
                h,
                { style: { fontSize: 13 } },
                i
              )
            )
          )
        }) : e.createElement(
          h,
          { type: "secondary", style: { fontSize: 12 } },
          "暂无专家安装此技能"
        )
      )
    ) : null
  );
}
function Oe() {
  var t;
  const e = window.QwenPaw;
  if (!(e != null && e.menu) || !(e != null && e.route)) {
    console.warn(
      "[ugsci] QwenPaw.menu/route API not available — plugin disabled"
    );
    return;
  }
  const a = v().React, n = "ugsci";
  e.route.add(n, {
    id: "ugsci.experts",
    path: "/ugsci-experts",
    component: Pe
  }), e.menu.add(n, {
    id: "ugsci.experts",
    location: "primary.agentScoped",
    label: () => "专家中心",
    icon: a.createElement("span", { style: { fontSize: 16 } }, "🧑‍🔬"),
    route: "ugsci.experts",
    order: 5,
    visible: () => Q()
  }), e.route.add(n, {
    id: "ugsci.capabilities",
    path: "/ugsci-capabilities",
    component: Le
  }), e.menu.add(n, {
    id: "ugsci.capabilities",
    location: "primary.agentScoped",
    label: () => "能力中心",
    icon: a.createElement("span", { style: { fontSize: 16 } }, "🔌"),
    route: "ugsci.capabilities",
    order: 6,
    visible: () => Q()
  }), e.route.add(n, {
    id: "ugsci.skills-center",
    path: "/ugsci-skills",
    component: Re
  }), e.menu.add(n, {
    id: "ugsci.skills-center",
    location: "primary.agentScoped",
    label: () => "技能中心",
    icon: a.createElement("span", { style: { fontSize: 16 } }, "⚡"),
    route: "ugsci.skills-center",
    order: 7,
    visible: () => Q()
  }), (t = e.sidebar) != null && t.registerSimpleModeItems ? (e.sidebar.registerSimpleModeItems([
    "ugsci.experts",
    "ugsci.capabilities",
    "ugsci.skills-center"
  ]), console.info("[ugsci] Registered 3 items for simple-mode visibility")) : console.warn(
    "[ugsci] window.QwenPaw.sidebar.registerSimpleModeItems not available — items will not appear in simple mode"
  );
  const l = [
    "core.skills",
    "core.tools",
    "core.mcp",
    "core.acp",
    "core.agent-config",
    "core.agent-stats",
    "core.skill-pool"
  ];
  for (const m of l) {
    try {
      const E = e.menu.snapshot("primary.agentScoped").find((k) => k.id === m);
      E && e.menu.replace(n, m, {
        ...E,
        visible: () => !Q()
      });
    } catch {
    }
    try {
      const E = e.menu.snapshot("primary.settings").find((k) => k.id === m);
      E && e.menu.replace(n, m, {
        ...E,
        visible: () => !Q()
      });
    } catch {
    }
  }
  console.info(
    "[ugsci] Plugin registered: 3 routes + menu items, simple-mode whitelist + simplified navigation active"
  );
}
function Y() {
  try {
    Oe();
  } catch (e) {
    console.error("[ugsci] Failed to build plugin:", e), setTimeout(Y, 500);
  }
}
var re;
if ((re = window.QwenPaw) != null && re.host)
  Y();
else {
  const e = setInterval(() => {
    var a;
    (a = window.QwenPaw) != null && a.host && (clearInterval(e), Y());
  }, 200);
  setTimeout(() => clearInterval(e), 1e4);
}
