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
function tr(e) {
  for (const [t, n] of Ut)
    (e ? n.agentId === e : n.agentId) && Ut.delete(t);
}
async function ce(e, t) {
  const n = ((t == null ? void 0 : t.method) || "GET").toUpperCase(), { bypassCache: r, ...a } = t || {}, l = So(
    a.headers
  ), o = xo(n, e, l);
  if (n !== "GET" && (l ? tr(l) : Ht()), n === "GET" && !r) {
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
function nr(e, t) {
  const n = k();
  return n.ReactMarkdown && n.remarkGfm ? t.createElement(
    n.ReactMarkdown,
    { remarkPlugins: [n.remarkGfm] },
    e
  ) : e.replace(/\*\*(.+?)\*\*/g, "$1").replace(/\*(.+?)\*/g, "$1").replace(/`(.+?)`/g, "$1").replace(/^#+\s*/gm, "").replace(/^[-*]\s+/gm, "• ");
}
function bn({
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
async function vn() {
  const e = await ce("/agents");
  return (e == null ? void 0 : e.agents) || [];
}
async function rr(e) {
  return ce(
    `/agents/${encodeURIComponent(e)}`
  );
}
async function wn(e) {
  return await ce(
    `/agents/${encodeURIComponent(e)}/skills`
  ) || [];
}
async function Sn(e = !1) {
  return await ce(`/skills/pool${e ? "?summary=true" : ""}`) || [];
}
async function ko(e) {
  const t = await ce(
    `/skills/pool/${encodeURIComponent(e)}/content`
  );
  return (t == null ? void 0 : t.content) || "";
}
async function Co() {
  return (await ce(
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
  return await ce("/workspace/files", {
    headers: { "X-Agent-Id": e }
  }) || [];
}
async function dn(e, t, n) {
  return ce(`/workspace/files/${encodeURIComponent(t)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify({ content: n })
  });
}
async function _o(e, t, n, r) {
  return ce("/workspace/prompt-files", {
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
  n.system_prompt_files = t, await ce(`/agents/${encodeURIComponent(e)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(n)
  });
}
async function ar(e, t) {
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
async function Wa(e, t) {
  await ce(
    kt(e, `/${encodeURIComponent(t)}/enable`),
    {
      method: "POST"
    }
  );
}
async function lr(e, t) {
  await ce(kt(e, `/${encodeURIComponent(t)}`), {
    method: "DELETE"
  });
}
async function $o(e, t) {
  return ce(kt(e, "/batch-enable"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(t)
  });
}
async function Po(e, t) {
  return ce(kt(e, "/batch-disable"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(t)
  });
}
async function Ro(e, t) {
  return ce(kt(e, "/batch-delete"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(t)
  });
}
async function or(e) {
  return await ce("/mcp", {
    headers: { "X-Agent-Id": e }
  }) || [];
}
async function qa(e, t) {
  await ce(`/mcp/${encodeURIComponent(t)}`, {
    method: "DELETE",
    headers: { "X-Agent-Id": e }
  });
}
async function ir(e, t) {
  return ce("/mcp", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify(t)
  });
}
async function Oo(e, t) {
  return ce(
    `/mcp/toggle/${encodeURIComponent(t)}`,
    {
      method: "PATCH",
      headers: { "X-Agent-Id": e }
    }
  );
}
async function Va(e, t) {
  await ce(
    kt(e, `/${encodeURIComponent(t)}/disable`),
    {
      method: "POST"
    }
  );
}
async function Mo(e) {
  await ce(`/skills/pool/${encodeURIComponent(e)}`, {
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
  return ce("/config/heartbeat", {
    headers: { "X-Agent-Id": e }
  });
}
async function jo(e, t) {
  return ce("/config/heartbeat", {
    method: "PUT",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify(t)
  });
}
async function No(e) {
  await ce("/config/heartbeat/run", {
    method: "POST",
    headers: { "X-Agent-Id": e }
  });
}
async function Do(e) {
  return ce("/workspace/running-config", {
    headers: { "X-Agent-Id": e }
  });
}
async function Fo(e, t) {
  return ce("/workspace/running-config", {
    method: "PUT",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify(t)
  });
}
async function Go(e) {
  return (await ce("/workspace/language", {
    headers: { "X-Agent-Id": e }
  })).language || "zh";
}
async function Ho(e, t) {
  await ce("/workspace/language", {
    method: "PUT",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify({ language: t })
  });
}
async function Wo() {
  return (await ce("/config/user-timezone")).timezone || "UTC";
}
async function qo(e) {
  await ce("/config/user-timezone", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ timezone: e })
  });
}
async function Vo(e) {
  return await ce("/workspace/system-prompt-files", {
    headers: { "X-Agent-Id": e }
  }) || [];
}
const qr = ["AGENTS.md", "SOUL.md", "PROFILE.md"];
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
  const o = k().React, { useState: s, useEffect: i, useMemo: c } = o, { Modal: d, Button: m, Empty: u, Spin: f, Input: w, Tag: h, Tooltip: y, Typography: p } = k().antd, { CheckOutlined: b, SearchOutlined: v } = k().antdIcons || {}, { Text: g } = p, [S, O] = s([]), [W, A] = s("");
  i(() => {
    e && (O([]), A(""));
  }, [e]);
  const I = c(() => {
    if (!W.trim()) return n;
    const C = W.toLowerCase();
    return n.filter(
      (x) => {
        var z, _;
        return x.name.toLowerCase().includes(C) || ((z = x.description) == null ? void 0 : z.toLowerCase().includes(C)) || ((_ = x.tags) == null ? void 0 : _.some((H) => H.toLowerCase().includes(C)));
      }
    );
  }, [n, W]), K = I.filter(
    (C) => !r.includes(C.name)
  ), j = (C) => {
    O(
      (x) => x.includes(C) ? x.filter((z) => z !== C) : [...x, C]
    );
  }, B = async () => {
    S.length !== 0 && (await l(S), O([]));
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
          o.createElement(m, { onClick: t }, "取消"),
          o.createElement(
            m,
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
        value: W,
        onChange: (C) => A(C.target.value),
        allowClear: !0,
        style: { flex: 1 }
      }),
      o.createElement(
        m,
        {
          size: "small",
          type: "primary",
          onClick: () => O(K.map((C) => C.name))
        },
        "全选"
      ),
      o.createElement(
        m,
        {
          size: "small",
          onClick: () => O([])
        },
        "清空"
      )
    ),
    // Skill grid (card style matching Skill Center)
    a ? o.createElement(
      "div",
      { style: { textAlign: "center", padding: 40 } },
      o.createElement(f, { size: "large" })
    ) : I.length === 0 ? o.createElement(u, {
      description: W ? "未找到匹配的技能" : "技能池暂无可用技能",
      image: u.PRESENTED_IMAGE_SIMPLE
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
      ...I.map((C) => {
        const x = S.includes(C.name), z = r.includes(C.name);
        return o.createElement(
          "div",
          {
            key: C.name,
            onClick: () => !z && j(C.name),
            style: {
              position: "relative",
              padding: "10px 12px",
              border: `1px solid ${x ? "#0072f5" : "var(--ant-color-border-secondary, #e8e8e8)"}`,
              borderRadius: 6,
              cursor: z ? "not-allowed" : "pointer",
              transition: "all 0.15s ease",
              background: x ? "rgba(0, 114, 245, 0.06)" : z ? "var(--ant-color-fill-quaternary, #fafafa)" : "var(--ant-color-bg-container, #fff)",
              opacity: z ? 0.5 : 1,
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
            b ? o.createElement(b) : "✓"
          ) : null,
          z ? o.createElement(
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
                paddingRight: z || x ? 24 : 0
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
              (_, H) => o.createElement(
                h,
                {
                  key: H,
                  color: "cyan",
                  style: { fontSize: 10, marginRight: 0 }
                },
                _
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
    Button: m,
    Modal: u,
    Input: f,
    Spin: w,
    Empty: h,
    message: y,
    Typography: p,
    Segmented: b,
    Alert: v
  } = k().antd, { FileTextOutlined: g, PlusOutlined: S, EditOutlined: O, ReloadOutlined: W } = k().antdIcons || {}, { Text: A } = p, [I, K] = a([]), [j, B] = a(!0), [C, x] = a(
    t || []
  ), [z, _] = a(!1), [H, F] = a(null), [D, R] = a(""), [$, ee] = a(""), [ae, N] = a(!1), [M, le] = a("source"), te = s(0), V = o(async () => {
    const X = ++te.current;
    B(!0);
    try {
      const se = await To(e);
      X === te.current && K(se);
    } catch (se) {
      X === te.current && (y.error(se.message || "加载工作区文档失败"), K([]));
    } finally {
      X === te.current && B(!1);
    }
  }, [e]);
  l(() => {
    V();
  }, [V]), l(() => {
    x(t || []);
  }, [t]);
  const ue = async (X, se) => {
    const ne = new Set(C);
    if (se)
      ne.add(X);
    else {
      if (qr.includes(X) && X === "AGENTS.md") {
        y.warning("AGENTS.md 是核心文件，不能停用");
        return;
      }
      ne.delete(X);
    }
    const xe = Array.from(ne);
    x(xe);
    try {
      await zo(e, xe), y.success(se ? "已启用记忆文件" : "已停用记忆文件"), n();
    } catch (Se) {
      y.error(Se.message || "更新失败"), x(t || []);
    }
  }, L = async (X) => {
    try {
      const se = await ce(
        `/workspace/files/${encodeURIComponent(X)}`,
        { headers: { "X-Agent-Id": e } }
      );
      F(X), R(se.content || ""), le("source"), _(!0);
    } catch (se) {
      y.error(se.message || "读取文件失败");
    }
  }, oe = () => {
    F(null), R(""), ee(""), le("source"), _(!0);
  }, ge = async () => {
    let X;
    try {
      X = Ao(H || $);
    } catch (se) {
      y.warning(se.message || "文件名无效");
      return;
    }
    if (!D.trim()) {
      y.warning("Markdown 文档不能为空");
      return;
    }
    if (new TextEncoder().encode(D).length > 1024 * 1024) {
      y.warning("Markdown 文档不能超过 1 MB");
      return;
    }
    N(!0);
    try {
      if (H)
        await dn(e, X, D);
      else {
        const se = await _o(
          e,
          X,
          D,
          !0
        );
        x(se.system_prompt_files);
      }
      y.success("保存成功"), _(!1), V(), n();
    } catch (se) {
      const ne = se != null && se.message ? `：${se.message}` : "";
      y.error(
        H ? (se == null ? void 0 : se.message) || "保存失败" : `创建并挂载失败，服务端已回滚文件${ne}`
      );
    } finally {
      N(!1);
    }
  };
  return j ? r.createElement(
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
          A,
          { strong: !0 },
          `工作区文档 (${I.length})`
        ),
        r.createElement(
          A,
          { type: "secondary", style: { fontSize: 12 } },
          `· ${C.length} 个已挂载到系统提示`
        )
      ),
      r.createElement(
        "div",
        { style: { display: "flex", gap: 8 } },
        r.createElement(
          m,
          {
            size: "small",
            icon: W ? r.createElement(W) : void 0,
            onClick: V
          },
          "刷新"
        ),
        r.createElement(
          m,
          {
            type: "primary",
            size: "small",
            icon: S ? r.createElement(S) : void 0,
            onClick: oe
          },
          "新建 Markdown 文档"
        )
      )
    ),
    I.length === 0 ? r.createElement(h, {
      description: "暂无 Markdown 文档，点击「新建 Markdown 文档」添加",
      image: h.PRESENTED_IMAGE_SIMPLE
    }) : r.createElement(i, {
      dataSource: I,
      renderItem: (X) => {
        const se = C.includes(X.filename), ne = qr.includes(X.filename);
        return r.createElement(
          i.Item,
          {
            actions: [
              r.createElement(
                m,
                {
                  type: "link",
                  size: "small",
                  icon: O ? r.createElement(O) : void 0,
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
                color: se ? "#1677ff" : "var(--ant-color-text-quaternary, #bfbfbf)"
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
              r.createElement(A, null, X.filename),
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
            checked: se,
            size: "small",
            onChange: (xe) => ue(X.filename, xe)
          })
        );
      }
    }),
    // Edit/New file modal
    r.createElement(
      u,
      {
        open: z,
        onCancel: () => _(!1),
        title: H ? `编辑 ${H}` : "新建 Markdown 文档",
        width: 700,
        onOk: ge,
        confirmLoading: ae,
        okText: "保存"
      },
      H ? null : r.createElement(
        "div",
        { style: { marginBottom: 12 } },
        r.createElement(f, {
          placeholder: "文件名（如：油藏工程记忆库.md）",
          value: $,
          onChange: (X) => ee(X.target.value),
          addonAfter: $.endsWith(".md") ? "" : ".md"
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
        r.createElement(b, {
          size: "small",
          value: M,
          options: [
            { label: "源码", value: "source" },
            { label: "预览", value: "preview" }
          ],
          onChange: (X) => le(X)
        }),
        r.createElement(
          A,
          { type: "secondary", style: { fontSize: 12 } },
          `${D.length} 字符 · 约 ${Math.ceil(D.length / 4)} tokens · ${H && C.includes(H) ? "已挂载" : H ? "未挂载" : "保存后自动挂载"}`
        )
      ),
      D.trim() ? null : r.createElement(v, {
        type: "warning",
        showIcon: !0,
        message: "文档内容为空，保存前需要填写 Markdown 内容",
        style: { marginBottom: 10 }
      }),
      M === "source" ? r.createElement(f.TextArea, {
        value: D,
        onChange: (X) => R(X.target.value),
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
        nr(D, r)
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
  } = k().antd, { ThunderboltOutlined: d, CopyOutlined: m } = k().antdIcons || {}, { Text: u } = o, f = r(() => Ha(e), [e]), w = (y) => {
    try {
      const p = k();
      p.setSelectedAgent && p.setSelectedAgent(t);
    } catch {
    }
    try {
      sessionStorage.setItem("ugsci_pending_prompt", y.value);
    } catch {
    }
    window.history.pushState({}, "", "/chat"), window.dispatchEvent(new PopStateEvent("popstate"));
  }, h = (y) => {
    var p;
    (p = navigator.clipboard) == null || p.writeText(y.value).then(() => {
      c.success("已复制到剪贴板");
    });
  };
  return f.length === 0 ? n.createElement(s, {
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
        u,
        { strong: !0 },
        `推荐提问 (${f.length})`
      ),
      n.createElement(
        u,
        { type: "secondary", style: { fontSize: 12 } },
        "· 从技能描述中自动提取"
      )
    ),
    n.createElement(a, {
      dataSource: f,
      renderItem: (y, p) => n.createElement(
        a.Item,
        {
          actions: [
            n.createElement(
              i,
              {
                type: "link",
                size: "small",
                icon: m ? n.createElement(m) : void 0,
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
            `${p + 1}`
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
            u,
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
    Typography: m,
    message: u
  } = k().antd, { PlayCircleOutlined: f, SaveOutlined: w } = k().antdIcons || {}, { Text: h } = m, [y, p] = n(!0), [b, v] = n(!1), [g, S] = n(!1), [O, W] = n(!1), [A, I] = n(6), [K, j] = n("h"), [B, C] = n("main"), [x, z] = n(300), [_, H] = n(!1), [F, D] = n("08:00"), [R, $] = n("22:00"), ee = a(async () => {
    var V, ue;
    p(!0);
    try {
      const L = await Uo(e), oe = Lo(L.every ?? "6h");
      W(L.enabled ?? !1), I(oe.number), j(oe.unit), C(L.target ?? "main"), z(L.timeoutSeconds ?? 300), H(!!L.activeHours), D(((V = L.activeHours) == null ? void 0 : V.start) ?? "08:00"), $(((ue = L.activeHours) == null ? void 0 : ue.end) ?? "22:00");
    } catch (L) {
      u.error(L.message || "加载心跳配置失败");
    } finally {
      p(!1);
    }
  }, [e]);
  r(() => {
    ee();
  }, [ee]);
  const ae = async () => {
    v(!0);
    try {
      await jo(e, {
        enabled: O,
        every: Bo({ number: A, unit: K }),
        target: B,
        timeoutSeconds: x,
        activeHours: _ && F && R ? { start: F, end: R } : void 0
      }), u.success("心跳配置已保存");
    } catch (V) {
      u.error(V.message || "保存心跳配置失败");
    } finally {
      v(!1);
    }
  }, N = async () => {
    S(!0);
    try {
      await No(e), u.success("已触发心跳检查");
    } catch (V) {
      u.error(V.message || "触发心跳失败");
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
  const M = (V, ue, L) => t.createElement(
    "div",
    { style: Xa },
    t.createElement("div", { style: vt }, V),
    ue,
    L ? t.createElement(
      h,
      { type: "secondary", style: Qa },
      L
    ) : null
  ), le = (V, ue, L, oe) => t.createElement(
    "div",
    { style: Ya },
    t.createElement(
      "div",
      null,
      t.createElement("div", { style: vt }, V),
      ue
    ),
    t.createElement(
      "div",
      null,
      t.createElement("div", { style: vt }, L),
      oe
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
        checked: O,
        onChange: (V) => W(V)
      }),
      O ? "已启用，专家将定期自检" : "已停用"
    ),
    le(
      "检查频率",
      t.createElement(
        d,
        null,
        t.createElement(o, {
          min: 1,
          value: A,
          onChange: (V) => I(V ?? 1),
          style: { width: "100%" }
        }),
        t.createElement(s, {
          value: K,
          onChange: (V) => j(V),
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
        onChange: (V) => C(V),
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
        onChange: (V) => z(V ?? 300),
        style: { width: 200 }
      })
    ),
    // ── Section: 活跃时段 ──
    t.createElement(te, { style: { margin: "8px 0 16px" } }),
    t.createElement("div", { style: at }, "活跃时段"),
    M(
      "启用活跃时段限制",
      t.createElement(l, {
        checked: _,
        onChange: (V) => H(V)
      }),
      "仅在指定时段内触发心跳"
    ),
    _ ? le(
      "开始时间",
      t.createElement("input", {
        type: "time",
        value: F,
        onChange: (V) => D(V.target.value),
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
        value: R,
        onChange: (V) => $(V.target.value),
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
          loading: b,
          onClick: ae,
          style: We
        },
        "保存配置"
      ),
      t.createElement(
        i,
        {
          icon: f ? t.createElement(f) : void 0,
          loading: g,
          onClick: N
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
    Spin: m,
    Typography: u,
    message: f
  } = k().antd, { PlusOutlined: w, ReloadOutlined: h, DeleteOutlined: y } = k().antdIcons || {}, { Text: p, Paragraph: b } = u, [v, g] = r([]), [S, O] = r(!0), [W, A] = r(!1), [I, K] = r([]), [j, B] = r(!1), C = l(async () => {
    O(!0);
    try {
      const D = await wn(e);
      g(D);
    } catch (D) {
      f.error(D.message || "加载技能失败"), g([]);
    } finally {
      O(!1);
    }
  }, [e]);
  a(() => {
    C();
  }, [C]);
  const x = async () => {
    A(!0), B(!0);
    try {
      const D = await Sn(!0);
      K(D);
    } catch (D) {
      f.error(D.message || "加载技能池失败");
    } finally {
      B(!1);
    }
  }, z = async (D) => {
    let R = 0, $ = 0;
    for (const ee of D)
      try {
        await ar(e, ee), R++;
      } catch {
        $++;
      }
    R > 0 ? (f.success(
      `成功添加 ${R} 个技能${$ > 0 ? `，${$} 个失败` : ""}`
    ), C(), t()) : $ > 0 && f.error("添加技能失败"), A(!1);
  }, _ = async (D, R) => {
    try {
      R ? await Wa(e, D.name) : await Va(e, D.name), f.success(R ? "已启用" : "已停用"), C(), t();
    } catch ($) {
      f.error($.message || "操作失败");
    }
  }, H = async (D) => {
    try {
      await lr(e, D), f.success(`技能「${D}」已移除`), C(), t();
    } catch (R) {
      f.error(R.message || "移除技能失败");
    }
  };
  if (S)
    return n.createElement(
      "div",
      { style: { textAlign: "center", padding: 40 } },
      n.createElement(m, { size: "large" })
    );
  const F = v.filter((D) => D.enabled !== !1);
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
        p,
        { strong: !0 },
        `技能列表 (${v.length}，已启用 ${F.length})`
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
      renderItem: (D) => n.createElement(
        o.Item,
        {
          actions: [
            n.createElement(i, {
              key: "toggle",
              size: "small",
              checked: D.enabled !== !1,
              onChange: (R) => _(D, R)
            }),
            n.createElement(
              c,
              {
                key: "del",
                type: "link",
                size: "small",
                danger: !0,
                icon: y ? n.createElement(y) : void 0,
                onClick: () => H(D.name)
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
            D.emoji ? n.createElement(
              "span",
              { style: { fontSize: 16 } },
              D.emoji
            ) : null,
            n.createElement(p, { strong: !0 }, D.name),
            D.version_text ? n.createElement(
              s,
              { style: { fontSize: 10 } },
              `v${D.version_text}`
            ) : null
          ),
          D.description ? n.createElement(
            b,
            {
              type: "secondary",
              style: { fontSize: 12, margin: 0 },
              ellipsis: { rows: 2 }
            },
            D.description
          ) : null
        )
      )
    }),
    n.createElement(Ja, {
      open: W,
      onClose: () => A(!1),
      poolSkills: I,
      installedSkillNames: v.map((D) => D.name),
      loading: j,
      onInstall: z
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
    Spin: m,
    Modal: u,
    Input: f,
    Typography: w,
    message: h
  } = k().antd, { PlusOutlined: y, ReloadOutlined: p, DeleteOutlined: b } = k().antdIcons || {}, { Text: v, Paragraph: g } = w, { TextArea: S } = f, [O, W] = a([]), [A, I] = a(!0), [K, j] = a(!1), [B, C] = a(`{
  "mcpServers": {
    "example-client": {
      "command": "npx",
      "args": ["-y", "@example/mcp-server"],
      "env": {}
    }
  }
}`), [x, z] = a(!1), _ = o(async () => {
    I(!0);
    try {
      const R = await or(e);
      W(R);
    } catch (R) {
      h.error(R.message || "加载 MCP 失败"), W([]);
    } finally {
      I(!1);
    }
  }, [e]);
  l(() => {
    _();
  }, [_]), l(() => {
    n && _();
  }, [n, _]);
  const H = async (R) => {
    try {
      await Oo(e, R), h.success("已切换 MCP 状态"), _(), t();
    } catch ($) {
      h.error($.message || "切换失败");
    }
  }, F = async (R) => {
    try {
      await qa(e, R), h.success(`MCP「${R}」已移除`), _(), t();
    } catch ($) {
      h.error($.message || "移除 MCP 失败");
    }
  }, D = async () => {
    z(!0);
    try {
      const R = JSON.parse(B), $ = R.mcpServers || R, ee = Object.entries($);
      if (ee.length === 0) {
        h.warning("未找到 MCP 客户端配置");
        return;
      }
      for (const [ae, N] of ee) {
        const M = N, le = M.url ? "streamable_http" : "stdio";
        await ir(e, {
          client_key: ae,
          client: {
            name: M.name || ae,
            description: M.description || "",
            enabled: !0,
            transport: le,
            url: M.url || "",
            command: M.command || "",
            args: M.args || [],
            env: M.env || {},
            cwd: M.cwd || "",
            headers: M.headers || {}
          }
        });
      }
      h.success("MCP 客户端已创建"), j(!1), _(), t();
    } catch (R) {
      R instanceof SyntaxError ? h.error("JSON 格式错误：" + R.message) : h.error(R.message || "创建 MCP 失败");
    } finally {
      z(!1);
    }
  };
  return A ? r.createElement(
    "div",
    { style: { textAlign: "center", padding: 40 } },
    r.createElement(m, { size: "large" })
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
      r.createElement(v, { strong: !0 }, `MCP 客户端 (${O.length})`),
      r.createElement(
        "div",
        { style: { display: "flex", gap: 8 } },
        r.createElement(
          c,
          {
            size: "small",
            icon: p ? r.createElement(p) : void 0,
            onClick: () => {
              Ht(), _();
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
            onClick: () => j(!0),
            style: We
          },
          "添加 MCP"
        )
      )
    ),
    O.length === 0 ? r.createElement(d, {
      description: "该专家暂无 MCP 客户端",
      image: d.PRESENTED_IMAGE_SIMPLE
    }) : r.createElement(s, {
      dataSource: O,
      renderItem: (R) => r.createElement(
        s.Item,
        {
          actions: [
            r.createElement(
              c,
              {
                key: "toggle",
                size: "small",
                onClick: () => H(R.key)
              },
              R.enabled ? "停用" : "启用"
            ),
            r.createElement(
              c,
              {
                key: "del",
                type: "link",
                size: "small",
                danger: !0,
                icon: b ? r.createElement(b) : void 0,
                onClick: () => F(R.key)
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
            r.createElement(v, { strong: !0 }, R.name || R.key),
            r.createElement(
              i,
              {
                color: R.enabled ? "green" : "default",
                style: { fontSize: 10 }
              },
              R.enabled ? "启用" : "停用"
            ),
            r.createElement(
              i,
              { color: "purple", style: { fontSize: 10 } },
              R.transport
            )
          ),
          R.description ? r.createElement(
            g,
            {
              type: "secondary",
              style: { fontSize: 12, margin: 0 },
              ellipsis: { rows: 2 }
            },
            R.description
          ) : null,
          R.tools && R.tools.length > 0 ? r.createElement(
            "div",
            { style: { marginTop: 4, fontSize: 11, color: "var(--ant-color-text-tertiary, #8c8c8c)" } },
            `提供 ${R.tools.length} 个工具`
          ) : null
        )
      )
    }),
    // Create MCP modal
    r.createElement(
      u,
      {
        open: K,
        title: "添加 MCP 客户端 (JSON)",
        onCancel: () => j(!1),
        onOk: D,
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
        onChange: (R) => C(R.target.value),
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
    Button: m,
    Spin: u,
    Space: f,
    Typography: w,
    Divider: h,
    message: y
  } = k().antd, { SaveOutlined: p } = k().antdIcons || {}, { Text: b } = w, [v, g] = n(!0), [S, O] = n(!1), W = l(null), [A, I] = n(60), [K, j] = n(""), [B, C] = n(!0), [x, z] = n(30), [_, H] = n("zh"), [F, D] = n("UTC"), [R, $] = n(!0), [ee, ae] = n(100), [N, M] = n(!0), [le, te] = n(3), [V, ue] = n(1), [L, oe] = n(!0), [ge, X] = n(3), [se, ne] = n(2), [xe, Se] = n(60), [Be, ve] = n(1), [ie, we] = n(0), [Ae, U] = n(1), [de, ye] = n(0), [q, T] = n(30), [me, Y] = n(50), [pe, he] = n("light"), [Ie, P] = n("scroll"), [Ee, _e] = n("remelight"), [De, ze] = n("AUTO"), Ye = a(async () => {
    var re, $e, Me, Ue, Le, Re;
    g(!0);
    try {
      const [ke, st, ct] = await Promise.all([
        Do(e),
        Go(e).catch(() => "zh"),
        Wo().catch(() => "UTC")
      ]);
      W.current = ke, I(ke.shell_command_timeout ?? 60), j(ke.shell_command_executable ?? "");
      const Wt = ke.auto_title_config ?? { enabled: !0, timeout_seconds: 30 };
      C(Wt.enabled ?? !0), z(Wt.timeout_seconds ?? 30), H(st), D(ct);
      const nt = ke.loop ?? {};
      $(((re = nt.iteration) == null ? void 0 : re.enabled) ?? !0), ae((($e = nt.iteration) == null ? void 0 : $e.max_iterations) ?? ke.max_iters ?? 100), M(((Me = nt.doom_loop) == null ? void 0 : Me.enabled) ?? !0), te(((Ue = nt.doom_loop) == null ? void 0 : Ue.window_size) ?? 3), ue(((Le = nt.doom_loop) == null ? void 0 : Le.similarity_threshold) ?? 1), oe(ke.llm_retry_enabled ?? !0), X(ke.llm_max_retries ?? 3), ne(ke.llm_backoff_base ?? 2), Se(ke.llm_backoff_cap ?? 60), ve(ke.llm_max_concurrent ?? 1), we(ke.llm_max_qpm ?? 0), U(ke.llm_rate_limit_pause ?? 1), ye(ke.llm_rate_limit_jitter ?? 0), T(ke.llm_acquire_timeout ?? 30), Y(ke.history_max_length ?? 50), he(ke.context_manager_backend ?? "light"), P(((Re = ke.light_context_config) == null ? void 0 : Re.strategy) ?? "scroll"), _e(ke.memory_manager_backend ?? "remelight"), ze(ke.approval_level ?? "AUTO");
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
    var $e, Me;
    const re = W.current;
    if (re) {
      O(!0);
      try {
        const Ue = {
          ...re,
          max_iters: ee,
          loop: {
            ...re.loop ?? {},
            iteration: { enabled: R, max_iterations: ee },
            doom_loop: {
              enabled: N,
              window_size: le,
              similarity_threshold: V,
              stages: ((Me = ($e = re.loop) == null ? void 0 : $e.doom_loop) == null ? void 0 : Me.stages) ?? []
            }
          },
          shell_command_timeout: A,
          shell_command_executable: K,
          auto_title_config: {
            enabled: B,
            timeout_seconds: x
          },
          llm_retry_enabled: L,
          llm_max_retries: ge,
          llm_backoff_base: se,
          llm_backoff_cap: xe,
          llm_max_concurrent: Be,
          llm_max_qpm: ie,
          llm_rate_limit_pause: Ae,
          llm_rate_limit_jitter: de,
          llm_acquire_timeout: q,
          history_max_length: me,
          context_manager_backend: pe,
          light_context_config: {
            ...re.light_context_config ?? {},
            strategy: Ie
          },
          memory_manager_backend: Ee,
          approval_level: De
        };
        await Fo(e, Ue), W.current = Ue, _ && await Ho(e, _).catch(() => {
        }), F && await qo(F).catch(() => {
        }), y.success("运行配置已保存");
      } catch (Ue) {
        y.error(Ue.message || "保存运行配置失败");
      } finally {
        O(!1);
      }
    }
  };
  if (v)
    return t.createElement(
      "div",
      { style: { textAlign: "center", padding: 40 } },
      t.createElement(u, { size: "large" })
    );
  const Fe = (re, $e, Me) => t.createElement(
    "div",
    { style: Xa },
    t.createElement("div", { style: vt }, re),
    $e,
    Me ? t.createElement(
      b,
      { type: "secondary", style: Qa },
      Me
    ) : null
  ), Oe = (re, $e, Me, Ue) => t.createElement(
    "div",
    { style: Ya },
    t.createElement(
      "div",
      null,
      t.createElement("div", { style: vt }, re),
      $e
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
        value: A,
        onChange: (re) => I(re ?? 60),
        style: { width: "100%" }
      }),
      "Shell 可执行文件",
      t.createElement(i, {
        value: K,
        onChange: (re) => j(re.target.value),
        placeholder: "留空使用系统默认",
        style: { width: "100%" }
      })
    ),
    Oe(
      "语言",
      t.createElement(c, {
        value: _,
        onChange: (re) => H(re),
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
        value: F,
        onChange: (re) => D(re),
        style: { width: "100%" },
        showSearch: !0,
        filterOption: (re, $e) => {
          var Me;
          return (((Me = $e == null ? void 0 : $e.label) == null ? void 0 : Me.toString()) || "").toLowerCase().includes(re.toLowerCase());
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
      t.createElement(f, null, t.createElement(d, {
        checked: B,
        onChange: (re) => C(re)
      })),
      "标题生成超时 (秒)",
      t.createElement(s, {
        min: 5,
        value: x,
        onChange: (re) => z(re ?? 30),
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
        onChange: (re) => ze(re),
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
        checked: R,
        onChange: (re) => $(re)
      }),
      "停止 Agent 前的最大循环轮次"
    ),
    R ? Fe(
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
        checked: N,
        onChange: (re) => M(re)
      }),
      "检测并阻止重复操作循环"
    ),
    N ? Oe(
      "检测窗口大小",
      t.createElement(s, {
        min: 2,
        max: 20,
        value: le,
        onChange: (re) => te(re ?? 3),
        style: { width: "100%" }
      }),
      "相似度阈值",
      t.createElement(s, {
        min: 0,
        max: 1,
        step: 0.05,
        value: V,
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
        onChange: (re) => oe(re)
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
        value: se,
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
        onChange: (re) => Se(re ?? 60),
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
        value: ie,
        onChange: (re) => we(re ?? 0),
        style: { width: "100%" }
      })
    ),
    Oe(
      "限流暂停时间 (秒)",
      t.createElement(s, {
        min: 1,
        step: 0.5,
        value: Ae,
        onChange: (re) => U(re ?? 1),
        style: { width: "100%" }
      }),
      "限流抖动 (秒)",
      t.createElement(s, {
        min: 0,
        step: 0.5,
        value: de,
        onChange: (re) => ye(re ?? 0),
        style: { width: "100%" }
      })
    ),
    Fe(
      "获取超时 (秒)",
      t.createElement(s, {
        min: 10,
        step: 10,
        value: q,
        onChange: (re) => T(re ?? 30),
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
        onChange: (re) => he(re),
        style: { width: "100%" },
        options: [{ value: "light", label: "light" }]
      }),
      "上下文策略",
      t.createElement(c, {
        value: Ie,
        onChange: (re) => P(re),
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
        value: Ee,
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
        value: me,
        onChange: (re) => Y(re ?? 50),
        style: { width: "100%" }
      })
    ),
    // ── Save button ──
    t.createElement(
      "div",
      { style: { display: "flex", justifyContent: "flex-end", marginTop: 16 } },
      t.createElement(
        m,
        {
          type: "primary",
          icon: p ? t.createElement(p) : void 0,
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
  const a = k().React, { useState: l, useEffect: o, useCallback: s } = a, { Modal: i, Tabs: c, Spin: d, Typography: m } = k().antd, { SettingOutlined: u } = k().antdIcons || {}, { Text: f } = m, [w, h] = l([]), [y, p] = l(!1), [b, v] = l("heartbeat"), g = s(async () => {
    if (e) {
      p(!0);
      try {
        const A = await Vo(e.agent.id);
        h(A);
      } catch {
        h([]);
      } finally {
        p(!1);
      }
    }
  }, [e]);
  if (o(() => {
    t && e && g();
  }, [t, e, g]), !e) return null;
  const { agent: S } = e, O = () => {
    g(), r();
  }, W = [
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
        onRefresh: O
      })
    },
    {
      key: "skills",
      label: `技能 (${e.skills.filter((A) => A.enabled !== !1).length})`,
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
        isActive: b === "mcp"
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
        u ? a.createElement(u, { style: { fontSize: 18 } }) : null,
        a.createElement("span", null, `配置 - ${S.name}`),
        a.createElement(
          f,
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
      items: W,
      activeKey: b,
      onChange: (A) => v(A),
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
function Vr(e) {
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
  const r = k().React, [a, l] = r.useState(0), o = a === 0 ? Vr(e) : `${Vr(e)}?_r=${a}`;
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
function ni({
  expert: e,
  onClick: t,
  onSummon: n,
  onConfigure: r
}) {
  var A;
  const a = k().React, { Card: l, Tag: o, Badge: s, Typography: i, Spin: c, Button: d, Tooltip: m } = k().antd, { Text: u } = i, { ThunderboltOutlined: f, SettingOutlined: w } = k().antdIcons || {}, { agent: h, skills: y, mcps: p, loading: b } = e, v = h.enabled, g = y.filter((I) => I.enabled !== !1), S = Za.find(
    (I) => I.id === h.id || I.name === h.name
  ), O = Array.from(
    new Set(
      (A = S == null ? void 0 : S.tags) != null && A.length ? S.tags : g.flatMap((I) => I.tags || [])
    )
  ).slice(0, 3), W = (S == null ? void 0 : S.category) || "UGSci 专业专家";
  return a.createElement(
    l,
    {
      hoverable: !0,
      onClick: t,
      size: "small",
      style: {
        cursor: "pointer",
        transition: "all 0.2s ease",
        borderColor: v ? void 0 : "var(--ant-color-border, #d9d9d9)",
        opacity: v ? 1 : 0.7,
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
    a.createElement(
      "div",
      {
        style: {
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 8
        }
      },
      a.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 8 } },
        a.createElement(et, { name: h.name, size: 36 }),
        a.createElement(
          "div",
          null,
          a.createElement(
            u,
            { strong: !0, style: { fontSize: 15 } },
            h.name
          ),
          a.createElement(
            "div",
            {
              style: {
                fontSize: 12,
                color: "var(--ant-color-text-secondary, #595959)",
                marginTop: 2
              }
            },
            W
          )
        )
      ),
      a.createElement(s, {
        status: v ? "success" : "default",
        text: v ? "启用" : "停用"
      })
    ),
    // Keep the card scannable: only surface a few stable capability tags.
    a.createElement(
      "div",
      { style: { minHeight: 30, marginBottom: 10 } },
      O.length > 0 ? a.createElement(Jo, {
        items: O,
        max: 3,
        color: "blue"
      }) : a.createElement(
        "span",
        {
          style: {
            fontSize: 12,
            color: "var(--ant-color-text-quaternary, #bfbfbf)"
          }
        },
        "核心能力待配置"
      )
    ),
    // Keep counts visible; full skill and MCP lists belong in the drawer.
    b ? a.createElement(c, { size: "small" }) : a.createElement(
      "div",
      {
        display: "flex",
        gap: 12,
        alignItems: "center",
        marginTop: "auto",
        marginBottom: 4,
        fontSize: 12,
        color: "var(--ant-color-text-tertiary, #8c8c8c)"
      },
      `技能 ${g.length}`,
      `MCP ${p.length}`
    ),
    // Bottom bar: gear icon (left) + summon button (right)
    a.createElement(
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
      a.createElement(
        m,
        { title: "配置专家", placement: "top" },
        a.createElement(
          d,
          {
            type: "text",
            size: "small",
            icon: w ? a.createElement(w, {
              style: { fontSize: 16, color: "var(--ant-color-text-tertiary, #8c8c8c)" }
            }) : void 0,
            onClick: (I) => {
              I.stopPropagation(), r && r();
            }
          }
        )
      ),
      // Summon button (bottom-right)
      a.createElement(
        d,
        {
          type: "primary",
          size: "small",
          icon: f ? a.createElement(f) : void 0,
          disabled: !v,
          onClick: (I) => {
            I.stopPropagation(), n && n();
          },
          style: We
        },
        "召唤专家"
      )
    )
  );
}
function ri({
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
    Empty: m,
    Tabs: u,
    List: f,
    Spin: w,
    Modal: h,
    message: y
  } = k().antd, { Text: p, Paragraph: b } = i, {
    EditOutlined: v,
    ThunderboltOutlined: g,
    FileTextOutlined: S,
    ToolOutlined: O,
    PlusOutlined: W
  } = k().antdIcons || {}, [A, I] = a.useState(!1), [K, j] = a.useState(
    []
  ), [B, C] = a.useState(!1);
  if (!e) return null;
  const { agent: x, config: z, skills: _, mcps: H, loading: F } = e, D = _.filter((L) => L.enabled !== !1), R = (L) => {
    window.history.pushState({}, "", L), window.dispatchEvent(new PopStateEvent("popstate"));
  }, $ = a.createElement(
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
        x.description ? nr(x.description, a) : "暂无描述"
      ),
      a.createElement(
        o.Item,
        { label: "使用模型" },
        x.active_model ? `${x.active_model.provider_id} / ${x.active_model.model}` : "使用全局默认模型"
      ),
      z != null && z.workspace_dir ? a.createElement(
        o.Item,
        { label: "工作区路径" },
        a.createElement(
          "code",
          { style: { fontSize: 11 } },
          z.workspace_dir
        )
      ) : null,
      z != null && z.approval_level ? a.createElement(
        o.Item,
        { label: "审批级别" },
        z.approval_level
      ) : null
    ),
    // System prompt files
    z != null && z.system_prompt_files && z.system_prompt_files.length > 0 ? a.createElement(
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
        a.createElement(p, { strong: !0 }, "系统提示词文件")
      ),
      a.createElement(
        c,
        { wrap: !0 },
        ...z.system_prompt_files.map(
          (L, oe) => a.createElement(
            s,
            {
              key: oe,
              icon: S ? a.createElement(S) : void 0,
              style: { fontSize: 12 }
            },
            L
          )
        )
      )
    ) : null
  ), ee = async () => {
    I(!0), C(!0);
    try {
      const L = await Sn(!0);
      j(L);
    } catch (L) {
      y.error(L.message || "加载技能池失败");
    } finally {
      C(!1);
    }
  }, ae = async (L) => {
    let oe = 0, ge = 0;
    for (const X of L)
      try {
        await ar(x.id, X), oe++;
      } catch {
        ge++;
      }
    oe > 0 ? (y.success(
      `成功添加 ${oe} 个技能${ge > 0 ? `，${ge} 个失败` : ""}`
    ), r()) : ge > 0 && y.error("添加技能失败"), I(!1);
  }, N = async (L) => {
    try {
      await lr(x.id, L), y.success(`技能「${L}」已移除`), r();
    } catch (oe) {
      y.error(oe.message || "移除技能失败");
    }
  }, M = async (L) => {
    try {
      await qa(x.id, L), y.success(`MCP「${L}」已移除`), r();
    } catch (oe) {
      y.error(oe.message || "移除 MCP 失败");
    }
  }, le = F ? a.createElement(
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
        p,
        { strong: !0 },
        `已启用技能 (${D.length})`
      ),
      a.createElement(
        d,
        {
          type: "primary",
          size: "small",
          icon: W ? a.createElement(W) : void 0,
          onClick: ee
        },
        "从技能池添加"
      )
    ),
    D.length === 0 ? a.createElement(m, {
      description: "该专家暂无已启用的技能",
      image: m.PRESENTED_IMAGE_SIMPLE
    }) : a.createElement(f, {
      dataSource: D,
      renderItem: (L) => a.createElement(
        f.Item,
        {
          actions: [
            a.createElement(
              d,
              {
                type: "link",
                size: "small",
                danger: !0,
                onClick: () => N(L.name)
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
            a.createElement(p, { strong: !0 }, L.name),
            L.version_text ? a.createElement(
              s,
              { style: { fontSize: 10 } },
              `v${L.version_text}`
            ) : null
          ),
          L.description ? a.createElement(
            b,
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
              (oe, ge) => a.createElement(
                s,
                {
                  key: ge,
                  color: "cyan",
                  style: { fontSize: 10 }
                },
                oe
              )
            )
          ) : null
        )
      )
    }),
    // Skill Picker Modal (card-grid style, consistent with Skill Center)
    a.createElement(Ja, {
      open: A,
      onClose: () => I(!1),
      poolSkills: K,
      installedSkillNames: D.map((L) => L.name),
      loading: B,
      onInstall: ae
    })
  ), te = F ? a.createElement(
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
        p,
        { strong: !0 },
        `MCP 客户端 (${H.length})`
      ),
      a.createElement(
        d,
        {
          type: "primary",
          size: "small",
          icon: W ? a.createElement(W) : void 0,
          onClick: () => {
            window.history.pushState({}, "", `/agents/${x.id}/mcp`), window.dispatchEvent(new PopStateEvent("popstate"));
          }
        },
        "配置 MCP"
      )
    ),
    H.length === 0 ? a.createElement(m, {
      description: "该专家暂无关联的 MCP 客户端，点击「配置 MCP」添加",
      image: m.PRESENTED_IMAGE_SIMPLE
    }) : a.createElement(f, {
      dataSource: H,
      renderItem: (L) => a.createElement(
        f.Item,
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
              p,
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
            b,
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
  ), V = z != null && z.tools ? a.createElement(
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
        O ? a.createElement(O, {
          style: { fontSize: 14, color: "#1677ff" }
        }) : null,
        a.createElement(p, { strong: !0 }, "工具配置")
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
        JSON.stringify(z.tools, null, 2)
      )
    )
  ) : a.createElement(m, {
    description: "暂无工具配置",
    image: m.PRESENTED_IMAGE_SIMPLE
  }), ue = [
    { key: "basic", label: "基本信息", children: $ },
    {
      key: "skills",
      label: `技能 (${D.length})`,
      children: le
    },
    {
      key: "prompts",
      label: "推荐提问",
      children: a.createElement(Ko, {
        skills: D,
        agentId: x.id
      })
    },
    {
      key: "knowledge",
      label: "专家记忆",
      children: a.createElement(Ka, {
        agentId: x.id,
        systemPromptFiles: (z == null ? void 0 : z.system_prompt_files) || [],
        onRefresh: () => r()
      })
    },
    { key: "mcp", label: `MCP (${H.length})`, children: te },
    { key: "tools", label: "工具配置", children: V }
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
              setTimeout(() => R("/agents"), 0);
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
              setTimeout(() => R("/chat"), 0);
            }
          },
          "开始对话"
        )
      )
    },
    a.createElement(u, {
      items: ue,
      defaultActiveKey: "basic"
    })
  );
}
function ai({
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
    Spin: m,
    message: u,
    Typography: f
  } = k().antd, { Text: w } = f, { FileAddOutlined: h } = k().antdIcons || {}, [y, p] = a(!1), [b, v] = a(""), [g, S] = a(!1), O = async (I) => {
    p(!0);
    try {
      const K = await ce("/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: I.id || void 0,
          name: I.name,
          description: I.description,
          skill_names: I.skillNames
        })
      }), j = I.systemPrompt.trim() || `# ${I.name}

你是${I.name}。${I.description ? `

职责：${I.description}` : ""}
`, C = (await Promise.allSettled([
        dn(K.id, "AGENTS.md", j),
        ...I.mcpClients.map(
          ({ clientKey: x, client: z }) => ir(K.id, {
            client_key: x,
            client: z
          })
        )
      ])).filter(
        (x) => x.status === "rejected"
      ).length;
      C > 0 ? u.warning(
        `专家「${I.name}」已创建，${C} 项初始配置失败，可在专家配置中重试`
      ) : u.success(`专家「${I.name}」创建成功`), await Kr(K.id), S(!1), setTimeout(() => {
        t(), n();
      }, 0);
    } catch (K) {
      u.error(K.message || "创建专家失败");
    } finally {
      p(!1);
    }
  }, W = ti.filter((I) => {
    if (!b.trim()) return !0;
    const K = b.toLowerCase();
    return I.name.toLowerCase().includes(K) || I.description.toLowerCase().includes(K) || I.category.toLowerCase().includes(K);
  }), A = async (I) => {
    p(!0);
    try {
      const K = await ce("/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: I.name,
          description: I.description,
          skill_names: I.recommended_skills
        })
      });
      await dn(K.id, "AGENTS.md", I.system_prompt);
      const j = await rr(K.id);
      j.approval_level = I.approval_level, await ce(`/agents/${encodeURIComponent(K.id)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(j)
      }), await Kr(K.id), u.success(`专家「${I.name}」创建成功`), t(), n();
    } catch (K) {
      u.error(K.message || "创建专家失败");
    } finally {
      p(!1);
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
          value: b,
          onChange: (I) => v(I.target.value),
          allowClear: !0
        })
      ),
      y ? r.createElement(
        "div",
        { style: { textAlign: "center", padding: 60 } },
        r.createElement(m, { size: "large" }),
        r.createElement(
          "div",
          { style: { marginTop: 12, color: "var(--ant-color-text-tertiary, #8c8c8c)" } },
          "正在创建专家..."
        )
      ) : r.createElement(
        c,
        { gutter: [12, 12] },
        // ── Blank template card (always first) ──
        b.trim() ? null : r.createElement(
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
                { style: { fontSize: 28, color: "var(--ant-color-text-tertiary, #8c8c8c)" } },
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
        ...W.map(
          (I) => r.createElement(
            d,
            { key: I.id, xs: 24, sm: 12 },
            r.createElement(
              o,
              {
                hoverable: !0,
                size: "small",
                onClick: () => A(I),
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
                  name: I.name,
                  size: 40
                }),
                r.createElement(
                  "div",
                  { style: { flex: 1 } },
                  r.createElement(
                    w,
                    { strong: !0, style: { fontSize: 15 } },
                    I.name
                  ),
                  r.createElement(
                    "div",
                    null,
                    r.createElement(
                      s,
                      { color: "blue", style: { fontSize: 10 } },
                      I.category
                    ),
                    I.approval_level === "MANUAL" ? r.createElement(
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
                nr(I.description, r)
              )
            )
          )
        )
      )
    ),
    // ── Blank template creation modal (sibling, not nested inside Modal) ──
    r.createElement(oi, {
      open: g,
      onCancel: () => S(!1),
      onCreate: O
    })
  );
}
function _t(e) {
  return typeof e == "object" && e !== null && !Array.isArray(e);
}
function li(e) {
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
function oi({
  open: e,
  onCancel: t,
  onCreate: n
}) {
  const r = k().React, { useState: a, useEffect: l, useMemo: o } = r, {
    Modal: s,
    Input: i,
    Select: c,
    Button: d,
    Row: m,
    Col: u,
    Spin: f,
    Tag: w,
    Typography: h,
    message: y
  } = k().antd, { CheckCircleOutlined: p } = k().antdIcons || {}, { Text: b } = h, [v, g] = a(""), [S, O] = a(""), [W, A] = a(""), [I, K] = a(""), [j, B] = a([]), [C, x] = a([]), [z, _] = a(!1), [H, F] = a(""), [D, R] = a(!1);
  l(() => {
    e && (g(""), O(""), A(""), K(""), x([]), F(""), R(!1), _(!0), Sn(!0).then(B).catch((te) => {
      B([]), y.error(te.message || "加载技能池失败");
    }).finally(() => _(!1)));
  }, [e]);
  const $ = S.trim(), ee = o(() => $ ? $.length < 2 || $.length > 64 ? "ID 长度需为 2-64 个字符" : /^[a-zA-Z0-9][a-zA-Z0-9_-]*[a-zA-Z0-9]$/.test($) ? $ === "default" ? "default 是系统保留 ID" : "" : "仅允许字母、数字、连字符和下划线，且不能以符号开头或结尾" : "", [$]), ae = o(() => {
    try {
      return { clients: li(H), error: "" };
    } catch (te) {
      return { clients: [], error: te.message || "MCP 配置无效" };
    }
  }, [H]), N = () => {
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
    R(!0), Promise.resolve(
      n({
        id: $,
        name: te,
        description: W.trim(),
        systemPrompt: I,
        skillNames: C,
        mcpClients: ae.clients
      })
    ).finally(() => R(!1));
  }, M = () => {
    x(
      j.filter((te) => te.source === "builtin").map((te) => te.name)
    );
  }, le = (te, V) => r.createElement(
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
    r.createElement(b, { strong: !0, style: { fontSize: 15 } }, te),
    V ? r.createElement(b, { type: "secondary", style: { fontSize: 12 } }, V) : null
  );
  return r.createElement(
    s,
    {
      open: e,
      title: "创建专家",
      onCancel: t,
      onOk: N,
      okText: "创建专家",
      cancelText: "取消",
      okButtonProps: { loading: D },
      maskClosable: !0,
      keyboard: !0,
      width: 880,
      styles: { body: { maxHeight: "72vh", overflowY: "auto", paddingTop: 8 } }
    },
    r.createElement(
      "div",
      { style: { paddingBottom: 20 } },
      le("基本信息", "ID 留空时自动生成"),
      r.createElement(
        m,
        { gutter: [16, 12] },
        r.createElement(
          u,
          { xs: 24, md: 12 },
          r.createElement(
            "label",
            { style: { display: "block", fontSize: 13, marginBottom: 6 } },
            "专家名称",
            r.createElement("span", { style: { color: "#ff4d4f", marginLeft: 4 } }, "*")
          ),
          r.createElement(i, {
            placeholder: "例如：合同审查专家",
            value: v,
            onChange: (te) => g(te.target.value),
            maxLength: 50
          })
        ),
        r.createElement(
          u,
          { xs: 24, md: 12 },
          r.createElement(
            "label",
            { style: { display: "block", fontSize: 13, marginBottom: 6 } },
            "智能体 ID（可选）"
          ),
          r.createElement(i, {
            placeholder: "例如：contract-reviewer",
            value: S,
            onChange: (te) => O(te.target.value),
            maxLength: 64,
            status: ee ? "error" : void 0
          }),
          ee ? r.createElement("div", { style: { color: "#ff4d4f", fontSize: 12, marginTop: 4 } }, ee) : null
        ),
        r.createElement(
          u,
          { span: 24 },
          r.createElement(
            "label",
            { style: { display: "block", fontSize: 13, marginBottom: 6 } },
            "专家描述（可选）"
          ),
          r.createElement(i.TextArea, {
            placeholder: "简要描述该专家的职责和能力",
            value: W,
            onChange: (te) => A(te.target.value),
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
      le("角色指令", "保存为 AGENTS.md"),
      r.createElement(i.TextArea, {
        placeholder: "定义专家的角色、目标、工作方式和输出要求；留空时将根据名称与描述生成基础指令",
        value: I,
        onChange: (te) => K(te.target.value),
        rows: 6,
        style: { fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", fontSize: 12 }
      })
    ),
    r.createElement(
      "div",
      { style: { borderTop: "1px solid #f0f0f0", paddingTop: 20 } },
      le("初始能力"),
      r.createElement(
        m,
        { gutter: [20, 16], align: "top" },
        r.createElement(
          u,
          { xs: 24, md: 12 },
          r.createElement(
            "div",
            { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 } },
            r.createElement(b, { strong: !0 }, "初始技能"),
            r.createElement(
              "div",
              { style: { display: "flex", gap: 4 } },
              r.createElement(d, { size: "small", onClick: M, disabled: z }, "内置"),
              r.createElement(d, { size: "small", onClick: () => x([]), disabled: C.length === 0 }, "清空")
            )
          ),
          z ? r.createElement("div", { style: { textAlign: "center", padding: 32 } }, r.createElement(f, { size: "small" })) : r.createElement(c, {
            mode: "multiple",
            value: C,
            onChange: x,
            placeholder: "搜索并选择技能",
            showSearch: !0,
            allowClear: !0,
            optionFilterProp: "label",
            maxTagCount: "responsive",
            style: { width: "100%" },
            options: j.map((te) => ({
              value: te.name,
              label: te.name
            })),
            notFoundContent: "暂无可用技能"
          }),
          r.createElement(
            "div",
            { style: { marginTop: 8, minHeight: 22 } },
            C.length > 0 ? r.createElement(w, { color: "blue" }, `已选择 ${C.length} 个技能`) : r.createElement(b, { type: "secondary", style: { fontSize: 12 } }, "暂不添加技能")
          )
        ),
        r.createElement(
          u,
          { xs: 24, md: 12 },
          r.createElement(b, { strong: !0, style: { display: "block", marginBottom: 8 } }, "初始 MCP"),
          r.createElement(i.TextArea, {
            placeholder: `{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem"]
    }
  }
}`,
            value: H,
            onChange: (te) => F(te.target.value),
            rows: 8,
            status: ae.error ? "error" : void 0,
            style: { fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", fontSize: 12 }
          }),
          r.createElement(
            "div",
            { style: { marginTop: 8, minHeight: 22 } },
            ae.error ? r.createElement(b, { type: "danger", style: { fontSize: 12 } }, ae.error) : ae.clients.length > 0 ? r.createElement(
              w,
              {
                color: "green",
                icon: p ? r.createElement(p) : void 0
              },
              `已识别 ${ae.clients.length} 个 MCP`
            ) : r.createElement(b, { type: "secondary", style: { fontSize: 12 } }, "暂不添加 MCP")
          )
        )
      )
    )
  );
}
const el = "ugsci_custom_teams";
function ii(e) {
  if (!e || typeof e != "object") return !1;
  const t = e;
  return typeof t.id == "string" && typeof t.name == "string" && typeof t.taskTemplate == "string" && typeof t.orchestrationPrompt == "string" && Array.isArray(t.members);
}
function si() {
  try {
    const e = JSON.parse(
      localStorage.getItem(el) || "[]"
    );
    return Array.isArray(e) ? e.filter(ii) : [];
  } catch {
    return [];
  }
}
function ci(e) {
  try {
    localStorage.setItem(el, JSON.stringify(e));
  } catch {
  }
}
function di(e) {
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
function ui(e) {
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
async function Dn(e = !0) {
  const t = await tt("/ugsci/team/custom");
  if (!t.ok) {
    const a = await t.text().catch(() => "");
    throw new Error(a || `HTTP ${t.status}`);
  }
  const r = (await t.json()).map(ui);
  return e && ci(r), r;
}
async function tl(e) {
  const t = await tt("/ugsci/team/custom", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(di(e))
  });
  if (!t.ok) {
    const r = await t.text().catch(() => "");
    throw new Error(r || `HTTP ${t.status}`);
  }
  const n = await t.json();
  return { ...e, id: n.team_id };
}
async function mi(e) {
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
  const e = si();
  if (e.length === 0) return;
  const t = await Dn(!1), n = new Set(t.map((r) => r.id));
  await Promise.all(
    e.filter((r) => !n.has(r.id)).map((r) => tl(r))
  );
}
async function pi(e) {
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
          const m = d.slice(6);
          let u;
          try {
            u = JSON.parse(m);
          } catch {
            continue;
          }
          if (u.error) {
            const f = u.error, w = typeof f == "string" ? f : (f == null ? void 0 : f.message) || "工作流启动失败";
            throw new Error(w);
          }
          if (u.object === "response" || u.type === "response") {
            const f = u.status;
            if (f === "failed" || f === "error") {
              const w = ((l = u.error) == null ? void 0 : l.message) || "工作流启动失败";
              throw new Error(w);
            }
            return;
          }
          if (u.object === "content" || u.type === "message")
            return;
        }
      }
    }
  } finally {
    t.releaseLock();
  }
}
async function gi(e, t, n) {
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
  return await pi(s), o;
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
function yi(e, t) {
  return cr("/ugsci/team/state", e, t);
}
async function hi(e, t) {
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
const Ei = 5e3;
function Xr({
  activeOnly: e = !1,
  enabled: t = !0
}) {
  const n = rl(), r = n.React, { useCallback: a, useEffect: l, useRef: o, useState: s } = r, { Alert: i, Button: c, Card: d, Empty: m, Spin: u, Tag: f, Typography: w } = n.antd, { Text: h, Paragraph: y } = w, p = n.useSelectedAgent ? n.useSelectedAgent() : { id: "default" }, b = (p == null ? void 0 : p.id) || "default", [v, g] = s([]), [S, O] = s(!0), [W, A] = s(null), [I, K] = s(!1), j = o(null), B = o(0), C = o(!1), x = o(b), z = a(
    async (F = !0, D = !0) => {
      var ee;
      if (!t || !D && C.current) return;
      (ee = j.current) == null || ee.abort();
      const R = new AbortController();
      j.current = R;
      const $ = ++B.current;
      C.current = !0, F && O(!0);
      try {
        const ae = await hi(b, R.signal);
        if (R.signal.aborted || $ !== B.current)
          return;
        g(ae), K(!0), A(null);
      } catch (ae) {
        if (R.signal.aborted || $ !== B.current)
          return;
        A(
          ae instanceof Error ? ae.message : "讨论运行记录加载失败"
        );
      } finally {
        !R.signal.aborted && $ === B.current && (j.current = null, C.current = !1, O(!1));
      }
    },
    [b, t]
  );
  if (l(() => {
    var D;
    if (!t) {
      (D = j.current) == null || D.abort(), j.current = null, C.current = !1, B.current += 1;
      return;
    }
    x.current !== b && (x.current = b, g([]), A(null), K(!1)), z(!0, !0);
    const F = e ? window.setInterval(() => {
      z(!1, !1);
    }, Ei) : null;
    return () => {
      var R;
      F !== null && window.clearInterval(F), (R = j.current) == null || R.abort(), j.current = null, C.current = !1, B.current += 1;
    };
  }, [e, b, t, z]), S && !I) return r.createElement(u);
  if (W && !I)
    return r.createElement(i, {
      type: "warning",
      message: "讨论运行记录加载失败",
      description: W,
      action: r.createElement(
        c,
        { size: "small", onClick: () => void z(!0, !0), loading: S },
        "重试"
      )
    });
  const _ = v.filter(
    (F) => e ? F.status === "active" : F.status !== "active"
  ), H = (F) => W ? r.createElement(
    r.Fragment,
    null,
    r.createElement(i, {
      type: "warning",
      message: "讨论运行记录更新失败，当前显示上次成功读取的结果",
      description: W,
      action: r.createElement(
        c,
        {
          size: "small",
          onClick: () => void z(!0, !0),
          loading: S
        },
        "重试"
      )
    }),
    F
  ) : F;
  return _.length === 0 ? H(
    r.createElement(
      m,
      {
        description: e ? "暂无进行中的专家团讨论" : "暂无历史讨论"
      },
      r.createElement(
        c,
        { size: "small", onClick: () => void z(!0, !0), loading: S },
        "刷新"
      )
    )
  ) : H(
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
          { size: "small", onClick: () => void z(!0, !0), loading: S },
          "刷新"
        )
      ),
      r.createElement(
        "div",
        { style: { display: "flex", flexDirection: "column", gap: 8 } },
        ..._.map(
          (F) => r.createElement(
            d,
            { key: F.instance_id, size: "small" },
            r.createElement(
              "div",
              { style: { display: "flex", alignItems: "center", gap: 8 } },
              r.createElement(
                h,
                { strong: !0 },
                F.team_name || F.team_id
              ),
              r.createElement(
                f,
                {
                  color: F.status === "completed" ? "green" : F.status === "terminated" ? "orange" : "blue"
                },
                F.status
              ),
              r.createElement(f, null, F.current_phase),
              r.createElement(
                h,
                { type: "secondary" },
                `迭代 ${F.iteration}`
              )
            ),
            r.createElement(
              y,
              { ellipsis: { rows: 2 }, style: { margin: "8px 0 0" } },
              F.task || "暂无任务描述"
            )
          )
        )
      )
    )
  );
}
async function bi() {
  try {
    return (await cr(
      "/ugsci/team/preset-teams"
    )).teams;
  } catch {
    return null;
  }
}
async function vi() {
  try {
    return (await cr(
      "/ugsci/team/roles"
    )).roles;
  } catch {
    return null;
  }
}
const wi = {
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
], Qr = 5e3, Si = 3e4;
function xi({ enabled: e = !0 }) {
  const t = rl(), n = t.React, { useState: r, useEffect: a, useCallback: l, useRef: o } = n, { Card: s, Tag: i, Typography: c, Button: d, Steps: m, Empty: u, Alert: f, Spin: w } = t.antd, { ReloadOutlined: h } = t.antdIcons || {}, { Text: y, Paragraph: p } = c, b = t.useSelectedAgent ? t.useSelectedAgent() : { id: "default" }, v = (b == null ? void 0 : b.id) || "default", [g, S] = r(null), [O, W] = r(!1), [A, I] = r(null), K = o(null), j = o(0), B = o(0), C = o(0), x = o(null), z = o(!1), _ = l(
    async (V, ue = !0) => {
      var ge;
      if (!e || !ue && z.current) return;
      (ge = x.current) == null || ge.abort();
      const L = new AbortController();
      x.current = L;
      const oe = ++C.current;
      z.current = !0, V && W(!0);
      try {
        const X = await yi(v, L.signal);
        if (L.signal.aborted || oe !== C.current)
          return;
        j.current = 0, B.current = 0, K.current = X, S(X), I(null);
      } catch (X) {
        if (L.signal.aborted || oe !== C.current)
          return;
        j.current += 1;
        const se = Math.min(
          Si,
          Qr * 2 ** (j.current - 1)
        );
        B.current = Date.now() + se, I(
          X instanceof Error ? X.message : "专家团状态加载失败"
        );
      } finally {
        !L.signal.aborted && oe === C.current && (x.current = null, z.current = !1, W(!1));
      }
    },
    [v, e]
  ), H = l(() => (j.current = 0, B.current = 0, _(!0)), [_]);
  if (a(() => {
    var ue;
    if ((ue = x.current) == null || ue.abort(), x.current = null, z.current = !1, C.current += 1, j.current = 0, B.current = 0, K.current = null, S(null), I(null), !e) return;
    H();
    const V = window.setInterval(() => {
      var L, oe;
      Date.now() < B.current || ((L = K.current) == null ? void 0 : L.status) === "completed" || ((oe = K.current) == null ? void 0 : oe.status) === "terminated" || _(!1, !1);
    }, Qr);
    return () => {
      var L;
      window.clearInterval(V), (L = x.current) == null || L.abort(), x.current = null, z.current = !1, C.current += 1;
    };
  }, [v, e, _, H]), O && !g && !A)
    return n.createElement(w);
  if (A && !g)
    return n.createElement(f, {
      type: "warning",
      showIcon: !0,
      message: "专家团状态加载失败",
      description: A,
      style: { marginBottom: 16 },
      action: n.createElement(
        d,
        { size: "small", onClick: H, loading: O },
        "重试"
      )
    });
  const F = (V) => A ? n.createElement(
    n.Fragment,
    null,
    n.createElement(f, {
      type: "warning",
      showIcon: !0,
      message: "状态更新失败，当前显示上次成功读取的结果",
      description: A,
      style: { marginBottom: 16 },
      action: n.createElement(
        d,
        { size: "small", onClick: H, loading: O },
        "重试"
      )
    }),
    V
  ) : V;
  if ((g == null ? void 0 : g.status) === "unreadable")
    return F(
      n.createElement(f, {
        type: "warning",
        showIcon: !0,
        message: "专家团状态暂时无法读取",
        description: `实例 ${g.instance_id || "未知"} 的状态文件需要检查。`,
        style: { marginBottom: 16 },
        action: n.createElement(
          d,
          { size: "small", onClick: H, loading: O },
          "重试"
        )
      })
    );
  if (!g || !g.active) {
    if ((g == null ? void 0 : g.status) === "completed" || (g == null ? void 0 : g.status) === "terminated") {
      const V = g.status === "completed";
      return F(
        n.createElement(f, {
          type: V ? "success" : "info",
          showIcon: !0,
          message: V ? "专家团工作流已完成" : "专家团工作流已终止",
          description: V ? `实例 ${g.instance_id || "未知"} 已完成，结果文件保留在工作区。` : `原因：${g.state.termination_reason || "未知"}`,
          style: { marginBottom: 16 }
        })
      );
    }
    return F(
      n.createElement(u, {
        description: "暂无活跃的专家团工作流",
        style: { padding: 24 }
      })
    );
  }
  const D = g.state, R = D.current_phase || "plan", $ = Yr.indexOf(R), ee = D.team_name || "未知团队", ae = D.team_mode || "pipeline", N = D.iteration || 0, M = D.members || [], le = D.verify_retries || 0, te = {
    pipeline: "顺序交接",
    coordinator: "主管协作",
    roundtable: "并行汇聚",
    router: "智能路由",
    review_loop: "评审迭代",
    debate: "多方论证"
  };
  return F(
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
            `迭代 ${N}`
          ),
          le > 0 ? n.createElement(
            i,
            { color: "orange", style: { fontSize: 10 } },
            `验证重试 ${le}`
          ) : null
        ),
        extra: n.createElement(
          d,
          {
            size: "small",
            type: "text",
            icon: h ? n.createElement(h) : void 0,
            onClick: H,
            loading: O
          },
          "刷新"
        )
      },
      n.createElement(m, {
        current: $,
        size: "small",
        items: Yr.map((V) => {
          const ue = wi[V];
          return {
            title: `${ue.icon} ${ue.label}`,
            description: V === "plan" ? "分析任务，创建任务分解" : V === "dispatch" ? "分派专家执行任务" : V === "verify" ? "交叉验证专家结果" : V === "synthesize" ? "综合形成最终报告" : "工作流完成"
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
          (V, ue) => n.createElement(
            i,
            { key: `${V.name}-${ue}`, style: { fontSize: 11 } },
            `${V.emoji || ""} ${V.name}（${V.role}）`
          )
        )
      ),
      D.task ? n.createElement(
        p,
        {
          style: {
            fontSize: 12,
            marginTop: 8,
            marginBottom: 0,
            color: "var(--ant-color-text-secondary, #666)"
          },
          ellipsis: { rows: 2 }
        },
        `任务: ${D.task}`
      ) : null
    )
  );
}
function ki({ team: e }) {
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
      ...s.length > 0 ? s.map((d, m) => [
        m > 0 && !i ? t.createElement(
          "div",
          {
            key: `arrow-${m}`,
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
            key: `step-${m}`,
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
      ]).flat() : e.members.map((d, m) => [
        m > 0 && !i ? t.createElement(
          "div",
          {
            key: `arrow-${m}`,
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
            key: `member-${m}`,
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
const Ci = [
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
function Ti({
  open: e,
  onClose: t,
  agents: n,
  editingTeam: r,
  onSaved: a
}) {
  const l = k().React, { useState: o, useEffect: s, useCallback: i } = l, {
    Modal: c,
    Input: d,
    Button: m,
    Select: u,
    Tag: f,
    Typography: w,
    Switch: h,
    Empty: y,
    message: p,
    Divider: b,
    Steps: v
  } = k().antd, { PlusOutlined: g, DeleteOutlined: S, SaveOutlined: O, ArrowRightOutlined: W } = k().antdIcons || {}, { Text: A, Paragraph: I } = w, [K, j] = o(""), [B, C] = o("🤝"), [x, z] = o(""), [_, H] = o("pipeline"), [F, D] = o(""), [R, $] = o(""), [ee, ae] = o([]), [N, M] = o([]), [le, te] = o(!1), [V, ue] = o(2), [L, oe] = o(""), [ge, X] = o(""), [se, ne] = o({}), [xe, Se] = o({}), [Be, ve] = o(
    Ci
  ), ie = [
    { value: "pipeline", icon: "→", title: "顺序交接", description: "上一步产物成为下一位专家的上下文", topology: "A → B → C", accent: "#08979c" },
    { value: "roundtable", icon: "⇉", title: "并行汇聚", description: "独立并行分析，避免观点相互污染", topology: "A ∥ B ∥ C → 汇总", accent: "#531dab" },
    { value: "coordinator", icon: "◎", title: "主管协作", description: "主控专家拆解任务并按需组织成员", topology: "主管 → 专家组", accent: "#0958d9" },
    { value: "router", icon: "◇", title: "智能路由", description: "按任务能力需求选择最小充分专家集合", topology: "任务 → 路由 → 子集", accent: "#d46b08" },
    { value: "review_loop", icon: "↻", title: "评审迭代", description: "产出、独立审查、修订，直到满足标准", topology: "执行 ⇄ 评审", accent: "#389e0d" },
    { value: "debate", icon: "⚖", title: "多方论证", description: "独立立场、交叉质询，再由裁决者综合", topology: "观点 ⇄ 反驳 → 裁决", accent: "#c41d7f" }
  ];
  s(() => {
    e && (r ? (j(r.name), C(r.emoji), z(r.description), H(r.mode), D(r.coordinatorName || ""), $(r.taskTemplate), ae(r.steps || []), M(r.members.map((T) => T.name)), ue(r.maxReviewRounds || 2), oe(r.successCriteria || ""), X(r.routingInstruction || ""), ne(
      Object.fromEntries(
        r.members.map((T) => [
          T.name,
          T.bindingMode || (T.agentId ? "fixed" : "preferred")
        ])
      )
    ), Se(
      Object.fromEntries(
        r.members.map((T) => [
          T.name,
          T.roleKey || Yt(T.name)
        ])
      )
    )) : (j(""), C("🤝"), z(""), H("pipeline"), D(""), $(`请执行以下任务：
任务描述：{任务描述}`), ae([]), M([]), ue(2), oe(""), X(""), ne({}), Se({})));
  }, [e, r]), s(() => {
    e && vi().then((T) => {
      T != null && T.length && ve(T);
    });
  }, [e]);
  const we = i(() => {
    if (_ === "roundtable" || _ === "debate" || _ === "router") {
      const T = N.map((me) => ({
        agentName: me,
        instruction: "请给出你的专业评估意见",
        passContext: !1
      }));
      ae(T);
    } else if (_ === "pipeline") {
      const T = new Map(ee.map((Y) => [Y.agentName, Y])), me = N.map((Y) => T.get(Y) || {
        agentName: Y,
        instruction: "请完成你的专业部分",
        passContext: !0
      });
      ae(me);
    }
  }, [_, N, ee]), Ae = (T) => {
    N.includes(T) || (M([...N, T]), ne({ ...se, [T]: "fixed" }), Se({
      ...xe,
      [T]: Yt(T)
    }), (_ === "coordinator" || _ === "debate") && !F && D(T));
  }, U = (T) => {
    const me = N.filter((he) => he !== T);
    M(me), ae(ee.filter((he) => he.agentName !== T));
    const Y = { ...se };
    delete Y[T], ne(Y);
    const pe = { ...xe };
    delete pe[T], Se(pe), F === T && D(me[0] || "");
  }, de = (T, me, Y) => {
    const pe = [...ee];
    pe[T] = { ...pe[T], [me]: Y }, ae(pe);
  }, ye = async () => {
    if (!K.trim()) {
      p.warning("请输入团队名称");
      return;
    }
    if (N.length < 2) {
      p.warning("至少需要选择 2 个成员");
      return;
    }
    if (!R.trim()) {
      p.warning("请输入任务模板");
      return;
    }
    if ((_ === "coordinator" || _ === "debate") && !F) {
      p.warning(_ === "debate" ? "请选择裁决者" : "请选择主控专家");
      return;
    }
    te(!0);
    try {
      let T = [...N];
      _ === "coordinator" && F ? T = [F, ...T.filter((he) => he !== F)] : _ === "debate" && F && (T = [...T.filter((he) => he !== F), F]);
      const me = T.map(
        (he) => {
          var De;
          const Ie = n.find((ze) => ze.name === he), P = se[he] || "fixed", Ee = xe[he] || Yt(he), _e = Be.find((ze) => ze.key === Ee);
          return {
            name: he,
            role: (_e == null ? void 0 : _e.display_name) || ((De = Ie == null ? void 0 : Ie.description) == null ? void 0 : De.slice(0, 30)) || "需求分析师",
            emoji: "",
            agentId: P === "temporary" || Ie == null ? void 0 : Ie.id,
            roleKey: Ee,
            bindingMode: P
          };
        }
      );
      let Y = ee;
      (ee.length === 0 || ee.length !== N.length) && (Y = N.map((he) => ({
        agentName: he,
        instruction: "请完成你的专业部分",
        passContext: _ === "pipeline"
      })));
      const pe = {
        id: (r == null ? void 0 : r.id) || `custom-${Date.now()}`,
        name: K.trim(),
        emoji: B,
        category: "自定义",
        description: x.trim() || `${K.trim()}（${N.length}人团队）`,
        mode: _,
        members: me,
        coordinatorName: _ === "coordinator" || _ === "debate" ? F : void 0,
        taskTemplate: R.trim(),
        orchestrationPrompt: "",
        // Custom teams use steps-based instructions
        steps: Y,
        custom: !0,
        createdAt: (r == null ? void 0 : r.createdAt) || Date.now(),
        updatedAt: r == null ? void 0 : r.updatedAt,
        version: r == null ? void 0 : r.version,
        maxReviewRounds: V,
        successCriteria: L.trim(),
        routingInstruction: ge.trim()
      };
      await tl(pe), p.success(r ? "团队已更新" : "团队已创建"), a(), t();
    } catch (T) {
      p.error(T.message || "保存失败");
    } finally {
      te(!1);
    }
  }, q = n.filter(
    (T) => !N.includes(T.name)
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
      onOk: ye,
      okText: "保存专家团",
      confirmLoading: le,
      okButtonProps: {
        icon: O ? l.createElement(O) : void 0
      }
    },
    // Step 1: Basic info
    l.createElement(
      "div",
      { style: { marginBottom: 16 } },
      l.createElement(
        A,
        {
          strong: !0,
          style: { display: "block", marginBottom: 8, fontSize: 13 }
        },
        "1. 定义任务工作流"
      ),
      l.createElement(
        "div",
        { style: { display: "flex", gap: 8, marginBottom: 8, alignItems: "center" } },
        N.length > 0 ? l.createElement(sr, {
          members: N,
          size: 36
        }) : null,
        l.createElement(d, {
          placeholder: "专家团名称（如：储层评价与质量复核专家团）",
          value: K,
          onChange: (T) => j(T.target.value),
          style: { flex: 1 }
        })
      ),
      l.createElement(d.TextArea, {
        placeholder: "说明这个工作流解决什么问题、适用于什么场景",
        value: x,
        onChange: (T) => z(T.target.value),
        rows: 2,
        style: { marginBottom: 8 }
      }),
      l.createElement(
        A,
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
        ...ie.map((T) => {
          const me = _ === T.value;
          return l.createElement(
            "button",
            {
              key: T.value,
              type: "button",
              onClick: () => {
                H(T.value), T.value !== "coordinator" && T.value !== "debate" && D("");
              },
              style: {
                textAlign: "left",
                padding: 10,
                borderRadius: 8,
                cursor: "pointer",
                background: me ? `${T.accent}0d` : "var(--ant-color-bg-container, #fff)",
                border: `1px solid ${me ? T.accent : "var(--ant-color-border, #d9d9d9)"}`,
                boxShadow: me ? `0 0 0 2px ${T.accent}1a` : "none"
              }
            },
            l.createElement(
              "div",
              { style: { display: "flex", alignItems: "center", gap: 7, color: T.accent, fontWeight: 600 } },
              l.createElement("span", { style: { fontSize: 18 } }, T.icon),
              T.title
            ),
            l.createElement("div", { style: { fontSize: 11, color: "#595959", marginTop: 5, lineHeight: 1.45 } }, T.description),
            l.createElement("div", { style: { fontSize: 10, color: T.accent, marginTop: 5, fontFamily: "monospace" } }, T.topology)
          );
        })
      )
    ),
    l.createElement(b, { style: { margin: "12px 0" } }),
    // Step 2: Select members
    l.createElement(
      "div",
      { style: { marginBottom: 16 } },
      l.createElement(
        A,
        {
          strong: !0,
          style: { display: "block", marginBottom: 8, fontSize: 13 }
        },
        "2. 配置专家角色"
      ),
      // Available agents
      q.length > 0 ? l.createElement(
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
        ...q.map(
          (T) => l.createElement(
            m,
            {
              key: T.id,
              size: "small",
              icon: g ? l.createElement(g) : void 0,
              onClick: () => Ae(T.name)
            },
            T.name
          )
        )
      ) : null,
      // Selected members
      N.length === 0 ? l.createElement(y, {
        description: "请从上方添加团队成员",
        image: y.PRESENTED_IMAGE_SIMPLE
      }) : l.createElement(
        "div",
        { style: { display: "flex", flexDirection: "column", gap: 4 } },
        ...N.map(
          (T) => l.createElement(
            "div",
            {
              key: T,
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
              l.createElement(et, { name: T, size: 24 }),
              l.createElement(
                A,
                { strong: !0, style: { fontSize: 13 } },
                T
              ),
              (_ === "coordinator" || _ === "debate") && F === T ? l.createElement(
                f,
                { color: "blue", style: { fontSize: 10 } },
                _ === "debate" ? "裁决者" : "主控"
              ) : null
            ),
            l.createElement(
              "div",
              { style: { display: "flex", gap: 4 } },
              l.createElement(u, {
                size: "small",
                value: xe[T] || Yt(T),
                style: { width: 132 },
                onChange: (me) => Se({ ...xe, [T]: me }),
                options: Be.map((me) => ({
                  value: me.key,
                  label: me.display_name
                }))
              }),
              l.createElement(u, {
                size: "small",
                value: se[T] || "fixed",
                style: { width: 118 },
                onChange: (me) => ne({ ...se, [T]: me }),
                options: [
                  { value: "fixed", label: "固定实例" },
                  { value: "preferred", label: "优先实例" },
                  { value: "temporary", label: "临时派生" }
                ]
              }),
              _ === "coordinator" || _ === "debate" ? l.createElement(
                m,
                {
                  size: "small",
                  type: "link",
                  onClick: () => D(T)
                },
                _ === "debate" ? "设为裁决者" : "设为主控"
              ) : null,
              l.createElement(
                m,
                {
                  size: "small",
                  type: "link",
                  danger: !0,
                  icon: S ? l.createElement(S) : void 0,
                  onClick: () => U(T)
                },
                "移除"
              )
            )
          )
        )
      )
    ),
    _ === "review_loop" || _ === "router" ? l.createElement(
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
      _ === "review_loop" ? l.createElement(
        "div",
        { style: { display: "grid", gridTemplateColumns: "150px 1fr", gap: 10 } },
        l.createElement(u, {
          value: V,
          onChange: (T) => ue(T),
          options: [1, 2, 3, 4, 5].map((T) => ({ value: T, label: `最多 ${T} 轮` }))
        }),
        l.createElement(d, {
          value: L,
          onChange: (T) => oe(T.target.value),
          placeholder: "验收标准，例如：关键结论均有数据依据，且无高风险缺陷"
        })
      ) : l.createElement(d, {
        value: ge,
        onChange: (T) => X(T.target.value),
        placeholder: "路由偏好，例如：仅调用任务必需的专家；涉及模拟时优先油藏工程师"
      })
    ) : null,
    l.createElement(b, { style: { margin: "12px 0" } }),
    // Step 3: Define execution steps (for pipeline/roundtable)
    N.length > 0 ? l.createElement(
      "div",
      { style: { marginBottom: 16 } },
      l.createElement(
        A,
        {
          strong: !0,
          style: { display: "block", marginBottom: 8, fontSize: 13 }
        },
        `3. 配置专家任务${_ === "roundtable" ? "（并行独立）" : _ === "pipeline" ? "（顺序交接）" : _ === "router" ? "（作为候选能力）" : _ === "review_loop" ? "（首位执行、末位评审）" : _ === "debate" ? "（末位为裁决者）" : "（由主控动态编排）"}`
      ),
      // Auto-sync button
      l.createElement(
        m,
        {
          size: "small",
          type: "dashed",
          onClick: we,
          style: { marginBottom: 8 }
        },
        "自动生成步骤"
      ),
      // Steps list
      ee.length === 0 ? l.createElement(
        A,
        { type: "secondary", style: { fontSize: 12 } },
        "点击「自动生成步骤」或手动配置每步的指令"
      ) : l.createElement(
        "div",
        { style: { display: "flex", flexDirection: "column", gap: 6 } },
        ...ee.map(
          (T, me) => l.createElement(
            "div",
            {
              key: me,
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
              _ === "pipeline" ? l.createElement(
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
                `${me + 1}`
              ) : l.createElement(
                "span",
                { style: { fontSize: 14 } },
                "🔀"
              ),
              l.createElement(
                f,
                { color: "blue", style: { fontSize: 11 } },
                T.agentName
              ),
              l.createElement(
                "div",
                { style: { flex: 1 } },
                l.createElement(d, {
                  placeholder: "请输入该步骤的指令...",
                  value: T.instruction,
                  onChange: (Y) => de(me, "instruction", Y.target.value),
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
                checked: T.passContext,
                onChange: (Y) => de(me, "passContext", Y)
              }),
              l.createElement(
                A,
                { type: "secondary", style: { fontSize: 11 } },
                T.passContext ? "传递上一步结果作为上下文" : "独立执行"
              )
            )
          )
        )
      )
    ) : null,
    l.createElement(b, { style: { margin: "12px 0" } }),
    // Step 4: Task template
    l.createElement(
      "div",
      null,
      l.createElement(
        A,
        {
          strong: !0,
          style: { display: "block", marginBottom: 8, fontSize: 13 }
        },
        `${N.length > 0 ? "4" : "3"}. 任务模板`
      ),
      l.createElement(d.TextArea, {
        placeholder: `输入任务模板，可用 {参数名} 作为占位符...

例如：
请对区块 {区块名} 的井 {井号} 进行储层评价`,
        value: R,
        onChange: (T) => $(T.target.value),
        rows: 4,
        style: { fontFamily: "monospace", fontSize: 13 }
      }),
      l.createElement(
        A,
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
  const l = k().React, { useState: o } = l, { Card: s, Tag: i, Typography: c, Button: d, Tooltip: m, Popconfirm: u } = k().antd, {
    TeamOutlined: f,
    RocketOutlined: w,
    UserOutlined: h,
    EditOutlined: y,
    DeleteOutlined: p,
    DownOutlined: b,
    UpOutlined: v
  } = k().antdIcons || {}, { Text: g, Paragraph: S } = c, [O, W] = o(!1), A = {
    coordinator: { label: "主管协作", color: "blue" },
    pipeline: { label: "顺序交接", color: "cyan" },
    roundtable: { label: "并行汇聚", color: "purple" },
    router: { label: "智能路由", color: "orange" },
    review_loop: { label: "评审迭代", color: "green" },
    debate: { label: "多方论证", color: "magenta" }
  }, I = A[e.mode] || A.coordinator, K = e.members.map((x) => {
    const z = x.bindingMode === "temporary", _ = z ? null : (x.agentId && t.some((H) => H.id === x.agentId) ? x.agentId : null) || nl(t, x.name);
    return { ...x, found: !!_, agentId: _, temporary: z };
  }), j = K.filter((x) => x.found).length, B = e.coordinatorName || ((C = e.members[0]) == null ? void 0 : C.name);
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
            { color: I.color, style: { fontSize: 10 } },
            I.label
          ),
          l.createElement(
            i,
            { color: "green", style: { fontSize: 10 } },
            `${e.members.length} 位专家`
          ),
          j < e.members.length ? l.createElement(
            m,
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
          m,
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
          m,
          { title: "删除" },
          l.createElement(
            u,
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
              icon: p ? l.createElement(p) : void 0,
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
      ...K.map(
        (x) => l.createElement(
          m,
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
          x.stopPropagation(), W(!O);
        },
        icon: O ? v ? l.createElement(v) : "▲" : b ? l.createElement(b) : "▼"
      },
      O ? "收起流程" : "查看执行流程"
    ),
    O ? l.createElement(ki, { team: e }) : null,
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
function _i({
  agents: e,
  onLaunch: t
}) {
  const n = k().React, { useMemo: r, useState: a, useCallback: l, useEffect: o } = n, {
    Row: s,
    Col: i,
    Input: c,
    Empty: d,
    Typography: m,
    Tag: u,
    Button: f,
    Divider: w,
    Tabs: h,
    message: y
  } = k().antd, { SearchOutlined: p, PlusOutlined: b, RocketOutlined: v } = k().antdIcons || {}, { Text: g } = m, [S, O] = a(""), [W, A] = a([]), [I, K] = a([]), [j, B] = a(!1), [C, x] = a(null), [z, _] = a("preset");
  o(() => {
    let M = !0;
    return (async () => {
      try {
        await fi();
        const le = await Dn();
        M && A(le);
      } catch (le) {
        console.warn("[ugsci] Failed to load backend expert teams:", le), M && (A([]), y.warning("专家团后端加载失败，请检查服务后重试"));
      }
    })(), bi().then((le) => {
      M && le && K(le);
    }), () => {
      M = !1;
    };
  }, []);
  const H = l(() => {
    Dn().then(A).catch((M) => {
      console.warn("[ugsci] Failed to refresh expert teams:", M), A([]), y.warning("专家团后端加载失败，请检查服务后重试");
    });
  }, [y]), F = l(
    (M) => {
      mi(M.id).then(() => {
        H(), y.success(`团队「${M.name}」已删除`);
      }).catch((le) => y.error(le.message || "删除专家团失败"));
    },
    [y, H]
  ), D = l((M) => {
    x(M), B(!0);
  }, []), R = l(() => {
    x(null), B(!0);
  }, []), $ = r(() => [...W, ...I], [W, I]), ee = r(() => {
    if (!S.trim()) return $;
    const M = S.toLowerCase();
    return $.filter(
      (le) => le.name.toLowerCase().includes(M) || le.description.toLowerCase().includes(M) || le.category.toLowerCase().includes(M)
    );
  }, [$, S]), ae = ee.filter((M) => M.custom), N = ee.filter((M) => !M.custom);
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
        prefix: p ? n.createElement(p) : void 0,
        value: S,
        onChange: (M) => O(M.target.value),
        allowClear: !0,
        style: { flex: "1 1 280px", maxWidth: 400 }
      }),
      n.createElement(
        f,
        {
          type: "primary",
          size: "small",
          icon: b ? n.createElement(b) : void 0,
          onClick: R,
          style: We
        },
        "创建专家团"
      )
    ),
    // Tabs: preset teams vs custom teams
    n.createElement(
      h,
      {
        activeKey: z,
        onChange: _,
        items: [
          {
            key: "preset",
            label: `预设团队${N.length ? ` (${N.length})` : ""}`,
            children: n.createElement(
              "div",
              null,
              N.length > 0 ? n.createElement(
                s,
                { gutter: [12, 12] },
                ...N.map(
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
                      onEdit: D,
                      onDelete: F
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
              n.createElement(xi, {
                enabled: z === "active"
              }),
              n.createElement(Xr, {
                activeOnly: !0,
                enabled: z === "active"
              })
            )
          },
          {
            key: "history",
            label: "讨论历史",
            children: n.createElement(Xr, {
              enabled: z === "history"
            })
          }
        ]
      }
    ),
    // Team Builder Modal
    n.createElement(Ti, {
      open: j,
      onClose: () => {
        B(!1), x(null);
      },
      agents: e,
      editingTeam: C,
      onSaved: H
    })
  );
}
const Ii = [
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
], Ai = 5e3, $n = {
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
function zi(e) {
  window.history.pushState({}, "", e), window.dispatchEvent(new PopStateEvent("popstate"));
}
function Pn(e, t) {
  const n = new URLSearchParams();
  e && n.set("flow", e), t && n.set("run", t), zi(`/flowforge${n.size ? `?${n.toString()}` : ""}`);
}
function $i(e) {
  return e ? new Date(e * 1e3).toLocaleString("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  }) : "—";
}
function Pi(e) {
  if (!e || e <= 0) return "—";
  if (e < 1e3) return `${e}ms`;
  const t = Math.floor(e / 1e3);
  if (t < 60) return `${t}s`;
  const n = Math.floor(t / 60), r = t % 60;
  return `${n}m${r}s`;
}
function Ri(e) {
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
function Oi(e, t) {
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
function Mi() {
  const e = k().React, { useCallback: t, useEffect: n, useRef: r, useState: a } = e, {
    Alert: l,
    Button: o,
    Card: s,
    Col: i,
    Empty: c,
    Input: d,
    Popconfirm: m,
    Row: u,
    Space: f,
    Spin: w,
    Tabs: h,
    Progress: y,
    Tag: p,
    Tooltip: b,
    Typography: v,
    message: g
  } = k().antd, {
    ApartmentOutlined: S,
    DeleteOutlined: O,
    ReloadOutlined: W,
    RocketOutlined: A,
    PlayCircleOutlined: I,
    StopOutlined: K
  } = k().antdIcons || {}, { Text: j, Paragraph: B, Title: C } = v, x = k().useSelectedAgent, z = x ? x() : { id: "default" }, _ = (z == null ? void 0 : z.id) || "default", [H, F] = a([]), [D, R] = a([]), [$, ee] = a([]), [ae, N] = a(!0), [M, le] = a(!0), [te, V] = a(null), [ue, L] = a(""), [oe, ge] = a(""), [X, se] = a("templates"), [ne, xe] = a(/* @__PURE__ */ new Set()), [Se, Be] = a(/* @__PURE__ */ new Set()), ve = r(null), ie = D.some((P) => Qt.has(P.status)), we = e.useMemo(() => {
    const P = {};
    return H.forEach((Ee) => {
      P[Ee.id] = Ee.name;
    }), P;
  }, [H]), Ae = e.useMemo(() => {
    const P = {};
    return D.forEach((Ee) => {
      Qt.has(Ee.status) && (P[Ee.flow_id] = (P[Ee.flow_id] || 0) + 1);
    }), P;
  }, [D]), U = t(async (P = !1) => {
    P || N(!0);
    try {
      const [Ee, _e, De] = await Promise.all([
        ce("/flowforge/flows", { bypassCache: !0 }),
        ce("/flowforge/runs", { bypassCache: !0 }),
        vn().catch(() => [])
      ]);
      F(Ee), R(_e), ee(De), le(!0);
    } catch (Ee) {
      console.warn("[ugsci] FlowForge is unavailable:", Ee), le(!1);
    } finally {
      P || N(!1);
    }
  }, []);
  n(() => {
    U();
  }, [U]), n(() => {
    if (!M || !ie) {
      ve.current && (clearTimeout(ve.current), ve.current = null);
      return;
    }
    return ve.current = setTimeout(() => {
      U(!0);
    }, Ai), () => {
      ve.current && (clearTimeout(ve.current), ve.current = null);
    };
  }, [ie, M, U]);
  const de = t(
    async (P) => {
      if (!te) {
        V(P.key);
        try {
          const Ee = await ce(
            "/flowforge/generate",
            {
              method: "POST",
              body: JSON.stringify({
                prompt: P.sop,
                name: P.name,
                agent_id: _
              })
            }
          ), _e = {
            ...Ee.nodes || {}
          }, De = Object.entries(_e).filter(([re]) => /^step_\d+$/.test(re)).sort(([re], [$e]) => Number(re.slice(5)) - Number($e.slice(5))), ze = {};
          let Ye = 0, Ze = 0;
          De.forEach(([re, $e], Me) => {
            const Ue = P.roleHints[Me] || "", Le = P.roleKeys[Me] || "analyst", Re = $.find(
              (ct) => `${ct.name} ${ct.id}`.toLowerCase().includes(Ue.toLowerCase())
            );
            Re ? Ye++ : Ze++;
            const ke = (Re == null ? void 0 : Re.id) || _, st = { ...$e.inputs || {} };
            st.agent_id = ke, _e[re] = {
              ...$e,
              inputs: st,
              metadata: {
                ...$e.metadata || {},
                binding_policy: "fixed_instance",
                role_hint: Ue,
                role_key: Le,
                agent_id: ke
              }
            }, ze[re] = {
              binding_policy: "fixed_instance",
              role_hint: Ue,
              role_key: Le,
              agent_id: ke
            };
          });
          const Fe = {
            ...Ee,
            nodes: _e,
            id: `${P.key}-${Date.now()}`,
            name: P.name,
            description: P.description,
            metadata: {
              ...Ee.metadata || {},
              domain: "oil-gas",
              template_key: P.key,
              expert_binding_policy: "fixed_instance",
              controller_agent_id: _,
              node_bindings: ze
            }
          };
          await ce("/flowforge/flows", {
            method: "POST",
            body: JSON.stringify(Fe)
          });
          const Oe = De.length > 0 ? `（${Ye} 个专家已匹配，${Ze} 个回退到控制器）` : "";
          g.success(`已创建工作流草稿「${P.name}」${Oe}`), await U();
        } catch (Ee) {
          g.error(Ee.message || "创建工作流失败");
        } finally {
          V(null);
        }
      }
    },
    [$, _, te, U, g]
  ), ye = t(async () => {
    if (!te) {
      if (!oe.trim()) {
        g.warning("请先描述工作流步骤和控制要求");
        return;
      }
      V("natural-language");
      try {
        const P = await ce(
          "/flowforge/generate",
          {
            method: "POST",
            body: JSON.stringify({
              prompt: oe.trim(),
              name: ue.trim(),
              agent_id: _
            })
          }
        ), Ee = {
          ...P,
          id: `natural-${Date.now()}`,
          metadata: {
            ...P.metadata || {},
            domain: "oil-gas",
            source: "natural-language",
            expert_binding_policy: "fixed_instance",
            controller_agent_id: _
          }
        };
        await ce("/flowforge/flows", {
          method: "POST",
          body: JSON.stringify(Ee)
        }), g.success("已从自然语言生成可编辑工作流草稿"), L(""), ge(""), await U();
      } catch (P) {
        g.error(P.message || "自然语言生成失败");
      } finally {
        V(null);
      }
    }
  }, [_, te, U, g, ue, oe]), q = t(
    async (P, Ee) => {
      try {
        await ce(`/flowforge/flows/${encodeURIComponent(P)}/run`, {
          method: "POST",
          body: JSON.stringify({ inputs: {} })
        }), g.success(`已启动工作流「${Ee}」`), await U(!0);
      } catch (_e) {
        g.error(_e.message || "启动工作流失败");
      }
    },
    [U, g]
  ), T = t(
    async (P, Ee) => {
      try {
        await ce(`/flowforge/flows/${encodeURIComponent(P)}`, {
          method: "DELETE"
        }), g.success(`已删除工作流「${Ee}」`), await U();
      } catch (_e) {
        g.error(_e.message || "删除工作流失败");
      }
    },
    [U, g]
  ), me = t(
    async (P) => {
      xe((Ee) => {
        const _e = new Set(Ee);
        return _e.add(P), _e;
      });
      try {
        await ce(`/flowforge/runs/${encodeURIComponent(P)}/cancel`, {
          method: "POST"
        }), g.success("已请求取消运行"), await U(!0);
      } catch (Ee) {
        g.error(Ee.message || "取消运行失败");
      } finally {
        xe((Ee) => {
          const _e = new Set(Ee);
          return _e.delete(P), _e;
        });
      }
    },
    [U, g]
  ), Y = e.createElement(
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
        f,
        { direction: "vertical", style: { width: "100%" }, size: 10 },
        e.createElement(d, {
          value: ue,
          onChange: (P) => L(P.target.value),
          placeholder: "工作流名称（可选）",
          maxLength: 80
        }),
        e.createElement(d.TextArea, {
          value: oe,
          onChange: (P) => ge(P.target.value),
          placeholder: "例如：先检查某储气库本周期压力和注采量数据，再由油藏工程师预测下周期能力，由独立完整性专家复核风险，最后形成带证据和不确定性的建议。",
          autoSize: { minRows: 3, maxRows: 8 }
        }),
        e.createElement(
          o,
          {
            type: "primary",
            onClick: () => void ye(),
            loading: te === "natural-language",
            disabled: !M || !!te,
            style: We
          },
          "生成可编辑草稿"
        )
      )
    ),
    e.createElement(
      u,
      { gutter: [12, 12] },
      ...Ii.map(
        (P) => e.createElement(
          i,
          { key: P.key, xs: 24, md: 8 },
          e.createElement(
            s,
            { style: { height: "100%" } },
            e.createElement(
              f,
              { align: "start", style: { width: "100%" } },
              e.createElement("span", { style: { fontSize: 28 } }, P.icon),
              e.createElement(
                "div",
                { style: { flex: 1 } },
                e.createElement(C, { level: 5, style: { margin: 0 } }, P.name),
                e.createElement(p, { color: "blue", style: { marginTop: 6 } }, P.category),
                e.createElement(
                  B,
                  { type: "secondary", style: { margin: "10px 0 14px" } },
                  P.description
                ),
                e.createElement(
                  o,
                  {
                    type: "primary",
                    loading: te === P.key,
                    disabled: !M || !!te,
                    onClick: () => void de(P),
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
        u,
        { gutter: [12, 12] },
        ...[
          ["固定实例", "生产关键节点使用指定且已验证的专家实例", "当前可执行"],
          ["优先实例", "定义中记录首选实例和治理降级策略", "规划中"],
          ["模板派生", "由 OMP 控制节点按角色模板临时创建隔离角色", "规划中"],
          ["动态路由", "按能力、健康、权限和成本选择实例", "规划中"]
        ].map(
          ([P, Ee, _e]) => e.createElement(
            i,
            { key: P, xs: 24, sm: 12, lg: 6 },
            e.createElement(j, { strong: !0 }, P),
            e.createElement(
              p,
              {
                color: _e === "当前可执行" ? "green" : "default",
                style: { marginLeft: 6, fontSize: 10 }
              },
              _e
            ),
            e.createElement("div", { style: { color: "var(--ant-color-text-tertiary, #8c8c8c)", fontSize: 12, marginTop: 4 } }, Ee)
          )
        )
      )
    )
  ), pe = ae ? e.createElement(w) : H.length === 0 ? e.createElement(c, { description: "暂无工作流，可从模板创建" }) : e.createElement(
    u,
    { gutter: [12, 12] },
    ...H.map((P) => {
      const Ee = Ae[P.id] || 0;
      return e.createElement(
        i,
        { key: P.id, xs: 24, md: 12, xl: 8 },
        e.createElement(
          s,
          {
            size: "small",
            title: e.createElement(
              f,
              { size: 6 },
              e.createElement("span", null, P.name),
              Ee > 0 ? e.createElement(
                p,
                { color: "blue" },
                `${Ee} 个运行中`
              ) : null
            ),
            extra: e.createElement(p, null, `v${P.version}`)
          },
          e.createElement(B, { ellipsis: { rows: 2 } }, P.description || "暂无描述"),
          e.createElement(
            f,
            { size: 8, wrap: !0 },
            e.createElement(p, { color: "geekblue" }, `${P.node_count} 个节点`),
            e.createElement(o, {
              size: "small",
              type: "primary",
              icon: I ? e.createElement(I) : void 0,
              disabled: !M,
              onClick: () => void q(P.id, P.name)
            }, "运行"),
            e.createElement(o, {
              size: "small",
              onClick: () => Pn(P.id)
            }, "编辑"),
            e.createElement(
              m,
              {
                title: "确认删除",
                description: `确定要删除工作流「${P.name}」吗？此操作不可撤销。`,
                onConfirm: () => void T(P.id, P.name),
                okText: "删除",
                cancelText: "取消",
                okButtonProps: { danger: !0 }
              },
              e.createElement(o, {
                size: "small",
                danger: !0,
                icon: O ? e.createElement(O) : void 0
              }, "删除")
            )
          )
        )
      );
    })
  ), he = ae ? e.createElement(w) : D.length === 0 ? e.createElement(c, { description: "暂无工作流运行记录" }) : e.createElement(
    "div",
    { style: { display: "flex", flexDirection: "column", gap: 8 } },
    ...D.map((P) => {
      const Ee = we[P.flow_id] || P.flow_id, _e = Qt.has(P.status), De = Ri(P.node_statuses), ze = Object.entries(P.node_statuses || {}), Ye = ze.filter(([, Le]) => ["success", "completed", "skipped", "cached"].includes(Le)).length, Ze = ze.filter(([, Le]) => ["error", "failed"].includes(Le)).length, Fe = ze.length > 0, Oe = P.status === "completed" || P.status === "success", re = Fe ? Math.round(Ye / ze.length * 100) : _e ? 18 : Oe ? 100 : 0, $e = Array.isArray(P.events) ? P.events.filter(
        (Le) => !!Le && typeof Le == "object"
      ).slice(-100) : [], Me = Se.has(P.run_id), Ue = P.duration_ms && P.duration_ms > 0 ? P.duration_ms : P.finished_at && P.started_at ? (P.finished_at - P.started_at) * 1e3 : _e && P.started_at ? (Date.now() / 1e3 - P.started_at) * 1e3 : 0;
      return e.createElement(
        s,
        {
          key: P.run_id,
          size: "small",
          style: {
            borderLeft: `3px solid ${$n[P.status] === "green" ? "#52c41a" : $n[P.status] === "red" ? "#ff4d4f" : "#1677ff"}`,
            transition: "box-shadow .2s ease"
          }
        },
        e.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" } },
          e.createElement(
            p,
            { color: $n[P.status] || "default" },
            P.status
          ),
          e.createElement(j, { strong: !0 }, Ee),
          e.createElement(
            b,
            { title: P.run_id },
            e.createElement(
              j,
              { type: "secondary", style: { fontFamily: "monospace", fontSize: 11 } },
              P.run_id.slice(0, 8) + "…"
            )
          ),
          e.createElement(
            j,
            { type: "secondary", style: { fontSize: 12 } },
            $i(P.started_at)
          ),
          Ue > 0 ? e.createElement(
            j,
            { type: "secondary", style: { fontSize: 12 } },
            `耗时 ${Pi(Ue)}`
          ) : null,
          De ? e.createElement(p, { color: "geekblue", style: { fontSize: 11 } }, De) : null,
          P.error ? e.createElement(
            b,
            { title: P.error },
            e.createElement(j, { type: "danger", style: { fontSize: 12 } }, "（有错误）")
          ) : null,
          e.createElement(
            "div",
            { style: { marginLeft: "auto", display: "flex", gap: 6 } },
            _e ? e.createElement(
              m,
              {
                title: "确认取消运行？",
                onConfirm: () => void me(P.run_id),
                okText: "取消运行",
                cancelText: "保留",
                okButtonProps: { danger: !0 }
              },
              e.createElement(o, {
                size: "small",
                danger: !0,
                loading: ne.has(P.run_id),
                icon: K ? e.createElement(K) : void 0
              }, "取消运行")
            ) : null,
            e.createElement(
              o,
              {
                size: "small",
                type: "link",
                onClick: () => Be((Le) => {
                  const Re = new Set(Le);
                  return Re.has(P.run_id) ? Re.delete(P.run_id) : Re.add(P.run_id), Re;
                })
              },
              Me ? "收起过程" : "查看过程"
            ),
            e.createElement(
              o,
              {
                size: "small",
                type: "link",
                onClick: () => Pn(void 0, P.run_id)
              },
              "查看详情"
            )
          )
        ),
        e.createElement(
          "div",
          { style: { marginTop: 10, display: "flex", alignItems: "center", gap: 10 } },
          e.createElement(y, { percent: re, size: "small", status: Ze || P.status === "failed" || P.status === "error" ? "exception" : _e ? "active" : "success", showInfo: !1, style: { flex: 1, margin: 0 } }),
          e.createElement(j, { type: "secondary", style: { fontSize: 12, minWidth: 90, textAlign: "right" } }, Fe ? `${re}%` : "暂无节点进度")
        ),
        Me && (ze.length > 0 || $e.length > 0 || P.error) ? e.createElement(
          "div",
          { style: { marginTop: 12, padding: "10px 12px", borderRadius: 8, background: "var(--ant-color-fill-quaternary, #fafafa)" } },
          e.createElement(
            "div",
            { style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 } },
            e.createElement(j, { strong: !0 }, "协作过程"),
            e.createElement(j, { type: "secondary", style: { fontSize: 12 } }, ze.length > 0 ? `${Ye}/${ze.length} 个 Agent 节点完成${Ze ? ` · ${Ze} 个失败` : ""}` : "暂无节点状态")
          ),
          ze.length > 0 ? e.createElement(
            "div",
            { style: { display: "grid", gap: 7 } },
            ...ze.map(
              ([Le, Re], ke) => e.createElement(
                "div",
                { key: Le, style: { display: "flex", alignItems: "center", gap: 8 } },
                e.createElement("span", { style: { width: 22, height: 22, borderRadius: "50%", display: "inline-flex", alignItems: "center", justifyContent: "center", background: It(Re) === "green" ? "#f6ffed" : It(Re) === "red" ? "#fff2f0" : "#e6f4ff", color: It(Re) === "green" ? "#389e0d" : It(Re) === "red" ? "#cf1322" : "#1677ff", fontSize: 11, fontWeight: 600 } }, ke + 1),
                e.createElement(j, { style: { flex: 1, fontSize: 12 } }, Le.replace(/^step[_-]?\d+[_-]?/, "") || `Agent ${ke + 1}`),
                ke < ze.length - 1 ? e.createElement(j, { type: "secondary", style: { fontSize: 11 } }, "→") : null,
                e.createElement(p, { color: It(Re), style: { margin: 0, fontSize: 11 } }, ll(Re))
              )
            )
          ) : null,
          $e.length > 0 ? e.createElement(
            "div",
            { style: { display: "grid", gap: 5, marginTop: ze.length > 0 ? 10 : 0 } },
            e.createElement(j, { strong: !0, style: { fontSize: 12 } }, "执行事件"),
            ...$e.map((Le, Re) => e.createElement(j, { key: `event-${Re}`, type: "secondary", style: { fontSize: 12 } }, Oi(Le, Re)))
          ) : null,
          P.error ? e.createElement(l, { type: "error", showIcon: !0, message: "运行错误", description: P.error, style: { marginTop: 10 } }) : null
        ) : null
      );
    })
  ), Ie = e.createElement(
    f,
    null,
    e.createElement(o, {
      icon: W ? e.createElement(W) : void 0,
      onClick: () => void U(),
      loading: ae
    }, "刷新"),
    X !== "templates" ? e.createElement(o, {
      type: "primary",
      icon: S ? e.createElement(S) : A ? e.createElement(A) : void 0,
      onClick: () => Pn(),
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
        { key: "templates", label: "工作流模板", children: Y },
        { key: "mine", label: `我的工作流 (${H.length})`, children: pe },
        {
          key: "runs",
          label: e.createElement(
            "span",
            null,
            "运行中心 (",
            D.length,
            ie ? e.createElement(
              "span",
              { style: { color: "#1677ff", marginLeft: 2 } },
              `·${D.filter((P) => Qt.has(P.status)).length} 活跃`
            ) : null,
            ")"
          ),
          children: he
        }
      ],
      activeKey: X,
      onChange: (P) => se(P),
      tabBarExtraContent: Ie
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
function Li() {
  var de, ye;
  const e = k().React, { useState: t, useEffect: n, useCallback: r, useMemo: a } = e, {
    Spin: l,
    Empty: o,
    Input: s,
    Button: i,
    message: c,
    Row: d,
    Col: m,
    Tabs: u,
    Modal: f,
    Typography: w
  } = k().antd, {
    ReloadOutlined: h,
    PlusOutlined: y,
    SearchOutlined: p,
    TeamOutlined: b,
    UserOutlined: v
  } = k().antdIcons || {}, { Text: g, Paragraph: S } = w, [O, W] = t([]), [A, I] = t(!0), [K, j] = t(!1), [B, C] = t(null), [x, z] = t(""), [_, H] = t(!1), [F, D] = t(ta), [R, $] = t(
    null
  ), [ee, ae] = t(""), [N, M] = t(!1), [le, te] = t(!1), [V, ue] = t(null), [L, oe] = t([]), ge = r(async () => {
    I(!0);
    try {
      const q = await vn(), T = await Promise.all(
        q.map(async (me) => {
          try {
            const [Y, pe, he] = await Promise.all([
              rr(me.id).catch(() => null),
              wn(me.id).catch(() => []),
              or(me.id).catch(() => [])
            ]);
            return {
              agent: me,
              config: Y,
              skills: pe,
              mcps: he,
              loading: !1
            };
          } catch {
            return {
              agent: me,
              config: null,
              skills: [],
              mcps: [],
              loading: !1
            };
          }
        })
      );
      W(T), oe(q);
    } catch (q) {
      c.error(q.message || "加载专家列表失败"), W([]);
    } finally {
      I(!1);
    }
  }, []);
  n(() => {
    ge();
  }, [ge]), n(() => {
    const q = () => D(ta());
    return window.addEventListener("popstate", q), () => window.removeEventListener("popstate", q);
  }, []), n(() => {
    if (V && le) {
      const q = O.find(
        (T) => T.agent.id === V.agent.id
      );
      q && q !== V && ue(q);
    }
  }, [O, V, le]);
  const X = r(
    async (q) => {
      var pe;
      const T = q.coordinatorName || ((pe = q.members[0]) == null ? void 0 : pe.name), me = ea(q, L);
      if (!me) {
        const he = q.members.find(
          (Ie) => Ie.name === T
        );
        c.error(
          (he == null ? void 0 : he.bindingMode) === "fixed" ? `固定协调者「${T || "协调者"}」当前不可用，请修复绑定后再运行` : "没有可用的 Agent 作为工作流控制器"
        );
        return;
      }
      if (/\{.+?\}/.test(q.taskTemplate)) {
        ae(q.taskTemplate), $(q);
        return;
      }
      await se(q, me, q.taskTemplate);
    },
    [L, c]
  ), se = r(
    async (q, T, me) => {
      M(!0);
      try {
        const Y = me || q.taskTemplate, pe = q.custom ? `@${q.id}` : q.name, he = `/ugsci-team ${q.mode} ${pe} ${Y}`, Ie = k();
        Ie.setSelectedAgent && Ie.setSelectedAgent(T);
        const P = await gi(
          T,
          he,
          q.name
        );
        c.success(
          `OMP 工作流已启动：${q.name}（${q.mode}模式）`
        ), $(null), ne(`/chat/${P}`);
      } catch (Y) {
        c.error(Y.message || "发起团队任务失败");
      } finally {
        M(!1);
      }
    },
    [c]
  ), ne = (q) => {
    window.history.pushState({}, "", q), window.dispatchEvent(new PopStateEvent("popstate"));
  }, xe = r((q) => {
    C(q), j(!0);
  }, []), Se = r((q) => {
    ue(q), te(!0);
  }, []), Be = r(
    (q) => {
      if (!q.agent.enabled) {
        c.warning(`专家「${q.agent.name}」未启用，请先启用`);
        return;
      }
      try {
        const T = k();
        T.setSelectedAgent && T.setSelectedAgent(q.agent.id);
      } catch (T) {
        console.warn("[ugsci] Failed to set selected agent:", T);
      }
      c.success(`已召唤专家「${q.agent.name}」，正在跳转至对话...`), ne("/chat");
    },
    [c]
  ), ve = a(() => {
    if (!x.trim()) return O;
    const q = x.toLowerCase();
    return O.filter(
      (T) => {
        var me;
        return T.agent.name.toLowerCase().includes(q) || ((me = T.agent.description) == null ? void 0 : me.toLowerCase().includes(q)) || T.agent.id.toLowerCase().includes(q) || T.skills.some((Y) => Y.name.toLowerCase().includes(q));
      }
    );
  }, [O, x]), ie = O.filter((q) => q.agent.enabled).length, we = O.reduce(
    (q, T) => q + T.skills.filter((me) => me.enabled !== !1).length,
    0
  ), Ae = O.reduce((q, T) => q + T.mcps.length, 0), U = [
    {
      key: "experts",
      label: e.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        v ? e.createElement(v, { style: { fontSize: 14 } }) : null,
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
            prefix: p ? e.createElement(p) : void 0,
            value: x,
            onChange: (q) => z(q.target.value),
            allowClear: !0,
            style: { flex: "1 1 280px", maxWidth: 400 }
          }),
          e.createElement(
            i,
            {
              type: "primary",
              icon: y ? e.createElement(y) : void 0,
              onClick: () => H(!0),
              style: We
            },
            "创建专家"
          )
        ),
        // Content
        A ? e.createElement(
          "div",
          { style: { textAlign: "center", padding: 60 } },
          e.createElement(l, { size: "large" })
        ) : ve.length === 0 ? e.createElement(o, {
          description: x ? "未找到匹配的专家" : "暂无专家，点击「创建专家」添加"
        }) : e.createElement(
          d,
          { gutter: [12, 12], align: "stretch" },
          ...ve.map(
            (q) => e.createElement(
              m,
              {
                key: q.agent.id,
                xs: 24,
                sm: 12,
                md: 8,
                lg: 6,
                style: { display: "flex" }
              },
              e.createElement(ni, {
                expert: q,
                onClick: () => xe(q),
                onSummon: () => Be(q),
                onConfigure: () => Se(q)
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
        b ? e.createElement(b, { style: { fontSize: 14 } }) : null,
        "专家团"
      ),
      children: e.createElement(_i, {
        agents: L,
        onLaunch: X
      })
    },
    {
      key: "workflows",
      label: e.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        (de = k().antdIcons) != null && de.ApartmentOutlined ? e.createElement(k().antdIcons.ApartmentOutlined, {
          style: { fontSize: 14 }
        }) : null,
        "协作工作流"
      ),
      children: e.createElement(Mi)
    }
  ];
  return e.createElement(
    "div",
    { style: { padding: 24 } },
    e.createElement(bn, {
      title: "专家·协作",
      subtitle: F === "experts" ? `共 ${O.length} 位专家（${ie} 位启用）· ${we} 个技能 · ${Ae} 个 MCP 客户端` : F === "teams" ? "开放式多专家讨论、联合研判与 OMP 动态协作" : "流程化、可观测、可验证的油气与储气库协作流程",
      extra: e.createElement(
        e.Fragment,
        null,
        F === "experts" ? e.createElement(
          i,
          {
            icon: h ? e.createElement(h) : void 0,
            onClick: () => {
              Ht(), ge();
            },
            loading: A
          },
          "刷新"
        ) : null
      )
    }),
    e.createElement(u, {
      items: U,
      activeKey: F,
      onChange: (q) => {
        D(q);
        const T = new URL(window.location.href);
        q === "experts" ? T.searchParams.delete("section") : T.searchParams.set("section", q), window.history.pushState({}, "", `${T.pathname}${T.search}`);
      }
    }),
    // Drawer
    e.createElement(ri, {
      expert: B,
      open: K,
      onClose: () => j(!1),
      onRefresh: () => ge()
    }),
    // Template Modal
    e.createElement(ai, {
      open: _,
      onClose: () => H(!1),
      onCreated: () => ge()
    }),
    // Config Modal (gear icon)
    e.createElement(ei, {
      expert: V,
      open: le,
      onClose: () => te(!1),
      onRefresh: () => ge()
    }),
    // Team Launch Modal (for filling placeholders)
    R ? e.createElement(
      f,
      {
        open: !0,
        title: e.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 8 } },
          e.createElement(sr, {
            members: R.members.map((q) => q.name),
            size: 28
          }),
          e.createElement(
            "span",
            null,
            `发起团队任务 - ${R.name}`
          )
        ),
        onCancel: () => $(null),
        onOk: () => {
          const q = ea(
            R,
            L
          );
          if (!q) {
            c.error("固定协调者不可用或没有可用的控制器 Agent");
            return;
          }
          const T = ee.trim() || R.taskTemplate;
          se(R, q, T);
        },
        confirmLoading: N,
        okText: "发起任务",
        width: 600
      },
      e.createElement(
        "div",
        null,
        e.createElement(
          g,
          {
            type: "secondary",
            style: { fontSize: 12, display: "block", marginBottom: 8 }
          },
          "任务内容（请替换 {参数名} 等占位符后发起）："
        ),
        e.createElement(s.TextArea, {
          value: ee,
          onChange: (q) => ae(q.target.value),
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
          g,
          { style: { fontSize: 12, color: "#0958d9" } },
          `协调者: ${R.coordinatorName || ((ye = R.members[0]) == null ? void 0 : ye.name) || "—"} · 成员: ${R.members.map((q) => q.name).join("、")}`
        )
      )
    ) : null
  );
}
function Bi({
  agentId: e,
  agentName: t,
  refreshKey: n = 0,
  onNavigate: r
}) {
  const a = k().React, { useState: l, useEffect: o, useCallback: s } = a, {
    Spin: i,
    Empty: c,
    Button: d,
    Row: m,
    Col: u,
    Card: f,
    Tag: w,
    Checkbox: h,
    Modal: y,
    Typography: p,
    Drawer: b,
    Descriptions: v,
    message: g
  } = k().antd, {
    ReloadOutlined: S,
    ThunderboltOutlined: O,
    SettingOutlined: W,
    CheckSquareOutlined: A,
    EyeOutlined: I,
    EyeInvisibleOutlined: K,
    DeleteOutlined: j,
    CloseOutlined: B
  } = k().antdIcons || {}, { Text: C, Paragraph: x } = p, [z, _] = l([]), [H, F] = l(!0), [D, R] = l(!1), [$, ee] = l(null), [ae, N] = l(!1), [M, le] = l(
    /* @__PURE__ */ new Set()
  ), [te, V] = l(!1), [ue, L] = l(null), [oe, ge] = l(!1), X = s(async () => {
    if (e) {
      F(!0);
      try {
        const U = await wn(e);
        _(U);
      } catch (U) {
        g.error(U.message || "加载技能失败"), _([]);
      } finally {
        F(!1);
      }
    }
  }, [e]);
  o(() => {
    X();
  }, [X, n]);
  const se = (U) => {
    le((de) => {
      const ye = new Set(de);
      return ye.has(U) ? ye.delete(U) : ye.add(U), ye;
    });
  }, ne = () => le(/* @__PURE__ */ new Set()), xe = () => le(new Set(z.map((U) => U.name))), Se = () => {
    ae ? (ne(), N(!1)) : N(!0);
  }, Be = async () => {
    const U = Array.from(M);
    if (U.length !== 0) {
      V(!0);
      try {
        const { results: de } = await $o(e, U), ye = Object.entries(de).filter(
          ([, T]) => T.success === !1
        ), q = U.length - ye.length;
        ye.length > 0 ? g.warning(
          `批量启用完成：成功 ${q} 个，失败 ${ye.length} 个`
        ) : g.success(`成功启用 ${U.length} 个技能`), ne(), await X();
      } catch (de) {
        g.error(de.message || "批量启用失败");
      } finally {
        V(!1);
      }
    }
  }, ve = async () => {
    const U = Array.from(M);
    if (U.length !== 0) {
      V(!0);
      try {
        const { results: de } = await Po(e, U), ye = Object.entries(de).filter(
          ([, T]) => T.success === !1
        ), q = U.length - ye.length;
        ye.length > 0 ? g.warning(
          `批量停用完成：成功 ${q} 个，失败 ${ye.length} 个`
        ) : g.success(`成功停用 ${U.length} 个技能`), ne(), await X();
      } catch (de) {
        g.error(de.message || "批量停用失败");
      } finally {
        V(!1);
      }
    }
  }, ie = () => {
    const U = Array.from(M);
    U.length !== 0 && y.confirm({
      title: `确认删除 ${U.length} 个技能？`,
      content: "删除后技能将从当前专家工作区移除，此操作不可撤销。技能池中的原始技能不受影响。",
      okText: "确认删除",
      cancelText: "取消",
      okButtonProps: { danger: !0 },
      onOk: async () => {
        V(!0);
        try {
          const { results: de } = await Ro(e, U), ye = Object.entries(de).filter(
            ([, T]) => T.success === !1
          ), q = U.length - ye.length;
          ye.length > 0 ? g.warning(
            `批量删除完成：成功 ${q} 个，失败 ${ye.length} 个`
          ) : g.success(`成功删除 ${U.length} 个技能`), ne(), await X();
        } catch (de) {
          g.error(de.message || "批量删除失败");
        } finally {
          V(!1);
        }
      }
    });
  }, we = async (U) => {
    ge(!0);
    try {
      U.enabled === !1 ? (await Wa(e, U.name), g.success(`已启用技能「${U.name}」`)) : (await Va(e, U.name), g.success(`已禁用技能「${U.name}」`)), await X();
    } catch (de) {
      g.error(de.message || "操作失败");
    } finally {
      ge(!1);
    }
  }, Ae = (U) => {
    y.confirm({
      title: `确认删除技能「${U.name}」？`,
      content: "删除后技能将从当前专家工作区移除，此操作不可撤销。技能池中的原始技能不受影响。",
      okText: "确认删除",
      cancelText: "取消",
      okButtonProps: { danger: !0 },
      onOk: async () => {
        ge(!0);
        try {
          await lr(e, U.name), g.success(`已删除技能「${U.name}」`), await X();
        } catch (de) {
          g.error(de.message || "删除失败");
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
        ae ? `已选择 ${M.size} / ${z.length} 个技能` : `共 ${z.length} 个技能`
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
              icon: I ? a.createElement(I) : void 0,
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
              icon: K ? a.createElement(K) : void 0,
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
              icon: j ? a.createElement(j) : void 0,
              disabled: M.size === 0 || te,
              loading: te,
              onClick: ie
            },
            `删除 (${M.size})`
          ),
          a.createElement(
            d,
            {
              size: "small",
              type: "primary",
              onClick: Se
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
              icon: A ? a.createElement(A) : void 0,
              onClick: Se,
              disabled: z.length === 0
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
    H ? a.createElement(
      "div",
      { style: { textAlign: "center", padding: 60 } },
      a.createElement(i, { size: "large" })
    ) : z.length === 0 ? a.createElement(c, {
      description: "当前智能体未加载任何技能"
    }) : a.createElement(
      m,
      { gutter: [12, 12] },
      ...z.map(
        (U) => a.createElement(
          u,
          { key: U.name, xs: 24, sm: 12, md: 8, lg: 6 },
          a.createElement(
            f,
            {
              hoverable: !0,
              size: "small",
              style: {
                cursor: ae ? "default" : "pointer",
                height: "100%",
                position: "relative",
                borderColor: ae && M.has(U.name) ? "#0072f5" : void 0,
                borderWidth: ae && M.has(U.name) ? 2 : 1
              },
              onClick: () => {
                ae ? se(U.name) : (ee(U), R(!0));
              },
              onMouseEnter: () => {
                ae || L(U.name);
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
                onClick: (de) => {
                  de.stopPropagation(), se(U.name);
                }
              },
              a.createElement(h, {
                checked: M.has(U.name)
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
              U.emoji ? a.createElement(
                "span",
                { style: { fontSize: 18 } },
                U.emoji
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
                U.name
              ),
              U.enabled === !1 ? a.createElement(
                w,
                { color: "default", style: { fontSize: 10 } },
                "已禁用"
              ) : a.createElement(
                w,
                { color: "green", style: { fontSize: 10 } },
                "已启用"
              )
            ),
            U.description ? a.createElement(
              x,
              {
                type: "secondary",
                style: { fontSize: 11, margin: 0, lineHeight: 1.4 },
                ellipsis: { rows: 2 }
              },
              U.description
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
              U.version_text ? a.createElement(
                w,
                { style: { fontSize: 10 } },
                `v${U.version_text}`
              ) : null,
              ...(U.tags || []).slice(0, 3).map(
                (de, ye) => a.createElement(
                  w,
                  { key: ye, color: "blue", style: { fontSize: 10 } },
                  de
                )
              )
            ),
            // Hover action footer (not in batch mode)
            !ae && ue === U.name ? a.createElement(
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
                  icon: U.enabled === !1 ? I ? a.createElement(I) : void 0 : K ? a.createElement(K) : void 0,
                  disabled: oe,
                  onClick: (de) => {
                    de.stopPropagation(), we(U);
                  }
                },
                U.enabled === !1 ? "启用" : "禁用"
              ),
              a.createElement(
                d,
                {
                  size: "small",
                  danger: !0,
                  icon: j ? a.createElement(j) : void 0,
                  disabled: oe,
                  onClick: (de) => {
                    de.stopPropagation(), Ae(U);
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
    $ ? a.createElement(
      b,
      {
        title: a.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 8 } },
          a.createElement(
            "span",
            { style: { fontSize: 18 } },
            $.emoji || "⚡"
          ),
          a.createElement("span", null, $.name)
        ),
        open: D,
        onClose: () => R(!1),
        width: 520,
        extra: a.createElement(
          d,
          {
            type: "primary",
            size: "small",
            icon: W ? a.createElement(W) : void 0,
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
          $.name
        ),
        a.createElement(
          v.Item,
          { label: "描述" },
          $.description || "-"
        ),
        $.version_text ? a.createElement(
          v.Item,
          { label: "版本" },
          $.version_text
        ) : null,
        a.createElement(
          v.Item,
          { label: "来源" },
          $.source || "-"
        ),
        a.createElement(
          v.Item,
          { label: "状态" },
          $.enabled === !1 ? "已禁用" : "已启用"
        ),
        $.installed_from ? a.createElement(
          v.Item,
          { label: "安装来源" },
          $.installed_from
        ) : null
      ),
      // Tags
      $.tags && $.tags.length > 0 ? a.createElement(
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
          ...$.tags.map(
            (U, de) => a.createElement(w, { key: de, color: "blue" }, U)
          )
        )
      ) : null,
      // Skill content preview
      $.content ? a.createElement(
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
          $.content.slice(0, 2e3) + ($.content.length > 2e3 ? `

... (内容已截断)` : "")
        )
      ) : null
    ) : null
  );
}
function Ui({
  poolSkills: e,
  workspaceSkills: t,
  agents: n,
  loading: r,
  onReload: a,
  onSkillInstalled: l,
  agentId: o,
  agentName: s
}) {
  const i = k().React, { useState: c, useMemo: d, useCallback: m, useEffect: u, useRef: f } = i, {
    Spin: w,
    Empty: h,
    Input: y,
    Button: p,
    Row: b,
    Col: v,
    Card: g,
    Tag: S,
    Typography: O,
    Drawer: W,
    Descriptions: A,
    List: I,
    Modal: K,
    message: j
  } = k().antd, {
    ReloadOutlined: B,
    SearchOutlined: C,
    DownloadOutlined: x,
    ThunderboltOutlined: z,
    DeleteOutlined: _,
    PlusOutlined: H
  } = k().antdIcons || {}, { Text: F, Paragraph: D } = O, [R, $] = c(""), [ee, ae] = c(!1), [N, M] = c(null), [le, te] = c([]), [V, ue] = c(!1), [L, oe] = c(24), [ge, X] = c(null), [se, ne] = c(!1), xe = f(0), Se = f(null), Be = d(
    () => {
      var Y;
      return new Set(
        ((Y = t.find((pe) => pe.agent_id === o)) == null ? void 0 : Y.skill_names) || []
      );
    },
    [t, o]
  ), ve = d(() => {
    if (!R.trim()) return e;
    const Y = R.toLowerCase();
    return e.filter(
      (pe) => {
        var he, Ie;
        return pe.name.toLowerCase().includes(Y) || ((he = pe.description) == null ? void 0 : he.toLowerCase().includes(Y)) || ((Ie = pe.tags) == null ? void 0 : Ie.some((P) => P.toLowerCase().includes(Y)));
      }
    );
  }, [e, R]), ie = d(
    () => ve.slice(0, L),
    [ve, L]
  );
  u(() => {
    if (ie.length >= ve.length) return;
    const Y = Se.current;
    if (!Y) return;
    const pe = () => {
      oe(
        (Ie) => Math.min(Ie + 24, ve.length)
      );
    };
    if (typeof IntersectionObserver < "u") {
      const Ie = new IntersectionObserver(
        (P) => {
          P.some((Ee) => Ee.isIntersecting) && pe();
        },
        { rootMargin: "240px 0px" }
      );
      return Ie.observe(Y), () => Ie.disconnect();
    }
    const he = () => {
      Y.getBoundingClientRect().top <= window.innerHeight + 240 && pe();
    };
    return window.addEventListener("scroll", he, { passive: !0 }), he(), () => window.removeEventListener("scroll", he);
  }, [ve.length, ie.length]);
  const we = m((Y) => {
    $(Y), oe(24);
  }, []), Ae = m(() => {
    const Y = xe.current;
    requestAnimationFrame(() => {
      window.scrollTo({ top: Y, behavior: "auto" }), document.scrollingElement && (document.scrollingElement.scrollTop = Y);
    });
  }, []), U = m(async () => {
    var Y;
    xe.current = ((Y = document.scrollingElement) == null ? void 0 : Y.scrollTop) ?? window.scrollY ?? 0;
    try {
      await a();
    } finally {
      Ae();
    }
  }, [a, Ae]), de = m(
    (Y) => {
      const pe = [];
      for (const he of t)
        if (he.skill_names.includes(Y)) {
          const Ie = n.find((P) => P.id === he.agent_id);
          pe.push((Ie == null ? void 0 : Ie.name) || he.agent_name || he.agent_id);
        }
      return pe;
    },
    [t, n]
  ), ye = m(
    async (Y) => {
      if (M(Y), te(de(Y.name)), ae(!0), !Y.content) {
        ue(!0);
        try {
          const pe = await ko(Y.name);
          M({ ...Y, content: pe });
        } catch {
        } finally {
          ue(!1);
        }
      }
    },
    [de]
  );
  u(() => {
    N && te(de(N.name));
  }, [N, de, t]);
  const q = async (Y) => {
    ne(!0);
    try {
      await ar(o, Y.name), j.success(
        `已将技能「${Y.name}」加载到当前专家「${s}」`
      ), l(Y);
    } catch (pe) {
      j.error(pe.message || "加载技能失败");
    } finally {
      ne(!1);
    }
  }, T = (Y) => {
    if (Y.protected) {
      j.warning("内置技能不可删除");
      return;
    }
    K.confirm({
      title: `确认从技能池删除「${Y.name}」？`,
      content: "删除后所有已安装此技能的专家将不受影响，但技能池中将不再包含此技能。此操作不可撤销。",
      okText: "确认删除",
      cancelText: "取消",
      okButtonProps: { danger: !0 },
      onOk: async () => {
        ne(!0);
        try {
          await Mo(Y.name), j.success(`已从技能池删除「${Y.name}」`), await U();
        } catch (pe) {
          j.error(pe.message || "删除失败");
        } finally {
          ne(!1);
        }
      }
    });
  }, me = (Y) => {
    window.history.pushState({}, "", Y), window.dispatchEvent(new PopStateEvent("popstate"));
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
        value: R,
        onChange: (Y) => we(Y.target.value),
        allowClear: !0,
        style: { maxWidth: 400 }
      }),
      i.createElement(
        "div",
        { style: { display: "flex", gap: 8 } },
        i.createElement(
          p,
          {
            icon: B ? i.createElement(B) : void 0,
            onClick: U,
            loading: r,
            size: "small"
          },
          "刷新"
        ),
        i.createElement(
          p,
          {
            type: "primary",
            icon: x ? i.createElement(x) : void 0,
            onClick: () => me("/skill-pool"),
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
      description: R ? "未找到匹配的技能" : "技能池为空"
    }) : i.createElement(
      i.Fragment,
      null,
      i.createElement(
        b,
        { gutter: [12, 12] },
        ...ie.map(
          (Y) => i.createElement(
            v,
            { key: Y.name, xs: 24, sm: 12, md: 8, lg: 6 },
            i.createElement(
              g,
              {
                hoverable: !0,
                size: "small",
                style: { cursor: "pointer", height: "100%" },
                onClick: () => ye(Y),
                onMouseEnter: () => X(Y.name),
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
                Y.emoji ? i.createElement(
                  "span",
                  { style: { fontSize: 18 } },
                  Y.emoji
                ) : i.createElement(
                  "span",
                  { style: { fontSize: 18 } },
                  "⚡"
                ),
                i.createElement(
                  F,
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
                Y.protected ? i.createElement(
                  S,
                  { color: "gold", style: { fontSize: 10 } },
                  "内置"
                ) : null
              ),
              Y.description ? i.createElement(
                D,
                {
                  type: "secondary",
                  style: { fontSize: 11, margin: 0, lineHeight: 1.4 },
                  ellipsis: { rows: 2 }
                },
                Y.description
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
                Y.version_text ? i.createElement(
                  S,
                  { style: { fontSize: 10 } },
                  `v${Y.version_text}`
                ) : null,
                ...(Y.tags || []).slice(0, 3).map(
                  (pe, he) => i.createElement(
                    S,
                    { key: he, color: "cyan", style: { fontSize: 10 } },
                    pe
                  )
                )
              ),
              // Hover action footer
              ge === Y.name ? i.createElement(
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
                  p,
                  {
                    size: "small",
                    type: "primary",
                    icon: H ? i.createElement(H) : void 0,
                    disabled: se || Be.has(Y.name),
                    onClick: (pe) => {
                      pe.stopPropagation(), q(Y);
                    }
                  },
                  Be.has(Y.name) ? "已加载" : "加载到当前Agent"
                ),
                i.createElement(
                  p,
                  {
                    size: "small",
                    danger: !0,
                    icon: _ ? i.createElement(_) : void 0,
                    disabled: se || Y.protected,
                    onClick: (pe) => {
                      pe.stopPropagation(), T(Y);
                    }
                  },
                  "删除"
                )
              ) : null
            )
          )
        ),
        // Infinite-scroll sentinel
        ie.length < ve.length ? i.createElement(
          "div",
          {
            ref: Se,
            style: {
              minHeight: 40,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginTop: 16
            }
          },
          i.createElement(
            F,
            { type: "secondary", style: { fontSize: 12 } },
            `继续下滑自动加载 · 还剩 ${ve.length - ie.length} 个`
          )
        ) : null
      )
    ),
    // Skill detail drawer
    N ? i.createElement(
      W,
      {
        title: i.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 8 } },
          i.createElement(
            "span",
            { style: { fontSize: 18 } },
            N.emoji || "⚡"
          ),
          i.createElement("span", null, N.name)
        ),
        open: ee,
        onClose: () => ae(!1),
        width: 520,
        extra: i.createElement(
          p,
          {
            type: "primary",
            size: "small",
            icon: z ? i.createElement(z) : void 0,
            onClick: () => me("/skills")
          },
          "管理技能"
        )
      },
      i.createElement(
        A,
        { column: 1, bordered: !0, size: "small" },
        i.createElement(
          A.Item,
          { label: "技能名称" },
          N.name
        ),
        i.createElement(
          A.Item,
          { label: "描述" },
          N.description || "-"
        ),
        N.version_text ? i.createElement(
          A.Item,
          { label: "版本" },
          N.version_text
        ) : null,
        i.createElement(
          A.Item,
          { label: "来源" },
          N.source || "-"
        ),
        i.createElement(
          A.Item,
          { label: "受保护" },
          N.protected ? "是（内置）" : "否"
        ),
        N.sync_status ? i.createElement(
          A.Item,
          { label: "同步状态" },
          N.sync_status
        ) : null,
        N.installed_from ? i.createElement(
          A.Item,
          { label: "安装来源" },
          N.installed_from
        ) : null
      ),
      // Tags
      N.tags && N.tags.length > 0 ? i.createElement(
        "div",
        { style: { marginTop: 16 } },
        i.createElement(
          F,
          {
            strong: !0,
            style: { display: "block", marginBottom: 8 }
          },
          "标签"
        ),
        i.createElement(
          "div",
          { style: { display: "flex", flexWrap: "wrap", gap: 4 } },
          ...N.tags.map(
            (Y, pe) => i.createElement(S, { key: pe, color: "cyan" }, Y)
          )
        )
      ) : null,
      // Installed agents
      i.createElement(
        "div",
        { style: { marginTop: 16 } },
        i.createElement(
          F,
          { strong: !0, style: { display: "block", marginBottom: 8 } },
          `已安装此技能的专家 (${le.length})`
        ),
        le.length > 0 ? i.createElement(I, {
          size: "small",
          dataSource: le,
          renderItem: (Y) => i.createElement(
            I.Item,
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
              i.createElement(et, { name: Y, size: 20 }),
              i.createElement(
                F,
                { style: { fontSize: 13 } },
                Y
              )
            )
          )
        }) : i.createElement(
          F,
          { type: "secondary", style: { fontSize: 12 } },
          "暂无专家安装此技能"
        )
      ),
      // Skill content preview (lazy-loaded)
      V ? i.createElement(
        "div",
        { style: { marginTop: 16, textAlign: "center" } },
        i.createElement(w, { size: "small" })
      ) : N.content ? i.createElement(
        "div",
        { style: { marginTop: 16 } },
        i.createElement(
          F,
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
          N.content.slice(0, 2e3) + (N.content.length > 2e3 ? `

... (内容已截断)` : "")
        )
      ) : null
    ) : null
  );
}
function ji({
  embedded: e = !1
} = {}) {
  const t = k().React, { useState: n, useEffect: r, useCallback: a, useMemo: l } = t, { Tabs: o, message: s } = k().antd, { ThunderboltOutlined: i, AppstoreOutlined: c } = k().antdIcons || {}, m = k().useSelectedAgent, u = m ? m() : null, f = (u == null ? void 0 : u.id) || "default";
  r(() => {
    tr();
  }, [f]);
  const [w, h] = n([]), [y, p] = n([]), [b, v] = n([]), [g, S] = n(!0), [O, W] = n("agent-skills"), [A, I] = n(0), K = a(async () => {
    S(!0);
    try {
      const [_, H, F] = await Promise.all([
        Sn(!0),
        vn(),
        Co()
      ]);
      p(_), h(H), v(F);
    } catch (_) {
      s.error(_.message || "加载技能列表失败"), p([]);
    } finally {
      S(!1);
    }
  }, []);
  r(() => {
    K();
  }, [K]);
  const j = l(() => {
    const _ = w.find((H) => H.id === f);
    return (_ == null ? void 0 : _.name) || f;
  }, [w, f]), B = a(
    (_) => {
      v(
        (H) => H.some((F) => F.agent_id === f) ? H.map((F) => F.agent_id !== f || F.skill_names.includes(_.name) ? F : {
          ...F,
          skill_names: [...F.skill_names, _.name]
        }) : [
          ...H,
          {
            agent_id: f,
            agent_name: j,
            skill_names: [_.name]
          }
        ]
      ), I((H) => H + 1);
    },
    [f, j]
  ), C = (_) => {
    window.history.pushState({}, "", _), window.dispatchEvent(new PopStateEvent("popstate"));
  }, x = [
    {
      key: "agent-skills",
      label: t.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        i ? t.createElement(i, { style: { fontSize: 14 } }) : null,
        "当前专家"
      ),
      children: t.createElement(Bi, {
        agentId: f,
        agentName: j,
        refreshKey: A,
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
      children: t.createElement(Ui, {
        poolSkills: y,
        workspaceSkills: b,
        agents: w,
        loading: g,
        onReload: K,
        onSkillInstalled: B,
        agentId: f,
        agentName: j
      })
    }
  ], z = t.createElement(o, {
    items: x,
    activeKey: O,
    onChange: (_) => W(_)
  });
  return e ? z : t.createElement(
    "div",
    { style: { padding: 24 } },
    t.createElement(bn, {
      title: "技能",
      subtitle: `技能池共 ${y.length} 个技能 · 当前智能体：${j}`
    }),
    z
  );
}
const Fn = {
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
async function Ni() {
  return ce("/ugsci/engines/list");
}
async function Di(e) {
  return ce("/ugsci/engines/", {
    method: "POST",
    body: JSON.stringify(e)
  });
}
async function Fi(e, t) {
  return ce(`/ugsci/engines/${encodeURIComponent(e)}`, {
    method: "PUT",
    body: JSON.stringify(t)
  });
}
async function Gi(e) {
  return ce(
    `/ugsci/engines/${encodeURIComponent(e)}`,
    { method: "DELETE" }
  );
}
async function Hi() {
  return ce("/ugsci/engines/detect/refresh", {
    method: "POST"
  });
}
function Wi({
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
        Fn[e.category] || e.category
      ) : null,
      e.version ? n.createElement(
        a,
        { color: "blue", style: { fontSize: 11 } },
        `v${e.version}`
      ) : null,
      ...(e.modules || []).map(
        (m) => n.createElement(
          a,
          { key: m, color: "cyan", style: { fontSize: 10 } },
          m
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
    Drawer: m,
    Descriptions: u,
    Tag: f,
    Typography: w,
    Modal: h,
    Input: y,
    Select: p,
    Popconfirm: b,
    Space: v
  } = k().antd, {
    ReloadOutlined: g,
    SearchOutlined: S,
    PlusOutlined: O,
    EditOutlined: W,
    DeleteOutlined: A,
    CopyOutlined: I,
    ExperimentOutlined: K
  } = k().antdIcons || {}, { Text: j, Paragraph: B } = w, [C, x] = t([]), [z, _] = t(!0), [H, F] = t(""), [D, R] = t(!1), [$, ee] = t(null), [ae, N] = t(!1), [M, le] = t(null), [te, V] = t({}), [ue, L] = t(!1), oe = r(async () => {
    _(!0);
    try {
      const ie = await Ni();
      x(ie.engines || []);
    } catch (ie) {
      i.error(ie.message || "加载引擎列表失败"), x([]);
    } finally {
      _(!1);
    }
  }, []);
  n(() => {
    oe();
  }, [oe]);
  const ge = a(() => {
    if (!H.trim()) return C;
    const ie = H.toLowerCase();
    return C.filter(
      (we) => {
        var Ae;
        return we.name.toLowerCase().includes(ie) || we.vendor.toLowerCase().includes(ie) || we.category.toLowerCase().includes(ie) || ((Ae = we.description) == null ? void 0 : Ae.toLowerCase().includes(ie));
      }
    );
  }, [C, H]);
  C.filter((ie) => ie.status === "detected").length;
  const X = r((ie) => {
    navigator.clipboard.writeText(ie).then(() => i.success("路径已复制")).catch(() => i.error("复制失败"));
  }, []), se = r(() => {
    le(null), V({
      name: "",
      vendor: "",
      version: "",
      executable_path: "",
      category: "",
      description: "",
      invocation_hint: ""
    }), N(!0);
  }, []), ne = r((ie) => {
    le(ie), V({ ...ie }), N(!0), R(!1);
  }, []), xe = r(async () => {
    var ie;
    if (!((ie = te.name) != null && ie.trim())) {
      i.warning("请输入引擎名称");
      return;
    }
    L(!0);
    try {
      M ? (await Fi(M.id, te), i.success("引擎已更新")) : (await Di(te), i.success("引擎已添加")), N(!1), oe();
    } catch (we) {
      i.error(we.message || "保存失败");
    } finally {
      L(!1);
    }
  }, [te, M, oe]), Se = r(
    async (ie) => {
      try {
        await Gi(ie), i.success("引擎已删除"), R(!1), oe();
      } catch (we) {
        i.error(we.message || "删除失败");
      }
    },
    [oe]
  ), Be = r(async () => {
    _(!0);
    try {
      const ie = await Hi();
      x(ie.engines || []), i.success("自动检测完成");
    } catch (ie) {
      i.error(ie.message || "检测失败");
    } finally {
      _(!1);
    }
  }, []), ve = r(
    (ie, we, Ae) => {
      const U = te[we] || "";
      return e.createElement(
        "div",
        { style: { marginBottom: 12 } },
        e.createElement(
          j,
          { style: { fontSize: 13, display: "block", marginBottom: 4 } },
          ie
        ),
        Ae != null && Ae.select ? e.createElement(p, {
          value: U || void 0,
          onChange: (de) => V((ye) => ({ ...ye, [we]: de })),
          style: { width: "100%" },
          options: Ae.select.options,
          allowClear: !0,
          placeholder: `选择${ie}`
        }) : Ae != null && Ae.textarea ? e.createElement(y.TextArea, {
          value: U,
          onChange: (de) => V((ye) => ({ ...ye, [we]: de.target.value })),
          rows: 3,
          placeholder: `输入${ie}`
        }) : e.createElement(y, {
          value: U,
          onChange: (de) => V((ye) => ({ ...ye, [we]: de.target.value })),
          placeholder: `输入${ie}`
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
        value: H,
        onChange: (ie) => F(ie.target.value),
        allowClear: !0,
        style: { maxWidth: 280 }
      }),
      e.createElement(
        s,
        {
          icon: g ? e.createElement(g) : void 0,
          onClick: Be,
          loading: z
        },
        "自动检测"
      ),
      e.createElement(
        s,
        {
          type: "primary",
          icon: O ? e.createElement(O) : void 0,
          onClick: se,
          style: We
        },
        "添加引擎"
      )
    ),
    // Content
    z ? e.createElement(
      "div",
      { style: { textAlign: "center", padding: 60 } },
      e.createElement(l, {
        size: "large",
        tip: "正在加载引擎..."
      })
    ) : ge.length === 0 ? e.createElement(o, {
      description: H ? "无匹配引擎" : "暂无引擎，点击「添加引擎」开始"
    }) : e.createElement(
      c,
      { gutter: [12, 12], align: "stretch" },
      ...ge.map(
        (ie) => e.createElement(
          d,
          {
            key: ie.id,
            xs: 24,
            sm: 12,
            md: 8,
            lg: 6,
            style: { display: "flex" }
          },
          e.createElement(Wi, {
            engine: ie,
            onClick: () => {
              ee(ie), R(!0);
            }
          })
        )
      )
    ),
    // Detail drawer
    $ ? e.createElement(
      m,
      {
        title: e.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 8 } },
          e.createElement(
            "span",
            { style: { display: "flex", alignItems: "center" } },
            il.has($.id) ? e.createElement("img", {
              src: sl($.id),
              alt: $.name,
              style: { width: 20, height: 20, objectFit: "contain" }
            }) : e.createElement(
              "span",
              { style: { fontSize: 18 } },
              ol[$.category] || "📦"
            )
          ),
          e.createElement("span", null, $.name)
        ),
        open: D,
        onClose: () => R(!1),
        width: 520,
        extra: e.createElement(
          v,
          null,
          e.createElement(
            s,
            {
              size: "small",
              icon: W ? e.createElement(W) : void 0,
              onClick: () => ne($)
            },
            "编辑"
          ),
          $.is_default ? null : e.createElement(
            b,
            {
              title: "确认删除此引擎？",
              description: $.name,
              onConfirm: () => Se($.id),
              okText: "删除",
              cancelText: "取消",
              okButtonProps: { danger: !0 }
            },
            e.createElement(
              s,
              {
                size: "small",
                danger: !0,
                icon: A ? e.createElement(A) : void 0
              },
              "删除"
            )
          )
        )
      },
      e.createElement(
        u,
        { column: 1, bordered: !0, size: "small" },
        e.createElement(
          u.Item,
          { label: "引擎名称" },
          $.name
        ),
        e.createElement(
          u.Item,
          { label: "厂商" },
          $.vendor || "—"
        ),
        e.createElement(
          u.Item,
          { label: "分类" },
          $.category ? Fn[$.category] || $.category : "—"
        ),
        e.createElement(
          u.Item,
          { label: "状态" },
          e.createElement(
            f,
            {
              color: $.status === "detected" ? "success" : $.status === "not_found" ? "error" : "default"
            },
            $.status === "detected" ? "✅ 已检测" : $.status === "not_found" ? "❌ 路径无效" : "🔧 待配置"
          )
        ),
        e.createElement(
          u.Item,
          { label: "版本" },
          $.version || "—"
        ),
        $.executable_path ? e.createElement(
          u.Item,
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
              $.executable_path
            ),
            e.createElement(
              s,
              {
                size: "small",
                type: "text",
                icon: I ? e.createElement(I) : void 0,
                onClick: () => X($.executable_path)
              }
            )
          )
        ) : null,
        $.install_dir ? e.createElement(
          u.Item,
          { label: "安装目录" },
          e.createElement(
            "code",
            { style: { fontSize: 12, wordBreak: "break-all" } },
            $.install_dir
          )
        ) : null,
        // Display detected modules with paths
        $.modules && $.modules.length > 0 ? e.createElement(
          u.Item,
          { label: "已检测模块" },
          e.createElement(
            "div",
            { style: { display: "flex", flexDirection: "column", gap: 4 } },
            ...$.modules.map(
              (ie) => e.createElement(
                "div",
                {
                  key: ie,
                  style: { display: "flex", alignItems: "center", gap: 8 }
                },
                e.createElement(
                  f,
                  { color: "cyan", style: { fontSize: 11 } },
                  ie
                ),
                $.module_paths && $.module_paths[ie] ? e.createElement(
                  "code",
                  { style: { fontSize: 11, wordBreak: "break-all" } },
                  $.module_paths[ie]
                ) : null
              )
            )
          )
        ) : null,
        $.license_server ? e.createElement(
          u.Item,
          { label: "许可证服务器" },
          $.license_server
        ) : null,
        e.createElement(
          u.Item,
          { label: "描述" },
          $.description || "—"
        )
      ),
      // Invocation hint
      $.invocation_hint ? e.createElement(
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
          j,
          { strong: !0, style: { fontSize: 13 } },
          "💡 调用方式"
        ),
        e.createElement(
          "div",
          { style: { marginTop: 8, fontSize: 13, lineHeight: 1.6 } },
          $.invocation_hint
        )
      ) : null,
      // Type badge
      e.createElement(
        "div",
        { style: { marginTop: 12 } },
        $.is_default ? e.createElement(
          f,
          { color: "blue" },
          "默认引擎"
        ) : $.is_custom ? e.createElement(
          f,
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
        onCancel: () => N(!1),
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
            options: Object.entries(Fn).map(([ie, we]) => ({
              label: we,
              value: ie
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
async function Vi(e = !1) {
  const t = await ce(
    "/ugsci/domain-engines/list",
    e ? { bypassCache: !0 } : void 0
  );
  return (t == null ? void 0 : t.engines) || [];
}
function Ji(e = !1) {
  return ce(
    "/ugsci/domain-engines/neqsim/runtime",
    e ? { bypassCache: !0 } : void 0
  );
}
function Ki() {
  return ce("/ugsci/domain-engines/neqsim/install", {
    method: "POST"
  });
}
function Xi(e) {
  return ce(
    `/ugsci/domain-engines/neqsim/install/${encodeURIComponent(e)}`,
    { bypassCache: !0 }
  );
}
async function Yi(e, t = !1) {
  const n = await ce("/tools", {
    headers: { "X-Agent-Id": e },
    ...t ? { bypassCache: !0 } : {}
  }) || [];
  return new Map(n.map((r) => [r.name, r]));
}
async function Qi(e, t = !1) {
  const n = /* @__PURE__ */ new Map(), r = {
    headers: { "X-Agent-Id": e },
    ...t ? { bypassCache: !0 } : {}
  };
  let a;
  try {
    a = await ce(
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
      const s = await ce(
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
function Zi(e, t = null, n = /* @__PURE__ */ new Map()) {
  const r = e.engine, a = e.dependency_status;
  let l, o, s;
  if (r.provider.kind === "driver")
    a.overall === "unavailable" ? l = "needs_install" : l = ra(t), o = (t == null ? void 0 : t.toolCount) ?? 0, s = (t == null ? void 0 : t.key) ?? r.provider.id;
  else if (r.source === "builtin") {
    const i = na(a), c = r.operations.flatMap((u) => u.tool_names), d = c.filter((u) => n.has(u)), m = d.filter(
      (u) => {
        var f;
        return (f = n.get(u)) == null ? void 0 : f.enabled;
      }
    );
    i !== "available" ? l = i : d.length !== c.length ? l = "error" : m.length === 0 ? l = "unconfigured" : l = "available", o = m.length, s = null;
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
function es(e) {
  const t = /* @__PURE__ */ new Map();
  for (const n of e) {
    const r = n.definition.domain;
    t.has(r) || t.set(r, []), t.get(r).push(n);
  }
  return t;
}
const Gn = {
  available: "可用",
  unavailable: "不可用",
  unknown: "未知",
  needs_install: "待安装",
  unconfigured: "未配置",
  error: "错误"
}, Hn = {
  available: "success",
  unavailable: "error",
  unknown: "default",
  needs_install: "warning",
  unconfigured: "warning",
  error: "error"
}, ts = {
  geology_well_logging: "📡",
  production_engineering: "⚙️",
  fluid_thermodynamics: "🧪",
  scientific_computing: "🧮",
  data_modeling: "📊"
}, ns = {
  builtin: "内置",
  mcp: "MCP",
  library: "计算库"
}, rs = {
  deterministic: "确定性",
  stochastic: "随机/概率",
  external: "外部 Provider",
  visualization: "可视化"
}, as = {
  deterministic: "green",
  stochastic: "purple",
  external: "blue",
  visualization: "cyan"
};
function ls({
  view: e,
  onClick: t
}) {
  const n = k().React, { Card: r, Tag: a, Typography: l } = k().antd, { Text: o } = l, s = e.definition, i = ts[s.domain] || "📦", c = e.effectiveStatus, d = s.operations.length, m = e.discoveredToolCount;
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
            s.provider.kind === "driver" ? "内置 · MCP" : ns[s.source] || s.source
          )
        )
      ),
      n.createElement(
        a,
        { color: Hn[c] || "default", style: { fontSize: 11 } },
        Gn[c] || c
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
          color: as[s.execution_class] || "default",
          style: { fontSize: 11 }
        },
        rs[s.execution_class] || s.execution_class
      ),
      m > 0 ? n.createElement(
        a,
        { color: "blue", style: { fontSize: 11 } },
        `${m} 工具`
      ) : null,
      ...(s.tags || []).map(
        (u) => n.createElement(
          a,
          { key: u, color: "cyan", style: { fontSize: 10 } },
          u
        )
      )
    )
  );
}
function os({
  view: e,
  open: t,
  onClose: n,
  onNavigateToMcp: r,
  onNavigateToTools: a,
  onNavigateToSkills: l,
  onInstallNeqsim: o,
  neqsimInstallState: s
}) {
  const i = k().React, { Drawer: c, Descriptions: d, Tag: m, Typography: u, Button: f, Space: w, Divider: h } = k().antd, { Text: y, Paragraph: p } = u;
  if (!e) return null;
  const b = e.definition, v = e.dependencyStatus;
  return i.createElement(
    c,
    {
      title: i.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 8 } },
        i.createElement("span", null, b.name),
        i.createElement(
          m,
          {
            color: Hn[e.effectiveStatus] || "default",
            style: { fontSize: 11 }
          },
          Gn[e.effectiveStatus] || e.effectiveStatus
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
        b.domain
      ),
      i.createElement(
        d.Item,
        { label: "来源" },
        b.provider.kind === "driver" ? "内置能力 · MCP Driver" : b.source === "builtin" ? "内置工具" : b.source === "mcp" ? "MCP 服务" : "科学计算库 / 技能"
      ),
      i.createElement(
        d.Item,
        { label: "实现" },
        `${b.provider.kind}:${b.provider.id}`
      ),
      i.createElement(
        d.Item,
        { label: "计算类别" },
        b.execution_class === "deterministic" ? "确定性计算" : b.execution_class === "stochastic" ? "随机/概率计算" : b.execution_class === "external" ? "外部 Provider" : "可视化"
      ),
      i.createElement(
        d.Item,
        { label: "内核版本" },
        b.engine_version
      ),
      i.createElement(
        d.Item,
        { label: "描述" },
        b.description
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
    ...b.operations.map(
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
              m,
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
              m,
              {
                color: Hn[g.status] || "default",
                style: { fontSize: 11 }
              },
              Gn[g.status] || g.status
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
      p,
      { type: "secondary", style: { fontSize: 12 } },
      "无外部依赖"
    ),
    // Actions
    i.createElement(h, null),
    i.createElement(y, { strong: !0 }, "问题处理"),
    i.createElement(
      "div",
      { style: { marginTop: 8, display: "flex", gap: 8, flexWrap: "wrap" } },
      b.id === "neqsim" && e.effectiveStatus === "needs_install" ? i.createElement(
        f,
        {
          size: "small",
          type: "primary",
          loading: (s == null ? void 0 : s.status) === "queued" || (s == null ? void 0 : s.status) === "running",
          onClick: o
        },
        (s == null ? void 0 : s.status) === "running" ? `${s.message} (${s.progress}%)` : "安装 NeqSim 运行环境"
      ) : null,
      b.provider.kind === "driver" ? i.createElement(
        f,
        { size: "small", onClick: r },
        "查看内置 MCP Driver"
      ) : b.source === "library" ? i.createElement(
        f,
        { size: "small", onClick: l },
        "查看相关技能"
      ) : i.createElement(
        f,
        { size: "small", onClick: () => a("builtin") },
        "查看内置工具"
      )
    ),
    b.id === "neqsim" && (s == null ? void 0 : s.status) === "failed" ? i.createElement(
      p,
      { type: "danger", style: { marginTop: 8, fontSize: 12 } },
      s.error || "安装失败"
    ) : null,
    b.id === "neqsim" && (s != null && s.warning) ? i.createElement(
      p,
      { type: "warning", style: { marginTop: 8, fontSize: 12 } },
      s.warning
    ) : null
  );
}
const is = {
  geology_well_logging: "测井地质",
  production_engineering: "采油工程",
  fluid_thermodynamics: "流体热力学",
  scientific_computing: "科学计算",
  data_modeling: "数据建模"
};
function ss(e) {
  return e instanceof Error ? /Install task not found|HTTP 404/i.test(e.message) : !1;
}
function cs({
  onNavigateToMcp: e,
  onNavigateToTools: t,
  onNavigateToSkills: n
} = {}) {
  var oe, ge;
  const r = k().React, { useState: a, useEffect: l, useCallback: o, useMemo: s, useRef: i } = r, {
    Spin: c,
    Empty: d,
    Button: m,
    message: u,
    Row: f,
    Col: w,
    Input: h,
    Drawer: y,
    Typography: p
  } = k().antd, { ReloadOutlined: b, SearchOutlined: v } = k().antdIcons || {}, { Text: g } = p, S = (ge = (oe = k()).useSelectedAgent) == null ? void 0 : ge.call(oe), O = (S == null ? void 0 : S.id) || "default", [W, A] = a([]), [I, K] = a(!0), [j, B] = a(""), [C, x] = a(!1), [z, _] = a(null), [H, F] = a(null), D = i(O);
  D.current = O;
  const R = i(z);
  R.current = z;
  const $ = i(0);
  l(() => () => {
    $.current += 1;
  }, []);
  const ee = o(
    async (X = !1, se = !1) => {
      var Be, ve;
      se || K(!0);
      const ne = se && typeof window < "u" ? {
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
        const ie = () => {
          var we;
          window.scrollTo(ne.x, ne.y), (we = ne.drawerBody) != null && we.isConnected && (ne.drawerBody.scrollTop = ne.drawerTop);
        };
        typeof window.requestAnimationFrame == "function" ? window.requestAnimationFrame(ie) : ie();
      }, Se = D.current;
      try {
        const [ie, we, Ae] = await Promise.all([
          Vi(X),
          Qi(Se, X),
          Yi(Se, X)
        ]);
        if (Se !== D.current) return;
        const U = [];
        for (const ye of ie)
          try {
            let q = null;
            if (ye.engine.provider.kind === "driver") {
              const T = ye.engine.provider.id;
              q = we.get(T) || null;
            }
            U.push(Zi(ye, q, Ae));
          } catch {
          }
        A(U);
        const de = (ve = R.current) == null ? void 0 : ve.definition.id;
        if (de) {
          const ye = U.find(
            (q) => q.definition.id === de
          );
          ye && (R.current = ye, _(ye));
        }
        xe();
      } catch (ie) {
        const we = ie instanceof Error ? ie.message : "加载领域引擎失败";
        u.error(we), se || A([]);
      } finally {
        se || K(!1);
      }
    },
    []
  );
  l(() => {
    ee();
  }, [O, ee]);
  const ae = s(() => {
    if (!j.trim()) return W;
    const X = j.toLowerCase();
    return W.filter(
      (se) => se.definition.name.toLowerCase().includes(X) || se.definition.domain.toLowerCase().includes(X) || se.definition.description.toLowerCase().includes(X) || se.definition.tags.some((ne) => ne.toLowerCase().includes(X))
    );
  }, [W, j]), N = s(
    () => es(ae),
    [ae]
  ), M = o(() => {
    ee(!0);
  }, [ee]), le = o((X) => {
    R.current = X, _(X), x(!0);
  }, []), te = o(() => {
    x(!1), e == null || e();
  }, [e]), V = o(
    (X) => {
      x(!1), t == null || t(X);
    },
    [t]
  ), ue = o(() => {
    x(!1), n == null || n();
  }, [n]), L = o(async () => {
    const X = ++$.current, se = () => X === $.current;
    try {
      let ne = await Ki();
      if (!se()) return;
      for (F(ne); ne.status === "queued" || ne.status === "running"; ) {
        if (await new Promise((xe) => setTimeout(xe, 1e3)), !se()) return;
        try {
          ne = await Xi(ne.id);
        } catch (xe) {
          if (!ss(xe)) throw xe;
          const Se = await Ji(!0);
          if (!se()) return;
          Se.ready ? ne = {
            ...ne,
            status: "completed",
            progress: 100,
            message: "后端重启后已恢复 NeqSim 运行环境状态",
            error: "",
            runtime: Se,
            recovered: !0
          } : ne = {
            ...ne,
            status: "failed",
            message: "安装进程因后端重启中断",
            error: "后端重启后未发现完整的 NeqSim 运行环境，请重新安装",
            runtime: Se,
            recovered: !0
          };
        }
        if (!se()) return;
        F(ne);
      }
      if (!se()) return;
      ne.status === "completed" ? (ne.warning ? u.warning(ne.warning) : u.success("NeqSim 运行环境已安装并启用"), await ee(!0, !0)) : u.error(ne.error || "NeqSim 安装失败");
    } catch (ne) {
      if (!se()) return;
      u.error(ne instanceof Error ? ne.message : "NeqSim 安装失败");
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
        value: j,
        onChange: (X) => B(X.target.value),
        allowClear: !0,
        style: { maxWidth: 280 }
      }),
      r.createElement(
        m,
        {
          icon: b ? r.createElement(b) : void 0,
          onClick: M,
          loading: I
        },
        "刷新"
      )
    ),
    // Content
    I ? r.createElement(
      "div",
      { style: { textAlign: "center", padding: 60 } },
      r.createElement(c, {
        size: "large",
        tip: "正在加载领域引擎..."
      })
    ) : ae.length === 0 ? r.createElement(d, {
      description: j ? "无匹配引擎" : "暂无领域引擎"
    }) : r.createElement(
      "div",
      null,
      ...Array.from(N.entries()).map(
        ([X, se]) => r.createElement(
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
            is[X] || X
          ),
          r.createElement(
            f,
            { gutter: [12, 12], align: "stretch" },
            ...se.map(
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
                r.createElement(ls, {
                  view: ne,
                  onClick: () => le(ne)
                })
              )
            )
          )
        )
      )
    ),
    // Detail drawer
    r.createElement(os, {
      view: z,
      open: C,
      onClose: () => x(!1),
      onNavigateToMcp: te,
      onNavigateToTools: V,
      onNavigateToSkills: ue,
      onInstallNeqsim: L,
      neqsimInstallState: H
    })
  );
}
const ds = ji, cl = /* @__PURE__ */ new Set(["tools", "engines", "skills"]);
function us(e) {
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
function Wn({ page: e }) {
  const t = k().React, { useEffect: n, useState: r } = t, { Alert: a, Spin: l } = k().antd, [o, s] = r(null), [i, c] = r("");
  if (n(() => {
    let m = !0;
    const u = k().loadBuiltinPage;
    return s(null), u ? (c(""), u(e).then((f) => {
      m && s(() => f);
    }).catch((f) => {
      m && c(
        f instanceof Error ? f.message : "加载原生管理页面失败"
      );
    }), () => {
      m = !1;
    }) : (c("当前 QwenPaw 版本不支持原生页面嵌入"), () => {
      m = !1;
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
function ms({
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
        children: n.createElement(Wn, { page: "mcp" })
      },
      {
        key: "builtin",
        label: "平台内置",
        children: n.createElement(Wn, { page: "tools" })
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
          cs,
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
        children: r.createElement(Wn, { page: "acp" })
      }
    ]
  });
}
function dl({
  initialTab: e = "engines"
} = {}) {
  var p, b;
  const t = k().React, { useEffect: n, useState: r } = t, { Tabs: a, Tag: l } = k().antd, { RocketOutlined: o, ToolOutlined: s, ThunderboltOutlined: i } = k().antdIcons || {}, c = (b = (p = k()).useSelectedAgent) == null ? void 0 : b.call(p), d = (c == null ? void 0 : c.id) || "default", [m, u] = r(
    () => us(e)
  ), [f, w] = r("mcp");
  n(() => {
    try {
      const v = new URLSearchParams(window.location.search).get("tab");
      v && !cl.has(v) && aa(m);
    } catch {
    }
  }, [m]);
  const h = (v) => {
    u(v), aa(v);
  }, y = (v, g) => t.createElement(
    "span",
    { style: { display: "inline-flex", alignItems: "center", gap: 6 } },
    g ? t.createElement(g, { style: { fontSize: 14 } }) : null,
    v
  );
  return t.createElement(
    "div",
    { style: { padding: 24 } },
    t.createElement(bn, {
      title: "工具·技能",
      subtitle: "管理当前专家可调用的引擎、工具、运行服务与专业技能",
      extra: t.createElement(
        l,
        { color: "blue" },
        `当前专家：${d}`
      )
    }),
    t.createElement(a, {
      activeKey: m,
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
          children: t.createElement(ms, {
            activeSubTab: f,
            onSubTabChange: w
          })
        },
        {
          key: "skills",
          label: y("技能", i),
          children: t.createElement(ds, {
            embedded: !0
          })
        }
      ]
    })
  );
}
const ul = dl;
function ps() {
  return k().React.createElement(ul, {
    initialTab: "tools"
  });
}
function gs() {
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
function ys(e) {
  if (!e.env) return !1;
  const t = Object.entries(e.env);
  return t.length === 0 ? !1 : t.some(([, n]) => typeof n == "string" && n.length > 0);
}
const sn = "ugsci.market.githubSources", oa = "https://github.com/anthropics/skills/tree/main/skills", ml = "https://ugsci-awesome-tools.oss-cn-beijing.aliyuncs.com", hs = `${ml}/skills`;
function Es(e) {
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
function bs(e) {
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
    iconUrl: e.icon_url ? Es(e.icon_url) : void 0,
    category: e.category ? St(e.category) : "",
    description: e.description,
    transport: e.transport || "stdio",
    command: ((a = e.config) == null ? void 0 : a.command) || "",
    args: ((l = e.config) == null ? void 0 : l.args) || [],
    env: Object.keys(t).length > 0 ? t : void 0
  };
}
const fl = "ugsci.market.mcpSources", pl = "ugsci.market.expertSources";
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
function vs() {
  return gl(fl, "mcp");
}
function Zt(e) {
  yl(fl, e);
}
function ws() {
  return gl(pl, "expert");
}
function en(e) {
  yl(pl, e);
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
function Ss(e) {
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
function xs() {
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
      (r) => r && typeof r.id == "string" && (typeof r.owner == "string" || r.platform === "oss") && !(r.platform === "oss" && r.url === hs)
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
function ks(e) {
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
async function Cs(e) {
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
      const d = e.skillsPath ? e.skillsPath + "/" : "", m = t ? `https://gitee.com/${e.owner}/${e.repo}/raw/${e.ref}/${d}${c.name}/SKILL.md` : `https://raw.githubusercontent.com/${e.owner}/${e.repo}/${e.ref}/${d}${c.name}/SKILL.md`, u = t ? `https://gitee.com/${e.owner}/${e.repo}/tree/${e.ref}/${d}${c.name}` : `https://github.com/${e.owner}/${e.repo}/tree/${e.ref}/${d}${c.name}`, f = {
        sourceId: e.id,
        sourceLabel: e.label,
        name: c.name,
        description: "",
        source_url: u,
        html_url: u,
        version: null,
        author: null
      };
      try {
        const w = {};
        t && e.accessToken && (w.Authorization = `token ${e.accessToken}`);
        const h = await fetch(m, {
          headers: w
        });
        if (!h.ok) return f;
        const y = await h.text(), p = ks(y);
        return {
          ...f,
          name: p.name || c.name,
          description: p.description || "",
          version: p.version || null,
          author: p.author || null
        };
      } catch {
        return f;
      }
    })
  );
}
async function Ts(e) {
  const t = Ss(e.url);
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
    for (const [d, m] of Object.entries(o.tag_groups))
      Array.isArray(m) && s.push({
        id: d,
        label: St(d),
        tags: m
      });
  const i = [];
  function c(d, m) {
    for (const u of d) {
      if (u.type === "collection" && Array.isArray(u.children)) {
        c(u.children, u.name);
        continue;
      }
      const f = u.path || u.name || "";
      if (!f) continue;
      const w = f.split("/").map(encodeURIComponent).join("/"), h = `${n}/${a}/${w}`;
      let y = null;
      if (u.metadata) {
        const b = u.metadata.match(/version:\s*"?([\d.]+)"?/);
        b && (y = b[1]);
      }
      const p = m ? `${e.label}/${m}` : e.label;
      i.push({
        sourceId: e.id,
        sourceLabel: e.label,
        sourcePath: p,
        name: u.name || f.split("/").pop() || f,
        description: u.description || "",
        source_url: h,
        html_url: h,
        version: y,
        author: null,
        tag: u.tag || void 0,
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
async function _s() {
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
async function Is() {
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
      let m = null;
      if (typeof o.metadata == "string") {
        const u = o.metadata.match(/version:\s*"?([\d.]+)"?/);
        u && (m = u[1]);
      }
      t.push({
        sourceId: "oss:ugsci-official",
        sourceLabel: "UGSci",
        sourcePath: l ? `UGSci/${l}` : "UGSci",
        name: o.name || s.split("/").pop() || s,
        description: o.description || "",
        source_url: c,
        html_url: c,
        version: m,
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
async function As() {
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
async function zs(e) {
  const t = e.filter((o) => o.enabled), n = await Promise.all(
    t.map(async (o) => {
      try {
        if (o.platform === "oss") {
          const { skills: s, categories: i } = await Ts(o);
          return { skills: s, categories: i, error: null, label: o.label };
        } else
          return { skills: await Cs(o), categories: [], error: null, label: o.label };
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
function $s({
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
    Switch: m,
    Typography: u,
    Tooltip: f,
    message: w
  } = k().antd, {
    PlusOutlined: h,
    DeleteOutlined: y,
    LinkOutlined: p,
    GithubOutlined: b
  } = k().antdIcons || {}, { Text: v } = u, [g, S] = l(""), [O, W] = l(""), A = () => {
    const B = g.trim();
    if (!B) return;
    const C = hl(B);
    if (!C) {
      w.error("无效的仓库 URL，请输入类似 https://github.com/owner/repo/tree/main/skills 或 https://gitee.com/owner/repo/tree/master/skills 的链接");
      return;
    }
    const x = El(C.owner, C.repo, C.skillsPath, C.platform);
    if (n.some((H) => H.id === x)) {
      w.warning("该源已存在");
      return;
    }
    const z = {
      id: x,
      url: B,
      label: C.label,
      owner: C.owner,
      repo: C.repo,
      ref: C.ref,
      skillsPath: C.skillsPath,
      enabled: !0,
      platform: C.platform,
      accessToken: O.trim() || void 0
    }, _ = [...n, z];
    tn(_), r(_), S(""), W(""), w.success(`已添加源: ${C.label}`);
  }, I = (B, C) => {
    const x = n.map(
      (z) => z.id === B ? { ...z, enabled: C } : z
    );
    tn(x), r(x);
  }, K = (B, C) => {
    const x = n.map(
      (z) => z.id === B ? { ...z, accessToken: C.trim() || void 0 } : z
    );
    tn(x), r(x);
  }, j = (B) => {
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
        b ? a.createElement(b, { style: { fontSize: 18 } }) : null,
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
          onPressEnter: A,
          prefix: p ? a.createElement(p) : void 0,
          style: { flex: 1 }
        }),
        a.createElement(
          i,
          {
            type: "primary",
            icon: h ? a.createElement(h) : void 0,
            onClick: A
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
          value: O,
          onChange: (B) => W(B.target.value),
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
              f,
              { title: B.enabled ? "点击禁用" : "点击启用" },
              a.createElement(m, {
                size: "small",
                checked: B.enabled,
                onChange: (C) => I(B.id, C)
              })
            ),
            a.createElement(
              f,
              { title: "移除此源" },
              a.createElement(
                i,
                {
                  size: "small",
                  type: "text",
                  danger: !0,
                  icon: y ? a.createElement(y) : void 0,
                  onClick: () => j(B.id)
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
              onChange: (C) => K(B.id, C.target.value),
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
    Tag: m,
    Switch: u,
    Typography: f,
    Tooltip: w,
    message: h
  } = k().antd, {
    PlusOutlined: y,
    DeleteOutlined: p,
    LinkOutlined: b,
    ApiOutlined: v,
    UserOutlined: g,
    ImportOutlined: S,
    ExportOutlined: O,
    CopyOutlined: W
  } = k().antdIcons || {}, { Text: A } = f, [I, K] = o(""), [j, B] = o(""), [C, x] = o(""), [z, _] = o(!1), H = a === "mcp" ? "MCP" : "专家模板", F = a === "mcp" ? v ? l.createElement(v, { style: { fontSize: 18 } }) : null : g ? l.createElement(g, { style: { fontSize: 18 } }) : null, D = () => {
    const N = I.trim(), M = j.trim();
    if (!N) return;
    const le = M || N.slice(0, 40), te = `${a}:${N}`;
    if (n.some((L) => L.id === te)) {
      h.warning("该源已存在");
      return;
    }
    const V = {
      id: te,
      label: le,
      url: N,
      enabled: !0,
      type: a
    }, ue = [...n, V];
    a === "mcp" ? Zt(ue) : en(ue), r(ue), K(""), B(""), h.success(`已添加${H}源: ${le}`);
  }, R = (N, M) => {
    const le = n.map(
      (te) => te.id === N ? { ...te, enabled: M } : te
    );
    a === "mcp" ? Zt(le) : en(le), r(le);
  }, $ = (N) => {
    const M = n.filter((le) => le.id !== N);
    a === "mcp" ? Zt(M) : en(M), r(M), h.success("已移除源");
  }, ee = () => {
    const N = JSON.stringify(
      { type: a, sources: n },
      null,
      2
    );
    try {
      navigator.clipboard.writeText(N), h.success(`${H}源已复制到剪贴板（${n.length} 个源）`);
    } catch {
      const M = document.createElement("textarea");
      M.value = N, document.body.appendChild(M), M.select(), document.execCommand("copy"), document.body.removeChild(M), h.success(`${H}源已复制到剪贴板（${n.length} 个源）`);
    }
  }, ae = () => {
    const N = C.trim();
    if (!N) {
      h.warning("请粘贴 JSON 内容");
      return;
    }
    try {
      const M = JSON.parse(N);
      let le = [];
      if (Array.isArray(M))
        le = M;
      else if (M && Array.isArray(M.sources))
        le = M.sources;
      else if (M && typeof M == "object")
        le = [M];
      else
        throw new Error("Invalid format");
      const te = le.filter(
        (oe) => oe && typeof oe.url == "string" && typeof oe.label == "string"
      );
      if (te.length === 0) {
        h.error("未找到有效的源数据");
        return;
      }
      const V = new Set(n.map((oe) => oe.id)), ue = [];
      for (const oe of te) {
        const ge = oe.id || `${a}:${oe.url}`;
        V.has(ge) || ue.push({
          id: ge,
          label: oe.label,
          url: oe.url,
          enabled: oe.enabled !== !1,
          type: a
        });
      }
      if (ue.length === 0) {
        h.info("所有源均已存在，无新增");
        return;
      }
      const L = [...n, ...ue];
      a === "mcp" ? Zt(L) : en(L), r(L), x(""), _(!1), h.success(`成功导入 ${ue.length} 个${H}源`);
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
        F,
        l.createElement("span", null, `配置${H}源`)
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
              icon: O ? l.createElement(O) : void 0,
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
              onClick: () => _(!z),
              size: "small"
            },
            z ? "隐藏导入" : "导入JSON"
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
      A,
      { type: "secondary", style: { fontSize: 12, display: "block", marginBottom: 12 } },
      `配置${H}源地址，支持从远程仓库或团队共享的 JSON 导入${H}配置。`
    ),
    // Import section (collapsible)
    z ? l.createElement(
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
        A,
        { strong: !0, style: { fontSize: 12, display: "block", marginBottom: 8 } },
        `粘贴${H}源 JSON（支持从导出的剪贴板内容粘贴）`
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
        onChange: (N) => x(N.target.value),
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
        value: j,
        onChange: (N) => B(N.target.value),
        style: { width: 200 }
      }),
      l.createElement(i, {
        placeholder: a === "mcp" ? "https://raw.githubusercontent.com/team/mcp-registry/main/mcp.json" : "https://raw.githubusercontent.com/team/expert-registry/main/experts.json",
        value: I,
        onChange: (N) => K(N.target.value),
        onPressEnter: D,
        prefix: b ? l.createElement(b) : void 0,
        style: { flex: 1 }
      }),
      l.createElement(
        c,
        {
          type: "primary",
          icon: y ? l.createElement(y) : void 0,
          onClick: D
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
        A,
        { strong: !0 },
        `已配置源 (${n.length})`
      )
    ),
    l.createElement(d, {
      size: "small",
      bordered: !0,
      dataSource: n,
      renderItem: (N) => l.createElement(
        d.Item,
        {
          actions: [
            l.createElement(
              w,
              { title: N.enabled ? "点击禁用" : "点击启用" },
              l.createElement(u, {
                size: "small",
                checked: N.enabled,
                onChange: (M) => R(N.id, M)
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
                  icon: p ? l.createElement(p) : void 0,
                  onClick: () => $(N.id)
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
              m,
              {
                color: a === "mcp" ? "purple" : "blue",
                style: { fontSize: 11 }
              },
              N.label
            ),
            N.enabled ? null : l.createElement(
              m,
              { style: { fontSize: 10 } },
              "已禁用"
            )
          ),
          l.createElement(
            A,
            {
              type: "secondary",
              style: { fontSize: 11, wordBreak: "break-all" }
            },
            N.url
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
async function Ps() {
  return ce("/market/providers");
}
async function Rs(e) {
  return ce(
    `/market/categories?lang=${encodeURIComponent(e)}`
  );
}
async function Os(e, t, n, r, a) {
  return ce("/market/search", {
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
  return t && (n.access_token = t), ce("/skills/pool/import", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(n)
  });
}
function Ms({ embedded: e = !1 } = {}) {
  const t = k().React, { useState: n, useEffect: r, useCallback: a, useMemo: l, useRef: o } = t, {
    Spin: s,
    Empty: i,
    Input: c,
    Button: d,
    message: m,
    Row: u,
    Col: f,
    Card: w,
    Tag: h,
    Tooltip: y,
    Typography: p,
    Select: b,
    Drawer: v,
    Descriptions: g,
    Tabs: S,
    Badge: O,
    Progress: W,
    Modal: A,
    Alert: I
  } = k().antd, {
    ReloadOutlined: K,
    SearchOutlined: j,
    DownloadOutlined: B,
    AppstoreOutlined: C,
    ShopOutlined: x,
    CheckCircleOutlined: z,
    LoadingOutlined: _,
    UserOutlined: H,
    UserAddOutlined: F,
    SettingOutlined: D,
    GithubOutlined: R,
    ApiOutlined: $
  } = k().antdIcons || {}, { Text: ee, Paragraph: ae, Title: N } = p, [M, le] = n("skills"), [te, V] = n([]), [ue, L] = n([]), [oe, ge] = n([]), [X, se] = n(""), [ne, xe] = n(""), [Se, Be] = n(!1), [ve, ie] = n(!1), [we, Ae] = n(
    {}
  ), [U, de] = n(null), [ye, q] = n({}), [T, me] = n([]), [Y, pe] = n(""), [he, Ie] = n(""), [P, Ee] = n(""), [_e, De] = n({}), [ze, Ye] = n(""), [Ze, Fe] = n(/* @__PURE__ */ new Set()), [Oe, re] = n(null), [$e, Me] = n({}), [Ue, Le] = n([]), [Re, ke] = n([]), [st, ct] = n([]), [Wt, nt] = n(""), [vr, qt] = n(!1), [eo, wr] = n(!1), [to, Sr] = n([]), [no, xr] = n(!1), [ro, kr] = n([]), [ao, Cr] = n(!1), [Tr, _r] = n([]), [Ir, Ar] = n([]), [zr, $r] = n(!1), [ft, Pr] = n(""), [Rr, Or] = n([]), [Mr, Lr] = n([]), [Br, Ur] = n(!1), [pt, jr] = n(""), [Tn, Nr] = n(!1), [Ve, Vt] = n(null), [Ct, lo] = n([]), Tt = o(null);
  r(() => {
    Promise.all([
      Ps().catch(() => []),
      Rs("zh").catch(() => []),
      vn().catch(() => [])
    ]).then(([E, G, J]) => {
      V(E), L(G), me(J), J.length > 0 && (pe(J[0].id), Ye(J[0].id));
    });
  }, []);
  const Jt = a(async (E) => {
    const G = E ?? xs();
    if (Le(E || G), G.filter((fe) => fe.enabled).length === 0) {
      ke([]);
      return;
    }
    qt(!0);
    try {
      const { skills: fe, errors: Ce, categories: je } = await zs(G);
      if (ke(fe), lo(je), Ce.length > 0) {
        for (const Pe of Ce)
          console.warn(`[ugsci] GitHub source '${Pe.label}' error: ${Pe.message}`);
        m.warning(
          `部分源加载失败: ${Ce.map((Pe) => Pe.label).join(", ")}`
        );
      }
    } catch (fe) {
      m.error(fe.message || "加载技能源失败"), ke([]);
    } finally {
      qt(!1);
    }
  }, []), _n = a(async () => {
    var fe, Ce, je;
    $r(!0), Ur(!0), qt(!0);
    const [E, G, J] = await Promise.allSettled([
      _s(),
      As(),
      Is()
    ]);
    if (E.status === "fulfilled" ? (_r(E.value.servers), Ar(E.value.categories)) : (console.warn(`[ugsci] MCP manifest error: ${((fe = E.reason) == null ? void 0 : fe.message) || E.reason}`), _r([]), Ar([])), $r(!1), G.status === "fulfilled" ? (Or(G.value.agents), Lr(G.value.categories)) : (console.warn(`[ugsci] Agents manifest error: ${((Ce = G.reason) == null ? void 0 : Ce.message) || G.reason}`), Or([]), Lr([])), Ur(!1), J.status === "fulfilled")
      ct(J.value.skills), nt("");
    else {
      const Pe = ((je = J.reason) == null ? void 0 : je.message) || String(J.reason);
      console.warn(`[ugsci] Skills manifest error: ${Pe}`), ct([]), nt(Pe);
    }
    qt(!1);
  }, []);
  r(() => {
    Jt(), _n(), Sr(vs()), kr(ws());
  }, [Jt, _n]);
  const Kt = a(
    async (E, G, J) => {
      Be(!0);
      try {
        const fe = await Os(
          E,
          J,
          20,
          "zh",
          G || void 0
        );
        J === void 0 || Object.keys(J).length === 0 ? ge(fe.results) : ge((Pe) => [...Pe, ...fe.results]);
        const Ce = Object.values(fe.by_provider || {}).some(
          (Pe) => Pe.has_more
        );
        ie(Ce);
        const je = {};
        for (const [Pe, rt] of Object.entries(fe.by_provider || {}))
          je[Pe] = (J[Pe] || 1) + 1;
        if (Ae(je), fe.errors.length > 0)
          for (const Pe of fe.errors)
            console.warn(
              `[ugsci] Market provider '${Pe.provider}' error: ${Pe.message}`
            );
      } catch (fe) {
        m.error(fe.message || "搜索市场失败"), ge([]);
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
    Kt(X, ne, we);
  }, Dr = async (E) => {
    const G = `${E.source}:${E.slug}`;
    try {
      q((fe) => ({ ...fe, [G]: "installing" }));
      const J = await ca(E.source_url);
      J.installed && m.success(
        `技能「${J.name || E.name}」已安装到技能池，可在技能中心查看`
      ), q((fe) => {
        const Ce = { ...fe };
        return delete Ce[G], Ce;
      });
    } catch (J) {
      m.error(sa(J) || "安装技能失败"), q((fe) => {
        const Ce = { ...fe };
        return delete Ce[G], Ce;
      });
    }
  }, io = (E) => {
    window.history.pushState({}, "", E), window.dispatchEvent(new PopStateEvent("popstate"));
  }, so = async (E) => {
    const G = `github:${E.sourceId}:${E.name}`, J = Ue.find((Ce) => Ce.id === E.sourceId), fe = (J == null ? void 0 : J.accessToken) || void 0;
    try {
      q((je) => ({ ...je, [G]: "installing" }));
      const Ce = await ca(E.source_url, fe);
      Ce.installed && m.success(
        `技能「${Ce.name || E.name}」已安装到技能池，可在技能中心查看`
      ), q((je) => {
        const Pe = { ...je };
        return delete Pe[G], Pe;
      });
    } catch (Ce) {
      m.error(sa(Ce) || "安装技能失败"), q((je) => {
        const Pe = { ...je };
        return delete Pe[G], Pe;
      });
    }
  }, dt = l(() => {
    const E = [], G = /* @__PURE__ */ new Set();
    for (const J of [...st, ...Re]) {
      const fe = J.source_url || `${J.sourceLabel}:${J.name}`;
      G.has(fe) || (G.add(fe), E.push(J));
    }
    return E;
  }, [st, Re]), Fr = l(() => {
    const E = [], G = /* @__PURE__ */ new Set();
    if (Ct.length > 0)
      for (const J of Ct)
        G.has(J.id) || (G.add(J.id), E.push(J));
    for (const J of dt)
      J.tag && !G.has(J.tag) && (G.add(J.tag), E.push({ id: J.tag, label: J.tag }));
    for (const J of dt)
      !J.isOfficial && J.sourceLabel && !G.has(J.sourceLabel) && (G.add(J.sourceLabel), E.push({ id: J.sourceLabel, label: J.sourceLabel }));
    return E;
  }, [dt, Ct]), In = l(() => {
    let E = dt;
    if (ne) {
      const G = Ct.find((J) => J.id === ne);
      G && G.tags ? E = E.filter(
        (J) => J.tag && G.tags.includes(J.tag) || J.sourceLabel === ne
      ) : E = E.filter(
        (J) => J.tag === ne || J.sourceLabel === ne
      );
    }
    if (X.trim()) {
      const G = X.toLowerCase();
      E = E.filter(
        (J) => {
          var fe;
          return J.name.toLowerCase().includes(G) || ((fe = J.description) == null ? void 0 : fe.toLowerCase().includes(G));
        }
      );
    }
    return E;
  }, [dt, X, ne, Ct]), Gr = te.filter((E) => E.available), gt = l(() => ne ? oe.filter((E) => {
    const G = Gr.find((J) => J.key === E.source);
    return (G == null ? void 0 : G.label) === ne;
  }) : oe, [oe, ne, Gr]), co = t.createElement(
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
        prefix: j ? t.createElement(j) : void 0,
        value: X,
        onChange: (E) => se(E.target.value),
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
          icon: R ? t.createElement(R) : void 0,
          onClick: () => wr(!0),
          size: "small"
        },
        "配置技能源"
      )
    ),
    // Dynamic category filter tags (from OSS manifest tags + imported sources)
    Wt && dt.length === 0 ? t.createElement(I, {
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
      ...Fr.map((E) => {
        const G = Re.some(
          (J) => !J.isOfficial && J.sourceLabel === E.id
        );
        return t.createElement(
          h,
          {
            key: E.id,
            style: {
              fontSize: 11,
              cursor: "pointer",
              borderRadius: 12
            },
            color: ne === E.id ? G ? "blue" : "geekblue" : void 0,
            icon: G && R ? t.createElement(R) : void 0,
            onClick: () => xe(
              ne === E.id ? "" : E.id
            )
          },
          E.label
        );
      })
    ) : null,
    // GitHub skills section
    vr && dt.length === 0 ? t.createElement(
      "div",
      { style: { textAlign: "center", padding: 40, marginBottom: 16 } },
      t.createElement(s, { size: "large" }, t.createElement("div", { style: { minHeight: 60, display: "flex", alignItems: "center", justifyContent: "center" } }, "正在加载技能..."))
    ) : In.length > 0 ? t.createElement(
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
        R ? t.createElement(R, {
          style: { fontSize: 14, color: "#1677ff" }
        }) : null,
        t.createElement(
          ee,
          { strong: !0, style: { fontSize: 13 } },
          `技能市场 (${In.length})`
        )
      ),
      t.createElement(
        u,
        { gutter: [12, 12] },
        ...In.map((E) => {
          const G = `github:${E.sourceId}:${E.name}`, J = ye[G];
          return t.createElement(
            f,
            { key: G, xs: 24, sm: 12, md: 8, lg: 6 },
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
                R ? t.createElement(R, {
                  style: { fontSize: 18, color: "var(--ant-color-text-secondary, #57606a)" }
                }) : t.createElement(
                  "span",
                  { style: { fontSize: 18 } },
                  "📦"
                ),
                t.createElement(
                  y,
                  { title: E.name },
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
                    E.name
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
                E.description || "暂无描述"
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
                  E.sourcePath || E.sourceLabel ? t.createElement(
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
                    $ ? t.createElement($, { style: { fontSize: 10 } }) : null,
                    E.sourcePath || E.sourceLabel
                  ) : null,
                  // Show tag as category badge
                  E.tag ? t.createElement(
                    h,
                    { color: "geekblue", style: { fontSize: 10 } },
                    E.tag
                  ) : null,
                  E.version ? t.createElement(
                    h,
                    { style: { fontSize: 10 } },
                    `v${E.version}`
                  ) : null
                ),
                J ? t.createElement(
                  d,
                  {
                    size: "small",
                    disabled: !0,
                    icon: _ ? t.createElement(_) : void 0
                  },
                  "安装中"
                ) : t.createElement(
                  d,
                  {
                    type: "primary",
                    size: "small",
                    icon: B ? t.createElement(B) : void 0,
                    onClick: () => so(E)
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
    gt.length > 0 || Se ? t.createElement(
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
    Se && gt.length === 0 ? t.createElement(
      "div",
      { style: { textAlign: "center", padding: 60 } },
      t.createElement(s, { size: "large" })
    ) : gt.length === 0 ? t.createElement(i, {
      description: X ? `未找到匹配「${X}」的技能` : "输入关键词搜索技能市场",
      image: i.PRESENTED_IMAGE_SIMPLE
    }) : t.createElement(
      u,
      { gutter: [12, 12] },
      ...gt.map((E) => {
        const G = `${E.source}:${E.slug}`, J = ye[G];
        return t.createElement(
          f,
          { key: G, xs: 24, sm: 12, md: 8, lg: 6 },
          t.createElement(
            w,
            {
              hoverable: !0,
              size: "small",
              style: { height: "100%", cursor: "pointer" },
              onClick: () => de(E)
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
              E.icon_url ? t.createElement("img", {
                src: E.icon_url,
                alt: E.name,
                style: { width: 24, height: 24, borderRadius: 4 }
              }) : t.createElement(
                "span",
                { style: { fontSize: 18 } },
                "📦"
              ),
              t.createElement(
                y,
                { title: E.name },
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
                  E.name
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
              E.description || "暂无描述"
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
                  E.source
                ),
                E.version ? t.createElement(
                  h,
                  { style: { fontSize: 10 } },
                  `v${E.version}`
                ) : null
              ),
              J ? t.createElement(
                d,
                {
                  size: "small",
                  disabled: !0,
                  icon: _ ? t.createElement(_) : void 0
                },
                "安装中"
              ) : t.createElement(
                d,
                {
                  type: "primary",
                  size: "small",
                  icon: B ? t.createElement(B) : void 0,
                  onClick: (fe) => {
                    fe.stopPropagation(), Dr(E);
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
    ve && !Se ? t.createElement(
      "div",
      { style: { textAlign: "center", marginTop: 16 } },
      t.createElement(
        d,
        { onClick: oo, loading: Se },
        "加载更多"
      )
    ) : null,
    // Detail Drawer
    U ? t.createElement(
      v,
      {
        title: t.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 8 } },
          U.icon_url ? t.createElement("img", {
            src: U.icon_url,
            alt: U.name,
            style: { width: 28, height: 28, borderRadius: 4 }
          }) : t.createElement(
            "span",
            { style: { fontSize: 20 } },
            "📦"
          ),
          t.createElement("span", null, U.name)
        ),
        open: !0,
        onClose: () => de(null),
        width: 480,
        extra: t.createElement(
          d,
          {
            type: "primary",
            icon: B ? t.createElement(B) : void 0,
            onClick: () => {
              Dr(U);
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
          U.source
        ),
        t.createElement(
          g.Item,
          { label: "描述" },
          U.description || "-"
        ),
        U.version ? t.createElement(
          g.Item,
          { label: "版本" },
          U.version
        ) : null,
        U.author ? t.createElement(
          g.Item,
          { label: "作者" },
          U.author
        ) : null,
        t.createElement(
          g.Item,
          { label: "来源链接" },
          t.createElement(
            "a",
            { href: U.source_url, target: "_blank" },
            U.source_url
          )
        )
      ),
      U.stats ? t.createElement(
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
          ...Object.entries(U.stats).map(
            ([E, G]) => t.createElement(
              "div",
              { key: E, style: { textAlign: "center" } },
              t.createElement(
                "div",
                {
                  style: {
                    fontSize: 18,
                    fontWeight: 600,
                    color: "#1677ff"
                  }
                },
                String(G)
              ),
              t.createElement(
                ee,
                { type: "secondary", style: { fontSize: 11 } },
                E
              )
            )
          )
        )
      ) : null
    ) : null
  ), An = l(() => {
    let E = Rr;
    if (pt && (E = E.filter((G) => G.category === pt)), he.trim()) {
      const G = he.toLowerCase();
      E = E.filter(
        (J) => J.name.toLowerCase().includes(G) || J.description.toLowerCase().includes(G) || J.tags.some((fe) => fe.toLowerCase().includes(G))
      );
    }
    return E;
  }, [Rr, he, pt]), uo = async (E) => {
    if (!Tn) {
      Nr(!0);
      try {
        let G = E.description;
        if (E.instructions)
          try {
            const Ce = E.instructions.replace(/^\/+/, ""), je = await un(Ce);
            je.ok && (G = await je.text());
          } catch {
          }
        let J = [];
        if (E.skills_manifest)
          try {
            const Ce = E.skills_manifest.replace(/^\/+/, ""), je = await un(Ce);
            if (je.ok) {
              const Pe = await je.json();
              Array.isArray(Pe) ? J = Pe.map((rt) => typeof rt == "string" ? rt : rt.name).filter(Boolean) : Pe.skills && (J = Pe.skills.map((rt) => typeof rt == "string" ? rt : rt.name).filter(Boolean));
            }
          } catch {
          }
        const fe = await ce("/agents", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: E.name,
            description: E.description,
            skill_names: J
          })
        });
        await dn(fe.id, "AGENTS.md", G), m.success(`专家「${E.name}」创建成功，已跳转至专家`), io("/ugsci-experts");
      } catch (G) {
        m.error(G.message || "创建专家失败");
      } finally {
        Nr(!1);
      }
    }
  }, Hr = a(async (E) => {
    if (E)
      try {
        const G = await or(E);
        Fe(new Set(G.map((J) => J.key)));
      } catch {
        Fe(/* @__PURE__ */ new Set());
      }
  }, []);
  r(() => {
    ze && Hr(ze);
  }, [ze, Hr]);
  const mo = async (E) => {
    if (!ze) {
      m.warning("请先选择目标专家");
      return;
    }
    if (ys(E)) {
      const G = Object.entries(E.env), J = {};
      for (const [fe] of G)
        J[fe] = "";
      Me(J), re(E);
      return;
    }
    await Wr(E, E.env || {});
  }, Wr = async (E, G) => {
    De((J) => ({ ...J, [E.id]: !0 }));
    try {
      const J = E.id;
      await ir(ze, {
        client_key: J,
        client: {
          name: E.name,
          description: E.description,
          enabled: !0,
          transport: E.transport,
          url: E.url || "",
          command: E.command || "",
          args: E.args || [],
          env: G,
          cwd: E.cwd || "",
          headers: E.headers || {}
        }
      }), m.success(`MCP「${E.name}」已添加到当前专家`), Fe((fe) => new Set(fe).add(J));
    } catch (J) {
      m.error(J.message || `添加 MCP「${E.name}」失败`);
    } finally {
      De((J) => ({ ...J, [E.id]: !1 }));
    }
  }, fo = async () => {
    if (!Oe) return;
    const E = [];
    for (const [J, fe] of Object.entries($e))
      if (!fe || !fe.trim()) {
        const Ce = la[J];
        E.push((Ce == null ? void 0 : Ce.label) || J);
      }
    if (E.length > 0) {
      m.warning(`请填写以下配置项: ${E.join(", ")}`);
      return;
    }
    const G = Oe;
    re(null), Me({}), await Wr(G, { ...$e });
  }, zn = l(() => {
    let E = Tr;
    if (ft && (E = E.filter((G) => G.category === ft)), P.trim()) {
      const G = P.toLowerCase();
      E = E.filter(
        (J) => J.name.toLowerCase().includes(G) || J.description.toLowerCase().includes(G) || J.tags.some((fe) => fe.toLowerCase().includes(G))
      );
    }
    return E.map(bs);
  }, [Tr, P, ft]), po = t.createElement(
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
        prefix: j ? t.createElement(j) : void 0,
        value: P,
        onChange: (E) => Ee(E.target.value),
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
        t.createElement(b, {
          value: ze,
          onChange: (E) => Ye(E),
          style: { minWidth: 180 },
          size: "small",
          options: T.map((E) => ({ value: E.id, label: E.name }))
        })
      ),
      // Configure MCP source button
      t.createElement(
        d,
        {
          icon: $ ? t.createElement($) : void 0,
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
          color: ft === "" ? "blue" : void 0,
          onClick: () => Pr("")
        },
        "全部"
      ),
      ...Ir.map(
        (E) => t.createElement(
          h,
          {
            key: E.id,
            style: { fontSize: 11, cursor: "pointer", borderRadius: 12 },
            color: ft === E.id ? "geekblue" : void 0,
            onClick: () => Pr(
              ft === E.id ? "" : E.id
            )
          },
          E.label
        )
      )
    ) : null,
    // MCP server cards (dynamic from OSS)
    zr && zn.length === 0 ? t.createElement(
      "div",
      { style: { textAlign: "center", padding: 40 } },
      t.createElement(s, { size: "large" }, t.createElement("div", { style: { minHeight: 60, display: "flex", alignItems: "center", justifyContent: "center" } }, "正在加载 MCP 服务器..."))
    ) : zn.length === 0 ? t.createElement(i, {
      description: "未找到匹配的 MCP 服务器",
      image: i.PRESENTED_IMAGE_SIMPLE
    }) : t.createElement(
      u,
      { gutter: [12, 12] },
      ...zn.map(
        (E) => t.createElement(
          f,
          { key: E.id, xs: 24, sm: 12, md: 8 },
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
                E.iconUrl ? t.createElement("img", {
                  src: E.iconUrl,
                  alt: E.name,
                  style: { width: 28, height: 28, objectFit: "contain" },
                  onError: (G) => {
                    G.target.style.display = "none";
                  }
                }) : E.emoji
              ),
              t.createElement(
                "div",
                { style: { flex: 1 } },
                t.createElement(
                  ee,
                  { strong: !0, style: { fontSize: 14 } },
                  E.name
                ),
                t.createElement(
                  "div",
                  { style: { display: "flex", gap: 4, marginTop: 4, flexWrap: "wrap" } },
                  t.createElement(
                    h,
                    { color: "blue", style: { fontSize: 10 } },
                    E.category
                  ),
                  t.createElement(
                    h,
                    {
                      color: E.transport === "stdio" ? "purple" : "cyan",
                      style: { fontSize: 10 }
                    },
                    E.transport
                  ),
                  E.env && Object.keys(E.env).length > 0 ? t.createElement(
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
              E.description
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
                E.transport === "stdio" ? `${E.command} ${(E.args || []).join(" ")}` : E.url || ""
              ),
              Ze.has(E.id) ? t.createElement(
                d,
                { size: "small", disabled: !0 },
                "已安装"
              ) : t.createElement(
                d,
                {
                  type: "primary",
                  size: "small",
                  loading: !!_e[E.id],
                  icon: $ ? t.createElement($) : void 0,
                  onClick: () => mo(E)
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
    A,
    {
      title: t.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 8 } },
        t.createElement("span", { style: { fontSize: 20, display: "inline-flex", alignItems: "center", justifyContent: "center", width: 24, height: 24 } }, Oe.iconUrl ? t.createElement("img", { src: Oe.iconUrl, alt: Oe.name, style: { width: 22, height: 22, objectFit: "contain" }, onError: (E) => {
          E.target.style.display = "none";
        } }) : Oe.emoji),
        t.createElement("span", null, `配置 ${Oe.name} 密钥`)
      ),
      open: !!Oe,
      onCancel: () => {
        re(null), Me({});
      },
      onOk: fo,
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
    ...Object.entries(Oe.env || {}).map(([E]) => {
      const G = la[E], J = (G == null ? void 0 : G.isSecret) !== !1;
      return t.createElement(
        "div",
        { key: E, style: { marginBottom: 16 } },
        t.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 6, marginBottom: 4 } },
          t.createElement(
            ee,
            { strong: !0, style: { fontSize: 13 } },
            (G == null ? void 0 : G.label) || E
          ),
          t.createElement(
            h,
            { color: "orange", style: { fontSize: 10 } },
            "必填"
          )
        ),
        // Help text with optional link
        G ? t.createElement(
          "div",
          { style: { marginBottom: 6, fontSize: 12, color: "var(--ant-color-text-tertiary, #8c8c8c)" } },
          G.help,
          G.link ? t.createElement(
            "a",
            {
              href: G.link,
              target: "_blank",
              rel: "noopener noreferrer",
              style: { marginLeft: 4, fontSize: 12 }
            },
            "获取方式 ↗"
          ) : null
        ) : null,
        // Input field
        J ? t.createElement(c.Password, {
          placeholder: `请输入 ${(G == null ? void 0 : G.label) || E}`,
          value: $e[E] || "",
          onChange: (fe) => Me((Ce) => ({
            ...Ce,
            [E]: fe.target.value
          })),
          style: { width: "100%" }
        }) : t.createElement(c, {
          placeholder: `请输入 ${(G == null ? void 0 : G.label) || E}`,
          value: $e[E] || "",
          onChange: (fe) => Me((Ce) => ({
            ...Ce,
            [E]: fe.target.value
          })),
          style: { width: "100%" }
        }),
        // Show env key name for reference
        t.createElement(
          ee,
          { type: "secondary", style: { fontSize: 11, display: "block", marginTop: 2 } },
          `环境变量名: ${E}`
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
        prefix: j ? t.createElement(j) : void 0,
        value: he,
        onChange: (E) => Ie(E.target.value),
        allowClear: !0,
        style: { maxWidth: 400, flex: 1, minWidth: 200 }
      }),
      t.createElement(
        d,
        {
          icon: H ? t.createElement(H) : void 0,
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
          color: pt === "" ? "blue" : void 0,
          onClick: () => jr("")
        },
        "全部"
      ),
      ...Mr.map(
        (E) => t.createElement(
          h,
          {
            key: E.id,
            style: { fontSize: 11, cursor: "pointer", borderRadius: 12 },
            color: pt === E.id ? "geekblue" : void 0,
            onClick: () => jr(
              pt === E.id ? "" : E.id
            )
          },
          E.label
        )
      )
    ) : null,
    // Agent cards (dynamic from OSS)
    Br && An.length === 0 ? t.createElement(
      "div",
      { style: { textAlign: "center", padding: 40 } },
      t.createElement(s, { size: "large" }, t.createElement("div", { style: { minHeight: 60, display: "flex", alignItems: "center", justifyContent: "center" } }, "正在加载人才市场..."))
    ) : An.length === 0 ? t.createElement(i, {
      description: "未找到匹配的人才",
      image: i.PRESENTED_IMAGE_SIMPLE
    }) : t.createElement(
      u,
      { gutter: [12, 12] },
      ...An.map(
        (E) => t.createElement(
          f,
          { key: E.id, xs: 24, sm: 12, md: 8 },
          t.createElement(
            w,
            {
              hoverable: !0,
              size: "small",
              style: { height: "100%", cursor: "pointer" },
              onClick: () => Vt(E)
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
                name: E.name,
                size: 40
              }),
              t.createElement(
                "div",
                { style: { flex: 1 } },
                t.createElement(
                  ee,
                  { strong: !0, style: { fontSize: 14 } },
                  E.name
                ),
                t.createElement(
                  "div",
                  { style: { display: "flex", gap: 4, marginTop: 4, flexWrap: "wrap" } },
                  E.category ? t.createElement(
                    h,
                    { color: "blue", style: { fontSize: 10 } },
                    St(E.category)
                  ) : null,
                  E.tags.includes("mcp") ? t.createElement(
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
              E.description
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
                E.tags.filter((G) => G !== "agent" && G !== "template" && G !== "workspace").slice(0, 3).join(" · ") || "人才模板"
              ),
              t.createElement(
                d,
                {
                  type: "primary",
                  size: "small",
                  icon: F ? t.createElement(F) : void 0
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
        $ ? t.createElement($, { style: { fontSize: 14 } }) : null,
        "MCP 市场"
      ),
      children: po
    },
    {
      key: "experts",
      label: t.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        F ? t.createElement(F, { style: { fontSize: 14 } }) : null,
        "人才市场"
      ),
      children: yo
    }
  ];
  return t.createElement(
    "div",
    { style: { padding: 24 } },
    e ? null : t.createElement(bn, {
      title: "市场",
      subtitle: "浏览技能市场 · 选择 MCP 服务器 · 人才市场 · 随时更新能力和专家",
      extra: t.createElement(
        "div",
        { style: { display: "flex", gap: 8 } },
        t.createElement(
          d,
          {
            type: "primary",
            icon: K ? t.createElement(K) : void 0,
            onClick: () => {
              Kt(X, ne, {}), Jt(), _n();
            },
            loading: Se || vr || zr || Br
          },
          "刷新"
        )
      )
    }),
    t.createElement(S, {
      items: ho,
      activeKey: M,
      onChange: (E) => le(E)
    }),
    // Skill source config modal
    t.createElement($s, {
      open: eo,
      onClose: () => wr(!1),
      sources: Ue,
      onChange: (E) => {
        Le(E), Jt(E);
      }
    }),
    // MCP source config modal
    t.createElement(ia, {
      open: no,
      onClose: () => xr(!1),
      sources: to,
      onChange: (E) => Sr(E),
      type: "mcp"
    }),
    // MCP token config modal (for templates requiring secrets)
    go,
    // Expert source config modal
    t.createElement(ia, {
      open: ao,
      onClose: () => Cr(!1),
      sources: ro,
      onChange: (E) => kr(E),
      type: "expert"
    }),
    // ── Agent Detail Modal (click card to view details, then create) ──
    Ve ? t.createElement(
      A,
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
            name: Ve.name,
            size: 40
          }),
          t.createElement(
            "div",
            null,
            t.createElement(
              ee,
              { strong: !0, style: { fontSize: 16 } },
              Ve.name
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
              Ve.category ? t.createElement(
                h,
                { color: "blue", style: { fontSize: 10 } },
                St(Ve.category)
              ) : null,
              ...Ve.tags.filter(
                (E) => E !== "agent" && E !== "template" && E !== "workspace"
              ).slice(0, 5).map(
                (E) => t.createElement(
                  h,
                  { key: E, style: { fontSize: 10 } },
                  E
                )
              )
            )
          )
        ),
        open: !0,
        onCancel: () => Vt(null),
        width: 640,
        footer: t.createElement(
          "div",
          { style: { textAlign: "right" } },
          t.createElement(
            d,
            {
              onClick: () => Vt(null),
              style: { marginRight: 8 }
            },
            "取消"
          ),
          t.createElement(
            d,
            {
              type: "primary",
              loading: Tn,
              disabled: Tn,
              icon: F ? t.createElement(F) : void 0,
              style: We,
              onClick: async () => {
                await uo(Ve), Vt(null);
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
          Ve.description
        )
      ),
      // Skills manifest hint
      Ve.skills_manifest ? t.createElement(
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
      Ve.instructions ? t.createElement(
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
      Ve.drivers && Object.keys(Ve.drivers).length > 0 ? t.createElement(
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
          ...Object.entries(Ve.drivers).map(
            ([E, G]) => t.createElement(
              h,
              { key: E, color: "cyan", style: { fontSize: 11 } },
              `${E}${G && G.length > 0 ? ` (${G.join(", ")})` : ""}`
            )
          )
        )
      ) : null
    ) : null
  );
}
function Ls() {
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
function Bs() {
  const e = k(), t = e.React, { useEffect: n, useRef: r } = t, a = e.useSelectedAgent ? e.useSelectedAgent() : { id: "default" }, l = (a == null ? void 0 : a.id) || "default", o = r(null), s = r(null);
  return n(() => {
    if (o.current === l) return;
    o.current = l, tr();
    const i = Ls(), c = da[i] || da.en, d = ua[i] || ua.en;
    let m = !1;
    return (async () => {
      var u, f;
      try {
        const w = await wn(l);
        if (m) return;
        const h = Ha(w);
        if (s.current) {
          try {
            s.current();
          } catch {
          }
          s.current = null;
        }
        const y = window.QwenPaw;
        (u = y == null ? void 0 : y.chat) != null && u.welcome && (h.length > 0 ? (s.current = y.chat.welcome.set("ugsci", {
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
        if ((f = h == null ? void 0 : h.chat) != null && f.welcome && !m) {
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
      m = !0;
    };
  }, [l]), null;
}
const Us = 256;
let He = {};
const qn = /* @__PURE__ */ new Set(), mn = () => qn.forEach((e) => e()), js = (e) => (qn.add(e), () => qn.delete(e)), jt = /* @__PURE__ */ new Map();
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
function fn(e) {
  return !e || typeof e != "object" ? null : e.ok === !0 && (e.kind === "genui" || e.kind === "genui_patch") ? e : e.genui && typeof e.genui == "object" ? fn(e.genui) : e.ui && typeof e.ui == "object" ? fn(e.ui.genui) : null;
}
function Ot(e) {
  if (!e || typeof e != "string") return null;
  try {
    const t = JSON.parse(e);
    if (Array.isArray(t)) {
      for (const n of t) {
        const r = (n == null ? void 0 : n.type) === "text" ? n.text : void 0, a = typeof r == "string" ? Ot(r) : fn(n);
        if (a) return a;
      }
      return null;
    }
    return fn(t);
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
const fa = /* @__PURE__ */ new Set(["plugin_call_output", "function_call_output", "tool_call_output", "mcp_call_output", "component_call_output"]), Rn = /* @__PURE__ */ new Set(["emit_ui_tree", "emit_ui_patch"]);
function bl(e) {
  var r, a, l, o;
  if (!Array.isArray(e)) return [];
  const t = [], n = (s, i = !1) => {
    var m, u, f;
    if (!s || typeof s != "object") return;
    if (Array.isArray(s)) {
      const w = i ? s.map((h) => {
        var y;
        return ((y = h == null ? void 0 : h.data) == null ? void 0 : y.name) ?? (h == null ? void 0 : h.name);
      }).filter((h) => !!h).map((h) => String(h)) : [];
      if (i && w.length) {
        const h = w.some((y) => Rn.has(y));
        for (const y of s) {
          const p = ((m = y == null ? void 0 : y.data) == null ? void 0 : m.output) ?? (y == null ? void 0 : y.output) ?? ((u = y == null ? void 0 : y.data) == null ? void 0 : u.result) ?? (y == null ? void 0 : y.result) ?? ((f = y == null ? void 0 : y.data) == null ? void 0 : f.content) ?? (y == null ? void 0 : y.content);
          if (p == null) continue;
          const b = typeof p == "string" ? p : JSON.stringify(p), v = Ot(b) || (h ? Mt(b) : null);
          v && t.push(v);
        }
      }
      s.forEach((h) => n(h));
      return;
    }
    const c = s;
    if (c.type === "tool_result") {
      const h = (Array.isArray(c.output) ? c.output : []).filter((b) => (b == null ? void 0 : b.type) === "text").map((b) => b.text), y = h.length ? h.join(`
`) : c.output, p = h.length ? h : [typeof y == "string" ? y : JSON.stringify(y)];
      for (const b of p) {
        const v = Ot(b) || (Rn.has(String(c.name || "")) ? Mt(b) : null);
        v && t.push(v);
      }
      return;
    }
    const d = fa.has(String(c.type || ""));
    Object.entries(c).forEach(
      ([w, h]) => n(h, d && w === "content")
    );
  };
  n(e);
  for (const s of e) {
    if (!s || typeof s != "object") continue;
    const i = s;
    if (!fa.has(String(i.type || "")) || !Array.isArray(i.content)) continue;
    const c = i.content, d = (a = (r = c[0]) == null ? void 0 : r.data) == null ? void 0 : a.name;
    if (!d) continue;
    const m = (o = (l = c[1]) == null ? void 0 : l.data) == null ? void 0 : o.output;
    if (m == null) continue;
    const u = typeof m == "string" ? m : JSON.stringify(m), f = Ot(u) || (Rn.has(String(d)) ? Mt(u) : null);
    f && t.push(f);
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
  He = Object.fromEntries(l.slice(0, Us)), mn();
}
function Ns(e, t) {
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
    const a = (c = window.QwenPaw) == null ? void 0 : c.host, l = r || ((d = a == null ? void 0 : a.getCurrentSessionId) == null ? void 0 : d.call(a)) || "", o = xt(l, e.ui_id), s = He[o] || Object.values(He).find((m) => m.uiId === e.ui_id);
    if (!s || n <= s.revision) return;
    He = { ...Object.fromEntries(Object.entries(He).filter(([, m]) => m.uiId !== e.ui_id)), [o]: { ...s, sessionId: l, tree: t, revision: n, updatedAt: Date.now() } }, mn();
  },
  getSnapshot: (e, t) => He[xt(e, t)],
  clearSession(e) {
    He = Object.fromEntries(Object.entries(He).filter(([, t]) => t.sessionId !== e));
    for (const t of [...jt.keys()])
      t.startsWith(`${e}::`) && jt.delete(t);
    mn();
  },
  hydrateFromMessages: Ns
};
function Ds({ children: e }) {
  return e;
}
function Fs() {
  return wl;
}
function Gs(e, t) {
  var l, o;
  const n = (o = (l = window.QwenPaw) == null ? void 0 : l.host) == null ? void 0 : o.React;
  if (!n) throw new Error("useGenUiSnapshots: host React not available");
  const r = t.join("\0"), a = r === "" ? [] : r.split("\0");
  return n.useSyncExternalStore(
    js,
    () => ma(e, a),
    () => ma(e, a)
  );
}
function Hs(e) {
  wl.clearSession(e);
}
function Ws() {
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
function pa(e) {
  var f, w, h, y;
  const t = (f = window.QwenPaw) == null ? void 0 : f.host, n = t == null ? void 0 : t.React;
  if (!n) return null;
  const { resultText: r, status: a, toolName: l } = qs(e), o = a === "in_progress" || a === "calling", s = a === "failed" || a === "error", i = Ot(r), c = i ? null : Mt(r);
  let d = 0;
  (w = i == null ? void 0 : i.tree) != null && w.root && (d = Sl(i.tree.root));
  const m = l === "emit_ui_patch" || (i == null ? void 0 : i.kind) === "genui_patch", u = o ? m ? "📝 Patching UI Tree..." : "🎨 Generating UI Tree..." : s ? m ? "📝 UI Patch Error" : "🎨 UI Tree Error" : i ? m ? `📝 UI Patched (rev ${i.revision ?? "?"})` : `🎨 UI Tree (${d} nodes)` : m ? "📝 UI Patch" : "🎨 UI Tree";
  return n.createElement(
    "details",
    { open: o || s, style: { margin: "4px 0", border: "1px solid var(--ant-color-border, #d9d9d9)", borderRadius: 8, padding: "4px 8px", fontSize: 13 } },
    n.createElement(
      "summary",
      { style: { cursor: "pointer", display: "flex", alignItems: "center", gap: 6 } },
      n.createElement("span", null, m ? "📝" : "🎨"),
      n.createElement("span", null, u),
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
function Vs(e) {
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
  const { resultText: r, status: a, toolName: l } = Vs(e), o = l === "get_genui_guide", s = a === "in_progress" || a === "calling";
  let i = o ? "GenUI 指南" : "组件目录", c = r;
  try {
    const m = r ? JSON.parse(r) : null;
    if (m && typeof m == "object") {
      const u = m.components;
      Array.isArray(u) ? (i = `组件目录（${u.length} 个 kind）`, c = u.map((f) => f == null ? void 0 : f.kind).filter(Boolean).join(" · ")) : (m.purpose || m.layout_structure) && (i = "GenUI 指南", c = String(m.purpose || "布局与语法说明已返回，模型可按此编写 emit_ui_tree。"));
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
const Js = /* @__PURE__ */ new Set(["send_message"]), ya = 1e4, Ks = 500, ha = {};
function Xs() {
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
  return new Set(Js);
}
function Ys(e) {
  const t = Date.now(), n = ha[e] || 0;
  return t - n < Ks ? (console.warn("[ugsci.genui] Action '" + e + "' throttled"), !0) : (ha[e] = t, !1);
}
function Qs(e, t) {
  return e.replace(/\{\{\s*([\w.-]+)\s*\}\}/g, (n, r) => {
    const a = t[r];
    return a == null ? "" : typeof a == "string" ? a : JSON.stringify(a);
  });
}
function Vn(e, t = {}) {
  var l, o, s, i, c, d, m;
  let n;
  if (typeof e == "string") n = { type: e };
  else if (e && typeof e == "object") n = e;
  else return { ok: !1, message: "无效操作" };
  const r = n.type === "submit_form" ? "send_message" : n.type, a = Xs();
  if (!a.has(r))
    return console.warn(
      "[ugsci.genui] Action '" + n.type + "' not allowed (allowed: " + Array.from(a).join(", ") + ")"
    ), { ok: !1, message: "此操作未获允许" };
  if (Ys(r)) return { ok: !1, message: "操作过于频繁，请稍后重试" };
  if (r === "send_message") {
    const u = t.formValues || {};
    let f = ((l = n.payload) == null ? void 0 : l.content) || ((o = n.payload) == null ? void 0 : o.message) || "";
    const w = /\{\{\s*[\w.-]+\s*\}\}/.test(f);
    return f = Qs(f, u).trim(), f && !w && Object.keys(u).length > 0 && (f += `
${Object.entries(u).map(([y, p]) => `${y}: ${typeof p == "string" ? p : JSON.stringify(p)}`).join(`
`)}`), !f && Object.keys(u).length > 0 && (f = `${t.formId ? `提交表单 ${t.formId}` : "提交表单"}
${Object.entries(u).map(([p, b]) => `${p}: ${typeof b == "string" ? b : JSON.stringify(b)}`).join(`
`)}`), !f || !f.trim() ? (console.warn("[ugsci.genui] send_message: content is empty"), { ok: !1, message: "消息内容为空" }) : f.length > ya ? (console.warn("[ugsci.genui] send_message: content length " + f.length + " exceeds max " + ya), { ok: !1, message: "消息内容过长" }) : !((c = (i = (s = window.QwenPaw) == null ? void 0 : s.chat) == null ? void 0 : i.sendMessage) != null && c.call(i, f)) ? (console.info("[ugsci.genui] send_message: could not find chat sender, content:", f), { ok: !1, message: "当前无法发送消息" }) : { ok: !0, message: "已提交" };
  }
  if (r === "open_url") {
    const u = ((d = n.payload) == null ? void 0 : d.url) || ((m = n.payload) == null ? void 0 : m.href) || "", f = typeof u == "string" ? u.trim() : "";
    return /^https?:\/\//i.test(f) ? (window.open(f, "_blank", "noopener,noreferrer"), { ok: !0, message: "已打开链接" }) : (console.warn("[ugsci.genui] open_url: only http(s) URLs are allowed"), { ok: !1, message: "仅允许 http(s) 链接" });
  }
  return { ok: !1, message: "尚未实现此操作" };
}
const Qe = /* @__PURE__ */ new Map(), Nt = /* @__PURE__ */ new Map(), Zs = 128, nn = /* @__PURE__ */ new Map();
function pn(e) {
  return e.startsWith("http://") || e.startsWith("https://") || e.startsWith("data:") || e.startsWith("blob:");
}
function ec(e) {
  return e ? !!(e.startsWith("/") || /^[A-Za-z]:[\\/]/.test(e) || e.startsWith("\\\\")) : !1;
}
function tc(e) {
  return e.startsWith("workspace://");
}
function nc(e) {
  return tc(e) ? e.slice(12) : e;
}
async function rc(e) {
  if (!e) return null;
  if (pn(e)) return e;
  if (Qe.has(e))
    return Qe.get(e) ?? null;
  if (nn.has(e))
    return nn.get(e);
  const t = ac(e);
  nn.set(e, t);
  try {
    const n = await t;
    if (!Qe.has(e) && Qe.size >= Zs) {
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
async function ac(e) {
  const t = window.QwenPaw, n = t == null ? void 0 : t.host;
  if (!n) {
    const a = "宿主媒体 API 不可用。请在 QwenPaw 工作区中打开此内容，或改用 http(s)、data、blob URL。";
    return Nt.set(e, a), console.warn("[ugsci.genui]", a), null;
  }
  const r = nc(e);
  if (typeof n.resolveWorkspaceBlob == "function")
    try {
      const a = await n.resolveWorkspaceBlob(r);
      if (a) return a;
    } catch (a) {
      console.warn("[ugsci.genui] host.resolveWorkspaceBlob failed:", a);
    }
  try {
    return await lc(r, n);
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
async function lc(e, t) {
  let n = null;
  const r = t == null ? void 0 : t.workspaceApi, a = t == null ? void 0 : t.chatApi;
  if (ec(e) && (a != null && a.filePreviewUrl) ? n = a.filePreviewUrl(e) : r != null && r.getBinaryFileUrl && (n = r.getBinaryFileUrl(e)), !n)
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
  return e ? pn(e) ? e : Qe.get(e) ?? null : null;
}
function ba(e) {
  return Nt.get(e) ?? null;
}
function oc() {
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
], yt = ["#1677ff", "#52c41a", "#faad14", "#ff4d4f", "#722ed1", "#13c2c2", "#eb2f96"], ic = /* @__PURE__ */ new Set([
  "Button",
  "InteractiveButton",
  "ToggleButton",
  "LinkButton"
]);
function be(e) {
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
  const t = e.props || {}, n = be(t.name);
  if (n) return n;
  const r = be(t.label), a = r.match(/^\s*([a-e])(?:\b|\s|（|\()/i);
  return a ? a[1].toLowerCase() : r || be(e.nodeId);
}
function kl(e) {
  return xl.includes(e);
}
function Cl(e) {
  return Math.min(Math.max(Xe(e) || 2, 1), 4);
}
function sc(e, t, n = 6) {
  const r = Xe(e);
  return Math.min(Math.max(r > 0 ? r : t, 1), n);
}
function cc(e) {
  const n = (be(e) || "16:9").split(":"), r = Number(n[0]), a = Number(n[1]);
  return r > 0 && a > 0 ? `${r} / ${a}` : "16 / 9";
}
function dc(e) {
  return /^https?:\/\//i.test(be(e).trim());
}
function Ke(e, t) {
  const n = {}, r = `${Xe(t.gap) || 12}px`;
  if (e === "Stack")
    n.display = "flex", n.flexDirection = "column", n.gap = r, t.padding != null && (n.padding = `${Xe(t.padding)}px`);
  else if (e === "Row")
    n.display = "flex", n.flexDirection = "row", n.gap = r, t.align && (n.alignItems = be(t.align)), t.justify && (n.justifyContent = be(t.justify));
  else if (e === "Grid" || e === "FeatureGrid" || e === "KpiBoard" || e === "ImageGallery") {
    const a = e === "KpiBoard" ? 3 : e === "FeatureGrid" ? 2 : e === "ImageGallery" ? 3 : 2, l = e === "FeatureGrid" ? 4 : 6;
    n.display = "grid", n.gridTemplateColumns = `repeat(${sc(t.columns, a, l)}, minmax(0, 1fr))`, n.gap = e === "ImageGallery" ? `${Xe(t.gap) || 8}px` : r;
  } else e === "ScrollArea" ? (n.maxHeight = `${Xe(t.maxHeight) || 300}px`, n.overflowY = "auto", t.padding != null && (n.padding = `${Xe(t.padding)}px`)) : e === "AspectBox" ? (n.aspectRatio = cc(t.ratio), n.overflow = "hidden", n.borderRadius = "8px", n.display = "flex", n.justifyContent = "center", n.alignItems = "center") : e === "Spacer" && (n.height = `${Xe(t.size) || 16}px`);
  return n;
}
function ur(e, t) {
  function n(m) {
    return typeof m == "string" ? m : m == null ? "" : String(m);
  }
  function r(m) {
    if (typeof m == "number" && Number.isFinite(m)) return m;
    if (typeof m == "string") {
      const u = Number(m);
      return Number.isFinite(u) ? u : 0;
    }
    return 0;
  }
  function a(m) {
    return Array.isArray(m) ? m : [];
  }
  const l = e.generator && typeof e.generator == "object" ? e.generator : {}, o = a(l.coefficients).map(n).filter(Boolean), s = n(l.type) === "polynomial" || o.length > 0;
  let i = a(e.categories).map(n), c = a(e.series);
  if (s && t) {
    const m = o.length > 0 ? o : ["a", "b", "c", "d", "e"], u = typeof l.xMin == "number" ? l.xMin : -3, f = typeof l.xMax == "number" ? l.xMax : 3, w = Math.min(Math.max(r(l.samples) || 61, 10), 400), h = Array.from({ length: w }, (p, b) => u + (f - u) * b / Math.max(w - 1, 1)), y = m.map((p) => r(t[p]));
    i = h.map((p) => Number(p.toFixed(2)).toString()), c = [{
      name: n(l.label) || "f(x)",
      values: h.map((p) => y.reduce((b, v, g) => b + v * Math.pow(p, y.length - g - 1), 0))
    }];
  }
  const d = c.map((m, u) => {
    const f = m && typeof m == "object" ? m : {};
    return {
      name: n(f.name) || `Series ${u + 1}`,
      values: a(f.values).map(r)
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
    const f = document.createElement("div");
    f.className = "chart-title", f.textContent = t.title, e.appendChild(f);
  }
  if (t.empty) {
    const f = document.createElement("div");
    f.className = "muted", f.textContent = "Chart: no data", e.appendChild(f);
    return;
  }
  const a = t.height || 240, l = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  if (l.setAttribute("viewBox", `0 0 ${n} ${a}`), l.setAttribute("role", "img"), l.setAttribute("aria-label", t.title || "Chart"), t.chartType === "pie") {
    const f = t.series[0].values.map((v) => Math.abs(v)), w = f.reduce((v, g) => v + g, 0) || 1, h = n / 2, y = a / 2, p = Math.min(n, a) / 2 - 20;
    let b = -Math.PI / 2;
    if (f.forEach((v, g) => {
      const S = v / w * Math.PI * 2, O = h + p * Math.cos(b), W = y + p * Math.sin(b), A = h + p * Math.cos(b + S), I = y + p * Math.sin(b + S), K = document.createElementNS(l.namespaceURI, "path");
      K.setAttribute("d", `M ${h} ${y} L ${O} ${W} A ${p} ${p} 0 ${S > Math.PI ? 1 : 0} 1 ${A} ${I} Z`), K.setAttribute("fill", r[g % r.length]), l.appendChild(K), b += S;
    }), e.appendChild(l), t.showLegend) {
      const v = document.createElement("div");
      v.className = "legend", f.forEach((g, S) => {
        const O = document.createElement("span"), W = document.createElement("i");
        W.style.background = r[S % r.length], O.append(W, document.createTextNode(`${t.categories[S] || `#${S + 1}`}: ${g}`)), v.appendChild(O);
      }), e.appendChild(v);
    }
    return;
  }
  const o = t.series.flatMap((f) => f.values), s = Math.max(...o, 0), i = Math.min(...o, 0), c = s - i || 1, d = (f) => a - 24 - (f - i) / c * (a - 44), m = (f) => 30 + f * (n - 50) / Math.max(t.categories.length - 1, 1), u = document.createElementNS(l.namespaceURI, "line");
  if (u.setAttribute("x1", "30"), u.setAttribute("x2", String(n - 15)), u.setAttribute("y1", String(d(0))), u.setAttribute("y2", String(d(0))), u.setAttribute("stroke", "#d9d9d9"), l.appendChild(u), t.series.forEach((f, w) => {
    const h = r[w % r.length];
    if (t.chartType === "bar") {
      const b = (n - 50) / Math.max(t.categories.length, 1), v = Math.max(1, b / t.series.length - 3);
      f.values.forEach((g, S) => {
        const O = document.createElementNS(l.namespaceURI, "rect"), W = Math.min(d(g), d(0)), A = Math.max(d(g), d(0));
        O.setAttribute("x", String(30 + S * b + w * (v + 2))), O.setAttribute("y", String(W)), O.setAttribute("width", String(v)), O.setAttribute("height", String(Math.max(1, A - W))), O.setAttribute("fill", h), l.appendChild(O);
      });
      return;
    }
    const y = f.values.map((b, v) => `${m(v)},${d(b)}`).join(" "), p = document.createElementNS(l.namespaceURI, "polyline");
    p.setAttribute("points", y), p.setAttribute("fill", t.chartType === "area" ? `${h}22` : "none"), p.setAttribute("stroke", h), p.setAttribute("stroke-width", "2"), l.appendChild(p);
  }), e.appendChild(l), t.showLegend) {
    const f = document.createElement("div");
    f.className = "legend", t.series.forEach((w, h) => {
      const y = document.createElement("span"), p = document.createElement("i");
      p.style.background = r[h % r.length], y.append(p, document.createTextNode(w.name)), f.appendChild(y);
    }), e.appendChild(f);
  }
}
const uc = {
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
}, mc = {
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
  const t = be(e).trim();
  if (!t) return { kind: "empty" };
  const n = t.toLowerCase().replace(/\s+/g, "-"), r = mc[n];
  return r ? { kind: "svg", paths: uc[r] } : /^[\w.-]+$/.test(t) ? { kind: "empty" } : t.length <= 8 ? { kind: "emoji", text: t.slice(0, 8) } : { kind: "empty" };
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
let On = null;
function xn(e) {
  return On || (On = e.createContext(null)), On;
}
function Il(e, t = {}) {
  if (kl(e.kind)) {
    const n = e.props || {}, r = n.value ?? n.checked;
    r !== void 0 && (t[Dt(e)] = r);
  }
  for (const n of e.children || []) Il(n, t);
  return t;
}
function pc({
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
      setValue: (d, m) => o((u) => ({ ...u, [d]: m }))
    }),
    [l]
  );
  return r.createElement(
    xn(r).Provider,
    { value: s },
    t
  );
}
const Q = (e) => typeof e == "string" ? e : e != null ? String(e) : "", lt = (e) => typeof e == "number" ? e : typeof e == "string" && Number(e) || 0, ot = (e) => !!e, Pt = (e) => Array.isArray(e) ? e : [], gc = (e, t) => {
  const n = Object.keys(e), r = Object.keys(t);
  return n.length === r.length && n.every((a) => Object.is(e[a], t[a]));
}, va = { xs: "12px", sm: "13px", base: "14px", lg: "16px" }, Te = {
  muted: "var(--ant-color-text-secondary, #8c8c8c)",
  default: "var(--ant-color-text, #000000d9)",
  primary: "var(--ant-color-primary, #1677ff)",
  success: "var(--ant-color-success, #52c41a)",
  warning: "var(--ant-color-warning, #faad14)",
  error: "var(--ant-color-error, #ff4d4f)"
}, yc = new Set(xl);
function hc(e) {
  const t = [], n = (r) => {
    yc.has(r.kind) && t.push(r);
    for (const a of r.children || []) n(a);
  };
  for (const r of e.children || []) n(r);
  return t;
}
let Mn = null;
function mr(e) {
  return Mn || (Mn = e.createContext(null)), Mn;
}
function Ec({ node: e }) {
  var w;
  const t = (w = window.QwenPaw) == null ? void 0 : w.host, n = t == null ? void 0 : t.React, r = (t == null ? void 0 : t.antd) || {};
  if (!n) return null;
  const a = e.props || {}, l = n.useContext(xn(n)), [o, s] = n.useState({}), [i, c] = n.useState(null), d = n.useMemo(
    () => hc(e),
    [e]
  ), m = n.useMemo(() => {
    const h = {};
    for (const y of d) {
      const p = y.props || {}, b = Dt(y);
      p.value !== void 0 ? h[b] = p.value : p.checked !== void 0 && (h[b] = p.checked);
    }
    return h;
  }, [d]);
  n.useEffect(() => s((h) => {
    const y = { ...m, ...h, ...(l == null ? void 0 : l.values) || {} };
    return gc(h, y) ? h : y;
  }), [m, l == null ? void 0 : l.values]);
  const u = n.useMemo(() => ({ values: o, setValue: (h, y) => {
    c(null), s((p) => ({ ...p, [h]: y })), l == null || l.setValue(h, y);
  } }), [o, l]), f = () => {
    var p, b;
    const h = d.filter((v) => {
      var g;
      return (g = v.props) == null ? void 0 : g.required;
    }).find((v) => {
      const g = Dt(v), S = o[g];
      return S == null || S === "" || Array.isArray(S) && S.length === 0;
    });
    if (h) {
      c({ ok: !1, message: `${Q((p = h.props) == null ? void 0 : p.label) || Q((b = h.props) == null ? void 0 : b.name) || "必填项"}不能为空` });
      return;
    }
    const y = a.action && typeof a.action == "object" ? a.action : { type: "submit_form", payload: {} };
    c(Vn(y, { formValues: o, formId: Q(a.formId) || e.nodeId }));
  };
  return n.createElement(
    mr(n).Provider,
    { value: u },
    n.createElement(
      "div",
      { style: { margin: "4px 0" } },
      a.title ? n.createElement("div", { style: { fontWeight: 600, marginBottom: 8 } }, Q(a.title)) : null,
      ...(e.children || []).map((h, y) => n.createElement(Ft(n), { key: h.nodeId || y, node: h })),
      n.createElement(r.Button || "button", { type: "primary", size: "small", style: { marginTop: 8 }, onClick: f }, Q(a.submitLabel) || "提交"),
      i ? n.createElement("div", { role: "status", style: { marginTop: 6, fontSize: 12, color: i.ok ? Te.success : Te.error } }, i.message) : null
    )
  );
}
function bc({ node: e, fieldType: t }) {
  var p, b, v;
  const n = (p = window.QwenPaw) == null ? void 0 : p.host, r = n == null ? void 0 : n.React, a = (n == null ? void 0 : n.antd) || {};
  if (!r) return null;
  const l = e.props || {}, o = r.useContext(mr(r)), s = r.useContext(xn(r)), i = o || s, [c, d] = r.useState(l.value ?? l.checked ?? ""), m = Dt(e), u = l.value ?? l.checked ?? "", f = i ? ((b = i.values) == null ? void 0 : b[m]) ?? u : c, w = (g) => {
    const S = g != null && g.target ? t === "Switch" ? g.target.checked : g.target.value : g;
    i ? i.setValue(m, S) : d(S);
  }, h = (g) => r.createElement(
    "div",
    { style: { display: "flex", flexDirection: "column", gap: 4, margin: "4px 0" } },
    l.label && t !== "Switch" ? r.createElement("label", { style: { fontSize: 12, color: Te.muted } }, Q(l.label), l.required ? r.createElement("span", { style: { color: Te.error } }, " *") : null) : null,
    g,
    l.description ? r.createElement("span", { style: { fontSize: 11, color: Te.muted } }, Q(l.description)) : null
  ), y = Q(l.label) || Q(l.placeholder) || m;
  return t === "Input" ? h(r.createElement(a.Input || "input", { "aria-label": y, placeholder: Q(l.placeholder), value: f, onChange: w, size: "small" })) : t === "NumberInput" ? h(r.createElement(a.InputNumber || "input", { "aria-label": y, value: f, min: l.min, max: l.max, step: l.step, onChange: w, size: "small", style: { width: "100%" } })) : t === "Textarea" ? h(r.createElement(((v = a.Input) == null ? void 0 : v.TextArea) || "textarea", { "aria-label": y, placeholder: Q(l.placeholder), value: f, rows: lt(l.rows) || 3, onChange: w, style: { width: "100%" } })) : t === "Select" ? h(r.createElement(a.Select || "select", { "aria-label": y, placeholder: Q(l.placeholder), value: f || void 0, onChange: w, size: "small", style: { width: "100%" } }, Pt(l.options).map((g, S) => {
    var O;
    return r.createElement(((O = a.Select) == null ? void 0 : O.Option) || "option", { key: S, value: Q(typeof g == "object" ? g.value : g) }, Q(typeof g == "object" ? g.label : g));
  }))) : t === "Switch" ? r.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8 } }, r.createElement(a.Switch || "input", { type: "checkbox", checked: !!f, onChange: w, size: "small" }), r.createElement("span", null, Q(l.label))) : t === "Slider" ? h(r.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8 } }, r.createElement(a.Slider || "input", { type: "range", value: lt(f), min: l.min ?? 0, max: l.max ?? 100, step: l.step ?? 1, onChange: w, style: { flex: 1 } }), r.createElement("span", { style: { minWidth: 32, fontSize: 12 } }, Q(f)))) : t === "FileInput" ? r.createElement(
    "label",
    { style: { display: "inline-flex", alignItems: "center", gap: 8, cursor: "pointer" } },
    r.createElement("span", null, Q(l.label) || "选择文件"),
    r.createElement("input", { type: "file", multiple: ot(l.multiple), accept: Q(l.accept) || void 0, onChange: (g) => i == null ? void 0 : i.setValue(m, Array.from(g.target.files || []).map((S) => ({ name: S.name, size: S.size, type: S.type }))) })
  ) : null;
}
function Ln({ node: e, link: t = !1, toggle: n = !1 }) {
  var f;
  const r = (f = window.QwenPaw) == null ? void 0 : f.host, a = r == null ? void 0 : r.React, l = (r == null ? void 0 : r.antd) || {};
  if (!a) return null;
  const o = e.props || {}, s = a.useContext(mr(a)), [i, c] = a.useState(ot(o.checked)), [d, m] = a.useState(null), u = () => {
    n && c((w) => !w), o.action && typeof o.action == "object" ? m(Vn(o.action, { formValues: s == null ? void 0 : s.values, formId: s ? "form" : void 0 })) : t && typeof o.href == "string" && m(Vn({ type: "open_url", payload: { url: o.href } }));
  };
  return a.createElement(
    "span",
    { style: { display: "inline-flex", flexDirection: "column", gap: 3 } },
    a.createElement(l.Button || "button", { type: t ? "link" : (n ? i : Q(o.variant) === "primary") ? "primary" : "default", size: "small", disabled: ot(o.disabled), loading: ot(o.loading), onClick: u }, Q(o.label) || "Action"),
    d ? a.createElement("span", { role: "status", style: { fontSize: 11, color: d.ok ? Te.success : Te.error } }, d.message) : null
  );
}
let wa = null, rn = null;
function vc(e) {
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
function wc({ node: e }) {
  var i;
  const t = (i = window.QwenPaw) == null ? void 0 : i.host;
  if (!(t != null && t.React)) return null;
  const n = t.React, r = t.antd || {}, a = Ft(n), l = e.props || {}, o = e.children || [];
  return xc(n, r, e, l, o, () => o.map(
    (c, d) => n.createElement(a, { key: c.nodeId || d, node: c })
  ));
}
let an = null, Sa = null;
function Ft(e) {
  return an && Sa === e || (an = e.memo(wc, (t, n) => t.node === n.node), Sa = e), an;
}
function Sc({ node: e }) {
  var r;
  const t = (r = window.QwenPaw) == null ? void 0 : r.host;
  if (!(t != null && t.React)) return null;
  const n = t.React;
  return n.createElement(
    vc(n),
    { node: e },
    n.createElement(Ft(n), { node: e })
  );
}
function xc(e, t, n, r, a, l) {
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
      return e.createElement("div", { style: { fontSize: va[Q(r.size)] || va.base, color: Te[Q(r.color)] || Te.default, fontWeight: ot(r.bold) ? "bold" : "normal", lineHeight: 1.6 } }, Q(r.value));
    case "Heading": {
      const i = Cl(r.level), c = { 1: "24px", 2: "20px", 3: "18px", 4: "16px" };
      return e.createElement(`h${i}`, { style: { fontSize: c[i], fontWeight: "bold", margin: "4px 0" } }, Q(r.value));
    }
    case "Divider":
      return e.createElement(t.Divider || "hr", r.label ? { children: Q(r.label) } : {});
    case "Markdown": {
      const i = (o = window.QwenPaw) == null ? void 0 : o.host, c = i == null ? void 0 : i.ReactMarkdown;
      if (c) {
        const d = i != null && i.remarkGfm ? [i.remarkGfm] : [];
        return e.createElement(
          "div",
          { className: "qwenpaw-genui-markdown" },
          e.createElement(c, { children: Q(r.content || r.value), remarkPlugins: d })
        );
      }
      return e.createElement("div", { style: { whiteSpace: "pre-wrap", lineHeight: 1.6 } }, Q(r.content || r.value));
    }
    case "CodeBlock":
      return e.createElement("pre", { style: { padding: 12, background: "var(--ant-color-fill-tertiary, rgba(0,0,0,0.04))", borderRadius: 8, overflow: "auto", fontSize: 13, fontFamily: "monospace" } }, Q(r.code));
    case "SectionHeader":
      return e.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8, marginBottom: 8 } }, r.icon ? e.createElement("span", { style: { fontSize: 20 } }, Q(r.icon)) : null, e.createElement("div", null, e.createElement("div", { style: { fontSize: 16, fontWeight: 600 } }, Q(r.title)), r.subtitle ? e.createElement("div", { style: { fontSize: 12, color: Te.muted } }, Q(r.subtitle)) : null));
    case "KeyValueList": {
      const i = Pt(r.items);
      return e.createElement(
        "div",
        { style: { display: "flex", flexDirection: "column", gap: 4 } },
        ...i.map((c, d) => e.createElement(
          "div",
          { key: d, style: { display: "flex", justifyContent: "space-between", padding: "2px 0", borderBottom: d < i.length - 1 ? "1px solid var(--ant-color-border-secondary, #f0f0f0)" : "none" } },
          e.createElement("span", { style: { color: Te.muted, fontSize: 13 } }, Q(c.key)),
          e.createElement("span", { style: { fontWeight: 500, fontSize: 13 } }, Q(c.value))
        ))
      );
    }
    case "Badge":
      return e.createElement(t.Tag || "span", { color: Q(r.variant) || "default", children: Q(r.value) });
    case "Tag":
      return e.createElement(t.Tag || "span", { color: Q(r.color) || "default", children: Q(r.label) });
    case "Stat":
      return e.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 2 } }, e.createElement("span", { style: { fontSize: 12, color: Te.muted } }, Q(r.label)), e.createElement("span", { style: { fontSize: 20, fontWeight: "bold" } }, Q(r.value)), r.delta ? e.createElement("span", { style: { fontSize: 12, color: Q(r.trend) === "up" ? Te.success : Q(r.trend) === "down" ? Te.error : Te.muted } }, Q(r.delta)) : null);
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
      return e.createElement(Cc, {
        src: Q(r.src),
        name: Q(r.name),
        size: lt(r.size) || 32
      });
    case "Icon": {
      const i = _l(r.name), c = lt(r.size) || 16, d = Te[Q(r.color)] || Te.default;
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
      }, ...i.paths.map((m, u) => e.createElement("path", { key: u, d: m }))) : e.createElement("span", { "aria-hidden": !0, style: { width: c, height: c, display: "inline-block" } });
    }
    case "Card":
      return e.createElement(t.Card || "div", { title: r.title ? Q(r.title) : void 0, size: "small", style: { margin: "4px 0" } }, l());
    case "DataCard":
      return e.createElement(t.Card || "div", { size: "small", style: { margin: "4px 0" } }, e.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center" } }, e.createElement("div", null, e.createElement("div", { style: { fontSize: 12, color: Te.muted } }, Q(r.title)), e.createElement("div", { style: { fontSize: 24, fontWeight: "bold" } }, Q(r.value))), r.icon ? e.createElement("span", { style: { fontSize: 32 } }, Q(r.icon)) : null));
    case "MetricCard":
      return e.createElement(t.Card || "div", { size: "small", style: { margin: "4px 0" } }, e.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center" } }, e.createElement("div", null, e.createElement("div", { style: { fontSize: 12, color: Te.muted } }, Q(r.title)), e.createElement("div", { style: { fontSize: 24, fontWeight: "bold" } }, Q(r.value)), r.delta ? e.createElement("span", { style: { fontSize: 12, color: Q(r.trend) === "up" ? Te.success : Q(r.trend) === "down" ? Te.error : Te.muted } }, `${Q(r.delta)} ${r.period ? Q(r.period) : ""}`.trim()) : null), r.icon ? e.createElement("span", { style: { fontSize: 32 } }, Q(r.icon)) : null));
    case "AlertCard":
    case "Alert":
      return e.createElement(t.Alert || "div", { type: Q(r.severity) === "success" ? "success" : Q(r.severity) === "warning" ? "warning" : Q(r.severity) === "error" ? "error" : "info", message: r.title ? Q(r.title) : void 0, description: Q(r.message), showIcon: !0, style: { margin: "4px 0" } });
    case "Callout":
      return e.createElement(t.Alert || "div", { type: Q(r.variant) === "tip" ? "success" : Q(r.variant) === "warning" ? "warning" : Q(r.variant) === "important" ? "error" : "info", message: r.title ? Q(r.title) : void 0, description: Q(r.message), showIcon: !0 });
    case "TimelineCard":
      return e.createElement(t.Card || "div", { size: "small", style: { margin: "4px 0" } }, e.createElement("div", { style: { display: "flex", gap: 8, alignItems: "flex-start" } }, e.createElement("div", { style: { width: 8, height: 8, borderRadius: "50%", background: Q(r.status) === "done" ? Te.success : Q(r.status) === "pending" ? Te.warning : Te.primary, marginTop: 4, flexShrink: 0 } }), e.createElement("div", null, e.createElement("div", { style: { fontWeight: 600 } }, Q(r.title)), r.date ? e.createElement("div", { style: { fontSize: 12, color: Te.muted } }, Q(r.date)) : null, r.description ? e.createElement("div", { style: { fontSize: 13, marginTop: 4 } }, Q(r.description)) : null)));
    case "KpiBoard":
      return e.createElement("div", { style: { margin: "4px 0" } }, r.title ? e.createElement("div", { style: { fontSize: 16, fontWeight: 600, marginBottom: 8 } }, Q(r.title)) : null, e.createElement("div", { style: Ke("KpiBoard", r) }, l()));
    case "FeatureGrid":
      return e.createElement("div", { style: { ...Ke("FeatureGrid", r), margin: "4px 0" } }, l());
    case "Stepper": {
      const i = Pt(r.steps).map((d) => Q(d)), c = lt(r.current);
      return e.createElement(
        t.Steps || "div",
        { current: c, size: "small", style: { margin: "4px 0" } },
        ...i.map((d, m) => {
          var u;
          return e.createElement(((u = t.Steps) == null ? void 0 : u.Item) || "div", { key: m, title: d });
        })
      );
    }
    case "Table": {
      const i = Pt(r.headers).map((u) => Q(u)), d = a.filter((u) => u.kind === "TableRow").map((u, f) => {
        const w = (u.children || []).filter((y) => y.kind === "TableCell"), h = { key: f };
        return i.forEach((y, p) => {
          var v, g;
          const b = (g = (v = w[p]) == null ? void 0 : v.props) == null ? void 0 : g.value;
          h[y] = b == null ? "" : Q(b);
        }), h;
      }), m = i.map((u) => ({ title: u, dataIndex: u, key: u }));
      return e.createElement(t.Table || "table", { dataSource: d, columns: m, size: ot(r.compact) ? "small" : "middle", pagination: !1, style: { margin: "4px 0" } });
    }
    case "List": {
      const i = a.filter((c) => c.kind === "ListItem");
      return e.createElement(
        t.List || "ul",
        { size: "small", style: { margin: "4px 0" } },
        i.map((c, d) => {
          var m, u, f;
          return e.createElement(((m = t.List) == null ? void 0 : m.Item) || "li", { key: d }, (u = c.props) != null && u.icon ? e.createElement("span", { style: { marginRight: 6 } }, Q(c.props.icon)) : null, Q((f = c.props) == null ? void 0 : f.value));
        })
      );
    }
    case "ImageGallery": {
      const i = a.filter((c) => c.kind === "Image");
      return e.createElement(
        "div",
        { style: { ...Ke("ImageGallery", r), margin: "4px 0" } },
        ...i.map((c, d) => {
          const m = c.props || {};
          return e.createElement(Jn, { key: d, src: Q(m.src), alt: Q(m.alt), style: { width: "100%", height: 120, objectFit: "cover", borderRadius: 8, cursor: "pointer" } });
        })
      );
    }
    case "Image":
      return e.createElement("div", null, e.createElement(Jn, { src: Q(r.src), alt: Q(r.alt), style: { maxWidth: "100%", borderRadius: ot(r.rounded) ? "8px" : void 0, maxHeight: r.maxHeight ? `${lt(r.maxHeight)}px` : void 0 } }), r.caption ? e.createElement("div", { style: { fontSize: 12, color: Te.muted } }, Q(r.caption)) : null);
    case "Chart":
      return e.createElement(kc, { props: r });
    case "Button":
    case "InteractiveButton":
      return e.createElement(Ln, { node: n });
    case "ToggleButton":
      return e.createElement(Ln, { node: n, toggle: !0 });
    case "LinkButton":
      return e.createElement(Ln, { node: n, link: !0 });
    case "Input":
    case "NumberInput":
    case "Select":
    case "Textarea":
    case "Switch":
    case "Slider":
    case "FileInput":
      return e.createElement(bc, { node: n, fieldType: n.kind });
    case "Form":
      return e.createElement(Ec, { node: n });
    case "Chip":
      return e.createElement(t.Tag || "span", { color: Q(r.color) || "default", closable: !0, onClose: () => {
      }, children: Q(r.label) });
    case "ChipGroup": {
      const i = Pt(r.items);
      return e.createElement("div", { style: { display: "flex", flexWrap: "wrap", gap: 4 } }, ...i.map((c, d) => e.createElement(t.Tag || "span", { key: d }, Q(c))));
    }
    case "Tabs": {
      const i = Ft(e), d = a.filter((m) => m.kind === "TabItem").map((m) => {
        var u, f, w;
        return {
          key: Q((u = m.props) == null ? void 0 : u.key) || Q((f = m.props) == null ? void 0 : f.tab),
          label: Q((w = m.props) == null ? void 0 : w.tab),
          children: (m.children || []).map((h, y) => e.createElement(i, { key: h.nodeId || y, node: h }))
        };
      });
      return t.Tabs ? e.createElement(t.Tabs, { items: d, defaultActiveKey: Q(r.activeKey) || ((s = d[0]) == null ? void 0 : s.key) }) : e.createElement("div", null, ...d.map((m, u) => e.createElement("div", { key: u }, e.createElement("div", { style: { fontWeight: 600, marginBottom: 4 } }, m.label), m.children)));
    }
    case "TabItem":
      return e.createElement("div", null, l());
    case "Accordion": {
      const i = Ft(e), c = a.filter((d) => d.kind === "AccordionItem");
      if (t.Collapse) {
        const d = c.map((m) => {
          var u, f, w;
          return {
            key: Q((u = m.props) == null ? void 0 : u.key) || Q((f = m.props) == null ? void 0 : f.header),
            label: Q((w = m.props) == null ? void 0 : w.header),
            children: (m.children || []).map((h, y) => e.createElement(i, { key: h.nodeId || y, node: h }))
          };
        });
        return e.createElement(t.Collapse, { items: d });
      }
      return e.createElement("div", null, ...c.map((d, m) => {
        var u;
        return e.createElement("details", { key: m }, e.createElement("summary", { style: { fontWeight: 600, cursor: "pointer", padding: "4px 0" } }, Q((u = d.props) == null ? void 0 : u.header)), e.createElement("div", { style: { paddingLeft: 12 } }, (d.children || []).map((f, w) => e.createElement(i, { key: f.nodeId || w, node: f }))));
      }));
    }
    case "AccordionItem":
      return e.createElement("div", null, l());
    case "JsonDebug":
      return e.createElement("details", { style: { margin: "4px 0", fontSize: 12 } }, e.createElement("summary", null, Q(r.label) || "Debug JSON"), e.createElement("pre", { style: { fontSize: 12, padding: 8, background: "var(--ant-color-fill-tertiary, rgba(0,0,0,0.04))", borderRadius: 4, overflow: "auto" } }, JSON.stringify(r.data ?? r, null, 2)));
    default:
      return e.createElement("div", { style: { padding: 8, border: "1px dashed var(--ant-color-border, #d9d9d9)", borderRadius: 8, fontSize: 12, color: Te.muted, fontFamily: "monospace" } }, `Unknown component: ${n.kind}`);
  }
}
function kc({ props: e }) {
  var O, W;
  const t = (W = (O = window.QwenPaw) == null ? void 0 : O.host) == null ? void 0 : W.React;
  if (!t) return null;
  const n = t.useContext(xn(t)), r = ur(e, n == null ? void 0 : n.values), a = r.chartType, l = r.title, o = r.categories, s = r.series, i = r.height, c = r.showLegend, d = 400;
  if (r.empty)
    return t.createElement("div", { style: { padding: 12, color: Te.muted, fontSize: 12 } }, "Chart: no data");
  if (a === "pie") {
    const A = s[0].values.map((z) => Math.abs(z)), I = A.reduce((z, _) => z + _, 0) || 1, K = d / 2, j = i / 2, B = Math.min(d, i) / 2 - 20;
    let C = -Math.PI / 2;
    const x = A.map((z, _) => {
      const H = z / I * 2 * Math.PI, F = K + B * Math.cos(C), D = j + B * Math.sin(C), R = K + B * Math.cos(C + H), $ = j + B * Math.sin(C + H), ee = H > Math.PI ? 1 : 0, ae = `M ${K} ${j} L ${F} ${D} A ${B} ${B} 0 ${ee} 1 ${R} ${$} Z`;
      return C += H, { path: ae, color: yt[_ % yt.length], label: o[_] || `#${_ + 1}`, val: z };
    });
    return t.createElement(
      "div",
      { style: { margin: "4px 0" } },
      l ? t.createElement("div", { style: { fontSize: 13, fontWeight: 600, marginBottom: 4 } }, l) : null,
      t.createElement(
        "svg",
        { width: d, height: i, style: { maxWidth: "100%" } },
        ...x.map((z, _) => t.createElement("path", { key: _, d: z.path, fill: z.color, stroke: "#fff", strokeWidth: 1 }))
      ),
      c ? t.createElement(
        "div",
        { style: { display: "flex", flexWrap: "wrap", gap: 8, marginTop: 4, fontSize: 11 } },
        ...x.map((z, _) => t.createElement(
          "span",
          { key: _, style: { display: "flex", alignItems: "center", gap: 4 } },
          t.createElement("span", { style: { display: "inline-block", width: 10, height: 10, borderRadius: 2, background: z.color } }),
          `${z.label}: ${z.val}`
        ))
      ) : null
    );
  }
  const m = s.flatMap((A) => A.values), u = Math.max(...m, 0), f = Math.min(...m, 0), w = u - f || 1, h = o.length > 0 ? (d - 40) / o.length : 0, y = s.length > 0 ? Math.max(1, h / s.length - 2) : 0, p = o.length > 1 ? (d - 40) / (o.length - 1) : 0, b = Math.max(1, Math.ceil(o.length / 8)), v = (A) => i - 20 - (A - f) / w * (i - 40), g = v(0), S = (A) => 30 + A * p;
  return t.createElement(
    "div",
    { style: { margin: "4px 0" } },
    l ? t.createElement("div", { style: { fontSize: 13, fontWeight: 600, marginBottom: 4 } }, l) : null,
    t.createElement(
      "svg",
      { width: d, height: i, style: { maxWidth: "100%" } },
      ...[0, 0.25, 0.5, 0.75, 1].map((A, I) => {
        const K = i - 20 - A * (i - 40);
        return t.createElement("line", { key: `g${I}`, x1: 30, y1: K, x2: d - 10, y2: K, stroke: "var(--ant-color-border-secondary, #f0f0f0)", strokeWidth: 1 });
      }),
      ...o.map((A, I) => I % b === 0 || I === o.length - 1 ? t.createElement("text", { key: `x${I}`, x: S(I), y: i - 6, fontSize: 10, fill: Te.muted, textAnchor: "middle" }, A.length > 6 ? A.slice(0, 6) + "…" : A) : null),
      ...s.map((A, I) => {
        const K = yt[I % yt.length];
        if (a === "bar")
          return A.values.map((C, x) => t.createElement("rect", {
            key: `b${I}-${x}`,
            x: 30 + x * h + I * (y + 2) + 1,
            y: Math.min(v(C), g),
            width: y,
            height: Math.abs(g - v(C)),
            fill: K,
            rx: 2
          }));
        const j = A.values.map((C, x) => `${S(x)},${v(C)}`).join(" "), B = [t.createElement("polyline", { key: `l${I}`, points: j, fill: "none", stroke: K, strokeWidth: 2 })];
        if (a === "area") {
          const C = `${S(0)},${i - 20} ${j} ${S(A.values.length - 1)},${i - 20}`;
          B.unshift(t.createElement("polygon", { key: `a${I}`, points: C, fill: K, opacity: 0.15 }));
        }
        return B;
      })
    ),
    c ? t.createElement(
      "div",
      { style: { display: "flex", flexWrap: "wrap", gap: 8, marginTop: 4, fontSize: 11 } },
      ...s.map((A, I) => t.createElement(
        "span",
        { key: I, style: { display: "flex", alignItems: "center", gap: 4 } },
        t.createElement("span", { style: { display: "inline-block", width: 10, height: 10, borderRadius: 2, background: yt[I % yt.length] } }),
        A.name
      ))
    ) : null
  );
}
function Jn(e) {
  var c;
  const t = (c = window.QwenPaw) == null ? void 0 : c.host, n = t == null ? void 0 : t.React;
  if (!n) return null;
  const { useState: r, useEffect: a } = n, [l, o] = r(
    Ea(e.src) || (pn(e.src) ? e.src : null)
  ), [s, i] = r(
    ba(e.src)
  );
  return a(() => {
    if (!e.src) return;
    if (pn(e.src)) {
      o(e.src), i(null);
      return;
    }
    const d = Ea(e.src);
    if (d) {
      o(d), i(null);
      return;
    }
    o(null), i(null);
    let m = !1;
    return rc(e.src).then((u) => {
      m || (o(u), i(u ? null : ba(e.src)));
    }), () => {
      m = !0;
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
function Cc(e) {
  var a, l, o;
  const t = (a = window.QwenPaw) == null ? void 0 : a.host, n = t == null ? void 0 : t.React, r = (t == null ? void 0 : t.antd) || {};
  return n ? e.src ? n.createElement(Jn, {
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
const Tc = `#genui-root { max-width: 960px; margin: auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px; background: #fff; box-shadow: 0 8px 30px rgba(0,0,0,.05); }
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
function _c(e) {
  return e.replace(/[&<>"']/g, (t) => t === "&" ? "&amp;" : t === "<" ? "&lt;" : t === ">" ? "&gt;" : t === '"' ? "&quot;" : "&#39;");
}
function Ic(e) {
  return JSON.stringify(e).replace(/</g, "\\u003c");
}
function Z(e, t = "", n) {
  const r = document.createElement(e);
  return t && (r.className = t), n != null && n !== "" && (r.textContent = be(n)), r;
}
function ln(e, t) {
  Object.assign(e.style, t);
}
function At(e, t, n) {
  for (const r of t || []) e.appendChild(fr(r, n));
  return e;
}
function ka(e, t, n) {
  return t && e.appendChild(Z("div", "muted small", t)), e.appendChild(Z("div", "display-value", n)), e;
}
function Al(e, t, n, r) {
  const a = be(e);
  if (r.missing.has(a)) {
    const o = Z("div", `media-unavailable ${n}`.trim(), "此媒体未能离线嵌入");
    return o.setAttribute("role", "img"), o.setAttribute("aria-label", be(t)), o;
  }
  const l = Z("img", n);
  return l.src = r.media[a] || a, l.alt = be(t), l;
}
function Ac(e, t, n) {
  return e ? Al(e, t, "avatar", n) : Z("span", "avatar avatar-fallback", be(t).charAt(0).toUpperCase());
}
function zc(e) {
  const t = Z("div", "markdown");
  let n = null;
  for (const r of be(e).split(/\r?\n/)) {
    const a = r.match(/^(#{1,4})\s+(.*)$/), l = r.match(/^\s*[-*]\s+(.*)$/);
    a ? (n = null, t.appendChild(Z(`h${a[1].length}`, "", a[2]))) : l ? (n || (n = Z("ul"), t.appendChild(n)), n.appendChild(Z("li", "", l[1]))) : r.trim() ? (n = null, t.appendChild(Z("p", "", r))) : (n = null, t.appendChild(document.createElement("br")));
  }
  return t;
}
function $c(e, t) {
  const n = e.props || {}, r = e.kind, a = Dt(e), l = Z("label", "field");
  n.label && r !== "Switch" && l.appendChild(Z("span", "field-label", `${be(n.label)}${n.required ? " *" : ""}`));
  let o;
  if (r === "Textarea") {
    const i = Z("textarea");
    i.rows = Xe(n.rows) || 3, i.placeholder = be(n.placeholder), o = i;
  } else if (r === "Select") {
    const i = Z("select");
    for (const c of $t(n.options)) {
      const d = Z("option"), m = c && typeof c == "object" ? c : null;
      d.value = be(m ? m.value : c), d.textContent = be(m ? m.label : c), i.appendChild(d);
    }
    o = i;
  } else {
    const i = Z("input");
    i.type = r === "Slider" ? "range" : r === "Switch" ? "checkbox" : r === "NumberInput" ? "number" : r === "FileInput" ? "file" : "text", n.min != null && (i.min = be(n.min)), n.max != null && (i.max = be(n.max)), n.step != null && (i.step = be(n.step)), r === "FileInput" ? (n.accept && (i.accept = be(n.accept)), i.multiple = Bt(n.multiple)) : i.placeholder = be(n.placeholder), o = i;
  }
  const s = Object.prototype.hasOwnProperty.call(t.values, a) ? t.values[a] : n.value != null ? n.value : n.checked != null ? n.checked : "";
  if (r === "Switch") {
    const i = o;
    i.checked = Bt(s), i.checked ? i.setAttribute("checked", "") : i.removeAttribute("checked");
  } else if (r === "Textarea")
    o.value = be(s), o.textContent = be(s);
  else if (r === "Select") {
    const i = be(s);
    o.value = i;
    for (const c of Array.from(o.options))
      c.value === i ? c.setAttribute("selected", "") : c.removeAttribute("selected");
  } else r !== "FileInput" && (o.value = be(s), o.setAttribute("value", be(s)));
  if (o.setAttribute("data-genui-field", a), o.setAttribute("data-genui-kind", r), r === "Switch") {
    const i = Z("span", "switch-line");
    i.append(o, Z("span", "", n.label)), l.appendChild(i);
  } else if (r === "Slider") {
    const i = Z("span", "slider-line");
    i.append(o, Z("output", "slider-value", s)), l.appendChild(i);
  } else
    l.appendChild(o);
  return n.description && l.appendChild(Z("small", "description", n.description)), l;
}
function fr(e, t) {
  var l, o, s, i, c, d, m;
  if (!e || typeof e != "object") return Z("div");
  const n = e.props || {}, r = e.children || [];
  if (kl(e.kind)) return $c(e, t);
  if (e.kind === "Chart") {
    const u = Z("div", "chart");
    return u.setAttribute("data-genui-chart", JSON.stringify(n)), Tl(u, ur(n, t.values)), u;
  }
  if (e.kind === "Heading") return Z(`h${Cl(n.level)}`, "", n.value);
  if (e.kind === "Text") return Z("div", Bt(n.bold) ? "text bold" : "text", n.value);
  if (e.kind === "Markdown") return zc(n.content || n.value);
  if (e.kind === "CodeBlock") return Z("pre", "code", n.code);
  if (e.kind === "SectionHeader") {
    const u = Z("div", "section-header");
    n.icon && u.appendChild(Z("span", "section-icon", n.icon));
    const f = Z("div");
    return f.appendChild(Z("strong", "", n.title)), n.subtitle && f.appendChild(Z("div", "muted small", n.subtitle)), u.appendChild(f), u;
  }
  if (e.kind === "KeyValueList") {
    const u = Z("dl", "key-values");
    for (const f of $t(n.items)) {
      const w = f && typeof f == "object" ? f : {};
      u.append(Z("dt", "", w.key), Z("dd", "", w.value));
    }
    return u;
  }
  if (e.kind === "Divider") {
    const u = Z("div", "divider");
    return n.label && u.appendChild(Z("span", "", n.label)), u;
  }
  if (e.kind === "Spacer") {
    const u = Z("div");
    return ln(u, Ke("Spacer", n)), u;
  }
  if (e.kind === "Tabs") {
    const u = Z("div", "tabs");
    u.setAttribute("data-genui-tabs", "1");
    const f = Z("div", "tab-buttons"), w = Z("div");
    return r.filter((y) => y.kind === "TabItem").forEach((y, p) => {
      var b;
      f.appendChild(Z("button", p ? "" : "active", (b = y.props) == null ? void 0 : b.tab)), w.appendChild(At(Z("div", p ? "tab-panel hidden" : "tab-panel"), y.children, t));
    }), u.append(f, w), u;
  }
  if (e.kind === "Accordion") {
    const u = Z("div");
    for (const f of r.filter((w) => w.kind === "AccordionItem")) {
      const w = Z("details");
      w.append(Z("summary", "", (l = f.props) == null ? void 0 : l.header), At(Z("div", "accordion-body"), f.children, t)), u.appendChild(w);
    }
    return u;
  }
  if (e.kind === "Form") {
    const u = Z("div", "stack form");
    n.title && u.appendChild(Z("div", "card-title", n.title)), At(u, r, t);
    const f = Z("button", "button", be(n.submitLabel) || "提交");
    return f.setAttribute("data-genui-submit", "1"), u.appendChild(f), u;
  }
  if (ic.has(e.kind)) {
    const u = Z("button", e.kind === "LinkButton" ? "link-button" : "button", be(n.label) || "Action");
    return Bt(n.disabled) && (u.disabled = !0), u.setAttribute("data-genui-action", e.kind), e.kind === "LinkButton" && dc(n.href) && u.setAttribute("data-genui-href", be(n.href).trim()), u;
  }
  if (e.kind === "Image") {
    const u = Z("figure");
    return u.appendChild(Al(n.src, n.alt, "", t)), n.caption && u.appendChild(Z("figcaption", "", n.caption)), u;
  }
  if (e.kind === "ImageGallery") {
    const u = Z("div", "image-gallery");
    ln(u, Ke("ImageGallery", n));
    for (const f of r.filter((w) => w.kind === "Image"))
      u.appendChild(fr(f, t));
    return u;
  }
  if (e.kind === "Avatar") return Ac(n.src, n.name, t);
  if (e.kind === "Badge" || e.kind === "Tag" || e.kind === "Chip")
    return Z("span", "tag", n.value || n.label);
  if (e.kind === "Progress") {
    const u = Z("progress");
    return u.max = 100, u.value = Xe(n.value), u;
  }
  if (e.kind === "Stat") {
    const u = Z("div", "stat");
    return u.append(Z("span", "muted small", n.label), Z("strong", "stat-value", n.value)), n.delta && u.appendChild(Z("span", `small trend-${be(n.trend)}`, n.delta)), u;
  }
  if (e.kind === "DataCard" || e.kind === "MetricCard") {
    const u = Z("div", "card metric-card"), f = ka(Z("div"), n.title, n.value);
    return n.delta && f.appendChild(Z("div", `small trend-${be(n.trend)}`, `${be(n.delta)}${n.period ? ` ${be(n.period)}` : ""}`)), u.appendChild(f), n.icon && u.appendChild(Z("span", "metric-icon", n.icon)), u;
  }
  if (e.kind === "TimelineCard") {
    const u = Z("div", "card timeline");
    return u.append(Z("i", `timeline-dot status-${be(n.status)}`), ka(Z("div"), n.title, n.date)), n.description && u.appendChild(Z("div", "small", n.description)), u;
  }
  if (e.kind === "Stepper") {
    const u = Z("ol", "stepper");
    return $t(n.steps).forEach((f, w) => {
      u.appendChild(Z("li", w <= Xe(n.current) ? "active" : "", f));
    }), u;
  }
  if (e.kind === "Table") {
    const u = Z("table", "data-table"), f = Z("thead"), w = Z("tr");
    for (const y of $t(n.headers)) w.appendChild(Z("th", "", y));
    f.appendChild(w);
    const h = Z("tbody");
    for (const y of r.filter((p) => p.kind === "TableRow")) {
      const p = Z("tr", (o = y.props) != null && o.highlight ? "highlight" : "");
      for (const b of (y.children || []).filter((v) => v.kind === "TableCell")) {
        const v = Z("td", (s = b.props) != null && s.bold ? "bold" : "", (i = b.props) == null ? void 0 : i.value);
        (c = b.props) != null && c.align && (v.style.textAlign = be(b.props.align)), p.appendChild(v);
      }
      h.appendChild(p);
    }
    return u.append(f, h), u;
  }
  if (e.kind === "List") {
    const u = Z(Bt(n.ordered) ? "ol" : "ul", "data-list");
    for (const f of r.filter((w) => w.kind === "ListItem"))
      u.appendChild(Z("li", "", `${(d = f.props) != null && d.icon ? `${be(f.props.icon)} ` : ""}${be((m = f.props) == null ? void 0 : m.value)}`));
    return u;
  }
  if (e.kind === "ChipGroup") {
    const u = Z("div", "chips");
    for (const f of $t(n.items)) u.appendChild(Z("span", "tag", f));
    return u;
  }
  if (e.kind === "Skeleton") {
    const u = Z("div", "skeletons");
    for (let f = 0; f < (Xe(n.rows) || 3); f += 1) u.appendChild(Z("i", "skeleton"));
    return u;
  }
  if (e.kind === "Icon") {
    const u = Z("span", "icon");
    return fc(u, n.name, { size: Xe(n.size) || 16 }), u;
  }
  if (e.kind === "JsonDebug") {
    const u = Z("details");
    return u.append(
      Z("summary", "", be(n.label) || "Debug JSON"),
      Z("pre", "code", JSON.stringify(n.data == null ? n : n.data, null, 2))
    ), u;
  }
  if (e.kind === "KpiBoard") {
    const u = Z("div", "stack");
    n.title && u.appendChild(Z("div", "card-title", n.title));
    const f = Z("div", "grid");
    return ln(f, Ke("KpiBoard", n)), At(f, r, t), u.appendChild(f), u;
  }
  if (!Object.prototype.hasOwnProperty.call(xa, e.kind))
    return Z("div", "unknown-component", `Unknown component: ${be(e.kind)}`);
  const a = Z("div", xa[e.kind]);
  return ln(a, Ke(e.kind, n)), e.kind === "Card" && n.title && a.appendChild(Z("div", "card-title", n.title)), e.kind === "Card" && n.subtitle && a.appendChild(Z("div", "muted small card-subtitle", n.subtitle)), (e.kind === "Alert" || e.kind === "AlertCard" || e.kind === "Callout") && (n.title || n.message) ? (n.title && a.appendChild(Z("strong", "", n.title)), n.message && a.appendChild(Z("div", "", n.message))) : At(a, r, t), a;
}
function Ca(e, t) {
  const n = Function.prototype.toString.call(e).replace(/^export\s+/, "").trim();
  if (!n.includes("{")) throw new Error(`cannot serialize ${t}`);
  return `var ${t} = (${n});`;
}
function Pc() {
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
function Rc(e, t = {}, n = { sources: {}, missing: [] }) {
  const r = Z("main");
  return r.id = "genui-root", r.appendChild(fr(e, {
    values: t,
    media: n.sources || {},
    missing: new Set(n.missing || [])
  })), r;
}
function zl(e, t = {}, n = { sources: {}, missing: [] }, r = "GenUI") {
  const a = Rc(e, t, n);
  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${_c(String(r || "GenUI").slice(0, 120))}</title>
  <style>
    :root { color-scheme: light; }
    html, body { margin: 0; padding: 0; background: #f5f7fa; color: #1f2329; }
    body { padding: 24px; font-family: system-ui, -apple-system, "Segoe UI", sans-serif; }
    *, *::before, *::after { box-sizing: border-box; }
    ${Tc}
  </style>
</head>
<body>${a.outerHTML}
<script id="genui-values-data" type="application/json">${Ic(t)}<\/script>
<script>${Pc()}<\/script></body>
</html>`;
}
function $l(e, t) {
  const n = document.createElement("a");
  n.download = t, n.href = e, n.click();
}
async function Oc(e, t) {
  const { toPng: n } = await Promise.resolve().then(() => pu), r = await n(e, {
    cacheBust: !0,
    pixelRatio: Math.min(window.devicePixelRatio || 1, 2),
    backgroundColor: "#ffffff"
  });
  $l(r, `${t}.png`), console.info("[ugsci.genui] PNG export created", { filename: t, via: "html-to-image" });
}
function Mc(e) {
  return new Promise((t, n) => {
    const r = new FileReader();
    r.onload = () => t(String(r.result || "")), r.onerror = () => n(r.error || new Error("media encoding failed")), r.readAsDataURL(e);
  });
}
async function Lc(e) {
  const t = e.currentSrc || e.src;
  if (!t) return null;
  if (t.startsWith("data:")) return t;
  try {
    const n = await fetch(t);
    return n.ok ? await Mc(await n.blob()) : null;
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
    const l = a.dataset.genuiMediaSource || "", o = await Lc(a);
    l && (o ? t[l] = o : n.push(l));
  })), { sources: t, missing: Array.from(new Set(n)) };
}
async function Bc(e, t, n, r, a = r) {
  const l = await Pl(e), o = zl(t, n, l, a), s = new Blob([o], { type: "text/html;charset=utf-8" }), i = URL.createObjectURL(s);
  $l(i, `${r}.html`), setTimeout(() => URL.revokeObjectURL(i), 1e3), l.missing.length && console.warn("[ugsci.genui] HTML export has media that could not be embedded", { filename: r, missing: l.missing }), console.info("[ugsci.genui] HTML export created", { filename: r, bytes: s.size, embeddedMedia: Object.keys(l.sources).length, missingMedia: l.missing.length });
}
async function Uc(e, t, n, r) {
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
const Ge = "var(--ant-color-text, rgba(0, 0, 0, 0.88))", Ne = "var(--ant-color-text-secondary, rgba(0, 0, 0, 0.45))", bt = "var(--ant-color-border-secondary, #f0f0f0)", Kn = "var(--ant-color-bg-container, #fff)", Xn = "var(--ant-color-fill-quaternary, rgba(0, 0, 0, 0.02))", Rl = "var(--ant-color-success, #52c41a)", jc = "var(--ant-color-success-bg, #f6ffed)", Nc = "var(--ant-color-warning, #faad14)", Dc = "var(--ant-color-warning-bg, #fffbe6)", Ol = "var(--ant-color-error, #ff4d4f)", Fc = "var(--ant-color-error-bg, #fff2f0)", Ta = "var(--ant-color-primary, #1677ff)", Gc = {
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
  return Gc[e] || Ml[e] || e.replace(/[_.-]+/g, " ").replace(/\b\w/g, (t) => t.toUpperCase());
}
function Hc(e, t = "") {
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
  if (typeof e == "number") return Hc(e, t);
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
function Wc(e) {
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
function Vc(e) {
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
function kn(e) {
  var d, m, u, f;
  const t = (e == null ? void 0 : e.provenance) || {}, n = t.unit_audit, r = Object.values((n == null ? void 0 : n.per_symbol) || {}), a = typeof (n == null ? void 0 : n.ok) == "boolean" ? n.ok : null, l = t.source || ((d = e == null ? void 0 : e.trace) == null ? void 0 : d.source), o = Array.isArray(e == null ? void 0 : e.warnings) ? e.warnings.map(String) : [];
  let s = "success", i = "公式与单位已核验", c = "公式匹配、参数完整，计算证据链可追溯。";
  return a === !1 ? (s = "error", i = "单位检查未通过", c = "结果使用前需要修正单位不一致项。") : l === "freeform" ? (s = "warning", i = "AI 推导 · 建议复核", c = "符号步骤已通过安全校验，但公式并非审定公式库来源。") : o.length ? (s = "warning", i = "计算完成 · 存在提醒", c = "核心计算已完成，请同时阅读警告和适用条件。") : a === null && (i = "计算证据链已记录", c = "推导步骤和参数来源可追溯；此记录没有逐项单位审计。"), {
    title: ((m = e == null ? void 0 : e.trace) == null ? void 0 : m.formula_name) || ((u = e == null ? void 0 : e.trace) == null ? void 0 : u.title) || (e == null ? void 0 : e.operation) || "UGSci 数学计算",
    formula: qc(e),
    trustLabel: i,
    trustDetail: c,
    trustTone: s,
    results: Wc(e),
    inputs: Vc(e),
    boundaries: [
      ...Array.isArray(e == null ? void 0 : e.applicability) ? e.applicability : [],
      ...Array.isArray(e == null ? void 0 : e.assumptions) ? e.assumptions : []
    ].map(String),
    warnings: o,
    stepCount: Array.isArray((f = e == null ? void 0 : e.trace) == null ? void 0 : f.steps) ? e.trace.steps.length : 0,
    passedGateCount: Array.isArray(t.gate) ? t.gate.length : 0,
    unitCheckCount: r.length,
    unitAuditOk: a
  };
}
function Jc(e) {
  return e === "error" ? { color: Ol, background: Fc } : e === "warning" ? { color: Nc, background: Dc } : { color: Rl, background: jc };
}
function mt({ children: e }) {
  return k().React.createElement(
    "div",
    { style: { fontWeight: 600, color: Ge, marginBottom: 8 } },
    e
  );
}
function pr({
  payload: e,
  onOpenDerivation: t,
  onOpenEvidence: n,
  onReplay: r,
  compact: a = !1
}) {
  const l = k().React, o = kn(e), s = Jc(o.trustTone), i = o.results[0], c = o.results.slice(1, a ? 2 : 4);
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
            background: Kn,
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
            background: Kn,
            color: Ge,
            cursor: "pointer"
          }
        },
        "复现计算"
      ) : null
    )
  );
}
function Kc({ payload: e }) {
  const t = k().React, n = kn(e);
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
function Xc({ payload: e }) {
  var s, i, c;
  const t = k().React, n = kn(e), r = (e == null ? void 0 : e.provenance) || {}, a = Object.entries(((s = r == null ? void 0 : r.unit_audit) == null ? void 0 : s.per_symbol) || {}), l = Object.entries((r == null ? void 0 : r.parameter_sources) || {}), o = (d, m, u = d) => t.createElement(
    "div",
    {
      key: u,
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
      m || "—"
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
          ([d, m]) => o(
            Gt(d),
            `${(m == null ? void 0 : m.source) === "user_input" ? "用户输入" : "推导生成"} · ${gn(m == null ? void 0 : m.value, d)}${m != null && m.unit ? ` ${m.unit}` : ""}`,
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
            ([d, m]) => o(
              Gt(d),
              `${m != null && m.ok ? "✓" : "✗"} ${(m == null ? void 0 : m.actual) || "无量纲"} → ${(m == null ? void 0 : m.expected) || "—"}`,
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
          (d, m) => t.createElement(
            "li",
            { key: `${m}:${d}` },
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
            background: Xn,
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
function Yc({ payload: e }) {
  const t = k().React, n = kn(e), [r, a] = t.useState(!1), l = e == null ? void 0 : e.replay, o = [
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
            style: { padding: 10, borderRadius: 8, background: Xn }
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
          background: Kn,
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
          background: Xn,
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
const Qc = 128;
let Yn = [], Ll = "";
const Qn = /* @__PURE__ */ new Set(), Bl = () => Qn.forEach((e) => e()), Ul = (e) => (Qn.add(e), () => Qn.delete(e)), Ia = () => Yn;
function gr(e) {
  return !!(e && typeof e == "object" && e.trace && Array.isArray(e.trace.steps) && e.provenance && (e.operation || e.trace.formula_id));
}
function Zc(e) {
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
  return Yn = [r, ...Yn.filter((c) => c.uiId !== n)].slice(
    0,
    Qc
  ), Bl(), r;
}
function hr(e) {
  Ll = e, Bl();
}
function ed() {
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
    const a = Zc(r);
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
function td(e, t) {
  jl(e).forEach(
    (n) => yr(n, t)
  );
}
function nd(e) {
  const t = k().React, n = t.useSyncExternalStore(Ul, Ia, Ia);
  return t.useMemo(
    () => n.filter((r) => r.sessionId === e),
    [n, e]
  );
}
const rd = [], wt = /* @__PURE__ */ new Map();
function ad(e) {
  wt.set(e, (wt.get(e) || 0) + 1);
}
function ld(e) {
  const t = (wt.get(e) || 1) - 1;
  t > 0 ? wt.set(e, t) : wt.delete(e);
}
function od(e) {
  return (wt.get(e) || 0) > 0;
}
function Aa(e) {
  const t = [], n = (r) => {
    t.push(r);
    for (const a of r.children || []) n(a);
  };
  return n(e), t;
}
function id(e) {
  var c, d;
  const t = Aa(e), n = String(
    ((d = (c = t.find(
      (m) => {
        var u;
        return m.kind === "Heading" && Number((u = m.props) == null ? void 0 : u.level) === 2;
      }
    )) == null ? void 0 : c.props) == null ? void 0 : d.value) || "公式计算"
  ), r = t.some(
    (m) => {
      var u;
      return m.kind === "Alert" && String(((u = m.props) == null ? void 0 : u.severity) || "") === "warning";
    }
  ), a = t.filter((m) => m.kind === "MetricCard").map((m) => {
    var u, f;
    return {
      label: String(((u = m.props) == null ? void 0 : u.title) || "结果"),
      value: String(((f = m.props) == null ? void 0 : f.value) ?? "—")
    };
  }), l = t.filter((m) => m.kind === "TableRow").map(
    (m) => (m.children || []).filter((u) => u.kind === "TableCell").map((u) => {
      var f;
      return String(((f = u.props) == null ? void 0 : f.value) ?? "");
    })
  ).filter((m) => m.length >= 4 && m[3] === "derived").map((m) => ({
    label: m[0] || "结果",
    value: [m[1], m[2]].filter(Boolean).join(" ")
  })).reverse(), o = t.filter((m) => m.kind === "NumberInput" || m.kind === "Slider").slice(0, 5).map(
    (m) => {
      var u, f, w;
      return `${String(((u = m.props) == null ? void 0 : u.label) || ((f = m.props) == null ? void 0 : f.name) || "输入")}=${String(
        ((w = m.props) == null ? void 0 : w.value) ?? "—"
      )}`;
    }
  ), s = t.filter((m) => m.kind === "AccordionItem").filter(
    (m) => {
      var u;
      return ["适用场景", "假设条件"].includes(String(((u = m.props) == null ? void 0 : u.header) || ""));
    }
  ).flatMap((m) => Aa(m)).filter((m) => m.kind === "ListItem").map((m) => {
    var u;
    return String(((u = m.props) == null ? void 0 : u.value) || "");
  }).filter(Boolean).slice(0, 3), i = [...l, ...a].filter(
    (m, u, f) => f.findIndex(
      (w) => w.label === m.label && w.value === m.value
    ) === u
  );
  return { title: n, warning: r, inputs: o, conditions: s, results: i };
}
function sd({ data: e }) {
  var h, y;
  const t = (h = window.QwenPaw) == null ? void 0 : h.host, n = t == null ? void 0 : t.React;
  if (!n) return null;
  const r = Fs(), a = n.useRef(/* @__PURE__ */ new Map()), l = ((y = t.getCurrentSessionId) == null ? void 0 : y.call(t)) || "__current_chat__", o = Array.isArray(e.output) ? e.output : rd, s = n.useMemo(
    () => bl(o),
    [o]
  ), i = n.useMemo(
    () => jl(o),
    [o]
  );
  n.useEffect(() => {
    for (const p of s) {
      if (!p.ui_id || !p.tree) continue;
      const b = r.getSnapshot(l, p.ui_id);
      b && b.revision >= (p.revision || 1) || r.setSnapshot({
        schemaVersion: "1",
        uiId: p.ui_id,
        revision: p.revision || 1,
        tree: p.tree,
        sessionId: l,
        sourceToolCallId: p.tool_call_id,
        updatedAt: Date.now()
      });
    }
  }, [s, l]);
  const c = n.useMemo(
    () => s.filter((p) => p.kind === "genui" && !!p.ui_id).map((p) => p.ui_id),
    [s]
  ), d = c.join("\0");
  n.useEffect(() => {
    for (const p of c) ad(p);
    return () => {
      for (const p of c) ld(p);
    };
  }, [d]);
  const m = n.useMemo(
    () => s.map((p) => p.ui_id).filter((p) => !!p),
    [s]
  ), f = Gs(l, m).filter(
    (p) => (
      // Only include snapshots whose ui_id appears in this response's results
      s.some(
        (b) => b.ui_id === p.uiId && (b.kind === "genui" || b.kind === "genui_patch" && !od(p.uiId))
      )
    )
  ).sort((p, b) => p.updatedAt - b.updatedAt);
  if (i.length > 0)
    return n.createElement(
      "div",
      {
        className: "qwenpaw-genui-inline qwenpaw-derivation-inline",
        style: { marginTop: 8, marginBottom: 8, display: "grid", gap: 8 }
      },
      ...i.map(
        (p, b) => {
          var v, g;
          return n.createElement(
            "div",
            {
              key: String(
                ((v = p.provenance) == null ? void 0 : v.replay_token) || ((g = p.trace) == null ? void 0 : g.formula_id) || b
              ),
              style: {
                border: "1px solid var(--ant-color-border-secondary, #f0f0f0)",
                borderRadius: 12,
                padding: 12,
                background: "var(--ant-color-bg-container, #fff)"
              }
            },
            n.createElement(pr, {
              payload: p,
              compact: !0,
              onOpenDerivation: () => {
                const S = yr(p, l);
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
  if (f.length === 0) return null;
  const w = (p) => n.createElement(
    "div",
    {
      key: xt(p.sessionId, p.uiId),
      className: "qwenpaw-genui-tree",
      "data-genui-id": p.uiId,
      style: {
        border: "1px solid var(--ant-color-border-secondary, #f0f0f0)",
        borderRadius: 12,
        padding: 16,
        marginBottom: 8,
        background: "var(--ant-color-bg-container, #fff)"
      },
      ref: (b) => {
        b && (b.__genuiId = p.uiId);
      }
    },
    n.createElement(
      "div",
      { className: "qwenpaw-genui-export-target" },
      n.createElement(pc, {
        node: p.tree.root,
        onValuesChange: (b) => a.current.set(p.uiId, b),
        children: n.createElement(Sc, {
          node: p.tree.root
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
          onClick: (b) => {
            var g;
            const v = (g = b.currentTarget.closest(".qwenpaw-genui-tree")) == null ? void 0 : g.querySelector(
              ".qwenpaw-genui-export-target"
            );
            v && Oc(v, p.uiId).catch(
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
          onClick: (b) => {
            var g;
            const v = (g = b.currentTarget.closest(".qwenpaw-genui-tree")) == null ? void 0 : g.querySelector(
              ".qwenpaw-genui-export-target"
            );
            v && Uc(
              v,
              p.tree.root,
              a.current.get(p.uiId) || {},
              p.uiId
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
          onClick: (b) => {
            var g;
            const v = (g = b.currentTarget.closest(".qwenpaw-genui-tree")) == null ? void 0 : g.querySelector(
              ".qwenpaw-genui-export-target"
            );
            v && Bc(
              v,
              p.tree.root,
              a.current.get(p.uiId) || {},
              p.uiId,
              p.uiId
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
    ...f.map((p) => {
      if (!p.uiId.startsWith("ui_trc_")) return w(p);
      const b = id(p.tree.root), v = b.results[0] || {
        label: "计算结果",
        value: "已完成"
      };
      return n.createElement(
        "div",
        {
          key: xt(p.sessionId, p.uiId),
          className: "qwenpaw-derivation-inline",
          "data-trace-ui-id": p.uiId,
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
              b.title
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
                color: b.warning ? "var(--ant-color-warning, #faad14)" : "var(--ant-color-success, #52c41a)",
                background: b.warning ? "var(--ant-color-warning-bg, #fffbe6)" : "var(--ant-color-success-bg, #f6ffed)"
              }
            },
            b.warning ? "需要人工复核" : "✓ 公式与单位已核验"
          )
        ),
        b.results.length > 1 ? n.createElement(
          "div",
          {
            style: {
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
              gap: 8
            }
          },
          ...b.results.slice(1, 4).map(
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
        b.inputs.length ? n.createElement(
          "div",
          {
            style: {
              color: "var(--ant-color-text-secondary, rgba(0,0,0,.45))",
              fontSize: 12,
              lineHeight: 1.6
            }
          },
          `关键输入：${b.inputs.join("；")}`
        ) : null,
        b.conditions.length ? n.createElement(
          "div",
          {
            style: {
              color: "var(--ant-color-text-secondary, rgba(0,0,0,.45))",
              fontSize: 12,
              lineHeight: 1.6
            }
          },
          `适用条件：${b.conditions.join("；")}`
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
            w(p)
          )
        )
      );
    })
  );
}
function cd({ payload: e }) {
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
      const m = l.get(c.from), u = l.get(c.to);
      return t.createElement("line", {
        key: `e${d}`,
        x1: m.x + 155,
        y1: m.y + 16,
        x2: u.x,
        y2: u.y + 16,
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
function dd({
  payload: e,
  compact: t = !1
}) {
  var c;
  const n = k().React, [r, a] = n.useState(!t), l = ((c = e == null ? void 0 : e.trace) == null ? void 0 : c.steps) || [], o = l.filter(
    (d) => d.kind !== "bind" || d.note !== "input"
  ), i = (r ? l : o).map(
    (d, m) => n.createElement(
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
        m + 1
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
const on = "var(--ant-color-text, rgba(0,0,0,.88))", Bn = "var(--ant-color-text-secondary, rgba(0,0,0,.45))", za = "var(--ant-color-border, #d9d9d9)", Un = "var(--ant-color-bg-container, #fff)", $a = "var(--ant-color-primary, #1677ff)";
function ud() {
  var y, p, b;
  const e = k().React, t = ((p = (y = k()).getCurrentSessionId) == null ? void 0 : p.call(y)) || "", n = nd(t), r = ed(), [a, l] = e.useState(n[0]), [o, s] = e.useState("summary"), [i, c] = e.useState("steps");
  if (e.useEffect(() => {
    const v = n.find((g) => g.uiId === r);
    v && v !== a ? l(v) : n.some((g) => g.uiId === (a == null ? void 0 : a.uiId)) || l(n[0]);
  }, [n, r, a]), !n.length)
    return e.createElement(
      "div",
      { style: { padding: 20, color: Bn } },
      "暂无推导记录。运行 UGSci 公式后可在此查看。"
    );
  const d = (a == null ? void 0 : a.payload) || n[0].payload, m = d.provenance || {}, u = d.replay, f = () => {
    var g, S, O;
    const v = m.replay_token;
    v && ((O = (S = (g = window.QwenPaw) == null ? void 0 : g.chat) == null ? void 0 : S.sendMessage) == null || O.call(
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
    background: v ? Un : "transparent",
    color: v ? on : Bn,
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
          { style: { color: Bn, fontSize: 11 } },
          ((b = d.trace) == null ? void 0 : b.formula_name) || d.operation || "UGSci 推导"
        )
      ),
      u ? e.createElement(
        "span",
        {
          style: {
            color: u.reproducible ? "var(--ant-color-success, #52c41a)" : "var(--ant-color-warning, #faad14)",
            fontSize: 12
          }
        },
        u.reproducible ? `✓ 可复现 · ${u.elapsedMs ?? "?"} ms` : "! 版本已变化"
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
          background: Un
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
      e.createElement(pr, {
        payload: d,
        onOpenDerivation: () => s("derivation"),
        onOpenEvidence: () => s("evidence"),
        onReplay: m.replay_token ? f : void 0
      }),
      e.createElement(Kc, { payload: d })
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
                background: Un,
                color: i === v ? $a : on,
                cursor: "pointer"
              }
            },
            g
          )
        )
      ),
      i === "flow" ? e.createElement(cd, { payload: d }) : e.createElement(dd, { payload: d, compact: !0 })
    ) : o === "evidence" ? e.createElement(
      "div",
      { role: "tabpanel" },
      e.createElement(Xc, { payload: d })
    ) : e.createElement(
      "div",
      { role: "tabpanel" },
      e.createElement(Yc, { payload: d })
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
function md(e) {
  var i, c, d, m, u, f, w;
  const t = k().React, n = ((i = e == null ? void 0 : e.data) == null ? void 0 : i.content) || [], r = ((d = (c = n[1]) == null ? void 0 : c.data) == null ? void 0 : d.output) ?? ((u = (m = n[1]) == null ? void 0 : m.data) == null ? void 0 : u.content) ?? ((w = (f = n[0]) == null ? void 0 : f.data) == null ? void 0 : w.output), a = Rt(r), [l, o] = t.useState(null);
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
    a ? t.createElement(pr, {
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
  if (ce("/ugsci/genui/config", {
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
      e.chat.toolRender(n, "emit_ui_tree", pa)
    ), r.push(
      e.chat.toolRender(n, "emit_ui_patch", pa)
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
      r.push(e.chat.toolRender(n, i, md));
    console.info("[ugsci.genui] Registered emit/patch + catalog/guide cards");
  }
  return (l = e.slot) != null && l.fill && r.push(
    e.slot.fill(
      n,
      "chat.workbench.compute",
      () => t.createElement(ud)
    )
  ), (s = (o = e.chat) == null ? void 0 : o.response) != null && s.append && (r.push(
    e.chat.response.append(
      n,
      (i) => {
        const c = () => (t.useEffect(
          () => td(i.data.output),
          [i.data.output]
        ), null);
        return t.createElement(
          Ds,
          null,
          t.createElement(c),
          t.createElement(sd, { data: i.data })
        );
      },
      { id: "ugsci.genui.response-append", order: 50 }
    )
  ), console.info("[ugsci.genui] Registered response.append slot")), ut = () => {
    var i;
    for (const c of r.reverse()) (i = c == null ? void 0 : c.dispose) == null || i.call(c);
    if (Ws(), oc(), e.genui) {
      const c = { ...e.genui };
      delete c.dispose, delete c.clearSession, e.genui = c;
    }
    ut = null;
  }, e.genui = {
    ...e.genui || {},
    dispose: ut,
    clearSession: Hs
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
function jn(e) {
  const t = window.QwenPaw;
  t && (t.genui = { ...t.genui || {}, config: e });
}
function pd() {
  const e = k().React, { Alert: t, Card: n, Space: r, Spin: a, Switch: l, Typography: o, message: s } = k().antd, { useEffect: i, useState: c } = e, [d, m] = c(null), [u, f] = c(!1);
  i(() => {
    let h = !0, y = null;
    const p = (b = !1) => {
      ce("/ugsci/genui/config").then((v) => {
        h && (m(v), jn(v));
      }).catch((v) => {
        h && (m(Pa), jn(Pa), b && s.error(String(v)), y = setTimeout(() => p(!1), 3e4));
      });
    };
    return p(!0), () => {
      h = !1, y && clearTimeout(y);
    };
  }, []);
  const w = async (h) => {
    f(!0);
    try {
      const y = await ce("/ugsci/genui/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: h })
      });
      m(y), jn(y), s.success(y.overridden ? "设置已保存，但环境变量或插件配置正在覆盖它" : h ? "GenUI 已开启" : "GenUI 已关闭");
    } catch (y) {
      s.error(`保存 GenUI 设置失败：${String(y)}`);
    } finally {
      f(!1);
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
            loading: u,
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
function gd() {
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
async function yd(e, t) {
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
async function hd(e, t) {
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
function Ed() {
  const e = k().React, { useEffect: t, useRef: n, useState: r } = e, { Spin: a, Alert: l, Button: o, Typography: s, message: i } = k().antd, { Text: c } = s, d = n(null), m = n(null), [u, f] = r(!0), [w, h] = r(null), [y, p] = r("正在加载三维可视化引擎...");
  return t(() => {
    let b = !1;
    async function v() {
      if (d.current)
        try {
          f(!0), h(null);
          const g = await Nl();
          if (b) return;
          const S = k(), W = {
            apiBase: S.getApiUrl("ugsci/visualization"),
            authToken: S.getApiToken() || void 0
          };
          m.current = g.mount(d.current, W);
          const A = gd();
          if (A) {
            p(`正在导入 ${A.name}...`);
            const I = await yd(S, A);
            if (b || !m.current || (p("正在打开三维网格..."), await hd(m.current, I), b)) return;
          }
          b || f(!1);
        } catch (g) {
          if (!b) {
            const S = g instanceof Error ? g.message : "Failed to load viewer";
            h(S), f(!1), i.error(`可视化引擎加载失败: ${S}`);
          }
        }
    }
    return v(), () => {
      if (b = !0, m.current) {
        try {
          m.current.dispose();
        } catch (g) {
          console.warn("[oilgas-vis] Dispose error:", g);
        }
        m.current = null;
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
    u && e.createElement(
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
function bd({ jobId: e, file: t }) {
  const n = k().React, { useEffect: r, useRef: a, useState: l } = n, o = k(), s = a(null), i = a(null), [c, d] = l("queued"), [m, u] = l(0), [f, w] = l(null), [h, y] = l(null);
  return r(() => {
    let p = !1;
    return (async () => {
      var g;
      const v = `/ugsci/visualization/imports/${e}`;
      for (let S = 0; S < 240 && !p; S += 1) {
        try {
          const O = await Fl(o, v, {
            headers: { ...Dl(o, t) }
          });
          if (!O.ok) throw new Error(`状态查询失败: HTTP ${O.status}`);
          const W = await O.json();
          if (p) return;
          if (u(Number(W.progress || 0)), d(W.status), W.status === "completed") {
            if (!((g = W.result) != null && g.id)) throw new Error("导入完成但未返回数据集 ID");
            y(W.result.id);
            return;
          }
          if (W.status === "failed" || W.status === "cancelled") {
            w(W.error || Ma(W.status));
            return;
          }
        } catch (O) {
          if (S >= 239 && !p) {
            d("failed"), w(O instanceof Error ? O.message : String(O));
            return;
          }
        }
        await new Promise((O) => setTimeout(O, 750));
      }
    })(), () => {
      p = !0;
    };
  }, [e, t.agentId, t.chatId, t.projectDirOverride]), r(() => {
    if (c !== "completed" || !h || !s.current) return;
    let p = !1;
    return (async () => {
      var b, v;
      try {
        const g = await Nl();
        if (p || !s.current) return;
        i.current = g.mount(s.current, {
          apiBase: o.getApiUrl("ugsci/visualization"),
          authToken: o.getApiToken() || void 0
        });
        let S;
        for (let O = 0; O < 20 && !p; O += 1)
          try {
            await ((v = (b = i.current).executeCommand) == null ? void 0 : v.call(b, "open", { datasetId: h })), S = void 0;
            break;
          } catch (W) {
            S = W;
            const A = W instanceof Error ? W.message : String(W);
            if (!A.includes("数据集不存在") && !A.includes("dataset"))
              throw W;
            await new Promise((I) => setTimeout(I, 250));
          }
        if (S && !p) throw S;
      } catch (g) {
        p || (d("failed"), w(g instanceof Error ? g.message : String(g)));
      }
    })(), () => {
      var b;
      p = !0;
      try {
        (b = i.current) == null || b.dispose();
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
      `${Ma(c)}${m > 0 ? `（${Math.round(m * 100)}%）` : ""}`
    ),
    f ? n.createElement(
      "div",
      { style: { marginTop: 6, color: "#ff7875", fontSize: 12 } },
      `预览状态：${f}`
    ) : null
  );
}
function vd(e) {
  const t = k().React, { useEffect: n, useState: r } = t, { Button: a, Spin: l, Alert: o, Typography: s } = k().antd, { Text: i } = s, c = e.artifact || e.file || {}, d = c.filename || c.title || e.filename || "unknown", m = c.workspacePath || c.path || e.workspacePath, [u, f] = r("idle"), [w, h] = r(null), [y, p] = r(null);
  return n(() => {
    if (!m) return;
    let b = !1;
    return f("submitting"), h(null), p(null), (async () => {
      try {
        const v = k(), g = await Fl(v, "/ugsci/visualization/imports/workspace", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...Dl(v, c)
          },
          body: JSON.stringify({
            path: m,
            root: c.workspaceRoot || "project",
            name: d.replace(/\.[^.]+$/, "")
          })
        });
        if (!g.ok) throw new Error(`Import failed: HTTP ${g.status}`);
        const S = await g.json();
        b || (h(S.job_id), f("submitted"));
      } catch (v) {
        b || (p(v instanceof Error ? v.message : String(v)), f("failed"));
      }
    })(), () => {
      b = !0;
    };
  }, [m, d, c.workspaceRoot, c.agentId, c.chatId, c.projectDirOverride]), u === "submitting" ? t.createElement(
    "div",
    { style: { padding: 24, textAlign: "center" } },
    t.createElement(l, { size: "large" }),
    t.createElement(
      "div",
      { style: { marginTop: 8, color: "#8b949e" } },
      "正在提交工作区文件，浏览器不会复制大型文件..."
    )
  ) : u === "failed" ? t.createElement(
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
    w ? t.createElement(bd, { jobId: w, file: c }) : t.createElement(i, { type: "secondary" }, "正在准备导入任务..."),
    t.createElement(a, {
      type: "primary",
      onClick: () => {
        window.history.pushState({}, "", "/oilgas-visualization"), window.dispatchEvent(new PopStateEvent("popstate"));
      }
    }, "打开油气可视化页面")
  );
}
function wd(e, t) {
  const n = "__ugsciVisualizationFrontendRegistered", r = window;
  if (r[n]) return;
  r[n] = !0;
  const a = k().antdIcons || {}, l = a.GlobalOutlined || a.AppstoreOutlined;
  e.route.add("ugsci", {
    id: "ugsci.visualization",
    path: "/oilgas-visualization",
    component: Ed
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
        component: vd,
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
function Sd() {
  var d, m, u, f;
  const e = window.QwenPaw;
  if (!(e != null && e.menu) || !(e != null && e.route)) {
    console.warn(
      "[ugsci] QwenPaw.menu/route API not available — plugin disabled"
    );
    return;
  }
  const t = k().React, n = "ugsci";
  function r() {
    return k().React.createElement(Ms, { embedded: !0 });
  }
  function a() {
    return k().React.useEffect(() => {
      window.history.replaceState({}, "", "/market?tab=ugsci"), window.dispatchEvent(new PopStateEvent("popstate"));
    }, []), null;
  }
  (m = (d = e.chat) == null ? void 0 : d.rightHeader) != null && m.add ? (e.chat.rightHeader.add(n, t.createElement(Bs), {
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
    component: Li
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
    component: pd
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
    component: ps
  }), e.route.add(n, {
    id: "ugsci.skills-center",
    path: "/ugsci-skills",
    component: gs
  }), e.route.add(n, {
    id: "ugsci.market",
    path: "/ugsci-market",
    component: a
  }), (u = e.marketplace) == null || u.add(n, {
    id: "ugsci",
    label: "UGSci",
    component: r,
    order: 30
  }), (f = e.sidebar) != null && f.registerSimpleModeItems ? (e.sidebar.registerSimpleModeItems([
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
      const y = e.menu.snapshot("primary.agentScoped").find((p) => p.id === w);
      y && e.menu.replace(n, w, {
        ...y,
        visible: () => !Xt()
      });
    } catch {
    }
    try {
      const y = e.menu.snapshot("primary.settings").find((p) => p.id === w);
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
  fd(e, t), wd(e, t), console.info(
    "[ugsci] Plugin registered: unified Tools & Skills center + compatibility routes, simple-mode navigation active"
  );
}
function Zn() {
  try {
    Sd();
  } catch (e) {
    console.error("[ugsci] Failed to build plugin:", e), setTimeout(Zn, 500);
  }
}
var Ga;
if ((Ga = window.QwenPaw) != null && Ga.host)
  Zn();
else {
  const e = setInterval(() => {
    var t;
    (t = window.QwenPaw) != null && t.host && (clearInterval(e), Zn());
  }, 200);
  setTimeout(() => clearInterval(e), 1e4);
}
function xd(e, t) {
  if (e.match(/^[a-z]+:\/\//i))
    return e;
  if (e.match(/^\/\//))
    return window.location.protocol + e;
  if (e.match(/^[a-z]+:/i))
    return e;
  const n = document.implementation.createHTMLDocument(), r = n.createElement("base"), a = n.createElement("a");
  return n.head.appendChild(r), n.body.appendChild(a), t && (r.href = t), a.href = e, a.href;
}
const kd = /* @__PURE__ */ (() => {
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
function Cd(e) {
  const t = yn(e, "border-left-width"), n = yn(e, "border-right-width");
  return e.clientWidth + t + n;
}
function Td(e) {
  const t = yn(e, "border-top-width"), n = yn(e, "border-bottom-width");
  return e.clientHeight + t + n;
}
function Hl(e, t = {}) {
  const n = t.width || Cd(e), r = t.height || Td(e);
  return { width: n, height: r };
}
function _d() {
  let e, t;
  try {
    t = process;
  } catch {
  }
  const n = t && t.env ? t.env.devicePixelRatio : null;
  return n && (e = parseInt(n, 10), Number.isNaN(e) && (e = 1)), e || window.devicePixelRatio || 1;
}
const Je = 16384;
function Id(e) {
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
async function Ad(e) {
  return Promise.resolve().then(() => new XMLSerializer().serializeToString(e)).then(encodeURIComponent).then((t) => `data:image/svg+xml;charset=utf-8,${t}`);
}
async function zd(e, t, n) {
  const r = "http://www.w3.org/2000/svg", a = document.createElementNS(r, "svg"), l = document.createElementNS(r, "foreignObject");
  return a.setAttribute("width", `${t}`), a.setAttribute("height", `${n}`), a.setAttribute("viewBox", `0 0 ${t} ${n}`), l.setAttribute("width", "100%"), l.setAttribute("height", "100%"), l.setAttribute("x", "0"), l.setAttribute("y", "0"), l.setAttribute("externalResourcesRequired", "true"), a.appendChild(l), l.appendChild(e), Ad(a);
}
const qe = (e, t) => {
  if (e instanceof t)
    return !0;
  const n = Object.getPrototypeOf(e);
  return n === null ? !1 : n.constructor.name === t.name || qe(n, t);
};
function $d(e) {
  const t = e.getPropertyValue("content");
  return `${e.cssText} content: '${t.replace(/'|"/g, "")}';`;
}
function Pd(e, t) {
  return Gl(t).map((n) => {
    const r = e.getPropertyValue(n), a = e.getPropertyPriority(n);
    return `${n}: ${r}${a ? " !important" : ""};`;
  }).join(" ");
}
function Rd(e, t, n, r) {
  const a = `.${e}:${t}`, l = n.cssText ? $d(n) : Pd(n, r);
  return document.createTextNode(`${a}{${l}}`);
}
function La(e, t, n, r) {
  const a = window.getComputedStyle(e, n), l = a.getPropertyValue("content");
  if (l === "" || l === "none")
    return;
  const o = kd();
  try {
    t.className = `${t.className} ${o}`;
  } catch {
    return;
  }
  const s = document.createElement("style");
  s.appendChild(Rd(o, n, a, r)), t.appendChild(s);
}
function Od(e, t, n) {
  La(e, t, ":before", n), La(e, t, ":after", n);
}
const Ba = "application/font-woff", Ua = "image/jpeg", Md = {
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
function Ld(e) {
  const t = /\.([^./]*?)$/g.exec(e);
  return t ? t[1] : "";
}
function Er(e) {
  const t = Ld(e).toLowerCase();
  return Md[t] || "";
}
function Bd(e) {
  return e.split(/,/)[1];
}
function er(e) {
  return e.search(/^(data:)/) !== -1;
}
function Ud(e, t) {
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
const Nn = {};
function jd(e, t, n) {
  let r = e.replace(/\?.*/, "");
  return n && (r = e), /ttf|otf|eot|woff2?/i.test(r) && (r = r.replace(/.*\//, "")), t ? `[${t}]${r}` : r;
}
async function br(e, t, n) {
  const r = jd(e, t, n.includeQueryParams);
  if (Nn[r] != null)
    return Nn[r];
  n.cacheBust && (e += (/\?/.test(e) ? "&" : "?") + (/* @__PURE__ */ new Date()).getTime());
  let a;
  try {
    const l = await Wl(e, n.fetchRequestInit, ({ res: o, result: s }) => (t || (t = o.headers.get("Content-Type") || ""), Bd(s)));
    a = Ud(l, t);
  } catch (l) {
    a = n.imagePlaceholder || "";
    let o = `Failed to fetch resource: ${e}`;
    l && (o = typeof l == "string" ? l : l.message), o && console.warn(o);
  }
  return Nn[r] = a, a;
}
async function Nd(e) {
  const t = e.toDataURL();
  return t === "data:," ? e.cloneNode(!1) : hn(t);
}
async function Dd(e, t) {
  if (e.currentSrc) {
    const l = document.createElement("canvas"), o = l.getContext("2d");
    l.width = e.clientWidth, l.height = e.clientHeight, o == null || o.drawImage(e, 0, 0, l.width, l.height);
    const s = l.toDataURL();
    return hn(s);
  }
  const n = e.poster, r = Er(n), a = await br(n, r, t);
  return hn(a);
}
async function Fd(e, t) {
  var n;
  try {
    if (!((n = e == null ? void 0 : e.contentDocument) === null || n === void 0) && n.body)
      return await Cn(e.contentDocument.body, t, !0);
  } catch {
  }
  return e.cloneNode(!1);
}
async function Gd(e, t) {
  return qe(e, HTMLCanvasElement) ? Nd(e) : qe(e, HTMLVideoElement) ? Dd(e, t) : qe(e, HTMLIFrameElement) ? Fd(e, t) : e.cloneNode(ql(e));
}
const Hd = (e) => e.tagName != null && e.tagName.toUpperCase() === "SLOT", ql = (e) => e.tagName != null && e.tagName.toUpperCase() === "SVG";
async function Wd(e, t, n) {
  var r, a;
  if (ql(t))
    return t;
  let l = [];
  return Hd(e) && e.assignedNodes ? l = it(e.assignedNodes()) : qe(e, HTMLIFrameElement) && (!((r = e.contentDocument) === null || r === void 0) && r.body) ? l = it(e.contentDocument.body.childNodes) : l = it(((a = e.shadowRoot) !== null && a !== void 0 ? a : e).childNodes), l.length === 0 || qe(e, HTMLVideoElement) || await l.reduce((o, s) => o.then(() => Cn(s, n)).then((i) => {
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
    l === "font-size" && o.endsWith("px") && (o = `${Math.floor(parseFloat(o.substring(0, o.length - 2))) - 0.1}px`), qe(e, HTMLIFrameElement) && l === "display" && o === "inline" && (o = "block"), l === "d" && t.getAttribute("d") && (o = `path(${t.getAttribute("d")})`), r.setProperty(l, o, a.getPropertyPriority(l));
  });
}
function Vd(e, t) {
  qe(e, HTMLTextAreaElement) && (t.innerHTML = e.value), qe(e, HTMLInputElement) && t.setAttribute("value", e.value);
}
function Jd(e, t) {
  if (qe(e, HTMLSelectElement)) {
    const n = t, r = Array.from(n.children).find((a) => e.value === a.getAttribute("value"));
    r && r.setAttribute("selected", "");
  }
}
function Kd(e, t, n) {
  return qe(t, Element) && (qd(e, t, n), Od(e, t, n), Vd(e, t), Jd(e, t)), t;
}
async function Xd(e, t) {
  const n = e.querySelectorAll ? e.querySelectorAll("use") : [];
  if (n.length === 0)
    return e;
  const r = {};
  for (let l = 0; l < n.length; l++) {
    const s = n[l].getAttribute("xlink:href");
    if (s) {
      const i = e.querySelector(s), c = document.querySelector(s);
      !i && c && !r[s] && (r[s] = await Cn(c, t, !0));
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
async function Cn(e, t, n) {
  return !n && t.filter && !t.filter(e) ? null : Promise.resolve(e).then((r) => Gd(r, t)).then((r) => Wd(e, r, t)).then((r) => Kd(e, r, t)).then((r) => Xd(r, t));
}
const Vl = /url\((['"]?)([^'"]+?)\1\)/g, Yd = /url\([^)]+\)\s*format\((["']?)([^"']+)\1\)/g, Qd = /src:\s*(?:url\([^)]+\)\s*format\([^)]+\)[,;]\s*)+/g;
function Zd(e) {
  const t = e.replace(/([.*+?^${}()|\[\]\/\\])/g, "\\$1");
  return new RegExp(`(url\\(['"]?)(${t})(['"]?\\))`, "g");
}
function eu(e) {
  const t = [];
  return e.replace(Vl, (n, r, a) => (t.push(a), n)), t.filter((n) => !er(n));
}
async function tu(e, t, n, r, a) {
  try {
    const l = n ? xd(t, n) : t, o = Er(t);
    let s;
    return a || (s = await br(l, o, r)), e.replace(Zd(t), `$1${s}$3`);
  } catch {
  }
  return e;
}
function nu(e, { preferredFontFormat: t }) {
  return t ? e.replace(Qd, (n) => {
    for (; ; ) {
      const [r, , a] = Yd.exec(n) || [];
      if (!a)
        return "";
      if (a === t)
        return `src: ${r};`;
    }
  }) : e;
}
function Jl(e) {
  return e.search(Vl) !== -1;
}
async function Kl(e, t, n) {
  if (!Jl(e))
    return e;
  const r = nu(e, n);
  return eu(r).reduce((l, o) => l.then((s) => tu(s, o, t, n)), Promise.resolve(r));
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
async function ru(e, t) {
  await Et("background", e, t) || await Et("background-image", e, t), await Et("mask", e, t) || await Et("-webkit-mask", e, t) || await Et("mask-image", e, t) || await Et("-webkit-mask-image", e, t);
}
async function au(e, t) {
  const n = qe(e, HTMLImageElement);
  if (!(n && !er(e.src)) && !(qe(e, SVGImageElement) && !er(e.href.baseVal)))
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
async function lu(e, t) {
  const r = it(e.childNodes).map((a) => Xl(a, t));
  await Promise.all(r).then(() => e);
}
async function Xl(e, t) {
  qe(e, Element) && (await ru(e, t), await au(e, t), await lu(e, t));
}
function ou(e, t) {
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
async function iu(e, t) {
  const n = [], r = [];
  return e.forEach((a) => {
    if ("cssRules" in a)
      try {
        it(a.cssRules || []).forEach((l, o) => {
          if (l.type === CSSRule.IMPORT_RULE) {
            let s = o + 1;
            const i = l.href, c = Na(i).then((d) => Da(d, t)).then((d) => Fa(d).forEach((m) => {
              try {
                a.insertRule(m, m.startsWith("@import") ? s += 1 : a.cssRules.length);
              } catch (u) {
                console.error("Error inserting rule from remote css", {
                  rule: m,
                  error: u
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
function su(e) {
  return e.filter((t) => t.type === CSSRule.FONT_FACE_RULE).filter((t) => Jl(t.style.getPropertyValue("src")));
}
async function cu(e, t) {
  if (e.ownerDocument == null)
    throw new Error("Provided element is not within a Document");
  const n = it(e.ownerDocument.styleSheets), r = await iu(n, t);
  return su(r);
}
function Yl(e) {
  return e.trim().replace(/["']/g, "");
}
function du(e) {
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
async function uu(e, t) {
  const n = await cu(e, t), r = du(e);
  return (await Promise.all(n.filter((l) => r.has(Yl(l.style.fontFamily))).map((l) => {
    const o = l.parentStyleSheet ? l.parentStyleSheet.href : null;
    return Kl(l.cssText, o, t);
  }))).join(`
`);
}
async function mu(e, t) {
  const n = t.fontEmbedCSS != null ? t.fontEmbedCSS : t.skipFonts ? null : await uu(e, t);
  if (n) {
    const r = document.createElement("style"), a = document.createTextNode(n);
    r.appendChild(a), e.firstChild ? e.insertBefore(r, e.firstChild) : e.appendChild(r);
  }
}
async function Ql(e, t = {}) {
  const { width: n, height: r } = Hl(e, t), a = await Cn(e, t, !0);
  return await mu(a, t), await Xl(a, t), ou(a, t), await zd(a, n, r);
}
async function Zl(e, t = {}) {
  const { width: n, height: r } = Hl(e, t), a = await Ql(e, t), l = await hn(a), o = document.createElement("canvas"), s = o.getContext("2d"), i = t.pixelRatio || _d(), c = t.canvasWidth || n, d = t.canvasHeight || r;
  return o.width = c * i, o.height = d * i, t.skipAutoScale || Id(o), o.style.width = `${c}`, o.style.height = `${d}`, t.backgroundColor && (s.fillStyle = t.backgroundColor, s.fillRect(0, 0, o.width, o.height)), s.drawImage(l, 0, 0, o.width, o.height), o;
}
async function fu(e, t = {}) {
  return (await Zl(e, t)).toDataURL();
}
const pu = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  toCanvas: Zl,
  toPng: fu,
  toSvg: Ql
}, Symbol.toStringTag, { value: "Module" }));
