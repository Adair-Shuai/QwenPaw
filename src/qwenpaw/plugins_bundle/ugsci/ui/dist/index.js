function P() {
  var t;
  const e = (t = window.QwenPaw) == null ? void 0 : t.host;
  if (!e) throw new Error("[ugsci] QwenPaw.host not available");
  return e;
}
function $a() {
  try {
    return P().getApiToken() || "";
  } catch {
    return "";
  }
}
function Ne(e) {
  return P().getApiUrl(e);
}
function Ct(e) {
  const t = $a();
  return {
    "Content-Type": "application/json",
    ...t ? { Authorization: `Bearer ${t}` } : {},
    ...e
  };
}
const ct = /* @__PURE__ */ new Map(), Ma = 15e3;
function Ra(e) {
  return e ? e instanceof Headers ? e.get("X-Agent-Id") || e.get("x-agent-id") || "" : e["X-Agent-Id"] || e["x-agent-id"] || "" : "";
}
function La(e, t, l) {
  return `${e}:${t}:${l}`;
}
function tt() {
  ct.clear();
}
function Tt(e) {
  for (const [t, l] of ct)
    (e ? l.agentId === e : l.agentId) && ct.delete(t);
}
async function re(e, t) {
  const l = ((t == null ? void 0 : t.method) || "GET").toUpperCase(), { bypassCache: a, ...n } = t || {}, s = Ra(
    n.headers
  ), o = La(l, e, s);
  if (l !== "GET" && (s ? Tt(s) : tt()), l === "GET" && !a) {
    const c = ct.get(o);
    if (c && Date.now() - c.ts < Ma)
      return c.data;
  }
  const r = await fetch(Ne(e), {
    ...n,
    headers: { ...Ct(), ...n.headers || {} }
  });
  if (!r.ok) {
    const c = await r.text().catch(() => "");
    throw new Error(c || `HTTP ${r.status}`);
  }
  if (r.status === 204) return null;
  const d = await r.json();
  return l === "GET" && ct.set(o, {
    data: d,
    ts: Date.now(),
    agentId: s || void 0
  }), d;
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
function zt(e, t) {
  const l = P();
  return l.ReactMarkdown && l.remarkGfm ? t.createElement(
    l.ReactMarkdown,
    { remarkPlugins: [l.remarkGfm] },
    e
  ) : e.replace(/\*\*(.+?)\*\*/g, "$1").replace(/\*(.+?)\*/g, "$1").replace(/`(.+?)`/g, "$1").replace(/^#+\s*/gm, "").replace(/^[-*]\s+/gm, "• ");
}
function It({
  title: e,
  subtitle: t,
  extra: l
}) {
  const a = P().React, { Space: n } = P().antd;
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
async function Gt() {
  const e = await re("/agents");
  return (e == null ? void 0 : e.agents) || [];
}
async function Ht(e) {
  return re(
    `/agents/${encodeURIComponent(e)}`
  );
}
async function Ot(e) {
  return await re("/skills", {
    headers: { "X-Agent-Id": e }
  }) || [];
}
async function Wt(e = !1) {
  return await re(`/skills/pool${e ? "?summary=true" : ""}`) || [];
}
async function ja(e) {
  const t = await re(
    `/skills/pool/${encodeURIComponent(e)}/content`
  );
  return (t == null ? void 0 : t.content) || "";
}
async function Ba() {
  return await re(
    "/skills/workspaces"
  ) || [];
}
async function Ua(e) {
  return await re("/mcp", {
    headers: { "X-Agent-Id": e }
  }) || [];
}
async function Na(e, t) {
  return re(
    `/mcp/toggle/${encodeURIComponent(t)}`,
    {
      method: "PATCH",
      headers: { "X-Agent-Id": e }
    }
  );
}
async function Da(e, t) {
  await re(`/mcp/${encodeURIComponent(t)}`, {
    method: "DELETE",
    headers: { "X-Agent-Id": e }
  });
}
async function Fa(e, t, l) {
  return re("/mcp", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify({ client_key: t, client: l })
  });
}
async function Ga(e, t, l) {
  return re(
    `/mcp/${encodeURIComponent(t)}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json", "X-Agent-Id": e },
      body: JSON.stringify(l)
    }
  );
}
async function Ha(e, t) {
  return await re(
    `/mcp/tools/${encodeURIComponent(t)}`,
    { headers: { "X-Agent-Id": e } }
  ) || [];
}
async function Wa(e, t) {
  return re(
    `/mcp/policy/${encodeURIComponent(t)}`,
    { headers: { "X-Agent-Id": e } }
  );
}
async function Ja(e, t, l) {
  return re(
    `/mcp/policy/${encodeURIComponent(t)}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json", "X-Agent-Id": e },
      body: JSON.stringify(l)
    }
  );
}
async function Xa(e) {
  return await re(
    "/mcp/access-principals",
    { headers: { "X-Agent-Id": e } }
  ) || [];
}
async function Ka(e, t, l) {
  return re(
    `/mcp/oauth/start/${encodeURIComponent(t)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Agent-Id": e },
      body: JSON.stringify(l)
    }
  );
}
async function qa(e, t) {
  return re(`/mcp/oauth/status/${encodeURIComponent(t)}`, {
    headers: { "X-Agent-Id": e }
  });
}
async function Va(e, t) {
  await re(
    `/mcp/oauth/${encodeURIComponent(t)}`,
    {
      method: "DELETE",
      headers: { "X-Agent-Id": e }
    }
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
    let o = n;
    if (o = o.replace(/\*\*(.+?)\*\*/g, "$1").replace(/\*(.+?)\*/g, "$1").replace(/`(.+?)`/g, "$1").replace(/^#+\s*/gm, "").trim(), /^(用于|帮助|提供|支持|实现|完成|分析|计算|生成|创建|检查)/.test(o) ? o = `请${o}` : /^(a |an |the )/i.test(o) ? o = `Help me with ${o}` : /[。？！.?!]$/.test(o) || (o = `帮我${o}`), o.length > 80 && (o = o.substring(0, 77) + "..."), t.push({ label: s, value: o }), t.length >= 4) break;
  }
  return t;
}
async function Ya(e) {
  return await re("/workspace/files", {
    headers: { "X-Agent-Id": e }
  }) || [];
}
async function xt(e, t, l) {
  return re(`/workspace/files/${encodeURIComponent(t)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify({ content: l })
  });
}
async function Qa(e, t, l, a) {
  return re("/workspace/prompt-files", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify({ filename: t, content: l, enable: a })
  });
}
const Za = /* @__PURE__ */ new Set([
  "CON",
  "PRN",
  "AUX",
  "NUL",
  ...Array.from({ length: 9 }, (e, t) => `COM${t + 1}`),
  ...Array.from({ length: 9 }, (e, t) => `LPT${t + 1}`)
]);
function el(e) {
  let t = e.trim();
  if (!t) throw new Error("请输入文件名");
  if (/[\\/]/.test(t)) throw new Error("文件名不能包含路径分隔符");
  if (/[<>:\"|?*\u0000-\u001f]/.test(t))
    throw new Error("文件名包含系统不支持的字符");
  if (/[ .]$/.test(t)) throw new Error("文件名不能以空格或句点结尾");
  t.toLowerCase().endsWith(".md") ? t = `${t.slice(0, -3)}.md` : t += ".md";
  const l = t.split(".", 1)[0].toUpperCase();
  if (!t.slice(0, -3)) throw new Error("文件名不能为空");
  if (Za.has(l))
    throw new Error("该文件名是系统保留名称，请更换");
  if (new TextEncoder().encode(t).length > 255)
    throw new Error("文件名过长");
  return t;
}
async function tl(e, t) {
  const l = await Ht(e);
  l.system_prompt_files = t, await re(`/agents/${encodeURIComponent(e)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(l)
  });
}
async function Jt(e, t) {
  await re("/skills/pool/download", {
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
  await re(`/skills/${encodeURIComponent(t)}/enable`, {
    method: "POST",
    headers: { "X-Agent-Id": e }
  });
}
async function Xt(e, t) {
  await re(`/skills/${encodeURIComponent(t)}`, {
    method: "DELETE",
    headers: { "X-Agent-Id": e }
  });
}
async function nl(e, t) {
  return re("/skills/batch-enable", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify(t)
  });
}
async function al(e, t) {
  return re("/skills/batch-disable", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify(t)
  });
}
async function ll(e, t) {
  return re("/skills/batch-delete", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify(t)
  });
}
async function Kt(e) {
  return await re("/mcp", {
    headers: { "X-Agent-Id": e }
  }) || [];
}
async function Fn(e, t) {
  await re(`/mcp/${encodeURIComponent(t)}`, {
    method: "DELETE",
    headers: { "X-Agent-Id": e }
  });
}
async function Gn(e, t) {
  return re("/mcp", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify(t)
  });
}
async function sl(e, t) {
  return re(
    `/mcp/toggle/${encodeURIComponent(t)}`,
    {
      method: "PATCH",
      headers: { "X-Agent-Id": e }
    }
  );
}
async function Hn(e, t) {
  await re(`/skills/${encodeURIComponent(t)}/disable`, {
    method: "POST",
    headers: { "X-Agent-Id": e }
  });
}
async function rl(e) {
  await re(`/skills/pool/${encodeURIComponent(e)}`, {
    method: "DELETE"
  });
}
function ol(e) {
  const t = (e || "").trim();
  if (!t) return { number: 6, unit: "h" };
  const l = t.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/i);
  if (!l) return { number: 6, unit: "h" };
  const a = parseInt(l[1] || "0", 10), n = parseInt(l[2] || "0", 10), s = parseInt(l[3] || "0", 10), o = a * 60 + n + Math.round(s / 60);
  return o <= 0 ? { number: 6, unit: "h" } : o >= 60 && o % 60 === 0 ? { number: o / 60, unit: "h" } : { number: o, unit: "m" };
}
function il(e) {
  return e.unit === "h" ? `${e.number}h` : `${e.number}m`;
}
async function cl(e) {
  return re("/config/heartbeat", {
    headers: { "X-Agent-Id": e }
  });
}
async function ml(e, t) {
  return re("/config/heartbeat", {
    method: "PUT",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify(t)
  });
}
async function dl(e) {
  await re("/config/heartbeat/run", {
    method: "POST",
    headers: { "X-Agent-Id": e }
  });
}
async function ul(e) {
  return re("/workspace/running-config", {
    headers: { "X-Agent-Id": e }
  });
}
async function pl(e, t) {
  return re("/workspace/running-config", {
    method: "PUT",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify(t)
  });
}
async function gl(e) {
  return (await re("/workspace/language", {
    headers: { "X-Agent-Id": e }
  })).language || "zh";
}
async function fl(e, t) {
  await re("/workspace/language", {
    method: "PUT",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify({ language: t })
  });
}
async function yl() {
  return (await re("/config/user-timezone")).timezone || "UTC";
}
async function El(e) {
  await re("/config/user-timezone", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ timezone: e })
  });
}
async function hl(e) {
  return await re("/workspace/system-prompt-files", {
    headers: { "X-Agent-Id": e }
  }) || [];
}
const kn = ["AGENTS.md", "SOUL.md", "PROFILE.md"];
function _n({
  items: e,
  max: t = 5,
  color: l = "blue",
  emptyText: a = "无"
}) {
  const n = P().React, { Tag: s } = P().antd;
  return !e || e.length === 0 ? n.createElement(
    "span",
    { style: { fontSize: 12, color: "#bfbfbf" } },
    a
  ) : n.createElement(
    "div",
    { style: { display: "flex", flexWrap: "wrap", gap: 4 } },
    ...e.slice(0, t).map(
      (o, r) => n.createElement(
        s,
        { key: r, color: l, style: { fontSize: 11, marginRight: 0 } },
        o
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
  const o = P().React, { useState: r, useEffect: d, useMemo: c } = o, { Modal: f, Button: C, Empty: w, Spin: b, Input: v, Tag: E, Tooltip: x, Typography: j } = P().antd, { CheckOutlined: B, SearchOutlined: U } = P().antdIcons || {}, { Text: Z } = j, [H, J] = r([]), [T, k] = r("");
  d(() => {
    e && (J([]), k(""));
  }, [e]);
  const I = c(() => {
    if (!T.trim()) return l;
    const h = T.toLowerCase();
    return l.filter(
      (g) => {
        var R, X;
        return g.name.toLowerCase().includes(h) || ((R = g.description) == null ? void 0 : R.toLowerCase().includes(h)) || ((X = g.tags) == null ? void 0 : X.some((G) => G.toLowerCase().includes(h)));
      }
    );
  }, [l, T]), V = I.filter(
    (h) => !a.includes(h.name)
  ), F = (h) => {
    J(
      (g) => g.includes(h) ? g.filter((R) => R !== h) : [...g, h]
    );
  }, $ = async () => {
    H.length !== 0 && (await s(H), J([]));
  };
  return o.createElement(
    f,
    {
      open: e,
      onCancel: t,
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
          Z,
          { type: "secondary", style: { fontSize: 13 } },
          `已选择 ${H.length} 个技能`
        ),
        o.createElement(
          "div",
          { style: { display: "flex", gap: 8 } },
          o.createElement(C, { onClick: t }, "取消"),
          o.createElement(
            C,
            {
              type: "primary",
              onClick: $,
              disabled: H.length === 0
            },
            H.length > 0 ? `添加 (${H.length})` : "添加"
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
      o.createElement(v, {
        placeholder: "搜索技能名称、描述或标签...",
        prefix: U ? o.createElement(U) : void 0,
        value: T,
        onChange: (h) => k(h.target.value),
        allowClear: !0,
        style: { flex: 1 }
      }),
      o.createElement(
        C,
        {
          size: "small",
          type: "primary",
          onClick: () => J(V.map((h) => h.name))
        },
        "全选"
      ),
      o.createElement(
        C,
        {
          size: "small",
          onClick: () => J([])
        },
        "清空"
      )
    ),
    // Skill grid (card style matching Skill Center)
    n ? o.createElement(
      "div",
      { style: { textAlign: "center", padding: 40 } },
      o.createElement(b, { size: "large" })
    ) : I.length === 0 ? o.createElement(w, {
      description: T ? "未找到匹配的技能" : "技能池暂无可用技能",
      image: w.PRESENTED_IMAGE_SIMPLE
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
      ...I.map((h) => {
        const g = H.includes(h.name), R = a.includes(h.name);
        return o.createElement(
          "div",
          {
            key: h.name,
            onClick: () => !R && F(h.name),
            style: {
              position: "relative",
              padding: "10px 12px",
              border: `1px solid ${g ? "#0072f5" : "#e8e8e8"}`,
              borderRadius: 6,
              cursor: R ? "not-allowed" : "pointer",
              transition: "all 0.15s ease",
              background: g ? "rgba(0, 114, 245, 0.06)" : R ? "#fafafa" : "#fff",
              opacity: R ? 0.5 : 1,
              minHeight: 64
            }
          },
          g ? o.createElement(
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
          R ? o.createElement(
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
                paddingRight: R || g ? 24 : 0
              }
            },
            o.createElement(
              "span",
              { style: { fontSize: 16 } },
              h.emoji || "⚡"
            ),
            o.createElement(
              x,
              { title: h.name },
              o.createElement(
                Z,
                {
                  strong: !0,
                  style: {
                    fontSize: 13,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap"
                  }
                },
                h.name
              )
            )
          ),
          h.description ? o.createElement(
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
            h.description
          ) : null,
          h.tags && h.tags.length > 0 ? o.createElement(
            "div",
            {
              style: {
                marginTop: 4,
                display: "flex",
                gap: 2,
                flexWrap: "wrap"
              }
            },
            ...h.tags.slice(0, 2).map(
              (X, G) => o.createElement(
                E,
                {
                  key: G,
                  color: "cyan",
                  style: { fontSize: 10, marginRight: 0 }
                },
                X
              )
            )
          ) : null
        );
      })
    )
  );
}
function Jn({
  agentId: e,
  systemPromptFiles: t,
  onRefresh: l
}) {
  const a = P().React, { useState: n, useEffect: s, useCallback: o, useRef: r } = a, {
    List: d,
    Tag: c,
    Switch: f,
    Button: C,
    Modal: w,
    Input: b,
    Spin: v,
    Empty: E,
    message: x,
    Typography: j,
    Segmented: B,
    Alert: U
  } = P().antd, { FileTextOutlined: Z, PlusOutlined: H, EditOutlined: J, ReloadOutlined: T } = P().antdIcons || {}, { Text: k } = j, [I, V] = n([]), [F, $] = n(!0), [h, g] = n(
    t || []
  ), [R, X] = n(!1), [G, ie] = n(null), [z, y] = n(""), [u, O] = n(""), [le, M] = n(!1), [K, se] = n("source"), W = r(0), Q = o(async () => {
    const N = ++W.current;
    $(!0);
    try {
      const p = await Ya(e);
      N === W.current && V(p);
    } catch (p) {
      N === W.current && (x.error(p.message || "加载工作区文档失败"), V([]));
    } finally {
      N === W.current && $(!1);
    }
  }, [e]);
  s(() => {
    Q();
  }, [Q]), s(() => {
    g(t || []);
  }, [t]);
  const me = async (N, p) => {
    const ne = new Set(h);
    if (p)
      ne.add(N);
    else {
      if (kn.includes(N) && N === "AGENTS.md") {
        x.warning("AGENTS.md 是核心文件，不能停用");
        return;
      }
      ne.delete(N);
    }
    const de = Array.from(ne);
    g(de);
    try {
      await tl(e, de), x.success(p ? "已启用记忆文件" : "已停用记忆文件"), l();
    } catch (fe) {
      x.error(fe.message || "更新失败"), g(t || []);
    }
  }, _ = async (N) => {
    try {
      const p = await re(
        `/workspace/files/${encodeURIComponent(N)}`,
        { headers: { "X-Agent-Id": e } }
      );
      ie(N), y(p.content || ""), se("source"), X(!0);
    } catch (p) {
      x.error(p.message || "读取文件失败");
    }
  }, te = () => {
    ie(null), y(""), O(""), se("source"), X(!0);
  }, m = async () => {
    let N;
    try {
      N = el(G || u);
    } catch (p) {
      x.warning(p.message || "文件名无效");
      return;
    }
    if (!z.trim()) {
      x.warning("Markdown 文档不能为空");
      return;
    }
    if (new TextEncoder().encode(z).length > 1024 * 1024) {
      x.warning("Markdown 文档不能超过 1 MB");
      return;
    }
    M(!0);
    try {
      if (G)
        await xt(e, N, z);
      else {
        const p = await Qa(
          e,
          N,
          z,
          !0
        );
        g(p.system_prompt_files);
      }
      x.success("保存成功"), X(!1), Q(), l();
    } catch (p) {
      const ne = p != null && p.message ? `：${p.message}` : "";
      x.error(
        G ? (p == null ? void 0 : p.message) || "保存失败" : `创建并挂载失败，服务端已回滚文件${ne}`
      );
    } finally {
      M(!1);
    }
  };
  return F ? a.createElement(
    "div",
    { style: { textAlign: "center", padding: 40 } },
    a.createElement(v, { size: "large" })
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
        Z ? a.createElement(Z, {
          style: { fontSize: 14, color: "#1677ff" }
        }) : null,
        a.createElement(
          k,
          { strong: !0 },
          `工作区文档 (${I.length})`
        ),
        a.createElement(
          k,
          { type: "secondary", style: { fontSize: 12 } },
          `· ${h.length} 个已挂载到系统提示`
        )
      ),
      a.createElement(
        "div",
        { style: { display: "flex", gap: 8 } },
        a.createElement(
          C,
          {
            size: "small",
            icon: T ? a.createElement(T) : void 0,
            onClick: Q
          },
          "刷新"
        ),
        a.createElement(
          C,
          {
            type: "primary",
            size: "small",
            icon: H ? a.createElement(H) : void 0,
            onClick: te
          },
          "新建 Markdown 文档"
        )
      )
    ),
    I.length === 0 ? a.createElement(E, {
      description: "暂无 Markdown 文档，点击「新建 Markdown 文档」添加",
      image: E.PRESENTED_IMAGE_SIMPLE
    }) : a.createElement(d, {
      dataSource: I,
      renderItem: (N) => {
        const p = h.includes(N.filename), ne = kn.includes(N.filename);
        return a.createElement(
          d.Item,
          {
            actions: [
              a.createElement(
                C,
                {
                  type: "link",
                  size: "small",
                  icon: J ? a.createElement(J) : void 0,
                  onClick: () => _(N.filename)
                },
                "编辑"
              )
            ]
          },
          a.createElement(d.Item.Meta, {
            avatar: a.createElement(Z, {
              style: {
                fontSize: 20,
                color: p ? "#1677ff" : "#bfbfbf"
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
              a.createElement(k, null, N.filename),
              ne ? a.createElement(
                c,
                { color: "default", style: { fontSize: 10 } },
                "内置"
              ) : a.createElement(
                c,
                { color: "cyan", style: { fontSize: 10 } },
                "工作文档"
              )
            ),
            description: a.createElement(
              "div",
              { style: { fontSize: 12 } },
              `${(N.size / 1024).toFixed(1)} KB · 修改于 ${new Date(N.modified_time).toLocaleString()}`
            )
          }),
          a.createElement(f, {
            checked: p,
            size: "small",
            onChange: (de) => me(N.filename, de)
          })
        );
      }
    }),
    // Edit/New file modal
    a.createElement(
      w,
      {
        open: R,
        onCancel: () => X(!1),
        title: G ? `编辑 ${G}` : "新建 Markdown 文档",
        width: 700,
        onOk: m,
        confirmLoading: le,
        okText: "保存"
      },
      G ? null : a.createElement(
        "div",
        { style: { marginBottom: 12 } },
        a.createElement(b, {
          placeholder: "文件名（如：油藏工程记忆库.md）",
          value: u,
          onChange: (N) => O(N.target.value),
          addonAfter: u.endsWith(".md") ? "" : ".md"
        })
      ),
      a.createElement(
        "div",
        {
          style: {
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            marginBottom: 10
          }
        },
        a.createElement(B, {
          size: "small",
          value: K,
          options: [
            { label: "源码", value: "source" },
            { label: "预览", value: "preview" }
          ],
          onChange: (N) => se(N)
        }),
        a.createElement(
          k,
          { type: "secondary", style: { fontSize: 12 } },
          `${z.length} 字符 · 约 ${Math.ceil(z.length / 4)} tokens · ${G && h.includes(G) ? "已挂载" : G ? "未挂载" : "保存后自动挂载"}`
        )
      ),
      z.trim() ? null : a.createElement(U, {
        type: "warning",
        showIcon: !0,
        message: "文档内容为空，保存前需要填写 Markdown 内容",
        style: { marginBottom: 10 }
      }),
      K === "source" ? a.createElement(b.TextArea, {
        value: z,
        onChange: (N) => y(N.target.value),
        rows: 14,
        placeholder: `输入 Markdown 内容...

例如：
# 某区块油藏基础参数

- 地层压力: 25 MPa
- 地层温度: 85°C
- 原油密度: 0.85 g/cm³`,
        style: { fontFamily: "monospace", fontSize: 13 }
      }) : a.createElement(
        "div",
        {
          style: {
            minHeight: 320,
            maxHeight: 480,
            overflow: "auto",
            padding: "12px 16px",
            border: "1px solid #d9d9d9",
            borderRadius: 6,
            background: "var(--ant-color-bg-container, #fff)"
          }
        },
        zt(z, a)
      )
    )
  );
}
function vl({
  skills: e,
  agentId: t
}) {
  const l = P().React, { useMemo: a } = l, {
    List: n,
    Tag: s,
    Typography: o,
    Empty: r,
    Button: d,
    message: c
  } = P().antd, { ThunderboltOutlined: f, CopyOutlined: C } = P().antdIcons || {}, { Text: w } = o, b = a(() => Nn(e), [e]), v = (x) => {
    try {
      const j = P();
      j.setSelectedAgent && j.setSelectedAgent(t);
    } catch {
    }
    try {
      sessionStorage.setItem("ugsci_pending_prompt", x.value);
    } catch {
    }
    window.history.pushState({}, "", "/chat"), window.dispatchEvent(new PopStateEvent("popstate"));
  }, E = (x) => {
    var j;
    (j = navigator.clipboard) == null || j.writeText(x.value).then(() => {
      c.success("已复制到剪贴板");
    });
  };
  return b.length === 0 ? l.createElement(r, {
    description: "暂无推荐提问，请先为专家添加技能",
    image: r.PRESENTED_IMAGE_SIMPLE
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
        w,
        { strong: !0 },
        `推荐提问 (${b.length})`
      ),
      l.createElement(
        w,
        { type: "secondary", style: { fontSize: 12 } },
        "· 从技能描述中自动提取"
      )
    ),
    l.createElement(n, {
      dataSource: b,
      renderItem: (x, j) => l.createElement(
        n.Item,
        {
          actions: [
            l.createElement(
              d,
              {
                type: "link",
                size: "small",
                icon: C ? l.createElement(C) : void 0,
                onClick: () => E(x)
              },
              "复制"
            )
          ]
        },
        l.createElement(n.Item.Meta, {
          avatar: l.createElement(
            s,
            { color: "blue", style: { borderRadius: "50%" } },
            `${j + 1}`
          ),
          title: l.createElement(
            "div",
            {
              style: {
                cursor: "pointer",
                color: "#1677ff"
              },
              onClick: () => v(x)
            },
            x.value
          ),
          description: l.createElement(
            w,
            { type: "secondary", style: { fontSize: 12 } },
            x.label
          )
        })
      )
    })
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
function bl({ agentId: e }) {
  const t = P().React, { useState: l, useEffect: a, useCallback: n } = t, {
    Switch: s,
    InputNumber: o,
    Select: r,
    Button: d,
    Spin: c,
    Space: f,
    Typography: C,
    message: w
  } = P().antd, { PlayCircleOutlined: b, SaveOutlined: v } = P().antdIcons || {}, { Text: E } = C, [x, j] = l(!0), [B, U] = l(!1), [Z, H] = l(!1), [J, T] = l(!1), [k, I] = l(6), [V, F] = l("h"), [$, h] = l("main"), [g, R] = l(300), [X, G] = l(!1), [ie, z] = l("08:00"), [y, u] = l("22:00"), O = n(async () => {
    var Q, me;
    j(!0);
    try {
      const _ = await cl(e), te = ol(_.every ?? "6h");
      T(_.enabled ?? !1), I(te.number), F(te.unit), h(_.target ?? "main"), R(_.timeoutSeconds ?? 300), G(!!_.activeHours), z(((Q = _.activeHours) == null ? void 0 : Q.start) ?? "08:00"), u(((me = _.activeHours) == null ? void 0 : me.end) ?? "22:00");
    } catch (_) {
      w.error(_.message || "加载心跳配置失败");
    } finally {
      j(!1);
    }
  }, [e]);
  a(() => {
    O();
  }, [O]);
  const le = async () => {
    U(!0);
    try {
      await ml(e, {
        enabled: J,
        every: il({ number: k, unit: V }),
        target: $,
        timeoutSeconds: g,
        activeHours: X && ie && y ? { start: ie, end: y } : void 0
      }), w.success("心跳配置已保存");
    } catch (Q) {
      w.error(Q.message || "保存心跳配置失败");
    } finally {
      U(!1);
    }
  }, M = async () => {
    H(!0);
    try {
      await dl(e), w.success("已触发心跳检查");
    } catch (Q) {
      w.error(Q.message || "触发心跳失败");
    } finally {
      H(!1);
    }
  };
  if (x)
    return t.createElement(
      "div",
      { style: { textAlign: "center", padding: 40 } },
      t.createElement(c, { size: "large" })
    );
  const K = (Q, me, _) => t.createElement(
    "div",
    { style: Xn },
    t.createElement("div", { style: Ye }, Q),
    me,
    _ ? t.createElement(
      E,
      { type: "secondary", style: qn },
      _
    ) : null
  ), se = (Q, me, _, te) => t.createElement(
    "div",
    { style: Kn },
    t.createElement(
      "div",
      null,
      t.createElement("div", { style: Ye }, Q),
      me
    ),
    t.createElement(
      "div",
      null,
      t.createElement("div", { style: Ye }, _),
      te
    )
  ), { Divider: W } = P().antd;
  return t.createElement(
    "div",
    { style: { paddingBottom: 8 } },
    // ── Section: 基本设置 ──
    t.createElement("div", { style: Ue }, "基本设置"),
    K(
      "启用心跳",
      t.createElement(s, {
        checked: J,
        onChange: (Q) => T(Q)
      }),
      J ? "已启用，专家将定期自检" : "已停用"
    ),
    se(
      "检查频率",
      t.createElement(
        f,
        null,
        t.createElement(o, {
          min: 1,
          value: k,
          onChange: (Q) => I(Q ?? 1),
          style: { width: "100%" }
        }),
        t.createElement(r, {
          value: V,
          onChange: (Q) => F(Q),
          style: { width: 90 },
          options: [
            { value: "m", label: "分钟" },
            { value: "h", label: "小时" }
          ]
        })
      ),
      "心跳目标",
      t.createElement(r, {
        value: $,
        onChange: (Q) => h(Q),
        style: { width: "100%" },
        options: [
          { value: "main", label: "主会话 (main)" },
          { value: "last", label: "最近会话 (last)" },
          { value: "inbox", label: "收件箱 (inbox)" }
        ]
      })
    ),
    K(
      "超时时间 (秒)",
      t.createElement(o, {
        min: 1,
        max: 3600,
        value: g,
        onChange: (Q) => R(Q ?? 300),
        style: { width: 200 }
      })
    ),
    // ── Section: 活跃时段 ──
    t.createElement(W, { style: { margin: "8px 0 16px" } }),
    t.createElement("div", { style: Ue }, "活跃时段"),
    K(
      "启用活跃时段限制",
      t.createElement(s, {
        checked: X,
        onChange: (Q) => G(Q)
      }),
      "仅在指定时段内触发心跳"
    ),
    X ? se(
      "开始时间",
      t.createElement("input", {
        type: "time",
        value: ie,
        onChange: (Q) => z(Q.target.value),
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
        value: y,
        onChange: (Q) => u(Q.target.value),
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
          loading: B,
          onClick: le,
          style: Oe
        },
        "保存配置"
      ),
      t.createElement(
        d,
        {
          icon: b ? t.createElement(b) : void 0,
          loading: Z,
          onClick: M
        },
        "立即执行"
      )
    )
  );
}
function Sl({
  agentId: e,
  onRefresh: t
}) {
  const l = P().React, { useState: a, useEffect: n, useCallback: s } = l, {
    List: o,
    Tag: r,
    Switch: d,
    Button: c,
    Empty: f,
    Spin: C,
    Typography: w,
    message: b
  } = P().antd, { PlusOutlined: v, ReloadOutlined: E, DeleteOutlined: x } = P().antdIcons || {}, { Text: j, Paragraph: B } = w, [U, Z] = a([]), [H, J] = a(!0), [T, k] = a(!1), [I, V] = a([]), [F, $] = a(!1), h = s(async () => {
    J(!0);
    try {
      const z = await Ot(e);
      Z(z);
    } catch (z) {
      b.error(z.message || "加载技能失败"), Z([]);
    } finally {
      J(!1);
    }
  }, [e]);
  n(() => {
    h();
  }, [h]);
  const g = async () => {
    k(!0), $(!0);
    try {
      const z = await Wt(!0);
      V(z);
    } catch (z) {
      b.error(z.message || "加载技能池失败");
    } finally {
      $(!1);
    }
  }, R = async (z) => {
    let y = 0, u = 0;
    for (const O of z)
      try {
        await Jt(e, O), y++;
      } catch {
        u++;
      }
    y > 0 ? (b.success(
      `成功添加 ${y} 个技能${u > 0 ? `，${u} 个失败` : ""}`
    ), h(), t()) : u > 0 && b.error("添加技能失败"), k(!1);
  }, X = async (z, y) => {
    try {
      y ? await Dn(e, z.name) : await Hn(e, z.name), b.success(y ? "已启用" : "已停用"), h(), t();
    } catch (u) {
      b.error(u.message || "操作失败");
    }
  }, G = async (z) => {
    try {
      await Xt(e, z), b.success(`技能「${z}」已移除`), h(), t();
    } catch (y) {
      b.error(y.message || "移除技能失败");
    }
  };
  if (H)
    return l.createElement(
      "div",
      { style: { textAlign: "center", padding: 40 } },
      l.createElement(C, { size: "large" })
    );
  const ie = U.filter((z) => z.enabled !== !1);
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
        j,
        { strong: !0 },
        `技能列表 (${U.length}，已启用 ${ie.length})`
      ),
      l.createElement(
        "div",
        { style: { display: "flex", gap: 8 } },
        l.createElement(
          c,
          {
            size: "small",
            icon: E ? l.createElement(E) : void 0,
            onClick: () => {
              tt(), h();
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
            onClick: g,
            style: Oe
          },
          "从技能池添加"
        )
      )
    ),
    U.length === 0 ? l.createElement(f, {
      description: "该专家暂无技能",
      image: f.PRESENTED_IMAGE_SIMPLE
    }) : l.createElement(o, {
      dataSource: U,
      renderItem: (z) => l.createElement(
        o.Item,
        {
          actions: [
            l.createElement(d, {
              key: "toggle",
              size: "small",
              checked: z.enabled !== !1,
              onChange: (y) => X(z, y)
            }),
            l.createElement(
              c,
              {
                key: "del",
                type: "link",
                size: "small",
                danger: !0,
                icon: x ? l.createElement(x) : void 0,
                onClick: () => G(z.name)
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
            z.emoji ? l.createElement(
              "span",
              { style: { fontSize: 16 } },
              z.emoji
            ) : null,
            l.createElement(j, { strong: !0 }, z.name),
            z.version_text ? l.createElement(
              r,
              { style: { fontSize: 10 } },
              `v${z.version_text}`
            ) : null
          ),
          z.description ? l.createElement(
            B,
            {
              type: "secondary",
              style: { fontSize: 12, margin: 0 },
              ellipsis: { rows: 2 }
            },
            z.description
          ) : null
        )
      )
    }),
    l.createElement(Wn, {
      open: T,
      onClose: () => k(!1),
      poolSkills: I,
      installedSkillNames: U.map((z) => z.name),
      loading: F,
      onInstall: R
    })
  );
}
function wl({
  agentId: e,
  onRefresh: t,
  isActive: l
}) {
  const a = P().React, { useState: n, useEffect: s, useCallback: o } = a, {
    List: r,
    Tag: d,
    Button: c,
    Empty: f,
    Spin: C,
    Modal: w,
    Input: b,
    Typography: v,
    message: E
  } = P().antd, { PlusOutlined: x, ReloadOutlined: j, DeleteOutlined: B } = P().antdIcons || {}, { Text: U, Paragraph: Z } = v, { TextArea: H } = b, [J, T] = n([]), [k, I] = n(!0), [V, F] = n(!1), [$, h] = n(`{
  "mcpServers": {
    "example-client": {
      "command": "npx",
      "args": ["-y", "@example/mcp-server"],
      "env": {}
    }
  }
}`), [g, R] = n(!1), X = o(async () => {
    I(!0);
    try {
      const y = await Kt(e);
      T(y);
    } catch (y) {
      E.error(y.message || "加载 MCP 失败"), T([]);
    } finally {
      I(!1);
    }
  }, [e]);
  s(() => {
    X();
  }, [X]), s(() => {
    l && X();
  }, [l, X]);
  const G = async (y) => {
    try {
      await sl(e, y), E.success("已切换 MCP 状态"), X(), t();
    } catch (u) {
      E.error(u.message || "切换失败");
    }
  }, ie = async (y) => {
    try {
      await Fn(e, y), E.success(`MCP「${y}」已移除`), X(), t();
    } catch (u) {
      E.error(u.message || "移除 MCP 失败");
    }
  }, z = async () => {
    R(!0);
    try {
      const y = JSON.parse($), u = y.mcpServers || y, O = Object.entries(u);
      if (O.length === 0) {
        E.warning("未找到 MCP 客户端配置");
        return;
      }
      for (const [le, M] of O) {
        const K = M, se = K.url ? "streamable_http" : "stdio";
        await Gn(e, {
          client_key: le,
          client: {
            name: K.name || le,
            description: K.description || "",
            enabled: !0,
            transport: se,
            url: K.url || "",
            command: K.command || "",
            args: K.args || [],
            env: K.env || {},
            cwd: K.cwd || "",
            headers: K.headers || {}
          }
        });
      }
      E.success("MCP 客户端已创建"), F(!1), X(), t();
    } catch (y) {
      y instanceof SyntaxError ? E.error("JSON 格式错误：" + y.message) : E.error(y.message || "创建 MCP 失败");
    } finally {
      R(!1);
    }
  };
  return k ? a.createElement(
    "div",
    { style: { textAlign: "center", padding: 40 } },
    a.createElement(C, { size: "large" })
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
      a.createElement(U, { strong: !0 }, `MCP 客户端 (${J.length})`),
      a.createElement(
        "div",
        { style: { display: "flex", gap: 8 } },
        a.createElement(
          c,
          {
            size: "small",
            icon: j ? a.createElement(j) : void 0,
            onClick: () => {
              tt(), X();
            }
          },
          "刷新"
        ),
        a.createElement(
          c,
          {
            type: "primary",
            size: "small",
            icon: x ? a.createElement(x) : void 0,
            onClick: () => F(!0),
            style: Oe
          },
          "添加 MCP"
        )
      )
    ),
    J.length === 0 ? a.createElement(f, {
      description: "该专家暂无 MCP 客户端",
      image: f.PRESENTED_IMAGE_SIMPLE
    }) : a.createElement(r, {
      dataSource: J,
      renderItem: (y) => a.createElement(
        r.Item,
        {
          actions: [
            a.createElement(
              c,
              {
                key: "toggle",
                size: "small",
                onClick: () => G(y.key)
              },
              y.enabled ? "停用" : "启用"
            ),
            a.createElement(
              c,
              {
                key: "del",
                type: "link",
                size: "small",
                danger: !0,
                icon: B ? a.createElement(B) : void 0,
                onClick: () => ie(y.key)
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
            a.createElement(U, { strong: !0 }, y.name || y.key),
            a.createElement(
              d,
              {
                color: y.enabled ? "green" : "default",
                style: { fontSize: 10 }
              },
              y.enabled ? "启用" : "停用"
            ),
            a.createElement(
              d,
              { color: "purple", style: { fontSize: 10 } },
              y.transport
            )
          ),
          y.description ? a.createElement(
            Z,
            {
              type: "secondary",
              style: { fontSize: 12, margin: 0 },
              ellipsis: { rows: 2 }
            },
            y.description
          ) : null,
          y.tools && y.tools.length > 0 ? a.createElement(
            "div",
            { style: { marginTop: 4, fontSize: 11, color: "#8c8c8c" } },
            `提供 ${y.tools.length} 个工具`
          ) : null
        )
      )
    }),
    // Create MCP modal
    a.createElement(
      w,
      {
        open: V,
        title: "添加 MCP 客户端 (JSON)",
        onCancel: () => F(!1),
        onOk: z,
        confirmLoading: g,
        okText: "创建",
        width: 560
      },
      a.createElement(
        "div",
        { style: { marginBottom: 8, fontSize: 12, color: "#8c8c8c" } },
        "粘贴 MCP 配置 JSON（支持 mcpServers 格式），将创建到当前专家工作区："
      ),
      a.createElement(H, {
        value: $,
        onChange: (y) => h(y.target.value),
        rows: 12,
        style: { fontFamily: "monospace", fontSize: 12 }
      })
    )
  );
}
function Cl({ agentId: e }) {
  const t = P().React, { useState: l, useEffect: a, useCallback: n, useRef: s } = t, {
    Card: o,
    InputNumber: r,
    Input: d,
    Select: c,
    Switch: f,
    Button: C,
    Spin: w,
    Space: b,
    Typography: v,
    Divider: E,
    message: x
  } = P().antd, { SaveOutlined: j } = P().antdIcons || {}, { Text: B } = v, [U, Z] = l(!0), [H, J] = l(!1), T = s(null), [k, I] = l(60), [V, F] = l(""), [$, h] = l(!0), [g, R] = l(30), [X, G] = l("zh"), [ie, z] = l("UTC"), [y, u] = l(!0), [O, le] = l(100), [M, K] = l(!0), [se, W] = l(3), [Q, me] = l(1), [_, te] = l(!0), [m, N] = l(3), [p, ne] = l(2), [de, fe] = l(60), [Ee, pe] = l(1), [ae, Y] = l(0), [S, q] = l(1), [oe, D] = l(0), [ue, ve] = l(30), [xe, Ie] = l(50), [ke, Fe] = l("light"), [Pe, nt] = l("scroll"), [dt, at] = l("remelight"), [$e, lt] = l("AUTO"), ut = n(async () => {
    var ee, Se, Ce, Te, We, Je;
    Z(!0);
    try {
      const [he, pt, Pt] = await Promise.all([
        ul(e),
        gl(e).catch(() => "zh"),
        yl().catch(() => "UTC")
      ]);
      T.current = he, I(he.shell_command_timeout ?? 60), F(he.shell_command_executable ?? "");
      const rt = he.auto_title_config ?? { enabled: !0, timeout_seconds: 30 };
      h(rt.enabled ?? !0), R(rt.timeout_seconds ?? 30), G(pt), z(Pt);
      const je = he.loop ?? {};
      u(((ee = je.iteration) == null ? void 0 : ee.enabled) ?? !0), le(((Se = je.iteration) == null ? void 0 : Se.max_iterations) ?? he.max_iters ?? 100), K(((Ce = je.doom_loop) == null ? void 0 : Ce.enabled) ?? !0), W(((Te = je.doom_loop) == null ? void 0 : Te.window_size) ?? 3), me(((We = je.doom_loop) == null ? void 0 : We.similarity_threshold) ?? 1), te(he.llm_retry_enabled ?? !0), N(he.llm_max_retries ?? 3), ne(he.llm_backoff_base ?? 2), fe(he.llm_backoff_cap ?? 60), pe(he.llm_max_concurrent ?? 1), Y(he.llm_max_qpm ?? 0), q(he.llm_rate_limit_pause ?? 1), D(he.llm_rate_limit_jitter ?? 0), ve(he.llm_acquire_timeout ?? 30), Ie(he.history_max_length ?? 50), Fe(he.context_manager_backend ?? "light"), nt(((Je = he.light_context_config) == null ? void 0 : Je.strategy) ?? "scroll"), at(he.memory_manager_backend ?? "remelight"), lt(he.approval_level ?? "AUTO");
    } catch (he) {
      x.error(he.message || "加载运行配置失败");
    } finally {
      Z(!1);
    }
  }, [e]);
  a(() => {
    ut();
  }, [ut]);
  const st = async () => {
    var Se, Ce;
    const ee = T.current;
    if (ee) {
      J(!0);
      try {
        const Te = {
          ...ee,
          max_iters: O,
          loop: {
            ...ee.loop ?? {},
            iteration: { enabled: y, max_iterations: O },
            doom_loop: {
              enabled: M,
              window_size: se,
              similarity_threshold: Q,
              stages: ((Ce = (Se = ee.loop) == null ? void 0 : Se.doom_loop) == null ? void 0 : Ce.stages) ?? []
            }
          },
          shell_command_timeout: k,
          shell_command_executable: V,
          auto_title_config: {
            enabled: $,
            timeout_seconds: g
          },
          llm_retry_enabled: _,
          llm_max_retries: m,
          llm_backoff_base: p,
          llm_backoff_cap: de,
          llm_max_concurrent: Ee,
          llm_max_qpm: ae,
          llm_rate_limit_pause: S,
          llm_rate_limit_jitter: oe,
          llm_acquire_timeout: ue,
          history_max_length: xe,
          context_manager_backend: ke,
          light_context_config: {
            ...ee.light_context_config ?? {},
            strategy: Pe
          },
          memory_manager_backend: dt,
          approval_level: $e
        };
        await pl(e, Te), T.current = Te, X && await fl(e, X).catch(() => {
        }), ie && await El(ie).catch(() => {
        }), x.success("运行配置已保存");
      } catch (Te) {
        x.error(Te.message || "保存运行配置失败");
      } finally {
        J(!1);
      }
    }
  };
  if (U)
    return t.createElement(
      "div",
      { style: { textAlign: "center", padding: 40 } },
      t.createElement(w, { size: "large" })
    );
  const be = (ee, Se, Ce) => t.createElement(
    "div",
    { style: Xn },
    t.createElement("div", { style: Ye }, ee),
    Se,
    Ce ? t.createElement(
      B,
      { type: "secondary", style: qn },
      Ce
    ) : null
  ), _e = (ee, Se, Ce, Te) => t.createElement(
    "div",
    { style: Kn },
    t.createElement(
      "div",
      null,
      t.createElement("div", { style: Ye }, ee),
      Se
    ),
    t.createElement(
      "div",
      null,
      t.createElement("div", { style: Ye }, Ce),
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
    _e(
      "Shell 命令超时 (秒)",
      t.createElement(r, {
        min: 1,
        value: k,
        onChange: (ee) => I(ee ?? 60),
        style: { width: "100%" }
      }),
      "Shell 可执行文件",
      t.createElement(d, {
        value: V,
        onChange: (ee) => F(ee.target.value),
        placeholder: "留空使用系统默认",
        style: { width: "100%" }
      })
    ),
    _e(
      "语言",
      t.createElement(c, {
        value: X,
        onChange: (ee) => G(ee),
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
        value: ie,
        onChange: (ee) => z(ee),
        style: { width: "100%" },
        showSearch: !0,
        filterOption: (ee, Se) => {
          var Ce;
          return (((Ce = Se == null ? void 0 : Se.label) == null ? void 0 : Ce.toString()) || "").toLowerCase().includes(ee.toLowerCase());
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
    _e(
      "自动生成会话标题",
      t.createElement(b, null, t.createElement(f, {
        checked: $,
        onChange: (ee) => h(ee)
      })),
      "标题生成超时 (秒)",
      t.createElement(r, {
        min: 5,
        value: g,
        onChange: (ee) => R(ee ?? 30),
        style: { width: "100%" },
        disabled: !$
      })
    ),
    // ── Section: 审批级别 ──
    t.createElement(E, { style: { margin: "8px 0 16px" } }),
    t.createElement("div", { style: Ue }, "审批级别"),
    be(
      "工具执行审批",
      t.createElement(c, {
        value: $e,
        onChange: (ee) => lt(ee),
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
    t.createElement(E, { style: { margin: "8px 0 16px" } }),
    t.createElement("div", { style: Ue }, "迭代与循环"),
    be(
      "启用迭代限制",
      t.createElement(f, {
        checked: y,
        onChange: (ee) => u(ee)
      }),
      "停止 Agent 前的最大循环轮次"
    ),
    y ? be(
      "最大迭代次数",
      t.createElement(r, {
        min: 1,
        max: 500,
        value: O,
        onChange: (ee) => le(ee ?? 100),
        style: { width: "100%" }
      })
    ) : null,
    be(
      "启用重复循环保护",
      t.createElement(f, {
        checked: M,
        onChange: (ee) => K(ee)
      }),
      "检测并阻止重复操作循环"
    ),
    M ? _e(
      "检测窗口大小",
      t.createElement(r, {
        min: 2,
        max: 20,
        value: se,
        onChange: (ee) => W(ee ?? 3),
        style: { width: "100%" }
      }),
      "相似度阈值",
      t.createElement(r, {
        min: 0,
        max: 1,
        step: 0.05,
        value: Q,
        onChange: (ee) => me(ee ?? 1),
        style: { width: "100%" }
      })
    ) : null,
    // ── Section: LLM 重试 ──
    t.createElement(E, { style: { margin: "8px 0 16px" } }),
    t.createElement("div", { style: Ue }, "LLM 重试"),
    be(
      "启用 LLM 重试",
      t.createElement(f, {
        checked: _,
        onChange: (ee) => te(ee)
      })
    ),
    _e(
      "最大重试次数",
      t.createElement(r, {
        min: 1,
        value: m,
        onChange: (ee) => N(ee ?? 3),
        style: { width: "100%" },
        disabled: !_
      }),
      "退避基数 (秒)",
      t.createElement(r, {
        min: 0.1,
        step: 0.1,
        value: p,
        onChange: (ee) => ne(ee ?? 2),
        style: { width: "100%" },
        disabled: !_
      })
    ),
    be(
      "退避上限 (秒)",
      t.createElement(r, {
        min: 0.5,
        step: 0.5,
        value: de,
        onChange: (ee) => fe(ee ?? 60),
        style: { width: 200 },
        disabled: !_
      })
    ),
    // ── Section: LLM 限流 ──
    t.createElement(E, { style: { margin: "8px 0 16px" } }),
    t.createElement("div", { style: Ue }, "LLM 限流"),
    _e(
      "最大并发数",
      t.createElement(r, {
        min: 1,
        value: Ee,
        onChange: (ee) => pe(ee ?? 1),
        style: { width: "100%" }
      }),
      "最大 QPM (0=不限)",
      t.createElement(r, {
        min: 0,
        step: 10,
        value: ae,
        onChange: (ee) => Y(ee ?? 0),
        style: { width: "100%" }
      })
    ),
    _e(
      "限流暂停时间 (秒)",
      t.createElement(r, {
        min: 1,
        step: 0.5,
        value: S,
        onChange: (ee) => q(ee ?? 1),
        style: { width: "100%" }
      }),
      "限流抖动 (秒)",
      t.createElement(r, {
        min: 0,
        step: 0.5,
        value: oe,
        onChange: (ee) => D(ee ?? 0),
        style: { width: "100%" }
      })
    ),
    be(
      "获取超时 (秒)",
      t.createElement(r, {
        min: 10,
        step: 10,
        value: ue,
        onChange: (ee) => ve(ee ?? 30),
        style: { width: 200 }
      }),
      "应大于 限流暂停 + 抖动"
    ),
    // ── Section: 上下文与记忆 ──
    t.createElement(E, { style: { margin: "8px 0 16px" } }),
    t.createElement("div", { style: Ue }, "上下文与记忆"),
    _e(
      "上下文管理后端",
      t.createElement(c, {
        value: ke,
        onChange: (ee) => Fe(ee),
        style: { width: "100%" },
        options: [{ value: "light", label: "light" }]
      }),
      "上下文策略",
      t.createElement(c, {
        value: Pe,
        onChange: (ee) => nt(ee),
        style: { width: "100%" },
        options: [
          { value: "scroll", label: "scroll (滚动窗口)" },
          { value: "native", label: "native (原生)" }
        ]
      })
    ),
    _e(
      "记忆管理后端",
      t.createElement(c, {
        value: dt,
        onChange: (ee) => at(ee),
        style: { width: "100%" },
        options: [
          { value: "remelight", label: "remelight" },
          { value: "adbpg", label: "adbpg" },
          { value: "none", label: "none (禁用)" }
        ]
      }),
      "历史消息最大长度",
      t.createElement(r, {
        min: 1,
        value: xe,
        onChange: (ee) => Ie(ee ?? 50),
        style: { width: "100%" }
      })
    ),
    // ── Save button ──
    t.createElement(
      "div",
      { style: { display: "flex", justifyContent: "flex-end", marginTop: 16 } },
      t.createElement(
        C,
        {
          type: "primary",
          icon: j ? t.createElement(j) : void 0,
          loading: H,
          onClick: st,
          style: Oe
        },
        "保存运行配置"
      )
    )
  );
}
function xl({
  expert: e,
  open: t,
  onClose: l,
  onRefresh: a
}) {
  const n = P().React, { useState: s, useEffect: o, useCallback: r } = n, { Modal: d, Tabs: c, Spin: f, Typography: C } = P().antd, { SettingOutlined: w } = P().antdIcons || {}, { Text: b } = C, [v, E] = s([]), [x, j] = s(!1), [B, U] = s("heartbeat"), Z = r(async () => {
    if (e) {
      j(!0);
      try {
        const k = await hl(e.agent.id);
        E(k);
      } catch {
        E([]);
      } finally {
        j(!1);
      }
    }
  }, [e]);
  if (o(() => {
    t && e && Z();
  }, [t, e, Z]), !e) return null;
  const { agent: H } = e, J = () => {
    Z(), a();
  }, T = [
    {
      key: "heartbeat",
      label: "心跳",
      children: n.createElement(bl, {
        agentId: H.id
      })
    },
    {
      key: "files",
      label: "文件",
      children: x ? n.createElement(
        "div",
        { style: { textAlign: "center", padding: 40 } },
        n.createElement(f, { size: "large" })
      ) : n.createElement(Jn, {
        agentId: H.id,
        systemPromptFiles: v,
        onRefresh: J
      })
    },
    {
      key: "skills",
      label: `技能 (${e.skills.filter((k) => k.enabled !== !1).length})`,
      children: n.createElement(Sl, {
        agentId: H.id,
        onRefresh: a
      })
    },
    {
      key: "mcp",
      label: `MCP (${e.mcps.length})`,
      children: n.createElement(wl, {
        agentId: H.id,
        onRefresh: a,
        isActive: B === "mcp"
      })
    },
    {
      key: "running",
      label: "运行配置",
      children: n.createElement(Cl, {
        agentId: H.id
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
        w ? n.createElement(w, { style: { fontSize: 18 } }) : null,
        n.createElement("span", null, `配置 - ${H.name}`),
        n.createElement(
          b,
          { type: "secondary", style: { fontSize: 12, fontWeight: 400 } },
          H.id
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
      items: T,
      activeKey: B,
      onChange: (k) => U(k),
      size: "small",
      tabBarStyle: { marginBottom: 16 }
    })
  );
}
const kl = [
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
], _l = kl;
function Tn(e) {
  return Ne(`/ugsci/avatar/${encodeURIComponent(e)}`);
}
function zn(e) {
  const t = e.map(encodeURIComponent).join(",");
  return Ne(`/ugsci/avatar/team/${t}`);
}
function Ae({
  name: e,
  size: t = 32,
  borderRadius: l = "50%"
}) {
  const a = P().React, [n, s] = a.useState(0), o = n === 0 ? Tn(e) : `${Tn(e)}?_r=${n}`;
  return a.createElement("img", {
    src: o,
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
function qt({
  members: e,
  size: t = 32,
  borderRadius: l = "50%"
}) {
  const a = P().React, [n, s] = a.useState(0);
  if (!e || e.length === 0)
    return a.createElement("span", {
      style: {
        width: t,
        height: t,
        display: "inline-block"
      }
    });
  const o = e.slice(0, 5), r = n === 0 ? zn(o) : `${zn(o)}?_r=${n}`;
  return a.createElement("img", {
    src: r,
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
function Tl({
  expert: e,
  onClick: t,
  onSummon: l,
  onConfigure: a
}) {
  const n = P().React, { Card: s, Tag: o, Badge: r, Typography: d, Spin: c, Button: f, Tooltip: C } = P().antd, { Text: w } = d, { ThunderboltOutlined: b, SettingOutlined: v } = P().antdIcons || {}, { agent: E, skills: x, mcps: j, loading: B } = e, U = E.enabled, Z = x.filter((T) => T.enabled !== !1).map((T) => T.name), H = j.map((T) => T.name || T.key), J = E.active_model ? `${E.active_model.provider_id}/${E.active_model.model}` : null;
  return n.createElement(
    s,
    {
      hoverable: !0,
      onClick: t,
      size: "small",
      style: {
        cursor: "pointer",
        transition: "all 0.2s ease",
        borderColor: U ? void 0 : "#d9d9d9",
        opacity: U ? 1 : 0.7,
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
        n.createElement(Ae, { name: E.name, size: 36 }),
        n.createElement(
          "div",
          null,
          n.createElement(
            w,
            { strong: !0, style: { fontSize: 15 } },
            E.name
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
            E.id
          )
        )
      ),
      n.createElement(r, {
        status: U ? "success" : "default",
        text: U ? "启用" : "停用"
      })
    ),
    // Description (rendered as markdown)
    E.description ? n.createElement(
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
      zt(E.description, n)
    ) : n.createElement(
      "div",
      { style: { fontSize: 12, color: "#bfbfbf", marginBottom: 10, minHeight: 54, flex: "1 0 auto" } },
      "暂无描述"
    ),
    // Model info
    J ? n.createElement(
      "div",
      { style: { marginBottom: 8 } },
      n.createElement(
        o,
        { color: "geekblue", style: { fontSize: 11 } },
        `🤖 ${J}`
      )
    ) : null,
    // Skills
    B ? n.createElement(c, { size: "small" }) : n.createElement(
      "div",
      { style: { marginBottom: 6 } },
      n.createElement(
        "div",
        { style: { fontSize: 11, color: "#8c8c8c", marginBottom: 4 } },
        `技能 (${Z.length})`
      ),
      n.createElement(_n, {
        items: Z,
        max: 4,
        color: "cyan",
        emptyText: "未配置技能"
      })
    ),
    // MCP
    !B && H.length > 0 ? n.createElement(
      "div",
      { style: { marginTop: "auto" } },
      n.createElement(
        "div",
        { style: { fontSize: 11, color: "#8c8c8c", marginBottom: 4 } },
        `MCP (${H.length})`
      ),
      n.createElement(_n, {
        items: H,
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
        C,
        { title: "配置专家", placement: "top" },
        n.createElement(
          f,
          {
            type: "text",
            size: "small",
            icon: v ? n.createElement(v, {
              style: { fontSize: 16, color: "#8c8c8c" }
            }) : void 0,
            onClick: (T) => {
              T.stopPropagation(), a && a();
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
          icon: b ? n.createElement(b) : void 0,
          disabled: !U,
          onClick: (T) => {
            T.stopPropagation(), l && l();
          },
          style: Oe
        },
        "召唤专家"
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
  const n = P().React, {
    Drawer: s,
    Descriptions: o,
    Tag: r,
    Typography: d,
    Space: c,
    Button: f,
    Empty: C,
    Tabs: w,
    List: b,
    Spin: v,
    Modal: E,
    message: x
  } = P().antd, { Text: j, Paragraph: B } = d, {
    EditOutlined: U,
    ThunderboltOutlined: Z,
    FileTextOutlined: H,
    ToolOutlined: J,
    PlusOutlined: T
  } = P().antdIcons || {}, [k, I] = n.useState(!1), [V, F] = n.useState(
    []
  ), [$, h] = n.useState(!1);
  if (!e) return null;
  const { agent: g, config: R, skills: X, mcps: G, loading: ie } = e, z = X.filter((_) => _.enabled !== !1), y = (_) => {
    window.history.pushState({}, "", _), window.dispatchEvent(new PopStateEvent("popstate"));
  }, u = n.createElement(
    "div",
    null,
    n.createElement(
      o,
      { column: 1, bordered: !0, size: "small" },
      n.createElement(o.Item, { label: "专家名称" }, g.name),
      n.createElement(
        o.Item,
        { label: "专家 ID" },
        n.createElement("code", { style: { fontSize: 12 } }, g.id)
      ),
      n.createElement(
        o.Item,
        { label: "状态" },
        n.createElement(
          r,
          { color: g.enabled ? "green" : "default" },
          g.enabled ? "启用" : "停用"
        )
      ),
      n.createElement(
        o.Item,
        { label: "功能简介" },
        g.description ? zt(g.description, n) : "暂无描述"
      ),
      n.createElement(
        o.Item,
        { label: "使用模型" },
        g.active_model ? `${g.active_model.provider_id} / ${g.active_model.model}` : "使用全局默认模型"
      ),
      R != null && R.workspace_dir ? n.createElement(
        o.Item,
        { label: "工作区路径" },
        n.createElement(
          "code",
          { style: { fontSize: 11 } },
          R.workspace_dir
        )
      ) : null,
      R != null && R.approval_level ? n.createElement(
        o.Item,
        { label: "审批级别" },
        R.approval_level
      ) : null
    ),
    // System prompt files
    R != null && R.system_prompt_files && R.system_prompt_files.length > 0 ? n.createElement(
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
        H ? n.createElement(H, {
          style: { fontSize: 14, color: "#1677ff" }
        }) : null,
        n.createElement(j, { strong: !0 }, "系统提示词文件")
      ),
      n.createElement(
        c,
        { wrap: !0 },
        ...R.system_prompt_files.map(
          (_, te) => n.createElement(
            r,
            {
              key: te,
              icon: H ? n.createElement(H) : void 0,
              style: { fontSize: 12 }
            },
            _
          )
        )
      )
    ) : null
  ), O = async () => {
    I(!0), h(!0);
    try {
      const _ = await Wt(!0);
      F(_);
    } catch (_) {
      x.error(_.message || "加载技能池失败");
    } finally {
      h(!1);
    }
  }, le = async (_) => {
    let te = 0, m = 0;
    for (const N of _)
      try {
        await Jt(g.id, N), te++;
      } catch {
        m++;
      }
    te > 0 ? (x.success(
      `成功添加 ${te} 个技能${m > 0 ? `，${m} 个失败` : ""}`
    ), a()) : m > 0 && x.error("添加技能失败"), I(!1);
  }, M = async (_) => {
    try {
      await Xt(g.id, _), x.success(`技能「${_}」已移除`), a();
    } catch (te) {
      x.error(te.message || "移除技能失败");
    }
  }, K = async (_) => {
    try {
      await Fn(g.id, _), x.success(`MCP「${_}」已移除`), a();
    } catch (te) {
      x.error(te.message || "移除 MCP 失败");
    }
  }, se = ie ? n.createElement(
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
        j,
        { strong: !0 },
        `已启用技能 (${z.length})`
      ),
      n.createElement(
        f,
        {
          type: "primary",
          size: "small",
          icon: T ? n.createElement(T) : void 0,
          onClick: O
        },
        "从技能池添加"
      )
    ),
    z.length === 0 ? n.createElement(C, {
      description: "该专家暂无已启用的技能",
      image: C.PRESENTED_IMAGE_SIMPLE
    }) : n.createElement(b, {
      dataSource: z,
      renderItem: (_) => n.createElement(
        b.Item,
        {
          actions: [
            n.createElement(
              f,
              {
                type: "link",
                size: "small",
                danger: !0,
                onClick: () => M(_.name)
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
            _.emoji ? n.createElement(
              "span",
              { style: { fontSize: 16 } },
              _.emoji
            ) : null,
            n.createElement(j, { strong: !0 }, _.name),
            _.version_text ? n.createElement(
              r,
              { style: { fontSize: 10 } },
              `v${_.version_text}`
            ) : null
          ),
          _.description ? n.createElement(
            B,
            {
              type: "secondary",
              style: { fontSize: 12, margin: 0 },
              ellipsis: { rows: 2 }
            },
            _.description
          ) : null,
          _.tags && _.tags.length > 0 ? n.createElement(
            "div",
            { style: { marginTop: 4 } },
            ..._.tags.map(
              (te, m) => n.createElement(
                r,
                {
                  key: m,
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
    n.createElement(Wn, {
      open: k,
      onClose: () => I(!1),
      poolSkills: V,
      installedSkillNames: z.map((_) => _.name),
      loading: $,
      onInstall: le
    })
  ), W = ie ? n.createElement(
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
        j,
        { strong: !0 },
        `MCP 客户端 (${G.length})`
      ),
      n.createElement(
        f,
        {
          type: "primary",
          size: "small",
          icon: T ? n.createElement(T) : void 0,
          onClick: () => {
            window.history.pushState({}, "", `/agents/${g.id}/mcp`), window.dispatchEvent(new PopStateEvent("popstate"));
          }
        },
        "配置 MCP"
      )
    ),
    G.length === 0 ? n.createElement(C, {
      description: "该专家暂无关联的 MCP 客户端，点击「配置 MCP」添加",
      image: C.PRESENTED_IMAGE_SIMPLE
    }) : n.createElement(b, {
      dataSource: G,
      renderItem: (_) => n.createElement(
        b.Item,
        {
          actions: [
            n.createElement(
              f,
              {
                type: "link",
                size: "small",
                danger: !0,
                onClick: () => K(_.key)
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
              j,
              { strong: !0 },
              _.name || _.key
            ),
            n.createElement(
              r,
              {
                color: _.enabled ? "green" : "default",
                style: { fontSize: 10 }
              },
              _.enabled ? "启用" : "停用"
            ),
            n.createElement(
              r,
              { color: "purple", style: { fontSize: 10 } },
              _.transport
            )
          ),
          _.description ? n.createElement(
            B,
            {
              type: "secondary",
              style: { fontSize: 12, margin: 0 },
              ellipsis: { rows: 2 }
            },
            _.description
          ) : null,
          _.tools && _.tools.length > 0 ? n.createElement(
            "div",
            {
              style: {
                marginTop: 4,
                fontSize: 11,
                color: "#8c8c8c"
              }
            },
            `提供 ${_.tools.length} 个工具`
          ) : null
        )
      )
    })
  ), Q = R != null && R.tools ? n.createElement(
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
        J ? n.createElement(J, {
          style: { fontSize: 14, color: "#1677ff" }
        }) : null,
        n.createElement(j, { strong: !0 }, "工具配置")
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
        JSON.stringify(R.tools, null, 2)
      )
    )
  ) : n.createElement(C, {
    description: "暂无工具配置",
    image: C.PRESENTED_IMAGE_SIMPLE
  }), me = [
    { key: "basic", label: "基本信息", children: u },
    {
      key: "skills",
      label: `技能 (${z.length})`,
      children: se
    },
    {
      key: "prompts",
      label: "推荐提问",
      children: n.createElement(vl, {
        skills: z,
        agentId: g.id
      })
    },
    {
      key: "knowledge",
      label: "专家记忆",
      children: n.createElement(Jn, {
        agentId: g.id,
        systemPromptFiles: (R == null ? void 0 : R.system_prompt_files) || [],
        onRefresh: () => a()
      })
    },
    { key: "mcp", label: `MCP (${G.length})`, children: W },
    { key: "tools", label: "工具配置", children: Q }
  ];
  return n.createElement(
    s,
    {
      title: n.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 8 } },
        n.createElement(Ae, { name: g.name, size: 28 }),
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
            icon: U ? n.createElement(U) : void 0,
            onClick: () => {
              l();
              try {
                const _ = P();
                _.setSelectedAgent && _.setSelectedAgent(g.id);
              } catch (_) {
                console.warn("[ugsci] Failed to set selected agent:", _);
              }
              setTimeout(() => y("/agents"), 0);
            }
          },
          "编辑专家"
        ),
        n.createElement(
          f,
          {
            type: "primary",
            size: "small",
            icon: Z ? n.createElement(Z) : void 0,
            onClick: () => {
              l();
              try {
                const _ = P();
                _.setSelectedAgent && _.setSelectedAgent(g.id);
              } catch (_) {
                console.warn("[ugsci] Failed to set selected agent:", _);
              }
              setTimeout(() => y("/chat"), 0);
            }
          },
          "开始对话"
        )
      )
    },
    n.createElement(w, {
      items: me,
      defaultActiveKey: "basic"
    })
  );
}
function Il({
  open: e,
  onClose: t,
  onCreated: l
}) {
  const a = P().React, { useState: n } = a, {
    Modal: s,
    Card: o,
    Tag: r,
    Input: d,
    Row: c,
    Col: f,
    Spin: C,
    message: w,
    Typography: b
  } = P().antd, { Text: v } = b, { FileAddOutlined: E } = P().antdIcons || {}, [x, j] = n(!1), [B, U] = n(""), [Z, H] = n(!1), J = async (I, V) => {
    j(!0);
    try {
      const F = await re("/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: I || "新专家",
          description: V || "",
          skill_names: []
        })
      });
      await xt(
        F.id,
        "AGENTS.md",
        `# ${I || "新专家"}

请在此处编写该专家的系统提示词。
`
      ), w.success("专家「" + (I || "新专家") + "」创建成功"), H(!1), setTimeout(() => {
        t(), l();
      }, 0);
    } catch (F) {
      w.error(F.message || "创建专家失败");
    } finally {
      j(!1);
    }
  }, T = _l.filter((I) => {
    if (!B.trim()) return !0;
    const V = B.toLowerCase();
    return I.name.toLowerCase().includes(V) || I.description.toLowerCase().includes(V) || I.category.toLowerCase().includes(V);
  }), k = async (I) => {
    j(!0);
    try {
      const V = await re("/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: I.name,
          description: I.description,
          skill_names: I.recommended_skills
        })
      });
      await xt(V.id, "AGENTS.md", I.system_prompt);
      const F = await Ht(V.id);
      F.approval_level = I.approval_level, await re(`/agents/${encodeURIComponent(V.id)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(F)
      }), w.success(`专家「${I.name}」创建成功`), t(), l();
    } catch (V) {
      w.error(V.message || "创建专家失败");
    } finally {
      j(!1);
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
          value: B,
          onChange: (I) => U(I.target.value),
          allowClear: !0
        })
      ),
      x ? a.createElement(
        "div",
        { style: { textAlign: "center", padding: 60 } },
        a.createElement(C, { size: "large" }),
        a.createElement(
          "div",
          { style: { marginTop: 12, color: "#8c8c8c" } },
          "正在创建专家..."
        )
      ) : a.createElement(
        c,
        { gutter: [12, 12] },
        // ── Blank template card (always first) ──
        B.trim() ? null : a.createElement(
          f,
          { xs: 24, sm: 12 },
          a.createElement(
            o,
            {
              hoverable: !0,
              size: "small",
              onClick: () => H(!0),
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
                E ? a.createElement(E) : "📝"
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
                    r,
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
        ...T.map(
          (I) => a.createElement(
            f,
            { key: I.id, xs: 24, sm: 12 },
            a.createElement(
              o,
              {
                hoverable: !0,
                size: "small",
                onClick: () => k(I),
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
                a.createElement(Ae, {
                  name: I.name,
                  size: 40
                }),
                a.createElement(
                  "div",
                  { style: { flex: 1 } },
                  a.createElement(
                    v,
                    { strong: !0, style: { fontSize: 15 } },
                    I.name
                  ),
                  a.createElement(
                    "div",
                    null,
                    a.createElement(
                      r,
                      { color: "blue", style: { fontSize: 10 } },
                      I.category
                    ),
                    I.approval_level === "MANUAL" ? a.createElement(
                      r,
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
                zt(I.description, a)
              )
            )
          )
        )
      )
    ),
    // ── Blank template creation modal (sibling, not nested inside Modal) ──
    a.createElement(Ol, {
      open: Z,
      onCancel: () => H(!1),
      onCreate: J
    })
  );
}
function Ol({
  open: e,
  onCancel: t,
  onCreate: l
}) {
  const a = P().React, { useState: n, useEffect: s } = a, { Modal: o, Input: r, message: d } = P().antd, [c, f] = n(""), [C, w] = n(""), [b, v] = n(!1);
  return s(() => {
    e && (f(""), w(""), v(!1));
  }, [e]), a.createElement(
    o,
    {
      open: e,
      title: "从空白模版创建专家",
      onCancel: t,
      onOk: () => {
        if (!c.trim()) {
          d.warning("请输入专家名称");
          return;
        }
        v(!0), Promise.resolve(l(c.trim(), C.trim())).finally(() => {
          v(!1);
        });
      },
      okText: "创建",
      cancelText: "取消",
      okButtonProps: { loading: b },
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
      a.createElement(r, {
        placeholder: "输入专家名称",
        value: c,
        onChange: (E) => f(E.target.value),
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
      a.createElement(r.TextArea, {
        placeholder: "简要描述该专家的职责和能力...",
        value: C,
        onChange: (E) => w(E.target.value),
        rows: 3,
        maxLength: 200
      })
    )
  );
}
const Vn = "ugsci_custom_teams";
function Al(e) {
  if (!e || typeof e != "object") return !1;
  const t = e;
  return typeof t.id == "string" && typeof t.name == "string" && typeof t.taskTemplate == "string" && typeof t.orchestrationPrompt == "string" && Array.isArray(t.members);
}
function St() {
  try {
    const e = JSON.parse(
      localStorage.getItem(Vn) || "[]"
    );
    return Array.isArray(e) ? e.filter(Al) : [];
  } catch {
    return [];
  }
}
function Yn(e) {
  try {
    localStorage.setItem(Vn, JSON.stringify(e));
  } catch {
  }
}
async function Pl(e) {
  var n, s;
  const t = (n = e.body) == null ? void 0 : n.getReader();
  if (!t) return;
  const l = new TextDecoder();
  let a = "";
  try {
    for (; ; ) {
      const { done: o, value: r } = await t.read();
      if (o) break;
      a += l.decode(r, { stream: !0 });
      let d;
      for (; (d = a.indexOf(`

`)) >= 0; ) {
        const c = a.slice(0, d);
        a = a.slice(d + 2);
        for (const f of c.split(`
`)) {
          if (!f.startsWith("data: ")) continue;
          const C = f.slice(6);
          let w;
          try {
            w = JSON.parse(C);
          } catch {
            continue;
          }
          if (w.error) {
            const b = w.error, v = typeof b == "string" ? b : (b == null ? void 0 : b.message) || "工作流启动失败";
            throw new Error(v);
          }
          if (w.object === "response" || w.type === "response") {
            const b = w.status;
            if (b === "failed" || b === "error") {
              const v = ((s = w.error) == null ? void 0 : s.message) || "工作流启动失败";
              throw new Error(v);
            }
            return;
          }
          if (w.object === "content" || w.type === "message")
            return;
        }
      }
    }
  } finally {
    t.releaseLock();
  }
}
async function $l(e, t, l) {
  const a = `console:default:team-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, n = await fetch(Ne("/chats"), {
    method: "POST",
    headers: {
      ...Ct(),
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
  const o = (await n.json()).id, r = await fetch(Ne("/console/chat"), {
    method: "POST",
    headers: {
      ...Ct(),
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
  if (!r.ok) {
    const d = await r.text().catch(() => "");
    throw new Error(d || `HTTP ${r.status}`);
  }
  return await Pl(r), o;
}
async function Ml(e) {
  const t = await fetch(Ne("/ugsci/team/custom"), {
    method: "POST",
    headers: { ...Ct(), "Content-Type": "application/json" },
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
function kt(e, t) {
  var n;
  const l = t.replace(/\s+/g, ""), a = e.find(
    (s) => s.name === t || s.name.replace(/\s+/g, "") === l
  );
  return a ? a.id : ((n = e.find(
    (s) => s.name.includes(t) || t.includes(s.name) || s.name.replace(/\s+/g, "").includes(l)
  )) == null ? void 0 : n.id) || null;
}
function Vt() {
  var t;
  const e = (t = window.QwenPaw) == null ? void 0 : t.host;
  if (!e) throw new Error("[ugsci] QwenPaw.host not available");
  return e;
}
function Rl(e) {
  const t = Vt().getApiToken() || "";
  return {
    "Content-Type": "application/json",
    ...t ? { Authorization: `Bearer ${t}` } : {},
    ...e ? { "X-Agent-Id": e } : {}
  };
}
async function Qn(e, t, l) {
  try {
    const a = await fetch(Vt().getApiUrl(e), {
      headers: Rl(t),
      signal: l
    });
    return a.ok ? await a.json() : null;
  } catch {
    return null;
  }
}
function Ll(e, t) {
  return Qn("/ugsci/team/state", e, t);
}
async function jl() {
  const e = await Qn(
    "/ugsci/team/preset-teams"
  );
  return (e == null ? void 0 : e.teams) ?? null;
}
const Bl = {
  plan: { label: "规划", color: "#1677ff", icon: "📋" },
  dispatch: { label: "分派", color: "#13c2c2", icon: "🚀" },
  verify: { label: "验证", color: "#fa8c16", icon: "🔍" },
  synthesize: { label: "综合", color: "#722ed1", icon: "📊" },
  completed: { label: "完成", color: "#52c41a", icon: "✅" }
}, In = [
  "plan",
  "dispatch",
  "verify",
  "synthesize",
  "completed"
], Ul = 3;
function Nl() {
  const e = Vt(), t = e.React, { useState: l, useEffect: a, useCallback: n, useRef: s } = t, { Card: o, Tag: r, Typography: d, Button: c, Steps: f, Empty: C, Alert: w } = e.antd, { ReloadOutlined: b } = e.antdIcons || {}, { Text: v, Paragraph: E } = d, x = e.useSelectedAgent ? e.useSelectedAgent() : { id: "default" }, j = (x == null ? void 0 : x.id) || "default", [B, U] = l(null), [Z, H] = l(!1), J = s(null), T = s(0), k = s(0), I = s(null), V = n(
    async (u) => {
      var K;
      (K = I.current) == null || K.abort();
      const O = new AbortController();
      I.current = O;
      const le = ++k.current;
      u && H(!0);
      const M = await Ll(j, O.signal);
      O.signal.aborted || le !== k.current || (M ? (T.current = 0, J.current = M, U(M)) : T.current += 1, H(!1));
    },
    [j]
  ), F = n(() => V(!0), [V]);
  if (a(() => {
    var O;
    (O = I.current) == null || O.abort(), k.current += 1, T.current = 0, J.current = null, U(null), F();
    const u = window.setInterval(() => {
      var le, M;
      T.current >= Ul || ((le = J.current) == null ? void 0 : le.status) === "completed" || ((M = J.current) == null ? void 0 : M.status) === "terminated" || V(!1);
    }, 5e3);
    return () => {
      var le;
      window.clearInterval(u), (le = I.current) == null || le.abort(), k.current += 1;
    };
  }, [j, V, F]), (B == null ? void 0 : B.status) === "unreadable")
    return t.createElement(w, {
      type: "warning",
      showIcon: !0,
      message: "专家团状态暂时无法读取",
      description: `实例 ${B.instance_id || "未知"} 的状态文件需要检查。`,
      style: { marginBottom: 16 },
      action: t.createElement(
        c,
        { size: "small", onClick: F, loading: Z },
        "重试"
      )
    });
  if (!B || !B.active) {
    if ((B == null ? void 0 : B.status) === "completed" || (B == null ? void 0 : B.status) === "terminated") {
      const u = B.status === "completed";
      return t.createElement(w, {
        type: u ? "success" : "info",
        showIcon: !0,
        message: u ? "专家团工作流已完成" : "专家团工作流已终止",
        description: u ? `实例 ${B.instance_id || "未知"} 已完成，结果文件保留在工作区。` : `原因：${B.state.termination_reason || "未知"}`,
        style: { marginBottom: 16 }
      });
    }
    return t.createElement(C, {
      description: "暂无活跃的专家团工作流",
      style: { padding: 24 }
    });
  }
  const $ = B.state, h = $.current_phase || "plan", g = In.indexOf(h), R = $.team_name || "未知团队", X = $.team_mode || "pipeline", G = $.iteration || 0, ie = $.members || [], z = $.verify_retries || 0, y = {
    pipeline: "流水线模式",
    coordinator: "协调者模式",
    roundtable: "圆桌讨论"
  };
  return t.createElement(
    o,
    {
      size: "small",
      style: { marginBottom: 16 },
      title: t.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 8 } },
        t.createElement("span", { style: { fontSize: 16 } }, "🔄"),
        t.createElement(v, { strong: !0 }, `${R} — 工作流状态`),
        t.createElement(
          r,
          { color: "blue", style: { fontSize: 10 } },
          y[X] || X
        ),
        t.createElement(
          r,
          { style: { fontSize: 10 } },
          `迭代 ${G}`
        ),
        z > 0 ? t.createElement(
          r,
          { color: "orange", style: { fontSize: 10 } },
          `验证重试 ${z}`
        ) : null
      ),
      extra: t.createElement(
        c,
        {
          size: "small",
          type: "text",
          icon: b ? t.createElement(b) : void 0,
          onClick: F,
          loading: Z
        },
        "刷新"
      )
    },
    t.createElement(f, {
      current: g,
      size: "small",
      items: In.map((u) => {
        const O = Bl[u];
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
      ...ie.map(
        (u, O) => t.createElement(
          r,
          { key: `${u.name}-${O}`, style: { fontSize: 11 } },
          `${u.emoji || ""} ${u.name}（${u.role}）`
        )
      )
    ),
    $.task ? t.createElement(
      E,
      {
        style: {
          fontSize: 12,
          marginTop: 8,
          marginBottom: 0,
          color: "#666"
        },
        ellipsis: { rows: 2 }
      },
      `任务: ${$.task}`
    ) : null
  );
}
function Dl({ team: e }) {
  const t = P().React, { Typography: l, Tag: a } = P().antd, { Text: n } = l, s = {
    pipeline: "→",
    roundtable: "⇄",
    coordinator: "⊙"
  }, o = {
    pipeline: "#13c2c2",
    roundtable: "#722ed1",
    coordinator: "#1677ff"
  }, r = e.steps || [];
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
      ...r.length > 0 ? r.map((d, c) => [
        c > 0 && e.mode !== "roundtable" ? t.createElement(
          "div",
          {
            key: `arrow-${c}`,
            style: {
              textAlign: "center",
              color: o[e.mode],
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
              border: `1px solid ${o[e.mode]}33`,
              fontSize: 12,
              flex: e.mode === "roundtable" ? "1 1 200px" : "initial"
            }
          },
          t.createElement(Ae, {
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
              color: o[e.mode],
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
              border: `1px solid ${o[e.mode]}33`,
              fontSize: 12,
              flex: e.mode === "roundtable" ? "1 1 150px" : "initial"
            }
          },
          t.createElement(Ae, {
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
function Fl({
  open: e,
  onClose: t,
  agents: l,
  editingTeam: a,
  onSaved: n
}) {
  const s = P().React, { useState: o, useEffect: r, useCallback: d } = s, {
    Modal: c,
    Input: f,
    Button: C,
    Select: w,
    Tag: b,
    Typography: v,
    Switch: E,
    Empty: x,
    message: j,
    Divider: B,
    Steps: U
  } = P().antd, { PlusOutlined: Z, DeleteOutlined: H, SaveOutlined: J, ArrowRightOutlined: T } = P().antdIcons || {}, { Text: k, Paragraph: I } = v, [V, F] = o(""), [$, h] = o("🤝"), [g, R] = o(""), [X, G] = o(
    "pipeline"
  ), [ie, z] = o(""), [y, u] = o(""), [O, le] = o([]), [M, K] = o([]), [se, W] = o(!1);
  r(() => {
    e && (a ? (F(a.name), h(a.emoji), R(a.description), G(a.mode), z(a.coordinatorName || ""), u(a.taskTemplate), le(a.steps || []), K(a.members.map((p) => p.name))) : (F(""), h("🤝"), R(""), G("pipeline"), z(""), u(`请执行以下任务：
任务描述：{任务描述}`), le([]), K([])));
  }, [e, a]);
  const Q = d(() => {
    if (X === "roundtable") {
      const p = M.map((ne) => ({
        agentName: ne,
        instruction: "请给出你的专业评估意见",
        passContext: !1
      }));
      le(p);
    } else if (X === "pipeline") {
      const p = new Map(O.map((de) => [de.agentName, de])), ne = M.map((de) => p.get(de) || {
        agentName: de,
        instruction: "请完成你的专业部分",
        passContext: !0
      });
      le(ne);
    }
  }, [X, M, O]), me = (p) => {
    M.includes(p) || (K([...M, p]), X === "coordinator" && !ie && z(p));
  }, _ = (p) => {
    K(M.filter((ne) => ne !== p)), le(O.filter((ne) => ne.agentName !== p)), ie === p && z(M[0] || "");
  }, te = (p, ne, de) => {
    const fe = [...O];
    fe[p] = { ...fe[p], [ne]: de }, le(fe);
  }, m = () => {
    if (!V.trim()) {
      j.warning("请输入团队名称");
      return;
    }
    if (M.length < 2) {
      j.warning("至少需要选择 2 个成员");
      return;
    }
    if (!y.trim()) {
      j.warning("请输入任务模板");
      return;
    }
    if (X === "coordinator" && !ie) {
      j.warning("请选择协调者");
      return;
    }
    W(!0);
    try {
      const p = M.map(
        (pe) => {
          var Y;
          const ae = l.find((S) => S.name === pe);
          return {
            name: pe,
            role: ((Y = ae == null ? void 0 : ae.description) == null ? void 0 : Y.slice(0, 30)) || "团队成员",
            emoji: ""
          };
        }
      );
      let ne = O;
      (O.length === 0 || O.length !== M.length) && (ne = M.map((pe) => ({
        agentName: pe,
        instruction: "请完成你的专业部分",
        passContext: X === "pipeline"
      })));
      const de = {
        id: (a == null ? void 0 : a.id) || `custom-${Date.now()}`,
        name: V.trim(),
        emoji: $,
        category: "自定义",
        description: g.trim() || `${V.trim()}（${M.length}人团队）`,
        mode: X,
        members: p,
        coordinatorName: X === "coordinator" ? ie : void 0,
        taskTemplate: y.trim(),
        orchestrationPrompt: "",
        // Custom teams use steps-based instructions
        steps: ne,
        custom: !0,
        createdAt: (a == null ? void 0 : a.createdAt) || Date.now()
      }, fe = St(), Ee = fe.findIndex((pe) => pe.id === de.id);
      Ee >= 0 ? fe[Ee] = de : fe.push(de), Yn(fe), j.success(a ? "团队已更新" : "团队已创建"), n(), t();
    } catch (p) {
      j.error(p.message || "保存失败");
    } finally {
      W(!1);
    }
  }, N = l.filter(
    (p) => !M.includes(p.name)
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
        icon: J ? s.createElement(J) : void 0
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
        M.length > 0 ? s.createElement(qt, {
          members: M,
          size: 36
        }) : null,
        s.createElement(f, {
          placeholder: "团队名称（如：储层评价团队）",
          value: V,
          onChange: (p) => F(p.target.value),
          style: { flex: 1 }
        })
      ),
      s.createElement(f.TextArea, {
        placeholder: "团队描述（简述团队的目标和适用场景）",
        value: g,
        onChange: (p) => R(p.target.value),
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
        s.createElement(w, {
          value: X,
          onChange: (p) => G(p),
          style: { width: 160 },
          options: [
            { value: "pipeline", label: "🔄 流水线（依次执行）" },
            { value: "roundtable", label: "🔀 圆桌讨论（独立评估）" },
            { value: "coordinator", label: "🎯 协调者（由协调者主导）" }
          ]
        })
      )
    ),
    s.createElement(B, { style: { margin: "12px 0" } }),
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
      N.length > 0 ? s.createElement(
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
        ...N.map(
          (p) => s.createElement(
            C,
            {
              key: p.id,
              size: "small",
              icon: Z ? s.createElement(Z) : void 0,
              onClick: () => me(p.name)
            },
            p.name
          )
        )
      ) : null,
      // Selected members
      M.length === 0 ? s.createElement(x, {
        description: "请从上方添加团队成员",
        image: x.PRESENTED_IMAGE_SIMPLE
      }) : s.createElement(
        "div",
        { style: { display: "flex", flexDirection: "column", gap: 4 } },
        ...M.map(
          (p) => s.createElement(
            "div",
            {
              key: p,
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
              s.createElement(Ae, { name: p, size: 24 }),
              s.createElement(
                k,
                { strong: !0, style: { fontSize: 13 } },
                p
              ),
              X === "coordinator" && ie === p ? s.createElement(
                b,
                { color: "blue", style: { fontSize: 10 } },
                "协调者"
              ) : null
            ),
            s.createElement(
              "div",
              { style: { display: "flex", gap: 4 } },
              X === "coordinator" ? s.createElement(
                C,
                {
                  size: "small",
                  type: "link",
                  onClick: () => z(p)
                },
                "设为协调者"
              ) : null,
              s.createElement(
                C,
                {
                  size: "small",
                  type: "link",
                  danger: !0,
                  icon: H ? s.createElement(H) : void 0,
                  onClick: () => _(p)
                },
                "移除"
              )
            )
          )
        )
      )
    ),
    s.createElement(B, { style: { margin: "12px 0" } }),
    // Step 3: Define execution steps (for pipeline/roundtable)
    M.length > 0 ? s.createElement(
      "div",
      { style: { marginBottom: 16 } },
      s.createElement(
        k,
        {
          strong: !0,
          style: { display: "block", marginBottom: 8, fontSize: 13 }
        },
        `3. 编排执行步骤${X === "roundtable" ? "（各步独立执行）" : X === "pipeline" ? "（依次执行，可传递上下文）" : "（由协调者决定调用顺序）"}`
      ),
      // Auto-sync button
      s.createElement(
        C,
        {
          size: "small",
          type: "dashed",
          onClick: Q,
          style: { marginBottom: 8 }
        },
        "自动生成步骤"
      ),
      // Steps list
      O.length === 0 ? s.createElement(
        k,
        { type: "secondary", style: { fontSize: 12 } },
        "点击「自动生成步骤」或手动配置每步的指令"
      ) : s.createElement(
        "div",
        { style: { display: "flex", flexDirection: "column", gap: 6 } },
        ...O.map(
          (p, ne) => s.createElement(
            "div",
            {
              key: ne,
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
              X === "pipeline" ? s.createElement(
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
                `${ne + 1}`
              ) : s.createElement(
                "span",
                { style: { fontSize: 14 } },
                "🔀"
              ),
              s.createElement(
                b,
                { color: "blue", style: { fontSize: 11 } },
                p.agentName
              ),
              s.createElement(
                "div",
                { style: { flex: 1 } },
                s.createElement(f, {
                  placeholder: "请输入该步骤的指令...",
                  value: p.instruction,
                  onChange: (de) => te(ne, "instruction", de.target.value),
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
              s.createElement(E, {
                size: "small",
                checked: p.passContext,
                onChange: (de) => te(ne, "passContext", de)
              }),
              s.createElement(
                k,
                { type: "secondary", style: { fontSize: 11 } },
                p.passContext ? "传递上一步结果作为上下文" : "独立执行"
              )
            )
          )
        )
      )
    ) : null,
    s.createElement(B, { style: { margin: "12px 0" } }),
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
        `${M.length > 0 ? "4" : "3"}. 任务模板`
      ),
      s.createElement(f.TextArea, {
        placeholder: `输入任务模板，可用 {参数名} 作为占位符...

例如：
请对区块 {区块名} 的井 {井号} 进行储层评价`,
        value: y,
        onChange: (p) => u(p.target.value),
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
function On({
  team: e,
  agents: t,
  onLaunch: l,
  onEdit: a,
  onDelete: n
}) {
  var h;
  const s = P().React, { useState: o } = s, { Card: r, Tag: d, Typography: c, Button: f, Tooltip: C } = P().antd, {
    TeamOutlined: w,
    RocketOutlined: b,
    UserOutlined: v,
    EditOutlined: E,
    DeleteOutlined: x,
    DownOutlined: j,
    UpOutlined: B
  } = P().antdIcons || {}, { Text: U, Paragraph: Z } = c, [H, J] = o(!1), T = {
    coordinator: { label: "协调者模式", color: "blue" },
    pipeline: { label: "流水线模式", color: "cyan" },
    roundtable: { label: "圆桌讨论", color: "purple" }
  }, k = T[e.mode] || T.coordinator, I = e.members.map((g) => {
    const R = kt(t, g.name);
    return { ...g, found: !!R, agentId: R };
  }), V = I.filter((g) => g.found).length, F = e.coordinatorName || ((h = e.members[0]) == null ? void 0 : h.name), $ = F ? kt(t, F) : null;
  return s.createElement(
    r,
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
      s.createElement(qt, {
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
            U,
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
          V < e.members.length ? s.createElement(
            C,
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
          C,
          { title: "编辑" },
          s.createElement(f, {
            type: "text",
            size: "small",
            icon: E ? s.createElement(E) : void 0,
            onClick: (g) => {
              g.stopPropagation(), a(e);
            }
          })
        ) : null,
        n ? s.createElement(
          C,
          { title: "删除" },
          s.createElement(f, {
            type: "text",
            size: "small",
            danger: !0,
            icon: x ? s.createElement(x) : void 0,
            onClick: (g) => {
              g.stopPropagation(), n(e);
            }
          })
        ) : null
      ) : null
    ),
    // Description
    s.createElement(
      Z,
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
      ...I.map(
        (g) => s.createElement(
          C,
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
            s.createElement(Ae, { name: g.name, size: 18 }),
            s.createElement(
              U,
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
          g.stopPropagation(), J(!H);
        },
        icon: H ? B ? s.createElement(B) : "▲" : j ? s.createElement(j) : "▼"
      },
      H ? "收起流程" : "查看执行流程"
    ),
    H ? s.createElement(Dl, { team: e }) : null,
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
        U,
        { type: "secondary", style: { fontSize: 11 } },
        F ? `协调者: ${F}` : ""
      ),
      s.createElement(
        f,
        {
          type: "primary",
          size: "small",
          icon: b ? s.createElement(b) : void 0,
          disabled: !$,
          onClick: () => l(e),
          style: Oe
        },
        "发起团队任务"
      )
    )
  );
}
function Gl({
  agents: e,
  onLaunch: t
}) {
  const l = P().React, { useMemo: a, useState: n, useCallback: s, useEffect: o } = l, {
    Row: r,
    Col: d,
    Input: c,
    Empty: f,
    Typography: C,
    Tag: w,
    Button: b,
    Divider: v,
    Tabs: E,
    message: x,
    Popconfirm: j
  } = P().antd, { SearchOutlined: B, TeamOutlined: U, PlusOutlined: Z, RocketOutlined: H } = P().antdIcons || {}, { Text: J } = C, [T, k] = n(""), [I, V] = n([]), [F, $] = n([]), [h, g] = n(!1), [R, X] = n(!1), [G, ie] = n(null);
  o(() => {
    V(St());
    let W = !0;
    return jl().then((Q) => {
      W && (Q ? ($(Q), g(!1)) : g(!0));
    }), () => {
      W = !1;
    };
  }, []);
  const z = s(() => {
    V(St());
  }, []), y = s(
    (W) => {
      const me = St().filter((_) => _.id !== W.id);
      Yn(me), V(me), x.success(`团队「${W.name}」已删除`);
    },
    [x]
  ), u = s((W) => {
    ie(W), X(!0);
  }, []), O = s(() => {
    ie(null), X(!0);
  }, []), le = a(() => [...I, ...F], [I, F]), M = a(() => {
    if (!T.trim()) return le;
    const W = T.toLowerCase();
    return le.filter(
      (Q) => Q.name.toLowerCase().includes(W) || Q.description.toLowerCase().includes(W) || Q.category.toLowerCase().includes(W)
    );
  }, [le, T]), K = M.filter((W) => W.custom), se = M.filter((W) => !W.custom);
  return l.createElement(
    "div",
    null,
    // Workflow status card (OMP-backed)
    l.createElement(Nl),
    h ? l.createElement(P().antd.Alert, {
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
        J,
        { style: { fontSize: 13, color: "#389e0d" } },
        "OMP 驱动的专家团工作流 — 5 阶段状态机（规划→分派→验证→综合→完成），支持结构化交接、角色工具隔离、fork 并行执行和自动重试。"
      ),
      l.createElement(
        b,
        {
          type: "primary",
          size: "small",
          icon: Z ? l.createElement(Z) : void 0,
          onClick: O,
          style: Oe
        },
        "创建专家团"
      )
    ),
    // Search
    l.createElement(c, {
      placeholder: "搜索团队名称、描述或类别...",
      prefix: B ? l.createElement(B) : void 0,
      value: T,
      onChange: (W) => k(W.target.value),
      allowClear: !0,
      style: { marginBottom: 16, maxWidth: 400 }
    }),
    // Tabs: preset teams vs custom teams
    l.createElement(
      E,
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
                r,
                { gutter: [12, 12] },
                ...se.map(
                  (W) => l.createElement(
                    d,
                    { key: W.id, xs: 24, sm: 12, md: 8 },
                    l.createElement(On, {
                      team: W,
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
            label: `自定义团队${K.length ? ` (${K.length})` : ""}`,
            children: l.createElement(
              "div",
              null,
              K.length > 0 ? l.createElement(
                r,
                { gutter: [12, 12] },
                ...K.map(
                  (W) => l.createElement(
                    d,
                    { key: W.id, xs: 24, sm: 12, md: 8 },
                    l.createElement(On, {
                      team: W,
                      agents: e,
                      onLaunch: t,
                      onEdit: u,
                      onDelete: y
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
    l.createElement(Fl, {
      open: R,
      onClose: () => {
        X(!1), ie(null);
      },
      agents: e,
      editingTeam: G,
      onSaved: z
    })
  );
}
function Hl() {
  var oe;
  const e = P().React, { useState: t, useEffect: l, useCallback: a, useMemo: n } = e, {
    Spin: s,
    Empty: o,
    Input: r,
    Button: d,
    message: c,
    Row: f,
    Col: C,
    Tabs: w,
    Modal: b,
    Typography: v
  } = P().antd, {
    ReloadOutlined: E,
    PlusOutlined: x,
    SearchOutlined: j,
    TeamOutlined: B,
    UserOutlined: U
  } = P().antdIcons || {}, { Text: Z, Paragraph: H } = v, [J, T] = t([]), [k, I] = t(!0), [V, F] = t(!1), [$, h] = t(null), [g, R] = t(""), [X, G] = t(!1), [ie, z] = t("experts"), [y, u] = t(
    null
  ), [O, le] = t(""), [M, K] = t(!1), [se, W] = t(!1), [Q, me] = t(null), [_, te] = t([]), m = a(async () => {
    I(!0);
    try {
      const D = await Gt(), ue = await Promise.all(
        D.map(async (ve) => {
          try {
            const [xe, Ie, ke] = await Promise.all([
              Ht(ve.id).catch(() => null),
              Ot(ve.id).catch(() => []),
              Kt(ve.id).catch(() => [])
            ]);
            return {
              agent: ve,
              config: xe,
              skills: Ie,
              mcps: ke,
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
      T(ue), te(D);
    } catch (D) {
      c.error(D.message || "加载专家列表失败"), T([]);
    } finally {
      I(!1);
    }
  }, []);
  l(() => {
    m();
  }, [m]), l(() => {
    if (Q && se) {
      const D = J.find(
        (ue) => ue.agent.id === Q.agent.id
      );
      D && D !== Q && me(D);
    }
  }, [J, Q, se]);
  const N = a(
    async (D) => {
      var Ie;
      const ue = D.coordinatorName || ((Ie = D.members[0]) == null ? void 0 : Ie.name);
      let ve = null;
      if (ue && (ve = kt(_, ue)), !ve) {
        const ke = _[0];
        if (ke)
          ve = ke.id, c.warning(
            `未找到专家「${ue || "协调者"}」，将使用「${ke.name}」作为工作流控制器。控制器将通过 spawn_subagent 分派子任务。`
          );
        else {
          c.error("没有可用的 Agent 作为工作流控制器");
          return;
        }
      }
      if (/\{.+?\}/.test(D.taskTemplate)) {
        le(D.taskTemplate), u(D);
        return;
      }
      await p(D, ve, D.taskTemplate);
    },
    [_, c]
  ), p = a(
    async (D, ue, ve) => {
      K(!0);
      try {
        const xe = ve || D.taskTemplate;
        let Ie = D.name;
        D.custom && (Ie = `@${await Ml(D)}`);
        const ke = `/ugsci-team ${D.mode} ${Ie} ${xe}`, Fe = P();
        Fe.setSelectedAgent && Fe.setSelectedAgent(ue);
        const Pe = await $l(
          ue,
          ke,
          D.name
        );
        c.success(
          `OMP 工作流已启动：${D.name}（${D.mode}模式）`
        ), u(null), ne(`/chat/${Pe}`);
      } catch (xe) {
        c.error(xe.message || "发起团队任务失败");
      } finally {
        K(!1);
      }
    },
    [c]
  ), ne = (D) => {
    window.history.pushState({}, "", D), window.dispatchEvent(new PopStateEvent("popstate"));
  }, de = a((D) => {
    h(D), F(!0);
  }, []), fe = a((D) => {
    me(D), W(!0);
  }, []), Ee = a(
    (D) => {
      if (!D.agent.enabled) {
        c.warning(`专家「${D.agent.name}」未启用，请先启用`);
        return;
      }
      try {
        const ue = P();
        ue.setSelectedAgent && ue.setSelectedAgent(D.agent.id);
      } catch (ue) {
        console.warn("[ugsci] Failed to set selected agent:", ue);
      }
      c.success(`已召唤专家「${D.agent.name}」，正在跳转至对话...`), ne("/chat");
    },
    [c]
  ), pe = n(() => {
    if (!g.trim()) return J;
    const D = g.toLowerCase();
    return J.filter(
      (ue) => {
        var ve;
        return ue.agent.name.toLowerCase().includes(D) || ((ve = ue.agent.description) == null ? void 0 : ve.toLowerCase().includes(D)) || ue.agent.id.toLowerCase().includes(D) || ue.skills.some((xe) => xe.name.toLowerCase().includes(D));
      }
    );
  }, [J, g]), ae = J.filter((D) => D.agent.enabled).length, Y = J.reduce(
    (D, ue) => D + ue.skills.filter((ve) => ve.enabled !== !1).length,
    0
  ), S = J.reduce((D, ue) => D + ue.mcps.length, 0), q = [
    {
      key: "experts",
      label: e.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        U ? e.createElement(U, { style: { fontSize: 14 } }) : null,
        "专家列表"
      ),
      children: e.createElement(
        "div",
        null,
        // Search bar
        e.createElement(
          "div",
          { style: { marginBottom: 16 } },
          e.createElement(r, {
            placeholder: "搜索专家名称、描述或技能...",
            prefix: j ? e.createElement(j) : void 0,
            value: g,
            onChange: (D) => R(D.target.value),
            allowClear: !0,
            style: { maxWidth: 400 }
          })
        ),
        // Content
        k ? e.createElement(
          "div",
          { style: { textAlign: "center", padding: 60 } },
          e.createElement(s, { size: "large" })
        ) : pe.length === 0 ? e.createElement(o, {
          description: g ? "未找到匹配的专家" : "暂无专家，点击「创建专家」添加"
        }) : e.createElement(
          f,
          { gutter: [12, 12], align: "stretch" },
          ...pe.map(
            (D) => e.createElement(
              C,
              {
                key: D.agent.id,
                xs: 24,
                sm: 12,
                md: 8,
                lg: 6,
                style: { display: "flex" }
              },
              e.createElement(Tl, {
                expert: D,
                onClick: () => de(D),
                onSummon: () => Ee(D),
                onConfigure: () => fe(D)
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
        B ? e.createElement(B, { style: { fontSize: 14 } }) : null,
        "专家团"
      ),
      children: e.createElement(Gl, {
        agents: _,
        onLaunch: N
      })
    }
  ];
  return e.createElement(
    "div",
    { style: { padding: 24 } },
    e.createElement(It, {
      title: "专家",
      subtitle: `共 ${J.length} 位专家（${ae} 位启用）· ${Y} 个技能 · ${S} 个 MCP 客户端`,
      extra: e.createElement(
        e.Fragment,
        null,
        e.createElement(
          d,
          {
            icon: E ? e.createElement(E) : void 0,
            onClick: () => {
              tt(), m();
            },
            loading: k
          },
          "刷新"
        ),
        e.createElement(
          d,
          {
            type: "primary",
            icon: x ? e.createElement(x) : void 0,
            onClick: () => G(!0),
            style: Oe
          },
          "创建专家"
        )
      )
    }),
    e.createElement(w, {
      items: q,
      activeKey: ie,
      onChange: (D) => z(D)
    }),
    // Drawer
    e.createElement(zl, {
      expert: $,
      open: V,
      onClose: () => F(!1),
      onRefresh: () => m()
    }),
    // Template Modal
    e.createElement(Il, {
      open: X,
      onClose: () => G(!1),
      onCreated: () => m()
    }),
    // Config Modal (gear icon)
    e.createElement(xl, {
      expert: Q,
      open: se,
      onClose: () => W(!1),
      onRefresh: () => m()
    }),
    // Team Launch Modal (for filling placeholders)
    y ? e.createElement(
      b,
      {
        open: !0,
        title: e.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 8 } },
          e.createElement(qt, {
            members: y.members.map((D) => D.name),
            size: 28
          }),
          e.createElement(
            "span",
            null,
            `发起团队任务 - ${y.name}`
          )
        ),
        onCancel: () => u(null),
        onOk: () => {
          var xe;
          const D = y.coordinatorName || ((xe = y.members[0]) == null ? void 0 : xe.name), ue = D ? kt(_, D) : null;
          if (!ue) {
            c.error("无法找到协调者专家");
            return;
          }
          const ve = O.trim() || y.taskTemplate;
          p(y, ue, ve);
        },
        confirmLoading: M,
        okText: "发起任务",
        width: 600
      },
      e.createElement(
        "div",
        null,
        e.createElement(
          Z,
          {
            type: "secondary",
            style: { fontSize: 12, display: "block", marginBottom: 8 }
          },
          "任务内容（请替换 {参数名} 等占位符后发起）："
        ),
        e.createElement(r.TextArea, {
          value: O,
          onChange: (D) => le(D.target.value),
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
          Z,
          { style: { fontSize: 12, color: "#0958d9" } },
          `协调者: ${y.coordinatorName || ((oe = y.members[0]) == null ? void 0 : oe.name) || "—"} · 成员: ${y.members.map((D) => D.name).join("、")}`
        )
      )
    ) : null
  );
}
const Zn = [
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
], Wl = {
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
function He(e) {
  return (e || "").trim() || "channel";
}
function Qe(e) {
  return (e || "").trim();
}
function ea(e) {
  const t = Qe(e);
  return t === "" || t === "*";
}
function At(e) {
  return e === "user" ? "user" : "all";
}
function De(e) {
  const t = At(e.subject_type);
  return {
    source_type: He(e.source_type),
    source_value: Qe(e.source_value),
    subject_type: t,
    subject_value: t === "all" ? "" : (e.subject_value || "").trim(),
    effect: e.effect
  };
}
function Ze(e) {
  return { tool_name: e.tool_name || "*", ...De(e) };
}
function ta(e) {
  return { tool_name: e.tool_name || "*", effect: e.effect };
}
function na(e) {
  return [...e].map(De).sort(
    (t, l) => t.source_type.localeCompare(l.source_type) || t.source_value.localeCompare(l.source_value) || t.subject_type.localeCompare(l.subject_type) || t.subject_value.localeCompare(l.subject_value)
  );
}
function _t(e) {
  return [...e].map(Ze).sort(
    (t, l) => t.tool_name.localeCompare(l.tool_name) || t.source_type.localeCompare(l.source_type) || t.source_value.localeCompare(l.source_value) || t.subject_type.localeCompare(l.subject_type) || t.subject_value.localeCompare(l.subject_value)
  );
}
function aa(e) {
  return [...e].map(ta).sort((t, l) => t.tool_name.localeCompare(l.tool_name));
}
function Le(e) {
  return {
    default_effect: e.default_effect || "deny",
    client_overrides: na(e.client_overrides || []),
    tool_defaults: aa(e.tool_defaults || []),
    tool_overrides: _t(e.tool_overrides || []),
    unmanaged_rules_count: e.unmanaged_rules_count || 0
  };
}
function Me(e) {
  return [He(e.source_type), Qe(e.source_value), At(e.subject_type), e.subject_type === "all" ? "" : (e.subject_value || "").trim()].join("\0");
}
function Re(e) {
  return [e.tool_name || "*", He(e.source_type), Qe(e.source_value), At(e.subject_type), e.subject_type === "all" ? "" : (e.subject_value || "").trim()].join("\0");
}
function Jl(e, t) {
  const l = Le(t), a = /* @__PURE__ */ new Map();
  l.tool_overrides.forEach((c) => {
    const f = Ze(c), C = a.get(f.tool_name) || [];
    C.push(f), a.set(f.tool_name, C);
  });
  const n = new Map(l.tool_defaults.map((c) => [c.tool_name, ta(c)])), s = new Set(e.map((c) => c.name)), o = e.map((c) => {
    var f;
    return {
      toolName: c.name,
      description: c.description,
      inputSchema: c.input_schema,
      stale: !1,
      defaultEffect: ((f = n.get(c.name)) == null ? void 0 : f.effect) || l.default_effect,
      hasExplicitDefault: n.has(c.name),
      rules: _t(a.get(c.name) || [])
    };
  }), r = /* @__PURE__ */ new Set([...a.keys(), ...n.keys()]), d = Array.from(r).filter((c) => c !== "*" && !s.has(c)).map((c) => {
    var f;
    return {
      toolName: c,
      description: "",
      inputSchema: {},
      stale: !0,
      defaultEffect: ((f = n.get(c)) == null ? void 0 : f.effect) || l.default_effect,
      hasExplicitDefault: n.has(c),
      rules: _t(a.get(c) || [])
    };
  });
  return [...o, ...d];
}
function la(e, t) {
  const l = Le(e), a = new Set(
    t === null ? l.client_overrides.map((n) => Me(De(n))) : l.tool_overrides.filter((n) => n.tool_name === t).map((n) => Re(Ze(n)))
  );
  for (const n of Zn) {
    const s = t === null ? Me({ source_type: "channel", source_value: n, subject_type: "all", subject_value: "" }) : Re({ tool_name: t, source_type: "channel", source_value: n, subject_type: "all", subject_value: "" });
    if (!a.has(s)) return n;
  }
  return "console";
}
function Xl(e) {
  return Ut(e, { source_type: "channel", source_value: la(e, null), subject_type: "all", subject_value: "", effect: "ask" });
}
function Kl(e, t) {
  return Nt(e, { tool_name: t, source_type: "channel", source_value: la(e, t), subject_type: "all", subject_value: "", effect: "ask" });
}
function Ut(e, t, l) {
  const a = Le(e), n = De(t), s = Me(l || n), o = Me(n), r = a.client_overrides.filter((d) => {
    const c = Me(De(d));
    return c !== s && c !== o;
  });
  return r.push(n), { ...a, client_overrides: na(r) };
}
function Nt(e, t, l) {
  const a = Le(e), n = Ze(t), s = Re(l || n), o = Re(n), r = a.tool_overrides.filter((d) => {
    const c = Re(Ze(d));
    return c !== s && c !== o;
  });
  return r.push(n), { ...a, tool_overrides: _t(r) };
}
function ql(e, t, l) {
  const a = Le(e), n = a.tool_defaults.filter((s) => s.tool_name !== t);
  return n.push({ tool_name: t, effect: l }), { ...a, tool_defaults: aa(n) };
}
function Vl(e, t) {
  const l = Le(e), a = Me(t);
  return { ...l, client_overrides: l.client_overrides.filter((n) => Me(De(n)) !== a) };
}
function Yl(e, t) {
  const l = Le(e), a = Re(t);
  return { ...l, tool_overrides: l.tool_overrides.filter((n) => Re(Ze(n)) !== a) };
}
function sa(e, t) {
  const l = He(t.source_type), a = Qe(t.source_value);
  if (ea(a)) return [];
  const n = /* @__PURE__ */ new Map();
  return e.forEach((s) => {
    if (He(s.source_type) !== l || Qe(s.source_value) !== a) return;
    const o = (s.subject_value || "").trim();
    !o || n.has(o) || n.set(o, s);
  }), Array.from(n.values());
}
function Ql(e, t) {
  return sa(e, t).map((l) => ({ label: l.subject_value, value: l.subject_value }));
}
function Yt(e) {
  return He(e.source_type) === "channel" && ea(e.source_value) && At(e.subject_type) === "user" && !!(e.subject_value || "").trim();
}
function Zl(e, t) {
  const l = De(t);
  return l.subject_type === "user" && !!l.subject_value && l.subject_value !== "*" && e.some((a) => He(a.source_type) === l.source_type) && !Yt(l) && !sa(e, l).some((a) => a.subject_value === l.subject_value);
}
function es(e) {
  const t = [...e.client_overrides || [], ...e.tool_overrides || []];
  for (const l of t) {
    const a = De(l);
    if (a.subject_type === "user") {
      if (!a.subject_value || a.subject_value === "*" || !a.source_value) return { reason: "missingUserValue", rule: l };
      if (Yt(a)) return { reason: "ambiguousUserSource", rule: l };
    }
  }
  return null;
}
function An(e, t) {
  const l = { ...e, ...t };
  return t.subject_type && (l.subject_value = ""), (t.source_type !== void 0 || t.source_value !== void 0) && t.subject_value === void 0 && l.subject_type === "user" && (l.subject_value = ""), l;
}
function Bt(e) {
  return JSON.stringify(Le(e));
}
function ts({
  client: e,
  agentId: t,
  open: l,
  onClose: a,
  onSave: n
}) {
  const s = P().React, { useState: o, useEffect: r, useMemo: d, useCallback: c } = s, { Modal: f, Spin: C, Empty: w, Button: b, Tag: v, Segmented: E, Select: x, Input: j, AutoComplete: B, Typography: U, message: Z } = P().antd, { PlusOutlined: H, DeleteOutlined: J } = P().antdIcons || {}, { Text: T } = U, [k, I] = o(null), [V, F] = o([]), [$, h] = o([]), [g, R] = o(!1), [X, G] = o(!1), [ie, z] = o(""), [y, u] = o("");
  r(() => {
    if (!l) return;
    let m = !1;
    return (async () => {
      R(!0), F([]), h([]), z("");
      try {
        const p = await Wa(t, e.key);
        if (!m) {
          const ne = Le(p);
          I(ne), u(Bt(ne));
        }
        try {
          const ne = await Xa(t);
          m || h(ne);
        } catch {
          m || h([]);
        }
        if (!e.enabled) {
          m || z("MCP 客户端未启用，无法获取工具列表");
          return;
        }
        try {
          const ne = await Ha(t, e.key);
          m || F(ne);
        } catch (ne) {
          m || z((ne == null ? void 0 : ne.message) || "无法加载工具列表");
        }
      } catch {
        m || (I(null), u(""), z("加载访问策略失败"));
      } finally {
        m || R(!1);
      }
    })(), () => {
      m = !0;
    };
  }, [l, e.key, e.enabled, t]);
  const O = d(() => k ? Jl(V, k) : [], [V, k]), le = d(() => !!(k && Bt(k) !== y), [k, y]), M = (m) => Wl[m] || m, K = c((m) => {
    I((N) => N && { ...N, default_effect: m });
  }, []), se = c((m, N) => {
    I((p) => p && Ut(p, An(m, N), { source_type: m.source_type, source_value: m.source_value, subject_type: m.subject_type, subject_value: m.subject_value }));
  }, []), W = c((m, N) => {
    I((p) => p && Nt(p, An(m, N), { tool_name: m.tool_name, source_type: m.source_type, source_value: m.source_value, subject_type: m.subject_type, subject_value: m.subject_value }));
  }, []), Q = c(async () => {
    if (!k) return;
    const m = es(k);
    if (m) {
      Z.error(m.reason === "missingUserValue" ? "用户规则缺少用户标识" : "用户来源不明确");
      return;
    }
    G(!0);
    try {
      await n(e.key, k) && (u(Bt(k)), a());
    } finally {
      G(!1);
    }
  }, [k, e.key, n, a, Z]), me = c(() => {
    if (!le || X) {
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
  }, [le, X, a]), _ = c((m, N) => {
    const p = Ql($, m), ne = Yt(m), de = Zl($, m), fe = [{ label: "所有渠道", value: "*" }, ...Zn.map((q) => ({ label: M(q), value: q }))], Ee = [{ label: "所有人", value: "all" }, { label: "指定用户", value: "user" }], pe = (q) => {
      N ? W(m, q) : se(m, q);
    }, ae = (q) => {
      I(N ? (oe) => oe && Nt(oe, { ...m, effect: q }) : (oe) => oe && Ut(oe, { ...m, effect: q }));
    }, Y = () => {
      I(N ? (q) => q && Yl(q, { tool_name: m.tool_name, source_type: m.source_type, source_value: m.source_value, subject_type: m.subject_type, subject_value: m.subject_value }) : (q) => q && Vl(q, { source_type: m.source_type, source_value: m.source_value, subject_type: m.subject_type, subject_value: m.subject_value }));
    }, S = N ? Re(m) : Me(m);
    return s.createElement(
      "div",
      { key: S, style: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr auto", gap: 6, alignItems: "end", padding: "6px 0", borderBottom: "1px solid #f5f5f5" } },
      // source_type
      s.createElement(
        "div",
        null,
        s.createElement(T, { style: { fontSize: 11, color: "#999", display: "block", marginBottom: 2 } }, "来源类型"),
        s.createElement(x, {
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
        s.createElement(T, { style: { fontSize: 11, color: "#999", display: "block", marginBottom: 2 } }, "来源"),
        m.source_type === "channel" ? s.createElement(x, { size: "small", style: { width: "100%" }, value: m.source_value || "*", onChange: (q) => pe({ source_value: q }), options: fe }) : s.createElement(j, { size: "small", placeholder: "来源标识", value: m.source_value, onChange: (q) => pe({ source_value: q.target.value }) })
      ),
      // subject_type
      s.createElement(
        "div",
        null,
        s.createElement(T, { style: { fontSize: 11, color: "#999", display: "block", marginBottom: 2 } }, "对象类型"),
        s.createElement(x, { size: "small", style: { width: "100%" }, value: m.subject_type, onChange: (q) => pe({ subject_type: q }), options: Ee })
      ),
      // subject_value
      s.createElement(
        "div",
        null,
        s.createElement(T, { style: { fontSize: 11, color: "#999", display: "block", marginBottom: 2 } }, "对象"),
        m.subject_type === "user" ? s.createElement(
          "div",
          null,
          s.createElement(B, {
            size: "small",
            style: { width: "100%" },
            value: m.subject_value,
            options: p,
            placeholder: p.length > 0 ? "用户 ID" : "无近期用户",
            onChange: (q) => pe({ subject_value: q }),
            onSelect: (q) => pe({ subject_value: q }),
            filterOption: (q, oe) => String((oe == null ? void 0 : oe.value) || "").toLowerCase().includes(q.toLowerCase())
          }),
          ne ? s.createElement(T, { style: { fontSize: 10, color: "#fa8c16", display: "block" } }, "请先选择具体渠道") : null,
          de ? s.createElement(T, { style: { fontSize: 10, color: "#fa8c16", display: "block" } }, "未知的用户标识") : null
        ) : s.createElement(j, { size: "small", disabled: !0, value: "所有人" })
      ),
      // effect
      s.createElement(
        "div",
        null,
        s.createElement(T, { style: { fontSize: 11, color: "#999", display: "block", marginBottom: 2 } }, "效果"),
        s.createElement(x, {
          size: "small",
          style: { width: "100%" },
          value: m.effect,
          onChange: (q) => ae(q),
          options: [{ label: "允许", value: "allow" }, { label: "询问", value: "ask" }, { label: "拒绝", value: "deny" }]
        })
      ),
      // delete
      s.createElement(b, { size: "small", type: "text", icon: s.createElement(J), onClick: Y, title: "删除规则" })
    );
  }, [$, se, W]), te = (m, N) => {
    const ne = {
      ask: { bg: "rgba(245,158,11,0.24)", border: "rgba(217,119,6,0.36)", text: "#8a4b00" },
      allow: { bg: "rgba(34,197,94,0.22)", border: "rgba(22,163,74,0.35)", text: "#17643a" },
      deny: { bg: "rgba(239,68,68,0.2)", border: "rgba(220,38,38,0.34)", text: "#9f1f26" }
    }[m];
    return s.createElement(E, {
      size: "small",
      value: m,
      onChange: (de) => N(de),
      style: { "--mcp-policy-segment-bg": ne.bg, "--mcp-policy-segment-border": ne.border, "--mcp-policy-segment-text": ne.text },
      options: [{ label: "询问", value: "ask" }, { label: "允许", value: "allow" }, { label: "拒绝", value: "deny" }]
    });
  };
  return s.createElement(
    f,
    {
      title: `${e.name || e.key} - 工具与访问策略`,
      open: l,
      onCancel: me,
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
        s.createElement(b, { onClick: me, style: { marginRight: 8 } }, "取消"),
        s.createElement(b, { type: "primary", onClick: Q, loading: X, disabled: !k || g }, "保存")
      )
    },
    g && !k ? s.createElement("div", { style: { textAlign: "center", padding: 40 } }, s.createElement(C)) : k ? s.createElement(
      "div",
      null,
      // ── Client-level panel ──
      s.createElement(
        "div",
        { style: { marginBottom: 16, padding: "12px 16px", background: "#fafafa", borderRadius: 8, border: "1px solid #f0f0f0" } },
        s.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 } },
          s.createElement(T, { strong: !0 }, "客户端访问策略"),
          s.createElement(
            "div",
            { style: { display: "flex", alignItems: "center", gap: 8 } },
            s.createElement(T, { style: { fontSize: 12, color: "#666" } }, "默认:"),
            te(k.default_effect, K),
            s.createElement(b, { size: "small", icon: s.createElement(H), onClick: () => I((m) => m && Xl(m)) }, "添加规则")
          )
        ),
        k.client_overrides.length === 0 ? s.createElement(T, { style: { fontSize: 12, color: "#999" } }, "暂无客户端级覆盖规则") : s.createElement("div", null, ...k.client_overrides.map((m) => _(m, !1)))
      ),
      // ── Error message ──
      ie ? s.createElement("div", { style: { color: "#ff4d4f", fontSize: 12, marginBottom: 8 } }, ie) : null,
      // ── Tool-level panel ──
      s.createElement(T, { strong: !0, style: { display: "block", marginBottom: 8 } }, "工具访问策略"),
      O.length === 0 ? s.createElement(w, { description: "暂无工具" }) : s.createElement(
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
                s.createElement(v, { color: m.stale ? "default" : "blue" }, m.toolName),
                m.stale ? s.createElement(v, { color: "orange" }, "已失效") : null
              ),
              s.createElement(
                "div",
                { style: { display: "flex", alignItems: "center", gap: 8 } },
                s.createElement(T, { style: { fontSize: 12, color: "#666" } }, "默认:"),
                te(m.defaultEffect, (N) => I((p) => p && ql(p, m.toolName, N))),
                s.createElement(b, { size: "small", icon: s.createElement(H), onClick: () => I((N) => N && Kl(N, m.toolName)) }, "添加规则")
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
            m.rules.length === 0 ? s.createElement(T, { style: { fontSize: 12, color: "#999" } }, "暂无工具级覆盖规则") : s.createElement("div", null, ...m.rules.map((N) => _(N, !0)))
          )
        )
      )
    ) : s.createElement("div", { style: { color: "#ff4d4f" } }, "加载访问策略失败")
  );
}
function ns({
  client: e,
  agentId: t,
  open: l,
  onClose: a,
  onAuthChanged: n
}) {
  var G, ie, z, y, u;
  const s = P().React, { useState: o, useCallback: r, useEffect: d } = s, { Modal: c, Button: f, Input: C, Typography: w, message: b } = P().antd, { Text: v } = w, [E, x] = o("idle"), [j, B] = o(""), [U, Z] = o(!1), [H, J] = o(((G = e.oauth_status) == null ? void 0 : G.client_id) || ""), [T, k] = o(((ie = e.oauth_status) == null ? void 0 : ie.scope) || ""), [I, V] = o(""), [F, $] = o("");
  d(() => {
    if (E !== "waiting") return;
    const O = setInterval(async () => {
      try {
        (await qa(t, e.key)).authorized && (x("success"), n());
      } catch {
      }
    }, 2e3);
    return () => clearInterval(O);
  }, [E, e.key, t, n]);
  const h = E === "success" || E === "idle" && ((z = e.oauth_status) == null ? void 0 : z.authorized) === !0, g = E === "idle" && ((y = e.oauth_status) == null ? void 0 : y.authorized) && e.oauth_status.expires_at > 0 && e.oauth_status.expires_at < Date.now() / 1e3, R = r(async () => {
    var O;
    if (!((O = e.url) != null && O.trim())) {
      B("缺少 URL");
      return;
    }
    x("starting"), B("");
    try {
      const le = await Ka(t, e.key, {
        url: e.url,
        scope: T,
        client_id: H,
        auth_endpoint: I,
        token_endpoint: F
      });
      x("waiting"), window.open(le.auth_url, "_blank", "popup,width=600,height=700");
    } catch (le) {
      x("error"), B((le == null ? void 0 : le.message) || "OAuth 启动失败");
    }
  }, [t, e.key, e.url, T, H, I, F]), X = r(async () => {
    x("revoking");
    try {
      await Va(t, e.key), x("idle"), n();
    } catch {
      x("idle");
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
          { style: { fontSize: 12, padding: "2px 8px", borderRadius: 12, border: "1px solid", color: g ? "#e67e22" : h ? "#27ae60" : "#7f8c8d", borderColor: g ? "#e67e22" : h ? "#27ae60" : "#7f8c8d", background: "white" } },
          g ? "已过期" : h ? "已授权" : E === "waiting" ? "等待授权..." : E === "error" ? "授权失败" : "未授权"
        ),
        s.createElement(
          "div",
          { style: { display: "flex", gap: 8 } },
          h || g ? s.createElement(f, { size: "small", onClick: X, loading: String(E) === "revoking" }, "撤销") : null,
          s.createElement(f, { size: "small", type: h && !g ? "default" : "primary", onClick: R, loading: E === "starting" || E === "waiting", disabled: !((u = e.url) != null && u.trim()) }, h && !g ? "重新授权" : "授权")
        )
      ),
      j ? s.createElement("p", { style: { color: "#c0392b", fontSize: 12 } }, j) : null,
      // Advanced
      s.createElement(
        "div",
        { style: { marginTop: 8, cursor: "pointer", color: "#888", fontSize: 12 }, onClick: () => Z((O) => !O) },
        U ? "收起高级设置" : "展开高级设置"
      ),
      U ? s.createElement(
        "div",
        { style: { marginTop: 8, padding: "10px 12px", background: "white", borderRadius: 6, border: "1px solid #e9ecef" } },
        s.createElement(v, { style: { fontSize: 11, color: "#888", display: "block", marginBottom: 2 } }, "Client ID"),
        s.createElement(C, { size: "small", placeholder: "留空则使用动态注册", value: H, onChange: (O) => J(O.target.value) }),
        s.createElement(v, { style: { fontSize: 11, color: "#888", display: "block", marginBottom: 2, marginTop: 8 } }, "Scope"),
        s.createElement(C, { size: "small", placeholder: "OAuth scope", value: T, onChange: (O) => k(O.target.value) }),
        s.createElement(v, { style: { fontSize: 11, color: "#888", display: "block", marginBottom: 2, marginTop: 8 } }, "授权端点"),
        s.createElement(C, { size: "small", placeholder: "https://auth.example.com/authorize", value: I, onChange: (O) => V(O.target.value) }),
        s.createElement(v, { style: { fontSize: 11, color: "#888", display: "block", marginBottom: 2, marginTop: 8 } }, "令牌端点"),
        s.createElement(C, { size: "small", placeholder: "https://auth.example.com/token", value: F, onChange: (O) => $(O.target.value) })
      ) : null
    )
  );
}
function as({
  mcp: e,
  agentId: t,
  onToggle: l,
  onDelete: a,
  onUpdate: n,
  onUpdatePolicy: s,
  onRefresh: o
}) {
  const r = P().React, { useState: d } = r, { Card: c, Tag: f, Tooltip: C, Modal: w, Input: b, Button: v, Typography: E } = P().antd, { Text: x } = E, {
    EyeOutlined: j,
    EyeInvisibleOutlined: B,
    DeleteOutlined: U,
    ToolOutlined: Z
  } = P().antdIcons || {}, [H, J] = d(!1), [T, k] = d(!1), [I, V] = d(!1), [F, $] = d(""), [h, g] = d(!1), [R, X] = d(!1), G = e.transport === "streamable_http" || e.transport === "sse", ie = G ? "Remote" : "Local", z = e.oauth_status, y = Date.now() / 1e3, u = !!(z != null && z.authorized) && z.expires_at > y, O = !!(z != null && z.authorized) && z.expires_at <= y, le = !!z, M = () => {
    $(JSON.stringify(e, null, 2)), g(!1), J(!0);
  }, K = async () => {
    try {
      const W = JSON.parse(F), Q = [
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
      ], me = {};
      for (const te of Q)
        te in W && (me[te] = W[te]);
      await n(e.key, me) && (J(!1), g(!1));
    } catch {
      alert("JSON 格式错误");
    }
  }, se = JSON.stringify(e, null, 2);
  return r.createElement(
    r.Fragment,
    null,
    r.createElement(
      c,
      {
        hoverable: !0,
        onClick: M,
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
      r.createElement(
        "div",
        { style: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 } },
        r.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 6, minWidth: 0 } },
          r.createElement(
            C,
            { title: e.name },
            r.createElement(x, { strong: !0, style: { fontSize: 14, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" } }, e.name || e.key)
          ),
          r.createElement(
            "span",
            { style: { fontSize: 10, padding: "1px 6px", borderRadius: 4, background: G ? "#e6f4ff" : "#f9f0ff", color: G ? "#1677ff" : "#722ed1", flexShrink: 0 } },
            ie
          ),
          // OAuth status icons
          le && O ? r.createElement("span", { style: { fontSize: 11, color: "#e67e22", flexShrink: 0 } }, "⚠") : null,
          le && u ? r.createElement("span", { style: { fontSize: 11, color: "#27ae60", flexShrink: 0 } }, "✓") : null,
          le && !u && !O ? r.createElement("span", { style: { fontSize: 11, color: "#7f8c8d", flexShrink: 0 } }, "🔒") : null
        ),
        r.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 4, fontSize: 11, flexShrink: 0 } },
          r.createElement("span", { style: { width: 6, height: 6, borderRadius: "50%", background: e.enabled ? "#52c41a" : "#d9d9d9" } }),
          e.enabled ? "启用" : "停用"
        )
      ),
      // ── Description ──
      r.createElement(
        "p",
        { style: { fontSize: 12, color: "#666", margin: "6px 0 8px", lineHeight: 1.6, minHeight: 36, overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" } },
        e.description || "-"
      ),
      // ── Footer: tools button + secondary actions ──
      r.createElement(
        "div",
        { style: { display: "flex", flexDirection: "column", gap: 8, marginTop: "auto", paddingTop: 12, borderTop: "1px solid #f0f0f0" } },
        // Tools button
        r.createElement(
          v,
          {
            size: "small",
            icon: Z ? r.createElement(Z) : void 0,
            onClick: (W) => {
              W.stopPropagation(), V(!0);
            },
            style: { width: "100%" }
          },
          "工具与访问策略"
        ),
        // Secondary actions: oauth (remote only) + toggle + delete
        r.createElement(
          "div",
          { style: { display: "grid", gridTemplateColumns: G ? "1fr 1fr 1fr" : "1fr 1fr", gap: 8 } },
          G ? r.createElement(
            v,
            {
              size: "small",
              onClick: (W) => {
                W.stopPropagation(), X(!0);
              },
              style: {
                color: u ? "#27ae60" : O ? "#e67e22" : void 0,
                borderColor: u ? "#27ae60" : O ? "#e67e22" : void 0,
                background: u ? "rgba(39,174,96,0.06)" : O ? "rgba(230,126,34,0.06)" : void 0
              }
            },
            u ? "已授权" : O ? "已过期" : "授权"
          ) : null,
          r.createElement(
            v,
            {
              size: "small",
              icon: e.enabled ? B ? r.createElement(B) : void 0 : j ? r.createElement(j) : void 0,
              onClick: l
            },
            e.enabled ? "禁用" : "启用"
          ),
          r.createElement(
            v,
            {
              size: "small",
              danger: !0,
              icon: U ? r.createElement(U) : void 0,
              onClick: (W) => {
                W.stopPropagation(), k(!0);
              }
            },
            "删除"
          )
        )
      )
    ),
    // ── Delete Confirmation Modal ──
    r.createElement(
      w,
      {
        title: "确认删除",
        open: T,
        onOk: () => {
          k(!1), a();
        },
        onCancel: () => k(!1),
        okText: "确认删除",
        cancelText: "取消",
        okButtonProps: { danger: !0 }
      },
      r.createElement("p", null, `确定要删除 MCP 客户端「${e.name || e.key}」吗？此操作不可撤销。`)
    ),
    // ── JSON Config Modal (click card to view/edit) ──
    r.createElement(
      w,
      {
        title: `${e.name || e.key} - 配置`,
        open: H,
        onCancel: () => {
          J(!1), g(!1);
        },
        footer: r.createElement(
          "div",
          { style: { textAlign: "right" } },
          r.createElement(v, { onClick: () => {
            J(!1), g(!1);
          }, style: { marginRight: 8 } }, "取消"),
          h ? r.createElement(v, { type: "primary", onClick: K }, "保存") : r.createElement(v, { type: "primary", onClick: () => g(!0) }, "编辑")
        ),
        width: 700
      },
      r.createElement(
        "div",
        { style: { marginBottom: 8, fontSize: 12, color: "#8c8c8c" } },
        "密钥类字段（如 API_KEY）可能已被后端脱敏，保存时不会覆盖脱敏值。"
      ),
      h ? r.createElement(b.TextArea, {
        value: F,
        onChange: (W) => $(W.target.value),
        autoSize: { minRows: 15, maxRows: 25 },
        style: { fontFamily: "Monaco, Courier New, monospace", fontSize: 13 }
      }) : r.createElement(
        "pre",
        { style: { backgroundColor: "#f5f5f5", padding: 16, borderRadius: 8, maxHeight: 400, overflow: "auto", fontSize: 13, fontFamily: "Monaco, Courier New, monospace" } },
        se
      )
    ),
    // ── Access Modal (tools + access policy) ──
    r.createElement(ts, {
      client: e,
      agentId: t,
      open: I,
      onClose: () => V(!1),
      onSave: s
    }),
    // ── OAuth Modal (remote clients only) ──
    G ? r.createElement(ns, {
      client: e,
      agentId: t,
      open: R,
      onClose: () => X(!1),
      onAuthChanged: async () => {
        await (o == null ? void 0 : o());
      }
    }) : null
  );
}
const Dt = {
  reservoir_simulation: "油藏数值模拟",
  geological_modeling: "地质建模",
  well_log_analysis: "测井分析",
  production_engineering: "采油工程",
  post_processing: "后处理与可视化",
  multiphysics: "多物理场仿真"
}, ra = {
  reservoir_simulation: "🛢️",
  geological_modeling: "🏔️",
  well_log_analysis: "📡",
  production_engineering: "⚙️",
  post_processing: "📊",
  multiphysics: "🔬"
}, oa = /* @__PURE__ */ new Set(["cmg", "comsol", "tnavigator", "eclipse", "intersect", "visage"]);
function ia(e) {
  return Ne(`/ugsci/engines/icon/${encodeURIComponent(e)}`);
}
async function ls() {
  return re("/ugsci/engines/list");
}
async function ss(e) {
  return re("/ugsci/engines/", {
    method: "POST",
    body: JSON.stringify(e)
  });
}
async function rs(e, t) {
  return re(`/ugsci/engines/${encodeURIComponent(e)}`, {
    method: "PUT",
    body: JSON.stringify(t)
  });
}
async function os(e) {
  return re(
    `/ugsci/engines/${encodeURIComponent(e)}`,
    { method: "DELETE" }
  );
}
async function is() {
  return re("/ugsci/engines/detect/refresh", {
    method: "POST"
  });
}
function cs({
  engine: e,
  onClick: t
}) {
  const l = P().React, { Card: a, Tag: n, Typography: s } = P().antd, { Text: o } = s, r = e.status === "detected", d = ra[e.category] || "📦", f = oa.has(e.id) ? l.createElement("img", {
    src: ia(e.id),
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
        borderColor: r ? void 0 : "#d9d9d9",
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
            o,
            { strong: !0, style: { fontSize: 14 } },
            e.name
          ),
          l.createElement("br"),
          l.createElement(
            o,
            { type: "secondary", style: { fontSize: 11 } },
            e.vendor || "—"
          )
        )
      ),
      l.createElement(
        "div",
        { style: { display: "flex", flexDirection: "column", gap: 4, alignItems: "flex-end" } },
        r ? l.createElement(
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
        o,
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
        Dt[e.category] || e.category
      ) : null,
      e.version ? l.createElement(
        n,
        { color: "blue", style: { fontSize: 11 } },
        `v${e.version}`
      ) : null,
      ...(e.modules || []).map(
        (C) => l.createElement(
          n,
          { key: C, color: "cyan", style: { fontSize: 10 } },
          C
        )
      )
    )
  );
}
function ms() {
  const e = P().React, { useState: t, useEffect: l, useCallback: a, useMemo: n } = e, {
    Spin: s,
    Empty: o,
    Button: r,
    message: d,
    Row: c,
    Col: f,
    Drawer: C,
    Descriptions: w,
    Tag: b,
    Typography: v,
    Modal: E,
    Input: x,
    Select: j,
    Popconfirm: B,
    Space: U
  } = P().antd, {
    ReloadOutlined: Z,
    SearchOutlined: H,
    PlusOutlined: J,
    EditOutlined: T,
    DeleteOutlined: k,
    CopyOutlined: I,
    ExperimentOutlined: V
  } = P().antdIcons || {}, { Text: F, Paragraph: $ } = v, [h, g] = t([]), [R, X] = t(!0), [G, ie] = t(""), [z, y] = t(!1), [u, O] = t(null), [le, M] = t(!1), [K, se] = t(null), [W, Q] = t({}), [me, _] = t(!1), te = a(async () => {
    X(!0);
    try {
      const ae = await ls();
      g(ae.engines || []);
    } catch (ae) {
      d.error(ae.message || "加载引擎列表失败"), g([]);
    } finally {
      X(!1);
    }
  }, []);
  l(() => {
    te();
  }, [te]);
  const m = n(() => {
    if (!G.trim()) return h;
    const ae = G.toLowerCase();
    return h.filter(
      (Y) => {
        var S;
        return Y.name.toLowerCase().includes(ae) || Y.vendor.toLowerCase().includes(ae) || Y.category.toLowerCase().includes(ae) || ((S = Y.description) == null ? void 0 : S.toLowerCase().includes(ae));
      }
    );
  }, [h, G]);
  h.filter((ae) => ae.status === "detected").length;
  const N = a((ae) => {
    navigator.clipboard.writeText(ae).then(() => d.success("路径已复制")).catch(() => d.error("复制失败"));
  }, []), p = a(() => {
    se(null), Q({
      name: "",
      vendor: "",
      version: "",
      executable_path: "",
      category: "",
      description: "",
      invocation_hint: ""
    }), M(!0);
  }, []), ne = a((ae) => {
    se(ae), Q({ ...ae }), M(!0), y(!1);
  }, []), de = a(async () => {
    var ae;
    if (!((ae = W.name) != null && ae.trim())) {
      d.warning("请输入引擎名称");
      return;
    }
    _(!0);
    try {
      K ? (await rs(K.id, W), d.success("引擎已更新")) : (await ss(W), d.success("引擎已添加")), M(!1), te();
    } catch (Y) {
      d.error(Y.message || "保存失败");
    } finally {
      _(!1);
    }
  }, [W, K, te]), fe = a(
    async (ae) => {
      try {
        await os(ae), d.success("引擎已删除"), y(!1), te();
      } catch (Y) {
        d.error(Y.message || "删除失败");
      }
    },
    [te]
  ), Ee = a(async () => {
    X(!0);
    try {
      const ae = await is();
      g(ae.engines || []), d.success("自动检测完成");
    } catch (ae) {
      d.error(ae.message || "检测失败");
    } finally {
      X(!1);
    }
  }, []), pe = a(
    (ae, Y, S) => {
      const q = W[Y] || "";
      return e.createElement(
        "div",
        { style: { marginBottom: 12 } },
        e.createElement(
          F,
          { style: { fontSize: 13, display: "block", marginBottom: 4 } },
          ae
        ),
        S != null && S.select ? e.createElement(j, {
          value: q || void 0,
          onChange: (oe) => Q((D) => ({ ...D, [Y]: oe })),
          style: { width: "100%" },
          options: S.select.options,
          allowClear: !0,
          placeholder: `选择${ae}`
        }) : S != null && S.textarea ? e.createElement(x.TextArea, {
          value: q,
          onChange: (oe) => Q((D) => ({ ...D, [Y]: oe.target.value })),
          rows: 3,
          placeholder: `输入${ae}`
        }) : e.createElement(x, {
          value: q,
          onChange: (oe) => Q((D) => ({ ...D, [Y]: oe.target.value })),
          placeholder: `输入${ae}`
        })
      );
    },
    [W]
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
      e.createElement(x, {
        placeholder: "搜索引擎名称、厂商...",
        prefix: H ? e.createElement(H) : void 0,
        value: G,
        onChange: (ae) => ie(ae.target.value),
        allowClear: !0,
        style: { maxWidth: 280 }
      }),
      e.createElement(
        r,
        {
          icon: Z ? e.createElement(Z) : void 0,
          onClick: Ee,
          loading: R
        },
        "自动检测"
      ),
      e.createElement(
        r,
        {
          type: "primary",
          icon: J ? e.createElement(J) : void 0,
          onClick: p,
          style: Oe
        },
        "添加引擎"
      )
    ),
    // Content
    R ? e.createElement(
      "div",
      { style: { textAlign: "center", padding: 60 } },
      e.createElement(s, {
        size: "large",
        tip: "正在加载计算引擎..."
      })
    ) : m.length === 0 ? e.createElement(o, {
      description: G ? "无匹配引擎" : "暂无引擎，点击「添加引擎」开始"
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
          e.createElement(cs, {
            engine: ae,
            onClick: () => {
              O(ae), y(!0);
            }
          })
        )
      )
    ),
    // Detail drawer
    u ? e.createElement(
      C,
      {
        title: e.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 8 } },
          e.createElement(
            "span",
            { style: { display: "flex", alignItems: "center" } },
            oa.has(u.id) ? e.createElement("img", {
              src: ia(u.id),
              alt: u.name,
              style: { width: 20, height: 20, objectFit: "contain" }
            }) : e.createElement(
              "span",
              { style: { fontSize: 18 } },
              ra[u.category] || "📦"
            )
          ),
          e.createElement("span", null, u.name)
        ),
        open: z,
        onClose: () => y(!1),
        width: 520,
        extra: e.createElement(
          U,
          null,
          e.createElement(
            r,
            {
              size: "small",
              icon: T ? e.createElement(T) : void 0,
              onClick: () => ne(u)
            },
            "编辑"
          ),
          u.is_default ? null : e.createElement(
            B,
            {
              title: "确认删除此引擎？",
              description: u.name,
              onConfirm: () => fe(u.id),
              okText: "删除",
              cancelText: "取消",
              okButtonProps: { danger: !0 }
            },
            e.createElement(
              r,
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
        w,
        { column: 1, bordered: !0, size: "small" },
        e.createElement(
          w.Item,
          { label: "引擎名称" },
          u.name
        ),
        e.createElement(
          w.Item,
          { label: "厂商" },
          u.vendor || "—"
        ),
        e.createElement(
          w.Item,
          { label: "分类" },
          u.category ? Dt[u.category] || u.category : "—"
        ),
        e.createElement(
          w.Item,
          { label: "状态" },
          e.createElement(
            b,
            {
              color: u.status === "detected" ? "success" : u.status === "not_found" ? "error" : "default"
            },
            u.status === "detected" ? "✅ 已检测" : u.status === "not_found" ? "❌ 路径无效" : "🔧 待配置"
          )
        ),
        e.createElement(
          w.Item,
          { label: "版本" },
          u.version || "—"
        ),
        u.executable_path ? e.createElement(
          w.Item,
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
              r,
              {
                size: "small",
                type: "text",
                icon: I ? e.createElement(I) : void 0,
                onClick: () => N(u.executable_path)
              }
            )
          )
        ) : null,
        u.install_dir ? e.createElement(
          w.Item,
          { label: "安装目录" },
          e.createElement(
            "code",
            { style: { fontSize: 12, wordBreak: "break-all" } },
            u.install_dir
          )
        ) : null,
        // Display detected modules with paths
        u.modules && u.modules.length > 0 ? e.createElement(
          w.Item,
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
                  b,
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
          w.Item,
          { label: "许可证服务器" },
          u.license_server
        ) : null,
        e.createElement(
          w.Item,
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
          b,
          { color: "blue" },
          "默认引擎"
        ) : u.is_custom ? e.createElement(
          b,
          { color: "purple" },
          "自定义引擎"
        ) : null
      )
    ) : null,
    // Add/Edit modal
    e.createElement(
      E,
      {
        title: K ? "编辑引擎" : "添加计算引擎",
        open: le,
        onOk: de,
        onCancel: () => M(!1),
        okText: K ? "保存" : "添加",
        cancelText: "取消",
        confirmLoading: me,
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
            options: Object.entries(Dt).map(([ae, Y]) => ({
              label: Y,
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
function ds() {
  const e = P().React, { useState: t, useEffect: l, useCallback: a, useMemo: n } = e, {
    Spin: s,
    Empty: o,
    Input: r,
    Button: d,
    message: c,
    Row: f,
    Col: C,
    Tabs: w,
    Modal: b
  } = P().antd, {
    ReloadOutlined: v,
    PlusOutlined: E,
    SearchOutlined: x,
    ApiOutlined: j,
    RocketOutlined: B
  } = P().antdIcons || {}, { TextArea: U } = r, H = P().useSelectedAgent, J = H ? H() : null, T = (J == null ? void 0 : J.id) || "default";
  l(() => {
    Tt();
  }, [T]);
  const [k, I] = t([]), [V, F] = t(!0), [$, h] = t(""), [g, R] = t("mcp"), [X, G] = t(!1), [ie, z] = t(`{
  "mcpServers": {
    "example-client": {
      "command": "npx",
      "args": ["-y", "@example/mcp-server"],
      "env": {}
    }
  }
}`), [y, u] = t(!1), O = a(async () => {
    F(!0);
    try {
      const m = await Ua(T);
      I(m);
    } catch (m) {
      c.error(m.message || "加载 MCP 列表失败"), I([]);
    } finally {
      F(!1);
    }
  }, [T]);
  l(() => {
    O();
  }, [O]);
  const le = a(
    async (m) => {
      try {
        await Na(T, m.key), c.success(m.enabled ? "已禁用" : "已启用"), O();
      } catch (N) {
        c.error(N.message || "切换状态失败");
      }
    },
    [T, O]
  ), M = a(async (m) => {
    try {
      await Da(T, m.key), c.success(`MCP「${m.key}」已删除`), O();
    } catch (N) {
      c.error(N.message || "删除失败");
    }
  }, [T, O]), K = a(async () => {
    u(!0);
    try {
      const m = JSON.parse(ie), N = m.mcpServers || m, p = Object.entries(N);
      if (p.length === 0) {
        c.warning("未找到 MCP 客户端配置");
        return;
      }
      let ne = !0;
      for (const [de, fe] of p) {
        const Ee = fe, pe = Ee.url ? "streamable_http" : "stdio", ae = {
          name: Ee.name || de,
          description: Ee.description || "",
          enabled: !0,
          transport: pe,
          url: Ee.url || "",
          command: Ee.command || "",
          args: Ee.args || [],
          env: Ee.env || {},
          cwd: Ee.cwd || "",
          headers: Ee.headers || {}
        };
        try {
          await Fa(
            T,
            de,
            ae
          );
        } catch {
          ne = !1;
        }
      }
      ne && (c.success("MCP 客户端已创建"), G(!1), O());
    } catch (m) {
      m instanceof SyntaxError ? c.error("JSON 格式错误：" + m.message) : c.error(m.message || "创建 MCP 失败");
    } finally {
      u(!1);
    }
  }, [ie, T, O]), se = n(() => {
    if (!$.trim()) return k;
    const m = $.toLowerCase();
    return k.filter(
      (N) => {
        var p;
        return N.name.toLowerCase().includes(m) || N.key.toLowerCase().includes(m) || ((p = N.description) == null ? void 0 : p.toLowerCase().includes(m)) || N.transport.toLowerCase().includes(m);
      }
    );
  }, [k, $]), W = k.filter((m) => m.enabled).length, Q = k.reduce((m, N) => {
    var p;
    return m + (((p = N.tools) == null ? void 0 : p.length) || 0);
  }, 0), me = (m) => {
    window.history.pushState({}, "", m), window.dispatchEvent(new PopStateEvent("popstate"));
  }, _ = e.createElement(
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
      e.createElement(r, {
        placeholder: "搜索能力名称、描述...",
        prefix: x ? e.createElement(x) : void 0,
        value: $,
        onChange: (m) => h(m.target.value),
        allowClear: !0,
        style: { maxWidth: 400 }
      }),
      e.createElement(
        d,
        {
          type: "primary",
          icon: E ? e.createElement(E) : void 0,
          onClick: () => G(!0),
          style: Oe
        },
        "添加 MCP"
      ),
      e.createElement(
        d,
        {
          icon: j ? e.createElement(j) : void 0,
          onClick: () => me("/mcp")
        },
        "前往 MCP 管理"
      )
    ),
    V ? e.createElement(
      "div",
      { style: { textAlign: "center", padding: 60 } },
      e.createElement(s, { size: "large" })
    ) : se.length === 0 ? e.createElement(o, {
      description: $ ? "未找到匹配的能力" : "暂无 MCP 客户端，点击「添加 MCP」创建"
    }) : e.createElement(
      f,
      { gutter: [12, 12], align: "stretch" },
      ...se.map(
        (m) => e.createElement(
          C,
          {
            key: m.key,
            xs: 24,
            sm: 12,
            md: 8,
            lg: 6,
            style: { display: "flex" }
          },
          e.createElement(as, {
            mcp: m,
            agentId: T,
            onToggle: (N) => {
              N.stopPropagation(), le(m);
            },
            onDelete: () => {
              M(m);
            },
            onUpdate: async (N, p) => {
              try {
                return await Ga(T, N, p), c.success("MCP 配置已更新"), O(), !0;
              } catch (ne) {
                return c.error(ne.message || "更新 MCP 失败"), !1;
              }
            },
            onUpdatePolicy: async (N, p) => {
              try {
                return await Ja(T, N, p), c.success("访问策略已保存"), O(), !0;
              } catch (ne) {
                return c.error(ne.message || "保存访问策略失败"), !1;
              }
            },
            onRefresh: async () => {
              O();
            }
          })
        )
      )
    )
  ), te = [
    {
      key: "mcp",
      label: e.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        j ? e.createElement(j, { style: { fontSize: 14 } }) : null,
        "MCP 客户端"
      ),
      children: _
    },
    {
      key: "software",
      label: e.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        B ? e.createElement(B, { style: { fontSize: 14 } }) : null,
        "计算引擎"
      ),
      children: e.createElement(ms)
    }
  ];
  return e.createElement(
    "div",
    { style: { padding: 24 } },
    e.createElement(It, {
      title: "工具",
      subtitle: `MCP: ${k.length} 个客户端（${W} 个启用）· ${Q} 个工具`,
      extra: e.createElement(
        e.Fragment,
        null,
        e.createElement(
          d,
          {
            icon: v ? e.createElement(v) : void 0,
            onClick: () => {
              tt(), O();
            },
            loading: V
          },
          "刷新"
        )
      )
    }),
    e.createElement(w, {
      items: te,
      activeKey: g,
      onChange: (m) => R(m)
    }),
    // ── Create MCP Modal (mirror console /mcp JSON import) ──
    e.createElement(
      b,
      {
        title: "添加 MCP 客户端 (JSON)",
        open: X,
        onCancel: () => G(!1),
        onOk: K,
        confirmLoading: y,
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
      e.createElement(U, {
        value: ie,
        onChange: (m) => z(m.target.value),
        autoSize: { minRows: 12, maxRows: 20 },
        style: { fontFamily: "Monaco, Courier New, monospace", fontSize: 13 }
      })
    )
  );
}
function us({
  agentId: e,
  agentName: t,
  onNavigate: l
}) {
  const a = P().React, { useState: n, useEffect: s, useCallback: o } = a, {
    Spin: r,
    Empty: d,
    Button: c,
    Row: f,
    Col: C,
    Card: w,
    Tag: b,
    Checkbox: v,
    Modal: E,
    Typography: x,
    Drawer: j,
    Descriptions: B,
    message: U
  } = P().antd, {
    ReloadOutlined: Z,
    ThunderboltOutlined: H,
    SettingOutlined: J,
    CheckSquareOutlined: T,
    EyeOutlined: k,
    EyeInvisibleOutlined: I,
    DeleteOutlined: V,
    CloseOutlined: F
  } = P().antdIcons || {}, { Text: $, Paragraph: h } = x, [g, R] = n([]), [X, G] = n(!0), [ie, z] = n(!1), [y, u] = n(null), [O, le] = n(!1), [M, K] = n(
    /* @__PURE__ */ new Set()
  ), [se, W] = n(!1), [Q, me] = n(null), [_, te] = n(!1), m = o(async () => {
    if (e) {
      G(!0);
      try {
        const S = await Ot(e);
        R(S);
      } catch (S) {
        U.error(S.message || "加载技能失败"), R([]);
      } finally {
        G(!1);
      }
    }
  }, [e]);
  s(() => {
    m();
  }, [m]);
  const N = (S) => {
    K((q) => {
      const oe = new Set(q);
      return oe.has(S) ? oe.delete(S) : oe.add(S), oe;
    });
  }, p = () => K(/* @__PURE__ */ new Set()), ne = () => K(new Set(g.map((S) => S.name))), de = () => {
    O ? (p(), le(!1)) : le(!0);
  }, fe = async () => {
    const S = Array.from(M);
    if (S.length !== 0) {
      W(!0);
      try {
        const { results: q } = await nl(e, S), oe = Object.entries(q).filter(
          ([, ue]) => ue.success === !1
        ), D = S.length - oe.length;
        oe.length > 0 ? U.warning(
          `批量启用完成：成功 ${D} 个，失败 ${oe.length} 个`
        ) : U.success(`成功启用 ${S.length} 个技能`), p(), await m();
      } catch (q) {
        U.error(q.message || "批量启用失败");
      } finally {
        W(!1);
      }
    }
  }, Ee = async () => {
    const S = Array.from(M);
    if (S.length !== 0) {
      W(!0);
      try {
        const { results: q } = await al(e, S), oe = Object.entries(q).filter(
          ([, ue]) => ue.success === !1
        ), D = S.length - oe.length;
        oe.length > 0 ? U.warning(
          `批量停用完成：成功 ${D} 个，失败 ${oe.length} 个`
        ) : U.success(`成功停用 ${S.length} 个技能`), p(), await m();
      } catch (q) {
        U.error(q.message || "批量停用失败");
      } finally {
        W(!1);
      }
    }
  }, pe = () => {
    const S = Array.from(M);
    S.length !== 0 && E.confirm({
      title: `确认删除 ${S.length} 个技能？`,
      content: "删除后技能将从当前专家工作区移除，此操作不可撤销。技能池中的原始技能不受影响。",
      okText: "确认删除",
      cancelText: "取消",
      okButtonProps: { danger: !0 },
      onOk: async () => {
        W(!0);
        try {
          const { results: q } = await ll(e, S), oe = Object.entries(q).filter(
            ([, ue]) => ue.success === !1
          ), D = S.length - oe.length;
          oe.length > 0 ? U.warning(
            `批量删除完成：成功 ${D} 个，失败 ${oe.length} 个`
          ) : U.success(`成功删除 ${S.length} 个技能`), p(), await m();
        } catch (q) {
          U.error(q.message || "批量删除失败");
        } finally {
          W(!1);
        }
      }
    });
  }, ae = async (S) => {
    te(!0);
    try {
      S.enabled === !1 ? (await Dn(e, S.name), U.success(`已启用技能「${S.name}」`)) : (await Hn(e, S.name), U.success(`已禁用技能「${S.name}」`)), await m();
    } catch (q) {
      U.error(q.message || "操作失败");
    } finally {
      te(!1);
    }
  }, Y = (S) => {
    E.confirm({
      title: `确认删除技能「${S.name}」？`,
      content: "删除后技能将从当前专家工作区移除，此操作不可撤销。技能池中的原始技能不受影响。",
      okText: "确认删除",
      cancelText: "取消",
      okButtonProps: { danger: !0 },
      onOk: async () => {
        te(!0);
        try {
          await Xt(e, S.name), U.success(`已删除技能「${S.name}」`), await m();
        } catch (q) {
          U.error(q.message || "删除失败");
        } finally {
          te(!1);
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
        $,
        { type: "secondary", style: { fontSize: 13 } },
        O ? `已选择 ${M.size} / ${g.length} 个技能` : `共 ${g.length} 个技能`
      ),
      a.createElement(
        "div",
        { style: { display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" } },
        O ? a.createElement(
          a.Fragment,
          null,
          a.createElement(
            c,
            { size: "small", onClick: ne },
            "全选"
          ),
          a.createElement(
            c,
            {
              size: "small",
              icon: F ? a.createElement(F) : void 0,
              onClick: p
            },
            "取消选择"
          ),
          a.createElement(
            c,
            {
              size: "small",
              type: "default",
              icon: k ? a.createElement(k) : void 0,
              disabled: M.size === 0 || se,
              loading: se,
              onClick: fe
            },
            "批量启用"
          ),
          a.createElement(
            c,
            {
              size: "small",
              danger: !0,
              icon: I ? a.createElement(I) : void 0,
              disabled: M.size === 0 || se,
              loading: se,
              onClick: Ee
            },
            "批量停用"
          ),
          a.createElement(
            c,
            {
              size: "small",
              danger: !0,
              icon: V ? a.createElement(V) : void 0,
              disabled: M.size === 0 || se,
              loading: se,
              onClick: pe
            },
            `删除 (${M.size})`
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
              icon: T ? a.createElement(T) : void 0,
              onClick: de,
              disabled: g.length === 0
            },
            "批量管理"
          ),
          a.createElement(
            c,
            {
              icon: Z ? a.createElement(Z) : void 0,
              onClick: () => {
                tt(), m();
              }
            },
            "刷新"
          )
        )
      )
    ),
    X ? a.createElement(
      "div",
      { style: { textAlign: "center", padding: 60 } },
      a.createElement(r, { size: "large" })
    ) : g.length === 0 ? a.createElement(d, {
      description: "当前智能体未加载任何技能"
    }) : a.createElement(
      f,
      { gutter: [12, 12] },
      ...g.map(
        (S) => a.createElement(
          C,
          { key: S.name, xs: 24, sm: 12, md: 8, lg: 6 },
          a.createElement(
            w,
            {
              hoverable: !0,
              size: "small",
              style: {
                cursor: O ? "default" : "pointer",
                height: "100%",
                position: "relative",
                borderColor: O && M.has(S.name) ? "#0072f5" : void 0,
                borderWidth: O && M.has(S.name) ? 2 : 1
              },
              onClick: () => {
                O ? N(S.name) : (u(S), z(!0));
              },
              onMouseEnter: () => {
                O || me(S.name);
              },
              onMouseLeave: () => me(null)
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
                onClick: (q) => {
                  q.stopPropagation(), N(S.name);
                }
              },
              a.createElement(v, {
                checked: M.has(S.name)
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
              S.emoji ? a.createElement(
                "span",
                { style: { fontSize: 18 } },
                S.emoji
              ) : a.createElement(
                "span",
                { style: { fontSize: 18 } },
                "⚡"
              ),
              a.createElement(
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
                S.name
              ),
              S.enabled === !1 ? a.createElement(
                b,
                { color: "default", style: { fontSize: 10 } },
                "已禁用"
              ) : a.createElement(
                b,
                { color: "green", style: { fontSize: 10 } },
                "已启用"
              )
            ),
            S.description ? a.createElement(
              h,
              {
                type: "secondary",
                style: { fontSize: 11, margin: 0, lineHeight: 1.4 },
                ellipsis: { rows: 2 }
              },
              S.description
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
              S.version_text ? a.createElement(
                b,
                { style: { fontSize: 10 } },
                `v${S.version_text}`
              ) : null,
              ...(S.tags || []).slice(0, 3).map(
                (q, oe) => a.createElement(
                  b,
                  { key: oe, color: "blue", style: { fontSize: 10 } },
                  q
                )
              )
            ),
            // Hover action footer (not in batch mode)
            !O && Q === S.name ? a.createElement(
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
                  icon: S.enabled === !1 ? k ? a.createElement(k) : void 0 : I ? a.createElement(I) : void 0,
                  disabled: _,
                  onClick: (q) => {
                    q.stopPropagation(), ae(S);
                  }
                },
                S.enabled === !1 ? "启用" : "禁用"
              ),
              a.createElement(
                c,
                {
                  size: "small",
                  danger: !0,
                  icon: V ? a.createElement(V) : void 0,
                  disabled: _,
                  onClick: (q) => {
                    q.stopPropagation(), Y(S);
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
    y ? a.createElement(
      j,
      {
        title: a.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 8 } },
          a.createElement(
            "span",
            { style: { fontSize: 18 } },
            y.emoji || "⚡"
          ),
          a.createElement("span", null, y.name)
        ),
        open: ie,
        onClose: () => z(!1),
        width: 520,
        extra: a.createElement(
          c,
          {
            type: "primary",
            size: "small",
            icon: J ? a.createElement(J) : void 0,
            onClick: () => l("/skills")
          },
          "管理技能"
        )
      },
      a.createElement(
        B,
        { column: 1, bordered: !0, size: "small" },
        a.createElement(
          B.Item,
          { label: "技能名称" },
          y.name
        ),
        a.createElement(
          B.Item,
          { label: "描述" },
          y.description || "-"
        ),
        y.version_text ? a.createElement(
          B.Item,
          { label: "版本" },
          y.version_text
        ) : null,
        a.createElement(
          B.Item,
          { label: "来源" },
          y.source || "-"
        ),
        a.createElement(
          B.Item,
          { label: "状态" },
          y.enabled === !1 ? "已禁用" : "已启用"
        ),
        y.installed_from ? a.createElement(
          B.Item,
          { label: "安装来源" },
          y.installed_from
        ) : null
      ),
      // Tags
      y.tags && y.tags.length > 0 ? a.createElement(
        "div",
        { style: { marginTop: 16 } },
        a.createElement(
          $,
          {
            strong: !0,
            style: { display: "block", marginBottom: 8 }
          },
          "标签"
        ),
        a.createElement(
          "div",
          { style: { display: "flex", flexWrap: "wrap", gap: 4 } },
          ...y.tags.map(
            (S, q) => a.createElement(b, { key: q, color: "blue" }, S)
          )
        )
      ) : null,
      // Skill content preview
      y.content ? a.createElement(
        "div",
        { style: { marginTop: 16 } },
        a.createElement(
          $,
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
          y.content.slice(0, 2e3) + (y.content.length > 2e3 ? `

... (内容已截断)` : "")
        )
      ) : null
    ) : null
  );
}
function ps({
  poolSkills: e,
  workspaceSkills: t,
  agents: l,
  loading: a,
  onReload: n,
  agentId: s,
  agentName: o
}) {
  const r = P().React, { useState: d, useMemo: c, useCallback: f } = r, {
    Spin: C,
    Empty: w,
    Input: b,
    Button: v,
    Row: E,
    Col: x,
    Card: j,
    Tag: B,
    Typography: U,
    Drawer: Z,
    Descriptions: H,
    List: J,
    Modal: T,
    message: k
  } = P().antd, {
    ReloadOutlined: I,
    SearchOutlined: V,
    DownloadOutlined: F,
    ThunderboltOutlined: $,
    DeleteOutlined: h,
    PlusOutlined: g
  } = P().antdIcons || {}, { Text: R, Paragraph: X } = U, [G, ie] = d(""), [z, y] = d(!1), [u, O] = d(null), [le, M] = d([]), [K, se] = d(!1), [W, Q] = d(24), [me, _] = d(null), [te, m] = d(!1), N = c(() => {
    if (!G.trim()) return e;
    const Y = G.toLowerCase();
    return e.filter(
      (S) => {
        var q, oe;
        return S.name.toLowerCase().includes(Y) || ((q = S.description) == null ? void 0 : q.toLowerCase().includes(Y)) || ((oe = S.tags) == null ? void 0 : oe.some((D) => D.toLowerCase().includes(Y)));
      }
    );
  }, [e, G]), p = c(
    () => N.slice(0, W),
    [N, W]
  ), ne = f((Y) => {
    ie(Y), Q(24);
  }, []), de = f(
    (Y) => {
      const S = [];
      for (const q of t)
        if (q.skills.some((oe) => oe.name === Y)) {
          const oe = l.find((D) => D.id === q.agent_id);
          S.push((oe == null ? void 0 : oe.name) || q.agent_name || q.agent_id);
        }
      return S;
    },
    [t, l]
  ), fe = f(
    async (Y) => {
      if (O(Y), M(de(Y.name)), y(!0), !Y.content) {
        se(!0);
        try {
          const S = await ja(Y.name);
          O({ ...Y, content: S });
        } catch {
        } finally {
          se(!1);
        }
      }
    },
    [de]
  ), Ee = async (Y) => {
    m(!0);
    try {
      await Jt(s, Y.name), k.success(
        `已将技能「${Y.name}」加载到当前专家「${o}」`
      ), n();
    } catch (S) {
      k.error(S.message || "加载技能失败");
    } finally {
      m(!1);
    }
  }, pe = (Y) => {
    if (Y.protected) {
      k.warning("内置技能不可删除");
      return;
    }
    T.confirm({
      title: `确认从技能池删除「${Y.name}」？`,
      content: "删除后所有已安装此技能的专家将不受影响，但技能池中将不再包含此技能。此操作不可撤销。",
      okText: "确认删除",
      cancelText: "取消",
      okButtonProps: { danger: !0 },
      onOk: async () => {
        m(!0);
        try {
          await rl(Y.name), k.success(`已从技能池删除「${Y.name}」`), n();
        } catch (S) {
          k.error(S.message || "删除失败");
        } finally {
          m(!1);
        }
      }
    });
  }, ae = (Y) => {
    window.history.pushState({}, "", Y), window.dispatchEvent(new PopStateEvent("popstate"));
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
          marginBottom: 16
        }
      },
      r.createElement(b, {
        placeholder: "搜索技能名称、描述或标签...",
        prefix: V ? r.createElement(V) : void 0,
        value: G,
        onChange: (Y) => ne(Y.target.value),
        allowClear: !0,
        style: { maxWidth: 400 }
      }),
      r.createElement(
        "div",
        { style: { display: "flex", gap: 8 } },
        r.createElement(
          v,
          {
            icon: I ? r.createElement(I) : void 0,
            onClick: n,
            loading: a,
            size: "small"
          },
          "刷新"
        ),
        r.createElement(
          v,
          {
            type: "primary",
            icon: F ? r.createElement(F) : void 0,
            onClick: () => ae("/skill-pool"),
            size: "small",
            style: Oe
          },
          "管理技能池"
        )
      )
    ),
    a ? r.createElement(
      "div",
      { style: { textAlign: "center", padding: 60 } },
      r.createElement(C, { size: "large" })
    ) : N.length === 0 ? r.createElement(w, {
      description: G ? "未找到匹配的技能" : "技能池为空"
    }) : r.createElement(
      r.Fragment,
      null,
      r.createElement(
        E,
        { gutter: [12, 12] },
        ...p.map(
          (Y) => r.createElement(
            x,
            { key: Y.name, xs: 24, sm: 12, md: 8, lg: 6 },
            r.createElement(
              j,
              {
                hoverable: !0,
                size: "small",
                style: { cursor: "pointer", height: "100%" },
                onClick: () => fe(Y),
                onMouseEnter: () => _(Y.name),
                onMouseLeave: () => _(null)
              },
              r.createElement(
                "div",
                {
                  style: {
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 8
                  }
                },
                Y.emoji ? r.createElement(
                  "span",
                  { style: { fontSize: 18 } },
                  Y.emoji
                ) : r.createElement(
                  "span",
                  { style: { fontSize: 18 } },
                  "⚡"
                ),
                r.createElement(
                  R,
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
                  Y.name
                ),
                Y.protected ? r.createElement(
                  B,
                  { color: "gold", style: { fontSize: 10 } },
                  "内置"
                ) : null
              ),
              Y.description ? r.createElement(
                X,
                {
                  type: "secondary",
                  style: { fontSize: 11, margin: 0, lineHeight: 1.4 },
                  ellipsis: { rows: 2 }
                },
                Y.description
              ) : null,
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
                Y.version_text ? r.createElement(
                  B,
                  { style: { fontSize: 10 } },
                  `v${Y.version_text}`
                ) : null,
                ...(Y.tags || []).slice(0, 3).map(
                  (S, q) => r.createElement(
                    B,
                    { key: q, color: "cyan", style: { fontSize: 10 } },
                    S
                  )
                )
              ),
              // Hover action footer
              me === Y.name ? r.createElement(
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
                r.createElement(
                  v,
                  {
                    size: "small",
                    type: "primary",
                    icon: g ? r.createElement(g) : void 0,
                    disabled: te,
                    onClick: (S) => {
                      S.stopPropagation(), Ee(Y);
                    }
                  },
                  "加载到当前Agent"
                ),
                r.createElement(
                  v,
                  {
                    size: "small",
                    danger: !0,
                    icon: h ? r.createElement(h) : void 0,
                    disabled: te || Y.protected,
                    onClick: (S) => {
                      S.stopPropagation(), pe(Y);
                    }
                  },
                  "删除"
                )
              ) : null
            )
          )
        ),
        // Load more button
        p.length < N.length ? r.createElement(
          "div",
          { style: { textAlign: "center", marginTop: 16 } },
          r.createElement(
            v,
            {
              onClick: () => Q((Y) => Y + 24),
              size: "small"
            },
            `加载更多 (剩余 ${N.length - p.length} 个)`
          )
        ) : null
      )
    ),
    // Skill detail drawer
    u ? r.createElement(
      Z,
      {
        title: r.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 8 } },
          r.createElement(
            "span",
            { style: { fontSize: 18 } },
            u.emoji || "⚡"
          ),
          r.createElement("span", null, u.name)
        ),
        open: z,
        onClose: () => y(!1),
        width: 520,
        extra: r.createElement(
          v,
          {
            type: "primary",
            size: "small",
            icon: $ ? r.createElement($) : void 0,
            onClick: () => ae("/skills")
          },
          "管理技能"
        )
      },
      r.createElement(
        H,
        { column: 1, bordered: !0, size: "small" },
        r.createElement(
          H.Item,
          { label: "技能名称" },
          u.name
        ),
        r.createElement(
          H.Item,
          { label: "描述" },
          u.description || "-"
        ),
        u.version_text ? r.createElement(
          H.Item,
          { label: "版本" },
          u.version_text
        ) : null,
        r.createElement(
          H.Item,
          { label: "来源" },
          u.source || "-"
        ),
        r.createElement(
          H.Item,
          { label: "受保护" },
          u.protected ? "是（内置）" : "否"
        ),
        u.sync_status ? r.createElement(
          H.Item,
          { label: "同步状态" },
          u.sync_status
        ) : null,
        u.installed_from ? r.createElement(
          H.Item,
          { label: "安装来源" },
          u.installed_from
        ) : null
      ),
      // Tags
      u.tags && u.tags.length > 0 ? r.createElement(
        "div",
        { style: { marginTop: 16 } },
        r.createElement(
          R,
          {
            strong: !0,
            style: { display: "block", marginBottom: 8 }
          },
          "标签"
        ),
        r.createElement(
          "div",
          { style: { display: "flex", flexWrap: "wrap", gap: 4 } },
          ...u.tags.map(
            (Y, S) => r.createElement(B, { key: S, color: "cyan" }, Y)
          )
        )
      ) : null,
      // Installed agents
      r.createElement(
        "div",
        { style: { marginTop: 16 } },
        r.createElement(
          R,
          { strong: !0, style: { display: "block", marginBottom: 8 } },
          `已安装此技能的专家 (${le.length})`
        ),
        le.length > 0 ? r.createElement(J, {
          size: "small",
          dataSource: le,
          renderItem: (Y) => r.createElement(
            J.Item,
            null,
            r.createElement(
              "div",
              {
                style: {
                  display: "flex",
                  alignItems: "center",
                  gap: 6
                }
              },
              r.createElement(Ae, { name: Y, size: 20 }),
              r.createElement(
                R,
                { style: { fontSize: 13 } },
                Y
              )
            )
          )
        }) : r.createElement(
          R,
          { type: "secondary", style: { fontSize: 12 } },
          "暂无专家安装此技能"
        )
      ),
      // Skill content preview (lazy-loaded)
      K ? r.createElement(
        "div",
        { style: { marginTop: 16, textAlign: "center" } },
        r.createElement(C, { size: "small" })
      ) : u.content ? r.createElement(
        "div",
        { style: { marginTop: 16 } },
        r.createElement(
          R,
          {
            strong: !0,
            style: { display: "block", marginBottom: 8 }
          },
          "技能内容"
        ),
        r.createElement(
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
function gs() {
  const e = P().React, { useState: t, useEffect: l, useCallback: a, useMemo: n } = e, { Tabs: s, message: o } = P().antd, { ThunderboltOutlined: r, AppstoreOutlined: d } = P().antdIcons || {}, f = P().useSelectedAgent, C = f ? f() : null, w = (C == null ? void 0 : C.id) || "default";
  l(() => {
    Tt();
  }, [w]);
  const [b, v] = t([]), [E, x] = t([]), [j, B] = t([]), [U, Z] = t(!0), [H, J] = t("agent-skills"), T = a(async () => {
    Z(!0);
    try {
      const [F, $, h] = await Promise.all([
        Wt(!0),
        Gt(),
        Ba()
      ]);
      x(F), v($), B(h);
    } catch (F) {
      o.error(F.message || "加载技能列表失败"), x([]);
    } finally {
      Z(!1);
    }
  }, []);
  l(() => {
    T();
  }, [T]);
  const k = n(() => {
    const F = b.find(($) => $.id === w);
    return (F == null ? void 0 : F.name) || w;
  }, [b, w]), I = (F) => {
    window.history.pushState({}, "", F), window.dispatchEvent(new PopStateEvent("popstate"));
  }, V = [
    {
      key: "agent-skills",
      label: e.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        r ? e.createElement(r, { style: { fontSize: 14 } }) : null,
        "当前Agent加载技能"
      ),
      children: e.createElement(us, {
        agentId: w,
        agentName: k,
        onNavigate: I
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
      children: e.createElement(ps, {
        poolSkills: E,
        workspaceSkills: j,
        agents: b,
        loading: U,
        onReload: T,
        agentId: w,
        agentName: k
      })
    }
  ];
  return e.createElement(
    "div",
    { style: { padding: 24 } },
    e.createElement(It, {
      title: "技能",
      subtitle: `技能池共 ${E.length} 个技能 · 当前智能体：${k}`
    }),
    e.createElement(s, {
      items: V,
      activeKey: H,
      onChange: (F) => J(F)
    })
  );
}
const Pn = {
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
function fs(e) {
  if (!e.env) return !1;
  const t = Object.entries(e.env);
  return t.length === 0 ? !1 : t.some(([, l]) => typeof l == "string" && l.length > 0);
}
const wt = "ugsci.market.githubSources", $n = "https://github.com/anthropics/skills/tree/main/skills", ca = "https://ugsci-awesome-tools.oss-cn-beijing.aliyuncs.com", ys = `${ca}/skills`;
function mt(e) {
  const t = e.replace(/^\/+/, "");
  return Ne(`/plugins/oss-proxy?path=${encodeURIComponent(t)}`);
}
async function Qt(e) {
  const t = e.replace(/^\/+/, ""), l = await fetch(mt(t));
  if (!l.ok)
    throw new Error(`OSS fetch failed (${l.status}): ${t}`);
  return await l.json();
}
function et(e) {
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
function Es(e) {
  var n, s;
  const t = {};
  if (e.env && e.env.length > 0)
    for (const o of e.env)
      t[o] = `your-${o.toLowerCase().replace(/_/g, "-")}`;
  let l = "🔌";
  const a = (e.icon || "").toLowerCase();
  return a.includes("folder") ? l = "📁" : a.includes("git") ? l = "🌿" : a.includes("github") ? l = "🐙" : a.includes("database") || a.includes("postgres") || a.includes("sqlite") ? l = "🗄️" : a.includes("search") || a.includes("brave") ? l = "🔍" : a.includes("browser") || a.includes("puppeteer") ? l = "🎭" : a.includes("memory") || a.includes("brain") ? l = "🧠" : a.includes("file") || a.includes("fetch") ? l = "🌐" : a.includes("slack") ? l = "💬" : a.includes("google") ? l = "📁" : a.includes("notion") ? l = "📝" : a.includes("jupyter") ? l = "📊" : a.includes("science") || a.includes("flask") ? l = "🔬" : a.includes("book") || a.includes("arxiv") ? l = "📚" : a.includes("patent") && (l = "📜"), {
    id: e.id,
    name: e.name,
    emoji: l,
    iconUrl: e.icon_url ? mt(e.icon_url) : void 0,
    category: e.category ? et(e.category) : "",
    description: e.description,
    transport: e.transport || "stdio",
    command: ((n = e.config) == null ? void 0 : n.command) || "",
    args: ((s = e.config) == null ? void 0 : s.args) || [],
    env: Object.keys(t).length > 0 ? t : void 0
  };
}
const ma = "ugsci.market.mcpSources", da = "ugsci.market.expertSources";
function ua(e, t) {
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
function pa(e, t) {
  try {
    localStorage.setItem(e, JSON.stringify(t));
  } catch {
  }
}
function hs() {
  return ua(ma, "mcp");
}
function ht(e) {
  pa(ma, e);
}
function vs() {
  return ua(da, "expert");
}
function vt(e) {
  pa(da, e);
}
function ga(e) {
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
    const s = decodeURIComponent(n[0]), o = decodeURIComponent(n[1]);
    let r = "main", d = "";
    return n.length >= 4 && (n[2] === "tree" || n[2] === "blob") ? (r = decodeURIComponent(n[3]), n.length > 4 && (d = n.slice(4).map(decodeURIComponent).join("/"))) : n.length > 2 && (d = n.slice(2).map(decodeURIComponent).join("/")), d = d.replace(/\/+$/, "").replace(/^\/+/, ""), {
      owner: s,
      repo: o,
      ref: r || "main",
      skillsPath: d,
      label: `${s}/${o}`,
      platform: a
    };
  } catch {
    return null;
  }
}
function fa(e, t, l, a = "github") {
  return a === "oss" ? `oss:${e}/${l || "/"}` : `${a}:${e}/${t}:${l || "/"}`;
}
function bs(e) {
  try {
    const t = new URL(e.trim()), l = t.hostname.toLowerCase(), a = l.match(
      /^([a-z0-9][a-z0-9-]{1,61}[a-z0-9])\.oss-([a-z0-9-]+)\.aliyuncs\.com$/
    );
    if (!a) return null;
    const n = a[1], s = `${t.protocol}//${l}`, o = decodeURIComponent(t.pathname).replace(/^\/+/, "").replace(/\/+$/, "");
    return o ? {
      endpoint: s,
      prefix: o,
      label: "UGSci",
      platform: "oss"
    } : null;
  } catch {
    return null;
  }
}
function Ss() {
  try {
    const e = localStorage.getItem(wt);
    if (!e) {
      const a = [], n = ga($n);
      return n && a.push({
        id: fa(
          n.owner,
          n.repo,
          n.skillsPath,
          n.platform
        ),
        url: $n,
        label: n.label,
        owner: n.owner,
        repo: n.repo,
        ref: n.ref,
        skillsPath: n.skillsPath,
        enabled: !1,
        platform: n.platform
      }), localStorage.setItem(wt, JSON.stringify(a)), a;
    }
    const t = JSON.parse(e);
    if (!Array.isArray(t)) return [];
    const l = t.filter(
      (a) => a && typeof a.id == "string" && (typeof a.owner == "string" || a.platform === "oss") && !(a.platform === "oss" && a.url === ys)
    ).map((a) => ({
      ...a,
      platform: a.platform || "github",
      owner: a.owner || "",
      repo: a.repo || "",
      ref: a.ref || "",
      skillsPath: a.skillsPath || ""
    }));
    return l.length !== t.length && localStorage.setItem(
      wt,
      JSON.stringify(l)
    ), l;
  } catch {
    return [];
  }
}
function bt(e) {
  try {
    localStorage.setItem(
      wt,
      JSON.stringify(e)
    );
  } catch {
  }
}
function ws(e) {
  const t = e.match(/^---\s*\n([\s\S]*?)\n---/);
  if (!t) return {};
  const l = t[1], a = {}, n = l.split(`
`);
  let s = "";
  for (const o of n) {
    const r = o.match(/^(\w[\w-]*)\s*:\s*(.*)$/);
    if (r) {
      s = r[1];
      let d = r[2].trim();
      (d.startsWith('"') && d.endsWith('"') || d.startsWith("'") && d.endsWith("'")) && (d = d.slice(1, -1)), s === "name" ? a.name = d : s === "description" ? a.description = d : s === "version" ? a.version = d : s === "author" && (a.author = d);
    }
  }
  return a;
}
async function Cs(e) {
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
  const o = await s.json();
  if (!Array.isArray(o)) return [];
  const r = o.filter(
    (c) => c.type === "dir" && c.name
  );
  return await Promise.all(
    r.map(async (c) => {
      const f = e.skillsPath ? e.skillsPath + "/" : "", C = t ? `https://gitee.com/${e.owner}/${e.repo}/raw/${e.ref}/${f}${c.name}/SKILL.md` : `https://raw.githubusercontent.com/${e.owner}/${e.repo}/${e.ref}/${f}${c.name}/SKILL.md`, w = t ? `https://gitee.com/${e.owner}/${e.repo}/tree/${e.ref}/${f}${c.name}` : `https://github.com/${e.owner}/${e.repo}/tree/${e.ref}/${f}${c.name}`, b = {
        sourceId: e.id,
        sourceLabel: e.label,
        name: c.name,
        description: "",
        source_url: w,
        html_url: w,
        version: null,
        author: null
      };
      try {
        const v = {};
        t && e.accessToken && (v.Authorization = `token ${e.accessToken}`);
        const E = await fetch(C, {
          headers: v
        });
        if (!E.ok) return b;
        const x = await E.text(), j = ws(x);
        return {
          ...b,
          name: j.name || c.name,
          description: j.description || "",
          version: j.version || null,
          author: j.author || null
        };
      } catch {
        return b;
      }
    })
  );
}
async function xs(e) {
  const t = bs(e.url);
  if (!t)
    throw new Error(`Invalid OSS URL: ${e.url}`);
  const { endpoint: l, prefix: a } = t, n = a.split("/").map(encodeURIComponent).join("/"), s = mt(`${n}/manifest.json`), o = await fetch(s);
  if (!o.ok)
    throw new Error(
      `无法获取技能列表: manifest.json (${o.status})`
    );
  const r = await o.json(), d = [];
  if (r && r.tag_groups && typeof r.tag_groups == "object")
    for (const [C, w] of Object.entries(r.tag_groups))
      Array.isArray(w) && d.push({
        id: C,
        label: et(C),
        tags: w
      });
  const c = [];
  function f(C, w) {
    for (const b of C) {
      if (b.type === "collection" && Array.isArray(b.children)) {
        f(b.children, b.name);
        continue;
      }
      const v = b.path || b.name || "";
      if (!v) continue;
      const E = v.split("/").map(encodeURIComponent).join("/"), x = `${l}/${n}/${E}`;
      let j = null;
      if (b.metadata) {
        const U = b.metadata.match(/version:\s*"?([\d.]+)"?/);
        U && (j = U[1]);
      }
      const B = w ? `${e.label}/${w}` : e.label;
      c.push({
        sourceId: e.id,
        sourceLabel: e.label,
        sourcePath: B,
        name: b.name || v.split("/").pop() || v,
        description: b.description || "",
        source_url: x,
        html_url: x,
        version: j,
        author: null,
        tag: b.tag || void 0,
        isOfficial: !0
      });
    }
  }
  if (Array.isArray(r) ? f(
    r.map(
      (C) => typeof C == "string" ? { name: C, path: C } : C
    )
  ) : r && Array.isArray(r.skills) && f(r.skills), c.length === 0)
    throw new Error(
      `manifest.json 中未找到技能。请检查 ${e.url}/manifest.json`
    );
  return { skills: c, categories: d };
}
async function ks() {
  const e = await Qt("mcp/manifest.json"), t = [], l = {};
  if (e.tag_groups && typeof e.tag_groups == "object")
    for (const [n, s] of Object.entries(e.tag_groups))
      Array.isArray(s) && (l[n] = s, t.push({
        id: n,
        label: et(n),
        tags: s
      }));
  return { servers: (e.servers || []).map((n) => {
    let s = "";
    const o = n.tags || [];
    for (const [r, d] of Object.entries(l))
      if (d.some((c) => o.includes(c))) {
        s = r;
        break;
      }
    return {
      id: n.id || n.name,
      name: n.name || n.id,
      description: n.description || "",
      tags: o,
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
async function _s() {
  const e = await Qt("skills/manifest.json"), t = [], l = /* @__PURE__ */ new Set();
  function a(n, s) {
    for (const o of n) {
      if ((o == null ? void 0 : o.type) === "collection" && Array.isArray(o.children)) {
        a(o.children, o.name || s);
        continue;
      }
      const r = String((o == null ? void 0 : o.path) || (o == null ? void 0 : o.name) || "").trim();
      if (!r) continue;
      const d = r.split("/").map(encodeURIComponent).join("/"), c = `${ca}/skills/${d}`, f = typeof o.tag == "string" && o.tag.trim() ? o.tag.trim() : void 0;
      f && l.add(f);
      let C = null;
      if (typeof o.metadata == "string") {
        const w = o.metadata.match(/version:\s*"?([\d.]+)"?/);
        w && (C = w[1]);
      }
      t.push({
        sourceId: "oss:ugsci-official",
        sourceLabel: "UGSci",
        sourcePath: s ? `UGSci/${s}` : "UGSci",
        name: o.name || r.split("/").pop() || r,
        description: o.description || "",
        source_url: c,
        html_url: c,
        version: C,
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
async function Ts() {
  const e = await Qt("agents/manifest.json"), t = [], l = {};
  if (e.tag_groups && typeof e.tag_groups == "object")
    for (const [n, s] of Object.entries(e.tag_groups))
      Array.isArray(s) && (l[n] = s, t.push({
        id: n,
        label: et(n),
        tags: s
      }));
  return { agents: (e.agents || []).map((n) => {
    let s = "";
    const o = n.tags || [];
    for (const [r, d] of Object.entries(l))
      if (d.some((c) => o.includes(c))) {
        s = r;
        break;
      }
    return {
      id: n.id || n.name,
      name: n.name || n.id,
      description: n.description || "",
      path: n.path || "",
      tags: o,
      config: n.config,
      instructions: n.instructions,
      skills_manifest: n.skills_manifest,
      drivers: n.drivers,
      category: s
    };
  }), categories: t };
}
async function zs(e) {
  const t = e.filter((o) => o.enabled), l = await Promise.all(
    t.map(async (o) => {
      try {
        if (o.platform === "oss") {
          const { skills: r, categories: d } = await xs(o);
          return { skills: r, categories: d, error: null, label: o.label };
        } else
          return { skills: await Cs(o), categories: [], error: null, label: o.label };
      } catch (r) {
        return {
          skills: [],
          categories: [],
          error: r.message || String(r),
          label: o.label
        };
      }
    })
  ), a = [], n = [], s = [];
  for (const o of l)
    a.push(...o.skills), n.push(...o.categories), o.error && s.push({ label: o.label, message: o.error });
  return { skills: a, errors: s, categories: n };
}
function Is({
  open: e,
  onClose: t,
  sources: l,
  onChange: a
}) {
  const n = P().React, { useState: s } = n, {
    Modal: o,
    Input: r,
    Button: d,
    List: c,
    Tag: f,
    Switch: C,
    Typography: w,
    Tooltip: b,
    message: v
  } = P().antd, {
    PlusOutlined: E,
    DeleteOutlined: x,
    LinkOutlined: j,
    GithubOutlined: B
  } = P().antdIcons || {}, { Text: U } = w, [Z, H] = s(""), [J, T] = s(""), k = () => {
    const $ = Z.trim();
    if (!$) return;
    const h = ga($);
    if (!h) {
      v.error("无效的仓库 URL，请输入类似 https://github.com/owner/repo/tree/main/skills 或 https://gitee.com/owner/repo/tree/master/skills 的链接");
      return;
    }
    const g = fa(h.owner, h.repo, h.skillsPath, h.platform);
    if (l.some((G) => G.id === g)) {
      v.warning("该源已存在");
      return;
    }
    const R = {
      id: g,
      url: $,
      label: h.label,
      owner: h.owner,
      repo: h.repo,
      ref: h.ref,
      skillsPath: h.skillsPath,
      enabled: !0,
      platform: h.platform,
      accessToken: J.trim() || void 0
    }, X = [...l, R];
    bt(X), a(X), H(""), T(""), v.success(`已添加源: ${h.label}`);
  }, I = ($, h) => {
    const g = l.map(
      (R) => R.id === $ ? { ...R, enabled: h } : R
    );
    bt(g), a(g);
  }, V = ($, h) => {
    const g = l.map(
      (R) => R.id === $ ? { ...R, accessToken: h.trim() || void 0 } : R
    );
    bt(g), a(g);
  }, F = ($) => {
    const h = l.filter((g) => g.id !== $);
    bt(h), a(h), v.success("已移除源");
  };
  return n.createElement(
    o,
    {
      open: e,
      onCancel: t,
      title: n.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 8 } },
        B ? n.createElement(B, { style: { fontSize: 18 } }) : null,
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
        U,
        { type: "secondary", style: { fontSize: 12, display: "block", marginBottom: 8 } },
        "添加 GitHub 或 Gitee 仓库作为技能源，系统将从该仓库的指定目录获取技能列表。支持格式："
      ),
      n.createElement(
        "div",
        { style: { display: "flex", gap: 8, alignItems: "center" } },
        n.createElement(r, {
          placeholder: "https://github.com/owner/repo/tree/main/skills 或 https://gitee.com/owner/repo/tree/master/skills",
          value: Z,
          onChange: ($) => H($.target.value),
          onPressEnter: k,
          prefix: j ? n.createElement(j) : void 0,
          style: { flex: 1 }
        }),
        n.createElement(
          d,
          {
            type: "primary",
            icon: E ? n.createElement(E) : void 0,
            onClick: k
          },
          "添加"
        )
      ),
      // Gitee token input (shown when URL looks like a Gitee link)
      Z.trim() && Z.trim().toLowerCase().includes("gitee.com") ? n.createElement(
        "div",
        { style: { marginTop: 8, display: "flex", gap: 8, alignItems: "center" } },
        n.createElement(
          U,
          { type: "secondary", style: { fontSize: 12, whiteSpace: "nowrap" } },
          "Gitee Token:"
        ),
        n.createElement(r.Password, {
          placeholder: "私有仓库请填写 Gitee 私人令牌（可选）",
          value: J,
          onChange: ($) => T($.target.value),
          style: { flex: 1 }
        })
      ) : null
    ),
    n.createElement(
      "div",
      { style: { marginBottom: 8, display: "flex", alignItems: "center", justifyContent: "space-between" } },
      n.createElement(U, { strong: !0 }, `已配置源 (${l.length})`)
    ),
    n.createElement(c, {
      size: "small",
      bordered: !0,
      dataSource: l,
      renderItem: ($) => n.createElement(
        c.Item,
        {
          actions: [
            n.createElement(
              b,
              { title: $.enabled ? "点击禁用" : "点击启用" },
              n.createElement(C, {
                size: "small",
                checked: $.enabled,
                onChange: (h) => I($.id, h)
              })
            ),
            n.createElement(
              b,
              { title: "移除此源" },
              n.createElement(
                d,
                {
                  size: "small",
                  type: "text",
                  danger: !0,
                  icon: x ? n.createElement(x) : void 0,
                  onClick: () => F($.id)
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
              { color: $.platform === "gitee" ? "orange" : $.platform === "oss" ? "green" : "blue", style: { fontSize: 11 } },
              $.platform === "gitee" ? "Gitee" : $.platform === "oss" ? "OSS" : "GitHub"
            ),
            n.createElement(
              f,
              { style: { fontSize: 11 } },
              $.label
            ),
            $.skillsPath ? n.createElement(
              U,
              { type: "secondary", style: { fontSize: 11 } },
              `/${$.skillsPath}`
            ) : null,
            $.platform !== "oss" ? n.createElement(
              U,
              { type: "secondary", style: { fontSize: 11 } },
              `@${$.ref}`
            ) : null
          ),
          n.createElement(
            U,
            {
              type: "secondary",
              style: { fontSize: 11, wordBreak: "break-all" }
            },
            $.url
          ),
          // Gitee token input for existing Gitee sources
          $.platform === "gitee" ? n.createElement(
            "div",
            { style: { marginTop: 6, display: "flex", gap: 6, alignItems: "center" } },
            n.createElement(
              U,
              { type: "secondary", style: { fontSize: 11, whiteSpace: "nowrap" } },
              "Token:"
            ),
            n.createElement(r.Password, {
              size: "small",
              placeholder: "Gitee 私人令牌（可选，用于私有仓库）",
              value: $.accessToken || "",
              onChange: (h) => V($.id, h.target.value),
              style: { flex: 1 }
            })
          ) : null
        )
      )
    })
  );
}
function Mn({
  open: e,
  onClose: t,
  sources: l,
  onChange: a,
  type: n
}) {
  const s = P().React, { useState: o } = s, {
    Modal: r,
    Input: d,
    Button: c,
    List: f,
    Tag: C,
    Switch: w,
    Typography: b,
    Tooltip: v,
    message: E
  } = P().antd, {
    PlusOutlined: x,
    DeleteOutlined: j,
    LinkOutlined: B,
    ApiOutlined: U,
    UserOutlined: Z,
    ImportOutlined: H,
    ExportOutlined: J,
    CopyOutlined: T
  } = P().antdIcons || {}, { Text: k } = b, [I, V] = o(""), [F, $] = o(""), [h, g] = o(""), [R, X] = o(!1), G = n === "mcp" ? "MCP" : "专家模板", ie = n === "mcp" ? U ? s.createElement(U, { style: { fontSize: 18 } }) : null : Z ? s.createElement(Z, { style: { fontSize: 18 } }) : null, z = () => {
    const M = I.trim(), K = F.trim();
    if (!M) return;
    const se = K || M.slice(0, 40), W = `${n}:${M}`;
    if (l.some((_) => _.id === W)) {
      E.warning("该源已存在");
      return;
    }
    const Q = {
      id: W,
      label: se,
      url: M,
      enabled: !0,
      type: n
    }, me = [...l, Q];
    n === "mcp" ? ht(me) : vt(me), a(me), V(""), $(""), E.success(`已添加${G}源: ${se}`);
  }, y = (M, K) => {
    const se = l.map(
      (W) => W.id === M ? { ...W, enabled: K } : W
    );
    n === "mcp" ? ht(se) : vt(se), a(se);
  }, u = (M) => {
    const K = l.filter((se) => se.id !== M);
    n === "mcp" ? ht(K) : vt(K), a(K), E.success("已移除源");
  }, O = () => {
    const M = JSON.stringify(
      { type: n, sources: l },
      null,
      2
    );
    try {
      navigator.clipboard.writeText(M), E.success(`${G}源已复制到剪贴板（${l.length} 个源）`);
    } catch {
      const K = document.createElement("textarea");
      K.value = M, document.body.appendChild(K), K.select(), document.execCommand("copy"), document.body.removeChild(K), E.success(`${G}源已复制到剪贴板（${l.length} 个源）`);
    }
  }, le = () => {
    const M = h.trim();
    if (!M) {
      E.warning("请粘贴 JSON 内容");
      return;
    }
    try {
      const K = JSON.parse(M);
      let se = [];
      if (Array.isArray(K))
        se = K;
      else if (K && Array.isArray(K.sources))
        se = K.sources;
      else if (K && typeof K == "object")
        se = [K];
      else
        throw new Error("Invalid format");
      const W = se.filter(
        (te) => te && typeof te.url == "string" && typeof te.label == "string"
      );
      if (W.length === 0) {
        E.error("未找到有效的源数据");
        return;
      }
      const Q = new Set(l.map((te) => te.id)), me = [];
      for (const te of W) {
        const m = te.id || `${n}:${te.url}`;
        Q.has(m) || me.push({
          id: m,
          label: te.label,
          url: te.url,
          enabled: te.enabled !== !1,
          type: n
        });
      }
      if (me.length === 0) {
        E.info("所有源均已存在，无新增");
        return;
      }
      const _ = [...l, ...me];
      n === "mcp" ? ht(_) : vt(_), a(_), g(""), X(!1), E.success(`成功导入 ${me.length} 个${G}源`);
    } catch (K) {
      E.error(`JSON 解析失败: ${K.message || "格式错误"}`);
    }
  };
  return s.createElement(
    r,
    {
      open: e,
      onCancel: t,
      title: s.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 8 } },
        ie,
        s.createElement("span", null, `配置${G}源`)
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
              icon: J ? s.createElement(J) : void 0,
              onClick: O,
              disabled: l.length === 0,
              size: "small"
            },
            "导出到剪贴板"
          ),
          s.createElement(
            c,
            {
              icon: H ? s.createElement(H) : void 0,
              onClick: () => X(!R),
              size: "small"
            },
            R ? "隐藏导入" : "导入JSON"
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
      `配置${G}源地址，支持从远程仓库或团队共享的 JSON 导入${G}配置。`
    ),
    // Import section (collapsible)
    R ? s.createElement(
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
        `粘贴${G}源 JSON（支持从导出的剪贴板内容粘贴）`
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
        value: h,
        onChange: (M) => g(M.target.value),
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
            onClick: le
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
        onChange: (M) => $(M.target.value),
        style: { width: 200 }
      }),
      s.createElement(d, {
        placeholder: n === "mcp" ? "https://raw.githubusercontent.com/team/mcp-registry/main/mcp.json" : "https://raw.githubusercontent.com/team/expert-registry/main/experts.json",
        value: I,
        onChange: (M) => V(M.target.value),
        onPressEnter: z,
        prefix: B ? s.createElement(B) : void 0,
        style: { flex: 1 }
      }),
      s.createElement(
        c,
        {
          type: "primary",
          icon: x ? s.createElement(x) : void 0,
          onClick: z
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
    s.createElement(f, {
      size: "small",
      bordered: !0,
      dataSource: l,
      renderItem: (M) => s.createElement(
        f.Item,
        {
          actions: [
            s.createElement(
              v,
              { title: M.enabled ? "点击禁用" : "点击启用" },
              s.createElement(w, {
                size: "small",
                checked: M.enabled,
                onChange: (K) => y(M.id, K)
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
                  icon: j ? s.createElement(j) : void 0,
                  onClick: () => u(M.id)
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
              C,
              {
                color: n === "mcp" ? "purple" : "blue",
                style: { fontSize: 11 }
              },
              M.label
            ),
            M.enabled ? null : s.createElement(
              C,
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
            M.url
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
async function Os() {
  return re("/market/providers");
}
async function As(e) {
  return re(
    `/market/categories?lang=${encodeURIComponent(e)}`
  );
}
async function Ps(e, t, l, a, n) {
  return re("/market/search", {
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
function Rn(e) {
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
async function Ln(e, t) {
  const l = { bundle_url: e };
  return t && (l.access_token = t), re("/skills/pool/import", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(l)
  });
}
function $s() {
  const e = P().React, { useState: t, useEffect: l, useCallback: a, useMemo: n, useRef: s } = e, {
    Spin: o,
    Empty: r,
    Input: d,
    Button: c,
    message: f,
    Row: C,
    Col: w,
    Card: b,
    Tag: v,
    Tooltip: E,
    Typography: x,
    Select: j,
    Drawer: B,
    Descriptions: U,
    Tabs: Z,
    Badge: H,
    Progress: J,
    Modal: T,
    Alert: k
  } = P().antd, {
    ReloadOutlined: I,
    SearchOutlined: V,
    DownloadOutlined: F,
    AppstoreOutlined: $,
    ShopOutlined: h,
    CheckCircleOutlined: g,
    LoadingOutlined: R,
    UserOutlined: X,
    UserAddOutlined: G,
    SettingOutlined: ie,
    GithubOutlined: z,
    ApiOutlined: y
  } = P().antdIcons || {}, { Text: u, Paragraph: O, Title: le } = x, [M, K] = t("skills"), [se, W] = t([]), [Q, me] = t([]), [_, te] = t([]), [m, N] = t(""), [p, ne] = t(""), [de, fe] = t(!1), [Ee, pe] = t(!1), [ae, Y] = t(
    {}
  ), [S, q] = t(null), [oe, D] = t({}), [ue, ve] = t([]), [xe, Ie] = t(""), [ke, Fe] = t(""), [Pe, nt] = t(""), [dt, at] = t({}), [$e, lt] = t(""), [ut, st] = t(/* @__PURE__ */ new Set()), [be, _e] = t(null), [ee, Se] = t({}), [Ce, Te] = t([]), [We, Je] = t([]), [he, pt] = t([]), [Pt, rt] = t(""), [je, gt] = t(!1), [ya, Zt] = t(!1), [Ea, en] = t([]), [ha, tn] = t(!1), [va, nn] = t([]), [ba, an] = t(!1), [ln, sn] = t([]), [rn, on] = t([]), [cn, mn] = t(!1), [Xe, dn] = t(""), [un, pn] = t([]), [gn, fn] = t([]), [yn, En] = t(!1), [Ke, hn] = t(""), [$t, vn] = t(!1), [ze, ft] = t(null), [ot, Sa] = t([]), it = s(null);
  l(() => {
    Promise.all([
      Os().catch(() => []),
      As("zh").catch(() => []),
      Gt().catch(() => [])
    ]).then(([i, A, L]) => {
      W(i), me(A), ve(L), L.length > 0 && (Ie(L[0].id), lt(L[0].id));
    });
  }, []);
  const yt = a(async (i) => {
    const A = i ?? Ss();
    if (Te(i || A), A.filter((ce) => ce.enabled).length === 0) {
      Je([]);
      return;
    }
    gt(!0);
    try {
      const { skills: ce, errors: ge, categories: we } = await zs(A);
      if (Je(ce), Sa(we), ge.length > 0) {
        for (const ye of ge)
          console.warn(`[ugsci] GitHub source '${ye.label}' error: ${ye.message}`);
        f.warning(
          `部分源加载失败: ${ge.map((ye) => ye.label).join(", ")}`
        );
      }
    } catch (ce) {
      f.error(ce.message || "加载技能源失败"), Je([]);
    } finally {
      gt(!1);
    }
  }, []), Mt = a(async () => {
    var ce, ge, we;
    mn(!0), En(!0), gt(!0);
    const [i, A, L] = await Promise.allSettled([
      ks(),
      Ts(),
      _s()
    ]);
    if (i.status === "fulfilled" ? (sn(i.value.servers), on(i.value.categories)) : (console.warn(`[ugsci] MCP manifest error: ${((ce = i.reason) == null ? void 0 : ce.message) || i.reason}`), sn([]), on([])), mn(!1), A.status === "fulfilled" ? (pn(A.value.agents), fn(A.value.categories)) : (console.warn(`[ugsci] Agents manifest error: ${((ge = A.reason) == null ? void 0 : ge.message) || A.reason}`), pn([]), fn([])), En(!1), L.status === "fulfilled")
      pt(L.value.skills), rt("");
    else {
      const ye = ((we = L.reason) == null ? void 0 : we.message) || String(L.reason);
      console.warn(`[ugsci] Skills manifest error: ${ye}`), pt([]), rt(ye);
    }
    gt(!1);
  }, []);
  l(() => {
    yt(), Mt(), en(hs()), nn(vs());
  }, [yt, Mt]);
  const Et = a(
    async (i, A, L) => {
      fe(!0);
      try {
        const ce = await Ps(
          i,
          L,
          20,
          "zh",
          A || void 0
        );
        L === void 0 || Object.keys(L).length === 0 ? te(ce.results) : te((ye) => [...ye, ...ce.results]);
        const ge = Object.values(ce.by_provider || {}).some(
          (ye) => ye.has_more
        );
        pe(ge);
        const we = {};
        for (const [ye, Be] of Object.entries(ce.by_provider || {}))
          we[ye] = (L[ye] || 1) + 1;
        if (Y(we), ce.errors.length > 0)
          for (const ye of ce.errors)
            console.warn(
              `[ugsci] Market provider '${ye.provider}' error: ${ye.message}`
            );
      } catch (ce) {
        f.error(ce.message || "搜索市场失败"), te([]);
      } finally {
        fe(!1);
      }
    },
    []
  );
  l(() => (it.current && clearTimeout(it.current), it.current = setTimeout(() => {
    Et(m, p, {});
  }, 400), () => {
    it.current && clearTimeout(it.current);
  }), [m, p, Et]);
  const wa = () => {
    Et(m, p, ae);
  }, bn = async (i) => {
    const A = `${i.source}:${i.slug}`;
    try {
      D((ce) => ({ ...ce, [A]: "installing" }));
      const L = await Ln(i.source_url);
      L.installed && f.success(
        `技能「${L.name || i.name}」已安装到技能池，可在技能中心查看`
      ), D((ce) => {
        const ge = { ...ce };
        return delete ge[A], ge;
      });
    } catch (L) {
      f.error(Rn(L) || "安装技能失败"), D((ce) => {
        const ge = { ...ce };
        return delete ge[A], ge;
      });
    }
  }, Ca = (i) => {
    window.history.pushState({}, "", i), window.dispatchEvent(new PopStateEvent("popstate"));
  }, xa = async (i) => {
    const A = `github:${i.sourceId}:${i.name}`, L = Ce.find((ge) => ge.id === i.sourceId), ce = (L == null ? void 0 : L.accessToken) || void 0;
    try {
      D((we) => ({ ...we, [A]: "installing" }));
      const ge = await Ln(i.source_url, ce);
      ge.installed && f.success(
        `技能「${ge.name || i.name}」已安装到技能池，可在技能中心查看`
      ), D((we) => {
        const ye = { ...we };
        return delete ye[A], ye;
      });
    } catch (ge) {
      f.error(Rn(ge) || "安装技能失败"), D((we) => {
        const ye = { ...we };
        return delete ye[A], ye;
      });
    }
  }, Ge = n(() => {
    const i = [], A = /* @__PURE__ */ new Set();
    for (const L of [...he, ...We]) {
      const ce = L.source_url || `${L.sourceLabel}:${L.name}`;
      A.has(ce) || (A.add(ce), i.push(L));
    }
    return i;
  }, [he, We]), Sn = n(() => {
    const i = [], A = /* @__PURE__ */ new Set();
    if (ot.length > 0)
      for (const L of ot)
        A.has(L.id) || (A.add(L.id), i.push(L));
    for (const L of Ge)
      L.tag && !A.has(L.tag) && (A.add(L.tag), i.push({ id: L.tag, label: L.tag }));
    for (const L of Ge)
      !L.isOfficial && L.sourceLabel && !A.has(L.sourceLabel) && (A.add(L.sourceLabel), i.push({ id: L.sourceLabel, label: L.sourceLabel }));
    return i;
  }, [Ge, ot]), Rt = n(() => {
    let i = Ge;
    if (p) {
      const A = ot.find((L) => L.id === p);
      A && A.tags ? i = i.filter(
        (L) => L.tag && A.tags.includes(L.tag) || L.sourceLabel === p
      ) : i = i.filter(
        (L) => L.tag === p || L.sourceLabel === p
      );
    }
    if (m.trim()) {
      const A = m.toLowerCase();
      i = i.filter(
        (L) => {
          var ce;
          return L.name.toLowerCase().includes(A) || ((ce = L.description) == null ? void 0 : ce.toLowerCase().includes(A));
        }
      );
    }
    return i;
  }, [Ge, m, p, ot]), wn = se.filter((i) => i.available), qe = n(() => p ? _.filter((i) => {
    const A = wn.find((L) => L.key === i.source);
    return (A == null ? void 0 : A.label) === p;
  }) : _, [_, p, wn]), ka = e.createElement(
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
        prefix: V ? e.createElement(V) : void 0,
        value: m,
        onChange: (i) => N(i.target.value),
        allowClear: !0,
        style: { flex: 1, minWidth: 200, maxWidth: 400 }
      }),
      // Pool install info
      e.createElement(
        u,
        { type: "secondary", style: { fontSize: 12 } },
        "安装后进入技能池"
      ),
      // Configure skill source button
      e.createElement(
        c,
        {
          icon: z ? e.createElement(z) : void 0,
          onClick: () => Zt(!0),
          size: "small"
        },
        "配置技能源"
      )
    ),
    // Dynamic category filter tags (from OSS manifest tags + imported sources)
    Pt && Ge.length === 0 ? e.createElement(k, {
      type: "warning",
      showIcon: !0,
      message: "UGSci 官方 OSS 技能库加载失败",
      description: "请检查网络或后端 OSS 代理服务，然后点击右上角“刷新”重试。",
      style: { marginBottom: 12 }
    }) : null,
    Sn.length > 0 ? e.createElement(
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
        u,
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
          color: p === "" ? "blue" : void 0,
          onClick: () => ne("")
        },
        "全部"
      ),
      ...Sn.map((i) => {
        const A = We.some(
          (L) => !L.isOfficial && L.sourceLabel === i.id
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
            color: p === i.id ? A ? "blue" : "geekblue" : void 0,
            icon: A && z ? e.createElement(z) : void 0,
            onClick: () => ne(
              p === i.id ? "" : i.id
            )
          },
          i.label
        );
      })
    ) : null,
    // GitHub skills section
    je && Ge.length === 0 ? e.createElement(
      "div",
      { style: { textAlign: "center", padding: 40, marginBottom: 16 } },
      e.createElement(o, { size: "large" }, e.createElement("div", { style: { minHeight: 60, display: "flex", alignItems: "center", justifyContent: "center" } }, "正在加载技能..."))
    ) : Rt.length > 0 ? e.createElement(
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
        z ? e.createElement(z, {
          style: { fontSize: 14, color: "#1677ff" }
        }) : null,
        e.createElement(
          u,
          { strong: !0, style: { fontSize: 13 } },
          `技能市场 (${Rt.length})`
        )
      ),
      e.createElement(
        C,
        { gutter: [12, 12] },
        ...Rt.map((i) => {
          const A = `github:${i.sourceId}:${i.name}`, L = oe[A];
          return e.createElement(
            w,
            { key: A, xs: 24, sm: 12, md: 8, lg: 6 },
            e.createElement(
              b,
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
                z ? e.createElement(z, {
                  style: { fontSize: 18, color: "#57606a" }
                }) : e.createElement(
                  "span",
                  { style: { fontSize: 18 } },
                  "📦"
                ),
                e.createElement(
                  E,
                  { title: i.name },
                  e.createElement(
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
                    i.name
                  )
                )
              ),
              e.createElement(
                O,
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
                    y ? e.createElement(y, { style: { fontSize: 10 } }) : null,
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
                L ? e.createElement(
                  c,
                  {
                    size: "small",
                    disabled: !0,
                    icon: R ? e.createElement(R) : void 0
                  },
                  "安装中"
                ) : e.createElement(
                  c,
                  {
                    type: "primary",
                    size: "small",
                    icon: F ? e.createElement(F) : void 0,
                    onClick: () => xa(i)
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
    qe.length > 0 || de ? e.createElement(
      "div",
      {
        style: {
          marginBottom: 10,
          display: "flex",
          alignItems: "center",
          gap: 6
        }
      },
      h ? e.createElement(h, {
        style: { fontSize: 14, color: "#1677ff" }
      }) : null,
      e.createElement(
        u,
        { strong: !0, style: { fontSize: 13 } },
        `技能市场${qe.length > 0 ? ` (${qe.length})` : ""}`
      )
    ) : null,
    // Results grid
    de && qe.length === 0 ? e.createElement(
      "div",
      { style: { textAlign: "center", padding: 60 } },
      e.createElement(o, { size: "large" })
    ) : qe.length === 0 ? e.createElement(r, {
      description: m ? `未找到匹配「${m}」的技能` : "输入关键词搜索技能市场",
      image: r.PRESENTED_IMAGE_SIMPLE
    }) : e.createElement(
      C,
      { gutter: [12, 12] },
      ...qe.map((i) => {
        const A = `${i.source}:${i.slug}`, L = oe[A];
        return e.createElement(
          w,
          { key: A, xs: 24, sm: 12, md: 8, lg: 6 },
          e.createElement(
            b,
            {
              hoverable: !0,
              size: "small",
              style: { height: "100%", cursor: "pointer" },
              onClick: () => q(i)
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
                E,
                { title: i.name },
                e.createElement(
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
                  i.name
                )
              )
            ),
            e.createElement(
              O,
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
              L ? e.createElement(
                c,
                {
                  size: "small",
                  disabled: !0,
                  icon: R ? e.createElement(R) : void 0
                },
                "安装中"
              ) : e.createElement(
                c,
                {
                  type: "primary",
                  size: "small",
                  icon: F ? e.createElement(F) : void 0,
                  onClick: (ce) => {
                    ce.stopPropagation(), bn(i);
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
    Ee && !de ? e.createElement(
      "div",
      { style: { textAlign: "center", marginTop: 16 } },
      e.createElement(
        c,
        { onClick: wa, loading: de },
        "加载更多"
      )
    ) : null,
    // Detail Drawer
    S ? e.createElement(
      B,
      {
        title: e.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 8 } },
          S.icon_url ? e.createElement("img", {
            src: S.icon_url,
            alt: S.name,
            style: { width: 28, height: 28, borderRadius: 4 }
          }) : e.createElement(
            "span",
            { style: { fontSize: 20 } },
            "📦"
          ),
          e.createElement("span", null, S.name)
        ),
        open: !0,
        onClose: () => q(null),
        width: 480,
        extra: e.createElement(
          c,
          {
            type: "primary",
            icon: F ? e.createElement(F) : void 0,
            onClick: () => {
              bn(S);
            }
          },
          "安装到技能池"
        )
      },
      e.createElement(
        U,
        { column: 1, bordered: !0, size: "small" },
        e.createElement(
          U.Item,
          { label: "来源" },
          S.source
        ),
        e.createElement(
          U.Item,
          { label: "描述" },
          S.description || "-"
        ),
        S.version ? e.createElement(
          U.Item,
          { label: "版本" },
          S.version
        ) : null,
        S.author ? e.createElement(
          U.Item,
          { label: "作者" },
          S.author
        ) : null,
        e.createElement(
          U.Item,
          { label: "来源链接" },
          e.createElement(
            "a",
            { href: S.source_url, target: "_blank" },
            S.source_url
          )
        )
      ),
      S.stats ? e.createElement(
        "div",
        { style: { marginTop: 16 } },
        e.createElement(
          u,
          {
            strong: !0,
            style: { display: "block", marginBottom: 8 }
          },
          "统计"
        ),
        e.createElement(
          "div",
          { style: { display: "flex", gap: 12, flexWrap: "wrap" } },
          ...Object.entries(S.stats).map(
            ([i, A]) => e.createElement(
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
                String(A)
              ),
              e.createElement(
                u,
                { type: "secondary", style: { fontSize: 11 } },
                i
              )
            )
          )
        )
      ) : null
    ) : null
  ), Lt = n(() => {
    let i = un;
    if (Ke && (i = i.filter((A) => A.category === Ke)), ke.trim()) {
      const A = ke.toLowerCase();
      i = i.filter(
        (L) => L.name.toLowerCase().includes(A) || L.description.toLowerCase().includes(A) || L.tags.some((ce) => ce.toLowerCase().includes(A))
      );
    }
    return i;
  }, [un, ke, Ke]), _a = async (i) => {
    if (!$t) {
      vn(!0);
      try {
        let A = i.description;
        if (i.instructions)
          try {
            const ge = i.instructions.replace(/^\/+/, ""), we = await fetch(mt(ge));
            we.ok && (A = await we.text());
          } catch {
          }
        let L = [];
        if (i.skills_manifest)
          try {
            const ge = i.skills_manifest.replace(/^\/+/, ""), we = await fetch(mt(ge));
            if (we.ok) {
              const ye = await we.json();
              Array.isArray(ye) ? L = ye.map((Be) => typeof Be == "string" ? Be : Be.name).filter(Boolean) : ye.skills && (L = ye.skills.map((Be) => typeof Be == "string" ? Be : Be.name).filter(Boolean));
            }
          } catch {
          }
        const ce = await re("/agents", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: i.name,
            description: i.description,
            skill_names: L
          })
        });
        await xt(ce.id, "AGENTS.md", A), f.success(`专家「${i.name}」创建成功，已跳转至专家`), Ca("/ugsci-experts");
      } catch (A) {
        f.error(A.message || "创建专家失败");
      } finally {
        vn(!1);
      }
    }
  }, Cn = a(async (i) => {
    if (i)
      try {
        const A = await Kt(i);
        st(new Set(A.map((L) => L.key)));
      } catch {
        st(/* @__PURE__ */ new Set());
      }
  }, []);
  l(() => {
    $e && Cn($e);
  }, [$e, Cn]);
  const Ta = async (i) => {
    if (!$e) {
      f.warning("请先选择目标专家");
      return;
    }
    if (fs(i)) {
      const A = Object.entries(i.env), L = {};
      for (const [ce] of A)
        L[ce] = "";
      Se(L), _e(i);
      return;
    }
    await xn(i, i.env || {});
  }, xn = async (i, A) => {
    at((L) => ({ ...L, [i.id]: !0 }));
    try {
      const L = i.id;
      await Gn($e, {
        client_key: L,
        client: {
          name: i.name,
          description: i.description,
          enabled: !0,
          transport: i.transport,
          url: i.url || "",
          command: i.command || "",
          args: i.args || [],
          env: A,
          cwd: i.cwd || "",
          headers: i.headers || {}
        }
      }), f.success(`MCP「${i.name}」已添加到当前专家`), st((ce) => new Set(ce).add(L));
    } catch (L) {
      f.error(L.message || `添加 MCP「${i.name}」失败`);
    } finally {
      at((L) => ({ ...L, [i.id]: !1 }));
    }
  }, za = async () => {
    if (!be) return;
    const i = [];
    for (const [L, ce] of Object.entries(ee))
      if (!ce || !ce.trim()) {
        const ge = Pn[L];
        i.push((ge == null ? void 0 : ge.label) || L);
      }
    if (i.length > 0) {
      f.warning(`请填写以下配置项: ${i.join(", ")}`);
      return;
    }
    const A = be;
    _e(null), Se({}), await xn(A, { ...ee });
  }, jt = n(() => {
    let i = ln;
    if (Xe && (i = i.filter((A) => A.category === Xe)), Pe.trim()) {
      const A = Pe.toLowerCase();
      i = i.filter(
        (L) => L.name.toLowerCase().includes(A) || L.description.toLowerCase().includes(A) || L.tags.some((ce) => ce.toLowerCase().includes(A))
      );
    }
    return i.map(Es);
  }, [ln, Pe, Xe]), Ia = e.createElement(
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
        prefix: V ? e.createElement(V) : void 0,
        value: Pe,
        onChange: (i) => nt(i.target.value),
        allowClear: !0,
        style: { maxWidth: 300 }
      }),
      e.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        e.createElement(
          u,
          { type: "secondary", style: { fontSize: 12, whiteSpace: "nowrap" } },
          "安装到："
        ),
        e.createElement(j, {
          value: $e,
          onChange: (i) => lt(i),
          style: { minWidth: 180 },
          size: "small",
          options: ue.map((i) => ({ value: i.id, label: i.name }))
        })
      ),
      // Configure MCP source button
      e.createElement(
        c,
        {
          icon: y ? e.createElement(y) : void 0,
          onClick: () => tn(!0),
          size: "small"
        },
        "配置 MCP 源"
      )
    ),
    // Dynamic category tag row (from OSS manifest tag_groups)
    rn.length > 0 ? e.createElement(
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
        u,
        { type: "secondary", style: { fontSize: 12, marginRight: 4 } },
        "分类:"
      ),
      e.createElement(
        v,
        {
          style: { fontSize: 11, cursor: "pointer", borderRadius: 12 },
          color: Xe === "" ? "blue" : void 0,
          onClick: () => dn("")
        },
        "全部"
      ),
      ...rn.map(
        (i) => e.createElement(
          v,
          {
            key: i.id,
            style: { fontSize: 11, cursor: "pointer", borderRadius: 12 },
            color: Xe === i.id ? "geekblue" : void 0,
            onClick: () => dn(
              Xe === i.id ? "" : i.id
            )
          },
          i.label
        )
      )
    ) : null,
    // MCP server cards (dynamic from OSS)
    cn && jt.length === 0 ? e.createElement(
      "div",
      { style: { textAlign: "center", padding: 40 } },
      e.createElement(o, { size: "large" }, e.createElement("div", { style: { minHeight: 60, display: "flex", alignItems: "center", justifyContent: "center" } }, "正在加载 MCP 服务器..."))
    ) : jt.length === 0 ? e.createElement(r, {
      description: "未找到匹配的 MCP 服务器",
      image: r.PRESENTED_IMAGE_SIMPLE
    }) : e.createElement(
      C,
      { gutter: [12, 12] },
      ...jt.map(
        (i) => e.createElement(
          w,
          { key: i.id, xs: 24, sm: 12, md: 8 },
          e.createElement(
            b,
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
                  onError: (A) => {
                    A.target.style.display = "none";
                  }
                }) : i.emoji
              ),
              e.createElement(
                "div",
                { style: { flex: 1 } },
                e.createElement(
                  u,
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
              O,
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
                u,
                { type: "secondary", style: { fontSize: 11 } },
                i.transport === "stdio" ? `${i.command} ${(i.args || []).join(" ")}` : i.url || ""
              ),
              ut.has(i.id) ? e.createElement(
                c,
                { size: "small", disabled: !0 },
                "已安装"
              ) : e.createElement(
                c,
                {
                  type: "primary",
                  size: "small",
                  loading: !!dt[i.id],
                  icon: y ? e.createElement(y) : void 0,
                  onClick: () => Ta(i)
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
      h ? e.createElement(h, {
        style: { fontSize: 24, color: "#bfbfbf", marginBottom: 8 }
      }) : null,
      e.createElement(
        u,
        { type: "secondary", style: { fontSize: 12 } },
        "MCP 服务器列表来自 UGSci 官方源，自动同步更新"
      )
    )
  ), Oa = be ? e.createElement(
    T,
    {
      title: e.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 8 } },
        e.createElement("span", { style: { fontSize: 20, display: "inline-flex", alignItems: "center", justifyContent: "center", width: 24, height: 24 } }, be.iconUrl ? e.createElement("img", { src: be.iconUrl, alt: be.name, style: { width: 22, height: 22, objectFit: "contain" }, onError: (i) => {
          i.target.style.display = "none";
        } }) : be.emoji),
        e.createElement("span", null, `配置 ${be.name} 密钥`)
      ),
      open: !!be,
      onCancel: () => {
        _e(null), Se({});
      },
      onOk: za,
      okText: "安装",
      cancelText: "取消",
      width: 520,
      destroyOnClose: !0
    },
    // Description
    e.createElement(
      u,
      { type: "secondary", style: { display: "block", marginBottom: 16, fontSize: 12 } },
      be.description
    ),
    ...Object.entries(be.env || {}).map(([i]) => {
      const A = Pn[i], L = (A == null ? void 0 : A.isSecret) !== !1;
      return e.createElement(
        "div",
        { key: i, style: { marginBottom: 16 } },
        e.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 6, marginBottom: 4 } },
          e.createElement(
            u,
            { strong: !0, style: { fontSize: 13 } },
            (A == null ? void 0 : A.label) || i
          ),
          e.createElement(
            v,
            { color: "orange", style: { fontSize: 10 } },
            "必填"
          )
        ),
        // Help text with optional link
        A ? e.createElement(
          "div",
          { style: { marginBottom: 6, fontSize: 12, color: "#8c8c8c" } },
          A.help,
          A.link ? e.createElement(
            "a",
            {
              href: A.link,
              target: "_blank",
              rel: "noopener noreferrer",
              style: { marginLeft: 4, fontSize: 12 }
            },
            "获取方式 ↗"
          ) : null
        ) : null,
        // Input field
        L ? e.createElement(d.Password, {
          placeholder: `请输入 ${(A == null ? void 0 : A.label) || i}`,
          value: ee[i] || "",
          onChange: (ce) => Se((ge) => ({
            ...ge,
            [i]: ce.target.value
          })),
          style: { width: "100%" }
        }) : e.createElement(d, {
          placeholder: `请输入 ${(A == null ? void 0 : A.label) || i}`,
          value: ee[i] || "",
          onChange: (ce) => Se((ge) => ({
            ...ge,
            [i]: ce.target.value
          })),
          style: { width: "100%" }
        }),
        // Show env key name for reference
        e.createElement(
          u,
          { type: "secondary", style: { fontSize: 11, display: "block", marginTop: 2 } },
          `环境变量名: ${i}`
        )
      );
    })
  ) : null, Aa = e.createElement(
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
        placeholder: "搜索人才...",
        prefix: V ? e.createElement(V) : void 0,
        value: ke,
        onChange: (i) => Fe(i.target.value),
        allowClear: !0,
        style: { maxWidth: 400, flex: 1, minWidth: 200 }
      }),
      e.createElement(
        c,
        {
          icon: X ? e.createElement(X) : void 0,
          onClick: () => an(!0),
          size: "small"
        },
        "配置专家源"
      )
    ),
    // Dynamic category tag row (from OSS manifest tag_groups)
    gn.length > 0 ? e.createElement(
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
        u,
        { type: "secondary", style: { fontSize: 12, marginRight: 4 } },
        "分类:"
      ),
      e.createElement(
        v,
        {
          style: { fontSize: 11, cursor: "pointer", borderRadius: 12 },
          color: Ke === "" ? "blue" : void 0,
          onClick: () => hn("")
        },
        "全部"
      ),
      ...gn.map(
        (i) => e.createElement(
          v,
          {
            key: i.id,
            style: { fontSize: 11, cursor: "pointer", borderRadius: 12 },
            color: Ke === i.id ? "geekblue" : void 0,
            onClick: () => hn(
              Ke === i.id ? "" : i.id
            )
          },
          i.label
        )
      )
    ) : null,
    // Agent cards (dynamic from OSS)
    yn && Lt.length === 0 ? e.createElement(
      "div",
      { style: { textAlign: "center", padding: 40 } },
      e.createElement(o, { size: "large" }, e.createElement("div", { style: { minHeight: 60, display: "flex", alignItems: "center", justifyContent: "center" } }, "正在加载人才市场..."))
    ) : Lt.length === 0 ? e.createElement(r, {
      description: "未找到匹配的人才",
      image: r.PRESENTED_IMAGE_SIMPLE
    }) : e.createElement(
      C,
      { gutter: [12, 12] },
      ...Lt.map(
        (i) => e.createElement(
          w,
          { key: i.id, xs: 24, sm: 12, md: 8 },
          e.createElement(
            b,
            {
              hoverable: !0,
              size: "small",
              style: { height: "100%", cursor: "pointer" },
              onClick: () => ft(i)
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
              e.createElement(Ae, {
                name: i.name,
                size: 40
              }),
              e.createElement(
                "div",
                { style: { flex: 1 } },
                e.createElement(
                  u,
                  { strong: !0, style: { fontSize: 14 } },
                  i.name
                ),
                e.createElement(
                  "div",
                  { style: { display: "flex", gap: 4, marginTop: 4, flexWrap: "wrap" } },
                  i.category ? e.createElement(
                    v,
                    { color: "blue", style: { fontSize: 10 } },
                    et(i.category)
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
              O,
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
                u,
                { type: "secondary", style: { fontSize: 11 } },
                i.tags.filter((A) => A !== "agent" && A !== "template" && A !== "workspace").slice(0, 3).join(" · ") || "人才模板"
              ),
              e.createElement(
                c,
                {
                  type: "primary",
                  size: "small",
                  icon: G ? e.createElement(G) : void 0
                },
                "查看详情"
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
      h ? e.createElement(h, {
        style: { fontSize: 24, color: "#bfbfbf", marginBottom: 8 }
      }) : null,
      e.createElement(
        u,
        { type: "secondary", style: { fontSize: 12 } },
        "人才市场来自 UGSci 官方源，自动同步更新"
      )
    )
  ), Pa = [
    {
      key: "skills",
      label: e.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        $ ? e.createElement($, { style: { fontSize: 14 } }) : null,
        "技能市场"
      ),
      children: ka
    },
    {
      key: "mcp",
      label: e.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        y ? e.createElement(y, { style: { fontSize: 14 } }) : null,
        "MCP 市场"
      ),
      children: Ia
    },
    {
      key: "experts",
      label: e.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        G ? e.createElement(G, { style: { fontSize: 14 } }) : null,
        "人才市场"
      ),
      children: Aa
    }
  ];
  return e.createElement(
    "div",
    { style: { padding: 24 } },
    e.createElement(It, {
      title: "市场",
      subtitle: "浏览技能市场 · 选择 MCP 服务器 · 人才市场 · 随时更新能力和专家",
      extra: e.createElement(
        "div",
        { style: { display: "flex", gap: 8 } },
        e.createElement(
          c,
          {
            type: "primary",
            icon: I ? e.createElement(I) : void 0,
            onClick: () => {
              Et(m, p, {}), yt(), Mt();
            },
            loading: de || je || cn || yn
          },
          "刷新"
        )
      )
    }),
    e.createElement(Z, {
      items: Pa,
      activeKey: M,
      onChange: (i) => K(i)
    }),
    // Skill source config modal
    e.createElement(Is, {
      open: ya,
      onClose: () => Zt(!1),
      sources: Ce,
      onChange: (i) => {
        Te(i), yt(i);
      }
    }),
    // MCP source config modal
    e.createElement(Mn, {
      open: ha,
      onClose: () => tn(!1),
      sources: Ea,
      onChange: (i) => en(i),
      type: "mcp"
    }),
    // MCP token config modal (for templates requiring secrets)
    Oa,
    // Expert source config modal
    e.createElement(Mn, {
      open: ba,
      onClose: () => an(!1),
      sources: va,
      onChange: (i) => nn(i),
      type: "expert"
    }),
    // ── Agent Detail Modal (click card to view details, then create) ──
    ze ? e.createElement(
      T,
      {
        title: e.createElement(
          "div",
          {
            style: {
              display: "flex",
              alignItems: "center",
              gap: 12
            }
          },
          e.createElement(Ae, {
            name: ze.name,
            size: 40
          }),
          e.createElement(
            "div",
            null,
            e.createElement(
              u,
              { strong: !0, style: { fontSize: 16 } },
              ze.name
            ),
            e.createElement(
              "div",
              {
                style: {
                  display: "flex",
                  gap: 4,
                  marginTop: 2,
                  flexWrap: "wrap"
                }
              },
              ze.category ? e.createElement(
                v,
                { color: "blue", style: { fontSize: 10 } },
                et(ze.category)
              ) : null,
              ...ze.tags.filter(
                (i) => i !== "agent" && i !== "template" && i !== "workspace"
              ).slice(0, 5).map(
                (i) => e.createElement(
                  v,
                  { key: i, style: { fontSize: 10 } },
                  i
                )
              )
            )
          )
        ),
        open: !0,
        onCancel: () => ft(null),
        width: 640,
        footer: e.createElement(
          "div",
          { style: { textAlign: "right" } },
          e.createElement(
            c,
            {
              onClick: () => ft(null),
              style: { marginRight: 8 }
            },
            "取消"
          ),
          e.createElement(
            c,
            {
              type: "primary",
              loading: $t,
              disabled: $t,
              icon: G ? e.createElement(G) : void 0,
              style: Oe,
              onClick: async () => {
                await _a(ze), ft(null);
              }
            },
            "创建专家"
          )
        )
      },
      // Description
      e.createElement(
        "div",
        { style: { marginBottom: 16 } },
        e.createElement(
          u,
          { strong: !0, style: { display: "block", marginBottom: 6 } },
          "简介"
        ),
        e.createElement(
          O,
          {
            type: "secondary",
            style: { fontSize: 13, lineHeight: 1.7, margin: 0 }
          },
          ze.description
        )
      ),
      // Skills manifest hint
      ze.skills_manifest ? e.createElement(
        "div",
        {
          style: {
            marginBottom: 16,
            padding: 12,
            background: "#f6ffed",
            borderRadius: 8,
            border: "1px solid #b7eb8f"
          }
        },
        e.createElement(
          u,
          { style: { fontSize: 12, color: "#52c41a" } },
          "✓ 包含技能清单，创建后将自动安装推荐技能"
        )
      ) : null,
      // Instructions hint
      ze.instructions ? e.createElement(
        "div",
        {
          style: {
            marginBottom: 16,
            padding: 12,
            background: "#e6f4ff",
            borderRadius: 8,
            border: "1px solid #91caff"
          }
        },
        e.createElement(
          u,
          { style: { fontSize: 12, color: "#1677ff" } },
          "✓ 包含系统提示词，创建后将自动写入 AGENTS.md"
        )
      ) : null,
      // Drivers
      ze.drivers && Object.keys(ze.drivers).length > 0 ? e.createElement(
        "div",
        null,
        e.createElement(
          u,
          {
            strong: !0,
            style: { display: "block", marginBottom: 6 }
          },
          "推荐引擎"
        ),
        e.createElement(
          "div",
          {
            style: {
              display: "flex",
              gap: 6,
              flexWrap: "wrap"
            }
          },
          ...Object.entries(ze.drivers).map(
            ([i, A]) => e.createElement(
              v,
              { key: i, color: "cyan", style: { fontSize: 11 } },
              `${i}${A && A.length > 0 ? ` (${A.join(", ")})` : ""}`
            )
          )
        )
      ) : null
    ) : null
  );
}
function Ms() {
  try {
    const t = localStorage.getItem("language") || "";
    if (t) return t.split("-")[0];
  } catch {
  }
  return ((typeof navigator < "u" ? navigator.language : "") || "").split("-")[0] || "en";
}
const jn = {
  zh: "您好，UGSci 智能助手在线。无论是油气藏分析、数值模拟还是工程决策，描述您的场景，我来交付结果。",
  en: "UGSci AI assistant is online. From reservoir analysis to numerical simulation and engineering decisions — describe your scenario and I'll deliver results.",
  ja: "UGSci AIアシスタントがオンラインです。油層解析、数値シミュレーション、エンジニアリングの意思決定など、シナリオを描写してください。結果をお届けします。",
  ru: "UGSci AI-ассистент онлайн. От анализа пласта до численного моделирования и инженерных решений — опишите свой сценарий, и я предоставлю результат.",
  vi: "Trợ lý AI UGSci đang trực tuyến. Từ phân tích mỏ, mô phỏng số đến ra quyết định kỹ thuật — mô tả kịch bản của bạn, tôi sẽ giao kết quả.",
  id: "Asisten AI UGSci sedang online. Dari analisis reservoir, simulasi numerik hingga keputusan engineering — jelaskan skenario Anda, saya akan memberikan hasilnya."
}, Bn = {
  zh: { label: "能告诉我你都能做点什么吗？", value: "能告诉我你都能做点什么吗" },
  en: { label: "Can you tell me what you can do?", value: "Can you tell me what you can do?" },
  ja: { label: "あなたができることを教えてください", value: "あなたができることを教えてください" },
  ru: { label: "Расскажи, что ты умеешь делать?", value: "Расскажи, что ты умеешь делать?" },
  vi: { label: "Bạn có thể cho tôi biết bạn làm được gì không?", value: "Bạn có thể cho tôi biết bạn làm được gì không?" },
  id: { label: "Bisa cerita apa saja yang bisa Anda lakukan?", value: "Bisa cerita apa saja yang bisa Anda lakukan?" }
};
function Rs() {
  const e = P(), t = e.React, { useEffect: l, useRef: a } = t, n = e.useSelectedAgent ? e.useSelectedAgent() : { id: "default" }, s = (n == null ? void 0 : n.id) || "default", o = a(null), r = a(null);
  return l(() => {
    if (o.current === s) return;
    o.current = s, Tt();
    const d = Ms(), c = jn[d] || jn.en, f = Bn[d] || Bn.en;
    let C = !1;
    return (async () => {
      var w, b;
      try {
        const v = await Ot(s);
        if (C) return;
        const E = Nn(v);
        if (r.current) {
          try {
            r.current();
          } catch {
          }
          r.current = null;
        }
        const x = window.QwenPaw;
        (w = x == null ? void 0 : x.chat) != null && w.welcome && (E.length > 0 ? (r.current = x.chat.welcome.set("ugsci", {
          description: c,
          prompts: E
        }), console.info(
          `[ugsci] Injected ${E.length} welcome prompts for agent "${s}"`
        )) : (r.current = x.chat.welcome.set("ugsci", {
          description: c,
          prompts: [f]
        }), console.info(
          `[ugsci] No skills for agent "${s}" — using default prompt`
        )));
      } catch (v) {
        console.warn(
          `[ugsci] Failed to inject welcome prompts for agent "${s}":`,
          v
        );
        const E = window.QwenPaw;
        if ((b = E == null ? void 0 : E.chat) != null && b.welcome && !C) {
          if (r.current) {
            try {
              r.current();
            } catch {
            }
            r.current = null;
          }
          r.current = E.chat.welcome.set("ugsci", {
            description: c,
            prompts: [f]
          });
        }
      }
    })(), () => {
      C = !0;
    };
  }, [s]), null;
}
function Ls() {
  var c, f, C;
  const e = window.QwenPaw;
  if (!(e != null && e.menu) || !(e != null && e.route)) {
    console.warn(
      "[ugsci] QwenPaw.menu/route API not available — plugin disabled"
    );
    return;
  }
  const t = P().React, l = "ugsci";
  (f = (c = e.chat) == null ? void 0 : c.rightHeader) != null && f.add ? (e.chat.rightHeader.add(l, t.createElement(Rs), {
    id: "ugsci.welcome-injector",
    order: -1
    // render before other right-header items (invisible anyway)
  }), console.info("[ugsci] WelcomePromptsInjector registered via rightHeader")) : console.warn(
    "[ugsci] QP.chat.rightHeader.add not available — agent-specific welcome prompts disabled"
  );
  const a = P().antdIcons || {}, n = a.UserSwitchOutlined, s = a.ToolOutlined, o = a.ThunderboltOutlined, r = a.ShopOutlined;
  e.route.add(l, {
    id: "ugsci.experts",
    path: "/ugsci-experts",
    component: Hl
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
    component: ds
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
    component: gs
  }), e.menu.add(l, {
    id: "ugsci.skills-center",
    location: "primary.agentScoped",
    label: () => "技能",
    icon: o ? t.createElement(o, { style: { fontSize: 16 } }) : void 0,
    route: "ugsci.skills-center",
    order: 7,
    visible: () => Ve()
  }), e.route.add(l, {
    id: "ugsci.market",
    path: "/ugsci-market",
    component: $s
  }), e.menu.add(l, {
    id: "ugsci.market",
    location: "primary.agentScoped",
    label: () => "市场",
    icon: r ? t.createElement(r, { style: { fontSize: 16 } }) : void 0,
    route: "ugsci.market",
    order: 8,
    visible: () => Ve()
  }), (C = e.sidebar) != null && C.registerSimpleModeItems ? (e.sidebar.registerSimpleModeItems([
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
  for (const w of d) {
    try {
      const v = e.menu.snapshot("primary.agentScoped").find((E) => E.id === w);
      v && e.menu.replace(l, w, {
        ...v,
        visible: () => !Ve()
      });
    } catch {
    }
    try {
      const v = e.menu.snapshot("primary.settings").find((E) => E.id === w);
      v && e.menu.replace(l, w, {
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
function Ft() {
  try {
    Ls();
  } catch (e) {
    console.error("[ugsci] Failed to build plugin:", e), setTimeout(Ft, 500);
  }
}
var Un;
if ((Un = window.QwenPaw) != null && Un.host)
  Ft();
else {
  const e = setInterval(() => {
    var t;
    (t = window.QwenPaw) != null && t.host && (clearInterval(e), Ft());
  }, 200);
  setTimeout(() => clearInterval(e), 1e4);
}
