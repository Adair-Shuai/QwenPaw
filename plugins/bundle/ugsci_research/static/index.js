function f() {
  return window.QwenPaw.host;
}
function re(e) {
  const t = window.QwenPaw, n = t == null ? void 0 : t.host;
  if (n != null && n.getApiUrl)
    return n.getApiUrl(e);
  const a = (n == null ? void 0 : n.apiBaseUrl) || "", l = e.startsWith("/") ? e : `/${e}`;
  return `${a}/api${l}`;
}
function oe(e, t) {
  var o;
  const n = window.QwenPaw, a = n == null ? void 0 : n.host, l = ((o = a == null ? void 0 : a.getApiToken) == null ? void 0 : o.call(a)) || "", r = {
    ...(t == null ? void 0 : t.headers) ?? {}
  };
  return l && !r.Authorization && (r.Authorization = `Bearer ${l}`), window.fetch(e, { ...t, headers: r });
}
async function V(e) {
  try {
    const t = re(`/ugsci-research/research-mode/${encodeURIComponent(e)}`), n = await oe(t);
    if (!n.ok) return { enabled: !1, domain: "general" };
    const a = await n.json();
    return {
      enabled: !!a.enabled,
      domain: a.domain || "general"
    };
  } catch {
    return { enabled: !1, domain: "general" };
  }
}
async function G(e, t, n) {
  try {
    const a = await V(e), l = {
      enabled: t,
      domain: n || a.domain || "general"
    }, r = re(`/ugsci-research/research-mode/${encodeURIComponent(e)}`);
    return (await oe(r, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(l)
    })).ok;
  } catch {
    return !1;
  }
}
function ee() {
  var k, P, D, U;
  const e = f(), t = e.React, { useState: n, useEffect: a, useCallback: l } = t, { Tooltip: r, Select: o, message: d, Popover: g, Button: b, Space: m } = e.antd, { ExperimentOutlined: p, SettingOutlined: c } = e.antdIcons, w = window.QwenPaw, T = ((P = (k = w == null ? void 0 : w.host) == null ? void 0 : k.getSelectedAgentId) == null ? void 0 : P.call(k)) || "default", [y, L] = n(!1), [z, $] = n("general"), [j, A] = n(!1), _ = l(async () => {
    const h = await V(T);
    L(h.enabled), $(h.domain);
  }, [T]);
  a(() => {
    _();
  }, [_]);
  const E = async () => {
    A(!0);
    const h = !y;
    await G(T, h) ? (L(h), d.success(h ? "🔬 研究模式已启用" : "研究模式已关闭")) : d.error("切换研究模式失败"), A(!1);
  }, C = async (h) => {
    A(!0), await G(T, y, h) && $(h), A(!1);
  }, x = () => {
    window.location.href = "/ugsci-research-dashboard";
  }, s = {
    display: "inline-flex",
    alignItems: "center",
    gap: "5px",
    padding: "4px 10px",
    borderRadius: "6px",
    border: y ? "1.5px solid #06b6d4" : "1.5px solid rgba(0,0,0,0.12)",
    background: y ? "rgba(6,182,212,0.08)" : "transparent",
    color: y ? "#06b6d4" : "rgba(0,0,0,0.55)",
    fontSize: "13px",
    fontWeight: 500,
    cursor: "pointer",
    transition: "all 0.18s ease"
  }, I = typeof document < "u" && ((U = (D = document.documentElement) == null ? void 0 : D.classList) == null ? void 0 : U.contains("dark-mode"));
  I && (s.border = y ? "1.5px solid #22d3ee" : "1.5px solid rgba(255,255,255,0.15)", s.color = y ? "#22d3ee" : "rgba(255,255,255,0.85)", s.background = y ? "rgba(6,182,212,0.18)" : "transparent");
  const R = {
    display: "inline-flex",
    alignItems: "center",
    padding: "4px 6px",
    borderRadius: "6px",
    border: "1.5px solid rgba(0,0,0,0.12)",
    background: "transparent",
    cursor: "pointer",
    color: "rgba(0,0,0,0.55)"
  };
  I && (R.border = "1.5px solid rgba(255,255,255,0.15)", R.color = "rgba(255,255,255,0.85)");
  const O = t.createElement(
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
        value: z,
        onChange: C,
        loading: j,
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
      b,
      {
        size: "small",
        type: "link",
        onClick: x,
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
        title: y ? `研究模式已开启 (${z}) — 点击关闭` : "研究模式 — 点击启用",
        placement: "bottom"
      },
      t.createElement(
        "button",
        {
          type: "button",
          style: s,
          onClick: () => void E(),
          disabled: j,
          "aria-label": "Toggle Research Mode"
        },
        t.createElement("span", { style: { display: "flex", alignItems: "center" } }, "🔬"),
        t.createElement("span", { style: { lineHeight: 1 } }, y ? `研究 ${z}` : "研究")
      )
    ),
    t.createElement(
      g,
      { content: O, placement: "bottomRight", trigger: "click" },
      t.createElement(
        "button",
        { type: "button", style: R, "aria-label": "Research settings" },
        t.createElement(c, { style: { fontSize: 12 } })
      )
    )
  );
}
function de() {
  var h, N;
  const e = f().React, { useState: t, useEffect: n, useCallback: a } = e, {
    Card: l,
    Tabs: r,
    Empty: o,
    Image: d,
    Table: g,
    Typography: b,
    Button: m,
    Space: p,
    Tag: c,
    Tooltip: w
  } = f().antd, {
    PictureOutlined: T,
    TableOutlined: y,
    CodeOutlined: L,
    FileTextOutlined: z,
    ReloadOutlined: $,
    DownloadOutlined: j
  } = f().antdIcons, A = f().ReactMarkdown, _ = f().remarkGfm, E = window.QwenPaw;
  (N = (h = E == null ? void 0 : E.host) == null ? void 0 : h.getCurrentSessionId) == null || N.call(h);
  const [C, x] = t([]), [s, I] = t(!1), [R, O] = t("all"), k = a(async () => {
    var u, S, v, B, i;
    I(!0);
    try {
      const q = ((u = E == null ? void 0 : E.host) == null ? void 0 : u.fetch) || window.fetch.bind(window), se = ((S = E == null ? void 0 : E.host) == null ? void 0 : S.apiBaseUrl) || "", ce = ((B = (v = E == null ? void 0 : E.host) == null ? void 0 : v.getSelectedAgentId) == null ? void 0 : B.call(v)) || "default", Z = await q(
        `${se}/api/files/list?path=.&agent_id=${ce}`
      );
      if (!Z.ok) {
        x([]);
        return;
      }
      const K = await Z.json(), ie = K.files || K.entries || [], Q = [];
      for (const M of ie) {
        const H = M.name || M.filename || "", W = ((i = H.split(".").pop()) == null ? void 0 : i.toLowerCase()) || "";
        if (!(/^(fig|figure|plot|chart|table|artifact)/i.test(H) || ["png", "jpg", "jpeg", "svg", "csv", "json"].includes(W))) continue;
        let J = "text";
        ["png", "jpg", "jpeg", "svg", "gif"].includes(W) ? J = "figure" : ["csv", "tsv"].includes(W) ? J = "table" : ["py", "js", "ts", "sh"].includes(W) ? J = "code" : W === "las" && (J = "las"), Q.push({
          id: H,
          type: J,
          title: H,
          content: M.url || M.path || H,
          filePath: M.path || H,
          createdAt: M.modified || Date.now()
        });
      }
      x(Q);
    } catch {
      x([]);
    } finally {
      I(!1);
    }
  }, [E]);
  n(() => {
    k();
  }, [k]);
  const P = C.filter((u) => R === "all" ? !0 : u.type === R), D = (u) => {
    var v, B;
    const S = ((B = (v = window.QwenPaw) == null ? void 0 : v.host) == null ? void 0 : B.apiBaseUrl) || "";
    switch (u.type) {
      case "figure":
        return e.createElement(d, {
          src: `${S}/api/files/read?path=${encodeURIComponent(
            u.filePath || ""
          )}`,
          alt: u.title,
          style: { maxWidth: "100%", borderRadius: 8 }
        });
      case "table":
        return e.createElement(
          "div",
          { style: { overflowX: "auto" } },
          e.createElement(b.Text, {
            code: !0,
            children: u.filePath
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
          u.content
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
            u.content
          )
        );
      default:
        return e.createElement(
          "div",
          { style: { fontSize: 13 } },
          A ? e.createElement(A, {
            remarkPlugins: _ ? [_] : [],
            children: u.content
          }) : u.content
        );
    }
  }, U = [
    { key: "all", label: "All", icon: e.createElement(z) },
    {
      key: "figure",
      label: "Figures",
      icon: e.createElement(T)
    },
    { key: "table", label: "Tables", icon: e.createElement(y) },
    { key: "code", label: "Code", icon: e.createElement(L) },
    {
      key: "las",
      label: "Well Logs",
      icon: e.createElement(y)
    }
  ];
  return e.createElement(
    l,
    {
      size: "small",
      title: e.createElement(
        p,
        null,
        e.createElement(T),
        "Artifacts",
        e.createElement(
          c,
          { color: "blue", style: { fontSize: 10 } },
          String(C.length)
        )
      ),
      extra: e.createElement(
        p,
        null,
        e.createElement(
          w,
          { title: "Refresh" },
          e.createElement(m, {
            size: "small",
            type: "text",
            icon: e.createElement($),
            onClick: k,
            loading: s
          })
        )
      ),
      style: { height: "100%", overflow: "auto" }
    },
    C.length === 0 ? e.createElement(o, {
      description: "No artifacts yet. Run research tasks to generate figures and data.",
      image: o.PRESENTED_IMAGE_SIMPLE
    }) : e.createElement(r, {
      activeKey: R,
      onChange: O,
      size: "small",
      items: U.map((u) => ({
        key: u.key,
        label: e.createElement(p, { size: 4 }, u.icon, u.label),
        children: e.createElement(
          "div",
          { style: { display: "grid", gap: 12 } },
          P.map(
            (S) => e.createElement(
              l,
              {
                key: S.id,
                size: "small",
                title: S.title,
                extra: e.createElement(
                  c,
                  { color: S.type === "figure" ? "green" : "blue" },
                  S.type
                )
              },
              D(S)
            )
          )
        )
      }))
    })
  );
}
function me() {
  var v, B;
  const e = f().React, { useState: t, useEffect: n, useCallback: a } = e, {
    Card: l,
    Row: r,
    Col: o,
    Statistic: d,
    Typography: g,
    Divider: b,
    List: m,
    Tag: p,
    Space: c,
    Button: w,
    Select: T,
    Tooltip: y,
    message: L
  } = f().antd, {
    ExperimentOutlined: z,
    BookOutlined: $,
    BarChartOutlined: j,
    BulbOutlined: A,
    ArrowRightOutlined: _,
    ThunderboltOutlined: E
  } = f().antdIcons, C = window.QwenPaw, x = ((B = (v = C == null ? void 0 : C.host) == null ? void 0 : v.getSelectedAgentId) == null ? void 0 : B.call(v)) || "default", [s, I] = t({
    enabled: !1,
    domain: "general"
  }), [R, O] = t(!1), k = a(async () => {
    const i = await V(x);
    I(i);
  }, [x]);
  n(() => {
    k();
  }, [k]);
  const P = async () => {
    O(!0), await G(x, !s.enabled) ? (I({ ...s, enabled: !s.enabled }), L.success(
      s.enabled ? "研究模式已关闭" : "🔬 研究模式已启用"
    )) : L.error("切换研究模式失败"), O(!1);
  }, D = async (i) => {
    O(!0), await G(x, s.enabled, i) && I({ ...s, domain: i }), O(!1);
  }, U = () => {
    window.location.href = "/chat";
  }, h = () => {
    window.location.href = "/skill-pool";
  }, N = [
    { name: "SCOPE", desc: "定义研究问题", icon: "🎯" },
    { name: "LITERATURE", desc: "检索与综述文献", icon: "📚" },
    { name: "REASON", desc: "推理与思考", icon: "💡" },
    { name: "METHODOLOGY", desc: "设计研究方法", icon: "📋" },
    { name: "COMPUTE", desc: "执行计算", icon: "⚙️" },
    { name: "ANALYZE", desc: "分析结果", icon: "📊" },
    { name: "SYNTHESIZE", desc: "综合解读", icon: "🔗" },
    { name: "WRITE", desc: "撰写成果", icon: "✍️" }
  ], u = [
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
  ], S = [
    { name: "literature-review", desc: "PRISMA 系统综述", icon: "📚" },
    { name: "scientific-visualization", desc: "出版级图表绘制", icon: "📈" },
    { name: "hypothesis-generation", desc: "结构化假说设计", icon: "💡" }
  ];
  return e.createElement(
    "div",
    { style: { padding: 24, maxWidth: 1200, margin: "0 auto" } },
    // ── Header Card with Toggle ──
    e.createElement(
      l,
      null,
      e.createElement(
        "div",
        { style: { display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 } },
        e.createElement(
          c,
          { align: "center", size: 12 },
          e.createElement(z, {
            style: { fontSize: 28, color: s.enabled ? "#06b6d4" : "#999" }
          }),
          e.createElement(
            "div",
            null,
            e.createElement(
              g.Title,
              { level: 4, style: { margin: 0 } },
              "研究模式"
            ),
            e.createElement(
              g.Text,
              { type: "secondary" },
              `Agent: ${x}`
            )
          ),
          s.enabled ? e.createElement(p, { color: "green" }, "已启用") : e.createElement(p, { color: "default" }, "未启用")
        ),
        e.createElement(
          c,
          { size: 8 },
          e.createElement(T, {
            size: "small",
            value: s.domain,
            onChange: D,
            loading: R,
            style: { width: 120 },
            options: [
              { value: "general", label: "🔬 通用" },
              { value: "physics", label: "⚛️ 物理" },
              { value: "biology", label: "🧬 生物" },
              { value: "ml", label: "🤖 ML" }
            ]
          }),
          e.createElement(
            w,
            {
              type: s.enabled ? "default" : "primary",
              danger: s.enabled,
              loading: R,
              onClick: P,
              icon: e.createElement(z)
            },
            s.enabled ? "关闭研究模式" : "启用研究模式"
          )
        )
      )
    ),
    e.createElement(b, null),
    // ── Stats Row ──
    e.createElement(
      r,
      { gutter: [16, 16] },
      e.createElement(
        o,
        { span: 8 },
        e.createElement(l, {
          size: "small",
          children: e.createElement(d, {
            title: "研究模式",
            value: s.enabled ? "已启用" : "未启用",
            prefix: e.createElement(z),
            valueStyle: s.enabled ? { color: "#06b6d4" } : { color: "#999" }
          })
        })
      ),
      e.createElement(
        o,
        { span: 8 },
        e.createElement(l, {
          size: "small",
          children: e.createElement(d, {
            title: "研究领域",
            value: s.domain,
            prefix: e.createElement($)
          })
        })
      ),
      e.createElement(
        o,
        { span: 8 },
        e.createElement(l, {
          size: "small",
          children: e.createElement(d, {
            title: "工作流阶段",
            value: 8,
            prefix: e.createElement(j)
          })
        })
      )
    ),
    e.createElement(b, null),
    // ── Start Research Button ──
    e.createElement(
      "div",
      { style: { textAlign: "center", marginBottom: 24 } },
      e.createElement(
        w,
        {
          type: "primary",
          size: "large",
          icon: e.createElement(E),
          disabled: !s.enabled,
          onClick: U,
          style: s.enabled ? { background: "#06b6d4", borderColor: "#06b6d4" } : {}
        },
        "开始研究对话"
      ),
      !s.enabled && e.createElement(
        "div",
        { style: { marginTop: 8, fontSize: 12, color: "#999" } },
        "请先启用研究模式"
      )
    ),
    // ── Workflow Stages ──
    e.createElement(
      l,
      {
        size: "small",
        title: e.createElement(c, null, "🔬 研究工作流阶段"),
        style: { marginBottom: 16 }
      },
      e.createElement(m, {
        grid: { gutter: 16, column: 4 },
        dataSource: N,
        renderItem: (i, q) => e.createElement(
          m.Item,
          null,
          e.createElement(
            y,
            { title: `${i.name} — ${i.desc}` },
            e.createElement(
              l,
              {
                size: "small",
                hoverable: !0,
                style: {
                  textAlign: "center",
                  height: "100%",
                  cursor: "pointer",
                  borderLeft: s.enabled ? "3px solid #06b6d4" : "3px solid #e8e8e8",
                  opacity: s.enabled ? 1 : 0.6
                }
              },
              e.createElement(
                "div",
                { style: { fontSize: 24 } },
                i.icon
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
                i.name
              ),
              e.createElement(
                "div",
                { style: { fontSize: 11, color: "#999" } },
                i.desc
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
          l,
          {
            size: "small",
            title: e.createElement(c, null, "🛠️ 研究工具")
          },
          e.createElement(m, {
            size: "small",
            dataSource: u,
            renderItem: (i) => e.createElement(
              m.Item,
              {
                actions: [
                  e.createElement(
                    y,
                    { title: i.action },
                    e.createElement(
                      p,
                      { color: s.enabled ? "cyan" : "default" },
                      s.enabled ? "可用" : "未启用"
                    )
                  )
                ]
              },
              e.createElement(
                "div",
                { style: { cursor: "default" } },
                e.createElement(
                  c,
                  null,
                  e.createElement("span", { style: { fontSize: 18 } }, i.icon),
                  e.createElement(
                    "div",
                    null,
                    e.createElement(
                      "code",
                      { style: { fontSize: 13, fontWeight: 600 } },
                      i.name
                    ),
                    e.createElement("br"),
                    e.createElement(
                      g.Text,
                      { type: "secondary", style: { fontSize: 11 } },
                      i.desc
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
          l,
          {
            size: "small",
            title: e.createElement(c, null, "⚡ 研究技能"),
            extra: e.createElement(
              w,
              {
                size: "small",
                type: "link",
                onClick: h,
                icon: e.createElement(_)
              },
              "技能池"
            )
          },
          e.createElement(m, {
            size: "small",
            dataSource: S,
            renderItem: (i) => e.createElement(
              m.Item,
              null,
              e.createElement(
                "div",
                {
                  style: { cursor: "pointer", width: "100%" },
                  onClick: h
                },
                e.createElement(
                  c,
                  null,
                  e.createElement("span", { style: { fontSize: 18 } }, i.icon),
                  e.createElement(
                    "div",
                    null,
                    e.createElement(
                      "strong",
                      { style: { fontSize: 13 } },
                      i.name
                    ),
                    e.createElement("br"),
                    e.createElement(
                      g.Text,
                      { type: "secondary", style: { fontSize: 11 } },
                      i.desc
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
  const t = f().React, { ToolCardShell: n, DefaultBlock: a } = X(), { BookOutlined: l, Tag: r } = { ...f().antdIcons, ...f().antd }, o = e.data || e.content || {}, d = o.params || {}, g = d.query || "", b = d.source || "all", m = typeof o.result == "string" ? o.result : JSON.stringify(o.result, null, 2);
  let p = [];
  try {
    p = JSON.parse(m).results || [];
  } catch {
  }
  return t.createElement(n, {
    content: o,
    isStreaming: e.isStreaming,
    icon: t.createElement(l),
    title: `📚 Literature Search: "${g}" (${b})`,
    inlineResult: p.length ? `${p.length} results` : void 0,
    children: t.createElement(
      t.Fragment,
      null,
      p.length > 0 ? t.createElement(
        "div",
        { style: { maxHeight: 400, overflow: "auto" } },
        p.slice(0, 10).map(
          (c, w) => t.createElement(
            "div",
            {
              key: w,
              style: {
                padding: "8px 0",
                borderBottom: w < 9 ? "1px solid #f0f0f0" : "none"
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
              r,
              { style: { fontSize: 10, marginTop: 4 } },
              c.source || "unknown"
            )
          )
        )
      ) : t.createElement(a, {
        title: "Output",
        content: m
      })
    )
  });
}
function ne(e) {
  const t = f().React, { ToolCardShell: n, DefaultBlock: a } = X(), { SearchOutlined: l } = f().antdIcons, r = e.data || e.content || {}, d = (r.params || {}).query || "", g = typeof r.result == "string" ? r.result : JSON.stringify(r.result, null, 2);
  return t.createElement(n, {
    content: r,
    isStreaming: e.isStreaming,
    icon: t.createElement(l),
    title: `🔍 Web Search: "${d}"`,
    children: t.createElement(a, {
      title: "Output",
      content: g
    })
  });
}
function ae(e) {
  const t = f().React, { ToolCardShell: n, DefaultBlock: a } = X(), { BarChartOutlined: l } = f().antdIcons, r = e.data || e.content || {}, o = r.params || {}, d = o.data_path || "", g = o.operation || "summary", b = typeof r.result == "string" ? r.result : JSON.stringify(r.result, null, 2), m = d.split("/").pop() || d;
  return t.createElement(n, {
    content: r,
    isStreaming: e.isStreaming,
    icon: t.createElement(l),
    title: `📊 Data Analysis: ${m} (${g})`,
    children: t.createElement(a, {
      title: "Output",
      content: b
    })
  });
}
let F = null;
function X() {
  if (F) return F;
  const e = f().React, t = ({
    title: a,
    content: l
  }) => e.createElement(
    "div",
    { style: { margin: "4px 0 2px 18px" } },
    e.createElement(
      "div",
      { style: { fontSize: 11, color: "#999", marginBottom: 2 } },
      a
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
      l
    )
  );
  return F = { ToolCardShell: ({
    content: a,
    isStreaming: l,
    icon: r,
    title: o,
    inlineResult: d,
    children: g
  }) => {
    const b = a.status === "calling" && l, m = a.status === "error";
    return e.createElement(
      "details",
      {
        open: b || m,
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
        b ? e.createElement("span", {
          className: "ant-spin-dot ant-spin-dot-spin"
        }) : e.createElement("span", null, r),
        e.createElement("span", null, o),
        !b && d && e.createElement(
          "span",
          { style: { fontSize: 11, color: "#999", marginLeft: "auto" } },
          d
        )
      ),
      m ? e.createElement(t, {
        title: "Error",
        content: JSON.stringify(a.result, null, 2)
      }) : g
    );
  }, DefaultBlock: t }, F;
}
function ue() {
  var a, l, r, o, d, g;
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
    component: me
  }), (a = e.slot) != null && a.fill ? (e.slot.fill(
    n,
    "header.toggle",
    () => t.createElement(ee)
  ), console.info("[ugsci-research] Registered header.toggle slot")) : (r = (l = e.chat) == null ? void 0 : l.rightHeader) != null && r.add && (e.chat.rightHeader.add(
    n,
    t.createElement(ee),
    { id: "research-mode-toggle", order: 5 }
  ), console.info("[ugsci-research] Registered chat.rightHeader toggle")), e.registerToolRender && (e.registerToolRender(n, {
    literature_search: te,
    web_search: ne,
    data_analysis: ae
  }), console.info("[ugsci-research] Registered 3 custom tool cards")), (o = e.chat) != null && o.toolRender && (e.chat.toolRender(n, "literature_search", te), e.chat.toolRender(n, "web_search", ne), e.chat.toolRender(n, "data_analysis", ae)), (g = (d = e.chat) == null ? void 0 : d.response) != null && g.append && (e.chat.response.append(
    n,
    (b) => {
      var m, p;
      return (p = (m = e.host) == null ? void 0 : m.getSelectedAgentId) != null && p.call(m), t.createElement(de);
    },
    { id: "artifact-panel", order: 100 }
  ), console.info("[ugsci-research] Registered artifact panel in response slot")), console.info(
    "[ugsci-research] Plugin registered: dashboard route + tool cards + toggle + artifact panel"
  );
}
function Y() {
  try {
    ue();
  } catch (e) {
    console.error("[ugsci-research] Failed to build plugin:", e), setTimeout(Y, 500);
  }
}
var le;
if ((le = window.QwenPaw) != null && le.host)
  Y();
else {
  const e = setInterval(() => {
    var t;
    (t = window.QwenPaw) != null && t.host && (clearInterval(e), Y());
  }, 200);
  setTimeout(() => clearInterval(e), 1e4);
}
