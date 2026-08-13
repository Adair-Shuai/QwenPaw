function A() {
  var t;
  const e = (t = window.QwenPaw) == null ? void 0 : t.host;
  if (!e) throw new Error("[ugsci] QwenPaw.host not available");
  return e;
}
function za() {
  try {
    return A().getApiToken() || "";
  } catch {
    return "";
  }
}
function Ft(e) {
  return A().getApiUrl(e);
}
function Aa(e) {
  const t = za();
  return {
    "Content-Type": "application/json",
    ...t ? { Authorization: `Bearer ${t}` } : {},
    ...e
  };
}
function $a(e) {
  const t = new Headers(e), r = {};
  return t.forEach((n, a) => {
    r[a] = n;
  }), r;
}
function Ve(e, t) {
  const r = A(), n = $a(t == null ? void 0 : t.headers);
  return r.fetch ? r.fetch(e, { ...t, headers: n }) : fetch(r.getApiUrl(e), {
    ...t,
    headers: { ...Aa(), ...n }
  });
}
const bt = /* @__PURE__ */ new Map(), Pa = 15e3;
function Oa(e) {
  return e ? e instanceof Headers ? e.get("X-Agent-Id") || e.get("x-agent-id") || "" : e["X-Agent-Id"] || e["x-agent-id"] || "" : "";
}
function Ma(e, t, r) {
  return `${e}:${t}:${r}`;
}
function xt() {
  bt.clear();
}
function hn(e) {
  for (const [t, r] of bt)
    (e ? r.agentId === e : r.agentId) && bt.delete(t);
}
async function ce(e, t) {
  const r = ((t == null ? void 0 : t.method) || "GET").toUpperCase(), { bypassCache: n, ...a } = t || {}, l = Oa(
    a.headers
  ), i = Ma(r, e, l);
  if (r !== "GET" && (l ? hn(l) : xt()), r === "GET" && !n) {
    const c = bt.get(i);
    if (c && Date.now() - c.ts < Pa)
      return c.data;
  }
  const s = await Ve(e, a);
  if (!s.ok) {
    const c = await s.text().catch(() => "");
    throw new Error(c || `HTTP ${s.status}`);
  }
  if (s.status === 204) return null;
  const o = await s.json();
  return r === "GET" && bt.set(i, {
    data: o,
    ts: Date.now(),
    agentId: l || void 0
  }), o;
}
const Be = {
  background: "#0072f5",
  color: "#fff",
  fontSize: 13,
  fontWeight: 600,
  border: "none",
  borderRadius: 8
};
function ft() {
  try {
    return localStorage.getItem("qwenpaw_sidebar_mode") === "simple";
  } catch {
    return !1;
  }
}
function Ht(e, t) {
  const r = A();
  return r.ReactMarkdown && r.remarkGfm ? t.createElement(
    r.ReactMarkdown,
    { remarkPlugins: [r.remarkGfm] },
    e
  ) : e.replace(/\*\*(.+?)\*\*/g, "$1").replace(/\*(.+?)\*/g, "$1").replace(/`(.+?)`/g, "$1").replace(/^#+\s*/gm, "").replace(/^[-*]\s+/gm, "• ");
}
function Wt({
  title: e,
  subtitle: t,
  extra: r
}) {
  const n = A().React, { Space: a } = A().antd;
  return n.createElement(
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
    n.createElement(
      "div",
      null,
      n.createElement(
        "h2",
        { style: { margin: 0, fontSize: 20, fontWeight: 600 } },
        e
      ),
      t ? n.createElement(
        "div",
        { style: { marginTop: 4, fontSize: 13, color: "var(--ant-color-text-tertiary, #8c8c8c)" } },
        t
      ) : null
    ),
    r ? n.createElement(a, null, r) : null
  );
}
async function Jt() {
  const e = await ce("/agents");
  return (e == null ? void 0 : e.agents) || [];
}
async function En(e) {
  return ce(
    `/agents/${encodeURIComponent(e)}`
  );
}
async function qt(e) {
  return await ce(
    `/agents/${encodeURIComponent(e)}/skills`
  ) || [];
}
async function Vt(e = !1) {
  return await ce(`/skills/pool${e ? "?summary=true" : ""}`) || [];
}
async function La(e) {
  const t = await ce(
    `/skills/pool/${encodeURIComponent(e)}/content`
  );
  return (t == null ? void 0 : t.content) || "";
}
async function Ra() {
  return (await ce(
    "/skills/workspaces"
  ) || []).map((t) => ({
    agent_id: t.agent_id,
    agent_name: t.agent_name || "",
    // Current hosts return skill_names. Keep the legacy fallback so the
    // plugin remains compatible with older QwenPaw releases.
    skill_names: Array.isArray(t.skill_names) ? t.skill_names : Array.isArray(t.skills) ? t.skills.map((r) => r.name) : []
  }));
}
function dt(e, t = "") {
  return `/agents/${encodeURIComponent(e)}/skills${t}`;
}
function $r(e) {
  var r;
  const t = [];
  for (const n of e) {
    if (n.enabled === !1) continue;
    const a = (r = n.description) == null ? void 0 : r.trim();
    if (!a) continue;
    const l = (n.name || a).length > 20 ? (n.name || a).substring(0, 18) + "…" : n.name || a;
    let i = a;
    if (i = i.replace(/\*\*(.+?)\*\*/g, "$1").replace(/\*(.+?)\*/g, "$1").replace(/`(.+?)`/g, "$1").replace(/^#+\s*/gm, "").trim(), /^(用于|帮助|提供|支持|实现|完成|分析|计算|生成|创建|检查)/.test(i) ? i = `请${i}` : /^(a |an |the )/i.test(i) ? i = `Help me with ${i}` : /[。？！.?!]$/.test(i) || (i = `帮我${i}`), i.length > 80 && (i = i.substring(0, 77) + "..."), t.push({ label: l, value: i }), t.length >= 4) break;
  }
  return t;
}
async function Ba(e) {
  return await ce("/workspace/files", {
    headers: { "X-Agent-Id": e }
  }) || [];
}
async function Bt(e, t, r) {
  return ce(`/workspace/files/${encodeURIComponent(t)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify({ content: r })
  });
}
async function Ua(e, t, r, n) {
  return ce("/workspace/prompt-files", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify({ filename: t, content: r, enable: n })
  });
}
const ja = /* @__PURE__ */ new Set([
  "CON",
  "PRN",
  "AUX",
  "NUL",
  ...Array.from({ length: 9 }, (e, t) => `COM${t + 1}`),
  ...Array.from({ length: 9 }, (e, t) => `LPT${t + 1}`)
]);
function Na(e) {
  let t = e.trim();
  if (!t) throw new Error("请输入文件名");
  if (/[\\/]/.test(t)) throw new Error("文件名不能包含路径分隔符");
  if (/[<>:\"|?*\u0000-\u001f]/.test(t))
    throw new Error("文件名包含系统不支持的字符");
  if (/[ .]$/.test(t)) throw new Error("文件名不能以空格或句点结尾");
  t.toLowerCase().endsWith(".md") ? t = `${t.slice(0, -3)}.md` : t += ".md";
  const r = t.split(".", 1)[0].toUpperCase();
  if (!t.slice(0, -3)) throw new Error("文件名不能为空");
  if (ja.has(r))
    throw new Error("该文件名是系统保留名称，请更换");
  if (new TextEncoder().encode(t).length > 255)
    throw new Error("文件名过长");
  return t;
}
async function Da(e, t) {
  const r = await En(e);
  r.system_prompt_files = t, await ce(`/agents/${encodeURIComponent(e)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(r)
  });
}
async function vn(e, t) {
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
async function Pr(e, t) {
  await ce(
    dt(e, `/${encodeURIComponent(t)}/enable`),
    {
      method: "POST"
    }
  );
}
async function bn(e, t) {
  await ce(dt(e, `/${encodeURIComponent(t)}`), {
    method: "DELETE"
  });
}
async function Ga(e, t) {
  return ce(dt(e, "/batch-enable"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(t)
  });
}
async function Fa(e, t) {
  return ce(dt(e, "/batch-disable"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(t)
  });
}
async function Ha(e, t) {
  return ce(dt(e, "/batch-delete"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(t)
  });
}
async function wn(e) {
  return await ce("/mcp", {
    headers: { "X-Agent-Id": e }
  }) || [];
}
async function Or(e, t) {
  await ce(`/mcp/${encodeURIComponent(t)}`, {
    method: "DELETE",
    headers: { "X-Agent-Id": e }
  });
}
async function xn(e, t) {
  return ce("/mcp", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify(t)
  });
}
async function Wa(e, t) {
  return ce(
    `/mcp/toggle/${encodeURIComponent(t)}`,
    {
      method: "PATCH",
      headers: { "X-Agent-Id": e }
    }
  );
}
async function Mr(e, t) {
  await ce(
    dt(e, `/${encodeURIComponent(t)}/disable`),
    {
      method: "POST"
    }
  );
}
async function Ja(e) {
  await ce(`/skills/pool/${encodeURIComponent(e)}`, {
    method: "DELETE"
  });
}
function qa(e) {
  const t = (e || "").trim();
  if (!t) return { number: 6, unit: "h" };
  const r = t.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/i);
  if (!r) return { number: 6, unit: "h" };
  const n = parseInt(r[1] || "0", 10), a = parseInt(r[2] || "0", 10), l = parseInt(r[3] || "0", 10), i = n * 60 + a + Math.round(l / 60);
  return i <= 0 ? { number: 6, unit: "h" } : i >= 60 && i % 60 === 0 ? { number: i / 60, unit: "h" } : { number: i, unit: "m" };
}
function Va(e) {
  return e.unit === "h" ? `${e.number}h` : `${e.number}m`;
}
async function Ka(e) {
  return ce("/config/heartbeat", {
    headers: { "X-Agent-Id": e }
  });
}
async function Xa(e, t) {
  return ce("/config/heartbeat", {
    method: "PUT",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify(t)
  });
}
async function Qa(e) {
  await ce("/config/heartbeat/run", {
    method: "POST",
    headers: { "X-Agent-Id": e }
  });
}
async function Ya(e) {
  return ce("/workspace/running-config", {
    headers: { "X-Agent-Id": e }
  });
}
async function Za(e, t) {
  return ce("/workspace/running-config", {
    method: "PUT",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify(t)
  });
}
async function el(e) {
  return (await ce("/workspace/language", {
    headers: { "X-Agent-Id": e }
  })).language || "zh";
}
async function tl(e, t) {
  await ce("/workspace/language", {
    method: "PUT",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify({ language: t })
  });
}
async function nl() {
  return (await ce("/config/user-timezone")).timezone || "UTC";
}
async function rl(e) {
  await ce("/config/user-timezone", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ timezone: e })
  });
}
async function al(e) {
  return await ce("/workspace/system-prompt-files", {
    headers: { "X-Agent-Id": e }
  }) || [];
}
const Yn = ["AGENTS.md", "SOUL.md", "PROFILE.md"];
function Zn({
  items: e,
  max: t = 5,
  color: r = "blue",
  emptyText: n = "无"
}) {
  const a = A().React, { Tag: l } = A().antd;
  return !e || e.length === 0 ? a.createElement(
    "span",
    { style: { fontSize: 12, color: "var(--ant-color-text-quaternary, #bfbfbf)" } },
    n
  ) : a.createElement(
    "div",
    { style: { display: "flex", flexWrap: "wrap", gap: 4 } },
    ...e.slice(0, t).map(
      (i, s) => a.createElement(
        l,
        { key: s, color: r, style: { fontSize: 11, marginRight: 0 } },
        i
      )
    ),
    e.length > t ? a.createElement(
      l,
      { style: { fontSize: 11, marginRight: 0 } },
      `+${e.length - t}`
    ) : null
  );
}
function Lr({
  open: e,
  onClose: t,
  poolSkills: r,
  installedSkillNames: n,
  loading: a,
  onInstall: l
}) {
  const i = A().React, { useState: s, useEffect: o, useMemo: c } = i, { Modal: d, Button: m, Empty: f, Spin: u, Input: p, Tag: y, Tooltip: h, Typography: S } = A().antd, { CheckOutlined: k, SearchOutlined: x } = A().antdIcons || {}, { Text: E } = S, [L, D] = s([]), [F, G] = s("");
  o(() => {
    e && (D([]), G(""));
  }, [e]);
  const j = c(() => {
    if (!F.trim()) return r;
    const b = F.toLowerCase();
    return r.filter(
      (v) => {
        var _, I;
        return v.name.toLowerCase().includes(b) || ((_ = v.description) == null ? void 0 : _.toLowerCase().includes(b)) || ((I = v.tags) == null ? void 0 : I.some((U) => U.toLowerCase().includes(b)));
      }
    );
  }, [r, F]), K = j.filter(
    (b) => !n.includes(b.name)
  ), X = (b) => {
    D(
      (v) => v.includes(b) ? v.filter((_) => _ !== b) : [...v, b]
    );
  }, H = async () => {
    L.length !== 0 && (await l(L), D([]));
  };
  return i.createElement(
    d,
    {
      open: e,
      onCancel: t,
      title: "从技能池选择技能",
      width: 680,
      footer: i.createElement(
        "div",
        {
          style: {
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }
        },
        i.createElement(
          E,
          { type: "secondary", style: { fontSize: 13 } },
          `已选择 ${L.length} 个技能`
        ),
        i.createElement(
          "div",
          { style: { display: "flex", gap: 8 } },
          i.createElement(m, { onClick: t }, "取消"),
          i.createElement(
            m,
            {
              type: "primary",
              onClick: H,
              disabled: L.length === 0
            },
            L.length > 0 ? `添加 (${L.length})` : "添加"
          )
        )
      )
    },
    // Search + bulk actions bar
    i.createElement(
      "div",
      {
        style: {
          marginBottom: 12,
          display: "flex",
          gap: 8,
          alignItems: "center"
        }
      },
      i.createElement(p, {
        placeholder: "搜索技能名称、描述或标签...",
        prefix: x ? i.createElement(x) : void 0,
        value: F,
        onChange: (b) => G(b.target.value),
        allowClear: !0,
        style: { flex: 1 }
      }),
      i.createElement(
        m,
        {
          size: "small",
          type: "primary",
          onClick: () => D(K.map((b) => b.name))
        },
        "全选"
      ),
      i.createElement(
        m,
        {
          size: "small",
          onClick: () => D([])
        },
        "清空"
      )
    ),
    // Skill grid (card style matching Skill Center)
    a ? i.createElement(
      "div",
      { style: { textAlign: "center", padding: 40 } },
      i.createElement(u, { size: "large" })
    ) : j.length === 0 ? i.createElement(f, {
      description: F ? "未找到匹配的技能" : "技能池暂无可用技能",
      image: f.PRESENTED_IMAGE_SIMPLE
    }) : i.createElement(
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
      ...j.map((b) => {
        const v = L.includes(b.name), _ = n.includes(b.name);
        return i.createElement(
          "div",
          {
            key: b.name,
            onClick: () => !_ && X(b.name),
            style: {
              position: "relative",
              padding: "10px 12px",
              border: `1px solid ${v ? "#0072f5" : "var(--ant-color-border-secondary, #e8e8e8)"}`,
              borderRadius: 6,
              cursor: _ ? "not-allowed" : "pointer",
              transition: "all 0.15s ease",
              background: v ? "rgba(0, 114, 245, 0.06)" : _ ? "var(--ant-color-fill-quaternary, #fafafa)" : "var(--ant-color-bg-container, #fff)",
              opacity: _ ? 0.5 : 1,
              minHeight: 64
            }
          },
          v ? i.createElement(
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
            k ? i.createElement(k) : "✓"
          ) : null,
          _ ? i.createElement(
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
          i.createElement(
            "div",
            {
              style: {
                display: "flex",
                alignItems: "center",
                gap: 6,
                marginBottom: 4,
                paddingRight: _ || v ? 24 : 0
              }
            },
            i.createElement(
              "span",
              { style: { fontSize: 16 } },
              b.emoji || "⚡"
            ),
            i.createElement(
              h,
              { title: b.name },
              i.createElement(
                E,
                {
                  strong: !0,
                  style: {
                    fontSize: 13,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap"
                  }
                },
                b.name
              )
            )
          ),
          b.description ? i.createElement(
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
            b.description
          ) : null,
          b.tags && b.tags.length > 0 ? i.createElement(
            "div",
            {
              style: {
                marginTop: 4,
                display: "flex",
                gap: 2,
                flexWrap: "wrap"
              }
            },
            ...b.tags.slice(0, 2).map(
              (I, U) => i.createElement(
                y,
                {
                  key: U,
                  color: "cyan",
                  style: { fontSize: 10, marginRight: 0 }
                },
                I
              )
            )
          ) : null
        );
      })
    )
  );
}
function Rr({
  agentId: e,
  systemPromptFiles: t,
  onRefresh: r
}) {
  const n = A().React, { useState: a, useEffect: l, useCallback: i, useRef: s } = n, {
    List: o,
    Tag: c,
    Switch: d,
    Button: m,
    Modal: f,
    Input: u,
    Spin: p,
    Empty: y,
    message: h,
    Typography: S,
    Segmented: k,
    Alert: x
  } = A().antd, { FileTextOutlined: E, PlusOutlined: L, EditOutlined: D, ReloadOutlined: F } = A().antdIcons || {}, { Text: G } = S, [j, K] = a([]), [X, H] = a(!0), [b, v] = a(
    t || []
  ), [_, I] = a(!1), [U, $] = a(null), [O, z] = a(""), [w, le] = a(""), [oe, B] = a(!1), [R, ne] = a("source"), Z = s(0), W = i(async () => {
    const Q = ++Z.current;
    H(!0);
    try {
      const Y = await Ba(e);
      Q === Z.current && K(Y);
    } catch (Y) {
      Q === Z.current && (h.error(Y.message || "加载工作区文档失败"), K([]));
    } finally {
      Q === Z.current && H(!1);
    }
  }, [e]);
  l(() => {
    W();
  }, [W]), l(() => {
    v(t || []);
  }, [t]);
  const me = async (Q, Y) => {
    const se = new Set(b);
    if (Y)
      se.add(Q);
    else {
      if (Yn.includes(Q) && Q === "AGENTS.md") {
        h.warning("AGENTS.md 是核心文件，不能停用");
        return;
      }
      se.delete(Q);
    }
    const he = Array.from(se);
    v(he);
    try {
      await Da(e, he), h.success(Y ? "已启用记忆文件" : "已停用记忆文件"), r();
    } catch (we) {
      h.error(we.message || "更新失败"), v(t || []);
    }
  }, M = async (Q) => {
    try {
      const Y = await ce(
        `/workspace/files/${encodeURIComponent(Q)}`,
        { headers: { "X-Agent-Id": e } }
      );
      $(Q), z(Y.content || ""), ne("source"), I(!0);
    } catch (Y) {
      h.error(Y.message || "读取文件失败");
    }
  }, ie = () => {
    $(null), z(""), le(""), ne("source"), I(!0);
  }, ue = async () => {
    let Q;
    try {
      Q = Na(U || w);
    } catch (Y) {
      h.warning(Y.message || "文件名无效");
      return;
    }
    if (!O.trim()) {
      h.warning("Markdown 文档不能为空");
      return;
    }
    if (new TextEncoder().encode(O).length > 1024 * 1024) {
      h.warning("Markdown 文档不能超过 1 MB");
      return;
    }
    B(!0);
    try {
      if (U)
        await Bt(e, Q, O);
      else {
        const Y = await Ua(
          e,
          Q,
          O,
          !0
        );
        v(Y.system_prompt_files);
      }
      h.success("保存成功"), I(!1), W(), r();
    } catch (Y) {
      const se = Y != null && Y.message ? `：${Y.message}` : "";
      h.error(
        U ? (Y == null ? void 0 : Y.message) || "保存失败" : `创建并挂载失败，服务端已回滚文件${se}`
      );
    } finally {
      B(!1);
    }
  };
  return X ? n.createElement(
    "div",
    { style: { textAlign: "center", padding: 40 } },
    n.createElement(p, { size: "large" })
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
        "div",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        E ? n.createElement(E, {
          style: { fontSize: 14, color: "#1677ff" }
        }) : null,
        n.createElement(
          G,
          { strong: !0 },
          `工作区文档 (${j.length})`
        ),
        n.createElement(
          G,
          { type: "secondary", style: { fontSize: 12 } },
          `· ${b.length} 个已挂载到系统提示`
        )
      ),
      n.createElement(
        "div",
        { style: { display: "flex", gap: 8 } },
        n.createElement(
          m,
          {
            size: "small",
            icon: F ? n.createElement(F) : void 0,
            onClick: W
          },
          "刷新"
        ),
        n.createElement(
          m,
          {
            type: "primary",
            size: "small",
            icon: L ? n.createElement(L) : void 0,
            onClick: ie
          },
          "新建 Markdown 文档"
        )
      )
    ),
    j.length === 0 ? n.createElement(y, {
      description: "暂无 Markdown 文档，点击「新建 Markdown 文档」添加",
      image: y.PRESENTED_IMAGE_SIMPLE
    }) : n.createElement(o, {
      dataSource: j,
      renderItem: (Q) => {
        const Y = b.includes(Q.filename), se = Yn.includes(Q.filename);
        return n.createElement(
          o.Item,
          {
            actions: [
              n.createElement(
                m,
                {
                  type: "link",
                  size: "small",
                  icon: D ? n.createElement(D) : void 0,
                  onClick: () => M(Q.filename)
                },
                "编辑"
              )
            ]
          },
          n.createElement(o.Item.Meta, {
            avatar: n.createElement(E, {
              style: {
                fontSize: 20,
                color: Y ? "#1677ff" : "var(--ant-color-text-quaternary, #bfbfbf)"
              }
            }),
            title: n.createElement(
              "div",
              {
                style: {
                  display: "flex",
                  alignItems: "center",
                  gap: 6
                }
              },
              n.createElement(G, null, Q.filename),
              se ? n.createElement(
                c,
                { color: "default", style: { fontSize: 10 } },
                "内置"
              ) : n.createElement(
                c,
                { color: "cyan", style: { fontSize: 10 } },
                "工作文档"
              )
            ),
            description: n.createElement(
              "div",
              { style: { fontSize: 12 } },
              `${(Q.size / 1024).toFixed(1)} KB · 修改于 ${new Date(Q.modified_time).toLocaleString()}`
            )
          }),
          n.createElement(d, {
            checked: Y,
            size: "small",
            onChange: (he) => me(Q.filename, he)
          })
        );
      }
    }),
    // Edit/New file modal
    n.createElement(
      f,
      {
        open: _,
        onCancel: () => I(!1),
        title: U ? `编辑 ${U}` : "新建 Markdown 文档",
        width: 700,
        onOk: ue,
        confirmLoading: oe,
        okText: "保存"
      },
      U ? null : n.createElement(
        "div",
        { style: { marginBottom: 12 } },
        n.createElement(u, {
          placeholder: "文件名（如：油藏工程记忆库.md）",
          value: w,
          onChange: (Q) => le(Q.target.value),
          addonAfter: w.endsWith(".md") ? "" : ".md"
        })
      ),
      n.createElement(
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
        n.createElement(k, {
          size: "small",
          value: R,
          options: [
            { label: "源码", value: "source" },
            { label: "预览", value: "preview" }
          ],
          onChange: (Q) => ne(Q)
        }),
        n.createElement(
          G,
          { type: "secondary", style: { fontSize: 12 } },
          `${O.length} 字符 · 约 ${Math.ceil(O.length / 4)} tokens · ${U && b.includes(U) ? "已挂载" : U ? "未挂载" : "保存后自动挂载"}`
        )
      ),
      O.trim() ? null : n.createElement(x, {
        type: "warning",
        showIcon: !0,
        message: "文档内容为空，保存前需要填写 Markdown 内容",
        style: { marginBottom: 10 }
      }),
      R === "source" ? n.createElement(u.TextArea, {
        value: O,
        onChange: (Q) => z(Q.target.value),
        rows: 14,
        placeholder: `输入 Markdown 内容...

例如：
# 某区块油藏基础参数

- 地层压力: 25 MPa
- 地层温度: 85°C
- 原油密度: 0.85 g/cm³`,
        style: { fontFamily: "monospace", fontSize: 13 }
      }) : n.createElement(
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
        Ht(O, n)
      )
    )
  );
}
function ll({
  skills: e,
  agentId: t
}) {
  const r = A().React, { useMemo: n } = r, {
    List: a,
    Tag: l,
    Typography: i,
    Empty: s,
    Button: o,
    message: c
  } = A().antd, { ThunderboltOutlined: d, CopyOutlined: m } = A().antdIcons || {}, { Text: f } = i, u = n(() => $r(e), [e]), p = (h) => {
    try {
      const S = A();
      S.setSelectedAgent && S.setSelectedAgent(t);
    } catch {
    }
    try {
      sessionStorage.setItem("ugsci_pending_prompt", h.value);
    } catch {
    }
    window.history.pushState({}, "", "/chat"), window.dispatchEvent(new PopStateEvent("popstate"));
  }, y = (h) => {
    var S;
    (S = navigator.clipboard) == null || S.writeText(h.value).then(() => {
      c.success("已复制到剪贴板");
    });
  };
  return u.length === 0 ? r.createElement(s, {
    description: "暂无推荐提问，请先为专家添加技能",
    image: s.PRESENTED_IMAGE_SIMPLE
  }) : r.createElement(
    "div",
    null,
    r.createElement(
      "div",
      {
        style: {
          display: "flex",
          alignItems: "center",
          gap: 6,
          marginBottom: 12
        }
      },
      d ? r.createElement(d, {
        style: { fontSize: 14, color: "#1677ff" }
      }) : null,
      r.createElement(
        f,
        { strong: !0 },
        `推荐提问 (${u.length})`
      ),
      r.createElement(
        f,
        { type: "secondary", style: { fontSize: 12 } },
        "· 从技能描述中自动提取"
      )
    ),
    r.createElement(a, {
      dataSource: u,
      renderItem: (h, S) => r.createElement(
        a.Item,
        {
          actions: [
            r.createElement(
              o,
              {
                type: "link",
                size: "small",
                icon: m ? r.createElement(m) : void 0,
                onClick: () => y(h)
              },
              "复制"
            )
          ]
        },
        r.createElement(a.Item.Meta, {
          avatar: r.createElement(
            l,
            { color: "blue", style: { borderRadius: "50%" } },
            `${S + 1}`
          ),
          title: r.createElement(
            "div",
            {
              style: {
                cursor: "pointer",
                color: "#1677ff"
              },
              onClick: () => p(h)
            },
            h.value
          ),
          description: r.createElement(
            f,
            { type: "secondary", style: { fontSize: 12 } },
            h.label
          )
        })
      )
    })
  );
}
const ot = {
  marginBottom: 4,
  fontSize: 13,
  fontWeight: 500,
  color: "rgba(0,0,0,0.85)",
  display: "flex",
  alignItems: "center",
  gap: 4
}, Br = { marginBottom: 16 }, Ur = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "0 16px",
  marginBottom: 16
}, Qe = {
  fontSize: 13,
  fontWeight: 600,
  color: "rgba(0,0,0,0.85)",
  marginBottom: 12,
  paddingBottom: 8,
  borderBottom: "1px solid #f0f0f0"
}, jr = {
  fontSize: 12,
  color: "rgba(0,0,0,0.45)",
  marginLeft: 8
};
function ol({ agentId: e }) {
  const t = A().React, { useState: r, useEffect: n, useCallback: a } = t, {
    Switch: l,
    InputNumber: i,
    Select: s,
    Button: o,
    Spin: c,
    Space: d,
    Typography: m,
    message: f
  } = A().antd, { PlayCircleOutlined: u, SaveOutlined: p } = A().antdIcons || {}, { Text: y } = m, [h, S] = r(!0), [k, x] = r(!1), [E, L] = r(!1), [D, F] = r(!1), [G, j] = r(6), [K, X] = r("h"), [H, b] = r("main"), [v, _] = r(300), [I, U] = r(!1), [$, O] = r("08:00"), [z, w] = r("22:00"), le = a(async () => {
    var W, me;
    S(!0);
    try {
      const M = await Ka(e), ie = qa(M.every ?? "6h");
      F(M.enabled ?? !1), j(ie.number), X(ie.unit), b(M.target ?? "main"), _(M.timeoutSeconds ?? 300), U(!!M.activeHours), O(((W = M.activeHours) == null ? void 0 : W.start) ?? "08:00"), w(((me = M.activeHours) == null ? void 0 : me.end) ?? "22:00");
    } catch (M) {
      f.error(M.message || "加载心跳配置失败");
    } finally {
      S(!1);
    }
  }, [e]);
  n(() => {
    le();
  }, [le]);
  const oe = async () => {
    x(!0);
    try {
      await Xa(e, {
        enabled: D,
        every: Va({ number: G, unit: K }),
        target: H,
        timeoutSeconds: v,
        activeHours: I && $ && z ? { start: $, end: z } : void 0
      }), f.success("心跳配置已保存");
    } catch (W) {
      f.error(W.message || "保存心跳配置失败");
    } finally {
      x(!1);
    }
  }, B = async () => {
    L(!0);
    try {
      await Qa(e), f.success("已触发心跳检查");
    } catch (W) {
      f.error(W.message || "触发心跳失败");
    } finally {
      L(!1);
    }
  };
  if (h)
    return t.createElement(
      "div",
      { style: { textAlign: "center", padding: 40 } },
      t.createElement(c, { size: "large" })
    );
  const R = (W, me, M) => t.createElement(
    "div",
    { style: Br },
    t.createElement("div", { style: ot }, W),
    me,
    M ? t.createElement(
      y,
      { type: "secondary", style: jr },
      M
    ) : null
  ), ne = (W, me, M, ie) => t.createElement(
    "div",
    { style: Ur },
    t.createElement(
      "div",
      null,
      t.createElement("div", { style: ot }, W),
      me
    ),
    t.createElement(
      "div",
      null,
      t.createElement("div", { style: ot }, M),
      ie
    )
  ), { Divider: Z } = A().antd;
  return t.createElement(
    "div",
    { style: { paddingBottom: 8 } },
    // ── Section: 基本设置 ──
    t.createElement("div", { style: Qe }, "基本设置"),
    R(
      "启用心跳",
      t.createElement(l, {
        checked: D,
        onChange: (W) => F(W)
      }),
      D ? "已启用，专家将定期自检" : "已停用"
    ),
    ne(
      "检查频率",
      t.createElement(
        d,
        null,
        t.createElement(i, {
          min: 1,
          value: G,
          onChange: (W) => j(W ?? 1),
          style: { width: "100%" }
        }),
        t.createElement(s, {
          value: K,
          onChange: (W) => X(W),
          style: { width: 90 },
          options: [
            { value: "m", label: "分钟" },
            { value: "h", label: "小时" }
          ]
        })
      ),
      "心跳目标",
      t.createElement(s, {
        value: H,
        onChange: (W) => b(W),
        style: { width: "100%" },
        options: [
          { value: "main", label: "主会话 (main)" },
          { value: "last", label: "最近会话 (last)" },
          { value: "inbox", label: "收件箱 (inbox)" }
        ]
      })
    ),
    R(
      "超时时间 (秒)",
      t.createElement(i, {
        min: 1,
        max: 3600,
        value: v,
        onChange: (W) => _(W ?? 300),
        style: { width: 200 }
      })
    ),
    // ── Section: 活跃时段 ──
    t.createElement(Z, { style: { margin: "8px 0 16px" } }),
    t.createElement("div", { style: Qe }, "活跃时段"),
    R(
      "启用活跃时段限制",
      t.createElement(l, {
        checked: I,
        onChange: (W) => U(W)
      }),
      "仅在指定时段内触发心跳"
    ),
    I ? ne(
      "开始时间",
      t.createElement("input", {
        type: "time",
        value: $,
        onChange: (W) => O(W.target.value),
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
        value: z,
        onChange: (W) => w(W.target.value),
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
        o,
        {
          type: "primary",
          icon: p ? t.createElement(p) : void 0,
          loading: k,
          onClick: oe,
          style: Be
        },
        "保存配置"
      ),
      t.createElement(
        o,
        {
          icon: u ? t.createElement(u) : void 0,
          loading: E,
          onClick: B
        },
        "立即执行"
      )
    )
  );
}
function il({
  agentId: e,
  onRefresh: t
}) {
  const r = A().React, { useState: n, useEffect: a, useCallback: l } = r, {
    List: i,
    Tag: s,
    Switch: o,
    Button: c,
    Empty: d,
    Spin: m,
    Typography: f,
    message: u
  } = A().antd, { PlusOutlined: p, ReloadOutlined: y, DeleteOutlined: h } = A().antdIcons || {}, { Text: S, Paragraph: k } = f, [x, E] = n([]), [L, D] = n(!0), [F, G] = n(!1), [j, K] = n([]), [X, H] = n(!1), b = l(async () => {
    D(!0);
    try {
      const O = await qt(e);
      E(O);
    } catch (O) {
      u.error(O.message || "加载技能失败"), E([]);
    } finally {
      D(!1);
    }
  }, [e]);
  a(() => {
    b();
  }, [b]);
  const v = async () => {
    G(!0), H(!0);
    try {
      const O = await Vt(!0);
      K(O);
    } catch (O) {
      u.error(O.message || "加载技能池失败");
    } finally {
      H(!1);
    }
  }, _ = async (O) => {
    let z = 0, w = 0;
    for (const le of O)
      try {
        await vn(e, le), z++;
      } catch {
        w++;
      }
    z > 0 ? (u.success(
      `成功添加 ${z} 个技能${w > 0 ? `，${w} 个失败` : ""}`
    ), b(), t()) : w > 0 && u.error("添加技能失败"), G(!1);
  }, I = async (O, z) => {
    try {
      z ? await Pr(e, O.name) : await Mr(e, O.name), u.success(z ? "已启用" : "已停用"), b(), t();
    } catch (w) {
      u.error(w.message || "操作失败");
    }
  }, U = async (O) => {
    try {
      await bn(e, O), u.success(`技能「${O}」已移除`), b(), t();
    } catch (z) {
      u.error(z.message || "移除技能失败");
    }
  };
  if (L)
    return r.createElement(
      "div",
      { style: { textAlign: "center", padding: 40 } },
      r.createElement(m, { size: "large" })
    );
  const $ = x.filter((O) => O.enabled !== !1);
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
          marginBottom: 12
        }
      },
      r.createElement(
        S,
        { strong: !0 },
        `技能列表 (${x.length}，已启用 ${$.length})`
      ),
      r.createElement(
        "div",
        { style: { display: "flex", gap: 8 } },
        r.createElement(
          c,
          {
            size: "small",
            icon: y ? r.createElement(y) : void 0,
            onClick: () => {
              xt(), b();
            }
          },
          "刷新"
        ),
        r.createElement(
          c,
          {
            type: "primary",
            size: "small",
            icon: p ? r.createElement(p) : void 0,
            onClick: v,
            style: Be
          },
          "从技能池添加"
        )
      )
    ),
    x.length === 0 ? r.createElement(d, {
      description: "该专家暂无技能",
      image: d.PRESENTED_IMAGE_SIMPLE
    }) : r.createElement(i, {
      dataSource: x,
      renderItem: (O) => r.createElement(
        i.Item,
        {
          actions: [
            r.createElement(o, {
              key: "toggle",
              size: "small",
              checked: O.enabled !== !1,
              onChange: (z) => I(O, z)
            }),
            r.createElement(
              c,
              {
                key: "del",
                type: "link",
                size: "small",
                danger: !0,
                icon: h ? r.createElement(h) : void 0,
                onClick: () => U(O.name)
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
            O.emoji ? r.createElement(
              "span",
              { style: { fontSize: 16 } },
              O.emoji
            ) : null,
            r.createElement(S, { strong: !0 }, O.name),
            O.version_text ? r.createElement(
              s,
              { style: { fontSize: 10 } },
              `v${O.version_text}`
            ) : null
          ),
          O.description ? r.createElement(
            k,
            {
              type: "secondary",
              style: { fontSize: 12, margin: 0 },
              ellipsis: { rows: 2 }
            },
            O.description
          ) : null
        )
      )
    }),
    r.createElement(Lr, {
      open: F,
      onClose: () => G(!1),
      poolSkills: j,
      installedSkillNames: x.map((O) => O.name),
      loading: X,
      onInstall: _
    })
  );
}
function sl({
  agentId: e,
  onRefresh: t,
  isActive: r
}) {
  const n = A().React, { useState: a, useEffect: l, useCallback: i } = n, {
    List: s,
    Tag: o,
    Button: c,
    Empty: d,
    Spin: m,
    Modal: f,
    Input: u,
    Typography: p,
    message: y
  } = A().antd, { PlusOutlined: h, ReloadOutlined: S, DeleteOutlined: k } = A().antdIcons || {}, { Text: x, Paragraph: E } = p, { TextArea: L } = u, [D, F] = a([]), [G, j] = a(!0), [K, X] = a(!1), [H, b] = a(`{
  "mcpServers": {
    "example-client": {
      "command": "npx",
      "args": ["-y", "@example/mcp-server"],
      "env": {}
    }
  }
}`), [v, _] = a(!1), I = i(async () => {
    j(!0);
    try {
      const z = await wn(e);
      F(z);
    } catch (z) {
      y.error(z.message || "加载 MCP 失败"), F([]);
    } finally {
      j(!1);
    }
  }, [e]);
  l(() => {
    I();
  }, [I]), l(() => {
    r && I();
  }, [r, I]);
  const U = async (z) => {
    try {
      await Wa(e, z), y.success("已切换 MCP 状态"), I(), t();
    } catch (w) {
      y.error(w.message || "切换失败");
    }
  }, $ = async (z) => {
    try {
      await Or(e, z), y.success(`MCP「${z}」已移除`), I(), t();
    } catch (w) {
      y.error(w.message || "移除 MCP 失败");
    }
  }, O = async () => {
    _(!0);
    try {
      const z = JSON.parse(H), w = z.mcpServers || z, le = Object.entries(w);
      if (le.length === 0) {
        y.warning("未找到 MCP 客户端配置");
        return;
      }
      for (const [oe, B] of le) {
        const R = B, ne = R.url ? "streamable_http" : "stdio";
        await xn(e, {
          client_key: oe,
          client: {
            name: R.name || oe,
            description: R.description || "",
            enabled: !0,
            transport: ne,
            url: R.url || "",
            command: R.command || "",
            args: R.args || [],
            env: R.env || {},
            cwd: R.cwd || "",
            headers: R.headers || {}
          }
        });
      }
      y.success("MCP 客户端已创建"), X(!1), I(), t();
    } catch (z) {
      z instanceof SyntaxError ? y.error("JSON 格式错误：" + z.message) : y.error(z.message || "创建 MCP 失败");
    } finally {
      _(!1);
    }
  };
  return G ? n.createElement(
    "div",
    { style: { textAlign: "center", padding: 40 } },
    n.createElement(m, { size: "large" })
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
      n.createElement(x, { strong: !0 }, `MCP 客户端 (${D.length})`),
      n.createElement(
        "div",
        { style: { display: "flex", gap: 8 } },
        n.createElement(
          c,
          {
            size: "small",
            icon: S ? n.createElement(S) : void 0,
            onClick: () => {
              xt(), I();
            }
          },
          "刷新"
        ),
        n.createElement(
          c,
          {
            type: "primary",
            size: "small",
            icon: h ? n.createElement(h) : void 0,
            onClick: () => X(!0),
            style: Be
          },
          "添加 MCP"
        )
      )
    ),
    D.length === 0 ? n.createElement(d, {
      description: "该专家暂无 MCP 客户端",
      image: d.PRESENTED_IMAGE_SIMPLE
    }) : n.createElement(s, {
      dataSource: D,
      renderItem: (z) => n.createElement(
        s.Item,
        {
          actions: [
            n.createElement(
              c,
              {
                key: "toggle",
                size: "small",
                onClick: () => U(z.key)
              },
              z.enabled ? "停用" : "启用"
            ),
            n.createElement(
              c,
              {
                key: "del",
                type: "link",
                size: "small",
                danger: !0,
                icon: k ? n.createElement(k) : void 0,
                onClick: () => $(z.key)
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
            n.createElement("span", { style: { fontSize: 14 } }, "🔌"),
            n.createElement(x, { strong: !0 }, z.name || z.key),
            n.createElement(
              o,
              {
                color: z.enabled ? "green" : "default",
                style: { fontSize: 10 }
              },
              z.enabled ? "启用" : "停用"
            ),
            n.createElement(
              o,
              { color: "purple", style: { fontSize: 10 } },
              z.transport
            )
          ),
          z.description ? n.createElement(
            E,
            {
              type: "secondary",
              style: { fontSize: 12, margin: 0 },
              ellipsis: { rows: 2 }
            },
            z.description
          ) : null,
          z.tools && z.tools.length > 0 ? n.createElement(
            "div",
            { style: { marginTop: 4, fontSize: 11, color: "var(--ant-color-text-tertiary, #8c8c8c)" } },
            `提供 ${z.tools.length} 个工具`
          ) : null
        )
      )
    }),
    // Create MCP modal
    n.createElement(
      f,
      {
        open: K,
        title: "添加 MCP 客户端 (JSON)",
        onCancel: () => X(!1),
        onOk: O,
        confirmLoading: v,
        okText: "创建",
        width: 560
      },
      n.createElement(
        "div",
        { style: { marginBottom: 8, fontSize: 12, color: "var(--ant-color-text-tertiary, #8c8c8c)" } },
        "粘贴 MCP 配置 JSON（支持 mcpServers 格式），将创建到当前专家工作区："
      ),
      n.createElement(L, {
        value: H,
        onChange: (z) => b(z.target.value),
        rows: 12,
        style: { fontFamily: "monospace", fontSize: 12 }
      })
    )
  );
}
function cl({ agentId: e }) {
  const t = A().React, { useState: r, useEffect: n, useCallback: a, useRef: l } = t, {
    Card: i,
    InputNumber: s,
    Input: o,
    Select: c,
    Switch: d,
    Button: m,
    Spin: f,
    Space: u,
    Typography: p,
    Divider: y,
    message: h
  } = A().antd, { SaveOutlined: S } = A().antdIcons || {}, { Text: k } = p, [x, E] = r(!0), [L, D] = r(!1), F = l(null), [G, j] = r(60), [K, X] = r(""), [H, b] = r(!0), [v, _] = r(30), [I, U] = r("zh"), [$, O] = r("UTC"), [z, w] = r(!0), [le, oe] = r(100), [B, R] = r(!0), [ne, Z] = r(3), [W, me] = r(1), [M, ie] = r(!0), [ue, Q] = r(3), [Y, se] = r(2), [he, we] = r(60), [Ae, xe] = r(1), [ee, be] = r(0), [Ee, te] = r(1), [de, fe] = r(0), [V, C] = r(30), [ge, q] = r(50), [T, re] = r("light"), [pe, Ie] = r("scroll"), [Le, Ne] = r("remelight"), [Re, Ge] = r("AUTO"), et = a(async () => {
    var ae, ze, $e, Oe, We, Je;
    E(!0);
    try {
      const [_e, St, Xt] = await Promise.all([
        Ya(e),
        el(e).catch(() => "zh"),
        nl().catch(() => "UTC")
      ]);
      F.current = _e, j(_e.shell_command_timeout ?? 60), X(_e.shell_command_executable ?? "");
      const ut = _e.auto_title_config ?? { enabled: !0, timeout_seconds: 30 };
      b(ut.enabled ?? !0), _(ut.timeout_seconds ?? 30), U(St), O(Xt);
      const Ke = _e.loop ?? {};
      w(((ae = Ke.iteration) == null ? void 0 : ae.enabled) ?? !0), oe(((ze = Ke.iteration) == null ? void 0 : ze.max_iterations) ?? _e.max_iters ?? 100), R((($e = Ke.doom_loop) == null ? void 0 : $e.enabled) ?? !0), Z(((Oe = Ke.doom_loop) == null ? void 0 : Oe.window_size) ?? 3), me(((We = Ke.doom_loop) == null ? void 0 : We.similarity_threshold) ?? 1), ie(_e.llm_retry_enabled ?? !0), Q(_e.llm_max_retries ?? 3), se(_e.llm_backoff_base ?? 2), we(_e.llm_backoff_cap ?? 60), xe(_e.llm_max_concurrent ?? 1), be(_e.llm_max_qpm ?? 0), te(_e.llm_rate_limit_pause ?? 1), fe(_e.llm_rate_limit_jitter ?? 0), C(_e.llm_acquire_timeout ?? 30), q(_e.history_max_length ?? 50), re(_e.context_manager_backend ?? "light"), Ie(((Je = _e.light_context_config) == null ? void 0 : Je.strategy) ?? "scroll"), Ne(_e.memory_manager_backend ?? "remelight"), Ge(_e.approval_level ?? "AUTO");
    } catch (_e) {
      h.error(_e.message || "加载运行配置失败");
    } finally {
      E(!1);
    }
  }, [e]);
  n(() => {
    et();
  }, [et]);
  const De = async () => {
    var ze, $e;
    const ae = F.current;
    if (ae) {
      D(!0);
      try {
        const Oe = {
          ...ae,
          max_iters: le,
          loop: {
            ...ae.loop ?? {},
            iteration: { enabled: z, max_iterations: le },
            doom_loop: {
              enabled: B,
              window_size: ne,
              similarity_threshold: W,
              stages: (($e = (ze = ae.loop) == null ? void 0 : ze.doom_loop) == null ? void 0 : $e.stages) ?? []
            }
          },
          shell_command_timeout: G,
          shell_command_executable: K,
          auto_title_config: {
            enabled: H,
            timeout_seconds: v
          },
          llm_retry_enabled: M,
          llm_max_retries: ue,
          llm_backoff_base: Y,
          llm_backoff_cap: he,
          llm_max_concurrent: Ae,
          llm_max_qpm: ee,
          llm_rate_limit_pause: Ee,
          llm_rate_limit_jitter: de,
          llm_acquire_timeout: V,
          history_max_length: ge,
          context_manager_backend: T,
          light_context_config: {
            ...ae.light_context_config ?? {},
            strategy: pe
          },
          memory_manager_backend: Le,
          approval_level: Re
        };
        await Za(e, Oe), F.current = Oe, I && await tl(e, I).catch(() => {
        }), $ && await rl($).catch(() => {
        }), h.success("运行配置已保存");
      } catch (Oe) {
        h.error(Oe.message || "保存运行配置失败");
      } finally {
        D(!1);
      }
    }
  };
  if (x)
    return t.createElement(
      "div",
      { style: { textAlign: "center", padding: 40 } },
      t.createElement(f, { size: "large" })
    );
  const Te = (ae, ze, $e) => t.createElement(
    "div",
    { style: Br },
    t.createElement("div", { style: ot }, ae),
    ze,
    $e ? t.createElement(
      k,
      { type: "secondary", style: jr },
      $e
    ) : null
  ), Me = (ae, ze, $e, Oe) => t.createElement(
    "div",
    { style: Ur },
    t.createElement(
      "div",
      null,
      t.createElement("div", { style: ot }, ae),
      ze
    ),
    t.createElement(
      "div",
      null,
      t.createElement("div", { style: ot }, $e),
      Oe
    )
  );
  return t.createElement(
    "div",
    { style: { paddingBottom: 8 } },
    // ── Section: 基础设置 ──
    t.createElement(
      "div",
      { style: Qe },
      "基础设置"
    ),
    Me(
      "Shell 命令超时 (秒)",
      t.createElement(s, {
        min: 1,
        value: G,
        onChange: (ae) => j(ae ?? 60),
        style: { width: "100%" }
      }),
      "Shell 可执行文件",
      t.createElement(o, {
        value: K,
        onChange: (ae) => X(ae.target.value),
        placeholder: "留空使用系统默认",
        style: { width: "100%" }
      })
    ),
    Me(
      "语言",
      t.createElement(c, {
        value: I,
        onChange: (ae) => U(ae),
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
        value: $,
        onChange: (ae) => O(ae),
        style: { width: "100%" },
        showSearch: !0,
        filterOption: (ae, ze) => {
          var $e;
          return ((($e = ze == null ? void 0 : ze.label) == null ? void 0 : $e.toString()) || "").toLowerCase().includes(ae.toLowerCase());
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
        ].map((ae) => ({ value: ae, label: ae }))
      })
    ),
    Me(
      "自动生成会话标题",
      t.createElement(u, null, t.createElement(d, {
        checked: H,
        onChange: (ae) => b(ae)
      })),
      "标题生成超时 (秒)",
      t.createElement(s, {
        min: 5,
        value: v,
        onChange: (ae) => _(ae ?? 30),
        style: { width: "100%" },
        disabled: !H
      })
    ),
    // ── Section: 审批级别 ──
    t.createElement(y, { style: { margin: "8px 0 16px" } }),
    t.createElement("div", { style: Qe }, "审批级别"),
    Te(
      "工具执行审批",
      t.createElement(c, {
        value: Re,
        onChange: (ae) => Ge(ae),
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
    t.createElement("div", { style: Qe }, "迭代与循环"),
    Te(
      "启用迭代限制",
      t.createElement(d, {
        checked: z,
        onChange: (ae) => w(ae)
      }),
      "停止 Agent 前的最大循环轮次"
    ),
    z ? Te(
      "最大迭代次数",
      t.createElement(s, {
        min: 1,
        max: 500,
        value: le,
        onChange: (ae) => oe(ae ?? 100),
        style: { width: "100%" }
      })
    ) : null,
    Te(
      "启用重复循环保护",
      t.createElement(d, {
        checked: B,
        onChange: (ae) => R(ae)
      }),
      "检测并阻止重复操作循环"
    ),
    B ? Me(
      "检测窗口大小",
      t.createElement(s, {
        min: 2,
        max: 20,
        value: ne,
        onChange: (ae) => Z(ae ?? 3),
        style: { width: "100%" }
      }),
      "相似度阈值",
      t.createElement(s, {
        min: 0,
        max: 1,
        step: 0.05,
        value: W,
        onChange: (ae) => me(ae ?? 1),
        style: { width: "100%" }
      })
    ) : null,
    // ── Section: LLM 重试 ──
    t.createElement(y, { style: { margin: "8px 0 16px" } }),
    t.createElement("div", { style: Qe }, "LLM 重试"),
    Te(
      "启用 LLM 重试",
      t.createElement(d, {
        checked: M,
        onChange: (ae) => ie(ae)
      })
    ),
    Me(
      "最大重试次数",
      t.createElement(s, {
        min: 1,
        value: ue,
        onChange: (ae) => Q(ae ?? 3),
        style: { width: "100%" },
        disabled: !M
      }),
      "退避基数 (秒)",
      t.createElement(s, {
        min: 0.1,
        step: 0.1,
        value: Y,
        onChange: (ae) => se(ae ?? 2),
        style: { width: "100%" },
        disabled: !M
      })
    ),
    Te(
      "退避上限 (秒)",
      t.createElement(s, {
        min: 0.5,
        step: 0.5,
        value: he,
        onChange: (ae) => we(ae ?? 60),
        style: { width: 200 },
        disabled: !M
      })
    ),
    // ── Section: LLM 限流 ──
    t.createElement(y, { style: { margin: "8px 0 16px" } }),
    t.createElement("div", { style: Qe }, "LLM 限流"),
    Me(
      "最大并发数",
      t.createElement(s, {
        min: 1,
        value: Ae,
        onChange: (ae) => xe(ae ?? 1),
        style: { width: "100%" }
      }),
      "最大 QPM (0=不限)",
      t.createElement(s, {
        min: 0,
        step: 10,
        value: ee,
        onChange: (ae) => be(ae ?? 0),
        style: { width: "100%" }
      })
    ),
    Me(
      "限流暂停时间 (秒)",
      t.createElement(s, {
        min: 1,
        step: 0.5,
        value: Ee,
        onChange: (ae) => te(ae ?? 1),
        style: { width: "100%" }
      }),
      "限流抖动 (秒)",
      t.createElement(s, {
        min: 0,
        step: 0.5,
        value: de,
        onChange: (ae) => fe(ae ?? 0),
        style: { width: "100%" }
      })
    ),
    Te(
      "获取超时 (秒)",
      t.createElement(s, {
        min: 10,
        step: 10,
        value: V,
        onChange: (ae) => C(ae ?? 30),
        style: { width: 200 }
      }),
      "应大于 限流暂停 + 抖动"
    ),
    // ── Section: 上下文与记忆 ──
    t.createElement(y, { style: { margin: "8px 0 16px" } }),
    t.createElement("div", { style: Qe }, "上下文与记忆"),
    Me(
      "上下文管理后端",
      t.createElement(c, {
        value: T,
        onChange: (ae) => re(ae),
        style: { width: "100%" },
        options: [{ value: "light", label: "light" }]
      }),
      "上下文策略",
      t.createElement(c, {
        value: pe,
        onChange: (ae) => Ie(ae),
        style: { width: "100%" },
        options: [
          { value: "scroll", label: "scroll (滚动窗口)" },
          { value: "native", label: "native (原生)" }
        ]
      })
    ),
    Me(
      "记忆管理后端",
      t.createElement(c, {
        value: Le,
        onChange: (ae) => Ne(ae),
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
        value: ge,
        onChange: (ae) => q(ae ?? 50),
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
          icon: S ? t.createElement(S) : void 0,
          loading: L,
          onClick: De,
          style: Be
        },
        "保存运行配置"
      )
    )
  );
}
function dl({
  expert: e,
  open: t,
  onClose: r,
  onRefresh: n
}) {
  const a = A().React, { useState: l, useEffect: i, useCallback: s } = a, { Modal: o, Tabs: c, Spin: d, Typography: m } = A().antd, { SettingOutlined: f } = A().antdIcons || {}, { Text: u } = m, [p, y] = l([]), [h, S] = l(!1), [k, x] = l("heartbeat"), E = s(async () => {
    if (e) {
      S(!0);
      try {
        const G = await al(e.agent.id);
        y(G);
      } catch {
        y([]);
      } finally {
        S(!1);
      }
    }
  }, [e]);
  if (i(() => {
    t && e && E();
  }, [t, e, E]), !e) return null;
  const { agent: L } = e, D = () => {
    E(), n();
  }, F = [
    {
      key: "heartbeat",
      label: "心跳",
      children: a.createElement(ol, {
        agentId: L.id
      })
    },
    {
      key: "files",
      label: "文件",
      children: h ? a.createElement(
        "div",
        { style: { textAlign: "center", padding: 40 } },
        a.createElement(d, { size: "large" })
      ) : a.createElement(Rr, {
        agentId: L.id,
        systemPromptFiles: p,
        onRefresh: D
      })
    },
    {
      key: "skills",
      label: `技能 (${e.skills.filter((G) => G.enabled !== !1).length})`,
      children: a.createElement(il, {
        agentId: L.id,
        onRefresh: n
      })
    },
    {
      key: "mcp",
      label: `MCP (${e.mcps.length})`,
      children: a.createElement(sl, {
        agentId: L.id,
        onRefresh: n,
        isActive: k === "mcp"
      })
    },
    {
      key: "running",
      label: "运行配置",
      children: a.createElement(cl, {
        agentId: L.id
      })
    }
  ];
  return a.createElement(
    o,
    {
      open: t,
      title: a.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 8 } },
        f ? a.createElement(f, { style: { fontSize: 18 } }) : null,
        a.createElement("span", null, `配置 - ${L.name}`),
        a.createElement(
          u,
          { type: "secondary", style: { fontSize: 12, fontWeight: 400 } },
          L.id
        )
      ),
      onCancel: r,
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
      items: F,
      activeKey: k,
      onChange: (G) => x(G),
      size: "small",
      tabBarStyle: { marginBottom: 16 }
    })
  );
}
const ul = [
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
], ml = ul;
function er(e) {
  return Ft(`/ugsci/avatar/${encodeURIComponent(e)}`);
}
function tr(e) {
  const t = e.map(encodeURIComponent).join(",");
  return Ft(`/ugsci/avatar/team/${t}`);
}
function He({
  name: e,
  size: t = 32,
  borderRadius: r = "50%"
}) {
  const n = A().React, [a, l] = n.useState(0), i = a === 0 ? er(e) : `${er(e)}?_r=${a}`;
  return n.createElement("img", {
    src: i,
    alt: e,
    onError: () => {
      a < 1 && l(a + 1);
    },
    style: {
      width: t,
      height: t,
      borderRadius: r,
      objectFit: "cover",
      flexShrink: 0
    }
  });
}
function Sn({
  members: e,
  size: t = 32,
  borderRadius: r = "50%"
}) {
  const n = A().React, [a, l] = n.useState(0);
  if (!e || e.length === 0)
    return n.createElement("span", {
      style: {
        width: t,
        height: t,
        display: "inline-block"
      }
    });
  const i = e.slice(0, 5), s = a === 0 ? tr(i) : `${tr(i)}?_r=${a}`;
  return n.createElement("img", {
    src: s,
    alt: "team",
    onError: () => {
      a < 1 && l(a + 1);
    },
    style: {
      width: t,
      height: t,
      borderRadius: r,
      objectFit: "cover",
      flexShrink: 0
    }
  });
}
async function nr(e) {
  var r;
  const t = A();
  if (t.refreshAgents)
    try {
      await t.refreshAgents({ force: !0 });
    } catch (n) {
      console.warn("[ugsci] Failed to refresh newly created agent:", n);
      return;
    }
  (r = t.setSelectedAgent) == null || r.call(t, e);
}
function pl({
  expert: e,
  onClick: t,
  onSummon: r,
  onConfigure: n
}) {
  const a = A().React, { Card: l, Tag: i, Badge: s, Typography: o, Spin: c, Button: d, Tooltip: m } = A().antd, { Text: f } = o, { ThunderboltOutlined: u, SettingOutlined: p } = A().antdIcons || {}, { agent: y, skills: h, mcps: S, loading: k } = e, x = y.enabled, E = h.filter((F) => F.enabled !== !1).map((F) => F.name), L = S.map((F) => F.name || F.key), D = y.active_model ? `${y.active_model.provider_id}/${y.active_model.model}` : null;
  return a.createElement(
    l,
    {
      hoverable: !0,
      onClick: t,
      size: "small",
      style: {
        cursor: "pointer",
        transition: "all 0.2s ease",
        borderColor: x ? void 0 : "var(--ant-color-border, #d9d9d9)",
        opacity: x ? 1 : 0.7,
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
        a.createElement(He, { name: y.name, size: 36 }),
        a.createElement(
          "div",
          null,
          a.createElement(
            f,
            { strong: !0, style: { fontSize: 15 } },
            y.name
          ),
          a.createElement(
            "div",
            {
              style: {
                fontSize: 11,
                color: "var(--ant-color-text-quaternary, #bfbfbf)",
                fontFamily: "monospace"
              }
            },
            y.id
          )
        )
      ),
      a.createElement(s, {
        status: x ? "success" : "default",
        text: x ? "启用" : "停用"
      })
    ),
    // Description (rendered as markdown)
    y.description ? a.createElement(
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
      Ht(y.description, a)
    ) : a.createElement(
      "div",
      { style: { fontSize: 12, color: "var(--ant-color-text-quaternary, #bfbfbf)", marginBottom: 10, minHeight: 54, flex: "1 0 auto" } },
      "暂无描述"
    ),
    // Model info
    D ? a.createElement(
      "div",
      { style: { marginBottom: 8 } },
      a.createElement(
        i,
        { color: "geekblue", style: { fontSize: 11 } },
        `🤖 ${D}`
      )
    ) : null,
    // Skills
    k ? a.createElement(c, { size: "small" }) : a.createElement(
      "div",
      { style: { marginBottom: 6 } },
      a.createElement(
        "div",
        { style: { fontSize: 11, color: "var(--ant-color-text-tertiary, #8c8c8c)", marginBottom: 4 } },
        `技能 (${E.length})`
      ),
      a.createElement(Zn, {
        items: E,
        max: 4,
        color: "cyan",
        emptyText: "未配置技能"
      })
    ),
    // MCP
    !k && L.length > 0 ? a.createElement(
      "div",
      { style: { marginTop: "auto" } },
      a.createElement(
        "div",
        { style: { fontSize: 11, color: "var(--ant-color-text-tertiary, #8c8c8c)", marginBottom: 4 } },
        `MCP (${L.length})`
      ),
      a.createElement(Zn, {
        items: L,
        max: 3,
        color: "purple"
      })
    ) : null,
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
            icon: p ? a.createElement(p, {
              style: { fontSize: 16, color: "var(--ant-color-text-tertiary, #8c8c8c)" }
            }) : void 0,
            onClick: (F) => {
              F.stopPropagation(), n && n();
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
          icon: u ? a.createElement(u) : void 0,
          disabled: !x,
          onClick: (F) => {
            F.stopPropagation(), r && r();
          },
          style: Be
        },
        "召唤专家"
      )
    )
  );
}
function fl({
  expert: e,
  open: t,
  onClose: r,
  onRefresh: n
}) {
  const a = A().React, {
    Drawer: l,
    Descriptions: i,
    Tag: s,
    Typography: o,
    Space: c,
    Button: d,
    Empty: m,
    Tabs: f,
    List: u,
    Spin: p,
    Modal: y,
    message: h
  } = A().antd, { Text: S, Paragraph: k } = o, {
    EditOutlined: x,
    ThunderboltOutlined: E,
    FileTextOutlined: L,
    ToolOutlined: D,
    PlusOutlined: F
  } = A().antdIcons || {}, [G, j] = a.useState(!1), [K, X] = a.useState(
    []
  ), [H, b] = a.useState(!1);
  if (!e) return null;
  const { agent: v, config: _, skills: I, mcps: U, loading: $ } = e, O = I.filter((M) => M.enabled !== !1), z = (M) => {
    window.history.pushState({}, "", M), window.dispatchEvent(new PopStateEvent("popstate"));
  }, w = a.createElement(
    "div",
    null,
    a.createElement(
      i,
      { column: 1, bordered: !0, size: "small" },
      a.createElement(i.Item, { label: "专家名称" }, v.name),
      a.createElement(
        i.Item,
        { label: "专家 ID" },
        a.createElement("code", { style: { fontSize: 12 } }, v.id)
      ),
      a.createElement(
        i.Item,
        { label: "状态" },
        a.createElement(
          s,
          { color: v.enabled ? "green" : "default" },
          v.enabled ? "启用" : "停用"
        )
      ),
      a.createElement(
        i.Item,
        { label: "功能简介" },
        v.description ? Ht(v.description, a) : "暂无描述"
      ),
      a.createElement(
        i.Item,
        { label: "使用模型" },
        v.active_model ? `${v.active_model.provider_id} / ${v.active_model.model}` : "使用全局默认模型"
      ),
      _ != null && _.workspace_dir ? a.createElement(
        i.Item,
        { label: "工作区路径" },
        a.createElement(
          "code",
          { style: { fontSize: 11 } },
          _.workspace_dir
        )
      ) : null,
      _ != null && _.approval_level ? a.createElement(
        i.Item,
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
        L ? a.createElement(L, {
          style: { fontSize: 14, color: "#1677ff" }
        }) : null,
        a.createElement(S, { strong: !0 }, "系统提示词文件")
      ),
      a.createElement(
        c,
        { wrap: !0 },
        ..._.system_prompt_files.map(
          (M, ie) => a.createElement(
            s,
            {
              key: ie,
              icon: L ? a.createElement(L) : void 0,
              style: { fontSize: 12 }
            },
            M
          )
        )
      )
    ) : null
  ), le = async () => {
    j(!0), b(!0);
    try {
      const M = await Vt(!0);
      X(M);
    } catch (M) {
      h.error(M.message || "加载技能池失败");
    } finally {
      b(!1);
    }
  }, oe = async (M) => {
    let ie = 0, ue = 0;
    for (const Q of M)
      try {
        await vn(v.id, Q), ie++;
      } catch {
        ue++;
      }
    ie > 0 ? (h.success(
      `成功添加 ${ie} 个技能${ue > 0 ? `，${ue} 个失败` : ""}`
    ), n()) : ue > 0 && h.error("添加技能失败"), j(!1);
  }, B = async (M) => {
    try {
      await bn(v.id, M), h.success(`技能「${M}」已移除`), n();
    } catch (ie) {
      h.error(ie.message || "移除技能失败");
    }
  }, R = async (M) => {
    try {
      await Or(v.id, M), h.success(`MCP「${M}」已移除`), n();
    } catch (ie) {
      h.error(ie.message || "移除 MCP 失败");
    }
  }, ne = $ ? a.createElement(
    "div",
    { style: { textAlign: "center", padding: 40 } },
    a.createElement(p, { size: "large" })
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
        S,
        { strong: !0 },
        `已启用技能 (${O.length})`
      ),
      a.createElement(
        d,
        {
          type: "primary",
          size: "small",
          icon: F ? a.createElement(F) : void 0,
          onClick: le
        },
        "从技能池添加"
      )
    ),
    O.length === 0 ? a.createElement(m, {
      description: "该专家暂无已启用的技能",
      image: m.PRESENTED_IMAGE_SIMPLE
    }) : a.createElement(u, {
      dataSource: O,
      renderItem: (M) => a.createElement(
        u.Item,
        {
          actions: [
            a.createElement(
              d,
              {
                type: "link",
                size: "small",
                danger: !0,
                onClick: () => B(M.name)
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
            M.emoji ? a.createElement(
              "span",
              { style: { fontSize: 16 } },
              M.emoji
            ) : null,
            a.createElement(S, { strong: !0 }, M.name),
            M.version_text ? a.createElement(
              s,
              { style: { fontSize: 10 } },
              `v${M.version_text}`
            ) : null
          ),
          M.description ? a.createElement(
            k,
            {
              type: "secondary",
              style: { fontSize: 12, margin: 0 },
              ellipsis: { rows: 2 }
            },
            M.description
          ) : null,
          M.tags && M.tags.length > 0 ? a.createElement(
            "div",
            { style: { marginTop: 4 } },
            ...M.tags.map(
              (ie, ue) => a.createElement(
                s,
                {
                  key: ue,
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
    a.createElement(Lr, {
      open: G,
      onClose: () => j(!1),
      poolSkills: K,
      installedSkillNames: O.map((M) => M.name),
      loading: H,
      onInstall: oe
    })
  ), Z = $ ? a.createElement(
    "div",
    { style: { textAlign: "center", padding: 40 } },
    a.createElement(p, { size: "large" })
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
        S,
        { strong: !0 },
        `MCP 客户端 (${U.length})`
      ),
      a.createElement(
        d,
        {
          type: "primary",
          size: "small",
          icon: F ? a.createElement(F) : void 0,
          onClick: () => {
            window.history.pushState({}, "", `/agents/${v.id}/mcp`), window.dispatchEvent(new PopStateEvent("popstate"));
          }
        },
        "配置 MCP"
      )
    ),
    U.length === 0 ? a.createElement(m, {
      description: "该专家暂无关联的 MCP 客户端，点击「配置 MCP」添加",
      image: m.PRESENTED_IMAGE_SIMPLE
    }) : a.createElement(u, {
      dataSource: U,
      renderItem: (M) => a.createElement(
        u.Item,
        {
          actions: [
            a.createElement(
              d,
              {
                type: "link",
                size: "small",
                danger: !0,
                onClick: () => R(M.key)
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
              S,
              { strong: !0 },
              M.name || M.key
            ),
            a.createElement(
              s,
              {
                color: M.enabled ? "green" : "default",
                style: { fontSize: 10 }
              },
              M.enabled ? "启用" : "停用"
            ),
            a.createElement(
              s,
              { color: "purple", style: { fontSize: 10 } },
              M.transport
            )
          ),
          M.description ? a.createElement(
            k,
            {
              type: "secondary",
              style: { fontSize: 12, margin: 0 },
              ellipsis: { rows: 2 }
            },
            M.description
          ) : null,
          M.tools && M.tools.length > 0 ? a.createElement(
            "div",
            {
              style: {
                marginTop: 4,
                fontSize: 11,
                color: "var(--ant-color-text-tertiary, #8c8c8c)"
              }
            },
            `提供 ${M.tools.length} 个工具`
          ) : null
        )
      )
    })
  ), W = _ != null && _.tools ? a.createElement(
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
        D ? a.createElement(D, {
          style: { fontSize: 14, color: "#1677ff" }
        }) : null,
        a.createElement(S, { strong: !0 }, "工具配置")
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
  ) : a.createElement(m, {
    description: "暂无工具配置",
    image: m.PRESENTED_IMAGE_SIMPLE
  }), me = [
    { key: "basic", label: "基本信息", children: w },
    {
      key: "skills",
      label: `技能 (${O.length})`,
      children: ne
    },
    {
      key: "prompts",
      label: "推荐提问",
      children: a.createElement(ll, {
        skills: O,
        agentId: v.id
      })
    },
    {
      key: "knowledge",
      label: "专家记忆",
      children: a.createElement(Rr, {
        agentId: v.id,
        systemPromptFiles: (_ == null ? void 0 : _.system_prompt_files) || [],
        onRefresh: () => n()
      })
    },
    { key: "mcp", label: `MCP (${U.length})`, children: Z },
    { key: "tools", label: "工具配置", children: W }
  ];
  return a.createElement(
    l,
    {
      title: a.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 8 } },
        a.createElement(He, { name: v.name, size: 28 }),
        a.createElement("span", null, v.name)
      ),
      open: t,
      onClose: r,
      width: 560,
      extra: a.createElement(
        c,
        null,
        a.createElement(
          d,
          {
            size: "small",
            icon: x ? a.createElement(x) : void 0,
            onClick: () => {
              r();
              try {
                const M = A();
                M.setSelectedAgent && M.setSelectedAgent(v.id);
              } catch (M) {
                console.warn("[ugsci] Failed to set selected agent:", M);
              }
              setTimeout(() => z("/agents"), 0);
            }
          },
          "编辑专家"
        ),
        a.createElement(
          d,
          {
            type: "primary",
            size: "small",
            icon: E ? a.createElement(E) : void 0,
            onClick: () => {
              r();
              try {
                const M = A();
                M.setSelectedAgent && M.setSelectedAgent(v.id);
              } catch (M) {
                console.warn("[ugsci] Failed to set selected agent:", M);
              }
              setTimeout(() => z("/chat"), 0);
            }
          },
          "开始对话"
        )
      )
    },
    a.createElement(f, {
      items: me,
      defaultActiveKey: "basic"
    })
  );
}
function gl({
  open: e,
  onClose: t,
  onCreated: r
}) {
  const n = A().React, { useState: a } = n, {
    Modal: l,
    Card: i,
    Tag: s,
    Input: o,
    Row: c,
    Col: d,
    Spin: m,
    message: f,
    Typography: u
  } = A().antd, { Text: p } = u, { FileAddOutlined: y } = A().antdIcons || {}, [h, S] = a(!1), [k, x] = a(""), [E, L] = a(!1), D = async (j) => {
    S(!0);
    try {
      const K = await ce("/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: j.id || void 0,
          name: j.name,
          description: j.description,
          skill_names: j.skillNames
        })
      }), X = j.systemPrompt.trim() || `# ${j.name}

你是${j.name}。${j.description ? `

职责：${j.description}` : ""}
`, b = (await Promise.allSettled([
        Bt(K.id, "AGENTS.md", X),
        ...j.mcpClients.map(
          ({ clientKey: v, client: _ }) => xn(K.id, {
            client_key: v,
            client: _
          })
        )
      ])).filter(
        (v) => v.status === "rejected"
      ).length;
      b > 0 ? f.warning(
        `专家「${j.name}」已创建，${b} 项初始配置失败，可在专家配置中重试`
      ) : f.success(`专家「${j.name}」创建成功`), await nr(K.id), L(!1), setTimeout(() => {
        t(), r();
      }, 0);
    } catch (K) {
      f.error(K.message || "创建专家失败");
    } finally {
      S(!1);
    }
  }, F = ml.filter((j) => {
    if (!k.trim()) return !0;
    const K = k.toLowerCase();
    return j.name.toLowerCase().includes(K) || j.description.toLowerCase().includes(K) || j.category.toLowerCase().includes(K);
  }), G = async (j) => {
    S(!0);
    try {
      const K = await ce("/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: j.name,
          description: j.description,
          skill_names: j.recommended_skills
        })
      });
      await Bt(K.id, "AGENTS.md", j.system_prompt);
      const X = await En(K.id);
      X.approval_level = j.approval_level, await ce(`/agents/${encodeURIComponent(K.id)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(X)
      }), await nr(K.id), f.success(`专家「${j.name}」创建成功`), t(), r();
    } catch (K) {
      f.error(K.message || "创建专家失败");
    } finally {
      S(!1);
    }
  };
  return n.createElement(
    n.Fragment,
    null,
    n.createElement(
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
      n.createElement(
        "div",
        { style: { marginBottom: 16 } },
        n.createElement(o, {
          placeholder: "搜索模板名称或类别...",
          value: k,
          onChange: (j) => x(j.target.value),
          allowClear: !0
        })
      ),
      h ? n.createElement(
        "div",
        { style: { textAlign: "center", padding: 60 } },
        n.createElement(m, { size: "large" }),
        n.createElement(
          "div",
          { style: { marginTop: 12, color: "var(--ant-color-text-tertiary, #8c8c8c)" } },
          "正在创建专家..."
        )
      ) : n.createElement(
        c,
        { gutter: [12, 12] },
        // ── Blank template card (always first) ──
        k.trim() ? null : n.createElement(
          d,
          { xs: 24, sm: 12 },
          n.createElement(
            i,
            {
              hoverable: !0,
              size: "small",
              onClick: () => L(!0),
              style: {
                cursor: "pointer",
                height: "100%",
                border: "2px dashed var(--ant-color-border, #d9d9d9)",
                background: "var(--ant-color-fill-quaternary, #fafafa)"
              }
            },
            n.createElement(
              "div",
              {
                style: {
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 10,
                  marginBottom: 8
                }
              },
              n.createElement(
                "span",
                { style: { fontSize: 28, color: "var(--ant-color-text-tertiary, #8c8c8c)" } },
                y ? n.createElement(y) : "📝"
              ),
              n.createElement(
                "div",
                { style: { flex: 1 } },
                n.createElement(
                  p,
                  { strong: !0, style: { fontSize: 15 } },
                  "从空白模版开始创建"
                ),
                n.createElement(
                  "div",
                  null,
                  n.createElement(
                    s,
                    { color: "default", style: { fontSize: 10 } },
                    "空白"
                  )
                )
              )
            ),
            n.createElement(
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
        ...F.map(
          (j) => n.createElement(
            d,
            { key: j.id, xs: 24, sm: 12 },
            n.createElement(
              i,
              {
                hoverable: !0,
                size: "small",
                onClick: () => G(j),
                style: { cursor: "pointer", height: "100%" }
              },
              n.createElement(
                "div",
                {
                  style: {
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 10,
                    marginBottom: 8
                  }
                },
                n.createElement(He, {
                  name: j.name,
                  size: 40
                }),
                n.createElement(
                  "div",
                  { style: { flex: 1 } },
                  n.createElement(
                    p,
                    { strong: !0, style: { fontSize: 15 } },
                    j.name
                  ),
                  n.createElement(
                    "div",
                    null,
                    n.createElement(
                      s,
                      { color: "blue", style: { fontSize: 10 } },
                      j.category
                    ),
                    j.approval_level === "MANUAL" ? n.createElement(
                      s,
                      { color: "orange", style: { fontSize: 10 } },
                      "需审批"
                    ) : null
                  )
                )
              ),
              n.createElement(
                "div",
                {
                  style: {
                    fontSize: 12,
                    color: "#595959",
                    lineHeight: 1.5
                  }
                },
                Ht(j.description, n)
              )
            )
          )
        )
      )
    ),
    // ── Blank template creation modal (sibling, not nested inside Modal) ──
    n.createElement(hl, {
      open: E,
      onCancel: () => L(!1),
      onCreate: D
    })
  );
}
function gt(e) {
  return typeof e == "object" && e !== null && !Array.isArray(e);
}
function yl(e) {
  const t = e.trim();
  if (!t) return [];
  const r = JSON.parse(t);
  if (!gt(r))
    throw new Error("MCP 配置必须是 JSON 对象");
  const n = r.mcpServers ?? r;
  if (!gt(n))
    throw new Error("mcpServers 必须是 JSON 对象");
  return Object.entries(n).map(([a, l]) => {
    const i = a.trim();
    if (!i || !gt(l))
      throw new Error(`MCP「${a || "未命名"}」配置无效`);
    const s = typeof l.url == "string" ? l.url : "", o = typeof l.command == "string" ? l.command : "";
    if (!s && !o)
      throw new Error(`MCP「${i}」需要配置 url 或 command`);
    const d = (typeof l.transport == "string" ? l.transport : typeof l.type == "string" ? l.type : "") === "sse" ? "sse" : s ? "streamable_http" : "stdio";
    return {
      clientKey: i,
      client: {
        name: typeof l.name == "string" ? l.name : i,
        description: typeof l.description == "string" ? l.description : "",
        enabled: typeof l.enabled == "boolean" ? l.enabled : !0,
        transport: d,
        url: s,
        command: o,
        args: Array.isArray(l.args) ? l.args : [],
        env: gt(l.env) ? l.env : {},
        cwd: typeof l.cwd == "string" ? l.cwd : "",
        headers: gt(l.headers) ? l.headers : {}
      }
    };
  });
}
function hl({
  open: e,
  onCancel: t,
  onCreate: r
}) {
  const n = A().React, { useState: a, useEffect: l, useMemo: i } = n, {
    Modal: s,
    Input: o,
    Select: c,
    Button: d,
    Row: m,
    Col: f,
    Spin: u,
    Tag: p,
    Typography: y,
    message: h
  } = A().antd, { CheckCircleOutlined: S } = A().antdIcons || {}, { Text: k } = y, [x, E] = a(""), [L, D] = a(""), [F, G] = a(""), [j, K] = a(""), [X, H] = a([]), [b, v] = a([]), [_, I] = a(!1), [U, $] = a(""), [O, z] = a(!1);
  l(() => {
    e && (E(""), D(""), G(""), K(""), v([]), $(""), z(!1), I(!0), Vt(!0).then(H).catch((Z) => {
      H([]), h.error(Z.message || "加载技能池失败");
    }).finally(() => I(!1)));
  }, [e]);
  const w = L.trim(), le = i(() => w ? w.length < 2 || w.length > 64 ? "ID 长度需为 2-64 个字符" : /^[a-zA-Z0-9][a-zA-Z0-9_-]*[a-zA-Z0-9]$/.test(w) ? w === "default" ? "default 是系统保留 ID" : "" : "仅允许字母、数字、连字符和下划线，且不能以符号开头或结尾" : "", [w]), oe = i(() => {
    try {
      return { clients: yl(U), error: "" };
    } catch (Z) {
      return { clients: [], error: Z.message || "MCP 配置无效" };
    }
  }, [U]), B = () => {
    const Z = x.trim();
    if (!Z) {
      h.warning("请输入专家名称");
      return;
    }
    if (le) {
      h.warning(le);
      return;
    }
    if (oe.error) {
      h.warning(oe.error);
      return;
    }
    z(!0), Promise.resolve(
      r({
        id: w,
        name: Z,
        description: F.trim(),
        systemPrompt: j,
        skillNames: b,
        mcpClients: oe.clients
      })
    ).finally(() => z(!1));
  }, R = () => {
    v(
      X.filter((Z) => Z.source === "builtin").map((Z) => Z.name)
    );
  }, ne = (Z, W) => n.createElement(
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
    n.createElement(k, { strong: !0, style: { fontSize: 15 } }, Z),
    W ? n.createElement(k, { type: "secondary", style: { fontSize: 12 } }, W) : null
  );
  return n.createElement(
    s,
    {
      open: e,
      title: "创建专家",
      onCancel: t,
      onOk: B,
      okText: "创建专家",
      cancelText: "取消",
      okButtonProps: { loading: O },
      maskClosable: !0,
      keyboard: !0,
      width: 880,
      styles: { body: { maxHeight: "72vh", overflowY: "auto", paddingTop: 8 } }
    },
    n.createElement(
      "div",
      { style: { paddingBottom: 20 } },
      ne("基本信息", "ID 留空时自动生成"),
      n.createElement(
        m,
        { gutter: [16, 12] },
        n.createElement(
          f,
          { xs: 24, md: 12 },
          n.createElement(
            "label",
            { style: { display: "block", fontSize: 13, marginBottom: 6 } },
            "专家名称",
            n.createElement("span", { style: { color: "#ff4d4f", marginLeft: 4 } }, "*")
          ),
          n.createElement(o, {
            placeholder: "例如：合同审查专家",
            value: x,
            onChange: (Z) => E(Z.target.value),
            maxLength: 50
          })
        ),
        n.createElement(
          f,
          { xs: 24, md: 12 },
          n.createElement(
            "label",
            { style: { display: "block", fontSize: 13, marginBottom: 6 } },
            "智能体 ID（可选）"
          ),
          n.createElement(o, {
            placeholder: "例如：contract-reviewer",
            value: L,
            onChange: (Z) => D(Z.target.value),
            maxLength: 64,
            status: le ? "error" : void 0
          }),
          le ? n.createElement("div", { style: { color: "#ff4d4f", fontSize: 12, marginTop: 4 } }, le) : null
        ),
        n.createElement(
          f,
          { span: 24 },
          n.createElement(
            "label",
            { style: { display: "block", fontSize: 13, marginBottom: 6 } },
            "专家描述（可选）"
          ),
          n.createElement(o.TextArea, {
            placeholder: "简要描述该专家的职责和能力",
            value: F,
            onChange: (Z) => G(Z.target.value),
            rows: 2,
            maxLength: 200,
            showCount: !0
          })
        )
      )
    ),
    n.createElement(
      "div",
      { style: { borderTop: "1px solid #f0f0f0", padding: "20px 0" } },
      ne("角色指令", "保存为 AGENTS.md"),
      n.createElement(o.TextArea, {
        placeholder: "定义专家的角色、目标、工作方式和输出要求；留空时将根据名称与描述生成基础指令",
        value: j,
        onChange: (Z) => K(Z.target.value),
        rows: 6,
        style: { fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", fontSize: 12 }
      })
    ),
    n.createElement(
      "div",
      { style: { borderTop: "1px solid #f0f0f0", paddingTop: 20 } },
      ne("初始能力"),
      n.createElement(
        m,
        { gutter: [20, 16], align: "top" },
        n.createElement(
          f,
          { xs: 24, md: 12 },
          n.createElement(
            "div",
            { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 } },
            n.createElement(k, { strong: !0 }, "初始技能"),
            n.createElement(
              "div",
              { style: { display: "flex", gap: 4 } },
              n.createElement(d, { size: "small", onClick: R, disabled: _ }, "内置"),
              n.createElement(d, { size: "small", onClick: () => v([]), disabled: b.length === 0 }, "清空")
            )
          ),
          _ ? n.createElement("div", { style: { textAlign: "center", padding: 32 } }, n.createElement(u, { size: "small" })) : n.createElement(c, {
            mode: "multiple",
            value: b,
            onChange: v,
            placeholder: "搜索并选择技能",
            showSearch: !0,
            allowClear: !0,
            optionFilterProp: "label",
            maxTagCount: "responsive",
            style: { width: "100%" },
            options: X.map((Z) => ({
              value: Z.name,
              label: Z.name
            })),
            notFoundContent: "暂无可用技能"
          }),
          n.createElement(
            "div",
            { style: { marginTop: 8, minHeight: 22 } },
            b.length > 0 ? n.createElement(p, { color: "blue" }, `已选择 ${b.length} 个技能`) : n.createElement(k, { type: "secondary", style: { fontSize: 12 } }, "暂不添加技能")
          )
        ),
        n.createElement(
          f,
          { xs: 24, md: 12 },
          n.createElement(k, { strong: !0, style: { display: "block", marginBottom: 8 } }, "初始 MCP"),
          n.createElement(o.TextArea, {
            placeholder: `{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem"]
    }
  }
}`,
            value: U,
            onChange: (Z) => $(Z.target.value),
            rows: 8,
            status: oe.error ? "error" : void 0,
            style: { fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", fontSize: 12 }
          }),
          n.createElement(
            "div",
            { style: { marginTop: 8, minHeight: 22 } },
            oe.error ? n.createElement(k, { type: "danger", style: { fontSize: 12 } }, oe.error) : oe.clients.length > 0 ? n.createElement(
              p,
              {
                color: "green",
                icon: S ? n.createElement(S) : void 0
              },
              `已识别 ${oe.clients.length} 个 MCP`
            ) : n.createElement(k, { type: "secondary", style: { fontSize: 12 } }, "暂不添加 MCP")
          )
        )
      )
    )
  );
}
const Nr = "ugsci_custom_teams";
function El(e) {
  if (!e || typeof e != "object") return !1;
  const t = e;
  return typeof t.id == "string" && typeof t.name == "string" && typeof t.taskTemplate == "string" && typeof t.orchestrationPrompt == "string" && Array.isArray(t.members);
}
function vl() {
  try {
    const e = JSON.parse(
      localStorage.getItem(Nr) || "[]"
    );
    return Array.isArray(e) ? e.filter(El) : [];
  } catch {
    return [];
  }
}
function bl(e) {
  try {
    localStorage.setItem(Nr, JSON.stringify(e));
  } catch {
  }
}
function wl(e) {
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
function xl(e) {
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
async function dn(e = !0) {
  const t = await Ve("/ugsci/team/custom");
  if (!t.ok) {
    const a = await t.text().catch(() => "");
    throw new Error(a || `HTTP ${t.status}`);
  }
  const n = (await t.json()).map(xl);
  return e && bl(n), n;
}
async function Dr(e) {
  const t = await Ve("/ugsci/team/custom", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(wl(e))
  });
  if (!t.ok) {
    const n = await t.text().catch(() => "");
    throw new Error(n || `HTTP ${t.status}`);
  }
  const r = await t.json();
  return { ...e, id: r.team_id };
}
async function Sl(e) {
  const t = await Ve(
    `/ugsci/team/custom/${encodeURIComponent(e)}`,
    { method: "DELETE" }
  );
  if (!t.ok && t.status !== 404) {
    const r = await t.text().catch(() => "");
    throw new Error(r || `HTTP ${t.status}`);
  }
}
async function kl() {
  const e = vl();
  if (e.length === 0) return;
  const t = await dn(!1), r = new Set(t.map((n) => n.id));
  await Promise.all(
    e.filter((n) => !r.has(n.id)).map((n) => Dr(n))
  );
}
async function Cl(e) {
  var a, l;
  const t = (a = e.body) == null ? void 0 : a.getReader();
  if (!t) return;
  const r = new TextDecoder();
  let n = "";
  try {
    for (; ; ) {
      const { done: i, value: s } = await t.read();
      if (i) break;
      n += r.decode(s, { stream: !0 });
      let o;
      for (; (o = n.indexOf(`

`)) >= 0; ) {
        const c = n.slice(0, o);
        n = n.slice(o + 2);
        for (const d of c.split(`
`)) {
          if (!d.startsWith("data: ")) continue;
          const m = d.slice(6);
          let f;
          try {
            f = JSON.parse(m);
          } catch {
            continue;
          }
          if (f.error) {
            const u = f.error, p = typeof u == "string" ? u : (u == null ? void 0 : u.message) || "工作流启动失败";
            throw new Error(p);
          }
          if (f.object === "response" || f.type === "response") {
            const u = f.status;
            if (u === "failed" || u === "error") {
              const p = ((l = f.error) == null ? void 0 : l.message) || "工作流启动失败";
              throw new Error(p);
            }
            return;
          }
          if (f.object === "content" || f.type === "message")
            return;
        }
      }
    }
  } finally {
    t.releaseLock();
  }
}
async function Tl(e, t, r) {
  const n = `console:default:team-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, a = await Ve("/chats", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Agent-Id": e
    },
    body: JSON.stringify({
      session_id: n,
      user_id: "default",
      channel: "console",
      name: r ? `团队：${r}` : "团队任务"
    })
  });
  if (!a.ok) {
    const o = await a.text().catch(() => "");
    throw new Error(
      o || `创建会话失败 (HTTP ${a.status})`
    );
  }
  const i = (await a.json()).id, s = await Ve("/console/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Agent-Id": e
    },
    body: JSON.stringify({
      channel: "console",
      user_id: "default",
      session_id: n,
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
    const o = await s.text().catch(() => "");
    throw new Error(o || `HTTP ${s.status}`);
  }
  return await Cl(s), i;
}
function Gr(e, t) {
  var a;
  const r = t.replace(/\s+/g, ""), n = e.find(
    (l) => l.name === t || l.name.replace(/\s+/g, "") === r
  );
  return n ? n.id : ((a = e.find(
    (l) => l.name.includes(t) || t.includes(l.name) || l.name.replace(/\s+/g, "").includes(r)
  )) == null ? void 0 : a.id) || null;
}
function Fr() {
  var t;
  const e = (t = window.QwenPaw) == null ? void 0 : t.host;
  if (!e) throw new Error("[ugsci] QwenPaw.host not available");
  return e;
}
async function Hr(e, t) {
  const r = await e.text().catch(() => "");
  if (!r) return t;
  try {
    const n = JSON.parse(r);
    if (typeof n.detail == "string") return n.detail;
  } catch {
  }
  return r;
}
async function kn(e, t, r) {
  const n = await Ve(e, {
    headers: t ? { "X-Agent-Id": t } : void 0,
    signal: r
  });
  if (!n.ok)
    throw new Error(
      await Hr(n, `HTTP ${n.status}`)
    );
  return await n.json();
}
function _l(e, t) {
  return kn("/ugsci/team/state", e, t);
}
async function Il(e, t) {
  const r = await Ve("/ugsci/team/runs", {
    headers: { "X-Agent-Id": e },
    signal: t
  });
  if (!r.ok)
    throw new Error(
      await Hr(
        r,
        `Failed to load team runs: ${r.status}`
      )
    );
  return await r.json();
}
const zl = 5e3;
function rr({
  activeOnly: e = !1,
  enabled: t = !0
}) {
  const r = Fr(), n = r.React, { useCallback: a, useEffect: l, useRef: i, useState: s } = n, { Alert: o, Button: c, Card: d, Empty: m, Spin: f, Tag: u, Typography: p } = r.antd, { Text: y, Paragraph: h } = p, S = r.useSelectedAgent ? r.useSelectedAgent() : { id: "default" }, k = (S == null ? void 0 : S.id) || "default", [x, E] = s([]), [L, D] = s(!0), [F, G] = s(null), [j, K] = s(!1), X = i(null), H = i(0), b = i(!1), v = i(k), _ = a(
    async ($ = !0, O = !0) => {
      var le;
      if (!t || !O && b.current) return;
      (le = X.current) == null || le.abort();
      const z = new AbortController();
      X.current = z;
      const w = ++H.current;
      b.current = !0, $ && D(!0);
      try {
        const oe = await Il(k, z.signal);
        if (z.signal.aborted || w !== H.current)
          return;
        E(oe), K(!0), G(null);
      } catch (oe) {
        if (z.signal.aborted || w !== H.current)
          return;
        G(
          oe instanceof Error ? oe.message : "讨论运行记录加载失败"
        );
      } finally {
        !z.signal.aborted && w === H.current && (X.current = null, b.current = !1, D(!1));
      }
    },
    [k, t]
  );
  if (l(() => {
    var O;
    if (!t) {
      (O = X.current) == null || O.abort(), X.current = null, b.current = !1, H.current += 1;
      return;
    }
    v.current !== k && (v.current = k, E([]), G(null), K(!1)), _(!0, !0);
    const $ = e ? window.setInterval(() => {
      _(!1, !1);
    }, zl) : null;
    return () => {
      var z;
      $ !== null && window.clearInterval($), (z = X.current) == null || z.abort(), X.current = null, b.current = !1, H.current += 1;
    };
  }, [e, k, t, _]), L && !j) return n.createElement(f);
  if (F && !j)
    return n.createElement(o, {
      type: "warning",
      message: "讨论运行记录加载失败",
      description: F,
      action: n.createElement(
        c,
        { size: "small", onClick: () => void _(!0, !0), loading: L },
        "重试"
      )
    });
  const I = x.filter(
    ($) => e ? $.status === "active" : $.status !== "active"
  ), U = ($) => F ? n.createElement(
    n.Fragment,
    null,
    n.createElement(o, {
      type: "warning",
      message: "讨论运行记录更新失败，当前显示上次成功读取的结果",
      description: F,
      action: n.createElement(
        c,
        {
          size: "small",
          onClick: () => void _(!0, !0),
          loading: L
        },
        "重试"
      )
    }),
    $
  ) : $;
  return I.length === 0 ? U(
    n.createElement(
      m,
      {
        description: e ? "暂无进行中的专家团讨论" : "暂无历史讨论"
      },
      n.createElement(
        c,
        { size: "small", onClick: () => void _(!0, !0), loading: L },
        "刷新"
      )
    )
  ) : U(
    n.createElement(
      n.Fragment,
      null,
      n.createElement(
        "div",
        {
          style: {
            display: "flex",
            justifyContent: "flex-end",
            marginBottom: 8
          }
        },
        n.createElement(
          c,
          { size: "small", onClick: () => void _(!0, !0), loading: L },
          "刷新"
        )
      ),
      n.createElement(
        "div",
        { style: { display: "flex", flexDirection: "column", gap: 8 } },
        ...I.map(
          ($) => n.createElement(
            d,
            { key: $.instance_id, size: "small" },
            n.createElement(
              "div",
              { style: { display: "flex", alignItems: "center", gap: 8 } },
              n.createElement(
                y,
                { strong: !0 },
                $.team_name || $.team_id
              ),
              n.createElement(
                u,
                {
                  color: $.status === "completed" ? "green" : $.status === "terminated" ? "orange" : "blue"
                },
                $.status
              ),
              n.createElement(u, null, $.current_phase),
              n.createElement(
                y,
                { type: "secondary" },
                `迭代 ${$.iteration}`
              )
            ),
            n.createElement(
              h,
              { ellipsis: { rows: 2 }, style: { margin: "8px 0 0" } },
              $.task || "暂无任务描述"
            )
          )
        )
      )
    )
  );
}
async function Al() {
  try {
    return (await kn(
      "/ugsci/team/preset-teams"
    )).teams;
  } catch {
    return null;
  }
}
async function $l() {
  try {
    return (await kn(
      "/ugsci/team/roles"
    )).roles;
  } catch {
    return null;
  }
}
const Pl = {
  plan: { label: "规划", color: "#1677ff", icon: "📋" },
  dispatch: { label: "分派", color: "#13c2c2", icon: "🚀" },
  verify: { label: "验证", color: "#fa8c16", icon: "🔍" },
  synthesize: { label: "综合", color: "#722ed1", icon: "📊" },
  completed: { label: "完成", color: "#52c41a", icon: "✅" }
}, ar = [
  "plan",
  "dispatch",
  "verify",
  "synthesize",
  "completed"
], lr = 5e3, Ol = 3e4;
function Ml({ enabled: e = !0 }) {
  const t = Fr(), r = t.React, { useState: n, useEffect: a, useCallback: l, useRef: i } = r, { Card: s, Tag: o, Typography: c, Button: d, Steps: m, Empty: f, Alert: u, Spin: p } = t.antd, { ReloadOutlined: y } = t.antdIcons || {}, { Text: h, Paragraph: S } = c, k = t.useSelectedAgent ? t.useSelectedAgent() : { id: "default" }, x = (k == null ? void 0 : k.id) || "default", [E, L] = n(null), [D, F] = n(!1), [G, j] = n(null), K = i(null), X = i(0), H = i(0), b = i(0), v = i(null), _ = i(!1), I = l(
    async (W, me = !0) => {
      var ue;
      if (!e || !me && _.current) return;
      (ue = v.current) == null || ue.abort();
      const M = new AbortController();
      v.current = M;
      const ie = ++b.current;
      _.current = !0, W && F(!0);
      try {
        const Q = await _l(x, M.signal);
        if (M.signal.aborted || ie !== b.current)
          return;
        X.current = 0, H.current = 0, K.current = Q, L(Q), j(null);
      } catch (Q) {
        if (M.signal.aborted || ie !== b.current)
          return;
        X.current += 1;
        const Y = Math.min(
          Ol,
          lr * 2 ** (X.current - 1)
        );
        H.current = Date.now() + Y, j(
          Q instanceof Error ? Q.message : "专家团状态加载失败"
        );
      } finally {
        !M.signal.aborted && ie === b.current && (v.current = null, _.current = !1, F(!1));
      }
    },
    [x, e]
  ), U = l(() => (X.current = 0, H.current = 0, I(!0)), [I]);
  if (a(() => {
    var me;
    if ((me = v.current) == null || me.abort(), v.current = null, _.current = !1, b.current += 1, X.current = 0, H.current = 0, K.current = null, L(null), j(null), !e) return;
    U();
    const W = window.setInterval(() => {
      var M, ie;
      Date.now() < H.current || ((M = K.current) == null ? void 0 : M.status) === "completed" || ((ie = K.current) == null ? void 0 : ie.status) === "terminated" || I(!1, !1);
    }, lr);
    return () => {
      var M;
      window.clearInterval(W), (M = v.current) == null || M.abort(), v.current = null, _.current = !1, b.current += 1;
    };
  }, [x, e, I, U]), D && !E && !G)
    return r.createElement(p);
  if (G && !E)
    return r.createElement(u, {
      type: "warning",
      showIcon: !0,
      message: "专家团状态加载失败",
      description: G,
      style: { marginBottom: 16 },
      action: r.createElement(
        d,
        { size: "small", onClick: U, loading: D },
        "重试"
      )
    });
  const $ = (W) => G ? r.createElement(
    r.Fragment,
    null,
    r.createElement(u, {
      type: "warning",
      showIcon: !0,
      message: "状态更新失败，当前显示上次成功读取的结果",
      description: G,
      style: { marginBottom: 16 },
      action: r.createElement(
        d,
        { size: "small", onClick: U, loading: D },
        "重试"
      )
    }),
    W
  ) : W;
  if ((E == null ? void 0 : E.status) === "unreadable")
    return $(
      r.createElement(u, {
        type: "warning",
        showIcon: !0,
        message: "专家团状态暂时无法读取",
        description: `实例 ${E.instance_id || "未知"} 的状态文件需要检查。`,
        style: { marginBottom: 16 },
        action: r.createElement(
          d,
          { size: "small", onClick: U, loading: D },
          "重试"
        )
      })
    );
  if (!E || !E.active) {
    if ((E == null ? void 0 : E.status) === "completed" || (E == null ? void 0 : E.status) === "terminated") {
      const W = E.status === "completed";
      return $(
        r.createElement(u, {
          type: W ? "success" : "info",
          showIcon: !0,
          message: W ? "专家团工作流已完成" : "专家团工作流已终止",
          description: W ? `实例 ${E.instance_id || "未知"} 已完成，结果文件保留在工作区。` : `原因：${E.state.termination_reason || "未知"}`,
          style: { marginBottom: 16 }
        })
      );
    }
    return $(
      r.createElement(f, {
        description: "暂无活跃的专家团工作流",
        style: { padding: 24 }
      })
    );
  }
  const O = E.state, z = O.current_phase || "plan", w = ar.indexOf(z), le = O.team_name || "未知团队", oe = O.team_mode || "pipeline", B = O.iteration || 0, R = O.members || [], ne = O.verify_retries || 0, Z = {
    pipeline: "顺序交接",
    coordinator: "主管协作",
    roundtable: "并行汇聚",
    router: "智能路由",
    review_loop: "评审迭代",
    debate: "多方论证"
  };
  return $(
    r.createElement(
      s,
      {
        size: "small",
        style: { marginBottom: 16 },
        title: r.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 8 } },
          r.createElement("span", { style: { fontSize: 16 } }, "🔄"),
          r.createElement(
            h,
            { strong: !0 },
            `${le} — 工作流状态`
          ),
          r.createElement(
            o,
            { color: "blue", style: { fontSize: 10 } },
            Z[oe] || oe
          ),
          r.createElement(
            o,
            { style: { fontSize: 10 } },
            `迭代 ${B}`
          ),
          ne > 0 ? r.createElement(
            o,
            { color: "orange", style: { fontSize: 10 } },
            `验证重试 ${ne}`
          ) : null
        ),
        extra: r.createElement(
          d,
          {
            size: "small",
            type: "text",
            icon: y ? r.createElement(y) : void 0,
            onClick: U,
            loading: D
          },
          "刷新"
        )
      },
      r.createElement(m, {
        current: w,
        size: "small",
        items: ar.map((W) => {
          const me = Pl[W];
          return {
            title: `${me.icon} ${me.label}`,
            description: W === "plan" ? "分析任务，创建任务分解" : W === "dispatch" ? "分派专家执行任务" : W === "verify" ? "交叉验证专家结果" : W === "synthesize" ? "综合形成最终报告" : "工作流完成"
          };
        })
      }),
      r.createElement(
        "div",
        {
          style: {
            marginTop: 12,
            display: "flex",
            gap: 6,
            flexWrap: "wrap"
          }
        },
        ...R.map(
          (W, me) => r.createElement(
            o,
            { key: `${W.name}-${me}`, style: { fontSize: 11 } },
            `${W.emoji || ""} ${W.name}（${W.role}）`
          )
        )
      ),
      O.task ? r.createElement(
        S,
        {
          style: {
            fontSize: 12,
            marginTop: 8,
            marginBottom: 0,
            color: "var(--ant-color-text-secondary, #666)"
          },
          ellipsis: { rows: 2 }
        },
        `任务: ${O.task}`
      ) : null
    )
  );
}
function Ll({ team: e }) {
  const t = A().React, { Typography: r, Tag: n } = A().antd, { Text: a } = r, l = {
    pipeline: "→",
    roundtable: "⇄",
    coordinator: "⊙",
    router: "◇",
    review_loop: "↻",
    debate: "⇄"
  }, i = {
    pipeline: "#13c2c2",
    roundtable: "#722ed1",
    coordinator: "#1677ff",
    router: "#d46b08",
    review_loop: "#389e0d",
    debate: "#c41d7f"
  }, s = e.steps || [], o = e.mode === "roundtable" || e.mode === "router", c = {
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
          flexDirection: o ? "row" : "column",
          gap: 8,
          alignItems: o ? "flex-start" : "stretch",
          flexWrap: "wrap"
        }
      },
      ...s.length > 0 ? s.map((d, m) => [
        m > 0 && !o ? t.createElement(
          "div",
          {
            key: `arrow-${m}`,
            style: {
              textAlign: "center",
              color: i[e.mode],
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
              border: `1px solid ${i[e.mode]}33`,
              fontSize: 12,
              flex: o ? "1 1 200px" : "initial"
            }
          },
          t.createElement(He, {
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
              n,
              {
                ...d.passContext ? { color: "blue" } : {},
                style: { fontSize: 9, marginTop: 2 }
              },
              d.passContext ? "传递上下文" : "独立"
            )
          )
        )
      ]).flat() : e.members.map((d, m) => [
        m > 0 && !o ? t.createElement(
          "div",
          {
            key: `arrow-${m}`,
            style: {
              textAlign: "center",
              color: i[e.mode],
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
              border: `1px solid ${i[e.mode]}33`,
              fontSize: 12,
              flex: o ? "1 1 150px" : "initial"
            }
          },
          t.createElement(He, {
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
function It(e) {
  const t = e.replace(/\s+/g, "").toLowerCase();
  return t.includes("测井") ? "log-analyst" : t.includes("地球物理") ? "geophysicist" : t.includes("油藏") ? "reservoir-engineer" : t.includes("钻井") ? "drilling-engineer" : t.includes("采油") || t.includes("生产") ? "production-engineer" : t.includes("pvt") || t.includes("物性") ? "pvt-analyst" : t.includes("审核") || t.includes("verifier") ? "domain-reviewer" : t.includes("master") || t.includes("planner") ? "planner" : "analyst";
}
const Rl = [
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
function Bl({
  open: e,
  onClose: t,
  agents: r,
  editingTeam: n,
  onSaved: a
}) {
  const l = A().React, { useState: i, useEffect: s, useCallback: o } = l, {
    Modal: c,
    Input: d,
    Button: m,
    Select: f,
    Tag: u,
    Typography: p,
    Switch: y,
    Empty: h,
    message: S,
    Divider: k,
    Steps: x
  } = A().antd, { PlusOutlined: E, DeleteOutlined: L, SaveOutlined: D, ArrowRightOutlined: F } = A().antdIcons || {}, { Text: G, Paragraph: j } = p, [K, X] = i(""), [H, b] = i("🤝"), [v, _] = i(""), [I, U] = i("pipeline"), [$, O] = i(""), [z, w] = i(""), [le, oe] = i([]), [B, R] = i([]), [ne, Z] = i(!1), [W, me] = i(2), [M, ie] = i(""), [ue, Q] = i(""), [Y, se] = i({}), [he, we] = i({}), [Ae, xe] = i(
    Rl
  ), ee = [
    { value: "pipeline", icon: "→", title: "顺序交接", description: "上一步产物成为下一位专家的上下文", topology: "A → B → C", accent: "#08979c" },
    { value: "roundtable", icon: "⇉", title: "并行汇聚", description: "独立并行分析，避免观点相互污染", topology: "A ∥ B ∥ C → 汇总", accent: "#531dab" },
    { value: "coordinator", icon: "◎", title: "主管协作", description: "主控专家拆解任务并按需组织成员", topology: "主管 → 专家组", accent: "#0958d9" },
    { value: "router", icon: "◇", title: "智能路由", description: "按任务能力需求选择最小充分专家集合", topology: "任务 → 路由 → 子集", accent: "#d46b08" },
    { value: "review_loop", icon: "↻", title: "评审迭代", description: "产出、独立审查、修订，直到满足标准", topology: "执行 ⇄ 评审", accent: "#389e0d" },
    { value: "debate", icon: "⚖", title: "多方论证", description: "独立立场、交叉质询，再由裁决者综合", topology: "观点 ⇄ 反驳 → 裁决", accent: "#c41d7f" }
  ];
  s(() => {
    e && (n ? (X(n.name), b(n.emoji), _(n.description), U(n.mode), O(n.coordinatorName || ""), w(n.taskTemplate), oe(n.steps || []), R(n.members.map((C) => C.name)), me(n.maxReviewRounds || 2), ie(n.successCriteria || ""), Q(n.routingInstruction || ""), se(
      Object.fromEntries(
        n.members.map((C) => [
          C.name,
          C.bindingMode || (C.agentId ? "fixed" : "preferred")
        ])
      )
    ), we(
      Object.fromEntries(
        n.members.map((C) => [
          C.name,
          C.roleKey || It(C.name)
        ])
      )
    )) : (X(""), b("🤝"), _(""), U("pipeline"), O(""), w(`请执行以下任务：
任务描述：{任务描述}`), oe([]), R([]), me(2), ie(""), Q(""), se({}), we({})));
  }, [e, n]), s(() => {
    e && $l().then((C) => {
      C != null && C.length && xe(C);
    });
  }, [e]);
  const be = o(() => {
    if (I === "roundtable" || I === "debate" || I === "router") {
      const C = B.map((ge) => ({
        agentName: ge,
        instruction: "请给出你的专业评估意见",
        passContext: !1
      }));
      oe(C);
    } else if (I === "pipeline") {
      const C = new Map(le.map((q) => [q.agentName, q])), ge = B.map((q) => C.get(q) || {
        agentName: q,
        instruction: "请完成你的专业部分",
        passContext: !0
      });
      oe(ge);
    }
  }, [I, B, le]), Ee = (C) => {
    B.includes(C) || (R([...B, C]), se({ ...Y, [C]: "fixed" }), we({
      ...he,
      [C]: It(C)
    }), (I === "coordinator" || I === "debate") && !$ && O(C));
  }, te = (C) => {
    const ge = B.filter((re) => re !== C);
    R(ge), oe(le.filter((re) => re.agentName !== C));
    const q = { ...Y };
    delete q[C], se(q);
    const T = { ...he };
    delete T[C], we(T), $ === C && O(ge[0] || "");
  }, de = (C, ge, q) => {
    const T = [...le];
    T[C] = { ...T[C], [ge]: q }, oe(T);
  }, fe = async () => {
    if (!K.trim()) {
      S.warning("请输入团队名称");
      return;
    }
    if (B.length < 2) {
      S.warning("至少需要选择 2 个成员");
      return;
    }
    if (!z.trim()) {
      S.warning("请输入任务模板");
      return;
    }
    if ((I === "coordinator" || I === "debate") && !$) {
      S.warning(I === "debate" ? "请选择裁决者" : "请选择主控专家");
      return;
    }
    Z(!0);
    try {
      let C = [...B];
      I === "coordinator" && $ ? C = [$, ...C.filter((re) => re !== $)] : I === "debate" && $ && (C = [...C.filter((re) => re !== $), $]);
      const ge = C.map(
        (re) => {
          var Re;
          const pe = r.find((Ge) => Ge.name === re), Ie = Y[re] || "fixed", Le = he[re] || It(re), Ne = Ae.find((Ge) => Ge.key === Le);
          return {
            name: re,
            role: (Ne == null ? void 0 : Ne.display_name) || ((Re = pe == null ? void 0 : pe.description) == null ? void 0 : Re.slice(0, 30)) || "需求分析师",
            emoji: "",
            agentId: Ie === "temporary" || pe == null ? void 0 : pe.id,
            roleKey: Le,
            bindingMode: Ie
          };
        }
      );
      let q = le;
      (le.length === 0 || le.length !== B.length) && (q = B.map((re) => ({
        agentName: re,
        instruction: "请完成你的专业部分",
        passContext: I === "pipeline"
      })));
      const T = {
        id: (n == null ? void 0 : n.id) || `custom-${Date.now()}`,
        name: K.trim(),
        emoji: H,
        category: "自定义",
        description: v.trim() || `${K.trim()}（${B.length}人团队）`,
        mode: I,
        members: ge,
        coordinatorName: I === "coordinator" || I === "debate" ? $ : void 0,
        taskTemplate: z.trim(),
        orchestrationPrompt: "",
        // Custom teams use steps-based instructions
        steps: q,
        custom: !0,
        createdAt: (n == null ? void 0 : n.createdAt) || Date.now(),
        updatedAt: n == null ? void 0 : n.updatedAt,
        version: n == null ? void 0 : n.version,
        maxReviewRounds: W,
        successCriteria: M.trim(),
        routingInstruction: ue.trim()
      };
      await Dr(T), S.success(n ? "团队已更新" : "团队已创建"), a(), t();
    } catch (C) {
      S.error(C.message || "保存失败");
    } finally {
      Z(!1);
    }
  }, V = r.filter(
    (C) => !B.includes(C.name)
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
          n ? "✏️" : "➕"
        ),
        l.createElement(
          "span",
          null,
          n ? "编辑专家团" : "创建专家团"
        )
      ),
      width: 860,
      onOk: fe,
      okText: "保存专家团",
      confirmLoading: ne,
      okButtonProps: {
        icon: D ? l.createElement(D) : void 0
      }
    },
    // Step 1: Basic info
    l.createElement(
      "div",
      { style: { marginBottom: 16 } },
      l.createElement(
        G,
        {
          strong: !0,
          style: { display: "block", marginBottom: 8, fontSize: 13 }
        },
        "1. 定义任务工作流"
      ),
      l.createElement(
        "div",
        { style: { display: "flex", gap: 8, marginBottom: 8, alignItems: "center" } },
        B.length > 0 ? l.createElement(Sn, {
          members: B,
          size: 36
        }) : null,
        l.createElement(d, {
          placeholder: "专家团名称（如：储层评价与质量复核专家团）",
          value: K,
          onChange: (C) => X(C.target.value),
          style: { flex: 1 }
        })
      ),
      l.createElement(d.TextArea, {
        placeholder: "说明这个工作流解决什么问题、适用于什么场景",
        value: v,
        onChange: (C) => _(C.target.value),
        rows: 2,
        style: { marginBottom: 8 }
      }),
      l.createElement(
        G,
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
        ...ee.map((C) => {
          const ge = I === C.value;
          return l.createElement(
            "button",
            {
              key: C.value,
              type: "button",
              onClick: () => {
                U(C.value), C.value !== "coordinator" && C.value !== "debate" && O("");
              },
              style: {
                textAlign: "left",
                padding: 10,
                borderRadius: 8,
                cursor: "pointer",
                background: ge ? `${C.accent}0d` : "var(--ant-color-bg-container, #fff)",
                border: `1px solid ${ge ? C.accent : "var(--ant-color-border, #d9d9d9)"}`,
                boxShadow: ge ? `0 0 0 2px ${C.accent}1a` : "none"
              }
            },
            l.createElement(
              "div",
              { style: { display: "flex", alignItems: "center", gap: 7, color: C.accent, fontWeight: 600 } },
              l.createElement("span", { style: { fontSize: 18 } }, C.icon),
              C.title
            ),
            l.createElement("div", { style: { fontSize: 11, color: "#595959", marginTop: 5, lineHeight: 1.45 } }, C.description),
            l.createElement("div", { style: { fontSize: 10, color: C.accent, marginTop: 5, fontFamily: "monospace" } }, C.topology)
          );
        })
      )
    ),
    l.createElement(k, { style: { margin: "12px 0" } }),
    // Step 2: Select members
    l.createElement(
      "div",
      { style: { marginBottom: 16 } },
      l.createElement(
        G,
        {
          strong: !0,
          style: { display: "block", marginBottom: 8, fontSize: 13 }
        },
        "2. 配置专家角色"
      ),
      // Available agents
      V.length > 0 ? l.createElement(
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
        ...V.map(
          (C) => l.createElement(
            m,
            {
              key: C.id,
              size: "small",
              icon: E ? l.createElement(E) : void 0,
              onClick: () => Ee(C.name)
            },
            C.name
          )
        )
      ) : null,
      // Selected members
      B.length === 0 ? l.createElement(h, {
        description: "请从上方添加团队成员",
        image: h.PRESENTED_IMAGE_SIMPLE
      }) : l.createElement(
        "div",
        { style: { display: "flex", flexDirection: "column", gap: 4 } },
        ...B.map(
          (C) => l.createElement(
            "div",
            {
              key: C,
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
              l.createElement(He, { name: C, size: 24 }),
              l.createElement(
                G,
                { strong: !0, style: { fontSize: 13 } },
                C
              ),
              (I === "coordinator" || I === "debate") && $ === C ? l.createElement(
                u,
                { color: "blue", style: { fontSize: 10 } },
                I === "debate" ? "裁决者" : "主控"
              ) : null
            ),
            l.createElement(
              "div",
              { style: { display: "flex", gap: 4 } },
              l.createElement(f, {
                size: "small",
                value: he[C] || It(C),
                style: { width: 132 },
                onChange: (ge) => we({ ...he, [C]: ge }),
                options: Ae.map((ge) => ({
                  value: ge.key,
                  label: ge.display_name
                }))
              }),
              l.createElement(f, {
                size: "small",
                value: Y[C] || "fixed",
                style: { width: 118 },
                onChange: (ge) => se({ ...Y, [C]: ge }),
                options: [
                  { value: "fixed", label: "固定实例" },
                  { value: "preferred", label: "优先实例" },
                  { value: "temporary", label: "临时派生" }
                ]
              }),
              I === "coordinator" || I === "debate" ? l.createElement(
                m,
                {
                  size: "small",
                  type: "link",
                  onClick: () => O(C)
                },
                I === "debate" ? "设为裁决者" : "设为主控"
              ) : null,
              l.createElement(
                m,
                {
                  size: "small",
                  type: "link",
                  danger: !0,
                  icon: L ? l.createElement(L) : void 0,
                  onClick: () => te(C)
                },
                "移除"
              )
            )
          )
        )
      )
    ),
    I === "review_loop" || I === "router" ? l.createElement(
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
      I === "review_loop" ? l.createElement(
        "div",
        { style: { display: "grid", gridTemplateColumns: "150px 1fr", gap: 10 } },
        l.createElement(f, {
          value: W,
          onChange: (C) => me(C),
          options: [1, 2, 3, 4, 5].map((C) => ({ value: C, label: `最多 ${C} 轮` }))
        }),
        l.createElement(d, {
          value: M,
          onChange: (C) => ie(C.target.value),
          placeholder: "验收标准，例如：关键结论均有数据依据，且无高风险缺陷"
        })
      ) : l.createElement(d, {
        value: ue,
        onChange: (C) => Q(C.target.value),
        placeholder: "路由偏好，例如：仅调用任务必需的专家；涉及模拟时优先油藏工程师"
      })
    ) : null,
    l.createElement(k, { style: { margin: "12px 0" } }),
    // Step 3: Define execution steps (for pipeline/roundtable)
    B.length > 0 ? l.createElement(
      "div",
      { style: { marginBottom: 16 } },
      l.createElement(
        G,
        {
          strong: !0,
          style: { display: "block", marginBottom: 8, fontSize: 13 }
        },
        `3. 配置专家任务${I === "roundtable" ? "（并行独立）" : I === "pipeline" ? "（顺序交接）" : I === "router" ? "（作为候选能力）" : I === "review_loop" ? "（首位执行、末位评审）" : I === "debate" ? "（末位为裁决者）" : "（由主控动态编排）"}`
      ),
      // Auto-sync button
      l.createElement(
        m,
        {
          size: "small",
          type: "dashed",
          onClick: be,
          style: { marginBottom: 8 }
        },
        "自动生成步骤"
      ),
      // Steps list
      le.length === 0 ? l.createElement(
        G,
        { type: "secondary", style: { fontSize: 12 } },
        "点击「自动生成步骤」或手动配置每步的指令"
      ) : l.createElement(
        "div",
        { style: { display: "flex", flexDirection: "column", gap: 6 } },
        ...le.map(
          (C, ge) => l.createElement(
            "div",
            {
              key: ge,
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
              I === "pipeline" ? l.createElement(
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
                `${ge + 1}`
              ) : l.createElement(
                "span",
                { style: { fontSize: 14 } },
                "🔀"
              ),
              l.createElement(
                u,
                { color: "blue", style: { fontSize: 11 } },
                C.agentName
              ),
              l.createElement(
                "div",
                { style: { flex: 1 } },
                l.createElement(d, {
                  placeholder: "请输入该步骤的指令...",
                  value: C.instruction,
                  onChange: (q) => de(ge, "instruction", q.target.value),
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
              l.createElement(y, {
                size: "small",
                checked: C.passContext,
                onChange: (q) => de(ge, "passContext", q)
              }),
              l.createElement(
                G,
                { type: "secondary", style: { fontSize: 11 } },
                C.passContext ? "传递上一步结果作为上下文" : "独立执行"
              )
            )
          )
        )
      )
    ) : null,
    l.createElement(k, { style: { margin: "12px 0" } }),
    // Step 4: Task template
    l.createElement(
      "div",
      null,
      l.createElement(
        G,
        {
          strong: !0,
          style: { display: "block", marginBottom: 8, fontSize: 13 }
        },
        `${B.length > 0 ? "4" : "3"}. 任务模板`
      ),
      l.createElement(d.TextArea, {
        placeholder: `输入任务模板，可用 {参数名} 作为占位符...

例如：
请对区块 {区块名} 的井 {井号} 进行储层评价`,
        value: z,
        onChange: (C) => w(C.target.value),
        rows: 4,
        style: { fontFamily: "monospace", fontSize: 13 }
      }),
      l.createElement(
        G,
        {
          type: "secondary",
          style: { fontSize: 11, display: "block", marginTop: 4 }
        },
        "占位符 {参数名} 在发起任务时可由用户填写替换"
      )
    )
  );
}
function or({
  team: e,
  agents: t,
  onLaunch: r,
  onEdit: n,
  onDelete: a
}) {
  var b;
  const l = A().React, { useState: i } = l, { Card: s, Tag: o, Typography: c, Button: d, Tooltip: m, Popconfirm: f } = A().antd, {
    TeamOutlined: u,
    RocketOutlined: p,
    UserOutlined: y,
    EditOutlined: h,
    DeleteOutlined: S,
    DownOutlined: k,
    UpOutlined: x
  } = A().antdIcons || {}, { Text: E, Paragraph: L } = c, [D, F] = i(!1), G = {
    coordinator: { label: "主管协作", color: "blue" },
    pipeline: { label: "顺序交接", color: "cyan" },
    roundtable: { label: "并行汇聚", color: "purple" },
    router: { label: "智能路由", color: "orange" },
    review_loop: { label: "评审迭代", color: "green" },
    debate: { label: "多方论证", color: "magenta" }
  }, j = G[e.mode] || G.coordinator, K = e.members.map((v) => {
    const _ = v.bindingMode === "temporary", I = _ ? null : (v.agentId && t.some((U) => U.id === v.agentId) ? v.agentId : null) || Gr(t, v.name);
    return { ...v, found: !!I, agentId: I, temporary: _ };
  }), X = K.filter((v) => v.found).length, H = e.coordinatorName || ((b = e.members[0]) == null ? void 0 : b.name);
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
      l.createElement(Sn, {
        members: e.members.map((v) => v.name),
        size: 36
      }),
      l.createElement(
        "div",
        { style: { flex: 1 } },
        l.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 6 } },
          l.createElement(
            E,
            { strong: !0, style: { fontSize: 14 } },
            e.name
          ),
          e.custom ? l.createElement(
            o,
            { color: "gold", style: { fontSize: 9 } },
            "自定义"
          ) : null
        ),
        l.createElement(
          "div",
          { style: { display: "flex", gap: 4, marginTop: 4 } },
          l.createElement(
            o,
            { color: j.color, style: { fontSize: 10 } },
            j.label
          ),
          l.createElement(
            o,
            { color: "green", style: { fontSize: 10 } },
            `${e.members.length} 位专家`
          ),
          X < e.members.length ? l.createElement(
            m,
            {
              title: `OMP 架构下，未创建的专家将通过 spawn_subagent 自动派发，
控制器会根据角色 prompt 创建子 agent 执行任务。`
            },
            l.createElement(
              o,
              { color: "blue", style: { fontSize: 10 } },
              "OMP 自动派发"
            )
          ) : l.createElement(
            o,
            { color: "green", style: { fontSize: 10 } },
            "全部就绪"
          )
        )
      ),
      // Edit/delete for custom teams
      e.custom ? l.createElement(
        "div",
        { style: { display: "flex", gap: 2 } },
        n ? l.createElement(
          m,
          { title: "编辑" },
          l.createElement(d, {
            type: "text",
            size: "small",
            icon: h ? l.createElement(h) : void 0,
            onClick: (v) => {
              v.stopPropagation(), n(e);
            }
          })
        ) : null,
        a ? l.createElement(
          m,
          { title: "删除" },
          l.createElement(
            f,
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
              icon: S ? l.createElement(S) : void 0,
              onClick: (v) => v.stopPropagation()
            })
          )
        ) : null
      ) : null
    ),
    // Description
    l.createElement(
      L,
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
        (v) => l.createElement(
          m,
          {
            key: v.name,
            title: `${v.name}（${v.role}）${v.temporary ? " - OMP 临时派生" : v.found ? " - 已绑定实例" : " - OMP 按角色派发"}`
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
                background: v.found ? "#f0f5ff" : "#f0f0ff",
                border: `1px solid ${v.found ? "#d6e4ff" : "#d3adf7"}`,
                fontSize: 11
              }
            },
            l.createElement(He, { name: v.name, size: 18 }),
            l.createElement(
              E,
              {
                style: { fontSize: 11, color: v.found ? "#1f4e8c" : "#531dab" }
              },
              v.name
            ),
            v.temporary ? l.createElement(
              o,
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
        onClick: (v) => {
          v.stopPropagation(), F(!D);
        },
        icon: D ? x ? l.createElement(x) : "▲" : k ? l.createElement(k) : "▼"
      },
      D ? "收起流程" : "查看执行流程"
    ),
    D ? l.createElement(Ll, { team: e }) : null,
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
        E,
        { type: "secondary", style: { fontSize: 11 } },
        H ? `${e.mode === "debate" ? "裁决者" : "主控"}: ${H}` : "OMP 动态编排"
      ),
      l.createElement(
        d,
        {
          type: "primary",
          size: "small",
          icon: p ? l.createElement(p) : void 0,
          disabled: t.length === 0,
          onClick: () => r(e),
          style: Be
        },
        "运行工作流"
      )
    )
  );
}
function Ul({
  agents: e,
  onLaunch: t
}) {
  const r = A().React, { useMemo: n, useState: a, useCallback: l, useEffect: i } = r, {
    Row: s,
    Col: o,
    Input: c,
    Empty: d,
    Typography: m,
    Tag: f,
    Button: u,
    Divider: p,
    Tabs: y,
    message: h
  } = A().antd, { SearchOutlined: S, PlusOutlined: k, RocketOutlined: x } = A().antdIcons || {}, { Text: E } = m, [L, D] = a(""), [F, G] = a([]), [j, K] = a([]), [X, H] = a(!1), [b, v] = a(null), [_, I] = a("preset");
  i(() => {
    let R = !0;
    return (async () => {
      try {
        await kl();
        const ne = await dn();
        R && G(ne);
      } catch (ne) {
        console.warn("[ugsci] Failed to load backend expert teams:", ne), R && (G([]), h.warning("专家团后端加载失败，请检查服务后重试"));
      }
    })(), Al().then((ne) => {
      R && ne && K(ne);
    }), () => {
      R = !1;
    };
  }, []);
  const U = l(() => {
    dn().then(G).catch((R) => {
      console.warn("[ugsci] Failed to refresh expert teams:", R), G([]), h.warning("专家团后端加载失败，请检查服务后重试");
    });
  }, [h]), $ = l(
    (R) => {
      Sl(R.id).then(() => {
        U(), h.success(`团队「${R.name}」已删除`);
      }).catch((ne) => h.error(ne.message || "删除专家团失败"));
    },
    [h, U]
  ), O = l((R) => {
    v(R), H(!0);
  }, []), z = l(() => {
    v(null), H(!0);
  }, []), w = n(() => [...F, ...j], [F, j]), le = n(() => {
    if (!L.trim()) return w;
    const R = L.toLowerCase();
    return w.filter(
      (ne) => ne.name.toLowerCase().includes(R) || ne.description.toLowerCase().includes(R) || ne.category.toLowerCase().includes(R)
    );
  }, [w, L]), oe = le.filter((R) => R.custom), B = le.filter((R) => !R.custom);
  return r.createElement(
    "div",
    null,
    // Toolbar
    r.createElement(
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
      r.createElement(c, {
        placeholder: "搜索团队名称、描述或类别...",
        prefix: S ? r.createElement(S) : void 0,
        value: L,
        onChange: (R) => D(R.target.value),
        allowClear: !0,
        style: { flex: "1 1 280px", maxWidth: 400 }
      }),
      r.createElement(
        u,
        {
          type: "primary",
          size: "small",
          icon: k ? r.createElement(k) : void 0,
          onClick: z,
          style: Be
        },
        "创建专家团"
      )
    ),
    // Tabs: preset teams vs custom teams
    r.createElement(
      y,
      {
        activeKey: _,
        onChange: I,
        items: [
          {
            key: "preset",
            label: `预设团队${B.length ? ` (${B.length})` : ""}`,
            children: r.createElement(
              "div",
              null,
              B.length > 0 ? r.createElement(
                s,
                { gutter: [12, 12] },
                ...B.map(
                  (R) => r.createElement(
                    o,
                    { key: R.id, xs: 24, sm: 12, md: 8 },
                    r.createElement(or, {
                      team: R,
                      agents: e,
                      onLaunch: t
                    })
                  )
                )
              ) : r.createElement(d, {
                description: "未找到匹配的预设团队",
                image: d.PRESENTED_IMAGE_SIMPLE
              })
            )
          },
          {
            key: "custom",
            label: `自定义团队${oe.length ? ` (${oe.length})` : ""}`,
            children: r.createElement(
              "div",
              null,
              oe.length > 0 ? r.createElement(
                s,
                { gutter: [12, 12] },
                ...oe.map(
                  (R) => r.createElement(
                    o,
                    { key: R.id, xs: 24, sm: 12, md: 8 },
                    r.createElement(or, {
                      team: R,
                      agents: e,
                      onLaunch: t,
                      onEdit: O,
                      onDelete: $
                    })
                  )
                )
              ) : r.createElement(d, {
                description: "暂无自定义团队，点击「创建专家团」自定义",
                image: d.PRESENTED_IMAGE_SIMPLE
              })
            )
          },
          {
            key: "active",
            label: "进行中的讨论",
            children: r.createElement(
              r.Fragment,
              null,
              r.createElement(Ml, {
                enabled: _ === "active"
              }),
              r.createElement(rr, {
                activeOnly: !0,
                enabled: _ === "active"
              })
            )
          },
          {
            key: "history",
            label: "讨论历史",
            children: r.createElement(rr, {
              enabled: _ === "history"
            })
          }
        ]
      }
    ),
    // Team Builder Modal
    r.createElement(Bl, {
      open: X,
      onClose: () => {
        H(!1), v(null);
      },
      agents: e,
      editingTeam: b,
      onSaved: U
    })
  );
}
const jl = [
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
], Nl = 5e3, Dl = {
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
function Gl(e) {
  window.history.pushState({}, "", e), window.dispatchEvent(new PopStateEvent("popstate"));
}
function nn(e, t) {
  const r = new URLSearchParams();
  e && r.set("flow", e), t && r.set("run", t), Gl(`/flowforge${r.size ? `?${r.toString()}` : ""}`);
}
function Fl(e) {
  return e ? new Date(e * 1e3).toLocaleString("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  }) : "—";
}
function Hl(e) {
  if (!e || e <= 0) return "—";
  if (e < 1e3) return `${e}ms`;
  const t = Math.floor(e / 1e3);
  if (t < 60) return `${t}s`;
  const r = Math.floor(t / 60), n = t % 60;
  return `${r}m${n}s`;
}
function Wl(e) {
  if (!e) return "";
  const t = Object.keys(e).length;
  if (t === 0) return "";
  const r = Object.values(e).filter(
    (a) => a === "success" || a === "completed" || a === "skipped" || a === "cached"
  ).length, n = Object.values(e).filter(
    (a) => a === "error" || a === "failed"
  ).length;
  return n > 0 ? `${r}/${t} 节点完成 (${n} 失败)` : `${r}/${t} 节点完成`;
}
const zt = /* @__PURE__ */ new Set(["running", "queued", "paused", "waiting_human"]);
function Jl() {
  const e = A().React, { useCallback: t, useEffect: r, useRef: n, useState: a } = e, {
    Alert: l,
    Button: i,
    Card: s,
    Col: o,
    Empty: c,
    Input: d,
    Popconfirm: m,
    Row: f,
    Space: u,
    Spin: p,
    Tabs: y,
    Tag: h,
    Tooltip: S,
    Typography: k,
    message: x
  } = A().antd, {
    ApartmentOutlined: E,
    DeleteOutlined: L,
    ReloadOutlined: D,
    RocketOutlined: F,
    PlayCircleOutlined: G,
    StopOutlined: j
  } = A().antdIcons || {}, { Text: K, Paragraph: X, Title: H } = k, b = A().useSelectedAgent, v = b ? b() : { id: "default" }, _ = (v == null ? void 0 : v.id) || "default", [I, U] = a([]), [$, O] = a([]), [z, w] = a([]), [le, oe] = a(!0), [B, R] = a(!0), [ne, Z] = a(null), [W, me] = a(""), [M, ie] = a(""), [ue, Q] = a("templates"), [Y, se] = a(/* @__PURE__ */ new Set()), he = n(null), we = $.some((T) => zt.has(T.status)), Ae = e.useMemo(() => {
    const T = {};
    return I.forEach((re) => {
      T[re.id] = re.name;
    }), T;
  }, [I]), xe = e.useMemo(() => {
    const T = {};
    return $.forEach((re) => {
      zt.has(re.status) && (T[re.flow_id] = (T[re.flow_id] || 0) + 1);
    }), T;
  }, [$]), ee = t(async (T = !1) => {
    T || oe(!0);
    try {
      const [re, pe, Ie] = await Promise.all([
        ce("/flowforge/flows", { bypassCache: !0 }),
        ce("/flowforge/runs", { bypassCache: !0 }),
        Jt().catch(() => [])
      ]);
      U(re), O(pe), w(Ie), R(!0);
    } catch (re) {
      console.warn("[ugsci] FlowForge is unavailable:", re), R(!1);
    } finally {
      T || oe(!1);
    }
  }, []);
  r(() => {
    ee();
  }, [ee]), r(() => {
    if (!B || !we) {
      he.current && (clearTimeout(he.current), he.current = null);
      return;
    }
    return he.current = setTimeout(() => {
      ee(!0);
    }, Nl), () => {
      he.current && (clearTimeout(he.current), he.current = null);
    };
  }, [we, B, ee]);
  const be = t(
    async (T) => {
      if (!ne) {
        Z(T.key);
        try {
          const re = await ce(
            "/flowforge/generate",
            {
              method: "POST",
              body: JSON.stringify({
                prompt: T.sop,
                name: T.name,
                agent_id: _
              })
            }
          ), pe = {
            ...re.nodes || {}
          }, Ie = Object.entries(pe).filter(([De]) => /^step_\d+$/.test(De)).sort(([De], [Te]) => Number(De.slice(5)) - Number(Te.slice(5))), Le = {};
          let Ne = 0, Re = 0;
          Ie.forEach(([De, Te], Me) => {
            const ae = T.roleHints[Me] || "", ze = T.roleKeys[Me] || "analyst", $e = z.find(
              (Je) => `${Je.name} ${Je.id}`.toLowerCase().includes(ae.toLowerCase())
            );
            $e ? Ne++ : Re++;
            const Oe = ($e == null ? void 0 : $e.id) || _, We = { ...Te.inputs || {} };
            We.agent_id = Oe, pe[De] = {
              ...Te,
              inputs: We,
              metadata: {
                ...Te.metadata || {},
                binding_policy: "fixed_instance",
                role_hint: ae,
                role_key: ze,
                agent_id: Oe
              }
            }, Le[De] = {
              binding_policy: "fixed_instance",
              role_hint: ae,
              role_key: ze,
              agent_id: Oe
            };
          });
          const Ge = {
            ...re,
            nodes: pe,
            id: `${T.key}-${Date.now()}`,
            name: T.name,
            description: T.description,
            metadata: {
              ...re.metadata || {},
              domain: "oil-gas",
              template_key: T.key,
              expert_binding_policy: "fixed_instance",
              controller_agent_id: _,
              node_bindings: Le
            }
          };
          await ce("/flowforge/flows", {
            method: "POST",
            body: JSON.stringify(Ge)
          });
          const et = Ie.length > 0 ? `（${Ne} 个专家已匹配，${Re} 个回退到控制器）` : "";
          x.success(`已创建工作流草稿「${T.name}」${et}`), await ee();
        } catch (re) {
          x.error(re.message || "创建工作流失败");
        } finally {
          Z(null);
        }
      }
    },
    [z, _, ne, ee, x]
  ), Ee = t(async () => {
    if (!ne) {
      if (!M.trim()) {
        x.warning("请先描述工作流步骤和控制要求");
        return;
      }
      Z("natural-language");
      try {
        const T = await ce(
          "/flowforge/generate",
          {
            method: "POST",
            body: JSON.stringify({
              prompt: M.trim(),
              name: W.trim(),
              agent_id: _
            })
          }
        ), re = {
          ...T,
          id: `natural-${Date.now()}`,
          metadata: {
            ...T.metadata || {},
            domain: "oil-gas",
            source: "natural-language",
            expert_binding_policy: "fixed_instance",
            controller_agent_id: _
          }
        };
        await ce("/flowforge/flows", {
          method: "POST",
          body: JSON.stringify(re)
        }), x.success("已从自然语言生成可编辑工作流草稿"), me(""), ie(""), await ee();
      } catch (T) {
        x.error(T.message || "自然语言生成失败");
      } finally {
        Z(null);
      }
    }
  }, [_, ne, ee, x, W, M]), te = t(
    async (T, re) => {
      try {
        await ce(`/flowforge/flows/${encodeURIComponent(T)}/run`, {
          method: "POST",
          body: JSON.stringify({ inputs: {} })
        }), x.success(`已启动工作流「${re}」`), await ee(!0);
      } catch (pe) {
        x.error(pe.message || "启动工作流失败");
      }
    },
    [ee, x]
  ), de = t(
    async (T, re) => {
      try {
        await ce(`/flowforge/flows/${encodeURIComponent(T)}`, {
          method: "DELETE"
        }), x.success(`已删除工作流「${re}」`), await ee();
      } catch (pe) {
        x.error(pe.message || "删除工作流失败");
      }
    },
    [ee, x]
  ), fe = t(
    async (T) => {
      se((re) => {
        const pe = new Set(re);
        return pe.add(T), pe;
      });
      try {
        await ce(`/flowforge/runs/${encodeURIComponent(T)}/cancel`, {
          method: "POST"
        }), x.success("已请求取消运行"), await ee(!0);
      } catch (re) {
        x.error(re.message || "取消运行失败");
      } finally {
        se((re) => {
          const pe = new Set(re);
          return pe.delete(T), pe;
        });
      }
    },
    [ee, x]
  ), V = e.createElement(
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
        u,
        { direction: "vertical", style: { width: "100%" }, size: 10 },
        e.createElement(d, {
          value: W,
          onChange: (T) => me(T.target.value),
          placeholder: "工作流名称（可选）",
          maxLength: 80
        }),
        e.createElement(d.TextArea, {
          value: M,
          onChange: (T) => ie(T.target.value),
          placeholder: "例如：先检查某储气库本周期压力和注采量数据，再由油藏工程师预测下周期能力，由独立完整性专家复核风险，最后形成带证据和不确定性的建议。",
          autoSize: { minRows: 3, maxRows: 8 }
        }),
        e.createElement(
          i,
          {
            type: "primary",
            onClick: () => void Ee(),
            loading: ne === "natural-language",
            disabled: !B || !!ne,
            style: Be
          },
          "生成可编辑草稿"
        )
      )
    ),
    e.createElement(
      f,
      { gutter: [12, 12] },
      ...jl.map(
        (T) => e.createElement(
          o,
          { key: T.key, xs: 24, md: 8 },
          e.createElement(
            s,
            { style: { height: "100%" } },
            e.createElement(
              u,
              { align: "start", style: { width: "100%" } },
              e.createElement("span", { style: { fontSize: 28 } }, T.icon),
              e.createElement(
                "div",
                { style: { flex: 1 } },
                e.createElement(H, { level: 5, style: { margin: 0 } }, T.name),
                e.createElement(h, { color: "blue", style: { marginTop: 6 } }, T.category),
                e.createElement(
                  X,
                  { type: "secondary", style: { margin: "10px 0 14px" } },
                  T.description
                ),
                e.createElement(
                  i,
                  {
                    type: "primary",
                    loading: ne === T.key,
                    disabled: !B || !!ne,
                    onClick: () => void be(T),
                    style: Be
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
        f,
        { gutter: [12, 12] },
        ...[
          ["固定实例", "生产关键节点使用指定且已验证的专家实例", "当前可执行"],
          ["优先实例", "定义中记录首选实例和治理降级策略", "规划中"],
          ["模板派生", "由 OMP 控制节点按角色模板临时创建隔离角色", "规划中"],
          ["动态路由", "按能力、健康、权限和成本选择实例", "规划中"]
        ].map(
          ([T, re, pe]) => e.createElement(
            o,
            { key: T, xs: 24, sm: 12, lg: 6 },
            e.createElement(K, { strong: !0 }, T),
            e.createElement(
              h,
              {
                color: pe === "当前可执行" ? "green" : "default",
                style: { marginLeft: 6, fontSize: 10 }
              },
              pe
            ),
            e.createElement("div", { style: { color: "var(--ant-color-text-tertiary, #8c8c8c)", fontSize: 12, marginTop: 4 } }, re)
          )
        )
      )
    )
  ), C = le ? e.createElement(p) : I.length === 0 ? e.createElement(c, { description: "暂无工作流，可从模板创建" }) : e.createElement(
    f,
    { gutter: [12, 12] },
    ...I.map((T) => {
      const re = xe[T.id] || 0;
      return e.createElement(
        o,
        { key: T.id, xs: 24, md: 12, xl: 8 },
        e.createElement(
          s,
          {
            size: "small",
            title: e.createElement(
              u,
              { size: 6 },
              e.createElement("span", null, T.name),
              re > 0 ? e.createElement(
                h,
                { color: "blue" },
                `${re} 个运行中`
              ) : null
            ),
            extra: e.createElement(h, null, `v${T.version}`)
          },
          e.createElement(X, { ellipsis: { rows: 2 } }, T.description || "暂无描述"),
          e.createElement(
            u,
            { size: 8, wrap: !0 },
            e.createElement(h, { color: "geekblue" }, `${T.node_count} 个节点`),
            e.createElement(i, {
              size: "small",
              type: "primary",
              icon: G ? e.createElement(G) : void 0,
              disabled: !B,
              onClick: () => void te(T.id, T.name)
            }, "运行"),
            e.createElement(i, {
              size: "small",
              onClick: () => nn(T.id)
            }, "编辑"),
            e.createElement(
              m,
              {
                title: "确认删除",
                description: `确定要删除工作流「${T.name}」吗？此操作不可撤销。`,
                onConfirm: () => void de(T.id, T.name),
                okText: "删除",
                cancelText: "取消",
                okButtonProps: { danger: !0 }
              },
              e.createElement(i, {
                size: "small",
                danger: !0,
                icon: L ? e.createElement(L) : void 0
              }, "删除")
            )
          )
        )
      );
    })
  ), ge = le ? e.createElement(p) : $.length === 0 ? e.createElement(c, { description: "暂无工作流运行记录" }) : e.createElement(
    "div",
    { style: { display: "flex", flexDirection: "column", gap: 8 } },
    ...$.map((T) => {
      const re = Ae[T.flow_id] || T.flow_id, pe = zt.has(T.status), Ie = Wl(T.node_statuses), Le = T.duration_ms && T.duration_ms > 0 ? T.duration_ms : T.finished_at && T.started_at ? (T.finished_at - T.started_at) * 1e3 : pe && T.started_at ? (Date.now() / 1e3 - T.started_at) * 1e3 : 0;
      return e.createElement(
        s,
        { key: T.run_id, size: "small" },
        e.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" } },
          e.createElement(
            h,
            { color: Dl[T.status] || "default" },
            T.status
          ),
          e.createElement(K, { strong: !0 }, re),
          e.createElement(
            S,
            { title: T.run_id },
            e.createElement(
              K,
              { type: "secondary", style: { fontFamily: "monospace", fontSize: 11 } },
              T.run_id.slice(0, 8) + "…"
            )
          ),
          e.createElement(
            K,
            { type: "secondary", style: { fontSize: 12 } },
            Fl(T.started_at)
          ),
          Le > 0 ? e.createElement(
            K,
            { type: "secondary", style: { fontSize: 12 } },
            `耗时 ${Hl(Le)}`
          ) : null,
          Ie ? e.createElement(h, { color: "geekblue", style: { fontSize: 11 } }, Ie) : null,
          T.error ? e.createElement(
            S,
            { title: T.error },
            e.createElement(K, { type: "danger", style: { fontSize: 12 } }, "（有错误）")
          ) : null,
          e.createElement(
            "div",
            { style: { marginLeft: "auto", display: "flex", gap: 6 } },
            pe ? e.createElement(
              m,
              {
                title: "确认取消运行？",
                onConfirm: () => void fe(T.run_id),
                okText: "取消运行",
                cancelText: "保留",
                okButtonProps: { danger: !0 }
              },
              e.createElement(i, {
                size: "small",
                danger: !0,
                loading: Y.has(T.run_id),
                icon: j ? e.createElement(j) : void 0
              }, "取消运行")
            ) : null,
            e.createElement(
              i,
              { size: "small", type: "link", onClick: () => nn(void 0, T.run_id) },
              "查看详情"
            )
          )
        )
      );
    })
  ), q = e.createElement(
    u,
    null,
    e.createElement(i, {
      icon: D ? e.createElement(D) : void 0,
      onClick: () => void ee(),
      loading: le
    }, "刷新"),
    ue !== "templates" ? e.createElement(i, {
      type: "primary",
      icon: E ? e.createElement(E) : F ? e.createElement(F) : void 0,
      onClick: () => nn(),
      disabled: !B,
      style: Be
    }, "打开流程编辑器") : null
  );
  return e.createElement(
    "div",
    null,
    B ? null : e.createElement(l, {
      type: "warning",
      message: "FlowForge 引擎未启动",
      description: "协作工作流功能需要 FlowForge 后端引擎支持。请检查后端是否正常运行，或联系管理员。",
      showIcon: !0,
      style: { marginBottom: 16 }
    }),
    e.createElement(y, {
      items: [
        { key: "templates", label: "工作流模板", children: V },
        { key: "mine", label: `我的工作流 (${I.length})`, children: C },
        {
          key: "runs",
          label: e.createElement(
            "span",
            null,
            "运行中心 (",
            $.length,
            we ? e.createElement(
              "span",
              { style: { color: "#1677ff", marginLeft: 2 } },
              `·${$.filter((T) => zt.has(T.status)).length} 活跃`
            ) : null,
            ")"
          ),
          children: ge
        }
      ],
      activeKey: ue,
      onChange: (T) => Q(T),
      tabBarExtraContent: q
    })
  );
}
function ir(e, t) {
  var a, l;
  const r = e.coordinatorName || ((a = e.members[0]) == null ? void 0 : a.name), n = e.members.find((i) => i.name === r) || e.members[0];
  if ((n == null ? void 0 : n.bindingMode) !== "temporary" && (n != null && n.agentId) && t.some((i) => i.id === n.agentId))
    return n.agentId;
  if (r && (n == null ? void 0 : n.bindingMode) !== "temporary") {
    const i = Gr(t, r);
    if (i) return i;
  }
  return (n == null ? void 0 : n.bindingMode) === "fixed" ? null : ((l = t[0]) == null ? void 0 : l.id) || null;
}
function sr() {
  const e = new URLSearchParams(window.location.search).get("section");
  return e === "teams" || e === "workflows" ? e : "experts";
}
function ql() {
  var de, fe;
  const e = A().React, { useState: t, useEffect: r, useCallback: n, useMemo: a } = e, {
    Spin: l,
    Empty: i,
    Input: s,
    Button: o,
    message: c,
    Row: d,
    Col: m,
    Tabs: f,
    Modal: u,
    Typography: p
  } = A().antd, {
    ReloadOutlined: y,
    PlusOutlined: h,
    SearchOutlined: S,
    TeamOutlined: k,
    UserOutlined: x
  } = A().antdIcons || {}, { Text: E, Paragraph: L } = p, [D, F] = t([]), [G, j] = t(!0), [K, X] = t(!1), [H, b] = t(null), [v, _] = t(""), [I, U] = t(!1), [$, O] = t(sr), [z, w] = t(
    null
  ), [le, oe] = t(""), [B, R] = t(!1), [ne, Z] = t(!1), [W, me] = t(null), [M, ie] = t([]), ue = n(async () => {
    j(!0);
    try {
      const V = await Jt(), C = await Promise.all(
        V.map(async (ge) => {
          try {
            const [q, T, re] = await Promise.all([
              En(ge.id).catch(() => null),
              qt(ge.id).catch(() => []),
              wn(ge.id).catch(() => [])
            ]);
            return {
              agent: ge,
              config: q,
              skills: T,
              mcps: re,
              loading: !1
            };
          } catch {
            return {
              agent: ge,
              config: null,
              skills: [],
              mcps: [],
              loading: !1
            };
          }
        })
      );
      F(C), ie(V);
    } catch (V) {
      c.error(V.message || "加载专家列表失败"), F([]);
    } finally {
      j(!1);
    }
  }, []);
  r(() => {
    ue();
  }, [ue]), r(() => {
    const V = () => O(sr());
    return window.addEventListener("popstate", V), () => window.removeEventListener("popstate", V);
  }, []), r(() => {
    if (W && ne) {
      const V = D.find(
        (C) => C.agent.id === W.agent.id
      );
      V && V !== W && me(V);
    }
  }, [D, W, ne]);
  const Q = n(
    async (V) => {
      var T;
      const C = V.coordinatorName || ((T = V.members[0]) == null ? void 0 : T.name), ge = ir(V, M);
      if (!ge) {
        const re = V.members.find(
          (pe) => pe.name === C
        );
        c.error(
          (re == null ? void 0 : re.bindingMode) === "fixed" ? `固定协调者「${C || "协调者"}」当前不可用，请修复绑定后再运行` : "没有可用的 Agent 作为工作流控制器"
        );
        return;
      }
      if (/\{.+?\}/.test(V.taskTemplate)) {
        oe(V.taskTemplate), w(V);
        return;
      }
      await Y(V, ge, V.taskTemplate);
    },
    [M, c]
  ), Y = n(
    async (V, C, ge) => {
      R(!0);
      try {
        const q = ge || V.taskTemplate, T = V.custom ? `@${V.id}` : V.name, re = `/ugsci-team ${V.mode} ${T} ${q}`, pe = A();
        pe.setSelectedAgent && pe.setSelectedAgent(C);
        const Ie = await Tl(
          C,
          re,
          V.name
        );
        c.success(
          `OMP 工作流已启动：${V.name}（${V.mode}模式）`
        ), w(null), se(`/chat/${Ie}`);
      } catch (q) {
        c.error(q.message || "发起团队任务失败");
      } finally {
        R(!1);
      }
    },
    [c]
  ), se = (V) => {
    window.history.pushState({}, "", V), window.dispatchEvent(new PopStateEvent("popstate"));
  }, he = n((V) => {
    b(V), X(!0);
  }, []), we = n((V) => {
    me(V), Z(!0);
  }, []), Ae = n(
    (V) => {
      if (!V.agent.enabled) {
        c.warning(`专家「${V.agent.name}」未启用，请先启用`);
        return;
      }
      try {
        const C = A();
        C.setSelectedAgent && C.setSelectedAgent(V.agent.id);
      } catch (C) {
        console.warn("[ugsci] Failed to set selected agent:", C);
      }
      c.success(`已召唤专家「${V.agent.name}」，正在跳转至对话...`), se("/chat");
    },
    [c]
  ), xe = a(() => {
    if (!v.trim()) return D;
    const V = v.toLowerCase();
    return D.filter(
      (C) => {
        var ge;
        return C.agent.name.toLowerCase().includes(V) || ((ge = C.agent.description) == null ? void 0 : ge.toLowerCase().includes(V)) || C.agent.id.toLowerCase().includes(V) || C.skills.some((q) => q.name.toLowerCase().includes(V));
      }
    );
  }, [D, v]), ee = D.filter((V) => V.agent.enabled).length, be = D.reduce(
    (V, C) => V + C.skills.filter((ge) => ge.enabled !== !1).length,
    0
  ), Ee = D.reduce((V, C) => V + C.mcps.length, 0), te = [
    {
      key: "experts",
      label: e.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        x ? e.createElement(x, { style: { fontSize: 14 } }) : null,
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
            prefix: S ? e.createElement(S) : void 0,
            value: v,
            onChange: (V) => _(V.target.value),
            allowClear: !0,
            style: { flex: "1 1 280px", maxWidth: 400 }
          }),
          e.createElement(
            o,
            {
              type: "primary",
              icon: h ? e.createElement(h) : void 0,
              onClick: () => U(!0),
              style: Be
            },
            "创建专家"
          )
        ),
        // Content
        G ? e.createElement(
          "div",
          { style: { textAlign: "center", padding: 60 } },
          e.createElement(l, { size: "large" })
        ) : xe.length === 0 ? e.createElement(i, {
          description: v ? "未找到匹配的专家" : "暂无专家，点击「创建专家」添加"
        }) : e.createElement(
          d,
          { gutter: [12, 12], align: "stretch" },
          ...xe.map(
            (V) => e.createElement(
              m,
              {
                key: V.agent.id,
                xs: 24,
                sm: 12,
                md: 8,
                lg: 6,
                style: { display: "flex" }
              },
              e.createElement(pl, {
                expert: V,
                onClick: () => he(V),
                onSummon: () => Ae(V),
                onConfigure: () => we(V)
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
        k ? e.createElement(k, { style: { fontSize: 14 } }) : null,
        "专家团"
      ),
      children: e.createElement(Ul, {
        agents: M,
        onLaunch: Q
      })
    },
    {
      key: "workflows",
      label: e.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        (de = A().antdIcons) != null && de.ApartmentOutlined ? e.createElement(A().antdIcons.ApartmentOutlined, {
          style: { fontSize: 14 }
        }) : null,
        "协作工作流"
      ),
      children: e.createElement(Jl)
    }
  ];
  return e.createElement(
    "div",
    { style: { padding: 24 } },
    e.createElement(Wt, {
      title: "专家·协作",
      subtitle: $ === "experts" ? `共 ${D.length} 位专家（${ee} 位启用）· ${be} 个技能 · ${Ee} 个 MCP 客户端` : $ === "teams" ? "开放式多专家讨论、联合研判与 OMP 动态协作" : "流程化、可观测、可验证的油气与储气库协作流程",
      extra: e.createElement(
        e.Fragment,
        null,
        $ === "experts" ? e.createElement(
          o,
          {
            icon: y ? e.createElement(y) : void 0,
            onClick: () => {
              xt(), ue();
            },
            loading: G
          },
          "刷新"
        ) : null
      )
    }),
    e.createElement(f, {
      items: te,
      activeKey: $,
      onChange: (V) => {
        O(V);
        const C = new URL(window.location.href);
        V === "experts" ? C.searchParams.delete("section") : C.searchParams.set("section", V), window.history.pushState({}, "", `${C.pathname}${C.search}`);
      }
    }),
    // Drawer
    e.createElement(fl, {
      expert: H,
      open: K,
      onClose: () => X(!1),
      onRefresh: () => ue()
    }),
    // Template Modal
    e.createElement(gl, {
      open: I,
      onClose: () => U(!1),
      onCreated: () => ue()
    }),
    // Config Modal (gear icon)
    e.createElement(dl, {
      expert: W,
      open: ne,
      onClose: () => Z(!1),
      onRefresh: () => ue()
    }),
    // Team Launch Modal (for filling placeholders)
    z ? e.createElement(
      u,
      {
        open: !0,
        title: e.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 8 } },
          e.createElement(Sn, {
            members: z.members.map((V) => V.name),
            size: 28
          }),
          e.createElement(
            "span",
            null,
            `发起团队任务 - ${z.name}`
          )
        ),
        onCancel: () => w(null),
        onOk: () => {
          const V = ir(
            z,
            M
          );
          if (!V) {
            c.error("固定协调者不可用或没有可用的控制器 Agent");
            return;
          }
          const C = le.trim() || z.taskTemplate;
          Y(z, V, C);
        },
        confirmLoading: B,
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
          value: le,
          onChange: (V) => oe(V.target.value),
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
          `协调者: ${z.coordinatorName || ((fe = z.members[0]) == null ? void 0 : fe.name) || "—"} · 成员: ${z.members.map((V) => V.name).join("、")}`
        )
      )
    ) : null
  );
}
function Vl({
  agentId: e,
  agentName: t,
  refreshKey: r = 0,
  onNavigate: n
}) {
  const a = A().React, { useState: l, useEffect: i, useCallback: s } = a, {
    Spin: o,
    Empty: c,
    Button: d,
    Row: m,
    Col: f,
    Card: u,
    Tag: p,
    Checkbox: y,
    Modal: h,
    Typography: S,
    Drawer: k,
    Descriptions: x,
    message: E
  } = A().antd, {
    ReloadOutlined: L,
    ThunderboltOutlined: D,
    SettingOutlined: F,
    CheckSquareOutlined: G,
    EyeOutlined: j,
    EyeInvisibleOutlined: K,
    DeleteOutlined: X,
    CloseOutlined: H
  } = A().antdIcons || {}, { Text: b, Paragraph: v } = S, [_, I] = l([]), [U, $] = l(!0), [O, z] = l(!1), [w, le] = l(null), [oe, B] = l(!1), [R, ne] = l(
    /* @__PURE__ */ new Set()
  ), [Z, W] = l(!1), [me, M] = l(null), [ie, ue] = l(!1), Q = s(async () => {
    if (e) {
      $(!0);
      try {
        const te = await qt(e);
        I(te);
      } catch (te) {
        E.error(te.message || "加载技能失败"), I([]);
      } finally {
        $(!1);
      }
    }
  }, [e]);
  i(() => {
    Q();
  }, [Q, r]);
  const Y = (te) => {
    ne((de) => {
      const fe = new Set(de);
      return fe.has(te) ? fe.delete(te) : fe.add(te), fe;
    });
  }, se = () => ne(/* @__PURE__ */ new Set()), he = () => ne(new Set(_.map((te) => te.name))), we = () => {
    oe ? (se(), B(!1)) : B(!0);
  }, Ae = async () => {
    const te = Array.from(R);
    if (te.length !== 0) {
      W(!0);
      try {
        const { results: de } = await Ga(e, te), fe = Object.entries(de).filter(
          ([, C]) => C.success === !1
        ), V = te.length - fe.length;
        fe.length > 0 ? E.warning(
          `批量启用完成：成功 ${V} 个，失败 ${fe.length} 个`
        ) : E.success(`成功启用 ${te.length} 个技能`), se(), await Q();
      } catch (de) {
        E.error(de.message || "批量启用失败");
      } finally {
        W(!1);
      }
    }
  }, xe = async () => {
    const te = Array.from(R);
    if (te.length !== 0) {
      W(!0);
      try {
        const { results: de } = await Fa(e, te), fe = Object.entries(de).filter(
          ([, C]) => C.success === !1
        ), V = te.length - fe.length;
        fe.length > 0 ? E.warning(
          `批量停用完成：成功 ${V} 个，失败 ${fe.length} 个`
        ) : E.success(`成功停用 ${te.length} 个技能`), se(), await Q();
      } catch (de) {
        E.error(de.message || "批量停用失败");
      } finally {
        W(!1);
      }
    }
  }, ee = () => {
    const te = Array.from(R);
    te.length !== 0 && h.confirm({
      title: `确认删除 ${te.length} 个技能？`,
      content: "删除后技能将从当前专家工作区移除，此操作不可撤销。技能池中的原始技能不受影响。",
      okText: "确认删除",
      cancelText: "取消",
      okButtonProps: { danger: !0 },
      onOk: async () => {
        W(!0);
        try {
          const { results: de } = await Ha(e, te), fe = Object.entries(de).filter(
            ([, C]) => C.success === !1
          ), V = te.length - fe.length;
          fe.length > 0 ? E.warning(
            `批量删除完成：成功 ${V} 个，失败 ${fe.length} 个`
          ) : E.success(`成功删除 ${te.length} 个技能`), se(), await Q();
        } catch (de) {
          E.error(de.message || "批量删除失败");
        } finally {
          W(!1);
        }
      }
    });
  }, be = async (te) => {
    ue(!0);
    try {
      te.enabled === !1 ? (await Pr(e, te.name), E.success(`已启用技能「${te.name}」`)) : (await Mr(e, te.name), E.success(`已禁用技能「${te.name}」`)), await Q();
    } catch (de) {
      E.error(de.message || "操作失败");
    } finally {
      ue(!1);
    }
  }, Ee = (te) => {
    h.confirm({
      title: `确认删除技能「${te.name}」？`,
      content: "删除后技能将从当前专家工作区移除，此操作不可撤销。技能池中的原始技能不受影响。",
      okText: "确认删除",
      cancelText: "取消",
      okButtonProps: { danger: !0 },
      onOk: async () => {
        ue(!0);
        try {
          await bn(e, te.name), E.success(`已删除技能「${te.name}」`), await Q();
        } catch (de) {
          E.error(de.message || "删除失败");
        } finally {
          ue(!1);
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
        b,
        { type: "secondary", style: { fontSize: 13 } },
        oe ? `已选择 ${R.size} / ${_.length} 个技能` : `共 ${_.length} 个技能`
      ),
      a.createElement(
        "div",
        { style: { display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" } },
        oe ? a.createElement(
          a.Fragment,
          null,
          a.createElement(
            d,
            { size: "small", onClick: he },
            "全选"
          ),
          a.createElement(
            d,
            {
              size: "small",
              icon: H ? a.createElement(H) : void 0,
              onClick: se
            },
            "取消选择"
          ),
          a.createElement(
            d,
            {
              size: "small",
              type: "default",
              icon: j ? a.createElement(j) : void 0,
              disabled: R.size === 0 || Z,
              loading: Z,
              onClick: Ae
            },
            "批量启用"
          ),
          a.createElement(
            d,
            {
              size: "small",
              danger: !0,
              icon: K ? a.createElement(K) : void 0,
              disabled: R.size === 0 || Z,
              loading: Z,
              onClick: xe
            },
            "批量停用"
          ),
          a.createElement(
            d,
            {
              size: "small",
              danger: !0,
              icon: X ? a.createElement(X) : void 0,
              disabled: R.size === 0 || Z,
              loading: Z,
              onClick: ee
            },
            `删除 (${R.size})`
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
              icon: G ? a.createElement(G) : void 0,
              onClick: we,
              disabled: _.length === 0
            },
            "批量管理"
          ),
          a.createElement(
            d,
            {
              icon: L ? a.createElement(L) : void 0,
              onClick: () => {
                xt(), Q();
              }
            },
            "刷新"
          )
        )
      )
    ),
    U ? a.createElement(
      "div",
      { style: { textAlign: "center", padding: 60 } },
      a.createElement(o, { size: "large" })
    ) : _.length === 0 ? a.createElement(c, {
      description: "当前智能体未加载任何技能"
    }) : a.createElement(
      m,
      { gutter: [12, 12] },
      ..._.map(
        (te) => a.createElement(
          f,
          { key: te.name, xs: 24, sm: 12, md: 8, lg: 6 },
          a.createElement(
            u,
            {
              hoverable: !0,
              size: "small",
              style: {
                cursor: oe ? "default" : "pointer",
                height: "100%",
                position: "relative",
                borderColor: oe && R.has(te.name) ? "#0072f5" : void 0,
                borderWidth: oe && R.has(te.name) ? 2 : 1
              },
              onClick: () => {
                oe ? Y(te.name) : (le(te), z(!0));
              },
              onMouseEnter: () => {
                oe || M(te.name);
              },
              onMouseLeave: () => M(null)
            },
            oe ? a.createElement(
              "div",
              {
                style: {
                  position: "absolute",
                  top: 8,
                  right: 8,
                  zIndex: 1
                },
                onClick: (de) => {
                  de.stopPropagation(), Y(te.name);
                }
              },
              a.createElement(y, {
                checked: R.has(te.name)
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
              te.emoji ? a.createElement(
                "span",
                { style: { fontSize: 18 } },
                te.emoji
              ) : a.createElement(
                "span",
                { style: { fontSize: 18 } },
                "⚡"
              ),
              a.createElement(
                b,
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
                te.name
              ),
              te.enabled === !1 ? a.createElement(
                p,
                { color: "default", style: { fontSize: 10 } },
                "已禁用"
              ) : a.createElement(
                p,
                { color: "green", style: { fontSize: 10 } },
                "已启用"
              )
            ),
            te.description ? a.createElement(
              v,
              {
                type: "secondary",
                style: { fontSize: 11, margin: 0, lineHeight: 1.4 },
                ellipsis: { rows: 2 }
              },
              te.description
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
              te.version_text ? a.createElement(
                p,
                { style: { fontSize: 10 } },
                `v${te.version_text}`
              ) : null,
              ...(te.tags || []).slice(0, 3).map(
                (de, fe) => a.createElement(
                  p,
                  { key: fe, color: "blue", style: { fontSize: 10 } },
                  de
                )
              )
            ),
            // Hover action footer (not in batch mode)
            !oe && me === te.name ? a.createElement(
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
                  icon: te.enabled === !1 ? j ? a.createElement(j) : void 0 : K ? a.createElement(K) : void 0,
                  disabled: ie,
                  onClick: (de) => {
                    de.stopPropagation(), be(te);
                  }
                },
                te.enabled === !1 ? "启用" : "禁用"
              ),
              a.createElement(
                d,
                {
                  size: "small",
                  danger: !0,
                  icon: X ? a.createElement(X) : void 0,
                  disabled: ie,
                  onClick: (de) => {
                    de.stopPropagation(), Ee(te);
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
    w ? a.createElement(
      k,
      {
        title: a.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 8 } },
          a.createElement(
            "span",
            { style: { fontSize: 18 } },
            w.emoji || "⚡"
          ),
          a.createElement("span", null, w.name)
        ),
        open: O,
        onClose: () => z(!1),
        width: 520,
        extra: a.createElement(
          d,
          {
            type: "primary",
            size: "small",
            icon: F ? a.createElement(F) : void 0,
            onClick: () => n("/skills")
          },
          "管理技能"
        )
      },
      a.createElement(
        x,
        { column: 1, bordered: !0, size: "small" },
        a.createElement(
          x.Item,
          { label: "技能名称" },
          w.name
        ),
        a.createElement(
          x.Item,
          { label: "描述" },
          w.description || "-"
        ),
        w.version_text ? a.createElement(
          x.Item,
          { label: "版本" },
          w.version_text
        ) : null,
        a.createElement(
          x.Item,
          { label: "来源" },
          w.source || "-"
        ),
        a.createElement(
          x.Item,
          { label: "状态" },
          w.enabled === !1 ? "已禁用" : "已启用"
        ),
        w.installed_from ? a.createElement(
          x.Item,
          { label: "安装来源" },
          w.installed_from
        ) : null
      ),
      // Tags
      w.tags && w.tags.length > 0 ? a.createElement(
        "div",
        { style: { marginTop: 16 } },
        a.createElement(
          b,
          {
            strong: !0,
            style: { display: "block", marginBottom: 8 }
          },
          "标签"
        ),
        a.createElement(
          "div",
          { style: { display: "flex", flexWrap: "wrap", gap: 4 } },
          ...w.tags.map(
            (te, de) => a.createElement(p, { key: de, color: "blue" }, te)
          )
        )
      ) : null,
      // Skill content preview
      w.content ? a.createElement(
        "div",
        { style: { marginTop: 16 } },
        a.createElement(
          b,
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
          w.content.slice(0, 2e3) + (w.content.length > 2e3 ? `

... (内容已截断)` : "")
        )
      ) : null
    ) : null
  );
}
function Kl({
  poolSkills: e,
  workspaceSkills: t,
  agents: r,
  loading: n,
  onReload: a,
  onSkillInstalled: l,
  agentId: i,
  agentName: s
}) {
  const o = A().React, { useState: c, useMemo: d, useCallback: m, useEffect: f, useRef: u } = o, {
    Spin: p,
    Empty: y,
    Input: h,
    Button: S,
    Row: k,
    Col: x,
    Card: E,
    Tag: L,
    Typography: D,
    Drawer: F,
    Descriptions: G,
    List: j,
    Modal: K,
    message: X
  } = A().antd, {
    ReloadOutlined: H,
    SearchOutlined: b,
    DownloadOutlined: v,
    ThunderboltOutlined: _,
    DeleteOutlined: I,
    PlusOutlined: U
  } = A().antdIcons || {}, { Text: $, Paragraph: O } = D, [z, w] = c(""), [le, oe] = c(!1), [B, R] = c(null), [ne, Z] = c([]), [W, me] = c(!1), [M, ie] = c(24), [ue, Q] = c(null), [Y, se] = c(!1), he = u(0), we = u(null), Ae = d(
    () => {
      var q;
      return new Set(
        ((q = t.find((T) => T.agent_id === i)) == null ? void 0 : q.skill_names) || []
      );
    },
    [t, i]
  ), xe = d(() => {
    if (!z.trim()) return e;
    const q = z.toLowerCase();
    return e.filter(
      (T) => {
        var re, pe;
        return T.name.toLowerCase().includes(q) || ((re = T.description) == null ? void 0 : re.toLowerCase().includes(q)) || ((pe = T.tags) == null ? void 0 : pe.some((Ie) => Ie.toLowerCase().includes(q)));
      }
    );
  }, [e, z]), ee = d(
    () => xe.slice(0, M),
    [xe, M]
  );
  f(() => {
    if (ee.length >= xe.length) return;
    const q = we.current;
    if (!q) return;
    const T = () => {
      ie(
        (pe) => Math.min(pe + 24, xe.length)
      );
    };
    if (typeof IntersectionObserver < "u") {
      const pe = new IntersectionObserver(
        (Ie) => {
          Ie.some((Le) => Le.isIntersecting) && T();
        },
        { rootMargin: "240px 0px" }
      );
      return pe.observe(q), () => pe.disconnect();
    }
    const re = () => {
      q.getBoundingClientRect().top <= window.innerHeight + 240 && T();
    };
    return window.addEventListener("scroll", re, { passive: !0 }), re(), () => window.removeEventListener("scroll", re);
  }, [xe.length, ee.length]);
  const be = m((q) => {
    w(q), ie(24);
  }, []), Ee = m(() => {
    const q = he.current;
    requestAnimationFrame(() => {
      window.scrollTo({ top: q, behavior: "auto" }), document.scrollingElement && (document.scrollingElement.scrollTop = q);
    });
  }, []), te = m(async () => {
    var q;
    he.current = ((q = document.scrollingElement) == null ? void 0 : q.scrollTop) ?? window.scrollY ?? 0;
    try {
      await a();
    } finally {
      Ee();
    }
  }, [a, Ee]), de = m(
    (q) => {
      const T = [];
      for (const re of t)
        if (re.skill_names.includes(q)) {
          const pe = r.find((Ie) => Ie.id === re.agent_id);
          T.push((pe == null ? void 0 : pe.name) || re.agent_name || re.agent_id);
        }
      return T;
    },
    [t, r]
  ), fe = m(
    async (q) => {
      if (R(q), Z(de(q.name)), oe(!0), !q.content) {
        me(!0);
        try {
          const T = await La(q.name);
          R({ ...q, content: T });
        } catch {
        } finally {
          me(!1);
        }
      }
    },
    [de]
  );
  f(() => {
    B && Z(de(B.name));
  }, [B, de, t]);
  const V = async (q) => {
    se(!0);
    try {
      await vn(i, q.name), X.success(
        `已将技能「${q.name}」加载到当前专家「${s}」`
      ), l(q);
    } catch (T) {
      X.error(T.message || "加载技能失败");
    } finally {
      se(!1);
    }
  }, C = (q) => {
    if (q.protected) {
      X.warning("内置技能不可删除");
      return;
    }
    K.confirm({
      title: `确认从技能池删除「${q.name}」？`,
      content: "删除后所有已安装此技能的专家将不受影响，但技能池中将不再包含此技能。此操作不可撤销。",
      okText: "确认删除",
      cancelText: "取消",
      okButtonProps: { danger: !0 },
      onOk: async () => {
        se(!0);
        try {
          await Ja(q.name), X.success(`已从技能池删除「${q.name}」`), await te();
        } catch (T) {
          X.error(T.message || "删除失败");
        } finally {
          se(!1);
        }
      }
    });
  }, ge = (q) => {
    window.history.pushState({}, "", q), window.dispatchEvent(new PopStateEvent("popstate"));
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
        prefix: b ? o.createElement(b) : void 0,
        value: z,
        onChange: (q) => be(q.target.value),
        allowClear: !0,
        style: { maxWidth: 400 }
      }),
      o.createElement(
        "div",
        { style: { display: "flex", gap: 8 } },
        o.createElement(
          S,
          {
            icon: H ? o.createElement(H) : void 0,
            onClick: te,
            loading: n,
            size: "small"
          },
          "刷新"
        ),
        o.createElement(
          S,
          {
            type: "primary",
            icon: v ? o.createElement(v) : void 0,
            onClick: () => ge("/skill-pool"),
            size: "small",
            style: Be
          },
          "管理技能池"
        )
      )
    ),
    n ? o.createElement(
      "div",
      { style: { textAlign: "center", padding: 60 } },
      o.createElement(p, { size: "large" })
    ) : xe.length === 0 ? o.createElement(y, {
      description: z ? "未找到匹配的技能" : "技能池为空"
    }) : o.createElement(
      o.Fragment,
      null,
      o.createElement(
        k,
        { gutter: [12, 12] },
        ...ee.map(
          (q) => o.createElement(
            x,
            { key: q.name, xs: 24, sm: 12, md: 8, lg: 6 },
            o.createElement(
              E,
              {
                hoverable: !0,
                size: "small",
                style: { cursor: "pointer", height: "100%" },
                onClick: () => fe(q),
                onMouseEnter: () => Q(q.name),
                onMouseLeave: () => Q(null)
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
                q.emoji ? o.createElement(
                  "span",
                  { style: { fontSize: 18 } },
                  q.emoji
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
                  q.name
                ),
                q.protected ? o.createElement(
                  L,
                  { color: "gold", style: { fontSize: 10 } },
                  "内置"
                ) : null
              ),
              q.description ? o.createElement(
                O,
                {
                  type: "secondary",
                  style: { fontSize: 11, margin: 0, lineHeight: 1.4 },
                  ellipsis: { rows: 2 }
                },
                q.description
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
                q.version_text ? o.createElement(
                  L,
                  { style: { fontSize: 10 } },
                  `v${q.version_text}`
                ) : null,
                ...(q.tags || []).slice(0, 3).map(
                  (T, re) => o.createElement(
                    L,
                    { key: re, color: "cyan", style: { fontSize: 10 } },
                    T
                  )
                )
              ),
              // Hover action footer
              ue === q.name ? o.createElement(
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
                  S,
                  {
                    size: "small",
                    type: "primary",
                    icon: U ? o.createElement(U) : void 0,
                    disabled: Y || Ae.has(q.name),
                    onClick: (T) => {
                      T.stopPropagation(), V(q);
                    }
                  },
                  Ae.has(q.name) ? "已加载" : "加载到当前Agent"
                ),
                o.createElement(
                  S,
                  {
                    size: "small",
                    danger: !0,
                    icon: I ? o.createElement(I) : void 0,
                    disabled: Y || q.protected,
                    onClick: (T) => {
                      T.stopPropagation(), C(q);
                    }
                  },
                  "删除"
                )
              ) : null
            )
          )
        ),
        // Infinite-scroll sentinel
        ee.length < xe.length ? o.createElement(
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
          o.createElement(
            $,
            { type: "secondary", style: { fontSize: 12 } },
            `继续下滑自动加载 · 还剩 ${xe.length - ee.length} 个`
          )
        ) : null
      )
    ),
    // Skill detail drawer
    B ? o.createElement(
      F,
      {
        title: o.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 8 } },
          o.createElement(
            "span",
            { style: { fontSize: 18 } },
            B.emoji || "⚡"
          ),
          o.createElement("span", null, B.name)
        ),
        open: le,
        onClose: () => oe(!1),
        width: 520,
        extra: o.createElement(
          S,
          {
            type: "primary",
            size: "small",
            icon: _ ? o.createElement(_) : void 0,
            onClick: () => ge("/skills")
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
          B.name
        ),
        o.createElement(
          G.Item,
          { label: "描述" },
          B.description || "-"
        ),
        B.version_text ? o.createElement(
          G.Item,
          { label: "版本" },
          B.version_text
        ) : null,
        o.createElement(
          G.Item,
          { label: "来源" },
          B.source || "-"
        ),
        o.createElement(
          G.Item,
          { label: "受保护" },
          B.protected ? "是（内置）" : "否"
        ),
        B.sync_status ? o.createElement(
          G.Item,
          { label: "同步状态" },
          B.sync_status
        ) : null,
        B.installed_from ? o.createElement(
          G.Item,
          { label: "安装来源" },
          B.installed_from
        ) : null
      ),
      // Tags
      B.tags && B.tags.length > 0 ? o.createElement(
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
          ...B.tags.map(
            (q, T) => o.createElement(L, { key: T, color: "cyan" }, q)
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
        ne.length > 0 ? o.createElement(j, {
          size: "small",
          dataSource: ne,
          renderItem: (q) => o.createElement(
            j.Item,
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
              o.createElement(He, { name: q, size: 20 }),
              o.createElement(
                $,
                { style: { fontSize: 13 } },
                q
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
      W ? o.createElement(
        "div",
        { style: { marginTop: 16, textAlign: "center" } },
        o.createElement(p, { size: "small" })
      ) : B.content ? o.createElement(
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
              background: "var(--ant-color-fill-secondary, #f5f5f5)",
              borderRadius: 6,
              fontSize: 12,
              whiteSpace: "pre-wrap"
            }
          },
          B.content.slice(0, 2e3) + (B.content.length > 2e3 ? `

... (内容已截断)` : "")
        )
      ) : null
    ) : null
  );
}
function Xl({
  embedded: e = !1
} = {}) {
  const t = A().React, { useState: r, useEffect: n, useCallback: a, useMemo: l } = t, { Tabs: i, message: s } = A().antd, { ThunderboltOutlined: o, AppstoreOutlined: c } = A().antdIcons || {}, m = A().useSelectedAgent, f = m ? m() : null, u = (f == null ? void 0 : f.id) || "default";
  n(() => {
    hn();
  }, [u]);
  const [p, y] = r([]), [h, S] = r([]), [k, x] = r([]), [E, L] = r(!0), [D, F] = r("agent-skills"), [G, j] = r(0), K = a(async () => {
    L(!0);
    try {
      const [I, U, $] = await Promise.all([
        Vt(!0),
        Jt(),
        Ra()
      ]);
      S(I), y(U), x($);
    } catch (I) {
      s.error(I.message || "加载技能列表失败"), S([]);
    } finally {
      L(!1);
    }
  }, []);
  n(() => {
    K();
  }, [K]);
  const X = l(() => {
    const I = p.find((U) => U.id === u);
    return (I == null ? void 0 : I.name) || u;
  }, [p, u]), H = a(
    (I) => {
      x(
        (U) => U.some(($) => $.agent_id === u) ? U.map(($) => $.agent_id !== u || $.skill_names.includes(I.name) ? $ : {
          ...$,
          skill_names: [...$.skill_names, I.name]
        }) : [
          ...U,
          {
            agent_id: u,
            agent_name: X,
            skill_names: [I.name]
          }
        ]
      ), j((U) => U + 1);
    },
    [u, X]
  ), b = (I) => {
    window.history.pushState({}, "", I), window.dispatchEvent(new PopStateEvent("popstate"));
  }, v = [
    {
      key: "agent-skills",
      label: t.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        o ? t.createElement(o, { style: { fontSize: 14 } }) : null,
        "当前专家"
      ),
      children: t.createElement(Vl, {
        agentId: u,
        agentName: X,
        refreshKey: G,
        onNavigate: b
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
      children: t.createElement(Kl, {
        poolSkills: h,
        workspaceSkills: k,
        agents: p,
        loading: E,
        onReload: K,
        onSkillInstalled: H,
        agentId: u,
        agentName: X
      })
    }
  ], _ = t.createElement(i, {
    items: v,
    activeKey: D,
    onChange: (I) => F(I)
  });
  return e ? _ : t.createElement(
    "div",
    { style: { padding: 24 } },
    t.createElement(Wt, {
      title: "技能",
      subtitle: `技能池共 ${h.length} 个技能 · 当前智能体：${X}`
    }),
    _
  );
}
const un = {
  reservoir_simulation: "油藏数值模拟",
  geological_modeling: "地质建模",
  well_log_analysis: "测井分析",
  production_engineering: "采油工程",
  post_processing: "后处理与可视化",
  multiphysics: "多物理场仿真"
}, Wr = {
  reservoir_simulation: "🛢️",
  geological_modeling: "🏔️",
  well_log_analysis: "📡",
  production_engineering: "⚙️",
  post_processing: "📊",
  multiphysics: "🔬"
}, Jr = /* @__PURE__ */ new Set(["cmg", "comsol", "tnavigator", "eclipse", "intersect", "visage"]);
function qr(e) {
  return Ft(`/ugsci/engines/icon/${encodeURIComponent(e)}`);
}
async function Ql() {
  return ce("/ugsci/engines/list");
}
async function Yl(e) {
  return ce("/ugsci/engines/", {
    method: "POST",
    body: JSON.stringify(e)
  });
}
async function Zl(e, t) {
  return ce(`/ugsci/engines/${encodeURIComponent(e)}`, {
    method: "PUT",
    body: JSON.stringify(t)
  });
}
async function eo(e) {
  return ce(
    `/ugsci/engines/${encodeURIComponent(e)}`,
    { method: "DELETE" }
  );
}
async function to() {
  return ce("/ugsci/engines/detect/refresh", {
    method: "POST"
  });
}
function no({
  engine: e,
  onClick: t
}) {
  const r = A().React, { Card: n, Tag: a, Typography: l } = A().antd, { Text: i } = l, s = e.status === "detected", o = Wr[e.category] || "📦", d = Jr.has(e.id) ? r.createElement("img", {
    src: qr(e.id),
    alt: e.name,
    style: { width: 24, height: 24, objectFit: "contain" }
  }) : r.createElement("span", { style: { fontSize: 20 } }, o);
  return r.createElement(
    n,
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
    r.createElement(
      "div",
      {
        style: {
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 8
        }
      },
      r.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 8 } },
        d,
        r.createElement(
          "div",
          null,
          r.createElement(
            i,
            { strong: !0, style: { fontSize: 14 } },
            e.name
          ),
          r.createElement("br"),
          r.createElement(
            i,
            { type: "secondary", style: { fontSize: 11 } },
            e.vendor || "—"
          )
        )
      ),
      r.createElement(
        "div",
        { style: { display: "flex", flexDirection: "column", gap: 4, alignItems: "flex-end" } },
        s ? r.createElement(
          a,
          { color: "success", style: { fontSize: 11 } },
          "✅ 已检测"
        ) : e.executable_path ? r.createElement(
          a,
          { color: "warning", style: { fontSize: 11 } },
          "⚠ 路径无效"
        ) : r.createElement(
          a,
          { style: { fontSize: 11 } },
          "🔧 待配置"
        ),
        e.is_default ? r.createElement(
          a,
          { color: "blue", style: { fontSize: 10 } },
          "默认"
        ) : e.is_custom ? r.createElement(
          a,
          { color: "purple", style: { fontSize: 10 } },
          "自定义"
        ) : null
      )
    ),
    r.createElement(
      "div",
      { style: { flex: 1, minHeight: 32 } },
      r.createElement(
        i,
        { type: "secondary", style: { fontSize: 12 } },
        e.description || "暂无描述"
      )
    ),
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
      e.category ? r.createElement(
        a,
        { style: { fontSize: 11 } },
        un[e.category] || e.category
      ) : null,
      e.version ? r.createElement(
        a,
        { color: "blue", style: { fontSize: 11 } },
        `v${e.version}`
      ) : null,
      ...(e.modules || []).map(
        (m) => r.createElement(
          a,
          { key: m, color: "cyan", style: { fontSize: 10 } },
          m
        )
      )
    )
  );
}
function ro() {
  const e = A().React, { useState: t, useEffect: r, useCallback: n, useMemo: a } = e, {
    Spin: l,
    Empty: i,
    Button: s,
    message: o,
    Row: c,
    Col: d,
    Drawer: m,
    Descriptions: f,
    Tag: u,
    Typography: p,
    Modal: y,
    Input: h,
    Select: S,
    Popconfirm: k,
    Space: x
  } = A().antd, {
    ReloadOutlined: E,
    SearchOutlined: L,
    PlusOutlined: D,
    EditOutlined: F,
    DeleteOutlined: G,
    CopyOutlined: j,
    ExperimentOutlined: K
  } = A().antdIcons || {}, { Text: X, Paragraph: H } = p, [b, v] = t([]), [_, I] = t(!0), [U, $] = t(""), [O, z] = t(!1), [w, le] = t(null), [oe, B] = t(!1), [R, ne] = t(null), [Z, W] = t({}), [me, M] = t(!1), ie = n(async () => {
    I(!0);
    try {
      const ee = await Ql();
      v(ee.engines || []);
    } catch (ee) {
      o.error(ee.message || "加载引擎列表失败"), v([]);
    } finally {
      I(!1);
    }
  }, []);
  r(() => {
    ie();
  }, [ie]);
  const ue = a(() => {
    if (!U.trim()) return b;
    const ee = U.toLowerCase();
    return b.filter(
      (be) => {
        var Ee;
        return be.name.toLowerCase().includes(ee) || be.vendor.toLowerCase().includes(ee) || be.category.toLowerCase().includes(ee) || ((Ee = be.description) == null ? void 0 : Ee.toLowerCase().includes(ee));
      }
    );
  }, [b, U]);
  b.filter((ee) => ee.status === "detected").length;
  const Q = n((ee) => {
    navigator.clipboard.writeText(ee).then(() => o.success("路径已复制")).catch(() => o.error("复制失败"));
  }, []), Y = n(() => {
    ne(null), W({
      name: "",
      vendor: "",
      version: "",
      executable_path: "",
      category: "",
      description: "",
      invocation_hint: ""
    }), B(!0);
  }, []), se = n((ee) => {
    ne(ee), W({ ...ee }), B(!0), z(!1);
  }, []), he = n(async () => {
    var ee;
    if (!((ee = Z.name) != null && ee.trim())) {
      o.warning("请输入引擎名称");
      return;
    }
    M(!0);
    try {
      R ? (await Zl(R.id, Z), o.success("引擎已更新")) : (await Yl(Z), o.success("引擎已添加")), B(!1), ie();
    } catch (be) {
      o.error(be.message || "保存失败");
    } finally {
      M(!1);
    }
  }, [Z, R, ie]), we = n(
    async (ee) => {
      try {
        await eo(ee), o.success("引擎已删除"), z(!1), ie();
      } catch (be) {
        o.error(be.message || "删除失败");
      }
    },
    [ie]
  ), Ae = n(async () => {
    I(!0);
    try {
      const ee = await to();
      v(ee.engines || []), o.success("自动检测完成");
    } catch (ee) {
      o.error(ee.message || "检测失败");
    } finally {
      I(!1);
    }
  }, []), xe = n(
    (ee, be, Ee) => {
      const te = Z[be] || "";
      return e.createElement(
        "div",
        { style: { marginBottom: 12 } },
        e.createElement(
          X,
          { style: { fontSize: 13, display: "block", marginBottom: 4 } },
          ee
        ),
        Ee != null && Ee.select ? e.createElement(S, {
          value: te || void 0,
          onChange: (de) => W((fe) => ({ ...fe, [be]: de })),
          style: { width: "100%" },
          options: Ee.select.options,
          allowClear: !0,
          placeholder: `选择${ee}`
        }) : Ee != null && Ee.textarea ? e.createElement(h.TextArea, {
          value: te,
          onChange: (de) => W((fe) => ({ ...fe, [be]: de.target.value })),
          rows: 3,
          placeholder: `输入${ee}`
        }) : e.createElement(h, {
          value: te,
          onChange: (de) => W((fe) => ({ ...fe, [be]: de.target.value })),
          placeholder: `输入${ee}`
        })
      );
    },
    [Z]
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
      e.createElement(h, {
        placeholder: "搜索引擎名称、厂商...",
        prefix: L ? e.createElement(L) : void 0,
        value: U,
        onChange: (ee) => $(ee.target.value),
        allowClear: !0,
        style: { maxWidth: 280 }
      }),
      e.createElement(
        s,
        {
          icon: E ? e.createElement(E) : void 0,
          onClick: Ae,
          loading: _
        },
        "自动检测"
      ),
      e.createElement(
        s,
        {
          type: "primary",
          icon: D ? e.createElement(D) : void 0,
          onClick: Y,
          style: Be
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
    ) : ue.length === 0 ? e.createElement(i, {
      description: U ? "无匹配引擎" : "暂无引擎，点击「添加引擎」开始"
    }) : e.createElement(
      c,
      { gutter: [12, 12], align: "stretch" },
      ...ue.map(
        (ee) => e.createElement(
          d,
          {
            key: ee.id,
            xs: 24,
            sm: 12,
            md: 8,
            lg: 6,
            style: { display: "flex" }
          },
          e.createElement(no, {
            engine: ee,
            onClick: () => {
              le(ee), z(!0);
            }
          })
        )
      )
    ),
    // Detail drawer
    w ? e.createElement(
      m,
      {
        title: e.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 8 } },
          e.createElement(
            "span",
            { style: { display: "flex", alignItems: "center" } },
            Jr.has(w.id) ? e.createElement("img", {
              src: qr(w.id),
              alt: w.name,
              style: { width: 20, height: 20, objectFit: "contain" }
            }) : e.createElement(
              "span",
              { style: { fontSize: 18 } },
              Wr[w.category] || "📦"
            )
          ),
          e.createElement("span", null, w.name)
        ),
        open: O,
        onClose: () => z(!1),
        width: 520,
        extra: e.createElement(
          x,
          null,
          e.createElement(
            s,
            {
              size: "small",
              icon: F ? e.createElement(F) : void 0,
              onClick: () => se(w)
            },
            "编辑"
          ),
          w.is_default ? null : e.createElement(
            k,
            {
              title: "确认删除此引擎？",
              description: w.name,
              onConfirm: () => we(w.id),
              okText: "删除",
              cancelText: "取消",
              okButtonProps: { danger: !0 }
            },
            e.createElement(
              s,
              {
                size: "small",
                danger: !0,
                icon: G ? e.createElement(G) : void 0
              },
              "删除"
            )
          )
        )
      },
      e.createElement(
        f,
        { column: 1, bordered: !0, size: "small" },
        e.createElement(
          f.Item,
          { label: "引擎名称" },
          w.name
        ),
        e.createElement(
          f.Item,
          { label: "厂商" },
          w.vendor || "—"
        ),
        e.createElement(
          f.Item,
          { label: "分类" },
          w.category ? un[w.category] || w.category : "—"
        ),
        e.createElement(
          f.Item,
          { label: "状态" },
          e.createElement(
            u,
            {
              color: w.status === "detected" ? "success" : w.status === "not_found" ? "error" : "default"
            },
            w.status === "detected" ? "✅ 已检测" : w.status === "not_found" ? "❌ 路径无效" : "🔧 待配置"
          )
        ),
        e.createElement(
          f.Item,
          { label: "版本" },
          w.version || "—"
        ),
        w.executable_path ? e.createElement(
          f.Item,
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
              w.executable_path
            ),
            e.createElement(
              s,
              {
                size: "small",
                type: "text",
                icon: j ? e.createElement(j) : void 0,
                onClick: () => Q(w.executable_path)
              }
            )
          )
        ) : null,
        w.install_dir ? e.createElement(
          f.Item,
          { label: "安装目录" },
          e.createElement(
            "code",
            { style: { fontSize: 12, wordBreak: "break-all" } },
            w.install_dir
          )
        ) : null,
        // Display detected modules with paths
        w.modules && w.modules.length > 0 ? e.createElement(
          f.Item,
          { label: "已检测模块" },
          e.createElement(
            "div",
            { style: { display: "flex", flexDirection: "column", gap: 4 } },
            ...w.modules.map(
              (ee) => e.createElement(
                "div",
                {
                  key: ee,
                  style: { display: "flex", alignItems: "center", gap: 8 }
                },
                e.createElement(
                  u,
                  { color: "cyan", style: { fontSize: 11 } },
                  ee
                ),
                w.module_paths && w.module_paths[ee] ? e.createElement(
                  "code",
                  { style: { fontSize: 11, wordBreak: "break-all" } },
                  w.module_paths[ee]
                ) : null
              )
            )
          )
        ) : null,
        w.license_server ? e.createElement(
          f.Item,
          { label: "许可证服务器" },
          w.license_server
        ) : null,
        e.createElement(
          f.Item,
          { label: "描述" },
          w.description || "—"
        )
      ),
      // Invocation hint
      w.invocation_hint ? e.createElement(
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
          X,
          { strong: !0, style: { fontSize: 13 } },
          "💡 调用方式"
        ),
        e.createElement(
          "div",
          { style: { marginTop: 8, fontSize: 13, lineHeight: 1.6 } },
          w.invocation_hint
        )
      ) : null,
      // Type badge
      e.createElement(
        "div",
        { style: { marginTop: 12 } },
        w.is_default ? e.createElement(
          u,
          { color: "blue" },
          "默认引擎"
        ) : w.is_custom ? e.createElement(
          u,
          { color: "purple" },
          "自定义引擎"
        ) : null
      )
    ) : null,
    // Add/Edit modal
    e.createElement(
      y,
      {
        title: R ? "编辑引擎" : "添加引擎",
        open: oe,
        onOk: he,
        onCancel: () => B(!1),
        okText: R ? "保存" : "添加",
        cancelText: "取消",
        confirmLoading: me,
        width: 560
      },
      e.createElement(
        "div",
        { style: { maxHeight: 480, overflow: "auto", paddingRight: 8 } },
        xe("引擎名称 *", "name"),
        xe("厂商", "vendor"),
        xe("版本", "version"),
        xe("可执行文件路径", "executable_path"),
        xe("安装目录", "install_dir"),
        xe("分类", "category", {
          select: {
            options: Object.entries(un).map(([ee, be]) => ({
              label: be,
              value: ee
            }))
          }
        }),
        xe("描述", "description", { textarea: !0 }),
        xe("调用方式提示", "invocation_hint", { textarea: !0 }),
        xe("许可证服务器", "license_server")
      )
    )
  );
}
async function ao(e = !1) {
  const t = await ce(
    "/ugsci/domain-engines/list",
    e ? { bypassCache: !0 } : void 0
  );
  return (t == null ? void 0 : t.engines) || [];
}
function lo(e = !1) {
  return ce(
    "/ugsci/domain-engines/neqsim/runtime",
    e ? { bypassCache: !0 } : void 0
  );
}
function oo() {
  return ce("/ugsci/domain-engines/neqsim/install", {
    method: "POST"
  });
}
function io(e) {
  return ce(
    `/ugsci/domain-engines/neqsim/install/${encodeURIComponent(e)}`,
    { bypassCache: !0 }
  );
}
async function so(e, t = !1) {
  const r = await ce("/tools", {
    headers: { "X-Agent-Id": e },
    ...t ? { bypassCache: !0 } : {}
  }) || [];
  return new Map(r.map((n) => [n.name, n]));
}
async function co(e, t = !1) {
  const r = /* @__PURE__ */ new Map(), n = {
    headers: { "X-Agent-Id": e },
    ...t ? { bypassCache: !0 } : {}
  };
  let a;
  try {
    a = await ce(
      "/mcp",
      n
    ) || [];
  } catch {
    return r;
  }
  for (const l of a) {
    const i = l.key;
    if (!l.enabled) {
      r.set(i, { key: i, enabled: !1, toolCount: 0, error: null });
      continue;
    }
    try {
      const s = await ce(
        `/mcp/tools/${encodeURIComponent(i)}`,
        n
      ) || [];
      r.set(i, {
        key: i,
        enabled: !0,
        toolCount: s.filter((o) => o.enabled).length,
        error: null
      });
    } catch (s) {
      r.set(i, {
        key: i,
        enabled: !0,
        toolCount: 0,
        error: s instanceof Error ? s.message : "Tool query failed"
      });
    }
  }
  return r;
}
function cr(e) {
  return e ? e.overall === "available" ? "available" : e.overall === "unavailable" ? "unavailable" : "unknown" : "unknown";
}
function dr(e) {
  return e ? e.enabled ? e.error ? "error" : e.toolCount > 0 ? "available" : "error" : "unconfigured" : "unavailable";
}
function uo(e, t = null, r = /* @__PURE__ */ new Map()) {
  const n = e.engine, a = e.dependency_status;
  let l, i, s;
  if (n.provider.kind === "driver")
    a.overall === "unavailable" ? l = "needs_install" : l = dr(t), i = (t == null ? void 0 : t.toolCount) ?? 0, s = (t == null ? void 0 : t.key) ?? n.provider.id;
  else if (n.source === "builtin") {
    const o = cr(a), c = n.operations.flatMap((f) => f.tool_names), d = c.filter((f) => r.has(f)), m = d.filter(
      (f) => {
        var u;
        return (u = r.get(f)) == null ? void 0 : u.enabled;
      }
    );
    o !== "available" ? l = o : d.length !== c.length ? l = "error" : m.length === 0 ? l = "unconfigured" : l = "available", i = m.length, s = null;
  } else n.source === "mcp" ? (l = dr(t), i = (t == null ? void 0 : t.toolCount) ?? 0, s = (t == null ? void 0 : t.key) ?? n.provider.id) : (l = cr(a), i = 0, s = null);
  return {
    definition: n,
    dependencyStatus: a,
    checkedAt: e.checked_at,
    effectiveStatus: l,
    discoveredToolCount: i,
    mcpProviderKey: s
  };
}
function mo(e) {
  const t = /* @__PURE__ */ new Map();
  for (const r of e) {
    const n = r.definition.domain;
    t.has(n) || t.set(n, []), t.get(n).push(r);
  }
  return t;
}
const mn = {
  available: "可用",
  unavailable: "不可用",
  unknown: "未知",
  needs_install: "待安装",
  unconfigured: "未配置",
  error: "错误"
}, pn = {
  available: "success",
  unavailable: "error",
  unknown: "default",
  needs_install: "warning",
  unconfigured: "warning",
  error: "error"
}, po = {
  geology_well_logging: "📡",
  production_engineering: "⚙️",
  fluid_thermodynamics: "🧪",
  scientific_computing: "🧮",
  data_modeling: "📊"
}, fo = {
  builtin: "内置",
  mcp: "MCP",
  library: "计算库"
}, go = {
  deterministic: "确定性",
  stochastic: "随机/概率",
  external: "外部 Provider",
  visualization: "可视化"
}, yo = {
  deterministic: "green",
  stochastic: "purple",
  external: "blue",
  visualization: "cyan"
};
function ho({
  view: e,
  onClick: t
}) {
  const r = A().React, { Card: n, Tag: a, Typography: l } = A().antd, { Text: i } = l, s = e.definition, o = po[s.domain] || "📦", c = e.effectiveStatus, d = s.operations.length, m = e.discoveredToolCount;
  return r.createElement(
    n,
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
    r.createElement(
      "div",
      {
        style: {
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 8
        }
      },
      r.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 8 } },
        r.createElement("span", { style: { fontSize: 20 } }, o),
        r.createElement(
          "div",
          null,
          r.createElement(
            i,
            { strong: !0, style: { fontSize: 14 } },
            s.name
          ),
          r.createElement("br"),
          r.createElement(
            i,
            { type: "secondary", style: { fontSize: 11 } },
            s.provider.kind === "driver" ? "内置 · MCP" : fo[s.source] || s.source
          )
        )
      ),
      r.createElement(
        a,
        { color: pn[c] || "default", style: { fontSize: 11 } },
        mn[c] || c
      )
    ),
    r.createElement(
      "div",
      { style: { flex: 1, minHeight: 32 } },
      r.createElement(
        i,
        { type: "secondary", style: { fontSize: 12 } },
        s.description
      )
    ),
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
      r.createElement(
        a,
        { style: { fontSize: 11 } },
        `${d} 操作`
      ),
      r.createElement(
        a,
        {
          color: yo[s.execution_class] || "default",
          style: { fontSize: 11 }
        },
        go[s.execution_class] || s.execution_class
      ),
      m > 0 ? r.createElement(
        a,
        { color: "blue", style: { fontSize: 11 } },
        `${m} 工具`
      ) : null,
      ...(s.tags || []).map(
        (f) => r.createElement(
          a,
          { key: f, color: "cyan", style: { fontSize: 10 } },
          f
        )
      )
    )
  );
}
function Eo({
  view: e,
  open: t,
  onClose: r,
  onNavigateToMcp: n,
  onNavigateToTools: a,
  onNavigateToSkills: l,
  onInstallNeqsim: i,
  neqsimInstallState: s
}) {
  const o = A().React, { Drawer: c, Descriptions: d, Tag: m, Typography: f, Button: u, Space: p, Divider: y } = A().antd, { Text: h, Paragraph: S } = f;
  if (!e) return null;
  const k = e.definition, x = e.dependencyStatus;
  return o.createElement(
    c,
    {
      title: o.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 8 } },
        o.createElement("span", null, k.name),
        o.createElement(
          m,
          {
            color: pn[e.effectiveStatus] || "default",
            style: { fontSize: 11 }
          },
          mn[e.effectiveStatus] || e.effectiveStatus
        )
      ),
      open: t,
      onClose: r,
      width: 560,
      rootClassName: "ugsci-domain-engine-detail-drawer"
    },
    // Overview
    o.createElement(
      d,
      { column: 1, bordered: !0, size: "small" },
      o.createElement(
        d.Item,
        { label: "领域" },
        k.domain
      ),
      o.createElement(
        d.Item,
        { label: "来源" },
        k.provider.kind === "driver" ? "内置能力 · MCP Driver" : k.source === "builtin" ? "内置工具" : k.source === "mcp" ? "MCP 服务" : "科学计算库 / 技能"
      ),
      o.createElement(
        d.Item,
        { label: "实现" },
        `${k.provider.kind}:${k.provider.id}`
      ),
      o.createElement(
        d.Item,
        { label: "计算类别" },
        k.execution_class === "deterministic" ? "确定性计算" : k.execution_class === "stochastic" ? "随机/概率计算" : k.execution_class === "external" ? "外部 Provider" : "可视化"
      ),
      o.createElement(
        d.Item,
        { label: "内核版本" },
        k.engine_version
      ),
      o.createElement(
        d.Item,
        { label: "描述" },
        k.description
      ),
      o.createElement(
        d.Item,
        { label: "检测时间" },
        e.checkedAt
      )
    ),
    // Operations
    o.createElement(
      "div",
      { style: { marginTop: 16, marginBottom: 8 } },
      o.createElement(h, { strong: !0 }, "领域操作")
    ),
    ...k.operations.map(
      (E) => o.createElement(
        "div",
        {
          key: E.id,
          style: {
            padding: "8px 12px",
            marginBottom: 4,
            background: "#fafafa",
            borderRadius: 6
          }
        },
        o.createElement(
          "div",
          null,
          o.createElement(h, { strong: !0, style: { fontSize: 13 } }, E.name),
          o.createElement(
            h,
            { type: "secondary", style: { fontSize: 11, marginLeft: 8 } },
            E.id
          )
        ),
        o.createElement(
          h,
          { type: "secondary", style: { fontSize: 12 } },
          E.description
        ),
        E.tool_names.length > 0 ? o.createElement(
          "div",
          { style: { marginTop: 4, display: "flex", gap: 4, flexWrap: "wrap" } },
          ...E.tool_names.map(
            (L) => o.createElement(
              m,
              { key: L, color: "blue", style: { fontSize: 10 } },
              L
            )
          )
        ) : null
      )
    ),
    // Dependencies
    o.createElement(y, null),
    o.createElement(h, { strong: !0 }, "实现与依赖"),
    x && x.dependencies.length > 0 ? o.createElement(
      "div",
      { style: { marginTop: 8 } },
      ...x.dependencies.map(
        (E) => o.createElement(
          "div",
          {
            key: E.name,
            style: {
              padding: "8px 0",
              borderBottom: "1px solid var(--ant-color-border-secondary, #f0f0f0)"
            }
          },
          o.createElement(
            "div",
            {
              style: {
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }
            },
            o.createElement(h, { style: { fontSize: 13 } }, E.name),
            o.createElement(
              m,
              {
                color: pn[E.status] || "default",
                style: { fontSize: 11 }
              },
              mn[E.status] || E.status
            )
          ),
          E.status !== "available" && E.reason ? o.createElement(
            h,
            { type: "secondary", style: { display: "block", fontSize: 12, marginTop: 4 } },
            E.reason
          ) : null,
          E.status !== "available" && E.install_hint ? o.createElement(
            h,
            { style: { display: "block", fontSize: 12, marginTop: 4 } },
            `安装：${E.install_hint}`
          ) : null,
          E.status !== "available" && E.enable_hint ? o.createElement(
            h,
            { style: { display: "block", fontSize: 12, marginTop: 2 } },
            `启用：${E.enable_hint}`
          ) : null
        )
      )
    ) : o.createElement(
      S,
      { type: "secondary", style: { fontSize: 12 } },
      "无外部依赖"
    ),
    // Actions
    o.createElement(y, null),
    o.createElement(h, { strong: !0 }, "问题处理"),
    o.createElement(
      "div",
      { style: { marginTop: 8, display: "flex", gap: 8, flexWrap: "wrap" } },
      k.id === "neqsim" && e.effectiveStatus === "needs_install" ? o.createElement(
        u,
        {
          size: "small",
          type: "primary",
          loading: (s == null ? void 0 : s.status) === "queued" || (s == null ? void 0 : s.status) === "running",
          onClick: i
        },
        (s == null ? void 0 : s.status) === "running" ? `${s.message} (${s.progress}%)` : "安装 NeqSim 运行环境"
      ) : null,
      k.provider.kind === "driver" ? o.createElement(
        u,
        { size: "small", onClick: n },
        "查看内置 MCP Driver"
      ) : k.source === "library" ? o.createElement(
        u,
        { size: "small", onClick: l },
        "查看相关技能"
      ) : o.createElement(
        u,
        { size: "small", onClick: () => a("builtin") },
        "查看内置工具"
      )
    ),
    k.id === "neqsim" && (s == null ? void 0 : s.status) === "failed" ? o.createElement(
      S,
      { type: "danger", style: { marginTop: 8, fontSize: 12 } },
      s.error || "安装失败"
    ) : null,
    k.id === "neqsim" && (s != null && s.warning) ? o.createElement(
      S,
      { type: "warning", style: { marginTop: 8, fontSize: 12 } },
      s.warning
    ) : null
  );
}
const vo = {
  geology_well_logging: "测井地质",
  production_engineering: "采油工程",
  fluid_thermodynamics: "流体热力学",
  scientific_computing: "科学计算",
  data_modeling: "数据建模"
};
function bo(e) {
  return e instanceof Error ? /Install task not found|HTTP 404/i.test(e.message) : !1;
}
function wo({
  onNavigateToMcp: e,
  onNavigateToTools: t,
  onNavigateToSkills: r
} = {}) {
  var ie, ue;
  const n = A().React, { useState: a, useEffect: l, useCallback: i, useMemo: s, useRef: o } = n, {
    Spin: c,
    Empty: d,
    Button: m,
    message: f,
    Row: u,
    Col: p,
    Input: y,
    Drawer: h,
    Typography: S
  } = A().antd, { ReloadOutlined: k, SearchOutlined: x } = A().antdIcons || {}, { Text: E } = S, L = (ue = (ie = A()).useSelectedAgent) == null ? void 0 : ue.call(ie), D = (L == null ? void 0 : L.id) || "default", [F, G] = a([]), [j, K] = a(!0), [X, H] = a(""), [b, v] = a(!1), [_, I] = a(null), [U, $] = a(null), O = o(D);
  O.current = D;
  const z = o(_);
  z.current = _;
  const w = o(0);
  l(() => () => {
    w.current += 1;
  }, []);
  const le = i(
    async (Q = !1, Y = !1) => {
      var Ae, xe;
      Y || K(!0);
      const se = Y && typeof window < "u" ? {
        x: window.scrollX,
        y: window.scrollY,
        drawerBody: typeof document < "u" ? document.querySelector(
          ".ugsci-domain-engine-detail-drawer .ant-drawer-body"
        ) : null,
        drawerTop: typeof document < "u" && ((Ae = document.querySelector(
          ".ugsci-domain-engine-detail-drawer .ant-drawer-body"
        )) == null ? void 0 : Ae.scrollTop) || 0
      } : null, he = () => {
        if (!se || typeof window > "u") return;
        const ee = () => {
          var be;
          window.scrollTo(se.x, se.y), (be = se.drawerBody) != null && be.isConnected && (se.drawerBody.scrollTop = se.drawerTop);
        };
        typeof window.requestAnimationFrame == "function" ? window.requestAnimationFrame(ee) : ee();
      }, we = O.current;
      try {
        const [ee, be, Ee] = await Promise.all([
          ao(Q),
          co(we, Q),
          so(we, Q)
        ]);
        if (we !== O.current) return;
        const te = [];
        for (const fe of ee)
          try {
            let V = null;
            if (fe.engine.provider.kind === "driver") {
              const C = fe.engine.provider.id;
              V = be.get(C) || null;
            }
            te.push(uo(fe, V, Ee));
          } catch {
          }
        G(te);
        const de = (xe = z.current) == null ? void 0 : xe.definition.id;
        if (de) {
          const fe = te.find(
            (V) => V.definition.id === de
          );
          fe && (z.current = fe, I(fe));
        }
        he();
      } catch (ee) {
        const be = ee instanceof Error ? ee.message : "加载领域引擎失败";
        f.error(be), Y || G([]);
      } finally {
        Y || K(!1);
      }
    },
    []
  );
  l(() => {
    le();
  }, [D, le]);
  const oe = s(() => {
    if (!X.trim()) return F;
    const Q = X.toLowerCase();
    return F.filter(
      (Y) => Y.definition.name.toLowerCase().includes(Q) || Y.definition.domain.toLowerCase().includes(Q) || Y.definition.description.toLowerCase().includes(Q) || Y.definition.tags.some((se) => se.toLowerCase().includes(Q))
    );
  }, [F, X]), B = s(
    () => mo(oe),
    [oe]
  ), R = i(() => {
    le(!0);
  }, [le]), ne = i((Q) => {
    z.current = Q, I(Q), v(!0);
  }, []), Z = i(() => {
    v(!1), e == null || e();
  }, [e]), W = i(
    (Q) => {
      v(!1), t == null || t(Q);
    },
    [t]
  ), me = i(() => {
    v(!1), r == null || r();
  }, [r]), M = i(async () => {
    const Q = ++w.current, Y = () => Q === w.current;
    try {
      let se = await oo();
      if (!Y()) return;
      for ($(se); se.status === "queued" || se.status === "running"; ) {
        if (await new Promise((he) => setTimeout(he, 1e3)), !Y()) return;
        try {
          se = await io(se.id);
        } catch (he) {
          if (!bo(he)) throw he;
          const we = await lo(!0);
          if (!Y()) return;
          we.ready ? se = {
            ...se,
            status: "completed",
            progress: 100,
            message: "后端重启后已恢复 NeqSim 运行环境状态",
            error: "",
            runtime: we,
            recovered: !0
          } : se = {
            ...se,
            status: "failed",
            message: "安装进程因后端重启中断",
            error: "后端重启后未发现完整的 NeqSim 运行环境，请重新安装",
            runtime: we,
            recovered: !0
          };
        }
        if (!Y()) return;
        $(se);
      }
      if (!Y()) return;
      se.status === "completed" ? (se.warning ? f.warning(se.warning) : f.success("NeqSim 运行环境已安装并启用"), await le(!0, !0)) : f.error(se.error || "NeqSim 安装失败");
    } catch (se) {
      if (!Y()) return;
      f.error(se instanceof Error ? se.message : "NeqSim 安装失败");
    }
  }, [le]);
  return n.createElement(
    "div",
    null,
    // Action bar
    n.createElement(
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
      n.createElement(y, {
        placeholder: "搜索领域引擎...",
        prefix: x ? n.createElement(x) : void 0,
        value: X,
        onChange: (Q) => H(Q.target.value),
        allowClear: !0,
        style: { maxWidth: 280 }
      }),
      n.createElement(
        m,
        {
          icon: k ? n.createElement(k) : void 0,
          onClick: R,
          loading: j
        },
        "刷新"
      )
    ),
    // Content
    j ? n.createElement(
      "div",
      { style: { textAlign: "center", padding: 60 } },
      n.createElement(c, {
        size: "large",
        tip: "正在加载领域引擎..."
      })
    ) : oe.length === 0 ? n.createElement(d, {
      description: X ? "无匹配引擎" : "暂无领域引擎"
    }) : n.createElement(
      "div",
      null,
      ...Array.from(B.entries()).map(
        ([Q, Y]) => n.createElement(
          "div",
          { key: Q, style: { marginBottom: 20 } },
          n.createElement(
            E,
            {
              strong: !0,
              style: {
                fontSize: 14,
                display: "block",
                marginBottom: 8
              }
            },
            vo[Q] || Q
          ),
          n.createElement(
            u,
            { gutter: [12, 12], align: "stretch" },
            ...Y.map(
              (se) => n.createElement(
                p,
                {
                  key: se.definition.id,
                  xs: 24,
                  sm: 12,
                  md: 8,
                  lg: 6,
                  style: { display: "flex" }
                },
                n.createElement(ho, {
                  view: se,
                  onClick: () => ne(se)
                })
              )
            )
          )
        )
      )
    ),
    // Detail drawer
    n.createElement(Eo, {
      view: _,
      open: b,
      onClose: () => v(!1),
      onNavigateToMcp: Z,
      onNavigateToTools: W,
      onNavigateToSkills: me,
      onInstallNeqsim: M,
      neqsimInstallState: U
    })
  );
}
const xo = Xl, Vr = /* @__PURE__ */ new Set(["tools", "engines", "skills"]);
function So(e) {
  try {
    const t = new URLSearchParams(window.location.search).get("tab");
    return t && Vr.has(t) ? t : e;
  } catch {
    return e;
  }
}
function ur(e) {
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
function fn({ page: e }) {
  const t = A().React, { useEffect: r, useState: n } = t, { Alert: a, Spin: l } = A().antd, [i, s] = n(null), [o, c] = n("");
  if (r(() => {
    let m = !0;
    const f = A().loadBuiltinPage;
    return s(null), f ? (c(""), f(e).then((u) => {
      m && s(() => u);
    }).catch((u) => {
      m && c(
        u instanceof Error ? u.message : "加载原生管理页面失败"
      );
    }), () => {
      m = !1;
    }) : (c("当前 QwenPaw 版本不支持原生页面嵌入"), () => {
      m = !1;
    });
  }, [e]), o)
    return t.createElement(a, {
      type: "error",
      showIcon: !0,
      message: "原生管理功能加载失败",
      description: o
    });
  if (!i)
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
  return t.createElement(i, { embedded: !0, embeddedLabels: d });
}
function ko({
  activeSubTab: e,
  onSubTabChange: t
}) {
  const r = A().React, { Tabs: n } = A().antd;
  return r.createElement(n, {
    activeKey: e,
    onChange: t,
    items: [
      {
        key: "mcp",
        label: "MCP 接入",
        children: r.createElement(fn, { page: "mcp" })
      },
      {
        key: "builtin",
        label: "平台内置",
        children: r.createElement(fn, { page: "tools" })
      }
    ]
  });
}
function Co({
  onNavigateToMcp: e,
  onNavigateToTools: t,
  onNavigateToSkills: r
} = {}) {
  const n = A().React, { Tabs: a } = A().antd;
  return n.createElement(a, {
    defaultActiveKey: "simulation",
    items: [
      {
        key: "simulation",
        label: "仿真软件",
        children: n.createElement(ro)
      },
      {
        key: "domain",
        label: "领域计算",
        children: n.createElement(
          wo,
          {
            onNavigateToMcp: e,
            onNavigateToTools: t,
            onNavigateToSkills: r
          }
        )
      },
      {
        key: "runtime",
        label: "运行服务",
        children: n.createElement(fn, { page: "acp" })
      }
    ]
  });
}
function Kr({
  initialTab: e = "engines"
} = {}) {
  var S, k;
  const t = A().React, { useEffect: r, useState: n } = t, { Tabs: a, Tag: l } = A().antd, { RocketOutlined: i, ToolOutlined: s, ThunderboltOutlined: o } = A().antdIcons || {}, c = (k = (S = A()).useSelectedAgent) == null ? void 0 : k.call(S), d = (c == null ? void 0 : c.id) || "default", [m, f] = n(
    () => So(e)
  ), [u, p] = n("mcp");
  r(() => {
    try {
      const x = new URLSearchParams(window.location.search).get("tab");
      x && !Vr.has(x) && ur(m);
    } catch {
    }
  }, [m]);
  const y = (x) => {
    f(x), ur(x);
  }, h = (x, E) => t.createElement(
    "span",
    { style: { display: "inline-flex", alignItems: "center", gap: 6 } },
    E ? t.createElement(E, { style: { fontSize: 14 } }) : null,
    x
  );
  return t.createElement(
    "div",
    { style: { padding: 24 } },
    t.createElement(Wt, {
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
      onChange: (x) => y(x),
      items: [
        {
          key: "engines",
          label: h("引擎", i),
          children: t.createElement(
            Co,
            {
              onNavigateToMcp: () => {
                p("mcp"), y("tools");
              },
              onNavigateToTools: (x) => {
                p(x || "mcp"), y("tools");
              },
              onNavigateToSkills: () => y("skills")
            }
          )
        },
        {
          key: "tools",
          label: h("工具", s),
          children: t.createElement(ko, {
            activeSubTab: u,
            onSubTabChange: p
          })
        },
        {
          key: "skills",
          label: h("技能", o),
          children: t.createElement(xo, {
            embedded: !0
          })
        }
      ]
    })
  );
}
const Xr = Kr;
function To() {
  return A().React.createElement(Xr, {
    initialTab: "tools"
  });
}
function _o() {
  return A().React.createElement(Xr, {
    initialTab: "skills"
  });
}
const mr = {
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
function Io(e) {
  if (!e.env) return !1;
  const t = Object.entries(e.env);
  return t.length === 0 ? !1 : t.some(([, r]) => typeof r == "string" && r.length > 0);
}
const Lt = "ugsci.market.githubSources", pr = "https://github.com/anthropics/skills/tree/main/skills", Qr = "https://ugsci-awesome-tools.oss-cn-beijing.aliyuncs.com", zo = `${Qr}/skills`;
function Ao(e) {
  const t = e.replace(/^\/+/, "");
  return Ft(`/plugins/oss-proxy?path=${encodeURIComponent(t)}`);
}
function Ut(e) {
  const t = e.replace(/^\/+/, "");
  return Ve(`/plugins/oss-proxy?path=${encodeURIComponent(t)}`);
}
async function Cn(e) {
  const t = e.replace(/^\/+/, ""), r = await Ut(t);
  if (!r.ok)
    throw new Error(`OSS fetch failed (${r.status}): ${t}`);
  return await r.json();
}
function ct(e) {
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
function $o(e) {
  var a, l;
  const t = {};
  if (e.env && e.env.length > 0)
    for (const i of e.env)
      t[i] = `your-${i.toLowerCase().replace(/_/g, "-")}`;
  let r = "🔌";
  const n = (e.icon || "").toLowerCase();
  return n.includes("folder") ? r = "📁" : n.includes("git") ? r = "🌿" : n.includes("github") ? r = "🐙" : n.includes("database") || n.includes("postgres") || n.includes("sqlite") ? r = "🗄️" : n.includes("search") || n.includes("brave") ? r = "🔍" : n.includes("browser") || n.includes("puppeteer") ? r = "🎭" : n.includes("memory") || n.includes("brain") ? r = "🧠" : n.includes("file") || n.includes("fetch") ? r = "🌐" : n.includes("slack") ? r = "💬" : n.includes("google") ? r = "📁" : n.includes("notion") ? r = "📝" : n.includes("jupyter") ? r = "📊" : n.includes("science") || n.includes("flask") ? r = "🔬" : n.includes("book") || n.includes("arxiv") ? r = "📚" : n.includes("patent") && (r = "📜"), {
    id: e.id,
    name: e.name,
    emoji: r,
    iconUrl: e.icon_url ? Ao(e.icon_url) : void 0,
    category: e.category ? ct(e.category) : "",
    description: e.description,
    transport: e.transport || "stdio",
    command: ((a = e.config) == null ? void 0 : a.command) || "",
    args: ((l = e.config) == null ? void 0 : l.args) || [],
    env: Object.keys(t).length > 0 ? t : void 0
  };
}
const Yr = "ugsci.market.mcpSources", Zr = "ugsci.market.expertSources";
function ea(e, t) {
  try {
    const r = localStorage.getItem(e);
    if (!r) return [];
    const n = JSON.parse(r);
    return Array.isArray(n) ? n.filter(
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
function ta(e, t) {
  try {
    localStorage.setItem(e, JSON.stringify(t));
  } catch {
  }
}
function Po() {
  return ea(Yr, "mcp");
}
function At(e) {
  ta(Yr, e);
}
function Oo() {
  return ea(Zr, "expert");
}
function $t(e) {
  ta(Zr, e);
}
function na(e) {
  try {
    const t = new URL(e.trim()), r = t.hostname.toLowerCase();
    let n;
    if (r === "github.com" || r === "www.github.com")
      n = "github";
    else if (r === "gitee.com" || r === "www.gitee.com")
      n = "gitee";
    else
      return null;
    const a = t.pathname.split("/").filter((c) => c.length > 0);
    if (a.length < 2) return null;
    const l = decodeURIComponent(a[0]), i = decodeURIComponent(a[1]);
    let s = "main", o = "";
    return a.length >= 4 && (a[2] === "tree" || a[2] === "blob") ? (s = decodeURIComponent(a[3]), a.length > 4 && (o = a.slice(4).map(decodeURIComponent).join("/"))) : a.length > 2 && (o = a.slice(2).map(decodeURIComponent).join("/")), o = o.replace(/\/+$/, "").replace(/^\/+/, ""), {
      owner: l,
      repo: i,
      ref: s || "main",
      skillsPath: o,
      label: `${l}/${i}`,
      platform: n
    };
  } catch {
    return null;
  }
}
function ra(e, t, r, n = "github") {
  return n === "oss" ? `oss:${e}/${r || "/"}` : `${n}:${e}/${t}:${r || "/"}`;
}
function Mo(e) {
  try {
    const t = new URL(e.trim()), r = t.hostname.toLowerCase(), n = r.match(
      /^([a-z0-9][a-z0-9-]{1,61}[a-z0-9])\.oss-([a-z0-9-]+)\.aliyuncs\.com$/
    );
    if (!n) return null;
    const a = n[1], l = `${t.protocol}//${r}`, i = decodeURIComponent(t.pathname).replace(/^\/+/, "").replace(/\/+$/, "");
    return i ? {
      endpoint: l,
      prefix: i,
      label: "UGSci",
      platform: "oss"
    } : null;
  } catch {
    return null;
  }
}
function Lo() {
  try {
    const e = localStorage.getItem(Lt);
    if (!e) {
      const n = [], a = na(pr);
      return a && n.push({
        id: ra(
          a.owner,
          a.repo,
          a.skillsPath,
          a.platform
        ),
        url: pr,
        label: a.label,
        owner: a.owner,
        repo: a.repo,
        ref: a.ref,
        skillsPath: a.skillsPath,
        enabled: !1,
        platform: a.platform
      }), localStorage.setItem(Lt, JSON.stringify(n)), n;
    }
    const t = JSON.parse(e);
    if (!Array.isArray(t)) return [];
    const r = t.filter(
      (n) => n && typeof n.id == "string" && (typeof n.owner == "string" || n.platform === "oss") && !(n.platform === "oss" && n.url === zo)
    ).map((n) => ({
      ...n,
      platform: n.platform || "github",
      owner: n.owner || "",
      repo: n.repo || "",
      ref: n.ref || "",
      skillsPath: n.skillsPath || ""
    }));
    return r.length !== t.length && localStorage.setItem(
      Lt,
      JSON.stringify(r)
    ), r;
  } catch {
    return [];
  }
}
function Pt(e) {
  try {
    localStorage.setItem(
      Lt,
      JSON.stringify(e)
    );
  } catch {
  }
}
function Ro(e) {
  const t = e.match(/^---\s*\n([\s\S]*?)\n---/);
  if (!t) return {};
  const r = t[1], n = {}, a = r.split(`
`);
  let l = "";
  for (const i of a) {
    const s = i.match(/^(\w[\w-]*)\s*:\s*(.*)$/);
    if (s) {
      l = s[1];
      let o = s[2].trim();
      (o.startsWith('"') && o.endsWith('"') || o.startsWith("'") && o.endsWith("'")) && (o = o.slice(1, -1)), l === "name" ? n.name = o : l === "description" ? n.description = o : l === "version" ? n.version = o : l === "author" && (n.author = o);
    }
  }
  return n;
}
async function Bo(e) {
  const t = e.platform === "gitee", r = e.skillsPath ? encodeURIComponent(e.skillsPath).replace(/%2F/g, "/") : "", n = t ? `https://gitee.com/api/v5/repos/${e.owner}/${e.repo}/contents/${r}?ref=${encodeURIComponent(e.ref)}` : `https://api.github.com/repos/${e.owner}/${e.repo}/contents/${r}?ref=${encodeURIComponent(e.ref)}`, a = {
    Accept: t ? "application/json" : "application/vnd.github+json"
  };
  t && e.accessToken && (a.Authorization = `token ${e.accessToken}`);
  const l = await fetch(n, {
    headers: a
  });
  if (!l.ok)
    throw new Error(
      `${t ? "Gitee" : "GitHub"} API ${l.status}: ${e.label} (${e.skillsPath || "/"})`
    );
  const i = await l.json();
  if (!Array.isArray(i)) return [];
  const s = i.filter(
    (c) => c.type === "dir" && c.name
  );
  return await Promise.all(
    s.map(async (c) => {
      const d = e.skillsPath ? e.skillsPath + "/" : "", m = t ? `https://gitee.com/${e.owner}/${e.repo}/raw/${e.ref}/${d}${c.name}/SKILL.md` : `https://raw.githubusercontent.com/${e.owner}/${e.repo}/${e.ref}/${d}${c.name}/SKILL.md`, f = t ? `https://gitee.com/${e.owner}/${e.repo}/tree/${e.ref}/${d}${c.name}` : `https://github.com/${e.owner}/${e.repo}/tree/${e.ref}/${d}${c.name}`, u = {
        sourceId: e.id,
        sourceLabel: e.label,
        name: c.name,
        description: "",
        source_url: f,
        html_url: f,
        version: null,
        author: null
      };
      try {
        const p = {};
        t && e.accessToken && (p.Authorization = `token ${e.accessToken}`);
        const y = await fetch(m, {
          headers: p
        });
        if (!y.ok) return u;
        const h = await y.text(), S = Ro(h);
        return {
          ...u,
          name: S.name || c.name,
          description: S.description || "",
          version: S.version || null,
          author: S.author || null
        };
      } catch {
        return u;
      }
    })
  );
}
async function Uo(e) {
  const t = Mo(e.url);
  if (!t)
    throw new Error(`Invalid OSS URL: ${e.url}`);
  const { endpoint: r, prefix: n } = t, a = n.split("/").map(encodeURIComponent).join("/"), l = await Ut(
    `${a}/manifest.json`
  );
  if (!l.ok)
    throw new Error(
      `无法获取技能列表: manifest.json (${l.status})`
    );
  const i = await l.json(), s = [];
  if (i && i.tag_groups && typeof i.tag_groups == "object")
    for (const [d, m] of Object.entries(i.tag_groups))
      Array.isArray(m) && s.push({
        id: d,
        label: ct(d),
        tags: m
      });
  const o = [];
  function c(d, m) {
    for (const f of d) {
      if (f.type === "collection" && Array.isArray(f.children)) {
        c(f.children, f.name);
        continue;
      }
      const u = f.path || f.name || "";
      if (!u) continue;
      const p = u.split("/").map(encodeURIComponent).join("/"), y = `${r}/${a}/${p}`;
      let h = null;
      if (f.metadata) {
        const k = f.metadata.match(/version:\s*"?([\d.]+)"?/);
        k && (h = k[1]);
      }
      const S = m ? `${e.label}/${m}` : e.label;
      o.push({
        sourceId: e.id,
        sourceLabel: e.label,
        sourcePath: S,
        name: f.name || u.split("/").pop() || u,
        description: f.description || "",
        source_url: y,
        html_url: y,
        version: h,
        author: null,
        tag: f.tag || void 0,
        isOfficial: !0
      });
    }
  }
  if (Array.isArray(i) ? c(
    i.map(
      (d) => typeof d == "string" ? { name: d, path: d } : d
    )
  ) : i && Array.isArray(i.skills) && c(i.skills), o.length === 0)
    throw new Error(
      `manifest.json 中未找到技能。请检查 ${e.url}/manifest.json`
    );
  return { skills: o, categories: s };
}
async function jo() {
  const e = await Cn("mcp/manifest.json"), t = [], r = {};
  if (e.tag_groups && typeof e.tag_groups == "object")
    for (const [a, l] of Object.entries(e.tag_groups))
      Array.isArray(l) && (r[a] = l, t.push({
        id: a,
        label: ct(a),
        tags: l
      }));
  return { servers: (e.servers || []).map((a) => {
    let l = "";
    const i = a.tags || [];
    for (const [s, o] of Object.entries(r))
      if (o.some((c) => i.includes(c))) {
        l = s;
        break;
      }
    return {
      id: a.id || a.name,
      name: a.name || a.id,
      description: a.description || "",
      tags: i,
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
async function No() {
  const e = await Cn("skills/manifest.json"), t = [], r = /* @__PURE__ */ new Set();
  function n(a, l) {
    for (const i of a) {
      if ((i == null ? void 0 : i.type) === "collection" && Array.isArray(i.children)) {
        n(i.children, i.name || l);
        continue;
      }
      const s = String((i == null ? void 0 : i.path) || (i == null ? void 0 : i.name) || "").trim();
      if (!s) continue;
      const o = s.split("/").map(encodeURIComponent).join("/"), c = `${Qr}/skills/${o}`, d = typeof i.tag == "string" && i.tag.trim() ? i.tag.trim() : void 0;
      d && r.add(d);
      let m = null;
      if (typeof i.metadata == "string") {
        const f = i.metadata.match(/version:\s*"?([\d.]+)"?/);
        f && (m = f[1]);
      }
      t.push({
        sourceId: "oss:ugsci-official",
        sourceLabel: "UGSci",
        sourcePath: l ? `UGSci/${l}` : "UGSci",
        name: i.name || s.split("/").pop() || s,
        description: i.description || "",
        source_url: c,
        html_url: c,
        version: m,
        author: null,
        tag: d,
        isOfficial: !0
      });
    }
  }
  if (Array.isArray(e) ? n(
    e.map(
      (a) => typeof a == "string" ? { name: a, path: a } : a
    )
  ) : e && Array.isArray(e.skills) && n(e.skills), t.length === 0)
    throw new Error("OSS 技能清单中没有可用技能");
  return {
    skills: t,
    categories: Array.from(r).map((a) => ({
      id: a,
      label: a
    }))
  };
}
async function Do() {
  const e = await Cn("agents/manifest.json"), t = [], r = {};
  if (e.tag_groups && typeof e.tag_groups == "object")
    for (const [a, l] of Object.entries(e.tag_groups))
      Array.isArray(l) && (r[a] = l, t.push({
        id: a,
        label: ct(a),
        tags: l
      }));
  return { agents: (e.agents || []).map((a) => {
    let l = "";
    const i = a.tags || [];
    for (const [s, o] of Object.entries(r))
      if (o.some((c) => i.includes(c))) {
        l = s;
        break;
      }
    return {
      id: a.id || a.name,
      name: a.name || a.id,
      description: a.description || "",
      path: a.path || "",
      tags: i,
      config: a.config,
      instructions: a.instructions,
      skills_manifest: a.skills_manifest,
      drivers: a.drivers,
      category: l
    };
  }), categories: t };
}
async function Go(e) {
  const t = e.filter((i) => i.enabled), r = await Promise.all(
    t.map(async (i) => {
      try {
        if (i.platform === "oss") {
          const { skills: s, categories: o } = await Uo(i);
          return { skills: s, categories: o, error: null, label: i.label };
        } else
          return { skills: await Bo(i), categories: [], error: null, label: i.label };
      } catch (s) {
        return {
          skills: [],
          categories: [],
          error: s.message || String(s),
          label: i.label
        };
      }
    })
  ), n = [], a = [], l = [];
  for (const i of r)
    n.push(...i.skills), a.push(...i.categories), i.error && l.push({ label: i.label, message: i.error });
  return { skills: n, errors: l, categories: a };
}
function Fo({
  open: e,
  onClose: t,
  sources: r,
  onChange: n
}) {
  const a = A().React, { useState: l } = a, {
    Modal: i,
    Input: s,
    Button: o,
    List: c,
    Tag: d,
    Switch: m,
    Typography: f,
    Tooltip: u,
    message: p
  } = A().antd, {
    PlusOutlined: y,
    DeleteOutlined: h,
    LinkOutlined: S,
    GithubOutlined: k
  } = A().antdIcons || {}, { Text: x } = f, [E, L] = l(""), [D, F] = l(""), G = () => {
    const H = E.trim();
    if (!H) return;
    const b = na(H);
    if (!b) {
      p.error("无效的仓库 URL，请输入类似 https://github.com/owner/repo/tree/main/skills 或 https://gitee.com/owner/repo/tree/master/skills 的链接");
      return;
    }
    const v = ra(b.owner, b.repo, b.skillsPath, b.platform);
    if (r.some((U) => U.id === v)) {
      p.warning("该源已存在");
      return;
    }
    const _ = {
      id: v,
      url: H,
      label: b.label,
      owner: b.owner,
      repo: b.repo,
      ref: b.ref,
      skillsPath: b.skillsPath,
      enabled: !0,
      platform: b.platform,
      accessToken: D.trim() || void 0
    }, I = [...r, _];
    Pt(I), n(I), L(""), F(""), p.success(`已添加源: ${b.label}`);
  }, j = (H, b) => {
    const v = r.map(
      (_) => _.id === H ? { ..._, enabled: b } : _
    );
    Pt(v), n(v);
  }, K = (H, b) => {
    const v = r.map(
      (_) => _.id === H ? { ..._, accessToken: b.trim() || void 0 } : _
    );
    Pt(v), n(v);
  }, X = (H) => {
    const b = r.filter((v) => v.id !== H);
    Pt(b), n(b), p.success("已移除源");
  };
  return a.createElement(
    i,
    {
      open: e,
      onCancel: t,
      title: a.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 8 } },
        k ? a.createElement(k, { style: { fontSize: 18 } }) : null,
        a.createElement("span", null, "配置技能源")
      ),
      footer: a.createElement(
        o,
        { onClick: t },
        "关闭"
      ),
      width: 640
    },
    a.createElement(
      "div",
      { style: { marginBottom: 16 } },
      a.createElement(
        x,
        { type: "secondary", style: { fontSize: 12, display: "block", marginBottom: 8 } },
        "添加 GitHub 或 Gitee 仓库作为技能源，系统将从该仓库的指定目录获取技能列表。支持格式："
      ),
      a.createElement(
        "div",
        { style: { display: "flex", gap: 8, alignItems: "center" } },
        a.createElement(s, {
          placeholder: "https://github.com/owner/repo/tree/main/skills 或 https://gitee.com/owner/repo/tree/master/skills",
          value: E,
          onChange: (H) => L(H.target.value),
          onPressEnter: G,
          prefix: S ? a.createElement(S) : void 0,
          style: { flex: 1 }
        }),
        a.createElement(
          o,
          {
            type: "primary",
            icon: y ? a.createElement(y) : void 0,
            onClick: G
          },
          "添加"
        )
      ),
      // Gitee token input (shown when URL looks like a Gitee link)
      E.trim() && E.trim().toLowerCase().includes("gitee.com") ? a.createElement(
        "div",
        { style: { marginTop: 8, display: "flex", gap: 8, alignItems: "center" } },
        a.createElement(
          x,
          { type: "secondary", style: { fontSize: 12, whiteSpace: "nowrap" } },
          "Gitee Token:"
        ),
        a.createElement(s.Password, {
          placeholder: "私有仓库请填写 Gitee 私人令牌（可选）",
          value: D,
          onChange: (H) => F(H.target.value),
          style: { flex: 1 }
        })
      ) : null
    ),
    a.createElement(
      "div",
      { style: { marginBottom: 8, display: "flex", alignItems: "center", justifyContent: "space-between" } },
      a.createElement(x, { strong: !0 }, `已配置源 (${r.length})`)
    ),
    a.createElement(c, {
      size: "small",
      bordered: !0,
      dataSource: r,
      renderItem: (H) => a.createElement(
        c.Item,
        {
          actions: [
            a.createElement(
              u,
              { title: H.enabled ? "点击禁用" : "点击启用" },
              a.createElement(m, {
                size: "small",
                checked: H.enabled,
                onChange: (b) => j(H.id, b)
              })
            ),
            a.createElement(
              u,
              { title: "移除此源" },
              a.createElement(
                o,
                {
                  size: "small",
                  type: "text",
                  danger: !0,
                  icon: h ? a.createElement(h) : void 0,
                  onClick: () => X(H.id)
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
              { color: H.platform === "gitee" ? "orange" : H.platform === "oss" ? "green" : "blue", style: { fontSize: 11 } },
              H.platform === "gitee" ? "Gitee" : H.platform === "oss" ? "OSS" : "GitHub"
            ),
            a.createElement(
              d,
              { style: { fontSize: 11 } },
              H.label
            ),
            H.skillsPath ? a.createElement(
              x,
              { type: "secondary", style: { fontSize: 11 } },
              `/${H.skillsPath}`
            ) : null,
            H.platform !== "oss" ? a.createElement(
              x,
              { type: "secondary", style: { fontSize: 11 } },
              `@${H.ref}`
            ) : null
          ),
          a.createElement(
            x,
            {
              type: "secondary",
              style: { fontSize: 11, wordBreak: "break-all" }
            },
            H.url
          ),
          // Gitee token input for existing Gitee sources
          H.platform === "gitee" ? a.createElement(
            "div",
            { style: { marginTop: 6, display: "flex", gap: 6, alignItems: "center" } },
            a.createElement(
              x,
              { type: "secondary", style: { fontSize: 11, whiteSpace: "nowrap" } },
              "Token:"
            ),
            a.createElement(s.Password, {
              size: "small",
              placeholder: "Gitee 私人令牌（可选，用于私有仓库）",
              value: H.accessToken || "",
              onChange: (b) => K(H.id, b.target.value),
              style: { flex: 1 }
            })
          ) : null
        )
      )
    })
  );
}
function fr({
  open: e,
  onClose: t,
  sources: r,
  onChange: n,
  type: a
}) {
  const l = A().React, { useState: i } = l, {
    Modal: s,
    Input: o,
    Button: c,
    List: d,
    Tag: m,
    Switch: f,
    Typography: u,
    Tooltip: p,
    message: y
  } = A().antd, {
    PlusOutlined: h,
    DeleteOutlined: S,
    LinkOutlined: k,
    ApiOutlined: x,
    UserOutlined: E,
    ImportOutlined: L,
    ExportOutlined: D,
    CopyOutlined: F
  } = A().antdIcons || {}, { Text: G } = u, [j, K] = i(""), [X, H] = i(""), [b, v] = i(""), [_, I] = i(!1), U = a === "mcp" ? "MCP" : "专家模板", $ = a === "mcp" ? x ? l.createElement(x, { style: { fontSize: 18 } }) : null : E ? l.createElement(E, { style: { fontSize: 18 } }) : null, O = () => {
    const B = j.trim(), R = X.trim();
    if (!B) return;
    const ne = R || B.slice(0, 40), Z = `${a}:${B}`;
    if (r.some((M) => M.id === Z)) {
      y.warning("该源已存在");
      return;
    }
    const W = {
      id: Z,
      label: ne,
      url: B,
      enabled: !0,
      type: a
    }, me = [...r, W];
    a === "mcp" ? At(me) : $t(me), n(me), K(""), H(""), y.success(`已添加${U}源: ${ne}`);
  }, z = (B, R) => {
    const ne = r.map(
      (Z) => Z.id === B ? { ...Z, enabled: R } : Z
    );
    a === "mcp" ? At(ne) : $t(ne), n(ne);
  }, w = (B) => {
    const R = r.filter((ne) => ne.id !== B);
    a === "mcp" ? At(R) : $t(R), n(R), y.success("已移除源");
  }, le = () => {
    const B = JSON.stringify(
      { type: a, sources: r },
      null,
      2
    );
    try {
      navigator.clipboard.writeText(B), y.success(`${U}源已复制到剪贴板（${r.length} 个源）`);
    } catch {
      const R = document.createElement("textarea");
      R.value = B, document.body.appendChild(R), R.select(), document.execCommand("copy"), document.body.removeChild(R), y.success(`${U}源已复制到剪贴板（${r.length} 个源）`);
    }
  }, oe = () => {
    const B = b.trim();
    if (!B) {
      y.warning("请粘贴 JSON 内容");
      return;
    }
    try {
      const R = JSON.parse(B);
      let ne = [];
      if (Array.isArray(R))
        ne = R;
      else if (R && Array.isArray(R.sources))
        ne = R.sources;
      else if (R && typeof R == "object")
        ne = [R];
      else
        throw new Error("Invalid format");
      const Z = ne.filter(
        (ie) => ie && typeof ie.url == "string" && typeof ie.label == "string"
      );
      if (Z.length === 0) {
        y.error("未找到有效的源数据");
        return;
      }
      const W = new Set(r.map((ie) => ie.id)), me = [];
      for (const ie of Z) {
        const ue = ie.id || `${a}:${ie.url}`;
        W.has(ue) || me.push({
          id: ue,
          label: ie.label,
          url: ie.url,
          enabled: ie.enabled !== !1,
          type: a
        });
      }
      if (me.length === 0) {
        y.info("所有源均已存在，无新增");
        return;
      }
      const M = [...r, ...me];
      a === "mcp" ? At(M) : $t(M), n(M), v(""), I(!1), y.success(`成功导入 ${me.length} 个${U}源`);
    } catch (R) {
      y.error(`JSON 解析失败: ${R.message || "格式错误"}`);
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
        $,
        l.createElement("span", null, `配置${U}源`)
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
              icon: D ? l.createElement(D) : void 0,
              onClick: le,
              disabled: r.length === 0,
              size: "small"
            },
            "导出到剪贴板"
          ),
          l.createElement(
            c,
            {
              icon: L ? l.createElement(L) : void 0,
              onClick: () => I(!_),
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
      G,
      { type: "secondary", style: { fontSize: 12, display: "block", marginBottom: 12 } },
      `配置${U}源地址，支持从远程仓库或团队共享的 JSON 导入${U}配置。`
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
        G,
        { strong: !0, style: { fontSize: 12, display: "block", marginBottom: 8 } },
        `粘贴${U}源 JSON（支持从导出的剪贴板内容粘贴）`
      ),
      l.createElement(o.TextArea, {
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
        value: b,
        onChange: (B) => v(B.target.value),
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
            onClick: oe
          },
          "导入"
        ),
        l.createElement(
          c,
          {
            size: "small",
            onClick: () => v("")
          },
          "清空"
        )
      )
    ) : null,
    // Add new source
    l.createElement(
      "div",
      { style: { marginBottom: 16, display: "flex", gap: 8, alignItems: "center" } },
      l.createElement(o, {
        placeholder: "源名称（可选，如：团队MCP仓库）",
        value: X,
        onChange: (B) => H(B.target.value),
        style: { width: 200 }
      }),
      l.createElement(o, {
        placeholder: a === "mcp" ? "https://raw.githubusercontent.com/team/mcp-registry/main/mcp.json" : "https://raw.githubusercontent.com/team/expert-registry/main/experts.json",
        value: j,
        onChange: (B) => K(B.target.value),
        onPressEnter: O,
        prefix: k ? l.createElement(k) : void 0,
        style: { flex: 1 }
      }),
      l.createElement(
        c,
        {
          type: "primary",
          icon: h ? l.createElement(h) : void 0,
          onClick: O
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
        G,
        { strong: !0 },
        `已配置源 (${r.length})`
      )
    ),
    l.createElement(d, {
      size: "small",
      bordered: !0,
      dataSource: r,
      renderItem: (B) => l.createElement(
        d.Item,
        {
          actions: [
            l.createElement(
              p,
              { title: B.enabled ? "点击禁用" : "点击启用" },
              l.createElement(f, {
                size: "small",
                checked: B.enabled,
                onChange: (R) => z(B.id, R)
              })
            ),
            l.createElement(
              p,
              { title: "移除此源" },
              l.createElement(
                c,
                {
                  size: "small",
                  type: "text",
                  danger: !0,
                  icon: S ? l.createElement(S) : void 0,
                  onClick: () => w(B.id)
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
              B.label
            ),
            B.enabled ? null : l.createElement(
              m,
              { style: { fontSize: 10 } },
              "已禁用"
            )
          ),
          l.createElement(
            G,
            {
              type: "secondary",
              style: { fontSize: 11, wordBreak: "break-all" }
            },
            B.url
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
async function Ho() {
  return ce("/market/providers");
}
async function Wo(e) {
  return ce(
    `/market/categories?lang=${encodeURIComponent(e)}`
  );
}
async function Jo(e, t, r, n, a) {
  return ce("/market/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: e,
      provider_pages: t,
      limit: r,
      lang: n,
      category: a || void 0
    })
  });
}
function gr(e) {
  if (!e) return "";
  const t = e.message || String(e);
  try {
    const r = JSON.parse(t);
    if (r.detail) {
      if (typeof r.detail == "string") return r.detail;
      if (r.detail.message) return r.detail.message;
    }
  } catch {
  }
  return t;
}
async function yr(e, t) {
  const r = { bundle_url: e };
  return t && (r.access_token = t), ce("/skills/pool/import", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(r)
  });
}
function qo() {
  const e = A().React, { useState: t, useEffect: r, useCallback: n, useMemo: a, useRef: l } = e, {
    Spin: i,
    Empty: s,
    Input: o,
    Button: c,
    message: d,
    Row: m,
    Col: f,
    Card: u,
    Tag: p,
    Tooltip: y,
    Typography: h,
    Select: S,
    Drawer: k,
    Descriptions: x,
    Tabs: E,
    Badge: L,
    Progress: D,
    Modal: F,
    Alert: G
  } = A().antd, {
    ReloadOutlined: j,
    SearchOutlined: K,
    DownloadOutlined: X,
    AppstoreOutlined: H,
    ShopOutlined: b,
    CheckCircleOutlined: v,
    LoadingOutlined: _,
    UserOutlined: I,
    UserAddOutlined: U,
    SettingOutlined: $,
    GithubOutlined: O,
    ApiOutlined: z
  } = A().antdIcons || {}, { Text: w, Paragraph: le, Title: oe } = h, [B, R] = t("skills"), [ne, Z] = t([]), [W, me] = t([]), [M, ie] = t([]), [ue, Q] = t(""), [Y, se] = t(""), [he, we] = t(!1), [Ae, xe] = t(!1), [ee, be] = t(
    {}
  ), [Ee, te] = t(null), [de, fe] = t({}), [V, C] = t([]), [ge, q] = t(""), [T, re] = t(""), [pe, Ie] = t(""), [Le, Ne] = t({}), [Re, Ge] = t(""), [et, De] = t(/* @__PURE__ */ new Set()), [Te, Me] = t(null), [ae, ze] = t({}), [$e, Oe] = t([]), [We, Je] = t([]), [_e, St] = t([]), [Xt, ut] = t(""), [Ke, kt] = t(!1), [ma, _n] = t(!1), [pa, In] = t([]), [fa, zn] = t(!1), [ga, An] = t([]), [ya, $n] = t(!1), [Pn, On] = t([]), [Mn, Ln] = t([]), [Rn, Bn] = t(!1), [tt, Un] = t(""), [jn, Nn] = t([]), [Dn, Gn] = t([]), [Fn, Hn] = t(!1), [nt, Wn] = t(""), [Qt, Jn] = t(!1), [Ue, Ct] = t(null), [mt, ha] = t([]), pt = l(null);
  r(() => {
    Promise.all([
      Ho().catch(() => []),
      Wo("zh").catch(() => []),
      Jt().catch(() => [])
    ]).then(([g, N, J]) => {
      Z(g), me(N), C(J), J.length > 0 && (q(J[0].id), Ge(J[0].id));
    });
  }, []);
  const Tt = n(async (g) => {
    const N = g ?? Lo();
    if (Oe(g || N), N.filter((ye) => ye.enabled).length === 0) {
      Je([]);
      return;
    }
    kt(!0);
    try {
      const { skills: ye, errors: Se, categories: Pe } = await Go(N);
      if (Je(ye), ha(Pe), Se.length > 0) {
        for (const ke of Se)
          console.warn(`[ugsci] GitHub source '${ke.label}' error: ${ke.message}`);
        d.warning(
          `部分源加载失败: ${Se.map((ke) => ke.label).join(", ")}`
        );
      }
    } catch (ye) {
      d.error(ye.message || "加载技能源失败"), Je([]);
    } finally {
      kt(!1);
    }
  }, []), Yt = n(async () => {
    var ye, Se, Pe;
    Bn(!0), Hn(!0), kt(!0);
    const [g, N, J] = await Promise.allSettled([
      jo(),
      Do(),
      No()
    ]);
    if (g.status === "fulfilled" ? (On(g.value.servers), Ln(g.value.categories)) : (console.warn(`[ugsci] MCP manifest error: ${((ye = g.reason) == null ? void 0 : ye.message) || g.reason}`), On([]), Ln([])), Bn(!1), N.status === "fulfilled" ? (Nn(N.value.agents), Gn(N.value.categories)) : (console.warn(`[ugsci] Agents manifest error: ${((Se = N.reason) == null ? void 0 : Se.message) || N.reason}`), Nn([]), Gn([])), Hn(!1), J.status === "fulfilled")
      St(J.value.skills), ut("");
    else {
      const ke = ((Pe = J.reason) == null ? void 0 : Pe.message) || String(J.reason);
      console.warn(`[ugsci] Skills manifest error: ${ke}`), St([]), ut(ke);
    }
    kt(!1);
  }, []);
  r(() => {
    Tt(), Yt(), In(Po()), An(Oo());
  }, [Tt, Yt]);
  const _t = n(
    async (g, N, J) => {
      we(!0);
      try {
        const ye = await Jo(
          g,
          J,
          20,
          "zh",
          N || void 0
        );
        J === void 0 || Object.keys(J).length === 0 ? ie(ye.results) : ie((ke) => [...ke, ...ye.results]);
        const Se = Object.values(ye.by_provider || {}).some(
          (ke) => ke.has_more
        );
        xe(Se);
        const Pe = {};
        for (const [ke, Xe] of Object.entries(ye.by_provider || {}))
          Pe[ke] = (J[ke] || 1) + 1;
        if (be(Pe), ye.errors.length > 0)
          for (const ke of ye.errors)
            console.warn(
              `[ugsci] Market provider '${ke.provider}' error: ${ke.message}`
            );
      } catch (ye) {
        d.error(ye.message || "搜索市场失败"), ie([]);
      } finally {
        we(!1);
      }
    },
    []
  );
  r(() => (pt.current && clearTimeout(pt.current), pt.current = setTimeout(() => {
    _t(ue, Y, {});
  }, 400), () => {
    pt.current && clearTimeout(pt.current);
  }), [ue, Y, _t]);
  const Ea = () => {
    _t(ue, Y, ee);
  }, qn = async (g) => {
    const N = `${g.source}:${g.slug}`;
    try {
      fe((ye) => ({ ...ye, [N]: "installing" }));
      const J = await yr(g.source_url);
      J.installed && d.success(
        `技能「${J.name || g.name}」已安装到技能池，可在技能中心查看`
      ), fe((ye) => {
        const Se = { ...ye };
        return delete Se[N], Se;
      });
    } catch (J) {
      d.error(gr(J) || "安装技能失败"), fe((ye) => {
        const Se = { ...ye };
        return delete Se[N], Se;
      });
    }
  }, va = (g) => {
    window.history.pushState({}, "", g), window.dispatchEvent(new PopStateEvent("popstate"));
  }, ba = async (g) => {
    const N = `github:${g.sourceId}:${g.name}`, J = $e.find((Se) => Se.id === g.sourceId), ye = (J == null ? void 0 : J.accessToken) || void 0;
    try {
      fe((Pe) => ({ ...Pe, [N]: "installing" }));
      const Se = await yr(g.source_url, ye);
      Se.installed && d.success(
        `技能「${Se.name || g.name}」已安装到技能池，可在技能中心查看`
      ), fe((Pe) => {
        const ke = { ...Pe };
        return delete ke[N], ke;
      });
    } catch (Se) {
      d.error(gr(Se) || "安装技能失败"), fe((Pe) => {
        const ke = { ...Pe };
        return delete ke[N], ke;
      });
    }
  }, Ze = a(() => {
    const g = [], N = /* @__PURE__ */ new Set();
    for (const J of [..._e, ...We]) {
      const ye = J.source_url || `${J.sourceLabel}:${J.name}`;
      N.has(ye) || (N.add(ye), g.push(J));
    }
    return g;
  }, [_e, We]), Vn = a(() => {
    const g = [], N = /* @__PURE__ */ new Set();
    if (mt.length > 0)
      for (const J of mt)
        N.has(J.id) || (N.add(J.id), g.push(J));
    for (const J of Ze)
      J.tag && !N.has(J.tag) && (N.add(J.tag), g.push({ id: J.tag, label: J.tag }));
    for (const J of Ze)
      !J.isOfficial && J.sourceLabel && !N.has(J.sourceLabel) && (N.add(J.sourceLabel), g.push({ id: J.sourceLabel, label: J.sourceLabel }));
    return g;
  }, [Ze, mt]), Zt = a(() => {
    let g = Ze;
    if (Y) {
      const N = mt.find((J) => J.id === Y);
      N && N.tags ? g = g.filter(
        (J) => J.tag && N.tags.includes(J.tag) || J.sourceLabel === Y
      ) : g = g.filter(
        (J) => J.tag === Y || J.sourceLabel === Y
      );
    }
    if (ue.trim()) {
      const N = ue.toLowerCase();
      g = g.filter(
        (J) => {
          var ye;
          return J.name.toLowerCase().includes(N) || ((ye = J.description) == null ? void 0 : ye.toLowerCase().includes(N));
        }
      );
    }
    return g;
  }, [Ze, ue, Y, mt]), Kn = ne.filter((g) => g.available), rt = a(() => Y ? M.filter((g) => {
    const N = Kn.find((J) => J.key === g.source);
    return (N == null ? void 0 : N.label) === Y;
  }) : M, [M, Y, Kn]), wa = e.createElement(
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
      e.createElement(o, {
        placeholder: "搜索技能市场...",
        prefix: K ? e.createElement(K) : void 0,
        value: ue,
        onChange: (g) => Q(g.target.value),
        allowClear: !0,
        style: { flex: 1, minWidth: 200, maxWidth: 400 }
      }),
      // Pool install info
      e.createElement(
        w,
        { type: "secondary", style: { fontSize: 12 } },
        "安装后进入技能池"
      ),
      // Configure skill source button
      e.createElement(
        c,
        {
          icon: O ? e.createElement(O) : void 0,
          onClick: () => _n(!0),
          size: "small"
        },
        "配置技能源"
      )
    ),
    // Dynamic category filter tags (from OSS manifest tags + imported sources)
    Xt && Ze.length === 0 ? e.createElement(G, {
      type: "warning",
      showIcon: !0,
      message: "UGSci 官方 OSS 技能库加载失败",
      description: "请检查网络或后端 OSS 代理服务，然后点击右上角“刷新”重试。",
      style: { marginBottom: 12 }
    }) : null,
    Vn.length > 0 ? e.createElement(
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
        w,
        { type: "secondary", style: { fontSize: 12, marginRight: 4 } },
        "分类:"
      ),
      e.createElement(
        p,
        {
          style: {
            fontSize: 11,
            cursor: "pointer",
            borderRadius: 12
          },
          color: Y === "" ? "blue" : void 0,
          onClick: () => se("")
        },
        "全部"
      ),
      ...Vn.map((g) => {
        const N = We.some(
          (J) => !J.isOfficial && J.sourceLabel === g.id
        );
        return e.createElement(
          p,
          {
            key: g.id,
            style: {
              fontSize: 11,
              cursor: "pointer",
              borderRadius: 12
            },
            color: Y === g.id ? N ? "blue" : "geekblue" : void 0,
            icon: N && O ? e.createElement(O) : void 0,
            onClick: () => se(
              Y === g.id ? "" : g.id
            )
          },
          g.label
        );
      })
    ) : null,
    // GitHub skills section
    Ke && Ze.length === 0 ? e.createElement(
      "div",
      { style: { textAlign: "center", padding: 40, marginBottom: 16 } },
      e.createElement(i, { size: "large" }, e.createElement("div", { style: { minHeight: 60, display: "flex", alignItems: "center", justifyContent: "center" } }, "正在加载技能..."))
    ) : Zt.length > 0 ? e.createElement(
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
        O ? e.createElement(O, {
          style: { fontSize: 14, color: "#1677ff" }
        }) : null,
        e.createElement(
          w,
          { strong: !0, style: { fontSize: 13 } },
          `技能市场 (${Zt.length})`
        )
      ),
      e.createElement(
        m,
        { gutter: [12, 12] },
        ...Zt.map((g) => {
          const N = `github:${g.sourceId}:${g.name}`, J = de[N];
          return e.createElement(
            f,
            { key: N, xs: 24, sm: 12, md: 8, lg: 6 },
            e.createElement(
              u,
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
                O ? e.createElement(O, {
                  style: { fontSize: 18, color: "var(--ant-color-text-secondary, #57606a)" }
                }) : e.createElement(
                  "span",
                  { style: { fontSize: 18 } },
                  "📦"
                ),
                e.createElement(
                  y,
                  { title: g.name },
                  e.createElement(
                    w,
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
                    g.name
                  )
                )
              ),
              e.createElement(
                le,
                {
                  type: "secondary",
                  style: { fontSize: 11, margin: 0, lineHeight: 1.4 },
                  ellipsis: { rows: 2 }
                },
                g.description || "暂无描述"
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
                  g.sourcePath || g.sourceLabel ? e.createElement(
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
                    z ? e.createElement(z, { style: { fontSize: 10 } }) : null,
                    g.sourcePath || g.sourceLabel
                  ) : null,
                  // Show tag as category badge
                  g.tag ? e.createElement(
                    p,
                    { color: "geekblue", style: { fontSize: 10 } },
                    g.tag
                  ) : null,
                  g.version ? e.createElement(
                    p,
                    { style: { fontSize: 10 } },
                    `v${g.version}`
                  ) : null
                ),
                J ? e.createElement(
                  c,
                  {
                    size: "small",
                    disabled: !0,
                    icon: _ ? e.createElement(_) : void 0
                  },
                  "安装中"
                ) : e.createElement(
                  c,
                  {
                    type: "primary",
                    size: "small",
                    icon: X ? e.createElement(X) : void 0,
                    onClick: () => ba(g)
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
    rt.length > 0 || he ? e.createElement(
      "div",
      {
        style: {
          marginBottom: 10,
          display: "flex",
          alignItems: "center",
          gap: 6
        }
      },
      b ? e.createElement(b, {
        style: { fontSize: 14, color: "#1677ff" }
      }) : null,
      e.createElement(
        w,
        { strong: !0, style: { fontSize: 13 } },
        `技能市场${rt.length > 0 ? ` (${rt.length})` : ""}`
      )
    ) : null,
    // Results grid
    he && rt.length === 0 ? e.createElement(
      "div",
      { style: { textAlign: "center", padding: 60 } },
      e.createElement(i, { size: "large" })
    ) : rt.length === 0 ? e.createElement(s, {
      description: ue ? `未找到匹配「${ue}」的技能` : "输入关键词搜索技能市场",
      image: s.PRESENTED_IMAGE_SIMPLE
    }) : e.createElement(
      m,
      { gutter: [12, 12] },
      ...rt.map((g) => {
        const N = `${g.source}:${g.slug}`, J = de[N];
        return e.createElement(
          f,
          { key: N, xs: 24, sm: 12, md: 8, lg: 6 },
          e.createElement(
            u,
            {
              hoverable: !0,
              size: "small",
              style: { height: "100%", cursor: "pointer" },
              onClick: () => te(g)
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
              g.icon_url ? e.createElement("img", {
                src: g.icon_url,
                alt: g.name,
                style: { width: 24, height: 24, borderRadius: 4 }
              }) : e.createElement(
                "span",
                { style: { fontSize: 18 } },
                "📦"
              ),
              e.createElement(
                y,
                { title: g.name },
                e.createElement(
                  w,
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
                  g.name
                )
              )
            ),
            e.createElement(
              le,
              {
                type: "secondary",
                style: { fontSize: 11, margin: 0, lineHeight: 1.4 },
                ellipsis: { rows: 2 }
              },
              g.description || "暂无描述"
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
                  p,
                  { color: "geekblue", style: { fontSize: 10 } },
                  g.source
                ),
                g.version ? e.createElement(
                  p,
                  { style: { fontSize: 10 } },
                  `v${g.version}`
                ) : null
              ),
              J ? e.createElement(
                c,
                {
                  size: "small",
                  disabled: !0,
                  icon: _ ? e.createElement(_) : void 0
                },
                "安装中"
              ) : e.createElement(
                c,
                {
                  type: "primary",
                  size: "small",
                  icon: X ? e.createElement(X) : void 0,
                  onClick: (ye) => {
                    ye.stopPropagation(), qn(g);
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
    Ae && !he ? e.createElement(
      "div",
      { style: { textAlign: "center", marginTop: 16 } },
      e.createElement(
        c,
        { onClick: Ea, loading: he },
        "加载更多"
      )
    ) : null,
    // Detail Drawer
    Ee ? e.createElement(
      k,
      {
        title: e.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 8 } },
          Ee.icon_url ? e.createElement("img", {
            src: Ee.icon_url,
            alt: Ee.name,
            style: { width: 28, height: 28, borderRadius: 4 }
          }) : e.createElement(
            "span",
            { style: { fontSize: 20 } },
            "📦"
          ),
          e.createElement("span", null, Ee.name)
        ),
        open: !0,
        onClose: () => te(null),
        width: 480,
        extra: e.createElement(
          c,
          {
            type: "primary",
            icon: X ? e.createElement(X) : void 0,
            onClick: () => {
              qn(Ee);
            }
          },
          "安装到技能池"
        )
      },
      e.createElement(
        x,
        { column: 1, bordered: !0, size: "small" },
        e.createElement(
          x.Item,
          { label: "来源" },
          Ee.source
        ),
        e.createElement(
          x.Item,
          { label: "描述" },
          Ee.description || "-"
        ),
        Ee.version ? e.createElement(
          x.Item,
          { label: "版本" },
          Ee.version
        ) : null,
        Ee.author ? e.createElement(
          x.Item,
          { label: "作者" },
          Ee.author
        ) : null,
        e.createElement(
          x.Item,
          { label: "来源链接" },
          e.createElement(
            "a",
            { href: Ee.source_url, target: "_blank" },
            Ee.source_url
          )
        )
      ),
      Ee.stats ? e.createElement(
        "div",
        { style: { marginTop: 16 } },
        e.createElement(
          w,
          {
            strong: !0,
            style: { display: "block", marginBottom: 8 }
          },
          "统计"
        ),
        e.createElement(
          "div",
          { style: { display: "flex", gap: 12, flexWrap: "wrap" } },
          ...Object.entries(Ee.stats).map(
            ([g, N]) => e.createElement(
              "div",
              { key: g, style: { textAlign: "center" } },
              e.createElement(
                "div",
                {
                  style: {
                    fontSize: 18,
                    fontWeight: 600,
                    color: "#1677ff"
                  }
                },
                String(N)
              ),
              e.createElement(
                w,
                { type: "secondary", style: { fontSize: 11 } },
                g
              )
            )
          )
        )
      ) : null
    ) : null
  ), en = a(() => {
    let g = jn;
    if (nt && (g = g.filter((N) => N.category === nt)), T.trim()) {
      const N = T.toLowerCase();
      g = g.filter(
        (J) => J.name.toLowerCase().includes(N) || J.description.toLowerCase().includes(N) || J.tags.some((ye) => ye.toLowerCase().includes(N))
      );
    }
    return g;
  }, [jn, T, nt]), xa = async (g) => {
    if (!Qt) {
      Jn(!0);
      try {
        let N = g.description;
        if (g.instructions)
          try {
            const Se = g.instructions.replace(/^\/+/, ""), Pe = await Ut(Se);
            Pe.ok && (N = await Pe.text());
          } catch {
          }
        let J = [];
        if (g.skills_manifest)
          try {
            const Se = g.skills_manifest.replace(/^\/+/, ""), Pe = await Ut(Se);
            if (Pe.ok) {
              const ke = await Pe.json();
              Array.isArray(ke) ? J = ke.map((Xe) => typeof Xe == "string" ? Xe : Xe.name).filter(Boolean) : ke.skills && (J = ke.skills.map((Xe) => typeof Xe == "string" ? Xe : Xe.name).filter(Boolean));
            }
          } catch {
          }
        const ye = await ce("/agents", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: g.name,
            description: g.description,
            skill_names: J
          })
        });
        await Bt(ye.id, "AGENTS.md", N), d.success(`专家「${g.name}」创建成功，已跳转至专家`), va("/ugsci-experts");
      } catch (N) {
        d.error(N.message || "创建专家失败");
      } finally {
        Jn(!1);
      }
    }
  }, Xn = n(async (g) => {
    if (g)
      try {
        const N = await wn(g);
        De(new Set(N.map((J) => J.key)));
      } catch {
        De(/* @__PURE__ */ new Set());
      }
  }, []);
  r(() => {
    Re && Xn(Re);
  }, [Re, Xn]);
  const Sa = async (g) => {
    if (!Re) {
      d.warning("请先选择目标专家");
      return;
    }
    if (Io(g)) {
      const N = Object.entries(g.env), J = {};
      for (const [ye] of N)
        J[ye] = "";
      ze(J), Me(g);
      return;
    }
    await Qn(g, g.env || {});
  }, Qn = async (g, N) => {
    Ne((J) => ({ ...J, [g.id]: !0 }));
    try {
      const J = g.id;
      await xn(Re, {
        client_key: J,
        client: {
          name: g.name,
          description: g.description,
          enabled: !0,
          transport: g.transport,
          url: g.url || "",
          command: g.command || "",
          args: g.args || [],
          env: N,
          cwd: g.cwd || "",
          headers: g.headers || {}
        }
      }), d.success(`MCP「${g.name}」已添加到当前专家`), De((ye) => new Set(ye).add(J));
    } catch (J) {
      d.error(J.message || `添加 MCP「${g.name}」失败`);
    } finally {
      Ne((J) => ({ ...J, [g.id]: !1 }));
    }
  }, ka = async () => {
    if (!Te) return;
    const g = [];
    for (const [J, ye] of Object.entries(ae))
      if (!ye || !ye.trim()) {
        const Se = mr[J];
        g.push((Se == null ? void 0 : Se.label) || J);
      }
    if (g.length > 0) {
      d.warning(`请填写以下配置项: ${g.join(", ")}`);
      return;
    }
    const N = Te;
    Me(null), ze({}), await Qn(N, { ...ae });
  }, tn = a(() => {
    let g = Pn;
    if (tt && (g = g.filter((N) => N.category === tt)), pe.trim()) {
      const N = pe.toLowerCase();
      g = g.filter(
        (J) => J.name.toLowerCase().includes(N) || J.description.toLowerCase().includes(N) || J.tags.some((ye) => ye.toLowerCase().includes(N))
      );
    }
    return g.map($o);
  }, [Pn, pe, tt]), Ca = e.createElement(
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
      e.createElement(o, {
        placeholder: "搜索 MCP 服务器...",
        prefix: K ? e.createElement(K) : void 0,
        value: pe,
        onChange: (g) => Ie(g.target.value),
        allowClear: !0,
        style: { maxWidth: 300 }
      }),
      e.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        e.createElement(
          w,
          { type: "secondary", style: { fontSize: 12, whiteSpace: "nowrap" } },
          "安装到："
        ),
        e.createElement(S, {
          value: Re,
          onChange: (g) => Ge(g),
          style: { minWidth: 180 },
          size: "small",
          options: V.map((g) => ({ value: g.id, label: g.name }))
        })
      ),
      // Configure MCP source button
      e.createElement(
        c,
        {
          icon: z ? e.createElement(z) : void 0,
          onClick: () => zn(!0),
          size: "small"
        },
        "配置 MCP 源"
      )
    ),
    // Dynamic category tag row (from OSS manifest tag_groups)
    Mn.length > 0 ? e.createElement(
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
        w,
        { type: "secondary", style: { fontSize: 12, marginRight: 4 } },
        "分类:"
      ),
      e.createElement(
        p,
        {
          style: { fontSize: 11, cursor: "pointer", borderRadius: 12 },
          color: tt === "" ? "blue" : void 0,
          onClick: () => Un("")
        },
        "全部"
      ),
      ...Mn.map(
        (g) => e.createElement(
          p,
          {
            key: g.id,
            style: { fontSize: 11, cursor: "pointer", borderRadius: 12 },
            color: tt === g.id ? "geekblue" : void 0,
            onClick: () => Un(
              tt === g.id ? "" : g.id
            )
          },
          g.label
        )
      )
    ) : null,
    // MCP server cards (dynamic from OSS)
    Rn && tn.length === 0 ? e.createElement(
      "div",
      { style: { textAlign: "center", padding: 40 } },
      e.createElement(i, { size: "large" }, e.createElement("div", { style: { minHeight: 60, display: "flex", alignItems: "center", justifyContent: "center" } }, "正在加载 MCP 服务器..."))
    ) : tn.length === 0 ? e.createElement(s, {
      description: "未找到匹配的 MCP 服务器",
      image: s.PRESENTED_IMAGE_SIMPLE
    }) : e.createElement(
      m,
      { gutter: [12, 12] },
      ...tn.map(
        (g) => e.createElement(
          f,
          { key: g.id, xs: 24, sm: 12, md: 8 },
          e.createElement(
            u,
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
                g.iconUrl ? e.createElement("img", {
                  src: g.iconUrl,
                  alt: g.name,
                  style: { width: 28, height: 28, objectFit: "contain" },
                  onError: (N) => {
                    N.target.style.display = "none";
                  }
                }) : g.emoji
              ),
              e.createElement(
                "div",
                { style: { flex: 1 } },
                e.createElement(
                  w,
                  { strong: !0, style: { fontSize: 14 } },
                  g.name
                ),
                e.createElement(
                  "div",
                  { style: { display: "flex", gap: 4, marginTop: 4, flexWrap: "wrap" } },
                  e.createElement(
                    p,
                    { color: "blue", style: { fontSize: 10 } },
                    g.category
                  ),
                  e.createElement(
                    p,
                    {
                      color: g.transport === "stdio" ? "purple" : "cyan",
                      style: { fontSize: 10 }
                    },
                    g.transport
                  ),
                  g.env && Object.keys(g.env).length > 0 ? e.createElement(
                    p,
                    { color: "orange", style: { fontSize: 10 } },
                    "需配置密钥"
                  ) : null
                )
              )
            ),
            // Description
            e.createElement(
              le,
              {
                type: "secondary",
                style: { fontSize: 12, margin: 0, lineHeight: 1.5 },
                ellipsis: { rows: 3 }
              },
              g.description
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
                w,
                { type: "secondary", style: { fontSize: 11 } },
                g.transport === "stdio" ? `${g.command} ${(g.args || []).join(" ")}` : g.url || ""
              ),
              et.has(g.id) ? e.createElement(
                c,
                { size: "small", disabled: !0 },
                "已安装"
              ) : e.createElement(
                c,
                {
                  type: "primary",
                  size: "small",
                  loading: !!Le[g.id],
                  icon: z ? e.createElement(z) : void 0,
                  onClick: () => Sa(g)
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
          border: "1px dashed var(--ant-color-border, #d9d9d9)",
          borderRadius: 8,
          background: "var(--ant-color-fill-quaternary, #fafafa)"
        }
      },
      b ? e.createElement(b, {
        style: { fontSize: 24, color: "var(--ant-color-text-quaternary, #bfbfbf)", marginBottom: 8 }
      }) : null,
      e.createElement(
        w,
        { type: "secondary", style: { fontSize: 12 } },
        "MCP 服务器列表来自 UGSci 官方源，自动同步更新"
      )
    )
  ), Ta = Te ? e.createElement(
    F,
    {
      title: e.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 8 } },
        e.createElement("span", { style: { fontSize: 20, display: "inline-flex", alignItems: "center", justifyContent: "center", width: 24, height: 24 } }, Te.iconUrl ? e.createElement("img", { src: Te.iconUrl, alt: Te.name, style: { width: 22, height: 22, objectFit: "contain" }, onError: (g) => {
          g.target.style.display = "none";
        } }) : Te.emoji),
        e.createElement("span", null, `配置 ${Te.name} 密钥`)
      ),
      open: !!Te,
      onCancel: () => {
        Me(null), ze({});
      },
      onOk: ka,
      okText: "安装",
      cancelText: "取消",
      width: 520,
      destroyOnClose: !0
    },
    // Description
    e.createElement(
      w,
      { type: "secondary", style: { display: "block", marginBottom: 16, fontSize: 12 } },
      Te.description
    ),
    ...Object.entries(Te.env || {}).map(([g]) => {
      const N = mr[g], J = (N == null ? void 0 : N.isSecret) !== !1;
      return e.createElement(
        "div",
        { key: g, style: { marginBottom: 16 } },
        e.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 6, marginBottom: 4 } },
          e.createElement(
            w,
            { strong: !0, style: { fontSize: 13 } },
            (N == null ? void 0 : N.label) || g
          ),
          e.createElement(
            p,
            { color: "orange", style: { fontSize: 10 } },
            "必填"
          )
        ),
        // Help text with optional link
        N ? e.createElement(
          "div",
          { style: { marginBottom: 6, fontSize: 12, color: "var(--ant-color-text-tertiary, #8c8c8c)" } },
          N.help,
          N.link ? e.createElement(
            "a",
            {
              href: N.link,
              target: "_blank",
              rel: "noopener noreferrer",
              style: { marginLeft: 4, fontSize: 12 }
            },
            "获取方式 ↗"
          ) : null
        ) : null,
        // Input field
        J ? e.createElement(o.Password, {
          placeholder: `请输入 ${(N == null ? void 0 : N.label) || g}`,
          value: ae[g] || "",
          onChange: (ye) => ze((Se) => ({
            ...Se,
            [g]: ye.target.value
          })),
          style: { width: "100%" }
        }) : e.createElement(o, {
          placeholder: `请输入 ${(N == null ? void 0 : N.label) || g}`,
          value: ae[g] || "",
          onChange: (ye) => ze((Se) => ({
            ...Se,
            [g]: ye.target.value
          })),
          style: { width: "100%" }
        }),
        // Show env key name for reference
        e.createElement(
          w,
          { type: "secondary", style: { fontSize: 11, display: "block", marginTop: 2 } },
          `环境变量名: ${g}`
        )
      );
    })
  ) : null, _a = e.createElement(
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
      e.createElement(o, {
        placeholder: "搜索人才...",
        prefix: K ? e.createElement(K) : void 0,
        value: T,
        onChange: (g) => re(g.target.value),
        allowClear: !0,
        style: { maxWidth: 400, flex: 1, minWidth: 200 }
      }),
      e.createElement(
        c,
        {
          icon: I ? e.createElement(I) : void 0,
          onClick: () => $n(!0),
          size: "small"
        },
        "配置专家源"
      )
    ),
    // Dynamic category tag row (from OSS manifest tag_groups)
    Dn.length > 0 ? e.createElement(
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
        w,
        { type: "secondary", style: { fontSize: 12, marginRight: 4 } },
        "分类:"
      ),
      e.createElement(
        p,
        {
          style: { fontSize: 11, cursor: "pointer", borderRadius: 12 },
          color: nt === "" ? "blue" : void 0,
          onClick: () => Wn("")
        },
        "全部"
      ),
      ...Dn.map(
        (g) => e.createElement(
          p,
          {
            key: g.id,
            style: { fontSize: 11, cursor: "pointer", borderRadius: 12 },
            color: nt === g.id ? "geekblue" : void 0,
            onClick: () => Wn(
              nt === g.id ? "" : g.id
            )
          },
          g.label
        )
      )
    ) : null,
    // Agent cards (dynamic from OSS)
    Fn && en.length === 0 ? e.createElement(
      "div",
      { style: { textAlign: "center", padding: 40 } },
      e.createElement(i, { size: "large" }, e.createElement("div", { style: { minHeight: 60, display: "flex", alignItems: "center", justifyContent: "center" } }, "正在加载人才市场..."))
    ) : en.length === 0 ? e.createElement(s, {
      description: "未找到匹配的人才",
      image: s.PRESENTED_IMAGE_SIMPLE
    }) : e.createElement(
      m,
      { gutter: [12, 12] },
      ...en.map(
        (g) => e.createElement(
          f,
          { key: g.id, xs: 24, sm: 12, md: 8 },
          e.createElement(
            u,
            {
              hoverable: !0,
              size: "small",
              style: { height: "100%", cursor: "pointer" },
              onClick: () => Ct(g)
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
              e.createElement(He, {
                name: g.name,
                size: 40
              }),
              e.createElement(
                "div",
                { style: { flex: 1 } },
                e.createElement(
                  w,
                  { strong: !0, style: { fontSize: 14 } },
                  g.name
                ),
                e.createElement(
                  "div",
                  { style: { display: "flex", gap: 4, marginTop: 4, flexWrap: "wrap" } },
                  g.category ? e.createElement(
                    p,
                    { color: "blue", style: { fontSize: 10 } },
                    ct(g.category)
                  ) : null,
                  g.tags.includes("mcp") ? e.createElement(
                    p,
                    { color: "purple", style: { fontSize: 10 } },
                    "MCP"
                  ) : null
                )
              )
            ),
            e.createElement(
              le,
              {
                type: "secondary",
                style: { fontSize: 12, margin: 0, lineHeight: 1.5 },
                ellipsis: { rows: 3 }
              },
              g.description
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
                w,
                { type: "secondary", style: { fontSize: 11 } },
                g.tags.filter((N) => N !== "agent" && N !== "template" && N !== "workspace").slice(0, 3).join(" · ") || "人才模板"
              ),
              e.createElement(
                c,
                {
                  type: "primary",
                  size: "small",
                  icon: U ? e.createElement(U) : void 0
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
          border: "1px dashed var(--ant-color-border, #d9d9d9)",
          borderRadius: 8,
          background: "var(--ant-color-fill-quaternary, #fafafa)"
        }
      },
      b ? e.createElement(b, {
        style: { fontSize: 24, color: "var(--ant-color-text-quaternary, #bfbfbf)", marginBottom: 8 }
      }) : null,
      e.createElement(
        w,
        { type: "secondary", style: { fontSize: 12 } },
        "人才市场来自 UGSci 官方源，自动同步更新"
      )
    )
  ), Ia = [
    {
      key: "skills",
      label: e.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        H ? e.createElement(H, { style: { fontSize: 14 } }) : null,
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
      children: Ca
    },
    {
      key: "experts",
      label: e.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        U ? e.createElement(U, { style: { fontSize: 14 } }) : null,
        "人才市场"
      ),
      children: _a
    }
  ];
  return e.createElement(
    "div",
    { style: { padding: 24 } },
    e.createElement(Wt, {
      title: "市场",
      subtitle: "浏览技能市场 · 选择 MCP 服务器 · 人才市场 · 随时更新能力和专家",
      extra: e.createElement(
        "div",
        { style: { display: "flex", gap: 8 } },
        e.createElement(
          c,
          {
            type: "primary",
            icon: j ? e.createElement(j) : void 0,
            onClick: () => {
              _t(ue, Y, {}), Tt(), Yt();
            },
            loading: he || Ke || Rn || Fn
          },
          "刷新"
        )
      )
    }),
    e.createElement(E, {
      items: Ia,
      activeKey: B,
      onChange: (g) => R(g)
    }),
    // Skill source config modal
    e.createElement(Fo, {
      open: ma,
      onClose: () => _n(!1),
      sources: $e,
      onChange: (g) => {
        Oe(g), Tt(g);
      }
    }),
    // MCP source config modal
    e.createElement(fr, {
      open: fa,
      onClose: () => zn(!1),
      sources: pa,
      onChange: (g) => In(g),
      type: "mcp"
    }),
    // MCP token config modal (for templates requiring secrets)
    Ta,
    // Expert source config modal
    e.createElement(fr, {
      open: ya,
      onClose: () => $n(!1),
      sources: ga,
      onChange: (g) => An(g),
      type: "expert"
    }),
    // ── Agent Detail Modal (click card to view details, then create) ──
    Ue ? e.createElement(
      F,
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
          e.createElement(He, {
            name: Ue.name,
            size: 40
          }),
          e.createElement(
            "div",
            null,
            e.createElement(
              w,
              { strong: !0, style: { fontSize: 16 } },
              Ue.name
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
              Ue.category ? e.createElement(
                p,
                { color: "blue", style: { fontSize: 10 } },
                ct(Ue.category)
              ) : null,
              ...Ue.tags.filter(
                (g) => g !== "agent" && g !== "template" && g !== "workspace"
              ).slice(0, 5).map(
                (g) => e.createElement(
                  p,
                  { key: g, style: { fontSize: 10 } },
                  g
                )
              )
            )
          )
        ),
        open: !0,
        onCancel: () => Ct(null),
        width: 640,
        footer: e.createElement(
          "div",
          { style: { textAlign: "right" } },
          e.createElement(
            c,
            {
              onClick: () => Ct(null),
              style: { marginRight: 8 }
            },
            "取消"
          ),
          e.createElement(
            c,
            {
              type: "primary",
              loading: Qt,
              disabled: Qt,
              icon: U ? e.createElement(U) : void 0,
              style: Be,
              onClick: async () => {
                await xa(Ue), Ct(null);
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
          w,
          { strong: !0, style: { display: "block", marginBottom: 6 } },
          "简介"
        ),
        e.createElement(
          le,
          {
            type: "secondary",
            style: { fontSize: 13, lineHeight: 1.7, margin: 0 }
          },
          Ue.description
        )
      ),
      // Skills manifest hint
      Ue.skills_manifest ? e.createElement(
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
          w,
          { style: { fontSize: 12, color: "#52c41a" } },
          "✓ 包含技能清单，创建后将自动安装推荐技能"
        )
      ) : null,
      // Instructions hint
      Ue.instructions ? e.createElement(
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
          w,
          { style: { fontSize: 12, color: "#1677ff" } },
          "✓ 包含系统提示词，创建后将自动写入 AGENTS.md"
        )
      ) : null,
      // Drivers
      Ue.drivers && Object.keys(Ue.drivers).length > 0 ? e.createElement(
        "div",
        null,
        e.createElement(
          w,
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
          ...Object.entries(Ue.drivers).map(
            ([g, N]) => e.createElement(
              p,
              { key: g, color: "cyan", style: { fontSize: 11 } },
              `${g}${N && N.length > 0 ? ` (${N.join(", ")})` : ""}`
            )
          )
        )
      ) : null
    ) : null
  );
}
function Vo() {
  try {
    const t = localStorage.getItem("language") || "";
    if (t) return t.split("-")[0];
  } catch {
  }
  return ((typeof navigator < "u" ? navigator.language : "") || "").split("-")[0] || "en";
}
const hr = {
  zh: "您好，UGSci 智能助手在线。无论是油气藏分析、数值模拟还是工程决策，描述您的场景，我来交付结果。",
  en: "UGSci AI assistant is online. From reservoir analysis to numerical simulation and engineering decisions — describe your scenario and I'll deliver results.",
  ja: "UGSci AIアシスタントがオンラインです。油層解析、数値シミュレーション、エンジニアリングの意思決定など、シナリオを描写してください。結果をお届けします。",
  ru: "UGSci AI-ассистент онлайн. От анализа пласта до численного моделирования и инженерных решений — опишите свой сценарий, и я предоставлю результат.",
  vi: "Trợ lý AI UGSci đang trực tuyến. Từ phân tích mỏ, mô phỏng số đến ra quyết định kỹ thuật — mô tả kịch bản của bạn, tôi sẽ giao kết quả.",
  id: "Asisten AI UGSci sedang online. Dari analisis reservoir, simulasi numerik hingga keputusan engineering — jelaskan skenario Anda, saya akan memberikan hasilnya."
}, Er = {
  zh: { label: "能告诉我你都能做点什么吗？", value: "能告诉我你都能做点什么吗" },
  en: { label: "Can you tell me what you can do?", value: "Can you tell me what you can do?" },
  ja: { label: "あなたができることを教えてください", value: "あなたができることを教えてください" },
  ru: { label: "Расскажи, что ты умеешь делать?", value: "Расскажи, что ты умеешь делать?" },
  vi: { label: "Bạn có thể cho tôi biết bạn làm được gì không?", value: "Bạn có thể cho tôi biết bạn làm được gì không?" },
  id: { label: "Bisa cerita apa saja yang bisa Anda lakukan?", value: "Bisa cerita apa saja yang bisa Anda lakukan?" }
};
function Ko() {
  const e = A(), t = e.React, { useEffect: r, useRef: n } = t, a = e.useSelectedAgent ? e.useSelectedAgent() : { id: "default" }, l = (a == null ? void 0 : a.id) || "default", i = n(null), s = n(null);
  return r(() => {
    if (i.current === l) return;
    i.current = l, hn();
    const o = Vo(), c = hr[o] || hr.en, d = Er[o] || Er.en;
    let m = !1;
    return (async () => {
      var f, u;
      try {
        const p = await qt(l);
        if (m) return;
        const y = $r(p);
        if (s.current) {
          try {
            s.current();
          } catch {
          }
          s.current = null;
        }
        const h = window.QwenPaw;
        (f = h == null ? void 0 : h.chat) != null && f.welcome && (y.length > 0 ? (s.current = h.chat.welcome.set("ugsci", {
          description: c,
          prompts: y
        }), console.info(
          `[ugsci] Injected ${y.length} welcome prompts for agent "${l}"`
        )) : (s.current = h.chat.welcome.set("ugsci", {
          description: c,
          prompts: [d]
        }), console.info(
          `[ugsci] No skills for agent "${l}" — using default prompt`
        )));
      } catch (p) {
        console.warn(
          `[ugsci] Failed to inject welcome prompts for agent "${l}":`,
          p
        );
        const y = window.QwenPaw;
        if ((u = y == null ? void 0 : y.chat) != null && u.welcome && !m) {
          if (s.current) {
            try {
              s.current();
            } catch {
            }
            s.current = null;
          }
          s.current = y.chat.welcome.set("ugsci", {
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
const Xo = 256;
let je = {};
const gn = /* @__PURE__ */ new Set(), jt = () => gn.forEach((e) => e()), Qo = (e) => (gn.add(e), () => gn.delete(e)), vr = () => je;
function Nt(e, t) {
  return `${e}::${t}`;
}
function ht(e) {
  var t;
  if (!e || typeof e != "string") return null;
  try {
    const r = JSON.parse(e);
    if (Array.isArray(r)) {
      const n = (t = r.find((a) => (a == null ? void 0 : a.type) === "text")) == null ? void 0 : t.text;
      return typeof n == "string" ? ht(n) : null;
    }
    return r && r.ok === !0 && (r.kind === "genui" || r.kind === "genui_patch") ? r : null;
  } catch {
    return null;
  }
}
function Et(e) {
  var t;
  if (!e || typeof e != "string") return null;
  try {
    const r = JSON.parse(e);
    if (Array.isArray(r)) {
      const n = (t = r.find((a) => (a == null ? void 0 : a.type) === "text")) == null ? void 0 : t.text;
      return typeof n == "string" ? Et(n) : null;
    }
    return r && r.ok === !1 ? r : null;
  } catch {
    return null;
  }
}
const br = /* @__PURE__ */ new Set(["plugin_call_output", "function_call_output", "tool_call_output", "mcp_call_output", "component_call_output"]), rn = /* @__PURE__ */ new Set(["emit_ui_tree", "emit_ui_patch"]);
function aa(e) {
  var n, a, l, i;
  if (!Array.isArray(e)) return [];
  const t = [], r = (s, o = !1) => {
    var m, f;
    if (!s || typeof s != "object") return;
    if (Array.isArray(s)) {
      if (o ? s.map((p) => {
        var y;
        return ((y = p == null ? void 0 : p.data) == null ? void 0 : y.name) ?? (p == null ? void 0 : p.name);
      }).find((p) => rn.has(String(p || ""))) : void 0)
        for (const p of s) {
          const y = ((m = p == null ? void 0 : p.data) == null ? void 0 : m.output) ?? (p == null ? void 0 : p.output) ?? ((f = p == null ? void 0 : p.data) == null ? void 0 : f.result) ?? (p == null ? void 0 : p.result);
          if (y == null) continue;
          const h = typeof y == "string" ? y : JSON.stringify(y), S = ht(h) || Et(h);
          S && t.push(S);
        }
      s.forEach((p) => r(p));
      return;
    }
    const c = s;
    if (c.type === "tool_result" && rn.has(String(c.name || ""))) {
      const p = (Array.isArray(c.output) ? c.output : []).find((k) => (k == null ? void 0 : k.type) === "text"), y = (p == null ? void 0 : p.text) ?? c.output, h = typeof y == "string" ? y : JSON.stringify(y), S = ht(h) || Et(h);
      S && t.push(S);
      return;
    }
    const d = br.has(String(c.type || ""));
    Object.entries(c).forEach(
      ([u, p]) => r(p, d && u === "content")
    );
  };
  r(e);
  for (const s of e) {
    if (!s || typeof s != "object") continue;
    const o = s;
    if (!br.has(String(o.type || "")) || !Array.isArray(o.content)) continue;
    const c = o.content, d = (a = (n = c[0]) == null ? void 0 : n.data) == null ? void 0 : a.name;
    if (!rn.has(d)) continue;
    const m = (i = (l = c[1]) == null ? void 0 : l.data) == null ? void 0 : i.output;
    if (m == null) continue;
    const f = typeof m == "string" ? m : JSON.stringify(m), u = ht(f) || Et(f);
    u && t.push(u);
  }
  return Array.from(new Map(t.map((s) => [`${s.kind}:${s.ui_id}:${s.revision}`, s])).values());
}
function la(e) {
  var i;
  const t = Nt(e.sessionId, e.uiId), r = Object.entries(je).filter(([, s]) => s.uiId === e.uiId).sort(([, s], [, o]) => o.revision - s.revision), n = je[t] || ((i = r[0]) == null ? void 0 : i[1]);
  if (n && e.revision < n.revision) return;
  const a = { ...je };
  for (const [s] of r) s !== t && delete a[s];
  a[t] = n && e.revision === n.revision ? { ...n, ...e, tree: n.tree } : e;
  const l = Object.entries(a).sort(([, s], [, o]) => o.updatedAt - s.updatedAt);
  je = Object.fromEntries(l.slice(0, Xo)), jt();
}
function Yo(e, t) {
  for (const r of aa(t))
    !r.ui_id || !r.tree || la({
      schemaVersion: "1",
      uiId: r.ui_id,
      revision: r.revision || 1,
      tree: r.tree,
      sessionId: e,
      sourceToolCallId: r.tool_call_id,
      updatedAt: Date.now()
    });
}
const Zo = {
  setSnapshot: la,
  applyPatch(e, t, r, n) {
    var c, d;
    const a = (c = window.QwenPaw) == null ? void 0 : c.host, l = n || ((d = a == null ? void 0 : a.getCurrentSessionId) == null ? void 0 : d.call(a)) || "", i = Nt(l, e.ui_id), s = je[i] || Object.values(je).find((m) => m.uiId === e.ui_id);
    if (!s || r <= s.revision) return;
    je = { ...Object.fromEntries(Object.entries(je).filter(([, m]) => m.uiId !== e.ui_id)), [i]: { ...s, sessionId: l, tree: t, revision: r, updatedAt: Date.now() } }, jt();
  },
  getSnapshot: (e, t) => je[Nt(e, t)],
  clearSession(e) {
    je = Object.fromEntries(Object.entries(je).filter(([, t]) => t.sessionId !== e)), jt();
  },
  hydrateFromMessages: Yo
};
function ei({ children: e }) {
  return e;
}
function ti() {
  var r, n;
  const e = (n = (r = window.QwenPaw) == null ? void 0 : r.host) == null ? void 0 : n.React;
  if (!e) throw new Error("useGenUiStore: host React not available");
  return { snapshots: e.useSyncExternalStore(Qo, vr, vr), ...Zo };
}
function ni() {
  je = {}, jt();
}
function vt(e) {
  var t;
  if (typeof e == "string") {
    if (e.trimStart().startsWith("["))
      try {
        return vt(JSON.parse(e));
      } catch {
      }
    return e;
  }
  if (Array.isArray(e)) {
    const r = (t = e.find((n) => (n == null ? void 0 : n.type) === "text")) == null ? void 0 : t.text;
    return typeof r == "string" ? r : JSON.stringify(e);
  }
  if (e && typeof e == "object") {
    const r = e;
    if (typeof r.text == "string") return r.text;
    if (r.output !== void 0) return vt(r.output);
    if (r.content !== void 0) return vt(r.content);
  }
  return e == null ? "" : JSON.stringify(e);
}
function ri(e) {
  const t = e.data;
  if (!t) return { resultText: "", status: "calling", toolName: "" };
  const r = t.status || "calling", n = t.content;
  if (!Array.isArray(n) || n.length === 0)
    return { resultText: "", status: r, toolName: "" };
  const a = n[0], l = a == null ? void 0 : a.data, i = (l == null ? void 0 : l.name) || "";
  if (n.length > 1) {
    const s = n[1], o = s == null ? void 0 : s.data, c = (o == null ? void 0 : o.output) ?? (o == null ? void 0 : o.content) ?? (s == null ? void 0 : s.output) ?? (s == null ? void 0 : s.content) ?? (o == null ? void 0 : o.result) ?? (s == null ? void 0 : s.result);
    if (c != null) return { resultText: vt(c), status: r, toolName: i };
  }
  if (l != null && l.output) {
    const s = l.output;
    return { resultText: vt(s), status: r, toolName: i };
  }
  return { resultText: "", status: r, toolName: i };
}
function Ot(e) {
  var u, p, y, h;
  const t = (u = window.QwenPaw) == null ? void 0 : u.host, r = t == null ? void 0 : t.React;
  if (!r) return null;
  const { resultText: n, status: a, toolName: l } = ri(e), i = a === "in_progress" || a === "calling", s = a === "failed" || a === "error", o = ht(n), c = o ? null : Et(n);
  let d = 0;
  (p = o == null ? void 0 : o.tree) != null && p.root && (d = oa(o.tree.root));
  const m = l === "emit_ui_patch" || (o == null ? void 0 : o.kind) === "genui_patch", f = i ? m ? "📝 Patching UI Tree..." : "🎨 Generating UI Tree..." : s ? m ? "📝 UI Patch Error" : "🎨 UI Tree Error" : o ? m ? `📝 UI Patched (rev ${o.revision ?? "?"})` : `🎨 UI Tree (${d} nodes)` : m ? "📝 UI Patch" : "🎨 UI Tree";
  return r.createElement(
    "details",
    { open: i || s, style: { margin: "4px 0", border: "1px solid var(--ant-color-border, #d9d9d9)", borderRadius: 8, padding: "4px 8px", fontSize: 13 } },
    r.createElement(
      "summary",
      { style: { cursor: "pointer", display: "flex", alignItems: "center", gap: 6 } },
      r.createElement("span", null, m ? "📝" : "🎨"),
      r.createElement("span", null, f),
      o != null && o.ok ? r.createElement("span", { style: { fontSize: 11, color: "#999", marginLeft: "auto" } }, `ui_id: ${((y = o.ui_id) == null ? void 0 : y.slice(0, 16)) ?? ""}…`) : null
    ),
    s || c && !o ? r.createElement(
      "div",
      { style: { padding: "8px 12px", fontSize: 12 } },
      r.createElement("div", { style: { color: "var(--ant-color-error, #ff4d4f)", marginBottom: 4 } }, (c == null ? void 0 : c.message) || "Unknown error"),
      c != null && c.hint ? r.createElement("div", { style: { color: "#999" } }, `💡 ${c.hint}`) : null
    ) : o != null && o.ok ? r.createElement(
      "div",
      { style: { padding: "8px 12px", fontSize: 12, color: "#999" } },
      (h = o.tree) != null && h.root ? `GenUI 已在回复正文中展示（${d} 个节点，revision ${o.revision ?? 1}）。` : "GenUI 工具已完成，但没有可展示的树。"
    ) : r.createElement("pre", { style: { fontSize: 12, padding: "8px 12px", background: "rgba(0,0,0,0.03)", borderRadius: 8, overflow: "auto", maxHeight: 200 } }, n || "(waiting for result...)")
  );
}
function oa(e) {
  if (!e || typeof e != "object") return 0;
  let t = 1;
  if (Array.isArray(e.children)) for (const r of e.children) t += oa(r);
  return t;
}
const ai = /* @__PURE__ */ new Set(["send_message"]), wr = 1e4, li = 500, xr = {};
function oi() {
  var e;
  try {
    const t = window.QwenPaw, r = (e = t == null ? void 0 : t.genui) == null ? void 0 : e.config;
    if (r != null && r.allow_actions && Array.isArray(r.allow_actions)) {
      const n = r.allow_actions.filter(
        (a) => typeof a == "string" && a.length > 0
      );
      if (n.length > 0)
        return new Set(n);
    }
  } catch {
  }
  return new Set(ai);
}
function ii(e) {
  const t = Date.now(), r = xr[e] || 0;
  return t - r < li ? (console.warn("[ugsci.genui] Action '" + e + "' throttled"), !0) : (xr[e] = t, !1);
}
function si(e, t) {
  return e.replace(/\{\{\s*([\w.-]+)\s*\}\}/g, (r, n) => {
    const a = t[n];
    return a == null ? "" : typeof a == "string" ? a : JSON.stringify(a);
  });
}
function ia(e, t = {}) {
  var l, i, s, o, c;
  let r;
  if (typeof e == "string") r = { type: e };
  else if (e && typeof e == "object") r = e;
  else return { ok: !1, message: "无效操作" };
  const n = r.type === "submit_form" ? "send_message" : r.type, a = oi();
  if (!a.has(n))
    return console.warn(
      "[ugsci.genui] Action '" + r.type + "' not allowed (allowed: " + Array.from(a).join(", ") + ")"
    ), { ok: !1, message: "此操作未获允许" };
  if (ii(n)) return { ok: !1, message: "操作过于频繁，请稍后重试" };
  if (n === "send_message") {
    const d = t.formValues || {};
    let m = ((l = r.payload) == null ? void 0 : l.content) || ((i = r.payload) == null ? void 0 : i.message) || "";
    const f = /\{\{\s*[\w.-]+\s*\}\}/.test(m);
    return m = si(m, d).trim(), m && !f && Object.keys(d).length > 0 && (m += `
${Object.entries(d).map(([p, y]) => `${p}: ${typeof y == "string" ? y : JSON.stringify(y)}`).join(`
`)}`), !m && Object.keys(d).length > 0 && (m = `${t.formId ? `提交表单 ${t.formId}` : "提交表单"}
${Object.entries(d).map(([y, h]) => `${y}: ${typeof h == "string" ? h : JSON.stringify(h)}`).join(`
`)}`), !m || !m.trim() ? (console.warn("[ugsci.genui] send_message: content is empty"), { ok: !1, message: "消息内容为空" }) : m.length > wr ? (console.warn("[ugsci.genui] send_message: content length " + m.length + " exceeds max " + wr), { ok: !1, message: "消息内容过长" }) : !((c = (o = (s = window.QwenPaw) == null ? void 0 : s.chat) == null ? void 0 : o.sendMessage) != null && c.call(o, m)) ? (console.info("[ugsci.genui] send_message: could not find chat sender, content:", m), { ok: !1, message: "当前无法发送消息" }) : { ok: !0, message: "已提交" };
  }
  return { ok: !1, message: "尚未实现此操作" };
}
const Fe = /* @__PURE__ */ new Map(), wt = /* @__PURE__ */ new Map(), ci = 128, Mt = /* @__PURE__ */ new Map();
function Dt(e) {
  return e.startsWith("http://") || e.startsWith("https://") || e.startsWith("data:") || e.startsWith("blob:");
}
function di(e) {
  return e ? !!(e.startsWith("/") || /^[A-Za-z]:[\\/]/.test(e) || e.startsWith("\\\\")) : !1;
}
function ui(e) {
  return e.startsWith("workspace://");
}
function mi(e) {
  return ui(e) ? e.slice(12) : e;
}
async function pi(e) {
  if (!e) return null;
  if (Dt(e)) return e;
  if (Fe.has(e))
    return Fe.get(e) ?? null;
  if (Mt.has(e))
    return Mt.get(e);
  const t = fi(e);
  Mt.set(e, t);
  try {
    const r = await t;
    if (!Fe.has(e) && Fe.size >= ci) {
      const n = Fe.keys().next().value;
      if (n !== void 0) {
        const a = Fe.get(n);
        a != null && a.startsWith("blob:") && URL.revokeObjectURL(a), Fe.delete(n);
      }
    }
    return Fe.set(e, r), r && wt.delete(e), r;
  } finally {
    Mt.delete(e);
  }
}
async function fi(e) {
  const t = window.QwenPaw, r = t == null ? void 0 : t.host;
  if (!r) {
    const a = "宿主媒体 API 不可用。请在 QwenPaw 工作区中打开此内容，或改用 http(s)、data、blob URL。";
    return wt.set(e, a), console.warn("[ugsci.genui]", a), null;
  }
  const n = mi(e);
  if (typeof r.resolveWorkspaceBlob == "function")
    try {
      const a = await r.resolveWorkspaceBlob(n);
      if (a) return a;
    } catch (a) {
      console.warn("[ugsci.genui] host.resolveWorkspaceBlob failed:", a);
    }
  try {
    return await gi(n, r);
  } catch (a) {
    const l = a instanceof Error ? a.message : String(a);
    return wt.set(
      e,
      `无法读取本地媒体：${l}。请确认文件位于当前工作区且文件预览 API 已启用。`
    ), console.warn(
      `[ugsci.genui] Failed to resolve media URL for '${e}':`,
      a
    ), null;
  }
}
async function gi(e, t) {
  let r = null;
  const n = t == null ? void 0 : t.workspaceApi, a = t == null ? void 0 : t.chatApi;
  if (di(e) && (a != null && a.filePreviewUrl) ? r = a.filePreviewUrl(e) : n != null && n.getBinaryFileUrl && (r = n.getBinaryFileUrl(e)), !r)
    throw new Error("宿主未提供 workspaceApi.getBinaryFileUrl 或 chatApi.filePreviewUrl");
  const l = {}, i = t == null ? void 0 : t.buildAuthHeaders;
  if (typeof i == "function")
    try {
      const c = i();
      c && typeof c == "object" && Object.assign(l, c);
    } catch {
    }
  const s = await fetch(r, { headers: l });
  if (!s.ok)
    throw new Error(`HTTP ${s.status}: ${s.statusText}`);
  const o = await s.blob();
  return URL.createObjectURL(o);
}
function Sr(e) {
  return e ? Dt(e) ? e : Fe.get(e) ?? null : null;
}
function kr(e) {
  return wt.get(e) ?? null;
}
function yi() {
  for (const e of Fe.values())
    if (e && e.startsWith("blob:"))
      try {
        URL.revokeObjectURL(e);
      } catch {
      }
  Fe.clear(), wt.clear();
}
const Cr = (e) => typeof e == "string" ? e : e != null ? String(e) : "";
let an = null;
function Kt(e) {
  return an || (an = e.createContext(null)), an;
}
function Gt(e) {
  const t = e.props || {}, r = Cr(t.name);
  if (r) return r;
  const n = Cr(t.label), a = n.match(/^\s*([a-e])(?:\b|\s|（|\()/i);
  return a ? a[1].toLowerCase() : n || e.nodeId;
}
function sa(e, t = {}) {
  if (["Input", "NumberInput", "Select", "Textarea", "Switch", "Slider", "FileInput"].includes(e.kind)) {
    const r = e.props || {}, n = r.value ?? r.checked;
    n !== void 0 && (t[Gt(e)] = n);
  }
  for (const r of e.children || []) sa(r, t);
  return t;
}
function hi({
  node: e,
  children: t,
  onValuesChange: r
}) {
  var o, c;
  const n = (c = (o = window.QwenPaw) == null ? void 0 : o.host) == null ? void 0 : c.React;
  if (!n) return null;
  const a = n.useMemo(() => sa(e), [e]), [l, i] = n.useState(a);
  n.useEffect(
    () => i((d) => ({ ...a, ...d })),
    [a]
  ), n.useEffect(() => {
    r == null || r(l);
  }, [l, r]);
  const s = n.useMemo(
    () => ({
      values: l,
      setValue: (d, m) => i((f) => ({ ...f, [d]: m }))
    }),
    [l]
  );
  return n.createElement(
    Kt(n).Provider,
    { value: s },
    t
  );
}
const P = (e) => typeof e == "string" ? e : e != null ? String(e) : "", Ce = (e) => typeof e == "number" ? e : typeof e == "string" && Number(e) || 0, Ye = (e) => !!e, qe = (e) => Array.isArray(e) ? e : [], Ei = (e, t) => {
  const r = Object.keys(e), n = Object.keys(t);
  return r.length === n.length && r.every((a) => Object.is(e[a], t[a]));
}, Tr = { xs: "12px", sm: "13px", base: "14px", lg: "16px" }, ve = {
  muted: "var(--ant-color-text-secondary, #8c8c8c)",
  default: "var(--ant-color-text, #000000d9)",
  primary: "var(--ant-color-primary, #1677ff)",
  success: "var(--ant-color-success, #52c41a)",
  warning: "var(--ant-color-warning, #faad14)",
  error: "var(--ant-color-error, #ff4d4f)"
};
let ln = null;
function Tn(e) {
  return ln || (ln = e.createContext(null)), ln;
}
function vi({ node: e }) {
  var u;
  const t = (u = window.QwenPaw) == null ? void 0 : u.host, r = t == null ? void 0 : t.React, n = (t == null ? void 0 : t.antd) || {};
  if (!r) return null;
  const a = e.props || {}, l = r.useContext(Kt(r)), [i, s] = r.useState({}), [o, c] = r.useState(null), d = r.useMemo(() => {
    const p = {};
    for (const y of e.children || []) {
      const h = y.props || {}, S = Gt(y);
      h.value !== void 0 ? p[S] = h.value : h.checked !== void 0 && (p[S] = h.checked);
    }
    return p;
  }, [e]);
  r.useEffect(() => s((p) => {
    const y = { ...d, ...p, ...(l == null ? void 0 : l.values) || {} };
    return Ei(p, y) ? p : y;
  }), [d, l == null ? void 0 : l.values]);
  const m = r.useMemo(() => ({ values: i, setValue: (p, y) => {
    c(null), s((h) => ({ ...h, [p]: y })), l == null || l.setValue(p, y);
  } }), [i, l]), f = () => {
    var h, S;
    const p = (e.children || []).filter((k) => {
      var x;
      return (x = k.props) == null ? void 0 : x.required;
    }).find((k) => {
      const x = Gt(k), E = i[x];
      return E == null || E === "" || Array.isArray(E) && E.length === 0;
    });
    if (p) {
      c({ ok: !1, message: `${P((h = p.props) == null ? void 0 : h.label) || P((S = p.props) == null ? void 0 : S.name) || "必填项"}不能为空` });
      return;
    }
    const y = a.action && typeof a.action == "object" ? a.action : { type: "submit_form", payload: {} };
    c(ia(y, { formValues: i, formId: P(a.formId) || e.nodeId }));
  };
  return r.createElement(
    Tn(r).Provider,
    { value: m },
    r.createElement(
      "div",
      { style: { margin: "4px 0" } },
      a.title ? r.createElement("div", { style: { fontWeight: 600, marginBottom: 8 } }, P(a.title)) : null,
      ...(e.children || []).map((p, y) => r.createElement(it, { key: p.nodeId || y, node: p })),
      r.createElement(n.Button || "button", { type: "primary", size: "small", style: { marginTop: 8 }, onClick: f }, P(a.submitLabel) || "提交"),
      o ? r.createElement("div", { role: "status", style: { marginTop: 6, fontSize: 12, color: o.ok ? ve.success : ve.error } }, o.message) : null
    )
  );
}
function bi({ node: e, fieldType: t }) {
  var S, k, x;
  const r = (S = window.QwenPaw) == null ? void 0 : S.host, n = r == null ? void 0 : r.React, a = (r == null ? void 0 : r.antd) || {};
  if (!n) return null;
  const l = e.props || {}, i = n.useContext(Tn(n)), s = n.useContext(Kt(n)), o = i || s, [c, d] = n.useState(l.value ?? l.checked ?? ""), m = Gt(e), f = l.value ?? l.checked ?? "", u = o ? ((k = o.values) == null ? void 0 : k[m]) ?? f : c, p = (E) => {
    const L = E != null && E.target ? t === "Switch" ? E.target.checked : E.target.value : E;
    o ? o.setValue(m, L) : d(L);
  }, y = (E) => n.createElement(
    "div",
    { style: { display: "flex", flexDirection: "column", gap: 4, margin: "4px 0" } },
    l.label && t !== "Switch" ? n.createElement("label", { style: { fontSize: 12, color: ve.muted } }, P(l.label), l.required ? n.createElement("span", { style: { color: ve.error } }, " *") : null) : null,
    E,
    l.description ? n.createElement("span", { style: { fontSize: 11, color: ve.muted } }, P(l.description)) : null
  ), h = P(l.label) || P(l.placeholder) || m;
  return t === "Input" ? y(n.createElement(a.Input || "input", { "aria-label": h, placeholder: P(l.placeholder), value: u, onChange: p, size: "small" })) : t === "NumberInput" ? y(n.createElement(a.InputNumber || "input", { "aria-label": h, value: u, min: l.min, max: l.max, step: l.step, onChange: p, size: "small", style: { width: "100%" } })) : t === "Textarea" ? y(n.createElement(((x = a.Input) == null ? void 0 : x.TextArea) || "textarea", { "aria-label": h, placeholder: P(l.placeholder), value: u, rows: Ce(l.rows) || 3, onChange: p, style: { width: "100%" } })) : t === "Select" ? y(n.createElement(a.Select || "select", { "aria-label": h, placeholder: P(l.placeholder), value: u || void 0, onChange: p, size: "small", style: { width: "100%" } }, qe(l.options).map((E, L) => {
    var D;
    return n.createElement(((D = a.Select) == null ? void 0 : D.Option) || "option", { key: L, value: P(typeof E == "object" ? E.value : E) }, P(typeof E == "object" ? E.label : E));
  }))) : t === "Switch" ? n.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8 } }, n.createElement(a.Switch || "input", { type: "checkbox", checked: !!u, onChange: p, size: "small" }), n.createElement("span", null, P(l.label))) : t === "Slider" ? y(n.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8 } }, n.createElement(a.Slider || "input", { type: "range", value: Ce(u), min: l.min ?? 0, max: l.max ?? 100, step: l.step ?? 1, onChange: p, style: { flex: 1 } }), n.createElement("span", { style: { minWidth: 32, fontSize: 12 } }, P(u)))) : t === "FileInput" ? n.createElement(
    "label",
    { style: { display: "inline-flex", alignItems: "center", gap: 8, cursor: "pointer" } },
    n.createElement("span", null, P(l.label) || "选择文件"),
    n.createElement("input", { type: "file", multiple: Ye(l.multiple), accept: P(l.accept) || void 0, onChange: (E) => o == null ? void 0 : o.setValue(m, Array.from(E.target.files || []).map((L) => ({ name: L.name, size: L.size, type: L.type }))) })
  ) : null;
}
function on({ node: e, link: t = !1, toggle: r = !1 }) {
  var u;
  const n = (u = window.QwenPaw) == null ? void 0 : u.host, a = n == null ? void 0 : n.React, l = (n == null ? void 0 : n.antd) || {};
  if (!a) return null;
  const i = e.props || {}, s = a.useContext(Tn(a)), [o, c] = a.useState(Ye(i.checked)), [d, m] = a.useState(null), f = () => {
    r && c((p) => !p), i.action && typeof i.action == "object" ? m(ia(i.action, { formValues: s == null ? void 0 : s.values, formId: s ? "form" : void 0 })) : t && typeof i.href == "string" && /^(https?:\/\/|\/)/.test(i.href) && window.open(i.href, "_blank", "noopener,noreferrer");
  };
  return a.createElement(
    "span",
    { style: { display: "inline-flex", flexDirection: "column", gap: 3 } },
    a.createElement(l.Button || "button", { type: t ? "link" : (r ? o : P(i.variant) === "primary") ? "primary" : "default", size: "small", disabled: Ye(i.disabled), loading: Ye(i.loading), onClick: f }, P(i.label) || "Action"),
    d ? a.createElement("span", { role: "status", style: { fontSize: 11, color: d.ok ? ve.success : ve.error } }, d.message) : null
  );
}
function wi({ node: e, children: t }) {
  var l;
  const r = (l = window.QwenPaw) == null ? void 0 : l.host, n = r == null ? void 0 : r.React;
  if (!n) return null;
  class a extends n.Component {
    constructor(s) {
      super(s), this.state = { hasError: !1 };
    }
    static getDerivedStateFromError() {
      return { hasError: !0 };
    }
    componentDidCatch(s) {
      console.error("[ugsci.genui] Component error for kind '%s':", this.props.node.kind, s);
    }
    render() {
      return this.state.hasError ? n.createElement("div", {
        style: { padding: 8, border: "1px dashed var(--ant-color-error, #ff4d4f)", borderRadius: 8, fontSize: 12, color: ve.error, fontFamily: "monospace" }
      }, `⚠️ Component error: ${this.props.node.kind}`) : this.props.children;
    }
  }
  return n.createElement(a, { node: e }, t);
}
function it({ node: e }) {
  var s;
  const t = (s = window.QwenPaw) == null ? void 0 : s.host;
  if (!(t != null && t.React)) return null;
  const r = t.React, n = t.antd || {}, a = e.props || {}, l = e.children || [], i = () => l.map(
    (o, c) => r.createElement(it, { key: o.nodeId || c, node: o })
  );
  return r.createElement(
    wi,
    { node: e },
    xi(r, n, e, a, l, i)
  );
}
function xi(e, t, r, n, a, l) {
  var i, s;
  switch (r.kind) {
    case "Stack":
      return e.createElement("div", { style: { display: "flex", flexDirection: "column", gap: `${Ce(n.gap) || 12}px`, padding: n.padding ? `${Ce(n.padding)}px` : void 0 } }, l());
    case "Row":
      return e.createElement("div", { style: { display: "flex", flexDirection: "row", gap: `${Ce(n.gap) || 12}px`, alignItems: P(n.align) || void 0, justifyContent: P(n.justify) || void 0 } }, l());
    case "Grid":
      return e.createElement("div", { style: { display: "grid", gridTemplateColumns: `repeat(${Math.min(Math.max(Ce(n.columns) || 2, 1), 6)}, 1fr)`, gap: `${Ce(n.gap) || 12}px` } }, l());
    case "Spacer":
      return e.createElement("div", { style: { height: `${Ce(n.size) || 16}px` } });
    case "ScrollArea":
      return e.createElement("div", { style: { maxHeight: n.maxHeight ? `${Ce(n.maxHeight)}px` : "300px", overflowY: "auto", padding: n.padding ? `${Ce(n.padding)}px` : void 0 } }, l());
    case "AspectBox": {
      const o = P(n.ratio) || "16:9", [c, d] = o.split(":").map(Number), m = c && d ? `${d}/${c}` : "9/16";
      return e.createElement("div", { style: { aspectRatio: m, overflow: "hidden", borderRadius: 8, display: "flex", justifyContent: "center", alignItems: "center" } }, l());
    }
    case "Text":
      return e.createElement("div", { style: { fontSize: Tr[P(n.size)] || Tr.base, color: ve[P(n.color)] || ve.default, fontWeight: Ye(n.bold) ? "bold" : "normal", lineHeight: 1.6 } }, P(n.value));
    case "Heading": {
      const o = Math.min(Math.max(Ce(n.level) || 2, 1), 4), c = { 1: "24px", 2: "20px", 3: "18px", 4: "16px" };
      return e.createElement("div", { style: { fontSize: c[o], fontWeight: "bold", margin: "4px 0" } }, P(n.value));
    }
    case "Divider":
      return e.createElement(t.Divider || "hr", n.label ? { children: P(n.label) } : {});
    case "Markdown": {
      const o = (i = window.QwenPaw) == null ? void 0 : i.host, c = o == null ? void 0 : o.ReactMarkdown;
      if (c) {
        const d = o != null && o.remarkGfm ? [o.remarkGfm] : [];
        return e.createElement(
          "div",
          { className: "qwenpaw-genui-markdown" },
          e.createElement(c, { children: P(n.content || n.value), remarkPlugins: d })
        );
      }
      return e.createElement("div", { style: { whiteSpace: "pre-wrap", lineHeight: 1.6 } }, P(n.content || n.value));
    }
    case "CodeBlock":
      return e.createElement("pre", { style: { padding: 12, background: "var(--ant-color-fill-tertiary, rgba(0,0,0,0.04))", borderRadius: 8, overflow: "auto", fontSize: 13, fontFamily: "monospace" } }, P(n.code));
    case "SectionHeader":
      return e.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8, marginBottom: 8 } }, n.icon ? e.createElement("span", { style: { fontSize: 20 } }, P(n.icon)) : null, e.createElement("div", null, e.createElement("div", { style: { fontSize: 16, fontWeight: 600 } }, P(n.title)), n.subtitle ? e.createElement("div", { style: { fontSize: 12, color: ve.muted } }, P(n.subtitle)) : null));
    case "KeyValueList": {
      const o = qe(n.items);
      return e.createElement(
        "div",
        { style: { display: "flex", flexDirection: "column", gap: 4 } },
        ...o.map((c, d) => e.createElement(
          "div",
          { key: d, style: { display: "flex", justifyContent: "space-between", padding: "2px 0", borderBottom: d < o.length - 1 ? "1px solid var(--ant-color-border-secondary, #f0f0f0)" : "none" } },
          e.createElement("span", { style: { color: ve.muted, fontSize: 13 } }, P(c.key)),
          e.createElement("span", { style: { fontWeight: 500, fontSize: 13 } }, P(c.value))
        ))
      );
    }
    case "Badge":
      return e.createElement(t.Tag || "span", { color: P(n.variant) || "default", children: P(n.value) });
    case "Tag":
      return e.createElement(t.Tag || "span", { color: P(n.color) || "default", children: P(n.label) });
    case "Stat":
      return e.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 2 } }, e.createElement("span", { style: { fontSize: 12, color: ve.muted } }, P(n.label)), e.createElement("span", { style: { fontSize: 20, fontWeight: "bold" } }, P(n.value)), n.delta ? e.createElement("span", { style: { fontSize: 12, color: P(n.trend) === "up" ? ve.success : P(n.trend) === "down" ? ve.error : ve.muted } }, P(n.delta)) : null);
    case "Progress":
      return e.createElement(t.Progress || "div", { percent: Ce(n.value), size: "small" });
    case "Skeleton": {
      const o = Ce(n.rows) || 3;
      return e.createElement(
        "div",
        { style: { display: "flex", flexDirection: "column", gap: 8 } },
        ...Array.from({ length: o }).map(
          (c, d) => e.createElement(t.Skeleton || "div", { key: d, active: Ye(n.active), title: !1, paragraph: { rows: 1 } })
        )
      );
    }
    case "Avatar":
      return e.createElement(_r, {
        src: P(n.src),
        name: P(n.name),
        size: Ce(n.size) || 32
      });
    case "Icon":
      return e.createElement("span", { style: { fontSize: Ce(n.size) || 16, color: ve[P(n.color)] || ve.default } }, P(n.name));
    case "Card":
      return e.createElement(t.Card || "div", { title: n.title ? P(n.title) : void 0, size: "small", style: { margin: "4px 0" } }, l());
    case "DataCard":
      return e.createElement(t.Card || "div", { size: "small", style: { margin: "4px 0" } }, e.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center" } }, e.createElement("div", null, e.createElement("div", { style: { fontSize: 12, color: ve.muted } }, P(n.title)), e.createElement("div", { style: { fontSize: 24, fontWeight: "bold" } }, P(n.value))), n.icon ? e.createElement("span", { style: { fontSize: 32 } }, P(n.icon)) : null));
    case "MetricCard":
      return e.createElement(t.Card || "div", { size: "small", style: { margin: "4px 0" } }, e.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center" } }, e.createElement("div", null, e.createElement("div", { style: { fontSize: 12, color: ve.muted } }, P(n.title)), e.createElement("div", { style: { fontSize: 24, fontWeight: "bold" } }, P(n.value)), n.delta ? e.createElement("span", { style: { fontSize: 12, color: P(n.trend) === "up" ? ve.success : P(n.trend) === "down" ? ve.error : ve.muted } }, `${P(n.delta)} ${n.period ? P(n.period) : ""}`.trim()) : null), n.icon ? e.createElement("span", { style: { fontSize: 32 } }, P(n.icon)) : null));
    case "AlertCard":
    case "Alert":
      return e.createElement(t.Alert || "div", { type: P(n.severity) === "success" ? "success" : P(n.severity) === "warning" ? "warning" : P(n.severity) === "error" ? "error" : "info", message: n.title ? P(n.title) : void 0, description: P(n.message), showIcon: !0, style: { margin: "4px 0" } });
    case "Callout":
      return e.createElement(t.Alert || "div", { type: P(n.variant) === "tip" ? "success" : P(n.variant) === "warning" ? "warning" : P(n.variant) === "important" ? "error" : "info", message: n.title ? P(n.title) : void 0, description: P(n.message), showIcon: !0 });
    case "WeatherCard":
      return e.createElement(t.Card || "div", { size: "small", style: { margin: "4px 0", display: "flex", alignItems: "center", gap: 16 } }, n.icon ? e.createElement("span", { style: { fontSize: 40 } }, P(n.icon)) : null, e.createElement("div", null, e.createElement("div", { style: { fontSize: 24, fontWeight: "bold" } }, P(n.temperature)), e.createElement("div", { style: { color: ve.muted } }, P(n.condition)), e.createElement("div", { style: { fontSize: 12, color: ve.muted } }, P(n.location))));
    case "ProfileCard":
      return e.createElement(t.Card || "div", { size: "small", style: { margin: "4px 0" } }, e.createElement("div", { style: { display: "flex", gap: 12, alignItems: "center" } }, e.createElement(_r, { src: P(n.avatar), name: P(n.name), size: 48 }), e.createElement("div", null, e.createElement("div", { style: { fontWeight: 600 } }, P(n.name)), e.createElement("div", { style: { fontSize: 12, color: ve.muted } }, P(n.role)), n.bio ? e.createElement("div", { style: { fontSize: 12, marginTop: 4 } }, P(n.bio)) : null)));
    case "MediaCard":
      return e.createElement(t.Card || "div", { size: "small", style: { margin: "4px 0", overflow: "hidden" } }, e.createElement(Rt, { src: P(n.src), alt: P(n.title), style: { width: "100%", maxHeight: 200, objectFit: "cover" } }), e.createElement("div", { style: { padding: "8px 12px" } }, e.createElement("div", { style: { fontWeight: 600 } }, P(n.title)), n.caption ? e.createElement("div", { style: { fontSize: 12, color: ve.muted } }, P(n.caption)) : null));
    case "QuoteCard":
      return e.createElement(t.Card || "div", { size: "small", style: { margin: "4px 0", fontStyle: "italic" } }, e.createElement("div", { style: { fontSize: 14, lineHeight: 1.6 } }, `"${P(n.quote)}"`), e.createElement("div", { style: { fontSize: 12, color: ve.muted, marginTop: 8 } }, `— ${P(n.author)}${n.role ? `, ${P(n.role)}` : ""}`));
    case "TimelineCard":
      return e.createElement(t.Card || "div", { size: "small", style: { margin: "4px 0" } }, e.createElement("div", { style: { display: "flex", gap: 8, alignItems: "flex-start" } }, e.createElement("div", { style: { width: 8, height: 8, borderRadius: "50%", background: P(n.status) === "done" ? ve.success : P(n.status) === "pending" ? ve.warning : ve.primary, marginTop: 4, flexShrink: 0 } }), e.createElement("div", null, e.createElement("div", { style: { fontWeight: 600 } }, P(n.title)), n.date ? e.createElement("div", { style: { fontSize: 12, color: ve.muted } }, P(n.date)) : null, n.description ? e.createElement("div", { style: { fontSize: 13, marginTop: 4 } }, P(n.description)) : null)));
    case "KpiBoard":
      return e.createElement("div", { style: { margin: "4px 0" } }, n.title ? e.createElement("div", { style: { fontSize: 16, fontWeight: 600, marginBottom: 8 } }, P(n.title)) : null, e.createElement("div", { style: { display: "grid", gridTemplateColumns: `repeat(${Math.min(Math.max(Ce(n.columns) || 3, 1), 6)}, 1fr)`, gap: 12 } }, l()));
    case "FeatureGrid":
      return e.createElement("div", { style: { display: "grid", gridTemplateColumns: `repeat(${Math.min(Math.max(Ce(n.columns) || 2, 1), 4)}, 1fr)`, gap: `${Ce(n.gap) || 12}px`, margin: "4px 0" } }, l());
    case "Stepper": {
      const o = qe(n.steps).map((d) => P(d)), c = Ce(n.current);
      return e.createElement(
        t.Steps || "div",
        { current: c, size: "small", style: { margin: "4px 0" } },
        ...o.map((d, m) => {
          var f;
          return e.createElement(((f = t.Steps) == null ? void 0 : f.Item) || "div", { key: m, title: d });
        })
      );
    }
    case "Table": {
      const o = qe(n.headers).map((f) => P(f)), d = a.filter((f) => f.kind === "TableRow").map((f, u) => {
        const p = (f.children || []).filter((h) => h.kind === "TableCell"), y = { key: u };
        return o.forEach((h, S) => {
          var x, E;
          const k = (E = (x = p[S]) == null ? void 0 : x.props) == null ? void 0 : E.value;
          y[h] = k == null ? "" : P(k);
        }), y;
      }), m = o.map((f) => ({ title: f, dataIndex: f, key: f }));
      return e.createElement(t.Table || "table", { dataSource: d, columns: m, size: Ye(n.compact) ? "small" : "middle", pagination: !1, style: { margin: "4px 0" } });
    }
    case "List": {
      const o = a.filter((c) => c.kind === "ListItem");
      return e.createElement(
        t.List || "ul",
        { size: "small", style: { margin: "4px 0" } },
        o.map((c, d) => {
          var m, f, u;
          return e.createElement(((m = t.List) == null ? void 0 : m.Item) || "li", { key: d }, (f = c.props) != null && f.icon ? e.createElement("span", { style: { marginRight: 6 } }, P(c.props.icon)) : null, P((u = c.props) == null ? void 0 : u.value));
        })
      );
    }
    case "ImageGallery": {
      const o = a.filter((c) => c.kind === "Image");
      return e.createElement(
        "div",
        { style: { display: "grid", gridTemplateColumns: `repeat(${Math.min(Math.max(Ce(n.columns) || 3, 1), 6)}, 1fr)`, gap: `${Ce(n.gap) || 8}px`, margin: "4px 0" } },
        ...o.map((c, d) => {
          const m = c.props || {};
          return e.createElement(Rt, { key: d, src: P(m.src), alt: P(m.alt), style: { width: "100%", height: 120, objectFit: "cover", borderRadius: 8, cursor: "pointer" } });
        })
      );
    }
    case "Image":
      return e.createElement("div", null, e.createElement(Rt, { src: P(n.src), alt: P(n.alt), style: { maxWidth: "100%", borderRadius: Ye(n.rounded) ? "8px" : void 0, maxHeight: n.maxHeight ? `${Ce(n.maxHeight)}px` : void 0 } }), n.caption ? e.createElement("div", { style: { fontSize: 12, color: ve.muted } }, P(n.caption)) : null);
    case "Chart":
      return e.createElement(Si, { props: n });
    case "Button":
    case "InteractiveButton":
      return e.createElement(on, { node: r });
    case "ToggleButton":
      return e.createElement(on, { node: r, toggle: !0 });
    case "LinkButton":
      return e.createElement(on, { node: r, link: !0 });
    case "Input":
    case "NumberInput":
    case "Select":
    case "Textarea":
    case "Switch":
    case "Slider":
    case "FileInput":
      return e.createElement(bi, { node: r, fieldType: r.kind });
    case "Form":
      return e.createElement(vi, { node: r });
    case "Chip":
      return e.createElement(t.Tag || "span", { color: P(n.color) || "default", closable: !0, onClose: () => {
      }, children: P(n.label) });
    case "ChipGroup": {
      const o = qe(n.items);
      return e.createElement("div", { style: { display: "flex", flexWrap: "wrap", gap: 4 } }, ...o.map((c, d) => e.createElement(t.Tag || "span", { key: d }, P(c))));
    }
    case "Tabs": {
      const c = a.filter((d) => d.kind === "TabItem").map((d) => {
        var m, f, u;
        return {
          key: P((m = d.props) == null ? void 0 : m.key) || P((f = d.props) == null ? void 0 : f.tab),
          label: P((u = d.props) == null ? void 0 : u.tab),
          children: (d.children || []).map((p, y) => e.createElement(it, { key: p.nodeId || y, node: p }))
        };
      });
      return t.Tabs ? e.createElement(t.Tabs, { items: c, defaultActiveKey: P(n.activeKey) || ((s = c[0]) == null ? void 0 : s.key) }) : e.createElement("div", null, ...c.map((d, m) => e.createElement("div", { key: m }, e.createElement("div", { style: { fontWeight: 600, marginBottom: 4 } }, d.label), d.children)));
    }
    case "TabItem":
      return e.createElement("div", null, l());
    case "Accordion": {
      const o = a.filter((c) => c.kind === "AccordionItem");
      if (t.Collapse) {
        const c = o.map((d) => {
          var m, f, u;
          return {
            key: P((m = d.props) == null ? void 0 : m.key) || P((f = d.props) == null ? void 0 : f.header),
            label: P((u = d.props) == null ? void 0 : u.header),
            children: (d.children || []).map((p, y) => e.createElement(it, { key: p.nodeId || y, node: p }))
          };
        });
        return e.createElement(t.Collapse, { items: c });
      }
      return e.createElement("div", null, ...o.map((c, d) => {
        var m;
        return e.createElement("details", { key: d }, e.createElement("summary", { style: { fontWeight: 600, cursor: "pointer", padding: "4px 0" } }, P((m = c.props) == null ? void 0 : m.header)), e.createElement("div", { style: { paddingLeft: 12 } }, (c.children || []).map((f, u) => e.createElement(it, { key: f.nodeId || u, node: f }))));
      }));
    }
    case "AccordionItem":
      return e.createElement("div", null, l());
    case "JsonDebug":
      return e.createElement("details", { style: { margin: "4px 0", fontSize: 12 } }, e.createElement("summary", null, P(n.label) || "Debug JSON"), e.createElement("pre", { style: { fontSize: 12, padding: 8, background: "var(--ant-color-fill-tertiary, rgba(0,0,0,0.04))", borderRadius: 4, overflow: "auto" } }, JSON.stringify(n.data ?? n, null, 2)));
    default:
      return e.createElement("div", { style: { padding: 8, border: "1px dashed var(--ant-color-border, #d9d9d9)", borderRadius: 8, fontSize: 12, color: ve.muted, fontFamily: "monospace" } }, `Unknown component: ${r.kind}`);
  }
}
const at = ["#1677ff", "#52c41a", "#faad14", "#ff4d4f", "#722ed1", "#13c2c2", "#eb2f96"];
function Si({ props: e }) {
  var X, H;
  const t = (H = (X = window.QwenPaw) == null ? void 0 : X.host) == null ? void 0 : H.React;
  if (!t) return null;
  const r = t.useContext(Kt(t)), n = P(e.chart) || "line", a = P(e.title);
  let l = qe(e.categories).map((b) => P(b)), i = qe(e.series);
  const s = Ce(e.height) || 200, o = e.showLegend !== !1, c = 400, d = e.generator && typeof e.generator == "object" ? e.generator : {}, m = qe(d.coefficients).map(P), f = ["a", "b", "c", "d", "e"], u = m.length > 0 ? m : f;
  if ((P(d.type) === "polynomial" || m.length > 0 || f.every((b) => {
    var v;
    return ((v = r == null ? void 0 : r.values) == null ? void 0 : v[b]) !== void 0;
  })) && r) {
    const b = typeof d.xMin == "number" ? d.xMin : -3, v = typeof d.xMax == "number" ? d.xMax : 3, _ = Math.min(Math.max(Ce(d.samples) || 61, 10), 400), I = Array.from({ length: _ }, ($, O) => b + (v - b) * O / (_ - 1)), U = u.map(($) => {
      var O;
      return Ce((O = r.values) == null ? void 0 : O[$]);
    });
    l = I.map(($) => Number($.toFixed(2)).toString()), i = [{ name: P(d.label) || "f(x)", values: I.map(($) => U.reduce((O, z, w) => O + z * Math.pow($, U.length - w - 1), 0)) }];
  }
  const y = i.map((b, v) => {
    const _ = b, I = qe(_.values).map((U) => Ce(U));
    return { name: P(_.name) || `Series ${v + 1}`, values: I };
  });
  if (l.length === 0 || y.length === 0)
    return t.createElement("div", { style: { padding: 12, color: ve.muted, fontSize: 12 } }, "Chart: no data");
  if (n === "pie") {
    const b = y[0].values.map((z) => Math.abs(z)), v = b.reduce((z, w) => z + w, 0) || 1, _ = c / 2, I = s / 2, U = Math.min(c, s) / 2 - 20;
    let $ = -Math.PI / 2;
    const O = b.map((z, w) => {
      const le = z / v * 2 * Math.PI, oe = _ + U * Math.cos($), B = I + U * Math.sin($), R = _ + U * Math.cos($ + le), ne = I + U * Math.sin($ + le), Z = le > Math.PI ? 1 : 0, W = `M ${_} ${I} L ${oe} ${B} A ${U} ${U} 0 ${Z} 1 ${R} ${ne} Z`;
      return $ += le, { path: W, color: at[w % at.length], label: l[w] || `#${w + 1}`, val: z };
    });
    return t.createElement(
      "div",
      { style: { margin: "4px 0" } },
      a ? t.createElement("div", { style: { fontSize: 13, fontWeight: 600, marginBottom: 4 } }, a) : null,
      t.createElement(
        "svg",
        { width: c, height: s, style: { maxWidth: "100%" } },
        ...O.map((z, w) => t.createElement("path", { key: w, d: z.path, fill: z.color, stroke: "#fff", strokeWidth: 1 }))
      ),
      o ? t.createElement(
        "div",
        { style: { display: "flex", flexWrap: "wrap", gap: 8, marginTop: 4, fontSize: 11 } },
        ...O.map((z, w) => t.createElement(
          "span",
          { key: w, style: { display: "flex", alignItems: "center", gap: 4 } },
          t.createElement("span", { style: { display: "inline-block", width: 10, height: 10, borderRadius: 2, background: z.color } }),
          `${z.label}: ${z.val}`
        ))
      ) : null
    );
  }
  const h = y.flatMap((b) => b.values), S = Math.max(...h, 0), k = Math.min(...h, 0), x = S - k || 1, E = l.length > 0 ? (c - 40) / l.length : 0, L = y.length > 0 ? Math.max(1, E / y.length - 2) : 0, D = l.length > 1 ? (c - 40) / (l.length - 1) : 0, F = Math.max(1, Math.ceil(l.length / 8)), G = (b) => s - 20 - (b - k) / x * (s - 40), j = G(0), K = (b) => 30 + b * D;
  return t.createElement(
    "div",
    { style: { margin: "4px 0" } },
    a ? t.createElement("div", { style: { fontSize: 13, fontWeight: 600, marginBottom: 4 } }, a) : null,
    t.createElement(
      "svg",
      { width: c, height: s, style: { maxWidth: "100%" } },
      ...[0, 0.25, 0.5, 0.75, 1].map((b, v) => {
        const _ = s - 20 - b * (s - 40);
        return t.createElement("line", { key: `g${v}`, x1: 30, y1: _, x2: c - 10, y2: _, stroke: "var(--ant-color-border-secondary, #f0f0f0)", strokeWidth: 1 });
      }),
      ...l.map((b, v) => v % F === 0 || v === l.length - 1 ? t.createElement("text", { key: `x${v}`, x: K(v), y: s - 6, fontSize: 10, fill: ve.muted, textAnchor: "middle" }, b.length > 6 ? b.slice(0, 6) + "…" : b) : null),
      ...y.map((b, v) => {
        const _ = at[v % at.length];
        if (n === "bar")
          return b.values.map(($, O) => t.createElement("rect", {
            key: `b${v}-${O}`,
            x: 30 + O * E + v * (L + 2) + 1,
            y: Math.min(G($), j),
            width: L,
            height: Math.abs(j - G($)),
            fill: _,
            rx: 2
          }));
        const I = b.values.map(($, O) => `${K(O)},${G($)}`).join(" "), U = [t.createElement("polyline", { key: `l${v}`, points: I, fill: "none", stroke: _, strokeWidth: 2 })];
        if (n === "area") {
          const $ = `${K(0)},${s - 20} ${I} ${K(b.values.length - 1)},${s - 20}`;
          U.unshift(t.createElement("polygon", { key: `a${v}`, points: $, fill: _, opacity: 0.15 }));
        }
        return U;
      })
    ),
    o ? t.createElement(
      "div",
      { style: { display: "flex", flexWrap: "wrap", gap: 8, marginTop: 4, fontSize: 11 } },
      ...y.map((b, v) => t.createElement(
        "span",
        { key: v, style: { display: "flex", alignItems: "center", gap: 4 } },
        t.createElement("span", { style: { display: "inline-block", width: 10, height: 10, borderRadius: 2, background: at[v % at.length] } }),
        b.name
      ))
    ) : null
  );
}
function Rt(e) {
  var c;
  const t = (c = window.QwenPaw) == null ? void 0 : c.host, r = t == null ? void 0 : t.React;
  if (!r) return null;
  const { useState: n, useEffect: a } = r, [l, i] = n(
    Sr(e.src) || (Dt(e.src) ? e.src : null)
  ), [s, o] = n(
    kr(e.src)
  );
  return a(() => {
    if (!e.src) return;
    if (Dt(e.src)) {
      i(e.src), o(null);
      return;
    }
    const d = Sr(e.src);
    if (d) {
      i(d), o(null);
      return;
    }
    i(null), o(null);
    let m = !1;
    return pi(e.src).then((f) => {
      m || (i(f), o(f ? null : kr(e.src)));
    }), () => {
      m = !0;
    };
  }, [e.src]), l ? r.createElement("img", {
    src: l,
    alt: e.alt || "",
    "data-genui-media-source": e.src,
    style: e.style || {},
    onError: () => {
      console.warn("[ugsci.genui] Image failed to load:", e.src);
    }
  }) : r.createElement(
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
        color: s ? ve.error : ve.muted,
        fontSize: 12,
        background: "var(--ant-color-fill-tertiary, rgba(0,0,0,0.04))",
        borderRadius: 8
      }
    },
    s ? `媒体加载失败：${s}` : "正在解析图片…"
  );
}
function _r(e) {
  var a, l, i;
  const t = (a = window.QwenPaw) == null ? void 0 : a.host, r = t == null ? void 0 : t.React, n = (t == null ? void 0 : t.antd) || {};
  return r ? e.src ? r.createElement(Rt, {
    src: e.src,
    alt: e.name,
    style: {
      width: e.size,
      height: e.size,
      borderRadius: "50%",
      objectFit: "cover"
    }
  }) : r.createElement(
    n.Avatar || "div",
    { size: e.size },
    ((i = (l = e.name) == null ? void 0 : l.charAt(0)) == null ? void 0 : i.toUpperCase()) || ""
  ) : null;
}
async function ki(e, t) {
  var d;
  const r = e.getBoundingClientRect(), n = Math.min(window.devicePixelRatio || 1, 2), a = document.createElement("canvas");
  a.width = Math.ceil(r.width * n), a.height = Math.ceil(Math.max(r.height, e.scrollHeight) * n);
  const l = a.getContext("2d");
  if (!l) throw new Error("canvas is unavailable");
  l.scale(n, n), l.fillStyle = "#fff", l.fillRect(0, 0, a.width, a.height);
  for (const m of Array.from(e.querySelectorAll("*"))) {
    const f = m.getBoundingClientRect();
    if (!f.width || !f.height) continue;
    const u = getComputedStyle(m), p = f.left - r.left, y = f.top - r.top;
    u.backgroundColor && u.backgroundColor !== "rgba(0, 0, 0, 0)" && (l.fillStyle = u.backgroundColor, l.fillRect(p, y, f.width, f.height)), u.borderTopWidth !== "0px" && (l.strokeStyle = u.borderTopColor, l.strokeRect(p, y, f.width, f.height));
  }
  const i = document.createTreeWalker(e, NodeFilter.SHOW_TEXT);
  for (; i.nextNode(); ) {
    const m = i.currentNode, f = (d = m.textContent) == null ? void 0 : d.trim();
    if (!f) continue;
    const u = document.createRange();
    u.selectNodeContents(m);
    const p = u.getBoundingClientRect(), y = m.parentElement;
    if (!y || !p.width) continue;
    const h = getComputedStyle(y);
    l.font = `${h.fontWeight} ${h.fontSize} ${h.fontFamily}`, l.fillStyle = h.color || "#111", l.textBaseline = "top", l.fillText(f, p.left - r.left, p.top - r.top, Math.max(1, r.width - (p.left - r.left)));
  }
  for (const m of Array.from(e.querySelectorAll("input,textarea"))) {
    if (!m.value) continue;
    const f = m.getBoundingClientRect(), u = getComputedStyle(m);
    l.font = `${u.fontSize} ${u.fontFamily}`, l.fillStyle = u.color || "#111", l.fillText(m.value, f.left - r.left + 8, f.top - r.top + 6);
  }
  const s = await new Promise((m, f) => a.toBlob((u) => u ? m(u) : f(new Error("PNG encoding failed")), "image/png")), o = URL.createObjectURL(s), c = document.createElement("a");
  c.download = `${t}.png`, c.href = o, c.click(), setTimeout(() => URL.revokeObjectURL(o), 1e3), console.info("[ugsci.genui] PNG export created", { filename: t, bytes: s.size });
}
function Ci(e) {
  return e.replace(/[&<>\"']/g, (t) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[t] || t);
}
function sn(e) {
  return JSON.stringify(e).replace(/</g, "\\u003c");
}
function Ti(e) {
  return new Promise((t, r) => {
    const n = new FileReader();
    n.onload = () => t(String(n.result || "")), n.onerror = () => r(n.error || new Error("media encoding failed")), n.readAsDataURL(e);
  });
}
async function _i(e) {
  const t = e.currentSrc || e.src;
  if (!t) return null;
  if (t.startsWith("data:")) return t;
  try {
    const r = await fetch(t);
    return r.ok ? await Ti(await r.blob()) : null;
  } catch {
    try {
      const r = document.createElement("canvas");
      r.width = e.naturalWidth, r.height = e.naturalHeight;
      const n = r.getContext("2d");
      return !n || !r.width || !r.height ? null : (n.drawImage(e, 0, 0), r.toDataURL("image/png"));
    } catch {
      return null;
    }
  }
}
async function Ii(e) {
  const t = {}, r = [], n = Array.from(e.querySelectorAll("img[data-genui-media-source]"));
  return await Promise.all(n.map(async (a) => {
    const l = a.dataset.genuiMediaSource || "", i = await _i(a);
    l && (i ? t[l] = i : r.push(l));
  })), { sources: t, missing: Array.from(new Set(r)) };
}
const zi = String.raw`
(function () {
  "use strict";
  var tree = JSON.parse(document.getElementById("genui-tree-data").textContent || "null");
  var values = JSON.parse(document.getElementById("genui-values-data").textContent || "{}");
  var mediaPayload = JSON.parse(document.getElementById("genui-media-data").textContent || "{}");
  var media = mediaPayload.sources || {};
  var missingMedia = mediaPayload.missing || [];
  var root = document.getElementById("genui-root");
  var charts = [];
  var text = function (v) { return typeof v === "string" ? v : v == null ? "" : String(v); };
  var number = function (v) { var x = Number(v); return Number.isFinite(x) ? x : 0; };
  var array = function (v) { return Array.isArray(v) ? v : []; };
  function fieldName(node) {
    var p = node.props || {};
    if (p.name != null && text(p.name)) return text(p.name);
    var label = text(p.label);
    var match = label.match(/^\s*([a-e])(?:\b|\s|（|\()/i);
    return match ? match[1].toLowerCase() : label || node.nodeId;
  }
  function node(tag, className, content) {
    var result = document.createElement(tag);
    if (className) result.className = className;
    if (content != null) result.textContent = text(content);
    return result;
  }
  function appendChildren(target, children) {
    array(children).forEach(function (child) { target.appendChild(render(child)); });
    return target;
  }
  function labelValue(target, label, value) {
    if (label) target.appendChild(node("div", "muted small", label));
    target.appendChild(node("div", "display-value", value));
    return target;
  }
  function mediaImage(source, alt, className) {
    source = text(source);
    if (missingMedia.indexOf(source) >= 0) {
      var fallback = node("div", "media-unavailable " + (className || ""), "此媒体未能离线嵌入");
      fallback.setAttribute("role", "img"); fallback.setAttribute("aria-label", text(alt));
      return fallback;
    }
    var image = node("img", className || "");
    image.src = media[source] || source;
    image.alt = text(alt);
    return image;
  }
  function markdown(value) {
    var source = text(value), target = node("div", "markdown"), lines = source.split(/\r?\n/), list = null;
    lines.forEach(function (line) {
      var heading = line.match(/^(#{1,4})\s+(.*)$/), item = line.match(/^\s*[-*]\s+(.*)$/);
      if (heading) { list = null; target.appendChild(node("h" + heading[1].length, "", heading[2])); }
      else if (item) { if (!list) { list = node("ul"); target.appendChild(list); } list.appendChild(node("li", "", item[1])); }
      else if (!line.trim()) { list = null; target.appendChild(node("br")); }
      else { list = null; target.appendChild(node("p", "", line)); }
    });
    return target;
  }
  function field(source) {
    var p = source.props || {}, kind = source.kind, name = fieldName(source);
    var shell = node("label", "field");
    if (p.label && kind !== "Switch") shell.appendChild(node("span", "field-label", text(p.label) + (p.required ? " *" : "")));
    var control;
    if (kind === "Textarea") {
      control = node("textarea"); control.rows = number(p.rows) || 3; control.placeholder = text(p.placeholder);
    } else if (kind === "Select") {
      control = node("select");
      array(p.options).forEach(function (option) {
        var item = node("option");
        item.value = typeof option === "object" && option ? text(option.value) : text(option);
        item.textContent = typeof option === "object" && option ? text(option.label) : text(option);
        control.appendChild(item);
      });
    } else {
      control = node("input");
      control.type = kind === "Slider" ? "range" : kind === "Switch" ? "checkbox" : kind === "NumberInput" ? "number" : kind === "FileInput" ? "file" : "text";
      if (p.min != null) control.min = text(p.min); if (p.max != null) control.max = text(p.max); if (p.step != null) control.step = text(p.step);
      if (kind === "FileInput") { if (p.accept) control.accept = text(p.accept); control.multiple = Boolean(p.multiple); }
      else control.placeholder = text(p.placeholder);
    }
    var initial = Object.prototype.hasOwnProperty.call(values, name) ? values[name] : (p.value != null ? p.value : p.checked != null ? p.checked : "");
    if (kind === "Switch") control.checked = Boolean(initial); else if (kind !== "FileInput") control.value = text(initial);
    var valueLabel = kind === "Slider" ? node("output", "slider-value", initial) : null;
    var update = function () {
      if (kind === "Switch") values[name] = control.checked;
      else if (kind === "NumberInput" || kind === "Slider") values[name] = number(control.value);
      else if (kind === "FileInput") values[name] = Array.prototype.map.call(control.files || [], function (file) { return { name: file.name, size: file.size, type: file.type }; });
      else values[name] = control.value;
      if (valueLabel) valueLabel.textContent = text(values[name]);
      renderCharts();
    };
    control.addEventListener(kind === "Select" || kind === "Switch" || kind === "FileInput" ? "change" : "input", update);
    if (kind === "Switch") { var line = node("span", "switch-line"); line.append(control, node("span", "", p.label)); shell.appendChild(line); }
    else if (kind === "Slider") { var slider = node("span", "slider-line"); slider.append(control, valueLabel); shell.appendChild(slider); }
    else shell.appendChild(control);
    if (p.description) shell.appendChild(node("small", "description", p.description));
    return shell;
  }
  function chart(source) {
    var holder = node("div", "chart");
    charts.push({ holder: holder, props: source.props || {} });
    return holder;
  }
  function renderChart(target, p) {
    target.replaceChildren();
    if (p.title) target.appendChild(node("div", "chart-title", p.title));
    var categories = array(p.categories).map(text), raw = array(p.series), generator = p.generator && typeof p.generator === "object" ? p.generator : {};
    var coefficientNames = array(generator.coefficients).map(text);
    if (text(generator.type) === "polynomial" || coefficientNames.length) {
      var names = coefficientNames.length ? coefficientNames : ["a", "b", "c", "d", "e"];
      var xmin = typeof generator.xMin === "number" ? generator.xMin : -3, xmax = typeof generator.xMax === "number" ? generator.xMax : 3;
      var samples = Math.min(Math.max(number(generator.samples) || 61, 10), 400), xs = [];
      for (var i = 0; i < samples; i++) xs.push(xmin + (xmax - xmin) * i / (samples - 1));
      var coefficients = names.map(function (name) { return number(values[name]); });
      categories = xs.map(function (x) { return String(Number(x.toFixed(2))); });
      raw = [{ name: text(generator.label) || "f(x)", values: xs.map(function (x) { return coefficients.reduce(function (sum, coefficient, index) { return sum + coefficient * Math.pow(x, coefficients.length - index - 1); }, 0); }) }];
    }
    var series = raw.map(function (item, index) { item = item || {}; return { name: text(item.name) || "Series " + (index + 1), values: array(item.values).map(number) }; });
    if (!categories.length || !series.length) { target.appendChild(node("div", "muted", "Chart: no data")); return; }
    var width = 640, height = number(p.height) || 240, svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 " + width + " " + height); svg.setAttribute("role", "img"); svg.setAttribute("aria-label", text(p.title) || "Chart");
    var colors = ["#1677ff", "#52c41a", "#faad14", "#ff4d4f", "#722ed1"];
    if (text(p.chart) === "pie") {
      var pieValues = series[0].values.map(function (v) { return Math.abs(v); }), total = pieValues.reduce(function (sum, value) { return sum + value; }, 0) || 1;
      var cx = width / 2, cy = height / 2, radius = Math.min(width, height) / 2 - 20, angle = -Math.PI / 2;
      pieValues.forEach(function (value, index) { var sweep = value / total * Math.PI * 2, x1 = cx + radius * Math.cos(angle), y1 = cy + radius * Math.sin(angle), x2 = cx + radius * Math.cos(angle + sweep), y2 = cy + radius * Math.sin(angle + sweep); var path = document.createElementNS(svg.namespaceURI, "path"); path.setAttribute("d", "M " + cx + " " + cy + " L " + x1 + " " + y1 + " A " + radius + " " + radius + " 0 " + (sweep > Math.PI ? 1 : 0) + " 1 " + x2 + " " + y2 + " Z"); path.setAttribute("fill", colors[index % colors.length]); path.setAttribute("data-slice", categories[index] || String(index)); svg.appendChild(path); angle += sweep; });
      target.appendChild(svg);
      if (p.showLegend !== false) { var pieLegend = node("div", "legend"); pieValues.forEach(function (value, i) { var entry = node("span"), dot = node("i"); dot.style.background = colors[i % colors.length]; entry.append(dot, document.createTextNode((categories[i] || "#" + (i + 1)) + ": " + value)); pieLegend.appendChild(entry); }); target.appendChild(pieLegend); }
      return;
    }
    var all = [].concat.apply([], series.map(function (item) { return item.values; })), max = Math.max.apply(Math, all.concat([0])), min = Math.min.apply(Math, all.concat([0])), range = max - min || 1;
    var y = function (v) { return height - 24 - ((v - min) / range) * (height - 44); }, x = function (i) { return 30 + i * (width - 50) / Math.max(categories.length - 1, 1); };
    var axis = document.createElementNS(svg.namespaceURI, "line"); axis.setAttribute("x1", "30"); axis.setAttribute("x2", String(width - 15)); axis.setAttribute("y1", String(y(0))); axis.setAttribute("y2", String(y(0))); axis.setAttribute("stroke", "#d9d9d9"); svg.appendChild(axis);
    series.forEach(function (item, seriesIndex) {
      if (text(p.chart) === "bar") {
        var groupWidth = (width - 50) / Math.max(categories.length, 1), barWidth = Math.max(1, groupWidth / series.length - 3);
        item.values.forEach(function (value, index) { var rect = document.createElementNS(svg.namespaceURI, "rect"), top = Math.min(y(value), y(0)), bottom = Math.max(y(value), y(0)); rect.setAttribute("x", String(30 + index * groupWidth + seriesIndex * (barWidth + 2))); rect.setAttribute("y", String(top)); rect.setAttribute("width", String(barWidth)); rect.setAttribute("height", String(Math.max(1, bottom - top))); rect.setAttribute("fill", colors[seriesIndex % colors.length]); rect.setAttribute("data-series", item.name); svg.appendChild(rect); });
      } else {
        var points = item.values.map(function (v, i) { return x(i) + "," + y(v); }).join(" ");
        var line = document.createElementNS(svg.namespaceURI, "polyline"); line.setAttribute("points", points); line.setAttribute("fill", text(p.chart) === "area" ? colors[seriesIndex % colors.length] + "22" : "none"); line.setAttribute("stroke", colors[seriesIndex % colors.length]); line.setAttribute("stroke-width", "2"); line.setAttribute("data-series", item.name); svg.appendChild(line);
      }
    });
    target.appendChild(svg);
    if (p.showLegend !== false) { var legend = node("div", "legend"); series.forEach(function (item, i) { var entry = node("span"); var dot = node("i"); dot.style.background = colors[i % colors.length]; entry.append(dot, document.createTextNode(item.name)); legend.appendChild(entry); }); target.appendChild(legend); }
  }
  function renderCharts() { charts.forEach(function (item) { renderChart(item.holder, item.props); }); }
  function render(source) {
    if (!source || typeof source !== "object") return node("div");
    var p = source.props || {}, children = source.children || [], result;
    if (["Input", "NumberInput", "Select", "Textarea", "Switch", "Slider", "FileInput"].indexOf(source.kind) >= 0) return field(source);
    if (source.kind === "Chart") return chart(source);
    if (source.kind === "Heading") { result = node("h" + Math.min(Math.max(number(p.level) || 2, 1), 4), "", p.value); return result; }
    if (source.kind === "Text") return node("div", p.bold ? "text bold" : "text", p.value);
    if (source.kind === "Markdown") return markdown(p.content || p.value);
    if (source.kind === "CodeBlock") return node("pre", "code", p.code);
    if (source.kind === "SectionHeader") { result = node("div", "section-header"); if (p.icon) result.appendChild(node("span", "section-icon", p.icon)); var sectionText = node("div"); sectionText.appendChild(node("strong", "", p.title)); if (p.subtitle) sectionText.appendChild(node("div", "muted small", p.subtitle)); result.appendChild(sectionText); return result; }
    if (source.kind === "KeyValueList") { result = node("dl", "key-values"); array(p.items).forEach(function (item) { item = item || {}; result.append(node("dt", "", item.key), node("dd", "", item.value)); }); return result; }
    if (source.kind === "Divider") { result = node("div", "divider"); if (p.label) result.appendChild(node("span", "", p.label)); return result; }
    if (source.kind === "Spacer") { result = node("div"); result.style.height = (number(p.size) || 16) + "px"; return result; }
    if (source.kind === "Tabs") {
      result = node("div", "tabs"); var buttons = node("div", "tab-buttons"), panels = node("div"); var tabs = children.filter(function (c) { return c.kind === "TabItem"; });
      tabs.forEach(function (tab, index) { var button = node("button", index ? "" : "active", tab.props && tab.props.tab); var panel = appendChildren(node("div", index ? "tab-panel hidden" : "tab-panel"), tab.children); button.addEventListener("click", function () { Array.prototype.forEach.call(buttons.children, function (b) { b.classList.remove("active"); }); Array.prototype.forEach.call(panels.children, function (p) { p.classList.add("hidden"); }); button.classList.add("active"); panel.classList.remove("hidden"); }); buttons.appendChild(button); panels.appendChild(panel); }); result.append(buttons, panels); return result;
    }
    if (source.kind === "Accordion") { result = node("div"); children.filter(function (c) { return c.kind === "AccordionItem"; }).forEach(function (item) { var details = node("details"); details.append(node("summary", "", item.props && item.props.header), appendChildren(node("div", "accordion-body"), item.children)); result.appendChild(details); }); return result; }
    if (source.kind === "Form") {
      result = node("div", "stack form");
      if (p.title) result.appendChild(node("div", "card-title", p.title));
      appendChildren(result, children);
      var submit = node("button", "button", p.submitLabel || "提交");
      submit.addEventListener("click", function () { var status = result.querySelector(".offline-status"); if (!status) result.appendChild(node("small", "offline-status", "这是离线导出页面，表单值会保留在当前页面中，但不会提交到 QwenPaw。")); });
      result.appendChild(submit);
      return result;
    }
    if (source.kind === "Button" || source.kind === "InteractiveButton" || source.kind === "ToggleButton" || source.kind === "LinkButton") {
      result = node("button", source.kind === "LinkButton" ? "link-button" : "button", p.label || "Action"); result.disabled = Boolean(p.disabled);
      result.addEventListener("click", function () { if (source.kind === "ToggleButton") result.classList.toggle("active"); else if (source.kind === "LinkButton" && /^https?:\/\//.test(text(p.href))) window.open(text(p.href), "_blank", "noopener,noreferrer"); else { var status = result.nextElementSibling; if (!status || !status.classList.contains("offline-status")) { status = node("small", "offline-status", "离线导出不支持发送消息或提交到 QwenPaw"); result.after(status); } } }); return result;
    }
    if (source.kind === "Image") { result = node("figure"); result.appendChild(mediaImage(p.src, p.alt)); if (p.caption) result.appendChild(node("figcaption", "", p.caption)); return result; }
    if (source.kind === "ImageGallery") { result = node("div", "image-gallery"); result.style.gridTemplateColumns = "repeat(" + Math.min(Math.max(number(p.columns) || 3, 1), 6) + ", minmax(0,1fr))"; children.filter(function (child) { return child.kind === "Image"; }).forEach(function (child) { result.appendChild(render(child)); }); return result; }
    if (source.kind === "Avatar") { if (p.src) return mediaImage(p.src, p.name, "avatar"); return node("span", "avatar avatar-fallback", text(p.name).charAt(0).toUpperCase()); }
    if (source.kind === "ProfileCard") { result = node("div", "card profile"); result.append(p.avatar ? mediaImage(p.avatar, p.name, "avatar") : node("span", "avatar avatar-fallback", text(p.name).charAt(0).toUpperCase()), labelValue(node("div"), p.name, p.role)); if (p.bio) result.appendChild(node("div", "small", p.bio)); return result; }
    if (source.kind === "MediaCard") { result = node("div", "card"); if (p.src) result.appendChild(mediaImage(p.src, p.title, "media-card-image")); var mediaBody = node("div", "card-body"); if (p.title) mediaBody.appendChild(node("strong", "", p.title)); if (p.caption) mediaBody.appendChild(node("div", "muted small", p.caption)); result.appendChild(mediaBody); return result; }
    if (source.kind === "Badge" || source.kind === "Tag" || source.kind === "Chip") return node("span", "tag", p.value || p.label);
    if (source.kind === "Progress") { result = node("progress"); result.max = 100; result.value = number(p.value); return result; }
    if (source.kind === "Stat") { result = node("div", "stat"); result.append(node("span", "muted small", p.label), node("strong", "stat-value", p.value)); if (p.delta) result.appendChild(node("span", "small trend-" + text(p.trend), p.delta)); return result; }
    if (source.kind === "DataCard" || source.kind === "MetricCard") { result = node("div", "card metric-card"); var metricText = labelValue(node("div"), p.title, p.value); if (p.delta) metricText.appendChild(node("div", "small trend-" + text(p.trend), text(p.delta) + (p.period ? " " + text(p.period) : ""))); result.appendChild(metricText); if (p.icon) result.appendChild(node("span", "metric-icon", p.icon)); return result; }
    if (source.kind === "WeatherCard") { result = node("div", "card row"); if (p.icon) result.appendChild(node("span", "metric-icon", p.icon)); var weatherBody = node("div"); weatherBody.appendChild(node("div", "display-value", p.temperature)); if (p.condition) weatherBody.appendChild(node("div", "muted", p.condition)); if (p.location) weatherBody.appendChild(node("div", "muted small", p.location)); result.appendChild(weatherBody); return result; }
    if (source.kind === "QuoteCard") { result = node("blockquote", "card quote"); result.append(node("div", "", "“" + text(p.quote) + "”"), node("footer", "muted small", "— " + text(p.author) + (p.role ? ", " + text(p.role) : ""))); return result; }
    if (source.kind === "TimelineCard") { result = node("div", "card timeline"); result.append(node("i", "timeline-dot status-" + text(p.status)), labelValue(node("div"), p.title, p.date)); if (p.description) result.appendChild(node("div", "small", p.description)); return result; }
    if (source.kind === "Stepper") { result = node("ol", "stepper"); array(p.steps).forEach(function (step, index) { result.appendChild(node("li", index <= number(p.current) ? "active" : "", step)); }); return result; }
    if (source.kind === "Table") { result = node("table", "data-table"); var head = node("thead"), headRow = node("tr"); array(p.headers).forEach(function (header) { headRow.appendChild(node("th", "", header)); }); head.appendChild(headRow); var body = node("tbody"); children.filter(function (child) { return child.kind === "TableRow"; }).forEach(function (row) { var tr = node("tr", row.props && row.props.highlight ? "highlight" : ""); array(row.children).filter(function (cell) { return cell.kind === "TableCell"; }).forEach(function (cell) { var td = node("td", cell.props && cell.props.bold ? "bold" : "", cell.props && cell.props.value); if (cell.props && cell.props.align) td.style.textAlign = text(cell.props.align); tr.appendChild(td); }); body.appendChild(tr); }); result.append(head, body); return result; }
    if (source.kind === "List") { result = node(p.ordered ? "ol" : "ul", "data-list"); children.filter(function (child) { return child.kind === "ListItem"; }).forEach(function (item) { result.appendChild(node("li", "", (item.props && item.props.icon ? text(item.props.icon) + " " : "") + text(item.props && item.props.value))); }); return result; }
    if (source.kind === "ChipGroup") { result = node("div", "chips"); array(p.items).forEach(function (item) { result.appendChild(node("span", "tag", item)); }); return result; }
    if (source.kind === "Skeleton") { result = node("div", "skeletons"); for (var skeletonIndex = 0; skeletonIndex < (number(p.rows) || 3); skeletonIndex++) result.appendChild(node("i", "skeleton")); return result; }
    if (source.kind === "Icon") return node("span", "icon", p.name);
    if (source.kind === "JsonDebug") { result = node("details"); result.append(node("summary", "", p.label || "Debug JSON"), node("pre", "code", JSON.stringify(p.data == null ? p : p.data, null, 2))); return result; }
    if (source.kind === "KpiBoard") { result = node("div", "stack"); if (p.title) result.appendChild(node("div", "card-title", p.title)); var kpiGrid = node("div", "grid"); kpiGrid.style.gridTemplateColumns = "repeat(" + Math.min(Math.max(number(p.columns) || 3, 1), 6) + ", minmax(0,1fr))"; appendChildren(kpiGrid, children); result.appendChild(kpiGrid); return result; }
    var classMap = { Stack: "stack", Row: "row", Grid: "grid", Card: "card", Alert: "alert", AlertCard: "alert", Callout: "alert", FeatureGrid: "grid", ScrollArea: "scroll-area", AspectBox: "aspect-box" };
    if (!Object.prototype.hasOwnProperty.call(classMap, source.kind)) return node("div", "unknown-component", "Unknown component: " + text(source.kind));
    result = node("div", classMap[source.kind]);
    if (source.kind === "Grid" || source.kind === "FeatureGrid") result.style.gridTemplateColumns = "repeat(" + Math.min(Math.max(number(p.columns) || 2, 1), 6) + ", minmax(0,1fr))";
    if (source.kind === "Stack" || source.kind === "Row" || source.kind === "Grid" || source.kind === "FeatureGrid") result.style.gap = (number(p.gap) || 12) + "px";
    if (source.kind === "Stack" && p.padding) result.style.padding = number(p.padding) + "px";
    if (source.kind === "Row") { if (p.align) result.style.alignItems = text(p.align); if (p.justify) result.style.justifyContent = text(p.justify); }
    if (source.kind === "ScrollArea") { result.style.maxHeight = (number(p.maxHeight) || 300) + "px"; if (p.padding) result.style.padding = number(p.padding) + "px"; }
    if (source.kind === "AspectBox") { var ratio = text(p.ratio) || "16:9", parts = ratio.split(":"); result.style.aspectRatio = (number(parts[0]) || 16) + " / " + (number(parts[1]) || 9); }
    if (source.kind === "Card" && p.title) result.appendChild(node("div", "card-title", p.title));
    if (source.kind === "Card" && p.subtitle) result.appendChild(node("div", "muted small card-subtitle", p.subtitle));
    if ((source.kind === "Alert" || source.kind === "AlertCard" || source.kind === "Callout") && (p.title || p.message)) { if (p.title) result.appendChild(node("strong", "", p.title)); if (p.message) result.appendChild(node("div", "", p.message)); }
    else appendChildren(result, children);
    return result;
  }
  root.appendChild(render(tree));
  renderCharts();
  window.__GENUI_EXPORT__ = { tree: tree, values: values, refresh: renderCharts };
})();`;
async function Ai(e, t, r, n, a = n) {
  const l = await Ii(e), i = `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${Ci(a)}</title>
  <style>
    :root { color-scheme: light; }
    html, body { margin: 0; padding: 0; background: #f5f7fa; color: #1f2329; }
    body { padding: 24px; font-family: system-ui, -apple-system, "Segoe UI", sans-serif; }
    *, *::before, *::after { box-sizing: border-box; }
    #genui-root { max-width: 960px; margin: auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px; background: #fff; box-shadow: 0 8px 30px rgba(0,0,0,.05); }
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
    .media-card-image { width: 100%; max-height: 240px; object-fit: cover; border-radius: 8px; } .card-body { display: flex; flex-direction: column; gap: 4px; margin-top: 8px; } .media-unavailable { min-height: 96px; display: flex; align-items: center; justify-content: center; padding: 12px; border: 1px dashed #f79009; border-radius: 8px; color: #b54708; background: #fffaeb; }
    .metric-card { display: flex; justify-content: space-between; align-items: center; } .metric-icon,.section-icon { font-size: 28px; } .section-header { display: flex; align-items: center; gap: 8px; } .profile { display: flex; gap: 12px; align-items: center; }
    .key-values { display: grid; grid-template-columns: minmax(100px, 1fr) minmax(120px, 2fr); gap: 5px 12px; margin: 0; } .key-values dt { color: #667085; } .key-values dd { margin: 0; font-weight: 500; text-align: right; }
    .data-table { width: 100%; border-collapse: collapse; } .data-table th,.data-table td { padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: left; } .data-table .highlight { background: #f0f5ff; }
    .chips { display: flex; flex-wrap: wrap; gap: 4px; } .skeletons { display: flex; flex-direction: column; gap: 8px; } .skeleton { height: 12px; border-radius: 6px; background: #eaecf0; } .scroll-area { overflow-y: auto; } .aspect-box { overflow: hidden; display: flex; align-items: center; justify-content: center; }
    .unknown-component { padding: 8px; border: 1px dashed #d0d5dd; border-radius: 8px; color: #667085; font: 12px ui-monospace, monospace; }
    @media print { body { padding: 0; } }
  </style>
</head>
<body><main id="genui-root"></main>
<script id="genui-tree-data" type="application/json">${sn(t)}<\/script>
<script id="genui-values-data" type="application/json">${sn(r)}<\/script>
<script id="genui-media-data" type="application/json">${sn(l)}<\/script>
<script>${zi}<\/script></body>
</html>`, s = new Blob([i], { type: "text/html;charset=utf-8" }), o = URL.createObjectURL(s), c = document.createElement("a");
  c.download = `${n}.html`, c.href = o, c.click(), setTimeout(() => URL.revokeObjectURL(o), 1e3), l.missing.length && console.warn("[ugsci.genui] HTML export has media that could not be embedded", { filename: n, missing: l.missing }), console.info("[ugsci.genui] HTML export created", { filename: n, bytes: s.size, embeddedMedia: Object.keys(l.sources).length, missingMedia: l.missing.length });
}
function $i(e, t) {
  const r = window.open("", "_blank", "noopener,noreferrer");
  if (!r) throw new Error("print window was blocked");
  r.document.write(`<!doctype html><html><head><title>${t}</title><style>body{font-family:system-ui;padding:24px}@media print{button{display:none}}</style></head><body>${e.outerHTML}</body></html>`), r.document.close(), r.addEventListener("load", () => {
    r.focus(), r.print(), r.close();
  }, { once: !0 });
}
const Pi = [], st = /* @__PURE__ */ new Map();
function Oi(e) {
  st.set(e, (st.get(e) || 0) + 1);
}
function Mi(e) {
  const t = (st.get(e) || 1) - 1;
  t > 0 ? st.set(e, t) : st.delete(e);
}
function Li(e) {
  return (st.get(e) || 0) > 0;
}
function Ri({ data: e }) {
  var m, f;
  const t = (m = window.QwenPaw) == null ? void 0 : m.host, r = t == null ? void 0 : t.React;
  if (!r) return null;
  const n = ti(), a = r.useRef(/* @__PURE__ */ new Map()), l = ((f = t.getCurrentSessionId) == null ? void 0 : f.call(t)) || "__current_chat__", i = Array.isArray(e.output) ? e.output : Pi, s = r.useMemo(
    () => aa(i),
    [i]
  );
  r.useEffect(() => {
    for (const u of s) {
      if (!u.ui_id || !u.tree) continue;
      const p = n.getSnapshot(l, u.ui_id);
      p && p.revision >= (u.revision || 1) || n.setSnapshot({
        schemaVersion: "1",
        uiId: u.ui_id,
        revision: u.revision || 1,
        tree: u.tree,
        sessionId: l,
        sourceToolCallId: u.tool_call_id,
        updatedAt: Date.now()
      });
    }
  }, [s, l]);
  const o = r.useMemo(
    () => s.filter((u) => u.kind === "genui" && !!u.ui_id).map((u) => u.ui_id),
    [s]
  ), c = o.join("\0");
  r.useEffect(() => {
    for (const u of o) Oi(u);
    return () => {
      for (const u of o) Mi(u);
    };
  }, [c]);
  const d = Object.values(n.snapshots).filter((u) => u.sessionId === l).filter(
    (u) => (
      // Only include snapshots whose ui_id appears in this response's results
      s.some(
        (p) => p.ui_id === u.uiId && (p.kind === "genui" || p.kind === "genui_patch" && !Li(u.uiId))
      )
    )
  ).sort((u, p) => u.updatedAt - p.updatedAt);
  return d.length === 0 ? null : r.createElement(
    "div",
    { className: "qwenpaw-genui-inline", style: { marginTop: 8, marginBottom: 8 } },
    ...d.map(
      (u) => r.createElement(
        "div",
        {
          key: Nt(u.sessionId, u.uiId),
          className: "qwenpaw-genui-tree",
          "data-genui-id": u.uiId,
          style: { border: "1px solid var(--ant-color-border-secondary, #f0f0f0)", borderRadius: 12, padding: 16, marginBottom: 8, background: "var(--ant-color-bg-container, #fff)" },
          ref: (p) => {
            p && (p.__genuiId = u.uiId);
          }
        },
        r.createElement(
          "div",
          { className: "qwenpaw-genui-export-target" },
          r.createElement(hi, {
            node: u.tree.root,
            onValuesChange: (p) => a.current.set(u.uiId, p),
            children: r.createElement(it, { node: u.tree.root })
          })
        ),
        r.createElement(
          "div",
          { style: { display: "flex", justifyContent: "flex-end", gap: 6, marginTop: 8 } },
          r.createElement("button", { type: "button", title: "导出 PNG", onClick: (p) => {
            var h;
            const y = (h = p.currentTarget.closest(".qwenpaw-genui-tree")) == null ? void 0 : h.querySelector(".qwenpaw-genui-export-target");
            y && ki(y, u.uiId).catch((S) => console.warn("[ugsci.genui] PNG export failed", S));
          } }, "PNG"),
          r.createElement("button", { type: "button", title: "打印或另存为 PDF", onClick: (p) => {
            var h;
            const y = (h = p.currentTarget.closest(".qwenpaw-genui-tree")) == null ? void 0 : h.querySelector(".qwenpaw-genui-export-target");
            y && $i(y, u.uiId);
          } }, "PDF"),
          r.createElement("button", { type: "button", title: "导出 HTML", onClick: (p) => {
            var h;
            const y = (h = p.currentTarget.closest(".qwenpaw-genui-tree")) == null ? void 0 : h.querySelector(".qwenpaw-genui-export-target");
            y && Ai(y, u.tree.root, a.current.get(u.uiId) || {}, u.uiId, u.uiId).catch((S) => console.warn("[ugsci.genui] HTML export failed", S));
          } }, "HTML")
        )
      )
    )
  );
}
let lt = null;
function Bi(e, t) {
  var a, l, i;
  const r = "ugsci";
  lt == null || lt();
  const n = [];
  return ce("/ugsci/genui/config", { bypassCache: !0 }).then((s) => {
    e.genui = { ...e.genui || {}, config: s };
  }).catch((s) => {
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
    }, console.warn("[ugsci.genui] Failed to load runtime config; using compatibility fallback", s);
  }), (a = e.chat) != null && a.toolRender && (n.push(e.chat.toolRender(r, "emit_ui_tree", Ot)), n.push(e.chat.toolRender(r, "emit_ui_patch", Ot)), n.push(e.chat.toolRender(r, "list_ui_components", Ot)), n.push(e.chat.toolRender(r, "get_genui_guide", Ot)), console.info("[ugsci.genui] Registered 4 tool card renderers")), (i = (l = e.chat) == null ? void 0 : l.response) != null && i.append && (n.push(e.chat.response.append(
    r,
    (s) => t.createElement(ei, null, t.createElement(Ri, { data: s.data })),
    { id: "ugsci.genui.response-append", order: 50 }
  )), console.info("[ugsci.genui] Registered response.append slot")), lt = () => {
    var s;
    for (const o of n.reverse()) (s = o == null ? void 0 : o.dispose) == null || s.call(o);
    ni(), yi(), lt = null;
  }, lt;
}
const Ir = {
  enabled: !0,
  persisted_enabled: !0,
  overridden: !1,
  channels: ["response.append"],
  allow_html: !1,
  allow_actions: [],
  backend_unavailable: !0
};
function cn(e) {
  const t = window.QwenPaw;
  t && (t.genui = { ...t.genui || {}, config: e });
}
function Ui() {
  const e = A().React, { Alert: t, Card: r, Space: n, Spin: a, Switch: l, Typography: i, message: s } = A().antd, { useEffect: o, useState: c } = e, [d, m] = c(null), [f, u] = c(!1);
  o(() => {
    let y = !0, h = null;
    const S = (k = !1) => {
      ce("/ugsci/genui/config").then((x) => {
        y && (m(x), cn(x));
      }).catch((x) => {
        y && (m(Ir), cn(Ir), k && s.error(String(x)), h = setTimeout(() => S(!1), 3e4));
      });
    };
    return S(!0), () => {
      y = !1, h && clearTimeout(h);
    };
  }, []);
  const p = async (y) => {
    u(!0);
    try {
      const h = await ce("/ugsci/genui/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: y })
      });
      m(h), cn(h), s.success(h.overridden ? "设置已保存，但环境变量或插件配置正在覆盖它" : y ? "GenUI 已开启" : "GenUI 已关闭");
    } catch (h) {
      s.error(`保存 GenUI 设置失败：${String(h)}`);
    } finally {
      u(!1);
    }
  };
  return e.createElement(
    "div",
    { style: { padding: 24, maxWidth: 880 } },
    e.createElement(i.Title, { level: 2 }, "GenUI 设置"),
    e.createElement(
      i.Paragraph,
      { type: "secondary" },
      "控制 UGSci 的生成式界面能力。该设置对所有 Agent 生效，新安装时默认开启。"
    ),
    e.createElement(
      r,
      null,
      d === null ? e.createElement(a) : e.createElement(
        n,
        { direction: "vertical", size: 16, style: { width: "100%" } },
        e.createElement(
          n,
          { style: { width: "100%", justifyContent: "space-between" } },
          e.createElement(
            "div",
            null,
            e.createElement(i.Text, { strong: !0 }, "启用 GenUI"),
            e.createElement(
              i.Paragraph,
              { type: "secondary", style: { margin: "4px 0 0" } },
              "允许 Agent 生成卡片、表格、图表、表单，并在对话中交互和增量更新。"
            )
          ),
          e.createElement(l, {
            checked: d.persisted_enabled,
            loading: f,
            disabled: d.backend_unavailable,
            onChange: p
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
let yt = null;
function ca() {
  return yt || (yt = (async () => {
    var n;
    const e = (n = window.QwenPaw) == null ? void 0 : n.host;
    if (!(e != null && e.getApiUrl))
      throw new Error("[oilgas-vis] QwenPaw.host.getApiUrl not available");
    const t = e.getApiUrl(
      "frontend_plugin/ugsci/files/ui/dist/viewer-runtime.js"
    );
    console.info("[oilgas-vis] Loading viewer runtime from", t), await new Promise((a, l) => {
      const i = document.createElement("script");
      i.dataset.plugin = "ugsci", i.src = t, i.onload = () => a(), i.onerror = () => l(new Error("Viewer runtime failed to load")), document.head.appendChild(i);
    });
    const r = window.OilGasViewerRuntime;
    if (!r)
      throw new Error(
        "[oilgas-vis] window.OilGasViewerRuntime not found after script load"
      );
    return console.info(
      "[oilgas-vis] Viewer runtime loaded, version:",
      r.version
    ), r;
  })().catch((e) => {
    throw yt = null, e;
  }), yt);
}
function ji() {
  const e = A().React, { useEffect: t, useRef: r, useState: n } = e, { Spin: a, Alert: l, Button: i, Typography: s, message: o } = A().antd, { Text: c } = s, d = r(null), m = r(null), [f, u] = n(!0), [p, y] = n(null);
  return t(() => {
    let h = !1;
    async function S() {
      if (d.current)
        try {
          u(!0), y(null);
          const k = await ca();
          if (h) return;
          const x = A(), L = {
            apiBase: x.getApiUrl("ugsci/visualization"),
            authToken: x.getApiToken() || void 0
          };
          m.current = k.mount(d.current, L), h || u(!1);
        } catch (k) {
          if (!h) {
            const x = k instanceof Error ? k.message : "Failed to load viewer";
            y(x), u(!1), o.error(`可视化引擎加载失败: ${x}`);
          }
        }
    }
    return S(), () => {
      if (h = !0, m.current) {
        try {
          m.current.dispose();
        } catch (k) {
          console.warn("[oilgas-vis] Dispose error:", k);
        }
        m.current = null;
      }
    };
  }, []), p ? e.createElement(
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
      description: p,
      showIcon: !0,
      style: { maxWidth: 600 }
    }),
    e.createElement(
      i,
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
    f && e.createElement(
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
        "正在加载三维可视化引擎..."
      )
    )
  );
}
function da(e, t) {
  var a;
  const r = ((a = e.getApiToken) == null ? void 0 : a.call(e)) || "", n = typeof e.buildAuthHeaders == "function" ? { ...e.buildAuthHeaders(t.agentId) } : r ? { Authorization: `Bearer ${r}` } : {};
  return t.agentId && (n["X-Agent-Id"] = t.agentId), t.chatId && (n["X-Chat-Id"] = t.chatId), !t.chatId && t.projectDirOverride && (n["X-Session-Project-Dir"] = t.projectDirOverride), n;
}
async function ua(e, t, r) {
  if (typeof e.fetch == "function")
    return e.fetch(t, r);
  const n = t.replace(/^\/ugsci\/visualization/, "");
  return fetch(`${e.getApiUrl("ugsci/visualization")}${n}`, r);
}
function zr(e) {
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
function Ni({ jobId: e, file: t }) {
  const r = A().React, { useEffect: n, useRef: a, useState: l } = r, i = A(), s = a(null), o = a(null), [c, d] = l("queued"), [m, f] = l(0), [u, p] = l(null), [y, h] = l(null);
  return n(() => {
    let S = !1;
    return (async () => {
      var E;
      const x = `/ugsci/visualization/imports/${e}`;
      for (let L = 0; L < 240 && !S; L += 1) {
        try {
          const D = await ua(i, x, {
            headers: { ...da(i, t) }
          });
          if (!D.ok) throw new Error(`状态查询失败: HTTP ${D.status}`);
          const F = await D.json();
          if (S) return;
          if (f(Number(F.progress || 0)), d(F.status), F.status === "completed") {
            if (!((E = F.result) != null && E.id)) throw new Error("导入完成但未返回数据集 ID");
            h(F.result.id);
            return;
          }
          if (F.status === "failed" || F.status === "cancelled") {
            p(F.error || zr(F.status));
            return;
          }
        } catch (D) {
          if (L >= 239 && !S) {
            d("failed"), p(D instanceof Error ? D.message : String(D));
            return;
          }
        }
        await new Promise((D) => setTimeout(D, 750));
      }
    })(), () => {
      S = !0;
    };
  }, [e, t.agentId, t.chatId, t.projectDirOverride]), n(() => {
    if (c !== "completed" || !y || !s.current) return;
    let S = !1;
    return (async () => {
      var k, x;
      try {
        const E = await ca();
        if (S || !s.current) return;
        o.current = E.mount(s.current, {
          apiBase: i.getApiUrl("ugsci/visualization"),
          authToken: i.getApiToken() || void 0
        });
        let L;
        for (let D = 0; D < 20 && !S; D += 1)
          try {
            await ((x = (k = o.current).executeCommand) == null ? void 0 : x.call(k, "open", { datasetId: y })), L = void 0;
            break;
          } catch (F) {
            L = F;
            const G = F instanceof Error ? F.message : String(F);
            if (!G.includes("数据集不存在") && !G.includes("dataset"))
              throw F;
            await new Promise((j) => setTimeout(j, 250));
          }
        if (L && !S) throw L;
      } catch (E) {
        S || (d("failed"), p(E instanceof Error ? E.message : String(E)));
      }
    })(), () => {
      var k;
      S = !0;
      try {
        (k = o.current) == null || k.dispose();
      } catch {
      }
      o.current = null;
    };
  }, [c, y]), r.createElement(
    "div",
    { style: { width: "100%", marginTop: 8 } },
    c === "completed" ? r.createElement("div", {
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
    }) : r.createElement(
      "div",
      { style: { padding: "12px 16px", width: "100%", color: "#8b949e" } },
      `${zr(c)}${m > 0 ? `（${Math.round(m * 100)}%）` : ""}`
    ),
    u ? r.createElement(
      "div",
      { style: { marginTop: 6, color: "#ff7875", fontSize: 12 } },
      `预览状态：${u}`
    ) : null
  );
}
function Di(e) {
  const t = A().React, { useEffect: r, useState: n } = t, { Button: a, Spin: l, Alert: i, Typography: s } = A().antd, { Text: o } = s, c = e.artifact || e.file || {}, d = c.filename || c.title || e.filename || "unknown", m = c.workspacePath || c.path || e.workspacePath, [f, u] = n("idle"), [p, y] = n(null), [h, S] = n(null);
  return r(() => {
    if (!m) return;
    let k = !1;
    return u("submitting"), y(null), S(null), (async () => {
      try {
        const x = A(), E = await ua(x, "/ugsci/visualization/imports/workspace", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...da(x, c)
          },
          body: JSON.stringify({
            path: m,
            root: c.workspaceRoot || "project",
            name: d.replace(/\.[^.]+$/, "")
          })
        });
        if (!E.ok) throw new Error(`Import failed: HTTP ${E.status}`);
        const L = await E.json();
        k || (y(L.job_id), u("submitted"));
      } catch (x) {
        k || (S(x instanceof Error ? x.message : String(x)), u("failed"));
      }
    })(), () => {
      k = !0;
    };
  }, [m, d, c.workspaceRoot, c.agentId, c.chatId, c.projectDirOverride]), f === "submitting" ? t.createElement(
    "div",
    { style: { padding: 24, textAlign: "center" } },
    t.createElement(l, { size: "large" }),
    t.createElement(
      "div",
      { style: { marginTop: 8, color: "#8b949e" } },
      "正在提交工作区文件，浏览器不会复制大型文件..."
    )
  ) : f === "failed" ? t.createElement(
    "div",
    { style: { padding: 24 } },
    t.createElement(i, {
      type: "warning",
      message: "导入失败",
      description: h,
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
    t.createElement(o, { strong: !0 }, `文件: ${d}`),
    c.size ? t.createElement(o, { type: "secondary" }, `大小: ${(c.size / 1024 / 1024).toFixed(1)} MB`) : null,
    p ? t.createElement(Ni, { jobId: p, file: c }) : t.createElement(o, { type: "secondary" }, "正在准备导入任务..."),
    t.createElement(a, {
      type: "primary",
      onClick: () => {
        window.history.pushState({}, "", "/oilgas-visualization"), window.dispatchEvent(new PopStateEvent("popstate"));
      }
    }, "打开油气可视化页面")
  );
}
function Gi(e, t) {
  const r = "__ugsciVisualizationFrontendRegistered", n = window;
  if (n[r]) return;
  n[r] = !0;
  const a = A().antdIcons || {}, l = a.GlobalOutlined || a.AppstoreOutlined;
  e.route.add("ugsci", {
    id: "ugsci.visualization",
    path: "/oilgas-visualization",
    component: ji
  }), e.menu.add("ugsci", {
    id: "ugsci.visualization",
    location: "primary.agentScoped",
    label: () => "油气可视化",
    icon: l ? t.createElement(l, { style: { fontSize: 16 } }) : void 0,
    route: "ugsci.visualization",
    order: 7,
    visible: () => !0
  });
  const i = e.workspace;
  if (i != null && i.registerRenderer)
    try {
      i.registerRenderer({
        id: "ugsci.visualization",
        name: "UGSci 油气可视化",
        component: Di,
        extensions: [
          "egrid",
          "grid",
          "grdecl",
          "init",
          "unrst",
          "roff",
          "roffbin",
          "dat",
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
          "network.json"
        ],
        mimeTypes: [
          "application/x-eclipse-grid",
          "application/x-eclipse-init",
          "application/x-eclipse-unrst",
          "application/x-cmg-dat",
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
function Fi() {
  var c, d, m;
  const e = window.QwenPaw;
  if (!(e != null && e.menu) || !(e != null && e.route)) {
    console.warn(
      "[ugsci] QwenPaw.menu/route API not available — plugin disabled"
    );
    return;
  }
  const t = A().React, r = "ugsci";
  (d = (c = e.chat) == null ? void 0 : c.rightHeader) != null && d.add ? (e.chat.rightHeader.add(r, t.createElement(Ko), {
    id: "ugsci.welcome-injector",
    order: -1
    // render before other right-header items (invisible anyway)
  }), console.info("[ugsci] WelcomePromptsInjector registered via rightHeader")) : console.warn(
    "[ugsci] QP.chat.rightHeader.add not available — agent-specific welcome prompts disabled"
  );
  const n = A().antdIcons || {}, a = n.UserSwitchOutlined, l = n.ToolOutlined, i = n.ShopOutlined, s = n.AppstoreOutlined;
  e.route.add(r, {
    id: "ugsci.experts",
    path: "/ugsci-experts",
    component: ql
  }), e.menu.add(r, {
    id: "ugsci.experts",
    location: "primary.agentScoped",
    label: () => "专家·协作",
    icon: a ? t.createElement(a, { style: { fontSize: 16 } }) : void 0,
    route: "ugsci.experts",
    order: 5,
    visible: () => ft()
  }), e.route.add(r, {
    id: "ugsci.genui-settings",
    path: "/ugsci-genui-settings",
    component: Ui
  }), e.menu.add(r, {
    id: "ugsci.genui-settings",
    location: "primary.settings",
    parentId: "plugins-group",
    label: () => "GenUI 设置",
    icon: s ? t.createElement(s, { style: { fontSize: 16 } }) : void 0,
    route: "ugsci.genui-settings",
    order: 30
  }), e.route.add(r, {
    id: "ugsci.tools-skills",
    path: "/ugsci-tools-skills",
    component: Kr
  }), e.menu.add(r, {
    id: "ugsci.tools-skills",
    location: "primary.agentScoped",
    label: () => "工具·技能",
    icon: l ? t.createElement(l, { style: { fontSize: 16 } }) : void 0,
    route: "ugsci.tools-skills",
    order: 6,
    visible: () => ft()
  }), e.route.add(r, {
    id: "ugsci.capabilities",
    path: "/ugsci-capabilities",
    component: To
  }), e.route.add(r, {
    id: "ugsci.skills-center",
    path: "/ugsci-skills",
    component: _o
  }), e.route.add(r, {
    id: "ugsci.market",
    path: "/ugsci-market",
    component: qo
  }), e.menu.add(r, {
    id: "ugsci.market",
    location: "primary.agentScoped",
    label: () => "市场",
    icon: i ? t.createElement(i, { style: { fontSize: 16 } }) : void 0,
    route: "ugsci.market",
    order: 7,
    visible: () => ft()
  }), (m = e.sidebar) != null && m.registerSimpleModeItems ? (e.sidebar.registerSimpleModeItems([
    "ugsci.experts",
    "ugsci.tools-skills",
    "ugsci.market"
  ]), console.info("[ugsci] Registered 3 items for simple-mode visibility")) : console.warn(
    "[ugsci] window.QwenPaw.sidebar.registerSimpleModeItems not available — items will not appear in simple mode"
  );
  const o = [
    "core.skills",
    "core.tools",
    "core.acp",
    "core.agent-config",
    "core.agent-stats",
    "core.skill-pool"
  ];
  for (const f of o) {
    try {
      const p = e.menu.snapshot("primary.agentScoped").find((y) => y.id === f);
      p && e.menu.replace(r, f, {
        ...p,
        visible: () => !ft()
      });
    } catch {
    }
    try {
      const p = e.menu.snapshot("primary.settings").find((y) => y.id === f);
      p && e.menu.replace(r, f, {
        ...p,
        visible: () => !ft()
      });
    } catch {
    }
  }
  try {
    const u = e.menu.snapshot("primary.agentScoped").find((p) => p.id === "oilgas-vis.page");
    u && e.menu.replace(r, "oilgas-vis.page", {
      ...u,
      visible: () => !1
    });
  } catch {
  }
  Bi(e, t), Gi(e, t), console.info(
    "[ugsci] Plugin registered: unified Tools & Skills center + compatibility routes, simple-mode navigation active"
  );
}
function yn() {
  try {
    Fi();
  } catch (e) {
    console.error("[ugsci] Failed to build plugin:", e), setTimeout(yn, 500);
  }
}
var Ar;
if ((Ar = window.QwenPaw) != null && Ar.host)
  yn();
else {
  const e = setInterval(() => {
    var t;
    (t = window.QwenPaw) != null && t.host && (clearInterval(e), yn());
  }, 200);
  setTimeout(() => clearInterval(e), 1e4);
}
