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
function gn(e) {
  for (const [t, r] of bt)
    (e ? r.agentId === e : r.agentId) && bt.delete(t);
}
async function ce(e, t) {
  const r = ((t == null ? void 0 : t.method) || "GET").toUpperCase(), { bypassCache: n, ...a } = t || {}, l = Oa(
    a.headers
  ), s = Ma(r, e, l);
  if (r !== "GET" && (l ? gn(l) : xt()), r === "GET" && !n) {
    const c = bt.get(s);
    if (c && Date.now() - c.ts < Pa)
      return c.data;
  }
  const i = await Ve(e, a);
  if (!i.ok) {
    const c = await i.text().catch(() => "");
    throw new Error(c || `HTTP ${i.status}`);
  }
  if (i.status === 204) return null;
  const o = await i.json();
  return r === "GET" && bt.set(s, {
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
async function yn(e) {
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
    let s = a;
    if (s = s.replace(/\*\*(.+?)\*\*/g, "$1").replace(/\*(.+?)\*/g, "$1").replace(/`(.+?)`/g, "$1").replace(/^#+\s*/gm, "").trim(), /^(用于|帮助|提供|支持|实现|完成|分析|计算|生成|创建|检查)/.test(s) ? s = `请${s}` : /^(a |an |the )/i.test(s) ? s = `Help me with ${s}` : /[。？！.?!]$/.test(s) || (s = `帮我${s}`), s.length > 80 && (s = s.substring(0, 77) + "..."), t.push({ label: l, value: s }), t.length >= 4) break;
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
  const r = await yn(e);
  r.system_prompt_files = t, await ce(`/agents/${encodeURIComponent(e)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(r)
  });
}
async function hn(e, t) {
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
async function En(e, t) {
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
async function vn(e) {
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
async function bn(e, t) {
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
  const n = parseInt(r[1] || "0", 10), a = parseInt(r[2] || "0", 10), l = parseInt(r[3] || "0", 10), s = n * 60 + a + Math.round(l / 60);
  return s <= 0 ? { number: 6, unit: "h" } : s >= 60 && s % 60 === 0 ? { number: s / 60, unit: "h" } : { number: s, unit: "m" };
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
async function Ya(e) {
  await ce("/config/heartbeat/run", {
    method: "POST",
    headers: { "X-Agent-Id": e }
  });
}
async function Qa(e) {
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
function Qn({
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
      (s, i) => a.createElement(
        l,
        { key: i, color: r, style: { fontSize: 11, marginRight: 0 } },
        s
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
  const s = A().React, { useState: i, useEffect: o, useMemo: c } = s, { Modal: d, Button: u, Empty: p, Spin: m, Input: f, Tag: y, Tooltip: h, Typography: k } = A().antd, { CheckOutlined: S, SearchOutlined: x } = A().antdIcons || {}, { Text: v } = k, [L, D] = i([]), [F, G] = i("");
  o(() => {
    e && (D([]), G(""));
  }, [e]);
  const j = c(() => {
    if (!F.trim()) return r;
    const b = F.toLowerCase();
    return r.filter(
      (E) => {
        var _, I;
        return E.name.toLowerCase().includes(b) || ((_ = E.description) == null ? void 0 : _.toLowerCase().includes(b)) || ((I = E.tags) == null ? void 0 : I.some((U) => U.toLowerCase().includes(b)));
      }
    );
  }, [r, F]), K = j.filter(
    (b) => !n.includes(b.name)
  ), X = (b) => {
    D(
      (E) => E.includes(b) ? E.filter((_) => _ !== b) : [...E, b]
    );
  }, H = async () => {
    L.length !== 0 && (await l(L), D([]));
  };
  return s.createElement(
    d,
    {
      open: e,
      onCancel: t,
      title: "从技能池选择技能",
      width: 680,
      footer: s.createElement(
        "div",
        {
          style: {
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }
        },
        s.createElement(
          v,
          { type: "secondary", style: { fontSize: 13 } },
          `已选择 ${L.length} 个技能`
        ),
        s.createElement(
          "div",
          { style: { display: "flex", gap: 8 } },
          s.createElement(u, { onClick: t }, "取消"),
          s.createElement(
            u,
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
    s.createElement(
      "div",
      {
        style: {
          marginBottom: 12,
          display: "flex",
          gap: 8,
          alignItems: "center"
        }
      },
      s.createElement(f, {
        placeholder: "搜索技能名称、描述或标签...",
        prefix: x ? s.createElement(x) : void 0,
        value: F,
        onChange: (b) => G(b.target.value),
        allowClear: !0,
        style: { flex: 1 }
      }),
      s.createElement(
        u,
        {
          size: "small",
          type: "primary",
          onClick: () => D(K.map((b) => b.name))
        },
        "全选"
      ),
      s.createElement(
        u,
        {
          size: "small",
          onClick: () => D([])
        },
        "清空"
      )
    ),
    // Skill grid (card style matching Skill Center)
    a ? s.createElement(
      "div",
      { style: { textAlign: "center", padding: 40 } },
      s.createElement(m, { size: "large" })
    ) : j.length === 0 ? s.createElement(p, {
      description: F ? "未找到匹配的技能" : "技能池暂无可用技能",
      image: p.PRESENTED_IMAGE_SIMPLE
    }) : s.createElement(
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
        const E = L.includes(b.name), _ = n.includes(b.name);
        return s.createElement(
          "div",
          {
            key: b.name,
            onClick: () => !_ && X(b.name),
            style: {
              position: "relative",
              padding: "10px 12px",
              border: `1px solid ${E ? "#0072f5" : "var(--ant-color-border-secondary, #e8e8e8)"}`,
              borderRadius: 6,
              cursor: _ ? "not-allowed" : "pointer",
              transition: "all 0.15s ease",
              background: E ? "rgba(0, 114, 245, 0.06)" : _ ? "var(--ant-color-fill-quaternary, #fafafa)" : "var(--ant-color-bg-container, #fff)",
              opacity: _ ? 0.5 : 1,
              minHeight: 64
            }
          },
          E ? s.createElement(
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
            S ? s.createElement(S) : "✓"
          ) : null,
          _ ? s.createElement(
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
          s.createElement(
            "div",
            {
              style: {
                display: "flex",
                alignItems: "center",
                gap: 6,
                marginBottom: 4,
                paddingRight: _ || E ? 24 : 0
              }
            },
            s.createElement(
              "span",
              { style: { fontSize: 16 } },
              b.emoji || "⚡"
            ),
            s.createElement(
              h,
              { title: b.name },
              s.createElement(
                v,
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
          b.description ? s.createElement(
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
          b.tags && b.tags.length > 0 ? s.createElement(
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
              (I, U) => s.createElement(
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
  const n = A().React, { useState: a, useEffect: l, useCallback: s, useRef: i } = n, {
    List: o,
    Tag: c,
    Switch: d,
    Button: u,
    Modal: p,
    Input: m,
    Spin: f,
    Empty: y,
    message: h,
    Typography: k,
    Segmented: S,
    Alert: x
  } = A().antd, { FileTextOutlined: v, PlusOutlined: L, EditOutlined: D, ReloadOutlined: F } = A().antdIcons || {}, { Text: G } = k, [j, K] = a([]), [X, H] = a(!0), [b, E] = a(
    t || []
  ), [_, I] = a(!1), [U, $] = a(null), [O, z] = a(""), [w, le] = a(""), [oe, B] = a(!1), [R, ne] = a("source"), Z = i(0), W = s(async () => {
    const Y = ++Z.current;
    H(!0);
    try {
      const Q = await Ba(e);
      Y === Z.current && K(Q);
    } catch (Q) {
      Y === Z.current && (h.error(Q.message || "加载工作区文档失败"), K([]));
    } finally {
      Y === Z.current && H(!1);
    }
  }, [e]);
  l(() => {
    W();
  }, [W]), l(() => {
    E(t || []);
  }, [t]);
  const ue = async (Y, Q) => {
    const ie = new Set(b);
    if (Q)
      ie.add(Y);
    else {
      if (Yn.includes(Y) && Y === "AGENTS.md") {
        h.warning("AGENTS.md 是核心文件，不能停用");
        return;
      }
      ie.delete(Y);
    }
    const he = Array.from(ie);
    E(he);
    try {
      await Da(e, he), h.success(Q ? "已启用记忆文件" : "已停用记忆文件"), r();
    } catch (we) {
      h.error(we.message || "更新失败"), E(t || []);
    }
  }, M = async (Y) => {
    try {
      const Q = await ce(
        `/workspace/files/${encodeURIComponent(Y)}`,
        { headers: { "X-Agent-Id": e } }
      );
      $(Y), z(Q.content || ""), ne("source"), I(!0);
    } catch (Q) {
      h.error(Q.message || "读取文件失败");
    }
  }, se = () => {
    $(null), z(""), le(""), ne("source"), I(!0);
  }, me = async () => {
    let Y;
    try {
      Y = Na(U || w);
    } catch (Q) {
      h.warning(Q.message || "文件名无效");
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
        await Bt(e, Y, O);
      else {
        const Q = await Ua(
          e,
          Y,
          O,
          !0
        );
        E(Q.system_prompt_files);
      }
      h.success("保存成功"), I(!1), W(), r();
    } catch (Q) {
      const ie = Q != null && Q.message ? `：${Q.message}` : "";
      h.error(
        U ? (Q == null ? void 0 : Q.message) || "保存失败" : `创建并挂载失败，服务端已回滚文件${ie}`
      );
    } finally {
      B(!1);
    }
  };
  return X ? n.createElement(
    "div",
    { style: { textAlign: "center", padding: 40 } },
    n.createElement(f, { size: "large" })
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
        v ? n.createElement(v, {
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
          u,
          {
            size: "small",
            icon: F ? n.createElement(F) : void 0,
            onClick: W
          },
          "刷新"
        ),
        n.createElement(
          u,
          {
            type: "primary",
            size: "small",
            icon: L ? n.createElement(L) : void 0,
            onClick: se
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
      renderItem: (Y) => {
        const Q = b.includes(Y.filename), ie = Yn.includes(Y.filename);
        return n.createElement(
          o.Item,
          {
            actions: [
              n.createElement(
                u,
                {
                  type: "link",
                  size: "small",
                  icon: D ? n.createElement(D) : void 0,
                  onClick: () => M(Y.filename)
                },
                "编辑"
              )
            ]
          },
          n.createElement(o.Item.Meta, {
            avatar: n.createElement(v, {
              style: {
                fontSize: 20,
                color: Q ? "#1677ff" : "var(--ant-color-text-quaternary, #bfbfbf)"
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
              n.createElement(G, null, Y.filename),
              ie ? n.createElement(
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
              `${(Y.size / 1024).toFixed(1)} KB · 修改于 ${new Date(Y.modified_time).toLocaleString()}`
            )
          }),
          n.createElement(d, {
            checked: Q,
            size: "small",
            onChange: (he) => ue(Y.filename, he)
          })
        );
      }
    }),
    // Edit/New file modal
    n.createElement(
      p,
      {
        open: _,
        onCancel: () => I(!1),
        title: U ? `编辑 ${U}` : "新建 Markdown 文档",
        width: 700,
        onOk: me,
        confirmLoading: oe,
        okText: "保存"
      },
      U ? null : n.createElement(
        "div",
        { style: { marginBottom: 12 } },
        n.createElement(m, {
          placeholder: "文件名（如：油藏工程记忆库.md）",
          value: w,
          onChange: (Y) => le(Y.target.value),
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
        n.createElement(S, {
          size: "small",
          value: R,
          options: [
            { label: "源码", value: "source" },
            { label: "预览", value: "preview" }
          ],
          onChange: (Y) => ne(Y)
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
      R === "source" ? n.createElement(m.TextArea, {
        value: O,
        onChange: (Y) => z(Y.target.value),
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
    Typography: s,
    Empty: i,
    Button: o,
    message: c
  } = A().antd, { ThunderboltOutlined: d, CopyOutlined: u } = A().antdIcons || {}, { Text: p } = s, m = n(() => $r(e), [e]), f = (h) => {
    try {
      const k = A();
      k.setSelectedAgent && k.setSelectedAgent(t);
    } catch {
    }
    try {
      sessionStorage.setItem("ugsci_pending_prompt", h.value);
    } catch {
    }
    window.history.pushState({}, "", "/chat"), window.dispatchEvent(new PopStateEvent("popstate"));
  }, y = (h) => {
    var k;
    (k = navigator.clipboard) == null || k.writeText(h.value).then(() => {
      c.success("已复制到剪贴板");
    });
  };
  return m.length === 0 ? r.createElement(i, {
    description: "暂无推荐提问，请先为专家添加技能",
    image: i.PRESENTED_IMAGE_SIMPLE
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
        p,
        { strong: !0 },
        `推荐提问 (${m.length})`
      ),
      r.createElement(
        p,
        { type: "secondary", style: { fontSize: 12 } },
        "· 从技能描述中自动提取"
      )
    ),
    r.createElement(a, {
      dataSource: m,
      renderItem: (h, k) => r.createElement(
        a.Item,
        {
          actions: [
            r.createElement(
              o,
              {
                type: "link",
                size: "small",
                icon: u ? r.createElement(u) : void 0,
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
            `${k + 1}`
          ),
          title: r.createElement(
            "div",
            {
              style: {
                cursor: "pointer",
                color: "#1677ff"
              },
              onClick: () => f(h)
            },
            h.value
          ),
          description: r.createElement(
            p,
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
}, Ye = {
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
    InputNumber: s,
    Select: i,
    Button: o,
    Spin: c,
    Space: d,
    Typography: u,
    message: p
  } = A().antd, { PlayCircleOutlined: m, SaveOutlined: f } = A().antdIcons || {}, { Text: y } = u, [h, k] = r(!0), [S, x] = r(!1), [v, L] = r(!1), [D, F] = r(!1), [G, j] = r(6), [K, X] = r("h"), [H, b] = r("main"), [E, _] = r(300), [I, U] = r(!1), [$, O] = r("08:00"), [z, w] = r("22:00"), le = a(async () => {
    var W, ue;
    k(!0);
    try {
      const M = await Ka(e), se = qa(M.every ?? "6h");
      F(M.enabled ?? !1), j(se.number), X(se.unit), b(M.target ?? "main"), _(M.timeoutSeconds ?? 300), U(!!M.activeHours), O(((W = M.activeHours) == null ? void 0 : W.start) ?? "08:00"), w(((ue = M.activeHours) == null ? void 0 : ue.end) ?? "22:00");
    } catch (M) {
      p.error(M.message || "加载心跳配置失败");
    } finally {
      k(!1);
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
        timeoutSeconds: E,
        activeHours: I && $ && z ? { start: $, end: z } : void 0
      }), p.success("心跳配置已保存");
    } catch (W) {
      p.error(W.message || "保存心跳配置失败");
    } finally {
      x(!1);
    }
  }, B = async () => {
    L(!0);
    try {
      await Ya(e), p.success("已触发心跳检查");
    } catch (W) {
      p.error(W.message || "触发心跳失败");
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
  const R = (W, ue, M) => t.createElement(
    "div",
    { style: Br },
    t.createElement("div", { style: ot }, W),
    ue,
    M ? t.createElement(
      y,
      { type: "secondary", style: jr },
      M
    ) : null
  ), ne = (W, ue, M, se) => t.createElement(
    "div",
    { style: Ur },
    t.createElement(
      "div",
      null,
      t.createElement("div", { style: ot }, W),
      ue
    ),
    t.createElement(
      "div",
      null,
      t.createElement("div", { style: ot }, M),
      se
    )
  ), { Divider: Z } = A().antd;
  return t.createElement(
    "div",
    { style: { paddingBottom: 8 } },
    // ── Section: 基本设置 ──
    t.createElement("div", { style: Ye }, "基本设置"),
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
        t.createElement(s, {
          min: 1,
          value: G,
          onChange: (W) => j(W ?? 1),
          style: { width: "100%" }
        }),
        t.createElement(i, {
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
      t.createElement(i, {
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
      t.createElement(s, {
        min: 1,
        max: 3600,
        value: E,
        onChange: (W) => _(W ?? 300),
        style: { width: 200 }
      })
    ),
    // ── Section: 活跃时段 ──
    t.createElement(Z, { style: { margin: "8px 0 16px" } }),
    t.createElement("div", { style: Ye }, "活跃时段"),
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
          icon: f ? t.createElement(f) : void 0,
          loading: S,
          onClick: oe,
          style: Be
        },
        "保存配置"
      ),
      t.createElement(
        o,
        {
          icon: m ? t.createElement(m) : void 0,
          loading: v,
          onClick: B
        },
        "立即执行"
      )
    )
  );
}
function sl({
  agentId: e,
  onRefresh: t
}) {
  const r = A().React, { useState: n, useEffect: a, useCallback: l } = r, {
    List: s,
    Tag: i,
    Switch: o,
    Button: c,
    Empty: d,
    Spin: u,
    Typography: p,
    message: m
  } = A().antd, { PlusOutlined: f, ReloadOutlined: y, DeleteOutlined: h } = A().antdIcons || {}, { Text: k, Paragraph: S } = p, [x, v] = n([]), [L, D] = n(!0), [F, G] = n(!1), [j, K] = n([]), [X, H] = n(!1), b = l(async () => {
    D(!0);
    try {
      const O = await qt(e);
      v(O);
    } catch (O) {
      m.error(O.message || "加载技能失败"), v([]);
    } finally {
      D(!1);
    }
  }, [e]);
  a(() => {
    b();
  }, [b]);
  const E = async () => {
    G(!0), H(!0);
    try {
      const O = await Vt(!0);
      K(O);
    } catch (O) {
      m.error(O.message || "加载技能池失败");
    } finally {
      H(!1);
    }
  }, _ = async (O) => {
    let z = 0, w = 0;
    for (const le of O)
      try {
        await hn(e, le), z++;
      } catch {
        w++;
      }
    z > 0 ? (m.success(
      `成功添加 ${z} 个技能${w > 0 ? `，${w} 个失败` : ""}`
    ), b(), t()) : w > 0 && m.error("添加技能失败"), G(!1);
  }, I = async (O, z) => {
    try {
      z ? await Pr(e, O.name) : await Mr(e, O.name), m.success(z ? "已启用" : "已停用"), b(), t();
    } catch (w) {
      m.error(w.message || "操作失败");
    }
  }, U = async (O) => {
    try {
      await En(e, O), m.success(`技能「${O}」已移除`), b(), t();
    } catch (z) {
      m.error(z.message || "移除技能失败");
    }
  };
  if (L)
    return r.createElement(
      "div",
      { style: { textAlign: "center", padding: 40 } },
      r.createElement(u, { size: "large" })
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
        k,
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
            icon: f ? r.createElement(f) : void 0,
            onClick: E,
            style: Be
          },
          "从技能池添加"
        )
      )
    ),
    x.length === 0 ? r.createElement(d, {
      description: "该专家暂无技能",
      image: d.PRESENTED_IMAGE_SIMPLE
    }) : r.createElement(s, {
      dataSource: x,
      renderItem: (O) => r.createElement(
        s.Item,
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
            r.createElement(k, { strong: !0 }, O.name),
            O.version_text ? r.createElement(
              i,
              { style: { fontSize: 10 } },
              `v${O.version_text}`
            ) : null
          ),
          O.description ? r.createElement(
            S,
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
function il({
  agentId: e,
  onRefresh: t,
  isActive: r
}) {
  const n = A().React, { useState: a, useEffect: l, useCallback: s } = n, {
    List: i,
    Tag: o,
    Button: c,
    Empty: d,
    Spin: u,
    Modal: p,
    Input: m,
    Typography: f,
    message: y
  } = A().antd, { PlusOutlined: h, ReloadOutlined: k, DeleteOutlined: S } = A().antdIcons || {}, { Text: x, Paragraph: v } = f, { TextArea: L } = m, [D, F] = a([]), [G, j] = a(!0), [K, X] = a(!1), [H, b] = a(`{
  "mcpServers": {
    "example-client": {
      "command": "npx",
      "args": ["-y", "@example/mcp-server"],
      "env": {}
    }
  }
}`), [E, _] = a(!1), I = s(async () => {
    j(!0);
    try {
      const z = await vn(e);
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
        await bn(e, {
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
    n.createElement(u, { size: "large" })
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
            icon: k ? n.createElement(k) : void 0,
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
    }) : n.createElement(i, {
      dataSource: D,
      renderItem: (z) => n.createElement(
        i.Item,
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
                icon: S ? n.createElement(S) : void 0,
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
            v,
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
      p,
      {
        open: K,
        title: "添加 MCP 客户端 (JSON)",
        onCancel: () => X(!1),
        onOk: O,
        confirmLoading: E,
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
    Card: s,
    InputNumber: i,
    Input: o,
    Select: c,
    Switch: d,
    Button: u,
    Spin: p,
    Space: m,
    Typography: f,
    Divider: y,
    message: h
  } = A().antd, { SaveOutlined: k } = A().antdIcons || {}, { Text: S } = f, [x, v] = r(!0), [L, D] = r(!1), F = l(null), [G, j] = r(60), [K, X] = r(""), [H, b] = r(!0), [E, _] = r(30), [I, U] = r("zh"), [$, O] = r("UTC"), [z, w] = r(!0), [le, oe] = r(100), [B, R] = r(!0), [ne, Z] = r(3), [W, ue] = r(1), [M, se] = r(!0), [me, Y] = r(3), [Q, ie] = r(2), [he, we] = r(60), [Ae, xe] = r(1), [ee, be] = r(0), [Ee, te] = r(1), [de, fe] = r(0), [V, C] = r(30), [ge, q] = r(50), [T, re] = r("light"), [pe, Ie] = r("scroll"), [Le, Ne] = r("remelight"), [Re, Ge] = r("AUTO"), et = a(async () => {
    var ae, ze, $e, Oe, We, Je;
    v(!0);
    try {
      const [_e, St, Kt] = await Promise.all([
        Qa(e),
        el(e).catch(() => "zh"),
        nl().catch(() => "UTC")
      ]);
      F.current = _e, j(_e.shell_command_timeout ?? 60), X(_e.shell_command_executable ?? "");
      const mt = _e.auto_title_config ?? { enabled: !0, timeout_seconds: 30 };
      b(mt.enabled ?? !0), _(mt.timeout_seconds ?? 30), U(St), O(Kt);
      const Ke = _e.loop ?? {};
      w(((ae = Ke.iteration) == null ? void 0 : ae.enabled) ?? !0), oe(((ze = Ke.iteration) == null ? void 0 : ze.max_iterations) ?? _e.max_iters ?? 100), R((($e = Ke.doom_loop) == null ? void 0 : $e.enabled) ?? !0), Z(((Oe = Ke.doom_loop) == null ? void 0 : Oe.window_size) ?? 3), ue(((We = Ke.doom_loop) == null ? void 0 : We.similarity_threshold) ?? 1), se(_e.llm_retry_enabled ?? !0), Y(_e.llm_max_retries ?? 3), ie(_e.llm_backoff_base ?? 2), we(_e.llm_backoff_cap ?? 60), xe(_e.llm_max_concurrent ?? 1), be(_e.llm_max_qpm ?? 0), te(_e.llm_rate_limit_pause ?? 1), fe(_e.llm_rate_limit_jitter ?? 0), C(_e.llm_acquire_timeout ?? 30), q(_e.history_max_length ?? 50), re(_e.context_manager_backend ?? "light"), Ie(((Je = _e.light_context_config) == null ? void 0 : Je.strategy) ?? "scroll"), Ne(_e.memory_manager_backend ?? "remelight"), Ge(_e.approval_level ?? "AUTO");
    } catch (_e) {
      h.error(_e.message || "加载运行配置失败");
    } finally {
      v(!1);
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
            timeout_seconds: E
          },
          llm_retry_enabled: M,
          llm_max_retries: me,
          llm_backoff_base: Q,
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
      t.createElement(p, { size: "large" })
    );
  const Te = (ae, ze, $e) => t.createElement(
    "div",
    { style: Br },
    t.createElement("div", { style: ot }, ae),
    ze,
    $e ? t.createElement(
      S,
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
      { style: Ye },
      "基础设置"
    ),
    Me(
      "Shell 命令超时 (秒)",
      t.createElement(i, {
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
      t.createElement(m, null, t.createElement(d, {
        checked: H,
        onChange: (ae) => b(ae)
      })),
      "标题生成超时 (秒)",
      t.createElement(i, {
        min: 5,
        value: E,
        onChange: (ae) => _(ae ?? 30),
        style: { width: "100%" },
        disabled: !H
      })
    ),
    // ── Section: 审批级别 ──
    t.createElement(y, { style: { margin: "8px 0 16px" } }),
    t.createElement("div", { style: Ye }, "审批级别"),
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
    t.createElement("div", { style: Ye }, "迭代与循环"),
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
      t.createElement(i, {
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
      t.createElement(i, {
        min: 2,
        max: 20,
        value: ne,
        onChange: (ae) => Z(ae ?? 3),
        style: { width: "100%" }
      }),
      "相似度阈值",
      t.createElement(i, {
        min: 0,
        max: 1,
        step: 0.05,
        value: W,
        onChange: (ae) => ue(ae ?? 1),
        style: { width: "100%" }
      })
    ) : null,
    // ── Section: LLM 重试 ──
    t.createElement(y, { style: { margin: "8px 0 16px" } }),
    t.createElement("div", { style: Ye }, "LLM 重试"),
    Te(
      "启用 LLM 重试",
      t.createElement(d, {
        checked: M,
        onChange: (ae) => se(ae)
      })
    ),
    Me(
      "最大重试次数",
      t.createElement(i, {
        min: 1,
        value: me,
        onChange: (ae) => Y(ae ?? 3),
        style: { width: "100%" },
        disabled: !M
      }),
      "退避基数 (秒)",
      t.createElement(i, {
        min: 0.1,
        step: 0.1,
        value: Q,
        onChange: (ae) => ie(ae ?? 2),
        style: { width: "100%" },
        disabled: !M
      })
    ),
    Te(
      "退避上限 (秒)",
      t.createElement(i, {
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
    t.createElement("div", { style: Ye }, "LLM 限流"),
    Me(
      "最大并发数",
      t.createElement(i, {
        min: 1,
        value: Ae,
        onChange: (ae) => xe(ae ?? 1),
        style: { width: "100%" }
      }),
      "最大 QPM (0=不限)",
      t.createElement(i, {
        min: 0,
        step: 10,
        value: ee,
        onChange: (ae) => be(ae ?? 0),
        style: { width: "100%" }
      })
    ),
    Me(
      "限流暂停时间 (秒)",
      t.createElement(i, {
        min: 1,
        step: 0.5,
        value: Ee,
        onChange: (ae) => te(ae ?? 1),
        style: { width: "100%" }
      }),
      "限流抖动 (秒)",
      t.createElement(i, {
        min: 0,
        step: 0.5,
        value: de,
        onChange: (ae) => fe(ae ?? 0),
        style: { width: "100%" }
      })
    ),
    Te(
      "获取超时 (秒)",
      t.createElement(i, {
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
    t.createElement("div", { style: Ye }, "上下文与记忆"),
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
      t.createElement(i, {
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
        u,
        {
          type: "primary",
          icon: k ? t.createElement(k) : void 0,
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
  const a = A().React, { useState: l, useEffect: s, useCallback: i } = a, { Modal: o, Tabs: c, Spin: d, Typography: u } = A().antd, { SettingOutlined: p } = A().antdIcons || {}, { Text: m } = u, [f, y] = l([]), [h, k] = l(!1), [S, x] = l("heartbeat"), v = i(async () => {
    if (e) {
      k(!0);
      try {
        const G = await al(e.agent.id);
        y(G);
      } catch {
        y([]);
      } finally {
        k(!1);
      }
    }
  }, [e]);
  if (s(() => {
    t && e && v();
  }, [t, e, v]), !e) return null;
  const { agent: L } = e, D = () => {
    v(), n();
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
        systemPromptFiles: f,
        onRefresh: D
      })
    },
    {
      key: "skills",
      label: `技能 (${e.skills.filter((G) => G.enabled !== !1).length})`,
      children: a.createElement(sl, {
        agentId: L.id,
        onRefresh: n
      })
    },
    {
      key: "mcp",
      label: `MCP (${e.mcps.length})`,
      children: a.createElement(il, {
        agentId: L.id,
        onRefresh: n,
        isActive: S === "mcp"
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
        p ? a.createElement(p, { style: { fontSize: 18 } }) : null,
        a.createElement("span", null, `配置 - ${L.name}`),
        a.createElement(
          m,
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
      activeKey: S,
      onChange: (G) => x(G),
      size: "small",
      tabBarStyle: { marginBottom: 16 }
    })
  );
}
const ml = [
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
], ul = ml;
function Zn(e) {
  return Ft(`/ugsci/avatar/${encodeURIComponent(e)}`);
}
function er(e) {
  const t = e.map(encodeURIComponent).join(",");
  return Ft(`/ugsci/avatar/team/${t}`);
}
function He({
  name: e,
  size: t = 32,
  borderRadius: r = "50%"
}) {
  const n = A().React, [a, l] = n.useState(0), s = a === 0 ? Zn(e) : `${Zn(e)}?_r=${a}`;
  return n.createElement("img", {
    src: s,
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
function wn({
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
  const s = e.slice(0, 5), i = a === 0 ? er(s) : `${er(s)}?_r=${a}`;
  return n.createElement("img", {
    src: i,
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
async function tr(e) {
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
  const a = A().React, { Card: l, Tag: s, Badge: i, Typography: o, Spin: c, Button: d, Tooltip: u } = A().antd, { Text: p } = o, { ThunderboltOutlined: m, SettingOutlined: f } = A().antdIcons || {}, { agent: y, skills: h, mcps: k, loading: S } = e, x = y.enabled, v = h.filter((F) => F.enabled !== !1).map((F) => F.name), L = k.map((F) => F.name || F.key), D = y.active_model ? `${y.active_model.provider_id}/${y.active_model.model}` : null;
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
            p,
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
      a.createElement(i, {
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
        s,
        { color: "geekblue", style: { fontSize: 11 } },
        `🤖 ${D}`
      )
    ) : null,
    // Skills
    S ? a.createElement(c, { size: "small" }) : a.createElement(
      "div",
      { style: { marginBottom: 6 } },
      a.createElement(
        "div",
        { style: { fontSize: 11, color: "var(--ant-color-text-tertiary, #8c8c8c)", marginBottom: 4 } },
        `技能 (${v.length})`
      ),
      a.createElement(Qn, {
        items: v,
        max: 4,
        color: "cyan",
        emptyText: "未配置技能"
      })
    ),
    // MCP
    !S && L.length > 0 ? a.createElement(
      "div",
      { style: { marginTop: "auto" } },
      a.createElement(
        "div",
        { style: { fontSize: 11, color: "var(--ant-color-text-tertiary, #8c8c8c)", marginBottom: 4 } },
        `MCP (${L.length})`
      ),
      a.createElement(Qn, {
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
        u,
        { title: "配置专家", placement: "top" },
        a.createElement(
          d,
          {
            type: "text",
            size: "small",
            icon: f ? a.createElement(f, {
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
          icon: m ? a.createElement(m) : void 0,
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
    Descriptions: s,
    Tag: i,
    Typography: o,
    Space: c,
    Button: d,
    Empty: u,
    Tabs: p,
    List: m,
    Spin: f,
    Modal: y,
    message: h
  } = A().antd, { Text: k, Paragraph: S } = o, {
    EditOutlined: x,
    ThunderboltOutlined: v,
    FileTextOutlined: L,
    ToolOutlined: D,
    PlusOutlined: F
  } = A().antdIcons || {}, [G, j] = a.useState(!1), [K, X] = a.useState(
    []
  ), [H, b] = a.useState(!1);
  if (!e) return null;
  const { agent: E, config: _, skills: I, mcps: U, loading: $ } = e, O = I.filter((M) => M.enabled !== !1), z = (M) => {
    window.history.pushState({}, "", M), window.dispatchEvent(new PopStateEvent("popstate"));
  }, w = a.createElement(
    "div",
    null,
    a.createElement(
      s,
      { column: 1, bordered: !0, size: "small" },
      a.createElement(s.Item, { label: "专家名称" }, E.name),
      a.createElement(
        s.Item,
        { label: "专家 ID" },
        a.createElement("code", { style: { fontSize: 12 } }, E.id)
      ),
      a.createElement(
        s.Item,
        { label: "状态" },
        a.createElement(
          i,
          { color: E.enabled ? "green" : "default" },
          E.enabled ? "启用" : "停用"
        )
      ),
      a.createElement(
        s.Item,
        { label: "功能简介" },
        E.description ? Ht(E.description, a) : "暂无描述"
      ),
      a.createElement(
        s.Item,
        { label: "使用模型" },
        E.active_model ? `${E.active_model.provider_id} / ${E.active_model.model}` : "使用全局默认模型"
      ),
      _ != null && _.workspace_dir ? a.createElement(
        s.Item,
        { label: "工作区路径" },
        a.createElement(
          "code",
          { style: { fontSize: 11 } },
          _.workspace_dir
        )
      ) : null,
      _ != null && _.approval_level ? a.createElement(
        s.Item,
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
        a.createElement(k, { strong: !0 }, "系统提示词文件")
      ),
      a.createElement(
        c,
        { wrap: !0 },
        ..._.system_prompt_files.map(
          (M, se) => a.createElement(
            i,
            {
              key: se,
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
    let se = 0, me = 0;
    for (const Y of M)
      try {
        await hn(E.id, Y), se++;
      } catch {
        me++;
      }
    se > 0 ? (h.success(
      `成功添加 ${se} 个技能${me > 0 ? `，${me} 个失败` : ""}`
    ), n()) : me > 0 && h.error("添加技能失败"), j(!1);
  }, B = async (M) => {
    try {
      await En(E.id, M), h.success(`技能「${M}」已移除`), n();
    } catch (se) {
      h.error(se.message || "移除技能失败");
    }
  }, R = async (M) => {
    try {
      await Or(E.id, M), h.success(`MCP「${M}」已移除`), n();
    } catch (se) {
      h.error(se.message || "移除 MCP 失败");
    }
  }, ne = $ ? a.createElement(
    "div",
    { style: { textAlign: "center", padding: 40 } },
    a.createElement(f, { size: "large" })
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
        k,
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
    O.length === 0 ? a.createElement(u, {
      description: "该专家暂无已启用的技能",
      image: u.PRESENTED_IMAGE_SIMPLE
    }) : a.createElement(m, {
      dataSource: O,
      renderItem: (M) => a.createElement(
        m.Item,
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
            a.createElement(k, { strong: !0 }, M.name),
            M.version_text ? a.createElement(
              i,
              { style: { fontSize: 10 } },
              `v${M.version_text}`
            ) : null
          ),
          M.description ? a.createElement(
            S,
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
              (se, me) => a.createElement(
                i,
                {
                  key: me,
                  color: "cyan",
                  style: { fontSize: 10 }
                },
                se
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
    a.createElement(f, { size: "large" })
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
        k,
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
            window.history.pushState({}, "", `/agents/${E.id}/mcp`), window.dispatchEvent(new PopStateEvent("popstate"));
          }
        },
        "配置 MCP"
      )
    ),
    U.length === 0 ? a.createElement(u, {
      description: "该专家暂无关联的 MCP 客户端，点击「配置 MCP」添加",
      image: u.PRESENTED_IMAGE_SIMPLE
    }) : a.createElement(m, {
      dataSource: U,
      renderItem: (M) => a.createElement(
        m.Item,
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
              k,
              { strong: !0 },
              M.name || M.key
            ),
            a.createElement(
              i,
              {
                color: M.enabled ? "green" : "default",
                style: { fontSize: 10 }
              },
              M.enabled ? "启用" : "停用"
            ),
            a.createElement(
              i,
              { color: "purple", style: { fontSize: 10 } },
              M.transport
            )
          ),
          M.description ? a.createElement(
            S,
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
        a.createElement(k, { strong: !0 }, "工具配置")
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
        agentId: E.id
      })
    },
    {
      key: "knowledge",
      label: "专家记忆",
      children: a.createElement(Rr, {
        agentId: E.id,
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
        a.createElement(He, { name: E.name, size: 28 }),
        a.createElement("span", null, E.name)
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
                M.setSelectedAgent && M.setSelectedAgent(E.id);
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
            icon: v ? a.createElement(v) : void 0,
            onClick: () => {
              r();
              try {
                const M = A();
                M.setSelectedAgent && M.setSelectedAgent(E.id);
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
    a.createElement(p, {
      items: ue,
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
    Card: s,
    Tag: i,
    Input: o,
    Row: c,
    Col: d,
    Spin: u,
    message: p,
    Typography: m
  } = A().antd, { Text: f } = m, { FileAddOutlined: y } = A().antdIcons || {}, [h, k] = a(!1), [S, x] = a(""), [v, L] = a(!1), D = async (j) => {
    k(!0);
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
          ({ clientKey: E, client: _ }) => bn(K.id, {
            client_key: E,
            client: _
          })
        )
      ])).filter(
        (E) => E.status === "rejected"
      ).length;
      b > 0 ? p.warning(
        `专家「${j.name}」已创建，${b} 项初始配置失败，可在专家配置中重试`
      ) : p.success(`专家「${j.name}」创建成功`), await tr(K.id), L(!1), setTimeout(() => {
        t(), r();
      }, 0);
    } catch (K) {
      p.error(K.message || "创建专家失败");
    } finally {
      k(!1);
    }
  }, F = ul.filter((j) => {
    if (!S.trim()) return !0;
    const K = S.toLowerCase();
    return j.name.toLowerCase().includes(K) || j.description.toLowerCase().includes(K) || j.category.toLowerCase().includes(K);
  }), G = async (j) => {
    k(!0);
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
      const X = await yn(K.id);
      X.approval_level = j.approval_level, await ce(`/agents/${encodeURIComponent(K.id)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(X)
      }), await tr(K.id), p.success(`专家「${j.name}」创建成功`), t(), r();
    } catch (K) {
      p.error(K.message || "创建专家失败");
    } finally {
      k(!1);
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
          value: S,
          onChange: (j) => x(j.target.value),
          allowClear: !0
        })
      ),
      h ? n.createElement(
        "div",
        { style: { textAlign: "center", padding: 60 } },
        n.createElement(u, { size: "large" }),
        n.createElement(
          "div",
          { style: { marginTop: 12, color: "var(--ant-color-text-tertiary, #8c8c8c)" } },
          "正在创建专家..."
        )
      ) : n.createElement(
        c,
        { gutter: [12, 12] },
        // ── Blank template card (always first) ──
        S.trim() ? null : n.createElement(
          d,
          { xs: 24, sm: 12 },
          n.createElement(
            s,
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
                  f,
                  { strong: !0, style: { fontSize: 15 } },
                  "从空白模版开始创建"
                ),
                n.createElement(
                  "div",
                  null,
                  n.createElement(
                    i,
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
              s,
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
                    f,
                    { strong: !0, style: { fontSize: 15 } },
                    j.name
                  ),
                  n.createElement(
                    "div",
                    null,
                    n.createElement(
                      i,
                      { color: "blue", style: { fontSize: 10 } },
                      j.category
                    ),
                    j.approval_level === "MANUAL" ? n.createElement(
                      i,
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
      open: v,
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
    const s = a.trim();
    if (!s || !gt(l))
      throw new Error(`MCP「${a || "未命名"}」配置无效`);
    const i = typeof l.url == "string" ? l.url : "", o = typeof l.command == "string" ? l.command : "";
    if (!i && !o)
      throw new Error(`MCP「${s}」需要配置 url 或 command`);
    const d = (typeof l.transport == "string" ? l.transport : typeof l.type == "string" ? l.type : "") === "sse" ? "sse" : i ? "streamable_http" : "stdio";
    return {
      clientKey: s,
      client: {
        name: typeof l.name == "string" ? l.name : s,
        description: typeof l.description == "string" ? l.description : "",
        enabled: typeof l.enabled == "boolean" ? l.enabled : !0,
        transport: d,
        url: i,
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
  const n = A().React, { useState: a, useEffect: l, useMemo: s } = n, {
    Modal: i,
    Input: o,
    Select: c,
    Button: d,
    Row: u,
    Col: p,
    Spin: m,
    Tag: f,
    Typography: y,
    message: h
  } = A().antd, { CheckCircleOutlined: k } = A().antdIcons || {}, { Text: S } = y, [x, v] = a(""), [L, D] = a(""), [F, G] = a(""), [j, K] = a(""), [X, H] = a([]), [b, E] = a([]), [_, I] = a(!1), [U, $] = a(""), [O, z] = a(!1);
  l(() => {
    e && (v(""), D(""), G(""), K(""), E([]), $(""), z(!1), I(!0), Vt(!0).then(H).catch((Z) => {
      H([]), h.error(Z.message || "加载技能池失败");
    }).finally(() => I(!1)));
  }, [e]);
  const w = L.trim(), le = s(() => w ? w.length < 2 || w.length > 64 ? "ID 长度需为 2-64 个字符" : /^[a-zA-Z0-9][a-zA-Z0-9_-]*[a-zA-Z0-9]$/.test(w) ? w === "default" ? "default 是系统保留 ID" : "" : "仅允许字母、数字、连字符和下划线，且不能以符号开头或结尾" : "", [w]), oe = s(() => {
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
    E(
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
    n.createElement(S, { strong: !0, style: { fontSize: 15 } }, Z),
    W ? n.createElement(S, { type: "secondary", style: { fontSize: 12 } }, W) : null
  );
  return n.createElement(
    i,
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
        u,
        { gutter: [16, 12] },
        n.createElement(
          p,
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
            onChange: (Z) => v(Z.target.value),
            maxLength: 50
          })
        ),
        n.createElement(
          p,
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
          p,
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
        u,
        { gutter: [20, 16], align: "top" },
        n.createElement(
          p,
          { xs: 24, md: 12 },
          n.createElement(
            "div",
            { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 } },
            n.createElement(S, { strong: !0 }, "初始技能"),
            n.createElement(
              "div",
              { style: { display: "flex", gap: 4 } },
              n.createElement(d, { size: "small", onClick: R, disabled: _ }, "内置"),
              n.createElement(d, { size: "small", onClick: () => E([]), disabled: b.length === 0 }, "清空")
            )
          ),
          _ ? n.createElement("div", { style: { textAlign: "center", padding: 32 } }, n.createElement(m, { size: "small" })) : n.createElement(c, {
            mode: "multiple",
            value: b,
            onChange: E,
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
            b.length > 0 ? n.createElement(f, { color: "blue" }, `已选择 ${b.length} 个技能`) : n.createElement(S, { type: "secondary", style: { fontSize: 12 } }, "暂不添加技能")
          )
        ),
        n.createElement(
          p,
          { xs: 24, md: 12 },
          n.createElement(S, { strong: !0, style: { display: "block", marginBottom: 8 } }, "初始 MCP"),
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
            oe.error ? n.createElement(S, { type: "danger", style: { fontSize: 12 } }, oe.error) : oe.clients.length > 0 ? n.createElement(
              f,
              {
                color: "green",
                icon: k ? n.createElement(k) : void 0
              },
              `已识别 ${oe.clients.length} 个 MCP`
            ) : n.createElement(S, { type: "secondary", style: { fontSize: 12 } }, "暂不添加 MCP")
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
async function sn(e = !0) {
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
  const t = await sn(!1), r = new Set(t.map((n) => n.id));
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
      const { done: s, value: i } = await t.read();
      if (s) break;
      n += r.decode(i, { stream: !0 });
      let o;
      for (; (o = n.indexOf(`

`)) >= 0; ) {
        const c = n.slice(0, o);
        n = n.slice(o + 2);
        for (const d of c.split(`
`)) {
          if (!d.startsWith("data: ")) continue;
          const u = d.slice(6);
          let p;
          try {
            p = JSON.parse(u);
          } catch {
            continue;
          }
          if (p.error) {
            const m = p.error, f = typeof m == "string" ? m : (m == null ? void 0 : m.message) || "工作流启动失败";
            throw new Error(f);
          }
          if (p.object === "response" || p.type === "response") {
            const m = p.status;
            if (m === "failed" || m === "error") {
              const f = ((l = p.error) == null ? void 0 : l.message) || "工作流启动失败";
              throw new Error(f);
            }
            return;
          }
          if (p.object === "content" || p.type === "message")
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
  const s = (await a.json()).id, i = await Ve("/console/chat", {
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
  if (!i.ok) {
    const o = await i.text().catch(() => "");
    throw new Error(o || `HTTP ${i.status}`);
  }
  return await Cl(i), s;
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
async function xn(e, t, r) {
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
  return xn("/ugsci/team/state", e, t);
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
function nr({
  activeOnly: e = !1,
  enabled: t = !0
}) {
  const r = Fr(), n = r.React, { useCallback: a, useEffect: l, useRef: s, useState: i } = n, { Alert: o, Button: c, Card: d, Empty: u, Spin: p, Tag: m, Typography: f } = r.antd, { Text: y, Paragraph: h } = f, k = r.useSelectedAgent ? r.useSelectedAgent() : { id: "default" }, S = (k == null ? void 0 : k.id) || "default", [x, v] = i([]), [L, D] = i(!0), [F, G] = i(null), [j, K] = i(!1), X = s(null), H = s(0), b = s(!1), E = s(S), _ = a(
    async ($ = !0, O = !0) => {
      var le;
      if (!t || !O && b.current) return;
      (le = X.current) == null || le.abort();
      const z = new AbortController();
      X.current = z;
      const w = ++H.current;
      b.current = !0, $ && D(!0);
      try {
        const oe = await Il(S, z.signal);
        if (z.signal.aborted || w !== H.current)
          return;
        v(oe), K(!0), G(null);
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
    [S, t]
  );
  if (l(() => {
    var O;
    if (!t) {
      (O = X.current) == null || O.abort(), X.current = null, b.current = !1, H.current += 1;
      return;
    }
    E.current !== S && (E.current = S, v([]), G(null), K(!1)), _(!0, !0);
    const $ = e ? window.setInterval(() => {
      _(!1, !1);
    }, zl) : null;
    return () => {
      var z;
      $ !== null && window.clearInterval($), (z = X.current) == null || z.abort(), X.current = null, b.current = !1, H.current += 1;
    };
  }, [e, S, t, _]), L && !j) return n.createElement(p);
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
      u,
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
                m,
                {
                  color: $.status === "completed" ? "green" : $.status === "terminated" ? "orange" : "blue"
                },
                $.status
              ),
              n.createElement(m, null, $.current_phase),
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
    return (await xn(
      "/ugsci/team/preset-teams"
    )).teams;
  } catch {
    return null;
  }
}
async function $l() {
  try {
    return (await xn(
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
}, rr = [
  "plan",
  "dispatch",
  "verify",
  "synthesize",
  "completed"
], ar = 5e3, Ol = 3e4;
function Ml({ enabled: e = !0 }) {
  const t = Fr(), r = t.React, { useState: n, useEffect: a, useCallback: l, useRef: s } = r, { Card: i, Tag: o, Typography: c, Button: d, Steps: u, Empty: p, Alert: m, Spin: f } = t.antd, { ReloadOutlined: y } = t.antdIcons || {}, { Text: h, Paragraph: k } = c, S = t.useSelectedAgent ? t.useSelectedAgent() : { id: "default" }, x = (S == null ? void 0 : S.id) || "default", [v, L] = n(null), [D, F] = n(!1), [G, j] = n(null), K = s(null), X = s(0), H = s(0), b = s(0), E = s(null), _ = s(!1), I = l(
    async (W, ue = !0) => {
      var me;
      if (!e || !ue && _.current) return;
      (me = E.current) == null || me.abort();
      const M = new AbortController();
      E.current = M;
      const se = ++b.current;
      _.current = !0, W && F(!0);
      try {
        const Y = await _l(x, M.signal);
        if (M.signal.aborted || se !== b.current)
          return;
        X.current = 0, H.current = 0, K.current = Y, L(Y), j(null);
      } catch (Y) {
        if (M.signal.aborted || se !== b.current)
          return;
        X.current += 1;
        const Q = Math.min(
          Ol,
          ar * 2 ** (X.current - 1)
        );
        H.current = Date.now() + Q, j(
          Y instanceof Error ? Y.message : "专家团状态加载失败"
        );
      } finally {
        !M.signal.aborted && se === b.current && (E.current = null, _.current = !1, F(!1));
      }
    },
    [x, e]
  ), U = l(() => (X.current = 0, H.current = 0, I(!0)), [I]);
  if (a(() => {
    var ue;
    if ((ue = E.current) == null || ue.abort(), E.current = null, _.current = !1, b.current += 1, X.current = 0, H.current = 0, K.current = null, L(null), j(null), !e) return;
    U();
    const W = window.setInterval(() => {
      var M, se;
      Date.now() < H.current || ((M = K.current) == null ? void 0 : M.status) === "completed" || ((se = K.current) == null ? void 0 : se.status) === "terminated" || I(!1, !1);
    }, ar);
    return () => {
      var M;
      window.clearInterval(W), (M = E.current) == null || M.abort(), E.current = null, _.current = !1, b.current += 1;
    };
  }, [x, e, I, U]), D && !v && !G)
    return r.createElement(f);
  if (G && !v)
    return r.createElement(m, {
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
    r.createElement(m, {
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
  if ((v == null ? void 0 : v.status) === "unreadable")
    return $(
      r.createElement(m, {
        type: "warning",
        showIcon: !0,
        message: "专家团状态暂时无法读取",
        description: `实例 ${v.instance_id || "未知"} 的状态文件需要检查。`,
        style: { marginBottom: 16 },
        action: r.createElement(
          d,
          { size: "small", onClick: U, loading: D },
          "重试"
        )
      })
    );
  if (!v || !v.active) {
    if ((v == null ? void 0 : v.status) === "completed" || (v == null ? void 0 : v.status) === "terminated") {
      const W = v.status === "completed";
      return $(
        r.createElement(m, {
          type: W ? "success" : "info",
          showIcon: !0,
          message: W ? "专家团工作流已完成" : "专家团工作流已终止",
          description: W ? `实例 ${v.instance_id || "未知"} 已完成，结果文件保留在工作区。` : `原因：${v.state.termination_reason || "未知"}`,
          style: { marginBottom: 16 }
        })
      );
    }
    return $(
      r.createElement(p, {
        description: "暂无活跃的专家团工作流",
        style: { padding: 24 }
      })
    );
  }
  const O = v.state, z = O.current_phase || "plan", w = rr.indexOf(z), le = O.team_name || "未知团队", oe = O.team_mode || "pipeline", B = O.iteration || 0, R = O.members || [], ne = O.verify_retries || 0, Z = {
    pipeline: "顺序交接",
    coordinator: "主管协作",
    roundtable: "并行汇聚",
    router: "智能路由",
    review_loop: "评审迭代",
    debate: "多方论证"
  };
  return $(
    r.createElement(
      i,
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
      r.createElement(u, {
        current: w,
        size: "small",
        items: rr.map((W) => {
          const ue = Pl[W];
          return {
            title: `${ue.icon} ${ue.label}`,
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
          (W, ue) => r.createElement(
            o,
            { key: `${W.name}-${ue}`, style: { fontSize: 11 } },
            `${W.emoji || ""} ${W.name}（${W.role}）`
          )
        )
      ),
      O.task ? r.createElement(
        k,
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
  }, s = {
    pipeline: "#13c2c2",
    roundtable: "#722ed1",
    coordinator: "#1677ff",
    router: "#d46b08",
    review_loop: "#389e0d",
    debate: "#c41d7f"
  }, i = e.steps || [], o = e.mode === "roundtable" || e.mode === "router", c = {
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
      ...i.length > 0 ? i.map((d, u) => [
        u > 0 && !o ? t.createElement(
          "div",
          {
            key: `arrow-${u}`,
            style: {
              textAlign: "center",
              color: s[e.mode],
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
              border: `1px solid ${s[e.mode]}33`,
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
      ]).flat() : e.members.map((d, u) => [
        u > 0 && !o ? t.createElement(
          "div",
          {
            key: `arrow-${u}`,
            style: {
              textAlign: "center",
              color: s[e.mode],
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
              border: `1px solid ${s[e.mode]}33`,
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
  const l = A().React, { useState: s, useEffect: i, useCallback: o } = l, {
    Modal: c,
    Input: d,
    Button: u,
    Select: p,
    Tag: m,
    Typography: f,
    Switch: y,
    Empty: h,
    message: k,
    Divider: S,
    Steps: x
  } = A().antd, { PlusOutlined: v, DeleteOutlined: L, SaveOutlined: D, ArrowRightOutlined: F } = A().antdIcons || {}, { Text: G, Paragraph: j } = f, [K, X] = s(""), [H, b] = s("🤝"), [E, _] = s(""), [I, U] = s("pipeline"), [$, O] = s(""), [z, w] = s(""), [le, oe] = s([]), [B, R] = s([]), [ne, Z] = s(!1), [W, ue] = s(2), [M, se] = s(""), [me, Y] = s(""), [Q, ie] = s({}), [he, we] = s({}), [Ae, xe] = s(
    Rl
  ), ee = [
    { value: "pipeline", icon: "→", title: "顺序交接", description: "上一步产物成为下一位专家的上下文", topology: "A → B → C", accent: "#08979c" },
    { value: "roundtable", icon: "⇉", title: "并行汇聚", description: "独立并行分析，避免观点相互污染", topology: "A ∥ B ∥ C → 汇总", accent: "#531dab" },
    { value: "coordinator", icon: "◎", title: "主管协作", description: "主控专家拆解任务并按需组织成员", topology: "主管 → 专家组", accent: "#0958d9" },
    { value: "router", icon: "◇", title: "智能路由", description: "按任务能力需求选择最小充分专家集合", topology: "任务 → 路由 → 子集", accent: "#d46b08" },
    { value: "review_loop", icon: "↻", title: "评审迭代", description: "产出、独立审查、修订，直到满足标准", topology: "执行 ⇄ 评审", accent: "#389e0d" },
    { value: "debate", icon: "⚖", title: "多方论证", description: "独立立场、交叉质询，再由裁决者综合", topology: "观点 ⇄ 反驳 → 裁决", accent: "#c41d7f" }
  ];
  i(() => {
    e && (n ? (X(n.name), b(n.emoji), _(n.description), U(n.mode), O(n.coordinatorName || ""), w(n.taskTemplate), oe(n.steps || []), R(n.members.map((C) => C.name)), ue(n.maxReviewRounds || 2), se(n.successCriteria || ""), Y(n.routingInstruction || ""), ie(
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
任务描述：{任务描述}`), oe([]), R([]), ue(2), se(""), Y(""), ie({}), we({})));
  }, [e, n]), i(() => {
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
    B.includes(C) || (R([...B, C]), ie({ ...Q, [C]: "fixed" }), we({
      ...he,
      [C]: It(C)
    }), (I === "coordinator" || I === "debate") && !$ && O(C));
  }, te = (C) => {
    const ge = B.filter((re) => re !== C);
    R(ge), oe(le.filter((re) => re.agentName !== C));
    const q = { ...Q };
    delete q[C], ie(q);
    const T = { ...he };
    delete T[C], we(T), $ === C && O(ge[0] || "");
  }, de = (C, ge, q) => {
    const T = [...le];
    T[C] = { ...T[C], [ge]: q }, oe(T);
  }, fe = async () => {
    if (!K.trim()) {
      k.warning("请输入团队名称");
      return;
    }
    if (B.length < 2) {
      k.warning("至少需要选择 2 个成员");
      return;
    }
    if (!z.trim()) {
      k.warning("请输入任务模板");
      return;
    }
    if ((I === "coordinator" || I === "debate") && !$) {
      k.warning(I === "debate" ? "请选择裁决者" : "请选择主控专家");
      return;
    }
    Z(!0);
    try {
      let C = [...B];
      I === "coordinator" && $ ? C = [$, ...C.filter((re) => re !== $)] : I === "debate" && $ && (C = [...C.filter((re) => re !== $), $]);
      const ge = C.map(
        (re) => {
          var Re;
          const pe = r.find((Ge) => Ge.name === re), Ie = Q[re] || "fixed", Le = he[re] || It(re), Ne = Ae.find((Ge) => Ge.key === Le);
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
        description: E.trim() || `${K.trim()}（${B.length}人团队）`,
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
        routingInstruction: me.trim()
      };
      await Dr(T), k.success(n ? "团队已更新" : "团队已创建"), a(), t();
    } catch (C) {
      k.error(C.message || "保存失败");
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
        B.length > 0 ? l.createElement(wn, {
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
        value: E,
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
    l.createElement(S, { style: { margin: "12px 0" } }),
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
            u,
            {
              key: C.id,
              size: "small",
              icon: v ? l.createElement(v) : void 0,
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
                m,
                { color: "blue", style: { fontSize: 10 } },
                I === "debate" ? "裁决者" : "主控"
              ) : null
            ),
            l.createElement(
              "div",
              { style: { display: "flex", gap: 4 } },
              l.createElement(p, {
                size: "small",
                value: he[C] || It(C),
                style: { width: 132 },
                onChange: (ge) => we({ ...he, [C]: ge }),
                options: Ae.map((ge) => ({
                  value: ge.key,
                  label: ge.display_name
                }))
              }),
              l.createElement(p, {
                size: "small",
                value: Q[C] || "fixed",
                style: { width: 118 },
                onChange: (ge) => ie({ ...Q, [C]: ge }),
                options: [
                  { value: "fixed", label: "固定实例" },
                  { value: "preferred", label: "优先实例" },
                  { value: "temporary", label: "临时派生" }
                ]
              }),
              I === "coordinator" || I === "debate" ? l.createElement(
                u,
                {
                  size: "small",
                  type: "link",
                  onClick: () => O(C)
                },
                I === "debate" ? "设为裁决者" : "设为主控"
              ) : null,
              l.createElement(
                u,
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
        l.createElement(p, {
          value: W,
          onChange: (C) => ue(C),
          options: [1, 2, 3, 4, 5].map((C) => ({ value: C, label: `最多 ${C} 轮` }))
        }),
        l.createElement(d, {
          value: M,
          onChange: (C) => se(C.target.value),
          placeholder: "验收标准，例如：关键结论均有数据依据，且无高风险缺陷"
        })
      ) : l.createElement(d, {
        value: me,
        onChange: (C) => Y(C.target.value),
        placeholder: "路由偏好，例如：仅调用任务必需的专家；涉及模拟时优先油藏工程师"
      })
    ) : null,
    l.createElement(S, { style: { margin: "12px 0" } }),
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
        u,
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
                m,
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
    l.createElement(S, { style: { margin: "12px 0" } }),
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
function lr({
  team: e,
  agents: t,
  onLaunch: r,
  onEdit: n,
  onDelete: a
}) {
  var b;
  const l = A().React, { useState: s } = l, { Card: i, Tag: o, Typography: c, Button: d, Tooltip: u, Popconfirm: p } = A().antd, {
    TeamOutlined: m,
    RocketOutlined: f,
    UserOutlined: y,
    EditOutlined: h,
    DeleteOutlined: k,
    DownOutlined: S,
    UpOutlined: x
  } = A().antdIcons || {}, { Text: v, Paragraph: L } = c, [D, F] = s(!1), G = {
    coordinator: { label: "主管协作", color: "blue" },
    pipeline: { label: "顺序交接", color: "cyan" },
    roundtable: { label: "并行汇聚", color: "purple" },
    router: { label: "智能路由", color: "orange" },
    review_loop: { label: "评审迭代", color: "green" },
    debate: { label: "多方论证", color: "magenta" }
  }, j = G[e.mode] || G.coordinator, K = e.members.map((E) => {
    const _ = E.bindingMode === "temporary", I = _ ? null : (E.agentId && t.some((U) => U.id === E.agentId) ? E.agentId : null) || Gr(t, E.name);
    return { ...E, found: !!I, agentId: I, temporary: _ };
  }), X = K.filter((E) => E.found).length, H = e.coordinatorName || ((b = e.members[0]) == null ? void 0 : b.name);
  return l.createElement(
    i,
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
      l.createElement(wn, {
        members: e.members.map((E) => E.name),
        size: 36
      }),
      l.createElement(
        "div",
        { style: { flex: 1 } },
        l.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 6 } },
          l.createElement(
            v,
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
            u,
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
          u,
          { title: "编辑" },
          l.createElement(d, {
            type: "text",
            size: "small",
            icon: h ? l.createElement(h) : void 0,
            onClick: (E) => {
              E.stopPropagation(), n(e);
            }
          })
        ) : null,
        a ? l.createElement(
          u,
          { title: "删除" },
          l.createElement(
            p,
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
              icon: k ? l.createElement(k) : void 0,
              onClick: (E) => E.stopPropagation()
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
        (E) => l.createElement(
          u,
          {
            key: E.name,
            title: `${E.name}（${E.role}）${E.temporary ? " - OMP 临时派生" : E.found ? " - 已绑定实例" : " - OMP 按角色派发"}`
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
                background: E.found ? "#f0f5ff" : "#f0f0ff",
                border: `1px solid ${E.found ? "#d6e4ff" : "#d3adf7"}`,
                fontSize: 11
              }
            },
            l.createElement(He, { name: E.name, size: 18 }),
            l.createElement(
              v,
              {
                style: { fontSize: 11, color: E.found ? "#1f4e8c" : "#531dab" }
              },
              E.name
            ),
            E.temporary ? l.createElement(
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
        onClick: (E) => {
          E.stopPropagation(), F(!D);
        },
        icon: D ? x ? l.createElement(x) : "▲" : S ? l.createElement(S) : "▼"
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
        v,
        { type: "secondary", style: { fontSize: 11 } },
        H ? `${e.mode === "debate" ? "裁决者" : "主控"}: ${H}` : "OMP 动态编排"
      ),
      l.createElement(
        d,
        {
          type: "primary",
          size: "small",
          icon: f ? l.createElement(f) : void 0,
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
  const r = A().React, { useMemo: n, useState: a, useCallback: l, useEffect: s } = r, {
    Row: i,
    Col: o,
    Input: c,
    Empty: d,
    Typography: u,
    Tag: p,
    Button: m,
    Divider: f,
    Tabs: y,
    message: h
  } = A().antd, { SearchOutlined: k, PlusOutlined: S, RocketOutlined: x } = A().antdIcons || {}, { Text: v } = u, [L, D] = a(""), [F, G] = a([]), [j, K] = a([]), [X, H] = a(!1), [b, E] = a(null), [_, I] = a("preset");
  s(() => {
    let R = !0;
    return (async () => {
      try {
        await kl();
        const ne = await sn();
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
    sn().then(G).catch((R) => {
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
    E(R), H(!0);
  }, []), z = l(() => {
    E(null), H(!0);
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
        prefix: k ? r.createElement(k) : void 0,
        value: L,
        onChange: (R) => D(R.target.value),
        allowClear: !0,
        style: { flex: "1 1 280px", maxWidth: 400 }
      }),
      r.createElement(
        m,
        {
          type: "primary",
          size: "small",
          icon: S ? r.createElement(S) : void 0,
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
                i,
                { gutter: [12, 12] },
                ...B.map(
                  (R) => r.createElement(
                    o,
                    { key: R.id, xs: 24, sm: 12, md: 8 },
                    r.createElement(lr, {
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
                i,
                { gutter: [12, 12] },
                ...oe.map(
                  (R) => r.createElement(
                    o,
                    { key: R.id, xs: 24, sm: 12, md: 8 },
                    r.createElement(lr, {
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
              r.createElement(nr, {
                activeOnly: !0,
                enabled: _ === "active"
              })
            )
          },
          {
            key: "history",
            label: "讨论历史",
            children: r.createElement(nr, {
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
        H(!1), E(null);
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
function tn(e, t) {
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
    Button: s,
    Card: i,
    Col: o,
    Empty: c,
    Input: d,
    Popconfirm: u,
    Row: p,
    Space: m,
    Spin: f,
    Tabs: y,
    Tag: h,
    Tooltip: k,
    Typography: S,
    message: x
  } = A().antd, {
    ApartmentOutlined: v,
    DeleteOutlined: L,
    ReloadOutlined: D,
    RocketOutlined: F,
    PlayCircleOutlined: G,
    StopOutlined: j
  } = A().antdIcons || {}, { Text: K, Paragraph: X, Title: H } = S, b = A().useSelectedAgent, E = b ? b() : { id: "default" }, _ = (E == null ? void 0 : E.id) || "default", [I, U] = a([]), [$, O] = a([]), [z, w] = a([]), [le, oe] = a(!0), [B, R] = a(!0), [ne, Z] = a(null), [W, ue] = a(""), [M, se] = a(""), [me, Y] = a("templates"), [Q, ie] = a(/* @__PURE__ */ new Set()), he = n(null), we = $.some((T) => zt.has(T.status)), Ae = e.useMemo(() => {
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
        }), x.success("已从自然语言生成可编辑工作流草稿"), ue(""), se(""), await ee();
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
      ie((re) => {
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
        ie((re) => {
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
      i,
      {
        size: "small",
        title: "用自然语言生成工作流",
        style: { marginBottom: 16 }
      },
      e.createElement(
        m,
        { direction: "vertical", style: { width: "100%" }, size: 10 },
        e.createElement(d, {
          value: W,
          onChange: (T) => ue(T.target.value),
          placeholder: "工作流名称（可选）",
          maxLength: 80
        }),
        e.createElement(d.TextArea, {
          value: M,
          onChange: (T) => se(T.target.value),
          placeholder: "例如：先检查某储气库本周期压力和注采量数据，再由油藏工程师预测下周期能力，由独立完整性专家复核风险，最后形成带证据和不确定性的建议。",
          autoSize: { minRows: 3, maxRows: 8 }
        }),
        e.createElement(
          s,
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
      p,
      { gutter: [12, 12] },
      ...jl.map(
        (T) => e.createElement(
          o,
          { key: T.key, xs: 24, md: 8 },
          e.createElement(
            i,
            { style: { height: "100%" } },
            e.createElement(
              m,
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
                  s,
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
      i,
      { size: "small", title: "专家节点绑定策略", style: { marginTop: 16 } },
      e.createElement(
        p,
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
  ), C = le ? e.createElement(f) : I.length === 0 ? e.createElement(c, { description: "暂无工作流，可从模板创建" }) : e.createElement(
    p,
    { gutter: [12, 12] },
    ...I.map((T) => {
      const re = xe[T.id] || 0;
      return e.createElement(
        o,
        { key: T.id, xs: 24, md: 12, xl: 8 },
        e.createElement(
          i,
          {
            size: "small",
            title: e.createElement(
              m,
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
            m,
            { size: 8, wrap: !0 },
            e.createElement(h, { color: "geekblue" }, `${T.node_count} 个节点`),
            e.createElement(s, {
              size: "small",
              type: "primary",
              icon: G ? e.createElement(G) : void 0,
              disabled: !B,
              onClick: () => void te(T.id, T.name)
            }, "运行"),
            e.createElement(s, {
              size: "small",
              onClick: () => tn(T.id)
            }, "编辑"),
            e.createElement(
              u,
              {
                title: "确认删除",
                description: `确定要删除工作流「${T.name}」吗？此操作不可撤销。`,
                onConfirm: () => void de(T.id, T.name),
                okText: "删除",
                cancelText: "取消",
                okButtonProps: { danger: !0 }
              },
              e.createElement(s, {
                size: "small",
                danger: !0,
                icon: L ? e.createElement(L) : void 0
              }, "删除")
            )
          )
        )
      );
    })
  ), ge = le ? e.createElement(f) : $.length === 0 ? e.createElement(c, { description: "暂无工作流运行记录" }) : e.createElement(
    "div",
    { style: { display: "flex", flexDirection: "column", gap: 8 } },
    ...$.map((T) => {
      const re = Ae[T.flow_id] || T.flow_id, pe = zt.has(T.status), Ie = Wl(T.node_statuses), Le = T.duration_ms && T.duration_ms > 0 ? T.duration_ms : T.finished_at && T.started_at ? (T.finished_at - T.started_at) * 1e3 : pe && T.started_at ? (Date.now() / 1e3 - T.started_at) * 1e3 : 0;
      return e.createElement(
        i,
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
            k,
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
            k,
            { title: T.error },
            e.createElement(K, { type: "danger", style: { fontSize: 12 } }, "（有错误）")
          ) : null,
          e.createElement(
            "div",
            { style: { marginLeft: "auto", display: "flex", gap: 6 } },
            pe ? e.createElement(
              u,
              {
                title: "确认取消运行？",
                onConfirm: () => void fe(T.run_id),
                okText: "取消运行",
                cancelText: "保留",
                okButtonProps: { danger: !0 }
              },
              e.createElement(s, {
                size: "small",
                danger: !0,
                loading: Q.has(T.run_id),
                icon: j ? e.createElement(j) : void 0
              }, "取消运行")
            ) : null,
            e.createElement(
              s,
              { size: "small", type: "link", onClick: () => tn(void 0, T.run_id) },
              "查看详情"
            )
          )
        )
      );
    })
  ), q = e.createElement(
    m,
    null,
    e.createElement(s, {
      icon: D ? e.createElement(D) : void 0,
      onClick: () => void ee(),
      loading: le
    }, "刷新"),
    me !== "templates" ? e.createElement(s, {
      type: "primary",
      icon: v ? e.createElement(v) : F ? e.createElement(F) : void 0,
      onClick: () => tn(),
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
      activeKey: me,
      onChange: (T) => Y(T),
      tabBarExtraContent: q
    })
  );
}
function or(e, t) {
  var a, l;
  const r = e.coordinatorName || ((a = e.members[0]) == null ? void 0 : a.name), n = e.members.find((s) => s.name === r) || e.members[0];
  if ((n == null ? void 0 : n.bindingMode) !== "temporary" && (n != null && n.agentId) && t.some((s) => s.id === n.agentId))
    return n.agentId;
  if (r && (n == null ? void 0 : n.bindingMode) !== "temporary") {
    const s = Gr(t, r);
    if (s) return s;
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
    Empty: s,
    Input: i,
    Button: o,
    message: c,
    Row: d,
    Col: u,
    Tabs: p,
    Modal: m,
    Typography: f
  } = A().antd, {
    ReloadOutlined: y,
    PlusOutlined: h,
    SearchOutlined: k,
    TeamOutlined: S,
    UserOutlined: x
  } = A().antdIcons || {}, { Text: v, Paragraph: L } = f, [D, F] = t([]), [G, j] = t(!0), [K, X] = t(!1), [H, b] = t(null), [E, _] = t(""), [I, U] = t(!1), [$, O] = t(sr), [z, w] = t(
    null
  ), [le, oe] = t(""), [B, R] = t(!1), [ne, Z] = t(!1), [W, ue] = t(null), [M, se] = t([]), me = n(async () => {
    j(!0);
    try {
      const V = await Jt(), C = await Promise.all(
        V.map(async (ge) => {
          try {
            const [q, T, re] = await Promise.all([
              yn(ge.id).catch(() => null),
              qt(ge.id).catch(() => []),
              vn(ge.id).catch(() => [])
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
      F(C), se(V);
    } catch (V) {
      c.error(V.message || "加载专家列表失败"), F([]);
    } finally {
      j(!1);
    }
  }, []);
  r(() => {
    me();
  }, [me]), r(() => {
    const V = () => O(sr());
    return window.addEventListener("popstate", V), () => window.removeEventListener("popstate", V);
  }, []), r(() => {
    if (W && ne) {
      const V = D.find(
        (C) => C.agent.id === W.agent.id
      );
      V && V !== W && ue(V);
    }
  }, [D, W, ne]);
  const Y = n(
    async (V) => {
      var T;
      const C = V.coordinatorName || ((T = V.members[0]) == null ? void 0 : T.name), ge = or(V, M);
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
      await Q(V, ge, V.taskTemplate);
    },
    [M, c]
  ), Q = n(
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
        ), w(null), ie(`/chat/${Ie}`);
      } catch (q) {
        c.error(q.message || "发起团队任务失败");
      } finally {
        R(!1);
      }
    },
    [c]
  ), ie = (V) => {
    window.history.pushState({}, "", V), window.dispatchEvent(new PopStateEvent("popstate"));
  }, he = n((V) => {
    b(V), X(!0);
  }, []), we = n((V) => {
    ue(V), Z(!0);
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
      c.success(`已召唤专家「${V.agent.name}」，正在跳转至对话...`), ie("/chat");
    },
    [c]
  ), xe = a(() => {
    if (!E.trim()) return D;
    const V = E.toLowerCase();
    return D.filter(
      (C) => {
        var ge;
        return C.agent.name.toLowerCase().includes(V) || ((ge = C.agent.description) == null ? void 0 : ge.toLowerCase().includes(V)) || C.agent.id.toLowerCase().includes(V) || C.skills.some((q) => q.name.toLowerCase().includes(V));
      }
    );
  }, [D, E]), ee = D.filter((V) => V.agent.enabled).length, be = D.reduce(
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
          e.createElement(i, {
            placeholder: "搜索专家名称、描述或技能...",
            prefix: k ? e.createElement(k) : void 0,
            value: E,
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
        ) : xe.length === 0 ? e.createElement(s, {
          description: E ? "未找到匹配的专家" : "暂无专家，点击「创建专家」添加"
        }) : e.createElement(
          d,
          { gutter: [12, 12], align: "stretch" },
          ...xe.map(
            (V) => e.createElement(
              u,
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
        S ? e.createElement(S, { style: { fontSize: 14 } }) : null,
        "专家团"
      ),
      children: e.createElement(Ul, {
        agents: M,
        onLaunch: Y
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
              xt(), me();
            },
            loading: G
          },
          "刷新"
        ) : null
      )
    }),
    e.createElement(p, {
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
      onRefresh: () => me()
    }),
    // Template Modal
    e.createElement(gl, {
      open: I,
      onClose: () => U(!1),
      onCreated: () => me()
    }),
    // Config Modal (gear icon)
    e.createElement(dl, {
      expert: W,
      open: ne,
      onClose: () => Z(!1),
      onRefresh: () => me()
    }),
    // Team Launch Modal (for filling placeholders)
    z ? e.createElement(
      m,
      {
        open: !0,
        title: e.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 8 } },
          e.createElement(wn, {
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
          const V = or(
            z,
            M
          );
          if (!V) {
            c.error("固定协调者不可用或没有可用的控制器 Agent");
            return;
          }
          const C = le.trim() || z.taskTemplate;
          Q(z, V, C);
        },
        confirmLoading: B,
        okText: "发起任务",
        width: 600
      },
      e.createElement(
        "div",
        null,
        e.createElement(
          v,
          {
            type: "secondary",
            style: { fontSize: 12, display: "block", marginBottom: 8 }
          },
          "任务内容（请替换 {参数名} 等占位符后发起）："
        ),
        e.createElement(i.TextArea, {
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
          v,
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
  const a = A().React, { useState: l, useEffect: s, useCallback: i } = a, {
    Spin: o,
    Empty: c,
    Button: d,
    Row: u,
    Col: p,
    Card: m,
    Tag: f,
    Checkbox: y,
    Modal: h,
    Typography: k,
    Drawer: S,
    Descriptions: x,
    message: v
  } = A().antd, {
    ReloadOutlined: L,
    ThunderboltOutlined: D,
    SettingOutlined: F,
    CheckSquareOutlined: G,
    EyeOutlined: j,
    EyeInvisibleOutlined: K,
    DeleteOutlined: X,
    CloseOutlined: H
  } = A().antdIcons || {}, { Text: b, Paragraph: E } = k, [_, I] = l([]), [U, $] = l(!0), [O, z] = l(!1), [w, le] = l(null), [oe, B] = l(!1), [R, ne] = l(
    /* @__PURE__ */ new Set()
  ), [Z, W] = l(!1), [ue, M] = l(null), [se, me] = l(!1), Y = i(async () => {
    if (e) {
      $(!0);
      try {
        const te = await qt(e);
        I(te);
      } catch (te) {
        v.error(te.message || "加载技能失败"), I([]);
      } finally {
        $(!1);
      }
    }
  }, [e]);
  s(() => {
    Y();
  }, [Y, r]);
  const Q = (te) => {
    ne((de) => {
      const fe = new Set(de);
      return fe.has(te) ? fe.delete(te) : fe.add(te), fe;
    });
  }, ie = () => ne(/* @__PURE__ */ new Set()), he = () => ne(new Set(_.map((te) => te.name))), we = () => {
    oe ? (ie(), B(!1)) : B(!0);
  }, Ae = async () => {
    const te = Array.from(R);
    if (te.length !== 0) {
      W(!0);
      try {
        const { results: de } = await Ga(e, te), fe = Object.entries(de).filter(
          ([, C]) => C.success === !1
        ), V = te.length - fe.length;
        fe.length > 0 ? v.warning(
          `批量启用完成：成功 ${V} 个，失败 ${fe.length} 个`
        ) : v.success(`成功启用 ${te.length} 个技能`), ie(), await Y();
      } catch (de) {
        v.error(de.message || "批量启用失败");
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
        fe.length > 0 ? v.warning(
          `批量停用完成：成功 ${V} 个，失败 ${fe.length} 个`
        ) : v.success(`成功停用 ${te.length} 个技能`), ie(), await Y();
      } catch (de) {
        v.error(de.message || "批量停用失败");
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
          fe.length > 0 ? v.warning(
            `批量删除完成：成功 ${V} 个，失败 ${fe.length} 个`
          ) : v.success(`成功删除 ${te.length} 个技能`), ie(), await Y();
        } catch (de) {
          v.error(de.message || "批量删除失败");
        } finally {
          W(!1);
        }
      }
    });
  }, be = async (te) => {
    me(!0);
    try {
      te.enabled === !1 ? (await Pr(e, te.name), v.success(`已启用技能「${te.name}」`)) : (await Mr(e, te.name), v.success(`已禁用技能「${te.name}」`)), await Y();
    } catch (de) {
      v.error(de.message || "操作失败");
    } finally {
      me(!1);
    }
  }, Ee = (te) => {
    h.confirm({
      title: `确认删除技能「${te.name}」？`,
      content: "删除后技能将从当前专家工作区移除，此操作不可撤销。技能池中的原始技能不受影响。",
      okText: "确认删除",
      cancelText: "取消",
      okButtonProps: { danger: !0 },
      onOk: async () => {
        me(!0);
        try {
          await En(e, te.name), v.success(`已删除技能「${te.name}」`), await Y();
        } catch (de) {
          v.error(de.message || "删除失败");
        } finally {
          me(!1);
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
              onClick: ie
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
                xt(), Y();
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
      u,
      { gutter: [12, 12] },
      ..._.map(
        (te) => a.createElement(
          p,
          { key: te.name, xs: 24, sm: 12, md: 8, lg: 6 },
          a.createElement(
            m,
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
                oe ? Q(te.name) : (le(te), z(!0));
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
                  de.stopPropagation(), Q(te.name);
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
                f,
                { color: "default", style: { fontSize: 10 } },
                "已禁用"
              ) : a.createElement(
                f,
                { color: "green", style: { fontSize: 10 } },
                "已启用"
              )
            ),
            te.description ? a.createElement(
              E,
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
                f,
                { style: { fontSize: 10 } },
                `v${te.version_text}`
              ) : null,
              ...(te.tags || []).slice(0, 3).map(
                (de, fe) => a.createElement(
                  f,
                  { key: fe, color: "blue", style: { fontSize: 10 } },
                  de
                )
              )
            ),
            // Hover action footer (not in batch mode)
            !oe && ue === te.name ? a.createElement(
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
                  disabled: se,
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
                  disabled: se,
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
      S,
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
            (te, de) => a.createElement(f, { key: de, color: "blue" }, te)
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
  agentId: s,
  agentName: i
}) {
  const o = A().React, { useState: c, useMemo: d, useCallback: u, useEffect: p, useRef: m } = o, {
    Spin: f,
    Empty: y,
    Input: h,
    Button: k,
    Row: S,
    Col: x,
    Card: v,
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
    DownloadOutlined: E,
    ThunderboltOutlined: _,
    DeleteOutlined: I,
    PlusOutlined: U
  } = A().antdIcons || {}, { Text: $, Paragraph: O } = D, [z, w] = c(""), [le, oe] = c(!1), [B, R] = c(null), [ne, Z] = c([]), [W, ue] = c(!1), [M, se] = c(24), [me, Y] = c(null), [Q, ie] = c(!1), he = m(0), we = m(null), Ae = d(
    () => {
      var q;
      return new Set(
        ((q = t.find((T) => T.agent_id === s)) == null ? void 0 : q.skill_names) || []
      );
    },
    [t, s]
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
  p(() => {
    if (ee.length >= xe.length) return;
    const q = we.current;
    if (!q) return;
    const T = () => {
      se(
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
  const be = u((q) => {
    w(q), se(24);
  }, []), Ee = u(() => {
    const q = he.current;
    requestAnimationFrame(() => {
      window.scrollTo({ top: q, behavior: "auto" }), document.scrollingElement && (document.scrollingElement.scrollTop = q);
    });
  }, []), te = u(async () => {
    var q;
    he.current = ((q = document.scrollingElement) == null ? void 0 : q.scrollTop) ?? window.scrollY ?? 0;
    try {
      await a();
    } finally {
      Ee();
    }
  }, [a, Ee]), de = u(
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
  ), fe = u(
    async (q) => {
      if (R(q), Z(de(q.name)), oe(!0), !q.content) {
        ue(!0);
        try {
          const T = await La(q.name);
          R({ ...q, content: T });
        } catch {
        } finally {
          ue(!1);
        }
      }
    },
    [de]
  );
  p(() => {
    B && Z(de(B.name));
  }, [B, de, t]);
  const V = async (q) => {
    ie(!0);
    try {
      await hn(s, q.name), X.success(
        `已将技能「${q.name}」加载到当前专家「${i}」`
      ), l(q);
    } catch (T) {
      X.error(T.message || "加载技能失败");
    } finally {
      ie(!1);
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
        ie(!0);
        try {
          await Ja(q.name), X.success(`已从技能池删除「${q.name}」`), await te();
        } catch (T) {
          X.error(T.message || "删除失败");
        } finally {
          ie(!1);
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
          k,
          {
            icon: H ? o.createElement(H) : void 0,
            onClick: te,
            loading: n,
            size: "small"
          },
          "刷新"
        ),
        o.createElement(
          k,
          {
            type: "primary",
            icon: E ? o.createElement(E) : void 0,
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
      o.createElement(f, { size: "large" })
    ) : xe.length === 0 ? o.createElement(y, {
      description: z ? "未找到匹配的技能" : "技能池为空"
    }) : o.createElement(
      o.Fragment,
      null,
      o.createElement(
        S,
        { gutter: [12, 12] },
        ...ee.map(
          (q) => o.createElement(
            x,
            { key: q.name, xs: 24, sm: 12, md: 8, lg: 6 },
            o.createElement(
              v,
              {
                hoverable: !0,
                size: "small",
                style: { cursor: "pointer", height: "100%" },
                onClick: () => fe(q),
                onMouseEnter: () => Y(q.name),
                onMouseLeave: () => Y(null)
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
              me === q.name ? o.createElement(
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
                  k,
                  {
                    size: "small",
                    type: "primary",
                    icon: U ? o.createElement(U) : void 0,
                    disabled: Q || Ae.has(q.name),
                    onClick: (T) => {
                      T.stopPropagation(), V(q);
                    }
                  },
                  Ae.has(q.name) ? "已加载" : "加载到当前Agent"
                ),
                o.createElement(
                  k,
                  {
                    size: "small",
                    danger: !0,
                    icon: I ? o.createElement(I) : void 0,
                    disabled: Q || q.protected,
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
          k,
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
        o.createElement(f, { size: "small" })
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
  const t = A().React, { useState: r, useEffect: n, useCallback: a, useMemo: l } = t, { Tabs: s, message: i } = A().antd, { ThunderboltOutlined: o, AppstoreOutlined: c } = A().antdIcons || {}, u = A().useSelectedAgent, p = u ? u() : null, m = (p == null ? void 0 : p.id) || "default";
  n(() => {
    gn();
  }, [m]);
  const [f, y] = r([]), [h, k] = r([]), [S, x] = r([]), [v, L] = r(!0), [D, F] = r("agent-skills"), [G, j] = r(0), K = a(async () => {
    L(!0);
    try {
      const [I, U, $] = await Promise.all([
        Vt(!0),
        Jt(),
        Ra()
      ]);
      k(I), y(U), x($);
    } catch (I) {
      i.error(I.message || "加载技能列表失败"), k([]);
    } finally {
      L(!1);
    }
  }, []);
  n(() => {
    K();
  }, [K]);
  const X = l(() => {
    const I = f.find((U) => U.id === m);
    return (I == null ? void 0 : I.name) || m;
  }, [f, m]), H = a(
    (I) => {
      x(
        (U) => U.some(($) => $.agent_id === m) ? U.map(($) => $.agent_id !== m || $.skill_names.includes(I.name) ? $ : {
          ...$,
          skill_names: [...$.skill_names, I.name]
        }) : [
          ...U,
          {
            agent_id: m,
            agent_name: X,
            skill_names: [I.name]
          }
        ]
      ), j((U) => U + 1);
    },
    [m, X]
  ), b = (I) => {
    window.history.pushState({}, "", I), window.dispatchEvent(new PopStateEvent("popstate"));
  }, E = [
    {
      key: "agent-skills",
      label: t.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        o ? t.createElement(o, { style: { fontSize: 14 } }) : null,
        "当前专家"
      ),
      children: t.createElement(Vl, {
        agentId: m,
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
        workspaceSkills: S,
        agents: f,
        loading: v,
        onReload: K,
        onSkillInstalled: H,
        agentId: m,
        agentName: X
      })
    }
  ], _ = t.createElement(s, {
    items: E,
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
const cn = {
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
async function Yl() {
  return ce("/ugsci/engines/list");
}
async function Ql(e) {
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
  const r = A().React, { Card: n, Tag: a, Typography: l } = A().antd, { Text: s } = l, i = e.status === "detected", o = Wr[e.category] || "📦", d = Jr.has(e.id) ? r.createElement("img", {
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
        borderColor: i ? void 0 : "var(--ant-color-border, #d9d9d9)",
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
            s,
            { strong: !0, style: { fontSize: 14 } },
            e.name
          ),
          r.createElement("br"),
          r.createElement(
            s,
            { type: "secondary", style: { fontSize: 11 } },
            e.vendor || "—"
          )
        )
      ),
      r.createElement(
        "div",
        { style: { display: "flex", flexDirection: "column", gap: 4, alignItems: "flex-end" } },
        i ? r.createElement(
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
        s,
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
        cn[e.category] || e.category
      ) : null,
      e.version ? r.createElement(
        a,
        { color: "blue", style: { fontSize: 11 } },
        `v${e.version}`
      ) : null,
      ...(e.modules || []).map(
        (u) => r.createElement(
          a,
          { key: u, color: "cyan", style: { fontSize: 10 } },
          u
        )
      )
    )
  );
}
function ro() {
  const e = A().React, { useState: t, useEffect: r, useCallback: n, useMemo: a } = e, {
    Spin: l,
    Empty: s,
    Button: i,
    message: o,
    Row: c,
    Col: d,
    Drawer: u,
    Descriptions: p,
    Tag: m,
    Typography: f,
    Modal: y,
    Input: h,
    Select: k,
    Popconfirm: S,
    Space: x
  } = A().antd, {
    ReloadOutlined: v,
    SearchOutlined: L,
    PlusOutlined: D,
    EditOutlined: F,
    DeleteOutlined: G,
    CopyOutlined: j,
    ExperimentOutlined: K
  } = A().antdIcons || {}, { Text: X, Paragraph: H } = f, [b, E] = t([]), [_, I] = t(!0), [U, $] = t(""), [O, z] = t(!1), [w, le] = t(null), [oe, B] = t(!1), [R, ne] = t(null), [Z, W] = t({}), [ue, M] = t(!1), se = n(async () => {
    I(!0);
    try {
      const ee = await Yl();
      E(ee.engines || []);
    } catch (ee) {
      o.error(ee.message || "加载引擎列表失败"), E([]);
    } finally {
      I(!1);
    }
  }, []);
  r(() => {
    se();
  }, [se]);
  const me = a(() => {
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
  const Y = n((ee) => {
    navigator.clipboard.writeText(ee).then(() => o.success("路径已复制")).catch(() => o.error("复制失败"));
  }, []), Q = n(() => {
    ne(null), W({
      name: "",
      vendor: "",
      version: "",
      executable_path: "",
      category: "",
      description: "",
      invocation_hint: ""
    }), B(!0);
  }, []), ie = n((ee) => {
    ne(ee), W({ ...ee }), B(!0), z(!1);
  }, []), he = n(async () => {
    var ee;
    if (!((ee = Z.name) != null && ee.trim())) {
      o.warning("请输入引擎名称");
      return;
    }
    M(!0);
    try {
      R ? (await Zl(R.id, Z), o.success("引擎已更新")) : (await Ql(Z), o.success("引擎已添加")), B(!1), se();
    } catch (be) {
      o.error(be.message || "保存失败");
    } finally {
      M(!1);
    }
  }, [Z, R, se]), we = n(
    async (ee) => {
      try {
        await eo(ee), o.success("引擎已删除"), z(!1), se();
      } catch (be) {
        o.error(be.message || "删除失败");
      }
    },
    [se]
  ), Ae = n(async () => {
    I(!0);
    try {
      const ee = await to();
      E(ee.engines || []), o.success("自动检测完成");
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
        Ee != null && Ee.select ? e.createElement(k, {
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
        i,
        {
          icon: v ? e.createElement(v) : void 0,
          onClick: Ae,
          loading: _
        },
        "自动检测"
      ),
      e.createElement(
        i,
        {
          type: "primary",
          icon: D ? e.createElement(D) : void 0,
          onClick: Q,
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
    ) : me.length === 0 ? e.createElement(s, {
      description: U ? "无匹配引擎" : "暂无引擎，点击「添加引擎」开始"
    }) : e.createElement(
      c,
      { gutter: [12, 12], align: "stretch" },
      ...me.map(
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
      u,
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
            i,
            {
              size: "small",
              icon: F ? e.createElement(F) : void 0,
              onClick: () => ie(w)
            },
            "编辑"
          ),
          w.is_default ? null : e.createElement(
            S,
            {
              title: "确认删除此引擎？",
              description: w.name,
              onConfirm: () => we(w.id),
              okText: "删除",
              cancelText: "取消",
              okButtonProps: { danger: !0 }
            },
            e.createElement(
              i,
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
        p,
        { column: 1, bordered: !0, size: "small" },
        e.createElement(
          p.Item,
          { label: "引擎名称" },
          w.name
        ),
        e.createElement(
          p.Item,
          { label: "厂商" },
          w.vendor || "—"
        ),
        e.createElement(
          p.Item,
          { label: "分类" },
          w.category ? cn[w.category] || w.category : "—"
        ),
        e.createElement(
          p.Item,
          { label: "状态" },
          e.createElement(
            m,
            {
              color: w.status === "detected" ? "success" : w.status === "not_found" ? "error" : "default"
            },
            w.status === "detected" ? "✅ 已检测" : w.status === "not_found" ? "❌ 路径无效" : "🔧 待配置"
          )
        ),
        e.createElement(
          p.Item,
          { label: "版本" },
          w.version || "—"
        ),
        w.executable_path ? e.createElement(
          p.Item,
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
              i,
              {
                size: "small",
                type: "text",
                icon: j ? e.createElement(j) : void 0,
                onClick: () => Y(w.executable_path)
              }
            )
          )
        ) : null,
        w.install_dir ? e.createElement(
          p.Item,
          { label: "安装目录" },
          e.createElement(
            "code",
            { style: { fontSize: 12, wordBreak: "break-all" } },
            w.install_dir
          )
        ) : null,
        // Display detected modules with paths
        w.modules && w.modules.length > 0 ? e.createElement(
          p.Item,
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
                  m,
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
          p.Item,
          { label: "许可证服务器" },
          w.license_server
        ) : null,
        e.createElement(
          p.Item,
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
          m,
          { color: "blue" },
          "默认引擎"
        ) : w.is_custom ? e.createElement(
          m,
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
        confirmLoading: ue,
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
            options: Object.entries(cn).map(([ee, be]) => ({
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
function so(e) {
  return ce(
    `/ugsci/domain-engines/neqsim/install/${encodeURIComponent(e)}`,
    { bypassCache: !0 }
  );
}
async function io(e, t = !1) {
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
    const s = l.key;
    if (!l.enabled) {
      r.set(s, { key: s, enabled: !1, toolCount: 0, error: null });
      continue;
    }
    try {
      const i = await ce(
        `/mcp/tools/${encodeURIComponent(s)}`,
        n
      ) || [];
      r.set(s, {
        key: s,
        enabled: !0,
        toolCount: i.filter((o) => o.enabled).length,
        error: null
      });
    } catch (i) {
      r.set(s, {
        key: s,
        enabled: !0,
        toolCount: 0,
        error: i instanceof Error ? i.message : "Tool query failed"
      });
    }
  }
  return r;
}
function ir(e) {
  return e ? e.overall === "available" ? "available" : e.overall === "unavailable" ? "unavailable" : "unknown" : "unknown";
}
function cr(e) {
  return e ? e.enabled ? e.error ? "error" : e.toolCount > 0 ? "available" : "error" : "unconfigured" : "unavailable";
}
function mo(e, t = null, r = /* @__PURE__ */ new Map()) {
  const n = e.engine, a = e.dependency_status;
  let l, s, i;
  if (n.provider.kind === "driver")
    a.overall === "unavailable" ? l = "needs_install" : l = cr(t), s = (t == null ? void 0 : t.toolCount) ?? 0, i = (t == null ? void 0 : t.key) ?? n.provider.id;
  else if (n.source === "builtin") {
    const o = ir(a), c = n.operations.flatMap((p) => p.tool_names), d = c.filter((p) => r.has(p)), u = d.filter(
      (p) => {
        var m;
        return (m = r.get(p)) == null ? void 0 : m.enabled;
      }
    );
    o !== "available" ? l = o : d.length !== c.length ? l = "error" : u.length === 0 ? l = "unconfigured" : l = "available", s = u.length, i = null;
  } else n.source === "mcp" ? (l = cr(t), s = (t == null ? void 0 : t.toolCount) ?? 0, i = (t == null ? void 0 : t.key) ?? n.provider.id) : (l = ir(a), s = 0, i = null);
  return {
    definition: n,
    dependencyStatus: a,
    checkedAt: e.checked_at,
    effectiveStatus: l,
    discoveredToolCount: s,
    mcpProviderKey: i
  };
}
function uo(e) {
  const t = /* @__PURE__ */ new Map();
  for (const r of e) {
    const n = r.definition.domain;
    t.has(n) || t.set(n, []), t.get(n).push(r);
  }
  return t;
}
const dn = {
  available: "可用",
  unavailable: "不可用",
  unknown: "未知",
  needs_install: "待安装",
  unconfigured: "未配置",
  error: "错误"
}, mn = {
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
  const r = A().React, { Card: n, Tag: a, Typography: l } = A().antd, { Text: s } = l, i = e.definition, o = po[i.domain] || "📦", c = e.effectiveStatus, d = i.operations.length, u = e.discoveredToolCount;
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
            s,
            { strong: !0, style: { fontSize: 14 } },
            i.name
          ),
          r.createElement("br"),
          r.createElement(
            s,
            { type: "secondary", style: { fontSize: 11 } },
            i.provider.kind === "driver" ? "内置 · MCP" : fo[i.source] || i.source
          )
        )
      ),
      r.createElement(
        a,
        { color: mn[c] || "default", style: { fontSize: 11 } },
        dn[c] || c
      )
    ),
    r.createElement(
      "div",
      { style: { flex: 1, minHeight: 32 } },
      r.createElement(
        s,
        { type: "secondary", style: { fontSize: 12 } },
        i.description
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
          color: yo[i.execution_class] || "default",
          style: { fontSize: 11 }
        },
        go[i.execution_class] || i.execution_class
      ),
      u > 0 ? r.createElement(
        a,
        { color: "blue", style: { fontSize: 11 } },
        `${u} 工具`
      ) : null,
      ...(i.tags || []).map(
        (p) => r.createElement(
          a,
          { key: p, color: "cyan", style: { fontSize: 10 } },
          p
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
  onInstallNeqsim: s,
  neqsimInstallState: i
}) {
  const o = A().React, { Drawer: c, Descriptions: d, Tag: u, Typography: p, Button: m, Space: f, Divider: y } = A().antd, { Text: h, Paragraph: k } = p;
  if (!e) return null;
  const S = e.definition, x = e.dependencyStatus;
  return o.createElement(
    c,
    {
      title: o.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 8 } },
        o.createElement("span", null, S.name),
        o.createElement(
          u,
          {
            color: mn[e.effectiveStatus] || "default",
            style: { fontSize: 11 }
          },
          dn[e.effectiveStatus] || e.effectiveStatus
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
        S.domain
      ),
      o.createElement(
        d.Item,
        { label: "来源" },
        S.provider.kind === "driver" ? "内置能力 · MCP Driver" : S.source === "builtin" ? "内置工具" : S.source === "mcp" ? "MCP 服务" : "科学计算库 / 技能"
      ),
      o.createElement(
        d.Item,
        { label: "实现" },
        `${S.provider.kind}:${S.provider.id}`
      ),
      o.createElement(
        d.Item,
        { label: "计算类别" },
        S.execution_class === "deterministic" ? "确定性计算" : S.execution_class === "stochastic" ? "随机/概率计算" : S.execution_class === "external" ? "外部 Provider" : "可视化"
      ),
      o.createElement(
        d.Item,
        { label: "内核版本" },
        S.engine_version
      ),
      o.createElement(
        d.Item,
        { label: "描述" },
        S.description
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
    ...S.operations.map(
      (v) => o.createElement(
        "div",
        {
          key: v.id,
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
          o.createElement(h, { strong: !0, style: { fontSize: 13 } }, v.name),
          o.createElement(
            h,
            { type: "secondary", style: { fontSize: 11, marginLeft: 8 } },
            v.id
          )
        ),
        o.createElement(
          h,
          { type: "secondary", style: { fontSize: 12 } },
          v.description
        ),
        v.tool_names.length > 0 ? o.createElement(
          "div",
          { style: { marginTop: 4, display: "flex", gap: 4, flexWrap: "wrap" } },
          ...v.tool_names.map(
            (L) => o.createElement(
              u,
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
        (v) => o.createElement(
          "div",
          {
            key: v.name,
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
            o.createElement(h, { style: { fontSize: 13 } }, v.name),
            o.createElement(
              u,
              {
                color: mn[v.status] || "default",
                style: { fontSize: 11 }
              },
              dn[v.status] || v.status
            )
          ),
          v.status !== "available" && v.reason ? o.createElement(
            h,
            { type: "secondary", style: { display: "block", fontSize: 12, marginTop: 4 } },
            v.reason
          ) : null,
          v.status !== "available" && v.install_hint ? o.createElement(
            h,
            { style: { display: "block", fontSize: 12, marginTop: 4 } },
            `安装：${v.install_hint}`
          ) : null,
          v.status !== "available" && v.enable_hint ? o.createElement(
            h,
            { style: { display: "block", fontSize: 12, marginTop: 2 } },
            `启用：${v.enable_hint}`
          ) : null
        )
      )
    ) : o.createElement(
      k,
      { type: "secondary", style: { fontSize: 12 } },
      "无外部依赖"
    ),
    // Actions
    o.createElement(y, null),
    o.createElement(h, { strong: !0 }, "问题处理"),
    o.createElement(
      "div",
      { style: { marginTop: 8, display: "flex", gap: 8, flexWrap: "wrap" } },
      S.id === "neqsim" && e.effectiveStatus === "needs_install" ? o.createElement(
        m,
        {
          size: "small",
          type: "primary",
          loading: (i == null ? void 0 : i.status) === "queued" || (i == null ? void 0 : i.status) === "running",
          onClick: s
        },
        (i == null ? void 0 : i.status) === "running" ? `${i.message} (${i.progress}%)` : "安装 NeqSim 运行环境"
      ) : null,
      S.provider.kind === "driver" ? o.createElement(
        m,
        { size: "small", onClick: n },
        "查看内置 MCP Driver"
      ) : S.source === "library" ? o.createElement(
        m,
        { size: "small", onClick: l },
        "查看相关技能"
      ) : o.createElement(
        m,
        { size: "small", onClick: () => a("builtin") },
        "查看内置工具"
      )
    ),
    S.id === "neqsim" && (i == null ? void 0 : i.status) === "failed" ? o.createElement(
      k,
      { type: "danger", style: { marginTop: 8, fontSize: 12 } },
      i.error || "安装失败"
    ) : null,
    S.id === "neqsim" && (i != null && i.warning) ? o.createElement(
      k,
      { type: "warning", style: { marginTop: 8, fontSize: 12 } },
      i.warning
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
  var se, me;
  const n = A().React, { useState: a, useEffect: l, useCallback: s, useMemo: i, useRef: o } = n, {
    Spin: c,
    Empty: d,
    Button: u,
    message: p,
    Row: m,
    Col: f,
    Input: y,
    Drawer: h,
    Typography: k
  } = A().antd, { ReloadOutlined: S, SearchOutlined: x } = A().antdIcons || {}, { Text: v } = k, L = (me = (se = A()).useSelectedAgent) == null ? void 0 : me.call(se), D = (L == null ? void 0 : L.id) || "default", [F, G] = a([]), [j, K] = a(!0), [X, H] = a(""), [b, E] = a(!1), [_, I] = a(null), [U, $] = a(null), O = o(D);
  O.current = D;
  const z = o(_);
  z.current = _;
  const w = o(0);
  l(() => () => {
    w.current += 1;
  }, []);
  const le = s(
    async (Y = !1, Q = !1) => {
      var Ae, xe;
      Q || K(!0);
      const ie = Q && typeof window < "u" ? {
        x: window.scrollX,
        y: window.scrollY,
        drawerBody: typeof document < "u" ? document.querySelector(
          ".ugsci-domain-engine-detail-drawer .ant-drawer-body"
        ) : null,
        drawerTop: typeof document < "u" && ((Ae = document.querySelector(
          ".ugsci-domain-engine-detail-drawer .ant-drawer-body"
        )) == null ? void 0 : Ae.scrollTop) || 0
      } : null, he = () => {
        if (!ie || typeof window > "u") return;
        const ee = () => {
          var be;
          window.scrollTo(ie.x, ie.y), (be = ie.drawerBody) != null && be.isConnected && (ie.drawerBody.scrollTop = ie.drawerTop);
        };
        typeof window.requestAnimationFrame == "function" ? window.requestAnimationFrame(ee) : ee();
      }, we = O.current;
      try {
        const [ee, be, Ee] = await Promise.all([
          ao(Y),
          co(we, Y),
          io(we, Y)
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
            te.push(mo(fe, V, Ee));
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
        p.error(be), Q || G([]);
      } finally {
        Q || K(!1);
      }
    },
    []
  );
  l(() => {
    le();
  }, [D, le]);
  const oe = i(() => {
    if (!X.trim()) return F;
    const Y = X.toLowerCase();
    return F.filter(
      (Q) => Q.definition.name.toLowerCase().includes(Y) || Q.definition.domain.toLowerCase().includes(Y) || Q.definition.description.toLowerCase().includes(Y) || Q.definition.tags.some((ie) => ie.toLowerCase().includes(Y))
    );
  }, [F, X]), B = i(
    () => uo(oe),
    [oe]
  ), R = s(() => {
    le(!0);
  }, [le]), ne = s((Y) => {
    z.current = Y, I(Y), E(!0);
  }, []), Z = s(() => {
    E(!1), e == null || e();
  }, [e]), W = s(
    (Y) => {
      E(!1), t == null || t(Y);
    },
    [t]
  ), ue = s(() => {
    E(!1), r == null || r();
  }, [r]), M = s(async () => {
    const Y = ++w.current, Q = () => Y === w.current;
    try {
      let ie = await oo();
      if (!Q()) return;
      for ($(ie); ie.status === "queued" || ie.status === "running"; ) {
        if (await new Promise((he) => setTimeout(he, 1e3)), !Q()) return;
        try {
          ie = await so(ie.id);
        } catch (he) {
          if (!bo(he)) throw he;
          const we = await lo(!0);
          if (!Q()) return;
          we.ready ? ie = {
            ...ie,
            status: "completed",
            progress: 100,
            message: "后端重启后已恢复 NeqSim 运行环境状态",
            error: "",
            runtime: we,
            recovered: !0
          } : ie = {
            ...ie,
            status: "failed",
            message: "安装进程因后端重启中断",
            error: "后端重启后未发现完整的 NeqSim 运行环境，请重新安装",
            runtime: we,
            recovered: !0
          };
        }
        if (!Q()) return;
        $(ie);
      }
      if (!Q()) return;
      ie.status === "completed" ? (ie.warning ? p.warning(ie.warning) : p.success("NeqSim 运行环境已安装并启用"), await le(!0, !0)) : p.error(ie.error || "NeqSim 安装失败");
    } catch (ie) {
      if (!Q()) return;
      p.error(ie instanceof Error ? ie.message : "NeqSim 安装失败");
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
        onChange: (Y) => H(Y.target.value),
        allowClear: !0,
        style: { maxWidth: 280 }
      }),
      n.createElement(
        u,
        {
          icon: S ? n.createElement(S) : void 0,
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
        ([Y, Q]) => n.createElement(
          "div",
          { key: Y, style: { marginBottom: 20 } },
          n.createElement(
            v,
            {
              strong: !0,
              style: {
                fontSize: 14,
                display: "block",
                marginBottom: 8
              }
            },
            vo[Y] || Y
          ),
          n.createElement(
            m,
            { gutter: [12, 12], align: "stretch" },
            ...Q.map(
              (ie) => n.createElement(
                f,
                {
                  key: ie.definition.id,
                  xs: 24,
                  sm: 12,
                  md: 8,
                  lg: 6,
                  style: { display: "flex" }
                },
                n.createElement(ho, {
                  view: ie,
                  onClick: () => ne(ie)
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
      onClose: () => E(!1),
      onNavigateToMcp: Z,
      onNavigateToTools: W,
      onNavigateToSkills: ue,
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
function dr(e) {
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
function un({ page: e }) {
  const t = A().React, { useEffect: r, useState: n } = t, { Alert: a, Spin: l } = A().antd, [s, i] = n(null), [o, c] = n("");
  if (r(() => {
    let u = !0;
    const p = A().loadBuiltinPage;
    return i(null), p ? (c(""), p(e).then((m) => {
      u && i(() => m);
    }).catch((m) => {
      u && c(
        m instanceof Error ? m.message : "加载原生管理页面失败"
      );
    }), () => {
      u = !1;
    }) : (c("当前 QwenPaw 版本不支持原生页面嵌入"), () => {
      u = !1;
    });
  }, [e]), o)
    return t.createElement(a, {
      type: "error",
      showIcon: !0,
      message: "原生管理功能加载失败",
      description: o
    });
  if (!s)
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
  return t.createElement(s, { embedded: !0, embeddedLabels: d });
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
        children: r.createElement(un, { page: "mcp" })
      },
      {
        key: "builtin",
        label: "平台内置",
        children: r.createElement(un, { page: "tools" })
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
        children: n.createElement(un, { page: "acp" })
      }
    ]
  });
}
function Kr({
  initialTab: e = "engines"
} = {}) {
  var k, S;
  const t = A().React, { useEffect: r, useState: n } = t, { Tabs: a, Tag: l } = A().antd, { RocketOutlined: s, ToolOutlined: i, ThunderboltOutlined: o } = A().antdIcons || {}, c = (S = (k = A()).useSelectedAgent) == null ? void 0 : S.call(k), d = (c == null ? void 0 : c.id) || "default", [u, p] = n(
    () => So(e)
  ), [m, f] = n("mcp");
  r(() => {
    try {
      const x = new URLSearchParams(window.location.search).get("tab");
      x && !Vr.has(x) && dr(u);
    } catch {
    }
  }, [u]);
  const y = (x) => {
    p(x), dr(x);
  }, h = (x, v) => t.createElement(
    "span",
    { style: { display: "inline-flex", alignItems: "center", gap: 6 } },
    v ? t.createElement(v, { style: { fontSize: 14 } }) : null,
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
      activeKey: u,
      onChange: (x) => y(x),
      items: [
        {
          key: "engines",
          label: h("引擎", s),
          children: t.createElement(
            Co,
            {
              onNavigateToMcp: () => {
                f("mcp"), y("tools");
              },
              onNavigateToTools: (x) => {
                f(x || "mcp"), y("tools");
              },
              onNavigateToSkills: () => y("skills")
            }
          )
        },
        {
          key: "tools",
          label: h("工具", i),
          children: t.createElement(ko, {
            activeSubTab: m,
            onSubTabChange: f
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
const Lt = "ugsci.market.githubSources", ur = "https://github.com/anthropics/skills/tree/main/skills", Yr = "https://ugsci-awesome-tools.oss-cn-beijing.aliyuncs.com", zo = `${Yr}/skills`;
function Ao(e) {
  const t = e.replace(/^\/+/, "");
  return Ft(`/plugins/oss-proxy?path=${encodeURIComponent(t)}`);
}
function Ut(e) {
  const t = e.replace(/^\/+/, "");
  return Ve(`/plugins/oss-proxy?path=${encodeURIComponent(t)}`);
}
async function Sn(e) {
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
    for (const s of e.env)
      t[s] = `your-${s.toLowerCase().replace(/_/g, "-")}`;
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
const Qr = "ugsci.market.mcpSources", Zr = "ugsci.market.expertSources";
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
  return ea(Qr, "mcp");
}
function At(e) {
  ta(Qr, e);
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
    const l = decodeURIComponent(a[0]), s = decodeURIComponent(a[1]);
    let i = "main", o = "";
    return a.length >= 4 && (a[2] === "tree" || a[2] === "blob") ? (i = decodeURIComponent(a[3]), a.length > 4 && (o = a.slice(4).map(decodeURIComponent).join("/"))) : a.length > 2 && (o = a.slice(2).map(decodeURIComponent).join("/")), o = o.replace(/\/+$/, "").replace(/^\/+/, ""), {
      owner: l,
      repo: s,
      ref: i || "main",
      skillsPath: o,
      label: `${l}/${s}`,
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
    const a = n[1], l = `${t.protocol}//${r}`, s = decodeURIComponent(t.pathname).replace(/^\/+/, "").replace(/\/+$/, "");
    return s ? {
      endpoint: l,
      prefix: s,
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
      const n = [], a = na(ur);
      return a && n.push({
        id: ra(
          a.owner,
          a.repo,
          a.skillsPath,
          a.platform
        ),
        url: ur,
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
  for (const s of a) {
    const i = s.match(/^(\w[\w-]*)\s*:\s*(.*)$/);
    if (i) {
      l = i[1];
      let o = i[2].trim();
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
  const s = await l.json();
  if (!Array.isArray(s)) return [];
  const i = s.filter(
    (c) => c.type === "dir" && c.name
  );
  return await Promise.all(
    i.map(async (c) => {
      const d = e.skillsPath ? e.skillsPath + "/" : "", u = t ? `https://gitee.com/${e.owner}/${e.repo}/raw/${e.ref}/${d}${c.name}/SKILL.md` : `https://raw.githubusercontent.com/${e.owner}/${e.repo}/${e.ref}/${d}${c.name}/SKILL.md`, p = t ? `https://gitee.com/${e.owner}/${e.repo}/tree/${e.ref}/${d}${c.name}` : `https://github.com/${e.owner}/${e.repo}/tree/${e.ref}/${d}${c.name}`, m = {
        sourceId: e.id,
        sourceLabel: e.label,
        name: c.name,
        description: "",
        source_url: p,
        html_url: p,
        version: null,
        author: null
      };
      try {
        const f = {};
        t && e.accessToken && (f.Authorization = `token ${e.accessToken}`);
        const y = await fetch(u, {
          headers: f
        });
        if (!y.ok) return m;
        const h = await y.text(), k = Ro(h);
        return {
          ...m,
          name: k.name || c.name,
          description: k.description || "",
          version: k.version || null,
          author: k.author || null
        };
      } catch {
        return m;
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
  const s = await l.json(), i = [];
  if (s && s.tag_groups && typeof s.tag_groups == "object")
    for (const [d, u] of Object.entries(s.tag_groups))
      Array.isArray(u) && i.push({
        id: d,
        label: ct(d),
        tags: u
      });
  const o = [];
  function c(d, u) {
    for (const p of d) {
      if (p.type === "collection" && Array.isArray(p.children)) {
        c(p.children, p.name);
        continue;
      }
      const m = p.path || p.name || "";
      if (!m) continue;
      const f = m.split("/").map(encodeURIComponent).join("/"), y = `${r}/${a}/${f}`;
      let h = null;
      if (p.metadata) {
        const S = p.metadata.match(/version:\s*"?([\d.]+)"?/);
        S && (h = S[1]);
      }
      const k = u ? `${e.label}/${u}` : e.label;
      o.push({
        sourceId: e.id,
        sourceLabel: e.label,
        sourcePath: k,
        name: p.name || m.split("/").pop() || m,
        description: p.description || "",
        source_url: y,
        html_url: y,
        version: h,
        author: null,
        tag: p.tag || void 0,
        isOfficial: !0
      });
    }
  }
  if (Array.isArray(s) ? c(
    s.map(
      (d) => typeof d == "string" ? { name: d, path: d } : d
    )
  ) : s && Array.isArray(s.skills) && c(s.skills), o.length === 0)
    throw new Error(
      `manifest.json 中未找到技能。请检查 ${e.url}/manifest.json`
    );
  return { skills: o, categories: i };
}
async function jo() {
  const e = await Sn("mcp/manifest.json"), t = [], r = {};
  if (e.tag_groups && typeof e.tag_groups == "object")
    for (const [a, l] of Object.entries(e.tag_groups))
      Array.isArray(l) && (r[a] = l, t.push({
        id: a,
        label: ct(a),
        tags: l
      }));
  return { servers: (e.servers || []).map((a) => {
    let l = "";
    const s = a.tags || [];
    for (const [i, o] of Object.entries(r))
      if (o.some((c) => s.includes(c))) {
        l = i;
        break;
      }
    return {
      id: a.id || a.name,
      name: a.name || a.id,
      description: a.description || "",
      tags: s,
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
  const e = await Sn("skills/manifest.json"), t = [], r = /* @__PURE__ */ new Set();
  function n(a, l) {
    for (const s of a) {
      if ((s == null ? void 0 : s.type) === "collection" && Array.isArray(s.children)) {
        n(s.children, s.name || l);
        continue;
      }
      const i = String((s == null ? void 0 : s.path) || (s == null ? void 0 : s.name) || "").trim();
      if (!i) continue;
      const o = i.split("/").map(encodeURIComponent).join("/"), c = `${Yr}/skills/${o}`, d = typeof s.tag == "string" && s.tag.trim() ? s.tag.trim() : void 0;
      d && r.add(d);
      let u = null;
      if (typeof s.metadata == "string") {
        const p = s.metadata.match(/version:\s*"?([\d.]+)"?/);
        p && (u = p[1]);
      }
      t.push({
        sourceId: "oss:ugsci-official",
        sourceLabel: "UGSci",
        sourcePath: l ? `UGSci/${l}` : "UGSci",
        name: s.name || i.split("/").pop() || i,
        description: s.description || "",
        source_url: c,
        html_url: c,
        version: u,
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
  const e = await Sn("agents/manifest.json"), t = [], r = {};
  if (e.tag_groups && typeof e.tag_groups == "object")
    for (const [a, l] of Object.entries(e.tag_groups))
      Array.isArray(l) && (r[a] = l, t.push({
        id: a,
        label: ct(a),
        tags: l
      }));
  return { agents: (e.agents || []).map((a) => {
    let l = "";
    const s = a.tags || [];
    for (const [i, o] of Object.entries(r))
      if (o.some((c) => s.includes(c))) {
        l = i;
        break;
      }
    return {
      id: a.id || a.name,
      name: a.name || a.id,
      description: a.description || "",
      path: a.path || "",
      tags: s,
      config: a.config,
      instructions: a.instructions,
      skills_manifest: a.skills_manifest,
      drivers: a.drivers,
      category: l
    };
  }), categories: t };
}
async function Go(e) {
  const t = e.filter((s) => s.enabled), r = await Promise.all(
    t.map(async (s) => {
      try {
        if (s.platform === "oss") {
          const { skills: i, categories: o } = await Uo(s);
          return { skills: i, categories: o, error: null, label: s.label };
        } else
          return { skills: await Bo(s), categories: [], error: null, label: s.label };
      } catch (i) {
        return {
          skills: [],
          categories: [],
          error: i.message || String(i),
          label: s.label
        };
      }
    })
  ), n = [], a = [], l = [];
  for (const s of r)
    n.push(...s.skills), a.push(...s.categories), s.error && l.push({ label: s.label, message: s.error });
  return { skills: n, errors: l, categories: a };
}
function Fo({
  open: e,
  onClose: t,
  sources: r,
  onChange: n
}) {
  const a = A().React, { useState: l } = a, {
    Modal: s,
    Input: i,
    Button: o,
    List: c,
    Tag: d,
    Switch: u,
    Typography: p,
    Tooltip: m,
    message: f
  } = A().antd, {
    PlusOutlined: y,
    DeleteOutlined: h,
    LinkOutlined: k,
    GithubOutlined: S
  } = A().antdIcons || {}, { Text: x } = p, [v, L] = l(""), [D, F] = l(""), G = () => {
    const H = v.trim();
    if (!H) return;
    const b = na(H);
    if (!b) {
      f.error("无效的仓库 URL，请输入类似 https://github.com/owner/repo/tree/main/skills 或 https://gitee.com/owner/repo/tree/master/skills 的链接");
      return;
    }
    const E = ra(b.owner, b.repo, b.skillsPath, b.platform);
    if (r.some((U) => U.id === E)) {
      f.warning("该源已存在");
      return;
    }
    const _ = {
      id: E,
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
    Pt(I), n(I), L(""), F(""), f.success(`已添加源: ${b.label}`);
  }, j = (H, b) => {
    const E = r.map(
      (_) => _.id === H ? { ..._, enabled: b } : _
    );
    Pt(E), n(E);
  }, K = (H, b) => {
    const E = r.map(
      (_) => _.id === H ? { ..._, accessToken: b.trim() || void 0 } : _
    );
    Pt(E), n(E);
  }, X = (H) => {
    const b = r.filter((E) => E.id !== H);
    Pt(b), n(b), f.success("已移除源");
  };
  return a.createElement(
    s,
    {
      open: e,
      onCancel: t,
      title: a.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 8 } },
        S ? a.createElement(S, { style: { fontSize: 18 } }) : null,
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
        a.createElement(i, {
          placeholder: "https://github.com/owner/repo/tree/main/skills 或 https://gitee.com/owner/repo/tree/master/skills",
          value: v,
          onChange: (H) => L(H.target.value),
          onPressEnter: G,
          prefix: k ? a.createElement(k) : void 0,
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
      v.trim() && v.trim().toLowerCase().includes("gitee.com") ? a.createElement(
        "div",
        { style: { marginTop: 8, display: "flex", gap: 8, alignItems: "center" } },
        a.createElement(
          x,
          { type: "secondary", style: { fontSize: 12, whiteSpace: "nowrap" } },
          "Gitee Token:"
        ),
        a.createElement(i.Password, {
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
              m,
              { title: H.enabled ? "点击禁用" : "点击启用" },
              a.createElement(u, {
                size: "small",
                checked: H.enabled,
                onChange: (b) => j(H.id, b)
              })
            ),
            a.createElement(
              m,
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
            a.createElement(i.Password, {
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
function pr({
  open: e,
  onClose: t,
  sources: r,
  onChange: n,
  type: a
}) {
  const l = A().React, { useState: s } = l, {
    Modal: i,
    Input: o,
    Button: c,
    List: d,
    Tag: u,
    Switch: p,
    Typography: m,
    Tooltip: f,
    message: y
  } = A().antd, {
    PlusOutlined: h,
    DeleteOutlined: k,
    LinkOutlined: S,
    ApiOutlined: x,
    UserOutlined: v,
    ImportOutlined: L,
    ExportOutlined: D,
    CopyOutlined: F
  } = A().antdIcons || {}, { Text: G } = m, [j, K] = s(""), [X, H] = s(""), [b, E] = s(""), [_, I] = s(!1), U = a === "mcp" ? "MCP" : "专家模板", $ = a === "mcp" ? x ? l.createElement(x, { style: { fontSize: 18 } }) : null : v ? l.createElement(v, { style: { fontSize: 18 } }) : null, O = () => {
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
    }, ue = [...r, W];
    a === "mcp" ? At(ue) : $t(ue), n(ue), K(""), H(""), y.success(`已添加${U}源: ${ne}`);
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
        (se) => se && typeof se.url == "string" && typeof se.label == "string"
      );
      if (Z.length === 0) {
        y.error("未找到有效的源数据");
        return;
      }
      const W = new Set(r.map((se) => se.id)), ue = [];
      for (const se of Z) {
        const me = se.id || `${a}:${se.url}`;
        W.has(me) || ue.push({
          id: me,
          label: se.label,
          url: se.url,
          enabled: se.enabled !== !1,
          type: a
        });
      }
      if (ue.length === 0) {
        y.info("所有源均已存在，无新增");
        return;
      }
      const M = [...r, ...ue];
      a === "mcp" ? At(M) : $t(M), n(M), E(""), I(!1), y.success(`成功导入 ${ue.length} 个${U}源`);
    } catch (R) {
      y.error(`JSON 解析失败: ${R.message || "格式错误"}`);
    }
  };
  return l.createElement(
    i,
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
        onChange: (B) => E(B.target.value),
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
            onClick: () => E("")
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
        prefix: S ? l.createElement(S) : void 0,
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
              f,
              { title: B.enabled ? "点击禁用" : "点击启用" },
              l.createElement(p, {
                size: "small",
                checked: B.enabled,
                onChange: (R) => z(B.id, R)
              })
            ),
            l.createElement(
              f,
              { title: "移除此源" },
              l.createElement(
                c,
                {
                  size: "small",
                  type: "text",
                  danger: !0,
                  icon: k ? l.createElement(k) : void 0,
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
              u,
              {
                color: a === "mcp" ? "purple" : "blue",
                style: { fontSize: 11 }
              },
              B.label
            ),
            B.enabled ? null : l.createElement(
              u,
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
function fr(e) {
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
async function gr(e, t) {
  const r = { bundle_url: e };
  return t && (r.access_token = t), ce("/skills/pool/import", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(r)
  });
}
function qo() {
  const e = A().React, { useState: t, useEffect: r, useCallback: n, useMemo: a, useRef: l } = e, {
    Spin: s,
    Empty: i,
    Input: o,
    Button: c,
    message: d,
    Row: u,
    Col: p,
    Card: m,
    Tag: f,
    Tooltip: y,
    Typography: h,
    Select: k,
    Drawer: S,
    Descriptions: x,
    Tabs: v,
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
    CheckCircleOutlined: E,
    LoadingOutlined: _,
    UserOutlined: I,
    UserAddOutlined: U,
    SettingOutlined: $,
    GithubOutlined: O,
    ApiOutlined: z
  } = A().antdIcons || {}, { Text: w, Paragraph: le, Title: oe } = h, [B, R] = t("skills"), [ne, Z] = t([]), [W, ue] = t([]), [M, se] = t([]), [me, Y] = t(""), [Q, ie] = t(""), [he, we] = t(!1), [Ae, xe] = t(!1), [ee, be] = t(
    {}
  ), [Ee, te] = t(null), [de, fe] = t({}), [V, C] = t([]), [ge, q] = t(""), [T, re] = t(""), [pe, Ie] = t(""), [Le, Ne] = t({}), [Re, Ge] = t(""), [et, De] = t(/* @__PURE__ */ new Set()), [Te, Me] = t(null), [ae, ze] = t({}), [$e, Oe] = t([]), [We, Je] = t([]), [_e, St] = t([]), [Kt, mt] = t(""), [Ke, kt] = t(!1), [ua, Tn] = t(!1), [pa, _n] = t([]), [fa, In] = t(!1), [ga, zn] = t([]), [ya, An] = t(!1), [$n, Pn] = t([]), [On, Mn] = t([]), [Ln, Rn] = t(!1), [tt, Bn] = t(""), [Un, jn] = t([]), [Nn, Dn] = t([]), [Gn, Fn] = t(!1), [nt, Hn] = t(""), [Xt, Wn] = t(!1), [Ue, Ct] = t(null), [ut, ha] = t([]), pt = l(null);
  r(() => {
    Promise.all([
      Ho().catch(() => []),
      Wo("zh").catch(() => []),
      Jt().catch(() => [])
    ]).then(([g, N, J]) => {
      Z(g), ue(N), C(J), J.length > 0 && (q(J[0].id), Ge(J[0].id));
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
    Rn(!0), Fn(!0), kt(!0);
    const [g, N, J] = await Promise.allSettled([
      jo(),
      Do(),
      No()
    ]);
    if (g.status === "fulfilled" ? (Pn(g.value.servers), Mn(g.value.categories)) : (console.warn(`[ugsci] MCP manifest error: ${((ye = g.reason) == null ? void 0 : ye.message) || g.reason}`), Pn([]), Mn([])), Rn(!1), N.status === "fulfilled" ? (jn(N.value.agents), Dn(N.value.categories)) : (console.warn(`[ugsci] Agents manifest error: ${((Se = N.reason) == null ? void 0 : Se.message) || N.reason}`), jn([]), Dn([])), Fn(!1), J.status === "fulfilled")
      St(J.value.skills), mt("");
    else {
      const ke = ((Pe = J.reason) == null ? void 0 : Pe.message) || String(J.reason);
      console.warn(`[ugsci] Skills manifest error: ${ke}`), St([]), mt(ke);
    }
    kt(!1);
  }, []);
  r(() => {
    Tt(), Yt(), _n(Po()), zn(Oo());
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
        J === void 0 || Object.keys(J).length === 0 ? se(ye.results) : se((ke) => [...ke, ...ye.results]);
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
        d.error(ye.message || "搜索市场失败"), se([]);
      } finally {
        we(!1);
      }
    },
    []
  );
  r(() => (pt.current && clearTimeout(pt.current), pt.current = setTimeout(() => {
    _t(me, Q, {});
  }, 400), () => {
    pt.current && clearTimeout(pt.current);
  }), [me, Q, _t]);
  const Ea = () => {
    _t(me, Q, ee);
  }, Jn = async (g) => {
    const N = `${g.source}:${g.slug}`;
    try {
      fe((ye) => ({ ...ye, [N]: "installing" }));
      const J = await gr(g.source_url);
      J.installed && d.success(
        `技能「${J.name || g.name}」已安装到技能池，可在技能中心查看`
      ), fe((ye) => {
        const Se = { ...ye };
        return delete Se[N], Se;
      });
    } catch (J) {
      d.error(fr(J) || "安装技能失败"), fe((ye) => {
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
      const Se = await gr(g.source_url, ye);
      Se.installed && d.success(
        `技能「${Se.name || g.name}」已安装到技能池，可在技能中心查看`
      ), fe((Pe) => {
        const ke = { ...Pe };
        return delete ke[N], ke;
      });
    } catch (Se) {
      d.error(fr(Se) || "安装技能失败"), fe((Pe) => {
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
  }, [_e, We]), qn = a(() => {
    const g = [], N = /* @__PURE__ */ new Set();
    if (ut.length > 0)
      for (const J of ut)
        N.has(J.id) || (N.add(J.id), g.push(J));
    for (const J of Ze)
      J.tag && !N.has(J.tag) && (N.add(J.tag), g.push({ id: J.tag, label: J.tag }));
    for (const J of Ze)
      !J.isOfficial && J.sourceLabel && !N.has(J.sourceLabel) && (N.add(J.sourceLabel), g.push({ id: J.sourceLabel, label: J.sourceLabel }));
    return g;
  }, [Ze, ut]), Qt = a(() => {
    let g = Ze;
    if (Q) {
      const N = ut.find((J) => J.id === Q);
      N && N.tags ? g = g.filter(
        (J) => J.tag && N.tags.includes(J.tag) || J.sourceLabel === Q
      ) : g = g.filter(
        (J) => J.tag === Q || J.sourceLabel === Q
      );
    }
    if (me.trim()) {
      const N = me.toLowerCase();
      g = g.filter(
        (J) => {
          var ye;
          return J.name.toLowerCase().includes(N) || ((ye = J.description) == null ? void 0 : ye.toLowerCase().includes(N));
        }
      );
    }
    return g;
  }, [Ze, me, Q, ut]), Vn = ne.filter((g) => g.available), rt = a(() => Q ? M.filter((g) => {
    const N = Vn.find((J) => J.key === g.source);
    return (N == null ? void 0 : N.label) === Q;
  }) : M, [M, Q, Vn]), wa = e.createElement(
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
        value: me,
        onChange: (g) => Y(g.target.value),
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
          onClick: () => Tn(!0),
          size: "small"
        },
        "配置技能源"
      )
    ),
    // Dynamic category filter tags (from OSS manifest tags + imported sources)
    Kt && Ze.length === 0 ? e.createElement(G, {
      type: "warning",
      showIcon: !0,
      message: "UGSci 官方 OSS 技能库加载失败",
      description: "请检查网络或后端 OSS 代理服务，然后点击右上角“刷新”重试。",
      style: { marginBottom: 12 }
    }) : null,
    qn.length > 0 ? e.createElement(
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
        f,
        {
          style: {
            fontSize: 11,
            cursor: "pointer",
            borderRadius: 12
          },
          color: Q === "" ? "blue" : void 0,
          onClick: () => ie("")
        },
        "全部"
      ),
      ...qn.map((g) => {
        const N = We.some(
          (J) => !J.isOfficial && J.sourceLabel === g.id
        );
        return e.createElement(
          f,
          {
            key: g.id,
            style: {
              fontSize: 11,
              cursor: "pointer",
              borderRadius: 12
            },
            color: Q === g.id ? N ? "blue" : "geekblue" : void 0,
            icon: N && O ? e.createElement(O) : void 0,
            onClick: () => ie(
              Q === g.id ? "" : g.id
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
      e.createElement(s, { size: "large" }, e.createElement("div", { style: { minHeight: 60, display: "flex", alignItems: "center", justifyContent: "center" } }, "正在加载技能..."))
    ) : Qt.length > 0 ? e.createElement(
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
          `技能市场 (${Qt.length})`
        )
      ),
      e.createElement(
        u,
        { gutter: [12, 12] },
        ...Qt.map((g) => {
          const N = `github:${g.sourceId}:${g.name}`, J = de[N];
          return e.createElement(
            p,
            { key: N, xs: 24, sm: 12, md: 8, lg: 6 },
            e.createElement(
              m,
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
                    f,
                    { color: "geekblue", style: { fontSize: 10 } },
                    g.tag
                  ) : null,
                  g.version ? e.createElement(
                    f,
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
      e.createElement(s, { size: "large" })
    ) : rt.length === 0 ? e.createElement(i, {
      description: me ? `未找到匹配「${me}」的技能` : "输入关键词搜索技能市场",
      image: i.PRESENTED_IMAGE_SIMPLE
    }) : e.createElement(
      u,
      { gutter: [12, 12] },
      ...rt.map((g) => {
        const N = `${g.source}:${g.slug}`, J = de[N];
        return e.createElement(
          p,
          { key: N, xs: 24, sm: 12, md: 8, lg: 6 },
          e.createElement(
            m,
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
                  f,
                  { color: "geekblue", style: { fontSize: 10 } },
                  g.source
                ),
                g.version ? e.createElement(
                  f,
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
                    ye.stopPropagation(), Jn(g);
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
      S,
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
              Jn(Ee);
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
  ), Zt = a(() => {
    let g = Un;
    if (nt && (g = g.filter((N) => N.category === nt)), T.trim()) {
      const N = T.toLowerCase();
      g = g.filter(
        (J) => J.name.toLowerCase().includes(N) || J.description.toLowerCase().includes(N) || J.tags.some((ye) => ye.toLowerCase().includes(N))
      );
    }
    return g;
  }, [Un, T, nt]), xa = async (g) => {
    if (!Xt) {
      Wn(!0);
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
        Wn(!1);
      }
    }
  }, Kn = n(async (g) => {
    if (g)
      try {
        const N = await vn(g);
        De(new Set(N.map((J) => J.key)));
      } catch {
        De(/* @__PURE__ */ new Set());
      }
  }, []);
  r(() => {
    Re && Kn(Re);
  }, [Re, Kn]);
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
    await Xn(g, g.env || {});
  }, Xn = async (g, N) => {
    Ne((J) => ({ ...J, [g.id]: !0 }));
    try {
      const J = g.id;
      await bn(Re, {
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
    Me(null), ze({}), await Xn(N, { ...ae });
  }, en = a(() => {
    let g = $n;
    if (tt && (g = g.filter((N) => N.category === tt)), pe.trim()) {
      const N = pe.toLowerCase();
      g = g.filter(
        (J) => J.name.toLowerCase().includes(N) || J.description.toLowerCase().includes(N) || J.tags.some((ye) => ye.toLowerCase().includes(N))
      );
    }
    return g.map($o);
  }, [$n, pe, tt]), Ca = e.createElement(
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
        e.createElement(k, {
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
          onClick: () => In(!0),
          size: "small"
        },
        "配置 MCP 源"
      )
    ),
    // Dynamic category tag row (from OSS manifest tag_groups)
    On.length > 0 ? e.createElement(
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
        f,
        {
          style: { fontSize: 11, cursor: "pointer", borderRadius: 12 },
          color: tt === "" ? "blue" : void 0,
          onClick: () => Bn("")
        },
        "全部"
      ),
      ...On.map(
        (g) => e.createElement(
          f,
          {
            key: g.id,
            style: { fontSize: 11, cursor: "pointer", borderRadius: 12 },
            color: tt === g.id ? "geekblue" : void 0,
            onClick: () => Bn(
              tt === g.id ? "" : g.id
            )
          },
          g.label
        )
      )
    ) : null,
    // MCP server cards (dynamic from OSS)
    Ln && en.length === 0 ? e.createElement(
      "div",
      { style: { textAlign: "center", padding: 40 } },
      e.createElement(s, { size: "large" }, e.createElement("div", { style: { minHeight: 60, display: "flex", alignItems: "center", justifyContent: "center" } }, "正在加载 MCP 服务器..."))
    ) : en.length === 0 ? e.createElement(i, {
      description: "未找到匹配的 MCP 服务器",
      image: i.PRESENTED_IMAGE_SIMPLE
    }) : e.createElement(
      u,
      { gutter: [12, 12] },
      ...en.map(
        (g) => e.createElement(
          p,
          { key: g.id, xs: 24, sm: 12, md: 8 },
          e.createElement(
            m,
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
                    f,
                    { color: "blue", style: { fontSize: 10 } },
                    g.category
                  ),
                  e.createElement(
                    f,
                    {
                      color: g.transport === "stdio" ? "purple" : "cyan",
                      style: { fontSize: 10 }
                    },
                    g.transport
                  ),
                  g.env && Object.keys(g.env).length > 0 ? e.createElement(
                    f,
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
            f,
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
          onClick: () => An(!0),
          size: "small"
        },
        "配置专家源"
      )
    ),
    // Dynamic category tag row (from OSS manifest tag_groups)
    Nn.length > 0 ? e.createElement(
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
        f,
        {
          style: { fontSize: 11, cursor: "pointer", borderRadius: 12 },
          color: nt === "" ? "blue" : void 0,
          onClick: () => Hn("")
        },
        "全部"
      ),
      ...Nn.map(
        (g) => e.createElement(
          f,
          {
            key: g.id,
            style: { fontSize: 11, cursor: "pointer", borderRadius: 12 },
            color: nt === g.id ? "geekblue" : void 0,
            onClick: () => Hn(
              nt === g.id ? "" : g.id
            )
          },
          g.label
        )
      )
    ) : null,
    // Agent cards (dynamic from OSS)
    Gn && Zt.length === 0 ? e.createElement(
      "div",
      { style: { textAlign: "center", padding: 40 } },
      e.createElement(s, { size: "large" }, e.createElement("div", { style: { minHeight: 60, display: "flex", alignItems: "center", justifyContent: "center" } }, "正在加载人才市场..."))
    ) : Zt.length === 0 ? e.createElement(i, {
      description: "未找到匹配的人才",
      image: i.PRESENTED_IMAGE_SIMPLE
    }) : e.createElement(
      u,
      { gutter: [12, 12] },
      ...Zt.map(
        (g) => e.createElement(
          p,
          { key: g.id, xs: 24, sm: 12, md: 8 },
          e.createElement(
            m,
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
                    f,
                    { color: "blue", style: { fontSize: 10 } },
                    ct(g.category)
                  ) : null,
                  g.tags.includes("mcp") ? e.createElement(
                    f,
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
              _t(me, Q, {}), Tt(), Yt();
            },
            loading: he || Ke || Ln || Gn
          },
          "刷新"
        )
      )
    }),
    e.createElement(v, {
      items: Ia,
      activeKey: B,
      onChange: (g) => R(g)
    }),
    // Skill source config modal
    e.createElement(Fo, {
      open: ua,
      onClose: () => Tn(!1),
      sources: $e,
      onChange: (g) => {
        Oe(g), Tt(g);
      }
    }),
    // MCP source config modal
    e.createElement(pr, {
      open: fa,
      onClose: () => In(!1),
      sources: pa,
      onChange: (g) => _n(g),
      type: "mcp"
    }),
    // MCP token config modal (for templates requiring secrets)
    Ta,
    // Expert source config modal
    e.createElement(pr, {
      open: ya,
      onClose: () => An(!1),
      sources: ga,
      onChange: (g) => zn(g),
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
                f,
                { color: "blue", style: { fontSize: 10 } },
                ct(Ue.category)
              ) : null,
              ...Ue.tags.filter(
                (g) => g !== "agent" && g !== "template" && g !== "workspace"
              ).slice(0, 5).map(
                (g) => e.createElement(
                  f,
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
              loading: Xt,
              disabled: Xt,
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
              f,
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
const yr = {
  zh: "您好，UGSci 智能助手在线。无论是油气藏分析、数值模拟还是工程决策，描述您的场景，我来交付结果。",
  en: "UGSci AI assistant is online. From reservoir analysis to numerical simulation and engineering decisions — describe your scenario and I'll deliver results.",
  ja: "UGSci AIアシスタントがオンラインです。油層解析、数値シミュレーション、エンジニアリングの意思決定など、シナリオを描写してください。結果をお届けします。",
  ru: "UGSci AI-ассистент онлайн. От анализа пласта до численного моделирования и инженерных решений — опишите свой сценарий, и я предоставлю результат.",
  vi: "Trợ lý AI UGSci đang trực tuyến. Từ phân tích mỏ, mô phỏng số đến ra quyết định kỹ thuật — mô tả kịch bản của bạn, tôi sẽ giao kết quả.",
  id: "Asisten AI UGSci sedang online. Dari analisis reservoir, simulasi numerik hingga keputusan engineering — jelaskan skenario Anda, saya akan memberikan hasilnya."
}, hr = {
  zh: { label: "能告诉我你都能做点什么吗？", value: "能告诉我你都能做点什么吗" },
  en: { label: "Can you tell me what you can do?", value: "Can you tell me what you can do?" },
  ja: { label: "あなたができることを教えてください", value: "あなたができることを教えてください" },
  ru: { label: "Расскажи, что ты умеешь делать?", value: "Расскажи, что ты умеешь делать?" },
  vi: { label: "Bạn có thể cho tôi biết bạn làm được gì không?", value: "Bạn có thể cho tôi biết bạn làm được gì không?" },
  id: { label: "Bisa cerita apa saja yang bisa Anda lakukan?", value: "Bisa cerita apa saja yang bisa Anda lakukan?" }
};
function Ko() {
  const e = A(), t = e.React, { useEffect: r, useRef: n } = t, a = e.useSelectedAgent ? e.useSelectedAgent() : { id: "default" }, l = (a == null ? void 0 : a.id) || "default", s = n(null), i = n(null);
  return r(() => {
    if (s.current === l) return;
    s.current = l, gn();
    const o = Vo(), c = yr[o] || yr.en, d = hr[o] || hr.en;
    let u = !1;
    return (async () => {
      var p, m;
      try {
        const f = await qt(l);
        if (u) return;
        const y = $r(f);
        if (i.current) {
          try {
            i.current();
          } catch {
          }
          i.current = null;
        }
        const h = window.QwenPaw;
        (p = h == null ? void 0 : h.chat) != null && p.welcome && (y.length > 0 ? (i.current = h.chat.welcome.set("ugsci", {
          description: c,
          prompts: y
        }), console.info(
          `[ugsci] Injected ${y.length} welcome prompts for agent "${l}"`
        )) : (i.current = h.chat.welcome.set("ugsci", {
          description: c,
          prompts: [d]
        }), console.info(
          `[ugsci] No skills for agent "${l}" — using default prompt`
        )));
      } catch (f) {
        console.warn(
          `[ugsci] Failed to inject welcome prompts for agent "${l}":`,
          f
        );
        const y = window.QwenPaw;
        if ((m = y == null ? void 0 : y.chat) != null && m.welcome && !u) {
          if (i.current) {
            try {
              i.current();
            } catch {
            }
            i.current = null;
          }
          i.current = y.chat.welcome.set("ugsci", {
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
const Xo = 256;
let je = {};
const pn = /* @__PURE__ */ new Set(), jt = () => pn.forEach((e) => e()), Yo = (e) => (pn.add(e), () => pn.delete(e)), Er = () => je;
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
const vr = /* @__PURE__ */ new Set(["plugin_call_output", "function_call_output", "tool_call_output", "mcp_call_output", "component_call_output"]), nn = /* @__PURE__ */ new Set(["emit_ui_tree", "emit_ui_patch"]);
function aa(e) {
  var n, a, l, s;
  if (!Array.isArray(e)) return [];
  const t = [], r = (i, o = !1) => {
    var u, p;
    if (!i || typeof i != "object") return;
    if (Array.isArray(i)) {
      if (o ? i.map((f) => {
        var y;
        return ((y = f == null ? void 0 : f.data) == null ? void 0 : y.name) ?? (f == null ? void 0 : f.name);
      }).find((f) => nn.has(String(f || ""))) : void 0)
        for (const f of i) {
          const y = ((u = f == null ? void 0 : f.data) == null ? void 0 : u.output) ?? (f == null ? void 0 : f.output) ?? ((p = f == null ? void 0 : f.data) == null ? void 0 : p.result) ?? (f == null ? void 0 : f.result);
          if (y == null) continue;
          const h = typeof y == "string" ? y : JSON.stringify(y), k = ht(h) || Et(h);
          k && t.push(k);
        }
      i.forEach((f) => r(f));
      return;
    }
    const c = i;
    if (c.type === "tool_result" && nn.has(String(c.name || ""))) {
      const f = (Array.isArray(c.output) ? c.output : []).find((S) => (S == null ? void 0 : S.type) === "text"), y = (f == null ? void 0 : f.text) ?? c.output, h = typeof y == "string" ? y : JSON.stringify(y), k = ht(h) || Et(h);
      k && t.push(k);
      return;
    }
    const d = vr.has(String(c.type || ""));
    Object.entries(c).forEach(
      ([m, f]) => r(f, d && m === "content")
    );
  };
  r(e);
  for (const i of e) {
    if (!i || typeof i != "object") continue;
    const o = i;
    if (!vr.has(String(o.type || "")) || !Array.isArray(o.content)) continue;
    const c = o.content, d = (a = (n = c[0]) == null ? void 0 : n.data) == null ? void 0 : a.name;
    if (!nn.has(d)) continue;
    const u = (s = (l = c[1]) == null ? void 0 : l.data) == null ? void 0 : s.output;
    if (u == null) continue;
    const p = typeof u == "string" ? u : JSON.stringify(u), m = ht(p) || Et(p);
    m && t.push(m);
  }
  return Array.from(new Map(t.map((i) => [`${i.kind}:${i.ui_id}:${i.revision}`, i])).values());
}
function la(e) {
  var s;
  const t = Nt(e.sessionId, e.uiId), r = Object.entries(je).filter(([, i]) => i.uiId === e.uiId).sort(([, i], [, o]) => o.revision - i.revision), n = je[t] || ((s = r[0]) == null ? void 0 : s[1]);
  if (n && e.revision < n.revision) return;
  const a = { ...je };
  for (const [i] of r) i !== t && delete a[i];
  a[t] = n && e.revision === n.revision ? { ...n, ...e, tree: n.tree } : e;
  const l = Object.entries(a).sort(([, i], [, o]) => o.updatedAt - i.updatedAt);
  je = Object.fromEntries(l.slice(0, Xo)), jt();
}
function Qo(e, t) {
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
    const a = (c = window.QwenPaw) == null ? void 0 : c.host, l = n || ((d = a == null ? void 0 : a.getCurrentSessionId) == null ? void 0 : d.call(a)) || "", s = Nt(l, e.ui_id), i = je[s] || Object.values(je).find((u) => u.uiId === e.ui_id);
    if (!i || r <= i.revision) return;
    je = { ...Object.fromEntries(Object.entries(je).filter(([, u]) => u.uiId !== e.ui_id)), [s]: { ...i, sessionId: l, tree: t, revision: r, updatedAt: Date.now() } }, jt();
  },
  getSnapshot: (e, t) => je[Nt(e, t)],
  clearSession(e) {
    je = Object.fromEntries(Object.entries(je).filter(([, t]) => t.sessionId !== e)), jt();
  },
  hydrateFromMessages: Qo
};
function es({ children: e }) {
  return e;
}
function ts() {
  var r, n;
  const e = (n = (r = window.QwenPaw) == null ? void 0 : r.host) == null ? void 0 : n.React;
  if (!e) throw new Error("useGenUiStore: host React not available");
  return { snapshots: e.useSyncExternalStore(Yo, Er, Er), ...Zo };
}
function ns() {
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
function rs(e) {
  const t = e.data;
  if (!t) return { resultText: "", status: "calling", toolName: "" };
  const r = t.status || "calling", n = t.content;
  if (!Array.isArray(n) || n.length === 0)
    return { resultText: "", status: r, toolName: "" };
  const a = n[0], l = a == null ? void 0 : a.data, s = (l == null ? void 0 : l.name) || "";
  if (n.length > 1) {
    const i = n[1], o = i == null ? void 0 : i.data, c = (o == null ? void 0 : o.output) ?? (o == null ? void 0 : o.content) ?? (i == null ? void 0 : i.output) ?? (i == null ? void 0 : i.content) ?? (o == null ? void 0 : o.result) ?? (i == null ? void 0 : i.result);
    if (c != null) return { resultText: vt(c), status: r, toolName: s };
  }
  if (l != null && l.output) {
    const i = l.output;
    return { resultText: vt(i), status: r, toolName: s };
  }
  return { resultText: "", status: r, toolName: s };
}
function Ot(e) {
  var m, f, y, h;
  const t = (m = window.QwenPaw) == null ? void 0 : m.host, r = t == null ? void 0 : t.React;
  if (!r) return null;
  const { resultText: n, status: a, toolName: l } = rs(e), s = a === "in_progress" || a === "calling", i = a === "failed" || a === "error", o = ht(n), c = o ? null : Et(n);
  let d = 0;
  (f = o == null ? void 0 : o.tree) != null && f.root && (d = oa(o.tree.root));
  const u = l === "emit_ui_patch" || (o == null ? void 0 : o.kind) === "genui_patch", p = s ? u ? "📝 Patching UI Tree..." : "🎨 Generating UI Tree..." : i ? u ? "📝 UI Patch Error" : "🎨 UI Tree Error" : o ? u ? `📝 UI Patched (rev ${o.revision ?? "?"})` : `🎨 UI Tree (${d} nodes)` : u ? "📝 UI Patch" : "🎨 UI Tree";
  return r.createElement(
    "details",
    { open: s || i, style: { margin: "4px 0", border: "1px solid var(--ant-color-border, #d9d9d9)", borderRadius: 8, padding: "4px 8px", fontSize: 13 } },
    r.createElement(
      "summary",
      { style: { cursor: "pointer", display: "flex", alignItems: "center", gap: 6 } },
      r.createElement("span", null, u ? "📝" : "🎨"),
      r.createElement("span", null, p),
      o != null && o.ok ? r.createElement("span", { style: { fontSize: 11, color: "#999", marginLeft: "auto" } }, `ui_id: ${((y = o.ui_id) == null ? void 0 : y.slice(0, 16)) ?? ""}…`) : null
    ),
    i || c && !o ? r.createElement(
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
const as = /* @__PURE__ */ new Set(["send_message"]), br = 1e4, ls = 500, wr = {};
function os() {
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
  return new Set(as);
}
function ss(e) {
  const t = Date.now(), r = wr[e] || 0;
  return t - r < ls ? (console.warn("[ugsci.genui] Action '" + e + "' throttled"), !0) : (wr[e] = t, !1);
}
function is(e, t) {
  return e.replace(/\{\{\s*([\w.-]+)\s*\}\}/g, (r, n) => {
    const a = t[n];
    return a == null ? "" : typeof a == "string" ? a : JSON.stringify(a);
  });
}
function sa(e, t = {}) {
  var l, s, i, o, c;
  let r;
  if (typeof e == "string") r = { type: e };
  else if (e && typeof e == "object") r = e;
  else return { ok: !1, message: "无效操作" };
  const n = r.type === "submit_form" ? "send_message" : r.type, a = os();
  if (!a.has(n))
    return console.warn(
      "[ugsci.genui] Action '" + r.type + "' not allowed (allowed: " + Array.from(a).join(", ") + ")"
    ), { ok: !1, message: "此操作未获允许" };
  if (ss(n)) return { ok: !1, message: "操作过于频繁，请稍后重试" };
  if (n === "send_message") {
    const d = t.formValues || {};
    let u = ((l = r.payload) == null ? void 0 : l.content) || ((s = r.payload) == null ? void 0 : s.message) || "";
    const p = /\{\{\s*[\w.-]+\s*\}\}/.test(u);
    return u = is(u, d).trim(), u && !p && Object.keys(d).length > 0 && (u += `
${Object.entries(d).map(([f, y]) => `${f}: ${typeof y == "string" ? y : JSON.stringify(y)}`).join(`
`)}`), !u && Object.keys(d).length > 0 && (u = `${t.formId ? `提交表单 ${t.formId}` : "提交表单"}
${Object.entries(d).map(([y, h]) => `${y}: ${typeof h == "string" ? h : JSON.stringify(h)}`).join(`
`)}`), !u || !u.trim() ? (console.warn("[ugsci.genui] send_message: content is empty"), { ok: !1, message: "消息内容为空" }) : u.length > br ? (console.warn("[ugsci.genui] send_message: content length " + u.length + " exceeds max " + br), { ok: !1, message: "消息内容过长" }) : !((c = (o = (i = window.QwenPaw) == null ? void 0 : i.chat) == null ? void 0 : o.sendMessage) != null && c.call(o, u)) ? (console.info("[ugsci.genui] send_message: could not find chat sender, content:", u), { ok: !1, message: "当前无法发送消息" }) : { ok: !0, message: "已提交" };
  }
  return { ok: !1, message: "尚未实现此操作" };
}
const Fe = /* @__PURE__ */ new Map(), wt = /* @__PURE__ */ new Map(), cs = 128, Mt = /* @__PURE__ */ new Map();
function Dt(e) {
  return e.startsWith("http://") || e.startsWith("https://") || e.startsWith("data:") || e.startsWith("blob:");
}
function ds(e) {
  return e ? !!(e.startsWith("/") || /^[A-Za-z]:[\\/]/.test(e) || e.startsWith("\\\\")) : !1;
}
function ms(e) {
  return e.startsWith("workspace://");
}
function us(e) {
  return ms(e) ? e.slice(12) : e;
}
async function ps(e) {
  if (!e) return null;
  if (Dt(e)) return e;
  if (Fe.has(e))
    return Fe.get(e) ?? null;
  if (Mt.has(e))
    return Mt.get(e);
  const t = fs(e);
  Mt.set(e, t);
  try {
    const r = await t;
    if (!Fe.has(e) && Fe.size >= cs) {
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
async function fs(e) {
  const t = window.QwenPaw, r = t == null ? void 0 : t.host;
  if (!r) {
    const a = "宿主媒体 API 不可用。请在 QwenPaw 工作区中打开此内容，或改用 http(s)、data、blob URL。";
    return wt.set(e, a), console.warn("[ugsci.genui]", a), null;
  }
  const n = us(e);
  if (typeof r.resolveWorkspaceBlob == "function")
    try {
      const a = await r.resolveWorkspaceBlob(n);
      if (a) return a;
    } catch (a) {
      console.warn("[ugsci.genui] host.resolveWorkspaceBlob failed:", a);
    }
  try {
    return await gs(n, r);
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
async function gs(e, t) {
  let r = null;
  const n = t == null ? void 0 : t.workspaceApi, a = t == null ? void 0 : t.chatApi;
  if (ds(e) && (a != null && a.filePreviewUrl) ? r = a.filePreviewUrl(e) : n != null && n.getBinaryFileUrl && (r = n.getBinaryFileUrl(e)), !r)
    throw new Error("宿主未提供 workspaceApi.getBinaryFileUrl 或 chatApi.filePreviewUrl");
  const l = {}, s = t == null ? void 0 : t.buildAuthHeaders;
  if (typeof s == "function")
    try {
      const c = s();
      c && typeof c == "object" && Object.assign(l, c);
    } catch {
    }
  const i = await fetch(r, { headers: l });
  if (!i.ok)
    throw new Error(`HTTP ${i.status}: ${i.statusText}`);
  const o = await i.blob();
  return URL.createObjectURL(o);
}
function xr(e) {
  return e ? Dt(e) ? e : Fe.get(e) ?? null : null;
}
function Sr(e) {
  return wt.get(e) ?? null;
}
function ys() {
  for (const e of Fe.values())
    if (e && e.startsWith("blob:"))
      try {
        URL.revokeObjectURL(e);
      } catch {
      }
  Fe.clear(), wt.clear();
}
const kr = (e) => typeof e == "string" ? e : e != null ? String(e) : "";
let rn = null;
function kn(e) {
  return rn || (rn = e.createContext(null)), rn;
}
function Gt(e) {
  const t = e.props || {}, r = kr(t.name);
  if (r) return r;
  const n = kr(t.label), a = n.match(/^\s*([a-e])(?:\b|\s|（|\()/i);
  return a ? a[1].toLowerCase() : n || e.nodeId;
}
function ia(e, t = {}) {
  if (["Input", "NumberInput", "Select", "Textarea", "Switch", "Slider", "FileInput"].includes(e.kind)) {
    const r = e.props || {}, n = r.value ?? r.checked;
    n !== void 0 && (t[Gt(e)] = n);
  }
  for (const r of e.children || []) ia(r, t);
  return t;
}
function hs({
  node: e,
  children: t,
  onValuesChange: r
}) {
  var o, c;
  const n = (c = (o = window.QwenPaw) == null ? void 0 : o.host) == null ? void 0 : c.React;
  if (!n) return null;
  const a = n.useMemo(() => ia(e), [e]), [l, s] = n.useState(a);
  n.useEffect(
    () => s((d) => ({ ...a, ...d })),
    [a]
  ), n.useEffect(() => {
    r == null || r(l);
  }, [l, r]);
  const i = n.useMemo(
    () => ({
      values: l,
      setValue: (d, u) => s((p) => ({ ...p, [d]: u }))
    }),
    [l]
  );
  return n.createElement(
    kn(n).Provider,
    { value: i },
    t
  );
}
const P = (e) => typeof e == "string" ? e : e != null ? String(e) : "", Ce = (e) => typeof e == "number" ? e : typeof e == "string" && Number(e) || 0, Qe = (e) => !!e, qe = (e) => Array.isArray(e) ? e : [], Cr = { xs: "12px", sm: "13px", base: "14px", lg: "16px" }, ve = {
  muted: "var(--ant-color-text-secondary, #8c8c8c)",
  default: "var(--ant-color-text, #000000d9)",
  primary: "var(--ant-color-primary, #1677ff)",
  success: "var(--ant-color-success, #52c41a)",
  warning: "var(--ant-color-warning, #faad14)",
  error: "var(--ant-color-error, #ff4d4f)"
};
let an = null;
function Cn(e) {
  return an || (an = e.createContext(null)), an;
}
function Es({ node: e }) {
  var p;
  const t = (p = window.QwenPaw) == null ? void 0 : p.host, r = t == null ? void 0 : t.React, n = (t == null ? void 0 : t.antd) || {};
  if (!r) return null;
  const a = e.props || {}, [l, s] = r.useState({}), [i, o] = r.useState(null), c = r.useMemo(() => {
    const m = {};
    for (const f of e.children || []) {
      const y = f.props || {}, h = Gt(f);
      y.value !== void 0 ? m[h] = y.value : y.checked !== void 0 && (m[h] = y.checked);
    }
    return m;
  }, [e]);
  r.useEffect(() => s((m) => ({ ...c, ...m })), [c]);
  const d = r.useMemo(() => ({ values: l, setValue: (m, f) => {
    o(null), s((y) => ({ ...y, [m]: f }));
  } }), [l]), u = () => {
    var y, h;
    const m = (e.children || []).filter((k) => {
      var S;
      return (S = k.props) == null ? void 0 : S.required;
    }).find((k) => {
      const S = Gt(k), x = l[S];
      return x == null || x === "" || Array.isArray(x) && x.length === 0;
    });
    if (m) {
      o({ ok: !1, message: `${P((y = m.props) == null ? void 0 : y.label) || P((h = m.props) == null ? void 0 : h.name) || "必填项"}不能为空` });
      return;
    }
    const f = a.action && typeof a.action == "object" ? a.action : { type: "submit_form", payload: {} };
    o(sa(f, { formValues: l, formId: P(a.formId) || e.nodeId }));
  };
  return r.createElement(
    Cn(r).Provider,
    { value: d },
    r.createElement(
      "div",
      { style: { margin: "4px 0" } },
      a.title ? r.createElement("div", { style: { fontWeight: 600, marginBottom: 8 } }, P(a.title)) : null,
      ...(e.children || []).map((m, f) => r.createElement(st, { key: m.nodeId || f, node: m })),
      r.createElement(n.Button || "button", { type: "primary", size: "small", style: { marginTop: 8 }, onClick: u }, P(a.submitLabel) || "提交"),
      i ? r.createElement("div", { role: "status", style: { marginTop: 6, fontSize: 12, color: i.ok ? ve.success : ve.error } }, i.message) : null
    )
  );
}
function vs({ node: e, fieldType: t }) {
  var k, S, x;
  const r = (k = window.QwenPaw) == null ? void 0 : k.host, n = r == null ? void 0 : r.React, a = (r == null ? void 0 : r.antd) || {};
  if (!n) return null;
  const l = e.props || {}, s = n.useContext(Cn(n)), i = n.useContext(kn(n)), o = s || i, [c, d] = n.useState(l.value ?? l.checked ?? ""), u = Gt(e), p = l.value ?? l.checked ?? "", m = o ? ((S = o.values) == null ? void 0 : S[u]) ?? p : c, f = (v) => {
    const L = v != null && v.target ? t === "Switch" ? v.target.checked : v.target.value : v;
    o ? o.setValue(u, L) : d(L);
  }, y = (v) => n.createElement(
    "div",
    { style: { display: "flex", flexDirection: "column", gap: 4, margin: "4px 0" } },
    l.label && t !== "Switch" ? n.createElement("label", { style: { fontSize: 12, color: ve.muted } }, P(l.label), l.required ? n.createElement("span", { style: { color: ve.error } }, " *") : null) : null,
    v,
    l.description ? n.createElement("span", { style: { fontSize: 11, color: ve.muted } }, P(l.description)) : null
  ), h = P(l.label) || P(l.placeholder) || u;
  return t === "Input" ? y(n.createElement(a.Input || "input", { "aria-label": h, placeholder: P(l.placeholder), value: m, onChange: f, size: "small" })) : t === "NumberInput" ? y(n.createElement(a.InputNumber || "input", { "aria-label": h, value: m, min: l.min, max: l.max, step: l.step, onChange: f, size: "small", style: { width: "100%" } })) : t === "Textarea" ? y(n.createElement(((x = a.Input) == null ? void 0 : x.TextArea) || "textarea", { "aria-label": h, placeholder: P(l.placeholder), value: m, rows: Ce(l.rows) || 3, onChange: f, style: { width: "100%" } })) : t === "Select" ? y(n.createElement(a.Select || "select", { "aria-label": h, placeholder: P(l.placeholder), value: m || void 0, onChange: f, size: "small", style: { width: "100%" } }, qe(l.options).map((v, L) => {
    var D;
    return n.createElement(((D = a.Select) == null ? void 0 : D.Option) || "option", { key: L, value: P(typeof v == "object" ? v.value : v) }, P(typeof v == "object" ? v.label : v));
  }))) : t === "Switch" ? n.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8 } }, n.createElement(a.Switch || "input", { type: "checkbox", checked: !!m, onChange: f, size: "small" }), n.createElement("span", null, P(l.label))) : t === "Slider" ? y(n.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8 } }, n.createElement(a.Slider || "input", { type: "range", value: Ce(m), min: l.min ?? 0, max: l.max ?? 100, step: l.step ?? 1, onChange: f, style: { flex: 1 } }), n.createElement("span", { style: { minWidth: 32, fontSize: 12 } }, P(m)))) : t === "FileInput" ? n.createElement(
    "label",
    { style: { display: "inline-flex", alignItems: "center", gap: 8, cursor: "pointer" } },
    n.createElement("span", null, P(l.label) || "选择文件"),
    n.createElement("input", { type: "file", multiple: Qe(l.multiple), accept: P(l.accept) || void 0, onChange: (v) => o == null ? void 0 : o.setValue(u, Array.from(v.target.files || []).map((L) => ({ name: L.name, size: L.size, type: L.type }))) })
  ) : null;
}
function ln({ node: e, link: t = !1, toggle: r = !1 }) {
  var m;
  const n = (m = window.QwenPaw) == null ? void 0 : m.host, a = n == null ? void 0 : n.React, l = (n == null ? void 0 : n.antd) || {};
  if (!a) return null;
  const s = e.props || {}, i = a.useContext(Cn(a)), [o, c] = a.useState(Qe(s.checked)), [d, u] = a.useState(null), p = () => {
    r && c((f) => !f), s.action && typeof s.action == "object" ? u(sa(s.action, { formValues: i == null ? void 0 : i.values, formId: i ? "form" : void 0 })) : t && typeof s.href == "string" && /^(https?:\/\/|\/)/.test(s.href) && window.open(s.href, "_blank", "noopener,noreferrer");
  };
  return a.createElement(
    "span",
    { style: { display: "inline-flex", flexDirection: "column", gap: 3 } },
    a.createElement(l.Button || "button", { type: t ? "link" : (r ? o : P(s.variant) === "primary") ? "primary" : "default", size: "small", disabled: Qe(s.disabled), loading: Qe(s.loading), onClick: p }, P(s.label) || "Action"),
    d ? a.createElement("span", { role: "status", style: { fontSize: 11, color: d.ok ? ve.success : ve.error } }, d.message) : null
  );
}
function bs({ node: e, children: t }) {
  var l;
  const r = (l = window.QwenPaw) == null ? void 0 : l.host, n = r == null ? void 0 : r.React;
  if (!n) return null;
  class a extends n.Component {
    constructor(i) {
      super(i), this.state = { hasError: !1 };
    }
    static getDerivedStateFromError() {
      return { hasError: !0 };
    }
    componentDidCatch(i) {
      console.error("[ugsci.genui] Component error for kind '%s':", this.props.node.kind, i);
    }
    render() {
      return this.state.hasError ? n.createElement("div", {
        style: { padding: 8, border: "1px dashed var(--ant-color-error, #ff4d4f)", borderRadius: 8, fontSize: 12, color: ve.error, fontFamily: "monospace" }
      }, `⚠️ Component error: ${this.props.node.kind}`) : this.props.children;
    }
  }
  return n.createElement(a, { node: e }, t);
}
function st({ node: e }) {
  var i;
  const t = (i = window.QwenPaw) == null ? void 0 : i.host;
  if (!(t != null && t.React)) return null;
  const r = t.React, n = t.antd || {}, a = e.props || {}, l = e.children || [], s = () => l.map(
    (o, c) => r.createElement(st, { key: o.nodeId || c, node: o })
  );
  return r.createElement(
    bs,
    { node: e },
    ws(r, n, e, a, l, s)
  );
}
function ws(e, t, r, n, a, l) {
  var s, i;
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
      const o = P(n.ratio) || "16:9", [c, d] = o.split(":").map(Number), u = c && d ? `${d}/${c}` : "9/16";
      return e.createElement("div", { style: { aspectRatio: u, overflow: "hidden", borderRadius: 8, display: "flex", justifyContent: "center", alignItems: "center" } }, l());
    }
    case "Text":
      return e.createElement("div", { style: { fontSize: Cr[P(n.size)] || Cr.base, color: ve[P(n.color)] || ve.default, fontWeight: Qe(n.bold) ? "bold" : "normal", lineHeight: 1.6 } }, P(n.value));
    case "Heading": {
      const o = Math.min(Math.max(Ce(n.level) || 2, 1), 4), c = { 1: "24px", 2: "20px", 3: "18px", 4: "16px" };
      return e.createElement("div", { style: { fontSize: c[o], fontWeight: "bold", margin: "4px 0" } }, P(n.value));
    }
    case "Divider":
      return e.createElement(t.Divider || "hr", n.label ? { children: P(n.label) } : {});
    case "Markdown": {
      const o = (s = window.QwenPaw) == null ? void 0 : s.host, c = o == null ? void 0 : o.ReactMarkdown;
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
          (c, d) => e.createElement(t.Skeleton || "div", { key: d, active: Qe(n.active), title: !1, paragraph: { rows: 1 } })
        )
      );
    }
    case "Avatar":
      return e.createElement(Tr, {
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
      return e.createElement(t.Card || "div", { size: "small", style: { margin: "4px 0" } }, e.createElement("div", { style: { display: "flex", gap: 12, alignItems: "center" } }, e.createElement(Tr, { src: P(n.avatar), name: P(n.name), size: 48 }), e.createElement("div", null, e.createElement("div", { style: { fontWeight: 600 } }, P(n.name)), e.createElement("div", { style: { fontSize: 12, color: ve.muted } }, P(n.role)), n.bio ? e.createElement("div", { style: { fontSize: 12, marginTop: 4 } }, P(n.bio)) : null)));
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
        ...o.map((d, u) => {
          var p;
          return e.createElement(((p = t.Steps) == null ? void 0 : p.Item) || "div", { key: u, title: d });
        })
      );
    }
    case "Table": {
      const o = qe(n.headers).map((p) => P(p)), d = a.filter((p) => p.kind === "TableRow").map((p, m) => {
        const f = (p.children || []).filter((h) => h.kind === "TableCell"), y = { key: m };
        return o.forEach((h, k) => {
          var x, v;
          const S = (v = (x = f[k]) == null ? void 0 : x.props) == null ? void 0 : v.value;
          y[h] = S == null ? "" : P(S);
        }), y;
      }), u = o.map((p) => ({ title: p, dataIndex: p, key: p }));
      return e.createElement(t.Table || "table", { dataSource: d, columns: u, size: Qe(n.compact) ? "small" : "middle", pagination: !1, style: { margin: "4px 0" } });
    }
    case "List": {
      const o = a.filter((c) => c.kind === "ListItem");
      return e.createElement(
        t.List || "ul",
        { size: "small", style: { margin: "4px 0" } },
        o.map((c, d) => {
          var u, p, m;
          return e.createElement(((u = t.List) == null ? void 0 : u.Item) || "li", { key: d }, (p = c.props) != null && p.icon ? e.createElement("span", { style: { marginRight: 6 } }, P(c.props.icon)) : null, P((m = c.props) == null ? void 0 : m.value));
        })
      );
    }
    case "ImageGallery": {
      const o = a.filter((c) => c.kind === "Image");
      return e.createElement(
        "div",
        { style: { display: "grid", gridTemplateColumns: `repeat(${Math.min(Math.max(Ce(n.columns) || 3, 1), 6)}, 1fr)`, gap: `${Ce(n.gap) || 8}px`, margin: "4px 0" } },
        ...o.map((c, d) => {
          const u = c.props || {};
          return e.createElement(Rt, { key: d, src: P(u.src), alt: P(u.alt), style: { width: "100%", height: 120, objectFit: "cover", borderRadius: 8, cursor: "pointer" } });
        })
      );
    }
    case "Image":
      return e.createElement("div", null, e.createElement(Rt, { src: P(n.src), alt: P(n.alt), style: { maxWidth: "100%", borderRadius: Qe(n.rounded) ? "8px" : void 0, maxHeight: n.maxHeight ? `${Ce(n.maxHeight)}px` : void 0 } }), n.caption ? e.createElement("div", { style: { fontSize: 12, color: ve.muted } }, P(n.caption)) : null);
    case "Chart":
      return e.createElement(xs, { props: n });
    case "Button":
    case "InteractiveButton":
      return e.createElement(ln, { node: r });
    case "ToggleButton":
      return e.createElement(ln, { node: r, toggle: !0 });
    case "LinkButton":
      return e.createElement(ln, { node: r, link: !0 });
    case "Input":
    case "NumberInput":
    case "Select":
    case "Textarea":
    case "Switch":
    case "Slider":
    case "FileInput":
      return e.createElement(vs, { node: r, fieldType: r.kind });
    case "Form":
      return e.createElement(Es, { node: r });
    case "Chip":
      return e.createElement(t.Tag || "span", { color: P(n.color) || "default", closable: !0, onClose: () => {
      }, children: P(n.label) });
    case "ChipGroup": {
      const o = qe(n.items);
      return e.createElement("div", { style: { display: "flex", flexWrap: "wrap", gap: 4 } }, ...o.map((c, d) => e.createElement(t.Tag || "span", { key: d }, P(c))));
    }
    case "Tabs": {
      const c = a.filter((d) => d.kind === "TabItem").map((d) => {
        var u, p, m;
        return {
          key: P((u = d.props) == null ? void 0 : u.key) || P((p = d.props) == null ? void 0 : p.tab),
          label: P((m = d.props) == null ? void 0 : m.tab),
          children: (d.children || []).map((f, y) => e.createElement(st, { key: f.nodeId || y, node: f }))
        };
      });
      return t.Tabs ? e.createElement(t.Tabs, { items: c, defaultActiveKey: P(n.activeKey) || ((i = c[0]) == null ? void 0 : i.key) }) : e.createElement("div", null, ...c.map((d, u) => e.createElement("div", { key: u }, e.createElement("div", { style: { fontWeight: 600, marginBottom: 4 } }, d.label), d.children)));
    }
    case "TabItem":
      return e.createElement("div", null, l());
    case "Accordion": {
      const o = a.filter((c) => c.kind === "AccordionItem");
      if (t.Collapse) {
        const c = o.map((d) => {
          var u, p, m;
          return {
            key: P((u = d.props) == null ? void 0 : u.key) || P((p = d.props) == null ? void 0 : p.header),
            label: P((m = d.props) == null ? void 0 : m.header),
            children: (d.children || []).map((f, y) => e.createElement(st, { key: f.nodeId || y, node: f }))
          };
        });
        return e.createElement(t.Collapse, { items: c });
      }
      return e.createElement("div", null, ...o.map((c, d) => {
        var u;
        return e.createElement("details", { key: d }, e.createElement("summary", { style: { fontWeight: 600, cursor: "pointer", padding: "4px 0" } }, P((u = c.props) == null ? void 0 : u.header)), e.createElement("div", { style: { paddingLeft: 12 } }, (c.children || []).map((p, m) => e.createElement(st, { key: p.nodeId || m, node: p }))));
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
function xs({ props: e }) {
  var X, H;
  const t = (H = (X = window.QwenPaw) == null ? void 0 : X.host) == null ? void 0 : H.React;
  if (!t) return null;
  const r = t.useContext(kn(t)), n = P(e.chart) || "line", a = P(e.title);
  let l = qe(e.categories).map((b) => P(b)), s = qe(e.series);
  const i = Ce(e.height) || 200, o = e.showLegend !== !1, c = 400, d = e.generator && typeof e.generator == "object" ? e.generator : {}, u = qe(d.coefficients).map(P), p = ["a", "b", "c", "d", "e"], m = u.length > 0 ? u : p;
  if ((P(d.type) === "polynomial" || u.length > 0 || p.every((b) => {
    var E;
    return ((E = r == null ? void 0 : r.values) == null ? void 0 : E[b]) !== void 0;
  })) && r) {
    const b = typeof d.xMin == "number" ? d.xMin : -3, E = typeof d.xMax == "number" ? d.xMax : 3, _ = Math.min(Math.max(Ce(d.samples) || 61, 10), 400), I = Array.from({ length: _ }, ($, O) => b + (E - b) * O / (_ - 1)), U = m.map(($) => {
      var O;
      return Ce((O = r.values) == null ? void 0 : O[$]);
    });
    l = I.map(($) => Number($.toFixed(2)).toString()), s = [{ name: P(d.label) || "f(x)", values: I.map(($) => U.reduce((O, z, w) => O + z * Math.pow($, U.length - w - 1), 0)) }];
  }
  const y = s.map((b, E) => {
    const _ = b, I = qe(_.values).map((U) => Ce(U));
    return { name: P(_.name) || `Series ${E + 1}`, values: I };
  });
  if (l.length === 0 || y.length === 0)
    return t.createElement("div", { style: { padding: 12, color: ve.muted, fontSize: 12 } }, "Chart: no data");
  if (n === "pie") {
    const b = y[0].values.map((z) => Math.abs(z)), E = b.reduce((z, w) => z + w, 0) || 1, _ = c / 2, I = i / 2, U = Math.min(c, i) / 2 - 20;
    let $ = -Math.PI / 2;
    const O = b.map((z, w) => {
      const le = z / E * 2 * Math.PI, oe = _ + U * Math.cos($), B = I + U * Math.sin($), R = _ + U * Math.cos($ + le), ne = I + U * Math.sin($ + le), Z = le > Math.PI ? 1 : 0, W = `M ${_} ${I} L ${oe} ${B} A ${U} ${U} 0 ${Z} 1 ${R} ${ne} Z`;
      return $ += le, { path: W, color: at[w % at.length], label: l[w] || `#${w + 1}`, val: z };
    });
    return t.createElement(
      "div",
      { style: { margin: "4px 0" } },
      a ? t.createElement("div", { style: { fontSize: 13, fontWeight: 600, marginBottom: 4 } }, a) : null,
      t.createElement(
        "svg",
        { width: c, height: i, style: { maxWidth: "100%" } },
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
  const h = y.flatMap((b) => b.values), k = Math.max(...h, 0), S = Math.min(...h, 0), x = k - S || 1, v = l.length > 0 ? (c - 40) / l.length : 0, L = y.length > 0 ? Math.max(1, v / y.length - 2) : 0, D = l.length > 1 ? (c - 40) / (l.length - 1) : 0, F = Math.max(1, Math.ceil(l.length / 8)), G = (b) => i - 20 - (b - S) / x * (i - 40), j = G(0), K = (b) => 30 + b * D;
  return t.createElement(
    "div",
    { style: { margin: "4px 0" } },
    a ? t.createElement("div", { style: { fontSize: 13, fontWeight: 600, marginBottom: 4 } }, a) : null,
    t.createElement(
      "svg",
      { width: c, height: i, style: { maxWidth: "100%" } },
      ...[0, 0.25, 0.5, 0.75, 1].map((b, E) => {
        const _ = i - 20 - b * (i - 40);
        return t.createElement("line", { key: `g${E}`, x1: 30, y1: _, x2: c - 10, y2: _, stroke: "var(--ant-color-border-secondary, #f0f0f0)", strokeWidth: 1 });
      }),
      ...l.map((b, E) => E % F === 0 || E === l.length - 1 ? t.createElement("text", { key: `x${E}`, x: K(E), y: i - 6, fontSize: 10, fill: ve.muted, textAnchor: "middle" }, b.length > 6 ? b.slice(0, 6) + "…" : b) : null),
      ...y.map((b, E) => {
        const _ = at[E % at.length];
        if (n === "bar")
          return b.values.map(($, O) => t.createElement("rect", {
            key: `b${E}-${O}`,
            x: 30 + O * v + E * (L + 2) + 1,
            y: Math.min(G($), j),
            width: L,
            height: Math.abs(j - G($)),
            fill: _,
            rx: 2
          }));
        const I = b.values.map(($, O) => `${K(O)},${G($)}`).join(" "), U = [t.createElement("polyline", { key: `l${E}`, points: I, fill: "none", stroke: _, strokeWidth: 2 })];
        if (n === "area") {
          const $ = `${K(0)},${i - 20} ${I} ${K(b.values.length - 1)},${i - 20}`;
          U.unshift(t.createElement("polygon", { key: `a${E}`, points: $, fill: _, opacity: 0.15 }));
        }
        return U;
      })
    ),
    o ? t.createElement(
      "div",
      { style: { display: "flex", flexWrap: "wrap", gap: 8, marginTop: 4, fontSize: 11 } },
      ...y.map((b, E) => t.createElement(
        "span",
        { key: E, style: { display: "flex", alignItems: "center", gap: 4 } },
        t.createElement("span", { style: { display: "inline-block", width: 10, height: 10, borderRadius: 2, background: at[E % at.length] } }),
        b.name
      ))
    ) : null
  );
}
function Rt(e) {
  var c;
  const t = (c = window.QwenPaw) == null ? void 0 : c.host, r = t == null ? void 0 : t.React;
  if (!r) return null;
  const { useState: n, useEffect: a } = r, [l, s] = n(
    xr(e.src) || (Dt(e.src) ? e.src : null)
  ), [i, o] = n(
    Sr(e.src)
  );
  return a(() => {
    if (!e.src) return;
    if (Dt(e.src)) {
      s(e.src), o(null);
      return;
    }
    const d = xr(e.src);
    if (d) {
      s(d), o(null);
      return;
    }
    s(null), o(null);
    let u = !1;
    return ps(e.src).then((p) => {
      u || (s(p), o(p ? null : Sr(e.src)));
    }), () => {
      u = !0;
    };
  }, [e.src]), l ? r.createElement("img", {
    src: l,
    alt: e.alt || "",
    style: e.style || {},
    onError: () => {
      console.warn("[ugsci.genui] Image failed to load:", e.src);
    }
  }) : r.createElement(
    "div",
    {
      role: i ? "alert" : "status",
      style: {
        ...e.style || {},
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: 80,
        padding: 12,
        textAlign: "center",
        color: i ? ve.error : ve.muted,
        fontSize: 12,
        background: "var(--ant-color-fill-tertiary, rgba(0,0,0,0.04))",
        borderRadius: 8
      }
    },
    i ? `媒体加载失败：${i}` : "正在解析图片…"
  );
}
function Tr(e) {
  var a, l, s;
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
    ((s = (l = e.name) == null ? void 0 : l.charAt(0)) == null ? void 0 : s.toUpperCase()) || ""
  ) : null;
}
async function Ss(e, t) {
  var d;
  const r = e.getBoundingClientRect(), n = Math.min(window.devicePixelRatio || 1, 2), a = document.createElement("canvas");
  a.width = Math.ceil(r.width * n), a.height = Math.ceil(Math.max(r.height, e.scrollHeight) * n);
  const l = a.getContext("2d");
  if (!l) throw new Error("canvas is unavailable");
  l.scale(n, n), l.fillStyle = "#fff", l.fillRect(0, 0, a.width, a.height);
  for (const u of Array.from(e.querySelectorAll("*"))) {
    const p = u.getBoundingClientRect();
    if (!p.width || !p.height) continue;
    const m = getComputedStyle(u), f = p.left - r.left, y = p.top - r.top;
    m.backgroundColor && m.backgroundColor !== "rgba(0, 0, 0, 0)" && (l.fillStyle = m.backgroundColor, l.fillRect(f, y, p.width, p.height)), m.borderTopWidth !== "0px" && (l.strokeStyle = m.borderTopColor, l.strokeRect(f, y, p.width, p.height));
  }
  const s = document.createTreeWalker(e, NodeFilter.SHOW_TEXT);
  for (; s.nextNode(); ) {
    const u = s.currentNode, p = (d = u.textContent) == null ? void 0 : d.trim();
    if (!p) continue;
    const m = document.createRange();
    m.selectNodeContents(u);
    const f = m.getBoundingClientRect(), y = u.parentElement;
    if (!y || !f.width) continue;
    const h = getComputedStyle(y);
    l.font = `${h.fontWeight} ${h.fontSize} ${h.fontFamily}`, l.fillStyle = h.color || "#111", l.textBaseline = "top", l.fillText(p, f.left - r.left, f.top - r.top, Math.max(1, r.width - (f.left - r.left)));
  }
  for (const u of Array.from(e.querySelectorAll("input,textarea"))) {
    if (!u.value) continue;
    const p = u.getBoundingClientRect(), m = getComputedStyle(u);
    l.font = `${m.fontSize} ${m.fontFamily}`, l.fillStyle = m.color || "#111", l.fillText(u.value, p.left - r.left + 8, p.top - r.top + 6);
  }
  const i = await new Promise((u, p) => a.toBlob((m) => m ? u(m) : p(new Error("PNG encoding failed")), "image/png")), o = URL.createObjectURL(i), c = document.createElement("a");
  c.download = `${t}.png`, c.href = o, c.click(), setTimeout(() => URL.revokeObjectURL(o), 1e3), console.info("[ugsci.genui] PNG export created", { filename: t, bytes: i.size });
}
function ks(e) {
  return e.replace(/[&<>\"']/g, (t) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[t] || t);
}
function _r(e) {
  return JSON.stringify(e).replace(/</g, "\\u003c");
}
const Cs = String.raw`
(function () {
  "use strict";
  var tree = JSON.parse(document.getElementById("genui-tree-data").textContent || "null");
  var values = JSON.parse(document.getElementById("genui-values-data").textContent || "{}");
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
    var all = [].concat.apply([], series.map(function (item) { return item.values; })), max = Math.max.apply(Math, all.concat([0])), min = Math.min.apply(Math, all.concat([0])), range = max - min || 1;
    var y = function (v) { return height - 24 - ((v - min) / range) * (height - 44); }, x = function (i) { return 30 + i * (width - 50) / Math.max(categories.length - 1, 1); };
    var axis = document.createElementNS(svg.namespaceURI, "line"); axis.setAttribute("x1", "30"); axis.setAttribute("x2", String(width - 15)); axis.setAttribute("y1", String(y(0))); axis.setAttribute("y2", String(y(0))); axis.setAttribute("stroke", "#d9d9d9"); svg.appendChild(axis);
    var colors = ["#1677ff", "#52c41a", "#faad14", "#ff4d4f", "#722ed1"];
    series.forEach(function (item, seriesIndex) {
      var points = item.values.map(function (v, i) { return x(i) + "," + y(v); }).join(" ");
      var line = document.createElementNS(svg.namespaceURI, "polyline"); line.setAttribute("points", points); line.setAttribute("fill", text(p.chart) === "area" ? colors[seriesIndex % colors.length] + "22" : "none"); line.setAttribute("stroke", colors[seriesIndex % colors.length]); line.setAttribute("stroke-width", "2"); line.setAttribute("data-series", item.name); svg.appendChild(line);
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
    if (source.kind === "CodeBlock") return node("pre", "code", p.code);
    if (source.kind === "Divider") { result = node("div", "divider"); if (p.label) result.appendChild(node("span", "", p.label)); return result; }
    if (source.kind === "Spacer") { result = node("div"); result.style.height = (number(p.size) || 16) + "px"; return result; }
    if (source.kind === "Tabs") {
      result = node("div", "tabs"); var buttons = node("div", "tab-buttons"), panels = node("div"); var tabs = children.filter(function (c) { return c.kind === "TabItem"; });
      tabs.forEach(function (tab, index) { var button = node("button", index ? "" : "active", tab.props && tab.props.tab); var panel = appendChildren(node("div", index ? "tab-panel hidden" : "tab-panel"), tab.children); button.addEventListener("click", function () { Array.prototype.forEach.call(buttons.children, function (b) { b.classList.remove("active"); }); Array.prototype.forEach.call(panels.children, function (p) { p.classList.add("hidden"); }); button.classList.add("active"); panel.classList.remove("hidden"); }); buttons.appendChild(button); panels.appendChild(panel); }); result.append(buttons, panels); return result;
    }
    if (source.kind === "Accordion") { result = node("div"); children.filter(function (c) { return c.kind === "AccordionItem"; }).forEach(function (item) { var details = node("details"); details.append(node("summary", "", item.props && item.props.header), appendChildren(node("div", "accordion-body"), item.children)); result.appendChild(details); }); return result; }
    if (source.kind === "Button" || source.kind === "InteractiveButton" || source.kind === "ToggleButton" || source.kind === "LinkButton") {
      result = node("button", source.kind === "LinkButton" ? "link-button" : "button", p.label || "Action"); result.disabled = Boolean(p.disabled);
      result.addEventListener("click", function () { if (source.kind === "ToggleButton") result.classList.toggle("active"); else if (source.kind === "LinkButton" && /^https?:\/\//.test(text(p.href))) window.open(text(p.href), "_blank", "noopener,noreferrer"); else { var status = result.nextElementSibling; if (!status || !status.classList.contains("offline-status")) { status = node("small", "offline-status", "离线导出不支持发送消息或提交到 QwenPaw"); result.after(status); } } }); return result;
    }
    if (source.kind === "Image") { result = node("figure"); var image = node("img"); image.src = text(p.src); image.alt = text(p.alt); result.appendChild(image); if (p.caption) result.appendChild(node("figcaption", "", p.caption)); return result; }
    if (source.kind === "Badge" || source.kind === "Tag" || source.kind === "Chip") return node("span", "tag", p.value || p.label);
    if (source.kind === "Progress") { result = node("progress"); result.max = 100; result.value = number(p.value); return result; }
    if (source.kind === "JsonDebug") { result = node("details"); result.append(node("summary", "", p.label || "Debug JSON"), node("pre", "code", JSON.stringify(p.data == null ? p : p.data, null, 2))); return result; }
    var classMap = { Stack: "stack", Row: "row", Grid: "grid", Card: "card", DataCard: "card", MetricCard: "card", Alert: "alert", AlertCard: "alert", Callout: "alert", KpiBoard: "stack", FeatureGrid: "grid", Form: "stack" };
    result = node("div", classMap[source.kind] || "component");
    if (source.kind === "Grid" || source.kind === "FeatureGrid") result.style.gridTemplateColumns = "repeat(" + Math.min(Math.max(number(p.columns) || 2, 1), 6) + ", minmax(0,1fr))";
    if (source.kind === "Card" && p.title) result.appendChild(node("div", "card-title", p.title));
    if ((source.kind === "Alert" || source.kind === "AlertCard" || source.kind === "Callout") && (p.title || p.message)) { if (p.title) result.appendChild(node("strong", "", p.title)); if (p.message) result.appendChild(node("div", "", p.message)); }
    else appendChildren(result, children);
    return result;
  }
  root.appendChild(render(tree));
  renderCharts();
  window.__GENUI_EXPORT__ = { tree: tree, values: values, refresh: renderCharts };
})();`;
function Ts(e, t, r, n, a = n) {
  const l = `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${ks(a)}</title>
  <style>
    :root { color-scheme: light; }
    html, body { margin: 0; padding: 0; background: #f5f7fa; color: #1f2329; }
    body { padding: 24px; font-family: system-ui, -apple-system, "Segoe UI", sans-serif; }
    *, *::before, *::after { box-sizing: border-box; }
    #genui-root { max-width: 960px; margin: auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px; background: #fff; box-shadow: 0 8px 30px rgba(0,0,0,.05); }
    .stack { display: flex; flex-direction: column; gap: 12px; } .row { display: flex; gap: 12px; align-items: center; } .grid { display: grid; gap: 12px; }
    .card { padding: 14px; border: 1px solid #e5e7eb; border-radius: 10px; } .card-title,.chart-title { margin-bottom: 8px; font-weight: 600; }
    .field { display: flex; flex-direction: column; gap: 5px; margin: 5px 0; } .field-label,.description { color: #667085; font-size: 12px; }
    input,select,textarea,button { font: inherit; } input:not([type=range]):not([type=checkbox]),select,textarea { width: 100%; padding: 7px 9px; border: 1px solid #d0d5dd; border-radius: 6px; }
    input[type=range] { flex: 1; accent-color: #1677ff; } .slider-line,.switch-line { display: flex; align-items: center; gap: 10px; } .slider-value { min-width: 42px; font-size: 12px; }
    button { padding: 6px 12px; border: 1px solid #d0d5dd; border-radius: 6px; background: #fff; cursor: pointer; } button.active,.button:hover { color: #1677ff; border-color: #1677ff; }
    .tabs { margin: 6px 0; } .tab-buttons { display: flex; gap: 4px; border-bottom: 1px solid #e5e7eb; } .tab-buttons button { border: 0; border-radius: 0; } .tab-buttons button.active { border-bottom: 2px solid #1677ff; } .tab-panel { padding: 12px 2px; } .hidden { display: none; }
    details { border-bottom: 1px solid #e5e7eb; } summary { padding: 9px 0; cursor: pointer; font-weight: 600; } .accordion-body { padding: 0 0 10px 12px; }
    .chart svg { display: block; width: 100%; height: auto; min-height: 180px; } .legend { display: flex; flex-wrap: wrap; gap: 10px; font-size: 12px; } .legend span { display: flex; align-items: center; gap: 4px; } .legend i { width: 10px; height: 10px; border-radius: 2px; }
    .tag { display: inline-block; padding: 2px 8px; border-radius: 999px; background: #f0f5ff; color: #1677ff; } .alert { padding: 10px 12px; border: 1px solid #91caff; border-radius: 8px; background: #e6f4ff; }
    .code { padding: 12px; overflow: auto; border-radius: 8px; background: #f2f4f7; } .divider { display: flex; align-items: center; margin: 10px 0; border-top: 1px solid #e5e7eb; } .divider span { padding-right: 8px; background: white; transform: translateY(-50%); }
    figure { margin: 0; } img { max-width: 100%; } .bold { font-weight: 700; } .offline-status { display: block; margin-top: 5px; color: #b54708; }
    @media print { body { padding: 0; } }
  </style>
</head>
<body><main id="genui-root"></main>
<script id="genui-tree-data" type="application/json">${_r(t)}<\/script>
<script id="genui-values-data" type="application/json">${_r(r)}<\/script>
<script>${Cs}<\/script></body>
</html>`, s = new Blob([l], { type: "text/html;charset=utf-8" }), i = URL.createObjectURL(s), o = document.createElement("a");
  o.download = `${n}.html`, o.href = i, o.click(), setTimeout(() => URL.revokeObjectURL(i), 1e3), console.info("[ugsci.genui] HTML export created", { filename: n, bytes: s.size });
}
function _s(e, t) {
  const r = window.open("", "_blank", "noopener,noreferrer");
  if (!r) throw new Error("print window was blocked");
  r.document.write(`<!doctype html><html><head><title>${t}</title><style>body{font-family:system-ui;padding:24px}@media print{button{display:none}}</style></head><body>${e.outerHTML}</body></html>`), r.document.close(), r.addEventListener("load", () => {
    r.focus(), r.print(), r.close();
  }, { once: !0 });
}
const Is = [], it = /* @__PURE__ */ new Map();
function zs(e) {
  it.set(e, (it.get(e) || 0) + 1);
}
function As(e) {
  const t = (it.get(e) || 1) - 1;
  t > 0 ? it.set(e, t) : it.delete(e);
}
function $s(e) {
  return (it.get(e) || 0) > 0;
}
function Ps({ data: e }) {
  var u, p;
  const t = (u = window.QwenPaw) == null ? void 0 : u.host, r = t == null ? void 0 : t.React;
  if (!r) return null;
  const n = ts(), a = r.useRef(/* @__PURE__ */ new Map()), l = ((p = t.getCurrentSessionId) == null ? void 0 : p.call(t)) || "__current_chat__", s = Array.isArray(e.output) ? e.output : Is, i = r.useMemo(
    () => aa(s),
    [s]
  );
  r.useEffect(() => {
    for (const m of i) {
      if (!m.ui_id || !m.tree) continue;
      const f = n.getSnapshot(l, m.ui_id);
      f && f.revision >= (m.revision || 1) || n.setSnapshot({
        schemaVersion: "1",
        uiId: m.ui_id,
        revision: m.revision || 1,
        tree: m.tree,
        sessionId: l,
        sourceToolCallId: m.tool_call_id,
        updatedAt: Date.now()
      });
    }
  }, [i, l]);
  const o = r.useMemo(
    () => i.filter((m) => m.kind === "genui" && !!m.ui_id).map((m) => m.ui_id),
    [i]
  ), c = o.join("\0");
  r.useEffect(() => {
    for (const m of o) zs(m);
    return () => {
      for (const m of o) As(m);
    };
  }, [c]);
  const d = Object.values(n.snapshots).filter((m) => m.sessionId === l).filter(
    (m) => (
      // Only include snapshots whose ui_id appears in this response's results
      i.some(
        (f) => f.ui_id === m.uiId && (f.kind === "genui" || f.kind === "genui_patch" && !$s(m.uiId))
      )
    )
  ).sort((m, f) => m.updatedAt - f.updatedAt);
  return d.length === 0 ? null : r.createElement(
    "div",
    { className: "qwenpaw-genui-inline", style: { marginTop: 8, marginBottom: 8 } },
    ...d.map(
      (m) => r.createElement(
        "div",
        {
          key: Nt(m.sessionId, m.uiId),
          className: "qwenpaw-genui-tree",
          "data-genui-id": m.uiId,
          style: { border: "1px solid var(--ant-color-border-secondary, #f0f0f0)", borderRadius: 12, padding: 16, marginBottom: 8, background: "var(--ant-color-bg-container, #fff)" },
          ref: (f) => {
            f && (f.__genuiId = m.uiId);
          }
        },
        r.createElement(
          "div",
          { className: "qwenpaw-genui-export-target" },
          r.createElement(hs, {
            node: m.tree.root,
            onValuesChange: (f) => a.current.set(m.uiId, f),
            children: r.createElement(st, { node: m.tree.root })
          })
        ),
        r.createElement(
          "div",
          { style: { display: "flex", justifyContent: "flex-end", gap: 6, marginTop: 8 } },
          r.createElement("button", { type: "button", title: "导出 PNG", onClick: (f) => {
            var h;
            const y = (h = f.currentTarget.closest(".qwenpaw-genui-tree")) == null ? void 0 : h.querySelector(".qwenpaw-genui-export-target");
            y && Ss(y, m.uiId).catch((k) => console.warn("[ugsci.genui] PNG export failed", k));
          } }, "PNG"),
          r.createElement("button", { type: "button", title: "打印或另存为 PDF", onClick: (f) => {
            var h;
            const y = (h = f.currentTarget.closest(".qwenpaw-genui-tree")) == null ? void 0 : h.querySelector(".qwenpaw-genui-export-target");
            y && _s(y, m.uiId);
          } }, "PDF"),
          r.createElement("button", { type: "button", title: "导出 HTML", onClick: (f) => {
            var h;
            const y = (h = f.currentTarget.closest(".qwenpaw-genui-tree")) == null ? void 0 : h.querySelector(".qwenpaw-genui-export-target");
            y && Ts(y, m.tree.root, a.current.get(m.uiId) || {}, m.uiId, m.uiId);
          } }, "HTML")
        )
      )
    )
  );
}
let lt = null;
function Os(e, t) {
  var a, l, s;
  const r = "ugsci";
  lt == null || lt();
  const n = [];
  return ce("/ugsci/genui/config", { bypassCache: !0 }).then((i) => {
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
    }, console.warn("[ugsci.genui] Failed to load runtime config; using compatibility fallback", i);
  }), (a = e.chat) != null && a.toolRender && (n.push(e.chat.toolRender(r, "emit_ui_tree", Ot)), n.push(e.chat.toolRender(r, "emit_ui_patch", Ot)), n.push(e.chat.toolRender(r, "list_ui_components", Ot)), n.push(e.chat.toolRender(r, "get_genui_guide", Ot)), console.info("[ugsci.genui] Registered 4 tool card renderers")), (s = (l = e.chat) == null ? void 0 : l.response) != null && s.append && (n.push(e.chat.response.append(
    r,
    (i) => t.createElement(es, null, t.createElement(Ps, { data: i.data })),
    { id: "ugsci.genui.response-append", order: 50 }
  )), console.info("[ugsci.genui] Registered response.append slot")), lt = () => {
    var i;
    for (const o of n.reverse()) (i = o == null ? void 0 : o.dispose) == null || i.call(o);
    ns(), ys(), lt = null;
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
function on(e) {
  const t = window.QwenPaw;
  t && (t.genui = { ...t.genui || {}, config: e });
}
function Ms() {
  const e = A().React, { Alert: t, Card: r, Space: n, Spin: a, Switch: l, Typography: s, message: i } = A().antd, { useEffect: o, useState: c } = e, [d, u] = c(null), [p, m] = c(!1);
  o(() => {
    let y = !0, h = null;
    const k = (S = !1) => {
      ce("/ugsci/genui/config").then((x) => {
        y && (u(x), on(x));
      }).catch((x) => {
        y && (u(Ir), on(Ir), S && i.error(String(x)), h = setTimeout(() => k(!1), 3e4));
      });
    };
    return k(!0), () => {
      y = !1, h && clearTimeout(h);
    };
  }, []);
  const f = async (y) => {
    m(!0);
    try {
      const h = await ce("/ugsci/genui/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: y })
      });
      u(h), on(h), i.success(h.overridden ? "设置已保存，但环境变量或插件配置正在覆盖它" : y ? "GenUI 已开启" : "GenUI 已关闭");
    } catch (h) {
      i.error(`保存 GenUI 设置失败：${String(h)}`);
    } finally {
      m(!1);
    }
  };
  return e.createElement(
    "div",
    { style: { padding: 24, maxWidth: 880 } },
    e.createElement(s.Title, { level: 2 }, "GenUI 设置"),
    e.createElement(
      s.Paragraph,
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
            e.createElement(s.Text, { strong: !0 }, "启用 GenUI"),
            e.createElement(
              s.Paragraph,
              { type: "secondary", style: { margin: "4px 0 0" } },
              "允许 Agent 生成卡片、表格、图表、表单，并在对话中交互和增量更新。"
            )
          ),
          e.createElement(l, {
            checked: d.persisted_enabled,
            loading: p,
            disabled: d.backend_unavailable,
            onChange: f
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
      const s = document.createElement("script");
      s.dataset.plugin = "ugsci", s.src = t, s.onload = () => a(), s.onerror = () => l(new Error("Viewer runtime failed to load")), document.head.appendChild(s);
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
function Ls() {
  const e = A().React, { useEffect: t, useRef: r, useState: n } = e, { Spin: a, Alert: l, Button: s, Typography: i, message: o } = A().antd, { Text: c } = i, d = r(null), u = r(null), [p, m] = n(!0), [f, y] = n(null);
  return t(() => {
    let h = !1;
    async function k() {
      if (d.current)
        try {
          m(!0), y(null);
          const S = await ca();
          if (h) return;
          const x = A(), L = {
            apiBase: x.getApiUrl("ugsci/visualization"),
            authToken: x.getApiToken() || void 0
          };
          u.current = S.mount(d.current, L), h || m(!1);
        } catch (S) {
          if (!h) {
            const x = S instanceof Error ? S.message : "Failed to load viewer";
            y(x), m(!1), o.error(`可视化引擎加载失败: ${x}`);
          }
        }
    }
    return k(), () => {
      if (h = !0, u.current) {
        try {
          u.current.dispose();
        } catch (S) {
          console.warn("[oilgas-vis] Dispose error:", S);
        }
        u.current = null;
      }
    };
  }, []), f ? e.createElement(
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
      description: f,
      showIcon: !0,
      style: { maxWidth: 600 }
    }),
    e.createElement(
      s,
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
    p && e.createElement(
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
async function ma(e, t, r) {
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
function Rs({ jobId: e, file: t }) {
  const r = A().React, { useEffect: n, useRef: a, useState: l } = r, s = A(), i = a(null), o = a(null), [c, d] = l("queued"), [u, p] = l(0), [m, f] = l(null), [y, h] = l(null);
  return n(() => {
    let k = !1;
    return (async () => {
      var v;
      const x = `/ugsci/visualization/imports/${e}`;
      for (let L = 0; L < 240 && !k; L += 1) {
        try {
          const D = await ma(s, x, {
            headers: { ...da(s, t) }
          });
          if (!D.ok) throw new Error(`状态查询失败: HTTP ${D.status}`);
          const F = await D.json();
          if (k) return;
          if (p(Number(F.progress || 0)), d(F.status), F.status === "completed") {
            if (!((v = F.result) != null && v.id)) throw new Error("导入完成但未返回数据集 ID");
            h(F.result.id);
            return;
          }
          if (F.status === "failed" || F.status === "cancelled") {
            f(F.error || zr(F.status));
            return;
          }
        } catch (D) {
          if (L >= 239 && !k) {
            d("failed"), f(D instanceof Error ? D.message : String(D));
            return;
          }
        }
        await new Promise((D) => setTimeout(D, 750));
      }
    })(), () => {
      k = !0;
    };
  }, [e, t.agentId, t.chatId, t.projectDirOverride]), n(() => {
    if (c !== "completed" || !y || !i.current) return;
    let k = !1;
    return (async () => {
      var S, x;
      try {
        const v = await ca();
        if (k || !i.current) return;
        o.current = v.mount(i.current, {
          apiBase: s.getApiUrl("ugsci/visualization"),
          authToken: s.getApiToken() || void 0
        });
        let L;
        for (let D = 0; D < 20 && !k; D += 1)
          try {
            await ((x = (S = o.current).executeCommand) == null ? void 0 : x.call(S, "open", { datasetId: y })), L = void 0;
            break;
          } catch (F) {
            L = F;
            const G = F instanceof Error ? F.message : String(F);
            if (!G.includes("数据集不存在") && !G.includes("dataset"))
              throw F;
            await new Promise((j) => setTimeout(j, 250));
          }
        if (L && !k) throw L;
      } catch (v) {
        k || (d("failed"), f(v instanceof Error ? v.message : String(v)));
      }
    })(), () => {
      var S;
      k = !0;
      try {
        (S = o.current) == null || S.dispose();
      } catch {
      }
      o.current = null;
    };
  }, [c, y]), r.createElement(
    "div",
    { style: { width: "100%", marginTop: 8 } },
    c === "completed" ? r.createElement("div", {
      ref: i,
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
      `${zr(c)}${u > 0 ? `（${Math.round(u * 100)}%）` : ""}`
    ),
    m ? r.createElement(
      "div",
      { style: { marginTop: 6, color: "#ff7875", fontSize: 12 } },
      `预览状态：${m}`
    ) : null
  );
}
function Bs(e) {
  const t = A().React, { useEffect: r, useState: n } = t, { Button: a, Spin: l, Alert: s, Typography: i } = A().antd, { Text: o } = i, c = e.artifact || e.file || {}, d = c.filename || c.title || e.filename || "unknown", u = c.workspacePath || c.path || e.workspacePath, [p, m] = n("idle"), [f, y] = n(null), [h, k] = n(null);
  return r(() => {
    if (!u) return;
    let S = !1;
    return m("submitting"), y(null), k(null), (async () => {
      try {
        const x = A(), v = await ma(x, "/ugsci/visualization/imports/workspace", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...da(x, c)
          },
          body: JSON.stringify({
            path: u,
            root: c.workspaceRoot || "project",
            name: d.replace(/\.[^.]+$/, "")
          })
        });
        if (!v.ok) throw new Error(`Import failed: HTTP ${v.status}`);
        const L = await v.json();
        S || (y(L.job_id), m("submitted"));
      } catch (x) {
        S || (k(x instanceof Error ? x.message : String(x)), m("failed"));
      }
    })(), () => {
      S = !0;
    };
  }, [u, d, c.workspaceRoot, c.agentId, c.chatId, c.projectDirOverride]), p === "submitting" ? t.createElement(
    "div",
    { style: { padding: 24, textAlign: "center" } },
    t.createElement(l, { size: "large" }),
    t.createElement(
      "div",
      { style: { marginTop: 8, color: "#8b949e" } },
      "正在提交工作区文件，浏览器不会复制大型文件..."
    )
  ) : p === "failed" ? t.createElement(
    "div",
    { style: { padding: 24 } },
    t.createElement(s, {
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
    f ? t.createElement(Rs, { jobId: f, file: c }) : t.createElement(o, { type: "secondary" }, "正在准备导入任务..."),
    t.createElement(a, {
      type: "primary",
      onClick: () => {
        window.history.pushState({}, "", "/oilgas-visualization"), window.dispatchEvent(new PopStateEvent("popstate"));
      }
    }, "打开油气可视化页面")
  );
}
function Us(e, t) {
  const r = "__ugsciVisualizationFrontendRegistered", n = window;
  if (n[r]) return;
  n[r] = !0;
  const a = A().antdIcons || {}, l = a.GlobalOutlined || a.AppstoreOutlined;
  e.route.add("ugsci", {
    id: "ugsci.visualization",
    path: "/oilgas-visualization",
    component: Ls
  }), e.menu.add("ugsci", {
    id: "ugsci.visualization",
    location: "primary.agentScoped",
    label: () => "油气可视化",
    icon: l ? t.createElement(l, { style: { fontSize: 16 } }) : void 0,
    route: "ugsci.visualization",
    order: 7,
    visible: () => !0
  });
  const s = e.workspace;
  if (s != null && s.registerRenderer)
    try {
      s.registerRenderer({
        id: "ugsci.visualization",
        name: "UGSci 油气可视化",
        component: Bs,
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
    } catch (i) {
      console.warn("[ugsci] Visualization workspace renderer registration failed:", i);
    }
}
function js() {
  var c, d, u;
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
  const n = A().antdIcons || {}, a = n.UserSwitchOutlined, l = n.ToolOutlined, s = n.ShopOutlined, i = n.AppstoreOutlined;
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
    component: Ms
  }), e.menu.add(r, {
    id: "ugsci.genui-settings",
    location: "primary.settings",
    parentId: "plugins-group",
    label: () => "GenUI 设置",
    icon: i ? t.createElement(i, { style: { fontSize: 16 } }) : void 0,
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
    icon: s ? t.createElement(s, { style: { fontSize: 16 } }) : void 0,
    route: "ugsci.market",
    order: 7,
    visible: () => ft()
  }), (u = e.sidebar) != null && u.registerSimpleModeItems ? (e.sidebar.registerSimpleModeItems([
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
  for (const p of o) {
    try {
      const f = e.menu.snapshot("primary.agentScoped").find((y) => y.id === p);
      f && e.menu.replace(r, p, {
        ...f,
        visible: () => !ft()
      });
    } catch {
    }
    try {
      const f = e.menu.snapshot("primary.settings").find((y) => y.id === p);
      f && e.menu.replace(r, p, {
        ...f,
        visible: () => !ft()
      });
    } catch {
    }
  }
  try {
    const m = e.menu.snapshot("primary.agentScoped").find((f) => f.id === "oilgas-vis.page");
    m && e.menu.replace(r, "oilgas-vis.page", {
      ...m,
      visible: () => !1
    });
  } catch {
  }
  Os(e, t), Us(e, t), console.info(
    "[ugsci] Plugin registered: unified Tools & Skills center + compatibility routes, simple-mode navigation active"
  );
}
function fn() {
  try {
    js();
  } catch (e) {
    console.error("[ugsci] Failed to build plugin:", e), setTimeout(fn, 500);
  }
}
var Ar;
if ((Ar = window.QwenPaw) != null && Ar.host)
  fn();
else {
  const e = setInterval(() => {
    var t;
    (t = window.QwenPaw) != null && t.host && (clearInterval(e), fn());
  }, 200);
  setTimeout(() => clearInterval(e), 1e4);
}
