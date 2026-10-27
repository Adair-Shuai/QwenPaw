function d() {
  return window.QwenPaw.host;
}
function oe(e) {
  const t = window.QwenPaw, n = t == null ? void 0 : t.host;
  if (n != null && n.getApiUrl)
    return n.getApiUrl(e);
  const a = (n == null ? void 0 : n.apiBaseUrl) || "", r = e.startsWith("/") ? e : `/${e}`;
  return `${a}/api${r}`;
}
function se(e, t) {
  var s;
  const n = window.QwenPaw, a = n == null ? void 0 : n.host, r = ((s = a == null ? void 0 : a.getApiToken) == null ? void 0 : s.call(a)) || "", l = {};
  return r && !l.Authorization && (l.Authorization = `Bearer ${r}`), window.fetch(e, { ...t, headers: l });
}
async function G(e) {
  try {
    const t = oe(
      `/ugsci-research/research-mode/${encodeURIComponent(e)}`
    ), n = await se(t);
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
function ce() {
  var O, H;
  const e = d().React, { useState: t, useEffect: n, useCallback: a } = e, {
    Card: r,
    Tabs: l,
    Empty: s,
    Image: i,
    Table: g,
    Typography: u,
    Button: f,
    Space: p,
    Tag: o,
    Tooltip: y
  } = d().antd, {
    PictureOutlined: x,
    TableOutlined: E,
    CodeOutlined: C,
    FileTextOutlined: I,
    ReloadOutlined: z,
    DownloadOutlined: A
  } = d().antdIcons, _ = d().ReactMarkdown, b = d().remarkGfm, m = window.QwenPaw;
  (H = (O = m == null ? void 0 : m.host) == null ? void 0 : O.getCurrentSessionId) == null || H.call(O);
  const [$, L] = t([]), [Y, F] = t(!1), [U, Z] = t("all"), D = a(async () => {
    var c, h, w, R, J;
    F(!0);
    try {
      const ne = ((c = m == null ? void 0 : m.host) == null ? void 0 : c.fetch) || window.fetch.bind(window), ae = ((h = m == null ? void 0 : m.host) == null ? void 0 : h.apiBaseUrl) || "", le = ((R = (w = m == null ? void 0 : m.host) == null ? void 0 : w.getSelectedAgentId) == null ? void 0 : R.call(w)) || "default", M = await ne(
        `${ae}/api/files/list?path=.&agent_id=${le}`
      );
      if (!M.ok) {
        L([]);
        return;
      }
      const W = await M.json(), re = W.files || W.entries || [], q = [];
      for (const S of re) {
        const v = S.name || S.filename || "", k = ((J = v.split(".").pop()) == null ? void 0 : J.toLowerCase()) || "";
        if (!(/^(fig|figure|plot|chart|table|artifact)/i.test(v) || ["png", "jpg", "jpeg", "svg", "csv", "json"].includes(k))) continue;
        let T = "text";
        ["png", "jpg", "jpeg", "svg", "gif"].includes(k) ? T = "figure" : ["csv", "tsv"].includes(k) ? T = "table" : ["py", "js", "ts", "sh"].includes(k) ? T = "code" : k === "las" && (T = "las"), q.push({
          id: v,
          type: T,
          title: v,
          content: S.url || S.path || v,
          filePath: S.path || v,
          createdAt: S.modified || Date.now()
        });
      }
      L(q);
    } catch {
      L([]);
    } finally {
      F(!1);
    }
  }, [m]);
  n(() => {
    D();
  }, [D]);
  const Q = $.filter((c) => U === "all" ? !0 : c.type === U), ee = (c) => {
    var w, R;
    const h = ((R = (w = window.QwenPaw) == null ? void 0 : w.host) == null ? void 0 : R.apiBaseUrl) || "";
    switch (c.type) {
      case "figure":
        return e.createElement(i, {
          src: `${h}/api/files/read?path=${encodeURIComponent(
            c.filePath || ""
          )}`,
          alt: c.title,
          style: { maxWidth: "100%", borderRadius: 8 }
        });
      case "table":
        return e.createElement(
          "div",
          { style: { overflowX: "auto" } },
          e.createElement(u.Text, {
            code: !0,
            children: c.filePath
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
          c.content
        );
      case "las":
        return e.createElement(
          "div",
          null,
          e.createElement(o, { color: "orange" }, "LAS Well Log"),
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
            c.content
          )
        );
      default:
        return e.createElement(
          "div",
          { style: { fontSize: 13 } },
          _ ? e.createElement(_, {
            remarkPlugins: b ? [b] : [],
            children: c.content
          }) : c.content
        );
    }
  }, te = [
    { key: "all", label: "All", icon: e.createElement(I) },
    {
      key: "figure",
      label: "Figures",
      icon: e.createElement(x)
    },
    { key: "table", label: "Tables", icon: e.createElement(E) },
    { key: "code", label: "Code", icon: e.createElement(C) },
    {
      key: "las",
      label: "Well Logs",
      icon: e.createElement(E)
    }
  ];
  return e.createElement(
    r,
    {
      size: "small",
      title: e.createElement(
        p,
        null,
        e.createElement(x),
        "Artifacts",
        e.createElement(
          o,
          { color: "blue", style: { fontSize: 10 } },
          String($.length)
        )
      ),
      extra: e.createElement(
        p,
        null,
        e.createElement(
          y,
          { title: "Refresh" },
          e.createElement(f, {
            size: "small",
            type: "text",
            icon: e.createElement(z),
            onClick: D,
            loading: Y
          })
        )
      ),
      style: { height: "100%", overflow: "auto" }
    },
    $.length === 0 ? e.createElement(s, {
      description: "No artifacts yet. Run research tasks to generate figures and data.",
      image: s.PRESENTED_IMAGE_SIMPLE
    }) : e.createElement(l, {
      activeKey: U,
      onChange: Z,
      size: "small",
      items: te.map((c) => ({
        key: c.key,
        label: e.createElement(p, { size: 4 }, c.icon, c.label),
        children: e.createElement(
          "div",
          { style: { display: "grid", gap: 12 } },
          Q.map(
            (h) => e.createElement(
              r,
              {
                key: h.id,
                size: "small",
                title: h.title,
                extra: e.createElement(
                  o,
                  { color: h.type === "figure" ? "green" : "blue" },
                  h.type
                )
              },
              ee(h)
            )
          )
        )
      }))
    })
  );
}
function ie() {
  var E, C, I, z;
  const e = d(), t = e.React, { useState: n, useEffect: a } = t, { Button: r, Tooltip: l } = e.antd, { PictureOutlined: s } = e.antdIcons, [i, g] = n(!1), u = window.QwenPaw, f = ((C = (E = u == null ? void 0 : u.host) == null ? void 0 : E.getSelectedAgentId) == null ? void 0 : C.call(E)) || "default", [p, o] = n(!1);
  if (a(() => {
    let A = !0;
    G(f).then((b) => {
      A && o(b.enabled);
    });
    const _ = setInterval(() => {
      G(f).then((b) => {
        A && o(b.enabled);
      });
    }, 3e3);
    return () => {
      A = !1, clearInterval(_);
    };
  }, [f]), !p) return null;
  const y = {
    width: i ? 44 : 320,
    flexShrink: 0,
    height: "100%",
    overflow: "hidden",
    borderLeft: "1px solid rgba(0,0,0,0.06)",
    transition: "width 0.2s ease",
    display: "flex",
    flexDirection: "column"
  }, x = typeof document < "u" && ((z = (I = document.documentElement) == null ? void 0 : I.classList) == null ? void 0 : z.contains("dark-mode"));
  return x && (y.borderLeft = "1px solid rgba(255,255,255,0.08)", y.background = "#1e1e1e"), i ? t.createElement(
    "div",
    { style: { ...y, alignItems: "center", paddingTop: 8 } },
    t.createElement(
      l,
      { title: "Expand Artifacts", placement: "left" },
      t.createElement(r, {
        type: "text",
        size: "small",
        icon: t.createElement(s),
        onClick: () => g(!1)
      })
    )
  ) : t.createElement(
    "div",
    { style: y },
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
          color: x ? "rgba(255,255,255,0.85)" : "rgba(0,0,0,0.85)"
        }
      },
      t.createElement("span", null, "📗 Artifacts"),
      t.createElement(
        l,
        { title: "Collapse", placement: "left" },
        t.createElement(
          r,
          {
            type: "text",
            size: "small",
            onClick: () => g(!0),
            style: { fontSize: 12 }
          },
          "‹"
        )
      )
    ),
    t.createElement(
      "div",
      { style: { flex: 1, overflow: "auto", padding: 8 } },
      t.createElement(ce)
    )
  );
}
function K(e) {
  const t = d().React, { ToolCardShell: n, DefaultBlock: a } = N(), { BookOutlined: r, Tag: l } = { ...d().antdIcons, ...d().antd }, s = e.data || e.content || {}, i = s.params || {}, g = i.query || "", u = i.source || "all", f = typeof s.result == "string" ? s.result : JSON.stringify(s.result, null, 2);
  let p = [];
  try {
    p = JSON.parse(f).results || [];
  } catch {
  }
  return t.createElement(n, {
    content: s,
    isStreaming: e.isStreaming,
    icon: t.createElement(r),
    title: `📚 Literature Search: "${g}" (${u})`,
    inlineResult: p.length ? `${p.length} results` : void 0,
    children: t.createElement(
      t.Fragment,
      null,
      p.length > 0 ? t.createElement(
        "div",
        { style: { maxHeight: 400, overflow: "auto" } },
        p.slice(0, 10).map(
          (o, y) => t.createElement(
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
              o.title || "Untitled"
            ),
            o.year && t.createElement(
              "span",
              { style: { color: "#999", marginLeft: 8 } },
              `(${o.year})`
            ),
            o.authors && t.createElement(
              "div",
              { style: { fontSize: 11, color: "#666" } },
              Array.isArray(o.authors) ? o.authors.join(", ") : o.authors
            ),
            o.doi && t.createElement(
              "code",
              { style: { fontSize: 10 } },
              o.doi
            ),
            o.abstract && t.createElement(
              "div",
              { style: { fontSize: 11, color: "#999", marginTop: 4 } },
              o.abstract.substring(0, 200) + "..."
            ),
            t.createElement(
              l,
              { style: { fontSize: 10, marginTop: 4 } },
              o.source || "unknown"
            )
          )
        )
      ) : t.createElement(a, {
        title: "Output",
        content: f
      })
    )
  });
}
function P(e) {
  const t = d().React, { ToolCardShell: n, DefaultBlock: a } = N(), { SearchOutlined: r } = d().antdIcons, l = e.data || e.content || {}, i = (l.params || {}).query || "", g = typeof l.result == "string" ? l.result : JSON.stringify(l.result, null, 2);
  return t.createElement(n, {
    content: l,
    isStreaming: e.isStreaming,
    icon: t.createElement(r),
    title: `🔍 Web Search: "${i}"`,
    children: t.createElement(a, {
      title: "Output",
      content: g
    })
  });
}
function V(e) {
  const t = d().React, { ToolCardShell: n, DefaultBlock: a } = N(), { BarChartOutlined: r } = d().antdIcons, l = e.data || e.content || {}, s = l.params || {}, i = s.data_path || "", g = s.operation || "summary", u = typeof l.result == "string" ? l.result : JSON.stringify(l.result, null, 2), f = i.split("/").pop() || i;
  return t.createElement(n, {
    content: l,
    isStreaming: e.isStreaming,
    icon: t.createElement(r),
    title: `📊 Data Analysis: ${f} (${g})`,
    children: t.createElement(a, {
      title: "Output",
      content: u
    })
  });
}
let B = null;
function N() {
  if (B) return B;
  const e = d().React, t = ({
    title: a,
    content: r
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
      r
    )
  );
  return B = { ToolCardShell: ({
    content: a,
    isStreaming: r,
    icon: l,
    title: s,
    inlineResult: i,
    children: g
  }) => {
    const u = a.status === "calling" && r, f = a.status === "error";
    return e.createElement(
      "details",
      {
        open: u || f,
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
        u ? e.createElement("span", {
          className: "ant-spin-dot ant-spin-dot-spin"
        }) : e.createElement("span", null, l),
        e.createElement("span", null, s),
        !u && i && e.createElement(
          "span",
          { style: { fontSize: 11, color: "#999", marginLeft: "auto" } },
          i
        )
      ),
      f ? e.createElement(t, {
        title: "Error",
        content: JSON.stringify(a.result, null, 2)
      }) : g
    );
  }, DefaultBlock: t }, B;
}
function de() {
  var a, r;
  const e = window.QwenPaw;
  if (!(e != null && e.route)) {
    console.warn(
      "[ugsci-research] QwenPaw.route API not available — plugin disabled"
    );
    return;
  }
  const t = d().React, n = "ugsci_research";
  e.registerToolRender && (e.registerToolRender(n, {
    literature_search: K,
    research_web_search: P,
    // Preserve the renderer used by historical research messages.
    web_search: P,
    data_analysis: V
  }), console.info("[ugsci-research] Registered 3 custom tool cards")), (a = e.chat) != null && a.toolRender && (e.chat.toolRender(n, "literature_search", K), e.chat.toolRender(n, "research_web_search", P), e.chat.toolRender(n, "web_search", P), e.chat.toolRender(n, "data_analysis", V)), (r = e.slot) != null && r.fill && (e.slot.fill(
    n,
    "chat.rightPanel",
    () => t.createElement(ie),
    { id: "research-artifact-panel" }
  ), console.info(
    "[ugsci-research] Registered artifact panel in chat.rightPanel slot"
  )), console.info(
    "[ugsci-research] Plugin registered: tool cards + artifact panel"
  );
}
function j() {
  try {
    de();
  } catch (e) {
    console.error("[ugsci-research] Failed to build plugin:", e), setTimeout(j, 500);
  }
}
var X;
if ((X = window.QwenPaw) != null && X.host)
  j();
else {
  const e = setInterval(() => {
    var t;
    (t = window.QwenPaw) != null && t.host && (clearInterval(e), j());
  }, 200);
  setTimeout(() => clearInterval(e), 1e4);
}
