function A() {
  var t;
  const e = (t = window.QwenPaw) == null ? void 0 : t.host;
  if (!e) throw new Error("[ugsci] QwenPaw.host not available");
  return e;
}
function Ir() {
  try {
    return A().getApiToken() || "";
  } catch {
    return "";
  }
}
function Ft(e) {
  return A().getApiUrl(e);
}
function zr(e) {
  const t = Ir();
  return {
    "Content-Type": "application/json",
    ...t ? { Authorization: `Bearer ${t}` } : {},
    ...e
  };
}
function Ar(e) {
  const t = new Headers(e), a = {};
  return t.forEach((n, r) => {
    a[r] = n;
  }), a;
}
function qe(e, t) {
  const a = A(), n = Ar(t == null ? void 0 : t.headers);
  return a.fetch ? a.fetch(e, { ...t, headers: n }) : fetch(a.getApiUrl(e), {
    ...t,
    headers: { ...zr(), ...n }
  });
}
const bt = /* @__PURE__ */ new Map(), $r = 15e3;
function Pr(e) {
  return e ? e instanceof Headers ? e.get("X-Agent-Id") || e.get("x-agent-id") || "" : e["X-Agent-Id"] || e["x-agent-id"] || "" : "";
}
function Or(e, t, a) {
  return `${e}:${t}:${a}`;
}
function St() {
  bt.clear();
}
function fn(e) {
  for (const [t, a] of bt)
    (e ? a.agentId === e : a.agentId) && bt.delete(t);
}
async function ce(e, t) {
  const a = ((t == null ? void 0 : t.method) || "GET").toUpperCase(), { bypassCache: n, ...r } = t || {}, l = Pr(
    r.headers
  ), s = Or(a, e, l);
  if (a !== "GET" && (l ? fn(l) : St()), a === "GET" && !n) {
    const c = bt.get(s);
    if (c && Date.now() - c.ts < $r)
      return c.data;
  }
  const i = await qe(e, r);
  if (!i.ok) {
    const c = await i.text().catch(() => "");
    throw new Error(c || `HTTP ${i.status}`);
  }
  if (i.status === 204) return null;
  const o = await i.json();
  return a === "GET" && bt.set(s, {
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
function gt() {
  try {
    return localStorage.getItem("qwenpaw_sidebar_mode") === "simple";
  } catch {
    return !1;
  }
}
function Wt(e, t) {
  const a = A();
  return a.ReactMarkdown && a.remarkGfm ? t.createElement(
    a.ReactMarkdown,
    { remarkPlugins: [a.remarkGfm] },
    e
  ) : e.replace(/\*\*(.+?)\*\*/g, "$1").replace(/\*(.+?)\*/g, "$1").replace(/`(.+?)`/g, "$1").replace(/^#+\s*/gm, "").replace(/^[-*]\s+/gm, "• ");
}
function Ht({
  title: e,
  subtitle: t,
  extra: a
}) {
  const n = A().React, { Space: r } = A().antd;
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
    a ? n.createElement(r, null, a) : null
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
async function Vt(e) {
  return await ce(
    `/agents/${encodeURIComponent(e)}/skills`
  ) || [];
}
async function qt(e = !1) {
  return await ce(`/skills/pool${e ? "?summary=true" : ""}`) || [];
}
async function Mr(e) {
  const t = await ce(
    `/skills/pool/${encodeURIComponent(e)}/content`
  );
  return (t == null ? void 0 : t.content) || "";
}
async function Rr() {
  return (await ce(
    "/skills/workspaces"
  ) || []).map((t) => ({
    agent_id: t.agent_id,
    agent_name: t.agent_name || "",
    // Current hosts return skill_names. Keep the legacy fallback so the
    // plugin remains compatible with older QwenPaw releases.
    skill_names: Array.isArray(t.skill_names) ? t.skill_names : Array.isArray(t.skills) ? t.skills.map((a) => a.name) : []
  }));
}
function dt(e, t = "") {
  return `/agents/${encodeURIComponent(e)}/skills${t}`;
}
function Aa(e) {
  var a;
  const t = [];
  for (const n of e) {
    if (n.enabled === !1) continue;
    const r = (a = n.description) == null ? void 0 : a.trim();
    if (!r) continue;
    const l = (n.name || r).length > 20 ? (n.name || r).substring(0, 18) + "…" : n.name || r;
    let s = r;
    if (s = s.replace(/\*\*(.+?)\*\*/g, "$1").replace(/\*(.+?)\*/g, "$1").replace(/`(.+?)`/g, "$1").replace(/^#+\s*/gm, "").trim(), /^(用于|帮助|提供|支持|实现|完成|分析|计算|生成|创建|检查)/.test(s) ? s = `请${s}` : /^(a |an |the )/i.test(s) ? s = `Help me with ${s}` : /[。？！.?!]$/.test(s) || (s = `帮我${s}`), s.length > 80 && (s = s.substring(0, 77) + "..."), t.push({ label: l, value: s }), t.length >= 4) break;
  }
  return t;
}
async function Lr(e) {
  return await ce("/workspace/files", {
    headers: { "X-Agent-Id": e }
  }) || [];
}
async function Bt(e, t, a) {
  return ce(`/workspace/files/${encodeURIComponent(t)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify({ content: a })
  });
}
async function Br(e, t, a, n) {
  return ce("/workspace/prompt-files", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify({ filename: t, content: a, enable: n })
  });
}
const Ur = /* @__PURE__ */ new Set([
  "CON",
  "PRN",
  "AUX",
  "NUL",
  ...Array.from({ length: 9 }, (e, t) => `COM${t + 1}`),
  ...Array.from({ length: 9 }, (e, t) => `LPT${t + 1}`)
]);
function jr(e) {
  let t = e.trim();
  if (!t) throw new Error("请输入文件名");
  if (/[\\/]/.test(t)) throw new Error("文件名不能包含路径分隔符");
  if (/[<>:\"|?*\u0000-\u001f]/.test(t))
    throw new Error("文件名包含系统不支持的字符");
  if (/[ .]$/.test(t)) throw new Error("文件名不能以空格或句点结尾");
  t.toLowerCase().endsWith(".md") ? t = `${t.slice(0, -3)}.md` : t += ".md";
  const a = t.split(".", 1)[0].toUpperCase();
  if (!t.slice(0, -3)) throw new Error("文件名不能为空");
  if (Ur.has(a))
    throw new Error("该文件名是系统保留名称，请更换");
  if (new TextEncoder().encode(t).length > 255)
    throw new Error("文件名过长");
  return t;
}
async function Nr(e, t) {
  const a = await yn(e);
  a.system_prompt_files = t, await ce(`/agents/${encodeURIComponent(e)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(a)
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
async function $a(e, t) {
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
async function Dr(e, t) {
  return ce(dt(e, "/batch-enable"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(t)
  });
}
async function Gr(e, t) {
  return ce(dt(e, "/batch-disable"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(t)
  });
}
async function Fr(e, t) {
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
async function Pa(e, t) {
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
async function Wr(e, t) {
  return ce(
    `/mcp/toggle/${encodeURIComponent(t)}`,
    {
      method: "PATCH",
      headers: { "X-Agent-Id": e }
    }
  );
}
async function Oa(e, t) {
  await ce(
    dt(e, `/${encodeURIComponent(t)}/disable`),
    {
      method: "POST"
    }
  );
}
async function Hr(e) {
  await ce(`/skills/pool/${encodeURIComponent(e)}`, {
    method: "DELETE"
  });
}
function Jr(e) {
  const t = (e || "").trim();
  if (!t) return { number: 6, unit: "h" };
  const a = t.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/i);
  if (!a) return { number: 6, unit: "h" };
  const n = parseInt(a[1] || "0", 10), r = parseInt(a[2] || "0", 10), l = parseInt(a[3] || "0", 10), s = n * 60 + r + Math.round(l / 60);
  return s <= 0 ? { number: 6, unit: "h" } : s >= 60 && s % 60 === 0 ? { number: s / 60, unit: "h" } : { number: s, unit: "m" };
}
function Vr(e) {
  return e.unit === "h" ? `${e.number}h` : `${e.number}m`;
}
async function qr(e) {
  return ce("/config/heartbeat", {
    headers: { "X-Agent-Id": e }
  });
}
async function Kr(e, t) {
  return ce("/config/heartbeat", {
    method: "PUT",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify(t)
  });
}
async function Xr(e) {
  await ce("/config/heartbeat/run", {
    method: "POST",
    headers: { "X-Agent-Id": e }
  });
}
async function Yr(e) {
  return ce("/workspace/running-config", {
    headers: { "X-Agent-Id": e }
  });
}
async function Qr(e, t) {
  return ce("/workspace/running-config", {
    method: "PUT",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify(t)
  });
}
async function Zr(e) {
  return (await ce("/workspace/language", {
    headers: { "X-Agent-Id": e }
  })).language || "zh";
}
async function el(e, t) {
  await ce("/workspace/language", {
    method: "PUT",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify({ language: t })
  });
}
async function tl() {
  return (await ce("/config/user-timezone")).timezone || "UTC";
}
async function nl(e) {
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
  color: a = "blue",
  emptyText: n = "无"
}) {
  const r = A().React, { Tag: l } = A().antd;
  return !e || e.length === 0 ? r.createElement(
    "span",
    { style: { fontSize: 12, color: "var(--ant-color-text-quaternary, #bfbfbf)" } },
    n
  ) : r.createElement(
    "div",
    { style: { display: "flex", flexWrap: "wrap", gap: 4 } },
    ...e.slice(0, t).map(
      (s, i) => r.createElement(
        l,
        { key: i, color: a, style: { fontSize: 11, marginRight: 0 } },
        s
      )
    ),
    e.length > t ? r.createElement(
      l,
      { style: { fontSize: 11, marginRight: 0 } },
      `+${e.length - t}`
    ) : null
  );
}
function Ma({
  open: e,
  onClose: t,
  poolSkills: a,
  installedSkillNames: n,
  loading: r,
  onInstall: l
}) {
  const s = A().React, { useState: i, useEffect: o, useMemo: c } = s, { Modal: d, Button: u, Empty: m, Spin: p, Input: f, Tag: y, Tooltip: h, Typography: _ } = A().antd, { CheckOutlined: x, SearchOutlined: S } = A().antdIcons || {}, { Text: v } = _, [R, D] = i([]), [F, G] = i("");
  o(() => {
    e && (D([]), G(""));
  }, [e]);
  const j = c(() => {
    if (!F.trim()) return a;
    const b = F.toLowerCase();
    return a.filter(
      (E) => {
        var T, I;
        return E.name.toLowerCase().includes(b) || ((T = E.description) == null ? void 0 : T.toLowerCase().includes(b)) || ((I = E.tags) == null ? void 0 : I.some((U) => U.toLowerCase().includes(b)));
      }
    );
  }, [a, F]), K = j.filter(
    (b) => !n.includes(b.name)
  ), X = (b) => {
    D(
      (E) => E.includes(b) ? E.filter((T) => T !== b) : [...E, b]
    );
  }, W = async () => {
    R.length !== 0 && (await l(R), D([]));
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
          `已选择 ${R.length} 个技能`
        ),
        s.createElement(
          "div",
          { style: { display: "flex", gap: 8 } },
          s.createElement(u, { onClick: t }, "取消"),
          s.createElement(
            u,
            {
              type: "primary",
              onClick: W,
              disabled: R.length === 0
            },
            R.length > 0 ? `添加 (${R.length})` : "添加"
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
        prefix: S ? s.createElement(S) : void 0,
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
    r ? s.createElement(
      "div",
      { style: { textAlign: "center", padding: 40 } },
      s.createElement(p, { size: "large" })
    ) : j.length === 0 ? s.createElement(m, {
      description: F ? "未找到匹配的技能" : "技能池暂无可用技能",
      image: m.PRESENTED_IMAGE_SIMPLE
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
        const E = R.includes(b.name), T = n.includes(b.name);
        return s.createElement(
          "div",
          {
            key: b.name,
            onClick: () => !T && X(b.name),
            style: {
              position: "relative",
              padding: "10px 12px",
              border: `1px solid ${E ? "#0072f5" : "var(--ant-color-border-secondary, #e8e8e8)"}`,
              borderRadius: 6,
              cursor: T ? "not-allowed" : "pointer",
              transition: "all 0.15s ease",
              background: E ? "rgba(0, 114, 245, 0.06)" : T ? "var(--ant-color-fill-quaternary, #fafafa)" : "var(--ant-color-bg-container, #fff)",
              opacity: T ? 0.5 : 1,
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
            x ? s.createElement(x) : "✓"
          ) : null,
          T ? s.createElement(
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
                paddingRight: T || E ? 24 : 0
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
function Ra({
  agentId: e,
  systemPromptFiles: t,
  onRefresh: a
}) {
  const n = A().React, { useState: r, useEffect: l, useCallback: s, useRef: i } = n, {
    List: o,
    Tag: c,
    Switch: d,
    Button: u,
    Modal: m,
    Input: p,
    Spin: f,
    Empty: y,
    message: h,
    Typography: _,
    Segmented: x,
    Alert: S
  } = A().antd, { FileTextOutlined: v, PlusOutlined: R, EditOutlined: D, ReloadOutlined: F } = A().antdIcons || {}, { Text: G } = _, [j, K] = r([]), [X, W] = r(!0), [b, E] = r(
    t || []
  ), [T, I] = r(!1), [U, $] = r(null), [O, z] = r(""), [w, le] = r(""), [oe, B] = r(!1), [L, ne] = r("source"), Z = i(0), H = s(async () => {
    const Y = ++Z.current;
    W(!0);
    try {
      const Q = await Lr(e);
      Y === Z.current && K(Q);
    } catch (Q) {
      Y === Z.current && (h.error(Q.message || "加载工作区文档失败"), K([]));
    } finally {
      Y === Z.current && W(!1);
    }
  }, [e]);
  l(() => {
    H();
  }, [H]), l(() => {
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
      await Nr(e, he), h.success(Q ? "已启用记忆文件" : "已停用记忆文件"), a();
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
      Y = jr(U || w);
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
        const Q = await Br(
          e,
          Y,
          O,
          !0
        );
        E(Q.system_prompt_files);
      }
      h.success("保存成功"), I(!1), H(), a();
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
            onClick: H
          },
          "刷新"
        ),
        n.createElement(
          u,
          {
            type: "primary",
            size: "small",
            icon: R ? n.createElement(R) : void 0,
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
      m,
      {
        open: T,
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
        n.createElement(p, {
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
        n.createElement(x, {
          size: "small",
          value: L,
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
      O.trim() ? null : n.createElement(S, {
        type: "warning",
        showIcon: !0,
        message: "文档内容为空，保存前需要填写 Markdown 内容",
        style: { marginBottom: 10 }
      }),
      L === "source" ? n.createElement(p.TextArea, {
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
        Wt(O, n)
      )
    )
  );
}
function rl({
  skills: e,
  agentId: t
}) {
  const a = A().React, { useMemo: n } = a, {
    List: r,
    Tag: l,
    Typography: s,
    Empty: i,
    Button: o,
    message: c
  } = A().antd, { ThunderboltOutlined: d, CopyOutlined: u } = A().antdIcons || {}, { Text: m } = s, p = n(() => Aa(e), [e]), f = (h) => {
    try {
      const _ = A();
      _.setSelectedAgent && _.setSelectedAgent(t);
    } catch {
    }
    try {
      sessionStorage.setItem("ugsci_pending_prompt", h.value);
    } catch {
    }
    window.history.pushState({}, "", "/chat"), window.dispatchEvent(new PopStateEvent("popstate"));
  }, y = (h) => {
    var _;
    (_ = navigator.clipboard) == null || _.writeText(h.value).then(() => {
      c.success("已复制到剪贴板");
    });
  };
  return p.length === 0 ? a.createElement(i, {
    description: "暂无推荐提问，请先为专家添加技能",
    image: i.PRESENTED_IMAGE_SIMPLE
  }) : a.createElement(
    "div",
    null,
    a.createElement(
      "div",
      {
        style: {
          display: "flex",
          alignItems: "center",
          gap: 6,
          marginBottom: 12
        }
      },
      d ? a.createElement(d, {
        style: { fontSize: 14, color: "#1677ff" }
      }) : null,
      a.createElement(
        m,
        { strong: !0 },
        `推荐提问 (${p.length})`
      ),
      a.createElement(
        m,
        { type: "secondary", style: { fontSize: 12 } },
        "· 从技能描述中自动提取"
      )
    ),
    a.createElement(r, {
      dataSource: p,
      renderItem: (h, _) => a.createElement(
        r.Item,
        {
          actions: [
            a.createElement(
              o,
              {
                type: "link",
                size: "small",
                icon: u ? a.createElement(u) : void 0,
                onClick: () => y(h)
              },
              "复制"
            )
          ]
        },
        a.createElement(r.Item.Meta, {
          avatar: a.createElement(
            l,
            { color: "blue", style: { borderRadius: "50%" } },
            `${_ + 1}`
          ),
          title: a.createElement(
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
          description: a.createElement(
            m,
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
}, La = { marginBottom: 16 }, Ba = {
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
}, Ua = {
  fontSize: 12,
  color: "rgba(0,0,0,0.45)",
  marginLeft: 8
};
function ll({ agentId: e }) {
  const t = A().React, { useState: a, useEffect: n, useCallback: r } = t, {
    Switch: l,
    InputNumber: s,
    Select: i,
    Button: o,
    Spin: c,
    Space: d,
    Typography: u,
    message: m
  } = A().antd, { PlayCircleOutlined: p, SaveOutlined: f } = A().antdIcons || {}, { Text: y } = u, [h, _] = a(!0), [x, S] = a(!1), [v, R] = a(!1), [D, F] = a(!1), [G, j] = a(6), [K, X] = a("h"), [W, b] = a("main"), [E, T] = a(300), [I, U] = a(!1), [$, O] = a("08:00"), [z, w] = a("22:00"), le = r(async () => {
    var H, ue;
    _(!0);
    try {
      const M = await qr(e), se = Jr(M.every ?? "6h");
      F(M.enabled ?? !1), j(se.number), X(se.unit), b(M.target ?? "main"), T(M.timeoutSeconds ?? 300), U(!!M.activeHours), O(((H = M.activeHours) == null ? void 0 : H.start) ?? "08:00"), w(((ue = M.activeHours) == null ? void 0 : ue.end) ?? "22:00");
    } catch (M) {
      m.error(M.message || "加载心跳配置失败");
    } finally {
      _(!1);
    }
  }, [e]);
  n(() => {
    le();
  }, [le]);
  const oe = async () => {
    S(!0);
    try {
      await Kr(e, {
        enabled: D,
        every: Vr({ number: G, unit: K }),
        target: W,
        timeoutSeconds: E,
        activeHours: I && $ && z ? { start: $, end: z } : void 0
      }), m.success("心跳配置已保存");
    } catch (H) {
      m.error(H.message || "保存心跳配置失败");
    } finally {
      S(!1);
    }
  }, B = async () => {
    R(!0);
    try {
      await Xr(e), m.success("已触发心跳检查");
    } catch (H) {
      m.error(H.message || "触发心跳失败");
    } finally {
      R(!1);
    }
  };
  if (h)
    return t.createElement(
      "div",
      { style: { textAlign: "center", padding: 40 } },
      t.createElement(c, { size: "large" })
    );
  const L = (H, ue, M) => t.createElement(
    "div",
    { style: La },
    t.createElement("div", { style: ot }, H),
    ue,
    M ? t.createElement(
      y,
      { type: "secondary", style: Ua },
      M
    ) : null
  ), ne = (H, ue, M, se) => t.createElement(
    "div",
    { style: Ba },
    t.createElement(
      "div",
      null,
      t.createElement("div", { style: ot }, H),
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
    L(
      "启用心跳",
      t.createElement(l, {
        checked: D,
        onChange: (H) => F(H)
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
          onChange: (H) => j(H ?? 1),
          style: { width: "100%" }
        }),
        t.createElement(i, {
          value: K,
          onChange: (H) => X(H),
          style: { width: 90 },
          options: [
            { value: "m", label: "分钟" },
            { value: "h", label: "小时" }
          ]
        })
      ),
      "心跳目标",
      t.createElement(i, {
        value: W,
        onChange: (H) => b(H),
        style: { width: "100%" },
        options: [
          { value: "main", label: "主会话 (main)" },
          { value: "last", label: "最近会话 (last)" },
          { value: "inbox", label: "收件箱 (inbox)" }
        ]
      })
    ),
    L(
      "超时时间 (秒)",
      t.createElement(s, {
        min: 1,
        max: 3600,
        value: E,
        onChange: (H) => T(H ?? 300),
        style: { width: 200 }
      })
    ),
    // ── Section: 活跃时段 ──
    t.createElement(Z, { style: { margin: "8px 0 16px" } }),
    t.createElement("div", { style: Ye }, "活跃时段"),
    L(
      "启用活跃时段限制",
      t.createElement(l, {
        checked: I,
        onChange: (H) => U(H)
      }),
      "仅在指定时段内触发心跳"
    ),
    I ? ne(
      "开始时间",
      t.createElement("input", {
        type: "time",
        value: $,
        onChange: (H) => O(H.target.value),
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
        onChange: (H) => w(H.target.value),
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
          loading: x,
          onClick: oe,
          style: Be
        },
        "保存配置"
      ),
      t.createElement(
        o,
        {
          icon: p ? t.createElement(p) : void 0,
          loading: v,
          onClick: B
        },
        "立即执行"
      )
    )
  );
}
function ol({
  agentId: e,
  onRefresh: t
}) {
  const a = A().React, { useState: n, useEffect: r, useCallback: l } = a, {
    List: s,
    Tag: i,
    Switch: o,
    Button: c,
    Empty: d,
    Spin: u,
    Typography: m,
    message: p
  } = A().antd, { PlusOutlined: f, ReloadOutlined: y, DeleteOutlined: h } = A().antdIcons || {}, { Text: _, Paragraph: x } = m, [S, v] = n([]), [R, D] = n(!0), [F, G] = n(!1), [j, K] = n([]), [X, W] = n(!1), b = l(async () => {
    D(!0);
    try {
      const O = await Vt(e);
      v(O);
    } catch (O) {
      p.error(O.message || "加载技能失败"), v([]);
    } finally {
      D(!1);
    }
  }, [e]);
  r(() => {
    b();
  }, [b]);
  const E = async () => {
    G(!0), W(!0);
    try {
      const O = await qt(!0);
      K(O);
    } catch (O) {
      p.error(O.message || "加载技能池失败");
    } finally {
      W(!1);
    }
  }, T = async (O) => {
    let z = 0, w = 0;
    for (const le of O)
      try {
        await hn(e, le), z++;
      } catch {
        w++;
      }
    z > 0 ? (p.success(
      `成功添加 ${z} 个技能${w > 0 ? `，${w} 个失败` : ""}`
    ), b(), t()) : w > 0 && p.error("添加技能失败"), G(!1);
  }, I = async (O, z) => {
    try {
      z ? await $a(e, O.name) : await Oa(e, O.name), p.success(z ? "已启用" : "已停用"), b(), t();
    } catch (w) {
      p.error(w.message || "操作失败");
    }
  }, U = async (O) => {
    try {
      await En(e, O), p.success(`技能「${O}」已移除`), b(), t();
    } catch (z) {
      p.error(z.message || "移除技能失败");
    }
  };
  if (R)
    return a.createElement(
      "div",
      { style: { textAlign: "center", padding: 40 } },
      a.createElement(u, { size: "large" })
    );
  const $ = S.filter((O) => O.enabled !== !1);
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
          marginBottom: 12
        }
      },
      a.createElement(
        _,
        { strong: !0 },
        `技能列表 (${S.length}，已启用 ${$.length})`
      ),
      a.createElement(
        "div",
        { style: { display: "flex", gap: 8 } },
        a.createElement(
          c,
          {
            size: "small",
            icon: y ? a.createElement(y) : void 0,
            onClick: () => {
              St(), b();
            }
          },
          "刷新"
        ),
        a.createElement(
          c,
          {
            type: "primary",
            size: "small",
            icon: f ? a.createElement(f) : void 0,
            onClick: E,
            style: Be
          },
          "从技能池添加"
        )
      )
    ),
    S.length === 0 ? a.createElement(d, {
      description: "该专家暂无技能",
      image: d.PRESENTED_IMAGE_SIMPLE
    }) : a.createElement(s, {
      dataSource: S,
      renderItem: (O) => a.createElement(
        s.Item,
        {
          actions: [
            a.createElement(o, {
              key: "toggle",
              size: "small",
              checked: O.enabled !== !1,
              onChange: (z) => I(O, z)
            }),
            a.createElement(
              c,
              {
                key: "del",
                type: "link",
                size: "small",
                danger: !0,
                icon: h ? a.createElement(h) : void 0,
                onClick: () => U(O.name)
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
            O.emoji ? a.createElement(
              "span",
              { style: { fontSize: 16 } },
              O.emoji
            ) : null,
            a.createElement(_, { strong: !0 }, O.name),
            O.version_text ? a.createElement(
              i,
              { style: { fontSize: 10 } },
              `v${O.version_text}`
            ) : null
          ),
          O.description ? a.createElement(
            x,
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
    a.createElement(Ma, {
      open: F,
      onClose: () => G(!1),
      poolSkills: j,
      installedSkillNames: S.map((O) => O.name),
      loading: X,
      onInstall: T
    })
  );
}
function sl({
  agentId: e,
  onRefresh: t,
  isActive: a
}) {
  const n = A().React, { useState: r, useEffect: l, useCallback: s } = n, {
    List: i,
    Tag: o,
    Button: c,
    Empty: d,
    Spin: u,
    Modal: m,
    Input: p,
    Typography: f,
    message: y
  } = A().antd, { PlusOutlined: h, ReloadOutlined: _, DeleteOutlined: x } = A().antdIcons || {}, { Text: S, Paragraph: v } = f, { TextArea: R } = p, [D, F] = r([]), [G, j] = r(!0), [K, X] = r(!1), [W, b] = r(`{
  "mcpServers": {
    "example-client": {
      "command": "npx",
      "args": ["-y", "@example/mcp-server"],
      "env": {}
    }
  }
}`), [E, T] = r(!1), I = s(async () => {
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
    a && I();
  }, [a, I]);
  const U = async (z) => {
    try {
      await Wr(e, z), y.success("已切换 MCP 状态"), I(), t();
    } catch (w) {
      y.error(w.message || "切换失败");
    }
  }, $ = async (z) => {
    try {
      await Pa(e, z), y.success(`MCP「${z}」已移除`), I(), t();
    } catch (w) {
      y.error(w.message || "移除 MCP 失败");
    }
  }, O = async () => {
    T(!0);
    try {
      const z = JSON.parse(W), w = z.mcpServers || z, le = Object.entries(w);
      if (le.length === 0) {
        y.warning("未找到 MCP 客户端配置");
        return;
      }
      for (const [oe, B] of le) {
        const L = B, ne = L.url ? "streamable_http" : "stdio";
        await bn(e, {
          client_key: oe,
          client: {
            name: L.name || oe,
            description: L.description || "",
            enabled: !0,
            transport: ne,
            url: L.url || "",
            command: L.command || "",
            args: L.args || [],
            env: L.env || {},
            cwd: L.cwd || "",
            headers: L.headers || {}
          }
        });
      }
      y.success("MCP 客户端已创建"), X(!1), I(), t();
    } catch (z) {
      z instanceof SyntaxError ? y.error("JSON 格式错误：" + z.message) : y.error(z.message || "创建 MCP 失败");
    } finally {
      T(!1);
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
      n.createElement(S, { strong: !0 }, `MCP 客户端 (${D.length})`),
      n.createElement(
        "div",
        { style: { display: "flex", gap: 8 } },
        n.createElement(
          c,
          {
            size: "small",
            icon: _ ? n.createElement(_) : void 0,
            onClick: () => {
              St(), I();
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
                icon: x ? n.createElement(x) : void 0,
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
            n.createElement(S, { strong: !0 }, z.name || z.key),
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
      m,
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
      n.createElement(R, {
        value: W,
        onChange: (z) => b(z.target.value),
        rows: 12,
        style: { fontFamily: "monospace", fontSize: 12 }
      })
    )
  );
}
function il({ agentId: e }) {
  const t = A().React, { useState: a, useEffect: n, useCallback: r, useRef: l } = t, {
    Card: s,
    InputNumber: i,
    Input: o,
    Select: c,
    Switch: d,
    Button: u,
    Spin: m,
    Space: p,
    Typography: f,
    Divider: y,
    message: h
  } = A().antd, { SaveOutlined: _ } = A().antdIcons || {}, { Text: x } = f, [S, v] = a(!0), [R, D] = a(!1), F = l(null), [G, j] = a(60), [K, X] = a(""), [W, b] = a(!0), [E, T] = a(30), [I, U] = a("zh"), [$, O] = a("UTC"), [z, w] = a(!0), [le, oe] = a(100), [B, L] = a(!0), [ne, Z] = a(3), [H, ue] = a(1), [M, se] = a(!0), [me, Y] = a(3), [Q, ie] = a(2), [he, we] = a(60), [Ae, Se] = a(1), [ee, be] = a(0), [Ee, te] = a(1), [de, ge] = a(0), [q, k] = a(30), [fe, V] = a(50), [C, ae] = a("light"), [pe, Ie] = a("scroll"), [Re, Ne] = a("remelight"), [Le, Ge] = a("AUTO"), et = r(async () => {
    var re, ze, $e, Oe, He, Je;
    v(!0);
    try {
      const [_e, xt, Kt] = await Promise.all([
        Yr(e),
        Zr(e).catch(() => "zh"),
        tl().catch(() => "UTC")
      ]);
      F.current = _e, j(_e.shell_command_timeout ?? 60), X(_e.shell_command_executable ?? "");
      const mt = _e.auto_title_config ?? { enabled: !0, timeout_seconds: 30 };
      b(mt.enabled ?? !0), T(mt.timeout_seconds ?? 30), U(xt), O(Kt);
      const Ke = _e.loop ?? {};
      w(((re = Ke.iteration) == null ? void 0 : re.enabled) ?? !0), oe(((ze = Ke.iteration) == null ? void 0 : ze.max_iterations) ?? _e.max_iters ?? 100), L((($e = Ke.doom_loop) == null ? void 0 : $e.enabled) ?? !0), Z(((Oe = Ke.doom_loop) == null ? void 0 : Oe.window_size) ?? 3), ue(((He = Ke.doom_loop) == null ? void 0 : He.similarity_threshold) ?? 1), se(_e.llm_retry_enabled ?? !0), Y(_e.llm_max_retries ?? 3), ie(_e.llm_backoff_base ?? 2), we(_e.llm_backoff_cap ?? 60), Se(_e.llm_max_concurrent ?? 1), be(_e.llm_max_qpm ?? 0), te(_e.llm_rate_limit_pause ?? 1), ge(_e.llm_rate_limit_jitter ?? 0), k(_e.llm_acquire_timeout ?? 30), V(_e.history_max_length ?? 50), ae(_e.context_manager_backend ?? "light"), Ie(((Je = _e.light_context_config) == null ? void 0 : Je.strategy) ?? "scroll"), Ne(_e.memory_manager_backend ?? "remelight"), Ge(_e.approval_level ?? "AUTO");
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
    const re = F.current;
    if (re) {
      D(!0);
      try {
        const Oe = {
          ...re,
          max_iters: le,
          loop: {
            ...re.loop ?? {},
            iteration: { enabled: z, max_iterations: le },
            doom_loop: {
              enabled: B,
              window_size: ne,
              similarity_threshold: H,
              stages: (($e = (ze = re.loop) == null ? void 0 : ze.doom_loop) == null ? void 0 : $e.stages) ?? []
            }
          },
          shell_command_timeout: G,
          shell_command_executable: K,
          auto_title_config: {
            enabled: W,
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
          llm_acquire_timeout: q,
          history_max_length: fe,
          context_manager_backend: C,
          light_context_config: {
            ...re.light_context_config ?? {},
            strategy: pe
          },
          memory_manager_backend: Re,
          approval_level: Le
        };
        await Qr(e, Oe), F.current = Oe, I && await el(e, I).catch(() => {
        }), $ && await nl($).catch(() => {
        }), h.success("运行配置已保存");
      } catch (Oe) {
        h.error(Oe.message || "保存运行配置失败");
      } finally {
        D(!1);
      }
    }
  };
  if (S)
    return t.createElement(
      "div",
      { style: { textAlign: "center", padding: 40 } },
      t.createElement(m, { size: "large" })
    );
  const Te = (re, ze, $e) => t.createElement(
    "div",
    { style: La },
    t.createElement("div", { style: ot }, re),
    ze,
    $e ? t.createElement(
      x,
      { type: "secondary", style: Ua },
      $e
    ) : null
  ), Me = (re, ze, $e, Oe) => t.createElement(
    "div",
    { style: Ba },
    t.createElement(
      "div",
      null,
      t.createElement("div", { style: ot }, re),
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
        onChange: (re) => j(re ?? 60),
        style: { width: "100%" }
      }),
      "Shell 可执行文件",
      t.createElement(o, {
        value: K,
        onChange: (re) => X(re.target.value),
        placeholder: "留空使用系统默认",
        style: { width: "100%" }
      })
    ),
    Me(
      "语言",
      t.createElement(c, {
        value: I,
        onChange: (re) => U(re),
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
        onChange: (re) => O(re),
        style: { width: "100%" },
        showSearch: !0,
        filterOption: (re, ze) => {
          var $e;
          return ((($e = ze == null ? void 0 : ze.label) == null ? void 0 : $e.toString()) || "").toLowerCase().includes(re.toLowerCase());
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
    Me(
      "自动生成会话标题",
      t.createElement(p, null, t.createElement(d, {
        checked: W,
        onChange: (re) => b(re)
      })),
      "标题生成超时 (秒)",
      t.createElement(i, {
        min: 5,
        value: E,
        onChange: (re) => T(re ?? 30),
        style: { width: "100%" },
        disabled: !W
      })
    ),
    // ── Section: 审批级别 ──
    t.createElement(y, { style: { margin: "8px 0 16px" } }),
    t.createElement("div", { style: Ye }, "审批级别"),
    Te(
      "工具执行审批",
      t.createElement(c, {
        value: Le,
        onChange: (re) => Ge(re),
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
        onChange: (re) => w(re)
      }),
      "停止 Agent 前的最大循环轮次"
    ),
    z ? Te(
      "最大迭代次数",
      t.createElement(i, {
        min: 1,
        max: 500,
        value: le,
        onChange: (re) => oe(re ?? 100),
        style: { width: "100%" }
      })
    ) : null,
    Te(
      "启用重复循环保护",
      t.createElement(d, {
        checked: B,
        onChange: (re) => L(re)
      }),
      "检测并阻止重复操作循环"
    ),
    B ? Me(
      "检测窗口大小",
      t.createElement(i, {
        min: 2,
        max: 20,
        value: ne,
        onChange: (re) => Z(re ?? 3),
        style: { width: "100%" }
      }),
      "相似度阈值",
      t.createElement(i, {
        min: 0,
        max: 1,
        step: 0.05,
        value: H,
        onChange: (re) => ue(re ?? 1),
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
        onChange: (re) => se(re)
      })
    ),
    Me(
      "最大重试次数",
      t.createElement(i, {
        min: 1,
        value: me,
        onChange: (re) => Y(re ?? 3),
        style: { width: "100%" },
        disabled: !M
      }),
      "退避基数 (秒)",
      t.createElement(i, {
        min: 0.1,
        step: 0.1,
        value: Q,
        onChange: (re) => ie(re ?? 2),
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
        onChange: (re) => we(re ?? 60),
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
        onChange: (re) => Se(re ?? 1),
        style: { width: "100%" }
      }),
      "最大 QPM (0=不限)",
      t.createElement(i, {
        min: 0,
        step: 10,
        value: ee,
        onChange: (re) => be(re ?? 0),
        style: { width: "100%" }
      })
    ),
    Me(
      "限流暂停时间 (秒)",
      t.createElement(i, {
        min: 1,
        step: 0.5,
        value: Ee,
        onChange: (re) => te(re ?? 1),
        style: { width: "100%" }
      }),
      "限流抖动 (秒)",
      t.createElement(i, {
        min: 0,
        step: 0.5,
        value: de,
        onChange: (re) => ge(re ?? 0),
        style: { width: "100%" }
      })
    ),
    Te(
      "获取超时 (秒)",
      t.createElement(i, {
        min: 10,
        step: 10,
        value: q,
        onChange: (re) => k(re ?? 30),
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
        value: C,
        onChange: (re) => ae(re),
        style: { width: "100%" },
        options: [{ value: "light", label: "light" }]
      }),
      "上下文策略",
      t.createElement(c, {
        value: pe,
        onChange: (re) => Ie(re),
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
        value: Re,
        onChange: (re) => Ne(re),
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
        value: fe,
        onChange: (re) => V(re ?? 50),
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
          icon: _ ? t.createElement(_) : void 0,
          loading: R,
          onClick: De,
          style: Be
        },
        "保存运行配置"
      )
    )
  );
}
function cl({
  expert: e,
  open: t,
  onClose: a,
  onRefresh: n
}) {
  const r = A().React, { useState: l, useEffect: s, useCallback: i } = r, { Modal: o, Tabs: c, Spin: d, Typography: u } = A().antd, { SettingOutlined: m } = A().antdIcons || {}, { Text: p } = u, [f, y] = l([]), [h, _] = l(!1), [x, S] = l("heartbeat"), v = i(async () => {
    if (e) {
      _(!0);
      try {
        const G = await al(e.agent.id);
        y(G);
      } catch {
        y([]);
      } finally {
        _(!1);
      }
    }
  }, [e]);
  if (s(() => {
    t && e && v();
  }, [t, e, v]), !e) return null;
  const { agent: R } = e, D = () => {
    v(), n();
  }, F = [
    {
      key: "heartbeat",
      label: "心跳",
      children: r.createElement(ll, {
        agentId: R.id
      })
    },
    {
      key: "files",
      label: "文件",
      children: h ? r.createElement(
        "div",
        { style: { textAlign: "center", padding: 40 } },
        r.createElement(d, { size: "large" })
      ) : r.createElement(Ra, {
        agentId: R.id,
        systemPromptFiles: f,
        onRefresh: D
      })
    },
    {
      key: "skills",
      label: `技能 (${e.skills.filter((G) => G.enabled !== !1).length})`,
      children: r.createElement(ol, {
        agentId: R.id,
        onRefresh: n
      })
    },
    {
      key: "mcp",
      label: `MCP (${e.mcps.length})`,
      children: r.createElement(sl, {
        agentId: R.id,
        onRefresh: n,
        isActive: x === "mcp"
      })
    },
    {
      key: "running",
      label: "运行配置",
      children: r.createElement(il, {
        agentId: R.id
      })
    }
  ];
  return r.createElement(
    o,
    {
      open: t,
      title: r.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 8 } },
        m ? r.createElement(m, { style: { fontSize: 18 } }) : null,
        r.createElement("span", null, `配置 - ${R.name}`),
        r.createElement(
          p,
          { type: "secondary", style: { fontSize: 12, fontWeight: 400 } },
          R.id
        )
      ),
      onCancel: a,
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
    r.createElement(c, {
      items: F,
      activeKey: x,
      onChange: (G) => S(G),
      size: "small",
      tabBarStyle: { marginBottom: 16 }
    })
  );
}
const dl = [
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
], ml = dl;
function Zn(e) {
  return Ft(`/ugsci/avatar/${encodeURIComponent(e)}`);
}
function ea(e) {
  const t = e.map(encodeURIComponent).join(",");
  return Ft(`/ugsci/avatar/team/${t}`);
}
function We({
  name: e,
  size: t = 32,
  borderRadius: a = "50%"
}) {
  const n = A().React, [r, l] = n.useState(0), s = r === 0 ? Zn(e) : `${Zn(e)}?_r=${r}`;
  return n.createElement("img", {
    src: s,
    alt: e,
    onError: () => {
      r < 1 && l(r + 1);
    },
    style: {
      width: t,
      height: t,
      borderRadius: a,
      objectFit: "cover",
      flexShrink: 0
    }
  });
}
function wn({
  members: e,
  size: t = 32,
  borderRadius: a = "50%"
}) {
  const n = A().React, [r, l] = n.useState(0);
  if (!e || e.length === 0)
    return n.createElement("span", {
      style: {
        width: t,
        height: t,
        display: "inline-block"
      }
    });
  const s = e.slice(0, 5), i = r === 0 ? ea(s) : `${ea(s)}?_r=${r}`;
  return n.createElement("img", {
    src: i,
    alt: "team",
    onError: () => {
      r < 1 && l(r + 1);
    },
    style: {
      width: t,
      height: t,
      borderRadius: a,
      objectFit: "cover",
      flexShrink: 0
    }
  });
}
async function ta(e) {
  var a;
  const t = A();
  if (t.refreshAgents)
    try {
      await t.refreshAgents({ force: !0 });
    } catch (n) {
      console.warn("[ugsci] Failed to refresh newly created agent:", n);
      return;
    }
  (a = t.setSelectedAgent) == null || a.call(t, e);
}
function ul({
  expert: e,
  onClick: t,
  onSummon: a,
  onConfigure: n
}) {
  const r = A().React, { Card: l, Tag: s, Badge: i, Typography: o, Spin: c, Button: d, Tooltip: u } = A().antd, { Text: m } = o, { ThunderboltOutlined: p, SettingOutlined: f } = A().antdIcons || {}, { agent: y, skills: h, mcps: _, loading: x } = e, S = y.enabled, v = h.filter((F) => F.enabled !== !1).map((F) => F.name), R = _.map((F) => F.name || F.key), D = y.active_model ? `${y.active_model.provider_id}/${y.active_model.model}` : null;
  return r.createElement(
    l,
    {
      hoverable: !0,
      onClick: t,
      size: "small",
      style: {
        cursor: "pointer",
        transition: "all 0.2s ease",
        borderColor: S ? void 0 : "var(--ant-color-border, #d9d9d9)",
        opacity: S ? 1 : 0.7,
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
        r.createElement(We, { name: y.name, size: 36 }),
        r.createElement(
          "div",
          null,
          r.createElement(
            m,
            { strong: !0, style: { fontSize: 15 } },
            y.name
          ),
          r.createElement(
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
      r.createElement(i, {
        status: S ? "success" : "default",
        text: S ? "启用" : "停用"
      })
    ),
    // Description (rendered as markdown)
    y.description ? r.createElement(
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
      Wt(y.description, r)
    ) : r.createElement(
      "div",
      { style: { fontSize: 12, color: "var(--ant-color-text-quaternary, #bfbfbf)", marginBottom: 10, minHeight: 54, flex: "1 0 auto" } },
      "暂无描述"
    ),
    // Model info
    D ? r.createElement(
      "div",
      { style: { marginBottom: 8 } },
      r.createElement(
        s,
        { color: "geekblue", style: { fontSize: 11 } },
        `🤖 ${D}`
      )
    ) : null,
    // Skills
    x ? r.createElement(c, { size: "small" }) : r.createElement(
      "div",
      { style: { marginBottom: 6 } },
      r.createElement(
        "div",
        { style: { fontSize: 11, color: "var(--ant-color-text-tertiary, #8c8c8c)", marginBottom: 4 } },
        `技能 (${v.length})`
      ),
      r.createElement(Qn, {
        items: v,
        max: 4,
        color: "cyan",
        emptyText: "未配置技能"
      })
    ),
    // MCP
    !x && R.length > 0 ? r.createElement(
      "div",
      { style: { marginTop: "auto" } },
      r.createElement(
        "div",
        { style: { fontSize: 11, color: "var(--ant-color-text-tertiary, #8c8c8c)", marginBottom: 4 } },
        `MCP (${R.length})`
      ),
      r.createElement(Qn, {
        items: R,
        max: 3,
        color: "purple"
      })
    ) : null,
    // Bottom bar: gear icon (left) + summon button (right)
    r.createElement(
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
      r.createElement(
        u,
        { title: "配置专家", placement: "top" },
        r.createElement(
          d,
          {
            type: "text",
            size: "small",
            icon: f ? r.createElement(f, {
              style: { fontSize: 16, color: "var(--ant-color-text-tertiary, #8c8c8c)" }
            }) : void 0,
            onClick: (F) => {
              F.stopPropagation(), n && n();
            }
          }
        )
      ),
      // Summon button (bottom-right)
      r.createElement(
        d,
        {
          type: "primary",
          size: "small",
          icon: p ? r.createElement(p) : void 0,
          disabled: !S,
          onClick: (F) => {
            F.stopPropagation(), a && a();
          },
          style: Be
        },
        "召唤专家"
      )
    )
  );
}
function pl({
  expert: e,
  open: t,
  onClose: a,
  onRefresh: n
}) {
  const r = A().React, {
    Drawer: l,
    Descriptions: s,
    Tag: i,
    Typography: o,
    Space: c,
    Button: d,
    Empty: u,
    Tabs: m,
    List: p,
    Spin: f,
    Modal: y,
    message: h
  } = A().antd, { Text: _, Paragraph: x } = o, {
    EditOutlined: S,
    ThunderboltOutlined: v,
    FileTextOutlined: R,
    ToolOutlined: D,
    PlusOutlined: F
  } = A().antdIcons || {}, [G, j] = r.useState(!1), [K, X] = r.useState(
    []
  ), [W, b] = r.useState(!1);
  if (!e) return null;
  const { agent: E, config: T, skills: I, mcps: U, loading: $ } = e, O = I.filter((M) => M.enabled !== !1), z = (M) => {
    window.history.pushState({}, "", M), window.dispatchEvent(new PopStateEvent("popstate"));
  }, w = r.createElement(
    "div",
    null,
    r.createElement(
      s,
      { column: 1, bordered: !0, size: "small" },
      r.createElement(s.Item, { label: "专家名称" }, E.name),
      r.createElement(
        s.Item,
        { label: "专家 ID" },
        r.createElement("code", { style: { fontSize: 12 } }, E.id)
      ),
      r.createElement(
        s.Item,
        { label: "状态" },
        r.createElement(
          i,
          { color: E.enabled ? "green" : "default" },
          E.enabled ? "启用" : "停用"
        )
      ),
      r.createElement(
        s.Item,
        { label: "功能简介" },
        E.description ? Wt(E.description, r) : "暂无描述"
      ),
      r.createElement(
        s.Item,
        { label: "使用模型" },
        E.active_model ? `${E.active_model.provider_id} / ${E.active_model.model}` : "使用全局默认模型"
      ),
      T != null && T.workspace_dir ? r.createElement(
        s.Item,
        { label: "工作区路径" },
        r.createElement(
          "code",
          { style: { fontSize: 11 } },
          T.workspace_dir
        )
      ) : null,
      T != null && T.approval_level ? r.createElement(
        s.Item,
        { label: "审批级别" },
        T.approval_level
      ) : null
    ),
    // System prompt files
    T != null && T.system_prompt_files && T.system_prompt_files.length > 0 ? r.createElement(
      "div",
      { style: { marginTop: 16 } },
      r.createElement(
        "div",
        {
          style: {
            display: "flex",
            alignItems: "center",
            gap: 6,
            marginBottom: 8
          }
        },
        R ? r.createElement(R, {
          style: { fontSize: 14, color: "#1677ff" }
        }) : null,
        r.createElement(_, { strong: !0 }, "系统提示词文件")
      ),
      r.createElement(
        c,
        { wrap: !0 },
        ...T.system_prompt_files.map(
          (M, se) => r.createElement(
            i,
            {
              key: se,
              icon: R ? r.createElement(R) : void 0,
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
      const M = await qt(!0);
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
  }, L = async (M) => {
    try {
      await Pa(E.id, M), h.success(`MCP「${M}」已移除`), n();
    } catch (se) {
      h.error(se.message || "移除 MCP 失败");
    }
  }, ne = $ ? r.createElement(
    "div",
    { style: { textAlign: "center", padding: 40 } },
    r.createElement(f, { size: "large" })
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
        _,
        { strong: !0 },
        `已启用技能 (${O.length})`
      ),
      r.createElement(
        d,
        {
          type: "primary",
          size: "small",
          icon: F ? r.createElement(F) : void 0,
          onClick: le
        },
        "从技能池添加"
      )
    ),
    O.length === 0 ? r.createElement(u, {
      description: "该专家暂无已启用的技能",
      image: u.PRESENTED_IMAGE_SIMPLE
    }) : r.createElement(p, {
      dataSource: O,
      renderItem: (M) => r.createElement(
        p.Item,
        {
          actions: [
            r.createElement(
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
            M.emoji ? r.createElement(
              "span",
              { style: { fontSize: 16 } },
              M.emoji
            ) : null,
            r.createElement(_, { strong: !0 }, M.name),
            M.version_text ? r.createElement(
              i,
              { style: { fontSize: 10 } },
              `v${M.version_text}`
            ) : null
          ),
          M.description ? r.createElement(
            x,
            {
              type: "secondary",
              style: { fontSize: 12, margin: 0 },
              ellipsis: { rows: 2 }
            },
            M.description
          ) : null,
          M.tags && M.tags.length > 0 ? r.createElement(
            "div",
            { style: { marginTop: 4 } },
            ...M.tags.map(
              (se, me) => r.createElement(
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
    r.createElement(Ma, {
      open: G,
      onClose: () => j(!1),
      poolSkills: K,
      installedSkillNames: O.map((M) => M.name),
      loading: W,
      onInstall: oe
    })
  ), Z = $ ? r.createElement(
    "div",
    { style: { textAlign: "center", padding: 40 } },
    r.createElement(f, { size: "large" })
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
        _,
        { strong: !0 },
        `MCP 客户端 (${U.length})`
      ),
      r.createElement(
        d,
        {
          type: "primary",
          size: "small",
          icon: F ? r.createElement(F) : void 0,
          onClick: () => {
            window.history.pushState({}, "", `/agents/${E.id}/mcp`), window.dispatchEvent(new PopStateEvent("popstate"));
          }
        },
        "配置 MCP"
      )
    ),
    U.length === 0 ? r.createElement(u, {
      description: "该专家暂无关联的 MCP 客户端，点击「配置 MCP」添加",
      image: u.PRESENTED_IMAGE_SIMPLE
    }) : r.createElement(p, {
      dataSource: U,
      renderItem: (M) => r.createElement(
        p.Item,
        {
          actions: [
            r.createElement(
              d,
              {
                type: "link",
                size: "small",
                danger: !0,
                onClick: () => L(M.key)
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
            r.createElement(
              "span",
              { style: { fontSize: 14 } },
              "🔌"
            ),
            r.createElement(
              _,
              { strong: !0 },
              M.name || M.key
            ),
            r.createElement(
              i,
              {
                color: M.enabled ? "green" : "default",
                style: { fontSize: 10 }
              },
              M.enabled ? "启用" : "停用"
            ),
            r.createElement(
              i,
              { color: "purple", style: { fontSize: 10 } },
              M.transport
            )
          ),
          M.description ? r.createElement(
            x,
            {
              type: "secondary",
              style: { fontSize: 12, margin: 0 },
              ellipsis: { rows: 2 }
            },
            M.description
          ) : null,
          M.tools && M.tools.length > 0 ? r.createElement(
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
  ), H = T != null && T.tools ? r.createElement(
    "div",
    { style: { padding: 16 } },
    r.createElement(
      "div",
      { style: { marginBottom: 12 } },
      r.createElement(
        "div",
        {
          style: {
            display: "flex",
            alignItems: "center",
            gap: 6,
            marginBottom: 8
          }
        },
        D ? r.createElement(D, {
          style: { fontSize: 14, color: "#1677ff" }
        }) : null,
        r.createElement(_, { strong: !0 }, "工具配置")
      ),
      r.createElement(
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
        JSON.stringify(T.tools, null, 2)
      )
    )
  ) : r.createElement(u, {
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
      children: r.createElement(rl, {
        skills: O,
        agentId: E.id
      })
    },
    {
      key: "knowledge",
      label: "专家记忆",
      children: r.createElement(Ra, {
        agentId: E.id,
        systemPromptFiles: (T == null ? void 0 : T.system_prompt_files) || [],
        onRefresh: () => n()
      })
    },
    { key: "mcp", label: `MCP (${U.length})`, children: Z },
    { key: "tools", label: "工具配置", children: H }
  ];
  return r.createElement(
    l,
    {
      title: r.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 8 } },
        r.createElement(We, { name: E.name, size: 28 }),
        r.createElement("span", null, E.name)
      ),
      open: t,
      onClose: a,
      width: 560,
      extra: r.createElement(
        c,
        null,
        r.createElement(
          d,
          {
            size: "small",
            icon: S ? r.createElement(S) : void 0,
            onClick: () => {
              a();
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
        r.createElement(
          d,
          {
            type: "primary",
            size: "small",
            icon: v ? r.createElement(v) : void 0,
            onClick: () => {
              a();
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
    r.createElement(m, {
      items: ue,
      defaultActiveKey: "basic"
    })
  );
}
function gl({
  open: e,
  onClose: t,
  onCreated: a
}) {
  const n = A().React, { useState: r } = n, {
    Modal: l,
    Card: s,
    Tag: i,
    Input: o,
    Row: c,
    Col: d,
    Spin: u,
    message: m,
    Typography: p
  } = A().antd, { Text: f } = p, { FileAddOutlined: y } = A().antdIcons || {}, [h, _] = r(!1), [x, S] = r(""), [v, R] = r(!1), D = async (j) => {
    _(!0);
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
          ({ clientKey: E, client: T }) => bn(K.id, {
            client_key: E,
            client: T
          })
        )
      ])).filter(
        (E) => E.status === "rejected"
      ).length;
      b > 0 ? m.warning(
        `专家「${j.name}」已创建，${b} 项初始配置失败，可在专家配置中重试`
      ) : m.success(`专家「${j.name}」创建成功`), await ta(K.id), R(!1), setTimeout(() => {
        t(), a();
      }, 0);
    } catch (K) {
      m.error(K.message || "创建专家失败");
    } finally {
      _(!1);
    }
  }, F = ml.filter((j) => {
    if (!x.trim()) return !0;
    const K = x.toLowerCase();
    return j.name.toLowerCase().includes(K) || j.description.toLowerCase().includes(K) || j.category.toLowerCase().includes(K);
  }), G = async (j) => {
    _(!0);
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
      }), await ta(K.id), m.success(`专家「${j.name}」创建成功`), t(), a();
    } catch (K) {
      m.error(K.message || "创建专家失败");
    } finally {
      _(!1);
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
          value: x,
          onChange: (j) => S(j.target.value),
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
        x.trim() ? null : n.createElement(
          d,
          { xs: 24, sm: 12 },
          n.createElement(
            s,
            {
              hoverable: !0,
              size: "small",
              onClick: () => R(!0),
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
                n.createElement(We, {
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
                Wt(j.description, n)
              )
            )
          )
        )
      )
    ),
    // ── Blank template creation modal (sibling, not nested inside Modal) ──
    n.createElement(yl, {
      open: v,
      onCancel: () => R(!1),
      onCreate: D
    })
  );
}
function ft(e) {
  return typeof e == "object" && e !== null && !Array.isArray(e);
}
function fl(e) {
  const t = e.trim();
  if (!t) return [];
  const a = JSON.parse(t);
  if (!ft(a))
    throw new Error("MCP 配置必须是 JSON 对象");
  const n = a.mcpServers ?? a;
  if (!ft(n))
    throw new Error("mcpServers 必须是 JSON 对象");
  return Object.entries(n).map(([r, l]) => {
    const s = r.trim();
    if (!s || !ft(l))
      throw new Error(`MCP「${r || "未命名"}」配置无效`);
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
        env: ft(l.env) ? l.env : {},
        cwd: typeof l.cwd == "string" ? l.cwd : "",
        headers: ft(l.headers) ? l.headers : {}
      }
    };
  });
}
function yl({
  open: e,
  onCancel: t,
  onCreate: a
}) {
  const n = A().React, { useState: r, useEffect: l, useMemo: s } = n, {
    Modal: i,
    Input: o,
    Select: c,
    Button: d,
    Row: u,
    Col: m,
    Spin: p,
    Tag: f,
    Typography: y,
    message: h
  } = A().antd, { CheckCircleOutlined: _ } = A().antdIcons || {}, { Text: x } = y, [S, v] = r(""), [R, D] = r(""), [F, G] = r(""), [j, K] = r(""), [X, W] = r([]), [b, E] = r([]), [T, I] = r(!1), [U, $] = r(""), [O, z] = r(!1);
  l(() => {
    e && (v(""), D(""), G(""), K(""), E([]), $(""), z(!1), I(!0), qt(!0).then(W).catch((Z) => {
      W([]), h.error(Z.message || "加载技能池失败");
    }).finally(() => I(!1)));
  }, [e]);
  const w = R.trim(), le = s(() => w ? w.length < 2 || w.length > 64 ? "ID 长度需为 2-64 个字符" : /^[a-zA-Z0-9][a-zA-Z0-9_-]*[a-zA-Z0-9]$/.test(w) ? w === "default" ? "default 是系统保留 ID" : "" : "仅允许字母、数字、连字符和下划线，且不能以符号开头或结尾" : "", [w]), oe = s(() => {
    try {
      return { clients: fl(U), error: "" };
    } catch (Z) {
      return { clients: [], error: Z.message || "MCP 配置无效" };
    }
  }, [U]), B = () => {
    const Z = S.trim();
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
      a({
        id: w,
        name: Z,
        description: F.trim(),
        systemPrompt: j,
        skillNames: b,
        mcpClients: oe.clients
      })
    ).finally(() => z(!1));
  }, L = () => {
    E(
      X.filter((Z) => Z.source === "builtin").map((Z) => Z.name)
    );
  }, ne = (Z, H) => n.createElement(
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
    n.createElement(x, { strong: !0, style: { fontSize: 15 } }, Z),
    H ? n.createElement(x, { type: "secondary", style: { fontSize: 12 } }, H) : null
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
          m,
          { xs: 24, md: 12 },
          n.createElement(
            "label",
            { style: { display: "block", fontSize: 13, marginBottom: 6 } },
            "专家名称",
            n.createElement("span", { style: { color: "#ff4d4f", marginLeft: 4 } }, "*")
          ),
          n.createElement(o, {
            placeholder: "例如：合同审查专家",
            value: S,
            onChange: (Z) => v(Z.target.value),
            maxLength: 50
          })
        ),
        n.createElement(
          m,
          { xs: 24, md: 12 },
          n.createElement(
            "label",
            { style: { display: "block", fontSize: 13, marginBottom: 6 } },
            "智能体 ID（可选）"
          ),
          n.createElement(o, {
            placeholder: "例如：contract-reviewer",
            value: R,
            onChange: (Z) => D(Z.target.value),
            maxLength: 64,
            status: le ? "error" : void 0
          }),
          le ? n.createElement("div", { style: { color: "#ff4d4f", fontSize: 12, marginTop: 4 } }, le) : null
        ),
        n.createElement(
          m,
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
          m,
          { xs: 24, md: 12 },
          n.createElement(
            "div",
            { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 } },
            n.createElement(x, { strong: !0 }, "初始技能"),
            n.createElement(
              "div",
              { style: { display: "flex", gap: 4 } },
              n.createElement(d, { size: "small", onClick: L, disabled: T }, "内置"),
              n.createElement(d, { size: "small", onClick: () => E([]), disabled: b.length === 0 }, "清空")
            )
          ),
          T ? n.createElement("div", { style: { textAlign: "center", padding: 32 } }, n.createElement(p, { size: "small" })) : n.createElement(c, {
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
            b.length > 0 ? n.createElement(f, { color: "blue" }, `已选择 ${b.length} 个技能`) : n.createElement(x, { type: "secondary", style: { fontSize: 12 } }, "暂不添加技能")
          )
        ),
        n.createElement(
          m,
          { xs: 24, md: 12 },
          n.createElement(x, { strong: !0, style: { display: "block", marginBottom: 8 } }, "初始 MCP"),
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
            oe.error ? n.createElement(x, { type: "danger", style: { fontSize: 12 } }, oe.error) : oe.clients.length > 0 ? n.createElement(
              f,
              {
                color: "green",
                icon: _ ? n.createElement(_) : void 0
              },
              `已识别 ${oe.clients.length} 个 MCP`
            ) : n.createElement(x, { type: "secondary", style: { fontSize: 12 } }, "暂不添加 MCP")
          )
        )
      )
    )
  );
}
const ja = "ugsci_custom_teams";
function hl(e) {
  if (!e || typeof e != "object") return !1;
  const t = e;
  return typeof t.id == "string" && typeof t.name == "string" && typeof t.taskTemplate == "string" && typeof t.orchestrationPrompt == "string" && Array.isArray(t.members);
}
function El() {
  try {
    const e = JSON.parse(
      localStorage.getItem(ja) || "[]"
    );
    return Array.isArray(e) ? e.filter(hl) : [];
  } catch {
    return [];
  }
}
function vl(e) {
  try {
    localStorage.setItem(ja, JSON.stringify(e));
  } catch {
  }
}
function bl(e) {
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
function wl(e) {
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
  const t = await qe("/ugsci/team/custom");
  if (!t.ok) {
    const r = await t.text().catch(() => "");
    throw new Error(r || `HTTP ${t.status}`);
  }
  const n = (await t.json()).map(wl);
  return e && vl(n), n;
}
async function Na(e) {
  const t = await qe("/ugsci/team/custom", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(bl(e))
  });
  if (!t.ok) {
    const n = await t.text().catch(() => "");
    throw new Error(n || `HTTP ${t.status}`);
  }
  const a = await t.json();
  return { ...e, id: a.team_id };
}
async function Sl(e) {
  const t = await qe(
    `/ugsci/team/custom/${encodeURIComponent(e)}`,
    { method: "DELETE" }
  );
  if (!t.ok && t.status !== 404) {
    const a = await t.text().catch(() => "");
    throw new Error(a || `HTTP ${t.status}`);
  }
}
async function xl() {
  const e = El();
  if (e.length === 0) return;
  const t = await sn(!1), a = new Set(t.map((n) => n.id));
  await Promise.all(
    e.filter((n) => !a.has(n.id)).map((n) => Na(n))
  );
}
async function kl(e) {
  var r, l;
  const t = (r = e.body) == null ? void 0 : r.getReader();
  if (!t) return;
  const a = new TextDecoder();
  let n = "";
  try {
    for (; ; ) {
      const { done: s, value: i } = await t.read();
      if (s) break;
      n += a.decode(i, { stream: !0 });
      let o;
      for (; (o = n.indexOf(`

`)) >= 0; ) {
        const c = n.slice(0, o);
        n = n.slice(o + 2);
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
            const p = m.error, f = typeof p == "string" ? p : (p == null ? void 0 : p.message) || "工作流启动失败";
            throw new Error(f);
          }
          if (m.object === "response" || m.type === "response") {
            const p = m.status;
            if (p === "failed" || p === "error") {
              const f = ((l = m.error) == null ? void 0 : l.message) || "工作流启动失败";
              throw new Error(f);
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
async function Cl(e, t, a) {
  const n = `console:default:team-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, r = await qe("/chats", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Agent-Id": e
    },
    body: JSON.stringify({
      session_id: n,
      user_id: "default",
      channel: "console",
      name: a ? `团队：${a}` : "团队任务"
    })
  });
  if (!r.ok) {
    const o = await r.text().catch(() => "");
    throw new Error(
      o || `创建会话失败 (HTTP ${r.status})`
    );
  }
  const s = (await r.json()).id, i = await qe("/console/chat", {
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
  return await kl(i), s;
}
function Da(e, t) {
  var r;
  const a = t.replace(/\s+/g, ""), n = e.find(
    (l) => l.name === t || l.name.replace(/\s+/g, "") === a
  );
  return n ? n.id : ((r = e.find(
    (l) => l.name.includes(t) || t.includes(l.name) || l.name.replace(/\s+/g, "").includes(a)
  )) == null ? void 0 : r.id) || null;
}
function Ga() {
  var t;
  const e = (t = window.QwenPaw) == null ? void 0 : t.host;
  if (!e) throw new Error("[ugsci] QwenPaw.host not available");
  return e;
}
async function Fa(e, t) {
  const a = await e.text().catch(() => "");
  if (!a) return t;
  try {
    const n = JSON.parse(a);
    if (typeof n.detail == "string") return n.detail;
  } catch {
  }
  return a;
}
async function Sn(e, t, a) {
  const n = await qe(e, {
    headers: t ? { "X-Agent-Id": t } : void 0,
    signal: a
  });
  if (!n.ok)
    throw new Error(
      await Fa(n, `HTTP ${n.status}`)
    );
  return await n.json();
}
function Tl(e, t) {
  return Sn("/ugsci/team/state", e, t);
}
async function _l(e, t) {
  const a = await qe("/ugsci/team/runs", {
    headers: { "X-Agent-Id": e },
    signal: t
  });
  if (!a.ok)
    throw new Error(
      await Fa(
        a,
        `Failed to load team runs: ${a.status}`
      )
    );
  return await a.json();
}
const Il = 5e3;
function na({
  activeOnly: e = !1,
  enabled: t = !0
}) {
  const a = Ga(), n = a.React, { useCallback: r, useEffect: l, useRef: s, useState: i } = n, { Alert: o, Button: c, Card: d, Empty: u, Spin: m, Tag: p, Typography: f } = a.antd, { Text: y, Paragraph: h } = f, _ = a.useSelectedAgent ? a.useSelectedAgent() : { id: "default" }, x = (_ == null ? void 0 : _.id) || "default", [S, v] = i([]), [R, D] = i(!0), [F, G] = i(null), [j, K] = i(!1), X = s(null), W = s(0), b = s(!1), E = s(x), T = r(
    async ($ = !0, O = !0) => {
      var le;
      if (!t || !O && b.current) return;
      (le = X.current) == null || le.abort();
      const z = new AbortController();
      X.current = z;
      const w = ++W.current;
      b.current = !0, $ && D(!0);
      try {
        const oe = await _l(x, z.signal);
        if (z.signal.aborted || w !== W.current)
          return;
        v(oe), K(!0), G(null);
      } catch (oe) {
        if (z.signal.aborted || w !== W.current)
          return;
        G(
          oe instanceof Error ? oe.message : "讨论运行记录加载失败"
        );
      } finally {
        !z.signal.aborted && w === W.current && (X.current = null, b.current = !1, D(!1));
      }
    },
    [x, t]
  );
  if (l(() => {
    var O;
    if (!t) {
      (O = X.current) == null || O.abort(), X.current = null, b.current = !1, W.current += 1;
      return;
    }
    E.current !== x && (E.current = x, v([]), G(null), K(!1)), T(!0, !0);
    const $ = e ? window.setInterval(() => {
      T(!1, !1);
    }, Il) : null;
    return () => {
      var z;
      $ !== null && window.clearInterval($), (z = X.current) == null || z.abort(), X.current = null, b.current = !1, W.current += 1;
    };
  }, [e, x, t, T]), R && !j) return n.createElement(m);
  if (F && !j)
    return n.createElement(o, {
      type: "warning",
      message: "讨论运行记录加载失败",
      description: F,
      action: n.createElement(
        c,
        { size: "small", onClick: () => void T(!0, !0), loading: R },
        "重试"
      )
    });
  const I = S.filter(
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
          onClick: () => void T(!0, !0),
          loading: R
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
        { size: "small", onClick: () => void T(!0, !0), loading: R },
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
          { size: "small", onClick: () => void T(!0, !0), loading: R },
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
                p,
                {
                  color: $.status === "completed" ? "green" : $.status === "terminated" ? "orange" : "blue"
                },
                $.status
              ),
              n.createElement(p, null, $.current_phase),
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
async function zl() {
  try {
    return (await Sn(
      "/ugsci/team/preset-teams"
    )).teams;
  } catch {
    return null;
  }
}
async function Al() {
  try {
    return (await Sn(
      "/ugsci/team/roles"
    )).roles;
  } catch {
    return null;
  }
}
const $l = {
  plan: { label: "规划", color: "#1677ff", icon: "📋" },
  dispatch: { label: "分派", color: "#13c2c2", icon: "🚀" },
  verify: { label: "验证", color: "#fa8c16", icon: "🔍" },
  synthesize: { label: "综合", color: "#722ed1", icon: "📊" },
  completed: { label: "完成", color: "#52c41a", icon: "✅" }
}, aa = [
  "plan",
  "dispatch",
  "verify",
  "synthesize",
  "completed"
], ra = 5e3, Pl = 3e4;
function Ol({ enabled: e = !0 }) {
  const t = Ga(), a = t.React, { useState: n, useEffect: r, useCallback: l, useRef: s } = a, { Card: i, Tag: o, Typography: c, Button: d, Steps: u, Empty: m, Alert: p, Spin: f } = t.antd, { ReloadOutlined: y } = t.antdIcons || {}, { Text: h, Paragraph: _ } = c, x = t.useSelectedAgent ? t.useSelectedAgent() : { id: "default" }, S = (x == null ? void 0 : x.id) || "default", [v, R] = n(null), [D, F] = n(!1), [G, j] = n(null), K = s(null), X = s(0), W = s(0), b = s(0), E = s(null), T = s(!1), I = l(
    async (H, ue = !0) => {
      var me;
      if (!e || !ue && T.current) return;
      (me = E.current) == null || me.abort();
      const M = new AbortController();
      E.current = M;
      const se = ++b.current;
      T.current = !0, H && F(!0);
      try {
        const Y = await Tl(S, M.signal);
        if (M.signal.aborted || se !== b.current)
          return;
        X.current = 0, W.current = 0, K.current = Y, R(Y), j(null);
      } catch (Y) {
        if (M.signal.aborted || se !== b.current)
          return;
        X.current += 1;
        const Q = Math.min(
          Pl,
          ra * 2 ** (X.current - 1)
        );
        W.current = Date.now() + Q, j(
          Y instanceof Error ? Y.message : "专家团状态加载失败"
        );
      } finally {
        !M.signal.aborted && se === b.current && (E.current = null, T.current = !1, F(!1));
      }
    },
    [S, e]
  ), U = l(() => (X.current = 0, W.current = 0, I(!0)), [I]);
  if (r(() => {
    var ue;
    if ((ue = E.current) == null || ue.abort(), E.current = null, T.current = !1, b.current += 1, X.current = 0, W.current = 0, K.current = null, R(null), j(null), !e) return;
    U();
    const H = window.setInterval(() => {
      var M, se;
      Date.now() < W.current || ((M = K.current) == null ? void 0 : M.status) === "completed" || ((se = K.current) == null ? void 0 : se.status) === "terminated" || I(!1, !1);
    }, ra);
    return () => {
      var M;
      window.clearInterval(H), (M = E.current) == null || M.abort(), E.current = null, T.current = !1, b.current += 1;
    };
  }, [S, e, I, U]), D && !v && !G)
    return a.createElement(f);
  if (G && !v)
    return a.createElement(p, {
      type: "warning",
      showIcon: !0,
      message: "专家团状态加载失败",
      description: G,
      style: { marginBottom: 16 },
      action: a.createElement(
        d,
        { size: "small", onClick: U, loading: D },
        "重试"
      )
    });
  const $ = (H) => G ? a.createElement(
    a.Fragment,
    null,
    a.createElement(p, {
      type: "warning",
      showIcon: !0,
      message: "状态更新失败，当前显示上次成功读取的结果",
      description: G,
      style: { marginBottom: 16 },
      action: a.createElement(
        d,
        { size: "small", onClick: U, loading: D },
        "重试"
      )
    }),
    H
  ) : H;
  if ((v == null ? void 0 : v.status) === "unreadable")
    return $(
      a.createElement(p, {
        type: "warning",
        showIcon: !0,
        message: "专家团状态暂时无法读取",
        description: `实例 ${v.instance_id || "未知"} 的状态文件需要检查。`,
        style: { marginBottom: 16 },
        action: a.createElement(
          d,
          { size: "small", onClick: U, loading: D },
          "重试"
        )
      })
    );
  if (!v || !v.active) {
    if ((v == null ? void 0 : v.status) === "completed" || (v == null ? void 0 : v.status) === "terminated") {
      const H = v.status === "completed";
      return $(
        a.createElement(p, {
          type: H ? "success" : "info",
          showIcon: !0,
          message: H ? "专家团工作流已完成" : "专家团工作流已终止",
          description: H ? `实例 ${v.instance_id || "未知"} 已完成，结果文件保留在工作区。` : `原因：${v.state.termination_reason || "未知"}`,
          style: { marginBottom: 16 }
        })
      );
    }
    return $(
      a.createElement(m, {
        description: "暂无活跃的专家团工作流",
        style: { padding: 24 }
      })
    );
  }
  const O = v.state, z = O.current_phase || "plan", w = aa.indexOf(z), le = O.team_name || "未知团队", oe = O.team_mode || "pipeline", B = O.iteration || 0, L = O.members || [], ne = O.verify_retries || 0, Z = {
    pipeline: "顺序交接",
    coordinator: "主管协作",
    roundtable: "并行汇聚",
    router: "智能路由",
    review_loop: "评审迭代",
    debate: "多方论证"
  };
  return $(
    a.createElement(
      i,
      {
        size: "small",
        style: { marginBottom: 16 },
        title: a.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 8 } },
          a.createElement("span", { style: { fontSize: 16 } }, "🔄"),
          a.createElement(
            h,
            { strong: !0 },
            `${le} — 工作流状态`
          ),
          a.createElement(
            o,
            { color: "blue", style: { fontSize: 10 } },
            Z[oe] || oe
          ),
          a.createElement(
            o,
            { style: { fontSize: 10 } },
            `迭代 ${B}`
          ),
          ne > 0 ? a.createElement(
            o,
            { color: "orange", style: { fontSize: 10 } },
            `验证重试 ${ne}`
          ) : null
        ),
        extra: a.createElement(
          d,
          {
            size: "small",
            type: "text",
            icon: y ? a.createElement(y) : void 0,
            onClick: U,
            loading: D
          },
          "刷新"
        )
      },
      a.createElement(u, {
        current: w,
        size: "small",
        items: aa.map((H) => {
          const ue = $l[H];
          return {
            title: `${ue.icon} ${ue.label}`,
            description: H === "plan" ? "分析任务，创建任务分解" : H === "dispatch" ? "分派专家执行任务" : H === "verify" ? "交叉验证专家结果" : H === "synthesize" ? "综合形成最终报告" : "工作流完成"
          };
        })
      }),
      a.createElement(
        "div",
        {
          style: {
            marginTop: 12,
            display: "flex",
            gap: 6,
            flexWrap: "wrap"
          }
        },
        ...L.map(
          (H, ue) => a.createElement(
            o,
            { key: `${H.name}-${ue}`, style: { fontSize: 11 } },
            `${H.emoji || ""} ${H.name}（${H.role}）`
          )
        )
      ),
      O.task ? a.createElement(
        _,
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
function Ml({ team: e }) {
  const t = A().React, { Typography: a, Tag: n } = A().antd, { Text: r } = a, l = {
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
      r,
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
          t.createElement(We, {
            name: d.agentName,
            size: 24
          }),
          t.createElement(
            "div",
            null,
            t.createElement(
              r,
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
          t.createElement(We, {
            name: d.name,
            size: 24
          }),
          t.createElement(
            "div",
            null,
            t.createElement(
              r,
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
  {
    key: "analyst",
    display_name: "需求分析师",
    allowed_tools: [],
    skills: [],
    prompt: ""
  },
  {
    key: "reservoir-engineer",
    display_name: "油藏工程师",
    allowed_tools: [],
    skills: [],
    prompt: ""
  },
  {
    key: "log-analyst",
    display_name: "测井分析师",
    allowed_tools: [],
    skills: [],
    prompt: ""
  },
  {
    key: "geophysicist",
    display_name: "地球物理专家",
    allowed_tools: [],
    skills: [],
    prompt: ""
  },
  {
    key: "drilling-engineer",
    display_name: "钻井工程师",
    allowed_tools: [],
    skills: [],
    prompt: ""
  },
  {
    key: "production-engineer",
    display_name: "采油工程师",
    allowed_tools: [],
    skills: [],
    prompt: ""
  },
  {
    key: "pvt-analyst",
    display_name: "PVT 分析师",
    allowed_tools: [],
    skills: [],
    prompt: ""
  },
  {
    key: "domain-reviewer",
    display_name: "领域审核专家",
    allowed_tools: [],
    skills: [],
    prompt: ""
  },
  {
    key: "planner",
    display_name: "规划者",
    allowed_tools: [],
    skills: [],
    prompt: ""
  },
  {
    key: "verifier",
    display_name: "验证者",
    allowed_tools: [],
    skills: [],
    prompt: ""
  }
];
function Ll({
  open: e,
  onClose: t,
  agents: a,
  editingTeam: n,
  onSaved: r
}) {
  const l = A().React, { useState: s, useEffect: i, useCallback: o } = l, {
    Modal: c,
    Input: d,
    Button: u,
    Select: m,
    Tag: p,
    Typography: f,
    Switch: y,
    Empty: h,
    message: _,
    Divider: x,
    Steps: S
  } = A().antd, { PlusOutlined: v, DeleteOutlined: R, SaveOutlined: D, ArrowRightOutlined: F } = A().antdIcons || {}, { Text: G, Paragraph: j } = f, [K, X] = s(""), [W, b] = s("🤝"), [E, T] = s(""), [I, U] = s("pipeline"), [$, O] = s(""), [z, w] = s(""), [le, oe] = s([]), [B, L] = s([]), [ne, Z] = s(!1), [H, ue] = s(2), [M, se] = s(""), [me, Y] = s(""), [Q, ie] = s({}), [he, we] = s(
    {}
  ), [Ae, Se] = s(
    Rl
  ), ee = [
    {
      value: "pipeline",
      icon: "→",
      title: "顺序交接",
      description: "上一步产物成为下一位专家的上下文",
      topology: "A → B → C",
      accent: "#08979c"
    },
    {
      value: "roundtable",
      icon: "⇉",
      title: "并行汇聚",
      description: "独立并行分析，避免观点相互污染",
      topology: "A ∥ B ∥ C → 汇总",
      accent: "#531dab"
    },
    {
      value: "coordinator",
      icon: "◎",
      title: "主管协作",
      description: "主控专家拆解任务并按需组织成员",
      topology: "主管 → 专家组",
      accent: "#0958d9"
    },
    {
      value: "router",
      icon: "◇",
      title: "智能路由",
      description: "按任务能力需求选择最小充分专家集合",
      topology: "任务 → 路由 → 子集",
      accent: "#d46b08"
    },
    {
      value: "review_loop",
      icon: "↻",
      title: "评审迭代",
      description: "产出、独立审查、修订，直到满足标准",
      topology: "执行 ⇄ 评审",
      accent: "#389e0d"
    },
    {
      value: "debate",
      icon: "⚖",
      title: "多方论证",
      description: "独立立场、交叉质询，再由裁决者综合",
      topology: "观点 ⇄ 反驳 → 裁决",
      accent: "#c41d7f"
    }
  ];
  i(() => {
    e && (n ? (X(n.name), b(n.emoji), T(n.description), U(n.mode), O(n.coordinatorName || ""), w(n.taskTemplate), oe(n.steps || []), L(n.members.map((k) => k.name)), ue(n.maxReviewRounds || 2), se(n.successCriteria || ""), Y(n.routingInstruction || ""), ie(
      Object.fromEntries(
        n.members.map((k) => [
          k.name,
          k.bindingMode || (k.agentId ? "fixed" : "preferred")
        ])
      )
    ), we(
      Object.fromEntries(
        n.members.map((k) => [
          k.name,
          k.roleKey || It(k.name)
        ])
      )
    )) : (X(""), b("🤝"), T(""), U("pipeline"), O(""), w(`请执行以下任务：
任务描述：{任务描述}`), oe([]), L([]), ue(2), se(""), Y(""), ie({}), we({})));
  }, [e, n]), i(() => {
    e && Al().then((k) => {
      k != null && k.length && Se(k);
    });
  }, [e]);
  const be = o(() => {
    if (I === "roundtable" || I === "debate" || I === "router") {
      const k = B.map((fe) => ({
        agentName: fe,
        instruction: "请给出你的专业评估意见",
        passContext: !1
      }));
      oe(k);
    } else if (I === "pipeline") {
      const k = new Map(le.map((V) => [V.agentName, V])), fe = B.map((V) => k.get(V) || {
        agentName: V,
        instruction: "请完成你的专业部分",
        passContext: !0
      });
      oe(fe);
    }
  }, [I, B, le]), Ee = (k) => {
    B.includes(k) || (L([...B, k]), ie({ ...Q, [k]: "fixed" }), we({
      ...he,
      [k]: It(k)
    }), (I === "coordinator" || I === "debate") && !$ && O(k));
  }, te = (k) => {
    const fe = B.filter((ae) => ae !== k);
    L(fe), oe(le.filter((ae) => ae.agentName !== k));
    const V = { ...Q };
    delete V[k], ie(V);
    const C = { ...he };
    delete C[k], we(C), $ === k && O(fe[0] || "");
  }, de = (k, fe, V) => {
    const C = [...le];
    C[k] = { ...C[k], [fe]: V }, oe(C);
  }, ge = async () => {
    if (!K.trim()) {
      _.warning("请输入团队名称");
      return;
    }
    if (B.length < 2) {
      _.warning("至少需要选择 2 个成员");
      return;
    }
    if (!z.trim()) {
      _.warning("请输入任务模板");
      return;
    }
    if ((I === "coordinator" || I === "debate") && !$) {
      _.warning(I === "debate" ? "请选择裁决者" : "请选择主控专家");
      return;
    }
    Z(!0);
    try {
      let k = [...B];
      I === "coordinator" && $ ? k = [
        $,
        ...k.filter((ae) => ae !== $)
      ] : I === "debate" && $ && (k = [
        ...k.filter((ae) => ae !== $),
        $
      ]);
      const fe = k.map((ae) => {
        var Le;
        const pe = a.find((Ge) => Ge.name === ae), Ie = Q[ae] || "fixed", Re = he[ae] || It(ae), Ne = Ae.find((Ge) => Ge.key === Re);
        return {
          name: ae,
          role: (Ne == null ? void 0 : Ne.display_name) || ((Le = pe == null ? void 0 : pe.description) == null ? void 0 : Le.slice(0, 30)) || "需求分析师",
          emoji: "",
          agentId: Ie === "temporary" || pe == null ? void 0 : pe.id,
          roleKey: Re,
          bindingMode: Ie
        };
      });
      let V = le;
      (le.length === 0 || le.length !== B.length) && (V = B.map((ae) => ({
        agentName: ae,
        instruction: "请完成你的专业部分",
        passContext: I === "pipeline"
      })));
      const C = {
        id: (n == null ? void 0 : n.id) || `custom-${Date.now()}`,
        name: K.trim(),
        emoji: W,
        category: "自定义",
        description: E.trim() || `${K.trim()}（${B.length}人团队）`,
        mode: I,
        members: fe,
        coordinatorName: I === "coordinator" || I === "debate" ? $ : void 0,
        taskTemplate: z.trim(),
        orchestrationPrompt: "",
        // Custom teams use steps-based instructions
        steps: V,
        custom: !0,
        createdAt: (n == null ? void 0 : n.createdAt) || Date.now(),
        updatedAt: n == null ? void 0 : n.updatedAt,
        version: n == null ? void 0 : n.version,
        maxReviewRounds: H,
        successCriteria: M.trim(),
        routingInstruction: me.trim()
      };
      await Na(C), _.success(n ? "团队已更新" : "团队已创建"), r(), t();
    } catch (k) {
      _.error(k.message || "保存失败");
    } finally {
      Z(!1);
    }
  }, q = a.filter(
    (k) => !B.includes(k.name)
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
      onOk: ge,
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
        {
          style: {
            display: "flex",
            gap: 8,
            marginBottom: 8,
            alignItems: "center"
          }
        },
        B.length > 0 ? l.createElement(wn, {
          members: B,
          size: 36
        }) : null,
        l.createElement(d, {
          placeholder: "专家团名称（如：储层评价与质量复核专家团）",
          value: K,
          onChange: (k) => X(k.target.value),
          style: { flex: 1 }
        })
      ),
      l.createElement(d.TextArea, {
        placeholder: "说明这个工作流解决什么问题、适用于什么场景",
        value: E,
        onChange: (k) => T(k.target.value),
        rows: 2,
        style: { marginBottom: 8 }
      }),
      l.createElement(
        G,
        {
          strong: !0,
          style: { display: "block", margin: "12px 0 8px", fontSize: 13 }
        },
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
        ...ee.map((k) => {
          const fe = I === k.value;
          return l.createElement(
            "button",
            {
              key: k.value,
              type: "button",
              onClick: () => {
                U(k.value), k.value !== "coordinator" && k.value !== "debate" && O("");
              },
              style: {
                textAlign: "left",
                padding: 10,
                borderRadius: 8,
                cursor: "pointer",
                background: fe ? `${k.accent}0d` : "var(--ant-color-bg-container, #fff)",
                border: `1px solid ${fe ? k.accent : "var(--ant-color-border, #d9d9d9)"}`,
                boxShadow: fe ? `0 0 0 2px ${k.accent}1a` : "none"
              }
            },
            l.createElement(
              "div",
              {
                style: {
                  display: "flex",
                  alignItems: "center",
                  gap: 7,
                  color: k.accent,
                  fontWeight: 600
                }
              },
              l.createElement(
                "span",
                { style: { fontSize: 18 } },
                k.icon
              ),
              k.title
            ),
            l.createElement(
              "div",
              {
                style: {
                  fontSize: 11,
                  color: "#595959",
                  marginTop: 5,
                  lineHeight: 1.45
                }
              },
              k.description
            ),
            l.createElement(
              "div",
              {
                style: {
                  fontSize: 10,
                  color: k.accent,
                  marginTop: 5,
                  fontFamily: "monospace"
                }
              },
              k.topology
            )
          );
        })
      )
    ),
    l.createElement(x, { style: { margin: "12px 0" } }),
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
          (k) => l.createElement(
            u,
            {
              key: k.id,
              size: "small",
              icon: v ? l.createElement(v) : void 0,
              onClick: () => Ee(k.name)
            },
            k.name
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
          (k) => l.createElement(
            "div",
            {
              key: k,
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
              l.createElement(We, {
                name: k,
                size: 24
              }),
              l.createElement(
                G,
                { strong: !0, style: { fontSize: 13 } },
                k
              ),
              (I === "coordinator" || I === "debate") && $ === k ? l.createElement(
                p,
                { color: "blue", style: { fontSize: 10 } },
                I === "debate" ? "裁决者" : "主控"
              ) : null
            ),
            l.createElement(
              "div",
              { style: { display: "flex", gap: 4 } },
              l.createElement(m, {
                size: "small",
                value: he[k] || It(k),
                style: { width: 132 },
                onChange: (fe) => we({
                  ...he,
                  [k]: fe
                }),
                options: Ae.map((fe) => ({
                  value: fe.key,
                  label: fe.display_name
                }))
              }),
              l.createElement(m, {
                size: "small",
                value: Q[k] || "fixed",
                style: { width: 118 },
                onChange: (fe) => ie({
                  ...Q,
                  [k]: fe
                }),
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
                  onClick: () => O(k)
                },
                I === "debate" ? "设为裁决者" : "设为主控"
              ) : null,
              l.createElement(
                u,
                {
                  size: "small",
                  type: "link",
                  danger: !0,
                  icon: R ? l.createElement(R) : void 0,
                  onClick: () => te(k)
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
        {
          style: {
            display: "grid",
            gridTemplateColumns: "150px 1fr",
            gap: 10
          }
        },
        l.createElement(m, {
          value: H,
          onChange: (k) => ue(k),
          options: [1, 2, 3, 4, 5].map((k) => ({
            value: k,
            label: `最多 ${k} 轮`
          }))
        }),
        l.createElement(d, {
          value: M,
          onChange: (k) => se(k.target.value),
          placeholder: "验收标准，例如：关键结论均有数据依据，且无高风险缺陷"
        })
      ) : l.createElement(d, {
        value: me,
        onChange: (k) => Y(k.target.value),
        placeholder: "路由偏好，例如：仅调用任务必需的专家；涉及模拟时优先油藏工程师"
      })
    ) : null,
    l.createElement(x, { style: { margin: "12px 0" } }),
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
          (k, fe) => l.createElement(
            "div",
            {
              key: fe,
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
                `${fe + 1}`
              ) : l.createElement(
                "span",
                { style: { fontSize: 14 } },
                "🔀"
              ),
              l.createElement(
                p,
                { color: "blue", style: { fontSize: 11 } },
                k.agentName
              ),
              l.createElement(
                "div",
                { style: { flex: 1 } },
                l.createElement(d, {
                  placeholder: "请输入该步骤的指令...",
                  value: k.instruction,
                  onChange: (V) => de(fe, "instruction", V.target.value),
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
                checked: k.passContext,
                onChange: (V) => de(fe, "passContext", V)
              }),
              l.createElement(
                G,
                { type: "secondary", style: { fontSize: 11 } },
                k.passContext ? "传递上一步结果作为上下文" : "独立执行"
              )
            )
          )
        )
      )
    ) : null,
    l.createElement(x, { style: { margin: "12px 0" } }),
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
        onChange: (k) => w(k.target.value),
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
function la({
  team: e,
  agents: t,
  onLaunch: a,
  onEdit: n,
  onDelete: r
}) {
  var b;
  const l = A().React, { useState: s } = l, { Card: i, Tag: o, Typography: c, Button: d, Tooltip: u, Popconfirm: m } = A().antd, {
    TeamOutlined: p,
    RocketOutlined: f,
    UserOutlined: y,
    EditOutlined: h,
    DeleteOutlined: _,
    DownOutlined: x,
    UpOutlined: S
  } = A().antdIcons || {}, { Text: v, Paragraph: R } = c, [D, F] = s(!1), G = {
    coordinator: { label: "主管协作", color: "blue" },
    pipeline: { label: "顺序交接", color: "cyan" },
    roundtable: { label: "并行汇聚", color: "purple" },
    router: { label: "智能路由", color: "orange" },
    review_loop: { label: "评审迭代", color: "green" },
    debate: { label: "多方论证", color: "magenta" }
  }, j = G[e.mode] || G.coordinator, K = e.members.map((E) => {
    const T = E.bindingMode === "temporary", I = T ? null : (E.agentId && t.some((U) => U.id === E.agentId) ? E.agentId : null) || Da(t, E.name);
    return { ...E, found: !!I, agentId: I, temporary: T };
  }), X = K.filter((E) => E.found).length, W = e.coordinatorName || ((b = e.members[0]) == null ? void 0 : b.name);
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
        r ? l.createElement(
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
              onConfirm: () => r(e)
            },
            l.createElement(d, {
              type: "text",
              size: "small",
              danger: !0,
              icon: _ ? l.createElement(_) : void 0,
              onClick: (E) => E.stopPropagation()
            })
          )
        ) : null
      ) : null
    ),
    // Description
    l.createElement(
      R,
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
            l.createElement(We, { name: E.name, size: 18 }),
            l.createElement(
              v,
              {
                style: { fontSize: 11, color: E.found ? "#1f4e8c" : "#531dab" }
              },
              E.name
            ),
            E.temporary ? l.createElement(
              o,
              {
                color: "purple",
                style: { fontSize: 9, marginInlineEnd: 0 }
              },
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
        icon: D ? S ? l.createElement(S) : "▲" : x ? l.createElement(x) : "▼"
      },
      D ? "收起流程" : "查看执行流程"
    ),
    D ? l.createElement(Ml, { team: e }) : null,
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
        W ? `${e.mode === "debate" ? "裁决者" : "主控"}: ${W}` : "OMP 动态编排"
      ),
      l.createElement(
        d,
        {
          type: "primary",
          size: "small",
          icon: f ? l.createElement(f) : void 0,
          disabled: t.length === 0,
          onClick: () => a(e),
          style: Be
        },
        "运行工作流"
      )
    )
  );
}
function Bl({
  agents: e,
  onLaunch: t
}) {
  const a = A().React, { useMemo: n, useState: r, useCallback: l, useEffect: s } = a, {
    Row: i,
    Col: o,
    Input: c,
    Empty: d,
    Typography: u,
    Tag: m,
    Button: p,
    Divider: f,
    Tabs: y,
    message: h
  } = A().antd, { SearchOutlined: _, PlusOutlined: x, RocketOutlined: S } = A().antdIcons || {}, { Text: v } = u, [R, D] = r(""), [F, G] = r([]), [j, K] = r([]), [X, W] = r(!1), [b, E] = r(null), [T, I] = r("preset");
  s(() => {
    let L = !0;
    return (async () => {
      try {
        await xl();
        const ne = await sn();
        L && G(ne);
      } catch (ne) {
        console.warn("[ugsci] Failed to load backend expert teams:", ne), L && (G([]), h.warning("专家团后端加载失败，请检查服务后重试"));
      }
    })(), zl().then((ne) => {
      L && ne && K(ne);
    }), () => {
      L = !1;
    };
  }, []);
  const U = l(() => {
    sn().then(G).catch((L) => {
      console.warn("[ugsci] Failed to refresh expert teams:", L), G([]), h.warning("专家团后端加载失败，请检查服务后重试");
    });
  }, [h]), $ = l(
    (L) => {
      Sl(L.id).then(() => {
        U(), h.success(`团队「${L.name}」已删除`);
      }).catch((ne) => h.error(ne.message || "删除专家团失败"));
    },
    [h, U]
  ), O = l((L) => {
    E(L), W(!0);
  }, []), z = l(() => {
    E(null), W(!0);
  }, []), w = n(() => [...F, ...j], [F, j]), le = n(() => {
    if (!R.trim()) return w;
    const L = R.toLowerCase();
    return w.filter(
      (ne) => ne.name.toLowerCase().includes(L) || ne.description.toLowerCase().includes(L) || ne.category.toLowerCase().includes(L)
    );
  }, [w, R]), oe = le.filter((L) => L.custom), B = le.filter((L) => !L.custom);
  return a.createElement(
    "div",
    null,
    // Toolbar
    a.createElement(
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
      a.createElement(c, {
        placeholder: "搜索团队名称、描述或类别...",
        prefix: _ ? a.createElement(_) : void 0,
        value: R,
        onChange: (L) => D(L.target.value),
        allowClear: !0,
        style: { flex: "1 1 280px", maxWidth: 400 }
      }),
      a.createElement(
        p,
        {
          type: "primary",
          size: "small",
          icon: x ? a.createElement(x) : void 0,
          onClick: z,
          style: Be
        },
        "创建专家团"
      )
    ),
    // Tabs: preset teams vs custom teams
    a.createElement(y, {
      activeKey: T,
      onChange: I,
      items: [
        {
          key: "preset",
          label: `预设团队${B.length ? ` (${B.length})` : ""}`,
          children: a.createElement(
            "div",
            null,
            B.length > 0 ? a.createElement(
              i,
              { gutter: [12, 12] },
              ...B.map(
                (L) => a.createElement(
                  o,
                  { key: L.id, xs: 24, sm: 12, md: 8 },
                  a.createElement(la, {
                    team: L,
                    agents: e,
                    onLaunch: t
                  })
                )
              )
            ) : a.createElement(d, {
              description: "未找到匹配的预设团队",
              image: d.PRESENTED_IMAGE_SIMPLE
            })
          )
        },
        {
          key: "custom",
          label: `自定义团队${oe.length ? ` (${oe.length})` : ""}`,
          children: a.createElement(
            "div",
            null,
            oe.length > 0 ? a.createElement(
              i,
              { gutter: [12, 12] },
              ...oe.map(
                (L) => a.createElement(
                  o,
                  { key: L.id, xs: 24, sm: 12, md: 8 },
                  a.createElement(la, {
                    team: L,
                    agents: e,
                    onLaunch: t,
                    onEdit: O,
                    onDelete: $
                  })
                )
              )
            ) : a.createElement(d, {
              description: "暂无自定义团队，点击「创建专家团」自定义",
              image: d.PRESENTED_IMAGE_SIMPLE
            })
          )
        },
        {
          key: "active",
          label: "进行中的讨论",
          children: a.createElement(
            a.Fragment,
            null,
            a.createElement(Ol, {
              enabled: T === "active"
            }),
            a.createElement(na, {
              activeOnly: !0,
              enabled: T === "active"
            })
          )
        },
        {
          key: "history",
          label: "讨论历史",
          children: a.createElement(na, {
            enabled: T === "history"
          })
        }
      ]
    }),
    // Team Builder Modal
    a.createElement(Ll, {
      open: X,
      onClose: () => {
        W(!1), E(null);
      },
      agents: e,
      editingTeam: b,
      onSaved: U
    })
  );
}
const Ul = [
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
], jl = 5e3, Nl = {
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
function Dl(e) {
  window.history.pushState({}, "", e), window.dispatchEvent(new PopStateEvent("popstate"));
}
function tn(e, t) {
  const a = new URLSearchParams();
  e && a.set("flow", e), t && a.set("run", t), Dl(`/flowforge${a.size ? `?${a.toString()}` : ""}`);
}
function Gl(e) {
  return e ? new Date(e * 1e3).toLocaleString("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  }) : "—";
}
function Fl(e) {
  if (!e || e <= 0) return "—";
  if (e < 1e3) return `${e}ms`;
  const t = Math.floor(e / 1e3);
  if (t < 60) return `${t}s`;
  const a = Math.floor(t / 60), n = t % 60;
  return `${a}m${n}s`;
}
function Wl(e) {
  if (!e) return "";
  const t = Object.keys(e).length;
  if (t === 0) return "";
  const a = Object.values(e).filter(
    (r) => r === "success" || r === "completed" || r === "skipped" || r === "cached"
  ).length, n = Object.values(e).filter(
    (r) => r === "error" || r === "failed"
  ).length;
  return n > 0 ? `${a}/${t} 节点完成 (${n} 失败)` : `${a}/${t} 节点完成`;
}
const zt = /* @__PURE__ */ new Set(["running", "queued", "paused", "waiting_human"]);
function Hl() {
  const e = A().React, { useCallback: t, useEffect: a, useRef: n, useState: r } = e, {
    Alert: l,
    Button: s,
    Card: i,
    Col: o,
    Empty: c,
    Input: d,
    Popconfirm: u,
    Row: m,
    Space: p,
    Spin: f,
    Tabs: y,
    Tag: h,
    Tooltip: _,
    Typography: x,
    message: S
  } = A().antd, {
    ApartmentOutlined: v,
    DeleteOutlined: R,
    ReloadOutlined: D,
    RocketOutlined: F,
    PlayCircleOutlined: G,
    StopOutlined: j
  } = A().antdIcons || {}, { Text: K, Paragraph: X, Title: W } = x, b = A().useSelectedAgent, E = b ? b() : { id: "default" }, T = (E == null ? void 0 : E.id) || "default", [I, U] = r([]), [$, O] = r([]), [z, w] = r([]), [le, oe] = r(!0), [B, L] = r(!0), [ne, Z] = r(null), [H, ue] = r(""), [M, se] = r(""), [me, Y] = r("templates"), [Q, ie] = r(/* @__PURE__ */ new Set()), he = n(null), we = $.some((C) => zt.has(C.status)), Ae = e.useMemo(() => {
    const C = {};
    return I.forEach((ae) => {
      C[ae.id] = ae.name;
    }), C;
  }, [I]), Se = e.useMemo(() => {
    const C = {};
    return $.forEach((ae) => {
      zt.has(ae.status) && (C[ae.flow_id] = (C[ae.flow_id] || 0) + 1);
    }), C;
  }, [$]), ee = t(async (C = !1) => {
    C || oe(!0);
    try {
      const [ae, pe, Ie] = await Promise.all([
        ce("/flowforge/flows", { bypassCache: !0 }),
        ce("/flowforge/runs", { bypassCache: !0 }),
        Jt().catch(() => [])
      ]);
      U(ae), O(pe), w(Ie), L(!0);
    } catch (ae) {
      console.warn("[ugsci] FlowForge is unavailable:", ae), L(!1);
    } finally {
      C || oe(!1);
    }
  }, []);
  a(() => {
    ee();
  }, [ee]), a(() => {
    if (!B || !we) {
      he.current && (clearTimeout(he.current), he.current = null);
      return;
    }
    return he.current = setTimeout(() => {
      ee(!0);
    }, jl), () => {
      he.current && (clearTimeout(he.current), he.current = null);
    };
  }, [we, B, ee]);
  const be = t(
    async (C) => {
      if (!ne) {
        Z(C.key);
        try {
          const ae = await ce(
            "/flowforge/generate",
            {
              method: "POST",
              body: JSON.stringify({
                prompt: C.sop,
                name: C.name,
                agent_id: T
              })
            }
          ), pe = {
            ...ae.nodes || {}
          }, Ie = Object.entries(pe).filter(([De]) => /^step_\d+$/.test(De)).sort(([De], [Te]) => Number(De.slice(5)) - Number(Te.slice(5))), Re = {};
          let Ne = 0, Le = 0;
          Ie.forEach(([De, Te], Me) => {
            const re = C.roleHints[Me] || "", ze = C.roleKeys[Me] || "analyst", $e = z.find(
              (Je) => `${Je.name} ${Je.id}`.toLowerCase().includes(re.toLowerCase())
            );
            $e ? Ne++ : Le++;
            const Oe = ($e == null ? void 0 : $e.id) || T, He = { ...Te.inputs || {} };
            He.agent_id = Oe, pe[De] = {
              ...Te,
              inputs: He,
              metadata: {
                ...Te.metadata || {},
                binding_policy: "fixed_instance",
                role_hint: re,
                role_key: ze,
                agent_id: Oe
              }
            }, Re[De] = {
              binding_policy: "fixed_instance",
              role_hint: re,
              role_key: ze,
              agent_id: Oe
            };
          });
          const Ge = {
            ...ae,
            nodes: pe,
            id: `${C.key}-${Date.now()}`,
            name: C.name,
            description: C.description,
            metadata: {
              ...ae.metadata || {},
              domain: "oil-gas",
              template_key: C.key,
              expert_binding_policy: "fixed_instance",
              controller_agent_id: T,
              node_bindings: Re
            }
          };
          await ce("/flowforge/flows", {
            method: "POST",
            body: JSON.stringify(Ge)
          });
          const et = Ie.length > 0 ? `（${Ne} 个专家已匹配，${Le} 个回退到控制器）` : "";
          S.success(`已创建工作流草稿「${C.name}」${et}`), await ee();
        } catch (ae) {
          S.error(ae.message || "创建工作流失败");
        } finally {
          Z(null);
        }
      }
    },
    [z, T, ne, ee, S]
  ), Ee = t(async () => {
    if (!ne) {
      if (!M.trim()) {
        S.warning("请先描述工作流步骤和控制要求");
        return;
      }
      Z("natural-language");
      try {
        const C = await ce(
          "/flowforge/generate",
          {
            method: "POST",
            body: JSON.stringify({
              prompt: M.trim(),
              name: H.trim(),
              agent_id: T
            })
          }
        ), ae = {
          ...C,
          id: `natural-${Date.now()}`,
          metadata: {
            ...C.metadata || {},
            domain: "oil-gas",
            source: "natural-language",
            expert_binding_policy: "fixed_instance",
            controller_agent_id: T
          }
        };
        await ce("/flowforge/flows", {
          method: "POST",
          body: JSON.stringify(ae)
        }), S.success("已从自然语言生成可编辑工作流草稿"), ue(""), se(""), await ee();
      } catch (C) {
        S.error(C.message || "自然语言生成失败");
      } finally {
        Z(null);
      }
    }
  }, [T, ne, ee, S, H, M]), te = t(
    async (C, ae) => {
      try {
        await ce(`/flowforge/flows/${encodeURIComponent(C)}/run`, {
          method: "POST",
          body: JSON.stringify({ inputs: {} })
        }), S.success(`已启动工作流「${ae}」`), await ee(!0);
      } catch (pe) {
        S.error(pe.message || "启动工作流失败");
      }
    },
    [ee, S]
  ), de = t(
    async (C, ae) => {
      try {
        await ce(`/flowforge/flows/${encodeURIComponent(C)}`, {
          method: "DELETE"
        }), S.success(`已删除工作流「${ae}」`), await ee();
      } catch (pe) {
        S.error(pe.message || "删除工作流失败");
      }
    },
    [ee, S]
  ), ge = t(
    async (C) => {
      ie((ae) => {
        const pe = new Set(ae);
        return pe.add(C), pe;
      });
      try {
        await ce(`/flowforge/runs/${encodeURIComponent(C)}/cancel`, {
          method: "POST"
        }), S.success("已请求取消运行"), await ee(!0);
      } catch (ae) {
        S.error(ae.message || "取消运行失败");
      } finally {
        ie((ae) => {
          const pe = new Set(ae);
          return pe.delete(C), pe;
        });
      }
    },
    [ee, S]
  ), q = e.createElement(
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
        p,
        { direction: "vertical", style: { width: "100%" }, size: 10 },
        e.createElement(d, {
          value: H,
          onChange: (C) => ue(C.target.value),
          placeholder: "工作流名称（可选）",
          maxLength: 80
        }),
        e.createElement(d.TextArea, {
          value: M,
          onChange: (C) => se(C.target.value),
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
      m,
      { gutter: [12, 12] },
      ...Ul.map(
        (C) => e.createElement(
          o,
          { key: C.key, xs: 24, md: 8 },
          e.createElement(
            i,
            { style: { height: "100%" } },
            e.createElement(
              p,
              { align: "start", style: { width: "100%" } },
              e.createElement("span", { style: { fontSize: 28 } }, C.icon),
              e.createElement(
                "div",
                { style: { flex: 1 } },
                e.createElement(W, { level: 5, style: { margin: 0 } }, C.name),
                e.createElement(h, { color: "blue", style: { marginTop: 6 } }, C.category),
                e.createElement(
                  X,
                  { type: "secondary", style: { margin: "10px 0 14px" } },
                  C.description
                ),
                e.createElement(
                  s,
                  {
                    type: "primary",
                    loading: ne === C.key,
                    disabled: !B || !!ne,
                    onClick: () => void be(C),
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
        m,
        { gutter: [12, 12] },
        ...[
          ["固定实例", "生产关键节点使用指定且已验证的专家实例", "当前可执行"],
          ["优先实例", "定义中记录首选实例和治理降级策略", "规划中"],
          ["模板派生", "由 OMP 控制节点按角色模板临时创建隔离角色", "规划中"],
          ["动态路由", "按能力、健康、权限和成本选择实例", "规划中"]
        ].map(
          ([C, ae, pe]) => e.createElement(
            o,
            { key: C, xs: 24, sm: 12, lg: 6 },
            e.createElement(K, { strong: !0 }, C),
            e.createElement(
              h,
              {
                color: pe === "当前可执行" ? "green" : "default",
                style: { marginLeft: 6, fontSize: 10 }
              },
              pe
            ),
            e.createElement("div", { style: { color: "var(--ant-color-text-tertiary, #8c8c8c)", fontSize: 12, marginTop: 4 } }, ae)
          )
        )
      )
    )
  ), k = le ? e.createElement(f) : I.length === 0 ? e.createElement(c, { description: "暂无工作流，可从模板创建" }) : e.createElement(
    m,
    { gutter: [12, 12] },
    ...I.map((C) => {
      const ae = Se[C.id] || 0;
      return e.createElement(
        o,
        { key: C.id, xs: 24, md: 12, xl: 8 },
        e.createElement(
          i,
          {
            size: "small",
            title: e.createElement(
              p,
              { size: 6 },
              e.createElement("span", null, C.name),
              ae > 0 ? e.createElement(
                h,
                { color: "blue" },
                `${ae} 个运行中`
              ) : null
            ),
            extra: e.createElement(h, null, `v${C.version}`)
          },
          e.createElement(X, { ellipsis: { rows: 2 } }, C.description || "暂无描述"),
          e.createElement(
            p,
            { size: 8, wrap: !0 },
            e.createElement(h, { color: "geekblue" }, `${C.node_count} 个节点`),
            e.createElement(s, {
              size: "small",
              type: "primary",
              icon: G ? e.createElement(G) : void 0,
              disabled: !B,
              onClick: () => void te(C.id, C.name)
            }, "运行"),
            e.createElement(s, {
              size: "small",
              onClick: () => tn(C.id)
            }, "编辑"),
            e.createElement(
              u,
              {
                title: "确认删除",
                description: `确定要删除工作流「${C.name}」吗？此操作不可撤销。`,
                onConfirm: () => void de(C.id, C.name),
                okText: "删除",
                cancelText: "取消",
                okButtonProps: { danger: !0 }
              },
              e.createElement(s, {
                size: "small",
                danger: !0,
                icon: R ? e.createElement(R) : void 0
              }, "删除")
            )
          )
        )
      );
    })
  ), fe = le ? e.createElement(f) : $.length === 0 ? e.createElement(c, { description: "暂无工作流运行记录" }) : e.createElement(
    "div",
    { style: { display: "flex", flexDirection: "column", gap: 8 } },
    ...$.map((C) => {
      const ae = Ae[C.flow_id] || C.flow_id, pe = zt.has(C.status), Ie = Wl(C.node_statuses), Re = C.duration_ms && C.duration_ms > 0 ? C.duration_ms : C.finished_at && C.started_at ? (C.finished_at - C.started_at) * 1e3 : pe && C.started_at ? (Date.now() / 1e3 - C.started_at) * 1e3 : 0;
      return e.createElement(
        i,
        { key: C.run_id, size: "small" },
        e.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" } },
          e.createElement(
            h,
            { color: Nl[C.status] || "default" },
            C.status
          ),
          e.createElement(K, { strong: !0 }, ae),
          e.createElement(
            _,
            { title: C.run_id },
            e.createElement(
              K,
              { type: "secondary", style: { fontFamily: "monospace", fontSize: 11 } },
              C.run_id.slice(0, 8) + "…"
            )
          ),
          e.createElement(
            K,
            { type: "secondary", style: { fontSize: 12 } },
            Gl(C.started_at)
          ),
          Re > 0 ? e.createElement(
            K,
            { type: "secondary", style: { fontSize: 12 } },
            `耗时 ${Fl(Re)}`
          ) : null,
          Ie ? e.createElement(h, { color: "geekblue", style: { fontSize: 11 } }, Ie) : null,
          C.error ? e.createElement(
            _,
            { title: C.error },
            e.createElement(K, { type: "danger", style: { fontSize: 12 } }, "（有错误）")
          ) : null,
          e.createElement(
            "div",
            { style: { marginLeft: "auto", display: "flex", gap: 6 } },
            pe ? e.createElement(
              u,
              {
                title: "确认取消运行？",
                onConfirm: () => void ge(C.run_id),
                okText: "取消运行",
                cancelText: "保留",
                okButtonProps: { danger: !0 }
              },
              e.createElement(s, {
                size: "small",
                danger: !0,
                loading: Q.has(C.run_id),
                icon: j ? e.createElement(j) : void 0
              }, "取消运行")
            ) : null,
            e.createElement(
              s,
              { size: "small", type: "link", onClick: () => tn(void 0, C.run_id) },
              "查看详情"
            )
          )
        )
      );
    })
  ), V = e.createElement(
    p,
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
        { key: "templates", label: "工作流模板", children: q },
        { key: "mine", label: `我的工作流 (${I.length})`, children: k },
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
              `·${$.filter((C) => zt.has(C.status)).length} 活跃`
            ) : null,
            ")"
          ),
          children: fe
        }
      ],
      activeKey: me,
      onChange: (C) => Y(C),
      tabBarExtraContent: V
    })
  );
}
function oa(e, t) {
  var r, l;
  const a = e.coordinatorName || ((r = e.members[0]) == null ? void 0 : r.name), n = e.members.find((s) => s.name === a) || e.members[0];
  if ((n == null ? void 0 : n.bindingMode) !== "temporary" && (n != null && n.agentId) && t.some((s) => s.id === n.agentId))
    return n.agentId;
  if (a && (n == null ? void 0 : n.bindingMode) !== "temporary") {
    const s = Da(t, a);
    if (s) return s;
  }
  return (n == null ? void 0 : n.bindingMode) === "fixed" ? null : ((l = t[0]) == null ? void 0 : l.id) || null;
}
function sa() {
  const e = new URLSearchParams(window.location.search).get("section");
  return e === "teams" || e === "workflows" ? e : "experts";
}
function Jl() {
  var de, ge;
  const e = A().React, { useState: t, useEffect: a, useCallback: n, useMemo: r } = e, {
    Spin: l,
    Empty: s,
    Input: i,
    Button: o,
    message: c,
    Row: d,
    Col: u,
    Tabs: m,
    Modal: p,
    Typography: f
  } = A().antd, {
    ReloadOutlined: y,
    PlusOutlined: h,
    SearchOutlined: _,
    TeamOutlined: x,
    UserOutlined: S
  } = A().antdIcons || {}, { Text: v, Paragraph: R } = f, [D, F] = t([]), [G, j] = t(!0), [K, X] = t(!1), [W, b] = t(null), [E, T] = t(""), [I, U] = t(!1), [$, O] = t(sa), [z, w] = t(
    null
  ), [le, oe] = t(""), [B, L] = t(!1), [ne, Z] = t(!1), [H, ue] = t(null), [M, se] = t([]), me = n(async () => {
    j(!0);
    try {
      const q = await Jt(), k = await Promise.all(
        q.map(async (fe) => {
          try {
            const [V, C, ae] = await Promise.all([
              yn(fe.id).catch(() => null),
              Vt(fe.id).catch(() => []),
              vn(fe.id).catch(() => [])
            ]);
            return {
              agent: fe,
              config: V,
              skills: C,
              mcps: ae,
              loading: !1
            };
          } catch {
            return {
              agent: fe,
              config: null,
              skills: [],
              mcps: [],
              loading: !1
            };
          }
        })
      );
      F(k), se(q);
    } catch (q) {
      c.error(q.message || "加载专家列表失败"), F([]);
    } finally {
      j(!1);
    }
  }, []);
  a(() => {
    me();
  }, [me]), a(() => {
    const q = () => O(sa());
    return window.addEventListener("popstate", q), () => window.removeEventListener("popstate", q);
  }, []), a(() => {
    if (H && ne) {
      const q = D.find(
        (k) => k.agent.id === H.agent.id
      );
      q && q !== H && ue(q);
    }
  }, [D, H, ne]);
  const Y = n(
    async (q) => {
      var C;
      const k = q.coordinatorName || ((C = q.members[0]) == null ? void 0 : C.name), fe = oa(q, M);
      if (!fe) {
        const ae = q.members.find(
          (pe) => pe.name === k
        );
        c.error(
          (ae == null ? void 0 : ae.bindingMode) === "fixed" ? `固定协调者「${k || "协调者"}」当前不可用，请修复绑定后再运行` : "没有可用的 Agent 作为工作流控制器"
        );
        return;
      }
      if (/\{.+?\}/.test(q.taskTemplate)) {
        oe(q.taskTemplate), w(q);
        return;
      }
      await Q(q, fe, q.taskTemplate);
    },
    [M, c]
  ), Q = n(
    async (q, k, fe) => {
      L(!0);
      try {
        const V = fe || q.taskTemplate, C = q.custom ? `@${q.id}` : q.name, ae = `/ugsci-team ${q.mode} ${C} ${V}`, pe = A();
        pe.setSelectedAgent && pe.setSelectedAgent(k);
        const Ie = await Cl(
          k,
          ae,
          q.name
        );
        c.success(
          `OMP 工作流已启动：${q.name}（${q.mode}模式）`
        ), w(null), ie(`/chat/${Ie}`);
      } catch (V) {
        c.error(V.message || "发起团队任务失败");
      } finally {
        L(!1);
      }
    },
    [c]
  ), ie = (q) => {
    window.history.pushState({}, "", q), window.dispatchEvent(new PopStateEvent("popstate"));
  }, he = n((q) => {
    b(q), X(!0);
  }, []), we = n((q) => {
    ue(q), Z(!0);
  }, []), Ae = n(
    (q) => {
      if (!q.agent.enabled) {
        c.warning(`专家「${q.agent.name}」未启用，请先启用`);
        return;
      }
      try {
        const k = A();
        k.setSelectedAgent && k.setSelectedAgent(q.agent.id);
      } catch (k) {
        console.warn("[ugsci] Failed to set selected agent:", k);
      }
      c.success(`已召唤专家「${q.agent.name}」，正在跳转至对话...`), ie("/chat");
    },
    [c]
  ), Se = r(() => {
    if (!E.trim()) return D;
    const q = E.toLowerCase();
    return D.filter(
      (k) => {
        var fe;
        return k.agent.name.toLowerCase().includes(q) || ((fe = k.agent.description) == null ? void 0 : fe.toLowerCase().includes(q)) || k.agent.id.toLowerCase().includes(q) || k.skills.some((V) => V.name.toLowerCase().includes(q));
      }
    );
  }, [D, E]), ee = D.filter((q) => q.agent.enabled).length, be = D.reduce(
    (q, k) => q + k.skills.filter((fe) => fe.enabled !== !1).length,
    0
  ), Ee = D.reduce((q, k) => q + k.mcps.length, 0), te = [
    {
      key: "experts",
      label: e.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        S ? e.createElement(S, { style: { fontSize: 14 } }) : null,
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
            prefix: _ ? e.createElement(_) : void 0,
            value: E,
            onChange: (q) => T(q.target.value),
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
        ) : Se.length === 0 ? e.createElement(s, {
          description: E ? "未找到匹配的专家" : "暂无专家，点击「创建专家」添加"
        }) : e.createElement(
          d,
          { gutter: [12, 12], align: "stretch" },
          ...Se.map(
            (q) => e.createElement(
              u,
              {
                key: q.agent.id,
                xs: 24,
                sm: 12,
                md: 8,
                lg: 6,
                style: { display: "flex" }
              },
              e.createElement(ul, {
                expert: q,
                onClick: () => he(q),
                onSummon: () => Ae(q),
                onConfigure: () => we(q)
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
        x ? e.createElement(x, { style: { fontSize: 14 } }) : null,
        "专家团"
      ),
      children: e.createElement(Bl, {
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
      children: e.createElement(Hl)
    }
  ];
  return e.createElement(
    "div",
    { style: { padding: 24 } },
    e.createElement(Ht, {
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
              St(), me();
            },
            loading: G
          },
          "刷新"
        ) : null
      )
    }),
    e.createElement(m, {
      items: te,
      activeKey: $,
      onChange: (q) => {
        O(q);
        const k = new URL(window.location.href);
        q === "experts" ? k.searchParams.delete("section") : k.searchParams.set("section", q), window.history.pushState({}, "", `${k.pathname}${k.search}`);
      }
    }),
    // Drawer
    e.createElement(pl, {
      expert: W,
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
    e.createElement(cl, {
      expert: H,
      open: ne,
      onClose: () => Z(!1),
      onRefresh: () => me()
    }),
    // Team Launch Modal (for filling placeholders)
    z ? e.createElement(
      p,
      {
        open: !0,
        title: e.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 8 } },
          e.createElement(wn, {
            members: z.members.map((q) => q.name),
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
          const q = oa(
            z,
            M
          );
          if (!q) {
            c.error("固定协调者不可用或没有可用的控制器 Agent");
            return;
          }
          const k = le.trim() || z.taskTemplate;
          Q(z, q, k);
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
          onChange: (q) => oe(q.target.value),
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
          `协调者: ${z.coordinatorName || ((ge = z.members[0]) == null ? void 0 : ge.name) || "—"} · 成员: ${z.members.map((q) => q.name).join("、")}`
        )
      )
    ) : null
  );
}
function Vl({
  agentId: e,
  agentName: t,
  refreshKey: a = 0,
  onNavigate: n
}) {
  const r = A().React, { useState: l, useEffect: s, useCallback: i } = r, {
    Spin: o,
    Empty: c,
    Button: d,
    Row: u,
    Col: m,
    Card: p,
    Tag: f,
    Checkbox: y,
    Modal: h,
    Typography: _,
    Drawer: x,
    Descriptions: S,
    message: v
  } = A().antd, {
    ReloadOutlined: R,
    ThunderboltOutlined: D,
    SettingOutlined: F,
    CheckSquareOutlined: G,
    EyeOutlined: j,
    EyeInvisibleOutlined: K,
    DeleteOutlined: X,
    CloseOutlined: W
  } = A().antdIcons || {}, { Text: b, Paragraph: E } = _, [T, I] = l([]), [U, $] = l(!0), [O, z] = l(!1), [w, le] = l(null), [oe, B] = l(!1), [L, ne] = l(
    /* @__PURE__ */ new Set()
  ), [Z, H] = l(!1), [ue, M] = l(null), [se, me] = l(!1), Y = i(async () => {
    if (e) {
      $(!0);
      try {
        const te = await Vt(e);
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
  }, [Y, a]);
  const Q = (te) => {
    ne((de) => {
      const ge = new Set(de);
      return ge.has(te) ? ge.delete(te) : ge.add(te), ge;
    });
  }, ie = () => ne(/* @__PURE__ */ new Set()), he = () => ne(new Set(T.map((te) => te.name))), we = () => {
    oe ? (ie(), B(!1)) : B(!0);
  }, Ae = async () => {
    const te = Array.from(L);
    if (te.length !== 0) {
      H(!0);
      try {
        const { results: de } = await Dr(e, te), ge = Object.entries(de).filter(
          ([, k]) => k.success === !1
        ), q = te.length - ge.length;
        ge.length > 0 ? v.warning(
          `批量启用完成：成功 ${q} 个，失败 ${ge.length} 个`
        ) : v.success(`成功启用 ${te.length} 个技能`), ie(), await Y();
      } catch (de) {
        v.error(de.message || "批量启用失败");
      } finally {
        H(!1);
      }
    }
  }, Se = async () => {
    const te = Array.from(L);
    if (te.length !== 0) {
      H(!0);
      try {
        const { results: de } = await Gr(e, te), ge = Object.entries(de).filter(
          ([, k]) => k.success === !1
        ), q = te.length - ge.length;
        ge.length > 0 ? v.warning(
          `批量停用完成：成功 ${q} 个，失败 ${ge.length} 个`
        ) : v.success(`成功停用 ${te.length} 个技能`), ie(), await Y();
      } catch (de) {
        v.error(de.message || "批量停用失败");
      } finally {
        H(!1);
      }
    }
  }, ee = () => {
    const te = Array.from(L);
    te.length !== 0 && h.confirm({
      title: `确认删除 ${te.length} 个技能？`,
      content: "删除后技能将从当前专家工作区移除，此操作不可撤销。技能池中的原始技能不受影响。",
      okText: "确认删除",
      cancelText: "取消",
      okButtonProps: { danger: !0 },
      onOk: async () => {
        H(!0);
        try {
          const { results: de } = await Fr(e, te), ge = Object.entries(de).filter(
            ([, k]) => k.success === !1
          ), q = te.length - ge.length;
          ge.length > 0 ? v.warning(
            `批量删除完成：成功 ${q} 个，失败 ${ge.length} 个`
          ) : v.success(`成功删除 ${te.length} 个技能`), ie(), await Y();
        } catch (de) {
          v.error(de.message || "批量删除失败");
        } finally {
          H(!1);
        }
      }
    });
  }, be = async (te) => {
    me(!0);
    try {
      te.enabled === !1 ? (await $a(e, te.name), v.success(`已启用技能「${te.name}」`)) : (await Oa(e, te.name), v.success(`已禁用技能「${te.name}」`)), await Y();
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
          marginBottom: 16,
          flexWrap: "wrap",
          gap: 8
        }
      },
      r.createElement(
        b,
        { type: "secondary", style: { fontSize: 13 } },
        oe ? `已选择 ${L.size} / ${T.length} 个技能` : `共 ${T.length} 个技能`
      ),
      r.createElement(
        "div",
        { style: { display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" } },
        oe ? r.createElement(
          r.Fragment,
          null,
          r.createElement(
            d,
            { size: "small", onClick: he },
            "全选"
          ),
          r.createElement(
            d,
            {
              size: "small",
              icon: W ? r.createElement(W) : void 0,
              onClick: ie
            },
            "取消选择"
          ),
          r.createElement(
            d,
            {
              size: "small",
              type: "default",
              icon: j ? r.createElement(j) : void 0,
              disabled: L.size === 0 || Z,
              loading: Z,
              onClick: Ae
            },
            "批量启用"
          ),
          r.createElement(
            d,
            {
              size: "small",
              danger: !0,
              icon: K ? r.createElement(K) : void 0,
              disabled: L.size === 0 || Z,
              loading: Z,
              onClick: Se
            },
            "批量停用"
          ),
          r.createElement(
            d,
            {
              size: "small",
              danger: !0,
              icon: X ? r.createElement(X) : void 0,
              disabled: L.size === 0 || Z,
              loading: Z,
              onClick: ee
            },
            `删除 (${L.size})`
          ),
          r.createElement(
            d,
            {
              size: "small",
              type: "primary",
              onClick: we
            },
            "退出批量"
          )
        ) : r.createElement(
          r.Fragment,
          null,
          r.createElement(
            d,
            {
              size: "small",
              icon: G ? r.createElement(G) : void 0,
              onClick: we,
              disabled: T.length === 0
            },
            "批量管理"
          ),
          r.createElement(
            d,
            {
              icon: R ? r.createElement(R) : void 0,
              onClick: () => {
                St(), Y();
              }
            },
            "刷新"
          )
        )
      )
    ),
    U ? r.createElement(
      "div",
      { style: { textAlign: "center", padding: 60 } },
      r.createElement(o, { size: "large" })
    ) : T.length === 0 ? r.createElement(c, {
      description: "当前智能体未加载任何技能"
    }) : r.createElement(
      u,
      { gutter: [12, 12] },
      ...T.map(
        (te) => r.createElement(
          m,
          { key: te.name, xs: 24, sm: 12, md: 8, lg: 6 },
          r.createElement(
            p,
            {
              hoverable: !0,
              size: "small",
              style: {
                cursor: oe ? "default" : "pointer",
                height: "100%",
                position: "relative",
                borderColor: oe && L.has(te.name) ? "#0072f5" : void 0,
                borderWidth: oe && L.has(te.name) ? 2 : 1
              },
              onClick: () => {
                oe ? Q(te.name) : (le(te), z(!0));
              },
              onMouseEnter: () => {
                oe || M(te.name);
              },
              onMouseLeave: () => M(null)
            },
            oe ? r.createElement(
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
              r.createElement(y, {
                checked: L.has(te.name)
              })
            ) : null,
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
              te.emoji ? r.createElement(
                "span",
                { style: { fontSize: 18 } },
                te.emoji
              ) : r.createElement(
                "span",
                { style: { fontSize: 18 } },
                "⚡"
              ),
              r.createElement(
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
              te.enabled === !1 ? r.createElement(
                f,
                { color: "default", style: { fontSize: 10 } },
                "已禁用"
              ) : r.createElement(
                f,
                { color: "green", style: { fontSize: 10 } },
                "已启用"
              )
            ),
            te.description ? r.createElement(
              E,
              {
                type: "secondary",
                style: { fontSize: 11, margin: 0, lineHeight: 1.4 },
                ellipsis: { rows: 2 }
              },
              te.description
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
              te.version_text ? r.createElement(
                f,
                { style: { fontSize: 10 } },
                `v${te.version_text}`
              ) : null,
              ...(te.tags || []).slice(0, 3).map(
                (de, ge) => r.createElement(
                  f,
                  { key: ge, color: "blue", style: { fontSize: 10 } },
                  de
                )
              )
            ),
            // Hover action footer (not in batch mode)
            !oe && ue === te.name ? r.createElement(
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
                d,
                {
                  size: "small",
                  type: "default",
                  icon: te.enabled === !1 ? j ? r.createElement(j) : void 0 : K ? r.createElement(K) : void 0,
                  disabled: se,
                  onClick: (de) => {
                    de.stopPropagation(), be(te);
                  }
                },
                te.enabled === !1 ? "启用" : "禁用"
              ),
              r.createElement(
                d,
                {
                  size: "small",
                  danger: !0,
                  icon: X ? r.createElement(X) : void 0,
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
    w ? r.createElement(
      x,
      {
        title: r.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 8 } },
          r.createElement(
            "span",
            { style: { fontSize: 18 } },
            w.emoji || "⚡"
          ),
          r.createElement("span", null, w.name)
        ),
        open: O,
        onClose: () => z(!1),
        width: 520,
        extra: r.createElement(
          d,
          {
            type: "primary",
            size: "small",
            icon: F ? r.createElement(F) : void 0,
            onClick: () => n("/skills")
          },
          "管理技能"
        )
      },
      r.createElement(
        S,
        { column: 1, bordered: !0, size: "small" },
        r.createElement(
          S.Item,
          { label: "技能名称" },
          w.name
        ),
        r.createElement(
          S.Item,
          { label: "描述" },
          w.description || "-"
        ),
        w.version_text ? r.createElement(
          S.Item,
          { label: "版本" },
          w.version_text
        ) : null,
        r.createElement(
          S.Item,
          { label: "来源" },
          w.source || "-"
        ),
        r.createElement(
          S.Item,
          { label: "状态" },
          w.enabled === !1 ? "已禁用" : "已启用"
        ),
        w.installed_from ? r.createElement(
          S.Item,
          { label: "安装来源" },
          w.installed_from
        ) : null
      ),
      // Tags
      w.tags && w.tags.length > 0 ? r.createElement(
        "div",
        { style: { marginTop: 16 } },
        r.createElement(
          b,
          {
            strong: !0,
            style: { display: "block", marginBottom: 8 }
          },
          "标签"
        ),
        r.createElement(
          "div",
          { style: { display: "flex", flexWrap: "wrap", gap: 4 } },
          ...w.tags.map(
            (te, de) => r.createElement(f, { key: de, color: "blue" }, te)
          )
        )
      ) : null,
      // Skill content preview
      w.content ? r.createElement(
        "div",
        { style: { marginTop: 16 } },
        r.createElement(
          b,
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
function ql({
  poolSkills: e,
  workspaceSkills: t,
  agents: a,
  loading: n,
  onReload: r,
  onSkillInstalled: l,
  agentId: s,
  agentName: i
}) {
  const o = A().React, { useState: c, useMemo: d, useCallback: u, useEffect: m, useRef: p } = o, {
    Spin: f,
    Empty: y,
    Input: h,
    Button: _,
    Row: x,
    Col: S,
    Card: v,
    Tag: R,
    Typography: D,
    Drawer: F,
    Descriptions: G,
    List: j,
    Modal: K,
    message: X
  } = A().antd, {
    ReloadOutlined: W,
    SearchOutlined: b,
    DownloadOutlined: E,
    ThunderboltOutlined: T,
    DeleteOutlined: I,
    PlusOutlined: U
  } = A().antdIcons || {}, { Text: $, Paragraph: O } = D, [z, w] = c(""), [le, oe] = c(!1), [B, L] = c(null), [ne, Z] = c([]), [H, ue] = c(!1), [M, se] = c(24), [me, Y] = c(null), [Q, ie] = c(!1), he = p(0), we = p(null), Ae = d(
    () => {
      var V;
      return new Set(
        ((V = t.find((C) => C.agent_id === s)) == null ? void 0 : V.skill_names) || []
      );
    },
    [t, s]
  ), Se = d(() => {
    if (!z.trim()) return e;
    const V = z.toLowerCase();
    return e.filter(
      (C) => {
        var ae, pe;
        return C.name.toLowerCase().includes(V) || ((ae = C.description) == null ? void 0 : ae.toLowerCase().includes(V)) || ((pe = C.tags) == null ? void 0 : pe.some((Ie) => Ie.toLowerCase().includes(V)));
      }
    );
  }, [e, z]), ee = d(
    () => Se.slice(0, M),
    [Se, M]
  );
  m(() => {
    if (ee.length >= Se.length) return;
    const V = we.current;
    if (!V) return;
    const C = () => {
      se(
        (pe) => Math.min(pe + 24, Se.length)
      );
    };
    if (typeof IntersectionObserver < "u") {
      const pe = new IntersectionObserver(
        (Ie) => {
          Ie.some((Re) => Re.isIntersecting) && C();
        },
        { rootMargin: "240px 0px" }
      );
      return pe.observe(V), () => pe.disconnect();
    }
    const ae = () => {
      V.getBoundingClientRect().top <= window.innerHeight + 240 && C();
    };
    return window.addEventListener("scroll", ae, { passive: !0 }), ae(), () => window.removeEventListener("scroll", ae);
  }, [Se.length, ee.length]);
  const be = u((V) => {
    w(V), se(24);
  }, []), Ee = u(() => {
    const V = he.current;
    requestAnimationFrame(() => {
      window.scrollTo({ top: V, behavior: "auto" }), document.scrollingElement && (document.scrollingElement.scrollTop = V);
    });
  }, []), te = u(async () => {
    var V;
    he.current = ((V = document.scrollingElement) == null ? void 0 : V.scrollTop) ?? window.scrollY ?? 0;
    try {
      await r();
    } finally {
      Ee();
    }
  }, [r, Ee]), de = u(
    (V) => {
      const C = [];
      for (const ae of t)
        if (ae.skill_names.includes(V)) {
          const pe = a.find((Ie) => Ie.id === ae.agent_id);
          C.push((pe == null ? void 0 : pe.name) || ae.agent_name || ae.agent_id);
        }
      return C;
    },
    [t, a]
  ), ge = u(
    async (V) => {
      if (L(V), Z(de(V.name)), oe(!0), !V.content) {
        ue(!0);
        try {
          const C = await Mr(V.name);
          L({ ...V, content: C });
        } catch {
        } finally {
          ue(!1);
        }
      }
    },
    [de]
  );
  m(() => {
    B && Z(de(B.name));
  }, [B, de, t]);
  const q = async (V) => {
    ie(!0);
    try {
      await hn(s, V.name), X.success(
        `已将技能「${V.name}」加载到当前专家「${i}」`
      ), l(V);
    } catch (C) {
      X.error(C.message || "加载技能失败");
    } finally {
      ie(!1);
    }
  }, k = (V) => {
    if (V.protected) {
      X.warning("内置技能不可删除");
      return;
    }
    K.confirm({
      title: `确认从技能池删除「${V.name}」？`,
      content: "删除后所有已安装此技能的专家将不受影响，但技能池中将不再包含此技能。此操作不可撤销。",
      okText: "确认删除",
      cancelText: "取消",
      okButtonProps: { danger: !0 },
      onOk: async () => {
        ie(!0);
        try {
          await Hr(V.name), X.success(`已从技能池删除「${V.name}」`), await te();
        } catch (C) {
          X.error(C.message || "删除失败");
        } finally {
          ie(!1);
        }
      }
    });
  }, fe = (V) => {
    window.history.pushState({}, "", V), window.dispatchEvent(new PopStateEvent("popstate"));
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
        onChange: (V) => be(V.target.value),
        allowClear: !0,
        style: { maxWidth: 400 }
      }),
      o.createElement(
        "div",
        { style: { display: "flex", gap: 8 } },
        o.createElement(
          _,
          {
            icon: W ? o.createElement(W) : void 0,
            onClick: te,
            loading: n,
            size: "small"
          },
          "刷新"
        ),
        o.createElement(
          _,
          {
            type: "primary",
            icon: E ? o.createElement(E) : void 0,
            onClick: () => fe("/skill-pool"),
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
    ) : Se.length === 0 ? o.createElement(y, {
      description: z ? "未找到匹配的技能" : "技能池为空"
    }) : o.createElement(
      o.Fragment,
      null,
      o.createElement(
        x,
        { gutter: [12, 12] },
        ...ee.map(
          (V) => o.createElement(
            S,
            { key: V.name, xs: 24, sm: 12, md: 8, lg: 6 },
            o.createElement(
              v,
              {
                hoverable: !0,
                size: "small",
                style: { cursor: "pointer", height: "100%" },
                onClick: () => ge(V),
                onMouseEnter: () => Y(V.name),
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
                V.emoji ? o.createElement(
                  "span",
                  { style: { fontSize: 18 } },
                  V.emoji
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
                  V.name
                ),
                V.protected ? o.createElement(
                  R,
                  { color: "gold", style: { fontSize: 10 } },
                  "内置"
                ) : null
              ),
              V.description ? o.createElement(
                O,
                {
                  type: "secondary",
                  style: { fontSize: 11, margin: 0, lineHeight: 1.4 },
                  ellipsis: { rows: 2 }
                },
                V.description
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
                V.version_text ? o.createElement(
                  R,
                  { style: { fontSize: 10 } },
                  `v${V.version_text}`
                ) : null,
                ...(V.tags || []).slice(0, 3).map(
                  (C, ae) => o.createElement(
                    R,
                    { key: ae, color: "cyan", style: { fontSize: 10 } },
                    C
                  )
                )
              ),
              // Hover action footer
              me === V.name ? o.createElement(
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
                  _,
                  {
                    size: "small",
                    type: "primary",
                    icon: U ? o.createElement(U) : void 0,
                    disabled: Q || Ae.has(V.name),
                    onClick: (C) => {
                      C.stopPropagation(), q(V);
                    }
                  },
                  Ae.has(V.name) ? "已加载" : "加载到当前Agent"
                ),
                o.createElement(
                  _,
                  {
                    size: "small",
                    danger: !0,
                    icon: I ? o.createElement(I) : void 0,
                    disabled: Q || V.protected,
                    onClick: (C) => {
                      C.stopPropagation(), k(V);
                    }
                  },
                  "删除"
                )
              ) : null
            )
          )
        ),
        // Infinite-scroll sentinel
        ee.length < Se.length ? o.createElement(
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
            `继续下滑自动加载 · 还剩 ${Se.length - ee.length} 个`
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
          _,
          {
            type: "primary",
            size: "small",
            icon: T ? o.createElement(T) : void 0,
            onClick: () => fe("/skills")
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
            (V, C) => o.createElement(R, { key: C, color: "cyan" }, V)
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
          renderItem: (V) => o.createElement(
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
              o.createElement(We, { name: V, size: 20 }),
              o.createElement(
                $,
                { style: { fontSize: 13 } },
                V
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
      H ? o.createElement(
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
function Kl({
  embedded: e = !1
} = {}) {
  const t = A().React, { useState: a, useEffect: n, useCallback: r, useMemo: l } = t, { Tabs: s, message: i } = A().antd, { ThunderboltOutlined: o, AppstoreOutlined: c } = A().antdIcons || {}, u = A().useSelectedAgent, m = u ? u() : null, p = (m == null ? void 0 : m.id) || "default";
  n(() => {
    fn();
  }, [p]);
  const [f, y] = a([]), [h, _] = a([]), [x, S] = a([]), [v, R] = a(!0), [D, F] = a("agent-skills"), [G, j] = a(0), K = r(async () => {
    R(!0);
    try {
      const [I, U, $] = await Promise.all([
        qt(!0),
        Jt(),
        Rr()
      ]);
      _(I), y(U), S($);
    } catch (I) {
      i.error(I.message || "加载技能列表失败"), _([]);
    } finally {
      R(!1);
    }
  }, []);
  n(() => {
    K();
  }, [K]);
  const X = l(() => {
    const I = f.find((U) => U.id === p);
    return (I == null ? void 0 : I.name) || p;
  }, [f, p]), W = r(
    (I) => {
      S(
        (U) => U.some(($) => $.agent_id === p) ? U.map(($) => $.agent_id !== p || $.skill_names.includes(I.name) ? $ : {
          ...$,
          skill_names: [...$.skill_names, I.name]
        }) : [
          ...U,
          {
            agent_id: p,
            agent_name: X,
            skill_names: [I.name]
          }
        ]
      ), j((U) => U + 1);
    },
    [p, X]
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
        agentId: p,
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
      children: t.createElement(ql, {
        poolSkills: h,
        workspaceSkills: x,
        agents: f,
        loading: v,
        onReload: K,
        onSkillInstalled: W,
        agentId: p,
        agentName: X
      })
    }
  ], T = t.createElement(s, {
    items: E,
    activeKey: D,
    onChange: (I) => F(I)
  });
  return e ? T : t.createElement(
    "div",
    { style: { padding: 24 } },
    t.createElement(Ht, {
      title: "技能",
      subtitle: `技能池共 ${h.length} 个技能 · 当前智能体：${X}`
    }),
    T
  );
}
const cn = {
  reservoir_simulation: "油藏数值模拟",
  geological_modeling: "地质建模",
  well_log_analysis: "测井分析",
  production_engineering: "采油工程",
  post_processing: "后处理与可视化",
  multiphysics: "多物理场仿真"
}, Wa = {
  reservoir_simulation: "🛢️",
  geological_modeling: "🏔️",
  well_log_analysis: "📡",
  production_engineering: "⚙️",
  post_processing: "📊",
  multiphysics: "🔬"
}, Ha = /* @__PURE__ */ new Set(["cmg", "comsol", "tnavigator", "eclipse", "intersect", "visage"]);
function Ja(e) {
  return Ft(`/ugsci/engines/icon/${encodeURIComponent(e)}`);
}
async function Xl() {
  return ce("/ugsci/engines/list");
}
async function Yl(e) {
  return ce("/ugsci/engines/", {
    method: "POST",
    body: JSON.stringify(e)
  });
}
async function Ql(e, t) {
  return ce(`/ugsci/engines/${encodeURIComponent(e)}`, {
    method: "PUT",
    body: JSON.stringify(t)
  });
}
async function Zl(e) {
  return ce(
    `/ugsci/engines/${encodeURIComponent(e)}`,
    { method: "DELETE" }
  );
}
async function eo() {
  return ce("/ugsci/engines/detect/refresh", {
    method: "POST"
  });
}
function to({
  engine: e,
  onClick: t
}) {
  const a = A().React, { Card: n, Tag: r, Typography: l } = A().antd, { Text: s } = l, i = e.status === "detected", o = Wa[e.category] || "📦", d = Ha.has(e.id) ? a.createElement("img", {
    src: Ja(e.id),
    alt: e.name,
    style: { width: 24, height: 24, objectFit: "contain" }
  }) : a.createElement("span", { style: { fontSize: 20 } }, o);
  return a.createElement(
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
        d,
        a.createElement(
          "div",
          null,
          a.createElement(
            s,
            { strong: !0, style: { fontSize: 14 } },
            e.name
          ),
          a.createElement("br"),
          a.createElement(
            s,
            { type: "secondary", style: { fontSize: 11 } },
            e.vendor || "—"
          )
        )
      ),
      a.createElement(
        "div",
        { style: { display: "flex", flexDirection: "column", gap: 4, alignItems: "flex-end" } },
        i ? a.createElement(
          r,
          { color: "success", style: { fontSize: 11 } },
          "✅ 已检测"
        ) : e.executable_path ? a.createElement(
          r,
          { color: "warning", style: { fontSize: 11 } },
          "⚠ 路径无效"
        ) : a.createElement(
          r,
          { style: { fontSize: 11 } },
          "🔧 待配置"
        ),
        e.is_default ? a.createElement(
          r,
          { color: "blue", style: { fontSize: 10 } },
          "默认"
        ) : e.is_custom ? a.createElement(
          r,
          { color: "purple", style: { fontSize: 10 } },
          "自定义"
        ) : null
      )
    ),
    a.createElement(
      "div",
      { style: { flex: 1, minHeight: 32 } },
      a.createElement(
        s,
        { type: "secondary", style: { fontSize: 12 } },
        e.description || "暂无描述"
      )
    ),
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
      e.category ? a.createElement(
        r,
        { style: { fontSize: 11 } },
        cn[e.category] || e.category
      ) : null,
      e.version ? a.createElement(
        r,
        { color: "blue", style: { fontSize: 11 } },
        `v${e.version}`
      ) : null,
      ...(e.modules || []).map(
        (u) => a.createElement(
          r,
          { key: u, color: "cyan", style: { fontSize: 10 } },
          u
        )
      )
    )
  );
}
function no() {
  const e = A().React, { useState: t, useEffect: a, useCallback: n, useMemo: r } = e, {
    Spin: l,
    Empty: s,
    Button: i,
    message: o,
    Row: c,
    Col: d,
    Drawer: u,
    Descriptions: m,
    Tag: p,
    Typography: f,
    Modal: y,
    Input: h,
    Select: _,
    Popconfirm: x,
    Space: S
  } = A().antd, {
    ReloadOutlined: v,
    SearchOutlined: R,
    PlusOutlined: D,
    EditOutlined: F,
    DeleteOutlined: G,
    CopyOutlined: j,
    ExperimentOutlined: K
  } = A().antdIcons || {}, { Text: X, Paragraph: W } = f, [b, E] = t([]), [T, I] = t(!0), [U, $] = t(""), [O, z] = t(!1), [w, le] = t(null), [oe, B] = t(!1), [L, ne] = t(null), [Z, H] = t({}), [ue, M] = t(!1), se = n(async () => {
    I(!0);
    try {
      const ee = await Xl();
      E(ee.engines || []);
    } catch (ee) {
      o.error(ee.message || "加载引擎列表失败"), E([]);
    } finally {
      I(!1);
    }
  }, []);
  a(() => {
    se();
  }, [se]);
  const me = r(() => {
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
    ne(null), H({
      name: "",
      vendor: "",
      version: "",
      executable_path: "",
      category: "",
      description: "",
      invocation_hint: ""
    }), B(!0);
  }, []), ie = n((ee) => {
    ne(ee), H({ ...ee }), B(!0), z(!1);
  }, []), he = n(async () => {
    var ee;
    if (!((ee = Z.name) != null && ee.trim())) {
      o.warning("请输入引擎名称");
      return;
    }
    M(!0);
    try {
      L ? (await Ql(L.id, Z), o.success("引擎已更新")) : (await Yl(Z), o.success("引擎已添加")), B(!1), se();
    } catch (be) {
      o.error(be.message || "保存失败");
    } finally {
      M(!1);
    }
  }, [Z, L, se]), we = n(
    async (ee) => {
      try {
        await Zl(ee), o.success("引擎已删除"), z(!1), se();
      } catch (be) {
        o.error(be.message || "删除失败");
      }
    },
    [se]
  ), Ae = n(async () => {
    I(!0);
    try {
      const ee = await eo();
      E(ee.engines || []), o.success("自动检测完成");
    } catch (ee) {
      o.error(ee.message || "检测失败");
    } finally {
      I(!1);
    }
  }, []), Se = n(
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
        Ee != null && Ee.select ? e.createElement(_, {
          value: te || void 0,
          onChange: (de) => H((ge) => ({ ...ge, [be]: de })),
          style: { width: "100%" },
          options: Ee.select.options,
          allowClear: !0,
          placeholder: `选择${ee}`
        }) : Ee != null && Ee.textarea ? e.createElement(h.TextArea, {
          value: te,
          onChange: (de) => H((ge) => ({ ...ge, [be]: de.target.value })),
          rows: 3,
          placeholder: `输入${ee}`
        }) : e.createElement(h, {
          value: te,
          onChange: (de) => H((ge) => ({ ...ge, [be]: de.target.value })),
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
        prefix: R ? e.createElement(R) : void 0,
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
          loading: T
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
    T ? e.createElement(
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
          e.createElement(to, {
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
            Ha.has(w.id) ? e.createElement("img", {
              src: Ja(w.id),
              alt: w.name,
              style: { width: 20, height: 20, objectFit: "contain" }
            }) : e.createElement(
              "span",
              { style: { fontSize: 18 } },
              Wa[w.category] || "📦"
            )
          ),
          e.createElement("span", null, w.name)
        ),
        open: O,
        onClose: () => z(!1),
        width: 520,
        extra: e.createElement(
          S,
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
            x,
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
        m,
        { column: 1, bordered: !0, size: "small" },
        e.createElement(
          m.Item,
          { label: "引擎名称" },
          w.name
        ),
        e.createElement(
          m.Item,
          { label: "厂商" },
          w.vendor || "—"
        ),
        e.createElement(
          m.Item,
          { label: "分类" },
          w.category ? cn[w.category] || w.category : "—"
        ),
        e.createElement(
          m.Item,
          { label: "状态" },
          e.createElement(
            p,
            {
              color: w.status === "detected" ? "success" : w.status === "not_found" ? "error" : "default"
            },
            w.status === "detected" ? "✅ 已检测" : w.status === "not_found" ? "❌ 路径无效" : "🔧 待配置"
          )
        ),
        e.createElement(
          m.Item,
          { label: "版本" },
          w.version || "—"
        ),
        w.executable_path ? e.createElement(
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
          m.Item,
          { label: "安装目录" },
          e.createElement(
            "code",
            { style: { fontSize: 12, wordBreak: "break-all" } },
            w.install_dir
          )
        ) : null,
        // Display detected modules with paths
        w.modules && w.modules.length > 0 ? e.createElement(
          m.Item,
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
                  p,
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
          m.Item,
          { label: "许可证服务器" },
          w.license_server
        ) : null,
        e.createElement(
          m.Item,
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
          p,
          { color: "blue" },
          "默认引擎"
        ) : w.is_custom ? e.createElement(
          p,
          { color: "purple" },
          "自定义引擎"
        ) : null
      )
    ) : null,
    // Add/Edit modal
    e.createElement(
      y,
      {
        title: L ? "编辑引擎" : "添加引擎",
        open: oe,
        onOk: he,
        onCancel: () => B(!1),
        okText: L ? "保存" : "添加",
        cancelText: "取消",
        confirmLoading: ue,
        width: 560
      },
      e.createElement(
        "div",
        { style: { maxHeight: 480, overflow: "auto", paddingRight: 8 } },
        Se("引擎名称 *", "name"),
        Se("厂商", "vendor"),
        Se("版本", "version"),
        Se("可执行文件路径", "executable_path"),
        Se("安装目录", "install_dir"),
        Se("分类", "category", {
          select: {
            options: Object.entries(cn).map(([ee, be]) => ({
              label: be,
              value: ee
            }))
          }
        }),
        Se("描述", "description", { textarea: !0 }),
        Se("调用方式提示", "invocation_hint", { textarea: !0 }),
        Se("许可证服务器", "license_server")
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
function ro(e = !1) {
  return ce(
    "/ugsci/domain-engines/neqsim/runtime",
    e ? { bypassCache: !0 } : void 0
  );
}
function lo() {
  return ce("/ugsci/domain-engines/neqsim/install", {
    method: "POST"
  });
}
function oo(e) {
  return ce(
    `/ugsci/domain-engines/neqsim/install/${encodeURIComponent(e)}`,
    { bypassCache: !0 }
  );
}
async function so(e, t = !1) {
  const a = await ce("/tools", {
    headers: { "X-Agent-Id": e },
    ...t ? { bypassCache: !0 } : {}
  }) || [];
  return new Map(a.map((n) => [n.name, n]));
}
async function io(e, t = !1) {
  const a = /* @__PURE__ */ new Map(), n = {
    headers: { "X-Agent-Id": e },
    ...t ? { bypassCache: !0 } : {}
  };
  let r;
  try {
    r = await ce(
      "/mcp",
      n
    ) || [];
  } catch {
    return a;
  }
  for (const l of r) {
    const s = l.key;
    if (!l.enabled) {
      a.set(s, { key: s, enabled: !1, toolCount: 0, error: null });
      continue;
    }
    try {
      const i = await ce(
        `/mcp/tools/${encodeURIComponent(s)}`,
        n
      ) || [];
      a.set(s, {
        key: s,
        enabled: !0,
        toolCount: i.filter((o) => o.enabled).length,
        error: null
      });
    } catch (i) {
      a.set(s, {
        key: s,
        enabled: !0,
        toolCount: 0,
        error: i instanceof Error ? i.message : "Tool query failed"
      });
    }
  }
  return a;
}
function ia(e) {
  return e ? e.overall === "available" ? "available" : e.overall === "unavailable" ? "unavailable" : "unknown" : "unknown";
}
function ca(e) {
  return e ? e.enabled ? e.error ? "error" : e.toolCount > 0 ? "available" : "error" : "unconfigured" : "unavailable";
}
function co(e, t = null, a = /* @__PURE__ */ new Map()) {
  const n = e.engine, r = e.dependency_status;
  let l, s, i;
  if (n.provider.kind === "driver")
    r.overall === "unavailable" ? l = "needs_install" : l = ca(t), s = (t == null ? void 0 : t.toolCount) ?? 0, i = (t == null ? void 0 : t.key) ?? n.provider.id;
  else if (n.source === "builtin") {
    const o = ia(r), c = n.operations.flatMap((m) => m.tool_names), d = c.filter((m) => a.has(m)), u = d.filter(
      (m) => {
        var p;
        return (p = a.get(m)) == null ? void 0 : p.enabled;
      }
    );
    o !== "available" ? l = o : d.length !== c.length ? l = "error" : u.length === 0 ? l = "unconfigured" : l = "available", s = u.length, i = null;
  } else n.source === "mcp" ? (l = ca(t), s = (t == null ? void 0 : t.toolCount) ?? 0, i = (t == null ? void 0 : t.key) ?? n.provider.id) : (l = ia(r), s = 0, i = null);
  return {
    definition: n,
    dependencyStatus: r,
    checkedAt: e.checked_at,
    effectiveStatus: l,
    discoveredToolCount: s,
    mcpProviderKey: i
  };
}
function mo(e) {
  const t = /* @__PURE__ */ new Map();
  for (const a of e) {
    const n = a.definition.domain;
    t.has(n) || t.set(n, []), t.get(n).push(a);
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
}, uo = {
  geology_well_logging: "📡",
  production_engineering: "⚙️",
  fluid_thermodynamics: "🧪",
  scientific_computing: "🧮",
  data_modeling: "📊"
}, po = {
  builtin: "内置",
  mcp: "MCP",
  library: "计算库"
}, go = {
  deterministic: "确定性",
  stochastic: "随机/概率",
  external: "外部 Provider",
  visualization: "可视化"
}, fo = {
  deterministic: "green",
  stochastic: "purple",
  external: "blue",
  visualization: "cyan"
};
function yo({
  view: e,
  onClick: t
}) {
  const a = A().React, { Card: n, Tag: r, Typography: l } = A().antd, { Text: s } = l, i = e.definition, o = uo[i.domain] || "📦", c = e.effectiveStatus, d = i.operations.length, u = e.discoveredToolCount;
  return a.createElement(
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
        a.createElement("span", { style: { fontSize: 20 } }, o),
        a.createElement(
          "div",
          null,
          a.createElement(
            s,
            { strong: !0, style: { fontSize: 14 } },
            i.name
          ),
          a.createElement("br"),
          a.createElement(
            s,
            { type: "secondary", style: { fontSize: 11 } },
            i.provider.kind === "driver" ? "内置 · MCP" : po[i.source] || i.source
          )
        )
      ),
      a.createElement(
        r,
        { color: mn[c] || "default", style: { fontSize: 11 } },
        dn[c] || c
      )
    ),
    a.createElement(
      "div",
      { style: { flex: 1, minHeight: 32 } },
      a.createElement(
        s,
        { type: "secondary", style: { fontSize: 12 } },
        i.description
      )
    ),
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
      a.createElement(
        r,
        { style: { fontSize: 11 } },
        `${d} 操作`
      ),
      a.createElement(
        r,
        {
          color: fo[i.execution_class] || "default",
          style: { fontSize: 11 }
        },
        go[i.execution_class] || i.execution_class
      ),
      u > 0 ? a.createElement(
        r,
        { color: "blue", style: { fontSize: 11 } },
        `${u} 工具`
      ) : null,
      ...(i.tags || []).map(
        (m) => a.createElement(
          r,
          { key: m, color: "cyan", style: { fontSize: 10 } },
          m
        )
      )
    )
  );
}
function ho({
  view: e,
  open: t,
  onClose: a,
  onNavigateToMcp: n,
  onNavigateToTools: r,
  onNavigateToSkills: l,
  onInstallNeqsim: s,
  neqsimInstallState: i
}) {
  const o = A().React, { Drawer: c, Descriptions: d, Tag: u, Typography: m, Button: p, Space: f, Divider: y } = A().antd, { Text: h, Paragraph: _ } = m;
  if (!e) return null;
  const x = e.definition, S = e.dependencyStatus;
  return o.createElement(
    c,
    {
      title: o.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 8 } },
        o.createElement("span", null, x.name),
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
      onClose: a,
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
        x.domain
      ),
      o.createElement(
        d.Item,
        { label: "来源" },
        x.provider.kind === "driver" ? "内置能力 · MCP Driver" : x.source === "builtin" ? "内置工具" : x.source === "mcp" ? "MCP 服务" : "科学计算库 / 技能"
      ),
      o.createElement(
        d.Item,
        { label: "实现" },
        `${x.provider.kind}:${x.provider.id}`
      ),
      o.createElement(
        d.Item,
        { label: "计算类别" },
        x.execution_class === "deterministic" ? "确定性计算" : x.execution_class === "stochastic" ? "随机/概率计算" : x.execution_class === "external" ? "外部 Provider" : "可视化"
      ),
      o.createElement(
        d.Item,
        { label: "内核版本" },
        x.engine_version
      ),
      o.createElement(
        d.Item,
        { label: "描述" },
        x.description
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
    ...x.operations.map(
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
            (R) => o.createElement(
              u,
              { key: R, color: "blue", style: { fontSize: 10 } },
              R
            )
          )
        ) : null
      )
    ),
    // Dependencies
    o.createElement(y, null),
    o.createElement(h, { strong: !0 }, "实现与依赖"),
    S && S.dependencies.length > 0 ? o.createElement(
      "div",
      { style: { marginTop: 8 } },
      ...S.dependencies.map(
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
      _,
      { type: "secondary", style: { fontSize: 12 } },
      "无外部依赖"
    ),
    // Actions
    o.createElement(y, null),
    o.createElement(h, { strong: !0 }, "问题处理"),
    o.createElement(
      "div",
      { style: { marginTop: 8, display: "flex", gap: 8, flexWrap: "wrap" } },
      x.id === "neqsim" && e.effectiveStatus === "needs_install" ? o.createElement(
        p,
        {
          size: "small",
          type: "primary",
          loading: (i == null ? void 0 : i.status) === "queued" || (i == null ? void 0 : i.status) === "running",
          onClick: s
        },
        (i == null ? void 0 : i.status) === "running" ? `${i.message} (${i.progress}%)` : "安装 NeqSim 运行环境"
      ) : null,
      x.provider.kind === "driver" ? o.createElement(
        p,
        { size: "small", onClick: n },
        "查看内置 MCP Driver"
      ) : x.source === "library" ? o.createElement(
        p,
        { size: "small", onClick: l },
        "查看相关技能"
      ) : o.createElement(
        p,
        { size: "small", onClick: () => r("builtin") },
        "查看内置工具"
      )
    ),
    x.id === "neqsim" && (i == null ? void 0 : i.status) === "failed" ? o.createElement(
      _,
      { type: "danger", style: { marginTop: 8, fontSize: 12 } },
      i.error || "安装失败"
    ) : null,
    x.id === "neqsim" && (i != null && i.warning) ? o.createElement(
      _,
      { type: "warning", style: { marginTop: 8, fontSize: 12 } },
      i.warning
    ) : null
  );
}
const Eo = {
  geology_well_logging: "测井地质",
  production_engineering: "采油工程",
  fluid_thermodynamics: "流体热力学",
  scientific_computing: "科学计算",
  data_modeling: "数据建模"
};
function vo(e) {
  return e instanceof Error ? /Install task not found|HTTP 404/i.test(e.message) : !1;
}
function bo({
  onNavigateToMcp: e,
  onNavigateToTools: t,
  onNavigateToSkills: a
} = {}) {
  var se, me;
  const n = A().React, { useState: r, useEffect: l, useCallback: s, useMemo: i, useRef: o } = n, {
    Spin: c,
    Empty: d,
    Button: u,
    message: m,
    Row: p,
    Col: f,
    Input: y,
    Drawer: h,
    Typography: _
  } = A().antd, { ReloadOutlined: x, SearchOutlined: S } = A().antdIcons || {}, { Text: v } = _, R = (me = (se = A()).useSelectedAgent) == null ? void 0 : me.call(se), D = (R == null ? void 0 : R.id) || "default", [F, G] = r([]), [j, K] = r(!0), [X, W] = r(""), [b, E] = r(!1), [T, I] = r(null), [U, $] = r(null), O = o(D);
  O.current = D;
  const z = o(T);
  z.current = T;
  const w = o(0);
  l(() => () => {
    w.current += 1;
  }, []);
  const le = s(
    async (Y = !1, Q = !1) => {
      var Ae, Se;
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
          io(we, Y),
          so(we, Y)
        ]);
        if (we !== O.current) return;
        const te = [];
        for (const ge of ee)
          try {
            let q = null;
            if (ge.engine.provider.kind === "driver") {
              const k = ge.engine.provider.id;
              q = be.get(k) || null;
            }
            te.push(co(ge, q, Ee));
          } catch {
          }
        G(te);
        const de = (Se = z.current) == null ? void 0 : Se.definition.id;
        if (de) {
          const ge = te.find(
            (q) => q.definition.id === de
          );
          ge && (z.current = ge, I(ge));
        }
        he();
      } catch (ee) {
        const be = ee instanceof Error ? ee.message : "加载领域引擎失败";
        m.error(be), Q || G([]);
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
    () => mo(oe),
    [oe]
  ), L = s(() => {
    le(!0);
  }, [le]), ne = s((Y) => {
    z.current = Y, I(Y), E(!0);
  }, []), Z = s(() => {
    E(!1), e == null || e();
  }, [e]), H = s(
    (Y) => {
      E(!1), t == null || t(Y);
    },
    [t]
  ), ue = s(() => {
    E(!1), a == null || a();
  }, [a]), M = s(async () => {
    const Y = ++w.current, Q = () => Y === w.current;
    try {
      let ie = await lo();
      if (!Q()) return;
      for ($(ie); ie.status === "queued" || ie.status === "running"; ) {
        if (await new Promise((he) => setTimeout(he, 1e3)), !Q()) return;
        try {
          ie = await oo(ie.id);
        } catch (he) {
          if (!vo(he)) throw he;
          const we = await ro(!0);
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
      ie.status === "completed" ? (ie.warning ? m.warning(ie.warning) : m.success("NeqSim 运行环境已安装并启用"), await le(!0, !0)) : m.error(ie.error || "NeqSim 安装失败");
    } catch (ie) {
      if (!Q()) return;
      m.error(ie instanceof Error ? ie.message : "NeqSim 安装失败");
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
        prefix: S ? n.createElement(S) : void 0,
        value: X,
        onChange: (Y) => W(Y.target.value),
        allowClear: !0,
        style: { maxWidth: 280 }
      }),
      n.createElement(
        u,
        {
          icon: x ? n.createElement(x) : void 0,
          onClick: L,
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
            Eo[Y] || Y
          ),
          n.createElement(
            p,
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
                n.createElement(yo, {
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
    n.createElement(ho, {
      view: T,
      open: b,
      onClose: () => E(!1),
      onNavigateToMcp: Z,
      onNavigateToTools: H,
      onNavigateToSkills: ue,
      onInstallNeqsim: M,
      neqsimInstallState: U
    })
  );
}
const wo = Kl, Va = /* @__PURE__ */ new Set(["tools", "engines", "skills"]);
function So(e) {
  try {
    const t = new URLSearchParams(window.location.search).get("tab");
    return t && Va.has(t) ? t : e;
  } catch {
    return e;
  }
}
function da(e) {
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
  const t = A().React, { useEffect: a, useState: n } = t, { Alert: r, Spin: l } = A().antd, [s, i] = n(null), [o, c] = n("");
  if (a(() => {
    let u = !0;
    const m = A().loadBuiltinPage;
    return i(null), m ? (c(""), m(e).then((p) => {
      u && i(() => p);
    }).catch((p) => {
      u && c(
        p instanceof Error ? p.message : "加载原生管理页面失败"
      );
    }), () => {
      u = !1;
    }) : (c("当前 QwenPaw 版本不支持原生页面嵌入"), () => {
      u = !1;
    });
  }, [e]), o)
    return t.createElement(r, {
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
function xo({
  activeSubTab: e,
  onSubTabChange: t
}) {
  const a = A().React, { Tabs: n } = A().antd;
  return a.createElement(n, {
    activeKey: e,
    onChange: t,
    items: [
      {
        key: "mcp",
        label: "MCP 接入",
        children: a.createElement(un, { page: "mcp" })
      },
      {
        key: "builtin",
        label: "平台内置",
        children: a.createElement(un, { page: "tools" })
      }
    ]
  });
}
function ko({
  onNavigateToMcp: e,
  onNavigateToTools: t,
  onNavigateToSkills: a
} = {}) {
  const n = A().React, { Tabs: r } = A().antd;
  return n.createElement(r, {
    defaultActiveKey: "simulation",
    items: [
      {
        key: "simulation",
        label: "仿真软件",
        children: n.createElement(no)
      },
      {
        key: "domain",
        label: "领域计算",
        children: n.createElement(
          bo,
          {
            onNavigateToMcp: e,
            onNavigateToTools: t,
            onNavigateToSkills: a
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
function qa({
  initialTab: e = "engines"
} = {}) {
  var _, x;
  const t = A().React, { useEffect: a, useState: n } = t, { Tabs: r, Tag: l } = A().antd, { RocketOutlined: s, ToolOutlined: i, ThunderboltOutlined: o } = A().antdIcons || {}, c = (x = (_ = A()).useSelectedAgent) == null ? void 0 : x.call(_), d = (c == null ? void 0 : c.id) || "default", [u, m] = n(
    () => So(e)
  ), [p, f] = n("mcp");
  a(() => {
    try {
      const S = new URLSearchParams(window.location.search).get("tab");
      S && !Va.has(S) && da(u);
    } catch {
    }
  }, [u]);
  const y = (S) => {
    m(S), da(S);
  }, h = (S, v) => t.createElement(
    "span",
    { style: { display: "inline-flex", alignItems: "center", gap: 6 } },
    v ? t.createElement(v, { style: { fontSize: 14 } }) : null,
    S
  );
  return t.createElement(
    "div",
    { style: { padding: 24 } },
    t.createElement(Ht, {
      title: "工具·技能",
      subtitle: "管理当前专家可调用的引擎、工具、运行服务与专业技能",
      extra: t.createElement(
        l,
        { color: "blue" },
        `当前专家：${d}`
      )
    }),
    t.createElement(r, {
      activeKey: u,
      onChange: (S) => y(S),
      items: [
        {
          key: "engines",
          label: h("引擎", s),
          children: t.createElement(
            ko,
            {
              onNavigateToMcp: () => {
                f("mcp"), y("tools");
              },
              onNavigateToTools: (S) => {
                f(S || "mcp"), y("tools");
              },
              onNavigateToSkills: () => y("skills")
            }
          )
        },
        {
          key: "tools",
          label: h("工具", i),
          children: t.createElement(xo, {
            activeSubTab: p,
            onSubTabChange: f
          })
        },
        {
          key: "skills",
          label: h("技能", o),
          children: t.createElement(wo, {
            embedded: !0
          })
        }
      ]
    })
  );
}
const Ka = qa;
function Co() {
  return A().React.createElement(Ka, {
    initialTab: "tools"
  });
}
function To() {
  return A().React.createElement(Ka, {
    initialTab: "skills"
  });
}
const ma = {
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
function _o(e) {
  if (!e.env) return !1;
  const t = Object.entries(e.env);
  return t.length === 0 ? !1 : t.some(([, a]) => typeof a == "string" && a.length > 0);
}
const Rt = "ugsci.market.githubSources", ua = "https://github.com/anthropics/skills/tree/main/skills", Xa = "https://ugsci-awesome-tools.oss-cn-beijing.aliyuncs.com", Io = `${Xa}/skills`;
function zo(e) {
  const t = e.replace(/^\/+/, "");
  return Ft(`/plugins/oss-proxy?path=${encodeURIComponent(t)}`);
}
function Ut(e) {
  const t = e.replace(/^\/+/, "");
  return qe(`/plugins/oss-proxy?path=${encodeURIComponent(t)}`);
}
async function xn(e) {
  const t = e.replace(/^\/+/, ""), a = await Ut(t);
  if (!a.ok)
    throw new Error(`OSS fetch failed (${a.status}): ${t}`);
  return await a.json();
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
function Ao(e) {
  var r, l;
  const t = {};
  if (e.env && e.env.length > 0)
    for (const s of e.env)
      t[s] = `your-${s.toLowerCase().replace(/_/g, "-")}`;
  let a = "🔌";
  const n = (e.icon || "").toLowerCase();
  return n.includes("folder") ? a = "📁" : n.includes("git") ? a = "🌿" : n.includes("github") ? a = "🐙" : n.includes("database") || n.includes("postgres") || n.includes("sqlite") ? a = "🗄️" : n.includes("search") || n.includes("brave") ? a = "🔍" : n.includes("browser") || n.includes("puppeteer") ? a = "🎭" : n.includes("memory") || n.includes("brain") ? a = "🧠" : n.includes("file") || n.includes("fetch") ? a = "🌐" : n.includes("slack") ? a = "💬" : n.includes("google") ? a = "📁" : n.includes("notion") ? a = "📝" : n.includes("jupyter") ? a = "📊" : n.includes("science") || n.includes("flask") ? a = "🔬" : n.includes("book") || n.includes("arxiv") ? a = "📚" : n.includes("patent") && (a = "📜"), {
    id: e.id,
    name: e.name,
    emoji: a,
    iconUrl: e.icon_url ? zo(e.icon_url) : void 0,
    category: e.category ? ct(e.category) : "",
    description: e.description,
    transport: e.transport || "stdio",
    command: ((r = e.config) == null ? void 0 : r.command) || "",
    args: ((l = e.config) == null ? void 0 : l.args) || [],
    env: Object.keys(t).length > 0 ? t : void 0
  };
}
const Ya = "ugsci.market.mcpSources", Qa = "ugsci.market.expertSources";
function Za(e, t) {
  try {
    const a = localStorage.getItem(e);
    if (!a) return [];
    const n = JSON.parse(a);
    return Array.isArray(n) ? n.filter(
      (r) => r && typeof r.id == "string" && typeof r.label == "string" && typeof r.url == "string"
    ).map((r) => ({
      id: r.id,
      label: r.label,
      url: r.url,
      enabled: r.enabled !== !1,
      type: t
    })) : [];
  } catch {
    return [];
  }
}
function er(e, t) {
  try {
    localStorage.setItem(e, JSON.stringify(t));
  } catch {
  }
}
function $o() {
  return Za(Ya, "mcp");
}
function At(e) {
  er(Ya, e);
}
function Po() {
  return Za(Qa, "expert");
}
function $t(e) {
  er(Qa, e);
}
function tr(e) {
  try {
    const t = new URL(e.trim()), a = t.hostname.toLowerCase();
    let n;
    if (a === "github.com" || a === "www.github.com")
      n = "github";
    else if (a === "gitee.com" || a === "www.gitee.com")
      n = "gitee";
    else
      return null;
    const r = t.pathname.split("/").filter((c) => c.length > 0);
    if (r.length < 2) return null;
    const l = decodeURIComponent(r[0]), s = decodeURIComponent(r[1]);
    let i = "main", o = "";
    return r.length >= 4 && (r[2] === "tree" || r[2] === "blob") ? (i = decodeURIComponent(r[3]), r.length > 4 && (o = r.slice(4).map(decodeURIComponent).join("/"))) : r.length > 2 && (o = r.slice(2).map(decodeURIComponent).join("/")), o = o.replace(/\/+$/, "").replace(/^\/+/, ""), {
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
function nr(e, t, a, n = "github") {
  return n === "oss" ? `oss:${e}/${a || "/"}` : `${n}:${e}/${t}:${a || "/"}`;
}
function Oo(e) {
  try {
    const t = new URL(e.trim()), a = t.hostname.toLowerCase(), n = a.match(
      /^([a-z0-9][a-z0-9-]{1,61}[a-z0-9])\.oss-([a-z0-9-]+)\.aliyuncs\.com$/
    );
    if (!n) return null;
    const r = n[1], l = `${t.protocol}//${a}`, s = decodeURIComponent(t.pathname).replace(/^\/+/, "").replace(/\/+$/, "");
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
function Mo() {
  try {
    const e = localStorage.getItem(Rt);
    if (!e) {
      const n = [], r = tr(ua);
      return r && n.push({
        id: nr(
          r.owner,
          r.repo,
          r.skillsPath,
          r.platform
        ),
        url: ua,
        label: r.label,
        owner: r.owner,
        repo: r.repo,
        ref: r.ref,
        skillsPath: r.skillsPath,
        enabled: !1,
        platform: r.platform
      }), localStorage.setItem(Rt, JSON.stringify(n)), n;
    }
    const t = JSON.parse(e);
    if (!Array.isArray(t)) return [];
    const a = t.filter(
      (n) => n && typeof n.id == "string" && (typeof n.owner == "string" || n.platform === "oss") && !(n.platform === "oss" && n.url === Io)
    ).map((n) => ({
      ...n,
      platform: n.platform || "github",
      owner: n.owner || "",
      repo: n.repo || "",
      ref: n.ref || "",
      skillsPath: n.skillsPath || ""
    }));
    return a.length !== t.length && localStorage.setItem(
      Rt,
      JSON.stringify(a)
    ), a;
  } catch {
    return [];
  }
}
function Pt(e) {
  try {
    localStorage.setItem(
      Rt,
      JSON.stringify(e)
    );
  } catch {
  }
}
function Ro(e) {
  const t = e.match(/^---\s*\n([\s\S]*?)\n---/);
  if (!t) return {};
  const a = t[1], n = {}, r = a.split(`
`);
  let l = "";
  for (const s of r) {
    const i = s.match(/^(\w[\w-]*)\s*:\s*(.*)$/);
    if (i) {
      l = i[1];
      let o = i[2].trim();
      (o.startsWith('"') && o.endsWith('"') || o.startsWith("'") && o.endsWith("'")) && (o = o.slice(1, -1)), l === "name" ? n.name = o : l === "description" ? n.description = o : l === "version" ? n.version = o : l === "author" && (n.author = o);
    }
  }
  return n;
}
async function Lo(e) {
  const t = e.platform === "gitee", a = e.skillsPath ? encodeURIComponent(e.skillsPath).replace(/%2F/g, "/") : "", n = t ? `https://gitee.com/api/v5/repos/${e.owner}/${e.repo}/contents/${a}?ref=${encodeURIComponent(e.ref)}` : `https://api.github.com/repos/${e.owner}/${e.repo}/contents/${a}?ref=${encodeURIComponent(e.ref)}`, r = {
    Accept: t ? "application/json" : "application/vnd.github+json"
  };
  t && e.accessToken && (r.Authorization = `token ${e.accessToken}`);
  const l = await fetch(n, {
    headers: r
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
        const f = {};
        t && e.accessToken && (f.Authorization = `token ${e.accessToken}`);
        const y = await fetch(u, {
          headers: f
        });
        if (!y.ok) return p;
        const h = await y.text(), _ = Ro(h);
        return {
          ...p,
          name: _.name || c.name,
          description: _.description || "",
          version: _.version || null,
          author: _.author || null
        };
      } catch {
        return p;
      }
    })
  );
}
async function Bo(e) {
  const t = Oo(e.url);
  if (!t)
    throw new Error(`Invalid OSS URL: ${e.url}`);
  const { endpoint: a, prefix: n } = t, r = n.split("/").map(encodeURIComponent).join("/"), l = await Ut(
    `${r}/manifest.json`
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
    for (const m of d) {
      if (m.type === "collection" && Array.isArray(m.children)) {
        c(m.children, m.name);
        continue;
      }
      const p = m.path || m.name || "";
      if (!p) continue;
      const f = p.split("/").map(encodeURIComponent).join("/"), y = `${a}/${r}/${f}`;
      let h = null;
      if (m.metadata) {
        const x = m.metadata.match(/version:\s*"?([\d.]+)"?/);
        x && (h = x[1]);
      }
      const _ = u ? `${e.label}/${u}` : e.label;
      o.push({
        sourceId: e.id,
        sourceLabel: e.label,
        sourcePath: _,
        name: m.name || p.split("/").pop() || p,
        description: m.description || "",
        source_url: y,
        html_url: y,
        version: h,
        author: null,
        tag: m.tag || void 0,
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
async function Uo() {
  const e = await xn("mcp/manifest.json"), t = [], a = {};
  if (e.tag_groups && typeof e.tag_groups == "object")
    for (const [r, l] of Object.entries(e.tag_groups))
      Array.isArray(l) && (a[r] = l, t.push({
        id: r,
        label: ct(r),
        tags: l
      }));
  return { servers: (e.servers || []).map((r) => {
    let l = "";
    const s = r.tags || [];
    for (const [i, o] of Object.entries(a))
      if (o.some((c) => s.includes(c))) {
        l = i;
        break;
      }
    return {
      id: r.id || r.name,
      name: r.name || r.id,
      description: r.description || "",
      tags: s,
      transport: r.transport || "stdio",
      config: r.config,
      env: Array.isArray(r.env) ? r.env : void 0,
      source: r.source,
      icon: r.icon,
      icon_url: r.icon_url || r.icon_path || void 0,
      category: l
    };
  }), categories: t };
}
async function jo() {
  const e = await xn("skills/manifest.json"), t = [], a = /* @__PURE__ */ new Set();
  function n(r, l) {
    for (const s of r) {
      if ((s == null ? void 0 : s.type) === "collection" && Array.isArray(s.children)) {
        n(s.children, s.name || l);
        continue;
      }
      const i = String((s == null ? void 0 : s.path) || (s == null ? void 0 : s.name) || "").trim();
      if (!i) continue;
      const o = i.split("/").map(encodeURIComponent).join("/"), c = `${Xa}/skills/${o}`, d = typeof s.tag == "string" && s.tag.trim() ? s.tag.trim() : void 0;
      d && a.add(d);
      let u = null;
      if (typeof s.metadata == "string") {
        const m = s.metadata.match(/version:\s*"?([\d.]+)"?/);
        m && (u = m[1]);
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
      (r) => typeof r == "string" ? { name: r, path: r } : r
    )
  ) : e && Array.isArray(e.skills) && n(e.skills), t.length === 0)
    throw new Error("OSS 技能清单中没有可用技能");
  return {
    skills: t,
    categories: Array.from(a).map((r) => ({
      id: r,
      label: r
    }))
  };
}
async function No() {
  const e = await xn("agents/manifest.json"), t = [], a = {};
  if (e.tag_groups && typeof e.tag_groups == "object")
    for (const [r, l] of Object.entries(e.tag_groups))
      Array.isArray(l) && (a[r] = l, t.push({
        id: r,
        label: ct(r),
        tags: l
      }));
  return { agents: (e.agents || []).map((r) => {
    let l = "";
    const s = r.tags || [];
    for (const [i, o] of Object.entries(a))
      if (o.some((c) => s.includes(c))) {
        l = i;
        break;
      }
    return {
      id: r.id || r.name,
      name: r.name || r.id,
      description: r.description || "",
      path: r.path || "",
      tags: s,
      config: r.config,
      instructions: r.instructions,
      skills_manifest: r.skills_manifest,
      drivers: r.drivers,
      category: l
    };
  }), categories: t };
}
async function Do(e) {
  const t = e.filter((s) => s.enabled), a = await Promise.all(
    t.map(async (s) => {
      try {
        if (s.platform === "oss") {
          const { skills: i, categories: o } = await Bo(s);
          return { skills: i, categories: o, error: null, label: s.label };
        } else
          return { skills: await Lo(s), categories: [], error: null, label: s.label };
      } catch (i) {
        return {
          skills: [],
          categories: [],
          error: i.message || String(i),
          label: s.label
        };
      }
    })
  ), n = [], r = [], l = [];
  for (const s of a)
    n.push(...s.skills), r.push(...s.categories), s.error && l.push({ label: s.label, message: s.error });
  return { skills: n, errors: l, categories: r };
}
function Go({
  open: e,
  onClose: t,
  sources: a,
  onChange: n
}) {
  const r = A().React, { useState: l } = r, {
    Modal: s,
    Input: i,
    Button: o,
    List: c,
    Tag: d,
    Switch: u,
    Typography: m,
    Tooltip: p,
    message: f
  } = A().antd, {
    PlusOutlined: y,
    DeleteOutlined: h,
    LinkOutlined: _,
    GithubOutlined: x
  } = A().antdIcons || {}, { Text: S } = m, [v, R] = l(""), [D, F] = l(""), G = () => {
    const W = v.trim();
    if (!W) return;
    const b = tr(W);
    if (!b) {
      f.error("无效的仓库 URL，请输入类似 https://github.com/owner/repo/tree/main/skills 或 https://gitee.com/owner/repo/tree/master/skills 的链接");
      return;
    }
    const E = nr(b.owner, b.repo, b.skillsPath, b.platform);
    if (a.some((U) => U.id === E)) {
      f.warning("该源已存在");
      return;
    }
    const T = {
      id: E,
      url: W,
      label: b.label,
      owner: b.owner,
      repo: b.repo,
      ref: b.ref,
      skillsPath: b.skillsPath,
      enabled: !0,
      platform: b.platform,
      accessToken: D.trim() || void 0
    }, I = [...a, T];
    Pt(I), n(I), R(""), F(""), f.success(`已添加源: ${b.label}`);
  }, j = (W, b) => {
    const E = a.map(
      (T) => T.id === W ? { ...T, enabled: b } : T
    );
    Pt(E), n(E);
  }, K = (W, b) => {
    const E = a.map(
      (T) => T.id === W ? { ...T, accessToken: b.trim() || void 0 } : T
    );
    Pt(E), n(E);
  }, X = (W) => {
    const b = a.filter((E) => E.id !== W);
    Pt(b), n(b), f.success("已移除源");
  };
  return r.createElement(
    s,
    {
      open: e,
      onCancel: t,
      title: r.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 8 } },
        x ? r.createElement(x, { style: { fontSize: 18 } }) : null,
        r.createElement("span", null, "配置技能源")
      ),
      footer: r.createElement(
        o,
        { onClick: t },
        "关闭"
      ),
      width: 640
    },
    r.createElement(
      "div",
      { style: { marginBottom: 16 } },
      r.createElement(
        S,
        { type: "secondary", style: { fontSize: 12, display: "block", marginBottom: 8 } },
        "添加 GitHub 或 Gitee 仓库作为技能源，系统将从该仓库的指定目录获取技能列表。支持格式："
      ),
      r.createElement(
        "div",
        { style: { display: "flex", gap: 8, alignItems: "center" } },
        r.createElement(i, {
          placeholder: "https://github.com/owner/repo/tree/main/skills 或 https://gitee.com/owner/repo/tree/master/skills",
          value: v,
          onChange: (W) => R(W.target.value),
          onPressEnter: G,
          prefix: _ ? r.createElement(_) : void 0,
          style: { flex: 1 }
        }),
        r.createElement(
          o,
          {
            type: "primary",
            icon: y ? r.createElement(y) : void 0,
            onClick: G
          },
          "添加"
        )
      ),
      // Gitee token input (shown when URL looks like a Gitee link)
      v.trim() && v.trim().toLowerCase().includes("gitee.com") ? r.createElement(
        "div",
        { style: { marginTop: 8, display: "flex", gap: 8, alignItems: "center" } },
        r.createElement(
          S,
          { type: "secondary", style: { fontSize: 12, whiteSpace: "nowrap" } },
          "Gitee Token:"
        ),
        r.createElement(i.Password, {
          placeholder: "私有仓库请填写 Gitee 私人令牌（可选）",
          value: D,
          onChange: (W) => F(W.target.value),
          style: { flex: 1 }
        })
      ) : null
    ),
    r.createElement(
      "div",
      { style: { marginBottom: 8, display: "flex", alignItems: "center", justifyContent: "space-between" } },
      r.createElement(S, { strong: !0 }, `已配置源 (${a.length})`)
    ),
    r.createElement(c, {
      size: "small",
      bordered: !0,
      dataSource: a,
      renderItem: (W) => r.createElement(
        c.Item,
        {
          actions: [
            r.createElement(
              p,
              { title: W.enabled ? "点击禁用" : "点击启用" },
              r.createElement(u, {
                size: "small",
                checked: W.enabled,
                onChange: (b) => j(W.id, b)
              })
            ),
            r.createElement(
              p,
              { title: "移除此源" },
              r.createElement(
                o,
                {
                  size: "small",
                  type: "text",
                  danger: !0,
                  icon: h ? r.createElement(h) : void 0,
                  onClick: () => X(W.id)
                }
              )
            )
          ]
        },
        r.createElement(
          "div",
          { style: { flex: 1, minWidth: 0 } },
          r.createElement(
            "div",
            { style: { display: "flex", alignItems: "center", gap: 6, marginBottom: 4 } },
            r.createElement(
              d,
              { color: W.platform === "gitee" ? "orange" : W.platform === "oss" ? "green" : "blue", style: { fontSize: 11 } },
              W.platform === "gitee" ? "Gitee" : W.platform === "oss" ? "OSS" : "GitHub"
            ),
            r.createElement(
              d,
              { style: { fontSize: 11 } },
              W.label
            ),
            W.skillsPath ? r.createElement(
              S,
              { type: "secondary", style: { fontSize: 11 } },
              `/${W.skillsPath}`
            ) : null,
            W.platform !== "oss" ? r.createElement(
              S,
              { type: "secondary", style: { fontSize: 11 } },
              `@${W.ref}`
            ) : null
          ),
          r.createElement(
            S,
            {
              type: "secondary",
              style: { fontSize: 11, wordBreak: "break-all" }
            },
            W.url
          ),
          // Gitee token input for existing Gitee sources
          W.platform === "gitee" ? r.createElement(
            "div",
            { style: { marginTop: 6, display: "flex", gap: 6, alignItems: "center" } },
            r.createElement(
              S,
              { type: "secondary", style: { fontSize: 11, whiteSpace: "nowrap" } },
              "Token:"
            ),
            r.createElement(i.Password, {
              size: "small",
              placeholder: "Gitee 私人令牌（可选，用于私有仓库）",
              value: W.accessToken || "",
              onChange: (b) => K(W.id, b.target.value),
              style: { flex: 1 }
            })
          ) : null
        )
      )
    })
  );
}
function pa({
  open: e,
  onClose: t,
  sources: a,
  onChange: n,
  type: r
}) {
  const l = A().React, { useState: s } = l, {
    Modal: i,
    Input: o,
    Button: c,
    List: d,
    Tag: u,
    Switch: m,
    Typography: p,
    Tooltip: f,
    message: y
  } = A().antd, {
    PlusOutlined: h,
    DeleteOutlined: _,
    LinkOutlined: x,
    ApiOutlined: S,
    UserOutlined: v,
    ImportOutlined: R,
    ExportOutlined: D,
    CopyOutlined: F
  } = A().antdIcons || {}, { Text: G } = p, [j, K] = s(""), [X, W] = s(""), [b, E] = s(""), [T, I] = s(!1), U = r === "mcp" ? "MCP" : "专家模板", $ = r === "mcp" ? S ? l.createElement(S, { style: { fontSize: 18 } }) : null : v ? l.createElement(v, { style: { fontSize: 18 } }) : null, O = () => {
    const B = j.trim(), L = X.trim();
    if (!B) return;
    const ne = L || B.slice(0, 40), Z = `${r}:${B}`;
    if (a.some((M) => M.id === Z)) {
      y.warning("该源已存在");
      return;
    }
    const H = {
      id: Z,
      label: ne,
      url: B,
      enabled: !0,
      type: r
    }, ue = [...a, H];
    r === "mcp" ? At(ue) : $t(ue), n(ue), K(""), W(""), y.success(`已添加${U}源: ${ne}`);
  }, z = (B, L) => {
    const ne = a.map(
      (Z) => Z.id === B ? { ...Z, enabled: L } : Z
    );
    r === "mcp" ? At(ne) : $t(ne), n(ne);
  }, w = (B) => {
    const L = a.filter((ne) => ne.id !== B);
    r === "mcp" ? At(L) : $t(L), n(L), y.success("已移除源");
  }, le = () => {
    const B = JSON.stringify(
      { type: r, sources: a },
      null,
      2
    );
    try {
      navigator.clipboard.writeText(B), y.success(`${U}源已复制到剪贴板（${a.length} 个源）`);
    } catch {
      const L = document.createElement("textarea");
      L.value = B, document.body.appendChild(L), L.select(), document.execCommand("copy"), document.body.removeChild(L), y.success(`${U}源已复制到剪贴板（${a.length} 个源）`);
    }
  }, oe = () => {
    const B = b.trim();
    if (!B) {
      y.warning("请粘贴 JSON 内容");
      return;
    }
    try {
      const L = JSON.parse(B);
      let ne = [];
      if (Array.isArray(L))
        ne = L;
      else if (L && Array.isArray(L.sources))
        ne = L.sources;
      else if (L && typeof L == "object")
        ne = [L];
      else
        throw new Error("Invalid format");
      const Z = ne.filter(
        (se) => se && typeof se.url == "string" && typeof se.label == "string"
      );
      if (Z.length === 0) {
        y.error("未找到有效的源数据");
        return;
      }
      const H = new Set(a.map((se) => se.id)), ue = [];
      for (const se of Z) {
        const me = se.id || `${r}:${se.url}`;
        H.has(me) || ue.push({
          id: me,
          label: se.label,
          url: se.url,
          enabled: se.enabled !== !1,
          type: r
        });
      }
      if (ue.length === 0) {
        y.info("所有源均已存在，无新增");
        return;
      }
      const M = [...a, ...ue];
      r === "mcp" ? At(M) : $t(M), n(M), E(""), I(!1), y.success(`成功导入 ${ue.length} 个${U}源`);
    } catch (L) {
      y.error(`JSON 解析失败: ${L.message || "格式错误"}`);
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
              disabled: a.length === 0,
              size: "small"
            },
            "导出到剪贴板"
          ),
          l.createElement(
            c,
            {
              icon: R ? l.createElement(R) : void 0,
              onClick: () => I(!T),
              size: "small"
            },
            T ? "隐藏导入" : "导入JSON"
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
    T ? l.createElement(
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
        placeholder: r === "mcp" ? `{
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
        onChange: (B) => W(B.target.value),
        style: { width: 200 }
      }),
      l.createElement(o, {
        placeholder: r === "mcp" ? "https://raw.githubusercontent.com/team/mcp-registry/main/mcp.json" : "https://raw.githubusercontent.com/team/expert-registry/main/experts.json",
        value: j,
        onChange: (B) => K(B.target.value),
        onPressEnter: O,
        prefix: x ? l.createElement(x) : void 0,
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
        `已配置源 (${a.length})`
      )
    ),
    l.createElement(d, {
      size: "small",
      bordered: !0,
      dataSource: a,
      renderItem: (B) => l.createElement(
        d.Item,
        {
          actions: [
            l.createElement(
              f,
              { title: B.enabled ? "点击禁用" : "点击启用" },
              l.createElement(m, {
                size: "small",
                checked: B.enabled,
                onChange: (L) => z(B.id, L)
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
                  icon: _ ? l.createElement(_) : void 0,
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
                color: r === "mcp" ? "purple" : "blue",
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
async function Fo() {
  return ce("/market/providers");
}
async function Wo(e) {
  return ce(
    `/market/categories?lang=${encodeURIComponent(e)}`
  );
}
async function Ho(e, t, a, n, r) {
  return ce("/market/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: e,
      provider_pages: t,
      limit: a,
      lang: n,
      category: r || void 0
    })
  });
}
function ga(e) {
  if (!e) return "";
  const t = e.message || String(e);
  try {
    const a = JSON.parse(t);
    if (a.detail) {
      if (typeof a.detail == "string") return a.detail;
      if (a.detail.message) return a.detail.message;
    }
  } catch {
  }
  return t;
}
async function fa(e, t) {
  const a = { bundle_url: e };
  return t && (a.access_token = t), ce("/skills/pool/import", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(a)
  });
}
function Jo() {
  const e = A().React, { useState: t, useEffect: a, useCallback: n, useMemo: r, useRef: l } = e, {
    Spin: s,
    Empty: i,
    Input: o,
    Button: c,
    message: d,
    Row: u,
    Col: m,
    Card: p,
    Tag: f,
    Tooltip: y,
    Typography: h,
    Select: _,
    Drawer: x,
    Descriptions: S,
    Tabs: v,
    Badge: R,
    Progress: D,
    Modal: F,
    Alert: G
  } = A().antd, {
    ReloadOutlined: j,
    SearchOutlined: K,
    DownloadOutlined: X,
    AppstoreOutlined: W,
    ShopOutlined: b,
    CheckCircleOutlined: E,
    LoadingOutlined: T,
    UserOutlined: I,
    UserAddOutlined: U,
    SettingOutlined: $,
    GithubOutlined: O,
    ApiOutlined: z
  } = A().antdIcons || {}, { Text: w, Paragraph: le, Title: oe } = h, [B, L] = t("skills"), [ne, Z] = t([]), [H, ue] = t([]), [M, se] = t([]), [me, Y] = t(""), [Q, ie] = t(""), [he, we] = t(!1), [Ae, Se] = t(!1), [ee, be] = t(
    {}
  ), [Ee, te] = t(null), [de, ge] = t({}), [q, k] = t([]), [fe, V] = t(""), [C, ae] = t(""), [pe, Ie] = t(""), [Re, Ne] = t({}), [Le, Ge] = t(""), [et, De] = t(/* @__PURE__ */ new Set()), [Te, Me] = t(null), [re, ze] = t({}), [$e, Oe] = t([]), [He, Je] = t([]), [_e, xt] = t([]), [Kt, mt] = t(""), [Ke, kt] = t(!1), [mr, Tn] = t(!1), [ur, _n] = t([]), [pr, In] = t(!1), [gr, zn] = t([]), [fr, An] = t(!1), [$n, Pn] = t([]), [On, Mn] = t([]), [Rn, Ln] = t(!1), [tt, Bn] = t(""), [Un, jn] = t([]), [Nn, Dn] = t([]), [Gn, Fn] = t(!1), [nt, Wn] = t(""), [Xt, Hn] = t(!1), [Ue, Ct] = t(null), [ut, yr] = t([]), pt = l(null);
  a(() => {
    Promise.all([
      Fo().catch(() => []),
      Wo("zh").catch(() => []),
      Jt().catch(() => [])
    ]).then(([g, N, J]) => {
      Z(g), ue(N), k(J), J.length > 0 && (V(J[0].id), Ge(J[0].id));
    });
  }, []);
  const Tt = n(async (g) => {
    const N = g ?? Mo();
    if (Oe(g || N), N.filter((ye) => ye.enabled).length === 0) {
      Je([]);
      return;
    }
    kt(!0);
    try {
      const { skills: ye, errors: xe, categories: Pe } = await Do(N);
      if (Je(ye), yr(Pe), xe.length > 0) {
        for (const ke of xe)
          console.warn(`[ugsci] GitHub source '${ke.label}' error: ${ke.message}`);
        d.warning(
          `部分源加载失败: ${xe.map((ke) => ke.label).join(", ")}`
        );
      }
    } catch (ye) {
      d.error(ye.message || "加载技能源失败"), Je([]);
    } finally {
      kt(!1);
    }
  }, []), Yt = n(async () => {
    var ye, xe, Pe;
    Ln(!0), Fn(!0), kt(!0);
    const [g, N, J] = await Promise.allSettled([
      Uo(),
      No(),
      jo()
    ]);
    if (g.status === "fulfilled" ? (Pn(g.value.servers), Mn(g.value.categories)) : (console.warn(`[ugsci] MCP manifest error: ${((ye = g.reason) == null ? void 0 : ye.message) || g.reason}`), Pn([]), Mn([])), Ln(!1), N.status === "fulfilled" ? (jn(N.value.agents), Dn(N.value.categories)) : (console.warn(`[ugsci] Agents manifest error: ${((xe = N.reason) == null ? void 0 : xe.message) || N.reason}`), jn([]), Dn([])), Fn(!1), J.status === "fulfilled")
      xt(J.value.skills), mt("");
    else {
      const ke = ((Pe = J.reason) == null ? void 0 : Pe.message) || String(J.reason);
      console.warn(`[ugsci] Skills manifest error: ${ke}`), xt([]), mt(ke);
    }
    kt(!1);
  }, []);
  a(() => {
    Tt(), Yt(), _n($o()), zn(Po());
  }, [Tt, Yt]);
  const _t = n(
    async (g, N, J) => {
      we(!0);
      try {
        const ye = await Ho(
          g,
          J,
          20,
          "zh",
          N || void 0
        );
        J === void 0 || Object.keys(J).length === 0 ? se(ye.results) : se((ke) => [...ke, ...ye.results]);
        const xe = Object.values(ye.by_provider || {}).some(
          (ke) => ke.has_more
        );
        Se(xe);
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
  a(() => (pt.current && clearTimeout(pt.current), pt.current = setTimeout(() => {
    _t(me, Q, {});
  }, 400), () => {
    pt.current && clearTimeout(pt.current);
  }), [me, Q, _t]);
  const hr = () => {
    _t(me, Q, ee);
  }, Jn = async (g) => {
    const N = `${g.source}:${g.slug}`;
    try {
      ge((ye) => ({ ...ye, [N]: "installing" }));
      const J = await fa(g.source_url);
      J.installed && d.success(
        `技能「${J.name || g.name}」已安装到技能池，可在技能中心查看`
      ), ge((ye) => {
        const xe = { ...ye };
        return delete xe[N], xe;
      });
    } catch (J) {
      d.error(ga(J) || "安装技能失败"), ge((ye) => {
        const xe = { ...ye };
        return delete xe[N], xe;
      });
    }
  }, Er = (g) => {
    window.history.pushState({}, "", g), window.dispatchEvent(new PopStateEvent("popstate"));
  }, vr = async (g) => {
    const N = `github:${g.sourceId}:${g.name}`, J = $e.find((xe) => xe.id === g.sourceId), ye = (J == null ? void 0 : J.accessToken) || void 0;
    try {
      ge((Pe) => ({ ...Pe, [N]: "installing" }));
      const xe = await fa(g.source_url, ye);
      xe.installed && d.success(
        `技能「${xe.name || g.name}」已安装到技能池，可在技能中心查看`
      ), ge((Pe) => {
        const ke = { ...Pe };
        return delete ke[N], ke;
      });
    } catch (xe) {
      d.error(ga(xe) || "安装技能失败"), ge((Pe) => {
        const ke = { ...Pe };
        return delete ke[N], ke;
      });
    }
  }, Ze = r(() => {
    const g = [], N = /* @__PURE__ */ new Set();
    for (const J of [..._e, ...He]) {
      const ye = J.source_url || `${J.sourceLabel}:${J.name}`;
      N.has(ye) || (N.add(ye), g.push(J));
    }
    return g;
  }, [_e, He]), Vn = r(() => {
    const g = [], N = /* @__PURE__ */ new Set();
    if (ut.length > 0)
      for (const J of ut)
        N.has(J.id) || (N.add(J.id), g.push(J));
    for (const J of Ze)
      J.tag && !N.has(J.tag) && (N.add(J.tag), g.push({ id: J.tag, label: J.tag }));
    for (const J of Ze)
      !J.isOfficial && J.sourceLabel && !N.has(J.sourceLabel) && (N.add(J.sourceLabel), g.push({ id: J.sourceLabel, label: J.sourceLabel }));
    return g;
  }, [Ze, ut]), Qt = r(() => {
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
  }, [Ze, me, Q, ut]), qn = ne.filter((g) => g.available), at = r(() => Q ? M.filter((g) => {
    const N = qn.find((J) => J.key === g.source);
    return (N == null ? void 0 : N.label) === Q;
  }) : M, [M, Q, qn]), br = e.createElement(
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
      ...Vn.map((g) => {
        const N = He.some(
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
            m,
            { key: N, xs: 24, sm: 12, md: 8, lg: 6 },
            e.createElement(
              p,
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
                    icon: T ? e.createElement(T) : void 0
                  },
                  "安装中"
                ) : e.createElement(
                  c,
                  {
                    type: "primary",
                    size: "small",
                    icon: X ? e.createElement(X) : void 0,
                    onClick: () => vr(g)
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
    at.length > 0 || he ? e.createElement(
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
        `技能市场${at.length > 0 ? ` (${at.length})` : ""}`
      )
    ) : null,
    // Results grid
    he && at.length === 0 ? e.createElement(
      "div",
      { style: { textAlign: "center", padding: 60 } },
      e.createElement(s, { size: "large" })
    ) : at.length === 0 ? e.createElement(i, {
      description: me ? `未找到匹配「${me}」的技能` : "输入关键词搜索技能市场",
      image: i.PRESENTED_IMAGE_SIMPLE
    }) : e.createElement(
      u,
      { gutter: [12, 12] },
      ...at.map((g) => {
        const N = `${g.source}:${g.slug}`, J = de[N];
        return e.createElement(
          m,
          { key: N, xs: 24, sm: 12, md: 8, lg: 6 },
          e.createElement(
            p,
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
                  icon: T ? e.createElement(T) : void 0
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
        { onClick: hr, loading: he },
        "加载更多"
      )
    ) : null,
    // Detail Drawer
    Ee ? e.createElement(
      x,
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
        S,
        { column: 1, bordered: !0, size: "small" },
        e.createElement(
          S.Item,
          { label: "来源" },
          Ee.source
        ),
        e.createElement(
          S.Item,
          { label: "描述" },
          Ee.description || "-"
        ),
        Ee.version ? e.createElement(
          S.Item,
          { label: "版本" },
          Ee.version
        ) : null,
        Ee.author ? e.createElement(
          S.Item,
          { label: "作者" },
          Ee.author
        ) : null,
        e.createElement(
          S.Item,
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
  ), Zt = r(() => {
    let g = Un;
    if (nt && (g = g.filter((N) => N.category === nt)), C.trim()) {
      const N = C.toLowerCase();
      g = g.filter(
        (J) => J.name.toLowerCase().includes(N) || J.description.toLowerCase().includes(N) || J.tags.some((ye) => ye.toLowerCase().includes(N))
      );
    }
    return g;
  }, [Un, C, nt]), wr = async (g) => {
    if (!Xt) {
      Hn(!0);
      try {
        let N = g.description;
        if (g.instructions)
          try {
            const xe = g.instructions.replace(/^\/+/, ""), Pe = await Ut(xe);
            Pe.ok && (N = await Pe.text());
          } catch {
          }
        let J = [];
        if (g.skills_manifest)
          try {
            const xe = g.skills_manifest.replace(/^\/+/, ""), Pe = await Ut(xe);
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
        await Bt(ye.id, "AGENTS.md", N), d.success(`专家「${g.name}」创建成功，已跳转至专家`), Er("/ugsci-experts");
      } catch (N) {
        d.error(N.message || "创建专家失败");
      } finally {
        Hn(!1);
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
  a(() => {
    Le && Kn(Le);
  }, [Le, Kn]);
  const Sr = async (g) => {
    if (!Le) {
      d.warning("请先选择目标专家");
      return;
    }
    if (_o(g)) {
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
      await bn(Le, {
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
  }, xr = async () => {
    if (!Te) return;
    const g = [];
    for (const [J, ye] of Object.entries(re))
      if (!ye || !ye.trim()) {
        const xe = ma[J];
        g.push((xe == null ? void 0 : xe.label) || J);
      }
    if (g.length > 0) {
      d.warning(`请填写以下配置项: ${g.join(", ")}`);
      return;
    }
    const N = Te;
    Me(null), ze({}), await Xn(N, { ...re });
  }, en = r(() => {
    let g = $n;
    if (tt && (g = g.filter((N) => N.category === tt)), pe.trim()) {
      const N = pe.toLowerCase();
      g = g.filter(
        (J) => J.name.toLowerCase().includes(N) || J.description.toLowerCase().includes(N) || J.tags.some((ye) => ye.toLowerCase().includes(N))
      );
    }
    return g.map(Ao);
  }, [$n, pe, tt]), kr = e.createElement(
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
        e.createElement(_, {
          value: Le,
          onChange: (g) => Ge(g),
          style: { minWidth: 180 },
          size: "small",
          options: q.map((g) => ({ value: g.id, label: g.name }))
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
    Rn && en.length === 0 ? e.createElement(
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
          m,
          { key: g.id, xs: 24, sm: 12, md: 8 },
          e.createElement(
            p,
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
                  loading: !!Re[g.id],
                  icon: z ? e.createElement(z) : void 0,
                  onClick: () => Sr(g)
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
  ), Cr = Te ? e.createElement(
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
      onOk: xr,
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
      const N = ma[g], J = (N == null ? void 0 : N.isSecret) !== !1;
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
          value: re[g] || "",
          onChange: (ye) => ze((xe) => ({
            ...xe,
            [g]: ye.target.value
          })),
          style: { width: "100%" }
        }) : e.createElement(o, {
          placeholder: `请输入 ${(N == null ? void 0 : N.label) || g}`,
          value: re[g] || "",
          onChange: (ye) => ze((xe) => ({
            ...xe,
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
  ) : null, Tr = e.createElement(
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
        value: C,
        onChange: (g) => ae(g.target.value),
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
          onClick: () => Wn("")
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
            onClick: () => Wn(
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
          m,
          { key: g.id, xs: 24, sm: 12, md: 8 },
          e.createElement(
            p,
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
              e.createElement(We, {
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
  ), _r = [
    {
      key: "skills",
      label: e.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        W ? e.createElement(W, { style: { fontSize: 14 } }) : null,
        "技能市场"
      ),
      children: br
    },
    {
      key: "mcp",
      label: e.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        z ? e.createElement(z, { style: { fontSize: 14 } }) : null,
        "MCP 市场"
      ),
      children: kr
    },
    {
      key: "experts",
      label: e.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        U ? e.createElement(U, { style: { fontSize: 14 } }) : null,
        "人才市场"
      ),
      children: Tr
    }
  ];
  return e.createElement(
    "div",
    { style: { padding: 24 } },
    e.createElement(Ht, {
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
            loading: he || Ke || Rn || Gn
          },
          "刷新"
        )
      )
    }),
    e.createElement(v, {
      items: _r,
      activeKey: B,
      onChange: (g) => L(g)
    }),
    // Skill source config modal
    e.createElement(Go, {
      open: mr,
      onClose: () => Tn(!1),
      sources: $e,
      onChange: (g) => {
        Oe(g), Tt(g);
      }
    }),
    // MCP source config modal
    e.createElement(pa, {
      open: pr,
      onClose: () => In(!1),
      sources: ur,
      onChange: (g) => _n(g),
      type: "mcp"
    }),
    // MCP token config modal (for templates requiring secrets)
    Cr,
    // Expert source config modal
    e.createElement(pa, {
      open: fr,
      onClose: () => An(!1),
      sources: gr,
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
          e.createElement(We, {
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
                await wr(Ue), Ct(null);
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
const ya = {
  zh: "您好，UGSci 智能助手在线。无论是油气藏分析、数值模拟还是工程决策，描述您的场景，我来交付结果。",
  en: "UGSci AI assistant is online. From reservoir analysis to numerical simulation and engineering decisions — describe your scenario and I'll deliver results.",
  ja: "UGSci AIアシスタントがオンラインです。油層解析、数値シミュレーション、エンジニアリングの意思決定など、シナリオを描写してください。結果をお届けします。",
  ru: "UGSci AI-ассистент онлайн. От анализа пласта до численного моделирования и инженерных решений — опишите свой сценарий, и я предоставлю результат.",
  vi: "Trợ lý AI UGSci đang trực tuyến. Từ phân tích mỏ, mô phỏng số đến ra quyết định kỹ thuật — mô tả kịch bản của bạn, tôi sẽ giao kết quả.",
  id: "Asisten AI UGSci sedang online. Dari analisis reservoir, simulasi numerik hingga keputusan engineering — jelaskan skenario Anda, saya akan memberikan hasilnya."
}, ha = {
  zh: { label: "能告诉我你都能做点什么吗？", value: "能告诉我你都能做点什么吗" },
  en: { label: "Can you tell me what you can do?", value: "Can you tell me what you can do?" },
  ja: { label: "あなたができることを教えてください", value: "あなたができることを教えてください" },
  ru: { label: "Расскажи, что ты умеешь делать?", value: "Расскажи, что ты умеешь делать?" },
  vi: { label: "Bạn có thể cho tôi biết bạn làm được gì không?", value: "Bạn có thể cho tôi biết bạn làm được gì không?" },
  id: { label: "Bisa cerita apa saja yang bisa Anda lakukan?", value: "Bisa cerita apa saja yang bisa Anda lakukan?" }
};
function qo() {
  const e = A(), t = e.React, { useEffect: a, useRef: n } = t, r = e.useSelectedAgent ? e.useSelectedAgent() : { id: "default" }, l = (r == null ? void 0 : r.id) || "default", s = n(null), i = n(null);
  return a(() => {
    if (s.current === l) return;
    s.current = l, fn();
    const o = Vo(), c = ya[o] || ya.en, d = ha[o] || ha.en;
    let u = !1;
    return (async () => {
      var m, p;
      try {
        const f = await Vt(l);
        if (u) return;
        const y = Aa(f);
        if (i.current) {
          try {
            i.current();
          } catch {
          }
          i.current = null;
        }
        const h = window.QwenPaw;
        (m = h == null ? void 0 : h.chat) != null && m.welcome && (y.length > 0 ? (i.current = h.chat.welcome.set("ugsci", {
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
        if ((p = y == null ? void 0 : y.chat) != null && p.welcome && !u) {
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
const Ko = 256;
let je = {};
const pn = /* @__PURE__ */ new Set(), jt = () => pn.forEach((e) => e()), Xo = (e) => (pn.add(e), () => pn.delete(e)), Ea = () => je;
function Nt(e, t) {
  return `${e}::${t}`;
}
function ht(e) {
  var t;
  if (!e || typeof e != "string") return null;
  try {
    const a = JSON.parse(e);
    if (Array.isArray(a)) {
      const n = (t = a.find((r) => (r == null ? void 0 : r.type) === "text")) == null ? void 0 : t.text;
      return typeof n == "string" ? ht(n) : null;
    }
    return a && a.ok === !0 && (a.kind === "genui" || a.kind === "genui_patch") ? a : null;
  } catch {
    return null;
  }
}
function Et(e) {
  var t;
  if (!e || typeof e != "string") return null;
  try {
    const a = JSON.parse(e);
    if (Array.isArray(a)) {
      const n = (t = a.find((r) => (r == null ? void 0 : r.type) === "text")) == null ? void 0 : t.text;
      return typeof n == "string" ? Et(n) : null;
    }
    return a && a.ok === !1 ? a : null;
  } catch {
    return null;
  }
}
const va = /* @__PURE__ */ new Set(["plugin_call_output", "function_call_output", "tool_call_output", "mcp_call_output", "component_call_output"]), nn = /* @__PURE__ */ new Set(["emit_ui_tree", "emit_ui_patch"]);
function ar(e) {
  var n, r, l, s;
  if (!Array.isArray(e)) return [];
  const t = [], a = (i, o = !1) => {
    var u, m;
    if (!i || typeof i != "object") return;
    if (Array.isArray(i)) {
      if (o ? i.map((f) => {
        var y;
        return ((y = f == null ? void 0 : f.data) == null ? void 0 : y.name) ?? (f == null ? void 0 : f.name);
      }).find((f) => nn.has(String(f || ""))) : void 0)
        for (const f of i) {
          const y = ((u = f == null ? void 0 : f.data) == null ? void 0 : u.output) ?? (f == null ? void 0 : f.output) ?? ((m = f == null ? void 0 : f.data) == null ? void 0 : m.result) ?? (f == null ? void 0 : f.result);
          if (y == null) continue;
          const h = typeof y == "string" ? y : JSON.stringify(y), _ = ht(h) || Et(h);
          _ && t.push(_);
        }
      i.forEach((f) => a(f));
      return;
    }
    const c = i;
    if (c.type === "tool_result" && nn.has(String(c.name || ""))) {
      const f = (Array.isArray(c.output) ? c.output : []).find((x) => (x == null ? void 0 : x.type) === "text"), y = (f == null ? void 0 : f.text) ?? c.output, h = typeof y == "string" ? y : JSON.stringify(y), _ = ht(h) || Et(h);
      _ && t.push(_);
      return;
    }
    const d = va.has(String(c.type || ""));
    Object.entries(c).forEach(
      ([p, f]) => a(f, d && p === "content")
    );
  };
  a(e);
  for (const i of e) {
    if (!i || typeof i != "object") continue;
    const o = i;
    if (!va.has(String(o.type || "")) || !Array.isArray(o.content)) continue;
    const c = o.content, d = (r = (n = c[0]) == null ? void 0 : n.data) == null ? void 0 : r.name;
    if (!nn.has(d)) continue;
    const u = (s = (l = c[1]) == null ? void 0 : l.data) == null ? void 0 : s.output;
    if (u == null) continue;
    const m = typeof u == "string" ? u : JSON.stringify(u), p = ht(m) || Et(m);
    p && t.push(p);
  }
  return Array.from(new Map(t.map((i) => [`${i.kind}:${i.ui_id}:${i.revision}`, i])).values());
}
function rr(e) {
  var s;
  const t = Nt(e.sessionId, e.uiId), a = Object.entries(je).filter(([, i]) => i.uiId === e.uiId).sort(([, i], [, o]) => o.revision - i.revision), n = je[t] || ((s = a[0]) == null ? void 0 : s[1]);
  if (n && e.revision < n.revision) return;
  const r = { ...je };
  for (const [i] of a) i !== t && delete r[i];
  r[t] = n && e.revision === n.revision ? { ...n, ...e, tree: n.tree } : e;
  const l = Object.entries(r).sort(([, i], [, o]) => o.updatedAt - i.updatedAt);
  je = Object.fromEntries(l.slice(0, Ko)), jt();
}
function Yo(e, t) {
  for (const a of ar(t))
    !a.ui_id || !a.tree || rr({
      schemaVersion: "1",
      uiId: a.ui_id,
      revision: a.revision || 1,
      tree: a.tree,
      sessionId: e,
      sourceToolCallId: a.tool_call_id,
      updatedAt: Date.now()
    });
}
const Qo = {
  setSnapshot: rr,
  applyPatch(e, t, a, n) {
    var c, d;
    const r = (c = window.QwenPaw) == null ? void 0 : c.host, l = n || ((d = r == null ? void 0 : r.getCurrentSessionId) == null ? void 0 : d.call(r)) || "", s = Nt(l, e.ui_id), i = je[s] || Object.values(je).find((u) => u.uiId === e.ui_id);
    if (!i || a <= i.revision) return;
    je = { ...Object.fromEntries(Object.entries(je).filter(([, u]) => u.uiId !== e.ui_id)), [s]: { ...i, sessionId: l, tree: t, revision: a, updatedAt: Date.now() } }, jt();
  },
  getSnapshot: (e, t) => je[Nt(e, t)],
  clearSession(e) {
    je = Object.fromEntries(Object.entries(je).filter(([, t]) => t.sessionId !== e)), jt();
  },
  hydrateFromMessages: Yo
};
function Zo({ children: e }) {
  return e;
}
function es() {
  var a, n;
  const e = (n = (a = window.QwenPaw) == null ? void 0 : a.host) == null ? void 0 : n.React;
  if (!e) throw new Error("useGenUiStore: host React not available");
  return { snapshots: e.useSyncExternalStore(Xo, Ea, Ea), ...Qo };
}
function ts() {
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
    const a = (t = e.find((n) => (n == null ? void 0 : n.type) === "text")) == null ? void 0 : t.text;
    return typeof a == "string" ? a : JSON.stringify(e);
  }
  if (e && typeof e == "object") {
    const a = e;
    if (typeof a.text == "string") return a.text;
    if (a.output !== void 0) return vt(a.output);
    if (a.content !== void 0) return vt(a.content);
  }
  return e == null ? "" : JSON.stringify(e);
}
function ns(e) {
  const t = e.data;
  if (!t) return { resultText: "", status: "calling", toolName: "" };
  const a = t.status || "calling", n = t.content;
  if (!Array.isArray(n) || n.length === 0)
    return { resultText: "", status: a, toolName: "" };
  const r = n[0], l = r == null ? void 0 : r.data, s = (l == null ? void 0 : l.name) || "";
  if (n.length > 1) {
    const i = n[1], o = i == null ? void 0 : i.data, c = (o == null ? void 0 : o.output) ?? (o == null ? void 0 : o.content) ?? (i == null ? void 0 : i.output) ?? (i == null ? void 0 : i.content) ?? (o == null ? void 0 : o.result) ?? (i == null ? void 0 : i.result);
    if (c != null) return { resultText: vt(c), status: a, toolName: s };
  }
  if (l != null && l.output) {
    const i = l.output;
    return { resultText: vt(i), status: a, toolName: s };
  }
  return { resultText: "", status: a, toolName: s };
}
function Ot(e) {
  var p, f, y, h;
  const t = (p = window.QwenPaw) == null ? void 0 : p.host, a = t == null ? void 0 : t.React;
  if (!a) return null;
  const { resultText: n, status: r, toolName: l } = ns(e), s = r === "in_progress" || r === "calling", i = r === "failed" || r === "error", o = ht(n), c = o ? null : Et(n);
  let d = 0;
  (f = o == null ? void 0 : o.tree) != null && f.root && (d = lr(o.tree.root));
  const u = l === "emit_ui_patch" || (o == null ? void 0 : o.kind) === "genui_patch", m = s ? u ? "📝 Patching UI Tree..." : "🎨 Generating UI Tree..." : i ? u ? "📝 UI Patch Error" : "🎨 UI Tree Error" : o ? u ? `📝 UI Patched (rev ${o.revision ?? "?"})` : `🎨 UI Tree (${d} nodes)` : u ? "📝 UI Patch" : "🎨 UI Tree";
  return a.createElement(
    "details",
    { open: s || i, style: { margin: "4px 0", border: "1px solid var(--ant-color-border, #d9d9d9)", borderRadius: 8, padding: "4px 8px", fontSize: 13 } },
    a.createElement(
      "summary",
      { style: { cursor: "pointer", display: "flex", alignItems: "center", gap: 6 } },
      a.createElement("span", null, u ? "📝" : "🎨"),
      a.createElement("span", null, m),
      o != null && o.ok ? a.createElement("span", { style: { fontSize: 11, color: "#999", marginLeft: "auto" } }, `ui_id: ${((y = o.ui_id) == null ? void 0 : y.slice(0, 16)) ?? ""}…`) : null
    ),
    i || c && !o ? a.createElement(
      "div",
      { style: { padding: "8px 12px", fontSize: 12 } },
      a.createElement("div", { style: { color: "var(--ant-color-error, #ff4d4f)", marginBottom: 4 } }, (c == null ? void 0 : c.message) || "Unknown error"),
      c != null && c.hint ? a.createElement("div", { style: { color: "#999" } }, `💡 ${c.hint}`) : null
    ) : o != null && o.ok ? a.createElement(
      "div",
      { style: { padding: "8px 12px", fontSize: 12, color: "#999" } },
      (h = o.tree) != null && h.root ? `GenUI 已在回复正文中展示（${d} 个节点，revision ${o.revision ?? 1}）。` : "GenUI 工具已完成，但没有可展示的树。"
    ) : a.createElement("pre", { style: { fontSize: 12, padding: "8px 12px", background: "rgba(0,0,0,0.03)", borderRadius: 8, overflow: "auto", maxHeight: 200 } }, n || "(waiting for result...)")
  );
}
function lr(e) {
  if (!e || typeof e != "object") return 0;
  let t = 1;
  if (Array.isArray(e.children)) for (const a of e.children) t += lr(a);
  return t;
}
const as = /* @__PURE__ */ new Set(["send_message"]), ba = 1e4, rs = 500, wa = {};
function ls() {
  var e;
  try {
    const t = window.QwenPaw, a = (e = t == null ? void 0 : t.genui) == null ? void 0 : e.config;
    if (a != null && a.allow_actions && Array.isArray(a.allow_actions)) {
      const n = a.allow_actions.filter(
        (r) => typeof r == "string" && r.length > 0
      );
      if (n.length > 0)
        return new Set(n);
    }
  } catch {
  }
  return new Set(as);
}
function os(e) {
  const t = Date.now(), a = wa[e] || 0;
  return t - a < rs ? (console.warn("[ugsci.genui] Action '" + e + "' throttled"), !0) : (wa[e] = t, !1);
}
function ss(e, t) {
  return e.replace(/\{\{\s*([\w.-]+)\s*\}\}/g, (a, n) => {
    const r = t[n];
    return r == null ? "" : typeof r == "string" ? r : JSON.stringify(r);
  });
}
function or(e, t = {}) {
  var l, s, i, o, c;
  let a;
  if (typeof e == "string") a = { type: e };
  else if (e && typeof e == "object") a = e;
  else return { ok: !1, message: "无效操作" };
  const n = a.type === "submit_form" ? "send_message" : a.type, r = ls();
  if (!r.has(n))
    return console.warn(
      "[ugsci.genui] Action '" + a.type + "' not allowed (allowed: " + Array.from(r).join(", ") + ")"
    ), { ok: !1, message: "此操作未获允许" };
  if (os(n)) return { ok: !1, message: "操作过于频繁，请稍后重试" };
  if (n === "send_message") {
    const d = t.formValues || {};
    let u = ((l = a.payload) == null ? void 0 : l.content) || ((s = a.payload) == null ? void 0 : s.message) || "";
    const m = /\{\{\s*[\w.-]+\s*\}\}/.test(u);
    return u = ss(u, d).trim(), u && !m && Object.keys(d).length > 0 && (u += `
${Object.entries(d).map(([f, y]) => `${f}: ${typeof y == "string" ? y : JSON.stringify(y)}`).join(`
`)}`), !u && Object.keys(d).length > 0 && (u = `${t.formId ? `提交表单 ${t.formId}` : "提交表单"}
${Object.entries(d).map(([y, h]) => `${y}: ${typeof h == "string" ? h : JSON.stringify(h)}`).join(`
`)}`), !u || !u.trim() ? (console.warn("[ugsci.genui] send_message: content is empty"), { ok: !1, message: "消息内容为空" }) : u.length > ba ? (console.warn("[ugsci.genui] send_message: content length " + u.length + " exceeds max " + ba), { ok: !1, message: "消息内容过长" }) : !((c = (o = (i = window.QwenPaw) == null ? void 0 : i.chat) == null ? void 0 : o.sendMessage) != null && c.call(o, u)) ? (console.info("[ugsci.genui] send_message: could not find chat sender, content:", u), { ok: !1, message: "当前无法发送消息" }) : { ok: !0, message: "已提交" };
  }
  return { ok: !1, message: "尚未实现此操作" };
}
const Fe = /* @__PURE__ */ new Map(), wt = /* @__PURE__ */ new Map(), is = 128, Mt = /* @__PURE__ */ new Map();
function Dt(e) {
  return e.startsWith("http://") || e.startsWith("https://") || e.startsWith("data:") || e.startsWith("blob:");
}
function cs(e) {
  return e ? !!(e.startsWith("/") || /^[A-Za-z]:[\\/]/.test(e) || e.startsWith("\\\\")) : !1;
}
function ds(e) {
  return e.startsWith("workspace://");
}
function ms(e) {
  return ds(e) ? e.slice(12) : e;
}
async function us(e) {
  if (!e) return null;
  if (Dt(e)) return e;
  if (Fe.has(e))
    return Fe.get(e) ?? null;
  if (Mt.has(e))
    return Mt.get(e);
  const t = ps(e);
  Mt.set(e, t);
  try {
    const a = await t;
    if (!Fe.has(e) && Fe.size >= is) {
      const n = Fe.keys().next().value;
      if (n !== void 0) {
        const r = Fe.get(n);
        r != null && r.startsWith("blob:") && URL.revokeObjectURL(r), Fe.delete(n);
      }
    }
    return Fe.set(e, a), a && wt.delete(e), a;
  } finally {
    Mt.delete(e);
  }
}
async function ps(e) {
  const t = window.QwenPaw, a = t == null ? void 0 : t.host;
  if (!a) {
    const r = "宿主媒体 API 不可用。请在 QwenPaw 工作区中打开此内容，或改用 http(s)、data、blob URL。";
    return wt.set(e, r), console.warn("[ugsci.genui]", r), null;
  }
  const n = ms(e);
  if (typeof a.resolveWorkspaceBlob == "function")
    try {
      const r = await a.resolveWorkspaceBlob(n);
      if (r) return r;
    } catch (r) {
      console.warn("[ugsci.genui] host.resolveWorkspaceBlob failed:", r);
    }
  try {
    return await gs(n, a);
  } catch (r) {
    const l = r instanceof Error ? r.message : String(r);
    return wt.set(
      e,
      `无法读取本地媒体：${l}。请确认文件位于当前工作区且文件预览 API 已启用。`
    ), console.warn(
      `[ugsci.genui] Failed to resolve media URL for '${e}':`,
      r
    ), null;
  }
}
async function gs(e, t) {
  let a = null;
  const n = t == null ? void 0 : t.workspaceApi, r = t == null ? void 0 : t.chatApi;
  if (cs(e) && (r != null && r.filePreviewUrl) ? a = r.filePreviewUrl(e) : n != null && n.getBinaryFileUrl && (a = n.getBinaryFileUrl(e)), !a)
    throw new Error("宿主未提供 workspaceApi.getBinaryFileUrl 或 chatApi.filePreviewUrl");
  const l = {}, s = t == null ? void 0 : t.buildAuthHeaders;
  if (typeof s == "function")
    try {
      const c = s();
      c && typeof c == "object" && Object.assign(l, c);
    } catch {
    }
  const i = await fetch(a, { headers: l });
  if (!i.ok)
    throw new Error(`HTTP ${i.status}: ${i.statusText}`);
  const o = await i.blob();
  return URL.createObjectURL(o);
}
function Sa(e) {
  return e ? Dt(e) ? e : Fe.get(e) ?? null : null;
}
function xa(e) {
  return wt.get(e) ?? null;
}
function fs() {
  for (const e of Fe.values())
    if (e && e.startsWith("blob:"))
      try {
        URL.revokeObjectURL(e);
      } catch {
      }
  Fe.clear(), wt.clear();
}
const ka = (e) => typeof e == "string" ? e : e != null ? String(e) : "";
let an = null;
function kn(e) {
  return an || (an = e.createContext(null)), an;
}
function Gt(e) {
  const t = e.props || {}, a = ka(t.name);
  if (a) return a;
  const n = ka(t.label), r = n.match(/^\s*([a-e])(?:\b|\s|（|\()/i);
  return r ? r[1].toLowerCase() : n || e.nodeId;
}
function sr(e, t = {}) {
  if (["Input", "NumberInput", "Select", "Textarea", "Switch", "Slider", "FileInput"].includes(e.kind)) {
    const a = e.props || {}, n = a.value ?? a.checked;
    n !== void 0 && (t[Gt(e)] = n);
  }
  for (const a of e.children || []) sr(a, t);
  return t;
}
function ys({
  node: e,
  children: t
}) {
  var i, o;
  const a = (o = (i = window.QwenPaw) == null ? void 0 : i.host) == null ? void 0 : o.React;
  if (!a) return null;
  const n = a.useMemo(() => sr(e), [e]), [r, l] = a.useState(n);
  a.useEffect(
    () => l((c) => ({ ...n, ...c })),
    [n]
  );
  const s = a.useMemo(
    () => ({
      values: r,
      setValue: (c, d) => l((u) => ({ ...u, [c]: d }))
    }),
    [r]
  );
  return a.createElement(
    kn(a).Provider,
    { value: s },
    t
  );
}
const P = (e) => typeof e == "string" ? e : e != null ? String(e) : "", Ce = (e) => typeof e == "number" ? e : typeof e == "string" && Number(e) || 0, Qe = (e) => !!e, Ve = (e) => Array.isArray(e) ? e : [], Ca = { xs: "12px", sm: "13px", base: "14px", lg: "16px" }, ve = {
  muted: "var(--ant-color-text-secondary, #8c8c8c)",
  default: "var(--ant-color-text, #000000d9)",
  primary: "var(--ant-color-primary, #1677ff)",
  success: "var(--ant-color-success, #52c41a)",
  warning: "var(--ant-color-warning, #faad14)",
  error: "var(--ant-color-error, #ff4d4f)"
};
let rn = null;
function Cn(e) {
  return rn || (rn = e.createContext(null)), rn;
}
function hs({ node: e }) {
  var m;
  const t = (m = window.QwenPaw) == null ? void 0 : m.host, a = t == null ? void 0 : t.React, n = (t == null ? void 0 : t.antd) || {};
  if (!a) return null;
  const r = e.props || {}, [l, s] = a.useState({}), [i, o] = a.useState(null), c = a.useMemo(() => {
    const p = {};
    for (const f of e.children || []) {
      const y = f.props || {}, h = Gt(f);
      y.value !== void 0 ? p[h] = y.value : y.checked !== void 0 && (p[h] = y.checked);
    }
    return p;
  }, [e]);
  a.useEffect(() => s((p) => ({ ...c, ...p })), [c]);
  const d = a.useMemo(() => ({ values: l, setValue: (p, f) => {
    o(null), s((y) => ({ ...y, [p]: f }));
  } }), [l]), u = () => {
    var y, h;
    const p = (e.children || []).filter((_) => {
      var x;
      return (x = _.props) == null ? void 0 : x.required;
    }).find((_) => {
      const x = Gt(_), S = l[x];
      return S == null || S === "" || Array.isArray(S) && S.length === 0;
    });
    if (p) {
      o({ ok: !1, message: `${P((y = p.props) == null ? void 0 : y.label) || P((h = p.props) == null ? void 0 : h.name) || "必填项"}不能为空` });
      return;
    }
    const f = r.action && typeof r.action == "object" ? r.action : { type: "submit_form", payload: {} };
    o(or(f, { formValues: l, formId: P(r.formId) || e.nodeId }));
  };
  return a.createElement(
    Cn(a).Provider,
    { value: d },
    a.createElement(
      "div",
      { style: { margin: "4px 0" } },
      r.title ? a.createElement("div", { style: { fontWeight: 600, marginBottom: 8 } }, P(r.title)) : null,
      ...(e.children || []).map((p, f) => a.createElement(st, { key: p.nodeId || f, node: p })),
      a.createElement(n.Button || "button", { type: "primary", size: "small", style: { marginTop: 8 }, onClick: u }, P(r.submitLabel) || "提交"),
      i ? a.createElement("div", { role: "status", style: { marginTop: 6, fontSize: 12, color: i.ok ? ve.success : ve.error } }, i.message) : null
    )
  );
}
function Es({ node: e, fieldType: t }) {
  var _, x, S;
  const a = (_ = window.QwenPaw) == null ? void 0 : _.host, n = a == null ? void 0 : a.React, r = (a == null ? void 0 : a.antd) || {};
  if (!n) return null;
  const l = e.props || {}, s = n.useContext(Cn(n)), i = n.useContext(kn(n)), o = s || i, [c, d] = n.useState(l.value ?? l.checked ?? ""), u = Gt(e), m = l.value ?? l.checked ?? "", p = o ? ((x = o.values) == null ? void 0 : x[u]) ?? m : c, f = (v) => {
    const R = v != null && v.target ? t === "Switch" ? v.target.checked : v.target.value : v;
    o ? o.setValue(u, R) : d(R);
  }, y = (v) => n.createElement(
    "div",
    { style: { display: "flex", flexDirection: "column", gap: 4, margin: "4px 0" } },
    l.label && t !== "Switch" ? n.createElement("label", { style: { fontSize: 12, color: ve.muted } }, P(l.label), l.required ? n.createElement("span", { style: { color: ve.error } }, " *") : null) : null,
    v,
    l.description ? n.createElement("span", { style: { fontSize: 11, color: ve.muted } }, P(l.description)) : null
  ), h = P(l.label) || P(l.placeholder) || u;
  return t === "Input" ? y(n.createElement(r.Input || "input", { "aria-label": h, placeholder: P(l.placeholder), value: p, onChange: f, size: "small" })) : t === "NumberInput" ? y(n.createElement(r.InputNumber || "input", { "aria-label": h, value: p, min: l.min, max: l.max, step: l.step, onChange: f, size: "small", style: { width: "100%" } })) : t === "Textarea" ? y(n.createElement(((S = r.Input) == null ? void 0 : S.TextArea) || "textarea", { "aria-label": h, placeholder: P(l.placeholder), value: p, rows: Ce(l.rows) || 3, onChange: f, style: { width: "100%" } })) : t === "Select" ? y(n.createElement(r.Select || "select", { "aria-label": h, placeholder: P(l.placeholder), value: p || void 0, onChange: f, size: "small", style: { width: "100%" } }, Ve(l.options).map((v, R) => {
    var D;
    return n.createElement(((D = r.Select) == null ? void 0 : D.Option) || "option", { key: R, value: P(typeof v == "object" ? v.value : v) }, P(typeof v == "object" ? v.label : v));
  }))) : t === "Switch" ? n.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8 } }, n.createElement(r.Switch || "input", { type: "checkbox", checked: !!p, onChange: f, size: "small" }), n.createElement("span", null, P(l.label))) : t === "Slider" ? y(n.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8 } }, n.createElement(r.Slider || "input", { type: "range", value: Ce(p), min: l.min ?? 0, max: l.max ?? 100, step: l.step ?? 1, onChange: f, style: { flex: 1 } }), n.createElement("span", { style: { minWidth: 32, fontSize: 12 } }, P(p)))) : t === "FileInput" ? n.createElement(
    "label",
    { style: { display: "inline-flex", alignItems: "center", gap: 8, cursor: "pointer" } },
    n.createElement("span", null, P(l.label) || "选择文件"),
    n.createElement("input", { type: "file", multiple: Qe(l.multiple), accept: P(l.accept) || void 0, onChange: (v) => o == null ? void 0 : o.setValue(u, Array.from(v.target.files || []).map((R) => ({ name: R.name, size: R.size, type: R.type }))) })
  ) : null;
}
function ln({ node: e, link: t = !1, toggle: a = !1 }) {
  var p;
  const n = (p = window.QwenPaw) == null ? void 0 : p.host, r = n == null ? void 0 : n.React, l = (n == null ? void 0 : n.antd) || {};
  if (!r) return null;
  const s = e.props || {}, i = r.useContext(Cn(r)), [o, c] = r.useState(Qe(s.checked)), [d, u] = r.useState(null), m = () => {
    a && c((f) => !f), s.action && typeof s.action == "object" ? u(or(s.action, { formValues: i == null ? void 0 : i.values, formId: i ? "form" : void 0 })) : t && typeof s.href == "string" && /^(https?:\/\/|\/)/.test(s.href) && window.open(s.href, "_blank", "noopener,noreferrer");
  };
  return r.createElement(
    "span",
    { style: { display: "inline-flex", flexDirection: "column", gap: 3 } },
    r.createElement(l.Button || "button", { type: t ? "link" : (a ? o : P(s.variant) === "primary") ? "primary" : "default", size: "small", disabled: Qe(s.disabled), loading: Qe(s.loading), onClick: m }, P(s.label) || "Action"),
    d ? r.createElement("span", { role: "status", style: { fontSize: 11, color: d.ok ? ve.success : ve.error } }, d.message) : null
  );
}
function vs({ node: e, children: t }) {
  var l;
  const a = (l = window.QwenPaw) == null ? void 0 : l.host, n = a == null ? void 0 : a.React;
  if (!n) return null;
  class r extends n.Component {
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
  return n.createElement(r, { node: e }, t);
}
function st({ node: e }) {
  var i;
  const t = (i = window.QwenPaw) == null ? void 0 : i.host;
  if (!(t != null && t.React)) return null;
  const a = t.React, n = t.antd || {}, r = e.props || {}, l = e.children || [], s = () => l.map(
    (o, c) => a.createElement(st, { key: o.nodeId || c, node: o })
  );
  return a.createElement(
    vs,
    { node: e },
    bs(a, n, e, r, l, s)
  );
}
function bs(e, t, a, n, r, l) {
  var s, i;
  switch (a.kind) {
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
      return e.createElement("div", { style: { fontSize: Ca[P(n.size)] || Ca.base, color: ve[P(n.color)] || ve.default, fontWeight: Qe(n.bold) ? "bold" : "normal", lineHeight: 1.6 } }, P(n.value));
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
      const o = Ve(n.items);
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
      return e.createElement(Ta, {
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
      return e.createElement(t.Card || "div", { size: "small", style: { margin: "4px 0" } }, e.createElement("div", { style: { display: "flex", gap: 12, alignItems: "center" } }, e.createElement(Ta, { src: P(n.avatar), name: P(n.name), size: 48 }), e.createElement("div", null, e.createElement("div", { style: { fontWeight: 600 } }, P(n.name)), e.createElement("div", { style: { fontSize: 12, color: ve.muted } }, P(n.role)), n.bio ? e.createElement("div", { style: { fontSize: 12, marginTop: 4 } }, P(n.bio)) : null)));
    case "MediaCard":
      return e.createElement(t.Card || "div", { size: "small", style: { margin: "4px 0", overflow: "hidden" } }, e.createElement(Lt, { src: P(n.src), alt: P(n.title), style: { width: "100%", maxHeight: 200, objectFit: "cover" } }), e.createElement("div", { style: { padding: "8px 12px" } }, e.createElement("div", { style: { fontWeight: 600 } }, P(n.title)), n.caption ? e.createElement("div", { style: { fontSize: 12, color: ve.muted } }, P(n.caption)) : null));
    case "QuoteCard":
      return e.createElement(t.Card || "div", { size: "small", style: { margin: "4px 0", fontStyle: "italic" } }, e.createElement("div", { style: { fontSize: 14, lineHeight: 1.6 } }, `"${P(n.quote)}"`), e.createElement("div", { style: { fontSize: 12, color: ve.muted, marginTop: 8 } }, `— ${P(n.author)}${n.role ? `, ${P(n.role)}` : ""}`));
    case "TimelineCard":
      return e.createElement(t.Card || "div", { size: "small", style: { margin: "4px 0" } }, e.createElement("div", { style: { display: "flex", gap: 8, alignItems: "flex-start" } }, e.createElement("div", { style: { width: 8, height: 8, borderRadius: "50%", background: P(n.status) === "done" ? ve.success : P(n.status) === "pending" ? ve.warning : ve.primary, marginTop: 4, flexShrink: 0 } }), e.createElement("div", null, e.createElement("div", { style: { fontWeight: 600 } }, P(n.title)), n.date ? e.createElement("div", { style: { fontSize: 12, color: ve.muted } }, P(n.date)) : null, n.description ? e.createElement("div", { style: { fontSize: 13, marginTop: 4 } }, P(n.description)) : null)));
    case "KpiBoard":
      return e.createElement("div", { style: { margin: "4px 0" } }, n.title ? e.createElement("div", { style: { fontSize: 16, fontWeight: 600, marginBottom: 8 } }, P(n.title)) : null, e.createElement("div", { style: { display: "grid", gridTemplateColumns: `repeat(${Math.min(Math.max(Ce(n.columns) || 3, 1), 6)}, 1fr)`, gap: 12 } }, l()));
    case "FeatureGrid":
      return e.createElement("div", { style: { display: "grid", gridTemplateColumns: `repeat(${Math.min(Math.max(Ce(n.columns) || 2, 1), 4)}, 1fr)`, gap: `${Ce(n.gap) || 12}px`, margin: "4px 0" } }, l());
    case "Stepper": {
      const o = Ve(n.steps).map((d) => P(d)), c = Ce(n.current);
      return e.createElement(
        t.Steps || "div",
        { current: c, size: "small", style: { margin: "4px 0" } },
        ...o.map((d, u) => {
          var m;
          return e.createElement(((m = t.Steps) == null ? void 0 : m.Item) || "div", { key: u, title: d });
        })
      );
    }
    case "Table": {
      const o = Ve(n.headers).map((m) => P(m)), d = r.filter((m) => m.kind === "TableRow").map((m, p) => {
        const f = (m.children || []).filter((h) => h.kind === "TableCell"), y = { key: p };
        return o.forEach((h, _) => {
          var S, v;
          const x = (v = (S = f[_]) == null ? void 0 : S.props) == null ? void 0 : v.value;
          y[h] = x == null ? "" : P(x);
        }), y;
      }), u = o.map((m) => ({ title: m, dataIndex: m, key: m }));
      return e.createElement(t.Table || "table", { dataSource: d, columns: u, size: Qe(n.compact) ? "small" : "middle", pagination: !1, style: { margin: "4px 0" } });
    }
    case "List": {
      const o = r.filter((c) => c.kind === "ListItem");
      return e.createElement(
        t.List || "ul",
        { size: "small", style: { margin: "4px 0" } },
        o.map((c, d) => {
          var u, m, p;
          return e.createElement(((u = t.List) == null ? void 0 : u.Item) || "li", { key: d }, (m = c.props) != null && m.icon ? e.createElement("span", { style: { marginRight: 6 } }, P(c.props.icon)) : null, P((p = c.props) == null ? void 0 : p.value));
        })
      );
    }
    case "ImageGallery": {
      const o = r.filter((c) => c.kind === "Image");
      return e.createElement(
        "div",
        { style: { display: "grid", gridTemplateColumns: `repeat(${Math.min(Math.max(Ce(n.columns) || 3, 1), 6)}, 1fr)`, gap: `${Ce(n.gap) || 8}px`, margin: "4px 0" } },
        ...o.map((c, d) => {
          const u = c.props || {};
          return e.createElement(Lt, { key: d, src: P(u.src), alt: P(u.alt), style: { width: "100%", height: 120, objectFit: "cover", borderRadius: 8, cursor: "pointer" } });
        })
      );
    }
    case "Image":
      return e.createElement("div", null, e.createElement(Lt, { src: P(n.src), alt: P(n.alt), style: { maxWidth: "100%", borderRadius: Qe(n.rounded) ? "8px" : void 0, maxHeight: n.maxHeight ? `${Ce(n.maxHeight)}px` : void 0 } }), n.caption ? e.createElement("div", { style: { fontSize: 12, color: ve.muted } }, P(n.caption)) : null);
    case "Chart":
      return e.createElement(ws, { props: n });
    case "Button":
    case "InteractiveButton":
      return e.createElement(ln, { node: a });
    case "ToggleButton":
      return e.createElement(ln, { node: a, toggle: !0 });
    case "LinkButton":
      return e.createElement(ln, { node: a, link: !0 });
    case "Input":
    case "NumberInput":
    case "Select":
    case "Textarea":
    case "Switch":
    case "Slider":
    case "FileInput":
      return e.createElement(Es, { node: a, fieldType: a.kind });
    case "Form":
      return e.createElement(hs, { node: a });
    case "Chip":
      return e.createElement(t.Tag || "span", { color: P(n.color) || "default", closable: !0, onClose: () => {
      }, children: P(n.label) });
    case "ChipGroup": {
      const o = Ve(n.items);
      return e.createElement("div", { style: { display: "flex", flexWrap: "wrap", gap: 4 } }, ...o.map((c, d) => e.createElement(t.Tag || "span", { key: d }, P(c))));
    }
    case "Tabs": {
      const c = r.filter((d) => d.kind === "TabItem").map((d) => {
        var u, m, p;
        return {
          key: P((u = d.props) == null ? void 0 : u.key) || P((m = d.props) == null ? void 0 : m.tab),
          label: P((p = d.props) == null ? void 0 : p.tab),
          children: (d.children || []).map((f, y) => e.createElement(st, { key: f.nodeId || y, node: f }))
        };
      });
      return t.Tabs ? e.createElement(t.Tabs, { items: c, defaultActiveKey: P(n.activeKey) || ((i = c[0]) == null ? void 0 : i.key) }) : e.createElement("div", null, ...c.map((d, u) => e.createElement("div", { key: u }, e.createElement("div", { style: { fontWeight: 600, marginBottom: 4 } }, d.label), d.children)));
    }
    case "TabItem":
      return e.createElement("div", null, l());
    case "Accordion": {
      const o = r.filter((c) => c.kind === "AccordionItem");
      if (t.Collapse) {
        const c = o.map((d) => {
          var u, m, p;
          return {
            key: P((u = d.props) == null ? void 0 : u.key) || P((m = d.props) == null ? void 0 : m.header),
            label: P((p = d.props) == null ? void 0 : p.header),
            children: (d.children || []).map((f, y) => e.createElement(st, { key: f.nodeId || y, node: f }))
          };
        });
        return e.createElement(t.Collapse, { items: c });
      }
      return e.createElement("div", null, ...o.map((c, d) => {
        var u;
        return e.createElement("details", { key: d }, e.createElement("summary", { style: { fontWeight: 600, cursor: "pointer", padding: "4px 0" } }, P((u = c.props) == null ? void 0 : u.header)), e.createElement("div", { style: { paddingLeft: 12 } }, (c.children || []).map((m, p) => e.createElement(st, { key: m.nodeId || p, node: m }))));
      }));
    }
    case "AccordionItem":
      return e.createElement("div", null, l());
    case "JsonDebug":
      return e.createElement("details", { style: { margin: "4px 0", fontSize: 12 } }, e.createElement("summary", null, P(n.label) || "Debug JSON"), e.createElement("pre", { style: { fontSize: 12, padding: 8, background: "var(--ant-color-fill-tertiary, rgba(0,0,0,0.04))", borderRadius: 4, overflow: "auto" } }, JSON.stringify(n.data ?? n, null, 2)));
    default:
      return e.createElement("div", { style: { padding: 8, border: "1px dashed var(--ant-color-border, #d9d9d9)", borderRadius: 8, fontSize: 12, color: ve.muted, fontFamily: "monospace" } }, `Unknown component: ${a.kind}`);
  }
}
const rt = ["#1677ff", "#52c41a", "#faad14", "#ff4d4f", "#722ed1", "#13c2c2", "#eb2f96"];
function ws({ props: e }) {
  var X, W;
  const t = (W = (X = window.QwenPaw) == null ? void 0 : X.host) == null ? void 0 : W.React;
  if (!t) return null;
  const a = t.useContext(kn(t)), n = P(e.chart) || "line", r = P(e.title);
  let l = Ve(e.categories).map((b) => P(b)), s = Ve(e.series);
  const i = Ce(e.height) || 200, o = e.showLegend !== !1, c = 400, d = e.generator && typeof e.generator == "object" ? e.generator : {}, u = Ve(d.coefficients).map(P), m = ["a", "b", "c", "d", "e"], p = u.length > 0 ? u : m;
  if ((P(d.type) === "polynomial" || u.length > 0 || m.every((b) => {
    var E;
    return ((E = a == null ? void 0 : a.values) == null ? void 0 : E[b]) !== void 0;
  })) && a) {
    const b = typeof d.xMin == "number" ? d.xMin : -3, E = typeof d.xMax == "number" ? d.xMax : 3, T = Math.min(Math.max(Ce(d.samples) || 61, 10), 400), I = Array.from({ length: T }, ($, O) => b + (E - b) * O / (T - 1)), U = p.map(($) => {
      var O;
      return Ce((O = a.values) == null ? void 0 : O[$]);
    });
    l = I.map(($) => Number($.toFixed(2)).toString()), s = [{ name: P(d.label) || "f(x)", values: I.map(($) => U.reduce((O, z, w) => O + z * Math.pow($, U.length - w - 1), 0)) }];
  }
  const y = s.map((b, E) => {
    const T = b, I = Ve(T.values).map((U) => Ce(U));
    return { name: P(T.name) || `Series ${E + 1}`, values: I };
  });
  if (l.length === 0 || y.length === 0)
    return t.createElement("div", { style: { padding: 12, color: ve.muted, fontSize: 12 } }, "Chart: no data");
  if (n === "pie") {
    const b = y[0].values.map((z) => Math.abs(z)), E = b.reduce((z, w) => z + w, 0) || 1, T = c / 2, I = i / 2, U = Math.min(c, i) / 2 - 20;
    let $ = -Math.PI / 2;
    const O = b.map((z, w) => {
      const le = z / E * 2 * Math.PI, oe = T + U * Math.cos($), B = I + U * Math.sin($), L = T + U * Math.cos($ + le), ne = I + U * Math.sin($ + le), Z = le > Math.PI ? 1 : 0, H = `M ${T} ${I} L ${oe} ${B} A ${U} ${U} 0 ${Z} 1 ${L} ${ne} Z`;
      return $ += le, { path: H, color: rt[w % rt.length], label: l[w] || `#${w + 1}`, val: z };
    });
    return t.createElement(
      "div",
      { style: { margin: "4px 0" } },
      r ? t.createElement("div", { style: { fontSize: 13, fontWeight: 600, marginBottom: 4 } }, r) : null,
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
  const h = y.flatMap((b) => b.values), _ = Math.max(...h, 0), x = Math.min(...h, 0), S = _ - x || 1, v = l.length > 0 ? (c - 40) / l.length : 0, R = y.length > 0 ? Math.max(1, v / y.length - 2) : 0, D = l.length > 1 ? (c - 40) / (l.length - 1) : 0, F = Math.max(1, Math.ceil(l.length / 8)), G = (b) => i - 20 - (b - x) / S * (i - 40), j = G(0), K = (b) => 30 + b * D;
  return t.createElement(
    "div",
    { style: { margin: "4px 0" } },
    r ? t.createElement("div", { style: { fontSize: 13, fontWeight: 600, marginBottom: 4 } }, r) : null,
    t.createElement(
      "svg",
      { width: c, height: i, style: { maxWidth: "100%" } },
      ...[0, 0.25, 0.5, 0.75, 1].map((b, E) => {
        const T = i - 20 - b * (i - 40);
        return t.createElement("line", { key: `g${E}`, x1: 30, y1: T, x2: c - 10, y2: T, stroke: "var(--ant-color-border-secondary, #f0f0f0)", strokeWidth: 1 });
      }),
      ...l.map((b, E) => E % F === 0 || E === l.length - 1 ? t.createElement("text", { key: `x${E}`, x: K(E), y: i - 6, fontSize: 10, fill: ve.muted, textAnchor: "middle" }, b.length > 6 ? b.slice(0, 6) + "…" : b) : null),
      ...y.map((b, E) => {
        const T = rt[E % rt.length];
        if (n === "bar")
          return b.values.map(($, O) => t.createElement("rect", {
            key: `b${E}-${O}`,
            x: 30 + O * v + E * (R + 2) + 1,
            y: Math.min(G($), j),
            width: R,
            height: Math.abs(j - G($)),
            fill: T,
            rx: 2
          }));
        const I = b.values.map(($, O) => `${K(O)},${G($)}`).join(" "), U = [t.createElement("polyline", { key: `l${E}`, points: I, fill: "none", stroke: T, strokeWidth: 2 })];
        if (n === "area") {
          const $ = `${K(0)},${i - 20} ${I} ${K(b.values.length - 1)},${i - 20}`;
          U.unshift(t.createElement("polygon", { key: `a${E}`, points: $, fill: T, opacity: 0.15 }));
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
        t.createElement("span", { style: { display: "inline-block", width: 10, height: 10, borderRadius: 2, background: rt[E % rt.length] } }),
        b.name
      ))
    ) : null
  );
}
function Lt(e) {
  var c;
  const t = (c = window.QwenPaw) == null ? void 0 : c.host, a = t == null ? void 0 : t.React;
  if (!a) return null;
  const { useState: n, useEffect: r } = a, [l, s] = n(
    Sa(e.src) || (Dt(e.src) ? e.src : null)
  ), [i, o] = n(
    xa(e.src)
  );
  return r(() => {
    if (!e.src) return;
    if (Dt(e.src)) {
      s(e.src), o(null);
      return;
    }
    const d = Sa(e.src);
    if (d) {
      s(d), o(null);
      return;
    }
    s(null), o(null);
    let u = !1;
    return us(e.src).then((m) => {
      u || (s(m), o(m ? null : xa(e.src)));
    }), () => {
      u = !0;
    };
  }, [e.src]), l ? a.createElement("img", {
    src: l,
    alt: e.alt || "",
    style: e.style || {},
    onError: () => {
      console.warn("[ugsci.genui] Image failed to load:", e.src);
    }
  }) : a.createElement(
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
function Ta(e) {
  var r, l, s;
  const t = (r = window.QwenPaw) == null ? void 0 : r.host, a = t == null ? void 0 : t.React, n = (t == null ? void 0 : t.antd) || {};
  return a ? e.src ? a.createElement(Lt, {
    src: e.src,
    alt: e.name,
    style: {
      width: e.size,
      height: e.size,
      borderRadius: "50%",
      objectFit: "cover"
    }
  }) : a.createElement(
    n.Avatar || "div",
    { size: e.size },
    ((s = (l = e.name) == null ? void 0 : l.charAt(0)) == null ? void 0 : s.toUpperCase()) || ""
  ) : null;
}
async function Ss(e, t) {
  var d;
  const a = e.getBoundingClientRect(), n = Math.min(window.devicePixelRatio || 1, 2), r = document.createElement("canvas");
  r.width = Math.ceil(a.width * n), r.height = Math.ceil(Math.max(a.height, e.scrollHeight) * n);
  const l = r.getContext("2d");
  if (!l) throw new Error("canvas is unavailable");
  l.scale(n, n), l.fillStyle = "#fff", l.fillRect(0, 0, r.width, r.height);
  for (const u of Array.from(e.querySelectorAll("*"))) {
    const m = u.getBoundingClientRect();
    if (!m.width || !m.height) continue;
    const p = getComputedStyle(u), f = m.left - a.left, y = m.top - a.top;
    p.backgroundColor && p.backgroundColor !== "rgba(0, 0, 0, 0)" && (l.fillStyle = p.backgroundColor, l.fillRect(f, y, m.width, m.height)), p.borderTopWidth !== "0px" && (l.strokeStyle = p.borderTopColor, l.strokeRect(f, y, m.width, m.height));
  }
  const s = document.createTreeWalker(e, NodeFilter.SHOW_TEXT);
  for (; s.nextNode(); ) {
    const u = s.currentNode, m = (d = u.textContent) == null ? void 0 : d.trim();
    if (!m) continue;
    const p = document.createRange();
    p.selectNodeContents(u);
    const f = p.getBoundingClientRect(), y = u.parentElement;
    if (!y || !f.width) continue;
    const h = getComputedStyle(y);
    l.font = `${h.fontWeight} ${h.fontSize} ${h.fontFamily}`, l.fillStyle = h.color || "#111", l.textBaseline = "top", l.fillText(m, f.left - a.left, f.top - a.top, Math.max(1, a.width - (f.left - a.left)));
  }
  for (const u of Array.from(e.querySelectorAll("input,textarea"))) {
    if (!u.value) continue;
    const m = u.getBoundingClientRect(), p = getComputedStyle(u);
    l.font = `${p.fontSize} ${p.fontFamily}`, l.fillStyle = p.color || "#111", l.fillText(u.value, m.left - a.left + 8, m.top - a.top + 6);
  }
  const i = await new Promise((u, m) => r.toBlob((p) => p ? u(p) : m(new Error("PNG encoding failed")), "image/png")), o = URL.createObjectURL(i), c = document.createElement("a");
  c.download = `${t}.png`, c.href = o, c.click(), setTimeout(() => URL.revokeObjectURL(o), 1e3), console.info("[ugsci.genui] PNG export created", { filename: t, bytes: i.size });
}
function xs(e, t) {
  const a = window.open("", "_blank", "noopener,noreferrer");
  if (!a) throw new Error("print window was blocked");
  a.document.write(`<!doctype html><html><head><title>${t}</title><style>body{font-family:system-ui;padding:24px}@media print{button{display:none}}</style></head><body>${e.outerHTML}</body></html>`), a.document.close(), a.addEventListener("load", () => {
    a.focus(), a.print(), a.close();
  }, { once: !0 });
}
const ks = [], it = /* @__PURE__ */ new Map();
function Cs(e) {
  it.set(e, (it.get(e) || 0) + 1);
}
function Ts(e) {
  const t = (it.get(e) || 1) - 1;
  t > 0 ? it.set(e, t) : it.delete(e);
}
function _s(e) {
  return (it.get(e) || 0) > 0;
}
function Is({ data: e }) {
  var d, u;
  const t = (d = window.QwenPaw) == null ? void 0 : d.host, a = t == null ? void 0 : t.React;
  if (!a) return null;
  const n = es(), r = ((u = t.getCurrentSessionId) == null ? void 0 : u.call(t)) || "__current_chat__", l = Array.isArray(e.output) ? e.output : ks, s = a.useMemo(
    () => ar(l),
    [l]
  );
  a.useEffect(() => {
    for (const m of s) {
      if (!m.ui_id || !m.tree) continue;
      const p = n.getSnapshot(r, m.ui_id);
      p && p.revision >= (m.revision || 1) || n.setSnapshot({
        schemaVersion: "1",
        uiId: m.ui_id,
        revision: m.revision || 1,
        tree: m.tree,
        sessionId: r,
        sourceToolCallId: m.tool_call_id,
        updatedAt: Date.now()
      });
    }
  }, [s, r]);
  const i = a.useMemo(
    () => s.filter((m) => m.kind === "genui" && !!m.ui_id).map((m) => m.ui_id),
    [s]
  ), o = i.join("\0");
  a.useEffect(() => {
    for (const m of i) Cs(m);
    return () => {
      for (const m of i) Ts(m);
    };
  }, [o]);
  const c = Object.values(n.snapshots).filter((m) => m.sessionId === r).filter(
    (m) => (
      // Only include snapshots whose ui_id appears in this response's results
      s.some(
        (p) => p.ui_id === m.uiId && (p.kind === "genui" || p.kind === "genui_patch" && !_s(m.uiId))
      )
    )
  ).sort((m, p) => m.updatedAt - p.updatedAt);
  return c.length === 0 ? null : a.createElement(
    "div",
    { className: "qwenpaw-genui-inline", style: { marginTop: 8, marginBottom: 8 } },
    ...c.map(
      (m) => a.createElement(
        "div",
        {
          key: Nt(m.sessionId, m.uiId),
          className: "qwenpaw-genui-tree",
          "data-genui-id": m.uiId,
          style: { border: "1px solid var(--ant-color-border-secondary, #f0f0f0)", borderRadius: 12, padding: 16, marginBottom: 8, background: "var(--ant-color-bg-container, #fff)" },
          ref: (p) => {
            p && (p.__genuiId = m.uiId);
          }
        },
        a.createElement(
          "div",
          { className: "qwenpaw-genui-export-target" },
          a.createElement(ys, {
            node: m.tree.root,
            children: a.createElement(st, { node: m.tree.root })
          })
        ),
        a.createElement(
          "div",
          { style: { display: "flex", justifyContent: "flex-end", gap: 6, marginTop: 8 } },
          a.createElement("button", { type: "button", title: "导出 PNG", onClick: (p) => {
            var y;
            const f = (y = p.currentTarget.closest(".qwenpaw-genui-tree")) == null ? void 0 : y.querySelector(".qwenpaw-genui-export-target");
            f && Ss(f, m.uiId).catch((h) => console.warn("[ugsci.genui] PNG export failed", h));
          } }, "PNG"),
          a.createElement("button", { type: "button", title: "打印或另存为 PDF", onClick: (p) => {
            var y;
            const f = (y = p.currentTarget.closest(".qwenpaw-genui-tree")) == null ? void 0 : y.querySelector(".qwenpaw-genui-export-target");
            f && xs(f, m.uiId);
          } }, "PDF")
        )
      )
    )
  );
}
let lt = null;
function zs(e, t) {
  var r, l, s;
  const a = "ugsci";
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
  }), (r = e.chat) != null && r.toolRender && (n.push(e.chat.toolRender(a, "emit_ui_tree", Ot)), n.push(e.chat.toolRender(a, "emit_ui_patch", Ot)), n.push(e.chat.toolRender(a, "list_ui_components", Ot)), n.push(e.chat.toolRender(a, "get_genui_guide", Ot)), console.info("[ugsci.genui] Registered 4 tool card renderers")), (s = (l = e.chat) == null ? void 0 : l.response) != null && s.append && (n.push(e.chat.response.append(
    a,
    (i) => t.createElement(Zo, null, t.createElement(Is, { data: i.data })),
    { id: "ugsci.genui.response-append", order: 50 }
  )), console.info("[ugsci.genui] Registered response.append slot")), lt = () => {
    var i;
    for (const o of n.reverse()) (i = o == null ? void 0 : o.dispose) == null || i.call(o);
    ts(), fs(), lt = null;
  }, lt;
}
const _a = {
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
function As() {
  const e = A().React, { Alert: t, Card: a, Space: n, Spin: r, Switch: l, Typography: s, message: i } = A().antd, { useEffect: o, useState: c } = e, [d, u] = c(null), [m, p] = c(!1);
  o(() => {
    let y = !0, h = null;
    const _ = (x = !1) => {
      ce("/ugsci/genui/config").then((S) => {
        y && (u(S), on(S));
      }).catch((S) => {
        y && (u(_a), on(_a), x && i.error(String(S)), h = setTimeout(() => _(!1), 3e4));
      });
    };
    return _(!0), () => {
      y = !1, h && clearTimeout(h);
    };
  }, []);
  const f = async (y) => {
    p(!0);
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
      p(!1);
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
      a,
      null,
      d === null ? e.createElement(r) : e.createElement(
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
            loading: m,
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
function ir() {
  return yt || (yt = (async () => {
    var n;
    const e = (n = window.QwenPaw) == null ? void 0 : n.host;
    if (!(e != null && e.getApiUrl))
      throw new Error("[oilgas-vis] QwenPaw.host.getApiUrl not available");
    const t = e.getApiUrl(
      "frontend_plugin/ugsci/files/ui/dist/viewer-runtime.js"
    );
    console.info("[oilgas-vis] Loading viewer runtime from", t), await new Promise((r, l) => {
      const s = document.createElement("script");
      s.dataset.plugin = "ugsci", s.src = t, s.onload = () => r(), s.onerror = () => l(new Error("Viewer runtime failed to load")), document.head.appendChild(s);
    });
    const a = window.OilGasViewerRuntime;
    if (!a)
      throw new Error(
        "[oilgas-vis] window.OilGasViewerRuntime not found after script load"
      );
    return console.info(
      "[oilgas-vis] Viewer runtime loaded, version:",
      a.version
    ), a;
  })().catch((e) => {
    throw yt = null, e;
  }), yt);
}
function $s() {
  const e = A().React, { useEffect: t, useRef: a, useState: n } = e, { Spin: r, Alert: l, Button: s, Typography: i, message: o } = A().antd, { Text: c } = i, d = a(null), u = a(null), [m, p] = n(!0), [f, y] = n(null);
  return t(() => {
    let h = !1;
    async function _() {
      if (d.current)
        try {
          p(!0), y(null);
          const x = await ir();
          if (h) return;
          const S = A(), R = {
            apiBase: S.getApiUrl("ugsci/visualization"),
            authToken: S.getApiToken() || void 0
          };
          u.current = x.mount(d.current, R), h || p(!1);
        } catch (x) {
          if (!h) {
            const S = x instanceof Error ? x.message : "Failed to load viewer";
            y(S), p(!1), o.error(`可视化引擎加载失败: ${S}`);
          }
        }
    }
    return _(), () => {
      if (h = !0, u.current) {
        try {
          u.current.dispose();
        } catch (x) {
          console.warn("[oilgas-vis] Dispose error:", x);
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
      e.createElement(r, { size: "large" }),
      e.createElement(
        "div",
        { style: { marginTop: 16, color: "#8b949e" } },
        "正在加载三维可视化引擎..."
      )
    )
  );
}
function cr(e, t) {
  var r;
  const a = ((r = e.getApiToken) == null ? void 0 : r.call(e)) || "", n = typeof e.buildAuthHeaders == "function" ? { ...e.buildAuthHeaders(t.agentId) } : a ? { Authorization: `Bearer ${a}` } : {};
  return t.agentId && (n["X-Agent-Id"] = t.agentId), t.chatId && (n["X-Chat-Id"] = t.chatId), !t.chatId && t.projectDirOverride && (n["X-Session-Project-Dir"] = t.projectDirOverride), n;
}
async function dr(e, t, a) {
  if (typeof e.fetch == "function")
    return e.fetch(t, a);
  const n = t.replace(/^\/ugsci\/visualization/, "");
  return fetch(`${e.getApiUrl("ugsci/visualization")}${n}`, a);
}
function Ia(e) {
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
function Ps({ jobId: e, file: t }) {
  const a = A().React, { useEffect: n, useRef: r, useState: l } = a, s = A(), i = r(null), o = r(null), [c, d] = l("queued"), [u, m] = l(0), [p, f] = l(null), [y, h] = l(null);
  return n(() => {
    let _ = !1;
    return (async () => {
      var v;
      const S = `/ugsci/visualization/imports/${e}`;
      for (let R = 0; R < 240 && !_; R += 1) {
        try {
          const D = await dr(s, S, {
            headers: { ...cr(s, t) }
          });
          if (!D.ok) throw new Error(`状态查询失败: HTTP ${D.status}`);
          const F = await D.json();
          if (_) return;
          if (m(Number(F.progress || 0)), d(F.status), F.status === "completed") {
            if (!((v = F.result) != null && v.id)) throw new Error("导入完成但未返回数据集 ID");
            h(F.result.id);
            return;
          }
          if (F.status === "failed" || F.status === "cancelled") {
            f(F.error || Ia(F.status));
            return;
          }
        } catch (D) {
          if (R >= 239 && !_) {
            d("failed"), f(D instanceof Error ? D.message : String(D));
            return;
          }
        }
        await new Promise((D) => setTimeout(D, 750));
      }
    })(), () => {
      _ = !0;
    };
  }, [e, t.agentId, t.chatId, t.projectDirOverride]), n(() => {
    if (c !== "completed" || !y || !i.current) return;
    let _ = !1;
    return (async () => {
      var x, S;
      try {
        const v = await ir();
        if (_ || !i.current) return;
        o.current = v.mount(i.current, {
          apiBase: s.getApiUrl("ugsci/visualization"),
          authToken: s.getApiToken() || void 0
        });
        let R;
        for (let D = 0; D < 20 && !_; D += 1)
          try {
            await ((S = (x = o.current).executeCommand) == null ? void 0 : S.call(x, "open", { datasetId: y })), R = void 0;
            break;
          } catch (F) {
            R = F;
            const G = F instanceof Error ? F.message : String(F);
            if (!G.includes("数据集不存在") && !G.includes("dataset"))
              throw F;
            await new Promise((j) => setTimeout(j, 250));
          }
        if (R && !_) throw R;
      } catch (v) {
        _ || (d("failed"), f(v instanceof Error ? v.message : String(v)));
      }
    })(), () => {
      var x;
      _ = !0;
      try {
        (x = o.current) == null || x.dispose();
      } catch {
      }
      o.current = null;
    };
  }, [c, y]), a.createElement(
    "div",
    { style: { width: "100%", marginTop: 8 } },
    c === "completed" ? a.createElement("div", {
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
    }) : a.createElement(
      "div",
      { style: { padding: "12px 16px", width: "100%", color: "#8b949e" } },
      `${Ia(c)}${u > 0 ? `（${Math.round(u * 100)}%）` : ""}`
    ),
    p ? a.createElement(
      "div",
      { style: { marginTop: 6, color: "#ff7875", fontSize: 12 } },
      `预览状态：${p}`
    ) : null
  );
}
function Os(e) {
  const t = A().React, { useEffect: a, useState: n } = t, { Button: r, Spin: l, Alert: s, Typography: i } = A().antd, { Text: o } = i, c = e.artifact || e.file || {}, d = c.filename || c.title || e.filename || "unknown", u = c.workspacePath || c.path || e.workspacePath, [m, p] = n("idle"), [f, y] = n(null), [h, _] = n(null);
  return a(() => {
    if (!u) return;
    let x = !1;
    return p("submitting"), y(null), _(null), (async () => {
      try {
        const S = A(), v = await dr(S, "/ugsci/visualization/imports/workspace", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...cr(S, c)
          },
          body: JSON.stringify({
            path: u,
            root: c.workspaceRoot || "project",
            name: d.replace(/\.[^.]+$/, "")
          })
        });
        if (!v.ok) throw new Error(`Import failed: HTTP ${v.status}`);
        const R = await v.json();
        x || (y(R.job_id), p("submitted"));
      } catch (S) {
        x || (_(S instanceof Error ? S.message : String(S)), p("failed"));
      }
    })(), () => {
      x = !0;
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
    t.createElement(s, {
      type: "warning",
      message: "导入失败",
      description: h,
      showIcon: !0
    }),
    t.createElement(r, {
      type: "primary",
      onClick: () => window.location.reload(),
      style: { marginTop: 12 }
    }, "重试")
  ) : t.createElement(
    "div",
    { style: { padding: 24, display: "flex", flexDirection: "column", gap: 12, alignItems: "center" } },
    t.createElement(o, { strong: !0 }, `文件: ${d}`),
    c.size ? t.createElement(o, { type: "secondary" }, `大小: ${(c.size / 1024 / 1024).toFixed(1)} MB`) : null,
    f ? t.createElement(Ps, { jobId: f, file: c }) : t.createElement(o, { type: "secondary" }, "正在准备导入任务..."),
    t.createElement(r, {
      type: "primary",
      onClick: () => {
        window.history.pushState({}, "", "/oilgas-visualization"), window.dispatchEvent(new PopStateEvent("popstate"));
      }
    }, "打开油气可视化页面")
  );
}
function Ms(e, t) {
  const a = "__ugsciVisualizationFrontendRegistered", n = window;
  if (n[a]) return;
  n[a] = !0;
  const r = A().antdIcons || {}, l = r.GlobalOutlined || r.AppstoreOutlined;
  e.route.add("ugsci", {
    id: "ugsci.visualization",
    path: "/oilgas-visualization",
    component: $s
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
        component: Os,
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
function Rs() {
  var c, d, u;
  const e = window.QwenPaw;
  if (!(e != null && e.menu) || !(e != null && e.route)) {
    console.warn(
      "[ugsci] QwenPaw.menu/route API not available — plugin disabled"
    );
    return;
  }
  const t = A().React, a = "ugsci";
  (d = (c = e.chat) == null ? void 0 : c.rightHeader) != null && d.add ? (e.chat.rightHeader.add(a, t.createElement(qo), {
    id: "ugsci.welcome-injector",
    order: -1
    // render before other right-header items (invisible anyway)
  }), console.info("[ugsci] WelcomePromptsInjector registered via rightHeader")) : console.warn(
    "[ugsci] QP.chat.rightHeader.add not available — agent-specific welcome prompts disabled"
  );
  const n = A().antdIcons || {}, r = n.UserSwitchOutlined, l = n.ToolOutlined, s = n.ShopOutlined, i = n.AppstoreOutlined;
  e.route.add(a, {
    id: "ugsci.experts",
    path: "/ugsci-experts",
    component: Jl
  }), e.menu.add(a, {
    id: "ugsci.experts",
    location: "primary.agentScoped",
    label: () => "专家·协作",
    icon: r ? t.createElement(r, { style: { fontSize: 16 } }) : void 0,
    route: "ugsci.experts",
    order: 5,
    visible: () => gt()
  }), e.route.add(a, {
    id: "ugsci.genui-settings",
    path: "/ugsci-genui-settings",
    component: As
  }), e.menu.add(a, {
    id: "ugsci.genui-settings",
    location: "primary.settings",
    parentId: "plugins-group",
    label: () => "GenUI 设置",
    icon: i ? t.createElement(i, { style: { fontSize: 16 } }) : void 0,
    route: "ugsci.genui-settings",
    order: 30
  }), e.route.add(a, {
    id: "ugsci.tools-skills",
    path: "/ugsci-tools-skills",
    component: qa
  }), e.menu.add(a, {
    id: "ugsci.tools-skills",
    location: "primary.agentScoped",
    label: () => "工具·技能",
    icon: l ? t.createElement(l, { style: { fontSize: 16 } }) : void 0,
    route: "ugsci.tools-skills",
    order: 6,
    visible: () => gt()
  }), e.route.add(a, {
    id: "ugsci.capabilities",
    path: "/ugsci-capabilities",
    component: Co
  }), e.route.add(a, {
    id: "ugsci.skills-center",
    path: "/ugsci-skills",
    component: To
  }), e.route.add(a, {
    id: "ugsci.market",
    path: "/ugsci-market",
    component: Jo
  }), e.menu.add(a, {
    id: "ugsci.market",
    location: "primary.agentScoped",
    label: () => "市场",
    icon: s ? t.createElement(s, { style: { fontSize: 16 } }) : void 0,
    route: "ugsci.market",
    order: 7,
    visible: () => gt()
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
  for (const m of o) {
    try {
      const f = e.menu.snapshot("primary.agentScoped").find((y) => y.id === m);
      f && e.menu.replace(a, m, {
        ...f,
        visible: () => !gt()
      });
    } catch {
    }
    try {
      const f = e.menu.snapshot("primary.settings").find((y) => y.id === m);
      f && e.menu.replace(a, m, {
        ...f,
        visible: () => !gt()
      });
    } catch {
    }
  }
  try {
    const p = e.menu.snapshot("primary.agentScoped").find((f) => f.id === "oilgas-vis.page");
    p && e.menu.replace(a, "oilgas-vis.page", {
      ...p,
      visible: () => !1
    });
  } catch {
  }
  zs(e, t), Ms(e, t), console.info(
    "[ugsci] Plugin registered: unified Tools & Skills center + compatibility routes, simple-mode navigation active"
  );
}
function gn() {
  try {
    Rs();
  } catch (e) {
    console.error("[ugsci] Failed to build plugin:", e), setTimeout(gn, 500);
  }
}
var za;
if ((za = window.QwenPaw) != null && za.host)
  gn();
else {
  const e = setInterval(() => {
    var t;
    (t = window.QwenPaw) != null && t.host && (clearInterval(e), gn());
  }, 200);
  setTimeout(() => clearInterval(e), 1e4);
}
