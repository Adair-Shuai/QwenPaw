function Bt() {
  var t;
  const e = (t = window.QwenPaw) == null ? void 0 : t.host;
  if (!e) throw new Error("[ugsci] QwenPaw.host not available");
  return e;
}
function Oa(e) {
  const t = Bt().getApiToken() || "";
  return {
    "Content-Type": "application/json",
    ...t ? { Authorization: `Bearer ${t}` } : {},
    ...e ? { "X-Agent-Id": e } : {}
  };
}
async function Ln(e, t, l) {
  try {
    const a = await fetch(Bt().getApiUrl(e), {
      headers: Oa(t),
      signal: l
    });
    return a.ok ? await a.json() : null;
  } catch {
    return null;
  }
}
function Aa(e, t) {
  return Ln("/ugsci/team/state", e, t);
}
async function Pa() {
  const e = await Ln(
    "/ugsci/team/preset-teams"
  );
  return (e == null ? void 0 : e.teams) ?? null;
}
const Ma = {
  plan: { label: "规划", color: "#1677ff", icon: "📋" },
  dispatch: { label: "分派", color: "#13c2c2", icon: "🚀" },
  verify: { label: "验证", color: "#fa8c16", icon: "🔍" },
  synthesize: { label: "综合", color: "#722ed1", icon: "📊" },
  completed: { label: "完成", color: "#52c41a", icon: "✅" }
}, bn = [
  "plan",
  "dispatch",
  "verify",
  "synthesize",
  "completed"
], $a = 3;
function Ra() {
  const e = Bt(), t = e.React, { useState: l, useEffect: a, useCallback: n, useRef: s } = t, { Card: r, Tag: o, Typography: d, Button: c, Steps: f, Empty: b, Alert: k } = e.antd, { ReloadOutlined: S } = e.antdIcons || {}, { Text: h, Paragraph: y } = d, A = e.useSelectedAgent ? e.useSelectedAgent() : { id: "default" }, L = (A == null ? void 0 : A.id) || "default", [U, N] = l(null), [te, G] = l(!1), H = s(null), x = s(0), C = s(0), _ = s(null), J = n(
    async (u) => {
      var V;
      (V = _.current) == null || V.abort();
      const O = new AbortController();
      _.current = O;
      const ne = ++C.current;
      u && G(!0);
      const R = await Aa(L, O.signal);
      O.signal.aborted || ne !== C.current || (R ? (x.current = 0, H.current = R, N(R)) : x.current += 1, G(!1));
    },
    [L]
  ), F = n(() => J(!0), [J]);
  if (a(() => {
    var O;
    (O = _.current) == null || O.abort(), C.current += 1, x.current = 0, H.current = null, N(null), F();
    const u = window.setInterval(() => {
      var ne, R;
      x.current >= $a || ((ne = H.current) == null ? void 0 : ne.status) === "completed" || ((R = H.current) == null ? void 0 : R.status) === "terminated" || J(!1);
    }, 5e3);
    return () => {
      var ne;
      window.clearInterval(u), (ne = _.current) == null || ne.abort(), C.current += 1;
    };
  }, [L, J, F]), (U == null ? void 0 : U.status) === "unreadable")
    return t.createElement(k, {
      type: "warning",
      showIcon: !0,
      message: "专家团状态暂时无法读取",
      description: `实例 ${U.instance_id || "未知"} 的状态文件需要检查。`,
      style: { marginBottom: 16 },
      action: t.createElement(
        c,
        { size: "small", onClick: F, loading: te },
        "重试"
      )
    });
  if (!U || !U.active) {
    if ((U == null ? void 0 : U.status) === "completed" || (U == null ? void 0 : U.status) === "terminated") {
      const u = U.status === "completed";
      return t.createElement(k, {
        type: u ? "success" : "info",
        showIcon: !0,
        message: u ? "专家团工作流已完成" : "专家团工作流已终止",
        description: u ? `实例 ${U.instance_id || "未知"} 已完成，结果文件保留在工作区。` : `原因：${U.state.termination_reason || "未知"}`,
        style: { marginBottom: 16 }
      });
    }
    return t.createElement(b, {
      description: "暂无活跃的专家团工作流",
      style: { padding: 24 }
    });
  }
  const I = U.state, E = I.current_phase || "plan", g = bn.indexOf(E), M = I.team_name || "未知团队", K = I.team_mode || "pipeline", Q = I.iteration || 0, le = I.members || [], $ = I.verify_retries || 0, p = {
    pipeline: "流水线模式",
    coordinator: "协调者模式",
    roundtable: "圆桌讨论"
  };
  return t.createElement(
    r,
    {
      size: "small",
      style: { marginBottom: 16 },
      title: t.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 8 } },
        t.createElement("span", { style: { fontSize: 16 } }, "🔄"),
        t.createElement(h, { strong: !0 }, `${M} — 工作流状态`),
        t.createElement(
          o,
          { color: "blue", style: { fontSize: 10 } },
          p[K] || K
        ),
        t.createElement(
          o,
          { style: { fontSize: 10 } },
          `迭代 ${Q}`
        ),
        $ > 0 ? t.createElement(
          o,
          { color: "orange", style: { fontSize: 10 } },
          `验证重试 ${$}`
        ) : null
      ),
      extra: t.createElement(
        c,
        {
          size: "small",
          type: "text",
          icon: S ? t.createElement(S) : void 0,
          onClick: F,
          loading: te
        },
        "刷新"
      )
    },
    t.createElement(f, {
      current: g,
      size: "small",
      items: bn.map((u) => {
        const O = Ma[u];
        return {
          title: `${O.icon} ${O.label}`,
          description: u === "plan" ? "分析任务，创建任务分解" : u === "dispatch" ? "分派专家执行任务" : u === "verify" ? "交叉验证专家结果" : u === "synthesize" ? "综合形成最终报告" : "工作流完成"
        };
      })
    }),
    t.createElement(
      "div",
      {
        style: {
          marginTop: 12,
          display: "flex",
          gap: 6,
          flexWrap: "wrap"
        }
      },
      ...le.map(
        (u, O) => t.createElement(
          o,
          { key: `${u.name}-${O}`, style: { fontSize: 11 } },
          `${u.emoji || ""} ${u.name}（${u.role}）`
        )
      )
    ),
    I.task ? t.createElement(
      y,
      {
        style: {
          fontSize: 12,
          marginTop: 8,
          marginBottom: 0,
          color: "#666"
        },
        ellipsis: { rows: 2 }
      },
      `任务: ${I.task}`
    ) : null
  );
}
function z() {
  var t;
  const e = (t = window.QwenPaw) == null ? void 0 : t.host;
  if (!e) throw new Error("[ugsci] QwenPaw.host not available");
  return e;
}
function La() {
  try {
    return z().getApiToken() || "";
  } catch {
    return "";
  }
}
function Qe(e) {
  return z().getApiUrl(e);
}
function Bn(e) {
  const t = La();
  return {
    "Content-Type": "application/json",
    ...t ? { Authorization: `Bearer ${t}` } : {},
    ...e
  };
}
const Pt = /* @__PURE__ */ new Map(), Ba = 15e3;
function Ze() {
  Pt.clear();
}
async function ce(e, t) {
  const l = ((t == null ? void 0 : t.method) || "GET").toUpperCase(), { bypassCache: a, ...n } = t || {};
  if (l !== "GET" && Ze(), l === "GET" && !a) {
    const o = Pt.get(e);
    if (o && Date.now() - o.ts < Ba)
      return o.data;
  }
  const s = await fetch(Qe(e), {
    ...n,
    headers: { ...Bn(), ...n.headers || {} }
  });
  if (!s.ok) {
    const o = await s.text().catch(() => "");
    throw new Error(o || `HTTP ${s.status}`);
  }
  if (s.status === 204) return null;
  const r = await s.json();
  return l === "GET" && Pt.set(e, { data: r, ts: Date.now() }), r;
}
function Sn(e) {
  return Qe(`/ugsci/avatar/${encodeURIComponent(e)}`);
}
function wn(e) {
  const t = e.map(encodeURIComponent).join(",");
  return Qe(`/ugsci/avatar/team/${t}`);
}
function Re({
  name: e,
  size: t = 32,
  borderRadius: l = "50%"
}) {
  const a = z().React, [n, s] = a.useState(0), r = n === 0 ? Sn(e) : `${Sn(e)}?_r=${n}`;
  return a.createElement("img", {
    src: r,
    alt: e,
    onError: () => {
      n < 1 && s(n + 1);
    },
    style: {
      width: t,
      height: t,
      borderRadius: l,
      objectFit: "cover",
      flexShrink: 0
    }
  });
}
function jt({
  members: e,
  size: t = 32,
  borderRadius: l = "50%"
}) {
  const a = z().React, [n, s] = a.useState(0);
  if (!e || e.length === 0)
    return a.createElement("span", {
      style: {
        width: t,
        height: t,
        display: "inline-block"
      }
    });
  const r = e.slice(0, 5), o = n === 0 ? wn(r) : `${wn(r)}?_r=${n}`;
  return a.createElement("img", {
    src: o,
    alt: "team",
    onError: () => {
      n < 1 && s(n + 1);
    },
    style: {
      width: t,
      height: t,
      borderRadius: l,
      objectFit: "cover",
      flexShrink: 0
    }
  });
}
const jn = "ugsci_custom_teams";
function ja(e) {
  if (!e || typeof e != "object") return !1;
  const t = e;
  return typeof t.id == "string" && typeof t.name == "string" && typeof t.taskTemplate == "string" && typeof t.orchestrationPrompt == "string" && Array.isArray(t.members);
}
function Et() {
  try {
    const e = JSON.parse(
      localStorage.getItem(jn) || "[]"
    );
    return Array.isArray(e) ? e.filter(ja) : [];
  } catch {
    return [];
  }
}
function Un(e) {
  try {
    localStorage.setItem(jn, JSON.stringify(e));
  } catch {
  }
}
async function Ua(e, t) {
  const l = await fetch(Qe("/console/chat"), {
    method: "POST",
    headers: {
      ...Bn(),
      "X-Agent-Id": e
    },
    body: JSON.stringify({
      channel: "console",
      user_id: "default",
      session_id: `team-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      input: [
        {
          role: "user",
          content: [{ type: "text", text: t }]
        }
      ]
    })
  });
  if (!l.ok) {
    const a = await l.text().catch(() => "");
    throw new Error(a || `HTTP ${l.status}`);
  }
}
function vt(e, t) {
  var n;
  const l = t.replace(/\s+/g, ""), a = e.find(
    (s) => s.name === t || s.name.replace(/\s+/g, "") === l
  );
  return a ? a.id : ((n = e.find(
    (s) => s.name.includes(t) || t.includes(s.name) || s.name.replace(/\s+/g, "").includes(l)
  )) == null ? void 0 : n.id) || null;
}
function Na({ team: e }) {
  const t = z().React, { Typography: l, Tag: a } = z().antd, { Text: n } = l, s = {
    pipeline: "→",
    roundtable: "⇄",
    coordinator: "⊙"
  }, r = {
    pipeline: "#13c2c2",
    roundtable: "#722ed1",
    coordinator: "#1677ff"
  }, o = e.steps || [];
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
      n,
      {
        type: "secondary",
        style: { fontSize: 12, display: "block", marginBottom: 8 }
      },
      `执行流程 (${e.mode === "pipeline" ? "流水线" : e.mode === "roundtable" ? "圆桌讨论" : "协调者模式"})`
    ),
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
      ...o.length > 0 ? o.map((d, c) => [
        c > 0 && e.mode !== "roundtable" ? t.createElement(
          "div",
          {
            key: `arrow-${c}`,
            style: {
              textAlign: "center",
              color: r[e.mode],
              fontSize: 14
            }
          },
          s[e.mode]
        ) : null,
        t.createElement(
          "div",
          {
            key: `step-${c}`,
            style: {
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "6px 10px",
              background: "#fff",
              borderRadius: 6,
              border: `1px solid ${r[e.mode]}33`,
              fontSize: 12,
              flex: e.mode === "roundtable" ? "1 1 200px" : "initial"
            }
          },
          t.createElement(Re, {
            name: d.agentName,
            size: 24
          }),
          t.createElement(
            "div",
            null,
            t.createElement(
              n,
              { strong: !0, style: { fontSize: 12 } },
              d.agentName
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
              d.instruction
            ),
            t.createElement(
              a,
              {
                ...d.passContext ? { color: "blue" } : {},
                style: { fontSize: 9, marginTop: 2 }
              },
              d.passContext ? "传递上下文" : "独立"
            )
          )
        )
      ]).flat() : e.members.map((d, c) => [
        c > 0 && e.mode !== "roundtable" ? t.createElement(
          "div",
          {
            key: `arrow-${c}`,
            style: {
              textAlign: "center",
              color: r[e.mode],
              fontSize: 14
            }
          },
          s[e.mode]
        ) : null,
        t.createElement(
          "div",
          {
            key: `member-${c}`,
            style: {
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "6px 10px",
              background: "#fff",
              borderRadius: 6,
              border: `1px solid ${r[e.mode]}33`,
              fontSize: 12,
              flex: e.mode === "roundtable" ? "1 1 150px" : "initial"
            }
          },
          t.createElement(Re, {
            name: d.name,
            size: 24
          }),
          t.createElement(
            "div",
            null,
            t.createElement(
              n,
              { strong: !0, style: { fontSize: 12 } },
              d.name
            ),
            t.createElement(
              "div",
              { style: { fontSize: 11, color: "#8c8c8c" } },
              d.role
            )
          )
        )
      ]).flat()
    )
  );
}
async function Ut() {
  const e = await ce("/agents");
  return (e == null ? void 0 : e.agents) || [];
}
async function Nt(e) {
  return ce(`/agents/${encodeURIComponent(e)}`);
}
async function wt(e) {
  return await ce("/skills", {
    headers: { "X-Agent-Id": e }
  }) || [];
}
async function Dt(e = !1) {
  return await ce(`/skills/pool${e ? "?summary=true" : ""}`) || [];
}
async function Da(e) {
  const t = await ce(
    `/skills/pool/${encodeURIComponent(e)}/content`
  );
  return (t == null ? void 0 : t.content) || "";
}
async function Fa() {
  return await ce("/skills/workspaces") || [];
}
async function Ga(e) {
  return await ce("/mcp", {
    headers: { "X-Agent-Id": e }
  }) || [];
}
async function Ha(e, t) {
  return ce(
    `/mcp/toggle/${encodeURIComponent(t)}`,
    {
      method: "PATCH",
      headers: { "X-Agent-Id": e }
    }
  );
}
async function Wa(e, t) {
  await ce(`/mcp/${encodeURIComponent(t)}`, {
    method: "DELETE",
    headers: { "X-Agent-Id": e }
  });
}
async function Ja(e, t, l) {
  return ce("/mcp", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify({ client_key: t, client: l })
  });
}
async function Ka(e, t, l) {
  return ce(
    `/mcp/${encodeURIComponent(t)}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json", "X-Agent-Id": e },
      body: JSON.stringify(l)
    }
  );
}
async function Xa(e, t) {
  return await ce(
    `/mcp/tools/${encodeURIComponent(t)}`,
    { headers: { "X-Agent-Id": e } }
  ) || [];
}
async function qa(e, t) {
  return ce(
    `/mcp/policy/${encodeURIComponent(t)}`,
    { headers: { "X-Agent-Id": e } }
  );
}
async function Va(e, t, l) {
  return ce(
    `/mcp/policy/${encodeURIComponent(t)}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json", "X-Agent-Id": e },
      body: JSON.stringify(l)
    }
  );
}
async function Ya(e) {
  return await ce(
    "/mcp/access-principals",
    { headers: { "X-Agent-Id": e } }
  ) || [];
}
async function Qa(e, t, l) {
  return ce(
    `/mcp/oauth/start/${encodeURIComponent(t)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Agent-Id": e },
      body: JSON.stringify(l)
    }
  );
}
async function Za(e, t) {
  return ce(
    `/mcp/oauth/status/${encodeURIComponent(t)}`,
    { headers: { "X-Agent-Id": e } }
  );
}
async function el(e, t) {
  await ce(
    `/mcp/oauth/${encodeURIComponent(t)}`,
    {
      method: "DELETE",
      headers: { "X-Agent-Id": e }
    }
  );
}
const Oe = {
  background: "#0072f5",
  color: "#fff",
  fontSize: 13,
  fontWeight: 600,
  border: "none",
  borderRadius: 8
};
function Xe() {
  try {
    return localStorage.getItem("qwenpaw_sidebar_mode") === "simple";
  } catch {
    return !1;
  }
}
function Ft(e, t) {
  const l = z();
  return l.ReactMarkdown && l.remarkGfm ? t.createElement(
    l.ReactMarkdown,
    { remarkPlugins: [l.remarkGfm] },
    e
  ) : e.replace(/\*\*(.+?)\*\*/g, "$1").replace(/\*(.+?)\*/g, "$1").replace(/`(.+?)`/g, "$1").replace(/^#+\s*/gm, "").replace(/^[-*]\s+/gm, "• ");
}
const Cn = {
  BRAVE_API_KEY: {
    label: "Brave API Key",
    help: "在 Brave Search API 官网注册获取",
    link: "https://brave.com/search/api/",
    isSecret: !0
  },
  GITHUB_PERSONAL_ACCESS_TOKEN: {
    label: "GitHub Personal Access Token",
    help: "GitHub Settings → Developer settings → Personal access tokens",
    link: "https://github.com/settings/tokens",
    isSecret: !0
  },
  GITLAB_PERSONAL_ACCESS_TOKEN: {
    label: "GitLab Personal Access Token",
    help: "GitLab User Settings → Access Tokens",
    link: "https://gitlab.com/-/user_settings/personal_access_tokens",
    isSecret: !0
  },
  GITLAB_API_URL: {
    label: "GitLab API URL",
    help: "默认为 https://gitlab.com/api/v4，自建实例请修改",
    isSecret: !1
  },
  EVERART_API_KEY: {
    label: "EverArt API Key",
    help: "在 EverArt 官网获取 API Key",
    link: "https://everart.ai/",
    isSecret: !0
  },
  SLACK_BOT_TOKEN: {
    label: "Slack Bot Token",
    help: "以 xoxb- 开头，在 Slack App 设置中获取",
    link: "https://api.slack.com/apps",
    isSecret: !0
  },
  SLACK_TEAM_ID: {
    label: "Slack Team ID",
    help: "在 Slack 工作区设置中查看 Team ID",
    isSecret: !1
  },
  POSTGRES_CONNECTION_STRING: {
    label: "PostgreSQL 连接串",
    help: "格式: postgresql://user:password@host:port/dbname",
    isSecret: !0
  }
};
function tl(e) {
  if (!e.env) return !1;
  const t = Object.entries(e.env);
  return t.length === 0 ? !1 : t.some(([, l]) => typeof l == "string" && l.length > 0);
}
const nl = [
  {
    id: "reservoir-engineer",
    name: "油藏工程师",
    category: "油气开发",
    description: "**油藏工程师** —— 擅长储量评估、物质平衡计算、递减曲线分析、油藏数值模拟方案设计。",
    version: "1.0.0",
    author: "UGSci Team",
    tags: ["油藏", "数值模拟", "储量评估", "历史拟合"],
    avatar_seed: "油藏工程师",
    system_prompt: `# 油藏工程师

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
    recommended_skills: [
      "oil-gas-foundation",
      "oil-gas-reservoir-production",
      "reservoir-simulation-workflow",
      "history-matching",
      "convergence-diagnosis",
      "matplotlib",
      "statistical-analysis",
      "sensitivity-analysis"
    ],
    knowledge_files: [],
    mcp_clients: [],
    memory_seeds: [],
    approval_level: "AUTO"
  },
  {
    id: "drilling-engineer",
    name: "钻井工程师",
    category: "钻完井",
    description: "**钻井工程师** —— 擅长井身结构设计、钻井液优化、套管设计、固井方案和钻井风险管理。",
    version: "1.0.0",
    author: "UGSci Team",
    tags: ["钻井", "套管设计", "钻井液", "固井"],
    avatar_seed: "钻井工程师",
    system_prompt: `# 钻井工程师

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
    recommended_skills: [
      "oil-gas-foundation",
      "oil-gas-drilling",
      "oil-gas-reservoir-production",
      "matplotlib",
      "statistical-analysis",
      "systematic-debugging"
    ],
    knowledge_files: [],
    mcp_clients: [],
    memory_seeds: [],
    approval_level: "MANUAL"
  },
  {
    id: "well-logging-analyst",
    name: "测井分析师",
    category: "测井试油",
    description: "**测井分析师** —— 擅长测井曲线解释、岩性识别、孔隙度/饱和度计算和储层评价。",
    version: "1.0.0",
    author: "UGSci Team",
    tags: ["测井", "岩性识别", "储层评价", "孔隙度"],
    avatar_seed: "测井分析师",
    system_prompt: `# 测井分析师

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
    recommended_skills: [
      "oil-gas-foundation",
      "well-log-analysis",
      "oil-gas-exploration",
      "exploratory-data-analysis",
      "matplotlib",
      "statistical-analysis",
      "scikit-learn"
    ],
    knowledge_files: [],
    mcp_clients: [],
    memory_seeds: [],
    approval_level: "AUTO"
  },
  {
    id: "production-engineer",
    name: "采油工程师",
    category: "油气生产",
    description: "**采油工程师** —— 擅长举升工艺设计、注水管理、增产措施工艺设计和生产动态监测。",
    version: "1.0.0",
    author: "UGSci Team",
    tags: ["采油", "举升工艺", "注水", "压裂酸化"],
    avatar_seed: "采油工程师",
    system_prompt: `# 采油工程师

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
    recommended_skills: [
      "oil-gas-foundation",
      "oil-gas-reservoir-production",
      "scada-timeseries",
      "matplotlib",
      "statistical-analysis",
      "sensitivity-analysis",
      "multi-objective-optimization"
    ],
    knowledge_files: [],
    mcp_clients: [],
    memory_seeds: [],
    approval_level: "AUTO"
  },
  {
    id: "geophysicist",
    name: "地球物理专家",
    category: "地球物理",
    description: "**地球物理专家** —— 擅长地震资料解释、属性分析、反演处理和储层预测。",
    version: "1.0.0",
    author: "UGSci Team",
    tags: ["地球物理", "地震", "反演", "储层预测"],
    avatar_seed: "地球物理专家",
    system_prompt: `# 地球物理专家

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
    recommended_skills: [
      "oil-gas-foundation",
      "oil-gas-exploration",
      "segy-operations",
      "matplotlib",
      "statistical-analysis",
      "exploratory-data-analysis",
      "scikit-learn"
    ],
    knowledge_files: [],
    mcp_clients: [],
    memory_seeds: [],
    approval_level: "AUTO"
  },
  {
    id: "pvt-analyst",
    name: "PVT 分析师",
    category: "流体性质",
    description: "**PVT 分析师** —— 擅长油气流体物性计算、相态分析、PVT 实验拟合和组分模型。",
    version: "1.0.0",
    author: "UGSci Team",
    tags: ["PVT", "相态分析", "流体物性", "状态方程"],
    avatar_seed: "PVT 分析师",
    system_prompt: `# PVT 分析师

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
    recommended_skills: [
      "oil-gas-foundation",
      "oil-gas-reservoir-production",
      "matplotlib",
      "statistical-analysis",
      "sensitivity-analysis",
      "sympy",
      "pymoo"
    ],
    knowledge_files: [],
    mcp_clients: [],
    memory_seeds: [],
    approval_level: "AUTO"
  }
], al = nl;
function ll({
  open: e,
  onClose: t,
  agents: l,
  editingTeam: a,
  onSaved: n
}) {
  const s = z().React, { useState: r, useEffect: o, useCallback: d } = s, {
    Modal: c,
    Input: f,
    Button: b,
    Select: k,
    Tag: S,
    Typography: h,
    Switch: y,
    Empty: A,
    message: L,
    Divider: U,
    Steps: N
  } = z().antd, { PlusOutlined: te, DeleteOutlined: G, SaveOutlined: H, ArrowRightOutlined: x } = z().antdIcons || {}, { Text: C, Paragraph: _ } = h, [J, F] = r(""), [I, E] = r("🤝"), [g, M] = r(""), [K, Q] = r(
    "pipeline"
  ), [le, $] = r(""), [p, u] = r(""), [O, ne] = r([]), [R, V] = r([]), [se, w] = r(!1);
  o(() => {
    e && (a ? (F(a.name), E(a.emoji), M(a.description), Q(a.mode), $(a.coordinatorName || ""), u(a.taskTemplate), ne(a.steps || []), V(a.members.map((B) => B.name))) : (F(""), E("🤝"), M(""), Q("pipeline"), $(""), u(`请执行以下任务：
任务描述：{任务描述}`), ne([]), V([])));
  }, [e, a]);
  const W = d(() => {
    if (K === "roundtable") {
      const B = R.map((oe) => ({
        agentName: oe,
        instruction: "请给出你的专业评估意见",
        passContext: !1
      }));
      ne(B);
    } else if (K === "pipeline") {
      const B = new Map(O.map((de) => [de.agentName, de])), oe = R.map((de) => B.get(de) || {
        agentName: de,
        instruction: "请完成你的专业部分",
        passContext: !0
      });
      ne(oe);
    }
  }, [K, R, O]), re = (B) => {
    R.includes(B) || (V([...R, B]), K === "coordinator" && !le && $(B));
  }, v = (B) => {
    V(R.filter((oe) => oe !== B)), ne(O.filter((oe) => oe.agentName !== B)), le === B && $(R[0] || "");
  }, Z = (B, oe, de) => {
    const Ee = [...O];
    Ee[B] = { ...Ee[B], [oe]: de }, ne(Ee);
  }, m = () => {
    if (!J.trim()) {
      L.warning("请输入团队名称");
      return;
    }
    if (R.length < 2) {
      L.warning("至少需要选择 2 个成员");
      return;
    }
    if (!p.trim()) {
      L.warning("请输入任务模板");
      return;
    }
    if (K === "coordinator" && !le) {
      L.warning("请选择协调者");
      return;
    }
    w(!0);
    try {
      const B = R.map(
        (pe) => {
          var D;
          const ae = l.find((T) => T.name === pe);
          return {
            name: pe,
            role: ((D = ae == null ? void 0 : ae.description) == null ? void 0 : D.slice(0, 30)) || "团队成员",
            emoji: ""
          };
        }
      );
      let oe = O;
      (O.length === 0 || O.length !== R.length) && (oe = R.map((pe) => ({
        agentName: pe,
        instruction: "请完成你的专业部分",
        passContext: K === "pipeline"
      })));
      const de = {
        id: (a == null ? void 0 : a.id) || `custom-${Date.now()}`,
        name: J.trim(),
        emoji: I,
        category: "自定义",
        description: g.trim() || `${J.trim()}（${R.length}人团队）`,
        mode: K,
        members: B,
        coordinatorName: K === "coordinator" ? le : void 0,
        taskTemplate: p.trim(),
        orchestrationPrompt: "",
        // Custom teams use steps-based instructions
        steps: oe,
        custom: !0,
        createdAt: (a == null ? void 0 : a.createdAt) || Date.now()
      }, Ee = Et(), ye = Ee.findIndex((pe) => pe.id === de.id);
      ye >= 0 ? Ee[ye] = de : Ee.push(de), Un(Ee), L.success(a ? "团队已更新" : "团队已创建"), n(), t();
    } catch (B) {
      L.error(B.message || "保存失败");
    } finally {
      w(!1);
    }
  }, Y = l.filter(
    (B) => !R.includes(B.name)
  );
  return s.createElement(
    c,
    {
      open: e,
      onCancel: t,
      title: s.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 8 } },
        s.createElement(
          "span",
          { style: { fontSize: 20 } },
          a ? "✏️" : "➕"
        ),
        s.createElement(
          "span",
          null,
          a ? "编辑专家团" : "创建专家团"
        )
      ),
      width: 720,
      onOk: m,
      okText: "保存团队",
      confirmLoading: se,
      okButtonProps: {
        icon: H ? s.createElement(H) : void 0
      }
    },
    // Step 1: Basic info
    s.createElement(
      "div",
      { style: { marginBottom: 16 } },
      s.createElement(
        C,
        {
          strong: !0,
          style: { display: "block", marginBottom: 8, fontSize: 13 }
        },
        "1. 基本信息"
      ),
      s.createElement(
        "div",
        { style: { display: "flex", gap: 8, marginBottom: 8, alignItems: "center" } },
        R.length > 0 ? s.createElement(jt, {
          members: R,
          size: 36
        }) : null,
        s.createElement(f, {
          placeholder: "团队名称（如：储层评价团队）",
          value: J,
          onChange: (B) => F(B.target.value),
          style: { flex: 1 }
        })
      ),
      s.createElement(f.TextArea, {
        placeholder: "团队描述（简述团队的目标和适用场景）",
        value: g,
        onChange: (B) => M(B.target.value),
        rows: 2,
        style: { marginBottom: 8 }
      }),
      s.createElement(
        "div",
        { style: { display: "flex", gap: 8, alignItems: "center" } },
        s.createElement(
          C,
          { type: "secondary", style: { fontSize: 12 } },
          "协同模式："
        ),
        s.createElement(k, {
          value: K,
          onChange: (B) => Q(B),
          style: { width: 160 },
          options: [
            { value: "pipeline", label: "🔄 流水线（依次执行）" },
            { value: "roundtable", label: "🔀 圆桌讨论（独立评估）" },
            { value: "coordinator", label: "🎯 协调者（由协调者主导）" }
          ]
        })
      )
    ),
    s.createElement(U, { style: { margin: "12px 0" } }),
    // Step 2: Select members
    s.createElement(
      "div",
      { style: { marginBottom: 16 } },
      s.createElement(
        C,
        {
          strong: !0,
          style: { display: "block", marginBottom: 8, fontSize: 13 }
        },
        "2. 选择团队成员"
      ),
      // Available agents
      Y.length > 0 ? s.createElement(
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
        ...Y.map(
          (B) => s.createElement(
            b,
            {
              key: B.id,
              size: "small",
              icon: te ? s.createElement(te) : void 0,
              onClick: () => re(B.name)
            },
            B.name
          )
        )
      ) : null,
      // Selected members
      R.length === 0 ? s.createElement(A, {
        description: "请从上方添加团队成员",
        image: A.PRESENTED_IMAGE_SIMPLE
      }) : s.createElement(
        "div",
        { style: { display: "flex", flexDirection: "column", gap: 4 } },
        ...R.map(
          (B) => s.createElement(
            "div",
            {
              key: B,
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
            s.createElement(
              "div",
              { style: { display: "flex", alignItems: "center", gap: 6 } },
              s.createElement(Re, { name: B, size: 24 }),
              s.createElement(
                C,
                { strong: !0, style: { fontSize: 13 } },
                B
              ),
              K === "coordinator" && le === B ? s.createElement(
                S,
                { color: "blue", style: { fontSize: 10 } },
                "协调者"
              ) : null
            ),
            s.createElement(
              "div",
              { style: { display: "flex", gap: 4 } },
              K === "coordinator" ? s.createElement(
                b,
                {
                  size: "small",
                  type: "link",
                  onClick: () => $(B)
                },
                "设为协调者"
              ) : null,
              s.createElement(
                b,
                {
                  size: "small",
                  type: "link",
                  danger: !0,
                  icon: G ? s.createElement(G) : void 0,
                  onClick: () => v(B)
                },
                "移除"
              )
            )
          )
        )
      )
    ),
    s.createElement(U, { style: { margin: "12px 0" } }),
    // Step 3: Define execution steps (for pipeline/roundtable)
    R.length > 0 ? s.createElement(
      "div",
      { style: { marginBottom: 16 } },
      s.createElement(
        C,
        {
          strong: !0,
          style: { display: "block", marginBottom: 8, fontSize: 13 }
        },
        `3. 编排执行步骤${K === "roundtable" ? "（各步独立执行）" : K === "pipeline" ? "（依次执行，可传递上下文）" : "（由协调者决定调用顺序）"}`
      ),
      // Auto-sync button
      s.createElement(
        b,
        {
          size: "small",
          type: "dashed",
          onClick: W,
          style: { marginBottom: 8 }
        },
        "自动生成步骤"
      ),
      // Steps list
      O.length === 0 ? s.createElement(
        C,
        { type: "secondary", style: { fontSize: 12 } },
        "点击「自动生成步骤」或手动配置每步的指令"
      ) : s.createElement(
        "div",
        { style: { display: "flex", flexDirection: "column", gap: 6 } },
        ...O.map(
          (B, oe) => s.createElement(
            "div",
            {
              key: oe,
              style: {
                padding: 8,
                background: "#fff",
                borderRadius: 6,
                border: "1px solid #e8e8e8"
              }
            },
            s.createElement(
              "div",
              {
                style: {
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  marginBottom: 6
                }
              },
              K === "pipeline" ? s.createElement(
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
                `${oe + 1}`
              ) : s.createElement(
                "span",
                { style: { fontSize: 14 } },
                "🔀"
              ),
              s.createElement(
                S,
                { color: "blue", style: { fontSize: 11 } },
                B.agentName
              ),
              s.createElement(
                "div",
                { style: { flex: 1 } },
                s.createElement(f, {
                  placeholder: "请输入该步骤的指令...",
                  value: B.instruction,
                  onChange: (de) => Z(oe, "instruction", de.target.value),
                  size: "small"
                })
              )
            ),
            s.createElement(
              "div",
              {
                style: {
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  paddingLeft: 28
                }
              },
              s.createElement(y, {
                size: "small",
                checked: B.passContext,
                onChange: (de) => Z(oe, "passContext", de)
              }),
              s.createElement(
                C,
                { type: "secondary", style: { fontSize: 11 } },
                B.passContext ? "传递上一步结果作为上下文" : "独立执行"
              )
            )
          )
        )
      )
    ) : null,
    s.createElement(U, { style: { margin: "12px 0" } }),
    // Step 4: Task template
    s.createElement(
      "div",
      null,
      s.createElement(
        C,
        {
          strong: !0,
          style: { display: "block", marginBottom: 8, fontSize: 13 }
        },
        `${R.length > 0 ? "4" : "3"}. 任务模板`
      ),
      s.createElement(f.TextArea, {
        placeholder: `输入任务模板，可用 {参数名} 作为占位符...

例如：
请对区块 {区块名} 的井 {井号} 进行储层评价`,
        value: p,
        onChange: (B) => u(B.target.value),
        rows: 4,
        style: { fontFamily: "monospace", fontSize: 13 }
      }),
      s.createElement(
        C,
        {
          type: "secondary",
          style: { fontSize: 11, display: "block", marginTop: 4 }
        },
        "占位符 {参数名} 在发起任务时可由用户填写替换"
      )
    )
  );
}
function xn({
  team: e,
  agents: t,
  onLaunch: l,
  onEdit: a,
  onDelete: n
}) {
  var E;
  const s = z().React, { useState: r } = s, { Card: o, Tag: d, Typography: c, Button: f, Tooltip: b } = z().antd, {
    TeamOutlined: k,
    RocketOutlined: S,
    UserOutlined: h,
    EditOutlined: y,
    DeleteOutlined: A,
    DownOutlined: L,
    UpOutlined: U
  } = z().antdIcons || {}, { Text: N, Paragraph: te } = c, [G, H] = r(!1), x = {
    coordinator: { label: "协调者模式", color: "blue" },
    pipeline: { label: "流水线模式", color: "cyan" },
    roundtable: { label: "圆桌讨论", color: "purple" }
  }, C = x[e.mode] || x.coordinator, _ = e.members.map((g) => {
    const M = vt(t, g.name);
    return { ...g, found: !!M, agentId: M };
  }), J = _.filter((g) => g.found).length, F = e.coordinatorName || ((E = e.members[0]) == null ? void 0 : E.name), I = F ? vt(t, F) : null;
  return s.createElement(
    o,
    {
      hoverable: !0,
      size: "small",
      style: { height: "100%", display: "flex", flexDirection: "column" }
    },
    // Header: emoji + name + mode tag + custom badge
    s.createElement(
      "div",
      {
        style: {
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 10
        }
      },
      s.createElement(jt, {
        members: e.members.map((g) => g.name),
        size: 36
      }),
      s.createElement(
        "div",
        { style: { flex: 1 } },
        s.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 6 } },
          s.createElement(
            N,
            { strong: !0, style: { fontSize: 14 } },
            e.name
          ),
          e.custom ? s.createElement(
            d,
            { color: "gold", style: { fontSize: 9 } },
            "自定义"
          ) : null
        ),
        s.createElement(
          "div",
          { style: { display: "flex", gap: 4, marginTop: 4 } },
          s.createElement(
            d,
            { color: C.color, style: { fontSize: 10 } },
            C.label
          ),
          s.createElement(
            d,
            { color: "green", style: { fontSize: 10 } },
            `${e.members.length} 位专家`
          ),
          J < e.members.length ? s.createElement(
            b,
            {
              title: `OMP 架构下，未创建的专家将通过 spawn_subagent 自动派发，
控制器会根据角色 prompt 创建子 agent 执行任务。`
            },
            s.createElement(
              d,
              { color: "blue", style: { fontSize: 10 } },
              "OMP 自动派发"
            )
          ) : s.createElement(
            d,
            { color: "green", style: { fontSize: 10 } },
            "全部就绪"
          )
        )
      ),
      // Edit/delete for custom teams
      e.custom ? s.createElement(
        "div",
        { style: { display: "flex", gap: 2 } },
        a ? s.createElement(
          b,
          { title: "编辑" },
          s.createElement(f, {
            type: "text",
            size: "small",
            icon: y ? s.createElement(y) : void 0,
            onClick: (g) => {
              g.stopPropagation(), a(e);
            }
          })
        ) : null,
        n ? s.createElement(
          b,
          { title: "删除" },
          s.createElement(f, {
            type: "text",
            size: "small",
            danger: !0,
            icon: A ? s.createElement(A) : void 0,
            onClick: (g) => {
              g.stopPropagation(), n(e);
            }
          })
        ) : null
      ) : null
    ),
    // Description
    s.createElement(
      te,
      {
        type: "secondary",
        style: { fontSize: 12, margin: 0, marginBottom: 10, lineHeight: 1.5 },
        ellipsis: { rows: 2 }
      },
      e.description
    ),
    // Member avatars
    s.createElement(
      "div",
      {
        style: {
          display: "flex",
          gap: 6,
          marginBottom: 10,
          flexWrap: "wrap"
        }
      },
      ..._.map(
        (g) => s.createElement(
          b,
          {
            key: g.name,
            title: `${g.name}（${g.role}）${g.found ? "" : " - 未创建"}`
          },
          s.createElement(
            "div",
            {
              style: {
                display: "flex",
                alignItems: "center",
                gap: 4,
                padding: "2px 8px",
                borderRadius: 12,
                background: g.found ? "#f0f5ff" : "#f0f0ff",
                border: `1px solid ${g.found ? "#d6e4ff" : "#d3adf7"}`,
                fontSize: 11
              }
            },
            s.createElement(Re, { name: g.name, size: 18 }),
            s.createElement(
              N,
              {
                style: { fontSize: 11, color: g.found ? "#1f4e8c" : "#531dab" }
              },
              g.name
            )
          )
        )
      )
    ),
    // Toggle flow diagram
    s.createElement(
      f,
      {
        type: "link",
        size: "small",
        style: { padding: "0 0 4px 0", fontSize: 11, height: "auto" },
        onClick: (g) => {
          g.stopPropagation(), H(!G);
        },
        icon: G ? U ? s.createElement(U) : "▲" : L ? s.createElement(L) : "▼"
      },
      G ? "收起流程" : "查看执行流程"
    ),
    G ? s.createElement(Na, { team: e }) : null,
    // Footer: launch button
    s.createElement(
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
      s.createElement(
        N,
        { type: "secondary", style: { fontSize: 11 } },
        F ? `协调者: ${F}` : ""
      ),
      s.createElement(
        f,
        {
          type: "primary",
          size: "small",
          icon: S ? s.createElement(S) : void 0,
          disabled: !I,
          onClick: () => l(e),
          style: Oe
        },
        "发起团队任务"
      )
    )
  );
}
function sl({
  agents: e,
  onLaunch: t
}) {
  const l = z().React, { useMemo: a, useState: n, useCallback: s, useEffect: r } = l, {
    Row: o,
    Col: d,
    Input: c,
    Empty: f,
    Typography: b,
    Tag: k,
    Button: S,
    Divider: h,
    Tabs: y,
    message: A,
    Popconfirm: L
  } = z().antd, { SearchOutlined: U, TeamOutlined: N, PlusOutlined: te, RocketOutlined: G } = z().antdIcons || {}, { Text: H } = b, [x, C] = n(""), [_, J] = n([]), [F, I] = n([]), [E, g] = n(!1), [M, K] = n(!1), [Q, le] = n(null);
  r(() => {
    J(Et());
    let w = !0;
    return Pa().then((W) => {
      w && (W ? (I(W), g(!1)) : g(!0));
    }), () => {
      w = !1;
    };
  }, []);
  const $ = s(() => {
    J(Et());
  }, []), p = s(
    (w) => {
      const re = Et().filter((v) => v.id !== w.id);
      Un(re), J(re), A.success(`团队「${w.name}」已删除`);
    },
    [A]
  ), u = s((w) => {
    le(w), K(!0);
  }, []), O = s(() => {
    le(null), K(!0);
  }, []), ne = a(() => [..._, ...F], [_, F]), R = a(() => {
    if (!x.trim()) return ne;
    const w = x.toLowerCase();
    return ne.filter(
      (W) => W.name.toLowerCase().includes(w) || W.description.toLowerCase().includes(w) || W.category.toLowerCase().includes(w)
    );
  }, [ne, x]), V = R.filter((w) => w.custom), se = R.filter((w) => !w.custom);
  return l.createElement(
    "div",
    null,
    // Workflow status card (OMP-backed)
    l.createElement(Ra),
    E ? l.createElement(z().antd.Alert, {
      type: "warning",
      showIcon: !0,
      message: "预设专家团加载失败",
      description: "请确认 UGSci 后端插件已启用，然后刷新页面。",
      style: { marginBottom: 16 }
    }) : null,
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
        H,
        { style: { fontSize: 13, color: "#389e0d" } },
        "OMP 驱动的专家团工作流 — 5 阶段状态机（规划→分派→验证→综合→完成），支持结构化交接、角色工具隔离、fork 并行执行和自动重试。"
      ),
      l.createElement(
        S,
        {
          type: "primary",
          size: "small",
          icon: te ? l.createElement(te) : void 0,
          onClick: O,
          style: Oe
        },
        "创建专家团"
      )
    ),
    // Search
    l.createElement(c, {
      placeholder: "搜索团队名称、描述或类别...",
      prefix: U ? l.createElement(U) : void 0,
      value: x,
      onChange: (w) => C(w.target.value),
      allowClear: !0,
      style: { marginBottom: 16, maxWidth: 400 }
    }),
    // Tabs: preset teams vs custom teams
    l.createElement(
      y,
      {
        defaultActiveKey: "preset",
        items: [
          {
            key: "preset",
            label: `预设团队${se.length ? ` (${se.length})` : ""}`,
            children: l.createElement(
              "div",
              null,
              se.length > 0 ? l.createElement(
                o,
                { gutter: [12, 12] },
                ...se.map(
                  (w) => l.createElement(
                    d,
                    { key: w.id, xs: 24, sm: 12, md: 8 },
                    l.createElement(xn, {
                      team: w,
                      agents: e,
                      onLaunch: t
                    })
                  )
                )
              ) : l.createElement(f, {
                description: "未找到匹配的预设团队",
                image: f.PRESENTED_IMAGE_SIMPLE
              })
            )
          },
          {
            key: "custom",
            label: `自定义团队${V.length ? ` (${V.length})` : ""}`,
            children: l.createElement(
              "div",
              null,
              V.length > 0 ? l.createElement(
                o,
                { gutter: [12, 12] },
                ...V.map(
                  (w) => l.createElement(
                    d,
                    { key: w.id, xs: 24, sm: 12, md: 8 },
                    l.createElement(xn, {
                      team: w,
                      agents: e,
                      onLaunch: t,
                      onEdit: u,
                      onDelete: p
                    })
                  )
                )
              ) : l.createElement(f, {
                description: "暂无自定义团队，点击「创建专家团」自定义",
                image: f.PRESENTED_IMAGE_SIMPLE
              })
            )
          }
        ]
      }
    ),
    // Team Builder Modal
    l.createElement(ll, {
      open: M,
      onClose: () => {
        K(!1), le(null);
      },
      agents: e,
      editingTeam: Q,
      onSaved: $
    })
  );
}
function Nn(e) {
  var l;
  const t = [];
  for (const a of e) {
    if (a.enabled === !1) continue;
    const n = (l = a.description) == null ? void 0 : l.trim();
    if (!n) continue;
    const s = (a.name || n).length > 20 ? (a.name || n).substring(0, 18) + "…" : a.name || n;
    let r = n;
    if (r = r.replace(/\*\*(.+?)\*\*/g, "$1").replace(/\*(.+?)\*/g, "$1").replace(/`(.+?)`/g, "$1").replace(/^#+\s*/gm, "").trim(), /^(用于|帮助|提供|支持|实现|完成|分析|计算|生成|创建|检查)/.test(r) ? r = `请${r}` : /^(a |an |the )/i.test(r) ? r = `Help me with ${r}` : /[。？！.?!]$/.test(r) || (r = `帮我${r}`), r.length > 80 && (r = r.substring(0, 77) + "..."), t.push({ label: s, value: r }), t.length >= 4) break;
  }
  return t;
}
async function ol(e) {
  return await ce("/workspace/files", {
    headers: { "X-Agent-Id": e }
  }) || [];
}
async function bt(e, t, l) {
  await ce(`/workspace/files/${encodeURIComponent(t)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify({ content: l })
  });
}
async function kn(e, t) {
  const l = await Nt(e);
  l.system_prompt_files = t, await ce(`/agents/${encodeURIComponent(e)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(l)
  });
}
async function Gt(e, t) {
  await ce("/skills/pool/download", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      skill_name: t,
      targets: [{ workspace_id: e }],
      overwrite: !1
    })
  });
}
async function Dn(e, t) {
  await ce(`/skills/${encodeURIComponent(t)}/enable`, {
    method: "POST",
    headers: { "X-Agent-Id": e }
  });
}
async function Ht(e, t) {
  await ce(`/skills/${encodeURIComponent(t)}`, {
    method: "DELETE",
    headers: { "X-Agent-Id": e }
  });
}
async function rl(e, t) {
  return ce("/skills/batch-enable", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify(t)
  });
}
async function il(e, t) {
  return ce("/skills/batch-disable", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify(t)
  });
}
async function cl(e, t) {
  return ce("/skills/batch-delete", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify(t)
  });
}
async function Wt(e) {
  return await ce("/mcp", {
    headers: { "X-Agent-Id": e }
  }) || [];
}
async function Fn(e, t) {
  await ce(`/mcp/${encodeURIComponent(t)}`, {
    method: "DELETE",
    headers: { "X-Agent-Id": e }
  });
}
async function Gn(e, t) {
  return ce("/mcp", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify(t)
  });
}
async function ml(e, t) {
  return ce(
    `/mcp/toggle/${encodeURIComponent(t)}`,
    {
      method: "PATCH",
      headers: { "X-Agent-Id": e }
    }
  );
}
async function Hn(e, t) {
  await ce(`/skills/${encodeURIComponent(t)}/disable`, {
    method: "POST",
    headers: { "X-Agent-Id": e }
  });
}
async function dl(e) {
  await ce(`/skills/pool/${encodeURIComponent(e)}`, {
    method: "DELETE"
  });
}
function ul(e) {
  const t = (e || "").trim();
  if (!t) return { number: 6, unit: "h" };
  const l = t.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/i);
  if (!l) return { number: 6, unit: "h" };
  const a = parseInt(l[1] || "0", 10), n = parseInt(l[2] || "0", 10), s = parseInt(l[3] || "0", 10), r = a * 60 + n + Math.round(s / 60);
  return r <= 0 ? { number: 6, unit: "h" } : r >= 60 && r % 60 === 0 ? { number: r / 60, unit: "h" } : { number: r, unit: "m" };
}
function pl(e) {
  return e.unit === "h" ? `${e.number}h` : `${e.number}m`;
}
async function gl(e) {
  return ce("/config/heartbeat", {
    headers: { "X-Agent-Id": e }
  });
}
async function fl(e, t) {
  return ce("/config/heartbeat", {
    method: "PUT",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify(t)
  });
}
async function yl(e) {
  await ce("/config/heartbeat/run", {
    method: "POST",
    headers: { "X-Agent-Id": e }
  });
}
async function El(e) {
  return ce("/workspace/running-config", {
    headers: { "X-Agent-Id": e }
  });
}
async function hl(e, t) {
  return ce("/workspace/running-config", {
    method: "PUT",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify(t)
  });
}
async function vl(e) {
  return (await ce("/workspace/language", {
    headers: { "X-Agent-Id": e }
  })).language || "zh";
}
async function bl(e, t) {
  await ce("/workspace/language", {
    method: "PUT",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify({ language: t })
  });
}
async function Sl() {
  return (await ce("/config/user-timezone")).timezone || "UTC";
}
async function wl(e) {
  await ce("/config/user-timezone", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ timezone: e })
  });
}
async function Cl(e) {
  return await ce("/workspace/system-prompt-files", {
    headers: { "X-Agent-Id": e }
  }) || [];
}
const _n = ["AGENTS.md", "SOUL.md", "PROFILE.md"];
function Ct({
  title: e,
  subtitle: t,
  extra: l
}) {
  const a = z().React, { Space: n } = z().antd;
  return a.createElement(
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
    a.createElement(
      "div",
      null,
      a.createElement(
        "h2",
        { style: { margin: 0, fontSize: 20, fontWeight: 600 } },
        e
      ),
      t ? a.createElement(
        "div",
        { style: { marginTop: 4, fontSize: 13, color: "#8c8c8c" } },
        t
      ) : null
    ),
    l ? a.createElement(n, null, l) : null
  );
}
function Tn({
  items: e,
  max: t = 5,
  color: l = "blue",
  emptyText: a = "无"
}) {
  const n = z().React, { Tag: s } = z().antd;
  return !e || e.length === 0 ? n.createElement(
    "span",
    { style: { fontSize: 12, color: "#bfbfbf" } },
    a
  ) : n.createElement(
    "div",
    { style: { display: "flex", flexWrap: "wrap", gap: 4 } },
    ...e.slice(0, t).map(
      (r, o) => n.createElement(
        s,
        { key: o, color: l, style: { fontSize: 11, marginRight: 0 } },
        r
      )
    ),
    e.length > t ? n.createElement(
      s,
      { style: { fontSize: 11, marginRight: 0 } },
      `+${e.length - t}`
    ) : null
  );
}
function Wn({
  open: e,
  onClose: t,
  poolSkills: l,
  installedSkillNames: a,
  loading: n,
  onInstall: s
}) {
  const r = z().React, { useState: o, useEffect: d, useMemo: c } = r, { Modal: f, Button: b, Empty: k, Spin: S, Input: h, Tag: y, Tooltip: A, Typography: L } = z().antd, { CheckOutlined: U, SearchOutlined: N } = z().antdIcons || {}, { Text: te } = L, [G, H] = o([]), [x, C] = o("");
  d(() => {
    e && (H([]), C(""));
  }, [e]);
  const _ = c(() => {
    if (!x.trim()) return l;
    const E = x.toLowerCase();
    return l.filter(
      (g) => {
        var M, K;
        return g.name.toLowerCase().includes(E) || ((M = g.description) == null ? void 0 : M.toLowerCase().includes(E)) || ((K = g.tags) == null ? void 0 : K.some((Q) => Q.toLowerCase().includes(E)));
      }
    );
  }, [l, x]), J = _.filter(
    (E) => !a.includes(E.name)
  ), F = (E) => {
    H(
      (g) => g.includes(E) ? g.filter((M) => M !== E) : [...g, E]
    );
  }, I = async () => {
    G.length !== 0 && (await s(G), H([]));
  };
  return r.createElement(
    f,
    {
      open: e,
      onCancel: t,
      title: "从技能池选择技能",
      width: 680,
      footer: r.createElement(
        "div",
        {
          style: {
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }
        },
        r.createElement(
          te,
          { type: "secondary", style: { fontSize: 13 } },
          `已选择 ${G.length} 个技能`
        ),
        r.createElement(
          "div",
          { style: { display: "flex", gap: 8 } },
          r.createElement(b, { onClick: t }, "取消"),
          r.createElement(
            b,
            {
              type: "primary",
              onClick: I,
              disabled: G.length === 0
            },
            G.length > 0 ? `添加 (${G.length})` : "添加"
          )
        )
      )
    },
    // Search + bulk actions bar
    r.createElement(
      "div",
      {
        style: {
          marginBottom: 12,
          display: "flex",
          gap: 8,
          alignItems: "center"
        }
      },
      r.createElement(h, {
        placeholder: "搜索技能名称、描述或标签...",
        prefix: N ? r.createElement(N) : void 0,
        value: x,
        onChange: (E) => C(E.target.value),
        allowClear: !0,
        style: { flex: 1 }
      }),
      r.createElement(
        b,
        {
          size: "small",
          type: "primary",
          onClick: () => H(J.map((E) => E.name))
        },
        "全选"
      ),
      r.createElement(
        b,
        {
          size: "small",
          onClick: () => H([])
        },
        "清空"
      )
    ),
    // Skill grid (card style matching Skill Center)
    n ? r.createElement(
      "div",
      { style: { textAlign: "center", padding: 40 } },
      r.createElement(S, { size: "large" })
    ) : _.length === 0 ? r.createElement(k, {
      description: x ? "未找到匹配的技能" : "技能池暂无可用技能",
      image: k.PRESENTED_IMAGE_SIMPLE
    }) : r.createElement(
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
      ..._.map((E) => {
        const g = G.includes(E.name), M = a.includes(E.name);
        return r.createElement(
          "div",
          {
            key: E.name,
            onClick: () => !M && F(E.name),
            style: {
              position: "relative",
              padding: "10px 12px",
              border: `1px solid ${g ? "#0072f5" : "#e8e8e8"}`,
              borderRadius: 6,
              cursor: M ? "not-allowed" : "pointer",
              transition: "all 0.15s ease",
              background: g ? "rgba(0, 114, 245, 0.06)" : M ? "#fafafa" : "#fff",
              opacity: M ? 0.5 : 1,
              minHeight: 64
            }
          },
          g ? r.createElement(
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
            U ? r.createElement(U) : "✓"
          ) : null,
          M ? r.createElement(
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
          r.createElement(
            "div",
            {
              style: {
                display: "flex",
                alignItems: "center",
                gap: 6,
                marginBottom: 4,
                paddingRight: M || g ? 24 : 0
              }
            },
            r.createElement(
              "span",
              { style: { fontSize: 16 } },
              E.emoji || "⚡"
            ),
            r.createElement(
              A,
              { title: E.name },
              r.createElement(
                te,
                {
                  strong: !0,
                  style: {
                    fontSize: 13,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap"
                  }
                },
                E.name
              )
            )
          ),
          E.description ? r.createElement(
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
            E.description
          ) : null,
          E.tags && E.tags.length > 0 ? r.createElement(
            "div",
            {
              style: {
                marginTop: 4,
                display: "flex",
                gap: 2,
                flexWrap: "wrap"
              }
            },
            ...E.tags.slice(0, 2).map(
              (K, Q) => r.createElement(
                y,
                {
                  key: Q,
                  color: "cyan",
                  style: { fontSize: 10, marginRight: 0 }
                },
                K
              )
            )
          ) : null
        );
      })
    )
  );
}
const qe = {
  marginBottom: 4,
  fontSize: 13,
  fontWeight: 500,
  color: "rgba(0,0,0,0.85)",
  display: "flex",
  alignItems: "center",
  gap: 4
}, Jn = { marginBottom: 16 }, Kn = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "0 16px",
  marginBottom: 16
}, je = {
  fontSize: 13,
  fontWeight: 600,
  color: "rgba(0,0,0,0.85)",
  marginBottom: 12,
  paddingBottom: 8,
  borderBottom: "1px solid #f0f0f0"
}, Xn = {
  fontSize: 12,
  color: "rgba(0,0,0,0.45)",
  marginLeft: 8
};
function xl({ agentId: e }) {
  const t = z().React, { useState: l, useEffect: a, useCallback: n } = t, {
    Switch: s,
    InputNumber: r,
    Select: o,
    Button: d,
    Spin: c,
    Space: f,
    Typography: b,
    message: k
  } = z().antd, { PlayCircleOutlined: S, SaveOutlined: h } = z().antdIcons || {}, { Text: y } = b, [A, L] = l(!0), [U, N] = l(!1), [te, G] = l(!1), [H, x] = l(!1), [C, _] = l(6), [J, F] = l("h"), [I, E] = l("main"), [g, M] = l(300), [K, Q] = l(!1), [le, $] = l("08:00"), [p, u] = l("22:00"), O = n(async () => {
    var W, re;
    L(!0);
    try {
      const v = await gl(e), Z = ul(v.every ?? "6h");
      x(v.enabled ?? !1), _(Z.number), F(Z.unit), E(v.target ?? "main"), M(v.timeoutSeconds ?? 300), Q(!!v.activeHours), $(((W = v.activeHours) == null ? void 0 : W.start) ?? "08:00"), u(((re = v.activeHours) == null ? void 0 : re.end) ?? "22:00");
    } catch (v) {
      k.error(v.message || "加载心跳配置失败");
    } finally {
      L(!1);
    }
  }, [e]);
  a(() => {
    O();
  }, [O]);
  const ne = async () => {
    N(!0);
    try {
      await fl(e, {
        enabled: H,
        every: pl({ number: C, unit: J }),
        target: I,
        timeoutSeconds: g,
        activeHours: K && le && p ? { start: le, end: p } : void 0
      }), k.success("心跳配置已保存");
    } catch (W) {
      k.error(W.message || "保存心跳配置失败");
    } finally {
      N(!1);
    }
  }, R = async () => {
    G(!0);
    try {
      await yl(e), k.success("已触发心跳检查");
    } catch (W) {
      k.error(W.message || "触发心跳失败");
    } finally {
      G(!1);
    }
  };
  if (A)
    return t.createElement(
      "div",
      { style: { textAlign: "center", padding: 40 } },
      t.createElement(c, { size: "large" })
    );
  const V = (W, re, v) => t.createElement(
    "div",
    { style: Jn },
    t.createElement("div", { style: qe }, W),
    re,
    v ? t.createElement(
      y,
      { type: "secondary", style: Xn },
      v
    ) : null
  ), se = (W, re, v, Z) => t.createElement(
    "div",
    { style: Kn },
    t.createElement(
      "div",
      null,
      t.createElement("div", { style: qe }, W),
      re
    ),
    t.createElement(
      "div",
      null,
      t.createElement("div", { style: qe }, v),
      Z
    )
  ), { Divider: w } = z().antd;
  return t.createElement(
    "div",
    { style: { paddingBottom: 8 } },
    // ── Section: 基本设置 ──
    t.createElement("div", { style: je }, "基本设置"),
    V(
      "启用心跳",
      t.createElement(s, {
        checked: H,
        onChange: (W) => x(W)
      }),
      H ? "已启用，专家将定期自检" : "已停用"
    ),
    se(
      "检查频率",
      t.createElement(
        f,
        null,
        t.createElement(r, {
          min: 1,
          value: C,
          onChange: (W) => _(W ?? 1),
          style: { width: "100%" }
        }),
        t.createElement(o, {
          value: J,
          onChange: (W) => F(W),
          style: { width: 90 },
          options: [
            { value: "m", label: "分钟" },
            { value: "h", label: "小时" }
          ]
        })
      ),
      "心跳目标",
      t.createElement(o, {
        value: I,
        onChange: (W) => E(W),
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
      t.createElement(r, {
        min: 1,
        max: 3600,
        value: g,
        onChange: (W) => M(W ?? 300),
        style: { width: 200 }
      })
    ),
    // ── Section: 活跃时段 ──
    t.createElement(w, { style: { margin: "8px 0 16px" } }),
    t.createElement("div", { style: je }, "活跃时段"),
    V(
      "启用活跃时段限制",
      t.createElement(s, {
        checked: K,
        onChange: (W) => Q(W)
      }),
      "仅在指定时段内触发心跳"
    ),
    K ? se(
      "开始时间",
      t.createElement("input", {
        type: "time",
        value: le,
        onChange: (W) => $(W.target.value),
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
        onChange: (W) => u(W.target.value),
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
        d,
        {
          type: "primary",
          icon: h ? t.createElement(h) : void 0,
          loading: U,
          onClick: ne,
          style: Oe
        },
        "保存配置"
      ),
      t.createElement(
        d,
        {
          icon: S ? t.createElement(S) : void 0,
          loading: te,
          onClick: R
        },
        "立即执行"
      )
    )
  );
}
function kl({
  agentId: e,
  onRefresh: t
}) {
  const l = z().React, { useState: a, useEffect: n, useCallback: s } = l, {
    List: r,
    Tag: o,
    Switch: d,
    Button: c,
    Empty: f,
    Spin: b,
    Typography: k,
    message: S
  } = z().antd, { PlusOutlined: h, ReloadOutlined: y, DeleteOutlined: A } = z().antdIcons || {}, { Text: L, Paragraph: U } = k, [N, te] = a([]), [G, H] = a(!0), [x, C] = a(!1), [_, J] = a([]), [F, I] = a(!1), E = s(async () => {
    H(!0);
    try {
      const $ = await wt(e);
      te($);
    } catch ($) {
      S.error($.message || "加载技能失败"), te([]);
    } finally {
      H(!1);
    }
  }, [e]);
  n(() => {
    E();
  }, [E]);
  const g = async () => {
    C(!0), I(!0);
    try {
      const $ = await Dt(!0);
      J($);
    } catch ($) {
      S.error($.message || "加载技能池失败");
    } finally {
      I(!1);
    }
  }, M = async ($) => {
    let p = 0, u = 0;
    for (const O of $)
      try {
        await Gt(e, O), p++;
      } catch {
        u++;
      }
    p > 0 ? (S.success(
      `成功添加 ${p} 个技能${u > 0 ? `，${u} 个失败` : ""}`
    ), E(), t()) : u > 0 && S.error("添加技能失败"), C(!1);
  }, K = async ($, p) => {
    try {
      p ? await Dn(e, $.name) : await Hn(e, $.name), S.success(p ? "已启用" : "已停用"), E(), t();
    } catch (u) {
      S.error(u.message || "操作失败");
    }
  }, Q = async ($) => {
    try {
      await Ht(e, $), S.success(`技能「${$}」已移除`), E(), t();
    } catch (p) {
      S.error(p.message || "移除技能失败");
    }
  };
  if (G)
    return l.createElement(
      "div",
      { style: { textAlign: "center", padding: 40 } },
      l.createElement(b, { size: "large" })
    );
  const le = N.filter(($) => $.enabled !== !1);
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
        L,
        { strong: !0 },
        `技能列表 (${N.length}，已启用 ${le.length})`
      ),
      l.createElement(
        "div",
        { style: { display: "flex", gap: 8 } },
        l.createElement(
          c,
          {
            size: "small",
            icon: y ? l.createElement(y) : void 0,
            onClick: () => {
              Ze(), E();
            }
          },
          "刷新"
        ),
        l.createElement(
          c,
          {
            type: "primary",
            size: "small",
            icon: h ? l.createElement(h) : void 0,
            onClick: g,
            style: Oe
          },
          "从技能池添加"
        )
      )
    ),
    N.length === 0 ? l.createElement(f, {
      description: "该专家暂无技能",
      image: f.PRESENTED_IMAGE_SIMPLE
    }) : l.createElement(r, {
      dataSource: N,
      renderItem: ($) => l.createElement(
        r.Item,
        {
          actions: [
            l.createElement(d, {
              key: "toggle",
              size: "small",
              checked: $.enabled !== !1,
              onChange: (p) => K($, p)
            }),
            l.createElement(
              c,
              {
                key: "del",
                type: "link",
                size: "small",
                danger: !0,
                icon: A ? l.createElement(A) : void 0,
                onClick: () => Q($.name)
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
            $.emoji ? l.createElement(
              "span",
              { style: { fontSize: 16 } },
              $.emoji
            ) : null,
            l.createElement(L, { strong: !0 }, $.name),
            $.version_text ? l.createElement(
              o,
              { style: { fontSize: 10 } },
              `v${$.version_text}`
            ) : null
          ),
          $.description ? l.createElement(
            U,
            {
              type: "secondary",
              style: { fontSize: 12, margin: 0 },
              ellipsis: { rows: 2 }
            },
            $.description
          ) : null
        )
      )
    }),
    l.createElement(Wn, {
      open: x,
      onClose: () => C(!1),
      poolSkills: _,
      installedSkillNames: N.map(($) => $.name),
      loading: F,
      onInstall: M
    })
  );
}
function _l({
  agentId: e,
  onRefresh: t,
  isActive: l
}) {
  const a = z().React, { useState: n, useEffect: s, useCallback: r } = a, {
    List: o,
    Tag: d,
    Button: c,
    Empty: f,
    Spin: b,
    Modal: k,
    Input: S,
    Typography: h,
    message: y
  } = z().antd, { PlusOutlined: A, ReloadOutlined: L, DeleteOutlined: U } = z().antdIcons || {}, { Text: N, Paragraph: te } = h, { TextArea: G } = S, [H, x] = n([]), [C, _] = n(!0), [J, F] = n(!1), [I, E] = n(`{
  "mcpServers": {
    "example-client": {
      "command": "npx",
      "args": ["-y", "@example/mcp-server"],
      "env": {}
    }
  }
}`), [g, M] = n(!1), K = r(async () => {
    _(!0);
    try {
      const p = await Wt(e);
      x(p);
    } catch (p) {
      y.error(p.message || "加载 MCP 失败"), x([]);
    } finally {
      _(!1);
    }
  }, [e]);
  s(() => {
    K();
  }, [K]), s(() => {
    l && K();
  }, [l, K]);
  const Q = async (p) => {
    try {
      await ml(e, p), y.success("已切换 MCP 状态"), K(), t();
    } catch (u) {
      y.error(u.message || "切换失败");
    }
  }, le = async (p) => {
    try {
      await Fn(e, p), y.success(`MCP「${p}」已移除`), K(), t();
    } catch (u) {
      y.error(u.message || "移除 MCP 失败");
    }
  }, $ = async () => {
    M(!0);
    try {
      const p = JSON.parse(I), u = p.mcpServers || p, O = Object.entries(u);
      if (O.length === 0) {
        y.warning("未找到 MCP 客户端配置");
        return;
      }
      for (const [ne, R] of O) {
        const V = R, se = V.url ? "streamable_http" : "stdio";
        await Gn(e, {
          client_key: ne,
          client: {
            name: V.name || ne,
            description: V.description || "",
            enabled: !0,
            transport: se,
            url: V.url || "",
            command: V.command || "",
            args: V.args || [],
            env: V.env || {},
            cwd: V.cwd || "",
            headers: V.headers || {}
          }
        });
      }
      y.success("MCP 客户端已创建"), F(!1), K(), t();
    } catch (p) {
      p instanceof SyntaxError ? y.error("JSON 格式错误：" + p.message) : y.error(p.message || "创建 MCP 失败");
    } finally {
      M(!1);
    }
  };
  return C ? a.createElement(
    "div",
    { style: { textAlign: "center", padding: 40 } },
    a.createElement(b, { size: "large" })
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
      a.createElement(N, { strong: !0 }, `MCP 客户端 (${H.length})`),
      a.createElement(
        "div",
        { style: { display: "flex", gap: 8 } },
        a.createElement(
          c,
          {
            size: "small",
            icon: L ? a.createElement(L) : void 0,
            onClick: () => {
              Ze(), K();
            }
          },
          "刷新"
        ),
        a.createElement(
          c,
          {
            type: "primary",
            size: "small",
            icon: A ? a.createElement(A) : void 0,
            onClick: () => F(!0),
            style: Oe
          },
          "添加 MCP"
        )
      )
    ),
    H.length === 0 ? a.createElement(f, {
      description: "该专家暂无 MCP 客户端",
      image: f.PRESENTED_IMAGE_SIMPLE
    }) : a.createElement(o, {
      dataSource: H,
      renderItem: (p) => a.createElement(
        o.Item,
        {
          actions: [
            a.createElement(
              c,
              {
                key: "toggle",
                size: "small",
                onClick: () => Q(p.key)
              },
              p.enabled ? "停用" : "启用"
            ),
            a.createElement(
              c,
              {
                key: "del",
                type: "link",
                size: "small",
                danger: !0,
                icon: U ? a.createElement(U) : void 0,
                onClick: () => le(p.key)
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
            a.createElement("span", { style: { fontSize: 14 } }, "🔌"),
            a.createElement(N, { strong: !0 }, p.name || p.key),
            a.createElement(
              d,
              {
                color: p.enabled ? "green" : "default",
                style: { fontSize: 10 }
              },
              p.enabled ? "启用" : "停用"
            ),
            a.createElement(
              d,
              { color: "purple", style: { fontSize: 10 } },
              p.transport
            )
          ),
          p.description ? a.createElement(
            te,
            {
              type: "secondary",
              style: { fontSize: 12, margin: 0 },
              ellipsis: { rows: 2 }
            },
            p.description
          ) : null,
          p.tools && p.tools.length > 0 ? a.createElement(
            "div",
            { style: { marginTop: 4, fontSize: 11, color: "#8c8c8c" } },
            `提供 ${p.tools.length} 个工具`
          ) : null
        )
      )
    }),
    // Create MCP modal
    a.createElement(
      k,
      {
        open: J,
        title: "添加 MCP 客户端 (JSON)",
        onCancel: () => F(!1),
        onOk: $,
        confirmLoading: g,
        okText: "创建",
        width: 560
      },
      a.createElement(
        "div",
        { style: { marginBottom: 8, fontSize: 12, color: "#8c8c8c" } },
        "粘贴 MCP 配置 JSON（支持 mcpServers 格式），将创建到当前专家工作区："
      ),
      a.createElement(G, {
        value: I,
        onChange: (p) => E(p.target.value),
        rows: 12,
        style: { fontFamily: "monospace", fontSize: 12 }
      })
    )
  );
}
function Tl({ agentId: e }) {
  const t = z().React, { useState: l, useEffect: a, useCallback: n, useRef: s } = t, {
    Card: r,
    InputNumber: o,
    Input: d,
    Select: c,
    Switch: f,
    Button: b,
    Spin: k,
    Space: S,
    Typography: h,
    Divider: y,
    message: A
  } = z().antd, { SaveOutlined: L } = z().antdIcons || {}, { Text: U } = h, [N, te] = l(!0), [G, H] = l(!1), x = s(null), [C, _] = l(60), [J, F] = l(""), [I, E] = l(!0), [g, M] = l(30), [K, Q] = l("zh"), [le, $] = l("UTC"), [p, u] = l(!0), [O, ne] = l(100), [R, V] = l(!0), [se, w] = l(3), [W, re] = l(1), [v, Z] = l(!0), [m, Y] = l(3), [B, oe] = l(2), [de, Ee] = l(60), [ye, pe] = l(1), [ae, D] = l(0), [T, X] = l(1), [ie, q] = l(0), [ue, ve] = l(30), [we, xe] = l(50), [_e, Ne] = l("light"), [it, ct] = l("scroll"), [et, Pe] = l("remelight"), [tt, mt] = l("AUTO"), Ge = n(async () => {
    var ee, Ce, Se, ze, He, nt;
    te(!0);
    try {
      const [he, kt, dt] = await Promise.all([
        El(e),
        vl(e).catch(() => "zh"),
        Sl().catch(() => "UTC")
      ]);
      x.current = he, _(he.shell_command_timeout ?? 60), F(he.shell_command_executable ?? "");
      const at = he.auto_title_config ?? { enabled: !0, timeout_seconds: 30 };
      E(at.enabled ?? !0), M(at.timeout_seconds ?? 30), Q(kt), $(dt);
      const Ae = he.loop ?? {};
      u(((ee = Ae.iteration) == null ? void 0 : ee.enabled) ?? !0), ne(((Ce = Ae.iteration) == null ? void 0 : Ce.max_iterations) ?? he.max_iters ?? 100), V(((Se = Ae.doom_loop) == null ? void 0 : Se.enabled) ?? !0), w(((ze = Ae.doom_loop) == null ? void 0 : ze.window_size) ?? 3), re(((He = Ae.doom_loop) == null ? void 0 : He.similarity_threshold) ?? 1), Z(he.llm_retry_enabled ?? !0), Y(he.llm_max_retries ?? 3), oe(he.llm_backoff_base ?? 2), Ee(he.llm_backoff_cap ?? 60), pe(he.llm_max_concurrent ?? 1), D(he.llm_max_qpm ?? 0), X(he.llm_rate_limit_pause ?? 1), q(he.llm_rate_limit_jitter ?? 0), ve(he.llm_acquire_timeout ?? 30), xe(he.history_max_length ?? 50), Ne(he.context_manager_backend ?? "light"), ct(((nt = he.light_context_config) == null ? void 0 : nt.strategy) ?? "scroll"), Pe(he.memory_manager_backend ?? "remelight"), mt(he.approval_level ?? "AUTO");
    } catch (he) {
      A.error(he.message || "加载运行配置失败");
    } finally {
      te(!1);
    }
  }, [e]);
  a(() => {
    Ge();
  }, [Ge]);
  const Te = async () => {
    var Ce, Se;
    const ee = x.current;
    if (ee) {
      H(!0);
      try {
        const ze = {
          ...ee,
          max_iters: O,
          loop: {
            ...ee.loop ?? {},
            iteration: { enabled: p, max_iterations: O },
            doom_loop: {
              enabled: R,
              window_size: se,
              similarity_threshold: W,
              stages: ((Se = (Ce = ee.loop) == null ? void 0 : Ce.doom_loop) == null ? void 0 : Se.stages) ?? []
            }
          },
          shell_command_timeout: C,
          shell_command_executable: J,
          auto_title_config: {
            enabled: I,
            timeout_seconds: g
          },
          llm_retry_enabled: v,
          llm_max_retries: m,
          llm_backoff_base: B,
          llm_backoff_cap: de,
          llm_max_concurrent: ye,
          llm_max_qpm: ae,
          llm_rate_limit_pause: T,
          llm_rate_limit_jitter: ie,
          llm_acquire_timeout: ue,
          history_max_length: we,
          context_manager_backend: _e,
          light_context_config: {
            ...ee.light_context_config ?? {},
            strategy: it
          },
          memory_manager_backend: et,
          approval_level: tt
        };
        await hl(e, ze), x.current = ze, K && await bl(e, K).catch(() => {
        }), le && await wl(le).catch(() => {
        }), A.success("运行配置已保存");
      } catch (ze) {
        A.error(ze.message || "保存运行配置失败");
      } finally {
        H(!1);
      }
    }
  };
  if (N)
    return t.createElement(
      "div",
      { style: { textAlign: "center", padding: 40 } },
      t.createElement(k, { size: "large" })
    );
  const Ie = (ee, Ce, Se) => t.createElement(
    "div",
    { style: Jn },
    t.createElement("div", { style: qe }, ee),
    Ce,
    Se ? t.createElement(
      U,
      { type: "secondary", style: Xn },
      Se
    ) : null
  ), ke = (ee, Ce, Se, ze) => t.createElement(
    "div",
    { style: Kn },
    t.createElement(
      "div",
      null,
      t.createElement("div", { style: qe }, ee),
      Ce
    ),
    t.createElement(
      "div",
      null,
      t.createElement("div", { style: qe }, Se),
      ze
    )
  );
  return t.createElement(
    "div",
    { style: { paddingBottom: 8 } },
    // ── Section: 基础设置 ──
    t.createElement(
      "div",
      { style: je },
      "基础设置"
    ),
    ke(
      "Shell 命令超时 (秒)",
      t.createElement(o, {
        min: 1,
        value: C,
        onChange: (ee) => _(ee ?? 60),
        style: { width: "100%" }
      }),
      "Shell 可执行文件",
      t.createElement(d, {
        value: J,
        onChange: (ee) => F(ee.target.value),
        placeholder: "留空使用系统默认",
        style: { width: "100%" }
      })
    ),
    ke(
      "语言",
      t.createElement(c, {
        value: K,
        onChange: (ee) => Q(ee),
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
        value: le,
        onChange: (ee) => $(ee),
        style: { width: "100%" },
        showSearch: !0,
        filterOption: (ee, Ce) => {
          var Se;
          return (((Se = Ce == null ? void 0 : Ce.label) == null ? void 0 : Se.toString()) || "").toLowerCase().includes(ee.toLowerCase());
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
        ].map((ee) => ({ value: ee, label: ee }))
      })
    ),
    ke(
      "自动生成会话标题",
      t.createElement(S, null, t.createElement(f, {
        checked: I,
        onChange: (ee) => E(ee)
      })),
      "标题生成超时 (秒)",
      t.createElement(o, {
        min: 5,
        value: g,
        onChange: (ee) => M(ee ?? 30),
        style: { width: "100%" },
        disabled: !I
      })
    ),
    // ── Section: 审批级别 ──
    t.createElement(y, { style: { margin: "8px 0 16px" } }),
    t.createElement("div", { style: je }, "审批级别"),
    Ie(
      "工具执行审批",
      t.createElement(c, {
        value: tt,
        onChange: (ee) => mt(ee),
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
    t.createElement(y, { style: { margin: "8px 0 16px" } }),
    t.createElement("div", { style: je }, "迭代与循环"),
    Ie(
      "启用迭代限制",
      t.createElement(f, {
        checked: p,
        onChange: (ee) => u(ee)
      }),
      "停止 Agent 前的最大循环轮次"
    ),
    p ? Ie(
      "最大迭代次数",
      t.createElement(o, {
        min: 1,
        max: 500,
        value: O,
        onChange: (ee) => ne(ee ?? 100),
        style: { width: "100%" }
      })
    ) : null,
    Ie(
      "启用重复循环保护",
      t.createElement(f, {
        checked: R,
        onChange: (ee) => V(ee)
      }),
      "检测并阻止重复操作循环"
    ),
    R ? ke(
      "检测窗口大小",
      t.createElement(o, {
        min: 2,
        max: 20,
        value: se,
        onChange: (ee) => w(ee ?? 3),
        style: { width: "100%" }
      }),
      "相似度阈值",
      t.createElement(o, {
        min: 0,
        max: 1,
        step: 0.05,
        value: W,
        onChange: (ee) => re(ee ?? 1),
        style: { width: "100%" }
      })
    ) : null,
    // ── Section: LLM 重试 ──
    t.createElement(y, { style: { margin: "8px 0 16px" } }),
    t.createElement("div", { style: je }, "LLM 重试"),
    Ie(
      "启用 LLM 重试",
      t.createElement(f, {
        checked: v,
        onChange: (ee) => Z(ee)
      })
    ),
    ke(
      "最大重试次数",
      t.createElement(o, {
        min: 1,
        value: m,
        onChange: (ee) => Y(ee ?? 3),
        style: { width: "100%" },
        disabled: !v
      }),
      "退避基数 (秒)",
      t.createElement(o, {
        min: 0.1,
        step: 0.1,
        value: B,
        onChange: (ee) => oe(ee ?? 2),
        style: { width: "100%" },
        disabled: !v
      })
    ),
    Ie(
      "退避上限 (秒)",
      t.createElement(o, {
        min: 0.5,
        step: 0.5,
        value: de,
        onChange: (ee) => Ee(ee ?? 60),
        style: { width: 200 },
        disabled: !v
      })
    ),
    // ── Section: LLM 限流 ──
    t.createElement(y, { style: { margin: "8px 0 16px" } }),
    t.createElement("div", { style: je }, "LLM 限流"),
    ke(
      "最大并发数",
      t.createElement(o, {
        min: 1,
        value: ye,
        onChange: (ee) => pe(ee ?? 1),
        style: { width: "100%" }
      }),
      "最大 QPM (0=不限)",
      t.createElement(o, {
        min: 0,
        step: 10,
        value: ae,
        onChange: (ee) => D(ee ?? 0),
        style: { width: "100%" }
      })
    ),
    ke(
      "限流暂停时间 (秒)",
      t.createElement(o, {
        min: 1,
        step: 0.5,
        value: T,
        onChange: (ee) => X(ee ?? 1),
        style: { width: "100%" }
      }),
      "限流抖动 (秒)",
      t.createElement(o, {
        min: 0,
        step: 0.5,
        value: ie,
        onChange: (ee) => q(ee ?? 0),
        style: { width: "100%" }
      })
    ),
    Ie(
      "获取超时 (秒)",
      t.createElement(o, {
        min: 10,
        step: 10,
        value: ue,
        onChange: (ee) => ve(ee ?? 30),
        style: { width: 200 }
      }),
      "应大于 限流暂停 + 抖动"
    ),
    // ── Section: 上下文与记忆 ──
    t.createElement(y, { style: { margin: "8px 0 16px" } }),
    t.createElement("div", { style: je }, "上下文与记忆"),
    ke(
      "上下文管理后端",
      t.createElement(c, {
        value: _e,
        onChange: (ee) => Ne(ee),
        style: { width: "100%" },
        options: [{ value: "light", label: "light" }]
      }),
      "上下文策略",
      t.createElement(c, {
        value: it,
        onChange: (ee) => ct(ee),
        style: { width: "100%" },
        options: [
          { value: "scroll", label: "scroll (滚动窗口)" },
          { value: "native", label: "native (原生)" }
        ]
      })
    ),
    ke(
      "记忆管理后端",
      t.createElement(c, {
        value: et,
        onChange: (ee) => Pe(ee),
        style: { width: "100%" },
        options: [
          { value: "remelight", label: "remelight" },
          { value: "adbpg", label: "adbpg" },
          { value: "none", label: "none (禁用)" }
        ]
      }),
      "历史消息最大长度",
      t.createElement(o, {
        min: 1,
        value: we,
        onChange: (ee) => xe(ee ?? 50),
        style: { width: "100%" }
      })
    ),
    // ── Save button ──
    t.createElement(
      "div",
      { style: { display: "flex", justifyContent: "flex-end", marginTop: 16 } },
      t.createElement(
        b,
        {
          type: "primary",
          icon: L ? t.createElement(L) : void 0,
          loading: G,
          onClick: Te,
          style: Oe
        },
        "保存运行配置"
      )
    )
  );
}
function zl({
  expert: e,
  open: t,
  onClose: l,
  onRefresh: a
}) {
  const n = z().React, { useState: s, useEffect: r, useCallback: o } = n, { Modal: d, Tabs: c, Spin: f, Typography: b } = z().antd, { SettingOutlined: k } = z().antdIcons || {}, { Text: S } = b, [h, y] = s([]), [A, L] = s(!1), [U, N] = s("heartbeat"), te = o(async () => {
    if (e) {
      L(!0);
      try {
        const C = await Cl(e.agent.id);
        y(C);
      } catch {
        y([]);
      } finally {
        L(!1);
      }
    }
  }, [e]);
  if (r(() => {
    t && e && te();
  }, [t, e, te]), !e) return null;
  const { agent: G } = e, H = () => {
    te(), a();
  }, x = [
    {
      key: "heartbeat",
      label: "心跳",
      children: n.createElement(xl, {
        agentId: G.id
      })
    },
    {
      key: "files",
      label: "文件",
      children: A ? n.createElement(
        "div",
        { style: { textAlign: "center", padding: 40 } },
        n.createElement(f, { size: "large" })
      ) : n.createElement(qn, {
        agentId: G.id,
        systemPromptFiles: h,
        onRefresh: H
      })
    },
    {
      key: "skills",
      label: `技能 (${e.skills.filter((C) => C.enabled !== !1).length})`,
      children: n.createElement(kl, {
        agentId: G.id,
        onRefresh: a
      })
    },
    {
      key: "mcp",
      label: `MCP (${e.mcps.length})`,
      children: n.createElement(_l, {
        agentId: G.id,
        onRefresh: a,
        isActive: U === "mcp"
      })
    },
    {
      key: "running",
      label: "运行配置",
      children: n.createElement(Tl, {
        agentId: G.id
      })
    }
  ];
  return n.createElement(
    d,
    {
      open: t,
      title: n.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 8 } },
        k ? n.createElement(k, { style: { fontSize: 18 } }) : null,
        n.createElement("span", null, `配置 - ${G.name}`),
        n.createElement(
          S,
          { type: "secondary", style: { fontSize: 12, fontWeight: 400 } },
          G.id
        )
      ),
      onCancel: l,
      footer: null,
      width: 800,
      centered: !0,
      styles: {
        body: {
          height: "min(520px, calc(100vh - 280px))",
          overflowY: "auto",
          overflowX: "hidden"
        }
      }
    },
    n.createElement(c, {
      items: x,
      activeKey: U,
      onChange: (C) => N(C),
      size: "small",
      tabBarStyle: { marginBottom: 16 }
    })
  );
}
function Il({
  expert: e,
  onClick: t,
  onSummon: l,
  onConfigure: a
}) {
  const n = z().React, { Card: s, Tag: r, Badge: o, Typography: d, Spin: c, Button: f, Tooltip: b } = z().antd, { Text: k } = d, { ThunderboltOutlined: S, SettingOutlined: h } = z().antdIcons || {}, { agent: y, skills: A, mcps: L, loading: U } = e, N = y.enabled, te = A.filter((x) => x.enabled !== !1).map((x) => x.name), G = L.map((x) => x.name || x.key), H = y.active_model ? `${y.active_model.provider_id}/${y.active_model.model}` : null;
  return n.createElement(
    s,
    {
      hoverable: !0,
      onClick: t,
      size: "small",
      style: {
        cursor: "pointer",
        transition: "all 0.2s ease",
        borderColor: N ? void 0 : "#d9d9d9",
        opacity: N ? 1 : 0.7,
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column"
      },
      styles: {
        body: {
          display: "flex",
          flexDirection: "column",
          height: "100%",
          flex: 1
        }
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
        n.createElement(Re, { name: y.name, size: 36 }),
        n.createElement(
          "div",
          null,
          n.createElement(
            k,
            { strong: !0, style: { fontSize: 15 } },
            y.name
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
            y.id
          )
        )
      ),
      n.createElement(o, {
        status: N ? "success" : "default",
        text: N ? "启用" : "停用"
      })
    ),
    // Description (rendered as markdown)
    y.description ? n.createElement(
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
      Ft(y.description, n)
    ) : n.createElement(
      "div",
      { style: { fontSize: 12, color: "#bfbfbf", marginBottom: 10, minHeight: 54, flex: "1 0 auto" } },
      "暂无描述"
    ),
    // Model info
    H ? n.createElement(
      "div",
      { style: { marginBottom: 8 } },
      n.createElement(
        r,
        { color: "geekblue", style: { fontSize: 11 } },
        `🤖 ${H}`
      )
    ) : null,
    // Skills
    U ? n.createElement(c, { size: "small" }) : n.createElement(
      "div",
      { style: { marginBottom: 6 } },
      n.createElement(
        "div",
        { style: { fontSize: 11, color: "#8c8c8c", marginBottom: 4 } },
        `技能 (${te.length})`
      ),
      n.createElement(Tn, {
        items: te,
        max: 4,
        color: "cyan",
        emptyText: "未配置技能"
      })
    ),
    // MCP
    !U && G.length > 0 ? n.createElement(
      "div",
      { style: { marginTop: "auto" } },
      n.createElement(
        "div",
        { style: { fontSize: 11, color: "#8c8c8c", marginBottom: 4 } },
        `MCP (${G.length})`
      ),
      n.createElement(Tn, {
        items: G,
        max: 3,
        color: "purple"
      })
    ) : null,
    // Bottom bar: gear icon (left) + summon button (right)
    n.createElement(
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
      n.createElement(
        b,
        { title: "配置专家", placement: "top" },
        n.createElement(
          f,
          {
            type: "text",
            size: "small",
            icon: h ? n.createElement(h, {
              style: { fontSize: 16, color: "#8c8c8c" }
            }) : void 0,
            onClick: (x) => {
              x.stopPropagation(), a && a();
            }
          }
        )
      ),
      // Summon button (bottom-right)
      n.createElement(
        f,
        {
          type: "primary",
          size: "small",
          icon: S ? n.createElement(S) : void 0,
          disabled: !N,
          onClick: (x) => {
            x.stopPropagation(), l && l();
          },
          style: Oe
        },
        "召唤专家"
      )
    )
  );
}
function Ol({
  expert: e,
  open: t,
  onClose: l,
  onRefresh: a
}) {
  const n = z().React, {
    Drawer: s,
    Descriptions: r,
    Tag: o,
    Typography: d,
    Space: c,
    Button: f,
    Empty: b,
    Tabs: k,
    List: S,
    Spin: h,
    Modal: y,
    message: A
  } = z().antd, { Text: L, Paragraph: U } = d, {
    EditOutlined: N,
    ThunderboltOutlined: te,
    FileTextOutlined: G,
    ToolOutlined: H,
    PlusOutlined: x
  } = z().antdIcons || {}, [C, _] = n.useState(!1), [J, F] = n.useState(
    []
  ), [I, E] = n.useState(!1);
  if (!e) return null;
  const { agent: g, config: M, skills: K, mcps: Q, loading: le } = e, $ = K.filter((v) => v.enabled !== !1), p = (v) => {
    window.history.pushState({}, "", v), window.dispatchEvent(new PopStateEvent("popstate"));
  }, u = n.createElement(
    "div",
    null,
    n.createElement(
      r,
      { column: 1, bordered: !0, size: "small" },
      n.createElement(r.Item, { label: "专家名称" }, g.name),
      n.createElement(
        r.Item,
        { label: "专家 ID" },
        n.createElement("code", { style: { fontSize: 12 } }, g.id)
      ),
      n.createElement(
        r.Item,
        { label: "状态" },
        n.createElement(
          o,
          { color: g.enabled ? "green" : "default" },
          g.enabled ? "启用" : "停用"
        )
      ),
      n.createElement(
        r.Item,
        { label: "功能简介" },
        g.description ? Ft(g.description, n) : "暂无描述"
      ),
      n.createElement(
        r.Item,
        { label: "使用模型" },
        g.active_model ? `${g.active_model.provider_id} / ${g.active_model.model}` : "使用全局默认模型"
      ),
      M != null && M.workspace_dir ? n.createElement(
        r.Item,
        { label: "工作区路径" },
        n.createElement(
          "code",
          { style: { fontSize: 11 } },
          M.workspace_dir
        )
      ) : null,
      M != null && M.approval_level ? n.createElement(
        r.Item,
        { label: "审批级别" },
        M.approval_level
      ) : null
    ),
    // System prompt files
    M != null && M.system_prompt_files && M.system_prompt_files.length > 0 ? n.createElement(
      "div",
      { style: { marginTop: 16 } },
      n.createElement(
        "div",
        {
          style: {
            display: "flex",
            alignItems: "center",
            gap: 6,
            marginBottom: 8
          }
        },
        G ? n.createElement(G, {
          style: { fontSize: 14, color: "#1677ff" }
        }) : null,
        n.createElement(L, { strong: !0 }, "系统提示词文件")
      ),
      n.createElement(
        c,
        { wrap: !0 },
        ...M.system_prompt_files.map(
          (v, Z) => n.createElement(
            o,
            {
              key: Z,
              icon: G ? n.createElement(G) : void 0,
              style: { fontSize: 12 }
            },
            v
          )
        )
      )
    ) : null
  ), O = async () => {
    _(!0), E(!0);
    try {
      const v = await Dt(!0);
      F(v);
    } catch (v) {
      A.error(v.message || "加载技能池失败");
    } finally {
      E(!1);
    }
  }, ne = async (v) => {
    let Z = 0, m = 0;
    for (const Y of v)
      try {
        await Gt(g.id, Y), Z++;
      } catch {
        m++;
      }
    Z > 0 ? (A.success(
      `成功添加 ${Z} 个技能${m > 0 ? `，${m} 个失败` : ""}`
    ), a()) : m > 0 && A.error("添加技能失败"), _(!1);
  }, R = async (v) => {
    try {
      await Ht(g.id, v), A.success(`技能「${v}」已移除`), a();
    } catch (Z) {
      A.error(Z.message || "移除技能失败");
    }
  }, V = async (v) => {
    try {
      await Fn(g.id, v), A.success(`MCP「${v}」已移除`), a();
    } catch (Z) {
      A.error(Z.message || "移除 MCP 失败");
    }
  }, se = le ? n.createElement(
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
        L,
        { strong: !0 },
        `已启用技能 (${$.length})`
      ),
      n.createElement(
        f,
        {
          type: "primary",
          size: "small",
          icon: x ? n.createElement(x) : void 0,
          onClick: O
        },
        "从技能池添加"
      )
    ),
    $.length === 0 ? n.createElement(b, {
      description: "该专家暂无已启用的技能",
      image: b.PRESENTED_IMAGE_SIMPLE
    }) : n.createElement(S, {
      dataSource: $,
      renderItem: (v) => n.createElement(
        S.Item,
        {
          actions: [
            n.createElement(
              f,
              {
                type: "link",
                size: "small",
                danger: !0,
                onClick: () => R(v.name)
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
            v.emoji ? n.createElement(
              "span",
              { style: { fontSize: 16 } },
              v.emoji
            ) : null,
            n.createElement(L, { strong: !0 }, v.name),
            v.version_text ? n.createElement(
              o,
              { style: { fontSize: 10 } },
              `v${v.version_text}`
            ) : null
          ),
          v.description ? n.createElement(
            U,
            {
              type: "secondary",
              style: { fontSize: 12, margin: 0 },
              ellipsis: { rows: 2 }
            },
            v.description
          ) : null,
          v.tags && v.tags.length > 0 ? n.createElement(
            "div",
            { style: { marginTop: 4 } },
            ...v.tags.map(
              (Z, m) => n.createElement(
                o,
                {
                  key: m,
                  color: "cyan",
                  style: { fontSize: 10 }
                },
                Z
              )
            )
          ) : null
        )
      )
    }),
    // Skill Picker Modal (card-grid style, consistent with Skill Center)
    n.createElement(Wn, {
      open: C,
      onClose: () => _(!1),
      poolSkills: J,
      installedSkillNames: $.map((v) => v.name),
      loading: I,
      onInstall: ne
    })
  ), w = le ? n.createElement(
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
        L,
        { strong: !0 },
        `MCP 客户端 (${Q.length})`
      ),
      n.createElement(
        f,
        {
          type: "primary",
          size: "small",
          icon: x ? n.createElement(x) : void 0,
          onClick: () => {
            window.history.pushState({}, "", `/agents/${g.id}/mcp`), window.dispatchEvent(new PopStateEvent("popstate"));
          }
        },
        "配置 MCP"
      )
    ),
    Q.length === 0 ? n.createElement(b, {
      description: "该专家暂无关联的 MCP 客户端，点击「配置 MCP」添加",
      image: b.PRESENTED_IMAGE_SIMPLE
    }) : n.createElement(S, {
      dataSource: Q,
      renderItem: (v) => n.createElement(
        S.Item,
        {
          actions: [
            n.createElement(
              f,
              {
                type: "link",
                size: "small",
                danger: !0,
                onClick: () => V(v.key)
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
            n.createElement(
              "span",
              { style: { fontSize: 14 } },
              "🔌"
            ),
            n.createElement(
              L,
              { strong: !0 },
              v.name || v.key
            ),
            n.createElement(
              o,
              {
                color: v.enabled ? "green" : "default",
                style: { fontSize: 10 }
              },
              v.enabled ? "启用" : "停用"
            ),
            n.createElement(
              o,
              { color: "purple", style: { fontSize: 10 } },
              v.transport
            )
          ),
          v.description ? n.createElement(
            U,
            {
              type: "secondary",
              style: { fontSize: 12, margin: 0 },
              ellipsis: { rows: 2 }
            },
            v.description
          ) : null,
          v.tools && v.tools.length > 0 ? n.createElement(
            "div",
            {
              style: {
                marginTop: 4,
                fontSize: 11,
                color: "#8c8c8c"
              }
            },
            `提供 ${v.tools.length} 个工具`
          ) : null
        )
      )
    })
  ), W = M != null && M.tools ? n.createElement(
    "div",
    { style: { padding: 16 } },
    n.createElement(
      "div",
      { style: { marginBottom: 12 } },
      n.createElement(
        "div",
        {
          style: {
            display: "flex",
            alignItems: "center",
            gap: 6,
            marginBottom: 8
          }
        },
        H ? n.createElement(H, {
          style: { fontSize: 14, color: "#1677ff" }
        }) : null,
        n.createElement(L, { strong: !0 }, "工具配置")
      ),
      n.createElement(
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
        JSON.stringify(M.tools, null, 2)
      )
    )
  ) : n.createElement(b, {
    description: "暂无工具配置",
    image: b.PRESENTED_IMAGE_SIMPLE
  }), re = [
    { key: "basic", label: "基本信息", children: u },
    {
      key: "skills",
      label: `技能 (${$.length})`,
      children: se
    },
    {
      key: "prompts",
      label: "推荐提问",
      children: n.createElement(Ml, {
        skills: $,
        agentId: g.id
      })
    },
    {
      key: "knowledge",
      label: "专家记忆",
      children: n.createElement(qn, {
        agentId: g.id,
        systemPromptFiles: (M == null ? void 0 : M.system_prompt_files) || [],
        onRefresh: () => a()
      })
    },
    { key: "mcp", label: `MCP (${Q.length})`, children: w },
    { key: "tools", label: "工具配置", children: W }
  ];
  return n.createElement(
    s,
    {
      title: n.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 8 } },
        n.createElement(Re, { name: g.name, size: 28 }),
        n.createElement("span", null, g.name)
      ),
      open: t,
      onClose: l,
      width: 560,
      extra: n.createElement(
        c,
        null,
        n.createElement(
          f,
          {
            size: "small",
            icon: N ? n.createElement(N) : void 0,
            onClick: () => {
              l();
              try {
                const v = z();
                v.setSelectedAgent && v.setSelectedAgent(g.id);
              } catch (v) {
                console.warn("[ugsci] Failed to set selected agent:", v);
              }
              setTimeout(() => p("/agents"), 0);
            }
          },
          "编辑专家"
        ),
        n.createElement(
          f,
          {
            type: "primary",
            size: "small",
            icon: te ? n.createElement(te) : void 0,
            onClick: () => {
              l();
              try {
                const v = z();
                v.setSelectedAgent && v.setSelectedAgent(g.id);
              } catch (v) {
                console.warn("[ugsci] Failed to set selected agent:", v);
              }
              setTimeout(() => p("/chat"), 0);
            }
          },
          "开始对话"
        )
      )
    },
    n.createElement(k, {
      items: re,
      defaultActiveKey: "basic"
    })
  );
}
function Al({
  open: e,
  onClose: t,
  onCreated: l
}) {
  const a = z().React, { useState: n } = a, {
    Modal: s,
    Card: r,
    Tag: o,
    Input: d,
    Row: c,
    Col: f,
    Spin: b,
    message: k,
    Typography: S
  } = z().antd, { Text: h } = S, { FileAddOutlined: y } = z().antdIcons || {}, [A, L] = n(!1), [U, N] = n(""), [te, G] = n(!1), H = async (_, J) => {
    L(!0);
    try {
      const F = await ce("/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: _ || "新专家",
          description: J || "",
          skill_names: []
        })
      });
      await bt(
        F.id,
        "AGENTS.md",
        `# ${_ || "新专家"}

请在此处编写该专家的系统提示词。
`
      ), k.success("专家「" + (_ || "新专家") + "」创建成功"), G(!1), setTimeout(() => {
        t(), l();
      }, 0);
    } catch (F) {
      k.error(F.message || "创建专家失败");
    } finally {
      L(!1);
    }
  }, x = al.filter((_) => {
    if (!U.trim()) return !0;
    const J = U.toLowerCase();
    return _.name.toLowerCase().includes(J) || _.description.toLowerCase().includes(J) || _.category.toLowerCase().includes(J);
  }), C = async (_) => {
    L(!0);
    try {
      const J = await ce("/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: _.name,
          description: _.description,
          skill_names: _.recommended_skills
        })
      });
      await bt(J.id, "AGENTS.md", _.system_prompt);
      const F = await Nt(J.id);
      F.approval_level = _.approval_level, await ce(`/agents/${encodeURIComponent(J.id)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(F)
      }), k.success(`专家「${_.name}」创建成功`), t(), l();
    } catch (J) {
      k.error(J.message || "创建专家失败");
    } finally {
      L(!1);
    }
  };
  return a.createElement(
    a.Fragment,
    null,
    a.createElement(
      s,
      {
        open: e,
        onCancel: t,
        footer: null,
        title: "选择专家模板",
        width: 800,
        maskClosable: !0,
        keyboard: !0
      },
      a.createElement(
        "div",
        { style: { marginBottom: 16 } },
        a.createElement(d, {
          placeholder: "搜索模板名称或类别...",
          value: U,
          onChange: (_) => N(_.target.value),
          allowClear: !0
        })
      ),
      A ? a.createElement(
        "div",
        { style: { textAlign: "center", padding: 60 } },
        a.createElement(b, { size: "large" }),
        a.createElement(
          "div",
          { style: { marginTop: 12, color: "#8c8c8c" } },
          "正在创建专家..."
        )
      ) : a.createElement(
        c,
        { gutter: [12, 12] },
        // ── Blank template card (always first) ──
        U.trim() ? null : a.createElement(
          f,
          { xs: 24, sm: 12 },
          a.createElement(
            r,
            {
              hoverable: !0,
              size: "small",
              onClick: () => G(!0),
              style: {
                cursor: "pointer",
                height: "100%",
                border: "2px dashed #d9d9d9",
                background: "#fafafa"
              }
            },
            a.createElement(
              "div",
              {
                style: {
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 10,
                  marginBottom: 8
                }
              },
              a.createElement(
                "span",
                { style: { fontSize: 28, color: "#8c8c8c" } },
                y ? a.createElement(y) : "📝"
              ),
              a.createElement(
                "div",
                { style: { flex: 1 } },
                a.createElement(
                  h,
                  { strong: !0, style: { fontSize: 15 } },
                  "从空白模版开始创建"
                ),
                a.createElement(
                  "div",
                  null,
                  a.createElement(
                    o,
                    { color: "default", style: { fontSize: 10 } },
                    "空白"
                  )
                )
              )
            ),
            a.createElement(
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
        ...x.map(
          (_) => a.createElement(
            f,
            { key: _.id, xs: 24, sm: 12 },
            a.createElement(
              r,
              {
                hoverable: !0,
                size: "small",
                onClick: () => C(_),
                style: { cursor: "pointer", height: "100%" }
              },
              a.createElement(
                "div",
                {
                  style: {
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 10,
                    marginBottom: 8
                  }
                },
                a.createElement(Re, {
                  name: _.name,
                  size: 40
                }),
                a.createElement(
                  "div",
                  { style: { flex: 1 } },
                  a.createElement(
                    h,
                    { strong: !0, style: { fontSize: 15 } },
                    _.name
                  ),
                  a.createElement(
                    "div",
                    null,
                    a.createElement(
                      o,
                      { color: "blue", style: { fontSize: 10 } },
                      _.category
                    ),
                    _.approval_level === "MANUAL" ? a.createElement(
                      o,
                      { color: "orange", style: { fontSize: 10 } },
                      "需审批"
                    ) : null
                  )
                )
              ),
              a.createElement(
                "div",
                {
                  style: {
                    fontSize: 12,
                    color: "#595959",
                    lineHeight: 1.5
                  }
                },
                Ft(_.description, a)
              )
            )
          )
        )
      )
    ),
    // ── Blank template creation modal (sibling, not nested inside Modal) ──
    a.createElement(Pl, {
      open: te,
      onCancel: () => G(!1),
      onCreate: H
    })
  );
}
function Pl({
  open: e,
  onCancel: t,
  onCreate: l
}) {
  const a = z().React, { useState: n, useEffect: s } = a, { Modal: r, Input: o, message: d } = z().antd, [c, f] = n(""), [b, k] = n(""), [S, h] = n(!1);
  return s(() => {
    e && (f(""), k(""), h(!1));
  }, [e]), a.createElement(
    r,
    {
      open: e,
      title: "从空白模版创建专家",
      onCancel: t,
      onOk: () => {
        if (!c.trim()) {
          d.warning("请输入专家名称");
          return;
        }
        h(!0), Promise.resolve(l(c.trim(), b.trim())).finally(() => {
          h(!1);
        });
      },
      okText: "创建",
      cancelText: "取消",
      okButtonProps: { loading: S },
      maskClosable: !0,
      keyboard: !0
    },
    a.createElement(
      "div",
      { style: { marginBottom: 16 } },
      a.createElement(
        "div",
        { style: { fontSize: 13, marginBottom: 6, color: "#595959" } },
        "专家名称"
      ),
      a.createElement(o, {
        placeholder: "输入专家名称",
        value: c,
        onChange: (y) => f(y.target.value),
        maxLength: 50
      })
    ),
    a.createElement(
      "div",
      null,
      a.createElement(
        "div",
        { style: { fontSize: 13, marginBottom: 6, color: "#595959" } },
        "专家描述（可选）"
      ),
      a.createElement(o.TextArea, {
        placeholder: "简要描述该专家的职责和能力...",
        value: b,
        onChange: (y) => k(y.target.value),
        rows: 3,
        maxLength: 200
      })
    )
  );
}
function qn({
  agentId: e,
  systemPromptFiles: t,
  onRefresh: l
}) {
  const a = z().React, { useState: n, useEffect: s, useCallback: r } = a, {
    List: o,
    Tag: d,
    Switch: c,
    Button: f,
    Modal: b,
    Input: k,
    Spin: S,
    Empty: h,
    message: y,
    Typography: A
  } = z().antd, { FileTextOutlined: L, PlusOutlined: U, EditOutlined: N, ReloadOutlined: te } = z().antdIcons || {}, { Text: G } = A, [H, x] = n([]), [C, _] = n(!0), [J, F] = n(
    t || []
  ), [I, E] = n(!1), [g, M] = n(null), [K, Q] = n(""), [le, $] = n(""), [p, u] = n(!1), O = r(async () => {
    _(!0);
    try {
      const w = await ol(e);
      x(w);
    } catch (w) {
      y.error(w.message || "加载记忆文件失败"), x([]);
    } finally {
      _(!1);
    }
  }, [e]);
  s(() => {
    O();
  }, [O]), s(() => {
    F(t || []);
  }, [t]);
  const ne = async (w, W) => {
    const re = new Set(J);
    if (W)
      re.add(w);
    else {
      if (_n.includes(w) && w === "AGENTS.md") {
        y.warning("AGENTS.md 是核心文件，不能停用");
        return;
      }
      re.delete(w);
    }
    const v = Array.from(re);
    F(v);
    try {
      await kn(e, v), y.success(W ? "已启用记忆文件" : "已停用记忆文件"), l();
    } catch (Z) {
      y.error(Z.message || "更新失败"), F(t || []);
    }
  }, R = async (w) => {
    try {
      const W = await ce(
        `/workspace/files/${encodeURIComponent(w)}`,
        { headers: { "X-Agent-Id": e } }
      );
      M(w), Q(W.content || ""), E(!0);
    } catch (W) {
      y.error(W.message || "读取文件失败");
    }
  }, V = () => {
    M(null), Q(""), $(""), E(!0);
  }, se = async () => {
    const w = g || le.trim();
    if (!w) {
      y.warning("请输入文件名");
      return;
    }
    const W = w.endsWith(".md") ? w : `${w}.md`;
    u(!0);
    try {
      if (await bt(e, W, K), !g && !J.includes(W)) {
        const re = [...J, W];
        F(re), await kn(e, re);
      }
      y.success("保存成功"), E(!1), O(), l();
    } catch (re) {
      y.error(re.message || "保存失败");
    } finally {
      u(!1);
    }
  };
  return C ? a.createElement(
    "div",
    { style: { textAlign: "center", padding: 40 } },
    a.createElement(S, { size: "large" })
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
        "div",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        L ? a.createElement(L, {
          style: { fontSize: 14, color: "#1677ff" }
        }) : null,
        a.createElement(
          G,
          { strong: !0 },
          `记忆文件 (${H.length})`
        ),
        a.createElement(
          G,
          { type: "secondary", style: { fontSize: 12 } },
          `· 已挂载 ${J.length} 个到专家记忆`
        )
      ),
      a.createElement(
        "div",
        { style: { display: "flex", gap: 8 } },
        a.createElement(
          f,
          {
            size: "small",
            icon: te ? a.createElement(te) : void 0,
            onClick: O
          },
          "刷新"
        ),
        a.createElement(
          f,
          {
            type: "primary",
            size: "small",
            icon: U ? a.createElement(U) : void 0,
            onClick: V
          },
          "新建记忆文件"
        )
      )
    ),
    H.length === 0 ? a.createElement(h, {
      description: "暂无记忆文件，点击「新建记忆文件」添加",
      image: h.PRESENTED_IMAGE_SIMPLE
    }) : a.createElement(o, {
      dataSource: H,
      renderItem: (w) => {
        const W = J.includes(w.filename), re = _n.includes(w.filename);
        return a.createElement(
          o.Item,
          {
            actions: [
              a.createElement(
                f,
                {
                  type: "link",
                  size: "small",
                  icon: N ? a.createElement(N) : void 0,
                  onClick: () => R(w.filename)
                },
                "编辑"
              )
            ]
          },
          a.createElement(o.Item.Meta, {
            avatar: a.createElement(L, {
              style: {
                fontSize: 20,
                color: W ? "#1677ff" : "#bfbfbf"
              }
            }),
            title: a.createElement(
              "div",
              {
                style: {
                  display: "flex",
                  alignItems: "center",
                  gap: 6
                }
              },
              a.createElement(G, null, w.filename),
              re ? a.createElement(
                d,
                { color: "default", style: { fontSize: 10 } },
                "内置"
              ) : a.createElement(
                d,
                { color: "cyan", style: { fontSize: 10 } },
                "记忆库"
              )
            ),
            description: a.createElement(
              "div",
              { style: { fontSize: 12 } },
              `${(w.size / 1024).toFixed(1)} KB · 修改于 ${new Date(w.modified_time).toLocaleString()}`
            )
          }),
          a.createElement(c, {
            checked: W,
            size: "small",
            onChange: (v) => ne(w.filename, v)
          })
        );
      }
    }),
    // Edit/New file modal
    a.createElement(
      b,
      {
        open: I,
        onCancel: () => E(!1),
        title: g ? `编辑 ${g}` : "新建记忆文件",
        width: 700,
        onOk: se,
        confirmLoading: p,
        okText: "保存"
      },
      g ? null : a.createElement(
        "div",
        { style: { marginBottom: 12 } },
        a.createElement(k, {
          placeholder: "文件名（如：油藏工程记忆库.md）",
          value: le,
          onChange: (w) => $(w.target.value),
          addonAfter: le.endsWith(".md") ? "" : ".md"
        })
      ),
      a.createElement(k.TextArea, {
        value: K,
        onChange: (w) => Q(w.target.value),
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
function Ml({
  skills: e,
  agentId: t
}) {
  const l = z().React, { useMemo: a } = l, {
    List: n,
    Tag: s,
    Typography: r,
    Empty: o,
    Button: d,
    message: c
  } = z().antd, { ThunderboltOutlined: f, CopyOutlined: b } = z().antdIcons || {}, { Text: k } = r, S = a(() => Nn(e), [e]), h = (A) => {
    try {
      const L = z();
      L.setSelectedAgent && L.setSelectedAgent(t);
    } catch {
    }
    try {
      sessionStorage.setItem("ugsci_pending_prompt", A.value);
    } catch {
    }
    window.history.pushState({}, "", "/chat"), window.dispatchEvent(new PopStateEvent("popstate"));
  }, y = (A) => {
    var L;
    (L = navigator.clipboard) == null || L.writeText(A.value).then(() => {
      c.success("已复制到剪贴板");
    });
  };
  return S.length === 0 ? l.createElement(o, {
    description: "暂无推荐提问，请先为专家添加技能",
    image: o.PRESENTED_IMAGE_SIMPLE
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
      f ? l.createElement(f, {
        style: { fontSize: 14, color: "#1677ff" }
      }) : null,
      l.createElement(
        k,
        { strong: !0 },
        `推荐提问 (${S.length})`
      ),
      l.createElement(
        k,
        { type: "secondary", style: { fontSize: 12 } },
        "· 从技能描述中自动提取"
      )
    ),
    l.createElement(n, {
      dataSource: S,
      renderItem: (A, L) => l.createElement(
        n.Item,
        {
          actions: [
            l.createElement(
              d,
              {
                type: "link",
                size: "small",
                icon: b ? l.createElement(b) : void 0,
                onClick: () => y(A)
              },
              "复制"
            )
          ]
        },
        l.createElement(n.Item.Meta, {
          avatar: l.createElement(
            s,
            { color: "blue", style: { borderRadius: "50%" } },
            `${L + 1}`
          ),
          title: l.createElement(
            "div",
            {
              style: {
                cursor: "pointer",
                color: "#1677ff"
              },
              onClick: () => h(A)
            },
            A.value
          ),
          description: l.createElement(
            k,
            { type: "secondary", style: { fontSize: 12 } },
            A.label
          )
        })
      )
    })
  );
}
function $l() {
  var ie;
  const e = z().React, { useState: t, useEffect: l, useCallback: a, useMemo: n } = e, {
    Spin: s,
    Empty: r,
    Input: o,
    Button: d,
    message: c,
    Row: f,
    Col: b,
    Tabs: k,
    Modal: S,
    Typography: h
  } = z().antd, {
    ReloadOutlined: y,
    PlusOutlined: A,
    SearchOutlined: L,
    TeamOutlined: U,
    UserOutlined: N
  } = z().antdIcons || {}, { Text: te, Paragraph: G } = h, [H, x] = t([]), [C, _] = t(!0), [J, F] = t(!1), [I, E] = t(null), [g, M] = t(""), [K, Q] = t(!1), [le, $] = t("experts"), [p, u] = t(
    null
  ), [O, ne] = t(""), [R, V] = t(!1), [se, w] = t(!1), [W, re] = t(null), [v, Z] = t([]), m = a(async () => {
    _(!0);
    try {
      const q = await Ut(), ue = await Promise.all(
        q.map(async (ve) => {
          try {
            const [we, xe, _e] = await Promise.all([
              Nt(ve.id).catch(() => null),
              wt(ve.id).catch(() => []),
              Wt(ve.id).catch(() => [])
            ]);
            return {
              agent: ve,
              config: we,
              skills: xe,
              mcps: _e,
              loading: !1
            };
          } catch {
            return {
              agent: ve,
              config: null,
              skills: [],
              mcps: [],
              loading: !1
            };
          }
        })
      );
      x(ue), Z(q);
    } catch (q) {
      c.error(q.message || "加载专家列表失败"), x([]);
    } finally {
      _(!1);
    }
  }, []);
  l(() => {
    m();
  }, [m]), l(() => {
    if (W && se) {
      const q = H.find(
        (ue) => ue.agent.id === W.agent.id
      );
      q && q !== W && re(q);
    }
  }, [H, W, se]);
  const Y = a(
    async (q) => {
      var xe;
      const ue = q.coordinatorName || ((xe = q.members[0]) == null ? void 0 : xe.name);
      let ve = null;
      if (ue && (ve = vt(v, ue)), !ve) {
        const _e = v[0];
        if (_e)
          ve = _e.id, c.warning(
            `未找到专家「${ue || "协调者"}」，将使用「${_e.name}」作为工作流控制器。控制器将通过 spawn_subagent 分派子任务。`
          );
        else {
          c.error("没有可用的 Agent 作为工作流控制器");
          return;
        }
      }
      if (/\{.+?\}/.test(q.taskTemplate)) {
        ne(""), u(q);
        return;
      }
      await B(q, ve, q.taskTemplate);
    },
    [v, c]
  ), B = a(
    async (q, ue, ve) => {
      V(!0);
      try {
        const we = ve || q.taskTemplate, xe = `/ugsci-team ${q.mode} ${q.name} ${we}`, _e = z();
        _e.setSelectedAgent && _e.setSelectedAgent(ue), await Ua(ue, xe), c.success(
          `OMP 工作流已启动：${q.name}（${q.mode}模式）`
        ), u(null), oe("/chat");
      } catch (we) {
        c.error(we.message || "发起团队任务失败");
      } finally {
        V(!1);
      }
    },
    [c]
  ), oe = (q) => {
    window.history.pushState({}, "", q), window.dispatchEvent(new PopStateEvent("popstate"));
  }, de = a((q) => {
    E(q), F(!0);
  }, []), Ee = a((q) => {
    re(q), w(!0);
  }, []), ye = a(
    (q) => {
      if (!q.agent.enabled) {
        c.warning(`专家「${q.agent.name}」未启用，请先启用`);
        return;
      }
      try {
        const ue = z();
        ue.setSelectedAgent && ue.setSelectedAgent(q.agent.id);
      } catch (ue) {
        console.warn("[ugsci] Failed to set selected agent:", ue);
      }
      c.success(`已召唤专家「${q.agent.name}」，正在跳转至对话...`), oe("/chat");
    },
    [c]
  ), pe = n(() => {
    if (!g.trim()) return H;
    const q = g.toLowerCase();
    return H.filter(
      (ue) => {
        var ve;
        return ue.agent.name.toLowerCase().includes(q) || ((ve = ue.agent.description) == null ? void 0 : ve.toLowerCase().includes(q)) || ue.agent.id.toLowerCase().includes(q) || ue.skills.some((we) => we.name.toLowerCase().includes(q));
      }
    );
  }, [H, g]), ae = H.filter((q) => q.agent.enabled).length, D = H.reduce(
    (q, ue) => q + ue.skills.filter((ve) => ve.enabled !== !1).length,
    0
  ), T = H.reduce((q, ue) => q + ue.mcps.length, 0), X = [
    {
      key: "experts",
      label: e.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        N ? e.createElement(N, { style: { fontSize: 14 } }) : null,
        "专家列表"
      ),
      children: e.createElement(
        "div",
        null,
        // Search bar
        e.createElement(
          "div",
          { style: { marginBottom: 16 } },
          e.createElement(o, {
            placeholder: "搜索专家名称、描述或技能...",
            prefix: L ? e.createElement(L) : void 0,
            value: g,
            onChange: (q) => M(q.target.value),
            allowClear: !0,
            style: { maxWidth: 400 }
          })
        ),
        // Content
        C ? e.createElement(
          "div",
          { style: { textAlign: "center", padding: 60 } },
          e.createElement(s, { size: "large" })
        ) : pe.length === 0 ? e.createElement(r, {
          description: g ? "未找到匹配的专家" : "暂无专家，点击「创建专家」添加"
        }) : e.createElement(
          f,
          { gutter: [12, 12], align: "stretch" },
          ...pe.map(
            (q) => e.createElement(
              b,
              {
                key: q.agent.id,
                xs: 24,
                sm: 12,
                md: 8,
                lg: 6,
                style: { display: "flex" }
              },
              e.createElement(Il, {
                expert: q,
                onClick: () => de(q),
                onSummon: () => ye(q),
                onConfigure: () => Ee(q)
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
        U ? e.createElement(U, { style: { fontSize: 14 } }) : null,
        "专家团"
      ),
      children: e.createElement(sl, {
        agents: v,
        onLaunch: Y
      })
    }
  ];
  return e.createElement(
    "div",
    { style: { padding: 24 } },
    e.createElement(Ct, {
      title: "专家",
      subtitle: `共 ${H.length} 位专家（${ae} 位启用）· ${D} 个技能 · ${T} 个 MCP 客户端`,
      extra: e.createElement(
        e.Fragment,
        null,
        e.createElement(
          d,
          {
            icon: y ? e.createElement(y) : void 0,
            onClick: () => {
              Ze(), m();
            },
            loading: C
          },
          "刷新"
        ),
        e.createElement(
          d,
          {
            type: "primary",
            icon: A ? e.createElement(A) : void 0,
            onClick: () => Q(!0),
            style: Oe
          },
          "创建专家"
        )
      )
    }),
    e.createElement(k, {
      items: X,
      activeKey: le,
      onChange: (q) => $(q)
    }),
    // Drawer
    e.createElement(Ol, {
      expert: I,
      open: J,
      onClose: () => F(!1),
      onRefresh: () => m()
    }),
    // Template Modal
    e.createElement(Al, {
      open: K,
      onClose: () => Q(!1),
      onCreated: () => m()
    }),
    // Config Modal (gear icon)
    e.createElement(zl, {
      expert: W,
      open: se,
      onClose: () => w(!1),
      onRefresh: () => m()
    }),
    // Team Launch Modal (for filling placeholders)
    p ? e.createElement(
      S,
      {
        open: !0,
        title: e.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 8 } },
          e.createElement(jt, {
            members: p.members.map((q) => q.name),
            size: 28
          }),
          e.createElement(
            "span",
            null,
            `发起团队任务 - ${p.name}`
          )
        ),
        onCancel: () => u(null),
        onOk: () => {
          var we;
          const q = p.coordinatorName || ((we = p.members[0]) == null ? void 0 : we.name), ue = q ? vt(v, q) : null;
          if (!ue) {
            c.error("无法找到协调者专家");
            return;
          }
          let ve = p.taskTemplate;
          O.trim() && (ve = O.trim()), B(p, ue, ve);
        },
        confirmLoading: R,
        okText: "发起任务",
        width: 600
      },
      e.createElement(
        "div",
        { style: { marginBottom: 12 } },
        e.createElement(
          te,
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
          te,
          {
            type: "secondary",
            style: { fontSize: 12, display: "block", marginBottom: 8 }
          },
          "输入具体任务描述（替换上面的占位符内容）："
        ),
        e.createElement(o.TextArea, {
          value: O,
          onChange: (q) => ne(q.target.value),
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
          te,
          { style: { fontSize: 12, color: "#0958d9" } },
          `协调者: ${p.coordinatorName || ((ie = p.members[0]) == null ? void 0 : ie.name) || "—"} · 成员: ${p.members.map((q) => q.name).join("、")}`
        )
      )
    ) : null
  );
}
const Vn = [
  "console",
  "dingtalk",
  "feishu",
  "wechat",
  "wecom",
  "discord",
  "telegram",
  "qq",
  "imessage",
  "mattermost",
  "matrix",
  "onebot",
  "mqtt",
  "voice",
  "sip",
  "xiaoyi"
], Rl = {
  console: "Console",
  dingtalk: "DingTalk",
  feishu: "Feishu",
  wechat: "WeChat",
  wecom: "WeCom",
  discord: "Discord",
  telegram: "Telegram",
  qq: "QQ",
  imessage: "iMessage",
  mattermost: "Mattermost",
  matrix: "Matrix",
  onebot: "OneBot",
  mqtt: "MQTT",
  voice: "Voice",
  sip: "SIP",
  xiaoyi: "XiaoYi"
};
function Fe(e) {
  return (e || "").trim() || "channel";
}
function Ve(e) {
  return (e || "").trim();
}
function Yn(e) {
  const t = Ve(e);
  return t === "" || t === "*";
}
function xt(e) {
  return e === "user" ? "user" : "all";
}
function Ue(e) {
  const t = xt(e.subject_type);
  return {
    source_type: Fe(e.source_type),
    source_value: Ve(e.source_value),
    subject_type: t,
    subject_value: t === "all" ? "" : (e.subject_value || "").trim(),
    effect: e.effect
  };
}
function Ye(e) {
  return { tool_name: e.tool_name || "*", ...Ue(e) };
}
function Qn(e) {
  return { tool_name: e.tool_name || "*", effect: e.effect };
}
function Zn(e) {
  return [...e].map(Ue).sort(
    (t, l) => t.source_type.localeCompare(l.source_type) || t.source_value.localeCompare(l.source_value) || t.subject_type.localeCompare(l.subject_type) || t.subject_value.localeCompare(l.subject_value)
  );
}
function St(e) {
  return [...e].map(Ye).sort(
    (t, l) => t.tool_name.localeCompare(l.tool_name) || t.source_type.localeCompare(l.source_type) || t.source_value.localeCompare(l.source_value) || t.subject_type.localeCompare(l.subject_type) || t.subject_value.localeCompare(l.subject_value)
  );
}
function ea(e) {
  return [...e].map(Qn).sort((t, l) => t.tool_name.localeCompare(l.tool_name));
}
function Le(e) {
  return {
    default_effect: e.default_effect || "deny",
    client_overrides: Zn(e.client_overrides || []),
    tool_defaults: ea(e.tool_defaults || []),
    tool_overrides: St(e.tool_overrides || []),
    unmanaged_rules_count: e.unmanaged_rules_count || 0
  };
}
function Me(e) {
  return [Fe(e.source_type), Ve(e.source_value), xt(e.subject_type), e.subject_type === "all" ? "" : (e.subject_value || "").trim()].join("\0");
}
function $e(e) {
  return [e.tool_name || "*", Fe(e.source_type), Ve(e.source_value), xt(e.subject_type), e.subject_type === "all" ? "" : (e.subject_value || "").trim()].join("\0");
}
function Ll(e, t) {
  const l = Le(t), a = /* @__PURE__ */ new Map();
  l.tool_overrides.forEach((c) => {
    const f = Ye(c), b = a.get(f.tool_name) || [];
    b.push(f), a.set(f.tool_name, b);
  });
  const n = new Map(l.tool_defaults.map((c) => [c.tool_name, Qn(c)])), s = new Set(e.map((c) => c.name)), r = e.map((c) => {
    var f;
    return {
      toolName: c.name,
      description: c.description,
      inputSchema: c.input_schema,
      stale: !1,
      defaultEffect: ((f = n.get(c.name)) == null ? void 0 : f.effect) || l.default_effect,
      hasExplicitDefault: n.has(c.name),
      rules: St(a.get(c.name) || [])
    };
  }), o = /* @__PURE__ */ new Set([...a.keys(), ...n.keys()]), d = Array.from(o).filter((c) => c !== "*" && !s.has(c)).map((c) => {
    var f;
    return {
      toolName: c,
      description: "",
      inputSchema: {},
      stale: !0,
      defaultEffect: ((f = n.get(c)) == null ? void 0 : f.effect) || l.default_effect,
      hasExplicitDefault: n.has(c),
      rules: St(a.get(c) || [])
    };
  });
  return [...r, ...d];
}
function ta(e, t) {
  const l = Le(e), a = new Set(
    t === null ? l.client_overrides.map((n) => Me(Ue(n))) : l.tool_overrides.filter((n) => n.tool_name === t).map((n) => $e(Ye(n)))
  );
  for (const n of Vn) {
    const s = t === null ? Me({ source_type: "channel", source_value: n, subject_type: "all", subject_value: "" }) : $e({ tool_name: t, source_type: "channel", source_value: n, subject_type: "all", subject_value: "" });
    if (!a.has(s)) return n;
  }
  return "console";
}
function Bl(e) {
  return Mt(e, { source_type: "channel", source_value: ta(e, null), subject_type: "all", subject_value: "", effect: "ask" });
}
function jl(e, t) {
  return $t(e, { tool_name: t, source_type: "channel", source_value: ta(e, t), subject_type: "all", subject_value: "", effect: "ask" });
}
function Mt(e, t, l) {
  const a = Le(e), n = Ue(t), s = Me(l || n), r = Me(n), o = a.client_overrides.filter((d) => {
    const c = Me(Ue(d));
    return c !== s && c !== r;
  });
  return o.push(n), { ...a, client_overrides: Zn(o) };
}
function $t(e, t, l) {
  const a = Le(e), n = Ye(t), s = $e(l || n), r = $e(n), o = a.tool_overrides.filter((d) => {
    const c = $e(Ye(d));
    return c !== s && c !== r;
  });
  return o.push(n), { ...a, tool_overrides: St(o) };
}
function Ul(e, t, l) {
  const a = Le(e), n = a.tool_defaults.filter((s) => s.tool_name !== t);
  return n.push({ tool_name: t, effect: l }), { ...a, tool_defaults: ea(n) };
}
function Nl(e, t) {
  const l = Le(e), a = Me(t);
  return { ...l, client_overrides: l.client_overrides.filter((n) => Me(Ue(n)) !== a) };
}
function Dl(e, t) {
  const l = Le(e), a = $e(t);
  return { ...l, tool_overrides: l.tool_overrides.filter((n) => $e(Ye(n)) !== a) };
}
function na(e, t) {
  const l = Fe(t.source_type), a = Ve(t.source_value);
  if (Yn(a)) return [];
  const n = /* @__PURE__ */ new Map();
  return e.forEach((s) => {
    if (Fe(s.source_type) !== l || Ve(s.source_value) !== a) return;
    const r = (s.subject_value || "").trim();
    !r || n.has(r) || n.set(r, s);
  }), Array.from(n.values());
}
function Fl(e, t) {
  return na(e, t).map((l) => ({ label: l.subject_value, value: l.subject_value }));
}
function Jt(e) {
  return Fe(e.source_type) === "channel" && Yn(e.source_value) && xt(e.subject_type) === "user" && !!(e.subject_value || "").trim();
}
function Gl(e, t) {
  const l = Ue(t);
  return l.subject_type === "user" && !!l.subject_value && l.subject_value !== "*" && e.some((a) => Fe(a.source_type) === l.source_type) && !Jt(l) && !na(e, l).some((a) => a.subject_value === l.subject_value);
}
function Hl(e) {
  const t = [...e.client_overrides || [], ...e.tool_overrides || []];
  for (const l of t) {
    const a = Ue(l);
    if (a.subject_type === "user") {
      if (!a.subject_value || a.subject_value === "*" || !a.source_value) return { reason: "missingUserValue", rule: l };
      if (Jt(a)) return { reason: "ambiguousUserSource", rule: l };
    }
  }
  return null;
}
function zn(e, t) {
  const l = { ...e, ...t };
  return t.subject_type && (l.subject_value = ""), (t.source_type !== void 0 || t.source_value !== void 0) && t.subject_value === void 0 && l.subject_type === "user" && (l.subject_value = ""), l;
}
function At(e) {
  return JSON.stringify(Le(e));
}
function Wl({
  client: e,
  agentId: t,
  open: l,
  onClose: a,
  onSave: n
}) {
  const s = z().React, { useState: r, useEffect: o, useMemo: d, useCallback: c } = s, { Modal: f, Spin: b, Empty: k, Button: S, Tag: h, Segmented: y, Select: A, Input: L, AutoComplete: U, Typography: N, message: te } = z().antd, { PlusOutlined: G, DeleteOutlined: H } = z().antdIcons || {}, { Text: x } = N, [C, _] = r(null), [J, F] = r([]), [I, E] = r([]), [g, M] = r(!1), [K, Q] = r(!1), [le, $] = r(""), [p, u] = r("");
  o(() => {
    if (!l) return;
    let m = !1;
    return (async () => {
      M(!0), F([]), E([]), $("");
      try {
        const B = await qa(t, e.key);
        if (!m) {
          const oe = Le(B);
          _(oe), u(At(oe));
        }
        try {
          const oe = await Ya(t);
          m || E(oe);
        } catch {
          m || E([]);
        }
        if (!e.enabled) {
          m || $("MCP 客户端未启用，无法获取工具列表");
          return;
        }
        try {
          const oe = await Xa(t, e.key);
          m || F(oe);
        } catch (oe) {
          m || $((oe == null ? void 0 : oe.message) || "无法加载工具列表");
        }
      } catch {
        m || (_(null), u(""), $("加载访问策略失败"));
      } finally {
        m || M(!1);
      }
    })(), () => {
      m = !0;
    };
  }, [l, e.key, e.enabled, t]);
  const O = d(() => C ? Ll(J, C) : [], [J, C]), ne = d(() => !!(C && At(C) !== p), [C, p]), R = (m) => Rl[m] || m, V = c((m) => {
    _((Y) => Y && { ...Y, default_effect: m });
  }, []), se = c((m, Y) => {
    _((B) => B && Mt(B, zn(m, Y), { source_type: m.source_type, source_value: m.source_value, subject_type: m.subject_type, subject_value: m.subject_value }));
  }, []), w = c((m, Y) => {
    _((B) => B && $t(B, zn(m, Y), { tool_name: m.tool_name, source_type: m.source_type, source_value: m.source_value, subject_type: m.subject_type, subject_value: m.subject_value }));
  }, []), W = c(async () => {
    if (!C) return;
    const m = Hl(C);
    if (m) {
      te.error(m.reason === "missingUserValue" ? "用户规则缺少用户标识" : "用户来源不明确");
      return;
    }
    Q(!0);
    try {
      await n(e.key, C) && (u(At(C)), a());
    } finally {
      Q(!1);
    }
  }, [C, e.key, n, a, te]), re = c(() => {
    if (!ne || K) {
      a();
      return;
    }
    f.confirm({
      title: "放弃修改",
      content: "确定要放弃未保存的修改吗？",
      okText: "确认",
      cancelText: "取消",
      onOk: a
    });
  }, [ne, K, a]), v = c((m, Y) => {
    const B = Fl(I, m), oe = Jt(m), de = Gl(I, m), Ee = [{ label: "所有渠道", value: "*" }, ...Vn.map((X) => ({ label: R(X), value: X }))], ye = [{ label: "所有人", value: "all" }, { label: "指定用户", value: "user" }], pe = (X) => {
      Y ? w(m, X) : se(m, X);
    }, ae = (X) => {
      _(Y ? (ie) => ie && $t(ie, { ...m, effect: X }) : (ie) => ie && Mt(ie, { ...m, effect: X }));
    }, D = () => {
      _(Y ? (X) => X && Dl(X, { tool_name: m.tool_name, source_type: m.source_type, source_value: m.source_value, subject_type: m.subject_type, subject_value: m.subject_value }) : (X) => X && Nl(X, { source_type: m.source_type, source_value: m.source_value, subject_type: m.subject_type, subject_value: m.subject_value }));
    }, T = Y ? $e(m) : Me(m);
    return s.createElement(
      "div",
      { key: T, style: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr auto", gap: 6, alignItems: "end", padding: "6px 0", borderBottom: "1px solid #f5f5f5" } },
      // source_type
      s.createElement(
        "div",
        null,
        s.createElement(x, { style: { fontSize: 11, color: "#999", display: "block", marginBottom: 2 } }, "来源类型"),
        s.createElement(A, {
          size: "small",
          style: { width: "100%" },
          value: m.source_type || "channel",
          onChange: (X) => pe({ source_type: X, source_value: X === "channel" ? m.source_value || "*" : m.source_value }),
          options: [{ label: "渠道", value: "channel" }, ...m.source_type && m.source_type !== "channel" ? [{ label: m.source_type, value: m.source_type }] : []]
        })
      ),
      // source_value
      s.createElement(
        "div",
        null,
        s.createElement(x, { style: { fontSize: 11, color: "#999", display: "block", marginBottom: 2 } }, "来源"),
        m.source_type === "channel" ? s.createElement(A, { size: "small", style: { width: "100%" }, value: m.source_value || "*", onChange: (X) => pe({ source_value: X }), options: Ee }) : s.createElement(L, { size: "small", placeholder: "来源标识", value: m.source_value, onChange: (X) => pe({ source_value: X.target.value }) })
      ),
      // subject_type
      s.createElement(
        "div",
        null,
        s.createElement(x, { style: { fontSize: 11, color: "#999", display: "block", marginBottom: 2 } }, "对象类型"),
        s.createElement(A, { size: "small", style: { width: "100%" }, value: m.subject_type, onChange: (X) => pe({ subject_type: X }), options: ye })
      ),
      // subject_value
      s.createElement(
        "div",
        null,
        s.createElement(x, { style: { fontSize: 11, color: "#999", display: "block", marginBottom: 2 } }, "对象"),
        m.subject_type === "user" ? s.createElement(
          "div",
          null,
          s.createElement(U, {
            size: "small",
            style: { width: "100%" },
            value: m.subject_value,
            options: B,
            placeholder: B.length > 0 ? "用户 ID" : "无近期用户",
            onChange: (X) => pe({ subject_value: X }),
            onSelect: (X) => pe({ subject_value: X }),
            filterOption: (X, ie) => String((ie == null ? void 0 : ie.value) || "").toLowerCase().includes(X.toLowerCase())
          }),
          oe ? s.createElement(x, { style: { fontSize: 10, color: "#fa8c16", display: "block" } }, "请先选择具体渠道") : null,
          de ? s.createElement(x, { style: { fontSize: 10, color: "#fa8c16", display: "block" } }, "未知的用户标识") : null
        ) : s.createElement(L, { size: "small", disabled: !0, value: "所有人" })
      ),
      // effect
      s.createElement(
        "div",
        null,
        s.createElement(x, { style: { fontSize: 11, color: "#999", display: "block", marginBottom: 2 } }, "效果"),
        s.createElement(A, {
          size: "small",
          style: { width: "100%" },
          value: m.effect,
          onChange: (X) => ae(X),
          options: [{ label: "允许", value: "allow" }, { label: "询问", value: "ask" }, { label: "拒绝", value: "deny" }]
        })
      ),
      // delete
      s.createElement(S, { size: "small", type: "text", icon: s.createElement(H), onClick: D, title: "删除规则" })
    );
  }, [I, se, w]), Z = (m, Y) => {
    const oe = {
      ask: { bg: "rgba(245,158,11,0.24)", border: "rgba(217,119,6,0.36)", text: "#8a4b00" },
      allow: { bg: "rgba(34,197,94,0.22)", border: "rgba(22,163,74,0.35)", text: "#17643a" },
      deny: { bg: "rgba(239,68,68,0.2)", border: "rgba(220,38,38,0.34)", text: "#9f1f26" }
    }[m];
    return s.createElement(y, {
      size: "small",
      value: m,
      onChange: (de) => Y(de),
      style: { "--mcp-policy-segment-bg": oe.bg, "--mcp-policy-segment-border": oe.border, "--mcp-policy-segment-text": oe.text },
      options: [{ label: "询问", value: "ask" }, { label: "允许", value: "allow" }, { label: "拒绝", value: "deny" }]
    });
  };
  return s.createElement(
    f,
    {
      title: `${e.name || e.key} - 工具与访问策略`,
      open: l,
      onCancel: re,
      width: "min(1040px, calc(100vw - 32px))",
      styles: {
        body: {
          maxHeight: "min(520px, calc(100vh - 280px))",
          overflowY: "auto",
          overflowX: "hidden"
        }
      },
      footer: s.createElement(
        "div",
        { style: { textAlign: "right" } },
        s.createElement(S, { onClick: re, style: { marginRight: 8 } }, "取消"),
        s.createElement(S, { type: "primary", onClick: W, loading: K, disabled: !C || g }, "保存")
      )
    },
    g && !C ? s.createElement("div", { style: { textAlign: "center", padding: 40 } }, s.createElement(b)) : C ? s.createElement(
      "div",
      null,
      // ── Client-level panel ──
      s.createElement(
        "div",
        { style: { marginBottom: 16, padding: "12px 16px", background: "#fafafa", borderRadius: 8, border: "1px solid #f0f0f0" } },
        s.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 } },
          s.createElement(x, { strong: !0 }, "客户端访问策略"),
          s.createElement(
            "div",
            { style: { display: "flex", alignItems: "center", gap: 8 } },
            s.createElement(x, { style: { fontSize: 12, color: "#666" } }, "默认:"),
            Z(C.default_effect, V),
            s.createElement(S, { size: "small", icon: s.createElement(G), onClick: () => _((m) => m && Bl(m)) }, "添加规则")
          )
        ),
        C.client_overrides.length === 0 ? s.createElement(x, { style: { fontSize: 12, color: "#999" } }, "暂无客户端级覆盖规则") : s.createElement("div", null, ...C.client_overrides.map((m) => v(m, !1)))
      ),
      // ── Error message ──
      le ? s.createElement("div", { style: { color: "#ff4d4f", fontSize: 12, marginBottom: 8 } }, le) : null,
      // ── Tool-level panel ──
      s.createElement(x, { strong: !0, style: { display: "block", marginBottom: 8 } }, "工具访问策略"),
      O.length === 0 ? s.createElement(k, { description: "暂无工具" }) : s.createElement(
        "div",
        null,
        ...O.map(
          (m) => s.createElement(
            "div",
            { key: m.toolName, style: { marginBottom: 12, padding: "10px 12px", background: "#fafafa", borderRadius: 6, border: "1px solid #f0f0f0" } },
            s.createElement(
              "div",
              { style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 } },
              s.createElement(
                "div",
                { style: { display: "flex", alignItems: "center", gap: 6 } },
                s.createElement(h, { color: m.stale ? "default" : "blue" }, m.toolName),
                m.stale ? s.createElement(h, { color: "orange" }, "已失效") : null
              ),
              s.createElement(
                "div",
                { style: { display: "flex", alignItems: "center", gap: 8 } },
                s.createElement(x, { style: { fontSize: 12, color: "#666" } }, "默认:"),
                Z(m.defaultEffect, (Y) => _((B) => B && Ul(B, m.toolName, Y))),
                s.createElement(S, { size: "small", icon: s.createElement(G), onClick: () => _((Y) => Y && jl(Y, m.toolName)) }, "添加规则")
              )
            ),
            // Tool schema
            m.description || m.inputSchema && Object.keys(m.inputSchema).length > 0 ? s.createElement(
              "details",
              { style: { marginBottom: 6, fontSize: 12 } },
              s.createElement("summary", { style: { cursor: "pointer", color: "#888" } }, "工具详情"),
              m.description ? s.createElement("div", { style: { padding: "4px 0", color: "#666" } }, m.description) : null,
              m.inputSchema && Object.keys(m.inputSchema).length > 0 ? s.createElement("pre", { style: { background: "#f5f5f5", padding: 8, borderRadius: 4, fontSize: 11, overflow: "auto", maxHeight: 200 } }, JSON.stringify(m.inputSchema, null, 2)) : null
            ) : null,
            // Tool rules
            m.rules.length === 0 ? s.createElement(x, { style: { fontSize: 12, color: "#999" } }, "暂无工具级覆盖规则") : s.createElement("div", null, ...m.rules.map((Y) => v(Y, !0)))
          )
        )
      )
    ) : s.createElement("div", { style: { color: "#ff4d4f" } }, "加载访问策略失败")
  );
}
function Jl({
  client: e,
  agentId: t,
  open: l,
  onClose: a,
  onAuthChanged: n
}) {
  var Q, le, $, p, u;
  const s = z().React, { useState: r, useCallback: o, useEffect: d } = s, { Modal: c, Button: f, Input: b, Typography: k, message: S } = z().antd, { Text: h } = k, [y, A] = r("idle"), [L, U] = r(""), [N, te] = r(!1), [G, H] = r(((Q = e.oauth_status) == null ? void 0 : Q.client_id) || ""), [x, C] = r(((le = e.oauth_status) == null ? void 0 : le.scope) || ""), [_, J] = r(""), [F, I] = r("");
  d(() => {
    if (y !== "waiting") return;
    const O = setInterval(async () => {
      try {
        (await Za(t, e.key)).authorized && (A("success"), n());
      } catch {
      }
    }, 2e3);
    return () => clearInterval(O);
  }, [y, e.key, t, n]);
  const E = y === "success" || y === "idle" && (($ = e.oauth_status) == null ? void 0 : $.authorized) === !0, g = y === "idle" && ((p = e.oauth_status) == null ? void 0 : p.authorized) && e.oauth_status.expires_at > 0 && e.oauth_status.expires_at < Date.now() / 1e3, M = o(async () => {
    var O;
    if (!((O = e.url) != null && O.trim())) {
      U("缺少 URL");
      return;
    }
    A("starting"), U("");
    try {
      const ne = await Qa(t, e.key, {
        url: e.url,
        scope: x,
        client_id: G,
        auth_endpoint: _,
        token_endpoint: F
      });
      A("waiting"), window.open(ne.auth_url, "_blank", "popup,width=600,height=700");
    } catch (ne) {
      A("error"), U((ne == null ? void 0 : ne.message) || "OAuth 启动失败");
    }
  }, [t, e.key, e.url, x, G, _, F]), K = o(async () => {
    A("revoking");
    try {
      await el(t, e.key), A("idle"), n();
    } catch {
      A("idle");
    }
  }, [t, e.key, n]);
  return s.createElement(
    c,
    {
      title: `${e.name || e.key} — OAuth 授权管理`,
      open: l,
      onCancel: a,
      footer: s.createElement("div", { style: { textAlign: "right" } }, s.createElement(f, { onClick: a }, "关闭")),
      width: 560
    },
    s.createElement(
      "div",
      { style: { background: "#f8f9fa", border: "1px solid #e9ecef", borderRadius: 8, padding: "12px 14px" } },
      // Status
      s.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 8 } },
        s.createElement(
          "span",
          { style: { fontSize: 12, padding: "2px 8px", borderRadius: 12, border: "1px solid", color: g ? "#e67e22" : E ? "#27ae60" : "#7f8c8d", borderColor: g ? "#e67e22" : E ? "#27ae60" : "#7f8c8d", background: "white" } },
          g ? "已过期" : E ? "已授权" : y === "waiting" ? "等待授权..." : y === "error" ? "授权失败" : "未授权"
        ),
        s.createElement(
          "div",
          { style: { display: "flex", gap: 8 } },
          E || g ? s.createElement(f, { size: "small", onClick: K, loading: String(y) === "revoking" }, "撤销") : null,
          s.createElement(f, { size: "small", type: E && !g ? "default" : "primary", onClick: M, loading: y === "starting" || y === "waiting", disabled: !((u = e.url) != null && u.trim()) }, E && !g ? "重新授权" : "授权")
        )
      ),
      L ? s.createElement("p", { style: { color: "#c0392b", fontSize: 12 } }, L) : null,
      // Advanced
      s.createElement(
        "div",
        { style: { marginTop: 8, cursor: "pointer", color: "#888", fontSize: 12 }, onClick: () => te((O) => !O) },
        N ? "收起高级设置" : "展开高级设置"
      ),
      N ? s.createElement(
        "div",
        { style: { marginTop: 8, padding: "10px 12px", background: "white", borderRadius: 6, border: "1px solid #e9ecef" } },
        s.createElement(h, { style: { fontSize: 11, color: "#888", display: "block", marginBottom: 2 } }, "Client ID"),
        s.createElement(b, { size: "small", placeholder: "留空则使用动态注册", value: G, onChange: (O) => H(O.target.value) }),
        s.createElement(h, { style: { fontSize: 11, color: "#888", display: "block", marginBottom: 2, marginTop: 8 } }, "Scope"),
        s.createElement(b, { size: "small", placeholder: "OAuth scope", value: x, onChange: (O) => C(O.target.value) }),
        s.createElement(h, { style: { fontSize: 11, color: "#888", display: "block", marginBottom: 2, marginTop: 8 } }, "授权端点"),
        s.createElement(b, { size: "small", placeholder: "https://auth.example.com/authorize", value: _, onChange: (O) => J(O.target.value) }),
        s.createElement(h, { style: { fontSize: 11, color: "#888", display: "block", marginBottom: 2, marginTop: 8 } }, "令牌端点"),
        s.createElement(b, { size: "small", placeholder: "https://auth.example.com/token", value: F, onChange: (O) => I(O.target.value) })
      ) : null
    )
  );
}
function Kl({
  mcp: e,
  agentId: t,
  onToggle: l,
  onDelete: a,
  onUpdate: n,
  onUpdatePolicy: s,
  onRefresh: r
}) {
  const o = z().React, { useState: d } = o, { Card: c, Tag: f, Tooltip: b, Modal: k, Input: S, Button: h, Typography: y } = z().antd, { Text: A } = y, {
    EyeOutlined: L,
    EyeInvisibleOutlined: U,
    DeleteOutlined: N,
    ToolOutlined: te
  } = z().antdIcons || {}, [G, H] = d(!1), [x, C] = d(!1), [_, J] = d(!1), [F, I] = d(""), [E, g] = d(!1), [M, K] = d(!1), Q = e.transport === "streamable_http" || e.transport === "sse", le = Q ? "Remote" : "Local", $ = e.oauth_status, p = Date.now() / 1e3, u = !!($ != null && $.authorized) && $.expires_at > p, O = !!($ != null && $.authorized) && $.expires_at <= p, ne = !!$, R = () => {
    I(JSON.stringify(e, null, 2)), g(!1), H(!0);
  }, V = async () => {
    try {
      const w = JSON.parse(F), W = [
        "name",
        "description",
        "command",
        "enabled",
        "transport",
        "url",
        "headers",
        "args",
        "env",
        "cwd"
      ], re = {};
      for (const Z of W)
        Z in w && (re[Z] = w[Z]);
      await n(e.key, re) && (H(!1), g(!1));
    } catch {
      alert("JSON 格式错误");
    }
  }, se = JSON.stringify(e, null, 2);
  return o.createElement(
    o.Fragment,
    null,
    o.createElement(
      c,
      {
        hoverable: !0,
        onClick: R,
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
        styles: {
          body: {
            display: "flex",
            flexDirection: "column",
            height: "100%",
            flex: 1
          }
        }
      },
      // ── Header: name + type badge + oauth icons + status ──
      o.createElement(
        "div",
        { style: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 } },
        o.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 6, minWidth: 0 } },
          o.createElement(
            b,
            { title: e.name },
            o.createElement(A, { strong: !0, style: { fontSize: 14, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" } }, e.name || e.key)
          ),
          o.createElement(
            "span",
            { style: { fontSize: 10, padding: "1px 6px", borderRadius: 4, background: Q ? "#e6f4ff" : "#f9f0ff", color: Q ? "#1677ff" : "#722ed1", flexShrink: 0 } },
            le
          ),
          // OAuth status icons
          ne && O ? o.createElement("span", { style: { fontSize: 11, color: "#e67e22", flexShrink: 0 } }, "⚠") : null,
          ne && u ? o.createElement("span", { style: { fontSize: 11, color: "#27ae60", flexShrink: 0 } }, "✓") : null,
          ne && !u && !O ? o.createElement("span", { style: { fontSize: 11, color: "#7f8c8d", flexShrink: 0 } }, "🔒") : null
        ),
        o.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 4, fontSize: 11, flexShrink: 0 } },
          o.createElement("span", { style: { width: 6, height: 6, borderRadius: "50%", background: e.enabled ? "#52c41a" : "#d9d9d9" } }),
          e.enabled ? "启用" : "停用"
        )
      ),
      // ── Description ──
      o.createElement(
        "p",
        { style: { fontSize: 12, color: "#666", margin: "6px 0 8px", lineHeight: 1.6, minHeight: 36, overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" } },
        e.description || "-"
      ),
      // ── Footer: tools button + secondary actions ──
      o.createElement(
        "div",
        { style: { display: "flex", flexDirection: "column", gap: 8, marginTop: "auto", paddingTop: 12, borderTop: "1px solid #f0f0f0" } },
        // Tools button
        o.createElement(
          h,
          {
            size: "small",
            icon: te ? o.createElement(te) : void 0,
            onClick: (w) => {
              w.stopPropagation(), J(!0);
            },
            style: { width: "100%" }
          },
          "工具与访问策略"
        ),
        // Secondary actions: oauth (remote only) + toggle + delete
        o.createElement(
          "div",
          { style: { display: "grid", gridTemplateColumns: Q ? "1fr 1fr 1fr" : "1fr 1fr", gap: 8 } },
          Q ? o.createElement(
            h,
            {
              size: "small",
              onClick: (w) => {
                w.stopPropagation(), K(!0);
              },
              style: {
                color: u ? "#27ae60" : O ? "#e67e22" : void 0,
                borderColor: u ? "#27ae60" : O ? "#e67e22" : void 0,
                background: u ? "rgba(39,174,96,0.06)" : O ? "rgba(230,126,34,0.06)" : void 0
              }
            },
            u ? "已授权" : O ? "已过期" : "授权"
          ) : null,
          o.createElement(
            h,
            {
              size: "small",
              icon: e.enabled ? U ? o.createElement(U) : void 0 : L ? o.createElement(L) : void 0,
              onClick: l
            },
            e.enabled ? "禁用" : "启用"
          ),
          o.createElement(
            h,
            {
              size: "small",
              danger: !0,
              icon: N ? o.createElement(N) : void 0,
              onClick: (w) => {
                w.stopPropagation(), C(!0);
              }
            },
            "删除"
          )
        )
      )
    ),
    // ── Delete Confirmation Modal ──
    o.createElement(
      k,
      {
        title: "确认删除",
        open: x,
        onOk: () => {
          C(!1), a();
        },
        onCancel: () => C(!1),
        okText: "确认删除",
        cancelText: "取消",
        okButtonProps: { danger: !0 }
      },
      o.createElement("p", null, `确定要删除 MCP 客户端「${e.name || e.key}」吗？此操作不可撤销。`)
    ),
    // ── JSON Config Modal (click card to view/edit) ──
    o.createElement(
      k,
      {
        title: `${e.name || e.key} - 配置`,
        open: G,
        onCancel: () => {
          H(!1), g(!1);
        },
        footer: o.createElement(
          "div",
          { style: { textAlign: "right" } },
          o.createElement(h, { onClick: () => {
            H(!1), g(!1);
          }, style: { marginRight: 8 } }, "取消"),
          E ? o.createElement(h, { type: "primary", onClick: V }, "保存") : o.createElement(h, { type: "primary", onClick: () => g(!0) }, "编辑")
        ),
        width: 700
      },
      o.createElement(
        "div",
        { style: { marginBottom: 8, fontSize: 12, color: "#8c8c8c" } },
        "密钥类字段（如 API_KEY）可能已被后端脱敏，保存时不会覆盖脱敏值。"
      ),
      E ? o.createElement(S.TextArea, {
        value: F,
        onChange: (w) => I(w.target.value),
        autoSize: { minRows: 15, maxRows: 25 },
        style: { fontFamily: "Monaco, Courier New, monospace", fontSize: 13 }
      }) : o.createElement(
        "pre",
        { style: { backgroundColor: "#f5f5f5", padding: 16, borderRadius: 8, maxHeight: 400, overflow: "auto", fontSize: 13, fontFamily: "Monaco, Courier New, monospace" } },
        se
      )
    ),
    // ── Access Modal (tools + access policy) ──
    o.createElement(Wl, {
      client: e,
      agentId: t,
      open: _,
      onClose: () => J(!1),
      onSave: s
    }),
    // ── OAuth Modal (remote clients only) ──
    Q ? o.createElement(Jl, {
      client: e,
      agentId: t,
      open: M,
      onClose: () => K(!1),
      onAuthChanged: async () => {
        await (r == null ? void 0 : r());
      }
    }) : null
  );
}
const Rt = {
  reservoir_simulation: "油藏数值模拟",
  geological_modeling: "地质建模",
  well_log_analysis: "测井分析",
  production_engineering: "采油工程",
  post_processing: "后处理与可视化",
  multiphysics: "多物理场仿真"
}, aa = {
  reservoir_simulation: "🛢️",
  geological_modeling: "🏔️",
  well_log_analysis: "📡",
  production_engineering: "⚙️",
  post_processing: "📊",
  multiphysics: "🔬"
}, la = /* @__PURE__ */ new Set(["cmg", "comsol", "tnavigator", "eclipse", "intersect", "visage"]);
function sa(e) {
  return Qe(`/ugsci/engines/icon/${encodeURIComponent(e)}`);
}
async function Xl() {
  return ce("/ugsci/engines/list");
}
async function ql(e) {
  return ce("/ugsci/engines/", {
    method: "POST",
    body: JSON.stringify(e)
  });
}
async function Vl(e, t) {
  return ce(`/ugsci/engines/${encodeURIComponent(e)}`, {
    method: "PUT",
    body: JSON.stringify(t)
  });
}
async function Yl(e) {
  return ce(
    `/ugsci/engines/${encodeURIComponent(e)}`,
    { method: "DELETE" }
  );
}
async function Ql() {
  return ce("/ugsci/engines/detect/refresh", {
    method: "POST"
  });
}
function Zl({
  engine: e,
  onClick: t
}) {
  const l = z().React, { Card: a, Tag: n, Typography: s } = z().antd, { Text: r } = s, o = e.status === "detected", d = aa[e.category] || "📦", f = la.has(e.id) ? l.createElement("img", {
    src: sa(e.id),
    alt: e.name,
    style: { width: 24, height: 24, objectFit: "contain" }
  }) : l.createElement("span", { style: { fontSize: 20 } }, d);
  return l.createElement(
    a,
    {
      hoverable: !0,
      onClick: t,
      size: "small",
      style: {
        cursor: "pointer",
        borderColor: o ? void 0 : "#d9d9d9",
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column"
      },
      styles: {
        body: {
          display: "flex",
          flexDirection: "column",
          height: "100%",
          flex: 1
        }
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
        f,
        l.createElement(
          "div",
          null,
          l.createElement(
            r,
            { strong: !0, style: { fontSize: 14 } },
            e.name
          ),
          l.createElement("br"),
          l.createElement(
            r,
            { type: "secondary", style: { fontSize: 11 } },
            e.vendor || "—"
          )
        )
      ),
      l.createElement(
        "div",
        { style: { display: "flex", flexDirection: "column", gap: 4, alignItems: "flex-end" } },
        o ? l.createElement(
          n,
          { color: "success", style: { fontSize: 11 } },
          "✅ 已检测"
        ) : e.executable_path ? l.createElement(
          n,
          { color: "warning", style: { fontSize: 11 } },
          "⚠ 路径无效"
        ) : l.createElement(
          n,
          { style: { fontSize: 11 } },
          "🔧 待配置"
        ),
        e.is_default ? l.createElement(
          n,
          { color: "blue", style: { fontSize: 10 } },
          "默认"
        ) : e.is_custom ? l.createElement(
          n,
          { color: "purple", style: { fontSize: 10 } },
          "自定义"
        ) : null
      )
    ),
    l.createElement(
      "div",
      { style: { flex: 1, minHeight: 32 } },
      l.createElement(
        r,
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
        n,
        { style: { fontSize: 11 } },
        Rt[e.category] || e.category
      ) : null,
      e.version ? l.createElement(
        n,
        { color: "blue", style: { fontSize: 11 } },
        `v${e.version}`
      ) : null,
      ...(e.modules || []).map(
        (b) => l.createElement(
          n,
          { key: b, color: "cyan", style: { fontSize: 10 } },
          b
        )
      )
    )
  );
}
function es() {
  const e = z().React, { useState: t, useEffect: l, useCallback: a, useMemo: n } = e, {
    Spin: s,
    Empty: r,
    Button: o,
    message: d,
    Row: c,
    Col: f,
    Drawer: b,
    Descriptions: k,
    Tag: S,
    Typography: h,
    Modal: y,
    Input: A,
    Select: L,
    Popconfirm: U,
    Space: N
  } = z().antd, {
    ReloadOutlined: te,
    SearchOutlined: G,
    PlusOutlined: H,
    EditOutlined: x,
    DeleteOutlined: C,
    CopyOutlined: _,
    ExperimentOutlined: J
  } = z().antdIcons || {}, { Text: F, Paragraph: I } = h, [E, g] = t([]), [M, K] = t(!0), [Q, le] = t(""), [$, p] = t(!1), [u, O] = t(null), [ne, R] = t(!1), [V, se] = t(null), [w, W] = t({}), [re, v] = t(!1), Z = a(async () => {
    K(!0);
    try {
      const ae = await Xl();
      g(ae.engines || []);
    } catch (ae) {
      d.error(ae.message || "加载引擎列表失败"), g([]);
    } finally {
      K(!1);
    }
  }, []);
  l(() => {
    Z();
  }, [Z]);
  const m = n(() => {
    if (!Q.trim()) return E;
    const ae = Q.toLowerCase();
    return E.filter(
      (D) => {
        var T;
        return D.name.toLowerCase().includes(ae) || D.vendor.toLowerCase().includes(ae) || D.category.toLowerCase().includes(ae) || ((T = D.description) == null ? void 0 : T.toLowerCase().includes(ae));
      }
    );
  }, [E, Q]);
  E.filter((ae) => ae.status === "detected").length;
  const Y = a((ae) => {
    navigator.clipboard.writeText(ae).then(() => d.success("路径已复制")).catch(() => d.error("复制失败"));
  }, []), B = a(() => {
    se(null), W({
      name: "",
      vendor: "",
      version: "",
      executable_path: "",
      category: "",
      description: "",
      invocation_hint: ""
    }), R(!0);
  }, []), oe = a((ae) => {
    se(ae), W({ ...ae }), R(!0), p(!1);
  }, []), de = a(async () => {
    var ae;
    if (!((ae = w.name) != null && ae.trim())) {
      d.warning("请输入引擎名称");
      return;
    }
    v(!0);
    try {
      V ? (await Vl(V.id, w), d.success("引擎已更新")) : (await ql(w), d.success("引擎已添加")), R(!1), Z();
    } catch (D) {
      d.error(D.message || "保存失败");
    } finally {
      v(!1);
    }
  }, [w, V, Z]), Ee = a(
    async (ae) => {
      try {
        await Yl(ae), d.success("引擎已删除"), p(!1), Z();
      } catch (D) {
        d.error(D.message || "删除失败");
      }
    },
    [Z]
  ), ye = a(async () => {
    K(!0);
    try {
      const ae = await Ql();
      g(ae.engines || []), d.success("自动检测完成");
    } catch (ae) {
      d.error(ae.message || "检测失败");
    } finally {
      K(!1);
    }
  }, []), pe = a(
    (ae, D, T) => {
      const X = w[D] || "";
      return e.createElement(
        "div",
        { style: { marginBottom: 12 } },
        e.createElement(
          F,
          { style: { fontSize: 13, display: "block", marginBottom: 4 } },
          ae
        ),
        T != null && T.select ? e.createElement(L, {
          value: X || void 0,
          onChange: (ie) => W((q) => ({ ...q, [D]: ie })),
          style: { width: "100%" },
          options: T.select.options,
          allowClear: !0,
          placeholder: `选择${ae}`
        }) : T != null && T.textarea ? e.createElement(A.TextArea, {
          value: X,
          onChange: (ie) => W((q) => ({ ...q, [D]: ie.target.value })),
          rows: 3,
          placeholder: `输入${ae}`
        }) : e.createElement(A, {
          value: X,
          onChange: (ie) => W((q) => ({ ...q, [D]: ie.target.value })),
          placeholder: `输入${ae}`
        })
      );
    },
    [w]
  );
  return e.createElement(
    "div",
    null,
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
        prefix: G ? e.createElement(G) : void 0,
        value: Q,
        onChange: (ae) => le(ae.target.value),
        allowClear: !0,
        style: { maxWidth: 280 }
      }),
      e.createElement(
        o,
        {
          icon: te ? e.createElement(te) : void 0,
          onClick: ye,
          loading: M
        },
        "自动检测"
      ),
      e.createElement(
        o,
        {
          type: "primary",
          icon: H ? e.createElement(H) : void 0,
          onClick: B,
          style: Oe
        },
        "添加引擎"
      )
    ),
    // Content
    M ? e.createElement(
      "div",
      { style: { textAlign: "center", padding: 60 } },
      e.createElement(s, {
        size: "large",
        tip: "正在加载计算引擎..."
      })
    ) : m.length === 0 ? e.createElement(r, {
      description: Q ? "无匹配引擎" : "暂无引擎，点击「添加引擎」开始"
    }) : e.createElement(
      c,
      { gutter: [12, 12], align: "stretch" },
      ...m.map(
        (ae) => e.createElement(
          f,
          {
            key: ae.id,
            xs: 24,
            sm: 12,
            md: 8,
            lg: 6,
            style: { display: "flex" }
          },
          e.createElement(Zl, {
            engine: ae,
            onClick: () => {
              O(ae), p(!0);
            }
          })
        )
      )
    ),
    // Detail drawer
    u ? e.createElement(
      b,
      {
        title: e.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 8 } },
          e.createElement(
            "span",
            { style: { display: "flex", alignItems: "center" } },
            la.has(u.id) ? e.createElement("img", {
              src: sa(u.id),
              alt: u.name,
              style: { width: 20, height: 20, objectFit: "contain" }
            }) : e.createElement(
              "span",
              { style: { fontSize: 18 } },
              aa[u.category] || "📦"
            )
          ),
          e.createElement("span", null, u.name)
        ),
        open: $,
        onClose: () => p(!1),
        width: 520,
        extra: e.createElement(
          N,
          null,
          e.createElement(
            o,
            {
              size: "small",
              icon: x ? e.createElement(x) : void 0,
              onClick: () => oe(u)
            },
            "编辑"
          ),
          u.is_default ? null : e.createElement(
            U,
            {
              title: "确认删除此引擎？",
              description: u.name,
              onConfirm: () => Ee(u.id),
              okText: "删除",
              cancelText: "取消",
              okButtonProps: { danger: !0 }
            },
            e.createElement(
              o,
              {
                size: "small",
                danger: !0,
                icon: C ? e.createElement(C) : void 0
              },
              "删除"
            )
          )
        )
      },
      e.createElement(
        k,
        { column: 1, bordered: !0, size: "small" },
        e.createElement(
          k.Item,
          { label: "引擎名称" },
          u.name
        ),
        e.createElement(
          k.Item,
          { label: "厂商" },
          u.vendor || "—"
        ),
        e.createElement(
          k.Item,
          { label: "分类" },
          u.category ? Rt[u.category] || u.category : "—"
        ),
        e.createElement(
          k.Item,
          { label: "状态" },
          e.createElement(
            S,
            {
              color: u.status === "detected" ? "success" : u.status === "not_found" ? "error" : "default"
            },
            u.status === "detected" ? "✅ 已检测" : u.status === "not_found" ? "❌ 路径无效" : "🔧 待配置"
          )
        ),
        e.createElement(
          k.Item,
          { label: "版本" },
          u.version || "—"
        ),
        u.executable_path ? e.createElement(
          k.Item,
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
              u.executable_path
            ),
            e.createElement(
              o,
              {
                size: "small",
                type: "text",
                icon: _ ? e.createElement(_) : void 0,
                onClick: () => Y(u.executable_path)
              }
            )
          )
        ) : null,
        u.install_dir ? e.createElement(
          k.Item,
          { label: "安装目录" },
          e.createElement(
            "code",
            { style: { fontSize: 12, wordBreak: "break-all" } },
            u.install_dir
          )
        ) : null,
        // Display detected modules with paths
        u.modules && u.modules.length > 0 ? e.createElement(
          k.Item,
          { label: "已检测模块" },
          e.createElement(
            "div",
            { style: { display: "flex", flexDirection: "column", gap: 4 } },
            ...u.modules.map(
              (ae) => e.createElement(
                "div",
                {
                  key: ae,
                  style: { display: "flex", alignItems: "center", gap: 8 }
                },
                e.createElement(
                  S,
                  { color: "cyan", style: { fontSize: 11 } },
                  ae
                ),
                u.module_paths && u.module_paths[ae] ? e.createElement(
                  "code",
                  { style: { fontSize: 11, wordBreak: "break-all" } },
                  u.module_paths[ae]
                ) : null
              )
            )
          )
        ) : null,
        u.license_server ? e.createElement(
          k.Item,
          { label: "许可证服务器" },
          u.license_server
        ) : null,
        e.createElement(
          k.Item,
          { label: "描述" },
          u.description || "—"
        )
      ),
      // Invocation hint
      u.invocation_hint ? e.createElement(
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
          F,
          { strong: !0, style: { fontSize: 13 } },
          "💡 调用方式"
        ),
        e.createElement(
          "div",
          { style: { marginTop: 8, fontSize: 13, lineHeight: 1.6 } },
          u.invocation_hint
        )
      ) : null,
      // Type badge
      e.createElement(
        "div",
        { style: { marginTop: 12 } },
        u.is_default ? e.createElement(
          S,
          { color: "blue" },
          "默认引擎"
        ) : u.is_custom ? e.createElement(
          S,
          { color: "purple" },
          "自定义引擎"
        ) : null
      )
    ) : null,
    // Add/Edit modal
    e.createElement(
      y,
      {
        title: V ? "编辑引擎" : "添加计算引擎",
        open: ne,
        onOk: de,
        onCancel: () => R(!1),
        okText: V ? "保存" : "添加",
        cancelText: "取消",
        confirmLoading: re,
        width: 560
      },
      e.createElement(
        "div",
        { style: { maxHeight: 480, overflow: "auto", paddingRight: 8 } },
        pe("引擎名称 *", "name"),
        pe("厂商", "vendor"),
        pe("版本", "version"),
        pe("可执行文件路径", "executable_path"),
        pe("安装目录", "install_dir"),
        pe("分类", "category", {
          select: {
            options: Object.entries(Rt).map(([ae, D]) => ({
              label: D,
              value: ae
            }))
          }
        }),
        pe("描述", "description", { textarea: !0 }),
        pe("调用方式提示", "invocation_hint", { textarea: !0 }),
        pe("许可证服务器", "license_server")
      )
    )
  );
}
function ts() {
  const e = z().React, { useState: t, useEffect: l, useCallback: a, useMemo: n } = e, {
    Spin: s,
    Empty: r,
    Input: o,
    Button: d,
    message: c,
    Row: f,
    Col: b,
    Tabs: k,
    Modal: S
  } = z().antd, {
    ReloadOutlined: h,
    PlusOutlined: y,
    SearchOutlined: A,
    ApiOutlined: L,
    RocketOutlined: U
  } = z().antdIcons || {}, { TextArea: N } = o, G = z().useSelectedAgent, H = G ? G() : null, x = (H == null ? void 0 : H.id) || "default", [C, _] = t([]), [J, F] = t(!0), [I, E] = t(""), [g, M] = t("mcp"), [K, Q] = t(!1), [le, $] = t(`{
  "mcpServers": {
    "example-client": {
      "command": "npx",
      "args": ["-y", "@example/mcp-server"],
      "env": {}
    }
  }
}`), [p, u] = t(!1), O = a(async () => {
    F(!0);
    try {
      const m = await Ga(x);
      _(m);
    } catch (m) {
      c.error(m.message || "加载 MCP 列表失败"), _([]);
    } finally {
      F(!1);
    }
  }, [x]);
  l(() => {
    O();
  }, [O]);
  const ne = a(
    async (m) => {
      try {
        await Ha(x, m.key), c.success(m.enabled ? "已禁用" : "已启用"), O();
      } catch (Y) {
        c.error(Y.message || "切换状态失败");
      }
    },
    [x, O]
  ), R = a(async (m) => {
    try {
      await Wa(x, m.key), c.success(`MCP「${m.key}」已删除`), O();
    } catch (Y) {
      c.error(Y.message || "删除失败");
    }
  }, [x, O]), V = a(async () => {
    u(!0);
    try {
      const m = JSON.parse(le), Y = m.mcpServers || m, B = Object.entries(Y);
      if (B.length === 0) {
        c.warning("未找到 MCP 客户端配置");
        return;
      }
      let oe = !0;
      for (const [de, Ee] of B) {
        const ye = Ee, pe = ye.url ? "streamable_http" : "stdio", ae = {
          name: ye.name || de,
          description: ye.description || "",
          enabled: !0,
          transport: pe,
          url: ye.url || "",
          command: ye.command || "",
          args: ye.args || [],
          env: ye.env || {},
          cwd: ye.cwd || "",
          headers: ye.headers || {}
        };
        try {
          await Ja(
            x,
            de,
            ae
          );
        } catch {
          oe = !1;
        }
      }
      oe && (c.success("MCP 客户端已创建"), Q(!1), O());
    } catch (m) {
      m instanceof SyntaxError ? c.error("JSON 格式错误：" + m.message) : c.error(m.message || "创建 MCP 失败");
    } finally {
      u(!1);
    }
  }, [le, x, O]), se = n(() => {
    if (!I.trim()) return C;
    const m = I.toLowerCase();
    return C.filter(
      (Y) => {
        var B;
        return Y.name.toLowerCase().includes(m) || Y.key.toLowerCase().includes(m) || ((B = Y.description) == null ? void 0 : B.toLowerCase().includes(m)) || Y.transport.toLowerCase().includes(m);
      }
    );
  }, [C, I]), w = C.filter((m) => m.enabled).length, W = C.reduce((m, Y) => {
    var B;
    return m + (((B = Y.tools) == null ? void 0 : B.length) || 0);
  }, 0), re = (m) => {
    window.history.pushState({}, "", m), window.dispatchEvent(new PopStateEvent("popstate"));
  }, v = e.createElement(
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
      e.createElement(o, {
        placeholder: "搜索能力名称、描述...",
        prefix: A ? e.createElement(A) : void 0,
        value: I,
        onChange: (m) => E(m.target.value),
        allowClear: !0,
        style: { maxWidth: 400 }
      }),
      e.createElement(
        d,
        {
          type: "primary",
          icon: y ? e.createElement(y) : void 0,
          onClick: () => Q(!0),
          style: Oe
        },
        "添加 MCP"
      ),
      e.createElement(
        d,
        {
          icon: L ? e.createElement(L) : void 0,
          onClick: () => re("/mcp")
        },
        "前往 MCP 管理"
      )
    ),
    J ? e.createElement(
      "div",
      { style: { textAlign: "center", padding: 60 } },
      e.createElement(s, { size: "large" })
    ) : se.length === 0 ? e.createElement(r, {
      description: I ? "未找到匹配的能力" : "暂无 MCP 客户端，点击「添加 MCP」创建"
    }) : e.createElement(
      f,
      { gutter: [12, 12], align: "stretch" },
      ...se.map(
        (m) => e.createElement(
          b,
          {
            key: m.key,
            xs: 24,
            sm: 12,
            md: 8,
            lg: 6,
            style: { display: "flex" }
          },
          e.createElement(Kl, {
            mcp: m,
            agentId: x,
            onToggle: (Y) => {
              Y.stopPropagation(), ne(m);
            },
            onDelete: () => {
              R(m);
            },
            onUpdate: async (Y, B) => {
              try {
                return await Ka(x, Y, B), c.success("MCP 配置已更新"), O(), !0;
              } catch (oe) {
                return c.error(oe.message || "更新 MCP 失败"), !1;
              }
            },
            onUpdatePolicy: async (Y, B) => {
              try {
                return await Va(x, Y, B), c.success("访问策略已保存"), O(), !0;
              } catch (oe) {
                return c.error(oe.message || "保存访问策略失败"), !1;
              }
            },
            onRefresh: async () => {
              O();
            }
          })
        )
      )
    )
  ), Z = [
    {
      key: "mcp",
      label: e.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        L ? e.createElement(L, { style: { fontSize: 14 } }) : null,
        "MCP 客户端"
      ),
      children: v
    },
    {
      key: "software",
      label: e.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        U ? e.createElement(U, { style: { fontSize: 14 } }) : null,
        "计算引擎"
      ),
      children: e.createElement(es)
    }
  ];
  return e.createElement(
    "div",
    { style: { padding: 24 } },
    e.createElement(Ct, {
      title: "工具",
      subtitle: `MCP: ${C.length} 个客户端（${w} 个启用）· ${W} 个工具`,
      extra: e.createElement(
        e.Fragment,
        null,
        e.createElement(
          d,
          {
            icon: h ? e.createElement(h) : void 0,
            onClick: () => {
              Ze(), O();
            },
            loading: J
          },
          "刷新"
        )
      )
    }),
    e.createElement(k, {
      items: Z,
      activeKey: g,
      onChange: (m) => M(m)
    }),
    // ── Create MCP Modal (mirror console /mcp JSON import) ──
    e.createElement(
      S,
      {
        title: "添加 MCP 客户端 (JSON)",
        open: K,
        onCancel: () => Q(!1),
        onOk: V,
        confirmLoading: p,
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
      e.createElement(N, {
        value: le,
        onChange: (m) => $(m.target.value),
        autoSize: { minRows: 12, maxRows: 20 },
        style: { fontFamily: "Monaco, Courier New, monospace", fontSize: 13 }
      })
    )
  );
}
function ns({
  agentId: e,
  agentName: t,
  onNavigate: l
}) {
  const a = z().React, { useState: n, useEffect: s, useCallback: r } = a, {
    Spin: o,
    Empty: d,
    Button: c,
    Row: f,
    Col: b,
    Card: k,
    Tag: S,
    Checkbox: h,
    Modal: y,
    Typography: A,
    Drawer: L,
    Descriptions: U,
    message: N
  } = z().antd, {
    ReloadOutlined: te,
    ThunderboltOutlined: G,
    SettingOutlined: H,
    CheckSquareOutlined: x,
    EyeOutlined: C,
    EyeInvisibleOutlined: _,
    DeleteOutlined: J,
    CloseOutlined: F
  } = z().antdIcons || {}, { Text: I, Paragraph: E } = A, [g, M] = n([]), [K, Q] = n(!0), [le, $] = n(!1), [p, u] = n(null), [O, ne] = n(!1), [R, V] = n(
    /* @__PURE__ */ new Set()
  ), [se, w] = n(!1), [W, re] = n(null), [v, Z] = n(!1), m = r(async () => {
    if (e) {
      Q(!0);
      try {
        const T = await wt(e);
        M(T);
      } catch (T) {
        N.error(T.message || "加载技能失败"), M([]);
      } finally {
        Q(!1);
      }
    }
  }, [e]);
  s(() => {
    m();
  }, [m]);
  const Y = (T) => {
    V((X) => {
      const ie = new Set(X);
      return ie.has(T) ? ie.delete(T) : ie.add(T), ie;
    });
  }, B = () => V(/* @__PURE__ */ new Set()), oe = () => V(new Set(g.map((T) => T.name))), de = () => {
    O ? (B(), ne(!1)) : ne(!0);
  }, Ee = async () => {
    const T = Array.from(R);
    if (T.length !== 0) {
      w(!0);
      try {
        const { results: X } = await rl(e, T), ie = Object.entries(X).filter(
          ([, ue]) => ue.success === !1
        ), q = T.length - ie.length;
        ie.length > 0 ? N.warning(
          `批量启用完成：成功 ${q} 个，失败 ${ie.length} 个`
        ) : N.success(`成功启用 ${T.length} 个技能`), B(), await m();
      } catch (X) {
        N.error(X.message || "批量启用失败");
      } finally {
        w(!1);
      }
    }
  }, ye = async () => {
    const T = Array.from(R);
    if (T.length !== 0) {
      w(!0);
      try {
        const { results: X } = await il(e, T), ie = Object.entries(X).filter(
          ([, ue]) => ue.success === !1
        ), q = T.length - ie.length;
        ie.length > 0 ? N.warning(
          `批量停用完成：成功 ${q} 个，失败 ${ie.length} 个`
        ) : N.success(`成功停用 ${T.length} 个技能`), B(), await m();
      } catch (X) {
        N.error(X.message || "批量停用失败");
      } finally {
        w(!1);
      }
    }
  }, pe = () => {
    const T = Array.from(R);
    T.length !== 0 && y.confirm({
      title: `确认删除 ${T.length} 个技能？`,
      content: "删除后技能将从当前专家工作区移除，此操作不可撤销。技能池中的原始技能不受影响。",
      okText: "确认删除",
      cancelText: "取消",
      okButtonProps: { danger: !0 },
      onOk: async () => {
        w(!0);
        try {
          const { results: X } = await cl(e, T), ie = Object.entries(X).filter(
            ([, ue]) => ue.success === !1
          ), q = T.length - ie.length;
          ie.length > 0 ? N.warning(
            `批量删除完成：成功 ${q} 个，失败 ${ie.length} 个`
          ) : N.success(`成功删除 ${T.length} 个技能`), B(), await m();
        } catch (X) {
          N.error(X.message || "批量删除失败");
        } finally {
          w(!1);
        }
      }
    });
  }, ae = async (T) => {
    Z(!0);
    try {
      T.enabled === !1 ? (await Dn(e, T.name), N.success(`已启用技能「${T.name}」`)) : (await Hn(e, T.name), N.success(`已禁用技能「${T.name}」`)), await m();
    } catch (X) {
      N.error(X.message || "操作失败");
    } finally {
      Z(!1);
    }
  }, D = (T) => {
    y.confirm({
      title: `确认删除技能「${T.name}」？`,
      content: "删除后技能将从当前专家工作区移除，此操作不可撤销。技能池中的原始技能不受影响。",
      okText: "确认删除",
      cancelText: "取消",
      okButtonProps: { danger: !0 },
      onOk: async () => {
        Z(!0);
        try {
          await Ht(e, T.name), N.success(`已删除技能「${T.name}」`), await m();
        } catch (X) {
          N.error(X.message || "删除失败");
        } finally {
          Z(!1);
        }
      }
    });
  };
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
          marginBottom: 16,
          flexWrap: "wrap",
          gap: 8
        }
      },
      a.createElement(
        I,
        { type: "secondary", style: { fontSize: 13 } },
        O ? `已选择 ${R.size} / ${g.length} 个技能` : `共 ${g.length} 个技能`
      ),
      a.createElement(
        "div",
        { style: { display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" } },
        O ? a.createElement(
          a.Fragment,
          null,
          a.createElement(
            c,
            { size: "small", onClick: oe },
            "全选"
          ),
          a.createElement(
            c,
            {
              size: "small",
              icon: F ? a.createElement(F) : void 0,
              onClick: B
            },
            "取消选择"
          ),
          a.createElement(
            c,
            {
              size: "small",
              type: "default",
              icon: C ? a.createElement(C) : void 0,
              disabled: R.size === 0 || se,
              loading: se,
              onClick: Ee
            },
            "批量启用"
          ),
          a.createElement(
            c,
            {
              size: "small",
              danger: !0,
              icon: _ ? a.createElement(_) : void 0,
              disabled: R.size === 0 || se,
              loading: se,
              onClick: ye
            },
            "批量停用"
          ),
          a.createElement(
            c,
            {
              size: "small",
              danger: !0,
              icon: J ? a.createElement(J) : void 0,
              disabled: R.size === 0 || se,
              loading: se,
              onClick: pe
            },
            `删除 (${R.size})`
          ),
          a.createElement(
            c,
            {
              size: "small",
              type: "primary",
              onClick: de
            },
            "退出批量"
          )
        ) : a.createElement(
          a.Fragment,
          null,
          a.createElement(
            c,
            {
              size: "small",
              icon: x ? a.createElement(x) : void 0,
              onClick: de,
              disabled: g.length === 0
            },
            "批量管理"
          ),
          a.createElement(
            c,
            {
              icon: te ? a.createElement(te) : void 0,
              onClick: () => {
                Ze(), m();
              }
            },
            "刷新"
          )
        )
      )
    ),
    K ? a.createElement(
      "div",
      { style: { textAlign: "center", padding: 60 } },
      a.createElement(o, { size: "large" })
    ) : g.length === 0 ? a.createElement(d, {
      description: "当前智能体未加载任何技能"
    }) : a.createElement(
      f,
      { gutter: [12, 12] },
      ...g.map(
        (T) => a.createElement(
          b,
          { key: T.name, xs: 24, sm: 12, md: 8, lg: 6 },
          a.createElement(
            k,
            {
              hoverable: !0,
              size: "small",
              style: {
                cursor: O ? "default" : "pointer",
                height: "100%",
                position: "relative",
                borderColor: O && R.has(T.name) ? "#0072f5" : void 0,
                borderWidth: O && R.has(T.name) ? 2 : 1
              },
              onClick: () => {
                O ? Y(T.name) : (u(T), $(!0));
              },
              onMouseEnter: () => {
                O || re(T.name);
              },
              onMouseLeave: () => re(null)
            },
            O ? a.createElement(
              "div",
              {
                style: {
                  position: "absolute",
                  top: 8,
                  right: 8,
                  zIndex: 1
                },
                onClick: (X) => {
                  X.stopPropagation(), Y(T.name);
                }
              },
              a.createElement(h, {
                checked: R.has(T.name)
              })
            ) : null,
            a.createElement(
              "div",
              {
                style: {
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 8
                }
              },
              T.emoji ? a.createElement(
                "span",
                { style: { fontSize: 18 } },
                T.emoji
              ) : a.createElement(
                "span",
                { style: { fontSize: 18 } },
                "⚡"
              ),
              a.createElement(
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
                T.name
              ),
              T.enabled === !1 ? a.createElement(
                S,
                { color: "default", style: { fontSize: 10 } },
                "已禁用"
              ) : a.createElement(
                S,
                { color: "green", style: { fontSize: 10 } },
                "已启用"
              )
            ),
            T.description ? a.createElement(
              E,
              {
                type: "secondary",
                style: { fontSize: 11, margin: 0, lineHeight: 1.4 },
                ellipsis: { rows: 2 }
              },
              T.description
            ) : null,
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
              T.version_text ? a.createElement(
                S,
                { style: { fontSize: 10 } },
                `v${T.version_text}`
              ) : null,
              ...(T.tags || []).slice(0, 3).map(
                (X, ie) => a.createElement(
                  S,
                  { key: ie, color: "blue", style: { fontSize: 10 } },
                  X
                )
              )
            ),
            // Hover action footer (not in batch mode)
            !O && W === T.name ? a.createElement(
              "div",
              {
                style: {
                  marginTop: 8,
                  paddingTop: 8,
                  borderTop: "1px solid #f0f0f0",
                  display: "flex",
                  gap: 8,
                  justifyContent: "flex-end"
                }
              },
              a.createElement(
                c,
                {
                  size: "small",
                  type: "default",
                  icon: T.enabled === !1 ? C ? a.createElement(C) : void 0 : _ ? a.createElement(_) : void 0,
                  disabled: v,
                  onClick: (X) => {
                    X.stopPropagation(), ae(T);
                  }
                },
                T.enabled === !1 ? "启用" : "禁用"
              ),
              a.createElement(
                c,
                {
                  size: "small",
                  danger: !0,
                  icon: J ? a.createElement(J) : void 0,
                  disabled: v,
                  onClick: (X) => {
                    X.stopPropagation(), D(T);
                  }
                },
                "删除"
              )
            ) : null
          )
        )
      )
    ),
    // Skill detail drawer
    p ? a.createElement(
      L,
      {
        title: a.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 8 } },
          a.createElement(
            "span",
            { style: { fontSize: 18 } },
            p.emoji || "⚡"
          ),
          a.createElement("span", null, p.name)
        ),
        open: le,
        onClose: () => $(!1),
        width: 520,
        extra: a.createElement(
          c,
          {
            type: "primary",
            size: "small",
            icon: H ? a.createElement(H) : void 0,
            onClick: () => l("/skills")
          },
          "管理技能"
        )
      },
      a.createElement(
        U,
        { column: 1, bordered: !0, size: "small" },
        a.createElement(
          U.Item,
          { label: "技能名称" },
          p.name
        ),
        a.createElement(
          U.Item,
          { label: "描述" },
          p.description || "-"
        ),
        p.version_text ? a.createElement(
          U.Item,
          { label: "版本" },
          p.version_text
        ) : null,
        a.createElement(
          U.Item,
          { label: "来源" },
          p.source || "-"
        ),
        a.createElement(
          U.Item,
          { label: "状态" },
          p.enabled === !1 ? "已禁用" : "已启用"
        ),
        p.installed_from ? a.createElement(
          U.Item,
          { label: "安装来源" },
          p.installed_from
        ) : null
      ),
      // Tags
      p.tags && p.tags.length > 0 ? a.createElement(
        "div",
        { style: { marginTop: 16 } },
        a.createElement(
          I,
          {
            strong: !0,
            style: { display: "block", marginBottom: 8 }
          },
          "标签"
        ),
        a.createElement(
          "div",
          { style: { display: "flex", flexWrap: "wrap", gap: 4 } },
          ...p.tags.map(
            (T, X) => a.createElement(S, { key: X, color: "blue" }, T)
          )
        )
      ) : null,
      // Skill content preview
      p.content ? a.createElement(
        "div",
        { style: { marginTop: 16 } },
        a.createElement(
          I,
          {
            strong: !0,
            style: { display: "block", marginBottom: 8 }
          },
          "技能内容"
        ),
        a.createElement(
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
function as({
  poolSkills: e,
  workspaceSkills: t,
  agents: l,
  loading: a,
  onReload: n,
  agentId: s,
  agentName: r
}) {
  const o = z().React, { useState: d, useMemo: c, useCallback: f } = o, {
    Spin: b,
    Empty: k,
    Input: S,
    Button: h,
    Row: y,
    Col: A,
    Card: L,
    Tag: U,
    Typography: N,
    Drawer: te,
    Descriptions: G,
    List: H,
    Modal: x,
    message: C
  } = z().antd, {
    ReloadOutlined: _,
    SearchOutlined: J,
    DownloadOutlined: F,
    ThunderboltOutlined: I,
    DeleteOutlined: E,
    PlusOutlined: g
  } = z().antdIcons || {}, { Text: M, Paragraph: K } = N, [Q, le] = d(""), [$, p] = d(!1), [u, O] = d(null), [ne, R] = d([]), [V, se] = d(!1), [w, W] = d(24), [re, v] = d(null), [Z, m] = d(!1), Y = c(() => {
    if (!Q.trim()) return e;
    const D = Q.toLowerCase();
    return e.filter(
      (T) => {
        var X, ie;
        return T.name.toLowerCase().includes(D) || ((X = T.description) == null ? void 0 : X.toLowerCase().includes(D)) || ((ie = T.tags) == null ? void 0 : ie.some((q) => q.toLowerCase().includes(D)));
      }
    );
  }, [e, Q]), B = c(
    () => Y.slice(0, w),
    [Y, w]
  ), oe = f((D) => {
    le(D), W(24);
  }, []), de = f(
    (D) => {
      const T = [];
      for (const X of t)
        if (X.skills.some((ie) => ie.name === D)) {
          const ie = l.find((q) => q.id === X.agent_id);
          T.push((ie == null ? void 0 : ie.name) || X.agent_name || X.agent_id);
        }
      return T;
    },
    [t, l]
  ), Ee = f(
    async (D) => {
      if (O(D), R(de(D.name)), p(!0), !D.content) {
        se(!0);
        try {
          const T = await Da(D.name);
          O({ ...D, content: T });
        } catch {
        } finally {
          se(!1);
        }
      }
    },
    [de]
  ), ye = async (D) => {
    m(!0);
    try {
      await Gt(s, D.name), C.success(
        `已将技能「${D.name}」加载到当前专家「${r}」`
      ), n();
    } catch (T) {
      C.error(T.message || "加载技能失败");
    } finally {
      m(!1);
    }
  }, pe = (D) => {
    if (D.protected) {
      C.warning("内置技能不可删除");
      return;
    }
    x.confirm({
      title: `确认从技能池删除「${D.name}」？`,
      content: "删除后所有已安装此技能的专家将不受影响，但技能池中将不再包含此技能。此操作不可撤销。",
      okText: "确认删除",
      cancelText: "取消",
      okButtonProps: { danger: !0 },
      onOk: async () => {
        m(!0);
        try {
          await dl(D.name), C.success(`已从技能池删除「${D.name}」`), n();
        } catch (T) {
          C.error(T.message || "删除失败");
        } finally {
          m(!1);
        }
      }
    });
  }, ae = (D) => {
    window.history.pushState({}, "", D), window.dispatchEvent(new PopStateEvent("popstate"));
  };
  return o.createElement(
    "div",
    null,
    o.createElement(
      "div",
      {
        style: {
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16
        }
      },
      o.createElement(S, {
        placeholder: "搜索技能名称、描述或标签...",
        prefix: J ? o.createElement(J) : void 0,
        value: Q,
        onChange: (D) => oe(D.target.value),
        allowClear: !0,
        style: { maxWidth: 400 }
      }),
      o.createElement(
        "div",
        { style: { display: "flex", gap: 8 } },
        o.createElement(
          h,
          {
            icon: _ ? o.createElement(_) : void 0,
            onClick: n,
            loading: a,
            size: "small"
          },
          "刷新"
        ),
        o.createElement(
          h,
          {
            type: "primary",
            icon: F ? o.createElement(F) : void 0,
            onClick: () => ae("/skill-pool"),
            size: "small",
            style: Oe
          },
          "管理技能池"
        )
      )
    ),
    a ? o.createElement(
      "div",
      { style: { textAlign: "center", padding: 60 } },
      o.createElement(b, { size: "large" })
    ) : Y.length === 0 ? o.createElement(k, {
      description: Q ? "未找到匹配的技能" : "技能池为空"
    }) : o.createElement(
      o.Fragment,
      null,
      o.createElement(
        y,
        { gutter: [12, 12] },
        ...B.map(
          (D) => o.createElement(
            A,
            { key: D.name, xs: 24, sm: 12, md: 8, lg: 6 },
            o.createElement(
              L,
              {
                hoverable: !0,
                size: "small",
                style: { cursor: "pointer", height: "100%" },
                onClick: () => Ee(D),
                onMouseEnter: () => v(D.name),
                onMouseLeave: () => v(null)
              },
              o.createElement(
                "div",
                {
                  style: {
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 8
                  }
                },
                D.emoji ? o.createElement(
                  "span",
                  { style: { fontSize: 18 } },
                  D.emoji
                ) : o.createElement(
                  "span",
                  { style: { fontSize: 18 } },
                  "⚡"
                ),
                o.createElement(
                  M,
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
                  D.name
                ),
                D.protected ? o.createElement(
                  U,
                  { color: "gold", style: { fontSize: 10 } },
                  "内置"
                ) : null
              ),
              D.description ? o.createElement(
                K,
                {
                  type: "secondary",
                  style: { fontSize: 11, margin: 0, lineHeight: 1.4 },
                  ellipsis: { rows: 2 }
                },
                D.description
              ) : null,
              o.createElement(
                "div",
                {
                  style: {
                    marginTop: 8,
                    display: "flex",
                    gap: 4,
                    flexWrap: "wrap"
                  }
                },
                D.version_text ? o.createElement(
                  U,
                  { style: { fontSize: 10 } },
                  `v${D.version_text}`
                ) : null,
                ...(D.tags || []).slice(0, 3).map(
                  (T, X) => o.createElement(
                    U,
                    { key: X, color: "cyan", style: { fontSize: 10 } },
                    T
                  )
                )
              ),
              // Hover action footer
              re === D.name ? o.createElement(
                "div",
                {
                  style: {
                    marginTop: 8,
                    paddingTop: 8,
                    borderTop: "1px solid #f0f0f0",
                    display: "flex",
                    gap: 8,
                    justifyContent: "flex-end"
                  }
                },
                o.createElement(
                  h,
                  {
                    size: "small",
                    type: "primary",
                    icon: g ? o.createElement(g) : void 0,
                    disabled: Z,
                    onClick: (T) => {
                      T.stopPropagation(), ye(D);
                    }
                  },
                  "加载到当前Agent"
                ),
                o.createElement(
                  h,
                  {
                    size: "small",
                    danger: !0,
                    icon: E ? o.createElement(E) : void 0,
                    disabled: Z || D.protected,
                    onClick: (T) => {
                      T.stopPropagation(), pe(D);
                    }
                  },
                  "删除"
                )
              ) : null
            )
          )
        ),
        // Load more button
        B.length < Y.length ? o.createElement(
          "div",
          { style: { textAlign: "center", marginTop: 16 } },
          o.createElement(
            h,
            {
              onClick: () => W((D) => D + 24),
              size: "small"
            },
            `加载更多 (剩余 ${Y.length - B.length} 个)`
          )
        ) : null
      )
    ),
    // Skill detail drawer
    u ? o.createElement(
      te,
      {
        title: o.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 8 } },
          o.createElement(
            "span",
            { style: { fontSize: 18 } },
            u.emoji || "⚡"
          ),
          o.createElement("span", null, u.name)
        ),
        open: $,
        onClose: () => p(!1),
        width: 520,
        extra: o.createElement(
          h,
          {
            type: "primary",
            size: "small",
            icon: I ? o.createElement(I) : void 0,
            onClick: () => ae("/skills")
          },
          "管理技能"
        )
      },
      o.createElement(
        G,
        { column: 1, bordered: !0, size: "small" },
        o.createElement(
          G.Item,
          { label: "技能名称" },
          u.name
        ),
        o.createElement(
          G.Item,
          { label: "描述" },
          u.description || "-"
        ),
        u.version_text ? o.createElement(
          G.Item,
          { label: "版本" },
          u.version_text
        ) : null,
        o.createElement(
          G.Item,
          { label: "来源" },
          u.source || "-"
        ),
        o.createElement(
          G.Item,
          { label: "受保护" },
          u.protected ? "是（内置）" : "否"
        ),
        u.sync_status ? o.createElement(
          G.Item,
          { label: "同步状态" },
          u.sync_status
        ) : null,
        u.installed_from ? o.createElement(
          G.Item,
          { label: "安装来源" },
          u.installed_from
        ) : null
      ),
      // Tags
      u.tags && u.tags.length > 0 ? o.createElement(
        "div",
        { style: { marginTop: 16 } },
        o.createElement(
          M,
          {
            strong: !0,
            style: { display: "block", marginBottom: 8 }
          },
          "标签"
        ),
        o.createElement(
          "div",
          { style: { display: "flex", flexWrap: "wrap", gap: 4 } },
          ...u.tags.map(
            (D, T) => o.createElement(U, { key: T, color: "cyan" }, D)
          )
        )
      ) : null,
      // Installed agents
      o.createElement(
        "div",
        { style: { marginTop: 16 } },
        o.createElement(
          M,
          { strong: !0, style: { display: "block", marginBottom: 8 } },
          `已安装此技能的专家 (${ne.length})`
        ),
        ne.length > 0 ? o.createElement(H, {
          size: "small",
          dataSource: ne,
          renderItem: (D) => o.createElement(
            H.Item,
            null,
            o.createElement(
              "div",
              {
                style: {
                  display: "flex",
                  alignItems: "center",
                  gap: 6
                }
              },
              o.createElement(Re, { name: D, size: 20 }),
              o.createElement(
                M,
                { style: { fontSize: 13 } },
                D
              )
            )
          )
        }) : o.createElement(
          M,
          { type: "secondary", style: { fontSize: 12 } },
          "暂无专家安装此技能"
        )
      ),
      // Skill content preview (lazy-loaded)
      V ? o.createElement(
        "div",
        { style: { marginTop: 16, textAlign: "center" } },
        o.createElement(b, { size: "small" })
      ) : u.content ? o.createElement(
        "div",
        { style: { marginTop: 16 } },
        o.createElement(
          M,
          {
            strong: !0,
            style: { display: "block", marginBottom: 8 }
          },
          "技能内容"
        ),
        o.createElement(
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
          u.content.slice(0, 2e3) + (u.content.length > 2e3 ? `

... (内容已截断)` : "")
        )
      ) : null
    ) : null
  );
}
function ls() {
  const e = z().React, { useState: t, useEffect: l, useCallback: a, useMemo: n } = e, { Tabs: s, message: r } = z().antd, { ThunderboltOutlined: o, AppstoreOutlined: d } = z().antdIcons || {}, f = z().useSelectedAgent, b = f ? f() : null, k = (b == null ? void 0 : b.id) || "default", [S, h] = t([]), [y, A] = t([]), [L, U] = t([]), [N, te] = t(!0), [G, H] = t("agent-skills"), x = a(async () => {
    te(!0);
    try {
      const [F, I, E] = await Promise.all([
        Dt(!0),
        Ut(),
        Fa()
      ]);
      A(F), h(I), U(E);
    } catch (F) {
      r.error(F.message || "加载技能列表失败"), A([]);
    } finally {
      te(!1);
    }
  }, []);
  l(() => {
    x();
  }, [x]);
  const C = n(() => {
    const F = S.find((I) => I.id === k);
    return (F == null ? void 0 : F.name) || k;
  }, [S, k]), _ = (F) => {
    window.history.pushState({}, "", F), window.dispatchEvent(new PopStateEvent("popstate"));
  }, J = [
    {
      key: "agent-skills",
      label: e.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        o ? e.createElement(o, { style: { fontSize: 14 } }) : null,
        "当前Agent加载技能"
      ),
      children: e.createElement(ns, {
        agentId: k,
        agentName: C,
        onNavigate: _
      })
    },
    {
      key: "skill-pool",
      label: e.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        d ? e.createElement(d, { style: { fontSize: 14 } }) : null,
        "技能池"
      ),
      children: e.createElement(as, {
        poolSkills: y,
        workspaceSkills: L,
        agents: S,
        loading: N,
        onReload: x,
        agentId: k,
        agentName: C
      })
    }
  ];
  return e.createElement(
    "div",
    { style: { padding: 24 } },
    e.createElement(Ct, {
      title: "技能",
      subtitle: `技能池共 ${y.length} 个技能 · 当前智能体：${C}`
    }),
    e.createElement(s, {
      items: J,
      activeKey: G,
      onChange: (F) => H(F)
    })
  );
}
const ht = "ugsci.market.githubSources", In = "https://github.com/anthropics/skills/tree/main/skills", oa = "https://ugsci-awesome-tools.oss-cn-beijing.aliyuncs.com", ss = `${oa}/skills`;
function ot(e) {
  const t = e.replace(/^\/+/, "");
  return Qe(`/plugins/oss-proxy?path=${encodeURIComponent(t)}`);
}
async function Kt(e) {
  const t = e.replace(/^\/+/, ""), l = await fetch(ot(t));
  if (!l.ok)
    throw new Error(`OSS fetch failed (${l.status}): ${t}`);
  return await l.json();
}
function rt(e) {
  return {
    domain: "领域",
    workflow: "工作流",
    computation: "计算与数据",
    integration: "集成与工具",
    type: "类型",
    capability: "能力",
    tooling: "工具链"
  }[e] || e;
}
function os(e) {
  var n, s;
  const t = {};
  if (e.env && e.env.length > 0)
    for (const r of e.env)
      t[r] = `your-${r.toLowerCase().replace(/_/g, "-")}`;
  let l = "🔌";
  const a = (e.icon || "").toLowerCase();
  return a.includes("folder") ? l = "📁" : a.includes("git") ? l = "🌿" : a.includes("github") ? l = "🐙" : a.includes("database") || a.includes("postgres") || a.includes("sqlite") ? l = "🗄️" : a.includes("search") || a.includes("brave") ? l = "🔍" : a.includes("browser") || a.includes("puppeteer") ? l = "🎭" : a.includes("memory") || a.includes("brain") ? l = "🧠" : a.includes("file") || a.includes("fetch") ? l = "🌐" : a.includes("slack") ? l = "💬" : a.includes("google") ? l = "📁" : a.includes("notion") ? l = "📝" : a.includes("jupyter") ? l = "📊" : a.includes("science") || a.includes("flask") ? l = "🔬" : a.includes("book") || a.includes("arxiv") ? l = "📚" : a.includes("patent") && (l = "📜"), {
    id: e.id,
    name: e.name,
    emoji: l,
    iconUrl: e.icon_url ? ot(e.icon_url) : void 0,
    category: e.category ? rt(e.category) : "",
    description: e.description,
    transport: e.transport || "stdio",
    command: ((n = e.config) == null ? void 0 : n.command) || "",
    args: ((s = e.config) == null ? void 0 : s.args) || [],
    env: Object.keys(t).length > 0 ? t : void 0
  };
}
const ra = "ugsci.market.mcpSources", ia = "ugsci.market.expertSources";
function ca(e, t) {
  try {
    const l = localStorage.getItem(e);
    if (!l) return [];
    const a = JSON.parse(l);
    return Array.isArray(a) ? a.filter(
      (n) => n && typeof n.id == "string" && typeof n.label == "string" && typeof n.url == "string"
    ).map((n) => ({
      id: n.id,
      label: n.label,
      url: n.url,
      enabled: n.enabled !== !1,
      type: t
    })) : [];
  } catch {
    return [];
  }
}
function ma(e, t) {
  try {
    localStorage.setItem(e, JSON.stringify(t));
  } catch {
  }
}
function rs() {
  return ca(ra, "mcp");
}
function gt(e) {
  ma(ra, e);
}
function is() {
  return ca(ia, "expert");
}
function ft(e) {
  ma(ia, e);
}
function da(e) {
  try {
    const t = new URL(e.trim()), l = t.hostname.toLowerCase();
    let a;
    if (l === "github.com" || l === "www.github.com")
      a = "github";
    else if (l === "gitee.com" || l === "www.gitee.com")
      a = "gitee";
    else
      return null;
    const n = t.pathname.split("/").filter((c) => c.length > 0);
    if (n.length < 2) return null;
    const s = decodeURIComponent(n[0]), r = decodeURIComponent(n[1]);
    let o = "main", d = "";
    return n.length >= 4 && (n[2] === "tree" || n[2] === "blob") ? (o = decodeURIComponent(n[3]), n.length > 4 && (d = n.slice(4).map(decodeURIComponent).join("/"))) : n.length > 2 && (d = n.slice(2).map(decodeURIComponent).join("/")), d = d.replace(/\/+$/, "").replace(/^\/+/, ""), {
      owner: s,
      repo: r,
      ref: o || "main",
      skillsPath: d,
      label: `${s}/${r}`,
      platform: a
    };
  } catch {
    return null;
  }
}
function ua(e, t, l, a = "github") {
  return a === "oss" ? `oss:${e}/${l || "/"}` : `${a}:${e}/${t}:${l || "/"}`;
}
function cs(e) {
  try {
    const t = new URL(e.trim()), l = t.hostname.toLowerCase(), a = l.match(
      /^([a-z0-9][a-z0-9-]{1,61}[a-z0-9])\.oss-([a-z0-9-]+)\.aliyuncs\.com$/
    );
    if (!a) return null;
    const n = a[1], s = `${t.protocol}//${l}`, r = decodeURIComponent(t.pathname).replace(/^\/+/, "").replace(/\/+$/, "");
    return r ? {
      endpoint: s,
      prefix: r,
      label: "UGSci",
      platform: "oss"
    } : null;
  } catch {
    return null;
  }
}
function ms() {
  try {
    const e = localStorage.getItem(ht);
    if (!e) {
      const a = [], n = da(In);
      return n && a.push({
        id: ua(
          n.owner,
          n.repo,
          n.skillsPath,
          n.platform
        ),
        url: In,
        label: n.label,
        owner: n.owner,
        repo: n.repo,
        ref: n.ref,
        skillsPath: n.skillsPath,
        enabled: !1,
        platform: n.platform
      }), localStorage.setItem(ht, JSON.stringify(a)), a;
    }
    const t = JSON.parse(e);
    if (!Array.isArray(t)) return [];
    const l = t.filter(
      (a) => a && typeof a.id == "string" && (typeof a.owner == "string" || a.platform === "oss") && !(a.platform === "oss" && a.url === ss)
    ).map((a) => ({
      ...a,
      platform: a.platform || "github",
      owner: a.owner || "",
      repo: a.repo || "",
      ref: a.ref || "",
      skillsPath: a.skillsPath || ""
    }));
    return l.length !== t.length && localStorage.setItem(
      ht,
      JSON.stringify(l)
    ), l;
  } catch {
    return [];
  }
}
function yt(e) {
  try {
    localStorage.setItem(
      ht,
      JSON.stringify(e)
    );
  } catch {
  }
}
function ds(e) {
  const t = e.match(/^---\s*\n([\s\S]*?)\n---/);
  if (!t) return {};
  const l = t[1], a = {}, n = l.split(`
`);
  let s = "";
  for (const r of n) {
    const o = r.match(/^(\w[\w-]*)\s*:\s*(.*)$/);
    if (o) {
      s = o[1];
      let d = o[2].trim();
      (d.startsWith('"') && d.endsWith('"') || d.startsWith("'") && d.endsWith("'")) && (d = d.slice(1, -1)), s === "name" ? a.name = d : s === "description" ? a.description = d : s === "version" ? a.version = d : s === "author" && (a.author = d);
    }
  }
  return a;
}
async function us(e) {
  const t = e.platform === "gitee", l = e.skillsPath ? encodeURIComponent(e.skillsPath).replace(/%2F/g, "/") : "", a = t ? `https://gitee.com/api/v5/repos/${e.owner}/${e.repo}/contents/${l}?ref=${encodeURIComponent(e.ref)}` : `https://api.github.com/repos/${e.owner}/${e.repo}/contents/${l}?ref=${encodeURIComponent(e.ref)}`, n = {
    Accept: t ? "application/json" : "application/vnd.github+json"
  };
  t && e.accessToken && (n.Authorization = `token ${e.accessToken}`);
  const s = await fetch(a, {
    headers: n
  });
  if (!s.ok)
    throw new Error(
      `${t ? "Gitee" : "GitHub"} API ${s.status}: ${e.label} (${e.skillsPath || "/"})`
    );
  const r = await s.json();
  if (!Array.isArray(r)) return [];
  const o = r.filter(
    (c) => c.type === "dir" && c.name
  );
  return await Promise.all(
    o.map(async (c) => {
      const f = e.skillsPath ? e.skillsPath + "/" : "", b = t ? `https://gitee.com/${e.owner}/${e.repo}/raw/${e.ref}/${f}${c.name}/SKILL.md` : `https://raw.githubusercontent.com/${e.owner}/${e.repo}/${e.ref}/${f}${c.name}/SKILL.md`, k = t ? `https://gitee.com/${e.owner}/${e.repo}/tree/${e.ref}/${f}${c.name}` : `https://github.com/${e.owner}/${e.repo}/tree/${e.ref}/${f}${c.name}`, S = {
        sourceId: e.id,
        sourceLabel: e.label,
        name: c.name,
        description: "",
        source_url: k,
        html_url: k,
        version: null,
        author: null
      };
      try {
        const h = {};
        t && e.accessToken && (h.Authorization = `token ${e.accessToken}`);
        const y = await fetch(b, {
          headers: h
        });
        if (!y.ok) return S;
        const A = await y.text(), L = ds(A);
        return {
          ...S,
          name: L.name || c.name,
          description: L.description || "",
          version: L.version || null,
          author: L.author || null
        };
      } catch {
        return S;
      }
    })
  );
}
async function ps(e) {
  const t = cs(e.url);
  if (!t)
    throw new Error(`Invalid OSS URL: ${e.url}`);
  const { endpoint: l, prefix: a } = t, n = a.split("/").map(encodeURIComponent).join("/"), s = ot(`${n}/manifest.json`), r = await fetch(s);
  if (!r.ok)
    throw new Error(
      `无法获取技能列表: manifest.json (${r.status})`
    );
  const o = await r.json(), d = [];
  if (o && o.tag_groups && typeof o.tag_groups == "object")
    for (const [b, k] of Object.entries(o.tag_groups))
      Array.isArray(k) && d.push({
        id: b,
        label: rt(b),
        tags: k
      });
  const c = [];
  function f(b, k) {
    for (const S of b) {
      if (S.type === "collection" && Array.isArray(S.children)) {
        f(S.children, S.name);
        continue;
      }
      const h = S.path || S.name || "";
      if (!h) continue;
      const y = h.split("/").map(encodeURIComponent).join("/"), A = `${l}/${n}/${y}`;
      let L = null;
      if (S.metadata) {
        const N = S.metadata.match(/version:\s*"?([\d.]+)"?/);
        N && (L = N[1]);
      }
      const U = k ? `${e.label}/${k}` : e.label;
      c.push({
        sourceId: e.id,
        sourceLabel: e.label,
        sourcePath: U,
        name: S.name || h.split("/").pop() || h,
        description: S.description || "",
        source_url: A,
        html_url: A,
        version: L,
        author: null,
        tag: S.tag || void 0,
        isOfficial: !0
      });
    }
  }
  if (Array.isArray(o) ? f(
    o.map(
      (b) => typeof b == "string" ? { name: b, path: b } : b
    )
  ) : o && Array.isArray(o.skills) && f(o.skills), c.length === 0)
    throw new Error(
      `manifest.json 中未找到技能。请检查 ${e.url}/manifest.json`
    );
  return { skills: c, categories: d };
}
async function gs() {
  const e = await Kt("mcp/manifest.json"), t = [], l = {};
  if (e.tag_groups && typeof e.tag_groups == "object")
    for (const [n, s] of Object.entries(e.tag_groups))
      Array.isArray(s) && (l[n] = s, t.push({
        id: n,
        label: rt(n),
        tags: s
      }));
  return { servers: (e.servers || []).map((n) => {
    let s = "";
    const r = n.tags || [];
    for (const [o, d] of Object.entries(l))
      if (d.some((c) => r.includes(c))) {
        s = o;
        break;
      }
    return {
      id: n.id || n.name,
      name: n.name || n.id,
      description: n.description || "",
      tags: r,
      transport: n.transport || "stdio",
      config: n.config,
      env: Array.isArray(n.env) ? n.env : void 0,
      source: n.source,
      icon: n.icon,
      icon_url: n.icon_url || n.icon_path || void 0,
      category: s
    };
  }), categories: t };
}
async function fs() {
  const e = await Kt("skills/manifest.json"), t = [], l = /* @__PURE__ */ new Set();
  function a(n, s) {
    for (const r of n) {
      if ((r == null ? void 0 : r.type) === "collection" && Array.isArray(r.children)) {
        a(r.children, r.name || s);
        continue;
      }
      const o = String((r == null ? void 0 : r.path) || (r == null ? void 0 : r.name) || "").trim();
      if (!o) continue;
      const d = o.split("/").map(encodeURIComponent).join("/"), c = `${oa}/skills/${d}`, f = typeof r.tag == "string" && r.tag.trim() ? r.tag.trim() : void 0;
      f && l.add(f);
      let b = null;
      if (typeof r.metadata == "string") {
        const k = r.metadata.match(/version:\s*"?([\d.]+)"?/);
        k && (b = k[1]);
      }
      t.push({
        sourceId: "oss:ugsci-official",
        sourceLabel: "UGSci",
        sourcePath: s ? `UGSci/${s}` : "UGSci",
        name: r.name || o.split("/").pop() || o,
        description: r.description || "",
        source_url: c,
        html_url: c,
        version: b,
        author: null,
        tag: f,
        isOfficial: !0
      });
    }
  }
  if (Array.isArray(e) ? a(
    e.map(
      (n) => typeof n == "string" ? { name: n, path: n } : n
    )
  ) : e && Array.isArray(e.skills) && a(e.skills), t.length === 0)
    throw new Error("OSS 技能清单中没有可用技能");
  return {
    skills: t,
    categories: Array.from(l).map((n) => ({
      id: n,
      label: n
    }))
  };
}
async function ys() {
  const e = await Kt("agents/manifest.json"), t = [], l = {};
  if (e.tag_groups && typeof e.tag_groups == "object")
    for (const [n, s] of Object.entries(e.tag_groups))
      Array.isArray(s) && (l[n] = s, t.push({
        id: n,
        label: rt(n),
        tags: s
      }));
  return { agents: (e.agents || []).map((n) => {
    let s = "";
    const r = n.tags || [];
    for (const [o, d] of Object.entries(l))
      if (d.some((c) => r.includes(c))) {
        s = o;
        break;
      }
    return {
      id: n.id || n.name,
      name: n.name || n.id,
      description: n.description || "",
      path: n.path || "",
      tags: r,
      config: n.config,
      instructions: n.instructions,
      skills_manifest: n.skills_manifest,
      drivers: n.drivers,
      category: s
    };
  }), categories: t };
}
async function Es(e) {
  const t = e.filter((r) => r.enabled), l = await Promise.all(
    t.map(async (r) => {
      try {
        if (r.platform === "oss") {
          const { skills: o, categories: d } = await ps(r);
          return { skills: o, categories: d, error: null, label: r.label };
        } else
          return { skills: await us(r), categories: [], error: null, label: r.label };
      } catch (o) {
        return {
          skills: [],
          categories: [],
          error: o.message || String(o),
          label: r.label
        };
      }
    })
  ), a = [], n = [], s = [];
  for (const r of l)
    a.push(...r.skills), n.push(...r.categories), r.error && s.push({ label: r.label, message: r.error });
  return { skills: a, errors: s, categories: n };
}
function hs({
  open: e,
  onClose: t,
  sources: l,
  onChange: a
}) {
  const n = z().React, { useState: s } = n, {
    Modal: r,
    Input: o,
    Button: d,
    List: c,
    Tag: f,
    Switch: b,
    Typography: k,
    Tooltip: S,
    message: h
  } = z().antd, {
    PlusOutlined: y,
    DeleteOutlined: A,
    LinkOutlined: L,
    GithubOutlined: U
  } = z().antdIcons || {}, { Text: N } = k, [te, G] = s(""), [H, x] = s(""), C = () => {
    const I = te.trim();
    if (!I) return;
    const E = da(I);
    if (!E) {
      h.error("无效的仓库 URL，请输入类似 https://github.com/owner/repo/tree/main/skills 或 https://gitee.com/owner/repo/tree/master/skills 的链接");
      return;
    }
    const g = ua(E.owner, E.repo, E.skillsPath, E.platform);
    if (l.some((Q) => Q.id === g)) {
      h.warning("该源已存在");
      return;
    }
    const M = {
      id: g,
      url: I,
      label: E.label,
      owner: E.owner,
      repo: E.repo,
      ref: E.ref,
      skillsPath: E.skillsPath,
      enabled: !0,
      platform: E.platform,
      accessToken: H.trim() || void 0
    }, K = [...l, M];
    yt(K), a(K), G(""), x(""), h.success(`已添加源: ${E.label}`);
  }, _ = (I, E) => {
    const g = l.map(
      (M) => M.id === I ? { ...M, enabled: E } : M
    );
    yt(g), a(g);
  }, J = (I, E) => {
    const g = l.map(
      (M) => M.id === I ? { ...M, accessToken: E.trim() || void 0 } : M
    );
    yt(g), a(g);
  }, F = (I) => {
    const E = l.filter((g) => g.id !== I);
    yt(E), a(E), h.success("已移除源");
  };
  return n.createElement(
    r,
    {
      open: e,
      onCancel: t,
      title: n.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 8 } },
        U ? n.createElement(U, { style: { fontSize: 18 } }) : null,
        n.createElement("span", null, "配置技能源")
      ),
      footer: n.createElement(
        d,
        { onClick: t },
        "关闭"
      ),
      width: 640
    },
    n.createElement(
      "div",
      { style: { marginBottom: 16 } },
      n.createElement(
        N,
        { type: "secondary", style: { fontSize: 12, display: "block", marginBottom: 8 } },
        "添加 GitHub 或 Gitee 仓库作为技能源，系统将从该仓库的指定目录获取技能列表。支持格式："
      ),
      n.createElement(
        "div",
        { style: { display: "flex", gap: 8, alignItems: "center" } },
        n.createElement(o, {
          placeholder: "https://github.com/owner/repo/tree/main/skills 或 https://gitee.com/owner/repo/tree/master/skills",
          value: te,
          onChange: (I) => G(I.target.value),
          onPressEnter: C,
          prefix: L ? n.createElement(L) : void 0,
          style: { flex: 1 }
        }),
        n.createElement(
          d,
          {
            type: "primary",
            icon: y ? n.createElement(y) : void 0,
            onClick: C
          },
          "添加"
        )
      ),
      // Gitee token input (shown when URL looks like a Gitee link)
      te.trim() && te.trim().toLowerCase().includes("gitee.com") ? n.createElement(
        "div",
        { style: { marginTop: 8, display: "flex", gap: 8, alignItems: "center" } },
        n.createElement(
          N,
          { type: "secondary", style: { fontSize: 12, whiteSpace: "nowrap" } },
          "Gitee Token:"
        ),
        n.createElement(o.Password, {
          placeholder: "私有仓库请填写 Gitee 私人令牌（可选）",
          value: H,
          onChange: (I) => x(I.target.value),
          style: { flex: 1 }
        })
      ) : null
    ),
    n.createElement(
      "div",
      { style: { marginBottom: 8, display: "flex", alignItems: "center", justifyContent: "space-between" } },
      n.createElement(N, { strong: !0 }, `已配置源 (${l.length})`)
    ),
    n.createElement(c, {
      size: "small",
      bordered: !0,
      dataSource: l,
      renderItem: (I) => n.createElement(
        c.Item,
        {
          actions: [
            n.createElement(
              S,
              { title: I.enabled ? "点击禁用" : "点击启用" },
              n.createElement(b, {
                size: "small",
                checked: I.enabled,
                onChange: (E) => _(I.id, E)
              })
            ),
            n.createElement(
              S,
              { title: "移除此源" },
              n.createElement(
                d,
                {
                  size: "small",
                  type: "text",
                  danger: !0,
                  icon: A ? n.createElement(A) : void 0,
                  onClick: () => F(I.id)
                }
              )
            )
          ]
        },
        n.createElement(
          "div",
          { style: { flex: 1, minWidth: 0 } },
          n.createElement(
            "div",
            { style: { display: "flex", alignItems: "center", gap: 6, marginBottom: 4 } },
            n.createElement(
              f,
              { color: I.platform === "gitee" ? "orange" : I.platform === "oss" ? "green" : "blue", style: { fontSize: 11 } },
              I.platform === "gitee" ? "Gitee" : I.platform === "oss" ? "OSS" : "GitHub"
            ),
            n.createElement(
              f,
              { style: { fontSize: 11 } },
              I.label
            ),
            I.skillsPath ? n.createElement(
              N,
              { type: "secondary", style: { fontSize: 11 } },
              `/${I.skillsPath}`
            ) : null,
            I.platform !== "oss" ? n.createElement(
              N,
              { type: "secondary", style: { fontSize: 11 } },
              `@${I.ref}`
            ) : null
          ),
          n.createElement(
            N,
            {
              type: "secondary",
              style: { fontSize: 11, wordBreak: "break-all" }
            },
            I.url
          ),
          // Gitee token input for existing Gitee sources
          I.platform === "gitee" ? n.createElement(
            "div",
            { style: { marginTop: 6, display: "flex", gap: 6, alignItems: "center" } },
            n.createElement(
              N,
              { type: "secondary", style: { fontSize: 11, whiteSpace: "nowrap" } },
              "Token:"
            ),
            n.createElement(o.Password, {
              size: "small",
              placeholder: "Gitee 私人令牌（可选，用于私有仓库）",
              value: I.accessToken || "",
              onChange: (E) => J(I.id, E.target.value),
              style: { flex: 1 }
            })
          ) : null
        )
      )
    })
  );
}
function On({
  open: e,
  onClose: t,
  sources: l,
  onChange: a,
  type: n
}) {
  const s = z().React, { useState: r } = s, {
    Modal: o,
    Input: d,
    Button: c,
    List: f,
    Tag: b,
    Switch: k,
    Typography: S,
    Tooltip: h,
    message: y
  } = z().antd, {
    PlusOutlined: A,
    DeleteOutlined: L,
    LinkOutlined: U,
    ApiOutlined: N,
    UserOutlined: te,
    ImportOutlined: G,
    ExportOutlined: H,
    CopyOutlined: x
  } = z().antdIcons || {}, { Text: C } = S, [_, J] = r(""), [F, I] = r(""), [E, g] = r(""), [M, K] = r(!1), Q = n === "mcp" ? "MCP" : "专家模板", le = n === "mcp" ? N ? s.createElement(N, { style: { fontSize: 18 } }) : null : te ? s.createElement(te, { style: { fontSize: 18 } }) : null, $ = () => {
    const R = _.trim(), V = F.trim();
    if (!R) return;
    const se = V || R.slice(0, 40), w = `${n}:${R}`;
    if (l.some((v) => v.id === w)) {
      y.warning("该源已存在");
      return;
    }
    const W = {
      id: w,
      label: se,
      url: R,
      enabled: !0,
      type: n
    }, re = [...l, W];
    n === "mcp" ? gt(re) : ft(re), a(re), J(""), I(""), y.success(`已添加${Q}源: ${se}`);
  }, p = (R, V) => {
    const se = l.map(
      (w) => w.id === R ? { ...w, enabled: V } : w
    );
    n === "mcp" ? gt(se) : ft(se), a(se);
  }, u = (R) => {
    const V = l.filter((se) => se.id !== R);
    n === "mcp" ? gt(V) : ft(V), a(V), y.success("已移除源");
  }, O = () => {
    const R = JSON.stringify(
      { type: n, sources: l },
      null,
      2
    );
    try {
      navigator.clipboard.writeText(R), y.success(`${Q}源已复制到剪贴板（${l.length} 个源）`);
    } catch {
      const V = document.createElement("textarea");
      V.value = R, document.body.appendChild(V), V.select(), document.execCommand("copy"), document.body.removeChild(V), y.success(`${Q}源已复制到剪贴板（${l.length} 个源）`);
    }
  }, ne = () => {
    const R = E.trim();
    if (!R) {
      y.warning("请粘贴 JSON 内容");
      return;
    }
    try {
      const V = JSON.parse(R);
      let se = [];
      if (Array.isArray(V))
        se = V;
      else if (V && Array.isArray(V.sources))
        se = V.sources;
      else if (V && typeof V == "object")
        se = [V];
      else
        throw new Error("Invalid format");
      const w = se.filter(
        (Z) => Z && typeof Z.url == "string" && typeof Z.label == "string"
      );
      if (w.length === 0) {
        y.error("未找到有效的源数据");
        return;
      }
      const W = new Set(l.map((Z) => Z.id)), re = [];
      for (const Z of w) {
        const m = Z.id || `${n}:${Z.url}`;
        W.has(m) || re.push({
          id: m,
          label: Z.label,
          url: Z.url,
          enabled: Z.enabled !== !1,
          type: n
        });
      }
      if (re.length === 0) {
        y.info("所有源均已存在，无新增");
        return;
      }
      const v = [...l, ...re];
      n === "mcp" ? gt(v) : ft(v), a(v), g(""), K(!1), y.success(`成功导入 ${re.length} 个${Q}源`);
    } catch (V) {
      y.error(`JSON 解析失败: ${V.message || "格式错误"}`);
    }
  };
  return s.createElement(
    o,
    {
      open: e,
      onCancel: t,
      title: s.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 8 } },
        le,
        s.createElement("span", null, `配置${Q}源`)
      ),
      footer: s.createElement(
        "div",
        { style: { display: "flex", justifyContent: "space-between" } },
        s.createElement(
          "div",
          { style: { display: "flex", gap: 8 } },
          s.createElement(
            c,
            {
              icon: H ? s.createElement(H) : void 0,
              onClick: O,
              disabled: l.length === 0,
              size: "small"
            },
            "导出到剪贴板"
          ),
          s.createElement(
            c,
            {
              icon: G ? s.createElement(G) : void 0,
              onClick: () => K(!M),
              size: "small"
            },
            M ? "隐藏导入" : "导入JSON"
          )
        ),
        s.createElement(
          c,
          { onClick: t },
          "关闭"
        )
      ),
      width: 680
    },
    // Description
    s.createElement(
      C,
      { type: "secondary", style: { fontSize: 12, display: "block", marginBottom: 12 } },
      `配置${Q}源地址，支持从远程仓库或团队共享的 JSON 导入${Q}配置。`
    ),
    // Import section (collapsible)
    M ? s.createElement(
      "div",
      {
        style: {
          marginBottom: 16,
          padding: 12,
          background: "#fafafa",
          borderRadius: 8,
          border: "1px solid #f0f0f0"
        }
      },
      s.createElement(
        C,
        { strong: !0, style: { fontSize: 12, display: "block", marginBottom: 8 } },
        `粘贴${Q}源 JSON（支持从导出的剪贴板内容粘贴）`
      ),
      s.createElement(d.TextArea, {
        placeholder: n === "mcp" ? `{
  "type": "mcp",
  "sources": [
    { "label": "团队MCP", "url": "https://raw.githubusercontent.com/team/mcp-registry/main/mcp.json" }
  ]
}` : `{
  "type": "expert",
  "sources": [
    { "label": "团队专家库", "url": "https://raw.githubusercontent.com/team/expert-registry/main/experts.json" }
  ]
}`,
        value: E,
        onChange: (R) => g(R.target.value),
        autoSize: { minRows: 4, maxRows: 10 },
        style: { fontFamily: "monospace", fontSize: 12 }
      }),
      s.createElement(
        "div",
        { style: { marginTop: 8, display: "flex", gap: 8 } },
        s.createElement(
          c,
          {
            type: "primary",
            size: "small",
            onClick: ne
          },
          "导入"
        ),
        s.createElement(
          c,
          {
            size: "small",
            onClick: () => g("")
          },
          "清空"
        )
      )
    ) : null,
    // Add new source
    s.createElement(
      "div",
      { style: { marginBottom: 16, display: "flex", gap: 8, alignItems: "center" } },
      s.createElement(d, {
        placeholder: "源名称（可选，如：团队MCP仓库）",
        value: F,
        onChange: (R) => I(R.target.value),
        style: { width: 200 }
      }),
      s.createElement(d, {
        placeholder: n === "mcp" ? "https://raw.githubusercontent.com/team/mcp-registry/main/mcp.json" : "https://raw.githubusercontent.com/team/expert-registry/main/experts.json",
        value: _,
        onChange: (R) => J(R.target.value),
        onPressEnter: $,
        prefix: U ? s.createElement(U) : void 0,
        style: { flex: 1 }
      }),
      s.createElement(
        c,
        {
          type: "primary",
          icon: A ? s.createElement(A) : void 0,
          onClick: $
        },
        "添加"
      )
    ),
    // Source list
    s.createElement(
      "div",
      {
        style: {
          marginBottom: 8,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between"
        }
      },
      s.createElement(
        C,
        { strong: !0 },
        `已配置源 (${l.length})`
      )
    ),
    s.createElement(f, {
      size: "small",
      bordered: !0,
      dataSource: l,
      renderItem: (R) => s.createElement(
        f.Item,
        {
          actions: [
            s.createElement(
              h,
              { title: R.enabled ? "点击禁用" : "点击启用" },
              s.createElement(k, {
                size: "small",
                checked: R.enabled,
                onChange: (V) => p(R.id, V)
              })
            ),
            s.createElement(
              h,
              { title: "移除此源" },
              s.createElement(
                c,
                {
                  size: "small",
                  type: "text",
                  danger: !0,
                  icon: L ? s.createElement(L) : void 0,
                  onClick: () => u(R.id)
                }
              )
            )
          ]
        },
        s.createElement(
          "div",
          { style: { flex: 1, minWidth: 0 } },
          s.createElement(
            "div",
            {
              style: {
                display: "flex",
                alignItems: "center",
                gap: 6,
                marginBottom: 4
              }
            },
            s.createElement(
              b,
              {
                color: n === "mcp" ? "purple" : "blue",
                style: { fontSize: 11 }
              },
              R.label
            ),
            R.enabled ? null : s.createElement(
              b,
              { style: { fontSize: 10 } },
              "已禁用"
            )
          ),
          s.createElement(
            C,
            {
              type: "secondary",
              style: { fontSize: 11, wordBreak: "break-all" }
            },
            R.url
          )
        )
      )
    }),
    // Share hint
    s.createElement(
      "div",
      {
        style: {
          marginTop: 12,
          padding: "8px 12px",
          background: "#e6f4ff",
          borderRadius: 6,
          fontSize: 12,
          color: "#1677ff"
        }
      },
      s.createElement(
        "span",
        null,
        "💡 ",
        "点击「导出到剪贴板」可复制所有源配置，分享给团队成员后粘贴到「导入JSON」即可快速配置。"
      )
    )
  );
}
async function vs() {
  return ce("/market/providers");
}
async function bs(e) {
  return ce(
    `/market/categories?lang=${encodeURIComponent(e)}`
  );
}
async function Ss(e, t, l, a, n) {
  return ce("/market/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: e,
      provider_pages: t,
      limit: l,
      lang: a,
      category: n || void 0
    })
  });
}
function An(e) {
  if (!e) return "";
  const t = e.message || String(e);
  try {
    const l = JSON.parse(t);
    if (l.detail) {
      if (typeof l.detail == "string") return l.detail;
      if (l.detail.message) return l.detail.message;
    }
  } catch {
  }
  return t;
}
async function Pn(e, t) {
  const l = { bundle_url: e };
  return t && (l.access_token = t), ce("/skills/pool/import", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(l)
  });
}
function ws() {
  const e = z().React, { useState: t, useEffect: l, useCallback: a, useMemo: n, useRef: s } = e, {
    Spin: r,
    Empty: o,
    Input: d,
    Button: c,
    message: f,
    Row: b,
    Col: k,
    Card: S,
    Tag: h,
    Tooltip: y,
    Typography: A,
    Select: L,
    Drawer: U,
    Descriptions: N,
    Tabs: te,
    Badge: G,
    Progress: H,
    Modal: x,
    Alert: C
  } = z().antd, {
    ReloadOutlined: _,
    SearchOutlined: J,
    DownloadOutlined: F,
    AppstoreOutlined: I,
    ShopOutlined: E,
    CheckCircleOutlined: g,
    LoadingOutlined: M,
    UserOutlined: K,
    SettingOutlined: Q,
    GithubOutlined: le,
    ApiOutlined: $
  } = z().antdIcons || {}, { Text: p, Paragraph: u, Title: O } = A, [ne, R] = t("skills"), [V, se] = t([]), [w, W] = t([]), [re, v] = t([]), [Z, m] = t(""), [Y, B] = t(""), [oe, de] = t(!1), [Ee, ye] = t(!1), [pe, ae] = t(
    {}
  ), [D, T] = t(null), [X, ie] = t({}), [q, ue] = t([]), [ve, we] = t(""), [xe, _e] = t(""), [Ne, it] = t(""), [ct, et] = t({}), [Pe, tt] = t(""), [mt, Ge] = t(/* @__PURE__ */ new Set()), [Te, Ie] = t(null), [ke, ee] = t({}), [Ce, Se] = t([]), [ze, He] = t([]), [nt, he] = t([]), [kt, dt] = t(""), [at, Ae] = t(!1), [pa, Xt] = t(!1), [ga, qt] = t([]), [fa, Vt] = t(!1), [ya, Yt] = t([]), [Ea, Qt] = t(!1), [Zt, en] = t([]), [tn, nn] = t([]), [an, ln] = t(!1), [We, sn] = t(""), [on, rn] = t([]), [cn, mn] = t([]), [dn, un] = t(!1), [Je, pn] = t(""), [_t, gn] = t(!1), [lt, ha] = t([]), st = s(null);
  l(() => {
    Promise.all([
      vs().catch(() => []),
      bs("zh").catch(() => []),
      Ut().catch(() => [])
    ]).then(([i, P, j]) => {
      se(i), W(P), ue(j), j.length > 0 && (we(j[0].id), tt(j[0].id));
    });
  }, []);
  const ut = a(async (i) => {
    const P = i ?? ms();
    if (Se(i || P), P.filter((me) => me.enabled).length === 0) {
      He([]);
      return;
    }
    Ae(!0);
    try {
      const { skills: me, errors: ge, categories: be } = await Es(P);
      if (He(me), ha(be), ge.length > 0) {
        for (const fe of ge)
          console.warn(`[ugsci] GitHub source '${fe.label}' error: ${fe.message}`);
        f.warning(
          `部分源加载失败: ${ge.map((fe) => fe.label).join(", ")}`
        );
      }
    } catch (me) {
      f.error(me.message || "加载技能源失败"), He([]);
    } finally {
      Ae(!1);
    }
  }, []), Tt = a(async () => {
    var me, ge, be;
    ln(!0), un(!0), Ae(!0);
    const [i, P, j] = await Promise.allSettled([
      gs(),
      ys(),
      fs()
    ]);
    if (i.status === "fulfilled" ? (en(i.value.servers), nn(i.value.categories)) : (console.warn(`[ugsci] MCP manifest error: ${((me = i.reason) == null ? void 0 : me.message) || i.reason}`), en([]), nn([])), ln(!1), P.status === "fulfilled" ? (rn(P.value.agents), mn(P.value.categories)) : (console.warn(`[ugsci] Agents manifest error: ${((ge = P.reason) == null ? void 0 : ge.message) || P.reason}`), rn([]), mn([])), un(!1), j.status === "fulfilled")
      he(j.value.skills), dt("");
    else {
      const fe = ((be = j.reason) == null ? void 0 : be.message) || String(j.reason);
      console.warn(`[ugsci] Skills manifest error: ${fe}`), he([]), dt(fe);
    }
    Ae(!1);
  }, []);
  l(() => {
    ut(), Tt(), qt(rs()), Yt(is());
  }, [ut, Tt]);
  const pt = a(
    async (i, P, j) => {
      de(!0);
      try {
        const me = await Ss(
          i,
          j,
          20,
          "zh",
          P || void 0
        );
        j === void 0 || Object.keys(j).length === 0 ? v(me.results) : v((fe) => [...fe, ...me.results]);
        const ge = Object.values(me.by_provider || {}).some(
          (fe) => fe.has_more
        );
        ye(ge);
        const be = {};
        for (const [fe, Be] of Object.entries(me.by_provider || {}))
          be[fe] = (j[fe] || 1) + 1;
        if (ae(be), me.errors.length > 0)
          for (const fe of me.errors)
            console.warn(
              `[ugsci] Market provider '${fe.provider}' error: ${fe.message}`
            );
      } catch (me) {
        f.error(me.message || "搜索市场失败"), v([]);
      } finally {
        de(!1);
      }
    },
    []
  );
  l(() => (st.current && clearTimeout(st.current), st.current = setTimeout(() => {
    pt(Z, Y, {});
  }, 400), () => {
    st.current && clearTimeout(st.current);
  }), [Z, Y, pt]);
  const va = () => {
    pt(Z, Y, pe);
  }, fn = async (i) => {
    const P = `${i.source}:${i.slug}`;
    try {
      ie((me) => ({ ...me, [P]: "installing" }));
      const j = await Pn(i.source_url);
      j.installed && f.success(
        `技能「${j.name || i.name}」已安装到技能池，可在技能中心查看`
      ), ie((me) => {
        const ge = { ...me };
        return delete ge[P], ge;
      });
    } catch (j) {
      f.error(An(j) || "安装技能失败"), ie((me) => {
        const ge = { ...me };
        return delete ge[P], ge;
      });
    }
  }, ba = (i) => {
    window.history.pushState({}, "", i), window.dispatchEvent(new PopStateEvent("popstate"));
  }, Sa = async (i) => {
    const P = `github:${i.sourceId}:${i.name}`, j = Ce.find((ge) => ge.id === i.sourceId), me = (j == null ? void 0 : j.accessToken) || void 0;
    try {
      ie((be) => ({ ...be, [P]: "installing" }));
      const ge = await Pn(i.source_url, me);
      ge.installed && f.success(
        `技能「${ge.name || i.name}」已安装到技能池，可在技能中心查看`
      ), ie((be) => {
        const fe = { ...be };
        return delete fe[P], fe;
      });
    } catch (ge) {
      f.error(An(ge) || "安装技能失败"), ie((be) => {
        const fe = { ...be };
        return delete fe[P], fe;
      });
    }
  }, De = n(() => {
    const i = [], P = /* @__PURE__ */ new Set();
    for (const j of [...nt, ...ze]) {
      const me = j.source_url || `${j.sourceLabel}:${j.name}`;
      P.has(me) || (P.add(me), i.push(j));
    }
    return i;
  }, [nt, ze]), yn = n(() => {
    const i = [], P = /* @__PURE__ */ new Set();
    if (lt.length > 0)
      for (const j of lt)
        P.has(j.id) || (P.add(j.id), i.push(j));
    for (const j of De)
      j.tag && !P.has(j.tag) && (P.add(j.tag), i.push({ id: j.tag, label: j.tag }));
    for (const j of De)
      !j.isOfficial && j.sourceLabel && !P.has(j.sourceLabel) && (P.add(j.sourceLabel), i.push({ id: j.sourceLabel, label: j.sourceLabel }));
    return i;
  }, [De, lt]), zt = n(() => {
    let i = De;
    if (Y) {
      const P = lt.find((j) => j.id === Y);
      P && P.tags ? i = i.filter(
        (j) => j.tag && P.tags.includes(j.tag) || j.sourceLabel === Y
      ) : i = i.filter(
        (j) => j.tag === Y || j.sourceLabel === Y
      );
    }
    if (Z.trim()) {
      const P = Z.toLowerCase();
      i = i.filter(
        (j) => {
          var me;
          return j.name.toLowerCase().includes(P) || ((me = j.description) == null ? void 0 : me.toLowerCase().includes(P));
        }
      );
    }
    return i;
  }, [De, Z, Y, lt]), En = V.filter((i) => i.available), Ke = n(() => Y ? re.filter((i) => {
    const P = En.find((j) => j.key === i.source);
    return (P == null ? void 0 : P.label) === Y;
  }) : re, [re, Y, En]), wa = e.createElement(
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
      e.createElement(d, {
        placeholder: "搜索技能市场...",
        prefix: J ? e.createElement(J) : void 0,
        value: Z,
        onChange: (i) => m(i.target.value),
        allowClear: !0,
        style: { flex: 1, minWidth: 200, maxWidth: 400 }
      }),
      // Pool install info
      e.createElement(
        p,
        { type: "secondary", style: { fontSize: 12 } },
        "安装后进入技能池"
      ),
      // Configure skill source button
      e.createElement(
        c,
        {
          icon: le ? e.createElement(le) : void 0,
          onClick: () => Xt(!0),
          size: "small"
        },
        "配置技能源"
      )
    ),
    // Dynamic category filter tags (from OSS manifest tags + imported sources)
    kt && De.length === 0 ? e.createElement(C, {
      type: "warning",
      showIcon: !0,
      message: "UGSci 官方 OSS 技能库加载失败",
      description: "请检查网络或后端 OSS 代理服务，然后点击右上角“刷新”重试。",
      style: { marginBottom: 12 }
    }) : null,
    yn.length > 0 ? e.createElement(
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
        p,
        { type: "secondary", style: { fontSize: 12, marginRight: 4 } },
        "分类:"
      ),
      e.createElement(
        h,
        {
          style: {
            fontSize: 11,
            cursor: "pointer",
            borderRadius: 12
          },
          color: Y === "" ? "blue" : void 0,
          onClick: () => B("")
        },
        "全部"
      ),
      ...yn.map((i) => {
        const P = ze.some(
          (j) => !j.isOfficial && j.sourceLabel === i.id
        );
        return e.createElement(
          h,
          {
            key: i.id,
            style: {
              fontSize: 11,
              cursor: "pointer",
              borderRadius: 12
            },
            color: Y === i.id ? P ? "blue" : "geekblue" : void 0,
            icon: P && le ? e.createElement(le) : void 0,
            onClick: () => B(
              Y === i.id ? "" : i.id
            )
          },
          i.label
        );
      })
    ) : null,
    // GitHub skills section
    at && De.length === 0 ? e.createElement(
      "div",
      { style: { textAlign: "center", padding: 40, marginBottom: 16 } },
      e.createElement(r, { size: "large" }, e.createElement("div", { style: { minHeight: 60, display: "flex", alignItems: "center", justifyContent: "center" } }, "正在加载技能..."))
    ) : zt.length > 0 ? e.createElement(
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
        le ? e.createElement(le, {
          style: { fontSize: 14, color: "#1677ff" }
        }) : null,
        e.createElement(
          p,
          { strong: !0, style: { fontSize: 13 } },
          `技能市场 (${zt.length})`
        )
      ),
      e.createElement(
        b,
        { gutter: [12, 12] },
        ...zt.map((i) => {
          const P = `github:${i.sourceId}:${i.name}`, j = X[P];
          return e.createElement(
            k,
            { key: P, xs: 24, sm: 12, md: 8, lg: 6 },
            e.createElement(
              S,
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
                le ? e.createElement(le, {
                  style: { fontSize: 18, color: "#57606a" }
                }) : e.createElement(
                  "span",
                  { style: { fontSize: 18 } },
                  "📦"
                ),
                e.createElement(
                  y,
                  { title: i.name },
                  e.createElement(
                    p,
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
                  )
                )
              ),
              e.createElement(
                u,
                {
                  type: "secondary",
                  style: { fontSize: 11, margin: 0, lineHeight: 1.4 },
                  ellipsis: { rows: 2 }
                },
                i.description || "暂无描述"
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
                  { style: { display: "flex", gap: 4, flexWrap: "wrap", alignItems: "center" } },
                  // Show source path (e.g. "UGSci/anthropics") in bottom-left
                  i.sourcePath || i.sourceLabel ? e.createElement(
                    "span",
                    {
                      style: {
                        fontSize: 10,
                        color: "#999",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 2
                      }
                    },
                    $ ? e.createElement($, { style: { fontSize: 10 } }) : null,
                    i.sourcePath || i.sourceLabel
                  ) : null,
                  // Show tag as category badge
                  i.tag ? e.createElement(
                    h,
                    { color: "geekblue", style: { fontSize: 10 } },
                    i.tag
                  ) : null,
                  i.version ? e.createElement(
                    h,
                    { style: { fontSize: 10 } },
                    `v${i.version}`
                  ) : null
                ),
                j ? e.createElement(
                  c,
                  {
                    size: "small",
                    disabled: !0,
                    icon: M ? e.createElement(M) : void 0
                  },
                  "安装中"
                ) : e.createElement(
                  c,
                  {
                    type: "primary",
                    size: "small",
                    icon: F ? e.createElement(F) : void 0,
                    onClick: () => Sa(i)
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
    Ke.length > 0 || oe ? e.createElement(
      "div",
      {
        style: {
          marginBottom: 10,
          display: "flex",
          alignItems: "center",
          gap: 6
        }
      },
      E ? e.createElement(E, {
        style: { fontSize: 14, color: "#1677ff" }
      }) : null,
      e.createElement(
        p,
        { strong: !0, style: { fontSize: 13 } },
        `技能市场${Ke.length > 0 ? ` (${Ke.length})` : ""}`
      )
    ) : null,
    // Results grid
    oe && Ke.length === 0 ? e.createElement(
      "div",
      { style: { textAlign: "center", padding: 60 } },
      e.createElement(r, { size: "large" })
    ) : Ke.length === 0 ? e.createElement(o, {
      description: Z ? `未找到匹配「${Z}」的技能` : "输入关键词搜索技能市场",
      image: o.PRESENTED_IMAGE_SIMPLE
    }) : e.createElement(
      b,
      { gutter: [12, 12] },
      ...Ke.map((i) => {
        const P = `${i.source}:${i.slug}`, j = X[P];
        return e.createElement(
          k,
          { key: P, xs: 24, sm: 12, md: 8, lg: 6 },
          e.createElement(
            S,
            {
              hoverable: !0,
              size: "small",
              style: { height: "100%", cursor: "pointer" },
              onClick: () => T(i)
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
              i.icon_url ? e.createElement("img", {
                src: i.icon_url,
                alt: i.name,
                style: { width: 24, height: 24, borderRadius: 4 }
              }) : e.createElement(
                "span",
                { style: { fontSize: 18 } },
                "📦"
              ),
              e.createElement(
                y,
                { title: i.name },
                e.createElement(
                  p,
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
                )
              )
            ),
            e.createElement(
              u,
              {
                type: "secondary",
                style: { fontSize: 11, margin: 0, lineHeight: 1.4 },
                ellipsis: { rows: 2 }
              },
              i.description || "暂无描述"
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
                  h,
                  { color: "geekblue", style: { fontSize: 10 } },
                  i.source
                ),
                i.version ? e.createElement(
                  h,
                  { style: { fontSize: 10 } },
                  `v${i.version}`
                ) : null
              ),
              j ? e.createElement(
                c,
                {
                  size: "small",
                  disabled: !0,
                  icon: M ? e.createElement(M) : void 0
                },
                "安装中"
              ) : e.createElement(
                c,
                {
                  type: "primary",
                  size: "small",
                  icon: F ? e.createElement(F) : void 0,
                  onClick: (me) => {
                    me.stopPropagation(), fn(i);
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
    Ee && !oe ? e.createElement(
      "div",
      { style: { textAlign: "center", marginTop: 16 } },
      e.createElement(
        c,
        { onClick: va, loading: oe },
        "加载更多"
      )
    ) : null,
    // Detail Drawer
    D ? e.createElement(
      U,
      {
        title: e.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 8 } },
          D.icon_url ? e.createElement("img", {
            src: D.icon_url,
            alt: D.name,
            style: { width: 28, height: 28, borderRadius: 4 }
          }) : e.createElement(
            "span",
            { style: { fontSize: 20 } },
            "📦"
          ),
          e.createElement("span", null, D.name)
        ),
        open: !0,
        onClose: () => T(null),
        width: 480,
        extra: e.createElement(
          c,
          {
            type: "primary",
            icon: F ? e.createElement(F) : void 0,
            onClick: () => {
              fn(D);
            }
          },
          "安装到技能池"
        )
      },
      e.createElement(
        N,
        { column: 1, bordered: !0, size: "small" },
        e.createElement(
          N.Item,
          { label: "来源" },
          D.source
        ),
        e.createElement(
          N.Item,
          { label: "描述" },
          D.description || "-"
        ),
        D.version ? e.createElement(
          N.Item,
          { label: "版本" },
          D.version
        ) : null,
        D.author ? e.createElement(
          N.Item,
          { label: "作者" },
          D.author
        ) : null,
        e.createElement(
          N.Item,
          { label: "来源链接" },
          e.createElement(
            "a",
            { href: D.source_url, target: "_blank" },
            D.source_url
          )
        )
      ),
      D.stats ? e.createElement(
        "div",
        { style: { marginTop: 16 } },
        e.createElement(
          p,
          {
            strong: !0,
            style: { display: "block", marginBottom: 8 }
          },
          "统计"
        ),
        e.createElement(
          "div",
          { style: { display: "flex", gap: 12, flexWrap: "wrap" } },
          ...Object.entries(D.stats).map(
            ([i, P]) => e.createElement(
              "div",
              { key: i, style: { textAlign: "center" } },
              e.createElement(
                "div",
                {
                  style: {
                    fontSize: 18,
                    fontWeight: 600,
                    color: "#1677ff"
                  }
                },
                String(P)
              ),
              e.createElement(
                p,
                { type: "secondary", style: { fontSize: 11 } },
                i
              )
            )
          )
        )
      ) : null
    ) : null
  ), It = n(() => {
    let i = on;
    if (Je && (i = i.filter((P) => P.category === Je)), xe.trim()) {
      const P = xe.toLowerCase();
      i = i.filter(
        (j) => j.name.toLowerCase().includes(P) || j.description.toLowerCase().includes(P) || j.tags.some((me) => me.toLowerCase().includes(P))
      );
    }
    return i;
  }, [on, xe, Je]), Ca = async (i) => {
    if (!_t) {
      gn(!0);
      try {
        let P = i.description;
        if (i.instructions)
          try {
            const ge = i.instructions.replace(/^\/+/, ""), be = await fetch(ot(ge));
            be.ok && (P = await be.text());
          } catch {
          }
        let j = [];
        if (i.skills_manifest)
          try {
            const ge = i.skills_manifest.replace(/^\/+/, ""), be = await fetch(ot(ge));
            if (be.ok) {
              const fe = await be.json();
              Array.isArray(fe) ? j = fe.map((Be) => typeof Be == "string" ? Be : Be.name).filter(Boolean) : fe.skills && (j = fe.skills.map((Be) => typeof Be == "string" ? Be : Be.name).filter(Boolean));
            }
          } catch {
          }
        const me = await ce("/agents", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: i.name,
            description: i.description,
            skill_names: j
          })
        });
        await bt(me.id, "AGENTS.md", P), f.success(`专家「${i.name}」创建成功，已跳转至专家`), ba("/ugsci-experts");
      } catch (P) {
        f.error(P.message || "创建专家失败");
      } finally {
        gn(!1);
      }
    }
  }, hn = a(async (i) => {
    if (i)
      try {
        const P = await Wt(i);
        Ge(new Set(P.map((j) => j.key)));
      } catch {
        Ge(/* @__PURE__ */ new Set());
      }
  }, []);
  l(() => {
    Pe && hn(Pe);
  }, [Pe, hn]);
  const xa = async (i) => {
    if (!Pe) {
      f.warning("请先选择目标专家");
      return;
    }
    if (tl(i)) {
      const P = Object.entries(i.env), j = {};
      for (const [me] of P)
        j[me] = "";
      ee(j), Ie(i);
      return;
    }
    await vn(i, i.env || {});
  }, vn = async (i, P) => {
    et((j) => ({ ...j, [i.id]: !0 }));
    try {
      const j = i.id;
      await Gn(Pe, {
        client_key: j,
        client: {
          name: i.name,
          description: i.description,
          enabled: !0,
          transport: i.transport,
          url: i.url || "",
          command: i.command || "",
          args: i.args || [],
          env: P,
          cwd: i.cwd || "",
          headers: i.headers || {}
        }
      }), f.success(`MCP「${i.name}」已添加到当前专家`), Ge((me) => new Set(me).add(j));
    } catch (j) {
      f.error(j.message || `添加 MCP「${i.name}」失败`);
    } finally {
      et((j) => ({ ...j, [i.id]: !1 }));
    }
  }, ka = async () => {
    if (!Te) return;
    const i = [];
    for (const [j, me] of Object.entries(ke))
      if (!me || !me.trim()) {
        const ge = Cn[j];
        i.push((ge == null ? void 0 : ge.label) || j);
      }
    if (i.length > 0) {
      f.warning(`请填写以下配置项: ${i.join(", ")}`);
      return;
    }
    const P = Te;
    Ie(null), ee({}), await vn(P, { ...ke });
  }, Ot = n(() => {
    let i = Zt;
    if (We && (i = i.filter((P) => P.category === We)), Ne.trim()) {
      const P = Ne.toLowerCase();
      i = i.filter(
        (j) => j.name.toLowerCase().includes(P) || j.description.toLowerCase().includes(P) || j.tags.some((me) => me.toLowerCase().includes(P))
      );
    }
    return i.map(os);
  }, [Zt, Ne, We]), _a = e.createElement(
    "div",
    null,
    // Search + agent selector
    e.createElement(
      "div",
      {
        style: {
          display: "flex",
          gap: 12,
          marginBottom: 16,
          flexWrap: "wrap",
          alignItems: "center"
        }
      },
      e.createElement(d, {
        placeholder: "搜索 MCP 服务器...",
        prefix: J ? e.createElement(J) : void 0,
        value: Ne,
        onChange: (i) => it(i.target.value),
        allowClear: !0,
        style: { maxWidth: 300 }
      }),
      e.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        e.createElement(
          p,
          { type: "secondary", style: { fontSize: 12, whiteSpace: "nowrap" } },
          "安装到："
        ),
        e.createElement(L, {
          value: Pe,
          onChange: (i) => tt(i),
          style: { minWidth: 180 },
          size: "small",
          options: q.map((i) => ({ value: i.id, label: i.name }))
        })
      ),
      // Configure MCP source button
      e.createElement(
        c,
        {
          icon: $ ? e.createElement($) : void 0,
          onClick: () => Vt(!0),
          size: "small"
        },
        "配置 MCP 源"
      )
    ),
    // Dynamic category tag row (from OSS manifest tag_groups)
    tn.length > 0 ? e.createElement(
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
        p,
        { type: "secondary", style: { fontSize: 12, marginRight: 4 } },
        "分类:"
      ),
      e.createElement(
        h,
        {
          style: { fontSize: 11, cursor: "pointer", borderRadius: 12 },
          color: We === "" ? "blue" : void 0,
          onClick: () => sn("")
        },
        "全部"
      ),
      ...tn.map(
        (i) => e.createElement(
          h,
          {
            key: i.id,
            style: { fontSize: 11, cursor: "pointer", borderRadius: 12 },
            color: We === i.id ? "geekblue" : void 0,
            onClick: () => sn(
              We === i.id ? "" : i.id
            )
          },
          i.label
        )
      )
    ) : null,
    // MCP server cards (dynamic from OSS)
    an && Ot.length === 0 ? e.createElement(
      "div",
      { style: { textAlign: "center", padding: 40 } },
      e.createElement(r, { size: "large" }, e.createElement("div", { style: { minHeight: 60, display: "flex", alignItems: "center", justifyContent: "center" } }, "正在加载 MCP 服务器..."))
    ) : Ot.length === 0 ? e.createElement(o, {
      description: "未找到匹配的 MCP 服务器",
      image: o.PRESENTED_IMAGE_SIMPLE
    }) : e.createElement(
      b,
      { gutter: [12, 12] },
      ...Ot.map(
        (i) => e.createElement(
          k,
          { key: i.id, xs: 24, sm: 12, md: 8 },
          e.createElement(
            S,
            {
              hoverable: !0,
              size: "small",
              style: { height: "100%" }
            },
            // Header: emoji + name + tags
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
                { style: { fontSize: 28, display: "inline-flex", alignItems: "center", justifyContent: "center", width: 32, height: 32 } },
                i.iconUrl ? e.createElement("img", {
                  src: i.iconUrl,
                  alt: i.name,
                  style: { width: 28, height: 28, objectFit: "contain" },
                  onError: (P) => {
                    P.target.style.display = "none";
                  }
                }) : i.emoji
              ),
              e.createElement(
                "div",
                { style: { flex: 1 } },
                e.createElement(
                  p,
                  { strong: !0, style: { fontSize: 14 } },
                  i.name
                ),
                e.createElement(
                  "div",
                  { style: { display: "flex", gap: 4, marginTop: 4, flexWrap: "wrap" } },
                  e.createElement(
                    h,
                    { color: "blue", style: { fontSize: 10 } },
                    i.category
                  ),
                  e.createElement(
                    h,
                    {
                      color: i.transport === "stdio" ? "purple" : "cyan",
                      style: { fontSize: 10 }
                    },
                    i.transport
                  ),
                  i.env && Object.keys(i.env).length > 0 ? e.createElement(
                    h,
                    { color: "orange", style: { fontSize: 10 } },
                    "需配置密钥"
                  ) : null
                )
              )
            ),
            // Description
            e.createElement(
              u,
              {
                type: "secondary",
                style: { fontSize: 12, margin: 0, lineHeight: 1.5 },
                ellipsis: { rows: 3 }
              },
              i.description
            ),
            // Footer: config preview + install button
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
                p,
                { type: "secondary", style: { fontSize: 11 } },
                i.transport === "stdio" ? `${i.command} ${(i.args || []).join(" ")}` : i.url || ""
              ),
              mt.has(i.id) ? e.createElement(
                c,
                { size: "small", disabled: !0 },
                "已安装"
              ) : e.createElement(
                c,
                {
                  type: "primary",
                  size: "small",
                  loading: !!ct[i.id],
                  icon: $ ? e.createElement($) : void 0,
                  onClick: () => xa(i)
                },
                "安装"
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
      E ? e.createElement(E, {
        style: { fontSize: 24, color: "#bfbfbf", marginBottom: 8 }
      }) : null,
      e.createElement(
        p,
        { type: "secondary", style: { fontSize: 12 } },
        "MCP 服务器列表来自 UGSci 官方源，自动同步更新"
      )
    )
  ), Ta = Te ? e.createElement(
    x,
    {
      title: e.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 8 } },
        e.createElement("span", { style: { fontSize: 20, display: "inline-flex", alignItems: "center", justifyContent: "center", width: 24, height: 24 } }, Te.iconUrl ? e.createElement("img", { src: Te.iconUrl, alt: Te.name, style: { width: 22, height: 22, objectFit: "contain" }, onError: (i) => {
          i.target.style.display = "none";
        } }) : Te.emoji),
        e.createElement("span", null, `配置 ${Te.name} 密钥`)
      ),
      open: !!Te,
      onCancel: () => {
        Ie(null), ee({});
      },
      onOk: ka,
      okText: "安装",
      cancelText: "取消",
      width: 520,
      destroyOnClose: !0
    },
    // Description
    e.createElement(
      p,
      { type: "secondary", style: { display: "block", marginBottom: 16, fontSize: 12 } },
      Te.description
    ),
    ...Object.entries(Te.env || {}).map(([i]) => {
      const P = Cn[i], j = (P == null ? void 0 : P.isSecret) !== !1;
      return e.createElement(
        "div",
        { key: i, style: { marginBottom: 16 } },
        e.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 6, marginBottom: 4 } },
          e.createElement(
            p,
            { strong: !0, style: { fontSize: 13 } },
            (P == null ? void 0 : P.label) || i
          ),
          e.createElement(
            h,
            { color: "orange", style: { fontSize: 10 } },
            "必填"
          )
        ),
        // Help text with optional link
        P ? e.createElement(
          "div",
          { style: { marginBottom: 6, fontSize: 12, color: "#8c8c8c" } },
          P.help,
          P.link ? e.createElement(
            "a",
            {
              href: P.link,
              target: "_blank",
              rel: "noopener noreferrer",
              style: { marginLeft: 4, fontSize: 12 }
            },
            "获取方式 ↗"
          ) : null
        ) : null,
        // Input field
        j ? e.createElement(d.Password, {
          placeholder: `请输入 ${(P == null ? void 0 : P.label) || i}`,
          value: ke[i] || "",
          onChange: (me) => ee((ge) => ({
            ...ge,
            [i]: me.target.value
          })),
          style: { width: "100%" }
        }) : e.createElement(d, {
          placeholder: `请输入 ${(P == null ? void 0 : P.label) || i}`,
          value: ke[i] || "",
          onChange: (me) => ee((ge) => ({
            ...ge,
            [i]: me.target.value
          })),
          style: { width: "100%" }
        }),
        // Show env key name for reference
        e.createElement(
          p,
          { type: "secondary", style: { fontSize: 11, display: "block", marginTop: 2 } },
          `环境变量名: ${i}`
        )
      );
    })
  ) : null, za = e.createElement(
    "div",
    null,
    e.createElement(
      "div",
      {
        style: {
          marginBottom: 16,
          display: "flex",
          gap: 12,
          alignItems: "center",
          flexWrap: "wrap"
        }
      },
      e.createElement(d, {
        placeholder: "搜索专家模板...",
        prefix: J ? e.createElement(J) : void 0,
        value: xe,
        onChange: (i) => _e(i.target.value),
        allowClear: !0,
        style: { maxWidth: 400, flex: 1, minWidth: 200 }
      }),
      e.createElement(
        c,
        {
          icon: K ? e.createElement(K) : void 0,
          onClick: () => Qt(!0),
          size: "small"
        },
        "配置专家源"
      )
    ),
    // Dynamic category tag row (from OSS manifest tag_groups)
    cn.length > 0 ? e.createElement(
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
        p,
        { type: "secondary", style: { fontSize: 12, marginRight: 4 } },
        "分类:"
      ),
      e.createElement(
        h,
        {
          style: { fontSize: 11, cursor: "pointer", borderRadius: 12 },
          color: Je === "" ? "blue" : void 0,
          onClick: () => pn("")
        },
        "全部"
      ),
      ...cn.map(
        (i) => e.createElement(
          h,
          {
            key: i.id,
            style: { fontSize: 11, cursor: "pointer", borderRadius: 12 },
            color: Je === i.id ? "geekblue" : void 0,
            onClick: () => pn(
              Je === i.id ? "" : i.id
            )
          },
          i.label
        )
      )
    ) : null,
    // Agent cards (dynamic from OSS)
    dn && It.length === 0 ? e.createElement(
      "div",
      { style: { textAlign: "center", padding: 40 } },
      e.createElement(r, { size: "large" }, e.createElement("div", { style: { minHeight: 60, display: "flex", alignItems: "center", justifyContent: "center" } }, "正在加载专家模板..."))
    ) : It.length === 0 ? e.createElement(o, {
      description: "未找到匹配的专家模板",
      image: o.PRESENTED_IMAGE_SIMPLE
    }) : e.createElement(
      b,
      { gutter: [12, 12] },
      ...It.map(
        (i) => e.createElement(
          k,
          { key: i.id, xs: 24, sm: 12, md: 8 },
          e.createElement(
            S,
            {
              hoverable: !0,
              size: "small",
              style: { height: "100%", cursor: "pointer" },
              onClick: () => Ca(i)
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
              e.createElement(Re, {
                name: i.name,
                size: 40
              }),
              e.createElement(
                "div",
                { style: { flex: 1 } },
                e.createElement(
                  p,
                  { strong: !0, style: { fontSize: 14 } },
                  i.name
                ),
                e.createElement(
                  "div",
                  { style: { display: "flex", gap: 4, marginTop: 4, flexWrap: "wrap" } },
                  i.category ? e.createElement(
                    h,
                    { color: "blue", style: { fontSize: 10 } },
                    rt(i.category)
                  ) : null,
                  i.tags.includes("mcp") ? e.createElement(
                    h,
                    { color: "purple", style: { fontSize: 10 } },
                    "MCP"
                  ) : null
                )
              )
            ),
            e.createElement(
              u,
              {
                type: "secondary",
                style: { fontSize: 12, margin: 0, lineHeight: 1.5 },
                ellipsis: { rows: 3 }
              },
              i.description
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
                p,
                { type: "secondary", style: { fontSize: 11 } },
                i.tags.filter((P) => P !== "agent" && P !== "template" && P !== "workspace").slice(0, 3).join(" · ") || "专家模板"
              ),
              e.createElement(
                c,
                {
                  type: "primary",
                  size: "small",
                  loading: _t,
                  disabled: _t,
                  icon: I ? e.createElement(I) : void 0
                },
                "一键创建"
              )
            )
          )
        )
      )
    ),
    // Info hint
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
      E ? e.createElement(E, {
        style: { fontSize: 24, color: "#bfbfbf", marginBottom: 8 }
      }) : null,
      e.createElement(
        p,
        { type: "secondary", style: { fontSize: 12 } },
        "专家模板来自 UGSci 官方源，自动同步更新"
      )
    )
  ), Ia = [
    {
      key: "skills",
      label: e.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        I ? e.createElement(I, { style: { fontSize: 14 } }) : null,
        "技能市场"
      ),
      children: wa
    },
    {
      key: "mcp",
      label: e.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        $ ? e.createElement($, { style: { fontSize: 14 } }) : null,
        "MCP 市场"
      ),
      children: _a
    },
    {
      key: "experts",
      label: e.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        K ? e.createElement(K, { style: { fontSize: 14 } }) : null,
        "专家模板"
      ),
      children: za
    }
  ];
  return e.createElement(
    "div",
    { style: { padding: 24 } },
    e.createElement(Ct, {
      title: "市场",
      subtitle: "浏览技能市场 · 选择 MCP 服务器 · 创建专家模板 · 随时更新能力和专家",
      extra: e.createElement(
        "div",
        { style: { display: "flex", gap: 8 } },
        e.createElement(
          c,
          {
            type: "primary",
            icon: _ ? e.createElement(_) : void 0,
            onClick: () => {
              pt(Z, Y, {}), ut(), Tt();
            },
            loading: oe || at || an || dn
          },
          "刷新"
        )
      )
    }),
    e.createElement(te, {
      items: Ia,
      activeKey: ne,
      onChange: (i) => R(i)
    }),
    // Skill source config modal
    e.createElement(hs, {
      open: pa,
      onClose: () => Xt(!1),
      sources: Ce,
      onChange: (i) => {
        Se(i), ut(i);
      }
    }),
    // MCP source config modal
    e.createElement(On, {
      open: fa,
      onClose: () => Vt(!1),
      sources: ga,
      onChange: (i) => qt(i),
      type: "mcp"
    }),
    // MCP token config modal (for templates requiring secrets)
    Ta,
    // Expert source config modal
    e.createElement(On, {
      open: Ea,
      onClose: () => Qt(!1),
      sources: ya,
      onChange: (i) => Yt(i),
      type: "expert"
    })
  );
}
function Cs() {
  try {
    const t = localStorage.getItem("language") || "";
    if (t) return t.split("-")[0];
  } catch {
  }
  return ((typeof navigator < "u" ? navigator.language : "") || "").split("-")[0] || "en";
}
const Mn = {
  zh: "您好，UGSci 智能助手在线。无论是油气藏分析、数值模拟还是工程决策，描述您的场景，我来交付结果。",
  en: "UGSci AI assistant is online. From reservoir analysis to numerical simulation and engineering decisions — describe your scenario and I'll deliver results.",
  ja: "UGSci AIアシスタントがオンラインです。油層解析、数値シミュレーション、エンジニアリングの意思決定など、シナリオを描写してください。結果をお届けします。",
  ru: "UGSci AI-ассистент онлайн. От анализа пласта до численного моделирования и инженерных решений — опишите свой сценарий, и я предоставлю результат.",
  vi: "Trợ lý AI UGSci đang trực tuyến. Từ phân tích mỏ, mô phỏng số đến ra quyết định kỹ thuật — mô tả kịch bản của bạn, tôi sẽ giao kết quả.",
  id: "Asisten AI UGSci sedang online. Dari analisis reservoir, simulasi numerik hingga keputusan engineering — jelaskan skenario Anda, saya akan memberikan hasilnya."
}, $n = {
  zh: { label: "能告诉我你都能做点什么吗？", value: "能告诉我你都能做点什么吗" },
  en: { label: "Can you tell me what you can do?", value: "Can you tell me what you can do?" },
  ja: { label: "あなたができることを教えてください", value: "あなたができることを教えてください" },
  ru: { label: "Расскажи, что ты умеешь делать?", value: "Расскажи, что ты умеешь делать?" },
  vi: { label: "Bạn có thể cho tôi biết bạn làm được gì không?", value: "Bạn có thể cho tôi biết bạn làm được gì không?" },
  id: { label: "Bisa cerita apa saja yang bisa Anda lakukan?", value: "Bisa cerita apa saja yang bisa Anda lakukan?" }
};
function xs() {
  const e = z(), t = e.React, { useEffect: l, useRef: a } = t, n = e.useSelectedAgent ? e.useSelectedAgent() : { id: "default" }, s = (n == null ? void 0 : n.id) || "default", r = a(null), o = a(null);
  return l(() => {
    if (r.current === s) return;
    r.current = s;
    const d = Cs(), c = Mn[d] || Mn.en, f = $n[d] || $n.en;
    let b = !1;
    return (async () => {
      var k, S;
      try {
        const h = await wt(s);
        if (b) return;
        const y = Nn(h);
        if (o.current) {
          try {
            o.current();
          } catch {
          }
          o.current = null;
        }
        const A = window.QwenPaw;
        (k = A == null ? void 0 : A.chat) != null && k.welcome && (y.length > 0 ? (o.current = A.chat.welcome.set("ugsci", {
          description: c,
          prompts: y
        }), console.info(
          `[ugsci] Injected ${y.length} welcome prompts for agent "${s}"`
        )) : (o.current = A.chat.welcome.set("ugsci", {
          description: c,
          prompts: [f]
        }), console.info(
          `[ugsci] No skills for agent "${s}" — using default prompt`
        )));
      } catch (h) {
        console.warn(
          `[ugsci] Failed to inject welcome prompts for agent "${s}":`,
          h
        );
        const y = window.QwenPaw;
        if ((S = y == null ? void 0 : y.chat) != null && S.welcome && !b) {
          if (o.current) {
            try {
              o.current();
            } catch {
            }
            o.current = null;
          }
          o.current = y.chat.welcome.set("ugsci", {
            description: c,
            prompts: [f]
          });
        }
      }
    })(), () => {
      b = !0;
    };
  }, [s]), null;
}
function ks() {
  var c, f, b;
  const e = window.QwenPaw;
  if (!(e != null && e.menu) || !(e != null && e.route)) {
    console.warn(
      "[ugsci] QwenPaw.menu/route API not available — plugin disabled"
    );
    return;
  }
  const t = z().React, l = "ugsci";
  (f = (c = e.chat) == null ? void 0 : c.rightHeader) != null && f.add ? (e.chat.rightHeader.add(l, t.createElement(xs), {
    id: "ugsci.welcome-injector",
    order: -1
    // render before other right-header items (invisible anyway)
  }), console.info("[ugsci] WelcomePromptsInjector registered via rightHeader")) : console.warn(
    "[ugsci] QP.chat.rightHeader.add not available — agent-specific welcome prompts disabled"
  );
  const a = z().antdIcons || {}, n = a.UserSwitchOutlined, s = a.ToolOutlined, r = a.ThunderboltOutlined, o = a.ShopOutlined;
  e.route.add(l, {
    id: "ugsci.experts",
    path: "/ugsci-experts",
    component: $l
  }), e.menu.add(l, {
    id: "ugsci.experts",
    location: "primary.agentScoped",
    label: () => "专家",
    icon: n ? t.createElement(n, { style: { fontSize: 16 } }) : void 0,
    route: "ugsci.experts",
    order: 5,
    visible: () => Xe()
  }), e.route.add(l, {
    id: "ugsci.capabilities",
    path: "/ugsci-capabilities",
    component: ts
  }), e.menu.add(l, {
    id: "ugsci.capabilities",
    location: "primary.agentScoped",
    label: () => "工具",
    icon: s ? t.createElement(s, { style: { fontSize: 16 } }) : void 0,
    route: "ugsci.capabilities",
    order: 6,
    visible: () => Xe()
  }), e.route.add(l, {
    id: "ugsci.skills-center",
    path: "/ugsci-skills",
    component: ls
  }), e.menu.add(l, {
    id: "ugsci.skills-center",
    location: "primary.agentScoped",
    label: () => "技能",
    icon: r ? t.createElement(r, { style: { fontSize: 16 } }) : void 0,
    route: "ugsci.skills-center",
    order: 7,
    visible: () => Xe()
  }), e.route.add(l, {
    id: "ugsci.market",
    path: "/ugsci-market",
    component: ws
  }), e.menu.add(l, {
    id: "ugsci.market",
    location: "primary.agentScoped",
    label: () => "市场",
    icon: o ? t.createElement(o, { style: { fontSize: 16 } }) : void 0,
    route: "ugsci.market",
    order: 8,
    visible: () => Xe()
  }), (b = e.sidebar) != null && b.registerSimpleModeItems ? (e.sidebar.registerSimpleModeItems([
    "ugsci.experts",
    "ugsci.capabilities",
    "ugsci.skills-center",
    "ugsci.market"
  ]), console.info("[ugsci] Registered 4 items for simple-mode visibility")) : console.warn(
    "[ugsci] window.QwenPaw.sidebar.registerSimpleModeItems not available — items will not appear in simple mode"
  );
  const d = [
    "core.skills",
    "core.tools",
    "core.acp",
    "core.agent-config",
    "core.agent-stats",
    "core.skill-pool"
  ];
  for (const k of d) {
    try {
      const h = e.menu.snapshot("primary.agentScoped").find((y) => y.id === k);
      h && e.menu.replace(l, k, {
        ...h,
        visible: () => !Xe()
      });
    } catch {
    }
    try {
      const h = e.menu.snapshot("primary.settings").find((y) => y.id === k);
      h && e.menu.replace(l, k, {
        ...h,
        visible: () => !Xe()
      });
    } catch {
    }
  }
  console.info(
    "[ugsci] Plugin registered: 4 routes + menu items, simple-mode whitelist + simplified navigation active"
  );
}
function Lt() {
  try {
    ks();
  } catch (e) {
    console.error("[ugsci] Failed to build plugin:", e), setTimeout(Lt, 500);
  }
}
var Rn;
if ((Rn = window.QwenPaw) != null && Rn.host)
  Lt();
else {
  const e = setInterval(() => {
    var t;
    (t = window.QwenPaw) != null && t.host && (clearInterval(e), Lt());
  }, 200);
  setTimeout(() => clearInterval(e), 1e4);
}
