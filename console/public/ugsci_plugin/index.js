function P() {
  var t;
  const e = (t = window.QwenPaw) == null ? void 0 : t.host;
  if (!e) throw new Error("[ugsci] QwenPaw.host not available");
  return e;
}
function Oa() {
  try {
    return P().getApiToken() || "";
  } catch {
    return "";
  }
}
function Ne(e) {
  return P().getApiUrl(e);
}
function bt(e) {
  const t = Oa();
  return {
    "Content-Type": "application/json",
    ...t ? { Authorization: `Bearer ${t}` } : {},
    ...e
  };
}
const it = /* @__PURE__ */ new Map(), Aa = 15e3;
function Pa(e) {
  return e ? e instanceof Headers ? e.get("X-Agent-Id") || e.get("x-agent-id") || "" : e["X-Agent-Id"] || e["x-agent-id"] || "" : "";
}
function $a(e, t, l) {
  return `${e}:${t}:${l}`;
}
function et() {
  it.clear();
}
function xt(e) {
  for (const [t, l] of it)
    (e ? l.agentId === e : l.agentId) && it.delete(t);
}
async function ie(e, t) {
  const l = ((t == null ? void 0 : t.method) || "GET").toUpperCase(), { bypassCache: a, ...n } = t || {}, s = Pa(
    n.headers
  ), r = $a(l, e, s);
  if (l !== "GET" && (s ? xt(s) : et()), l === "GET" && !a) {
    const c = it.get(r);
    if (c && Date.now() - c.ts < Aa)
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
function kt(e, t) {
  const l = P();
  return l.ReactMarkdown && l.remarkGfm ? t.createElement(
    l.ReactMarkdown,
    { remarkPlugins: [l.remarkGfm] },
    e
  ) : e.replace(/\*\*(.+?)\*\*/g, "$1").replace(/\*(.+?)\*/g, "$1").replace(/`(.+?)`/g, "$1").replace(/^#+\s*/gm, "").replace(/^[-*]\s+/gm, "• ");
}
function _t({
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
async function Nt() {
  const e = await ie("/agents");
  return (e == null ? void 0 : e.agents) || [];
}
async function Dt(e) {
  return ie(
    `/agents/${encodeURIComponent(e)}`
  );
}
async function Tt(e) {
  return await ie("/skills", {
    headers: { "X-Agent-Id": e }
  }) || [];
}
async function Ft(e = !1) {
  return await ie(`/skills/pool${e ? "?summary=true" : ""}`) || [];
}
async function Ma(e) {
  const t = await ie(
    `/skills/pool/${encodeURIComponent(e)}/content`
  );
  return (t == null ? void 0 : t.content) || "";
}
async function Ra() {
  return await ie(
    "/skills/workspaces"
  ) || [];
}
async function La(e) {
  return await ie("/mcp", {
    headers: { "X-Agent-Id": e }
  }) || [];
}
async function ja(e, t) {
  return ie(
    `/mcp/toggle/${encodeURIComponent(t)}`,
    {
      method: "PATCH",
      headers: { "X-Agent-Id": e }
    }
  );
}
async function Ba(e, t) {
  await ie(`/mcp/${encodeURIComponent(t)}`, {
    method: "DELETE",
    headers: { "X-Agent-Id": e }
  });
}
async function Ua(e, t, l) {
  return ie("/mcp", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify({ client_key: t, client: l })
  });
}
async function Na(e, t, l) {
  return ie(
    `/mcp/${encodeURIComponent(t)}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json", "X-Agent-Id": e },
      body: JSON.stringify(l)
    }
  );
}
async function Da(e, t) {
  return await ie(
    `/mcp/tools/${encodeURIComponent(t)}`,
    { headers: { "X-Agent-Id": e } }
  ) || [];
}
async function Fa(e, t) {
  return ie(
    `/mcp/policy/${encodeURIComponent(t)}`,
    { headers: { "X-Agent-Id": e } }
  );
}
async function Ga(e, t, l) {
  return ie(
    `/mcp/policy/${encodeURIComponent(t)}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json", "X-Agent-Id": e },
      body: JSON.stringify(l)
    }
  );
}
async function Ha(e) {
  return await ie(
    "/mcp/access-principals",
    { headers: { "X-Agent-Id": e } }
  ) || [];
}
async function Wa(e, t, l) {
  return ie(
    `/mcp/oauth/start/${encodeURIComponent(t)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Agent-Id": e },
      body: JSON.stringify(l)
    }
  );
}
async function Ja(e, t) {
  return ie(`/mcp/oauth/status/${encodeURIComponent(t)}`, {
    headers: { "X-Agent-Id": e }
  });
}
async function Xa(e, t) {
  await ie(
    `/mcp/oauth/${encodeURIComponent(t)}`,
    {
      method: "DELETE",
      headers: { "X-Agent-Id": e }
    }
  );
}
function jn(e) {
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
async function Ka(e) {
  return await ie("/workspace/files", {
    headers: { "X-Agent-Id": e }
  }) || [];
}
async function St(e, t, l) {
  return ie(`/workspace/files/${encodeURIComponent(t)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify({ content: l })
  });
}
async function qa(e, t, l, a) {
  return ie("/workspace/prompt-files", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify({ filename: t, content: l, enable: a })
  });
}
const Va = /* @__PURE__ */ new Set([
  "CON",
  "PRN",
  "AUX",
  "NUL",
  ...Array.from({ length: 9 }, (e, t) => `COM${t + 1}`),
  ...Array.from({ length: 9 }, (e, t) => `LPT${t + 1}`)
]);
function Ya(e) {
  let t = e.trim();
  if (!t) throw new Error("请输入文件名");
  if (/[\\/]/.test(t)) throw new Error("文件名不能包含路径分隔符");
  if (/[<>:\"|?*\u0000-\u001f]/.test(t))
    throw new Error("文件名包含系统不支持的字符");
  if (/[ .]$/.test(t)) throw new Error("文件名不能以空格或句点结尾");
  t.toLowerCase().endsWith(".md") ? t = `${t.slice(0, -3)}.md` : t += ".md";
  const l = t.split(".", 1)[0].toUpperCase();
  if (!t.slice(0, -3)) throw new Error("文件名不能为空");
  if (Va.has(l))
    throw new Error("该文件名是系统保留名称，请更换");
  if (new TextEncoder().encode(t).length > 255)
    throw new Error("文件名过长");
  return t;
}
async function Qa(e, t) {
  const l = await Dt(e);
  l.system_prompt_files = t, await ie(`/agents/${encodeURIComponent(e)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(l)
  });
}
async function Gt(e, t) {
  await ie("/skills/pool/download", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      skill_name: t,
      targets: [{ workspace_id: e }],
      overwrite: !1
    })
  });
}
async function Bn(e, t) {
  await ie(`/skills/${encodeURIComponent(t)}/enable`, {
    method: "POST",
    headers: { "X-Agent-Id": e }
  });
}
async function Ht(e, t) {
  await ie(`/skills/${encodeURIComponent(t)}`, {
    method: "DELETE",
    headers: { "X-Agent-Id": e }
  });
}
async function Za(e, t) {
  return ie("/skills/batch-enable", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify(t)
  });
}
async function el(e, t) {
  return ie("/skills/batch-disable", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify(t)
  });
}
async function tl(e, t) {
  return ie("/skills/batch-delete", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify(t)
  });
}
async function Wt(e) {
  return await ie("/mcp", {
    headers: { "X-Agent-Id": e }
  }) || [];
}
async function Un(e, t) {
  await ie(`/mcp/${encodeURIComponent(t)}`, {
    method: "DELETE",
    headers: { "X-Agent-Id": e }
  });
}
async function Nn(e, t) {
  return ie("/mcp", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify(t)
  });
}
async function nl(e, t) {
  return ie(
    `/mcp/toggle/${encodeURIComponent(t)}`,
    {
      method: "PATCH",
      headers: { "X-Agent-Id": e }
    }
  );
}
async function Dn(e, t) {
  await ie(`/skills/${encodeURIComponent(t)}/disable`, {
    method: "POST",
    headers: { "X-Agent-Id": e }
  });
}
async function al(e) {
  await ie(`/skills/pool/${encodeURIComponent(e)}`, {
    method: "DELETE"
  });
}
function ll(e) {
  const t = (e || "").trim();
  if (!t) return { number: 6, unit: "h" };
  const l = t.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/i);
  if (!l) return { number: 6, unit: "h" };
  const a = parseInt(l[1] || "0", 10), n = parseInt(l[2] || "0", 10), s = parseInt(l[3] || "0", 10), r = a * 60 + n + Math.round(s / 60);
  return r <= 0 ? { number: 6, unit: "h" } : r >= 60 && r % 60 === 0 ? { number: r / 60, unit: "h" } : { number: r, unit: "m" };
}
function sl(e) {
  return e.unit === "h" ? `${e.number}h` : `${e.number}m`;
}
async function ol(e) {
  return ie("/config/heartbeat", {
    headers: { "X-Agent-Id": e }
  });
}
async function rl(e, t) {
  return ie("/config/heartbeat", {
    method: "PUT",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify(t)
  });
}
async function il(e) {
  await ie("/config/heartbeat/run", {
    method: "POST",
    headers: { "X-Agent-Id": e }
  });
}
async function cl(e) {
  return ie("/workspace/running-config", {
    headers: { "X-Agent-Id": e }
  });
}
async function ml(e, t) {
  return ie("/workspace/running-config", {
    method: "PUT",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify(t)
  });
}
async function dl(e) {
  return (await ie("/workspace/language", {
    headers: { "X-Agent-Id": e }
  })).language || "zh";
}
async function ul(e, t) {
  await ie("/workspace/language", {
    method: "PUT",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify({ language: t })
  });
}
async function pl() {
  return (await ie("/config/user-timezone")).timezone || "UTC";
}
async function gl(e) {
  await ie("/config/user-timezone", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ timezone: e })
  });
}
async function fl(e) {
  return await ie("/workspace/system-prompt-files", {
    headers: { "X-Agent-Id": e }
  }) || [];
}
const wn = ["AGENTS.md", "SOUL.md", "PROFILE.md"];
function Cn({
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
function Fn({
  open: e,
  onClose: t,
  poolSkills: l,
  installedSkillNames: a,
  loading: n,
  onInstall: s
}) {
  const r = P().React, { useState: o, useEffect: d, useMemo: c } = r, { Modal: f, Button: w, Empty: S, Spin: v, Input: b, Tag: E, Tooltip: C, Typography: B } = P().antd, { CheckOutlined: U, SearchOutlined: N } = P().antdIcons || {}, { Text: te } = B, [G, W] = o([]), [T, x] = o("");
  d(() => {
    e && (W([]), x(""));
  }, [e]);
  const I = c(() => {
    if (!T.trim()) return l;
    const h = T.toLowerCase();
    return l.filter(
      (g) => {
        var L, J;
        return g.name.toLowerCase().includes(h) || ((L = g.description) == null ? void 0 : L.toLowerCase().includes(h)) || ((J = g.tags) == null ? void 0 : J.some((K) => K.toLowerCase().includes(h)));
      }
    );
  }, [l, T]), Y = I.filter(
    (h) => !a.includes(h.name)
  ), F = (h) => {
    W(
      (g) => g.includes(h) ? g.filter((L) => L !== h) : [...g, h]
    );
  }, O = async () => {
    G.length !== 0 && (await s(G), W([]));
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
          r.createElement(w, { onClick: t }, "取消"),
          r.createElement(
            w,
            {
              type: "primary",
              onClick: O,
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
      r.createElement(b, {
        placeholder: "搜索技能名称、描述或标签...",
        prefix: N ? r.createElement(N) : void 0,
        value: T,
        onChange: (h) => x(h.target.value),
        allowClear: !0,
        style: { flex: 1 }
      }),
      r.createElement(
        w,
        {
          size: "small",
          type: "primary",
          onClick: () => W(Y.map((h) => h.name))
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
      r.createElement(v, { size: "large" })
    ) : I.length === 0 ? r.createElement(S, {
      description: T ? "未找到匹配的技能" : "技能池暂无可用技能",
      image: S.PRESENTED_IMAGE_SIMPLE
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
      ...I.map((h) => {
        const g = G.includes(h.name), L = a.includes(h.name);
        return r.createElement(
          "div",
          {
            key: h.name,
            onClick: () => !L && F(h.name),
            style: {
              position: "relative",
              padding: "10px 12px",
              border: `1px solid ${g ? "#0072f5" : "#e8e8e8"}`,
              borderRadius: 6,
              cursor: L ? "not-allowed" : "pointer",
              transition: "all 0.15s ease",
              background: g ? "rgba(0, 114, 245, 0.06)" : L ? "#fafafa" : "#fff",
              opacity: L ? 0.5 : 1,
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
          L ? r.createElement(
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
                paddingRight: L || g ? 24 : 0
              }
            },
            r.createElement(
              "span",
              { style: { fontSize: 16 } },
              h.emoji || "⚡"
            ),
            r.createElement(
              C,
              { title: h.name },
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
                h.name
              )
            )
          ),
          h.description ? r.createElement(
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
          h.tags && h.tags.length > 0 ? r.createElement(
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
              (J, K) => r.createElement(
                E,
                {
                  key: K,
                  color: "cyan",
                  style: { fontSize: 10, marginRight: 0 }
                },
                J
              )
            )
          ) : null
        );
      })
    )
  );
}
function Gn({
  agentId: e,
  systemPromptFiles: t,
  onRefresh: l
}) {
  const a = P().React, { useState: n, useEffect: s, useCallback: r, useRef: o } = a, {
    List: d,
    Tag: c,
    Switch: f,
    Button: w,
    Modal: S,
    Input: v,
    Spin: b,
    Empty: E,
    message: C,
    Typography: B,
    Segmented: U,
    Alert: N
  } = P().antd, { FileTextOutlined: te, PlusOutlined: G, EditOutlined: W, ReloadOutlined: T } = P().antdIcons || {}, { Text: x } = B, [I, Y] = n([]), [F, O] = n(!0), [h, g] = n(
    t || []
  ), [L, J] = n(!1), [K, oe] = n(null), [z, p] = n(""), [u, M] = n(""), [ae, R] = n(!1), [q, se] = n("source"), X = o(0), Q = r(async () => {
    const _ = ++X.current;
    O(!0);
    try {
      const y = await Ka(e);
      _ === X.current && Y(y);
    } catch (y) {
      _ === X.current && (C.error(y.message || "加载工作区文档失败"), Y([]));
    } finally {
      _ === X.current && O(!1);
    }
  }, [e]);
  s(() => {
    Q();
  }, [Q]), s(() => {
    g(t || []);
  }, [t]);
  const me = async (_, y) => {
    const ne = new Set(h);
    if (y)
      ne.add(_);
    else {
      if (wn.includes(_) && _ === "AGENTS.md") {
        C.warning("AGENTS.md 是核心文件，不能停用");
        return;
      }
      ne.delete(_);
    }
    const de = Array.from(ne);
    g(de);
    try {
      await Qa(e, de), C.success(y ? "已启用记忆文件" : "已停用记忆文件"), l();
    } catch (fe) {
      C.error(fe.message || "更新失败"), g(t || []);
    }
  }, k = async (_) => {
    try {
      const y = await ie(
        `/workspace/files/${encodeURIComponent(_)}`,
        { headers: { "X-Agent-Id": e } }
      );
      oe(_), p(y.content || ""), se("source"), J(!0);
    } catch (y) {
      C.error(y.message || "读取文件失败");
    }
  }, Z = () => {
    oe(null), p(""), M(""), se("source"), J(!0);
  }, m = async () => {
    let _;
    try {
      _ = Ya(K || u);
    } catch (y) {
      C.warning(y.message || "文件名无效");
      return;
    }
    if (!z.trim()) {
      C.warning("Markdown 文档不能为空");
      return;
    }
    if (new TextEncoder().encode(z).length > 1024 * 1024) {
      C.warning("Markdown 文档不能超过 1 MB");
      return;
    }
    R(!0);
    try {
      if (K)
        await St(e, _, z);
      else {
        const y = await qa(
          e,
          _,
          z,
          !0
        );
        g(y.system_prompt_files);
      }
      C.success("保存成功"), J(!1), Q(), l();
    } catch (y) {
      const ne = y != null && y.message ? `：${y.message}` : "";
      C.error(
        K ? (y == null ? void 0 : y.message) || "保存失败" : `创建并挂载失败，服务端已回滚文件${ne}`
      );
    } finally {
      R(!1);
    }
  };
  return F ? a.createElement(
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
      a.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        te ? a.createElement(te, {
          style: { fontSize: 14, color: "#1677ff" }
        }) : null,
        a.createElement(
          x,
          { strong: !0 },
          `工作区文档 (${I.length})`
        ),
        a.createElement(
          x,
          { type: "secondary", style: { fontSize: 12 } },
          `· ${h.length} 个已挂载到系统提示`
        )
      ),
      a.createElement(
        "div",
        { style: { display: "flex", gap: 8 } },
        a.createElement(
          w,
          {
            size: "small",
            icon: T ? a.createElement(T) : void 0,
            onClick: Q
          },
          "刷新"
        ),
        a.createElement(
          w,
          {
            type: "primary",
            size: "small",
            icon: G ? a.createElement(G) : void 0,
            onClick: Z
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
      renderItem: (_) => {
        const y = h.includes(_.filename), ne = wn.includes(_.filename);
        return a.createElement(
          d.Item,
          {
            actions: [
              a.createElement(
                w,
                {
                  type: "link",
                  size: "small",
                  icon: W ? a.createElement(W) : void 0,
                  onClick: () => k(_.filename)
                },
                "编辑"
              )
            ]
          },
          a.createElement(d.Item.Meta, {
            avatar: a.createElement(te, {
              style: {
                fontSize: 20,
                color: y ? "#1677ff" : "#bfbfbf"
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
              a.createElement(x, null, _.filename),
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
              `${(_.size / 1024).toFixed(1)} KB · 修改于 ${new Date(_.modified_time).toLocaleString()}`
            )
          }),
          a.createElement(f, {
            checked: y,
            size: "small",
            onChange: (de) => me(_.filename, de)
          })
        );
      }
    }),
    // Edit/New file modal
    a.createElement(
      S,
      {
        open: L,
        onCancel: () => J(!1),
        title: K ? `编辑 ${K}` : "新建 Markdown 文档",
        width: 700,
        onOk: m,
        confirmLoading: ae,
        okText: "保存"
      },
      K ? null : a.createElement(
        "div",
        { style: { marginBottom: 12 } },
        a.createElement(v, {
          placeholder: "文件名（如：油藏工程记忆库.md）",
          value: u,
          onChange: (_) => M(_.target.value),
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
        a.createElement(U, {
          size: "small",
          value: q,
          options: [
            { label: "源码", value: "source" },
            { label: "预览", value: "preview" }
          ],
          onChange: (_) => se(_)
        }),
        a.createElement(
          x,
          { type: "secondary", style: { fontSize: 12 } },
          `${z.length} 字符 · 约 ${Math.ceil(z.length / 4)} tokens · ${K && h.includes(K) ? "已挂载" : K ? "未挂载" : "保存后自动挂载"}`
        )
      ),
      z.trim() ? null : a.createElement(N, {
        type: "warning",
        showIcon: !0,
        message: "文档内容为空，保存前需要填写 Markdown 内容",
        style: { marginBottom: 10 }
      }),
      q === "source" ? a.createElement(v.TextArea, {
        value: z,
        onChange: (_) => p(_.target.value),
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
        kt(z, a)
      )
    )
  );
}
function yl({
  skills: e,
  agentId: t
}) {
  const l = P().React, { useMemo: a } = l, {
    List: n,
    Tag: s,
    Typography: r,
    Empty: o,
    Button: d,
    message: c
  } = P().antd, { ThunderboltOutlined: f, CopyOutlined: w } = P().antdIcons || {}, { Text: S } = r, v = a(() => jn(e), [e]), b = (C) => {
    try {
      const B = P();
      B.setSelectedAgent && B.setSelectedAgent(t);
    } catch {
    }
    try {
      sessionStorage.setItem("ugsci_pending_prompt", C.value);
    } catch {
    }
    window.history.pushState({}, "", "/chat"), window.dispatchEvent(new PopStateEvent("popstate"));
  }, E = (C) => {
    var B;
    (B = navigator.clipboard) == null || B.writeText(C.value).then(() => {
      c.success("已复制到剪贴板");
    });
  };
  return v.length === 0 ? l.createElement(o, {
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
        S,
        { strong: !0 },
        `推荐提问 (${v.length})`
      ),
      l.createElement(
        S,
        { type: "secondary", style: { fontSize: 12 } },
        "· 从技能描述中自动提取"
      )
    ),
    l.createElement(n, {
      dataSource: v,
      renderItem: (C, B) => l.createElement(
        n.Item,
        {
          actions: [
            l.createElement(
              d,
              {
                type: "link",
                size: "small",
                icon: w ? l.createElement(w) : void 0,
                onClick: () => E(C)
              },
              "复制"
            )
          ]
        },
        l.createElement(n.Item.Meta, {
          avatar: l.createElement(
            s,
            { color: "blue", style: { borderRadius: "50%" } },
            `${B + 1}`
          ),
          title: l.createElement(
            "div",
            {
              style: {
                cursor: "pointer",
                color: "#1677ff"
              },
              onClick: () => b(C)
            },
            C.value
          ),
          description: l.createElement(
            S,
            { type: "secondary", style: { fontSize: 12 } },
            C.label
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
}, Hn = { marginBottom: 16 }, Wn = {
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
}, Jn = {
  fontSize: 12,
  color: "rgba(0,0,0,0.45)",
  marginLeft: 8
};
function El({ agentId: e }) {
  const t = P().React, { useState: l, useEffect: a, useCallback: n } = t, {
    Switch: s,
    InputNumber: r,
    Select: o,
    Button: d,
    Spin: c,
    Space: f,
    Typography: w,
    message: S
  } = P().antd, { PlayCircleOutlined: v, SaveOutlined: b } = P().antdIcons || {}, { Text: E } = w, [C, B] = l(!0), [U, N] = l(!1), [te, G] = l(!1), [W, T] = l(!1), [x, I] = l(6), [Y, F] = l("h"), [O, h] = l("main"), [g, L] = l(300), [J, K] = l(!1), [oe, z] = l("08:00"), [p, u] = l("22:00"), M = n(async () => {
    var Q, me;
    B(!0);
    try {
      const k = await ol(e), Z = ll(k.every ?? "6h");
      T(k.enabled ?? !1), I(Z.number), F(Z.unit), h(k.target ?? "main"), L(k.timeoutSeconds ?? 300), K(!!k.activeHours), z(((Q = k.activeHours) == null ? void 0 : Q.start) ?? "08:00"), u(((me = k.activeHours) == null ? void 0 : me.end) ?? "22:00");
    } catch (k) {
      S.error(k.message || "加载心跳配置失败");
    } finally {
      B(!1);
    }
  }, [e]);
  a(() => {
    M();
  }, [M]);
  const ae = async () => {
    N(!0);
    try {
      await rl(e, {
        enabled: W,
        every: sl({ number: x, unit: Y }),
        target: O,
        timeoutSeconds: g,
        activeHours: J && oe && p ? { start: oe, end: p } : void 0
      }), S.success("心跳配置已保存");
    } catch (Q) {
      S.error(Q.message || "保存心跳配置失败");
    } finally {
      N(!1);
    }
  }, R = async () => {
    G(!0);
    try {
      await il(e), S.success("已触发心跳检查");
    } catch (Q) {
      S.error(Q.message || "触发心跳失败");
    } finally {
      G(!1);
    }
  };
  if (C)
    return t.createElement(
      "div",
      { style: { textAlign: "center", padding: 40 } },
      t.createElement(c, { size: "large" })
    );
  const q = (Q, me, k) => t.createElement(
    "div",
    { style: Hn },
    t.createElement("div", { style: Ye }, Q),
    me,
    k ? t.createElement(
      E,
      { type: "secondary", style: Jn },
      k
    ) : null
  ), se = (Q, me, k, Z) => t.createElement(
    "div",
    { style: Wn },
    t.createElement(
      "div",
      null,
      t.createElement("div", { style: Ye }, Q),
      me
    ),
    t.createElement(
      "div",
      null,
      t.createElement("div", { style: Ye }, k),
      Z
    )
  ), { Divider: X } = P().antd;
  return t.createElement(
    "div",
    { style: { paddingBottom: 8 } },
    // ── Section: 基本设置 ──
    t.createElement("div", { style: Ue }, "基本设置"),
    q(
      "启用心跳",
      t.createElement(s, {
        checked: W,
        onChange: (Q) => T(Q)
      }),
      W ? "已启用，专家将定期自检" : "已停用"
    ),
    se(
      "检查频率",
      t.createElement(
        f,
        null,
        t.createElement(r, {
          min: 1,
          value: x,
          onChange: (Q) => I(Q ?? 1),
          style: { width: "100%" }
        }),
        t.createElement(o, {
          value: Y,
          onChange: (Q) => F(Q),
          style: { width: 90 },
          options: [
            { value: "m", label: "分钟" },
            { value: "h", label: "小时" }
          ]
        })
      ),
      "心跳目标",
      t.createElement(o, {
        value: O,
        onChange: (Q) => h(Q),
        style: { width: "100%" },
        options: [
          { value: "main", label: "主会话 (main)" },
          { value: "last", label: "最近会话 (last)" },
          { value: "inbox", label: "收件箱 (inbox)" }
        ]
      })
    ),
    q(
      "超时时间 (秒)",
      t.createElement(r, {
        min: 1,
        max: 3600,
        value: g,
        onChange: (Q) => L(Q ?? 300),
        style: { width: 200 }
      })
    ),
    // ── Section: 活跃时段 ──
    t.createElement(X, { style: { margin: "8px 0 16px" } }),
    t.createElement("div", { style: Ue }, "活跃时段"),
    q(
      "启用活跃时段限制",
      t.createElement(s, {
        checked: J,
        onChange: (Q) => K(Q)
      }),
      "仅在指定时段内触发心跳"
    ),
    J ? se(
      "开始时间",
      t.createElement("input", {
        type: "time",
        value: oe,
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
        value: p,
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
          icon: b ? t.createElement(b) : void 0,
          loading: U,
          onClick: ae,
          style: Oe
        },
        "保存配置"
      ),
      t.createElement(
        d,
        {
          icon: v ? t.createElement(v) : void 0,
          loading: te,
          onClick: R
        },
        "立即执行"
      )
    )
  );
}
function hl({
  agentId: e,
  onRefresh: t
}) {
  const l = P().React, { useState: a, useEffect: n, useCallback: s } = l, {
    List: r,
    Tag: o,
    Switch: d,
    Button: c,
    Empty: f,
    Spin: w,
    Typography: S,
    message: v
  } = P().antd, { PlusOutlined: b, ReloadOutlined: E, DeleteOutlined: C } = P().antdIcons || {}, { Text: B, Paragraph: U } = S, [N, te] = a([]), [G, W] = a(!0), [T, x] = a(!1), [I, Y] = a([]), [F, O] = a(!1), h = s(async () => {
    W(!0);
    try {
      const z = await Tt(e);
      te(z);
    } catch (z) {
      v.error(z.message || "加载技能失败"), te([]);
    } finally {
      W(!1);
    }
  }, [e]);
  n(() => {
    h();
  }, [h]);
  const g = async () => {
    x(!0), O(!0);
    try {
      const z = await Ft(!0);
      Y(z);
    } catch (z) {
      v.error(z.message || "加载技能池失败");
    } finally {
      O(!1);
    }
  }, L = async (z) => {
    let p = 0, u = 0;
    for (const M of z)
      try {
        await Gt(e, M), p++;
      } catch {
        u++;
      }
    p > 0 ? (v.success(
      `成功添加 ${p} 个技能${u > 0 ? `，${u} 个失败` : ""}`
    ), h(), t()) : u > 0 && v.error("添加技能失败"), x(!1);
  }, J = async (z, p) => {
    try {
      p ? await Bn(e, z.name) : await Dn(e, z.name), v.success(p ? "已启用" : "已停用"), h(), t();
    } catch (u) {
      v.error(u.message || "操作失败");
    }
  }, K = async (z) => {
    try {
      await Ht(e, z), v.success(`技能「${z}」已移除`), h(), t();
    } catch (p) {
      v.error(p.message || "移除技能失败");
    }
  };
  if (G)
    return l.createElement(
      "div",
      { style: { textAlign: "center", padding: 40 } },
      l.createElement(w, { size: "large" })
    );
  const oe = N.filter((z) => z.enabled !== !1);
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
        B,
        { strong: !0 },
        `技能列表 (${N.length}，已启用 ${oe.length})`
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
              et(), h();
            }
          },
          "刷新"
        ),
        l.createElement(
          c,
          {
            type: "primary",
            size: "small",
            icon: b ? l.createElement(b) : void 0,
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
      renderItem: (z) => l.createElement(
        r.Item,
        {
          actions: [
            l.createElement(d, {
              key: "toggle",
              size: "small",
              checked: z.enabled !== !1,
              onChange: (p) => J(z, p)
            }),
            l.createElement(
              c,
              {
                key: "del",
                type: "link",
                size: "small",
                danger: !0,
                icon: C ? l.createElement(C) : void 0,
                onClick: () => K(z.name)
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
            l.createElement(B, { strong: !0 }, z.name),
            z.version_text ? l.createElement(
              o,
              { style: { fontSize: 10 } },
              `v${z.version_text}`
            ) : null
          ),
          z.description ? l.createElement(
            U,
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
    l.createElement(Fn, {
      open: T,
      onClose: () => x(!1),
      poolSkills: I,
      installedSkillNames: N.map((z) => z.name),
      loading: F,
      onInstall: L
    })
  );
}
function vl({
  agentId: e,
  onRefresh: t,
  isActive: l
}) {
  const a = P().React, { useState: n, useEffect: s, useCallback: r } = a, {
    List: o,
    Tag: d,
    Button: c,
    Empty: f,
    Spin: w,
    Modal: S,
    Input: v,
    Typography: b,
    message: E
  } = P().antd, { PlusOutlined: C, ReloadOutlined: B, DeleteOutlined: U } = P().antdIcons || {}, { Text: N, Paragraph: te } = b, { TextArea: G } = v, [W, T] = n([]), [x, I] = n(!0), [Y, F] = n(!1), [O, h] = n(`{
  "mcpServers": {
    "example-client": {
      "command": "npx",
      "args": ["-y", "@example/mcp-server"],
      "env": {}
    }
  }
}`), [g, L] = n(!1), J = r(async () => {
    I(!0);
    try {
      const p = await Wt(e);
      T(p);
    } catch (p) {
      E.error(p.message || "加载 MCP 失败"), T([]);
    } finally {
      I(!1);
    }
  }, [e]);
  s(() => {
    J();
  }, [J]), s(() => {
    l && J();
  }, [l, J]);
  const K = async (p) => {
    try {
      await nl(e, p), E.success("已切换 MCP 状态"), J(), t();
    } catch (u) {
      E.error(u.message || "切换失败");
    }
  }, oe = async (p) => {
    try {
      await Un(e, p), E.success(`MCP「${p}」已移除`), J(), t();
    } catch (u) {
      E.error(u.message || "移除 MCP 失败");
    }
  }, z = async () => {
    L(!0);
    try {
      const p = JSON.parse(O), u = p.mcpServers || p, M = Object.entries(u);
      if (M.length === 0) {
        E.warning("未找到 MCP 客户端配置");
        return;
      }
      for (const [ae, R] of M) {
        const q = R, se = q.url ? "streamable_http" : "stdio";
        await Nn(e, {
          client_key: ae,
          client: {
            name: q.name || ae,
            description: q.description || "",
            enabled: !0,
            transport: se,
            url: q.url || "",
            command: q.command || "",
            args: q.args || [],
            env: q.env || {},
            cwd: q.cwd || "",
            headers: q.headers || {}
          }
        });
      }
      E.success("MCP 客户端已创建"), F(!1), J(), t();
    } catch (p) {
      p instanceof SyntaxError ? E.error("JSON 格式错误：" + p.message) : E.error(p.message || "创建 MCP 失败");
    } finally {
      L(!1);
    }
  };
  return x ? a.createElement(
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
            icon: B ? a.createElement(B) : void 0,
            onClick: () => {
              et(), J();
            }
          },
          "刷新"
        ),
        a.createElement(
          c,
          {
            type: "primary",
            size: "small",
            icon: C ? a.createElement(C) : void 0,
            onClick: () => F(!0),
            style: Oe
          },
          "添加 MCP"
        )
      )
    ),
    W.length === 0 ? a.createElement(f, {
      description: "该专家暂无 MCP 客户端",
      image: f.PRESENTED_IMAGE_SIMPLE
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
                onClick: () => K(p.key)
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
                onClick: () => oe(p.key)
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
      S,
      {
        open: Y,
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
      a.createElement(G, {
        value: O,
        onChange: (p) => h(p.target.value),
        rows: 12,
        style: { fontFamily: "monospace", fontSize: 12 }
      })
    )
  );
}
function bl({ agentId: e }) {
  const t = P().React, { useState: l, useEffect: a, useCallback: n, useRef: s } = t, {
    Card: r,
    InputNumber: o,
    Input: d,
    Select: c,
    Switch: f,
    Button: w,
    Spin: S,
    Space: v,
    Typography: b,
    Divider: E,
    message: C
  } = P().antd, { SaveOutlined: B } = P().antdIcons || {}, { Text: U } = b, [N, te] = l(!0), [G, W] = l(!1), T = s(null), [x, I] = l(60), [Y, F] = l(""), [O, h] = l(!0), [g, L] = l(30), [J, K] = l("zh"), [oe, z] = l("UTC"), [p, u] = l(!0), [M, ae] = l(100), [R, q] = l(!0), [se, X] = l(3), [Q, me] = l(1), [k, Z] = l(!0), [m, _] = l(3), [y, ne] = l(2), [de, fe] = l(60), [Ee, pe] = l(1), [le, D] = l(0), [A, V] = l(1), [re, H] = l(0), [ue, ve] = l(30), [we, xe] = l(50), [ze, Ae] = l("light"), [He, tt] = l("scroll"), [nt, $e] = l("remelight"), [at, dt] = l("AUTO"), We = n(async () => {
    var ee, Ce, Se, Te, Je, lt;
    te(!0);
    try {
      const [he, It, ut] = await Promise.all([
        cl(e),
        dl(e).catch(() => "zh"),
        pl().catch(() => "UTC")
      ]);
      T.current = he, I(he.shell_command_timeout ?? 60), F(he.shell_command_executable ?? "");
      const st = he.auto_title_config ?? { enabled: !0, timeout_seconds: 30 };
      h(st.enabled ?? !0), L(st.timeout_seconds ?? 30), K(It), z(ut);
      const Pe = he.loop ?? {};
      u(((ee = Pe.iteration) == null ? void 0 : ee.enabled) ?? !0), ae(((Ce = Pe.iteration) == null ? void 0 : Ce.max_iterations) ?? he.max_iters ?? 100), q(((Se = Pe.doom_loop) == null ? void 0 : Se.enabled) ?? !0), X(((Te = Pe.doom_loop) == null ? void 0 : Te.window_size) ?? 3), me(((Je = Pe.doom_loop) == null ? void 0 : Je.similarity_threshold) ?? 1), Z(he.llm_retry_enabled ?? !0), _(he.llm_max_retries ?? 3), ne(he.llm_backoff_base ?? 2), fe(he.llm_backoff_cap ?? 60), pe(he.llm_max_concurrent ?? 1), D(he.llm_max_qpm ?? 0), V(he.llm_rate_limit_pause ?? 1), H(he.llm_rate_limit_jitter ?? 0), ve(he.llm_acquire_timeout ?? 30), xe(he.history_max_length ?? 50), Ae(he.context_manager_backend ?? "light"), tt(((lt = he.light_context_config) == null ? void 0 : lt.strategy) ?? "scroll"), $e(he.memory_manager_backend ?? "remelight"), dt(he.approval_level ?? "AUTO");
    } catch (he) {
      C.error(he.message || "加载运行配置失败");
    } finally {
      te(!1);
    }
  }, [e]);
  a(() => {
    We();
  }, [We]);
  const _e = async () => {
    var Ce, Se;
    const ee = T.current;
    if (ee) {
      W(!0);
      try {
        const Te = {
          ...ee,
          max_iters: M,
          loop: {
            ...ee.loop ?? {},
            iteration: { enabled: p, max_iterations: M },
            doom_loop: {
              enabled: R,
              window_size: se,
              similarity_threshold: Q,
              stages: ((Se = (Ce = ee.loop) == null ? void 0 : Ce.doom_loop) == null ? void 0 : Se.stages) ?? []
            }
          },
          shell_command_timeout: x,
          shell_command_executable: Y,
          auto_title_config: {
            enabled: O,
            timeout_seconds: g
          },
          llm_retry_enabled: k,
          llm_max_retries: m,
          llm_backoff_base: y,
          llm_backoff_cap: de,
          llm_max_concurrent: Ee,
          llm_max_qpm: le,
          llm_rate_limit_pause: A,
          llm_rate_limit_jitter: re,
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
        await ml(e, Te), T.current = Te, J && await ul(e, J).catch(() => {
        }), oe && await gl(oe).catch(() => {
        }), C.success("运行配置已保存");
      } catch (Te) {
        C.error(Te.message || "保存运行配置失败");
      } finally {
        W(!1);
      }
    }
  };
  if (N)
    return t.createElement(
      "div",
      { style: { textAlign: "center", padding: 40 } },
      t.createElement(S, { size: "large" })
    );
  const Ie = (ee, Ce, Se) => t.createElement(
    "div",
    { style: Hn },
    t.createElement("div", { style: Ye }, ee),
    Ce,
    Se ? t.createElement(
      U,
      { type: "secondary", style: Jn },
      Se
    ) : null
  ), ke = (ee, Ce, Se, Te) => t.createElement(
    "div",
    { style: Wn },
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
        value: x,
        onChange: (ee) => I(ee ?? 60),
        style: { width: "100%" }
      }),
      "Shell 可执行文件",
      t.createElement(d, {
        value: Y,
        onChange: (ee) => F(ee.target.value),
        placeholder: "留空使用系统默认",
        style: { width: "100%" }
      })
    ),
    ke(
      "语言",
      t.createElement(c, {
        value: J,
        onChange: (ee) => K(ee),
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
        value: oe,
        onChange: (ee) => z(ee),
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
      t.createElement(v, null, t.createElement(f, {
        checked: O,
        onChange: (ee) => h(ee)
      })),
      "标题生成超时 (秒)",
      t.createElement(o, {
        min: 5,
        value: g,
        onChange: (ee) => L(ee ?? 30),
        style: { width: "100%" },
        disabled: !O
      })
    ),
    // ── Section: 审批级别 ──
    t.createElement(E, { style: { margin: "8px 0 16px" } }),
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
    t.createElement(E, { style: { margin: "8px 0 16px" } }),
    t.createElement("div", { style: Ue }, "迭代与循环"),
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
        value: M,
        onChange: (ee) => ae(ee ?? 100),
        style: { width: "100%" }
      })
    ) : null,
    Ie(
      "启用重复循环保护",
      t.createElement(f, {
        checked: R,
        onChange: (ee) => q(ee)
      }),
      "检测并阻止重复操作循环"
    ),
    R ? ke(
      "检测窗口大小",
      t.createElement(o, {
        min: 2,
        max: 20,
        value: se,
        onChange: (ee) => X(ee ?? 3),
        style: { width: "100%" }
      }),
      "相似度阈值",
      t.createElement(o, {
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
    Ie(
      "启用 LLM 重试",
      t.createElement(f, {
        checked: k,
        onChange: (ee) => Z(ee)
      })
    ),
    ke(
      "最大重试次数",
      t.createElement(o, {
        min: 1,
        value: m,
        onChange: (ee) => _(ee ?? 3),
        style: { width: "100%" },
        disabled: !k
      }),
      "退避基数 (秒)",
      t.createElement(o, {
        min: 0.1,
        step: 0.1,
        value: y,
        onChange: (ee) => ne(ee ?? 2),
        style: { width: "100%" },
        disabled: !k
      })
    ),
    Ie(
      "退避上限 (秒)",
      t.createElement(o, {
        min: 0.5,
        step: 0.5,
        value: de,
        onChange: (ee) => fe(ee ?? 60),
        style: { width: 200 },
        disabled: !k
      })
    ),
    // ── Section: LLM 限流 ──
    t.createElement(E, { style: { margin: "8px 0 16px" } }),
    t.createElement("div", { style: Ue }, "LLM 限流"),
    ke(
      "最大并发数",
      t.createElement(o, {
        min: 1,
        value: Ee,
        onChange: (ee) => pe(ee ?? 1),
        style: { width: "100%" }
      }),
      "最大 QPM (0=不限)",
      t.createElement(o, {
        min: 0,
        step: 10,
        value: le,
        onChange: (ee) => D(ee ?? 0),
        style: { width: "100%" }
      })
    ),
    ke(
      "限流暂停时间 (秒)",
      t.createElement(o, {
        min: 1,
        step: 0.5,
        value: A,
        onChange: (ee) => V(ee ?? 1),
        style: { width: "100%" }
      }),
      "限流抖动 (秒)",
      t.createElement(o, {
        min: 0,
        step: 0.5,
        value: re,
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
    t.createElement(E, { style: { margin: "8px 0 16px" } }),
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
          icon: B ? t.createElement(B) : void 0,
          loading: G,
          onClick: _e,
          style: Oe
        },
        "保存运行配置"
      )
    )
  );
}
function Sl({
  expert: e,
  open: t,
  onClose: l,
  onRefresh: a
}) {
  const n = P().React, { useState: s, useEffect: r, useCallback: o } = n, { Modal: d, Tabs: c, Spin: f, Typography: w } = P().antd, { SettingOutlined: S } = P().antdIcons || {}, { Text: v } = w, [b, E] = s([]), [C, B] = s(!1), [U, N] = s("heartbeat"), te = o(async () => {
    if (e) {
      B(!0);
      try {
        const x = await fl(e.agent.id);
        E(x);
      } catch {
        E([]);
      } finally {
        B(!1);
      }
    }
  }, [e]);
  if (r(() => {
    t && e && te();
  }, [t, e, te]), !e) return null;
  const { agent: G } = e, W = () => {
    te(), a();
  }, T = [
    {
      key: "heartbeat",
      label: "心跳",
      children: n.createElement(El, {
        agentId: G.id
      })
    },
    {
      key: "files",
      label: "文件",
      children: C ? n.createElement(
        "div",
        { style: { textAlign: "center", padding: 40 } },
        n.createElement(f, { size: "large" })
      ) : n.createElement(Gn, {
        agentId: G.id,
        systemPromptFiles: b,
        onRefresh: W
      })
    },
    {
      key: "skills",
      label: `技能 (${e.skills.filter((x) => x.enabled !== !1).length})`,
      children: n.createElement(hl, {
        agentId: G.id,
        onRefresh: a
      })
    },
    {
      key: "mcp",
      label: `MCP (${e.mcps.length})`,
      children: n.createElement(vl, {
        agentId: G.id,
        onRefresh: a,
        isActive: U === "mcp"
      })
    },
    {
      key: "running",
      label: "运行配置",
      children: n.createElement(bl, {
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
        S ? n.createElement(S, { style: { fontSize: 18 } }) : null,
        n.createElement("span", null, `配置 - ${G.name}`),
        n.createElement(
          v,
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
      items: T,
      activeKey: U,
      onChange: (x) => N(x),
      size: "small",
      tabBarStyle: { marginBottom: 16 }
    })
  );
}
const wl = [
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
], Cl = wl;
function xn(e) {
  return Ne(`/ugsci/avatar/${encodeURIComponent(e)}`);
}
function kn(e) {
  const t = e.map(encodeURIComponent).join(",");
  return Ne(`/ugsci/avatar/team/${t}`);
}
function Le({
  name: e,
  size: t = 32,
  borderRadius: l = "50%"
}) {
  const a = P().React, [n, s] = a.useState(0), r = n === 0 ? xn(e) : `${xn(e)}?_r=${n}`;
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
function Jt({
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
  const r = e.slice(0, 5), o = n === 0 ? kn(r) : `${kn(r)}?_r=${n}`;
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
function xl({
  expert: e,
  onClick: t,
  onSummon: l,
  onConfigure: a
}) {
  const n = P().React, { Card: s, Tag: r, Badge: o, Typography: d, Spin: c, Button: f, Tooltip: w } = P().antd, { Text: S } = d, { ThunderboltOutlined: v, SettingOutlined: b } = P().antdIcons || {}, { agent: E, skills: C, mcps: B, loading: U } = e, N = E.enabled, te = C.filter((T) => T.enabled !== !1).map((T) => T.name), G = B.map((T) => T.name || T.key), W = E.active_model ? `${E.active_model.provider_id}/${E.active_model.model}` : null;
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
        n.createElement(Le, { name: E.name, size: 36 }),
        n.createElement(
          "div",
          null,
          n.createElement(
            S,
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
      n.createElement(o, {
        status: N ? "success" : "default",
        text: N ? "启用" : "停用"
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
      kt(E.description, n)
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
      n.createElement(Cn, {
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
      n.createElement(Cn, {
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
          f,
          {
            type: "text",
            size: "small",
            icon: b ? n.createElement(b, {
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
          icon: v ? n.createElement(v) : void 0,
          disabled: !N,
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
function kl({
  expert: e,
  open: t,
  onClose: l,
  onRefresh: a
}) {
  const n = P().React, {
    Drawer: s,
    Descriptions: r,
    Tag: o,
    Typography: d,
    Space: c,
    Button: f,
    Empty: w,
    Tabs: S,
    List: v,
    Spin: b,
    Modal: E,
    message: C
  } = P().antd, { Text: B, Paragraph: U } = d, {
    EditOutlined: N,
    ThunderboltOutlined: te,
    FileTextOutlined: G,
    ToolOutlined: W,
    PlusOutlined: T
  } = P().antdIcons || {}, [x, I] = n.useState(!1), [Y, F] = n.useState(
    []
  ), [O, h] = n.useState(!1);
  if (!e) return null;
  const { agent: g, config: L, skills: J, mcps: K, loading: oe } = e, z = J.filter((k) => k.enabled !== !1), p = (k) => {
    window.history.pushState({}, "", k), window.dispatchEvent(new PopStateEvent("popstate"));
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
        g.description ? kt(g.description, n) : "暂无描述"
      ),
      n.createElement(
        r.Item,
        { label: "使用模型" },
        g.active_model ? `${g.active_model.provider_id} / ${g.active_model.model}` : "使用全局默认模型"
      ),
      L != null && L.workspace_dir ? n.createElement(
        r.Item,
        { label: "工作区路径" },
        n.createElement(
          "code",
          { style: { fontSize: 11 } },
          L.workspace_dir
        )
      ) : null,
      L != null && L.approval_level ? n.createElement(
        r.Item,
        { label: "审批级别" },
        L.approval_level
      ) : null
    ),
    // System prompt files
    L != null && L.system_prompt_files && L.system_prompt_files.length > 0 ? n.createElement(
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
        n.createElement(B, { strong: !0 }, "系统提示词文件")
      ),
      n.createElement(
        c,
        { wrap: !0 },
        ...L.system_prompt_files.map(
          (k, Z) => n.createElement(
            o,
            {
              key: Z,
              icon: G ? n.createElement(G) : void 0,
              style: { fontSize: 12 }
            },
            k
          )
        )
      )
    ) : null
  ), M = async () => {
    I(!0), h(!0);
    try {
      const k = await Ft(!0);
      F(k);
    } catch (k) {
      C.error(k.message || "加载技能池失败");
    } finally {
      h(!1);
    }
  }, ae = async (k) => {
    let Z = 0, m = 0;
    for (const _ of k)
      try {
        await Gt(g.id, _), Z++;
      } catch {
        m++;
      }
    Z > 0 ? (C.success(
      `成功添加 ${Z} 个技能${m > 0 ? `，${m} 个失败` : ""}`
    ), a()) : m > 0 && C.error("添加技能失败"), I(!1);
  }, R = async (k) => {
    try {
      await Ht(g.id, k), C.success(`技能「${k}」已移除`), a();
    } catch (Z) {
      C.error(Z.message || "移除技能失败");
    }
  }, q = async (k) => {
    try {
      await Un(g.id, k), C.success(`MCP「${k}」已移除`), a();
    } catch (Z) {
      C.error(Z.message || "移除 MCP 失败");
    }
  }, se = oe ? n.createElement(
    "div",
    { style: { textAlign: "center", padding: 40 } },
    n.createElement(b, { size: "large" })
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
        B,
        { strong: !0 },
        `已启用技能 (${z.length})`
      ),
      n.createElement(
        f,
        {
          type: "primary",
          size: "small",
          icon: T ? n.createElement(T) : void 0,
          onClick: M
        },
        "从技能池添加"
      )
    ),
    z.length === 0 ? n.createElement(w, {
      description: "该专家暂无已启用的技能",
      image: w.PRESENTED_IMAGE_SIMPLE
    }) : n.createElement(v, {
      dataSource: z,
      renderItem: (k) => n.createElement(
        v.Item,
        {
          actions: [
            n.createElement(
              f,
              {
                type: "link",
                size: "small",
                danger: !0,
                onClick: () => R(k.name)
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
            k.emoji ? n.createElement(
              "span",
              { style: { fontSize: 16 } },
              k.emoji
            ) : null,
            n.createElement(B, { strong: !0 }, k.name),
            k.version_text ? n.createElement(
              o,
              { style: { fontSize: 10 } },
              `v${k.version_text}`
            ) : null
          ),
          k.description ? n.createElement(
            U,
            {
              type: "secondary",
              style: { fontSize: 12, margin: 0 },
              ellipsis: { rows: 2 }
            },
            k.description
          ) : null,
          k.tags && k.tags.length > 0 ? n.createElement(
            "div",
            { style: { marginTop: 4 } },
            ...k.tags.map(
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
    n.createElement(Fn, {
      open: x,
      onClose: () => I(!1),
      poolSkills: Y,
      installedSkillNames: z.map((k) => k.name),
      loading: O,
      onInstall: ae
    })
  ), X = oe ? n.createElement(
    "div",
    { style: { textAlign: "center", padding: 40 } },
    n.createElement(b, { size: "large" })
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
        B,
        { strong: !0 },
        `MCP 客户端 (${K.length})`
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
    K.length === 0 ? n.createElement(w, {
      description: "该专家暂无关联的 MCP 客户端，点击「配置 MCP」添加",
      image: w.PRESENTED_IMAGE_SIMPLE
    }) : n.createElement(v, {
      dataSource: K,
      renderItem: (k) => n.createElement(
        v.Item,
        {
          actions: [
            n.createElement(
              f,
              {
                type: "link",
                size: "small",
                danger: !0,
                onClick: () => q(k.key)
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
              B,
              { strong: !0 },
              k.name || k.key
            ),
            n.createElement(
              o,
              {
                color: k.enabled ? "green" : "default",
                style: { fontSize: 10 }
              },
              k.enabled ? "启用" : "停用"
            ),
            n.createElement(
              o,
              { color: "purple", style: { fontSize: 10 } },
              k.transport
            )
          ),
          k.description ? n.createElement(
            U,
            {
              type: "secondary",
              style: { fontSize: 12, margin: 0 },
              ellipsis: { rows: 2 }
            },
            k.description
          ) : null,
          k.tools && k.tools.length > 0 ? n.createElement(
            "div",
            {
              style: {
                marginTop: 4,
                fontSize: 11,
                color: "#8c8c8c"
              }
            },
            `提供 ${k.tools.length} 个工具`
          ) : null
        )
      )
    })
  ), Q = L != null && L.tools ? n.createElement(
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
        n.createElement(B, { strong: !0 }, "工具配置")
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
        JSON.stringify(L.tools, null, 2)
      )
    )
  ) : n.createElement(w, {
    description: "暂无工具配置",
    image: w.PRESENTED_IMAGE_SIMPLE
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
      children: n.createElement(yl, {
        skills: z,
        agentId: g.id
      })
    },
    {
      key: "knowledge",
      label: "专家记忆",
      children: n.createElement(Gn, {
        agentId: g.id,
        systemPromptFiles: (L == null ? void 0 : L.system_prompt_files) || [],
        onRefresh: () => a()
      })
    },
    { key: "mcp", label: `MCP (${K.length})`, children: X },
    { key: "tools", label: "工具配置", children: Q }
  ];
  return n.createElement(
    s,
    {
      title: n.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 8 } },
        n.createElement(Le, { name: g.name, size: 28 }),
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
                const k = P();
                k.setSelectedAgent && k.setSelectedAgent(g.id);
              } catch (k) {
                console.warn("[ugsci] Failed to set selected agent:", k);
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
                const k = P();
                k.setSelectedAgent && k.setSelectedAgent(g.id);
              } catch (k) {
                console.warn("[ugsci] Failed to set selected agent:", k);
              }
              setTimeout(() => p("/chat"), 0);
            }
          },
          "开始对话"
        )
      )
    },
    n.createElement(S, {
      items: me,
      defaultActiveKey: "basic"
    })
  );
}
function _l({
  open: e,
  onClose: t,
  onCreated: l
}) {
  const a = P().React, { useState: n } = a, {
    Modal: s,
    Card: r,
    Tag: o,
    Input: d,
    Row: c,
    Col: f,
    Spin: w,
    message: S,
    Typography: v
  } = P().antd, { Text: b } = v, { FileAddOutlined: E } = P().antdIcons || {}, [C, B] = n(!1), [U, N] = n(""), [te, G] = n(!1), W = async (I, Y) => {
    B(!0);
    try {
      const F = await ie("/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: I || "新专家",
          description: Y || "",
          skill_names: []
        })
      });
      await St(
        F.id,
        "AGENTS.md",
        `# ${I || "新专家"}

请在此处编写该专家的系统提示词。
`
      ), S.success("专家「" + (I || "新专家") + "」创建成功"), G(!1), setTimeout(() => {
        t(), l();
      }, 0);
    } catch (F) {
      S.error(F.message || "创建专家失败");
    } finally {
      B(!1);
    }
  }, T = Cl.filter((I) => {
    if (!U.trim()) return !0;
    const Y = U.toLowerCase();
    return I.name.toLowerCase().includes(Y) || I.description.toLowerCase().includes(Y) || I.category.toLowerCase().includes(Y);
  }), x = async (I) => {
    B(!0);
    try {
      const Y = await ie("/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: I.name,
          description: I.description,
          skill_names: I.recommended_skills
        })
      });
      await St(Y.id, "AGENTS.md", I.system_prompt);
      const F = await Dt(Y.id);
      F.approval_level = I.approval_level, await ie(`/agents/${encodeURIComponent(Y.id)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(F)
      }), S.success(`专家「${I.name}」创建成功`), t(), l();
    } catch (Y) {
      S.error(Y.message || "创建专家失败");
    } finally {
      B(!1);
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
          onChange: (I) => N(I.target.value),
          allowClear: !0
        })
      ),
      C ? a.createElement(
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
                E ? a.createElement(E) : "📝"
              ),
              a.createElement(
                "div",
                { style: { flex: 1 } },
                a.createElement(
                  b,
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
        ...T.map(
          (I) => a.createElement(
            f,
            { key: I.id, xs: 24, sm: 12 },
            a.createElement(
              r,
              {
                hoverable: !0,
                size: "small",
                onClick: () => x(I),
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
                  name: I.name,
                  size: 40
                }),
                a.createElement(
                  "div",
                  { style: { flex: 1 } },
                  a.createElement(
                    b,
                    { strong: !0, style: { fontSize: 15 } },
                    I.name
                  ),
                  a.createElement(
                    "div",
                    null,
                    a.createElement(
                      o,
                      { color: "blue", style: { fontSize: 10 } },
                      I.category
                    ),
                    I.approval_level === "MANUAL" ? a.createElement(
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
                kt(I.description, a)
              )
            )
          )
        )
      )
    ),
    // ── Blank template creation modal (sibling, not nested inside Modal) ──
    a.createElement(Tl, {
      open: te,
      onCancel: () => G(!1),
      onCreate: W
    })
  );
}
function Tl({
  open: e,
  onCancel: t,
  onCreate: l
}) {
  const a = P().React, { useState: n, useEffect: s } = a, { Modal: r, Input: o, message: d } = P().antd, [c, f] = n(""), [w, S] = n(""), [v, b] = n(!1);
  return s(() => {
    e && (f(""), S(""), b(!1));
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
        b(!0), Promise.resolve(l(c.trim(), w.trim())).finally(() => {
          b(!1);
        });
      },
      okText: "创建",
      cancelText: "取消",
      okButtonProps: { loading: v },
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
      a.createElement(o.TextArea, {
        placeholder: "简要描述该专家的职责和能力...",
        value: w,
        onChange: (E) => S(E.target.value),
        rows: 3,
        maxLength: 200
      })
    )
  );
}
const Xn = "ugsci_custom_teams";
function zl(e) {
  if (!e || typeof e != "object") return !1;
  const t = e;
  return typeof t.id == "string" && typeof t.name == "string" && typeof t.taskTemplate == "string" && typeof t.orchestrationPrompt == "string" && Array.isArray(t.members);
}
function ht() {
  try {
    const e = JSON.parse(
      localStorage.getItem(Xn) || "[]"
    );
    return Array.isArray(e) ? e.filter(zl) : [];
  } catch {
    return [];
  }
}
function Kn(e) {
  try {
    localStorage.setItem(Xn, JSON.stringify(e));
  } catch {
  }
}
async function Il(e) {
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
        for (const f of c.split(`
`)) {
          if (!f.startsWith("data: ")) continue;
          const w = f.slice(6);
          let S;
          try {
            S = JSON.parse(w);
          } catch {
            continue;
          }
          if (S.error) {
            const v = S.error, b = typeof v == "string" ? v : (v == null ? void 0 : v.message) || "工作流启动失败";
            throw new Error(b);
          }
          if (S.object === "response" || S.type === "response") {
            const v = S.status;
            if (v === "failed" || v === "error") {
              const b = ((s = S.error) == null ? void 0 : s.message) || "工作流启动失败";
              throw new Error(b);
            }
            return;
          }
          if (S.object === "content" || S.type === "message")
            return;
        }
      }
    }
  } finally {
    t.releaseLock();
  }
}
async function Ol(e, t, l) {
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
  return await Il(o), r;
}
async function Al(e) {
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
function wt(e, t) {
  var n;
  const l = t.replace(/\s+/g, ""), a = e.find(
    (s) => s.name === t || s.name.replace(/\s+/g, "") === l
  );
  return a ? a.id : ((n = e.find(
    (s) => s.name.includes(t) || t.includes(s.name) || s.name.replace(/\s+/g, "").includes(l)
  )) == null ? void 0 : n.id) || null;
}
function Xt() {
  var t;
  const e = (t = window.QwenPaw) == null ? void 0 : t.host;
  if (!e) throw new Error("[ugsci] QwenPaw.host not available");
  return e;
}
function Pl(e) {
  const t = Xt().getApiToken() || "";
  return {
    "Content-Type": "application/json",
    ...t ? { Authorization: `Bearer ${t}` } : {},
    ...e ? { "X-Agent-Id": e } : {}
  };
}
async function qn(e, t, l) {
  try {
    const a = await fetch(Xt().getApiUrl(e), {
      headers: Pl(t),
      signal: l
    });
    return a.ok ? await a.json() : null;
  } catch {
    return null;
  }
}
function $l(e, t) {
  return qn("/ugsci/team/state", e, t);
}
async function Ml() {
  const e = await qn(
    "/ugsci/team/preset-teams"
  );
  return (e == null ? void 0 : e.teams) ?? null;
}
const Rl = {
  plan: { label: "规划", color: "#1677ff", icon: "📋" },
  dispatch: { label: "分派", color: "#13c2c2", icon: "🚀" },
  verify: { label: "验证", color: "#fa8c16", icon: "🔍" },
  synthesize: { label: "综合", color: "#722ed1", icon: "📊" },
  completed: { label: "完成", color: "#52c41a", icon: "✅" }
}, _n = [
  "plan",
  "dispatch",
  "verify",
  "synthesize",
  "completed"
], Ll = 3;
function jl() {
  const e = Xt(), t = e.React, { useState: l, useEffect: a, useCallback: n, useRef: s } = t, { Card: r, Tag: o, Typography: d, Button: c, Steps: f, Empty: w, Alert: S } = e.antd, { ReloadOutlined: v } = e.antdIcons || {}, { Text: b, Paragraph: E } = d, C = e.useSelectedAgent ? e.useSelectedAgent() : { id: "default" }, B = (C == null ? void 0 : C.id) || "default", [U, N] = l(null), [te, G] = l(!1), W = s(null), T = s(0), x = s(0), I = s(null), Y = n(
    async (u) => {
      var q;
      (q = I.current) == null || q.abort();
      const M = new AbortController();
      I.current = M;
      const ae = ++x.current;
      u && G(!0);
      const R = await $l(B, M.signal);
      M.signal.aborted || ae !== x.current || (R ? (T.current = 0, W.current = R, N(R)) : T.current += 1, G(!1));
    },
    [B]
  ), F = n(() => Y(!0), [Y]);
  if (a(() => {
    var M;
    (M = I.current) == null || M.abort(), x.current += 1, T.current = 0, W.current = null, N(null), F();
    const u = window.setInterval(() => {
      var ae, R;
      T.current >= Ll || ((ae = W.current) == null ? void 0 : ae.status) === "completed" || ((R = W.current) == null ? void 0 : R.status) === "terminated" || Y(!1);
    }, 5e3);
    return () => {
      var ae;
      window.clearInterval(u), (ae = I.current) == null || ae.abort(), x.current += 1;
    };
  }, [B, Y, F]), (U == null ? void 0 : U.status) === "unreadable")
    return t.createElement(S, {
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
      return t.createElement(S, {
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
  const O = U.state, h = O.current_phase || "plan", g = _n.indexOf(h), L = O.team_name || "未知团队", J = O.team_mode || "pipeline", K = O.iteration || 0, oe = O.members || [], z = O.verify_retries || 0, p = {
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
        t.createElement(b, { strong: !0 }, `${L} — 工作流状态`),
        t.createElement(
          o,
          { color: "blue", style: { fontSize: 10 } },
          p[J] || J
        ),
        t.createElement(
          o,
          { style: { fontSize: 10 } },
          `迭代 ${K}`
        ),
        z > 0 ? t.createElement(
          o,
          { color: "orange", style: { fontSize: 10 } },
          `验证重试 ${z}`
        ) : null
      ),
      extra: t.createElement(
        c,
        {
          size: "small",
          type: "text",
          icon: v ? t.createElement(v) : void 0,
          onClick: F,
          loading: te
        },
        "刷新"
      )
    },
    t.createElement(f, {
      current: g,
      size: "small",
      items: _n.map((u) => {
        const M = Rl[u];
        return {
          title: `${M.icon} ${M.label}`,
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
      ...oe.map(
        (u, M) => t.createElement(
          o,
          { key: `${u.name}-${M}`, style: { fontSize: 11 } },
          `${u.emoji || ""} ${u.name}（${u.role}）`
        )
      )
    ),
    O.task ? t.createElement(
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
      `任务: ${O.task}`
    ) : null
  );
}
function Bl({ team: e }) {
  const t = P().React, { Typography: l, Tag: a } = P().antd, { Text: n } = l, s = {
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
function Ul({
  open: e,
  onClose: t,
  agents: l,
  editingTeam: a,
  onSaved: n
}) {
  const s = P().React, { useState: r, useEffect: o, useCallback: d } = s, {
    Modal: c,
    Input: f,
    Button: w,
    Select: S,
    Tag: v,
    Typography: b,
    Switch: E,
    Empty: C,
    message: B,
    Divider: U,
    Steps: N
  } = P().antd, { PlusOutlined: te, DeleteOutlined: G, SaveOutlined: W, ArrowRightOutlined: T } = P().antdIcons || {}, { Text: x, Paragraph: I } = b, [Y, F] = r(""), [O, h] = r("🤝"), [g, L] = r(""), [J, K] = r(
    "pipeline"
  ), [oe, z] = r(""), [p, u] = r(""), [M, ae] = r([]), [R, q] = r([]), [se, X] = r(!1);
  o(() => {
    e && (a ? (F(a.name), h(a.emoji), L(a.description), K(a.mode), z(a.coordinatorName || ""), u(a.taskTemplate), ae(a.steps || []), q(a.members.map((y) => y.name))) : (F(""), h("🤝"), L(""), K("pipeline"), z(""), u(`请执行以下任务：
任务描述：{任务描述}`), ae([]), q([])));
  }, [e, a]);
  const Q = d(() => {
    if (J === "roundtable") {
      const y = R.map((ne) => ({
        agentName: ne,
        instruction: "请给出你的专业评估意见",
        passContext: !1
      }));
      ae(y);
    } else if (J === "pipeline") {
      const y = new Map(M.map((de) => [de.agentName, de])), ne = R.map((de) => y.get(de) || {
        agentName: de,
        instruction: "请完成你的专业部分",
        passContext: !0
      });
      ae(ne);
    }
  }, [J, R, M]), me = (y) => {
    R.includes(y) || (q([...R, y]), J === "coordinator" && !oe && z(y));
  }, k = (y) => {
    q(R.filter((ne) => ne !== y)), ae(M.filter((ne) => ne.agentName !== y)), oe === y && z(R[0] || "");
  }, Z = (y, ne, de) => {
    const fe = [...M];
    fe[y] = { ...fe[y], [ne]: de }, ae(fe);
  }, m = () => {
    if (!Y.trim()) {
      B.warning("请输入团队名称");
      return;
    }
    if (R.length < 2) {
      B.warning("至少需要选择 2 个成员");
      return;
    }
    if (!p.trim()) {
      B.warning("请输入任务模板");
      return;
    }
    if (J === "coordinator" && !oe) {
      B.warning("请选择协调者");
      return;
    }
    X(!0);
    try {
      const y = R.map(
        (pe) => {
          var D;
          const le = l.find((A) => A.name === pe);
          return {
            name: pe,
            role: ((D = le == null ? void 0 : le.description) == null ? void 0 : D.slice(0, 30)) || "团队成员",
            emoji: ""
          };
        }
      );
      let ne = M;
      (M.length === 0 || M.length !== R.length) && (ne = R.map((pe) => ({
        agentName: pe,
        instruction: "请完成你的专业部分",
        passContext: J === "pipeline"
      })));
      const de = {
        id: (a == null ? void 0 : a.id) || `custom-${Date.now()}`,
        name: Y.trim(),
        emoji: O,
        category: "自定义",
        description: g.trim() || `${Y.trim()}（${R.length}人团队）`,
        mode: J,
        members: y,
        coordinatorName: J === "coordinator" ? oe : void 0,
        taskTemplate: p.trim(),
        orchestrationPrompt: "",
        // Custom teams use steps-based instructions
        steps: ne,
        custom: !0,
        createdAt: (a == null ? void 0 : a.createdAt) || Date.now()
      }, fe = ht(), Ee = fe.findIndex((pe) => pe.id === de.id);
      Ee >= 0 ? fe[Ee] = de : fe.push(de), Kn(fe), B.success(a ? "团队已更新" : "团队已创建"), n(), t();
    } catch (y) {
      B.error(y.message || "保存失败");
    } finally {
      X(!1);
    }
  }, _ = l.filter(
    (y) => !R.includes(y.name)
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
        x,
        {
          strong: !0,
          style: { display: "block", marginBottom: 8, fontSize: 13 }
        },
        "1. 基本信息"
      ),
      s.createElement(
        "div",
        { style: { display: "flex", gap: 8, marginBottom: 8, alignItems: "center" } },
        R.length > 0 ? s.createElement(Jt, {
          members: R,
          size: 36
        }) : null,
        s.createElement(f, {
          placeholder: "团队名称（如：储层评价团队）",
          value: Y,
          onChange: (y) => F(y.target.value),
          style: { flex: 1 }
        })
      ),
      s.createElement(f.TextArea, {
        placeholder: "团队描述（简述团队的目标和适用场景）",
        value: g,
        onChange: (y) => L(y.target.value),
        rows: 2,
        style: { marginBottom: 8 }
      }),
      s.createElement(
        "div",
        { style: { display: "flex", gap: 8, alignItems: "center" } },
        s.createElement(
          x,
          { type: "secondary", style: { fontSize: 12 } },
          "协同模式："
        ),
        s.createElement(S, {
          value: J,
          onChange: (y) => K(y),
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
        x,
        {
          strong: !0,
          style: { display: "block", marginBottom: 8, fontSize: 13 }
        },
        "2. 选择团队成员"
      ),
      // Available agents
      _.length > 0 ? s.createElement(
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
        ..._.map(
          (y) => s.createElement(
            w,
            {
              key: y.id,
              size: "small",
              icon: te ? s.createElement(te) : void 0,
              onClick: () => me(y.name)
            },
            y.name
          )
        )
      ) : null,
      // Selected members
      R.length === 0 ? s.createElement(C, {
        description: "请从上方添加团队成员",
        image: C.PRESENTED_IMAGE_SIMPLE
      }) : s.createElement(
        "div",
        { style: { display: "flex", flexDirection: "column", gap: 4 } },
        ...R.map(
          (y) => s.createElement(
            "div",
            {
              key: y,
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
              s.createElement(Le, { name: y, size: 24 }),
              s.createElement(
                x,
                { strong: !0, style: { fontSize: 13 } },
                y
              ),
              J === "coordinator" && oe === y ? s.createElement(
                v,
                { color: "blue", style: { fontSize: 10 } },
                "协调者"
              ) : null
            ),
            s.createElement(
              "div",
              { style: { display: "flex", gap: 4 } },
              J === "coordinator" ? s.createElement(
                w,
                {
                  size: "small",
                  type: "link",
                  onClick: () => z(y)
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
                  onClick: () => k(y)
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
        x,
        {
          strong: !0,
          style: { display: "block", marginBottom: 8, fontSize: 13 }
        },
        `3. 编排执行步骤${J === "roundtable" ? "（各步独立执行）" : J === "pipeline" ? "（依次执行，可传递上下文）" : "（由协调者决定调用顺序）"}`
      ),
      // Auto-sync button
      s.createElement(
        w,
        {
          size: "small",
          type: "dashed",
          onClick: Q,
          style: { marginBottom: 8 }
        },
        "自动生成步骤"
      ),
      // Steps list
      M.length === 0 ? s.createElement(
        x,
        { type: "secondary", style: { fontSize: 12 } },
        "点击「自动生成步骤」或手动配置每步的指令"
      ) : s.createElement(
        "div",
        { style: { display: "flex", flexDirection: "column", gap: 6 } },
        ...M.map(
          (y, ne) => s.createElement(
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
              J === "pipeline" ? s.createElement(
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
                v,
                { color: "blue", style: { fontSize: 11 } },
                y.agentName
              ),
              s.createElement(
                "div",
                { style: { flex: 1 } },
                s.createElement(f, {
                  placeholder: "请输入该步骤的指令...",
                  value: y.instruction,
                  onChange: (de) => Z(ne, "instruction", de.target.value),
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
                checked: y.passContext,
                onChange: (de) => Z(ne, "passContext", de)
              }),
              s.createElement(
                x,
                { type: "secondary", style: { fontSize: 11 } },
                y.passContext ? "传递上一步结果作为上下文" : "独立执行"
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
        x,
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
        onChange: (y) => u(y.target.value),
        rows: 4,
        style: { fontFamily: "monospace", fontSize: 13 }
      }),
      s.createElement(
        x,
        {
          type: "secondary",
          style: { fontSize: 11, display: "block", marginTop: 4 }
        },
        "占位符 {参数名} 在发起任务时可由用户填写替换"
      )
    )
  );
}
function Tn({
  team: e,
  agents: t,
  onLaunch: l,
  onEdit: a,
  onDelete: n
}) {
  var h;
  const s = P().React, { useState: r } = s, { Card: o, Tag: d, Typography: c, Button: f, Tooltip: w } = P().antd, {
    TeamOutlined: S,
    RocketOutlined: v,
    UserOutlined: b,
    EditOutlined: E,
    DeleteOutlined: C,
    DownOutlined: B,
    UpOutlined: U
  } = P().antdIcons || {}, { Text: N, Paragraph: te } = c, [G, W] = r(!1), T = {
    coordinator: { label: "协调者模式", color: "blue" },
    pipeline: { label: "流水线模式", color: "cyan" },
    roundtable: { label: "圆桌讨论", color: "purple" }
  }, x = T[e.mode] || T.coordinator, I = e.members.map((g) => {
    const L = wt(t, g.name);
    return { ...g, found: !!L, agentId: L };
  }), Y = I.filter((g) => g.found).length, F = e.coordinatorName || ((h = e.members[0]) == null ? void 0 : h.name), O = F ? wt(t, F) : null;
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
      s.createElement(Jt, {
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
            { color: x.color, style: { fontSize: 10 } },
            x.label
          ),
          s.createElement(
            d,
            { color: "green", style: { fontSize: 10 } },
            `${e.members.length} 位专家`
          ),
          Y < e.members.length ? s.createElement(
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
          w,
          { title: "删除" },
          s.createElement(f, {
            type: "text",
            size: "small",
            danger: !0,
            icon: C ? s.createElement(C) : void 0,
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
      ...I.map(
        (g) => s.createElement(
          w,
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
            s.createElement(Le, { name: g.name, size: 18 }),
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
          g.stopPropagation(), W(!G);
        },
        icon: G ? U ? s.createElement(U) : "▲" : B ? s.createElement(B) : "▼"
      },
      G ? "收起流程" : "查看执行流程"
    ),
    G ? s.createElement(Bl, { team: e }) : null,
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
          icon: v ? s.createElement(v) : void 0,
          disabled: !O,
          onClick: () => l(e),
          style: Oe
        },
        "发起团队任务"
      )
    )
  );
}
function Nl({
  agents: e,
  onLaunch: t
}) {
  const l = P().React, { useMemo: a, useState: n, useCallback: s, useEffect: r } = l, {
    Row: o,
    Col: d,
    Input: c,
    Empty: f,
    Typography: w,
    Tag: S,
    Button: v,
    Divider: b,
    Tabs: E,
    message: C,
    Popconfirm: B
  } = P().antd, { SearchOutlined: U, TeamOutlined: N, PlusOutlined: te, RocketOutlined: G } = P().antdIcons || {}, { Text: W } = w, [T, x] = n(""), [I, Y] = n([]), [F, O] = n([]), [h, g] = n(!1), [L, J] = n(!1), [K, oe] = n(null);
  r(() => {
    Y(ht());
    let X = !0;
    return Ml().then((Q) => {
      X && (Q ? (O(Q), g(!1)) : g(!0));
    }), () => {
      X = !1;
    };
  }, []);
  const z = s(() => {
    Y(ht());
  }, []), p = s(
    (X) => {
      const me = ht().filter((k) => k.id !== X.id);
      Kn(me), Y(me), C.success(`团队「${X.name}」已删除`);
    },
    [C]
  ), u = s((X) => {
    oe(X), J(!0);
  }, []), M = s(() => {
    oe(null), J(!0);
  }, []), ae = a(() => [...I, ...F], [I, F]), R = a(() => {
    if (!T.trim()) return ae;
    const X = T.toLowerCase();
    return ae.filter(
      (Q) => Q.name.toLowerCase().includes(X) || Q.description.toLowerCase().includes(X) || Q.category.toLowerCase().includes(X)
    );
  }, [ae, T]), q = R.filter((X) => X.custom), se = R.filter((X) => !X.custom);
  return l.createElement(
    "div",
    null,
    // Workflow status card (OMP-backed)
    l.createElement(jl),
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
        W,
        { style: { fontSize: 13, color: "#389e0d" } },
        "OMP 驱动的专家团工作流 — 5 阶段状态机（规划→分派→验证→综合→完成），支持结构化交接、角色工具隔离、fork 并行执行和自动重试。"
      ),
      l.createElement(
        v,
        {
          type: "primary",
          size: "small",
          icon: te ? l.createElement(te) : void 0,
          onClick: M,
          style: Oe
        },
        "创建专家团"
      )
    ),
    // Search
    l.createElement(c, {
      placeholder: "搜索团队名称、描述或类别...",
      prefix: U ? l.createElement(U) : void 0,
      value: T,
      onChange: (X) => x(X.target.value),
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
                o,
                { gutter: [12, 12] },
                ...se.map(
                  (X) => l.createElement(
                    d,
                    { key: X.id, xs: 24, sm: 12, md: 8 },
                    l.createElement(Tn, {
                      team: X,
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
            label: `自定义团队${q.length ? ` (${q.length})` : ""}`,
            children: l.createElement(
              "div",
              null,
              q.length > 0 ? l.createElement(
                o,
                { gutter: [12, 12] },
                ...q.map(
                  (X) => l.createElement(
                    d,
                    { key: X.id, xs: 24, sm: 12, md: 8 },
                    l.createElement(Tn, {
                      team: X,
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
    l.createElement(Ul, {
      open: L,
      onClose: () => {
        J(!1), oe(null);
      },
      agents: e,
      editingTeam: K,
      onSaved: z
    })
  );
}
function Dl() {
  var re;
  const e = P().React, { useState: t, useEffect: l, useCallback: a, useMemo: n } = e, {
    Spin: s,
    Empty: r,
    Input: o,
    Button: d,
    message: c,
    Row: f,
    Col: w,
    Tabs: S,
    Modal: v,
    Typography: b
  } = P().antd, {
    ReloadOutlined: E,
    PlusOutlined: C,
    SearchOutlined: B,
    TeamOutlined: U,
    UserOutlined: N
  } = P().antdIcons || {}, { Text: te, Paragraph: G } = b, [W, T] = t([]), [x, I] = t(!0), [Y, F] = t(!1), [O, h] = t(null), [g, L] = t(""), [J, K] = t(!1), [oe, z] = t("experts"), [p, u] = t(
    null
  ), [M, ae] = t(""), [R, q] = t(!1), [se, X] = t(!1), [Q, me] = t(null), [k, Z] = t([]), m = a(async () => {
    I(!0);
    try {
      const H = await Nt(), ue = await Promise.all(
        H.map(async (ve) => {
          try {
            const [we, xe, ze] = await Promise.all([
              Dt(ve.id).catch(() => null),
              Tt(ve.id).catch(() => []),
              Wt(ve.id).catch(() => [])
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
      T(ue), Z(H);
    } catch (H) {
      c.error(H.message || "加载专家列表失败"), T([]);
    } finally {
      I(!1);
    }
  }, []);
  l(() => {
    m();
  }, [m]), l(() => {
    if (Q && se) {
      const H = W.find(
        (ue) => ue.agent.id === Q.agent.id
      );
      H && H !== Q && me(H);
    }
  }, [W, Q, se]);
  const _ = a(
    async (H) => {
      var xe;
      const ue = H.coordinatorName || ((xe = H.members[0]) == null ? void 0 : xe.name);
      let ve = null;
      if (ue && (ve = wt(k, ue)), !ve) {
        const ze = k[0];
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
        ae(H.taskTemplate), u(H);
        return;
      }
      await y(H, ve, H.taskTemplate);
    },
    [k, c]
  ), y = a(
    async (H, ue, ve) => {
      q(!0);
      try {
        const we = ve || H.taskTemplate;
        let xe = H.name;
        H.custom && (xe = `@${await Al(H)}`);
        const ze = `/ugsci-team ${H.mode} ${xe} ${we}`, Ae = P();
        Ae.setSelectedAgent && Ae.setSelectedAgent(ue);
        const He = await Ol(
          ue,
          ze,
          H.name
        );
        c.success(
          `OMP 工作流已启动：${H.name}（${H.mode}模式）`
        ), u(null), ne(`/chat/${He}`);
      } catch (we) {
        c.error(we.message || "发起团队任务失败");
      } finally {
        q(!1);
      }
    },
    [c]
  ), ne = (H) => {
    window.history.pushState({}, "", H), window.dispatchEvent(new PopStateEvent("popstate"));
  }, de = a((H) => {
    h(H), F(!0);
  }, []), fe = a((H) => {
    me(H), X(!0);
  }, []), Ee = a(
    (H) => {
      if (!H.agent.enabled) {
        c.warning(`专家「${H.agent.name}」未启用，请先启用`);
        return;
      }
      try {
        const ue = P();
        ue.setSelectedAgent && ue.setSelectedAgent(H.agent.id);
      } catch (ue) {
        console.warn("[ugsci] Failed to set selected agent:", ue);
      }
      c.success(`已召唤专家「${H.agent.name}」，正在跳转至对话...`), ne("/chat");
    },
    [c]
  ), pe = n(() => {
    if (!g.trim()) return W;
    const H = g.toLowerCase();
    return W.filter(
      (ue) => {
        var ve;
        return ue.agent.name.toLowerCase().includes(H) || ((ve = ue.agent.description) == null ? void 0 : ve.toLowerCase().includes(H)) || ue.agent.id.toLowerCase().includes(H) || ue.skills.some((we) => we.name.toLowerCase().includes(H));
      }
    );
  }, [W, g]), le = W.filter((H) => H.agent.enabled).length, D = W.reduce(
    (H, ue) => H + ue.skills.filter((ve) => ve.enabled !== !1).length,
    0
  ), A = W.reduce((H, ue) => H + ue.mcps.length, 0), V = [
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
            prefix: B ? e.createElement(B) : void 0,
            value: g,
            onChange: (H) => L(H.target.value),
            allowClear: !0,
            style: { maxWidth: 400 }
          })
        ),
        // Content
        x ? e.createElement(
          "div",
          { style: { textAlign: "center", padding: 60 } },
          e.createElement(s, { size: "large" })
        ) : pe.length === 0 ? e.createElement(r, {
          description: g ? "未找到匹配的专家" : "暂无专家，点击「创建专家」添加"
        }) : e.createElement(
          f,
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
              e.createElement(xl, {
                expert: H,
                onClick: () => de(H),
                onSummon: () => Ee(H),
                onConfigure: () => fe(H)
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
      children: e.createElement(Nl, {
        agents: k,
        onLaunch: _
      })
    }
  ];
  return e.createElement(
    "div",
    { style: { padding: 24 } },
    e.createElement(_t, {
      title: "专家",
      subtitle: `共 ${W.length} 位专家（${le} 位启用）· ${D} 个技能 · ${A} 个 MCP 客户端`,
      extra: e.createElement(
        e.Fragment,
        null,
        e.createElement(
          d,
          {
            icon: E ? e.createElement(E) : void 0,
            onClick: () => {
              et(), m();
            },
            loading: x
          },
          "刷新"
        ),
        e.createElement(
          d,
          {
            type: "primary",
            icon: C ? e.createElement(C) : void 0,
            onClick: () => K(!0),
            style: Oe
          },
          "创建专家"
        )
      )
    }),
    e.createElement(S, {
      items: V,
      activeKey: oe,
      onChange: (H) => z(H)
    }),
    // Drawer
    e.createElement(kl, {
      expert: O,
      open: Y,
      onClose: () => F(!1),
      onRefresh: () => m()
    }),
    // Template Modal
    e.createElement(_l, {
      open: J,
      onClose: () => K(!1),
      onCreated: () => m()
    }),
    // Config Modal (gear icon)
    e.createElement(Sl, {
      expert: Q,
      open: se,
      onClose: () => X(!1),
      onRefresh: () => m()
    }),
    // Team Launch Modal (for filling placeholders)
    p ? e.createElement(
      v,
      {
        open: !0,
        title: e.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 8 } },
          e.createElement(Jt, {
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
          const H = p.coordinatorName || ((we = p.members[0]) == null ? void 0 : we.name), ue = H ? wt(k, H) : null;
          if (!ue) {
            c.error("无法找到协调者专家");
            return;
          }
          const ve = M.trim() || p.taskTemplate;
          y(p, ue, ve);
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
          value: M,
          onChange: (H) => ae(H.target.value),
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
          `协调者: ${p.coordinatorName || ((re = p.members[0]) == null ? void 0 : re.name) || "—"} · 成员: ${p.members.map((H) => H.name).join("、")}`
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
], Fl = {
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
function Yn(e) {
  const t = Qe(e);
  return t === "" || t === "*";
}
function zt(e) {
  return e === "user" ? "user" : "all";
}
function De(e) {
  const t = zt(e.subject_type);
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
function Qn(e) {
  return { tool_name: e.tool_name || "*", effect: e.effect };
}
function Zn(e) {
  return [...e].map(De).sort(
    (t, l) => t.source_type.localeCompare(l.source_type) || t.source_value.localeCompare(l.source_value) || t.subject_type.localeCompare(l.subject_type) || t.subject_value.localeCompare(l.subject_value)
  );
}
function Ct(e) {
  return [...e].map(Ze).sort(
    (t, l) => t.tool_name.localeCompare(l.tool_name) || t.source_type.localeCompare(l.source_type) || t.source_value.localeCompare(l.source_value) || t.subject_type.localeCompare(l.subject_type) || t.subject_value.localeCompare(l.subject_value)
  );
}
function ea(e) {
  return [...e].map(Qn).sort((t, l) => t.tool_name.localeCompare(l.tool_name));
}
function je(e) {
  return {
    default_effect: e.default_effect || "deny",
    client_overrides: Zn(e.client_overrides || []),
    tool_defaults: ea(e.tool_defaults || []),
    tool_overrides: Ct(e.tool_overrides || []),
    unmanaged_rules_count: e.unmanaged_rules_count || 0
  };
}
function Me(e) {
  return [Ge(e.source_type), Qe(e.source_value), zt(e.subject_type), e.subject_type === "all" ? "" : (e.subject_value || "").trim()].join("\0");
}
function Re(e) {
  return [e.tool_name || "*", Ge(e.source_type), Qe(e.source_value), zt(e.subject_type), e.subject_type === "all" ? "" : (e.subject_value || "").trim()].join("\0");
}
function Gl(e, t) {
  const l = je(t), a = /* @__PURE__ */ new Map();
  l.tool_overrides.forEach((c) => {
    const f = Ze(c), w = a.get(f.tool_name) || [];
    w.push(f), a.set(f.tool_name, w);
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
      rules: Ct(a.get(c.name) || [])
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
      rules: Ct(a.get(c) || [])
    };
  });
  return [...r, ...d];
}
function ta(e, t) {
  const l = je(e), a = new Set(
    t === null ? l.client_overrides.map((n) => Me(De(n))) : l.tool_overrides.filter((n) => n.tool_name === t).map((n) => Re(Ze(n)))
  );
  for (const n of Vn) {
    const s = t === null ? Me({ source_type: "channel", source_value: n, subject_type: "all", subject_value: "" }) : Re({ tool_name: t, source_type: "channel", source_value: n, subject_type: "all", subject_value: "" });
    if (!a.has(s)) return n;
  }
  return "console";
}
function Hl(e) {
  return Lt(e, { source_type: "channel", source_value: ta(e, null), subject_type: "all", subject_value: "", effect: "ask" });
}
function Wl(e, t) {
  return jt(e, { tool_name: t, source_type: "channel", source_value: ta(e, t), subject_type: "all", subject_value: "", effect: "ask" });
}
function Lt(e, t, l) {
  const a = je(e), n = De(t), s = Me(l || n), r = Me(n), o = a.client_overrides.filter((d) => {
    const c = Me(De(d));
    return c !== s && c !== r;
  });
  return o.push(n), { ...a, client_overrides: Zn(o) };
}
function jt(e, t, l) {
  const a = je(e), n = Ze(t), s = Re(l || n), r = Re(n), o = a.tool_overrides.filter((d) => {
    const c = Re(Ze(d));
    return c !== s && c !== r;
  });
  return o.push(n), { ...a, tool_overrides: Ct(o) };
}
function Jl(e, t, l) {
  const a = je(e), n = a.tool_defaults.filter((s) => s.tool_name !== t);
  return n.push({ tool_name: t, effect: l }), { ...a, tool_defaults: ea(n) };
}
function Xl(e, t) {
  const l = je(e), a = Me(t);
  return { ...l, client_overrides: l.client_overrides.filter((n) => Me(De(n)) !== a) };
}
function Kl(e, t) {
  const l = je(e), a = Re(t);
  return { ...l, tool_overrides: l.tool_overrides.filter((n) => Re(Ze(n)) !== a) };
}
function na(e, t) {
  const l = Ge(t.source_type), a = Qe(t.source_value);
  if (Yn(a)) return [];
  const n = /* @__PURE__ */ new Map();
  return e.forEach((s) => {
    if (Ge(s.source_type) !== l || Qe(s.source_value) !== a) return;
    const r = (s.subject_value || "").trim();
    !r || n.has(r) || n.set(r, s);
  }), Array.from(n.values());
}
function ql(e, t) {
  return na(e, t).map((l) => ({ label: l.subject_value, value: l.subject_value }));
}
function Kt(e) {
  return Ge(e.source_type) === "channel" && Yn(e.source_value) && zt(e.subject_type) === "user" && !!(e.subject_value || "").trim();
}
function Vl(e, t) {
  const l = De(t);
  return l.subject_type === "user" && !!l.subject_value && l.subject_value !== "*" && e.some((a) => Ge(a.source_type) === l.source_type) && !Kt(l) && !na(e, l).some((a) => a.subject_value === l.subject_value);
}
function Yl(e) {
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
function zn(e, t) {
  const l = { ...e, ...t };
  return t.subject_type && (l.subject_value = ""), (t.source_type !== void 0 || t.source_value !== void 0) && t.subject_value === void 0 && l.subject_type === "user" && (l.subject_value = ""), l;
}
function Rt(e) {
  return JSON.stringify(je(e));
}
function Ql({
  client: e,
  agentId: t,
  open: l,
  onClose: a,
  onSave: n
}) {
  const s = P().React, { useState: r, useEffect: o, useMemo: d, useCallback: c } = s, { Modal: f, Spin: w, Empty: S, Button: v, Tag: b, Segmented: E, Select: C, Input: B, AutoComplete: U, Typography: N, message: te } = P().antd, { PlusOutlined: G, DeleteOutlined: W } = P().antdIcons || {}, { Text: T } = N, [x, I] = r(null), [Y, F] = r([]), [O, h] = r([]), [g, L] = r(!1), [J, K] = r(!1), [oe, z] = r(""), [p, u] = r("");
  o(() => {
    if (!l) return;
    let m = !1;
    return (async () => {
      L(!0), F([]), h([]), z("");
      try {
        const y = await Fa(t, e.key);
        if (!m) {
          const ne = je(y);
          I(ne), u(Rt(ne));
        }
        try {
          const ne = await Ha(t);
          m || h(ne);
        } catch {
          m || h([]);
        }
        if (!e.enabled) {
          m || z("MCP 客户端未启用，无法获取工具列表");
          return;
        }
        try {
          const ne = await Da(t, e.key);
          m || F(ne);
        } catch (ne) {
          m || z((ne == null ? void 0 : ne.message) || "无法加载工具列表");
        }
      } catch {
        m || (I(null), u(""), z("加载访问策略失败"));
      } finally {
        m || L(!1);
      }
    })(), () => {
      m = !0;
    };
  }, [l, e.key, e.enabled, t]);
  const M = d(() => x ? Gl(Y, x) : [], [Y, x]), ae = d(() => !!(x && Rt(x) !== p), [x, p]), R = (m) => Fl[m] || m, q = c((m) => {
    I((_) => _ && { ..._, default_effect: m });
  }, []), se = c((m, _) => {
    I((y) => y && Lt(y, zn(m, _), { source_type: m.source_type, source_value: m.source_value, subject_type: m.subject_type, subject_value: m.subject_value }));
  }, []), X = c((m, _) => {
    I((y) => y && jt(y, zn(m, _), { tool_name: m.tool_name, source_type: m.source_type, source_value: m.source_value, subject_type: m.subject_type, subject_value: m.subject_value }));
  }, []), Q = c(async () => {
    if (!x) return;
    const m = Yl(x);
    if (m) {
      te.error(m.reason === "missingUserValue" ? "用户规则缺少用户标识" : "用户来源不明确");
      return;
    }
    K(!0);
    try {
      await n(e.key, x) && (u(Rt(x)), a());
    } finally {
      K(!1);
    }
  }, [x, e.key, n, a, te]), me = c(() => {
    if (!ae || J) {
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
  }, [ae, J, a]), k = c((m, _) => {
    const y = ql(O, m), ne = Kt(m), de = Vl(O, m), fe = [{ label: "所有渠道", value: "*" }, ...Vn.map((V) => ({ label: R(V), value: V }))], Ee = [{ label: "所有人", value: "all" }, { label: "指定用户", value: "user" }], pe = (V) => {
      _ ? X(m, V) : se(m, V);
    }, le = (V) => {
      I(_ ? (re) => re && jt(re, { ...m, effect: V }) : (re) => re && Lt(re, { ...m, effect: V }));
    }, D = () => {
      I(_ ? (V) => V && Kl(V, { tool_name: m.tool_name, source_type: m.source_type, source_value: m.source_value, subject_type: m.subject_type, subject_value: m.subject_value }) : (V) => V && Xl(V, { source_type: m.source_type, source_value: m.source_value, subject_type: m.subject_type, subject_value: m.subject_value }));
    }, A = _ ? Re(m) : Me(m);
    return s.createElement(
      "div",
      { key: A, style: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr auto", gap: 6, alignItems: "end", padding: "6px 0", borderBottom: "1px solid #f5f5f5" } },
      // source_type
      s.createElement(
        "div",
        null,
        s.createElement(T, { style: { fontSize: 11, color: "#999", display: "block", marginBottom: 2 } }, "来源类型"),
        s.createElement(C, {
          size: "small",
          style: { width: "100%" },
          value: m.source_type || "channel",
          onChange: (V) => pe({ source_type: V, source_value: V === "channel" ? m.source_value || "*" : m.source_value }),
          options: [{ label: "渠道", value: "channel" }, ...m.source_type && m.source_type !== "channel" ? [{ label: m.source_type, value: m.source_type }] : []]
        })
      ),
      // source_value
      s.createElement(
        "div",
        null,
        s.createElement(T, { style: { fontSize: 11, color: "#999", display: "block", marginBottom: 2 } }, "来源"),
        m.source_type === "channel" ? s.createElement(C, { size: "small", style: { width: "100%" }, value: m.source_value || "*", onChange: (V) => pe({ source_value: V }), options: fe }) : s.createElement(B, { size: "small", placeholder: "来源标识", value: m.source_value, onChange: (V) => pe({ source_value: V.target.value }) })
      ),
      // subject_type
      s.createElement(
        "div",
        null,
        s.createElement(T, { style: { fontSize: 11, color: "#999", display: "block", marginBottom: 2 } }, "对象类型"),
        s.createElement(C, { size: "small", style: { width: "100%" }, value: m.subject_type, onChange: (V) => pe({ subject_type: V }), options: Ee })
      ),
      // subject_value
      s.createElement(
        "div",
        null,
        s.createElement(T, { style: { fontSize: 11, color: "#999", display: "block", marginBottom: 2 } }, "对象"),
        m.subject_type === "user" ? s.createElement(
          "div",
          null,
          s.createElement(U, {
            size: "small",
            style: { width: "100%" },
            value: m.subject_value,
            options: y,
            placeholder: y.length > 0 ? "用户 ID" : "无近期用户",
            onChange: (V) => pe({ subject_value: V }),
            onSelect: (V) => pe({ subject_value: V }),
            filterOption: (V, re) => String((re == null ? void 0 : re.value) || "").toLowerCase().includes(V.toLowerCase())
          }),
          ne ? s.createElement(T, { style: { fontSize: 10, color: "#fa8c16", display: "block" } }, "请先选择具体渠道") : null,
          de ? s.createElement(T, { style: { fontSize: 10, color: "#fa8c16", display: "block" } }, "未知的用户标识") : null
        ) : s.createElement(B, { size: "small", disabled: !0, value: "所有人" })
      ),
      // effect
      s.createElement(
        "div",
        null,
        s.createElement(T, { style: { fontSize: 11, color: "#999", display: "block", marginBottom: 2 } }, "效果"),
        s.createElement(C, {
          size: "small",
          style: { width: "100%" },
          value: m.effect,
          onChange: (V) => le(V),
          options: [{ label: "允许", value: "allow" }, { label: "询问", value: "ask" }, { label: "拒绝", value: "deny" }]
        })
      ),
      // delete
      s.createElement(v, { size: "small", type: "text", icon: s.createElement(W), onClick: D, title: "删除规则" })
    );
  }, [O, se, X]), Z = (m, _) => {
    const ne = {
      ask: { bg: "rgba(245,158,11,0.24)", border: "rgba(217,119,6,0.36)", text: "#8a4b00" },
      allow: { bg: "rgba(34,197,94,0.22)", border: "rgba(22,163,74,0.35)", text: "#17643a" },
      deny: { bg: "rgba(239,68,68,0.2)", border: "rgba(220,38,38,0.34)", text: "#9f1f26" }
    }[m];
    return s.createElement(E, {
      size: "small",
      value: m,
      onChange: (de) => _(de),
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
        s.createElement(v, { onClick: me, style: { marginRight: 8 } }, "取消"),
        s.createElement(v, { type: "primary", onClick: Q, loading: J, disabled: !x || g }, "保存")
      )
    },
    g && !x ? s.createElement("div", { style: { textAlign: "center", padding: 40 } }, s.createElement(w)) : x ? s.createElement(
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
            Z(x.default_effect, q),
            s.createElement(v, { size: "small", icon: s.createElement(G), onClick: () => I((m) => m && Hl(m)) }, "添加规则")
          )
        ),
        x.client_overrides.length === 0 ? s.createElement(T, { style: { fontSize: 12, color: "#999" } }, "暂无客户端级覆盖规则") : s.createElement("div", null, ...x.client_overrides.map((m) => k(m, !1)))
      ),
      // ── Error message ──
      oe ? s.createElement("div", { style: { color: "#ff4d4f", fontSize: 12, marginBottom: 8 } }, oe) : null,
      // ── Tool-level panel ──
      s.createElement(T, { strong: !0, style: { display: "block", marginBottom: 8 } }, "工具访问策略"),
      M.length === 0 ? s.createElement(S, { description: "暂无工具" }) : s.createElement(
        "div",
        null,
        ...M.map(
          (m) => s.createElement(
            "div",
            { key: m.toolName, style: { marginBottom: 12, padding: "10px 12px", background: "#fafafa", borderRadius: 6, border: "1px solid #f0f0f0" } },
            s.createElement(
              "div",
              { style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 } },
              s.createElement(
                "div",
                { style: { display: "flex", alignItems: "center", gap: 6 } },
                s.createElement(b, { color: m.stale ? "default" : "blue" }, m.toolName),
                m.stale ? s.createElement(b, { color: "orange" }, "已失效") : null
              ),
              s.createElement(
                "div",
                { style: { display: "flex", alignItems: "center", gap: 8 } },
                s.createElement(T, { style: { fontSize: 12, color: "#666" } }, "默认:"),
                Z(m.defaultEffect, (_) => I((y) => y && Jl(y, m.toolName, _))),
                s.createElement(v, { size: "small", icon: s.createElement(G), onClick: () => I((_) => _ && Wl(_, m.toolName)) }, "添加规则")
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
            m.rules.length === 0 ? s.createElement(T, { style: { fontSize: 12, color: "#999" } }, "暂无工具级覆盖规则") : s.createElement("div", null, ...m.rules.map((_) => k(_, !0)))
          )
        )
      )
    ) : s.createElement("div", { style: { color: "#ff4d4f" } }, "加载访问策略失败")
  );
}
function Zl({
  client: e,
  agentId: t,
  open: l,
  onClose: a,
  onAuthChanged: n
}) {
  var K, oe, z, p, u;
  const s = P().React, { useState: r, useCallback: o, useEffect: d } = s, { Modal: c, Button: f, Input: w, Typography: S, message: v } = P().antd, { Text: b } = S, [E, C] = r("idle"), [B, U] = r(""), [N, te] = r(!1), [G, W] = r(((K = e.oauth_status) == null ? void 0 : K.client_id) || ""), [T, x] = r(((oe = e.oauth_status) == null ? void 0 : oe.scope) || ""), [I, Y] = r(""), [F, O] = r("");
  d(() => {
    if (E !== "waiting") return;
    const M = setInterval(async () => {
      try {
        (await Ja(t, e.key)).authorized && (C("success"), n());
      } catch {
      }
    }, 2e3);
    return () => clearInterval(M);
  }, [E, e.key, t, n]);
  const h = E === "success" || E === "idle" && ((z = e.oauth_status) == null ? void 0 : z.authorized) === !0, g = E === "idle" && ((p = e.oauth_status) == null ? void 0 : p.authorized) && e.oauth_status.expires_at > 0 && e.oauth_status.expires_at < Date.now() / 1e3, L = o(async () => {
    var M;
    if (!((M = e.url) != null && M.trim())) {
      U("缺少 URL");
      return;
    }
    C("starting"), U("");
    try {
      const ae = await Wa(t, e.key, {
        url: e.url,
        scope: T,
        client_id: G,
        auth_endpoint: I,
        token_endpoint: F
      });
      C("waiting"), window.open(ae.auth_url, "_blank", "popup,width=600,height=700");
    } catch (ae) {
      C("error"), U((ae == null ? void 0 : ae.message) || "OAuth 启动失败");
    }
  }, [t, e.key, e.url, T, G, I, F]), J = o(async () => {
    C("revoking");
    try {
      await Xa(t, e.key), C("idle"), n();
    } catch {
      C("idle");
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
          h || g ? s.createElement(f, { size: "small", onClick: J, loading: String(E) === "revoking" }, "撤销") : null,
          s.createElement(f, { size: "small", type: h && !g ? "default" : "primary", onClick: L, loading: E === "starting" || E === "waiting", disabled: !((u = e.url) != null && u.trim()) }, h && !g ? "重新授权" : "授权")
        )
      ),
      B ? s.createElement("p", { style: { color: "#c0392b", fontSize: 12 } }, B) : null,
      // Advanced
      s.createElement(
        "div",
        { style: { marginTop: 8, cursor: "pointer", color: "#888", fontSize: 12 }, onClick: () => te((M) => !M) },
        N ? "收起高级设置" : "展开高级设置"
      ),
      N ? s.createElement(
        "div",
        { style: { marginTop: 8, padding: "10px 12px", background: "white", borderRadius: 6, border: "1px solid #e9ecef" } },
        s.createElement(b, { style: { fontSize: 11, color: "#888", display: "block", marginBottom: 2 } }, "Client ID"),
        s.createElement(w, { size: "small", placeholder: "留空则使用动态注册", value: G, onChange: (M) => W(M.target.value) }),
        s.createElement(b, { style: { fontSize: 11, color: "#888", display: "block", marginBottom: 2, marginTop: 8 } }, "Scope"),
        s.createElement(w, { size: "small", placeholder: "OAuth scope", value: T, onChange: (M) => x(M.target.value) }),
        s.createElement(b, { style: { fontSize: 11, color: "#888", display: "block", marginBottom: 2, marginTop: 8 } }, "授权端点"),
        s.createElement(w, { size: "small", placeholder: "https://auth.example.com/authorize", value: I, onChange: (M) => Y(M.target.value) }),
        s.createElement(b, { style: { fontSize: 11, color: "#888", display: "block", marginBottom: 2, marginTop: 8 } }, "令牌端点"),
        s.createElement(w, { size: "small", placeholder: "https://auth.example.com/token", value: F, onChange: (M) => O(M.target.value) })
      ) : null
    )
  );
}
function es({
  mcp: e,
  agentId: t,
  onToggle: l,
  onDelete: a,
  onUpdate: n,
  onUpdatePolicy: s,
  onRefresh: r
}) {
  const o = P().React, { useState: d } = o, { Card: c, Tag: f, Tooltip: w, Modal: S, Input: v, Button: b, Typography: E } = P().antd, { Text: C } = E, {
    EyeOutlined: B,
    EyeInvisibleOutlined: U,
    DeleteOutlined: N,
    ToolOutlined: te
  } = P().antdIcons || {}, [G, W] = d(!1), [T, x] = d(!1), [I, Y] = d(!1), [F, O] = d(""), [h, g] = d(!1), [L, J] = d(!1), K = e.transport === "streamable_http" || e.transport === "sse", oe = K ? "Remote" : "Local", z = e.oauth_status, p = Date.now() / 1e3, u = !!(z != null && z.authorized) && z.expires_at > p, M = !!(z != null && z.authorized) && z.expires_at <= p, ae = !!z, R = () => {
    O(JSON.stringify(e, null, 2)), g(!1), W(!0);
  }, q = async () => {
    try {
      const X = JSON.parse(F), Q = [
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
      for (const Z of Q)
        Z in X && (me[Z] = X[Z]);
      await n(e.key, me) && (W(!1), g(!1));
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
            o.createElement(C, { strong: !0, style: { fontSize: 14, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" } }, e.name || e.key)
          ),
          o.createElement(
            "span",
            { style: { fontSize: 10, padding: "1px 6px", borderRadius: 4, background: K ? "#e6f4ff" : "#f9f0ff", color: K ? "#1677ff" : "#722ed1", flexShrink: 0 } },
            oe
          ),
          // OAuth status icons
          ae && M ? o.createElement("span", { style: { fontSize: 11, color: "#e67e22", flexShrink: 0 } }, "⚠") : null,
          ae && u ? o.createElement("span", { style: { fontSize: 11, color: "#27ae60", flexShrink: 0 } }, "✓") : null,
          ae && !u && !M ? o.createElement("span", { style: { fontSize: 11, color: "#7f8c8d", flexShrink: 0 } }, "🔒") : null
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
          b,
          {
            size: "small",
            icon: te ? o.createElement(te) : void 0,
            onClick: (X) => {
              X.stopPropagation(), Y(!0);
            },
            style: { width: "100%" }
          },
          "工具与访问策略"
        ),
        // Secondary actions: oauth (remote only) + toggle + delete
        o.createElement(
          "div",
          { style: { display: "grid", gridTemplateColumns: K ? "1fr 1fr 1fr" : "1fr 1fr", gap: 8 } },
          K ? o.createElement(
            b,
            {
              size: "small",
              onClick: (X) => {
                X.stopPropagation(), J(!0);
              },
              style: {
                color: u ? "#27ae60" : M ? "#e67e22" : void 0,
                borderColor: u ? "#27ae60" : M ? "#e67e22" : void 0,
                background: u ? "rgba(39,174,96,0.06)" : M ? "rgba(230,126,34,0.06)" : void 0
              }
            },
            u ? "已授权" : M ? "已过期" : "授权"
          ) : null,
          o.createElement(
            b,
            {
              size: "small",
              icon: e.enabled ? U ? o.createElement(U) : void 0 : B ? o.createElement(B) : void 0,
              onClick: l
            },
            e.enabled ? "禁用" : "启用"
          ),
          o.createElement(
            b,
            {
              size: "small",
              danger: !0,
              icon: N ? o.createElement(N) : void 0,
              onClick: (X) => {
                X.stopPropagation(), x(!0);
              }
            },
            "删除"
          )
        )
      )
    ),
    // ── Delete Confirmation Modal ──
    o.createElement(
      S,
      {
        title: "确认删除",
        open: T,
        onOk: () => {
          x(!1), a();
        },
        onCancel: () => x(!1),
        okText: "确认删除",
        cancelText: "取消",
        okButtonProps: { danger: !0 }
      },
      o.createElement("p", null, `确定要删除 MCP 客户端「${e.name || e.key}」吗？此操作不可撤销。`)
    ),
    // ── JSON Config Modal (click card to view/edit) ──
    o.createElement(
      S,
      {
        title: `${e.name || e.key} - 配置`,
        open: G,
        onCancel: () => {
          W(!1), g(!1);
        },
        footer: o.createElement(
          "div",
          { style: { textAlign: "right" } },
          o.createElement(b, { onClick: () => {
            W(!1), g(!1);
          }, style: { marginRight: 8 } }, "取消"),
          h ? o.createElement(b, { type: "primary", onClick: q }, "保存") : o.createElement(b, { type: "primary", onClick: () => g(!0) }, "编辑")
        ),
        width: 700
      },
      o.createElement(
        "div",
        { style: { marginBottom: 8, fontSize: 12, color: "#8c8c8c" } },
        "密钥类字段（如 API_KEY）可能已被后端脱敏，保存时不会覆盖脱敏值。"
      ),
      h ? o.createElement(v.TextArea, {
        value: F,
        onChange: (X) => O(X.target.value),
        autoSize: { minRows: 15, maxRows: 25 },
        style: { fontFamily: "Monaco, Courier New, monospace", fontSize: 13 }
      }) : o.createElement(
        "pre",
        { style: { backgroundColor: "#f5f5f5", padding: 16, borderRadius: 8, maxHeight: 400, overflow: "auto", fontSize: 13, fontFamily: "Monaco, Courier New, monospace" } },
        se
      )
    ),
    // ── Access Modal (tools + access policy) ──
    o.createElement(Ql, {
      client: e,
      agentId: t,
      open: I,
      onClose: () => Y(!1),
      onSave: s
    }),
    // ── OAuth Modal (remote clients only) ──
    K ? o.createElement(Zl, {
      client: e,
      agentId: t,
      open: L,
      onClose: () => J(!1),
      onAuthChanged: async () => {
        await (r == null ? void 0 : r());
      }
    }) : null
  );
}
const Bt = {
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
  return Ne(`/ugsci/engines/icon/${encodeURIComponent(e)}`);
}
async function ts() {
  return ie("/ugsci/engines/list");
}
async function ns(e) {
  return ie("/ugsci/engines/", {
    method: "POST",
    body: JSON.stringify(e)
  });
}
async function as(e, t) {
  return ie(`/ugsci/engines/${encodeURIComponent(e)}`, {
    method: "PUT",
    body: JSON.stringify(t)
  });
}
async function ls(e) {
  return ie(
    `/ugsci/engines/${encodeURIComponent(e)}`,
    { method: "DELETE" }
  );
}
async function ss() {
  return ie("/ugsci/engines/detect/refresh", {
    method: "POST"
  });
}
function os({
  engine: e,
  onClick: t
}) {
  const l = P().React, { Card: a, Tag: n, Typography: s } = P().antd, { Text: r } = s, o = e.status === "detected", d = aa[e.category] || "📦", f = la.has(e.id) ? l.createElement("img", {
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
        Bt[e.category] || e.category
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
function rs() {
  const e = P().React, { useState: t, useEffect: l, useCallback: a, useMemo: n } = e, {
    Spin: s,
    Empty: r,
    Button: o,
    message: d,
    Row: c,
    Col: f,
    Drawer: w,
    Descriptions: S,
    Tag: v,
    Typography: b,
    Modal: E,
    Input: C,
    Select: B,
    Popconfirm: U,
    Space: N
  } = P().antd, {
    ReloadOutlined: te,
    SearchOutlined: G,
    PlusOutlined: W,
    EditOutlined: T,
    DeleteOutlined: x,
    CopyOutlined: I,
    ExperimentOutlined: Y
  } = P().antdIcons || {}, { Text: F, Paragraph: O } = b, [h, g] = t([]), [L, J] = t(!0), [K, oe] = t(""), [z, p] = t(!1), [u, M] = t(null), [ae, R] = t(!1), [q, se] = t(null), [X, Q] = t({}), [me, k] = t(!1), Z = a(async () => {
    J(!0);
    try {
      const le = await ts();
      g(le.engines || []);
    } catch (le) {
      d.error(le.message || "加载引擎列表失败"), g([]);
    } finally {
      J(!1);
    }
  }, []);
  l(() => {
    Z();
  }, [Z]);
  const m = n(() => {
    if (!K.trim()) return h;
    const le = K.toLowerCase();
    return h.filter(
      (D) => {
        var A;
        return D.name.toLowerCase().includes(le) || D.vendor.toLowerCase().includes(le) || D.category.toLowerCase().includes(le) || ((A = D.description) == null ? void 0 : A.toLowerCase().includes(le));
      }
    );
  }, [h, K]);
  h.filter((le) => le.status === "detected").length;
  const _ = a((le) => {
    navigator.clipboard.writeText(le).then(() => d.success("路径已复制")).catch(() => d.error("复制失败"));
  }, []), y = a(() => {
    se(null), Q({
      name: "",
      vendor: "",
      version: "",
      executable_path: "",
      category: "",
      description: "",
      invocation_hint: ""
    }), R(!0);
  }, []), ne = a((le) => {
    se(le), Q({ ...le }), R(!0), p(!1);
  }, []), de = a(async () => {
    var le;
    if (!((le = X.name) != null && le.trim())) {
      d.warning("请输入引擎名称");
      return;
    }
    k(!0);
    try {
      q ? (await as(q.id, X), d.success("引擎已更新")) : (await ns(X), d.success("引擎已添加")), R(!1), Z();
    } catch (D) {
      d.error(D.message || "保存失败");
    } finally {
      k(!1);
    }
  }, [X, q, Z]), fe = a(
    async (le) => {
      try {
        await ls(le), d.success("引擎已删除"), p(!1), Z();
      } catch (D) {
        d.error(D.message || "删除失败");
      }
    },
    [Z]
  ), Ee = a(async () => {
    J(!0);
    try {
      const le = await ss();
      g(le.engines || []), d.success("自动检测完成");
    } catch (le) {
      d.error(le.message || "检测失败");
    } finally {
      J(!1);
    }
  }, []), pe = a(
    (le, D, A) => {
      const V = X[D] || "";
      return e.createElement(
        "div",
        { style: { marginBottom: 12 } },
        e.createElement(
          F,
          { style: { fontSize: 13, display: "block", marginBottom: 4 } },
          le
        ),
        A != null && A.select ? e.createElement(B, {
          value: V || void 0,
          onChange: (re) => Q((H) => ({ ...H, [D]: re })),
          style: { width: "100%" },
          options: A.select.options,
          allowClear: !0,
          placeholder: `选择${le}`
        }) : A != null && A.textarea ? e.createElement(C.TextArea, {
          value: V,
          onChange: (re) => Q((H) => ({ ...H, [D]: re.target.value })),
          rows: 3,
          placeholder: `输入${le}`
        }) : e.createElement(C, {
          value: V,
          onChange: (re) => Q((H) => ({ ...H, [D]: re.target.value })),
          placeholder: `输入${le}`
        })
      );
    },
    [X]
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
      e.createElement(C, {
        placeholder: "搜索引擎名称、厂商...",
        prefix: G ? e.createElement(G) : void 0,
        value: K,
        onChange: (le) => oe(le.target.value),
        allowClear: !0,
        style: { maxWidth: 280 }
      }),
      e.createElement(
        o,
        {
          icon: te ? e.createElement(te) : void 0,
          onClick: Ee,
          loading: L
        },
        "自动检测"
      ),
      e.createElement(
        o,
        {
          type: "primary",
          icon: W ? e.createElement(W) : void 0,
          onClick: y,
          style: Oe
        },
        "添加引擎"
      )
    ),
    // Content
    L ? e.createElement(
      "div",
      { style: { textAlign: "center", padding: 60 } },
      e.createElement(s, {
        size: "large",
        tip: "正在加载计算引擎..."
      })
    ) : m.length === 0 ? e.createElement(r, {
      description: K ? "无匹配引擎" : "暂无引擎，点击「添加引擎」开始"
    }) : e.createElement(
      c,
      { gutter: [12, 12], align: "stretch" },
      ...m.map(
        (le) => e.createElement(
          f,
          {
            key: le.id,
            xs: 24,
            sm: 12,
            md: 8,
            lg: 6,
            style: { display: "flex" }
          },
          e.createElement(os, {
            engine: le,
            onClick: () => {
              M(le), p(!0);
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
        open: z,
        onClose: () => p(!1),
        width: 520,
        extra: e.createElement(
          N,
          null,
          e.createElement(
            o,
            {
              size: "small",
              icon: T ? e.createElement(T) : void 0,
              onClick: () => ne(u)
            },
            "编辑"
          ),
          u.is_default ? null : e.createElement(
            U,
            {
              title: "确认删除此引擎？",
              description: u.name,
              onConfirm: () => fe(u.id),
              okText: "删除",
              cancelText: "取消",
              okButtonProps: { danger: !0 }
            },
            e.createElement(
              o,
              {
                size: "small",
                danger: !0,
                icon: x ? e.createElement(x) : void 0
              },
              "删除"
            )
          )
        )
      },
      e.createElement(
        S,
        { column: 1, bordered: !0, size: "small" },
        e.createElement(
          S.Item,
          { label: "引擎名称" },
          u.name
        ),
        e.createElement(
          S.Item,
          { label: "厂商" },
          u.vendor || "—"
        ),
        e.createElement(
          S.Item,
          { label: "分类" },
          u.category ? Bt[u.category] || u.category : "—"
        ),
        e.createElement(
          S.Item,
          { label: "状态" },
          e.createElement(
            v,
            {
              color: u.status === "detected" ? "success" : u.status === "not_found" ? "error" : "default"
            },
            u.status === "detected" ? "✅ 已检测" : u.status === "not_found" ? "❌ 路径无效" : "🔧 待配置"
          )
        ),
        e.createElement(
          S.Item,
          { label: "版本" },
          u.version || "—"
        ),
        u.executable_path ? e.createElement(
          S.Item,
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
                icon: I ? e.createElement(I) : void 0,
                onClick: () => _(u.executable_path)
              }
            )
          )
        ) : null,
        u.install_dir ? e.createElement(
          S.Item,
          { label: "安装目录" },
          e.createElement(
            "code",
            { style: { fontSize: 12, wordBreak: "break-all" } },
            u.install_dir
          )
        ) : null,
        // Display detected modules with paths
        u.modules && u.modules.length > 0 ? e.createElement(
          S.Item,
          { label: "已检测模块" },
          e.createElement(
            "div",
            { style: { display: "flex", flexDirection: "column", gap: 4 } },
            ...u.modules.map(
              (le) => e.createElement(
                "div",
                {
                  key: le,
                  style: { display: "flex", alignItems: "center", gap: 8 }
                },
                e.createElement(
                  v,
                  { color: "cyan", style: { fontSize: 11 } },
                  le
                ),
                u.module_paths && u.module_paths[le] ? e.createElement(
                  "code",
                  { style: { fontSize: 11, wordBreak: "break-all" } },
                  u.module_paths[le]
                ) : null
              )
            )
          )
        ) : null,
        u.license_server ? e.createElement(
          S.Item,
          { label: "许可证服务器" },
          u.license_server
        ) : null,
        e.createElement(
          S.Item,
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
          v,
          { color: "blue" },
          "默认引擎"
        ) : u.is_custom ? e.createElement(
          v,
          { color: "purple" },
          "自定义引擎"
        ) : null
      )
    ) : null,
    // Add/Edit modal
    e.createElement(
      E,
      {
        title: q ? "编辑引擎" : "添加计算引擎",
        open: ae,
        onOk: de,
        onCancel: () => R(!1),
        okText: q ? "保存" : "添加",
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
            options: Object.entries(Bt).map(([le, D]) => ({
              label: D,
              value: le
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
function is() {
  const e = P().React, { useState: t, useEffect: l, useCallback: a, useMemo: n } = e, {
    Spin: s,
    Empty: r,
    Input: o,
    Button: d,
    message: c,
    Row: f,
    Col: w,
    Tabs: S,
    Modal: v
  } = P().antd, {
    ReloadOutlined: b,
    PlusOutlined: E,
    SearchOutlined: C,
    ApiOutlined: B,
    RocketOutlined: U
  } = P().antdIcons || {}, { TextArea: N } = o, G = P().useSelectedAgent, W = G ? G() : null, T = (W == null ? void 0 : W.id) || "default";
  l(() => {
    xt();
  }, [T]);
  const [x, I] = t([]), [Y, F] = t(!0), [O, h] = t(""), [g, L] = t("mcp"), [J, K] = t(!1), [oe, z] = t(`{
  "mcpServers": {
    "example-client": {
      "command": "npx",
      "args": ["-y", "@example/mcp-server"],
      "env": {}
    }
  }
}`), [p, u] = t(!1), M = a(async () => {
    F(!0);
    try {
      const m = await La(T);
      I(m);
    } catch (m) {
      c.error(m.message || "加载 MCP 列表失败"), I([]);
    } finally {
      F(!1);
    }
  }, [T]);
  l(() => {
    M();
  }, [M]);
  const ae = a(
    async (m) => {
      try {
        await ja(T, m.key), c.success(m.enabled ? "已禁用" : "已启用"), M();
      } catch (_) {
        c.error(_.message || "切换状态失败");
      }
    },
    [T, M]
  ), R = a(async (m) => {
    try {
      await Ba(T, m.key), c.success(`MCP「${m.key}」已删除`), M();
    } catch (_) {
      c.error(_.message || "删除失败");
    }
  }, [T, M]), q = a(async () => {
    u(!0);
    try {
      const m = JSON.parse(oe), _ = m.mcpServers || m, y = Object.entries(_);
      if (y.length === 0) {
        c.warning("未找到 MCP 客户端配置");
        return;
      }
      let ne = !0;
      for (const [de, fe] of y) {
        const Ee = fe, pe = Ee.url ? "streamable_http" : "stdio", le = {
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
          await Ua(
            T,
            de,
            le
          );
        } catch {
          ne = !1;
        }
      }
      ne && (c.success("MCP 客户端已创建"), K(!1), M());
    } catch (m) {
      m instanceof SyntaxError ? c.error("JSON 格式错误：" + m.message) : c.error(m.message || "创建 MCP 失败");
    } finally {
      u(!1);
    }
  }, [oe, T, M]), se = n(() => {
    if (!O.trim()) return x;
    const m = O.toLowerCase();
    return x.filter(
      (_) => {
        var y;
        return _.name.toLowerCase().includes(m) || _.key.toLowerCase().includes(m) || ((y = _.description) == null ? void 0 : y.toLowerCase().includes(m)) || _.transport.toLowerCase().includes(m);
      }
    );
  }, [x, O]), X = x.filter((m) => m.enabled).length, Q = x.reduce((m, _) => {
    var y;
    return m + (((y = _.tools) == null ? void 0 : y.length) || 0);
  }, 0), me = (m) => {
    window.history.pushState({}, "", m), window.dispatchEvent(new PopStateEvent("popstate"));
  }, k = e.createElement(
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
        prefix: C ? e.createElement(C) : void 0,
        value: O,
        onChange: (m) => h(m.target.value),
        allowClear: !0,
        style: { maxWidth: 400 }
      }),
      e.createElement(
        d,
        {
          type: "primary",
          icon: E ? e.createElement(E) : void 0,
          onClick: () => K(!0),
          style: Oe
        },
        "添加 MCP"
      ),
      e.createElement(
        d,
        {
          icon: B ? e.createElement(B) : void 0,
          onClick: () => me("/mcp")
        },
        "前往 MCP 管理"
      )
    ),
    Y ? e.createElement(
      "div",
      { style: { textAlign: "center", padding: 60 } },
      e.createElement(s, { size: "large" })
    ) : se.length === 0 ? e.createElement(r, {
      description: O ? "未找到匹配的能力" : "暂无 MCP 客户端，点击「添加 MCP」创建"
    }) : e.createElement(
      f,
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
          e.createElement(es, {
            mcp: m,
            agentId: T,
            onToggle: (_) => {
              _.stopPropagation(), ae(m);
            },
            onDelete: () => {
              R(m);
            },
            onUpdate: async (_, y) => {
              try {
                return await Na(T, _, y), c.success("MCP 配置已更新"), M(), !0;
              } catch (ne) {
                return c.error(ne.message || "更新 MCP 失败"), !1;
              }
            },
            onUpdatePolicy: async (_, y) => {
              try {
                return await Ga(T, _, y), c.success("访问策略已保存"), M(), !0;
              } catch (ne) {
                return c.error(ne.message || "保存访问策略失败"), !1;
              }
            },
            onRefresh: async () => {
              M();
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
        B ? e.createElement(B, { style: { fontSize: 14 } }) : null,
        "MCP 客户端"
      ),
      children: k
    },
    {
      key: "software",
      label: e.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        U ? e.createElement(U, { style: { fontSize: 14 } }) : null,
        "计算引擎"
      ),
      children: e.createElement(rs)
    }
  ];
  return e.createElement(
    "div",
    { style: { padding: 24 } },
    e.createElement(_t, {
      title: "工具",
      subtitle: `MCP: ${x.length} 个客户端（${X} 个启用）· ${Q} 个工具`,
      extra: e.createElement(
        e.Fragment,
        null,
        e.createElement(
          d,
          {
            icon: b ? e.createElement(b) : void 0,
            onClick: () => {
              et(), M();
            },
            loading: Y
          },
          "刷新"
        )
      )
    }),
    e.createElement(S, {
      items: Z,
      activeKey: g,
      onChange: (m) => L(m)
    }),
    // ── Create MCP Modal (mirror console /mcp JSON import) ──
    e.createElement(
      v,
      {
        title: "添加 MCP 客户端 (JSON)",
        open: J,
        onCancel: () => K(!1),
        onOk: q,
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
        value: oe,
        onChange: (m) => z(m.target.value),
        autoSize: { minRows: 12, maxRows: 20 },
        style: { fontFamily: "Monaco, Courier New, monospace", fontSize: 13 }
      })
    )
  );
}
function cs({
  agentId: e,
  agentName: t,
  onNavigate: l
}) {
  const a = P().React, { useState: n, useEffect: s, useCallback: r } = a, {
    Spin: o,
    Empty: d,
    Button: c,
    Row: f,
    Col: w,
    Card: S,
    Tag: v,
    Checkbox: b,
    Modal: E,
    Typography: C,
    Drawer: B,
    Descriptions: U,
    message: N
  } = P().antd, {
    ReloadOutlined: te,
    ThunderboltOutlined: G,
    SettingOutlined: W,
    CheckSquareOutlined: T,
    EyeOutlined: x,
    EyeInvisibleOutlined: I,
    DeleteOutlined: Y,
    CloseOutlined: F
  } = P().antdIcons || {}, { Text: O, Paragraph: h } = C, [g, L] = n([]), [J, K] = n(!0), [oe, z] = n(!1), [p, u] = n(null), [M, ae] = n(!1), [R, q] = n(
    /* @__PURE__ */ new Set()
  ), [se, X] = n(!1), [Q, me] = n(null), [k, Z] = n(!1), m = r(async () => {
    if (e) {
      K(!0);
      try {
        const A = await Tt(e);
        L(A);
      } catch (A) {
        N.error(A.message || "加载技能失败"), L([]);
      } finally {
        K(!1);
      }
    }
  }, [e]);
  s(() => {
    m();
  }, [m]);
  const _ = (A) => {
    q((V) => {
      const re = new Set(V);
      return re.has(A) ? re.delete(A) : re.add(A), re;
    });
  }, y = () => q(/* @__PURE__ */ new Set()), ne = () => q(new Set(g.map((A) => A.name))), de = () => {
    M ? (y(), ae(!1)) : ae(!0);
  }, fe = async () => {
    const A = Array.from(R);
    if (A.length !== 0) {
      X(!0);
      try {
        const { results: V } = await Za(e, A), re = Object.entries(V).filter(
          ([, ue]) => ue.success === !1
        ), H = A.length - re.length;
        re.length > 0 ? N.warning(
          `批量启用完成：成功 ${H} 个，失败 ${re.length} 个`
        ) : N.success(`成功启用 ${A.length} 个技能`), y(), await m();
      } catch (V) {
        N.error(V.message || "批量启用失败");
      } finally {
        X(!1);
      }
    }
  }, Ee = async () => {
    const A = Array.from(R);
    if (A.length !== 0) {
      X(!0);
      try {
        const { results: V } = await el(e, A), re = Object.entries(V).filter(
          ([, ue]) => ue.success === !1
        ), H = A.length - re.length;
        re.length > 0 ? N.warning(
          `批量停用完成：成功 ${H} 个，失败 ${re.length} 个`
        ) : N.success(`成功停用 ${A.length} 个技能`), y(), await m();
      } catch (V) {
        N.error(V.message || "批量停用失败");
      } finally {
        X(!1);
      }
    }
  }, pe = () => {
    const A = Array.from(R);
    A.length !== 0 && E.confirm({
      title: `确认删除 ${A.length} 个技能？`,
      content: "删除后技能将从当前专家工作区移除，此操作不可撤销。技能池中的原始技能不受影响。",
      okText: "确认删除",
      cancelText: "取消",
      okButtonProps: { danger: !0 },
      onOk: async () => {
        X(!0);
        try {
          const { results: V } = await tl(e, A), re = Object.entries(V).filter(
            ([, ue]) => ue.success === !1
          ), H = A.length - re.length;
          re.length > 0 ? N.warning(
            `批量删除完成：成功 ${H} 个，失败 ${re.length} 个`
          ) : N.success(`成功删除 ${A.length} 个技能`), y(), await m();
        } catch (V) {
          N.error(V.message || "批量删除失败");
        } finally {
          X(!1);
        }
      }
    });
  }, le = async (A) => {
    Z(!0);
    try {
      A.enabled === !1 ? (await Bn(e, A.name), N.success(`已启用技能「${A.name}」`)) : (await Dn(e, A.name), N.success(`已禁用技能「${A.name}」`)), await m();
    } catch (V) {
      N.error(V.message || "操作失败");
    } finally {
      Z(!1);
    }
  }, D = (A) => {
    E.confirm({
      title: `确认删除技能「${A.name}」？`,
      content: "删除后技能将从当前专家工作区移除，此操作不可撤销。技能池中的原始技能不受影响。",
      okText: "确认删除",
      cancelText: "取消",
      okButtonProps: { danger: !0 },
      onOk: async () => {
        Z(!0);
        try {
          await Ht(e, A.name), N.success(`已删除技能「${A.name}」`), await m();
        } catch (V) {
          N.error(V.message || "删除失败");
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
        O,
        { type: "secondary", style: { fontSize: 13 } },
        M ? `已选择 ${R.size} / ${g.length} 个技能` : `共 ${g.length} 个技能`
      ),
      a.createElement(
        "div",
        { style: { display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" } },
        M ? a.createElement(
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
              onClick: y
            },
            "取消选择"
          ),
          a.createElement(
            c,
            {
              size: "small",
              type: "default",
              icon: x ? a.createElement(x) : void 0,
              disabled: R.size === 0 || se,
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
              disabled: R.size === 0 || se,
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
              icon: Y ? a.createElement(Y) : void 0,
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
              icon: T ? a.createElement(T) : void 0,
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
                et(), m();
              }
            },
            "刷新"
          )
        )
      )
    ),
    J ? a.createElement(
      "div",
      { style: { textAlign: "center", padding: 60 } },
      a.createElement(o, { size: "large" })
    ) : g.length === 0 ? a.createElement(d, {
      description: "当前智能体未加载任何技能"
    }) : a.createElement(
      f,
      { gutter: [12, 12] },
      ...g.map(
        (A) => a.createElement(
          w,
          { key: A.name, xs: 24, sm: 12, md: 8, lg: 6 },
          a.createElement(
            S,
            {
              hoverable: !0,
              size: "small",
              style: {
                cursor: M ? "default" : "pointer",
                height: "100%",
                position: "relative",
                borderColor: M && R.has(A.name) ? "#0072f5" : void 0,
                borderWidth: M && R.has(A.name) ? 2 : 1
              },
              onClick: () => {
                M ? _(A.name) : (u(A), z(!0));
              },
              onMouseEnter: () => {
                M || me(A.name);
              },
              onMouseLeave: () => me(null)
            },
            M ? a.createElement(
              "div",
              {
                style: {
                  position: "absolute",
                  top: 8,
                  right: 8,
                  zIndex: 1
                },
                onClick: (V) => {
                  V.stopPropagation(), _(A.name);
                }
              },
              a.createElement(b, {
                checked: R.has(A.name)
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
              A.emoji ? a.createElement(
                "span",
                { style: { fontSize: 18 } },
                A.emoji
              ) : a.createElement(
                "span",
                { style: { fontSize: 18 } },
                "⚡"
              ),
              a.createElement(
                O,
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
                A.name
              ),
              A.enabled === !1 ? a.createElement(
                v,
                { color: "default", style: { fontSize: 10 } },
                "已禁用"
              ) : a.createElement(
                v,
                { color: "green", style: { fontSize: 10 } },
                "已启用"
              )
            ),
            A.description ? a.createElement(
              h,
              {
                type: "secondary",
                style: { fontSize: 11, margin: 0, lineHeight: 1.4 },
                ellipsis: { rows: 2 }
              },
              A.description
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
              A.version_text ? a.createElement(
                v,
                { style: { fontSize: 10 } },
                `v${A.version_text}`
              ) : null,
              ...(A.tags || []).slice(0, 3).map(
                (V, re) => a.createElement(
                  v,
                  { key: re, color: "blue", style: { fontSize: 10 } },
                  V
                )
              )
            ),
            // Hover action footer (not in batch mode)
            !M && Q === A.name ? a.createElement(
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
                  icon: A.enabled === !1 ? x ? a.createElement(x) : void 0 : I ? a.createElement(I) : void 0,
                  disabled: k,
                  onClick: (V) => {
                    V.stopPropagation(), le(A);
                  }
                },
                A.enabled === !1 ? "启用" : "禁用"
              ),
              a.createElement(
                c,
                {
                  size: "small",
                  danger: !0,
                  icon: Y ? a.createElement(Y) : void 0,
                  disabled: k,
                  onClick: (V) => {
                    V.stopPropagation(), D(A);
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
      B,
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
        open: oe,
        onClose: () => z(!1),
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
          O,
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
            (A, V) => a.createElement(v, { key: V, color: "blue" }, A)
          )
        )
      ) : null,
      // Skill content preview
      p.content ? a.createElement(
        "div",
        { style: { marginTop: 16 } },
        a.createElement(
          O,
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
function ms({
  poolSkills: e,
  workspaceSkills: t,
  agents: l,
  loading: a,
  onReload: n,
  agentId: s,
  agentName: r
}) {
  const o = P().React, { useState: d, useMemo: c, useCallback: f } = o, {
    Spin: w,
    Empty: S,
    Input: v,
    Button: b,
    Row: E,
    Col: C,
    Card: B,
    Tag: U,
    Typography: N,
    Drawer: te,
    Descriptions: G,
    List: W,
    Modal: T,
    message: x
  } = P().antd, {
    ReloadOutlined: I,
    SearchOutlined: Y,
    DownloadOutlined: F,
    ThunderboltOutlined: O,
    DeleteOutlined: h,
    PlusOutlined: g
  } = P().antdIcons || {}, { Text: L, Paragraph: J } = N, [K, oe] = d(""), [z, p] = d(!1), [u, M] = d(null), [ae, R] = d([]), [q, se] = d(!1), [X, Q] = d(24), [me, k] = d(null), [Z, m] = d(!1), _ = c(() => {
    if (!K.trim()) return e;
    const D = K.toLowerCase();
    return e.filter(
      (A) => {
        var V, re;
        return A.name.toLowerCase().includes(D) || ((V = A.description) == null ? void 0 : V.toLowerCase().includes(D)) || ((re = A.tags) == null ? void 0 : re.some((H) => H.toLowerCase().includes(D)));
      }
    );
  }, [e, K]), y = c(
    () => _.slice(0, X),
    [_, X]
  ), ne = f((D) => {
    oe(D), Q(24);
  }, []), de = f(
    (D) => {
      const A = [];
      for (const V of t)
        if (V.skills.some((re) => re.name === D)) {
          const re = l.find((H) => H.id === V.agent_id);
          A.push((re == null ? void 0 : re.name) || V.agent_name || V.agent_id);
        }
      return A;
    },
    [t, l]
  ), fe = f(
    async (D) => {
      if (M(D), R(de(D.name)), p(!0), !D.content) {
        se(!0);
        try {
          const A = await Ma(D.name);
          M({ ...D, content: A });
        } catch {
        } finally {
          se(!1);
        }
      }
    },
    [de]
  ), Ee = async (D) => {
    m(!0);
    try {
      await Gt(s, D.name), x.success(
        `已将技能「${D.name}」加载到当前专家「${r}」`
      ), n();
    } catch (A) {
      x.error(A.message || "加载技能失败");
    } finally {
      m(!1);
    }
  }, pe = (D) => {
    if (D.protected) {
      x.warning("内置技能不可删除");
      return;
    }
    T.confirm({
      title: `确认从技能池删除「${D.name}」？`,
      content: "删除后所有已安装此技能的专家将不受影响，但技能池中将不再包含此技能。此操作不可撤销。",
      okText: "确认删除",
      cancelText: "取消",
      okButtonProps: { danger: !0 },
      onOk: async () => {
        m(!0);
        try {
          await al(D.name), x.success(`已从技能池删除「${D.name}」`), n();
        } catch (A) {
          x.error(A.message || "删除失败");
        } finally {
          m(!1);
        }
      }
    });
  }, le = (D) => {
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
      o.createElement(v, {
        placeholder: "搜索技能名称、描述或标签...",
        prefix: Y ? o.createElement(Y) : void 0,
        value: K,
        onChange: (D) => ne(D.target.value),
        allowClear: !0,
        style: { maxWidth: 400 }
      }),
      o.createElement(
        "div",
        { style: { display: "flex", gap: 8 } },
        o.createElement(
          b,
          {
            icon: I ? o.createElement(I) : void 0,
            onClick: n,
            loading: a,
            size: "small"
          },
          "刷新"
        ),
        o.createElement(
          b,
          {
            type: "primary",
            icon: F ? o.createElement(F) : void 0,
            onClick: () => le("/skill-pool"),
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
    ) : _.length === 0 ? o.createElement(S, {
      description: K ? "未找到匹配的技能" : "技能池为空"
    }) : o.createElement(
      o.Fragment,
      null,
      o.createElement(
        E,
        { gutter: [12, 12] },
        ...y.map(
          (D) => o.createElement(
            C,
            { key: D.name, xs: 24, sm: 12, md: 8, lg: 6 },
            o.createElement(
              B,
              {
                hoverable: !0,
                size: "small",
                style: { cursor: "pointer", height: "100%" },
                onClick: () => fe(D),
                onMouseEnter: () => k(D.name),
                onMouseLeave: () => k(null)
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
                  L,
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
                J,
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
                  (A, V) => o.createElement(
                    U,
                    { key: V, color: "cyan", style: { fontSize: 10 } },
                    A
                  )
                )
              ),
              // Hover action footer
              me === D.name ? o.createElement(
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
                  b,
                  {
                    size: "small",
                    type: "primary",
                    icon: g ? o.createElement(g) : void 0,
                    disabled: Z,
                    onClick: (A) => {
                      A.stopPropagation(), Ee(D);
                    }
                  },
                  "加载到当前Agent"
                ),
                o.createElement(
                  b,
                  {
                    size: "small",
                    danger: !0,
                    icon: h ? o.createElement(h) : void 0,
                    disabled: Z || D.protected,
                    onClick: (A) => {
                      A.stopPropagation(), pe(D);
                    }
                  },
                  "删除"
                )
              ) : null
            )
          )
        ),
        // Load more button
        y.length < _.length ? o.createElement(
          "div",
          { style: { textAlign: "center", marginTop: 16 } },
          o.createElement(
            b,
            {
              onClick: () => Q((D) => D + 24),
              size: "small"
            },
            `加载更多 (剩余 ${_.length - y.length} 个)`
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
        open: z,
        onClose: () => p(!1),
        width: 520,
        extra: o.createElement(
          b,
          {
            type: "primary",
            size: "small",
            icon: O ? o.createElement(O) : void 0,
            onClick: () => le("/skills")
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
          L,
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
            (D, A) => o.createElement(U, { key: A, color: "cyan" }, D)
          )
        )
      ) : null,
      // Installed agents
      o.createElement(
        "div",
        { style: { marginTop: 16 } },
        o.createElement(
          L,
          { strong: !0, style: { display: "block", marginBottom: 8 } },
          `已安装此技能的专家 (${ae.length})`
        ),
        ae.length > 0 ? o.createElement(W, {
          size: "small",
          dataSource: ae,
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
                L,
                { style: { fontSize: 13 } },
                D
              )
            )
          )
        }) : o.createElement(
          L,
          { type: "secondary", style: { fontSize: 12 } },
          "暂无专家安装此技能"
        )
      ),
      // Skill content preview (lazy-loaded)
      q ? o.createElement(
        "div",
        { style: { marginTop: 16, textAlign: "center" } },
        o.createElement(w, { size: "small" })
      ) : u.content ? o.createElement(
        "div",
        { style: { marginTop: 16 } },
        o.createElement(
          L,
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
function ds() {
  const e = P().React, { useState: t, useEffect: l, useCallback: a, useMemo: n } = e, { Tabs: s, message: r } = P().antd, { ThunderboltOutlined: o, AppstoreOutlined: d } = P().antdIcons || {}, f = P().useSelectedAgent, w = f ? f() : null, S = (w == null ? void 0 : w.id) || "default";
  l(() => {
    xt();
  }, [S]);
  const [v, b] = t([]), [E, C] = t([]), [B, U] = t([]), [N, te] = t(!0), [G, W] = t("agent-skills"), T = a(async () => {
    te(!0);
    try {
      const [F, O, h] = await Promise.all([
        Ft(!0),
        Nt(),
        Ra()
      ]);
      C(F), b(O), U(h);
    } catch (F) {
      r.error(F.message || "加载技能列表失败"), C([]);
    } finally {
      te(!1);
    }
  }, []);
  l(() => {
    T();
  }, [T]);
  const x = n(() => {
    const F = v.find((O) => O.id === S);
    return (F == null ? void 0 : F.name) || S;
  }, [v, S]), I = (F) => {
    window.history.pushState({}, "", F), window.dispatchEvent(new PopStateEvent("popstate"));
  }, Y = [
    {
      key: "agent-skills",
      label: e.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        o ? e.createElement(o, { style: { fontSize: 14 } }) : null,
        "当前Agent加载技能"
      ),
      children: e.createElement(cs, {
        agentId: S,
        agentName: x,
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
      children: e.createElement(ms, {
        poolSkills: E,
        workspaceSkills: B,
        agents: v,
        loading: N,
        onReload: T,
        agentId: S,
        agentName: x
      })
    }
  ];
  return e.createElement(
    "div",
    { style: { padding: 24 } },
    e.createElement(_t, {
      title: "技能",
      subtitle: `技能池共 ${E.length} 个技能 · 当前智能体：${x}`
    }),
    e.createElement(s, {
      items: Y,
      activeKey: G,
      onChange: (F) => W(F)
    })
  );
}
const In = {
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
function us(e) {
  if (!e.env) return !1;
  const t = Object.entries(e.env);
  return t.length === 0 ? !1 : t.some(([, l]) => typeof l == "string" && l.length > 0);
}
const vt = "ugsci.market.githubSources", On = "https://github.com/anthropics/skills/tree/main/skills", oa = "https://ugsci-awesome-tools.oss-cn-beijing.aliyuncs.com", ps = `${oa}/skills`;
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
function gs(e) {
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
function fs() {
  return ca(ra, "mcp");
}
function ft(e) {
  ma(ra, e);
}
function ys() {
  return ca(ia, "expert");
}
function yt(e) {
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
function Es(e) {
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
function hs() {
  try {
    const e = localStorage.getItem(vt);
    if (!e) {
      const a = [], n = da(On);
      return n && a.push({
        id: ua(
          n.owner,
          n.repo,
          n.skillsPath,
          n.platform
        ),
        url: On,
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
      (a) => a && typeof a.id == "string" && (typeof a.owner == "string" || a.platform === "oss") && !(a.platform === "oss" && a.url === ps)
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
function vs(e) {
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
async function bs(e) {
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
      const f = e.skillsPath ? e.skillsPath + "/" : "", w = t ? `https://gitee.com/${e.owner}/${e.repo}/raw/${e.ref}/${f}${c.name}/SKILL.md` : `https://raw.githubusercontent.com/${e.owner}/${e.repo}/${e.ref}/${f}${c.name}/SKILL.md`, S = t ? `https://gitee.com/${e.owner}/${e.repo}/tree/${e.ref}/${f}${c.name}` : `https://github.com/${e.owner}/${e.repo}/tree/${e.ref}/${f}${c.name}`, v = {
        sourceId: e.id,
        sourceLabel: e.label,
        name: c.name,
        description: "",
        source_url: S,
        html_url: S,
        version: null,
        author: null
      };
      try {
        const b = {};
        t && e.accessToken && (b.Authorization = `token ${e.accessToken}`);
        const E = await fetch(w, {
          headers: b
        });
        if (!E.ok) return v;
        const C = await E.text(), B = vs(C);
        return {
          ...v,
          name: B.name || c.name,
          description: B.description || "",
          version: B.version || null,
          author: B.author || null
        };
      } catch {
        return v;
      }
    })
  );
}
async function Ss(e) {
  const t = Es(e.url);
  if (!t)
    throw new Error(`Invalid OSS URL: ${e.url}`);
  const { endpoint: l, prefix: a } = t, n = a.split("/").map(encodeURIComponent).join("/"), s = ct(`${n}/manifest.json`), r = await fetch(s);
  if (!r.ok)
    throw new Error(
      `无法获取技能列表: manifest.json (${r.status})`
    );
  const o = await r.json(), d = [];
  if (o && o.tag_groups && typeof o.tag_groups == "object")
    for (const [w, S] of Object.entries(o.tag_groups))
      Array.isArray(S) && d.push({
        id: w,
        label: mt(w),
        tags: S
      });
  const c = [];
  function f(w, S) {
    for (const v of w) {
      if (v.type === "collection" && Array.isArray(v.children)) {
        f(v.children, v.name);
        continue;
      }
      const b = v.path || v.name || "";
      if (!b) continue;
      const E = b.split("/").map(encodeURIComponent).join("/"), C = `${l}/${n}/${E}`;
      let B = null;
      if (v.metadata) {
        const N = v.metadata.match(/version:\s*"?([\d.]+)"?/);
        N && (B = N[1]);
      }
      const U = S ? `${e.label}/${S}` : e.label;
      c.push({
        sourceId: e.id,
        sourceLabel: e.label,
        sourcePath: U,
        name: v.name || b.split("/").pop() || b,
        description: v.description || "",
        source_url: C,
        html_url: C,
        version: B,
        author: null,
        tag: v.tag || void 0,
        isOfficial: !0
      });
    }
  }
  if (Array.isArray(o) ? f(
    o.map(
      (w) => typeof w == "string" ? { name: w, path: w } : w
    )
  ) : o && Array.isArray(o.skills) && f(o.skills), c.length === 0)
    throw new Error(
      `manifest.json 中未找到技能。请检查 ${e.url}/manifest.json`
    );
  return { skills: c, categories: d };
}
async function ws() {
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
async function Cs() {
  const e = await qt("skills/manifest.json"), t = [], l = /* @__PURE__ */ new Set();
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
      let w = null;
      if (typeof r.metadata == "string") {
        const S = r.metadata.match(/version:\s*"?([\d.]+)"?/);
        S && (w = S[1]);
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
async function xs() {
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
async function ks(e) {
  const t = e.filter((r) => r.enabled), l = await Promise.all(
    t.map(async (r) => {
      try {
        if (r.platform === "oss") {
          const { skills: o, categories: d } = await Ss(r);
          return { skills: o, categories: d, error: null, label: r.label };
        } else
          return { skills: await bs(r), categories: [], error: null, label: r.label };
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
function _s({
  open: e,
  onClose: t,
  sources: l,
  onChange: a
}) {
  const n = P().React, { useState: s } = n, {
    Modal: r,
    Input: o,
    Button: d,
    List: c,
    Tag: f,
    Switch: w,
    Typography: S,
    Tooltip: v,
    message: b
  } = P().antd, {
    PlusOutlined: E,
    DeleteOutlined: C,
    LinkOutlined: B,
    GithubOutlined: U
  } = P().antdIcons || {}, { Text: N } = S, [te, G] = s(""), [W, T] = s(""), x = () => {
    const O = te.trim();
    if (!O) return;
    const h = da(O);
    if (!h) {
      b.error("无效的仓库 URL，请输入类似 https://github.com/owner/repo/tree/main/skills 或 https://gitee.com/owner/repo/tree/master/skills 的链接");
      return;
    }
    const g = ua(h.owner, h.repo, h.skillsPath, h.platform);
    if (l.some((K) => K.id === g)) {
      b.warning("该源已存在");
      return;
    }
    const L = {
      id: g,
      url: O,
      label: h.label,
      owner: h.owner,
      repo: h.repo,
      ref: h.ref,
      skillsPath: h.skillsPath,
      enabled: !0,
      platform: h.platform,
      accessToken: W.trim() || void 0
    }, J = [...l, L];
    Et(J), a(J), G(""), T(""), b.success(`已添加源: ${h.label}`);
  }, I = (O, h) => {
    const g = l.map(
      (L) => L.id === O ? { ...L, enabled: h } : L
    );
    Et(g), a(g);
  }, Y = (O, h) => {
    const g = l.map(
      (L) => L.id === O ? { ...L, accessToken: h.trim() || void 0 } : L
    );
    Et(g), a(g);
  }, F = (O) => {
    const h = l.filter((g) => g.id !== O);
    Et(h), a(h), b.success("已移除源");
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
          onChange: (O) => G(O.target.value),
          onPressEnter: x,
          prefix: B ? n.createElement(B) : void 0,
          style: { flex: 1 }
        }),
        n.createElement(
          d,
          {
            type: "primary",
            icon: E ? n.createElement(E) : void 0,
            onClick: x
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
          onChange: (O) => T(O.target.value),
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
      renderItem: (O) => n.createElement(
        c.Item,
        {
          actions: [
            n.createElement(
              v,
              { title: O.enabled ? "点击禁用" : "点击启用" },
              n.createElement(w, {
                size: "small",
                checked: O.enabled,
                onChange: (h) => I(O.id, h)
              })
            ),
            n.createElement(
              v,
              { title: "移除此源" },
              n.createElement(
                d,
                {
                  size: "small",
                  type: "text",
                  danger: !0,
                  icon: C ? n.createElement(C) : void 0,
                  onClick: () => F(O.id)
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
              { color: O.platform === "gitee" ? "orange" : O.platform === "oss" ? "green" : "blue", style: { fontSize: 11 } },
              O.platform === "gitee" ? "Gitee" : O.platform === "oss" ? "OSS" : "GitHub"
            ),
            n.createElement(
              f,
              { style: { fontSize: 11 } },
              O.label
            ),
            O.skillsPath ? n.createElement(
              N,
              { type: "secondary", style: { fontSize: 11 } },
              `/${O.skillsPath}`
            ) : null,
            O.platform !== "oss" ? n.createElement(
              N,
              { type: "secondary", style: { fontSize: 11 } },
              `@${O.ref}`
            ) : null
          ),
          n.createElement(
            N,
            {
              type: "secondary",
              style: { fontSize: 11, wordBreak: "break-all" }
            },
            O.url
          ),
          // Gitee token input for existing Gitee sources
          O.platform === "gitee" ? n.createElement(
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
              value: O.accessToken || "",
              onChange: (h) => Y(O.id, h.target.value),
              style: { flex: 1 }
            })
          ) : null
        )
      )
    })
  );
}
function An({
  open: e,
  onClose: t,
  sources: l,
  onChange: a,
  type: n
}) {
  const s = P().React, { useState: r } = s, {
    Modal: o,
    Input: d,
    Button: c,
    List: f,
    Tag: w,
    Switch: S,
    Typography: v,
    Tooltip: b,
    message: E
  } = P().antd, {
    PlusOutlined: C,
    DeleteOutlined: B,
    LinkOutlined: U,
    ApiOutlined: N,
    UserOutlined: te,
    ImportOutlined: G,
    ExportOutlined: W,
    CopyOutlined: T
  } = P().antdIcons || {}, { Text: x } = v, [I, Y] = r(""), [F, O] = r(""), [h, g] = r(""), [L, J] = r(!1), K = n === "mcp" ? "MCP" : "专家模板", oe = n === "mcp" ? N ? s.createElement(N, { style: { fontSize: 18 } }) : null : te ? s.createElement(te, { style: { fontSize: 18 } }) : null, z = () => {
    const R = I.trim(), q = F.trim();
    if (!R) return;
    const se = q || R.slice(0, 40), X = `${n}:${R}`;
    if (l.some((k) => k.id === X)) {
      E.warning("该源已存在");
      return;
    }
    const Q = {
      id: X,
      label: se,
      url: R,
      enabled: !0,
      type: n
    }, me = [...l, Q];
    n === "mcp" ? ft(me) : yt(me), a(me), Y(""), O(""), E.success(`已添加${K}源: ${se}`);
  }, p = (R, q) => {
    const se = l.map(
      (X) => X.id === R ? { ...X, enabled: q } : X
    );
    n === "mcp" ? ft(se) : yt(se), a(se);
  }, u = (R) => {
    const q = l.filter((se) => se.id !== R);
    n === "mcp" ? ft(q) : yt(q), a(q), E.success("已移除源");
  }, M = () => {
    const R = JSON.stringify(
      { type: n, sources: l },
      null,
      2
    );
    try {
      navigator.clipboard.writeText(R), E.success(`${K}源已复制到剪贴板（${l.length} 个源）`);
    } catch {
      const q = document.createElement("textarea");
      q.value = R, document.body.appendChild(q), q.select(), document.execCommand("copy"), document.body.removeChild(q), E.success(`${K}源已复制到剪贴板（${l.length} 个源）`);
    }
  }, ae = () => {
    const R = h.trim();
    if (!R) {
      E.warning("请粘贴 JSON 内容");
      return;
    }
    try {
      const q = JSON.parse(R);
      let se = [];
      if (Array.isArray(q))
        se = q;
      else if (q && Array.isArray(q.sources))
        se = q.sources;
      else if (q && typeof q == "object")
        se = [q];
      else
        throw new Error("Invalid format");
      const X = se.filter(
        (Z) => Z && typeof Z.url == "string" && typeof Z.label == "string"
      );
      if (X.length === 0) {
        E.error("未找到有效的源数据");
        return;
      }
      const Q = new Set(l.map((Z) => Z.id)), me = [];
      for (const Z of X) {
        const m = Z.id || `${n}:${Z.url}`;
        Q.has(m) || me.push({
          id: m,
          label: Z.label,
          url: Z.url,
          enabled: Z.enabled !== !1,
          type: n
        });
      }
      if (me.length === 0) {
        E.info("所有源均已存在，无新增");
        return;
      }
      const k = [...l, ...me];
      n === "mcp" ? ft(k) : yt(k), a(k), g(""), J(!1), E.success(`成功导入 ${me.length} 个${K}源`);
    } catch (q) {
      E.error(`JSON 解析失败: ${q.message || "格式错误"}`);
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
        oe,
        s.createElement("span", null, `配置${K}源`)
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
              onClick: M,
              disabled: l.length === 0,
              size: "small"
            },
            "导出到剪贴板"
          ),
          s.createElement(
            c,
            {
              icon: G ? s.createElement(G) : void 0,
              onClick: () => J(!L),
              size: "small"
            },
            L ? "隐藏导入" : "导入JSON"
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
      x,
      { type: "secondary", style: { fontSize: 12, display: "block", marginBottom: 12 } },
      `配置${K}源地址，支持从远程仓库或团队共享的 JSON 导入${K}配置。`
    ),
    // Import section (collapsible)
    L ? s.createElement(
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
        x,
        { strong: !0, style: { fontSize: 12, display: "block", marginBottom: 8 } },
        `粘贴${K}源 JSON（支持从导出的剪贴板内容粘贴）`
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
            onClick: ae
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
        onChange: (R) => O(R.target.value),
        style: { width: 200 }
      }),
      s.createElement(d, {
        placeholder: n === "mcp" ? "https://raw.githubusercontent.com/team/mcp-registry/main/mcp.json" : "https://raw.githubusercontent.com/team/expert-registry/main/experts.json",
        value: I,
        onChange: (R) => Y(R.target.value),
        onPressEnter: z,
        prefix: U ? s.createElement(U) : void 0,
        style: { flex: 1 }
      }),
      s.createElement(
        c,
        {
          type: "primary",
          icon: C ? s.createElement(C) : void 0,
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
        x,
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
              b,
              { title: R.enabled ? "点击禁用" : "点击启用" },
              s.createElement(S, {
                size: "small",
                checked: R.enabled,
                onChange: (q) => p(R.id, q)
              })
            ),
            s.createElement(
              b,
              { title: "移除此源" },
              s.createElement(
                c,
                {
                  size: "small",
                  type: "text",
                  danger: !0,
                  icon: B ? s.createElement(B) : void 0,
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
            x,
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
async function Ts() {
  return ie("/market/providers");
}
async function zs(e) {
  return ie(
    `/market/categories?lang=${encodeURIComponent(e)}`
  );
}
async function Is(e, t, l, a, n) {
  return ie("/market/search", {
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
function Pn(e) {
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
async function $n(e, t) {
  const l = { bundle_url: e };
  return t && (l.access_token = t), ie("/skills/pool/import", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(l)
  });
}
function Os() {
  const e = P().React, { useState: t, useEffect: l, useCallback: a, useMemo: n, useRef: s } = e, {
    Spin: r,
    Empty: o,
    Input: d,
    Button: c,
    message: f,
    Row: w,
    Col: S,
    Card: v,
    Tag: b,
    Tooltip: E,
    Typography: C,
    Select: B,
    Drawer: U,
    Descriptions: N,
    Tabs: te,
    Badge: G,
    Progress: W,
    Modal: T,
    Alert: x
  } = P().antd, {
    ReloadOutlined: I,
    SearchOutlined: Y,
    DownloadOutlined: F,
    AppstoreOutlined: O,
    ShopOutlined: h,
    CheckCircleOutlined: g,
    LoadingOutlined: L,
    UserOutlined: J,
    SettingOutlined: K,
    GithubOutlined: oe,
    ApiOutlined: z
  } = P().antdIcons || {}, { Text: p, Paragraph: u, Title: M } = C, [ae, R] = t("skills"), [q, se] = t([]), [X, Q] = t([]), [me, k] = t([]), [Z, m] = t(""), [_, y] = t(""), [ne, de] = t(!1), [fe, Ee] = t(!1), [pe, le] = t(
    {}
  ), [D, A] = t(null), [V, re] = t({}), [H, ue] = t([]), [ve, we] = t(""), [xe, ze] = t(""), [Ae, He] = t(""), [tt, nt] = t({}), [$e, at] = t(""), [dt, We] = t(/* @__PURE__ */ new Set()), [_e, Ie] = t(null), [ke, ee] = t({}), [Ce, Se] = t([]), [Te, Je] = t([]), [lt, he] = t([]), [It, ut] = t(""), [st, Pe] = t(!1), [pa, Vt] = t(!1), [ga, Yt] = t([]), [fa, Qt] = t(!1), [ya, Zt] = t([]), [Ea, en] = t(!1), [tn, nn] = t([]), [an, ln] = t([]), [sn, on] = t(!1), [Xe, rn] = t(""), [cn, mn] = t([]), [dn, un] = t([]), [pn, gn] = t(!1), [Ke, fn] = t(""), [Ot, yn] = t(!1), [ot, ha] = t([]), rt = s(null);
  l(() => {
    Promise.all([
      Ts().catch(() => []),
      zs("zh").catch(() => []),
      Nt().catch(() => [])
    ]).then(([i, $, j]) => {
      se(i), Q($), ue(j), j.length > 0 && (we(j[0].id), at(j[0].id));
    });
  }, []);
  const pt = a(async (i) => {
    const $ = i ?? hs();
    if (Se(i || $), $.filter((ce) => ce.enabled).length === 0) {
      Je([]);
      return;
    }
    Pe(!0);
    try {
      const { skills: ce, errors: ge, categories: be } = await ks($);
      if (Je(ce), ha(be), ge.length > 0) {
        for (const ye of ge)
          console.warn(`[ugsci] GitHub source '${ye.label}' error: ${ye.message}`);
        f.warning(
          `部分源加载失败: ${ge.map((ye) => ye.label).join(", ")}`
        );
      }
    } catch (ce) {
      f.error(ce.message || "加载技能源失败"), Je([]);
    } finally {
      Pe(!1);
    }
  }, []), At = a(async () => {
    var ce, ge, be;
    on(!0), gn(!0), Pe(!0);
    const [i, $, j] = await Promise.allSettled([
      ws(),
      xs(),
      Cs()
    ]);
    if (i.status === "fulfilled" ? (nn(i.value.servers), ln(i.value.categories)) : (console.warn(`[ugsci] MCP manifest error: ${((ce = i.reason) == null ? void 0 : ce.message) || i.reason}`), nn([]), ln([])), on(!1), $.status === "fulfilled" ? (mn($.value.agents), un($.value.categories)) : (console.warn(`[ugsci] Agents manifest error: ${((ge = $.reason) == null ? void 0 : ge.message) || $.reason}`), mn([]), un([])), gn(!1), j.status === "fulfilled")
      he(j.value.skills), ut("");
    else {
      const ye = ((be = j.reason) == null ? void 0 : be.message) || String(j.reason);
      console.warn(`[ugsci] Skills manifest error: ${ye}`), he([]), ut(ye);
    }
    Pe(!1);
  }, []);
  l(() => {
    pt(), At(), Yt(fs()), Zt(ys());
  }, [pt, At]);
  const gt = a(
    async (i, $, j) => {
      de(!0);
      try {
        const ce = await Is(
          i,
          j,
          20,
          "zh",
          $ || void 0
        );
        j === void 0 || Object.keys(j).length === 0 ? k(ce.results) : k((ye) => [...ye, ...ce.results]);
        const ge = Object.values(ce.by_provider || {}).some(
          (ye) => ye.has_more
        );
        Ee(ge);
        const be = {};
        for (const [ye, Be] of Object.entries(ce.by_provider || {}))
          be[ye] = (j[ye] || 1) + 1;
        if (le(be), ce.errors.length > 0)
          for (const ye of ce.errors)
            console.warn(
              `[ugsci] Market provider '${ye.provider}' error: ${ye.message}`
            );
      } catch (ce) {
        f.error(ce.message || "搜索市场失败"), k([]);
      } finally {
        de(!1);
      }
    },
    []
  );
  l(() => (rt.current && clearTimeout(rt.current), rt.current = setTimeout(() => {
    gt(Z, _, {});
  }, 400), () => {
    rt.current && clearTimeout(rt.current);
  }), [Z, _, gt]);
  const va = () => {
    gt(Z, _, pe);
  }, En = async (i) => {
    const $ = `${i.source}:${i.slug}`;
    try {
      re((ce) => ({ ...ce, [$]: "installing" }));
      const j = await $n(i.source_url);
      j.installed && f.success(
        `技能「${j.name || i.name}」已安装到技能池，可在技能中心查看`
      ), re((ce) => {
        const ge = { ...ce };
        return delete ge[$], ge;
      });
    } catch (j) {
      f.error(Pn(j) || "安装技能失败"), re((ce) => {
        const ge = { ...ce };
        return delete ge[$], ge;
      });
    }
  }, ba = (i) => {
    window.history.pushState({}, "", i), window.dispatchEvent(new PopStateEvent("popstate"));
  }, Sa = async (i) => {
    const $ = `github:${i.sourceId}:${i.name}`, j = Ce.find((ge) => ge.id === i.sourceId), ce = (j == null ? void 0 : j.accessToken) || void 0;
    try {
      re((be) => ({ ...be, [$]: "installing" }));
      const ge = await $n(i.source_url, ce);
      ge.installed && f.success(
        `技能「${ge.name || i.name}」已安装到技能池，可在技能中心查看`
      ), re((be) => {
        const ye = { ...be };
        return delete ye[$], ye;
      });
    } catch (ge) {
      f.error(Pn(ge) || "安装技能失败"), re((be) => {
        const ye = { ...be };
        return delete ye[$], ye;
      });
    }
  }, Fe = n(() => {
    const i = [], $ = /* @__PURE__ */ new Set();
    for (const j of [...lt, ...Te]) {
      const ce = j.source_url || `${j.sourceLabel}:${j.name}`;
      $.has(ce) || ($.add(ce), i.push(j));
    }
    return i;
  }, [lt, Te]), hn = n(() => {
    const i = [], $ = /* @__PURE__ */ new Set();
    if (ot.length > 0)
      for (const j of ot)
        $.has(j.id) || ($.add(j.id), i.push(j));
    for (const j of Fe)
      j.tag && !$.has(j.tag) && ($.add(j.tag), i.push({ id: j.tag, label: j.tag }));
    for (const j of Fe)
      !j.isOfficial && j.sourceLabel && !$.has(j.sourceLabel) && ($.add(j.sourceLabel), i.push({ id: j.sourceLabel, label: j.sourceLabel }));
    return i;
  }, [Fe, ot]), Pt = n(() => {
    let i = Fe;
    if (_) {
      const $ = ot.find((j) => j.id === _);
      $ && $.tags ? i = i.filter(
        (j) => j.tag && $.tags.includes(j.tag) || j.sourceLabel === _
      ) : i = i.filter(
        (j) => j.tag === _ || j.sourceLabel === _
      );
    }
    if (Z.trim()) {
      const $ = Z.toLowerCase();
      i = i.filter(
        (j) => {
          var ce;
          return j.name.toLowerCase().includes($) || ((ce = j.description) == null ? void 0 : ce.toLowerCase().includes($));
        }
      );
    }
    return i;
  }, [Fe, Z, _, ot]), vn = q.filter((i) => i.available), qe = n(() => _ ? me.filter((i) => {
    const $ = vn.find((j) => j.key === i.source);
    return ($ == null ? void 0 : $.label) === _;
  }) : me, [me, _, vn]), wa = e.createElement(
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
        prefix: Y ? e.createElement(Y) : void 0,
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
          icon: oe ? e.createElement(oe) : void 0,
          onClick: () => Vt(!0),
          size: "small"
        },
        "配置技能源"
      )
    ),
    // Dynamic category filter tags (from OSS manifest tags + imported sources)
    It && Fe.length === 0 ? e.createElement(x, {
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
        b,
        {
          style: {
            fontSize: 11,
            cursor: "pointer",
            borderRadius: 12
          },
          color: _ === "" ? "blue" : void 0,
          onClick: () => y("")
        },
        "全部"
      ),
      ...hn.map((i) => {
        const $ = Te.some(
          (j) => !j.isOfficial && j.sourceLabel === i.id
        );
        return e.createElement(
          b,
          {
            key: i.id,
            style: {
              fontSize: 11,
              cursor: "pointer",
              borderRadius: 12
            },
            color: _ === i.id ? $ ? "blue" : "geekblue" : void 0,
            icon: $ && oe ? e.createElement(oe) : void 0,
            onClick: () => y(
              _ === i.id ? "" : i.id
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
    ) : Pt.length > 0 ? e.createElement(
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
        oe ? e.createElement(oe, {
          style: { fontSize: 14, color: "#1677ff" }
        }) : null,
        e.createElement(
          p,
          { strong: !0, style: { fontSize: 13 } },
          `技能市场 (${Pt.length})`
        )
      ),
      e.createElement(
        w,
        { gutter: [12, 12] },
        ...Pt.map((i) => {
          const $ = `github:${i.sourceId}:${i.name}`, j = V[$];
          return e.createElement(
            S,
            { key: $, xs: 24, sm: 12, md: 8, lg: 6 },
            e.createElement(
              v,
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
                oe ? e.createElement(oe, {
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
                    z ? e.createElement(z, { style: { fontSize: 10 } }) : null,
                    i.sourcePath || i.sourceLabel
                  ) : null,
                  // Show tag as category badge
                  i.tag ? e.createElement(
                    b,
                    { color: "geekblue", style: { fontSize: 10 } },
                    i.tag
                  ) : null,
                  i.version ? e.createElement(
                    b,
                    { style: { fontSize: 10 } },
                    `v${i.version}`
                  ) : null
                ),
                j ? e.createElement(
                  c,
                  {
                    size: "small",
                    disabled: !0,
                    icon: L ? e.createElement(L) : void 0
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
    qe.length > 0 || ne ? e.createElement(
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
        p,
        { strong: !0, style: { fontSize: 13 } },
        `技能市场${qe.length > 0 ? ` (${qe.length})` : ""}`
      )
    ) : null,
    // Results grid
    ne && qe.length === 0 ? e.createElement(
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
        const $ = `${i.source}:${i.slug}`, j = V[$];
        return e.createElement(
          S,
          { key: $, xs: 24, sm: 12, md: 8, lg: 6 },
          e.createElement(
            v,
            {
              hoverable: !0,
              size: "small",
              style: { height: "100%", cursor: "pointer" },
              onClick: () => A(i)
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
                  b,
                  { color: "geekblue", style: { fontSize: 10 } },
                  i.source
                ),
                i.version ? e.createElement(
                  b,
                  { style: { fontSize: 10 } },
                  `v${i.version}`
                ) : null
              ),
              j ? e.createElement(
                c,
                {
                  size: "small",
                  disabled: !0,
                  icon: L ? e.createElement(L) : void 0
                },
                "安装中"
              ) : e.createElement(
                c,
                {
                  type: "primary",
                  size: "small",
                  icon: F ? e.createElement(F) : void 0,
                  onClick: (ce) => {
                    ce.stopPropagation(), En(i);
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
    fe && !ne ? e.createElement(
      "div",
      { style: { textAlign: "center", marginTop: 16 } },
      e.createElement(
        c,
        { onClick: va, loading: ne },
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
        onClose: () => A(null),
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
            ([i, $]) => e.createElement(
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
                String($)
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
  ), $t = n(() => {
    let i = cn;
    if (Ke && (i = i.filter(($) => $.category === Ke)), xe.trim()) {
      const $ = xe.toLowerCase();
      i = i.filter(
        (j) => j.name.toLowerCase().includes($) || j.description.toLowerCase().includes($) || j.tags.some((ce) => ce.toLowerCase().includes($))
      );
    }
    return i;
  }, [cn, xe, Ke]), Ca = async (i) => {
    if (!Ot) {
      yn(!0);
      try {
        let $ = i.description;
        if (i.instructions)
          try {
            const ge = i.instructions.replace(/^\/+/, ""), be = await fetch(ct(ge));
            be.ok && ($ = await be.text());
          } catch {
          }
        let j = [];
        if (i.skills_manifest)
          try {
            const ge = i.skills_manifest.replace(/^\/+/, ""), be = await fetch(ct(ge));
            if (be.ok) {
              const ye = await be.json();
              Array.isArray(ye) ? j = ye.map((Be) => typeof Be == "string" ? Be : Be.name).filter(Boolean) : ye.skills && (j = ye.skills.map((Be) => typeof Be == "string" ? Be : Be.name).filter(Boolean));
            }
          } catch {
          }
        const ce = await ie("/agents", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: i.name,
            description: i.description,
            skill_names: j
          })
        });
        await St(ce.id, "AGENTS.md", $), f.success(`专家「${i.name}」创建成功，已跳转至专家`), ba("/ugsci-experts");
      } catch ($) {
        f.error($.message || "创建专家失败");
      } finally {
        yn(!1);
      }
    }
  }, bn = a(async (i) => {
    if (i)
      try {
        const $ = await Wt(i);
        We(new Set($.map((j) => j.key)));
      } catch {
        We(/* @__PURE__ */ new Set());
      }
  }, []);
  l(() => {
    $e && bn($e);
  }, [$e, bn]);
  const xa = async (i) => {
    if (!$e) {
      f.warning("请先选择目标专家");
      return;
    }
    if (us(i)) {
      const $ = Object.entries(i.env), j = {};
      for (const [ce] of $)
        j[ce] = "";
      ee(j), Ie(i);
      return;
    }
    await Sn(i, i.env || {});
  }, Sn = async (i, $) => {
    nt((j) => ({ ...j, [i.id]: !0 }));
    try {
      const j = i.id;
      await Nn($e, {
        client_key: j,
        client: {
          name: i.name,
          description: i.description,
          enabled: !0,
          transport: i.transport,
          url: i.url || "",
          command: i.command || "",
          args: i.args || [],
          env: $,
          cwd: i.cwd || "",
          headers: i.headers || {}
        }
      }), f.success(`MCP「${i.name}」已添加到当前专家`), We((ce) => new Set(ce).add(j));
    } catch (j) {
      f.error(j.message || `添加 MCP「${i.name}」失败`);
    } finally {
      nt((j) => ({ ...j, [i.id]: !1 }));
    }
  }, ka = async () => {
    if (!_e) return;
    const i = [];
    for (const [j, ce] of Object.entries(ke))
      if (!ce || !ce.trim()) {
        const ge = In[j];
        i.push((ge == null ? void 0 : ge.label) || j);
      }
    if (i.length > 0) {
      f.warning(`请填写以下配置项: ${i.join(", ")}`);
      return;
    }
    const $ = _e;
    Ie(null), ee({}), await Sn($, { ...ke });
  }, Mt = n(() => {
    let i = tn;
    if (Xe && (i = i.filter(($) => $.category === Xe)), Ae.trim()) {
      const $ = Ae.toLowerCase();
      i = i.filter(
        (j) => j.name.toLowerCase().includes($) || j.description.toLowerCase().includes($) || j.tags.some((ce) => ce.toLowerCase().includes($))
      );
    }
    return i.map(gs);
  }, [tn, Ae, Xe]), _a = e.createElement(
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
        prefix: Y ? e.createElement(Y) : void 0,
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
        e.createElement(B, {
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
          icon: z ? e.createElement(z) : void 0,
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
        b,
        {
          style: { fontSize: 11, cursor: "pointer", borderRadius: 12 },
          color: Xe === "" ? "blue" : void 0,
          onClick: () => rn("")
        },
        "全部"
      ),
      ...an.map(
        (i) => e.createElement(
          b,
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
    sn && Mt.length === 0 ? e.createElement(
      "div",
      { style: { textAlign: "center", padding: 40 } },
      e.createElement(r, { size: "large" }, e.createElement("div", { style: { minHeight: 60, display: "flex", alignItems: "center", justifyContent: "center" } }, "正在加载 MCP 服务器..."))
    ) : Mt.length === 0 ? e.createElement(o, {
      description: "未找到匹配的 MCP 服务器",
      image: o.PRESENTED_IMAGE_SIMPLE
    }) : e.createElement(
      w,
      { gutter: [12, 12] },
      ...Mt.map(
        (i) => e.createElement(
          S,
          { key: i.id, xs: 24, sm: 12, md: 8 },
          e.createElement(
            v,
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
                  onError: ($) => {
                    $.target.style.display = "none";
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
                    b,
                    { color: "blue", style: { fontSize: 10 } },
                    i.category
                  ),
                  e.createElement(
                    b,
                    {
                      color: i.transport === "stdio" ? "purple" : "cyan",
                      style: { fontSize: 10 }
                    },
                    i.transport
                  ),
                  i.env && Object.keys(i.env).length > 0 ? e.createElement(
                    b,
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
                  icon: z ? e.createElement(z) : void 0,
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
      h ? e.createElement(h, {
        style: { fontSize: 24, color: "#bfbfbf", marginBottom: 8 }
      }) : null,
      e.createElement(
        p,
        { type: "secondary", style: { fontSize: 12 } },
        "MCP 服务器列表来自 UGSci 官方源，自动同步更新"
      )
    )
  ), Ta = _e ? e.createElement(
    T,
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
      _e.description
    ),
    ...Object.entries(_e.env || {}).map(([i]) => {
      const $ = In[i], j = ($ == null ? void 0 : $.isSecret) !== !1;
      return e.createElement(
        "div",
        { key: i, style: { marginBottom: 16 } },
        e.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 6, marginBottom: 4 } },
          e.createElement(
            p,
            { strong: !0, style: { fontSize: 13 } },
            ($ == null ? void 0 : $.label) || i
          ),
          e.createElement(
            b,
            { color: "orange", style: { fontSize: 10 } },
            "必填"
          )
        ),
        // Help text with optional link
        $ ? e.createElement(
          "div",
          { style: { marginBottom: 6, fontSize: 12, color: "#8c8c8c" } },
          $.help,
          $.link ? e.createElement(
            "a",
            {
              href: $.link,
              target: "_blank",
              rel: "noopener noreferrer",
              style: { marginLeft: 4, fontSize: 12 }
            },
            "获取方式 ↗"
          ) : null
        ) : null,
        // Input field
        j ? e.createElement(d.Password, {
          placeholder: `请输入 ${($ == null ? void 0 : $.label) || i}`,
          value: ke[i] || "",
          onChange: (ce) => ee((ge) => ({
            ...ge,
            [i]: ce.target.value
          })),
          style: { width: "100%" }
        }) : e.createElement(d, {
          placeholder: `请输入 ${($ == null ? void 0 : $.label) || i}`,
          value: ke[i] || "",
          onChange: (ce) => ee((ge) => ({
            ...ge,
            [i]: ce.target.value
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
        prefix: Y ? e.createElement(Y) : void 0,
        value: xe,
        onChange: (i) => ze(i.target.value),
        allowClear: !0,
        style: { maxWidth: 400, flex: 1, minWidth: 200 }
      }),
      e.createElement(
        c,
        {
          icon: J ? e.createElement(J) : void 0,
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
        b,
        {
          style: { fontSize: 11, cursor: "pointer", borderRadius: 12 },
          color: Ke === "" ? "blue" : void 0,
          onClick: () => fn("")
        },
        "全部"
      ),
      ...dn.map(
        (i) => e.createElement(
          b,
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
    pn && $t.length === 0 ? e.createElement(
      "div",
      { style: { textAlign: "center", padding: 40 } },
      e.createElement(r, { size: "large" }, e.createElement("div", { style: { minHeight: 60, display: "flex", alignItems: "center", justifyContent: "center" } }, "正在加载专家模板..."))
    ) : $t.length === 0 ? e.createElement(o, {
      description: "未找到匹配的专家模板",
      image: o.PRESENTED_IMAGE_SIMPLE
    }) : e.createElement(
      w,
      { gutter: [12, 12] },
      ...$t.map(
        (i) => e.createElement(
          S,
          { key: i.id, xs: 24, sm: 12, md: 8 },
          e.createElement(
            v,
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
                    b,
                    { color: "blue", style: { fontSize: 10 } },
                    mt(i.category)
                  ) : null,
                  i.tags.includes("mcp") ? e.createElement(
                    b,
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
                i.tags.filter(($) => $ !== "agent" && $ !== "template" && $ !== "workspace").slice(0, 3).join(" · ") || "专家模板"
              ),
              e.createElement(
                c,
                {
                  type: "primary",
                  size: "small",
                  loading: Ot,
                  disabled: Ot,
                  icon: O ? e.createElement(O) : void 0
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
      h ? e.createElement(h, {
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
        O ? e.createElement(O, { style: { fontSize: 14 } }) : null,
        "技能市场"
      ),
      children: wa
    },
    {
      key: "mcp",
      label: e.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        z ? e.createElement(z, { style: { fontSize: 14 } }) : null,
        "MCP 市场"
      ),
      children: _a
    },
    {
      key: "experts",
      label: e.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        J ? e.createElement(J, { style: { fontSize: 14 } }) : null,
        "专家模板"
      ),
      children: za
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
            icon: I ? e.createElement(I) : void 0,
            onClick: () => {
              gt(Z, _, {}), pt(), At();
            },
            loading: ne || st || sn || pn
          },
          "刷新"
        )
      )
    }),
    e.createElement(te, {
      items: Ia,
      activeKey: ae,
      onChange: (i) => R(i)
    }),
    // Skill source config modal
    e.createElement(_s, {
      open: pa,
      onClose: () => Vt(!1),
      sources: Ce,
      onChange: (i) => {
        Se(i), pt(i);
      }
    }),
    // MCP source config modal
    e.createElement(An, {
      open: fa,
      onClose: () => Qt(!1),
      sources: ga,
      onChange: (i) => Yt(i),
      type: "mcp"
    }),
    // MCP token config modal (for templates requiring secrets)
    Ta,
    // Expert source config modal
    e.createElement(An, {
      open: Ea,
      onClose: () => en(!1),
      sources: ya,
      onChange: (i) => Zt(i),
      type: "expert"
    })
  );
}
function As() {
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
}, Rn = {
  zh: { label: "能告诉我你都能做点什么吗？", value: "能告诉我你都能做点什么吗" },
  en: { label: "Can you tell me what you can do?", value: "Can you tell me what you can do?" },
  ja: { label: "あなたができることを教えてください", value: "あなたができることを教えてください" },
  ru: { label: "Расскажи, что ты умеешь делать?", value: "Расскажи, что ты умеешь делать?" },
  vi: { label: "Bạn có thể cho tôi biết bạn làm được gì không?", value: "Bạn có thể cho tôi biết bạn làm được gì không?" },
  id: { label: "Bisa cerita apa saja yang bisa Anda lakukan?", value: "Bisa cerita apa saja yang bisa Anda lakukan?" }
};
function Ps() {
  const e = P(), t = e.React, { useEffect: l, useRef: a } = t, n = e.useSelectedAgent ? e.useSelectedAgent() : { id: "default" }, s = (n == null ? void 0 : n.id) || "default", r = a(null), o = a(null);
  return l(() => {
    if (r.current === s) return;
    r.current = s, xt();
    const d = As(), c = Mn[d] || Mn.en, f = Rn[d] || Rn.en;
    let w = !1;
    return (async () => {
      var S, v;
      try {
        const b = await Tt(s);
        if (w) return;
        const E = jn(b);
        if (o.current) {
          try {
            o.current();
          } catch {
          }
          o.current = null;
        }
        const C = window.QwenPaw;
        (S = C == null ? void 0 : C.chat) != null && S.welcome && (E.length > 0 ? (o.current = C.chat.welcome.set("ugsci", {
          description: c,
          prompts: E
        }), console.info(
          `[ugsci] Injected ${E.length} welcome prompts for agent "${s}"`
        )) : (o.current = C.chat.welcome.set("ugsci", {
          description: c,
          prompts: [f]
        }), console.info(
          `[ugsci] No skills for agent "${s}" — using default prompt`
        )));
      } catch (b) {
        console.warn(
          `[ugsci] Failed to inject welcome prompts for agent "${s}":`,
          b
        );
        const E = window.QwenPaw;
        if ((v = E == null ? void 0 : E.chat) != null && v.welcome && !w) {
          if (o.current) {
            try {
              o.current();
            } catch {
            }
            o.current = null;
          }
          o.current = E.chat.welcome.set("ugsci", {
            description: c,
            prompts: [f]
          });
        }
      }
    })(), () => {
      w = !0;
    };
  }, [s]), null;
}
function $s() {
  var c, f, w;
  const e = window.QwenPaw;
  if (!(e != null && e.menu) || !(e != null && e.route)) {
    console.warn(
      "[ugsci] QwenPaw.menu/route API not available — plugin disabled"
    );
    return;
  }
  const t = P().React, l = "ugsci";
  (f = (c = e.chat) == null ? void 0 : c.rightHeader) != null && f.add ? (e.chat.rightHeader.add(l, t.createElement(Ps), {
    id: "ugsci.welcome-injector",
    order: -1
    // render before other right-header items (invisible anyway)
  }), console.info("[ugsci] WelcomePromptsInjector registered via rightHeader")) : console.warn(
    "[ugsci] QP.chat.rightHeader.add not available — agent-specific welcome prompts disabled"
  );
  const a = P().antdIcons || {}, n = a.UserSwitchOutlined, s = a.ToolOutlined, r = a.ThunderboltOutlined, o = a.ShopOutlined;
  e.route.add(l, {
    id: "ugsci.experts",
    path: "/ugsci-experts",
    component: Dl
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
    component: is
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
    component: ds
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
    component: Os
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
  for (const S of d) {
    try {
      const b = e.menu.snapshot("primary.agentScoped").find((E) => E.id === S);
      b && e.menu.replace(l, S, {
        ...b,
        visible: () => !Ve()
      });
    } catch {
    }
    try {
      const b = e.menu.snapshot("primary.settings").find((E) => E.id === S);
      b && e.menu.replace(l, S, {
        ...b,
        visible: () => !Ve()
      });
    } catch {
    }
  }
  console.info(
    "[ugsci] Plugin registered: 4 routes + menu items, simple-mode whitelist + simplified navigation active"
  );
}
function Ut() {
  try {
    $s();
  } catch (e) {
    console.error("[ugsci] Failed to build plugin:", e), setTimeout(Ut, 500);
  }
}
var Ln;
if ((Ln = window.QwenPaw) != null && Ln.host)
  Ut();
else {
  const e = setInterval(() => {
    var t;
    (t = window.QwenPaw) != null && t.host && (clearInterval(e), Ut());
  }, 200);
  setTimeout(() => clearInterval(e), 1e4);
}
