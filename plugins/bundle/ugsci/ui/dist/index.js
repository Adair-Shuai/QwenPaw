function k() {
  var t;
  const e = (t = window.QwenPaw) == null ? void 0 : t.host;
  if (!e) throw new Error("[ugsci] QwenPaw.host not available");
  return e;
}
function Eo() {
  try {
    return k().getApiToken() || "";
  } catch {
    return "";
  }
}
function En(e) {
  return k().getApiUrl(e);
}
function bo(e) {
  const t = Eo();
  return {
    "Content-Type": "application/json",
    ...t ? { Authorization: `Bearer ${t}` } : {},
    ...e
  };
}
function vo(e) {
  const t = new Headers(e), n = {};
  return t.forEach((r, a) => {
    n[a] = r;
  }), n;
}
function tt(e, t) {
  const n = k(), r = vo(t == null ? void 0 : t.headers);
  return n.fetch ? n.fetch(e, { ...t, headers: r }) : fetch(n.getApiUrl(e), {
    ...t,
    headers: { ...bo(), ...r }
  });
}
const Ut = /* @__PURE__ */ new Map(), wo = 15e3;
function So(e) {
  return e ? e instanceof Headers ? e.get("X-Agent-Id") || e.get("x-agent-id") || "" : e["X-Agent-Id"] || e["x-agent-id"] || "" : "";
}
function xo(e, t, n) {
  return `${e}:${t}:${n}`;
}
function Ht() {
  Ut.clear();
}
function nr(e) {
  for (const [t, n] of Ut)
    (e ? n.agentId === e : n.agentId) && Ut.delete(t);
}
async function de(e, t) {
  const n = ((t == null ? void 0 : t.method) || "GET").toUpperCase(), { bypassCache: r, ...a } = t || {}, l = So(
    a.headers
  ), o = xo(n, e, l);
  if (n !== "GET" && (l ? nr(l) : Ht()), n === "GET" && !r) {
    const c = Ut.get(o);
    if (c && Date.now() - c.ts < wo)
      return c.data;
  }
  const s = await tt(e, a);
  if (!s.ok) {
    const c = await s.text().catch(() => "");
    throw new Error(c || `HTTP ${s.status}`);
  }
  if (s.status === 204) return null;
  const i = await s.json();
  return n === "GET" && Ut.set(o, {
    data: i,
    ts: Date.now(),
    agentId: l || void 0
  }), i;
}
const We = {
  background: "#0072f5",
  color: "#fff",
  fontSize: 13,
  fontWeight: 600,
  border: "none",
  borderRadius: 8
};
function Xt() {
  try {
    return localStorage.getItem("qwenpaw_sidebar_mode") === "simple";
  } catch {
    return !1;
  }
}
function bn(e, t) {
  const n = k();
  return n.ReactMarkdown && n.remarkGfm ? t.createElement(
    n.ReactMarkdown,
    { remarkPlugins: [n.remarkGfm] },
    e
  ) : e.replace(/\*\*(.+?)\*\*/g, "$1").replace(/\*(.+?)\*/g, "$1").replace(/`(.+?)`/g, "$1").replace(/^#+\s*/gm, "").replace(/^[-*]\s+/gm, "• ");
}
function vn({
  title: e,
  subtitle: t,
  extra: n
}) {
  const r = k().React, { Space: a } = k().antd;
  return r.createElement(
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
    r.createElement(
      "div",
      null,
      r.createElement(
        "h2",
        { style: { margin: 0, fontSize: 20, fontWeight: 600 } },
        e
      ),
      t ? r.createElement(
        "div",
        { style: { marginTop: 4, fontSize: 13, color: "var(--ant-color-text-tertiary, #8c8c8c)" } },
        t
      ) : null
    ),
    n ? r.createElement(a, null, n) : null
  );
}
async function wn() {
  const e = await de("/agents");
  return (e == null ? void 0 : e.agents) || [];
}
async function rr(e) {
  return de(
    `/agents/${encodeURIComponent(e)}`
  );
}
async function Sn(e) {
  return await de(
    `/agents/${encodeURIComponent(e)}/skills`
  ) || [];
}
async function xn(e = !1) {
  return await de(`/skills/pool${e ? "?summary=true" : ""}`) || [];
}
async function ko(e) {
  const t = await de(
    `/skills/pool/${encodeURIComponent(e)}/content`
  );
  return (t == null ? void 0 : t.content) || "";
}
async function Co() {
  return (await de(
    "/skills/workspaces"
  ) || []).map((t) => ({
    agent_id: t.agent_id,
    agent_name: t.agent_name || "",
    // Current hosts return skill_names. Keep the legacy fallback so the
    // plugin remains compatible with older QwenPaw releases.
    skill_names: Array.isArray(t.skill_names) ? t.skill_names : Array.isArray(t.skills) ? t.skills.map((n) => n.name) : []
  }));
}
function kt(e, t = "") {
  return `/agents/${encodeURIComponent(e)}/skills${t}`;
}
function Ha(e) {
  var n;
  const t = [];
  for (const r of e) {
    if (r.enabled === !1) continue;
    const a = (n = r.description) == null ? void 0 : n.trim();
    if (!a) continue;
    const l = (r.name || a).length > 20 ? (r.name || a).substring(0, 18) + "…" : r.name || a;
    let o = a;
    if (o = o.replace(/\*\*(.+?)\*\*/g, "$1").replace(/\*(.+?)\*/g, "$1").replace(/`(.+?)`/g, "$1").replace(/^#+\s*/gm, "").trim(), /^(用于|帮助|提供|支持|实现|完成|分析|计算|生成|创建|检查)/.test(o) ? o = `请${o}` : /^(a |an |the )/i.test(o) ? o = `Help me with ${o}` : /[。？！.?!]$/.test(o) || (o = `帮我${o}`), o.length > 80 && (o = o.substring(0, 77) + "..."), t.push({ label: l, value: o }), t.length >= 4) break;
  }
  return t;
}
async function To(e) {
  return await de("/workspace/files", {
    headers: { "X-Agent-Id": e }
  }) || [];
}
async function dn(e, t, n) {
  return de(`/workspace/files/${encodeURIComponent(t)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify({ content: n })
  });
}
async function _o(e, t, n, r) {
  return de("/workspace/prompt-files", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify({ filename: t, content: n, enable: r })
  });
}
const Io = /* @__PURE__ */ new Set([
  "CON",
  "PRN",
  "AUX",
  "NUL",
  ...Array.from({ length: 9 }, (e, t) => `COM${t + 1}`),
  ...Array.from({ length: 9 }, (e, t) => `LPT${t + 1}`)
]);
function Ao(e) {
  let t = e.trim();
  if (!t) throw new Error("请输入文件名");
  if (/[\\/]/.test(t)) throw new Error("文件名不能包含路径分隔符");
  if (/[<>:\"|?*\u0000-\u001f]/.test(t))
    throw new Error("文件名包含系统不支持的字符");
  if (/[ .]$/.test(t)) throw new Error("文件名不能以空格或句点结尾");
  t.toLowerCase().endsWith(".md") ? t = `${t.slice(0, -3)}.md` : t += ".md";
  const n = t.split(".", 1)[0].toUpperCase();
  if (!t.slice(0, -3)) throw new Error("文件名不能为空");
  if (Io.has(n))
    throw new Error("该文件名是系统保留名称，请更换");
  if (new TextEncoder().encode(t).length > 255)
    throw new Error("文件名过长");
  return t;
}
async function zo(e, t) {
  const n = await rr(e);
  n.system_prompt_files = t, await de(`/agents/${encodeURIComponent(e)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(n)
  });
}
async function ar(e, t) {
  await de("/skills/pool/download", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      skill_name: t,
      targets: [{ workspace_id: e }],
      overwrite: !1
    })
  });
}
async function Wa(e, t) {
  await de(
    kt(e, `/${encodeURIComponent(t)}/enable`),
    {
      method: "POST"
    }
  );
}
async function lr(e, t) {
  await de(kt(e, `/${encodeURIComponent(t)}`), {
    method: "DELETE"
  });
}
async function $o(e, t) {
  return de(kt(e, "/batch-enable"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(t)
  });
}
async function Po(e, t) {
  return de(kt(e, "/batch-disable"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(t)
  });
}
async function Ro(e, t) {
  return de(kt(e, "/batch-delete"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(t)
  });
}
async function or(e) {
  return await de("/mcp", {
    headers: { "X-Agent-Id": e }
  }) || [];
}
async function Va(e, t) {
  await de(`/mcp/${encodeURIComponent(t)}`, {
    method: "DELETE",
    headers: { "X-Agent-Id": e }
  });
}
async function ir(e, t) {
  return de("/mcp", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify(t)
  });
}
async function Oo(e, t) {
  return de(
    `/mcp/toggle/${encodeURIComponent(t)}`,
    {
      method: "PATCH",
      headers: { "X-Agent-Id": e }
    }
  );
}
async function qa(e, t) {
  await de(
    kt(e, `/${encodeURIComponent(t)}/disable`),
    {
      method: "POST"
    }
  );
}
async function Mo(e) {
  await de(`/skills/pool/${encodeURIComponent(e)}`, {
    method: "DELETE"
  });
}
function Lo(e) {
  const t = (e || "").trim();
  if (!t) return { number: 6, unit: "h" };
  const n = t.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/i);
  if (!n) return { number: 6, unit: "h" };
  const r = parseInt(n[1] || "0", 10), a = parseInt(n[2] || "0", 10), l = parseInt(n[3] || "0", 10), o = r * 60 + a + Math.round(l / 60);
  return o <= 0 ? { number: 6, unit: "h" } : o >= 60 && o % 60 === 0 ? { number: o / 60, unit: "h" } : { number: o, unit: "m" };
}
function Bo(e) {
  return e.unit === "h" ? `${e.number}h` : `${e.number}m`;
}
async function Uo(e) {
  return de("/config/heartbeat", {
    headers: { "X-Agent-Id": e }
  });
}
async function jo(e, t) {
  return de("/config/heartbeat", {
    method: "PUT",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify(t)
  });
}
async function No(e) {
  await de("/config/heartbeat/run", {
    method: "POST",
    headers: { "X-Agent-Id": e }
  });
}
async function Do(e) {
  return de("/workspace/running-config", {
    headers: { "X-Agent-Id": e }
  });
}
async function Fo(e, t) {
  return de("/workspace/running-config", {
    method: "PUT",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify(t)
  });
}
async function Go(e) {
  return (await de("/workspace/language", {
    headers: { "X-Agent-Id": e }
  })).language || "zh";
}
async function Ho(e, t) {
  await de("/workspace/language", {
    method: "PUT",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify({ language: t })
  });
}
async function Wo() {
  return (await de("/config/user-timezone")).timezone || "UTC";
}
async function Vo(e) {
  await de("/config/user-timezone", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ timezone: e })
  });
}
async function qo(e) {
  return await de("/workspace/system-prompt-files", {
    headers: { "X-Agent-Id": e }
  }) || [];
}
const Vr = ["AGENTS.md", "SOUL.md", "PROFILE.md"];
function Jo({
  items: e,
  max: t = 5,
  color: n = "blue",
  emptyText: r = "无"
}) {
  const a = k().React, { Tag: l } = k().antd;
  return !e || e.length === 0 ? a.createElement(
    "span",
    { style: { fontSize: 12, color: "var(--ant-color-text-quaternary, #bfbfbf)" } },
    r
  ) : a.createElement(
    "div",
    { style: { display: "flex", flexWrap: "wrap", gap: 4 } },
    ...e.slice(0, t).map(
      (o, s) => a.createElement(
        l,
        { key: s, color: n, style: { fontSize: 11, marginRight: 0 } },
        o
      )
    ),
    e.length > t ? a.createElement(
      l,
      { style: { fontSize: 11, marginRight: 0 } },
      `+${e.length - t}`
    ) : null
  );
}
function Ja({
  open: e,
  onClose: t,
  poolSkills: n,
  installedSkillNames: r,
  loading: a,
  onInstall: l
}) {
  const o = k().React, { useState: s, useEffect: i, useMemo: c } = o, { Modal: d, Button: u, Empty: m, Spin: p, Input: w, Tag: h, Tooltip: y, Typography: f } = k().antd, { CheckOutlined: E, SearchOutlined: v } = k().antdIcons || {}, { Text: g } = f, [S, z] = s([]), [V, I] = s("");
  i(() => {
    e && (z([]), I(""));
  }, [e]);
  const $ = c(() => {
    if (!V.trim()) return n;
    const C = V.toLowerCase();
    return n.filter(
      (x) => {
        var _, T;
        return x.name.toLowerCase().includes(C) || ((_ = x.description) == null ? void 0 : _.toLowerCase().includes(C)) || ((T = x.tags) == null ? void 0 : T.some((W) => W.toLowerCase().includes(C)));
      }
    );
  }, [n, V]), J = $.filter(
    (C) => !r.includes(C.name)
  ), F = (C) => {
    z(
      (x) => x.includes(C) ? x.filter((_) => _ !== C) : [...x, C]
    );
  }, B = async () => {
    S.length !== 0 && (await l(S), z([]));
  };
  return o.createElement(
    d,
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
          g,
          { type: "secondary", style: { fontSize: 13 } },
          `已选择 ${S.length} 个技能`
        ),
        o.createElement(
          "div",
          { style: { display: "flex", gap: 8 } },
          o.createElement(u, { onClick: t }, "取消"),
          o.createElement(
            u,
            {
              type: "primary",
              onClick: B,
              disabled: S.length === 0
            },
            S.length > 0 ? `添加 (${S.length})` : "添加"
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
      o.createElement(w, {
        placeholder: "搜索技能名称、描述或标签...",
        prefix: v ? o.createElement(v) : void 0,
        value: V,
        onChange: (C) => I(C.target.value),
        allowClear: !0,
        style: { flex: 1 }
      }),
      o.createElement(
        u,
        {
          size: "small",
          type: "primary",
          onClick: () => z(J.map((C) => C.name))
        },
        "全选"
      ),
      o.createElement(
        u,
        {
          size: "small",
          onClick: () => z([])
        },
        "清空"
      )
    ),
    // Skill grid (card style matching Skill Center)
    a ? o.createElement(
      "div",
      { style: { textAlign: "center", padding: 40 } },
      o.createElement(p, { size: "large" })
    ) : $.length === 0 ? o.createElement(m, {
      description: V ? "未找到匹配的技能" : "技能池暂无可用技能",
      image: m.PRESENTED_IMAGE_SIMPLE
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
      ...$.map((C) => {
        const x = S.includes(C.name), _ = r.includes(C.name);
        return o.createElement(
          "div",
          {
            key: C.name,
            onClick: () => !_ && F(C.name),
            style: {
              position: "relative",
              padding: "10px 12px",
              border: `1px solid ${x ? "#0072f5" : "var(--ant-color-border-secondary, #e8e8e8)"}`,
              borderRadius: 6,
              cursor: _ ? "not-allowed" : "pointer",
              transition: "all 0.15s ease",
              background: x ? "rgba(0, 114, 245, 0.06)" : _ ? "var(--ant-color-fill-quaternary, #fafafa)" : "var(--ant-color-bg-container, #fff)",
              opacity: _ ? 0.5 : 1,
              minHeight: 64
            }
          },
          x ? o.createElement(
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
            E ? o.createElement(E) : "✓"
          ) : null,
          _ ? o.createElement(
            "span",
            {
              style: {
                position: "absolute",
                top: 6,
                right: 8,
                fontSize: 10,
                color: "var(--ant-color-text-quaternary, #bbb)"
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
                paddingRight: _ || x ? 24 : 0
              }
            },
            o.createElement(
              "span",
              { style: { fontSize: 16 } },
              C.emoji || "⚡"
            ),
            o.createElement(
              y,
              { title: C.name },
              o.createElement(
                g,
                {
                  strong: !0,
                  style: {
                    fontSize: 13,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap"
                  }
                },
                C.name
              )
            )
          ),
          C.description ? o.createElement(
            "div",
            {
              style: {
                fontSize: 11,
                color: "var(--ant-color-text-tertiary, #8c8c8c)",
                overflow: "hidden",
                textOverflow: "ellipsis",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                lineHeight: "1.4"
              }
            },
            C.description
          ) : null,
          C.tags && C.tags.length > 0 ? o.createElement(
            "div",
            {
              style: {
                marginTop: 4,
                display: "flex",
                gap: 2,
                flexWrap: "wrap"
              }
            },
            ...C.tags.slice(0, 2).map(
              (T, W) => o.createElement(
                h,
                {
                  key: W,
                  color: "cyan",
                  style: { fontSize: 10, marginRight: 0 }
                },
                T
              )
            )
          ) : null
        );
      })
    )
  );
}
function Ka({
  agentId: e,
  systemPromptFiles: t,
  onRefresh: n
}) {
  const r = k().React, { useState: a, useEffect: l, useCallback: o, useRef: s } = r, {
    List: i,
    Tag: c,
    Switch: d,
    Button: u,
    Modal: m,
    Input: p,
    Spin: w,
    Empty: h,
    message: y,
    Typography: f,
    Segmented: E,
    Alert: v
  } = k().antd, { FileTextOutlined: g, PlusOutlined: S, EditOutlined: z, ReloadOutlined: V } = k().antdIcons || {}, { Text: I } = f, [$, J] = a([]), [F, B] = a(!0), [C, x] = a(
    t || []
  ), [_, T] = a(!1), [W, N] = a(null), [G, U] = a(""), [A, ee] = a(""), [ae, D] = a(!1), [M, oe] = a("source"), te = s(0), K = o(async () => {
    const X = ++te.current;
    B(!0);
    try {
      const ce = await To(e);
      X === te.current && J(ce);
    } catch (ce) {
      X === te.current && (y.error(ce.message || "加载工作区文档失败"), J([]));
    } finally {
      X === te.current && B(!1);
    }
  }, [e]);
  l(() => {
    K();
  }, [K]), l(() => {
    x(t || []);
  }, [t]);
  const ue = async (X, ce) => {
    const ne = new Set(C);
    if (ce)
      ne.add(X);
    else {
      if (Vr.includes(X) && X === "AGENTS.md") {
        y.warning("AGENTS.md 是核心文件，不能停用");
        return;
      }
      ne.delete(X);
    }
    const xe = Array.from(ne);
    x(xe);
    try {
      await zo(e, xe), y.success(ce ? "已启用记忆文件" : "已停用记忆文件"), n();
    } catch (we) {
      y.error(we.message || "更新失败"), x(t || []);
    }
  }, L = async (X) => {
    try {
      const ce = await de(
        `/workspace/files/${encodeURIComponent(X)}`,
        { headers: { "X-Agent-Id": e } }
      );
      N(X), U(ce.content || ""), oe("source"), T(!0);
    } catch (ce) {
      y.error(ce.message || "读取文件失败");
    }
  }, ie = () => {
    N(null), U(""), ee(""), oe("source"), T(!0);
  }, ge = async () => {
    let X;
    try {
      X = Ao(W || A);
    } catch (ce) {
      y.warning(ce.message || "文件名无效");
      return;
    }
    if (!G.trim()) {
      y.warning("Markdown 文档不能为空");
      return;
    }
    if (new TextEncoder().encode(G).length > 1024 * 1024) {
      y.warning("Markdown 文档不能超过 1 MB");
      return;
    }
    D(!0);
    try {
      if (W)
        await dn(e, X, G);
      else {
        const ce = await _o(
          e,
          X,
          G,
          !0
        );
        x(ce.system_prompt_files);
      }
      y.success("保存成功"), T(!1), K(), n();
    } catch (ce) {
      const ne = ce != null && ce.message ? `：${ce.message}` : "";
      y.error(
        W ? (ce == null ? void 0 : ce.message) || "保存失败" : `创建并挂载失败，服务端已回滚文件${ne}`
      );
    } finally {
      D(!1);
    }
  };
  return F ? r.createElement(
    "div",
    { style: { textAlign: "center", padding: 40 } },
    r.createElement(w, { size: "large" })
  ) : r.createElement(
    "div",
    null,
    r.createElement(
      "div",
      {
        style: {
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 12
        }
      },
      r.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        g ? r.createElement(g, {
          style: { fontSize: 14, color: "#1677ff" }
        }) : null,
        r.createElement(
          I,
          { strong: !0 },
          `工作区文档 (${$.length})`
        ),
        r.createElement(
          I,
          { type: "secondary", style: { fontSize: 12 } },
          `· ${C.length} 个已挂载到系统提示`
        )
      ),
      r.createElement(
        "div",
        { style: { display: "flex", gap: 8 } },
        r.createElement(
          u,
          {
            size: "small",
            icon: V ? r.createElement(V) : void 0,
            onClick: K
          },
          "刷新"
        ),
        r.createElement(
          u,
          {
            type: "primary",
            size: "small",
            icon: S ? r.createElement(S) : void 0,
            onClick: ie
          },
          "新建 Markdown 文档"
        )
      )
    ),
    $.length === 0 ? r.createElement(h, {
      description: "暂无 Markdown 文档，点击「新建 Markdown 文档」添加",
      image: h.PRESENTED_IMAGE_SIMPLE
    }) : r.createElement(i, {
      dataSource: $,
      renderItem: (X) => {
        const ce = C.includes(X.filename), ne = Vr.includes(X.filename);
        return r.createElement(
          i.Item,
          {
            actions: [
              r.createElement(
                u,
                {
                  type: "link",
                  size: "small",
                  icon: z ? r.createElement(z) : void 0,
                  onClick: () => L(X.filename)
                },
                "编辑"
              )
            ]
          },
          r.createElement(i.Item.Meta, {
            avatar: r.createElement(g, {
              style: {
                fontSize: 20,
                color: ce ? "#1677ff" : "var(--ant-color-text-quaternary, #bfbfbf)"
              }
            }),
            title: r.createElement(
              "div",
              {
                style: {
                  display: "flex",
                  alignItems: "center",
                  gap: 6
                }
              },
              r.createElement(I, null, X.filename),
              ne ? r.createElement(
                c,
                { color: "default", style: { fontSize: 10 } },
                "内置"
              ) : r.createElement(
                c,
                { color: "cyan", style: { fontSize: 10 } },
                "工作文档"
              )
            ),
            description: r.createElement(
              "div",
              { style: { fontSize: 12 } },
              `${(X.size / 1024).toFixed(1)} KB · 修改于 ${new Date(X.modified_time).toLocaleString()}`
            )
          }),
          r.createElement(d, {
            checked: ce,
            size: "small",
            onChange: (xe) => ue(X.filename, xe)
          })
        );
      }
    }),
    // Edit/New file modal
    r.createElement(
      m,
      {
        open: _,
        onCancel: () => T(!1),
        title: W ? `编辑 ${W}` : "新建 Markdown 文档",
        width: 700,
        onOk: ge,
        confirmLoading: ae,
        okText: "保存"
      },
      W ? null : r.createElement(
        "div",
        { style: { marginBottom: 12 } },
        r.createElement(p, {
          placeholder: "文件名（如：油藏工程记忆库.md）",
          value: A,
          onChange: (X) => ee(X.target.value),
          addonAfter: A.endsWith(".md") ? "" : ".md"
        })
      ),
      r.createElement(
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
        r.createElement(E, {
          size: "small",
          value: M,
          options: [
            { label: "源码", value: "source" },
            { label: "预览", value: "preview" }
          ],
          onChange: (X) => oe(X)
        }),
        r.createElement(
          I,
          { type: "secondary", style: { fontSize: 12 } },
          `${G.length} 字符 · 约 ${Math.ceil(G.length / 4)} tokens · ${W && C.includes(W) ? "已挂载" : W ? "未挂载" : "保存后自动挂载"}`
        )
      ),
      G.trim() ? null : r.createElement(v, {
        type: "warning",
        showIcon: !0,
        message: "文档内容为空，保存前需要填写 Markdown 内容",
        style: { marginBottom: 10 }
      }),
      M === "source" ? r.createElement(p.TextArea, {
        value: G,
        onChange: (X) => U(X.target.value),
        rows: 14,
        placeholder: `输入 Markdown 内容...

例如：
# 某区块油藏基础参数

- 地层压力: 25 MPa
- 地层温度: 85°C
- 原油密度: 0.85 g/cm³`,
        style: { fontFamily: "monospace", fontSize: 13 }
      }) : r.createElement(
        "div",
        {
          style: {
            minHeight: 320,
            maxHeight: 480,
            overflow: "auto",
            padding: "12px 16px",
            border: "1px solid var(--ant-color-border, #d9d9d9)",
            borderRadius: 6,
            background: "var(--ant-color-bg-container, #fff)"
          }
        },
        bn(G, r)
      )
    )
  );
}
function Ko({
  skills: e,
  agentId: t
}) {
  const n = k().React, { useMemo: r } = n, {
    List: a,
    Tag: l,
    Typography: o,
    Empty: s,
    Button: i,
    message: c
  } = k().antd, { ThunderboltOutlined: d, CopyOutlined: u } = k().antdIcons || {}, { Text: m } = o, p = r(() => Ha(e), [e]), w = (y) => {
    try {
      const f = k();
      f.setSelectedAgent && f.setSelectedAgent(t);
    } catch {
    }
    try {
      sessionStorage.setItem("ugsci_pending_prompt", y.value);
    } catch {
    }
    window.history.pushState({}, "", "/chat"), window.dispatchEvent(new PopStateEvent("popstate"));
  }, h = (y) => {
    var f;
    (f = navigator.clipboard) == null || f.writeText(y.value).then(() => {
      c.success("已复制到剪贴板");
    });
  };
  return p.length === 0 ? n.createElement(s, {
    description: "暂无推荐提问，请先为专家添加技能",
    image: s.PRESENTED_IMAGE_SIMPLE
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
      d ? n.createElement(d, {
        style: { fontSize: 14, color: "#1677ff" }
      }) : null,
      n.createElement(
        m,
        { strong: !0 },
        `推荐提问 (${p.length})`
      ),
      n.createElement(
        m,
        { type: "secondary", style: { fontSize: 12 } },
        "· 从技能描述中自动提取"
      )
    ),
    n.createElement(a, {
      dataSource: p,
      renderItem: (y, f) => n.createElement(
        a.Item,
        {
          actions: [
            n.createElement(
              i,
              {
                type: "link",
                size: "small",
                icon: u ? n.createElement(u) : void 0,
                onClick: () => h(y)
              },
              "复制"
            )
          ]
        },
        n.createElement(a.Item.Meta, {
          avatar: n.createElement(
            l,
            { color: "blue", style: { borderRadius: "50%" } },
            `${f + 1}`
          ),
          title: n.createElement(
            "div",
            {
              style: {
                cursor: "pointer",
                color: "#1677ff"
              },
              onClick: () => w(y)
            },
            y.value
          ),
          description: n.createElement(
            m,
            { type: "secondary", style: { fontSize: 12 } },
            y.label
          )
        })
      )
    })
  );
}
const vt = {
  marginBottom: 4,
  fontSize: 13,
  fontWeight: 500,
  color: "rgba(0,0,0,0.85)",
  display: "flex",
  alignItems: "center",
  gap: 4
}, Xa = { marginBottom: 16 }, Ya = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "0 16px",
  marginBottom: 16
}, at = {
  fontSize: 13,
  fontWeight: 600,
  color: "rgba(0,0,0,0.85)",
  marginBottom: 12,
  paddingBottom: 8,
  borderBottom: "1px solid #f0f0f0"
}, Qa = {
  fontSize: 12,
  color: "rgba(0,0,0,0.45)",
  marginLeft: 8
};
function Xo({ agentId: e }) {
  const t = k().React, { useState: n, useEffect: r, useCallback: a } = t, {
    Switch: l,
    InputNumber: o,
    Select: s,
    Button: i,
    Spin: c,
    Space: d,
    Typography: u,
    message: m
  } = k().antd, { PlayCircleOutlined: p, SaveOutlined: w } = k().antdIcons || {}, { Text: h } = u, [y, f] = n(!0), [E, v] = n(!1), [g, S] = n(!1), [z, V] = n(!1), [I, $] = n(6), [J, F] = n("h"), [B, C] = n("main"), [x, _] = n(300), [T, W] = n(!1), [N, G] = n("08:00"), [U, A] = n("22:00"), ee = a(async () => {
    var K, ue;
    f(!0);
    try {
      const L = await Uo(e), ie = Lo(L.every ?? "6h");
      V(L.enabled ?? !1), $(ie.number), F(ie.unit), C(L.target ?? "main"), _(L.timeoutSeconds ?? 300), W(!!L.activeHours), G(((K = L.activeHours) == null ? void 0 : K.start) ?? "08:00"), A(((ue = L.activeHours) == null ? void 0 : ue.end) ?? "22:00");
    } catch (L) {
      m.error(L.message || "加载心跳配置失败");
    } finally {
      f(!1);
    }
  }, [e]);
  r(() => {
    ee();
  }, [ee]);
  const ae = async () => {
    v(!0);
    try {
      await jo(e, {
        enabled: z,
        every: Bo({ number: I, unit: J }),
        target: B,
        timeoutSeconds: x,
        activeHours: T && N && U ? { start: N, end: U } : void 0
      }), m.success("心跳配置已保存");
    } catch (K) {
      m.error(K.message || "保存心跳配置失败");
    } finally {
      v(!1);
    }
  }, D = async () => {
    S(!0);
    try {
      await No(e), m.success("已触发心跳检查");
    } catch (K) {
      m.error(K.message || "触发心跳失败");
    } finally {
      S(!1);
    }
  };
  if (y)
    return t.createElement(
      "div",
      { style: { textAlign: "center", padding: 40 } },
      t.createElement(c, { size: "large" })
    );
  const M = (K, ue, L) => t.createElement(
    "div",
    { style: Xa },
    t.createElement("div", { style: vt }, K),
    ue,
    L ? t.createElement(
      h,
      { type: "secondary", style: Qa },
      L
    ) : null
  ), oe = (K, ue, L, ie) => t.createElement(
    "div",
    { style: Ya },
    t.createElement(
      "div",
      null,
      t.createElement("div", { style: vt }, K),
      ue
    ),
    t.createElement(
      "div",
      null,
      t.createElement("div", { style: vt }, L),
      ie
    )
  ), { Divider: te } = k().antd;
  return t.createElement(
    "div",
    { style: { paddingBottom: 8 } },
    // ── Section: 基本设置 ──
    t.createElement("div", { style: at }, "基本设置"),
    M(
      "启用心跳",
      t.createElement(l, {
        checked: z,
        onChange: (K) => V(K)
      }),
      z ? "已启用，专家将定期自检" : "已停用"
    ),
    oe(
      "检查频率",
      t.createElement(
        d,
        null,
        t.createElement(o, {
          min: 1,
          value: I,
          onChange: (K) => $(K ?? 1),
          style: { width: "100%" }
        }),
        t.createElement(s, {
          value: J,
          onChange: (K) => F(K),
          style: { width: 90 },
          options: [
            { value: "m", label: "分钟" },
            { value: "h", label: "小时" }
          ]
        })
      ),
      "心跳目标",
      t.createElement(s, {
        value: B,
        onChange: (K) => C(K),
        style: { width: "100%" },
        options: [
          { value: "main", label: "主会话 (main)" },
          { value: "last", label: "最近会话 (last)" },
          { value: "inbox", label: "收件箱 (inbox)" }
        ]
      })
    ),
    M(
      "超时时间 (秒)",
      t.createElement(o, {
        min: 1,
        max: 3600,
        value: x,
        onChange: (K) => _(K ?? 300),
        style: { width: 200 }
      })
    ),
    // ── Section: 活跃时段 ──
    t.createElement(te, { style: { margin: "8px 0 16px" } }),
    t.createElement("div", { style: at }, "活跃时段"),
    M(
      "启用活跃时段限制",
      t.createElement(l, {
        checked: T,
        onChange: (K) => W(K)
      }),
      "仅在指定时段内触发心跳"
    ),
    T ? oe(
      "开始时间",
      t.createElement("input", {
        type: "time",
        value: N,
        onChange: (K) => G(K.target.value),
        style: {
          width: "100%",
          padding: "4px 11px",
          borderRadius: 6,
          border: "1px solid var(--ant-color-border, #d9d9d9)",
          fontSize: 14
        }
      }),
      "结束时间",
      t.createElement("input", {
        type: "time",
        value: U,
        onChange: (K) => A(K.target.value),
        style: {
          width: "100%",
          padding: "4px 11px",
          borderRadius: 6,
          border: "1px solid var(--ant-color-border, #d9d9d9)",
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
        i,
        {
          type: "primary",
          icon: w ? t.createElement(w) : void 0,
          loading: E,
          onClick: ae,
          style: We
        },
        "保存配置"
      ),
      t.createElement(
        i,
        {
          icon: p ? t.createElement(p) : void 0,
          loading: g,
          onClick: D
        },
        "立即执行"
      )
    )
  );
}
function Yo({
  agentId: e,
  onRefresh: t
}) {
  const n = k().React, { useState: r, useEffect: a, useCallback: l } = n, {
    List: o,
    Tag: s,
    Switch: i,
    Button: c,
    Empty: d,
    Spin: u,
    Typography: m,
    message: p
  } = k().antd, { PlusOutlined: w, ReloadOutlined: h, DeleteOutlined: y } = k().antdIcons || {}, { Text: f, Paragraph: E } = m, [v, g] = r([]), [S, z] = r(!0), [V, I] = r(!1), [$, J] = r([]), [F, B] = r(!1), C = l(async () => {
    z(!0);
    try {
      const G = await Sn(e);
      g(G);
    } catch (G) {
      p.error(G.message || "加载技能失败"), g([]);
    } finally {
      z(!1);
    }
  }, [e]);
  a(() => {
    C();
  }, [C]);
  const x = async () => {
    I(!0), B(!0);
    try {
      const G = await xn(!0);
      J(G);
    } catch (G) {
      p.error(G.message || "加载技能池失败");
    } finally {
      B(!1);
    }
  }, _ = async (G) => {
    let U = 0, A = 0;
    for (const ee of G)
      try {
        await ar(e, ee), U++;
      } catch {
        A++;
      }
    U > 0 ? (p.success(
      `成功添加 ${U} 个技能${A > 0 ? `，${A} 个失败` : ""}`
    ), C(), t()) : A > 0 && p.error("添加技能失败"), I(!1);
  }, T = async (G, U) => {
    try {
      U ? await Wa(e, G.name) : await qa(e, G.name), p.success(U ? "已启用" : "已停用"), C(), t();
    } catch (A) {
      p.error(A.message || "操作失败");
    }
  }, W = async (G) => {
    try {
      await lr(e, G), p.success(`技能「${G}」已移除`), C(), t();
    } catch (U) {
      p.error(U.message || "移除技能失败");
    }
  };
  if (S)
    return n.createElement(
      "div",
      { style: { textAlign: "center", padding: 40 } },
      n.createElement(u, { size: "large" })
    );
  const N = v.filter((G) => G.enabled !== !1);
  return n.createElement(
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
        f,
        { strong: !0 },
        `技能列表 (${v.length}，已启用 ${N.length})`
      ),
      n.createElement(
        "div",
        { style: { display: "flex", gap: 8 } },
        n.createElement(
          c,
          {
            size: "small",
            icon: h ? n.createElement(h) : void 0,
            onClick: () => {
              Ht(), C();
            }
          },
          "刷新"
        ),
        n.createElement(
          c,
          {
            type: "primary",
            size: "small",
            icon: w ? n.createElement(w) : void 0,
            onClick: x,
            style: We
          },
          "从技能池添加"
        )
      )
    ),
    v.length === 0 ? n.createElement(d, {
      description: "该专家暂无技能",
      image: d.PRESENTED_IMAGE_SIMPLE
    }) : n.createElement(o, {
      dataSource: v,
      renderItem: (G) => n.createElement(
        o.Item,
        {
          actions: [
            n.createElement(i, {
              key: "toggle",
              size: "small",
              checked: G.enabled !== !1,
              onChange: (U) => T(G, U)
            }),
            n.createElement(
              c,
              {
                key: "del",
                type: "link",
                size: "small",
                danger: !0,
                icon: y ? n.createElement(y) : void 0,
                onClick: () => W(G.name)
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
            G.emoji ? n.createElement(
              "span",
              { style: { fontSize: 16 } },
              G.emoji
            ) : null,
            n.createElement(f, { strong: !0 }, G.name),
            G.version_text ? n.createElement(
              s,
              { style: { fontSize: 10 } },
              `v${G.version_text}`
            ) : null
          ),
          G.description ? n.createElement(
            E,
            {
              type: "secondary",
              style: { fontSize: 12, margin: 0 },
              ellipsis: { rows: 2 }
            },
            G.description
          ) : null
        )
      )
    }),
    n.createElement(Ja, {
      open: V,
      onClose: () => I(!1),
      poolSkills: $,
      installedSkillNames: v.map((G) => G.name),
      loading: F,
      onInstall: _
    })
  );
}
function Qo({
  agentId: e,
  onRefresh: t,
  isActive: n
}) {
  const r = k().React, { useState: a, useEffect: l, useCallback: o } = r, {
    List: s,
    Tag: i,
    Button: c,
    Empty: d,
    Spin: u,
    Modal: m,
    Input: p,
    Typography: w,
    message: h
  } = k().antd, { PlusOutlined: y, ReloadOutlined: f, DeleteOutlined: E } = k().antdIcons || {}, { Text: v, Paragraph: g } = w, { TextArea: S } = p, [z, V] = a([]), [I, $] = a(!0), [J, F] = a(!1), [B, C] = a(`{
  "mcpServers": {
    "example-client": {
      "command": "npx",
      "args": ["-y", "@example/mcp-server"],
      "env": {}
    }
  }
}`), [x, _] = a(!1), T = o(async () => {
    $(!0);
    try {
      const U = await or(e);
      V(U);
    } catch (U) {
      h.error(U.message || "加载 MCP 失败"), V([]);
    } finally {
      $(!1);
    }
  }, [e]);
  l(() => {
    T();
  }, [T]), l(() => {
    n && T();
  }, [n, T]);
  const W = async (U) => {
    try {
      await Oo(e, U), h.success("已切换 MCP 状态"), T(), t();
    } catch (A) {
      h.error(A.message || "切换失败");
    }
  }, N = async (U) => {
    try {
      await Va(e, U), h.success(`MCP「${U}」已移除`), T(), t();
    } catch (A) {
      h.error(A.message || "移除 MCP 失败");
    }
  }, G = async () => {
    _(!0);
    try {
      const U = JSON.parse(B), A = U.mcpServers || U, ee = Object.entries(A);
      if (ee.length === 0) {
        h.warning("未找到 MCP 客户端配置");
        return;
      }
      for (const [ae, D] of ee) {
        const M = D, oe = M.url ? "streamable_http" : "stdio";
        await ir(e, {
          client_key: ae,
          client: {
            name: M.name || ae,
            description: M.description || "",
            enabled: !0,
            transport: oe,
            url: M.url || "",
            command: M.command || "",
            args: M.args || [],
            env: M.env || {},
            cwd: M.cwd || "",
            headers: M.headers || {}
          }
        });
      }
      h.success("MCP 客户端已创建"), F(!1), T(), t();
    } catch (U) {
      U instanceof SyntaxError ? h.error("JSON 格式错误：" + U.message) : h.error(U.message || "创建 MCP 失败");
    } finally {
      _(!1);
    }
  };
  return I ? r.createElement(
    "div",
    { style: { textAlign: "center", padding: 40 } },
    r.createElement(u, { size: "large" })
  ) : r.createElement(
    "div",
    null,
    r.createElement(
      "div",
      {
        style: {
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 12
        }
      },
      r.createElement(v, { strong: !0 }, `MCP 客户端 (${z.length})`),
      r.createElement(
        "div",
        { style: { display: "flex", gap: 8 } },
        r.createElement(
          c,
          {
            size: "small",
            icon: f ? r.createElement(f) : void 0,
            onClick: () => {
              Ht(), T();
            }
          },
          "刷新"
        ),
        r.createElement(
          c,
          {
            type: "primary",
            size: "small",
            icon: y ? r.createElement(y) : void 0,
            onClick: () => F(!0),
            style: We
          },
          "添加 MCP"
        )
      )
    ),
    z.length === 0 ? r.createElement(d, {
      description: "该专家暂无 MCP 客户端",
      image: d.PRESENTED_IMAGE_SIMPLE
    }) : r.createElement(s, {
      dataSource: z,
      renderItem: (U) => r.createElement(
        s.Item,
        {
          actions: [
            r.createElement(
              c,
              {
                key: "toggle",
                size: "small",
                onClick: () => W(U.key)
              },
              U.enabled ? "停用" : "启用"
            ),
            r.createElement(
              c,
              {
                key: "del",
                type: "link",
                size: "small",
                danger: !0,
                icon: E ? r.createElement(E) : void 0,
                onClick: () => N(U.key)
              },
              "移除"
            )
          ]
        },
        r.createElement(
          "div",
          { style: { width: "100%" } },
          r.createElement(
            "div",
            {
              style: {
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 4
              }
            },
            r.createElement("span", { style: { fontSize: 14 } }, "🔌"),
            r.createElement(v, { strong: !0 }, U.name || U.key),
            r.createElement(
              i,
              {
                color: U.enabled ? "green" : "default",
                style: { fontSize: 10 }
              },
              U.enabled ? "启用" : "停用"
            ),
            r.createElement(
              i,
              { color: "purple", style: { fontSize: 10 } },
              U.transport
            )
          ),
          U.description ? r.createElement(
            g,
            {
              type: "secondary",
              style: { fontSize: 12, margin: 0 },
              ellipsis: { rows: 2 }
            },
            U.description
          ) : null,
          U.tools && U.tools.length > 0 ? r.createElement(
            "div",
            { style: { marginTop: 4, fontSize: 11, color: "var(--ant-color-text-tertiary, #8c8c8c)" } },
            `提供 ${U.tools.length} 个工具`
          ) : null
        )
      )
    }),
    // Create MCP modal
    r.createElement(
      m,
      {
        open: J,
        title: "添加 MCP 客户端 (JSON)",
        onCancel: () => F(!1),
        onOk: G,
        confirmLoading: x,
        okText: "创建",
        width: 560
      },
      r.createElement(
        "div",
        { style: { marginBottom: 8, fontSize: 12, color: "var(--ant-color-text-tertiary, #8c8c8c)" } },
        "粘贴 MCP 配置 JSON（支持 mcpServers 格式），将创建到当前专家工作区："
      ),
      r.createElement(S, {
        value: B,
        onChange: (U) => C(U.target.value),
        rows: 12,
        style: { fontFamily: "monospace", fontSize: 12 }
      })
    )
  );
}
function Zo({ agentId: e }) {
  const t = k().React, { useState: n, useEffect: r, useCallback: a, useRef: l } = t, {
    Card: o,
    InputNumber: s,
    Input: i,
    Select: c,
    Switch: d,
    Button: u,
    Spin: m,
    Space: p,
    Typography: w,
    Divider: h,
    message: y
  } = k().antd, { SaveOutlined: f } = k().antdIcons || {}, { Text: E } = w, [v, g] = n(!0), [S, z] = n(!1), V = l(null), [I, $] = n(60), [J, F] = n(""), [B, C] = n(!0), [x, _] = n(30), [T, W] = n("zh"), [N, G] = n("UTC"), [U, A] = n(!0), [ee, ae] = n(100), [D, M] = n(!0), [oe, te] = n(3), [K, ue] = n(1), [L, ie] = n(!0), [ge, X] = n(3), [ce, ne] = n(2), [xe, we] = n(60), [Be, ve] = n(1), [se, Se] = n(0), [Ie, j] = n(1), [P, le] = n(0), [ye, O] = n(30), [he, Z] = n(50), [pe, be] = n("light"), [Re, R] = n("scroll"), [fe, _e] = n("remelight"), [De, Ae] = n("AUTO"), Ye = a(async () => {
    var re, ze, Me, Ue, Le, Pe;
    g(!0);
    try {
      const [ke, st, ct] = await Promise.all([
        Do(e),
        Go(e).catch(() => "zh"),
        Wo().catch(() => "UTC")
      ]);
      V.current = ke, $(ke.shell_command_timeout ?? 60), F(ke.shell_command_executable ?? "");
      const Wt = ke.auto_title_config ?? { enabled: !0, timeout_seconds: 30 };
      C(Wt.enabled ?? !0), _(Wt.timeout_seconds ?? 30), W(st), G(ct);
      const nt = ke.loop ?? {};
      A(((re = nt.iteration) == null ? void 0 : re.enabled) ?? !0), ae(((ze = nt.iteration) == null ? void 0 : ze.max_iterations) ?? ke.max_iters ?? 100), M(((Me = nt.doom_loop) == null ? void 0 : Me.enabled) ?? !0), te(((Ue = nt.doom_loop) == null ? void 0 : Ue.window_size) ?? 3), ue(((Le = nt.doom_loop) == null ? void 0 : Le.similarity_threshold) ?? 1), ie(ke.llm_retry_enabled ?? !0), X(ke.llm_max_retries ?? 3), ne(ke.llm_backoff_base ?? 2), we(ke.llm_backoff_cap ?? 60), ve(ke.llm_max_concurrent ?? 1), Se(ke.llm_max_qpm ?? 0), j(ke.llm_rate_limit_pause ?? 1), le(ke.llm_rate_limit_jitter ?? 0), O(ke.llm_acquire_timeout ?? 30), Z(ke.history_max_length ?? 50), be(ke.context_manager_backend ?? "light"), R(((Pe = ke.light_context_config) == null ? void 0 : Pe.strategy) ?? "scroll"), _e(ke.memory_manager_backend ?? "remelight"), Ae(ke.approval_level ?? "AUTO");
    } catch (ke) {
      y.error(ke.message || "加载运行配置失败");
    } finally {
      g(!1);
    }
  }, [e]);
  r(() => {
    Ye();
  }, [Ye]);
  const Ze = async () => {
    var ze, Me;
    const re = V.current;
    if (re) {
      z(!0);
      try {
        const Ue = {
          ...re,
          max_iters: ee,
          loop: {
            ...re.loop ?? {},
            iteration: { enabled: U, max_iterations: ee },
            doom_loop: {
              enabled: D,
              window_size: oe,
              similarity_threshold: K,
              stages: ((Me = (ze = re.loop) == null ? void 0 : ze.doom_loop) == null ? void 0 : Me.stages) ?? []
            }
          },
          shell_command_timeout: I,
          shell_command_executable: J,
          auto_title_config: {
            enabled: B,
            timeout_seconds: x
          },
          llm_retry_enabled: L,
          llm_max_retries: ge,
          llm_backoff_base: ce,
          llm_backoff_cap: xe,
          llm_max_concurrent: Be,
          llm_max_qpm: se,
          llm_rate_limit_pause: Ie,
          llm_rate_limit_jitter: P,
          llm_acquire_timeout: ye,
          history_max_length: he,
          context_manager_backend: pe,
          light_context_config: {
            ...re.light_context_config ?? {},
            strategy: Re
          },
          memory_manager_backend: fe,
          approval_level: De
        };
        await Fo(e, Ue), V.current = Ue, T && await Ho(e, T).catch(() => {
        }), N && await Vo(N).catch(() => {
        }), y.success("运行配置已保存");
      } catch (Ue) {
        y.error(Ue.message || "保存运行配置失败");
      } finally {
        z(!1);
      }
    }
  };
  if (v)
    return t.createElement(
      "div",
      { style: { textAlign: "center", padding: 40 } },
      t.createElement(m, { size: "large" })
    );
  const Fe = (re, ze, Me) => t.createElement(
    "div",
    { style: Xa },
    t.createElement("div", { style: vt }, re),
    ze,
    Me ? t.createElement(
      E,
      { type: "secondary", style: Qa },
      Me
    ) : null
  ), Oe = (re, ze, Me, Ue) => t.createElement(
    "div",
    { style: Ya },
    t.createElement(
      "div",
      null,
      t.createElement("div", { style: vt }, re),
      ze
    ),
    t.createElement(
      "div",
      null,
      t.createElement("div", { style: vt }, Me),
      Ue
    )
  );
  return t.createElement(
    "div",
    { style: { paddingBottom: 8 } },
    // ── Section: 基础设置 ──
    t.createElement(
      "div",
      { style: at },
      "基础设置"
    ),
    Oe(
      "Shell 命令超时 (秒)",
      t.createElement(s, {
        min: 1,
        value: I,
        onChange: (re) => $(re ?? 60),
        style: { width: "100%" }
      }),
      "Shell 可执行文件",
      t.createElement(i, {
        value: J,
        onChange: (re) => F(re.target.value),
        placeholder: "留空使用系统默认",
        style: { width: "100%" }
      })
    ),
    Oe(
      "语言",
      t.createElement(c, {
        value: T,
        onChange: (re) => W(re),
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
        value: N,
        onChange: (re) => G(re),
        style: { width: "100%" },
        showSearch: !0,
        filterOption: (re, ze) => {
          var Me;
          return (((Me = ze == null ? void 0 : ze.label) == null ? void 0 : Me.toString()) || "").toLowerCase().includes(re.toLowerCase());
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
        ].map((re) => ({ value: re, label: re }))
      })
    ),
    Oe(
      "自动生成会话标题",
      t.createElement(p, null, t.createElement(d, {
        checked: B,
        onChange: (re) => C(re)
      })),
      "标题生成超时 (秒)",
      t.createElement(s, {
        min: 5,
        value: x,
        onChange: (re) => _(re ?? 30),
        style: { width: "100%" },
        disabled: !B
      })
    ),
    // ── Section: 审批级别 ──
    t.createElement(h, { style: { margin: "8px 0 16px" } }),
    t.createElement("div", { style: at }, "审批级别"),
    Fe(
      "工具执行审批",
      t.createElement(c, {
        value: De,
        onChange: (re) => Ae(re),
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
    t.createElement(h, { style: { margin: "8px 0 16px" } }),
    t.createElement("div", { style: at }, "迭代与循环"),
    Fe(
      "启用迭代限制",
      t.createElement(d, {
        checked: U,
        onChange: (re) => A(re)
      }),
      "停止 Agent 前的最大循环轮次"
    ),
    U ? Fe(
      "最大迭代次数",
      t.createElement(s, {
        min: 1,
        max: 500,
        value: ee,
        onChange: (re) => ae(re ?? 100),
        style: { width: "100%" }
      })
    ) : null,
    Fe(
      "启用重复循环保护",
      t.createElement(d, {
        checked: D,
        onChange: (re) => M(re)
      }),
      "检测并阻止重复操作循环"
    ),
    D ? Oe(
      "检测窗口大小",
      t.createElement(s, {
        min: 2,
        max: 20,
        value: oe,
        onChange: (re) => te(re ?? 3),
        style: { width: "100%" }
      }),
      "相似度阈值",
      t.createElement(s, {
        min: 0,
        max: 1,
        step: 0.05,
        value: K,
        onChange: (re) => ue(re ?? 1),
        style: { width: "100%" }
      })
    ) : null,
    // ── Section: LLM 重试 ──
    t.createElement(h, { style: { margin: "8px 0 16px" } }),
    t.createElement("div", { style: at }, "LLM 重试"),
    Fe(
      "启用 LLM 重试",
      t.createElement(d, {
        checked: L,
        onChange: (re) => ie(re)
      })
    ),
    Oe(
      "最大重试次数",
      t.createElement(s, {
        min: 1,
        value: ge,
        onChange: (re) => X(re ?? 3),
        style: { width: "100%" },
        disabled: !L
      }),
      "退避基数 (秒)",
      t.createElement(s, {
        min: 0.1,
        step: 0.1,
        value: ce,
        onChange: (re) => ne(re ?? 2),
        style: { width: "100%" },
        disabled: !L
      })
    ),
    Fe(
      "退避上限 (秒)",
      t.createElement(s, {
        min: 0.5,
        step: 0.5,
        value: xe,
        onChange: (re) => we(re ?? 60),
        style: { width: 200 },
        disabled: !L
      })
    ),
    // ── Section: LLM 限流 ──
    t.createElement(h, { style: { margin: "8px 0 16px" } }),
    t.createElement("div", { style: at }, "LLM 限流"),
    Oe(
      "最大并发数",
      t.createElement(s, {
        min: 1,
        value: Be,
        onChange: (re) => ve(re ?? 1),
        style: { width: "100%" }
      }),
      "最大 QPM (0=不限)",
      t.createElement(s, {
        min: 0,
        step: 10,
        value: se,
        onChange: (re) => Se(re ?? 0),
        style: { width: "100%" }
      })
    ),
    Oe(
      "限流暂停时间 (秒)",
      t.createElement(s, {
        min: 1,
        step: 0.5,
        value: Ie,
        onChange: (re) => j(re ?? 1),
        style: { width: "100%" }
      }),
      "限流抖动 (秒)",
      t.createElement(s, {
        min: 0,
        step: 0.5,
        value: P,
        onChange: (re) => le(re ?? 0),
        style: { width: "100%" }
      })
    ),
    Fe(
      "获取超时 (秒)",
      t.createElement(s, {
        min: 10,
        step: 10,
        value: ye,
        onChange: (re) => O(re ?? 30),
        style: { width: 200 }
      }),
      "应大于 限流暂停 + 抖动"
    ),
    // ── Section: 上下文与记忆 ──
    t.createElement(h, { style: { margin: "8px 0 16px" } }),
    t.createElement("div", { style: at }, "上下文与记忆"),
    Oe(
      "上下文管理后端",
      t.createElement(c, {
        value: pe,
        onChange: (re) => be(re),
        style: { width: "100%" },
        options: [{ value: "light", label: "light" }]
      }),
      "上下文策略",
      t.createElement(c, {
        value: Re,
        onChange: (re) => R(re),
        style: { width: "100%" },
        options: [
          { value: "scroll", label: "scroll (滚动窗口)" },
          { value: "native", label: "native (原生)" }
        ]
      })
    ),
    Oe(
      "记忆管理后端",
      t.createElement(c, {
        value: fe,
        onChange: (re) => _e(re),
        style: { width: "100%" },
        options: [
          { value: "remelight", label: "remelight" },
          { value: "adbpg", label: "adbpg" },
          { value: "none", label: "none (禁用)" }
        ]
      }),
      "历史消息最大长度",
      t.createElement(s, {
        min: 1,
        value: he,
        onChange: (re) => Z(re ?? 50),
        style: { width: "100%" }
      })
    ),
    // ── Save button ──
    t.createElement(
      "div",
      { style: { display: "flex", justifyContent: "flex-end", marginTop: 16 } },
      t.createElement(
        u,
        {
          type: "primary",
          icon: f ? t.createElement(f) : void 0,
          loading: S,
          onClick: Ze,
          style: We
        },
        "保存运行配置"
      )
    )
  );
}
function ei({
  expert: e,
  open: t,
  onClose: n,
  onRefresh: r
}) {
  const a = k().React, { useState: l, useEffect: o, useCallback: s } = a, { Modal: i, Tabs: c, Spin: d, Typography: u } = k().antd, { SettingOutlined: m } = k().antdIcons || {}, { Text: p } = u, [w, h] = l([]), [y, f] = l(!1), [E, v] = l("heartbeat"), g = s(async () => {
    if (e) {
      f(!0);
      try {
        const I = await qo(e.agent.id);
        h(I);
      } catch {
        h([]);
      } finally {
        f(!1);
      }
    }
  }, [e]);
  if (o(() => {
    t && e && g();
  }, [t, e, g]), !e) return null;
  const { agent: S } = e, z = () => {
    g(), r();
  }, V = [
    {
      key: "heartbeat",
      label: "心跳",
      children: a.createElement(Xo, {
        agentId: S.id
      })
    },
    {
      key: "files",
      label: "文件",
      children: y ? a.createElement(
        "div",
        { style: { textAlign: "center", padding: 40 } },
        a.createElement(d, { size: "large" })
      ) : a.createElement(Ka, {
        agentId: S.id,
        systemPromptFiles: w,
        onRefresh: z
      })
    },
    {
      key: "skills",
      label: `技能 (${e.skills.filter((I) => I.enabled !== !1).length})`,
      children: a.createElement(Yo, {
        agentId: S.id,
        onRefresh: r
      })
    },
    {
      key: "mcp",
      label: `MCP (${e.mcps.length})`,
      children: a.createElement(Qo, {
        agentId: S.id,
        onRefresh: r,
        isActive: E === "mcp"
      })
    },
    {
      key: "running",
      label: "运行配置",
      children: a.createElement(Zo, {
        agentId: S.id
      })
    }
  ];
  return a.createElement(
    i,
    {
      open: t,
      title: a.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 8 } },
        m ? a.createElement(m, { style: { fontSize: 18 } }) : null,
        a.createElement("span", null, `配置 - ${S.name}`),
        a.createElement(
          p,
          { type: "secondary", style: { fontSize: 12, fontWeight: 400 } },
          S.id
        )
      ),
      onCancel: n,
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
    a.createElement(c, {
      items: V,
      activeKey: E,
      onChange: (I) => v(I),
      size: "small",
      tabBarStyle: { marginBottom: 16 }
    })
  );
}
const Za = [
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
- 储气库库存评价：按层使用报告定义的视地层压力与 Z 因子开展 p/Z 确定性计算；压力口径必须显式一致，结果仅为建议复核值
- 油藏数值模拟方案设计与参数优化
- 生产动态分析与产量预测
- 注水/注气开发方案设计及效果评价
- 经济评价与开发方案比选

## 工作准则
- 所有计算需给出公式推导过程和参数来源
- 涉及储气库库存时，优先使用领域计算模块的确定性库存评价；不要自行重写公式或调用历史临时脚本
- 不得把视地层压力改称绝对压力，也不得静默加减大气压；若压力口径不明，先暂停并要求确认
- 有效库存、账面库存、工作气量和冲峰能力必须分开报告；105 亿方等计算建议不得表述为已复核或已批准
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
], ti = Za;
function qr(e) {
  return En(`/ugsci/avatar/${encodeURIComponent(e)}`);
}
function Jr(e) {
  const t = e.map(encodeURIComponent).join(",");
  return En(`/ugsci/avatar/team/${t}`);
}
function et({
  name: e,
  size: t = 32,
  borderRadius: n = "50%"
}) {
  const r = k().React, [a, l] = r.useState(0), o = a === 0 ? qr(e) : `${qr(e)}?_r=${a}`;
  return r.createElement("img", {
    src: o,
    alt: e,
    onError: () => {
      a < 1 && l(a + 1);
    },
    style: {
      width: t,
      height: t,
      borderRadius: n,
      objectFit: "cover",
      flexShrink: 0
    }
  });
}
function sr({
  members: e,
  size: t = 32,
  borderRadius: n = "50%"
}) {
  const r = k().React, [a, l] = r.useState(0);
  if (!e || e.length === 0)
    return r.createElement("span", {
      style: {
        width: t,
        height: t,
        display: "inline-block"
      }
    });
  const o = e.slice(0, 5), s = a === 0 ? Jr(o) : `${Jr(o)}?_r=${a}`;
  return r.createElement("img", {
    src: s,
    alt: "team",
    onError: () => {
      a < 1 && l(a + 1);
    },
    style: {
      width: t,
      height: t,
      borderRadius: n,
      objectFit: "cover",
      flexShrink: 0
    }
  });
}
async function Kr(e) {
  var n;
  const t = k();
  if (t.refreshAgents)
    try {
      await t.refreshAgents({ force: !0 });
    } catch (r) {
      console.warn("[ugsci] Failed to refresh newly created agent:", r);
      return;
    }
  (n = t.setSelectedAgent) == null || n.call(t, e);
}
function ni(e) {
  return e.slice(0, 2).join("、") + (e.length > 2 ? ` 等 ${e.length} 项` : "");
}
function ri({
  expert: e,
  onClick: t,
  onSummon: n,
  onConfigure: r
}) {
  var g, S;
  const a = k().React, { Card: l, Badge: o, Button: s, Tooltip: i } = k().antd, { ThunderboltOutlined: c, SettingOutlined: d } = k().antdIcons || {}, { agent: u, skills: m } = e, p = u.enabled, w = m.filter((z) => z.enabled !== !1), h = Za.find(
    (z) => z.id === u.id || z.name === u.name
  ), y = Array.from(
    new Set(
      (g = h == null ? void 0 : h.tags) != null && g.length ? h.tags : w.flatMap((z) => z.tags || [])
    )
  ).slice(0, 3), f = (h == null ? void 0 : h.category) || (u.id === "default" ? "通用助手" : "自定义专家"), E = ((S = u.description) == null ? void 0 : S.trim()) || "", v = w.map((z) => z.name);
  return a.createElement(
    l,
    {
      hoverable: !0,
      onClick: t,
      size: "small",
      style: {
        cursor: "pointer",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
        borderColor: p ? void 0 : "var(--ant-color-border, #d9d9d9)",
        opacity: p ? 1 : 0.7,
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
          flex: 1,
          padding: 18
        }
      }
    },
    a.createElement(
      "div",
      {
        style: {
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 8,
          marginBottom: 14
        }
      },
      a.createElement(
        "div",
        {
          style: {
            display: "flex",
            alignItems: "center",
            gap: 11,
            minWidth: 0
          }
        },
        a.createElement(et, { name: u.name, size: 42 }),
        a.createElement(
          "div",
          { style: { minWidth: 0 } },
          a.createElement(
            "div",
            {
              style: {
                fontSize: 15,
                fontWeight: 650,
                lineHeight: 1.4,
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden"
              }
            },
            u.name
          ),
          a.createElement(
            "div",
            {
              style: {
                fontSize: 12,
                color: "var(--ant-color-text-secondary, #595959)",
                marginTop: 3
              }
            },
            f
          )
        )
      ),
      a.createElement(
        "span",
        { style: { flexShrink: 0, whiteSpace: "nowrap" } },
        a.createElement(o, {
          status: p ? "success" : "default",
          text: p ? "启用" : "停用"
        })
      )
    ),
    a.createElement(
      "div",
      { style: { minHeight: 48, marginBottom: 12 } },
      a.createElement(
        "div",
        {
          style: {
            fontSize: 11,
            color: "var(--ant-color-text-tertiary, #8c8c8c)",
            marginBottom: 6
          }
        },
        "能力标签"
      ),
      y.length > 0 ? a.createElement(Jo, {
        items: y,
        max: 3,
        color: "blue"
      }) : a.createElement(
        "span",
        {
          style: {
            fontSize: 12,
            color: "var(--ant-color-text-secondary, #595959)"
          }
        },
        v.length ? ni(v) : "尚未配置技能，可在专家配置中补充"
      )
    ),
    a.createElement(
      "div",
      { style: { marginTop: "auto", minHeight: 78 } },
      a.createElement(
        "div",
        {
          style: {
            fontSize: 11,
            color: "var(--ant-color-text-tertiary, #8c8c8c)",
            marginBottom: 6
          }
        },
        "智能体描述"
      ),
      a.createElement(
        "div",
        {
          style: {
            color: "var(--ant-color-text-secondary, #595959)",
            fontSize: 13,
            lineHeight: 1.5,
            maxHeight: 58,
            overflow: "hidden"
          },
          title: E
        },
        E ? bn(E, a) : "暂无描述"
      )
    ),
    a.createElement(
      "div",
      {
        style: {
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
          gap: 6,
          marginTop: 14,
          paddingTop: 12,
          borderTop: "1px solid var(--ant-color-border-secondary, #f0f0f0)"
        }
      },
      a.createElement(
        i,
        { title: "配置专家", placement: "top" },
        a.createElement(s, {
          type: "text",
          size: "small",
          "aria-label": `配置 ${u.name}`,
          icon: d ? a.createElement(d, {
            style: {
              fontSize: 16,
              color: "var(--ant-color-text-tertiary, #8c8c8c)"
            }
          }) : void 0,
          onClick: (z) => {
            z.stopPropagation(), r && r();
          }
        })
      ),
      a.createElement(
        s,
        {
          type: "link",
          size: "small",
          onClick: (z) => {
            z.stopPropagation(), t();
          }
        },
        "查看详情"
      ),
      a.createElement(
        s,
        {
          type: "primary",
          size: "small",
          icon: c ? a.createElement(c) : void 0,
          disabled: !p,
          onClick: (z) => {
            z.stopPropagation(), n && n();
          },
          style: We
        },
        "召唤专家"
      )
    )
  );
}
function ai({
  expert: e,
  open: t,
  onClose: n,
  onRefresh: r
}) {
  const a = k().React, {
    Drawer: l,
    Descriptions: o,
    Tag: s,
    Typography: i,
    Space: c,
    Button: d,
    Empty: u,
    Tabs: m,
    List: p,
    Spin: w,
    Modal: h,
    message: y
  } = k().antd, { Text: f, Paragraph: E } = i, {
    EditOutlined: v,
    ThunderboltOutlined: g,
    FileTextOutlined: S,
    ToolOutlined: z,
    PlusOutlined: V
  } = k().antdIcons || {}, [I, $] = a.useState(!1), [J, F] = a.useState(
    []
  ), [B, C] = a.useState(!1);
  if (!e) return null;
  const { agent: x, config: _, skills: T, mcps: W, loading: N } = e, G = T.filter((L) => L.enabled !== !1), U = (L) => {
    window.history.pushState({}, "", L), window.dispatchEvent(new PopStateEvent("popstate"));
  }, A = a.createElement(
    "div",
    null,
    a.createElement(
      o,
      { column: 1, bordered: !0, size: "small" },
      a.createElement(o.Item, { label: "专家名称" }, x.name),
      a.createElement(
        o.Item,
        { label: "专家 ID" },
        a.createElement("code", { style: { fontSize: 12 } }, x.id)
      ),
      a.createElement(
        o.Item,
        { label: "状态" },
        a.createElement(
          s,
          { color: x.enabled ? "green" : "default" },
          x.enabled ? "启用" : "停用"
        )
      ),
      a.createElement(
        o.Item,
        { label: "功能简介" },
        x.description ? bn(x.description, a) : "暂无描述"
      ),
      a.createElement(
        o.Item,
        { label: "使用模型" },
        x.active_model ? `${x.active_model.provider_id} / ${x.active_model.model}` : "使用全局默认模型"
      ),
      _ != null && _.workspace_dir ? a.createElement(
        o.Item,
        { label: "工作区路径" },
        a.createElement(
          "code",
          { style: { fontSize: 11 } },
          _.workspace_dir
        )
      ) : null,
      _ != null && _.approval_level ? a.createElement(
        o.Item,
        { label: "审批级别" },
        _.approval_level
      ) : null
    ),
    // System prompt files
    _ != null && _.system_prompt_files && _.system_prompt_files.length > 0 ? a.createElement(
      "div",
      { style: { marginTop: 16 } },
      a.createElement(
        "div",
        {
          style: {
            display: "flex",
            alignItems: "center",
            gap: 6,
            marginBottom: 8
          }
        },
        S ? a.createElement(S, {
          style: { fontSize: 14, color: "#1677ff" }
        }) : null,
        a.createElement(f, { strong: !0 }, "系统提示词文件")
      ),
      a.createElement(
        c,
        { wrap: !0 },
        ..._.system_prompt_files.map(
          (L, ie) => a.createElement(
            s,
            {
              key: ie,
              icon: S ? a.createElement(S) : void 0,
              style: { fontSize: 12 }
            },
            L
          )
        )
      )
    ) : null
  ), ee = async () => {
    $(!0), C(!0);
    try {
      const L = await xn(!0);
      F(L);
    } catch (L) {
      y.error(L.message || "加载技能池失败");
    } finally {
      C(!1);
    }
  }, ae = async (L) => {
    let ie = 0, ge = 0;
    for (const X of L)
      try {
        await ar(x.id, X), ie++;
      } catch {
        ge++;
      }
    ie > 0 ? (y.success(
      `成功添加 ${ie} 个技能${ge > 0 ? `，${ge} 个失败` : ""}`
    ), r()) : ge > 0 && y.error("添加技能失败"), $(!1);
  }, D = async (L) => {
    try {
      await lr(x.id, L), y.success(`技能「${L}」已移除`), r();
    } catch (ie) {
      y.error(ie.message || "移除技能失败");
    }
  }, M = async (L) => {
    try {
      await Va(x.id, L), y.success(`MCP「${L}」已移除`), r();
    } catch (ie) {
      y.error(ie.message || "移除 MCP 失败");
    }
  }, oe = N ? a.createElement(
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
      a.createElement(
        f,
        { strong: !0 },
        `已启用技能 (${G.length})`
      ),
      a.createElement(
        d,
        {
          type: "primary",
          size: "small",
          icon: V ? a.createElement(V) : void 0,
          onClick: ee
        },
        "从技能池添加"
      )
    ),
    G.length === 0 ? a.createElement(u, {
      description: "该专家暂无已启用的技能",
      image: u.PRESENTED_IMAGE_SIMPLE
    }) : a.createElement(p, {
      dataSource: G,
      renderItem: (L) => a.createElement(
        p.Item,
        {
          actions: [
            a.createElement(
              d,
              {
                type: "link",
                size: "small",
                danger: !0,
                onClick: () => D(L.name)
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
            L.emoji ? a.createElement(
              "span",
              { style: { fontSize: 16 } },
              L.emoji
            ) : null,
            a.createElement(f, { strong: !0 }, L.name),
            L.version_text ? a.createElement(
              s,
              { style: { fontSize: 10 } },
              `v${L.version_text}`
            ) : null
          ),
          L.description ? a.createElement(
            E,
            {
              type: "secondary",
              style: { fontSize: 12, margin: 0 },
              ellipsis: { rows: 2 }
            },
            L.description
          ) : null,
          L.tags && L.tags.length > 0 ? a.createElement(
            "div",
            { style: { marginTop: 4 } },
            ...L.tags.map(
              (ie, ge) => a.createElement(
                s,
                {
                  key: ge,
                  color: "cyan",
                  style: { fontSize: 10 }
                },
                ie
              )
            )
          ) : null
        )
      )
    }),
    // Skill Picker Modal (card-grid style, consistent with Skill Center)
    a.createElement(Ja, {
      open: I,
      onClose: () => $(!1),
      poolSkills: J,
      installedSkillNames: G.map((L) => L.name),
      loading: B,
      onInstall: ae
    })
  ), te = N ? a.createElement(
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
      a.createElement(
        f,
        { strong: !0 },
        `MCP 客户端 (${W.length})`
      ),
      a.createElement(
        d,
        {
          type: "primary",
          size: "small",
          icon: V ? a.createElement(V) : void 0,
          onClick: () => {
            window.history.pushState({}, "", `/agents/${x.id}/mcp`), window.dispatchEvent(new PopStateEvent("popstate"));
          }
        },
        "配置 MCP"
      )
    ),
    W.length === 0 ? a.createElement(u, {
      description: "该专家暂无关联的 MCP 客户端，点击「配置 MCP」添加",
      image: u.PRESENTED_IMAGE_SIMPLE
    }) : a.createElement(p, {
      dataSource: W,
      renderItem: (L) => a.createElement(
        p.Item,
        {
          actions: [
            a.createElement(
              d,
              {
                type: "link",
                size: "small",
                danger: !0,
                onClick: () => M(L.key)
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
            a.createElement(
              "span",
              { style: { fontSize: 14 } },
              "🔌"
            ),
            a.createElement(
              f,
              { strong: !0 },
              L.name || L.key
            ),
            a.createElement(
              s,
              {
                color: L.enabled ? "green" : "default",
                style: { fontSize: 10 }
              },
              L.enabled ? "启用" : "停用"
            ),
            a.createElement(
              s,
              { color: "purple", style: { fontSize: 10 } },
              L.transport
            )
          ),
          L.description ? a.createElement(
            E,
            {
              type: "secondary",
              style: { fontSize: 12, margin: 0 },
              ellipsis: { rows: 2 }
            },
            L.description
          ) : null,
          L.tools && L.tools.length > 0 ? a.createElement(
            "div",
            {
              style: {
                marginTop: 4,
                fontSize: 11,
                color: "var(--ant-color-text-tertiary, #8c8c8c)"
              }
            },
            `提供 ${L.tools.length} 个工具`
          ) : null
        )
      )
    })
  ), K = _ != null && _.tools ? a.createElement(
    "div",
    { style: { padding: 16 } },
    a.createElement(
      "div",
      { style: { marginBottom: 12 } },
      a.createElement(
        "div",
        {
          style: {
            display: "flex",
            alignItems: "center",
            gap: 6,
            marginBottom: 8
          }
        },
        z ? a.createElement(z, {
          style: { fontSize: 14, color: "#1677ff" }
        }) : null,
        a.createElement(f, { strong: !0 }, "工具配置")
      ),
      a.createElement(
        "pre",
        {
          style: {
            background: "var(--ant-color-fill-quaternary, #fafafa)",
            padding: 12,
            borderRadius: 6,
            fontSize: 12,
            overflow: "auto",
            maxHeight: 300
          }
        },
        JSON.stringify(_.tools, null, 2)
      )
    )
  ) : a.createElement(u, {
    description: "暂无工具配置",
    image: u.PRESENTED_IMAGE_SIMPLE
  }), ue = [
    { key: "basic", label: "基本信息", children: A },
    {
      key: "skills",
      label: `技能 (${G.length})`,
      children: oe
    },
    {
      key: "prompts",
      label: "推荐提问",
      children: a.createElement(Ko, {
        skills: G,
        agentId: x.id
      })
    },
    {
      key: "knowledge",
      label: "专家记忆",
      children: a.createElement(Ka, {
        agentId: x.id,
        systemPromptFiles: (_ == null ? void 0 : _.system_prompt_files) || [],
        onRefresh: () => r()
      })
    },
    { key: "mcp", label: `MCP (${W.length})`, children: te },
    { key: "tools", label: "工具配置", children: K }
  ];
  return a.createElement(
    l,
    {
      title: a.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 8 } },
        a.createElement(et, { name: x.name, size: 28 }),
        a.createElement("span", null, x.name)
      ),
      open: t,
      onClose: n,
      width: 560,
      extra: a.createElement(
        c,
        null,
        a.createElement(
          d,
          {
            size: "small",
            icon: v ? a.createElement(v) : void 0,
            onClick: () => {
              n();
              try {
                const L = k();
                L.setSelectedAgent && L.setSelectedAgent(x.id);
              } catch (L) {
                console.warn("[ugsci] Failed to set selected agent:", L);
              }
              setTimeout(() => U("/agents"), 0);
            }
          },
          "编辑专家"
        ),
        a.createElement(
          d,
          {
            type: "primary",
            size: "small",
            icon: g ? a.createElement(g) : void 0,
            onClick: () => {
              n();
              try {
                const L = k();
                L.setSelectedAgent && L.setSelectedAgent(x.id);
              } catch (L) {
                console.warn("[ugsci] Failed to set selected agent:", L);
              }
              setTimeout(() => U("/chat"), 0);
            }
          },
          "开始对话"
        )
      )
    },
    a.createElement(m, {
      items: ue,
      defaultActiveKey: "basic"
    })
  );
}
function li({
  open: e,
  onClose: t,
  onCreated: n
}) {
  const r = k().React, { useState: a } = r, {
    Modal: l,
    Card: o,
    Tag: s,
    Input: i,
    Row: c,
    Col: d,
    Spin: u,
    message: m,
    Typography: p
  } = k().antd, { Text: w } = p, { FileAddOutlined: h } = k().antdIcons || {}, [y, f] = a(!1), [E, v] = a(""), [g, S] = a(!1), z = async ($) => {
    f(!0);
    try {
      const J = await de("/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: $.id || void 0,
          name: $.name,
          description: $.description,
          skill_names: $.skillNames
        })
      }), F = $.systemPrompt.trim() || `# ${$.name}

你是${$.name}。${$.description ? `

职责：${$.description}` : ""}
`, C = (await Promise.allSettled([
        dn(J.id, "AGENTS.md", F),
        ...$.mcpClients.map(
          ({ clientKey: x, client: _ }) => ir(J.id, {
            client_key: x,
            client: _
          })
        )
      ])).filter(
        (x) => x.status === "rejected"
      ).length;
      C > 0 ? m.warning(
        `专家「${$.name}」已创建，${C} 项初始配置失败，可在专家配置中重试`
      ) : m.success(`专家「${$.name}」创建成功`), await Kr(J.id), S(!1), setTimeout(() => {
        t(), n();
      }, 0);
    } catch (J) {
      m.error(J.message || "创建专家失败");
    } finally {
      f(!1);
    }
  }, V = ti.filter(($) => {
    if (!E.trim()) return !0;
    const J = E.toLowerCase();
    return $.name.toLowerCase().includes(J) || $.description.toLowerCase().includes(J) || $.category.toLowerCase().includes(J);
  }), I = async ($) => {
    f(!0);
    try {
      const J = await de("/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: $.name,
          description: $.description,
          skill_names: $.recommended_skills
        })
      });
      await dn(
        J.id,
        "AGENTS.md",
        $.system_prompt
      );
      const F = await rr(J.id);
      F.approval_level = $.approval_level, await de(`/agents/${encodeURIComponent(J.id)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(F)
      }), await Kr(J.id), m.success(`专家「${$.name}」创建成功`), t(), n();
    } catch (J) {
      m.error(J.message || "创建专家失败");
    } finally {
      f(!1);
    }
  };
  return r.createElement(
    r.Fragment,
    null,
    r.createElement(
      l,
      {
        open: e,
        onCancel: t,
        footer: null,
        title: "选择专家模板",
        width: 800,
        maskClosable: !0,
        keyboard: !0
      },
      r.createElement(
        "div",
        { style: { marginBottom: 16 } },
        r.createElement(i, {
          placeholder: "搜索模板名称或类别...",
          value: E,
          onChange: ($) => v($.target.value),
          allowClear: !0
        })
      ),
      y ? r.createElement(
        "div",
        { style: { textAlign: "center", padding: 60 } },
        r.createElement(u, { size: "large" }),
        r.createElement(
          "div",
          {
            style: {
              marginTop: 12,
              color: "var(--ant-color-text-tertiary, #8c8c8c)"
            }
          },
          "正在创建专家..."
        )
      ) : r.createElement(
        c,
        { gutter: [12, 12] },
        // ── Blank template card (always first) ──
        E.trim() ? null : r.createElement(
          d,
          { xs: 24, sm: 12 },
          r.createElement(
            o,
            {
              hoverable: !0,
              size: "small",
              onClick: () => S(!0),
              style: {
                cursor: "pointer",
                height: "100%",
                border: "2px dashed var(--ant-color-border, #d9d9d9)",
                background: "var(--ant-color-fill-quaternary, #fafafa)"
              }
            },
            r.createElement(
              "div",
              {
                style: {
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 10,
                  marginBottom: 8
                }
              },
              r.createElement(
                "span",
                {
                  style: {
                    fontSize: 28,
                    color: "var(--ant-color-text-tertiary, #8c8c8c)"
                  }
                },
                h ? r.createElement(h) : "📝"
              ),
              r.createElement(
                "div",
                { style: { flex: 1 } },
                r.createElement(
                  w,
                  { strong: !0, style: { fontSize: 15 } },
                  "从空白模版开始创建"
                ),
                r.createElement(
                  "div",
                  null,
                  r.createElement(
                    s,
                    { color: "default", style: { fontSize: 10 } },
                    "空白"
                  )
                )
              )
            ),
            r.createElement(
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
        ...V.map(
          ($) => r.createElement(
            d,
            { key: $.id, xs: 24, sm: 12 },
            r.createElement(
              o,
              {
                hoverable: !0,
                size: "small",
                onClick: () => I($),
                style: { cursor: "pointer", height: "100%" }
              },
              r.createElement(
                "div",
                {
                  style: {
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 10,
                    marginBottom: 8
                  }
                },
                r.createElement(et, {
                  name: $.name,
                  size: 40
                }),
                r.createElement(
                  "div",
                  { style: { flex: 1 } },
                  r.createElement(
                    w,
                    { strong: !0, style: { fontSize: 15 } },
                    $.name
                  ),
                  r.createElement(
                    "div",
                    null,
                    r.createElement(
                      s,
                      { color: "blue", style: { fontSize: 10 } },
                      $.category
                    ),
                    $.approval_level === "MANUAL" ? r.createElement(
                      s,
                      { color: "orange", style: { fontSize: 10 } },
                      "需审批"
                    ) : null
                  )
                )
              ),
              r.createElement(
                "div",
                {
                  style: {
                    fontSize: 12,
                    color: "#595959",
                    lineHeight: 1.5
                  }
                },
                bn($.description, r)
              )
            )
          )
        )
      )
    ),
    // ── Blank template creation modal (sibling, not nested inside Modal) ──
    r.createElement(ii, {
      open: g,
      onCancel: () => S(!1),
      onCreate: z
    })
  );
}
function _t(e) {
  return typeof e == "object" && e !== null && !Array.isArray(e);
}
function oi(e) {
  const t = e.trim();
  if (!t) return [];
  const n = JSON.parse(t);
  if (!_t(n))
    throw new Error("MCP 配置必须是 JSON 对象");
  const r = n.mcpServers ?? n;
  if (!_t(r))
    throw new Error("mcpServers 必须是 JSON 对象");
  return Object.entries(r).map(([a, l]) => {
    const o = a.trim();
    if (!o || !_t(l))
      throw new Error(`MCP「${a || "未命名"}」配置无效`);
    const s = typeof l.url == "string" ? l.url : "", i = typeof l.command == "string" ? l.command : "";
    if (!s && !i)
      throw new Error(`MCP「${o}」需要配置 url 或 command`);
    const d = (typeof l.transport == "string" ? l.transport : typeof l.type == "string" ? l.type : "") === "sse" ? "sse" : s ? "streamable_http" : "stdio";
    return {
      clientKey: o,
      client: {
        name: typeof l.name == "string" ? l.name : o,
        description: typeof l.description == "string" ? l.description : "",
        enabled: typeof l.enabled == "boolean" ? l.enabled : !0,
        transport: d,
        url: s,
        command: i,
        args: Array.isArray(l.args) ? l.args : [],
        env: _t(l.env) ? l.env : {},
        cwd: typeof l.cwd == "string" ? l.cwd : "",
        headers: _t(l.headers) ? l.headers : {}
      }
    };
  });
}
function ii({
  open: e,
  onCancel: t,
  onCreate: n
}) {
  const r = k().React, { useState: a, useEffect: l, useMemo: o } = r, {
    Modal: s,
    Input: i,
    Select: c,
    Button: d,
    Row: u,
    Col: m,
    Spin: p,
    Tag: w,
    Typography: h,
    message: y
  } = k().antd, { CheckCircleOutlined: f } = k().antdIcons || {}, { Text: E } = h, [v, g] = a(""), [S, z] = a(""), [V, I] = a(""), [$, J] = a(""), [F, B] = a([]), [C, x] = a([]), [_, T] = a(!1), [W, N] = a(""), [G, U] = a(!1);
  l(() => {
    e && (g(""), z(""), I(""), J(""), x([]), N(""), U(!1), T(!0), xn(!0).then(B).catch((te) => {
      B([]), y.error(te.message || "加载技能池失败");
    }).finally(() => T(!1)));
  }, [e]);
  const A = S.trim(), ee = o(() => A ? A.length < 2 || A.length > 64 ? "ID 长度需为 2-64 个字符" : /^[a-zA-Z0-9][a-zA-Z0-9_-]*[a-zA-Z0-9]$/.test(A) ? A === "default" ? "default 是系统保留 ID" : "" : "仅允许字母、数字、连字符和下划线，且不能以符号开头或结尾" : "", [A]), ae = o(() => {
    try {
      return { clients: oi(W), error: "" };
    } catch (te) {
      return {
        clients: [],
        error: te.message || "MCP 配置无效"
      };
    }
  }, [W]), D = () => {
    const te = v.trim();
    if (!te) {
      y.warning("请输入专家名称");
      return;
    }
    if (ee) {
      y.warning(ee);
      return;
    }
    if (ae.error) {
      y.warning(ae.error);
      return;
    }
    U(!0), Promise.resolve(
      n({
        id: A,
        name: te,
        description: V.trim(),
        systemPrompt: $,
        skillNames: C,
        mcpClients: ae.clients
      })
    ).finally(() => U(!1));
  }, M = () => {
    x(
      F.filter((te) => te.source === "builtin").map((te) => te.name)
    );
  }, oe = (te, K) => r.createElement(
    "div",
    {
      style: {
        display: "flex",
        alignItems: "baseline",
        justifyContent: "space-between",
        gap: 12,
        marginBottom: 12
      }
    },
    r.createElement(
      E,
      { strong: !0, style: { fontSize: 15 } },
      te
    ),
    K ? r.createElement(
      E,
      { type: "secondary", style: { fontSize: 12 } },
      K
    ) : null
  );
  return r.createElement(
    s,
    {
      open: e,
      title: "创建专家",
      onCancel: t,
      onOk: D,
      okText: "创建专家",
      cancelText: "取消",
      okButtonProps: { loading: G },
      maskClosable: !0,
      keyboard: !0,
      width: 880,
      styles: { body: { maxHeight: "72vh", overflowY: "auto", paddingTop: 8 } }
    },
    r.createElement(
      "div",
      { style: { paddingBottom: 20 } },
      oe("基本信息", "ID 留空时自动生成"),
      r.createElement(
        u,
        { gutter: [16, 12] },
        r.createElement(
          m,
          { xs: 24, md: 12 },
          r.createElement(
            "label",
            { style: { display: "block", fontSize: 13, marginBottom: 6 } },
            "专家名称",
            r.createElement(
              "span",
              { style: { color: "#ff4d4f", marginLeft: 4 } },
              "*"
            )
          ),
          r.createElement(i, {
            placeholder: "例如：合同审查专家",
            value: v,
            onChange: (te) => g(te.target.value),
            maxLength: 50
          })
        ),
        r.createElement(
          m,
          { xs: 24, md: 12 },
          r.createElement(
            "label",
            { style: { display: "block", fontSize: 13, marginBottom: 6 } },
            "智能体 ID（可选）"
          ),
          r.createElement(i, {
            placeholder: "例如：contract-reviewer",
            value: S,
            onChange: (te) => z(te.target.value),
            maxLength: 64,
            status: ee ? "error" : void 0
          }),
          ee ? r.createElement(
            "div",
            { style: { color: "#ff4d4f", fontSize: 12, marginTop: 4 } },
            ee
          ) : null
        ),
        r.createElement(
          m,
          { span: 24 },
          r.createElement(
            "label",
            { style: { display: "block", fontSize: 13, marginBottom: 6 } },
            "专家描述（可选）"
          ),
          r.createElement(i.TextArea, {
            placeholder: "简要描述该专家的职责和能力",
            value: V,
            onChange: (te) => I(te.target.value),
            rows: 2,
            maxLength: 200,
            showCount: !0
          })
        )
      )
    ),
    r.createElement(
      "div",
      { style: { borderTop: "1px solid #f0f0f0", padding: "20px 0" } },
      oe("角色指令", "保存为 AGENTS.md"),
      r.createElement(i.TextArea, {
        placeholder: "定义专家的角色、目标、工作方式和输出要求；留空时将根据名称与描述生成基础指令",
        value: $,
        onChange: (te) => J(te.target.value),
        rows: 6,
        style: {
          fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
          fontSize: 12
        }
      })
    ),
    r.createElement(
      "div",
      { style: { borderTop: "1px solid #f0f0f0", paddingTop: 20 } },
      oe("初始能力"),
      r.createElement(
        u,
        { gutter: [20, 16], align: "top" },
        r.createElement(
          m,
          { xs: 24, md: 12 },
          r.createElement(
            "div",
            {
              style: {
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 8
              }
            },
            r.createElement(E, { strong: !0 }, "初始技能"),
            r.createElement(
              "div",
              { style: { display: "flex", gap: 4 } },
              r.createElement(
                d,
                {
                  size: "small",
                  onClick: M,
                  disabled: _
                },
                "内置"
              ),
              r.createElement(
                d,
                {
                  size: "small",
                  onClick: () => x([]),
                  disabled: C.length === 0
                },
                "清空"
              )
            )
          ),
          _ ? r.createElement(
            "div",
            { style: { textAlign: "center", padding: 32 } },
            r.createElement(p, { size: "small" })
          ) : r.createElement(c, {
            mode: "multiple",
            value: C,
            onChange: x,
            placeholder: "搜索并选择技能",
            showSearch: !0,
            allowClear: !0,
            optionFilterProp: "label",
            maxTagCount: "responsive",
            style: { width: "100%" },
            options: F.map((te) => ({
              value: te.name,
              label: te.name
            })),
            notFoundContent: "暂无可用技能"
          }),
          r.createElement(
            "div",
            { style: { marginTop: 8, minHeight: 22 } },
            C.length > 0 ? r.createElement(
              w,
              { color: "blue" },
              `已选择 ${C.length} 个技能`
            ) : r.createElement(
              E,
              { type: "secondary", style: { fontSize: 12 } },
              "暂不添加技能"
            )
          )
        ),
        r.createElement(
          m,
          { xs: 24, md: 12 },
          r.createElement(
            E,
            { strong: !0, style: { display: "block", marginBottom: 8 } },
            "初始 MCP"
          ),
          r.createElement(i.TextArea, {
            placeholder: `{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem"]
    }
  }
}`,
            value: W,
            onChange: (te) => N(te.target.value),
            rows: 8,
            status: ae.error ? "error" : void 0,
            style: {
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
              fontSize: 12
            }
          }),
          r.createElement(
            "div",
            { style: { marginTop: 8, minHeight: 22 } },
            ae.error ? r.createElement(
              E,
              { type: "danger", style: { fontSize: 12 } },
              ae.error
            ) : ae.clients.length > 0 ? r.createElement(
              w,
              {
                color: "green",
                icon: f ? r.createElement(f) : void 0
              },
              `已识别 ${ae.clients.length} 个 MCP`
            ) : r.createElement(
              E,
              { type: "secondary", style: { fontSize: 12 } },
              "暂不添加 MCP"
            )
          )
        )
      )
    )
  );
}
const el = "ugsci_custom_teams";
function si(e) {
  if (!e || typeof e != "object") return !1;
  const t = e;
  return typeof t.id == "string" && typeof t.name == "string" && typeof t.taskTemplate == "string" && typeof t.orchestrationPrompt == "string" && Array.isArray(t.members);
}
function ci() {
  try {
    const e = JSON.parse(
      localStorage.getItem(el) || "[]"
    );
    return Array.isArray(e) ? e.filter(si) : [];
  } catch {
    return [];
  }
}
function di(e) {
  try {
    localStorage.setItem(el, JSON.stringify(e));
  } catch {
  }
}
function ui(e) {
  const t = {
    id: e.id,
    name: e.name,
    description: e.description,
    emoji: e.emoji,
    category: e.category,
    mode: e.mode,
    members: e.members,
    steps: e.steps || [],
    orchestrationPrompt: e.orchestrationPrompt,
    coordinatorName: e.coordinatorName || void 0,
    taskTemplate: e.taskTemplate,
    maxReviewRounds: e.maxReviewRounds || 2,
    routingInstruction: e.routingInstruction || "",
    successCriteria: e.successCriteria || ""
  };
  return e.updatedAt && (t.expectedUpdatedAt = e.updatedAt / 1e3), e.version && (t.expectedVersion = e.version), t;
}
function mi(e) {
  return {
    id: e.team_id,
    name: e.name,
    emoji: e.emoji || "🤝",
    category: e.category || "自定义",
    description: e.description || `${e.name}（${e.members.length} 位专家）`,
    mode: e.mode,
    members: e.members,
    steps: e.steps,
    orchestrationPrompt: e.orchestrationPrompt || "",
    coordinatorName: e.coordinatorName,
    taskTemplate: e.taskTemplate || `请执行以下任务：
任务描述：{任务描述}`,
    maxReviewRounds: e.maxReviewRounds || 2,
    routingInstruction: e.routingInstruction || "",
    successCriteria: e.successCriteria || "",
    createdAt: e.createdAt ? e.createdAt * 1e3 : Date.now(),
    updatedAt: e.updatedAt ? e.updatedAt * 1e3 : Date.now(),
    version: e.version || 1,
    custom: !0
  };
}
async function Fn(e = !0) {
  const t = await tt("/ugsci/team/custom");
  if (!t.ok) {
    const a = await t.text().catch(() => "");
    throw new Error(a || `HTTP ${t.status}`);
  }
  const r = (await t.json()).map(mi);
  return e && di(r), r;
}
async function tl(e) {
  const t = await tt("/ugsci/team/custom", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(ui(e))
  });
  if (!t.ok) {
    const r = await t.text().catch(() => "");
    throw new Error(r || `HTTP ${t.status}`);
  }
  const n = await t.json();
  return { ...e, id: n.team_id };
}
async function pi(e) {
  const t = await tt(
    `/ugsci/team/custom/${encodeURIComponent(e)}`,
    { method: "DELETE" }
  );
  if (!t.ok && t.status !== 404) {
    const n = await t.text().catch(() => "");
    throw new Error(n || `HTTP ${t.status}`);
  }
}
async function fi() {
  const e = ci();
  if (e.length === 0) return;
  const t = await Fn(!1), n = new Set(t.map((r) => r.id));
  await Promise.all(
    e.filter((r) => !n.has(r.id)).map((r) => tl(r))
  );
}
async function gi(e) {
  var a, l;
  const t = (a = e.body) == null ? void 0 : a.getReader();
  if (!t) return;
  const n = new TextDecoder();
  let r = "";
  try {
    for (; ; ) {
      const { done: o, value: s } = await t.read();
      if (o) break;
      r += n.decode(s, { stream: !0 });
      let i;
      for (; (i = r.indexOf(`

`)) >= 0; ) {
        const c = r.slice(0, i);
        r = r.slice(i + 2);
        for (const d of c.split(`
`)) {
          if (!d.startsWith("data: ")) continue;
          const u = d.slice(6);
          let m;
          try {
            m = JSON.parse(u);
          } catch {
            continue;
          }
          if (m.error) {
            const p = m.error, w = typeof p == "string" ? p : (p == null ? void 0 : p.message) || "工作流启动失败";
            throw new Error(w);
          }
          if (m.object === "response" || m.type === "response") {
            const p = m.status;
            if (p === "failed" || p === "error") {
              const w = ((l = m.error) == null ? void 0 : l.message) || "工作流启动失败";
              throw new Error(w);
            }
            return;
          }
          if (m.object === "content" || m.type === "message")
            return;
        }
      }
    }
  } finally {
    t.releaseLock();
  }
}
async function yi(e, t, n) {
  const r = `console:default:team-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, a = await tt("/chats", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Agent-Id": e
    },
    body: JSON.stringify({
      session_id: r,
      user_id: "default",
      channel: "console",
      name: n ? `团队：${n}` : "团队任务"
    })
  });
  if (!a.ok) {
    const i = await a.text().catch(() => "");
    throw new Error(
      i || `创建会话失败 (HTTP ${a.status})`
    );
  }
  const o = (await a.json()).id, s = await tt("/console/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Agent-Id": e
    },
    body: JSON.stringify({
      channel: "console",
      user_id: "default",
      session_id: r,
      stream: !0,
      input: [
        {
          role: "user",
          content: [{ type: "text", text: t }]
        }
      ]
    })
  });
  if (!s.ok) {
    const i = await s.text().catch(() => "");
    throw new Error(i || `HTTP ${s.status}`);
  }
  return await gi(s), o;
}
function nl(e, t) {
  var a;
  const n = t.replace(/\s+/g, ""), r = e.find(
    (l) => l.name === t || l.name.replace(/\s+/g, "") === n
  );
  return r ? r.id : ((a = e.find(
    (l) => l.name.includes(t) || t.includes(l.name) || l.name.replace(/\s+/g, "").includes(n)
  )) == null ? void 0 : a.id) || null;
}
function rl() {
  var t;
  const e = (t = window.QwenPaw) == null ? void 0 : t.host;
  if (!e) throw new Error("[ugsci] QwenPaw.host not available");
  return e;
}
async function al(e, t) {
  const n = await e.text().catch(() => "");
  if (!n) return t;
  try {
    const r = JSON.parse(n);
    if (typeof r.detail == "string") return r.detail;
  } catch {
  }
  return n;
}
async function cr(e, t, n) {
  const r = await tt(e, {
    headers: t ? { "X-Agent-Id": t } : void 0,
    signal: n
  });
  if (!r.ok)
    throw new Error(
      await al(r, `HTTP ${r.status}`)
    );
  return await r.json();
}
function hi(e, t) {
  return cr("/ugsci/team/state", e, t);
}
async function Ei(e, t) {
  const n = await tt("/ugsci/team/runs", {
    headers: { "X-Agent-Id": e },
    signal: t
  });
  if (!n.ok)
    throw new Error(
      await al(
        n,
        `Failed to load team runs: ${n.status}`
      )
    );
  return await n.json();
}
const bi = 5e3;
function Xr({
  activeOnly: e = !1,
  enabled: t = !0
}) {
  const n = rl(), r = n.React, { useCallback: a, useEffect: l, useRef: o, useState: s } = r, { Alert: i, Button: c, Card: d, Empty: u, Spin: m, Tag: p, Typography: w } = n.antd, { Text: h, Paragraph: y } = w, f = n.useSelectedAgent ? n.useSelectedAgent() : { id: "default" }, E = (f == null ? void 0 : f.id) || "default", [v, g] = s([]), [S, z] = s(!0), [V, I] = s(null), [$, J] = s(!1), F = o(null), B = o(0), C = o(!1), x = o(E), _ = a(
    async (N = !0, G = !0) => {
      var ee;
      if (!t || !G && C.current) return;
      (ee = F.current) == null || ee.abort();
      const U = new AbortController();
      F.current = U;
      const A = ++B.current;
      C.current = !0, N && z(!0);
      try {
        const ae = await Ei(E, U.signal);
        if (U.signal.aborted || A !== B.current)
          return;
        g(ae), J(!0), I(null);
      } catch (ae) {
        if (U.signal.aborted || A !== B.current)
          return;
        I(
          ae instanceof Error ? ae.message : "讨论运行记录加载失败"
        );
      } finally {
        !U.signal.aborted && A === B.current && (F.current = null, C.current = !1, z(!1));
      }
    },
    [E, t]
  );
  if (l(() => {
    var G;
    if (!t) {
      (G = F.current) == null || G.abort(), F.current = null, C.current = !1, B.current += 1;
      return;
    }
    x.current !== E && (x.current = E, g([]), I(null), J(!1)), _(!0, !0);
    const N = e ? window.setInterval(() => {
      _(!1, !1);
    }, bi) : null;
    return () => {
      var U;
      N !== null && window.clearInterval(N), (U = F.current) == null || U.abort(), F.current = null, C.current = !1, B.current += 1;
    };
  }, [e, E, t, _]), S && !$) return r.createElement(m);
  if (V && !$)
    return r.createElement(i, {
      type: "warning",
      message: "讨论运行记录加载失败",
      description: V,
      action: r.createElement(
        c,
        { size: "small", onClick: () => void _(!0, !0), loading: S },
        "重试"
      )
    });
  const T = v.filter(
    (N) => e ? N.status === "active" : N.status !== "active"
  ), W = (N) => V ? r.createElement(
    r.Fragment,
    null,
    r.createElement(i, {
      type: "warning",
      message: "讨论运行记录更新失败，当前显示上次成功读取的结果",
      description: V,
      action: r.createElement(
        c,
        {
          size: "small",
          onClick: () => void _(!0, !0),
          loading: S
        },
        "重试"
      )
    }),
    N
  ) : N;
  return T.length === 0 ? W(
    r.createElement(
      u,
      {
        description: e ? "暂无进行中的专家团讨论" : "暂无历史讨论"
      },
      r.createElement(
        c,
        { size: "small", onClick: () => void _(!0, !0), loading: S },
        "刷新"
      )
    )
  ) : W(
    r.createElement(
      r.Fragment,
      null,
      r.createElement(
        "div",
        {
          style: {
            display: "flex",
            justifyContent: "flex-end",
            marginBottom: 8
          }
        },
        r.createElement(
          c,
          { size: "small", onClick: () => void _(!0, !0), loading: S },
          "刷新"
        )
      ),
      r.createElement(
        "div",
        { style: { display: "flex", flexDirection: "column", gap: 8 } },
        ...T.map(
          (N) => r.createElement(
            d,
            { key: N.instance_id, size: "small" },
            r.createElement(
              "div",
              { style: { display: "flex", alignItems: "center", gap: 8 } },
              r.createElement(
                h,
                { strong: !0 },
                N.team_name || N.team_id
              ),
              r.createElement(
                p,
                {
                  color: N.status === "completed" ? "green" : N.status === "terminated" ? "orange" : "blue"
                },
                N.status
              ),
              r.createElement(p, null, N.current_phase),
              r.createElement(
                h,
                { type: "secondary" },
                `迭代 ${N.iteration}`
              )
            ),
            r.createElement(
              y,
              { ellipsis: { rows: 2 }, style: { margin: "8px 0 0" } },
              N.task || "暂无任务描述"
            )
          )
        )
      )
    )
  );
}
async function vi() {
  try {
    return (await cr(
      "/ugsci/team/preset-teams"
    )).teams;
  } catch {
    return null;
  }
}
async function wi() {
  try {
    return (await cr(
      "/ugsci/team/roles"
    )).roles;
  } catch {
    return null;
  }
}
const Si = {
  plan: { label: "规划", color: "#1677ff", icon: "📋" },
  dispatch: { label: "分派", color: "#13c2c2", icon: "🚀" },
  verify: { label: "验证", color: "#fa8c16", icon: "🔍" },
  synthesize: { label: "综合", color: "#722ed1", icon: "📊" },
  completed: { label: "完成", color: "#52c41a", icon: "✅" }
}, Yr = [
  "plan",
  "dispatch",
  "verify",
  "synthesize",
  "completed"
], Qr = 5e3, xi = 3e4;
function ki({ enabled: e = !0 }) {
  const t = rl(), n = t.React, { useState: r, useEffect: a, useCallback: l, useRef: o } = n, { Card: s, Tag: i, Typography: c, Button: d, Steps: u, Empty: m, Alert: p, Spin: w } = t.antd, { ReloadOutlined: h } = t.antdIcons || {}, { Text: y, Paragraph: f } = c, E = t.useSelectedAgent ? t.useSelectedAgent() : { id: "default" }, v = (E == null ? void 0 : E.id) || "default", [g, S] = r(null), [z, V] = r(!1), [I, $] = r(null), J = o(null), F = o(0), B = o(0), C = o(0), x = o(null), _ = o(!1), T = l(
    async (K, ue = !0) => {
      var ge;
      if (!e || !ue && _.current) return;
      (ge = x.current) == null || ge.abort();
      const L = new AbortController();
      x.current = L;
      const ie = ++C.current;
      _.current = !0, K && V(!0);
      try {
        const X = await hi(v, L.signal);
        if (L.signal.aborted || ie !== C.current)
          return;
        F.current = 0, B.current = 0, J.current = X, S(X), $(null);
      } catch (X) {
        if (L.signal.aborted || ie !== C.current)
          return;
        F.current += 1;
        const ce = Math.min(
          xi,
          Qr * 2 ** (F.current - 1)
        );
        B.current = Date.now() + ce, $(
          X instanceof Error ? X.message : "专家团状态加载失败"
        );
      } finally {
        !L.signal.aborted && ie === C.current && (x.current = null, _.current = !1, V(!1));
      }
    },
    [v, e]
  ), W = l(() => (F.current = 0, B.current = 0, T(!0)), [T]);
  if (a(() => {
    var ue;
    if ((ue = x.current) == null || ue.abort(), x.current = null, _.current = !1, C.current += 1, F.current = 0, B.current = 0, J.current = null, S(null), $(null), !e) return;
    W();
    const K = window.setInterval(() => {
      var L, ie;
      Date.now() < B.current || ((L = J.current) == null ? void 0 : L.status) === "completed" || ((ie = J.current) == null ? void 0 : ie.status) === "terminated" || T(!1, !1);
    }, Qr);
    return () => {
      var L;
      window.clearInterval(K), (L = x.current) == null || L.abort(), x.current = null, _.current = !1, C.current += 1;
    };
  }, [v, e, T, W]), z && !g && !I)
    return n.createElement(w);
  if (I && !g)
    return n.createElement(p, {
      type: "warning",
      showIcon: !0,
      message: "专家团状态加载失败",
      description: I,
      style: { marginBottom: 16 },
      action: n.createElement(
        d,
        { size: "small", onClick: W, loading: z },
        "重试"
      )
    });
  const N = (K) => I ? n.createElement(
    n.Fragment,
    null,
    n.createElement(p, {
      type: "warning",
      showIcon: !0,
      message: "状态更新失败，当前显示上次成功读取的结果",
      description: I,
      style: { marginBottom: 16 },
      action: n.createElement(
        d,
        { size: "small", onClick: W, loading: z },
        "重试"
      )
    }),
    K
  ) : K;
  if ((g == null ? void 0 : g.status) === "unreadable")
    return N(
      n.createElement(p, {
        type: "warning",
        showIcon: !0,
        message: "专家团状态暂时无法读取",
        description: `实例 ${g.instance_id || "未知"} 的状态文件需要检查。`,
        style: { marginBottom: 16 },
        action: n.createElement(
          d,
          { size: "small", onClick: W, loading: z },
          "重试"
        )
      })
    );
  if (!g || !g.active) {
    if ((g == null ? void 0 : g.status) === "completed" || (g == null ? void 0 : g.status) === "terminated") {
      const K = g.status === "completed";
      return N(
        n.createElement(p, {
          type: K ? "success" : "info",
          showIcon: !0,
          message: K ? "专家团工作流已完成" : "专家团工作流已终止",
          description: K ? `实例 ${g.instance_id || "未知"} 已完成，结果文件保留在工作区。` : `原因：${g.state.termination_reason || "未知"}`,
          style: { marginBottom: 16 }
        })
      );
    }
    return N(
      n.createElement(m, {
        description: "暂无活跃的专家团工作流",
        style: { padding: 24 }
      })
    );
  }
  const G = g.state, U = G.current_phase || "plan", A = Yr.indexOf(U), ee = G.team_name || "未知团队", ae = G.team_mode || "pipeline", D = G.iteration || 0, M = G.members || [], oe = G.verify_retries || 0, te = {
    pipeline: "顺序交接",
    coordinator: "主管协作",
    roundtable: "并行汇聚",
    router: "智能路由",
    review_loop: "评审迭代",
    debate: "多方论证"
  };
  return N(
    n.createElement(
      s,
      {
        size: "small",
        style: { marginBottom: 16 },
        title: n.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 8 } },
          n.createElement("span", { style: { fontSize: 16 } }, "🔄"),
          n.createElement(
            y,
            { strong: !0 },
            `${ee} — 工作流状态`
          ),
          n.createElement(
            i,
            { color: "blue", style: { fontSize: 10 } },
            te[ae] || ae
          ),
          n.createElement(
            i,
            { style: { fontSize: 10 } },
            `迭代 ${D}`
          ),
          oe > 0 ? n.createElement(
            i,
            { color: "orange", style: { fontSize: 10 } },
            `验证重试 ${oe}`
          ) : null
        ),
        extra: n.createElement(
          d,
          {
            size: "small",
            type: "text",
            icon: h ? n.createElement(h) : void 0,
            onClick: W,
            loading: z
          },
          "刷新"
        )
      },
      n.createElement(u, {
        current: A,
        size: "small",
        items: Yr.map((K) => {
          const ue = Si[K];
          return {
            title: `${ue.icon} ${ue.label}`,
            description: K === "plan" ? "分析任务，创建任务分解" : K === "dispatch" ? "分派专家执行任务" : K === "verify" ? "交叉验证专家结果" : K === "synthesize" ? "综合形成最终报告" : "工作流完成"
          };
        })
      }),
      n.createElement(
        "div",
        {
          style: {
            marginTop: 12,
            display: "flex",
            gap: 6,
            flexWrap: "wrap"
          }
        },
        ...M.map(
          (K, ue) => n.createElement(
            i,
            { key: `${K.name}-${ue}`, style: { fontSize: 11 } },
            `${K.emoji || ""} ${K.name}（${K.role}）`
          )
        )
      ),
      G.task ? n.createElement(
        f,
        {
          style: {
            fontSize: 12,
            marginTop: 8,
            marginBottom: 0,
            color: "var(--ant-color-text-secondary, #666)"
          },
          ellipsis: { rows: 2 }
        },
        `任务: ${G.task}`
      ) : null
    )
  );
}
function Ci({ team: e }) {
  const t = k().React, { Typography: n, Tag: r } = k().antd, { Text: a } = n, l = {
    pipeline: "→",
    roundtable: "⇄",
    coordinator: "⊙",
    router: "◇",
    review_loop: "↻",
    debate: "⇄"
  }, o = {
    pipeline: "#13c2c2",
    roundtable: "#722ed1",
    coordinator: "#1677ff",
    router: "#d46b08",
    review_loop: "#389e0d",
    debate: "#c41d7f"
  }, s = e.steps || [], i = e.mode === "roundtable" || e.mode === "router", c = {
    pipeline: "顺序交接",
    roundtable: "并行汇聚",
    coordinator: "主管协作",
    router: "智能路由",
    review_loop: "评审迭代",
    debate: "多方论证"
  };
  return t.createElement(
    "div",
    {
      style: {
        padding: "12px 16px",
        background: "var(--ant-color-fill-quaternary, #fafafa)",
        borderRadius: 8,
        border: "1px dashed var(--ant-color-border, #d9d9d9)"
      }
    },
    t.createElement(
      a,
      {
        type: "secondary",
        style: { fontSize: 12, display: "block", marginBottom: 8 }
      },
      `OMP 编排拓扑 · ${c[e.mode] || e.mode}`
    ),
    t.createElement(
      "div",
      {
        style: {
          display: "flex",
          flexDirection: i ? "row" : "column",
          gap: 8,
          alignItems: i ? "flex-start" : "stretch",
          flexWrap: "wrap"
        }
      },
      ...s.length > 0 ? s.map((d, u) => [
        u > 0 && !i ? t.createElement(
          "div",
          {
            key: `arrow-${u}`,
            style: {
              textAlign: "center",
              color: o[e.mode],
              fontSize: 14
            }
          },
          l[e.mode]
        ) : null,
        t.createElement(
          "div",
          {
            key: `step-${u}`,
            style: {
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "6px 10px",
              background: "var(--ant-color-bg-container, #fff)",
              borderRadius: 6,
              border: `1px solid ${o[e.mode]}33`,
              fontSize: 12,
              flex: i ? "1 1 200px" : "initial"
            }
          },
          t.createElement(et, {
            name: d.agentName,
            size: 24
          }),
          t.createElement(
            "div",
            null,
            t.createElement(
              a,
              { strong: !0, style: { fontSize: 12 } },
              d.agentName
            ),
            t.createElement(
              "div",
              {
                style: {
                  fontSize: 11,
                  color: "var(--ant-color-text-tertiary, #8c8c8c)",
                  maxWidth: 250
                }
              },
              d.instruction
            ),
            t.createElement(
              r,
              {
                ...d.passContext ? { color: "blue" } : {},
                style: { fontSize: 9, marginTop: 2 }
              },
              d.passContext ? "传递上下文" : "独立"
            )
          )
        )
      ]).flat() : e.members.map((d, u) => [
        u > 0 && !i ? t.createElement(
          "div",
          {
            key: `arrow-${u}`,
            style: {
              textAlign: "center",
              color: o[e.mode],
              fontSize: 14
            }
          },
          l[e.mode]
        ) : null,
        t.createElement(
          "div",
          {
            key: `member-${u}`,
            style: {
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "6px 10px",
              background: "var(--ant-color-bg-container, #fff)",
              borderRadius: 6,
              border: `1px solid ${o[e.mode]}33`,
              fontSize: 12,
              flex: i ? "1 1 150px" : "initial"
            }
          },
          t.createElement(et, {
            name: d.name,
            size: 24
          }),
          t.createElement(
            "div",
            null,
            t.createElement(
              a,
              { strong: !0, style: { fontSize: 12 } },
              d.name
            ),
            t.createElement(
              "div",
              { style: { fontSize: 11, color: "var(--ant-color-text-tertiary, #8c8c8c)" } },
              d.role
            )
          )
        )
      ]).flat()
    )
  );
}
function Yt(e) {
  const t = e.replace(/\s+/g, "").toLowerCase();
  return t.includes("测井") ? "log-analyst" : t.includes("地球物理") ? "geophysicist" : t.includes("油藏") ? "reservoir-engineer" : t.includes("钻井") ? "drilling-engineer" : t.includes("采油") || t.includes("生产") ? "production-engineer" : t.includes("pvt") || t.includes("物性") ? "pvt-analyst" : t.includes("审核") || t.includes("verifier") ? "domain-reviewer" : t.includes("master") || t.includes("planner") ? "planner" : "analyst";
}
const Ti = [
  { key: "analyst", display_name: "需求分析师", allowed_tools: [], skills: [], prompt: "" },
  { key: "reservoir-engineer", display_name: "油藏工程师", allowed_tools: [], skills: [], prompt: "" },
  { key: "log-analyst", display_name: "测井分析师", allowed_tools: [], skills: [], prompt: "" },
  { key: "geophysicist", display_name: "地球物理专家", allowed_tools: [], skills: [], prompt: "" },
  { key: "drilling-engineer", display_name: "钻井工程师", allowed_tools: [], skills: [], prompt: "" },
  { key: "production-engineer", display_name: "采油工程师", allowed_tools: [], skills: [], prompt: "" },
  { key: "pvt-analyst", display_name: "PVT 分析师", allowed_tools: [], skills: [], prompt: "" },
  { key: "domain-reviewer", display_name: "领域审核专家", allowed_tools: [], skills: [], prompt: "" },
  { key: "planner", display_name: "规划者", allowed_tools: [], skills: [], prompt: "" },
  { key: "verifier", display_name: "验证者", allowed_tools: [], skills: [], prompt: "" }
];
function _i({
  open: e,
  onClose: t,
  agents: n,
  editingTeam: r,
  onSaved: a
}) {
  const l = k().React, { useState: o, useEffect: s, useCallback: i } = l, {
    Modal: c,
    Input: d,
    Button: u,
    Select: m,
    Tag: p,
    Typography: w,
    Switch: h,
    Empty: y,
    message: f,
    Divider: E,
    Steps: v
  } = k().antd, { PlusOutlined: g, DeleteOutlined: S, SaveOutlined: z, ArrowRightOutlined: V } = k().antdIcons || {}, { Text: I, Paragraph: $ } = w, [J, F] = o(""), [B, C] = o("🤝"), [x, _] = o(""), [T, W] = o("pipeline"), [N, G] = o(""), [U, A] = o(""), [ee, ae] = o([]), [D, M] = o([]), [oe, te] = o(!1), [K, ue] = o(2), [L, ie] = o(""), [ge, X] = o(""), [ce, ne] = o({}), [xe, we] = o({}), [Be, ve] = o(
    Ti
  ), se = [
    { value: "pipeline", icon: "→", title: "顺序交接", description: "上一步产物成为下一位专家的上下文", topology: "A → B → C", accent: "#08979c" },
    { value: "roundtable", icon: "⇉", title: "并行汇聚", description: "独立并行分析，避免观点相互污染", topology: "A ∥ B ∥ C → 汇总", accent: "#531dab" },
    { value: "coordinator", icon: "◎", title: "主管协作", description: "主控专家拆解任务并按需组织成员", topology: "主管 → 专家组", accent: "#0958d9" },
    { value: "router", icon: "◇", title: "智能路由", description: "按任务能力需求选择最小充分专家集合", topology: "任务 → 路由 → 子集", accent: "#d46b08" },
    { value: "review_loop", icon: "↻", title: "评审迭代", description: "产出、独立审查、修订，直到满足标准", topology: "执行 ⇄ 评审", accent: "#389e0d" },
    { value: "debate", icon: "⚖", title: "多方论证", description: "独立立场、交叉质询，再由裁决者综合", topology: "观点 ⇄ 反驳 → 裁决", accent: "#c41d7f" }
  ];
  s(() => {
    e && (r ? (F(r.name), C(r.emoji), _(r.description), W(r.mode), G(r.coordinatorName || ""), A(r.taskTemplate), ae(r.steps || []), M(r.members.map((O) => O.name)), ue(r.maxReviewRounds || 2), ie(r.successCriteria || ""), X(r.routingInstruction || ""), ne(
      Object.fromEntries(
        r.members.map((O) => [
          O.name,
          O.bindingMode || (O.agentId ? "fixed" : "preferred")
        ])
      )
    ), we(
      Object.fromEntries(
        r.members.map((O) => [
          O.name,
          O.roleKey || Yt(O.name)
        ])
      )
    )) : (F(""), C("🤝"), _(""), W("pipeline"), G(""), A(`请执行以下任务：
任务描述：{任务描述}`), ae([]), M([]), ue(2), ie(""), X(""), ne({}), we({})));
  }, [e, r]), s(() => {
    e && wi().then((O) => {
      O != null && O.length && ve(O);
    });
  }, [e]);
  const Se = i(() => {
    if (T === "roundtable" || T === "debate" || T === "router") {
      const O = D.map((he) => ({
        agentName: he,
        instruction: "请给出你的专业评估意见",
        passContext: !1
      }));
      ae(O);
    } else if (T === "pipeline") {
      const O = new Map(ee.map((Z) => [Z.agentName, Z])), he = D.map((Z) => O.get(Z) || {
        agentName: Z,
        instruction: "请完成你的专业部分",
        passContext: !0
      });
      ae(he);
    }
  }, [T, D, ee]), Ie = (O) => {
    D.includes(O) || (M([...D, O]), ne({ ...ce, [O]: "fixed" }), we({
      ...xe,
      [O]: Yt(O)
    }), (T === "coordinator" || T === "debate") && !N && G(O));
  }, j = (O) => {
    const he = D.filter((be) => be !== O);
    M(he), ae(ee.filter((be) => be.agentName !== O));
    const Z = { ...ce };
    delete Z[O], ne(Z);
    const pe = { ...xe };
    delete pe[O], we(pe), N === O && G(he[0] || "");
  }, P = (O, he, Z) => {
    const pe = [...ee];
    pe[O] = { ...pe[O], [he]: Z }, ae(pe);
  }, le = async () => {
    if (!J.trim()) {
      f.warning("请输入团队名称");
      return;
    }
    if (D.length < 2) {
      f.warning("至少需要选择 2 个成员");
      return;
    }
    if (!U.trim()) {
      f.warning("请输入任务模板");
      return;
    }
    if ((T === "coordinator" || T === "debate") && !N) {
      f.warning(T === "debate" ? "请选择裁决者" : "请选择主控专家");
      return;
    }
    te(!0);
    try {
      let O = [...D];
      T === "coordinator" && N ? O = [N, ...O.filter((be) => be !== N)] : T === "debate" && N && (O = [...O.filter((be) => be !== N), N]);
      const he = O.map(
        (be) => {
          var De;
          const Re = n.find((Ae) => Ae.name === be), R = ce[be] || "fixed", fe = xe[be] || Yt(be), _e = Be.find((Ae) => Ae.key === fe);
          return {
            name: be,
            role: (_e == null ? void 0 : _e.display_name) || ((De = Re == null ? void 0 : Re.description) == null ? void 0 : De.slice(0, 30)) || "需求分析师",
            emoji: "",
            agentId: R === "temporary" || Re == null ? void 0 : Re.id,
            roleKey: fe,
            bindingMode: R
          };
        }
      );
      let Z = ee;
      (ee.length === 0 || ee.length !== D.length) && (Z = D.map((be) => ({
        agentName: be,
        instruction: "请完成你的专业部分",
        passContext: T === "pipeline"
      })));
      const pe = {
        id: (r == null ? void 0 : r.id) || `custom-${Date.now()}`,
        name: J.trim(),
        emoji: B,
        category: "自定义",
        description: x.trim() || `${J.trim()}（${D.length}人团队）`,
        mode: T,
        members: he,
        coordinatorName: T === "coordinator" || T === "debate" ? N : void 0,
        taskTemplate: U.trim(),
        orchestrationPrompt: "",
        // Custom teams use steps-based instructions
        steps: Z,
        custom: !0,
        createdAt: (r == null ? void 0 : r.createdAt) || Date.now(),
        updatedAt: r == null ? void 0 : r.updatedAt,
        version: r == null ? void 0 : r.version,
        maxReviewRounds: K,
        successCriteria: L.trim(),
        routingInstruction: ge.trim()
      };
      await tl(pe), f.success(r ? "团队已更新" : "团队已创建"), a(), t();
    } catch (O) {
      f.error(O.message || "保存失败");
    } finally {
      te(!1);
    }
  }, ye = n.filter(
    (O) => !D.includes(O.name)
  );
  return l.createElement(
    c,
    {
      open: e,
      onCancel: t,
      title: l.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 8 } },
        l.createElement(
          "span",
          { style: { fontSize: 20 } },
          r ? "✏️" : "➕"
        ),
        l.createElement(
          "span",
          null,
          r ? "编辑专家团" : "创建专家团"
        )
      ),
      width: 860,
      onOk: le,
      okText: "保存专家团",
      confirmLoading: oe,
      okButtonProps: {
        icon: z ? l.createElement(z) : void 0
      }
    },
    // Step 1: Basic info
    l.createElement(
      "div",
      { style: { marginBottom: 16 } },
      l.createElement(
        I,
        {
          strong: !0,
          style: { display: "block", marginBottom: 8, fontSize: 13 }
        },
        "1. 定义任务工作流"
      ),
      l.createElement(
        "div",
        { style: { display: "flex", gap: 8, marginBottom: 8, alignItems: "center" } },
        D.length > 0 ? l.createElement(sr, {
          members: D,
          size: 36
        }) : null,
        l.createElement(d, {
          placeholder: "专家团名称（如：储层评价与质量复核专家团）",
          value: J,
          onChange: (O) => F(O.target.value),
          style: { flex: 1 }
        })
      ),
      l.createElement(d.TextArea, {
        placeholder: "说明这个工作流解决什么问题、适用于什么场景",
        value: x,
        onChange: (O) => _(O.target.value),
        rows: 2,
        style: { marginBottom: 8 }
      }),
      l.createElement(
        I,
        { strong: !0, style: { display: "block", margin: "12px 0 8px", fontSize: 13 } },
        "选择协同模式"
      ),
      l.createElement(
        "div",
        {
          style: {
            display: "grid",
            gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
            gap: 8
          }
        },
        ...se.map((O) => {
          const he = T === O.value;
          return l.createElement(
            "button",
            {
              key: O.value,
              type: "button",
              onClick: () => {
                W(O.value), O.value !== "coordinator" && O.value !== "debate" && G("");
              },
              style: {
                textAlign: "left",
                padding: 10,
                borderRadius: 8,
                cursor: "pointer",
                background: he ? `${O.accent}0d` : "var(--ant-color-bg-container, #fff)",
                border: `1px solid ${he ? O.accent : "var(--ant-color-border, #d9d9d9)"}`,
                boxShadow: he ? `0 0 0 2px ${O.accent}1a` : "none"
              }
            },
            l.createElement(
              "div",
              { style: { display: "flex", alignItems: "center", gap: 7, color: O.accent, fontWeight: 600 } },
              l.createElement("span", { style: { fontSize: 18 } }, O.icon),
              O.title
            ),
            l.createElement("div", { style: { fontSize: 11, color: "#595959", marginTop: 5, lineHeight: 1.45 } }, O.description),
            l.createElement("div", { style: { fontSize: 10, color: O.accent, marginTop: 5, fontFamily: "monospace" } }, O.topology)
          );
        })
      )
    ),
    l.createElement(E, { style: { margin: "12px 0" } }),
    // Step 2: Select members
    l.createElement(
      "div",
      { style: { marginBottom: 16 } },
      l.createElement(
        I,
        {
          strong: !0,
          style: { display: "block", marginBottom: 8, fontSize: 13 }
        },
        "2. 配置专家角色"
      ),
      // Available agents
      ye.length > 0 ? l.createElement(
        "div",
        {
          style: {
            display: "flex",
            gap: 6,
            flexWrap: "wrap",
            marginBottom: 8,
            padding: 8,
            background: "var(--ant-color-fill-secondary, #f5f5f5)",
            borderRadius: 6
          }
        },
        ...ye.map(
          (O) => l.createElement(
            u,
            {
              key: O.id,
              size: "small",
              icon: g ? l.createElement(g) : void 0,
              onClick: () => Ie(O.name)
            },
            O.name
          )
        )
      ) : null,
      // Selected members
      D.length === 0 ? l.createElement(y, {
        description: "请从上方添加团队成员",
        image: y.PRESENTED_IMAGE_SIMPLE
      }) : l.createElement(
        "div",
        { style: { display: "flex", flexDirection: "column", gap: 4 } },
        ...D.map(
          (O) => l.createElement(
            "div",
            {
              key: O,
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
            l.createElement(
              "div",
              { style: { display: "flex", alignItems: "center", gap: 6 } },
              l.createElement(et, { name: O, size: 24 }),
              l.createElement(
                I,
                { strong: !0, style: { fontSize: 13 } },
                O
              ),
              (T === "coordinator" || T === "debate") && N === O ? l.createElement(
                p,
                { color: "blue", style: { fontSize: 10 } },
                T === "debate" ? "裁决者" : "主控"
              ) : null
            ),
            l.createElement(
              "div",
              { style: { display: "flex", gap: 4 } },
              l.createElement(m, {
                size: "small",
                value: xe[O] || Yt(O),
                style: { width: 132 },
                onChange: (he) => we({ ...xe, [O]: he }),
                options: Be.map((he) => ({
                  value: he.key,
                  label: he.display_name
                }))
              }),
              l.createElement(m, {
                size: "small",
                value: ce[O] || "fixed",
                style: { width: 118 },
                onChange: (he) => ne({ ...ce, [O]: he }),
                options: [
                  { value: "fixed", label: "固定实例" },
                  { value: "preferred", label: "优先实例" },
                  { value: "temporary", label: "临时派生" }
                ]
              }),
              T === "coordinator" || T === "debate" ? l.createElement(
                u,
                {
                  size: "small",
                  type: "link",
                  onClick: () => G(O)
                },
                T === "debate" ? "设为裁决者" : "设为主控"
              ) : null,
              l.createElement(
                u,
                {
                  size: "small",
                  type: "link",
                  danger: !0,
                  icon: S ? l.createElement(S) : void 0,
                  onClick: () => j(O)
                },
                "移除"
              )
            )
          )
        )
      )
    ),
    T === "review_loop" || T === "router" ? l.createElement(
      "div",
      {
        style: {
          margin: "0 0 16px",
          padding: 12,
          borderRadius: 8,
          background: "var(--ant-color-fill-quaternary, #fafafa)",
          border: "1px solid #f0f0f0"
        }
      },
      T === "review_loop" ? l.createElement(
        "div",
        { style: { display: "grid", gridTemplateColumns: "150px 1fr", gap: 10 } },
        l.createElement(m, {
          value: K,
          onChange: (O) => ue(O),
          options: [1, 2, 3, 4, 5].map((O) => ({ value: O, label: `最多 ${O} 轮` }))
        }),
        l.createElement(d, {
          value: L,
          onChange: (O) => ie(O.target.value),
          placeholder: "验收标准，例如：关键结论均有数据依据，且无高风险缺陷"
        })
      ) : l.createElement(d, {
        value: ge,
        onChange: (O) => X(O.target.value),
        placeholder: "路由偏好，例如：仅调用任务必需的专家；涉及模拟时优先油藏工程师"
      })
    ) : null,
    l.createElement(E, { style: { margin: "12px 0" } }),
    // Step 3: Define execution steps (for pipeline/roundtable)
    D.length > 0 ? l.createElement(
      "div",
      { style: { marginBottom: 16 } },
      l.createElement(
        I,
        {
          strong: !0,
          style: { display: "block", marginBottom: 8, fontSize: 13 }
        },
        `3. 配置专家任务${T === "roundtable" ? "（并行独立）" : T === "pipeline" ? "（顺序交接）" : T === "router" ? "（作为候选能力）" : T === "review_loop" ? "（首位执行、末位评审）" : T === "debate" ? "（末位为裁决者）" : "（由主控动态编排）"}`
      ),
      // Auto-sync button
      l.createElement(
        u,
        {
          size: "small",
          type: "dashed",
          onClick: Se,
          style: { marginBottom: 8 }
        },
        "自动生成步骤"
      ),
      // Steps list
      ee.length === 0 ? l.createElement(
        I,
        { type: "secondary", style: { fontSize: 12 } },
        "点击「自动生成步骤」或手动配置每步的指令"
      ) : l.createElement(
        "div",
        { style: { display: "flex", flexDirection: "column", gap: 6 } },
        ...ee.map(
          (O, he) => l.createElement(
            "div",
            {
              key: he,
              style: {
                padding: 8,
                background: "var(--ant-color-bg-container, #fff)",
                borderRadius: 6,
                border: "1px solid #e8e8e8"
              }
            },
            l.createElement(
              "div",
              {
                style: {
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  marginBottom: 6
                }
              },
              T === "pipeline" ? l.createElement(
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
                `${he + 1}`
              ) : l.createElement(
                "span",
                { style: { fontSize: 14 } },
                "🔀"
              ),
              l.createElement(
                p,
                { color: "blue", style: { fontSize: 11 } },
                O.agentName
              ),
              l.createElement(
                "div",
                { style: { flex: 1 } },
                l.createElement(d, {
                  placeholder: "请输入该步骤的指令...",
                  value: O.instruction,
                  onChange: (Z) => P(he, "instruction", Z.target.value),
                  size: "small"
                })
              )
            ),
            l.createElement(
              "div",
              {
                style: {
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  paddingLeft: 28
                }
              },
              l.createElement(h, {
                size: "small",
                checked: O.passContext,
                onChange: (Z) => P(he, "passContext", Z)
              }),
              l.createElement(
                I,
                { type: "secondary", style: { fontSize: 11 } },
                O.passContext ? "传递上一步结果作为上下文" : "独立执行"
              )
            )
          )
        )
      )
    ) : null,
    l.createElement(E, { style: { margin: "12px 0" } }),
    // Step 4: Task template
    l.createElement(
      "div",
      null,
      l.createElement(
        I,
        {
          strong: !0,
          style: { display: "block", marginBottom: 8, fontSize: 13 }
        },
        `${D.length > 0 ? "4" : "3"}. 任务模板`
      ),
      l.createElement(d.TextArea, {
        placeholder: `输入任务模板，可用 {参数名} 作为占位符...

例如：
请对区块 {区块名} 的井 {井号} 进行储层评价`,
        value: U,
        onChange: (O) => A(O.target.value),
        rows: 4,
        style: { fontFamily: "monospace", fontSize: 13 }
      }),
      l.createElement(
        I,
        {
          type: "secondary",
          style: { fontSize: 11, display: "block", marginTop: 4 }
        },
        "占位符 {参数名} 在发起任务时可由用户填写替换"
      )
    )
  );
}
function Zr({
  team: e,
  agents: t,
  onLaunch: n,
  onEdit: r,
  onDelete: a
}) {
  var C;
  const l = k().React, { useState: o } = l, { Card: s, Tag: i, Typography: c, Button: d, Tooltip: u, Popconfirm: m } = k().antd, {
    TeamOutlined: p,
    RocketOutlined: w,
    UserOutlined: h,
    EditOutlined: y,
    DeleteOutlined: f,
    DownOutlined: E,
    UpOutlined: v
  } = k().antdIcons || {}, { Text: g, Paragraph: S } = c, [z, V] = o(!1), I = {
    coordinator: { label: "主管协作", color: "blue" },
    pipeline: { label: "顺序交接", color: "cyan" },
    roundtable: { label: "并行汇聚", color: "purple" },
    router: { label: "智能路由", color: "orange" },
    review_loop: { label: "评审迭代", color: "green" },
    debate: { label: "多方论证", color: "magenta" }
  }, $ = I[e.mode] || I.coordinator, J = e.members.map((x) => {
    const _ = x.bindingMode === "temporary", T = _ ? null : (x.agentId && t.some((W) => W.id === x.agentId) ? x.agentId : null) || nl(t, x.name);
    return { ...x, found: !!T, agentId: T, temporary: _ };
  }), F = J.filter((x) => x.found).length, B = e.coordinatorName || ((C = e.members[0]) == null ? void 0 : C.name);
  return l.createElement(
    s,
    {
      hoverable: !0,
      size: "small",
      style: { height: "100%", display: "flex", flexDirection: "column" }
    },
    // Header: emoji + name + mode tag + custom badge
    l.createElement(
      "div",
      {
        style: {
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 10
        }
      },
      l.createElement(sr, {
        members: e.members.map((x) => x.name),
        size: 36
      }),
      l.createElement(
        "div",
        { style: { flex: 1 } },
        l.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 6 } },
          l.createElement(
            g,
            { strong: !0, style: { fontSize: 14 } },
            e.name
          ),
          e.custom ? l.createElement(
            i,
            { color: "gold", style: { fontSize: 9 } },
            "自定义"
          ) : null
        ),
        l.createElement(
          "div",
          { style: { display: "flex", gap: 4, marginTop: 4 } },
          l.createElement(
            i,
            { color: $.color, style: { fontSize: 10 } },
            $.label
          ),
          l.createElement(
            i,
            { color: "green", style: { fontSize: 10 } },
            `${e.members.length} 位专家`
          ),
          F < e.members.length ? l.createElement(
            u,
            {
              title: `OMP 架构下，未创建的专家将通过 spawn_subagent 自动派发，
控制器会根据角色 prompt 创建子 agent 执行任务。`
            },
            l.createElement(
              i,
              { color: "blue", style: { fontSize: 10 } },
              "OMP 自动派发"
            )
          ) : l.createElement(
            i,
            { color: "green", style: { fontSize: 10 } },
            "全部就绪"
          )
        )
      ),
      // Edit/delete for custom teams
      e.custom ? l.createElement(
        "div",
        { style: { display: "flex", gap: 2 } },
        r ? l.createElement(
          u,
          { title: "编辑" },
          l.createElement(d, {
            type: "text",
            size: "small",
            icon: y ? l.createElement(y) : void 0,
            onClick: (x) => {
              x.stopPropagation(), r(e);
            }
          })
        ) : null,
        a ? l.createElement(
          u,
          { title: "删除" },
          l.createElement(
            m,
            {
              title: `删除专家团「${e.name}」？`,
              description: "此操作会删除后端定义，但不会删除既有讨论记录。",
              okText: "删除",
              cancelText: "取消",
              okButtonProps: { danger: !0 },
              onConfirm: () => a(e)
            },
            l.createElement(d, {
              type: "text",
              size: "small",
              danger: !0,
              icon: f ? l.createElement(f) : void 0,
              onClick: (x) => x.stopPropagation()
            })
          )
        ) : null
      ) : null
    ),
    // Description
    l.createElement(
      S,
      {
        type: "secondary",
        style: { fontSize: 12, margin: 0, marginBottom: 10, lineHeight: 1.5 },
        ellipsis: { rows: 2 }
      },
      e.description
    ),
    // Member avatars
    l.createElement(
      "div",
      {
        style: {
          display: "flex",
          gap: 6,
          marginBottom: 10,
          flexWrap: "wrap"
        }
      },
      ...J.map(
        (x) => l.createElement(
          u,
          {
            key: x.name,
            title: `${x.name}（${x.role}）${x.temporary ? " - OMP 临时派生" : x.found ? " - 已绑定实例" : " - OMP 按角色派发"}`
          },
          l.createElement(
            "div",
            {
              style: {
                display: "flex",
                alignItems: "center",
                gap: 4,
                padding: "2px 8px",
                borderRadius: 12,
                background: x.found ? "#f0f5ff" : "#f0f0ff",
                border: `1px solid ${x.found ? "#d6e4ff" : "#d3adf7"}`,
                fontSize: 11
              }
            },
            l.createElement(et, { name: x.name, size: 18 }),
            l.createElement(
              g,
              {
                style: { fontSize: 11, color: x.found ? "#1f4e8c" : "#531dab" }
              },
              x.name
            ),
            x.temporary ? l.createElement(
              i,
              { color: "purple", style: { fontSize: 9, marginInlineEnd: 0 } },
              "派生"
            ) : null
          )
        )
      )
    ),
    // Toggle flow diagram
    l.createElement(
      d,
      {
        type: "link",
        size: "small",
        style: { padding: "0 0 4px 0", fontSize: 11, height: "auto" },
        onClick: (x) => {
          x.stopPropagation(), V(!z);
        },
        icon: z ? v ? l.createElement(v) : "▲" : E ? l.createElement(E) : "▼"
      },
      z ? "收起流程" : "查看执行流程"
    ),
    z ? l.createElement(Ci, { team: e }) : null,
    // Footer: launch button
    l.createElement(
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
      l.createElement(
        g,
        { type: "secondary", style: { fontSize: 11 } },
        B ? `${e.mode === "debate" ? "裁决者" : "主控"}: ${B}` : "OMP 动态编排"
      ),
      l.createElement(
        d,
        {
          type: "primary",
          size: "small",
          icon: w ? l.createElement(w) : void 0,
          disabled: t.length === 0,
          onClick: () => n(e),
          style: We
        },
        "运行工作流"
      )
    )
  );
}
function Ii({
  agents: e,
  onLaunch: t
}) {
  const n = k().React, { useMemo: r, useState: a, useCallback: l, useEffect: o } = n, {
    Row: s,
    Col: i,
    Input: c,
    Empty: d,
    Typography: u,
    Tag: m,
    Button: p,
    Divider: w,
    Tabs: h,
    message: y
  } = k().antd, { SearchOutlined: f, PlusOutlined: E, RocketOutlined: v } = k().antdIcons || {}, { Text: g } = u, [S, z] = a(""), [V, I] = a([]), [$, J] = a([]), [F, B] = a(!1), [C, x] = a(null), [_, T] = a("preset");
  o(() => {
    let M = !0;
    return (async () => {
      try {
        await fi();
        const oe = await Fn();
        M && I(oe);
      } catch (oe) {
        console.warn("[ugsci] Failed to load backend expert teams:", oe), M && (I([]), y.warning("专家团后端加载失败，请检查服务后重试"));
      }
    })(), vi().then((oe) => {
      M && oe && J(oe);
    }), () => {
      M = !1;
    };
  }, []);
  const W = l(() => {
    Fn().then(I).catch((M) => {
      console.warn("[ugsci] Failed to refresh expert teams:", M), I([]), y.warning("专家团后端加载失败，请检查服务后重试");
    });
  }, [y]), N = l(
    (M) => {
      pi(M.id).then(() => {
        W(), y.success(`团队「${M.name}」已删除`);
      }).catch((oe) => y.error(oe.message || "删除专家团失败"));
    },
    [y, W]
  ), G = l((M) => {
    x(M), B(!0);
  }, []), U = l(() => {
    x(null), B(!0);
  }, []), A = r(() => [...V, ...$], [V, $]), ee = r(() => {
    if (!S.trim()) return A;
    const M = S.toLowerCase();
    return A.filter(
      (oe) => oe.name.toLowerCase().includes(M) || oe.description.toLowerCase().includes(M) || oe.category.toLowerCase().includes(M)
    );
  }, [A, S]), ae = ee.filter((M) => M.custom), D = ee.filter((M) => !M.custom);
  return n.createElement(
    "div",
    null,
    // Toolbar
    n.createElement(
      "div",
      {
        style: {
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 8,
          flexWrap: "wrap",
          marginBottom: 16
        }
      },
      n.createElement(c, {
        placeholder: "搜索团队名称、描述或类别...",
        prefix: f ? n.createElement(f) : void 0,
        value: S,
        onChange: (M) => z(M.target.value),
        allowClear: !0,
        style: { flex: "1 1 280px", maxWidth: 400 }
      }),
      n.createElement(
        p,
        {
          type: "primary",
          size: "small",
          icon: E ? n.createElement(E) : void 0,
          onClick: U,
          style: We
        },
        "创建专家团"
      )
    ),
    // Tabs: preset teams vs custom teams
    n.createElement(
      h,
      {
        activeKey: _,
        onChange: T,
        items: [
          {
            key: "preset",
            label: `预设团队${D.length ? ` (${D.length})` : ""}`,
            children: n.createElement(
              "div",
              null,
              D.length > 0 ? n.createElement(
                s,
                { gutter: [12, 12] },
                ...D.map(
                  (M) => n.createElement(
                    i,
                    { key: M.id, xs: 24, sm: 12, md: 8 },
                    n.createElement(Zr, {
                      team: M,
                      agents: e,
                      onLaunch: t
                    })
                  )
                )
              ) : n.createElement(d, {
                description: "未找到匹配的预设团队",
                image: d.PRESENTED_IMAGE_SIMPLE
              })
            )
          },
          {
            key: "custom",
            label: `自定义团队${ae.length ? ` (${ae.length})` : ""}`,
            children: n.createElement(
              "div",
              null,
              ae.length > 0 ? n.createElement(
                s,
                { gutter: [12, 12] },
                ...ae.map(
                  (M) => n.createElement(
                    i,
                    { key: M.id, xs: 24, sm: 12, md: 8 },
                    n.createElement(Zr, {
                      team: M,
                      agents: e,
                      onLaunch: t,
                      onEdit: G,
                      onDelete: N
                    })
                  )
                )
              ) : n.createElement(d, {
                description: "暂无自定义团队，点击「创建专家团」自定义",
                image: d.PRESENTED_IMAGE_SIMPLE
              })
            )
          },
          {
            key: "active",
            label: "进行中的讨论",
            children: n.createElement(
              n.Fragment,
              null,
              n.createElement(ki, {
                enabled: _ === "active"
              }),
              n.createElement(Xr, {
                activeOnly: !0,
                enabled: _ === "active"
              })
            )
          },
          {
            key: "history",
            label: "讨论历史",
            children: n.createElement(Xr, {
              enabled: _ === "history"
            })
          }
        ]
      }
    ),
    // Team Builder Modal
    n.createElement(_i, {
      open: F,
      onClose: () => {
        B(!1), x(null);
      },
      agents: e,
      editingTeam: C,
      onSaved: W
    })
  );
}
const Ai = [
  {
    key: "ugs-cycle-review",
    icon: "🏭",
    name: "储气库周期运行评价",
    category: "生产运行",
    description: "资料质检、库容与压力分析、注采能力预测、风险复核和运行建议。",
    sop: "校验储气库本周期井口、井底压力和注采量数据；分析库容、压力窗口与单井能力；预测下一周期注采能力；由完整性专家复核井筒与盖层风险；生成带证据和风险边界的运行建议。",
    roleHints: ["Underground Gas Storage", "PVT", "储气库", "Verifier", "Underground Gas Storage"],
    roleKeys: ["analyst", "pvt-analyst", "reservoir-engineer", "domain-reviewer", "analyst"]
  },
  {
    key: "reservoir-model-review",
    icon: "🛢️",
    name: "油藏模型历史拟合与复核",
    category: "开发研究",
    description: "从数据质检到模拟、敏感性分析、独立复算和成果归档。",
    sop: "检查静动态数据、单位和模型版本；运行油藏数值模拟与历史拟合；开展关键参数敏感性和不确定性分析；由独立油藏工程师复核；归档模型、脚本、运行日志和结论。",
    roleHints: ["油藏工程师", "油藏工程师", "油藏工程师 Copy", "Verifier", "油藏工程师"],
    roleKeys: ["analyst", "reservoir-engineer", "reservoir-engineer", "domain-reviewer", "analyst"]
  },
  {
    key: "research-validation",
    icon: "🔬",
    name: "科研方法验证与独立复算",
    category: "科学研究",
    description: "文献证据、方法实现、对照实验、反方审查和可复现成果。",
    sop: "检索并分级相关文献证据；定义可证伪假设和评价指标；实现候选方法并运行对照实验；由独立专家复算关键结果；由反方审稿专家检查替代解释；归档数据、代码、环境、不确定性和负结果。",
    roleHints: ["QA Agent", "Default", "QA Agent", "Verifier", "QA Agent", "QA Agent"],
    roleKeys: ["analyst", "analyst", "analyst", "domain-reviewer", "analyst", "analyst"]
  }
], zi = 5e3, Pn = {
  completed: "green",
  success: "green",
  failed: "red",
  error: "red",
  cancelled: "orange",
  running: "blue",
  queued: "cyan",
  paused: "gold",
  waiting_human: "gold",
  timeout: "volcano"
};
function $i(e) {
  window.history.pushState({}, "", e), window.dispatchEvent(new PopStateEvent("popstate"));
}
function Rn(e, t) {
  const n = new URLSearchParams();
  e && n.set("flow", e), t && n.set("run", t), $i(`/flowforge${n.size ? `?${n.toString()}` : ""}`);
}
function Pi(e) {
  return e ? new Date(e * 1e3).toLocaleString("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  }) : "—";
}
function Ri(e) {
  if (!e || e <= 0) return "—";
  if (e < 1e3) return `${e}ms`;
  const t = Math.floor(e / 1e3);
  if (t < 60) return `${t}s`;
  const n = Math.floor(t / 60), r = t % 60;
  return `${n}m${r}s`;
}
function Oi(e) {
  if (!e) return "";
  const t = Object.keys(e).length;
  if (t === 0) return "";
  const n = Object.values(e).filter(
    (a) => a === "success" || a === "completed" || a === "skipped" || a === "cached"
  ).length, r = Object.values(e).filter(
    (a) => a === "error" || a === "failed"
  ).length;
  return r > 0 ? `${n}/${t} 节点完成 (${r} 失败)` : `${n}/${t} 节点完成`;
}
function ll(e) {
  return {
    success: "已完成",
    completed: "已完成",
    skipped: "已跳过",
    cached: "已缓存",
    running: "执行中",
    queued: "排队中",
    waiting: "等待中",
    pending: "待执行",
    error: "失败",
    failed: "失败",
    cancelled: "已取消"
  }[e] || e;
}
function It(e) {
  return ["success", "completed", "skipped", "cached"].includes(e) ? "green" : ["error", "failed"].includes(e) ? "red" : ["running"].includes(e) ? "blue" : ["queued", "pending"].includes(e) ? "cyan" : "gold";
}
function Mi(e, t) {
  const n = typeof e.type == "string" ? e.type : "事件", r = typeof e.node_id == "string" ? ` · ${e.node_id}` : "", a = e.state && typeof e.state == "object" ? e.state : {}, l = e.data && typeof e.data == "object" ? e.data : {}, o = [e.message, a.message, a.error, l.message, l.error].find((c) => typeof c == "string" && c.length > 0) || "";
  if (o) return `${n}${r}: ${o}`;
  const s = typeof e.status == "string" ? e.status : typeof a.status == "string" ? a.status : "", i = s ? ` · ${ll(s)}` : "";
  if (i) return `${n}${r}${i}`;
  try {
    const c = JSON.stringify(Object.keys(l).length > 0 ? l : e) || "{}", d = c.length > 240 ? `${c.slice(0, 237)}...` : c;
    return `${n}${r}: ${d}`;
  } catch {
    return `${n}${r} #${t + 1}`;
  }
}
const Qt = /* @__PURE__ */ new Set(["running", "queued", "paused", "waiting_human"]);
function Li() {
  const e = k().React, { useCallback: t, useEffect: n, useRef: r, useState: a } = e, {
    Alert: l,
    Button: o,
    Card: s,
    Col: i,
    Empty: c,
    Input: d,
    Popconfirm: u,
    Row: m,
    Space: p,
    Spin: w,
    Tabs: h,
    Progress: y,
    Tag: f,
    Tooltip: E,
    Typography: v,
    message: g
  } = k().antd, {
    ApartmentOutlined: S,
    DeleteOutlined: z,
    ReloadOutlined: V,
    RocketOutlined: I,
    PlayCircleOutlined: $,
    StopOutlined: J
  } = k().antdIcons || {}, { Text: F, Paragraph: B, Title: C } = v, x = k().useSelectedAgent, _ = x ? x() : { id: "default" }, T = (_ == null ? void 0 : _.id) || "default", [W, N] = a([]), [G, U] = a([]), [A, ee] = a([]), [ae, D] = a(!0), [M, oe] = a(!0), [te, K] = a(null), [ue, L] = a(""), [ie, ge] = a(""), [X, ce] = a("templates"), [ne, xe] = a(/* @__PURE__ */ new Set()), [we, Be] = a(/* @__PURE__ */ new Set()), ve = r(null), se = G.some((R) => Qt.has(R.status)), Se = e.useMemo(() => {
    const R = {};
    return W.forEach((fe) => {
      R[fe.id] = fe.name;
    }), R;
  }, [W]), Ie = e.useMemo(() => {
    const R = {};
    return G.forEach((fe) => {
      Qt.has(fe.status) && (R[fe.flow_id] = (R[fe.flow_id] || 0) + 1);
    }), R;
  }, [G]), j = t(async (R = !1) => {
    R || D(!0);
    try {
      const [fe, _e, De] = await Promise.all([
        de("/flowforge/flows", { bypassCache: !0 }),
        de("/flowforge/runs", { bypassCache: !0 }),
        wn().catch(() => [])
      ]);
      N(fe), U(_e), ee(De), oe(!0);
    } catch (fe) {
      console.warn("[ugsci] FlowForge is unavailable:", fe), oe(!1);
    } finally {
      R || D(!1);
    }
  }, []);
  n(() => {
    j();
  }, [j]), n(() => {
    if (!M || !se) {
      ve.current && (clearTimeout(ve.current), ve.current = null);
      return;
    }
    return ve.current = setTimeout(() => {
      j(!0);
    }, zi), () => {
      ve.current && (clearTimeout(ve.current), ve.current = null);
    };
  }, [se, M, j]);
  const P = t(
    async (R) => {
      if (!te) {
        K(R.key);
        try {
          const fe = await de(
            "/flowforge/generate",
            {
              method: "POST",
              body: JSON.stringify({
                prompt: R.sop,
                name: R.name,
                agent_id: T
              })
            }
          ), _e = {
            ...fe.nodes || {}
          }, De = Object.entries(_e).filter(([re]) => /^step_\d+$/.test(re)).sort(([re], [ze]) => Number(re.slice(5)) - Number(ze.slice(5))), Ae = {};
          let Ye = 0, Ze = 0;
          De.forEach(([re, ze], Me) => {
            const Ue = R.roleHints[Me] || "", Le = R.roleKeys[Me] || "analyst", Pe = A.find(
              (ct) => `${ct.name} ${ct.id}`.toLowerCase().includes(Ue.toLowerCase())
            );
            Pe ? Ye++ : Ze++;
            const ke = (Pe == null ? void 0 : Pe.id) || T, st = { ...ze.inputs || {} };
            st.agent_id = ke, _e[re] = {
              ...ze,
              inputs: st,
              metadata: {
                ...ze.metadata || {},
                binding_policy: "fixed_instance",
                role_hint: Ue,
                role_key: Le,
                agent_id: ke
              }
            }, Ae[re] = {
              binding_policy: "fixed_instance",
              role_hint: Ue,
              role_key: Le,
              agent_id: ke
            };
          });
          const Fe = {
            ...fe,
            nodes: _e,
            id: `${R.key}-${Date.now()}`,
            name: R.name,
            description: R.description,
            metadata: {
              ...fe.metadata || {},
              domain: "oil-gas",
              template_key: R.key,
              expert_binding_policy: "fixed_instance",
              controller_agent_id: T,
              node_bindings: Ae
            }
          };
          await de("/flowforge/flows", {
            method: "POST",
            body: JSON.stringify(Fe)
          });
          const Oe = De.length > 0 ? `（${Ye} 个专家已匹配，${Ze} 个回退到控制器）` : "";
          g.success(`已创建工作流草稿「${R.name}」${Oe}`), await j();
        } catch (fe) {
          g.error(fe.message || "创建工作流失败");
        } finally {
          K(null);
        }
      }
    },
    [A, T, te, j, g]
  ), le = t(async () => {
    if (!te) {
      if (!ie.trim()) {
        g.warning("请先描述工作流步骤和控制要求");
        return;
      }
      K("natural-language");
      try {
        const R = await de(
          "/flowforge/generate",
          {
            method: "POST",
            body: JSON.stringify({
              prompt: ie.trim(),
              name: ue.trim(),
              agent_id: T
            })
          }
        ), fe = {
          ...R,
          id: `natural-${Date.now()}`,
          metadata: {
            ...R.metadata || {},
            domain: "oil-gas",
            source: "natural-language",
            expert_binding_policy: "fixed_instance",
            controller_agent_id: T
          }
        };
        await de("/flowforge/flows", {
          method: "POST",
          body: JSON.stringify(fe)
        }), g.success("已从自然语言生成可编辑工作流草稿"), L(""), ge(""), await j();
      } catch (R) {
        g.error(R.message || "自然语言生成失败");
      } finally {
        K(null);
      }
    }
  }, [T, te, j, g, ue, ie]), ye = t(
    async (R, fe) => {
      try {
        await de(`/flowforge/flows/${encodeURIComponent(R)}/run`, {
          method: "POST",
          body: JSON.stringify({ inputs: {} })
        }), g.success(`已启动工作流「${fe}」`), await j(!0);
      } catch (_e) {
        g.error(_e.message || "启动工作流失败");
      }
    },
    [j, g]
  ), O = t(
    async (R, fe) => {
      try {
        await de(`/flowforge/flows/${encodeURIComponent(R)}`, {
          method: "DELETE"
        }), g.success(`已删除工作流「${fe}」`), await j();
      } catch (_e) {
        g.error(_e.message || "删除工作流失败");
      }
    },
    [j, g]
  ), he = t(
    async (R) => {
      xe((fe) => {
        const _e = new Set(fe);
        return _e.add(R), _e;
      });
      try {
        await de(`/flowforge/runs/${encodeURIComponent(R)}/cancel`, {
          method: "POST"
        }), g.success("已请求取消运行"), await j(!0);
      } catch (fe) {
        g.error(fe.message || "取消运行失败");
      } finally {
        xe((fe) => {
          const _e = new Set(fe);
          return _e.delete(R), _e;
        });
      }
    },
    [j, g]
  ), Z = e.createElement(
    "div",
    null,
    e.createElement(
      s,
      {
        size: "small",
        title: "用自然语言生成工作流",
        style: { marginBottom: 16 }
      },
      e.createElement(
        p,
        { direction: "vertical", style: { width: "100%" }, size: 10 },
        e.createElement(d, {
          value: ue,
          onChange: (R) => L(R.target.value),
          placeholder: "工作流名称（可选）",
          maxLength: 80
        }),
        e.createElement(d.TextArea, {
          value: ie,
          onChange: (R) => ge(R.target.value),
          placeholder: "例如：先检查某储气库本周期压力和注采量数据，再由油藏工程师预测下周期能力，由独立完整性专家复核风险，最后形成带证据和不确定性的建议。",
          autoSize: { minRows: 3, maxRows: 8 }
        }),
        e.createElement(
          o,
          {
            type: "primary",
            onClick: () => void le(),
            loading: te === "natural-language",
            disabled: !M || !!te,
            style: We
          },
          "生成可编辑草稿"
        )
      )
    ),
    e.createElement(
      m,
      { gutter: [12, 12] },
      ...Ai.map(
        (R) => e.createElement(
          i,
          { key: R.key, xs: 24, md: 8 },
          e.createElement(
            s,
            { style: { height: "100%" } },
            e.createElement(
              p,
              { align: "start", style: { width: "100%" } },
              e.createElement("span", { style: { fontSize: 28 } }, R.icon),
              e.createElement(
                "div",
                { style: { flex: 1 } },
                e.createElement(C, { level: 5, style: { margin: 0 } }, R.name),
                e.createElement(f, { color: "blue", style: { marginTop: 6 } }, R.category),
                e.createElement(
                  B,
                  { type: "secondary", style: { margin: "10px 0 14px" } },
                  R.description
                ),
                e.createElement(
                  o,
                  {
                    type: "primary",
                    loading: te === R.key,
                    disabled: !M || !!te,
                    onClick: () => void P(R),
                    style: We
                  },
                  "创建草稿"
                )
              )
            )
          )
        )
      )
    ),
    e.createElement(
      s,
      { size: "small", title: "专家节点绑定策略", style: { marginTop: 16 } },
      e.createElement(
        m,
        { gutter: [12, 12] },
        ...[
          ["固定实例", "生产关键节点使用指定且已验证的专家实例", "当前可执行"],
          ["优先实例", "定义中记录首选实例和治理降级策略", "规划中"],
          ["模板派生", "由 OMP 控制节点按角色模板临时创建隔离角色", "规划中"],
          ["动态路由", "按能力、健康、权限和成本选择实例", "规划中"]
        ].map(
          ([R, fe, _e]) => e.createElement(
            i,
            { key: R, xs: 24, sm: 12, lg: 6 },
            e.createElement(F, { strong: !0 }, R),
            e.createElement(
              f,
              {
                color: _e === "当前可执行" ? "green" : "default",
                style: { marginLeft: 6, fontSize: 10 }
              },
              _e
            ),
            e.createElement("div", { style: { color: "var(--ant-color-text-tertiary, #8c8c8c)", fontSize: 12, marginTop: 4 } }, fe)
          )
        )
      )
    )
  ), pe = ae ? e.createElement(w) : W.length === 0 ? e.createElement(c, { description: "暂无工作流，可从模板创建" }) : e.createElement(
    m,
    { gutter: [12, 12] },
    ...W.map((R) => {
      const fe = Ie[R.id] || 0;
      return e.createElement(
        i,
        { key: R.id, xs: 24, md: 12, xl: 8 },
        e.createElement(
          s,
          {
            size: "small",
            title: e.createElement(
              p,
              { size: 6 },
              e.createElement("span", null, R.name),
              fe > 0 ? e.createElement(
                f,
                { color: "blue" },
                `${fe} 个运行中`
              ) : null
            ),
            extra: e.createElement(f, null, `v${R.version}`)
          },
          e.createElement(B, { ellipsis: { rows: 2 } }, R.description || "暂无描述"),
          e.createElement(
            p,
            { size: 8, wrap: !0 },
            e.createElement(f, { color: "geekblue" }, `${R.node_count} 个节点`),
            e.createElement(o, {
              size: "small",
              type: "primary",
              icon: $ ? e.createElement($) : void 0,
              disabled: !M,
              onClick: () => void ye(R.id, R.name)
            }, "运行"),
            e.createElement(o, {
              size: "small",
              onClick: () => Rn(R.id)
            }, "编辑"),
            e.createElement(
              u,
              {
                title: "确认删除",
                description: `确定要删除工作流「${R.name}」吗？此操作不可撤销。`,
                onConfirm: () => void O(R.id, R.name),
                okText: "删除",
                cancelText: "取消",
                okButtonProps: { danger: !0 }
              },
              e.createElement(o, {
                size: "small",
                danger: !0,
                icon: z ? e.createElement(z) : void 0
              }, "删除")
            )
          )
        )
      );
    })
  ), be = ae ? e.createElement(w) : G.length === 0 ? e.createElement(c, { description: "暂无工作流运行记录" }) : e.createElement(
    "div",
    { style: { display: "flex", flexDirection: "column", gap: 8 } },
    ...G.map((R) => {
      const fe = Se[R.flow_id] || R.flow_id, _e = Qt.has(R.status), De = Oi(R.node_statuses), Ae = Object.entries(R.node_statuses || {}), Ye = Ae.filter(([, Le]) => ["success", "completed", "skipped", "cached"].includes(Le)).length, Ze = Ae.filter(([, Le]) => ["error", "failed"].includes(Le)).length, Fe = Ae.length > 0, Oe = R.status === "completed" || R.status === "success", re = Fe ? Math.round(Ye / Ae.length * 100) : _e ? 18 : Oe ? 100 : 0, ze = Array.isArray(R.events) ? R.events.filter(
        (Le) => !!Le && typeof Le == "object"
      ).slice(-100) : [], Me = we.has(R.run_id), Ue = R.duration_ms && R.duration_ms > 0 ? R.duration_ms : R.finished_at && R.started_at ? (R.finished_at - R.started_at) * 1e3 : _e && R.started_at ? (Date.now() / 1e3 - R.started_at) * 1e3 : 0;
      return e.createElement(
        s,
        {
          key: R.run_id,
          size: "small",
          style: {
            borderLeft: `3px solid ${Pn[R.status] === "green" ? "#52c41a" : Pn[R.status] === "red" ? "#ff4d4f" : "#1677ff"}`,
            transition: "box-shadow .2s ease"
          }
        },
        e.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" } },
          e.createElement(
            f,
            { color: Pn[R.status] || "default" },
            R.status
          ),
          e.createElement(F, { strong: !0 }, fe),
          e.createElement(
            E,
            { title: R.run_id },
            e.createElement(
              F,
              { type: "secondary", style: { fontFamily: "monospace", fontSize: 11 } },
              R.run_id.slice(0, 8) + "…"
            )
          ),
          e.createElement(
            F,
            { type: "secondary", style: { fontSize: 12 } },
            Pi(R.started_at)
          ),
          Ue > 0 ? e.createElement(
            F,
            { type: "secondary", style: { fontSize: 12 } },
            `耗时 ${Ri(Ue)}`
          ) : null,
          De ? e.createElement(f, { color: "geekblue", style: { fontSize: 11 } }, De) : null,
          R.error ? e.createElement(
            E,
            { title: R.error },
            e.createElement(F, { type: "danger", style: { fontSize: 12 } }, "（有错误）")
          ) : null,
          e.createElement(
            "div",
            { style: { marginLeft: "auto", display: "flex", gap: 6 } },
            _e ? e.createElement(
              u,
              {
                title: "确认取消运行？",
                onConfirm: () => void he(R.run_id),
                okText: "取消运行",
                cancelText: "保留",
                okButtonProps: { danger: !0 }
              },
              e.createElement(o, {
                size: "small",
                danger: !0,
                loading: ne.has(R.run_id),
                icon: J ? e.createElement(J) : void 0
              }, "取消运行")
            ) : null,
            e.createElement(
              o,
              {
                size: "small",
                type: "link",
                onClick: () => Be((Le) => {
                  const Pe = new Set(Le);
                  return Pe.has(R.run_id) ? Pe.delete(R.run_id) : Pe.add(R.run_id), Pe;
                })
              },
              Me ? "收起过程" : "查看过程"
            ),
            e.createElement(
              o,
              {
                size: "small",
                type: "link",
                onClick: () => Rn(void 0, R.run_id)
              },
              "查看详情"
            )
          )
        ),
        e.createElement(
          "div",
          { style: { marginTop: 10, display: "flex", alignItems: "center", gap: 10 } },
          e.createElement(y, { percent: re, size: "small", status: Ze || R.status === "failed" || R.status === "error" ? "exception" : _e ? "active" : "success", showInfo: !1, style: { flex: 1, margin: 0 } }),
          e.createElement(F, { type: "secondary", style: { fontSize: 12, minWidth: 90, textAlign: "right" } }, Fe ? `${re}%` : "暂无节点进度")
        ),
        Me && (Ae.length > 0 || ze.length > 0 || R.error) ? e.createElement(
          "div",
          { style: { marginTop: 12, padding: "10px 12px", borderRadius: 8, background: "var(--ant-color-fill-quaternary, #fafafa)" } },
          e.createElement(
            "div",
            { style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 } },
            e.createElement(F, { strong: !0 }, "协作过程"),
            e.createElement(F, { type: "secondary", style: { fontSize: 12 } }, Ae.length > 0 ? `${Ye}/${Ae.length} 个 Agent 节点完成${Ze ? ` · ${Ze} 个失败` : ""}` : "暂无节点状态")
          ),
          Ae.length > 0 ? e.createElement(
            "div",
            { style: { display: "grid", gap: 7 } },
            ...Ae.map(
              ([Le, Pe], ke) => e.createElement(
                "div",
                { key: Le, style: { display: "flex", alignItems: "center", gap: 8 } },
                e.createElement("span", { style: { width: 22, height: 22, borderRadius: "50%", display: "inline-flex", alignItems: "center", justifyContent: "center", background: It(Pe) === "green" ? "#f6ffed" : It(Pe) === "red" ? "#fff2f0" : "#e6f4ff", color: It(Pe) === "green" ? "#389e0d" : It(Pe) === "red" ? "#cf1322" : "#1677ff", fontSize: 11, fontWeight: 600 } }, ke + 1),
                e.createElement(F, { style: { flex: 1, fontSize: 12 } }, Le.replace(/^step[_-]?\d+[_-]?/, "") || `Agent ${ke + 1}`),
                ke < Ae.length - 1 ? e.createElement(F, { type: "secondary", style: { fontSize: 11 } }, "→") : null,
                e.createElement(f, { color: It(Pe), style: { margin: 0, fontSize: 11 } }, ll(Pe))
              )
            )
          ) : null,
          ze.length > 0 ? e.createElement(
            "div",
            { style: { display: "grid", gap: 5, marginTop: Ae.length > 0 ? 10 : 0 } },
            e.createElement(F, { strong: !0, style: { fontSize: 12 } }, "执行事件"),
            ...ze.map((Le, Pe) => e.createElement(F, { key: `event-${Pe}`, type: "secondary", style: { fontSize: 12 } }, Mi(Le, Pe)))
          ) : null,
          R.error ? e.createElement(l, { type: "error", showIcon: !0, message: "运行错误", description: R.error, style: { marginTop: 10 } }) : null
        ) : null
      );
    })
  ), Re = e.createElement(
    p,
    null,
    e.createElement(o, {
      icon: V ? e.createElement(V) : void 0,
      onClick: () => void j(),
      loading: ae
    }, "刷新"),
    X !== "templates" ? e.createElement(o, {
      type: "primary",
      icon: S ? e.createElement(S) : I ? e.createElement(I) : void 0,
      onClick: () => Rn(),
      disabled: !M,
      style: We
    }, "打开流程编辑器") : null
  );
  return e.createElement(
    "div",
    null,
    M ? null : e.createElement(l, {
      type: "warning",
      message: "FlowForge 引擎未启动",
      description: "协作工作流功能需要 FlowForge 后端引擎支持。请检查后端是否正常运行，或联系管理员。",
      showIcon: !0,
      style: { marginBottom: 16 }
    }),
    e.createElement(h, {
      items: [
        { key: "templates", label: "工作流模板", children: Z },
        { key: "mine", label: `我的工作流 (${W.length})`, children: pe },
        {
          key: "runs",
          label: e.createElement(
            "span",
            null,
            "运行中心 (",
            G.length,
            se ? e.createElement(
              "span",
              { style: { color: "#1677ff", marginLeft: 2 } },
              `·${G.filter((R) => Qt.has(R.status)).length} 活跃`
            ) : null,
            ")"
          ),
          children: be
        }
      ],
      activeKey: X,
      onChange: (R) => ce(R),
      tabBarExtraContent: Re
    })
  );
}
function ea(e, t) {
  var a, l;
  const n = e.coordinatorName || ((a = e.members[0]) == null ? void 0 : a.name), r = e.members.find((o) => o.name === n) || e.members[0];
  if ((r == null ? void 0 : r.bindingMode) !== "temporary" && (r != null && r.agentId) && t.some((o) => o.id === r.agentId))
    return r.agentId;
  if (n && (r == null ? void 0 : r.bindingMode) !== "temporary") {
    const o = nl(t, n);
    if (o) return o;
  }
  return (r == null ? void 0 : r.bindingMode) === "fixed" ? null : ((l = t[0]) == null ? void 0 : l.id) || null;
}
function ta() {
  const e = new URLSearchParams(window.location.search).get("section");
  return e === "teams" || e === "workflows" ? e : "experts";
}
function Bi() {
  var Ie, j;
  const e = k().React, { useState: t, useEffect: n, useCallback: r, useMemo: a } = e, {
    Spin: l,
    Empty: o,
    Input: s,
    Button: i,
    message: c,
    Tabs: d,
    Modal: u,
    Typography: m
  } = k().antd, {
    ReloadOutlined: p,
    PlusOutlined: w,
    SearchOutlined: h,
    TeamOutlined: y,
    UserOutlined: f
  } = k().antdIcons || {}, { Text: E, Paragraph: v } = m, [g, S] = t([]), [z, V] = t(!0), [I, $] = t(!1), [J, F] = t(null), [B, C] = t(""), [x, _] = t(!1), [T, W] = t(ta), [N, G] = t(
    null
  ), [U, A] = t(""), [ee, ae] = t(!1), [D, M] = t(!1), [oe, te] = t(null), [K, ue] = t([]), L = r(async () => {
    V(!0);
    try {
      const P = await wn(), le = await Promise.all(
        P.map(async (ye) => {
          try {
            const [O, he, Z] = await Promise.all([
              rr(ye.id).catch(() => null),
              Sn(ye.id).catch(() => []),
              or(ye.id).catch(() => [])
            ]);
            return {
              agent: ye,
              config: O,
              skills: he,
              mcps: Z,
              loading: !1
            };
          } catch {
            return {
              agent: ye,
              config: null,
              skills: [],
              mcps: [],
              loading: !1
            };
          }
        })
      );
      S(le), ue(P);
    } catch (P) {
      c.error(P.message || "加载专家列表失败"), S([]);
    } finally {
      V(!1);
    }
  }, []);
  n(() => {
    L();
  }, [L]), n(() => {
    const P = () => W(ta());
    return window.addEventListener("popstate", P), () => window.removeEventListener("popstate", P);
  }, []), n(() => {
    if (oe && D) {
      const P = g.find((le) => le.agent.id === oe.agent.id);
      P && P !== oe && te(P);
    }
  }, [g, oe, D]);
  const ie = r(
    async (P) => {
      var he;
      const le = P.coordinatorName || ((he = P.members[0]) == null ? void 0 : he.name), ye = ea(P, K);
      if (!ye) {
        const Z = P.members.find(
          (pe) => pe.name === le
        );
        c.error(
          (Z == null ? void 0 : Z.bindingMode) === "fixed" ? `固定协调者「${le || "协调者"}」当前不可用，请修复绑定后再运行` : "没有可用的 Agent 作为工作流控制器"
        );
        return;
      }
      if (/\{.+?\}/.test(P.taskTemplate)) {
        A(P.taskTemplate), G(P);
        return;
      }
      await ge(P, ye, P.taskTemplate);
    },
    [K, c]
  ), ge = r(
    async (P, le, ye) => {
      ae(!0);
      try {
        const O = ye || P.taskTemplate, he = P.custom ? `@${P.id}` : P.name, Z = `/ugsci-team ${P.mode} ${he} ${O}`, pe = k();
        pe.setSelectedAgent && pe.setSelectedAgent(le);
        const be = await yi(le, Z, P.name);
        c.success(`OMP 工作流已启动：${P.name}（${P.mode}模式）`), G(null), X(`/chat/${be}`);
      } catch (O) {
        c.error(O.message || "发起团队任务失败");
      } finally {
        ae(!1);
      }
    },
    [c]
  ), X = (P) => {
    window.history.pushState({}, "", P), window.dispatchEvent(new PopStateEvent("popstate"));
  }, ce = r((P) => {
    F(P), $(!0);
  }, []), ne = r((P) => {
    te(P), M(!0);
  }, []), xe = r(
    (P) => {
      if (!P.agent.enabled) {
        c.warning(`专家「${P.agent.name}」未启用，请先启用`);
        return;
      }
      try {
        const le = k();
        le.setSelectedAgent && le.setSelectedAgent(P.agent.id);
      } catch (le) {
        console.warn("[ugsci] Failed to set selected agent:", le);
      }
      c.success(`已召唤专家「${P.agent.name}」，正在跳转至对话...`), X("/chat");
    },
    [c]
  ), we = a(() => {
    if (!B.trim()) return g;
    const P = B.toLowerCase();
    return g.filter(
      (le) => {
        var ye;
        return le.agent.name.toLowerCase().includes(P) || ((ye = le.agent.description) == null ? void 0 : ye.toLowerCase().includes(P)) || le.agent.id.toLowerCase().includes(P) || le.skills.some((O) => O.name.toLowerCase().includes(P));
      }
    );
  }, [g, B]), Be = g.filter((P) => P.agent.enabled).length, ve = g.reduce(
    (P, le) => P + le.skills.filter((ye) => ye.enabled !== !1).length,
    0
  ), se = g.reduce((P, le) => P + le.mcps.length, 0), Se = [
    {
      key: "experts",
      label: e.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        f ? e.createElement(f, { style: { fontSize: 14 } }) : null,
        "专家"
      ),
      children: e.createElement(
        "div",
        null,
        // Search bar
        e.createElement(
          "div",
          {
            style: {
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 8,
              flexWrap: "wrap",
              marginBottom: 16
            }
          },
          e.createElement(s, {
            placeholder: "搜索专家名称、描述或技能...",
            prefix: h ? e.createElement(h) : void 0,
            value: B,
            onChange: (P) => C(P.target.value),
            allowClear: !0,
            style: { flex: "1 1 280px", maxWidth: 400 }
          }),
          e.createElement(
            i,
            {
              type: "primary",
              icon: w ? e.createElement(w) : void 0,
              onClick: () => _(!0),
              style: We
            },
            "创建专家"
          )
        ),
        // Content
        z ? e.createElement(
          "div",
          { style: { textAlign: "center", padding: 60 } },
          e.createElement(l, { size: "large" })
        ) : we.length === 0 ? e.createElement(o, {
          description: B ? "未找到匹配的专家" : "暂无专家，点击「创建专家」添加"
        }) : e.createElement(
          "div",
          {
            style: {
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 250px), 1fr))",
              gap: 14,
              alignItems: "stretch"
            }
          },
          ...we.map(
            (P) => e.createElement(
              "div",
              {
                key: P.agent.id,
                style: { display: "flex", minWidth: 0 }
              },
              e.createElement(ri, {
                expert: P,
                onClick: () => ce(P),
                onSummon: () => xe(P),
                onConfigure: () => ne(P)
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
        y ? e.createElement(y, { style: { fontSize: 14 } }) : null,
        "专家团"
      ),
      children: e.createElement(Ii, {
        agents: K,
        onLaunch: ie
      })
    },
    {
      key: "workflows",
      label: e.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        (Ie = k().antdIcons) != null && Ie.ApartmentOutlined ? e.createElement(k().antdIcons.ApartmentOutlined, {
          style: { fontSize: 14 }
        }) : null,
        "协作工作流"
      ),
      children: e.createElement(Li)
    }
  ];
  return e.createElement(
    "div",
    { style: { padding: 24 } },
    e.createElement(vn, {
      title: "专家·协作",
      subtitle: T === "experts" ? `共 ${g.length} 位专家（${Be} 位启用）· ${ve} 个技能 · ${se} 个 MCP 客户端` : T === "teams" ? "开放式多专家讨论、联合研判与 OMP 动态协作" : "流程化、可观测、可验证的油气与储气库协作流程",
      extra: e.createElement(
        e.Fragment,
        null,
        T === "experts" ? e.createElement(
          i,
          {
            icon: p ? e.createElement(p) : void 0,
            onClick: () => {
              Ht(), L();
            },
            loading: z
          },
          "刷新"
        ) : null
      )
    }),
    e.createElement(d, {
      items: Se,
      activeKey: T,
      onChange: (P) => {
        W(P);
        const le = new URL(window.location.href);
        P === "experts" ? le.searchParams.delete("section") : le.searchParams.set("section", P), window.history.pushState({}, "", `${le.pathname}${le.search}`);
      }
    }),
    // Drawer
    e.createElement(ai, {
      expert: J,
      open: I,
      onClose: () => $(!1),
      onRefresh: () => L()
    }),
    // Template Modal
    e.createElement(li, {
      open: x,
      onClose: () => _(!1),
      onCreated: () => L()
    }),
    // Config Modal (gear icon)
    e.createElement(ei, {
      expert: oe,
      open: D,
      onClose: () => M(!1),
      onRefresh: () => L()
    }),
    // Team Launch Modal (for filling placeholders)
    N ? e.createElement(
      u,
      {
        open: !0,
        title: e.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 8 } },
          e.createElement(sr, {
            members: N.members.map((P) => P.name),
            size: 28
          }),
          e.createElement(
            "span",
            null,
            `发起团队任务 - ${N.name}`
          )
        ),
        onCancel: () => G(null),
        onOk: () => {
          const P = ea(
            N,
            K
          );
          if (!P) {
            c.error("固定协调者不可用或没有可用的控制器 Agent");
            return;
          }
          const le = U.trim() || N.taskTemplate;
          ge(N, P, le);
        },
        confirmLoading: ee,
        okText: "发起任务",
        width: 600
      },
      e.createElement(
        "div",
        null,
        e.createElement(
          E,
          {
            type: "secondary",
            style: { fontSize: 12, display: "block", marginBottom: 8 }
          },
          "任务内容（请替换 {参数名} 等占位符后发起）："
        ),
        e.createElement(s.TextArea, {
          value: U,
          onChange: (P) => A(P.target.value),
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
          E,
          { style: { fontSize: 12, color: "#0958d9" } },
          `协调者: ${N.coordinatorName || ((j = N.members[0]) == null ? void 0 : j.name) || "—"} · 成员: ${N.members.map((P) => P.name).join("、")}`
        )
      )
    ) : null
  );
}
function Ui({
  agentId: e,
  agentName: t,
  refreshKey: n = 0,
  onNavigate: r
}) {
  const a = k().React, { useState: l, useEffect: o, useCallback: s } = a, {
    Spin: i,
    Empty: c,
    Button: d,
    Row: u,
    Col: m,
    Card: p,
    Tag: w,
    Checkbox: h,
    Modal: y,
    Typography: f,
    Drawer: E,
    Descriptions: v,
    message: g
  } = k().antd, {
    ReloadOutlined: S,
    ThunderboltOutlined: z,
    SettingOutlined: V,
    CheckSquareOutlined: I,
    EyeOutlined: $,
    EyeInvisibleOutlined: J,
    DeleteOutlined: F,
    CloseOutlined: B
  } = k().antdIcons || {}, { Text: C, Paragraph: x } = f, [_, T] = l([]), [W, N] = l(!0), [G, U] = l(!1), [A, ee] = l(null), [ae, D] = l(!1), [M, oe] = l(
    /* @__PURE__ */ new Set()
  ), [te, K] = l(!1), [ue, L] = l(null), [ie, ge] = l(!1), X = s(async () => {
    if (e) {
      N(!0);
      try {
        const j = await Sn(e);
        T(j);
      } catch (j) {
        g.error(j.message || "加载技能失败"), T([]);
      } finally {
        N(!1);
      }
    }
  }, [e]);
  o(() => {
    X();
  }, [X, n]);
  const ce = (j) => {
    oe((P) => {
      const le = new Set(P);
      return le.has(j) ? le.delete(j) : le.add(j), le;
    });
  }, ne = () => oe(/* @__PURE__ */ new Set()), xe = () => oe(new Set(_.map((j) => j.name))), we = () => {
    ae ? (ne(), D(!1)) : D(!0);
  }, Be = async () => {
    const j = Array.from(M);
    if (j.length !== 0) {
      K(!0);
      try {
        const { results: P } = await $o(e, j), le = Object.entries(P).filter(
          ([, O]) => O.success === !1
        ), ye = j.length - le.length;
        le.length > 0 ? g.warning(
          `批量启用完成：成功 ${ye} 个，失败 ${le.length} 个`
        ) : g.success(`成功启用 ${j.length} 个技能`), ne(), await X();
      } catch (P) {
        g.error(P.message || "批量启用失败");
      } finally {
        K(!1);
      }
    }
  }, ve = async () => {
    const j = Array.from(M);
    if (j.length !== 0) {
      K(!0);
      try {
        const { results: P } = await Po(e, j), le = Object.entries(P).filter(
          ([, O]) => O.success === !1
        ), ye = j.length - le.length;
        le.length > 0 ? g.warning(
          `批量停用完成：成功 ${ye} 个，失败 ${le.length} 个`
        ) : g.success(`成功停用 ${j.length} 个技能`), ne(), await X();
      } catch (P) {
        g.error(P.message || "批量停用失败");
      } finally {
        K(!1);
      }
    }
  }, se = () => {
    const j = Array.from(M);
    j.length !== 0 && y.confirm({
      title: `确认删除 ${j.length} 个技能？`,
      content: "删除后技能将从当前专家工作区移除，此操作不可撤销。技能池中的原始技能不受影响。",
      okText: "确认删除",
      cancelText: "取消",
      okButtonProps: { danger: !0 },
      onOk: async () => {
        K(!0);
        try {
          const { results: P } = await Ro(e, j), le = Object.entries(P).filter(
            ([, O]) => O.success === !1
          ), ye = j.length - le.length;
          le.length > 0 ? g.warning(
            `批量删除完成：成功 ${ye} 个，失败 ${le.length} 个`
          ) : g.success(`成功删除 ${j.length} 个技能`), ne(), await X();
        } catch (P) {
          g.error(P.message || "批量删除失败");
        } finally {
          K(!1);
        }
      }
    });
  }, Se = async (j) => {
    ge(!0);
    try {
      j.enabled === !1 ? (await Wa(e, j.name), g.success(`已启用技能「${j.name}」`)) : (await qa(e, j.name), g.success(`已禁用技能「${j.name}」`)), await X();
    } catch (P) {
      g.error(P.message || "操作失败");
    } finally {
      ge(!1);
    }
  }, Ie = (j) => {
    y.confirm({
      title: `确认删除技能「${j.name}」？`,
      content: "删除后技能将从当前专家工作区移除，此操作不可撤销。技能池中的原始技能不受影响。",
      okText: "确认删除",
      cancelText: "取消",
      okButtonProps: { danger: !0 },
      onOk: async () => {
        ge(!0);
        try {
          await lr(e, j.name), g.success(`已删除技能「${j.name}」`), await X();
        } catch (P) {
          g.error(P.message || "删除失败");
        } finally {
          ge(!1);
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
        C,
        { type: "secondary", style: { fontSize: 13 } },
        ae ? `已选择 ${M.size} / ${_.length} 个技能` : `共 ${_.length} 个技能`
      ),
      a.createElement(
        "div",
        { style: { display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" } },
        ae ? a.createElement(
          a.Fragment,
          null,
          a.createElement(
            d,
            { size: "small", onClick: xe },
            "全选"
          ),
          a.createElement(
            d,
            {
              size: "small",
              icon: B ? a.createElement(B) : void 0,
              onClick: ne
            },
            "取消选择"
          ),
          a.createElement(
            d,
            {
              size: "small",
              type: "default",
              icon: $ ? a.createElement($) : void 0,
              disabled: M.size === 0 || te,
              loading: te,
              onClick: Be
            },
            "批量启用"
          ),
          a.createElement(
            d,
            {
              size: "small",
              danger: !0,
              icon: J ? a.createElement(J) : void 0,
              disabled: M.size === 0 || te,
              loading: te,
              onClick: ve
            },
            "批量停用"
          ),
          a.createElement(
            d,
            {
              size: "small",
              danger: !0,
              icon: F ? a.createElement(F) : void 0,
              disabled: M.size === 0 || te,
              loading: te,
              onClick: se
            },
            `删除 (${M.size})`
          ),
          a.createElement(
            d,
            {
              size: "small",
              type: "primary",
              onClick: we
            },
            "退出批量"
          )
        ) : a.createElement(
          a.Fragment,
          null,
          a.createElement(
            d,
            {
              size: "small",
              icon: I ? a.createElement(I) : void 0,
              onClick: we,
              disabled: _.length === 0
            },
            "批量管理"
          ),
          a.createElement(
            d,
            {
              icon: S ? a.createElement(S) : void 0,
              onClick: () => {
                Ht(), X();
              }
            },
            "刷新"
          )
        )
      )
    ),
    W ? a.createElement(
      "div",
      { style: { textAlign: "center", padding: 60 } },
      a.createElement(i, { size: "large" })
    ) : _.length === 0 ? a.createElement(c, {
      description: "当前智能体未加载任何技能"
    }) : a.createElement(
      u,
      { gutter: [12, 12] },
      ..._.map(
        (j) => a.createElement(
          m,
          { key: j.name, xs: 24, sm: 12, md: 8, lg: 6 },
          a.createElement(
            p,
            {
              hoverable: !0,
              size: "small",
              style: {
                cursor: ae ? "default" : "pointer",
                height: "100%",
                position: "relative",
                borderColor: ae && M.has(j.name) ? "#0072f5" : void 0,
                borderWidth: ae && M.has(j.name) ? 2 : 1
              },
              onClick: () => {
                ae ? ce(j.name) : (ee(j), U(!0));
              },
              onMouseEnter: () => {
                ae || L(j.name);
              },
              onMouseLeave: () => L(null)
            },
            ae ? a.createElement(
              "div",
              {
                style: {
                  position: "absolute",
                  top: 8,
                  right: 8,
                  zIndex: 1
                },
                onClick: (P) => {
                  P.stopPropagation(), ce(j.name);
                }
              },
              a.createElement(h, {
                checked: M.has(j.name)
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
              j.emoji ? a.createElement(
                "span",
                { style: { fontSize: 18 } },
                j.emoji
              ) : a.createElement(
                "span",
                { style: { fontSize: 18 } },
                "⚡"
              ),
              a.createElement(
                C,
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
                j.name
              ),
              j.enabled === !1 ? a.createElement(
                w,
                { color: "default", style: { fontSize: 10 } },
                "已禁用"
              ) : a.createElement(
                w,
                { color: "green", style: { fontSize: 10 } },
                "已启用"
              )
            ),
            j.description ? a.createElement(
              x,
              {
                type: "secondary",
                style: { fontSize: 11, margin: 0, lineHeight: 1.4 },
                ellipsis: { rows: 2 }
              },
              j.description
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
              j.version_text ? a.createElement(
                w,
                { style: { fontSize: 10 } },
                `v${j.version_text}`
              ) : null,
              ...(j.tags || []).slice(0, 3).map(
                (P, le) => a.createElement(
                  w,
                  { key: le, color: "blue", style: { fontSize: 10 } },
                  P
                )
              )
            ),
            // Hover action footer (not in batch mode)
            !ae && ue === j.name ? a.createElement(
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
                d,
                {
                  size: "small",
                  type: "default",
                  icon: j.enabled === !1 ? $ ? a.createElement($) : void 0 : J ? a.createElement(J) : void 0,
                  disabled: ie,
                  onClick: (P) => {
                    P.stopPropagation(), Se(j);
                  }
                },
                j.enabled === !1 ? "启用" : "禁用"
              ),
              a.createElement(
                d,
                {
                  size: "small",
                  danger: !0,
                  icon: F ? a.createElement(F) : void 0,
                  disabled: ie,
                  onClick: (P) => {
                    P.stopPropagation(), Ie(j);
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
    A ? a.createElement(
      E,
      {
        title: a.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 8 } },
          a.createElement(
            "span",
            { style: { fontSize: 18 } },
            A.emoji || "⚡"
          ),
          a.createElement("span", null, A.name)
        ),
        open: G,
        onClose: () => U(!1),
        width: 520,
        extra: a.createElement(
          d,
          {
            type: "primary",
            size: "small",
            icon: V ? a.createElement(V) : void 0,
            onClick: () => r("/skills")
          },
          "管理技能"
        )
      },
      a.createElement(
        v,
        { column: 1, bordered: !0, size: "small" },
        a.createElement(
          v.Item,
          { label: "技能名称" },
          A.name
        ),
        a.createElement(
          v.Item,
          { label: "描述" },
          A.description || "-"
        ),
        A.version_text ? a.createElement(
          v.Item,
          { label: "版本" },
          A.version_text
        ) : null,
        a.createElement(
          v.Item,
          { label: "来源" },
          A.source || "-"
        ),
        a.createElement(
          v.Item,
          { label: "状态" },
          A.enabled === !1 ? "已禁用" : "已启用"
        ),
        A.installed_from ? a.createElement(
          v.Item,
          { label: "安装来源" },
          A.installed_from
        ) : null
      ),
      // Tags
      A.tags && A.tags.length > 0 ? a.createElement(
        "div",
        { style: { marginTop: 16 } },
        a.createElement(
          C,
          {
            strong: !0,
            style: { display: "block", marginBottom: 8 }
          },
          "标签"
        ),
        a.createElement(
          "div",
          { style: { display: "flex", flexWrap: "wrap", gap: 4 } },
          ...A.tags.map(
            (j, P) => a.createElement(w, { key: P, color: "blue" }, j)
          )
        )
      ) : null,
      // Skill content preview
      A.content ? a.createElement(
        "div",
        { style: { marginTop: 16 } },
        a.createElement(
          C,
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
              background: "var(--ant-color-fill-secondary, #f5f5f5)",
              borderRadius: 6,
              fontSize: 12,
              whiteSpace: "pre-wrap"
            }
          },
          A.content.slice(0, 2e3) + (A.content.length > 2e3 ? `

... (内容已截断)` : "")
        )
      ) : null
    ) : null
  );
}
function ji({
  poolSkills: e,
  workspaceSkills: t,
  agents: n,
  loading: r,
  onReload: a,
  onSkillInstalled: l,
  agentId: o,
  agentName: s
}) {
  const i = k().React, { useState: c, useMemo: d, useCallback: u, useEffect: m, useRef: p } = i, {
    Spin: w,
    Empty: h,
    Input: y,
    Button: f,
    Row: E,
    Col: v,
    Card: g,
    Tag: S,
    Typography: z,
    Drawer: V,
    Descriptions: I,
    List: $,
    Modal: J,
    message: F
  } = k().antd, {
    ReloadOutlined: B,
    SearchOutlined: C,
    DownloadOutlined: x,
    ThunderboltOutlined: _,
    DeleteOutlined: T,
    PlusOutlined: W
  } = k().antdIcons || {}, { Text: N, Paragraph: G } = z, [U, A] = c(""), [ee, ae] = c(!1), [D, M] = c(null), [oe, te] = c([]), [K, ue] = c(!1), [L, ie] = c(24), [ge, X] = c(null), [ce, ne] = c(!1), xe = p(0), we = p(null), Be = d(
    () => {
      var Z;
      return new Set(
        ((Z = t.find((pe) => pe.agent_id === o)) == null ? void 0 : Z.skill_names) || []
      );
    },
    [t, o]
  ), ve = d(() => {
    if (!U.trim()) return e;
    const Z = U.toLowerCase();
    return e.filter(
      (pe) => {
        var be, Re;
        return pe.name.toLowerCase().includes(Z) || ((be = pe.description) == null ? void 0 : be.toLowerCase().includes(Z)) || ((Re = pe.tags) == null ? void 0 : Re.some((R) => R.toLowerCase().includes(Z)));
      }
    );
  }, [e, U]), se = d(
    () => ve.slice(0, L),
    [ve, L]
  );
  m(() => {
    if (se.length >= ve.length) return;
    const Z = we.current;
    if (!Z) return;
    const pe = () => {
      ie(
        (Re) => Math.min(Re + 24, ve.length)
      );
    };
    if (typeof IntersectionObserver < "u") {
      const Re = new IntersectionObserver(
        (R) => {
          R.some((fe) => fe.isIntersecting) && pe();
        },
        { rootMargin: "240px 0px" }
      );
      return Re.observe(Z), () => Re.disconnect();
    }
    const be = () => {
      Z.getBoundingClientRect().top <= window.innerHeight + 240 && pe();
    };
    return window.addEventListener("scroll", be, { passive: !0 }), be(), () => window.removeEventListener("scroll", be);
  }, [ve.length, se.length]);
  const Se = u((Z) => {
    A(Z), ie(24);
  }, []), Ie = u(() => {
    const Z = xe.current;
    requestAnimationFrame(() => {
      window.scrollTo({ top: Z, behavior: "auto" }), document.scrollingElement && (document.scrollingElement.scrollTop = Z);
    });
  }, []), j = u(async () => {
    var Z;
    xe.current = ((Z = document.scrollingElement) == null ? void 0 : Z.scrollTop) ?? window.scrollY ?? 0;
    try {
      await a();
    } finally {
      Ie();
    }
  }, [a, Ie]), P = u(
    (Z) => {
      const pe = [];
      for (const be of t)
        if (be.skill_names.includes(Z)) {
          const Re = n.find((R) => R.id === be.agent_id);
          pe.push((Re == null ? void 0 : Re.name) || be.agent_name || be.agent_id);
        }
      return pe;
    },
    [t, n]
  ), le = u(
    async (Z) => {
      if (M(Z), te(P(Z.name)), ae(!0), !Z.content) {
        ue(!0);
        try {
          const pe = await ko(Z.name);
          M({ ...Z, content: pe });
        } catch {
        } finally {
          ue(!1);
        }
      }
    },
    [P]
  );
  m(() => {
    D && te(P(D.name));
  }, [D, P, t]);
  const ye = async (Z) => {
    ne(!0);
    try {
      await ar(o, Z.name), F.success(
        `已将技能「${Z.name}」加载到当前专家「${s}」`
      ), l(Z);
    } catch (pe) {
      F.error(pe.message || "加载技能失败");
    } finally {
      ne(!1);
    }
  }, O = (Z) => {
    if (Z.protected) {
      F.warning("内置技能不可删除");
      return;
    }
    J.confirm({
      title: `确认从技能池删除「${Z.name}」？`,
      content: "删除后所有已安装此技能的专家将不受影响，但技能池中将不再包含此技能。此操作不可撤销。",
      okText: "确认删除",
      cancelText: "取消",
      okButtonProps: { danger: !0 },
      onOk: async () => {
        ne(!0);
        try {
          await Mo(Z.name), F.success(`已从技能池删除「${Z.name}」`), await j();
        } catch (pe) {
          F.error(pe.message || "删除失败");
        } finally {
          ne(!1);
        }
      }
    });
  }, he = (Z) => {
    window.history.pushState({}, "", Z), window.dispatchEvent(new PopStateEvent("popstate"));
  };
  return i.createElement(
    "div",
    null,
    i.createElement(
      "div",
      {
        style: {
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16
        }
      },
      i.createElement(y, {
        placeholder: "搜索技能名称、描述或标签...",
        prefix: C ? i.createElement(C) : void 0,
        value: U,
        onChange: (Z) => Se(Z.target.value),
        allowClear: !0,
        style: { maxWidth: 400 }
      }),
      i.createElement(
        "div",
        { style: { display: "flex", gap: 8 } },
        i.createElement(
          f,
          {
            icon: B ? i.createElement(B) : void 0,
            onClick: j,
            loading: r,
            size: "small"
          },
          "刷新"
        ),
        i.createElement(
          f,
          {
            type: "primary",
            icon: x ? i.createElement(x) : void 0,
            onClick: () => he("/skill-pool"),
            size: "small",
            style: We
          },
          "管理技能池"
        )
      )
    ),
    r ? i.createElement(
      "div",
      { style: { textAlign: "center", padding: 60 } },
      i.createElement(w, { size: "large" })
    ) : ve.length === 0 ? i.createElement(h, {
      description: U ? "未找到匹配的技能" : "技能池为空"
    }) : i.createElement(
      i.Fragment,
      null,
      i.createElement(
        E,
        { gutter: [12, 12] },
        ...se.map(
          (Z) => i.createElement(
            v,
            { key: Z.name, xs: 24, sm: 12, md: 8, lg: 6 },
            i.createElement(
              g,
              {
                hoverable: !0,
                size: "small",
                style: { cursor: "pointer", height: "100%" },
                onClick: () => le(Z),
                onMouseEnter: () => X(Z.name),
                onMouseLeave: () => X(null)
              },
              i.createElement(
                "div",
                {
                  style: {
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 8
                  }
                },
                Z.emoji ? i.createElement(
                  "span",
                  { style: { fontSize: 18 } },
                  Z.emoji
                ) : i.createElement(
                  "span",
                  { style: { fontSize: 18 } },
                  "⚡"
                ),
                i.createElement(
                  N,
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
                  Z.name
                ),
                Z.protected ? i.createElement(
                  S,
                  { color: "gold", style: { fontSize: 10 } },
                  "内置"
                ) : null
              ),
              Z.description ? i.createElement(
                G,
                {
                  type: "secondary",
                  style: { fontSize: 11, margin: 0, lineHeight: 1.4 },
                  ellipsis: { rows: 2 }
                },
                Z.description
              ) : null,
              i.createElement(
                "div",
                {
                  style: {
                    marginTop: 8,
                    display: "flex",
                    gap: 4,
                    flexWrap: "wrap"
                  }
                },
                Z.version_text ? i.createElement(
                  S,
                  { style: { fontSize: 10 } },
                  `v${Z.version_text}`
                ) : null,
                ...(Z.tags || []).slice(0, 3).map(
                  (pe, be) => i.createElement(
                    S,
                    { key: be, color: "cyan", style: { fontSize: 10 } },
                    pe
                  )
                )
              ),
              // Hover action footer
              ge === Z.name ? i.createElement(
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
                i.createElement(
                  f,
                  {
                    size: "small",
                    type: "primary",
                    icon: W ? i.createElement(W) : void 0,
                    disabled: ce || Be.has(Z.name),
                    onClick: (pe) => {
                      pe.stopPropagation(), ye(Z);
                    }
                  },
                  Be.has(Z.name) ? "已加载" : "加载到当前Agent"
                ),
                i.createElement(
                  f,
                  {
                    size: "small",
                    danger: !0,
                    icon: T ? i.createElement(T) : void 0,
                    disabled: ce || Z.protected,
                    onClick: (pe) => {
                      pe.stopPropagation(), O(Z);
                    }
                  },
                  "删除"
                )
              ) : null
            )
          )
        ),
        // Infinite-scroll sentinel
        se.length < ve.length ? i.createElement(
          "div",
          {
            ref: we,
            style: {
              minHeight: 40,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginTop: 16
            }
          },
          i.createElement(
            N,
            { type: "secondary", style: { fontSize: 12 } },
            `继续下滑自动加载 · 还剩 ${ve.length - se.length} 个`
          )
        ) : null
      )
    ),
    // Skill detail drawer
    D ? i.createElement(
      V,
      {
        title: i.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 8 } },
          i.createElement(
            "span",
            { style: { fontSize: 18 } },
            D.emoji || "⚡"
          ),
          i.createElement("span", null, D.name)
        ),
        open: ee,
        onClose: () => ae(!1),
        width: 520,
        extra: i.createElement(
          f,
          {
            type: "primary",
            size: "small",
            icon: _ ? i.createElement(_) : void 0,
            onClick: () => he("/skills")
          },
          "管理技能"
        )
      },
      i.createElement(
        I,
        { column: 1, bordered: !0, size: "small" },
        i.createElement(
          I.Item,
          { label: "技能名称" },
          D.name
        ),
        i.createElement(
          I.Item,
          { label: "描述" },
          D.description || "-"
        ),
        D.version_text ? i.createElement(
          I.Item,
          { label: "版本" },
          D.version_text
        ) : null,
        i.createElement(
          I.Item,
          { label: "来源" },
          D.source || "-"
        ),
        i.createElement(
          I.Item,
          { label: "受保护" },
          D.protected ? "是（内置）" : "否"
        ),
        D.sync_status ? i.createElement(
          I.Item,
          { label: "同步状态" },
          D.sync_status
        ) : null,
        D.installed_from ? i.createElement(
          I.Item,
          { label: "安装来源" },
          D.installed_from
        ) : null
      ),
      // Tags
      D.tags && D.tags.length > 0 ? i.createElement(
        "div",
        { style: { marginTop: 16 } },
        i.createElement(
          N,
          {
            strong: !0,
            style: { display: "block", marginBottom: 8 }
          },
          "标签"
        ),
        i.createElement(
          "div",
          { style: { display: "flex", flexWrap: "wrap", gap: 4 } },
          ...D.tags.map(
            (Z, pe) => i.createElement(S, { key: pe, color: "cyan" }, Z)
          )
        )
      ) : null,
      // Installed agents
      i.createElement(
        "div",
        { style: { marginTop: 16 } },
        i.createElement(
          N,
          { strong: !0, style: { display: "block", marginBottom: 8 } },
          `已安装此技能的专家 (${oe.length})`
        ),
        oe.length > 0 ? i.createElement($, {
          size: "small",
          dataSource: oe,
          renderItem: (Z) => i.createElement(
            $.Item,
            null,
            i.createElement(
              "div",
              {
                style: {
                  display: "flex",
                  alignItems: "center",
                  gap: 6
                }
              },
              i.createElement(et, { name: Z, size: 20 }),
              i.createElement(
                N,
                { style: { fontSize: 13 } },
                Z
              )
            )
          )
        }) : i.createElement(
          N,
          { type: "secondary", style: { fontSize: 12 } },
          "暂无专家安装此技能"
        )
      ),
      // Skill content preview (lazy-loaded)
      K ? i.createElement(
        "div",
        { style: { marginTop: 16, textAlign: "center" } },
        i.createElement(w, { size: "small" })
      ) : D.content ? i.createElement(
        "div",
        { style: { marginTop: 16 } },
        i.createElement(
          N,
          {
            strong: !0,
            style: { display: "block", marginBottom: 8 }
          },
          "技能内容"
        ),
        i.createElement(
          "div",
          {
            style: {
              maxHeight: 300,
              overflow: "auto",
              padding: 12,
              background: "var(--ant-color-fill-secondary, #f5f5f5)",
              borderRadius: 6,
              fontSize: 12,
              whiteSpace: "pre-wrap"
            }
          },
          D.content.slice(0, 2e3) + (D.content.length > 2e3 ? `

... (内容已截断)` : "")
        )
      ) : null
    ) : null
  );
}
function Ni({
  embedded: e = !1
} = {}) {
  const t = k().React, { useState: n, useEffect: r, useCallback: a, useMemo: l } = t, { Tabs: o, message: s } = k().antd, { ThunderboltOutlined: i, AppstoreOutlined: c } = k().antdIcons || {}, u = k().useSelectedAgent, m = u ? u() : null, p = (m == null ? void 0 : m.id) || "default";
  r(() => {
    nr();
  }, [p]);
  const [w, h] = n([]), [y, f] = n([]), [E, v] = n([]), [g, S] = n(!0), [z, V] = n("agent-skills"), [I, $] = n(0), J = a(async () => {
    S(!0);
    try {
      const [T, W, N] = await Promise.all([
        xn(!0),
        wn(),
        Co()
      ]);
      f(T), h(W), v(N);
    } catch (T) {
      s.error(T.message || "加载技能列表失败"), f([]);
    } finally {
      S(!1);
    }
  }, []);
  r(() => {
    J();
  }, [J]);
  const F = l(() => {
    const T = w.find((W) => W.id === p);
    return (T == null ? void 0 : T.name) || p;
  }, [w, p]), B = a(
    (T) => {
      v(
        (W) => W.some((N) => N.agent_id === p) ? W.map((N) => N.agent_id !== p || N.skill_names.includes(T.name) ? N : {
          ...N,
          skill_names: [...N.skill_names, T.name]
        }) : [
          ...W,
          {
            agent_id: p,
            agent_name: F,
            skill_names: [T.name]
          }
        ]
      ), $((W) => W + 1);
    },
    [p, F]
  ), C = (T) => {
    window.history.pushState({}, "", T), window.dispatchEvent(new PopStateEvent("popstate"));
  }, x = [
    {
      key: "agent-skills",
      label: t.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        i ? t.createElement(i, { style: { fontSize: 14 } }) : null,
        "当前专家"
      ),
      children: t.createElement(Ui, {
        agentId: p,
        agentName: F,
        refreshKey: I,
        onNavigate: C
      })
    },
    {
      key: "skill-pool",
      label: t.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        c ? t.createElement(c, { style: { fontSize: 14 } }) : null,
        "技能库"
      ),
      children: t.createElement(ji, {
        poolSkills: y,
        workspaceSkills: E,
        agents: w,
        loading: g,
        onReload: J,
        onSkillInstalled: B,
        agentId: p,
        agentName: F
      })
    }
  ], _ = t.createElement(o, {
    items: x,
    activeKey: z,
    onChange: (T) => V(T)
  });
  return e ? _ : t.createElement(
    "div",
    { style: { padding: 24 } },
    t.createElement(vn, {
      title: "技能",
      subtitle: `技能池共 ${y.length} 个技能 · 当前智能体：${F}`
    }),
    _
  );
}
const Gn = {
  reservoir_simulation: "油藏数值模拟",
  geological_modeling: "地质建模",
  well_log_analysis: "测井分析",
  production_engineering: "采油工程",
  post_processing: "后处理与可视化",
  multiphysics: "多物理场仿真"
}, ol = {
  reservoir_simulation: "🛢️",
  geological_modeling: "🏔️",
  well_log_analysis: "📡",
  production_engineering: "⚙️",
  post_processing: "📊",
  multiphysics: "🔬"
}, il = /* @__PURE__ */ new Set(["cmg", "comsol", "tnavigator", "eclipse", "intersect", "visage"]);
function sl(e) {
  return En(`/ugsci/engines/icon/${encodeURIComponent(e)}`);
}
async function Di() {
  return de("/ugsci/engines/list");
}
async function Fi(e) {
  return de("/ugsci/engines/", {
    method: "POST",
    body: JSON.stringify(e)
  });
}
async function Gi(e, t) {
  return de(`/ugsci/engines/${encodeURIComponent(e)}`, {
    method: "PUT",
    body: JSON.stringify(t)
  });
}
async function Hi(e) {
  return de(
    `/ugsci/engines/${encodeURIComponent(e)}`,
    { method: "DELETE" }
  );
}
async function Wi() {
  return de("/ugsci/engines/detect/refresh", {
    method: "POST"
  });
}
function Vi({
  engine: e,
  onClick: t
}) {
  const n = k().React, { Card: r, Tag: a, Typography: l } = k().antd, { Text: o } = l, s = e.status === "detected", i = ol[e.category] || "📦", d = il.has(e.id) ? n.createElement("img", {
    src: sl(e.id),
    alt: e.name,
    style: { width: 24, height: 24, objectFit: "contain" }
  }) : n.createElement("span", { style: { fontSize: 20 } }, i);
  return n.createElement(
    r,
    {
      hoverable: !0,
      onClick: t,
      size: "small",
      style: {
        cursor: "pointer",
        borderColor: s ? void 0 : "var(--ant-color-border, #d9d9d9)",
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
        d,
        n.createElement(
          "div",
          null,
          n.createElement(
            o,
            { strong: !0, style: { fontSize: 14 } },
            e.name
          ),
          n.createElement("br"),
          n.createElement(
            o,
            { type: "secondary", style: { fontSize: 11 } },
            e.vendor || "—"
          )
        )
      ),
      n.createElement(
        "div",
        { style: { display: "flex", flexDirection: "column", gap: 4, alignItems: "flex-end" } },
        s ? n.createElement(
          a,
          { color: "success", style: { fontSize: 11 } },
          "✅ 已检测"
        ) : e.executable_path ? n.createElement(
          a,
          { color: "warning", style: { fontSize: 11 } },
          "⚠ 路径无效"
        ) : n.createElement(
          a,
          { style: { fontSize: 11 } },
          "🔧 待配置"
        ),
        e.is_default ? n.createElement(
          a,
          { color: "blue", style: { fontSize: 10 } },
          "默认"
        ) : e.is_custom ? n.createElement(
          a,
          { color: "purple", style: { fontSize: 10 } },
          "自定义"
        ) : null
      )
    ),
    n.createElement(
      "div",
      { style: { flex: 1, minHeight: 32 } },
      n.createElement(
        o,
        { type: "secondary", style: { fontSize: 12 } },
        e.description || "暂无描述"
      )
    ),
    n.createElement(
      "div",
      {
        style: {
          marginTop: 8,
          display: "flex",
          gap: 4,
          flexWrap: "wrap"
        }
      },
      e.category ? n.createElement(
        a,
        { style: { fontSize: 11 } },
        Gn[e.category] || e.category
      ) : null,
      e.version ? n.createElement(
        a,
        { color: "blue", style: { fontSize: 11 } },
        `v${e.version}`
      ) : null,
      ...(e.modules || []).map(
        (u) => n.createElement(
          a,
          { key: u, color: "cyan", style: { fontSize: 10 } },
          u
        )
      )
    )
  );
}
function qi() {
  const e = k().React, { useState: t, useEffect: n, useCallback: r, useMemo: a } = e, {
    Spin: l,
    Empty: o,
    Button: s,
    message: i,
    Row: c,
    Col: d,
    Drawer: u,
    Descriptions: m,
    Tag: p,
    Typography: w,
    Modal: h,
    Input: y,
    Select: f,
    Popconfirm: E,
    Space: v
  } = k().antd, {
    ReloadOutlined: g,
    SearchOutlined: S,
    PlusOutlined: z,
    EditOutlined: V,
    DeleteOutlined: I,
    CopyOutlined: $,
    ExperimentOutlined: J
  } = k().antdIcons || {}, { Text: F, Paragraph: B } = w, [C, x] = t([]), [_, T] = t(!0), [W, N] = t(""), [G, U] = t(!1), [A, ee] = t(null), [ae, D] = t(!1), [M, oe] = t(null), [te, K] = t({}), [ue, L] = t(!1), ie = r(async () => {
    T(!0);
    try {
      const se = await Di();
      x(se.engines || []);
    } catch (se) {
      i.error(se.message || "加载引擎列表失败"), x([]);
    } finally {
      T(!1);
    }
  }, []);
  n(() => {
    ie();
  }, [ie]);
  const ge = a(() => {
    if (!W.trim()) return C;
    const se = W.toLowerCase();
    return C.filter(
      (Se) => {
        var Ie;
        return Se.name.toLowerCase().includes(se) || Se.vendor.toLowerCase().includes(se) || Se.category.toLowerCase().includes(se) || ((Ie = Se.description) == null ? void 0 : Ie.toLowerCase().includes(se));
      }
    );
  }, [C, W]);
  C.filter((se) => se.status === "detected").length;
  const X = r((se) => {
    navigator.clipboard.writeText(se).then(() => i.success("路径已复制")).catch(() => i.error("复制失败"));
  }, []), ce = r(() => {
    oe(null), K({
      name: "",
      vendor: "",
      version: "",
      executable_path: "",
      category: "",
      description: "",
      invocation_hint: ""
    }), D(!0);
  }, []), ne = r((se) => {
    oe(se), K({ ...se }), D(!0), U(!1);
  }, []), xe = r(async () => {
    var se;
    if (!((se = te.name) != null && se.trim())) {
      i.warning("请输入引擎名称");
      return;
    }
    L(!0);
    try {
      M ? (await Gi(M.id, te), i.success("引擎已更新")) : (await Fi(te), i.success("引擎已添加")), D(!1), ie();
    } catch (Se) {
      i.error(Se.message || "保存失败");
    } finally {
      L(!1);
    }
  }, [te, M, ie]), we = r(
    async (se) => {
      try {
        await Hi(se), i.success("引擎已删除"), U(!1), ie();
      } catch (Se) {
        i.error(Se.message || "删除失败");
      }
    },
    [ie]
  ), Be = r(async () => {
    T(!0);
    try {
      const se = await Wi();
      x(se.engines || []), i.success("自动检测完成");
    } catch (se) {
      i.error(se.message || "检测失败");
    } finally {
      T(!1);
    }
  }, []), ve = r(
    (se, Se, Ie) => {
      const j = te[Se] || "";
      return e.createElement(
        "div",
        { style: { marginBottom: 12 } },
        e.createElement(
          F,
          { style: { fontSize: 13, display: "block", marginBottom: 4 } },
          se
        ),
        Ie != null && Ie.select ? e.createElement(f, {
          value: j || void 0,
          onChange: (P) => K((le) => ({ ...le, [Se]: P })),
          style: { width: "100%" },
          options: Ie.select.options,
          allowClear: !0,
          placeholder: `选择${se}`
        }) : Ie != null && Ie.textarea ? e.createElement(y.TextArea, {
          value: j,
          onChange: (P) => K((le) => ({ ...le, [Se]: P.target.value })),
          rows: 3,
          placeholder: `输入${se}`
        }) : e.createElement(y, {
          value: j,
          onChange: (P) => K((le) => ({ ...le, [Se]: P.target.value })),
          placeholder: `输入${se}`
        })
      );
    },
    [te]
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
      e.createElement(y, {
        placeholder: "搜索引擎名称、厂商...",
        prefix: S ? e.createElement(S) : void 0,
        value: W,
        onChange: (se) => N(se.target.value),
        allowClear: !0,
        style: { maxWidth: 280 }
      }),
      e.createElement(
        s,
        {
          icon: g ? e.createElement(g) : void 0,
          onClick: Be,
          loading: _
        },
        "自动检测"
      ),
      e.createElement(
        s,
        {
          type: "primary",
          icon: z ? e.createElement(z) : void 0,
          onClick: ce,
          style: We
        },
        "添加引擎"
      )
    ),
    // Content
    _ ? e.createElement(
      "div",
      { style: { textAlign: "center", padding: 60 } },
      e.createElement(l, {
        size: "large",
        tip: "正在加载引擎..."
      })
    ) : ge.length === 0 ? e.createElement(o, {
      description: W ? "无匹配引擎" : "暂无引擎，点击「添加引擎」开始"
    }) : e.createElement(
      c,
      { gutter: [12, 12], align: "stretch" },
      ...ge.map(
        (se) => e.createElement(
          d,
          {
            key: se.id,
            xs: 24,
            sm: 12,
            md: 8,
            lg: 6,
            style: { display: "flex" }
          },
          e.createElement(Vi, {
            engine: se,
            onClick: () => {
              ee(se), U(!0);
            }
          })
        )
      )
    ),
    // Detail drawer
    A ? e.createElement(
      u,
      {
        title: e.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 8 } },
          e.createElement(
            "span",
            { style: { display: "flex", alignItems: "center" } },
            il.has(A.id) ? e.createElement("img", {
              src: sl(A.id),
              alt: A.name,
              style: { width: 20, height: 20, objectFit: "contain" }
            }) : e.createElement(
              "span",
              { style: { fontSize: 18 } },
              ol[A.category] || "📦"
            )
          ),
          e.createElement("span", null, A.name)
        ),
        open: G,
        onClose: () => U(!1),
        width: 520,
        extra: e.createElement(
          v,
          null,
          e.createElement(
            s,
            {
              size: "small",
              icon: V ? e.createElement(V) : void 0,
              onClick: () => ne(A)
            },
            "编辑"
          ),
          A.is_default ? null : e.createElement(
            E,
            {
              title: "确认删除此引擎？",
              description: A.name,
              onConfirm: () => we(A.id),
              okText: "删除",
              cancelText: "取消",
              okButtonProps: { danger: !0 }
            },
            e.createElement(
              s,
              {
                size: "small",
                danger: !0,
                icon: I ? e.createElement(I) : void 0
              },
              "删除"
            )
          )
        )
      },
      e.createElement(
        m,
        { column: 1, bordered: !0, size: "small" },
        e.createElement(
          m.Item,
          { label: "引擎名称" },
          A.name
        ),
        e.createElement(
          m.Item,
          { label: "厂商" },
          A.vendor || "—"
        ),
        e.createElement(
          m.Item,
          { label: "分类" },
          A.category ? Gn[A.category] || A.category : "—"
        ),
        e.createElement(
          m.Item,
          { label: "状态" },
          e.createElement(
            p,
            {
              color: A.status === "detected" ? "success" : A.status === "not_found" ? "error" : "default"
            },
            A.status === "detected" ? "✅ 已检测" : A.status === "not_found" ? "❌ 路径无效" : "🔧 待配置"
          )
        ),
        e.createElement(
          m.Item,
          { label: "版本" },
          A.version || "—"
        ),
        A.executable_path ? e.createElement(
          m.Item,
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
              A.executable_path
            ),
            e.createElement(
              s,
              {
                size: "small",
                type: "text",
                icon: $ ? e.createElement($) : void 0,
                onClick: () => X(A.executable_path)
              }
            )
          )
        ) : null,
        A.install_dir ? e.createElement(
          m.Item,
          { label: "安装目录" },
          e.createElement(
            "code",
            { style: { fontSize: 12, wordBreak: "break-all" } },
            A.install_dir
          )
        ) : null,
        // Display detected modules with paths
        A.modules && A.modules.length > 0 ? e.createElement(
          m.Item,
          { label: "已检测模块" },
          e.createElement(
            "div",
            { style: { display: "flex", flexDirection: "column", gap: 4 } },
            ...A.modules.map(
              (se) => e.createElement(
                "div",
                {
                  key: se,
                  style: { display: "flex", alignItems: "center", gap: 8 }
                },
                e.createElement(
                  p,
                  { color: "cyan", style: { fontSize: 11 } },
                  se
                ),
                A.module_paths && A.module_paths[se] ? e.createElement(
                  "code",
                  { style: { fontSize: 11, wordBreak: "break-all" } },
                  A.module_paths[se]
                ) : null
              )
            )
          )
        ) : null,
        A.license_server ? e.createElement(
          m.Item,
          { label: "许可证服务器" },
          A.license_server
        ) : null,
        e.createElement(
          m.Item,
          { label: "描述" },
          A.description || "—"
        )
      ),
      // Invocation hint
      A.invocation_hint ? e.createElement(
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
          A.invocation_hint
        )
      ) : null,
      // Type badge
      e.createElement(
        "div",
        { style: { marginTop: 12 } },
        A.is_default ? e.createElement(
          p,
          { color: "blue" },
          "默认引擎"
        ) : A.is_custom ? e.createElement(
          p,
          { color: "purple" },
          "自定义引擎"
        ) : null
      )
    ) : null,
    // Add/Edit modal
    e.createElement(
      h,
      {
        title: M ? "编辑引擎" : "添加引擎",
        open: ae,
        onOk: xe,
        onCancel: () => D(!1),
        okText: M ? "保存" : "添加",
        cancelText: "取消",
        confirmLoading: ue,
        width: 560
      },
      e.createElement(
        "div",
        { style: { maxHeight: 480, overflow: "auto", paddingRight: 8 } },
        ve("引擎名称 *", "name"),
        ve("厂商", "vendor"),
        ve("版本", "version"),
        ve("可执行文件路径", "executable_path"),
        ve("安装目录", "install_dir"),
        ve("分类", "category", {
          select: {
            options: Object.entries(Gn).map(([se, Se]) => ({
              label: Se,
              value: se
            }))
          }
        }),
        ve("描述", "description", { textarea: !0 }),
        ve("调用方式提示", "invocation_hint", { textarea: !0 }),
        ve("许可证服务器", "license_server")
      )
    )
  );
}
async function Ji(e = !1) {
  const t = await de(
    "/ugsci/domain-engines/list",
    e ? { bypassCache: !0 } : void 0
  );
  return (t == null ? void 0 : t.engines) || [];
}
function Ki(e = !1) {
  return de(
    "/ugsci/domain-engines/neqsim/runtime",
    e ? { bypassCache: !0 } : void 0
  );
}
function Xi() {
  return de("/ugsci/domain-engines/neqsim/install", {
    method: "POST"
  });
}
function Yi(e) {
  return de(
    `/ugsci/domain-engines/neqsim/install/${encodeURIComponent(e)}`,
    { bypassCache: !0 }
  );
}
async function Qi(e, t = !1) {
  const n = await de("/tools", {
    headers: { "X-Agent-Id": e },
    ...t ? { bypassCache: !0 } : {}
  }) || [];
  return new Map(n.map((r) => [r.name, r]));
}
async function Zi(e, t = !1) {
  const n = /* @__PURE__ */ new Map(), r = {
    headers: { "X-Agent-Id": e },
    ...t ? { bypassCache: !0 } : {}
  };
  let a;
  try {
    a = await de(
      "/mcp",
      r
    ) || [];
  } catch {
    return n;
  }
  for (const l of a) {
    const o = l.key;
    if (!l.enabled) {
      n.set(o, { key: o, enabled: !1, toolCount: 0, error: null });
      continue;
    }
    try {
      const s = await de(
        `/mcp/tools/${encodeURIComponent(o)}`,
        r
      ) || [];
      n.set(o, {
        key: o,
        enabled: !0,
        toolCount: s.filter((i) => i.enabled).length,
        error: null
      });
    } catch (s) {
      n.set(o, {
        key: o,
        enabled: !0,
        toolCount: 0,
        error: s instanceof Error ? s.message : "Tool query failed"
      });
    }
  }
  return n;
}
function na(e) {
  return e ? e.overall === "available" ? "available" : e.overall === "unavailable" ? "unavailable" : "unknown" : "unknown";
}
function ra(e) {
  return e ? e.enabled ? e.error ? "error" : e.toolCount > 0 ? "available" : "error" : "unconfigured" : "unavailable";
}
function es(e, t = null, n = /* @__PURE__ */ new Map()) {
  const r = e.engine, a = e.dependency_status;
  let l, o, s;
  if (r.provider.kind === "driver")
    a.overall === "unavailable" ? l = "needs_install" : l = ra(t), o = (t == null ? void 0 : t.toolCount) ?? 0, s = (t == null ? void 0 : t.key) ?? r.provider.id;
  else if (r.source === "builtin") {
    const i = na(a), c = r.operations.flatMap((m) => m.tool_names), d = c.filter((m) => n.has(m)), u = d.filter(
      (m) => {
        var p;
        return (p = n.get(m)) == null ? void 0 : p.enabled;
      }
    );
    i !== "available" ? l = i : d.length !== c.length ? l = "error" : u.length === 0 ? l = "unconfigured" : l = "available", o = u.length, s = null;
  } else r.source === "mcp" ? (l = ra(t), o = (t == null ? void 0 : t.toolCount) ?? 0, s = (t == null ? void 0 : t.key) ?? r.provider.id) : (l = na(a), o = 0, s = null);
  return {
    definition: r,
    dependencyStatus: a,
    checkedAt: e.checked_at,
    effectiveStatus: l,
    discoveredToolCount: o,
    mcpProviderKey: s
  };
}
function ts(e) {
  const t = /* @__PURE__ */ new Map();
  for (const n of e) {
    const r = n.definition.domain;
    t.has(r) || t.set(r, []), t.get(r).push(n);
  }
  return t;
}
const Hn = {
  available: "可用",
  unavailable: "不可用",
  unknown: "未知",
  needs_install: "待安装",
  unconfigured: "未配置",
  error: "错误"
}, Wn = {
  available: "success",
  unavailable: "error",
  unknown: "default",
  needs_install: "warning",
  unconfigured: "warning",
  error: "error"
}, ns = {
  geology_well_logging: "📡",
  production_engineering: "⚙️",
  fluid_thermodynamics: "🧪",
  scientific_computing: "🧮",
  data_modeling: "📊"
}, rs = {
  builtin: "内置",
  mcp: "MCP",
  library: "计算库"
}, as = {
  deterministic: "确定性",
  stochastic: "随机/概率",
  external: "外部 Provider",
  visualization: "可视化"
}, ls = {
  deterministic: "green",
  stochastic: "purple",
  external: "blue",
  visualization: "cyan"
};
function os({
  view: e,
  onClick: t
}) {
  const n = k().React, { Card: r, Tag: a, Typography: l } = k().antd, { Text: o } = l, s = e.definition, i = ns[s.domain] || "📦", c = e.effectiveStatus, d = s.operations.length, u = e.discoveredToolCount;
  return n.createElement(
    r,
    {
      hoverable: !0,
      onClick: t,
      size: "small",
      style: {
        cursor: "pointer",
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
        n.createElement("span", { style: { fontSize: 20 } }, i),
        n.createElement(
          "div",
          null,
          n.createElement(
            o,
            { strong: !0, style: { fontSize: 14 } },
            s.name
          ),
          n.createElement("br"),
          n.createElement(
            o,
            { type: "secondary", style: { fontSize: 11 } },
            s.provider.kind === "driver" ? "内置 · MCP" : rs[s.source] || s.source
          )
        )
      ),
      n.createElement(
        a,
        { color: Wn[c] || "default", style: { fontSize: 11 } },
        Hn[c] || c
      )
    ),
    n.createElement(
      "div",
      { style: { flex: 1, minHeight: 32 } },
      n.createElement(
        o,
        { type: "secondary", style: { fontSize: 12 } },
        s.description
      )
    ),
    n.createElement(
      "div",
      {
        style: {
          marginTop: 8,
          display: "flex",
          gap: 4,
          flexWrap: "wrap"
        }
      },
      n.createElement(
        a,
        { style: { fontSize: 11 } },
        `${d} 操作`
      ),
      n.createElement(
        a,
        {
          color: ls[s.execution_class] || "default",
          style: { fontSize: 11 }
        },
        as[s.execution_class] || s.execution_class
      ),
      u > 0 ? n.createElement(
        a,
        { color: "blue", style: { fontSize: 11 } },
        `${u} 工具`
      ) : null,
      ...(s.tags || []).map(
        (m) => n.createElement(
          a,
          { key: m, color: "cyan", style: { fontSize: 10 } },
          m
        )
      )
    )
  );
}
function is({
  view: e,
  open: t,
  onClose: n,
  onNavigateToMcp: r,
  onNavigateToTools: a,
  onNavigateToSkills: l,
  onInstallNeqsim: o,
  neqsimInstallState: s
}) {
  const i = k().React, { Drawer: c, Descriptions: d, Tag: u, Typography: m, Button: p, Space: w, Divider: h } = k().antd, { Text: y, Paragraph: f } = m;
  if (!e) return null;
  const E = e.definition, v = e.dependencyStatus;
  return i.createElement(
    c,
    {
      title: i.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 8 } },
        i.createElement("span", null, E.name),
        i.createElement(
          u,
          {
            color: Wn[e.effectiveStatus] || "default",
            style: { fontSize: 11 }
          },
          Hn[e.effectiveStatus] || e.effectiveStatus
        )
      ),
      open: t,
      onClose: n,
      width: 560,
      rootClassName: "ugsci-domain-engine-detail-drawer"
    },
    // Overview
    i.createElement(
      d,
      { column: 1, bordered: !0, size: "small" },
      i.createElement(
        d.Item,
        { label: "领域" },
        E.domain
      ),
      i.createElement(
        d.Item,
        { label: "来源" },
        E.provider.kind === "driver" ? "内置能力 · MCP Driver" : E.source === "builtin" ? "内置工具" : E.source === "mcp" ? "MCP 服务" : "科学计算库 / 技能"
      ),
      i.createElement(
        d.Item,
        { label: "实现" },
        `${E.provider.kind}:${E.provider.id}`
      ),
      i.createElement(
        d.Item,
        { label: "计算类别" },
        E.execution_class === "deterministic" ? "确定性计算" : E.execution_class === "stochastic" ? "随机/概率计算" : E.execution_class === "external" ? "外部 Provider" : "可视化"
      ),
      i.createElement(
        d.Item,
        { label: "内核版本" },
        E.engine_version
      ),
      i.createElement(
        d.Item,
        { label: "描述" },
        E.description
      ),
      i.createElement(
        d.Item,
        { label: "检测时间" },
        e.checkedAt
      )
    ),
    // Operations
    i.createElement(
      "div",
      { style: { marginTop: 16, marginBottom: 8 } },
      i.createElement(y, { strong: !0 }, "领域操作")
    ),
    ...E.operations.map(
      (g) => i.createElement(
        "div",
        {
          key: g.id,
          style: {
            padding: "8px 12px",
            marginBottom: 4,
            background: "#fafafa",
            borderRadius: 6
          }
        },
        i.createElement(
          "div",
          null,
          i.createElement(y, { strong: !0, style: { fontSize: 13 } }, g.name),
          i.createElement(
            y,
            { type: "secondary", style: { fontSize: 11, marginLeft: 8 } },
            g.id
          )
        ),
        i.createElement(
          y,
          { type: "secondary", style: { fontSize: 12 } },
          g.description
        ),
        g.tool_names.length > 0 ? i.createElement(
          "div",
          { style: { marginTop: 4, display: "flex", gap: 4, flexWrap: "wrap" } },
          ...g.tool_names.map(
            (S) => i.createElement(
              u,
              { key: S, color: "blue", style: { fontSize: 10 } },
              S
            )
          )
        ) : null
      )
    ),
    // Dependencies
    i.createElement(h, null),
    i.createElement(y, { strong: !0 }, "实现与依赖"),
    v && v.dependencies.length > 0 ? i.createElement(
      "div",
      { style: { marginTop: 8 } },
      ...v.dependencies.map(
        (g) => i.createElement(
          "div",
          {
            key: g.name,
            style: {
              padding: "8px 0",
              borderBottom: "1px solid var(--ant-color-border-secondary, #f0f0f0)"
            }
          },
          i.createElement(
            "div",
            {
              style: {
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }
            },
            i.createElement(y, { style: { fontSize: 13 } }, g.name),
            i.createElement(
              u,
              {
                color: Wn[g.status] || "default",
                style: { fontSize: 11 }
              },
              Hn[g.status] || g.status
            )
          ),
          g.status !== "available" && g.reason ? i.createElement(
            y,
            { type: "secondary", style: { display: "block", fontSize: 12, marginTop: 4 } },
            g.reason
          ) : null,
          g.status !== "available" && g.install_hint ? i.createElement(
            y,
            { style: { display: "block", fontSize: 12, marginTop: 4 } },
            `安装：${g.install_hint}`
          ) : null,
          g.status !== "available" && g.enable_hint ? i.createElement(
            y,
            { style: { display: "block", fontSize: 12, marginTop: 2 } },
            `启用：${g.enable_hint}`
          ) : null
        )
      )
    ) : i.createElement(
      f,
      { type: "secondary", style: { fontSize: 12 } },
      "无外部依赖"
    ),
    // Actions
    i.createElement(h, null),
    i.createElement(y, { strong: !0 }, "问题处理"),
    i.createElement(
      "div",
      { style: { marginTop: 8, display: "flex", gap: 8, flexWrap: "wrap" } },
      E.id === "neqsim" && e.effectiveStatus === "needs_install" ? i.createElement(
        p,
        {
          size: "small",
          type: "primary",
          loading: (s == null ? void 0 : s.status) === "queued" || (s == null ? void 0 : s.status) === "running",
          onClick: o
        },
        (s == null ? void 0 : s.status) === "running" ? `${s.message} (${s.progress}%)` : "安装 NeqSim 运行环境"
      ) : null,
      E.provider.kind === "driver" ? i.createElement(
        p,
        { size: "small", onClick: r },
        "查看内置 MCP Driver"
      ) : E.source === "library" ? i.createElement(
        p,
        { size: "small", onClick: l },
        "查看相关技能"
      ) : i.createElement(
        p,
        { size: "small", onClick: () => a("builtin") },
        "查看内置工具"
      )
    ),
    E.id === "neqsim" && (s == null ? void 0 : s.status) === "failed" ? i.createElement(
      f,
      { type: "danger", style: { marginTop: 8, fontSize: 12 } },
      s.error || "安装失败"
    ) : null,
    E.id === "neqsim" && (s != null && s.warning) ? i.createElement(
      f,
      { type: "warning", style: { marginTop: 8, fontSize: 12 } },
      s.warning
    ) : null
  );
}
const ss = {
  geology_well_logging: "测井地质",
  production_engineering: "采油工程",
  fluid_thermodynamics: "流体热力学",
  scientific_computing: "科学计算",
  data_modeling: "数据建模"
};
function cs(e) {
  return e instanceof Error ? /Install task not found|HTTP 404/i.test(e.message) : !1;
}
function ds({
  onNavigateToMcp: e,
  onNavigateToTools: t,
  onNavigateToSkills: n
} = {}) {
  var ie, ge;
  const r = k().React, { useState: a, useEffect: l, useCallback: o, useMemo: s, useRef: i } = r, {
    Spin: c,
    Empty: d,
    Button: u,
    message: m,
    Row: p,
    Col: w,
    Input: h,
    Drawer: y,
    Typography: f
  } = k().antd, { ReloadOutlined: E, SearchOutlined: v } = k().antdIcons || {}, { Text: g } = f, S = (ge = (ie = k()).useSelectedAgent) == null ? void 0 : ge.call(ie), z = (S == null ? void 0 : S.id) || "default", [V, I] = a([]), [$, J] = a(!0), [F, B] = a(""), [C, x] = a(!1), [_, T] = a(null), [W, N] = a(null), G = i(z);
  G.current = z;
  const U = i(_);
  U.current = _;
  const A = i(0);
  l(() => () => {
    A.current += 1;
  }, []);
  const ee = o(
    async (X = !1, ce = !1) => {
      var Be, ve;
      ce || J(!0);
      const ne = ce && typeof window < "u" ? {
        x: window.scrollX,
        y: window.scrollY,
        drawerBody: typeof document < "u" ? document.querySelector(
          ".ugsci-domain-engine-detail-drawer .ant-drawer-body"
        ) : null,
        drawerTop: typeof document < "u" && ((Be = document.querySelector(
          ".ugsci-domain-engine-detail-drawer .ant-drawer-body"
        )) == null ? void 0 : Be.scrollTop) || 0
      } : null, xe = () => {
        if (!ne || typeof window > "u") return;
        const se = () => {
          var Se;
          window.scrollTo(ne.x, ne.y), (Se = ne.drawerBody) != null && Se.isConnected && (ne.drawerBody.scrollTop = ne.drawerTop);
        };
        typeof window.requestAnimationFrame == "function" ? window.requestAnimationFrame(se) : se();
      }, we = G.current;
      try {
        const [se, Se, Ie] = await Promise.all([
          Ji(X),
          Zi(we, X),
          Qi(we, X)
        ]);
        if (we !== G.current) return;
        const j = [];
        for (const le of se)
          try {
            let ye = null;
            if (le.engine.provider.kind === "driver") {
              const O = le.engine.provider.id;
              ye = Se.get(O) || null;
            }
            j.push(es(le, ye, Ie));
          } catch {
          }
        I(j);
        const P = (ve = U.current) == null ? void 0 : ve.definition.id;
        if (P) {
          const le = j.find(
            (ye) => ye.definition.id === P
          );
          le && (U.current = le, T(le));
        }
        xe();
      } catch (se) {
        const Se = se instanceof Error ? se.message : "加载领域引擎失败";
        m.error(Se), ce || I([]);
      } finally {
        ce || J(!1);
      }
    },
    []
  );
  l(() => {
    ee();
  }, [z, ee]);
  const ae = s(() => {
    if (!F.trim()) return V;
    const X = F.toLowerCase();
    return V.filter(
      (ce) => ce.definition.name.toLowerCase().includes(X) || ce.definition.domain.toLowerCase().includes(X) || ce.definition.description.toLowerCase().includes(X) || ce.definition.tags.some((ne) => ne.toLowerCase().includes(X))
    );
  }, [V, F]), D = s(
    () => ts(ae),
    [ae]
  ), M = o(() => {
    ee(!0);
  }, [ee]), oe = o((X) => {
    U.current = X, T(X), x(!0);
  }, []), te = o(() => {
    x(!1), e == null || e();
  }, [e]), K = o(
    (X) => {
      x(!1), t == null || t(X);
    },
    [t]
  ), ue = o(() => {
    x(!1), n == null || n();
  }, [n]), L = o(async () => {
    const X = ++A.current, ce = () => X === A.current;
    try {
      let ne = await Xi();
      if (!ce()) return;
      for (N(ne); ne.status === "queued" || ne.status === "running"; ) {
        if (await new Promise((xe) => setTimeout(xe, 1e3)), !ce()) return;
        try {
          ne = await Yi(ne.id);
        } catch (xe) {
          if (!cs(xe)) throw xe;
          const we = await Ki(!0);
          if (!ce()) return;
          we.ready ? ne = {
            ...ne,
            status: "completed",
            progress: 100,
            message: "后端重启后已恢复 NeqSim 运行环境状态",
            error: "",
            runtime: we,
            recovered: !0
          } : ne = {
            ...ne,
            status: "failed",
            message: "安装进程因后端重启中断",
            error: "后端重启后未发现完整的 NeqSim 运行环境，请重新安装",
            runtime: we,
            recovered: !0
          };
        }
        if (!ce()) return;
        N(ne);
      }
      if (!ce()) return;
      ne.status === "completed" ? (ne.warning ? m.warning(ne.warning) : m.success("NeqSim 运行环境已安装并启用"), await ee(!0, !0)) : m.error(ne.error || "NeqSim 安装失败");
    } catch (ne) {
      if (!ce()) return;
      m.error(ne instanceof Error ? ne.message : "NeqSim 安装失败");
    }
  }, [ee]);
  return r.createElement(
    "div",
    null,
    // Action bar
    r.createElement(
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
      r.createElement(h, {
        placeholder: "搜索领域引擎...",
        prefix: v ? r.createElement(v) : void 0,
        value: F,
        onChange: (X) => B(X.target.value),
        allowClear: !0,
        style: { maxWidth: 280 }
      }),
      r.createElement(
        u,
        {
          icon: E ? r.createElement(E) : void 0,
          onClick: M,
          loading: $
        },
        "刷新"
      )
    ),
    // Content
    $ ? r.createElement(
      "div",
      { style: { textAlign: "center", padding: 60 } },
      r.createElement(c, {
        size: "large",
        tip: "正在加载领域引擎..."
      })
    ) : ae.length === 0 ? r.createElement(d, {
      description: F ? "无匹配引擎" : "暂无领域引擎"
    }) : r.createElement(
      "div",
      null,
      ...Array.from(D.entries()).map(
        ([X, ce]) => r.createElement(
          "div",
          { key: X, style: { marginBottom: 20 } },
          r.createElement(
            g,
            {
              strong: !0,
              style: {
                fontSize: 14,
                display: "block",
                marginBottom: 8
              }
            },
            ss[X] || X
          ),
          r.createElement(
            p,
            { gutter: [12, 12], align: "stretch" },
            ...ce.map(
              (ne) => r.createElement(
                w,
                {
                  key: ne.definition.id,
                  xs: 24,
                  sm: 12,
                  md: 8,
                  lg: 6,
                  style: { display: "flex" }
                },
                r.createElement(os, {
                  view: ne,
                  onClick: () => oe(ne)
                })
              )
            )
          )
        )
      )
    ),
    // Detail drawer
    r.createElement(is, {
      view: _,
      open: C,
      onClose: () => x(!1),
      onNavigateToMcp: te,
      onNavigateToTools: K,
      onNavigateToSkills: ue,
      onInstallNeqsim: L,
      neqsimInstallState: W
    })
  );
}
const us = Ni, cl = /* @__PURE__ */ new Set(["tools", "engines", "skills"]);
function ms(e) {
  try {
    const t = new URLSearchParams(window.location.search).get("tab");
    return t && cl.has(t) ? t : e;
  } catch {
    return e;
  }
}
function aa(e) {
  try {
    const t = new URL(window.location.href);
    t.searchParams.set("tab", e), window.history.replaceState(
      {},
      "",
      `${t.pathname}${t.search}${t.hash}`
    );
  } catch {
  }
}
function Vn({ page: e }) {
  const t = k().React, { useEffect: n, useState: r } = t, { Alert: a, Spin: l } = k().antd, [o, s] = r(null), [i, c] = r("");
  if (n(() => {
    let u = !0;
    const m = k().loadBuiltinPage;
    return s(null), m ? (c(""), m(e).then((p) => {
      u && s(() => p);
    }).catch((p) => {
      u && c(
        p instanceof Error ? p.message : "加载原生管理页面失败"
      );
    }), () => {
      u = !1;
    }) : (c("当前 QwenPaw 版本不支持原生页面嵌入"), () => {
      u = !1;
    });
  }, [e]), i)
    return t.createElement(a, {
      type: "error",
      showIcon: !0,
      message: "原生管理功能加载失败",
      description: i
    });
  if (!o)
    return t.createElement(
      "div",
      { style: { padding: 56, textAlign: "center" } },
      t.createElement(
        l,
        { tip: "正在加载原生管理功能..." },
        t.createElement("div", { style: { minHeight: 24 } })
      )
    );
  const d = e === "mcp" ? {
    title: "UGSci MCP",
    description: "连接外部工具、数据服务与计算能力，扩展当前专家的可调用范围",
    managedTitle: "已接入服务",
    managedDescription: "启用后可由当前专家调用，并可按工具配置访问权限",
    create: "接入 MCP 服务"
  } : void 0;
  return t.createElement(o, { embedded: !0, embeddedLabels: d });
}
function ps({
  activeSubTab: e,
  onSubTabChange: t
}) {
  const n = k().React, { Tabs: r } = k().antd;
  return n.createElement(r, {
    activeKey: e,
    onChange: t,
    items: [
      {
        key: "mcp",
        label: "MCP 接入",
        children: n.createElement(Vn, { page: "mcp" })
      },
      {
        key: "builtin",
        label: "平台内置",
        children: n.createElement(Vn, { page: "tools" })
      }
    ]
  });
}
function fs({
  onNavigateToMcp: e,
  onNavigateToTools: t,
  onNavigateToSkills: n
} = {}) {
  const r = k().React, { Tabs: a } = k().antd;
  return r.createElement(a, {
    defaultActiveKey: "simulation",
    items: [
      {
        key: "simulation",
        label: "仿真软件",
        children: r.createElement(qi)
      },
      {
        key: "domain",
        label: "领域计算",
        children: r.createElement(
          ds,
          {
            onNavigateToMcp: e,
            onNavigateToTools: t,
            onNavigateToSkills: n
          }
        )
      },
      {
        key: "runtime",
        label: "运行服务",
        children: r.createElement(Vn, { page: "acp" })
      }
    ]
  });
}
function dl({
  initialTab: e = "engines"
} = {}) {
  var f, E;
  const t = k().React, { useEffect: n, useState: r } = t, { Tabs: a, Tag: l } = k().antd, { RocketOutlined: o, ToolOutlined: s, ThunderboltOutlined: i } = k().antdIcons || {}, c = (E = (f = k()).useSelectedAgent) == null ? void 0 : E.call(f), d = (c == null ? void 0 : c.id) || "default", [u, m] = r(
    () => ms(e)
  ), [p, w] = r("mcp");
  n(() => {
    try {
      const v = new URLSearchParams(window.location.search).get("tab");
      v && !cl.has(v) && aa(u);
    } catch {
    }
  }, [u]);
  const h = (v) => {
    m(v), aa(v);
  }, y = (v, g) => t.createElement(
    "span",
    { style: { display: "inline-flex", alignItems: "center", gap: 6 } },
    g ? t.createElement(g, { style: { fontSize: 14 } }) : null,
    v
  );
  return t.createElement(
    "div",
    { style: { padding: 24 } },
    t.createElement(vn, {
      title: "工具·技能",
      subtitle: "管理当前专家可调用的引擎、工具、运行服务与专业技能",
      extra: t.createElement(
        l,
        { color: "blue" },
        `当前专家：${d}`
      )
    }),
    t.createElement(a, {
      activeKey: u,
      onChange: (v) => h(v),
      items: [
        {
          key: "engines",
          label: y("引擎", o),
          children: t.createElement(
            fs,
            {
              onNavigateToMcp: () => {
                w("mcp"), h("tools");
              },
              onNavigateToTools: (v) => {
                w(v || "mcp"), h("tools");
              },
              onNavigateToSkills: () => h("skills")
            }
          )
        },
        {
          key: "tools",
          label: y("工具", s),
          children: t.createElement(ps, {
            activeSubTab: p,
            onSubTabChange: w
          })
        },
        {
          key: "skills",
          label: y("技能", i),
          children: t.createElement(us, {
            embedded: !0
          })
        }
      ]
    })
  );
}
const ul = dl;
function gs() {
  return k().React.createElement(ul, {
    initialTab: "tools"
  });
}
function ys() {
  return k().React.createElement(ul, {
    initialTab: "skills"
  });
}
const la = {
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
function hs(e) {
  if (!e.env) return !1;
  const t = Object.entries(e.env);
  return t.length === 0 ? !1 : t.some(([, n]) => typeof n == "string" && n.length > 0);
}
const sn = "ugsci.market.githubSources", oa = "https://github.com/anthropics/skills/tree/main/skills", ml = "https://ugsci-awesome-tools.oss-cn-beijing.aliyuncs.com", Es = `${ml}/skills`;
function bs(e) {
  const t = e.replace(/^\/+/, "");
  return En(`/plugins/oss-proxy?path=${encodeURIComponent(t)}`);
}
function un(e) {
  const t = e.replace(/^\/+/, "");
  return tt(`/plugins/oss-proxy?path=${encodeURIComponent(t)}`);
}
async function dr(e) {
  const t = e.replace(/^\/+/, ""), n = await un(t);
  if (!n.ok)
    throw new Error(`OSS fetch failed (${n.status}): ${t}`);
  return await n.json();
}
function St(e) {
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
function vs(e) {
  var a, l;
  const t = {};
  if (e.env && e.env.length > 0)
    for (const o of e.env)
      t[o] = `your-${o.toLowerCase().replace(/_/g, "-")}`;
  let n = "🔌";
  const r = (e.icon || "").toLowerCase();
  return r.includes("folder") ? n = "📁" : r.includes("git") ? n = "🌿" : r.includes("github") ? n = "🐙" : r.includes("database") || r.includes("postgres") || r.includes("sqlite") ? n = "🗄️" : r.includes("search") || r.includes("brave") ? n = "🔍" : r.includes("browser") || r.includes("puppeteer") ? n = "🎭" : r.includes("memory") || r.includes("brain") ? n = "🧠" : r.includes("file") || r.includes("fetch") ? n = "🌐" : r.includes("slack") ? n = "💬" : r.includes("google") ? n = "📁" : r.includes("notion") ? n = "📝" : r.includes("jupyter") ? n = "📊" : r.includes("science") || r.includes("flask") ? n = "🔬" : r.includes("book") || r.includes("arxiv") ? n = "📚" : r.includes("patent") && (n = "📜"), {
    id: e.id,
    name: e.name,
    emoji: n,
    iconUrl: e.icon_url ? bs(e.icon_url) : void 0,
    category: e.category ? St(e.category) : "",
    description: e.description,
    transport: e.transport || "stdio",
    command: ((a = e.config) == null ? void 0 : a.command) || "",
    args: ((l = e.config) == null ? void 0 : l.args) || [],
    env: Object.keys(t).length > 0 ? t : void 0
  };
}
const pl = "ugsci.market.mcpSources", fl = "ugsci.market.expertSources";
function gl(e, t) {
  try {
    const n = localStorage.getItem(e);
    if (!n) return [];
    const r = JSON.parse(n);
    return Array.isArray(r) ? r.filter(
      (a) => a && typeof a.id == "string" && typeof a.label == "string" && typeof a.url == "string"
    ).map((a) => ({
      id: a.id,
      label: a.label,
      url: a.url,
      enabled: a.enabled !== !1,
      type: t
    })) : [];
  } catch {
    return [];
  }
}
function yl(e, t) {
  try {
    localStorage.setItem(e, JSON.stringify(t));
  } catch {
  }
}
function ws() {
  return gl(pl, "mcp");
}
function Zt(e) {
  yl(pl, e);
}
function Ss() {
  return gl(fl, "expert");
}
function en(e) {
  yl(fl, e);
}
function hl(e) {
  try {
    const t = new URL(e.trim()), n = t.hostname.toLowerCase();
    let r;
    if (n === "github.com" || n === "www.github.com")
      r = "github";
    else if (n === "gitee.com" || n === "www.gitee.com")
      r = "gitee";
    else
      return null;
    const a = t.pathname.split("/").filter((c) => c.length > 0);
    if (a.length < 2) return null;
    const l = decodeURIComponent(a[0]), o = decodeURIComponent(a[1]);
    let s = "main", i = "";
    return a.length >= 4 && (a[2] === "tree" || a[2] === "blob") ? (s = decodeURIComponent(a[3]), a.length > 4 && (i = a.slice(4).map(decodeURIComponent).join("/"))) : a.length > 2 && (i = a.slice(2).map(decodeURIComponent).join("/")), i = i.replace(/\/+$/, "").replace(/^\/+/, ""), {
      owner: l,
      repo: o,
      ref: s || "main",
      skillsPath: i,
      label: `${l}/${o}`,
      platform: r
    };
  } catch {
    return null;
  }
}
function El(e, t, n, r = "github") {
  return r === "oss" ? `oss:${e}/${n || "/"}` : `${r}:${e}/${t}:${n || "/"}`;
}
function xs(e) {
  try {
    const t = new URL(e.trim()), n = t.hostname.toLowerCase(), r = n.match(
      /^([a-z0-9][a-z0-9-]{1,61}[a-z0-9])\.oss-([a-z0-9-]+)\.aliyuncs\.com$/
    );
    if (!r) return null;
    const a = r[1], l = `${t.protocol}//${n}`, o = decodeURIComponent(t.pathname).replace(/^\/+/, "").replace(/\/+$/, "");
    return o ? {
      endpoint: l,
      prefix: o,
      label: "UGSci",
      platform: "oss"
    } : null;
  } catch {
    return null;
  }
}
function ks() {
  try {
    const e = localStorage.getItem(sn);
    if (!e) {
      const r = [], a = hl(oa);
      return a && r.push({
        id: El(
          a.owner,
          a.repo,
          a.skillsPath,
          a.platform
        ),
        url: oa,
        label: a.label,
        owner: a.owner,
        repo: a.repo,
        ref: a.ref,
        skillsPath: a.skillsPath,
        enabled: !1,
        platform: a.platform
      }), localStorage.setItem(sn, JSON.stringify(r)), r;
    }
    const t = JSON.parse(e);
    if (!Array.isArray(t)) return [];
    const n = t.filter(
      (r) => r && typeof r.id == "string" && (typeof r.owner == "string" || r.platform === "oss") && !(r.platform === "oss" && r.url === Es)
    ).map((r) => ({
      ...r,
      platform: r.platform || "github",
      owner: r.owner || "",
      repo: r.repo || "",
      ref: r.ref || "",
      skillsPath: r.skillsPath || ""
    }));
    return n.length !== t.length && localStorage.setItem(
      sn,
      JSON.stringify(n)
    ), n;
  } catch {
    return [];
  }
}
function tn(e) {
  try {
    localStorage.setItem(
      sn,
      JSON.stringify(e)
    );
  } catch {
  }
}
function Cs(e) {
  const t = e.match(/^---\s*\n([\s\S]*?)\n---/);
  if (!t) return {};
  const n = t[1], r = {}, a = n.split(`
`);
  let l = "";
  for (const o of a) {
    const s = o.match(/^(\w[\w-]*)\s*:\s*(.*)$/);
    if (s) {
      l = s[1];
      let i = s[2].trim();
      (i.startsWith('"') && i.endsWith('"') || i.startsWith("'") && i.endsWith("'")) && (i = i.slice(1, -1)), l === "name" ? r.name = i : l === "description" ? r.description = i : l === "version" ? r.version = i : l === "author" && (r.author = i);
    }
  }
  return r;
}
async function Ts(e) {
  const t = e.platform === "gitee", n = e.skillsPath ? encodeURIComponent(e.skillsPath).replace(/%2F/g, "/") : "", r = t ? `https://gitee.com/api/v5/repos/${e.owner}/${e.repo}/contents/${n}?ref=${encodeURIComponent(e.ref)}` : `https://api.github.com/repos/${e.owner}/${e.repo}/contents/${n}?ref=${encodeURIComponent(e.ref)}`, a = {
    Accept: t ? "application/json" : "application/vnd.github+json"
  };
  t && e.accessToken && (a.Authorization = `token ${e.accessToken}`);
  const l = await fetch(r, {
    headers: a
  });
  if (!l.ok)
    throw new Error(
      `${t ? "Gitee" : "GitHub"} API ${l.status}: ${e.label} (${e.skillsPath || "/"})`
    );
  const o = await l.json();
  if (!Array.isArray(o)) return [];
  const s = o.filter(
    (c) => c.type === "dir" && c.name
  );
  return await Promise.all(
    s.map(async (c) => {
      const d = e.skillsPath ? e.skillsPath + "/" : "", u = t ? `https://gitee.com/${e.owner}/${e.repo}/raw/${e.ref}/${d}${c.name}/SKILL.md` : `https://raw.githubusercontent.com/${e.owner}/${e.repo}/${e.ref}/${d}${c.name}/SKILL.md`, m = t ? `https://gitee.com/${e.owner}/${e.repo}/tree/${e.ref}/${d}${c.name}` : `https://github.com/${e.owner}/${e.repo}/tree/${e.ref}/${d}${c.name}`, p = {
        sourceId: e.id,
        sourceLabel: e.label,
        name: c.name,
        description: "",
        source_url: m,
        html_url: m,
        version: null,
        author: null
      };
      try {
        const w = {};
        t && e.accessToken && (w.Authorization = `token ${e.accessToken}`);
        const h = await fetch(u, {
          headers: w
        });
        if (!h.ok) return p;
        const y = await h.text(), f = Cs(y);
        return {
          ...p,
          name: f.name || c.name,
          description: f.description || "",
          version: f.version || null,
          author: f.author || null
        };
      } catch {
        return p;
      }
    })
  );
}
async function _s(e) {
  const t = xs(e.url);
  if (!t)
    throw new Error(`Invalid OSS URL: ${e.url}`);
  const { endpoint: n, prefix: r } = t, a = r.split("/").map(encodeURIComponent).join("/"), l = await un(
    `${a}/manifest.json`
  );
  if (!l.ok)
    throw new Error(
      `无法获取技能列表: manifest.json (${l.status})`
    );
  const o = await l.json(), s = [];
  if (o && o.tag_groups && typeof o.tag_groups == "object")
    for (const [d, u] of Object.entries(o.tag_groups))
      Array.isArray(u) && s.push({
        id: d,
        label: St(d),
        tags: u
      });
  const i = [];
  function c(d, u) {
    for (const m of d) {
      if (m.type === "collection" && Array.isArray(m.children)) {
        c(m.children, m.name);
        continue;
      }
      const p = m.path || m.name || "";
      if (!p) continue;
      const w = p.split("/").map(encodeURIComponent).join("/"), h = `${n}/${a}/${w}`;
      let y = null;
      if (m.metadata) {
        const E = m.metadata.match(/version:\s*"?([\d.]+)"?/);
        E && (y = E[1]);
      }
      const f = u ? `${e.label}/${u}` : e.label;
      i.push({
        sourceId: e.id,
        sourceLabel: e.label,
        sourcePath: f,
        name: m.name || p.split("/").pop() || p,
        description: m.description || "",
        source_url: h,
        html_url: h,
        version: y,
        author: null,
        tag: m.tag || void 0,
        isOfficial: !0
      });
    }
  }
  if (Array.isArray(o) ? c(
    o.map(
      (d) => typeof d == "string" ? { name: d, path: d } : d
    )
  ) : o && Array.isArray(o.skills) && c(o.skills), i.length === 0)
    throw new Error(
      `manifest.json 中未找到技能。请检查 ${e.url}/manifest.json`
    );
  return { skills: i, categories: s };
}
async function Is() {
  const e = await dr("mcp/manifest.json"), t = [], n = {};
  if (e.tag_groups && typeof e.tag_groups == "object")
    for (const [a, l] of Object.entries(e.tag_groups))
      Array.isArray(l) && (n[a] = l, t.push({
        id: a,
        label: St(a),
        tags: l
      }));
  return { servers: (e.servers || []).map((a) => {
    let l = "";
    const o = a.tags || [];
    for (const [s, i] of Object.entries(n))
      if (i.some((c) => o.includes(c))) {
        l = s;
        break;
      }
    return {
      id: a.id || a.name,
      name: a.name || a.id,
      description: a.description || "",
      tags: o,
      transport: a.transport || "stdio",
      config: a.config,
      env: Array.isArray(a.env) ? a.env : void 0,
      source: a.source,
      icon: a.icon,
      icon_url: a.icon_url || a.icon_path || void 0,
      category: l
    };
  }), categories: t };
}
async function As() {
  const e = await dr("skills/manifest.json"), t = [], n = /* @__PURE__ */ new Set();
  function r(a, l) {
    for (const o of a) {
      if ((o == null ? void 0 : o.type) === "collection" && Array.isArray(o.children)) {
        r(o.children, o.name || l);
        continue;
      }
      const s = String((o == null ? void 0 : o.path) || (o == null ? void 0 : o.name) || "").trim();
      if (!s) continue;
      const i = s.split("/").map(encodeURIComponent).join("/"), c = `${ml}/skills/${i}`, d = typeof o.tag == "string" && o.tag.trim() ? o.tag.trim() : void 0;
      d && n.add(d);
      let u = null;
      if (typeof o.metadata == "string") {
        const m = o.metadata.match(/version:\s*"?([\d.]+)"?/);
        m && (u = m[1]);
      }
      t.push({
        sourceId: "oss:ugsci-official",
        sourceLabel: "UGSci",
        sourcePath: l ? `UGSci/${l}` : "UGSci",
        name: o.name || s.split("/").pop() || s,
        description: o.description || "",
        source_url: c,
        html_url: c,
        version: u,
        author: null,
        tag: d,
        isOfficial: !0
      });
    }
  }
  if (Array.isArray(e) ? r(
    e.map(
      (a) => typeof a == "string" ? { name: a, path: a } : a
    )
  ) : e && Array.isArray(e.skills) && r(e.skills), t.length === 0)
    throw new Error("OSS 技能清单中没有可用技能");
  return {
    skills: t,
    categories: Array.from(n).map((a) => ({
      id: a,
      label: a
    }))
  };
}
async function zs() {
  const e = await dr("agents/manifest.json"), t = [], n = {};
  if (e.tag_groups && typeof e.tag_groups == "object")
    for (const [a, l] of Object.entries(e.tag_groups))
      Array.isArray(l) && (n[a] = l, t.push({
        id: a,
        label: St(a),
        tags: l
      }));
  return { agents: (e.agents || []).map((a) => {
    let l = "";
    const o = a.tags || [];
    for (const [s, i] of Object.entries(n))
      if (i.some((c) => o.includes(c))) {
        l = s;
        break;
      }
    return {
      id: a.id || a.name,
      name: a.name || a.id,
      description: a.description || "",
      path: a.path || "",
      tags: o,
      config: a.config,
      instructions: a.instructions,
      skills_manifest: a.skills_manifest,
      drivers: a.drivers,
      category: l
    };
  }), categories: t };
}
async function $s(e) {
  const t = e.filter((o) => o.enabled), n = await Promise.all(
    t.map(async (o) => {
      try {
        if (o.platform === "oss") {
          const { skills: s, categories: i } = await _s(o);
          return { skills: s, categories: i, error: null, label: o.label };
        } else
          return { skills: await Ts(o), categories: [], error: null, label: o.label };
      } catch (s) {
        return {
          skills: [],
          categories: [],
          error: s.message || String(s),
          label: o.label
        };
      }
    })
  ), r = [], a = [], l = [];
  for (const o of n)
    r.push(...o.skills), a.push(...o.categories), o.error && l.push({ label: o.label, message: o.error });
  return { skills: r, errors: l, categories: a };
}
function Ps({
  open: e,
  onClose: t,
  sources: n,
  onChange: r
}) {
  const a = k().React, { useState: l } = a, {
    Modal: o,
    Input: s,
    Button: i,
    List: c,
    Tag: d,
    Switch: u,
    Typography: m,
    Tooltip: p,
    message: w
  } = k().antd, {
    PlusOutlined: h,
    DeleteOutlined: y,
    LinkOutlined: f,
    GithubOutlined: E
  } = k().antdIcons || {}, { Text: v } = m, [g, S] = l(""), [z, V] = l(""), I = () => {
    const B = g.trim();
    if (!B) return;
    const C = hl(B);
    if (!C) {
      w.error("无效的仓库 URL，请输入类似 https://github.com/owner/repo/tree/main/skills 或 https://gitee.com/owner/repo/tree/master/skills 的链接");
      return;
    }
    const x = El(C.owner, C.repo, C.skillsPath, C.platform);
    if (n.some((W) => W.id === x)) {
      w.warning("该源已存在");
      return;
    }
    const _ = {
      id: x,
      url: B,
      label: C.label,
      owner: C.owner,
      repo: C.repo,
      ref: C.ref,
      skillsPath: C.skillsPath,
      enabled: !0,
      platform: C.platform,
      accessToken: z.trim() || void 0
    }, T = [...n, _];
    tn(T), r(T), S(""), V(""), w.success(`已添加源: ${C.label}`);
  }, $ = (B, C) => {
    const x = n.map(
      (_) => _.id === B ? { ..._, enabled: C } : _
    );
    tn(x), r(x);
  }, J = (B, C) => {
    const x = n.map(
      (_) => _.id === B ? { ..._, accessToken: C.trim() || void 0 } : _
    );
    tn(x), r(x);
  }, F = (B) => {
    const C = n.filter((x) => x.id !== B);
    tn(C), r(C), w.success("已移除源");
  };
  return a.createElement(
    o,
    {
      open: e,
      onCancel: t,
      title: a.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 8 } },
        E ? a.createElement(E, { style: { fontSize: 18 } }) : null,
        a.createElement("span", null, "配置技能源")
      ),
      footer: a.createElement(
        i,
        { onClick: t },
        "关闭"
      ),
      width: 640
    },
    a.createElement(
      "div",
      { style: { marginBottom: 16 } },
      a.createElement(
        v,
        { type: "secondary", style: { fontSize: 12, display: "block", marginBottom: 8 } },
        "添加 GitHub 或 Gitee 仓库作为技能源，系统将从该仓库的指定目录获取技能列表。支持格式："
      ),
      a.createElement(
        "div",
        { style: { display: "flex", gap: 8, alignItems: "center" } },
        a.createElement(s, {
          placeholder: "https://github.com/owner/repo/tree/main/skills 或 https://gitee.com/owner/repo/tree/master/skills",
          value: g,
          onChange: (B) => S(B.target.value),
          onPressEnter: I,
          prefix: f ? a.createElement(f) : void 0,
          style: { flex: 1 }
        }),
        a.createElement(
          i,
          {
            type: "primary",
            icon: h ? a.createElement(h) : void 0,
            onClick: I
          },
          "添加"
        )
      ),
      // Gitee token input (shown when URL looks like a Gitee link)
      g.trim() && g.trim().toLowerCase().includes("gitee.com") ? a.createElement(
        "div",
        { style: { marginTop: 8, display: "flex", gap: 8, alignItems: "center" } },
        a.createElement(
          v,
          { type: "secondary", style: { fontSize: 12, whiteSpace: "nowrap" } },
          "Gitee Token:"
        ),
        a.createElement(s.Password, {
          placeholder: "私有仓库请填写 Gitee 私人令牌（可选）",
          value: z,
          onChange: (B) => V(B.target.value),
          style: { flex: 1 }
        })
      ) : null
    ),
    a.createElement(
      "div",
      { style: { marginBottom: 8, display: "flex", alignItems: "center", justifyContent: "space-between" } },
      a.createElement(v, { strong: !0 }, `已配置源 (${n.length})`)
    ),
    a.createElement(c, {
      size: "small",
      bordered: !0,
      dataSource: n,
      renderItem: (B) => a.createElement(
        c.Item,
        {
          actions: [
            a.createElement(
              p,
              { title: B.enabled ? "点击禁用" : "点击启用" },
              a.createElement(u, {
                size: "small",
                checked: B.enabled,
                onChange: (C) => $(B.id, C)
              })
            ),
            a.createElement(
              p,
              { title: "移除此源" },
              a.createElement(
                i,
                {
                  size: "small",
                  type: "text",
                  danger: !0,
                  icon: y ? a.createElement(y) : void 0,
                  onClick: () => F(B.id)
                }
              )
            )
          ]
        },
        a.createElement(
          "div",
          { style: { flex: 1, minWidth: 0 } },
          a.createElement(
            "div",
            { style: { display: "flex", alignItems: "center", gap: 6, marginBottom: 4 } },
            a.createElement(
              d,
              { color: B.platform === "gitee" ? "orange" : B.platform === "oss" ? "green" : "blue", style: { fontSize: 11 } },
              B.platform === "gitee" ? "Gitee" : B.platform === "oss" ? "OSS" : "GitHub"
            ),
            a.createElement(
              d,
              { style: { fontSize: 11 } },
              B.label
            ),
            B.skillsPath ? a.createElement(
              v,
              { type: "secondary", style: { fontSize: 11 } },
              `/${B.skillsPath}`
            ) : null,
            B.platform !== "oss" ? a.createElement(
              v,
              { type: "secondary", style: { fontSize: 11 } },
              `@${B.ref}`
            ) : null
          ),
          a.createElement(
            v,
            {
              type: "secondary",
              style: { fontSize: 11, wordBreak: "break-all" }
            },
            B.url
          ),
          // Gitee token input for existing Gitee sources
          B.platform === "gitee" ? a.createElement(
            "div",
            { style: { marginTop: 6, display: "flex", gap: 6, alignItems: "center" } },
            a.createElement(
              v,
              { type: "secondary", style: { fontSize: 11, whiteSpace: "nowrap" } },
              "Token:"
            ),
            a.createElement(s.Password, {
              size: "small",
              placeholder: "Gitee 私人令牌（可选，用于私有仓库）",
              value: B.accessToken || "",
              onChange: (C) => J(B.id, C.target.value),
              style: { flex: 1 }
            })
          ) : null
        )
      )
    })
  );
}
function ia({
  open: e,
  onClose: t,
  sources: n,
  onChange: r,
  type: a
}) {
  const l = k().React, { useState: o } = l, {
    Modal: s,
    Input: i,
    Button: c,
    List: d,
    Tag: u,
    Switch: m,
    Typography: p,
    Tooltip: w,
    message: h
  } = k().antd, {
    PlusOutlined: y,
    DeleteOutlined: f,
    LinkOutlined: E,
    ApiOutlined: v,
    UserOutlined: g,
    ImportOutlined: S,
    ExportOutlined: z,
    CopyOutlined: V
  } = k().antdIcons || {}, { Text: I } = p, [$, J] = o(""), [F, B] = o(""), [C, x] = o(""), [_, T] = o(!1), W = a === "mcp" ? "MCP" : "专家模板", N = a === "mcp" ? v ? l.createElement(v, { style: { fontSize: 18 } }) : null : g ? l.createElement(g, { style: { fontSize: 18 } }) : null, G = () => {
    const D = $.trim(), M = F.trim();
    if (!D) return;
    const oe = M || D.slice(0, 40), te = `${a}:${D}`;
    if (n.some((L) => L.id === te)) {
      h.warning("该源已存在");
      return;
    }
    const K = {
      id: te,
      label: oe,
      url: D,
      enabled: !0,
      type: a
    }, ue = [...n, K];
    a === "mcp" ? Zt(ue) : en(ue), r(ue), J(""), B(""), h.success(`已添加${W}源: ${oe}`);
  }, U = (D, M) => {
    const oe = n.map(
      (te) => te.id === D ? { ...te, enabled: M } : te
    );
    a === "mcp" ? Zt(oe) : en(oe), r(oe);
  }, A = (D) => {
    const M = n.filter((oe) => oe.id !== D);
    a === "mcp" ? Zt(M) : en(M), r(M), h.success("已移除源");
  }, ee = () => {
    const D = JSON.stringify(
      { type: a, sources: n },
      null,
      2
    );
    try {
      navigator.clipboard.writeText(D), h.success(`${W}源已复制到剪贴板（${n.length} 个源）`);
    } catch {
      const M = document.createElement("textarea");
      M.value = D, document.body.appendChild(M), M.select(), document.execCommand("copy"), document.body.removeChild(M), h.success(`${W}源已复制到剪贴板（${n.length} 个源）`);
    }
  }, ae = () => {
    const D = C.trim();
    if (!D) {
      h.warning("请粘贴 JSON 内容");
      return;
    }
    try {
      const M = JSON.parse(D);
      let oe = [];
      if (Array.isArray(M))
        oe = M;
      else if (M && Array.isArray(M.sources))
        oe = M.sources;
      else if (M && typeof M == "object")
        oe = [M];
      else
        throw new Error("Invalid format");
      const te = oe.filter(
        (ie) => ie && typeof ie.url == "string" && typeof ie.label == "string"
      );
      if (te.length === 0) {
        h.error("未找到有效的源数据");
        return;
      }
      const K = new Set(n.map((ie) => ie.id)), ue = [];
      for (const ie of te) {
        const ge = ie.id || `${a}:${ie.url}`;
        K.has(ge) || ue.push({
          id: ge,
          label: ie.label,
          url: ie.url,
          enabled: ie.enabled !== !1,
          type: a
        });
      }
      if (ue.length === 0) {
        h.info("所有源均已存在，无新增");
        return;
      }
      const L = [...n, ...ue];
      a === "mcp" ? Zt(L) : en(L), r(L), x(""), T(!1), h.success(`成功导入 ${ue.length} 个${W}源`);
    } catch (M) {
      h.error(`JSON 解析失败: ${M.message || "格式错误"}`);
    }
  };
  return l.createElement(
    s,
    {
      open: e,
      onCancel: t,
      title: l.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 8 } },
        N,
        l.createElement("span", null, `配置${W}源`)
      ),
      footer: l.createElement(
        "div",
        { style: { display: "flex", justifyContent: "space-between" } },
        l.createElement(
          "div",
          { style: { display: "flex", gap: 8 } },
          l.createElement(
            c,
            {
              icon: z ? l.createElement(z) : void 0,
              onClick: ee,
              disabled: n.length === 0,
              size: "small"
            },
            "导出到剪贴板"
          ),
          l.createElement(
            c,
            {
              icon: S ? l.createElement(S) : void 0,
              onClick: () => T(!_),
              size: "small"
            },
            _ ? "隐藏导入" : "导入JSON"
          )
        ),
        l.createElement(
          c,
          { onClick: t },
          "关闭"
        )
      ),
      width: 680
    },
    // Description
    l.createElement(
      I,
      { type: "secondary", style: { fontSize: 12, display: "block", marginBottom: 12 } },
      `配置${W}源地址，支持从远程仓库或团队共享的 JSON 导入${W}配置。`
    ),
    // Import section (collapsible)
    _ ? l.createElement(
      "div",
      {
        style: {
          marginBottom: 16,
          padding: 12,
          background: "var(--ant-color-fill-quaternary, #fafafa)",
          borderRadius: 8,
          border: "1px solid #f0f0f0"
        }
      },
      l.createElement(
        I,
        { strong: !0, style: { fontSize: 12, display: "block", marginBottom: 8 } },
        `粘贴${W}源 JSON（支持从导出的剪贴板内容粘贴）`
      ),
      l.createElement(i.TextArea, {
        placeholder: a === "mcp" ? `{
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
        value: C,
        onChange: (D) => x(D.target.value),
        autoSize: { minRows: 4, maxRows: 10 },
        style: { fontFamily: "monospace", fontSize: 12 }
      }),
      l.createElement(
        "div",
        { style: { marginTop: 8, display: "flex", gap: 8 } },
        l.createElement(
          c,
          {
            type: "primary",
            size: "small",
            onClick: ae
          },
          "导入"
        ),
        l.createElement(
          c,
          {
            size: "small",
            onClick: () => x("")
          },
          "清空"
        )
      )
    ) : null,
    // Add new source
    l.createElement(
      "div",
      { style: { marginBottom: 16, display: "flex", gap: 8, alignItems: "center" } },
      l.createElement(i, {
        placeholder: "源名称（可选，如：团队MCP仓库）",
        value: F,
        onChange: (D) => B(D.target.value),
        style: { width: 200 }
      }),
      l.createElement(i, {
        placeholder: a === "mcp" ? "https://raw.githubusercontent.com/team/mcp-registry/main/mcp.json" : "https://raw.githubusercontent.com/team/expert-registry/main/experts.json",
        value: $,
        onChange: (D) => J(D.target.value),
        onPressEnter: G,
        prefix: E ? l.createElement(E) : void 0,
        style: { flex: 1 }
      }),
      l.createElement(
        c,
        {
          type: "primary",
          icon: y ? l.createElement(y) : void 0,
          onClick: G
        },
        "添加"
      )
    ),
    // Source list
    l.createElement(
      "div",
      {
        style: {
          marginBottom: 8,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between"
        }
      },
      l.createElement(
        I,
        { strong: !0 },
        `已配置源 (${n.length})`
      )
    ),
    l.createElement(d, {
      size: "small",
      bordered: !0,
      dataSource: n,
      renderItem: (D) => l.createElement(
        d.Item,
        {
          actions: [
            l.createElement(
              w,
              { title: D.enabled ? "点击禁用" : "点击启用" },
              l.createElement(m, {
                size: "small",
                checked: D.enabled,
                onChange: (M) => U(D.id, M)
              })
            ),
            l.createElement(
              w,
              { title: "移除此源" },
              l.createElement(
                c,
                {
                  size: "small",
                  type: "text",
                  danger: !0,
                  icon: f ? l.createElement(f) : void 0,
                  onClick: () => A(D.id)
                }
              )
            )
          ]
        },
        l.createElement(
          "div",
          { style: { flex: 1, minWidth: 0 } },
          l.createElement(
            "div",
            {
              style: {
                display: "flex",
                alignItems: "center",
                gap: 6,
                marginBottom: 4
              }
            },
            l.createElement(
              u,
              {
                color: a === "mcp" ? "purple" : "blue",
                style: { fontSize: 11 }
              },
              D.label
            ),
            D.enabled ? null : l.createElement(
              u,
              { style: { fontSize: 10 } },
              "已禁用"
            )
          ),
          l.createElement(
            I,
            {
              type: "secondary",
              style: { fontSize: 11, wordBreak: "break-all" }
            },
            D.url
          )
        )
      )
    }),
    // Share hint
    l.createElement(
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
      l.createElement(
        "span",
        null,
        "💡 ",
        "点击「导出到剪贴板」可复制所有源配置，分享给团队成员后粘贴到「导入JSON」即可快速配置。"
      )
    )
  );
}
async function Rs() {
  return de("/market/providers");
}
async function Os(e) {
  return de(
    `/market/categories?lang=${encodeURIComponent(e)}`
  );
}
async function Ms(e, t, n, r, a) {
  return de("/market/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: e,
      provider_pages: t,
      limit: n,
      lang: r,
      category: a || void 0
    })
  });
}
function sa(e) {
  if (!e) return "";
  const t = e.message || String(e);
  try {
    const n = JSON.parse(t);
    if (n.detail) {
      if (typeof n.detail == "string") return n.detail;
      if (n.detail.message) return n.detail.message;
    }
  } catch {
  }
  return t;
}
async function ca(e, t) {
  const n = { bundle_url: e };
  return t && (n.access_token = t), de("/skills/pool/import", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(n)
  });
}
function Ls({ embedded: e = !1 } = {}) {
  const t = k().React, { useState: n, useEffect: r, useCallback: a, useMemo: l, useRef: o } = t, {
    Spin: s,
    Empty: i,
    Input: c,
    Button: d,
    message: u,
    Row: m,
    Col: p,
    Card: w,
    Tag: h,
    Tooltip: y,
    Typography: f,
    Select: E,
    Drawer: v,
    Descriptions: g,
    Tabs: S,
    Badge: z,
    Progress: V,
    Modal: I,
    Alert: $
  } = k().antd, {
    ReloadOutlined: J,
    SearchOutlined: F,
    DownloadOutlined: B,
    AppstoreOutlined: C,
    ShopOutlined: x,
    CheckCircleOutlined: _,
    LoadingOutlined: T,
    UserOutlined: W,
    UserAddOutlined: N,
    SettingOutlined: G,
    GithubOutlined: U,
    ApiOutlined: A
  } = k().antdIcons || {}, { Text: ee, Paragraph: ae, Title: D } = f, [M, oe] = n("skills"), [te, K] = n([]), [ue, L] = n([]), [ie, ge] = n([]), [X, ce] = n(""), [ne, xe] = n(""), [we, Be] = n(!1), [ve, se] = n(!1), [Se, Ie] = n(
    {}
  ), [j, P] = n(null), [le, ye] = n({}), [O, he] = n([]), [Z, pe] = n(""), [be, Re] = n(""), [R, fe] = n(""), [_e, De] = n({}), [Ae, Ye] = n(""), [Ze, Fe] = n(/* @__PURE__ */ new Set()), [Oe, re] = n(null), [ze, Me] = n({}), [Ue, Le] = n([]), [Pe, ke] = n([]), [st, ct] = n([]), [Wt, nt] = n(""), [vr, Vt] = n(!1), [eo, wr] = n(!1), [to, Sr] = n([]), [no, xr] = n(!1), [ro, kr] = n([]), [ao, Cr] = n(!1), [Tr, _r] = n([]), [Ir, Ar] = n([]), [zr, $r] = n(!1), [pt, Pr] = n(""), [Rr, Or] = n([]), [Mr, Lr] = n([]), [Br, Ur] = n(!1), [ft, jr] = n(""), [_n, Nr] = n(!1), [qe, qt] = n(null), [Ct, lo] = n([]), Tt = o(null);
  r(() => {
    Promise.all([
      Rs().catch(() => []),
      Os("zh").catch(() => []),
      wn().catch(() => [])
    ]).then(([b, H, q]) => {
      K(b), L(H), he(q), q.length > 0 && (pe(q[0].id), Ye(q[0].id));
    });
  }, []);
  const Jt = a(async (b) => {
    const H = b ?? ks();
    if (Le(b || H), H.filter((me) => me.enabled).length === 0) {
      ke([]);
      return;
    }
    Vt(!0);
    try {
      const { skills: me, errors: Ce, categories: je } = await $s(H);
      if (ke(me), lo(je), Ce.length > 0) {
        for (const $e of Ce)
          console.warn(`[ugsci] GitHub source '${$e.label}' error: ${$e.message}`);
        u.warning(
          `部分源加载失败: ${Ce.map(($e) => $e.label).join(", ")}`
        );
      }
    } catch (me) {
      u.error(me.message || "加载技能源失败"), ke([]);
    } finally {
      Vt(!1);
    }
  }, []), In = a(async () => {
    var me, Ce, je;
    $r(!0), Ur(!0), Vt(!0);
    const [b, H, q] = await Promise.allSettled([
      Is(),
      zs(),
      As()
    ]);
    if (b.status === "fulfilled" ? (_r(b.value.servers), Ar(b.value.categories)) : (console.warn(`[ugsci] MCP manifest error: ${((me = b.reason) == null ? void 0 : me.message) || b.reason}`), _r([]), Ar([])), $r(!1), H.status === "fulfilled" ? (Or(H.value.agents), Lr(H.value.categories)) : (console.warn(`[ugsci] Agents manifest error: ${((Ce = H.reason) == null ? void 0 : Ce.message) || H.reason}`), Or([]), Lr([])), Ur(!1), q.status === "fulfilled")
      ct(q.value.skills), nt("");
    else {
      const $e = ((je = q.reason) == null ? void 0 : je.message) || String(q.reason);
      console.warn(`[ugsci] Skills manifest error: ${$e}`), ct([]), nt($e);
    }
    Vt(!1);
  }, []);
  r(() => {
    Jt(), In(), Sr(ws()), kr(Ss());
  }, [Jt, In]);
  const Kt = a(
    async (b, H, q) => {
      Be(!0);
      try {
        const me = await Ms(
          b,
          q,
          20,
          "zh",
          H || void 0
        );
        q === void 0 || Object.keys(q).length === 0 ? ge(me.results) : ge(($e) => [...$e, ...me.results]);
        const Ce = Object.values(me.by_provider || {}).some(
          ($e) => $e.has_more
        );
        se(Ce);
        const je = {};
        for (const [$e, rt] of Object.entries(me.by_provider || {}))
          je[$e] = (q[$e] || 1) + 1;
        if (Ie(je), me.errors.length > 0)
          for (const $e of me.errors)
            console.warn(
              `[ugsci] Market provider '${$e.provider}' error: ${$e.message}`
            );
      } catch (me) {
        u.error(me.message || "搜索市场失败"), ge([]);
      } finally {
        Be(!1);
      }
    },
    []
  );
  r(() => (Tt.current && clearTimeout(Tt.current), Tt.current = setTimeout(() => {
    Kt(X, ne, {});
  }, 400), () => {
    Tt.current && clearTimeout(Tt.current);
  }), [X, ne, Kt]);
  const oo = () => {
    Kt(X, ne, Se);
  }, Dr = async (b) => {
    const H = `${b.source}:${b.slug}`;
    try {
      ye((me) => ({ ...me, [H]: "installing" }));
      const q = await ca(b.source_url);
      q.installed && u.success(
        `技能「${q.name || b.name}」已安装到技能池，可在技能中心查看`
      ), ye((me) => {
        const Ce = { ...me };
        return delete Ce[H], Ce;
      });
    } catch (q) {
      u.error(sa(q) || "安装技能失败"), ye((me) => {
        const Ce = { ...me };
        return delete Ce[H], Ce;
      });
    }
  }, io = (b) => {
    window.history.pushState({}, "", b), window.dispatchEvent(new PopStateEvent("popstate"));
  }, so = async (b) => {
    const H = `github:${b.sourceId}:${b.name}`, q = Ue.find((Ce) => Ce.id === b.sourceId), me = (q == null ? void 0 : q.accessToken) || void 0;
    try {
      ye((je) => ({ ...je, [H]: "installing" }));
      const Ce = await ca(b.source_url, me);
      Ce.installed && u.success(
        `技能「${Ce.name || b.name}」已安装到技能池，可在技能中心查看`
      ), ye((je) => {
        const $e = { ...je };
        return delete $e[H], $e;
      });
    } catch (Ce) {
      u.error(sa(Ce) || "安装技能失败"), ye((je) => {
        const $e = { ...je };
        return delete $e[H], $e;
      });
    }
  }, dt = l(() => {
    const b = [], H = /* @__PURE__ */ new Set();
    for (const q of [...st, ...Pe]) {
      const me = q.source_url || `${q.sourceLabel}:${q.name}`;
      H.has(me) || (H.add(me), b.push(q));
    }
    return b;
  }, [st, Pe]), Fr = l(() => {
    const b = [], H = /* @__PURE__ */ new Set();
    if (Ct.length > 0)
      for (const q of Ct)
        H.has(q.id) || (H.add(q.id), b.push(q));
    for (const q of dt)
      q.tag && !H.has(q.tag) && (H.add(q.tag), b.push({ id: q.tag, label: q.tag }));
    for (const q of dt)
      !q.isOfficial && q.sourceLabel && !H.has(q.sourceLabel) && (H.add(q.sourceLabel), b.push({ id: q.sourceLabel, label: q.sourceLabel }));
    return b;
  }, [dt, Ct]), An = l(() => {
    let b = dt;
    if (ne) {
      const H = Ct.find((q) => q.id === ne);
      H && H.tags ? b = b.filter(
        (q) => q.tag && H.tags.includes(q.tag) || q.sourceLabel === ne
      ) : b = b.filter(
        (q) => q.tag === ne || q.sourceLabel === ne
      );
    }
    if (X.trim()) {
      const H = X.toLowerCase();
      b = b.filter(
        (q) => {
          var me;
          return q.name.toLowerCase().includes(H) || ((me = q.description) == null ? void 0 : me.toLowerCase().includes(H));
        }
      );
    }
    return b;
  }, [dt, X, ne, Ct]), Gr = te.filter((b) => b.available), gt = l(() => ne ? ie.filter((b) => {
    const H = Gr.find((q) => q.key === b.source);
    return (H == null ? void 0 : H.label) === ne;
  }) : ie, [ie, ne, Gr]), co = t.createElement(
    "div",
    null,
    // Top bar: search + filters + install target
    t.createElement(
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
      t.createElement(c, {
        placeholder: "搜索技能市场...",
        prefix: F ? t.createElement(F) : void 0,
        value: X,
        onChange: (b) => ce(b.target.value),
        allowClear: !0,
        style: { flex: 1, minWidth: 200, maxWidth: 400 }
      }),
      // Pool install info
      t.createElement(
        ee,
        { type: "secondary", style: { fontSize: 12 } },
        "安装后进入技能池"
      ),
      // Configure skill source button
      t.createElement(
        d,
        {
          icon: U ? t.createElement(U) : void 0,
          onClick: () => wr(!0),
          size: "small"
        },
        "配置技能源"
      )
    ),
    // Dynamic category filter tags (from OSS manifest tags + imported sources)
    Wt && dt.length === 0 ? t.createElement($, {
      type: "warning",
      showIcon: !0,
      message: "UGSci 官方 OSS 技能库加载失败",
      description: "请检查网络或后端 OSS 代理服务，然后点击右上角“刷新”重试。",
      style: { marginBottom: 12 }
    }) : null,
    Fr.length > 0 ? t.createElement(
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
      t.createElement(
        ee,
        { type: "secondary", style: { fontSize: 12, marginRight: 4 } },
        "分类:"
      ),
      t.createElement(
        h,
        {
          style: {
            fontSize: 11,
            cursor: "pointer",
            borderRadius: 12
          },
          color: ne === "" ? "blue" : void 0,
          onClick: () => xe("")
        },
        "全部"
      ),
      ...Fr.map((b) => {
        const H = Pe.some(
          (q) => !q.isOfficial && q.sourceLabel === b.id
        );
        return t.createElement(
          h,
          {
            key: b.id,
            style: {
              fontSize: 11,
              cursor: "pointer",
              borderRadius: 12
            },
            color: ne === b.id ? H ? "blue" : "geekblue" : void 0,
            icon: H && U ? t.createElement(U) : void 0,
            onClick: () => xe(
              ne === b.id ? "" : b.id
            )
          },
          b.label
        );
      })
    ) : null,
    // GitHub skills section
    vr && dt.length === 0 ? t.createElement(
      "div",
      { style: { textAlign: "center", padding: 40, marginBottom: 16 } },
      t.createElement(s, { size: "large" }, t.createElement("div", { style: { minHeight: 60, display: "flex", alignItems: "center", justifyContent: "center" } }, "正在加载技能..."))
    ) : An.length > 0 ? t.createElement(
      "div",
      { style: { marginBottom: 20 } },
      t.createElement(
        "div",
        {
          style: {
            marginBottom: 10,
            display: "flex",
            alignItems: "center",
            gap: 6
          }
        },
        U ? t.createElement(U, {
          style: { fontSize: 14, color: "#1677ff" }
        }) : null,
        t.createElement(
          ee,
          { strong: !0, style: { fontSize: 13 } },
          `技能市场 (${An.length})`
        )
      ),
      t.createElement(
        m,
        { gutter: [12, 12] },
        ...An.map((b) => {
          const H = `github:${b.sourceId}:${b.name}`, q = le[H];
          return t.createElement(
            p,
            { key: H, xs: 24, sm: 12, md: 8, lg: 6 },
            t.createElement(
              w,
              {
                hoverable: !0,
                size: "small",
                style: { height: "100%" }
              },
              t.createElement(
                "div",
                {
                  style: {
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 8
                  }
                },
                U ? t.createElement(U, {
                  style: { fontSize: 18, color: "var(--ant-color-text-secondary, #57606a)" }
                }) : t.createElement(
                  "span",
                  { style: { fontSize: 18 } },
                  "📦"
                ),
                t.createElement(
                  y,
                  { title: b.name },
                  t.createElement(
                    ee,
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
                    b.name
                  )
                )
              ),
              t.createElement(
                ae,
                {
                  type: "secondary",
                  style: { fontSize: 11, margin: 0, lineHeight: 1.4 },
                  ellipsis: { rows: 2 }
                },
                b.description || "暂无描述"
              ),
              t.createElement(
                "div",
                {
                  style: {
                    marginTop: 8,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                  }
                },
                t.createElement(
                  "div",
                  { style: { display: "flex", gap: 4, flexWrap: "wrap", alignItems: "center" } },
                  // Show source path (e.g. "UGSci/anthropics") in bottom-left
                  b.sourcePath || b.sourceLabel ? t.createElement(
                    "span",
                    {
                      style: {
                        fontSize: 10,
                        color: "var(--ant-color-text-tertiary, #999)",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 2
                      }
                    },
                    A ? t.createElement(A, { style: { fontSize: 10 } }) : null,
                    b.sourcePath || b.sourceLabel
                  ) : null,
                  // Show tag as category badge
                  b.tag ? t.createElement(
                    h,
                    { color: "geekblue", style: { fontSize: 10 } },
                    b.tag
                  ) : null,
                  b.version ? t.createElement(
                    h,
                    { style: { fontSize: 10 } },
                    `v${b.version}`
                  ) : null
                ),
                q ? t.createElement(
                  d,
                  {
                    size: "small",
                    disabled: !0,
                    icon: T ? t.createElement(T) : void 0
                  },
                  "安装中"
                ) : t.createElement(
                  d,
                  {
                    type: "primary",
                    size: "small",
                    icon: B ? t.createElement(B) : void 0,
                    onClick: () => so(b)
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
    gt.length > 0 || we ? t.createElement(
      "div",
      {
        style: {
          marginBottom: 10,
          display: "flex",
          alignItems: "center",
          gap: 6
        }
      },
      x ? t.createElement(x, {
        style: { fontSize: 14, color: "#1677ff" }
      }) : null,
      t.createElement(
        ee,
        { strong: !0, style: { fontSize: 13 } },
        `技能市场${gt.length > 0 ? ` (${gt.length})` : ""}`
      )
    ) : null,
    // Results grid
    we && gt.length === 0 ? t.createElement(
      "div",
      { style: { textAlign: "center", padding: 60 } },
      t.createElement(s, { size: "large" })
    ) : gt.length === 0 ? t.createElement(i, {
      description: X ? `未找到匹配「${X}」的技能` : "输入关键词搜索技能市场",
      image: i.PRESENTED_IMAGE_SIMPLE
    }) : t.createElement(
      m,
      { gutter: [12, 12] },
      ...gt.map((b) => {
        const H = `${b.source}:${b.slug}`, q = le[H];
        return t.createElement(
          p,
          { key: H, xs: 24, sm: 12, md: 8, lg: 6 },
          t.createElement(
            w,
            {
              hoverable: !0,
              size: "small",
              style: { height: "100%", cursor: "pointer" },
              onClick: () => P(b)
            },
            t.createElement(
              "div",
              {
                style: {
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 8
                }
              },
              b.icon_url ? t.createElement("img", {
                src: b.icon_url,
                alt: b.name,
                style: { width: 24, height: 24, borderRadius: 4 }
              }) : t.createElement(
                "span",
                { style: { fontSize: 18 } },
                "📦"
              ),
              t.createElement(
                y,
                { title: b.name },
                t.createElement(
                  ee,
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
                  b.name
                )
              )
            ),
            t.createElement(
              ae,
              {
                type: "secondary",
                style: { fontSize: 11, margin: 0, lineHeight: 1.4 },
                ellipsis: { rows: 2 }
              },
              b.description || "暂无描述"
            ),
            t.createElement(
              "div",
              {
                style: {
                  marginTop: 8,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center"
                }
              },
              t.createElement(
                "div",
                { style: { display: "flex", gap: 4 } },
                t.createElement(
                  h,
                  { color: "geekblue", style: { fontSize: 10 } },
                  b.source
                ),
                b.version ? t.createElement(
                  h,
                  { style: { fontSize: 10 } },
                  `v${b.version}`
                ) : null
              ),
              q ? t.createElement(
                d,
                {
                  size: "small",
                  disabled: !0,
                  icon: T ? t.createElement(T) : void 0
                },
                "安装中"
              ) : t.createElement(
                d,
                {
                  type: "primary",
                  size: "small",
                  icon: B ? t.createElement(B) : void 0,
                  onClick: (me) => {
                    me.stopPropagation(), Dr(b);
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
    ve && !we ? t.createElement(
      "div",
      { style: { textAlign: "center", marginTop: 16 } },
      t.createElement(
        d,
        { onClick: oo, loading: we },
        "加载更多"
      )
    ) : null,
    // Detail Drawer
    j ? t.createElement(
      v,
      {
        title: t.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 8 } },
          j.icon_url ? t.createElement("img", {
            src: j.icon_url,
            alt: j.name,
            style: { width: 28, height: 28, borderRadius: 4 }
          }) : t.createElement(
            "span",
            { style: { fontSize: 20 } },
            "📦"
          ),
          t.createElement("span", null, j.name)
        ),
        open: !0,
        onClose: () => P(null),
        width: 480,
        extra: t.createElement(
          d,
          {
            type: "primary",
            icon: B ? t.createElement(B) : void 0,
            onClick: () => {
              Dr(j);
            }
          },
          "安装到技能池"
        )
      },
      t.createElement(
        g,
        { column: 1, bordered: !0, size: "small" },
        t.createElement(
          g.Item,
          { label: "来源" },
          j.source
        ),
        t.createElement(
          g.Item,
          { label: "描述" },
          j.description || "-"
        ),
        j.version ? t.createElement(
          g.Item,
          { label: "版本" },
          j.version
        ) : null,
        j.author ? t.createElement(
          g.Item,
          { label: "作者" },
          j.author
        ) : null,
        t.createElement(
          g.Item,
          { label: "来源链接" },
          t.createElement(
            "a",
            { href: j.source_url, target: "_blank" },
            j.source_url
          )
        )
      ),
      j.stats ? t.createElement(
        "div",
        { style: { marginTop: 16 } },
        t.createElement(
          ee,
          {
            strong: !0,
            style: { display: "block", marginBottom: 8 }
          },
          "统计"
        ),
        t.createElement(
          "div",
          { style: { display: "flex", gap: 12, flexWrap: "wrap" } },
          ...Object.entries(j.stats).map(
            ([b, H]) => t.createElement(
              "div",
              { key: b, style: { textAlign: "center" } },
              t.createElement(
                "div",
                {
                  style: {
                    fontSize: 18,
                    fontWeight: 600,
                    color: "#1677ff"
                  }
                },
                String(H)
              ),
              t.createElement(
                ee,
                { type: "secondary", style: { fontSize: 11 } },
                b
              )
            )
          )
        )
      ) : null
    ) : null
  ), zn = l(() => {
    let b = Rr;
    if (ft && (b = b.filter((H) => H.category === ft)), be.trim()) {
      const H = be.toLowerCase();
      b = b.filter(
        (q) => q.name.toLowerCase().includes(H) || q.description.toLowerCase().includes(H) || q.tags.some((me) => me.toLowerCase().includes(H))
      );
    }
    return b;
  }, [Rr, be, ft]), uo = async (b) => {
    if (!_n) {
      Nr(!0);
      try {
        let H = b.description;
        if (b.instructions)
          try {
            const Ce = b.instructions.replace(/^\/+/, ""), je = await un(Ce);
            je.ok && (H = await je.text());
          } catch {
          }
        let q = [];
        if (b.skills_manifest)
          try {
            const Ce = b.skills_manifest.replace(/^\/+/, ""), je = await un(Ce);
            if (je.ok) {
              const $e = await je.json();
              Array.isArray($e) ? q = $e.map((rt) => typeof rt == "string" ? rt : rt.name).filter(Boolean) : $e.skills && (q = $e.skills.map((rt) => typeof rt == "string" ? rt : rt.name).filter(Boolean));
            }
          } catch {
          }
        const me = await de("/agents", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: b.name,
            description: b.description,
            skill_names: q
          })
        });
        await dn(me.id, "AGENTS.md", H), u.success(`专家「${b.name}」创建成功，已跳转至专家`), io("/ugsci-experts");
      } catch (H) {
        u.error(H.message || "创建专家失败");
      } finally {
        Nr(!1);
      }
    }
  }, Hr = a(async (b) => {
    if (b)
      try {
        const H = await or(b);
        Fe(new Set(H.map((q) => q.key)));
      } catch {
        Fe(/* @__PURE__ */ new Set());
      }
  }, []);
  r(() => {
    Ae && Hr(Ae);
  }, [Ae, Hr]);
  const mo = async (b) => {
    if (!Ae) {
      u.warning("请先选择目标专家");
      return;
    }
    if (hs(b)) {
      const H = Object.entries(b.env), q = {};
      for (const [me] of H)
        q[me] = "";
      Me(q), re(b);
      return;
    }
    await Wr(b, b.env || {});
  }, Wr = async (b, H) => {
    De((q) => ({ ...q, [b.id]: !0 }));
    try {
      const q = b.id;
      await ir(Ae, {
        client_key: q,
        client: {
          name: b.name,
          description: b.description,
          enabled: !0,
          transport: b.transport,
          url: b.url || "",
          command: b.command || "",
          args: b.args || [],
          env: H,
          cwd: b.cwd || "",
          headers: b.headers || {}
        }
      }), u.success(`MCP「${b.name}」已添加到当前专家`), Fe((me) => new Set(me).add(q));
    } catch (q) {
      u.error(q.message || `添加 MCP「${b.name}」失败`);
    } finally {
      De((q) => ({ ...q, [b.id]: !1 }));
    }
  }, po = async () => {
    if (!Oe) return;
    const b = [];
    for (const [q, me] of Object.entries(ze))
      if (!me || !me.trim()) {
        const Ce = la[q];
        b.push((Ce == null ? void 0 : Ce.label) || q);
      }
    if (b.length > 0) {
      u.warning(`请填写以下配置项: ${b.join(", ")}`);
      return;
    }
    const H = Oe;
    re(null), Me({}), await Wr(H, { ...ze });
  }, $n = l(() => {
    let b = Tr;
    if (pt && (b = b.filter((H) => H.category === pt)), R.trim()) {
      const H = R.toLowerCase();
      b = b.filter(
        (q) => q.name.toLowerCase().includes(H) || q.description.toLowerCase().includes(H) || q.tags.some((me) => me.toLowerCase().includes(H))
      );
    }
    return b.map(vs);
  }, [Tr, R, pt]), fo = t.createElement(
    "div",
    null,
    // Search + agent selector
    t.createElement(
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
      t.createElement(c, {
        placeholder: "搜索 MCP 服务器...",
        prefix: F ? t.createElement(F) : void 0,
        value: R,
        onChange: (b) => fe(b.target.value),
        allowClear: !0,
        style: { maxWidth: 300 }
      }),
      t.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        t.createElement(
          ee,
          { type: "secondary", style: { fontSize: 12, whiteSpace: "nowrap" } },
          "安装到："
        ),
        t.createElement(E, {
          value: Ae,
          onChange: (b) => Ye(b),
          style: { minWidth: 180 },
          size: "small",
          options: O.map((b) => ({ value: b.id, label: b.name }))
        })
      ),
      // Configure MCP source button
      t.createElement(
        d,
        {
          icon: A ? t.createElement(A) : void 0,
          onClick: () => xr(!0),
          size: "small"
        },
        "配置 MCP 源"
      )
    ),
    // Dynamic category tag row (from OSS manifest tag_groups)
    Ir.length > 0 ? t.createElement(
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
      t.createElement(
        ee,
        { type: "secondary", style: { fontSize: 12, marginRight: 4 } },
        "分类:"
      ),
      t.createElement(
        h,
        {
          style: { fontSize: 11, cursor: "pointer", borderRadius: 12 },
          color: pt === "" ? "blue" : void 0,
          onClick: () => Pr("")
        },
        "全部"
      ),
      ...Ir.map(
        (b) => t.createElement(
          h,
          {
            key: b.id,
            style: { fontSize: 11, cursor: "pointer", borderRadius: 12 },
            color: pt === b.id ? "geekblue" : void 0,
            onClick: () => Pr(
              pt === b.id ? "" : b.id
            )
          },
          b.label
        )
      )
    ) : null,
    // MCP server cards (dynamic from OSS)
    zr && $n.length === 0 ? t.createElement(
      "div",
      { style: { textAlign: "center", padding: 40 } },
      t.createElement(s, { size: "large" }, t.createElement("div", { style: { minHeight: 60, display: "flex", alignItems: "center", justifyContent: "center" } }, "正在加载 MCP 服务器..."))
    ) : $n.length === 0 ? t.createElement(i, {
      description: "未找到匹配的 MCP 服务器",
      image: i.PRESENTED_IMAGE_SIMPLE
    }) : t.createElement(
      m,
      { gutter: [12, 12] },
      ...$n.map(
        (b) => t.createElement(
          p,
          { key: b.id, xs: 24, sm: 12, md: 8 },
          t.createElement(
            w,
            {
              hoverable: !0,
              size: "small",
              style: { height: "100%" }
            },
            // Header: emoji + name + tags
            t.createElement(
              "div",
              {
                style: {
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 10,
                  marginBottom: 8
                }
              },
              t.createElement(
                "span",
                { style: { fontSize: 28, display: "inline-flex", alignItems: "center", justifyContent: "center", width: 32, height: 32 } },
                b.iconUrl ? t.createElement("img", {
                  src: b.iconUrl,
                  alt: b.name,
                  style: { width: 28, height: 28, objectFit: "contain" },
                  onError: (H) => {
                    H.target.style.display = "none";
                  }
                }) : b.emoji
              ),
              t.createElement(
                "div",
                { style: { flex: 1 } },
                t.createElement(
                  ee,
                  { strong: !0, style: { fontSize: 14 } },
                  b.name
                ),
                t.createElement(
                  "div",
                  { style: { display: "flex", gap: 4, marginTop: 4, flexWrap: "wrap" } },
                  t.createElement(
                    h,
                    { color: "blue", style: { fontSize: 10 } },
                    b.category
                  ),
                  t.createElement(
                    h,
                    {
                      color: b.transport === "stdio" ? "purple" : "cyan",
                      style: { fontSize: 10 }
                    },
                    b.transport
                  ),
                  b.env && Object.keys(b.env).length > 0 ? t.createElement(
                    h,
                    { color: "orange", style: { fontSize: 10 } },
                    "需配置密钥"
                  ) : null
                )
              )
            ),
            // Description
            t.createElement(
              ae,
              {
                type: "secondary",
                style: { fontSize: 12, margin: 0, lineHeight: 1.5 },
                ellipsis: { rows: 3 }
              },
              b.description
            ),
            // Footer: config preview + install button
            t.createElement(
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
              t.createElement(
                ee,
                { type: "secondary", style: { fontSize: 11 } },
                b.transport === "stdio" ? `${b.command} ${(b.args || []).join(" ")}` : b.url || ""
              ),
              Ze.has(b.id) ? t.createElement(
                d,
                { size: "small", disabled: !0 },
                "已安装"
              ) : t.createElement(
                d,
                {
                  type: "primary",
                  size: "small",
                  loading: !!_e[b.id],
                  icon: A ? t.createElement(A) : void 0,
                  onClick: () => mo(b)
                },
                "安装"
              )
            )
          )
        )
      )
    ),
    // Future expansion hint
    t.createElement(
      "div",
      {
        style: {
          marginTop: 20,
          padding: 16,
          textAlign: "center",
          border: "1px dashed var(--ant-color-border, #d9d9d9)",
          borderRadius: 8,
          background: "var(--ant-color-fill-quaternary, #fafafa)"
        }
      },
      x ? t.createElement(x, {
        style: { fontSize: 24, color: "var(--ant-color-text-quaternary, #bfbfbf)", marginBottom: 8 }
      }) : null,
      t.createElement(
        ee,
        { type: "secondary", style: { fontSize: 12 } },
        "MCP 服务器列表来自 UGSci 官方源，自动同步更新"
      )
    )
  ), go = Oe ? t.createElement(
    I,
    {
      title: t.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 8 } },
        t.createElement("span", { style: { fontSize: 20, display: "inline-flex", alignItems: "center", justifyContent: "center", width: 24, height: 24 } }, Oe.iconUrl ? t.createElement("img", { src: Oe.iconUrl, alt: Oe.name, style: { width: 22, height: 22, objectFit: "contain" }, onError: (b) => {
          b.target.style.display = "none";
        } }) : Oe.emoji),
        t.createElement("span", null, `配置 ${Oe.name} 密钥`)
      ),
      open: !!Oe,
      onCancel: () => {
        re(null), Me({});
      },
      onOk: po,
      okText: "安装",
      cancelText: "取消",
      width: 520,
      destroyOnClose: !0
    },
    // Description
    t.createElement(
      ee,
      { type: "secondary", style: { display: "block", marginBottom: 16, fontSize: 12 } },
      Oe.description
    ),
    ...Object.entries(Oe.env || {}).map(([b]) => {
      const H = la[b], q = (H == null ? void 0 : H.isSecret) !== !1;
      return t.createElement(
        "div",
        { key: b, style: { marginBottom: 16 } },
        t.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 6, marginBottom: 4 } },
          t.createElement(
            ee,
            { strong: !0, style: { fontSize: 13 } },
            (H == null ? void 0 : H.label) || b
          ),
          t.createElement(
            h,
            { color: "orange", style: { fontSize: 10 } },
            "必填"
          )
        ),
        // Help text with optional link
        H ? t.createElement(
          "div",
          { style: { marginBottom: 6, fontSize: 12, color: "var(--ant-color-text-tertiary, #8c8c8c)" } },
          H.help,
          H.link ? t.createElement(
            "a",
            {
              href: H.link,
              target: "_blank",
              rel: "noopener noreferrer",
              style: { marginLeft: 4, fontSize: 12 }
            },
            "获取方式 ↗"
          ) : null
        ) : null,
        // Input field
        q ? t.createElement(c.Password, {
          placeholder: `请输入 ${(H == null ? void 0 : H.label) || b}`,
          value: ze[b] || "",
          onChange: (me) => Me((Ce) => ({
            ...Ce,
            [b]: me.target.value
          })),
          style: { width: "100%" }
        }) : t.createElement(c, {
          placeholder: `请输入 ${(H == null ? void 0 : H.label) || b}`,
          value: ze[b] || "",
          onChange: (me) => Me((Ce) => ({
            ...Ce,
            [b]: me.target.value
          })),
          style: { width: "100%" }
        }),
        // Show env key name for reference
        t.createElement(
          ee,
          { type: "secondary", style: { fontSize: 11, display: "block", marginTop: 2 } },
          `环境变量名: ${b}`
        )
      );
    })
  ) : null, yo = t.createElement(
    "div",
    null,
    t.createElement(
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
      t.createElement(c, {
        placeholder: "搜索人才...",
        prefix: F ? t.createElement(F) : void 0,
        value: be,
        onChange: (b) => Re(b.target.value),
        allowClear: !0,
        style: { maxWidth: 400, flex: 1, minWidth: 200 }
      }),
      t.createElement(
        d,
        {
          icon: W ? t.createElement(W) : void 0,
          onClick: () => Cr(!0),
          size: "small"
        },
        "配置专家源"
      )
    ),
    // Dynamic category tag row (from OSS manifest tag_groups)
    Mr.length > 0 ? t.createElement(
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
      t.createElement(
        ee,
        { type: "secondary", style: { fontSize: 12, marginRight: 4 } },
        "分类:"
      ),
      t.createElement(
        h,
        {
          style: { fontSize: 11, cursor: "pointer", borderRadius: 12 },
          color: ft === "" ? "blue" : void 0,
          onClick: () => jr("")
        },
        "全部"
      ),
      ...Mr.map(
        (b) => t.createElement(
          h,
          {
            key: b.id,
            style: { fontSize: 11, cursor: "pointer", borderRadius: 12 },
            color: ft === b.id ? "geekblue" : void 0,
            onClick: () => jr(
              ft === b.id ? "" : b.id
            )
          },
          b.label
        )
      )
    ) : null,
    // Agent cards (dynamic from OSS)
    Br && zn.length === 0 ? t.createElement(
      "div",
      { style: { textAlign: "center", padding: 40 } },
      t.createElement(s, { size: "large" }, t.createElement("div", { style: { minHeight: 60, display: "flex", alignItems: "center", justifyContent: "center" } }, "正在加载人才市场..."))
    ) : zn.length === 0 ? t.createElement(i, {
      description: "未找到匹配的人才",
      image: i.PRESENTED_IMAGE_SIMPLE
    }) : t.createElement(
      m,
      { gutter: [12, 12] },
      ...zn.map(
        (b) => t.createElement(
          p,
          { key: b.id, xs: 24, sm: 12, md: 8 },
          t.createElement(
            w,
            {
              hoverable: !0,
              size: "small",
              style: { height: "100%", cursor: "pointer" },
              onClick: () => qt(b)
            },
            t.createElement(
              "div",
              {
                style: {
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 10,
                  marginBottom: 8
                }
              },
              t.createElement(et, {
                name: b.name,
                size: 40
              }),
              t.createElement(
                "div",
                { style: { flex: 1 } },
                t.createElement(
                  ee,
                  { strong: !0, style: { fontSize: 14 } },
                  b.name
                ),
                t.createElement(
                  "div",
                  { style: { display: "flex", gap: 4, marginTop: 4, flexWrap: "wrap" } },
                  b.category ? t.createElement(
                    h,
                    { color: "blue", style: { fontSize: 10 } },
                    St(b.category)
                  ) : null,
                  b.tags.includes("mcp") ? t.createElement(
                    h,
                    { color: "purple", style: { fontSize: 10 } },
                    "MCP"
                  ) : null
                )
              )
            ),
            t.createElement(
              ae,
              {
                type: "secondary",
                style: { fontSize: 12, margin: 0, lineHeight: 1.5 },
                ellipsis: { rows: 3 }
              },
              b.description
            ),
            t.createElement(
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
              t.createElement(
                ee,
                { type: "secondary", style: { fontSize: 11 } },
                b.tags.filter((H) => H !== "agent" && H !== "template" && H !== "workspace").slice(0, 3).join(" · ") || "人才模板"
              ),
              t.createElement(
                d,
                {
                  type: "primary",
                  size: "small",
                  icon: N ? t.createElement(N) : void 0
                },
                "查看详情"
              )
            )
          )
        )
      )
    ),
    // Info hint
    t.createElement(
      "div",
      {
        style: {
          marginTop: 20,
          padding: 16,
          textAlign: "center",
          border: "1px dashed var(--ant-color-border, #d9d9d9)",
          borderRadius: 8,
          background: "var(--ant-color-fill-quaternary, #fafafa)"
        }
      },
      x ? t.createElement(x, {
        style: { fontSize: 24, color: "var(--ant-color-text-quaternary, #bfbfbf)", marginBottom: 8 }
      }) : null,
      t.createElement(
        ee,
        { type: "secondary", style: { fontSize: 12 } },
        "人才市场来自 UGSci 官方源，自动同步更新"
      )
    )
  ), ho = [
    {
      key: "skills",
      label: t.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        C ? t.createElement(C, { style: { fontSize: 14 } }) : null,
        "技能市场"
      ),
      children: co
    },
    {
      key: "mcp",
      label: t.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        A ? t.createElement(A, { style: { fontSize: 14 } }) : null,
        "MCP 市场"
      ),
      children: fo
    },
    {
      key: "experts",
      label: t.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        N ? t.createElement(N, { style: { fontSize: 14 } }) : null,
        "人才市场"
      ),
      children: yo
    }
  ];
  return t.createElement(
    "div",
    { style: { padding: 24 } },
    e ? null : t.createElement(vn, {
      title: "市场",
      subtitle: "浏览技能市场 · 选择 MCP 服务器 · 人才市场 · 随时更新能力和专家",
      extra: t.createElement(
        "div",
        { style: { display: "flex", gap: 8 } },
        t.createElement(
          d,
          {
            type: "primary",
            icon: J ? t.createElement(J) : void 0,
            onClick: () => {
              Kt(X, ne, {}), Jt(), In();
            },
            loading: we || vr || zr || Br
          },
          "刷新"
        )
      )
    }),
    t.createElement(S, {
      items: ho,
      activeKey: M,
      onChange: (b) => oe(b)
    }),
    // Skill source config modal
    t.createElement(Ps, {
      open: eo,
      onClose: () => wr(!1),
      sources: Ue,
      onChange: (b) => {
        Le(b), Jt(b);
      }
    }),
    // MCP source config modal
    t.createElement(ia, {
      open: no,
      onClose: () => xr(!1),
      sources: to,
      onChange: (b) => Sr(b),
      type: "mcp"
    }),
    // MCP token config modal (for templates requiring secrets)
    go,
    // Expert source config modal
    t.createElement(ia, {
      open: ao,
      onClose: () => Cr(!1),
      sources: ro,
      onChange: (b) => kr(b),
      type: "expert"
    }),
    // ── Agent Detail Modal (click card to view details, then create) ──
    qe ? t.createElement(
      I,
      {
        title: t.createElement(
          "div",
          {
            style: {
              display: "flex",
              alignItems: "center",
              gap: 12
            }
          },
          t.createElement(et, {
            name: qe.name,
            size: 40
          }),
          t.createElement(
            "div",
            null,
            t.createElement(
              ee,
              { strong: !0, style: { fontSize: 16 } },
              qe.name
            ),
            t.createElement(
              "div",
              {
                style: {
                  display: "flex",
                  gap: 4,
                  marginTop: 2,
                  flexWrap: "wrap"
                }
              },
              qe.category ? t.createElement(
                h,
                { color: "blue", style: { fontSize: 10 } },
                St(qe.category)
              ) : null,
              ...qe.tags.filter(
                (b) => b !== "agent" && b !== "template" && b !== "workspace"
              ).slice(0, 5).map(
                (b) => t.createElement(
                  h,
                  { key: b, style: { fontSize: 10 } },
                  b
                )
              )
            )
          )
        ),
        open: !0,
        onCancel: () => qt(null),
        width: 640,
        footer: t.createElement(
          "div",
          { style: { textAlign: "right" } },
          t.createElement(
            d,
            {
              onClick: () => qt(null),
              style: { marginRight: 8 }
            },
            "取消"
          ),
          t.createElement(
            d,
            {
              type: "primary",
              loading: _n,
              disabled: _n,
              icon: N ? t.createElement(N) : void 0,
              style: We,
              onClick: async () => {
                await uo(qe), qt(null);
              }
            },
            "创建专家"
          )
        )
      },
      // Description
      t.createElement(
        "div",
        { style: { marginBottom: 16 } },
        t.createElement(
          ee,
          { strong: !0, style: { display: "block", marginBottom: 6 } },
          "简介"
        ),
        t.createElement(
          ae,
          {
            type: "secondary",
            style: { fontSize: 13, lineHeight: 1.7, margin: 0 }
          },
          qe.description
        )
      ),
      // Skills manifest hint
      qe.skills_manifest ? t.createElement(
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
        t.createElement(
          ee,
          { style: { fontSize: 12, color: "#52c41a" } },
          "✓ 包含技能清单，创建后将自动安装推荐技能"
        )
      ) : null,
      // Instructions hint
      qe.instructions ? t.createElement(
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
        t.createElement(
          ee,
          { style: { fontSize: 12, color: "#1677ff" } },
          "✓ 包含系统提示词，创建后将自动写入 AGENTS.md"
        )
      ) : null,
      // Drivers
      qe.drivers && Object.keys(qe.drivers).length > 0 ? t.createElement(
        "div",
        null,
        t.createElement(
          ee,
          {
            strong: !0,
            style: { display: "block", marginBottom: 6 }
          },
          "推荐引擎"
        ),
        t.createElement(
          "div",
          {
            style: {
              display: "flex",
              gap: 6,
              flexWrap: "wrap"
            }
          },
          ...Object.entries(qe.drivers).map(
            ([b, H]) => t.createElement(
              h,
              { key: b, color: "cyan", style: { fontSize: 11 } },
              `${b}${H && H.length > 0 ? ` (${H.join(", ")})` : ""}`
            )
          )
        )
      ) : null
    ) : null
  );
}
function Bs() {
  try {
    const t = localStorage.getItem("language") || "";
    if (t) return t.split("-")[0];
  } catch {
  }
  return ((typeof navigator < "u" ? navigator.language : "") || "").split("-")[0] || "en";
}
const da = {
  zh: "您好，UGSci 智能助手在线。无论是油气藏分析、数值模拟还是工程决策，描述您的场景，我来交付结果。",
  en: "UGSci AI assistant is online. From reservoir analysis to numerical simulation and engineering decisions — describe your scenario and I'll deliver results.",
  ja: "UGSci AIアシスタントがオンラインです。油層解析、数値シミュレーション、エンジニアリングの意思決定など、シナリオを描写してください。結果をお届けします。",
  ru: "UGSci AI-ассистент онлайн. От анализа пласта до численного моделирования и инженерных решений — опишите свой сценарий, и я предоставлю результат.",
  vi: "Trợ lý AI UGSci đang trực tuyến. Từ phân tích mỏ, mô phỏng số đến ra quyết định kỹ thuật — mô tả kịch bản của bạn, tôi sẽ giao kết quả.",
  id: "Asisten AI UGSci sedang online. Dari analisis reservoir, simulasi numerik hingga keputusan engineering — jelaskan skenario Anda, saya akan memberikan hasilnya."
}, ua = {
  zh: { label: "能告诉我你都能做点什么吗？", value: "能告诉我你都能做点什么吗" },
  en: { label: "Can you tell me what you can do?", value: "Can you tell me what you can do?" },
  ja: { label: "あなたができることを教えてください", value: "あなたができることを教えてください" },
  ru: { label: "Расскажи, что ты умеешь делать?", value: "Расскажи, что ты умеешь делать?" },
  vi: { label: "Bạn có thể cho tôi biết bạn làm được gì không?", value: "Bạn có thể cho tôi biết bạn làm được gì không?" },
  id: { label: "Bisa cerita apa saja yang bisa Anda lakukan?", value: "Bisa cerita apa saja yang bisa Anda lakukan?" }
};
function Us() {
  const e = k(), t = e.React, { useEffect: n, useRef: r } = t, a = e.useSelectedAgent ? e.useSelectedAgent() : { id: "default" }, l = (a == null ? void 0 : a.id) || "default", o = r(null), s = r(null);
  return n(() => {
    if (o.current === l) return;
    o.current = l, nr();
    const i = Bs(), c = da[i] || da.en, d = ua[i] || ua.en;
    let u = !1;
    return (async () => {
      var m, p;
      try {
        const w = await Sn(l);
        if (u) return;
        const h = Ha(w);
        if (s.current) {
          try {
            s.current();
          } catch {
          }
          s.current = null;
        }
        const y = window.QwenPaw;
        (m = y == null ? void 0 : y.chat) != null && m.welcome && (h.length > 0 ? (s.current = y.chat.welcome.set("ugsci", {
          description: c,
          prompts: h
        }), console.info(
          `[ugsci] Injected ${h.length} welcome prompts for agent "${l}"`
        )) : (s.current = y.chat.welcome.set("ugsci", {
          description: c,
          prompts: [d]
        }), console.info(
          `[ugsci] No skills for agent "${l}" — using default prompt`
        )));
      } catch (w) {
        console.warn(
          `[ugsci] Failed to inject welcome prompts for agent "${l}":`,
          w
        );
        const h = window.QwenPaw;
        if ((p = h == null ? void 0 : h.chat) != null && p.welcome && !u) {
          if (s.current) {
            try {
              s.current();
            } catch {
            }
            s.current = null;
          }
          s.current = h.chat.welcome.set("ugsci", {
            description: c,
            prompts: [d]
          });
        }
      }
    })(), () => {
      u = !0;
    };
  }, [l]), null;
}
const js = 256;
let He = {};
const qn = /* @__PURE__ */ new Set(), mn = () => qn.forEach((e) => e()), Ns = (e) => (qn.add(e), () => qn.delete(e)), jt = /* @__PURE__ */ new Map();
function ma(e, t) {
  const n = [];
  for (const l of t) {
    if (!l) continue;
    const o = He[xt(e, l)] || Object.values(He).find((s) => s.uiId === l);
    o && n.push(o);
  }
  const r = `${e}::${t.join("\0")}`, a = jt.get(r);
  return a && a.length === n.length && a.every((l, o) => l === n[o]) ? a : (jt.set(r, n), n);
}
function xt(e, t) {
  return `${e}::${t}`;
}
function pn(e) {
  return !e || typeof e != "object" ? null : e.ok === !0 && (e.kind === "genui" || e.kind === "genui_patch") ? e : e.genui && typeof e.genui == "object" ? pn(e.genui) : e.ui && typeof e.ui == "object" ? pn(e.ui.genui) : null;
}
function Ot(e) {
  if (!e || typeof e != "string") return null;
  try {
    const t = JSON.parse(e);
    if (Array.isArray(t)) {
      for (const n of t) {
        const r = (n == null ? void 0 : n.type) === "text" ? n.text : void 0, a = typeof r == "string" ? Ot(r) : pn(n);
        if (a) return a;
      }
      return null;
    }
    return pn(t);
  } catch {
    return null;
  }
}
function Mt(e) {
  var t;
  if (!e || typeof e != "string") return null;
  try {
    const n = JSON.parse(e);
    if (Array.isArray(n)) {
      const r = (t = n.find((a) => (a == null ? void 0 : a.type) === "text")) == null ? void 0 : t.text;
      return typeof r == "string" ? Mt(r) : null;
    }
    return n && n.ok === !1 ? n : null;
  } catch {
    return null;
  }
}
const pa = /* @__PURE__ */ new Set(["plugin_call_output", "function_call_output", "tool_call_output", "mcp_call_output", "component_call_output"]), On = /* @__PURE__ */ new Set(["emit_ui_tree", "emit_ui_patch"]);
function bl(e) {
  var r, a, l, o;
  if (!Array.isArray(e)) return [];
  const t = [], n = (s, i = !1) => {
    var u, m, p;
    if (!s || typeof s != "object") return;
    if (Array.isArray(s)) {
      const w = i ? s.map((h) => {
        var y;
        return ((y = h == null ? void 0 : h.data) == null ? void 0 : y.name) ?? (h == null ? void 0 : h.name);
      }).filter((h) => !!h).map((h) => String(h)) : [];
      if (i && w.length) {
        const h = w.some((y) => On.has(y));
        for (const y of s) {
          const f = ((u = y == null ? void 0 : y.data) == null ? void 0 : u.output) ?? (y == null ? void 0 : y.output) ?? ((m = y == null ? void 0 : y.data) == null ? void 0 : m.result) ?? (y == null ? void 0 : y.result) ?? ((p = y == null ? void 0 : y.data) == null ? void 0 : p.content) ?? (y == null ? void 0 : y.content);
          if (f == null) continue;
          const E = typeof f == "string" ? f : JSON.stringify(f), v = Ot(E) || (h ? Mt(E) : null);
          v && t.push(v);
        }
      }
      s.forEach((h) => n(h));
      return;
    }
    const c = s;
    if (c.type === "tool_result") {
      const h = (Array.isArray(c.output) ? c.output : []).filter((E) => (E == null ? void 0 : E.type) === "text").map((E) => E.text), y = h.length ? h.join(`
`) : c.output, f = h.length ? h : [typeof y == "string" ? y : JSON.stringify(y)];
      for (const E of f) {
        const v = Ot(E) || (On.has(String(c.name || "")) ? Mt(E) : null);
        v && t.push(v);
      }
      return;
    }
    const d = pa.has(String(c.type || ""));
    Object.entries(c).forEach(
      ([w, h]) => n(h, d && w === "content")
    );
  };
  n(e);
  for (const s of e) {
    if (!s || typeof s != "object") continue;
    const i = s;
    if (!pa.has(String(i.type || "")) || !Array.isArray(i.content)) continue;
    const c = i.content, d = (a = (r = c[0]) == null ? void 0 : r.data) == null ? void 0 : a.name;
    if (!d) continue;
    const u = (o = (l = c[1]) == null ? void 0 : l.data) == null ? void 0 : o.output;
    if (u == null) continue;
    const m = typeof u == "string" ? u : JSON.stringify(u), p = Ot(m) || (On.has(String(d)) ? Mt(m) : null);
    p && t.push(p);
  }
  return Array.from(new Map(t.map((s) => [`${s.kind}:${s.ui_id}:${s.revision}`, s])).values());
}
function vl(e) {
  var o;
  const t = xt(e.sessionId, e.uiId), n = Object.entries(He).filter(([, s]) => s.uiId === e.uiId).sort(([, s], [, i]) => i.revision - s.revision), r = He[t] || ((o = n[0]) == null ? void 0 : o[1]);
  if (r && e.revision < r.revision) return;
  const a = { ...He };
  for (const [s] of n) s !== t && delete a[s];
  a[t] = r && e.revision === r.revision ? { ...r, ...e, tree: r.tree } : e;
  const l = Object.entries(a).sort(([, s], [, i]) => i.updatedAt - s.updatedAt);
  He = Object.fromEntries(l.slice(0, js)), mn();
}
function Ds(e, t) {
  for (const n of bl(t))
    !n.ui_id || !n.tree || vl({
      schemaVersion: "1",
      uiId: n.ui_id,
      revision: n.revision || 1,
      tree: n.tree,
      sessionId: e,
      sourceToolCallId: n.tool_call_id,
      updatedAt: Date.now()
    });
}
const wl = {
  setSnapshot: vl,
  applyPatch(e, t, n, r) {
    var c, d;
    const a = (c = window.QwenPaw) == null ? void 0 : c.host, l = r || ((d = a == null ? void 0 : a.getCurrentSessionId) == null ? void 0 : d.call(a)) || "", o = xt(l, e.ui_id), s = He[o] || Object.values(He).find((u) => u.uiId === e.ui_id);
    if (!s || n <= s.revision) return;
    He = { ...Object.fromEntries(Object.entries(He).filter(([, u]) => u.uiId !== e.ui_id)), [o]: { ...s, sessionId: l, tree: t, revision: n, updatedAt: Date.now() } }, mn();
  },
  getSnapshot: (e, t) => He[xt(e, t)],
  clearSession(e) {
    He = Object.fromEntries(Object.entries(He).filter(([, t]) => t.sessionId !== e));
    for (const t of [...jt.keys()])
      t.startsWith(`${e}::`) && jt.delete(t);
    mn();
  },
  hydrateFromMessages: Ds
};
function Fs({ children: e }) {
  return e;
}
function Gs() {
  return wl;
}
function Hs(e, t) {
  var l, o;
  const n = (o = (l = window.QwenPaw) == null ? void 0 : l.host) == null ? void 0 : o.React;
  if (!n) throw new Error("useGenUiSnapshots: host React not available");
  const r = t.join("\0"), a = r === "" ? [] : r.split("\0");
  return n.useSyncExternalStore(
    Ns,
    () => ma(e, a),
    () => ma(e, a)
  );
}
function Ws(e) {
  wl.clearSession(e);
}
function Vs() {
  He = {}, jt.clear(), mn();
}
function Lt(e) {
  var t;
  if (typeof e == "string") {
    if (e.trimStart().startsWith("["))
      try {
        return Lt(JSON.parse(e));
      } catch {
      }
    return e;
  }
  if (Array.isArray(e)) {
    const n = (t = e.find((r) => (r == null ? void 0 : r.type) === "text")) == null ? void 0 : t.text;
    return typeof n == "string" ? n : JSON.stringify(e);
  }
  if (e && typeof e == "object") {
    const n = e;
    if (typeof n.text == "string") return n.text;
    if (n.output !== void 0) return Lt(n.output);
    if (n.content !== void 0) return Lt(n.content);
  }
  return e == null ? "" : JSON.stringify(e);
}
function qs(e) {
  const t = e.data;
  if (!t) return { resultText: "", status: "calling", toolName: "" };
  const n = t.status || "calling", r = t.content;
  if (!Array.isArray(r) || r.length === 0)
    return { resultText: "", status: n, toolName: "" };
  const a = r[0], l = a == null ? void 0 : a.data, o = (l == null ? void 0 : l.name) || "";
  if (r.length > 1) {
    const s = r[1], i = s == null ? void 0 : s.data, c = (i == null ? void 0 : i.output) ?? (i == null ? void 0 : i.content) ?? (s == null ? void 0 : s.output) ?? (s == null ? void 0 : s.content) ?? (i == null ? void 0 : i.result) ?? (s == null ? void 0 : s.result);
    if (c != null) return { resultText: Lt(c), status: n, toolName: o };
  }
  if (l != null && l.output) {
    const s = l.output;
    return { resultText: Lt(s), status: n, toolName: o };
  }
  return { resultText: "", status: n, toolName: o };
}
function fa(e) {
  var p, w, h, y;
  const t = (p = window.QwenPaw) == null ? void 0 : p.host, n = t == null ? void 0 : t.React;
  if (!n) return null;
  const { resultText: r, status: a, toolName: l } = qs(e), o = a === "in_progress" || a === "calling", s = a === "failed" || a === "error", i = Ot(r), c = i ? null : Mt(r);
  let d = 0;
  (w = i == null ? void 0 : i.tree) != null && w.root && (d = Sl(i.tree.root));
  const u = l === "emit_ui_patch" || (i == null ? void 0 : i.kind) === "genui_patch", m = o ? u ? "📝 Patching UI Tree..." : "🎨 Generating UI Tree..." : s ? u ? "📝 UI Patch Error" : "🎨 UI Tree Error" : i ? u ? `📝 UI Patched (rev ${i.revision ?? "?"})` : `🎨 UI Tree (${d} nodes)` : u ? "📝 UI Patch" : "🎨 UI Tree";
  return n.createElement(
    "details",
    { open: o || s, style: { margin: "4px 0", border: "1px solid var(--ant-color-border, #d9d9d9)", borderRadius: 8, padding: "4px 8px", fontSize: 13 } },
    n.createElement(
      "summary",
      { style: { cursor: "pointer", display: "flex", alignItems: "center", gap: 6 } },
      n.createElement("span", null, u ? "📝" : "🎨"),
      n.createElement("span", null, m),
      i != null && i.ok ? n.createElement("span", { style: { fontSize: 11, color: "#999", marginLeft: "auto" } }, `ui_id: ${((h = i.ui_id) == null ? void 0 : h.slice(0, 16)) ?? ""}…`) : null
    ),
    s || c && !i ? n.createElement(
      "div",
      { style: { padding: "8px 12px", fontSize: 12 } },
      n.createElement("div", { style: { color: "var(--ant-color-error, #ff4d4f)", marginBottom: 4 } }, (c == null ? void 0 : c.message) || "Unknown error"),
      c != null && c.hint ? n.createElement("div", { style: { color: "#999" } }, `💡 ${c.hint}`) : null
    ) : i != null && i.ok ? n.createElement(
      "div",
      { style: { padding: "8px 12px", fontSize: 12, color: "#999" } },
      (y = i.tree) != null && y.root ? `GenUI 已在回复正文中展示（${d} 个节点，revision ${i.revision ?? 1}）。` : "GenUI 工具已完成，但没有可展示的树。"
    ) : n.createElement("pre", { style: { fontSize: 12, padding: "8px 12px", background: "rgba(0,0,0,0.03)", borderRadius: 8, overflow: "auto", maxHeight: 200 } }, r || "(waiting for result...)")
  );
}
function Sl(e) {
  if (!e || typeof e != "object") return 0;
  let t = 1;
  if (Array.isArray(e.children)) for (const n of e.children) t += Sl(n);
  return t;
}
function cn(e) {
  var t;
  if (typeof e == "string") {
    if (e.trimStart().startsWith("["))
      try {
        return cn(JSON.parse(e));
      } catch {
      }
    return e;
  }
  if (Array.isArray(e)) {
    const n = (t = e.find((r) => (r == null ? void 0 : r.type) === "text")) == null ? void 0 : t.text;
    return typeof n == "string" ? n : JSON.stringify(e);
  }
  if (e && typeof e == "object") {
    const n = e;
    if (typeof n.text == "string") return n.text;
    if (n.output !== void 0) return cn(n.output);
    if (n.content !== void 0) return cn(n.content);
  }
  return e == null ? "" : JSON.stringify(e);
}
function Js(e) {
  var o;
  const t = e.data;
  if (!t) return { resultText: "", status: "calling", toolName: "" };
  const n = t.status || "calling", r = t.content;
  if (!Array.isArray(r) || r.length === 0)
    return { resultText: "", status: n, toolName: "" };
  const a = (o = r[0]) == null ? void 0 : o.data, l = (a == null ? void 0 : a.name) || "";
  if (r.length > 1) {
    const s = r[1], i = s == null ? void 0 : s.data, c = (i == null ? void 0 : i.output) ?? (i == null ? void 0 : i.content) ?? (s == null ? void 0 : s.output) ?? (s == null ? void 0 : s.content);
    if (c != null) return { resultText: cn(c), status: n, toolName: l };
  }
  return { resultText: "", status: n, toolName: l };
}
function ga(e) {
  var d;
  const t = (d = window.QwenPaw) == null ? void 0 : d.host, n = t == null ? void 0 : t.React;
  if (!n) return null;
  const { resultText: r, status: a, toolName: l } = Js(e), o = l === "get_genui_guide", s = a === "in_progress" || a === "calling";
  let i = o ? "GenUI 指南" : "组件目录", c = r;
  try {
    const u = r ? JSON.parse(r) : null;
    if (u && typeof u == "object") {
      const m = u.components;
      Array.isArray(m) ? (i = `组件目录（${m.length} 个 kind）`, c = m.map((p) => p == null ? void 0 : p.kind).filter(Boolean).join(" · ")) : (u.purpose || u.layout_structure) && (i = "GenUI 指南", c = String(u.purpose || "布局与语法说明已返回，模型可按此编写 emit_ui_tree。"));
    }
  } catch {
  }
  return n.createElement(
    "details",
    { style: { margin: "4px 0", border: "1px solid var(--ant-color-border, #d9d9d9)", borderRadius: 8, padding: "4px 8px", fontSize: 13 } },
    n.createElement("summary", { style: { cursor: "pointer" } }, s ? o ? "查阅 GenUI 指南…" : "查阅组件目录…" : i),
    n.createElement("div", { style: { padding: "8px 4px", fontSize: 12, color: "#666", lineHeight: 1.5 } }, c || "(waiting…)")
  );
}
const Ks = /* @__PURE__ */ new Set(["send_message"]), ya = 1e4, Xs = 500, ha = {};
function Ys() {
  var e;
  try {
    const t = window.QwenPaw, n = (e = t == null ? void 0 : t.genui) == null ? void 0 : e.config;
    if (n != null && n.allow_actions && Array.isArray(n.allow_actions)) {
      const r = n.allow_actions.filter(
        (a) => typeof a == "string" && a.length > 0
      );
      if (r.length > 0)
        return new Set(r);
    }
  } catch {
  }
  return new Set(Ks);
}
function Qs(e) {
  const t = Date.now(), n = ha[e] || 0;
  return t - n < Xs ? (console.warn("[ugsci.genui] Action '" + e + "' throttled"), !0) : (ha[e] = t, !1);
}
function Zs(e, t) {
  return e.replace(/\{\{\s*([\w.-]+)\s*\}\}/g, (n, r) => {
    const a = t[r];
    return a == null ? "" : typeof a == "string" ? a : JSON.stringify(a);
  });
}
function Jn(e, t = {}) {
  var l, o, s, i, c, d, u;
  let n;
  if (typeof e == "string") n = { type: e };
  else if (e && typeof e == "object") n = e;
  else return { ok: !1, message: "无效操作" };
  const r = n.type === "submit_form" ? "send_message" : n.type, a = Ys();
  if (!a.has(r))
    return console.warn(
      "[ugsci.genui] Action '" + n.type + "' not allowed (allowed: " + Array.from(a).join(", ") + ")"
    ), { ok: !1, message: "此操作未获允许" };
  if (Qs(r)) return { ok: !1, message: "操作过于频繁，请稍后重试" };
  if (r === "send_message") {
    const m = t.formValues || {};
    let p = ((l = n.payload) == null ? void 0 : l.content) || ((o = n.payload) == null ? void 0 : o.message) || "";
    const w = /\{\{\s*[\w.-]+\s*\}\}/.test(p);
    return p = Zs(p, m).trim(), p && !w && Object.keys(m).length > 0 && (p += `
${Object.entries(m).map(([y, f]) => `${y}: ${typeof f == "string" ? f : JSON.stringify(f)}`).join(`
`)}`), !p && Object.keys(m).length > 0 && (p = `${t.formId ? `提交表单 ${t.formId}` : "提交表单"}
${Object.entries(m).map(([f, E]) => `${f}: ${typeof E == "string" ? E : JSON.stringify(E)}`).join(`
`)}`), !p || !p.trim() ? (console.warn("[ugsci.genui] send_message: content is empty"), { ok: !1, message: "消息内容为空" }) : p.length > ya ? (console.warn("[ugsci.genui] send_message: content length " + p.length + " exceeds max " + ya), { ok: !1, message: "消息内容过长" }) : !((c = (i = (s = window.QwenPaw) == null ? void 0 : s.chat) == null ? void 0 : i.sendMessage) != null && c.call(i, p)) ? (console.info("[ugsci.genui] send_message: could not find chat sender, content:", p), { ok: !1, message: "当前无法发送消息" }) : { ok: !0, message: "已提交" };
  }
  if (r === "open_url") {
    const m = ((d = n.payload) == null ? void 0 : d.url) || ((u = n.payload) == null ? void 0 : u.href) || "", p = typeof m == "string" ? m.trim() : "";
    return /^https?:\/\//i.test(p) ? (window.open(p, "_blank", "noopener,noreferrer"), { ok: !0, message: "已打开链接" }) : (console.warn("[ugsci.genui] open_url: only http(s) URLs are allowed"), { ok: !1, message: "仅允许 http(s) 链接" });
  }
  return { ok: !1, message: "尚未实现此操作" };
}
const Qe = /* @__PURE__ */ new Map(), Nt = /* @__PURE__ */ new Map(), ec = 128, nn = /* @__PURE__ */ new Map();
function fn(e) {
  return e.startsWith("http://") || e.startsWith("https://") || e.startsWith("data:") || e.startsWith("blob:");
}
function tc(e) {
  return e ? !!(e.startsWith("/") || /^[A-Za-z]:[\\/]/.test(e) || e.startsWith("\\\\")) : !1;
}
function nc(e) {
  return e.startsWith("workspace://");
}
function rc(e) {
  return nc(e) ? e.slice(12) : e;
}
async function ac(e) {
  if (!e) return null;
  if (fn(e)) return e;
  if (Qe.has(e))
    return Qe.get(e) ?? null;
  if (nn.has(e))
    return nn.get(e);
  const t = lc(e);
  nn.set(e, t);
  try {
    const n = await t;
    if (!Qe.has(e) && Qe.size >= ec) {
      const r = Qe.keys().next().value;
      if (r !== void 0) {
        const a = Qe.get(r);
        a != null && a.startsWith("blob:") && URL.revokeObjectURL(a), Qe.delete(r);
      }
    }
    return Qe.set(e, n), n && Nt.delete(e), n;
  } finally {
    nn.delete(e);
  }
}
async function lc(e) {
  const t = window.QwenPaw, n = t == null ? void 0 : t.host;
  if (!n) {
    const a = "宿主媒体 API 不可用。请在 QwenPaw 工作区中打开此内容，或改用 http(s)、data、blob URL。";
    return Nt.set(e, a), console.warn("[ugsci.genui]", a), null;
  }
  const r = rc(e);
  if (typeof n.resolveWorkspaceBlob == "function")
    try {
      const a = await n.resolveWorkspaceBlob(r);
      if (a) return a;
    } catch (a) {
      console.warn("[ugsci.genui] host.resolveWorkspaceBlob failed:", a);
    }
  try {
    return await oc(r, n);
  } catch (a) {
    const l = a instanceof Error ? a.message : String(a);
    return Nt.set(
      e,
      `无法读取本地媒体：${l}。请确认文件位于当前工作区且文件预览 API 已启用。`
    ), console.warn(
      `[ugsci.genui] Failed to resolve media URL for '${e}':`,
      a
    ), null;
  }
}
async function oc(e, t) {
  let n = null;
  const r = t == null ? void 0 : t.workspaceApi, a = t == null ? void 0 : t.chatApi;
  if (tc(e) && (a != null && a.filePreviewUrl) ? n = a.filePreviewUrl(e) : r != null && r.getBinaryFileUrl && (n = r.getBinaryFileUrl(e)), !n)
    throw new Error("宿主未提供 workspaceApi.getBinaryFileUrl 或 chatApi.filePreviewUrl");
  const l = {}, o = t == null ? void 0 : t.buildAuthHeaders;
  if (typeof o == "function")
    try {
      const c = o();
      c && typeof c == "object" && Object.assign(l, c);
    } catch {
    }
  const s = await fetch(n, { headers: l });
  if (!s.ok)
    throw new Error(`HTTP ${s.status}: ${s.statusText}`);
  const i = await s.blob();
  return URL.createObjectURL(i);
}
function Ea(e) {
  return e ? fn(e) ? e : Qe.get(e) ?? null : null;
}
function ba(e) {
  return Nt.get(e) ?? null;
}
function ic() {
  for (const e of Qe.values())
    if (e && e.startsWith("blob:"))
      try {
        URL.revokeObjectURL(e);
      } catch {
      }
  Qe.clear(), Nt.clear();
}
const xl = [
  "Input",
  "NumberInput",
  "Select",
  "Textarea",
  "Switch",
  "Slider",
  "FileInput"
], yt = ["#1677ff", "#52c41a", "#faad14", "#ff4d4f", "#722ed1", "#13c2c2", "#eb2f96"], sc = /* @__PURE__ */ new Set([
  "Button",
  "InteractiveButton",
  "ToggleButton",
  "LinkButton"
]);
function Ee(e) {
  return typeof e == "string" ? e : e == null ? "" : String(e);
}
function Xe(e) {
  if (typeof e == "number" && Number.isFinite(e)) return e;
  if (typeof e == "string") {
    const t = Number(e);
    return Number.isFinite(t) ? t : 0;
  }
  return 0;
}
function $t(e) {
  return Array.isArray(e) ? e : [];
}
function Bt(e) {
  return !!e;
}
function Dt(e) {
  const t = e.props || {}, n = Ee(t.name);
  if (n) return n;
  const r = Ee(t.label), a = r.match(/^\s*([a-e])(?:\b|\s|（|\()/i);
  return a ? a[1].toLowerCase() : r || Ee(e.nodeId);
}
function kl(e) {
  return xl.includes(e);
}
function Cl(e) {
  return Math.min(Math.max(Xe(e) || 2, 1), 4);
}
function cc(e, t, n = 6) {
  const r = Xe(e);
  return Math.min(Math.max(r > 0 ? r : t, 1), n);
}
function dc(e) {
  const n = (Ee(e) || "16:9").split(":"), r = Number(n[0]), a = Number(n[1]);
  return r > 0 && a > 0 ? `${r} / ${a}` : "16 / 9";
}
function uc(e) {
  return /^https?:\/\//i.test(Ee(e).trim());
}
function Ke(e, t) {
  const n = {}, r = `${Xe(t.gap) || 12}px`;
  if (e === "Stack")
    n.display = "flex", n.flexDirection = "column", n.gap = r, t.padding != null && (n.padding = `${Xe(t.padding)}px`);
  else if (e === "Row")
    n.display = "flex", n.flexDirection = "row", n.gap = r, t.align && (n.alignItems = Ee(t.align)), t.justify && (n.justifyContent = Ee(t.justify));
  else if (e === "Grid" || e === "FeatureGrid" || e === "KpiBoard" || e === "ImageGallery") {
    const a = e === "KpiBoard" ? 3 : e === "FeatureGrid" ? 2 : e === "ImageGallery" ? 3 : 2, l = e === "FeatureGrid" ? 4 : 6;
    n.display = "grid", n.gridTemplateColumns = `repeat(${cc(t.columns, a, l)}, minmax(0, 1fr))`, n.gap = e === "ImageGallery" ? `${Xe(t.gap) || 8}px` : r;
  } else e === "ScrollArea" ? (n.maxHeight = `${Xe(t.maxHeight) || 300}px`, n.overflowY = "auto", t.padding != null && (n.padding = `${Xe(t.padding)}px`)) : e === "AspectBox" ? (n.aspectRatio = dc(t.ratio), n.overflow = "hidden", n.borderRadius = "8px", n.display = "flex", n.justifyContent = "center", n.alignItems = "center") : e === "Spacer" && (n.height = `${Xe(t.size) || 16}px`);
  return n;
}
function ur(e, t) {
  function n(u) {
    return typeof u == "string" ? u : u == null ? "" : String(u);
  }
  function r(u) {
    if (typeof u == "number" && Number.isFinite(u)) return u;
    if (typeof u == "string") {
      const m = Number(u);
      return Number.isFinite(m) ? m : 0;
    }
    return 0;
  }
  function a(u) {
    return Array.isArray(u) ? u : [];
  }
  const l = e.generator && typeof e.generator == "object" ? e.generator : {}, o = a(l.coefficients).map(n).filter(Boolean), s = n(l.type) === "polynomial" || o.length > 0;
  let i = a(e.categories).map(n), c = a(e.series);
  if (s && t) {
    const u = o.length > 0 ? o : ["a", "b", "c", "d", "e"], m = typeof l.xMin == "number" ? l.xMin : -3, p = typeof l.xMax == "number" ? l.xMax : 3, w = Math.min(Math.max(r(l.samples) || 61, 10), 400), h = Array.from({ length: w }, (f, E) => m + (p - m) * E / Math.max(w - 1, 1)), y = u.map((f) => r(t[f]));
    i = h.map((f) => Number(f.toFixed(2)).toString()), c = [{
      name: n(l.label) || "f(x)",
      values: h.map((f) => y.reduce((E, v, g) => E + v * Math.pow(f, y.length - g - 1), 0))
    }];
  }
  const d = c.map((u, m) => {
    const p = u && typeof u == "object" ? u : {};
    return {
      name: n(p.name) || `Series ${m + 1}`,
      values: a(p.values).map(r)
    };
  });
  return {
    title: n(e.title),
    chartType: n(e.chart) || "line",
    categories: i,
    series: d,
    height: r(e.height) || 200,
    showLegend: e.showLegend !== !1,
    empty: i.length === 0 || d.length === 0
  };
}
function Tl(e, t, n = 640) {
  const r = ["#1677ff", "#52c41a", "#faad14", "#ff4d4f", "#722ed1", "#13c2c2", "#eb2f96"];
  if (e.replaceChildren(), t.title) {
    const p = document.createElement("div");
    p.className = "chart-title", p.textContent = t.title, e.appendChild(p);
  }
  if (t.empty) {
    const p = document.createElement("div");
    p.className = "muted", p.textContent = "Chart: no data", e.appendChild(p);
    return;
  }
  const a = t.height || 240, l = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  if (l.setAttribute("viewBox", `0 0 ${n} ${a}`), l.setAttribute("role", "img"), l.setAttribute("aria-label", t.title || "Chart"), t.chartType === "pie") {
    const p = t.series[0].values.map((v) => Math.abs(v)), w = p.reduce((v, g) => v + g, 0) || 1, h = n / 2, y = a / 2, f = Math.min(n, a) / 2 - 20;
    let E = -Math.PI / 2;
    if (p.forEach((v, g) => {
      const S = v / w * Math.PI * 2, z = h + f * Math.cos(E), V = y + f * Math.sin(E), I = h + f * Math.cos(E + S), $ = y + f * Math.sin(E + S), J = document.createElementNS(l.namespaceURI, "path");
      J.setAttribute("d", `M ${h} ${y} L ${z} ${V} A ${f} ${f} 0 ${S > Math.PI ? 1 : 0} 1 ${I} ${$} Z`), J.setAttribute("fill", r[g % r.length]), l.appendChild(J), E += S;
    }), e.appendChild(l), t.showLegend) {
      const v = document.createElement("div");
      v.className = "legend", p.forEach((g, S) => {
        const z = document.createElement("span"), V = document.createElement("i");
        V.style.background = r[S % r.length], z.append(V, document.createTextNode(`${t.categories[S] || `#${S + 1}`}: ${g}`)), v.appendChild(z);
      }), e.appendChild(v);
    }
    return;
  }
  const o = t.series.flatMap((p) => p.values), s = Math.max(...o, 0), i = Math.min(...o, 0), c = s - i || 1, d = (p) => a - 24 - (p - i) / c * (a - 44), u = (p) => 30 + p * (n - 50) / Math.max(t.categories.length - 1, 1), m = document.createElementNS(l.namespaceURI, "line");
  if (m.setAttribute("x1", "30"), m.setAttribute("x2", String(n - 15)), m.setAttribute("y1", String(d(0))), m.setAttribute("y2", String(d(0))), m.setAttribute("stroke", "#d9d9d9"), l.appendChild(m), t.series.forEach((p, w) => {
    const h = r[w % r.length];
    if (t.chartType === "bar") {
      const E = (n - 50) / Math.max(t.categories.length, 1), v = Math.max(1, E / t.series.length - 3);
      p.values.forEach((g, S) => {
        const z = document.createElementNS(l.namespaceURI, "rect"), V = Math.min(d(g), d(0)), I = Math.max(d(g), d(0));
        z.setAttribute("x", String(30 + S * E + w * (v + 2))), z.setAttribute("y", String(V)), z.setAttribute("width", String(v)), z.setAttribute("height", String(Math.max(1, I - V))), z.setAttribute("fill", h), l.appendChild(z);
      });
      return;
    }
    const y = p.values.map((E, v) => `${u(v)},${d(E)}`).join(" "), f = document.createElementNS(l.namespaceURI, "polyline");
    f.setAttribute("points", y), f.setAttribute("fill", t.chartType === "area" ? `${h}22` : "none"), f.setAttribute("stroke", h), f.setAttribute("stroke-width", "2"), l.appendChild(f);
  }), e.appendChild(l), t.showLegend) {
    const p = document.createElement("div");
    p.className = "legend", t.series.forEach((w, h) => {
      const y = document.createElement("span"), f = document.createElement("i");
      f.style.background = r[h % r.length], y.append(f, document.createTextNode(w.name)), p.appendChild(y);
    }), e.appendChild(p);
  }
}
const mc = {
  check: ["M20 6 9 17l-5-5"],
  warning: [
    "M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z",
    "M12 9v4",
    "M12 17h.01"
  ],
  info: [
    "M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z",
    "M12 16v-4",
    "M12 8h.01"
  ],
  error: [
    "M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z",
    "M15 9l-6 6",
    "M9 9l6 6"
  ],
  chart: ["M3 3v18h18", "M7 16V8", "M12 16v-5", "M17 16V4"],
  image: [
    "M4 5h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z",
    "M8 14l2.5-3 2.5 3 3.5-4.5L20 16"
  ]
}, pc = {
  check: "check",
  success: "check",
  "check-circle": "check",
  warning: "warning",
  alert: "warning",
  "alert-triangle": "warning",
  info: "info",
  information: "info",
  "info-circle": "info",
  error: "error",
  "x-circle": "error",
  "close-circle": "error",
  chart: "chart",
  "bar-chart": "chart",
  "bar-chart-2": "chart",
  image: "image",
  photo: "image",
  picture: "image"
};
function _l(e) {
  const t = Ee(e).trim();
  if (!t) return { kind: "empty" };
  const n = t.toLowerCase().replace(/\s+/g, "-"), r = pc[n];
  return r ? { kind: "svg", paths: mc[r] } : /^[\w.-]+$/.test(t) ? { kind: "empty" } : t.length <= 8 ? { kind: "emoji", text: t.slice(0, 8) } : { kind: "empty" };
}
function fc(e, t, n = {}) {
  const r = _l(t), a = n.size && n.size > 0 ? n.size : 16;
  if (e.setAttribute("aria-hidden", "true"), e.replaceChildren(), r.kind === "emoji") {
    e.textContent = r.text, e.style.fontSize = `${a}px`, n.color && (e.style.color = n.color);
    return;
  }
  if (r.kind === "empty") return;
  const l = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  l.setAttribute("width", String(a)), l.setAttribute("height", String(a)), l.setAttribute("viewBox", "0 0 24 24"), l.setAttribute("fill", "none"), l.setAttribute("stroke", n.color || "currentColor"), l.setAttribute("stroke-width", "2"), l.setAttribute("stroke-linecap", "round"), l.setAttribute("stroke-linejoin", "round"), l.setAttribute("focusable", "false"), l.style.display = "block";
  for (const o of r.paths) {
    const s = document.createElementNS("http://www.w3.org/2000/svg", "path");
    s.setAttribute("d", o), l.appendChild(s);
  }
  e.appendChild(l);
}
let Mn = null;
function kn(e) {
  return Mn || (Mn = e.createContext(null)), Mn;
}
function Il(e, t = {}) {
  if (kl(e.kind)) {
    const n = e.props || {}, r = n.value ?? n.checked;
    r !== void 0 && (t[Dt(e)] = r);
  }
  for (const n of e.children || []) Il(n, t);
  return t;
}
function gc({
  node: e,
  children: t,
  onValuesChange: n
}) {
  var i, c;
  const r = (c = (i = window.QwenPaw) == null ? void 0 : i.host) == null ? void 0 : c.React;
  if (!r) return null;
  const a = r.useMemo(() => Il(e), [e]), [l, o] = r.useState(a);
  r.useEffect(
    () => o((d) => ({ ...a, ...d })),
    [a]
  ), r.useEffect(() => {
    n == null || n(l);
  }, [l, n]);
  const s = r.useMemo(
    () => ({
      values: l,
      setValue: (d, u) => o((m) => ({ ...m, [d]: u }))
    }),
    [l]
  );
  return r.createElement(
    kn(r).Provider,
    { value: s },
    t
  );
}
const Y = (e) => typeof e == "string" ? e : e != null ? String(e) : "", lt = (e) => typeof e == "number" ? e : typeof e == "string" && Number(e) || 0, ot = (e) => !!e, Pt = (e) => Array.isArray(e) ? e : [], yc = (e, t) => {
  const n = Object.keys(e), r = Object.keys(t);
  return n.length === r.length && n.every((a) => Object.is(e[a], t[a]));
}, va = { xs: "12px", sm: "13px", base: "14px", lg: "16px" }, Te = {
  muted: "var(--ant-color-text-secondary, #8c8c8c)",
  default: "var(--ant-color-text, #000000d9)",
  primary: "var(--ant-color-primary, #1677ff)",
  success: "var(--ant-color-success, #52c41a)",
  warning: "var(--ant-color-warning, #faad14)",
  error: "var(--ant-color-error, #ff4d4f)"
}, hc = new Set(xl);
function Ec(e) {
  const t = [], n = (r) => {
    hc.has(r.kind) && t.push(r);
    for (const a of r.children || []) n(a);
  };
  for (const r of e.children || []) n(r);
  return t;
}
let Ln = null;
function mr(e) {
  return Ln || (Ln = e.createContext(null)), Ln;
}
function bc({ node: e }) {
  var w;
  const t = (w = window.QwenPaw) == null ? void 0 : w.host, n = t == null ? void 0 : t.React, r = (t == null ? void 0 : t.antd) || {};
  if (!n) return null;
  const a = e.props || {}, l = n.useContext(kn(n)), [o, s] = n.useState({}), [i, c] = n.useState(null), d = n.useMemo(
    () => Ec(e),
    [e]
  ), u = n.useMemo(() => {
    const h = {};
    for (const y of d) {
      const f = y.props || {}, E = Dt(y);
      f.value !== void 0 ? h[E] = f.value : f.checked !== void 0 && (h[E] = f.checked);
    }
    return h;
  }, [d]);
  n.useEffect(() => s((h) => {
    const y = { ...u, ...h, ...(l == null ? void 0 : l.values) || {} };
    return yc(h, y) ? h : y;
  }), [u, l == null ? void 0 : l.values]);
  const m = n.useMemo(() => ({ values: o, setValue: (h, y) => {
    c(null), s((f) => ({ ...f, [h]: y })), l == null || l.setValue(h, y);
  } }), [o, l]), p = () => {
    var f, E;
    const h = d.filter((v) => {
      var g;
      return (g = v.props) == null ? void 0 : g.required;
    }).find((v) => {
      const g = Dt(v), S = o[g];
      return S == null || S === "" || Array.isArray(S) && S.length === 0;
    });
    if (h) {
      c({ ok: !1, message: `${Y((f = h.props) == null ? void 0 : f.label) || Y((E = h.props) == null ? void 0 : E.name) || "必填项"}不能为空` });
      return;
    }
    const y = a.action && typeof a.action == "object" ? a.action : { type: "submit_form", payload: {} };
    c(Jn(y, { formValues: o, formId: Y(a.formId) || e.nodeId }));
  };
  return n.createElement(
    mr(n).Provider,
    { value: m },
    n.createElement(
      "div",
      { style: { margin: "4px 0" } },
      a.title ? n.createElement("div", { style: { fontWeight: 600, marginBottom: 8 } }, Y(a.title)) : null,
      ...(e.children || []).map((h, y) => n.createElement(Ft(n), { key: h.nodeId || y, node: h })),
      n.createElement(r.Button || "button", { type: "primary", size: "small", style: { marginTop: 8 }, onClick: p }, Y(a.submitLabel) || "提交"),
      i ? n.createElement("div", { role: "status", style: { marginTop: 6, fontSize: 12, color: i.ok ? Te.success : Te.error } }, i.message) : null
    )
  );
}
function vc({ node: e, fieldType: t }) {
  var f, E, v;
  const n = (f = window.QwenPaw) == null ? void 0 : f.host, r = n == null ? void 0 : n.React, a = (n == null ? void 0 : n.antd) || {};
  if (!r) return null;
  const l = e.props || {}, o = r.useContext(mr(r)), s = r.useContext(kn(r)), i = o || s, [c, d] = r.useState(l.value ?? l.checked ?? ""), u = Dt(e), m = l.value ?? l.checked ?? "", p = i ? ((E = i.values) == null ? void 0 : E[u]) ?? m : c, w = (g) => {
    const S = g != null && g.target ? t === "Switch" ? g.target.checked : g.target.value : g;
    i ? i.setValue(u, S) : d(S);
  }, h = (g) => r.createElement(
    "div",
    { style: { display: "flex", flexDirection: "column", gap: 4, margin: "4px 0" } },
    l.label && t !== "Switch" ? r.createElement("label", { style: { fontSize: 12, color: Te.muted } }, Y(l.label), l.required ? r.createElement("span", { style: { color: Te.error } }, " *") : null) : null,
    g,
    l.description ? r.createElement("span", { style: { fontSize: 11, color: Te.muted } }, Y(l.description)) : null
  ), y = Y(l.label) || Y(l.placeholder) || u;
  return t === "Input" ? h(r.createElement(a.Input || "input", { "aria-label": y, placeholder: Y(l.placeholder), value: p, onChange: w, size: "small" })) : t === "NumberInput" ? h(r.createElement(a.InputNumber || "input", { "aria-label": y, value: p, min: l.min, max: l.max, step: l.step, onChange: w, size: "small", style: { width: "100%" } })) : t === "Textarea" ? h(r.createElement(((v = a.Input) == null ? void 0 : v.TextArea) || "textarea", { "aria-label": y, placeholder: Y(l.placeholder), value: p, rows: lt(l.rows) || 3, onChange: w, style: { width: "100%" } })) : t === "Select" ? h(r.createElement(a.Select || "select", { "aria-label": y, placeholder: Y(l.placeholder), value: p || void 0, onChange: w, size: "small", style: { width: "100%" } }, Pt(l.options).map((g, S) => {
    var z;
    return r.createElement(((z = a.Select) == null ? void 0 : z.Option) || "option", { key: S, value: Y(typeof g == "object" ? g.value : g) }, Y(typeof g == "object" ? g.label : g));
  }))) : t === "Switch" ? r.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8 } }, r.createElement(a.Switch || "input", { type: "checkbox", checked: !!p, onChange: w, size: "small" }), r.createElement("span", null, Y(l.label))) : t === "Slider" ? h(r.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8 } }, r.createElement(a.Slider || "input", { type: "range", value: lt(p), min: l.min ?? 0, max: l.max ?? 100, step: l.step ?? 1, onChange: w, style: { flex: 1 } }), r.createElement("span", { style: { minWidth: 32, fontSize: 12 } }, Y(p)))) : t === "FileInput" ? r.createElement(
    "label",
    { style: { display: "inline-flex", alignItems: "center", gap: 8, cursor: "pointer" } },
    r.createElement("span", null, Y(l.label) || "选择文件"),
    r.createElement("input", { type: "file", multiple: ot(l.multiple), accept: Y(l.accept) || void 0, onChange: (g) => i == null ? void 0 : i.setValue(u, Array.from(g.target.files || []).map((S) => ({ name: S.name, size: S.size, type: S.type }))) })
  ) : null;
}
function Bn({ node: e, link: t = !1, toggle: n = !1 }) {
  var p;
  const r = (p = window.QwenPaw) == null ? void 0 : p.host, a = r == null ? void 0 : r.React, l = (r == null ? void 0 : r.antd) || {};
  if (!a) return null;
  const o = e.props || {}, s = a.useContext(mr(a)), [i, c] = a.useState(ot(o.checked)), [d, u] = a.useState(null), m = () => {
    n && c((w) => !w), o.action && typeof o.action == "object" ? u(Jn(o.action, { formValues: s == null ? void 0 : s.values, formId: s ? "form" : void 0 })) : t && typeof o.href == "string" && u(Jn({ type: "open_url", payload: { url: o.href } }));
  };
  return a.createElement(
    "span",
    { style: { display: "inline-flex", flexDirection: "column", gap: 3 } },
    a.createElement(l.Button || "button", { type: t ? "link" : (n ? i : Y(o.variant) === "primary") ? "primary" : "default", size: "small", disabled: ot(o.disabled), loading: ot(o.loading), onClick: m }, Y(o.label) || "Action"),
    d ? a.createElement("span", { role: "status", style: { fontSize: 11, color: d.ok ? Te.success : Te.error } }, d.message) : null
  );
}
let wa = null, rn = null;
function wc(e) {
  return rn && wa === e || (wa = e, rn = class extends e.Component {
    constructor(n) {
      super(n), this.state = { hasError: !1 };
    }
    static getDerivedStateFromError() {
      return { hasError: !0 };
    }
    componentDidUpdate(n) {
      n.node !== this.props.node && this.state.hasError && this.setState({ hasError: !1 });
    }
    componentDidCatch(n) {
      console.error("[ugsci.genui] Component error for kind '%s':", this.props.node.kind, n);
    }
    render() {
      return this.state.hasError ? e.createElement("div", {
        style: { padding: 8, border: "1px dashed var(--ant-color-error, #ff4d4f)", borderRadius: 8, fontSize: 12, color: Te.error, fontFamily: "monospace" }
      }, `Component error: ${this.props.node.kind}`) : this.props.children;
    }
  }), rn;
}
function Sc({ node: e }) {
  var i;
  const t = (i = window.QwenPaw) == null ? void 0 : i.host;
  if (!(t != null && t.React)) return null;
  const n = t.React, r = t.antd || {}, a = Ft(n), l = e.props || {}, o = e.children || [];
  return kc(n, r, e, l, o, () => o.map(
    (c, d) => n.createElement(a, { key: c.nodeId || d, node: c })
  ));
}
let an = null, Sa = null;
function Ft(e) {
  return an && Sa === e || (an = e.memo(Sc, (t, n) => t.node === n.node), Sa = e), an;
}
function xc({ node: e }) {
  var r;
  const t = (r = window.QwenPaw) == null ? void 0 : r.host;
  if (!(t != null && t.React)) return null;
  const n = t.React;
  return n.createElement(
    wc(n),
    { node: e },
    n.createElement(Ft(n), { node: e })
  );
}
function kc(e, t, n, r, a, l) {
  var o, s;
  switch (n.kind) {
    case "Stack":
      return e.createElement("div", { style: Ke("Stack", r) }, l());
    case "Row":
      return e.createElement("div", { style: Ke("Row", r) }, l());
    case "Grid":
      return e.createElement("div", { style: Ke("Grid", r) }, l());
    case "Spacer":
      return e.createElement("div", { style: Ke("Spacer", r) });
    case "ScrollArea":
      return e.createElement("div", { style: Ke("ScrollArea", r) }, l());
    case "AspectBox":
      return e.createElement("div", { style: Ke("AspectBox", r) }, l());
    case "Text":
      return e.createElement("div", { style: { fontSize: va[Y(r.size)] || va.base, color: Te[Y(r.color)] || Te.default, fontWeight: ot(r.bold) ? "bold" : "normal", lineHeight: 1.6 } }, Y(r.value));
    case "Heading": {
      const i = Cl(r.level), c = { 1: "24px", 2: "20px", 3: "18px", 4: "16px" };
      return e.createElement(`h${i}`, { style: { fontSize: c[i], fontWeight: "bold", margin: "4px 0" } }, Y(r.value));
    }
    case "Divider":
      return e.createElement(t.Divider || "hr", r.label ? { children: Y(r.label) } : {});
    case "Markdown": {
      const i = (o = window.QwenPaw) == null ? void 0 : o.host, c = i == null ? void 0 : i.ReactMarkdown;
      if (c) {
        const d = i != null && i.remarkGfm ? [i.remarkGfm] : [];
        return e.createElement(
          "div",
          { className: "qwenpaw-genui-markdown" },
          e.createElement(c, { children: Y(r.content || r.value), remarkPlugins: d })
        );
      }
      return e.createElement("div", { style: { whiteSpace: "pre-wrap", lineHeight: 1.6 } }, Y(r.content || r.value));
    }
    case "CodeBlock":
      return e.createElement("pre", { style: { padding: 12, background: "var(--ant-color-fill-tertiary, rgba(0,0,0,0.04))", borderRadius: 8, overflow: "auto", fontSize: 13, fontFamily: "monospace" } }, Y(r.code));
    case "SectionHeader":
      return e.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8, marginBottom: 8 } }, r.icon ? e.createElement("span", { style: { fontSize: 20 } }, Y(r.icon)) : null, e.createElement("div", null, e.createElement("div", { style: { fontSize: 16, fontWeight: 600 } }, Y(r.title)), r.subtitle ? e.createElement("div", { style: { fontSize: 12, color: Te.muted } }, Y(r.subtitle)) : null));
    case "KeyValueList": {
      const i = Pt(r.items);
      return e.createElement(
        "div",
        { style: { display: "flex", flexDirection: "column", gap: 4 } },
        ...i.map((c, d) => e.createElement(
          "div",
          { key: d, style: { display: "flex", justifyContent: "space-between", padding: "2px 0", borderBottom: d < i.length - 1 ? "1px solid var(--ant-color-border-secondary, #f0f0f0)" : "none" } },
          e.createElement("span", { style: { color: Te.muted, fontSize: 13 } }, Y(c.key)),
          e.createElement("span", { style: { fontWeight: 500, fontSize: 13 } }, Y(c.value))
        ))
      );
    }
    case "Badge":
      return e.createElement(t.Tag || "span", { color: Y(r.variant) || "default", children: Y(r.value) });
    case "Tag":
      return e.createElement(t.Tag || "span", { color: Y(r.color) || "default", children: Y(r.label) });
    case "Stat":
      return e.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 2 } }, e.createElement("span", { style: { fontSize: 12, color: Te.muted } }, Y(r.label)), e.createElement("span", { style: { fontSize: 20, fontWeight: "bold" } }, Y(r.value)), r.delta ? e.createElement("span", { style: { fontSize: 12, color: Y(r.trend) === "up" ? Te.success : Y(r.trend) === "down" ? Te.error : Te.muted } }, Y(r.delta)) : null);
    case "Progress":
      return e.createElement(t.Progress || "div", { percent: lt(r.value), size: "small" });
    case "Skeleton": {
      const i = lt(r.rows) || 3;
      return e.createElement(
        "div",
        { style: { display: "flex", flexDirection: "column", gap: 8 } },
        ...Array.from({ length: i }).map(
          (c, d) => e.createElement(t.Skeleton || "div", { key: d, active: ot(r.active), title: !1, paragraph: { rows: 1 } })
        )
      );
    }
    case "Avatar":
      return e.createElement(Tc, {
        src: Y(r.src),
        name: Y(r.name),
        size: lt(r.size) || 32
      });
    case "Icon": {
      const i = _l(r.name), c = lt(r.size) || 16, d = Te[Y(r.color)] || Te.default;
      return i.kind === "emoji" ? e.createElement("span", { "aria-hidden": !0, style: { fontSize: c, color: d, lineHeight: 1 } }, i.text) : i.kind === "svg" ? e.createElement("svg", {
        width: c,
        height: c,
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: d,
        strokeWidth: 2,
        strokeLinecap: "round",
        strokeLinejoin: "round",
        "aria-hidden": !0,
        focusable: "false",
        style: { display: "inline-block", verticalAlign: "middle" }
      }, ...i.paths.map((u, m) => e.createElement("path", { key: m, d: u }))) : e.createElement("span", { "aria-hidden": !0, style: { width: c, height: c, display: "inline-block" } });
    }
    case "Card":
      return e.createElement(t.Card || "div", { title: r.title ? Y(r.title) : void 0, size: "small", style: { margin: "4px 0" } }, l());
    case "DataCard":
      return e.createElement(t.Card || "div", { size: "small", style: { margin: "4px 0" } }, e.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center" } }, e.createElement("div", null, e.createElement("div", { style: { fontSize: 12, color: Te.muted } }, Y(r.title)), e.createElement("div", { style: { fontSize: 24, fontWeight: "bold" } }, Y(r.value))), r.icon ? e.createElement("span", { style: { fontSize: 32 } }, Y(r.icon)) : null));
    case "MetricCard":
      return e.createElement(t.Card || "div", { size: "small", style: { margin: "4px 0" } }, e.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center" } }, e.createElement("div", null, e.createElement("div", { style: { fontSize: 12, color: Te.muted } }, Y(r.title)), e.createElement("div", { style: { fontSize: 24, fontWeight: "bold" } }, Y(r.value)), r.delta ? e.createElement("span", { style: { fontSize: 12, color: Y(r.trend) === "up" ? Te.success : Y(r.trend) === "down" ? Te.error : Te.muted } }, `${Y(r.delta)} ${r.period ? Y(r.period) : ""}`.trim()) : null), r.icon ? e.createElement("span", { style: { fontSize: 32 } }, Y(r.icon)) : null));
    case "AlertCard":
    case "Alert":
      return e.createElement(t.Alert || "div", { type: Y(r.severity) === "success" ? "success" : Y(r.severity) === "warning" ? "warning" : Y(r.severity) === "error" ? "error" : "info", message: r.title ? Y(r.title) : void 0, description: Y(r.message), showIcon: !0, style: { margin: "4px 0" } });
    case "Callout":
      return e.createElement(t.Alert || "div", { type: Y(r.variant) === "tip" ? "success" : Y(r.variant) === "warning" ? "warning" : Y(r.variant) === "important" ? "error" : "info", message: r.title ? Y(r.title) : void 0, description: Y(r.message), showIcon: !0 });
    case "TimelineCard":
      return e.createElement(t.Card || "div", { size: "small", style: { margin: "4px 0" } }, e.createElement("div", { style: { display: "flex", gap: 8, alignItems: "flex-start" } }, e.createElement("div", { style: { width: 8, height: 8, borderRadius: "50%", background: Y(r.status) === "done" ? Te.success : Y(r.status) === "pending" ? Te.warning : Te.primary, marginTop: 4, flexShrink: 0 } }), e.createElement("div", null, e.createElement("div", { style: { fontWeight: 600 } }, Y(r.title)), r.date ? e.createElement("div", { style: { fontSize: 12, color: Te.muted } }, Y(r.date)) : null, r.description ? e.createElement("div", { style: { fontSize: 13, marginTop: 4 } }, Y(r.description)) : null)));
    case "KpiBoard":
      return e.createElement("div", { style: { margin: "4px 0" } }, r.title ? e.createElement("div", { style: { fontSize: 16, fontWeight: 600, marginBottom: 8 } }, Y(r.title)) : null, e.createElement("div", { style: Ke("KpiBoard", r) }, l()));
    case "FeatureGrid":
      return e.createElement("div", { style: { ...Ke("FeatureGrid", r), margin: "4px 0" } }, l());
    case "Stepper": {
      const i = Pt(r.steps).map((d) => Y(d)), c = lt(r.current);
      return e.createElement(
        t.Steps || "div",
        { current: c, size: "small", style: { margin: "4px 0" } },
        ...i.map((d, u) => {
          var m;
          return e.createElement(((m = t.Steps) == null ? void 0 : m.Item) || "div", { key: u, title: d });
        })
      );
    }
    case "Table": {
      const i = Pt(r.headers).map((m) => Y(m)), d = a.filter((m) => m.kind === "TableRow").map((m, p) => {
        const w = (m.children || []).filter((y) => y.kind === "TableCell"), h = { key: p };
        return i.forEach((y, f) => {
          var v, g;
          const E = (g = (v = w[f]) == null ? void 0 : v.props) == null ? void 0 : g.value;
          h[y] = E == null ? "" : Y(E);
        }), h;
      }), u = i.map((m) => ({ title: m, dataIndex: m, key: m }));
      return e.createElement(t.Table || "table", { dataSource: d, columns: u, size: ot(r.compact) ? "small" : "middle", pagination: !1, style: { margin: "4px 0" } });
    }
    case "List": {
      const i = a.filter((c) => c.kind === "ListItem");
      return e.createElement(
        t.List || "ul",
        { size: "small", style: { margin: "4px 0" } },
        i.map((c, d) => {
          var u, m, p;
          return e.createElement(((u = t.List) == null ? void 0 : u.Item) || "li", { key: d }, (m = c.props) != null && m.icon ? e.createElement("span", { style: { marginRight: 6 } }, Y(c.props.icon)) : null, Y((p = c.props) == null ? void 0 : p.value));
        })
      );
    }
    case "ImageGallery": {
      const i = a.filter((c) => c.kind === "Image");
      return e.createElement(
        "div",
        { style: { ...Ke("ImageGallery", r), margin: "4px 0" } },
        ...i.map((c, d) => {
          const u = c.props || {};
          return e.createElement(Kn, { key: d, src: Y(u.src), alt: Y(u.alt), style: { width: "100%", height: 120, objectFit: "cover", borderRadius: 8, cursor: "pointer" } });
        })
      );
    }
    case "Image":
      return e.createElement("div", null, e.createElement(Kn, { src: Y(r.src), alt: Y(r.alt), style: { maxWidth: "100%", borderRadius: ot(r.rounded) ? "8px" : void 0, maxHeight: r.maxHeight ? `${lt(r.maxHeight)}px` : void 0 } }), r.caption ? e.createElement("div", { style: { fontSize: 12, color: Te.muted } }, Y(r.caption)) : null);
    case "Chart":
      return e.createElement(Cc, { props: r });
    case "Button":
    case "InteractiveButton":
      return e.createElement(Bn, { node: n });
    case "ToggleButton":
      return e.createElement(Bn, { node: n, toggle: !0 });
    case "LinkButton":
      return e.createElement(Bn, { node: n, link: !0 });
    case "Input":
    case "NumberInput":
    case "Select":
    case "Textarea":
    case "Switch":
    case "Slider":
    case "FileInput":
      return e.createElement(vc, { node: n, fieldType: n.kind });
    case "Form":
      return e.createElement(bc, { node: n });
    case "Chip":
      return e.createElement(t.Tag || "span", { color: Y(r.color) || "default", closable: !0, onClose: () => {
      }, children: Y(r.label) });
    case "ChipGroup": {
      const i = Pt(r.items);
      return e.createElement("div", { style: { display: "flex", flexWrap: "wrap", gap: 4 } }, ...i.map((c, d) => e.createElement(t.Tag || "span", { key: d }, Y(c))));
    }
    case "Tabs": {
      const i = Ft(e), d = a.filter((u) => u.kind === "TabItem").map((u) => {
        var m, p, w;
        return {
          key: Y((m = u.props) == null ? void 0 : m.key) || Y((p = u.props) == null ? void 0 : p.tab),
          label: Y((w = u.props) == null ? void 0 : w.tab),
          children: (u.children || []).map((h, y) => e.createElement(i, { key: h.nodeId || y, node: h }))
        };
      });
      return t.Tabs ? e.createElement(t.Tabs, { items: d, defaultActiveKey: Y(r.activeKey) || ((s = d[0]) == null ? void 0 : s.key) }) : e.createElement("div", null, ...d.map((u, m) => e.createElement("div", { key: m }, e.createElement("div", { style: { fontWeight: 600, marginBottom: 4 } }, u.label), u.children)));
    }
    case "TabItem":
      return e.createElement("div", null, l());
    case "Accordion": {
      const i = Ft(e), c = a.filter((d) => d.kind === "AccordionItem");
      if (t.Collapse) {
        const d = c.map((u) => {
          var m, p, w;
          return {
            key: Y((m = u.props) == null ? void 0 : m.key) || Y((p = u.props) == null ? void 0 : p.header),
            label: Y((w = u.props) == null ? void 0 : w.header),
            children: (u.children || []).map((h, y) => e.createElement(i, { key: h.nodeId || y, node: h }))
          };
        });
        return e.createElement(t.Collapse, { items: d });
      }
      return e.createElement("div", null, ...c.map((d, u) => {
        var m;
        return e.createElement("details", { key: u }, e.createElement("summary", { style: { fontWeight: 600, cursor: "pointer", padding: "4px 0" } }, Y((m = d.props) == null ? void 0 : m.header)), e.createElement("div", { style: { paddingLeft: 12 } }, (d.children || []).map((p, w) => e.createElement(i, { key: p.nodeId || w, node: p }))));
      }));
    }
    case "AccordionItem":
      return e.createElement("div", null, l());
    case "JsonDebug":
      return e.createElement("details", { style: { margin: "4px 0", fontSize: 12 } }, e.createElement("summary", null, Y(r.label) || "Debug JSON"), e.createElement("pre", { style: { fontSize: 12, padding: 8, background: "var(--ant-color-fill-tertiary, rgba(0,0,0,0.04))", borderRadius: 4, overflow: "auto" } }, JSON.stringify(r.data ?? r, null, 2)));
    default:
      return e.createElement("div", { style: { padding: 8, border: "1px dashed var(--ant-color-border, #d9d9d9)", borderRadius: 8, fontSize: 12, color: Te.muted, fontFamily: "monospace" } }, `Unknown component: ${n.kind}`);
  }
}
function Cc({ props: e }) {
  var z, V;
  const t = (V = (z = window.QwenPaw) == null ? void 0 : z.host) == null ? void 0 : V.React;
  if (!t) return null;
  const n = t.useContext(kn(t)), r = ur(e, n == null ? void 0 : n.values), a = r.chartType, l = r.title, o = r.categories, s = r.series, i = r.height, c = r.showLegend, d = 400;
  if (r.empty)
    return t.createElement("div", { style: { padding: 12, color: Te.muted, fontSize: 12 } }, "Chart: no data");
  if (a === "pie") {
    const I = s[0].values.map((_) => Math.abs(_)), $ = I.reduce((_, T) => _ + T, 0) || 1, J = d / 2, F = i / 2, B = Math.min(d, i) / 2 - 20;
    let C = -Math.PI / 2;
    const x = I.map((_, T) => {
      const W = _ / $ * 2 * Math.PI, N = J + B * Math.cos(C), G = F + B * Math.sin(C), U = J + B * Math.cos(C + W), A = F + B * Math.sin(C + W), ee = W > Math.PI ? 1 : 0, ae = `M ${J} ${F} L ${N} ${G} A ${B} ${B} 0 ${ee} 1 ${U} ${A} Z`;
      return C += W, { path: ae, color: yt[T % yt.length], label: o[T] || `#${T + 1}`, val: _ };
    });
    return t.createElement(
      "div",
      { style: { margin: "4px 0" } },
      l ? t.createElement("div", { style: { fontSize: 13, fontWeight: 600, marginBottom: 4 } }, l) : null,
      t.createElement(
        "svg",
        { width: d, height: i, style: { maxWidth: "100%" } },
        ...x.map((_, T) => t.createElement("path", { key: T, d: _.path, fill: _.color, stroke: "#fff", strokeWidth: 1 }))
      ),
      c ? t.createElement(
        "div",
        { style: { display: "flex", flexWrap: "wrap", gap: 8, marginTop: 4, fontSize: 11 } },
        ...x.map((_, T) => t.createElement(
          "span",
          { key: T, style: { display: "flex", alignItems: "center", gap: 4 } },
          t.createElement("span", { style: { display: "inline-block", width: 10, height: 10, borderRadius: 2, background: _.color } }),
          `${_.label}: ${_.val}`
        ))
      ) : null
    );
  }
  const u = s.flatMap((I) => I.values), m = Math.max(...u, 0), p = Math.min(...u, 0), w = m - p || 1, h = o.length > 0 ? (d - 40) / o.length : 0, y = s.length > 0 ? Math.max(1, h / s.length - 2) : 0, f = o.length > 1 ? (d - 40) / (o.length - 1) : 0, E = Math.max(1, Math.ceil(o.length / 8)), v = (I) => i - 20 - (I - p) / w * (i - 40), g = v(0), S = (I) => 30 + I * f;
  return t.createElement(
    "div",
    { style: { margin: "4px 0" } },
    l ? t.createElement("div", { style: { fontSize: 13, fontWeight: 600, marginBottom: 4 } }, l) : null,
    t.createElement(
      "svg",
      { width: d, height: i, style: { maxWidth: "100%" } },
      ...[0, 0.25, 0.5, 0.75, 1].map((I, $) => {
        const J = i - 20 - I * (i - 40);
        return t.createElement("line", { key: `g${$}`, x1: 30, y1: J, x2: d - 10, y2: J, stroke: "var(--ant-color-border-secondary, #f0f0f0)", strokeWidth: 1 });
      }),
      ...o.map((I, $) => $ % E === 0 || $ === o.length - 1 ? t.createElement("text", { key: `x${$}`, x: S($), y: i - 6, fontSize: 10, fill: Te.muted, textAnchor: "middle" }, I.length > 6 ? I.slice(0, 6) + "…" : I) : null),
      ...s.map((I, $) => {
        const J = yt[$ % yt.length];
        if (a === "bar")
          return I.values.map((C, x) => t.createElement("rect", {
            key: `b${$}-${x}`,
            x: 30 + x * h + $ * (y + 2) + 1,
            y: Math.min(v(C), g),
            width: y,
            height: Math.abs(g - v(C)),
            fill: J,
            rx: 2
          }));
        const F = I.values.map((C, x) => `${S(x)},${v(C)}`).join(" "), B = [t.createElement("polyline", { key: `l${$}`, points: F, fill: "none", stroke: J, strokeWidth: 2 })];
        if (a === "area") {
          const C = `${S(0)},${i - 20} ${F} ${S(I.values.length - 1)},${i - 20}`;
          B.unshift(t.createElement("polygon", { key: `a${$}`, points: C, fill: J, opacity: 0.15 }));
        }
        return B;
      })
    ),
    c ? t.createElement(
      "div",
      { style: { display: "flex", flexWrap: "wrap", gap: 8, marginTop: 4, fontSize: 11 } },
      ...s.map((I, $) => t.createElement(
        "span",
        { key: $, style: { display: "flex", alignItems: "center", gap: 4 } },
        t.createElement("span", { style: { display: "inline-block", width: 10, height: 10, borderRadius: 2, background: yt[$ % yt.length] } }),
        I.name
      ))
    ) : null
  );
}
function Kn(e) {
  var c;
  const t = (c = window.QwenPaw) == null ? void 0 : c.host, n = t == null ? void 0 : t.React;
  if (!n) return null;
  const { useState: r, useEffect: a } = n, [l, o] = r(
    Ea(e.src) || (fn(e.src) ? e.src : null)
  ), [s, i] = r(
    ba(e.src)
  );
  return a(() => {
    if (!e.src) return;
    if (fn(e.src)) {
      o(e.src), i(null);
      return;
    }
    const d = Ea(e.src);
    if (d) {
      o(d), i(null);
      return;
    }
    o(null), i(null);
    let u = !1;
    return ac(e.src).then((m) => {
      u || (o(m), i(m ? null : ba(e.src)));
    }), () => {
      u = !0;
    };
  }, [e.src]), l ? n.createElement("img", {
    src: l,
    alt: e.alt || "",
    "data-genui-media-source": e.src,
    style: e.style || {},
    onError: () => {
      console.warn("[ugsci.genui] Image failed to load:", e.src);
    }
  }) : n.createElement(
    "div",
    {
      role: s ? "alert" : "status",
      style: {
        ...e.style || {},
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: 80,
        padding: 12,
        textAlign: "center",
        color: s ? Te.error : Te.muted,
        fontSize: 12,
        background: "var(--ant-color-fill-tertiary, rgba(0,0,0,0.04))",
        borderRadius: 8
      }
    },
    s ? `媒体加载失败：${s}` : "正在解析图片…"
  );
}
function Tc(e) {
  var a, l, o;
  const t = (a = window.QwenPaw) == null ? void 0 : a.host, n = t == null ? void 0 : t.React, r = (t == null ? void 0 : t.antd) || {};
  return n ? e.src ? n.createElement(Kn, {
    src: e.src,
    alt: e.name,
    style: {
      width: e.size,
      height: e.size,
      borderRadius: "50%",
      objectFit: "cover"
    }
  }) : n.createElement(
    r.Avatar || "div",
    { size: e.size },
    ((o = (l = e.name) == null ? void 0 : l.charAt(0)) == null ? void 0 : o.toUpperCase()) || ""
  ) : null;
}
const _c = `#genui-root { max-width: 960px; margin: auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px; background: #fff; box-shadow: 0 8px 30px rgba(0,0,0,.05); }
.stack { display: flex; flex-direction: column; gap: 12px; } .row { display: flex; gap: 12px; align-items: center; } .grid { display: grid; gap: 12px; }
.card { padding: 14px; border: 1px solid #e5e7eb; border-radius: 10px; } .card-title,.chart-title { margin-bottom: 8px; font-weight: 600; } .card-subtitle { margin-top: -5px; margin-bottom: 8px; }
.field { display: flex; flex-direction: column; gap: 5px; margin: 5px 0; } .field-label,.description { color: #667085; font-size: 12px; }
input,select,textarea,button { font: inherit; } input:not([type=range]):not([type=checkbox]),select,textarea { width: 100%; padding: 7px 9px; border: 1px solid #d0d5dd; border-radius: 6px; }
input[type=range] { flex: 1; accent-color: #1677ff; } .slider-line,.switch-line { display: flex; align-items: center; gap: 10px; } .slider-value { min-width: 42px; font-size: 12px; }
button { padding: 6px 12px; border: 1px solid #d0d5dd; border-radius: 6px; background: #fff; cursor: pointer; } button.active,.button:hover { color: #1677ff; border-color: #1677ff; }
.tabs { margin: 6px 0; } .tab-buttons { display: flex; gap: 4px; border-bottom: 1px solid #e5e7eb; } .tab-buttons button { border: 0; border-radius: 0; } .tab-buttons button.active { border-bottom: 2px solid #1677ff; } .tab-panel { padding: 12px 2px; } .hidden { display: none; }
details { border-bottom: 1px solid #e5e7eb; } summary { padding: 9px 0; cursor: pointer; font-weight: 600; } .accordion-body { padding: 0 0 10px 12px; }
.chart svg { display: block; width: 100%; height: auto; min-height: 180px; } .legend { display: flex; flex-wrap: wrap; gap: 10px; font-size: 12px; } .legend span { display: flex; align-items: center; gap: 4px; } .legend i { width: 10px; height: 10px; border-radius: 2px; }
.tag { display: inline-block; padding: 2px 8px; border-radius: 999px; background: #f0f5ff; color: #1677ff; } .alert { padding: 10px 12px; border: 1px solid #91caff; border-radius: 8px; background: #e6f4ff; }
.code { padding: 12px; overflow: auto; border-radius: 8px; background: #f2f4f7; } .divider { display: flex; align-items: center; margin: 10px 0; border-top: 1px solid #e5e7eb; } .divider span { padding-right: 8px; background: white; transform: translateY(-50%); }
figure { margin: 0; } img { max-width: 100%; } .bold { font-weight: 700; } .muted { color: #667085; } .small { font-size: 12px; } .display-value,.stat-value { font-size: 24px; font-weight: 700; } .offline-status { display: block; margin-top: 5px; color: #b54708; }
.image-gallery { display: grid; gap: 8px; } .avatar { width: 48px; height: 48px; border-radius: 50%; object-fit: cover; display: inline-flex; align-items: center; justify-content: center; } .avatar-fallback { background: #e6f4ff; color: #1677ff; font-weight: 700; }
.icon { display: inline-flex; align-items: center; justify-content: center; } .icon svg { display: block; }
.media-unavailable { min-height: 96px; display: flex; align-items: center; justify-content: center; padding: 12px; border: 1px dashed #f79009; border-radius: 8px; color: #b54708; background: #fffaeb; }
.metric-card { display: flex; justify-content: space-between; align-items: center; } .metric-icon,.section-icon { font-size: 28px; } .section-header { display: flex; align-items: center; gap: 8px; } .profile { display: flex; gap: 12px; align-items: center; }
.key-values { display: grid; grid-template-columns: minmax(100px, 1fr) minmax(120px, 2fr); gap: 5px 12px; margin: 0; } .key-values dt { color: #667085; } .key-values dd { margin: 0; font-weight: 500; text-align: right; }
.data-table { width: 100%; border-collapse: collapse; } .data-table th,.data-table td { padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: left; } .data-table .highlight { background: #f0f5ff; }
.chips { display: flex; flex-wrap: wrap; gap: 4px; } .skeletons { display: flex; flex-direction: column; gap: 8px; } .skeleton { height: 12px; border-radius: 6px; background: #eaecf0; } .scroll-area { overflow-y: auto; } .aspect-box { overflow: hidden; display: flex; align-items: center; justify-content: center; }
.unknown-component { padding: 8px; border: 1px dashed #d0d5dd; border-radius: 8px; color: #667085; font: 12px ui-monospace, monospace; }
@media print { body { padding: 0; } }`, xa = {
  Stack: "stack",
  Row: "row",
  Grid: "grid",
  Card: "card",
  Alert: "alert",
  AlertCard: "alert",
  Callout: "alert",
  FeatureGrid: "grid",
  ScrollArea: "scroll-area",
  AspectBox: "aspect-box",
  Form: "stack form",
  KpiBoard: "stack"
};
function Ic(e) {
  return e.replace(/[&<>"']/g, (t) => t === "&" ? "&amp;" : t === "<" ? "&lt;" : t === ">" ? "&gt;" : t === '"' ? "&quot;" : "&#39;");
}
function Ac(e) {
  return JSON.stringify(e).replace(/</g, "\\u003c");
}
function Q(e, t = "", n) {
  const r = document.createElement(e);
  return t && (r.className = t), n != null && n !== "" && (r.textContent = Ee(n)), r;
}
function ln(e, t) {
  Object.assign(e.style, t);
}
function At(e, t, n) {
  for (const r of t || []) e.appendChild(pr(r, n));
  return e;
}
function ka(e, t, n) {
  return t && e.appendChild(Q("div", "muted small", t)), e.appendChild(Q("div", "display-value", n)), e;
}
function Al(e, t, n, r) {
  const a = Ee(e);
  if (r.missing.has(a)) {
    const o = Q("div", `media-unavailable ${n}`.trim(), "此媒体未能离线嵌入");
    return o.setAttribute("role", "img"), o.setAttribute("aria-label", Ee(t)), o;
  }
  const l = Q("img", n);
  return l.src = r.media[a] || a, l.alt = Ee(t), l;
}
function zc(e, t, n) {
  return e ? Al(e, t, "avatar", n) : Q("span", "avatar avatar-fallback", Ee(t).charAt(0).toUpperCase());
}
function $c(e) {
  const t = Q("div", "markdown");
  let n = null;
  for (const r of Ee(e).split(/\r?\n/)) {
    const a = r.match(/^(#{1,4})\s+(.*)$/), l = r.match(/^\s*[-*]\s+(.*)$/);
    a ? (n = null, t.appendChild(Q(`h${a[1].length}`, "", a[2]))) : l ? (n || (n = Q("ul"), t.appendChild(n)), n.appendChild(Q("li", "", l[1]))) : r.trim() ? (n = null, t.appendChild(Q("p", "", r))) : (n = null, t.appendChild(document.createElement("br")));
  }
  return t;
}
function Pc(e, t) {
  const n = e.props || {}, r = e.kind, a = Dt(e), l = Q("label", "field");
  n.label && r !== "Switch" && l.appendChild(Q("span", "field-label", `${Ee(n.label)}${n.required ? " *" : ""}`));
  let o;
  if (r === "Textarea") {
    const i = Q("textarea");
    i.rows = Xe(n.rows) || 3, i.placeholder = Ee(n.placeholder), o = i;
  } else if (r === "Select") {
    const i = Q("select");
    for (const c of $t(n.options)) {
      const d = Q("option"), u = c && typeof c == "object" ? c : null;
      d.value = Ee(u ? u.value : c), d.textContent = Ee(u ? u.label : c), i.appendChild(d);
    }
    o = i;
  } else {
    const i = Q("input");
    i.type = r === "Slider" ? "range" : r === "Switch" ? "checkbox" : r === "NumberInput" ? "number" : r === "FileInput" ? "file" : "text", n.min != null && (i.min = Ee(n.min)), n.max != null && (i.max = Ee(n.max)), n.step != null && (i.step = Ee(n.step)), r === "FileInput" ? (n.accept && (i.accept = Ee(n.accept)), i.multiple = Bt(n.multiple)) : i.placeholder = Ee(n.placeholder), o = i;
  }
  const s = Object.prototype.hasOwnProperty.call(t.values, a) ? t.values[a] : n.value != null ? n.value : n.checked != null ? n.checked : "";
  if (r === "Switch") {
    const i = o;
    i.checked = Bt(s), i.checked ? i.setAttribute("checked", "") : i.removeAttribute("checked");
  } else if (r === "Textarea")
    o.value = Ee(s), o.textContent = Ee(s);
  else if (r === "Select") {
    const i = Ee(s);
    o.value = i;
    for (const c of Array.from(o.options))
      c.value === i ? c.setAttribute("selected", "") : c.removeAttribute("selected");
  } else r !== "FileInput" && (o.value = Ee(s), o.setAttribute("value", Ee(s)));
  if (o.setAttribute("data-genui-field", a), o.setAttribute("data-genui-kind", r), r === "Switch") {
    const i = Q("span", "switch-line");
    i.append(o, Q("span", "", n.label)), l.appendChild(i);
  } else if (r === "Slider") {
    const i = Q("span", "slider-line");
    i.append(o, Q("output", "slider-value", s)), l.appendChild(i);
  } else
    l.appendChild(o);
  return n.description && l.appendChild(Q("small", "description", n.description)), l;
}
function pr(e, t) {
  var l, o, s, i, c, d, u;
  if (!e || typeof e != "object") return Q("div");
  const n = e.props || {}, r = e.children || [];
  if (kl(e.kind)) return Pc(e, t);
  if (e.kind === "Chart") {
    const m = Q("div", "chart");
    return m.setAttribute("data-genui-chart", JSON.stringify(n)), Tl(m, ur(n, t.values)), m;
  }
  if (e.kind === "Heading") return Q(`h${Cl(n.level)}`, "", n.value);
  if (e.kind === "Text") return Q("div", Bt(n.bold) ? "text bold" : "text", n.value);
  if (e.kind === "Markdown") return $c(n.content || n.value);
  if (e.kind === "CodeBlock") return Q("pre", "code", n.code);
  if (e.kind === "SectionHeader") {
    const m = Q("div", "section-header");
    n.icon && m.appendChild(Q("span", "section-icon", n.icon));
    const p = Q("div");
    return p.appendChild(Q("strong", "", n.title)), n.subtitle && p.appendChild(Q("div", "muted small", n.subtitle)), m.appendChild(p), m;
  }
  if (e.kind === "KeyValueList") {
    const m = Q("dl", "key-values");
    for (const p of $t(n.items)) {
      const w = p && typeof p == "object" ? p : {};
      m.append(Q("dt", "", w.key), Q("dd", "", w.value));
    }
    return m;
  }
  if (e.kind === "Divider") {
    const m = Q("div", "divider");
    return n.label && m.appendChild(Q("span", "", n.label)), m;
  }
  if (e.kind === "Spacer") {
    const m = Q("div");
    return ln(m, Ke("Spacer", n)), m;
  }
  if (e.kind === "Tabs") {
    const m = Q("div", "tabs");
    m.setAttribute("data-genui-tabs", "1");
    const p = Q("div", "tab-buttons"), w = Q("div");
    return r.filter((y) => y.kind === "TabItem").forEach((y, f) => {
      var E;
      p.appendChild(Q("button", f ? "" : "active", (E = y.props) == null ? void 0 : E.tab)), w.appendChild(At(Q("div", f ? "tab-panel hidden" : "tab-panel"), y.children, t));
    }), m.append(p, w), m;
  }
  if (e.kind === "Accordion") {
    const m = Q("div");
    for (const p of r.filter((w) => w.kind === "AccordionItem")) {
      const w = Q("details");
      w.append(Q("summary", "", (l = p.props) == null ? void 0 : l.header), At(Q("div", "accordion-body"), p.children, t)), m.appendChild(w);
    }
    return m;
  }
  if (e.kind === "Form") {
    const m = Q("div", "stack form");
    n.title && m.appendChild(Q("div", "card-title", n.title)), At(m, r, t);
    const p = Q("button", "button", Ee(n.submitLabel) || "提交");
    return p.setAttribute("data-genui-submit", "1"), m.appendChild(p), m;
  }
  if (sc.has(e.kind)) {
    const m = Q("button", e.kind === "LinkButton" ? "link-button" : "button", Ee(n.label) || "Action");
    return Bt(n.disabled) && (m.disabled = !0), m.setAttribute("data-genui-action", e.kind), e.kind === "LinkButton" && uc(n.href) && m.setAttribute("data-genui-href", Ee(n.href).trim()), m;
  }
  if (e.kind === "Image") {
    const m = Q("figure");
    return m.appendChild(Al(n.src, n.alt, "", t)), n.caption && m.appendChild(Q("figcaption", "", n.caption)), m;
  }
  if (e.kind === "ImageGallery") {
    const m = Q("div", "image-gallery");
    ln(m, Ke("ImageGallery", n));
    for (const p of r.filter((w) => w.kind === "Image"))
      m.appendChild(pr(p, t));
    return m;
  }
  if (e.kind === "Avatar") return zc(n.src, n.name, t);
  if (e.kind === "Badge" || e.kind === "Tag" || e.kind === "Chip")
    return Q("span", "tag", n.value || n.label);
  if (e.kind === "Progress") {
    const m = Q("progress");
    return m.max = 100, m.value = Xe(n.value), m;
  }
  if (e.kind === "Stat") {
    const m = Q("div", "stat");
    return m.append(Q("span", "muted small", n.label), Q("strong", "stat-value", n.value)), n.delta && m.appendChild(Q("span", `small trend-${Ee(n.trend)}`, n.delta)), m;
  }
  if (e.kind === "DataCard" || e.kind === "MetricCard") {
    const m = Q("div", "card metric-card"), p = ka(Q("div"), n.title, n.value);
    return n.delta && p.appendChild(Q("div", `small trend-${Ee(n.trend)}`, `${Ee(n.delta)}${n.period ? ` ${Ee(n.period)}` : ""}`)), m.appendChild(p), n.icon && m.appendChild(Q("span", "metric-icon", n.icon)), m;
  }
  if (e.kind === "TimelineCard") {
    const m = Q("div", "card timeline");
    return m.append(Q("i", `timeline-dot status-${Ee(n.status)}`), ka(Q("div"), n.title, n.date)), n.description && m.appendChild(Q("div", "small", n.description)), m;
  }
  if (e.kind === "Stepper") {
    const m = Q("ol", "stepper");
    return $t(n.steps).forEach((p, w) => {
      m.appendChild(Q("li", w <= Xe(n.current) ? "active" : "", p));
    }), m;
  }
  if (e.kind === "Table") {
    const m = Q("table", "data-table"), p = Q("thead"), w = Q("tr");
    for (const y of $t(n.headers)) w.appendChild(Q("th", "", y));
    p.appendChild(w);
    const h = Q("tbody");
    for (const y of r.filter((f) => f.kind === "TableRow")) {
      const f = Q("tr", (o = y.props) != null && o.highlight ? "highlight" : "");
      for (const E of (y.children || []).filter((v) => v.kind === "TableCell")) {
        const v = Q("td", (s = E.props) != null && s.bold ? "bold" : "", (i = E.props) == null ? void 0 : i.value);
        (c = E.props) != null && c.align && (v.style.textAlign = Ee(E.props.align)), f.appendChild(v);
      }
      h.appendChild(f);
    }
    return m.append(p, h), m;
  }
  if (e.kind === "List") {
    const m = Q(Bt(n.ordered) ? "ol" : "ul", "data-list");
    for (const p of r.filter((w) => w.kind === "ListItem"))
      m.appendChild(Q("li", "", `${(d = p.props) != null && d.icon ? `${Ee(p.props.icon)} ` : ""}${Ee((u = p.props) == null ? void 0 : u.value)}`));
    return m;
  }
  if (e.kind === "ChipGroup") {
    const m = Q("div", "chips");
    for (const p of $t(n.items)) m.appendChild(Q("span", "tag", p));
    return m;
  }
  if (e.kind === "Skeleton") {
    const m = Q("div", "skeletons");
    for (let p = 0; p < (Xe(n.rows) || 3); p += 1) m.appendChild(Q("i", "skeleton"));
    return m;
  }
  if (e.kind === "Icon") {
    const m = Q("span", "icon");
    return fc(m, n.name, { size: Xe(n.size) || 16 }), m;
  }
  if (e.kind === "JsonDebug") {
    const m = Q("details");
    return m.append(
      Q("summary", "", Ee(n.label) || "Debug JSON"),
      Q("pre", "code", JSON.stringify(n.data == null ? n : n.data, null, 2))
    ), m;
  }
  if (e.kind === "KpiBoard") {
    const m = Q("div", "stack");
    n.title && m.appendChild(Q("div", "card-title", n.title));
    const p = Q("div", "grid");
    return ln(p, Ke("KpiBoard", n)), At(p, r, t), m.appendChild(p), m;
  }
  if (!Object.prototype.hasOwnProperty.call(xa, e.kind))
    return Q("div", "unknown-component", `Unknown component: ${Ee(e.kind)}`);
  const a = Q("div", xa[e.kind]);
  return ln(a, Ke(e.kind, n)), e.kind === "Card" && n.title && a.appendChild(Q("div", "card-title", n.title)), e.kind === "Card" && n.subtitle && a.appendChild(Q("div", "muted small card-subtitle", n.subtitle)), (e.kind === "Alert" || e.kind === "AlertCard" || e.kind === "Callout") && (n.title || n.message) ? (n.title && a.appendChild(Q("strong", "", n.title)), n.message && a.appendChild(Q("div", "", n.message))) : At(a, r, t), a;
}
function Ca(e, t) {
  const n = Function.prototype.toString.call(e).replace(/^export\s+/, "").trim();
  if (!n.includes("{")) throw new Error(`cannot serialize ${t}`);
  return `var ${t} = (${n});`;
}
function Rc() {
  return `(function () {
  "use strict";
  ${Ca(ur, "resolveChartModel")}
  ${Ca(Tl, "paintChartElement")}
  var values = JSON.parse(document.getElementById("genui-values-data").textContent || "{}");
  function refreshCharts() {
    document.querySelectorAll("[data-genui-chart]").forEach(function (holder) {
      var props = JSON.parse(holder.getAttribute("data-genui-chart") || "{}");
      paintChartElement(holder, resolveChartModel(props, values));
    });
  }
  document.querySelectorAll("[data-genui-field]").forEach(function (control) {
    var name = control.getAttribute("data-genui-field");
    var kind = control.getAttribute("data-genui-kind");
    var output = control.parentElement && control.parentElement.querySelector("output");
    var update = function () {
      if (kind === "Switch") values[name] = control.checked;
      else if (kind === "NumberInput" || kind === "Slider") values[name] = Number(control.value);
      else if (kind === "FileInput") values[name] = Array.prototype.map.call(control.files || [], function (file) { return { name: file.name, size: file.size, type: file.type }; });
      else values[name] = control.value;
      if (output) output.textContent = String(values[name]);
      refreshCharts();
    };
    if (Object.prototype.hasOwnProperty.call(values, name) && kind !== "FileInput") {
      if (kind === "Switch") control.checked = Boolean(values[name]);
      else control.value = String(values[name] == null ? "" : values[name]);
      if (output) output.textContent = String(values[name]);
    }
    control.addEventListener(kind === "Select" || kind === "Switch" || kind === "FileInput" ? "change" : "input", update);
  });
  refreshCharts();
  document.querySelectorAll("[data-genui-tabs]").forEach(function (root) {
    var buttons = root.querySelector(".tab-buttons");
    var panels = buttons && buttons.nextElementSibling;
    if (!buttons || !panels) return;
    Array.prototype.forEach.call(buttons.children, function (button, index) {
      button.addEventListener("click", function () {
        Array.prototype.forEach.call(buttons.children, function (item) { item.classList.remove("active"); });
        Array.prototype.forEach.call(panels.children, function (item) { item.classList.add("hidden"); });
        button.classList.add("active");
        if (panels.children[index]) panels.children[index].classList.remove("hidden");
      });
    });
  });
  document.querySelectorAll("[data-genui-submit]").forEach(function (button) {
    button.addEventListener("click", function () {
      var form = button.parentElement;
      if (form && !form.querySelector(".offline-status")) {
        var status = document.createElement("small");
        status.className = "offline-status";
        status.textContent = "这是离线导出页面，表单值会保留在当前页面中，但不会提交到 QwenPaw。";
        form.appendChild(status);
      }
    });
  });
  document.querySelectorAll("[data-genui-action]").forEach(function (button) {
    button.addEventListener("click", function () {
      var kind = button.getAttribute("data-genui-action");
      var href = button.getAttribute("data-genui-href") || "";
      if (kind === "ToggleButton") button.classList.toggle("active");
      else if (kind === "LinkButton" && /^https?:\\/\\//.test(href)) {
        window.open(href, "_blank", "noopener,noreferrer");
      } else {
        var status = button.nextElementSibling;
        if (!status || !status.classList.contains("offline-status")) {
          status = document.createElement("small");
          status.className = "offline-status";
          status.textContent = "离线导出不支持发送消息或提交到 QwenPaw";
          button.after(status);
        }
      }
    });
  });
  window.__GENUI_EXPORT__ = { values: values, refresh: refreshCharts };
})();`;
}
function Oc(e, t = {}, n = { sources: {}, missing: [] }) {
  const r = Q("main");
  return r.id = "genui-root", r.appendChild(pr(e, {
    values: t,
    media: n.sources || {},
    missing: new Set(n.missing || [])
  })), r;
}
function zl(e, t = {}, n = { sources: {}, missing: [] }, r = "GenUI") {
  const a = Oc(e, t, n);
  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${Ic(String(r || "GenUI").slice(0, 120))}</title>
  <style>
    :root { color-scheme: light; }
    html, body { margin: 0; padding: 0; background: #f5f7fa; color: #1f2329; }
    body { padding: 24px; font-family: system-ui, -apple-system, "Segoe UI", sans-serif; }
    *, *::before, *::after { box-sizing: border-box; }
    ${_c}
  </style>
</head>
<body>${a.outerHTML}
<script id="genui-values-data" type="application/json">${Ac(t)}<\/script>
<script>${Rc()}<\/script></body>
</html>`;
}
function $l(e, t) {
  const n = document.createElement("a");
  n.download = t, n.href = e, n.click();
}
async function Mc(e, t) {
  const { toPng: n } = await Promise.resolve().then(() => gu), r = await n(e, {
    cacheBust: !0,
    pixelRatio: Math.min(window.devicePixelRatio || 1, 2),
    backgroundColor: "#ffffff"
  });
  $l(r, `${t}.png`), console.info("[ugsci.genui] PNG export created", { filename: t, via: "html-to-image" });
}
function Lc(e) {
  return new Promise((t, n) => {
    const r = new FileReader();
    r.onload = () => t(String(r.result || "")), r.onerror = () => n(r.error || new Error("media encoding failed")), r.readAsDataURL(e);
  });
}
async function Bc(e) {
  const t = e.currentSrc || e.src;
  if (!t) return null;
  if (t.startsWith("data:")) return t;
  try {
    const n = await fetch(t);
    return n.ok ? await Lc(await n.blob()) : null;
  } catch {
    try {
      const n = document.createElement("canvas");
      n.width = e.naturalWidth, n.height = e.naturalHeight;
      const r = n.getContext("2d");
      return !r || !n.width || !n.height ? null : (r.drawImage(e, 0, 0), n.toDataURL("image/png"));
    } catch {
      return null;
    }
  }
}
async function Pl(e) {
  const t = {}, n = [], r = Array.from(e.querySelectorAll("img[data-genui-media-source]"));
  return await Promise.all(r.map(async (a) => {
    const l = a.dataset.genuiMediaSource || "", o = await Bc(a);
    l && (o ? t[l] = o : n.push(l));
  })), { sources: t, missing: Array.from(new Set(n)) };
}
async function Uc(e, t, n, r, a = r) {
  const l = await Pl(e), o = zl(t, n, l, a), s = new Blob([o], { type: "text/html;charset=utf-8" }), i = URL.createObjectURL(s);
  $l(i, `${r}.html`), setTimeout(() => URL.revokeObjectURL(i), 1e3), l.missing.length && console.warn("[ugsci.genui] HTML export has media that could not be embedded", { filename: r, missing: l.missing }), console.info("[ugsci.genui] HTML export created", { filename: r, bytes: s.size, embeddedMedia: Object.keys(l.sources).length, missingMedia: l.missing.length });
}
async function jc(e, t, n, r) {
  const a = await Pl(e), l = zl(t, n, a, r), o = window.open("", "_blank", "noopener,noreferrer");
  if (!o) throw new Error("print window was blocked");
  o.document.open(), o.document.write(l), o.document.close(), await new Promise((s) => {
    const i = () => s();
    if (o.document.readyState === "complete") {
      window.setTimeout(i, 50);
      return;
    }
    o.addEventListener("load", i, { once: !0 }), window.setTimeout(i, 400);
  }), o.focus(), o.print(), o.close(), a.missing.length && console.warn("[ugsci.genui] PDF print has media that could not be embedded", { missing: a.missing });
}
const Ge = "var(--ant-color-text, rgba(0, 0, 0, 0.88))", Ne = "var(--ant-color-text-secondary, rgba(0, 0, 0, 0.45))", bt = "var(--ant-color-border-secondary, #f0f0f0)", Xn = "var(--ant-color-bg-container, #fff)", Yn = "var(--ant-color-fill-quaternary, rgba(0, 0, 0, 0.02))", Rl = "var(--ant-color-success, #52c41a)", Nc = "var(--ant-color-success-bg, #f6ffed)", Dc = "var(--ant-color-warning, #faad14)", Fc = "var(--ant-color-warning-bg, #fffbe6)", Ol = "var(--ant-color-error, #ff4d4f)", Gc = "var(--ant-color-error-bg, #fff2f0)", Ta = "var(--ant-color-primary, #1677ff)", Hc = {
  derived_expression: "推导结果",
  effective_inventory: "有效库存",
  estimated_ogip: "估算原始储量",
  initial_p_over_z: "初始 p/z",
  current_p_over_z: "当前 p/z",
  recovery_factor: "采收率",
  remaining_gas: "剩余气量",
  result: "计算结果",
  transformed_expression: "变换结果"
}, Ml = {
  current_pressure: "当前压力",
  current_z_factor: "当前 z 因子",
  initial_pressure: "初始压力",
  initial_z_factor: "初始 z 因子",
  produced_gas: "累计产气量"
};
function Gt(e) {
  return Hc[e] || Ml[e] || e.replace(/[_.-]+/g, " ").replace(/\b\w/g, (t) => t.toUpperCase());
}
function Wc(e, t = "") {
  if (!Number.isFinite(e)) return String(e);
  if (/(factor|fraction|efficiency|ratio|rate)$/i.test(t) && Math.abs(e) <= 1)
    return `${new Intl.NumberFormat("zh-CN", {
      maximumFractionDigits: 2
    }).format(e * 100)}%`;
  const n = Math.abs(e);
  return n >= 1e9 || n > 0 && n < 1e-4 ? e.toExponential(4) : new Intl.NumberFormat("zh-CN", {
    maximumSignificantDigits: 7
  }).format(e);
}
function gn(e, t = "") {
  if (typeof e == "number") return Wc(e, t);
  if (typeof e == "boolean") return e ? "是" : "否";
  if (e == null) return "—";
  if (typeof e == "string") return e;
  try {
    return JSON.stringify(e);
  } catch {
    return String(e);
  }
}
function _a(e) {
  const t = [
    "result",
    "estimated_ogip",
    "effective_inventory",
    "derived_expression",
    "transformed_expression",
    "remaining_gas",
    "recovery_factor"
  ], n = t.indexOf(e);
  return n < 0 ? t.length : n;
}
function Vc(e) {
  const t = e == null ? void 0 : e.result;
  return !t || typeof t != "object" || Array.isArray(t) ? [] : Object.entries(t).filter(
    ([, n]) => ["string", "number", "boolean"].includes(typeof n)
  ).sort(([n], [r]) => _a(n) - _a(r)).slice(0, 4).map(([n, r]) => {
    var a;
    return {
      key: n,
      label: Gt(n),
      value: gn(r, n),
      unit: String(((a = e == null ? void 0 : e.units) == null ? void 0 : a[n]) || "")
    };
  });
}
function qc(e) {
  var r, a;
  const t = Array.isArray((r = e == null ? void 0 : e.trace) == null ? void 0 : r.steps) ? e.trace.steps : [], n = t.find(
    (l) => (l == null ? void 0 : l.operation) === "solve" && ((l == null ? void 0 : l.unicode) || (l == null ? void 0 : l.expression))
  ) || t.find(
    (l) => (l == null ? void 0 : l.group) === "assemble" && ((l == null ? void 0 : l.unicode) || (l == null ? void 0 : l.expression))
  ) || t.find((l) => (l == null ? void 0 : l.unicode) || (l == null ? void 0 : l.expression));
  return String(
    (n == null ? void 0 : n.unicode) || (n == null ? void 0 : n.expression) || ((a = e == null ? void 0 : e.trace) == null ? void 0 : a.symbols) || (e == null ? void 0 : e.method) || "—"
  );
}
function Jc(e) {
  var r, a;
  const t = Array.isArray((r = e == null ? void 0 : e.trace) == null ? void 0 : r.variables) ? e.trace.variables.filter((l) => (l == null ? void 0 : l.source) === "input") : [];
  if (t.length)
    return t.slice(0, 8).map((l) => ({
      name: String(l.name || ""),
      label: String(
        Ml[String(l.name || "")] || l.display_name || Gt(String(l.name || "参数"))
      ),
      value: `${gn(l.value, l.name)}${l.unit ? ` ${l.unit}` : ""}`,
      source: "用户输入"
    }));
  const n = ((a = e == null ? void 0 : e.provenance) == null ? void 0 : a.parameter_sources) || {};
  return Object.entries(n).filter(([, l]) => (l == null ? void 0 : l.source) === "user_input").slice(0, 8).map(([l, o]) => ({
    name: l,
    label: Gt(l),
    value: `${gn(o == null ? void 0 : o.value, l)}${o != null && o.unit ? ` ${o.unit}` : ""}`,
    source: "用户输入"
  }));
}
function Cn(e) {
  var d, u, m, p;
  const t = (e == null ? void 0 : e.provenance) || {}, n = t.unit_audit, r = Object.values((n == null ? void 0 : n.per_symbol) || {}), a = typeof (n == null ? void 0 : n.ok) == "boolean" ? n.ok : null, l = t.source || ((d = e == null ? void 0 : e.trace) == null ? void 0 : d.source), o = Array.isArray(e == null ? void 0 : e.warnings) ? e.warnings.map(String) : [];
  let s = "success", i = "公式与单位已核验", c = "公式匹配、参数完整，计算证据链可追溯。";
  return a === !1 ? (s = "error", i = "单位检查未通过", c = "结果使用前需要修正单位不一致项。") : l === "freeform" ? (s = "warning", i = "AI 推导 · 建议复核", c = "符号步骤已通过安全校验，但公式并非审定公式库来源。") : o.length ? (s = "warning", i = "计算完成 · 存在提醒", c = "核心计算已完成，请同时阅读警告和适用条件。") : a === null && (i = "计算证据链已记录", c = "推导步骤和参数来源可追溯；此记录没有逐项单位审计。"), {
    title: ((u = e == null ? void 0 : e.trace) == null ? void 0 : u.formula_name) || ((m = e == null ? void 0 : e.trace) == null ? void 0 : m.title) || (e == null ? void 0 : e.operation) || "UGSci 数学计算",
    formula: qc(e),
    trustLabel: i,
    trustDetail: c,
    trustTone: s,
    results: Vc(e),
    inputs: Jc(e),
    boundaries: [
      ...Array.isArray(e == null ? void 0 : e.applicability) ? e.applicability : [],
      ...Array.isArray(e == null ? void 0 : e.assumptions) ? e.assumptions : []
    ].map(String),
    warnings: o,
    stepCount: Array.isArray((p = e == null ? void 0 : e.trace) == null ? void 0 : p.steps) ? e.trace.steps.length : 0,
    passedGateCount: Array.isArray(t.gate) ? t.gate.length : 0,
    unitCheckCount: r.length,
    unitAuditOk: a
  };
}
function Kc(e) {
  return e === "error" ? { color: Ol, background: Gc } : e === "warning" ? { color: Dc, background: Fc } : { color: Rl, background: Nc };
}
function mt({ children: e }) {
  return k().React.createElement(
    "div",
    { style: { fontWeight: 600, color: Ge, marginBottom: 8 } },
    e
  );
}
function fr({
  payload: e,
  onOpenDerivation: t,
  onOpenEvidence: n,
  onReplay: r,
  compact: a = !1
}) {
  const l = k().React, o = Cn(e), s = Kc(o.trustTone), i = o.results[0], c = o.results.slice(1, a ? 2 : 4);
  return l.createElement(
    "div",
    { style: { display: "grid", gap: a ? 9 : 14 } },
    l.createElement(
      "div",
      {
        style: {
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 8,
          flexWrap: "wrap"
        }
      },
      l.createElement(
        "div",
        null,
        l.createElement(
          "div",
          { style: { color: Ne, fontSize: 12, marginBottom: 3 } },
          a ? "计算摘要" : o.title
        ),
        i ? l.createElement(
          "div",
          {
            style: {
              display: "flex",
              alignItems: "baseline",
              gap: 6,
              flexWrap: "wrap"
            }
          },
          l.createElement(
            "strong",
            {
              style: {
                color: Ge,
                fontSize: a ? 22 : 28,
                fontWeight: 600,
                overflowWrap: "anywhere"
              }
            },
            i.value
          ),
          i.unit ? l.createElement(
            "span",
            { style: { color: Ne, fontSize: 13 } },
            i.unit
          ) : null
        ) : l.createElement(
          "strong",
          { style: { color: Ge } },
          "计算已完成"
        ),
        i ? l.createElement(
          "div",
          { style: { color: Ne, fontSize: 12, marginTop: 3 } },
          i.label
        ) : null
      ),
      l.createElement(
        "span",
        {
          style: {
            display: "inline-flex",
            alignItems: "center",
            gap: 5,
            borderRadius: 999,
            padding: "4px 8px",
            color: s.color,
            background: s.background,
            fontSize: 12,
            whiteSpace: "nowrap"
          }
        },
        o.trustTone === "success" ? "✓" : "!",
        o.trustLabel
      )
    ),
    l.createElement(
      "p",
      {
        style: {
          margin: 0,
          color: a ? Ne : Ge,
          fontSize: 13,
          lineHeight: 1.65
        }
      },
      o.trustDetail
    ),
    c.length ? l.createElement(
      "div",
      {
        style: {
          display: "grid",
          gap: 6,
          paddingTop: 10,
          borderTop: `1px solid ${bt}`
        }
      },
      ...c.map(
        (d) => l.createElement(
          "div",
          {
            key: d.key,
            style: {
              display: "flex",
              justifyContent: "space-between",
              gap: 12,
              fontSize: 12
            }
          },
          l.createElement(
            "span",
            { style: { color: Ne } },
            d.label
          ),
          l.createElement(
            "span",
            { style: { color: Ge, textAlign: "right" } },
            `${d.value}${d.unit ? ` ${d.unit}` : ""}`
          )
        )
      )
    ) : null,
    a ? null : l.createElement(
      "div",
      {
        style: {
          display: "grid",
          gap: 7,
          paddingTop: 10,
          borderTop: `1px solid ${bt}`,
          fontSize: 12
        }
      },
      l.createElement(
        "div",
        {
          style: {
            display: "grid",
            gridTemplateColumns: "72px 1fr",
            gap: 8
          }
        },
        l.createElement(
          "span",
          { style: { color: Ne } },
          "使用公式"
        ),
        l.createElement(
          "code",
          { style: { color: Ge, overflowWrap: "anywhere" } },
          o.formula
        )
      ),
      l.createElement(
        "div",
        {
          style: {
            display: "grid",
            gridTemplateColumns: "72px 1fr",
            gap: 8
          }
        },
        l.createElement(
          "span",
          { style: { color: Ne } },
          "关键输入"
        ),
        l.createElement(
          "span",
          { style: { color: Ge } },
          o.inputs.length ? o.inputs.slice(0, 5).map((d) => `${d.label}=${d.value}`).join("；") : "未提供可展示的输入摘要"
        )
      ),
      l.createElement(
        "div",
        {
          style: {
            display: "grid",
            gridTemplateColumns: "72px 1fr",
            gap: 8
          }
        },
        l.createElement(
          "span",
          { style: { color: Ne } },
          "适用条件"
        ),
        l.createElement(
          "span",
          { style: { color: Ge } },
          o.boundaries.slice(0, 2).join("；") || "未声明额外适用条件"
        )
      )
    ),
    l.createElement(
      "div",
      { style: { display: "flex", gap: 8, flexWrap: "wrap" } },
      t ? l.createElement(
        "button",
        {
          type: "button",
          onClick: t,
          style: {
            border: `1px solid ${Ta}`,
            borderRadius: 7,
            padding: "6px 10px",
            background: Ta,
            color: "var(--ant-color-text-light-solid, #fff)",
            cursor: "pointer"
          }
        },
        "查看推导"
      ) : null,
      n ? l.createElement(
        "button",
        {
          type: "button",
          onClick: n,
          style: {
            border: `1px solid ${bt}`,
            borderRadius: 7,
            padding: "6px 10px",
            background: Xn,
            color: Ge,
            cursor: "pointer"
          }
        },
        "证据与来源"
      ) : null,
      r ? l.createElement(
        "button",
        {
          type: "button",
          onClick: r,
          style: {
            border: `1px solid ${bt}`,
            borderRadius: 7,
            padding: "6px 10px",
            background: Xn,
            color: Ge,
            cursor: "pointer"
          }
        },
        "复现计算"
      ) : null
    )
  );
}
function Xc({ payload: e }) {
  const t = k().React, n = Cn(e);
  return t.createElement(
    "div",
    { style: { display: "grid", gap: 18 } },
    t.createElement(
      "section",
      null,
      t.createElement(mt, null, "你最需要知道的"),
      t.createElement(
        "p",
        { style: { margin: 0, color: Ge, fontSize: 13, lineHeight: 1.7 } },
        `本次使用 ${n.title}，读取 ${n.inputs.length} 项输入，记录 ${n.stepCount} 个推导步骤`,
        n.passedGateCount ? `，并通过 ${n.passedGateCount} 项计算校验。` : "。"
      )
    ),
    t.createElement(
      "section",
      null,
      t.createElement(mt, null, "边界与提醒"),
      n.boundaries.length || n.warnings.length ? t.createElement(
        "ul",
        {
          style: {
            margin: 0,
            paddingLeft: 18,
            color: Ne,
            fontSize: 12,
            lineHeight: 1.7
          }
        },
        ...[...n.warnings, ...n.boundaries].slice(0, 4).map(
          (r, a) => t.createElement("li", { key: `${a}:${r}` }, r)
        )
      ) : t.createElement(
        "p",
        { style: { margin: 0, color: Ne, fontSize: 12 } },
        "未声明额外边界条件。"
      )
    )
  );
}
function Yc({ payload: e }) {
  var s, i, c;
  const t = k().React, n = Cn(e), r = (e == null ? void 0 : e.provenance) || {}, a = Object.entries(((s = r == null ? void 0 : r.unit_audit) == null ? void 0 : s.per_symbol) || {}), l = Object.entries((r == null ? void 0 : r.parameter_sources) || {}), o = (d, u, m = d) => t.createElement(
    "div",
    {
      key: m,
      style: {
        display: "grid",
        gridTemplateColumns: "90px minmax(0, 1fr)",
        gap: 10,
        padding: "8px 0",
        borderBottom: `1px solid ${bt}`,
        fontSize: 12
      }
    },
    t.createElement("span", { style: { color: Ne } }, d),
    t.createElement(
      "span",
      { style: { color: Ge, overflowWrap: "anywhere" } },
      u || "—"
    )
  );
  return t.createElement(
    "div",
    { style: { display: "grid", gap: 18 } },
    t.createElement(
      "section",
      null,
      t.createElement(mt, null, "公式身份"),
      o("公式来源", r.reference || n.title),
      o(
        "公式版本",
        `${r.formula_id || ((i = e == null ? void 0 : e.trace) == null ? void 0 : i.formula_id) || "—"} · ${r.formula_version || ((c = e == null ? void 0 : e.trace) == null ? void 0 : c.formula_version) || "—"}`
      ),
      o(
        "信任类型",
        r.source === "freeform" ? "AI 自由推导" : "UGSci 审定公式"
      )
    ),
    t.createElement(
      "section",
      null,
      t.createElement(
        mt,
        null,
        `参数来源（${l.length}）`
      ),
      l.length ? t.createElement(
        "div",
        { style: { display: "grid" } },
        ...l.map(
          ([d, u]) => o(
            Gt(d),
            `${(u == null ? void 0 : u.source) === "user_input" ? "用户输入" : "推导生成"} · ${gn(u == null ? void 0 : u.value, d)}${u != null && u.unit ? ` ${u.unit}` : ""}`,
            d
          )
        )
      ) : t.createElement(
        "p",
        { style: { margin: 0, color: Ne, fontSize: 12 } },
        "没有参数来源记录。"
      )
    ),
    t.createElement(
      "section",
      null,
      t.createElement(
        mt,
        null,
        `单位审计（${n.unitCheckCount} 项）`
      ),
      t.createElement(
        "div",
        {
          style: {
            color: n.unitAuditOk === !1 ? Ol : n.unitAuditOk === !0 ? Rl : Ne,
            fontSize: 12,
            marginBottom: a.length ? 8 : 0
          }
        },
        n.unitAuditOk === !1 ? "存在不一致单位" : n.unitAuditOk === !0 ? "全部单位一致" : "此结果没有单位审计数据"
      ),
      a.length ? t.createElement(
        "details",
        null,
        t.createElement(
          "summary",
          { style: { cursor: "pointer", color: Ne, fontSize: 12 } },
          "查看逐项单位检查"
        ),
        t.createElement(
          "div",
          { style: { marginTop: 6 } },
          ...a.map(
            ([d, u]) => o(
              Gt(d),
              `${u != null && u.ok ? "✓" : "✗"} ${(u == null ? void 0 : u.actual) || "无量纲"} → ${(u == null ? void 0 : u.expected) || "—"}`,
              `unit:${d}`
            )
          )
        )
      ) : null
    ),
    Array.isArray(r.gate) && r.gate.length ? t.createElement(
      "section",
      null,
      t.createElement(mt, null, "通过的计算校验"),
      t.createElement(
        "ul",
        {
          style: {
            margin: 0,
            paddingLeft: 18,
            color: Ne,
            fontSize: 12,
            lineHeight: 1.7
          }
        },
        ...r.gate.map(
          (d, u) => t.createElement(
            "li",
            { key: `${u}:${d}` },
            String(d)
          )
        )
      )
    ) : null,
    r.replay_token ? t.createElement(
      "section",
      null,
      t.createElement(mt, null, "复现身份"),
      t.createElement(
        "code",
        {
          style: {
            display: "block",
            padding: 10,
            borderRadius: 8,
            background: Yn,
            color: Ne,
            fontSize: 11,
            overflowWrap: "anywhere"
          }
        },
        String(
          r.input_fingerprint || r.replay_token
        ).slice(0, 96)
      )
    ) : null
  );
}
function Qc({ payload: e }) {
  const t = k().React, n = Cn(e), [r, a] = t.useState(!1), l = e == null ? void 0 : e.replay, o = [
    [n.stepCount, "计算步骤"],
    [n.passedGateCount, "校验通过"],
    [(l == null ? void 0 : l.elapsedMs) != null ? `${l.elapsedMs} ms` : "—", "复现耗时"]
  ];
  return t.createElement(
    "div",
    { style: { display: "grid", gap: 12 } },
    t.createElement(
      "div",
      {
        style: {
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(90px, 1fr))",
          gap: 8
        }
      },
      ...o.map(
        ([s, i]) => t.createElement(
          "div",
          {
            key: String(i),
            style: { padding: 10, borderRadius: 8, background: Yn }
          },
          t.createElement(
            "strong",
            { style: { display: "block", color: Ge } },
            String(s)
          ),
          t.createElement(
            "span",
            { style: { color: Ne, fontSize: 11 } },
            String(i)
          )
        )
      )
    ),
    t.createElement(
      "button",
      {
        type: "button",
        onClick: () => a(!r),
        "aria-expanded": r,
        style: {
          justifySelf: "start",
          border: `1px solid ${bt}`,
          borderRadius: 7,
          padding: "6px 10px",
          background: Xn,
          color: Ge,
          cursor: "pointer"
        }
      },
      r ? "隐藏原始日志" : "显示原始日志"
    ),
    r ? t.createElement(
      "pre",
      {
        style: {
          margin: 0,
          padding: 12,
          borderRadius: 8,
          background: Yn,
          color: Ne,
          whiteSpace: "pre-wrap",
          overflowWrap: "anywhere",
          fontSize: 11,
          lineHeight: 1.55
        }
      },
      JSON.stringify(e, null, 2)
    ) : t.createElement(
      "p",
      { style: { margin: 0, color: Ne, fontSize: 12 } },
      "原始运行数据默认隐藏，需要诊断或审计时再展开。"
    )
  );
}
const Zc = 128;
let Qn = [], Ll = "";
const Zn = /* @__PURE__ */ new Set(), Bl = () => Zn.forEach((e) => e()), Ul = (e) => (Zn.add(e), () => Zn.delete(e)), Ia = () => Qn;
function gr(e) {
  return !!(e && typeof e == "object" && e.trace && Array.isArray(e.trace.steps) && e.provenance && (e.operation || e.trace.formula_id));
}
function ed(e) {
  if (!e || typeof e != "object" || !e.replay_id || !e.status || !gr(e.result))
    return null;
  const t = {
    replayId: String(e.replay_id),
    status: String(e.status),
    reproducible: e.reproducible === !0,
    elapsedMs: typeof e.elapsed_ms == "number" ? e.elapsed_ms : void 0,
    diff: e.diff && typeof e.diff == "object" ? e.diff : {}
  };
  return { ...e.result, replay: t };
}
function yr(e, t) {
  var a, l, o, s, i;
  if (!gr(e)) return null;
  const n = (a = e.replay) != null && a.replayId ? `replay:${e.replay.replayId}` : `${((l = e.trace) == null ? void 0 : l.formula_id) || "derivation"}:${((o = e.provenance) == null ? void 0 : o.input_fingerprint) || e.operation || crypto.randomUUID()}`, r = {
    uiId: n,
    sessionId: t || ((i = (s = k()).getCurrentSessionId) == null ? void 0 : i.call(s)) || "",
    payload: e,
    updatedAt: Date.now()
  };
  return Qn = [r, ...Qn.filter((c) => c.uiId !== n)].slice(
    0,
    Zc
  ), Bl(), r;
}
function hr(e) {
  Ll = e, Bl();
}
function td() {
  return k().React.useSyncExternalStore(
    Ul,
    () => Ll,
    () => ""
  );
}
function jl(e) {
  const t = [], n = (r) => {
    if (r == null) return;
    if (typeof r == "string") {
      try {
        n(JSON.parse(r));
      } catch {
      }
      return;
    }
    if (Array.isArray(r)) {
      r.forEach(n);
      return;
    }
    if (typeof r != "object") return;
    const a = ed(r);
    if (a) {
      t.push(a);
      return;
    }
    gr(r) && t.push(r), Object.values(r).forEach(n);
  };
  return n(e), Array.from(
    new Map(
      t.map((r) => {
        var a, l;
        return [
          String(((a = r.provenance) == null ? void 0 : a.replay_token) || ((l = r.trace) == null ? void 0 : l.formula_id)) + JSON.stringify(r.result || {}),
          r
        ];
      })
    ).values()
  );
}
function nd(e, t) {
  jl(e).forEach(
    (n) => yr(n, t)
  );
}
function rd(e) {
  const t = k().React, n = t.useSyncExternalStore(Ul, Ia, Ia);
  return t.useMemo(
    () => n.filter((r) => r.sessionId === e),
    [n, e]
  );
}
const ad = [], wt = /* @__PURE__ */ new Map();
function ld(e) {
  wt.set(e, (wt.get(e) || 0) + 1);
}
function od(e) {
  const t = (wt.get(e) || 1) - 1;
  t > 0 ? wt.set(e, t) : wt.delete(e);
}
function id(e) {
  return (wt.get(e) || 0) > 0;
}
function Aa(e) {
  const t = [], n = (r) => {
    t.push(r);
    for (const a of r.children || []) n(a);
  };
  return n(e), t;
}
function sd(e) {
  var c, d;
  const t = Aa(e), n = String(
    ((d = (c = t.find(
      (u) => {
        var m;
        return u.kind === "Heading" && Number((m = u.props) == null ? void 0 : m.level) === 2;
      }
    )) == null ? void 0 : c.props) == null ? void 0 : d.value) || "公式计算"
  ), r = t.some(
    (u) => {
      var m;
      return u.kind === "Alert" && String(((m = u.props) == null ? void 0 : m.severity) || "") === "warning";
    }
  ), a = t.filter((u) => u.kind === "MetricCard").map((u) => {
    var m, p;
    return {
      label: String(((m = u.props) == null ? void 0 : m.title) || "结果"),
      value: String(((p = u.props) == null ? void 0 : p.value) ?? "—")
    };
  }), l = t.filter((u) => u.kind === "TableRow").map(
    (u) => (u.children || []).filter((m) => m.kind === "TableCell").map((m) => {
      var p;
      return String(((p = m.props) == null ? void 0 : p.value) ?? "");
    })
  ).filter((u) => u.length >= 4 && u[3] === "derived").map((u) => ({
    label: u[0] || "结果",
    value: [u[1], u[2]].filter(Boolean).join(" ")
  })).reverse(), o = t.filter((u) => u.kind === "NumberInput" || u.kind === "Slider").slice(0, 5).map(
    (u) => {
      var m, p, w;
      return `${String(((m = u.props) == null ? void 0 : m.label) || ((p = u.props) == null ? void 0 : p.name) || "输入")}=${String(
        ((w = u.props) == null ? void 0 : w.value) ?? "—"
      )}`;
    }
  ), s = t.filter((u) => u.kind === "AccordionItem").filter(
    (u) => {
      var m;
      return ["适用场景", "假设条件"].includes(String(((m = u.props) == null ? void 0 : m.header) || ""));
    }
  ).flatMap((u) => Aa(u)).filter((u) => u.kind === "ListItem").map((u) => {
    var m;
    return String(((m = u.props) == null ? void 0 : m.value) || "");
  }).filter(Boolean).slice(0, 3), i = [...l, ...a].filter(
    (u, m, p) => p.findIndex(
      (w) => w.label === u.label && w.value === u.value
    ) === m
  );
  return { title: n, warning: r, inputs: o, conditions: s, results: i };
}
function cd({ data: e }) {
  var h, y;
  const t = (h = window.QwenPaw) == null ? void 0 : h.host, n = t == null ? void 0 : t.React;
  if (!n) return null;
  const r = Gs(), a = n.useRef(/* @__PURE__ */ new Map()), l = ((y = t.getCurrentSessionId) == null ? void 0 : y.call(t)) || "__current_chat__", o = Array.isArray(e.output) ? e.output : ad, s = n.useMemo(
    () => bl(o),
    [o]
  ), i = n.useMemo(
    () => jl(o),
    [o]
  );
  n.useEffect(() => {
    for (const f of s) {
      if (!f.ui_id || !f.tree) continue;
      const E = r.getSnapshot(l, f.ui_id);
      E && E.revision >= (f.revision || 1) || r.setSnapshot({
        schemaVersion: "1",
        uiId: f.ui_id,
        revision: f.revision || 1,
        tree: f.tree,
        sessionId: l,
        sourceToolCallId: f.tool_call_id,
        updatedAt: Date.now()
      });
    }
  }, [s, l]);
  const c = n.useMemo(
    () => s.filter((f) => f.kind === "genui" && !!f.ui_id).map((f) => f.ui_id),
    [s]
  ), d = c.join("\0");
  n.useEffect(() => {
    for (const f of c) ld(f);
    return () => {
      for (const f of c) od(f);
    };
  }, [d]);
  const u = n.useMemo(
    () => s.map((f) => f.ui_id).filter((f) => !!f),
    [s]
  ), p = Hs(l, u).filter(
    (f) => (
      // Only include snapshots whose ui_id appears in this response's results
      s.some(
        (E) => E.ui_id === f.uiId && (E.kind === "genui" || E.kind === "genui_patch" && !id(f.uiId))
      )
    )
  ).sort((f, E) => f.updatedAt - E.updatedAt);
  if (i.length > 0)
    return n.createElement(
      "div",
      {
        className: "qwenpaw-genui-inline qwenpaw-derivation-inline",
        style: { marginTop: 8, marginBottom: 8, display: "grid", gap: 8 }
      },
      ...i.map(
        (f, E) => {
          var v, g;
          return n.createElement(
            "div",
            {
              key: String(
                ((v = f.provenance) == null ? void 0 : v.replay_token) || ((g = f.trace) == null ? void 0 : g.formula_id) || E
              ),
              style: {
                border: "1px solid var(--ant-color-border-secondary, #f0f0f0)",
                borderRadius: 12,
                padding: 12,
                background: "var(--ant-color-bg-container, #fff)"
              }
            },
            n.createElement(fr, {
              payload: f,
              compact: !0,
              onOpenDerivation: () => {
                const S = yr(f, l);
                S != null && S.uiId && hr(S.uiId), window.dispatchEvent(
                  new CustomEvent("qwenpaw:open-compute-workbench", {
                    detail: { uiId: S == null ? void 0 : S.uiId }
                  })
                );
              }
            })
          );
        }
      )
    );
  if (p.length === 0) return null;
  const w = (f) => n.createElement(
    "div",
    {
      key: xt(f.sessionId, f.uiId),
      className: "qwenpaw-genui-tree",
      "data-genui-id": f.uiId,
      style: {
        border: "1px solid var(--ant-color-border-secondary, #f0f0f0)",
        borderRadius: 12,
        padding: 16,
        marginBottom: 8,
        background: "var(--ant-color-bg-container, #fff)"
      },
      ref: (E) => {
        E && (E.__genuiId = f.uiId);
      }
    },
    n.createElement(
      "div",
      { className: "qwenpaw-genui-export-target" },
      n.createElement(gc, {
        node: f.tree.root,
        onValuesChange: (E) => a.current.set(f.uiId, E),
        children: n.createElement(xc, {
          node: f.tree.root
        })
      })
    ),
    n.createElement(
      "div",
      {
        style: {
          display: "flex",
          justifyContent: "flex-end",
          gap: 6,
          marginTop: 8
        }
      },
      n.createElement(
        "button",
        {
          type: "button",
          title: "导出 PNG",
          onClick: (E) => {
            var g;
            const v = (g = E.currentTarget.closest(".qwenpaw-genui-tree")) == null ? void 0 : g.querySelector(
              ".qwenpaw-genui-export-target"
            );
            v && Mc(v, f.uiId).catch(
              (S) => console.warn("[ugsci.genui] PNG export failed", S)
            );
          }
        },
        "PNG"
      ),
      n.createElement(
        "button",
        {
          type: "button",
          title: "打印或另存为 PDF",
          onClick: (E) => {
            var g;
            const v = (g = E.currentTarget.closest(".qwenpaw-genui-tree")) == null ? void 0 : g.querySelector(
              ".qwenpaw-genui-export-target"
            );
            v && jc(
              v,
              f.tree.root,
              a.current.get(f.uiId) || {},
              f.uiId
            ).catch(
              (S) => console.warn("[ugsci.genui] PDF print failed", S)
            );
          }
        },
        "PDF"
      ),
      n.createElement(
        "button",
        {
          type: "button",
          title: "导出 HTML",
          onClick: (E) => {
            var g;
            const v = (g = E.currentTarget.closest(".qwenpaw-genui-tree")) == null ? void 0 : g.querySelector(
              ".qwenpaw-genui-export-target"
            );
            v && Uc(
              v,
              f.tree.root,
              a.current.get(f.uiId) || {},
              f.uiId,
              f.uiId
            ).catch(
              (S) => console.warn("[ugsci.genui] HTML export failed", S)
            );
          }
        },
        "HTML"
      )
    )
  );
  return n.createElement(
    "div",
    {
      className: "qwenpaw-genui-inline",
      style: { marginTop: 8, marginBottom: 8 }
    },
    ...p.map((f) => {
      if (!f.uiId.startsWith("ui_trc_")) return w(f);
      const E = sd(f.tree.root), v = E.results[0] || {
        label: "计算结果",
        value: "已完成"
      };
      return n.createElement(
        "div",
        {
          key: xt(f.sessionId, f.uiId),
          className: "qwenpaw-derivation-inline",
          "data-trace-ui-id": f.uiId,
          style: {
            border: "1px solid var(--ant-color-border-secondary, #f0f0f0)",
            borderRadius: 12,
            padding: 12,
            marginBottom: 8,
            display: "grid",
            gap: 10,
            background: "var(--ant-color-bg-container, #fff)"
          }
        },
        n.createElement(
          "div",
          {
            style: {
              display: "flex",
              justifyContent: "space-between",
              gap: 12,
              alignItems: "flex-start",
              flexWrap: "wrap"
            }
          },
          n.createElement(
            "div",
            { style: { minWidth: 0 } },
            n.createElement(
              "div",
              {
                style: {
                  color: "var(--ant-color-text-secondary, rgba(0,0,0,.45))",
                  fontSize: 12
                }
              },
              E.title
            ),
            n.createElement(
              "strong",
              {
                style: {
                  display: "block",
                  marginTop: 2,
                  fontSize: 22,
                  color: "var(--ant-color-text, rgba(0,0,0,.88))",
                  overflowWrap: "anywhere"
                }
              },
              v.value
            ),
            n.createElement(
              "span",
              {
                style: {
                  color: "var(--ant-color-text-secondary, rgba(0,0,0,.45))",
                  fontSize: 12
                }
              },
              v.label
            )
          ),
          n.createElement(
            "span",
            {
              style: {
                borderRadius: 999,
                padding: "4px 8px",
                fontSize: 12,
                color: E.warning ? "var(--ant-color-warning, #faad14)" : "var(--ant-color-success, #52c41a)",
                background: E.warning ? "var(--ant-color-warning-bg, #fffbe6)" : "var(--ant-color-success-bg, #f6ffed)"
              }
            },
            E.warning ? "需要人工复核" : "✓ 公式与单位已核验"
          )
        ),
        E.results.length > 1 ? n.createElement(
          "div",
          {
            style: {
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
              gap: 8
            }
          },
          ...E.results.slice(1, 4).map(
            (g) => n.createElement(
              "div",
              {
                key: `${g.label}:${g.value}`,
                style: {
                  padding: 8,
                  borderRadius: 8,
                  background: "var(--ant-color-fill-quaternary, rgba(0,0,0,.02))"
                }
              },
              n.createElement(
                "div",
                {
                  style: {
                    color: "var(--ant-color-text-secondary, rgba(0,0,0,.45))",
                    fontSize: 11
                  }
                },
                g.label
              ),
              n.createElement("strong", null, g.value)
            )
          )
        ) : null,
        E.inputs.length ? n.createElement(
          "div",
          {
            style: {
              color: "var(--ant-color-text-secondary, rgba(0,0,0,.45))",
              fontSize: 12,
              lineHeight: 1.6
            }
          },
          `关键输入：${E.inputs.join("；")}`
        ) : null,
        E.conditions.length ? n.createElement(
          "div",
          {
            style: {
              color: "var(--ant-color-text-secondary, rgba(0,0,0,.45))",
              fontSize: 12,
              lineHeight: 1.6
            }
          },
          `适用条件：${E.conditions.join("；")}`
        ) : null,
        n.createElement(
          "details",
          null,
          n.createElement(
            "summary",
            {
              style: {
                cursor: "pointer",
                color: "var(--ant-color-primary, #1677ff)",
                fontSize: 13,
                fontWeight: 600
              }
            },
            "查看推导"
          ),
          n.createElement(
            "div",
            { style: { marginTop: 10 } },
            w(f)
          )
        )
      );
    })
  );
}
function dd({ payload: e }) {
  var s, i;
  const t = k().React, n = ((s = e == null ? void 0 : e.trace) == null ? void 0 : s.variables) || [], r = ((i = e == null ? void 0 : e.trace) == null ? void 0 : i.steps) || [], a = [
    ...n.map((c, d) => ({
      id: c.name,
      label: c.symbol || c.name,
      x: 20,
      y: 30 + d * 54,
      kind: "variable"
    })),
    ...r.map((c, d) => ({
      id: c.id,
      label: c.title,
      x: 380,
      y: 30 + d * 54,
      kind: "step",
      step: c
    }))
  ], l = new Map(a.map((c) => [c.id, c])), o = [];
  for (const c of r) {
    for (const d of c.reads || [])
      l.has(d) && o.push({ from: d, to: c.id });
    c.writes && l.has(c.writes) && o.push({ from: c.id, to: c.writes });
  }
  return t.createElement(
    "svg",
    {
      viewBox: `0 0 760 ${Math.max(
        220,
        Math.max(n.length, r.length) * 54 + 50
      )}`,
      width: "100%",
      role: "img",
      "aria-label": "推导流程图"
    },
    t.createElement(
      "defs",
      null,
      t.createElement(
        "marker",
        {
          id: "arrow",
          markerWidth: 8,
          markerHeight: 8,
          refX: 7,
          refY: 3,
          orient: "auto"
        },
        t.createElement("path", {
          d: "M0,0 L0,6 L8,3 z",
          fill: "var(--ant-color-text-quaternary, #bfbfbf)"
        })
      )
    ),
    ...o.map((c, d) => {
      const u = l.get(c.from), m = l.get(c.to);
      return t.createElement("line", {
        key: `e${d}`,
        x1: u.x + 155,
        y1: u.y + 16,
        x2: m.x,
        y2: m.y + 16,
        stroke: "var(--ant-color-border, #d9d9d9)",
        markerEnd: "url(#arrow)"
      });
    }),
    ...a.map(
      (c) => t.createElement(
        "g",
        { key: c.id, transform: `translate(${c.x} ${c.y})` },
        t.createElement("rect", {
          width: 155,
          height: 32,
          rx: 6,
          fill: c.kind === "variable" ? "var(--ant-color-primary-bg, #e6f4ff)" : "var(--ant-color-fill-quaternary, #fafafa)",
          stroke: "var(--ant-color-border, #d9d9d9)"
        }),
        t.createElement(
          "text",
          {
            x: 8,
            y: 20,
            fill: "var(--ant-color-text, rgba(0,0,0,.88))",
            fontSize: 11
          },
          `${c.id} · ${String(c.label).slice(0, 18)}`
        )
      )
    )
  );
}
function ud({
  payload: e,
  compact: t = !1
}) {
  var c;
  const n = k().React, [r, a] = n.useState(!t), l = ((c = e == null ? void 0 : e.trace) == null ? void 0 : c.steps) || [], o = l.filter(
    (d) => d.kind !== "bind" || d.note !== "input"
  ), i = (r ? l : o).map(
    (d, u) => n.createElement(
      "article",
      {
        key: d.id,
        style: {
          display: "grid",
          gridTemplateColumns: "26px minmax(0, 1fr)",
          gap: 9,
          padding: "9px 0",
          borderBottom: "1px solid var(--ant-color-border-secondary, #f0f0f0)"
        }
      },
      n.createElement(
        "span",
        {
          style: {
            width: 24,
            height: 24,
            display: "grid",
            placeItems: "center",
            borderRadius: 999,
            background: "var(--ant-color-primary-bg, #e6f4ff)",
            color: "var(--ant-color-primary, #1677ff)",
            fontSize: 11
          }
        },
        u + 1
      ),
      n.createElement(
        "div",
        { style: { minWidth: 0 } },
        n.createElement(
          "strong",
          {
            style: {
              display: "block",
              color: "var(--ant-color-text, rgba(0,0,0,.88))",
              fontSize: 13
            }
          },
          d.title
        ),
        d.unicode || d.expression ? n.createElement(
          "code",
          {
            style: {
              display: "block",
              color: "var(--ant-color-text-secondary, rgba(0,0,0,.45))",
              fontSize: 11,
              marginTop: 4,
              overflowWrap: "anywhere"
            }
          },
          d.unicode || d.expression
        ) : null,
        d.value !== null && d.value !== void 0 ? n.createElement(
          "div",
          {
            style: {
              color: "var(--ant-color-text-secondary, rgba(0,0,0,.45))",
              fontSize: 11,
              marginTop: 3
            }
          },
          `${d.display_value ?? d.value} ${d.display_unit || d.unit || ""}`
        ) : null,
        d.description ? n.createElement(
          "div",
          {
            style: {
              color: "var(--ant-color-text-tertiary, rgba(0,0,0,.25))",
              fontSize: 11,
              marginTop: 3,
              lineHeight: 1.55
            }
          },
          d.description
        ) : null,
        d.kind === "assert" ? n.createElement(
          "span",
          {
            style: {
              display: "inline-block",
              color: d.value ? "var(--ant-color-success, #52c41a)" : "var(--ant-color-error, #ff4d4f)",
              fontSize: 11,
              marginTop: 4
            }
          },
          d.value ? "✓ 通过" : "✗ 失败"
        ) : null
      )
    )
  );
  return n.createElement(
    "div",
    { style: { display: "grid", gap: 8 } },
    ...i,
    t && l.length !== o.length ? n.createElement(
      "button",
      {
        type: "button",
        onClick: () => a((d) => !d),
        style: {
          justifySelf: "start",
          border: "1px solid var(--ant-color-border, #d9d9d9)",
          borderRadius: 7,
          padding: "5px 9px",
          background: "var(--ant-color-bg-container, #fff)",
          color: "var(--ant-color-text, rgba(0,0,0,.88))",
          cursor: "pointer"
        }
      },
      r ? "只看关键步骤" : `显示全部 ${l.length} 步`
    ) : null
  );
}
const on = "var(--ant-color-text, rgba(0,0,0,.88))", Un = "var(--ant-color-text-secondary, rgba(0,0,0,.45))", za = "var(--ant-color-border, #d9d9d9)", jn = "var(--ant-color-bg-container, #fff)", $a = "var(--ant-color-primary, #1677ff)";
function md() {
  var y, f, E;
  const e = k().React, t = ((f = (y = k()).getCurrentSessionId) == null ? void 0 : f.call(y)) || "", n = rd(t), r = td(), [a, l] = e.useState(n[0]), [o, s] = e.useState("summary"), [i, c] = e.useState("steps");
  if (e.useEffect(() => {
    const v = n.find((g) => g.uiId === r);
    v && v !== a ? l(v) : n.some((g) => g.uiId === (a == null ? void 0 : a.uiId)) || l(n[0]);
  }, [n, r, a]), !n.length)
    return e.createElement(
      "div",
      { style: { padding: 20, color: Un } },
      "暂无推导记录。运行 UGSci 公式后可在此查看。"
    );
  const d = (a == null ? void 0 : a.payload) || n[0].payload, u = d.provenance || {}, m = d.replay, p = () => {
    var g, S, z;
    const v = u.replay_token;
    v && ((z = (S = (g = window.QwenPaw) == null ? void 0 : g.chat) == null ? void 0 : S.sendMessage) == null || z.call(
      S,
      `请调用 ugsci_replay_calculation 验证并重放以下令牌：
${v}`
    ));
  }, w = [
    ["summary", "摘要"],
    ["derivation", "推导"],
    ["evidence", "证据"],
    ["logs", "日志"]
  ], h = (v) => ({
    flex: "1 1 64px",
    minWidth: 0,
    border: "none",
    borderRadius: 7,
    padding: "6px 8px",
    background: v ? jn : "transparent",
    color: v ? on : Un,
    boxShadow: v ? "0 1px 4px rgba(0,0,0,.08)" : "none",
    cursor: "pointer"
  });
  return e.createElement(
    "div",
    {
      style: {
        display: "flex",
        flexDirection: "column",
        height: "100%",
        minHeight: 0,
        padding: 14,
        gap: 12,
        overflow: "auto"
      }
    },
    e.createElement(
      "div",
      {
        style: {
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 8,
          flexWrap: "wrap"
        }
      },
      e.createElement(
        "div",
        null,
        e.createElement(
          "strong",
          { style: { display: "block", color: on } },
          "计算详情"
        ),
        e.createElement(
          "span",
          { style: { color: Un, fontSize: 11 } },
          ((E = d.trace) == null ? void 0 : E.formula_name) || d.operation || "UGSci 推导"
        )
      ),
      m ? e.createElement(
        "span",
        {
          style: {
            color: m.reproducible ? "var(--ant-color-success, #52c41a)" : "var(--ant-color-warning, #faad14)",
            fontSize: 12
          }
        },
        m.reproducible ? `✓ 可复现 · ${m.elapsedMs ?? "?"} ms` : "! 版本已变化"
      ) : null
    ),
    e.createElement(
      "div",
      {
        role: "tablist",
        "aria-label": "计算详情层级",
        style: {
          display: "flex",
          gap: 4,
          padding: 4,
          borderRadius: 9,
          background: "var(--ant-color-fill-quaternary, rgba(0,0,0,.02))"
        }
      },
      ...w.map(
        ([v, g]) => e.createElement(
          "button",
          {
            key: v,
            type: "button",
            role: "tab",
            onClick: () => s(v),
            "aria-selected": o === v,
            style: h(o === v)
          },
          g
        )
      )
    ),
    n.length > 1 ? e.createElement(
      "select",
      {
        "aria-label": "选择计算记录",
        value: (a == null ? void 0 : a.uiId) || n[0].uiId,
        onChange: (v) => {
          hr(v.target.value), l(
            n.find((g) => g.uiId === v.target.value)
          );
        },
        style: {
          width: "100%",
          padding: "7px 9px",
          border: `1px solid ${za}`,
          borderRadius: 7,
          color: on,
          background: jn
        }
      },
      ...n.map(
        (v) => {
          var g;
          return e.createElement(
            "option",
            { key: v.uiId, value: v.uiId },
            ((g = v.payload.trace) == null ? void 0 : g.formula_name) || v.uiId.slice(0, 18)
          );
        }
      )
    ) : null,
    o === "summary" ? e.createElement(
      "div",
      { role: "tabpanel", style: { display: "grid", gap: 18 } },
      e.createElement(fr, {
        payload: d,
        onOpenDerivation: () => s("derivation"),
        onOpenEvidence: () => s("evidence"),
        onReplay: u.replay_token ? p : void 0
      }),
      e.createElement(Xc, { payload: d })
    ) : o === "derivation" ? e.createElement(
      "div",
      { role: "tabpanel", style: { display: "grid", gap: 10 } },
      e.createElement(
        "div",
        { style: { display: "flex", gap: 6, flexWrap: "wrap" } },
        ...[
          ["steps", "关键步骤"],
          ["flow", "流程图"]
        ].map(
          ([v, g]) => e.createElement(
            "button",
            {
              key: v,
              type: "button",
              onClick: () => c(v),
              "aria-pressed": i === v,
              style: {
                border: `1px solid ${i === v ? $a : za}`,
                borderRadius: 7,
                padding: "5px 9px",
                background: jn,
                color: i === v ? $a : on,
                cursor: "pointer"
              }
            },
            g
          )
        )
      ),
      i === "flow" ? e.createElement(dd, { payload: d }) : e.createElement(ud, { payload: d, compact: !0 })
    ) : o === "evidence" ? e.createElement(
      "div",
      { role: "tabpanel" },
      e.createElement(Yc, { payload: d })
    ) : e.createElement(
      "div",
      { role: "tabpanel" },
      e.createElement(Qc, { payload: d })
    )
  );
}
function Rt(e) {
  var t;
  if (typeof e == "string")
    try {
      return Rt(JSON.parse(e));
    } catch {
      return null;
    }
  return Array.isArray(e) ? Rt((t = e.find((n) => (n == null ? void 0 : n.type) === "text")) == null ? void 0 : t.text) : e != null && e.status && (e != null && e.result) ? {
    ...e.result,
    replay: {
      replayId: String(e.replay_id || ""),
      status: String(e.status),
      reproducible: e.reproducible === !0,
      elapsedMs: typeof e.elapsed_ms == "number" ? e.elapsed_ms : void 0,
      diff: e.diff && typeof e.diff == "object" ? e.diff : {}
    }
  } : (e == null ? void 0 : e.output) !== void 0 ? Rt(e.output) : (e == null ? void 0 : e.content) !== void 0 ? Rt(e.content) : e;
}
function pd(e) {
  var i, c, d, u, m, p, w;
  const t = k().React, n = ((i = e == null ? void 0 : e.data) == null ? void 0 : i.content) || [], r = ((d = (c = n[1]) == null ? void 0 : c.data) == null ? void 0 : d.output) ?? ((m = (u = n[1]) == null ? void 0 : u.data) == null ? void 0 : m.content) ?? ((w = (p = n[0]) == null ? void 0 : p.data) == null ? void 0 : w.output), a = Rt(r), [l, o] = t.useState(null);
  t.useEffect(() => {
    a && o(yr(a));
  }, [r]);
  const s = () => {
    l != null && l.uiId && hr(l.uiId), window.dispatchEvent(
      new CustomEvent("qwenpaw:open-compute-workbench", {
        detail: { uiId: l == null ? void 0 : l.uiId }
      })
    );
  };
  return t.createElement(
    "div",
    {
      style: {
        border: "1px solid var(--ant-color-border-secondary, #f0f0f0)",
        borderRadius: 12,
        padding: 12,
        margin: "6px 0",
        background: "var(--ant-color-bg-container, #fff)"
      }
    },
    a ? t.createElement(fr, {
      payload: a,
      compact: !0,
      onOpenDerivation: s
    }) : t.createElement(
      "span",
      {
        style: {
          color: "var(--ant-color-text-secondary, rgba(0,0,0,.45))"
        }
      },
      "计算中…"
    )
  );
}
let ut = null;
function fd(e, t) {
  var a, l, o, s;
  const n = "ugsci";
  ut == null || ut();
  const r = [];
  if (de("/ugsci/genui/config", {
    bypassCache: !0
  }).then((i) => {
    e.genui = { ...e.genui || {}, config: i };
  }).catch((i) => {
    e.genui = {
      ...e.genui || {},
      config: {
        enabled: !0,
        persisted_enabled: !0,
        overridden: !1,
        channels: ["response.append"],
        allow_html: !1,
        allow_actions: [],
        backend_unavailable: !0
      }
    }, console.warn(
      "[ugsci.genui] Failed to load runtime config; using compatibility fallback",
      i
    );
  }), (a = e.chat) != null && a.toolRender) {
    r.push(
      e.chat.toolRender(n, "emit_ui_tree", fa)
    ), r.push(
      e.chat.toolRender(n, "emit_ui_patch", fa)
    ), r.push(
      e.chat.toolRender(n, "list_ui_components", ga)
    ), r.push(
      e.chat.toolRender(n, "get_genui_guide", ga)
    );
    for (const i of [
      "ugsci_trace_calculation",
      "ugsci_replay_calculation",
      "ugsci_derive_formula",
      "ugsci_evaluate_formula",
      "ugsci_transform_formula",
      "ugsci_formula_preview"
    ])
      r.push(e.chat.toolRender(n, i, pd));
    console.info("[ugsci.genui] Registered emit/patch + catalog/guide cards");
  }
  return (l = e.slot) != null && l.fill && r.push(
    e.slot.fill(
      n,
      "chat.workbench.compute",
      () => t.createElement(md)
    )
  ), (s = (o = e.chat) == null ? void 0 : o.response) != null && s.append && (r.push(
    e.chat.response.append(
      n,
      (i) => {
        const c = () => (t.useEffect(
          () => nd(i.data.output),
          [i.data.output]
        ), null);
        return t.createElement(
          Fs,
          null,
          t.createElement(c),
          t.createElement(cd, { data: i.data })
        );
      },
      { id: "ugsci.genui.response-append", order: 50 }
    )
  ), console.info("[ugsci.genui] Registered response.append slot")), ut = () => {
    var i;
    for (const c of r.reverse()) (i = c == null ? void 0 : c.dispose) == null || i.call(c);
    if (Vs(), ic(), e.genui) {
      const c = { ...e.genui };
      delete c.dispose, delete c.clearSession, e.genui = c;
    }
    ut = null;
  }, e.genui = {
    ...e.genui || {},
    dispose: ut,
    clearSession: Ws
  }, ut;
}
const Pa = {
  enabled: !0,
  persisted_enabled: !0,
  overridden: !1,
  channels: ["response.append"],
  allow_html: !1,
  allow_actions: [],
  backend_unavailable: !0
};
function Nn(e) {
  const t = window.QwenPaw;
  t && (t.genui = { ...t.genui || {}, config: e });
}
function gd() {
  const e = k().React, { Alert: t, Card: n, Space: r, Spin: a, Switch: l, Typography: o, message: s } = k().antd, { useEffect: i, useState: c } = e, [d, u] = c(null), [m, p] = c(!1);
  i(() => {
    let h = !0, y = null;
    const f = (E = !1) => {
      de("/ugsci/genui/config").then((v) => {
        h && (u(v), Nn(v));
      }).catch((v) => {
        h && (u(Pa), Nn(Pa), E && s.error(String(v)), y = setTimeout(() => f(!1), 3e4));
      });
    };
    return f(!0), () => {
      h = !1, y && clearTimeout(y);
    };
  }, []);
  const w = async (h) => {
    p(!0);
    try {
      const y = await de("/ugsci/genui/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: h })
      });
      u(y), Nn(y), s.success(y.overridden ? "设置已保存，但环境变量或插件配置正在覆盖它" : h ? "GenUI 已开启" : "GenUI 已关闭");
    } catch (y) {
      s.error(`保存 GenUI 设置失败：${String(y)}`);
    } finally {
      p(!1);
    }
  };
  return e.createElement(
    "div",
    { style: { padding: 24, maxWidth: 880 } },
    e.createElement(o.Title, { level: 2 }, "GenUI 设置"),
    e.createElement(
      o.Paragraph,
      { type: "secondary" },
      "控制 UGSci 的生成式界面能力。该设置对所有 Agent 生效，新安装时默认开启。"
    ),
    e.createElement(
      n,
      null,
      d === null ? e.createElement(a) : e.createElement(
        r,
        { direction: "vertical", size: 16, style: { width: "100%" } },
        e.createElement(
          r,
          { style: { width: "100%", justifyContent: "space-between" } },
          e.createElement(
            "div",
            null,
            e.createElement(o.Text, { strong: !0 }, "启用 GenUI"),
            e.createElement(
              o.Paragraph,
              { type: "secondary", style: { margin: "4px 0 0" } },
              "允许 Agent 生成卡片、表格、图表、表单，并在对话中交互和增量更新。"
            )
          ),
          e.createElement(l, {
            checked: d.persisted_enabled,
            loading: m,
            disabled: d.backend_unavailable,
            onChange: w
          })
        ),
        e.createElement(t, {
          type: d.backend_unavailable ? "error" : d.enabled ? "success" : "warning",
          showIcon: !0,
          message: d.backend_unavailable ? "UGSci 后端当前不可用，正在使用兼容降级模式；设置不会写入。" : d.enabled ? "GenUI 当前有效；各 Agent 仍可显式关闭自己的 GenUI 工具" : d.overridden ? "GenUI 当前被环境变量或插件配置关闭；本地设置已保存但暂不生效。" : "GenUI 已全局关闭；已有界面仍可查看，但 Agent 不会再生成或更新界面。"
        })
      )
    )
  );
}
let zt = null;
function Nl() {
  return zt || (zt = (async () => {
    var r;
    const e = (r = window.QwenPaw) == null ? void 0 : r.host;
    if (!(e != null && e.getApiUrl))
      throw new Error("[oilgas-vis] QwenPaw.host.getApiUrl not available");
    const t = `${e.getApiUrl(
      "frontend_plugin/ugsci/files/ui/dist/viewer-runtime.js"
    )}?v=0.3.6`;
    console.info("[oilgas-vis] Loading viewer runtime from", t), await new Promise((a, l) => {
      const o = document.createElement("script");
      o.dataset.plugin = "ugsci", o.src = t, o.onload = () => a(), o.onerror = () => l(new Error("Viewer runtime failed to load")), document.head.appendChild(o);
    });
    const n = window.OilGasViewerRuntime;
    if (!n)
      throw new Error(
        "[oilgas-vis] window.OilGasViewerRuntime not found after script load"
      );
    return console.info(
      "[oilgas-vis] Viewer runtime loaded, version:",
      n.version
    ), n;
  })().catch((e) => {
    throw zt = null, e;
  }), zt);
}
function yd() {
  var n;
  const e = new URLSearchParams(window.location.search), t = (n = e.get("path")) == null ? void 0 : n.trim();
  return t ? {
    path: t,
    root: e.get("root") || "project",
    name: e.get("name") || t.replace(/\\/g, "/").split("/").pop() || t,
    agentId: e.get("agentId") || void 0,
    chatId: e.get("chatId") || void 0,
    projectDirOverride: e.get("projectDirOverride") || void 0
  } : null;
}
function Ra(e, t) {
  var a;
  const n = ((a = e.getApiToken) == null ? void 0 : a.call(e)) || "", r = typeof e.buildAuthHeaders == "function" ? { ...e.buildAuthHeaders(t.agentId) } : n ? { Authorization: `Bearer ${n}` } : {};
  return t.agentId && (r["X-Agent-Id"] = t.agentId), t.chatId && (r["X-Chat-Id"] = t.chatId), !t.chatId && t.projectDirOverride && (r["X-Session-Project-Dir"] = t.projectDirOverride), r;
}
async function Oa(e, t, n) {
  if (typeof e.fetch == "function") return e.fetch(t, n);
  const r = t.replace(/^\/ugsci\/visualization/, "");
  return fetch(`${e.getApiUrl("ugsci/visualization")}${r}`, n);
}
async function hd(e, t) {
  var a;
  const n = await Oa(e, "/ugsci/visualization/imports/workspace", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...Ra(e, t)
    },
    body: JSON.stringify({
      path: t.path,
      root: t.root,
      name: t.name.replace(/\.[^.]+$/, "")
    })
  });
  if (!n.ok) throw new Error(`导入失败: HTTP ${n.status}`);
  const r = await n.json();
  for (let l = 0; l < 240; l += 1) {
    const o = await Oa(
      e,
      `/ugsci/visualization/imports/${r.job_id}`,
      { headers: Ra(e, t) }
    );
    if (!o.ok) throw new Error(`状态查询失败: HTTP ${o.status}`);
    const s = await o.json();
    if (s.status === "completed") {
      if (!((a = s.result) != null && a.id)) throw new Error("导入完成但未返回数据集 ID");
      return s.result.id;
    }
    if (s.status === "failed" || s.status === "cancelled")
      throw new Error(s.error || "导入任务未完成");
    await new Promise((i) => setTimeout(i, 750));
  }
  throw new Error("导入超时，请稍后重试");
}
async function Ed(e, t) {
  var r;
  let n;
  for (let a = 0; a < 20; a += 1)
    try {
      await ((r = e.executeCommand) == null ? void 0 : r.call(e, "open", { datasetId: t }));
      return;
    } catch (l) {
      n = l, await new Promise((o) => setTimeout(o, 250));
    }
  if (n) throw n;
}
function bd() {
  const e = k().React, { useEffect: t, useRef: n, useState: r } = e, { Spin: a, Alert: l, Button: o, Typography: s, message: i } = k().antd, { Text: c } = s, d = n(null), u = n(null), [m, p] = r(!0), [w, h] = r(null), [y, f] = r("正在加载三维可视化引擎...");
  return t(() => {
    let E = !1;
    async function v() {
      if (d.current)
        try {
          p(!0), h(null);
          const g = await Nl();
          if (E) return;
          const S = k(), V = {
            apiBase: S.getApiUrl("ugsci/visualization"),
            authToken: S.getApiToken() || void 0
          };
          u.current = g.mount(d.current, V);
          const I = yd();
          if (I) {
            f(`正在导入 ${I.name}...`);
            const $ = await hd(S, I);
            if (E || !u.current || (f("正在打开三维网格..."), await Ed(u.current, $), E)) return;
          }
          E || p(!1);
        } catch (g) {
          if (!E) {
            const S = g instanceof Error ? g.message : "Failed to load viewer";
            h(S), p(!1), i.error(`可视化引擎加载失败: ${S}`);
          }
        }
    }
    return v(), () => {
      if (E = !0, u.current) {
        try {
          u.current.dispose();
        } catch (g) {
          console.warn("[oilgas-vis] Dispose error:", g);
        }
        u.current = null;
      }
    };
  }, []), w ? e.createElement(
    "div",
    {
      style: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        padding: 48,
        gap: 16
      }
    },
    e.createElement(l, {
      type: "error",
      message: "可视化引擎加载失败",
      description: w,
      showIcon: !0,
      style: { maxWidth: 600 }
    }),
    e.createElement(
      o,
      {
        type: "primary",
        onClick: () => window.location.reload()
      },
      "重试"
    ),
    e.createElement(
      c,
      { type: "secondary" },
      "如果持续失败，请检查网络连接或联系管理员。"
    )
  ) : e.createElement(
    "div",
    {
      style: { width: "100%", height: "100%", position: "relative" }
    },
    e.createElement("div", {
      ref: d,
      style: { width: "100%", height: "100%" }
    }),
    m && e.createElement(
      "div",
      {
        style: {
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          textAlign: "center"
        }
      },
      e.createElement(a, { size: "large" }),
      e.createElement(
        "div",
        { style: { marginTop: 16, color: "#8b949e" } },
        y
      )
    )
  );
}
function Dl(e, t) {
  var a;
  const n = ((a = e.getApiToken) == null ? void 0 : a.call(e)) || "", r = typeof e.buildAuthHeaders == "function" ? { ...e.buildAuthHeaders(t.agentId) } : n ? { Authorization: `Bearer ${n}` } : {};
  return t.agentId && (r["X-Agent-Id"] = t.agentId), t.chatId && (r["X-Chat-Id"] = t.chatId), !t.chatId && t.projectDirOverride && (r["X-Session-Project-Dir"] = t.projectDirOverride), r;
}
async function Fl(e, t, n) {
  if (typeof e.fetch == "function")
    return e.fetch(t, n);
  const r = t.replace(/^\/ugsci\/visualization/, "");
  return fetch(`${e.getApiUrl("ugsci/visualization")}${r}`, n);
}
function Ma(e) {
  switch (e) {
    case "queued":
      return "已提交，等待后台处理";
    case "running":
      return "后台解析中，大型网格可能需要一些时间";
    case "completed":
      return "导入完成，正在加载三维场景";
    case "cancelled":
      return "导入任务已取消";
    default:
      return "";
  }
}
function vd({ jobId: e, file: t }) {
  const n = k().React, { useEffect: r, useRef: a, useState: l } = n, o = k(), s = a(null), i = a(null), [c, d] = l("queued"), [u, m] = l(0), [p, w] = l(null), [h, y] = l(null);
  return r(() => {
    let f = !1;
    return (async () => {
      var g;
      const v = `/ugsci/visualization/imports/${e}`;
      for (let S = 0; S < 240 && !f; S += 1) {
        try {
          const z = await Fl(o, v, {
            headers: { ...Dl(o, t) }
          });
          if (!z.ok) throw new Error(`状态查询失败: HTTP ${z.status}`);
          const V = await z.json();
          if (f) return;
          if (m(Number(V.progress || 0)), d(V.status), V.status === "completed") {
            if (!((g = V.result) != null && g.id)) throw new Error("导入完成但未返回数据集 ID");
            y(V.result.id);
            return;
          }
          if (V.status === "failed" || V.status === "cancelled") {
            w(V.error || Ma(V.status));
            return;
          }
        } catch (z) {
          if (S >= 239 && !f) {
            d("failed"), w(z instanceof Error ? z.message : String(z));
            return;
          }
        }
        await new Promise((z) => setTimeout(z, 750));
      }
    })(), () => {
      f = !0;
    };
  }, [e, t.agentId, t.chatId, t.projectDirOverride]), r(() => {
    if (c !== "completed" || !h || !s.current) return;
    let f = !1;
    return (async () => {
      var E, v;
      try {
        const g = await Nl();
        if (f || !s.current) return;
        i.current = g.mount(s.current, {
          apiBase: o.getApiUrl("ugsci/visualization"),
          authToken: o.getApiToken() || void 0
        });
        let S;
        for (let z = 0; z < 20 && !f; z += 1)
          try {
            await ((v = (E = i.current).executeCommand) == null ? void 0 : v.call(E, "open", { datasetId: h })), S = void 0;
            break;
          } catch (V) {
            S = V;
            const I = V instanceof Error ? V.message : String(V);
            if (!I.includes("数据集不存在") && !I.includes("dataset"))
              throw V;
            await new Promise(($) => setTimeout($, 250));
          }
        if (S && !f) throw S;
      } catch (g) {
        f || (d("failed"), w(g instanceof Error ? g.message : String(g)));
      }
    })(), () => {
      var E;
      f = !0;
      try {
        (E = i.current) == null || E.dispose();
      } catch {
      }
      i.current = null;
    };
  }, [c, h]), n.createElement(
    "div",
    { style: { width: "100%", marginTop: 8 } },
    c === "completed" ? n.createElement("div", {
      ref: s,
      style: {
        // The legacy viewer uses absolute-positioned panels.  Establish a
        // local positioning context so those panels stay inside the
        // preview card instead of anchoring to the workspace viewport.
        position: "relative",
        isolation: "isolate",
        width: "100%",
        height: "300px",
        minHeight: 0,
        border: "1px solid #30363d",
        borderRadius: 8,
        overflow: "hidden",
        contain: "layout paint style"
      }
    }) : n.createElement(
      "div",
      { style: { padding: "12px 16px", width: "100%", color: "#8b949e" } },
      `${Ma(c)}${u > 0 ? `（${Math.round(u * 100)}%）` : ""}`
    ),
    p ? n.createElement(
      "div",
      { style: { marginTop: 6, color: "#ff7875", fontSize: 12 } },
      `预览状态：${p}`
    ) : null
  );
}
function wd(e) {
  const t = k().React, { useEffect: n, useState: r } = t, { Button: a, Spin: l, Alert: o, Typography: s } = k().antd, { Text: i } = s, c = e.artifact || e.file || {}, d = c.filename || c.title || e.filename || "unknown", u = c.workspacePath || c.path || e.workspacePath, [m, p] = r("idle"), [w, h] = r(null), [y, f] = r(null);
  return n(() => {
    if (!u) return;
    let E = !1;
    return p("submitting"), h(null), f(null), (async () => {
      try {
        const v = k(), g = await Fl(v, "/ugsci/visualization/imports/workspace", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...Dl(v, c)
          },
          body: JSON.stringify({
            path: u,
            root: c.workspaceRoot || "project",
            name: d.replace(/\.[^.]+$/, "")
          })
        });
        if (!g.ok) throw new Error(`Import failed: HTTP ${g.status}`);
        const S = await g.json();
        E || (h(S.job_id), p("submitted"));
      } catch (v) {
        E || (f(v instanceof Error ? v.message : String(v)), p("failed"));
      }
    })(), () => {
      E = !0;
    };
  }, [u, d, c.workspaceRoot, c.agentId, c.chatId, c.projectDirOverride]), m === "submitting" ? t.createElement(
    "div",
    { style: { padding: 24, textAlign: "center" } },
    t.createElement(l, { size: "large" }),
    t.createElement(
      "div",
      { style: { marginTop: 8, color: "#8b949e" } },
      "正在提交工作区文件，浏览器不会复制大型文件..."
    )
  ) : m === "failed" ? t.createElement(
    "div",
    { style: { padding: 24 } },
    t.createElement(o, {
      type: "warning",
      message: "导入失败",
      description: y,
      showIcon: !0
    }),
    t.createElement(a, {
      type: "primary",
      onClick: () => window.location.reload(),
      style: { marginTop: 12 }
    }, "重试")
  ) : t.createElement(
    "div",
    { style: { padding: 24, display: "flex", flexDirection: "column", gap: 12, alignItems: "center" } },
    t.createElement(i, { strong: !0 }, `文件: ${d}`),
    c.size ? t.createElement(i, { type: "secondary" }, `大小: ${(c.size / 1024 / 1024).toFixed(1)} MB`) : null,
    w ? t.createElement(vd, { jobId: w, file: c }) : t.createElement(i, { type: "secondary" }, "正在准备导入任务..."),
    t.createElement(a, {
      type: "primary",
      onClick: () => {
        window.history.pushState({}, "", "/oilgas-visualization"), window.dispatchEvent(new PopStateEvent("popstate"));
      }
    }, "打开油气可视化页面")
  );
}
function Sd(e, t) {
  const n = "__ugsciVisualizationFrontendRegistered", r = window;
  if (r[n]) return;
  r[n] = !0;
  const a = k().antdIcons || {}, l = a.GlobalOutlined || a.AppstoreOutlined;
  e.route.add("ugsci", {
    id: "ugsci.visualization",
    path: "/oilgas-visualization",
    component: bd
  }), e.menu.add("ugsci", {
    id: "ugsci.visualization",
    location: "primary.agentScoped",
    label: () => "油气可视化",
    icon: l ? t.createElement(l, { style: { fontSize: 16 } }) : void 0,
    route: "ugsci.visualization",
    order: 7,
    visible: () => !0
  });
  const o = e.workspace;
  if (o != null && o.registerRenderer)
    try {
      o.registerRenderer({
        id: "ugsci.visualization",
        name: "UGSci 油气可视化",
        component: wd,
        extensions: [
          "egrid",
          "grid",
          "grdecl",
          "init",
          "unrst",
          "roff",
          "roffbin",
          "dat",
          "sr3",
          "irf",
          "data",
          "model",
          "tnav",
          "tpr",
          "las",
          "las3",
          "dlis",
          "vtk",
          "vtu",
          "pvtu",
          "vti",
          "xdmf",
          "csv",
          "arrow",
          "parquet",
          "well.json",
          "surface.json",
          "network.json",
          "json"
        ],
        mimeTypes: [
          "application/x-eclipse-grid",
          "application/x-eclipse-init",
          "application/x-eclipse-unrst",
          "application/x-cmg-dat",
          "application/x-cmg-sr3",
          "application/x-tnavigator-data",
          "application/x-roff",
          "application/x-las",
          "application/x-dlis",
          "application/vnd.vtk",
          "application/x-vtu",
          "application/x-pvtu",
          "application/x-xdmf",
          "text/csv",
          "application/vnd.apache.arrow.file"
        ],
        priority: 200,
        description: "UGSci 油气三维网格、井、剖面和测井可视化"
      });
    } catch (s) {
      console.warn("[ugsci] Visualization workspace renderer registration failed:", s);
    }
}
function xd() {
  var d, u, m, p;
  const e = window.QwenPaw;
  if (!(e != null && e.menu) || !(e != null && e.route)) {
    console.warn(
      "[ugsci] QwenPaw.menu/route API not available — plugin disabled"
    );
    return;
  }
  const t = k().React, n = "ugsci";
  function r() {
    return k().React.createElement(Ls, { embedded: !0 });
  }
  function a() {
    return k().React.useEffect(() => {
      window.history.replaceState({}, "", "/market?tab=ugsci"), window.dispatchEvent(new PopStateEvent("popstate"));
    }, []), null;
  }
  (u = (d = e.chat) == null ? void 0 : d.rightHeader) != null && u.add ? (e.chat.rightHeader.add(n, t.createElement(Us), {
    id: "ugsci.welcome-injector",
    order: -1
    // render before other right-header items (invisible anyway)
  }), console.info("[ugsci] WelcomePromptsInjector registered via rightHeader")) : console.warn(
    "[ugsci] QP.chat.rightHeader.add not available — agent-specific welcome prompts disabled"
  );
  const l = k().antdIcons || {}, o = l.UserSwitchOutlined, s = l.ToolOutlined, i = l.AppstoreOutlined;
  e.route.add(n, {
    id: "ugsci.experts",
    path: "/ugsci-experts",
    component: Bi
  }), e.menu.add(n, {
    id: "ugsci.experts",
    location: "primary.agentScoped",
    label: () => "专家·协作",
    icon: o ? t.createElement(o, { style: { fontSize: 16 } }) : void 0,
    route: "ugsci.experts",
    order: 5,
    visible: () => Xt()
  }), e.route.add(n, {
    id: "ugsci.genui-settings",
    path: "/ugsci-genui-settings",
    component: gd
  }), e.menu.add(n, {
    id: "ugsci.genui-settings",
    location: "primary.settings",
    parentId: "plugins-group",
    label: () => "GenUI 设置",
    icon: i ? t.createElement(i, { style: { fontSize: 16 } }) : void 0,
    route: "ugsci.genui-settings",
    order: 30
  }), e.route.add(n, {
    id: "ugsci.tools-skills",
    path: "/ugsci-tools-skills",
    component: dl
  }), e.menu.add(n, {
    id: "ugsci.tools-skills",
    location: "primary.agentScoped",
    label: () => "工具·技能",
    icon: s ? t.createElement(s, { style: { fontSize: 16 } }) : void 0,
    route: "ugsci.tools-skills",
    order: 6,
    visible: () => Xt()
  }), e.route.add(n, {
    id: "ugsci.capabilities",
    path: "/ugsci-capabilities",
    component: gs
  }), e.route.add(n, {
    id: "ugsci.skills-center",
    path: "/ugsci-skills",
    component: ys
  }), e.route.add(n, {
    id: "ugsci.market",
    path: "/ugsci-market",
    component: a
  }), (m = e.marketplace) == null || m.add(n, {
    id: "ugsci",
    label: "UGSci",
    component: r,
    order: 30
  }), (p = e.sidebar) != null && p.registerSimpleModeItems ? (e.sidebar.registerSimpleModeItems([
    "ugsci.experts",
    "ugsci.tools-skills"
  ]), console.info("[ugsci] Registered 2 items for simple-mode visibility")) : console.warn(
    "[ugsci] window.QwenPaw.sidebar.registerSimpleModeItems not available — items will not appear in simple mode"
  );
  const c = [
    "core.skills",
    "core.tools",
    "core.acp",
    "core.agent-config",
    "core.agent-stats",
    "core.skill-pool"
  ];
  for (const w of c) {
    try {
      const y = e.menu.snapshot("primary.agentScoped").find((f) => f.id === w);
      y && e.menu.replace(n, w, {
        ...y,
        visible: () => !Xt()
      });
    } catch {
    }
    try {
      const y = e.menu.snapshot("primary.settings").find((f) => f.id === w);
      y && e.menu.replace(n, w, {
        ...y,
        visible: () => !Xt()
      });
    } catch {
    }
  }
  try {
    const h = e.menu.snapshot("primary.agentScoped").find((y) => y.id === "oilgas-vis.page");
    h && e.menu.replace(n, "oilgas-vis.page", {
      ...h,
      visible: () => !1
    });
  } catch {
  }
  fd(e, t), Sd(e, t), console.info(
    "[ugsci] Plugin registered: unified Tools & Skills center + compatibility routes, simple-mode navigation active"
  );
}
function er() {
  try {
    xd();
  } catch (e) {
    console.error("[ugsci] Failed to build plugin:", e), setTimeout(er, 500);
  }
}
var Ga;
if ((Ga = window.QwenPaw) != null && Ga.host)
  er();
else {
  const e = setInterval(() => {
    var t;
    (t = window.QwenPaw) != null && t.host && (clearInterval(e), er());
  }, 200);
  setTimeout(() => clearInterval(e), 1e4);
}
function kd(e, t) {
  if (e.match(/^[a-z]+:\/\//i))
    return e;
  if (e.match(/^\/\//))
    return window.location.protocol + e;
  if (e.match(/^[a-z]+:/i))
    return e;
  const n = document.implementation.createHTMLDocument(), r = n.createElement("base"), a = n.createElement("a");
  return n.head.appendChild(r), n.body.appendChild(a), t && (r.href = t), a.href = e, a.href;
}
const Cd = /* @__PURE__ */ (() => {
  let e = 0;
  const t = () => (
    // eslint-disable-next-line no-bitwise
    `0000${(Math.random() * 36 ** 4 << 0).toString(36)}`.slice(-4)
  );
  return () => (e += 1, `u${t()}${e}`);
})();
function it(e) {
  const t = [];
  for (let n = 0, r = e.length; n < r; n++)
    t.push(e[n]);
  return t;
}
let ht = null;
function Gl(e = {}) {
  return ht || (e.includeStyleProperties ? (ht = e.includeStyleProperties, ht) : (ht = it(window.getComputedStyle(document.documentElement)), ht));
}
function yn(e, t) {
  const r = (e.ownerDocument.defaultView || window).getComputedStyle(e).getPropertyValue(t);
  return r ? parseFloat(r.replace("px", "")) : 0;
}
function Td(e) {
  const t = yn(e, "border-left-width"), n = yn(e, "border-right-width");
  return e.clientWidth + t + n;
}
function _d(e) {
  const t = yn(e, "border-top-width"), n = yn(e, "border-bottom-width");
  return e.clientHeight + t + n;
}
function Hl(e, t = {}) {
  const n = t.width || Td(e), r = t.height || _d(e);
  return { width: n, height: r };
}
function Id() {
  let e, t;
  try {
    t = process;
  } catch {
  }
  const n = t && t.env ? t.env.devicePixelRatio : null;
  return n && (e = parseInt(n, 10), Number.isNaN(e) && (e = 1)), e || window.devicePixelRatio || 1;
}
const Je = 16384;
function Ad(e) {
  (e.width > Je || e.height > Je) && (e.width > Je && e.height > Je ? e.width > e.height ? (e.height *= Je / e.width, e.width = Je) : (e.width *= Je / e.height, e.height = Je) : e.width > Je ? (e.height *= Je / e.width, e.width = Je) : (e.width *= Je / e.height, e.height = Je));
}
function hn(e) {
  return new Promise((t, n) => {
    const r = new Image();
    r.onload = () => {
      r.decode().then(() => {
        requestAnimationFrame(() => t(r));
      });
    }, r.onerror = n, r.crossOrigin = "anonymous", r.decoding = "async", r.src = e;
  });
}
async function zd(e) {
  return Promise.resolve().then(() => new XMLSerializer().serializeToString(e)).then(encodeURIComponent).then((t) => `data:image/svg+xml;charset=utf-8,${t}`);
}
async function $d(e, t, n) {
  const r = "http://www.w3.org/2000/svg", a = document.createElementNS(r, "svg"), l = document.createElementNS(r, "foreignObject");
  return a.setAttribute("width", `${t}`), a.setAttribute("height", `${n}`), a.setAttribute("viewBox", `0 0 ${t} ${n}`), l.setAttribute("width", "100%"), l.setAttribute("height", "100%"), l.setAttribute("x", "0"), l.setAttribute("y", "0"), l.setAttribute("externalResourcesRequired", "true"), a.appendChild(l), l.appendChild(e), zd(a);
}
const Ve = (e, t) => {
  if (e instanceof t)
    return !0;
  const n = Object.getPrototypeOf(e);
  return n === null ? !1 : n.constructor.name === t.name || Ve(n, t);
};
function Pd(e) {
  const t = e.getPropertyValue("content");
  return `${e.cssText} content: '${t.replace(/'|"/g, "")}';`;
}
function Rd(e, t) {
  return Gl(t).map((n) => {
    const r = e.getPropertyValue(n), a = e.getPropertyPriority(n);
    return `${n}: ${r}${a ? " !important" : ""};`;
  }).join(" ");
}
function Od(e, t, n, r) {
  const a = `.${e}:${t}`, l = n.cssText ? Pd(n) : Rd(n, r);
  return document.createTextNode(`${a}{${l}}`);
}
function La(e, t, n, r) {
  const a = window.getComputedStyle(e, n), l = a.getPropertyValue("content");
  if (l === "" || l === "none")
    return;
  const o = Cd();
  try {
    t.className = `${t.className} ${o}`;
  } catch {
    return;
  }
  const s = document.createElement("style");
  s.appendChild(Od(o, n, a, r)), t.appendChild(s);
}
function Md(e, t, n) {
  La(e, t, ":before", n), La(e, t, ":after", n);
}
const Ba = "application/font-woff", Ua = "image/jpeg", Ld = {
  woff: Ba,
  woff2: Ba,
  ttf: "application/font-truetype",
  eot: "application/vnd.ms-fontobject",
  png: "image/png",
  jpg: Ua,
  jpeg: Ua,
  gif: "image/gif",
  tiff: "image/tiff",
  svg: "image/svg+xml",
  webp: "image/webp"
};
function Bd(e) {
  const t = /\.([^./]*?)$/g.exec(e);
  return t ? t[1] : "";
}
function Er(e) {
  const t = Bd(e).toLowerCase();
  return Ld[t] || "";
}
function Ud(e) {
  return e.split(/,/)[1];
}
function tr(e) {
  return e.search(/^(data:)/) !== -1;
}
function jd(e, t) {
  return `data:${t};base64,${e}`;
}
async function Wl(e, t, n) {
  const r = await fetch(e, t);
  if (r.status === 404)
    throw new Error(`Resource "${r.url}" not found`);
  const a = await r.blob();
  return new Promise((l, o) => {
    const s = new FileReader();
    s.onerror = o, s.onloadend = () => {
      try {
        l(n({ res: r, result: s.result }));
      } catch (i) {
        o(i);
      }
    }, s.readAsDataURL(a);
  });
}
const Dn = {};
function Nd(e, t, n) {
  let r = e.replace(/\?.*/, "");
  return n && (r = e), /ttf|otf|eot|woff2?/i.test(r) && (r = r.replace(/.*\//, "")), t ? `[${t}]${r}` : r;
}
async function br(e, t, n) {
  const r = Nd(e, t, n.includeQueryParams);
  if (Dn[r] != null)
    return Dn[r];
  n.cacheBust && (e += (/\?/.test(e) ? "&" : "?") + (/* @__PURE__ */ new Date()).getTime());
  let a;
  try {
    const l = await Wl(e, n.fetchRequestInit, ({ res: o, result: s }) => (t || (t = o.headers.get("Content-Type") || ""), Ud(s)));
    a = jd(l, t);
  } catch (l) {
    a = n.imagePlaceholder || "";
    let o = `Failed to fetch resource: ${e}`;
    l && (o = typeof l == "string" ? l : l.message), o && console.warn(o);
  }
  return Dn[r] = a, a;
}
async function Dd(e) {
  const t = e.toDataURL();
  return t === "data:," ? e.cloneNode(!1) : hn(t);
}
async function Fd(e, t) {
  if (e.currentSrc) {
    const l = document.createElement("canvas"), o = l.getContext("2d");
    l.width = e.clientWidth, l.height = e.clientHeight, o == null || o.drawImage(e, 0, 0, l.width, l.height);
    const s = l.toDataURL();
    return hn(s);
  }
  const n = e.poster, r = Er(n), a = await br(n, r, t);
  return hn(a);
}
async function Gd(e, t) {
  var n;
  try {
    if (!((n = e == null ? void 0 : e.contentDocument) === null || n === void 0) && n.body)
      return await Tn(e.contentDocument.body, t, !0);
  } catch {
  }
  return e.cloneNode(!1);
}
async function Hd(e, t) {
  return Ve(e, HTMLCanvasElement) ? Dd(e) : Ve(e, HTMLVideoElement) ? Fd(e, t) : Ve(e, HTMLIFrameElement) ? Gd(e, t) : e.cloneNode(Vl(e));
}
const Wd = (e) => e.tagName != null && e.tagName.toUpperCase() === "SLOT", Vl = (e) => e.tagName != null && e.tagName.toUpperCase() === "SVG";
async function Vd(e, t, n) {
  var r, a;
  if (Vl(t))
    return t;
  let l = [];
  return Wd(e) && e.assignedNodes ? l = it(e.assignedNodes()) : Ve(e, HTMLIFrameElement) && (!((r = e.contentDocument) === null || r === void 0) && r.body) ? l = it(e.contentDocument.body.childNodes) : l = it(((a = e.shadowRoot) !== null && a !== void 0 ? a : e).childNodes), l.length === 0 || Ve(e, HTMLVideoElement) || await l.reduce((o, s) => o.then(() => Tn(s, n)).then((i) => {
    i && t.appendChild(i);
  }), Promise.resolve()), t;
}
function qd(e, t, n) {
  const r = t.style;
  if (!r)
    return;
  const a = window.getComputedStyle(e);
  a.cssText ? (r.cssText = a.cssText, r.transformOrigin = a.transformOrigin) : Gl(n).forEach((l) => {
    let o = a.getPropertyValue(l);
    l === "font-size" && o.endsWith("px") && (o = `${Math.floor(parseFloat(o.substring(0, o.length - 2))) - 0.1}px`), Ve(e, HTMLIFrameElement) && l === "display" && o === "inline" && (o = "block"), l === "d" && t.getAttribute("d") && (o = `path(${t.getAttribute("d")})`), r.setProperty(l, o, a.getPropertyPriority(l));
  });
}
function Jd(e, t) {
  Ve(e, HTMLTextAreaElement) && (t.innerHTML = e.value), Ve(e, HTMLInputElement) && t.setAttribute("value", e.value);
}
function Kd(e, t) {
  if (Ve(e, HTMLSelectElement)) {
    const n = t, r = Array.from(n.children).find((a) => e.value === a.getAttribute("value"));
    r && r.setAttribute("selected", "");
  }
}
function Xd(e, t, n) {
  return Ve(t, Element) && (qd(e, t, n), Md(e, t, n), Jd(e, t), Kd(e, t)), t;
}
async function Yd(e, t) {
  const n = e.querySelectorAll ? e.querySelectorAll("use") : [];
  if (n.length === 0)
    return e;
  const r = {};
  for (let l = 0; l < n.length; l++) {
    const s = n[l].getAttribute("xlink:href");
    if (s) {
      const i = e.querySelector(s), c = document.querySelector(s);
      !i && c && !r[s] && (r[s] = await Tn(c, t, !0));
    }
  }
  const a = Object.values(r);
  if (a.length) {
    const l = "http://www.w3.org/1999/xhtml", o = document.createElementNS(l, "svg");
    o.setAttribute("xmlns", l), o.style.position = "absolute", o.style.width = "0", o.style.height = "0", o.style.overflow = "hidden", o.style.display = "none";
    const s = document.createElementNS(l, "defs");
    o.appendChild(s);
    for (let i = 0; i < a.length; i++)
      s.appendChild(a[i]);
    e.appendChild(o);
  }
  return e;
}
async function Tn(e, t, n) {
  return !n && t.filter && !t.filter(e) ? null : Promise.resolve(e).then((r) => Hd(r, t)).then((r) => Vd(e, r, t)).then((r) => Xd(e, r, t)).then((r) => Yd(r, t));
}
const ql = /url\((['"]?)([^'"]+?)\1\)/g, Qd = /url\([^)]+\)\s*format\((["']?)([^"']+)\1\)/g, Zd = /src:\s*(?:url\([^)]+\)\s*format\([^)]+\)[,;]\s*)+/g;
function eu(e) {
  const t = e.replace(/([.*+?^${}()|\[\]\/\\])/g, "\\$1");
  return new RegExp(`(url\\(['"]?)(${t})(['"]?\\))`, "g");
}
function tu(e) {
  const t = [];
  return e.replace(ql, (n, r, a) => (t.push(a), n)), t.filter((n) => !tr(n));
}
async function nu(e, t, n, r, a) {
  try {
    const l = n ? kd(t, n) : t, o = Er(t);
    let s;
    return a || (s = await br(l, o, r)), e.replace(eu(t), `$1${s}$3`);
  } catch {
  }
  return e;
}
function ru(e, { preferredFontFormat: t }) {
  return t ? e.replace(Zd, (n) => {
    for (; ; ) {
      const [r, , a] = Qd.exec(n) || [];
      if (!a)
        return "";
      if (a === t)
        return `src: ${r};`;
    }
  }) : e;
}
function Jl(e) {
  return e.search(ql) !== -1;
}
async function Kl(e, t, n) {
  if (!Jl(e))
    return e;
  const r = ru(e, n);
  return tu(r).reduce((l, o) => l.then((s) => nu(s, o, t, n)), Promise.resolve(r));
}
async function Et(e, t, n) {
  var r;
  const a = (r = t.style) === null || r === void 0 ? void 0 : r.getPropertyValue(e);
  if (a) {
    const l = await Kl(a, null, n);
    return t.style.setProperty(e, l, t.style.getPropertyPriority(e)), !0;
  }
  return !1;
}
async function au(e, t) {
  await Et("background", e, t) || await Et("background-image", e, t), await Et("mask", e, t) || await Et("-webkit-mask", e, t) || await Et("mask-image", e, t) || await Et("-webkit-mask-image", e, t);
}
async function lu(e, t) {
  const n = Ve(e, HTMLImageElement);
  if (!(n && !tr(e.src)) && !(Ve(e, SVGImageElement) && !tr(e.href.baseVal)))
    return;
  const r = n ? e.src : e.href.baseVal, a = await br(r, Er(r), t);
  await new Promise((l, o) => {
    e.onload = l, e.onerror = t.onImageErrorHandler ? (...i) => {
      try {
        l(t.onImageErrorHandler(...i));
      } catch (c) {
        o(c);
      }
    } : o;
    const s = e;
    s.decode && (s.decode = l), s.loading === "lazy" && (s.loading = "eager"), n ? (e.srcset = "", e.src = a) : e.href.baseVal = a;
  });
}
async function ou(e, t) {
  const r = it(e.childNodes).map((a) => Xl(a, t));
  await Promise.all(r).then(() => e);
}
async function Xl(e, t) {
  Ve(e, Element) && (await au(e, t), await lu(e, t), await ou(e, t));
}
function iu(e, t) {
  const { style: n } = e;
  t.backgroundColor && (n.backgroundColor = t.backgroundColor), t.width && (n.width = `${t.width}px`), t.height && (n.height = `${t.height}px`);
  const r = t.style;
  return r != null && Object.keys(r).forEach((a) => {
    n[a] = r[a];
  }), e;
}
const ja = {};
async function Na(e) {
  let t = ja[e];
  if (t != null)
    return t;
  const r = await (await fetch(e)).text();
  return t = { url: e, cssText: r }, ja[e] = t, t;
}
async function Da(e, t) {
  let n = e.cssText;
  const r = /url\(["']?([^"')]+)["']?\)/g, l = (n.match(/url\([^)]+\)/g) || []).map(async (o) => {
    let s = o.replace(r, "$1");
    return s.startsWith("https://") || (s = new URL(s, e.url).href), Wl(s, t.fetchRequestInit, ({ result: i }) => (n = n.replace(o, `url(${i})`), [o, i]));
  });
  return Promise.all(l).then(() => n);
}
function Fa(e) {
  if (e == null)
    return [];
  const t = [], n = /(\/\*[\s\S]*?\*\/)/gi;
  let r = e.replace(n, "");
  const a = new RegExp("((@.*?keyframes [\\s\\S]*?){([\\s\\S]*?}\\s*?)})", "gi");
  for (; ; ) {
    const i = a.exec(r);
    if (i === null)
      break;
    t.push(i[0]);
  }
  r = r.replace(a, "");
  const l = /@import[\s\S]*?url\([^)]*\)[\s\S]*?;/gi, o = "((\\s*?(?:\\/\\*[\\s\\S]*?\\*\\/)?\\s*?@media[\\s\\S]*?){([\\s\\S]*?)}\\s*?})|(([\\s\\S]*?){([\\s\\S]*?)})", s = new RegExp(o, "gi");
  for (; ; ) {
    let i = l.exec(r);
    if (i === null) {
      if (i = s.exec(r), i === null)
        break;
      l.lastIndex = s.lastIndex;
    } else
      s.lastIndex = l.lastIndex;
    t.push(i[0]);
  }
  return t;
}
async function su(e, t) {
  const n = [], r = [];
  return e.forEach((a) => {
    if ("cssRules" in a)
      try {
        it(a.cssRules || []).forEach((l, o) => {
          if (l.type === CSSRule.IMPORT_RULE) {
            let s = o + 1;
            const i = l.href, c = Na(i).then((d) => Da(d, t)).then((d) => Fa(d).forEach((u) => {
              try {
                a.insertRule(u, u.startsWith("@import") ? s += 1 : a.cssRules.length);
              } catch (m) {
                console.error("Error inserting rule from remote css", {
                  rule: u,
                  error: m
                });
              }
            })).catch((d) => {
              console.error("Error loading remote css", d.toString());
            });
            r.push(c);
          }
        });
      } catch (l) {
        const o = e.find((s) => s.href == null) || document.styleSheets[0];
        a.href != null && r.push(Na(a.href).then((s) => Da(s, t)).then((s) => Fa(s).forEach((i) => {
          o.insertRule(i, o.cssRules.length);
        })).catch((s) => {
          console.error("Error loading remote stylesheet", s);
        })), console.error("Error inlining remote css file", l);
      }
  }), Promise.all(r).then(() => (e.forEach((a) => {
    if ("cssRules" in a)
      try {
        it(a.cssRules || []).forEach((l) => {
          n.push(l);
        });
      } catch (l) {
        console.error(`Error while reading CSS rules from ${a.href}`, l);
      }
  }), n));
}
function cu(e) {
  return e.filter((t) => t.type === CSSRule.FONT_FACE_RULE).filter((t) => Jl(t.style.getPropertyValue("src")));
}
async function du(e, t) {
  if (e.ownerDocument == null)
    throw new Error("Provided element is not within a Document");
  const n = it(e.ownerDocument.styleSheets), r = await su(n, t);
  return cu(r);
}
function Yl(e) {
  return e.trim().replace(/["']/g, "");
}
function uu(e) {
  const t = /* @__PURE__ */ new Set();
  function n(r) {
    (r.style.fontFamily || getComputedStyle(r).fontFamily).split(",").forEach((l) => {
      t.add(Yl(l));
    }), Array.from(r.children).forEach((l) => {
      l instanceof HTMLElement && n(l);
    });
  }
  return n(e), t;
}
async function mu(e, t) {
  const n = await du(e, t), r = uu(e);
  return (await Promise.all(n.filter((l) => r.has(Yl(l.style.fontFamily))).map((l) => {
    const o = l.parentStyleSheet ? l.parentStyleSheet.href : null;
    return Kl(l.cssText, o, t);
  }))).join(`
`);
}
async function pu(e, t) {
  const n = t.fontEmbedCSS != null ? t.fontEmbedCSS : t.skipFonts ? null : await mu(e, t);
  if (n) {
    const r = document.createElement("style"), a = document.createTextNode(n);
    r.appendChild(a), e.firstChild ? e.insertBefore(r, e.firstChild) : e.appendChild(r);
  }
}
async function Ql(e, t = {}) {
  const { width: n, height: r } = Hl(e, t), a = await Tn(e, t, !0);
  return await pu(a, t), await Xl(a, t), iu(a, t), await $d(a, n, r);
}
async function Zl(e, t = {}) {
  const { width: n, height: r } = Hl(e, t), a = await Ql(e, t), l = await hn(a), o = document.createElement("canvas"), s = o.getContext("2d"), i = t.pixelRatio || Id(), c = t.canvasWidth || n, d = t.canvasHeight || r;
  return o.width = c * i, o.height = d * i, t.skipAutoScale || Ad(o), o.style.width = `${c}`, o.style.height = `${d}`, t.backgroundColor && (s.fillStyle = t.backgroundColor, s.fillRect(0, 0, o.width, o.height)), s.drawImage(l, 0, 0, o.width, o.height), o;
}
async function fu(e, t = {}) {
  return (await Zl(e, t)).toDataURL();
}
const gu = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  toCanvas: Zl,
  toPng: fu,
  toSvg: Ql
}, Symbol.toStringTag, { value: "Module" }));
