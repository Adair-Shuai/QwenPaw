function k() {
  var t;
  const e = (t = window.QwenPaw) == null ? void 0 : t.host;
  if (!e) throw new Error("[ugsci] QwenPaw.host not available");
  return e;
}
function go() {
  try {
    return k().getApiToken() || "";
  } catch {
    return "";
  }
}
function hn(e) {
  return k().getApiUrl(e);
}
function yo(e) {
  const t = go();
  return {
    "Content-Type": "application/json",
    ...t ? { Authorization: `Bearer ${t}` } : {},
    ...e
  };
}
function ho(e) {
  const t = new Headers(e), n = {};
  return t.forEach((r, a) => {
    n[a] = r;
  }), n;
}
function et(e, t) {
  const n = k(), r = ho(t == null ? void 0 : t.headers);
  return n.fetch ? n.fetch(e, { ...t, headers: r }) : fetch(n.getApiUrl(e), {
    ...t,
    headers: { ...yo(), ...r }
  });
}
const Mt = /* @__PURE__ */ new Map(), Eo = 15e3;
function bo(e) {
  return e ? e instanceof Headers ? e.get("X-Agent-Id") || e.get("x-agent-id") || "" : e["X-Agent-Id"] || e["x-agent-id"] || "" : "";
}
function vo(e, t, n) {
  return `${e}:${t}:${n}`;
}
function Dt() {
  Mt.clear();
}
function Zn(e) {
  for (const [t, n] of Mt)
    (e ? n.agentId === e : n.agentId) && Mt.delete(t);
}
async function de(e, t) {
  const n = ((t == null ? void 0 : t.method) || "GET").toUpperCase(), { bypassCache: r, ...a } = t || {}, l = bo(
    a.headers
  ), o = vo(n, e, l);
  if (n !== "GET" && (l ? Zn(l) : Dt()), n === "GET" && !r) {
    const d = Mt.get(o);
    if (d && Date.now() - d.ts < Eo)
      return d.data;
  }
  const s = await et(e, a);
  if (!s.ok) {
    const d = await s.text().catch(() => "");
    throw new Error(d || `HTTP ${s.status}`);
  }
  if (s.status === 204) return null;
  const i = await s.json();
  return n === "GET" && Mt.set(o, {
    data: i,
    ts: Date.now(),
    agentId: l || void 0
  }), i;
}
const De = {
  background: "#0072f5",
  color: "#fff",
  fontSize: 13,
  fontWeight: 600,
  border: "none",
  borderRadius: 8
};
function Kt() {
  try {
    return localStorage.getItem("qwenpaw_sidebar_mode") === "simple";
  } catch {
    return !1;
  }
}
function er(e, t) {
  const n = k();
  return n.ReactMarkdown && n.remarkGfm ? t.createElement(
    n.ReactMarkdown,
    { remarkPlugins: [n.remarkGfm] },
    e
  ) : e.replace(/\*\*(.+?)\*\*/g, "$1").replace(/\*(.+?)\*/g, "$1").replace(/`(.+?)`/g, "$1").replace(/^#+\s*/gm, "").replace(/^[-*]\s+/gm, "• ");
}
function En({
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
async function bn() {
  const e = await de("/agents");
  return (e == null ? void 0 : e.agents) || [];
}
async function tr(e) {
  return de(
    `/agents/${encodeURIComponent(e)}`
  );
}
async function vn(e) {
  return await de(
    `/agents/${encodeURIComponent(e)}/skills`
  ) || [];
}
async function wn(e = !1) {
  return await de(`/skills/pool${e ? "?summary=true" : ""}`) || [];
}
async function wo(e) {
  const t = await de(
    `/skills/pool/${encodeURIComponent(e)}/content`
  );
  return (t == null ? void 0 : t.content) || "";
}
async function So() {
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
function St(e, t = "") {
  return `/agents/${encodeURIComponent(e)}/skills${t}`;
}
function Fa(e) {
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
async function xo(e) {
  return await de("/workspace/files", {
    headers: { "X-Agent-Id": e }
  }) || [];
}
async function cn(e, t, n) {
  return de(`/workspace/files/${encodeURIComponent(t)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify({ content: n })
  });
}
async function ko(e, t, n, r) {
  return de("/workspace/prompt-files", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify({ filename: t, content: n, enable: r })
  });
}
const Co = /* @__PURE__ */ new Set([
  "CON",
  "PRN",
  "AUX",
  "NUL",
  ...Array.from({ length: 9 }, (e, t) => `COM${t + 1}`),
  ...Array.from({ length: 9 }, (e, t) => `LPT${t + 1}`)
]);
function To(e) {
  let t = e.trim();
  if (!t) throw new Error("请输入文件名");
  if (/[\\/]/.test(t)) throw new Error("文件名不能包含路径分隔符");
  if (/[<>:\"|?*\u0000-\u001f]/.test(t))
    throw new Error("文件名包含系统不支持的字符");
  if (/[ .]$/.test(t)) throw new Error("文件名不能以空格或句点结尾");
  t.toLowerCase().endsWith(".md") ? t = `${t.slice(0, -3)}.md` : t += ".md";
  const n = t.split(".", 1)[0].toUpperCase();
  if (!t.slice(0, -3)) throw new Error("文件名不能为空");
  if (Co.has(n))
    throw new Error("该文件名是系统保留名称，请更换");
  if (new TextEncoder().encode(t).length > 255)
    throw new Error("文件名过长");
  return t;
}
async function _o(e, t) {
  const n = await tr(e);
  n.system_prompt_files = t, await de(`/agents/${encodeURIComponent(e)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(n)
  });
}
async function nr(e, t) {
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
async function Ga(e, t) {
  await de(
    St(e, `/${encodeURIComponent(t)}/enable`),
    {
      method: "POST"
    }
  );
}
async function rr(e, t) {
  await de(St(e, `/${encodeURIComponent(t)}`), {
    method: "DELETE"
  });
}
async function Io(e, t) {
  return de(St(e, "/batch-enable"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(t)
  });
}
async function Ao(e, t) {
  return de(St(e, "/batch-disable"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(t)
  });
}
async function zo(e, t) {
  return de(St(e, "/batch-delete"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(t)
  });
}
async function ar(e) {
  return await de("/mcp", {
    headers: { "X-Agent-Id": e }
  }) || [];
}
async function Ha(e, t) {
  await de(`/mcp/${encodeURIComponent(t)}`, {
    method: "DELETE",
    headers: { "X-Agent-Id": e }
  });
}
async function lr(e, t) {
  return de("/mcp", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify(t)
  });
}
async function $o(e, t) {
  return de(
    `/mcp/toggle/${encodeURIComponent(t)}`,
    {
      method: "PATCH",
      headers: { "X-Agent-Id": e }
    }
  );
}
async function Wa(e, t) {
  await de(
    St(e, `/${encodeURIComponent(t)}/disable`),
    {
      method: "POST"
    }
  );
}
async function Po(e) {
  await de(`/skills/pool/${encodeURIComponent(e)}`, {
    method: "DELETE"
  });
}
function Ro(e) {
  const t = (e || "").trim();
  if (!t) return { number: 6, unit: "h" };
  const n = t.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/i);
  if (!n) return { number: 6, unit: "h" };
  const r = parseInt(n[1] || "0", 10), a = parseInt(n[2] || "0", 10), l = parseInt(n[3] || "0", 10), o = r * 60 + a + Math.round(l / 60);
  return o <= 0 ? { number: 6, unit: "h" } : o >= 60 && o % 60 === 0 ? { number: o / 60, unit: "h" } : { number: o, unit: "m" };
}
function Oo(e) {
  return e.unit === "h" ? `${e.number}h` : `${e.number}m`;
}
async function Mo(e) {
  return de("/config/heartbeat", {
    headers: { "X-Agent-Id": e }
  });
}
async function Lo(e, t) {
  return de("/config/heartbeat", {
    method: "PUT",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify(t)
  });
}
async function Bo(e) {
  await de("/config/heartbeat/run", {
    method: "POST",
    headers: { "X-Agent-Id": e }
  });
}
async function Uo(e) {
  return de("/workspace/running-config", {
    headers: { "X-Agent-Id": e }
  });
}
async function jo(e, t) {
  return de("/workspace/running-config", {
    method: "PUT",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify(t)
  });
}
async function No(e) {
  return (await de("/workspace/language", {
    headers: { "X-Agent-Id": e }
  })).language || "zh";
}
async function Do(e, t) {
  await de("/workspace/language", {
    method: "PUT",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify({ language: t })
  });
}
async function Fo() {
  return (await de("/config/user-timezone")).timezone || "UTC";
}
async function Go(e) {
  await de("/config/user-timezone", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ timezone: e })
  });
}
async function Ho(e) {
  return await de("/workspace/system-prompt-files", {
    headers: { "X-Agent-Id": e }
  }) || [];
}
const Hr = ["AGENTS.md", "SOUL.md", "PROFILE.md"];
function Wo({
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
function Va({
  open: e,
  onClose: t,
  poolSkills: n,
  installedSkillNames: r,
  loading: a,
  onInstall: l
}) {
  const o = k().React, { useState: s, useEffect: i, useMemo: d } = o, { Modal: c, Button: m, Empty: u, Spin: p, Input: w, Tag: y, Tooltip: g, Typography: f } = k().antd, { CheckOutlined: v, SearchOutlined: E } = k().antdIcons || {}, { Text: h } = f, [S, O] = s([]), [D, $] = s("");
  i(() => {
    e && (O([]), $(""));
  }, [e]);
  const A = d(() => {
    if (!D.trim()) return n;
    const C = D.toLowerCase();
    return n.filter(
      (x) => {
        var z, I;
        return x.name.toLowerCase().includes(C) || ((z = x.description) == null ? void 0 : z.toLowerCase().includes(C)) || ((I = x.tags) == null ? void 0 : I.some((W) => W.toLowerCase().includes(C)));
      }
    );
  }, [n, D]), F = A.filter(
    (C) => !r.includes(C.name)
  ), V = (C) => {
    O(
      (x) => x.includes(C) ? x.filter((z) => z !== C) : [...x, C]
    );
  }, U = async () => {
    S.length !== 0 && (await l(S), O([]));
  };
  return o.createElement(
    c,
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
          h,
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
              onClick: U,
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
        prefix: E ? o.createElement(E) : void 0,
        value: D,
        onChange: (C) => $(C.target.value),
        allowClear: !0,
        style: { flex: 1 }
      }),
      o.createElement(
        m,
        {
          size: "small",
          type: "primary",
          onClick: () => O(F.map((C) => C.name))
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
      o.createElement(p, { size: "large" })
    ) : A.length === 0 ? o.createElement(u, {
      description: D ? "未找到匹配的技能" : "技能池暂无可用技能",
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
      ...A.map((C) => {
        const x = S.includes(C.name), z = r.includes(C.name);
        return o.createElement(
          "div",
          {
            key: C.name,
            onClick: () => !z && V(C.name),
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
            v ? o.createElement(v) : "✓"
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
              g,
              { title: C.name },
              o.createElement(
                h,
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
              (I, W) => o.createElement(
                y,
                {
                  key: W,
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
function qa({
  agentId: e,
  systemPromptFiles: t,
  onRefresh: n
}) {
  const r = k().React, { useState: a, useEffect: l, useCallback: o, useRef: s } = r, {
    List: i,
    Tag: d,
    Switch: c,
    Button: m,
    Modal: u,
    Input: p,
    Spin: w,
    Empty: y,
    message: g,
    Typography: f,
    Segmented: v,
    Alert: E
  } = k().antd, { FileTextOutlined: h, PlusOutlined: S, EditOutlined: O, ReloadOutlined: D } = k().antdIcons || {}, { Text: $ } = f, [A, F] = a([]), [V, U] = a(!0), [C, x] = a(
    t || []
  ), [z, I] = a(!1), [W, j] = a(null), [G, R] = a(""), [P, ee] = a(""), [oe, B] = a(!1), [L, le] = a("source"), re = s(0), J = o(async () => {
    const Z = ++re.current;
    U(!0);
    try {
      const se = await xo(e);
      Z === re.current && F(se);
    } catch (se) {
      Z === re.current && (g.error(se.message || "加载工作区文档失败"), F([]));
    } finally {
      Z === re.current && U(!1);
    }
  }, [e]);
  l(() => {
    J();
  }, [J]), l(() => {
    x(t || []);
  }, [t]);
  const me = async (Z, se) => {
    const te = new Set(C);
    if (se)
      te.add(Z);
    else {
      if (Hr.includes(Z) && Z === "AGENTS.md") {
        g.warning("AGENTS.md 是核心文件，不能停用");
        return;
      }
      te.delete(Z);
    }
    const be = Array.from(te);
    x(be);
    try {
      await _o(e, be), g.success(se ? "已启用记忆文件" : "已停用记忆文件"), n();
    } catch (ve) {
      g.error(ve.message || "更新失败"), x(t || []);
    }
  }, M = async (Z) => {
    try {
      const se = await de(
        `/workspace/files/${encodeURIComponent(Z)}`,
        { headers: { "X-Agent-Id": e } }
      );
      j(Z), R(se.content || ""), le("source"), I(!0);
    } catch (se) {
      g.error(se.message || "读取文件失败");
    }
  }, ce = () => {
    j(null), R(""), ee(""), le("source"), I(!0);
  }, ye = async () => {
    let Z;
    try {
      Z = To(W || P);
    } catch (se) {
      g.warning(se.message || "文件名无效");
      return;
    }
    if (!G.trim()) {
      g.warning("Markdown 文档不能为空");
      return;
    }
    if (new TextEncoder().encode(G).length > 1024 * 1024) {
      g.warning("Markdown 文档不能超过 1 MB");
      return;
    }
    B(!0);
    try {
      if (W)
        await cn(e, Z, G);
      else {
        const se = await ko(
          e,
          Z,
          G,
          !0
        );
        x(se.system_prompt_files);
      }
      g.success("保存成功"), I(!1), J(), n();
    } catch (se) {
      const te = se != null && se.message ? `：${se.message}` : "";
      g.error(
        W ? (se == null ? void 0 : se.message) || "保存失败" : `创建并挂载失败，服务端已回滚文件${te}`
      );
    } finally {
      B(!1);
    }
  };
  return V ? r.createElement(
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
        h ? r.createElement(h, {
          style: { fontSize: 14, color: "#1677ff" }
        }) : null,
        r.createElement(
          $,
          { strong: !0 },
          `工作区文档 (${A.length})`
        ),
        r.createElement(
          $,
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
            icon: D ? r.createElement(D) : void 0,
            onClick: J
          },
          "刷新"
        ),
        r.createElement(
          m,
          {
            type: "primary",
            size: "small",
            icon: S ? r.createElement(S) : void 0,
            onClick: ce
          },
          "新建 Markdown 文档"
        )
      )
    ),
    A.length === 0 ? r.createElement(y, {
      description: "暂无 Markdown 文档，点击「新建 Markdown 文档」添加",
      image: y.PRESENTED_IMAGE_SIMPLE
    }) : r.createElement(i, {
      dataSource: A,
      renderItem: (Z) => {
        const se = C.includes(Z.filename), te = Hr.includes(Z.filename);
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
                  onClick: () => M(Z.filename)
                },
                "编辑"
              )
            ]
          },
          r.createElement(i.Item.Meta, {
            avatar: r.createElement(h, {
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
              r.createElement($, null, Z.filename),
              te ? r.createElement(
                d,
                { color: "default", style: { fontSize: 10 } },
                "内置"
              ) : r.createElement(
                d,
                { color: "cyan", style: { fontSize: 10 } },
                "工作文档"
              )
            ),
            description: r.createElement(
              "div",
              { style: { fontSize: 12 } },
              `${(Z.size / 1024).toFixed(1)} KB · 修改于 ${new Date(Z.modified_time).toLocaleString()}`
            )
          }),
          r.createElement(c, {
            checked: se,
            size: "small",
            onChange: (be) => me(Z.filename, be)
          })
        );
      }
    }),
    // Edit/New file modal
    r.createElement(
      u,
      {
        open: z,
        onCancel: () => I(!1),
        title: W ? `编辑 ${W}` : "新建 Markdown 文档",
        width: 700,
        onOk: ye,
        confirmLoading: oe,
        okText: "保存"
      },
      W ? null : r.createElement(
        "div",
        { style: { marginBottom: 12 } },
        r.createElement(p, {
          placeholder: "文件名（如：油藏工程记忆库.md）",
          value: P,
          onChange: (Z) => ee(Z.target.value),
          addonAfter: P.endsWith(".md") ? "" : ".md"
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
        r.createElement(v, {
          size: "small",
          value: L,
          options: [
            { label: "源码", value: "source" },
            { label: "预览", value: "preview" }
          ],
          onChange: (Z) => le(Z)
        }),
        r.createElement(
          $,
          { type: "secondary", style: { fontSize: 12 } },
          `${G.length} 字符 · 约 ${Math.ceil(G.length / 4)} tokens · ${W && C.includes(W) ? "已挂载" : W ? "未挂载" : "保存后自动挂载"}`
        )
      ),
      G.trim() ? null : r.createElement(E, {
        type: "warning",
        showIcon: !0,
        message: "文档内容为空，保存前需要填写 Markdown 内容",
        style: { marginBottom: 10 }
      }),
      L === "source" ? r.createElement(p.TextArea, {
        value: G,
        onChange: (Z) => R(Z.target.value),
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
        er(G, r)
      )
    )
  );
}
function Vo({
  skills: e,
  agentId: t
}) {
  const n = k().React, { useMemo: r } = n, {
    List: a,
    Tag: l,
    Typography: o,
    Empty: s,
    Button: i,
    message: d
  } = k().antd, { ThunderboltOutlined: c, CopyOutlined: m } = k().antdIcons || {}, { Text: u } = o, p = r(() => Fa(e), [e]), w = (g) => {
    try {
      const f = k();
      f.setSelectedAgent && f.setSelectedAgent(t);
    } catch {
    }
    try {
      sessionStorage.setItem("ugsci_pending_prompt", g.value);
    } catch {
    }
    window.history.pushState({}, "", "/chat"), window.dispatchEvent(new PopStateEvent("popstate"));
  }, y = (g) => {
    var f;
    (f = navigator.clipboard) == null || f.writeText(g.value).then(() => {
      d.success("已复制到剪贴板");
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
      c ? n.createElement(c, {
        style: { fontSize: 14, color: "#1677ff" }
      }) : null,
      n.createElement(
        u,
        { strong: !0 },
        `推荐提问 (${p.length})`
      ),
      n.createElement(
        u,
        { type: "secondary", style: { fontSize: 12 } },
        "· 从技能描述中自动提取"
      )
    ),
    n.createElement(a, {
      dataSource: p,
      renderItem: (g, f) => n.createElement(
        a.Item,
        {
          actions: [
            n.createElement(
              i,
              {
                type: "link",
                size: "small",
                icon: m ? n.createElement(m) : void 0,
                onClick: () => y(g)
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
              onClick: () => w(g)
            },
            g.value
          ),
          description: n.createElement(
            u,
            { type: "secondary", style: { fontSize: 12 } },
            g.label
          )
        })
      )
    })
  );
}
const Et = {
  marginBottom: 4,
  fontSize: 13,
  fontWeight: 500,
  color: "rgba(0,0,0,0.85)",
  display: "flex",
  alignItems: "center",
  gap: 4
}, Ja = { marginBottom: 16 }, Ka = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "0 16px",
  marginBottom: 16
}, rt = {
  fontSize: 13,
  fontWeight: 600,
  color: "rgba(0,0,0,0.85)",
  marginBottom: 12,
  paddingBottom: 8,
  borderBottom: "1px solid #f0f0f0"
}, Xa = {
  fontSize: 12,
  color: "rgba(0,0,0,0.45)",
  marginLeft: 8
};
function qo({ agentId: e }) {
  const t = k().React, { useState: n, useEffect: r, useCallback: a } = t, {
    Switch: l,
    InputNumber: o,
    Select: s,
    Button: i,
    Spin: d,
    Space: c,
    Typography: m,
    message: u
  } = k().antd, { PlayCircleOutlined: p, SaveOutlined: w } = k().antdIcons || {}, { Text: y } = m, [g, f] = n(!0), [v, E] = n(!1), [h, S] = n(!1), [O, D] = n(!1), [$, A] = n(6), [F, V] = n("h"), [U, C] = n("main"), [x, z] = n(300), [I, W] = n(!1), [j, G] = n("08:00"), [R, P] = n("22:00"), ee = a(async () => {
    var J, me;
    f(!0);
    try {
      const M = await Mo(e), ce = Ro(M.every ?? "6h");
      D(M.enabled ?? !1), A(ce.number), V(ce.unit), C(M.target ?? "main"), z(M.timeoutSeconds ?? 300), W(!!M.activeHours), G(((J = M.activeHours) == null ? void 0 : J.start) ?? "08:00"), P(((me = M.activeHours) == null ? void 0 : me.end) ?? "22:00");
    } catch (M) {
      u.error(M.message || "加载心跳配置失败");
    } finally {
      f(!1);
    }
  }, [e]);
  r(() => {
    ee();
  }, [ee]);
  const oe = async () => {
    E(!0);
    try {
      await Lo(e, {
        enabled: O,
        every: Oo({ number: $, unit: F }),
        target: U,
        timeoutSeconds: x,
        activeHours: I && j && R ? { start: j, end: R } : void 0
      }), u.success("心跳配置已保存");
    } catch (J) {
      u.error(J.message || "保存心跳配置失败");
    } finally {
      E(!1);
    }
  }, B = async () => {
    S(!0);
    try {
      await Bo(e), u.success("已触发心跳检查");
    } catch (J) {
      u.error(J.message || "触发心跳失败");
    } finally {
      S(!1);
    }
  };
  if (g)
    return t.createElement(
      "div",
      { style: { textAlign: "center", padding: 40 } },
      t.createElement(d, { size: "large" })
    );
  const L = (J, me, M) => t.createElement(
    "div",
    { style: Ja },
    t.createElement("div", { style: Et }, J),
    me,
    M ? t.createElement(
      y,
      { type: "secondary", style: Xa },
      M
    ) : null
  ), le = (J, me, M, ce) => t.createElement(
    "div",
    { style: Ka },
    t.createElement(
      "div",
      null,
      t.createElement("div", { style: Et }, J),
      me
    ),
    t.createElement(
      "div",
      null,
      t.createElement("div", { style: Et }, M),
      ce
    )
  ), { Divider: re } = k().antd;
  return t.createElement(
    "div",
    { style: { paddingBottom: 8 } },
    // ── Section: 基本设置 ──
    t.createElement("div", { style: rt }, "基本设置"),
    L(
      "启用心跳",
      t.createElement(l, {
        checked: O,
        onChange: (J) => D(J)
      }),
      O ? "已启用，专家将定期自检" : "已停用"
    ),
    le(
      "检查频率",
      t.createElement(
        c,
        null,
        t.createElement(o, {
          min: 1,
          value: $,
          onChange: (J) => A(J ?? 1),
          style: { width: "100%" }
        }),
        t.createElement(s, {
          value: F,
          onChange: (J) => V(J),
          style: { width: 90 },
          options: [
            { value: "m", label: "分钟" },
            { value: "h", label: "小时" }
          ]
        })
      ),
      "心跳目标",
      t.createElement(s, {
        value: U,
        onChange: (J) => C(J),
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
      t.createElement(o, {
        min: 1,
        max: 3600,
        value: x,
        onChange: (J) => z(J ?? 300),
        style: { width: 200 }
      })
    ),
    // ── Section: 活跃时段 ──
    t.createElement(re, { style: { margin: "8px 0 16px" } }),
    t.createElement("div", { style: rt }, "活跃时段"),
    L(
      "启用活跃时段限制",
      t.createElement(l, {
        checked: I,
        onChange: (J) => W(J)
      }),
      "仅在指定时段内触发心跳"
    ),
    I ? le(
      "开始时间",
      t.createElement("input", {
        type: "time",
        value: j,
        onChange: (J) => G(J.target.value),
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
        onChange: (J) => P(J.target.value),
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
          loading: v,
          onClick: oe,
          style: De
        },
        "保存配置"
      ),
      t.createElement(
        i,
        {
          icon: p ? t.createElement(p) : void 0,
          loading: h,
          onClick: B
        },
        "立即执行"
      )
    )
  );
}
function Jo({
  agentId: e,
  onRefresh: t
}) {
  const n = k().React, { useState: r, useEffect: a, useCallback: l } = n, {
    List: o,
    Tag: s,
    Switch: i,
    Button: d,
    Empty: c,
    Spin: m,
    Typography: u,
    message: p
  } = k().antd, { PlusOutlined: w, ReloadOutlined: y, DeleteOutlined: g } = k().antdIcons || {}, { Text: f, Paragraph: v } = u, [E, h] = r([]), [S, O] = r(!0), [D, $] = r(!1), [A, F] = r([]), [V, U] = r(!1), C = l(async () => {
    O(!0);
    try {
      const G = await vn(e);
      h(G);
    } catch (G) {
      p.error(G.message || "加载技能失败"), h([]);
    } finally {
      O(!1);
    }
  }, [e]);
  a(() => {
    C();
  }, [C]);
  const x = async () => {
    $(!0), U(!0);
    try {
      const G = await wn(!0);
      F(G);
    } catch (G) {
      p.error(G.message || "加载技能池失败");
    } finally {
      U(!1);
    }
  }, z = async (G) => {
    let R = 0, P = 0;
    for (const ee of G)
      try {
        await nr(e, ee), R++;
      } catch {
        P++;
      }
    R > 0 ? (p.success(
      `成功添加 ${R} 个技能${P > 0 ? `，${P} 个失败` : ""}`
    ), C(), t()) : P > 0 && p.error("添加技能失败"), $(!1);
  }, I = async (G, R) => {
    try {
      R ? await Ga(e, G.name) : await Wa(e, G.name), p.success(R ? "已启用" : "已停用"), C(), t();
    } catch (P) {
      p.error(P.message || "操作失败");
    }
  }, W = async (G) => {
    try {
      await rr(e, G), p.success(`技能「${G}」已移除`), C(), t();
    } catch (R) {
      p.error(R.message || "移除技能失败");
    }
  };
  if (S)
    return n.createElement(
      "div",
      { style: { textAlign: "center", padding: 40 } },
      n.createElement(m, { size: "large" })
    );
  const j = E.filter((G) => G.enabled !== !1);
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
        `技能列表 (${E.length}，已启用 ${j.length})`
      ),
      n.createElement(
        "div",
        { style: { display: "flex", gap: 8 } },
        n.createElement(
          d,
          {
            size: "small",
            icon: y ? n.createElement(y) : void 0,
            onClick: () => {
              Dt(), C();
            }
          },
          "刷新"
        ),
        n.createElement(
          d,
          {
            type: "primary",
            size: "small",
            icon: w ? n.createElement(w) : void 0,
            onClick: x,
            style: De
          },
          "从技能池添加"
        )
      )
    ),
    E.length === 0 ? n.createElement(c, {
      description: "该专家暂无技能",
      image: c.PRESENTED_IMAGE_SIMPLE
    }) : n.createElement(o, {
      dataSource: E,
      renderItem: (G) => n.createElement(
        o.Item,
        {
          actions: [
            n.createElement(i, {
              key: "toggle",
              size: "small",
              checked: G.enabled !== !1,
              onChange: (R) => I(G, R)
            }),
            n.createElement(
              d,
              {
                key: "del",
                type: "link",
                size: "small",
                danger: !0,
                icon: g ? n.createElement(g) : void 0,
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
            v,
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
    n.createElement(Va, {
      open: D,
      onClose: () => $(!1),
      poolSkills: A,
      installedSkillNames: E.map((G) => G.name),
      loading: V,
      onInstall: z
    })
  );
}
function Ko({
  agentId: e,
  onRefresh: t,
  isActive: n
}) {
  const r = k().React, { useState: a, useEffect: l, useCallback: o } = r, {
    List: s,
    Tag: i,
    Button: d,
    Empty: c,
    Spin: m,
    Modal: u,
    Input: p,
    Typography: w,
    message: y
  } = k().antd, { PlusOutlined: g, ReloadOutlined: f, DeleteOutlined: v } = k().antdIcons || {}, { Text: E, Paragraph: h } = w, { TextArea: S } = p, [O, D] = a([]), [$, A] = a(!0), [F, V] = a(!1), [U, C] = a(`{
  "mcpServers": {
    "example-client": {
      "command": "npx",
      "args": ["-y", "@example/mcp-server"],
      "env": {}
    }
  }
}`), [x, z] = a(!1), I = o(async () => {
    A(!0);
    try {
      const R = await ar(e);
      D(R);
    } catch (R) {
      y.error(R.message || "加载 MCP 失败"), D([]);
    } finally {
      A(!1);
    }
  }, [e]);
  l(() => {
    I();
  }, [I]), l(() => {
    n && I();
  }, [n, I]);
  const W = async (R) => {
    try {
      await $o(e, R), y.success("已切换 MCP 状态"), I(), t();
    } catch (P) {
      y.error(P.message || "切换失败");
    }
  }, j = async (R) => {
    try {
      await Ha(e, R), y.success(`MCP「${R}」已移除`), I(), t();
    } catch (P) {
      y.error(P.message || "移除 MCP 失败");
    }
  }, G = async () => {
    z(!0);
    try {
      const R = JSON.parse(U), P = R.mcpServers || R, ee = Object.entries(P);
      if (ee.length === 0) {
        y.warning("未找到 MCP 客户端配置");
        return;
      }
      for (const [oe, B] of ee) {
        const L = B, le = L.url ? "streamable_http" : "stdio";
        await lr(e, {
          client_key: oe,
          client: {
            name: L.name || oe,
            description: L.description || "",
            enabled: !0,
            transport: le,
            url: L.url || "",
            command: L.command || "",
            args: L.args || [],
            env: L.env || {},
            cwd: L.cwd || "",
            headers: L.headers || {}
          }
        });
      }
      y.success("MCP 客户端已创建"), V(!1), I(), t();
    } catch (R) {
      R instanceof SyntaxError ? y.error("JSON 格式错误：" + R.message) : y.error(R.message || "创建 MCP 失败");
    } finally {
      z(!1);
    }
  };
  return $ ? r.createElement(
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
      r.createElement(E, { strong: !0 }, `MCP 客户端 (${O.length})`),
      r.createElement(
        "div",
        { style: { display: "flex", gap: 8 } },
        r.createElement(
          d,
          {
            size: "small",
            icon: f ? r.createElement(f) : void 0,
            onClick: () => {
              Dt(), I();
            }
          },
          "刷新"
        ),
        r.createElement(
          d,
          {
            type: "primary",
            size: "small",
            icon: g ? r.createElement(g) : void 0,
            onClick: () => V(!0),
            style: De
          },
          "添加 MCP"
        )
      )
    ),
    O.length === 0 ? r.createElement(c, {
      description: "该专家暂无 MCP 客户端",
      image: c.PRESENTED_IMAGE_SIMPLE
    }) : r.createElement(s, {
      dataSource: O,
      renderItem: (R) => r.createElement(
        s.Item,
        {
          actions: [
            r.createElement(
              d,
              {
                key: "toggle",
                size: "small",
                onClick: () => W(R.key)
              },
              R.enabled ? "停用" : "启用"
            ),
            r.createElement(
              d,
              {
                key: "del",
                type: "link",
                size: "small",
                danger: !0,
                icon: v ? r.createElement(v) : void 0,
                onClick: () => j(R.key)
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
            r.createElement(E, { strong: !0 }, R.name || R.key),
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
            h,
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
        open: F,
        title: "添加 MCP 客户端 (JSON)",
        onCancel: () => V(!1),
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
        value: U,
        onChange: (R) => C(R.target.value),
        rows: 12,
        style: { fontFamily: "monospace", fontSize: 12 }
      })
    )
  );
}
function Xo({ agentId: e }) {
  const t = k().React, { useState: n, useEffect: r, useCallback: a, useRef: l } = t, {
    Card: o,
    InputNumber: s,
    Input: i,
    Select: d,
    Switch: c,
    Button: m,
    Spin: u,
    Space: p,
    Typography: w,
    Divider: y,
    message: g
  } = k().antd, { SaveOutlined: f } = k().antdIcons || {}, { Text: v } = w, [E, h] = n(!0), [S, O] = n(!1), D = l(null), [$, A] = n(60), [F, V] = n(""), [U, C] = n(!0), [x, z] = n(30), [I, W] = n("zh"), [j, G] = n("UTC"), [R, P] = n(!0), [ee, oe] = n(100), [B, L] = n(!0), [le, re] = n(3), [J, me] = n(1), [M, ce] = n(!0), [ye, Z] = n(3), [se, te] = n(2), [be, ve] = n(60), [$e, Se] = n(1), [ne, we] = n(0), [Ce, K] = n(1), [ue, he] = n(0), [H, T] = n(30), [pe, X] = n(50), [_, ae] = n("light"), [fe, _e] = n("scroll"), [Be, qe] = n("remelight"), [Je, Ue] = n("AUTO"), it = a(async () => {
    var ie, Pe, ze, Le, Qe, Ze;
    h(!0);
    try {
      const [Ie, Ft, Gt] = await Promise.all([
        Uo(e),
        No(e).catch(() => "zh"),
        Fo().catch(() => "UTC")
      ]);
      D.current = Ie, A(Ie.shell_command_timeout ?? 60), V(Ie.shell_command_executable ?? "");
      const Ht = Ie.auto_title_config ?? { enabled: !0, timeout_seconds: 30 };
      C(Ht.enabled ?? !0), z(Ht.timeout_seconds ?? 30), W(Ft), G(Gt);
      const tt = Ie.loop ?? {};
      P(((ie = tt.iteration) == null ? void 0 : ie.enabled) ?? !0), oe(((Pe = tt.iteration) == null ? void 0 : Pe.max_iterations) ?? Ie.max_iters ?? 100), L(((ze = tt.doom_loop) == null ? void 0 : ze.enabled) ?? !0), re(((Le = tt.doom_loop) == null ? void 0 : Le.window_size) ?? 3), me(((Qe = tt.doom_loop) == null ? void 0 : Qe.similarity_threshold) ?? 1), ce(Ie.llm_retry_enabled ?? !0), Z(Ie.llm_max_retries ?? 3), te(Ie.llm_backoff_base ?? 2), ve(Ie.llm_backoff_cap ?? 60), Se(Ie.llm_max_concurrent ?? 1), we(Ie.llm_max_qpm ?? 0), K(Ie.llm_rate_limit_pause ?? 1), he(Ie.llm_rate_limit_jitter ?? 0), T(Ie.llm_acquire_timeout ?? 30), X(Ie.history_max_length ?? 50), ae(Ie.context_manager_backend ?? "light"), _e(((Ze = Ie.light_context_config) == null ? void 0 : Ze.strategy) ?? "scroll"), qe(Ie.memory_manager_backend ?? "remelight"), Ue(Ie.approval_level ?? "AUTO");
    } catch (Ie) {
      g.error(Ie.message || "加载运行配置失败");
    } finally {
      h(!1);
    }
  }, [e]);
  r(() => {
    it();
  }, [it]);
  const Xe = async () => {
    var Pe, ze;
    const ie = D.current;
    if (ie) {
      O(!0);
      try {
        const Le = {
          ...ie,
          max_iters: ee,
          loop: {
            ...ie.loop ?? {},
            iteration: { enabled: R, max_iterations: ee },
            doom_loop: {
              enabled: B,
              window_size: le,
              similarity_threshold: J,
              stages: ((ze = (Pe = ie.loop) == null ? void 0 : Pe.doom_loop) == null ? void 0 : ze.stages) ?? []
            }
          },
          shell_command_timeout: $,
          shell_command_executable: F,
          auto_title_config: {
            enabled: U,
            timeout_seconds: x
          },
          llm_retry_enabled: M,
          llm_max_retries: ye,
          llm_backoff_base: se,
          llm_backoff_cap: be,
          llm_max_concurrent: $e,
          llm_max_qpm: ne,
          llm_rate_limit_pause: Ce,
          llm_rate_limit_jitter: ue,
          llm_acquire_timeout: H,
          history_max_length: pe,
          context_manager_backend: _,
          light_context_config: {
            ...ie.light_context_config ?? {},
            strategy: fe
          },
          memory_manager_backend: Be,
          approval_level: Je
        };
        await jo(e, Le), D.current = Le, I && await Do(e, I).catch(() => {
        }), j && await Go(j).catch(() => {
        }), g.success("运行配置已保存");
      } catch (Le) {
        g.error(Le.message || "保存运行配置失败");
      } finally {
        O(!1);
      }
    }
  };
  if (E)
    return t.createElement(
      "div",
      { style: { textAlign: "center", padding: 40 } },
      t.createElement(u, { size: "large" })
    );
  const Me = (ie, Pe, ze) => t.createElement(
    "div",
    { style: Ja },
    t.createElement("div", { style: Et }, ie),
    Pe,
    ze ? t.createElement(
      v,
      { type: "secondary", style: Xa },
      ze
    ) : null
  ), Ae = (ie, Pe, ze, Le) => t.createElement(
    "div",
    { style: Ka },
    t.createElement(
      "div",
      null,
      t.createElement("div", { style: Et }, ie),
      Pe
    ),
    t.createElement(
      "div",
      null,
      t.createElement("div", { style: Et }, ze),
      Le
    )
  );
  return t.createElement(
    "div",
    { style: { paddingBottom: 8 } },
    // ── Section: 基础设置 ──
    t.createElement(
      "div",
      { style: rt },
      "基础设置"
    ),
    Ae(
      "Shell 命令超时 (秒)",
      t.createElement(s, {
        min: 1,
        value: $,
        onChange: (ie) => A(ie ?? 60),
        style: { width: "100%" }
      }),
      "Shell 可执行文件",
      t.createElement(i, {
        value: F,
        onChange: (ie) => V(ie.target.value),
        placeholder: "留空使用系统默认",
        style: { width: "100%" }
      })
    ),
    Ae(
      "语言",
      t.createElement(d, {
        value: I,
        onChange: (ie) => W(ie),
        style: { width: "100%" },
        options: [
          { value: "zh", label: "中文" },
          { value: "en", label: "English" },
          { value: "id", label: "Bahasa Indonesia" },
          { value: "ru", label: "Русский" }
        ]
      }),
      "时区",
      t.createElement(d, {
        value: j,
        onChange: (ie) => G(ie),
        style: { width: "100%" },
        showSearch: !0,
        filterOption: (ie, Pe) => {
          var ze;
          return (((ze = Pe == null ? void 0 : Pe.label) == null ? void 0 : ze.toString()) || "").toLowerCase().includes(ie.toLowerCase());
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
        ].map((ie) => ({ value: ie, label: ie }))
      })
    ),
    Ae(
      "自动生成会话标题",
      t.createElement(p, null, t.createElement(c, {
        checked: U,
        onChange: (ie) => C(ie)
      })),
      "标题生成超时 (秒)",
      t.createElement(s, {
        min: 5,
        value: x,
        onChange: (ie) => z(ie ?? 30),
        style: { width: "100%" },
        disabled: !U
      })
    ),
    // ── Section: 审批级别 ──
    t.createElement(y, { style: { margin: "8px 0 16px" } }),
    t.createElement("div", { style: rt }, "审批级别"),
    Me(
      "工具执行审批",
      t.createElement(d, {
        value: Je,
        onChange: (ie) => Ue(ie),
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
    t.createElement("div", { style: rt }, "迭代与循环"),
    Me(
      "启用迭代限制",
      t.createElement(c, {
        checked: R,
        onChange: (ie) => P(ie)
      }),
      "停止 Agent 前的最大循环轮次"
    ),
    R ? Me(
      "最大迭代次数",
      t.createElement(s, {
        min: 1,
        max: 500,
        value: ee,
        onChange: (ie) => oe(ie ?? 100),
        style: { width: "100%" }
      })
    ) : null,
    Me(
      "启用重复循环保护",
      t.createElement(c, {
        checked: B,
        onChange: (ie) => L(ie)
      }),
      "检测并阻止重复操作循环"
    ),
    B ? Ae(
      "检测窗口大小",
      t.createElement(s, {
        min: 2,
        max: 20,
        value: le,
        onChange: (ie) => re(ie ?? 3),
        style: { width: "100%" }
      }),
      "相似度阈值",
      t.createElement(s, {
        min: 0,
        max: 1,
        step: 0.05,
        value: J,
        onChange: (ie) => me(ie ?? 1),
        style: { width: "100%" }
      })
    ) : null,
    // ── Section: LLM 重试 ──
    t.createElement(y, { style: { margin: "8px 0 16px" } }),
    t.createElement("div", { style: rt }, "LLM 重试"),
    Me(
      "启用 LLM 重试",
      t.createElement(c, {
        checked: M,
        onChange: (ie) => ce(ie)
      })
    ),
    Ae(
      "最大重试次数",
      t.createElement(s, {
        min: 1,
        value: ye,
        onChange: (ie) => Z(ie ?? 3),
        style: { width: "100%" },
        disabled: !M
      }),
      "退避基数 (秒)",
      t.createElement(s, {
        min: 0.1,
        step: 0.1,
        value: se,
        onChange: (ie) => te(ie ?? 2),
        style: { width: "100%" },
        disabled: !M
      })
    ),
    Me(
      "退避上限 (秒)",
      t.createElement(s, {
        min: 0.5,
        step: 0.5,
        value: be,
        onChange: (ie) => ve(ie ?? 60),
        style: { width: 200 },
        disabled: !M
      })
    ),
    // ── Section: LLM 限流 ──
    t.createElement(y, { style: { margin: "8px 0 16px" } }),
    t.createElement("div", { style: rt }, "LLM 限流"),
    Ae(
      "最大并发数",
      t.createElement(s, {
        min: 1,
        value: $e,
        onChange: (ie) => Se(ie ?? 1),
        style: { width: "100%" }
      }),
      "最大 QPM (0=不限)",
      t.createElement(s, {
        min: 0,
        step: 10,
        value: ne,
        onChange: (ie) => we(ie ?? 0),
        style: { width: "100%" }
      })
    ),
    Ae(
      "限流暂停时间 (秒)",
      t.createElement(s, {
        min: 1,
        step: 0.5,
        value: Ce,
        onChange: (ie) => K(ie ?? 1),
        style: { width: "100%" }
      }),
      "限流抖动 (秒)",
      t.createElement(s, {
        min: 0,
        step: 0.5,
        value: ue,
        onChange: (ie) => he(ie ?? 0),
        style: { width: "100%" }
      })
    ),
    Me(
      "获取超时 (秒)",
      t.createElement(s, {
        min: 10,
        step: 10,
        value: H,
        onChange: (ie) => T(ie ?? 30),
        style: { width: 200 }
      }),
      "应大于 限流暂停 + 抖动"
    ),
    // ── Section: 上下文与记忆 ──
    t.createElement(y, { style: { margin: "8px 0 16px" } }),
    t.createElement("div", { style: rt }, "上下文与记忆"),
    Ae(
      "上下文管理后端",
      t.createElement(d, {
        value: _,
        onChange: (ie) => ae(ie),
        style: { width: "100%" },
        options: [{ value: "light", label: "light" }]
      }),
      "上下文策略",
      t.createElement(d, {
        value: fe,
        onChange: (ie) => _e(ie),
        style: { width: "100%" },
        options: [
          { value: "scroll", label: "scroll (滚动窗口)" },
          { value: "native", label: "native (原生)" }
        ]
      })
    ),
    Ae(
      "记忆管理后端",
      t.createElement(d, {
        value: Be,
        onChange: (ie) => qe(ie),
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
        value: pe,
        onChange: (ie) => X(ie ?? 50),
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
          icon: f ? t.createElement(f) : void 0,
          loading: S,
          onClick: Xe,
          style: De
        },
        "保存运行配置"
      )
    )
  );
}
function Yo({
  expert: e,
  open: t,
  onClose: n,
  onRefresh: r
}) {
  const a = k().React, { useState: l, useEffect: o, useCallback: s } = a, { Modal: i, Tabs: d, Spin: c, Typography: m } = k().antd, { SettingOutlined: u } = k().antdIcons || {}, { Text: p } = m, [w, y] = l([]), [g, f] = l(!1), [v, E] = l("heartbeat"), h = s(async () => {
    if (e) {
      f(!0);
      try {
        const $ = await Ho(e.agent.id);
        y($);
      } catch {
        y([]);
      } finally {
        f(!1);
      }
    }
  }, [e]);
  if (o(() => {
    t && e && h();
  }, [t, e, h]), !e) return null;
  const { agent: S } = e, O = () => {
    h(), r();
  }, D = [
    {
      key: "heartbeat",
      label: "心跳",
      children: a.createElement(qo, {
        agentId: S.id
      })
    },
    {
      key: "files",
      label: "文件",
      children: g ? a.createElement(
        "div",
        { style: { textAlign: "center", padding: 40 } },
        a.createElement(c, { size: "large" })
      ) : a.createElement(qa, {
        agentId: S.id,
        systemPromptFiles: w,
        onRefresh: O
      })
    },
    {
      key: "skills",
      label: `技能 (${e.skills.filter(($) => $.enabled !== !1).length})`,
      children: a.createElement(Jo, {
        agentId: S.id,
        onRefresh: r
      })
    },
    {
      key: "mcp",
      label: `MCP (${e.mcps.length})`,
      children: a.createElement(Ko, {
        agentId: S.id,
        onRefresh: r,
        isActive: v === "mcp"
      })
    },
    {
      key: "running",
      label: "运行配置",
      children: a.createElement(Xo, {
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
    a.createElement(d, {
      items: D,
      activeKey: v,
      onChange: ($) => E($),
      size: "small",
      tabBarStyle: { marginBottom: 16 }
    })
  );
}
const Ya = [
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
], Qo = Ya;
function Wr(e) {
  return hn(`/ugsci/avatar/${encodeURIComponent(e)}`);
}
function Vr(e) {
  const t = e.map(encodeURIComponent).join(",");
  return hn(`/ugsci/avatar/team/${t}`);
}
function Ye({
  name: e,
  size: t = 32,
  borderRadius: n = "50%"
}) {
  const r = k().React, [a, l] = r.useState(0), o = a === 0 ? Wr(e) : `${Wr(e)}?_r=${a}`;
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
function or({
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
  const o = e.slice(0, 5), s = a === 0 ? Vr(o) : `${Vr(o)}?_r=${a}`;
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
async function qr(e) {
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
function Zo({
  expert: e,
  onClick: t,
  onSummon: n,
  onConfigure: r
}) {
  var $;
  const a = k().React, { Card: l, Tag: o, Badge: s, Typography: i, Spin: d, Button: c, Tooltip: m } = k().antd, { Text: u } = i, { ThunderboltOutlined: p, SettingOutlined: w } = k().antdIcons || {}, { agent: y, skills: g, mcps: f, loading: v } = e, E = y.enabled, h = g.filter((A) => A.enabled !== !1), S = Ya.find(
    (A) => A.id === y.id || A.name === y.name
  ), O = Array.from(
    new Set(
      ($ = S == null ? void 0 : S.tags) != null && $.length ? S.tags : h.flatMap((A) => A.tags || [])
    )
  ).slice(0, 3), D = (S == null ? void 0 : S.category) || "UGSci 专业专家";
  return a.createElement(
    l,
    {
      hoverable: !0,
      onClick: t,
      size: "small",
      style: {
        cursor: "pointer",
        transition: "all 0.2s ease",
        borderColor: E ? void 0 : "var(--ant-color-border, #d9d9d9)",
        opacity: E ? 1 : 0.7,
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
        a.createElement(Ye, { name: y.name, size: 36 }),
        a.createElement(
          "div",
          null,
          a.createElement(
            u,
            { strong: !0, style: { fontSize: 15 } },
            y.name
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
            D
          )
        )
      ),
      a.createElement(s, {
        status: E ? "success" : "default",
        text: E ? "启用" : "停用"
      })
    ),
    // Keep the card scannable: only surface a few stable capability tags.
    a.createElement(
      "div",
      { style: { minHeight: 30, marginBottom: 10 } },
      O.length > 0 ? a.createElement(Wo, {
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
    v ? a.createElement(d, { size: "small" }) : a.createElement(
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
      `技能 ${h.length}`,
      `MCP ${f.length}`
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
          c,
          {
            type: "text",
            size: "small",
            icon: w ? a.createElement(w, {
              style: { fontSize: 16, color: "var(--ant-color-text-tertiary, #8c8c8c)" }
            }) : void 0,
            onClick: (A) => {
              A.stopPropagation(), r && r();
            }
          }
        )
      ),
      // Summon button (bottom-right)
      a.createElement(
        c,
        {
          type: "primary",
          size: "small",
          icon: p ? a.createElement(p) : void 0,
          disabled: !E,
          onClick: (A) => {
            A.stopPropagation(), n && n();
          },
          style: De
        },
        "召唤专家"
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
  const a = k().React, {
    Drawer: l,
    Descriptions: o,
    Tag: s,
    Typography: i,
    Space: d,
    Button: c,
    Empty: m,
    Tabs: u,
    List: p,
    Spin: w,
    Modal: y,
    message: g
  } = k().antd, { Text: f, Paragraph: v } = i, {
    EditOutlined: E,
    ThunderboltOutlined: h,
    FileTextOutlined: S,
    ToolOutlined: O,
    PlusOutlined: D
  } = k().antdIcons || {}, [$, A] = a.useState(!1), [F, V] = a.useState(
    []
  ), [U, C] = a.useState(!1);
  if (!e) return null;
  const { agent: x, config: z, skills: I, mcps: W, loading: j } = e, G = I.filter((M) => M.enabled !== !1), R = (M) => {
    window.history.pushState({}, "", M), window.dispatchEvent(new PopStateEvent("popstate"));
  }, P = a.createElement(
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
        x.description ? er(x.description, a) : "暂无描述"
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
        a.createElement(f, { strong: !0 }, "系统提示词文件")
      ),
      a.createElement(
        d,
        { wrap: !0 },
        ...z.system_prompt_files.map(
          (M, ce) => a.createElement(
            s,
            {
              key: ce,
              icon: S ? a.createElement(S) : void 0,
              style: { fontSize: 12 }
            },
            M
          )
        )
      )
    ) : null
  ), ee = async () => {
    A(!0), C(!0);
    try {
      const M = await wn(!0);
      V(M);
    } catch (M) {
      g.error(M.message || "加载技能池失败");
    } finally {
      C(!1);
    }
  }, oe = async (M) => {
    let ce = 0, ye = 0;
    for (const Z of M)
      try {
        await nr(x.id, Z), ce++;
      } catch {
        ye++;
      }
    ce > 0 ? (g.success(
      `成功添加 ${ce} 个技能${ye > 0 ? `，${ye} 个失败` : ""}`
    ), r()) : ye > 0 && g.error("添加技能失败"), A(!1);
  }, B = async (M) => {
    try {
      await rr(x.id, M), g.success(`技能「${M}」已移除`), r();
    } catch (ce) {
      g.error(ce.message || "移除技能失败");
    }
  }, L = async (M) => {
    try {
      await Ha(x.id, M), g.success(`MCP「${M}」已移除`), r();
    } catch (ce) {
      g.error(ce.message || "移除 MCP 失败");
    }
  }, le = j ? a.createElement(
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
        c,
        {
          type: "primary",
          size: "small",
          icon: D ? a.createElement(D) : void 0,
          onClick: ee
        },
        "从技能池添加"
      )
    ),
    G.length === 0 ? a.createElement(m, {
      description: "该专家暂无已启用的技能",
      image: m.PRESENTED_IMAGE_SIMPLE
    }) : a.createElement(p, {
      dataSource: G,
      renderItem: (M) => a.createElement(
        p.Item,
        {
          actions: [
            a.createElement(
              c,
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
            a.createElement(f, { strong: !0 }, M.name),
            M.version_text ? a.createElement(
              s,
              { style: { fontSize: 10 } },
              `v${M.version_text}`
            ) : null
          ),
          M.description ? a.createElement(
            v,
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
              (ce, ye) => a.createElement(
                s,
                {
                  key: ye,
                  color: "cyan",
                  style: { fontSize: 10 }
                },
                ce
              )
            )
          ) : null
        )
      )
    }),
    // Skill Picker Modal (card-grid style, consistent with Skill Center)
    a.createElement(Va, {
      open: $,
      onClose: () => A(!1),
      poolSkills: F,
      installedSkillNames: G.map((M) => M.name),
      loading: U,
      onInstall: oe
    })
  ), re = j ? a.createElement(
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
        c,
        {
          type: "primary",
          size: "small",
          icon: D ? a.createElement(D) : void 0,
          onClick: () => {
            window.history.pushState({}, "", `/agents/${x.id}/mcp`), window.dispatchEvent(new PopStateEvent("popstate"));
          }
        },
        "配置 MCP"
      )
    ),
    W.length === 0 ? a.createElement(m, {
      description: "该专家暂无关联的 MCP 客户端，点击「配置 MCP」添加",
      image: m.PRESENTED_IMAGE_SIMPLE
    }) : a.createElement(p, {
      dataSource: W,
      renderItem: (M) => a.createElement(
        p.Item,
        {
          actions: [
            a.createElement(
              c,
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
            v,
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
  ), J = z != null && z.tools ? a.createElement(
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
        JSON.stringify(z.tools, null, 2)
      )
    )
  ) : a.createElement(m, {
    description: "暂无工具配置",
    image: m.PRESENTED_IMAGE_SIMPLE
  }), me = [
    { key: "basic", label: "基本信息", children: P },
    {
      key: "skills",
      label: `技能 (${G.length})`,
      children: le
    },
    {
      key: "prompts",
      label: "推荐提问",
      children: a.createElement(Vo, {
        skills: G,
        agentId: x.id
      })
    },
    {
      key: "knowledge",
      label: "专家记忆",
      children: a.createElement(qa, {
        agentId: x.id,
        systemPromptFiles: (z == null ? void 0 : z.system_prompt_files) || [],
        onRefresh: () => r()
      })
    },
    { key: "mcp", label: `MCP (${W.length})`, children: re },
    { key: "tools", label: "工具配置", children: J }
  ];
  return a.createElement(
    l,
    {
      title: a.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 8 } },
        a.createElement(Ye, { name: x.name, size: 28 }),
        a.createElement("span", null, x.name)
      ),
      open: t,
      onClose: n,
      width: 560,
      extra: a.createElement(
        d,
        null,
        a.createElement(
          c,
          {
            size: "small",
            icon: E ? a.createElement(E) : void 0,
            onClick: () => {
              n();
              try {
                const M = k();
                M.setSelectedAgent && M.setSelectedAgent(x.id);
              } catch (M) {
                console.warn("[ugsci] Failed to set selected agent:", M);
              }
              setTimeout(() => R("/agents"), 0);
            }
          },
          "编辑专家"
        ),
        a.createElement(
          c,
          {
            type: "primary",
            size: "small",
            icon: h ? a.createElement(h) : void 0,
            onClick: () => {
              n();
              try {
                const M = k();
                M.setSelectedAgent && M.setSelectedAgent(x.id);
              } catch (M) {
                console.warn("[ugsci] Failed to set selected agent:", M);
              }
              setTimeout(() => R("/chat"), 0);
            }
          },
          "开始对话"
        )
      )
    },
    a.createElement(u, {
      items: me,
      defaultActiveKey: "basic"
    })
  );
}
function ti({
  open: e,
  onClose: t,
  onCreated: n
}) {
  const r = k().React, { useState: a } = r, {
    Modal: l,
    Card: o,
    Tag: s,
    Input: i,
    Row: d,
    Col: c,
    Spin: m,
    message: u,
    Typography: p
  } = k().antd, { Text: w } = p, { FileAddOutlined: y } = k().antdIcons || {}, [g, f] = a(!1), [v, E] = a(""), [h, S] = a(!1), O = async (A) => {
    f(!0);
    try {
      const F = await de("/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: A.id || void 0,
          name: A.name,
          description: A.description,
          skill_names: A.skillNames
        })
      }), V = A.systemPrompt.trim() || `# ${A.name}

你是${A.name}。${A.description ? `

职责：${A.description}` : ""}
`, C = (await Promise.allSettled([
        cn(F.id, "AGENTS.md", V),
        ...A.mcpClients.map(
          ({ clientKey: x, client: z }) => lr(F.id, {
            client_key: x,
            client: z
          })
        )
      ])).filter(
        (x) => x.status === "rejected"
      ).length;
      C > 0 ? u.warning(
        `专家「${A.name}」已创建，${C} 项初始配置失败，可在专家配置中重试`
      ) : u.success(`专家「${A.name}」创建成功`), await qr(F.id), S(!1), setTimeout(() => {
        t(), n();
      }, 0);
    } catch (F) {
      u.error(F.message || "创建专家失败");
    } finally {
      f(!1);
    }
  }, D = Qo.filter((A) => {
    if (!v.trim()) return !0;
    const F = v.toLowerCase();
    return A.name.toLowerCase().includes(F) || A.description.toLowerCase().includes(F) || A.category.toLowerCase().includes(F);
  }), $ = async (A) => {
    f(!0);
    try {
      const F = await de("/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: A.name,
          description: A.description,
          skill_names: A.recommended_skills
        })
      });
      await cn(F.id, "AGENTS.md", A.system_prompt);
      const V = await tr(F.id);
      V.approval_level = A.approval_level, await de(`/agents/${encodeURIComponent(F.id)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(V)
      }), await qr(F.id), u.success(`专家「${A.name}」创建成功`), t(), n();
    } catch (F) {
      u.error(F.message || "创建专家失败");
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
          value: v,
          onChange: (A) => E(A.target.value),
          allowClear: !0
        })
      ),
      g ? r.createElement(
        "div",
        { style: { textAlign: "center", padding: 60 } },
        r.createElement(m, { size: "large" }),
        r.createElement(
          "div",
          { style: { marginTop: 12, color: "var(--ant-color-text-tertiary, #8c8c8c)" } },
          "正在创建专家..."
        )
      ) : r.createElement(
        d,
        { gutter: [12, 12] },
        // ── Blank template card (always first) ──
        v.trim() ? null : r.createElement(
          c,
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
                y ? r.createElement(y) : "📝"
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
        ...D.map(
          (A) => r.createElement(
            c,
            { key: A.id, xs: 24, sm: 12 },
            r.createElement(
              o,
              {
                hoverable: !0,
                size: "small",
                onClick: () => $(A),
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
                r.createElement(Ye, {
                  name: A.name,
                  size: 40
                }),
                r.createElement(
                  "div",
                  { style: { flex: 1 } },
                  r.createElement(
                    w,
                    { strong: !0, style: { fontSize: 15 } },
                    A.name
                  ),
                  r.createElement(
                    "div",
                    null,
                    r.createElement(
                      s,
                      { color: "blue", style: { fontSize: 10 } },
                      A.category
                    ),
                    A.approval_level === "MANUAL" ? r.createElement(
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
                er(A.description, r)
              )
            )
          )
        )
      )
    ),
    // ── Blank template creation modal (sibling, not nested inside Modal) ──
    r.createElement(ri, {
      open: h,
      onCancel: () => S(!1),
      onCreate: O
    })
  );
}
function Ct(e) {
  return typeof e == "object" && e !== null && !Array.isArray(e);
}
function ni(e) {
  const t = e.trim();
  if (!t) return [];
  const n = JSON.parse(t);
  if (!Ct(n))
    throw new Error("MCP 配置必须是 JSON 对象");
  const r = n.mcpServers ?? n;
  if (!Ct(r))
    throw new Error("mcpServers 必须是 JSON 对象");
  return Object.entries(r).map(([a, l]) => {
    const o = a.trim();
    if (!o || !Ct(l))
      throw new Error(`MCP「${a || "未命名"}」配置无效`);
    const s = typeof l.url == "string" ? l.url : "", i = typeof l.command == "string" ? l.command : "";
    if (!s && !i)
      throw new Error(`MCP「${o}」需要配置 url 或 command`);
    const c = (typeof l.transport == "string" ? l.transport : typeof l.type == "string" ? l.type : "") === "sse" ? "sse" : s ? "streamable_http" : "stdio";
    return {
      clientKey: o,
      client: {
        name: typeof l.name == "string" ? l.name : o,
        description: typeof l.description == "string" ? l.description : "",
        enabled: typeof l.enabled == "boolean" ? l.enabled : !0,
        transport: c,
        url: s,
        command: i,
        args: Array.isArray(l.args) ? l.args : [],
        env: Ct(l.env) ? l.env : {},
        cwd: typeof l.cwd == "string" ? l.cwd : "",
        headers: Ct(l.headers) ? l.headers : {}
      }
    };
  });
}
function ri({
  open: e,
  onCancel: t,
  onCreate: n
}) {
  const r = k().React, { useState: a, useEffect: l, useMemo: o } = r, {
    Modal: s,
    Input: i,
    Select: d,
    Button: c,
    Row: m,
    Col: u,
    Spin: p,
    Tag: w,
    Typography: y,
    message: g
  } = k().antd, { CheckCircleOutlined: f } = k().antdIcons || {}, { Text: v } = y, [E, h] = a(""), [S, O] = a(""), [D, $] = a(""), [A, F] = a(""), [V, U] = a([]), [C, x] = a([]), [z, I] = a(!1), [W, j] = a(""), [G, R] = a(!1);
  l(() => {
    e && (h(""), O(""), $(""), F(""), x([]), j(""), R(!1), I(!0), wn(!0).then(U).catch((re) => {
      U([]), g.error(re.message || "加载技能池失败");
    }).finally(() => I(!1)));
  }, [e]);
  const P = S.trim(), ee = o(() => P ? P.length < 2 || P.length > 64 ? "ID 长度需为 2-64 个字符" : /^[a-zA-Z0-9][a-zA-Z0-9_-]*[a-zA-Z0-9]$/.test(P) ? P === "default" ? "default 是系统保留 ID" : "" : "仅允许字母、数字、连字符和下划线，且不能以符号开头或结尾" : "", [P]), oe = o(() => {
    try {
      return { clients: ni(W), error: "" };
    } catch (re) {
      return { clients: [], error: re.message || "MCP 配置无效" };
    }
  }, [W]), B = () => {
    const re = E.trim();
    if (!re) {
      g.warning("请输入专家名称");
      return;
    }
    if (ee) {
      g.warning(ee);
      return;
    }
    if (oe.error) {
      g.warning(oe.error);
      return;
    }
    R(!0), Promise.resolve(
      n({
        id: P,
        name: re,
        description: D.trim(),
        systemPrompt: A,
        skillNames: C,
        mcpClients: oe.clients
      })
    ).finally(() => R(!1));
  }, L = () => {
    x(
      V.filter((re) => re.source === "builtin").map((re) => re.name)
    );
  }, le = (re, J) => r.createElement(
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
    r.createElement(v, { strong: !0, style: { fontSize: 15 } }, re),
    J ? r.createElement(v, { type: "secondary", style: { fontSize: 12 } }, J) : null
  );
  return r.createElement(
    s,
    {
      open: e,
      title: "创建专家",
      onCancel: t,
      onOk: B,
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
            value: E,
            onChange: (re) => h(re.target.value),
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
            onChange: (re) => O(re.target.value),
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
            value: D,
            onChange: (re) => $(re.target.value),
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
        value: A,
        onChange: (re) => F(re.target.value),
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
            r.createElement(v, { strong: !0 }, "初始技能"),
            r.createElement(
              "div",
              { style: { display: "flex", gap: 4 } },
              r.createElement(c, { size: "small", onClick: L, disabled: z }, "内置"),
              r.createElement(c, { size: "small", onClick: () => x([]), disabled: C.length === 0 }, "清空")
            )
          ),
          z ? r.createElement("div", { style: { textAlign: "center", padding: 32 } }, r.createElement(p, { size: "small" })) : r.createElement(d, {
            mode: "multiple",
            value: C,
            onChange: x,
            placeholder: "搜索并选择技能",
            showSearch: !0,
            allowClear: !0,
            optionFilterProp: "label",
            maxTagCount: "responsive",
            style: { width: "100%" },
            options: V.map((re) => ({
              value: re.name,
              label: re.name
            })),
            notFoundContent: "暂无可用技能"
          }),
          r.createElement(
            "div",
            { style: { marginTop: 8, minHeight: 22 } },
            C.length > 0 ? r.createElement(w, { color: "blue" }, `已选择 ${C.length} 个技能`) : r.createElement(v, { type: "secondary", style: { fontSize: 12 } }, "暂不添加技能")
          )
        ),
        r.createElement(
          u,
          { xs: 24, md: 12 },
          r.createElement(v, { strong: !0, style: { display: "block", marginBottom: 8 } }, "初始 MCP"),
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
            onChange: (re) => j(re.target.value),
            rows: 8,
            status: oe.error ? "error" : void 0,
            style: { fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", fontSize: 12 }
          }),
          r.createElement(
            "div",
            { style: { marginTop: 8, minHeight: 22 } },
            oe.error ? r.createElement(v, { type: "danger", style: { fontSize: 12 } }, oe.error) : oe.clients.length > 0 ? r.createElement(
              w,
              {
                color: "green",
                icon: f ? r.createElement(f) : void 0
              },
              `已识别 ${oe.clients.length} 个 MCP`
            ) : r.createElement(v, { type: "secondary", style: { fontSize: 12 } }, "暂不添加 MCP")
          )
        )
      )
    )
  );
}
const Qa = "ugsci_custom_teams";
function ai(e) {
  if (!e || typeof e != "object") return !1;
  const t = e;
  return typeof t.id == "string" && typeof t.name == "string" && typeof t.taskTemplate == "string" && typeof t.orchestrationPrompt == "string" && Array.isArray(t.members);
}
function li() {
  try {
    const e = JSON.parse(
      localStorage.getItem(Qa) || "[]"
    );
    return Array.isArray(e) ? e.filter(ai) : [];
  } catch {
    return [];
  }
}
function oi(e) {
  try {
    localStorage.setItem(Qa, JSON.stringify(e));
  } catch {
  }
}
function ii(e) {
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
function si(e) {
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
async function jn(e = !0) {
  const t = await et("/ugsci/team/custom");
  if (!t.ok) {
    const a = await t.text().catch(() => "");
    throw new Error(a || `HTTP ${t.status}`);
  }
  const r = (await t.json()).map(si);
  return e && oi(r), r;
}
async function Za(e) {
  const t = await et("/ugsci/team/custom", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(ii(e))
  });
  if (!t.ok) {
    const r = await t.text().catch(() => "");
    throw new Error(r || `HTTP ${t.status}`);
  }
  const n = await t.json();
  return { ...e, id: n.team_id };
}
async function ci(e) {
  const t = await et(
    `/ugsci/team/custom/${encodeURIComponent(e)}`,
    { method: "DELETE" }
  );
  if (!t.ok && t.status !== 404) {
    const n = await t.text().catch(() => "");
    throw new Error(n || `HTTP ${t.status}`);
  }
}
async function di() {
  const e = li();
  if (e.length === 0) return;
  const t = await jn(!1), n = new Set(t.map((r) => r.id));
  await Promise.all(
    e.filter((r) => !n.has(r.id)).map((r) => Za(r))
  );
}
async function ui(e) {
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
        const d = r.slice(0, i);
        r = r.slice(i + 2);
        for (const c of d.split(`
`)) {
          if (!c.startsWith("data: ")) continue;
          const m = c.slice(6);
          let u;
          try {
            u = JSON.parse(m);
          } catch {
            continue;
          }
          if (u.error) {
            const p = u.error, w = typeof p == "string" ? p : (p == null ? void 0 : p.message) || "工作流启动失败";
            throw new Error(w);
          }
          if (u.object === "response" || u.type === "response") {
            const p = u.status;
            if (p === "failed" || p === "error") {
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
async function mi(e, t, n) {
  const r = `console:default:team-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, a = await et("/chats", {
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
  const o = (await a.json()).id, s = await et("/console/chat", {
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
  return await ui(s), o;
}
function el(e, t) {
  var a;
  const n = t.replace(/\s+/g, ""), r = e.find(
    (l) => l.name === t || l.name.replace(/\s+/g, "") === n
  );
  return r ? r.id : ((a = e.find(
    (l) => l.name.includes(t) || t.includes(l.name) || l.name.replace(/\s+/g, "").includes(n)
  )) == null ? void 0 : a.id) || null;
}
function tl() {
  var t;
  const e = (t = window.QwenPaw) == null ? void 0 : t.host;
  if (!e) throw new Error("[ugsci] QwenPaw.host not available");
  return e;
}
async function nl(e, t) {
  const n = await e.text().catch(() => "");
  if (!n) return t;
  try {
    const r = JSON.parse(n);
    if (typeof r.detail == "string") return r.detail;
  } catch {
  }
  return n;
}
async function ir(e, t, n) {
  const r = await et(e, {
    headers: t ? { "X-Agent-Id": t } : void 0,
    signal: n
  });
  if (!r.ok)
    throw new Error(
      await nl(r, `HTTP ${r.status}`)
    );
  return await r.json();
}
function pi(e, t) {
  return ir("/ugsci/team/state", e, t);
}
async function fi(e, t) {
  const n = await et("/ugsci/team/runs", {
    headers: { "X-Agent-Id": e },
    signal: t
  });
  if (!n.ok)
    throw new Error(
      await nl(
        n,
        `Failed to load team runs: ${n.status}`
      )
    );
  return await n.json();
}
const gi = 5e3;
function Jr({
  activeOnly: e = !1,
  enabled: t = !0
}) {
  const n = tl(), r = n.React, { useCallback: a, useEffect: l, useRef: o, useState: s } = r, { Alert: i, Button: d, Card: c, Empty: m, Spin: u, Tag: p, Typography: w } = n.antd, { Text: y, Paragraph: g } = w, f = n.useSelectedAgent ? n.useSelectedAgent() : { id: "default" }, v = (f == null ? void 0 : f.id) || "default", [E, h] = s([]), [S, O] = s(!0), [D, $] = s(null), [A, F] = s(!1), V = o(null), U = o(0), C = o(!1), x = o(v), z = a(
    async (j = !0, G = !0) => {
      var ee;
      if (!t || !G && C.current) return;
      (ee = V.current) == null || ee.abort();
      const R = new AbortController();
      V.current = R;
      const P = ++U.current;
      C.current = !0, j && O(!0);
      try {
        const oe = await fi(v, R.signal);
        if (R.signal.aborted || P !== U.current)
          return;
        h(oe), F(!0), $(null);
      } catch (oe) {
        if (R.signal.aborted || P !== U.current)
          return;
        $(
          oe instanceof Error ? oe.message : "讨论运行记录加载失败"
        );
      } finally {
        !R.signal.aborted && P === U.current && (V.current = null, C.current = !1, O(!1));
      }
    },
    [v, t]
  );
  if (l(() => {
    var G;
    if (!t) {
      (G = V.current) == null || G.abort(), V.current = null, C.current = !1, U.current += 1;
      return;
    }
    x.current !== v && (x.current = v, h([]), $(null), F(!1)), z(!0, !0);
    const j = e ? window.setInterval(() => {
      z(!1, !1);
    }, gi) : null;
    return () => {
      var R;
      j !== null && window.clearInterval(j), (R = V.current) == null || R.abort(), V.current = null, C.current = !1, U.current += 1;
    };
  }, [e, v, t, z]), S && !A) return r.createElement(u);
  if (D && !A)
    return r.createElement(i, {
      type: "warning",
      message: "讨论运行记录加载失败",
      description: D,
      action: r.createElement(
        d,
        { size: "small", onClick: () => void z(!0, !0), loading: S },
        "重试"
      )
    });
  const I = E.filter(
    (j) => e ? j.status === "active" : j.status !== "active"
  ), W = (j) => D ? r.createElement(
    r.Fragment,
    null,
    r.createElement(i, {
      type: "warning",
      message: "讨论运行记录更新失败，当前显示上次成功读取的结果",
      description: D,
      action: r.createElement(
        d,
        {
          size: "small",
          onClick: () => void z(!0, !0),
          loading: S
        },
        "重试"
      )
    }),
    j
  ) : j;
  return I.length === 0 ? W(
    r.createElement(
      m,
      {
        description: e ? "暂无进行中的专家团讨论" : "暂无历史讨论"
      },
      r.createElement(
        d,
        { size: "small", onClick: () => void z(!0, !0), loading: S },
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
          d,
          { size: "small", onClick: () => void z(!0, !0), loading: S },
          "刷新"
        )
      ),
      r.createElement(
        "div",
        { style: { display: "flex", flexDirection: "column", gap: 8 } },
        ...I.map(
          (j) => r.createElement(
            c,
            { key: j.instance_id, size: "small" },
            r.createElement(
              "div",
              { style: { display: "flex", alignItems: "center", gap: 8 } },
              r.createElement(
                y,
                { strong: !0 },
                j.team_name || j.team_id
              ),
              r.createElement(
                p,
                {
                  color: j.status === "completed" ? "green" : j.status === "terminated" ? "orange" : "blue"
                },
                j.status
              ),
              r.createElement(p, null, j.current_phase),
              r.createElement(
                y,
                { type: "secondary" },
                `迭代 ${j.iteration}`
              )
            ),
            r.createElement(
              g,
              { ellipsis: { rows: 2 }, style: { margin: "8px 0 0" } },
              j.task || "暂无任务描述"
            )
          )
        )
      )
    )
  );
}
async function yi() {
  try {
    return (await ir(
      "/ugsci/team/preset-teams"
    )).teams;
  } catch {
    return null;
  }
}
async function hi() {
  try {
    return (await ir(
      "/ugsci/team/roles"
    )).roles;
  } catch {
    return null;
  }
}
const Ei = {
  plan: { label: "规划", color: "#1677ff", icon: "📋" },
  dispatch: { label: "分派", color: "#13c2c2", icon: "🚀" },
  verify: { label: "验证", color: "#fa8c16", icon: "🔍" },
  synthesize: { label: "综合", color: "#722ed1", icon: "📊" },
  completed: { label: "完成", color: "#52c41a", icon: "✅" }
}, Kr = [
  "plan",
  "dispatch",
  "verify",
  "synthesize",
  "completed"
], Xr = 5e3, bi = 3e4;
function vi({ enabled: e = !0 }) {
  const t = tl(), n = t.React, { useState: r, useEffect: a, useCallback: l, useRef: o } = n, { Card: s, Tag: i, Typography: d, Button: c, Steps: m, Empty: u, Alert: p, Spin: w } = t.antd, { ReloadOutlined: y } = t.antdIcons || {}, { Text: g, Paragraph: f } = d, v = t.useSelectedAgent ? t.useSelectedAgent() : { id: "default" }, E = (v == null ? void 0 : v.id) || "default", [h, S] = r(null), [O, D] = r(!1), [$, A] = r(null), F = o(null), V = o(0), U = o(0), C = o(0), x = o(null), z = o(!1), I = l(
    async (J, me = !0) => {
      var ye;
      if (!e || !me && z.current) return;
      (ye = x.current) == null || ye.abort();
      const M = new AbortController();
      x.current = M;
      const ce = ++C.current;
      z.current = !0, J && D(!0);
      try {
        const Z = await pi(E, M.signal);
        if (M.signal.aborted || ce !== C.current)
          return;
        V.current = 0, U.current = 0, F.current = Z, S(Z), A(null);
      } catch (Z) {
        if (M.signal.aborted || ce !== C.current)
          return;
        V.current += 1;
        const se = Math.min(
          bi,
          Xr * 2 ** (V.current - 1)
        );
        U.current = Date.now() + se, A(
          Z instanceof Error ? Z.message : "专家团状态加载失败"
        );
      } finally {
        !M.signal.aborted && ce === C.current && (x.current = null, z.current = !1, D(!1));
      }
    },
    [E, e]
  ), W = l(() => (V.current = 0, U.current = 0, I(!0)), [I]);
  if (a(() => {
    var me;
    if ((me = x.current) == null || me.abort(), x.current = null, z.current = !1, C.current += 1, V.current = 0, U.current = 0, F.current = null, S(null), A(null), !e) return;
    W();
    const J = window.setInterval(() => {
      var M, ce;
      Date.now() < U.current || ((M = F.current) == null ? void 0 : M.status) === "completed" || ((ce = F.current) == null ? void 0 : ce.status) === "terminated" || I(!1, !1);
    }, Xr);
    return () => {
      var M;
      window.clearInterval(J), (M = x.current) == null || M.abort(), x.current = null, z.current = !1, C.current += 1;
    };
  }, [E, e, I, W]), O && !h && !$)
    return n.createElement(w);
  if ($ && !h)
    return n.createElement(p, {
      type: "warning",
      showIcon: !0,
      message: "专家团状态加载失败",
      description: $,
      style: { marginBottom: 16 },
      action: n.createElement(
        c,
        { size: "small", onClick: W, loading: O },
        "重试"
      )
    });
  const j = (J) => $ ? n.createElement(
    n.Fragment,
    null,
    n.createElement(p, {
      type: "warning",
      showIcon: !0,
      message: "状态更新失败，当前显示上次成功读取的结果",
      description: $,
      style: { marginBottom: 16 },
      action: n.createElement(
        c,
        { size: "small", onClick: W, loading: O },
        "重试"
      )
    }),
    J
  ) : J;
  if ((h == null ? void 0 : h.status) === "unreadable")
    return j(
      n.createElement(p, {
        type: "warning",
        showIcon: !0,
        message: "专家团状态暂时无法读取",
        description: `实例 ${h.instance_id || "未知"} 的状态文件需要检查。`,
        style: { marginBottom: 16 },
        action: n.createElement(
          c,
          { size: "small", onClick: W, loading: O },
          "重试"
        )
      })
    );
  if (!h || !h.active) {
    if ((h == null ? void 0 : h.status) === "completed" || (h == null ? void 0 : h.status) === "terminated") {
      const J = h.status === "completed";
      return j(
        n.createElement(p, {
          type: J ? "success" : "info",
          showIcon: !0,
          message: J ? "专家团工作流已完成" : "专家团工作流已终止",
          description: J ? `实例 ${h.instance_id || "未知"} 已完成，结果文件保留在工作区。` : `原因：${h.state.termination_reason || "未知"}`,
          style: { marginBottom: 16 }
        })
      );
    }
    return j(
      n.createElement(u, {
        description: "暂无活跃的专家团工作流",
        style: { padding: 24 }
      })
    );
  }
  const G = h.state, R = G.current_phase || "plan", P = Kr.indexOf(R), ee = G.team_name || "未知团队", oe = G.team_mode || "pipeline", B = G.iteration || 0, L = G.members || [], le = G.verify_retries || 0, re = {
    pipeline: "顺序交接",
    coordinator: "主管协作",
    roundtable: "并行汇聚",
    router: "智能路由",
    review_loop: "评审迭代",
    debate: "多方论证"
  };
  return j(
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
            g,
            { strong: !0 },
            `${ee} — 工作流状态`
          ),
          n.createElement(
            i,
            { color: "blue", style: { fontSize: 10 } },
            re[oe] || oe
          ),
          n.createElement(
            i,
            { style: { fontSize: 10 } },
            `迭代 ${B}`
          ),
          le > 0 ? n.createElement(
            i,
            { color: "orange", style: { fontSize: 10 } },
            `验证重试 ${le}`
          ) : null
        ),
        extra: n.createElement(
          c,
          {
            size: "small",
            type: "text",
            icon: y ? n.createElement(y) : void 0,
            onClick: W,
            loading: O
          },
          "刷新"
        )
      },
      n.createElement(m, {
        current: P,
        size: "small",
        items: Kr.map((J) => {
          const me = Ei[J];
          return {
            title: `${me.icon} ${me.label}`,
            description: J === "plan" ? "分析任务，创建任务分解" : J === "dispatch" ? "分派专家执行任务" : J === "verify" ? "交叉验证专家结果" : J === "synthesize" ? "综合形成最终报告" : "工作流完成"
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
        ...L.map(
          (J, me) => n.createElement(
            i,
            { key: `${J.name}-${me}`, style: { fontSize: 11 } },
            `${J.emoji || ""} ${J.name}（${J.role}）`
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
function wi({ team: e }) {
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
  }, s = e.steps || [], i = e.mode === "roundtable" || e.mode === "router", d = {
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
      `OMP 编排拓扑 · ${d[e.mode] || e.mode}`
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
      ...s.length > 0 ? s.map((c, m) => [
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
          t.createElement(Ye, {
            name: c.agentName,
            size: 24
          }),
          t.createElement(
            "div",
            null,
            t.createElement(
              a,
              { strong: !0, style: { fontSize: 12 } },
              c.agentName
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
              c.instruction
            ),
            t.createElement(
              r,
              {
                ...c.passContext ? { color: "blue" } : {},
                style: { fontSize: 9, marginTop: 2 }
              },
              c.passContext ? "传递上下文" : "独立"
            )
          )
        )
      ]).flat() : e.members.map((c, m) => [
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
          t.createElement(Ye, {
            name: c.name,
            size: 24
          }),
          t.createElement(
            "div",
            null,
            t.createElement(
              a,
              { strong: !0, style: { fontSize: 12 } },
              c.name
            ),
            t.createElement(
              "div",
              { style: { fontSize: 11, color: "var(--ant-color-text-tertiary, #8c8c8c)" } },
              c.role
            )
          )
        )
      ]).flat()
    )
  );
}
function Xt(e) {
  const t = e.replace(/\s+/g, "").toLowerCase();
  return t.includes("测井") ? "log-analyst" : t.includes("地球物理") ? "geophysicist" : t.includes("油藏") ? "reservoir-engineer" : t.includes("钻井") ? "drilling-engineer" : t.includes("采油") || t.includes("生产") ? "production-engineer" : t.includes("pvt") || t.includes("物性") ? "pvt-analyst" : t.includes("审核") || t.includes("verifier") ? "domain-reviewer" : t.includes("master") || t.includes("planner") ? "planner" : "analyst";
}
const Si = [
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
function xi({
  open: e,
  onClose: t,
  agents: n,
  editingTeam: r,
  onSaved: a
}) {
  const l = k().React, { useState: o, useEffect: s, useCallback: i } = l, {
    Modal: d,
    Input: c,
    Button: m,
    Select: u,
    Tag: p,
    Typography: w,
    Switch: y,
    Empty: g,
    message: f,
    Divider: v,
    Steps: E
  } = k().antd, { PlusOutlined: h, DeleteOutlined: S, SaveOutlined: O, ArrowRightOutlined: D } = k().antdIcons || {}, { Text: $, Paragraph: A } = w, [F, V] = o(""), [U, C] = o("🤝"), [x, z] = o(""), [I, W] = o("pipeline"), [j, G] = o(""), [R, P] = o(""), [ee, oe] = o([]), [B, L] = o([]), [le, re] = o(!1), [J, me] = o(2), [M, ce] = o(""), [ye, Z] = o(""), [se, te] = o({}), [be, ve] = o({}), [$e, Se] = o(
    Si
  ), ne = [
    { value: "pipeline", icon: "→", title: "顺序交接", description: "上一步产物成为下一位专家的上下文", topology: "A → B → C", accent: "#08979c" },
    { value: "roundtable", icon: "⇉", title: "并行汇聚", description: "独立并行分析，避免观点相互污染", topology: "A ∥ B ∥ C → 汇总", accent: "#531dab" },
    { value: "coordinator", icon: "◎", title: "主管协作", description: "主控专家拆解任务并按需组织成员", topology: "主管 → 专家组", accent: "#0958d9" },
    { value: "router", icon: "◇", title: "智能路由", description: "按任务能力需求选择最小充分专家集合", topology: "任务 → 路由 → 子集", accent: "#d46b08" },
    { value: "review_loop", icon: "↻", title: "评审迭代", description: "产出、独立审查、修订，直到满足标准", topology: "执行 ⇄ 评审", accent: "#389e0d" },
    { value: "debate", icon: "⚖", title: "多方论证", description: "独立立场、交叉质询，再由裁决者综合", topology: "观点 ⇄ 反驳 → 裁决", accent: "#c41d7f" }
  ];
  s(() => {
    e && (r ? (V(r.name), C(r.emoji), z(r.description), W(r.mode), G(r.coordinatorName || ""), P(r.taskTemplate), oe(r.steps || []), L(r.members.map((T) => T.name)), me(r.maxReviewRounds || 2), ce(r.successCriteria || ""), Z(r.routingInstruction || ""), te(
      Object.fromEntries(
        r.members.map((T) => [
          T.name,
          T.bindingMode || (T.agentId ? "fixed" : "preferred")
        ])
      )
    ), ve(
      Object.fromEntries(
        r.members.map((T) => [
          T.name,
          T.roleKey || Xt(T.name)
        ])
      )
    )) : (V(""), C("🤝"), z(""), W("pipeline"), G(""), P(`请执行以下任务：
任务描述：{任务描述}`), oe([]), L([]), me(2), ce(""), Z(""), te({}), ve({})));
  }, [e, r]), s(() => {
    e && hi().then((T) => {
      T != null && T.length && Se(T);
    });
  }, [e]);
  const we = i(() => {
    if (I === "roundtable" || I === "debate" || I === "router") {
      const T = B.map((pe) => ({
        agentName: pe,
        instruction: "请给出你的专业评估意见",
        passContext: !1
      }));
      oe(T);
    } else if (I === "pipeline") {
      const T = new Map(ee.map((X) => [X.agentName, X])), pe = B.map((X) => T.get(X) || {
        agentName: X,
        instruction: "请完成你的专业部分",
        passContext: !0
      });
      oe(pe);
    }
  }, [I, B, ee]), Ce = (T) => {
    B.includes(T) || (L([...B, T]), te({ ...se, [T]: "fixed" }), ve({
      ...be,
      [T]: Xt(T)
    }), (I === "coordinator" || I === "debate") && !j && G(T));
  }, K = (T) => {
    const pe = B.filter((ae) => ae !== T);
    L(pe), oe(ee.filter((ae) => ae.agentName !== T));
    const X = { ...se };
    delete X[T], te(X);
    const _ = { ...be };
    delete _[T], ve(_), j === T && G(pe[0] || "");
  }, ue = (T, pe, X) => {
    const _ = [...ee];
    _[T] = { ..._[T], [pe]: X }, oe(_);
  }, he = async () => {
    if (!F.trim()) {
      f.warning("请输入团队名称");
      return;
    }
    if (B.length < 2) {
      f.warning("至少需要选择 2 个成员");
      return;
    }
    if (!R.trim()) {
      f.warning("请输入任务模板");
      return;
    }
    if ((I === "coordinator" || I === "debate") && !j) {
      f.warning(I === "debate" ? "请选择裁决者" : "请选择主控专家");
      return;
    }
    re(!0);
    try {
      let T = [...B];
      I === "coordinator" && j ? T = [j, ...T.filter((ae) => ae !== j)] : I === "debate" && j && (T = [...T.filter((ae) => ae !== j), j]);
      const pe = T.map(
        (ae) => {
          var Je;
          const fe = n.find((Ue) => Ue.name === ae), _e = se[ae] || "fixed", Be = be[ae] || Xt(ae), qe = $e.find((Ue) => Ue.key === Be);
          return {
            name: ae,
            role: (qe == null ? void 0 : qe.display_name) || ((Je = fe == null ? void 0 : fe.description) == null ? void 0 : Je.slice(0, 30)) || "需求分析师",
            emoji: "",
            agentId: _e === "temporary" || fe == null ? void 0 : fe.id,
            roleKey: Be,
            bindingMode: _e
          };
        }
      );
      let X = ee;
      (ee.length === 0 || ee.length !== B.length) && (X = B.map((ae) => ({
        agentName: ae,
        instruction: "请完成你的专业部分",
        passContext: I === "pipeline"
      })));
      const _ = {
        id: (r == null ? void 0 : r.id) || `custom-${Date.now()}`,
        name: F.trim(),
        emoji: U,
        category: "自定义",
        description: x.trim() || `${F.trim()}（${B.length}人团队）`,
        mode: I,
        members: pe,
        coordinatorName: I === "coordinator" || I === "debate" ? j : void 0,
        taskTemplate: R.trim(),
        orchestrationPrompt: "",
        // Custom teams use steps-based instructions
        steps: X,
        custom: !0,
        createdAt: (r == null ? void 0 : r.createdAt) || Date.now(),
        updatedAt: r == null ? void 0 : r.updatedAt,
        version: r == null ? void 0 : r.version,
        maxReviewRounds: J,
        successCriteria: M.trim(),
        routingInstruction: ye.trim()
      };
      await Za(_), f.success(r ? "团队已更新" : "团队已创建"), a(), t();
    } catch (T) {
      f.error(T.message || "保存失败");
    } finally {
      re(!1);
    }
  }, H = n.filter(
    (T) => !B.includes(T.name)
  );
  return l.createElement(
    d,
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
      onOk: he,
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
        $,
        {
          strong: !0,
          style: { display: "block", marginBottom: 8, fontSize: 13 }
        },
        "1. 定义任务工作流"
      ),
      l.createElement(
        "div",
        { style: { display: "flex", gap: 8, marginBottom: 8, alignItems: "center" } },
        B.length > 0 ? l.createElement(or, {
          members: B,
          size: 36
        }) : null,
        l.createElement(c, {
          placeholder: "专家团名称（如：储层评价与质量复核专家团）",
          value: F,
          onChange: (T) => V(T.target.value),
          style: { flex: 1 }
        })
      ),
      l.createElement(c.TextArea, {
        placeholder: "说明这个工作流解决什么问题、适用于什么场景",
        value: x,
        onChange: (T) => z(T.target.value),
        rows: 2,
        style: { marginBottom: 8 }
      }),
      l.createElement(
        $,
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
        ...ne.map((T) => {
          const pe = I === T.value;
          return l.createElement(
            "button",
            {
              key: T.value,
              type: "button",
              onClick: () => {
                W(T.value), T.value !== "coordinator" && T.value !== "debate" && G("");
              },
              style: {
                textAlign: "left",
                padding: 10,
                borderRadius: 8,
                cursor: "pointer",
                background: pe ? `${T.accent}0d` : "var(--ant-color-bg-container, #fff)",
                border: `1px solid ${pe ? T.accent : "var(--ant-color-border, #d9d9d9)"}`,
                boxShadow: pe ? `0 0 0 2px ${T.accent}1a` : "none"
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
    l.createElement(v, { style: { margin: "12px 0" } }),
    // Step 2: Select members
    l.createElement(
      "div",
      { style: { marginBottom: 16 } },
      l.createElement(
        $,
        {
          strong: !0,
          style: { display: "block", marginBottom: 8, fontSize: 13 }
        },
        "2. 配置专家角色"
      ),
      // Available agents
      H.length > 0 ? l.createElement(
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
        ...H.map(
          (T) => l.createElement(
            m,
            {
              key: T.id,
              size: "small",
              icon: h ? l.createElement(h) : void 0,
              onClick: () => Ce(T.name)
            },
            T.name
          )
        )
      ) : null,
      // Selected members
      B.length === 0 ? l.createElement(g, {
        description: "请从上方添加团队成员",
        image: g.PRESENTED_IMAGE_SIMPLE
      }) : l.createElement(
        "div",
        { style: { display: "flex", flexDirection: "column", gap: 4 } },
        ...B.map(
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
              l.createElement(Ye, { name: T, size: 24 }),
              l.createElement(
                $,
                { strong: !0, style: { fontSize: 13 } },
                T
              ),
              (I === "coordinator" || I === "debate") && j === T ? l.createElement(
                p,
                { color: "blue", style: { fontSize: 10 } },
                I === "debate" ? "裁决者" : "主控"
              ) : null
            ),
            l.createElement(
              "div",
              { style: { display: "flex", gap: 4 } },
              l.createElement(u, {
                size: "small",
                value: be[T] || Xt(T),
                style: { width: 132 },
                onChange: (pe) => ve({ ...be, [T]: pe }),
                options: $e.map((pe) => ({
                  value: pe.key,
                  label: pe.display_name
                }))
              }),
              l.createElement(u, {
                size: "small",
                value: se[T] || "fixed",
                style: { width: 118 },
                onChange: (pe) => te({ ...se, [T]: pe }),
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
                  onClick: () => G(T)
                },
                I === "debate" ? "设为裁决者" : "设为主控"
              ) : null,
              l.createElement(
                m,
                {
                  size: "small",
                  type: "link",
                  danger: !0,
                  icon: S ? l.createElement(S) : void 0,
                  onClick: () => K(T)
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
        l.createElement(u, {
          value: J,
          onChange: (T) => me(T),
          options: [1, 2, 3, 4, 5].map((T) => ({ value: T, label: `最多 ${T} 轮` }))
        }),
        l.createElement(c, {
          value: M,
          onChange: (T) => ce(T.target.value),
          placeholder: "验收标准，例如：关键结论均有数据依据，且无高风险缺陷"
        })
      ) : l.createElement(c, {
        value: ye,
        onChange: (T) => Z(T.target.value),
        placeholder: "路由偏好，例如：仅调用任务必需的专家；涉及模拟时优先油藏工程师"
      })
    ) : null,
    l.createElement(v, { style: { margin: "12px 0" } }),
    // Step 3: Define execution steps (for pipeline/roundtable)
    B.length > 0 ? l.createElement(
      "div",
      { style: { marginBottom: 16 } },
      l.createElement(
        $,
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
          onClick: we,
          style: { marginBottom: 8 }
        },
        "自动生成步骤"
      ),
      // Steps list
      ee.length === 0 ? l.createElement(
        $,
        { type: "secondary", style: { fontSize: 12 } },
        "点击「自动生成步骤」或手动配置每步的指令"
      ) : l.createElement(
        "div",
        { style: { display: "flex", flexDirection: "column", gap: 6 } },
        ...ee.map(
          (T, pe) => l.createElement(
            "div",
            {
              key: pe,
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
                `${pe + 1}`
              ) : l.createElement(
                "span",
                { style: { fontSize: 14 } },
                "🔀"
              ),
              l.createElement(
                p,
                { color: "blue", style: { fontSize: 11 } },
                T.agentName
              ),
              l.createElement(
                "div",
                { style: { flex: 1 } },
                l.createElement(c, {
                  placeholder: "请输入该步骤的指令...",
                  value: T.instruction,
                  onChange: (X) => ue(pe, "instruction", X.target.value),
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
                checked: T.passContext,
                onChange: (X) => ue(pe, "passContext", X)
              }),
              l.createElement(
                $,
                { type: "secondary", style: { fontSize: 11 } },
                T.passContext ? "传递上一步结果作为上下文" : "独立执行"
              )
            )
          )
        )
      )
    ) : null,
    l.createElement(v, { style: { margin: "12px 0" } }),
    // Step 4: Task template
    l.createElement(
      "div",
      null,
      l.createElement(
        $,
        {
          strong: !0,
          style: { display: "block", marginBottom: 8, fontSize: 13 }
        },
        `${B.length > 0 ? "4" : "3"}. 任务模板`
      ),
      l.createElement(c.TextArea, {
        placeholder: `输入任务模板，可用 {参数名} 作为占位符...

例如：
请对区块 {区块名} 的井 {井号} 进行储层评价`,
        value: R,
        onChange: (T) => P(T.target.value),
        rows: 4,
        style: { fontFamily: "monospace", fontSize: 13 }
      }),
      l.createElement(
        $,
        {
          type: "secondary",
          style: { fontSize: 11, display: "block", marginTop: 4 }
        },
        "占位符 {参数名} 在发起任务时可由用户填写替换"
      )
    )
  );
}
function Yr({
  team: e,
  agents: t,
  onLaunch: n,
  onEdit: r,
  onDelete: a
}) {
  var C;
  const l = k().React, { useState: o } = l, { Card: s, Tag: i, Typography: d, Button: c, Tooltip: m, Popconfirm: u } = k().antd, {
    TeamOutlined: p,
    RocketOutlined: w,
    UserOutlined: y,
    EditOutlined: g,
    DeleteOutlined: f,
    DownOutlined: v,
    UpOutlined: E
  } = k().antdIcons || {}, { Text: h, Paragraph: S } = d, [O, D] = o(!1), $ = {
    coordinator: { label: "主管协作", color: "blue" },
    pipeline: { label: "顺序交接", color: "cyan" },
    roundtable: { label: "并行汇聚", color: "purple" },
    router: { label: "智能路由", color: "orange" },
    review_loop: { label: "评审迭代", color: "green" },
    debate: { label: "多方论证", color: "magenta" }
  }, A = $[e.mode] || $.coordinator, F = e.members.map((x) => {
    const z = x.bindingMode === "temporary", I = z ? null : (x.agentId && t.some((W) => W.id === x.agentId) ? x.agentId : null) || el(t, x.name);
    return { ...x, found: !!I, agentId: I, temporary: z };
  }), V = F.filter((x) => x.found).length, U = e.coordinatorName || ((C = e.members[0]) == null ? void 0 : C.name);
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
      l.createElement(or, {
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
            h,
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
            { color: A.color, style: { fontSize: 10 } },
            A.label
          ),
          l.createElement(
            i,
            { color: "green", style: { fontSize: 10 } },
            `${e.members.length} 位专家`
          ),
          V < e.members.length ? l.createElement(
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
          l.createElement(c, {
            type: "text",
            size: "small",
            icon: g ? l.createElement(g) : void 0,
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
            l.createElement(c, {
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
      ...F.map(
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
            l.createElement(Ye, { name: x.name, size: 18 }),
            l.createElement(
              h,
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
      c,
      {
        type: "link",
        size: "small",
        style: { padding: "0 0 4px 0", fontSize: 11, height: "auto" },
        onClick: (x) => {
          x.stopPropagation(), D(!O);
        },
        icon: O ? E ? l.createElement(E) : "▲" : v ? l.createElement(v) : "▼"
      },
      O ? "收起流程" : "查看执行流程"
    ),
    O ? l.createElement(wi, { team: e }) : null,
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
        h,
        { type: "secondary", style: { fontSize: 11 } },
        U ? `${e.mode === "debate" ? "裁决者" : "主控"}: ${U}` : "OMP 动态编排"
      ),
      l.createElement(
        c,
        {
          type: "primary",
          size: "small",
          icon: w ? l.createElement(w) : void 0,
          disabled: t.length === 0,
          onClick: () => n(e),
          style: De
        },
        "运行工作流"
      )
    )
  );
}
function ki({
  agents: e,
  onLaunch: t
}) {
  const n = k().React, { useMemo: r, useState: a, useCallback: l, useEffect: o } = n, {
    Row: s,
    Col: i,
    Input: d,
    Empty: c,
    Typography: m,
    Tag: u,
    Button: p,
    Divider: w,
    Tabs: y,
    message: g
  } = k().antd, { SearchOutlined: f, PlusOutlined: v, RocketOutlined: E } = k().antdIcons || {}, { Text: h } = m, [S, O] = a(""), [D, $] = a([]), [A, F] = a([]), [V, U] = a(!1), [C, x] = a(null), [z, I] = a("preset");
  o(() => {
    let L = !0;
    return (async () => {
      try {
        await di();
        const le = await jn();
        L && $(le);
      } catch (le) {
        console.warn("[ugsci] Failed to load backend expert teams:", le), L && ($([]), g.warning("专家团后端加载失败，请检查服务后重试"));
      }
    })(), yi().then((le) => {
      L && le && F(le);
    }), () => {
      L = !1;
    };
  }, []);
  const W = l(() => {
    jn().then($).catch((L) => {
      console.warn("[ugsci] Failed to refresh expert teams:", L), $([]), g.warning("专家团后端加载失败，请检查服务后重试");
    });
  }, [g]), j = l(
    (L) => {
      ci(L.id).then(() => {
        W(), g.success(`团队「${L.name}」已删除`);
      }).catch((le) => g.error(le.message || "删除专家团失败"));
    },
    [g, W]
  ), G = l((L) => {
    x(L), U(!0);
  }, []), R = l(() => {
    x(null), U(!0);
  }, []), P = r(() => [...D, ...A], [D, A]), ee = r(() => {
    if (!S.trim()) return P;
    const L = S.toLowerCase();
    return P.filter(
      (le) => le.name.toLowerCase().includes(L) || le.description.toLowerCase().includes(L) || le.category.toLowerCase().includes(L)
    );
  }, [P, S]), oe = ee.filter((L) => L.custom), B = ee.filter((L) => !L.custom);
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
      n.createElement(d, {
        placeholder: "搜索团队名称、描述或类别...",
        prefix: f ? n.createElement(f) : void 0,
        value: S,
        onChange: (L) => O(L.target.value),
        allowClear: !0,
        style: { flex: "1 1 280px", maxWidth: 400 }
      }),
      n.createElement(
        p,
        {
          type: "primary",
          size: "small",
          icon: v ? n.createElement(v) : void 0,
          onClick: R,
          style: De
        },
        "创建专家团"
      )
    ),
    // Tabs: preset teams vs custom teams
    n.createElement(
      y,
      {
        activeKey: z,
        onChange: I,
        items: [
          {
            key: "preset",
            label: `预设团队${B.length ? ` (${B.length})` : ""}`,
            children: n.createElement(
              "div",
              null,
              B.length > 0 ? n.createElement(
                s,
                { gutter: [12, 12] },
                ...B.map(
                  (L) => n.createElement(
                    i,
                    { key: L.id, xs: 24, sm: 12, md: 8 },
                    n.createElement(Yr, {
                      team: L,
                      agents: e,
                      onLaunch: t
                    })
                  )
                )
              ) : n.createElement(c, {
                description: "未找到匹配的预设团队",
                image: c.PRESENTED_IMAGE_SIMPLE
              })
            )
          },
          {
            key: "custom",
            label: `自定义团队${oe.length ? ` (${oe.length})` : ""}`,
            children: n.createElement(
              "div",
              null,
              oe.length > 0 ? n.createElement(
                s,
                { gutter: [12, 12] },
                ...oe.map(
                  (L) => n.createElement(
                    i,
                    { key: L.id, xs: 24, sm: 12, md: 8 },
                    n.createElement(Yr, {
                      team: L,
                      agents: e,
                      onLaunch: t,
                      onEdit: G,
                      onDelete: j
                    })
                  )
                )
              ) : n.createElement(c, {
                description: "暂无自定义团队，点击「创建专家团」自定义",
                image: c.PRESENTED_IMAGE_SIMPLE
              })
            )
          },
          {
            key: "active",
            label: "进行中的讨论",
            children: n.createElement(
              n.Fragment,
              null,
              n.createElement(vi, {
                enabled: z === "active"
              }),
              n.createElement(Jr, {
                activeOnly: !0,
                enabled: z === "active"
              })
            )
          },
          {
            key: "history",
            label: "讨论历史",
            children: n.createElement(Jr, {
              enabled: z === "history"
            })
          }
        ]
      }
    ),
    // Team Builder Modal
    n.createElement(xi, {
      open: V,
      onClose: () => {
        U(!1), x(null);
      },
      agents: e,
      editingTeam: C,
      onSaved: W
    })
  );
}
const Ci = [
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
], Ti = 5e3, _i = {
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
function Ii(e) {
  window.history.pushState({}, "", e), window.dispatchEvent(new PopStateEvent("popstate"));
}
function zn(e, t) {
  const n = new URLSearchParams();
  e && n.set("flow", e), t && n.set("run", t), Ii(`/flowforge${n.size ? `?${n.toString()}` : ""}`);
}
function Ai(e) {
  return e ? new Date(e * 1e3).toLocaleString("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  }) : "—";
}
function zi(e) {
  if (!e || e <= 0) return "—";
  if (e < 1e3) return `${e}ms`;
  const t = Math.floor(e / 1e3);
  if (t < 60) return `${t}s`;
  const n = Math.floor(t / 60), r = t % 60;
  return `${n}m${r}s`;
}
function $i(e) {
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
const Yt = /* @__PURE__ */ new Set(["running", "queued", "paused", "waiting_human"]);
function Pi() {
  const e = k().React, { useCallback: t, useEffect: n, useRef: r, useState: a } = e, {
    Alert: l,
    Button: o,
    Card: s,
    Col: i,
    Empty: d,
    Input: c,
    Popconfirm: m,
    Row: u,
    Space: p,
    Spin: w,
    Tabs: y,
    Tag: g,
    Tooltip: f,
    Typography: v,
    message: E
  } = k().antd, {
    ApartmentOutlined: h,
    DeleteOutlined: S,
    ReloadOutlined: O,
    RocketOutlined: D,
    PlayCircleOutlined: $,
    StopOutlined: A
  } = k().antdIcons || {}, { Text: F, Paragraph: V, Title: U } = v, C = k().useSelectedAgent, x = C ? C() : { id: "default" }, z = (x == null ? void 0 : x.id) || "default", [I, W] = a([]), [j, G] = a([]), [R, P] = a([]), [ee, oe] = a(!0), [B, L] = a(!0), [le, re] = a(null), [J, me] = a(""), [M, ce] = a(""), [ye, Z] = a("templates"), [se, te] = a(/* @__PURE__ */ new Set()), be = r(null), ve = j.some((_) => Yt.has(_.status)), $e = e.useMemo(() => {
    const _ = {};
    return I.forEach((ae) => {
      _[ae.id] = ae.name;
    }), _;
  }, [I]), Se = e.useMemo(() => {
    const _ = {};
    return j.forEach((ae) => {
      Yt.has(ae.status) && (_[ae.flow_id] = (_[ae.flow_id] || 0) + 1);
    }), _;
  }, [j]), ne = t(async (_ = !1) => {
    _ || oe(!0);
    try {
      const [ae, fe, _e] = await Promise.all([
        de("/flowforge/flows", { bypassCache: !0 }),
        de("/flowforge/runs", { bypassCache: !0 }),
        bn().catch(() => [])
      ]);
      W(ae), G(fe), P(_e), L(!0);
    } catch (ae) {
      console.warn("[ugsci] FlowForge is unavailable:", ae), L(!1);
    } finally {
      _ || oe(!1);
    }
  }, []);
  n(() => {
    ne();
  }, [ne]), n(() => {
    if (!B || !ve) {
      be.current && (clearTimeout(be.current), be.current = null);
      return;
    }
    return be.current = setTimeout(() => {
      ne(!0);
    }, Ti), () => {
      be.current && (clearTimeout(be.current), be.current = null);
    };
  }, [ve, B, ne]);
  const we = t(
    async (_) => {
      if (!le) {
        re(_.key);
        try {
          const ae = await de(
            "/flowforge/generate",
            {
              method: "POST",
              body: JSON.stringify({
                prompt: _.sop,
                name: _.name,
                agent_id: z
              })
            }
          ), fe = {
            ...ae.nodes || {}
          }, _e = Object.entries(fe).filter(([Xe]) => /^step_\d+$/.test(Xe)).sort(([Xe], [Me]) => Number(Xe.slice(5)) - Number(Me.slice(5))), Be = {};
          let qe = 0, Je = 0;
          _e.forEach(([Xe, Me], Ae) => {
            const ie = _.roleHints[Ae] || "", Pe = _.roleKeys[Ae] || "analyst", ze = R.find(
              (Ze) => `${Ze.name} ${Ze.id}`.toLowerCase().includes(ie.toLowerCase())
            );
            ze ? qe++ : Je++;
            const Le = (ze == null ? void 0 : ze.id) || z, Qe = { ...Me.inputs || {} };
            Qe.agent_id = Le, fe[Xe] = {
              ...Me,
              inputs: Qe,
              metadata: {
                ...Me.metadata || {},
                binding_policy: "fixed_instance",
                role_hint: ie,
                role_key: Pe,
                agent_id: Le
              }
            }, Be[Xe] = {
              binding_policy: "fixed_instance",
              role_hint: ie,
              role_key: Pe,
              agent_id: Le
            };
          });
          const Ue = {
            ...ae,
            nodes: fe,
            id: `${_.key}-${Date.now()}`,
            name: _.name,
            description: _.description,
            metadata: {
              ...ae.metadata || {},
              domain: "oil-gas",
              template_key: _.key,
              expert_binding_policy: "fixed_instance",
              controller_agent_id: z,
              node_bindings: Be
            }
          };
          await de("/flowforge/flows", {
            method: "POST",
            body: JSON.stringify(Ue)
          });
          const it = _e.length > 0 ? `（${qe} 个专家已匹配，${Je} 个回退到控制器）` : "";
          E.success(`已创建工作流草稿「${_.name}」${it}`), await ne();
        } catch (ae) {
          E.error(ae.message || "创建工作流失败");
        } finally {
          re(null);
        }
      }
    },
    [R, z, le, ne, E]
  ), Ce = t(async () => {
    if (!le) {
      if (!M.trim()) {
        E.warning("请先描述工作流步骤和控制要求");
        return;
      }
      re("natural-language");
      try {
        const _ = await de(
          "/flowforge/generate",
          {
            method: "POST",
            body: JSON.stringify({
              prompt: M.trim(),
              name: J.trim(),
              agent_id: z
            })
          }
        ), ae = {
          ..._,
          id: `natural-${Date.now()}`,
          metadata: {
            ..._.metadata || {},
            domain: "oil-gas",
            source: "natural-language",
            expert_binding_policy: "fixed_instance",
            controller_agent_id: z
          }
        };
        await de("/flowforge/flows", {
          method: "POST",
          body: JSON.stringify(ae)
        }), E.success("已从自然语言生成可编辑工作流草稿"), me(""), ce(""), await ne();
      } catch (_) {
        E.error(_.message || "自然语言生成失败");
      } finally {
        re(null);
      }
    }
  }, [z, le, ne, E, J, M]), K = t(
    async (_, ae) => {
      try {
        await de(`/flowforge/flows/${encodeURIComponent(_)}/run`, {
          method: "POST",
          body: JSON.stringify({ inputs: {} })
        }), E.success(`已启动工作流「${ae}」`), await ne(!0);
      } catch (fe) {
        E.error(fe.message || "启动工作流失败");
      }
    },
    [ne, E]
  ), ue = t(
    async (_, ae) => {
      try {
        await de(`/flowforge/flows/${encodeURIComponent(_)}`, {
          method: "DELETE"
        }), E.success(`已删除工作流「${ae}」`), await ne();
      } catch (fe) {
        E.error(fe.message || "删除工作流失败");
      }
    },
    [ne, E]
  ), he = t(
    async (_) => {
      te((ae) => {
        const fe = new Set(ae);
        return fe.add(_), fe;
      });
      try {
        await de(`/flowforge/runs/${encodeURIComponent(_)}/cancel`, {
          method: "POST"
        }), E.success("已请求取消运行"), await ne(!0);
      } catch (ae) {
        E.error(ae.message || "取消运行失败");
      } finally {
        te((ae) => {
          const fe = new Set(ae);
          return fe.delete(_), fe;
        });
      }
    },
    [ne, E]
  ), H = e.createElement(
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
        e.createElement(c, {
          value: J,
          onChange: (_) => me(_.target.value),
          placeholder: "工作流名称（可选）",
          maxLength: 80
        }),
        e.createElement(c.TextArea, {
          value: M,
          onChange: (_) => ce(_.target.value),
          placeholder: "例如：先检查某储气库本周期压力和注采量数据，再由油藏工程师预测下周期能力，由独立完整性专家复核风险，最后形成带证据和不确定性的建议。",
          autoSize: { minRows: 3, maxRows: 8 }
        }),
        e.createElement(
          o,
          {
            type: "primary",
            onClick: () => void Ce(),
            loading: le === "natural-language",
            disabled: !B || !!le,
            style: De
          },
          "生成可编辑草稿"
        )
      )
    ),
    e.createElement(
      u,
      { gutter: [12, 12] },
      ...Ci.map(
        (_) => e.createElement(
          i,
          { key: _.key, xs: 24, md: 8 },
          e.createElement(
            s,
            { style: { height: "100%" } },
            e.createElement(
              p,
              { align: "start", style: { width: "100%" } },
              e.createElement("span", { style: { fontSize: 28 } }, _.icon),
              e.createElement(
                "div",
                { style: { flex: 1 } },
                e.createElement(U, { level: 5, style: { margin: 0 } }, _.name),
                e.createElement(g, { color: "blue", style: { marginTop: 6 } }, _.category),
                e.createElement(
                  V,
                  { type: "secondary", style: { margin: "10px 0 14px" } },
                  _.description
                ),
                e.createElement(
                  o,
                  {
                    type: "primary",
                    loading: le === _.key,
                    disabled: !B || !!le,
                    onClick: () => void we(_),
                    style: De
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
          ([_, ae, fe]) => e.createElement(
            i,
            { key: _, xs: 24, sm: 12, lg: 6 },
            e.createElement(F, { strong: !0 }, _),
            e.createElement(
              g,
              {
                color: fe === "当前可执行" ? "green" : "default",
                style: { marginLeft: 6, fontSize: 10 }
              },
              fe
            ),
            e.createElement("div", { style: { color: "var(--ant-color-text-tertiary, #8c8c8c)", fontSize: 12, marginTop: 4 } }, ae)
          )
        )
      )
    )
  ), T = ee ? e.createElement(w) : I.length === 0 ? e.createElement(d, { description: "暂无工作流，可从模板创建" }) : e.createElement(
    u,
    { gutter: [12, 12] },
    ...I.map((_) => {
      const ae = Se[_.id] || 0;
      return e.createElement(
        i,
        { key: _.id, xs: 24, md: 12, xl: 8 },
        e.createElement(
          s,
          {
            size: "small",
            title: e.createElement(
              p,
              { size: 6 },
              e.createElement("span", null, _.name),
              ae > 0 ? e.createElement(
                g,
                { color: "blue" },
                `${ae} 个运行中`
              ) : null
            ),
            extra: e.createElement(g, null, `v${_.version}`)
          },
          e.createElement(V, { ellipsis: { rows: 2 } }, _.description || "暂无描述"),
          e.createElement(
            p,
            { size: 8, wrap: !0 },
            e.createElement(g, { color: "geekblue" }, `${_.node_count} 个节点`),
            e.createElement(o, {
              size: "small",
              type: "primary",
              icon: $ ? e.createElement($) : void 0,
              disabled: !B,
              onClick: () => void K(_.id, _.name)
            }, "运行"),
            e.createElement(o, {
              size: "small",
              onClick: () => zn(_.id)
            }, "编辑"),
            e.createElement(
              m,
              {
                title: "确认删除",
                description: `确定要删除工作流「${_.name}」吗？此操作不可撤销。`,
                onConfirm: () => void ue(_.id, _.name),
                okText: "删除",
                cancelText: "取消",
                okButtonProps: { danger: !0 }
              },
              e.createElement(o, {
                size: "small",
                danger: !0,
                icon: S ? e.createElement(S) : void 0
              }, "删除")
            )
          )
        )
      );
    })
  ), pe = ee ? e.createElement(w) : j.length === 0 ? e.createElement(d, { description: "暂无工作流运行记录" }) : e.createElement(
    "div",
    { style: { display: "flex", flexDirection: "column", gap: 8 } },
    ...j.map((_) => {
      const ae = $e[_.flow_id] || _.flow_id, fe = Yt.has(_.status), _e = $i(_.node_statuses), Be = _.duration_ms && _.duration_ms > 0 ? _.duration_ms : _.finished_at && _.started_at ? (_.finished_at - _.started_at) * 1e3 : fe && _.started_at ? (Date.now() / 1e3 - _.started_at) * 1e3 : 0;
      return e.createElement(
        s,
        { key: _.run_id, size: "small" },
        e.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" } },
          e.createElement(
            g,
            { color: _i[_.status] || "default" },
            _.status
          ),
          e.createElement(F, { strong: !0 }, ae),
          e.createElement(
            f,
            { title: _.run_id },
            e.createElement(
              F,
              { type: "secondary", style: { fontFamily: "monospace", fontSize: 11 } },
              _.run_id.slice(0, 8) + "…"
            )
          ),
          e.createElement(
            F,
            { type: "secondary", style: { fontSize: 12 } },
            Ai(_.started_at)
          ),
          Be > 0 ? e.createElement(
            F,
            { type: "secondary", style: { fontSize: 12 } },
            `耗时 ${zi(Be)}`
          ) : null,
          _e ? e.createElement(g, { color: "geekblue", style: { fontSize: 11 } }, _e) : null,
          _.error ? e.createElement(
            f,
            { title: _.error },
            e.createElement(F, { type: "danger", style: { fontSize: 12 } }, "（有错误）")
          ) : null,
          e.createElement(
            "div",
            { style: { marginLeft: "auto", display: "flex", gap: 6 } },
            fe ? e.createElement(
              m,
              {
                title: "确认取消运行？",
                onConfirm: () => void he(_.run_id),
                okText: "取消运行",
                cancelText: "保留",
                okButtonProps: { danger: !0 }
              },
              e.createElement(o, {
                size: "small",
                danger: !0,
                loading: se.has(_.run_id),
                icon: A ? e.createElement(A) : void 0
              }, "取消运行")
            ) : null,
            e.createElement(
              o,
              { size: "small", type: "link", onClick: () => zn(void 0, _.run_id) },
              "查看详情"
            )
          )
        )
      );
    })
  ), X = e.createElement(
    p,
    null,
    e.createElement(o, {
      icon: O ? e.createElement(O) : void 0,
      onClick: () => void ne(),
      loading: ee
    }, "刷新"),
    ye !== "templates" ? e.createElement(o, {
      type: "primary",
      icon: h ? e.createElement(h) : D ? e.createElement(D) : void 0,
      onClick: () => zn(),
      disabled: !B,
      style: De
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
        { key: "templates", label: "工作流模板", children: H },
        { key: "mine", label: `我的工作流 (${I.length})`, children: T },
        {
          key: "runs",
          label: e.createElement(
            "span",
            null,
            "运行中心 (",
            j.length,
            ve ? e.createElement(
              "span",
              { style: { color: "#1677ff", marginLeft: 2 } },
              `·${j.filter((_) => Yt.has(_.status)).length} 活跃`
            ) : null,
            ")"
          ),
          children: pe
        }
      ],
      activeKey: ye,
      onChange: (_) => Z(_),
      tabBarExtraContent: X
    })
  );
}
function Qr(e, t) {
  var a, l;
  const n = e.coordinatorName || ((a = e.members[0]) == null ? void 0 : a.name), r = e.members.find((o) => o.name === n) || e.members[0];
  if ((r == null ? void 0 : r.bindingMode) !== "temporary" && (r != null && r.agentId) && t.some((o) => o.id === r.agentId))
    return r.agentId;
  if (n && (r == null ? void 0 : r.bindingMode) !== "temporary") {
    const o = el(t, n);
    if (o) return o;
  }
  return (r == null ? void 0 : r.bindingMode) === "fixed" ? null : ((l = t[0]) == null ? void 0 : l.id) || null;
}
function Zr() {
  const e = new URLSearchParams(window.location.search).get("section");
  return e === "teams" || e === "workflows" ? e : "experts";
}
function Ri() {
  var ue, he;
  const e = k().React, { useState: t, useEffect: n, useCallback: r, useMemo: a } = e, {
    Spin: l,
    Empty: o,
    Input: s,
    Button: i,
    message: d,
    Row: c,
    Col: m,
    Tabs: u,
    Modal: p,
    Typography: w
  } = k().antd, {
    ReloadOutlined: y,
    PlusOutlined: g,
    SearchOutlined: f,
    TeamOutlined: v,
    UserOutlined: E
  } = k().antdIcons || {}, { Text: h, Paragraph: S } = w, [O, D] = t([]), [$, A] = t(!0), [F, V] = t(!1), [U, C] = t(null), [x, z] = t(""), [I, W] = t(!1), [j, G] = t(Zr), [R, P] = t(
    null
  ), [ee, oe] = t(""), [B, L] = t(!1), [le, re] = t(!1), [J, me] = t(null), [M, ce] = t([]), ye = r(async () => {
    A(!0);
    try {
      const H = await bn(), T = await Promise.all(
        H.map(async (pe) => {
          try {
            const [X, _, ae] = await Promise.all([
              tr(pe.id).catch(() => null),
              vn(pe.id).catch(() => []),
              ar(pe.id).catch(() => [])
            ]);
            return {
              agent: pe,
              config: X,
              skills: _,
              mcps: ae,
              loading: !1
            };
          } catch {
            return {
              agent: pe,
              config: null,
              skills: [],
              mcps: [],
              loading: !1
            };
          }
        })
      );
      D(T), ce(H);
    } catch (H) {
      d.error(H.message || "加载专家列表失败"), D([]);
    } finally {
      A(!1);
    }
  }, []);
  n(() => {
    ye();
  }, [ye]), n(() => {
    const H = () => G(Zr());
    return window.addEventListener("popstate", H), () => window.removeEventListener("popstate", H);
  }, []), n(() => {
    if (J && le) {
      const H = O.find(
        (T) => T.agent.id === J.agent.id
      );
      H && H !== J && me(H);
    }
  }, [O, J, le]);
  const Z = r(
    async (H) => {
      var _;
      const T = H.coordinatorName || ((_ = H.members[0]) == null ? void 0 : _.name), pe = Qr(H, M);
      if (!pe) {
        const ae = H.members.find(
          (fe) => fe.name === T
        );
        d.error(
          (ae == null ? void 0 : ae.bindingMode) === "fixed" ? `固定协调者「${T || "协调者"}」当前不可用，请修复绑定后再运行` : "没有可用的 Agent 作为工作流控制器"
        );
        return;
      }
      if (/\{.+?\}/.test(H.taskTemplate)) {
        oe(H.taskTemplate), P(H);
        return;
      }
      await se(H, pe, H.taskTemplate);
    },
    [M, d]
  ), se = r(
    async (H, T, pe) => {
      L(!0);
      try {
        const X = pe || H.taskTemplate, _ = H.custom ? `@${H.id}` : H.name, ae = `/ugsci-team ${H.mode} ${_} ${X}`, fe = k();
        fe.setSelectedAgent && fe.setSelectedAgent(T);
        const _e = await mi(
          T,
          ae,
          H.name
        );
        d.success(
          `OMP 工作流已启动：${H.name}（${H.mode}模式）`
        ), P(null), te(`/chat/${_e}`);
      } catch (X) {
        d.error(X.message || "发起团队任务失败");
      } finally {
        L(!1);
      }
    },
    [d]
  ), te = (H) => {
    window.history.pushState({}, "", H), window.dispatchEvent(new PopStateEvent("popstate"));
  }, be = r((H) => {
    C(H), V(!0);
  }, []), ve = r((H) => {
    me(H), re(!0);
  }, []), $e = r(
    (H) => {
      if (!H.agent.enabled) {
        d.warning(`专家「${H.agent.name}」未启用，请先启用`);
        return;
      }
      try {
        const T = k();
        T.setSelectedAgent && T.setSelectedAgent(H.agent.id);
      } catch (T) {
        console.warn("[ugsci] Failed to set selected agent:", T);
      }
      d.success(`已召唤专家「${H.agent.name}」，正在跳转至对话...`), te("/chat");
    },
    [d]
  ), Se = a(() => {
    if (!x.trim()) return O;
    const H = x.toLowerCase();
    return O.filter(
      (T) => {
        var pe;
        return T.agent.name.toLowerCase().includes(H) || ((pe = T.agent.description) == null ? void 0 : pe.toLowerCase().includes(H)) || T.agent.id.toLowerCase().includes(H) || T.skills.some((X) => X.name.toLowerCase().includes(H));
      }
    );
  }, [O, x]), ne = O.filter((H) => H.agent.enabled).length, we = O.reduce(
    (H, T) => H + T.skills.filter((pe) => pe.enabled !== !1).length,
    0
  ), Ce = O.reduce((H, T) => H + T.mcps.length, 0), K = [
    {
      key: "experts",
      label: e.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        E ? e.createElement(E, { style: { fontSize: 14 } }) : null,
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
            prefix: f ? e.createElement(f) : void 0,
            value: x,
            onChange: (H) => z(H.target.value),
            allowClear: !0,
            style: { flex: "1 1 280px", maxWidth: 400 }
          }),
          e.createElement(
            i,
            {
              type: "primary",
              icon: g ? e.createElement(g) : void 0,
              onClick: () => W(!0),
              style: De
            },
            "创建专家"
          )
        ),
        // Content
        $ ? e.createElement(
          "div",
          { style: { textAlign: "center", padding: 60 } },
          e.createElement(l, { size: "large" })
        ) : Se.length === 0 ? e.createElement(o, {
          description: x ? "未找到匹配的专家" : "暂无专家，点击「创建专家」添加"
        }) : e.createElement(
          c,
          { gutter: [12, 12], align: "stretch" },
          ...Se.map(
            (H) => e.createElement(
              m,
              {
                key: H.agent.id,
                xs: 24,
                sm: 12,
                md: 8,
                lg: 6,
                style: { display: "flex" }
              },
              e.createElement(Zo, {
                expert: H,
                onClick: () => be(H),
                onSummon: () => $e(H),
                onConfigure: () => ve(H)
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
        v ? e.createElement(v, { style: { fontSize: 14 } }) : null,
        "专家团"
      ),
      children: e.createElement(ki, {
        agents: M,
        onLaunch: Z
      })
    },
    {
      key: "workflows",
      label: e.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        (ue = k().antdIcons) != null && ue.ApartmentOutlined ? e.createElement(k().antdIcons.ApartmentOutlined, {
          style: { fontSize: 14 }
        }) : null,
        "协作工作流"
      ),
      children: e.createElement(Pi)
    }
  ];
  return e.createElement(
    "div",
    { style: { padding: 24 } },
    e.createElement(En, {
      title: "专家·协作",
      subtitle: j === "experts" ? `共 ${O.length} 位专家（${ne} 位启用）· ${we} 个技能 · ${Ce} 个 MCP 客户端` : j === "teams" ? "开放式多专家讨论、联合研判与 OMP 动态协作" : "流程化、可观测、可验证的油气与储气库协作流程",
      extra: e.createElement(
        e.Fragment,
        null,
        j === "experts" ? e.createElement(
          i,
          {
            icon: y ? e.createElement(y) : void 0,
            onClick: () => {
              Dt(), ye();
            },
            loading: $
          },
          "刷新"
        ) : null
      )
    }),
    e.createElement(u, {
      items: K,
      activeKey: j,
      onChange: (H) => {
        G(H);
        const T = new URL(window.location.href);
        H === "experts" ? T.searchParams.delete("section") : T.searchParams.set("section", H), window.history.pushState({}, "", `${T.pathname}${T.search}`);
      }
    }),
    // Drawer
    e.createElement(ei, {
      expert: U,
      open: F,
      onClose: () => V(!1),
      onRefresh: () => ye()
    }),
    // Template Modal
    e.createElement(ti, {
      open: I,
      onClose: () => W(!1),
      onCreated: () => ye()
    }),
    // Config Modal (gear icon)
    e.createElement(Yo, {
      expert: J,
      open: le,
      onClose: () => re(!1),
      onRefresh: () => ye()
    }),
    // Team Launch Modal (for filling placeholders)
    R ? e.createElement(
      p,
      {
        open: !0,
        title: e.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 8 } },
          e.createElement(or, {
            members: R.members.map((H) => H.name),
            size: 28
          }),
          e.createElement(
            "span",
            null,
            `发起团队任务 - ${R.name}`
          )
        ),
        onCancel: () => P(null),
        onOk: () => {
          const H = Qr(
            R,
            M
          );
          if (!H) {
            d.error("固定协调者不可用或没有可用的控制器 Agent");
            return;
          }
          const T = ee.trim() || R.taskTemplate;
          se(R, H, T);
        },
        confirmLoading: B,
        okText: "发起任务",
        width: 600
      },
      e.createElement(
        "div",
        null,
        e.createElement(
          h,
          {
            type: "secondary",
            style: { fontSize: 12, display: "block", marginBottom: 8 }
          },
          "任务内容（请替换 {参数名} 等占位符后发起）："
        ),
        e.createElement(s.TextArea, {
          value: ee,
          onChange: (H) => oe(H.target.value),
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
          h,
          { style: { fontSize: 12, color: "#0958d9" } },
          `协调者: ${R.coordinatorName || ((he = R.members[0]) == null ? void 0 : he.name) || "—"} · 成员: ${R.members.map((H) => H.name).join("、")}`
        )
      )
    ) : null
  );
}
function Oi({
  agentId: e,
  agentName: t,
  refreshKey: n = 0,
  onNavigate: r
}) {
  const a = k().React, { useState: l, useEffect: o, useCallback: s } = a, {
    Spin: i,
    Empty: d,
    Button: c,
    Row: m,
    Col: u,
    Card: p,
    Tag: w,
    Checkbox: y,
    Modal: g,
    Typography: f,
    Drawer: v,
    Descriptions: E,
    message: h
  } = k().antd, {
    ReloadOutlined: S,
    ThunderboltOutlined: O,
    SettingOutlined: D,
    CheckSquareOutlined: $,
    EyeOutlined: A,
    EyeInvisibleOutlined: F,
    DeleteOutlined: V,
    CloseOutlined: U
  } = k().antdIcons || {}, { Text: C, Paragraph: x } = f, [z, I] = l([]), [W, j] = l(!0), [G, R] = l(!1), [P, ee] = l(null), [oe, B] = l(!1), [L, le] = l(
    /* @__PURE__ */ new Set()
  ), [re, J] = l(!1), [me, M] = l(null), [ce, ye] = l(!1), Z = s(async () => {
    if (e) {
      j(!0);
      try {
        const K = await vn(e);
        I(K);
      } catch (K) {
        h.error(K.message || "加载技能失败"), I([]);
      } finally {
        j(!1);
      }
    }
  }, [e]);
  o(() => {
    Z();
  }, [Z, n]);
  const se = (K) => {
    le((ue) => {
      const he = new Set(ue);
      return he.has(K) ? he.delete(K) : he.add(K), he;
    });
  }, te = () => le(/* @__PURE__ */ new Set()), be = () => le(new Set(z.map((K) => K.name))), ve = () => {
    oe ? (te(), B(!1)) : B(!0);
  }, $e = async () => {
    const K = Array.from(L);
    if (K.length !== 0) {
      J(!0);
      try {
        const { results: ue } = await Io(e, K), he = Object.entries(ue).filter(
          ([, T]) => T.success === !1
        ), H = K.length - he.length;
        he.length > 0 ? h.warning(
          `批量启用完成：成功 ${H} 个，失败 ${he.length} 个`
        ) : h.success(`成功启用 ${K.length} 个技能`), te(), await Z();
      } catch (ue) {
        h.error(ue.message || "批量启用失败");
      } finally {
        J(!1);
      }
    }
  }, Se = async () => {
    const K = Array.from(L);
    if (K.length !== 0) {
      J(!0);
      try {
        const { results: ue } = await Ao(e, K), he = Object.entries(ue).filter(
          ([, T]) => T.success === !1
        ), H = K.length - he.length;
        he.length > 0 ? h.warning(
          `批量停用完成：成功 ${H} 个，失败 ${he.length} 个`
        ) : h.success(`成功停用 ${K.length} 个技能`), te(), await Z();
      } catch (ue) {
        h.error(ue.message || "批量停用失败");
      } finally {
        J(!1);
      }
    }
  }, ne = () => {
    const K = Array.from(L);
    K.length !== 0 && g.confirm({
      title: `确认删除 ${K.length} 个技能？`,
      content: "删除后技能将从当前专家工作区移除，此操作不可撤销。技能池中的原始技能不受影响。",
      okText: "确认删除",
      cancelText: "取消",
      okButtonProps: { danger: !0 },
      onOk: async () => {
        J(!0);
        try {
          const { results: ue } = await zo(e, K), he = Object.entries(ue).filter(
            ([, T]) => T.success === !1
          ), H = K.length - he.length;
          he.length > 0 ? h.warning(
            `批量删除完成：成功 ${H} 个，失败 ${he.length} 个`
          ) : h.success(`成功删除 ${K.length} 个技能`), te(), await Z();
        } catch (ue) {
          h.error(ue.message || "批量删除失败");
        } finally {
          J(!1);
        }
      }
    });
  }, we = async (K) => {
    ye(!0);
    try {
      K.enabled === !1 ? (await Ga(e, K.name), h.success(`已启用技能「${K.name}」`)) : (await Wa(e, K.name), h.success(`已禁用技能「${K.name}」`)), await Z();
    } catch (ue) {
      h.error(ue.message || "操作失败");
    } finally {
      ye(!1);
    }
  }, Ce = (K) => {
    g.confirm({
      title: `确认删除技能「${K.name}」？`,
      content: "删除后技能将从当前专家工作区移除，此操作不可撤销。技能池中的原始技能不受影响。",
      okText: "确认删除",
      cancelText: "取消",
      okButtonProps: { danger: !0 },
      onOk: async () => {
        ye(!0);
        try {
          await rr(e, K.name), h.success(`已删除技能「${K.name}」`), await Z();
        } catch (ue) {
          h.error(ue.message || "删除失败");
        } finally {
          ye(!1);
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
        oe ? `已选择 ${L.size} / ${z.length} 个技能` : `共 ${z.length} 个技能`
      ),
      a.createElement(
        "div",
        { style: { display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" } },
        oe ? a.createElement(
          a.Fragment,
          null,
          a.createElement(
            c,
            { size: "small", onClick: be },
            "全选"
          ),
          a.createElement(
            c,
            {
              size: "small",
              icon: U ? a.createElement(U) : void 0,
              onClick: te
            },
            "取消选择"
          ),
          a.createElement(
            c,
            {
              size: "small",
              type: "default",
              icon: A ? a.createElement(A) : void 0,
              disabled: L.size === 0 || re,
              loading: re,
              onClick: $e
            },
            "批量启用"
          ),
          a.createElement(
            c,
            {
              size: "small",
              danger: !0,
              icon: F ? a.createElement(F) : void 0,
              disabled: L.size === 0 || re,
              loading: re,
              onClick: Se
            },
            "批量停用"
          ),
          a.createElement(
            c,
            {
              size: "small",
              danger: !0,
              icon: V ? a.createElement(V) : void 0,
              disabled: L.size === 0 || re,
              loading: re,
              onClick: ne
            },
            `删除 (${L.size})`
          ),
          a.createElement(
            c,
            {
              size: "small",
              type: "primary",
              onClick: ve
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
              icon: $ ? a.createElement($) : void 0,
              onClick: ve,
              disabled: z.length === 0
            },
            "批量管理"
          ),
          a.createElement(
            c,
            {
              icon: S ? a.createElement(S) : void 0,
              onClick: () => {
                Dt(), Z();
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
    ) : z.length === 0 ? a.createElement(d, {
      description: "当前智能体未加载任何技能"
    }) : a.createElement(
      m,
      { gutter: [12, 12] },
      ...z.map(
        (K) => a.createElement(
          u,
          { key: K.name, xs: 24, sm: 12, md: 8, lg: 6 },
          a.createElement(
            p,
            {
              hoverable: !0,
              size: "small",
              style: {
                cursor: oe ? "default" : "pointer",
                height: "100%",
                position: "relative",
                borderColor: oe && L.has(K.name) ? "#0072f5" : void 0,
                borderWidth: oe && L.has(K.name) ? 2 : 1
              },
              onClick: () => {
                oe ? se(K.name) : (ee(K), R(!0));
              },
              onMouseEnter: () => {
                oe || M(K.name);
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
                onClick: (ue) => {
                  ue.stopPropagation(), se(K.name);
                }
              },
              a.createElement(y, {
                checked: L.has(K.name)
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
              K.emoji ? a.createElement(
                "span",
                { style: { fontSize: 18 } },
                K.emoji
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
                K.name
              ),
              K.enabled === !1 ? a.createElement(
                w,
                { color: "default", style: { fontSize: 10 } },
                "已禁用"
              ) : a.createElement(
                w,
                { color: "green", style: { fontSize: 10 } },
                "已启用"
              )
            ),
            K.description ? a.createElement(
              x,
              {
                type: "secondary",
                style: { fontSize: 11, margin: 0, lineHeight: 1.4 },
                ellipsis: { rows: 2 }
              },
              K.description
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
              K.version_text ? a.createElement(
                w,
                { style: { fontSize: 10 } },
                `v${K.version_text}`
              ) : null,
              ...(K.tags || []).slice(0, 3).map(
                (ue, he) => a.createElement(
                  w,
                  { key: he, color: "blue", style: { fontSize: 10 } },
                  ue
                )
              )
            ),
            // Hover action footer (not in batch mode)
            !oe && me === K.name ? a.createElement(
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
                  icon: K.enabled === !1 ? A ? a.createElement(A) : void 0 : F ? a.createElement(F) : void 0,
                  disabled: ce,
                  onClick: (ue) => {
                    ue.stopPropagation(), we(K);
                  }
                },
                K.enabled === !1 ? "启用" : "禁用"
              ),
              a.createElement(
                c,
                {
                  size: "small",
                  danger: !0,
                  icon: V ? a.createElement(V) : void 0,
                  disabled: ce,
                  onClick: (ue) => {
                    ue.stopPropagation(), Ce(K);
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
    P ? a.createElement(
      v,
      {
        title: a.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 8 } },
          a.createElement(
            "span",
            { style: { fontSize: 18 } },
            P.emoji || "⚡"
          ),
          a.createElement("span", null, P.name)
        ),
        open: G,
        onClose: () => R(!1),
        width: 520,
        extra: a.createElement(
          c,
          {
            type: "primary",
            size: "small",
            icon: D ? a.createElement(D) : void 0,
            onClick: () => r("/skills")
          },
          "管理技能"
        )
      },
      a.createElement(
        E,
        { column: 1, bordered: !0, size: "small" },
        a.createElement(
          E.Item,
          { label: "技能名称" },
          P.name
        ),
        a.createElement(
          E.Item,
          { label: "描述" },
          P.description || "-"
        ),
        P.version_text ? a.createElement(
          E.Item,
          { label: "版本" },
          P.version_text
        ) : null,
        a.createElement(
          E.Item,
          { label: "来源" },
          P.source || "-"
        ),
        a.createElement(
          E.Item,
          { label: "状态" },
          P.enabled === !1 ? "已禁用" : "已启用"
        ),
        P.installed_from ? a.createElement(
          E.Item,
          { label: "安装来源" },
          P.installed_from
        ) : null
      ),
      // Tags
      P.tags && P.tags.length > 0 ? a.createElement(
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
          ...P.tags.map(
            (K, ue) => a.createElement(w, { key: ue, color: "blue" }, K)
          )
        )
      ) : null,
      // Skill content preview
      P.content ? a.createElement(
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
          P.content.slice(0, 2e3) + (P.content.length > 2e3 ? `

... (内容已截断)` : "")
        )
      ) : null
    ) : null
  );
}
function Mi({
  poolSkills: e,
  workspaceSkills: t,
  agents: n,
  loading: r,
  onReload: a,
  onSkillInstalled: l,
  agentId: o,
  agentName: s
}) {
  const i = k().React, { useState: d, useMemo: c, useCallback: m, useEffect: u, useRef: p } = i, {
    Spin: w,
    Empty: y,
    Input: g,
    Button: f,
    Row: v,
    Col: E,
    Card: h,
    Tag: S,
    Typography: O,
    Drawer: D,
    Descriptions: $,
    List: A,
    Modal: F,
    message: V
  } = k().antd, {
    ReloadOutlined: U,
    SearchOutlined: C,
    DownloadOutlined: x,
    ThunderboltOutlined: z,
    DeleteOutlined: I,
    PlusOutlined: W
  } = k().antdIcons || {}, { Text: j, Paragraph: G } = O, [R, P] = d(""), [ee, oe] = d(!1), [B, L] = d(null), [le, re] = d([]), [J, me] = d(!1), [M, ce] = d(24), [ye, Z] = d(null), [se, te] = d(!1), be = p(0), ve = p(null), $e = c(
    () => {
      var X;
      return new Set(
        ((X = t.find((_) => _.agent_id === o)) == null ? void 0 : X.skill_names) || []
      );
    },
    [t, o]
  ), Se = c(() => {
    if (!R.trim()) return e;
    const X = R.toLowerCase();
    return e.filter(
      (_) => {
        var ae, fe;
        return _.name.toLowerCase().includes(X) || ((ae = _.description) == null ? void 0 : ae.toLowerCase().includes(X)) || ((fe = _.tags) == null ? void 0 : fe.some((_e) => _e.toLowerCase().includes(X)));
      }
    );
  }, [e, R]), ne = c(
    () => Se.slice(0, M),
    [Se, M]
  );
  u(() => {
    if (ne.length >= Se.length) return;
    const X = ve.current;
    if (!X) return;
    const _ = () => {
      ce(
        (fe) => Math.min(fe + 24, Se.length)
      );
    };
    if (typeof IntersectionObserver < "u") {
      const fe = new IntersectionObserver(
        (_e) => {
          _e.some((Be) => Be.isIntersecting) && _();
        },
        { rootMargin: "240px 0px" }
      );
      return fe.observe(X), () => fe.disconnect();
    }
    const ae = () => {
      X.getBoundingClientRect().top <= window.innerHeight + 240 && _();
    };
    return window.addEventListener("scroll", ae, { passive: !0 }), ae(), () => window.removeEventListener("scroll", ae);
  }, [Se.length, ne.length]);
  const we = m((X) => {
    P(X), ce(24);
  }, []), Ce = m(() => {
    const X = be.current;
    requestAnimationFrame(() => {
      window.scrollTo({ top: X, behavior: "auto" }), document.scrollingElement && (document.scrollingElement.scrollTop = X);
    });
  }, []), K = m(async () => {
    var X;
    be.current = ((X = document.scrollingElement) == null ? void 0 : X.scrollTop) ?? window.scrollY ?? 0;
    try {
      await a();
    } finally {
      Ce();
    }
  }, [a, Ce]), ue = m(
    (X) => {
      const _ = [];
      for (const ae of t)
        if (ae.skill_names.includes(X)) {
          const fe = n.find((_e) => _e.id === ae.agent_id);
          _.push((fe == null ? void 0 : fe.name) || ae.agent_name || ae.agent_id);
        }
      return _;
    },
    [t, n]
  ), he = m(
    async (X) => {
      if (L(X), re(ue(X.name)), oe(!0), !X.content) {
        me(!0);
        try {
          const _ = await wo(X.name);
          L({ ...X, content: _ });
        } catch {
        } finally {
          me(!1);
        }
      }
    },
    [ue]
  );
  u(() => {
    B && re(ue(B.name));
  }, [B, ue, t]);
  const H = async (X) => {
    te(!0);
    try {
      await nr(o, X.name), V.success(
        `已将技能「${X.name}」加载到当前专家「${s}」`
      ), l(X);
    } catch (_) {
      V.error(_.message || "加载技能失败");
    } finally {
      te(!1);
    }
  }, T = (X) => {
    if (X.protected) {
      V.warning("内置技能不可删除");
      return;
    }
    F.confirm({
      title: `确认从技能池删除「${X.name}」？`,
      content: "删除后所有已安装此技能的专家将不受影响，但技能池中将不再包含此技能。此操作不可撤销。",
      okText: "确认删除",
      cancelText: "取消",
      okButtonProps: { danger: !0 },
      onOk: async () => {
        te(!0);
        try {
          await Po(X.name), V.success(`已从技能池删除「${X.name}」`), await K();
        } catch (_) {
          V.error(_.message || "删除失败");
        } finally {
          te(!1);
        }
      }
    });
  }, pe = (X) => {
    window.history.pushState({}, "", X), window.dispatchEvent(new PopStateEvent("popstate"));
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
      i.createElement(g, {
        placeholder: "搜索技能名称、描述或标签...",
        prefix: C ? i.createElement(C) : void 0,
        value: R,
        onChange: (X) => we(X.target.value),
        allowClear: !0,
        style: { maxWidth: 400 }
      }),
      i.createElement(
        "div",
        { style: { display: "flex", gap: 8 } },
        i.createElement(
          f,
          {
            icon: U ? i.createElement(U) : void 0,
            onClick: K,
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
            onClick: () => pe("/skill-pool"),
            size: "small",
            style: De
          },
          "管理技能池"
        )
      )
    ),
    r ? i.createElement(
      "div",
      { style: { textAlign: "center", padding: 60 } },
      i.createElement(w, { size: "large" })
    ) : Se.length === 0 ? i.createElement(y, {
      description: R ? "未找到匹配的技能" : "技能池为空"
    }) : i.createElement(
      i.Fragment,
      null,
      i.createElement(
        v,
        { gutter: [12, 12] },
        ...ne.map(
          (X) => i.createElement(
            E,
            { key: X.name, xs: 24, sm: 12, md: 8, lg: 6 },
            i.createElement(
              h,
              {
                hoverable: !0,
                size: "small",
                style: { cursor: "pointer", height: "100%" },
                onClick: () => he(X),
                onMouseEnter: () => Z(X.name),
                onMouseLeave: () => Z(null)
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
                X.emoji ? i.createElement(
                  "span",
                  { style: { fontSize: 18 } },
                  X.emoji
                ) : i.createElement(
                  "span",
                  { style: { fontSize: 18 } },
                  "⚡"
                ),
                i.createElement(
                  j,
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
                  X.name
                ),
                X.protected ? i.createElement(
                  S,
                  { color: "gold", style: { fontSize: 10 } },
                  "内置"
                ) : null
              ),
              X.description ? i.createElement(
                G,
                {
                  type: "secondary",
                  style: { fontSize: 11, margin: 0, lineHeight: 1.4 },
                  ellipsis: { rows: 2 }
                },
                X.description
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
                X.version_text ? i.createElement(
                  S,
                  { style: { fontSize: 10 } },
                  `v${X.version_text}`
                ) : null,
                ...(X.tags || []).slice(0, 3).map(
                  (_, ae) => i.createElement(
                    S,
                    { key: ae, color: "cyan", style: { fontSize: 10 } },
                    _
                  )
                )
              ),
              // Hover action footer
              ye === X.name ? i.createElement(
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
                    disabled: se || $e.has(X.name),
                    onClick: (_) => {
                      _.stopPropagation(), H(X);
                    }
                  },
                  $e.has(X.name) ? "已加载" : "加载到当前Agent"
                ),
                i.createElement(
                  f,
                  {
                    size: "small",
                    danger: !0,
                    icon: I ? i.createElement(I) : void 0,
                    disabled: se || X.protected,
                    onClick: (_) => {
                      _.stopPropagation(), T(X);
                    }
                  },
                  "删除"
                )
              ) : null
            )
          )
        ),
        // Infinite-scroll sentinel
        ne.length < Se.length ? i.createElement(
          "div",
          {
            ref: ve,
            style: {
              minHeight: 40,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginTop: 16
            }
          },
          i.createElement(
            j,
            { type: "secondary", style: { fontSize: 12 } },
            `继续下滑自动加载 · 还剩 ${Se.length - ne.length} 个`
          )
        ) : null
      )
    ),
    // Skill detail drawer
    B ? i.createElement(
      D,
      {
        title: i.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 8 } },
          i.createElement(
            "span",
            { style: { fontSize: 18 } },
            B.emoji || "⚡"
          ),
          i.createElement("span", null, B.name)
        ),
        open: ee,
        onClose: () => oe(!1),
        width: 520,
        extra: i.createElement(
          f,
          {
            type: "primary",
            size: "small",
            icon: z ? i.createElement(z) : void 0,
            onClick: () => pe("/skills")
          },
          "管理技能"
        )
      },
      i.createElement(
        $,
        { column: 1, bordered: !0, size: "small" },
        i.createElement(
          $.Item,
          { label: "技能名称" },
          B.name
        ),
        i.createElement(
          $.Item,
          { label: "描述" },
          B.description || "-"
        ),
        B.version_text ? i.createElement(
          $.Item,
          { label: "版本" },
          B.version_text
        ) : null,
        i.createElement(
          $.Item,
          { label: "来源" },
          B.source || "-"
        ),
        i.createElement(
          $.Item,
          { label: "受保护" },
          B.protected ? "是（内置）" : "否"
        ),
        B.sync_status ? i.createElement(
          $.Item,
          { label: "同步状态" },
          B.sync_status
        ) : null,
        B.installed_from ? i.createElement(
          $.Item,
          { label: "安装来源" },
          B.installed_from
        ) : null
      ),
      // Tags
      B.tags && B.tags.length > 0 ? i.createElement(
        "div",
        { style: { marginTop: 16 } },
        i.createElement(
          j,
          {
            strong: !0,
            style: { display: "block", marginBottom: 8 }
          },
          "标签"
        ),
        i.createElement(
          "div",
          { style: { display: "flex", flexWrap: "wrap", gap: 4 } },
          ...B.tags.map(
            (X, _) => i.createElement(S, { key: _, color: "cyan" }, X)
          )
        )
      ) : null,
      // Installed agents
      i.createElement(
        "div",
        { style: { marginTop: 16 } },
        i.createElement(
          j,
          { strong: !0, style: { display: "block", marginBottom: 8 } },
          `已安装此技能的专家 (${le.length})`
        ),
        le.length > 0 ? i.createElement(A, {
          size: "small",
          dataSource: le,
          renderItem: (X) => i.createElement(
            A.Item,
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
              i.createElement(Ye, { name: X, size: 20 }),
              i.createElement(
                j,
                { style: { fontSize: 13 } },
                X
              )
            )
          )
        }) : i.createElement(
          j,
          { type: "secondary", style: { fontSize: 12 } },
          "暂无专家安装此技能"
        )
      ),
      // Skill content preview (lazy-loaded)
      J ? i.createElement(
        "div",
        { style: { marginTop: 16, textAlign: "center" } },
        i.createElement(w, { size: "small" })
      ) : B.content ? i.createElement(
        "div",
        { style: { marginTop: 16 } },
        i.createElement(
          j,
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
          B.content.slice(0, 2e3) + (B.content.length > 2e3 ? `

... (内容已截断)` : "")
        )
      ) : null
    ) : null
  );
}
function Li({
  embedded: e = !1
} = {}) {
  const t = k().React, { useState: n, useEffect: r, useCallback: a, useMemo: l } = t, { Tabs: o, message: s } = k().antd, { ThunderboltOutlined: i, AppstoreOutlined: d } = k().antdIcons || {}, m = k().useSelectedAgent, u = m ? m() : null, p = (u == null ? void 0 : u.id) || "default";
  r(() => {
    Zn();
  }, [p]);
  const [w, y] = n([]), [g, f] = n([]), [v, E] = n([]), [h, S] = n(!0), [O, D] = n("agent-skills"), [$, A] = n(0), F = a(async () => {
    S(!0);
    try {
      const [I, W, j] = await Promise.all([
        wn(!0),
        bn(),
        So()
      ]);
      f(I), y(W), E(j);
    } catch (I) {
      s.error(I.message || "加载技能列表失败"), f([]);
    } finally {
      S(!1);
    }
  }, []);
  r(() => {
    F();
  }, [F]);
  const V = l(() => {
    const I = w.find((W) => W.id === p);
    return (I == null ? void 0 : I.name) || p;
  }, [w, p]), U = a(
    (I) => {
      E(
        (W) => W.some((j) => j.agent_id === p) ? W.map((j) => j.agent_id !== p || j.skill_names.includes(I.name) ? j : {
          ...j,
          skill_names: [...j.skill_names, I.name]
        }) : [
          ...W,
          {
            agent_id: p,
            agent_name: V,
            skill_names: [I.name]
          }
        ]
      ), A((W) => W + 1);
    },
    [p, V]
  ), C = (I) => {
    window.history.pushState({}, "", I), window.dispatchEvent(new PopStateEvent("popstate"));
  }, x = [
    {
      key: "agent-skills",
      label: t.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        i ? t.createElement(i, { style: { fontSize: 14 } }) : null,
        "当前专家"
      ),
      children: t.createElement(Oi, {
        agentId: p,
        agentName: V,
        refreshKey: $,
        onNavigate: C
      })
    },
    {
      key: "skill-pool",
      label: t.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        d ? t.createElement(d, { style: { fontSize: 14 } }) : null,
        "技能库"
      ),
      children: t.createElement(Mi, {
        poolSkills: g,
        workspaceSkills: v,
        agents: w,
        loading: h,
        onReload: F,
        onSkillInstalled: U,
        agentId: p,
        agentName: V
      })
    }
  ], z = t.createElement(o, {
    items: x,
    activeKey: O,
    onChange: (I) => D(I)
  });
  return e ? z : t.createElement(
    "div",
    { style: { padding: 24 } },
    t.createElement(En, {
      title: "技能",
      subtitle: `技能池共 ${g.length} 个技能 · 当前智能体：${V}`
    }),
    z
  );
}
const Nn = {
  reservoir_simulation: "油藏数值模拟",
  geological_modeling: "地质建模",
  well_log_analysis: "测井分析",
  production_engineering: "采油工程",
  post_processing: "后处理与可视化",
  multiphysics: "多物理场仿真"
}, rl = {
  reservoir_simulation: "🛢️",
  geological_modeling: "🏔️",
  well_log_analysis: "📡",
  production_engineering: "⚙️",
  post_processing: "📊",
  multiphysics: "🔬"
}, al = /* @__PURE__ */ new Set(["cmg", "comsol", "tnavigator", "eclipse", "intersect", "visage"]);
function ll(e) {
  return hn(`/ugsci/engines/icon/${encodeURIComponent(e)}`);
}
async function Bi() {
  return de("/ugsci/engines/list");
}
async function Ui(e) {
  return de("/ugsci/engines/", {
    method: "POST",
    body: JSON.stringify(e)
  });
}
async function ji(e, t) {
  return de(`/ugsci/engines/${encodeURIComponent(e)}`, {
    method: "PUT",
    body: JSON.stringify(t)
  });
}
async function Ni(e) {
  return de(
    `/ugsci/engines/${encodeURIComponent(e)}`,
    { method: "DELETE" }
  );
}
async function Di() {
  return de("/ugsci/engines/detect/refresh", {
    method: "POST"
  });
}
function Fi({
  engine: e,
  onClick: t
}) {
  const n = k().React, { Card: r, Tag: a, Typography: l } = k().antd, { Text: o } = l, s = e.status === "detected", i = rl[e.category] || "📦", c = al.has(e.id) ? n.createElement("img", {
    src: ll(e.id),
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
        c,
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
        Nn[e.category] || e.category
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
function Gi() {
  const e = k().React, { useState: t, useEffect: n, useCallback: r, useMemo: a } = e, {
    Spin: l,
    Empty: o,
    Button: s,
    message: i,
    Row: d,
    Col: c,
    Drawer: m,
    Descriptions: u,
    Tag: p,
    Typography: w,
    Modal: y,
    Input: g,
    Select: f,
    Popconfirm: v,
    Space: E
  } = k().antd, {
    ReloadOutlined: h,
    SearchOutlined: S,
    PlusOutlined: O,
    EditOutlined: D,
    DeleteOutlined: $,
    CopyOutlined: A,
    ExperimentOutlined: F
  } = k().antdIcons || {}, { Text: V, Paragraph: U } = w, [C, x] = t([]), [z, I] = t(!0), [W, j] = t(""), [G, R] = t(!1), [P, ee] = t(null), [oe, B] = t(!1), [L, le] = t(null), [re, J] = t({}), [me, M] = t(!1), ce = r(async () => {
    I(!0);
    try {
      const ne = await Bi();
      x(ne.engines || []);
    } catch (ne) {
      i.error(ne.message || "加载引擎列表失败"), x([]);
    } finally {
      I(!1);
    }
  }, []);
  n(() => {
    ce();
  }, [ce]);
  const ye = a(() => {
    if (!W.trim()) return C;
    const ne = W.toLowerCase();
    return C.filter(
      (we) => {
        var Ce;
        return we.name.toLowerCase().includes(ne) || we.vendor.toLowerCase().includes(ne) || we.category.toLowerCase().includes(ne) || ((Ce = we.description) == null ? void 0 : Ce.toLowerCase().includes(ne));
      }
    );
  }, [C, W]);
  C.filter((ne) => ne.status === "detected").length;
  const Z = r((ne) => {
    navigator.clipboard.writeText(ne).then(() => i.success("路径已复制")).catch(() => i.error("复制失败"));
  }, []), se = r(() => {
    le(null), J({
      name: "",
      vendor: "",
      version: "",
      executable_path: "",
      category: "",
      description: "",
      invocation_hint: ""
    }), B(!0);
  }, []), te = r((ne) => {
    le(ne), J({ ...ne }), B(!0), R(!1);
  }, []), be = r(async () => {
    var ne;
    if (!((ne = re.name) != null && ne.trim())) {
      i.warning("请输入引擎名称");
      return;
    }
    M(!0);
    try {
      L ? (await ji(L.id, re), i.success("引擎已更新")) : (await Ui(re), i.success("引擎已添加")), B(!1), ce();
    } catch (we) {
      i.error(we.message || "保存失败");
    } finally {
      M(!1);
    }
  }, [re, L, ce]), ve = r(
    async (ne) => {
      try {
        await Ni(ne), i.success("引擎已删除"), R(!1), ce();
      } catch (we) {
        i.error(we.message || "删除失败");
      }
    },
    [ce]
  ), $e = r(async () => {
    I(!0);
    try {
      const ne = await Di();
      x(ne.engines || []), i.success("自动检测完成");
    } catch (ne) {
      i.error(ne.message || "检测失败");
    } finally {
      I(!1);
    }
  }, []), Se = r(
    (ne, we, Ce) => {
      const K = re[we] || "";
      return e.createElement(
        "div",
        { style: { marginBottom: 12 } },
        e.createElement(
          V,
          { style: { fontSize: 13, display: "block", marginBottom: 4 } },
          ne
        ),
        Ce != null && Ce.select ? e.createElement(f, {
          value: K || void 0,
          onChange: (ue) => J((he) => ({ ...he, [we]: ue })),
          style: { width: "100%" },
          options: Ce.select.options,
          allowClear: !0,
          placeholder: `选择${ne}`
        }) : Ce != null && Ce.textarea ? e.createElement(g.TextArea, {
          value: K,
          onChange: (ue) => J((he) => ({ ...he, [we]: ue.target.value })),
          rows: 3,
          placeholder: `输入${ne}`
        }) : e.createElement(g, {
          value: K,
          onChange: (ue) => J((he) => ({ ...he, [we]: ue.target.value })),
          placeholder: `输入${ne}`
        })
      );
    },
    [re]
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
      e.createElement(g, {
        placeholder: "搜索引擎名称、厂商...",
        prefix: S ? e.createElement(S) : void 0,
        value: W,
        onChange: (ne) => j(ne.target.value),
        allowClear: !0,
        style: { maxWidth: 280 }
      }),
      e.createElement(
        s,
        {
          icon: h ? e.createElement(h) : void 0,
          onClick: $e,
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
          style: De
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
    ) : ye.length === 0 ? e.createElement(o, {
      description: W ? "无匹配引擎" : "暂无引擎，点击「添加引擎」开始"
    }) : e.createElement(
      d,
      { gutter: [12, 12], align: "stretch" },
      ...ye.map(
        (ne) => e.createElement(
          c,
          {
            key: ne.id,
            xs: 24,
            sm: 12,
            md: 8,
            lg: 6,
            style: { display: "flex" }
          },
          e.createElement(Fi, {
            engine: ne,
            onClick: () => {
              ee(ne), R(!0);
            }
          })
        )
      )
    ),
    // Detail drawer
    P ? e.createElement(
      m,
      {
        title: e.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 8 } },
          e.createElement(
            "span",
            { style: { display: "flex", alignItems: "center" } },
            al.has(P.id) ? e.createElement("img", {
              src: ll(P.id),
              alt: P.name,
              style: { width: 20, height: 20, objectFit: "contain" }
            }) : e.createElement(
              "span",
              { style: { fontSize: 18 } },
              rl[P.category] || "📦"
            )
          ),
          e.createElement("span", null, P.name)
        ),
        open: G,
        onClose: () => R(!1),
        width: 520,
        extra: e.createElement(
          E,
          null,
          e.createElement(
            s,
            {
              size: "small",
              icon: D ? e.createElement(D) : void 0,
              onClick: () => te(P)
            },
            "编辑"
          ),
          P.is_default ? null : e.createElement(
            v,
            {
              title: "确认删除此引擎？",
              description: P.name,
              onConfirm: () => ve(P.id),
              okText: "删除",
              cancelText: "取消",
              okButtonProps: { danger: !0 }
            },
            e.createElement(
              s,
              {
                size: "small",
                danger: !0,
                icon: $ ? e.createElement($) : void 0
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
          P.name
        ),
        e.createElement(
          u.Item,
          { label: "厂商" },
          P.vendor || "—"
        ),
        e.createElement(
          u.Item,
          { label: "分类" },
          P.category ? Nn[P.category] || P.category : "—"
        ),
        e.createElement(
          u.Item,
          { label: "状态" },
          e.createElement(
            p,
            {
              color: P.status === "detected" ? "success" : P.status === "not_found" ? "error" : "default"
            },
            P.status === "detected" ? "✅ 已检测" : P.status === "not_found" ? "❌ 路径无效" : "🔧 待配置"
          )
        ),
        e.createElement(
          u.Item,
          { label: "版本" },
          P.version || "—"
        ),
        P.executable_path ? e.createElement(
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
              P.executable_path
            ),
            e.createElement(
              s,
              {
                size: "small",
                type: "text",
                icon: A ? e.createElement(A) : void 0,
                onClick: () => Z(P.executable_path)
              }
            )
          )
        ) : null,
        P.install_dir ? e.createElement(
          u.Item,
          { label: "安装目录" },
          e.createElement(
            "code",
            { style: { fontSize: 12, wordBreak: "break-all" } },
            P.install_dir
          )
        ) : null,
        // Display detected modules with paths
        P.modules && P.modules.length > 0 ? e.createElement(
          u.Item,
          { label: "已检测模块" },
          e.createElement(
            "div",
            { style: { display: "flex", flexDirection: "column", gap: 4 } },
            ...P.modules.map(
              (ne) => e.createElement(
                "div",
                {
                  key: ne,
                  style: { display: "flex", alignItems: "center", gap: 8 }
                },
                e.createElement(
                  p,
                  { color: "cyan", style: { fontSize: 11 } },
                  ne
                ),
                P.module_paths && P.module_paths[ne] ? e.createElement(
                  "code",
                  { style: { fontSize: 11, wordBreak: "break-all" } },
                  P.module_paths[ne]
                ) : null
              )
            )
          )
        ) : null,
        P.license_server ? e.createElement(
          u.Item,
          { label: "许可证服务器" },
          P.license_server
        ) : null,
        e.createElement(
          u.Item,
          { label: "描述" },
          P.description || "—"
        )
      ),
      // Invocation hint
      P.invocation_hint ? e.createElement(
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
          V,
          { strong: !0, style: { fontSize: 13 } },
          "💡 调用方式"
        ),
        e.createElement(
          "div",
          { style: { marginTop: 8, fontSize: 13, lineHeight: 1.6 } },
          P.invocation_hint
        )
      ) : null,
      // Type badge
      e.createElement(
        "div",
        { style: { marginTop: 12 } },
        P.is_default ? e.createElement(
          p,
          { color: "blue" },
          "默认引擎"
        ) : P.is_custom ? e.createElement(
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
        onOk: be,
        onCancel: () => B(!1),
        okText: L ? "保存" : "添加",
        cancelText: "取消",
        confirmLoading: me,
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
            options: Object.entries(Nn).map(([ne, we]) => ({
              label: we,
              value: ne
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
async function Hi(e = !1) {
  const t = await de(
    "/ugsci/domain-engines/list",
    e ? { bypassCache: !0 } : void 0
  );
  return (t == null ? void 0 : t.engines) || [];
}
function Wi(e = !1) {
  return de(
    "/ugsci/domain-engines/neqsim/runtime",
    e ? { bypassCache: !0 } : void 0
  );
}
function Vi() {
  return de("/ugsci/domain-engines/neqsim/install", {
    method: "POST"
  });
}
function qi(e) {
  return de(
    `/ugsci/domain-engines/neqsim/install/${encodeURIComponent(e)}`,
    { bypassCache: !0 }
  );
}
async function Ji(e, t = !1) {
  const n = await de("/tools", {
    headers: { "X-Agent-Id": e },
    ...t ? { bypassCache: !0 } : {}
  }) || [];
  return new Map(n.map((r) => [r.name, r]));
}
async function Ki(e, t = !1) {
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
function ea(e) {
  return e ? e.overall === "available" ? "available" : e.overall === "unavailable" ? "unavailable" : "unknown" : "unknown";
}
function ta(e) {
  return e ? e.enabled ? e.error ? "error" : e.toolCount > 0 ? "available" : "error" : "unconfigured" : "unavailable";
}
function Xi(e, t = null, n = /* @__PURE__ */ new Map()) {
  const r = e.engine, a = e.dependency_status;
  let l, o, s;
  if (r.provider.kind === "driver")
    a.overall === "unavailable" ? l = "needs_install" : l = ta(t), o = (t == null ? void 0 : t.toolCount) ?? 0, s = (t == null ? void 0 : t.key) ?? r.provider.id;
  else if (r.source === "builtin") {
    const i = ea(a), d = r.operations.flatMap((u) => u.tool_names), c = d.filter((u) => n.has(u)), m = c.filter(
      (u) => {
        var p;
        return (p = n.get(u)) == null ? void 0 : p.enabled;
      }
    );
    i !== "available" ? l = i : c.length !== d.length ? l = "error" : m.length === 0 ? l = "unconfigured" : l = "available", o = m.length, s = null;
  } else r.source === "mcp" ? (l = ta(t), o = (t == null ? void 0 : t.toolCount) ?? 0, s = (t == null ? void 0 : t.key) ?? r.provider.id) : (l = ea(a), o = 0, s = null);
  return {
    definition: r,
    dependencyStatus: a,
    checkedAt: e.checked_at,
    effectiveStatus: l,
    discoveredToolCount: o,
    mcpProviderKey: s
  };
}
function Yi(e) {
  const t = /* @__PURE__ */ new Map();
  for (const n of e) {
    const r = n.definition.domain;
    t.has(r) || t.set(r, []), t.get(r).push(n);
  }
  return t;
}
const Dn = {
  available: "可用",
  unavailable: "不可用",
  unknown: "未知",
  needs_install: "待安装",
  unconfigured: "未配置",
  error: "错误"
}, Fn = {
  available: "success",
  unavailable: "error",
  unknown: "default",
  needs_install: "warning",
  unconfigured: "warning",
  error: "error"
}, Qi = {
  geology_well_logging: "📡",
  production_engineering: "⚙️",
  fluid_thermodynamics: "🧪",
  scientific_computing: "🧮",
  data_modeling: "📊"
}, Zi = {
  builtin: "内置",
  mcp: "MCP",
  library: "计算库"
}, es = {
  deterministic: "确定性",
  stochastic: "随机/概率",
  external: "外部 Provider",
  visualization: "可视化"
}, ts = {
  deterministic: "green",
  stochastic: "purple",
  external: "blue",
  visualization: "cyan"
};
function ns({
  view: e,
  onClick: t
}) {
  const n = k().React, { Card: r, Tag: a, Typography: l } = k().antd, { Text: o } = l, s = e.definition, i = Qi[s.domain] || "📦", d = e.effectiveStatus, c = s.operations.length, m = e.discoveredToolCount;
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
            s.provider.kind === "driver" ? "内置 · MCP" : Zi[s.source] || s.source
          )
        )
      ),
      n.createElement(
        a,
        { color: Fn[d] || "default", style: { fontSize: 11 } },
        Dn[d] || d
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
        `${c} 操作`
      ),
      n.createElement(
        a,
        {
          color: ts[s.execution_class] || "default",
          style: { fontSize: 11 }
        },
        es[s.execution_class] || s.execution_class
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
function rs({
  view: e,
  open: t,
  onClose: n,
  onNavigateToMcp: r,
  onNavigateToTools: a,
  onNavigateToSkills: l,
  onInstallNeqsim: o,
  neqsimInstallState: s
}) {
  const i = k().React, { Drawer: d, Descriptions: c, Tag: m, Typography: u, Button: p, Space: w, Divider: y } = k().antd, { Text: g, Paragraph: f } = u;
  if (!e) return null;
  const v = e.definition, E = e.dependencyStatus;
  return i.createElement(
    d,
    {
      title: i.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 8 } },
        i.createElement("span", null, v.name),
        i.createElement(
          m,
          {
            color: Fn[e.effectiveStatus] || "default",
            style: { fontSize: 11 }
          },
          Dn[e.effectiveStatus] || e.effectiveStatus
        )
      ),
      open: t,
      onClose: n,
      width: 560,
      rootClassName: "ugsci-domain-engine-detail-drawer"
    },
    // Overview
    i.createElement(
      c,
      { column: 1, bordered: !0, size: "small" },
      i.createElement(
        c.Item,
        { label: "领域" },
        v.domain
      ),
      i.createElement(
        c.Item,
        { label: "来源" },
        v.provider.kind === "driver" ? "内置能力 · MCP Driver" : v.source === "builtin" ? "内置工具" : v.source === "mcp" ? "MCP 服务" : "科学计算库 / 技能"
      ),
      i.createElement(
        c.Item,
        { label: "实现" },
        `${v.provider.kind}:${v.provider.id}`
      ),
      i.createElement(
        c.Item,
        { label: "计算类别" },
        v.execution_class === "deterministic" ? "确定性计算" : v.execution_class === "stochastic" ? "随机/概率计算" : v.execution_class === "external" ? "外部 Provider" : "可视化"
      ),
      i.createElement(
        c.Item,
        { label: "内核版本" },
        v.engine_version
      ),
      i.createElement(
        c.Item,
        { label: "描述" },
        v.description
      ),
      i.createElement(
        c.Item,
        { label: "检测时间" },
        e.checkedAt
      )
    ),
    // Operations
    i.createElement(
      "div",
      { style: { marginTop: 16, marginBottom: 8 } },
      i.createElement(g, { strong: !0 }, "领域操作")
    ),
    ...v.operations.map(
      (h) => i.createElement(
        "div",
        {
          key: h.id,
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
          i.createElement(g, { strong: !0, style: { fontSize: 13 } }, h.name),
          i.createElement(
            g,
            { type: "secondary", style: { fontSize: 11, marginLeft: 8 } },
            h.id
          )
        ),
        i.createElement(
          g,
          { type: "secondary", style: { fontSize: 12 } },
          h.description
        ),
        h.tool_names.length > 0 ? i.createElement(
          "div",
          { style: { marginTop: 4, display: "flex", gap: 4, flexWrap: "wrap" } },
          ...h.tool_names.map(
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
    i.createElement(y, null),
    i.createElement(g, { strong: !0 }, "实现与依赖"),
    E && E.dependencies.length > 0 ? i.createElement(
      "div",
      { style: { marginTop: 8 } },
      ...E.dependencies.map(
        (h) => i.createElement(
          "div",
          {
            key: h.name,
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
            i.createElement(g, { style: { fontSize: 13 } }, h.name),
            i.createElement(
              m,
              {
                color: Fn[h.status] || "default",
                style: { fontSize: 11 }
              },
              Dn[h.status] || h.status
            )
          ),
          h.status !== "available" && h.reason ? i.createElement(
            g,
            { type: "secondary", style: { display: "block", fontSize: 12, marginTop: 4 } },
            h.reason
          ) : null,
          h.status !== "available" && h.install_hint ? i.createElement(
            g,
            { style: { display: "block", fontSize: 12, marginTop: 4 } },
            `安装：${h.install_hint}`
          ) : null,
          h.status !== "available" && h.enable_hint ? i.createElement(
            g,
            { style: { display: "block", fontSize: 12, marginTop: 2 } },
            `启用：${h.enable_hint}`
          ) : null
        )
      )
    ) : i.createElement(
      f,
      { type: "secondary", style: { fontSize: 12 } },
      "无外部依赖"
    ),
    // Actions
    i.createElement(y, null),
    i.createElement(g, { strong: !0 }, "问题处理"),
    i.createElement(
      "div",
      { style: { marginTop: 8, display: "flex", gap: 8, flexWrap: "wrap" } },
      v.id === "neqsim" && e.effectiveStatus === "needs_install" ? i.createElement(
        p,
        {
          size: "small",
          type: "primary",
          loading: (s == null ? void 0 : s.status) === "queued" || (s == null ? void 0 : s.status) === "running",
          onClick: o
        },
        (s == null ? void 0 : s.status) === "running" ? `${s.message} (${s.progress}%)` : "安装 NeqSim 运行环境"
      ) : null,
      v.provider.kind === "driver" ? i.createElement(
        p,
        { size: "small", onClick: r },
        "查看内置 MCP Driver"
      ) : v.source === "library" ? i.createElement(
        p,
        { size: "small", onClick: l },
        "查看相关技能"
      ) : i.createElement(
        p,
        { size: "small", onClick: () => a("builtin") },
        "查看内置工具"
      )
    ),
    v.id === "neqsim" && (s == null ? void 0 : s.status) === "failed" ? i.createElement(
      f,
      { type: "danger", style: { marginTop: 8, fontSize: 12 } },
      s.error || "安装失败"
    ) : null,
    v.id === "neqsim" && (s != null && s.warning) ? i.createElement(
      f,
      { type: "warning", style: { marginTop: 8, fontSize: 12 } },
      s.warning
    ) : null
  );
}
const as = {
  geology_well_logging: "测井地质",
  production_engineering: "采油工程",
  fluid_thermodynamics: "流体热力学",
  scientific_computing: "科学计算",
  data_modeling: "数据建模"
};
function ls(e) {
  return e instanceof Error ? /Install task not found|HTTP 404/i.test(e.message) : !1;
}
function os({
  onNavigateToMcp: e,
  onNavigateToTools: t,
  onNavigateToSkills: n
} = {}) {
  var ce, ye;
  const r = k().React, { useState: a, useEffect: l, useCallback: o, useMemo: s, useRef: i } = r, {
    Spin: d,
    Empty: c,
    Button: m,
    message: u,
    Row: p,
    Col: w,
    Input: y,
    Drawer: g,
    Typography: f
  } = k().antd, { ReloadOutlined: v, SearchOutlined: E } = k().antdIcons || {}, { Text: h } = f, S = (ye = (ce = k()).useSelectedAgent) == null ? void 0 : ye.call(ce), O = (S == null ? void 0 : S.id) || "default", [D, $] = a([]), [A, F] = a(!0), [V, U] = a(""), [C, x] = a(!1), [z, I] = a(null), [W, j] = a(null), G = i(O);
  G.current = O;
  const R = i(z);
  R.current = z;
  const P = i(0);
  l(() => () => {
    P.current += 1;
  }, []);
  const ee = o(
    async (Z = !1, se = !1) => {
      var $e, Se;
      se || F(!0);
      const te = se && typeof window < "u" ? {
        x: window.scrollX,
        y: window.scrollY,
        drawerBody: typeof document < "u" ? document.querySelector(
          ".ugsci-domain-engine-detail-drawer .ant-drawer-body"
        ) : null,
        drawerTop: typeof document < "u" && (($e = document.querySelector(
          ".ugsci-domain-engine-detail-drawer .ant-drawer-body"
        )) == null ? void 0 : $e.scrollTop) || 0
      } : null, be = () => {
        if (!te || typeof window > "u") return;
        const ne = () => {
          var we;
          window.scrollTo(te.x, te.y), (we = te.drawerBody) != null && we.isConnected && (te.drawerBody.scrollTop = te.drawerTop);
        };
        typeof window.requestAnimationFrame == "function" ? window.requestAnimationFrame(ne) : ne();
      }, ve = G.current;
      try {
        const [ne, we, Ce] = await Promise.all([
          Hi(Z),
          Ki(ve, Z),
          Ji(ve, Z)
        ]);
        if (ve !== G.current) return;
        const K = [];
        for (const he of ne)
          try {
            let H = null;
            if (he.engine.provider.kind === "driver") {
              const T = he.engine.provider.id;
              H = we.get(T) || null;
            }
            K.push(Xi(he, H, Ce));
          } catch {
          }
        $(K);
        const ue = (Se = R.current) == null ? void 0 : Se.definition.id;
        if (ue) {
          const he = K.find(
            (H) => H.definition.id === ue
          );
          he && (R.current = he, I(he));
        }
        be();
      } catch (ne) {
        const we = ne instanceof Error ? ne.message : "加载领域引擎失败";
        u.error(we), se || $([]);
      } finally {
        se || F(!1);
      }
    },
    []
  );
  l(() => {
    ee();
  }, [O, ee]);
  const oe = s(() => {
    if (!V.trim()) return D;
    const Z = V.toLowerCase();
    return D.filter(
      (se) => se.definition.name.toLowerCase().includes(Z) || se.definition.domain.toLowerCase().includes(Z) || se.definition.description.toLowerCase().includes(Z) || se.definition.tags.some((te) => te.toLowerCase().includes(Z))
    );
  }, [D, V]), B = s(
    () => Yi(oe),
    [oe]
  ), L = o(() => {
    ee(!0);
  }, [ee]), le = o((Z) => {
    R.current = Z, I(Z), x(!0);
  }, []), re = o(() => {
    x(!1), e == null || e();
  }, [e]), J = o(
    (Z) => {
      x(!1), t == null || t(Z);
    },
    [t]
  ), me = o(() => {
    x(!1), n == null || n();
  }, [n]), M = o(async () => {
    const Z = ++P.current, se = () => Z === P.current;
    try {
      let te = await Vi();
      if (!se()) return;
      for (j(te); te.status === "queued" || te.status === "running"; ) {
        if (await new Promise((be) => setTimeout(be, 1e3)), !se()) return;
        try {
          te = await qi(te.id);
        } catch (be) {
          if (!ls(be)) throw be;
          const ve = await Wi(!0);
          if (!se()) return;
          ve.ready ? te = {
            ...te,
            status: "completed",
            progress: 100,
            message: "后端重启后已恢复 NeqSim 运行环境状态",
            error: "",
            runtime: ve,
            recovered: !0
          } : te = {
            ...te,
            status: "failed",
            message: "安装进程因后端重启中断",
            error: "后端重启后未发现完整的 NeqSim 运行环境，请重新安装",
            runtime: ve,
            recovered: !0
          };
        }
        if (!se()) return;
        j(te);
      }
      if (!se()) return;
      te.status === "completed" ? (te.warning ? u.warning(te.warning) : u.success("NeqSim 运行环境已安装并启用"), await ee(!0, !0)) : u.error(te.error || "NeqSim 安装失败");
    } catch (te) {
      if (!se()) return;
      u.error(te instanceof Error ? te.message : "NeqSim 安装失败");
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
      r.createElement(y, {
        placeholder: "搜索领域引擎...",
        prefix: E ? r.createElement(E) : void 0,
        value: V,
        onChange: (Z) => U(Z.target.value),
        allowClear: !0,
        style: { maxWidth: 280 }
      }),
      r.createElement(
        m,
        {
          icon: v ? r.createElement(v) : void 0,
          onClick: L,
          loading: A
        },
        "刷新"
      )
    ),
    // Content
    A ? r.createElement(
      "div",
      { style: { textAlign: "center", padding: 60 } },
      r.createElement(d, {
        size: "large",
        tip: "正在加载领域引擎..."
      })
    ) : oe.length === 0 ? r.createElement(c, {
      description: V ? "无匹配引擎" : "暂无领域引擎"
    }) : r.createElement(
      "div",
      null,
      ...Array.from(B.entries()).map(
        ([Z, se]) => r.createElement(
          "div",
          { key: Z, style: { marginBottom: 20 } },
          r.createElement(
            h,
            {
              strong: !0,
              style: {
                fontSize: 14,
                display: "block",
                marginBottom: 8
              }
            },
            as[Z] || Z
          ),
          r.createElement(
            p,
            { gutter: [12, 12], align: "stretch" },
            ...se.map(
              (te) => r.createElement(
                w,
                {
                  key: te.definition.id,
                  xs: 24,
                  sm: 12,
                  md: 8,
                  lg: 6,
                  style: { display: "flex" }
                },
                r.createElement(ns, {
                  view: te,
                  onClick: () => le(te)
                })
              )
            )
          )
        )
      )
    ),
    // Detail drawer
    r.createElement(rs, {
      view: z,
      open: C,
      onClose: () => x(!1),
      onNavigateToMcp: re,
      onNavigateToTools: J,
      onNavigateToSkills: me,
      onInstallNeqsim: M,
      neqsimInstallState: W
    })
  );
}
const is = Li, ol = /* @__PURE__ */ new Set(["tools", "engines", "skills"]);
function ss(e) {
  try {
    const t = new URLSearchParams(window.location.search).get("tab");
    return t && ol.has(t) ? t : e;
  } catch {
    return e;
  }
}
function na(e) {
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
function Gn({ page: e }) {
  const t = k().React, { useEffect: n, useState: r } = t, { Alert: a, Spin: l } = k().antd, [o, s] = r(null), [i, d] = r("");
  if (n(() => {
    let m = !0;
    const u = k().loadBuiltinPage;
    return s(null), u ? (d(""), u(e).then((p) => {
      m && s(() => p);
    }).catch((p) => {
      m && d(
        p instanceof Error ? p.message : "加载原生管理页面失败"
      );
    }), () => {
      m = !1;
    }) : (d("当前 QwenPaw 版本不支持原生页面嵌入"), () => {
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
  const c = e === "mcp" ? {
    title: "UGSci MCP",
    description: "连接外部工具、数据服务与计算能力，扩展当前专家的可调用范围",
    managedTitle: "已接入服务",
    managedDescription: "启用后可由当前专家调用，并可按工具配置访问权限",
    create: "接入 MCP 服务"
  } : void 0;
  return t.createElement(o, { embedded: !0, embeddedLabels: c });
}
function cs({
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
        children: n.createElement(Gn, { page: "mcp" })
      },
      {
        key: "builtin",
        label: "平台内置",
        children: n.createElement(Gn, { page: "tools" })
      }
    ]
  });
}
function ds({
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
        children: r.createElement(Gi)
      },
      {
        key: "domain",
        label: "领域计算",
        children: r.createElement(
          os,
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
        children: r.createElement(Gn, { page: "acp" })
      }
    ]
  });
}
function il({
  initialTab: e = "engines"
} = {}) {
  var f, v;
  const t = k().React, { useEffect: n, useState: r } = t, { Tabs: a, Tag: l } = k().antd, { RocketOutlined: o, ToolOutlined: s, ThunderboltOutlined: i } = k().antdIcons || {}, d = (v = (f = k()).useSelectedAgent) == null ? void 0 : v.call(f), c = (d == null ? void 0 : d.id) || "default", [m, u] = r(
    () => ss(e)
  ), [p, w] = r("mcp");
  n(() => {
    try {
      const E = new URLSearchParams(window.location.search).get("tab");
      E && !ol.has(E) && na(m);
    } catch {
    }
  }, [m]);
  const y = (E) => {
    u(E), na(E);
  }, g = (E, h) => t.createElement(
    "span",
    { style: { display: "inline-flex", alignItems: "center", gap: 6 } },
    h ? t.createElement(h, { style: { fontSize: 14 } }) : null,
    E
  );
  return t.createElement(
    "div",
    { style: { padding: 24 } },
    t.createElement(En, {
      title: "工具·技能",
      subtitle: "管理当前专家可调用的引擎、工具、运行服务与专业技能",
      extra: t.createElement(
        l,
        { color: "blue" },
        `当前专家：${c}`
      )
    }),
    t.createElement(a, {
      activeKey: m,
      onChange: (E) => y(E),
      items: [
        {
          key: "engines",
          label: g("引擎", o),
          children: t.createElement(
            ds,
            {
              onNavigateToMcp: () => {
                w("mcp"), y("tools");
              },
              onNavigateToTools: (E) => {
                w(E || "mcp"), y("tools");
              },
              onNavigateToSkills: () => y("skills")
            }
          )
        },
        {
          key: "tools",
          label: g("工具", s),
          children: t.createElement(cs, {
            activeSubTab: p,
            onSubTabChange: w
          })
        },
        {
          key: "skills",
          label: g("技能", i),
          children: t.createElement(is, {
            embedded: !0
          })
        }
      ]
    })
  );
}
const sl = il;
function us() {
  return k().React.createElement(sl, {
    initialTab: "tools"
  });
}
function ms() {
  return k().React.createElement(sl, {
    initialTab: "skills"
  });
}
const ra = {
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
function ps(e) {
  if (!e.env) return !1;
  const t = Object.entries(e.env);
  return t.length === 0 ? !1 : t.some(([, n]) => typeof n == "string" && n.length > 0);
}
const on = "ugsci.market.githubSources", aa = "https://github.com/anthropics/skills/tree/main/skills", cl = "https://ugsci-awesome-tools.oss-cn-beijing.aliyuncs.com", fs = `${cl}/skills`;
function gs(e) {
  const t = e.replace(/^\/+/, "");
  return hn(`/plugins/oss-proxy?path=${encodeURIComponent(t)}`);
}
function dn(e) {
  const t = e.replace(/^\/+/, "");
  return et(`/plugins/oss-proxy?path=${encodeURIComponent(t)}`);
}
async function sr(e) {
  const t = e.replace(/^\/+/, ""), n = await dn(t);
  if (!n.ok)
    throw new Error(`OSS fetch failed (${n.status}): ${t}`);
  return await n.json();
}
function vt(e) {
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
function ys(e) {
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
    iconUrl: e.icon_url ? gs(e.icon_url) : void 0,
    category: e.category ? vt(e.category) : "",
    description: e.description,
    transport: e.transport || "stdio",
    command: ((a = e.config) == null ? void 0 : a.command) || "",
    args: ((l = e.config) == null ? void 0 : l.args) || [],
    env: Object.keys(t).length > 0 ? t : void 0
  };
}
const dl = "ugsci.market.mcpSources", ul = "ugsci.market.expertSources";
function ml(e, t) {
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
function pl(e, t) {
  try {
    localStorage.setItem(e, JSON.stringify(t));
  } catch {
  }
}
function hs() {
  return ml(dl, "mcp");
}
function Qt(e) {
  pl(dl, e);
}
function Es() {
  return ml(ul, "expert");
}
function Zt(e) {
  pl(ul, e);
}
function fl(e) {
  try {
    const t = new URL(e.trim()), n = t.hostname.toLowerCase();
    let r;
    if (n === "github.com" || n === "www.github.com")
      r = "github";
    else if (n === "gitee.com" || n === "www.gitee.com")
      r = "gitee";
    else
      return null;
    const a = t.pathname.split("/").filter((d) => d.length > 0);
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
function gl(e, t, n, r = "github") {
  return r === "oss" ? `oss:${e}/${n || "/"}` : `${r}:${e}/${t}:${n || "/"}`;
}
function bs(e) {
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
function vs() {
  try {
    const e = localStorage.getItem(on);
    if (!e) {
      const r = [], a = fl(aa);
      return a && r.push({
        id: gl(
          a.owner,
          a.repo,
          a.skillsPath,
          a.platform
        ),
        url: aa,
        label: a.label,
        owner: a.owner,
        repo: a.repo,
        ref: a.ref,
        skillsPath: a.skillsPath,
        enabled: !1,
        platform: a.platform
      }), localStorage.setItem(on, JSON.stringify(r)), r;
    }
    const t = JSON.parse(e);
    if (!Array.isArray(t)) return [];
    const n = t.filter(
      (r) => r && typeof r.id == "string" && (typeof r.owner == "string" || r.platform === "oss") && !(r.platform === "oss" && r.url === fs)
    ).map((r) => ({
      ...r,
      platform: r.platform || "github",
      owner: r.owner || "",
      repo: r.repo || "",
      ref: r.ref || "",
      skillsPath: r.skillsPath || ""
    }));
    return n.length !== t.length && localStorage.setItem(
      on,
      JSON.stringify(n)
    ), n;
  } catch {
    return [];
  }
}
function en(e) {
  try {
    localStorage.setItem(
      on,
      JSON.stringify(e)
    );
  } catch {
  }
}
function ws(e) {
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
async function Ss(e) {
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
    (d) => d.type === "dir" && d.name
  );
  return await Promise.all(
    s.map(async (d) => {
      const c = e.skillsPath ? e.skillsPath + "/" : "", m = t ? `https://gitee.com/${e.owner}/${e.repo}/raw/${e.ref}/${c}${d.name}/SKILL.md` : `https://raw.githubusercontent.com/${e.owner}/${e.repo}/${e.ref}/${c}${d.name}/SKILL.md`, u = t ? `https://gitee.com/${e.owner}/${e.repo}/tree/${e.ref}/${c}${d.name}` : `https://github.com/${e.owner}/${e.repo}/tree/${e.ref}/${c}${d.name}`, p = {
        sourceId: e.id,
        sourceLabel: e.label,
        name: d.name,
        description: "",
        source_url: u,
        html_url: u,
        version: null,
        author: null
      };
      try {
        const w = {};
        t && e.accessToken && (w.Authorization = `token ${e.accessToken}`);
        const y = await fetch(m, {
          headers: w
        });
        if (!y.ok) return p;
        const g = await y.text(), f = ws(g);
        return {
          ...p,
          name: f.name || d.name,
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
async function xs(e) {
  const t = bs(e.url);
  if (!t)
    throw new Error(`Invalid OSS URL: ${e.url}`);
  const { endpoint: n, prefix: r } = t, a = r.split("/").map(encodeURIComponent).join("/"), l = await dn(
    `${a}/manifest.json`
  );
  if (!l.ok)
    throw new Error(
      `无法获取技能列表: manifest.json (${l.status})`
    );
  const o = await l.json(), s = [];
  if (o && o.tag_groups && typeof o.tag_groups == "object")
    for (const [c, m] of Object.entries(o.tag_groups))
      Array.isArray(m) && s.push({
        id: c,
        label: vt(c),
        tags: m
      });
  const i = [];
  function d(c, m) {
    for (const u of c) {
      if (u.type === "collection" && Array.isArray(u.children)) {
        d(u.children, u.name);
        continue;
      }
      const p = u.path || u.name || "";
      if (!p) continue;
      const w = p.split("/").map(encodeURIComponent).join("/"), y = `${n}/${a}/${w}`;
      let g = null;
      if (u.metadata) {
        const v = u.metadata.match(/version:\s*"?([\d.]+)"?/);
        v && (g = v[1]);
      }
      const f = m ? `${e.label}/${m}` : e.label;
      i.push({
        sourceId: e.id,
        sourceLabel: e.label,
        sourcePath: f,
        name: u.name || p.split("/").pop() || p,
        description: u.description || "",
        source_url: y,
        html_url: y,
        version: g,
        author: null,
        tag: u.tag || void 0,
        isOfficial: !0
      });
    }
  }
  if (Array.isArray(o) ? d(
    o.map(
      (c) => typeof c == "string" ? { name: c, path: c } : c
    )
  ) : o && Array.isArray(o.skills) && d(o.skills), i.length === 0)
    throw new Error(
      `manifest.json 中未找到技能。请检查 ${e.url}/manifest.json`
    );
  return { skills: i, categories: s };
}
async function ks() {
  const e = await sr("mcp/manifest.json"), t = [], n = {};
  if (e.tag_groups && typeof e.tag_groups == "object")
    for (const [a, l] of Object.entries(e.tag_groups))
      Array.isArray(l) && (n[a] = l, t.push({
        id: a,
        label: vt(a),
        tags: l
      }));
  return { servers: (e.servers || []).map((a) => {
    let l = "";
    const o = a.tags || [];
    for (const [s, i] of Object.entries(n))
      if (i.some((d) => o.includes(d))) {
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
async function Cs() {
  const e = await sr("skills/manifest.json"), t = [], n = /* @__PURE__ */ new Set();
  function r(a, l) {
    for (const o of a) {
      if ((o == null ? void 0 : o.type) === "collection" && Array.isArray(o.children)) {
        r(o.children, o.name || l);
        continue;
      }
      const s = String((o == null ? void 0 : o.path) || (o == null ? void 0 : o.name) || "").trim();
      if (!s) continue;
      const i = s.split("/").map(encodeURIComponent).join("/"), d = `${cl}/skills/${i}`, c = typeof o.tag == "string" && o.tag.trim() ? o.tag.trim() : void 0;
      c && n.add(c);
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
        source_url: d,
        html_url: d,
        version: m,
        author: null,
        tag: c,
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
async function Ts() {
  const e = await sr("agents/manifest.json"), t = [], n = {};
  if (e.tag_groups && typeof e.tag_groups == "object")
    for (const [a, l] of Object.entries(e.tag_groups))
      Array.isArray(l) && (n[a] = l, t.push({
        id: a,
        label: vt(a),
        tags: l
      }));
  return { agents: (e.agents || []).map((a) => {
    let l = "";
    const o = a.tags || [];
    for (const [s, i] of Object.entries(n))
      if (i.some((d) => o.includes(d))) {
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
async function _s(e) {
  const t = e.filter((o) => o.enabled), n = await Promise.all(
    t.map(async (o) => {
      try {
        if (o.platform === "oss") {
          const { skills: s, categories: i } = await xs(o);
          return { skills: s, categories: i, error: null, label: o.label };
        } else
          return { skills: await Ss(o), categories: [], error: null, label: o.label };
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
function Is({
  open: e,
  onClose: t,
  sources: n,
  onChange: r
}) {
  const a = k().React, { useState: l } = a, {
    Modal: o,
    Input: s,
    Button: i,
    List: d,
    Tag: c,
    Switch: m,
    Typography: u,
    Tooltip: p,
    message: w
  } = k().antd, {
    PlusOutlined: y,
    DeleteOutlined: g,
    LinkOutlined: f,
    GithubOutlined: v
  } = k().antdIcons || {}, { Text: E } = u, [h, S] = l(""), [O, D] = l(""), $ = () => {
    const U = h.trim();
    if (!U) return;
    const C = fl(U);
    if (!C) {
      w.error("无效的仓库 URL，请输入类似 https://github.com/owner/repo/tree/main/skills 或 https://gitee.com/owner/repo/tree/master/skills 的链接");
      return;
    }
    const x = gl(C.owner, C.repo, C.skillsPath, C.platform);
    if (n.some((W) => W.id === x)) {
      w.warning("该源已存在");
      return;
    }
    const z = {
      id: x,
      url: U,
      label: C.label,
      owner: C.owner,
      repo: C.repo,
      ref: C.ref,
      skillsPath: C.skillsPath,
      enabled: !0,
      platform: C.platform,
      accessToken: O.trim() || void 0
    }, I = [...n, z];
    en(I), r(I), S(""), D(""), w.success(`已添加源: ${C.label}`);
  }, A = (U, C) => {
    const x = n.map(
      (z) => z.id === U ? { ...z, enabled: C } : z
    );
    en(x), r(x);
  }, F = (U, C) => {
    const x = n.map(
      (z) => z.id === U ? { ...z, accessToken: C.trim() || void 0 } : z
    );
    en(x), r(x);
  }, V = (U) => {
    const C = n.filter((x) => x.id !== U);
    en(C), r(C), w.success("已移除源");
  };
  return a.createElement(
    o,
    {
      open: e,
      onCancel: t,
      title: a.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 8 } },
        v ? a.createElement(v, { style: { fontSize: 18 } }) : null,
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
        E,
        { type: "secondary", style: { fontSize: 12, display: "block", marginBottom: 8 } },
        "添加 GitHub 或 Gitee 仓库作为技能源，系统将从该仓库的指定目录获取技能列表。支持格式："
      ),
      a.createElement(
        "div",
        { style: { display: "flex", gap: 8, alignItems: "center" } },
        a.createElement(s, {
          placeholder: "https://github.com/owner/repo/tree/main/skills 或 https://gitee.com/owner/repo/tree/master/skills",
          value: h,
          onChange: (U) => S(U.target.value),
          onPressEnter: $,
          prefix: f ? a.createElement(f) : void 0,
          style: { flex: 1 }
        }),
        a.createElement(
          i,
          {
            type: "primary",
            icon: y ? a.createElement(y) : void 0,
            onClick: $
          },
          "添加"
        )
      ),
      // Gitee token input (shown when URL looks like a Gitee link)
      h.trim() && h.trim().toLowerCase().includes("gitee.com") ? a.createElement(
        "div",
        { style: { marginTop: 8, display: "flex", gap: 8, alignItems: "center" } },
        a.createElement(
          E,
          { type: "secondary", style: { fontSize: 12, whiteSpace: "nowrap" } },
          "Gitee Token:"
        ),
        a.createElement(s.Password, {
          placeholder: "私有仓库请填写 Gitee 私人令牌（可选）",
          value: O,
          onChange: (U) => D(U.target.value),
          style: { flex: 1 }
        })
      ) : null
    ),
    a.createElement(
      "div",
      { style: { marginBottom: 8, display: "flex", alignItems: "center", justifyContent: "space-between" } },
      a.createElement(E, { strong: !0 }, `已配置源 (${n.length})`)
    ),
    a.createElement(d, {
      size: "small",
      bordered: !0,
      dataSource: n,
      renderItem: (U) => a.createElement(
        d.Item,
        {
          actions: [
            a.createElement(
              p,
              { title: U.enabled ? "点击禁用" : "点击启用" },
              a.createElement(m, {
                size: "small",
                checked: U.enabled,
                onChange: (C) => A(U.id, C)
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
                  icon: g ? a.createElement(g) : void 0,
                  onClick: () => V(U.id)
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
              c,
              { color: U.platform === "gitee" ? "orange" : U.platform === "oss" ? "green" : "blue", style: { fontSize: 11 } },
              U.platform === "gitee" ? "Gitee" : U.platform === "oss" ? "OSS" : "GitHub"
            ),
            a.createElement(
              c,
              { style: { fontSize: 11 } },
              U.label
            ),
            U.skillsPath ? a.createElement(
              E,
              { type: "secondary", style: { fontSize: 11 } },
              `/${U.skillsPath}`
            ) : null,
            U.platform !== "oss" ? a.createElement(
              E,
              { type: "secondary", style: { fontSize: 11 } },
              `@${U.ref}`
            ) : null
          ),
          a.createElement(
            E,
            {
              type: "secondary",
              style: { fontSize: 11, wordBreak: "break-all" }
            },
            U.url
          ),
          // Gitee token input for existing Gitee sources
          U.platform === "gitee" ? a.createElement(
            "div",
            { style: { marginTop: 6, display: "flex", gap: 6, alignItems: "center" } },
            a.createElement(
              E,
              { type: "secondary", style: { fontSize: 11, whiteSpace: "nowrap" } },
              "Token:"
            ),
            a.createElement(s.Password, {
              size: "small",
              placeholder: "Gitee 私人令牌（可选，用于私有仓库）",
              value: U.accessToken || "",
              onChange: (C) => F(U.id, C.target.value),
              style: { flex: 1 }
            })
          ) : null
        )
      )
    })
  );
}
function la({
  open: e,
  onClose: t,
  sources: n,
  onChange: r,
  type: a
}) {
  const l = k().React, { useState: o } = l, {
    Modal: s,
    Input: i,
    Button: d,
    List: c,
    Tag: m,
    Switch: u,
    Typography: p,
    Tooltip: w,
    message: y
  } = k().antd, {
    PlusOutlined: g,
    DeleteOutlined: f,
    LinkOutlined: v,
    ApiOutlined: E,
    UserOutlined: h,
    ImportOutlined: S,
    ExportOutlined: O,
    CopyOutlined: D
  } = k().antdIcons || {}, { Text: $ } = p, [A, F] = o(""), [V, U] = o(""), [C, x] = o(""), [z, I] = o(!1), W = a === "mcp" ? "MCP" : "专家模板", j = a === "mcp" ? E ? l.createElement(E, { style: { fontSize: 18 } }) : null : h ? l.createElement(h, { style: { fontSize: 18 } }) : null, G = () => {
    const B = A.trim(), L = V.trim();
    if (!B) return;
    const le = L || B.slice(0, 40), re = `${a}:${B}`;
    if (n.some((M) => M.id === re)) {
      y.warning("该源已存在");
      return;
    }
    const J = {
      id: re,
      label: le,
      url: B,
      enabled: !0,
      type: a
    }, me = [...n, J];
    a === "mcp" ? Qt(me) : Zt(me), r(me), F(""), U(""), y.success(`已添加${W}源: ${le}`);
  }, R = (B, L) => {
    const le = n.map(
      (re) => re.id === B ? { ...re, enabled: L } : re
    );
    a === "mcp" ? Qt(le) : Zt(le), r(le);
  }, P = (B) => {
    const L = n.filter((le) => le.id !== B);
    a === "mcp" ? Qt(L) : Zt(L), r(L), y.success("已移除源");
  }, ee = () => {
    const B = JSON.stringify(
      { type: a, sources: n },
      null,
      2
    );
    try {
      navigator.clipboard.writeText(B), y.success(`${W}源已复制到剪贴板（${n.length} 个源）`);
    } catch {
      const L = document.createElement("textarea");
      L.value = B, document.body.appendChild(L), L.select(), document.execCommand("copy"), document.body.removeChild(L), y.success(`${W}源已复制到剪贴板（${n.length} 个源）`);
    }
  }, oe = () => {
    const B = C.trim();
    if (!B) {
      y.warning("请粘贴 JSON 内容");
      return;
    }
    try {
      const L = JSON.parse(B);
      let le = [];
      if (Array.isArray(L))
        le = L;
      else if (L && Array.isArray(L.sources))
        le = L.sources;
      else if (L && typeof L == "object")
        le = [L];
      else
        throw new Error("Invalid format");
      const re = le.filter(
        (ce) => ce && typeof ce.url == "string" && typeof ce.label == "string"
      );
      if (re.length === 0) {
        y.error("未找到有效的源数据");
        return;
      }
      const J = new Set(n.map((ce) => ce.id)), me = [];
      for (const ce of re) {
        const ye = ce.id || `${a}:${ce.url}`;
        J.has(ye) || me.push({
          id: ye,
          label: ce.label,
          url: ce.url,
          enabled: ce.enabled !== !1,
          type: a
        });
      }
      if (me.length === 0) {
        y.info("所有源均已存在，无新增");
        return;
      }
      const M = [...n, ...me];
      a === "mcp" ? Qt(M) : Zt(M), r(M), x(""), I(!1), y.success(`成功导入 ${me.length} 个${W}源`);
    } catch (L) {
      y.error(`JSON 解析失败: ${L.message || "格式错误"}`);
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
        j,
        l.createElement("span", null, `配置${W}源`)
      ),
      footer: l.createElement(
        "div",
        { style: { display: "flex", justifyContent: "space-between" } },
        l.createElement(
          "div",
          { style: { display: "flex", gap: 8 } },
          l.createElement(
            d,
            {
              icon: O ? l.createElement(O) : void 0,
              onClick: ee,
              disabled: n.length === 0,
              size: "small"
            },
            "导出到剪贴板"
          ),
          l.createElement(
            d,
            {
              icon: S ? l.createElement(S) : void 0,
              onClick: () => I(!z),
              size: "small"
            },
            z ? "隐藏导入" : "导入JSON"
          )
        ),
        l.createElement(
          d,
          { onClick: t },
          "关闭"
        )
      ),
      width: 680
    },
    // Description
    l.createElement(
      $,
      { type: "secondary", style: { fontSize: 12, display: "block", marginBottom: 12 } },
      `配置${W}源地址，支持从远程仓库或团队共享的 JSON 导入${W}配置。`
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
        $,
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
        onChange: (B) => x(B.target.value),
        autoSize: { minRows: 4, maxRows: 10 },
        style: { fontFamily: "monospace", fontSize: 12 }
      }),
      l.createElement(
        "div",
        { style: { marginTop: 8, display: "flex", gap: 8 } },
        l.createElement(
          d,
          {
            type: "primary",
            size: "small",
            onClick: oe
          },
          "导入"
        ),
        l.createElement(
          d,
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
        value: V,
        onChange: (B) => U(B.target.value),
        style: { width: 200 }
      }),
      l.createElement(i, {
        placeholder: a === "mcp" ? "https://raw.githubusercontent.com/team/mcp-registry/main/mcp.json" : "https://raw.githubusercontent.com/team/expert-registry/main/experts.json",
        value: A,
        onChange: (B) => F(B.target.value),
        onPressEnter: G,
        prefix: v ? l.createElement(v) : void 0,
        style: { flex: 1 }
      }),
      l.createElement(
        d,
        {
          type: "primary",
          icon: g ? l.createElement(g) : void 0,
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
        $,
        { strong: !0 },
        `已配置源 (${n.length})`
      )
    ),
    l.createElement(c, {
      size: "small",
      bordered: !0,
      dataSource: n,
      renderItem: (B) => l.createElement(
        c.Item,
        {
          actions: [
            l.createElement(
              w,
              { title: B.enabled ? "点击禁用" : "点击启用" },
              l.createElement(u, {
                size: "small",
                checked: B.enabled,
                onChange: (L) => R(B.id, L)
              })
            ),
            l.createElement(
              w,
              { title: "移除此源" },
              l.createElement(
                d,
                {
                  size: "small",
                  type: "text",
                  danger: !0,
                  icon: f ? l.createElement(f) : void 0,
                  onClick: () => P(B.id)
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
            $,
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
async function As() {
  return de("/market/providers");
}
async function zs(e) {
  return de(
    `/market/categories?lang=${encodeURIComponent(e)}`
  );
}
async function $s(e, t, n, r, a) {
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
function oa(e) {
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
async function ia(e, t) {
  const n = { bundle_url: e };
  return t && (n.access_token = t), de("/skills/pool/import", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(n)
  });
}
function Ps({ embedded: e = !1 } = {}) {
  const t = k().React, { useState: n, useEffect: r, useCallback: a, useMemo: l, useRef: o } = t, {
    Spin: s,
    Empty: i,
    Input: d,
    Button: c,
    message: m,
    Row: u,
    Col: p,
    Card: w,
    Tag: y,
    Tooltip: g,
    Typography: f,
    Select: v,
    Drawer: E,
    Descriptions: h,
    Tabs: S,
    Badge: O,
    Progress: D,
    Modal: $,
    Alert: A
  } = k().antd, {
    ReloadOutlined: F,
    SearchOutlined: V,
    DownloadOutlined: U,
    AppstoreOutlined: C,
    ShopOutlined: x,
    CheckCircleOutlined: z,
    LoadingOutlined: I,
    UserOutlined: W,
    UserAddOutlined: j,
    SettingOutlined: G,
    GithubOutlined: R,
    ApiOutlined: P
  } = k().antdIcons || {}, { Text: ee, Paragraph: oe, Title: B } = f, [L, le] = n("skills"), [re, J] = n([]), [me, M] = n([]), [ce, ye] = n([]), [Z, se] = n(""), [te, be] = n(""), [ve, $e] = n(!1), [Se, ne] = n(!1), [we, Ce] = n(
    {}
  ), [K, ue] = n(null), [he, H] = n({}), [T, pe] = n([]), [X, _] = n(""), [ae, fe] = n(""), [_e, Be] = n(""), [qe, Je] = n({}), [Ue, it] = n(""), [Xe, Me] = n(/* @__PURE__ */ new Set()), [Ae, ie] = n(null), [Pe, ze] = n({}), [Le, Qe] = n([]), [Ze, Ie] = n([]), [Ft, Gt] = n([]), [Ht, tt] = n(""), [Er, Wt] = n(!1), [Yl, br] = n(!1), [Ql, vr] = n([]), [Zl, wr] = n(!1), [eo, Sr] = n([]), [to, xr] = n(!1), [kr, Cr] = n([]), [Tr, _r] = n([]), [Ir, Ar] = n(!1), [ut, zr] = n(""), [$r, Pr] = n([]), [Rr, Or] = n([]), [Mr, Lr] = n(!1), [mt, Br] = n(""), [Cn, Ur] = n(!1), [Ge, Vt] = n(null), [xt, no] = n([]), kt = o(null);
  r(() => {
    Promise.all([
      As().catch(() => []),
      zs("zh").catch(() => []),
      bn().catch(() => [])
    ]).then(([b, N, q]) => {
      J(b), M(N), pe(q), q.length > 0 && (_(q[0].id), it(q[0].id));
    });
  }, []);
  const qt = a(async (b) => {
    const N = b ?? vs();
    if (Qe(b || N), N.filter((ge) => ge.enabled).length === 0) {
      Ie([]);
      return;
    }
    Wt(!0);
    try {
      const { skills: ge, errors: xe, categories: Re } = await _s(N);
      if (Ie(ge), no(Re), xe.length > 0) {
        for (const Te of xe)
          console.warn(`[ugsci] GitHub source '${Te.label}' error: ${Te.message}`);
        m.warning(
          `部分源加载失败: ${xe.map((Te) => Te.label).join(", ")}`
        );
      }
    } catch (ge) {
      m.error(ge.message || "加载技能源失败"), Ie([]);
    } finally {
      Wt(!1);
    }
  }, []), Tn = a(async () => {
    var ge, xe, Re;
    Ar(!0), Lr(!0), Wt(!0);
    const [b, N, q] = await Promise.allSettled([
      ks(),
      Ts(),
      Cs()
    ]);
    if (b.status === "fulfilled" ? (Cr(b.value.servers), _r(b.value.categories)) : (console.warn(`[ugsci] MCP manifest error: ${((ge = b.reason) == null ? void 0 : ge.message) || b.reason}`), Cr([]), _r([])), Ar(!1), N.status === "fulfilled" ? (Pr(N.value.agents), Or(N.value.categories)) : (console.warn(`[ugsci] Agents manifest error: ${((xe = N.reason) == null ? void 0 : xe.message) || N.reason}`), Pr([]), Or([])), Lr(!1), q.status === "fulfilled")
      Gt(q.value.skills), tt("");
    else {
      const Te = ((Re = q.reason) == null ? void 0 : Re.message) || String(q.reason);
      console.warn(`[ugsci] Skills manifest error: ${Te}`), Gt([]), tt(Te);
    }
    Wt(!1);
  }, []);
  r(() => {
    qt(), Tn(), vr(hs()), Sr(Es());
  }, [qt, Tn]);
  const Jt = a(
    async (b, N, q) => {
      $e(!0);
      try {
        const ge = await $s(
          b,
          q,
          20,
          "zh",
          N || void 0
        );
        q === void 0 || Object.keys(q).length === 0 ? ye(ge.results) : ye((Te) => [...Te, ...ge.results]);
        const xe = Object.values(ge.by_provider || {}).some(
          (Te) => Te.has_more
        );
        ne(xe);
        const Re = {};
        for (const [Te, nt] of Object.entries(ge.by_provider || {}))
          Re[Te] = (q[Te] || 1) + 1;
        if (Ce(Re), ge.errors.length > 0)
          for (const Te of ge.errors)
            console.warn(
              `[ugsci] Market provider '${Te.provider}' error: ${Te.message}`
            );
      } catch (ge) {
        m.error(ge.message || "搜索市场失败"), ye([]);
      } finally {
        $e(!1);
      }
    },
    []
  );
  r(() => (kt.current && clearTimeout(kt.current), kt.current = setTimeout(() => {
    Jt(Z, te, {});
  }, 400), () => {
    kt.current && clearTimeout(kt.current);
  }), [Z, te, Jt]);
  const ro = () => {
    Jt(Z, te, we);
  }, jr = async (b) => {
    const N = `${b.source}:${b.slug}`;
    try {
      H((ge) => ({ ...ge, [N]: "installing" }));
      const q = await ia(b.source_url);
      q.installed && m.success(
        `技能「${q.name || b.name}」已安装到技能池，可在技能中心查看`
      ), H((ge) => {
        const xe = { ...ge };
        return delete xe[N], xe;
      });
    } catch (q) {
      m.error(oa(q) || "安装技能失败"), H((ge) => {
        const xe = { ...ge };
        return delete xe[N], xe;
      });
    }
  }, ao = (b) => {
    window.history.pushState({}, "", b), window.dispatchEvent(new PopStateEvent("popstate"));
  }, lo = async (b) => {
    const N = `github:${b.sourceId}:${b.name}`, q = Le.find((xe) => xe.id === b.sourceId), ge = (q == null ? void 0 : q.accessToken) || void 0;
    try {
      H((Re) => ({ ...Re, [N]: "installing" }));
      const xe = await ia(b.source_url, ge);
      xe.installed && m.success(
        `技能「${xe.name || b.name}」已安装到技能池，可在技能中心查看`
      ), H((Re) => {
        const Te = { ...Re };
        return delete Te[N], Te;
      });
    } catch (xe) {
      m.error(oa(xe) || "安装技能失败"), H((Re) => {
        const Te = { ...Re };
        return delete Te[N], Te;
      });
    }
  }, st = l(() => {
    const b = [], N = /* @__PURE__ */ new Set();
    for (const q of [...Ft, ...Ze]) {
      const ge = q.source_url || `${q.sourceLabel}:${q.name}`;
      N.has(ge) || (N.add(ge), b.push(q));
    }
    return b;
  }, [Ft, Ze]), Nr = l(() => {
    const b = [], N = /* @__PURE__ */ new Set();
    if (xt.length > 0)
      for (const q of xt)
        N.has(q.id) || (N.add(q.id), b.push(q));
    for (const q of st)
      q.tag && !N.has(q.tag) && (N.add(q.tag), b.push({ id: q.tag, label: q.tag }));
    for (const q of st)
      !q.isOfficial && q.sourceLabel && !N.has(q.sourceLabel) && (N.add(q.sourceLabel), b.push({ id: q.sourceLabel, label: q.sourceLabel }));
    return b;
  }, [st, xt]), _n = l(() => {
    let b = st;
    if (te) {
      const N = xt.find((q) => q.id === te);
      N && N.tags ? b = b.filter(
        (q) => q.tag && N.tags.includes(q.tag) || q.sourceLabel === te
      ) : b = b.filter(
        (q) => q.tag === te || q.sourceLabel === te
      );
    }
    if (Z.trim()) {
      const N = Z.toLowerCase();
      b = b.filter(
        (q) => {
          var ge;
          return q.name.toLowerCase().includes(N) || ((ge = q.description) == null ? void 0 : ge.toLowerCase().includes(N));
        }
      );
    }
    return b;
  }, [st, Z, te, xt]), Dr = re.filter((b) => b.available), pt = l(() => te ? ce.filter((b) => {
    const N = Dr.find((q) => q.key === b.source);
    return (N == null ? void 0 : N.label) === te;
  }) : ce, [ce, te, Dr]), oo = t.createElement(
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
      t.createElement(d, {
        placeholder: "搜索技能市场...",
        prefix: V ? t.createElement(V) : void 0,
        value: Z,
        onChange: (b) => se(b.target.value),
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
        c,
        {
          icon: R ? t.createElement(R) : void 0,
          onClick: () => br(!0),
          size: "small"
        },
        "配置技能源"
      )
    ),
    // Dynamic category filter tags (from OSS manifest tags + imported sources)
    Ht && st.length === 0 ? t.createElement(A, {
      type: "warning",
      showIcon: !0,
      message: "UGSci 官方 OSS 技能库加载失败",
      description: "请检查网络或后端 OSS 代理服务，然后点击右上角“刷新”重试。",
      style: { marginBottom: 12 }
    }) : null,
    Nr.length > 0 ? t.createElement(
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
        y,
        {
          style: {
            fontSize: 11,
            cursor: "pointer",
            borderRadius: 12
          },
          color: te === "" ? "blue" : void 0,
          onClick: () => be("")
        },
        "全部"
      ),
      ...Nr.map((b) => {
        const N = Ze.some(
          (q) => !q.isOfficial && q.sourceLabel === b.id
        );
        return t.createElement(
          y,
          {
            key: b.id,
            style: {
              fontSize: 11,
              cursor: "pointer",
              borderRadius: 12
            },
            color: te === b.id ? N ? "blue" : "geekblue" : void 0,
            icon: N && R ? t.createElement(R) : void 0,
            onClick: () => be(
              te === b.id ? "" : b.id
            )
          },
          b.label
        );
      })
    ) : null,
    // GitHub skills section
    Er && st.length === 0 ? t.createElement(
      "div",
      { style: { textAlign: "center", padding: 40, marginBottom: 16 } },
      t.createElement(s, { size: "large" }, t.createElement("div", { style: { minHeight: 60, display: "flex", alignItems: "center", justifyContent: "center" } }, "正在加载技能..."))
    ) : _n.length > 0 ? t.createElement(
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
          `技能市场 (${_n.length})`
        )
      ),
      t.createElement(
        u,
        { gutter: [12, 12] },
        ..._n.map((b) => {
          const N = `github:${b.sourceId}:${b.name}`, q = he[N];
          return t.createElement(
            p,
            { key: N, xs: 24, sm: 12, md: 8, lg: 6 },
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
                  g,
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
                oe,
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
                    P ? t.createElement(P, { style: { fontSize: 10 } }) : null,
                    b.sourcePath || b.sourceLabel
                  ) : null,
                  // Show tag as category badge
                  b.tag ? t.createElement(
                    y,
                    { color: "geekblue", style: { fontSize: 10 } },
                    b.tag
                  ) : null,
                  b.version ? t.createElement(
                    y,
                    { style: { fontSize: 10 } },
                    `v${b.version}`
                  ) : null
                ),
                q ? t.createElement(
                  c,
                  {
                    size: "small",
                    disabled: !0,
                    icon: I ? t.createElement(I) : void 0
                  },
                  "安装中"
                ) : t.createElement(
                  c,
                  {
                    type: "primary",
                    size: "small",
                    icon: U ? t.createElement(U) : void 0,
                    onClick: () => lo(b)
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
    pt.length > 0 || ve ? t.createElement(
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
        `技能市场${pt.length > 0 ? ` (${pt.length})` : ""}`
      )
    ) : null,
    // Results grid
    ve && pt.length === 0 ? t.createElement(
      "div",
      { style: { textAlign: "center", padding: 60 } },
      t.createElement(s, { size: "large" })
    ) : pt.length === 0 ? t.createElement(i, {
      description: Z ? `未找到匹配「${Z}」的技能` : "输入关键词搜索技能市场",
      image: i.PRESENTED_IMAGE_SIMPLE
    }) : t.createElement(
      u,
      { gutter: [12, 12] },
      ...pt.map((b) => {
        const N = `${b.source}:${b.slug}`, q = he[N];
        return t.createElement(
          p,
          { key: N, xs: 24, sm: 12, md: 8, lg: 6 },
          t.createElement(
            w,
            {
              hoverable: !0,
              size: "small",
              style: { height: "100%", cursor: "pointer" },
              onClick: () => ue(b)
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
                g,
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
              oe,
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
                  y,
                  { color: "geekblue", style: { fontSize: 10 } },
                  b.source
                ),
                b.version ? t.createElement(
                  y,
                  { style: { fontSize: 10 } },
                  `v${b.version}`
                ) : null
              ),
              q ? t.createElement(
                c,
                {
                  size: "small",
                  disabled: !0,
                  icon: I ? t.createElement(I) : void 0
                },
                "安装中"
              ) : t.createElement(
                c,
                {
                  type: "primary",
                  size: "small",
                  icon: U ? t.createElement(U) : void 0,
                  onClick: (ge) => {
                    ge.stopPropagation(), jr(b);
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
    Se && !ve ? t.createElement(
      "div",
      { style: { textAlign: "center", marginTop: 16 } },
      t.createElement(
        c,
        { onClick: ro, loading: ve },
        "加载更多"
      )
    ) : null,
    // Detail Drawer
    K ? t.createElement(
      E,
      {
        title: t.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 8 } },
          K.icon_url ? t.createElement("img", {
            src: K.icon_url,
            alt: K.name,
            style: { width: 28, height: 28, borderRadius: 4 }
          }) : t.createElement(
            "span",
            { style: { fontSize: 20 } },
            "📦"
          ),
          t.createElement("span", null, K.name)
        ),
        open: !0,
        onClose: () => ue(null),
        width: 480,
        extra: t.createElement(
          c,
          {
            type: "primary",
            icon: U ? t.createElement(U) : void 0,
            onClick: () => {
              jr(K);
            }
          },
          "安装到技能池"
        )
      },
      t.createElement(
        h,
        { column: 1, bordered: !0, size: "small" },
        t.createElement(
          h.Item,
          { label: "来源" },
          K.source
        ),
        t.createElement(
          h.Item,
          { label: "描述" },
          K.description || "-"
        ),
        K.version ? t.createElement(
          h.Item,
          { label: "版本" },
          K.version
        ) : null,
        K.author ? t.createElement(
          h.Item,
          { label: "作者" },
          K.author
        ) : null,
        t.createElement(
          h.Item,
          { label: "来源链接" },
          t.createElement(
            "a",
            { href: K.source_url, target: "_blank" },
            K.source_url
          )
        )
      ),
      K.stats ? t.createElement(
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
          ...Object.entries(K.stats).map(
            ([b, N]) => t.createElement(
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
                String(N)
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
  ), In = l(() => {
    let b = $r;
    if (mt && (b = b.filter((N) => N.category === mt)), ae.trim()) {
      const N = ae.toLowerCase();
      b = b.filter(
        (q) => q.name.toLowerCase().includes(N) || q.description.toLowerCase().includes(N) || q.tags.some((ge) => ge.toLowerCase().includes(N))
      );
    }
    return b;
  }, [$r, ae, mt]), io = async (b) => {
    if (!Cn) {
      Ur(!0);
      try {
        let N = b.description;
        if (b.instructions)
          try {
            const xe = b.instructions.replace(/^\/+/, ""), Re = await dn(xe);
            Re.ok && (N = await Re.text());
          } catch {
          }
        let q = [];
        if (b.skills_manifest)
          try {
            const xe = b.skills_manifest.replace(/^\/+/, ""), Re = await dn(xe);
            if (Re.ok) {
              const Te = await Re.json();
              Array.isArray(Te) ? q = Te.map((nt) => typeof nt == "string" ? nt : nt.name).filter(Boolean) : Te.skills && (q = Te.skills.map((nt) => typeof nt == "string" ? nt : nt.name).filter(Boolean));
            }
          } catch {
          }
        const ge = await de("/agents", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: b.name,
            description: b.description,
            skill_names: q
          })
        });
        await cn(ge.id, "AGENTS.md", N), m.success(`专家「${b.name}」创建成功，已跳转至专家`), ao("/ugsci-experts");
      } catch (N) {
        m.error(N.message || "创建专家失败");
      } finally {
        Ur(!1);
      }
    }
  }, Fr = a(async (b) => {
    if (b)
      try {
        const N = await ar(b);
        Me(new Set(N.map((q) => q.key)));
      } catch {
        Me(/* @__PURE__ */ new Set());
      }
  }, []);
  r(() => {
    Ue && Fr(Ue);
  }, [Ue, Fr]);
  const so = async (b) => {
    if (!Ue) {
      m.warning("请先选择目标专家");
      return;
    }
    if (ps(b)) {
      const N = Object.entries(b.env), q = {};
      for (const [ge] of N)
        q[ge] = "";
      ze(q), ie(b);
      return;
    }
    await Gr(b, b.env || {});
  }, Gr = async (b, N) => {
    Je((q) => ({ ...q, [b.id]: !0 }));
    try {
      const q = b.id;
      await lr(Ue, {
        client_key: q,
        client: {
          name: b.name,
          description: b.description,
          enabled: !0,
          transport: b.transport,
          url: b.url || "",
          command: b.command || "",
          args: b.args || [],
          env: N,
          cwd: b.cwd || "",
          headers: b.headers || {}
        }
      }), m.success(`MCP「${b.name}」已添加到当前专家`), Me((ge) => new Set(ge).add(q));
    } catch (q) {
      m.error(q.message || `添加 MCP「${b.name}」失败`);
    } finally {
      Je((q) => ({ ...q, [b.id]: !1 }));
    }
  }, co = async () => {
    if (!Ae) return;
    const b = [];
    for (const [q, ge] of Object.entries(Pe))
      if (!ge || !ge.trim()) {
        const xe = ra[q];
        b.push((xe == null ? void 0 : xe.label) || q);
      }
    if (b.length > 0) {
      m.warning(`请填写以下配置项: ${b.join(", ")}`);
      return;
    }
    const N = Ae;
    ie(null), ze({}), await Gr(N, { ...Pe });
  }, An = l(() => {
    let b = kr;
    if (ut && (b = b.filter((N) => N.category === ut)), _e.trim()) {
      const N = _e.toLowerCase();
      b = b.filter(
        (q) => q.name.toLowerCase().includes(N) || q.description.toLowerCase().includes(N) || q.tags.some((ge) => ge.toLowerCase().includes(N))
      );
    }
    return b.map(ys);
  }, [kr, _e, ut]), uo = t.createElement(
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
      t.createElement(d, {
        placeholder: "搜索 MCP 服务器...",
        prefix: V ? t.createElement(V) : void 0,
        value: _e,
        onChange: (b) => Be(b.target.value),
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
        t.createElement(v, {
          value: Ue,
          onChange: (b) => it(b),
          style: { minWidth: 180 },
          size: "small",
          options: T.map((b) => ({ value: b.id, label: b.name }))
        })
      ),
      // Configure MCP source button
      t.createElement(
        c,
        {
          icon: P ? t.createElement(P) : void 0,
          onClick: () => wr(!0),
          size: "small"
        },
        "配置 MCP 源"
      )
    ),
    // Dynamic category tag row (from OSS manifest tag_groups)
    Tr.length > 0 ? t.createElement(
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
        y,
        {
          style: { fontSize: 11, cursor: "pointer", borderRadius: 12 },
          color: ut === "" ? "blue" : void 0,
          onClick: () => zr("")
        },
        "全部"
      ),
      ...Tr.map(
        (b) => t.createElement(
          y,
          {
            key: b.id,
            style: { fontSize: 11, cursor: "pointer", borderRadius: 12 },
            color: ut === b.id ? "geekblue" : void 0,
            onClick: () => zr(
              ut === b.id ? "" : b.id
            )
          },
          b.label
        )
      )
    ) : null,
    // MCP server cards (dynamic from OSS)
    Ir && An.length === 0 ? t.createElement(
      "div",
      { style: { textAlign: "center", padding: 40 } },
      t.createElement(s, { size: "large" }, t.createElement("div", { style: { minHeight: 60, display: "flex", alignItems: "center", justifyContent: "center" } }, "正在加载 MCP 服务器..."))
    ) : An.length === 0 ? t.createElement(i, {
      description: "未找到匹配的 MCP 服务器",
      image: i.PRESENTED_IMAGE_SIMPLE
    }) : t.createElement(
      u,
      { gutter: [12, 12] },
      ...An.map(
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
                  onError: (N) => {
                    N.target.style.display = "none";
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
                    y,
                    { color: "blue", style: { fontSize: 10 } },
                    b.category
                  ),
                  t.createElement(
                    y,
                    {
                      color: b.transport === "stdio" ? "purple" : "cyan",
                      style: { fontSize: 10 }
                    },
                    b.transport
                  ),
                  b.env && Object.keys(b.env).length > 0 ? t.createElement(
                    y,
                    { color: "orange", style: { fontSize: 10 } },
                    "需配置密钥"
                  ) : null
                )
              )
            ),
            // Description
            t.createElement(
              oe,
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
              Xe.has(b.id) ? t.createElement(
                c,
                { size: "small", disabled: !0 },
                "已安装"
              ) : t.createElement(
                c,
                {
                  type: "primary",
                  size: "small",
                  loading: !!qe[b.id],
                  icon: P ? t.createElement(P) : void 0,
                  onClick: () => so(b)
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
  ), mo = Ae ? t.createElement(
    $,
    {
      title: t.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 8 } },
        t.createElement("span", { style: { fontSize: 20, display: "inline-flex", alignItems: "center", justifyContent: "center", width: 24, height: 24 } }, Ae.iconUrl ? t.createElement("img", { src: Ae.iconUrl, alt: Ae.name, style: { width: 22, height: 22, objectFit: "contain" }, onError: (b) => {
          b.target.style.display = "none";
        } }) : Ae.emoji),
        t.createElement("span", null, `配置 ${Ae.name} 密钥`)
      ),
      open: !!Ae,
      onCancel: () => {
        ie(null), ze({});
      },
      onOk: co,
      okText: "安装",
      cancelText: "取消",
      width: 520,
      destroyOnClose: !0
    },
    // Description
    t.createElement(
      ee,
      { type: "secondary", style: { display: "block", marginBottom: 16, fontSize: 12 } },
      Ae.description
    ),
    ...Object.entries(Ae.env || {}).map(([b]) => {
      const N = ra[b], q = (N == null ? void 0 : N.isSecret) !== !1;
      return t.createElement(
        "div",
        { key: b, style: { marginBottom: 16 } },
        t.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 6, marginBottom: 4 } },
          t.createElement(
            ee,
            { strong: !0, style: { fontSize: 13 } },
            (N == null ? void 0 : N.label) || b
          ),
          t.createElement(
            y,
            { color: "orange", style: { fontSize: 10 } },
            "必填"
          )
        ),
        // Help text with optional link
        N ? t.createElement(
          "div",
          { style: { marginBottom: 6, fontSize: 12, color: "var(--ant-color-text-tertiary, #8c8c8c)" } },
          N.help,
          N.link ? t.createElement(
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
        q ? t.createElement(d.Password, {
          placeholder: `请输入 ${(N == null ? void 0 : N.label) || b}`,
          value: Pe[b] || "",
          onChange: (ge) => ze((xe) => ({
            ...xe,
            [b]: ge.target.value
          })),
          style: { width: "100%" }
        }) : t.createElement(d, {
          placeholder: `请输入 ${(N == null ? void 0 : N.label) || b}`,
          value: Pe[b] || "",
          onChange: (ge) => ze((xe) => ({
            ...xe,
            [b]: ge.target.value
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
  ) : null, po = t.createElement(
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
      t.createElement(d, {
        placeholder: "搜索人才...",
        prefix: V ? t.createElement(V) : void 0,
        value: ae,
        onChange: (b) => fe(b.target.value),
        allowClear: !0,
        style: { maxWidth: 400, flex: 1, minWidth: 200 }
      }),
      t.createElement(
        c,
        {
          icon: W ? t.createElement(W) : void 0,
          onClick: () => xr(!0),
          size: "small"
        },
        "配置专家源"
      )
    ),
    // Dynamic category tag row (from OSS manifest tag_groups)
    Rr.length > 0 ? t.createElement(
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
        y,
        {
          style: { fontSize: 11, cursor: "pointer", borderRadius: 12 },
          color: mt === "" ? "blue" : void 0,
          onClick: () => Br("")
        },
        "全部"
      ),
      ...Rr.map(
        (b) => t.createElement(
          y,
          {
            key: b.id,
            style: { fontSize: 11, cursor: "pointer", borderRadius: 12 },
            color: mt === b.id ? "geekblue" : void 0,
            onClick: () => Br(
              mt === b.id ? "" : b.id
            )
          },
          b.label
        )
      )
    ) : null,
    // Agent cards (dynamic from OSS)
    Mr && In.length === 0 ? t.createElement(
      "div",
      { style: { textAlign: "center", padding: 40 } },
      t.createElement(s, { size: "large" }, t.createElement("div", { style: { minHeight: 60, display: "flex", alignItems: "center", justifyContent: "center" } }, "正在加载人才市场..."))
    ) : In.length === 0 ? t.createElement(i, {
      description: "未找到匹配的人才",
      image: i.PRESENTED_IMAGE_SIMPLE
    }) : t.createElement(
      u,
      { gutter: [12, 12] },
      ...In.map(
        (b) => t.createElement(
          p,
          { key: b.id, xs: 24, sm: 12, md: 8 },
          t.createElement(
            w,
            {
              hoverable: !0,
              size: "small",
              style: { height: "100%", cursor: "pointer" },
              onClick: () => Vt(b)
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
              t.createElement(Ye, {
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
                    y,
                    { color: "blue", style: { fontSize: 10 } },
                    vt(b.category)
                  ) : null,
                  b.tags.includes("mcp") ? t.createElement(
                    y,
                    { color: "purple", style: { fontSize: 10 } },
                    "MCP"
                  ) : null
                )
              )
            ),
            t.createElement(
              oe,
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
                b.tags.filter((N) => N !== "agent" && N !== "template" && N !== "workspace").slice(0, 3).join(" · ") || "人才模板"
              ),
              t.createElement(
                c,
                {
                  type: "primary",
                  size: "small",
                  icon: j ? t.createElement(j) : void 0
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
  ), fo = [
    {
      key: "skills",
      label: t.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        C ? t.createElement(C, { style: { fontSize: 14 } }) : null,
        "技能市场"
      ),
      children: oo
    },
    {
      key: "mcp",
      label: t.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        P ? t.createElement(P, { style: { fontSize: 14 } }) : null,
        "MCP 市场"
      ),
      children: uo
    },
    {
      key: "experts",
      label: t.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        j ? t.createElement(j, { style: { fontSize: 14 } }) : null,
        "人才市场"
      ),
      children: po
    }
  ];
  return t.createElement(
    "div",
    { style: { padding: 24 } },
    e ? null : t.createElement(En, {
      title: "市场",
      subtitle: "浏览技能市场 · 选择 MCP 服务器 · 人才市场 · 随时更新能力和专家",
      extra: t.createElement(
        "div",
        { style: { display: "flex", gap: 8 } },
        t.createElement(
          c,
          {
            type: "primary",
            icon: F ? t.createElement(F) : void 0,
            onClick: () => {
              Jt(Z, te, {}), qt(), Tn();
            },
            loading: ve || Er || Ir || Mr
          },
          "刷新"
        )
      )
    }),
    t.createElement(S, {
      items: fo,
      activeKey: L,
      onChange: (b) => le(b)
    }),
    // Skill source config modal
    t.createElement(Is, {
      open: Yl,
      onClose: () => br(!1),
      sources: Le,
      onChange: (b) => {
        Qe(b), qt(b);
      }
    }),
    // MCP source config modal
    t.createElement(la, {
      open: Zl,
      onClose: () => wr(!1),
      sources: Ql,
      onChange: (b) => vr(b),
      type: "mcp"
    }),
    // MCP token config modal (for templates requiring secrets)
    mo,
    // Expert source config modal
    t.createElement(la, {
      open: to,
      onClose: () => xr(!1),
      sources: eo,
      onChange: (b) => Sr(b),
      type: "expert"
    }),
    // ── Agent Detail Modal (click card to view details, then create) ──
    Ge ? t.createElement(
      $,
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
          t.createElement(Ye, {
            name: Ge.name,
            size: 40
          }),
          t.createElement(
            "div",
            null,
            t.createElement(
              ee,
              { strong: !0, style: { fontSize: 16 } },
              Ge.name
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
              Ge.category ? t.createElement(
                y,
                { color: "blue", style: { fontSize: 10 } },
                vt(Ge.category)
              ) : null,
              ...Ge.tags.filter(
                (b) => b !== "agent" && b !== "template" && b !== "workspace"
              ).slice(0, 5).map(
                (b) => t.createElement(
                  y,
                  { key: b, style: { fontSize: 10 } },
                  b
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
            c,
            {
              onClick: () => Vt(null),
              style: { marginRight: 8 }
            },
            "取消"
          ),
          t.createElement(
            c,
            {
              type: "primary",
              loading: Cn,
              disabled: Cn,
              icon: j ? t.createElement(j) : void 0,
              style: De,
              onClick: async () => {
                await io(Ge), Vt(null);
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
          oe,
          {
            type: "secondary",
            style: { fontSize: 13, lineHeight: 1.7, margin: 0 }
          },
          Ge.description
        )
      ),
      // Skills manifest hint
      Ge.skills_manifest ? t.createElement(
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
      Ge.instructions ? t.createElement(
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
      Ge.drivers && Object.keys(Ge.drivers).length > 0 ? t.createElement(
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
          ...Object.entries(Ge.drivers).map(
            ([b, N]) => t.createElement(
              y,
              { key: b, color: "cyan", style: { fontSize: 11 } },
              `${b}${N && N.length > 0 ? ` (${N.join(", ")})` : ""}`
            )
          )
        )
      ) : null
    ) : null
  );
}
function Rs() {
  try {
    const t = localStorage.getItem("language") || "";
    if (t) return t.split("-")[0];
  } catch {
  }
  return ((typeof navigator < "u" ? navigator.language : "") || "").split("-")[0] || "en";
}
const sa = {
  zh: "您好，UGSci 智能助手在线。无论是油气藏分析、数值模拟还是工程决策，描述您的场景，我来交付结果。",
  en: "UGSci AI assistant is online. From reservoir analysis to numerical simulation and engineering decisions — describe your scenario and I'll deliver results.",
  ja: "UGSci AIアシスタントがオンラインです。油層解析、数値シミュレーション、エンジニアリングの意思決定など、シナリオを描写してください。結果をお届けします。",
  ru: "UGSci AI-ассистент онлайн. От анализа пласта до численного моделирования и инженерных решений — опишите свой сценарий, и я предоставлю результат.",
  vi: "Trợ lý AI UGSci đang trực tuyến. Từ phân tích mỏ, mô phỏng số đến ra quyết định kỹ thuật — mô tả kịch bản của bạn, tôi sẽ giao kết quả.",
  id: "Asisten AI UGSci sedang online. Dari analisis reservoir, simulasi numerik hingga keputusan engineering — jelaskan skenario Anda, saya akan memberikan hasilnya."
}, ca = {
  zh: { label: "能告诉我你都能做点什么吗？", value: "能告诉我你都能做点什么吗" },
  en: { label: "Can you tell me what you can do?", value: "Can you tell me what you can do?" },
  ja: { label: "あなたができることを教えてください", value: "あなたができることを教えてください" },
  ru: { label: "Расскажи, что ты умеешь делать?", value: "Расскажи, что ты умеешь делать?" },
  vi: { label: "Bạn có thể cho tôi biết bạn làm được gì không?", value: "Bạn có thể cho tôi biết bạn làm được gì không?" },
  id: { label: "Bisa cerita apa saja yang bisa Anda lakukan?", value: "Bisa cerita apa saja yang bisa Anda lakukan?" }
};
function Os() {
  const e = k(), t = e.React, { useEffect: n, useRef: r } = t, a = e.useSelectedAgent ? e.useSelectedAgent() : { id: "default" }, l = (a == null ? void 0 : a.id) || "default", o = r(null), s = r(null);
  return n(() => {
    if (o.current === l) return;
    o.current = l, Zn();
    const i = Rs(), d = sa[i] || sa.en, c = ca[i] || ca.en;
    let m = !1;
    return (async () => {
      var u, p;
      try {
        const w = await vn(l);
        if (m) return;
        const y = Fa(w);
        if (s.current) {
          try {
            s.current();
          } catch {
          }
          s.current = null;
        }
        const g = window.QwenPaw;
        (u = g == null ? void 0 : g.chat) != null && u.welcome && (y.length > 0 ? (s.current = g.chat.welcome.set("ugsci", {
          description: d,
          prompts: y
        }), console.info(
          `[ugsci] Injected ${y.length} welcome prompts for agent "${l}"`
        )) : (s.current = g.chat.welcome.set("ugsci", {
          description: d,
          prompts: [c]
        }), console.info(
          `[ugsci] No skills for agent "${l}" — using default prompt`
        )));
      } catch (w) {
        console.warn(
          `[ugsci] Failed to inject welcome prompts for agent "${l}":`,
          w
        );
        const y = window.QwenPaw;
        if ((p = y == null ? void 0 : y.chat) != null && p.welcome && !m) {
          if (s.current) {
            try {
              s.current();
            } catch {
            }
            s.current = null;
          }
          s.current = y.chat.welcome.set("ugsci", {
            description: d,
            prompts: [c]
          });
        }
      }
    })(), () => {
      m = !0;
    };
  }, [l]), null;
}
const Ms = 256;
let Ne = {};
const Hn = /* @__PURE__ */ new Set(), un = () => Hn.forEach((e) => e()), Ls = (e) => (Hn.add(e), () => Hn.delete(e)), Lt = /* @__PURE__ */ new Map();
function da(e, t) {
  const n = [];
  for (const l of t) {
    if (!l) continue;
    const o = Ne[wt(e, l)] || Object.values(Ne).find((s) => s.uiId === l);
    o && n.push(o);
  }
  const r = `${e}::${t.join("\0")}`, a = Lt.get(r);
  return a && a.length === n.length && a.every((l, o) => l === n[o]) ? a : (Lt.set(r, n), n);
}
function wt(e, t) {
  return `${e}::${t}`;
}
function mn(e) {
  return !e || typeof e != "object" ? null : e.ok === !0 && (e.kind === "genui" || e.kind === "genui_patch") ? e : e.genui && typeof e.genui == "object" ? mn(e.genui) : e.ui && typeof e.ui == "object" ? mn(e.ui.genui) : null;
}
function $t(e) {
  if (!e || typeof e != "string") return null;
  try {
    const t = JSON.parse(e);
    if (Array.isArray(t)) {
      for (const n of t) {
        const r = (n == null ? void 0 : n.type) === "text" ? n.text : void 0, a = typeof r == "string" ? $t(r) : mn(n);
        if (a) return a;
      }
      return null;
    }
    return mn(t);
  } catch {
    return null;
  }
}
function Pt(e) {
  var t;
  if (!e || typeof e != "string") return null;
  try {
    const n = JSON.parse(e);
    if (Array.isArray(n)) {
      const r = (t = n.find((a) => (a == null ? void 0 : a.type) === "text")) == null ? void 0 : t.text;
      return typeof r == "string" ? Pt(r) : null;
    }
    return n && n.ok === !1 ? n : null;
  } catch {
    return null;
  }
}
const ua = /* @__PURE__ */ new Set(["plugin_call_output", "function_call_output", "tool_call_output", "mcp_call_output", "component_call_output"]), $n = /* @__PURE__ */ new Set(["emit_ui_tree", "emit_ui_patch"]);
function yl(e) {
  var r, a, l, o;
  if (!Array.isArray(e)) return [];
  const t = [], n = (s, i = !1) => {
    var m, u, p;
    if (!s || typeof s != "object") return;
    if (Array.isArray(s)) {
      const w = i ? s.map((y) => {
        var g;
        return ((g = y == null ? void 0 : y.data) == null ? void 0 : g.name) ?? (y == null ? void 0 : y.name);
      }).filter((y) => !!y).map((y) => String(y)) : [];
      if (i && w.length) {
        const y = w.some((g) => $n.has(g));
        for (const g of s) {
          const f = ((m = g == null ? void 0 : g.data) == null ? void 0 : m.output) ?? (g == null ? void 0 : g.output) ?? ((u = g == null ? void 0 : g.data) == null ? void 0 : u.result) ?? (g == null ? void 0 : g.result) ?? ((p = g == null ? void 0 : g.data) == null ? void 0 : p.content) ?? (g == null ? void 0 : g.content);
          if (f == null) continue;
          const v = typeof f == "string" ? f : JSON.stringify(f), E = $t(v) || (y ? Pt(v) : null);
          E && t.push(E);
        }
      }
      s.forEach((y) => n(y));
      return;
    }
    const d = s;
    if (d.type === "tool_result") {
      const y = (Array.isArray(d.output) ? d.output : []).filter((v) => (v == null ? void 0 : v.type) === "text").map((v) => v.text), g = y.length ? y.join(`
`) : d.output, f = y.length ? y : [typeof g == "string" ? g : JSON.stringify(g)];
      for (const v of f) {
        const E = $t(v) || ($n.has(String(d.name || "")) ? Pt(v) : null);
        E && t.push(E);
      }
      return;
    }
    const c = ua.has(String(d.type || ""));
    Object.entries(d).forEach(
      ([w, y]) => n(y, c && w === "content")
    );
  };
  n(e);
  for (const s of e) {
    if (!s || typeof s != "object") continue;
    const i = s;
    if (!ua.has(String(i.type || "")) || !Array.isArray(i.content)) continue;
    const d = i.content, c = (a = (r = d[0]) == null ? void 0 : r.data) == null ? void 0 : a.name;
    if (!c) continue;
    const m = (o = (l = d[1]) == null ? void 0 : l.data) == null ? void 0 : o.output;
    if (m == null) continue;
    const u = typeof m == "string" ? m : JSON.stringify(m), p = $t(u) || ($n.has(String(c)) ? Pt(u) : null);
    p && t.push(p);
  }
  return Array.from(new Map(t.map((s) => [`${s.kind}:${s.ui_id}:${s.revision}`, s])).values());
}
function hl(e) {
  var o;
  const t = wt(e.sessionId, e.uiId), n = Object.entries(Ne).filter(([, s]) => s.uiId === e.uiId).sort(([, s], [, i]) => i.revision - s.revision), r = Ne[t] || ((o = n[0]) == null ? void 0 : o[1]);
  if (r && e.revision < r.revision) return;
  const a = { ...Ne };
  for (const [s] of n) s !== t && delete a[s];
  a[t] = r && e.revision === r.revision ? { ...r, ...e, tree: r.tree } : e;
  const l = Object.entries(a).sort(([, s], [, i]) => i.updatedAt - s.updatedAt);
  Ne = Object.fromEntries(l.slice(0, Ms)), un();
}
function Bs(e, t) {
  for (const n of yl(t))
    !n.ui_id || !n.tree || hl({
      schemaVersion: "1",
      uiId: n.ui_id,
      revision: n.revision || 1,
      tree: n.tree,
      sessionId: e,
      sourceToolCallId: n.tool_call_id,
      updatedAt: Date.now()
    });
}
const El = {
  setSnapshot: hl,
  applyPatch(e, t, n, r) {
    var d, c;
    const a = (d = window.QwenPaw) == null ? void 0 : d.host, l = r || ((c = a == null ? void 0 : a.getCurrentSessionId) == null ? void 0 : c.call(a)) || "", o = wt(l, e.ui_id), s = Ne[o] || Object.values(Ne).find((m) => m.uiId === e.ui_id);
    if (!s || n <= s.revision) return;
    Ne = { ...Object.fromEntries(Object.entries(Ne).filter(([, m]) => m.uiId !== e.ui_id)), [o]: { ...s, sessionId: l, tree: t, revision: n, updatedAt: Date.now() } }, un();
  },
  getSnapshot: (e, t) => Ne[wt(e, t)],
  clearSession(e) {
    Ne = Object.fromEntries(Object.entries(Ne).filter(([, t]) => t.sessionId !== e));
    for (const t of [...Lt.keys()])
      t.startsWith(`${e}::`) && Lt.delete(t);
    un();
  },
  hydrateFromMessages: Bs
};
function Us({ children: e }) {
  return e;
}
function js() {
  return El;
}
function Ns(e, t) {
  var l, o;
  const n = (o = (l = window.QwenPaw) == null ? void 0 : l.host) == null ? void 0 : o.React;
  if (!n) throw new Error("useGenUiSnapshots: host React not available");
  const r = t.join("\0"), a = r === "" ? [] : r.split("\0");
  return n.useSyncExternalStore(
    Ls,
    () => da(e, a),
    () => da(e, a)
  );
}
function Ds(e) {
  El.clearSession(e);
}
function Fs() {
  Ne = {}, Lt.clear(), un();
}
function Rt(e) {
  var t;
  if (typeof e == "string") {
    if (e.trimStart().startsWith("["))
      try {
        return Rt(JSON.parse(e));
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
    if (n.output !== void 0) return Rt(n.output);
    if (n.content !== void 0) return Rt(n.content);
  }
  return e == null ? "" : JSON.stringify(e);
}
function Gs(e) {
  const t = e.data;
  if (!t) return { resultText: "", status: "calling", toolName: "" };
  const n = t.status || "calling", r = t.content;
  if (!Array.isArray(r) || r.length === 0)
    return { resultText: "", status: n, toolName: "" };
  const a = r[0], l = a == null ? void 0 : a.data, o = (l == null ? void 0 : l.name) || "";
  if (r.length > 1) {
    const s = r[1], i = s == null ? void 0 : s.data, d = (i == null ? void 0 : i.output) ?? (i == null ? void 0 : i.content) ?? (s == null ? void 0 : s.output) ?? (s == null ? void 0 : s.content) ?? (i == null ? void 0 : i.result) ?? (s == null ? void 0 : s.result);
    if (d != null) return { resultText: Rt(d), status: n, toolName: o };
  }
  if (l != null && l.output) {
    const s = l.output;
    return { resultText: Rt(s), status: n, toolName: o };
  }
  return { resultText: "", status: n, toolName: o };
}
function ma(e) {
  var p, w, y, g;
  const t = (p = window.QwenPaw) == null ? void 0 : p.host, n = t == null ? void 0 : t.React;
  if (!n) return null;
  const { resultText: r, status: a, toolName: l } = Gs(e), o = a === "in_progress" || a === "calling", s = a === "failed" || a === "error", i = $t(r), d = i ? null : Pt(r);
  let c = 0;
  (w = i == null ? void 0 : i.tree) != null && w.root && (c = bl(i.tree.root));
  const m = l === "emit_ui_patch" || (i == null ? void 0 : i.kind) === "genui_patch", u = o ? m ? "📝 Patching UI Tree..." : "🎨 Generating UI Tree..." : s ? m ? "📝 UI Patch Error" : "🎨 UI Tree Error" : i ? m ? `📝 UI Patched (rev ${i.revision ?? "?"})` : `🎨 UI Tree (${c} nodes)` : m ? "📝 UI Patch" : "🎨 UI Tree";
  return n.createElement(
    "details",
    { open: o || s, style: { margin: "4px 0", border: "1px solid var(--ant-color-border, #d9d9d9)", borderRadius: 8, padding: "4px 8px", fontSize: 13 } },
    n.createElement(
      "summary",
      { style: { cursor: "pointer", display: "flex", alignItems: "center", gap: 6 } },
      n.createElement("span", null, m ? "📝" : "🎨"),
      n.createElement("span", null, u),
      i != null && i.ok ? n.createElement("span", { style: { fontSize: 11, color: "#999", marginLeft: "auto" } }, `ui_id: ${((y = i.ui_id) == null ? void 0 : y.slice(0, 16)) ?? ""}…`) : null
    ),
    s || d && !i ? n.createElement(
      "div",
      { style: { padding: "8px 12px", fontSize: 12 } },
      n.createElement("div", { style: { color: "var(--ant-color-error, #ff4d4f)", marginBottom: 4 } }, (d == null ? void 0 : d.message) || "Unknown error"),
      d != null && d.hint ? n.createElement("div", { style: { color: "#999" } }, `💡 ${d.hint}`) : null
    ) : i != null && i.ok ? n.createElement(
      "div",
      { style: { padding: "8px 12px", fontSize: 12, color: "#999" } },
      (g = i.tree) != null && g.root ? `GenUI 已在回复正文中展示（${c} 个节点，revision ${i.revision ?? 1}）。` : "GenUI 工具已完成，但没有可展示的树。"
    ) : n.createElement("pre", { style: { fontSize: 12, padding: "8px 12px", background: "rgba(0,0,0,0.03)", borderRadius: 8, overflow: "auto", maxHeight: 200 } }, r || "(waiting for result...)")
  );
}
function bl(e) {
  if (!e || typeof e != "object") return 0;
  let t = 1;
  if (Array.isArray(e.children)) for (const n of e.children) t += bl(n);
  return t;
}
function sn(e) {
  var t;
  if (typeof e == "string") {
    if (e.trimStart().startsWith("["))
      try {
        return sn(JSON.parse(e));
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
    if (n.output !== void 0) return sn(n.output);
    if (n.content !== void 0) return sn(n.content);
  }
  return e == null ? "" : JSON.stringify(e);
}
function Hs(e) {
  var o;
  const t = e.data;
  if (!t) return { resultText: "", status: "calling", toolName: "" };
  const n = t.status || "calling", r = t.content;
  if (!Array.isArray(r) || r.length === 0)
    return { resultText: "", status: n, toolName: "" };
  const a = (o = r[0]) == null ? void 0 : o.data, l = (a == null ? void 0 : a.name) || "";
  if (r.length > 1) {
    const s = r[1], i = s == null ? void 0 : s.data, d = (i == null ? void 0 : i.output) ?? (i == null ? void 0 : i.content) ?? (s == null ? void 0 : s.output) ?? (s == null ? void 0 : s.content);
    if (d != null) return { resultText: sn(d), status: n, toolName: l };
  }
  return { resultText: "", status: n, toolName: l };
}
function pa(e) {
  var c;
  const t = (c = window.QwenPaw) == null ? void 0 : c.host, n = t == null ? void 0 : t.React;
  if (!n) return null;
  const { resultText: r, status: a, toolName: l } = Hs(e), o = l === "get_genui_guide", s = a === "in_progress" || a === "calling";
  let i = o ? "GenUI 指南" : "组件目录", d = r;
  try {
    const m = r ? JSON.parse(r) : null;
    if (m && typeof m == "object") {
      const u = m.components;
      Array.isArray(u) ? (i = `组件目录（${u.length} 个 kind）`, d = u.map((p) => p == null ? void 0 : p.kind).filter(Boolean).join(" · ")) : (m.purpose || m.layout_structure) && (i = "GenUI 指南", d = String(m.purpose || "布局与语法说明已返回，模型可按此编写 emit_ui_tree。"));
    }
  } catch {
  }
  return n.createElement(
    "details",
    { style: { margin: "4px 0", border: "1px solid var(--ant-color-border, #d9d9d9)", borderRadius: 8, padding: "4px 8px", fontSize: 13 } },
    n.createElement("summary", { style: { cursor: "pointer" } }, s ? o ? "查阅 GenUI 指南…" : "查阅组件目录…" : i),
    n.createElement("div", { style: { padding: "8px 4px", fontSize: 12, color: "#666", lineHeight: 1.5 } }, d || "(waiting…)")
  );
}
const Ws = /* @__PURE__ */ new Set(["send_message"]), fa = 1e4, Vs = 500, ga = {};
function qs() {
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
  return new Set(Ws);
}
function Js(e) {
  const t = Date.now(), n = ga[e] || 0;
  return t - n < Vs ? (console.warn("[ugsci.genui] Action '" + e + "' throttled"), !0) : (ga[e] = t, !1);
}
function Ks(e, t) {
  return e.replace(/\{\{\s*([\w.-]+)\s*\}\}/g, (n, r) => {
    const a = t[r];
    return a == null ? "" : typeof a == "string" ? a : JSON.stringify(a);
  });
}
function Wn(e, t = {}) {
  var l, o, s, i, d, c, m;
  let n;
  if (typeof e == "string") n = { type: e };
  else if (e && typeof e == "object") n = e;
  else return { ok: !1, message: "无效操作" };
  const r = n.type === "submit_form" ? "send_message" : n.type, a = qs();
  if (!a.has(r))
    return console.warn(
      "[ugsci.genui] Action '" + n.type + "' not allowed (allowed: " + Array.from(a).join(", ") + ")"
    ), { ok: !1, message: "此操作未获允许" };
  if (Js(r)) return { ok: !1, message: "操作过于频繁，请稍后重试" };
  if (r === "send_message") {
    const u = t.formValues || {};
    let p = ((l = n.payload) == null ? void 0 : l.content) || ((o = n.payload) == null ? void 0 : o.message) || "";
    const w = /\{\{\s*[\w.-]+\s*\}\}/.test(p);
    return p = Ks(p, u).trim(), p && !w && Object.keys(u).length > 0 && (p += `
${Object.entries(u).map(([g, f]) => `${g}: ${typeof f == "string" ? f : JSON.stringify(f)}`).join(`
`)}`), !p && Object.keys(u).length > 0 && (p = `${t.formId ? `提交表单 ${t.formId}` : "提交表单"}
${Object.entries(u).map(([f, v]) => `${f}: ${typeof v == "string" ? v : JSON.stringify(v)}`).join(`
`)}`), !p || !p.trim() ? (console.warn("[ugsci.genui] send_message: content is empty"), { ok: !1, message: "消息内容为空" }) : p.length > fa ? (console.warn("[ugsci.genui] send_message: content length " + p.length + " exceeds max " + fa), { ok: !1, message: "消息内容过长" }) : !((d = (i = (s = window.QwenPaw) == null ? void 0 : s.chat) == null ? void 0 : i.sendMessage) != null && d.call(i, p)) ? (console.info("[ugsci.genui] send_message: could not find chat sender, content:", p), { ok: !1, message: "当前无法发送消息" }) : { ok: !0, message: "已提交" };
  }
  if (r === "open_url") {
    const u = ((c = n.payload) == null ? void 0 : c.url) || ((m = n.payload) == null ? void 0 : m.href) || "", p = typeof u == "string" ? u.trim() : "";
    return /^https?:\/\//i.test(p) ? (window.open(p, "_blank", "noopener,noreferrer"), { ok: !0, message: "已打开链接" }) : (console.warn("[ugsci.genui] open_url: only http(s) URLs are allowed"), { ok: !1, message: "仅允许 http(s) 链接" });
  }
  return { ok: !1, message: "尚未实现此操作" };
}
const Ke = /* @__PURE__ */ new Map(), Bt = /* @__PURE__ */ new Map(), Xs = 128, tn = /* @__PURE__ */ new Map();
function pn(e) {
  return e.startsWith("http://") || e.startsWith("https://") || e.startsWith("data:") || e.startsWith("blob:");
}
function Ys(e) {
  return e ? !!(e.startsWith("/") || /^[A-Za-z]:[\\/]/.test(e) || e.startsWith("\\\\")) : !1;
}
function Qs(e) {
  return e.startsWith("workspace://");
}
function Zs(e) {
  return Qs(e) ? e.slice(12) : e;
}
async function ec(e) {
  if (!e) return null;
  if (pn(e)) return e;
  if (Ke.has(e))
    return Ke.get(e) ?? null;
  if (tn.has(e))
    return tn.get(e);
  const t = tc(e);
  tn.set(e, t);
  try {
    const n = await t;
    if (!Ke.has(e) && Ke.size >= Xs) {
      const r = Ke.keys().next().value;
      if (r !== void 0) {
        const a = Ke.get(r);
        a != null && a.startsWith("blob:") && URL.revokeObjectURL(a), Ke.delete(r);
      }
    }
    return Ke.set(e, n), n && Bt.delete(e), n;
  } finally {
    tn.delete(e);
  }
}
async function tc(e) {
  const t = window.QwenPaw, n = t == null ? void 0 : t.host;
  if (!n) {
    const a = "宿主媒体 API 不可用。请在 QwenPaw 工作区中打开此内容，或改用 http(s)、data、blob URL。";
    return Bt.set(e, a), console.warn("[ugsci.genui]", a), null;
  }
  const r = Zs(e);
  if (typeof n.resolveWorkspaceBlob == "function")
    try {
      const a = await n.resolveWorkspaceBlob(r);
      if (a) return a;
    } catch (a) {
      console.warn("[ugsci.genui] host.resolveWorkspaceBlob failed:", a);
    }
  try {
    return await nc(r, n);
  } catch (a) {
    const l = a instanceof Error ? a.message : String(a);
    return Bt.set(
      e,
      `无法读取本地媒体：${l}。请确认文件位于当前工作区且文件预览 API 已启用。`
    ), console.warn(
      `[ugsci.genui] Failed to resolve media URL for '${e}':`,
      a
    ), null;
  }
}
async function nc(e, t) {
  let n = null;
  const r = t == null ? void 0 : t.workspaceApi, a = t == null ? void 0 : t.chatApi;
  if (Ys(e) && (a != null && a.filePreviewUrl) ? n = a.filePreviewUrl(e) : r != null && r.getBinaryFileUrl && (n = r.getBinaryFileUrl(e)), !n)
    throw new Error("宿主未提供 workspaceApi.getBinaryFileUrl 或 chatApi.filePreviewUrl");
  const l = {}, o = t == null ? void 0 : t.buildAuthHeaders;
  if (typeof o == "function")
    try {
      const d = o();
      d && typeof d == "object" && Object.assign(l, d);
    } catch {
    }
  const s = await fetch(n, { headers: l });
  if (!s.ok)
    throw new Error(`HTTP ${s.status}: ${s.statusText}`);
  const i = await s.blob();
  return URL.createObjectURL(i);
}
function ya(e) {
  return e ? pn(e) ? e : Ke.get(e) ?? null : null;
}
function ha(e) {
  return Bt.get(e) ?? null;
}
function rc() {
  for (const e of Ke.values())
    if (e && e.startsWith("blob:"))
      try {
        URL.revokeObjectURL(e);
      } catch {
      }
  Ke.clear(), Bt.clear();
}
const vl = [
  "Input",
  "NumberInput",
  "Select",
  "Textarea",
  "Switch",
  "Slider",
  "FileInput"
], ft = ["#1677ff", "#52c41a", "#faad14", "#ff4d4f", "#722ed1", "#13c2c2", "#eb2f96"], ac = /* @__PURE__ */ new Set([
  "Button",
  "InteractiveButton",
  "ToggleButton",
  "LinkButton"
]);
function Ee(e) {
  return typeof e == "string" ? e : e == null ? "" : String(e);
}
function Ve(e) {
  if (typeof e == "number" && Number.isFinite(e)) return e;
  if (typeof e == "string") {
    const t = Number(e);
    return Number.isFinite(t) ? t : 0;
  }
  return 0;
}
function It(e) {
  return Array.isArray(e) ? e : [];
}
function Ot(e) {
  return !!e;
}
function Ut(e) {
  const t = e.props || {}, n = Ee(t.name);
  if (n) return n;
  const r = Ee(t.label), a = r.match(/^\s*([a-e])(?:\b|\s|（|\()/i);
  return a ? a[1].toLowerCase() : r || Ee(e.nodeId);
}
function wl(e) {
  return vl.includes(e);
}
function Sl(e) {
  return Math.min(Math.max(Ve(e) || 2, 1), 4);
}
function lc(e, t, n = 6) {
  const r = Ve(e);
  return Math.min(Math.max(r > 0 ? r : t, 1), n);
}
function oc(e) {
  const n = (Ee(e) || "16:9").split(":"), r = Number(n[0]), a = Number(n[1]);
  return r > 0 && a > 0 ? `${r} / ${a}` : "16 / 9";
}
function ic(e) {
  return /^https?:\/\//i.test(Ee(e).trim());
}
function We(e, t) {
  const n = {}, r = `${Ve(t.gap) || 12}px`;
  if (e === "Stack")
    n.display = "flex", n.flexDirection = "column", n.gap = r, t.padding != null && (n.padding = `${Ve(t.padding)}px`);
  else if (e === "Row")
    n.display = "flex", n.flexDirection = "row", n.gap = r, t.align && (n.alignItems = Ee(t.align)), t.justify && (n.justifyContent = Ee(t.justify));
  else if (e === "Grid" || e === "FeatureGrid" || e === "KpiBoard" || e === "ImageGallery") {
    const a = e === "KpiBoard" ? 3 : e === "FeatureGrid" ? 2 : e === "ImageGallery" ? 3 : 2, l = e === "FeatureGrid" ? 4 : 6;
    n.display = "grid", n.gridTemplateColumns = `repeat(${lc(t.columns, a, l)}, minmax(0, 1fr))`, n.gap = e === "ImageGallery" ? `${Ve(t.gap) || 8}px` : r;
  } else e === "ScrollArea" ? (n.maxHeight = `${Ve(t.maxHeight) || 300}px`, n.overflowY = "auto", t.padding != null && (n.padding = `${Ve(t.padding)}px`)) : e === "AspectBox" ? (n.aspectRatio = oc(t.ratio), n.overflow = "hidden", n.borderRadius = "8px", n.display = "flex", n.justifyContent = "center", n.alignItems = "center") : e === "Spacer" && (n.height = `${Ve(t.size) || 16}px`);
  return n;
}
function cr(e, t) {
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
  let i = a(e.categories).map(n), d = a(e.series);
  if (s && t) {
    const m = o.length > 0 ? o : ["a", "b", "c", "d", "e"], u = typeof l.xMin == "number" ? l.xMin : -3, p = typeof l.xMax == "number" ? l.xMax : 3, w = Math.min(Math.max(r(l.samples) || 61, 10), 400), y = Array.from({ length: w }, (f, v) => u + (p - u) * v / Math.max(w - 1, 1)), g = m.map((f) => r(t[f]));
    i = y.map((f) => Number(f.toFixed(2)).toString()), d = [{
      name: n(l.label) || "f(x)",
      values: y.map((f) => g.reduce((v, E, h) => v + E * Math.pow(f, g.length - h - 1), 0))
    }];
  }
  const c = d.map((m, u) => {
    const p = m && typeof m == "object" ? m : {};
    return {
      name: n(p.name) || `Series ${u + 1}`,
      values: a(p.values).map(r)
    };
  });
  return {
    title: n(e.title),
    chartType: n(e.chart) || "line",
    categories: i,
    series: c,
    height: r(e.height) || 200,
    showLegend: e.showLegend !== !1,
    empty: i.length === 0 || c.length === 0
  };
}
function xl(e, t, n = 640) {
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
    const p = t.series[0].values.map((E) => Math.abs(E)), w = p.reduce((E, h) => E + h, 0) || 1, y = n / 2, g = a / 2, f = Math.min(n, a) / 2 - 20;
    let v = -Math.PI / 2;
    if (p.forEach((E, h) => {
      const S = E / w * Math.PI * 2, O = y + f * Math.cos(v), D = g + f * Math.sin(v), $ = y + f * Math.cos(v + S), A = g + f * Math.sin(v + S), F = document.createElementNS(l.namespaceURI, "path");
      F.setAttribute("d", `M ${y} ${g} L ${O} ${D} A ${f} ${f} 0 ${S > Math.PI ? 1 : 0} 1 ${$} ${A} Z`), F.setAttribute("fill", r[h % r.length]), l.appendChild(F), v += S;
    }), e.appendChild(l), t.showLegend) {
      const E = document.createElement("div");
      E.className = "legend", p.forEach((h, S) => {
        const O = document.createElement("span"), D = document.createElement("i");
        D.style.background = r[S % r.length], O.append(D, document.createTextNode(`${t.categories[S] || `#${S + 1}`}: ${h}`)), E.appendChild(O);
      }), e.appendChild(E);
    }
    return;
  }
  const o = t.series.flatMap((p) => p.values), s = Math.max(...o, 0), i = Math.min(...o, 0), d = s - i || 1, c = (p) => a - 24 - (p - i) / d * (a - 44), m = (p) => 30 + p * (n - 50) / Math.max(t.categories.length - 1, 1), u = document.createElementNS(l.namespaceURI, "line");
  if (u.setAttribute("x1", "30"), u.setAttribute("x2", String(n - 15)), u.setAttribute("y1", String(c(0))), u.setAttribute("y2", String(c(0))), u.setAttribute("stroke", "#d9d9d9"), l.appendChild(u), t.series.forEach((p, w) => {
    const y = r[w % r.length];
    if (t.chartType === "bar") {
      const v = (n - 50) / Math.max(t.categories.length, 1), E = Math.max(1, v / t.series.length - 3);
      p.values.forEach((h, S) => {
        const O = document.createElementNS(l.namespaceURI, "rect"), D = Math.min(c(h), c(0)), $ = Math.max(c(h), c(0));
        O.setAttribute("x", String(30 + S * v + w * (E + 2))), O.setAttribute("y", String(D)), O.setAttribute("width", String(E)), O.setAttribute("height", String(Math.max(1, $ - D))), O.setAttribute("fill", y), l.appendChild(O);
      });
      return;
    }
    const g = p.values.map((v, E) => `${m(E)},${c(v)}`).join(" "), f = document.createElementNS(l.namespaceURI, "polyline");
    f.setAttribute("points", g), f.setAttribute("fill", t.chartType === "area" ? `${y}22` : "none"), f.setAttribute("stroke", y), f.setAttribute("stroke-width", "2"), l.appendChild(f);
  }), e.appendChild(l), t.showLegend) {
    const p = document.createElement("div");
    p.className = "legend", t.series.forEach((w, y) => {
      const g = document.createElement("span"), f = document.createElement("i");
      f.style.background = r[y % r.length], g.append(f, document.createTextNode(w.name)), p.appendChild(g);
    }), e.appendChild(p);
  }
}
const sc = {
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
}, cc = {
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
function kl(e) {
  const t = Ee(e).trim();
  if (!t) return { kind: "empty" };
  const n = t.toLowerCase().replace(/\s+/g, "-"), r = cc[n];
  return r ? { kind: "svg", paths: sc[r] } : /^[\w.-]+$/.test(t) ? { kind: "empty" } : t.length <= 8 ? { kind: "emoji", text: t.slice(0, 8) } : { kind: "empty" };
}
function dc(e, t, n = {}) {
  const r = kl(t), a = n.size && n.size > 0 ? n.size : 16;
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
let Pn = null;
function Sn(e) {
  return Pn || (Pn = e.createContext(null)), Pn;
}
function Cl(e, t = {}) {
  if (wl(e.kind)) {
    const n = e.props || {}, r = n.value ?? n.checked;
    r !== void 0 && (t[Ut(e)] = r);
  }
  for (const n of e.children || []) Cl(n, t);
  return t;
}
function uc({
  node: e,
  children: t,
  onValuesChange: n
}) {
  var i, d;
  const r = (d = (i = window.QwenPaw) == null ? void 0 : i.host) == null ? void 0 : d.React;
  if (!r) return null;
  const a = r.useMemo(() => Cl(e), [e]), [l, o] = r.useState(a);
  r.useEffect(
    () => o((c) => ({ ...a, ...c })),
    [a]
  ), r.useEffect(() => {
    n == null || n(l);
  }, [l, n]);
  const s = r.useMemo(
    () => ({
      values: l,
      setValue: (c, m) => o((u) => ({ ...u, [c]: m }))
    }),
    [l]
  );
  return r.createElement(
    Sn(r).Provider,
    { value: s },
    t
  );
}
const Y = (e) => typeof e == "string" ? e : e != null ? String(e) : "", at = (e) => typeof e == "number" ? e : typeof e == "string" && Number(e) || 0, lt = (e) => !!e, At = (e) => Array.isArray(e) ? e : [], mc = (e, t) => {
  const n = Object.keys(e), r = Object.keys(t);
  return n.length === r.length && n.every((a) => Object.is(e[a], t[a]));
}, Ea = { xs: "12px", sm: "13px", base: "14px", lg: "16px" }, ke = {
  muted: "var(--ant-color-text-secondary, #8c8c8c)",
  default: "var(--ant-color-text, #000000d9)",
  primary: "var(--ant-color-primary, #1677ff)",
  success: "var(--ant-color-success, #52c41a)",
  warning: "var(--ant-color-warning, #faad14)",
  error: "var(--ant-color-error, #ff4d4f)"
}, pc = new Set(vl);
function fc(e) {
  const t = [], n = (r) => {
    pc.has(r.kind) && t.push(r);
    for (const a of r.children || []) n(a);
  };
  for (const r of e.children || []) n(r);
  return t;
}
let Rn = null;
function dr(e) {
  return Rn || (Rn = e.createContext(null)), Rn;
}
function gc({ node: e }) {
  var w;
  const t = (w = window.QwenPaw) == null ? void 0 : w.host, n = t == null ? void 0 : t.React, r = (t == null ? void 0 : t.antd) || {};
  if (!n) return null;
  const a = e.props || {}, l = n.useContext(Sn(n)), [o, s] = n.useState({}), [i, d] = n.useState(null), c = n.useMemo(
    () => fc(e),
    [e]
  ), m = n.useMemo(() => {
    const y = {};
    for (const g of c) {
      const f = g.props || {}, v = Ut(g);
      f.value !== void 0 ? y[v] = f.value : f.checked !== void 0 && (y[v] = f.checked);
    }
    return y;
  }, [c]);
  n.useEffect(() => s((y) => {
    const g = { ...m, ...y, ...(l == null ? void 0 : l.values) || {} };
    return mc(y, g) ? y : g;
  }), [m, l == null ? void 0 : l.values]);
  const u = n.useMemo(() => ({ values: o, setValue: (y, g) => {
    d(null), s((f) => ({ ...f, [y]: g })), l == null || l.setValue(y, g);
  } }), [o, l]), p = () => {
    var f, v;
    const y = c.filter((E) => {
      var h;
      return (h = E.props) == null ? void 0 : h.required;
    }).find((E) => {
      const h = Ut(E), S = o[h];
      return S == null || S === "" || Array.isArray(S) && S.length === 0;
    });
    if (y) {
      d({ ok: !1, message: `${Y((f = y.props) == null ? void 0 : f.label) || Y((v = y.props) == null ? void 0 : v.name) || "必填项"}不能为空` });
      return;
    }
    const g = a.action && typeof a.action == "object" ? a.action : { type: "submit_form", payload: {} };
    d(Wn(g, { formValues: o, formId: Y(a.formId) || e.nodeId }));
  };
  return n.createElement(
    dr(n).Provider,
    { value: u },
    n.createElement(
      "div",
      { style: { margin: "4px 0" } },
      a.title ? n.createElement("div", { style: { fontWeight: 600, marginBottom: 8 } }, Y(a.title)) : null,
      ...(e.children || []).map((y, g) => n.createElement(jt(n), { key: y.nodeId || g, node: y })),
      n.createElement(r.Button || "button", { type: "primary", size: "small", style: { marginTop: 8 }, onClick: p }, Y(a.submitLabel) || "提交"),
      i ? n.createElement("div", { role: "status", style: { marginTop: 6, fontSize: 12, color: i.ok ? ke.success : ke.error } }, i.message) : null
    )
  );
}
function yc({ node: e, fieldType: t }) {
  var f, v, E;
  const n = (f = window.QwenPaw) == null ? void 0 : f.host, r = n == null ? void 0 : n.React, a = (n == null ? void 0 : n.antd) || {};
  if (!r) return null;
  const l = e.props || {}, o = r.useContext(dr(r)), s = r.useContext(Sn(r)), i = o || s, [d, c] = r.useState(l.value ?? l.checked ?? ""), m = Ut(e), u = l.value ?? l.checked ?? "", p = i ? ((v = i.values) == null ? void 0 : v[m]) ?? u : d, w = (h) => {
    const S = h != null && h.target ? t === "Switch" ? h.target.checked : h.target.value : h;
    i ? i.setValue(m, S) : c(S);
  }, y = (h) => r.createElement(
    "div",
    { style: { display: "flex", flexDirection: "column", gap: 4, margin: "4px 0" } },
    l.label && t !== "Switch" ? r.createElement("label", { style: { fontSize: 12, color: ke.muted } }, Y(l.label), l.required ? r.createElement("span", { style: { color: ke.error } }, " *") : null) : null,
    h,
    l.description ? r.createElement("span", { style: { fontSize: 11, color: ke.muted } }, Y(l.description)) : null
  ), g = Y(l.label) || Y(l.placeholder) || m;
  return t === "Input" ? y(r.createElement(a.Input || "input", { "aria-label": g, placeholder: Y(l.placeholder), value: p, onChange: w, size: "small" })) : t === "NumberInput" ? y(r.createElement(a.InputNumber || "input", { "aria-label": g, value: p, min: l.min, max: l.max, step: l.step, onChange: w, size: "small", style: { width: "100%" } })) : t === "Textarea" ? y(r.createElement(((E = a.Input) == null ? void 0 : E.TextArea) || "textarea", { "aria-label": g, placeholder: Y(l.placeholder), value: p, rows: at(l.rows) || 3, onChange: w, style: { width: "100%" } })) : t === "Select" ? y(r.createElement(a.Select || "select", { "aria-label": g, placeholder: Y(l.placeholder), value: p || void 0, onChange: w, size: "small", style: { width: "100%" } }, At(l.options).map((h, S) => {
    var O;
    return r.createElement(((O = a.Select) == null ? void 0 : O.Option) || "option", { key: S, value: Y(typeof h == "object" ? h.value : h) }, Y(typeof h == "object" ? h.label : h));
  }))) : t === "Switch" ? r.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8 } }, r.createElement(a.Switch || "input", { type: "checkbox", checked: !!p, onChange: w, size: "small" }), r.createElement("span", null, Y(l.label))) : t === "Slider" ? y(r.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8 } }, r.createElement(a.Slider || "input", { type: "range", value: at(p), min: l.min ?? 0, max: l.max ?? 100, step: l.step ?? 1, onChange: w, style: { flex: 1 } }), r.createElement("span", { style: { minWidth: 32, fontSize: 12 } }, Y(p)))) : t === "FileInput" ? r.createElement(
    "label",
    { style: { display: "inline-flex", alignItems: "center", gap: 8, cursor: "pointer" } },
    r.createElement("span", null, Y(l.label) || "选择文件"),
    r.createElement("input", { type: "file", multiple: lt(l.multiple), accept: Y(l.accept) || void 0, onChange: (h) => i == null ? void 0 : i.setValue(m, Array.from(h.target.files || []).map((S) => ({ name: S.name, size: S.size, type: S.type }))) })
  ) : null;
}
function On({ node: e, link: t = !1, toggle: n = !1 }) {
  var p;
  const r = (p = window.QwenPaw) == null ? void 0 : p.host, a = r == null ? void 0 : r.React, l = (r == null ? void 0 : r.antd) || {};
  if (!a) return null;
  const o = e.props || {}, s = a.useContext(dr(a)), [i, d] = a.useState(lt(o.checked)), [c, m] = a.useState(null), u = () => {
    n && d((w) => !w), o.action && typeof o.action == "object" ? m(Wn(o.action, { formValues: s == null ? void 0 : s.values, formId: s ? "form" : void 0 })) : t && typeof o.href == "string" && m(Wn({ type: "open_url", payload: { url: o.href } }));
  };
  return a.createElement(
    "span",
    { style: { display: "inline-flex", flexDirection: "column", gap: 3 } },
    a.createElement(l.Button || "button", { type: t ? "link" : (n ? i : Y(o.variant) === "primary") ? "primary" : "default", size: "small", disabled: lt(o.disabled), loading: lt(o.loading), onClick: u }, Y(o.label) || "Action"),
    c ? a.createElement("span", { role: "status", style: { fontSize: 11, color: c.ok ? ke.success : ke.error } }, c.message) : null
  );
}
let ba = null, nn = null;
function hc(e) {
  return nn && ba === e || (ba = e, nn = class extends e.Component {
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
        style: { padding: 8, border: "1px dashed var(--ant-color-error, #ff4d4f)", borderRadius: 8, fontSize: 12, color: ke.error, fontFamily: "monospace" }
      }, `Component error: ${this.props.node.kind}`) : this.props.children;
    }
  }), nn;
}
function Ec({ node: e }) {
  var i;
  const t = (i = window.QwenPaw) == null ? void 0 : i.host;
  if (!(t != null && t.React)) return null;
  const n = t.React, r = t.antd || {}, a = jt(n), l = e.props || {}, o = e.children || [];
  return vc(n, r, e, l, o, () => o.map(
    (d, c) => n.createElement(a, { key: d.nodeId || c, node: d })
  ));
}
let rn = null, va = null;
function jt(e) {
  return rn && va === e || (rn = e.memo(Ec, (t, n) => t.node === n.node), va = e), rn;
}
function bc({ node: e }) {
  var r;
  const t = (r = window.QwenPaw) == null ? void 0 : r.host;
  if (!(t != null && t.React)) return null;
  const n = t.React;
  return n.createElement(
    hc(n),
    { node: e },
    n.createElement(jt(n), { node: e })
  );
}
function vc(e, t, n, r, a, l) {
  var o, s;
  switch (n.kind) {
    case "Stack":
      return e.createElement("div", { style: We("Stack", r) }, l());
    case "Row":
      return e.createElement("div", { style: We("Row", r) }, l());
    case "Grid":
      return e.createElement("div", { style: We("Grid", r) }, l());
    case "Spacer":
      return e.createElement("div", { style: We("Spacer", r) });
    case "ScrollArea":
      return e.createElement("div", { style: We("ScrollArea", r) }, l());
    case "AspectBox":
      return e.createElement("div", { style: We("AspectBox", r) }, l());
    case "Text":
      return e.createElement("div", { style: { fontSize: Ea[Y(r.size)] || Ea.base, color: ke[Y(r.color)] || ke.default, fontWeight: lt(r.bold) ? "bold" : "normal", lineHeight: 1.6 } }, Y(r.value));
    case "Heading": {
      const i = Sl(r.level), d = { 1: "24px", 2: "20px", 3: "18px", 4: "16px" };
      return e.createElement(`h${i}`, { style: { fontSize: d[i], fontWeight: "bold", margin: "4px 0" } }, Y(r.value));
    }
    case "Divider":
      return e.createElement(t.Divider || "hr", r.label ? { children: Y(r.label) } : {});
    case "Markdown": {
      const i = (o = window.QwenPaw) == null ? void 0 : o.host, d = i == null ? void 0 : i.ReactMarkdown;
      if (d) {
        const c = i != null && i.remarkGfm ? [i.remarkGfm] : [];
        return e.createElement(
          "div",
          { className: "qwenpaw-genui-markdown" },
          e.createElement(d, { children: Y(r.content || r.value), remarkPlugins: c })
        );
      }
      return e.createElement("div", { style: { whiteSpace: "pre-wrap", lineHeight: 1.6 } }, Y(r.content || r.value));
    }
    case "CodeBlock":
      return e.createElement("pre", { style: { padding: 12, background: "var(--ant-color-fill-tertiary, rgba(0,0,0,0.04))", borderRadius: 8, overflow: "auto", fontSize: 13, fontFamily: "monospace" } }, Y(r.code));
    case "SectionHeader":
      return e.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8, marginBottom: 8 } }, r.icon ? e.createElement("span", { style: { fontSize: 20 } }, Y(r.icon)) : null, e.createElement("div", null, e.createElement("div", { style: { fontSize: 16, fontWeight: 600 } }, Y(r.title)), r.subtitle ? e.createElement("div", { style: { fontSize: 12, color: ke.muted } }, Y(r.subtitle)) : null));
    case "KeyValueList": {
      const i = At(r.items);
      return e.createElement(
        "div",
        { style: { display: "flex", flexDirection: "column", gap: 4 } },
        ...i.map((d, c) => e.createElement(
          "div",
          { key: c, style: { display: "flex", justifyContent: "space-between", padding: "2px 0", borderBottom: c < i.length - 1 ? "1px solid var(--ant-color-border-secondary, #f0f0f0)" : "none" } },
          e.createElement("span", { style: { color: ke.muted, fontSize: 13 } }, Y(d.key)),
          e.createElement("span", { style: { fontWeight: 500, fontSize: 13 } }, Y(d.value))
        ))
      );
    }
    case "Badge":
      return e.createElement(t.Tag || "span", { color: Y(r.variant) || "default", children: Y(r.value) });
    case "Tag":
      return e.createElement(t.Tag || "span", { color: Y(r.color) || "default", children: Y(r.label) });
    case "Stat":
      return e.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 2 } }, e.createElement("span", { style: { fontSize: 12, color: ke.muted } }, Y(r.label)), e.createElement("span", { style: { fontSize: 20, fontWeight: "bold" } }, Y(r.value)), r.delta ? e.createElement("span", { style: { fontSize: 12, color: Y(r.trend) === "up" ? ke.success : Y(r.trend) === "down" ? ke.error : ke.muted } }, Y(r.delta)) : null);
    case "Progress":
      return e.createElement(t.Progress || "div", { percent: at(r.value), size: "small" });
    case "Skeleton": {
      const i = at(r.rows) || 3;
      return e.createElement(
        "div",
        { style: { display: "flex", flexDirection: "column", gap: 8 } },
        ...Array.from({ length: i }).map(
          (d, c) => e.createElement(t.Skeleton || "div", { key: c, active: lt(r.active), title: !1, paragraph: { rows: 1 } })
        )
      );
    }
    case "Avatar":
      return e.createElement(Sc, {
        src: Y(r.src),
        name: Y(r.name),
        size: at(r.size) || 32
      });
    case "Icon": {
      const i = kl(r.name), d = at(r.size) || 16, c = ke[Y(r.color)] || ke.default;
      return i.kind === "emoji" ? e.createElement("span", { "aria-hidden": !0, style: { fontSize: d, color: c, lineHeight: 1 } }, i.text) : i.kind === "svg" ? e.createElement("svg", {
        width: d,
        height: d,
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: c,
        strokeWidth: 2,
        strokeLinecap: "round",
        strokeLinejoin: "round",
        "aria-hidden": !0,
        focusable: "false",
        style: { display: "inline-block", verticalAlign: "middle" }
      }, ...i.paths.map((m, u) => e.createElement("path", { key: u, d: m }))) : e.createElement("span", { "aria-hidden": !0, style: { width: d, height: d, display: "inline-block" } });
    }
    case "Card":
      return e.createElement(t.Card || "div", { title: r.title ? Y(r.title) : void 0, size: "small", style: { margin: "4px 0" } }, l());
    case "DataCard":
      return e.createElement(t.Card || "div", { size: "small", style: { margin: "4px 0" } }, e.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center" } }, e.createElement("div", null, e.createElement("div", { style: { fontSize: 12, color: ke.muted } }, Y(r.title)), e.createElement("div", { style: { fontSize: 24, fontWeight: "bold" } }, Y(r.value))), r.icon ? e.createElement("span", { style: { fontSize: 32 } }, Y(r.icon)) : null));
    case "MetricCard":
      return e.createElement(t.Card || "div", { size: "small", style: { margin: "4px 0" } }, e.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center" } }, e.createElement("div", null, e.createElement("div", { style: { fontSize: 12, color: ke.muted } }, Y(r.title)), e.createElement("div", { style: { fontSize: 24, fontWeight: "bold" } }, Y(r.value)), r.delta ? e.createElement("span", { style: { fontSize: 12, color: Y(r.trend) === "up" ? ke.success : Y(r.trend) === "down" ? ke.error : ke.muted } }, `${Y(r.delta)} ${r.period ? Y(r.period) : ""}`.trim()) : null), r.icon ? e.createElement("span", { style: { fontSize: 32 } }, Y(r.icon)) : null));
    case "AlertCard":
    case "Alert":
      return e.createElement(t.Alert || "div", { type: Y(r.severity) === "success" ? "success" : Y(r.severity) === "warning" ? "warning" : Y(r.severity) === "error" ? "error" : "info", message: r.title ? Y(r.title) : void 0, description: Y(r.message), showIcon: !0, style: { margin: "4px 0" } });
    case "Callout":
      return e.createElement(t.Alert || "div", { type: Y(r.variant) === "tip" ? "success" : Y(r.variant) === "warning" ? "warning" : Y(r.variant) === "important" ? "error" : "info", message: r.title ? Y(r.title) : void 0, description: Y(r.message), showIcon: !0 });
    case "TimelineCard":
      return e.createElement(t.Card || "div", { size: "small", style: { margin: "4px 0" } }, e.createElement("div", { style: { display: "flex", gap: 8, alignItems: "flex-start" } }, e.createElement("div", { style: { width: 8, height: 8, borderRadius: "50%", background: Y(r.status) === "done" ? ke.success : Y(r.status) === "pending" ? ke.warning : ke.primary, marginTop: 4, flexShrink: 0 } }), e.createElement("div", null, e.createElement("div", { style: { fontWeight: 600 } }, Y(r.title)), r.date ? e.createElement("div", { style: { fontSize: 12, color: ke.muted } }, Y(r.date)) : null, r.description ? e.createElement("div", { style: { fontSize: 13, marginTop: 4 } }, Y(r.description)) : null)));
    case "KpiBoard":
      return e.createElement("div", { style: { margin: "4px 0" } }, r.title ? e.createElement("div", { style: { fontSize: 16, fontWeight: 600, marginBottom: 8 } }, Y(r.title)) : null, e.createElement("div", { style: We("KpiBoard", r) }, l()));
    case "FeatureGrid":
      return e.createElement("div", { style: { ...We("FeatureGrid", r), margin: "4px 0" } }, l());
    case "Stepper": {
      const i = At(r.steps).map((c) => Y(c)), d = at(r.current);
      return e.createElement(
        t.Steps || "div",
        { current: d, size: "small", style: { margin: "4px 0" } },
        ...i.map((c, m) => {
          var u;
          return e.createElement(((u = t.Steps) == null ? void 0 : u.Item) || "div", { key: m, title: c });
        })
      );
    }
    case "Table": {
      const i = At(r.headers).map((u) => Y(u)), c = a.filter((u) => u.kind === "TableRow").map((u, p) => {
        const w = (u.children || []).filter((g) => g.kind === "TableCell"), y = { key: p };
        return i.forEach((g, f) => {
          var E, h;
          const v = (h = (E = w[f]) == null ? void 0 : E.props) == null ? void 0 : h.value;
          y[g] = v == null ? "" : Y(v);
        }), y;
      }), m = i.map((u) => ({ title: u, dataIndex: u, key: u }));
      return e.createElement(t.Table || "table", { dataSource: c, columns: m, size: lt(r.compact) ? "small" : "middle", pagination: !1, style: { margin: "4px 0" } });
    }
    case "List": {
      const i = a.filter((d) => d.kind === "ListItem");
      return e.createElement(
        t.List || "ul",
        { size: "small", style: { margin: "4px 0" } },
        i.map((d, c) => {
          var m, u, p;
          return e.createElement(((m = t.List) == null ? void 0 : m.Item) || "li", { key: c }, (u = d.props) != null && u.icon ? e.createElement("span", { style: { marginRight: 6 } }, Y(d.props.icon)) : null, Y((p = d.props) == null ? void 0 : p.value));
        })
      );
    }
    case "ImageGallery": {
      const i = a.filter((d) => d.kind === "Image");
      return e.createElement(
        "div",
        { style: { ...We("ImageGallery", r), margin: "4px 0" } },
        ...i.map((d, c) => {
          const m = d.props || {};
          return e.createElement(Vn, { key: c, src: Y(m.src), alt: Y(m.alt), style: { width: "100%", height: 120, objectFit: "cover", borderRadius: 8, cursor: "pointer" } });
        })
      );
    }
    case "Image":
      return e.createElement("div", null, e.createElement(Vn, { src: Y(r.src), alt: Y(r.alt), style: { maxWidth: "100%", borderRadius: lt(r.rounded) ? "8px" : void 0, maxHeight: r.maxHeight ? `${at(r.maxHeight)}px` : void 0 } }), r.caption ? e.createElement("div", { style: { fontSize: 12, color: ke.muted } }, Y(r.caption)) : null);
    case "Chart":
      return e.createElement(wc, { props: r });
    case "Button":
    case "InteractiveButton":
      return e.createElement(On, { node: n });
    case "ToggleButton":
      return e.createElement(On, { node: n, toggle: !0 });
    case "LinkButton":
      return e.createElement(On, { node: n, link: !0 });
    case "Input":
    case "NumberInput":
    case "Select":
    case "Textarea":
    case "Switch":
    case "Slider":
    case "FileInput":
      return e.createElement(yc, { node: n, fieldType: n.kind });
    case "Form":
      return e.createElement(gc, { node: n });
    case "Chip":
      return e.createElement(t.Tag || "span", { color: Y(r.color) || "default", closable: !0, onClose: () => {
      }, children: Y(r.label) });
    case "ChipGroup": {
      const i = At(r.items);
      return e.createElement("div", { style: { display: "flex", flexWrap: "wrap", gap: 4 } }, ...i.map((d, c) => e.createElement(t.Tag || "span", { key: c }, Y(d))));
    }
    case "Tabs": {
      const i = jt(e), c = a.filter((m) => m.kind === "TabItem").map((m) => {
        var u, p, w;
        return {
          key: Y((u = m.props) == null ? void 0 : u.key) || Y((p = m.props) == null ? void 0 : p.tab),
          label: Y((w = m.props) == null ? void 0 : w.tab),
          children: (m.children || []).map((y, g) => e.createElement(i, { key: y.nodeId || g, node: y }))
        };
      });
      return t.Tabs ? e.createElement(t.Tabs, { items: c, defaultActiveKey: Y(r.activeKey) || ((s = c[0]) == null ? void 0 : s.key) }) : e.createElement("div", null, ...c.map((m, u) => e.createElement("div", { key: u }, e.createElement("div", { style: { fontWeight: 600, marginBottom: 4 } }, m.label), m.children)));
    }
    case "TabItem":
      return e.createElement("div", null, l());
    case "Accordion": {
      const i = jt(e), d = a.filter((c) => c.kind === "AccordionItem");
      if (t.Collapse) {
        const c = d.map((m) => {
          var u, p, w;
          return {
            key: Y((u = m.props) == null ? void 0 : u.key) || Y((p = m.props) == null ? void 0 : p.header),
            label: Y((w = m.props) == null ? void 0 : w.header),
            children: (m.children || []).map((y, g) => e.createElement(i, { key: y.nodeId || g, node: y }))
          };
        });
        return e.createElement(t.Collapse, { items: c });
      }
      return e.createElement("div", null, ...d.map((c, m) => {
        var u;
        return e.createElement("details", { key: m }, e.createElement("summary", { style: { fontWeight: 600, cursor: "pointer", padding: "4px 0" } }, Y((u = c.props) == null ? void 0 : u.header)), e.createElement("div", { style: { paddingLeft: 12 } }, (c.children || []).map((p, w) => e.createElement(i, { key: p.nodeId || w, node: p }))));
      }));
    }
    case "AccordionItem":
      return e.createElement("div", null, l());
    case "JsonDebug":
      return e.createElement("details", { style: { margin: "4px 0", fontSize: 12 } }, e.createElement("summary", null, Y(r.label) || "Debug JSON"), e.createElement("pre", { style: { fontSize: 12, padding: 8, background: "var(--ant-color-fill-tertiary, rgba(0,0,0,0.04))", borderRadius: 4, overflow: "auto" } }, JSON.stringify(r.data ?? r, null, 2)));
    default:
      return e.createElement("div", { style: { padding: 8, border: "1px dashed var(--ant-color-border, #d9d9d9)", borderRadius: 8, fontSize: 12, color: ke.muted, fontFamily: "monospace" } }, `Unknown component: ${n.kind}`);
  }
}
function wc({ props: e }) {
  var O, D;
  const t = (D = (O = window.QwenPaw) == null ? void 0 : O.host) == null ? void 0 : D.React;
  if (!t) return null;
  const n = t.useContext(Sn(t)), r = cr(e, n == null ? void 0 : n.values), a = r.chartType, l = r.title, o = r.categories, s = r.series, i = r.height, d = r.showLegend, c = 400;
  if (r.empty)
    return t.createElement("div", { style: { padding: 12, color: ke.muted, fontSize: 12 } }, "Chart: no data");
  if (a === "pie") {
    const $ = s[0].values.map((z) => Math.abs(z)), A = $.reduce((z, I) => z + I, 0) || 1, F = c / 2, V = i / 2, U = Math.min(c, i) / 2 - 20;
    let C = -Math.PI / 2;
    const x = $.map((z, I) => {
      const W = z / A * 2 * Math.PI, j = F + U * Math.cos(C), G = V + U * Math.sin(C), R = F + U * Math.cos(C + W), P = V + U * Math.sin(C + W), ee = W > Math.PI ? 1 : 0, oe = `M ${F} ${V} L ${j} ${G} A ${U} ${U} 0 ${ee} 1 ${R} ${P} Z`;
      return C += W, { path: oe, color: ft[I % ft.length], label: o[I] || `#${I + 1}`, val: z };
    });
    return t.createElement(
      "div",
      { style: { margin: "4px 0" } },
      l ? t.createElement("div", { style: { fontSize: 13, fontWeight: 600, marginBottom: 4 } }, l) : null,
      t.createElement(
        "svg",
        { width: c, height: i, style: { maxWidth: "100%" } },
        ...x.map((z, I) => t.createElement("path", { key: I, d: z.path, fill: z.color, stroke: "#fff", strokeWidth: 1 }))
      ),
      d ? t.createElement(
        "div",
        { style: { display: "flex", flexWrap: "wrap", gap: 8, marginTop: 4, fontSize: 11 } },
        ...x.map((z, I) => t.createElement(
          "span",
          { key: I, style: { display: "flex", alignItems: "center", gap: 4 } },
          t.createElement("span", { style: { display: "inline-block", width: 10, height: 10, borderRadius: 2, background: z.color } }),
          `${z.label}: ${z.val}`
        ))
      ) : null
    );
  }
  const m = s.flatMap(($) => $.values), u = Math.max(...m, 0), p = Math.min(...m, 0), w = u - p || 1, y = o.length > 0 ? (c - 40) / o.length : 0, g = s.length > 0 ? Math.max(1, y / s.length - 2) : 0, f = o.length > 1 ? (c - 40) / (o.length - 1) : 0, v = Math.max(1, Math.ceil(o.length / 8)), E = ($) => i - 20 - ($ - p) / w * (i - 40), h = E(0), S = ($) => 30 + $ * f;
  return t.createElement(
    "div",
    { style: { margin: "4px 0" } },
    l ? t.createElement("div", { style: { fontSize: 13, fontWeight: 600, marginBottom: 4 } }, l) : null,
    t.createElement(
      "svg",
      { width: c, height: i, style: { maxWidth: "100%" } },
      ...[0, 0.25, 0.5, 0.75, 1].map(($, A) => {
        const F = i - 20 - $ * (i - 40);
        return t.createElement("line", { key: `g${A}`, x1: 30, y1: F, x2: c - 10, y2: F, stroke: "var(--ant-color-border-secondary, #f0f0f0)", strokeWidth: 1 });
      }),
      ...o.map(($, A) => A % v === 0 || A === o.length - 1 ? t.createElement("text", { key: `x${A}`, x: S(A), y: i - 6, fontSize: 10, fill: ke.muted, textAnchor: "middle" }, $.length > 6 ? $.slice(0, 6) + "…" : $) : null),
      ...s.map(($, A) => {
        const F = ft[A % ft.length];
        if (a === "bar")
          return $.values.map((C, x) => t.createElement("rect", {
            key: `b${A}-${x}`,
            x: 30 + x * y + A * (g + 2) + 1,
            y: Math.min(E(C), h),
            width: g,
            height: Math.abs(h - E(C)),
            fill: F,
            rx: 2
          }));
        const V = $.values.map((C, x) => `${S(x)},${E(C)}`).join(" "), U = [t.createElement("polyline", { key: `l${A}`, points: V, fill: "none", stroke: F, strokeWidth: 2 })];
        if (a === "area") {
          const C = `${S(0)},${i - 20} ${V} ${S($.values.length - 1)},${i - 20}`;
          U.unshift(t.createElement("polygon", { key: `a${A}`, points: C, fill: F, opacity: 0.15 }));
        }
        return U;
      })
    ),
    d ? t.createElement(
      "div",
      { style: { display: "flex", flexWrap: "wrap", gap: 8, marginTop: 4, fontSize: 11 } },
      ...s.map(($, A) => t.createElement(
        "span",
        { key: A, style: { display: "flex", alignItems: "center", gap: 4 } },
        t.createElement("span", { style: { display: "inline-block", width: 10, height: 10, borderRadius: 2, background: ft[A % ft.length] } }),
        $.name
      ))
    ) : null
  );
}
function Vn(e) {
  var d;
  const t = (d = window.QwenPaw) == null ? void 0 : d.host, n = t == null ? void 0 : t.React;
  if (!n) return null;
  const { useState: r, useEffect: a } = n, [l, o] = r(
    ya(e.src) || (pn(e.src) ? e.src : null)
  ), [s, i] = r(
    ha(e.src)
  );
  return a(() => {
    if (!e.src) return;
    if (pn(e.src)) {
      o(e.src), i(null);
      return;
    }
    const c = ya(e.src);
    if (c) {
      o(c), i(null);
      return;
    }
    o(null), i(null);
    let m = !1;
    return ec(e.src).then((u) => {
      m || (o(u), i(u ? null : ha(e.src)));
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
        color: s ? ke.error : ke.muted,
        fontSize: 12,
        background: "var(--ant-color-fill-tertiary, rgba(0,0,0,0.04))",
        borderRadius: 8
      }
    },
    s ? `媒体加载失败：${s}` : "正在解析图片…"
  );
}
function Sc(e) {
  var a, l, o;
  const t = (a = window.QwenPaw) == null ? void 0 : a.host, n = t == null ? void 0 : t.React, r = (t == null ? void 0 : t.antd) || {};
  return n ? e.src ? n.createElement(Vn, {
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
const xc = `#genui-root { max-width: 960px; margin: auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px; background: #fff; box-shadow: 0 8px 30px rgba(0,0,0,.05); }
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
@media print { body { padding: 0; } }`, wa = {
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
function kc(e) {
  return e.replace(/[&<>"']/g, (t) => t === "&" ? "&amp;" : t === "<" ? "&lt;" : t === ">" ? "&gt;" : t === '"' ? "&quot;" : "&#39;");
}
function Cc(e) {
  return JSON.stringify(e).replace(/</g, "\\u003c");
}
function Q(e, t = "", n) {
  const r = document.createElement(e);
  return t && (r.className = t), n != null && n !== "" && (r.textContent = Ee(n)), r;
}
function an(e, t) {
  Object.assign(e.style, t);
}
function Tt(e, t, n) {
  for (const r of t || []) e.appendChild(ur(r, n));
  return e;
}
function Sa(e, t, n) {
  return t && e.appendChild(Q("div", "muted small", t)), e.appendChild(Q("div", "display-value", n)), e;
}
function Tl(e, t, n, r) {
  const a = Ee(e);
  if (r.missing.has(a)) {
    const o = Q("div", `media-unavailable ${n}`.trim(), "此媒体未能离线嵌入");
    return o.setAttribute("role", "img"), o.setAttribute("aria-label", Ee(t)), o;
  }
  const l = Q("img", n);
  return l.src = r.media[a] || a, l.alt = Ee(t), l;
}
function Tc(e, t, n) {
  return e ? Tl(e, t, "avatar", n) : Q("span", "avatar avatar-fallback", Ee(t).charAt(0).toUpperCase());
}
function _c(e) {
  const t = Q("div", "markdown");
  let n = null;
  for (const r of Ee(e).split(/\r?\n/)) {
    const a = r.match(/^(#{1,4})\s+(.*)$/), l = r.match(/^\s*[-*]\s+(.*)$/);
    a ? (n = null, t.appendChild(Q(`h${a[1].length}`, "", a[2]))) : l ? (n || (n = Q("ul"), t.appendChild(n)), n.appendChild(Q("li", "", l[1]))) : r.trim() ? (n = null, t.appendChild(Q("p", "", r))) : (n = null, t.appendChild(document.createElement("br")));
  }
  return t;
}
function Ic(e, t) {
  const n = e.props || {}, r = e.kind, a = Ut(e), l = Q("label", "field");
  n.label && r !== "Switch" && l.appendChild(Q("span", "field-label", `${Ee(n.label)}${n.required ? " *" : ""}`));
  let o;
  if (r === "Textarea") {
    const i = Q("textarea");
    i.rows = Ve(n.rows) || 3, i.placeholder = Ee(n.placeholder), o = i;
  } else if (r === "Select") {
    const i = Q("select");
    for (const d of It(n.options)) {
      const c = Q("option"), m = d && typeof d == "object" ? d : null;
      c.value = Ee(m ? m.value : d), c.textContent = Ee(m ? m.label : d), i.appendChild(c);
    }
    o = i;
  } else {
    const i = Q("input");
    i.type = r === "Slider" ? "range" : r === "Switch" ? "checkbox" : r === "NumberInput" ? "number" : r === "FileInput" ? "file" : "text", n.min != null && (i.min = Ee(n.min)), n.max != null && (i.max = Ee(n.max)), n.step != null && (i.step = Ee(n.step)), r === "FileInput" ? (n.accept && (i.accept = Ee(n.accept)), i.multiple = Ot(n.multiple)) : i.placeholder = Ee(n.placeholder), o = i;
  }
  const s = Object.prototype.hasOwnProperty.call(t.values, a) ? t.values[a] : n.value != null ? n.value : n.checked != null ? n.checked : "";
  if (r === "Switch") {
    const i = o;
    i.checked = Ot(s), i.checked ? i.setAttribute("checked", "") : i.removeAttribute("checked");
  } else if (r === "Textarea")
    o.value = Ee(s), o.textContent = Ee(s);
  else if (r === "Select") {
    const i = Ee(s);
    o.value = i;
    for (const d of Array.from(o.options))
      d.value === i ? d.setAttribute("selected", "") : d.removeAttribute("selected");
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
function ur(e, t) {
  var l, o, s, i, d, c, m;
  if (!e || typeof e != "object") return Q("div");
  const n = e.props || {}, r = e.children || [];
  if (wl(e.kind)) return Ic(e, t);
  if (e.kind === "Chart") {
    const u = Q("div", "chart");
    return u.setAttribute("data-genui-chart", JSON.stringify(n)), xl(u, cr(n, t.values)), u;
  }
  if (e.kind === "Heading") return Q(`h${Sl(n.level)}`, "", n.value);
  if (e.kind === "Text") return Q("div", Ot(n.bold) ? "text bold" : "text", n.value);
  if (e.kind === "Markdown") return _c(n.content || n.value);
  if (e.kind === "CodeBlock") return Q("pre", "code", n.code);
  if (e.kind === "SectionHeader") {
    const u = Q("div", "section-header");
    n.icon && u.appendChild(Q("span", "section-icon", n.icon));
    const p = Q("div");
    return p.appendChild(Q("strong", "", n.title)), n.subtitle && p.appendChild(Q("div", "muted small", n.subtitle)), u.appendChild(p), u;
  }
  if (e.kind === "KeyValueList") {
    const u = Q("dl", "key-values");
    for (const p of It(n.items)) {
      const w = p && typeof p == "object" ? p : {};
      u.append(Q("dt", "", w.key), Q("dd", "", w.value));
    }
    return u;
  }
  if (e.kind === "Divider") {
    const u = Q("div", "divider");
    return n.label && u.appendChild(Q("span", "", n.label)), u;
  }
  if (e.kind === "Spacer") {
    const u = Q("div");
    return an(u, We("Spacer", n)), u;
  }
  if (e.kind === "Tabs") {
    const u = Q("div", "tabs");
    u.setAttribute("data-genui-tabs", "1");
    const p = Q("div", "tab-buttons"), w = Q("div");
    return r.filter((g) => g.kind === "TabItem").forEach((g, f) => {
      var v;
      p.appendChild(Q("button", f ? "" : "active", (v = g.props) == null ? void 0 : v.tab)), w.appendChild(Tt(Q("div", f ? "tab-panel hidden" : "tab-panel"), g.children, t));
    }), u.append(p, w), u;
  }
  if (e.kind === "Accordion") {
    const u = Q("div");
    for (const p of r.filter((w) => w.kind === "AccordionItem")) {
      const w = Q("details");
      w.append(Q("summary", "", (l = p.props) == null ? void 0 : l.header), Tt(Q("div", "accordion-body"), p.children, t)), u.appendChild(w);
    }
    return u;
  }
  if (e.kind === "Form") {
    const u = Q("div", "stack form");
    n.title && u.appendChild(Q("div", "card-title", n.title)), Tt(u, r, t);
    const p = Q("button", "button", Ee(n.submitLabel) || "提交");
    return p.setAttribute("data-genui-submit", "1"), u.appendChild(p), u;
  }
  if (ac.has(e.kind)) {
    const u = Q("button", e.kind === "LinkButton" ? "link-button" : "button", Ee(n.label) || "Action");
    return Ot(n.disabled) && (u.disabled = !0), u.setAttribute("data-genui-action", e.kind), e.kind === "LinkButton" && ic(n.href) && u.setAttribute("data-genui-href", Ee(n.href).trim()), u;
  }
  if (e.kind === "Image") {
    const u = Q("figure");
    return u.appendChild(Tl(n.src, n.alt, "", t)), n.caption && u.appendChild(Q("figcaption", "", n.caption)), u;
  }
  if (e.kind === "ImageGallery") {
    const u = Q("div", "image-gallery");
    an(u, We("ImageGallery", n));
    for (const p of r.filter((w) => w.kind === "Image"))
      u.appendChild(ur(p, t));
    return u;
  }
  if (e.kind === "Avatar") return Tc(n.src, n.name, t);
  if (e.kind === "Badge" || e.kind === "Tag" || e.kind === "Chip")
    return Q("span", "tag", n.value || n.label);
  if (e.kind === "Progress") {
    const u = Q("progress");
    return u.max = 100, u.value = Ve(n.value), u;
  }
  if (e.kind === "Stat") {
    const u = Q("div", "stat");
    return u.append(Q("span", "muted small", n.label), Q("strong", "stat-value", n.value)), n.delta && u.appendChild(Q("span", `small trend-${Ee(n.trend)}`, n.delta)), u;
  }
  if (e.kind === "DataCard" || e.kind === "MetricCard") {
    const u = Q("div", "card metric-card"), p = Sa(Q("div"), n.title, n.value);
    return n.delta && p.appendChild(Q("div", `small trend-${Ee(n.trend)}`, `${Ee(n.delta)}${n.period ? ` ${Ee(n.period)}` : ""}`)), u.appendChild(p), n.icon && u.appendChild(Q("span", "metric-icon", n.icon)), u;
  }
  if (e.kind === "TimelineCard") {
    const u = Q("div", "card timeline");
    return u.append(Q("i", `timeline-dot status-${Ee(n.status)}`), Sa(Q("div"), n.title, n.date)), n.description && u.appendChild(Q("div", "small", n.description)), u;
  }
  if (e.kind === "Stepper") {
    const u = Q("ol", "stepper");
    return It(n.steps).forEach((p, w) => {
      u.appendChild(Q("li", w <= Ve(n.current) ? "active" : "", p));
    }), u;
  }
  if (e.kind === "Table") {
    const u = Q("table", "data-table"), p = Q("thead"), w = Q("tr");
    for (const g of It(n.headers)) w.appendChild(Q("th", "", g));
    p.appendChild(w);
    const y = Q("tbody");
    for (const g of r.filter((f) => f.kind === "TableRow")) {
      const f = Q("tr", (o = g.props) != null && o.highlight ? "highlight" : "");
      for (const v of (g.children || []).filter((E) => E.kind === "TableCell")) {
        const E = Q("td", (s = v.props) != null && s.bold ? "bold" : "", (i = v.props) == null ? void 0 : i.value);
        (d = v.props) != null && d.align && (E.style.textAlign = Ee(v.props.align)), f.appendChild(E);
      }
      y.appendChild(f);
    }
    return u.append(p, y), u;
  }
  if (e.kind === "List") {
    const u = Q(Ot(n.ordered) ? "ol" : "ul", "data-list");
    for (const p of r.filter((w) => w.kind === "ListItem"))
      u.appendChild(Q("li", "", `${(c = p.props) != null && c.icon ? `${Ee(p.props.icon)} ` : ""}${Ee((m = p.props) == null ? void 0 : m.value)}`));
    return u;
  }
  if (e.kind === "ChipGroup") {
    const u = Q("div", "chips");
    for (const p of It(n.items)) u.appendChild(Q("span", "tag", p));
    return u;
  }
  if (e.kind === "Skeleton") {
    const u = Q("div", "skeletons");
    for (let p = 0; p < (Ve(n.rows) || 3); p += 1) u.appendChild(Q("i", "skeleton"));
    return u;
  }
  if (e.kind === "Icon") {
    const u = Q("span", "icon");
    return dc(u, n.name, { size: Ve(n.size) || 16 }), u;
  }
  if (e.kind === "JsonDebug") {
    const u = Q("details");
    return u.append(
      Q("summary", "", Ee(n.label) || "Debug JSON"),
      Q("pre", "code", JSON.stringify(n.data == null ? n : n.data, null, 2))
    ), u;
  }
  if (e.kind === "KpiBoard") {
    const u = Q("div", "stack");
    n.title && u.appendChild(Q("div", "card-title", n.title));
    const p = Q("div", "grid");
    return an(p, We("KpiBoard", n)), Tt(p, r, t), u.appendChild(p), u;
  }
  if (!Object.prototype.hasOwnProperty.call(wa, e.kind))
    return Q("div", "unknown-component", `Unknown component: ${Ee(e.kind)}`);
  const a = Q("div", wa[e.kind]);
  return an(a, We(e.kind, n)), e.kind === "Card" && n.title && a.appendChild(Q("div", "card-title", n.title)), e.kind === "Card" && n.subtitle && a.appendChild(Q("div", "muted small card-subtitle", n.subtitle)), (e.kind === "Alert" || e.kind === "AlertCard" || e.kind === "Callout") && (n.title || n.message) ? (n.title && a.appendChild(Q("strong", "", n.title)), n.message && a.appendChild(Q("div", "", n.message))) : Tt(a, r, t), a;
}
function xa(e, t) {
  const n = Function.prototype.toString.call(e).replace(/^export\s+/, "").trim();
  if (!n.includes("{")) throw new Error(`cannot serialize ${t}`);
  return `var ${t} = (${n});`;
}
function Ac() {
  return `(function () {
  "use strict";
  ${xa(cr, "resolveChartModel")}
  ${xa(xl, "paintChartElement")}
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
function zc(e, t = {}, n = { sources: {}, missing: [] }) {
  const r = Q("main");
  return r.id = "genui-root", r.appendChild(ur(e, {
    values: t,
    media: n.sources || {},
    missing: new Set(n.missing || [])
  })), r;
}
function _l(e, t = {}, n = { sources: {}, missing: [] }, r = "GenUI") {
  const a = zc(e, t, n);
  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${kc(String(r || "GenUI").slice(0, 120))}</title>
  <style>
    :root { color-scheme: light; }
    html, body { margin: 0; padding: 0; background: #f5f7fa; color: #1f2329; }
    body { padding: 24px; font-family: system-ui, -apple-system, "Segoe UI", sans-serif; }
    *, *::before, *::after { box-sizing: border-box; }
    ${xc}
  </style>
</head>
<body>${a.outerHTML}
<script id="genui-values-data" type="application/json">${Cc(t)}<\/script>
<script>${Ac()}<\/script></body>
</html>`;
}
function Il(e, t) {
  const n = document.createElement("a");
  n.download = t, n.href = e, n.click();
}
async function $c(e, t) {
  const { toPng: n } = await Promise.resolve().then(() => uu), r = await n(e, {
    cacheBust: !0,
    pixelRatio: Math.min(window.devicePixelRatio || 1, 2),
    backgroundColor: "#ffffff"
  });
  Il(r, `${t}.png`), console.info("[ugsci.genui] PNG export created", { filename: t, via: "html-to-image" });
}
function Pc(e) {
  return new Promise((t, n) => {
    const r = new FileReader();
    r.onload = () => t(String(r.result || "")), r.onerror = () => n(r.error || new Error("media encoding failed")), r.readAsDataURL(e);
  });
}
async function Rc(e) {
  const t = e.currentSrc || e.src;
  if (!t) return null;
  if (t.startsWith("data:")) return t;
  try {
    const n = await fetch(t);
    return n.ok ? await Pc(await n.blob()) : null;
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
async function Al(e) {
  const t = {}, n = [], r = Array.from(e.querySelectorAll("img[data-genui-media-source]"));
  return await Promise.all(r.map(async (a) => {
    const l = a.dataset.genuiMediaSource || "", o = await Rc(a);
    l && (o ? t[l] = o : n.push(l));
  })), { sources: t, missing: Array.from(new Set(n)) };
}
async function Oc(e, t, n, r, a = r) {
  const l = await Al(e), o = _l(t, n, l, a), s = new Blob([o], { type: "text/html;charset=utf-8" }), i = URL.createObjectURL(s);
  Il(i, `${r}.html`), setTimeout(() => URL.revokeObjectURL(i), 1e3), l.missing.length && console.warn("[ugsci.genui] HTML export has media that could not be embedded", { filename: r, missing: l.missing }), console.info("[ugsci.genui] HTML export created", { filename: r, bytes: s.size, embeddedMedia: Object.keys(l.sources).length, missingMedia: l.missing.length });
}
async function Mc(e, t, n, r) {
  const a = await Al(e), l = _l(t, n, a, r), o = window.open("", "_blank", "noopener,noreferrer");
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
const je = "var(--ant-color-text, rgba(0, 0, 0, 0.88))", Oe = "var(--ant-color-text-secondary, rgba(0, 0, 0, 0.45))", ht = "var(--ant-color-border-secondary, #f0f0f0)", qn = "var(--ant-color-bg-container, #fff)", Jn = "var(--ant-color-fill-quaternary, rgba(0, 0, 0, 0.02))", zl = "var(--ant-color-success, #52c41a)", Lc = "var(--ant-color-success-bg, #f6ffed)", Bc = "var(--ant-color-warning, #faad14)", Uc = "var(--ant-color-warning-bg, #fffbe6)", $l = "var(--ant-color-error, #ff4d4f)", jc = "var(--ant-color-error-bg, #fff2f0)", ka = "var(--ant-color-primary, #1677ff)", Nc = {
  derived_expression: "推导结果",
  effective_inventory: "有效库存",
  estimated_ogip: "估算原始储量",
  initial_p_over_z: "初始 p/z",
  current_p_over_z: "当前 p/z",
  recovery_factor: "采收率",
  remaining_gas: "剩余气量",
  result: "计算结果",
  transformed_expression: "变换结果"
}, Pl = {
  current_pressure: "当前压力",
  current_z_factor: "当前 z 因子",
  initial_pressure: "初始压力",
  initial_z_factor: "初始 z 因子",
  produced_gas: "累计产气量"
};
function Nt(e) {
  return Nc[e] || Pl[e] || e.replace(/[_.-]+/g, " ").replace(/\b\w/g, (t) => t.toUpperCase());
}
function Dc(e, t = "") {
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
function fn(e, t = "") {
  if (typeof e == "number") return Dc(e, t);
  if (typeof e == "boolean") return e ? "是" : "否";
  if (e == null) return "—";
  if (typeof e == "string") return e;
  try {
    return JSON.stringify(e);
  } catch {
    return String(e);
  }
}
function Ca(e) {
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
function Fc(e) {
  const t = e == null ? void 0 : e.result;
  return !t || typeof t != "object" || Array.isArray(t) ? [] : Object.entries(t).filter(
    ([, n]) => ["string", "number", "boolean"].includes(typeof n)
  ).sort(([n], [r]) => Ca(n) - Ca(r)).slice(0, 4).map(([n, r]) => {
    var a;
    return {
      key: n,
      label: Nt(n),
      value: fn(r, n),
      unit: String(((a = e == null ? void 0 : e.units) == null ? void 0 : a[n]) || "")
    };
  });
}
function Gc(e) {
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
function Hc(e) {
  var r, a;
  const t = Array.isArray((r = e == null ? void 0 : e.trace) == null ? void 0 : r.variables) ? e.trace.variables.filter((l) => (l == null ? void 0 : l.source) === "input") : [];
  if (t.length)
    return t.slice(0, 8).map((l) => ({
      name: String(l.name || ""),
      label: String(
        Pl[String(l.name || "")] || l.display_name || Nt(String(l.name || "参数"))
      ),
      value: `${fn(l.value, l.name)}${l.unit ? ` ${l.unit}` : ""}`,
      source: "用户输入"
    }));
  const n = ((a = e == null ? void 0 : e.provenance) == null ? void 0 : a.parameter_sources) || {};
  return Object.entries(n).filter(([, l]) => (l == null ? void 0 : l.source) === "user_input").slice(0, 8).map(([l, o]) => ({
    name: l,
    label: Nt(l),
    value: `${fn(o == null ? void 0 : o.value, l)}${o != null && o.unit ? ` ${o.unit}` : ""}`,
    source: "用户输入"
  }));
}
function xn(e) {
  var c, m, u, p;
  const t = (e == null ? void 0 : e.provenance) || {}, n = t.unit_audit, r = Object.values((n == null ? void 0 : n.per_symbol) || {}), a = typeof (n == null ? void 0 : n.ok) == "boolean" ? n.ok : null, l = t.source || ((c = e == null ? void 0 : e.trace) == null ? void 0 : c.source), o = Array.isArray(e == null ? void 0 : e.warnings) ? e.warnings.map(String) : [];
  let s = "success", i = "公式与单位已核验", d = "公式匹配、参数完整，计算证据链可追溯。";
  return a === !1 ? (s = "error", i = "单位检查未通过", d = "结果使用前需要修正单位不一致项。") : l === "freeform" ? (s = "warning", i = "AI 推导 · 建议复核", d = "符号步骤已通过安全校验，但公式并非审定公式库来源。") : o.length ? (s = "warning", i = "计算完成 · 存在提醒", d = "核心计算已完成，请同时阅读警告和适用条件。") : a === null && (i = "计算证据链已记录", d = "推导步骤和参数来源可追溯；此记录没有逐项单位审计。"), {
    title: ((m = e == null ? void 0 : e.trace) == null ? void 0 : m.formula_name) || ((u = e == null ? void 0 : e.trace) == null ? void 0 : u.title) || (e == null ? void 0 : e.operation) || "UGSci 数学计算",
    formula: Gc(e),
    trustLabel: i,
    trustDetail: d,
    trustTone: s,
    results: Fc(e),
    inputs: Hc(e),
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
function Wc(e) {
  return e === "error" ? { color: $l, background: jc } : e === "warning" ? { color: Bc, background: Uc } : { color: zl, background: Lc };
}
function dt({ children: e }) {
  return k().React.createElement(
    "div",
    { style: { fontWeight: 600, color: je, marginBottom: 8 } },
    e
  );
}
function mr({
  payload: e,
  onOpenDerivation: t,
  onOpenEvidence: n,
  onReplay: r,
  compact: a = !1
}) {
  const l = k().React, o = xn(e), s = Wc(o.trustTone), i = o.results[0], d = o.results.slice(1, a ? 2 : 4);
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
          { style: { color: Oe, fontSize: 12, marginBottom: 3 } },
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
                color: je,
                fontSize: a ? 22 : 28,
                fontWeight: 600,
                overflowWrap: "anywhere"
              }
            },
            i.value
          ),
          i.unit ? l.createElement(
            "span",
            { style: { color: Oe, fontSize: 13 } },
            i.unit
          ) : null
        ) : l.createElement(
          "strong",
          { style: { color: je } },
          "计算已完成"
        ),
        i ? l.createElement(
          "div",
          { style: { color: Oe, fontSize: 12, marginTop: 3 } },
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
          color: a ? Oe : je,
          fontSize: 13,
          lineHeight: 1.65
        }
      },
      o.trustDetail
    ),
    d.length ? l.createElement(
      "div",
      {
        style: {
          display: "grid",
          gap: 6,
          paddingTop: 10,
          borderTop: `1px solid ${ht}`
        }
      },
      ...d.map(
        (c) => l.createElement(
          "div",
          {
            key: c.key,
            style: {
              display: "flex",
              justifyContent: "space-between",
              gap: 12,
              fontSize: 12
            }
          },
          l.createElement(
            "span",
            { style: { color: Oe } },
            c.label
          ),
          l.createElement(
            "span",
            { style: { color: je, textAlign: "right" } },
            `${c.value}${c.unit ? ` ${c.unit}` : ""}`
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
          borderTop: `1px solid ${ht}`,
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
          { style: { color: Oe } },
          "使用公式"
        ),
        l.createElement(
          "code",
          { style: { color: je, overflowWrap: "anywhere" } },
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
          { style: { color: Oe } },
          "关键输入"
        ),
        l.createElement(
          "span",
          { style: { color: je } },
          o.inputs.length ? o.inputs.slice(0, 5).map((c) => `${c.label}=${c.value}`).join("；") : "未提供可展示的输入摘要"
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
          { style: { color: Oe } },
          "适用条件"
        ),
        l.createElement(
          "span",
          { style: { color: je } },
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
            border: `1px solid ${ka}`,
            borderRadius: 7,
            padding: "6px 10px",
            background: ka,
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
            border: `1px solid ${ht}`,
            borderRadius: 7,
            padding: "6px 10px",
            background: qn,
            color: je,
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
            border: `1px solid ${ht}`,
            borderRadius: 7,
            padding: "6px 10px",
            background: qn,
            color: je,
            cursor: "pointer"
          }
        },
        "复现计算"
      ) : null
    )
  );
}
function Vc({ payload: e }) {
  const t = k().React, n = xn(e);
  return t.createElement(
    "div",
    { style: { display: "grid", gap: 18 } },
    t.createElement(
      "section",
      null,
      t.createElement(dt, null, "你最需要知道的"),
      t.createElement(
        "p",
        { style: { margin: 0, color: je, fontSize: 13, lineHeight: 1.7 } },
        `本次使用 ${n.title}，读取 ${n.inputs.length} 项输入，记录 ${n.stepCount} 个推导步骤`,
        n.passedGateCount ? `，并通过 ${n.passedGateCount} 项计算校验。` : "。"
      )
    ),
    t.createElement(
      "section",
      null,
      t.createElement(dt, null, "边界与提醒"),
      n.boundaries.length || n.warnings.length ? t.createElement(
        "ul",
        {
          style: {
            margin: 0,
            paddingLeft: 18,
            color: Oe,
            fontSize: 12,
            lineHeight: 1.7
          }
        },
        ...[...n.warnings, ...n.boundaries].slice(0, 4).map(
          (r, a) => t.createElement("li", { key: `${a}:${r}` }, r)
        )
      ) : t.createElement(
        "p",
        { style: { margin: 0, color: Oe, fontSize: 12 } },
        "未声明额外边界条件。"
      )
    )
  );
}
function qc({ payload: e }) {
  var s, i, d;
  const t = k().React, n = xn(e), r = (e == null ? void 0 : e.provenance) || {}, a = Object.entries(((s = r == null ? void 0 : r.unit_audit) == null ? void 0 : s.per_symbol) || {}), l = Object.entries((r == null ? void 0 : r.parameter_sources) || {}), o = (c, m, u = c) => t.createElement(
    "div",
    {
      key: u,
      style: {
        display: "grid",
        gridTemplateColumns: "90px minmax(0, 1fr)",
        gap: 10,
        padding: "8px 0",
        borderBottom: `1px solid ${ht}`,
        fontSize: 12
      }
    },
    t.createElement("span", { style: { color: Oe } }, c),
    t.createElement(
      "span",
      { style: { color: je, overflowWrap: "anywhere" } },
      m || "—"
    )
  );
  return t.createElement(
    "div",
    { style: { display: "grid", gap: 18 } },
    t.createElement(
      "section",
      null,
      t.createElement(dt, null, "公式身份"),
      o("公式来源", r.reference || n.title),
      o(
        "公式版本",
        `${r.formula_id || ((i = e == null ? void 0 : e.trace) == null ? void 0 : i.formula_id) || "—"} · ${r.formula_version || ((d = e == null ? void 0 : e.trace) == null ? void 0 : d.formula_version) || "—"}`
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
        dt,
        null,
        `参数来源（${l.length}）`
      ),
      l.length ? t.createElement(
        "div",
        { style: { display: "grid" } },
        ...l.map(
          ([c, m]) => o(
            Nt(c),
            `${(m == null ? void 0 : m.source) === "user_input" ? "用户输入" : "推导生成"} · ${fn(m == null ? void 0 : m.value, c)}${m != null && m.unit ? ` ${m.unit}` : ""}`,
            c
          )
        )
      ) : t.createElement(
        "p",
        { style: { margin: 0, color: Oe, fontSize: 12 } },
        "没有参数来源记录。"
      )
    ),
    t.createElement(
      "section",
      null,
      t.createElement(
        dt,
        null,
        `单位审计（${n.unitCheckCount} 项）`
      ),
      t.createElement(
        "div",
        {
          style: {
            color: n.unitAuditOk === !1 ? $l : n.unitAuditOk === !0 ? zl : Oe,
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
          { style: { cursor: "pointer", color: Oe, fontSize: 12 } },
          "查看逐项单位检查"
        ),
        t.createElement(
          "div",
          { style: { marginTop: 6 } },
          ...a.map(
            ([c, m]) => o(
              Nt(c),
              `${m != null && m.ok ? "✓" : "✗"} ${(m == null ? void 0 : m.actual) || "无量纲"} → ${(m == null ? void 0 : m.expected) || "—"}`,
              `unit:${c}`
            )
          )
        )
      ) : null
    ),
    Array.isArray(r.gate) && r.gate.length ? t.createElement(
      "section",
      null,
      t.createElement(dt, null, "通过的计算校验"),
      t.createElement(
        "ul",
        {
          style: {
            margin: 0,
            paddingLeft: 18,
            color: Oe,
            fontSize: 12,
            lineHeight: 1.7
          }
        },
        ...r.gate.map(
          (c, m) => t.createElement(
            "li",
            { key: `${m}:${c}` },
            String(c)
          )
        )
      )
    ) : null,
    r.replay_token ? t.createElement(
      "section",
      null,
      t.createElement(dt, null, "复现身份"),
      t.createElement(
        "code",
        {
          style: {
            display: "block",
            padding: 10,
            borderRadius: 8,
            background: Jn,
            color: Oe,
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
function Jc({ payload: e }) {
  const t = k().React, n = xn(e), [r, a] = t.useState(!1), l = e == null ? void 0 : e.replay, o = [
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
            style: { padding: 10, borderRadius: 8, background: Jn }
          },
          t.createElement(
            "strong",
            { style: { display: "block", color: je } },
            String(s)
          ),
          t.createElement(
            "span",
            { style: { color: Oe, fontSize: 11 } },
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
          border: `1px solid ${ht}`,
          borderRadius: 7,
          padding: "6px 10px",
          background: qn,
          color: je,
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
          background: Jn,
          color: Oe,
          whiteSpace: "pre-wrap",
          overflowWrap: "anywhere",
          fontSize: 11,
          lineHeight: 1.55
        }
      },
      JSON.stringify(e, null, 2)
    ) : t.createElement(
      "p",
      { style: { margin: 0, color: Oe, fontSize: 12 } },
      "原始运行数据默认隐藏，需要诊断或审计时再展开。"
    )
  );
}
const Kc = 128;
let Kn = [], Rl = "";
const Xn = /* @__PURE__ */ new Set(), Ol = () => Xn.forEach((e) => e()), Ml = (e) => (Xn.add(e), () => Xn.delete(e)), Ta = () => Kn;
function pr(e) {
  return !!(e && typeof e == "object" && e.trace && Array.isArray(e.trace.steps) && e.provenance && (e.operation || e.trace.formula_id));
}
function Xc(e) {
  if (!e || typeof e != "object" || !e.replay_id || !e.status || !pr(e.result))
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
function fr(e, t) {
  var a, l, o, s, i;
  if (!pr(e)) return null;
  const n = (a = e.replay) != null && a.replayId ? `replay:${e.replay.replayId}` : `${((l = e.trace) == null ? void 0 : l.formula_id) || "derivation"}:${((o = e.provenance) == null ? void 0 : o.input_fingerprint) || e.operation || crypto.randomUUID()}`, r = {
    uiId: n,
    sessionId: t || ((i = (s = k()).getCurrentSessionId) == null ? void 0 : i.call(s)) || "",
    payload: e,
    updatedAt: Date.now()
  };
  return Kn = [r, ...Kn.filter((d) => d.uiId !== n)].slice(
    0,
    Kc
  ), Ol(), r;
}
function gr(e) {
  Rl = e, Ol();
}
function Yc() {
  return k().React.useSyncExternalStore(
    Ml,
    () => Rl,
    () => ""
  );
}
function Ll(e) {
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
    const a = Xc(r);
    if (a) {
      t.push(a);
      return;
    }
    pr(r) && t.push(r), Object.values(r).forEach(n);
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
function Qc(e, t) {
  Ll(e).forEach(
    (n) => fr(n, t)
  );
}
function Zc(e) {
  const t = k().React, n = t.useSyncExternalStore(Ml, Ta, Ta);
  return t.useMemo(
    () => n.filter((r) => r.sessionId === e),
    [n, e]
  );
}
const ed = [], bt = /* @__PURE__ */ new Map();
function td(e) {
  bt.set(e, (bt.get(e) || 0) + 1);
}
function nd(e) {
  const t = (bt.get(e) || 1) - 1;
  t > 0 ? bt.set(e, t) : bt.delete(e);
}
function rd(e) {
  return (bt.get(e) || 0) > 0;
}
function _a(e) {
  const t = [], n = (r) => {
    t.push(r);
    for (const a of r.children || []) n(a);
  };
  return n(e), t;
}
function ad(e) {
  var d, c;
  const t = _a(e), n = String(
    ((c = (d = t.find(
      (m) => {
        var u;
        return m.kind === "Heading" && Number((u = m.props) == null ? void 0 : u.level) === 2;
      }
    )) == null ? void 0 : d.props) == null ? void 0 : c.value) || "公式计算"
  ), r = t.some(
    (m) => {
      var u;
      return m.kind === "Alert" && String(((u = m.props) == null ? void 0 : u.severity) || "") === "warning";
    }
  ), a = t.filter((m) => m.kind === "MetricCard").map((m) => {
    var u, p;
    return {
      label: String(((u = m.props) == null ? void 0 : u.title) || "结果"),
      value: String(((p = m.props) == null ? void 0 : p.value) ?? "—")
    };
  }), l = t.filter((m) => m.kind === "TableRow").map(
    (m) => (m.children || []).filter((u) => u.kind === "TableCell").map((u) => {
      var p;
      return String(((p = u.props) == null ? void 0 : p.value) ?? "");
    })
  ).filter((m) => m.length >= 4 && m[3] === "derived").map((m) => ({
    label: m[0] || "结果",
    value: [m[1], m[2]].filter(Boolean).join(" ")
  })).reverse(), o = t.filter((m) => m.kind === "NumberInput" || m.kind === "Slider").slice(0, 5).map(
    (m) => {
      var u, p, w;
      return `${String(((u = m.props) == null ? void 0 : u.label) || ((p = m.props) == null ? void 0 : p.name) || "输入")}=${String(
        ((w = m.props) == null ? void 0 : w.value) ?? "—"
      )}`;
    }
  ), s = t.filter((m) => m.kind === "AccordionItem").filter(
    (m) => {
      var u;
      return ["适用场景", "假设条件"].includes(String(((u = m.props) == null ? void 0 : u.header) || ""));
    }
  ).flatMap((m) => _a(m)).filter((m) => m.kind === "ListItem").map((m) => {
    var u;
    return String(((u = m.props) == null ? void 0 : u.value) || "");
  }).filter(Boolean).slice(0, 3), i = [...l, ...a].filter(
    (m, u, p) => p.findIndex(
      (w) => w.label === m.label && w.value === m.value
    ) === u
  );
  return { title: n, warning: r, inputs: o, conditions: s, results: i };
}
function ld({ data: e }) {
  var y, g;
  const t = (y = window.QwenPaw) == null ? void 0 : y.host, n = t == null ? void 0 : t.React;
  if (!n) return null;
  const r = js(), a = n.useRef(/* @__PURE__ */ new Map()), l = ((g = t.getCurrentSessionId) == null ? void 0 : g.call(t)) || "__current_chat__", o = Array.isArray(e.output) ? e.output : ed, s = n.useMemo(
    () => yl(o),
    [o]
  ), i = n.useMemo(
    () => Ll(o),
    [o]
  );
  n.useEffect(() => {
    for (const f of s) {
      if (!f.ui_id || !f.tree) continue;
      const v = r.getSnapshot(l, f.ui_id);
      v && v.revision >= (f.revision || 1) || r.setSnapshot({
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
  const d = n.useMemo(
    () => s.filter((f) => f.kind === "genui" && !!f.ui_id).map((f) => f.ui_id),
    [s]
  ), c = d.join("\0");
  n.useEffect(() => {
    for (const f of d) td(f);
    return () => {
      for (const f of d) nd(f);
    };
  }, [c]);
  const m = n.useMemo(
    () => s.map((f) => f.ui_id).filter((f) => !!f),
    [s]
  ), p = Ns(l, m).filter(
    (f) => (
      // Only include snapshots whose ui_id appears in this response's results
      s.some(
        (v) => v.ui_id === f.uiId && (v.kind === "genui" || v.kind === "genui_patch" && !rd(f.uiId))
      )
    )
  ).sort((f, v) => f.updatedAt - v.updatedAt);
  if (i.length > 0)
    return n.createElement(
      "div",
      {
        className: "qwenpaw-genui-inline qwenpaw-derivation-inline",
        style: { marginTop: 8, marginBottom: 8, display: "grid", gap: 8 }
      },
      ...i.map(
        (f, v) => {
          var E, h;
          return n.createElement(
            "div",
            {
              key: String(
                ((E = f.provenance) == null ? void 0 : E.replay_token) || ((h = f.trace) == null ? void 0 : h.formula_id) || v
              ),
              style: {
                border: "1px solid var(--ant-color-border-secondary, #f0f0f0)",
                borderRadius: 12,
                padding: 12,
                background: "var(--ant-color-bg-container, #fff)"
              }
            },
            n.createElement(mr, {
              payload: f,
              compact: !0,
              onOpenDerivation: () => {
                const S = fr(f, l);
                S != null && S.uiId && gr(S.uiId), window.dispatchEvent(
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
      key: wt(f.sessionId, f.uiId),
      className: "qwenpaw-genui-tree",
      "data-genui-id": f.uiId,
      style: {
        border: "1px solid var(--ant-color-border-secondary, #f0f0f0)",
        borderRadius: 12,
        padding: 16,
        marginBottom: 8,
        background: "var(--ant-color-bg-container, #fff)"
      },
      ref: (v) => {
        v && (v.__genuiId = f.uiId);
      }
    },
    n.createElement(
      "div",
      { className: "qwenpaw-genui-export-target" },
      n.createElement(uc, {
        node: f.tree.root,
        onValuesChange: (v) => a.current.set(f.uiId, v),
        children: n.createElement(bc, {
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
          onClick: (v) => {
            var h;
            const E = (h = v.currentTarget.closest(".qwenpaw-genui-tree")) == null ? void 0 : h.querySelector(
              ".qwenpaw-genui-export-target"
            );
            E && $c(E, f.uiId).catch(
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
          onClick: (v) => {
            var h;
            const E = (h = v.currentTarget.closest(".qwenpaw-genui-tree")) == null ? void 0 : h.querySelector(
              ".qwenpaw-genui-export-target"
            );
            E && Mc(
              E,
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
          onClick: (v) => {
            var h;
            const E = (h = v.currentTarget.closest(".qwenpaw-genui-tree")) == null ? void 0 : h.querySelector(
              ".qwenpaw-genui-export-target"
            );
            E && Oc(
              E,
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
      const v = ad(f.tree.root), E = v.results[0] || {
        label: "计算结果",
        value: "已完成"
      };
      return n.createElement(
        "div",
        {
          key: wt(f.sessionId, f.uiId),
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
              v.title
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
              E.value
            ),
            n.createElement(
              "span",
              {
                style: {
                  color: "var(--ant-color-text-secondary, rgba(0,0,0,.45))",
                  fontSize: 12
                }
              },
              E.label
            )
          ),
          n.createElement(
            "span",
            {
              style: {
                borderRadius: 999,
                padding: "4px 8px",
                fontSize: 12,
                color: v.warning ? "var(--ant-color-warning, #faad14)" : "var(--ant-color-success, #52c41a)",
                background: v.warning ? "var(--ant-color-warning-bg, #fffbe6)" : "var(--ant-color-success-bg, #f6ffed)"
              }
            },
            v.warning ? "需要人工复核" : "✓ 公式与单位已核验"
          )
        ),
        v.results.length > 1 ? n.createElement(
          "div",
          {
            style: {
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
              gap: 8
            }
          },
          ...v.results.slice(1, 4).map(
            (h) => n.createElement(
              "div",
              {
                key: `${h.label}:${h.value}`,
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
                h.label
              ),
              n.createElement("strong", null, h.value)
            )
          )
        ) : null,
        v.inputs.length ? n.createElement(
          "div",
          {
            style: {
              color: "var(--ant-color-text-secondary, rgba(0,0,0,.45))",
              fontSize: 12,
              lineHeight: 1.6
            }
          },
          `关键输入：${v.inputs.join("；")}`
        ) : null,
        v.conditions.length ? n.createElement(
          "div",
          {
            style: {
              color: "var(--ant-color-text-secondary, rgba(0,0,0,.45))",
              fontSize: 12,
              lineHeight: 1.6
            }
          },
          `适用条件：${v.conditions.join("；")}`
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
function od({ payload: e }) {
  var s, i;
  const t = k().React, n = ((s = e == null ? void 0 : e.trace) == null ? void 0 : s.variables) || [], r = ((i = e == null ? void 0 : e.trace) == null ? void 0 : i.steps) || [], a = [
    ...n.map((d, c) => ({
      id: d.name,
      label: d.symbol || d.name,
      x: 20,
      y: 30 + c * 54,
      kind: "variable"
    })),
    ...r.map((d, c) => ({
      id: d.id,
      label: d.title,
      x: 380,
      y: 30 + c * 54,
      kind: "step",
      step: d
    }))
  ], l = new Map(a.map((d) => [d.id, d])), o = [];
  for (const d of r) {
    for (const c of d.reads || [])
      l.has(c) && o.push({ from: c, to: d.id });
    d.writes && l.has(d.writes) && o.push({ from: d.id, to: d.writes });
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
    ...o.map((d, c) => {
      const m = l.get(d.from), u = l.get(d.to);
      return t.createElement("line", {
        key: `e${c}`,
        x1: m.x + 155,
        y1: m.y + 16,
        x2: u.x,
        y2: u.y + 16,
        stroke: "var(--ant-color-border, #d9d9d9)",
        markerEnd: "url(#arrow)"
      });
    }),
    ...a.map(
      (d) => t.createElement(
        "g",
        { key: d.id, transform: `translate(${d.x} ${d.y})` },
        t.createElement("rect", {
          width: 155,
          height: 32,
          rx: 6,
          fill: d.kind === "variable" ? "var(--ant-color-primary-bg, #e6f4ff)" : "var(--ant-color-fill-quaternary, #fafafa)",
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
          `${d.id} · ${String(d.label).slice(0, 18)}`
        )
      )
    )
  );
}
function id({
  payload: e,
  compact: t = !1
}) {
  var d;
  const n = k().React, [r, a] = n.useState(!t), l = ((d = e == null ? void 0 : e.trace) == null ? void 0 : d.steps) || [], o = l.filter(
    (c) => c.kind !== "bind" || c.note !== "input"
  ), i = (r ? l : o).map(
    (c, m) => n.createElement(
      "article",
      {
        key: c.id,
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
          c.title
        ),
        c.unicode || c.expression ? n.createElement(
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
          c.unicode || c.expression
        ) : null,
        c.value !== null && c.value !== void 0 ? n.createElement(
          "div",
          {
            style: {
              color: "var(--ant-color-text-secondary, rgba(0,0,0,.45))",
              fontSize: 11,
              marginTop: 3
            }
          },
          `${c.display_value ?? c.value} ${c.display_unit || c.unit || ""}`
        ) : null,
        c.description ? n.createElement(
          "div",
          {
            style: {
              color: "var(--ant-color-text-tertiary, rgba(0,0,0,.25))",
              fontSize: 11,
              marginTop: 3,
              lineHeight: 1.55
            }
          },
          c.description
        ) : null,
        c.kind === "assert" ? n.createElement(
          "span",
          {
            style: {
              display: "inline-block",
              color: c.value ? "var(--ant-color-success, #52c41a)" : "var(--ant-color-error, #ff4d4f)",
              fontSize: 11,
              marginTop: 4
            }
          },
          c.value ? "✓ 通过" : "✗ 失败"
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
        onClick: () => a((c) => !c),
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
const ln = "var(--ant-color-text, rgba(0,0,0,.88))", Mn = "var(--ant-color-text-secondary, rgba(0,0,0,.45))", Ia = "var(--ant-color-border, #d9d9d9)", Ln = "var(--ant-color-bg-container, #fff)", Aa = "var(--ant-color-primary, #1677ff)";
function sd() {
  var g, f, v;
  const e = k().React, t = ((f = (g = k()).getCurrentSessionId) == null ? void 0 : f.call(g)) || "", n = Zc(t), r = Yc(), [a, l] = e.useState(n[0]), [o, s] = e.useState("summary"), [i, d] = e.useState("steps");
  if (e.useEffect(() => {
    const E = n.find((h) => h.uiId === r);
    E && E !== a ? l(E) : n.some((h) => h.uiId === (a == null ? void 0 : a.uiId)) || l(n[0]);
  }, [n, r, a]), !n.length)
    return e.createElement(
      "div",
      { style: { padding: 20, color: Mn } },
      "暂无推导记录。运行 UGSci 公式后可在此查看。"
    );
  const c = (a == null ? void 0 : a.payload) || n[0].payload, m = c.provenance || {}, u = c.replay, p = () => {
    var h, S, O;
    const E = m.replay_token;
    E && ((O = (S = (h = window.QwenPaw) == null ? void 0 : h.chat) == null ? void 0 : S.sendMessage) == null || O.call(
      S,
      `请调用 ugsci_replay_calculation 验证并重放以下令牌：
${E}`
    ));
  }, w = [
    ["summary", "摘要"],
    ["derivation", "推导"],
    ["evidence", "证据"],
    ["logs", "日志"]
  ], y = (E) => ({
    flex: "1 1 64px",
    minWidth: 0,
    border: "none",
    borderRadius: 7,
    padding: "6px 8px",
    background: E ? Ln : "transparent",
    color: E ? ln : Mn,
    boxShadow: E ? "0 1px 4px rgba(0,0,0,.08)" : "none",
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
          { style: { display: "block", color: ln } },
          "计算详情"
        ),
        e.createElement(
          "span",
          { style: { color: Mn, fontSize: 11 } },
          ((v = c.trace) == null ? void 0 : v.formula_name) || c.operation || "UGSci 推导"
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
        ([E, h]) => e.createElement(
          "button",
          {
            key: E,
            type: "button",
            role: "tab",
            onClick: () => s(E),
            "aria-selected": o === E,
            style: y(o === E)
          },
          h
        )
      )
    ),
    n.length > 1 ? e.createElement(
      "select",
      {
        "aria-label": "选择计算记录",
        value: (a == null ? void 0 : a.uiId) || n[0].uiId,
        onChange: (E) => {
          gr(E.target.value), l(
            n.find((h) => h.uiId === E.target.value)
          );
        },
        style: {
          width: "100%",
          padding: "7px 9px",
          border: `1px solid ${Ia}`,
          borderRadius: 7,
          color: ln,
          background: Ln
        }
      },
      ...n.map(
        (E) => {
          var h;
          return e.createElement(
            "option",
            { key: E.uiId, value: E.uiId },
            ((h = E.payload.trace) == null ? void 0 : h.formula_name) || E.uiId.slice(0, 18)
          );
        }
      )
    ) : null,
    o === "summary" ? e.createElement(
      "div",
      { role: "tabpanel", style: { display: "grid", gap: 18 } },
      e.createElement(mr, {
        payload: c,
        onOpenDerivation: () => s("derivation"),
        onOpenEvidence: () => s("evidence"),
        onReplay: m.replay_token ? p : void 0
      }),
      e.createElement(Vc, { payload: c })
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
          ([E, h]) => e.createElement(
            "button",
            {
              key: E,
              type: "button",
              onClick: () => d(E),
              "aria-pressed": i === E,
              style: {
                border: `1px solid ${i === E ? Aa : Ia}`,
                borderRadius: 7,
                padding: "5px 9px",
                background: Ln,
                color: i === E ? Aa : ln,
                cursor: "pointer"
              }
            },
            h
          )
        )
      ),
      i === "flow" ? e.createElement(od, { payload: c }) : e.createElement(id, { payload: c, compact: !0 })
    ) : o === "evidence" ? e.createElement(
      "div",
      { role: "tabpanel" },
      e.createElement(qc, { payload: c })
    ) : e.createElement(
      "div",
      { role: "tabpanel" },
      e.createElement(Jc, { payload: c })
    )
  );
}
function zt(e) {
  var t;
  if (typeof e == "string")
    try {
      return zt(JSON.parse(e));
    } catch {
      return null;
    }
  return Array.isArray(e) ? zt((t = e.find((n) => (n == null ? void 0 : n.type) === "text")) == null ? void 0 : t.text) : e != null && e.status && (e != null && e.result) ? {
    ...e.result,
    replay: {
      replayId: String(e.replay_id || ""),
      status: String(e.status),
      reproducible: e.reproducible === !0,
      elapsedMs: typeof e.elapsed_ms == "number" ? e.elapsed_ms : void 0,
      diff: e.diff && typeof e.diff == "object" ? e.diff : {}
    }
  } : (e == null ? void 0 : e.output) !== void 0 ? zt(e.output) : (e == null ? void 0 : e.content) !== void 0 ? zt(e.content) : e;
}
function cd(e) {
  var i, d, c, m, u, p, w;
  const t = k().React, n = ((i = e == null ? void 0 : e.data) == null ? void 0 : i.content) || [], r = ((c = (d = n[1]) == null ? void 0 : d.data) == null ? void 0 : c.output) ?? ((u = (m = n[1]) == null ? void 0 : m.data) == null ? void 0 : u.content) ?? ((w = (p = n[0]) == null ? void 0 : p.data) == null ? void 0 : w.output), a = zt(r), [l, o] = t.useState(null);
  t.useEffect(() => {
    a && o(fr(a));
  }, [r]);
  const s = () => {
    l != null && l.uiId && gr(l.uiId), window.dispatchEvent(
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
    a ? t.createElement(mr, {
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
let ct = null;
function dd(e, t) {
  var a, l, o, s;
  const n = "ugsci";
  ct == null || ct();
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
      e.chat.toolRender(n, "emit_ui_tree", ma)
    ), r.push(
      e.chat.toolRender(n, "emit_ui_patch", ma)
    ), r.push(
      e.chat.toolRender(n, "list_ui_components", pa)
    ), r.push(
      e.chat.toolRender(n, "get_genui_guide", pa)
    );
    for (const i of [
      "ugsci_trace_calculation",
      "ugsci_replay_calculation",
      "ugsci_derive_formula",
      "ugsci_evaluate_formula",
      "ugsci_transform_formula",
      "ugsci_formula_preview"
    ])
      r.push(e.chat.toolRender(n, i, cd));
    console.info("[ugsci.genui] Registered emit/patch + catalog/guide cards");
  }
  return (l = e.slot) != null && l.fill && r.push(
    e.slot.fill(
      n,
      "chat.workbench.compute",
      () => t.createElement(sd)
    )
  ), (s = (o = e.chat) == null ? void 0 : o.response) != null && s.append && (r.push(
    e.chat.response.append(
      n,
      (i) => {
        const d = () => (t.useEffect(
          () => Qc(i.data.output),
          [i.data.output]
        ), null);
        return t.createElement(
          Us,
          null,
          t.createElement(d),
          t.createElement(ld, { data: i.data })
        );
      },
      { id: "ugsci.genui.response-append", order: 50 }
    )
  ), console.info("[ugsci.genui] Registered response.append slot")), ct = () => {
    var i;
    for (const d of r.reverse()) (i = d == null ? void 0 : d.dispose) == null || i.call(d);
    if (Fs(), rc(), e.genui) {
      const d = { ...e.genui };
      delete d.dispose, delete d.clearSession, e.genui = d;
    }
    ct = null;
  }, e.genui = {
    ...e.genui || {},
    dispose: ct,
    clearSession: Ds
  }, ct;
}
const za = {
  enabled: !0,
  persisted_enabled: !0,
  overridden: !1,
  channels: ["response.append"],
  allow_html: !1,
  allow_actions: [],
  backend_unavailable: !0
};
function Bn(e) {
  const t = window.QwenPaw;
  t && (t.genui = { ...t.genui || {}, config: e });
}
function ud() {
  const e = k().React, { Alert: t, Card: n, Space: r, Spin: a, Switch: l, Typography: o, message: s } = k().antd, { useEffect: i, useState: d } = e, [c, m] = d(null), [u, p] = d(!1);
  i(() => {
    let y = !0, g = null;
    const f = (v = !1) => {
      de("/ugsci/genui/config").then((E) => {
        y && (m(E), Bn(E));
      }).catch((E) => {
        y && (m(za), Bn(za), v && s.error(String(E)), g = setTimeout(() => f(!1), 3e4));
      });
    };
    return f(!0), () => {
      y = !1, g && clearTimeout(g);
    };
  }, []);
  const w = async (y) => {
    p(!0);
    try {
      const g = await de("/ugsci/genui/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: y })
      });
      m(g), Bn(g), s.success(g.overridden ? "设置已保存，但环境变量或插件配置正在覆盖它" : y ? "GenUI 已开启" : "GenUI 已关闭");
    } catch (g) {
      s.error(`保存 GenUI 设置失败：${String(g)}`);
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
      c === null ? e.createElement(a) : e.createElement(
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
            checked: c.persisted_enabled,
            loading: u,
            disabled: c.backend_unavailable,
            onChange: w
          })
        ),
        e.createElement(t, {
          type: c.backend_unavailable ? "error" : c.enabled ? "success" : "warning",
          showIcon: !0,
          message: c.backend_unavailable ? "UGSci 后端当前不可用，正在使用兼容降级模式；设置不会写入。" : c.enabled ? "GenUI 当前有效；各 Agent 仍可显式关闭自己的 GenUI 工具" : c.overridden ? "GenUI 当前被环境变量或插件配置关闭；本地设置已保存但暂不生效。" : "GenUI 已全局关闭；已有界面仍可查看，但 Agent 不会再生成或更新界面。"
        })
      )
    )
  );
}
let _t = null;
function Bl() {
  return _t || (_t = (async () => {
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
    throw _t = null, e;
  }), _t);
}
function md() {
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
function $a(e, t) {
  var a;
  const n = ((a = e.getApiToken) == null ? void 0 : a.call(e)) || "", r = typeof e.buildAuthHeaders == "function" ? { ...e.buildAuthHeaders(t.agentId) } : n ? { Authorization: `Bearer ${n}` } : {};
  return t.agentId && (r["X-Agent-Id"] = t.agentId), t.chatId && (r["X-Chat-Id"] = t.chatId), !t.chatId && t.projectDirOverride && (r["X-Session-Project-Dir"] = t.projectDirOverride), r;
}
async function Pa(e, t, n) {
  if (typeof e.fetch == "function") return e.fetch(t, n);
  const r = t.replace(/^\/ugsci\/visualization/, "");
  return fetch(`${e.getApiUrl("ugsci/visualization")}${r}`, n);
}
async function pd(e, t) {
  var a;
  const n = await Pa(e, "/ugsci/visualization/imports/workspace", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...$a(e, t)
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
    const o = await Pa(
      e,
      `/ugsci/visualization/imports/${r.job_id}`,
      { headers: $a(e, t) }
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
async function fd(e, t) {
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
function gd() {
  const e = k().React, { useEffect: t, useRef: n, useState: r } = e, { Spin: a, Alert: l, Button: o, Typography: s, message: i } = k().antd, { Text: d } = s, c = n(null), m = n(null), [u, p] = r(!0), [w, y] = r(null), [g, f] = r("正在加载三维可视化引擎...");
  return t(() => {
    let v = !1;
    async function E() {
      if (c.current)
        try {
          p(!0), y(null);
          const h = await Bl();
          if (v) return;
          const S = k(), D = {
            apiBase: S.getApiUrl("ugsci/visualization"),
            authToken: S.getApiToken() || void 0
          };
          m.current = h.mount(c.current, D);
          const $ = md();
          if ($) {
            f(`正在导入 ${$.name}...`);
            const A = await pd(S, $);
            if (v || !m.current || (f("正在打开三维网格..."), await fd(m.current, A), v)) return;
          }
          v || p(!1);
        } catch (h) {
          if (!v) {
            const S = h instanceof Error ? h.message : "Failed to load viewer";
            y(S), p(!1), i.error(`可视化引擎加载失败: ${S}`);
          }
        }
    }
    return E(), () => {
      if (v = !0, m.current) {
        try {
          m.current.dispose();
        } catch (h) {
          console.warn("[oilgas-vis] Dispose error:", h);
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
      d,
      { type: "secondary" },
      "如果持续失败，请检查网络连接或联系管理员。"
    )
  ) : e.createElement(
    "div",
    {
      style: { width: "100%", height: "100%", position: "relative" }
    },
    e.createElement("div", {
      ref: c,
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
        g
      )
    )
  );
}
function Ul(e, t) {
  var a;
  const n = ((a = e.getApiToken) == null ? void 0 : a.call(e)) || "", r = typeof e.buildAuthHeaders == "function" ? { ...e.buildAuthHeaders(t.agentId) } : n ? { Authorization: `Bearer ${n}` } : {};
  return t.agentId && (r["X-Agent-Id"] = t.agentId), t.chatId && (r["X-Chat-Id"] = t.chatId), !t.chatId && t.projectDirOverride && (r["X-Session-Project-Dir"] = t.projectDirOverride), r;
}
async function jl(e, t, n) {
  if (typeof e.fetch == "function")
    return e.fetch(t, n);
  const r = t.replace(/^\/ugsci\/visualization/, "");
  return fetch(`${e.getApiUrl("ugsci/visualization")}${r}`, n);
}
function Ra(e) {
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
function yd({ jobId: e, file: t }) {
  const n = k().React, { useEffect: r, useRef: a, useState: l } = n, o = k(), s = a(null), i = a(null), [d, c] = l("queued"), [m, u] = l(0), [p, w] = l(null), [y, g] = l(null);
  return r(() => {
    let f = !1;
    return (async () => {
      var h;
      const E = `/ugsci/visualization/imports/${e}`;
      for (let S = 0; S < 240 && !f; S += 1) {
        try {
          const O = await jl(o, E, {
            headers: { ...Ul(o, t) }
          });
          if (!O.ok) throw new Error(`状态查询失败: HTTP ${O.status}`);
          const D = await O.json();
          if (f) return;
          if (u(Number(D.progress || 0)), c(D.status), D.status === "completed") {
            if (!((h = D.result) != null && h.id)) throw new Error("导入完成但未返回数据集 ID");
            g(D.result.id);
            return;
          }
          if (D.status === "failed" || D.status === "cancelled") {
            w(D.error || Ra(D.status));
            return;
          }
        } catch (O) {
          if (S >= 239 && !f) {
            c("failed"), w(O instanceof Error ? O.message : String(O));
            return;
          }
        }
        await new Promise((O) => setTimeout(O, 750));
      }
    })(), () => {
      f = !0;
    };
  }, [e, t.agentId, t.chatId, t.projectDirOverride]), r(() => {
    if (d !== "completed" || !y || !s.current) return;
    let f = !1;
    return (async () => {
      var v, E;
      try {
        const h = await Bl();
        if (f || !s.current) return;
        i.current = h.mount(s.current, {
          apiBase: o.getApiUrl("ugsci/visualization"),
          authToken: o.getApiToken() || void 0
        });
        let S;
        for (let O = 0; O < 20 && !f; O += 1)
          try {
            await ((E = (v = i.current).executeCommand) == null ? void 0 : E.call(v, "open", { datasetId: y })), S = void 0;
            break;
          } catch (D) {
            S = D;
            const $ = D instanceof Error ? D.message : String(D);
            if (!$.includes("数据集不存在") && !$.includes("dataset"))
              throw D;
            await new Promise((A) => setTimeout(A, 250));
          }
        if (S && !f) throw S;
      } catch (h) {
        f || (c("failed"), w(h instanceof Error ? h.message : String(h)));
      }
    })(), () => {
      var v;
      f = !0;
      try {
        (v = i.current) == null || v.dispose();
      } catch {
      }
      i.current = null;
    };
  }, [d, y]), n.createElement(
    "div",
    { style: { width: "100%", marginTop: 8 } },
    d === "completed" ? n.createElement("div", {
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
      `${Ra(d)}${m > 0 ? `（${Math.round(m * 100)}%）` : ""}`
    ),
    p ? n.createElement(
      "div",
      { style: { marginTop: 6, color: "#ff7875", fontSize: 12 } },
      `预览状态：${p}`
    ) : null
  );
}
function hd(e) {
  const t = k().React, { useEffect: n, useState: r } = t, { Button: a, Spin: l, Alert: o, Typography: s } = k().antd, { Text: i } = s, d = e.artifact || e.file || {}, c = d.filename || d.title || e.filename || "unknown", m = d.workspacePath || d.path || e.workspacePath, [u, p] = r("idle"), [w, y] = r(null), [g, f] = r(null);
  return n(() => {
    if (!m) return;
    let v = !1;
    return p("submitting"), y(null), f(null), (async () => {
      try {
        const E = k(), h = await jl(E, "/ugsci/visualization/imports/workspace", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...Ul(E, d)
          },
          body: JSON.stringify({
            path: m,
            root: d.workspaceRoot || "project",
            name: c.replace(/\.[^.]+$/, "")
          })
        });
        if (!h.ok) throw new Error(`Import failed: HTTP ${h.status}`);
        const S = await h.json();
        v || (y(S.job_id), p("submitted"));
      } catch (E) {
        v || (f(E instanceof Error ? E.message : String(E)), p("failed"));
      }
    })(), () => {
      v = !0;
    };
  }, [m, c, d.workspaceRoot, d.agentId, d.chatId, d.projectDirOverride]), u === "submitting" ? t.createElement(
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
      description: g,
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
    t.createElement(i, { strong: !0 }, `文件: ${c}`),
    d.size ? t.createElement(i, { type: "secondary" }, `大小: ${(d.size / 1024 / 1024).toFixed(1)} MB`) : null,
    w ? t.createElement(yd, { jobId: w, file: d }) : t.createElement(i, { type: "secondary" }, "正在准备导入任务..."),
    t.createElement(a, {
      type: "primary",
      onClick: () => {
        window.history.pushState({}, "", "/oilgas-visualization"), window.dispatchEvent(new PopStateEvent("popstate"));
      }
    }, "打开油气可视化页面")
  );
}
function Ed(e, t) {
  const n = "__ugsciVisualizationFrontendRegistered", r = window;
  if (r[n]) return;
  r[n] = !0;
  const a = k().antdIcons || {}, l = a.GlobalOutlined || a.AppstoreOutlined;
  e.route.add("ugsci", {
    id: "ugsci.visualization",
    path: "/oilgas-visualization",
    component: gd
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
        component: hd,
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
function bd() {
  var c, m, u, p;
  const e = window.QwenPaw;
  if (!(e != null && e.menu) || !(e != null && e.route)) {
    console.warn(
      "[ugsci] QwenPaw.menu/route API not available — plugin disabled"
    );
    return;
  }
  const t = k().React, n = "ugsci";
  function r() {
    return k().React.createElement(Ps, { embedded: !0 });
  }
  function a() {
    return k().React.useEffect(() => {
      window.history.replaceState({}, "", "/market?tab=ugsci"), window.dispatchEvent(new PopStateEvent("popstate"));
    }, []), null;
  }
  (m = (c = e.chat) == null ? void 0 : c.rightHeader) != null && m.add ? (e.chat.rightHeader.add(n, t.createElement(Os), {
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
    component: Ri
  }), e.menu.add(n, {
    id: "ugsci.experts",
    location: "primary.agentScoped",
    label: () => "专家·协作",
    icon: o ? t.createElement(o, { style: { fontSize: 16 } }) : void 0,
    route: "ugsci.experts",
    order: 5,
    visible: () => Kt()
  }), e.route.add(n, {
    id: "ugsci.genui-settings",
    path: "/ugsci-genui-settings",
    component: ud
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
    component: il
  }), e.menu.add(n, {
    id: "ugsci.tools-skills",
    location: "primary.agentScoped",
    label: () => "工具·技能",
    icon: s ? t.createElement(s, { style: { fontSize: 16 } }) : void 0,
    route: "ugsci.tools-skills",
    order: 6,
    visible: () => Kt()
  }), e.route.add(n, {
    id: "ugsci.capabilities",
    path: "/ugsci-capabilities",
    component: us
  }), e.route.add(n, {
    id: "ugsci.skills-center",
    path: "/ugsci-skills",
    component: ms
  }), e.route.add(n, {
    id: "ugsci.market",
    path: "/ugsci-market",
    component: a
  }), (u = e.marketplace) == null || u.add(n, {
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
      const g = e.menu.snapshot("primary.agentScoped").find((f) => f.id === w);
      g && e.menu.replace(n, w, {
        ...g,
        visible: () => !Kt()
      });
    } catch {
    }
    try {
      const g = e.menu.snapshot("primary.settings").find((f) => f.id === w);
      g && e.menu.replace(n, w, {
        ...g,
        visible: () => !Kt()
      });
    } catch {
    }
  }
  try {
    const y = e.menu.snapshot("primary.agentScoped").find((g) => g.id === "oilgas-vis.page");
    y && e.menu.replace(n, "oilgas-vis.page", {
      ...y,
      visible: () => !1
    });
  } catch {
  }
  dd(e, t), Ed(e, t), console.info(
    "[ugsci] Plugin registered: unified Tools & Skills center + compatibility routes, simple-mode navigation active"
  );
}
function Yn() {
  try {
    bd();
  } catch (e) {
    console.error("[ugsci] Failed to build plugin:", e), setTimeout(Yn, 500);
  }
}
var Da;
if ((Da = window.QwenPaw) != null && Da.host)
  Yn();
else {
  const e = setInterval(() => {
    var t;
    (t = window.QwenPaw) != null && t.host && (clearInterval(e), Yn());
  }, 200);
  setTimeout(() => clearInterval(e), 1e4);
}
function vd(e, t) {
  if (e.match(/^[a-z]+:\/\//i))
    return e;
  if (e.match(/^\/\//))
    return window.location.protocol + e;
  if (e.match(/^[a-z]+:/i))
    return e;
  const n = document.implementation.createHTMLDocument(), r = n.createElement("base"), a = n.createElement("a");
  return n.head.appendChild(r), n.body.appendChild(a), t && (r.href = t), a.href = e, a.href;
}
const wd = /* @__PURE__ */ (() => {
  let e = 0;
  const t = () => (
    // eslint-disable-next-line no-bitwise
    `0000${(Math.random() * 36 ** 4 << 0).toString(36)}`.slice(-4)
  );
  return () => (e += 1, `u${t()}${e}`);
})();
function ot(e) {
  const t = [];
  for (let n = 0, r = e.length; n < r; n++)
    t.push(e[n]);
  return t;
}
let gt = null;
function Nl(e = {}) {
  return gt || (e.includeStyleProperties ? (gt = e.includeStyleProperties, gt) : (gt = ot(window.getComputedStyle(document.documentElement)), gt));
}
function gn(e, t) {
  const r = (e.ownerDocument.defaultView || window).getComputedStyle(e).getPropertyValue(t);
  return r ? parseFloat(r.replace("px", "")) : 0;
}
function Sd(e) {
  const t = gn(e, "border-left-width"), n = gn(e, "border-right-width");
  return e.clientWidth + t + n;
}
function xd(e) {
  const t = gn(e, "border-top-width"), n = gn(e, "border-bottom-width");
  return e.clientHeight + t + n;
}
function Dl(e, t = {}) {
  const n = t.width || Sd(e), r = t.height || xd(e);
  return { width: n, height: r };
}
function kd() {
  let e, t;
  try {
    t = process;
  } catch {
  }
  const n = t && t.env ? t.env.devicePixelRatio : null;
  return n && (e = parseInt(n, 10), Number.isNaN(e) && (e = 1)), e || window.devicePixelRatio || 1;
}
const He = 16384;
function Cd(e) {
  (e.width > He || e.height > He) && (e.width > He && e.height > He ? e.width > e.height ? (e.height *= He / e.width, e.width = He) : (e.width *= He / e.height, e.height = He) : e.width > He ? (e.height *= He / e.width, e.width = He) : (e.width *= He / e.height, e.height = He));
}
function yn(e) {
  return new Promise((t, n) => {
    const r = new Image();
    r.onload = () => {
      r.decode().then(() => {
        requestAnimationFrame(() => t(r));
      });
    }, r.onerror = n, r.crossOrigin = "anonymous", r.decoding = "async", r.src = e;
  });
}
async function Td(e) {
  return Promise.resolve().then(() => new XMLSerializer().serializeToString(e)).then(encodeURIComponent).then((t) => `data:image/svg+xml;charset=utf-8,${t}`);
}
async function _d(e, t, n) {
  const r = "http://www.w3.org/2000/svg", a = document.createElementNS(r, "svg"), l = document.createElementNS(r, "foreignObject");
  return a.setAttribute("width", `${t}`), a.setAttribute("height", `${n}`), a.setAttribute("viewBox", `0 0 ${t} ${n}`), l.setAttribute("width", "100%"), l.setAttribute("height", "100%"), l.setAttribute("x", "0"), l.setAttribute("y", "0"), l.setAttribute("externalResourcesRequired", "true"), a.appendChild(l), l.appendChild(e), Td(a);
}
const Fe = (e, t) => {
  if (e instanceof t)
    return !0;
  const n = Object.getPrototypeOf(e);
  return n === null ? !1 : n.constructor.name === t.name || Fe(n, t);
};
function Id(e) {
  const t = e.getPropertyValue("content");
  return `${e.cssText} content: '${t.replace(/'|"/g, "")}';`;
}
function Ad(e, t) {
  return Nl(t).map((n) => {
    const r = e.getPropertyValue(n), a = e.getPropertyPriority(n);
    return `${n}: ${r}${a ? " !important" : ""};`;
  }).join(" ");
}
function zd(e, t, n, r) {
  const a = `.${e}:${t}`, l = n.cssText ? Id(n) : Ad(n, r);
  return document.createTextNode(`${a}{${l}}`);
}
function Oa(e, t, n, r) {
  const a = window.getComputedStyle(e, n), l = a.getPropertyValue("content");
  if (l === "" || l === "none")
    return;
  const o = wd();
  try {
    t.className = `${t.className} ${o}`;
  } catch {
    return;
  }
  const s = document.createElement("style");
  s.appendChild(zd(o, n, a, r)), t.appendChild(s);
}
function $d(e, t, n) {
  Oa(e, t, ":before", n), Oa(e, t, ":after", n);
}
const Ma = "application/font-woff", La = "image/jpeg", Pd = {
  woff: Ma,
  woff2: Ma,
  ttf: "application/font-truetype",
  eot: "application/vnd.ms-fontobject",
  png: "image/png",
  jpg: La,
  jpeg: La,
  gif: "image/gif",
  tiff: "image/tiff",
  svg: "image/svg+xml",
  webp: "image/webp"
};
function Rd(e) {
  const t = /\.([^./]*?)$/g.exec(e);
  return t ? t[1] : "";
}
function yr(e) {
  const t = Rd(e).toLowerCase();
  return Pd[t] || "";
}
function Od(e) {
  return e.split(/,/)[1];
}
function Qn(e) {
  return e.search(/^(data:)/) !== -1;
}
function Md(e, t) {
  return `data:${t};base64,${e}`;
}
async function Fl(e, t, n) {
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
const Un = {};
function Ld(e, t, n) {
  let r = e.replace(/\?.*/, "");
  return n && (r = e), /ttf|otf|eot|woff2?/i.test(r) && (r = r.replace(/.*\//, "")), t ? `[${t}]${r}` : r;
}
async function hr(e, t, n) {
  const r = Ld(e, t, n.includeQueryParams);
  if (Un[r] != null)
    return Un[r];
  n.cacheBust && (e += (/\?/.test(e) ? "&" : "?") + (/* @__PURE__ */ new Date()).getTime());
  let a;
  try {
    const l = await Fl(e, n.fetchRequestInit, ({ res: o, result: s }) => (t || (t = o.headers.get("Content-Type") || ""), Od(s)));
    a = Md(l, t);
  } catch (l) {
    a = n.imagePlaceholder || "";
    let o = `Failed to fetch resource: ${e}`;
    l && (o = typeof l == "string" ? l : l.message), o && console.warn(o);
  }
  return Un[r] = a, a;
}
async function Bd(e) {
  const t = e.toDataURL();
  return t === "data:," ? e.cloneNode(!1) : yn(t);
}
async function Ud(e, t) {
  if (e.currentSrc) {
    const l = document.createElement("canvas"), o = l.getContext("2d");
    l.width = e.clientWidth, l.height = e.clientHeight, o == null || o.drawImage(e, 0, 0, l.width, l.height);
    const s = l.toDataURL();
    return yn(s);
  }
  const n = e.poster, r = yr(n), a = await hr(n, r, t);
  return yn(a);
}
async function jd(e, t) {
  var n;
  try {
    if (!((n = e == null ? void 0 : e.contentDocument) === null || n === void 0) && n.body)
      return await kn(e.contentDocument.body, t, !0);
  } catch {
  }
  return e.cloneNode(!1);
}
async function Nd(e, t) {
  return Fe(e, HTMLCanvasElement) ? Bd(e) : Fe(e, HTMLVideoElement) ? Ud(e, t) : Fe(e, HTMLIFrameElement) ? jd(e, t) : e.cloneNode(Gl(e));
}
const Dd = (e) => e.tagName != null && e.tagName.toUpperCase() === "SLOT", Gl = (e) => e.tagName != null && e.tagName.toUpperCase() === "SVG";
async function Fd(e, t, n) {
  var r, a;
  if (Gl(t))
    return t;
  let l = [];
  return Dd(e) && e.assignedNodes ? l = ot(e.assignedNodes()) : Fe(e, HTMLIFrameElement) && (!((r = e.contentDocument) === null || r === void 0) && r.body) ? l = ot(e.contentDocument.body.childNodes) : l = ot(((a = e.shadowRoot) !== null && a !== void 0 ? a : e).childNodes), l.length === 0 || Fe(e, HTMLVideoElement) || await l.reduce((o, s) => o.then(() => kn(s, n)).then((i) => {
    i && t.appendChild(i);
  }), Promise.resolve()), t;
}
function Gd(e, t, n) {
  const r = t.style;
  if (!r)
    return;
  const a = window.getComputedStyle(e);
  a.cssText ? (r.cssText = a.cssText, r.transformOrigin = a.transformOrigin) : Nl(n).forEach((l) => {
    let o = a.getPropertyValue(l);
    l === "font-size" && o.endsWith("px") && (o = `${Math.floor(parseFloat(o.substring(0, o.length - 2))) - 0.1}px`), Fe(e, HTMLIFrameElement) && l === "display" && o === "inline" && (o = "block"), l === "d" && t.getAttribute("d") && (o = `path(${t.getAttribute("d")})`), r.setProperty(l, o, a.getPropertyPriority(l));
  });
}
function Hd(e, t) {
  Fe(e, HTMLTextAreaElement) && (t.innerHTML = e.value), Fe(e, HTMLInputElement) && t.setAttribute("value", e.value);
}
function Wd(e, t) {
  if (Fe(e, HTMLSelectElement)) {
    const n = t, r = Array.from(n.children).find((a) => e.value === a.getAttribute("value"));
    r && r.setAttribute("selected", "");
  }
}
function Vd(e, t, n) {
  return Fe(t, Element) && (Gd(e, t, n), $d(e, t, n), Hd(e, t), Wd(e, t)), t;
}
async function qd(e, t) {
  const n = e.querySelectorAll ? e.querySelectorAll("use") : [];
  if (n.length === 0)
    return e;
  const r = {};
  for (let l = 0; l < n.length; l++) {
    const s = n[l].getAttribute("xlink:href");
    if (s) {
      const i = e.querySelector(s), d = document.querySelector(s);
      !i && d && !r[s] && (r[s] = await kn(d, t, !0));
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
async function kn(e, t, n) {
  return !n && t.filter && !t.filter(e) ? null : Promise.resolve(e).then((r) => Nd(r, t)).then((r) => Fd(e, r, t)).then((r) => Vd(e, r, t)).then((r) => qd(r, t));
}
const Hl = /url\((['"]?)([^'"]+?)\1\)/g, Jd = /url\([^)]+\)\s*format\((["']?)([^"']+)\1\)/g, Kd = /src:\s*(?:url\([^)]+\)\s*format\([^)]+\)[,;]\s*)+/g;
function Xd(e) {
  const t = e.replace(/([.*+?^${}()|\[\]\/\\])/g, "\\$1");
  return new RegExp(`(url\\(['"]?)(${t})(['"]?\\))`, "g");
}
function Yd(e) {
  const t = [];
  return e.replace(Hl, (n, r, a) => (t.push(a), n)), t.filter((n) => !Qn(n));
}
async function Qd(e, t, n, r, a) {
  try {
    const l = n ? vd(t, n) : t, o = yr(t);
    let s;
    return a || (s = await hr(l, o, r)), e.replace(Xd(t), `$1${s}$3`);
  } catch {
  }
  return e;
}
function Zd(e, { preferredFontFormat: t }) {
  return t ? e.replace(Kd, (n) => {
    for (; ; ) {
      const [r, , a] = Jd.exec(n) || [];
      if (!a)
        return "";
      if (a === t)
        return `src: ${r};`;
    }
  }) : e;
}
function Wl(e) {
  return e.search(Hl) !== -1;
}
async function Vl(e, t, n) {
  if (!Wl(e))
    return e;
  const r = Zd(e, n);
  return Yd(r).reduce((l, o) => l.then((s) => Qd(s, o, t, n)), Promise.resolve(r));
}
async function yt(e, t, n) {
  var r;
  const a = (r = t.style) === null || r === void 0 ? void 0 : r.getPropertyValue(e);
  if (a) {
    const l = await Vl(a, null, n);
    return t.style.setProperty(e, l, t.style.getPropertyPriority(e)), !0;
  }
  return !1;
}
async function eu(e, t) {
  await yt("background", e, t) || await yt("background-image", e, t), await yt("mask", e, t) || await yt("-webkit-mask", e, t) || await yt("mask-image", e, t) || await yt("-webkit-mask-image", e, t);
}
async function tu(e, t) {
  const n = Fe(e, HTMLImageElement);
  if (!(n && !Qn(e.src)) && !(Fe(e, SVGImageElement) && !Qn(e.href.baseVal)))
    return;
  const r = n ? e.src : e.href.baseVal, a = await hr(r, yr(r), t);
  await new Promise((l, o) => {
    e.onload = l, e.onerror = t.onImageErrorHandler ? (...i) => {
      try {
        l(t.onImageErrorHandler(...i));
      } catch (d) {
        o(d);
      }
    } : o;
    const s = e;
    s.decode && (s.decode = l), s.loading === "lazy" && (s.loading = "eager"), n ? (e.srcset = "", e.src = a) : e.href.baseVal = a;
  });
}
async function nu(e, t) {
  const r = ot(e.childNodes).map((a) => ql(a, t));
  await Promise.all(r).then(() => e);
}
async function ql(e, t) {
  Fe(e, Element) && (await eu(e, t), await tu(e, t), await nu(e, t));
}
function ru(e, t) {
  const { style: n } = e;
  t.backgroundColor && (n.backgroundColor = t.backgroundColor), t.width && (n.width = `${t.width}px`), t.height && (n.height = `${t.height}px`);
  const r = t.style;
  return r != null && Object.keys(r).forEach((a) => {
    n[a] = r[a];
  }), e;
}
const Ba = {};
async function Ua(e) {
  let t = Ba[e];
  if (t != null)
    return t;
  const r = await (await fetch(e)).text();
  return t = { url: e, cssText: r }, Ba[e] = t, t;
}
async function ja(e, t) {
  let n = e.cssText;
  const r = /url\(["']?([^"')]+)["']?\)/g, l = (n.match(/url\([^)]+\)/g) || []).map(async (o) => {
    let s = o.replace(r, "$1");
    return s.startsWith("https://") || (s = new URL(s, e.url).href), Fl(s, t.fetchRequestInit, ({ result: i }) => (n = n.replace(o, `url(${i})`), [o, i]));
  });
  return Promise.all(l).then(() => n);
}
function Na(e) {
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
async function au(e, t) {
  const n = [], r = [];
  return e.forEach((a) => {
    if ("cssRules" in a)
      try {
        ot(a.cssRules || []).forEach((l, o) => {
          if (l.type === CSSRule.IMPORT_RULE) {
            let s = o + 1;
            const i = l.href, d = Ua(i).then((c) => ja(c, t)).then((c) => Na(c).forEach((m) => {
              try {
                a.insertRule(m, m.startsWith("@import") ? s += 1 : a.cssRules.length);
              } catch (u) {
                console.error("Error inserting rule from remote css", {
                  rule: m,
                  error: u
                });
              }
            })).catch((c) => {
              console.error("Error loading remote css", c.toString());
            });
            r.push(d);
          }
        });
      } catch (l) {
        const o = e.find((s) => s.href == null) || document.styleSheets[0];
        a.href != null && r.push(Ua(a.href).then((s) => ja(s, t)).then((s) => Na(s).forEach((i) => {
          o.insertRule(i, o.cssRules.length);
        })).catch((s) => {
          console.error("Error loading remote stylesheet", s);
        })), console.error("Error inlining remote css file", l);
      }
  }), Promise.all(r).then(() => (e.forEach((a) => {
    if ("cssRules" in a)
      try {
        ot(a.cssRules || []).forEach((l) => {
          n.push(l);
        });
      } catch (l) {
        console.error(`Error while reading CSS rules from ${a.href}`, l);
      }
  }), n));
}
function lu(e) {
  return e.filter((t) => t.type === CSSRule.FONT_FACE_RULE).filter((t) => Wl(t.style.getPropertyValue("src")));
}
async function ou(e, t) {
  if (e.ownerDocument == null)
    throw new Error("Provided element is not within a Document");
  const n = ot(e.ownerDocument.styleSheets), r = await au(n, t);
  return lu(r);
}
function Jl(e) {
  return e.trim().replace(/["']/g, "");
}
function iu(e) {
  const t = /* @__PURE__ */ new Set();
  function n(r) {
    (r.style.fontFamily || getComputedStyle(r).fontFamily).split(",").forEach((l) => {
      t.add(Jl(l));
    }), Array.from(r.children).forEach((l) => {
      l instanceof HTMLElement && n(l);
    });
  }
  return n(e), t;
}
async function su(e, t) {
  const n = await ou(e, t), r = iu(e);
  return (await Promise.all(n.filter((l) => r.has(Jl(l.style.fontFamily))).map((l) => {
    const o = l.parentStyleSheet ? l.parentStyleSheet.href : null;
    return Vl(l.cssText, o, t);
  }))).join(`
`);
}
async function cu(e, t) {
  const n = t.fontEmbedCSS != null ? t.fontEmbedCSS : t.skipFonts ? null : await su(e, t);
  if (n) {
    const r = document.createElement("style"), a = document.createTextNode(n);
    r.appendChild(a), e.firstChild ? e.insertBefore(r, e.firstChild) : e.appendChild(r);
  }
}
async function Kl(e, t = {}) {
  const { width: n, height: r } = Dl(e, t), a = await kn(e, t, !0);
  return await cu(a, t), await ql(a, t), ru(a, t), await _d(a, n, r);
}
async function Xl(e, t = {}) {
  const { width: n, height: r } = Dl(e, t), a = await Kl(e, t), l = await yn(a), o = document.createElement("canvas"), s = o.getContext("2d"), i = t.pixelRatio || kd(), d = t.canvasWidth || n, c = t.canvasHeight || r;
  return o.width = d * i, o.height = c * i, t.skipAutoScale || Cd(o), o.style.width = `${d}`, o.style.height = `${c}`, t.backgroundColor && (s.fillStyle = t.backgroundColor, s.fillRect(0, 0, o.width, o.height)), s.drawImage(l, 0, 0, o.width, o.height), o;
}
async function du(e, t = {}) {
  return (await Xl(e, t)).toDataURL();
}
const uu = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  toCanvas: Xl,
  toPng: du,
  toSvg: Kl
}, Symbol.toStringTag, { value: "Module" }));
