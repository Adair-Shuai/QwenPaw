function _() {
  var t;
  const e = (t = window.QwenPaw) == null ? void 0 : t.host;
  if (!e) throw new Error("[ugsci] QwenPaw.host not available");
  return e;
}
function kr() {
  try {
    return _().getApiToken() || "";
  } catch {
    return "";
  }
}
function Ft(e) {
  return _().getApiUrl(e);
}
function Cr(e) {
  const t = kr();
  return {
    "Content-Type": "application/json",
    ...t ? { Authorization: `Bearer ${t}` } : {},
    ...e
  };
}
function Tr(e) {
  const t = new Headers(e), a = {};
  return t.forEach((n, r) => {
    a[r] = n;
  }), a;
}
function Ve(e, t) {
  const a = _(), n = Tr(t == null ? void 0 : t.headers);
  return a.fetch ? a.fetch(e, { ...t, headers: n }) : fetch(a.getApiUrl(e), {
    ...t,
    headers: { ...Cr(), ...n }
  });
}
const bt = /* @__PURE__ */ new Map(), _r = 15e3;
function Ir(e) {
  return e ? e instanceof Headers ? e.get("X-Agent-Id") || e.get("x-agent-id") || "" : e["X-Agent-Id"] || e["x-agent-id"] || "" : "";
}
function zr(e, t, a) {
  return `${e}:${t}:${a}`;
}
function St() {
  bt.clear();
}
function gn(e) {
  for (const [t, a] of bt)
    (e ? a.agentId === e : a.agentId) && bt.delete(t);
}
async function se(e, t) {
  const a = ((t == null ? void 0 : t.method) || "GET").toUpperCase(), { bypassCache: n, ...r } = t || {}, l = Ir(
    r.headers
  ), o = zr(a, e, l);
  if (a !== "GET" && (l ? gn(l) : St()), a === "GET" && !n) {
    const c = bt.get(o);
    if (c && Date.now() - c.ts < _r)
      return c.data;
  }
  const i = await Ve(e, r);
  if (!i.ok) {
    const c = await i.text().catch(() => "");
    throw new Error(c || `HTTP ${i.status}`);
  }
  if (i.status === 204) return null;
  const s = await i.json();
  return a === "GET" && bt.set(o, {
    data: s,
    ts: Date.now(),
    agentId: l || void 0
  }), s;
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
  const a = _();
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
  const n = _().React, { Space: r } = _().antd;
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
  const e = await se("/agents");
  return (e == null ? void 0 : e.agents) || [];
}
async function fn(e) {
  return se(
    `/agents/${encodeURIComponent(e)}`
  );
}
async function qt(e) {
  return await se(
    `/agents/${encodeURIComponent(e)}/skills`
  ) || [];
}
async function Vt(e = !1) {
  return await se(`/skills/pool${e ? "?summary=true" : ""}`) || [];
}
async function Ar(e) {
  const t = await se(
    `/skills/pool/${encodeURIComponent(e)}/content`
  );
  return (t == null ? void 0 : t.content) || "";
}
async function $r() {
  return (await se(
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
function _a(e) {
  var a;
  const t = [];
  for (const n of e) {
    if (n.enabled === !1) continue;
    const r = (a = n.description) == null ? void 0 : a.trim();
    if (!r) continue;
    const l = (n.name || r).length > 20 ? (n.name || r).substring(0, 18) + "…" : n.name || r;
    let o = r;
    if (o = o.replace(/\*\*(.+?)\*\*/g, "$1").replace(/\*(.+?)\*/g, "$1").replace(/`(.+?)`/g, "$1").replace(/^#+\s*/gm, "").trim(), /^(用于|帮助|提供|支持|实现|完成|分析|计算|生成|创建|检查)/.test(o) ? o = `请${o}` : /^(a |an |the )/i.test(o) ? o = `Help me with ${o}` : /[。？！.?!]$/.test(o) || (o = `帮我${o}`), o.length > 80 && (o = o.substring(0, 77) + "..."), t.push({ label: l, value: o }), t.length >= 4) break;
  }
  return t;
}
async function Pr(e) {
  return await se("/workspace/files", {
    headers: { "X-Agent-Id": e }
  }) || [];
}
async function Bt(e, t, a) {
  return se(`/workspace/files/${encodeURIComponent(t)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify({ content: a })
  });
}
async function Or(e, t, a, n) {
  return se("/workspace/prompt-files", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify({ filename: t, content: a, enable: n })
  });
}
const Mr = /* @__PURE__ */ new Set([
  "CON",
  "PRN",
  "AUX",
  "NUL",
  ...Array.from({ length: 9 }, (e, t) => `COM${t + 1}`),
  ...Array.from({ length: 9 }, (e, t) => `LPT${t + 1}`)
]);
function Rr(e) {
  let t = e.trim();
  if (!t) throw new Error("请输入文件名");
  if (/[\\/]/.test(t)) throw new Error("文件名不能包含路径分隔符");
  if (/[<>:\"|?*\u0000-\u001f]/.test(t))
    throw new Error("文件名包含系统不支持的字符");
  if (/[ .]$/.test(t)) throw new Error("文件名不能以空格或句点结尾");
  t.toLowerCase().endsWith(".md") ? t = `${t.slice(0, -3)}.md` : t += ".md";
  const a = t.split(".", 1)[0].toUpperCase();
  if (!t.slice(0, -3)) throw new Error("文件名不能为空");
  if (Mr.has(a))
    throw new Error("该文件名是系统保留名称，请更换");
  if (new TextEncoder().encode(t).length > 255)
    throw new Error("文件名过长");
  return t;
}
async function Lr(e, t) {
  const a = await fn(e);
  a.system_prompt_files = t, await se(`/agents/${encodeURIComponent(e)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(a)
  });
}
async function yn(e, t) {
  await se("/skills/pool/download", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      skill_name: t,
      targets: [{ workspace_id: e }],
      overwrite: !1
    })
  });
}
async function Ia(e, t) {
  await se(
    dt(e, `/${encodeURIComponent(t)}/enable`),
    {
      method: "POST"
    }
  );
}
async function hn(e, t) {
  await se(dt(e, `/${encodeURIComponent(t)}`), {
    method: "DELETE"
  });
}
async function Br(e, t) {
  return se(dt(e, "/batch-enable"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(t)
  });
}
async function Ur(e, t) {
  return se(dt(e, "/batch-disable"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(t)
  });
}
async function jr(e, t) {
  return se(dt(e, "/batch-delete"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(t)
  });
}
async function En(e) {
  return await se("/mcp", {
    headers: { "X-Agent-Id": e }
  }) || [];
}
async function za(e, t) {
  await se(`/mcp/${encodeURIComponent(t)}`, {
    method: "DELETE",
    headers: { "X-Agent-Id": e }
  });
}
async function vn(e, t) {
  return se("/mcp", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify(t)
  });
}
async function Nr(e, t) {
  return se(
    `/mcp/toggle/${encodeURIComponent(t)}`,
    {
      method: "PATCH",
      headers: { "X-Agent-Id": e }
    }
  );
}
async function Aa(e, t) {
  await se(
    dt(e, `/${encodeURIComponent(t)}/disable`),
    {
      method: "POST"
    }
  );
}
async function Dr(e) {
  await se(`/skills/pool/${encodeURIComponent(e)}`, {
    method: "DELETE"
  });
}
function Gr(e) {
  const t = (e || "").trim();
  if (!t) return { number: 6, unit: "h" };
  const a = t.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/i);
  if (!a) return { number: 6, unit: "h" };
  const n = parseInt(a[1] || "0", 10), r = parseInt(a[2] || "0", 10), l = parseInt(a[3] || "0", 10), o = n * 60 + r + Math.round(l / 60);
  return o <= 0 ? { number: 6, unit: "h" } : o >= 60 && o % 60 === 0 ? { number: o / 60, unit: "h" } : { number: o, unit: "m" };
}
function Fr(e) {
  return e.unit === "h" ? `${e.number}h` : `${e.number}m`;
}
async function Wr(e) {
  return se("/config/heartbeat", {
    headers: { "X-Agent-Id": e }
  });
}
async function Hr(e, t) {
  return se("/config/heartbeat", {
    method: "PUT",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify(t)
  });
}
async function Jr(e) {
  await se("/config/heartbeat/run", {
    method: "POST",
    headers: { "X-Agent-Id": e }
  });
}
async function qr(e) {
  return se("/workspace/running-config", {
    headers: { "X-Agent-Id": e }
  });
}
async function Vr(e, t) {
  return se("/workspace/running-config", {
    method: "PUT",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify(t)
  });
}
async function Kr(e) {
  return (await se("/workspace/language", {
    headers: { "X-Agent-Id": e }
  })).language || "zh";
}
async function Xr(e, t) {
  await se("/workspace/language", {
    method: "PUT",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify({ language: t })
  });
}
async function Qr() {
  return (await se("/config/user-timezone")).timezone || "UTC";
}
async function Yr(e) {
  await se("/config/user-timezone", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ timezone: e })
  });
}
async function Zr(e) {
  return await se("/workspace/system-prompt-files", {
    headers: { "X-Agent-Id": e }
  }) || [];
}
const Xn = ["AGENTS.md", "SOUL.md", "PROFILE.md"];
function Qn({
  items: e,
  max: t = 5,
  color: a = "blue",
  emptyText: n = "无"
}) {
  const r = _().React, { Tag: l } = _().antd;
  return !e || e.length === 0 ? r.createElement(
    "span",
    { style: { fontSize: 12, color: "var(--ant-color-text-quaternary, #bfbfbf)" } },
    n
  ) : r.createElement(
    "div",
    { style: { display: "flex", flexWrap: "wrap", gap: 4 } },
    ...e.slice(0, t).map(
      (o, i) => r.createElement(
        l,
        { key: i, color: a, style: { fontSize: 11, marginRight: 0 } },
        o
      )
    ),
    e.length > t ? r.createElement(
      l,
      { style: { fontSize: 11, marginRight: 0 } },
      `+${e.length - t}`
    ) : null
  );
}
function $a({
  open: e,
  onClose: t,
  poolSkills: a,
  installedSkillNames: n,
  loading: r,
  onInstall: l
}) {
  const o = _().React, { useState: i, useEffect: s, useMemo: c } = o, { Modal: d, Button: u, Empty: m, Spin: p, Input: f, Tag: y, Tooltip: h, Typography: C } = _().antd, { CheckOutlined: w, SearchOutlined: S } = _().antdIcons || {}, { Text: A } = C, [R, D] = i([]), [G, N] = i("");
  s(() => {
    e && (D([]), N(""));
  }, [e]);
  const B = c(() => {
    if (!G.trim()) return a;
    const b = G.toLowerCase();
    return a.filter(
      (v) => {
        var I, T;
        return v.name.toLowerCase().includes(b) || ((I = v.description) == null ? void 0 : I.toLowerCase().includes(b)) || ((T = v.tags) == null ? void 0 : T.some((U) => U.toLowerCase().includes(b)));
      }
    );
  }, [a, G]), J = B.filter(
    (b) => !n.includes(b.name)
  ), Q = (b) => {
    D(
      (v) => v.includes(b) ? v.filter((I) => I !== b) : [...v, b]
    );
  }, O = async () => {
    R.length !== 0 && (await l(R), D([]));
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
          A,
          { type: "secondary", style: { fontSize: 13 } },
          `已选择 ${R.length} 个技能`
        ),
        o.createElement(
          "div",
          { style: { display: "flex", gap: 8 } },
          o.createElement(u, { onClick: t }, "取消"),
          o.createElement(
            u,
            {
              type: "primary",
              onClick: O,
              disabled: R.length === 0
            },
            R.length > 0 ? `添加 (${R.length})` : "添加"
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
      o.createElement(f, {
        placeholder: "搜索技能名称、描述或标签...",
        prefix: S ? o.createElement(S) : void 0,
        value: G,
        onChange: (b) => N(b.target.value),
        allowClear: !0,
        style: { flex: 1 }
      }),
      o.createElement(
        u,
        {
          size: "small",
          type: "primary",
          onClick: () => D(J.map((b) => b.name))
        },
        "全选"
      ),
      o.createElement(
        u,
        {
          size: "small",
          onClick: () => D([])
        },
        "清空"
      )
    ),
    // Skill grid (card style matching Skill Center)
    r ? o.createElement(
      "div",
      { style: { textAlign: "center", padding: 40 } },
      o.createElement(p, { size: "large" })
    ) : B.length === 0 ? o.createElement(m, {
      description: G ? "未找到匹配的技能" : "技能池暂无可用技能",
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
      ...B.map((b) => {
        const v = R.includes(b.name), I = n.includes(b.name);
        return o.createElement(
          "div",
          {
            key: b.name,
            onClick: () => !I && Q(b.name),
            style: {
              position: "relative",
              padding: "10px 12px",
              border: `1px solid ${v ? "#0072f5" : "var(--ant-color-border-secondary, #e8e8e8)"}`,
              borderRadius: 6,
              cursor: I ? "not-allowed" : "pointer",
              transition: "all 0.15s ease",
              background: v ? "rgba(0, 114, 245, 0.06)" : I ? "var(--ant-color-fill-quaternary, #fafafa)" : "var(--ant-color-bg-container, #fff)",
              opacity: I ? 0.5 : 1,
              minHeight: 64
            }
          },
          v ? o.createElement(
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
            w ? o.createElement(w) : "✓"
          ) : null,
          I ? o.createElement(
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
                paddingRight: I || v ? 24 : 0
              }
            },
            o.createElement(
              "span",
              { style: { fontSize: 16 } },
              b.emoji || "⚡"
            ),
            o.createElement(
              h,
              { title: b.name },
              o.createElement(
                A,
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
          b.description ? o.createElement(
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
          b.tags && b.tags.length > 0 ? o.createElement(
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
              (T, U) => o.createElement(
                y,
                {
                  key: U,
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
function Pa({
  agentId: e,
  systemPromptFiles: t,
  onRefresh: a
}) {
  const n = _().React, { useState: r, useEffect: l, useCallback: o, useRef: i } = n, {
    List: s,
    Tag: c,
    Switch: d,
    Button: u,
    Modal: m,
    Input: p,
    Spin: f,
    Empty: y,
    message: h,
    Typography: C,
    Segmented: w,
    Alert: S
  } = _().antd, { FileTextOutlined: A, PlusOutlined: R, EditOutlined: D, ReloadOutlined: G } = _().antdIcons || {}, { Text: N } = C, [B, J] = r([]), [Q, O] = r(!0), [b, v] = r(
    t || []
  ), [I, T] = r(!1), [U, F] = r(null), [L, $] = r(""), [E, te] = r(""), [V, z] = r(!1), [X, le] = r("source"), Y = i(0), q = o(async () => {
    const ie = ++Y.current;
    O(!0);
    try {
      const re = await Pr(e);
      ie === Y.current && J(re);
    } catch (re) {
      ie === Y.current && (h.error(re.message || "加载工作区文档失败"), J([]));
    } finally {
      ie === Y.current && O(!1);
    }
  }, [e]);
  l(() => {
    q();
  }, [q]), l(() => {
    v(t || []);
  }, [t]);
  const de = async (ie, re) => {
    const ye = new Set(b);
    if (re)
      ye.add(ie);
    else {
      if (Xn.includes(ie) && ie === "AGENTS.md") {
        h.warning("AGENTS.md 是核心文件，不能停用");
        return;
      }
      ye.delete(ie);
    }
    const Ee = Array.from(ye);
    v(Ee);
    try {
      await Lr(e, Ee), h.success(re ? "已启用记忆文件" : "已停用记忆文件"), a();
    } catch (ke) {
      h.error(ke.message || "更新失败"), v(t || []);
    }
  }, M = async (ie) => {
    try {
      const re = await se(
        `/workspace/files/${encodeURIComponent(ie)}`,
        { headers: { "X-Agent-Id": e } }
      );
      F(ie), $(re.content || ""), le("source"), T(!0);
    } catch (re) {
      h.error(re.message || "读取文件失败");
    }
  }, oe = () => {
    F(null), $(""), te(""), le("source"), T(!0);
  }, pe = async () => {
    let ie;
    try {
      ie = Rr(U || E);
    } catch (re) {
      h.warning(re.message || "文件名无效");
      return;
    }
    if (!L.trim()) {
      h.warning("Markdown 文档不能为空");
      return;
    }
    if (new TextEncoder().encode(L).length > 1024 * 1024) {
      h.warning("Markdown 文档不能超过 1 MB");
      return;
    }
    z(!0);
    try {
      if (U)
        await Bt(e, ie, L);
      else {
        const re = await Or(
          e,
          ie,
          L,
          !0
        );
        v(re.system_prompt_files);
      }
      h.success("保存成功"), T(!1), q(), a();
    } catch (re) {
      const ye = re != null && re.message ? `：${re.message}` : "";
      h.error(
        U ? (re == null ? void 0 : re.message) || "保存失败" : `创建并挂载失败，服务端已回滚文件${ye}`
      );
    } finally {
      z(!1);
    }
  };
  return Q ? n.createElement(
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
        A ? n.createElement(A, {
          style: { fontSize: 14, color: "#1677ff" }
        }) : null,
        n.createElement(
          N,
          { strong: !0 },
          `工作区文档 (${B.length})`
        ),
        n.createElement(
          N,
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
            icon: G ? n.createElement(G) : void 0,
            onClick: q
          },
          "刷新"
        ),
        n.createElement(
          u,
          {
            type: "primary",
            size: "small",
            icon: R ? n.createElement(R) : void 0,
            onClick: oe
          },
          "新建 Markdown 文档"
        )
      )
    ),
    B.length === 0 ? n.createElement(y, {
      description: "暂无 Markdown 文档，点击「新建 Markdown 文档」添加",
      image: y.PRESENTED_IMAGE_SIMPLE
    }) : n.createElement(s, {
      dataSource: B,
      renderItem: (ie) => {
        const re = b.includes(ie.filename), ye = Xn.includes(ie.filename);
        return n.createElement(
          s.Item,
          {
            actions: [
              n.createElement(
                u,
                {
                  type: "link",
                  size: "small",
                  icon: D ? n.createElement(D) : void 0,
                  onClick: () => M(ie.filename)
                },
                "编辑"
              )
            ]
          },
          n.createElement(s.Item.Meta, {
            avatar: n.createElement(A, {
              style: {
                fontSize: 20,
                color: re ? "#1677ff" : "var(--ant-color-text-quaternary, #bfbfbf)"
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
              n.createElement(N, null, ie.filename),
              ye ? n.createElement(
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
              `${(ie.size / 1024).toFixed(1)} KB · 修改于 ${new Date(ie.modified_time).toLocaleString()}`
            )
          }),
          n.createElement(d, {
            checked: re,
            size: "small",
            onChange: (Ee) => de(ie.filename, Ee)
          })
        );
      }
    }),
    // Edit/New file modal
    n.createElement(
      m,
      {
        open: I,
        onCancel: () => T(!1),
        title: U ? `编辑 ${U}` : "新建 Markdown 文档",
        width: 700,
        onOk: pe,
        confirmLoading: V,
        okText: "保存"
      },
      U ? null : n.createElement(
        "div",
        { style: { marginBottom: 12 } },
        n.createElement(p, {
          placeholder: "文件名（如：油藏工程记忆库.md）",
          value: E,
          onChange: (ie) => te(ie.target.value),
          addonAfter: E.endsWith(".md") ? "" : ".md"
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
        n.createElement(w, {
          size: "small",
          value: X,
          options: [
            { label: "源码", value: "source" },
            { label: "预览", value: "preview" }
          ],
          onChange: (ie) => le(ie)
        }),
        n.createElement(
          N,
          { type: "secondary", style: { fontSize: 12 } },
          `${L.length} 字符 · 约 ${Math.ceil(L.length / 4)} tokens · ${U && b.includes(U) ? "已挂载" : U ? "未挂载" : "保存后自动挂载"}`
        )
      ),
      L.trim() ? null : n.createElement(S, {
        type: "warning",
        showIcon: !0,
        message: "文档内容为空，保存前需要填写 Markdown 内容",
        style: { marginBottom: 10 }
      }),
      X === "source" ? n.createElement(p.TextArea, {
        value: L,
        onChange: (ie) => $(ie.target.value),
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
        Wt(L, n)
      )
    )
  );
}
function el({
  skills: e,
  agentId: t
}) {
  const a = _().React, { useMemo: n } = a, {
    List: r,
    Tag: l,
    Typography: o,
    Empty: i,
    Button: s,
    message: c
  } = _().antd, { ThunderboltOutlined: d, CopyOutlined: u } = _().antdIcons || {}, { Text: m } = o, p = n(() => _a(e), [e]), f = (h) => {
    try {
      const C = _();
      C.setSelectedAgent && C.setSelectedAgent(t);
    } catch {
    }
    try {
      sessionStorage.setItem("ugsci_pending_prompt", h.value);
    } catch {
    }
    window.history.pushState({}, "", "/chat"), window.dispatchEvent(new PopStateEvent("popstate"));
  }, y = (h) => {
    var C;
    (C = navigator.clipboard) == null || C.writeText(h.value).then(() => {
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
      renderItem: (h, C) => a.createElement(
        r.Item,
        {
          actions: [
            a.createElement(
              s,
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
            `${C + 1}`
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
}, Oa = { marginBottom: 16 }, Ma = {
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
}, Ra = {
  fontSize: 12,
  color: "rgba(0,0,0,0.45)",
  marginLeft: 8
};
function tl({ agentId: e }) {
  const t = _().React, { useState: a, useEffect: n, useCallback: r } = t, {
    Switch: l,
    InputNumber: o,
    Select: i,
    Button: s,
    Spin: c,
    Space: d,
    Typography: u,
    message: m
  } = _().antd, { PlayCircleOutlined: p, SaveOutlined: f } = _().antdIcons || {}, { Text: y } = u, [h, C] = a(!0), [w, S] = a(!1), [A, R] = a(!1), [D, G] = a(!1), [N, B] = a(6), [J, Q] = a("h"), [O, b] = a("main"), [v, I] = a(300), [T, U] = a(!1), [F, L] = a("08:00"), [$, E] = a("22:00"), te = r(async () => {
    var q, de;
    C(!0);
    try {
      const M = await Wr(e), oe = Gr(M.every ?? "6h");
      G(M.enabled ?? !1), B(oe.number), Q(oe.unit), b(M.target ?? "main"), I(M.timeoutSeconds ?? 300), U(!!M.activeHours), L(((q = M.activeHours) == null ? void 0 : q.start) ?? "08:00"), E(((de = M.activeHours) == null ? void 0 : de.end) ?? "22:00");
    } catch (M) {
      m.error(M.message || "加载心跳配置失败");
    } finally {
      C(!1);
    }
  }, [e]);
  n(() => {
    te();
  }, [te]);
  const V = async () => {
    S(!0);
    try {
      await Hr(e, {
        enabled: D,
        every: Fr({ number: N, unit: J }),
        target: O,
        timeoutSeconds: v,
        activeHours: T && F && $ ? { start: F, end: $ } : void 0
      }), m.success("心跳配置已保存");
    } catch (q) {
      m.error(q.message || "保存心跳配置失败");
    } finally {
      S(!1);
    }
  }, z = async () => {
    R(!0);
    try {
      await Jr(e), m.success("已触发心跳检查");
    } catch (q) {
      m.error(q.message || "触发心跳失败");
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
  const X = (q, de, M) => t.createElement(
    "div",
    { style: Oa },
    t.createElement("div", { style: ot }, q),
    de,
    M ? t.createElement(
      y,
      { type: "secondary", style: Ra },
      M
    ) : null
  ), le = (q, de, M, oe) => t.createElement(
    "div",
    { style: Ma },
    t.createElement(
      "div",
      null,
      t.createElement("div", { style: ot }, q),
      de
    ),
    t.createElement(
      "div",
      null,
      t.createElement("div", { style: ot }, M),
      oe
    )
  ), { Divider: Y } = _().antd;
  return t.createElement(
    "div",
    { style: { paddingBottom: 8 } },
    // ── Section: 基本设置 ──
    t.createElement("div", { style: Qe }, "基本设置"),
    X(
      "启用心跳",
      t.createElement(l, {
        checked: D,
        onChange: (q) => G(q)
      }),
      D ? "已启用，专家将定期自检" : "已停用"
    ),
    le(
      "检查频率",
      t.createElement(
        d,
        null,
        t.createElement(o, {
          min: 1,
          value: N,
          onChange: (q) => B(q ?? 1),
          style: { width: "100%" }
        }),
        t.createElement(i, {
          value: J,
          onChange: (q) => Q(q),
          style: { width: 90 },
          options: [
            { value: "m", label: "分钟" },
            { value: "h", label: "小时" }
          ]
        })
      ),
      "心跳目标",
      t.createElement(i, {
        value: O,
        onChange: (q) => b(q),
        style: { width: "100%" },
        options: [
          { value: "main", label: "主会话 (main)" },
          { value: "last", label: "最近会话 (last)" },
          { value: "inbox", label: "收件箱 (inbox)" }
        ]
      })
    ),
    X(
      "超时时间 (秒)",
      t.createElement(o, {
        min: 1,
        max: 3600,
        value: v,
        onChange: (q) => I(q ?? 300),
        style: { width: 200 }
      })
    ),
    // ── Section: 活跃时段 ──
    t.createElement(Y, { style: { margin: "8px 0 16px" } }),
    t.createElement("div", { style: Qe }, "活跃时段"),
    X(
      "启用活跃时段限制",
      t.createElement(l, {
        checked: T,
        onChange: (q) => U(q)
      }),
      "仅在指定时段内触发心跳"
    ),
    T ? le(
      "开始时间",
      t.createElement("input", {
        type: "time",
        value: F,
        onChange: (q) => L(q.target.value),
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
        value: $,
        onChange: (q) => E(q.target.value),
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
        s,
        {
          type: "primary",
          icon: f ? t.createElement(f) : void 0,
          loading: w,
          onClick: V,
          style: Be
        },
        "保存配置"
      ),
      t.createElement(
        s,
        {
          icon: p ? t.createElement(p) : void 0,
          loading: A,
          onClick: z
        },
        "立即执行"
      )
    )
  );
}
function nl({
  agentId: e,
  onRefresh: t
}) {
  const a = _().React, { useState: n, useEffect: r, useCallback: l } = a, {
    List: o,
    Tag: i,
    Switch: s,
    Button: c,
    Empty: d,
    Spin: u,
    Typography: m,
    message: p
  } = _().antd, { PlusOutlined: f, ReloadOutlined: y, DeleteOutlined: h } = _().antdIcons || {}, { Text: C, Paragraph: w } = m, [S, A] = n([]), [R, D] = n(!0), [G, N] = n(!1), [B, J] = n([]), [Q, O] = n(!1), b = l(async () => {
    D(!0);
    try {
      const L = await qt(e);
      A(L);
    } catch (L) {
      p.error(L.message || "加载技能失败"), A([]);
    } finally {
      D(!1);
    }
  }, [e]);
  r(() => {
    b();
  }, [b]);
  const v = async () => {
    N(!0), O(!0);
    try {
      const L = await Vt(!0);
      J(L);
    } catch (L) {
      p.error(L.message || "加载技能池失败");
    } finally {
      O(!1);
    }
  }, I = async (L) => {
    let $ = 0, E = 0;
    for (const te of L)
      try {
        await yn(e, te), $++;
      } catch {
        E++;
      }
    $ > 0 ? (p.success(
      `成功添加 ${$} 个技能${E > 0 ? `，${E} 个失败` : ""}`
    ), b(), t()) : E > 0 && p.error("添加技能失败"), N(!1);
  }, T = async (L, $) => {
    try {
      $ ? await Ia(e, L.name) : await Aa(e, L.name), p.success($ ? "已启用" : "已停用"), b(), t();
    } catch (E) {
      p.error(E.message || "操作失败");
    }
  }, U = async (L) => {
    try {
      await hn(e, L), p.success(`技能「${L}」已移除`), b(), t();
    } catch ($) {
      p.error($.message || "移除技能失败");
    }
  };
  if (R)
    return a.createElement(
      "div",
      { style: { textAlign: "center", padding: 40 } },
      a.createElement(u, { size: "large" })
    );
  const F = S.filter((L) => L.enabled !== !1);
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
        C,
        { strong: !0 },
        `技能列表 (${S.length}，已启用 ${F.length})`
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
            onClick: v,
            style: Be
          },
          "从技能池添加"
        )
      )
    ),
    S.length === 0 ? a.createElement(d, {
      description: "该专家暂无技能",
      image: d.PRESENTED_IMAGE_SIMPLE
    }) : a.createElement(o, {
      dataSource: S,
      renderItem: (L) => a.createElement(
        o.Item,
        {
          actions: [
            a.createElement(s, {
              key: "toggle",
              size: "small",
              checked: L.enabled !== !1,
              onChange: ($) => T(L, $)
            }),
            a.createElement(
              c,
              {
                key: "del",
                type: "link",
                size: "small",
                danger: !0,
                icon: h ? a.createElement(h) : void 0,
                onClick: () => U(L.name)
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
            a.createElement(C, { strong: !0 }, L.name),
            L.version_text ? a.createElement(
              i,
              { style: { fontSize: 10 } },
              `v${L.version_text}`
            ) : null
          ),
          L.description ? a.createElement(
            w,
            {
              type: "secondary",
              style: { fontSize: 12, margin: 0 },
              ellipsis: { rows: 2 }
            },
            L.description
          ) : null
        )
      )
    }),
    a.createElement($a, {
      open: G,
      onClose: () => N(!1),
      poolSkills: B,
      installedSkillNames: S.map((L) => L.name),
      loading: Q,
      onInstall: I
    })
  );
}
function al({
  agentId: e,
  onRefresh: t,
  isActive: a
}) {
  const n = _().React, { useState: r, useEffect: l, useCallback: o } = n, {
    List: i,
    Tag: s,
    Button: c,
    Empty: d,
    Spin: u,
    Modal: m,
    Input: p,
    Typography: f,
    message: y
  } = _().antd, { PlusOutlined: h, ReloadOutlined: C, DeleteOutlined: w } = _().antdIcons || {}, { Text: S, Paragraph: A } = f, { TextArea: R } = p, [D, G] = r([]), [N, B] = r(!0), [J, Q] = r(!1), [O, b] = r(`{
  "mcpServers": {
    "example-client": {
      "command": "npx",
      "args": ["-y", "@example/mcp-server"],
      "env": {}
    }
  }
}`), [v, I] = r(!1), T = o(async () => {
    B(!0);
    try {
      const $ = await En(e);
      G($);
    } catch ($) {
      y.error($.message || "加载 MCP 失败"), G([]);
    } finally {
      B(!1);
    }
  }, [e]);
  l(() => {
    T();
  }, [T]), l(() => {
    a && T();
  }, [a, T]);
  const U = async ($) => {
    try {
      await Nr(e, $), y.success("已切换 MCP 状态"), T(), t();
    } catch (E) {
      y.error(E.message || "切换失败");
    }
  }, F = async ($) => {
    try {
      await za(e, $), y.success(`MCP「${$}」已移除`), T(), t();
    } catch (E) {
      y.error(E.message || "移除 MCP 失败");
    }
  }, L = async () => {
    I(!0);
    try {
      const $ = JSON.parse(O), E = $.mcpServers || $, te = Object.entries(E);
      if (te.length === 0) {
        y.warning("未找到 MCP 客户端配置");
        return;
      }
      for (const [V, z] of te) {
        const X = z, le = X.url ? "streamable_http" : "stdio";
        await vn(e, {
          client_key: V,
          client: {
            name: X.name || V,
            description: X.description || "",
            enabled: !0,
            transport: le,
            url: X.url || "",
            command: X.command || "",
            args: X.args || [],
            env: X.env || {},
            cwd: X.cwd || "",
            headers: X.headers || {}
          }
        });
      }
      y.success("MCP 客户端已创建"), Q(!1), T(), t();
    } catch ($) {
      $ instanceof SyntaxError ? y.error("JSON 格式错误：" + $.message) : y.error($.message || "创建 MCP 失败");
    } finally {
      I(!1);
    }
  };
  return N ? n.createElement(
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
            icon: C ? n.createElement(C) : void 0,
            onClick: () => {
              St(), T();
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
            onClick: () => Q(!0),
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
      renderItem: ($) => n.createElement(
        i.Item,
        {
          actions: [
            n.createElement(
              c,
              {
                key: "toggle",
                size: "small",
                onClick: () => U($.key)
              },
              $.enabled ? "停用" : "启用"
            ),
            n.createElement(
              c,
              {
                key: "del",
                type: "link",
                size: "small",
                danger: !0,
                icon: w ? n.createElement(w) : void 0,
                onClick: () => F($.key)
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
            n.createElement(S, { strong: !0 }, $.name || $.key),
            n.createElement(
              s,
              {
                color: $.enabled ? "green" : "default",
                style: { fontSize: 10 }
              },
              $.enabled ? "启用" : "停用"
            ),
            n.createElement(
              s,
              { color: "purple", style: { fontSize: 10 } },
              $.transport
            )
          ),
          $.description ? n.createElement(
            A,
            {
              type: "secondary",
              style: { fontSize: 12, margin: 0 },
              ellipsis: { rows: 2 }
            },
            $.description
          ) : null,
          $.tools && $.tools.length > 0 ? n.createElement(
            "div",
            { style: { marginTop: 4, fontSize: 11, color: "var(--ant-color-text-tertiary, #8c8c8c)" } },
            `提供 ${$.tools.length} 个工具`
          ) : null
        )
      )
    }),
    // Create MCP modal
    n.createElement(
      m,
      {
        open: J,
        title: "添加 MCP 客户端 (JSON)",
        onCancel: () => Q(!1),
        onOk: L,
        confirmLoading: v,
        okText: "创建",
        width: 560
      },
      n.createElement(
        "div",
        { style: { marginBottom: 8, fontSize: 12, color: "var(--ant-color-text-tertiary, #8c8c8c)" } },
        "粘贴 MCP 配置 JSON（支持 mcpServers 格式），将创建到当前专家工作区："
      ),
      n.createElement(R, {
        value: O,
        onChange: ($) => b($.target.value),
        rows: 12,
        style: { fontFamily: "monospace", fontSize: 12 }
      })
    )
  );
}
function rl({ agentId: e }) {
  const t = _().React, { useState: a, useEffect: n, useCallback: r, useRef: l } = t, {
    Card: o,
    InputNumber: i,
    Input: s,
    Select: c,
    Switch: d,
    Button: u,
    Spin: m,
    Space: p,
    Typography: f,
    Divider: y,
    message: h
  } = _().antd, { SaveOutlined: C } = _().antdIcons || {}, { Text: w } = f, [S, A] = a(!0), [R, D] = a(!1), G = l(null), [N, B] = a(60), [J, Q] = a(""), [O, b] = a(!0), [v, I] = a(30), [T, U] = a("zh"), [F, L] = a("UTC"), [$, E] = a(!0), [te, V] = a(100), [z, X] = a(!0), [le, Y] = a(3), [q, de] = a(1), [M, oe] = a(!0), [pe, ie] = a(3), [re, ye] = a(2), [Ee, ke] = a(60), [Pe, we] = a(1), [ae, Se] = a(0), [he, Z] = a(1), [me, fe] = a(0), [K, k] = a(30), [ue, H] = a(50), [x, ee] = a("light"), [ce, Ie] = a("scroll"), [Re, Ne] = a("remelight"), [Le, Ge] = a("AUTO"), et = r(async () => {
    var ne, ze, Ae, Oe, He, Je;
    A(!0);
    try {
      const [_e, xt, Kt] = await Promise.all([
        qr(e),
        Kr(e).catch(() => "zh"),
        Qr().catch(() => "UTC")
      ]);
      G.current = _e, B(_e.shell_command_timeout ?? 60), Q(_e.shell_command_executable ?? "");
      const mt = _e.auto_title_config ?? { enabled: !0, timeout_seconds: 30 };
      b(mt.enabled ?? !0), I(mt.timeout_seconds ?? 30), U(xt), L(Kt);
      const Ke = _e.loop ?? {};
      E(((ne = Ke.iteration) == null ? void 0 : ne.enabled) ?? !0), V(((ze = Ke.iteration) == null ? void 0 : ze.max_iterations) ?? _e.max_iters ?? 100), X(((Ae = Ke.doom_loop) == null ? void 0 : Ae.enabled) ?? !0), Y(((Oe = Ke.doom_loop) == null ? void 0 : Oe.window_size) ?? 3), de(((He = Ke.doom_loop) == null ? void 0 : He.similarity_threshold) ?? 1), oe(_e.llm_retry_enabled ?? !0), ie(_e.llm_max_retries ?? 3), ye(_e.llm_backoff_base ?? 2), ke(_e.llm_backoff_cap ?? 60), we(_e.llm_max_concurrent ?? 1), Se(_e.llm_max_qpm ?? 0), Z(_e.llm_rate_limit_pause ?? 1), fe(_e.llm_rate_limit_jitter ?? 0), k(_e.llm_acquire_timeout ?? 30), H(_e.history_max_length ?? 50), ee(_e.context_manager_backend ?? "light"), Ie(((Je = _e.light_context_config) == null ? void 0 : Je.strategy) ?? "scroll"), Ne(_e.memory_manager_backend ?? "remelight"), Ge(_e.approval_level ?? "AUTO");
    } catch (_e) {
      h.error(_e.message || "加载运行配置失败");
    } finally {
      A(!1);
    }
  }, [e]);
  n(() => {
    et();
  }, [et]);
  const De = async () => {
    var ze, Ae;
    const ne = G.current;
    if (ne) {
      D(!0);
      try {
        const Oe = {
          ...ne,
          max_iters: te,
          loop: {
            ...ne.loop ?? {},
            iteration: { enabled: $, max_iterations: te },
            doom_loop: {
              enabled: z,
              window_size: le,
              similarity_threshold: q,
              stages: ((Ae = (ze = ne.loop) == null ? void 0 : ze.doom_loop) == null ? void 0 : Ae.stages) ?? []
            }
          },
          shell_command_timeout: N,
          shell_command_executable: J,
          auto_title_config: {
            enabled: O,
            timeout_seconds: v
          },
          llm_retry_enabled: M,
          llm_max_retries: pe,
          llm_backoff_base: re,
          llm_backoff_cap: Ee,
          llm_max_concurrent: Pe,
          llm_max_qpm: ae,
          llm_rate_limit_pause: he,
          llm_rate_limit_jitter: me,
          llm_acquire_timeout: K,
          history_max_length: ue,
          context_manager_backend: x,
          light_context_config: {
            ...ne.light_context_config ?? {},
            strategy: ce
          },
          memory_manager_backend: Re,
          approval_level: Le
        };
        await Vr(e, Oe), G.current = Oe, T && await Xr(e, T).catch(() => {
        }), F && await Yr(F).catch(() => {
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
  const Te = (ne, ze, Ae) => t.createElement(
    "div",
    { style: Oa },
    t.createElement("div", { style: ot }, ne),
    ze,
    Ae ? t.createElement(
      w,
      { type: "secondary", style: Ra },
      Ae
    ) : null
  ), Me = (ne, ze, Ae, Oe) => t.createElement(
    "div",
    { style: Ma },
    t.createElement(
      "div",
      null,
      t.createElement("div", { style: ot }, ne),
      ze
    ),
    t.createElement(
      "div",
      null,
      t.createElement("div", { style: ot }, Ae),
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
      t.createElement(i, {
        min: 1,
        value: N,
        onChange: (ne) => B(ne ?? 60),
        style: { width: "100%" }
      }),
      "Shell 可执行文件",
      t.createElement(s, {
        value: J,
        onChange: (ne) => Q(ne.target.value),
        placeholder: "留空使用系统默认",
        style: { width: "100%" }
      })
    ),
    Me(
      "语言",
      t.createElement(c, {
        value: T,
        onChange: (ne) => U(ne),
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
        onChange: (ne) => L(ne),
        style: { width: "100%" },
        showSearch: !0,
        filterOption: (ne, ze) => {
          var Ae;
          return (((Ae = ze == null ? void 0 : ze.label) == null ? void 0 : Ae.toString()) || "").toLowerCase().includes(ne.toLowerCase());
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
        ].map((ne) => ({ value: ne, label: ne }))
      })
    ),
    Me(
      "自动生成会话标题",
      t.createElement(p, null, t.createElement(d, {
        checked: O,
        onChange: (ne) => b(ne)
      })),
      "标题生成超时 (秒)",
      t.createElement(i, {
        min: 5,
        value: v,
        onChange: (ne) => I(ne ?? 30),
        style: { width: "100%" },
        disabled: !O
      })
    ),
    // ── Section: 审批级别 ──
    t.createElement(y, { style: { margin: "8px 0 16px" } }),
    t.createElement("div", { style: Qe }, "审批级别"),
    Te(
      "工具执行审批",
      t.createElement(c, {
        value: Le,
        onChange: (ne) => Ge(ne),
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
        checked: $,
        onChange: (ne) => E(ne)
      }),
      "停止 Agent 前的最大循环轮次"
    ),
    $ ? Te(
      "最大迭代次数",
      t.createElement(i, {
        min: 1,
        max: 500,
        value: te,
        onChange: (ne) => V(ne ?? 100),
        style: { width: "100%" }
      })
    ) : null,
    Te(
      "启用重复循环保护",
      t.createElement(d, {
        checked: z,
        onChange: (ne) => X(ne)
      }),
      "检测并阻止重复操作循环"
    ),
    z ? Me(
      "检测窗口大小",
      t.createElement(i, {
        min: 2,
        max: 20,
        value: le,
        onChange: (ne) => Y(ne ?? 3),
        style: { width: "100%" }
      }),
      "相似度阈值",
      t.createElement(i, {
        min: 0,
        max: 1,
        step: 0.05,
        value: q,
        onChange: (ne) => de(ne ?? 1),
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
        onChange: (ne) => oe(ne)
      })
    ),
    Me(
      "最大重试次数",
      t.createElement(i, {
        min: 1,
        value: pe,
        onChange: (ne) => ie(ne ?? 3),
        style: { width: "100%" },
        disabled: !M
      }),
      "退避基数 (秒)",
      t.createElement(i, {
        min: 0.1,
        step: 0.1,
        value: re,
        onChange: (ne) => ye(ne ?? 2),
        style: { width: "100%" },
        disabled: !M
      })
    ),
    Te(
      "退避上限 (秒)",
      t.createElement(i, {
        min: 0.5,
        step: 0.5,
        value: Ee,
        onChange: (ne) => ke(ne ?? 60),
        style: { width: 200 },
        disabled: !M
      })
    ),
    // ── Section: LLM 限流 ──
    t.createElement(y, { style: { margin: "8px 0 16px" } }),
    t.createElement("div", { style: Qe }, "LLM 限流"),
    Me(
      "最大并发数",
      t.createElement(i, {
        min: 1,
        value: Pe,
        onChange: (ne) => we(ne ?? 1),
        style: { width: "100%" }
      }),
      "最大 QPM (0=不限)",
      t.createElement(i, {
        min: 0,
        step: 10,
        value: ae,
        onChange: (ne) => Se(ne ?? 0),
        style: { width: "100%" }
      })
    ),
    Me(
      "限流暂停时间 (秒)",
      t.createElement(i, {
        min: 1,
        step: 0.5,
        value: he,
        onChange: (ne) => Z(ne ?? 1),
        style: { width: "100%" }
      }),
      "限流抖动 (秒)",
      t.createElement(i, {
        min: 0,
        step: 0.5,
        value: me,
        onChange: (ne) => fe(ne ?? 0),
        style: { width: "100%" }
      })
    ),
    Te(
      "获取超时 (秒)",
      t.createElement(i, {
        min: 10,
        step: 10,
        value: K,
        onChange: (ne) => k(ne ?? 30),
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
        value: x,
        onChange: (ne) => ee(ne),
        style: { width: "100%" },
        options: [{ value: "light", label: "light" }]
      }),
      "上下文策略",
      t.createElement(c, {
        value: ce,
        onChange: (ne) => Ie(ne),
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
        onChange: (ne) => Ne(ne),
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
        value: ue,
        onChange: (ne) => H(ne ?? 50),
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
          icon: C ? t.createElement(C) : void 0,
          loading: R,
          onClick: De,
          style: Be
        },
        "保存运行配置"
      )
    )
  );
}
function ll({
  expert: e,
  open: t,
  onClose: a,
  onRefresh: n
}) {
  const r = _().React, { useState: l, useEffect: o, useCallback: i } = r, { Modal: s, Tabs: c, Spin: d, Typography: u } = _().antd, { SettingOutlined: m } = _().antdIcons || {}, { Text: p } = u, [f, y] = l([]), [h, C] = l(!1), [w, S] = l("heartbeat"), A = i(async () => {
    if (e) {
      C(!0);
      try {
        const N = await Zr(e.agent.id);
        y(N);
      } catch {
        y([]);
      } finally {
        C(!1);
      }
    }
  }, [e]);
  if (o(() => {
    t && e && A();
  }, [t, e, A]), !e) return null;
  const { agent: R } = e, D = () => {
    A(), n();
  }, G = [
    {
      key: "heartbeat",
      label: "心跳",
      children: r.createElement(tl, {
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
      ) : r.createElement(Pa, {
        agentId: R.id,
        systemPromptFiles: f,
        onRefresh: D
      })
    },
    {
      key: "skills",
      label: `技能 (${e.skills.filter((N) => N.enabled !== !1).length})`,
      children: r.createElement(nl, {
        agentId: R.id,
        onRefresh: n
      })
    },
    {
      key: "mcp",
      label: `MCP (${e.mcps.length})`,
      children: r.createElement(al, {
        agentId: R.id,
        onRefresh: n,
        isActive: w === "mcp"
      })
    },
    {
      key: "running",
      label: "运行配置",
      children: r.createElement(rl, {
        agentId: R.id
      })
    }
  ];
  return r.createElement(
    s,
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
      items: G,
      activeKey: w,
      onChange: (N) => S(N),
      size: "small",
      tabBarStyle: { marginBottom: 16 }
    })
  );
}
const ol = [
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
], sl = ol;
function Yn(e) {
  return Ft(`/ugsci/avatar/${encodeURIComponent(e)}`);
}
function Zn(e) {
  const t = e.map(encodeURIComponent).join(",");
  return Ft(`/ugsci/avatar/team/${t}`);
}
function We({
  name: e,
  size: t = 32,
  borderRadius: a = "50%"
}) {
  const n = _().React, [r, l] = n.useState(0), o = r === 0 ? Yn(e) : `${Yn(e)}?_r=${r}`;
  return n.createElement("img", {
    src: o,
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
function bn({
  members: e,
  size: t = 32,
  borderRadius: a = "50%"
}) {
  const n = _().React, [r, l] = n.useState(0);
  if (!e || e.length === 0)
    return n.createElement("span", {
      style: {
        width: t,
        height: t,
        display: "inline-block"
      }
    });
  const o = e.slice(0, 5), i = r === 0 ? Zn(o) : `${Zn(o)}?_r=${r}`;
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
async function ea(e) {
  var a;
  const t = _();
  if (t.refreshAgents)
    try {
      await t.refreshAgents({ force: !0 });
    } catch (n) {
      console.warn("[ugsci] Failed to refresh newly created agent:", n);
      return;
    }
  (a = t.setSelectedAgent) == null || a.call(t, e);
}
function il({
  expert: e,
  onClick: t,
  onSummon: a,
  onConfigure: n
}) {
  const r = _().React, { Card: l, Tag: o, Badge: i, Typography: s, Spin: c, Button: d, Tooltip: u } = _().antd, { Text: m } = s, { ThunderboltOutlined: p, SettingOutlined: f } = _().antdIcons || {}, { agent: y, skills: h, mcps: C, loading: w } = e, S = y.enabled, A = h.filter((G) => G.enabled !== !1).map((G) => G.name), R = C.map((G) => G.name || G.key), D = y.active_model ? `${y.active_model.provider_id}/${y.active_model.model}` : null;
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
        o,
        { color: "geekblue", style: { fontSize: 11 } },
        `🤖 ${D}`
      )
    ) : null,
    // Skills
    w ? r.createElement(c, { size: "small" }) : r.createElement(
      "div",
      { style: { marginBottom: 6 } },
      r.createElement(
        "div",
        { style: { fontSize: 11, color: "var(--ant-color-text-tertiary, #8c8c8c)", marginBottom: 4 } },
        `技能 (${A.length})`
      ),
      r.createElement(Qn, {
        items: A,
        max: 4,
        color: "cyan",
        emptyText: "未配置技能"
      })
    ),
    // MCP
    !w && R.length > 0 ? r.createElement(
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
            onClick: (G) => {
              G.stopPropagation(), n && n();
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
          onClick: (G) => {
            G.stopPropagation(), a && a();
          },
          style: Be
        },
        "召唤专家"
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
  const r = _().React, {
    Drawer: l,
    Descriptions: o,
    Tag: i,
    Typography: s,
    Space: c,
    Button: d,
    Empty: u,
    Tabs: m,
    List: p,
    Spin: f,
    Modal: y,
    message: h
  } = _().antd, { Text: C, Paragraph: w } = s, {
    EditOutlined: S,
    ThunderboltOutlined: A,
    FileTextOutlined: R,
    ToolOutlined: D,
    PlusOutlined: G
  } = _().antdIcons || {}, [N, B] = r.useState(!1), [J, Q] = r.useState(
    []
  ), [O, b] = r.useState(!1);
  if (!e) return null;
  const { agent: v, config: I, skills: T, mcps: U, loading: F } = e, L = T.filter((M) => M.enabled !== !1), $ = (M) => {
    window.history.pushState({}, "", M), window.dispatchEvent(new PopStateEvent("popstate"));
  }, E = r.createElement(
    "div",
    null,
    r.createElement(
      o,
      { column: 1, bordered: !0, size: "small" },
      r.createElement(o.Item, { label: "专家名称" }, v.name),
      r.createElement(
        o.Item,
        { label: "专家 ID" },
        r.createElement("code", { style: { fontSize: 12 } }, v.id)
      ),
      r.createElement(
        o.Item,
        { label: "状态" },
        r.createElement(
          i,
          { color: v.enabled ? "green" : "default" },
          v.enabled ? "启用" : "停用"
        )
      ),
      r.createElement(
        o.Item,
        { label: "功能简介" },
        v.description ? Wt(v.description, r) : "暂无描述"
      ),
      r.createElement(
        o.Item,
        { label: "使用模型" },
        v.active_model ? `${v.active_model.provider_id} / ${v.active_model.model}` : "使用全局默认模型"
      ),
      I != null && I.workspace_dir ? r.createElement(
        o.Item,
        { label: "工作区路径" },
        r.createElement(
          "code",
          { style: { fontSize: 11 } },
          I.workspace_dir
        )
      ) : null,
      I != null && I.approval_level ? r.createElement(
        o.Item,
        { label: "审批级别" },
        I.approval_level
      ) : null
    ),
    // System prompt files
    I != null && I.system_prompt_files && I.system_prompt_files.length > 0 ? r.createElement(
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
        r.createElement(C, { strong: !0 }, "系统提示词文件")
      ),
      r.createElement(
        c,
        { wrap: !0 },
        ...I.system_prompt_files.map(
          (M, oe) => r.createElement(
            i,
            {
              key: oe,
              icon: R ? r.createElement(R) : void 0,
              style: { fontSize: 12 }
            },
            M
          )
        )
      )
    ) : null
  ), te = async () => {
    B(!0), b(!0);
    try {
      const M = await Vt(!0);
      Q(M);
    } catch (M) {
      h.error(M.message || "加载技能池失败");
    } finally {
      b(!1);
    }
  }, V = async (M) => {
    let oe = 0, pe = 0;
    for (const ie of M)
      try {
        await yn(v.id, ie), oe++;
      } catch {
        pe++;
      }
    oe > 0 ? (h.success(
      `成功添加 ${oe} 个技能${pe > 0 ? `，${pe} 个失败` : ""}`
    ), n()) : pe > 0 && h.error("添加技能失败"), B(!1);
  }, z = async (M) => {
    try {
      await hn(v.id, M), h.success(`技能「${M}」已移除`), n();
    } catch (oe) {
      h.error(oe.message || "移除技能失败");
    }
  }, X = async (M) => {
    try {
      await za(v.id, M), h.success(`MCP「${M}」已移除`), n();
    } catch (oe) {
      h.error(oe.message || "移除 MCP 失败");
    }
  }, le = F ? r.createElement(
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
        C,
        { strong: !0 },
        `已启用技能 (${L.length})`
      ),
      r.createElement(
        d,
        {
          type: "primary",
          size: "small",
          icon: G ? r.createElement(G) : void 0,
          onClick: te
        },
        "从技能池添加"
      )
    ),
    L.length === 0 ? r.createElement(u, {
      description: "该专家暂无已启用的技能",
      image: u.PRESENTED_IMAGE_SIMPLE
    }) : r.createElement(p, {
      dataSource: L,
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
                onClick: () => z(M.name)
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
            r.createElement(C, { strong: !0 }, M.name),
            M.version_text ? r.createElement(
              i,
              { style: { fontSize: 10 } },
              `v${M.version_text}`
            ) : null
          ),
          M.description ? r.createElement(
            w,
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
              (oe, pe) => r.createElement(
                i,
                {
                  key: pe,
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
    r.createElement($a, {
      open: N,
      onClose: () => B(!1),
      poolSkills: J,
      installedSkillNames: L.map((M) => M.name),
      loading: O,
      onInstall: V
    })
  ), Y = F ? r.createElement(
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
        C,
        { strong: !0 },
        `MCP 客户端 (${U.length})`
      ),
      r.createElement(
        d,
        {
          type: "primary",
          size: "small",
          icon: G ? r.createElement(G) : void 0,
          onClick: () => {
            window.history.pushState({}, "", `/agents/${v.id}/mcp`), window.dispatchEvent(new PopStateEvent("popstate"));
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
                onClick: () => X(M.key)
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
              C,
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
            w,
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
  ), q = I != null && I.tools ? r.createElement(
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
        r.createElement(C, { strong: !0 }, "工具配置")
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
        JSON.stringify(I.tools, null, 2)
      )
    )
  ) : r.createElement(u, {
    description: "暂无工具配置",
    image: u.PRESENTED_IMAGE_SIMPLE
  }), de = [
    { key: "basic", label: "基本信息", children: E },
    {
      key: "skills",
      label: `技能 (${L.length})`,
      children: le
    },
    {
      key: "prompts",
      label: "推荐提问",
      children: r.createElement(el, {
        skills: L,
        agentId: v.id
      })
    },
    {
      key: "knowledge",
      label: "专家记忆",
      children: r.createElement(Pa, {
        agentId: v.id,
        systemPromptFiles: (I == null ? void 0 : I.system_prompt_files) || [],
        onRefresh: () => n()
      })
    },
    { key: "mcp", label: `MCP (${U.length})`, children: Y },
    { key: "tools", label: "工具配置", children: q }
  ];
  return r.createElement(
    l,
    {
      title: r.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 8 } },
        r.createElement(We, { name: v.name, size: 28 }),
        r.createElement("span", null, v.name)
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
                const M = _();
                M.setSelectedAgent && M.setSelectedAgent(v.id);
              } catch (M) {
                console.warn("[ugsci] Failed to set selected agent:", M);
              }
              setTimeout(() => $("/agents"), 0);
            }
          },
          "编辑专家"
        ),
        r.createElement(
          d,
          {
            type: "primary",
            size: "small",
            icon: A ? r.createElement(A) : void 0,
            onClick: () => {
              a();
              try {
                const M = _();
                M.setSelectedAgent && M.setSelectedAgent(v.id);
              } catch (M) {
                console.warn("[ugsci] Failed to set selected agent:", M);
              }
              setTimeout(() => $("/chat"), 0);
            }
          },
          "开始对话"
        )
      )
    },
    r.createElement(m, {
      items: de,
      defaultActiveKey: "basic"
    })
  );
}
function dl({
  open: e,
  onClose: t,
  onCreated: a
}) {
  const n = _().React, { useState: r } = n, {
    Modal: l,
    Card: o,
    Tag: i,
    Input: s,
    Row: c,
    Col: d,
    Spin: u,
    message: m,
    Typography: p
  } = _().antd, { Text: f } = p, { FileAddOutlined: y } = _().antdIcons || {}, [h, C] = r(!1), [w, S] = r(""), [A, R] = r(!1), D = async (B) => {
    C(!0);
    try {
      const J = await se("/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: B.id || void 0,
          name: B.name,
          description: B.description,
          skill_names: B.skillNames
        })
      }), Q = B.systemPrompt.trim() || `# ${B.name}

你是${B.name}。${B.description ? `

职责：${B.description}` : ""}
`, b = (await Promise.allSettled([
        Bt(J.id, "AGENTS.md", Q),
        ...B.mcpClients.map(
          ({ clientKey: v, client: I }) => vn(J.id, {
            client_key: v,
            client: I
          })
        )
      ])).filter(
        (v) => v.status === "rejected"
      ).length;
      b > 0 ? m.warning(
        `专家「${B.name}」已创建，${b} 项初始配置失败，可在专家配置中重试`
      ) : m.success(`专家「${B.name}」创建成功`), await ea(J.id), R(!1), setTimeout(() => {
        t(), a();
      }, 0);
    } catch (J) {
      m.error(J.message || "创建专家失败");
    } finally {
      C(!1);
    }
  }, G = sl.filter((B) => {
    if (!w.trim()) return !0;
    const J = w.toLowerCase();
    return B.name.toLowerCase().includes(J) || B.description.toLowerCase().includes(J) || B.category.toLowerCase().includes(J);
  }), N = async (B) => {
    C(!0);
    try {
      const J = await se("/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: B.name,
          description: B.description,
          skill_names: B.recommended_skills
        })
      });
      await Bt(J.id, "AGENTS.md", B.system_prompt);
      const Q = await fn(J.id);
      Q.approval_level = B.approval_level, await se(`/agents/${encodeURIComponent(J.id)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Q)
      }), await ea(J.id), m.success(`专家「${B.name}」创建成功`), t(), a();
    } catch (J) {
      m.error(J.message || "创建专家失败");
    } finally {
      C(!1);
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
        n.createElement(s, {
          placeholder: "搜索模板名称或类别...",
          value: w,
          onChange: (B) => S(B.target.value),
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
        w.trim() ? null : n.createElement(
          d,
          { xs: 24, sm: 12 },
          n.createElement(
            o,
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
        ...G.map(
          (B) => n.createElement(
            d,
            { key: B.id, xs: 24, sm: 12 },
            n.createElement(
              o,
              {
                hoverable: !0,
                size: "small",
                onClick: () => N(B),
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
                  name: B.name,
                  size: 40
                }),
                n.createElement(
                  "div",
                  { style: { flex: 1 } },
                  n.createElement(
                    f,
                    { strong: !0, style: { fontSize: 15 } },
                    B.name
                  ),
                  n.createElement(
                    "div",
                    null,
                    n.createElement(
                      i,
                      { color: "blue", style: { fontSize: 10 } },
                      B.category
                    ),
                    B.approval_level === "MANUAL" ? n.createElement(
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
                Wt(B.description, n)
              )
            )
          )
        )
      )
    ),
    // ── Blank template creation modal (sibling, not nested inside Modal) ──
    n.createElement(ul, {
      open: A,
      onCancel: () => R(!1),
      onCreate: D
    })
  );
}
function ft(e) {
  return typeof e == "object" && e !== null && !Array.isArray(e);
}
function ml(e) {
  const t = e.trim();
  if (!t) return [];
  const a = JSON.parse(t);
  if (!ft(a))
    throw new Error("MCP 配置必须是 JSON 对象");
  const n = a.mcpServers ?? a;
  if (!ft(n))
    throw new Error("mcpServers 必须是 JSON 对象");
  return Object.entries(n).map(([r, l]) => {
    const o = r.trim();
    if (!o || !ft(l))
      throw new Error(`MCP「${r || "未命名"}」配置无效`);
    const i = typeof l.url == "string" ? l.url : "", s = typeof l.command == "string" ? l.command : "";
    if (!i && !s)
      throw new Error(`MCP「${o}」需要配置 url 或 command`);
    const d = (typeof l.transport == "string" ? l.transport : typeof l.type == "string" ? l.type : "") === "sse" ? "sse" : i ? "streamable_http" : "stdio";
    return {
      clientKey: o,
      client: {
        name: typeof l.name == "string" ? l.name : o,
        description: typeof l.description == "string" ? l.description : "",
        enabled: typeof l.enabled == "boolean" ? l.enabled : !0,
        transport: d,
        url: i,
        command: s,
        args: Array.isArray(l.args) ? l.args : [],
        env: ft(l.env) ? l.env : {},
        cwd: typeof l.cwd == "string" ? l.cwd : "",
        headers: ft(l.headers) ? l.headers : {}
      }
    };
  });
}
function ul({
  open: e,
  onCancel: t,
  onCreate: a
}) {
  const n = _().React, { useState: r, useEffect: l, useMemo: o } = n, {
    Modal: i,
    Input: s,
    Select: c,
    Button: d,
    Row: u,
    Col: m,
    Spin: p,
    Tag: f,
    Typography: y,
    message: h
  } = _().antd, { CheckCircleOutlined: C } = _().antdIcons || {}, { Text: w } = y, [S, A] = r(""), [R, D] = r(""), [G, N] = r(""), [B, J] = r(""), [Q, O] = r([]), [b, v] = r([]), [I, T] = r(!1), [U, F] = r(""), [L, $] = r(!1);
  l(() => {
    e && (A(""), D(""), N(""), J(""), v([]), F(""), $(!1), T(!0), Vt(!0).then(O).catch((Y) => {
      O([]), h.error(Y.message || "加载技能池失败");
    }).finally(() => T(!1)));
  }, [e]);
  const E = R.trim(), te = o(() => E ? E.length < 2 || E.length > 64 ? "ID 长度需为 2-64 个字符" : /^[a-zA-Z0-9][a-zA-Z0-9_-]*[a-zA-Z0-9]$/.test(E) ? E === "default" ? "default 是系统保留 ID" : "" : "仅允许字母、数字、连字符和下划线，且不能以符号开头或结尾" : "", [E]), V = o(() => {
    try {
      return { clients: ml(U), error: "" };
    } catch (Y) {
      return { clients: [], error: Y.message || "MCP 配置无效" };
    }
  }, [U]), z = () => {
    const Y = S.trim();
    if (!Y) {
      h.warning("请输入专家名称");
      return;
    }
    if (te) {
      h.warning(te);
      return;
    }
    if (V.error) {
      h.warning(V.error);
      return;
    }
    $(!0), Promise.resolve(
      a({
        id: E,
        name: Y,
        description: G.trim(),
        systemPrompt: B,
        skillNames: b,
        mcpClients: V.clients
      })
    ).finally(() => $(!1));
  }, X = () => {
    v(
      Q.filter((Y) => Y.source === "builtin").map((Y) => Y.name)
    );
  }, le = (Y, q) => n.createElement(
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
    n.createElement(w, { strong: !0, style: { fontSize: 15 } }, Y),
    q ? n.createElement(w, { type: "secondary", style: { fontSize: 12 } }, q) : null
  );
  return n.createElement(
    i,
    {
      open: e,
      title: "创建专家",
      onCancel: t,
      onOk: z,
      okText: "创建专家",
      cancelText: "取消",
      okButtonProps: { loading: L },
      maskClosable: !0,
      keyboard: !0,
      width: 880,
      styles: { body: { maxHeight: "72vh", overflowY: "auto", paddingTop: 8 } }
    },
    n.createElement(
      "div",
      { style: { paddingBottom: 20 } },
      le("基本信息", "ID 留空时自动生成"),
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
          n.createElement(s, {
            placeholder: "例如：合同审查专家",
            value: S,
            onChange: (Y) => A(Y.target.value),
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
          n.createElement(s, {
            placeholder: "例如：contract-reviewer",
            value: R,
            onChange: (Y) => D(Y.target.value),
            maxLength: 64,
            status: te ? "error" : void 0
          }),
          te ? n.createElement("div", { style: { color: "#ff4d4f", fontSize: 12, marginTop: 4 } }, te) : null
        ),
        n.createElement(
          m,
          { span: 24 },
          n.createElement(
            "label",
            { style: { display: "block", fontSize: 13, marginBottom: 6 } },
            "专家描述（可选）"
          ),
          n.createElement(s.TextArea, {
            placeholder: "简要描述该专家的职责和能力",
            value: G,
            onChange: (Y) => N(Y.target.value),
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
      le("角色指令", "保存为 AGENTS.md"),
      n.createElement(s.TextArea, {
        placeholder: "定义专家的角色、目标、工作方式和输出要求；留空时将根据名称与描述生成基础指令",
        value: B,
        onChange: (Y) => J(Y.target.value),
        rows: 6,
        style: { fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", fontSize: 12 }
      })
    ),
    n.createElement(
      "div",
      { style: { borderTop: "1px solid #f0f0f0", paddingTop: 20 } },
      le("初始能力"),
      n.createElement(
        u,
        { gutter: [20, 16], align: "top" },
        n.createElement(
          m,
          { xs: 24, md: 12 },
          n.createElement(
            "div",
            { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 } },
            n.createElement(w, { strong: !0 }, "初始技能"),
            n.createElement(
              "div",
              { style: { display: "flex", gap: 4 } },
              n.createElement(d, { size: "small", onClick: X, disabled: I }, "内置"),
              n.createElement(d, { size: "small", onClick: () => v([]), disabled: b.length === 0 }, "清空")
            )
          ),
          I ? n.createElement("div", { style: { textAlign: "center", padding: 32 } }, n.createElement(p, { size: "small" })) : n.createElement(c, {
            mode: "multiple",
            value: b,
            onChange: v,
            placeholder: "搜索并选择技能",
            showSearch: !0,
            allowClear: !0,
            optionFilterProp: "label",
            maxTagCount: "responsive",
            style: { width: "100%" },
            options: Q.map((Y) => ({
              value: Y.name,
              label: Y.name
            })),
            notFoundContent: "暂无可用技能"
          }),
          n.createElement(
            "div",
            { style: { marginTop: 8, minHeight: 22 } },
            b.length > 0 ? n.createElement(f, { color: "blue" }, `已选择 ${b.length} 个技能`) : n.createElement(w, { type: "secondary", style: { fontSize: 12 } }, "暂不添加技能")
          )
        ),
        n.createElement(
          m,
          { xs: 24, md: 12 },
          n.createElement(w, { strong: !0, style: { display: "block", marginBottom: 8 } }, "初始 MCP"),
          n.createElement(s.TextArea, {
            placeholder: `{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem"]
    }
  }
}`,
            value: U,
            onChange: (Y) => F(Y.target.value),
            rows: 8,
            status: V.error ? "error" : void 0,
            style: { fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", fontSize: 12 }
          }),
          n.createElement(
            "div",
            { style: { marginTop: 8, minHeight: 22 } },
            V.error ? n.createElement(w, { type: "danger", style: { fontSize: 12 } }, V.error) : V.clients.length > 0 ? n.createElement(
              f,
              {
                color: "green",
                icon: C ? n.createElement(C) : void 0
              },
              `已识别 ${V.clients.length} 个 MCP`
            ) : n.createElement(w, { type: "secondary", style: { fontSize: 12 } }, "暂不添加 MCP")
          )
        )
      )
    )
  );
}
const La = "ugsci_custom_teams";
function pl(e) {
  if (!e || typeof e != "object") return !1;
  const t = e;
  return typeof t.id == "string" && typeof t.name == "string" && typeof t.taskTemplate == "string" && typeof t.orchestrationPrompt == "string" && Array.isArray(t.members);
}
function gl() {
  try {
    const e = JSON.parse(
      localStorage.getItem(La) || "[]"
    );
    return Array.isArray(e) ? e.filter(pl) : [];
  } catch {
    return [];
  }
}
function fl(e) {
  try {
    localStorage.setItem(La, JSON.stringify(e));
  } catch {
  }
}
function yl(e) {
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
function hl(e) {
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
async function on(e = !0) {
  const t = await Ve("/ugsci/team/custom");
  if (!t.ok) {
    const r = await t.text().catch(() => "");
    throw new Error(r || `HTTP ${t.status}`);
  }
  const n = (await t.json()).map(hl);
  return e && fl(n), n;
}
async function Ba(e) {
  const t = await Ve("/ugsci/team/custom", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(yl(e))
  });
  if (!t.ok) {
    const n = await t.text().catch(() => "");
    throw new Error(n || `HTTP ${t.status}`);
  }
  const a = await t.json();
  return { ...e, id: a.team_id };
}
async function El(e) {
  const t = await Ve(
    `/ugsci/team/custom/${encodeURIComponent(e)}`,
    { method: "DELETE" }
  );
  if (!t.ok && t.status !== 404) {
    const a = await t.text().catch(() => "");
    throw new Error(a || `HTTP ${t.status}`);
  }
}
async function vl() {
  const e = gl();
  if (e.length === 0) return;
  const t = await on(!1), a = new Set(t.map((n) => n.id));
  await Promise.all(
    e.filter((n) => !a.has(n.id)).map((n) => Ba(n))
  );
}
async function bl(e) {
  var r, l;
  const t = (r = e.body) == null ? void 0 : r.getReader();
  if (!t) return;
  const a = new TextDecoder();
  let n = "";
  try {
    for (; ; ) {
      const { done: o, value: i } = await t.read();
      if (o) break;
      n += a.decode(i, { stream: !0 });
      let s;
      for (; (s = n.indexOf(`

`)) >= 0; ) {
        const c = n.slice(0, s);
        n = n.slice(s + 2);
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
async function wl(e, t, a) {
  const n = `console:default:team-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, r = await Ve("/chats", {
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
    const s = await r.text().catch(() => "");
    throw new Error(
      s || `创建会话失败 (HTTP ${r.status})`
    );
  }
  const o = (await r.json()).id, i = await Ve("/console/chat", {
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
    const s = await i.text().catch(() => "");
    throw new Error(s || `HTTP ${i.status}`);
  }
  return await bl(i), o;
}
function Ua(e, t) {
  var r;
  const a = t.replace(/\s+/g, ""), n = e.find(
    (l) => l.name === t || l.name.replace(/\s+/g, "") === a
  );
  return n ? n.id : ((r = e.find(
    (l) => l.name.includes(t) || t.includes(l.name) || l.name.replace(/\s+/g, "").includes(a)
  )) == null ? void 0 : r.id) || null;
}
function ja() {
  var t;
  const e = (t = window.QwenPaw) == null ? void 0 : t.host;
  if (!e) throw new Error("[ugsci] QwenPaw.host not available");
  return e;
}
async function wn(e, t, a) {
  try {
    const n = await Ve(e, {
      headers: t ? { "X-Agent-Id": t } : void 0,
      signal: a
    });
    return n.ok ? await n.json() : null;
  } catch {
    return null;
  }
}
function Sl(e, t) {
  return wn("/ugsci/team/state", e, t);
}
async function xl(e, t) {
  const a = await Ve("/ugsci/team/runs", {
    headers: { "X-Agent-Id": e },
    signal: t
  });
  if (!a.ok)
    throw new Error(`Failed to load team runs: ${a.status}`);
  return await a.json();
}
function ta({ activeOnly: e = !1 }) {
  const t = ja(), a = t.React, { useCallback: n, useEffect: r, useRef: l, useState: o } = a, { Alert: i, Button: s, Card: c, Empty: d, Spin: u, Tag: m, Typography: p } = t.antd, { Text: f, Paragraph: y } = p, h = t.useSelectedAgent ? t.useSelectedAgent() : { id: "default" }, C = (h == null ? void 0 : h.id) || "default", [w, S] = o([]), [A, R] = o(!0), [D, G] = o(!1), N = l(null), B = l(0), J = n(async () => {
    var v;
    (v = N.current) == null || v.abort();
    const O = new AbortController();
    N.current = O;
    const b = ++B.current;
    R(!0);
    try {
      const I = await xl(C, O.signal);
      if (O.signal.aborted || b !== B.current) return;
      S(I), G(!1);
    } catch {
      if (O.signal.aborted || b !== B.current) return;
      G(!0);
    } finally {
      !O.signal.aborted && b === B.current && R(!1);
    }
  }, [C]);
  if (r(() => (J(), () => {
    var O;
    (O = N.current) == null || O.abort(), B.current += 1;
  }), [J]), A) return a.createElement(u);
  if (D)
    return a.createElement(i, {
      type: "warning",
      message: "讨论运行记录加载失败",
      action: a.createElement(s, { size: "small", onClick: () => void J() }, "重试")
    });
  const Q = w.filter(
    (O) => e ? O.status === "active" : O.status !== "active"
  );
  return Q.length === 0 ? a.createElement(d, {
    description: e ? "暂无进行中的专家团讨论" : "暂无历史讨论"
  }) : a.createElement(
    "div",
    { style: { display: "flex", flexDirection: "column", gap: 8 } },
    ...Q.map(
      (O) => a.createElement(
        c,
        { key: O.instance_id, size: "small" },
        a.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 8 } },
          a.createElement(f, { strong: !0 }, O.team_name || O.team_id),
          a.createElement(m, { color: O.status === "completed" ? "green" : O.status === "terminated" ? "orange" : "blue" }, O.status),
          a.createElement(m, null, O.current_phase),
          a.createElement(f, { type: "secondary" }, `迭代 ${O.iteration}`)
        ),
        a.createElement(y, { ellipsis: { rows: 2 }, style: { margin: "8px 0 0" } }, O.task || "暂无任务描述")
      )
    )
  );
}
async function kl() {
  const e = await wn(
    "/ugsci/team/preset-teams"
  );
  return (e == null ? void 0 : e.teams) ?? null;
}
async function Cl() {
  const e = await wn(
    "/ugsci/team/roles"
  );
  return (e == null ? void 0 : e.roles) ?? null;
}
const Tl = {
  plan: { label: "规划", color: "#1677ff", icon: "📋" },
  dispatch: { label: "分派", color: "#13c2c2", icon: "🚀" },
  verify: { label: "验证", color: "#fa8c16", icon: "🔍" },
  synthesize: { label: "综合", color: "#722ed1", icon: "📊" },
  completed: { label: "完成", color: "#52c41a", icon: "✅" }
}, na = [
  "plan",
  "dispatch",
  "verify",
  "synthesize",
  "completed"
], _l = 3;
function Il() {
  const e = ja(), t = e.React, { useState: a, useEffect: n, useCallback: r, useRef: l } = t, { Card: o, Tag: i, Typography: s, Button: c, Steps: d, Empty: u, Alert: m } = e.antd, { ReloadOutlined: p } = e.antdIcons || {}, { Text: f, Paragraph: y } = s, h = e.useSelectedAgent ? e.useSelectedAgent() : { id: "default" }, C = (h == null ? void 0 : h.id) || "default", [w, S] = a(null), [A, R] = a(!1), D = l(null), G = l(0), N = l(0), B = l(null), J = r(
    async (E) => {
      var X;
      (X = B.current) == null || X.abort();
      const te = new AbortController();
      B.current = te;
      const V = ++N.current;
      E && R(!0);
      const z = await Sl(C, te.signal);
      te.signal.aborted || V !== N.current || (z ? (G.current = 0, D.current = z, S(z)) : G.current += 1, R(!1));
    },
    [C]
  ), Q = r(() => J(!0), [J]);
  if (n(() => {
    var te;
    (te = B.current) == null || te.abort(), N.current += 1, G.current = 0, D.current = null, S(null), Q();
    const E = window.setInterval(() => {
      var V, z;
      G.current >= _l || ((V = D.current) == null ? void 0 : V.status) === "completed" || ((z = D.current) == null ? void 0 : z.status) === "terminated" || J(!1);
    }, 5e3);
    return () => {
      var V;
      window.clearInterval(E), (V = B.current) == null || V.abort(), N.current += 1;
    };
  }, [C, J, Q]), (w == null ? void 0 : w.status) === "unreadable")
    return t.createElement(m, {
      type: "warning",
      showIcon: !0,
      message: "专家团状态暂时无法读取",
      description: `实例 ${w.instance_id || "未知"} 的状态文件需要检查。`,
      style: { marginBottom: 16 },
      action: t.createElement(
        c,
        { size: "small", onClick: Q, loading: A },
        "重试"
      )
    });
  if (!w || !w.active) {
    if ((w == null ? void 0 : w.status) === "completed" || (w == null ? void 0 : w.status) === "terminated") {
      const E = w.status === "completed";
      return t.createElement(m, {
        type: E ? "success" : "info",
        showIcon: !0,
        message: E ? "专家团工作流已完成" : "专家团工作流已终止",
        description: E ? `实例 ${w.instance_id || "未知"} 已完成，结果文件保留在工作区。` : `原因：${w.state.termination_reason || "未知"}`,
        style: { marginBottom: 16 }
      });
    }
    return t.createElement(u, {
      description: "暂无活跃的专家团工作流",
      style: { padding: 24 }
    });
  }
  const O = w.state, b = O.current_phase || "plan", v = na.indexOf(b), I = O.team_name || "未知团队", T = O.team_mode || "pipeline", U = O.iteration || 0, F = O.members || [], L = O.verify_retries || 0, $ = {
    pipeline: "顺序交接",
    coordinator: "主管协作",
    roundtable: "并行汇聚",
    router: "智能路由",
    review_loop: "评审迭代",
    debate: "多方论证"
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
        t.createElement(f, { strong: !0 }, `${I} — 工作流状态`),
        t.createElement(
          i,
          { color: "blue", style: { fontSize: 10 } },
          $[T] || T
        ),
        t.createElement(
          i,
          { style: { fontSize: 10 } },
          `迭代 ${U}`
        ),
        L > 0 ? t.createElement(
          i,
          { color: "orange", style: { fontSize: 10 } },
          `验证重试 ${L}`
        ) : null
      ),
      extra: t.createElement(
        c,
        {
          size: "small",
          type: "text",
          icon: p ? t.createElement(p) : void 0,
          onClick: Q,
          loading: A
        },
        "刷新"
      )
    },
    t.createElement(d, {
      current: v,
      size: "small",
      items: na.map((E) => {
        const te = Tl[E];
        return {
          title: `${te.icon} ${te.label}`,
          description: E === "plan" ? "分析任务，创建任务分解" : E === "dispatch" ? "分派专家执行任务" : E === "verify" ? "交叉验证专家结果" : E === "synthesize" ? "综合形成最终报告" : "工作流完成"
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
      ...F.map(
        (E, te) => t.createElement(
          i,
          { key: `${E.name}-${te}`, style: { fontSize: 11 } },
          `${E.emoji || ""} ${E.name}（${E.role}）`
        )
      )
    ),
    O.task ? t.createElement(
      y,
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
  );
}
function zl({ team: e }) {
  const t = _().React, { Typography: a, Tag: n } = _().antd, { Text: r } = a, l = {
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
  }, i = e.steps || [], s = e.mode === "roundtable" || e.mode === "router", c = {
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
          flexDirection: s ? "row" : "column",
          gap: 8,
          alignItems: s ? "flex-start" : "stretch",
          flexWrap: "wrap"
        }
      },
      ...i.length > 0 ? i.map((d, u) => [
        u > 0 && !s ? t.createElement(
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
              flex: s ? "1 1 200px" : "initial"
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
        u > 0 && !s ? t.createElement(
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
              flex: s ? "1 1 150px" : "initial"
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
const Al = [
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
function $l({
  open: e,
  onClose: t,
  agents: a,
  editingTeam: n,
  onSaved: r
}) {
  const l = _().React, { useState: o, useEffect: i, useCallback: s } = l, {
    Modal: c,
    Input: d,
    Button: u,
    Select: m,
    Tag: p,
    Typography: f,
    Switch: y,
    Empty: h,
    message: C,
    Divider: w,
    Steps: S
  } = _().antd, { PlusOutlined: A, DeleteOutlined: R, SaveOutlined: D, ArrowRightOutlined: G } = _().antdIcons || {}, { Text: N, Paragraph: B } = f, [J, Q] = o(""), [O, b] = o("🤝"), [v, I] = o(""), [T, U] = o("pipeline"), [F, L] = o(""), [$, E] = o(""), [te, V] = o([]), [z, X] = o([]), [le, Y] = o(!1), [q, de] = o(2), [M, oe] = o(""), [pe, ie] = o(""), [re, ye] = o({}), [Ee, ke] = o({}), [Pe, we] = o(
    Al
  ), ae = [
    { value: "pipeline", icon: "→", title: "顺序交接", description: "上一步产物成为下一位专家的上下文", topology: "A → B → C", accent: "#08979c" },
    { value: "roundtable", icon: "⇉", title: "并行汇聚", description: "独立并行分析，避免观点相互污染", topology: "A ∥ B ∥ C → 汇总", accent: "#531dab" },
    { value: "coordinator", icon: "◎", title: "主管协作", description: "主控专家拆解任务并按需组织成员", topology: "主管 → 专家组", accent: "#0958d9" },
    { value: "router", icon: "◇", title: "智能路由", description: "按任务能力需求选择最小充分专家集合", topology: "任务 → 路由 → 子集", accent: "#d46b08" },
    { value: "review_loop", icon: "↻", title: "评审迭代", description: "产出、独立审查、修订，直到满足标准", topology: "执行 ⇄ 评审", accent: "#389e0d" },
    { value: "debate", icon: "⚖", title: "多方论证", description: "独立立场、交叉质询，再由裁决者综合", topology: "观点 ⇄ 反驳 → 裁决", accent: "#c41d7f" }
  ];
  i(() => {
    e && (n ? (Q(n.name), b(n.emoji), I(n.description), U(n.mode), L(n.coordinatorName || ""), E(n.taskTemplate), V(n.steps || []), X(n.members.map((k) => k.name)), de(n.maxReviewRounds || 2), oe(n.successCriteria || ""), ie(n.routingInstruction || ""), ye(
      Object.fromEntries(
        n.members.map((k) => [
          k.name,
          k.bindingMode || (k.agentId ? "fixed" : "preferred")
        ])
      )
    ), ke(
      Object.fromEntries(
        n.members.map((k) => [
          k.name,
          k.roleKey || It(k.name)
        ])
      )
    )) : (Q(""), b("🤝"), I(""), U("pipeline"), L(""), E(`请执行以下任务：
任务描述：{任务描述}`), V([]), X([]), de(2), oe(""), ie(""), ye({}), ke({})));
  }, [e, n]), i(() => {
    e && Cl().then((k) => {
      k != null && k.length && we(k);
    });
  }, [e]);
  const Se = s(() => {
    if (T === "roundtable" || T === "debate" || T === "router") {
      const k = z.map((ue) => ({
        agentName: ue,
        instruction: "请给出你的专业评估意见",
        passContext: !1
      }));
      V(k);
    } else if (T === "pipeline") {
      const k = new Map(te.map((H) => [H.agentName, H])), ue = z.map((H) => k.get(H) || {
        agentName: H,
        instruction: "请完成你的专业部分",
        passContext: !0
      });
      V(ue);
    }
  }, [T, z, te]), he = (k) => {
    z.includes(k) || (X([...z, k]), ye({ ...re, [k]: "fixed" }), ke({
      ...Ee,
      [k]: It(k)
    }), (T === "coordinator" || T === "debate") && !F && L(k));
  }, Z = (k) => {
    const ue = z.filter((ee) => ee !== k);
    X(ue), V(te.filter((ee) => ee.agentName !== k));
    const H = { ...re };
    delete H[k], ye(H);
    const x = { ...Ee };
    delete x[k], ke(x), F === k && L(ue[0] || "");
  }, me = (k, ue, H) => {
    const x = [...te];
    x[k] = { ...x[k], [ue]: H }, V(x);
  }, fe = async () => {
    if (!J.trim()) {
      C.warning("请输入团队名称");
      return;
    }
    if (z.length < 2) {
      C.warning("至少需要选择 2 个成员");
      return;
    }
    if (!$.trim()) {
      C.warning("请输入任务模板");
      return;
    }
    if ((T === "coordinator" || T === "debate") && !F) {
      C.warning(T === "debate" ? "请选择裁决者" : "请选择主控专家");
      return;
    }
    Y(!0);
    try {
      let k = [...z];
      T === "coordinator" && F ? k = [F, ...k.filter((ee) => ee !== F)] : T === "debate" && F && (k = [...k.filter((ee) => ee !== F), F]);
      const ue = k.map(
        (ee) => {
          var Le;
          const ce = a.find((Ge) => Ge.name === ee), Ie = re[ee] || "fixed", Re = Ee[ee] || It(ee), Ne = Pe.find((Ge) => Ge.key === Re);
          return {
            name: ee,
            role: (Ne == null ? void 0 : Ne.display_name) || ((Le = ce == null ? void 0 : ce.description) == null ? void 0 : Le.slice(0, 30)) || "需求分析师",
            emoji: "",
            agentId: Ie === "temporary" || ce == null ? void 0 : ce.id,
            roleKey: Re,
            bindingMode: Ie
          };
        }
      );
      let H = te;
      (te.length === 0 || te.length !== z.length) && (H = z.map((ee) => ({
        agentName: ee,
        instruction: "请完成你的专业部分",
        passContext: T === "pipeline"
      })));
      const x = {
        id: (n == null ? void 0 : n.id) || `custom-${Date.now()}`,
        name: J.trim(),
        emoji: O,
        category: "自定义",
        description: v.trim() || `${J.trim()}（${z.length}人团队）`,
        mode: T,
        members: ue,
        coordinatorName: T === "coordinator" || T === "debate" ? F : void 0,
        taskTemplate: $.trim(),
        orchestrationPrompt: "",
        // Custom teams use steps-based instructions
        steps: H,
        custom: !0,
        createdAt: (n == null ? void 0 : n.createdAt) || Date.now(),
        updatedAt: n == null ? void 0 : n.updatedAt,
        version: n == null ? void 0 : n.version,
        maxReviewRounds: q,
        successCriteria: M.trim(),
        routingInstruction: pe.trim()
      };
      await Ba(x), C.success(n ? "团队已更新" : "团队已创建"), r(), t();
    } catch (k) {
      C.error(k.message || "保存失败");
    } finally {
      Y(!1);
    }
  }, K = a.filter(
    (k) => !z.includes(k.name)
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
      confirmLoading: le,
      okButtonProps: {
        icon: D ? l.createElement(D) : void 0
      }
    },
    // Step 1: Basic info
    l.createElement(
      "div",
      { style: { marginBottom: 16 } },
      l.createElement(
        N,
        {
          strong: !0,
          style: { display: "block", marginBottom: 8, fontSize: 13 }
        },
        "1. 定义任务工作流"
      ),
      l.createElement(
        "div",
        { style: { display: "flex", gap: 8, marginBottom: 8, alignItems: "center" } },
        z.length > 0 ? l.createElement(bn, {
          members: z,
          size: 36
        }) : null,
        l.createElement(d, {
          placeholder: "专家团名称（如：储层评价与质量复核专家团）",
          value: J,
          onChange: (k) => Q(k.target.value),
          style: { flex: 1 }
        })
      ),
      l.createElement(d.TextArea, {
        placeholder: "说明这个工作流解决什么问题、适用于什么场景",
        value: v,
        onChange: (k) => I(k.target.value),
        rows: 2,
        style: { marginBottom: 8 }
      }),
      l.createElement(
        N,
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
        ...ae.map((k) => {
          const ue = T === k.value;
          return l.createElement(
            "button",
            {
              key: k.value,
              type: "button",
              onClick: () => {
                U(k.value), k.value !== "coordinator" && k.value !== "debate" && L("");
              },
              style: {
                textAlign: "left",
                padding: 10,
                borderRadius: 8,
                cursor: "pointer",
                background: ue ? `${k.accent}0d` : "var(--ant-color-bg-container, #fff)",
                border: `1px solid ${ue ? k.accent : "var(--ant-color-border, #d9d9d9)"}`,
                boxShadow: ue ? `0 0 0 2px ${k.accent}1a` : "none"
              }
            },
            l.createElement(
              "div",
              { style: { display: "flex", alignItems: "center", gap: 7, color: k.accent, fontWeight: 600 } },
              l.createElement("span", { style: { fontSize: 18 } }, k.icon),
              k.title
            ),
            l.createElement("div", { style: { fontSize: 11, color: "#595959", marginTop: 5, lineHeight: 1.45 } }, k.description),
            l.createElement("div", { style: { fontSize: 10, color: k.accent, marginTop: 5, fontFamily: "monospace" } }, k.topology)
          );
        })
      )
    ),
    l.createElement(w, { style: { margin: "12px 0" } }),
    // Step 2: Select members
    l.createElement(
      "div",
      { style: { marginBottom: 16 } },
      l.createElement(
        N,
        {
          strong: !0,
          style: { display: "block", marginBottom: 8, fontSize: 13 }
        },
        "2. 配置专家角色"
      ),
      // Available agents
      K.length > 0 ? l.createElement(
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
        ...K.map(
          (k) => l.createElement(
            u,
            {
              key: k.id,
              size: "small",
              icon: A ? l.createElement(A) : void 0,
              onClick: () => he(k.name)
            },
            k.name
          )
        )
      ) : null,
      // Selected members
      z.length === 0 ? l.createElement(h, {
        description: "请从上方添加团队成员",
        image: h.PRESENTED_IMAGE_SIMPLE
      }) : l.createElement(
        "div",
        { style: { display: "flex", flexDirection: "column", gap: 4 } },
        ...z.map(
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
              l.createElement(We, { name: k, size: 24 }),
              l.createElement(
                N,
                { strong: !0, style: { fontSize: 13 } },
                k
              ),
              (T === "coordinator" || T === "debate") && F === k ? l.createElement(
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
                value: Ee[k] || It(k),
                style: { width: 132 },
                onChange: (ue) => ke({ ...Ee, [k]: ue }),
                options: Pe.map((ue) => ({
                  value: ue.key,
                  label: ue.display_name
                }))
              }),
              l.createElement(m, {
                size: "small",
                value: re[k] || "fixed",
                style: { width: 118 },
                onChange: (ue) => ye({ ...re, [k]: ue }),
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
                  onClick: () => L(k)
                },
                T === "debate" ? "设为裁决者" : "设为主控"
              ) : null,
              l.createElement(
                u,
                {
                  size: "small",
                  type: "link",
                  danger: !0,
                  icon: R ? l.createElement(R) : void 0,
                  onClick: () => Z(k)
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
          value: q,
          onChange: (k) => de(k),
          options: [1, 2, 3, 4, 5].map((k) => ({ value: k, label: `最多 ${k} 轮` }))
        }),
        l.createElement(d, {
          value: M,
          onChange: (k) => oe(k.target.value),
          placeholder: "验收标准，例如：关键结论均有数据依据，且无高风险缺陷"
        })
      ) : l.createElement(d, {
        value: pe,
        onChange: (k) => ie(k.target.value),
        placeholder: "路由偏好，例如：仅调用任务必需的专家；涉及模拟时优先油藏工程师"
      })
    ) : null,
    l.createElement(w, { style: { margin: "12px 0" } }),
    // Step 3: Define execution steps (for pipeline/roundtable)
    z.length > 0 ? l.createElement(
      "div",
      { style: { marginBottom: 16 } },
      l.createElement(
        N,
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
      te.length === 0 ? l.createElement(
        N,
        { type: "secondary", style: { fontSize: 12 } },
        "点击「自动生成步骤」或手动配置每步的指令"
      ) : l.createElement(
        "div",
        { style: { display: "flex", flexDirection: "column", gap: 6 } },
        ...te.map(
          (k, ue) => l.createElement(
            "div",
            {
              key: ue,
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
                `${ue + 1}`
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
                  onChange: (H) => me(ue, "instruction", H.target.value),
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
                onChange: (H) => me(ue, "passContext", H)
              }),
              l.createElement(
                N,
                { type: "secondary", style: { fontSize: 11 } },
                k.passContext ? "传递上一步结果作为上下文" : "独立执行"
              )
            )
          )
        )
      )
    ) : null,
    l.createElement(w, { style: { margin: "12px 0" } }),
    // Step 4: Task template
    l.createElement(
      "div",
      null,
      l.createElement(
        N,
        {
          strong: !0,
          style: { display: "block", marginBottom: 8, fontSize: 13 }
        },
        `${z.length > 0 ? "4" : "3"}. 任务模板`
      ),
      l.createElement(d.TextArea, {
        placeholder: `输入任务模板，可用 {参数名} 作为占位符...

例如：
请对区块 {区块名} 的井 {井号} 进行储层评价`,
        value: $,
        onChange: (k) => E(k.target.value),
        rows: 4,
        style: { fontFamily: "monospace", fontSize: 13 }
      }),
      l.createElement(
        N,
        {
          type: "secondary",
          style: { fontSize: 11, display: "block", marginTop: 4 }
        },
        "占位符 {参数名} 在发起任务时可由用户填写替换"
      )
    )
  );
}
function aa({
  team: e,
  agents: t,
  onLaunch: a,
  onEdit: n,
  onDelete: r
}) {
  var b;
  const l = _().React, { useState: o } = l, { Card: i, Tag: s, Typography: c, Button: d, Tooltip: u, Popconfirm: m } = _().antd, {
    TeamOutlined: p,
    RocketOutlined: f,
    UserOutlined: y,
    EditOutlined: h,
    DeleteOutlined: C,
    DownOutlined: w,
    UpOutlined: S
  } = _().antdIcons || {}, { Text: A, Paragraph: R } = c, [D, G] = o(!1), N = {
    coordinator: { label: "主管协作", color: "blue" },
    pipeline: { label: "顺序交接", color: "cyan" },
    roundtable: { label: "并行汇聚", color: "purple" },
    router: { label: "智能路由", color: "orange" },
    review_loop: { label: "评审迭代", color: "green" },
    debate: { label: "多方论证", color: "magenta" }
  }, B = N[e.mode] || N.coordinator, J = e.members.map((v) => {
    const I = v.bindingMode === "temporary", T = I ? null : (v.agentId && t.some((U) => U.id === v.agentId) ? v.agentId : null) || Ua(t, v.name);
    return { ...v, found: !!T, agentId: T, temporary: I };
  }), Q = J.filter((v) => v.found).length, O = e.coordinatorName || ((b = e.members[0]) == null ? void 0 : b.name);
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
      l.createElement(bn, {
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
            A,
            { strong: !0, style: { fontSize: 14 } },
            e.name
          ),
          e.custom ? l.createElement(
            s,
            { color: "gold", style: { fontSize: 9 } },
            "自定义"
          ) : null
        ),
        l.createElement(
          "div",
          { style: { display: "flex", gap: 4, marginTop: 4 } },
          l.createElement(
            s,
            { color: B.color, style: { fontSize: 10 } },
            B.label
          ),
          l.createElement(
            s,
            { color: "green", style: { fontSize: 10 } },
            `${e.members.length} 位专家`
          ),
          Q < e.members.length ? l.createElement(
            u,
            {
              title: `OMP 架构下，未创建的专家将通过 spawn_subagent 自动派发，
控制器会根据角色 prompt 创建子 agent 执行任务。`
            },
            l.createElement(
              s,
              { color: "blue", style: { fontSize: 10 } },
              "OMP 自动派发"
            )
          ) : l.createElement(
            s,
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
            onClick: (v) => {
              v.stopPropagation(), n(e);
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
              icon: C ? l.createElement(C) : void 0,
              onClick: (v) => v.stopPropagation()
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
      ...J.map(
        (v) => l.createElement(
          u,
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
            l.createElement(We, { name: v.name, size: 18 }),
            l.createElement(
              A,
              {
                style: { fontSize: 11, color: v.found ? "#1f4e8c" : "#531dab" }
              },
              v.name
            ),
            v.temporary ? l.createElement(
              s,
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
          v.stopPropagation(), G(!D);
        },
        icon: D ? S ? l.createElement(S) : "▲" : w ? l.createElement(w) : "▼"
      },
      D ? "收起流程" : "查看执行流程"
    ),
    D ? l.createElement(zl, { team: e }) : null,
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
        A,
        { type: "secondary", style: { fontSize: 11 } },
        O ? `${e.mode === "debate" ? "裁决者" : "主控"}: ${O}` : "OMP 动态编排"
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
function Pl({
  agents: e,
  onLaunch: t
}) {
  const a = _().React, { useMemo: n, useState: r, useCallback: l, useEffect: o } = a, {
    Row: i,
    Col: s,
    Input: c,
    Empty: d,
    Typography: u,
    Tag: m,
    Button: p,
    Divider: f,
    Tabs: y,
    message: h
  } = _().antd, { SearchOutlined: C, PlusOutlined: w, RocketOutlined: S } = _().antdIcons || {}, { Text: A } = u, [R, D] = r(""), [G, N] = r([]), [B, J] = r([]), [Q, O] = r(!1), [b, v] = r(null);
  o(() => {
    let V = !0;
    return (async () => {
      try {
        await vl();
        const z = await on();
        V && N(z);
      } catch (z) {
        console.warn("[ugsci] Failed to load backend expert teams:", z), V && (N([]), h.warning("专家团后端加载失败，请检查服务后重试"));
      }
    })(), kl().then((z) => {
      V && z && J(z);
    }), () => {
      V = !1;
    };
  }, []);
  const I = l(() => {
    on().then(N).catch((V) => {
      console.warn("[ugsci] Failed to refresh expert teams:", V), N([]), h.warning("专家团后端加载失败，请检查服务后重试");
    });
  }, [h]), T = l(
    (V) => {
      El(V.id).then(() => {
        I(), h.success(`团队「${V.name}」已删除`);
      }).catch((z) => h.error(z.message || "删除专家团失败"));
    },
    [h, I]
  ), U = l((V) => {
    v(V), O(!0);
  }, []), F = l(() => {
    v(null), O(!0);
  }, []), L = n(() => [...G, ...B], [G, B]), $ = n(() => {
    if (!R.trim()) return L;
    const V = R.toLowerCase();
    return L.filter(
      (z) => z.name.toLowerCase().includes(V) || z.description.toLowerCase().includes(V) || z.category.toLowerCase().includes(V)
    );
  }, [L, R]), E = $.filter((V) => V.custom), te = $.filter((V) => !V.custom);
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
        prefix: C ? a.createElement(C) : void 0,
        value: R,
        onChange: (V) => D(V.target.value),
        allowClear: !0,
        style: { flex: "1 1 280px", maxWidth: 400 }
      }),
      a.createElement(
        p,
        {
          type: "primary",
          size: "small",
          icon: w ? a.createElement(w) : void 0,
          onClick: F,
          style: Be
        },
        "创建专家团"
      )
    ),
    // Tabs: preset teams vs custom teams
    a.createElement(
      y,
      {
        defaultActiveKey: "preset",
        items: [
          {
            key: "preset",
            label: `预设团队${te.length ? ` (${te.length})` : ""}`,
            children: a.createElement(
              "div",
              null,
              te.length > 0 ? a.createElement(
                i,
                { gutter: [12, 12] },
                ...te.map(
                  (V) => a.createElement(
                    s,
                    { key: V.id, xs: 24, sm: 12, md: 8 },
                    a.createElement(aa, {
                      team: V,
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
            label: `自定义团队${E.length ? ` (${E.length})` : ""}`,
            children: a.createElement(
              "div",
              null,
              E.length > 0 ? a.createElement(
                i,
                { gutter: [12, 12] },
                ...E.map(
                  (V) => a.createElement(
                    s,
                    { key: V.id, xs: 24, sm: 12, md: 8 },
                    a.createElement(aa, {
                      team: V,
                      agents: e,
                      onLaunch: t,
                      onEdit: U,
                      onDelete: T
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
              a.createElement(Il),
              a.createElement(ta, { activeOnly: !0 })
            )
          },
          {
            key: "history",
            label: "讨论历史",
            children: a.createElement(ta)
          }
        ]
      }
    ),
    // Team Builder Modal
    a.createElement($l, {
      open: Q,
      onClose: () => {
        O(!1), v(null);
      },
      agents: e,
      editingTeam: b,
      onSaved: I
    })
  );
}
const Ol = [
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
], Ml = 5e3, Rl = {
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
function Ll(e) {
  window.history.pushState({}, "", e), window.dispatchEvent(new PopStateEvent("popstate"));
}
function tn(e, t) {
  const a = new URLSearchParams();
  e && a.set("flow", e), t && a.set("run", t), Ll(`/flowforge${a.size ? `?${a.toString()}` : ""}`);
}
function Bl(e) {
  return e ? new Date(e * 1e3).toLocaleString("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  }) : "—";
}
function Ul(e) {
  if (!e || e <= 0) return "—";
  if (e < 1e3) return `${e}ms`;
  const t = Math.floor(e / 1e3);
  if (t < 60) return `${t}s`;
  const a = Math.floor(t / 60), n = t % 60;
  return `${a}m${n}s`;
}
function jl(e) {
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
function Nl() {
  const e = _().React, { useCallback: t, useEffect: a, useRef: n, useState: r } = e, {
    Alert: l,
    Button: o,
    Card: i,
    Col: s,
    Empty: c,
    Input: d,
    Popconfirm: u,
    Row: m,
    Space: p,
    Spin: f,
    Tabs: y,
    Tag: h,
    Tooltip: C,
    Typography: w,
    message: S
  } = _().antd, {
    ApartmentOutlined: A,
    DeleteOutlined: R,
    ReloadOutlined: D,
    RocketOutlined: G,
    PlayCircleOutlined: N,
    StopOutlined: B
  } = _().antdIcons || {}, { Text: J, Paragraph: Q, Title: O } = w, b = _().useSelectedAgent, v = b ? b() : { id: "default" }, I = (v == null ? void 0 : v.id) || "default", [T, U] = r([]), [F, L] = r([]), [$, E] = r([]), [te, V] = r(!0), [z, X] = r(!0), [le, Y] = r(null), [q, de] = r(""), [M, oe] = r(""), [pe, ie] = r("templates"), [re, ye] = r(/* @__PURE__ */ new Set()), Ee = n(null), ke = F.some((x) => zt.has(x.status)), Pe = e.useMemo(() => {
    const x = {};
    return T.forEach((ee) => {
      x[ee.id] = ee.name;
    }), x;
  }, [T]), we = e.useMemo(() => {
    const x = {};
    return F.forEach((ee) => {
      zt.has(ee.status) && (x[ee.flow_id] = (x[ee.flow_id] || 0) + 1);
    }), x;
  }, [F]), ae = t(async (x = !1) => {
    x || V(!0);
    try {
      const [ee, ce, Ie] = await Promise.all([
        se("/flowforge/flows", { bypassCache: !0 }),
        se("/flowforge/runs", { bypassCache: !0 }),
        Jt().catch(() => [])
      ]);
      U(ee), L(ce), E(Ie), X(!0);
    } catch (ee) {
      console.warn("[ugsci] FlowForge is unavailable:", ee), X(!1);
    } finally {
      x || V(!1);
    }
  }, []);
  a(() => {
    ae();
  }, [ae]), a(() => {
    if (!z || !ke) {
      Ee.current && (clearTimeout(Ee.current), Ee.current = null);
      return;
    }
    return Ee.current = setTimeout(() => {
      ae(!0);
    }, Ml), () => {
      Ee.current && (clearTimeout(Ee.current), Ee.current = null);
    };
  }, [ke, z, ae]);
  const Se = t(
    async (x) => {
      if (!le) {
        Y(x.key);
        try {
          const ee = await se(
            "/flowforge/generate",
            {
              method: "POST",
              body: JSON.stringify({
                prompt: x.sop,
                name: x.name,
                agent_id: I
              })
            }
          ), ce = {
            ...ee.nodes || {}
          }, Ie = Object.entries(ce).filter(([De]) => /^step_\d+$/.test(De)).sort(([De], [Te]) => Number(De.slice(5)) - Number(Te.slice(5))), Re = {};
          let Ne = 0, Le = 0;
          Ie.forEach(([De, Te], Me) => {
            const ne = x.roleHints[Me] || "", ze = x.roleKeys[Me] || "analyst", Ae = $.find(
              (Je) => `${Je.name} ${Je.id}`.toLowerCase().includes(ne.toLowerCase())
            );
            Ae ? Ne++ : Le++;
            const Oe = (Ae == null ? void 0 : Ae.id) || I, He = { ...Te.inputs || {} };
            He.agent_id = Oe, ce[De] = {
              ...Te,
              inputs: He,
              metadata: {
                ...Te.metadata || {},
                binding_policy: "fixed_instance",
                role_hint: ne,
                role_key: ze,
                agent_id: Oe
              }
            }, Re[De] = {
              binding_policy: "fixed_instance",
              role_hint: ne,
              role_key: ze,
              agent_id: Oe
            };
          });
          const Ge = {
            ...ee,
            nodes: ce,
            id: `${x.key}-${Date.now()}`,
            name: x.name,
            description: x.description,
            metadata: {
              ...ee.metadata || {},
              domain: "oil-gas",
              template_key: x.key,
              expert_binding_policy: "fixed_instance",
              controller_agent_id: I,
              node_bindings: Re
            }
          };
          await se("/flowforge/flows", {
            method: "POST",
            body: JSON.stringify(Ge)
          });
          const et = Ie.length > 0 ? `（${Ne} 个专家已匹配，${Le} 个回退到控制器）` : "";
          S.success(`已创建工作流草稿「${x.name}」${et}`), await ae();
        } catch (ee) {
          S.error(ee.message || "创建工作流失败");
        } finally {
          Y(null);
        }
      }
    },
    [$, I, le, ae, S]
  ), he = t(async () => {
    if (!le) {
      if (!M.trim()) {
        S.warning("请先描述工作流步骤和控制要求");
        return;
      }
      Y("natural-language");
      try {
        const x = await se(
          "/flowforge/generate",
          {
            method: "POST",
            body: JSON.stringify({
              prompt: M.trim(),
              name: q.trim(),
              agent_id: I
            })
          }
        ), ee = {
          ...x,
          id: `natural-${Date.now()}`,
          metadata: {
            ...x.metadata || {},
            domain: "oil-gas",
            source: "natural-language",
            expert_binding_policy: "fixed_instance",
            controller_agent_id: I
          }
        };
        await se("/flowforge/flows", {
          method: "POST",
          body: JSON.stringify(ee)
        }), S.success("已从自然语言生成可编辑工作流草稿"), de(""), oe(""), await ae();
      } catch (x) {
        S.error(x.message || "自然语言生成失败");
      } finally {
        Y(null);
      }
    }
  }, [I, le, ae, S, q, M]), Z = t(
    async (x, ee) => {
      try {
        await se(`/flowforge/flows/${encodeURIComponent(x)}/run`, {
          method: "POST",
          body: JSON.stringify({ inputs: {} })
        }), S.success(`已启动工作流「${ee}」`), await ae(!0);
      } catch (ce) {
        S.error(ce.message || "启动工作流失败");
      }
    },
    [ae, S]
  ), me = t(
    async (x, ee) => {
      try {
        await se(`/flowforge/flows/${encodeURIComponent(x)}`, {
          method: "DELETE"
        }), S.success(`已删除工作流「${ee}」`), await ae();
      } catch (ce) {
        S.error(ce.message || "删除工作流失败");
      }
    },
    [ae, S]
  ), fe = t(
    async (x) => {
      ye((ee) => {
        const ce = new Set(ee);
        return ce.add(x), ce;
      });
      try {
        await se(`/flowforge/runs/${encodeURIComponent(x)}/cancel`, {
          method: "POST"
        }), S.success("已请求取消运行"), await ae(!0);
      } catch (ee) {
        S.error(ee.message || "取消运行失败");
      } finally {
        ye((ee) => {
          const ce = new Set(ee);
          return ce.delete(x), ce;
        });
      }
    },
    [ae, S]
  ), K = e.createElement(
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
          value: q,
          onChange: (x) => de(x.target.value),
          placeholder: "工作流名称（可选）",
          maxLength: 80
        }),
        e.createElement(d.TextArea, {
          value: M,
          onChange: (x) => oe(x.target.value),
          placeholder: "例如：先检查某储气库本周期压力和注采量数据，再由油藏工程师预测下周期能力，由独立完整性专家复核风险，最后形成带证据和不确定性的建议。",
          autoSize: { minRows: 3, maxRows: 8 }
        }),
        e.createElement(
          o,
          {
            type: "primary",
            onClick: () => void he(),
            loading: le === "natural-language",
            disabled: !z || !!le,
            style: Be
          },
          "生成可编辑草稿"
        )
      )
    ),
    e.createElement(
      m,
      { gutter: [12, 12] },
      ...Ol.map(
        (x) => e.createElement(
          s,
          { key: x.key, xs: 24, md: 8 },
          e.createElement(
            i,
            { style: { height: "100%" } },
            e.createElement(
              p,
              { align: "start", style: { width: "100%" } },
              e.createElement("span", { style: { fontSize: 28 } }, x.icon),
              e.createElement(
                "div",
                { style: { flex: 1 } },
                e.createElement(O, { level: 5, style: { margin: 0 } }, x.name),
                e.createElement(h, { color: "blue", style: { marginTop: 6 } }, x.category),
                e.createElement(
                  Q,
                  { type: "secondary", style: { margin: "10px 0 14px" } },
                  x.description
                ),
                e.createElement(
                  o,
                  {
                    type: "primary",
                    loading: le === x.key,
                    disabled: !z || !!le,
                    onClick: () => void Se(x),
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
          ([x, ee, ce]) => e.createElement(
            s,
            { key: x, xs: 24, sm: 12, lg: 6 },
            e.createElement(J, { strong: !0 }, x),
            e.createElement(
              h,
              {
                color: ce === "当前可执行" ? "green" : "default",
                style: { marginLeft: 6, fontSize: 10 }
              },
              ce
            ),
            e.createElement("div", { style: { color: "var(--ant-color-text-tertiary, #8c8c8c)", fontSize: 12, marginTop: 4 } }, ee)
          )
        )
      )
    )
  ), k = te ? e.createElement(f) : T.length === 0 ? e.createElement(c, { description: "暂无工作流，可从模板创建" }) : e.createElement(
    m,
    { gutter: [12, 12] },
    ...T.map((x) => {
      const ee = we[x.id] || 0;
      return e.createElement(
        s,
        { key: x.id, xs: 24, md: 12, xl: 8 },
        e.createElement(
          i,
          {
            size: "small",
            title: e.createElement(
              p,
              { size: 6 },
              e.createElement("span", null, x.name),
              ee > 0 ? e.createElement(
                h,
                { color: "blue" },
                `${ee} 个运行中`
              ) : null
            ),
            extra: e.createElement(h, null, `v${x.version}`)
          },
          e.createElement(Q, { ellipsis: { rows: 2 } }, x.description || "暂无描述"),
          e.createElement(
            p,
            { size: 8, wrap: !0 },
            e.createElement(h, { color: "geekblue" }, `${x.node_count} 个节点`),
            e.createElement(o, {
              size: "small",
              type: "primary",
              icon: N ? e.createElement(N) : void 0,
              disabled: !z,
              onClick: () => void Z(x.id, x.name)
            }, "运行"),
            e.createElement(o, {
              size: "small",
              onClick: () => tn(x.id)
            }, "编辑"),
            e.createElement(
              u,
              {
                title: "确认删除",
                description: `确定要删除工作流「${x.name}」吗？此操作不可撤销。`,
                onConfirm: () => void me(x.id, x.name),
                okText: "删除",
                cancelText: "取消",
                okButtonProps: { danger: !0 }
              },
              e.createElement(o, {
                size: "small",
                danger: !0,
                icon: R ? e.createElement(R) : void 0
              }, "删除")
            )
          )
        )
      );
    })
  ), ue = te ? e.createElement(f) : F.length === 0 ? e.createElement(c, { description: "暂无工作流运行记录" }) : e.createElement(
    "div",
    { style: { display: "flex", flexDirection: "column", gap: 8 } },
    ...F.map((x) => {
      const ee = Pe[x.flow_id] || x.flow_id, ce = zt.has(x.status), Ie = jl(x.node_statuses), Re = x.duration_ms && x.duration_ms > 0 ? x.duration_ms : x.finished_at && x.started_at ? (x.finished_at - x.started_at) * 1e3 : ce && x.started_at ? (Date.now() / 1e3 - x.started_at) * 1e3 : 0;
      return e.createElement(
        i,
        { key: x.run_id, size: "small" },
        e.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" } },
          e.createElement(
            h,
            { color: Rl[x.status] || "default" },
            x.status
          ),
          e.createElement(J, { strong: !0 }, ee),
          e.createElement(
            C,
            { title: x.run_id },
            e.createElement(
              J,
              { type: "secondary", style: { fontFamily: "monospace", fontSize: 11 } },
              x.run_id.slice(0, 8) + "…"
            )
          ),
          e.createElement(
            J,
            { type: "secondary", style: { fontSize: 12 } },
            Bl(x.started_at)
          ),
          Re > 0 ? e.createElement(
            J,
            { type: "secondary", style: { fontSize: 12 } },
            `耗时 ${Ul(Re)}`
          ) : null,
          Ie ? e.createElement(h, { color: "geekblue", style: { fontSize: 11 } }, Ie) : null,
          x.error ? e.createElement(
            C,
            { title: x.error },
            e.createElement(J, { type: "danger", style: { fontSize: 12 } }, "（有错误）")
          ) : null,
          e.createElement(
            "div",
            { style: { marginLeft: "auto", display: "flex", gap: 6 } },
            ce ? e.createElement(
              u,
              {
                title: "确认取消运行？",
                onConfirm: () => void fe(x.run_id),
                okText: "取消运行",
                cancelText: "保留",
                okButtonProps: { danger: !0 }
              },
              e.createElement(o, {
                size: "small",
                danger: !0,
                loading: re.has(x.run_id),
                icon: B ? e.createElement(B) : void 0
              }, "取消运行")
            ) : null,
            e.createElement(
              o,
              { size: "small", type: "link", onClick: () => tn(void 0, x.run_id) },
              "查看详情"
            )
          )
        )
      );
    })
  ), H = e.createElement(
    p,
    null,
    e.createElement(o, {
      icon: D ? e.createElement(D) : void 0,
      onClick: () => void ae(),
      loading: te
    }, "刷新"),
    pe !== "templates" ? e.createElement(o, {
      type: "primary",
      icon: A ? e.createElement(A) : G ? e.createElement(G) : void 0,
      onClick: () => tn(),
      disabled: !z,
      style: Be
    }, "打开流程编辑器") : null
  );
  return e.createElement(
    "div",
    null,
    z ? null : e.createElement(l, {
      type: "warning",
      message: "FlowForge 引擎未启动",
      description: "协作工作流功能需要 FlowForge 后端引擎支持。请检查后端是否正常运行，或联系管理员。",
      showIcon: !0,
      style: { marginBottom: 16 }
    }),
    e.createElement(y, {
      items: [
        { key: "templates", label: "工作流模板", children: K },
        { key: "mine", label: `我的工作流 (${T.length})`, children: k },
        {
          key: "runs",
          label: e.createElement(
            "span",
            null,
            "运行中心 (",
            F.length,
            ke ? e.createElement(
              "span",
              { style: { color: "#1677ff", marginLeft: 2 } },
              `·${F.filter((x) => zt.has(x.status)).length} 活跃`
            ) : null,
            ")"
          ),
          children: ue
        }
      ],
      activeKey: pe,
      onChange: (x) => ie(x),
      tabBarExtraContent: H
    })
  );
}
function ra(e, t) {
  var r, l;
  const a = e.coordinatorName || ((r = e.members[0]) == null ? void 0 : r.name), n = e.members.find((o) => o.name === a) || e.members[0];
  if ((n == null ? void 0 : n.bindingMode) !== "temporary" && (n != null && n.agentId) && t.some((o) => o.id === n.agentId))
    return n.agentId;
  if (a && (n == null ? void 0 : n.bindingMode) !== "temporary") {
    const o = Ua(t, a);
    if (o) return o;
  }
  return (n == null ? void 0 : n.bindingMode) === "fixed" ? null : ((l = t[0]) == null ? void 0 : l.id) || null;
}
function la() {
  const e = new URLSearchParams(window.location.search).get("section");
  return e === "teams" || e === "workflows" ? e : "experts";
}
function Dl() {
  var me, fe;
  const e = _().React, { useState: t, useEffect: a, useCallback: n, useMemo: r } = e, {
    Spin: l,
    Empty: o,
    Input: i,
    Button: s,
    message: c,
    Row: d,
    Col: u,
    Tabs: m,
    Modal: p,
    Typography: f
  } = _().antd, {
    ReloadOutlined: y,
    PlusOutlined: h,
    SearchOutlined: C,
    TeamOutlined: w,
    UserOutlined: S
  } = _().antdIcons || {}, { Text: A, Paragraph: R } = f, [D, G] = t([]), [N, B] = t(!0), [J, Q] = t(!1), [O, b] = t(null), [v, I] = t(""), [T, U] = t(!1), [F, L] = t(la), [$, E] = t(
    null
  ), [te, V] = t(""), [z, X] = t(!1), [le, Y] = t(!1), [q, de] = t(null), [M, oe] = t([]), pe = n(async () => {
    B(!0);
    try {
      const K = await Jt(), k = await Promise.all(
        K.map(async (ue) => {
          try {
            const [H, x, ee] = await Promise.all([
              fn(ue.id).catch(() => null),
              qt(ue.id).catch(() => []),
              En(ue.id).catch(() => [])
            ]);
            return {
              agent: ue,
              config: H,
              skills: x,
              mcps: ee,
              loading: !1
            };
          } catch {
            return {
              agent: ue,
              config: null,
              skills: [],
              mcps: [],
              loading: !1
            };
          }
        })
      );
      G(k), oe(K);
    } catch (K) {
      c.error(K.message || "加载专家列表失败"), G([]);
    } finally {
      B(!1);
    }
  }, []);
  a(() => {
    pe();
  }, [pe]), a(() => {
    const K = () => L(la());
    return window.addEventListener("popstate", K), () => window.removeEventListener("popstate", K);
  }, []), a(() => {
    if (q && le) {
      const K = D.find(
        (k) => k.agent.id === q.agent.id
      );
      K && K !== q && de(K);
    }
  }, [D, q, le]);
  const ie = n(
    async (K) => {
      var x;
      const k = K.coordinatorName || ((x = K.members[0]) == null ? void 0 : x.name), ue = ra(K, M);
      if (!ue) {
        const ee = K.members.find(
          (ce) => ce.name === k
        );
        c.error(
          (ee == null ? void 0 : ee.bindingMode) === "fixed" ? `固定协调者「${k || "协调者"}」当前不可用，请修复绑定后再运行` : "没有可用的 Agent 作为工作流控制器"
        );
        return;
      }
      if (/\{.+?\}/.test(K.taskTemplate)) {
        V(K.taskTemplate), E(K);
        return;
      }
      await re(K, ue, K.taskTemplate);
    },
    [M, c]
  ), re = n(
    async (K, k, ue) => {
      X(!0);
      try {
        const H = ue || K.taskTemplate, x = K.custom ? `@${K.id}` : K.name, ee = `/ugsci-team ${K.mode} ${x} ${H}`, ce = _();
        ce.setSelectedAgent && ce.setSelectedAgent(k);
        const Ie = await wl(
          k,
          ee,
          K.name
        );
        c.success(
          `OMP 工作流已启动：${K.name}（${K.mode}模式）`
        ), E(null), ye(`/chat/${Ie}`);
      } catch (H) {
        c.error(H.message || "发起团队任务失败");
      } finally {
        X(!1);
      }
    },
    [c]
  ), ye = (K) => {
    window.history.pushState({}, "", K), window.dispatchEvent(new PopStateEvent("popstate"));
  }, Ee = n((K) => {
    b(K), Q(!0);
  }, []), ke = n((K) => {
    de(K), Y(!0);
  }, []), Pe = n(
    (K) => {
      if (!K.agent.enabled) {
        c.warning(`专家「${K.agent.name}」未启用，请先启用`);
        return;
      }
      try {
        const k = _();
        k.setSelectedAgent && k.setSelectedAgent(K.agent.id);
      } catch (k) {
        console.warn("[ugsci] Failed to set selected agent:", k);
      }
      c.success(`已召唤专家「${K.agent.name}」，正在跳转至对话...`), ye("/chat");
    },
    [c]
  ), we = r(() => {
    if (!v.trim()) return D;
    const K = v.toLowerCase();
    return D.filter(
      (k) => {
        var ue;
        return k.agent.name.toLowerCase().includes(K) || ((ue = k.agent.description) == null ? void 0 : ue.toLowerCase().includes(K)) || k.agent.id.toLowerCase().includes(K) || k.skills.some((H) => H.name.toLowerCase().includes(K));
      }
    );
  }, [D, v]), ae = D.filter((K) => K.agent.enabled).length, Se = D.reduce(
    (K, k) => K + k.skills.filter((ue) => ue.enabled !== !1).length,
    0
  ), he = D.reduce((K, k) => K + k.mcps.length, 0), Z = [
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
            prefix: C ? e.createElement(C) : void 0,
            value: v,
            onChange: (K) => I(K.target.value),
            allowClear: !0,
            style: { flex: "1 1 280px", maxWidth: 400 }
          }),
          e.createElement(
            s,
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
        N ? e.createElement(
          "div",
          { style: { textAlign: "center", padding: 60 } },
          e.createElement(l, { size: "large" })
        ) : we.length === 0 ? e.createElement(o, {
          description: v ? "未找到匹配的专家" : "暂无专家，点击「创建专家」添加"
        }) : e.createElement(
          d,
          { gutter: [12, 12], align: "stretch" },
          ...we.map(
            (K) => e.createElement(
              u,
              {
                key: K.agent.id,
                xs: 24,
                sm: 12,
                md: 8,
                lg: 6,
                style: { display: "flex" }
              },
              e.createElement(il, {
                expert: K,
                onClick: () => Ee(K),
                onSummon: () => Pe(K),
                onConfigure: () => ke(K)
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
        w ? e.createElement(w, { style: { fontSize: 14 } }) : null,
        "专家团"
      ),
      children: e.createElement(Pl, {
        agents: M,
        onLaunch: ie
      })
    },
    {
      key: "workflows",
      label: e.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        (me = _().antdIcons) != null && me.ApartmentOutlined ? e.createElement(_().antdIcons.ApartmentOutlined, {
          style: { fontSize: 14 }
        }) : null,
        "协作工作流"
      ),
      children: e.createElement(Nl)
    }
  ];
  return e.createElement(
    "div",
    { style: { padding: 24 } },
    e.createElement(Ht, {
      title: "专家·协作",
      subtitle: F === "experts" ? `共 ${D.length} 位专家（${ae} 位启用）· ${Se} 个技能 · ${he} 个 MCP 客户端` : F === "teams" ? "开放式多专家讨论、联合研判与 OMP 动态协作" : "流程化、可观测、可验证的油气与储气库协作流程",
      extra: e.createElement(
        e.Fragment,
        null,
        F === "experts" ? e.createElement(
          s,
          {
            icon: y ? e.createElement(y) : void 0,
            onClick: () => {
              St(), pe();
            },
            loading: N
          },
          "刷新"
        ) : null
      )
    }),
    e.createElement(m, {
      items: Z,
      activeKey: F,
      onChange: (K) => {
        L(K);
        const k = new URL(window.location.href);
        K === "experts" ? k.searchParams.delete("section") : k.searchParams.set("section", K), window.history.pushState({}, "", `${k.pathname}${k.search}`);
      }
    }),
    // Drawer
    e.createElement(cl, {
      expert: O,
      open: J,
      onClose: () => Q(!1),
      onRefresh: () => pe()
    }),
    // Template Modal
    e.createElement(dl, {
      open: T,
      onClose: () => U(!1),
      onCreated: () => pe()
    }),
    // Config Modal (gear icon)
    e.createElement(ll, {
      expert: q,
      open: le,
      onClose: () => Y(!1),
      onRefresh: () => pe()
    }),
    // Team Launch Modal (for filling placeholders)
    $ ? e.createElement(
      p,
      {
        open: !0,
        title: e.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 8 } },
          e.createElement(bn, {
            members: $.members.map((K) => K.name),
            size: 28
          }),
          e.createElement(
            "span",
            null,
            `发起团队任务 - ${$.name}`
          )
        ),
        onCancel: () => E(null),
        onOk: () => {
          const K = ra(
            $,
            M
          );
          if (!K) {
            c.error("固定协调者不可用或没有可用的控制器 Agent");
            return;
          }
          const k = te.trim() || $.taskTemplate;
          re($, K, k);
        },
        confirmLoading: z,
        okText: "发起任务",
        width: 600
      },
      e.createElement(
        "div",
        null,
        e.createElement(
          A,
          {
            type: "secondary",
            style: { fontSize: 12, display: "block", marginBottom: 8 }
          },
          "任务内容（请替换 {参数名} 等占位符后发起）："
        ),
        e.createElement(i.TextArea, {
          value: te,
          onChange: (K) => V(K.target.value),
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
          A,
          { style: { fontSize: 12, color: "#0958d9" } },
          `协调者: ${$.coordinatorName || ((fe = $.members[0]) == null ? void 0 : fe.name) || "—"} · 成员: ${$.members.map((K) => K.name).join("、")}`
        )
      )
    ) : null
  );
}
function Gl({
  agentId: e,
  agentName: t,
  refreshKey: a = 0,
  onNavigate: n
}) {
  const r = _().React, { useState: l, useEffect: o, useCallback: i } = r, {
    Spin: s,
    Empty: c,
    Button: d,
    Row: u,
    Col: m,
    Card: p,
    Tag: f,
    Checkbox: y,
    Modal: h,
    Typography: C,
    Drawer: w,
    Descriptions: S,
    message: A
  } = _().antd, {
    ReloadOutlined: R,
    ThunderboltOutlined: D,
    SettingOutlined: G,
    CheckSquareOutlined: N,
    EyeOutlined: B,
    EyeInvisibleOutlined: J,
    DeleteOutlined: Q,
    CloseOutlined: O
  } = _().antdIcons || {}, { Text: b, Paragraph: v } = C, [I, T] = l([]), [U, F] = l(!0), [L, $] = l(!1), [E, te] = l(null), [V, z] = l(!1), [X, le] = l(
    /* @__PURE__ */ new Set()
  ), [Y, q] = l(!1), [de, M] = l(null), [oe, pe] = l(!1), ie = i(async () => {
    if (e) {
      F(!0);
      try {
        const Z = await qt(e);
        T(Z);
      } catch (Z) {
        A.error(Z.message || "加载技能失败"), T([]);
      } finally {
        F(!1);
      }
    }
  }, [e]);
  o(() => {
    ie();
  }, [ie, a]);
  const re = (Z) => {
    le((me) => {
      const fe = new Set(me);
      return fe.has(Z) ? fe.delete(Z) : fe.add(Z), fe;
    });
  }, ye = () => le(/* @__PURE__ */ new Set()), Ee = () => le(new Set(I.map((Z) => Z.name))), ke = () => {
    V ? (ye(), z(!1)) : z(!0);
  }, Pe = async () => {
    const Z = Array.from(X);
    if (Z.length !== 0) {
      q(!0);
      try {
        const { results: me } = await Br(e, Z), fe = Object.entries(me).filter(
          ([, k]) => k.success === !1
        ), K = Z.length - fe.length;
        fe.length > 0 ? A.warning(
          `批量启用完成：成功 ${K} 个，失败 ${fe.length} 个`
        ) : A.success(`成功启用 ${Z.length} 个技能`), ye(), await ie();
      } catch (me) {
        A.error(me.message || "批量启用失败");
      } finally {
        q(!1);
      }
    }
  }, we = async () => {
    const Z = Array.from(X);
    if (Z.length !== 0) {
      q(!0);
      try {
        const { results: me } = await Ur(e, Z), fe = Object.entries(me).filter(
          ([, k]) => k.success === !1
        ), K = Z.length - fe.length;
        fe.length > 0 ? A.warning(
          `批量停用完成：成功 ${K} 个，失败 ${fe.length} 个`
        ) : A.success(`成功停用 ${Z.length} 个技能`), ye(), await ie();
      } catch (me) {
        A.error(me.message || "批量停用失败");
      } finally {
        q(!1);
      }
    }
  }, ae = () => {
    const Z = Array.from(X);
    Z.length !== 0 && h.confirm({
      title: `确认删除 ${Z.length} 个技能？`,
      content: "删除后技能将从当前专家工作区移除，此操作不可撤销。技能池中的原始技能不受影响。",
      okText: "确认删除",
      cancelText: "取消",
      okButtonProps: { danger: !0 },
      onOk: async () => {
        q(!0);
        try {
          const { results: me } = await jr(e, Z), fe = Object.entries(me).filter(
            ([, k]) => k.success === !1
          ), K = Z.length - fe.length;
          fe.length > 0 ? A.warning(
            `批量删除完成：成功 ${K} 个，失败 ${fe.length} 个`
          ) : A.success(`成功删除 ${Z.length} 个技能`), ye(), await ie();
        } catch (me) {
          A.error(me.message || "批量删除失败");
        } finally {
          q(!1);
        }
      }
    });
  }, Se = async (Z) => {
    pe(!0);
    try {
      Z.enabled === !1 ? (await Ia(e, Z.name), A.success(`已启用技能「${Z.name}」`)) : (await Aa(e, Z.name), A.success(`已禁用技能「${Z.name}」`)), await ie();
    } catch (me) {
      A.error(me.message || "操作失败");
    } finally {
      pe(!1);
    }
  }, he = (Z) => {
    h.confirm({
      title: `确认删除技能「${Z.name}」？`,
      content: "删除后技能将从当前专家工作区移除，此操作不可撤销。技能池中的原始技能不受影响。",
      okText: "确认删除",
      cancelText: "取消",
      okButtonProps: { danger: !0 },
      onOk: async () => {
        pe(!0);
        try {
          await hn(e, Z.name), A.success(`已删除技能「${Z.name}」`), await ie();
        } catch (me) {
          A.error(me.message || "删除失败");
        } finally {
          pe(!1);
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
        V ? `已选择 ${X.size} / ${I.length} 个技能` : `共 ${I.length} 个技能`
      ),
      r.createElement(
        "div",
        { style: { display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" } },
        V ? r.createElement(
          r.Fragment,
          null,
          r.createElement(
            d,
            { size: "small", onClick: Ee },
            "全选"
          ),
          r.createElement(
            d,
            {
              size: "small",
              icon: O ? r.createElement(O) : void 0,
              onClick: ye
            },
            "取消选择"
          ),
          r.createElement(
            d,
            {
              size: "small",
              type: "default",
              icon: B ? r.createElement(B) : void 0,
              disabled: X.size === 0 || Y,
              loading: Y,
              onClick: Pe
            },
            "批量启用"
          ),
          r.createElement(
            d,
            {
              size: "small",
              danger: !0,
              icon: J ? r.createElement(J) : void 0,
              disabled: X.size === 0 || Y,
              loading: Y,
              onClick: we
            },
            "批量停用"
          ),
          r.createElement(
            d,
            {
              size: "small",
              danger: !0,
              icon: Q ? r.createElement(Q) : void 0,
              disabled: X.size === 0 || Y,
              loading: Y,
              onClick: ae
            },
            `删除 (${X.size})`
          ),
          r.createElement(
            d,
            {
              size: "small",
              type: "primary",
              onClick: ke
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
              icon: N ? r.createElement(N) : void 0,
              onClick: ke,
              disabled: I.length === 0
            },
            "批量管理"
          ),
          r.createElement(
            d,
            {
              icon: R ? r.createElement(R) : void 0,
              onClick: () => {
                St(), ie();
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
      r.createElement(s, { size: "large" })
    ) : I.length === 0 ? r.createElement(c, {
      description: "当前智能体未加载任何技能"
    }) : r.createElement(
      u,
      { gutter: [12, 12] },
      ...I.map(
        (Z) => r.createElement(
          m,
          { key: Z.name, xs: 24, sm: 12, md: 8, lg: 6 },
          r.createElement(
            p,
            {
              hoverable: !0,
              size: "small",
              style: {
                cursor: V ? "default" : "pointer",
                height: "100%",
                position: "relative",
                borderColor: V && X.has(Z.name) ? "#0072f5" : void 0,
                borderWidth: V && X.has(Z.name) ? 2 : 1
              },
              onClick: () => {
                V ? re(Z.name) : (te(Z), $(!0));
              },
              onMouseEnter: () => {
                V || M(Z.name);
              },
              onMouseLeave: () => M(null)
            },
            V ? r.createElement(
              "div",
              {
                style: {
                  position: "absolute",
                  top: 8,
                  right: 8,
                  zIndex: 1
                },
                onClick: (me) => {
                  me.stopPropagation(), re(Z.name);
                }
              },
              r.createElement(y, {
                checked: X.has(Z.name)
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
              Z.emoji ? r.createElement(
                "span",
                { style: { fontSize: 18 } },
                Z.emoji
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
                Z.name
              ),
              Z.enabled === !1 ? r.createElement(
                f,
                { color: "default", style: { fontSize: 10 } },
                "已禁用"
              ) : r.createElement(
                f,
                { color: "green", style: { fontSize: 10 } },
                "已启用"
              )
            ),
            Z.description ? r.createElement(
              v,
              {
                type: "secondary",
                style: { fontSize: 11, margin: 0, lineHeight: 1.4 },
                ellipsis: { rows: 2 }
              },
              Z.description
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
              Z.version_text ? r.createElement(
                f,
                { style: { fontSize: 10 } },
                `v${Z.version_text}`
              ) : null,
              ...(Z.tags || []).slice(0, 3).map(
                (me, fe) => r.createElement(
                  f,
                  { key: fe, color: "blue", style: { fontSize: 10 } },
                  me
                )
              )
            ),
            // Hover action footer (not in batch mode)
            !V && de === Z.name ? r.createElement(
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
                  icon: Z.enabled === !1 ? B ? r.createElement(B) : void 0 : J ? r.createElement(J) : void 0,
                  disabled: oe,
                  onClick: (me) => {
                    me.stopPropagation(), Se(Z);
                  }
                },
                Z.enabled === !1 ? "启用" : "禁用"
              ),
              r.createElement(
                d,
                {
                  size: "small",
                  danger: !0,
                  icon: Q ? r.createElement(Q) : void 0,
                  disabled: oe,
                  onClick: (me) => {
                    me.stopPropagation(), he(Z);
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
    E ? r.createElement(
      w,
      {
        title: r.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 8 } },
          r.createElement(
            "span",
            { style: { fontSize: 18 } },
            E.emoji || "⚡"
          ),
          r.createElement("span", null, E.name)
        ),
        open: L,
        onClose: () => $(!1),
        width: 520,
        extra: r.createElement(
          d,
          {
            type: "primary",
            size: "small",
            icon: G ? r.createElement(G) : void 0,
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
          E.name
        ),
        r.createElement(
          S.Item,
          { label: "描述" },
          E.description || "-"
        ),
        E.version_text ? r.createElement(
          S.Item,
          { label: "版本" },
          E.version_text
        ) : null,
        r.createElement(
          S.Item,
          { label: "来源" },
          E.source || "-"
        ),
        r.createElement(
          S.Item,
          { label: "状态" },
          E.enabled === !1 ? "已禁用" : "已启用"
        ),
        E.installed_from ? r.createElement(
          S.Item,
          { label: "安装来源" },
          E.installed_from
        ) : null
      ),
      // Tags
      E.tags && E.tags.length > 0 ? r.createElement(
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
          ...E.tags.map(
            (Z, me) => r.createElement(f, { key: me, color: "blue" }, Z)
          )
        )
      ) : null,
      // Skill content preview
      E.content ? r.createElement(
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
          E.content.slice(0, 2e3) + (E.content.length > 2e3 ? `

... (内容已截断)` : "")
        )
      ) : null
    ) : null
  );
}
function Fl({
  poolSkills: e,
  workspaceSkills: t,
  agents: a,
  loading: n,
  onReload: r,
  onSkillInstalled: l,
  agentId: o,
  agentName: i
}) {
  const s = _().React, { useState: c, useMemo: d, useCallback: u, useEffect: m, useRef: p } = s, {
    Spin: f,
    Empty: y,
    Input: h,
    Button: C,
    Row: w,
    Col: S,
    Card: A,
    Tag: R,
    Typography: D,
    Drawer: G,
    Descriptions: N,
    List: B,
    Modal: J,
    message: Q
  } = _().antd, {
    ReloadOutlined: O,
    SearchOutlined: b,
    DownloadOutlined: v,
    ThunderboltOutlined: I,
    DeleteOutlined: T,
    PlusOutlined: U
  } = _().antdIcons || {}, { Text: F, Paragraph: L } = D, [$, E] = c(""), [te, V] = c(!1), [z, X] = c(null), [le, Y] = c([]), [q, de] = c(!1), [M, oe] = c(24), [pe, ie] = c(null), [re, ye] = c(!1), Ee = p(0), ke = p(null), Pe = d(
    () => {
      var H;
      return new Set(
        ((H = t.find((x) => x.agent_id === o)) == null ? void 0 : H.skill_names) || []
      );
    },
    [t, o]
  ), we = d(() => {
    if (!$.trim()) return e;
    const H = $.toLowerCase();
    return e.filter(
      (x) => {
        var ee, ce;
        return x.name.toLowerCase().includes(H) || ((ee = x.description) == null ? void 0 : ee.toLowerCase().includes(H)) || ((ce = x.tags) == null ? void 0 : ce.some((Ie) => Ie.toLowerCase().includes(H)));
      }
    );
  }, [e, $]), ae = d(
    () => we.slice(0, M),
    [we, M]
  );
  m(() => {
    if (ae.length >= we.length) return;
    const H = ke.current;
    if (!H) return;
    const x = () => {
      oe(
        (ce) => Math.min(ce + 24, we.length)
      );
    };
    if (typeof IntersectionObserver < "u") {
      const ce = new IntersectionObserver(
        (Ie) => {
          Ie.some((Re) => Re.isIntersecting) && x();
        },
        { rootMargin: "240px 0px" }
      );
      return ce.observe(H), () => ce.disconnect();
    }
    const ee = () => {
      H.getBoundingClientRect().top <= window.innerHeight + 240 && x();
    };
    return window.addEventListener("scroll", ee, { passive: !0 }), ee(), () => window.removeEventListener("scroll", ee);
  }, [we.length, ae.length]);
  const Se = u((H) => {
    E(H), oe(24);
  }, []), he = u(() => {
    const H = Ee.current;
    requestAnimationFrame(() => {
      window.scrollTo({ top: H, behavior: "auto" }), document.scrollingElement && (document.scrollingElement.scrollTop = H);
    });
  }, []), Z = u(async () => {
    var H;
    Ee.current = ((H = document.scrollingElement) == null ? void 0 : H.scrollTop) ?? window.scrollY ?? 0;
    try {
      await r();
    } finally {
      he();
    }
  }, [r, he]), me = u(
    (H) => {
      const x = [];
      for (const ee of t)
        if (ee.skill_names.includes(H)) {
          const ce = a.find((Ie) => Ie.id === ee.agent_id);
          x.push((ce == null ? void 0 : ce.name) || ee.agent_name || ee.agent_id);
        }
      return x;
    },
    [t, a]
  ), fe = u(
    async (H) => {
      if (X(H), Y(me(H.name)), V(!0), !H.content) {
        de(!0);
        try {
          const x = await Ar(H.name);
          X({ ...H, content: x });
        } catch {
        } finally {
          de(!1);
        }
      }
    },
    [me]
  );
  m(() => {
    z && Y(me(z.name));
  }, [z, me, t]);
  const K = async (H) => {
    ye(!0);
    try {
      await yn(o, H.name), Q.success(
        `已将技能「${H.name}」加载到当前专家「${i}」`
      ), l(H);
    } catch (x) {
      Q.error(x.message || "加载技能失败");
    } finally {
      ye(!1);
    }
  }, k = (H) => {
    if (H.protected) {
      Q.warning("内置技能不可删除");
      return;
    }
    J.confirm({
      title: `确认从技能池删除「${H.name}」？`,
      content: "删除后所有已安装此技能的专家将不受影响，但技能池中将不再包含此技能。此操作不可撤销。",
      okText: "确认删除",
      cancelText: "取消",
      okButtonProps: { danger: !0 },
      onOk: async () => {
        ye(!0);
        try {
          await Dr(H.name), Q.success(`已从技能池删除「${H.name}」`), await Z();
        } catch (x) {
          Q.error(x.message || "删除失败");
        } finally {
          ye(!1);
        }
      }
    });
  }, ue = (H) => {
    window.history.pushState({}, "", H), window.dispatchEvent(new PopStateEvent("popstate"));
  };
  return s.createElement(
    "div",
    null,
    s.createElement(
      "div",
      {
        style: {
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16
        }
      },
      s.createElement(h, {
        placeholder: "搜索技能名称、描述或标签...",
        prefix: b ? s.createElement(b) : void 0,
        value: $,
        onChange: (H) => Se(H.target.value),
        allowClear: !0,
        style: { maxWidth: 400 }
      }),
      s.createElement(
        "div",
        { style: { display: "flex", gap: 8 } },
        s.createElement(
          C,
          {
            icon: O ? s.createElement(O) : void 0,
            onClick: Z,
            loading: n,
            size: "small"
          },
          "刷新"
        ),
        s.createElement(
          C,
          {
            type: "primary",
            icon: v ? s.createElement(v) : void 0,
            onClick: () => ue("/skill-pool"),
            size: "small",
            style: Be
          },
          "管理技能池"
        )
      )
    ),
    n ? s.createElement(
      "div",
      { style: { textAlign: "center", padding: 60 } },
      s.createElement(f, { size: "large" })
    ) : we.length === 0 ? s.createElement(y, {
      description: $ ? "未找到匹配的技能" : "技能池为空"
    }) : s.createElement(
      s.Fragment,
      null,
      s.createElement(
        w,
        { gutter: [12, 12] },
        ...ae.map(
          (H) => s.createElement(
            S,
            { key: H.name, xs: 24, sm: 12, md: 8, lg: 6 },
            s.createElement(
              A,
              {
                hoverable: !0,
                size: "small",
                style: { cursor: "pointer", height: "100%" },
                onClick: () => fe(H),
                onMouseEnter: () => ie(H.name),
                onMouseLeave: () => ie(null)
              },
              s.createElement(
                "div",
                {
                  style: {
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 8
                  }
                },
                H.emoji ? s.createElement(
                  "span",
                  { style: { fontSize: 18 } },
                  H.emoji
                ) : s.createElement(
                  "span",
                  { style: { fontSize: 18 } },
                  "⚡"
                ),
                s.createElement(
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
                  H.name
                ),
                H.protected ? s.createElement(
                  R,
                  { color: "gold", style: { fontSize: 10 } },
                  "内置"
                ) : null
              ),
              H.description ? s.createElement(
                L,
                {
                  type: "secondary",
                  style: { fontSize: 11, margin: 0, lineHeight: 1.4 },
                  ellipsis: { rows: 2 }
                },
                H.description
              ) : null,
              s.createElement(
                "div",
                {
                  style: {
                    marginTop: 8,
                    display: "flex",
                    gap: 4,
                    flexWrap: "wrap"
                  }
                },
                H.version_text ? s.createElement(
                  R,
                  { style: { fontSize: 10 } },
                  `v${H.version_text}`
                ) : null,
                ...(H.tags || []).slice(0, 3).map(
                  (x, ee) => s.createElement(
                    R,
                    { key: ee, color: "cyan", style: { fontSize: 10 } },
                    x
                  )
                )
              ),
              // Hover action footer
              pe === H.name ? s.createElement(
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
                s.createElement(
                  C,
                  {
                    size: "small",
                    type: "primary",
                    icon: U ? s.createElement(U) : void 0,
                    disabled: re || Pe.has(H.name),
                    onClick: (x) => {
                      x.stopPropagation(), K(H);
                    }
                  },
                  Pe.has(H.name) ? "已加载" : "加载到当前Agent"
                ),
                s.createElement(
                  C,
                  {
                    size: "small",
                    danger: !0,
                    icon: T ? s.createElement(T) : void 0,
                    disabled: re || H.protected,
                    onClick: (x) => {
                      x.stopPropagation(), k(H);
                    }
                  },
                  "删除"
                )
              ) : null
            )
          )
        ),
        // Infinite-scroll sentinel
        ae.length < we.length ? s.createElement(
          "div",
          {
            ref: ke,
            style: {
              minHeight: 40,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginTop: 16
            }
          },
          s.createElement(
            F,
            { type: "secondary", style: { fontSize: 12 } },
            `继续下滑自动加载 · 还剩 ${we.length - ae.length} 个`
          )
        ) : null
      )
    ),
    // Skill detail drawer
    z ? s.createElement(
      G,
      {
        title: s.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 8 } },
          s.createElement(
            "span",
            { style: { fontSize: 18 } },
            z.emoji || "⚡"
          ),
          s.createElement("span", null, z.name)
        ),
        open: te,
        onClose: () => V(!1),
        width: 520,
        extra: s.createElement(
          C,
          {
            type: "primary",
            size: "small",
            icon: I ? s.createElement(I) : void 0,
            onClick: () => ue("/skills")
          },
          "管理技能"
        )
      },
      s.createElement(
        N,
        { column: 1, bordered: !0, size: "small" },
        s.createElement(
          N.Item,
          { label: "技能名称" },
          z.name
        ),
        s.createElement(
          N.Item,
          { label: "描述" },
          z.description || "-"
        ),
        z.version_text ? s.createElement(
          N.Item,
          { label: "版本" },
          z.version_text
        ) : null,
        s.createElement(
          N.Item,
          { label: "来源" },
          z.source || "-"
        ),
        s.createElement(
          N.Item,
          { label: "受保护" },
          z.protected ? "是（内置）" : "否"
        ),
        z.sync_status ? s.createElement(
          N.Item,
          { label: "同步状态" },
          z.sync_status
        ) : null,
        z.installed_from ? s.createElement(
          N.Item,
          { label: "安装来源" },
          z.installed_from
        ) : null
      ),
      // Tags
      z.tags && z.tags.length > 0 ? s.createElement(
        "div",
        { style: { marginTop: 16 } },
        s.createElement(
          F,
          {
            strong: !0,
            style: { display: "block", marginBottom: 8 }
          },
          "标签"
        ),
        s.createElement(
          "div",
          { style: { display: "flex", flexWrap: "wrap", gap: 4 } },
          ...z.tags.map(
            (H, x) => s.createElement(R, { key: x, color: "cyan" }, H)
          )
        )
      ) : null,
      // Installed agents
      s.createElement(
        "div",
        { style: { marginTop: 16 } },
        s.createElement(
          F,
          { strong: !0, style: { display: "block", marginBottom: 8 } },
          `已安装此技能的专家 (${le.length})`
        ),
        le.length > 0 ? s.createElement(B, {
          size: "small",
          dataSource: le,
          renderItem: (H) => s.createElement(
            B.Item,
            null,
            s.createElement(
              "div",
              {
                style: {
                  display: "flex",
                  alignItems: "center",
                  gap: 6
                }
              },
              s.createElement(We, { name: H, size: 20 }),
              s.createElement(
                F,
                { style: { fontSize: 13 } },
                H
              )
            )
          )
        }) : s.createElement(
          F,
          { type: "secondary", style: { fontSize: 12 } },
          "暂无专家安装此技能"
        )
      ),
      // Skill content preview (lazy-loaded)
      q ? s.createElement(
        "div",
        { style: { marginTop: 16, textAlign: "center" } },
        s.createElement(f, { size: "small" })
      ) : z.content ? s.createElement(
        "div",
        { style: { marginTop: 16 } },
        s.createElement(
          F,
          {
            strong: !0,
            style: { display: "block", marginBottom: 8 }
          },
          "技能内容"
        ),
        s.createElement(
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
          z.content.slice(0, 2e3) + (z.content.length > 2e3 ? `

... (内容已截断)` : "")
        )
      ) : null
    ) : null
  );
}
function Wl({
  embedded: e = !1
} = {}) {
  const t = _().React, { useState: a, useEffect: n, useCallback: r, useMemo: l } = t, { Tabs: o, message: i } = _().antd, { ThunderboltOutlined: s, AppstoreOutlined: c } = _().antdIcons || {}, u = _().useSelectedAgent, m = u ? u() : null, p = (m == null ? void 0 : m.id) || "default";
  n(() => {
    gn();
  }, [p]);
  const [f, y] = a([]), [h, C] = a([]), [w, S] = a([]), [A, R] = a(!0), [D, G] = a("agent-skills"), [N, B] = a(0), J = r(async () => {
    R(!0);
    try {
      const [T, U, F] = await Promise.all([
        Vt(!0),
        Jt(),
        $r()
      ]);
      C(T), y(U), S(F);
    } catch (T) {
      i.error(T.message || "加载技能列表失败"), C([]);
    } finally {
      R(!1);
    }
  }, []);
  n(() => {
    J();
  }, [J]);
  const Q = l(() => {
    const T = f.find((U) => U.id === p);
    return (T == null ? void 0 : T.name) || p;
  }, [f, p]), O = r(
    (T) => {
      S(
        (U) => U.some((F) => F.agent_id === p) ? U.map((F) => F.agent_id !== p || F.skill_names.includes(T.name) ? F : {
          ...F,
          skill_names: [...F.skill_names, T.name]
        }) : [
          ...U,
          {
            agent_id: p,
            agent_name: Q,
            skill_names: [T.name]
          }
        ]
      ), B((U) => U + 1);
    },
    [p, Q]
  ), b = (T) => {
    window.history.pushState({}, "", T), window.dispatchEvent(new PopStateEvent("popstate"));
  }, v = [
    {
      key: "agent-skills",
      label: t.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        s ? t.createElement(s, { style: { fontSize: 14 } }) : null,
        "当前专家"
      ),
      children: t.createElement(Gl, {
        agentId: p,
        agentName: Q,
        refreshKey: N,
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
      children: t.createElement(Fl, {
        poolSkills: h,
        workspaceSkills: w,
        agents: f,
        loading: A,
        onReload: J,
        onSkillInstalled: O,
        agentId: p,
        agentName: Q
      })
    }
  ], I = t.createElement(o, {
    items: v,
    activeKey: D,
    onChange: (T) => G(T)
  });
  return e ? I : t.createElement(
    "div",
    { style: { padding: 24 } },
    t.createElement(Ht, {
      title: "技能",
      subtitle: `技能池共 ${h.length} 个技能 · 当前智能体：${Q}`
    }),
    I
  );
}
const sn = {
  reservoir_simulation: "油藏数值模拟",
  geological_modeling: "地质建模",
  well_log_analysis: "测井分析",
  production_engineering: "采油工程",
  post_processing: "后处理与可视化",
  multiphysics: "多物理场仿真"
}, Na = {
  reservoir_simulation: "🛢️",
  geological_modeling: "🏔️",
  well_log_analysis: "📡",
  production_engineering: "⚙️",
  post_processing: "📊",
  multiphysics: "🔬"
}, Da = /* @__PURE__ */ new Set(["cmg", "comsol", "tnavigator", "eclipse", "intersect", "visage"]);
function Ga(e) {
  return Ft(`/ugsci/engines/icon/${encodeURIComponent(e)}`);
}
async function Hl() {
  return se("/ugsci/engines/list");
}
async function Jl(e) {
  return se("/ugsci/engines/", {
    method: "POST",
    body: JSON.stringify(e)
  });
}
async function ql(e, t) {
  return se(`/ugsci/engines/${encodeURIComponent(e)}`, {
    method: "PUT",
    body: JSON.stringify(t)
  });
}
async function Vl(e) {
  return se(
    `/ugsci/engines/${encodeURIComponent(e)}`,
    { method: "DELETE" }
  );
}
async function Kl() {
  return se("/ugsci/engines/detect/refresh", {
    method: "POST"
  });
}
function Xl({
  engine: e,
  onClick: t
}) {
  const a = _().React, { Card: n, Tag: r, Typography: l } = _().antd, { Text: o } = l, i = e.status === "detected", s = Na[e.category] || "📦", d = Da.has(e.id) ? a.createElement("img", {
    src: Ga(e.id),
    alt: e.name,
    style: { width: 24, height: 24, objectFit: "contain" }
  }) : a.createElement("span", { style: { fontSize: 20 } }, s);
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
            o,
            { strong: !0, style: { fontSize: 14 } },
            e.name
          ),
          a.createElement("br"),
          a.createElement(
            o,
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
        o,
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
        sn[e.category] || e.category
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
function Ql() {
  const e = _().React, { useState: t, useEffect: a, useCallback: n, useMemo: r } = e, {
    Spin: l,
    Empty: o,
    Button: i,
    message: s,
    Row: c,
    Col: d,
    Drawer: u,
    Descriptions: m,
    Tag: p,
    Typography: f,
    Modal: y,
    Input: h,
    Select: C,
    Popconfirm: w,
    Space: S
  } = _().antd, {
    ReloadOutlined: A,
    SearchOutlined: R,
    PlusOutlined: D,
    EditOutlined: G,
    DeleteOutlined: N,
    CopyOutlined: B,
    ExperimentOutlined: J
  } = _().antdIcons || {}, { Text: Q, Paragraph: O } = f, [b, v] = t([]), [I, T] = t(!0), [U, F] = t(""), [L, $] = t(!1), [E, te] = t(null), [V, z] = t(!1), [X, le] = t(null), [Y, q] = t({}), [de, M] = t(!1), oe = n(async () => {
    T(!0);
    try {
      const ae = await Hl();
      v(ae.engines || []);
    } catch (ae) {
      s.error(ae.message || "加载引擎列表失败"), v([]);
    } finally {
      T(!1);
    }
  }, []);
  a(() => {
    oe();
  }, [oe]);
  const pe = r(() => {
    if (!U.trim()) return b;
    const ae = U.toLowerCase();
    return b.filter(
      (Se) => {
        var he;
        return Se.name.toLowerCase().includes(ae) || Se.vendor.toLowerCase().includes(ae) || Se.category.toLowerCase().includes(ae) || ((he = Se.description) == null ? void 0 : he.toLowerCase().includes(ae));
      }
    );
  }, [b, U]);
  b.filter((ae) => ae.status === "detected").length;
  const ie = n((ae) => {
    navigator.clipboard.writeText(ae).then(() => s.success("路径已复制")).catch(() => s.error("复制失败"));
  }, []), re = n(() => {
    le(null), q({
      name: "",
      vendor: "",
      version: "",
      executable_path: "",
      category: "",
      description: "",
      invocation_hint: ""
    }), z(!0);
  }, []), ye = n((ae) => {
    le(ae), q({ ...ae }), z(!0), $(!1);
  }, []), Ee = n(async () => {
    var ae;
    if (!((ae = Y.name) != null && ae.trim())) {
      s.warning("请输入引擎名称");
      return;
    }
    M(!0);
    try {
      X ? (await ql(X.id, Y), s.success("引擎已更新")) : (await Jl(Y), s.success("引擎已添加")), z(!1), oe();
    } catch (Se) {
      s.error(Se.message || "保存失败");
    } finally {
      M(!1);
    }
  }, [Y, X, oe]), ke = n(
    async (ae) => {
      try {
        await Vl(ae), s.success("引擎已删除"), $(!1), oe();
      } catch (Se) {
        s.error(Se.message || "删除失败");
      }
    },
    [oe]
  ), Pe = n(async () => {
    T(!0);
    try {
      const ae = await Kl();
      v(ae.engines || []), s.success("自动检测完成");
    } catch (ae) {
      s.error(ae.message || "检测失败");
    } finally {
      T(!1);
    }
  }, []), we = n(
    (ae, Se, he) => {
      const Z = Y[Se] || "";
      return e.createElement(
        "div",
        { style: { marginBottom: 12 } },
        e.createElement(
          Q,
          { style: { fontSize: 13, display: "block", marginBottom: 4 } },
          ae
        ),
        he != null && he.select ? e.createElement(C, {
          value: Z || void 0,
          onChange: (me) => q((fe) => ({ ...fe, [Se]: me })),
          style: { width: "100%" },
          options: he.select.options,
          allowClear: !0,
          placeholder: `选择${ae}`
        }) : he != null && he.textarea ? e.createElement(h.TextArea, {
          value: Z,
          onChange: (me) => q((fe) => ({ ...fe, [Se]: me.target.value })),
          rows: 3,
          placeholder: `输入${ae}`
        }) : e.createElement(h, {
          value: Z,
          onChange: (me) => q((fe) => ({ ...fe, [Se]: me.target.value })),
          placeholder: `输入${ae}`
        })
      );
    },
    [Y]
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
        onChange: (ae) => F(ae.target.value),
        allowClear: !0,
        style: { maxWidth: 280 }
      }),
      e.createElement(
        i,
        {
          icon: A ? e.createElement(A) : void 0,
          onClick: Pe,
          loading: I
        },
        "自动检测"
      ),
      e.createElement(
        i,
        {
          type: "primary",
          icon: D ? e.createElement(D) : void 0,
          onClick: re,
          style: Be
        },
        "添加引擎"
      )
    ),
    // Content
    I ? e.createElement(
      "div",
      { style: { textAlign: "center", padding: 60 } },
      e.createElement(l, {
        size: "large",
        tip: "正在加载引擎..."
      })
    ) : pe.length === 0 ? e.createElement(o, {
      description: U ? "无匹配引擎" : "暂无引擎，点击「添加引擎」开始"
    }) : e.createElement(
      c,
      { gutter: [12, 12], align: "stretch" },
      ...pe.map(
        (ae) => e.createElement(
          d,
          {
            key: ae.id,
            xs: 24,
            sm: 12,
            md: 8,
            lg: 6,
            style: { display: "flex" }
          },
          e.createElement(Xl, {
            engine: ae,
            onClick: () => {
              te(ae), $(!0);
            }
          })
        )
      )
    ),
    // Detail drawer
    E ? e.createElement(
      u,
      {
        title: e.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 8 } },
          e.createElement(
            "span",
            { style: { display: "flex", alignItems: "center" } },
            Da.has(E.id) ? e.createElement("img", {
              src: Ga(E.id),
              alt: E.name,
              style: { width: 20, height: 20, objectFit: "contain" }
            }) : e.createElement(
              "span",
              { style: { fontSize: 18 } },
              Na[E.category] || "📦"
            )
          ),
          e.createElement("span", null, E.name)
        ),
        open: L,
        onClose: () => $(!1),
        width: 520,
        extra: e.createElement(
          S,
          null,
          e.createElement(
            i,
            {
              size: "small",
              icon: G ? e.createElement(G) : void 0,
              onClick: () => ye(E)
            },
            "编辑"
          ),
          E.is_default ? null : e.createElement(
            w,
            {
              title: "确认删除此引擎？",
              description: E.name,
              onConfirm: () => ke(E.id),
              okText: "删除",
              cancelText: "取消",
              okButtonProps: { danger: !0 }
            },
            e.createElement(
              i,
              {
                size: "small",
                danger: !0,
                icon: N ? e.createElement(N) : void 0
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
          E.name
        ),
        e.createElement(
          m.Item,
          { label: "厂商" },
          E.vendor || "—"
        ),
        e.createElement(
          m.Item,
          { label: "分类" },
          E.category ? sn[E.category] || E.category : "—"
        ),
        e.createElement(
          m.Item,
          { label: "状态" },
          e.createElement(
            p,
            {
              color: E.status === "detected" ? "success" : E.status === "not_found" ? "error" : "default"
            },
            E.status === "detected" ? "✅ 已检测" : E.status === "not_found" ? "❌ 路径无效" : "🔧 待配置"
          )
        ),
        e.createElement(
          m.Item,
          { label: "版本" },
          E.version || "—"
        ),
        E.executable_path ? e.createElement(
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
              E.executable_path
            ),
            e.createElement(
              i,
              {
                size: "small",
                type: "text",
                icon: B ? e.createElement(B) : void 0,
                onClick: () => ie(E.executable_path)
              }
            )
          )
        ) : null,
        E.install_dir ? e.createElement(
          m.Item,
          { label: "安装目录" },
          e.createElement(
            "code",
            { style: { fontSize: 12, wordBreak: "break-all" } },
            E.install_dir
          )
        ) : null,
        // Display detected modules with paths
        E.modules && E.modules.length > 0 ? e.createElement(
          m.Item,
          { label: "已检测模块" },
          e.createElement(
            "div",
            { style: { display: "flex", flexDirection: "column", gap: 4 } },
            ...E.modules.map(
              (ae) => e.createElement(
                "div",
                {
                  key: ae,
                  style: { display: "flex", alignItems: "center", gap: 8 }
                },
                e.createElement(
                  p,
                  { color: "cyan", style: { fontSize: 11 } },
                  ae
                ),
                E.module_paths && E.module_paths[ae] ? e.createElement(
                  "code",
                  { style: { fontSize: 11, wordBreak: "break-all" } },
                  E.module_paths[ae]
                ) : null
              )
            )
          )
        ) : null,
        E.license_server ? e.createElement(
          m.Item,
          { label: "许可证服务器" },
          E.license_server
        ) : null,
        e.createElement(
          m.Item,
          { label: "描述" },
          E.description || "—"
        )
      ),
      // Invocation hint
      E.invocation_hint ? e.createElement(
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
          Q,
          { strong: !0, style: { fontSize: 13 } },
          "💡 调用方式"
        ),
        e.createElement(
          "div",
          { style: { marginTop: 8, fontSize: 13, lineHeight: 1.6 } },
          E.invocation_hint
        )
      ) : null,
      // Type badge
      e.createElement(
        "div",
        { style: { marginTop: 12 } },
        E.is_default ? e.createElement(
          p,
          { color: "blue" },
          "默认引擎"
        ) : E.is_custom ? e.createElement(
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
        title: X ? "编辑引擎" : "添加引擎",
        open: V,
        onOk: Ee,
        onCancel: () => z(!1),
        okText: X ? "保存" : "添加",
        cancelText: "取消",
        confirmLoading: de,
        width: 560
      },
      e.createElement(
        "div",
        { style: { maxHeight: 480, overflow: "auto", paddingRight: 8 } },
        we("引擎名称 *", "name"),
        we("厂商", "vendor"),
        we("版本", "version"),
        we("可执行文件路径", "executable_path"),
        we("安装目录", "install_dir"),
        we("分类", "category", {
          select: {
            options: Object.entries(sn).map(([ae, Se]) => ({
              label: Se,
              value: ae
            }))
          }
        }),
        we("描述", "description", { textarea: !0 }),
        we("调用方式提示", "invocation_hint", { textarea: !0 }),
        we("许可证服务器", "license_server")
      )
    )
  );
}
async function Yl(e = !1) {
  const t = await se(
    "/ugsci/domain-engines/list",
    e ? { bypassCache: !0 } : void 0
  );
  return (t == null ? void 0 : t.engines) || [];
}
async function Zl(e, t = !1) {
  const a = await se("/tools", {
    headers: { "X-Agent-Id": e },
    ...t ? { bypassCache: !0 } : {}
  }) || [];
  return new Map(a.map((n) => [n.name, n]));
}
async function eo(e, t = !1) {
  const a = /* @__PURE__ */ new Map(), n = {
    headers: { "X-Agent-Id": e },
    ...t ? { bypassCache: !0 } : {}
  };
  let r;
  try {
    r = await se(
      "/mcp",
      n
    ) || [];
  } catch {
    return a;
  }
  for (const l of r) {
    const o = l.key;
    if (!l.enabled) {
      a.set(o, { key: o, enabled: !1, toolCount: 0, error: null });
      continue;
    }
    try {
      const i = await se(
        `/mcp/tools/${encodeURIComponent(o)}`,
        n
      ) || [];
      a.set(o, {
        key: o,
        enabled: !0,
        toolCount: i.filter((s) => s.enabled).length,
        error: null
      });
    } catch (i) {
      a.set(o, {
        key: o,
        enabled: !0,
        toolCount: 0,
        error: i instanceof Error ? i.message : "Tool query failed"
      });
    }
  }
  return a;
}
function oa(e) {
  return e ? e.overall === "available" ? "available" : e.overall === "unavailable" ? "unavailable" : "unknown" : "unknown";
}
function to(e) {
  return e ? e.enabled ? e.error ? "error" : e.toolCount > 0 ? "available" : "error" : "unconfigured" : "unavailable";
}
function no(e, t = null, a = /* @__PURE__ */ new Map()) {
  const n = e.engine, r = e.dependency_status;
  let l, o, i;
  if (n.source === "builtin") {
    const s = oa(r), c = n.operations.flatMap((m) => m.tool_names), d = c.filter((m) => a.has(m)), u = d.filter(
      (m) => {
        var p;
        return (p = a.get(m)) == null ? void 0 : p.enabled;
      }
    );
    s !== "available" ? l = s : d.length !== c.length ? l = "error" : u.length === 0 ? l = "unconfigured" : l = "available", o = u.length, i = null;
  } else n.source === "mcp" ? (l = to(t), o = (t == null ? void 0 : t.toolCount) ?? 0, i = (t == null ? void 0 : t.key) ?? n.provider.id) : (l = oa(r), o = 0, i = null);
  return {
    definition: n,
    dependencyStatus: r,
    checkedAt: e.checked_at,
    effectiveStatus: l,
    discoveredToolCount: o,
    mcpProviderKey: i
  };
}
function ao(e) {
  const t = /* @__PURE__ */ new Map();
  for (const a of e) {
    const n = a.definition.domain;
    t.has(n) || t.set(n, []), t.get(n).push(a);
  }
  return t;
}
const cn = {
  available: "可用",
  unavailable: "不可用",
  unknown: "未知",
  unconfigured: "未配置",
  error: "错误"
}, dn = {
  available: "success",
  unavailable: "error",
  unknown: "default",
  unconfigured: "warning",
  error: "error"
}, ro = {
  geology_well_logging: "📡",
  production_engineering: "⚙️",
  fluid_thermodynamics: "🧪",
  scientific_computing: "🧮",
  data_modeling: "📊"
}, lo = {
  builtin: "内置",
  mcp: "MCP",
  library: "计算库"
};
function oo({
  view: e,
  onClick: t
}) {
  const a = _().React, { Card: n, Tag: r, Typography: l } = _().antd, { Text: o } = l, i = e.definition, s = ro[i.domain] || "📦", c = e.effectiveStatus, d = i.operations.length, u = e.discoveredToolCount;
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
        a.createElement("span", { style: { fontSize: 20 } }, s),
        a.createElement(
          "div",
          null,
          a.createElement(
            o,
            { strong: !0, style: { fontSize: 14 } },
            i.name
          ),
          a.createElement("br"),
          a.createElement(
            o,
            { type: "secondary", style: { fontSize: 11 } },
            lo[i.source] || i.source
          )
        )
      ),
      a.createElement(
        r,
        { color: dn[c] || "default", style: { fontSize: 11 } },
        cn[c] || c
      )
    ),
    a.createElement(
      "div",
      { style: { flex: 1, minHeight: 32 } },
      a.createElement(
        o,
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
function so({
  view: e,
  open: t,
  onClose: a,
  onNavigateToMcp: n,
  onNavigateToTools: r,
  onNavigateToSkills: l
}) {
  const o = _().React, { Drawer: i, Descriptions: s, Tag: c, Typography: d, Button: u, Space: m, Divider: p } = _().antd, { Text: f, Paragraph: y } = d;
  if (!e) return null;
  const h = e.definition, C = e.dependencyStatus;
  return o.createElement(
    i,
    {
      title: o.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 8 } },
        o.createElement("span", null, h.name),
        o.createElement(
          c,
          {
            color: dn[e.effectiveStatus] || "default",
            style: { fontSize: 11 }
          },
          cn[e.effectiveStatus] || e.effectiveStatus
        )
      ),
      open: t,
      onClose: a,
      width: 560
    },
    // Overview
    o.createElement(
      s,
      { column: 1, bordered: !0, size: "small" },
      o.createElement(
        s.Item,
        { label: "领域" },
        h.domain
      ),
      o.createElement(
        s.Item,
        { label: "来源" },
        h.source === "builtin" ? "内置工具" : h.source === "mcp" ? "MCP 服务" : "科学计算库 / 技能"
      ),
      o.createElement(
        s.Item,
        { label: "实现" },
        `${h.provider.kind}:${h.provider.id}`
      ),
      o.createElement(
        s.Item,
        { label: "描述" },
        h.description
      ),
      o.createElement(
        s.Item,
        { label: "检测时间" },
        e.checkedAt
      )
    ),
    // Operations
    o.createElement(
      "div",
      { style: { marginTop: 16, marginBottom: 8 } },
      o.createElement(f, { strong: !0 }, "领域操作")
    ),
    ...h.operations.map(
      (w) => o.createElement(
        "div",
        {
          key: w.id,
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
          o.createElement(f, { strong: !0, style: { fontSize: 13 } }, w.name),
          o.createElement(
            f,
            { type: "secondary", style: { fontSize: 11, marginLeft: 8 } },
            w.id
          )
        ),
        o.createElement(
          f,
          { type: "secondary", style: { fontSize: 12 } },
          w.description
        ),
        w.tool_names.length > 0 ? o.createElement(
          "div",
          { style: { marginTop: 4, display: "flex", gap: 4, flexWrap: "wrap" } },
          ...w.tool_names.map(
            (S) => o.createElement(
              c,
              { key: S, color: "blue", style: { fontSize: 10 } },
              S
            )
          )
        ) : null
      )
    ),
    // Dependencies
    o.createElement(p, null),
    o.createElement(f, { strong: !0 }, "实现与依赖"),
    C && C.dependencies.length > 0 ? o.createElement(
      "div",
      { style: { marginTop: 8 } },
      ...C.dependencies.map(
        (w) => o.createElement(
          "div",
          {
            key: w.name,
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
            o.createElement(f, { style: { fontSize: 13 } }, w.name),
            o.createElement(
              c,
              {
                color: dn[w.status] || "default",
                style: { fontSize: 11 }
              },
              cn[w.status] || w.status
            )
          ),
          w.status !== "available" && w.reason ? o.createElement(
            f,
            { type: "secondary", style: { display: "block", fontSize: 12, marginTop: 4 } },
            w.reason
          ) : null,
          w.status !== "available" && w.install_hint ? o.createElement(
            f,
            { style: { display: "block", fontSize: 12, marginTop: 4 } },
            `安装：${w.install_hint}`
          ) : null,
          w.status !== "available" && w.enable_hint ? o.createElement(
            f,
            { style: { display: "block", fontSize: 12, marginTop: 2 } },
            `启用：${w.enable_hint}`
          ) : null
        )
      )
    ) : o.createElement(
      y,
      { type: "secondary", style: { fontSize: 12 } },
      "无外部依赖"
    ),
    // Actions
    o.createElement(p, null),
    o.createElement(f, { strong: !0 }, "问题处理"),
    o.createElement(
      "div",
      { style: { marginTop: 8, display: "flex", gap: 8, flexWrap: "wrap" } },
      h.source === "mcp" ? o.createElement(
        u,
        { size: "small", onClick: n },
        "配置 MCP 服务"
      ) : h.source === "library" ? o.createElement(
        u,
        { size: "small", onClick: l },
        "查看相关技能"
      ) : o.createElement(
        u,
        { size: "small", onClick: () => r("builtin") },
        "查看内置工具"
      )
    )
  );
}
const io = {
  geology_well_logging: "测井地质",
  production_engineering: "采油工程",
  fluid_thermodynamics: "流体热力学",
  scientific_computing: "科学计算",
  data_modeling: "数据建模"
};
function co({
  onNavigateToMcp: e,
  onNavigateToTools: t,
  onNavigateToSkills: a
} = {}) {
  var le, Y;
  const n = _().React, { useState: r, useEffect: l, useCallback: o, useMemo: i, useRef: s } = n, {
    Spin: c,
    Empty: d,
    Button: u,
    message: m,
    Row: p,
    Col: f,
    Input: y,
    Drawer: h,
    Typography: C
  } = _().antd, { ReloadOutlined: w, SearchOutlined: S } = _().antdIcons || {}, { Text: A } = C, R = (Y = (le = _()).useSelectedAgent) == null ? void 0 : Y.call(le), D = (R == null ? void 0 : R.id) || "default", [G, N] = r([]), [B, J] = r(!0), [Q, O] = r(""), [b, v] = r(!1), [I, T] = r(null), U = s(D);
  U.current = D;
  const F = o(
    async (q = !1) => {
      J(!0);
      const de = U.current;
      try {
        const [M, oe, pe] = await Promise.all([
          Yl(q),
          eo(de, q),
          Zl(de, q)
        ]);
        if (de !== U.current) return;
        const ie = [];
        for (const re of M)
          try {
            let ye = null;
            if (re.engine.source === "mcp") {
              const Ee = re.engine.provider.id;
              ye = oe.get(Ee) || null;
            }
            ie.push(no(re, ye, pe));
          } catch {
          }
        N(ie);
      } catch (M) {
        const oe = M instanceof Error ? M.message : "加载领域引擎失败";
        m.error(oe), N([]);
      } finally {
        J(!1);
      }
    },
    []
  );
  l(() => {
    F();
  }, [D, F]);
  const L = i(() => {
    if (!Q.trim()) return G;
    const q = Q.toLowerCase();
    return G.filter(
      (de) => de.definition.name.toLowerCase().includes(q) || de.definition.domain.toLowerCase().includes(q) || de.definition.description.toLowerCase().includes(q) || de.definition.tags.some((M) => M.toLowerCase().includes(q))
    );
  }, [G, Q]), $ = i(
    () => ao(L),
    [L]
  ), E = o(() => {
    F(!0);
  }, [F]), te = o((q) => {
    T(q), v(!0);
  }, []), V = o(() => {
    v(!1), e == null || e();
  }, [e]), z = o(
    (q) => {
      v(!1), t == null || t(q);
    },
    [t]
  ), X = o(() => {
    v(!1), a == null || a();
  }, [a]);
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
        value: Q,
        onChange: (q) => O(q.target.value),
        allowClear: !0,
        style: { maxWidth: 280 }
      }),
      n.createElement(
        u,
        {
          icon: w ? n.createElement(w) : void 0,
          onClick: E,
          loading: B
        },
        "刷新"
      )
    ),
    // Content
    B ? n.createElement(
      "div",
      { style: { textAlign: "center", padding: 60 } },
      n.createElement(c, {
        size: "large",
        tip: "正在加载领域引擎..."
      })
    ) : L.length === 0 ? n.createElement(d, {
      description: Q ? "无匹配引擎" : "暂无领域引擎"
    }) : n.createElement(
      "div",
      null,
      ...Array.from($.entries()).map(
        ([q, de]) => n.createElement(
          "div",
          { key: q, style: { marginBottom: 20 } },
          n.createElement(
            A,
            {
              strong: !0,
              style: {
                fontSize: 14,
                display: "block",
                marginBottom: 8
              }
            },
            io[q] || q
          ),
          n.createElement(
            p,
            { gutter: [12, 12], align: "stretch" },
            ...de.map(
              (M) => n.createElement(
                f,
                {
                  key: M.definition.id,
                  xs: 24,
                  sm: 12,
                  md: 8,
                  lg: 6,
                  style: { display: "flex" }
                },
                n.createElement(oo, {
                  view: M,
                  onClick: () => te(M)
                })
              )
            )
          )
        )
      )
    ),
    // Detail drawer
    n.createElement(so, {
      view: I,
      open: b,
      onClose: () => v(!1),
      onNavigateToMcp: V,
      onNavigateToTools: z,
      onNavigateToSkills: X
    })
  );
}
const mo = Wl, Fa = /* @__PURE__ */ new Set(["tools", "engines", "skills"]);
function uo(e) {
  try {
    const t = new URLSearchParams(window.location.search).get("tab");
    return t && Fa.has(t) ? t : e;
  } catch {
    return e;
  }
}
function sa(e) {
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
function mn({ page: e }) {
  const t = _().React, { useEffect: a, useState: n } = t, { Alert: r, Spin: l } = _().antd, [o, i] = n(null), [s, c] = n("");
  if (a(() => {
    let u = !0;
    const m = _().loadBuiltinPage;
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
  }, [e]), s)
    return t.createElement(r, {
      type: "error",
      showIcon: !0,
      message: "原生管理功能加载失败",
      description: s
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
function po({
  activeSubTab: e,
  onSubTabChange: t
}) {
  const a = _().React, { Tabs: n } = _().antd;
  return a.createElement(n, {
    activeKey: e,
    onChange: t,
    items: [
      {
        key: "mcp",
        label: "MCP 接入",
        children: a.createElement(mn, { page: "mcp" })
      },
      {
        key: "builtin",
        label: "平台内置",
        children: a.createElement(mn, { page: "tools" })
      }
    ]
  });
}
function go({
  onNavigateToMcp: e,
  onNavigateToTools: t,
  onNavigateToSkills: a
} = {}) {
  const n = _().React, { Tabs: r } = _().antd;
  return n.createElement(r, {
    defaultActiveKey: "simulation",
    items: [
      {
        key: "simulation",
        label: "仿真软件",
        children: n.createElement(Ql)
      },
      {
        key: "domain",
        label: "领域计算",
        children: n.createElement(
          co,
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
        children: n.createElement(mn, { page: "acp" })
      }
    ]
  });
}
function Wa({
  initialTab: e = "engines"
} = {}) {
  var C, w;
  const t = _().React, { useEffect: a, useState: n } = t, { Tabs: r, Tag: l } = _().antd, { RocketOutlined: o, ToolOutlined: i, ThunderboltOutlined: s } = _().antdIcons || {}, c = (w = (C = _()).useSelectedAgent) == null ? void 0 : w.call(C), d = (c == null ? void 0 : c.id) || "default", [u, m] = n(
    () => uo(e)
  ), [p, f] = n("mcp");
  a(() => {
    try {
      const S = new URLSearchParams(window.location.search).get("tab");
      S && !Fa.has(S) && sa(u);
    } catch {
    }
  }, [u]);
  const y = (S) => {
    m(S), sa(S);
  }, h = (S, A) => t.createElement(
    "span",
    { style: { display: "inline-flex", alignItems: "center", gap: 6 } },
    A ? t.createElement(A, { style: { fontSize: 14 } }) : null,
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
          label: h("引擎", o),
          children: t.createElement(
            go,
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
          children: t.createElement(po, {
            activeSubTab: p,
            onSubTabChange: f
          })
        },
        {
          key: "skills",
          label: h("技能", s),
          children: t.createElement(mo, {
            embedded: !0
          })
        }
      ]
    })
  );
}
const Ha = Wa;
function fo() {
  return _().React.createElement(Ha, {
    initialTab: "tools"
  });
}
function yo() {
  return _().React.createElement(Ha, {
    initialTab: "skills"
  });
}
const ia = {
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
function ho(e) {
  if (!e.env) return !1;
  const t = Object.entries(e.env);
  return t.length === 0 ? !1 : t.some(([, a]) => typeof a == "string" && a.length > 0);
}
const Rt = "ugsci.market.githubSources", ca = "https://github.com/anthropics/skills/tree/main/skills", Ja = "https://ugsci-awesome-tools.oss-cn-beijing.aliyuncs.com", Eo = `${Ja}/skills`;
function vo(e) {
  const t = e.replace(/^\/+/, "");
  return Ft(`/plugins/oss-proxy?path=${encodeURIComponent(t)}`);
}
function Ut(e) {
  const t = e.replace(/^\/+/, "");
  return Ve(`/plugins/oss-proxy?path=${encodeURIComponent(t)}`);
}
async function Sn(e) {
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
function bo(e) {
  var r, l;
  const t = {};
  if (e.env && e.env.length > 0)
    for (const o of e.env)
      t[o] = `your-${o.toLowerCase().replace(/_/g, "-")}`;
  let a = "🔌";
  const n = (e.icon || "").toLowerCase();
  return n.includes("folder") ? a = "📁" : n.includes("git") ? a = "🌿" : n.includes("github") ? a = "🐙" : n.includes("database") || n.includes("postgres") || n.includes("sqlite") ? a = "🗄️" : n.includes("search") || n.includes("brave") ? a = "🔍" : n.includes("browser") || n.includes("puppeteer") ? a = "🎭" : n.includes("memory") || n.includes("brain") ? a = "🧠" : n.includes("file") || n.includes("fetch") ? a = "🌐" : n.includes("slack") ? a = "💬" : n.includes("google") ? a = "📁" : n.includes("notion") ? a = "📝" : n.includes("jupyter") ? a = "📊" : n.includes("science") || n.includes("flask") ? a = "🔬" : n.includes("book") || n.includes("arxiv") ? a = "📚" : n.includes("patent") && (a = "📜"), {
    id: e.id,
    name: e.name,
    emoji: a,
    iconUrl: e.icon_url ? vo(e.icon_url) : void 0,
    category: e.category ? ct(e.category) : "",
    description: e.description,
    transport: e.transport || "stdio",
    command: ((r = e.config) == null ? void 0 : r.command) || "",
    args: ((l = e.config) == null ? void 0 : l.args) || [],
    env: Object.keys(t).length > 0 ? t : void 0
  };
}
const qa = "ugsci.market.mcpSources", Va = "ugsci.market.expertSources";
function Ka(e, t) {
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
function Xa(e, t) {
  try {
    localStorage.setItem(e, JSON.stringify(t));
  } catch {
  }
}
function wo() {
  return Ka(qa, "mcp");
}
function At(e) {
  Xa(qa, e);
}
function So() {
  return Ka(Va, "expert");
}
function $t(e) {
  Xa(Va, e);
}
function Qa(e) {
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
    const l = decodeURIComponent(r[0]), o = decodeURIComponent(r[1]);
    let i = "main", s = "";
    return r.length >= 4 && (r[2] === "tree" || r[2] === "blob") ? (i = decodeURIComponent(r[3]), r.length > 4 && (s = r.slice(4).map(decodeURIComponent).join("/"))) : r.length > 2 && (s = r.slice(2).map(decodeURIComponent).join("/")), s = s.replace(/\/+$/, "").replace(/^\/+/, ""), {
      owner: l,
      repo: o,
      ref: i || "main",
      skillsPath: s,
      label: `${l}/${o}`,
      platform: n
    };
  } catch {
    return null;
  }
}
function Ya(e, t, a, n = "github") {
  return n === "oss" ? `oss:${e}/${a || "/"}` : `${n}:${e}/${t}:${a || "/"}`;
}
function xo(e) {
  try {
    const t = new URL(e.trim()), a = t.hostname.toLowerCase(), n = a.match(
      /^([a-z0-9][a-z0-9-]{1,61}[a-z0-9])\.oss-([a-z0-9-]+)\.aliyuncs\.com$/
    );
    if (!n) return null;
    const r = n[1], l = `${t.protocol}//${a}`, o = decodeURIComponent(t.pathname).replace(/^\/+/, "").replace(/\/+$/, "");
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
function ko() {
  try {
    const e = localStorage.getItem(Rt);
    if (!e) {
      const n = [], r = Qa(ca);
      return r && n.push({
        id: Ya(
          r.owner,
          r.repo,
          r.skillsPath,
          r.platform
        ),
        url: ca,
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
      (n) => n && typeof n.id == "string" && (typeof n.owner == "string" || n.platform === "oss") && !(n.platform === "oss" && n.url === Eo)
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
function Co(e) {
  const t = e.match(/^---\s*\n([\s\S]*?)\n---/);
  if (!t) return {};
  const a = t[1], n = {}, r = a.split(`
`);
  let l = "";
  for (const o of r) {
    const i = o.match(/^(\w[\w-]*)\s*:\s*(.*)$/);
    if (i) {
      l = i[1];
      let s = i[2].trim();
      (s.startsWith('"') && s.endsWith('"') || s.startsWith("'") && s.endsWith("'")) && (s = s.slice(1, -1)), l === "name" ? n.name = s : l === "description" ? n.description = s : l === "version" ? n.version = s : l === "author" && (n.author = s);
    }
  }
  return n;
}
async function To(e) {
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
  const o = await l.json();
  if (!Array.isArray(o)) return [];
  const i = o.filter(
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
        const h = await y.text(), C = Co(h);
        return {
          ...p,
          name: C.name || c.name,
          description: C.description || "",
          version: C.version || null,
          author: C.author || null
        };
      } catch {
        return p;
      }
    })
  );
}
async function _o(e) {
  const t = xo(e.url);
  if (!t)
    throw new Error(`Invalid OSS URL: ${e.url}`);
  const { endpoint: a, prefix: n } = t, r = n.split("/").map(encodeURIComponent).join("/"), l = await Ut(
    `${r}/manifest.json`
  );
  if (!l.ok)
    throw new Error(
      `无法获取技能列表: manifest.json (${l.status})`
    );
  const o = await l.json(), i = [];
  if (o && o.tag_groups && typeof o.tag_groups == "object")
    for (const [d, u] of Object.entries(o.tag_groups))
      Array.isArray(u) && i.push({
        id: d,
        label: ct(d),
        tags: u
      });
  const s = [];
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
        const w = m.metadata.match(/version:\s*"?([\d.]+)"?/);
        w && (h = w[1]);
      }
      const C = u ? `${e.label}/${u}` : e.label;
      s.push({
        sourceId: e.id,
        sourceLabel: e.label,
        sourcePath: C,
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
  if (Array.isArray(o) ? c(
    o.map(
      (d) => typeof d == "string" ? { name: d, path: d } : d
    )
  ) : o && Array.isArray(o.skills) && c(o.skills), s.length === 0)
    throw new Error(
      `manifest.json 中未找到技能。请检查 ${e.url}/manifest.json`
    );
  return { skills: s, categories: i };
}
async function Io() {
  const e = await Sn("mcp/manifest.json"), t = [], a = {};
  if (e.tag_groups && typeof e.tag_groups == "object")
    for (const [r, l] of Object.entries(e.tag_groups))
      Array.isArray(l) && (a[r] = l, t.push({
        id: r,
        label: ct(r),
        tags: l
      }));
  return { servers: (e.servers || []).map((r) => {
    let l = "";
    const o = r.tags || [];
    for (const [i, s] of Object.entries(a))
      if (s.some((c) => o.includes(c))) {
        l = i;
        break;
      }
    return {
      id: r.id || r.name,
      name: r.name || r.id,
      description: r.description || "",
      tags: o,
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
async function zo() {
  const e = await Sn("skills/manifest.json"), t = [], a = /* @__PURE__ */ new Set();
  function n(r, l) {
    for (const o of r) {
      if ((o == null ? void 0 : o.type) === "collection" && Array.isArray(o.children)) {
        n(o.children, o.name || l);
        continue;
      }
      const i = String((o == null ? void 0 : o.path) || (o == null ? void 0 : o.name) || "").trim();
      if (!i) continue;
      const s = i.split("/").map(encodeURIComponent).join("/"), c = `${Ja}/skills/${s}`, d = typeof o.tag == "string" && o.tag.trim() ? o.tag.trim() : void 0;
      d && a.add(d);
      let u = null;
      if (typeof o.metadata == "string") {
        const m = o.metadata.match(/version:\s*"?([\d.]+)"?/);
        m && (u = m[1]);
      }
      t.push({
        sourceId: "oss:ugsci-official",
        sourceLabel: "UGSci",
        sourcePath: l ? `UGSci/${l}` : "UGSci",
        name: o.name || i.split("/").pop() || i,
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
async function Ao() {
  const e = await Sn("agents/manifest.json"), t = [], a = {};
  if (e.tag_groups && typeof e.tag_groups == "object")
    for (const [r, l] of Object.entries(e.tag_groups))
      Array.isArray(l) && (a[r] = l, t.push({
        id: r,
        label: ct(r),
        tags: l
      }));
  return { agents: (e.agents || []).map((r) => {
    let l = "";
    const o = r.tags || [];
    for (const [i, s] of Object.entries(a))
      if (s.some((c) => o.includes(c))) {
        l = i;
        break;
      }
    return {
      id: r.id || r.name,
      name: r.name || r.id,
      description: r.description || "",
      path: r.path || "",
      tags: o,
      config: r.config,
      instructions: r.instructions,
      skills_manifest: r.skills_manifest,
      drivers: r.drivers,
      category: l
    };
  }), categories: t };
}
async function $o(e) {
  const t = e.filter((o) => o.enabled), a = await Promise.all(
    t.map(async (o) => {
      try {
        if (o.platform === "oss") {
          const { skills: i, categories: s } = await _o(o);
          return { skills: i, categories: s, error: null, label: o.label };
        } else
          return { skills: await To(o), categories: [], error: null, label: o.label };
      } catch (i) {
        return {
          skills: [],
          categories: [],
          error: i.message || String(i),
          label: o.label
        };
      }
    })
  ), n = [], r = [], l = [];
  for (const o of a)
    n.push(...o.skills), r.push(...o.categories), o.error && l.push({ label: o.label, message: o.error });
  return { skills: n, errors: l, categories: r };
}
function Po({
  open: e,
  onClose: t,
  sources: a,
  onChange: n
}) {
  const r = _().React, { useState: l } = r, {
    Modal: o,
    Input: i,
    Button: s,
    List: c,
    Tag: d,
    Switch: u,
    Typography: m,
    Tooltip: p,
    message: f
  } = _().antd, {
    PlusOutlined: y,
    DeleteOutlined: h,
    LinkOutlined: C,
    GithubOutlined: w
  } = _().antdIcons || {}, { Text: S } = m, [A, R] = l(""), [D, G] = l(""), N = () => {
    const O = A.trim();
    if (!O) return;
    const b = Qa(O);
    if (!b) {
      f.error("无效的仓库 URL，请输入类似 https://github.com/owner/repo/tree/main/skills 或 https://gitee.com/owner/repo/tree/master/skills 的链接");
      return;
    }
    const v = Ya(b.owner, b.repo, b.skillsPath, b.platform);
    if (a.some((U) => U.id === v)) {
      f.warning("该源已存在");
      return;
    }
    const I = {
      id: v,
      url: O,
      label: b.label,
      owner: b.owner,
      repo: b.repo,
      ref: b.ref,
      skillsPath: b.skillsPath,
      enabled: !0,
      platform: b.platform,
      accessToken: D.trim() || void 0
    }, T = [...a, I];
    Pt(T), n(T), R(""), G(""), f.success(`已添加源: ${b.label}`);
  }, B = (O, b) => {
    const v = a.map(
      (I) => I.id === O ? { ...I, enabled: b } : I
    );
    Pt(v), n(v);
  }, J = (O, b) => {
    const v = a.map(
      (I) => I.id === O ? { ...I, accessToken: b.trim() || void 0 } : I
    );
    Pt(v), n(v);
  }, Q = (O) => {
    const b = a.filter((v) => v.id !== O);
    Pt(b), n(b), f.success("已移除源");
  };
  return r.createElement(
    o,
    {
      open: e,
      onCancel: t,
      title: r.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 8 } },
        w ? r.createElement(w, { style: { fontSize: 18 } }) : null,
        r.createElement("span", null, "配置技能源")
      ),
      footer: r.createElement(
        s,
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
          value: A,
          onChange: (O) => R(O.target.value),
          onPressEnter: N,
          prefix: C ? r.createElement(C) : void 0,
          style: { flex: 1 }
        }),
        r.createElement(
          s,
          {
            type: "primary",
            icon: y ? r.createElement(y) : void 0,
            onClick: N
          },
          "添加"
        )
      ),
      // Gitee token input (shown when URL looks like a Gitee link)
      A.trim() && A.trim().toLowerCase().includes("gitee.com") ? r.createElement(
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
          onChange: (O) => G(O.target.value),
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
      renderItem: (O) => r.createElement(
        c.Item,
        {
          actions: [
            r.createElement(
              p,
              { title: O.enabled ? "点击禁用" : "点击启用" },
              r.createElement(u, {
                size: "small",
                checked: O.enabled,
                onChange: (b) => B(O.id, b)
              })
            ),
            r.createElement(
              p,
              { title: "移除此源" },
              r.createElement(
                s,
                {
                  size: "small",
                  type: "text",
                  danger: !0,
                  icon: h ? r.createElement(h) : void 0,
                  onClick: () => Q(O.id)
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
              { color: O.platform === "gitee" ? "orange" : O.platform === "oss" ? "green" : "blue", style: { fontSize: 11 } },
              O.platform === "gitee" ? "Gitee" : O.platform === "oss" ? "OSS" : "GitHub"
            ),
            r.createElement(
              d,
              { style: { fontSize: 11 } },
              O.label
            ),
            O.skillsPath ? r.createElement(
              S,
              { type: "secondary", style: { fontSize: 11 } },
              `/${O.skillsPath}`
            ) : null,
            O.platform !== "oss" ? r.createElement(
              S,
              { type: "secondary", style: { fontSize: 11 } },
              `@${O.ref}`
            ) : null
          ),
          r.createElement(
            S,
            {
              type: "secondary",
              style: { fontSize: 11, wordBreak: "break-all" }
            },
            O.url
          ),
          // Gitee token input for existing Gitee sources
          O.platform === "gitee" ? r.createElement(
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
              value: O.accessToken || "",
              onChange: (b) => J(O.id, b.target.value),
              style: { flex: 1 }
            })
          ) : null
        )
      )
    })
  );
}
function da({
  open: e,
  onClose: t,
  sources: a,
  onChange: n,
  type: r
}) {
  const l = _().React, { useState: o } = l, {
    Modal: i,
    Input: s,
    Button: c,
    List: d,
    Tag: u,
    Switch: m,
    Typography: p,
    Tooltip: f,
    message: y
  } = _().antd, {
    PlusOutlined: h,
    DeleteOutlined: C,
    LinkOutlined: w,
    ApiOutlined: S,
    UserOutlined: A,
    ImportOutlined: R,
    ExportOutlined: D,
    CopyOutlined: G
  } = _().antdIcons || {}, { Text: N } = p, [B, J] = o(""), [Q, O] = o(""), [b, v] = o(""), [I, T] = o(!1), U = r === "mcp" ? "MCP" : "专家模板", F = r === "mcp" ? S ? l.createElement(S, { style: { fontSize: 18 } }) : null : A ? l.createElement(A, { style: { fontSize: 18 } }) : null, L = () => {
    const z = B.trim(), X = Q.trim();
    if (!z) return;
    const le = X || z.slice(0, 40), Y = `${r}:${z}`;
    if (a.some((M) => M.id === Y)) {
      y.warning("该源已存在");
      return;
    }
    const q = {
      id: Y,
      label: le,
      url: z,
      enabled: !0,
      type: r
    }, de = [...a, q];
    r === "mcp" ? At(de) : $t(de), n(de), J(""), O(""), y.success(`已添加${U}源: ${le}`);
  }, $ = (z, X) => {
    const le = a.map(
      (Y) => Y.id === z ? { ...Y, enabled: X } : Y
    );
    r === "mcp" ? At(le) : $t(le), n(le);
  }, E = (z) => {
    const X = a.filter((le) => le.id !== z);
    r === "mcp" ? At(X) : $t(X), n(X), y.success("已移除源");
  }, te = () => {
    const z = JSON.stringify(
      { type: r, sources: a },
      null,
      2
    );
    try {
      navigator.clipboard.writeText(z), y.success(`${U}源已复制到剪贴板（${a.length} 个源）`);
    } catch {
      const X = document.createElement("textarea");
      X.value = z, document.body.appendChild(X), X.select(), document.execCommand("copy"), document.body.removeChild(X), y.success(`${U}源已复制到剪贴板（${a.length} 个源）`);
    }
  }, V = () => {
    const z = b.trim();
    if (!z) {
      y.warning("请粘贴 JSON 内容");
      return;
    }
    try {
      const X = JSON.parse(z);
      let le = [];
      if (Array.isArray(X))
        le = X;
      else if (X && Array.isArray(X.sources))
        le = X.sources;
      else if (X && typeof X == "object")
        le = [X];
      else
        throw new Error("Invalid format");
      const Y = le.filter(
        (oe) => oe && typeof oe.url == "string" && typeof oe.label == "string"
      );
      if (Y.length === 0) {
        y.error("未找到有效的源数据");
        return;
      }
      const q = new Set(a.map((oe) => oe.id)), de = [];
      for (const oe of Y) {
        const pe = oe.id || `${r}:${oe.url}`;
        q.has(pe) || de.push({
          id: pe,
          label: oe.label,
          url: oe.url,
          enabled: oe.enabled !== !1,
          type: r
        });
      }
      if (de.length === 0) {
        y.info("所有源均已存在，无新增");
        return;
      }
      const M = [...a, ...de];
      r === "mcp" ? At(M) : $t(M), n(M), v(""), T(!1), y.success(`成功导入 ${de.length} 个${U}源`);
    } catch (X) {
      y.error(`JSON 解析失败: ${X.message || "格式错误"}`);
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
        F,
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
              onClick: te,
              disabled: a.length === 0,
              size: "small"
            },
            "导出到剪贴板"
          ),
          l.createElement(
            c,
            {
              icon: R ? l.createElement(R) : void 0,
              onClick: () => T(!I),
              size: "small"
            },
            I ? "隐藏导入" : "导入JSON"
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
      N,
      { type: "secondary", style: { fontSize: 12, display: "block", marginBottom: 12 } },
      `配置${U}源地址，支持从远程仓库或团队共享的 JSON 导入${U}配置。`
    ),
    // Import section (collapsible)
    I ? l.createElement(
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
        N,
        { strong: !0, style: { fontSize: 12, display: "block", marginBottom: 8 } },
        `粘贴${U}源 JSON（支持从导出的剪贴板内容粘贴）`
      ),
      l.createElement(s.TextArea, {
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
        onChange: (z) => v(z.target.value),
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
            onClick: V
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
      l.createElement(s, {
        placeholder: "源名称（可选，如：团队MCP仓库）",
        value: Q,
        onChange: (z) => O(z.target.value),
        style: { width: 200 }
      }),
      l.createElement(s, {
        placeholder: r === "mcp" ? "https://raw.githubusercontent.com/team/mcp-registry/main/mcp.json" : "https://raw.githubusercontent.com/team/expert-registry/main/experts.json",
        value: B,
        onChange: (z) => J(z.target.value),
        onPressEnter: L,
        prefix: w ? l.createElement(w) : void 0,
        style: { flex: 1 }
      }),
      l.createElement(
        c,
        {
          type: "primary",
          icon: h ? l.createElement(h) : void 0,
          onClick: L
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
        N,
        { strong: !0 },
        `已配置源 (${a.length})`
      )
    ),
    l.createElement(d, {
      size: "small",
      bordered: !0,
      dataSource: a,
      renderItem: (z) => l.createElement(
        d.Item,
        {
          actions: [
            l.createElement(
              f,
              { title: z.enabled ? "点击禁用" : "点击启用" },
              l.createElement(m, {
                size: "small",
                checked: z.enabled,
                onChange: (X) => $(z.id, X)
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
                  icon: C ? l.createElement(C) : void 0,
                  onClick: () => E(z.id)
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
              z.label
            ),
            z.enabled ? null : l.createElement(
              u,
              { style: { fontSize: 10 } },
              "已禁用"
            )
          ),
          l.createElement(
            N,
            {
              type: "secondary",
              style: { fontSize: 11, wordBreak: "break-all" }
            },
            z.url
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
async function Oo() {
  return se("/market/providers");
}
async function Mo(e) {
  return se(
    `/market/categories?lang=${encodeURIComponent(e)}`
  );
}
async function Ro(e, t, a, n, r) {
  return se("/market/search", {
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
function ma(e) {
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
async function ua(e, t) {
  const a = { bundle_url: e };
  return t && (a.access_token = t), se("/skills/pool/import", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(a)
  });
}
function Lo() {
  const e = _().React, { useState: t, useEffect: a, useCallback: n, useMemo: r, useRef: l } = e, {
    Spin: o,
    Empty: i,
    Input: s,
    Button: c,
    message: d,
    Row: u,
    Col: m,
    Card: p,
    Tag: f,
    Tooltip: y,
    Typography: h,
    Select: C,
    Drawer: w,
    Descriptions: S,
    Tabs: A,
    Badge: R,
    Progress: D,
    Modal: G,
    Alert: N
  } = _().antd, {
    ReloadOutlined: B,
    SearchOutlined: J,
    DownloadOutlined: Q,
    AppstoreOutlined: O,
    ShopOutlined: b,
    CheckCircleOutlined: v,
    LoadingOutlined: I,
    UserOutlined: T,
    UserAddOutlined: U,
    SettingOutlined: F,
    GithubOutlined: L,
    ApiOutlined: $
  } = _().antdIcons || {}, { Text: E, Paragraph: te, Title: V } = h, [z, X] = t("skills"), [le, Y] = t([]), [q, de] = t([]), [M, oe] = t([]), [pe, ie] = t(""), [re, ye] = t(""), [Ee, ke] = t(!1), [Pe, we] = t(!1), [ae, Se] = t(
    {}
  ), [he, Z] = t(null), [me, fe] = t({}), [K, k] = t([]), [ue, H] = t(""), [x, ee] = t(""), [ce, Ie] = t(""), [Re, Ne] = t({}), [Le, Ge] = t(""), [et, De] = t(/* @__PURE__ */ new Set()), [Te, Me] = t(null), [ne, ze] = t({}), [Ae, Oe] = t([]), [He, Je] = t([]), [_e, xt] = t([]), [Kt, mt] = t(""), [Ke, kt] = t(!1), [sr, Cn] = t(!1), [ir, Tn] = t([]), [cr, _n] = t(!1), [dr, In] = t([]), [mr, zn] = t(!1), [An, $n] = t([]), [Pn, On] = t([]), [Mn, Rn] = t(!1), [tt, Ln] = t(""), [Bn, Un] = t([]), [jn, Nn] = t([]), [Dn, Gn] = t(!1), [nt, Fn] = t(""), [Xt, Wn] = t(!1), [Ue, Ct] = t(null), [ut, ur] = t([]), pt = l(null);
  a(() => {
    Promise.all([
      Oo().catch(() => []),
      Mo("zh").catch(() => []),
      Jt().catch(() => [])
    ]).then(([g, j, W]) => {
      Y(g), de(j), k(W), W.length > 0 && (H(W[0].id), Ge(W[0].id));
    });
  }, []);
  const Tt = n(async (g) => {
    const j = g ?? ko();
    if (Oe(g || j), j.filter((ge) => ge.enabled).length === 0) {
      Je([]);
      return;
    }
    kt(!0);
    try {
      const { skills: ge, errors: be, categories: $e } = await $o(j);
      if (Je(ge), ur($e), be.length > 0) {
        for (const xe of be)
          console.warn(`[ugsci] GitHub source '${xe.label}' error: ${xe.message}`);
        d.warning(
          `部分源加载失败: ${be.map((xe) => xe.label).join(", ")}`
        );
      }
    } catch (ge) {
      d.error(ge.message || "加载技能源失败"), Je([]);
    } finally {
      kt(!1);
    }
  }, []), Qt = n(async () => {
    var ge, be, $e;
    Rn(!0), Gn(!0), kt(!0);
    const [g, j, W] = await Promise.allSettled([
      Io(),
      Ao(),
      zo()
    ]);
    if (g.status === "fulfilled" ? ($n(g.value.servers), On(g.value.categories)) : (console.warn(`[ugsci] MCP manifest error: ${((ge = g.reason) == null ? void 0 : ge.message) || g.reason}`), $n([]), On([])), Rn(!1), j.status === "fulfilled" ? (Un(j.value.agents), Nn(j.value.categories)) : (console.warn(`[ugsci] Agents manifest error: ${((be = j.reason) == null ? void 0 : be.message) || j.reason}`), Un([]), Nn([])), Gn(!1), W.status === "fulfilled")
      xt(W.value.skills), mt("");
    else {
      const xe = (($e = W.reason) == null ? void 0 : $e.message) || String(W.reason);
      console.warn(`[ugsci] Skills manifest error: ${xe}`), xt([]), mt(xe);
    }
    kt(!1);
  }, []);
  a(() => {
    Tt(), Qt(), Tn(wo()), In(So());
  }, [Tt, Qt]);
  const _t = n(
    async (g, j, W) => {
      ke(!0);
      try {
        const ge = await Ro(
          g,
          W,
          20,
          "zh",
          j || void 0
        );
        W === void 0 || Object.keys(W).length === 0 ? oe(ge.results) : oe((xe) => [...xe, ...ge.results]);
        const be = Object.values(ge.by_provider || {}).some(
          (xe) => xe.has_more
        );
        we(be);
        const $e = {};
        for (const [xe, Xe] of Object.entries(ge.by_provider || {}))
          $e[xe] = (W[xe] || 1) + 1;
        if (Se($e), ge.errors.length > 0)
          for (const xe of ge.errors)
            console.warn(
              `[ugsci] Market provider '${xe.provider}' error: ${xe.message}`
            );
      } catch (ge) {
        d.error(ge.message || "搜索市场失败"), oe([]);
      } finally {
        ke(!1);
      }
    },
    []
  );
  a(() => (pt.current && clearTimeout(pt.current), pt.current = setTimeout(() => {
    _t(pe, re, {});
  }, 400), () => {
    pt.current && clearTimeout(pt.current);
  }), [pe, re, _t]);
  const pr = () => {
    _t(pe, re, ae);
  }, Hn = async (g) => {
    const j = `${g.source}:${g.slug}`;
    try {
      fe((ge) => ({ ...ge, [j]: "installing" }));
      const W = await ua(g.source_url);
      W.installed && d.success(
        `技能「${W.name || g.name}」已安装到技能池，可在技能中心查看`
      ), fe((ge) => {
        const be = { ...ge };
        return delete be[j], be;
      });
    } catch (W) {
      d.error(ma(W) || "安装技能失败"), fe((ge) => {
        const be = { ...ge };
        return delete be[j], be;
      });
    }
  }, gr = (g) => {
    window.history.pushState({}, "", g), window.dispatchEvent(new PopStateEvent("popstate"));
  }, fr = async (g) => {
    const j = `github:${g.sourceId}:${g.name}`, W = Ae.find((be) => be.id === g.sourceId), ge = (W == null ? void 0 : W.accessToken) || void 0;
    try {
      fe(($e) => ({ ...$e, [j]: "installing" }));
      const be = await ua(g.source_url, ge);
      be.installed && d.success(
        `技能「${be.name || g.name}」已安装到技能池，可在技能中心查看`
      ), fe(($e) => {
        const xe = { ...$e };
        return delete xe[j], xe;
      });
    } catch (be) {
      d.error(ma(be) || "安装技能失败"), fe(($e) => {
        const xe = { ...$e };
        return delete xe[j], xe;
      });
    }
  }, Ze = r(() => {
    const g = [], j = /* @__PURE__ */ new Set();
    for (const W of [..._e, ...He]) {
      const ge = W.source_url || `${W.sourceLabel}:${W.name}`;
      j.has(ge) || (j.add(ge), g.push(W));
    }
    return g;
  }, [_e, He]), Jn = r(() => {
    const g = [], j = /* @__PURE__ */ new Set();
    if (ut.length > 0)
      for (const W of ut)
        j.has(W.id) || (j.add(W.id), g.push(W));
    for (const W of Ze)
      W.tag && !j.has(W.tag) && (j.add(W.tag), g.push({ id: W.tag, label: W.tag }));
    for (const W of Ze)
      !W.isOfficial && W.sourceLabel && !j.has(W.sourceLabel) && (j.add(W.sourceLabel), g.push({ id: W.sourceLabel, label: W.sourceLabel }));
    return g;
  }, [Ze, ut]), Yt = r(() => {
    let g = Ze;
    if (re) {
      const j = ut.find((W) => W.id === re);
      j && j.tags ? g = g.filter(
        (W) => W.tag && j.tags.includes(W.tag) || W.sourceLabel === re
      ) : g = g.filter(
        (W) => W.tag === re || W.sourceLabel === re
      );
    }
    if (pe.trim()) {
      const j = pe.toLowerCase();
      g = g.filter(
        (W) => {
          var ge;
          return W.name.toLowerCase().includes(j) || ((ge = W.description) == null ? void 0 : ge.toLowerCase().includes(j));
        }
      );
    }
    return g;
  }, [Ze, pe, re, ut]), qn = le.filter((g) => g.available), at = r(() => re ? M.filter((g) => {
    const j = qn.find((W) => W.key === g.source);
    return (j == null ? void 0 : j.label) === re;
  }) : M, [M, re, qn]), yr = e.createElement(
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
      e.createElement(s, {
        placeholder: "搜索技能市场...",
        prefix: J ? e.createElement(J) : void 0,
        value: pe,
        onChange: (g) => ie(g.target.value),
        allowClear: !0,
        style: { flex: 1, minWidth: 200, maxWidth: 400 }
      }),
      // Pool install info
      e.createElement(
        E,
        { type: "secondary", style: { fontSize: 12 } },
        "安装后进入技能池"
      ),
      // Configure skill source button
      e.createElement(
        c,
        {
          icon: L ? e.createElement(L) : void 0,
          onClick: () => Cn(!0),
          size: "small"
        },
        "配置技能源"
      )
    ),
    // Dynamic category filter tags (from OSS manifest tags + imported sources)
    Kt && Ze.length === 0 ? e.createElement(N, {
      type: "warning",
      showIcon: !0,
      message: "UGSci 官方 OSS 技能库加载失败",
      description: "请检查网络或后端 OSS 代理服务，然后点击右上角“刷新”重试。",
      style: { marginBottom: 12 }
    }) : null,
    Jn.length > 0 ? e.createElement(
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
        E,
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
          color: re === "" ? "blue" : void 0,
          onClick: () => ye("")
        },
        "全部"
      ),
      ...Jn.map((g) => {
        const j = He.some(
          (W) => !W.isOfficial && W.sourceLabel === g.id
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
            color: re === g.id ? j ? "blue" : "geekblue" : void 0,
            icon: j && L ? e.createElement(L) : void 0,
            onClick: () => ye(
              re === g.id ? "" : g.id
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
      e.createElement(o, { size: "large" }, e.createElement("div", { style: { minHeight: 60, display: "flex", alignItems: "center", justifyContent: "center" } }, "正在加载技能..."))
    ) : Yt.length > 0 ? e.createElement(
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
        L ? e.createElement(L, {
          style: { fontSize: 14, color: "#1677ff" }
        }) : null,
        e.createElement(
          E,
          { strong: !0, style: { fontSize: 13 } },
          `技能市场 (${Yt.length})`
        )
      ),
      e.createElement(
        u,
        { gutter: [12, 12] },
        ...Yt.map((g) => {
          const j = `github:${g.sourceId}:${g.name}`, W = me[j];
          return e.createElement(
            m,
            { key: j, xs: 24, sm: 12, md: 8, lg: 6 },
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
                L ? e.createElement(L, {
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
                    E,
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
                te,
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
                    $ ? e.createElement($, { style: { fontSize: 10 } }) : null,
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
                W ? e.createElement(
                  c,
                  {
                    size: "small",
                    disabled: !0,
                    icon: I ? e.createElement(I) : void 0
                  },
                  "安装中"
                ) : e.createElement(
                  c,
                  {
                    type: "primary",
                    size: "small",
                    icon: Q ? e.createElement(Q) : void 0,
                    onClick: () => fr(g)
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
    at.length > 0 || Ee ? e.createElement(
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
        E,
        { strong: !0, style: { fontSize: 13 } },
        `技能市场${at.length > 0 ? ` (${at.length})` : ""}`
      )
    ) : null,
    // Results grid
    Ee && at.length === 0 ? e.createElement(
      "div",
      { style: { textAlign: "center", padding: 60 } },
      e.createElement(o, { size: "large" })
    ) : at.length === 0 ? e.createElement(i, {
      description: pe ? `未找到匹配「${pe}」的技能` : "输入关键词搜索技能市场",
      image: i.PRESENTED_IMAGE_SIMPLE
    }) : e.createElement(
      u,
      { gutter: [12, 12] },
      ...at.map((g) => {
        const j = `${g.source}:${g.slug}`, W = me[j];
        return e.createElement(
          m,
          { key: j, xs: 24, sm: 12, md: 8, lg: 6 },
          e.createElement(
            p,
            {
              hoverable: !0,
              size: "small",
              style: { height: "100%", cursor: "pointer" },
              onClick: () => Z(g)
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
                  E,
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
              te,
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
              W ? e.createElement(
                c,
                {
                  size: "small",
                  disabled: !0,
                  icon: I ? e.createElement(I) : void 0
                },
                "安装中"
              ) : e.createElement(
                c,
                {
                  type: "primary",
                  size: "small",
                  icon: Q ? e.createElement(Q) : void 0,
                  onClick: (ge) => {
                    ge.stopPropagation(), Hn(g);
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
    Pe && !Ee ? e.createElement(
      "div",
      { style: { textAlign: "center", marginTop: 16 } },
      e.createElement(
        c,
        { onClick: pr, loading: Ee },
        "加载更多"
      )
    ) : null,
    // Detail Drawer
    he ? e.createElement(
      w,
      {
        title: e.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 8 } },
          he.icon_url ? e.createElement("img", {
            src: he.icon_url,
            alt: he.name,
            style: { width: 28, height: 28, borderRadius: 4 }
          }) : e.createElement(
            "span",
            { style: { fontSize: 20 } },
            "📦"
          ),
          e.createElement("span", null, he.name)
        ),
        open: !0,
        onClose: () => Z(null),
        width: 480,
        extra: e.createElement(
          c,
          {
            type: "primary",
            icon: Q ? e.createElement(Q) : void 0,
            onClick: () => {
              Hn(he);
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
          he.source
        ),
        e.createElement(
          S.Item,
          { label: "描述" },
          he.description || "-"
        ),
        he.version ? e.createElement(
          S.Item,
          { label: "版本" },
          he.version
        ) : null,
        he.author ? e.createElement(
          S.Item,
          { label: "作者" },
          he.author
        ) : null,
        e.createElement(
          S.Item,
          { label: "来源链接" },
          e.createElement(
            "a",
            { href: he.source_url, target: "_blank" },
            he.source_url
          )
        )
      ),
      he.stats ? e.createElement(
        "div",
        { style: { marginTop: 16 } },
        e.createElement(
          E,
          {
            strong: !0,
            style: { display: "block", marginBottom: 8 }
          },
          "统计"
        ),
        e.createElement(
          "div",
          { style: { display: "flex", gap: 12, flexWrap: "wrap" } },
          ...Object.entries(he.stats).map(
            ([g, j]) => e.createElement(
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
                String(j)
              ),
              e.createElement(
                E,
                { type: "secondary", style: { fontSize: 11 } },
                g
              )
            )
          )
        )
      ) : null
    ) : null
  ), Zt = r(() => {
    let g = Bn;
    if (nt && (g = g.filter((j) => j.category === nt)), x.trim()) {
      const j = x.toLowerCase();
      g = g.filter(
        (W) => W.name.toLowerCase().includes(j) || W.description.toLowerCase().includes(j) || W.tags.some((ge) => ge.toLowerCase().includes(j))
      );
    }
    return g;
  }, [Bn, x, nt]), hr = async (g) => {
    if (!Xt) {
      Wn(!0);
      try {
        let j = g.description;
        if (g.instructions)
          try {
            const be = g.instructions.replace(/^\/+/, ""), $e = await Ut(be);
            $e.ok && (j = await $e.text());
          } catch {
          }
        let W = [];
        if (g.skills_manifest)
          try {
            const be = g.skills_manifest.replace(/^\/+/, ""), $e = await Ut(be);
            if ($e.ok) {
              const xe = await $e.json();
              Array.isArray(xe) ? W = xe.map((Xe) => typeof Xe == "string" ? Xe : Xe.name).filter(Boolean) : xe.skills && (W = xe.skills.map((Xe) => typeof Xe == "string" ? Xe : Xe.name).filter(Boolean));
            }
          } catch {
          }
        const ge = await se("/agents", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: g.name,
            description: g.description,
            skill_names: W
          })
        });
        await Bt(ge.id, "AGENTS.md", j), d.success(`专家「${g.name}」创建成功，已跳转至专家`), gr("/ugsci-experts");
      } catch (j) {
        d.error(j.message || "创建专家失败");
      } finally {
        Wn(!1);
      }
    }
  }, Vn = n(async (g) => {
    if (g)
      try {
        const j = await En(g);
        De(new Set(j.map((W) => W.key)));
      } catch {
        De(/* @__PURE__ */ new Set());
      }
  }, []);
  a(() => {
    Le && Vn(Le);
  }, [Le, Vn]);
  const Er = async (g) => {
    if (!Le) {
      d.warning("请先选择目标专家");
      return;
    }
    if (ho(g)) {
      const j = Object.entries(g.env), W = {};
      for (const [ge] of j)
        W[ge] = "";
      ze(W), Me(g);
      return;
    }
    await Kn(g, g.env || {});
  }, Kn = async (g, j) => {
    Ne((W) => ({ ...W, [g.id]: !0 }));
    try {
      const W = g.id;
      await vn(Le, {
        client_key: W,
        client: {
          name: g.name,
          description: g.description,
          enabled: !0,
          transport: g.transport,
          url: g.url || "",
          command: g.command || "",
          args: g.args || [],
          env: j,
          cwd: g.cwd || "",
          headers: g.headers || {}
        }
      }), d.success(`MCP「${g.name}」已添加到当前专家`), De((ge) => new Set(ge).add(W));
    } catch (W) {
      d.error(W.message || `添加 MCP「${g.name}」失败`);
    } finally {
      Ne((W) => ({ ...W, [g.id]: !1 }));
    }
  }, vr = async () => {
    if (!Te) return;
    const g = [];
    for (const [W, ge] of Object.entries(ne))
      if (!ge || !ge.trim()) {
        const be = ia[W];
        g.push((be == null ? void 0 : be.label) || W);
      }
    if (g.length > 0) {
      d.warning(`请填写以下配置项: ${g.join(", ")}`);
      return;
    }
    const j = Te;
    Me(null), ze({}), await Kn(j, { ...ne });
  }, en = r(() => {
    let g = An;
    if (tt && (g = g.filter((j) => j.category === tt)), ce.trim()) {
      const j = ce.toLowerCase();
      g = g.filter(
        (W) => W.name.toLowerCase().includes(j) || W.description.toLowerCase().includes(j) || W.tags.some((ge) => ge.toLowerCase().includes(j))
      );
    }
    return g.map(bo);
  }, [An, ce, tt]), br = e.createElement(
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
      e.createElement(s, {
        placeholder: "搜索 MCP 服务器...",
        prefix: J ? e.createElement(J) : void 0,
        value: ce,
        onChange: (g) => Ie(g.target.value),
        allowClear: !0,
        style: { maxWidth: 300 }
      }),
      e.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        e.createElement(
          E,
          { type: "secondary", style: { fontSize: 12, whiteSpace: "nowrap" } },
          "安装到："
        ),
        e.createElement(C, {
          value: Le,
          onChange: (g) => Ge(g),
          style: { minWidth: 180 },
          size: "small",
          options: K.map((g) => ({ value: g.id, label: g.name }))
        })
      ),
      // Configure MCP source button
      e.createElement(
        c,
        {
          icon: $ ? e.createElement($) : void 0,
          onClick: () => _n(!0),
          size: "small"
        },
        "配置 MCP 源"
      )
    ),
    // Dynamic category tag row (from OSS manifest tag_groups)
    Pn.length > 0 ? e.createElement(
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
        E,
        { type: "secondary", style: { fontSize: 12, marginRight: 4 } },
        "分类:"
      ),
      e.createElement(
        f,
        {
          style: { fontSize: 11, cursor: "pointer", borderRadius: 12 },
          color: tt === "" ? "blue" : void 0,
          onClick: () => Ln("")
        },
        "全部"
      ),
      ...Pn.map(
        (g) => e.createElement(
          f,
          {
            key: g.id,
            style: { fontSize: 11, cursor: "pointer", borderRadius: 12 },
            color: tt === g.id ? "geekblue" : void 0,
            onClick: () => Ln(
              tt === g.id ? "" : g.id
            )
          },
          g.label
        )
      )
    ) : null,
    // MCP server cards (dynamic from OSS)
    Mn && en.length === 0 ? e.createElement(
      "div",
      { style: { textAlign: "center", padding: 40 } },
      e.createElement(o, { size: "large" }, e.createElement("div", { style: { minHeight: 60, display: "flex", alignItems: "center", justifyContent: "center" } }, "正在加载 MCP 服务器..."))
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
                  onError: (j) => {
                    j.target.style.display = "none";
                  }
                }) : g.emoji
              ),
              e.createElement(
                "div",
                { style: { flex: 1 } },
                e.createElement(
                  E,
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
              te,
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
                E,
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
                  icon: $ ? e.createElement($) : void 0,
                  onClick: () => Er(g)
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
        E,
        { type: "secondary", style: { fontSize: 12 } },
        "MCP 服务器列表来自 UGSci 官方源，自动同步更新"
      )
    )
  ), wr = Te ? e.createElement(
    G,
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
      onOk: vr,
      okText: "安装",
      cancelText: "取消",
      width: 520,
      destroyOnClose: !0
    },
    // Description
    e.createElement(
      E,
      { type: "secondary", style: { display: "block", marginBottom: 16, fontSize: 12 } },
      Te.description
    ),
    ...Object.entries(Te.env || {}).map(([g]) => {
      const j = ia[g], W = (j == null ? void 0 : j.isSecret) !== !1;
      return e.createElement(
        "div",
        { key: g, style: { marginBottom: 16 } },
        e.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 6, marginBottom: 4 } },
          e.createElement(
            E,
            { strong: !0, style: { fontSize: 13 } },
            (j == null ? void 0 : j.label) || g
          ),
          e.createElement(
            f,
            { color: "orange", style: { fontSize: 10 } },
            "必填"
          )
        ),
        // Help text with optional link
        j ? e.createElement(
          "div",
          { style: { marginBottom: 6, fontSize: 12, color: "var(--ant-color-text-tertiary, #8c8c8c)" } },
          j.help,
          j.link ? e.createElement(
            "a",
            {
              href: j.link,
              target: "_blank",
              rel: "noopener noreferrer",
              style: { marginLeft: 4, fontSize: 12 }
            },
            "获取方式 ↗"
          ) : null
        ) : null,
        // Input field
        W ? e.createElement(s.Password, {
          placeholder: `请输入 ${(j == null ? void 0 : j.label) || g}`,
          value: ne[g] || "",
          onChange: (ge) => ze((be) => ({
            ...be,
            [g]: ge.target.value
          })),
          style: { width: "100%" }
        }) : e.createElement(s, {
          placeholder: `请输入 ${(j == null ? void 0 : j.label) || g}`,
          value: ne[g] || "",
          onChange: (ge) => ze((be) => ({
            ...be,
            [g]: ge.target.value
          })),
          style: { width: "100%" }
        }),
        // Show env key name for reference
        e.createElement(
          E,
          { type: "secondary", style: { fontSize: 11, display: "block", marginTop: 2 } },
          `环境变量名: ${g}`
        )
      );
    })
  ) : null, Sr = e.createElement(
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
      e.createElement(s, {
        placeholder: "搜索人才...",
        prefix: J ? e.createElement(J) : void 0,
        value: x,
        onChange: (g) => ee(g.target.value),
        allowClear: !0,
        style: { maxWidth: 400, flex: 1, minWidth: 200 }
      }),
      e.createElement(
        c,
        {
          icon: T ? e.createElement(T) : void 0,
          onClick: () => zn(!0),
          size: "small"
        },
        "配置专家源"
      )
    ),
    // Dynamic category tag row (from OSS manifest tag_groups)
    jn.length > 0 ? e.createElement(
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
        E,
        { type: "secondary", style: { fontSize: 12, marginRight: 4 } },
        "分类:"
      ),
      e.createElement(
        f,
        {
          style: { fontSize: 11, cursor: "pointer", borderRadius: 12 },
          color: nt === "" ? "blue" : void 0,
          onClick: () => Fn("")
        },
        "全部"
      ),
      ...jn.map(
        (g) => e.createElement(
          f,
          {
            key: g.id,
            style: { fontSize: 11, cursor: "pointer", borderRadius: 12 },
            color: nt === g.id ? "geekblue" : void 0,
            onClick: () => Fn(
              nt === g.id ? "" : g.id
            )
          },
          g.label
        )
      )
    ) : null,
    // Agent cards (dynamic from OSS)
    Dn && Zt.length === 0 ? e.createElement(
      "div",
      { style: { textAlign: "center", padding: 40 } },
      e.createElement(o, { size: "large" }, e.createElement("div", { style: { minHeight: 60, display: "flex", alignItems: "center", justifyContent: "center" } }, "正在加载人才市场..."))
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
                  E,
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
              te,
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
                E,
                { type: "secondary", style: { fontSize: 11 } },
                g.tags.filter((j) => j !== "agent" && j !== "template" && j !== "workspace").slice(0, 3).join(" · ") || "人才模板"
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
        E,
        { type: "secondary", style: { fontSize: 12 } },
        "人才市场来自 UGSci 官方源，自动同步更新"
      )
    )
  ), xr = [
    {
      key: "skills",
      label: e.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        O ? e.createElement(O, { style: { fontSize: 14 } }) : null,
        "技能市场"
      ),
      children: yr
    },
    {
      key: "mcp",
      label: e.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        $ ? e.createElement($, { style: { fontSize: 14 } }) : null,
        "MCP 市场"
      ),
      children: br
    },
    {
      key: "experts",
      label: e.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        U ? e.createElement(U, { style: { fontSize: 14 } }) : null,
        "人才市场"
      ),
      children: Sr
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
            icon: B ? e.createElement(B) : void 0,
            onClick: () => {
              _t(pe, re, {}), Tt(), Qt();
            },
            loading: Ee || Ke || Mn || Dn
          },
          "刷新"
        )
      )
    }),
    e.createElement(A, {
      items: xr,
      activeKey: z,
      onChange: (g) => X(g)
    }),
    // Skill source config modal
    e.createElement(Po, {
      open: sr,
      onClose: () => Cn(!1),
      sources: Ae,
      onChange: (g) => {
        Oe(g), Tt(g);
      }
    }),
    // MCP source config modal
    e.createElement(da, {
      open: cr,
      onClose: () => _n(!1),
      sources: ir,
      onChange: (g) => Tn(g),
      type: "mcp"
    }),
    // MCP token config modal (for templates requiring secrets)
    wr,
    // Expert source config modal
    e.createElement(da, {
      open: mr,
      onClose: () => zn(!1),
      sources: dr,
      onChange: (g) => In(g),
      type: "expert"
    }),
    // ── Agent Detail Modal (click card to view details, then create) ──
    Ue ? e.createElement(
      G,
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
              E,
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
                await hr(Ue), Ct(null);
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
          E,
          { strong: !0, style: { display: "block", marginBottom: 6 } },
          "简介"
        ),
        e.createElement(
          te,
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
          E,
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
          E,
          { style: { fontSize: 12, color: "#1677ff" } },
          "✓ 包含系统提示词，创建后将自动写入 AGENTS.md"
        )
      ) : null,
      // Drivers
      Ue.drivers && Object.keys(Ue.drivers).length > 0 ? e.createElement(
        "div",
        null,
        e.createElement(
          E,
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
            ([g, j]) => e.createElement(
              f,
              { key: g, color: "cyan", style: { fontSize: 11 } },
              `${g}${j && j.length > 0 ? ` (${j.join(", ")})` : ""}`
            )
          )
        )
      ) : null
    ) : null
  );
}
function Bo() {
  try {
    const t = localStorage.getItem("language") || "";
    if (t) return t.split("-")[0];
  } catch {
  }
  return ((typeof navigator < "u" ? navigator.language : "") || "").split("-")[0] || "en";
}
const pa = {
  zh: "您好，UGSci 智能助手在线。无论是油气藏分析、数值模拟还是工程决策，描述您的场景，我来交付结果。",
  en: "UGSci AI assistant is online. From reservoir analysis to numerical simulation and engineering decisions — describe your scenario and I'll deliver results.",
  ja: "UGSci AIアシスタントがオンラインです。油層解析、数値シミュレーション、エンジニアリングの意思決定など、シナリオを描写してください。結果をお届けします。",
  ru: "UGSci AI-ассистент онлайн. От анализа пласта до численного моделирования и инженерных решений — опишите свой сценарий, и я предоставлю результат.",
  vi: "Trợ lý AI UGSci đang trực tuyến. Từ phân tích mỏ, mô phỏng số đến ra quyết định kỹ thuật — mô tả kịch bản của bạn, tôi sẽ giao kết quả.",
  id: "Asisten AI UGSci sedang online. Dari analisis reservoir, simulasi numerik hingga keputusan engineering — jelaskan skenario Anda, saya akan memberikan hasilnya."
}, ga = {
  zh: { label: "能告诉我你都能做点什么吗？", value: "能告诉我你都能做点什么吗" },
  en: { label: "Can you tell me what you can do?", value: "Can you tell me what you can do?" },
  ja: { label: "あなたができることを教えてください", value: "あなたができることを教えてください" },
  ru: { label: "Расскажи, что ты умеешь делать?", value: "Расскажи, что ты умеешь делать?" },
  vi: { label: "Bạn có thể cho tôi biết bạn làm được gì không?", value: "Bạn có thể cho tôi biết bạn làm được gì không?" },
  id: { label: "Bisa cerita apa saja yang bisa Anda lakukan?", value: "Bisa cerita apa saja yang bisa Anda lakukan?" }
};
function Uo() {
  const e = _(), t = e.React, { useEffect: a, useRef: n } = t, r = e.useSelectedAgent ? e.useSelectedAgent() : { id: "default" }, l = (r == null ? void 0 : r.id) || "default", o = n(null), i = n(null);
  return a(() => {
    if (o.current === l) return;
    o.current = l, gn();
    const s = Bo(), c = pa[s] || pa.en, d = ga[s] || ga.en;
    let u = !1;
    return (async () => {
      var m, p;
      try {
        const f = await qt(l);
        if (u) return;
        const y = _a(f);
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
const jo = 256;
let je = {};
const un = /* @__PURE__ */ new Set(), jt = () => un.forEach((e) => e()), No = (e) => (un.add(e), () => un.delete(e)), fa = () => je;
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
const ya = /* @__PURE__ */ new Set(["plugin_call_output", "function_call_output", "tool_call_output", "mcp_call_output", "component_call_output"]), nn = /* @__PURE__ */ new Set(["emit_ui_tree", "emit_ui_patch"]);
function Za(e) {
  var n, r, l, o;
  if (!Array.isArray(e)) return [];
  const t = [], a = (i, s = !1) => {
    var u, m;
    if (!i || typeof i != "object") return;
    if (Array.isArray(i)) {
      if (s ? i.map((f) => {
        var y;
        return ((y = f == null ? void 0 : f.data) == null ? void 0 : y.name) ?? (f == null ? void 0 : f.name);
      }).find((f) => nn.has(String(f || ""))) : void 0)
        for (const f of i) {
          const y = ((u = f == null ? void 0 : f.data) == null ? void 0 : u.output) ?? (f == null ? void 0 : f.output) ?? ((m = f == null ? void 0 : f.data) == null ? void 0 : m.result) ?? (f == null ? void 0 : f.result);
          if (y == null) continue;
          const h = typeof y == "string" ? y : JSON.stringify(y), C = ht(h) || Et(h);
          C && t.push(C);
        }
      i.forEach((f) => a(f));
      return;
    }
    const c = i;
    if (c.type === "tool_result" && nn.has(String(c.name || ""))) {
      const f = (Array.isArray(c.output) ? c.output : []).find((w) => (w == null ? void 0 : w.type) === "text"), y = (f == null ? void 0 : f.text) ?? c.output, h = typeof y == "string" ? y : JSON.stringify(y), C = ht(h) || Et(h);
      C && t.push(C);
      return;
    }
    const d = ya.has(String(c.type || ""));
    Object.entries(c).forEach(
      ([p, f]) => a(f, d && p === "content")
    );
  };
  a(e);
  for (const i of e) {
    if (!i || typeof i != "object") continue;
    const s = i;
    if (!ya.has(String(s.type || "")) || !Array.isArray(s.content)) continue;
    const c = s.content, d = (r = (n = c[0]) == null ? void 0 : n.data) == null ? void 0 : r.name;
    if (!nn.has(d)) continue;
    const u = (o = (l = c[1]) == null ? void 0 : l.data) == null ? void 0 : o.output;
    if (u == null) continue;
    const m = typeof u == "string" ? u : JSON.stringify(u), p = ht(m) || Et(m);
    p && t.push(p);
  }
  return Array.from(new Map(t.map((i) => [`${i.kind}:${i.ui_id}:${i.revision}`, i])).values());
}
function er(e) {
  var o;
  const t = Nt(e.sessionId, e.uiId), a = Object.entries(je).filter(([, i]) => i.uiId === e.uiId).sort(([, i], [, s]) => s.revision - i.revision), n = je[t] || ((o = a[0]) == null ? void 0 : o[1]);
  if (n && e.revision < n.revision) return;
  const r = { ...je };
  for (const [i] of a) i !== t && delete r[i];
  r[t] = n && e.revision === n.revision ? { ...n, ...e, tree: n.tree } : e;
  const l = Object.entries(r).sort(([, i], [, s]) => s.updatedAt - i.updatedAt);
  je = Object.fromEntries(l.slice(0, jo)), jt();
}
function Do(e, t) {
  for (const a of Za(t))
    !a.ui_id || !a.tree || er({
      schemaVersion: "1",
      uiId: a.ui_id,
      revision: a.revision || 1,
      tree: a.tree,
      sessionId: e,
      sourceToolCallId: a.tool_call_id,
      updatedAt: Date.now()
    });
}
const Go = {
  setSnapshot: er,
  applyPatch(e, t, a, n) {
    var c, d;
    const r = (c = window.QwenPaw) == null ? void 0 : c.host, l = n || ((d = r == null ? void 0 : r.getCurrentSessionId) == null ? void 0 : d.call(r)) || "", o = Nt(l, e.ui_id), i = je[o] || Object.values(je).find((u) => u.uiId === e.ui_id);
    if (!i || a <= i.revision) return;
    je = { ...Object.fromEntries(Object.entries(je).filter(([, u]) => u.uiId !== e.ui_id)), [o]: { ...i, sessionId: l, tree: t, revision: a, updatedAt: Date.now() } }, jt();
  },
  getSnapshot: (e, t) => je[Nt(e, t)],
  clearSession(e) {
    je = Object.fromEntries(Object.entries(je).filter(([, t]) => t.sessionId !== e)), jt();
  },
  hydrateFromMessages: Do
};
function Fo({ children: e }) {
  return e;
}
function Wo() {
  var a, n;
  const e = (n = (a = window.QwenPaw) == null ? void 0 : a.host) == null ? void 0 : n.React;
  if (!e) throw new Error("useGenUiStore: host React not available");
  return { snapshots: e.useSyncExternalStore(No, fa, fa), ...Go };
}
function Ho() {
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
function Jo(e) {
  const t = e.data;
  if (!t) return { resultText: "", status: "calling", toolName: "" };
  const a = t.status || "calling", n = t.content;
  if (!Array.isArray(n) || n.length === 0)
    return { resultText: "", status: a, toolName: "" };
  const r = n[0], l = r == null ? void 0 : r.data, o = (l == null ? void 0 : l.name) || "";
  if (n.length > 1) {
    const i = n[1], s = i == null ? void 0 : i.data, c = (s == null ? void 0 : s.output) ?? (s == null ? void 0 : s.content) ?? (i == null ? void 0 : i.output) ?? (i == null ? void 0 : i.content) ?? (s == null ? void 0 : s.result) ?? (i == null ? void 0 : i.result);
    if (c != null) return { resultText: vt(c), status: a, toolName: o };
  }
  if (l != null && l.output) {
    const i = l.output;
    return { resultText: vt(i), status: a, toolName: o };
  }
  return { resultText: "", status: a, toolName: o };
}
function Ot(e) {
  var p, f, y, h;
  const t = (p = window.QwenPaw) == null ? void 0 : p.host, a = t == null ? void 0 : t.React;
  if (!a) return null;
  const { resultText: n, status: r, toolName: l } = Jo(e), o = r === "in_progress" || r === "calling", i = r === "failed" || r === "error", s = ht(n), c = s ? null : Et(n);
  let d = 0;
  (f = s == null ? void 0 : s.tree) != null && f.root && (d = tr(s.tree.root));
  const u = l === "emit_ui_patch" || (s == null ? void 0 : s.kind) === "genui_patch", m = o ? u ? "📝 Patching UI Tree..." : "🎨 Generating UI Tree..." : i ? u ? "📝 UI Patch Error" : "🎨 UI Tree Error" : s ? u ? `📝 UI Patched (rev ${s.revision ?? "?"})` : `🎨 UI Tree (${d} nodes)` : u ? "📝 UI Patch" : "🎨 UI Tree";
  return a.createElement(
    "details",
    { open: o || i, style: { margin: "4px 0", border: "1px solid var(--ant-color-border, #d9d9d9)", borderRadius: 8, padding: "4px 8px", fontSize: 13 } },
    a.createElement(
      "summary",
      { style: { cursor: "pointer", display: "flex", alignItems: "center", gap: 6 } },
      a.createElement("span", null, u ? "📝" : "🎨"),
      a.createElement("span", null, m),
      s != null && s.ok ? a.createElement("span", { style: { fontSize: 11, color: "#999", marginLeft: "auto" } }, `ui_id: ${((y = s.ui_id) == null ? void 0 : y.slice(0, 16)) ?? ""}…`) : null
    ),
    i || c && !s ? a.createElement(
      "div",
      { style: { padding: "8px 12px", fontSize: 12 } },
      a.createElement("div", { style: { color: "var(--ant-color-error, #ff4d4f)", marginBottom: 4 } }, (c == null ? void 0 : c.message) || "Unknown error"),
      c != null && c.hint ? a.createElement("div", { style: { color: "#999" } }, `💡 ${c.hint}`) : null
    ) : s != null && s.ok ? a.createElement(
      "div",
      { style: { padding: "8px 12px", fontSize: 12, color: "#999" } },
      (h = s.tree) != null && h.root ? `GenUI 已在回复正文中展示（${d} 个节点，revision ${s.revision ?? 1}）。` : "GenUI 工具已完成，但没有可展示的树。"
    ) : a.createElement("pre", { style: { fontSize: 12, padding: "8px 12px", background: "rgba(0,0,0,0.03)", borderRadius: 8, overflow: "auto", maxHeight: 200 } }, n || "(waiting for result...)")
  );
}
function tr(e) {
  if (!e || typeof e != "object") return 0;
  let t = 1;
  if (Array.isArray(e.children)) for (const a of e.children) t += tr(a);
  return t;
}
const qo = /* @__PURE__ */ new Set(["send_message"]), ha = 1e4, Vo = 500, Ea = {};
function Ko() {
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
  return new Set(qo);
}
function Xo(e) {
  const t = Date.now(), a = Ea[e] || 0;
  return t - a < Vo ? (console.warn("[ugsci.genui] Action '" + e + "' throttled"), !0) : (Ea[e] = t, !1);
}
function Qo(e, t) {
  return e.replace(/\{\{\s*([\w.-]+)\s*\}\}/g, (a, n) => {
    const r = t[n];
    return r == null ? "" : typeof r == "string" ? r : JSON.stringify(r);
  });
}
function nr(e, t = {}) {
  var l, o, i, s, c;
  let a;
  if (typeof e == "string") a = { type: e };
  else if (e && typeof e == "object") a = e;
  else return { ok: !1, message: "无效操作" };
  const n = a.type === "submit_form" ? "send_message" : a.type, r = Ko();
  if (!r.has(n))
    return console.warn(
      "[ugsci.genui] Action '" + a.type + "' not allowed (allowed: " + Array.from(r).join(", ") + ")"
    ), { ok: !1, message: "此操作未获允许" };
  if (Xo(n)) return { ok: !1, message: "操作过于频繁，请稍后重试" };
  if (n === "send_message") {
    const d = t.formValues || {};
    let u = ((l = a.payload) == null ? void 0 : l.content) || ((o = a.payload) == null ? void 0 : o.message) || "";
    const m = /\{\{\s*[\w.-]+\s*\}\}/.test(u);
    return u = Qo(u, d).trim(), u && !m && Object.keys(d).length > 0 && (u += `
${Object.entries(d).map(([f, y]) => `${f}: ${typeof y == "string" ? y : JSON.stringify(y)}`).join(`
`)}`), !u && Object.keys(d).length > 0 && (u = `${t.formId ? `提交表单 ${t.formId}` : "提交表单"}
${Object.entries(d).map(([y, h]) => `${y}: ${typeof h == "string" ? h : JSON.stringify(h)}`).join(`
`)}`), !u || !u.trim() ? (console.warn("[ugsci.genui] send_message: content is empty"), { ok: !1, message: "消息内容为空" }) : u.length > ha ? (console.warn("[ugsci.genui] send_message: content length " + u.length + " exceeds max " + ha), { ok: !1, message: "消息内容过长" }) : !((c = (s = (i = window.QwenPaw) == null ? void 0 : i.chat) == null ? void 0 : s.sendMessage) != null && c.call(s, u)) ? (console.info("[ugsci.genui] send_message: could not find chat sender, content:", u), { ok: !1, message: "当前无法发送消息" }) : { ok: !0, message: "已提交" };
  }
  return { ok: !1, message: "尚未实现此操作" };
}
const Fe = /* @__PURE__ */ new Map(), wt = /* @__PURE__ */ new Map(), Yo = 128, Mt = /* @__PURE__ */ new Map();
function Dt(e) {
  return e.startsWith("http://") || e.startsWith("https://") || e.startsWith("data:") || e.startsWith("blob:");
}
function Zo(e) {
  return e ? !!(e.startsWith("/") || /^[A-Za-z]:[\\/]/.test(e) || e.startsWith("\\\\")) : !1;
}
function es(e) {
  return e.startsWith("workspace://");
}
function ts(e) {
  return es(e) ? e.slice(12) : e;
}
async function ns(e) {
  if (!e) return null;
  if (Dt(e)) return e;
  if (Fe.has(e))
    return Fe.get(e) ?? null;
  if (Mt.has(e))
    return Mt.get(e);
  const t = as(e);
  Mt.set(e, t);
  try {
    const a = await t;
    if (!Fe.has(e) && Fe.size >= Yo) {
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
async function as(e) {
  const t = window.QwenPaw, a = t == null ? void 0 : t.host;
  if (!a) {
    const r = "宿主媒体 API 不可用。请在 QwenPaw 工作区中打开此内容，或改用 http(s)、data、blob URL。";
    return wt.set(e, r), console.warn("[ugsci.genui]", r), null;
  }
  const n = ts(e);
  if (typeof a.resolveWorkspaceBlob == "function")
    try {
      const r = await a.resolveWorkspaceBlob(n);
      if (r) return r;
    } catch (r) {
      console.warn("[ugsci.genui] host.resolveWorkspaceBlob failed:", r);
    }
  try {
    return await rs(n, a);
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
async function rs(e, t) {
  let a = null;
  const n = t == null ? void 0 : t.workspaceApi, r = t == null ? void 0 : t.chatApi;
  if (Zo(e) && (r != null && r.filePreviewUrl) ? a = r.filePreviewUrl(e) : n != null && n.getBinaryFileUrl && (a = n.getBinaryFileUrl(e)), !a)
    throw new Error("宿主未提供 workspaceApi.getBinaryFileUrl 或 chatApi.filePreviewUrl");
  const l = {}, o = t == null ? void 0 : t.buildAuthHeaders;
  if (typeof o == "function")
    try {
      const c = o();
      c && typeof c == "object" && Object.assign(l, c);
    } catch {
    }
  const i = await fetch(a, { headers: l });
  if (!i.ok)
    throw new Error(`HTTP ${i.status}: ${i.statusText}`);
  const s = await i.blob();
  return URL.createObjectURL(s);
}
function va(e) {
  return e ? Dt(e) ? e : Fe.get(e) ?? null : null;
}
function ba(e) {
  return wt.get(e) ?? null;
}
function ls() {
  for (const e of Fe.values())
    if (e && e.startsWith("blob:"))
      try {
        URL.revokeObjectURL(e);
      } catch {
      }
  Fe.clear(), wt.clear();
}
const wa = (e) => typeof e == "string" ? e : e != null ? String(e) : "";
let an = null;
function xn(e) {
  return an || (an = e.createContext(null)), an;
}
function Gt(e) {
  const t = e.props || {}, a = wa(t.name);
  if (a) return a;
  const n = wa(t.label), r = n.match(/^\s*([a-e])(?:\b|\s|（|\()/i);
  return r ? r[1].toLowerCase() : n || e.nodeId;
}
function ar(e, t = {}) {
  if (["Input", "NumberInput", "Select", "Textarea", "Switch", "Slider", "FileInput"].includes(e.kind)) {
    const a = e.props || {}, n = a.value ?? a.checked;
    n !== void 0 && (t[Gt(e)] = n);
  }
  for (const a of e.children || []) ar(a, t);
  return t;
}
function os({
  node: e,
  children: t
}) {
  var i, s;
  const a = (s = (i = window.QwenPaw) == null ? void 0 : i.host) == null ? void 0 : s.React;
  if (!a) return null;
  const n = a.useMemo(() => ar(e), [e]), [r, l] = a.useState(n);
  a.useEffect(
    () => l((c) => ({ ...n, ...c })),
    [n]
  );
  const o = a.useMemo(
    () => ({
      values: r,
      setValue: (c, d) => l((u) => ({ ...u, [c]: d }))
    }),
    [r]
  );
  return a.createElement(
    xn(a).Provider,
    { value: o },
    t
  );
}
const P = (e) => typeof e == "string" ? e : e != null ? String(e) : "", Ce = (e) => typeof e == "number" ? e : typeof e == "string" && Number(e) || 0, Ye = (e) => !!e, qe = (e) => Array.isArray(e) ? e : [], Sa = { xs: "12px", sm: "13px", base: "14px", lg: "16px" }, ve = {
  muted: "var(--ant-color-text-secondary, #8c8c8c)",
  default: "var(--ant-color-text, #000000d9)",
  primary: "var(--ant-color-primary, #1677ff)",
  success: "var(--ant-color-success, #52c41a)",
  warning: "var(--ant-color-warning, #faad14)",
  error: "var(--ant-color-error, #ff4d4f)"
};
let rn = null;
function kn(e) {
  return rn || (rn = e.createContext(null)), rn;
}
function ss({ node: e }) {
  var m;
  const t = (m = window.QwenPaw) == null ? void 0 : m.host, a = t == null ? void 0 : t.React, n = (t == null ? void 0 : t.antd) || {};
  if (!a) return null;
  const r = e.props || {}, [l, o] = a.useState({}), [i, s] = a.useState(null), c = a.useMemo(() => {
    const p = {};
    for (const f of e.children || []) {
      const y = f.props || {}, h = Gt(f);
      y.value !== void 0 ? p[h] = y.value : y.checked !== void 0 && (p[h] = y.checked);
    }
    return p;
  }, [e]);
  a.useEffect(() => o((p) => ({ ...c, ...p })), [c]);
  const d = a.useMemo(() => ({ values: l, setValue: (p, f) => {
    s(null), o((y) => ({ ...y, [p]: f }));
  } }), [l]), u = () => {
    var y, h;
    const p = (e.children || []).filter((C) => {
      var w;
      return (w = C.props) == null ? void 0 : w.required;
    }).find((C) => {
      const w = Gt(C), S = l[w];
      return S == null || S === "" || Array.isArray(S) && S.length === 0;
    });
    if (p) {
      s({ ok: !1, message: `${P((y = p.props) == null ? void 0 : y.label) || P((h = p.props) == null ? void 0 : h.name) || "必填项"}不能为空` });
      return;
    }
    const f = r.action && typeof r.action == "object" ? r.action : { type: "submit_form", payload: {} };
    s(nr(f, { formValues: l, formId: P(r.formId) || e.nodeId }));
  };
  return a.createElement(
    kn(a).Provider,
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
function is({ node: e, fieldType: t }) {
  var C, w, S;
  const a = (C = window.QwenPaw) == null ? void 0 : C.host, n = a == null ? void 0 : a.React, r = (a == null ? void 0 : a.antd) || {};
  if (!n) return null;
  const l = e.props || {}, o = n.useContext(kn(n)), i = n.useContext(xn(n)), s = o || i, [c, d] = n.useState(l.value ?? l.checked ?? ""), u = Gt(e), m = l.value ?? l.checked ?? "", p = s ? ((w = s.values) == null ? void 0 : w[u]) ?? m : c, f = (A) => {
    const R = A != null && A.target ? t === "Switch" ? A.target.checked : A.target.value : A;
    s ? s.setValue(u, R) : d(R);
  }, y = (A) => n.createElement(
    "div",
    { style: { display: "flex", flexDirection: "column", gap: 4, margin: "4px 0" } },
    l.label && t !== "Switch" ? n.createElement("label", { style: { fontSize: 12, color: ve.muted } }, P(l.label), l.required ? n.createElement("span", { style: { color: ve.error } }, " *") : null) : null,
    A,
    l.description ? n.createElement("span", { style: { fontSize: 11, color: ve.muted } }, P(l.description)) : null
  ), h = P(l.label) || P(l.placeholder) || u;
  return t === "Input" ? y(n.createElement(r.Input || "input", { "aria-label": h, placeholder: P(l.placeholder), value: p, onChange: f, size: "small" })) : t === "NumberInput" ? y(n.createElement(r.InputNumber || "input", { "aria-label": h, value: p, min: l.min, max: l.max, step: l.step, onChange: f, size: "small", style: { width: "100%" } })) : t === "Textarea" ? y(n.createElement(((S = r.Input) == null ? void 0 : S.TextArea) || "textarea", { "aria-label": h, placeholder: P(l.placeholder), value: p, rows: Ce(l.rows) || 3, onChange: f, style: { width: "100%" } })) : t === "Select" ? y(n.createElement(r.Select || "select", { "aria-label": h, placeholder: P(l.placeholder), value: p || void 0, onChange: f, size: "small", style: { width: "100%" } }, qe(l.options).map((A, R) => {
    var D;
    return n.createElement(((D = r.Select) == null ? void 0 : D.Option) || "option", { key: R, value: P(typeof A == "object" ? A.value : A) }, P(typeof A == "object" ? A.label : A));
  }))) : t === "Switch" ? n.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8 } }, n.createElement(r.Switch || "input", { type: "checkbox", checked: !!p, onChange: f, size: "small" }), n.createElement("span", null, P(l.label))) : t === "Slider" ? y(n.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8 } }, n.createElement(r.Slider || "input", { type: "range", value: Ce(p), min: l.min ?? 0, max: l.max ?? 100, step: l.step ?? 1, onChange: f, style: { flex: 1 } }), n.createElement("span", { style: { minWidth: 32, fontSize: 12 } }, P(p)))) : t === "FileInput" ? n.createElement(
    "label",
    { style: { display: "inline-flex", alignItems: "center", gap: 8, cursor: "pointer" } },
    n.createElement("span", null, P(l.label) || "选择文件"),
    n.createElement("input", { type: "file", multiple: Ye(l.multiple), accept: P(l.accept) || void 0, onChange: (A) => s == null ? void 0 : s.setValue(u, Array.from(A.target.files || []).map((R) => ({ name: R.name, size: R.size, type: R.type }))) })
  ) : null;
}
function ln({ node: e, link: t = !1, toggle: a = !1 }) {
  var p;
  const n = (p = window.QwenPaw) == null ? void 0 : p.host, r = n == null ? void 0 : n.React, l = (n == null ? void 0 : n.antd) || {};
  if (!r) return null;
  const o = e.props || {}, i = r.useContext(kn(r)), [s, c] = r.useState(Ye(o.checked)), [d, u] = r.useState(null), m = () => {
    a && c((f) => !f), o.action && typeof o.action == "object" ? u(nr(o.action, { formValues: i == null ? void 0 : i.values, formId: i ? "form" : void 0 })) : t && typeof o.href == "string" && /^(https?:\/\/|\/)/.test(o.href) && window.open(o.href, "_blank", "noopener,noreferrer");
  };
  return r.createElement(
    "span",
    { style: { display: "inline-flex", flexDirection: "column", gap: 3 } },
    r.createElement(l.Button || "button", { type: t ? "link" : (a ? s : P(o.variant) === "primary") ? "primary" : "default", size: "small", disabled: Ye(o.disabled), loading: Ye(o.loading), onClick: m }, P(o.label) || "Action"),
    d ? r.createElement("span", { role: "status", style: { fontSize: 11, color: d.ok ? ve.success : ve.error } }, d.message) : null
  );
}
function cs({ node: e, children: t }) {
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
  const a = t.React, n = t.antd || {}, r = e.props || {}, l = e.children || [], o = () => l.map(
    (s, c) => a.createElement(st, { key: s.nodeId || c, node: s })
  );
  return a.createElement(
    cs,
    { node: e },
    ds(a, n, e, r, l, o)
  );
}
function ds(e, t, a, n, r, l) {
  var o, i;
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
      const s = P(n.ratio) || "16:9", [c, d] = s.split(":").map(Number), u = c && d ? `${d}/${c}` : "9/16";
      return e.createElement("div", { style: { aspectRatio: u, overflow: "hidden", borderRadius: 8, display: "flex", justifyContent: "center", alignItems: "center" } }, l());
    }
    case "Text":
      return e.createElement("div", { style: { fontSize: Sa[P(n.size)] || Sa.base, color: ve[P(n.color)] || ve.default, fontWeight: Ye(n.bold) ? "bold" : "normal", lineHeight: 1.6 } }, P(n.value));
    case "Heading": {
      const s = Math.min(Math.max(Ce(n.level) || 2, 1), 4), c = { 1: "24px", 2: "20px", 3: "18px", 4: "16px" };
      return e.createElement("div", { style: { fontSize: c[s], fontWeight: "bold", margin: "4px 0" } }, P(n.value));
    }
    case "Divider":
      return e.createElement(t.Divider || "hr", n.label ? { children: P(n.label) } : {});
    case "Markdown": {
      const s = (o = window.QwenPaw) == null ? void 0 : o.host, c = s == null ? void 0 : s.ReactMarkdown;
      if (c) {
        const d = s != null && s.remarkGfm ? [s.remarkGfm] : [];
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
      const s = qe(n.items);
      return e.createElement(
        "div",
        { style: { display: "flex", flexDirection: "column", gap: 4 } },
        ...s.map((c, d) => e.createElement(
          "div",
          { key: d, style: { display: "flex", justifyContent: "space-between", padding: "2px 0", borderBottom: d < s.length - 1 ? "1px solid var(--ant-color-border-secondary, #f0f0f0)" : "none" } },
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
      const s = Ce(n.rows) || 3;
      return e.createElement(
        "div",
        { style: { display: "flex", flexDirection: "column", gap: 8 } },
        ...Array.from({ length: s }).map(
          (c, d) => e.createElement(t.Skeleton || "div", { key: d, active: Ye(n.active), title: !1, paragraph: { rows: 1 } })
        )
      );
    }
    case "Avatar":
      return e.createElement(xa, {
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
      return e.createElement(t.Card || "div", { size: "small", style: { margin: "4px 0" } }, e.createElement("div", { style: { display: "flex", gap: 12, alignItems: "center" } }, e.createElement(xa, { src: P(n.avatar), name: P(n.name), size: 48 }), e.createElement("div", null, e.createElement("div", { style: { fontWeight: 600 } }, P(n.name)), e.createElement("div", { style: { fontSize: 12, color: ve.muted } }, P(n.role)), n.bio ? e.createElement("div", { style: { fontSize: 12, marginTop: 4 } }, P(n.bio)) : null)));
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
      const s = qe(n.steps).map((d) => P(d)), c = Ce(n.current);
      return e.createElement(
        t.Steps || "div",
        { current: c, size: "small", style: { margin: "4px 0" } },
        ...s.map((d, u) => {
          var m;
          return e.createElement(((m = t.Steps) == null ? void 0 : m.Item) || "div", { key: u, title: d });
        })
      );
    }
    case "Table": {
      const s = qe(n.headers).map((m) => P(m)), d = r.filter((m) => m.kind === "TableRow").map((m, p) => {
        const f = (m.children || []).filter((h) => h.kind === "TableCell"), y = { key: p };
        return s.forEach((h, C) => {
          var S, A;
          const w = (A = (S = f[C]) == null ? void 0 : S.props) == null ? void 0 : A.value;
          y[h] = w == null ? "" : P(w);
        }), y;
      }), u = s.map((m) => ({ title: m, dataIndex: m, key: m }));
      return e.createElement(t.Table || "table", { dataSource: d, columns: u, size: Ye(n.compact) ? "small" : "middle", pagination: !1, style: { margin: "4px 0" } });
    }
    case "List": {
      const s = r.filter((c) => c.kind === "ListItem");
      return e.createElement(
        t.List || "ul",
        { size: "small", style: { margin: "4px 0" } },
        s.map((c, d) => {
          var u, m, p;
          return e.createElement(((u = t.List) == null ? void 0 : u.Item) || "li", { key: d }, (m = c.props) != null && m.icon ? e.createElement("span", { style: { marginRight: 6 } }, P(c.props.icon)) : null, P((p = c.props) == null ? void 0 : p.value));
        })
      );
    }
    case "ImageGallery": {
      const s = r.filter((c) => c.kind === "Image");
      return e.createElement(
        "div",
        { style: { display: "grid", gridTemplateColumns: `repeat(${Math.min(Math.max(Ce(n.columns) || 3, 1), 6)}, 1fr)`, gap: `${Ce(n.gap) || 8}px`, margin: "4px 0" } },
        ...s.map((c, d) => {
          const u = c.props || {};
          return e.createElement(Lt, { key: d, src: P(u.src), alt: P(u.alt), style: { width: "100%", height: 120, objectFit: "cover", borderRadius: 8, cursor: "pointer" } });
        })
      );
    }
    case "Image":
      return e.createElement("div", null, e.createElement(Lt, { src: P(n.src), alt: P(n.alt), style: { maxWidth: "100%", borderRadius: Ye(n.rounded) ? "8px" : void 0, maxHeight: n.maxHeight ? `${Ce(n.maxHeight)}px` : void 0 } }), n.caption ? e.createElement("div", { style: { fontSize: 12, color: ve.muted } }, P(n.caption)) : null);
    case "Chart":
      return e.createElement(ms, { props: n });
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
      return e.createElement(is, { node: a, fieldType: a.kind });
    case "Form":
      return e.createElement(ss, { node: a });
    case "Chip":
      return e.createElement(t.Tag || "span", { color: P(n.color) || "default", closable: !0, onClose: () => {
      }, children: P(n.label) });
    case "ChipGroup": {
      const s = qe(n.items);
      return e.createElement("div", { style: { display: "flex", flexWrap: "wrap", gap: 4 } }, ...s.map((c, d) => e.createElement(t.Tag || "span", { key: d }, P(c))));
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
      const s = r.filter((c) => c.kind === "AccordionItem");
      if (t.Collapse) {
        const c = s.map((d) => {
          var u, m, p;
          return {
            key: P((u = d.props) == null ? void 0 : u.key) || P((m = d.props) == null ? void 0 : m.header),
            label: P((p = d.props) == null ? void 0 : p.header),
            children: (d.children || []).map((f, y) => e.createElement(st, { key: f.nodeId || y, node: f }))
          };
        });
        return e.createElement(t.Collapse, { items: c });
      }
      return e.createElement("div", null, ...s.map((c, d) => {
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
function ms({ props: e }) {
  var Q, O;
  const t = (O = (Q = window.QwenPaw) == null ? void 0 : Q.host) == null ? void 0 : O.React;
  if (!t) return null;
  const a = t.useContext(xn(t)), n = P(e.chart) || "line", r = P(e.title);
  let l = qe(e.categories).map((b) => P(b)), o = qe(e.series);
  const i = Ce(e.height) || 200, s = e.showLegend !== !1, c = 400, d = e.generator && typeof e.generator == "object" ? e.generator : {}, u = qe(d.coefficients).map(P), m = ["a", "b", "c", "d", "e"], p = u.length > 0 ? u : m;
  if ((P(d.type) === "polynomial" || u.length > 0 || m.every((b) => {
    var v;
    return ((v = a == null ? void 0 : a.values) == null ? void 0 : v[b]) !== void 0;
  })) && a) {
    const b = typeof d.xMin == "number" ? d.xMin : -3, v = typeof d.xMax == "number" ? d.xMax : 3, I = Math.min(Math.max(Ce(d.samples) || 61, 10), 400), T = Array.from({ length: I }, (F, L) => b + (v - b) * L / (I - 1)), U = p.map((F) => {
      var L;
      return Ce((L = a.values) == null ? void 0 : L[F]);
    });
    l = T.map((F) => Number(F.toFixed(2)).toString()), o = [{ name: P(d.label) || "f(x)", values: T.map((F) => U.reduce((L, $, E) => L + $ * Math.pow(F, U.length - E - 1), 0)) }];
  }
  const y = o.map((b, v) => {
    const I = b, T = qe(I.values).map((U) => Ce(U));
    return { name: P(I.name) || `Series ${v + 1}`, values: T };
  });
  if (l.length === 0 || y.length === 0)
    return t.createElement("div", { style: { padding: 12, color: ve.muted, fontSize: 12 } }, "Chart: no data");
  if (n === "pie") {
    const b = y[0].values.map(($) => Math.abs($)), v = b.reduce(($, E) => $ + E, 0) || 1, I = c / 2, T = i / 2, U = Math.min(c, i) / 2 - 20;
    let F = -Math.PI / 2;
    const L = b.map(($, E) => {
      const te = $ / v * 2 * Math.PI, V = I + U * Math.cos(F), z = T + U * Math.sin(F), X = I + U * Math.cos(F + te), le = T + U * Math.sin(F + te), Y = te > Math.PI ? 1 : 0, q = `M ${I} ${T} L ${V} ${z} A ${U} ${U} 0 ${Y} 1 ${X} ${le} Z`;
      return F += te, { path: q, color: rt[E % rt.length], label: l[E] || `#${E + 1}`, val: $ };
    });
    return t.createElement(
      "div",
      { style: { margin: "4px 0" } },
      r ? t.createElement("div", { style: { fontSize: 13, fontWeight: 600, marginBottom: 4 } }, r) : null,
      t.createElement(
        "svg",
        { width: c, height: i, style: { maxWidth: "100%" } },
        ...L.map(($, E) => t.createElement("path", { key: E, d: $.path, fill: $.color, stroke: "#fff", strokeWidth: 1 }))
      ),
      s ? t.createElement(
        "div",
        { style: { display: "flex", flexWrap: "wrap", gap: 8, marginTop: 4, fontSize: 11 } },
        ...L.map(($, E) => t.createElement(
          "span",
          { key: E, style: { display: "flex", alignItems: "center", gap: 4 } },
          t.createElement("span", { style: { display: "inline-block", width: 10, height: 10, borderRadius: 2, background: $.color } }),
          `${$.label}: ${$.val}`
        ))
      ) : null
    );
  }
  const h = y.flatMap((b) => b.values), C = Math.max(...h, 0), w = Math.min(...h, 0), S = C - w || 1, A = l.length > 0 ? (c - 40) / l.length : 0, R = y.length > 0 ? Math.max(1, A / y.length - 2) : 0, D = l.length > 1 ? (c - 40) / (l.length - 1) : 0, G = Math.max(1, Math.ceil(l.length / 8)), N = (b) => i - 20 - (b - w) / S * (i - 40), B = N(0), J = (b) => 30 + b * D;
  return t.createElement(
    "div",
    { style: { margin: "4px 0" } },
    r ? t.createElement("div", { style: { fontSize: 13, fontWeight: 600, marginBottom: 4 } }, r) : null,
    t.createElement(
      "svg",
      { width: c, height: i, style: { maxWidth: "100%" } },
      ...[0, 0.25, 0.5, 0.75, 1].map((b, v) => {
        const I = i - 20 - b * (i - 40);
        return t.createElement("line", { key: `g${v}`, x1: 30, y1: I, x2: c - 10, y2: I, stroke: "var(--ant-color-border-secondary, #f0f0f0)", strokeWidth: 1 });
      }),
      ...l.map((b, v) => v % G === 0 || v === l.length - 1 ? t.createElement("text", { key: `x${v}`, x: J(v), y: i - 6, fontSize: 10, fill: ve.muted, textAnchor: "middle" }, b.length > 6 ? b.slice(0, 6) + "…" : b) : null),
      ...y.map((b, v) => {
        const I = rt[v % rt.length];
        if (n === "bar")
          return b.values.map((F, L) => t.createElement("rect", {
            key: `b${v}-${L}`,
            x: 30 + L * A + v * (R + 2) + 1,
            y: Math.min(N(F), B),
            width: R,
            height: Math.abs(B - N(F)),
            fill: I,
            rx: 2
          }));
        const T = b.values.map((F, L) => `${J(L)},${N(F)}`).join(" "), U = [t.createElement("polyline", { key: `l${v}`, points: T, fill: "none", stroke: I, strokeWidth: 2 })];
        if (n === "area") {
          const F = `${J(0)},${i - 20} ${T} ${J(b.values.length - 1)},${i - 20}`;
          U.unshift(t.createElement("polygon", { key: `a${v}`, points: F, fill: I, opacity: 0.15 }));
        }
        return U;
      })
    ),
    s ? t.createElement(
      "div",
      { style: { display: "flex", flexWrap: "wrap", gap: 8, marginTop: 4, fontSize: 11 } },
      ...y.map((b, v) => t.createElement(
        "span",
        { key: v, style: { display: "flex", alignItems: "center", gap: 4 } },
        t.createElement("span", { style: { display: "inline-block", width: 10, height: 10, borderRadius: 2, background: rt[v % rt.length] } }),
        b.name
      ))
    ) : null
  );
}
function Lt(e) {
  var c;
  const t = (c = window.QwenPaw) == null ? void 0 : c.host, a = t == null ? void 0 : t.React;
  if (!a) return null;
  const { useState: n, useEffect: r } = a, [l, o] = n(
    va(e.src) || (Dt(e.src) ? e.src : null)
  ), [i, s] = n(
    ba(e.src)
  );
  return r(() => {
    if (!e.src) return;
    if (Dt(e.src)) {
      o(e.src), s(null);
      return;
    }
    const d = va(e.src);
    if (d) {
      o(d), s(null);
      return;
    }
    o(null), s(null);
    let u = !1;
    return ns(e.src).then((m) => {
      u || (o(m), s(m ? null : ba(e.src)));
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
function xa(e) {
  var r, l, o;
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
    ((o = (l = e.name) == null ? void 0 : l.charAt(0)) == null ? void 0 : o.toUpperCase()) || ""
  ) : null;
}
async function us(e, t) {
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
  const o = document.createTreeWalker(e, NodeFilter.SHOW_TEXT);
  for (; o.nextNode(); ) {
    const u = o.currentNode, m = (d = u.textContent) == null ? void 0 : d.trim();
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
  const i = await new Promise((u, m) => r.toBlob((p) => p ? u(p) : m(new Error("PNG encoding failed")), "image/png")), s = URL.createObjectURL(i), c = document.createElement("a");
  c.download = `${t}.png`, c.href = s, c.click(), setTimeout(() => URL.revokeObjectURL(s), 1e3), console.info("[ugsci.genui] PNG export created", { filename: t, bytes: i.size });
}
function ps(e, t) {
  const a = window.open("", "_blank", "noopener,noreferrer");
  if (!a) throw new Error("print window was blocked");
  a.document.write(`<!doctype html><html><head><title>${t}</title><style>body{font-family:system-ui;padding:24px}@media print{button{display:none}}</style></head><body>${e.outerHTML}</body></html>`), a.document.close(), a.addEventListener("load", () => {
    a.focus(), a.print(), a.close();
  }, { once: !0 });
}
const gs = [], it = /* @__PURE__ */ new Map();
function fs(e) {
  it.set(e, (it.get(e) || 0) + 1);
}
function ys(e) {
  const t = (it.get(e) || 1) - 1;
  t > 0 ? it.set(e, t) : it.delete(e);
}
function hs(e) {
  return (it.get(e) || 0) > 0;
}
function Es({ data: e }) {
  var d, u;
  const t = (d = window.QwenPaw) == null ? void 0 : d.host, a = t == null ? void 0 : t.React;
  if (!a) return null;
  const n = Wo(), r = ((u = t.getCurrentSessionId) == null ? void 0 : u.call(t)) || "__current_chat__", l = Array.isArray(e.output) ? e.output : gs, o = a.useMemo(
    () => Za(l),
    [l]
  );
  a.useEffect(() => {
    for (const m of o) {
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
  }, [o, r]);
  const i = a.useMemo(
    () => o.filter((m) => m.kind === "genui" && !!m.ui_id).map((m) => m.ui_id),
    [o]
  ), s = i.join("\0");
  a.useEffect(() => {
    for (const m of i) fs(m);
    return () => {
      for (const m of i) ys(m);
    };
  }, [s]);
  const c = Object.values(n.snapshots).filter((m) => m.sessionId === r).filter(
    (m) => (
      // Only include snapshots whose ui_id appears in this response's results
      o.some(
        (p) => p.ui_id === m.uiId && (p.kind === "genui" || p.kind === "genui_patch" && !hs(m.uiId))
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
          a.createElement(os, {
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
            f && us(f, m.uiId).catch((h) => console.warn("[ugsci.genui] PNG export failed", h));
          } }, "PNG"),
          a.createElement("button", { type: "button", title: "打印或另存为 PDF", onClick: (p) => {
            var y;
            const f = (y = p.currentTarget.closest(".qwenpaw-genui-tree")) == null ? void 0 : y.querySelector(".qwenpaw-genui-export-target");
            f && ps(f, m.uiId);
          } }, "PDF")
        )
      )
    )
  );
}
let lt = null;
function vs(e, t) {
  var r, l, o;
  const a = "ugsci";
  lt == null || lt();
  const n = [];
  return se("/ugsci/genui/config", { bypassCache: !0 }).then((i) => {
    e.genui = { ...e.genui || {}, config: i };
  }).catch((i) => console.warn("[ugsci.genui] Failed to load runtime config", i)), (r = e.chat) != null && r.toolRender && (n.push(e.chat.toolRender(a, "emit_ui_tree", Ot)), n.push(e.chat.toolRender(a, "emit_ui_patch", Ot)), n.push(e.chat.toolRender(a, "list_ui_components", Ot)), n.push(e.chat.toolRender(a, "get_genui_guide", Ot)), console.info("[ugsci.genui] Registered 4 tool card renderers")), (o = (l = e.chat) == null ? void 0 : l.response) != null && o.append && (n.push(e.chat.response.append(
    a,
    (i) => t.createElement(Fo, null, t.createElement(Es, { data: i.data })),
    { id: "ugsci.genui.response-append", order: 50 }
  )), console.info("[ugsci.genui] Registered response.append slot")), lt = () => {
    var i;
    for (const s of n.reverse()) (i = s == null ? void 0 : s.dispose) == null || i.call(s);
    Ho(), ls(), lt = null;
  }, lt;
}
function ka(e) {
  const t = window.QwenPaw;
  t && (t.genui = { ...t.genui || {}, config: e });
}
function bs() {
  const e = _().React, { Alert: t, Card: a, Space: n, Spin: r, Switch: l, Typography: o, message: i } = _().antd, { useEffect: s, useState: c } = e, [d, u] = c(null), [m, p] = c(!1);
  s(() => {
    let y = !0;
    return se("/ugsci/genui/config").then((h) => {
      y && (u(h), ka(h));
    }).catch((h) => i.error(`读取 GenUI 设置失败：${String(h)}`)), () => {
      y = !1;
    };
  }, []);
  const f = async (y) => {
    p(!0);
    try {
      const h = await se("/ugsci/genui/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: y })
      });
      u(h), ka(h), i.success(h.overridden ? "设置已保存，但环境变量或插件配置正在覆盖它" : y ? "GenUI 已开启" : "GenUI 已关闭");
    } catch (h) {
      i.error(`保存 GenUI 设置失败：${String(h)}`);
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
            onChange: f
          })
        ),
        e.createElement(t, {
          type: d.enabled ? "success" : "warning",
          showIcon: !0,
          message: d.enabled ? "GenUI 当前有效；各 Agent 仍可显式关闭自己的 GenUI 工具" : d.overridden ? "GenUI 当前被环境变量或插件配置关闭；本地设置已保存但暂不生效。" : "GenUI 已全局关闭；已有界面仍可查看，但 Agent 不会再生成或更新界面。"
        })
      )
    )
  );
}
let yt = null;
function rr() {
  return yt || (yt = (async () => {
    var n;
    const e = (n = window.QwenPaw) == null ? void 0 : n.host;
    if (!(e != null && e.getApiUrl))
      throw new Error("[oilgas-vis] QwenPaw.host.getApiUrl not available");
    const t = e.getApiUrl(
      "frontend_plugin/ugsci/files/ui/dist/viewer-runtime.js"
    );
    console.info("[oilgas-vis] Loading viewer runtime from", t), await new Promise((r, l) => {
      const o = document.createElement("script");
      o.dataset.plugin = "ugsci", o.src = t, o.onload = () => r(), o.onerror = () => l(new Error("Viewer runtime failed to load")), document.head.appendChild(o);
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
function ws() {
  const e = _().React, { useEffect: t, useRef: a, useState: n } = e, { Spin: r, Alert: l, Button: o, Typography: i, message: s } = _().antd, { Text: c } = i, d = a(null), u = a(null), [m, p] = n(!0), [f, y] = n(null);
  return t(() => {
    let h = !1;
    async function C() {
      if (d.current)
        try {
          p(!0), y(null);
          const w = await rr();
          if (h) return;
          const S = _(), R = {
            apiBase: S.getApiUrl("ugsci/visualization"),
            authToken: S.getApiToken() || void 0
          };
          u.current = w.mount(d.current, R), h || p(!1);
        } catch (w) {
          if (!h) {
            const S = w instanceof Error ? w.message : "Failed to load viewer";
            y(S), p(!1), s.error(`可视化引擎加载失败: ${S}`);
          }
        }
    }
    return C(), () => {
      if (h = !0, u.current) {
        try {
          u.current.dispose();
        } catch (w) {
          console.warn("[oilgas-vis] Dispose error:", w);
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
      e.createElement(r, { size: "large" }),
      e.createElement(
        "div",
        { style: { marginTop: 16, color: "#8b949e" } },
        "正在加载三维可视化引擎..."
      )
    )
  );
}
function lr(e, t) {
  var r;
  const a = ((r = e.getApiToken) == null ? void 0 : r.call(e)) || "", n = typeof e.buildAuthHeaders == "function" ? { ...e.buildAuthHeaders(t.agentId) } : a ? { Authorization: `Bearer ${a}` } : {};
  return t.agentId && (n["X-Agent-Id"] = t.agentId), t.chatId && (n["X-Chat-Id"] = t.chatId), !t.chatId && t.projectDirOverride && (n["X-Session-Project-Dir"] = t.projectDirOverride), n;
}
async function or(e, t, a) {
  if (typeof e.fetch == "function")
    return e.fetch(t, a);
  const n = t.replace(/^\/ugsci\/visualization/, "");
  return fetch(`${e.getApiUrl("ugsci/visualization")}${n}`, a);
}
function Ca(e) {
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
function Ss({ jobId: e, file: t }) {
  const a = _().React, { useEffect: n, useRef: r, useState: l } = a, o = _(), i = r(null), s = r(null), [c, d] = l("queued"), [u, m] = l(0), [p, f] = l(null), [y, h] = l(null);
  return n(() => {
    let C = !1;
    return (async () => {
      var A;
      const S = `/ugsci/visualization/imports/${e}`;
      for (let R = 0; R < 240 && !C; R += 1) {
        try {
          const D = await or(o, S, {
            headers: { ...lr(o, t) }
          });
          if (!D.ok) throw new Error(`状态查询失败: HTTP ${D.status}`);
          const G = await D.json();
          if (C) return;
          if (m(Number(G.progress || 0)), d(G.status), G.status === "completed") {
            if (!((A = G.result) != null && A.id)) throw new Error("导入完成但未返回数据集 ID");
            h(G.result.id);
            return;
          }
          if (G.status === "failed" || G.status === "cancelled") {
            f(G.error || Ca(G.status));
            return;
          }
        } catch (D) {
          if (R >= 239 && !C) {
            d("failed"), f(D instanceof Error ? D.message : String(D));
            return;
          }
        }
        await new Promise((D) => setTimeout(D, 750));
      }
    })(), () => {
      C = !0;
    };
  }, [e, t.agentId, t.chatId, t.projectDirOverride]), n(() => {
    if (c !== "completed" || !y || !i.current) return;
    let C = !1;
    return (async () => {
      var w, S;
      try {
        const A = await rr();
        if (C || !i.current) return;
        s.current = A.mount(i.current, {
          apiBase: o.getApiUrl("ugsci/visualization"),
          authToken: o.getApiToken() || void 0
        });
        let R;
        for (let D = 0; D < 20 && !C; D += 1)
          try {
            await ((S = (w = s.current).executeCommand) == null ? void 0 : S.call(w, "open", { datasetId: y })), R = void 0;
            break;
          } catch (G) {
            R = G;
            const N = G instanceof Error ? G.message : String(G);
            if (!N.includes("数据集不存在") && !N.includes("dataset"))
              throw G;
            await new Promise((B) => setTimeout(B, 250));
          }
        if (R && !C) throw R;
      } catch (A) {
        C || (d("failed"), f(A instanceof Error ? A.message : String(A)));
      }
    })(), () => {
      var w;
      C = !0;
      try {
        (w = s.current) == null || w.dispose();
      } catch {
      }
      s.current = null;
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
      `${Ca(c)}${u > 0 ? `（${Math.round(u * 100)}%）` : ""}`
    ),
    p ? a.createElement(
      "div",
      { style: { marginTop: 6, color: "#ff7875", fontSize: 12 } },
      `预览状态：${p}`
    ) : null
  );
}
function xs(e) {
  const t = _().React, { useEffect: a, useState: n } = t, { Button: r, Spin: l, Alert: o, Typography: i } = _().antd, { Text: s } = i, c = e.artifact || e.file || {}, d = c.filename || c.title || e.filename || "unknown", u = c.workspacePath || c.path || e.workspacePath, [m, p] = n("idle"), [f, y] = n(null), [h, C] = n(null);
  return a(() => {
    if (!u) return;
    let w = !1;
    return p("submitting"), y(null), C(null), (async () => {
      try {
        const S = _(), A = await or(S, "/ugsci/visualization/imports/workspace", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...lr(S, c)
          },
          body: JSON.stringify({
            path: u,
            root: c.workspaceRoot || "project",
            name: d.replace(/\.[^.]+$/, "")
          })
        });
        if (!A.ok) throw new Error(`Import failed: HTTP ${A.status}`);
        const R = await A.json();
        w || (y(R.job_id), p("submitted"));
      } catch (S) {
        w || (C(S instanceof Error ? S.message : String(S)), p("failed"));
      }
    })(), () => {
      w = !0;
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
    t.createElement(s, { strong: !0 }, `文件: ${d}`),
    c.size ? t.createElement(s, { type: "secondary" }, `大小: ${(c.size / 1024 / 1024).toFixed(1)} MB`) : null,
    f ? t.createElement(Ss, { jobId: f, file: c }) : t.createElement(s, { type: "secondary" }, "正在准备导入任务..."),
    t.createElement(r, {
      type: "primary",
      onClick: () => {
        window.history.pushState({}, "", "/oilgas-visualization"), window.dispatchEvent(new PopStateEvent("popstate"));
      }
    }, "打开油气可视化页面")
  );
}
function ks(e, t) {
  const a = "__ugsciVisualizationFrontendRegistered", n = window;
  if (n[a]) return;
  n[a] = !0;
  const r = _().antdIcons || {}, l = r.GlobalOutlined || r.AppstoreOutlined;
  e.route.add("ugsci", {
    id: "ugsci.visualization",
    path: "/oilgas-visualization",
    component: ws
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
        component: xs,
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
function Cs() {
  var c, d, u;
  const e = window.QwenPaw;
  if (!(e != null && e.menu) || !(e != null && e.route)) {
    console.warn(
      "[ugsci] QwenPaw.menu/route API not available — plugin disabled"
    );
    return;
  }
  const t = _().React, a = "ugsci";
  (d = (c = e.chat) == null ? void 0 : c.rightHeader) != null && d.add ? (e.chat.rightHeader.add(a, t.createElement(Uo), {
    id: "ugsci.welcome-injector",
    order: -1
    // render before other right-header items (invisible anyway)
  }), console.info("[ugsci] WelcomePromptsInjector registered via rightHeader")) : console.warn(
    "[ugsci] QP.chat.rightHeader.add not available — agent-specific welcome prompts disabled"
  );
  const n = _().antdIcons || {}, r = n.UserSwitchOutlined, l = n.ToolOutlined, o = n.ShopOutlined, i = n.AppstoreOutlined;
  e.route.add(a, {
    id: "ugsci.experts",
    path: "/ugsci-experts",
    component: Dl
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
    component: bs
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
    component: Wa
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
    component: fo
  }), e.route.add(a, {
    id: "ugsci.skills-center",
    path: "/ugsci-skills",
    component: yo
  }), e.route.add(a, {
    id: "ugsci.market",
    path: "/ugsci-market",
    component: Lo
  }), e.menu.add(a, {
    id: "ugsci.market",
    location: "primary.agentScoped",
    label: () => "市场",
    icon: o ? t.createElement(o, { style: { fontSize: 16 } }) : void 0,
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
  const s = [
    "core.skills",
    "core.tools",
    "core.acp",
    "core.agent-config",
    "core.agent-stats",
    "core.skill-pool"
  ];
  for (const m of s) {
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
  vs(e, t), ks(e, t), console.info(
    "[ugsci] Plugin registered: unified Tools & Skills center + compatibility routes, simple-mode navigation active"
  );
}
function pn() {
  try {
    Cs();
  } catch (e) {
    console.error("[ugsci] Failed to build plugin:", e), setTimeout(pn, 500);
  }
}
var Ta;
if ((Ta = window.QwenPaw) != null && Ta.host)
  pn();
else {
  const e = setInterval(() => {
    var t;
    (t = window.QwenPaw) != null && t.host && (clearInterval(e), pn());
  }, 200);
  setTimeout(() => clearInterval(e), 1e4);
}
