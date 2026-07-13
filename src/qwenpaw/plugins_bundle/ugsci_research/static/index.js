function f() {
  return window.QwenPaw.host;
}
async function Q(e) {
  var s, a;
  const t = window.QwenPaw, n = ((s = t == null ? void 0 : t.host) == null ? void 0 : s.fetch) || window.fetch.bind(window), l = ((a = t == null ? void 0 : t.host) == null ? void 0 : a.apiBaseUrl) || "";
  try {
    const r = await n(`${l}/api/agents/${e}`);
    return r.ok ? await r.json() : null;
  } catch {
    return null;
  }
}
async function ce(e, t) {
  var r, o, m, i;
  const n = window.QwenPaw, l = ((r = n == null ? void 0 : n.host) == null ? void 0 : r.fetch) || window.fetch.bind(window), s = ((o = n == null ? void 0 : n.host) == null ? void 0 : o.apiBaseUrl) || "", a = ((i = (m = n == null ? void 0 : n.host) == null ? void 0 : m.getApiToken) == null ? void 0 : i.call(m)) || "";
  try {
    const d = await Q(e);
    if (!d) return !1;
    const g = { ...d, ...t };
    return (await l(`${s}/api/agents/${e}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...a ? { Authorization: `Bearer ${a}` } : {}
      },
      body: JSON.stringify(g)
    })).ok;
  } catch {
    return !1;
  }
}
async function P(e) {
  const t = await Q(e), n = t == null ? void 0 : t.research_mode;
  return n && typeof n == "object" ? {
    enabled: !!n.enabled,
    domain: n.domain || "general"
  } : { enabled: !1, domain: "general" };
}
async function V(e, t, n) {
  const l = await P(e), s = {
    enabled: t,
    domain: n || l.domain || "general"
  };
  return ce(e, { research_mode: s });
}
function ie() {
  var u, h;
  const e = f().React, { useState: t, useEffect: n, useCallback: l } = e, { Switch: s, Select: a, Tag: r, Space: o, Tooltip: m, message: i } = f().antd, { ExperimentOutlined: d } = f().antdIcons, g = window.QwenPaw, c = ((h = (u = g == null ? void 0 : g.host) == null ? void 0 : u.getSelectedAgentId) == null ? void 0 : h.call(u)) || "default", [y, w] = t(!1), [v, S] = t("general"), [C, T] = t(!1), A = l(async () => {
    const p = await P(c);
    w(p.enabled), S(p.domain);
  }, [c]);
  n(() => {
    A();
  }, [A]);
  const k = async (p) => {
    T(!0), await V(c, p) ? (w(p), i.success(
      p ? "🔬 Research Mode enabled" : "Research Mode disabled"
    )) : i.error("Failed to toggle Research Mode"), T(!1);
  }, R = async (p) => {
    T(!0), await V(c, y, p) && S(p), T(!1);
  };
  return e.createElement(
    o,
    { size: 4, align: "center" },
    e.createElement(
      m,
      { title: "Toggle Research Mode (parallel to Coding Mode)" },
      e.createElement(s, {
        checked: y,
        onChange: k,
        loading: C,
        checkedChildren: e.createElement(d),
        unCheckedChildren: e.createElement(d)
      })
    ),
    y && e.createElement(a, {
      size: "small",
      value: v,
      onChange: R,
      loading: C,
      style: { width: 110 },
      options: [
        { value: "general", label: "🔬 General" },
        { value: "physics", label: "⚛️ Physics" },
        { value: "biology", label: "🧬 Biology" },
        { value: "ml", label: "🤖 ML" }
      ]
    }),
    y && e.createElement(
      r,
      { color: "cyan", style: { margin: 0, fontSize: 11 } },
      "Research"
    )
  );
}
function de() {
  var M, F;
  const e = f().React, { useState: t, useEffect: n, useCallback: l } = e, {
    Card: s,
    Tabs: a,
    Empty: r,
    Image: o,
    Table: m,
    Typography: i,
    Button: d,
    Space: g,
    Tag: c,
    Tooltip: y
  } = f().antd, {
    PictureOutlined: w,
    TableOutlined: v,
    CodeOutlined: S,
    FileTextOutlined: C,
    ReloadOutlined: T,
    DownloadOutlined: A
  } = f().antdIcons, k = f().ReactMarkdown, R = f().remarkGfm, u = window.QwenPaw;
  (F = (M = u == null ? void 0 : u.host) == null ? void 0 : M.getCurrentSessionId) == null || F.call(M);
  const [h, p] = t([]), [L, W] = t(!1), [$, ee] = t("all"), N = l(async () => {
    var E, b, z, O, H;
    W(!0);
    try {
      const le = ((E = u == null ? void 0 : u.host) == null ? void 0 : E.fetch) || window.fetch.bind(window), re = ((b = u == null ? void 0 : u.host) == null ? void 0 : b.apiBaseUrl) || "", se = ((O = (z = u == null ? void 0 : u.host) == null ? void 0 : z.getSelectedAgentId) == null ? void 0 : O.call(z)) || "default", J = await le(
        `${re}/api/files/list?path=.&agent_id=${se}`
      );
      if (!J.ok) {
        p([]);
        return;
      }
      const q = await J.json(), oe = q.files || q.entries || [], G = [];
      for (const I of oe) {
        const x = I.name || I.filename || "", _ = ((H = x.split(".").pop()) == null ? void 0 : H.toLowerCase()) || "";
        if (!(/^(fig|figure|plot|chart|table|artifact)/i.test(x) || ["png", "jpg", "jpeg", "svg", "csv", "json"].includes(_))) continue;
        let D = "text";
        ["png", "jpg", "jpeg", "svg", "gif"].includes(_) ? D = "figure" : ["csv", "tsv"].includes(_) ? D = "table" : ["py", "js", "ts", "sh"].includes(_) ? D = "code" : _ === "las" && (D = "las"), G.push({
          id: x,
          type: D,
          title: x,
          content: I.url || I.path || x,
          filePath: I.path || x,
          createdAt: I.modified || Date.now()
        });
      }
      p(G);
    } catch {
      p([]);
    } finally {
      W(!1);
    }
  }, [u]);
  n(() => {
    N();
  }, [N]);
  const te = h.filter((E) => $ === "all" ? !0 : E.type === $), ne = (E) => {
    var z, O;
    const b = ((O = (z = window.QwenPaw) == null ? void 0 : z.host) == null ? void 0 : O.apiBaseUrl) || "";
    switch (E.type) {
      case "figure":
        return e.createElement(o, {
          src: `${b}/api/files/read?path=${encodeURIComponent(
            E.filePath || ""
          )}`,
          alt: E.title,
          style: { maxWidth: "100%", borderRadius: 8 }
        });
      case "table":
        return e.createElement(
          "div",
          { style: { overflowX: "auto" } },
          e.createElement(i.Text, {
            code: !0,
            children: E.filePath
          }),
          e.createElement(
            "p",
            { style: { color: "#999", fontSize: 12 } },
            "CSV file — use data_analysis tool for detailed analysis"
          )
        );
      case "code":
        return e.createElement(
          "pre",
          {
            style: {
              background: "rgba(0,0,0,0.04)",
              padding: 12,
              borderRadius: 8,
              overflow: "auto",
              fontSize: 12
            }
          },
          E.content
        );
      case "las":
        return e.createElement(
          "div",
          null,
          e.createElement(c, { color: "orange" }, "LAS Well Log"),
          e.createElement(
            "p",
            { style: { fontSize: 12, color: "#999" } },
            "Use data_analysis tool with operation='las_curves' for details"
          ),
          e.createElement(
            "pre",
            {
              style: {
                background: "rgba(0,0,0,0.04)",
                padding: 12,
                borderRadius: 8,
                overflow: "auto",
                fontSize: 11,
                maxHeight: 300
              }
            },
            E.content
          )
        );
      default:
        return e.createElement(
          "div",
          { style: { fontSize: 13 } },
          k ? e.createElement(k, {
            remarkPlugins: R ? [R] : [],
            children: E.content
          }) : E.content
        );
    }
  }, ae = [
    { key: "all", label: "All", icon: e.createElement(C) },
    {
      key: "figure",
      label: "Figures",
      icon: e.createElement(w)
    },
    { key: "table", label: "Tables", icon: e.createElement(v) },
    { key: "code", label: "Code", icon: e.createElement(S) },
    {
      key: "las",
      label: "Well Logs",
      icon: e.createElement(v)
    }
  ];
  return e.createElement(
    s,
    {
      size: "small",
      title: e.createElement(
        g,
        null,
        e.createElement(w),
        "Artifacts",
        e.createElement(
          c,
          { color: "blue", style: { fontSize: 10 } },
          String(h.length)
        )
      ),
      extra: e.createElement(
        g,
        null,
        e.createElement(
          y,
          { title: "Refresh" },
          e.createElement(d, {
            size: "small",
            type: "text",
            icon: e.createElement(T),
            onClick: N,
            loading: L
          })
        )
      ),
      style: { height: "100%", overflow: "auto" }
    },
    h.length === 0 ? e.createElement(r, {
      description: "No artifacts yet. Run research tasks to generate figures and data.",
      image: r.PRESENTED_IMAGE_SIMPLE
    }) : e.createElement(a, {
      activeKey: $,
      onChange: ee,
      size: "small",
      items: ae.map((E) => ({
        key: E.key,
        label: e.createElement(g, { size: 4 }, E.icon, E.label),
        children: e.createElement(
          "div",
          { style: { display: "grid", gap: 12 } },
          te.map(
            (b) => e.createElement(
              s,
              {
                key: b.id,
                size: "small",
                title: b.title,
                extra: e.createElement(
                  c,
                  { color: b.type === "figure" ? "green" : "blue" },
                  b.type
                )
              },
              ne(b)
            )
          )
        )
      }))
    })
  );
}
function me() {
  var R, u;
  const e = f().React, { Card: t, Row: n, Col: l, Statistic: s, Typography: a, Divider: r, List: o, Tag: m, Space: i } = f().antd, { ExperimentOutlined: d, BookOutlined: g, BarChartOutlined: c, BulbOutlined: y } = f().antdIcons, w = window.QwenPaw, v = ((u = (R = w == null ? void 0 : w.host) == null ? void 0 : R.getSelectedAgentId) == null ? void 0 : u.call(R)) || "default", [S, C] = e.useState({
    enabled: !1,
    domain: "general"
  });
  e.useEffect(() => {
    P(v).then(C);
  }, [v]);
  const T = [
    { name: "SCOPE", desc: "Define research question", icon: "🎯" },
    { name: "LITERATURE", desc: "Search & review papers", icon: "📚" },
    { name: "REASON", desc: "Deliberate on findings", icon: "💡" },
    { name: "METHODOLOGY", desc: "Design the approach", icon: "📋" },
    { name: "COMPUTE", desc: "Execute computations", icon: "⚙️" },
    { name: "ANALYZE", desc: "Process results", icon: "📊" },
    { name: "SYNTHESIZE", desc: "Interpret findings", icon: "🔗" },
    { name: "WRITE", desc: "Produce deliverable", icon: "✍️" }
  ], A = [
    {
      name: "literature_search",
      desc: "Search OpenAlex, arXiv, Crossref",
      icon: "📚"
    },
    { name: "web_search", desc: "Web search for scientific info", icon: "🔍" },
    { name: "data_analysis", desc: "Analyze CSV, JSON, LAS files", icon: "📊" }
  ], k = [
    { name: "literature-review", desc: "PRISMA systematic review", icon: "📚" },
    {
      name: "scientific-visualization",
      desc: "Publication-quality figures",
      icon: "📈"
    },
    {
      name: "hypothesis-generation",
      desc: "Structured hypothesis design",
      icon: "💡"
    }
  ];
  return e.createElement(
    "div",
    { style: { padding: 24 } },
    e.createElement(
      t,
      null,
      e.createElement(
        i,
        { align: "center", size: 12 },
        e.createElement(d, {
          style: { fontSize: 28, color: "#06b6d4" }
        }),
        e.createElement(
          "div",
          null,
          e.createElement(
            a.Title,
            { level: 4, style: { margin: 0 } },
            "Research Mode Dashboard"
          ),
          e.createElement(
            a.Text,
            { type: "secondary" },
            `Agent: ${v} · Domain: ${S.domain}`
          )
        ),
        S.enabled ? e.createElement(m, { color: "green" }, "ACTIVE") : e.createElement(m, { color: "default" }, "INACTIVE")
      )
    ),
    e.createElement(r, null),
    e.createElement(
      n,
      { gutter: [16, 16] },
      e.createElement(
        l,
        { span: 8 },
        e.createElement(t, {
          size: "small",
          children: e.createElement(s, {
            title: "Research Mode",
            value: S.enabled ? "Enabled" : "Disabled",
            prefix: e.createElement(d)
          })
        })
      ),
      e.createElement(
        l,
        { span: 8 },
        e.createElement(t, {
          size: "small",
          children: e.createElement(s, {
            title: "Domain",
            value: S.domain,
            prefix: e.createElement(g)
          })
        })
      ),
      e.createElement(
        l,
        { span: 8 },
        e.createElement(t, {
          size: "small",
          children: e.createElement(s, {
            title: "Workflow Stages",
            value: 8,
            prefix: e.createElement(c)
          })
        })
      )
    ),
    e.createElement(r, null),
    e.createElement(
      t,
      {
        size: "small",
        title: e.createElement(i, null, "🔬 Research Workflow Stages")
      },
      e.createElement(o, {
        grid: { gutter: 16, column: 4 },
        dataSource: T,
        renderItem: (h) => e.createElement(
          o.Item,
          null,
          e.createElement(
            t,
            {
              size: "small",
              style: { textAlign: "center", height: "100%" }
            },
            e.createElement(
              "div",
              { style: { fontSize: 24 } },
              h.icon
            ),
            e.createElement(
              "div",
              { style: { fontWeight: 600, fontSize: 12, marginTop: 4 } },
              h.name
            ),
            e.createElement(
              "div",
              { style: { fontSize: 11, color: "#999" } },
              h.desc
            )
          )
        )
      })
    ),
    e.createElement(r, null),
    e.createElement(
      n,
      { gutter: [16, 16] },
      e.createElement(
        l,
        { span: 12 },
        e.createElement(
          t,
          {
            size: "small",
            title: e.createElement(i, null, "🛠️ Research Tools")
          },
          e.createElement(o, {
            size: "small",
            dataSource: A,
            renderItem: (h) => e.createElement(
              o.Item,
              null,
              e.createElement(
                i,
                null,
                e.createElement("span", null, h.icon),
                e.createElement(
                  "div",
                  null,
                  e.createElement("code", null, h.name),
                  e.createElement("br"),
                  e.createElement(
                    a.Text,
                    { type: "secondary", style: { fontSize: 11 } },
                    h.desc
                  )
                )
              )
            )
          })
        )
      ),
      e.createElement(
        l,
        { span: 12 },
        e.createElement(
          t,
          {
            size: "small",
            title: e.createElement(i, null, "⚡ Research Skills")
          },
          e.createElement(o, {
            size: "small",
            dataSource: k,
            renderItem: (h) => e.createElement(
              o.Item,
              null,
              e.createElement(
                i,
                null,
                e.createElement("span", null, h.icon),
                e.createElement(
                  "div",
                  null,
                  e.createElement("strong", null, h.name),
                  e.createElement("br"),
                  e.createElement(
                    a.Text,
                    { type: "secondary", style: { fontSize: 11 } },
                    h.desc
                  )
                )
              )
            )
          })
        )
      )
    )
  );
}
function Y(e) {
  const t = f().React, { ToolCardShell: n, DefaultBlock: l } = j(), { BookOutlined: s, Tag: a } = { ...f().antdIcons, ...f().antd }, r = e.data || e.content || {}, o = r.params || {}, m = o.query || "", i = o.source || "all", d = typeof r.result == "string" ? r.result : JSON.stringify(r.result, null, 2);
  let g = [];
  try {
    g = JSON.parse(d).results || [];
  } catch {
  }
  return t.createElement(n, {
    content: r,
    isStreaming: e.isStreaming,
    icon: t.createElement(s),
    title: `📚 Literature Search: "${m}" (${i})`,
    inlineResult: g.length ? `${g.length} results` : void 0,
    children: t.createElement(
      t.Fragment,
      null,
      g.length > 0 ? t.createElement(
        "div",
        { style: { maxHeight: 400, overflow: "auto" } },
        g.slice(0, 10).map(
          (c, y) => t.createElement(
            "div",
            {
              key: y,
              style: {
                padding: "8px 0",
                borderBottom: y < 9 ? "1px solid #f0f0f0" : "none"
              }
            },
            t.createElement(
              "strong",
              { style: { fontSize: 13 } },
              c.title || "Untitled"
            ),
            c.year && t.createElement(
              "span",
              { style: { color: "#999", marginLeft: 8 } },
              `(${c.year})`
            ),
            c.authors && t.createElement(
              "div",
              { style: { fontSize: 11, color: "#666" } },
              Array.isArray(c.authors) ? c.authors.join(", ") : c.authors
            ),
            c.doi && t.createElement(
              "code",
              { style: { fontSize: 10 } },
              c.doi
            ),
            c.abstract && t.createElement(
              "div",
              { style: { fontSize: 11, color: "#999", marginTop: 4 } },
              c.abstract.substring(0, 200) + "..."
            ),
            t.createElement(
              a,
              { style: { fontSize: 10, marginTop: 4 } },
              c.source || "unknown"
            )
          )
        )
      ) : t.createElement(l, {
        title: "Output",
        content: d
      })
    )
  });
}
function X(e) {
  const t = f().React, { ToolCardShell: n, DefaultBlock: l } = j(), { SearchOutlined: s } = f().antdIcons, a = e.data || e.content || {}, o = (a.params || {}).query || "", m = typeof a.result == "string" ? a.result : JSON.stringify(a.result, null, 2);
  return t.createElement(n, {
    content: a,
    isStreaming: e.isStreaming,
    icon: t.createElement(s),
    title: `🔍 Web Search: "${o}"`,
    children: t.createElement(l, {
      title: "Output",
      content: m
    })
  });
}
function Z(e) {
  const t = f().React, { ToolCardShell: n, DefaultBlock: l } = j(), { BarChartOutlined: s } = f().antdIcons, a = e.data || e.content || {}, r = a.params || {}, o = r.data_path || "", m = r.operation || "summary", i = typeof a.result == "string" ? a.result : JSON.stringify(a.result, null, 2), d = o.split("/").pop() || o;
  return t.createElement(n, {
    content: a,
    isStreaming: e.isStreaming,
    icon: t.createElement(s),
    title: `📊 Data Analysis: ${d} (${m})`,
    children: t.createElement(l, {
      title: "Output",
      content: i
    })
  });
}
let B = null;
function j() {
  if (B) return B;
  const e = f().React, t = ({
    title: l,
    content: s
  }) => e.createElement(
    "div",
    { style: { margin: "4px 0 2px 18px" } },
    e.createElement(
      "div",
      { style: { fontSize: 11, color: "#999", marginBottom: 2 } },
      l
    ),
    e.createElement(
      "pre",
      {
        style: {
          fontSize: 12,
          lineHeight: 1.5,
          padding: "8px 12px",
          background: "rgba(0,0,0,0.03)",
          borderRadius: 8,
          overflow: "auto",
          maxHeight: 360
        }
      },
      s
    )
  );
  return B = { ToolCardShell: ({
    content: l,
    isStreaming: s,
    icon: a,
    title: r,
    inlineResult: o,
    children: m
  }) => {
    const i = l.status === "calling" && s, d = l.status === "error";
    return e.createElement(
      "details",
      {
        open: i || d,
        style: {
          margin: "4px 0",
          border: "1px solid rgba(0,0,0,0.06)",
          borderRadius: 8,
          padding: "4px 8px"
        }
      },
      e.createElement(
        "summary",
        {
          style: {
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontSize: 13
          }
        },
        i ? e.createElement("span", {
          className: "ant-spin-dot ant-spin-dot-spin"
        }) : e.createElement("span", null, a),
        e.createElement("span", null, r),
        !i && o && e.createElement(
          "span",
          { style: { fontSize: 11, color: "#999", marginLeft: "auto" } },
          o
        )
      ),
      d ? e.createElement(t, {
        title: "Error",
        content: JSON.stringify(l.result, null, 2)
      }) : m
    );
  }, DefaultBlock: t }, B;
}
function ue() {
  var l, s, a, r, o, m;
  const e = window.QwenPaw;
  if (!(e != null && e.menu) || !(e != null && e.route)) {
    console.warn(
      "[ugsci-research] QwenPaw.menu/route API not available — plugin disabled"
    );
    return;
  }
  const t = f().React, n = "ugsci_research";
  e.route.add(n, {
    id: "ugsci_research.dashboard",
    path: "/ugsci-research-dashboard",
    component: me
  }), e.menu.add(n, {
    id: "ugsci_research.dashboard",
    location: "primary.agentScoped",
    label: () => "研究模式",
    icon: t.createElement("span", { style: { fontSize: 16 } }, "🔬"),
    route: "ugsci_research.dashboard",
    order: 9,
    visible: () => !0
  }), (l = e.sidebar) != null && l.registerSimpleModeItems && (e.sidebar.registerSimpleModeItems(["ugsci_research.dashboard"]), console.info("[ugsci-research] Registered for simple-mode visibility")), e.registerToolRender && (e.registerToolRender(n, {
    literature_search: Y,
    web_search: X,
    data_analysis: Z
  }), console.info("[ugsci-research] Registered 3 custom tool cards")), (s = e.chat) != null && s.toolRender && (e.chat.toolRender(n, "literature_search", Y), e.chat.toolRender(n, "web_search", X), e.chat.toolRender(n, "data_analysis", Z)), (r = (a = e.chat) == null ? void 0 : a.actions) != null && r.add && (e.chat.actions.add(n, {
    id: "research-mode-toggle",
    label: "Research Mode",
    render: () => t.createElement(ie),
    order: 10
  }), console.info(
    "[ugsci-research] Registered chat action: research-mode-toggle"
  )), (m = (o = e.chat) == null ? void 0 : o.response) != null && m.append && (e.chat.response.append(
    n,
    (i) => {
      var d, g;
      return (g = (d = e.host) == null ? void 0 : d.getSelectedAgentId) != null && g.call(d), t.createElement(de);
    },
    { id: "artifact-panel", order: 100 }
  ), console.info("[ugsci-research] Registered artifact panel in response slot")), console.info(
    "[ugsci-research] Plugin registered: dashboard route + tool cards + toggle + artifact panel"
  );
}
function U() {
  try {
    ue();
  } catch (e) {
    console.error("[ugsci-research] Failed to build plugin:", e), setTimeout(U, 500);
  }
}
var K;
if ((K = window.QwenPaw) != null && K.host)
  U();
else {
  const e = setInterval(() => {
    var t;
    (t = window.QwenPaw) != null && t.host && (clearInterval(e), U());
  }, 200);
  setTimeout(() => clearInterval(e), 1e4);
}
