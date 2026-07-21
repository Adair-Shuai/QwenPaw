function f() {
  return window.QwenPaw.host;
}
function re(e) {
  const t = window.QwenPaw, n = t == null ? void 0 : t.host;
  if (n != null && n.getApiUrl)
    return n.getApiUrl(e);
  const l = (n == null ? void 0 : n.apiBaseUrl) || "", a = e.startsWith("/") ? e : `/${e}`;
  return `${l}/api${a}`;
}
function oe(e, t) {
  var o;
  const n = window.QwenPaw, l = n == null ? void 0 : n.host, a = ((o = l == null ? void 0 : l.getApiToken) == null ? void 0 : o.call(l)) || "", r = {
    ...(t == null ? void 0 : t.headers) ?? {}
  };
  return a && !r.Authorization && (r.Authorization = `Bearer ${a}`), window.fetch(e, { ...t, headers: r });
}
async function F(e) {
  try {
    const t = re(`/ugsci-research/research-mode/${encodeURIComponent(e)}`), n = await oe(t);
    if (!n.ok) return { enabled: !1, domain: "general" };
    const l = await n.json();
    return {
      enabled: !!l.enabled,
      domain: l.domain || "general"
    };
  } catch {
    return { enabled: !1, domain: "general" };
  }
}
async function q(e, t, n) {
  try {
    const l = await F(e), a = {
      enabled: t,
      domain: n || l.domain || "general"
    }, r = re(`/ugsci-research/research-mode/${encodeURIComponent(e)}`);
    return (await oe(r, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(a)
    })).ok;
  } catch {
    return !1;
  }
}
function ee() {
  var T, D, U, N;
  const e = f(), t = e.React, { useState: n, useEffect: l, useCallback: a } = t, { Tooltip: r, Select: o, message: i, Popover: p, Button: E, Space: m } = e.antd, { ExperimentOutlined: w, SettingOutlined: s } = e.antdIcons, h = window.QwenPaw, S = ((D = (T = h == null ? void 0 : h.host) == null ? void 0 : T.getSelectedAgentId) == null ? void 0 : D.call(T)) || "default", [u, C] = n(!1), [v, O] = n("general"), [L, I] = n(!1), R = a(async () => {
    const b = await F(S);
    C(b.enabled), O(b.domain);
  }, [S]);
  l(() => {
    R();
  }, [R]);
  const y = async () => {
    I(!0);
    const b = !u;
    await q(S, b) ? (C(b), i.success(b ? "🔬 研究模式已启用" : "研究模式已关闭")) : i.error("切换研究模式失败"), I(!1);
  }, B = async (b) => {
    I(!0), await q(S, u, b) && O(b), I(!1);
  }, z = () => {
    window.location.href = "/ugsci-research-dashboard";
  }, c = {
    display: "inline-flex",
    alignItems: "center",
    gap: "5px",
    padding: "4px 10px",
    borderRadius: "6px",
    border: u ? "1.5px solid #06b6d4" : "1.5px solid rgba(0,0,0,0.12)",
    background: u ? "rgba(6,182,212,0.08)" : "transparent",
    color: u ? "#06b6d4" : "rgba(0,0,0,0.55)",
    fontSize: "13px",
    fontWeight: 500,
    cursor: "pointer",
    transition: "all 0.18s ease"
  }, P = typeof document < "u" && ((N = (U = document.documentElement) == null ? void 0 : U.classList) == null ? void 0 : N.contains("dark-mode"));
  P && (c.border = u ? "1.5px solid #22d3ee" : "1.5px solid rgba(255,255,255,0.15)", c.color = u ? "#22d3ee" : "rgba(255,255,255,0.85)", c.background = u ? "rgba(6,182,212,0.18)" : "transparent");
  const A = {
    display: "inline-flex",
    alignItems: "center",
    padding: "4px 6px",
    borderRadius: "6px",
    border: "1.5px solid rgba(0,0,0,0.12)",
    background: "transparent",
    cursor: "pointer",
    color: "rgba(0,0,0,0.55)"
  };
  P && (A.border = "1.5px solid rgba(255,255,255,0.15)", A.color = "rgba(255,255,255,0.85)");
  const _ = t.createElement(
    "div",
    { style: { display: "flex", flexDirection: "column", gap: 12, padding: 4, minWidth: 160 } },
    t.createElement(
      "div",
      null,
      t.createElement(
        "div",
        { style: { fontSize: 12, color: "#999", marginBottom: 4 } },
        "研究领域"
      ),
      t.createElement(o, {
        size: "small",
        value: v,
        onChange: B,
        loading: L,
        style: { width: "100%" },
        options: [
          { value: "general", label: "🔬 通用" },
          { value: "physics", label: "⚛️ 物理" },
          { value: "biology", label: "🧬 生物" },
          { value: "ml", label: "🤖 ML" }
        ]
      })
    ),
    t.createElement(
      E,
      {
        size: "small",
        type: "link",
        onClick: z,
        style: { padding: 0, textAlign: "left" }
      },
      "研究面板 →"
    )
  );
  return t.createElement(
    "span",
    { style: { display: "inline-flex", alignItems: "center", gap: 4 } },
    t.createElement(
      r,
      {
        title: u ? `研究模式已开启 (${v}) — 点击关闭` : "研究模式 — 点击启用",
        placement: "bottom"
      },
      t.createElement(
        "button",
        {
          type: "button",
          style: c,
          onClick: () => void y(),
          disabled: L,
          "aria-label": "Toggle Research Mode"
        },
        t.createElement("span", { style: { display: "flex", alignItems: "center" } }, "🔬"),
        t.createElement("span", { style: { lineHeight: 1 } }, u ? `研究 ${v}` : "研究")
      )
    ),
    t.createElement(
      p,
      { content: _, placement: "bottomRight", trigger: "click" },
      t.createElement(
        "button",
        { type: "button", style: A, "aria-label": "Research settings" },
        t.createElement(s, { style: { fontSize: 12 } })
      )
    )
  );
}
function de() {
  var b, M;
  const e = f().React, { useState: t, useEffect: n, useCallback: l } = e, {
    Card: a,
    Tabs: r,
    Empty: o,
    Image: i,
    Table: p,
    Typography: E,
    Button: m,
    Space: w,
    Tag: s,
    Tooltip: h
  } = f().antd, {
    PictureOutlined: S,
    TableOutlined: u,
    CodeOutlined: C,
    FileTextOutlined: v,
    ReloadOutlined: O,
    DownloadOutlined: L
  } = f().antdIcons, I = f().ReactMarkdown, R = f().remarkGfm, y = window.QwenPaw;
  (M = (b = y == null ? void 0 : y.host) == null ? void 0 : b.getCurrentSessionId) == null || M.call(b);
  const [B, z] = t([]), [c, P] = t(!1), [A, _] = t("all"), T = l(async () => {
    var g, x, k, $, d;
    P(!0);
    try {
      const Y = ((g = y == null ? void 0 : y.host) == null ? void 0 : g.fetch) || window.fetch.bind(window), se = ((x = y == null ? void 0 : y.host) == null ? void 0 : x.apiBaseUrl) || "", ce = (($ = (k = y == null ? void 0 : y.host) == null ? void 0 : k.getSelectedAgentId) == null ? void 0 : $.call(k)) || "default", Z = await Y(
        `${se}/api/files/list?path=.&agent_id=${ce}`
      );
      if (!Z.ok) {
        z([]);
        return;
      }
      const K = await Z.json(), ie = K.files || K.entries || [], Q = [];
      for (const j of ie) {
        const H = j.name || j.filename || "", W = ((d = H.split(".").pop()) == null ? void 0 : d.toLowerCase()) || "";
        if (!(/^(fig|figure|plot|chart|table|artifact)/i.test(H) || ["png", "jpg", "jpeg", "svg", "csv", "json"].includes(W))) continue;
        let J = "text";
        ["png", "jpg", "jpeg", "svg", "gif"].includes(W) ? J = "figure" : ["csv", "tsv"].includes(W) ? J = "table" : ["py", "js", "ts", "sh"].includes(W) ? J = "code" : W === "las" && (J = "las"), Q.push({
          id: H,
          type: J,
          title: H,
          content: j.url || j.path || H,
          filePath: j.path || H,
          createdAt: j.modified || Date.now()
        });
      }
      z(Q);
    } catch {
      z([]);
    } finally {
      P(!1);
    }
  }, [y]);
  n(() => {
    T();
  }, [T]);
  const D = B.filter((g) => A === "all" ? !0 : g.type === A), U = (g) => {
    var k, $;
    const x = (($ = (k = window.QwenPaw) == null ? void 0 : k.host) == null ? void 0 : $.apiBaseUrl) || "";
    switch (g.type) {
      case "figure":
        return e.createElement(i, {
          src: `${x}/api/files/read?path=${encodeURIComponent(
            g.filePath || ""
          )}`,
          alt: g.title,
          style: { maxWidth: "100%", borderRadius: 8 }
        });
      case "table":
        return e.createElement(
          "div",
          { style: { overflowX: "auto" } },
          e.createElement(E.Text, {
            code: !0,
            children: g.filePath
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
          g.content
        );
      case "las":
        return e.createElement(
          "div",
          null,
          e.createElement(s, { color: "orange" }, "LAS Well Log"),
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
            g.content
          )
        );
      default:
        return e.createElement(
          "div",
          { style: { fontSize: 13 } },
          I ? e.createElement(I, {
            remarkPlugins: R ? [R] : [],
            children: g.content
          }) : g.content
        );
    }
  }, N = [
    { key: "all", label: "All", icon: e.createElement(v) },
    {
      key: "figure",
      label: "Figures",
      icon: e.createElement(S)
    },
    { key: "table", label: "Tables", icon: e.createElement(u) },
    { key: "code", label: "Code", icon: e.createElement(C) },
    {
      key: "las",
      label: "Well Logs",
      icon: e.createElement(u)
    }
  ];
  return e.createElement(
    a,
    {
      size: "small",
      title: e.createElement(
        w,
        null,
        e.createElement(S),
        "Artifacts",
        e.createElement(
          s,
          { color: "blue", style: { fontSize: 10 } },
          String(B.length)
        )
      ),
      extra: e.createElement(
        w,
        null,
        e.createElement(
          h,
          { title: "Refresh" },
          e.createElement(m, {
            size: "small",
            type: "text",
            icon: e.createElement(O),
            onClick: T,
            loading: c
          })
        )
      ),
      style: { height: "100%", overflow: "auto" }
    },
    B.length === 0 ? e.createElement(o, {
      description: "No artifacts yet. Run research tasks to generate figures and data.",
      image: o.PRESENTED_IMAGE_SIMPLE
    }) : e.createElement(r, {
      activeKey: A,
      onChange: _,
      size: "small",
      items: N.map((g) => ({
        key: g.key,
        label: e.createElement(w, { size: 4 }, g.icon, g.label),
        children: e.createElement(
          "div",
          { style: { display: "grid", gap: 12 } },
          D.map(
            (x) => e.createElement(
              a,
              {
                key: x.id,
                size: "small",
                title: x.title,
                extra: e.createElement(
                  s,
                  { color: x.type === "figure" ? "green" : "blue" },
                  x.type
                )
              },
              U(x)
            )
          )
        )
      }))
    })
  );
}
function me() {
  var u, C, v, O;
  const e = f(), t = e.React, { useState: n, useEffect: l } = t, { Button: a, Tooltip: r } = e.antd, { PictureOutlined: o } = e.antdIcons, [i, p] = n(!1), E = window.QwenPaw, m = ((C = (u = E == null ? void 0 : E.host) == null ? void 0 : u.getSelectedAgentId) == null ? void 0 : C.call(u)) || "default", [w, s] = n(!1);
  if (l(() => {
    let L = !0;
    F(m).then((R) => {
      L && s(R.enabled);
    });
    const I = setInterval(() => {
      F(m).then((R) => {
        L && s(R.enabled);
      });
    }, 3e3);
    return () => {
      L = !1, clearInterval(I);
    };
  }, [m]), !w) return null;
  const h = {
    width: i ? 44 : 320,
    flexShrink: 0,
    height: "100%",
    overflow: "hidden",
    borderLeft: "1px solid rgba(0,0,0,0.06)",
    transition: "width 0.2s ease",
    display: "flex",
    flexDirection: "column"
  }, S = typeof document < "u" && ((O = (v = document.documentElement) == null ? void 0 : v.classList) == null ? void 0 : O.contains("dark-mode"));
  return S && (h.borderLeft = "1px solid rgba(255,255,255,0.08)", h.background = "#1e1e1e"), i ? t.createElement(
    "div",
    { style: { ...h, alignItems: "center", paddingTop: 8 } },
    t.createElement(
      r,
      { title: "Expand Artifacts", placement: "left" },
      t.createElement(a, {
        type: "text",
        size: "small",
        icon: t.createElement(o),
        onClick: () => p(!1)
      })
    )
  ) : t.createElement(
    "div",
    { style: h },
    t.createElement(
      "div",
      {
        style: {
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "8px 12px",
          borderBottom: "1px solid rgba(0,0,0,0.06)",
          fontSize: 13,
          fontWeight: 600,
          color: S ? "rgba(255,255,255,0.85)" : "rgba(0,0,0,0.85)"
        }
      },
      t.createElement("span", null, "📗 Artifacts"),
      t.createElement(
        r,
        { title: "Collapse", placement: "left" },
        t.createElement(
          a,
          { type: "text", size: "small", onClick: () => p(!0), style: { fontSize: 12 } },
          "‹"
        )
      )
    ),
    t.createElement(
      "div",
      { style: { flex: 1, overflow: "auto", padding: 8 } },
      t.createElement(de)
    )
  );
}
function ue() {
  var k, $;
  const e = f().React, { useState: t, useEffect: n, useCallback: l } = e, {
    Card: a,
    Row: r,
    Col: o,
    Statistic: i,
    Typography: p,
    Divider: E,
    List: m,
    Tag: w,
    Space: s,
    Button: h,
    Select: S,
    Tooltip: u,
    message: C
  } = f().antd, {
    ExperimentOutlined: v,
    BookOutlined: O,
    BarChartOutlined: L,
    BulbOutlined: I,
    ArrowRightOutlined: R,
    ThunderboltOutlined: y
  } = f().antdIcons, B = window.QwenPaw, z = (($ = (k = B == null ? void 0 : B.host) == null ? void 0 : k.getSelectedAgentId) == null ? void 0 : $.call(k)) || "default", [c, P] = t({
    enabled: !1,
    domain: "general"
  }), [A, _] = t(!1), T = l(async () => {
    const d = await F(z);
    P(d);
  }, [z]);
  n(() => {
    T();
  }, [T]);
  const D = async () => {
    _(!0), await q(z, !c.enabled) ? (P({ ...c, enabled: !c.enabled }), C.success(
      c.enabled ? "研究模式已关闭" : "🔬 研究模式已启用"
    )) : C.error("切换研究模式失败"), _(!1);
  }, U = async (d) => {
    _(!0), await q(z, c.enabled, d) && P({ ...c, domain: d }), _(!1);
  }, N = () => {
    window.location.href = "/chat";
  }, b = () => {
    window.location.href = "/skill-pool";
  }, M = [
    { name: "SCOPE", desc: "定义研究问题", icon: "🎯" },
    { name: "LITERATURE", desc: "检索与综述文献", icon: "📚" },
    { name: "REASON", desc: "推理与思考", icon: "💡" },
    { name: "METHODOLOGY", desc: "设计研究方法", icon: "📋" },
    { name: "COMPUTE", desc: "执行计算", icon: "⚙️" },
    { name: "ANALYZE", desc: "分析结果", icon: "📊" },
    { name: "SYNTHESIZE", desc: "综合解读", icon: "🔗" },
    { name: "WRITE", desc: "撰写成果", icon: "✍️" }
  ], g = [
    {
      name: "literature_search",
      desc: "搜索 OpenAlex、arXiv、Crossref",
      icon: "📚",
      action: "在对话中使用 /research on 后自动可用"
    },
    {
      name: "web_search",
      desc: "网络搜索科学信息",
      icon: "🔍",
      action: "在对话中使用 /research on 后自动可用"
    },
    {
      name: "data_analysis",
      desc: "分析 CSV、JSON、LAS 测井文件",
      icon: "📊",
      action: "在对话中使用 /research on 后自动可用"
    }
  ], x = [
    { name: "literature-review", desc: "PRISMA 系统综述", icon: "📚" },
    { name: "scientific-visualization", desc: "出版级图表绘制", icon: "📈" },
    { name: "hypothesis-generation", desc: "结构化假说设计", icon: "💡" }
  ];
  return e.createElement(
    "div",
    { style: { padding: 24, maxWidth: 1200, margin: "0 auto" } },
    // ── Header Card with Toggle ──
    e.createElement(
      a,
      null,
      e.createElement(
        "div",
        { style: { display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 } },
        e.createElement(
          s,
          { align: "center", size: 12 },
          e.createElement(v, {
            style: { fontSize: 28, color: c.enabled ? "#06b6d4" : "#999" }
          }),
          e.createElement(
            "div",
            null,
            e.createElement(
              p.Title,
              { level: 4, style: { margin: 0 } },
              "研究模式"
            ),
            e.createElement(
              p.Text,
              { type: "secondary" },
              `Agent: ${z}`
            )
          ),
          c.enabled ? e.createElement(w, { color: "green" }, "已启用") : e.createElement(w, { color: "default" }, "未启用")
        ),
        e.createElement(
          s,
          { size: 8 },
          e.createElement(S, {
            size: "small",
            value: c.domain,
            onChange: U,
            loading: A,
            style: { width: 120 },
            options: [
              { value: "general", label: "🔬 通用" },
              { value: "physics", label: "⚛️ 物理" },
              { value: "biology", label: "🧬 生物" },
              { value: "ml", label: "🤖 ML" }
            ]
          }),
          e.createElement(
            h,
            {
              type: c.enabled ? "default" : "primary",
              danger: c.enabled,
              loading: A,
              onClick: D,
              icon: e.createElement(v)
            },
            c.enabled ? "关闭研究模式" : "启用研究模式"
          )
        )
      )
    ),
    e.createElement(E, null),
    // ── Stats Row ──
    e.createElement(
      r,
      { gutter: [16, 16] },
      e.createElement(
        o,
        { span: 8 },
        e.createElement(a, {
          size: "small",
          children: e.createElement(i, {
            title: "研究模式",
            value: c.enabled ? "已启用" : "未启用",
            prefix: e.createElement(v),
            valueStyle: c.enabled ? { color: "#06b6d4" } : { color: "#999" }
          })
        })
      ),
      e.createElement(
        o,
        { span: 8 },
        e.createElement(a, {
          size: "small",
          children: e.createElement(i, {
            title: "研究领域",
            value: c.domain,
            prefix: e.createElement(O)
          })
        })
      ),
      e.createElement(
        o,
        { span: 8 },
        e.createElement(a, {
          size: "small",
          children: e.createElement(i, {
            title: "工作流阶段",
            value: 8,
            prefix: e.createElement(L)
          })
        })
      )
    ),
    e.createElement(E, null),
    // ── Start Research Button ──
    e.createElement(
      "div",
      { style: { textAlign: "center", marginBottom: 24 } },
      e.createElement(
        h,
        {
          type: "primary",
          size: "large",
          icon: e.createElement(y),
          disabled: !c.enabled,
          onClick: N,
          style: c.enabled ? { background: "#06b6d4", borderColor: "#06b6d4" } : {}
        },
        "开始研究对话"
      ),
      !c.enabled && e.createElement(
        "div",
        { style: { marginTop: 8, fontSize: 12, color: "#999" } },
        "请先启用研究模式"
      )
    ),
    // ── Workflow Stages ──
    e.createElement(
      a,
      {
        size: "small",
        title: e.createElement(s, null, "🔬 研究工作流阶段"),
        style: { marginBottom: 16 }
      },
      e.createElement(m, {
        grid: { gutter: 16, column: 4 },
        dataSource: M,
        renderItem: (d, Y) => e.createElement(
          m.Item,
          null,
          e.createElement(
            u,
            { title: `${d.name} — ${d.desc}` },
            e.createElement(
              a,
              {
                size: "small",
                hoverable: !0,
                style: {
                  textAlign: "center",
                  height: "100%",
                  cursor: "pointer",
                  borderLeft: c.enabled ? "3px solid #06b6d4" : "3px solid #e8e8e8",
                  opacity: c.enabled ? 1 : 0.6
                }
              },
              e.createElement(
                "div",
                { style: { fontSize: 24 } },
                d.icon
              ),
              e.createElement(
                "div",
                {
                  style: {
                    fontWeight: 600,
                    fontSize: 12,
                    marginTop: 4
                  }
                },
                d.name
              ),
              e.createElement(
                "div",
                { style: { fontSize: 11, color: "#999" } },
                d.desc
              )
            )
          )
        )
      })
    ),
    // ── Tools + Skills ──
    e.createElement(
      r,
      { gutter: [16, 16] },
      e.createElement(
        o,
        { span: 12 },
        e.createElement(
          a,
          {
            size: "small",
            title: e.createElement(s, null, "🛠️ 研究工具")
          },
          e.createElement(m, {
            size: "small",
            dataSource: g,
            renderItem: (d) => e.createElement(
              m.Item,
              {
                actions: [
                  e.createElement(
                    u,
                    { title: d.action },
                    e.createElement(
                      w,
                      { color: c.enabled ? "cyan" : "default" },
                      c.enabled ? "可用" : "未启用"
                    )
                  )
                ]
              },
              e.createElement(
                "div",
                { style: { cursor: "default" } },
                e.createElement(
                  s,
                  null,
                  e.createElement("span", { style: { fontSize: 18 } }, d.icon),
                  e.createElement(
                    "div",
                    null,
                    e.createElement(
                      "code",
                      { style: { fontSize: 13, fontWeight: 600 } },
                      d.name
                    ),
                    e.createElement("br"),
                    e.createElement(
                      p.Text,
                      { type: "secondary", style: { fontSize: 11 } },
                      d.desc
                    )
                  )
                )
              )
            )
          })
        )
      ),
      e.createElement(
        o,
        { span: 12 },
        e.createElement(
          a,
          {
            size: "small",
            title: e.createElement(s, null, "⚡ 研究技能"),
            extra: e.createElement(
              h,
              {
                size: "small",
                type: "link",
                onClick: b,
                icon: e.createElement(R)
              },
              "技能池"
            )
          },
          e.createElement(m, {
            size: "small",
            dataSource: x,
            renderItem: (d) => e.createElement(
              m.Item,
              null,
              e.createElement(
                "div",
                {
                  style: { cursor: "pointer", width: "100%" },
                  onClick: b
                },
                e.createElement(
                  s,
                  null,
                  e.createElement("span", { style: { fontSize: 18 } }, d.icon),
                  e.createElement(
                    "div",
                    null,
                    e.createElement(
                      "strong",
                      { style: { fontSize: 13 } },
                      d.name
                    ),
                    e.createElement("br"),
                    e.createElement(
                      p.Text,
                      { type: "secondary", style: { fontSize: 11 } },
                      d.desc
                    )
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
function te(e) {
  const t = f().React, { ToolCardShell: n, DefaultBlock: l } = X(), { BookOutlined: a, Tag: r } = { ...f().antdIcons, ...f().antd }, o = e.data || e.content || {}, i = o.params || {}, p = i.query || "", E = i.source || "all", m = typeof o.result == "string" ? o.result : JSON.stringify(o.result, null, 2);
  let w = [];
  try {
    w = JSON.parse(m).results || [];
  } catch {
  }
  return t.createElement(n, {
    content: o,
    isStreaming: e.isStreaming,
    icon: t.createElement(a),
    title: `📚 Literature Search: "${p}" (${E})`,
    inlineResult: w.length ? `${w.length} results` : void 0,
    children: t.createElement(
      t.Fragment,
      null,
      w.length > 0 ? t.createElement(
        "div",
        { style: { maxHeight: 400, overflow: "auto" } },
        w.slice(0, 10).map(
          (s, h) => t.createElement(
            "div",
            {
              key: h,
              style: {
                padding: "8px 0",
                borderBottom: h < 9 ? "1px solid #f0f0f0" : "none"
              }
            },
            t.createElement(
              "strong",
              { style: { fontSize: 13 } },
              s.title || "Untitled"
            ),
            s.year && t.createElement(
              "span",
              { style: { color: "#999", marginLeft: 8 } },
              `(${s.year})`
            ),
            s.authors && t.createElement(
              "div",
              { style: { fontSize: 11, color: "#666" } },
              Array.isArray(s.authors) ? s.authors.join(", ") : s.authors
            ),
            s.doi && t.createElement(
              "code",
              { style: { fontSize: 10 } },
              s.doi
            ),
            s.abstract && t.createElement(
              "div",
              { style: { fontSize: 11, color: "#999", marginTop: 4 } },
              s.abstract.substring(0, 200) + "..."
            ),
            t.createElement(
              r,
              { style: { fontSize: 10, marginTop: 4 } },
              s.source || "unknown"
            )
          )
        )
      ) : t.createElement(l, {
        title: "Output",
        content: m
      })
    )
  });
}
function ne(e) {
  const t = f().React, { ToolCardShell: n, DefaultBlock: l } = X(), { SearchOutlined: a } = f().antdIcons, r = e.data || e.content || {}, i = (r.params || {}).query || "", p = typeof r.result == "string" ? r.result : JSON.stringify(r.result, null, 2);
  return t.createElement(n, {
    content: r,
    isStreaming: e.isStreaming,
    icon: t.createElement(a),
    title: `🔍 Web Search: "${i}"`,
    children: t.createElement(l, {
      title: "Output",
      content: p
    })
  });
}
function ae(e) {
  const t = f().React, { ToolCardShell: n, DefaultBlock: l } = X(), { BarChartOutlined: a } = f().antdIcons, r = e.data || e.content || {}, o = r.params || {}, i = o.data_path || "", p = o.operation || "summary", E = typeof r.result == "string" ? r.result : JSON.stringify(r.result, null, 2), m = i.split("/").pop() || i;
  return t.createElement(n, {
    content: r,
    isStreaming: e.isStreaming,
    icon: t.createElement(a),
    title: `📊 Data Analysis: ${m} (${p})`,
    children: t.createElement(l, {
      title: "Output",
      content: E
    })
  });
}
let G = null;
function X() {
  if (G) return G;
  const e = f().React, t = ({
    title: l,
    content: a
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
      a
    )
  );
  return G = { ToolCardShell: ({
    content: l,
    isStreaming: a,
    icon: r,
    title: o,
    inlineResult: i,
    children: p
  }) => {
    const E = l.status === "calling" && a, m = l.status === "error";
    return e.createElement(
      "details",
      {
        open: E || m,
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
        E ? e.createElement("span", {
          className: "ant-spin-dot ant-spin-dot-spin"
        }) : e.createElement("span", null, r),
        e.createElement("span", null, o),
        !E && i && e.createElement(
          "span",
          { style: { fontSize: 11, color: "#999", marginLeft: "auto" } },
          i
        )
      ),
      m ? e.createElement(t, {
        title: "Error",
        content: JSON.stringify(l.result, null, 2)
      }) : p
    );
  }, DefaultBlock: t }, G;
}
function ge() {
  var l, a, r, o, i;
  const e = window.QwenPaw;
  if (!(e != null && e.route)) {
    console.warn(
      "[ugsci-research] QwenPaw.route API not available — plugin disabled"
    );
    return;
  }
  const t = f().React, n = "ugsci_research";
  e.route.add(n, {
    id: "ugsci_research.dashboard",
    path: "/ugsci-research-dashboard",
    component: ue
  }), (l = e.slot) != null && l.fill ? (e.slot.fill(
    n,
    "header.toggle",
    () => t.createElement(ee)
  ), console.info("[ugsci-research] Registered header.toggle slot")) : (r = (a = e.chat) == null ? void 0 : a.rightHeader) != null && r.add && (e.chat.rightHeader.add(
    n,
    t.createElement(ee),
    { id: "research-mode-toggle", order: 5 }
  ), console.info("[ugsci-research] Registered chat.rightHeader toggle")), e.registerToolRender && (e.registerToolRender(n, {
    literature_search: te,
    web_search: ne,
    data_analysis: ae
  }), console.info("[ugsci-research] Registered 3 custom tool cards")), (o = e.chat) != null && o.toolRender && (e.chat.toolRender(n, "literature_search", te), e.chat.toolRender(n, "web_search", ne), e.chat.toolRender(n, "data_analysis", ae)), (i = e.slot) != null && i.fill && (e.slot.fill(
    n,
    "chat.rightPanel",
    () => t.createElement(me)
  ), console.info("[ugsci-research] Registered artifact panel in chat.rightPanel slot")), console.info(
    "[ugsci-research] Plugin registered: dashboard route + tool cards + toggle + artifact panel"
  );
}
function V() {
  try {
    ge();
  } catch (e) {
    console.error("[ugsci-research] Failed to build plugin:", e), setTimeout(V, 500);
  }
}
var le;
if ((le = window.QwenPaw) != null && le.host)
  V();
else {
  const e = setInterval(() => {
    var t;
    (t = window.QwenPaw) != null && t.host && (clearInterval(e), V());
  }, 200);
  setTimeout(() => clearInterval(e), 1e4);
}
