function Ut() {
  var t;
  const e = (t = window.QwenPaw) == null ? void 0 : t.host;
  if (!e) throw new Error("[ugsci] QwenPaw.host not available");
  return e;
}
function Aa(e) {
  const t = Ut().getApiToken() || "";
  return {
    "Content-Type": "application/json",
    ...t ? { Authorization: `Bearer ${t}` } : {},
    ...e ? { "X-Agent-Id": e } : {}
  };
}
async function Bn(e, t, l) {
  try {
    const a = await fetch(Ut().getApiUrl(e), {
      headers: Aa(t),
      signal: l
    });
    return a.ok ? await a.json() : null;
  } catch {
    return null;
  }
}
function Pa(e, t) {
  return Bn("/ugsci/team/state", e, t);
}
async function $a() {
  const e = await Bn(
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
}, wn = [
  "plan",
  "dispatch",
  "verify",
  "synthesize",
  "completed"
], Ra = 3;
function La() {
  const e = Ut(), t = e.React, { useState: l, useEffect: a, useCallback: n, useRef: s } = t, { Card: r, Tag: o, Typography: d, Button: c, Steps: g, Empty: w, Alert: b } = e.antd, { ReloadOutlined: h } = e.antdIcons || {}, { Text: v, Paragraph: y } = d, O = e.useSelectedAgent ? e.useSelectedAgent() : { id: "default" }, L = (O == null ? void 0 : O.id) || "default", [U, N] = l(null), [te, G] = l(!1), W = s(null), x = s(0), k = s(0), _ = s(null), X = n(
    async (u) => {
      var V;
      (V = _.current) == null || V.abort();
      const A = new AbortController();
      _.current = A;
      const ne = ++k.current;
      u && G(!0);
      const R = await Pa(L, A.signal);
      A.signal.aborted || ne !== k.current || (R ? (x.current = 0, W.current = R, N(R)) : x.current += 1, G(!1));
    },
    [L]
  ), F = n(() => X(!0), [X]);
  if (a(() => {
    var A;
    (A = _.current) == null || A.abort(), k.current += 1, x.current = 0, W.current = null, N(null), F();
    const u = window.setInterval(() => {
      var ne, R;
      x.current >= Ra || ((ne = W.current) == null ? void 0 : ne.status) === "completed" || ((R = W.current) == null ? void 0 : R.status) === "terminated" || X(!1);
    }, 5e3);
    return () => {
      var ne;
      window.clearInterval(u), (ne = _.current) == null || ne.abort(), k.current += 1;
    };
  }, [L, X, F]), (U == null ? void 0 : U.status) === "unreadable")
    return t.createElement(b, {
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
      return t.createElement(b, {
        type: u ? "success" : "info",
        showIcon: !0,
        message: u ? "专家团工作流已完成" : "专家团工作流已终止",
        description: u ? `实例 ${U.instance_id || "未知"} 已完成，结果文件保留在工作区。` : `原因：${U.state.termination_reason || "未知"}`,
        style: { marginBottom: 16 }
      });
    }
    return t.createElement(w, {
      description: "暂无活跃的专家团工作流",
      style: { padding: 24 }
    });
  }
  const I = U.state, E = I.current_phase || "plan", f = wn.indexOf(E), $ = I.team_name || "未知团队", K = I.team_mode || "pipeline", Q = I.iteration || 0, le = I.members || [], M = I.verify_retries || 0, p = {
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
        t.createElement(v, { strong: !0 }, `${$} — 工作流状态`),
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
        M > 0 ? t.createElement(
          o,
          { color: "orange", style: { fontSize: 10 } },
          `验证重试 ${M}`
        ) : null
      ),
      extra: t.createElement(
        c,
        {
          size: "small",
          type: "text",
          icon: h ? t.createElement(h) : void 0,
          onClick: F,
          loading: te
        },
        "刷新"
      )
    },
    t.createElement(g, {
      current: f,
      size: "small",
      items: wn.map((u) => {
        const A = Ma[u];
        return {
          title: `${A.icon} ${A.label}`,
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
        (u, A) => t.createElement(
          o,
          { key: `${u.name}-${A}`, style: { fontSize: 11 } },
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
function ja() {
  try {
    return z().getApiToken() || "";
  } catch {
    return "";
  }
}
function Ne(e) {
  return z().getApiUrl(e);
}
function bt(e) {
  const t = ja();
  return {
    "Content-Type": "application/json",
    ...t ? { Authorization: `Bearer ${t}` } : {},
    ...e
  };
}
const it = /* @__PURE__ */ new Map(), Ba = 15e3;
function Ua(e) {
  return e ? e instanceof Headers ? e.get("X-Agent-Id") || e.get("x-agent-id") || "" : e["X-Agent-Id"] || e["x-agent-id"] || "" : "";
}
function Na(e, t, l) {
  return `${e}:${t}:${l}`;
}
function et() {
  it.clear();
}
function xt(e) {
  for (const [t, l] of it)
    (e ? l.agentId === e : l.agentId) && it.delete(t);
}
async function ce(e, t) {
  const l = ((t == null ? void 0 : t.method) || "GET").toUpperCase(), { bypassCache: a, ...n } = t || {}, s = Ua(
    n.headers
  ), r = Na(l, e, s);
  if (l !== "GET" && (s ? xt(s) : et()), l === "GET" && !a) {
    const c = it.get(r);
    if (c && Date.now() - c.ts < Ba)
      return c.data;
  }
  const o = await fetch(Ne(e), {
    ...n,
    headers: { ...bt(), ...n.headers || {} }
  });
  if (!o.ok) {
    const c = await o.text().catch(() => "");
    throw new Error(c || `HTTP ${o.status}`);
  }
  if (o.status === 204) return null;
  const d = await o.json();
  return l === "GET" && it.set(r, {
    data: d,
    ts: Date.now(),
    agentId: s || void 0
  }), d;
}
function Cn(e) {
  return Ne(`/ugsci/avatar/${encodeURIComponent(e)}`);
}
function xn(e) {
  const t = e.map(encodeURIComponent).join(",");
  return Ne(`/ugsci/avatar/team/${t}`);
}
function Le({
  name: e,
  size: t = 32,
  borderRadius: l = "50%"
}) {
  const a = z().React, [n, s] = a.useState(0), r = n === 0 ? Cn(e) : `${Cn(e)}?_r=${n}`;
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
function Nt({
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
  const r = e.slice(0, 5), o = n === 0 ? xn(r) : `${xn(r)}?_r=${n}`;
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
const Un = "ugsci_custom_teams";
function Da(e) {
  if (!e || typeof e != "object") return !1;
  const t = e;
  return typeof t.id == "string" && typeof t.name == "string" && typeof t.taskTemplate == "string" && typeof t.orchestrationPrompt == "string" && Array.isArray(t.members);
}
function ht() {
  try {
    const e = JSON.parse(
      localStorage.getItem(Un) || "[]"
    );
    return Array.isArray(e) ? e.filter(Da) : [];
  } catch {
    return [];
  }
}
function Nn(e) {
  try {
    localStorage.setItem(Un, JSON.stringify(e));
  } catch {
  }
}
async function Fa(e) {
  var n, s;
  const t = (n = e.body) == null ? void 0 : n.getReader();
  if (!t) return;
  const l = new TextDecoder();
  let a = "";
  try {
    for (; ; ) {
      const { done: r, value: o } = await t.read();
      if (r) break;
      a += l.decode(o, { stream: !0 });
      let d;
      for (; (d = a.indexOf(`

`)) >= 0; ) {
        const c = a.slice(0, d);
        a = a.slice(d + 2);
        for (const g of c.split(`
`)) {
          if (!g.startsWith("data: ")) continue;
          const w = g.slice(6);
          let b;
          try {
            b = JSON.parse(w);
          } catch {
            continue;
          }
          if (b.error) {
            const h = b.error, v = typeof h == "string" ? h : (h == null ? void 0 : h.message) || "工作流启动失败";
            throw new Error(v);
          }
          if (b.object === "response" || b.type === "response") {
            const h = b.status;
            if (h === "failed" || h === "error") {
              const v = ((s = b.error) == null ? void 0 : s.message) || "工作流启动失败";
              throw new Error(v);
            }
            return;
          }
          if (b.object === "content" || b.type === "message")
            return;
        }
      }
    }
  } finally {
    t.releaseLock();
  }
}
async function Ga(e, t, l) {
  const a = `console:default:team-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, n = await fetch(Ne("/chats"), {
    method: "POST",
    headers: {
      ...bt(),
      "X-Agent-Id": e
    },
    body: JSON.stringify({
      session_id: a,
      user_id: "default",
      channel: "console",
      name: l ? `团队：${l}` : "团队任务"
    })
  });
  if (!n.ok) {
    const d = await n.text().catch(() => "");
    throw new Error(
      d || `创建会话失败 (HTTP ${n.status})`
    );
  }
  const r = (await n.json()).id, o = await fetch(Ne("/console/chat"), {
    method: "POST",
    headers: {
      ...bt(),
      "X-Agent-Id": e
    },
    body: JSON.stringify({
      channel: "console",
      user_id: "default",
      session_id: a,
      stream: !0,
      input: [
        {
          role: "user",
          content: [{ type: "text", text: t }]
        }
      ]
    })
  });
  if (!o.ok) {
    const d = await o.text().catch(() => "");
    throw new Error(d || `HTTP ${o.status}`);
  }
  return await Fa(o), r;
}
async function Ha(e) {
  const t = await fetch(Ne("/ugsci/team/custom"), {
    method: "POST",
    headers: { ...bt(), "Content-Type": "application/json" },
    body: JSON.stringify({
      name: e.name,
      mode: e.mode,
      members: e.members,
      steps: e.steps || [],
      orchestrationPrompt: e.orchestrationPrompt,
      coordinatorName: e.coordinatorName || void 0,
      taskTemplate: e.taskTemplate
    })
  });
  if (!t.ok) {
    const a = await t.text().catch(() => "");
    throw new Error(a || `HTTP ${t.status}`);
  }
  return (await t.json()).team_id;
}
function St(e, t) {
  var n;
  const l = t.replace(/\s+/g, ""), a = e.find(
    (s) => s.name === t || s.name.replace(/\s+/g, "") === l
  );
  return a ? a.id : ((n = e.find(
    (s) => s.name.includes(t) || t.includes(s.name) || s.name.replace(/\s+/g, "").includes(l)
  )) == null ? void 0 : n.id) || null;
}
function Wa({ team: e }) {
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
          t.createElement(Le, {
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
          t.createElement(Le, {
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
async function Dt() {
  const e = await ce("/agents");
  return (e == null ? void 0 : e.agents) || [];
}
async function Ft(e) {
  return ce(`/agents/${encodeURIComponent(e)}`);
}
async function kt(e) {
  return await ce("/skills", {
    headers: { "X-Agent-Id": e }
  }) || [];
}
async function Gt(e = !1) {
  return await ce(`/skills/pool${e ? "?summary=true" : ""}`) || [];
}
async function Ja(e) {
  const t = await ce(
    `/skills/pool/${encodeURIComponent(e)}/content`
  );
  return (t == null ? void 0 : t.content) || "";
}
async function Xa() {
  return await ce("/skills/workspaces") || [];
}
async function Ka(e) {
  return await ce("/mcp", {
    headers: { "X-Agent-Id": e }
  }) || [];
}
async function qa(e, t) {
  return ce(
    `/mcp/toggle/${encodeURIComponent(t)}`,
    {
      method: "PATCH",
      headers: { "X-Agent-Id": e }
    }
  );
}
async function Va(e, t) {
  await ce(`/mcp/${encodeURIComponent(t)}`, {
    method: "DELETE",
    headers: { "X-Agent-Id": e }
  });
}
async function Ya(e, t, l) {
  return ce("/mcp", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify({ client_key: t, client: l })
  });
}
async function Qa(e, t, l) {
  return ce(
    `/mcp/${encodeURIComponent(t)}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json", "X-Agent-Id": e },
      body: JSON.stringify(l)
    }
  );
}
async function Za(e, t) {
  return await ce(
    `/mcp/tools/${encodeURIComponent(t)}`,
    { headers: { "X-Agent-Id": e } }
  ) || [];
}
async function el(e, t) {
  return ce(
    `/mcp/policy/${encodeURIComponent(t)}`,
    { headers: { "X-Agent-Id": e } }
  );
}
async function tl(e, t, l) {
  return ce(
    `/mcp/policy/${encodeURIComponent(t)}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json", "X-Agent-Id": e },
      body: JSON.stringify(l)
    }
  );
}
async function nl(e) {
  return await ce(
    "/mcp/access-principals",
    { headers: { "X-Agent-Id": e } }
  ) || [];
}
async function al(e, t, l) {
  return ce(
    `/mcp/oauth/start/${encodeURIComponent(t)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Agent-Id": e },
      body: JSON.stringify(l)
    }
  );
}
async function ll(e, t) {
  return ce(
    `/mcp/oauth/status/${encodeURIComponent(t)}`,
    { headers: { "X-Agent-Id": e } }
  );
}
async function sl(e, t) {
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
function Ve() {
  try {
    return localStorage.getItem("qwenpaw_sidebar_mode") === "simple";
  } catch {
    return !1;
  }
}
function Ht(e, t) {
  const l = z();
  return l.ReactMarkdown && l.remarkGfm ? t.createElement(
    l.ReactMarkdown,
    { remarkPlugins: [l.remarkGfm] },
    e
  ) : e.replace(/\*\*(.+?)\*\*/g, "$1").replace(/\*(.+?)\*/g, "$1").replace(/`(.+?)`/g, "$1").replace(/^#+\s*/gm, "").replace(/^[-*]\s+/gm, "• ");
}
const kn = {
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
function ol(e) {
  if (!e.env) return !1;
  const t = Object.entries(e.env);
  return t.length === 0 ? !1 : t.some(([, l]) => typeof l == "string" && l.length > 0);
}
const rl = [
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
], il = rl;
function cl({
  open: e,
  onClose: t,
  agents: l,
  editingTeam: a,
  onSaved: n
}) {
  const s = z().React, { useState: r, useEffect: o, useCallback: d } = s, {
    Modal: c,
    Input: g,
    Button: w,
    Select: b,
    Tag: h,
    Typography: v,
    Switch: y,
    Empty: O,
    message: L,
    Divider: U,
    Steps: N
  } = z().antd, { PlusOutlined: te, DeleteOutlined: G, SaveOutlined: W, ArrowRightOutlined: x } = z().antdIcons || {}, { Text: k, Paragraph: _ } = v, [X, F] = r(""), [I, E] = r("🤝"), [f, $] = r(""), [K, Q] = r(
    "pipeline"
  ), [le, M] = r(""), [p, u] = r(""), [A, ne] = r([]), [R, V] = r([]), [se, C] = r(!1);
  o(() => {
    e && (a ? (F(a.name), E(a.emoji), $(a.description), Q(a.mode), M(a.coordinatorName || ""), u(a.taskTemplate), ne(a.steps || []), V(a.members.map((j) => j.name))) : (F(""), E("🤝"), $(""), Q("pipeline"), M(""), u(`请执行以下任务：
任务描述：{任务描述}`), ne([]), V([])));
  }, [e, a]);
  const J = d(() => {
    if (K === "roundtable") {
      const j = R.map((oe) => ({
        agentName: oe,
        instruction: "请给出你的专业评估意见",
        passContext: !1
      }));
      ne(j);
    } else if (K === "pipeline") {
      const j = new Map(A.map((de) => [de.agentName, de])), oe = R.map((de) => j.get(de) || {
        agentName: de,
        instruction: "请完成你的专业部分",
        passContext: !0
      });
      ne(oe);
    }
  }, [K, R, A]), re = (j) => {
    R.includes(j) || (V([...R, j]), K === "coordinator" && !le && M(j));
  }, S = (j) => {
    V(R.filter((oe) => oe !== j)), ne(A.filter((oe) => oe.agentName !== j)), le === j && M(R[0] || "");
  }, Z = (j, oe, de) => {
    const Ee = [...A];
    Ee[j] = { ...Ee[j], [oe]: de }, ne(Ee);
  }, m = () => {
    if (!X.trim()) {
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
    C(!0);
    try {
      const j = R.map(
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
      let oe = A;
      (A.length === 0 || A.length !== R.length) && (oe = R.map((pe) => ({
        agentName: pe,
        instruction: "请完成你的专业部分",
        passContext: K === "pipeline"
      })));
      const de = {
        id: (a == null ? void 0 : a.id) || `custom-${Date.now()}`,
        name: X.trim(),
        emoji: I,
        category: "自定义",
        description: f.trim() || `${X.trim()}（${R.length}人团队）`,
        mode: K,
        members: j,
        coordinatorName: K === "coordinator" ? le : void 0,
        taskTemplate: p.trim(),
        orchestrationPrompt: "",
        // Custom teams use steps-based instructions
        steps: oe,
        custom: !0,
        createdAt: (a == null ? void 0 : a.createdAt) || Date.now()
      }, Ee = ht(), ye = Ee.findIndex((pe) => pe.id === de.id);
      ye >= 0 ? Ee[ye] = de : Ee.push(de), Nn(Ee), L.success(a ? "团队已更新" : "团队已创建"), n(), t();
    } catch (j) {
      L.error(j.message || "保存失败");
    } finally {
      C(!1);
    }
  }, Y = l.filter(
    (j) => !R.includes(j.name)
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
        icon: W ? s.createElement(W) : void 0
      }
    },
    // Step 1: Basic info
    s.createElement(
      "div",
      { style: { marginBottom: 16 } },
      s.createElement(
        k,
        {
          strong: !0,
          style: { display: "block", marginBottom: 8, fontSize: 13 }
        },
        "1. 基本信息"
      ),
      s.createElement(
        "div",
        { style: { display: "flex", gap: 8, marginBottom: 8, alignItems: "center" } },
        R.length > 0 ? s.createElement(Nt, {
          members: R,
          size: 36
        }) : null,
        s.createElement(g, {
          placeholder: "团队名称（如：储层评价团队）",
          value: X,
          onChange: (j) => F(j.target.value),
          style: { flex: 1 }
        })
      ),
      s.createElement(g.TextArea, {
        placeholder: "团队描述（简述团队的目标和适用场景）",
        value: f,
        onChange: (j) => $(j.target.value),
        rows: 2,
        style: { marginBottom: 8 }
      }),
      s.createElement(
        "div",
        { style: { display: "flex", gap: 8, alignItems: "center" } },
        s.createElement(
          k,
          { type: "secondary", style: { fontSize: 12 } },
          "协同模式："
        ),
        s.createElement(b, {
          value: K,
          onChange: (j) => Q(j),
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
        k,
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
          (j) => s.createElement(
            w,
            {
              key: j.id,
              size: "small",
              icon: te ? s.createElement(te) : void 0,
              onClick: () => re(j.name)
            },
            j.name
          )
        )
      ) : null,
      // Selected members
      R.length === 0 ? s.createElement(O, {
        description: "请从上方添加团队成员",
        image: O.PRESENTED_IMAGE_SIMPLE
      }) : s.createElement(
        "div",
        { style: { display: "flex", flexDirection: "column", gap: 4 } },
        ...R.map(
          (j) => s.createElement(
            "div",
            {
              key: j,
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
              s.createElement(Le, { name: j, size: 24 }),
              s.createElement(
                k,
                { strong: !0, style: { fontSize: 13 } },
                j
              ),
              K === "coordinator" && le === j ? s.createElement(
                h,
                { color: "blue", style: { fontSize: 10 } },
                "协调者"
              ) : null
            ),
            s.createElement(
              "div",
              { style: { display: "flex", gap: 4 } },
              K === "coordinator" ? s.createElement(
                w,
                {
                  size: "small",
                  type: "link",
                  onClick: () => M(j)
                },
                "设为协调者"
              ) : null,
              s.createElement(
                w,
                {
                  size: "small",
                  type: "link",
                  danger: !0,
                  icon: G ? s.createElement(G) : void 0,
                  onClick: () => S(j)
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
        k,
        {
          strong: !0,
          style: { display: "block", marginBottom: 8, fontSize: 13 }
        },
        `3. 编排执行步骤${K === "roundtable" ? "（各步独立执行）" : K === "pipeline" ? "（依次执行，可传递上下文）" : "（由协调者决定调用顺序）"}`
      ),
      // Auto-sync button
      s.createElement(
        w,
        {
          size: "small",
          type: "dashed",
          onClick: J,
          style: { marginBottom: 8 }
        },
        "自动生成步骤"
      ),
      // Steps list
      A.length === 0 ? s.createElement(
        k,
        { type: "secondary", style: { fontSize: 12 } },
        "点击「自动生成步骤」或手动配置每步的指令"
      ) : s.createElement(
        "div",
        { style: { display: "flex", flexDirection: "column", gap: 6 } },
        ...A.map(
          (j, oe) => s.createElement(
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
                h,
                { color: "blue", style: { fontSize: 11 } },
                j.agentName
              ),
              s.createElement(
                "div",
                { style: { flex: 1 } },
                s.createElement(g, {
                  placeholder: "请输入该步骤的指令...",
                  value: j.instruction,
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
                checked: j.passContext,
                onChange: (de) => Z(oe, "passContext", de)
              }),
              s.createElement(
                k,
                { type: "secondary", style: { fontSize: 11 } },
                j.passContext ? "传递上一步结果作为上下文" : "独立执行"
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
        k,
        {
          strong: !0,
          style: { display: "block", marginBottom: 8, fontSize: 13 }
        },
        `${R.length > 0 ? "4" : "3"}. 任务模板`
      ),
      s.createElement(g.TextArea, {
        placeholder: `输入任务模板，可用 {参数名} 作为占位符...

例如：
请对区块 {区块名} 的井 {井号} 进行储层评价`,
        value: p,
        onChange: (j) => u(j.target.value),
        rows: 4,
        style: { fontFamily: "monospace", fontSize: 13 }
      }),
      s.createElement(
        k,
        {
          type: "secondary",
          style: { fontSize: 11, display: "block", marginTop: 4 }
        },
        "占位符 {参数名} 在发起任务时可由用户填写替换"
      )
    )
  );
}
function _n({
  team: e,
  agents: t,
  onLaunch: l,
  onEdit: a,
  onDelete: n
}) {
  var E;
  const s = z().React, { useState: r } = s, { Card: o, Tag: d, Typography: c, Button: g, Tooltip: w } = z().antd, {
    TeamOutlined: b,
    RocketOutlined: h,
    UserOutlined: v,
    EditOutlined: y,
    DeleteOutlined: O,
    DownOutlined: L,
    UpOutlined: U
  } = z().antdIcons || {}, { Text: N, Paragraph: te } = c, [G, W] = r(!1), x = {
    coordinator: { label: "协调者模式", color: "blue" },
    pipeline: { label: "流水线模式", color: "cyan" },
    roundtable: { label: "圆桌讨论", color: "purple" }
  }, k = x[e.mode] || x.coordinator, _ = e.members.map((f) => {
    const $ = St(t, f.name);
    return { ...f, found: !!$, agentId: $ };
  }), X = _.filter((f) => f.found).length, F = e.coordinatorName || ((E = e.members[0]) == null ? void 0 : E.name), I = F ? St(t, F) : null;
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
      s.createElement(Nt, {
        members: e.members.map((f) => f.name),
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
            { color: k.color, style: { fontSize: 10 } },
            k.label
          ),
          s.createElement(
            d,
            { color: "green", style: { fontSize: 10 } },
            `${e.members.length} 位专家`
          ),
          X < e.members.length ? s.createElement(
            w,
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
          w,
          { title: "编辑" },
          s.createElement(g, {
            type: "text",
            size: "small",
            icon: y ? s.createElement(y) : void 0,
            onClick: (f) => {
              f.stopPropagation(), a(e);
            }
          })
        ) : null,
        n ? s.createElement(
          w,
          { title: "删除" },
          s.createElement(g, {
            type: "text",
            size: "small",
            danger: !0,
            icon: O ? s.createElement(O) : void 0,
            onClick: (f) => {
              f.stopPropagation(), n(e);
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
        (f) => s.createElement(
          w,
          {
            key: f.name,
            title: `${f.name}（${f.role}）${f.found ? "" : " - 未创建"}`
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
                background: f.found ? "#f0f5ff" : "#f0f0ff",
                border: `1px solid ${f.found ? "#d6e4ff" : "#d3adf7"}`,
                fontSize: 11
              }
            },
            s.createElement(Le, { name: f.name, size: 18 }),
            s.createElement(
              N,
              {
                style: { fontSize: 11, color: f.found ? "#1f4e8c" : "#531dab" }
              },
              f.name
            )
          )
        )
      )
    ),
    // Toggle flow diagram
    s.createElement(
      g,
      {
        type: "link",
        size: "small",
        style: { padding: "0 0 4px 0", fontSize: 11, height: "auto" },
        onClick: (f) => {
          f.stopPropagation(), W(!G);
        },
        icon: G ? U ? s.createElement(U) : "▲" : L ? s.createElement(L) : "▼"
      },
      G ? "收起流程" : "查看执行流程"
    ),
    G ? s.createElement(Wa, { team: e }) : null,
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
        g,
        {
          type: "primary",
          size: "small",
          icon: h ? s.createElement(h) : void 0,
          disabled: !I,
          onClick: () => l(e),
          style: Oe
        },
        "发起团队任务"
      )
    )
  );
}
function ml({
  agents: e,
  onLaunch: t
}) {
  const l = z().React, { useMemo: a, useState: n, useCallback: s, useEffect: r } = l, {
    Row: o,
    Col: d,
    Input: c,
    Empty: g,
    Typography: w,
    Tag: b,
    Button: h,
    Divider: v,
    Tabs: y,
    message: O,
    Popconfirm: L
  } = z().antd, { SearchOutlined: U, TeamOutlined: N, PlusOutlined: te, RocketOutlined: G } = z().antdIcons || {}, { Text: W } = w, [x, k] = n(""), [_, X] = n([]), [F, I] = n([]), [E, f] = n(!1), [$, K] = n(!1), [Q, le] = n(null);
  r(() => {
    X(ht());
    let C = !0;
    return $a().then((J) => {
      C && (J ? (I(J), f(!1)) : f(!0));
    }), () => {
      C = !1;
    };
  }, []);
  const M = s(() => {
    X(ht());
  }, []), p = s(
    (C) => {
      const re = ht().filter((S) => S.id !== C.id);
      Nn(re), X(re), O.success(`团队「${C.name}」已删除`);
    },
    [O]
  ), u = s((C) => {
    le(C), K(!0);
  }, []), A = s(() => {
    le(null), K(!0);
  }, []), ne = a(() => [..._, ...F], [_, F]), R = a(() => {
    if (!x.trim()) return ne;
    const C = x.toLowerCase();
    return ne.filter(
      (J) => J.name.toLowerCase().includes(C) || J.description.toLowerCase().includes(C) || J.category.toLowerCase().includes(C)
    );
  }, [ne, x]), V = R.filter((C) => C.custom), se = R.filter((C) => !C.custom);
  return l.createElement(
    "div",
    null,
    // Workflow status card (OMP-backed)
    l.createElement(La),
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
        W,
        { style: { fontSize: 13, color: "#389e0d" } },
        "OMP 驱动的专家团工作流 — 5 阶段状态机（规划→分派→验证→综合→完成），支持结构化交接、角色工具隔离、fork 并行执行和自动重试。"
      ),
      l.createElement(
        h,
        {
          type: "primary",
          size: "small",
          icon: te ? l.createElement(te) : void 0,
          onClick: A,
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
      onChange: (C) => k(C.target.value),
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
                  (C) => l.createElement(
                    d,
                    { key: C.id, xs: 24, sm: 12, md: 8 },
                    l.createElement(_n, {
                      team: C,
                      agents: e,
                      onLaunch: t
                    })
                  )
                )
              ) : l.createElement(g, {
                description: "未找到匹配的预设团队",
                image: g.PRESENTED_IMAGE_SIMPLE
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
                  (C) => l.createElement(
                    d,
                    { key: C.id, xs: 24, sm: 12, md: 8 },
                    l.createElement(_n, {
                      team: C,
                      agents: e,
                      onLaunch: t,
                      onEdit: u,
                      onDelete: p
                    })
                  )
                )
              ) : l.createElement(g, {
                description: "暂无自定义团队，点击「创建专家团」自定义",
                image: g.PRESENTED_IMAGE_SIMPLE
              })
            )
          }
        ]
      }
    ),
    // Team Builder Modal
    l.createElement(cl, {
      open: $,
      onClose: () => {
        K(!1), le(null);
      },
      agents: e,
      editingTeam: Q,
      onSaved: M
    })
  );
}
function Dn(e) {
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
async function dl(e) {
  return await ce("/workspace/files", {
    headers: { "X-Agent-Id": e }
  }) || [];
}
async function wt(e, t, l) {
  await ce(`/workspace/files/${encodeURIComponent(t)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify({ content: l })
  });
}
async function Tn(e, t) {
  const l = await Ft(e);
  l.system_prompt_files = t, await ce(`/agents/${encodeURIComponent(e)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(l)
  });
}
async function Wt(e, t) {
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
async function Fn(e, t) {
  await ce(`/skills/${encodeURIComponent(t)}/enable`, {
    method: "POST",
    headers: { "X-Agent-Id": e }
  });
}
async function Jt(e, t) {
  await ce(`/skills/${encodeURIComponent(t)}`, {
    method: "DELETE",
    headers: { "X-Agent-Id": e }
  });
}
async function ul(e, t) {
  return ce("/skills/batch-enable", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify(t)
  });
}
async function pl(e, t) {
  return ce("/skills/batch-disable", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify(t)
  });
}
async function gl(e, t) {
  return ce("/skills/batch-delete", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify(t)
  });
}
async function Xt(e) {
  return await ce("/mcp", {
    headers: { "X-Agent-Id": e }
  }) || [];
}
async function Gn(e, t) {
  await ce(`/mcp/${encodeURIComponent(t)}`, {
    method: "DELETE",
    headers: { "X-Agent-Id": e }
  });
}
async function Hn(e, t) {
  return ce("/mcp", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify(t)
  });
}
async function fl(e, t) {
  return ce(
    `/mcp/toggle/${encodeURIComponent(t)}`,
    {
      method: "PATCH",
      headers: { "X-Agent-Id": e }
    }
  );
}
async function Wn(e, t) {
  await ce(`/skills/${encodeURIComponent(t)}/disable`, {
    method: "POST",
    headers: { "X-Agent-Id": e }
  });
}
async function yl(e) {
  await ce(`/skills/pool/${encodeURIComponent(e)}`, {
    method: "DELETE"
  });
}
function El(e) {
  const t = (e || "").trim();
  if (!t) return { number: 6, unit: "h" };
  const l = t.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/i);
  if (!l) return { number: 6, unit: "h" };
  const a = parseInt(l[1] || "0", 10), n = parseInt(l[2] || "0", 10), s = parseInt(l[3] || "0", 10), r = a * 60 + n + Math.round(s / 60);
  return r <= 0 ? { number: 6, unit: "h" } : r >= 60 && r % 60 === 0 ? { number: r / 60, unit: "h" } : { number: r, unit: "m" };
}
function hl(e) {
  return e.unit === "h" ? `${e.number}h` : `${e.number}m`;
}
async function vl(e) {
  return ce("/config/heartbeat", {
    headers: { "X-Agent-Id": e }
  });
}
async function bl(e, t) {
  return ce("/config/heartbeat", {
    method: "PUT",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify(t)
  });
}
async function Sl(e) {
  await ce("/config/heartbeat/run", {
    method: "POST",
    headers: { "X-Agent-Id": e }
  });
}
async function wl(e) {
  return ce("/workspace/running-config", {
    headers: { "X-Agent-Id": e }
  });
}
async function Cl(e, t) {
  return ce("/workspace/running-config", {
    method: "PUT",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify(t)
  });
}
async function xl(e) {
  return (await ce("/workspace/language", {
    headers: { "X-Agent-Id": e }
  })).language || "zh";
}
async function kl(e, t) {
  await ce("/workspace/language", {
    method: "PUT",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify({ language: t })
  });
}
async function _l() {
  return (await ce("/config/user-timezone")).timezone || "UTC";
}
async function Tl(e) {
  await ce("/config/user-timezone", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ timezone: e })
  });
}
async function zl(e) {
  return await ce("/workspace/system-prompt-files", {
    headers: { "X-Agent-Id": e }
  }) || [];
}
const zn = ["AGENTS.md", "SOUL.md", "PROFILE.md"];
function _t({
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
function In({
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
function Jn({
  open: e,
  onClose: t,
  poolSkills: l,
  installedSkillNames: a,
  loading: n,
  onInstall: s
}) {
  const r = z().React, { useState: o, useEffect: d, useMemo: c } = r, { Modal: g, Button: w, Empty: b, Spin: h, Input: v, Tag: y, Tooltip: O, Typography: L } = z().antd, { CheckOutlined: U, SearchOutlined: N } = z().antdIcons || {}, { Text: te } = L, [G, W] = o([]), [x, k] = o("");
  d(() => {
    e && (W([]), k(""));
  }, [e]);
  const _ = c(() => {
    if (!x.trim()) return l;
    const E = x.toLowerCase();
    return l.filter(
      (f) => {
        var $, K;
        return f.name.toLowerCase().includes(E) || (($ = f.description) == null ? void 0 : $.toLowerCase().includes(E)) || ((K = f.tags) == null ? void 0 : K.some((Q) => Q.toLowerCase().includes(E)));
      }
    );
  }, [l, x]), X = _.filter(
    (E) => !a.includes(E.name)
  ), F = (E) => {
    W(
      (f) => f.includes(E) ? f.filter(($) => $ !== E) : [...f, E]
    );
  }, I = async () => {
    G.length !== 0 && (await s(G), W([]));
  };
  return r.createElement(
    g,
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
          r.createElement(w, { onClick: t }, "取消"),
          r.createElement(
            w,
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
      r.createElement(v, {
        placeholder: "搜索技能名称、描述或标签...",
        prefix: N ? r.createElement(N) : void 0,
        value: x,
        onChange: (E) => k(E.target.value),
        allowClear: !0,
        style: { flex: 1 }
      }),
      r.createElement(
        w,
        {
          size: "small",
          type: "primary",
          onClick: () => W(X.map((E) => E.name))
        },
        "全选"
      ),
      r.createElement(
        w,
        {
          size: "small",
          onClick: () => W([])
        },
        "清空"
      )
    ),
    // Skill grid (card style matching Skill Center)
    n ? r.createElement(
      "div",
      { style: { textAlign: "center", padding: 40 } },
      r.createElement(h, { size: "large" })
    ) : _.length === 0 ? r.createElement(b, {
      description: x ? "未找到匹配的技能" : "技能池暂无可用技能",
      image: b.PRESENTED_IMAGE_SIMPLE
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
        const f = G.includes(E.name), $ = a.includes(E.name);
        return r.createElement(
          "div",
          {
            key: E.name,
            onClick: () => !$ && F(E.name),
            style: {
              position: "relative",
              padding: "10px 12px",
              border: `1px solid ${f ? "#0072f5" : "#e8e8e8"}`,
              borderRadius: 6,
              cursor: $ ? "not-allowed" : "pointer",
              transition: "all 0.15s ease",
              background: f ? "rgba(0, 114, 245, 0.06)" : $ ? "#fafafa" : "#fff",
              opacity: $ ? 0.5 : 1,
              minHeight: 64
            }
          },
          f ? r.createElement(
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
          $ ? r.createElement(
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
                paddingRight: $ || f ? 24 : 0
              }
            },
            r.createElement(
              "span",
              { style: { fontSize: 16 } },
              E.emoji || "⚡"
            ),
            r.createElement(
              O,
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
const Ye = {
  marginBottom: 4,
  fontSize: 13,
  fontWeight: 500,
  color: "rgba(0,0,0,0.85)",
  display: "flex",
  alignItems: "center",
  gap: 4
}, Xn = { marginBottom: 16 }, Kn = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "0 16px",
  marginBottom: 16
}, Ue = {
  fontSize: 13,
  fontWeight: 600,
  color: "rgba(0,0,0,0.85)",
  marginBottom: 12,
  paddingBottom: 8,
  borderBottom: "1px solid #f0f0f0"
}, qn = {
  fontSize: 12,
  color: "rgba(0,0,0,0.45)",
  marginLeft: 8
};
function Il({ agentId: e }) {
  const t = z().React, { useState: l, useEffect: a, useCallback: n } = t, {
    Switch: s,
    InputNumber: r,
    Select: o,
    Button: d,
    Spin: c,
    Space: g,
    Typography: w,
    message: b
  } = z().antd, { PlayCircleOutlined: h, SaveOutlined: v } = z().antdIcons || {}, { Text: y } = w, [O, L] = l(!0), [U, N] = l(!1), [te, G] = l(!1), [W, x] = l(!1), [k, _] = l(6), [X, F] = l("h"), [I, E] = l("main"), [f, $] = l(300), [K, Q] = l(!1), [le, M] = l("08:00"), [p, u] = l("22:00"), A = n(async () => {
    var J, re;
    L(!0);
    try {
      const S = await vl(e), Z = El(S.every ?? "6h");
      x(S.enabled ?? !1), _(Z.number), F(Z.unit), E(S.target ?? "main"), $(S.timeoutSeconds ?? 300), Q(!!S.activeHours), M(((J = S.activeHours) == null ? void 0 : J.start) ?? "08:00"), u(((re = S.activeHours) == null ? void 0 : re.end) ?? "22:00");
    } catch (S) {
      b.error(S.message || "加载心跳配置失败");
    } finally {
      L(!1);
    }
  }, [e]);
  a(() => {
    A();
  }, [A]);
  const ne = async () => {
    N(!0);
    try {
      await bl(e, {
        enabled: W,
        every: hl({ number: k, unit: X }),
        target: I,
        timeoutSeconds: f,
        activeHours: K && le && p ? { start: le, end: p } : void 0
      }), b.success("心跳配置已保存");
    } catch (J) {
      b.error(J.message || "保存心跳配置失败");
    } finally {
      N(!1);
    }
  }, R = async () => {
    G(!0);
    try {
      await Sl(e), b.success("已触发心跳检查");
    } catch (J) {
      b.error(J.message || "触发心跳失败");
    } finally {
      G(!1);
    }
  };
  if (O)
    return t.createElement(
      "div",
      { style: { textAlign: "center", padding: 40 } },
      t.createElement(c, { size: "large" })
    );
  const V = (J, re, S) => t.createElement(
    "div",
    { style: Xn },
    t.createElement("div", { style: Ye }, J),
    re,
    S ? t.createElement(
      y,
      { type: "secondary", style: qn },
      S
    ) : null
  ), se = (J, re, S, Z) => t.createElement(
    "div",
    { style: Kn },
    t.createElement(
      "div",
      null,
      t.createElement("div", { style: Ye }, J),
      re
    ),
    t.createElement(
      "div",
      null,
      t.createElement("div", { style: Ye }, S),
      Z
    )
  ), { Divider: C } = z().antd;
  return t.createElement(
    "div",
    { style: { paddingBottom: 8 } },
    // ── Section: 基本设置 ──
    t.createElement("div", { style: Ue }, "基本设置"),
    V(
      "启用心跳",
      t.createElement(s, {
        checked: W,
        onChange: (J) => x(J)
      }),
      W ? "已启用，专家将定期自检" : "已停用"
    ),
    se(
      "检查频率",
      t.createElement(
        g,
        null,
        t.createElement(r, {
          min: 1,
          value: k,
          onChange: (J) => _(J ?? 1),
          style: { width: "100%" }
        }),
        t.createElement(o, {
          value: X,
          onChange: (J) => F(J),
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
        onChange: (J) => E(J),
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
        value: f,
        onChange: (J) => $(J ?? 300),
        style: { width: 200 }
      })
    ),
    // ── Section: 活跃时段 ──
    t.createElement(C, { style: { margin: "8px 0 16px" } }),
    t.createElement("div", { style: Ue }, "活跃时段"),
    V(
      "启用活跃时段限制",
      t.createElement(s, {
        checked: K,
        onChange: (J) => Q(J)
      }),
      "仅在指定时段内触发心跳"
    ),
    K ? se(
      "开始时间",
      t.createElement("input", {
        type: "time",
        value: le,
        onChange: (J) => M(J.target.value),
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
        onChange: (J) => u(J.target.value),
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
          icon: v ? t.createElement(v) : void 0,
          loading: U,
          onClick: ne,
          style: Oe
        },
        "保存配置"
      ),
      t.createElement(
        d,
        {
          icon: h ? t.createElement(h) : void 0,
          loading: te,
          onClick: R
        },
        "立即执行"
      )
    )
  );
}
function Ol({
  agentId: e,
  onRefresh: t
}) {
  const l = z().React, { useState: a, useEffect: n, useCallback: s } = l, {
    List: r,
    Tag: o,
    Switch: d,
    Button: c,
    Empty: g,
    Spin: w,
    Typography: b,
    message: h
  } = z().antd, { PlusOutlined: v, ReloadOutlined: y, DeleteOutlined: O } = z().antdIcons || {}, { Text: L, Paragraph: U } = b, [N, te] = a([]), [G, W] = a(!0), [x, k] = a(!1), [_, X] = a([]), [F, I] = a(!1), E = s(async () => {
    W(!0);
    try {
      const M = await kt(e);
      te(M);
    } catch (M) {
      h.error(M.message || "加载技能失败"), te([]);
    } finally {
      W(!1);
    }
  }, [e]);
  n(() => {
    E();
  }, [E]);
  const f = async () => {
    k(!0), I(!0);
    try {
      const M = await Gt(!0);
      X(M);
    } catch (M) {
      h.error(M.message || "加载技能池失败");
    } finally {
      I(!1);
    }
  }, $ = async (M) => {
    let p = 0, u = 0;
    for (const A of M)
      try {
        await Wt(e, A), p++;
      } catch {
        u++;
      }
    p > 0 ? (h.success(
      `成功添加 ${p} 个技能${u > 0 ? `，${u} 个失败` : ""}`
    ), E(), t()) : u > 0 && h.error("添加技能失败"), k(!1);
  }, K = async (M, p) => {
    try {
      p ? await Fn(e, M.name) : await Wn(e, M.name), h.success(p ? "已启用" : "已停用"), E(), t();
    } catch (u) {
      h.error(u.message || "操作失败");
    }
  }, Q = async (M) => {
    try {
      await Jt(e, M), h.success(`技能「${M}」已移除`), E(), t();
    } catch (p) {
      h.error(p.message || "移除技能失败");
    }
  };
  if (G)
    return l.createElement(
      "div",
      { style: { textAlign: "center", padding: 40 } },
      l.createElement(w, { size: "large" })
    );
  const le = N.filter((M) => M.enabled !== !1);
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
              et(), E();
            }
          },
          "刷新"
        ),
        l.createElement(
          c,
          {
            type: "primary",
            size: "small",
            icon: v ? l.createElement(v) : void 0,
            onClick: f,
            style: Oe
          },
          "从技能池添加"
        )
      )
    ),
    N.length === 0 ? l.createElement(g, {
      description: "该专家暂无技能",
      image: g.PRESENTED_IMAGE_SIMPLE
    }) : l.createElement(r, {
      dataSource: N,
      renderItem: (M) => l.createElement(
        r.Item,
        {
          actions: [
            l.createElement(d, {
              key: "toggle",
              size: "small",
              checked: M.enabled !== !1,
              onChange: (p) => K(M, p)
            }),
            l.createElement(
              c,
              {
                key: "del",
                type: "link",
                size: "small",
                danger: !0,
                icon: O ? l.createElement(O) : void 0,
                onClick: () => Q(M.name)
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
            M.emoji ? l.createElement(
              "span",
              { style: { fontSize: 16 } },
              M.emoji
            ) : null,
            l.createElement(L, { strong: !0 }, M.name),
            M.version_text ? l.createElement(
              o,
              { style: { fontSize: 10 } },
              `v${M.version_text}`
            ) : null
          ),
          M.description ? l.createElement(
            U,
            {
              type: "secondary",
              style: { fontSize: 12, margin: 0 },
              ellipsis: { rows: 2 }
            },
            M.description
          ) : null
        )
      )
    }),
    l.createElement(Jn, {
      open: x,
      onClose: () => k(!1),
      poolSkills: _,
      installedSkillNames: N.map((M) => M.name),
      loading: F,
      onInstall: $
    })
  );
}
function Al({
  agentId: e,
  onRefresh: t,
  isActive: l
}) {
  const a = z().React, { useState: n, useEffect: s, useCallback: r } = a, {
    List: o,
    Tag: d,
    Button: c,
    Empty: g,
    Spin: w,
    Modal: b,
    Input: h,
    Typography: v,
    message: y
  } = z().antd, { PlusOutlined: O, ReloadOutlined: L, DeleteOutlined: U } = z().antdIcons || {}, { Text: N, Paragraph: te } = v, { TextArea: G } = h, [W, x] = n([]), [k, _] = n(!0), [X, F] = n(!1), [I, E] = n(`{
  "mcpServers": {
    "example-client": {
      "command": "npx",
      "args": ["-y", "@example/mcp-server"],
      "env": {}
    }
  }
}`), [f, $] = n(!1), K = r(async () => {
    _(!0);
    try {
      const p = await Xt(e);
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
      await fl(e, p), y.success("已切换 MCP 状态"), K(), t();
    } catch (u) {
      y.error(u.message || "切换失败");
    }
  }, le = async (p) => {
    try {
      await Gn(e, p), y.success(`MCP「${p}」已移除`), K(), t();
    } catch (u) {
      y.error(u.message || "移除 MCP 失败");
    }
  }, M = async () => {
    $(!0);
    try {
      const p = JSON.parse(I), u = p.mcpServers || p, A = Object.entries(u);
      if (A.length === 0) {
        y.warning("未找到 MCP 客户端配置");
        return;
      }
      for (const [ne, R] of A) {
        const V = R, se = V.url ? "streamable_http" : "stdio";
        await Hn(e, {
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
      $(!1);
    }
  };
  return k ? a.createElement(
    "div",
    { style: { textAlign: "center", padding: 40 } },
    a.createElement(w, { size: "large" })
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
      a.createElement(N, { strong: !0 }, `MCP 客户端 (${W.length})`),
      a.createElement(
        "div",
        { style: { display: "flex", gap: 8 } },
        a.createElement(
          c,
          {
            size: "small",
            icon: L ? a.createElement(L) : void 0,
            onClick: () => {
              et(), K();
            }
          },
          "刷新"
        ),
        a.createElement(
          c,
          {
            type: "primary",
            size: "small",
            icon: O ? a.createElement(O) : void 0,
            onClick: () => F(!0),
            style: Oe
          },
          "添加 MCP"
        )
      )
    ),
    W.length === 0 ? a.createElement(g, {
      description: "该专家暂无 MCP 客户端",
      image: g.PRESENTED_IMAGE_SIMPLE
    }) : a.createElement(o, {
      dataSource: W,
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
      b,
      {
        open: X,
        title: "添加 MCP 客户端 (JSON)",
        onCancel: () => F(!1),
        onOk: M,
        confirmLoading: f,
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
function Pl({ agentId: e }) {
  const t = z().React, { useState: l, useEffect: a, useCallback: n, useRef: s } = t, {
    Card: r,
    InputNumber: o,
    Input: d,
    Select: c,
    Switch: g,
    Button: w,
    Spin: b,
    Space: h,
    Typography: v,
    Divider: y,
    message: O
  } = z().antd, { SaveOutlined: L } = z().antdIcons || {}, { Text: U } = v, [N, te] = l(!0), [G, W] = l(!1), x = s(null), [k, _] = l(60), [X, F] = l(""), [I, E] = l(!0), [f, $] = l(30), [K, Q] = l("zh"), [le, M] = l("UTC"), [p, u] = l(!0), [A, ne] = l(100), [R, V] = l(!0), [se, C] = l(3), [J, re] = l(1), [S, Z] = l(!0), [m, Y] = l(3), [j, oe] = l(2), [de, Ee] = l(60), [ye, pe] = l(1), [ae, D] = l(0), [T, q] = l(1), [ie, H] = l(0), [ue, ve] = l(30), [we, xe] = l(50), [ze, Ae] = l("light"), [He, tt] = l("scroll"), [nt, $e] = l("remelight"), [at, dt] = l("AUTO"), We = n(async () => {
    var ee, Ce, Se, Te, Je, lt;
    te(!0);
    try {
      const [he, zt, ut] = await Promise.all([
        wl(e),
        xl(e).catch(() => "zh"),
        _l().catch(() => "UTC")
      ]);
      x.current = he, _(he.shell_command_timeout ?? 60), F(he.shell_command_executable ?? "");
      const st = he.auto_title_config ?? { enabled: !0, timeout_seconds: 30 };
      E(st.enabled ?? !0), $(st.timeout_seconds ?? 30), Q(zt), M(ut);
      const Pe = he.loop ?? {};
      u(((ee = Pe.iteration) == null ? void 0 : ee.enabled) ?? !0), ne(((Ce = Pe.iteration) == null ? void 0 : Ce.max_iterations) ?? he.max_iters ?? 100), V(((Se = Pe.doom_loop) == null ? void 0 : Se.enabled) ?? !0), C(((Te = Pe.doom_loop) == null ? void 0 : Te.window_size) ?? 3), re(((Je = Pe.doom_loop) == null ? void 0 : Je.similarity_threshold) ?? 1), Z(he.llm_retry_enabled ?? !0), Y(he.llm_max_retries ?? 3), oe(he.llm_backoff_base ?? 2), Ee(he.llm_backoff_cap ?? 60), pe(he.llm_max_concurrent ?? 1), D(he.llm_max_qpm ?? 0), q(he.llm_rate_limit_pause ?? 1), H(he.llm_rate_limit_jitter ?? 0), ve(he.llm_acquire_timeout ?? 30), xe(he.history_max_length ?? 50), Ae(he.context_manager_backend ?? "light"), tt(((lt = he.light_context_config) == null ? void 0 : lt.strategy) ?? "scroll"), $e(he.memory_manager_backend ?? "remelight"), dt(he.approval_level ?? "AUTO");
    } catch (he) {
      O.error(he.message || "加载运行配置失败");
    } finally {
      te(!1);
    }
  }, [e]);
  a(() => {
    We();
  }, [We]);
  const _e = async () => {
    var Ce, Se;
    const ee = x.current;
    if (ee) {
      W(!0);
      try {
        const Te = {
          ...ee,
          max_iters: A,
          loop: {
            ...ee.loop ?? {},
            iteration: { enabled: p, max_iterations: A },
            doom_loop: {
              enabled: R,
              window_size: se,
              similarity_threshold: J,
              stages: ((Se = (Ce = ee.loop) == null ? void 0 : Ce.doom_loop) == null ? void 0 : Se.stages) ?? []
            }
          },
          shell_command_timeout: k,
          shell_command_executable: X,
          auto_title_config: {
            enabled: I,
            timeout_seconds: f
          },
          llm_retry_enabled: S,
          llm_max_retries: m,
          llm_backoff_base: j,
          llm_backoff_cap: de,
          llm_max_concurrent: ye,
          llm_max_qpm: ae,
          llm_rate_limit_pause: T,
          llm_rate_limit_jitter: ie,
          llm_acquire_timeout: ue,
          history_max_length: we,
          context_manager_backend: ze,
          light_context_config: {
            ...ee.light_context_config ?? {},
            strategy: He
          },
          memory_manager_backend: nt,
          approval_level: at
        };
        await Cl(e, Te), x.current = Te, K && await kl(e, K).catch(() => {
        }), le && await Tl(le).catch(() => {
        }), O.success("运行配置已保存");
      } catch (Te) {
        O.error(Te.message || "保存运行配置失败");
      } finally {
        W(!1);
      }
    }
  };
  if (N)
    return t.createElement(
      "div",
      { style: { textAlign: "center", padding: 40 } },
      t.createElement(b, { size: "large" })
    );
  const Ie = (ee, Ce, Se) => t.createElement(
    "div",
    { style: Xn },
    t.createElement("div", { style: Ye }, ee),
    Ce,
    Se ? t.createElement(
      U,
      { type: "secondary", style: qn },
      Se
    ) : null
  ), ke = (ee, Ce, Se, Te) => t.createElement(
    "div",
    { style: Kn },
    t.createElement(
      "div",
      null,
      t.createElement("div", { style: Ye }, ee),
      Ce
    ),
    t.createElement(
      "div",
      null,
      t.createElement("div", { style: Ye }, Se),
      Te
    )
  );
  return t.createElement(
    "div",
    { style: { paddingBottom: 8 } },
    // ── Section: 基础设置 ──
    t.createElement(
      "div",
      { style: Ue },
      "基础设置"
    ),
    ke(
      "Shell 命令超时 (秒)",
      t.createElement(o, {
        min: 1,
        value: k,
        onChange: (ee) => _(ee ?? 60),
        style: { width: "100%" }
      }),
      "Shell 可执行文件",
      t.createElement(d, {
        value: X,
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
        onChange: (ee) => M(ee),
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
      t.createElement(h, null, t.createElement(g, {
        checked: I,
        onChange: (ee) => E(ee)
      })),
      "标题生成超时 (秒)",
      t.createElement(o, {
        min: 5,
        value: f,
        onChange: (ee) => $(ee ?? 30),
        style: { width: "100%" },
        disabled: !I
      })
    ),
    // ── Section: 审批级别 ──
    t.createElement(y, { style: { margin: "8px 0 16px" } }),
    t.createElement("div", { style: Ue }, "审批级别"),
    Ie(
      "工具执行审批",
      t.createElement(c, {
        value: at,
        onChange: (ee) => dt(ee),
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
    t.createElement("div", { style: Ue }, "迭代与循环"),
    Ie(
      "启用迭代限制",
      t.createElement(g, {
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
        value: A,
        onChange: (ee) => ne(ee ?? 100),
        style: { width: "100%" }
      })
    ) : null,
    Ie(
      "启用重复循环保护",
      t.createElement(g, {
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
        onChange: (ee) => C(ee ?? 3),
        style: { width: "100%" }
      }),
      "相似度阈值",
      t.createElement(o, {
        min: 0,
        max: 1,
        step: 0.05,
        value: J,
        onChange: (ee) => re(ee ?? 1),
        style: { width: "100%" }
      })
    ) : null,
    // ── Section: LLM 重试 ──
    t.createElement(y, { style: { margin: "8px 0 16px" } }),
    t.createElement("div", { style: Ue }, "LLM 重试"),
    Ie(
      "启用 LLM 重试",
      t.createElement(g, {
        checked: S,
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
        disabled: !S
      }),
      "退避基数 (秒)",
      t.createElement(o, {
        min: 0.1,
        step: 0.1,
        value: j,
        onChange: (ee) => oe(ee ?? 2),
        style: { width: "100%" },
        disabled: !S
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
        disabled: !S
      })
    ),
    // ── Section: LLM 限流 ──
    t.createElement(y, { style: { margin: "8px 0 16px" } }),
    t.createElement("div", { style: Ue }, "LLM 限流"),
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
        onChange: (ee) => q(ee ?? 1),
        style: { width: "100%" }
      }),
      "限流抖动 (秒)",
      t.createElement(o, {
        min: 0,
        step: 0.5,
        value: ie,
        onChange: (ee) => H(ee ?? 0),
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
    t.createElement("div", { style: Ue }, "上下文与记忆"),
    ke(
      "上下文管理后端",
      t.createElement(c, {
        value: ze,
        onChange: (ee) => Ae(ee),
        style: { width: "100%" },
        options: [{ value: "light", label: "light" }]
      }),
      "上下文策略",
      t.createElement(c, {
        value: He,
        onChange: (ee) => tt(ee),
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
        value: nt,
        onChange: (ee) => $e(ee),
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
        w,
        {
          type: "primary",
          icon: L ? t.createElement(L) : void 0,
          loading: G,
          onClick: _e,
          style: Oe
        },
        "保存运行配置"
      )
    )
  );
}
function $l({
  expert: e,
  open: t,
  onClose: l,
  onRefresh: a
}) {
  const n = z().React, { useState: s, useEffect: r, useCallback: o } = n, { Modal: d, Tabs: c, Spin: g, Typography: w } = z().antd, { SettingOutlined: b } = z().antdIcons || {}, { Text: h } = w, [v, y] = s([]), [O, L] = s(!1), [U, N] = s("heartbeat"), te = o(async () => {
    if (e) {
      L(!0);
      try {
        const k = await zl(e.agent.id);
        y(k);
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
  const { agent: G } = e, W = () => {
    te(), a();
  }, x = [
    {
      key: "heartbeat",
      label: "心跳",
      children: n.createElement(Il, {
        agentId: G.id
      })
    },
    {
      key: "files",
      label: "文件",
      children: O ? n.createElement(
        "div",
        { style: { textAlign: "center", padding: 40 } },
        n.createElement(g, { size: "large" })
      ) : n.createElement(Vn, {
        agentId: G.id,
        systemPromptFiles: v,
        onRefresh: W
      })
    },
    {
      key: "skills",
      label: `技能 (${e.skills.filter((k) => k.enabled !== !1).length})`,
      children: n.createElement(Ol, {
        agentId: G.id,
        onRefresh: a
      })
    },
    {
      key: "mcp",
      label: `MCP (${e.mcps.length})`,
      children: n.createElement(Al, {
        agentId: G.id,
        onRefresh: a,
        isActive: U === "mcp"
      })
    },
    {
      key: "running",
      label: "运行配置",
      children: n.createElement(Pl, {
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
        b ? n.createElement(b, { style: { fontSize: 18 } }) : null,
        n.createElement("span", null, `配置 - ${G.name}`),
        n.createElement(
          h,
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
      onChange: (k) => N(k),
      size: "small",
      tabBarStyle: { marginBottom: 16 }
    })
  );
}
function Ml({
  expert: e,
  onClick: t,
  onSummon: l,
  onConfigure: a
}) {
  const n = z().React, { Card: s, Tag: r, Badge: o, Typography: d, Spin: c, Button: g, Tooltip: w } = z().antd, { Text: b } = d, { ThunderboltOutlined: h, SettingOutlined: v } = z().antdIcons || {}, { agent: y, skills: O, mcps: L, loading: U } = e, N = y.enabled, te = O.filter((x) => x.enabled !== !1).map((x) => x.name), G = L.map((x) => x.name || x.key), W = y.active_model ? `${y.active_model.provider_id}/${y.active_model.model}` : null;
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
        n.createElement(Le, { name: y.name, size: 36 }),
        n.createElement(
          "div",
          null,
          n.createElement(
            b,
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
      Ht(y.description, n)
    ) : n.createElement(
      "div",
      { style: { fontSize: 12, color: "#bfbfbf", marginBottom: 10, minHeight: 54, flex: "1 0 auto" } },
      "暂无描述"
    ),
    // Model info
    W ? n.createElement(
      "div",
      { style: { marginBottom: 8 } },
      n.createElement(
        r,
        { color: "geekblue", style: { fontSize: 11 } },
        `🤖 ${W}`
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
      n.createElement(In, {
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
      n.createElement(In, {
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
        w,
        { title: "配置专家", placement: "top" },
        n.createElement(
          g,
          {
            type: "text",
            size: "small",
            icon: v ? n.createElement(v, {
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
        g,
        {
          type: "primary",
          size: "small",
          icon: h ? n.createElement(h) : void 0,
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
function Rl({
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
    Button: g,
    Empty: w,
    Tabs: b,
    List: h,
    Spin: v,
    Modal: y,
    message: O
  } = z().antd, { Text: L, Paragraph: U } = d, {
    EditOutlined: N,
    ThunderboltOutlined: te,
    FileTextOutlined: G,
    ToolOutlined: W,
    PlusOutlined: x
  } = z().antdIcons || {}, [k, _] = n.useState(!1), [X, F] = n.useState(
    []
  ), [I, E] = n.useState(!1);
  if (!e) return null;
  const { agent: f, config: $, skills: K, mcps: Q, loading: le } = e, M = K.filter((S) => S.enabled !== !1), p = (S) => {
    window.history.pushState({}, "", S), window.dispatchEvent(new PopStateEvent("popstate"));
  }, u = n.createElement(
    "div",
    null,
    n.createElement(
      r,
      { column: 1, bordered: !0, size: "small" },
      n.createElement(r.Item, { label: "专家名称" }, f.name),
      n.createElement(
        r.Item,
        { label: "专家 ID" },
        n.createElement("code", { style: { fontSize: 12 } }, f.id)
      ),
      n.createElement(
        r.Item,
        { label: "状态" },
        n.createElement(
          o,
          { color: f.enabled ? "green" : "default" },
          f.enabled ? "启用" : "停用"
        )
      ),
      n.createElement(
        r.Item,
        { label: "功能简介" },
        f.description ? Ht(f.description, n) : "暂无描述"
      ),
      n.createElement(
        r.Item,
        { label: "使用模型" },
        f.active_model ? `${f.active_model.provider_id} / ${f.active_model.model}` : "使用全局默认模型"
      ),
      $ != null && $.workspace_dir ? n.createElement(
        r.Item,
        { label: "工作区路径" },
        n.createElement(
          "code",
          { style: { fontSize: 11 } },
          $.workspace_dir
        )
      ) : null,
      $ != null && $.approval_level ? n.createElement(
        r.Item,
        { label: "审批级别" },
        $.approval_level
      ) : null
    ),
    // System prompt files
    $ != null && $.system_prompt_files && $.system_prompt_files.length > 0 ? n.createElement(
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
        ...$.system_prompt_files.map(
          (S, Z) => n.createElement(
            o,
            {
              key: Z,
              icon: G ? n.createElement(G) : void 0,
              style: { fontSize: 12 }
            },
            S
          )
        )
      )
    ) : null
  ), A = async () => {
    _(!0), E(!0);
    try {
      const S = await Gt(!0);
      F(S);
    } catch (S) {
      O.error(S.message || "加载技能池失败");
    } finally {
      E(!1);
    }
  }, ne = async (S) => {
    let Z = 0, m = 0;
    for (const Y of S)
      try {
        await Wt(f.id, Y), Z++;
      } catch {
        m++;
      }
    Z > 0 ? (O.success(
      `成功添加 ${Z} 个技能${m > 0 ? `，${m} 个失败` : ""}`
    ), a()) : m > 0 && O.error("添加技能失败"), _(!1);
  }, R = async (S) => {
    try {
      await Jt(f.id, S), O.success(`技能「${S}」已移除`), a();
    } catch (Z) {
      O.error(Z.message || "移除技能失败");
    }
  }, V = async (S) => {
    try {
      await Gn(f.id, S), O.success(`MCP「${S}」已移除`), a();
    } catch (Z) {
      O.error(Z.message || "移除 MCP 失败");
    }
  }, se = le ? n.createElement(
    "div",
    { style: { textAlign: "center", padding: 40 } },
    n.createElement(v, { size: "large" })
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
        `已启用技能 (${M.length})`
      ),
      n.createElement(
        g,
        {
          type: "primary",
          size: "small",
          icon: x ? n.createElement(x) : void 0,
          onClick: A
        },
        "从技能池添加"
      )
    ),
    M.length === 0 ? n.createElement(w, {
      description: "该专家暂无已启用的技能",
      image: w.PRESENTED_IMAGE_SIMPLE
    }) : n.createElement(h, {
      dataSource: M,
      renderItem: (S) => n.createElement(
        h.Item,
        {
          actions: [
            n.createElement(
              g,
              {
                type: "link",
                size: "small",
                danger: !0,
                onClick: () => R(S.name)
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
            S.emoji ? n.createElement(
              "span",
              { style: { fontSize: 16 } },
              S.emoji
            ) : null,
            n.createElement(L, { strong: !0 }, S.name),
            S.version_text ? n.createElement(
              o,
              { style: { fontSize: 10 } },
              `v${S.version_text}`
            ) : null
          ),
          S.description ? n.createElement(
            U,
            {
              type: "secondary",
              style: { fontSize: 12, margin: 0 },
              ellipsis: { rows: 2 }
            },
            S.description
          ) : null,
          S.tags && S.tags.length > 0 ? n.createElement(
            "div",
            { style: { marginTop: 4 } },
            ...S.tags.map(
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
    n.createElement(Jn, {
      open: k,
      onClose: () => _(!1),
      poolSkills: X,
      installedSkillNames: M.map((S) => S.name),
      loading: I,
      onInstall: ne
    })
  ), C = le ? n.createElement(
    "div",
    { style: { textAlign: "center", padding: 40 } },
    n.createElement(v, { size: "large" })
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
        g,
        {
          type: "primary",
          size: "small",
          icon: x ? n.createElement(x) : void 0,
          onClick: () => {
            window.history.pushState({}, "", `/agents/${f.id}/mcp`), window.dispatchEvent(new PopStateEvent("popstate"));
          }
        },
        "配置 MCP"
      )
    ),
    Q.length === 0 ? n.createElement(w, {
      description: "该专家暂无关联的 MCP 客户端，点击「配置 MCP」添加",
      image: w.PRESENTED_IMAGE_SIMPLE
    }) : n.createElement(h, {
      dataSource: Q,
      renderItem: (S) => n.createElement(
        h.Item,
        {
          actions: [
            n.createElement(
              g,
              {
                type: "link",
                size: "small",
                danger: !0,
                onClick: () => V(S.key)
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
              S.name || S.key
            ),
            n.createElement(
              o,
              {
                color: S.enabled ? "green" : "default",
                style: { fontSize: 10 }
              },
              S.enabled ? "启用" : "停用"
            ),
            n.createElement(
              o,
              { color: "purple", style: { fontSize: 10 } },
              S.transport
            )
          ),
          S.description ? n.createElement(
            U,
            {
              type: "secondary",
              style: { fontSize: 12, margin: 0 },
              ellipsis: { rows: 2 }
            },
            S.description
          ) : null,
          S.tools && S.tools.length > 0 ? n.createElement(
            "div",
            {
              style: {
                marginTop: 4,
                fontSize: 11,
                color: "#8c8c8c"
              }
            },
            `提供 ${S.tools.length} 个工具`
          ) : null
        )
      )
    })
  ), J = $ != null && $.tools ? n.createElement(
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
        W ? n.createElement(W, {
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
        JSON.stringify($.tools, null, 2)
      )
    )
  ) : n.createElement(w, {
    description: "暂无工具配置",
    image: w.PRESENTED_IMAGE_SIMPLE
  }), re = [
    { key: "basic", label: "基本信息", children: u },
    {
      key: "skills",
      label: `技能 (${M.length})`,
      children: se
    },
    {
      key: "prompts",
      label: "推荐提问",
      children: n.createElement(Bl, {
        skills: M,
        agentId: f.id
      })
    },
    {
      key: "knowledge",
      label: "专家记忆",
      children: n.createElement(Vn, {
        agentId: f.id,
        systemPromptFiles: ($ == null ? void 0 : $.system_prompt_files) || [],
        onRefresh: () => a()
      })
    },
    { key: "mcp", label: `MCP (${Q.length})`, children: C },
    { key: "tools", label: "工具配置", children: J }
  ];
  return n.createElement(
    s,
    {
      title: n.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 8 } },
        n.createElement(Le, { name: f.name, size: 28 }),
        n.createElement("span", null, f.name)
      ),
      open: t,
      onClose: l,
      width: 560,
      extra: n.createElement(
        c,
        null,
        n.createElement(
          g,
          {
            size: "small",
            icon: N ? n.createElement(N) : void 0,
            onClick: () => {
              l();
              try {
                const S = z();
                S.setSelectedAgent && S.setSelectedAgent(f.id);
              } catch (S) {
                console.warn("[ugsci] Failed to set selected agent:", S);
              }
              setTimeout(() => p("/agents"), 0);
            }
          },
          "编辑专家"
        ),
        n.createElement(
          g,
          {
            type: "primary",
            size: "small",
            icon: te ? n.createElement(te) : void 0,
            onClick: () => {
              l();
              try {
                const S = z();
                S.setSelectedAgent && S.setSelectedAgent(f.id);
              } catch (S) {
                console.warn("[ugsci] Failed to set selected agent:", S);
              }
              setTimeout(() => p("/chat"), 0);
            }
          },
          "开始对话"
        )
      )
    },
    n.createElement(b, {
      items: re,
      defaultActiveKey: "basic"
    })
  );
}
function Ll({
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
    Col: g,
    Spin: w,
    message: b,
    Typography: h
  } = z().antd, { Text: v } = h, { FileAddOutlined: y } = z().antdIcons || {}, [O, L] = n(!1), [U, N] = n(""), [te, G] = n(!1), W = async (_, X) => {
    L(!0);
    try {
      const F = await ce("/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: _ || "新专家",
          description: X || "",
          skill_names: []
        })
      });
      await wt(
        F.id,
        "AGENTS.md",
        `# ${_ || "新专家"}

请在此处编写该专家的系统提示词。
`
      ), b.success("专家「" + (_ || "新专家") + "」创建成功"), G(!1), setTimeout(() => {
        t(), l();
      }, 0);
    } catch (F) {
      b.error(F.message || "创建专家失败");
    } finally {
      L(!1);
    }
  }, x = il.filter((_) => {
    if (!U.trim()) return !0;
    const X = U.toLowerCase();
    return _.name.toLowerCase().includes(X) || _.description.toLowerCase().includes(X) || _.category.toLowerCase().includes(X);
  }), k = async (_) => {
    L(!0);
    try {
      const X = await ce("/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: _.name,
          description: _.description,
          skill_names: _.recommended_skills
        })
      });
      await wt(X.id, "AGENTS.md", _.system_prompt);
      const F = await Ft(X.id);
      F.approval_level = _.approval_level, await ce(`/agents/${encodeURIComponent(X.id)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(F)
      }), b.success(`专家「${_.name}」创建成功`), t(), l();
    } catch (X) {
      b.error(X.message || "创建专家失败");
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
      O ? a.createElement(
        "div",
        { style: { textAlign: "center", padding: 60 } },
        a.createElement(w, { size: "large" }),
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
          g,
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
                  v,
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
            g,
            { key: _.id, xs: 24, sm: 12 },
            a.createElement(
              r,
              {
                hoverable: !0,
                size: "small",
                onClick: () => k(_),
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
                a.createElement(Le, {
                  name: _.name,
                  size: 40
                }),
                a.createElement(
                  "div",
                  { style: { flex: 1 } },
                  a.createElement(
                    v,
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
                Ht(_.description, a)
              )
            )
          )
        )
      )
    ),
    // ── Blank template creation modal (sibling, not nested inside Modal) ──
    a.createElement(jl, {
      open: te,
      onCancel: () => G(!1),
      onCreate: W
    })
  );
}
function jl({
  open: e,
  onCancel: t,
  onCreate: l
}) {
  const a = z().React, { useState: n, useEffect: s } = a, { Modal: r, Input: o, message: d } = z().antd, [c, g] = n(""), [w, b] = n(""), [h, v] = n(!1);
  return s(() => {
    e && (g(""), b(""), v(!1));
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
        v(!0), Promise.resolve(l(c.trim(), w.trim())).finally(() => {
          v(!1);
        });
      },
      okText: "创建",
      cancelText: "取消",
      okButtonProps: { loading: h },
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
        onChange: (y) => g(y.target.value),
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
        value: w,
        onChange: (y) => b(y.target.value),
        rows: 3,
        maxLength: 200
      })
    )
  );
}
function Vn({
  agentId: e,
  systemPromptFiles: t,
  onRefresh: l
}) {
  const a = z().React, { useState: n, useEffect: s, useCallback: r } = a, {
    List: o,
    Tag: d,
    Switch: c,
    Button: g,
    Modal: w,
    Input: b,
    Spin: h,
    Empty: v,
    message: y,
    Typography: O
  } = z().antd, { FileTextOutlined: L, PlusOutlined: U, EditOutlined: N, ReloadOutlined: te } = z().antdIcons || {}, { Text: G } = O, [W, x] = n([]), [k, _] = n(!0), [X, F] = n(
    t || []
  ), [I, E] = n(!1), [f, $] = n(null), [K, Q] = n(""), [le, M] = n(""), [p, u] = n(!1), A = r(async () => {
    _(!0);
    try {
      const C = await dl(e);
      x(C);
    } catch (C) {
      y.error(C.message || "加载记忆文件失败"), x([]);
    } finally {
      _(!1);
    }
  }, [e]);
  s(() => {
    A();
  }, [A]), s(() => {
    F(t || []);
  }, [t]);
  const ne = async (C, J) => {
    const re = new Set(X);
    if (J)
      re.add(C);
    else {
      if (zn.includes(C) && C === "AGENTS.md") {
        y.warning("AGENTS.md 是核心文件，不能停用");
        return;
      }
      re.delete(C);
    }
    const S = Array.from(re);
    F(S);
    try {
      await Tn(e, S), y.success(J ? "已启用记忆文件" : "已停用记忆文件"), l();
    } catch (Z) {
      y.error(Z.message || "更新失败"), F(t || []);
    }
  }, R = async (C) => {
    try {
      const J = await ce(
        `/workspace/files/${encodeURIComponent(C)}`,
        { headers: { "X-Agent-Id": e } }
      );
      $(C), Q(J.content || ""), E(!0);
    } catch (J) {
      y.error(J.message || "读取文件失败");
    }
  }, V = () => {
    $(null), Q(""), M(""), E(!0);
  }, se = async () => {
    const C = f || le.trim();
    if (!C) {
      y.warning("请输入文件名");
      return;
    }
    const J = C.endsWith(".md") ? C : `${C}.md`;
    u(!0);
    try {
      if (await wt(e, J, K), !f && !X.includes(J)) {
        const re = [...X, J];
        F(re), await Tn(e, re);
      }
      y.success("保存成功"), E(!1), A(), l();
    } catch (re) {
      y.error(re.message || "保存失败");
    } finally {
      u(!1);
    }
  };
  return k ? a.createElement(
    "div",
    { style: { textAlign: "center", padding: 40 } },
    a.createElement(h, { size: "large" })
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
          `记忆文件 (${W.length})`
        ),
        a.createElement(
          G,
          { type: "secondary", style: { fontSize: 12 } },
          `· 已挂载 ${X.length} 个到专家记忆`
        )
      ),
      a.createElement(
        "div",
        { style: { display: "flex", gap: 8 } },
        a.createElement(
          g,
          {
            size: "small",
            icon: te ? a.createElement(te) : void 0,
            onClick: A
          },
          "刷新"
        ),
        a.createElement(
          g,
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
    W.length === 0 ? a.createElement(v, {
      description: "暂无记忆文件，点击「新建记忆文件」添加",
      image: v.PRESENTED_IMAGE_SIMPLE
    }) : a.createElement(o, {
      dataSource: W,
      renderItem: (C) => {
        const J = X.includes(C.filename), re = zn.includes(C.filename);
        return a.createElement(
          o.Item,
          {
            actions: [
              a.createElement(
                g,
                {
                  type: "link",
                  size: "small",
                  icon: N ? a.createElement(N) : void 0,
                  onClick: () => R(C.filename)
                },
                "编辑"
              )
            ]
          },
          a.createElement(o.Item.Meta, {
            avatar: a.createElement(L, {
              style: {
                fontSize: 20,
                color: J ? "#1677ff" : "#bfbfbf"
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
              a.createElement(G, null, C.filename),
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
              `${(C.size / 1024).toFixed(1)} KB · 修改于 ${new Date(C.modified_time).toLocaleString()}`
            )
          }),
          a.createElement(c, {
            checked: J,
            size: "small",
            onChange: (S) => ne(C.filename, S)
          })
        );
      }
    }),
    // Edit/New file modal
    a.createElement(
      w,
      {
        open: I,
        onCancel: () => E(!1),
        title: f ? `编辑 ${f}` : "新建记忆文件",
        width: 700,
        onOk: se,
        confirmLoading: p,
        okText: "保存"
      },
      f ? null : a.createElement(
        "div",
        { style: { marginBottom: 12 } },
        a.createElement(b, {
          placeholder: "文件名（如：油藏工程记忆库.md）",
          value: le,
          onChange: (C) => M(C.target.value),
          addonAfter: le.endsWith(".md") ? "" : ".md"
        })
      ),
      a.createElement(b.TextArea, {
        value: K,
        onChange: (C) => Q(C.target.value),
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
function Bl({
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
  } = z().antd, { ThunderboltOutlined: g, CopyOutlined: w } = z().antdIcons || {}, { Text: b } = r, h = a(() => Dn(e), [e]), v = (O) => {
    try {
      const L = z();
      L.setSelectedAgent && L.setSelectedAgent(t);
    } catch {
    }
    try {
      sessionStorage.setItem("ugsci_pending_prompt", O.value);
    } catch {
    }
    window.history.pushState({}, "", "/chat"), window.dispatchEvent(new PopStateEvent("popstate"));
  }, y = (O) => {
    var L;
    (L = navigator.clipboard) == null || L.writeText(O.value).then(() => {
      c.success("已复制到剪贴板");
    });
  };
  return h.length === 0 ? l.createElement(o, {
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
    l.createElement(n, {
      dataSource: h,
      renderItem: (O, L) => l.createElement(
        n.Item,
        {
          actions: [
            l.createElement(
              d,
              {
                type: "link",
                size: "small",
                icon: w ? l.createElement(w) : void 0,
                onClick: () => y(O)
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
              onClick: () => v(O)
            },
            O.value
          ),
          description: l.createElement(
            b,
            { type: "secondary", style: { fontSize: 12 } },
            O.label
          )
        })
      )
    })
  );
}
function Ul() {
  var ie;
  const e = z().React, { useState: t, useEffect: l, useCallback: a, useMemo: n } = e, {
    Spin: s,
    Empty: r,
    Input: o,
    Button: d,
    message: c,
    Row: g,
    Col: w,
    Tabs: b,
    Modal: h,
    Typography: v
  } = z().antd, {
    ReloadOutlined: y,
    PlusOutlined: O,
    SearchOutlined: L,
    TeamOutlined: U,
    UserOutlined: N
  } = z().antdIcons || {}, { Text: te, Paragraph: G } = v, [W, x] = t([]), [k, _] = t(!0), [X, F] = t(!1), [I, E] = t(null), [f, $] = t(""), [K, Q] = t(!1), [le, M] = t("experts"), [p, u] = t(
    null
  ), [A, ne] = t(""), [R, V] = t(!1), [se, C] = t(!1), [J, re] = t(null), [S, Z] = t([]), m = a(async () => {
    _(!0);
    try {
      const H = await Dt(), ue = await Promise.all(
        H.map(async (ve) => {
          try {
            const [we, xe, ze] = await Promise.all([
              Ft(ve.id).catch(() => null),
              kt(ve.id).catch(() => []),
              Xt(ve.id).catch(() => [])
            ]);
            return {
              agent: ve,
              config: we,
              skills: xe,
              mcps: ze,
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
      x(ue), Z(H);
    } catch (H) {
      c.error(H.message || "加载专家列表失败"), x([]);
    } finally {
      _(!1);
    }
  }, []);
  l(() => {
    m();
  }, [m]), l(() => {
    if (J && se) {
      const H = W.find(
        (ue) => ue.agent.id === J.agent.id
      );
      H && H !== J && re(H);
    }
  }, [W, J, se]);
  const Y = a(
    async (H) => {
      var xe;
      const ue = H.coordinatorName || ((xe = H.members[0]) == null ? void 0 : xe.name);
      let ve = null;
      if (ue && (ve = St(S, ue)), !ve) {
        const ze = S[0];
        if (ze)
          ve = ze.id, c.warning(
            `未找到专家「${ue || "协调者"}」，将使用「${ze.name}」作为工作流控制器。控制器将通过 spawn_subagent 分派子任务。`
          );
        else {
          c.error("没有可用的 Agent 作为工作流控制器");
          return;
        }
      }
      if (/\{.+?\}/.test(H.taskTemplate)) {
        ne(H.taskTemplate), u(H);
        return;
      }
      await j(H, ve, H.taskTemplate);
    },
    [S, c]
  ), j = a(
    async (H, ue, ve) => {
      V(!0);
      try {
        const we = ve || H.taskTemplate;
        let xe = H.name;
        H.custom && (xe = `@${await Ha(H)}`);
        const ze = `/ugsci-team ${H.mode} ${xe} ${we}`, Ae = z();
        Ae.setSelectedAgent && Ae.setSelectedAgent(ue);
        const He = await Ga(
          ue,
          ze,
          H.name
        );
        c.success(
          `OMP 工作流已启动：${H.name}（${H.mode}模式）`
        ), u(null), oe(`/chat/${He}`);
      } catch (we) {
        c.error(we.message || "发起团队任务失败");
      } finally {
        V(!1);
      }
    },
    [c]
  ), oe = (H) => {
    window.history.pushState({}, "", H), window.dispatchEvent(new PopStateEvent("popstate"));
  }, de = a((H) => {
    E(H), F(!0);
  }, []), Ee = a((H) => {
    re(H), C(!0);
  }, []), ye = a(
    (H) => {
      if (!H.agent.enabled) {
        c.warning(`专家「${H.agent.name}」未启用，请先启用`);
        return;
      }
      try {
        const ue = z();
        ue.setSelectedAgent && ue.setSelectedAgent(H.agent.id);
      } catch (ue) {
        console.warn("[ugsci] Failed to set selected agent:", ue);
      }
      c.success(`已召唤专家「${H.agent.name}」，正在跳转至对话...`), oe("/chat");
    },
    [c]
  ), pe = n(() => {
    if (!f.trim()) return W;
    const H = f.toLowerCase();
    return W.filter(
      (ue) => {
        var ve;
        return ue.agent.name.toLowerCase().includes(H) || ((ve = ue.agent.description) == null ? void 0 : ve.toLowerCase().includes(H)) || ue.agent.id.toLowerCase().includes(H) || ue.skills.some((we) => we.name.toLowerCase().includes(H));
      }
    );
  }, [W, f]), ae = W.filter((H) => H.agent.enabled).length, D = W.reduce(
    (H, ue) => H + ue.skills.filter((ve) => ve.enabled !== !1).length,
    0
  ), T = W.reduce((H, ue) => H + ue.mcps.length, 0), q = [
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
            value: f,
            onChange: (H) => $(H.target.value),
            allowClear: !0,
            style: { maxWidth: 400 }
          })
        ),
        // Content
        k ? e.createElement(
          "div",
          { style: { textAlign: "center", padding: 60 } },
          e.createElement(s, { size: "large" })
        ) : pe.length === 0 ? e.createElement(r, {
          description: f ? "未找到匹配的专家" : "暂无专家，点击「创建专家」添加"
        }) : e.createElement(
          g,
          { gutter: [12, 12], align: "stretch" },
          ...pe.map(
            (H) => e.createElement(
              w,
              {
                key: H.agent.id,
                xs: 24,
                sm: 12,
                md: 8,
                lg: 6,
                style: { display: "flex" }
              },
              e.createElement(Ml, {
                expert: H,
                onClick: () => de(H),
                onSummon: () => ye(H),
                onConfigure: () => Ee(H)
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
      children: e.createElement(ml, {
        agents: S,
        onLaunch: Y
      })
    }
  ];
  return e.createElement(
    "div",
    { style: { padding: 24 } },
    e.createElement(_t, {
      title: "专家",
      subtitle: `共 ${W.length} 位专家（${ae} 位启用）· ${D} 个技能 · ${T} 个 MCP 客户端`,
      extra: e.createElement(
        e.Fragment,
        null,
        e.createElement(
          d,
          {
            icon: y ? e.createElement(y) : void 0,
            onClick: () => {
              et(), m();
            },
            loading: k
          },
          "刷新"
        ),
        e.createElement(
          d,
          {
            type: "primary",
            icon: O ? e.createElement(O) : void 0,
            onClick: () => Q(!0),
            style: Oe
          },
          "创建专家"
        )
      )
    }),
    e.createElement(b, {
      items: q,
      activeKey: le,
      onChange: (H) => M(H)
    }),
    // Drawer
    e.createElement(Rl, {
      expert: I,
      open: X,
      onClose: () => F(!1),
      onRefresh: () => m()
    }),
    // Template Modal
    e.createElement(Ll, {
      open: K,
      onClose: () => Q(!1),
      onCreated: () => m()
    }),
    // Config Modal (gear icon)
    e.createElement($l, {
      expert: J,
      open: se,
      onClose: () => C(!1),
      onRefresh: () => m()
    }),
    // Team Launch Modal (for filling placeholders)
    p ? e.createElement(
      h,
      {
        open: !0,
        title: e.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 8 } },
          e.createElement(Nt, {
            members: p.members.map((H) => H.name),
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
          const H = p.coordinatorName || ((we = p.members[0]) == null ? void 0 : we.name), ue = H ? St(S, H) : null;
          if (!ue) {
            c.error("无法找到协调者专家");
            return;
          }
          const ve = A.trim() || p.taskTemplate;
          j(p, ue, ve);
        },
        confirmLoading: R,
        okText: "发起任务",
        width: 600
      },
      e.createElement(
        "div",
        null,
        e.createElement(
          te,
          {
            type: "secondary",
            style: { fontSize: 12, display: "block", marginBottom: 8 }
          },
          "任务内容（请替换 {参数名} 等占位符后发起）："
        ),
        e.createElement(o.TextArea, {
          value: A,
          onChange: (H) => ne(H.target.value),
          rows: 8,
          style: { fontSize: 13, fontFamily: "monospace" }
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
          `协调者: ${p.coordinatorName || ((ie = p.members[0]) == null ? void 0 : ie.name) || "—"} · 成员: ${p.members.map((H) => H.name).join("、")}`
        )
      )
    ) : null
  );
}
const Yn = [
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
], Nl = {
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
function Ge(e) {
  return (e || "").trim() || "channel";
}
function Qe(e) {
  return (e || "").trim();
}
function Qn(e) {
  const t = Qe(e);
  return t === "" || t === "*";
}
function Tt(e) {
  return e === "user" ? "user" : "all";
}
function De(e) {
  const t = Tt(e.subject_type);
  return {
    source_type: Ge(e.source_type),
    source_value: Qe(e.source_value),
    subject_type: t,
    subject_value: t === "all" ? "" : (e.subject_value || "").trim(),
    effect: e.effect
  };
}
function Ze(e) {
  return { tool_name: e.tool_name || "*", ...De(e) };
}
function Zn(e) {
  return { tool_name: e.tool_name || "*", effect: e.effect };
}
function ea(e) {
  return [...e].map(De).sort(
    (t, l) => t.source_type.localeCompare(l.source_type) || t.source_value.localeCompare(l.source_value) || t.subject_type.localeCompare(l.subject_type) || t.subject_value.localeCompare(l.subject_value)
  );
}
function Ct(e) {
  return [...e].map(Ze).sort(
    (t, l) => t.tool_name.localeCompare(l.tool_name) || t.source_type.localeCompare(l.source_type) || t.source_value.localeCompare(l.source_value) || t.subject_type.localeCompare(l.subject_type) || t.subject_value.localeCompare(l.subject_value)
  );
}
function ta(e) {
  return [...e].map(Zn).sort((t, l) => t.tool_name.localeCompare(l.tool_name));
}
function je(e) {
  return {
    default_effect: e.default_effect || "deny",
    client_overrides: ea(e.client_overrides || []),
    tool_defaults: ta(e.tool_defaults || []),
    tool_overrides: Ct(e.tool_overrides || []),
    unmanaged_rules_count: e.unmanaged_rules_count || 0
  };
}
function Me(e) {
  return [Ge(e.source_type), Qe(e.source_value), Tt(e.subject_type), e.subject_type === "all" ? "" : (e.subject_value || "").trim()].join("\0");
}
function Re(e) {
  return [e.tool_name || "*", Ge(e.source_type), Qe(e.source_value), Tt(e.subject_type), e.subject_type === "all" ? "" : (e.subject_value || "").trim()].join("\0");
}
function Dl(e, t) {
  const l = je(t), a = /* @__PURE__ */ new Map();
  l.tool_overrides.forEach((c) => {
    const g = Ze(c), w = a.get(g.tool_name) || [];
    w.push(g), a.set(g.tool_name, w);
  });
  const n = new Map(l.tool_defaults.map((c) => [c.tool_name, Zn(c)])), s = new Set(e.map((c) => c.name)), r = e.map((c) => {
    var g;
    return {
      toolName: c.name,
      description: c.description,
      inputSchema: c.input_schema,
      stale: !1,
      defaultEffect: ((g = n.get(c.name)) == null ? void 0 : g.effect) || l.default_effect,
      hasExplicitDefault: n.has(c.name),
      rules: Ct(a.get(c.name) || [])
    };
  }), o = /* @__PURE__ */ new Set([...a.keys(), ...n.keys()]), d = Array.from(o).filter((c) => c !== "*" && !s.has(c)).map((c) => {
    var g;
    return {
      toolName: c,
      description: "",
      inputSchema: {},
      stale: !0,
      defaultEffect: ((g = n.get(c)) == null ? void 0 : g.effect) || l.default_effect,
      hasExplicitDefault: n.has(c),
      rules: Ct(a.get(c) || [])
    };
  });
  return [...r, ...d];
}
function na(e, t) {
  const l = je(e), a = new Set(
    t === null ? l.client_overrides.map((n) => Me(De(n))) : l.tool_overrides.filter((n) => n.tool_name === t).map((n) => Re(Ze(n)))
  );
  for (const n of Yn) {
    const s = t === null ? Me({ source_type: "channel", source_value: n, subject_type: "all", subject_value: "" }) : Re({ tool_name: t, source_type: "channel", source_value: n, subject_type: "all", subject_value: "" });
    if (!a.has(s)) return n;
  }
  return "console";
}
function Fl(e) {
  return Rt(e, { source_type: "channel", source_value: na(e, null), subject_type: "all", subject_value: "", effect: "ask" });
}
function Gl(e, t) {
  return Lt(e, { tool_name: t, source_type: "channel", source_value: na(e, t), subject_type: "all", subject_value: "", effect: "ask" });
}
function Rt(e, t, l) {
  const a = je(e), n = De(t), s = Me(l || n), r = Me(n), o = a.client_overrides.filter((d) => {
    const c = Me(De(d));
    return c !== s && c !== r;
  });
  return o.push(n), { ...a, client_overrides: ea(o) };
}
function Lt(e, t, l) {
  const a = je(e), n = Ze(t), s = Re(l || n), r = Re(n), o = a.tool_overrides.filter((d) => {
    const c = Re(Ze(d));
    return c !== s && c !== r;
  });
  return o.push(n), { ...a, tool_overrides: Ct(o) };
}
function Hl(e, t, l) {
  const a = je(e), n = a.tool_defaults.filter((s) => s.tool_name !== t);
  return n.push({ tool_name: t, effect: l }), { ...a, tool_defaults: ta(n) };
}
function Wl(e, t) {
  const l = je(e), a = Me(t);
  return { ...l, client_overrides: l.client_overrides.filter((n) => Me(De(n)) !== a) };
}
function Jl(e, t) {
  const l = je(e), a = Re(t);
  return { ...l, tool_overrides: l.tool_overrides.filter((n) => Re(Ze(n)) !== a) };
}
function aa(e, t) {
  const l = Ge(t.source_type), a = Qe(t.source_value);
  if (Qn(a)) return [];
  const n = /* @__PURE__ */ new Map();
  return e.forEach((s) => {
    if (Ge(s.source_type) !== l || Qe(s.source_value) !== a) return;
    const r = (s.subject_value || "").trim();
    !r || n.has(r) || n.set(r, s);
  }), Array.from(n.values());
}
function Xl(e, t) {
  return aa(e, t).map((l) => ({ label: l.subject_value, value: l.subject_value }));
}
function Kt(e) {
  return Ge(e.source_type) === "channel" && Qn(e.source_value) && Tt(e.subject_type) === "user" && !!(e.subject_value || "").trim();
}
function Kl(e, t) {
  const l = De(t);
  return l.subject_type === "user" && !!l.subject_value && l.subject_value !== "*" && e.some((a) => Ge(a.source_type) === l.source_type) && !Kt(l) && !aa(e, l).some((a) => a.subject_value === l.subject_value);
}
function ql(e) {
  const t = [...e.client_overrides || [], ...e.tool_overrides || []];
  for (const l of t) {
    const a = De(l);
    if (a.subject_type === "user") {
      if (!a.subject_value || a.subject_value === "*" || !a.source_value) return { reason: "missingUserValue", rule: l };
      if (Kt(a)) return { reason: "ambiguousUserSource", rule: l };
    }
  }
  return null;
}
function On(e, t) {
  const l = { ...e, ...t };
  return t.subject_type && (l.subject_value = ""), (t.source_type !== void 0 || t.source_value !== void 0) && t.subject_value === void 0 && l.subject_type === "user" && (l.subject_value = ""), l;
}
function Mt(e) {
  return JSON.stringify(je(e));
}
function Vl({
  client: e,
  agentId: t,
  open: l,
  onClose: a,
  onSave: n
}) {
  const s = z().React, { useState: r, useEffect: o, useMemo: d, useCallback: c } = s, { Modal: g, Spin: w, Empty: b, Button: h, Tag: v, Segmented: y, Select: O, Input: L, AutoComplete: U, Typography: N, message: te } = z().antd, { PlusOutlined: G, DeleteOutlined: W } = z().antdIcons || {}, { Text: x } = N, [k, _] = r(null), [X, F] = r([]), [I, E] = r([]), [f, $] = r(!1), [K, Q] = r(!1), [le, M] = r(""), [p, u] = r("");
  o(() => {
    if (!l) return;
    let m = !1;
    return (async () => {
      $(!0), F([]), E([]), M("");
      try {
        const j = await el(t, e.key);
        if (!m) {
          const oe = je(j);
          _(oe), u(Mt(oe));
        }
        try {
          const oe = await nl(t);
          m || E(oe);
        } catch {
          m || E([]);
        }
        if (!e.enabled) {
          m || M("MCP 客户端未启用，无法获取工具列表");
          return;
        }
        try {
          const oe = await Za(t, e.key);
          m || F(oe);
        } catch (oe) {
          m || M((oe == null ? void 0 : oe.message) || "无法加载工具列表");
        }
      } catch {
        m || (_(null), u(""), M("加载访问策略失败"));
      } finally {
        m || $(!1);
      }
    })(), () => {
      m = !0;
    };
  }, [l, e.key, e.enabled, t]);
  const A = d(() => k ? Dl(X, k) : [], [X, k]), ne = d(() => !!(k && Mt(k) !== p), [k, p]), R = (m) => Nl[m] || m, V = c((m) => {
    _((Y) => Y && { ...Y, default_effect: m });
  }, []), se = c((m, Y) => {
    _((j) => j && Rt(j, On(m, Y), { source_type: m.source_type, source_value: m.source_value, subject_type: m.subject_type, subject_value: m.subject_value }));
  }, []), C = c((m, Y) => {
    _((j) => j && Lt(j, On(m, Y), { tool_name: m.tool_name, source_type: m.source_type, source_value: m.source_value, subject_type: m.subject_type, subject_value: m.subject_value }));
  }, []), J = c(async () => {
    if (!k) return;
    const m = ql(k);
    if (m) {
      te.error(m.reason === "missingUserValue" ? "用户规则缺少用户标识" : "用户来源不明确");
      return;
    }
    Q(!0);
    try {
      await n(e.key, k) && (u(Mt(k)), a());
    } finally {
      Q(!1);
    }
  }, [k, e.key, n, a, te]), re = c(() => {
    if (!ne || K) {
      a();
      return;
    }
    g.confirm({
      title: "放弃修改",
      content: "确定要放弃未保存的修改吗？",
      okText: "确认",
      cancelText: "取消",
      onOk: a
    });
  }, [ne, K, a]), S = c((m, Y) => {
    const j = Xl(I, m), oe = Kt(m), de = Kl(I, m), Ee = [{ label: "所有渠道", value: "*" }, ...Yn.map((q) => ({ label: R(q), value: q }))], ye = [{ label: "所有人", value: "all" }, { label: "指定用户", value: "user" }], pe = (q) => {
      Y ? C(m, q) : se(m, q);
    }, ae = (q) => {
      _(Y ? (ie) => ie && Lt(ie, { ...m, effect: q }) : (ie) => ie && Rt(ie, { ...m, effect: q }));
    }, D = () => {
      _(Y ? (q) => q && Jl(q, { tool_name: m.tool_name, source_type: m.source_type, source_value: m.source_value, subject_type: m.subject_type, subject_value: m.subject_value }) : (q) => q && Wl(q, { source_type: m.source_type, source_value: m.source_value, subject_type: m.subject_type, subject_value: m.subject_value }));
    }, T = Y ? Re(m) : Me(m);
    return s.createElement(
      "div",
      { key: T, style: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr auto", gap: 6, alignItems: "end", padding: "6px 0", borderBottom: "1px solid #f5f5f5" } },
      // source_type
      s.createElement(
        "div",
        null,
        s.createElement(x, { style: { fontSize: 11, color: "#999", display: "block", marginBottom: 2 } }, "来源类型"),
        s.createElement(O, {
          size: "small",
          style: { width: "100%" },
          value: m.source_type || "channel",
          onChange: (q) => pe({ source_type: q, source_value: q === "channel" ? m.source_value || "*" : m.source_value }),
          options: [{ label: "渠道", value: "channel" }, ...m.source_type && m.source_type !== "channel" ? [{ label: m.source_type, value: m.source_type }] : []]
        })
      ),
      // source_value
      s.createElement(
        "div",
        null,
        s.createElement(x, { style: { fontSize: 11, color: "#999", display: "block", marginBottom: 2 } }, "来源"),
        m.source_type === "channel" ? s.createElement(O, { size: "small", style: { width: "100%" }, value: m.source_value || "*", onChange: (q) => pe({ source_value: q }), options: Ee }) : s.createElement(L, { size: "small", placeholder: "来源标识", value: m.source_value, onChange: (q) => pe({ source_value: q.target.value }) })
      ),
      // subject_type
      s.createElement(
        "div",
        null,
        s.createElement(x, { style: { fontSize: 11, color: "#999", display: "block", marginBottom: 2 } }, "对象类型"),
        s.createElement(O, { size: "small", style: { width: "100%" }, value: m.subject_type, onChange: (q) => pe({ subject_type: q }), options: ye })
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
            options: j,
            placeholder: j.length > 0 ? "用户 ID" : "无近期用户",
            onChange: (q) => pe({ subject_value: q }),
            onSelect: (q) => pe({ subject_value: q }),
            filterOption: (q, ie) => String((ie == null ? void 0 : ie.value) || "").toLowerCase().includes(q.toLowerCase())
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
        s.createElement(O, {
          size: "small",
          style: { width: "100%" },
          value: m.effect,
          onChange: (q) => ae(q),
          options: [{ label: "允许", value: "allow" }, { label: "询问", value: "ask" }, { label: "拒绝", value: "deny" }]
        })
      ),
      // delete
      s.createElement(h, { size: "small", type: "text", icon: s.createElement(W), onClick: D, title: "删除规则" })
    );
  }, [I, se, C]), Z = (m, Y) => {
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
    g,
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
        s.createElement(h, { onClick: re, style: { marginRight: 8 } }, "取消"),
        s.createElement(h, { type: "primary", onClick: J, loading: K, disabled: !k || f }, "保存")
      )
    },
    f && !k ? s.createElement("div", { style: { textAlign: "center", padding: 40 } }, s.createElement(w)) : k ? s.createElement(
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
            Z(k.default_effect, V),
            s.createElement(h, { size: "small", icon: s.createElement(G), onClick: () => _((m) => m && Fl(m)) }, "添加规则")
          )
        ),
        k.client_overrides.length === 0 ? s.createElement(x, { style: { fontSize: 12, color: "#999" } }, "暂无客户端级覆盖规则") : s.createElement("div", null, ...k.client_overrides.map((m) => S(m, !1)))
      ),
      // ── Error message ──
      le ? s.createElement("div", { style: { color: "#ff4d4f", fontSize: 12, marginBottom: 8 } }, le) : null,
      // ── Tool-level panel ──
      s.createElement(x, { strong: !0, style: { display: "block", marginBottom: 8 } }, "工具访问策略"),
      A.length === 0 ? s.createElement(b, { description: "暂无工具" }) : s.createElement(
        "div",
        null,
        ...A.map(
          (m) => s.createElement(
            "div",
            { key: m.toolName, style: { marginBottom: 12, padding: "10px 12px", background: "#fafafa", borderRadius: 6, border: "1px solid #f0f0f0" } },
            s.createElement(
              "div",
              { style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 } },
              s.createElement(
                "div",
                { style: { display: "flex", alignItems: "center", gap: 6 } },
                s.createElement(v, { color: m.stale ? "default" : "blue" }, m.toolName),
                m.stale ? s.createElement(v, { color: "orange" }, "已失效") : null
              ),
              s.createElement(
                "div",
                { style: { display: "flex", alignItems: "center", gap: 8 } },
                s.createElement(x, { style: { fontSize: 12, color: "#666" } }, "默认:"),
                Z(m.defaultEffect, (Y) => _((j) => j && Hl(j, m.toolName, Y))),
                s.createElement(h, { size: "small", icon: s.createElement(G), onClick: () => _((Y) => Y && Gl(Y, m.toolName)) }, "添加规则")
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
            m.rules.length === 0 ? s.createElement(x, { style: { fontSize: 12, color: "#999" } }, "暂无工具级覆盖规则") : s.createElement("div", null, ...m.rules.map((Y) => S(Y, !0)))
          )
        )
      )
    ) : s.createElement("div", { style: { color: "#ff4d4f" } }, "加载访问策略失败")
  );
}
function Yl({
  client: e,
  agentId: t,
  open: l,
  onClose: a,
  onAuthChanged: n
}) {
  var Q, le, M, p, u;
  const s = z().React, { useState: r, useCallback: o, useEffect: d } = s, { Modal: c, Button: g, Input: w, Typography: b, message: h } = z().antd, { Text: v } = b, [y, O] = r("idle"), [L, U] = r(""), [N, te] = r(!1), [G, W] = r(((Q = e.oauth_status) == null ? void 0 : Q.client_id) || ""), [x, k] = r(((le = e.oauth_status) == null ? void 0 : le.scope) || ""), [_, X] = r(""), [F, I] = r("");
  d(() => {
    if (y !== "waiting") return;
    const A = setInterval(async () => {
      try {
        (await ll(t, e.key)).authorized && (O("success"), n());
      } catch {
      }
    }, 2e3);
    return () => clearInterval(A);
  }, [y, e.key, t, n]);
  const E = y === "success" || y === "idle" && ((M = e.oauth_status) == null ? void 0 : M.authorized) === !0, f = y === "idle" && ((p = e.oauth_status) == null ? void 0 : p.authorized) && e.oauth_status.expires_at > 0 && e.oauth_status.expires_at < Date.now() / 1e3, $ = o(async () => {
    var A;
    if (!((A = e.url) != null && A.trim())) {
      U("缺少 URL");
      return;
    }
    O("starting"), U("");
    try {
      const ne = await al(t, e.key, {
        url: e.url,
        scope: x,
        client_id: G,
        auth_endpoint: _,
        token_endpoint: F
      });
      O("waiting"), window.open(ne.auth_url, "_blank", "popup,width=600,height=700");
    } catch (ne) {
      O("error"), U((ne == null ? void 0 : ne.message) || "OAuth 启动失败");
    }
  }, [t, e.key, e.url, x, G, _, F]), K = o(async () => {
    O("revoking");
    try {
      await sl(t, e.key), O("idle"), n();
    } catch {
      O("idle");
    }
  }, [t, e.key, n]);
  return s.createElement(
    c,
    {
      title: `${e.name || e.key} — OAuth 授权管理`,
      open: l,
      onCancel: a,
      footer: s.createElement("div", { style: { textAlign: "right" } }, s.createElement(g, { onClick: a }, "关闭")),
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
          { style: { fontSize: 12, padding: "2px 8px", borderRadius: 12, border: "1px solid", color: f ? "#e67e22" : E ? "#27ae60" : "#7f8c8d", borderColor: f ? "#e67e22" : E ? "#27ae60" : "#7f8c8d", background: "white" } },
          f ? "已过期" : E ? "已授权" : y === "waiting" ? "等待授权..." : y === "error" ? "授权失败" : "未授权"
        ),
        s.createElement(
          "div",
          { style: { display: "flex", gap: 8 } },
          E || f ? s.createElement(g, { size: "small", onClick: K, loading: String(y) === "revoking" }, "撤销") : null,
          s.createElement(g, { size: "small", type: E && !f ? "default" : "primary", onClick: $, loading: y === "starting" || y === "waiting", disabled: !((u = e.url) != null && u.trim()) }, E && !f ? "重新授权" : "授权")
        )
      ),
      L ? s.createElement("p", { style: { color: "#c0392b", fontSize: 12 } }, L) : null,
      // Advanced
      s.createElement(
        "div",
        { style: { marginTop: 8, cursor: "pointer", color: "#888", fontSize: 12 }, onClick: () => te((A) => !A) },
        N ? "收起高级设置" : "展开高级设置"
      ),
      N ? s.createElement(
        "div",
        { style: { marginTop: 8, padding: "10px 12px", background: "white", borderRadius: 6, border: "1px solid #e9ecef" } },
        s.createElement(v, { style: { fontSize: 11, color: "#888", display: "block", marginBottom: 2 } }, "Client ID"),
        s.createElement(w, { size: "small", placeholder: "留空则使用动态注册", value: G, onChange: (A) => W(A.target.value) }),
        s.createElement(v, { style: { fontSize: 11, color: "#888", display: "block", marginBottom: 2, marginTop: 8 } }, "Scope"),
        s.createElement(w, { size: "small", placeholder: "OAuth scope", value: x, onChange: (A) => k(A.target.value) }),
        s.createElement(v, { style: { fontSize: 11, color: "#888", display: "block", marginBottom: 2, marginTop: 8 } }, "授权端点"),
        s.createElement(w, { size: "small", placeholder: "https://auth.example.com/authorize", value: _, onChange: (A) => X(A.target.value) }),
        s.createElement(v, { style: { fontSize: 11, color: "#888", display: "block", marginBottom: 2, marginTop: 8 } }, "令牌端点"),
        s.createElement(w, { size: "small", placeholder: "https://auth.example.com/token", value: F, onChange: (A) => I(A.target.value) })
      ) : null
    )
  );
}
function Ql({
  mcp: e,
  agentId: t,
  onToggle: l,
  onDelete: a,
  onUpdate: n,
  onUpdatePolicy: s,
  onRefresh: r
}) {
  const o = z().React, { useState: d } = o, { Card: c, Tag: g, Tooltip: w, Modal: b, Input: h, Button: v, Typography: y } = z().antd, { Text: O } = y, {
    EyeOutlined: L,
    EyeInvisibleOutlined: U,
    DeleteOutlined: N,
    ToolOutlined: te
  } = z().antdIcons || {}, [G, W] = d(!1), [x, k] = d(!1), [_, X] = d(!1), [F, I] = d(""), [E, f] = d(!1), [$, K] = d(!1), Q = e.transport === "streamable_http" || e.transport === "sse", le = Q ? "Remote" : "Local", M = e.oauth_status, p = Date.now() / 1e3, u = !!(M != null && M.authorized) && M.expires_at > p, A = !!(M != null && M.authorized) && M.expires_at <= p, ne = !!M, R = () => {
    I(JSON.stringify(e, null, 2)), f(!1), W(!0);
  }, V = async () => {
    try {
      const C = JSON.parse(F), J = [
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
      for (const Z of J)
        Z in C && (re[Z] = C[Z]);
      await n(e.key, re) && (W(!1), f(!1));
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
            w,
            { title: e.name },
            o.createElement(O, { strong: !0, style: { fontSize: 14, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" } }, e.name || e.key)
          ),
          o.createElement(
            "span",
            { style: { fontSize: 10, padding: "1px 6px", borderRadius: 4, background: Q ? "#e6f4ff" : "#f9f0ff", color: Q ? "#1677ff" : "#722ed1", flexShrink: 0 } },
            le
          ),
          // OAuth status icons
          ne && A ? o.createElement("span", { style: { fontSize: 11, color: "#e67e22", flexShrink: 0 } }, "⚠") : null,
          ne && u ? o.createElement("span", { style: { fontSize: 11, color: "#27ae60", flexShrink: 0 } }, "✓") : null,
          ne && !u && !A ? o.createElement("span", { style: { fontSize: 11, color: "#7f8c8d", flexShrink: 0 } }, "🔒") : null
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
          v,
          {
            size: "small",
            icon: te ? o.createElement(te) : void 0,
            onClick: (C) => {
              C.stopPropagation(), X(!0);
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
            v,
            {
              size: "small",
              onClick: (C) => {
                C.stopPropagation(), K(!0);
              },
              style: {
                color: u ? "#27ae60" : A ? "#e67e22" : void 0,
                borderColor: u ? "#27ae60" : A ? "#e67e22" : void 0,
                background: u ? "rgba(39,174,96,0.06)" : A ? "rgba(230,126,34,0.06)" : void 0
              }
            },
            u ? "已授权" : A ? "已过期" : "授权"
          ) : null,
          o.createElement(
            v,
            {
              size: "small",
              icon: e.enabled ? U ? o.createElement(U) : void 0 : L ? o.createElement(L) : void 0,
              onClick: l
            },
            e.enabled ? "禁用" : "启用"
          ),
          o.createElement(
            v,
            {
              size: "small",
              danger: !0,
              icon: N ? o.createElement(N) : void 0,
              onClick: (C) => {
                C.stopPropagation(), k(!0);
              }
            },
            "删除"
          )
        )
      )
    ),
    // ── Delete Confirmation Modal ──
    o.createElement(
      b,
      {
        title: "确认删除",
        open: x,
        onOk: () => {
          k(!1), a();
        },
        onCancel: () => k(!1),
        okText: "确认删除",
        cancelText: "取消",
        okButtonProps: { danger: !0 }
      },
      o.createElement("p", null, `确定要删除 MCP 客户端「${e.name || e.key}」吗？此操作不可撤销。`)
    ),
    // ── JSON Config Modal (click card to view/edit) ──
    o.createElement(
      b,
      {
        title: `${e.name || e.key} - 配置`,
        open: G,
        onCancel: () => {
          W(!1), f(!1);
        },
        footer: o.createElement(
          "div",
          { style: { textAlign: "right" } },
          o.createElement(v, { onClick: () => {
            W(!1), f(!1);
          }, style: { marginRight: 8 } }, "取消"),
          E ? o.createElement(v, { type: "primary", onClick: V }, "保存") : o.createElement(v, { type: "primary", onClick: () => f(!0) }, "编辑")
        ),
        width: 700
      },
      o.createElement(
        "div",
        { style: { marginBottom: 8, fontSize: 12, color: "#8c8c8c" } },
        "密钥类字段（如 API_KEY）可能已被后端脱敏，保存时不会覆盖脱敏值。"
      ),
      E ? o.createElement(h.TextArea, {
        value: F,
        onChange: (C) => I(C.target.value),
        autoSize: { minRows: 15, maxRows: 25 },
        style: { fontFamily: "Monaco, Courier New, monospace", fontSize: 13 }
      }) : o.createElement(
        "pre",
        { style: { backgroundColor: "#f5f5f5", padding: 16, borderRadius: 8, maxHeight: 400, overflow: "auto", fontSize: 13, fontFamily: "Monaco, Courier New, monospace" } },
        se
      )
    ),
    // ── Access Modal (tools + access policy) ──
    o.createElement(Vl, {
      client: e,
      agentId: t,
      open: _,
      onClose: () => X(!1),
      onSave: s
    }),
    // ── OAuth Modal (remote clients only) ──
    Q ? o.createElement(Yl, {
      client: e,
      agentId: t,
      open: $,
      onClose: () => K(!1),
      onAuthChanged: async () => {
        await (r == null ? void 0 : r());
      }
    }) : null
  );
}
const jt = {
  reservoir_simulation: "油藏数值模拟",
  geological_modeling: "地质建模",
  well_log_analysis: "测井分析",
  production_engineering: "采油工程",
  post_processing: "后处理与可视化",
  multiphysics: "多物理场仿真"
}, la = {
  reservoir_simulation: "🛢️",
  geological_modeling: "🏔️",
  well_log_analysis: "📡",
  production_engineering: "⚙️",
  post_processing: "📊",
  multiphysics: "🔬"
}, sa = /* @__PURE__ */ new Set(["cmg", "comsol", "tnavigator", "eclipse", "intersect", "visage"]);
function oa(e) {
  return Ne(`/ugsci/engines/icon/${encodeURIComponent(e)}`);
}
async function Zl() {
  return ce("/ugsci/engines/list");
}
async function es(e) {
  return ce("/ugsci/engines/", {
    method: "POST",
    body: JSON.stringify(e)
  });
}
async function ts(e, t) {
  return ce(`/ugsci/engines/${encodeURIComponent(e)}`, {
    method: "PUT",
    body: JSON.stringify(t)
  });
}
async function ns(e) {
  return ce(
    `/ugsci/engines/${encodeURIComponent(e)}`,
    { method: "DELETE" }
  );
}
async function as() {
  return ce("/ugsci/engines/detect/refresh", {
    method: "POST"
  });
}
function ls({
  engine: e,
  onClick: t
}) {
  const l = z().React, { Card: a, Tag: n, Typography: s } = z().antd, { Text: r } = s, o = e.status === "detected", d = la[e.category] || "📦", g = sa.has(e.id) ? l.createElement("img", {
    src: oa(e.id),
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
        g,
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
        jt[e.category] || e.category
      ) : null,
      e.version ? l.createElement(
        n,
        { color: "blue", style: { fontSize: 11 } },
        `v${e.version}`
      ) : null,
      ...(e.modules || []).map(
        (w) => l.createElement(
          n,
          { key: w, color: "cyan", style: { fontSize: 10 } },
          w
        )
      )
    )
  );
}
function ss() {
  const e = z().React, { useState: t, useEffect: l, useCallback: a, useMemo: n } = e, {
    Spin: s,
    Empty: r,
    Button: o,
    message: d,
    Row: c,
    Col: g,
    Drawer: w,
    Descriptions: b,
    Tag: h,
    Typography: v,
    Modal: y,
    Input: O,
    Select: L,
    Popconfirm: U,
    Space: N
  } = z().antd, {
    ReloadOutlined: te,
    SearchOutlined: G,
    PlusOutlined: W,
    EditOutlined: x,
    DeleteOutlined: k,
    CopyOutlined: _,
    ExperimentOutlined: X
  } = z().antdIcons || {}, { Text: F, Paragraph: I } = v, [E, f] = t([]), [$, K] = t(!0), [Q, le] = t(""), [M, p] = t(!1), [u, A] = t(null), [ne, R] = t(!1), [V, se] = t(null), [C, J] = t({}), [re, S] = t(!1), Z = a(async () => {
    K(!0);
    try {
      const ae = await Zl();
      f(ae.engines || []);
    } catch (ae) {
      d.error(ae.message || "加载引擎列表失败"), f([]);
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
  }, []), j = a(() => {
    se(null), J({
      name: "",
      vendor: "",
      version: "",
      executable_path: "",
      category: "",
      description: "",
      invocation_hint: ""
    }), R(!0);
  }, []), oe = a((ae) => {
    se(ae), J({ ...ae }), R(!0), p(!1);
  }, []), de = a(async () => {
    var ae;
    if (!((ae = C.name) != null && ae.trim())) {
      d.warning("请输入引擎名称");
      return;
    }
    S(!0);
    try {
      V ? (await ts(V.id, C), d.success("引擎已更新")) : (await es(C), d.success("引擎已添加")), R(!1), Z();
    } catch (D) {
      d.error(D.message || "保存失败");
    } finally {
      S(!1);
    }
  }, [C, V, Z]), Ee = a(
    async (ae) => {
      try {
        await ns(ae), d.success("引擎已删除"), p(!1), Z();
      } catch (D) {
        d.error(D.message || "删除失败");
      }
    },
    [Z]
  ), ye = a(async () => {
    K(!0);
    try {
      const ae = await as();
      f(ae.engines || []), d.success("自动检测完成");
    } catch (ae) {
      d.error(ae.message || "检测失败");
    } finally {
      K(!1);
    }
  }, []), pe = a(
    (ae, D, T) => {
      const q = C[D] || "";
      return e.createElement(
        "div",
        { style: { marginBottom: 12 } },
        e.createElement(
          F,
          { style: { fontSize: 13, display: "block", marginBottom: 4 } },
          ae
        ),
        T != null && T.select ? e.createElement(L, {
          value: q || void 0,
          onChange: (ie) => J((H) => ({ ...H, [D]: ie })),
          style: { width: "100%" },
          options: T.select.options,
          allowClear: !0,
          placeholder: `选择${ae}`
        }) : T != null && T.textarea ? e.createElement(O.TextArea, {
          value: q,
          onChange: (ie) => J((H) => ({ ...H, [D]: ie.target.value })),
          rows: 3,
          placeholder: `输入${ae}`
        }) : e.createElement(O, {
          value: q,
          onChange: (ie) => J((H) => ({ ...H, [D]: ie.target.value })),
          placeholder: `输入${ae}`
        })
      );
    },
    [C]
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
      e.createElement(O, {
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
          loading: $
        },
        "自动检测"
      ),
      e.createElement(
        o,
        {
          type: "primary",
          icon: W ? e.createElement(W) : void 0,
          onClick: j,
          style: Oe
        },
        "添加引擎"
      )
    ),
    // Content
    $ ? e.createElement(
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
          g,
          {
            key: ae.id,
            xs: 24,
            sm: 12,
            md: 8,
            lg: 6,
            style: { display: "flex" }
          },
          e.createElement(ls, {
            engine: ae,
            onClick: () => {
              A(ae), p(!0);
            }
          })
        )
      )
    ),
    // Detail drawer
    u ? e.createElement(
      w,
      {
        title: e.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 8 } },
          e.createElement(
            "span",
            { style: { display: "flex", alignItems: "center" } },
            sa.has(u.id) ? e.createElement("img", {
              src: oa(u.id),
              alt: u.name,
              style: { width: 20, height: 20, objectFit: "contain" }
            }) : e.createElement(
              "span",
              { style: { fontSize: 18 } },
              la[u.category] || "📦"
            )
          ),
          e.createElement("span", null, u.name)
        ),
        open: M,
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
                icon: k ? e.createElement(k) : void 0
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
          u.name
        ),
        e.createElement(
          b.Item,
          { label: "厂商" },
          u.vendor || "—"
        ),
        e.createElement(
          b.Item,
          { label: "分类" },
          u.category ? jt[u.category] || u.category : "—"
        ),
        e.createElement(
          b.Item,
          { label: "状态" },
          e.createElement(
            h,
            {
              color: u.status === "detected" ? "success" : u.status === "not_found" ? "error" : "default"
            },
            u.status === "detected" ? "✅ 已检测" : u.status === "not_found" ? "❌ 路径无效" : "🔧 待配置"
          )
        ),
        e.createElement(
          b.Item,
          { label: "版本" },
          u.version || "—"
        ),
        u.executable_path ? e.createElement(
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
          b.Item,
          { label: "安装目录" },
          e.createElement(
            "code",
            { style: { fontSize: 12, wordBreak: "break-all" } },
            u.install_dir
          )
        ) : null,
        // Display detected modules with paths
        u.modules && u.modules.length > 0 ? e.createElement(
          b.Item,
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
                  h,
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
          b.Item,
          { label: "许可证服务器" },
          u.license_server
        ) : null,
        e.createElement(
          b.Item,
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
          h,
          { color: "blue" },
          "默认引擎"
        ) : u.is_custom ? e.createElement(
          h,
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
            options: Object.entries(jt).map(([ae, D]) => ({
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
function os() {
  const e = z().React, { useState: t, useEffect: l, useCallback: a, useMemo: n } = e, {
    Spin: s,
    Empty: r,
    Input: o,
    Button: d,
    message: c,
    Row: g,
    Col: w,
    Tabs: b,
    Modal: h
  } = z().antd, {
    ReloadOutlined: v,
    PlusOutlined: y,
    SearchOutlined: O,
    ApiOutlined: L,
    RocketOutlined: U
  } = z().antdIcons || {}, { TextArea: N } = o, G = z().useSelectedAgent, W = G ? G() : null, x = (W == null ? void 0 : W.id) || "default";
  l(() => {
    xt();
  }, [x]);
  const [k, _] = t([]), [X, F] = t(!0), [I, E] = t(""), [f, $] = t("mcp"), [K, Q] = t(!1), [le, M] = t(`{
  "mcpServers": {
    "example-client": {
      "command": "npx",
      "args": ["-y", "@example/mcp-server"],
      "env": {}
    }
  }
}`), [p, u] = t(!1), A = a(async () => {
    F(!0);
    try {
      const m = await Ka(x);
      _(m);
    } catch (m) {
      c.error(m.message || "加载 MCP 列表失败"), _([]);
    } finally {
      F(!1);
    }
  }, [x]);
  l(() => {
    A();
  }, [A]);
  const ne = a(
    async (m) => {
      try {
        await qa(x, m.key), c.success(m.enabled ? "已禁用" : "已启用"), A();
      } catch (Y) {
        c.error(Y.message || "切换状态失败");
      }
    },
    [x, A]
  ), R = a(async (m) => {
    try {
      await Va(x, m.key), c.success(`MCP「${m.key}」已删除`), A();
    } catch (Y) {
      c.error(Y.message || "删除失败");
    }
  }, [x, A]), V = a(async () => {
    u(!0);
    try {
      const m = JSON.parse(le), Y = m.mcpServers || m, j = Object.entries(Y);
      if (j.length === 0) {
        c.warning("未找到 MCP 客户端配置");
        return;
      }
      let oe = !0;
      for (const [de, Ee] of j) {
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
          await Ya(
            x,
            de,
            ae
          );
        } catch {
          oe = !1;
        }
      }
      oe && (c.success("MCP 客户端已创建"), Q(!1), A());
    } catch (m) {
      m instanceof SyntaxError ? c.error("JSON 格式错误：" + m.message) : c.error(m.message || "创建 MCP 失败");
    } finally {
      u(!1);
    }
  }, [le, x, A]), se = n(() => {
    if (!I.trim()) return k;
    const m = I.toLowerCase();
    return k.filter(
      (Y) => {
        var j;
        return Y.name.toLowerCase().includes(m) || Y.key.toLowerCase().includes(m) || ((j = Y.description) == null ? void 0 : j.toLowerCase().includes(m)) || Y.transport.toLowerCase().includes(m);
      }
    );
  }, [k, I]), C = k.filter((m) => m.enabled).length, J = k.reduce((m, Y) => {
    var j;
    return m + (((j = Y.tools) == null ? void 0 : j.length) || 0);
  }, 0), re = (m) => {
    window.history.pushState({}, "", m), window.dispatchEvent(new PopStateEvent("popstate"));
  }, S = e.createElement(
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
        prefix: O ? e.createElement(O) : void 0,
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
    X ? e.createElement(
      "div",
      { style: { textAlign: "center", padding: 60 } },
      e.createElement(s, { size: "large" })
    ) : se.length === 0 ? e.createElement(r, {
      description: I ? "未找到匹配的能力" : "暂无 MCP 客户端，点击「添加 MCP」创建"
    }) : e.createElement(
      g,
      { gutter: [12, 12], align: "stretch" },
      ...se.map(
        (m) => e.createElement(
          w,
          {
            key: m.key,
            xs: 24,
            sm: 12,
            md: 8,
            lg: 6,
            style: { display: "flex" }
          },
          e.createElement(Ql, {
            mcp: m,
            agentId: x,
            onToggle: (Y) => {
              Y.stopPropagation(), ne(m);
            },
            onDelete: () => {
              R(m);
            },
            onUpdate: async (Y, j) => {
              try {
                return await Qa(x, Y, j), c.success("MCP 配置已更新"), A(), !0;
              } catch (oe) {
                return c.error(oe.message || "更新 MCP 失败"), !1;
              }
            },
            onUpdatePolicy: async (Y, j) => {
              try {
                return await tl(x, Y, j), c.success("访问策略已保存"), A(), !0;
              } catch (oe) {
                return c.error(oe.message || "保存访问策略失败"), !1;
              }
            },
            onRefresh: async () => {
              A();
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
      children: S
    },
    {
      key: "software",
      label: e.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        U ? e.createElement(U, { style: { fontSize: 14 } }) : null,
        "计算引擎"
      ),
      children: e.createElement(ss)
    }
  ];
  return e.createElement(
    "div",
    { style: { padding: 24 } },
    e.createElement(_t, {
      title: "工具",
      subtitle: `MCP: ${k.length} 个客户端（${C} 个启用）· ${J} 个工具`,
      extra: e.createElement(
        e.Fragment,
        null,
        e.createElement(
          d,
          {
            icon: v ? e.createElement(v) : void 0,
            onClick: () => {
              et(), A();
            },
            loading: X
          },
          "刷新"
        )
      )
    }),
    e.createElement(b, {
      items: Z,
      activeKey: f,
      onChange: (m) => $(m)
    }),
    // ── Create MCP Modal (mirror console /mcp JSON import) ──
    e.createElement(
      h,
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
        onChange: (m) => M(m.target.value),
        autoSize: { minRows: 12, maxRows: 20 },
        style: { fontFamily: "Monaco, Courier New, monospace", fontSize: 13 }
      })
    )
  );
}
function rs({
  agentId: e,
  agentName: t,
  onNavigate: l
}) {
  const a = z().React, { useState: n, useEffect: s, useCallback: r } = a, {
    Spin: o,
    Empty: d,
    Button: c,
    Row: g,
    Col: w,
    Card: b,
    Tag: h,
    Checkbox: v,
    Modal: y,
    Typography: O,
    Drawer: L,
    Descriptions: U,
    message: N
  } = z().antd, {
    ReloadOutlined: te,
    ThunderboltOutlined: G,
    SettingOutlined: W,
    CheckSquareOutlined: x,
    EyeOutlined: k,
    EyeInvisibleOutlined: _,
    DeleteOutlined: X,
    CloseOutlined: F
  } = z().antdIcons || {}, { Text: I, Paragraph: E } = O, [f, $] = n([]), [K, Q] = n(!0), [le, M] = n(!1), [p, u] = n(null), [A, ne] = n(!1), [R, V] = n(
    /* @__PURE__ */ new Set()
  ), [se, C] = n(!1), [J, re] = n(null), [S, Z] = n(!1), m = r(async () => {
    if (e) {
      Q(!0);
      try {
        const T = await kt(e);
        $(T);
      } catch (T) {
        N.error(T.message || "加载技能失败"), $([]);
      } finally {
        Q(!1);
      }
    }
  }, [e]);
  s(() => {
    m();
  }, [m]);
  const Y = (T) => {
    V((q) => {
      const ie = new Set(q);
      return ie.has(T) ? ie.delete(T) : ie.add(T), ie;
    });
  }, j = () => V(/* @__PURE__ */ new Set()), oe = () => V(new Set(f.map((T) => T.name))), de = () => {
    A ? (j(), ne(!1)) : ne(!0);
  }, Ee = async () => {
    const T = Array.from(R);
    if (T.length !== 0) {
      C(!0);
      try {
        const { results: q } = await ul(e, T), ie = Object.entries(q).filter(
          ([, ue]) => ue.success === !1
        ), H = T.length - ie.length;
        ie.length > 0 ? N.warning(
          `批量启用完成：成功 ${H} 个，失败 ${ie.length} 个`
        ) : N.success(`成功启用 ${T.length} 个技能`), j(), await m();
      } catch (q) {
        N.error(q.message || "批量启用失败");
      } finally {
        C(!1);
      }
    }
  }, ye = async () => {
    const T = Array.from(R);
    if (T.length !== 0) {
      C(!0);
      try {
        const { results: q } = await pl(e, T), ie = Object.entries(q).filter(
          ([, ue]) => ue.success === !1
        ), H = T.length - ie.length;
        ie.length > 0 ? N.warning(
          `批量停用完成：成功 ${H} 个，失败 ${ie.length} 个`
        ) : N.success(`成功停用 ${T.length} 个技能`), j(), await m();
      } catch (q) {
        N.error(q.message || "批量停用失败");
      } finally {
        C(!1);
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
        C(!0);
        try {
          const { results: q } = await gl(e, T), ie = Object.entries(q).filter(
            ([, ue]) => ue.success === !1
          ), H = T.length - ie.length;
          ie.length > 0 ? N.warning(
            `批量删除完成：成功 ${H} 个，失败 ${ie.length} 个`
          ) : N.success(`成功删除 ${T.length} 个技能`), j(), await m();
        } catch (q) {
          N.error(q.message || "批量删除失败");
        } finally {
          C(!1);
        }
      }
    });
  }, ae = async (T) => {
    Z(!0);
    try {
      T.enabled === !1 ? (await Fn(e, T.name), N.success(`已启用技能「${T.name}」`)) : (await Wn(e, T.name), N.success(`已禁用技能「${T.name}」`)), await m();
    } catch (q) {
      N.error(q.message || "操作失败");
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
          await Jt(e, T.name), N.success(`已删除技能「${T.name}」`), await m();
        } catch (q) {
          N.error(q.message || "删除失败");
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
        A ? `已选择 ${R.size} / ${f.length} 个技能` : `共 ${f.length} 个技能`
      ),
      a.createElement(
        "div",
        { style: { display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" } },
        A ? a.createElement(
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
              onClick: j
            },
            "取消选择"
          ),
          a.createElement(
            c,
            {
              size: "small",
              type: "default",
              icon: k ? a.createElement(k) : void 0,
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
              icon: X ? a.createElement(X) : void 0,
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
              disabled: f.length === 0
            },
            "批量管理"
          ),
          a.createElement(
            c,
            {
              icon: te ? a.createElement(te) : void 0,
              onClick: () => {
                et(), m();
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
    ) : f.length === 0 ? a.createElement(d, {
      description: "当前智能体未加载任何技能"
    }) : a.createElement(
      g,
      { gutter: [12, 12] },
      ...f.map(
        (T) => a.createElement(
          w,
          { key: T.name, xs: 24, sm: 12, md: 8, lg: 6 },
          a.createElement(
            b,
            {
              hoverable: !0,
              size: "small",
              style: {
                cursor: A ? "default" : "pointer",
                height: "100%",
                position: "relative",
                borderColor: A && R.has(T.name) ? "#0072f5" : void 0,
                borderWidth: A && R.has(T.name) ? 2 : 1
              },
              onClick: () => {
                A ? Y(T.name) : (u(T), M(!0));
              },
              onMouseEnter: () => {
                A || re(T.name);
              },
              onMouseLeave: () => re(null)
            },
            A ? a.createElement(
              "div",
              {
                style: {
                  position: "absolute",
                  top: 8,
                  right: 8,
                  zIndex: 1
                },
                onClick: (q) => {
                  q.stopPropagation(), Y(T.name);
                }
              },
              a.createElement(v, {
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
                h,
                { color: "default", style: { fontSize: 10 } },
                "已禁用"
              ) : a.createElement(
                h,
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
                h,
                { style: { fontSize: 10 } },
                `v${T.version_text}`
              ) : null,
              ...(T.tags || []).slice(0, 3).map(
                (q, ie) => a.createElement(
                  h,
                  { key: ie, color: "blue", style: { fontSize: 10 } },
                  q
                )
              )
            ),
            // Hover action footer (not in batch mode)
            !A && J === T.name ? a.createElement(
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
                  icon: T.enabled === !1 ? k ? a.createElement(k) : void 0 : _ ? a.createElement(_) : void 0,
                  disabled: S,
                  onClick: (q) => {
                    q.stopPropagation(), ae(T);
                  }
                },
                T.enabled === !1 ? "启用" : "禁用"
              ),
              a.createElement(
                c,
                {
                  size: "small",
                  danger: !0,
                  icon: X ? a.createElement(X) : void 0,
                  disabled: S,
                  onClick: (q) => {
                    q.stopPropagation(), D(T);
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
        onClose: () => M(!1),
        width: 520,
        extra: a.createElement(
          c,
          {
            type: "primary",
            size: "small",
            icon: W ? a.createElement(W) : void 0,
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
            (T, q) => a.createElement(h, { key: q, color: "blue" }, T)
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
function is({
  poolSkills: e,
  workspaceSkills: t,
  agents: l,
  loading: a,
  onReload: n,
  agentId: s,
  agentName: r
}) {
  const o = z().React, { useState: d, useMemo: c, useCallback: g } = o, {
    Spin: w,
    Empty: b,
    Input: h,
    Button: v,
    Row: y,
    Col: O,
    Card: L,
    Tag: U,
    Typography: N,
    Drawer: te,
    Descriptions: G,
    List: W,
    Modal: x,
    message: k
  } = z().antd, {
    ReloadOutlined: _,
    SearchOutlined: X,
    DownloadOutlined: F,
    ThunderboltOutlined: I,
    DeleteOutlined: E,
    PlusOutlined: f
  } = z().antdIcons || {}, { Text: $, Paragraph: K } = N, [Q, le] = d(""), [M, p] = d(!1), [u, A] = d(null), [ne, R] = d([]), [V, se] = d(!1), [C, J] = d(24), [re, S] = d(null), [Z, m] = d(!1), Y = c(() => {
    if (!Q.trim()) return e;
    const D = Q.toLowerCase();
    return e.filter(
      (T) => {
        var q, ie;
        return T.name.toLowerCase().includes(D) || ((q = T.description) == null ? void 0 : q.toLowerCase().includes(D)) || ((ie = T.tags) == null ? void 0 : ie.some((H) => H.toLowerCase().includes(D)));
      }
    );
  }, [e, Q]), j = c(
    () => Y.slice(0, C),
    [Y, C]
  ), oe = g((D) => {
    le(D), J(24);
  }, []), de = g(
    (D) => {
      const T = [];
      for (const q of t)
        if (q.skills.some((ie) => ie.name === D)) {
          const ie = l.find((H) => H.id === q.agent_id);
          T.push((ie == null ? void 0 : ie.name) || q.agent_name || q.agent_id);
        }
      return T;
    },
    [t, l]
  ), Ee = g(
    async (D) => {
      if (A(D), R(de(D.name)), p(!0), !D.content) {
        se(!0);
        try {
          const T = await Ja(D.name);
          A({ ...D, content: T });
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
      await Wt(s, D.name), k.success(
        `已将技能「${D.name}」加载到当前专家「${r}」`
      ), n();
    } catch (T) {
      k.error(T.message || "加载技能失败");
    } finally {
      m(!1);
    }
  }, pe = (D) => {
    if (D.protected) {
      k.warning("内置技能不可删除");
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
          await yl(D.name), k.success(`已从技能池删除「${D.name}」`), n();
        } catch (T) {
          k.error(T.message || "删除失败");
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
      o.createElement(h, {
        placeholder: "搜索技能名称、描述或标签...",
        prefix: X ? o.createElement(X) : void 0,
        value: Q,
        onChange: (D) => oe(D.target.value),
        allowClear: !0,
        style: { maxWidth: 400 }
      }),
      o.createElement(
        "div",
        { style: { display: "flex", gap: 8 } },
        o.createElement(
          v,
          {
            icon: _ ? o.createElement(_) : void 0,
            onClick: n,
            loading: a,
            size: "small"
          },
          "刷新"
        ),
        o.createElement(
          v,
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
      o.createElement(w, { size: "large" })
    ) : Y.length === 0 ? o.createElement(b, {
      description: Q ? "未找到匹配的技能" : "技能池为空"
    }) : o.createElement(
      o.Fragment,
      null,
      o.createElement(
        y,
        { gutter: [12, 12] },
        ...j.map(
          (D) => o.createElement(
            O,
            { key: D.name, xs: 24, sm: 12, md: 8, lg: 6 },
            o.createElement(
              L,
              {
                hoverable: !0,
                size: "small",
                style: { cursor: "pointer", height: "100%" },
                onClick: () => Ee(D),
                onMouseEnter: () => S(D.name),
                onMouseLeave: () => S(null)
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
                  $,
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
                  (T, q) => o.createElement(
                    U,
                    { key: q, color: "cyan", style: { fontSize: 10 } },
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
                  v,
                  {
                    size: "small",
                    type: "primary",
                    icon: f ? o.createElement(f) : void 0,
                    disabled: Z,
                    onClick: (T) => {
                      T.stopPropagation(), ye(D);
                    }
                  },
                  "加载到当前Agent"
                ),
                o.createElement(
                  v,
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
        j.length < Y.length ? o.createElement(
          "div",
          { style: { textAlign: "center", marginTop: 16 } },
          o.createElement(
            v,
            {
              onClick: () => J((D) => D + 24),
              size: "small"
            },
            `加载更多 (剩余 ${Y.length - j.length} 个)`
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
        open: M,
        onClose: () => p(!1),
        width: 520,
        extra: o.createElement(
          v,
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
          $,
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
          $,
          { strong: !0, style: { display: "block", marginBottom: 8 } },
          `已安装此技能的专家 (${ne.length})`
        ),
        ne.length > 0 ? o.createElement(W, {
          size: "small",
          dataSource: ne,
          renderItem: (D) => o.createElement(
            W.Item,
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
              o.createElement(Le, { name: D, size: 20 }),
              o.createElement(
                $,
                { style: { fontSize: 13 } },
                D
              )
            )
          )
        }) : o.createElement(
          $,
          { type: "secondary", style: { fontSize: 12 } },
          "暂无专家安装此技能"
        )
      ),
      // Skill content preview (lazy-loaded)
      V ? o.createElement(
        "div",
        { style: { marginTop: 16, textAlign: "center" } },
        o.createElement(w, { size: "small" })
      ) : u.content ? o.createElement(
        "div",
        { style: { marginTop: 16 } },
        o.createElement(
          $,
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
function cs() {
  const e = z().React, { useState: t, useEffect: l, useCallback: a, useMemo: n } = e, { Tabs: s, message: r } = z().antd, { ThunderboltOutlined: o, AppstoreOutlined: d } = z().antdIcons || {}, g = z().useSelectedAgent, w = g ? g() : null, b = (w == null ? void 0 : w.id) || "default";
  l(() => {
    xt();
  }, [b]);
  const [h, v] = t([]), [y, O] = t([]), [L, U] = t([]), [N, te] = t(!0), [G, W] = t("agent-skills"), x = a(async () => {
    te(!0);
    try {
      const [F, I, E] = await Promise.all([
        Gt(!0),
        Dt(),
        Xa()
      ]);
      O(F), v(I), U(E);
    } catch (F) {
      r.error(F.message || "加载技能列表失败"), O([]);
    } finally {
      te(!1);
    }
  }, []);
  l(() => {
    x();
  }, [x]);
  const k = n(() => {
    const F = h.find((I) => I.id === b);
    return (F == null ? void 0 : F.name) || b;
  }, [h, b]), _ = (F) => {
    window.history.pushState({}, "", F), window.dispatchEvent(new PopStateEvent("popstate"));
  }, X = [
    {
      key: "agent-skills",
      label: e.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        o ? e.createElement(o, { style: { fontSize: 14 } }) : null,
        "当前Agent加载技能"
      ),
      children: e.createElement(rs, {
        agentId: b,
        agentName: k,
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
      children: e.createElement(is, {
        poolSkills: y,
        workspaceSkills: L,
        agents: h,
        loading: N,
        onReload: x,
        agentId: b,
        agentName: k
      })
    }
  ];
  return e.createElement(
    "div",
    { style: { padding: 24 } },
    e.createElement(_t, {
      title: "技能",
      subtitle: `技能池共 ${y.length} 个技能 · 当前智能体：${k}`
    }),
    e.createElement(s, {
      items: X,
      activeKey: G,
      onChange: (F) => W(F)
    })
  );
}
const vt = "ugsci.market.githubSources", An = "https://github.com/anthropics/skills/tree/main/skills", ra = "https://ugsci-awesome-tools.oss-cn-beijing.aliyuncs.com", ms = `${ra}/skills`;
function ct(e) {
  const t = e.replace(/^\/+/, "");
  return Ne(`/plugins/oss-proxy?path=${encodeURIComponent(t)}`);
}
async function qt(e) {
  const t = e.replace(/^\/+/, ""), l = await fetch(ct(t));
  if (!l.ok)
    throw new Error(`OSS fetch failed (${l.status}): ${t}`);
  return await l.json();
}
function mt(e) {
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
function ds(e) {
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
    iconUrl: e.icon_url ? ct(e.icon_url) : void 0,
    category: e.category ? mt(e.category) : "",
    description: e.description,
    transport: e.transport || "stdio",
    command: ((n = e.config) == null ? void 0 : n.command) || "",
    args: ((s = e.config) == null ? void 0 : s.args) || [],
    env: Object.keys(t).length > 0 ? t : void 0
  };
}
const ia = "ugsci.market.mcpSources", ca = "ugsci.market.expertSources";
function ma(e, t) {
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
function da(e, t) {
  try {
    localStorage.setItem(e, JSON.stringify(t));
  } catch {
  }
}
function us() {
  return ma(ia, "mcp");
}
function ft(e) {
  da(ia, e);
}
function ps() {
  return ma(ca, "expert");
}
function yt(e) {
  da(ca, e);
}
function ua(e) {
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
function pa(e, t, l, a = "github") {
  return a === "oss" ? `oss:${e}/${l || "/"}` : `${a}:${e}/${t}:${l || "/"}`;
}
function gs(e) {
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
function fs() {
  try {
    const e = localStorage.getItem(vt);
    if (!e) {
      const a = [], n = ua(An);
      return n && a.push({
        id: pa(
          n.owner,
          n.repo,
          n.skillsPath,
          n.platform
        ),
        url: An,
        label: n.label,
        owner: n.owner,
        repo: n.repo,
        ref: n.ref,
        skillsPath: n.skillsPath,
        enabled: !1,
        platform: n.platform
      }), localStorage.setItem(vt, JSON.stringify(a)), a;
    }
    const t = JSON.parse(e);
    if (!Array.isArray(t)) return [];
    const l = t.filter(
      (a) => a && typeof a.id == "string" && (typeof a.owner == "string" || a.platform === "oss") && !(a.platform === "oss" && a.url === ms)
    ).map((a) => ({
      ...a,
      platform: a.platform || "github",
      owner: a.owner || "",
      repo: a.repo || "",
      ref: a.ref || "",
      skillsPath: a.skillsPath || ""
    }));
    return l.length !== t.length && localStorage.setItem(
      vt,
      JSON.stringify(l)
    ), l;
  } catch {
    return [];
  }
}
function Et(e) {
  try {
    localStorage.setItem(
      vt,
      JSON.stringify(e)
    );
  } catch {
  }
}
function ys(e) {
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
async function Es(e) {
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
      const g = e.skillsPath ? e.skillsPath + "/" : "", w = t ? `https://gitee.com/${e.owner}/${e.repo}/raw/${e.ref}/${g}${c.name}/SKILL.md` : `https://raw.githubusercontent.com/${e.owner}/${e.repo}/${e.ref}/${g}${c.name}/SKILL.md`, b = t ? `https://gitee.com/${e.owner}/${e.repo}/tree/${e.ref}/${g}${c.name}` : `https://github.com/${e.owner}/${e.repo}/tree/${e.ref}/${g}${c.name}`, h = {
        sourceId: e.id,
        sourceLabel: e.label,
        name: c.name,
        description: "",
        source_url: b,
        html_url: b,
        version: null,
        author: null
      };
      try {
        const v = {};
        t && e.accessToken && (v.Authorization = `token ${e.accessToken}`);
        const y = await fetch(w, {
          headers: v
        });
        if (!y.ok) return h;
        const O = await y.text(), L = ys(O);
        return {
          ...h,
          name: L.name || c.name,
          description: L.description || "",
          version: L.version || null,
          author: L.author || null
        };
      } catch {
        return h;
      }
    })
  );
}
async function hs(e) {
  const t = gs(e.url);
  if (!t)
    throw new Error(`Invalid OSS URL: ${e.url}`);
  const { endpoint: l, prefix: a } = t, n = a.split("/").map(encodeURIComponent).join("/"), s = ct(`${n}/manifest.json`), r = await fetch(s);
  if (!r.ok)
    throw new Error(
      `无法获取技能列表: manifest.json (${r.status})`
    );
  const o = await r.json(), d = [];
  if (o && o.tag_groups && typeof o.tag_groups == "object")
    for (const [w, b] of Object.entries(o.tag_groups))
      Array.isArray(b) && d.push({
        id: w,
        label: mt(w),
        tags: b
      });
  const c = [];
  function g(w, b) {
    for (const h of w) {
      if (h.type === "collection" && Array.isArray(h.children)) {
        g(h.children, h.name);
        continue;
      }
      const v = h.path || h.name || "";
      if (!v) continue;
      const y = v.split("/").map(encodeURIComponent).join("/"), O = `${l}/${n}/${y}`;
      let L = null;
      if (h.metadata) {
        const N = h.metadata.match(/version:\s*"?([\d.]+)"?/);
        N && (L = N[1]);
      }
      const U = b ? `${e.label}/${b}` : e.label;
      c.push({
        sourceId: e.id,
        sourceLabel: e.label,
        sourcePath: U,
        name: h.name || v.split("/").pop() || v,
        description: h.description || "",
        source_url: O,
        html_url: O,
        version: L,
        author: null,
        tag: h.tag || void 0,
        isOfficial: !0
      });
    }
  }
  if (Array.isArray(o) ? g(
    o.map(
      (w) => typeof w == "string" ? { name: w, path: w } : w
    )
  ) : o && Array.isArray(o.skills) && g(o.skills), c.length === 0)
    throw new Error(
      `manifest.json 中未找到技能。请检查 ${e.url}/manifest.json`
    );
  return { skills: c, categories: d };
}
async function vs() {
  const e = await qt("mcp/manifest.json"), t = [], l = {};
  if (e.tag_groups && typeof e.tag_groups == "object")
    for (const [n, s] of Object.entries(e.tag_groups))
      Array.isArray(s) && (l[n] = s, t.push({
        id: n,
        label: mt(n),
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
async function bs() {
  const e = await qt("skills/manifest.json"), t = [], l = /* @__PURE__ */ new Set();
  function a(n, s) {
    for (const r of n) {
      if ((r == null ? void 0 : r.type) === "collection" && Array.isArray(r.children)) {
        a(r.children, r.name || s);
        continue;
      }
      const o = String((r == null ? void 0 : r.path) || (r == null ? void 0 : r.name) || "").trim();
      if (!o) continue;
      const d = o.split("/").map(encodeURIComponent).join("/"), c = `${ra}/skills/${d}`, g = typeof r.tag == "string" && r.tag.trim() ? r.tag.trim() : void 0;
      g && l.add(g);
      let w = null;
      if (typeof r.metadata == "string") {
        const b = r.metadata.match(/version:\s*"?([\d.]+)"?/);
        b && (w = b[1]);
      }
      t.push({
        sourceId: "oss:ugsci-official",
        sourceLabel: "UGSci",
        sourcePath: s ? `UGSci/${s}` : "UGSci",
        name: r.name || o.split("/").pop() || o,
        description: r.description || "",
        source_url: c,
        html_url: c,
        version: w,
        author: null,
        tag: g,
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
async function Ss() {
  const e = await qt("agents/manifest.json"), t = [], l = {};
  if (e.tag_groups && typeof e.tag_groups == "object")
    for (const [n, s] of Object.entries(e.tag_groups))
      Array.isArray(s) && (l[n] = s, t.push({
        id: n,
        label: mt(n),
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
async function ws(e) {
  const t = e.filter((r) => r.enabled), l = await Promise.all(
    t.map(async (r) => {
      try {
        if (r.platform === "oss") {
          const { skills: o, categories: d } = await hs(r);
          return { skills: o, categories: d, error: null, label: r.label };
        } else
          return { skills: await Es(r), categories: [], error: null, label: r.label };
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
function Cs({
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
    Tag: g,
    Switch: w,
    Typography: b,
    Tooltip: h,
    message: v
  } = z().antd, {
    PlusOutlined: y,
    DeleteOutlined: O,
    LinkOutlined: L,
    GithubOutlined: U
  } = z().antdIcons || {}, { Text: N } = b, [te, G] = s(""), [W, x] = s(""), k = () => {
    const I = te.trim();
    if (!I) return;
    const E = ua(I);
    if (!E) {
      v.error("无效的仓库 URL，请输入类似 https://github.com/owner/repo/tree/main/skills 或 https://gitee.com/owner/repo/tree/master/skills 的链接");
      return;
    }
    const f = pa(E.owner, E.repo, E.skillsPath, E.platform);
    if (l.some((Q) => Q.id === f)) {
      v.warning("该源已存在");
      return;
    }
    const $ = {
      id: f,
      url: I,
      label: E.label,
      owner: E.owner,
      repo: E.repo,
      ref: E.ref,
      skillsPath: E.skillsPath,
      enabled: !0,
      platform: E.platform,
      accessToken: W.trim() || void 0
    }, K = [...l, $];
    Et(K), a(K), G(""), x(""), v.success(`已添加源: ${E.label}`);
  }, _ = (I, E) => {
    const f = l.map(
      ($) => $.id === I ? { ...$, enabled: E } : $
    );
    Et(f), a(f);
  }, X = (I, E) => {
    const f = l.map(
      ($) => $.id === I ? { ...$, accessToken: E.trim() || void 0 } : $
    );
    Et(f), a(f);
  }, F = (I) => {
    const E = l.filter((f) => f.id !== I);
    Et(E), a(E), v.success("已移除源");
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
          onPressEnter: k,
          prefix: L ? n.createElement(L) : void 0,
          style: { flex: 1 }
        }),
        n.createElement(
          d,
          {
            type: "primary",
            icon: y ? n.createElement(y) : void 0,
            onClick: k
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
          value: W,
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
              h,
              { title: I.enabled ? "点击禁用" : "点击启用" },
              n.createElement(w, {
                size: "small",
                checked: I.enabled,
                onChange: (E) => _(I.id, E)
              })
            ),
            n.createElement(
              h,
              { title: "移除此源" },
              n.createElement(
                d,
                {
                  size: "small",
                  type: "text",
                  danger: !0,
                  icon: O ? n.createElement(O) : void 0,
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
              g,
              { color: I.platform === "gitee" ? "orange" : I.platform === "oss" ? "green" : "blue", style: { fontSize: 11 } },
              I.platform === "gitee" ? "Gitee" : I.platform === "oss" ? "OSS" : "GitHub"
            ),
            n.createElement(
              g,
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
              onChange: (E) => X(I.id, E.target.value),
              style: { flex: 1 }
            })
          ) : null
        )
      )
    })
  );
}
function Pn({
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
    List: g,
    Tag: w,
    Switch: b,
    Typography: h,
    Tooltip: v,
    message: y
  } = z().antd, {
    PlusOutlined: O,
    DeleteOutlined: L,
    LinkOutlined: U,
    ApiOutlined: N,
    UserOutlined: te,
    ImportOutlined: G,
    ExportOutlined: W,
    CopyOutlined: x
  } = z().antdIcons || {}, { Text: k } = h, [_, X] = r(""), [F, I] = r(""), [E, f] = r(""), [$, K] = r(!1), Q = n === "mcp" ? "MCP" : "专家模板", le = n === "mcp" ? N ? s.createElement(N, { style: { fontSize: 18 } }) : null : te ? s.createElement(te, { style: { fontSize: 18 } }) : null, M = () => {
    const R = _.trim(), V = F.trim();
    if (!R) return;
    const se = V || R.slice(0, 40), C = `${n}:${R}`;
    if (l.some((S) => S.id === C)) {
      y.warning("该源已存在");
      return;
    }
    const J = {
      id: C,
      label: se,
      url: R,
      enabled: !0,
      type: n
    }, re = [...l, J];
    n === "mcp" ? ft(re) : yt(re), a(re), X(""), I(""), y.success(`已添加${Q}源: ${se}`);
  }, p = (R, V) => {
    const se = l.map(
      (C) => C.id === R ? { ...C, enabled: V } : C
    );
    n === "mcp" ? ft(se) : yt(se), a(se);
  }, u = (R) => {
    const V = l.filter((se) => se.id !== R);
    n === "mcp" ? ft(V) : yt(V), a(V), y.success("已移除源");
  }, A = () => {
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
      const C = se.filter(
        (Z) => Z && typeof Z.url == "string" && typeof Z.label == "string"
      );
      if (C.length === 0) {
        y.error("未找到有效的源数据");
        return;
      }
      const J = new Set(l.map((Z) => Z.id)), re = [];
      for (const Z of C) {
        const m = Z.id || `${n}:${Z.url}`;
        J.has(m) || re.push({
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
      const S = [...l, ...re];
      n === "mcp" ? ft(S) : yt(S), a(S), f(""), K(!1), y.success(`成功导入 ${re.length} 个${Q}源`);
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
              icon: W ? s.createElement(W) : void 0,
              onClick: A,
              disabled: l.length === 0,
              size: "small"
            },
            "导出到剪贴板"
          ),
          s.createElement(
            c,
            {
              icon: G ? s.createElement(G) : void 0,
              onClick: () => K(!$),
              size: "small"
            },
            $ ? "隐藏导入" : "导入JSON"
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
      k,
      { type: "secondary", style: { fontSize: 12, display: "block", marginBottom: 12 } },
      `配置${Q}源地址，支持从远程仓库或团队共享的 JSON 导入${Q}配置。`
    ),
    // Import section (collapsible)
    $ ? s.createElement(
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
        k,
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
        onChange: (R) => f(R.target.value),
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
            onClick: () => f("")
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
        onChange: (R) => X(R.target.value),
        onPressEnter: M,
        prefix: U ? s.createElement(U) : void 0,
        style: { flex: 1 }
      }),
      s.createElement(
        c,
        {
          type: "primary",
          icon: O ? s.createElement(O) : void 0,
          onClick: M
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
        k,
        { strong: !0 },
        `已配置源 (${l.length})`
      )
    ),
    s.createElement(g, {
      size: "small",
      bordered: !0,
      dataSource: l,
      renderItem: (R) => s.createElement(
        g.Item,
        {
          actions: [
            s.createElement(
              v,
              { title: R.enabled ? "点击禁用" : "点击启用" },
              s.createElement(b, {
                size: "small",
                checked: R.enabled,
                onChange: (V) => p(R.id, V)
              })
            ),
            s.createElement(
              v,
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
              w,
              {
                color: n === "mcp" ? "purple" : "blue",
                style: { fontSize: 11 }
              },
              R.label
            ),
            R.enabled ? null : s.createElement(
              w,
              { style: { fontSize: 10 } },
              "已禁用"
            )
          ),
          s.createElement(
            k,
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
async function xs() {
  return ce("/market/providers");
}
async function ks(e) {
  return ce(
    `/market/categories?lang=${encodeURIComponent(e)}`
  );
}
async function _s(e, t, l, a, n) {
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
function $n(e) {
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
async function Mn(e, t) {
  const l = { bundle_url: e };
  return t && (l.access_token = t), ce("/skills/pool/import", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(l)
  });
}
function Ts() {
  const e = z().React, { useState: t, useEffect: l, useCallback: a, useMemo: n, useRef: s } = e, {
    Spin: r,
    Empty: o,
    Input: d,
    Button: c,
    message: g,
    Row: w,
    Col: b,
    Card: h,
    Tag: v,
    Tooltip: y,
    Typography: O,
    Select: L,
    Drawer: U,
    Descriptions: N,
    Tabs: te,
    Badge: G,
    Progress: W,
    Modal: x,
    Alert: k
  } = z().antd, {
    ReloadOutlined: _,
    SearchOutlined: X,
    DownloadOutlined: F,
    AppstoreOutlined: I,
    ShopOutlined: E,
    CheckCircleOutlined: f,
    LoadingOutlined: $,
    UserOutlined: K,
    SettingOutlined: Q,
    GithubOutlined: le,
    ApiOutlined: M
  } = z().antdIcons || {}, { Text: p, Paragraph: u, Title: A } = O, [ne, R] = t("skills"), [V, se] = t([]), [C, J] = t([]), [re, S] = t([]), [Z, m] = t(""), [Y, j] = t(""), [oe, de] = t(!1), [Ee, ye] = t(!1), [pe, ae] = t(
    {}
  ), [D, T] = t(null), [q, ie] = t({}), [H, ue] = t([]), [ve, we] = t(""), [xe, ze] = t(""), [Ae, He] = t(""), [tt, nt] = t({}), [$e, at] = t(""), [dt, We] = t(/* @__PURE__ */ new Set()), [_e, Ie] = t(null), [ke, ee] = t({}), [Ce, Se] = t([]), [Te, Je] = t([]), [lt, he] = t([]), [zt, ut] = t(""), [st, Pe] = t(!1), [ga, Vt] = t(!1), [fa, Yt] = t([]), [ya, Qt] = t(!1), [Ea, Zt] = t([]), [ha, en] = t(!1), [tn, nn] = t([]), [an, ln] = t([]), [sn, on] = t(!1), [Xe, rn] = t(""), [cn, mn] = t([]), [dn, un] = t([]), [pn, gn] = t(!1), [Ke, fn] = t(""), [It, yn] = t(!1), [ot, va] = t([]), rt = s(null);
  l(() => {
    Promise.all([
      xs().catch(() => []),
      ks("zh").catch(() => []),
      Dt().catch(() => [])
    ]).then(([i, P, B]) => {
      se(i), J(P), ue(B), B.length > 0 && (we(B[0].id), at(B[0].id));
    });
  }, []);
  const pt = a(async (i) => {
    const P = i ?? fs();
    if (Se(i || P), P.filter((me) => me.enabled).length === 0) {
      Je([]);
      return;
    }
    Pe(!0);
    try {
      const { skills: me, errors: ge, categories: be } = await ws(P);
      if (Je(me), va(be), ge.length > 0) {
        for (const fe of ge)
          console.warn(`[ugsci] GitHub source '${fe.label}' error: ${fe.message}`);
        g.warning(
          `部分源加载失败: ${ge.map((fe) => fe.label).join(", ")}`
        );
      }
    } catch (me) {
      g.error(me.message || "加载技能源失败"), Je([]);
    } finally {
      Pe(!1);
    }
  }, []), Ot = a(async () => {
    var me, ge, be;
    on(!0), gn(!0), Pe(!0);
    const [i, P, B] = await Promise.allSettled([
      vs(),
      Ss(),
      bs()
    ]);
    if (i.status === "fulfilled" ? (nn(i.value.servers), ln(i.value.categories)) : (console.warn(`[ugsci] MCP manifest error: ${((me = i.reason) == null ? void 0 : me.message) || i.reason}`), nn([]), ln([])), on(!1), P.status === "fulfilled" ? (mn(P.value.agents), un(P.value.categories)) : (console.warn(`[ugsci] Agents manifest error: ${((ge = P.reason) == null ? void 0 : ge.message) || P.reason}`), mn([]), un([])), gn(!1), B.status === "fulfilled")
      he(B.value.skills), ut("");
    else {
      const fe = ((be = B.reason) == null ? void 0 : be.message) || String(B.reason);
      console.warn(`[ugsci] Skills manifest error: ${fe}`), he([]), ut(fe);
    }
    Pe(!1);
  }, []);
  l(() => {
    pt(), Ot(), Yt(us()), Zt(ps());
  }, [pt, Ot]);
  const gt = a(
    async (i, P, B) => {
      de(!0);
      try {
        const me = await _s(
          i,
          B,
          20,
          "zh",
          P || void 0
        );
        B === void 0 || Object.keys(B).length === 0 ? S(me.results) : S((fe) => [...fe, ...me.results]);
        const ge = Object.values(me.by_provider || {}).some(
          (fe) => fe.has_more
        );
        ye(ge);
        const be = {};
        for (const [fe, Be] of Object.entries(me.by_provider || {}))
          be[fe] = (B[fe] || 1) + 1;
        if (ae(be), me.errors.length > 0)
          for (const fe of me.errors)
            console.warn(
              `[ugsci] Market provider '${fe.provider}' error: ${fe.message}`
            );
      } catch (me) {
        g.error(me.message || "搜索市场失败"), S([]);
      } finally {
        de(!1);
      }
    },
    []
  );
  l(() => (rt.current && clearTimeout(rt.current), rt.current = setTimeout(() => {
    gt(Z, Y, {});
  }, 400), () => {
    rt.current && clearTimeout(rt.current);
  }), [Z, Y, gt]);
  const ba = () => {
    gt(Z, Y, pe);
  }, En = async (i) => {
    const P = `${i.source}:${i.slug}`;
    try {
      ie((me) => ({ ...me, [P]: "installing" }));
      const B = await Mn(i.source_url);
      B.installed && g.success(
        `技能「${B.name || i.name}」已安装到技能池，可在技能中心查看`
      ), ie((me) => {
        const ge = { ...me };
        return delete ge[P], ge;
      });
    } catch (B) {
      g.error($n(B) || "安装技能失败"), ie((me) => {
        const ge = { ...me };
        return delete ge[P], ge;
      });
    }
  }, Sa = (i) => {
    window.history.pushState({}, "", i), window.dispatchEvent(new PopStateEvent("popstate"));
  }, wa = async (i) => {
    const P = `github:${i.sourceId}:${i.name}`, B = Ce.find((ge) => ge.id === i.sourceId), me = (B == null ? void 0 : B.accessToken) || void 0;
    try {
      ie((be) => ({ ...be, [P]: "installing" }));
      const ge = await Mn(i.source_url, me);
      ge.installed && g.success(
        `技能「${ge.name || i.name}」已安装到技能池，可在技能中心查看`
      ), ie((be) => {
        const fe = { ...be };
        return delete fe[P], fe;
      });
    } catch (ge) {
      g.error($n(ge) || "安装技能失败"), ie((be) => {
        const fe = { ...be };
        return delete fe[P], fe;
      });
    }
  }, Fe = n(() => {
    const i = [], P = /* @__PURE__ */ new Set();
    for (const B of [...lt, ...Te]) {
      const me = B.source_url || `${B.sourceLabel}:${B.name}`;
      P.has(me) || (P.add(me), i.push(B));
    }
    return i;
  }, [lt, Te]), hn = n(() => {
    const i = [], P = /* @__PURE__ */ new Set();
    if (ot.length > 0)
      for (const B of ot)
        P.has(B.id) || (P.add(B.id), i.push(B));
    for (const B of Fe)
      B.tag && !P.has(B.tag) && (P.add(B.tag), i.push({ id: B.tag, label: B.tag }));
    for (const B of Fe)
      !B.isOfficial && B.sourceLabel && !P.has(B.sourceLabel) && (P.add(B.sourceLabel), i.push({ id: B.sourceLabel, label: B.sourceLabel }));
    return i;
  }, [Fe, ot]), At = n(() => {
    let i = Fe;
    if (Y) {
      const P = ot.find((B) => B.id === Y);
      P && P.tags ? i = i.filter(
        (B) => B.tag && P.tags.includes(B.tag) || B.sourceLabel === Y
      ) : i = i.filter(
        (B) => B.tag === Y || B.sourceLabel === Y
      );
    }
    if (Z.trim()) {
      const P = Z.toLowerCase();
      i = i.filter(
        (B) => {
          var me;
          return B.name.toLowerCase().includes(P) || ((me = B.description) == null ? void 0 : me.toLowerCase().includes(P));
        }
      );
    }
    return i;
  }, [Fe, Z, Y, ot]), vn = V.filter((i) => i.available), qe = n(() => Y ? re.filter((i) => {
    const P = vn.find((B) => B.key === i.source);
    return (P == null ? void 0 : P.label) === Y;
  }) : re, [re, Y, vn]), Ca = e.createElement(
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
        prefix: X ? e.createElement(X) : void 0,
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
          onClick: () => Vt(!0),
          size: "small"
        },
        "配置技能源"
      )
    ),
    // Dynamic category filter tags (from OSS manifest tags + imported sources)
    zt && Fe.length === 0 ? e.createElement(k, {
      type: "warning",
      showIcon: !0,
      message: "UGSci 官方 OSS 技能库加载失败",
      description: "请检查网络或后端 OSS 代理服务，然后点击右上角“刷新”重试。",
      style: { marginBottom: 12 }
    }) : null,
    hn.length > 0 ? e.createElement(
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
        v,
        {
          style: {
            fontSize: 11,
            cursor: "pointer",
            borderRadius: 12
          },
          color: Y === "" ? "blue" : void 0,
          onClick: () => j("")
        },
        "全部"
      ),
      ...hn.map((i) => {
        const P = Te.some(
          (B) => !B.isOfficial && B.sourceLabel === i.id
        );
        return e.createElement(
          v,
          {
            key: i.id,
            style: {
              fontSize: 11,
              cursor: "pointer",
              borderRadius: 12
            },
            color: Y === i.id ? P ? "blue" : "geekblue" : void 0,
            icon: P && le ? e.createElement(le) : void 0,
            onClick: () => j(
              Y === i.id ? "" : i.id
            )
          },
          i.label
        );
      })
    ) : null,
    // GitHub skills section
    st && Fe.length === 0 ? e.createElement(
      "div",
      { style: { textAlign: "center", padding: 40, marginBottom: 16 } },
      e.createElement(r, { size: "large" }, e.createElement("div", { style: { minHeight: 60, display: "flex", alignItems: "center", justifyContent: "center" } }, "正在加载技能..."))
    ) : At.length > 0 ? e.createElement(
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
          `技能市场 (${At.length})`
        )
      ),
      e.createElement(
        w,
        { gutter: [12, 12] },
        ...At.map((i) => {
          const P = `github:${i.sourceId}:${i.name}`, B = q[P];
          return e.createElement(
            b,
            { key: P, xs: 24, sm: 12, md: 8, lg: 6 },
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
                    M ? e.createElement(M, { style: { fontSize: 10 } }) : null,
                    i.sourcePath || i.sourceLabel
                  ) : null,
                  // Show tag as category badge
                  i.tag ? e.createElement(
                    v,
                    { color: "geekblue", style: { fontSize: 10 } },
                    i.tag
                  ) : null,
                  i.version ? e.createElement(
                    v,
                    { style: { fontSize: 10 } },
                    `v${i.version}`
                  ) : null
                ),
                B ? e.createElement(
                  c,
                  {
                    size: "small",
                    disabled: !0,
                    icon: $ ? e.createElement($) : void 0
                  },
                  "安装中"
                ) : e.createElement(
                  c,
                  {
                    type: "primary",
                    size: "small",
                    icon: F ? e.createElement(F) : void 0,
                    onClick: () => wa(i)
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
    qe.length > 0 || oe ? e.createElement(
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
        `技能市场${qe.length > 0 ? ` (${qe.length})` : ""}`
      )
    ) : null,
    // Results grid
    oe && qe.length === 0 ? e.createElement(
      "div",
      { style: { textAlign: "center", padding: 60 } },
      e.createElement(r, { size: "large" })
    ) : qe.length === 0 ? e.createElement(o, {
      description: Z ? `未找到匹配「${Z}」的技能` : "输入关键词搜索技能市场",
      image: o.PRESENTED_IMAGE_SIMPLE
    }) : e.createElement(
      w,
      { gutter: [12, 12] },
      ...qe.map((i) => {
        const P = `${i.source}:${i.slug}`, B = q[P];
        return e.createElement(
          b,
          { key: P, xs: 24, sm: 12, md: 8, lg: 6 },
          e.createElement(
            h,
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
                  v,
                  { color: "geekblue", style: { fontSize: 10 } },
                  i.source
                ),
                i.version ? e.createElement(
                  v,
                  { style: { fontSize: 10 } },
                  `v${i.version}`
                ) : null
              ),
              B ? e.createElement(
                c,
                {
                  size: "small",
                  disabled: !0,
                  icon: $ ? e.createElement($) : void 0
                },
                "安装中"
              ) : e.createElement(
                c,
                {
                  type: "primary",
                  size: "small",
                  icon: F ? e.createElement(F) : void 0,
                  onClick: (me) => {
                    me.stopPropagation(), En(i);
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
        { onClick: ba, loading: oe },
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
              En(D);
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
  ), Pt = n(() => {
    let i = cn;
    if (Ke && (i = i.filter((P) => P.category === Ke)), xe.trim()) {
      const P = xe.toLowerCase();
      i = i.filter(
        (B) => B.name.toLowerCase().includes(P) || B.description.toLowerCase().includes(P) || B.tags.some((me) => me.toLowerCase().includes(P))
      );
    }
    return i;
  }, [cn, xe, Ke]), xa = async (i) => {
    if (!It) {
      yn(!0);
      try {
        let P = i.description;
        if (i.instructions)
          try {
            const ge = i.instructions.replace(/^\/+/, ""), be = await fetch(ct(ge));
            be.ok && (P = await be.text());
          } catch {
          }
        let B = [];
        if (i.skills_manifest)
          try {
            const ge = i.skills_manifest.replace(/^\/+/, ""), be = await fetch(ct(ge));
            if (be.ok) {
              const fe = await be.json();
              Array.isArray(fe) ? B = fe.map((Be) => typeof Be == "string" ? Be : Be.name).filter(Boolean) : fe.skills && (B = fe.skills.map((Be) => typeof Be == "string" ? Be : Be.name).filter(Boolean));
            }
          } catch {
          }
        const me = await ce("/agents", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: i.name,
            description: i.description,
            skill_names: B
          })
        });
        await wt(me.id, "AGENTS.md", P), g.success(`专家「${i.name}」创建成功，已跳转至专家`), Sa("/ugsci-experts");
      } catch (P) {
        g.error(P.message || "创建专家失败");
      } finally {
        yn(!1);
      }
    }
  }, bn = a(async (i) => {
    if (i)
      try {
        const P = await Xt(i);
        We(new Set(P.map((B) => B.key)));
      } catch {
        We(/* @__PURE__ */ new Set());
      }
  }, []);
  l(() => {
    $e && bn($e);
  }, [$e, bn]);
  const ka = async (i) => {
    if (!$e) {
      g.warning("请先选择目标专家");
      return;
    }
    if (ol(i)) {
      const P = Object.entries(i.env), B = {};
      for (const [me] of P)
        B[me] = "";
      ee(B), Ie(i);
      return;
    }
    await Sn(i, i.env || {});
  }, Sn = async (i, P) => {
    nt((B) => ({ ...B, [i.id]: !0 }));
    try {
      const B = i.id;
      await Hn($e, {
        client_key: B,
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
      }), g.success(`MCP「${i.name}」已添加到当前专家`), We((me) => new Set(me).add(B));
    } catch (B) {
      g.error(B.message || `添加 MCP「${i.name}」失败`);
    } finally {
      nt((B) => ({ ...B, [i.id]: !1 }));
    }
  }, _a = async () => {
    if (!_e) return;
    const i = [];
    for (const [B, me] of Object.entries(ke))
      if (!me || !me.trim()) {
        const ge = kn[B];
        i.push((ge == null ? void 0 : ge.label) || B);
      }
    if (i.length > 0) {
      g.warning(`请填写以下配置项: ${i.join(", ")}`);
      return;
    }
    const P = _e;
    Ie(null), ee({}), await Sn(P, { ...ke });
  }, $t = n(() => {
    let i = tn;
    if (Xe && (i = i.filter((P) => P.category === Xe)), Ae.trim()) {
      const P = Ae.toLowerCase();
      i = i.filter(
        (B) => B.name.toLowerCase().includes(P) || B.description.toLowerCase().includes(P) || B.tags.some((me) => me.toLowerCase().includes(P))
      );
    }
    return i.map(ds);
  }, [tn, Ae, Xe]), Ta = e.createElement(
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
        prefix: X ? e.createElement(X) : void 0,
        value: Ae,
        onChange: (i) => He(i.target.value),
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
          value: $e,
          onChange: (i) => at(i),
          style: { minWidth: 180 },
          size: "small",
          options: H.map((i) => ({ value: i.id, label: i.name }))
        })
      ),
      // Configure MCP source button
      e.createElement(
        c,
        {
          icon: M ? e.createElement(M) : void 0,
          onClick: () => Qt(!0),
          size: "small"
        },
        "配置 MCP 源"
      )
    ),
    // Dynamic category tag row (from OSS manifest tag_groups)
    an.length > 0 ? e.createElement(
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
        v,
        {
          style: { fontSize: 11, cursor: "pointer", borderRadius: 12 },
          color: Xe === "" ? "blue" : void 0,
          onClick: () => rn("")
        },
        "全部"
      ),
      ...an.map(
        (i) => e.createElement(
          v,
          {
            key: i.id,
            style: { fontSize: 11, cursor: "pointer", borderRadius: 12 },
            color: Xe === i.id ? "geekblue" : void 0,
            onClick: () => rn(
              Xe === i.id ? "" : i.id
            )
          },
          i.label
        )
      )
    ) : null,
    // MCP server cards (dynamic from OSS)
    sn && $t.length === 0 ? e.createElement(
      "div",
      { style: { textAlign: "center", padding: 40 } },
      e.createElement(r, { size: "large" }, e.createElement("div", { style: { minHeight: 60, display: "flex", alignItems: "center", justifyContent: "center" } }, "正在加载 MCP 服务器..."))
    ) : $t.length === 0 ? e.createElement(o, {
      description: "未找到匹配的 MCP 服务器",
      image: o.PRESENTED_IMAGE_SIMPLE
    }) : e.createElement(
      w,
      { gutter: [12, 12] },
      ...$t.map(
        (i) => e.createElement(
          b,
          { key: i.id, xs: 24, sm: 12, md: 8 },
          e.createElement(
            h,
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
                    v,
                    { color: "blue", style: { fontSize: 10 } },
                    i.category
                  ),
                  e.createElement(
                    v,
                    {
                      color: i.transport === "stdio" ? "purple" : "cyan",
                      style: { fontSize: 10 }
                    },
                    i.transport
                  ),
                  i.env && Object.keys(i.env).length > 0 ? e.createElement(
                    v,
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
              dt.has(i.id) ? e.createElement(
                c,
                { size: "small", disabled: !0 },
                "已安装"
              ) : e.createElement(
                c,
                {
                  type: "primary",
                  size: "small",
                  loading: !!tt[i.id],
                  icon: M ? e.createElement(M) : void 0,
                  onClick: () => ka(i)
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
  ), za = _e ? e.createElement(
    x,
    {
      title: e.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 8 } },
        e.createElement("span", { style: { fontSize: 20, display: "inline-flex", alignItems: "center", justifyContent: "center", width: 24, height: 24 } }, _e.iconUrl ? e.createElement("img", { src: _e.iconUrl, alt: _e.name, style: { width: 22, height: 22, objectFit: "contain" }, onError: (i) => {
          i.target.style.display = "none";
        } }) : _e.emoji),
        e.createElement("span", null, `配置 ${_e.name} 密钥`)
      ),
      open: !!_e,
      onCancel: () => {
        Ie(null), ee({});
      },
      onOk: _a,
      okText: "安装",
      cancelText: "取消",
      width: 520,
      destroyOnClose: !0
    },
    // Description
    e.createElement(
      p,
      { type: "secondary", style: { display: "block", marginBottom: 16, fontSize: 12 } },
      _e.description
    ),
    ...Object.entries(_e.env || {}).map(([i]) => {
      const P = kn[i], B = (P == null ? void 0 : P.isSecret) !== !1;
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
            v,
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
        B ? e.createElement(d.Password, {
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
  ) : null, Ia = e.createElement(
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
        prefix: X ? e.createElement(X) : void 0,
        value: xe,
        onChange: (i) => ze(i.target.value),
        allowClear: !0,
        style: { maxWidth: 400, flex: 1, minWidth: 200 }
      }),
      e.createElement(
        c,
        {
          icon: K ? e.createElement(K) : void 0,
          onClick: () => en(!0),
          size: "small"
        },
        "配置专家源"
      )
    ),
    // Dynamic category tag row (from OSS manifest tag_groups)
    dn.length > 0 ? e.createElement(
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
        v,
        {
          style: { fontSize: 11, cursor: "pointer", borderRadius: 12 },
          color: Ke === "" ? "blue" : void 0,
          onClick: () => fn("")
        },
        "全部"
      ),
      ...dn.map(
        (i) => e.createElement(
          v,
          {
            key: i.id,
            style: { fontSize: 11, cursor: "pointer", borderRadius: 12 },
            color: Ke === i.id ? "geekblue" : void 0,
            onClick: () => fn(
              Ke === i.id ? "" : i.id
            )
          },
          i.label
        )
      )
    ) : null,
    // Agent cards (dynamic from OSS)
    pn && Pt.length === 0 ? e.createElement(
      "div",
      { style: { textAlign: "center", padding: 40 } },
      e.createElement(r, { size: "large" }, e.createElement("div", { style: { minHeight: 60, display: "flex", alignItems: "center", justifyContent: "center" } }, "正在加载专家模板..."))
    ) : Pt.length === 0 ? e.createElement(o, {
      description: "未找到匹配的专家模板",
      image: o.PRESENTED_IMAGE_SIMPLE
    }) : e.createElement(
      w,
      { gutter: [12, 12] },
      ...Pt.map(
        (i) => e.createElement(
          b,
          { key: i.id, xs: 24, sm: 12, md: 8 },
          e.createElement(
            h,
            {
              hoverable: !0,
              size: "small",
              style: { height: "100%", cursor: "pointer" },
              onClick: () => xa(i)
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
              e.createElement(Le, {
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
                    v,
                    { color: "blue", style: { fontSize: 10 } },
                    mt(i.category)
                  ) : null,
                  i.tags.includes("mcp") ? e.createElement(
                    v,
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
                  loading: It,
                  disabled: It,
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
  ), Oa = [
    {
      key: "skills",
      label: e.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        I ? e.createElement(I, { style: { fontSize: 14 } }) : null,
        "技能市场"
      ),
      children: Ca
    },
    {
      key: "mcp",
      label: e.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        M ? e.createElement(M, { style: { fontSize: 14 } }) : null,
        "MCP 市场"
      ),
      children: Ta
    },
    {
      key: "experts",
      label: e.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        K ? e.createElement(K, { style: { fontSize: 14 } }) : null,
        "专家模板"
      ),
      children: Ia
    }
  ];
  return e.createElement(
    "div",
    { style: { padding: 24 } },
    e.createElement(_t, {
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
              gt(Z, Y, {}), pt(), Ot();
            },
            loading: oe || st || sn || pn
          },
          "刷新"
        )
      )
    }),
    e.createElement(te, {
      items: Oa,
      activeKey: ne,
      onChange: (i) => R(i)
    }),
    // Skill source config modal
    e.createElement(Cs, {
      open: ga,
      onClose: () => Vt(!1),
      sources: Ce,
      onChange: (i) => {
        Se(i), pt(i);
      }
    }),
    // MCP source config modal
    e.createElement(Pn, {
      open: ya,
      onClose: () => Qt(!1),
      sources: fa,
      onChange: (i) => Yt(i),
      type: "mcp"
    }),
    // MCP token config modal (for templates requiring secrets)
    za,
    // Expert source config modal
    e.createElement(Pn, {
      open: ha,
      onClose: () => en(!1),
      sources: Ea,
      onChange: (i) => Zt(i),
      type: "expert"
    })
  );
}
function zs() {
  try {
    const t = localStorage.getItem("language") || "";
    if (t) return t.split("-")[0];
  } catch {
  }
  return ((typeof navigator < "u" ? navigator.language : "") || "").split("-")[0] || "en";
}
const Rn = {
  zh: "您好，UGSci 智能助手在线。无论是油气藏分析、数值模拟还是工程决策，描述您的场景，我来交付结果。",
  en: "UGSci AI assistant is online. From reservoir analysis to numerical simulation and engineering decisions — describe your scenario and I'll deliver results.",
  ja: "UGSci AIアシスタントがオンラインです。油層解析、数値シミュレーション、エンジニアリングの意思決定など、シナリオを描写してください。結果をお届けします。",
  ru: "UGSci AI-ассистент онлайн. От анализа пласта до численного моделирования и инженерных решений — опишите свой сценарий, и я предоставлю результат.",
  vi: "Trợ lý AI UGSci đang trực tuyến. Từ phân tích mỏ, mô phỏng số đến ra quyết định kỹ thuật — mô tả kịch bản của bạn, tôi sẽ giao kết quả.",
  id: "Asisten AI UGSci sedang online. Dari analisis reservoir, simulasi numerik hingga keputusan engineering — jelaskan skenario Anda, saya akan memberikan hasilnya."
}, Ln = {
  zh: { label: "能告诉我你都能做点什么吗？", value: "能告诉我你都能做点什么吗" },
  en: { label: "Can you tell me what you can do?", value: "Can you tell me what you can do?" },
  ja: { label: "あなたができることを教えてください", value: "あなたができることを教えてください" },
  ru: { label: "Расскажи, что ты умеешь делать?", value: "Расскажи, что ты умеешь делать?" },
  vi: { label: "Bạn có thể cho tôi biết bạn làm được gì không?", value: "Bạn có thể cho tôi biết bạn làm được gì không?" },
  id: { label: "Bisa cerita apa saja yang bisa Anda lakukan?", value: "Bisa cerita apa saja yang bisa Anda lakukan?" }
};
function Is() {
  const e = z(), t = e.React, { useEffect: l, useRef: a } = t, n = e.useSelectedAgent ? e.useSelectedAgent() : { id: "default" }, s = (n == null ? void 0 : n.id) || "default", r = a(null), o = a(null);
  return l(() => {
    if (r.current === s) return;
    r.current = s, xt();
    const d = zs(), c = Rn[d] || Rn.en, g = Ln[d] || Ln.en;
    let w = !1;
    return (async () => {
      var b, h;
      try {
        const v = await kt(s);
        if (w) return;
        const y = Dn(v);
        if (o.current) {
          try {
            o.current();
          } catch {
          }
          o.current = null;
        }
        const O = window.QwenPaw;
        (b = O == null ? void 0 : O.chat) != null && b.welcome && (y.length > 0 ? (o.current = O.chat.welcome.set("ugsci", {
          description: c,
          prompts: y
        }), console.info(
          `[ugsci] Injected ${y.length} welcome prompts for agent "${s}"`
        )) : (o.current = O.chat.welcome.set("ugsci", {
          description: c,
          prompts: [g]
        }), console.info(
          `[ugsci] No skills for agent "${s}" — using default prompt`
        )));
      } catch (v) {
        console.warn(
          `[ugsci] Failed to inject welcome prompts for agent "${s}":`,
          v
        );
        const y = window.QwenPaw;
        if ((h = y == null ? void 0 : y.chat) != null && h.welcome && !w) {
          if (o.current) {
            try {
              o.current();
            } catch {
            }
            o.current = null;
          }
          o.current = y.chat.welcome.set("ugsci", {
            description: c,
            prompts: [g]
          });
        }
      }
    })(), () => {
      w = !0;
    };
  }, [s]), null;
}
function Os() {
  var c, g, w;
  const e = window.QwenPaw;
  if (!(e != null && e.menu) || !(e != null && e.route)) {
    console.warn(
      "[ugsci] QwenPaw.menu/route API not available — plugin disabled"
    );
    return;
  }
  const t = z().React, l = "ugsci";
  (g = (c = e.chat) == null ? void 0 : c.rightHeader) != null && g.add ? (e.chat.rightHeader.add(l, t.createElement(Is), {
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
    component: Ul
  }), e.menu.add(l, {
    id: "ugsci.experts",
    location: "primary.agentScoped",
    label: () => "专家",
    icon: n ? t.createElement(n, { style: { fontSize: 16 } }) : void 0,
    route: "ugsci.experts",
    order: 5,
    visible: () => Ve()
  }), e.route.add(l, {
    id: "ugsci.capabilities",
    path: "/ugsci-capabilities",
    component: os
  }), e.menu.add(l, {
    id: "ugsci.capabilities",
    location: "primary.agentScoped",
    label: () => "工具",
    icon: s ? t.createElement(s, { style: { fontSize: 16 } }) : void 0,
    route: "ugsci.capabilities",
    order: 6,
    visible: () => Ve()
  }), e.route.add(l, {
    id: "ugsci.skills-center",
    path: "/ugsci-skills",
    component: cs
  }), e.menu.add(l, {
    id: "ugsci.skills-center",
    location: "primary.agentScoped",
    label: () => "技能",
    icon: r ? t.createElement(r, { style: { fontSize: 16 } }) : void 0,
    route: "ugsci.skills-center",
    order: 7,
    visible: () => Ve()
  }), e.route.add(l, {
    id: "ugsci.market",
    path: "/ugsci-market",
    component: Ts
  }), e.menu.add(l, {
    id: "ugsci.market",
    location: "primary.agentScoped",
    label: () => "市场",
    icon: o ? t.createElement(o, { style: { fontSize: 16 } }) : void 0,
    route: "ugsci.market",
    order: 8,
    visible: () => Ve()
  }), (w = e.sidebar) != null && w.registerSimpleModeItems ? (e.sidebar.registerSimpleModeItems([
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
  for (const b of d) {
    try {
      const v = e.menu.snapshot("primary.agentScoped").find((y) => y.id === b);
      v && e.menu.replace(l, b, {
        ...v,
        visible: () => !Ve()
      });
    } catch {
    }
    try {
      const v = e.menu.snapshot("primary.settings").find((y) => y.id === b);
      v && e.menu.replace(l, b, {
        ...v,
        visible: () => !Ve()
      });
    } catch {
    }
  }
  console.info(
    "[ugsci] Plugin registered: 4 routes + menu items, simple-mode whitelist + simplified navigation active"
  );
}
function Bt() {
  try {
    Os();
  } catch (e) {
    console.error("[ugsci] Failed to build plugin:", e), setTimeout(Bt, 500);
  }
}
var jn;
if ((jn = window.QwenPaw) != null && jn.host)
  Bt();
else {
  const e = setInterval(() => {
    var t;
    (t = window.QwenPaw) != null && t.host && (clearInterval(e), Bt());
  }, 200);
  setTimeout(() => clearInterval(e), 1e4);
}
