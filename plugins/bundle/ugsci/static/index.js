function u() {
  var l;
  const e = (l = window.QwenPaw) == null ? void 0 : l.host;
  if (!e) throw new Error("[ugsci] QwenPaw.host not available");
  return e;
}
function re() {
  try {
    return u().getApiToken() || "";
  } catch {
    return "";
  }
}
function se(e) {
  return u().getApiUrl(e);
}
function oe(e) {
  const l = re();
  return {
    "Content-Type": "application/json",
    ...l ? { Authorization: `Bearer ${l}` } : {},
    ...e
  };
}
async function U(e, l) {
  const n = await fetch(se(e), {
    ...l,
    headers: { ...oe(), ...(l == null ? void 0 : l.headers) || {} }
  });
  if (!n.ok) {
    const t = await n.text().catch(() => "");
    throw new Error(t || `HTTP ${n.status}`);
  }
  return n.status === 204 ? null : n.json();
}
async function te() {
  const e = await U("/agents");
  return (e == null ? void 0 : e.agents) || [];
}
async function ie(e) {
  return U(`/agents/${encodeURIComponent(e)}`);
}
async function ce(e) {
  return await U("/skills", {
    headers: { "X-Agent-Id": e }
  }) || [];
}
async function me() {
  return await U("/skills/pool") || [];
}
async function de() {
  return await U("/skills/workspaces") || [];
}
async function ne() {
  return await U("/mcp") || [];
}
function ue(e) {
  if (!e || typeof e != "object") return [];
  const l = e, n = l.mcpServers || l;
  return !n || typeof n != "object" ? [] : Object.keys(n).filter((t) => t !== "mcpServers");
}
function q() {
  try {
    return localStorage.getItem("qwenpaw_sidebar_mode") === "simple";
  } catch {
    return !1;
  }
}
function le(e, l) {
  const n = u();
  return n.ReactMarkdown && n.remarkGfm ? l.createElement(
    n.ReactMarkdown,
    { remarkPlugins: [n.remarkGfm] },
    e
  ) : e.replace(/\*\*(.+?)\*\*/g, "$1").replace(/\*(.+?)\*/g, "$1").replace(/`(.+?)`/g, "$1").replace(/^#+\s*/gm, "").replace(/^[-*]\s+/gm, "• ");
}
function X({
  title: e,
  subtitle: l,
  extra: n
}) {
  const t = u().React, { Space: p } = u().antd;
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
      l ? t.createElement(
        "div",
        { style: { marginTop: 4, fontSize: 13, color: "#8c8c8c" } },
        l
      ) : null
    ),
    n ? t.createElement(p, null, n) : null
  );
}
function Z({
  items: e,
  max: l = 5,
  color: n = "blue",
  emptyText: t = "无"
}) {
  const p = u().React, { Tag: i } = u().antd;
  return !e || e.length === 0 ? p.createElement(
    "span",
    { style: { fontSize: 12, color: "#bfbfbf" } },
    t
  ) : p.createElement(
    "div",
    { style: { display: "flex", flexWrap: "wrap", gap: 4 } },
    ...e.slice(0, l).map(
      (g, v) => p.createElement(
        i,
        { key: v, color: n, style: { fontSize: 11, marginRight: 0 } },
        g
      )
    ),
    e.length > l ? p.createElement(
      i,
      { style: { fontSize: 11, marginRight: 0 } },
      `+${e.length - l}`
    ) : null
  );
}
function pe({
  expert: e,
  onClick: l
}) {
  const n = u().React, { Card: t, Tag: p, Badge: i, Typography: g, Spin: v } = u().antd, { Text: E } = g, { agent: S, skills: k, mcps: j, loading: I } = e, m = S.enabled, z = k.filter((b) => b.enabled !== !1).map((b) => b.name), w = j.map((b) => b.name || b.key), y = S.active_model ? `${S.active_model.provider_id}/${S.active_model.model}` : null;
  return n.createElement(
    t,
    {
      hoverable: !0,
      onClick: l,
      size: "small",
      style: {
        cursor: "pointer",
        transition: "all 0.2s ease",
        borderColor: m ? void 0 : "#d9d9d9",
        opacity: m ? 1 : 0.7
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
            E,
            { strong: !0, style: { fontSize: 15 } },
            S.name
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
            S.id
          )
        )
      ),
      n.createElement(i, {
        status: m ? "success" : "default",
        text: m ? "启用" : "停用"
      })
    ),
    // Description (rendered as markdown)
    S.description ? n.createElement(
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
      le(S.description, n)
    ) : n.createElement(
      "div",
      { style: { fontSize: 12, color: "#bfbfbf", marginBottom: 10 } },
      "暂无描述"
    ),
    // Model info
    y ? n.createElement(
      "div",
      { style: { marginBottom: 8 } },
      n.createElement(
        p,
        { color: "geekblue", style: { fontSize: 11 } },
        `🤖 ${y}`
      )
    ) : null,
    // Skills
    I ? n.createElement(v, { size: "small" }) : n.createElement(
      "div",
      { style: { marginBottom: 6 } },
      n.createElement(
        "div",
        { style: { fontSize: 11, color: "#8c8c8c", marginBottom: 4 } },
        `技能 (${z.length})`
      ),
      n.createElement(Z, {
        items: z,
        max: 4,
        color: "cyan",
        emptyText: "未配置技能"
      })
    ),
    // MCP
    !I && w.length > 0 ? n.createElement(
      "div",
      null,
      n.createElement(
        "div",
        { style: { fontSize: 11, color: "#8c8c8c", marginBottom: 4 } },
        `MCP (${w.length})`
      ),
      n.createElement(Z, {
        items: w,
        max: 3,
        color: "purple"
      })
    ) : null
  );
}
function ge({
  expert: e,
  open: l,
  onClose: n
}) {
  const t = u().React, {
    Drawer: p,
    Descriptions: i,
    Tag: g,
    Typography: v,
    Space: E,
    Button: S,
    Empty: k,
    Tabs: j,
    List: I,
    Spin: m
  } = u().antd, { Text: z, Paragraph: w } = v, { EditOutlined: y, ThunderboltOutlined: b, FileTextOutlined: P, ToolOutlined: O } = u().antdIcons || {};
  if (!e) return null;
  const { agent: f, config: d, skills: x, mcps: T, loading: B } = e, _ = x.filter((a) => a.enabled !== !1), M = (a) => {
    window.history.pushState({}, "", a), window.dispatchEvent(new PopStateEvent("popstate"));
  }, H = t.createElement(
    "div",
    null,
    t.createElement(
      i,
      { column: 1, bordered: !0, size: "small" },
      t.createElement(i.Item, { label: "专家名称" }, f.name),
      t.createElement(
        i.Item,
        { label: "专家 ID" },
        t.createElement("code", { style: { fontSize: 12 } }, f.id)
      ),
      t.createElement(
        i.Item,
        { label: "状态" },
        t.createElement(
          g,
          { color: f.enabled ? "green" : "default" },
          f.enabled ? "启用" : "停用"
        )
      ),
      t.createElement(
        i.Item,
        { label: "功能简介" },
        f.description ? le(f.description, t) : "暂无描述"
      ),
      t.createElement(
        i.Item,
        { label: "使用模型" },
        f.active_model ? `${f.active_model.provider_id} / ${f.active_model.model}` : "使用全局默认模型"
      ),
      d != null && d.workspace_dir ? t.createElement(
        i.Item,
        { label: "工作区路径" },
        t.createElement(
          "code",
          { style: { fontSize: 11 } },
          d.workspace_dir
        )
      ) : null,
      d != null && d.approval_level ? t.createElement(
        i.Item,
        { label: "审批级别" },
        d.approval_level
      ) : null
    ),
    // System prompt files
    d != null && d.system_prompt_files && d.system_prompt_files.length > 0 ? t.createElement(
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
        P ? t.createElement(P, {
          style: { fontSize: 14, color: "#1677ff" }
        }) : null,
        t.createElement(z, { strong: !0 }, "系统提示词文件")
      ),
      t.createElement(
        E,
        { wrap: !0 },
        ...d.system_prompt_files.map(
          (a, C) => t.createElement(
            g,
            {
              key: C,
              icon: P ? t.createElement(P) : void 0,
              style: { fontSize: 12 }
            },
            a
          )
        )
      )
    ) : null
  ), N = B ? t.createElement(
    "div",
    { style: { textAlign: "center", padding: 40 } },
    t.createElement(m, { size: "large" })
  ) : _.length === 0 ? t.createElement(k, {
    description: "该专家暂无已启用的技能",
    image: k.PRESENTED_IMAGE_SIMPLE
  }) : t.createElement(I, {
    dataSource: _,
    renderItem: (a) => t.createElement(
      I.Item,
      null,
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
          a.emoji ? t.createElement(
            "span",
            { style: { fontSize: 16 } },
            a.emoji
          ) : null,
          t.createElement(z, { strong: !0 }, a.name),
          a.version_text ? t.createElement(
            g,
            { style: { fontSize: 10 } },
            `v${a.version_text}`
          ) : null
        ),
        a.description ? t.createElement(
          w,
          {
            type: "secondary",
            style: { fontSize: 12, margin: 0 },
            ellipsis: { rows: 2 }
          },
          a.description
        ) : null,
        a.tags && a.tags.length > 0 ? t.createElement(
          "div",
          { style: { marginTop: 4 } },
          ...a.tags.map(
            (C, L) => t.createElement(
              g,
              { key: L, color: "cyan", style: { fontSize: 10 } },
              C
            )
          )
        ) : null
      )
    )
  }), G = B ? t.createElement(
    "div",
    { style: { textAlign: "center", padding: 40 } },
    t.createElement(m, { size: "large" })
  ) : T.length === 0 ? t.createElement(k, {
    description: "该专家暂无关联的 MCP 客户端",
    image: k.PRESENTED_IMAGE_SIMPLE
  }) : t.createElement(I, {
    dataSource: T,
    renderItem: (a) => t.createElement(
      I.Item,
      null,
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
            z,
            { strong: !0 },
            a.name || a.key
          ),
          t.createElement(
            g,
            {
              color: a.enabled ? "green" : "default",
              style: { fontSize: 10 }
            },
            a.enabled ? "启用" : "停用"
          ),
          t.createElement(
            g,
            { color: "purple", style: { fontSize: 10 } },
            a.transport
          )
        ),
        a.description ? t.createElement(
          w,
          {
            type: "secondary",
            style: { fontSize: 12, margin: 0 },
            ellipsis: { rows: 2 }
          },
          a.description
        ) : null,
        a.tools && a.tools.length > 0 ? t.createElement(
          "div",
          {
            style: {
              marginTop: 4,
              fontSize: 11,
              color: "#8c8c8c"
            }
          },
          `提供 ${a.tools.length} 个工具`
        ) : null
      )
    )
  }), c = d != null && d.tools ? t.createElement(
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
        O ? t.createElement(O, {
          style: { fontSize: 14, color: "#1677ff" }
        }) : null,
        t.createElement(z, { strong: !0 }, "工具配置")
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
        JSON.stringify(d.tools, null, 2)
      )
    )
  ) : t.createElement(k, {
    description: "暂无工具配置",
    image: k.PRESENTED_IMAGE_SIMPLE
  }), s = [
    { key: "basic", label: "基本信息", children: H },
    {
      key: "skills",
      label: `技能 (${_.length})`,
      children: N
    },
    { key: "mcp", label: `MCP (${T.length})`, children: G },
    { key: "tools", label: "工具配置", children: c }
  ];
  return t.createElement(
    p,
    {
      title: t.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 8 } },
        t.createElement("span", { style: { fontSize: 20 } }, "🧑‍🔬"),
        t.createElement("span", null, f.name)
      ),
      open: l,
      onClose: n,
      width: 560,
      extra: t.createElement(
        E,
        null,
        t.createElement(
          S,
          {
            size: "small",
            icon: y ? t.createElement(y) : void 0,
            onClick: () => M("/agents")
          },
          "编辑专家"
        ),
        t.createElement(
          S,
          {
            type: "primary",
            size: "small",
            icon: b ? t.createElement(b) : void 0,
            onClick: () => {
              try {
                const a = u();
                a.setSelectedAgent && a.setSelectedAgent(f.id);
              } catch (a) {
                console.warn("[ugsci] Failed to set selected agent:", a);
              }
              M("/chat");
            }
          },
          "开始对话"
        )
      )
    },
    t.createElement(j, {
      items: s,
      defaultActiveKey: "basic"
    })
  );
}
function Ee() {
  const e = u().React, { useState: l, useEffect: n, useCallback: t, useMemo: p } = e, {
    Spin: i,
    Empty: g,
    Input: v,
    Button: E,
    message: S,
    Row: k,
    Col: j
  } = u().antd, { ReloadOutlined: I, PlusOutlined: m, SearchOutlined: z } = u().antdIcons || {}, [w, y] = l([]), [b, P] = l(!0), [O, f] = l(!1), [d, x] = l(null), [T, B] = l(""), _ = t(async () => {
    P(!0);
    try {
      const s = await te(), a = await ne().catch(
        () => []
      ), C = await Promise.all(
        s.map(async (L) => {
          try {
            const [F, h] = await Promise.all([
              ie(L.id).catch(() => null),
              ce(L.id).catch(() => [])
            ]), o = ue(F == null ? void 0 : F.mcp), $ = a.filter(
              (D) => o.includes(D.key) || o.includes(D.name)
            );
            return {
              agent: L,
              config: F,
              skills: h,
              mcps: $,
              loading: !1
            };
          } catch {
            return {
              agent: L,
              config: null,
              skills: [],
              mcps: [],
              loading: !1
            };
          }
        })
      );
      y(C);
    } catch (s) {
      S.error(s.message || "加载专家列表失败"), y([]);
    } finally {
      P(!1);
    }
  }, []);
  n(() => {
    _();
  }, [_]);
  const M = t((s) => {
    x(s), f(!0);
  }, []), H = p(() => {
    if (!T.trim()) return w;
    const s = T.toLowerCase();
    return w.filter(
      (a) => {
        var C;
        return a.agent.name.toLowerCase().includes(s) || ((C = a.agent.description) == null ? void 0 : C.toLowerCase().includes(s)) || a.agent.id.toLowerCase().includes(s) || a.skills.some((L) => L.name.toLowerCase().includes(s));
      }
    );
  }, [w, T]), N = w.filter((s) => s.agent.enabled).length, G = w.reduce(
    (s, a) => s + a.skills.filter((C) => C.enabled !== !1).length,
    0
  ), c = w.reduce((s, a) => s + a.mcps.length, 0);
  return e.createElement(
    "div",
    { style: { padding: 24 } },
    e.createElement(X, {
      title: "专家中心",
      subtitle: `共 ${w.length} 位专家（${N} 位启用）· ${G} 个技能 · ${c} 个 MCP 客户端`,
      extra: e.createElement(
        e.Fragment,
        null,
        e.createElement(
          E,
          {
            icon: I ? e.createElement(I) : void 0,
            onClick: _,
            loading: b
          },
          "刷新"
        ),
        e.createElement(
          E,
          {
            type: "primary",
            icon: m ? e.createElement(m) : void 0,
            onClick: () => {
              window.history.pushState({}, "", "/agents"), window.dispatchEvent(new PopStateEvent("popstate"));
            }
          },
          "创建专家"
        )
      )
    }),
    // Search bar
    e.createElement(
      "div",
      { style: { marginBottom: 16 } },
      e.createElement(v, {
        placeholder: "搜索专家名称、描述或技能...",
        prefix: z ? e.createElement(z) : void 0,
        value: T,
        onChange: (s) => B(s.target.value),
        allowClear: !0,
        style: { maxWidth: 400 }
      })
    ),
    // Content
    b ? e.createElement(
      "div",
      { style: { textAlign: "center", padding: 60 } },
      e.createElement(i, { size: "large" })
    ) : H.length === 0 ? e.createElement(g, {
      description: T ? "未找到匹配的专家" : "暂无专家，点击「创建专家」添加"
    }) : e.createElement(
      k,
      { gutter: [12, 12] },
      ...H.map(
        (s) => e.createElement(
          j,
          { key: s.agent.id, xs: 24, sm: 12, md: 8, lg: 6 },
          e.createElement(pe, {
            expert: s,
            onClick: () => M(s)
          })
        )
      )
    ),
    // Drawer
    e.createElement(ge, {
      expert: d,
      open: O,
      onClose: () => f(!1)
    })
  );
}
function ye({
  mcp: e,
  onClick: l
}) {
  const n = u().React, { Card: t, Tag: p, Badge: i, Typography: g } = u().antd, { Text: v } = g, E = {
    stdio: "💻",
    streamable_http: "🌐",
    sse: "📡"
  };
  return n.createElement(
    t,
    {
      hoverable: !0,
      onClick: l,
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
          E[e.transport] || "🔌"
        ),
        n.createElement(
          v,
          { strong: !0, style: { fontSize: 14 } },
          e.name || e.key
        )
      ),
      n.createElement(i, {
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
        p,
        { color: "purple", style: { fontSize: 11 } },
        e.transport
      ),
      e.tools && e.tools.length > 0 ? n.createElement(
        p,
        { color: "blue", style: { fontSize: 11 } },
        `${e.tools.length} 个工具`
      ) : n.createElement(p, { style: { fontSize: 11 } }, "全部工具"),
      e.url ? n.createElement(
        p,
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
function fe() {
  const e = u().React, { useState: l, useEffect: n, useCallback: t, useMemo: p } = e, {
    Spin: i,
    Empty: g,
    Input: v,
    Button: E,
    message: S,
    Row: k,
    Col: j,
    Drawer: I,
    Descriptions: m,
    Tag: z,
    Typography: w,
    List: y
  } = u().antd, { ReloadOutlined: b, PlusOutlined: P, SearchOutlined: O, ApiOutlined: f } = u().antdIcons || {}, { Text: d } = w, [x, T] = l([]), [B, _] = l(!0), [M, H] = l(""), [N, G] = l(!1), [c, s] = l(null), a = t(async () => {
    _(!0);
    try {
      const o = await ne();
      T(o);
    } catch (o) {
      S.error(o.message || "加载能力列表失败"), T([]);
    } finally {
      _(!1);
    }
  }, []);
  n(() => {
    a();
  }, [a]);
  const C = p(() => {
    if (!M.trim()) return x;
    const o = M.toLowerCase();
    return x.filter(
      ($) => {
        var D;
        return $.name.toLowerCase().includes(o) || $.key.toLowerCase().includes(o) || ((D = $.description) == null ? void 0 : D.toLowerCase().includes(o)) || $.transport.toLowerCase().includes(o);
      }
    );
  }, [x, M]), L = x.filter((o) => o.enabled).length, F = x.reduce((o, $) => {
    var D;
    return o + (((D = $.tools) == null ? void 0 : D.length) || 0);
  }, 0), h = (o) => {
    window.history.pushState({}, "", o), window.dispatchEvent(new PopStateEvent("popstate"));
  };
  return e.createElement(
    "div",
    { style: { padding: 24 } },
    e.createElement(X, {
      title: "能力中心",
      subtitle: `共 ${x.length} 个 MCP 客户端（${L} 个启用）· ${F} 个工具`,
      extra: e.createElement(
        e.Fragment,
        null,
        e.createElement(
          E,
          {
            icon: b ? e.createElement(b) : void 0,
            onClick: a,
            loading: B
          },
          "刷新"
        ),
        e.createElement(
          E,
          {
            type: "primary",
            icon: P ? e.createElement(P) : void 0,
            onClick: () => h("/mcp")
          },
          "管理 MCP"
        )
      )
    }),
    e.createElement(
      "div",
      { style: { marginBottom: 16 } },
      e.createElement(v, {
        placeholder: "搜索能力名称、描述...",
        prefix: O ? e.createElement(O) : void 0,
        value: M,
        onChange: (o) => H(o.target.value),
        allowClear: !0,
        style: { maxWidth: 400 }
      })
    ),
    B ? e.createElement(
      "div",
      { style: { textAlign: "center", padding: 60 } },
      e.createElement(i, { size: "large" })
    ) : C.length === 0 ? e.createElement(g, {
      description: M ? "未找到匹配的能力" : "暂无 MCP 客户端，点击「管理 MCP」添加"
    }) : e.createElement(
      k,
      { gutter: [12, 12] },
      ...C.map(
        (o) => e.createElement(
          j,
          { key: o.key, xs: 24, sm: 12, md: 8, lg: 6 },
          e.createElement(ye, {
            mcp: o,
            onClick: () => {
              s(o), G(!0);
            }
          })
        )
      )
    ),
    // Detail drawer
    c ? e.createElement(
      I,
      {
        title: e.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 8 } },
          e.createElement("span", { style: { fontSize: 18 } }, "🔌"),
          e.createElement(
            "span",
            null,
            c.name || c.key
          )
        ),
        open: N,
        onClose: () => G(!1),
        width: 480
      },
      e.createElement(
        m,
        { column: 1, bordered: !0, size: "small" },
        e.createElement(
          m.Item,
          { label: "Key" },
          e.createElement(
            "code",
            { style: { fontSize: 12 } },
            c.key
          )
        ),
        e.createElement(
          m.Item,
          { label: "名称" },
          c.name || "-"
        ),
        e.createElement(
          m.Item,
          { label: "描述" },
          c.description || "-"
        ),
        e.createElement(
          m.Item,
          { label: "状态" },
          e.createElement(
            z,
            { color: c.enabled ? "green" : "default" },
            c.enabled ? "启用" : "停用"
          )
        ),
        e.createElement(
          m.Item,
          { label: "传输方式" },
          c.transport
        ),
        c.url ? e.createElement(
          m.Item,
          { label: "URL" },
          c.url
        ) : null,
        c.command ? e.createElement(
          m.Item,
          { label: "命令" },
          e.createElement(
            "code",
            { style: { fontSize: 11 } },
            c.command
          )
        ) : null,
        c.args && c.args.length > 0 ? e.createElement(
          m.Item,
          { label: "参数" },
          c.args.join(" ")
        ) : null
      ),
      c.tools && c.tools.length > 0 ? e.createElement(
        "div",
        { style: { marginTop: 16 } },
        e.createElement(
          d,
          {
            strong: !0,
            style: { display: "block", marginBottom: 8 }
          },
          "提供的工具"
        ),
        e.createElement(y, {
          size: "small",
          dataSource: c.tools,
          renderItem: (o) => e.createElement(
            y.Item,
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
              f ? e.createElement(f, {
                style: { fontSize: 12, color: "#1677ff" }
              }) : null,
              e.createElement(
                d,
                { style: { fontSize: 12 } },
                o
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
function he() {
  const e = u().React, { useState: l, useEffect: n, useCallback: t, useMemo: p } = e, {
    Spin: i,
    Empty: g,
    Input: v,
    Button: E,
    message: S,
    Row: k,
    Col: j,
    Card: I,
    Tag: m,
    Typography: z,
    Drawer: w,
    Descriptions: y,
    List: b
  } = u().antd, {
    ReloadOutlined: P,
    SearchOutlined: O,
    DownloadOutlined: f,
    ThunderboltOutlined: d
  } = u().antdIcons || {}, { Text: x, Paragraph: T } = z, [B, _] = l([]), [M, H] = l([]), [N, G] = l([]), [c, s] = l(!0), [a, C] = l(""), [L, F] = l(!1), [h, o] = l(null), [$, D] = l([]), K = t(async () => {
    s(!0);
    try {
      const [r, R, A] = await Promise.all([
        me(),
        te(),
        de()
      ]);
      _(r), G(R), H(A);
    } catch (r) {
      S.error(r.message || "加载技能列表失败"), _([]);
    } finally {
      s(!1);
    }
  }, []);
  n(() => {
    K();
  }, [K]);
  const V = p(() => {
    if (!a.trim()) return B;
    const r = a.toLowerCase();
    return B.filter(
      (R) => {
        var A, W;
        return R.name.toLowerCase().includes(r) || ((A = R.description) == null ? void 0 : A.toLowerCase().includes(r)) || ((W = R.tags) == null ? void 0 : W.some((Q) => Q.toLowerCase().includes(r)));
      }
    );
  }, [B, a]), ae = t(
    (r) => {
      const R = [];
      for (const A of M)
        if (A.skills.some((W) => W.name === r)) {
          const W = N.find((Q) => Q.id === A.agent_id);
          R.push((W == null ? void 0 : W.name) || A.agent_name || A.agent_id);
        }
      return R;
    },
    [M, N]
  ), Y = (r) => {
    window.history.pushState({}, "", r), window.dispatchEvent(new PopStateEvent("popstate"));
  };
  return e.createElement(
    "div",
    { style: { padding: 24 } },
    e.createElement(X, {
      title: "技能中心",
      subtitle: `技能池共 ${B.length} 个技能`,
      extra: e.createElement(
        e.Fragment,
        null,
        e.createElement(
          E,
          {
            icon: P ? e.createElement(P) : void 0,
            onClick: K,
            loading: c
          },
          "刷新"
        ),
        e.createElement(
          E,
          {
            type: "primary",
            icon: f ? e.createElement(f) : void 0,
            onClick: () => Y("/skill-pool")
          },
          "管理技能池"
        )
      )
    }),
    e.createElement(
      "div",
      { style: { marginBottom: 16 } },
      e.createElement(v, {
        placeholder: "搜索技能名称、描述或标签...",
        prefix: O ? e.createElement(O) : void 0,
        value: a,
        onChange: (r) => C(r.target.value),
        allowClear: !0,
        style: { maxWidth: 400 }
      })
    ),
    c ? e.createElement(
      "div",
      { style: { textAlign: "center", padding: 60 } },
      e.createElement(i, { size: "large" })
    ) : V.length === 0 ? e.createElement(g, {
      description: a ? "未找到匹配的技能" : "技能池为空"
    }) : e.createElement(
      k,
      { gutter: [12, 12] },
      ...V.map(
        (r) => {
          var R;
          return e.createElement(
            j,
            { key: r.name, xs: 24, sm: 12, md: 8, lg: 6 },
            e.createElement(
              I,
              {
                hoverable: !0,
                size: "small",
                style: { cursor: "pointer", height: "100%" },
                onClick: () => {
                  o(r), D(ae(r.name)), F(!0);
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
                r.emoji ? e.createElement(
                  "span",
                  { style: { fontSize: 18 } },
                  r.emoji
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
                  r.name
                ),
                r.protected ? e.createElement(
                  m,
                  { color: "gold", style: { fontSize: 10 } },
                  "内置"
                ) : null
              ),
              r.description ? e.createElement(
                T,
                {
                  type: "secondary",
                  style: { fontSize: 11, margin: 0, lineHeight: 1.4 },
                  ellipsis: { rows: 2 }
                },
                r.description
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
                r.version_text ? e.createElement(
                  m,
                  { style: { fontSize: 10 } },
                  `v${r.version_text}`
                ) : null,
                ...(R = r.tags) == null ? void 0 : R.slice(0, 3).map(
                  (A, W) => e.createElement(
                    m,
                    { key: W, color: "cyan", style: { fontSize: 10 } },
                    A
                  )
                )
              )
            )
          );
        }
      )
    ),
    // Skill detail drawer
    h ? e.createElement(
      w,
      {
        title: e.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 8 } },
          e.createElement(
            "span",
            { style: { fontSize: 18 } },
            h.emoji || "⚡"
          ),
          e.createElement("span", null, h.name)
        ),
        open: L,
        onClose: () => F(!1),
        width: 520,
        extra: e.createElement(
          E,
          {
            type: "primary",
            size: "small",
            icon: d ? e.createElement(d) : void 0,
            onClick: () => Y("/skills")
          },
          "管理技能"
        )
      },
      e.createElement(
        y,
        { column: 1, bordered: !0, size: "small" },
        e.createElement(
          y.Item,
          { label: "技能名称" },
          h.name
        ),
        e.createElement(
          y.Item,
          { label: "描述" },
          h.description || "-"
        ),
        h.version_text ? e.createElement(
          y.Item,
          { label: "版本" },
          h.version_text
        ) : null,
        e.createElement(
          y.Item,
          { label: "来源" },
          h.source || "-"
        ),
        e.createElement(
          y.Item,
          { label: "受保护" },
          h.protected ? "是（内置）" : "否"
        ),
        h.sync_status ? e.createElement(
          y.Item,
          { label: "同步状态" },
          h.sync_status
        ) : null,
        h.installed_from ? e.createElement(
          y.Item,
          { label: "安装来源" },
          h.installed_from
        ) : null
      ),
      // Tags
      h.tags && h.tags.length > 0 ? e.createElement(
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
          ...h.tags.map(
            (r, R) => e.createElement(m, { key: R, color: "cyan" }, r)
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
          `已安装此技能的专家 (${$.length})`
        ),
        $.length > 0 ? e.createElement(b, {
          size: "small",
          dataSource: $,
          renderItem: (r) => e.createElement(
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
              e.createElement("span", null, "🧑‍🔬"),
              e.createElement(
                x,
                { style: { fontSize: 13 } },
                r
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
function ve() {
  var p;
  const e = window.QwenPaw;
  if (!(e != null && e.menu) || !(e != null && e.route)) {
    console.warn(
      "[ugsci] QwenPaw.menu/route API not available — plugin disabled"
    );
    return;
  }
  const l = u().React, n = "ugsci";
  e.route.add(n, {
    id: "ugsci.experts",
    path: "/ugsci-experts",
    component: Ee
  }), e.menu.add(n, {
    id: "ugsci.experts",
    location: "primary.agentScoped",
    label: () => "专家中心",
    icon: l.createElement("span", { style: { fontSize: 16 } }, "🧑‍🔬"),
    route: "ugsci.experts",
    order: 5,
    visible: () => q()
  }), e.route.add(n, {
    id: "ugsci.capabilities",
    path: "/ugsci-capabilities",
    component: fe
  }), e.menu.add(n, {
    id: "ugsci.capabilities",
    location: "primary.agentScoped",
    label: () => "能力中心",
    icon: l.createElement("span", { style: { fontSize: 16 } }, "🔌"),
    route: "ugsci.capabilities",
    order: 6,
    visible: () => q()
  }), e.route.add(n, {
    id: "ugsci.skills-center",
    path: "/ugsci-skills",
    component: he
  }), e.menu.add(n, {
    id: "ugsci.skills-center",
    location: "primary.agentScoped",
    label: () => "技能中心",
    icon: l.createElement("span", { style: { fontSize: 16 } }, "⚡"),
    route: "ugsci.skills-center",
    order: 7,
    visible: () => q()
  }), (p = e.sidebar) != null && p.registerSimpleModeItems ? (e.sidebar.registerSimpleModeItems([
    "ugsci.experts",
    "ugsci.capabilities",
    "ugsci.skills-center"
  ]), console.info("[ugsci] Registered 3 items for simple-mode visibility")) : console.warn(
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
  for (const i of t) {
    try {
      const v = e.menu.snapshot("primary.agentScoped").find((E) => E.id === i);
      v && e.menu.replace(n, i, {
        ...v,
        visible: () => !q()
      });
    } catch {
    }
    try {
      const v = e.menu.snapshot("primary.settings").find((E) => E.id === i);
      v && e.menu.replace(n, i, {
        ...v,
        visible: () => !q()
      });
    } catch {
    }
  }
  console.info(
    "[ugsci] Plugin registered: 3 routes + menu items, simple-mode whitelist + simplified navigation active"
  );
}
function J() {
  try {
    ve();
  } catch (e) {
    console.error("[ugsci] Failed to build plugin:", e), setTimeout(J, 500);
  }
}
var ee;
if ((ee = window.QwenPaw) != null && ee.host)
  J();
else {
  const e = setInterval(() => {
    var l;
    (l = window.QwenPaw) != null && l.host && (clearInterval(e), J());
  }, 200);
  setTimeout(() => clearInterval(e), 1e4);
}
