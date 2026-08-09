function $() {
  var t;
  const e = (t = window.QwenPaw) == null ? void 0 : t.host;
  if (!e) throw new Error("[ugsci] QwenPaw.host not available");
  return e;
}
function El() {
  try {
    return $().getApiToken() || "";
  } catch {
    return "";
  }
}
function Gt(e) {
  return $().getApiUrl(e);
}
function vl(e) {
  const t = El();
  return {
    "Content-Type": "application/json",
    ...t ? { Authorization: `Bearer ${t}` } : {},
    ...e
  };
}
function bl(e) {
  const t = new Headers(e), a = {};
  return t.forEach((n, l) => {
    a[l] = n;
  }), a;
}
function Ve(e, t) {
  const a = $(), n = bl(t == null ? void 0 : t.headers);
  return a.fetch ? a.fetch(e, { ...t, headers: n }) : fetch(a.getApiUrl(e), {
    ...t,
    headers: { ...vl(), ...n }
  });
}
const bt = /* @__PURE__ */ new Map(), wl = 15e3;
function Sl(e) {
  return e ? e instanceof Headers ? e.get("X-Agent-Id") || e.get("x-agent-id") || "" : e["X-Agent-Id"] || e["x-agent-id"] || "" : "";
}
function xl(e, t, a) {
  return `${e}:${t}:${a}`;
}
function wt() {
  bt.clear();
}
function gn(e) {
  for (const [t, a] of bt)
    (e ? a.agentId === e : a.agentId) && bt.delete(t);
}
async function se(e, t) {
  const a = ((t == null ? void 0 : t.method) || "GET").toUpperCase(), { bypassCache: n, ...l } = t || {}, r = Sl(
    l.headers
  ), o = xl(a, e, r);
  if (a !== "GET" && (r ? gn(r) : wt()), a === "GET" && !n) {
    const d = bt.get(o);
    if (d && Date.now() - d.ts < wl)
      return d.data;
  }
  const i = await Ve(e, l);
  if (!i.ok) {
    const d = await i.text().catch(() => "");
    throw new Error(d || `HTTP ${i.status}`);
  }
  if (i.status === 204) return null;
  const s = await i.json();
  return a === "GET" && bt.set(o, {
    data: s,
    ts: Date.now(),
    agentId: r || void 0
  }), s;
}
const je = {
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
function Ft(e, t) {
  const a = $();
  return a.ReactMarkdown && a.remarkGfm ? t.createElement(
    a.ReactMarkdown,
    { remarkPlugins: [a.remarkGfm] },
    e
  ) : e.replace(/\*\*(.+?)\*\*/g, "$1").replace(/\*(.+?)\*/g, "$1").replace(/`(.+?)`/g, "$1").replace(/^#+\s*/gm, "").replace(/^[-*]\s+/gm, "• ");
}
function Wt({
  title: e,
  subtitle: t,
  extra: a
}) {
  const n = $().React, { Space: l } = $().antd;
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
    a ? n.createElement(l, null, a) : null
  );
}
async function Ht() {
  const e = await se("/agents");
  return (e == null ? void 0 : e.agents) || [];
}
async function fn(e) {
  return se(
    `/agents/${encodeURIComponent(e)}`
  );
}
async function Jt(e) {
  return await se(
    `/agents/${encodeURIComponent(e)}/skills`
  ) || [];
}
async function qt(e = !1) {
  return await se(`/skills/pool${e ? "?summary=true" : ""}`) || [];
}
async function kl(e) {
  const t = await se(
    `/skills/pool/${encodeURIComponent(e)}/content`
  );
  return (t == null ? void 0 : t.content) || "";
}
async function Cl() {
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
function ka(e) {
  var a;
  const t = [];
  for (const n of e) {
    if (n.enabled === !1) continue;
    const l = (a = n.description) == null ? void 0 : a.trim();
    if (!l) continue;
    const r = (n.name || l).length > 20 ? (n.name || l).substring(0, 18) + "…" : n.name || l;
    let o = l;
    if (o = o.replace(/\*\*(.+?)\*\*/g, "$1").replace(/\*(.+?)\*/g, "$1").replace(/`(.+?)`/g, "$1").replace(/^#+\s*/gm, "").trim(), /^(用于|帮助|提供|支持|实现|完成|分析|计算|生成|创建|检查)/.test(o) ? o = `请${o}` : /^(a |an |the )/i.test(o) ? o = `Help me with ${o}` : /[。？！.?!]$/.test(o) || (o = `帮我${o}`), o.length > 80 && (o = o.substring(0, 77) + "..."), t.push({ label: r, value: o }), t.length >= 4) break;
  }
  return t;
}
async function Tl(e) {
  return await se("/workspace/files", {
    headers: { "X-Agent-Id": e }
  }) || [];
}
async function Lt(e, t, a) {
  return se(`/workspace/files/${encodeURIComponent(t)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify({ content: a })
  });
}
async function _l(e, t, a, n) {
  return se("/workspace/prompt-files", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify({ filename: t, content: a, enable: n })
  });
}
const Il = /* @__PURE__ */ new Set([
  "CON",
  "PRN",
  "AUX",
  "NUL",
  ...Array.from({ length: 9 }, (e, t) => `COM${t + 1}`),
  ...Array.from({ length: 9 }, (e, t) => `LPT${t + 1}`)
]);
function zl(e) {
  let t = e.trim();
  if (!t) throw new Error("请输入文件名");
  if (/[\\/]/.test(t)) throw new Error("文件名不能包含路径分隔符");
  if (/[<>:\"|?*\u0000-\u001f]/.test(t))
    throw new Error("文件名包含系统不支持的字符");
  if (/[ .]$/.test(t)) throw new Error("文件名不能以空格或句点结尾");
  t.toLowerCase().endsWith(".md") ? t = `${t.slice(0, -3)}.md` : t += ".md";
  const a = t.split(".", 1)[0].toUpperCase();
  if (!t.slice(0, -3)) throw new Error("文件名不能为空");
  if (Il.has(a))
    throw new Error("该文件名是系统保留名称，请更换");
  if (new TextEncoder().encode(t).length > 255)
    throw new Error("文件名过长");
  return t;
}
async function Al(e, t) {
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
async function Ca(e, t) {
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
async function $l(e, t) {
  return se(dt(e, "/batch-enable"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(t)
  });
}
async function Pl(e, t) {
  return se(dt(e, "/batch-disable"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(t)
  });
}
async function Ol(e, t) {
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
async function Ta(e, t) {
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
async function Ml(e, t) {
  return se(
    `/mcp/toggle/${encodeURIComponent(t)}`,
    {
      method: "PATCH",
      headers: { "X-Agent-Id": e }
    }
  );
}
async function _a(e, t) {
  await se(
    dt(e, `/${encodeURIComponent(t)}/disable`),
    {
      method: "POST"
    }
  );
}
async function Ll(e) {
  await se(`/skills/pool/${encodeURIComponent(e)}`, {
    method: "DELETE"
  });
}
function Rl(e) {
  const t = (e || "").trim();
  if (!t) return { number: 6, unit: "h" };
  const a = t.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/i);
  if (!a) return { number: 6, unit: "h" };
  const n = parseInt(a[1] || "0", 10), l = parseInt(a[2] || "0", 10), r = parseInt(a[3] || "0", 10), o = n * 60 + l + Math.round(r / 60);
  return o <= 0 ? { number: 6, unit: "h" } : o >= 60 && o % 60 === 0 ? { number: o / 60, unit: "h" } : { number: o, unit: "m" };
}
function Bl(e) {
  return e.unit === "h" ? `${e.number}h` : `${e.number}m`;
}
async function Ul(e) {
  return se("/config/heartbeat", {
    headers: { "X-Agent-Id": e }
  });
}
async function jl(e, t) {
  return se("/config/heartbeat", {
    method: "PUT",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify(t)
  });
}
async function Nl(e) {
  await se("/config/heartbeat/run", {
    method: "POST",
    headers: { "X-Agent-Id": e }
  });
}
async function Dl(e) {
  return se("/workspace/running-config", {
    headers: { "X-Agent-Id": e }
  });
}
async function Gl(e, t) {
  return se("/workspace/running-config", {
    method: "PUT",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify(t)
  });
}
async function Fl(e) {
  return (await se("/workspace/language", {
    headers: { "X-Agent-Id": e }
  })).language || "zh";
}
async function Wl(e, t) {
  await se("/workspace/language", {
    method: "PUT",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify({ language: t })
  });
}
async function Hl() {
  return (await se("/config/user-timezone")).timezone || "UTC";
}
async function Jl(e) {
  await se("/config/user-timezone", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ timezone: e })
  });
}
async function ql(e) {
  return await se("/workspace/system-prompt-files", {
    headers: { "X-Agent-Id": e }
  }) || [];
}
const Qn = ["AGENTS.md", "SOUL.md", "PROFILE.md"];
function Yn({
  items: e,
  max: t = 5,
  color: a = "blue",
  emptyText: n = "无"
}) {
  const l = $().React, { Tag: r } = $().antd;
  return !e || e.length === 0 ? l.createElement(
    "span",
    { style: { fontSize: 12, color: "var(--ant-color-text-quaternary, #bfbfbf)" } },
    n
  ) : l.createElement(
    "div",
    { style: { display: "flex", flexWrap: "wrap", gap: 4 } },
    ...e.slice(0, t).map(
      (o, i) => l.createElement(
        r,
        { key: i, color: a, style: { fontSize: 11, marginRight: 0 } },
        o
      )
    ),
    e.length > t ? l.createElement(
      r,
      { style: { fontSize: 11, marginRight: 0 } },
      `+${e.length - t}`
    ) : null
  );
}
function Ia({
  open: e,
  onClose: t,
  poolSkills: a,
  installedSkillNames: n,
  loading: l,
  onInstall: r
}) {
  const o = $().React, { useState: i, useEffect: s, useMemo: d } = o, { Modal: g, Button: f, Empty: c, Spin: m, Input: u, Tag: y, Tooltip: h, Typography: x } = $().antd, { CheckOutlined: T, SearchOutlined: k } = $().antdIcons || {}, { Text: M } = x, [N, H] = i([]), [X, j] = i("");
  s(() => {
    e && (H([]), j(""));
  }, [e]);
  const R = d(() => {
    if (!X.trim()) return a;
    const b = X.toLowerCase();
    return a.filter(
      (v) => {
        var I, C;
        return v.name.toLowerCase().includes(b) || ((I = v.description) == null ? void 0 : I.toLowerCase().includes(b)) || ((C = v.tags) == null ? void 0 : C.some((B) => B.toLowerCase().includes(b)));
      }
    );
  }, [a, X]), W = R.filter(
    (b) => !n.includes(b.name)
  ), Q = (b) => {
    H(
      (v) => v.includes(b) ? v.filter((I) => I !== b) : [...v, b]
    );
  }, P = async () => {
    N.length !== 0 && (await r(N), H([]));
  };
  return o.createElement(
    g,
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
          M,
          { type: "secondary", style: { fontSize: 13 } },
          `已选择 ${N.length} 个技能`
        ),
        o.createElement(
          "div",
          { style: { display: "flex", gap: 8 } },
          o.createElement(f, { onClick: t }, "取消"),
          o.createElement(
            f,
            {
              type: "primary",
              onClick: P,
              disabled: N.length === 0
            },
            N.length > 0 ? `添加 (${N.length})` : "添加"
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
      o.createElement(u, {
        placeholder: "搜索技能名称、描述或标签...",
        prefix: k ? o.createElement(k) : void 0,
        value: X,
        onChange: (b) => j(b.target.value),
        allowClear: !0,
        style: { flex: 1 }
      }),
      o.createElement(
        f,
        {
          size: "small",
          type: "primary",
          onClick: () => H(W.map((b) => b.name))
        },
        "全选"
      ),
      o.createElement(
        f,
        {
          size: "small",
          onClick: () => H([])
        },
        "清空"
      )
    ),
    // Skill grid (card style matching Skill Center)
    l ? o.createElement(
      "div",
      { style: { textAlign: "center", padding: 40 } },
      o.createElement(m, { size: "large" })
    ) : R.length === 0 ? o.createElement(c, {
      description: X ? "未找到匹配的技能" : "技能池暂无可用技能",
      image: c.PRESENTED_IMAGE_SIMPLE
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
      ...R.map((b) => {
        const v = N.includes(b.name), I = n.includes(b.name);
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
            T ? o.createElement(T) : "✓"
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
                M,
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
              (C, B) => o.createElement(
                y,
                {
                  key: B,
                  color: "cyan",
                  style: { fontSize: 10, marginRight: 0 }
                },
                C
              )
            )
          ) : null
        );
      })
    )
  );
}
function za({
  agentId: e,
  systemPromptFiles: t,
  onRefresh: a
}) {
  const n = $().React, { useState: l, useEffect: r, useCallback: o, useRef: i } = n, {
    List: s,
    Tag: d,
    Switch: g,
    Button: f,
    Modal: c,
    Input: m,
    Spin: u,
    Empty: y,
    message: h,
    Typography: x,
    Segmented: T,
    Alert: k
  } = $().antd, { FileTextOutlined: M, PlusOutlined: N, EditOutlined: H, ReloadOutlined: X } = $().antdIcons || {}, { Text: j } = x, [R, W] = l([]), [Q, P] = l(!0), [b, v] = l(
    t || []
  ), [I, C] = l(!1), [B, D] = l(null), [L, z] = l(""), [E, ee] = l(""), [J, _] = l(!1), [q, re] = l("source"), Y = i(0), K = o(async () => {
    const ie = ++Y.current;
    P(!0);
    try {
      const le = await Tl(e);
      ie === Y.current && W(le);
    } catch (le) {
      ie === Y.current && (h.error(le.message || "加载工作区文档失败"), W([]));
    } finally {
      ie === Y.current && P(!1);
    }
  }, [e]);
  r(() => {
    K();
  }, [K]), r(() => {
    v(t || []);
  }, [t]);
  const ce = async (ie, le) => {
    const ye = new Set(b);
    if (le)
      ye.add(ie);
    else {
      if (Qn.includes(ie) && ie === "AGENTS.md") {
        h.warning("AGENTS.md 是核心文件，不能停用");
        return;
      }
      ye.delete(ie);
    }
    const Ee = Array.from(ye);
    v(Ee);
    try {
      await Al(e, Ee), h.success(le ? "已启用记忆文件" : "已停用记忆文件"), a();
    } catch (Ce) {
      h.error(Ce.message || "更新失败"), v(t || []);
    }
  }, O = async (ie) => {
    try {
      const le = await se(
        `/workspace/files/${encodeURIComponent(ie)}`,
        { headers: { "X-Agent-Id": e } }
      );
      D(ie), z(le.content || ""), re("source"), C(!0);
    } catch (le) {
      h.error(le.message || "读取文件失败");
    }
  }, oe = () => {
    D(null), z(""), ee(""), re("source"), C(!0);
  }, pe = async () => {
    let ie;
    try {
      ie = zl(B || E);
    } catch (le) {
      h.warning(le.message || "文件名无效");
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
    _(!0);
    try {
      if (B)
        await Lt(e, ie, L);
      else {
        const le = await _l(
          e,
          ie,
          L,
          !0
        );
        v(le.system_prompt_files);
      }
      h.success("保存成功"), C(!1), K(), a();
    } catch (le) {
      const ye = le != null && le.message ? `：${le.message}` : "";
      h.error(
        B ? (le == null ? void 0 : le.message) || "保存失败" : `创建并挂载失败，服务端已回滚文件${ye}`
      );
    } finally {
      _(!1);
    }
  };
  return Q ? n.createElement(
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
      n.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        M ? n.createElement(M, {
          style: { fontSize: 14, color: "#1677ff" }
        }) : null,
        n.createElement(
          j,
          { strong: !0 },
          `工作区文档 (${R.length})`
        ),
        n.createElement(
          j,
          { type: "secondary", style: { fontSize: 12 } },
          `· ${b.length} 个已挂载到系统提示`
        )
      ),
      n.createElement(
        "div",
        { style: { display: "flex", gap: 8 } },
        n.createElement(
          f,
          {
            size: "small",
            icon: X ? n.createElement(X) : void 0,
            onClick: K
          },
          "刷新"
        ),
        n.createElement(
          f,
          {
            type: "primary",
            size: "small",
            icon: N ? n.createElement(N) : void 0,
            onClick: oe
          },
          "新建 Markdown 文档"
        )
      )
    ),
    R.length === 0 ? n.createElement(y, {
      description: "暂无 Markdown 文档，点击「新建 Markdown 文档」添加",
      image: y.PRESENTED_IMAGE_SIMPLE
    }) : n.createElement(s, {
      dataSource: R,
      renderItem: (ie) => {
        const le = b.includes(ie.filename), ye = Qn.includes(ie.filename);
        return n.createElement(
          s.Item,
          {
            actions: [
              n.createElement(
                f,
                {
                  type: "link",
                  size: "small",
                  icon: H ? n.createElement(H) : void 0,
                  onClick: () => O(ie.filename)
                },
                "编辑"
              )
            ]
          },
          n.createElement(s.Item.Meta, {
            avatar: n.createElement(M, {
              style: {
                fontSize: 20,
                color: le ? "#1677ff" : "var(--ant-color-text-quaternary, #bfbfbf)"
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
              n.createElement(j, null, ie.filename),
              ye ? n.createElement(
                d,
                { color: "default", style: { fontSize: 10 } },
                "内置"
              ) : n.createElement(
                d,
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
          n.createElement(g, {
            checked: le,
            size: "small",
            onChange: (Ee) => ce(ie.filename, Ee)
          })
        );
      }
    }),
    // Edit/New file modal
    n.createElement(
      c,
      {
        open: I,
        onCancel: () => C(!1),
        title: B ? `编辑 ${B}` : "新建 Markdown 文档",
        width: 700,
        onOk: pe,
        confirmLoading: J,
        okText: "保存"
      },
      B ? null : n.createElement(
        "div",
        { style: { marginBottom: 12 } },
        n.createElement(m, {
          placeholder: "文件名（如：油藏工程记忆库.md）",
          value: E,
          onChange: (ie) => ee(ie.target.value),
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
        n.createElement(T, {
          size: "small",
          value: q,
          options: [
            { label: "源码", value: "source" },
            { label: "预览", value: "preview" }
          ],
          onChange: (ie) => re(ie)
        }),
        n.createElement(
          j,
          { type: "secondary", style: { fontSize: 12 } },
          `${L.length} 字符 · 约 ${Math.ceil(L.length / 4)} tokens · ${B && b.includes(B) ? "已挂载" : B ? "未挂载" : "保存后自动挂载"}`
        )
      ),
      L.trim() ? null : n.createElement(k, {
        type: "warning",
        showIcon: !0,
        message: "文档内容为空，保存前需要填写 Markdown 内容",
        style: { marginBottom: 10 }
      }),
      q === "source" ? n.createElement(m.TextArea, {
        value: L,
        onChange: (ie) => z(ie.target.value),
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
        Ft(L, n)
      )
    )
  );
}
function Kl({
  skills: e,
  agentId: t
}) {
  const a = $().React, { useMemo: n } = a, {
    List: l,
    Tag: r,
    Typography: o,
    Empty: i,
    Button: s,
    message: d
  } = $().antd, { ThunderboltOutlined: g, CopyOutlined: f } = $().antdIcons || {}, { Text: c } = o, m = n(() => ka(e), [e]), u = (h) => {
    try {
      const x = $();
      x.setSelectedAgent && x.setSelectedAgent(t);
    } catch {
    }
    try {
      sessionStorage.setItem("ugsci_pending_prompt", h.value);
    } catch {
    }
    window.history.pushState({}, "", "/chat"), window.dispatchEvent(new PopStateEvent("popstate"));
  }, y = (h) => {
    var x;
    (x = navigator.clipboard) == null || x.writeText(h.value).then(() => {
      d.success("已复制到剪贴板");
    });
  };
  return m.length === 0 ? a.createElement(i, {
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
      g ? a.createElement(g, {
        style: { fontSize: 14, color: "#1677ff" }
      }) : null,
      a.createElement(
        c,
        { strong: !0 },
        `推荐提问 (${m.length})`
      ),
      a.createElement(
        c,
        { type: "secondary", style: { fontSize: 12 } },
        "· 从技能描述中自动提取"
      )
    ),
    a.createElement(l, {
      dataSource: m,
      renderItem: (h, x) => a.createElement(
        l.Item,
        {
          actions: [
            a.createElement(
              s,
              {
                type: "link",
                size: "small",
                icon: f ? a.createElement(f) : void 0,
                onClick: () => y(h)
              },
              "复制"
            )
          ]
        },
        a.createElement(l.Item.Meta, {
          avatar: a.createElement(
            r,
            { color: "blue", style: { borderRadius: "50%" } },
            `${x + 1}`
          ),
          title: a.createElement(
            "div",
            {
              style: {
                cursor: "pointer",
                color: "#1677ff"
              },
              onClick: () => u(h)
            },
            h.value
          ),
          description: a.createElement(
            c,
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
}, Aa = { marginBottom: 16 }, $a = {
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
}, Pa = {
  fontSize: 12,
  color: "rgba(0,0,0,0.45)",
  marginLeft: 8
};
function Vl({ agentId: e }) {
  const t = $().React, { useState: a, useEffect: n, useCallback: l } = t, {
    Switch: r,
    InputNumber: o,
    Select: i,
    Button: s,
    Spin: d,
    Space: g,
    Typography: f,
    message: c
  } = $().antd, { PlayCircleOutlined: m, SaveOutlined: u } = $().antdIcons || {}, { Text: y } = f, [h, x] = a(!0), [T, k] = a(!1), [M, N] = a(!1), [H, X] = a(!1), [j, R] = a(6), [W, Q] = a("h"), [P, b] = a("main"), [v, I] = a(300), [C, B] = a(!1), [D, L] = a("08:00"), [z, E] = a("22:00"), ee = l(async () => {
    var K, ce;
    x(!0);
    try {
      const O = await Ul(e), oe = Rl(O.every ?? "6h");
      X(O.enabled ?? !1), R(oe.number), Q(oe.unit), b(O.target ?? "main"), I(O.timeoutSeconds ?? 300), B(!!O.activeHours), L(((K = O.activeHours) == null ? void 0 : K.start) ?? "08:00"), E(((ce = O.activeHours) == null ? void 0 : ce.end) ?? "22:00");
    } catch (O) {
      c.error(O.message || "加载心跳配置失败");
    } finally {
      x(!1);
    }
  }, [e]);
  n(() => {
    ee();
  }, [ee]);
  const J = async () => {
    k(!0);
    try {
      await jl(e, {
        enabled: H,
        every: Bl({ number: j, unit: W }),
        target: P,
        timeoutSeconds: v,
        activeHours: C && D && z ? { start: D, end: z } : void 0
      }), c.success("心跳配置已保存");
    } catch (K) {
      c.error(K.message || "保存心跳配置失败");
    } finally {
      k(!1);
    }
  }, _ = async () => {
    N(!0);
    try {
      await Nl(e), c.success("已触发心跳检查");
    } catch (K) {
      c.error(K.message || "触发心跳失败");
    } finally {
      N(!1);
    }
  };
  if (h)
    return t.createElement(
      "div",
      { style: { textAlign: "center", padding: 40 } },
      t.createElement(d, { size: "large" })
    );
  const q = (K, ce, O) => t.createElement(
    "div",
    { style: Aa },
    t.createElement("div", { style: ot }, K),
    ce,
    O ? t.createElement(
      y,
      { type: "secondary", style: Pa },
      O
    ) : null
  ), re = (K, ce, O, oe) => t.createElement(
    "div",
    { style: $a },
    t.createElement(
      "div",
      null,
      t.createElement("div", { style: ot }, K),
      ce
    ),
    t.createElement(
      "div",
      null,
      t.createElement("div", { style: ot }, O),
      oe
    )
  ), { Divider: Y } = $().antd;
  return t.createElement(
    "div",
    { style: { paddingBottom: 8 } },
    // ── Section: 基本设置 ──
    t.createElement("div", { style: Ye }, "基本设置"),
    q(
      "启用心跳",
      t.createElement(r, {
        checked: H,
        onChange: (K) => X(K)
      }),
      H ? "已启用，专家将定期自检" : "已停用"
    ),
    re(
      "检查频率",
      t.createElement(
        g,
        null,
        t.createElement(o, {
          min: 1,
          value: j,
          onChange: (K) => R(K ?? 1),
          style: { width: "100%" }
        }),
        t.createElement(i, {
          value: W,
          onChange: (K) => Q(K),
          style: { width: 90 },
          options: [
            { value: "m", label: "分钟" },
            { value: "h", label: "小时" }
          ]
        })
      ),
      "心跳目标",
      t.createElement(i, {
        value: P,
        onChange: (K) => b(K),
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
      t.createElement(o, {
        min: 1,
        max: 3600,
        value: v,
        onChange: (K) => I(K ?? 300),
        style: { width: 200 }
      })
    ),
    // ── Section: 活跃时段 ──
    t.createElement(Y, { style: { margin: "8px 0 16px" } }),
    t.createElement("div", { style: Ye }, "活跃时段"),
    q(
      "启用活跃时段限制",
      t.createElement(r, {
        checked: C,
        onChange: (K) => B(K)
      }),
      "仅在指定时段内触发心跳"
    ),
    C ? re(
      "开始时间",
      t.createElement("input", {
        type: "time",
        value: D,
        onChange: (K) => L(K.target.value),
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
        onChange: (K) => E(K.target.value),
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
          icon: u ? t.createElement(u) : void 0,
          loading: T,
          onClick: J,
          style: je
        },
        "保存配置"
      ),
      t.createElement(
        s,
        {
          icon: m ? t.createElement(m) : void 0,
          loading: M,
          onClick: _
        },
        "立即执行"
      )
    )
  );
}
function Xl({
  agentId: e,
  onRefresh: t
}) {
  const a = $().React, { useState: n, useEffect: l, useCallback: r } = a, {
    List: o,
    Tag: i,
    Switch: s,
    Button: d,
    Empty: g,
    Spin: f,
    Typography: c,
    message: m
  } = $().antd, { PlusOutlined: u, ReloadOutlined: y, DeleteOutlined: h } = $().antdIcons || {}, { Text: x, Paragraph: T } = c, [k, M] = n([]), [N, H] = n(!0), [X, j] = n(!1), [R, W] = n([]), [Q, P] = n(!1), b = r(async () => {
    H(!0);
    try {
      const L = await Jt(e);
      M(L);
    } catch (L) {
      m.error(L.message || "加载技能失败"), M([]);
    } finally {
      H(!1);
    }
  }, [e]);
  l(() => {
    b();
  }, [b]);
  const v = async () => {
    j(!0), P(!0);
    try {
      const L = await qt(!0);
      W(L);
    } catch (L) {
      m.error(L.message || "加载技能池失败");
    } finally {
      P(!1);
    }
  }, I = async (L) => {
    let z = 0, E = 0;
    for (const ee of L)
      try {
        await yn(e, ee), z++;
      } catch {
        E++;
      }
    z > 0 ? (m.success(
      `成功添加 ${z} 个技能${E > 0 ? `，${E} 个失败` : ""}`
    ), b(), t()) : E > 0 && m.error("添加技能失败"), j(!1);
  }, C = async (L, z) => {
    try {
      z ? await Ca(e, L.name) : await _a(e, L.name), m.success(z ? "已启用" : "已停用"), b(), t();
    } catch (E) {
      m.error(E.message || "操作失败");
    }
  }, B = async (L) => {
    try {
      await hn(e, L), m.success(`技能「${L}」已移除`), b(), t();
    } catch (z) {
      m.error(z.message || "移除技能失败");
    }
  };
  if (N)
    return a.createElement(
      "div",
      { style: { textAlign: "center", padding: 40 } },
      a.createElement(f, { size: "large" })
    );
  const D = k.filter((L) => L.enabled !== !1);
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
        x,
        { strong: !0 },
        `技能列表 (${k.length}，已启用 ${D.length})`
      ),
      a.createElement(
        "div",
        { style: { display: "flex", gap: 8 } },
        a.createElement(
          d,
          {
            size: "small",
            icon: y ? a.createElement(y) : void 0,
            onClick: () => {
              wt(), b();
            }
          },
          "刷新"
        ),
        a.createElement(
          d,
          {
            type: "primary",
            size: "small",
            icon: u ? a.createElement(u) : void 0,
            onClick: v,
            style: je
          },
          "从技能池添加"
        )
      )
    ),
    k.length === 0 ? a.createElement(g, {
      description: "该专家暂无技能",
      image: g.PRESENTED_IMAGE_SIMPLE
    }) : a.createElement(o, {
      dataSource: k,
      renderItem: (L) => a.createElement(
        o.Item,
        {
          actions: [
            a.createElement(s, {
              key: "toggle",
              size: "small",
              checked: L.enabled !== !1,
              onChange: (z) => C(L, z)
            }),
            a.createElement(
              d,
              {
                key: "del",
                type: "link",
                size: "small",
                danger: !0,
                icon: h ? a.createElement(h) : void 0,
                onClick: () => B(L.name)
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
            a.createElement(x, { strong: !0 }, L.name),
            L.version_text ? a.createElement(
              i,
              { style: { fontSize: 10 } },
              `v${L.version_text}`
            ) : null
          ),
          L.description ? a.createElement(
            T,
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
    a.createElement(Ia, {
      open: X,
      onClose: () => j(!1),
      poolSkills: R,
      installedSkillNames: k.map((L) => L.name),
      loading: Q,
      onInstall: I
    })
  );
}
function Ql({
  agentId: e,
  onRefresh: t,
  isActive: a
}) {
  const n = $().React, { useState: l, useEffect: r, useCallback: o } = n, {
    List: i,
    Tag: s,
    Button: d,
    Empty: g,
    Spin: f,
    Modal: c,
    Input: m,
    Typography: u,
    message: y
  } = $().antd, { PlusOutlined: h, ReloadOutlined: x, DeleteOutlined: T } = $().antdIcons || {}, { Text: k, Paragraph: M } = u, { TextArea: N } = m, [H, X] = l([]), [j, R] = l(!0), [W, Q] = l(!1), [P, b] = l(`{
  "mcpServers": {
    "example-client": {
      "command": "npx",
      "args": ["-y", "@example/mcp-server"],
      "env": {}
    }
  }
}`), [v, I] = l(!1), C = o(async () => {
    R(!0);
    try {
      const z = await En(e);
      X(z);
    } catch (z) {
      y.error(z.message || "加载 MCP 失败"), X([]);
    } finally {
      R(!1);
    }
  }, [e]);
  r(() => {
    C();
  }, [C]), r(() => {
    a && C();
  }, [a, C]);
  const B = async (z) => {
    try {
      await Ml(e, z), y.success("已切换 MCP 状态"), C(), t();
    } catch (E) {
      y.error(E.message || "切换失败");
    }
  }, D = async (z) => {
    try {
      await Ta(e, z), y.success(`MCP「${z}」已移除`), C(), t();
    } catch (E) {
      y.error(E.message || "移除 MCP 失败");
    }
  }, L = async () => {
    I(!0);
    try {
      const z = JSON.parse(P), E = z.mcpServers || z, ee = Object.entries(E);
      if (ee.length === 0) {
        y.warning("未找到 MCP 客户端配置");
        return;
      }
      for (const [J, _] of ee) {
        const q = _, re = q.url ? "streamable_http" : "stdio";
        await vn(e, {
          client_key: J,
          client: {
            name: q.name || J,
            description: q.description || "",
            enabled: !0,
            transport: re,
            url: q.url || "",
            command: q.command || "",
            args: q.args || [],
            env: q.env || {},
            cwd: q.cwd || "",
            headers: q.headers || {}
          }
        });
      }
      y.success("MCP 客户端已创建"), Q(!1), C(), t();
    } catch (z) {
      z instanceof SyntaxError ? y.error("JSON 格式错误：" + z.message) : y.error(z.message || "创建 MCP 失败");
    } finally {
      I(!1);
    }
  };
  return j ? n.createElement(
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
      n.createElement(k, { strong: !0 }, `MCP 客户端 (${H.length})`),
      n.createElement(
        "div",
        { style: { display: "flex", gap: 8 } },
        n.createElement(
          d,
          {
            size: "small",
            icon: x ? n.createElement(x) : void 0,
            onClick: () => {
              wt(), C();
            }
          },
          "刷新"
        ),
        n.createElement(
          d,
          {
            type: "primary",
            size: "small",
            icon: h ? n.createElement(h) : void 0,
            onClick: () => Q(!0),
            style: je
          },
          "添加 MCP"
        )
      )
    ),
    H.length === 0 ? n.createElement(g, {
      description: "该专家暂无 MCP 客户端",
      image: g.PRESENTED_IMAGE_SIMPLE
    }) : n.createElement(i, {
      dataSource: H,
      renderItem: (z) => n.createElement(
        i.Item,
        {
          actions: [
            n.createElement(
              d,
              {
                key: "toggle",
                size: "small",
                onClick: () => B(z.key)
              },
              z.enabled ? "停用" : "启用"
            ),
            n.createElement(
              d,
              {
                key: "del",
                type: "link",
                size: "small",
                danger: !0,
                icon: T ? n.createElement(T) : void 0,
                onClick: () => D(z.key)
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
            n.createElement(k, { strong: !0 }, z.name || z.key),
            n.createElement(
              s,
              {
                color: z.enabled ? "green" : "default",
                style: { fontSize: 10 }
              },
              z.enabled ? "启用" : "停用"
            ),
            n.createElement(
              s,
              { color: "purple", style: { fontSize: 10 } },
              z.transport
            )
          ),
          z.description ? n.createElement(
            M,
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
      c,
      {
        open: W,
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
      n.createElement(N, {
        value: P,
        onChange: (z) => b(z.target.value),
        rows: 12,
        style: { fontFamily: "monospace", fontSize: 12 }
      })
    )
  );
}
function Yl({ agentId: e }) {
  const t = $().React, { useState: a, useEffect: n, useCallback: l, useRef: r } = t, {
    Card: o,
    InputNumber: i,
    Input: s,
    Select: d,
    Switch: g,
    Button: f,
    Spin: c,
    Space: m,
    Typography: u,
    Divider: y,
    message: h
  } = $().antd, { SaveOutlined: x } = $().antdIcons || {}, { Text: T } = u, [k, M] = a(!0), [N, H] = a(!1), X = r(null), [j, R] = a(60), [W, Q] = a(""), [P, b] = a(!0), [v, I] = a(30), [C, B] = a("zh"), [D, L] = a("UTC"), [z, E] = a(!0), [ee, J] = a(100), [_, q] = a(!0), [re, Y] = a(3), [K, ce] = a(1), [O, oe] = a(!0), [pe, ie] = a(3), [le, ye] = a(2), [Ee, Ce] = a(60), [Oe, we] = a(1), [ne, Se] = a(0), [he, Z] = a(1), [de, fe] = a(0), [V, S] = a(30), [me, F] = a(50), [w, ae] = a("light"), [ue, ze] = a("scroll"), [Te, Re] = a("remelight"), [Be, Fe] = a("AUTO"), We = l(async () => {
    var te, Ae, $e, Me, Je, qe;
    M(!0);
    try {
      const [Ie, St, Kt] = await Promise.all([
        Dl(e),
        Fl(e).catch(() => "zh"),
        Hl().catch(() => "UTC")
      ]);
      X.current = Ie, R(Ie.shell_command_timeout ?? 60), Q(Ie.shell_command_executable ?? "");
      const mt = Ie.auto_title_config ?? { enabled: !0, timeout_seconds: 30 };
      b(mt.enabled ?? !0), I(mt.timeout_seconds ?? 30), B(St), L(Kt);
      const Xe = Ie.loop ?? {};
      E(((te = Xe.iteration) == null ? void 0 : te.enabled) ?? !0), J(((Ae = Xe.iteration) == null ? void 0 : Ae.max_iterations) ?? Ie.max_iters ?? 100), q((($e = Xe.doom_loop) == null ? void 0 : $e.enabled) ?? !0), Y(((Me = Xe.doom_loop) == null ? void 0 : Me.window_size) ?? 3), ce(((Je = Xe.doom_loop) == null ? void 0 : Je.similarity_threshold) ?? 1), oe(Ie.llm_retry_enabled ?? !0), ie(Ie.llm_max_retries ?? 3), ye(Ie.llm_backoff_base ?? 2), Ce(Ie.llm_backoff_cap ?? 60), we(Ie.llm_max_concurrent ?? 1), Se(Ie.llm_max_qpm ?? 0), Z(Ie.llm_rate_limit_pause ?? 1), fe(Ie.llm_rate_limit_jitter ?? 0), S(Ie.llm_acquire_timeout ?? 30), F(Ie.history_max_length ?? 50), ae(Ie.context_manager_backend ?? "light"), ze(((qe = Ie.light_context_config) == null ? void 0 : qe.strategy) ?? "scroll"), Re(Ie.memory_manager_backend ?? "remelight"), Fe(Ie.approval_level ?? "AUTO");
    } catch (Ie) {
      h.error(Ie.message || "加载运行配置失败");
    } finally {
      M(!1);
    }
  }, [e]);
  n(() => {
    We();
  }, [We]);
  const Ue = async () => {
    var Ae, $e;
    const te = X.current;
    if (te) {
      H(!0);
      try {
        const Me = {
          ...te,
          max_iters: ee,
          loop: {
            ...te.loop ?? {},
            iteration: { enabled: z, max_iterations: ee },
            doom_loop: {
              enabled: _,
              window_size: re,
              similarity_threshold: K,
              stages: (($e = (Ae = te.loop) == null ? void 0 : Ae.doom_loop) == null ? void 0 : $e.stages) ?? []
            }
          },
          shell_command_timeout: j,
          shell_command_executable: W,
          auto_title_config: {
            enabled: P,
            timeout_seconds: v
          },
          llm_retry_enabled: O,
          llm_max_retries: pe,
          llm_backoff_base: le,
          llm_backoff_cap: Ee,
          llm_max_concurrent: Oe,
          llm_max_qpm: ne,
          llm_rate_limit_pause: he,
          llm_rate_limit_jitter: de,
          llm_acquire_timeout: V,
          history_max_length: me,
          context_manager_backend: w,
          light_context_config: {
            ...te.light_context_config ?? {},
            strategy: ue
          },
          memory_manager_backend: Te,
          approval_level: Be
        };
        await Gl(e, Me), X.current = Me, C && await Wl(e, C).catch(() => {
        }), D && await Jl(D).catch(() => {
        }), h.success("运行配置已保存");
      } catch (Me) {
        h.error(Me.message || "保存运行配置失败");
      } finally {
        H(!1);
      }
    }
  };
  if (k)
    return t.createElement(
      "div",
      { style: { textAlign: "center", padding: 40 } },
      t.createElement(c, { size: "large" })
    );
  const xe = (te, Ae, $e) => t.createElement(
    "div",
    { style: Aa },
    t.createElement("div", { style: ot }, te),
    Ae,
    $e ? t.createElement(
      T,
      { type: "secondary", style: Pa },
      $e
    ) : null
  ), Le = (te, Ae, $e, Me) => t.createElement(
    "div",
    { style: $a },
    t.createElement(
      "div",
      null,
      t.createElement("div", { style: ot }, te),
      Ae
    ),
    t.createElement(
      "div",
      null,
      t.createElement("div", { style: ot }, $e),
      Me
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
    Le(
      "Shell 命令超时 (秒)",
      t.createElement(i, {
        min: 1,
        value: j,
        onChange: (te) => R(te ?? 60),
        style: { width: "100%" }
      }),
      "Shell 可执行文件",
      t.createElement(s, {
        value: W,
        onChange: (te) => Q(te.target.value),
        placeholder: "留空使用系统默认",
        style: { width: "100%" }
      })
    ),
    Le(
      "语言",
      t.createElement(d, {
        value: C,
        onChange: (te) => B(te),
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
        value: D,
        onChange: (te) => L(te),
        style: { width: "100%" },
        showSearch: !0,
        filterOption: (te, Ae) => {
          var $e;
          return ((($e = Ae == null ? void 0 : Ae.label) == null ? void 0 : $e.toString()) || "").toLowerCase().includes(te.toLowerCase());
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
        ].map((te) => ({ value: te, label: te }))
      })
    ),
    Le(
      "自动生成会话标题",
      t.createElement(m, null, t.createElement(g, {
        checked: P,
        onChange: (te) => b(te)
      })),
      "标题生成超时 (秒)",
      t.createElement(i, {
        min: 5,
        value: v,
        onChange: (te) => I(te ?? 30),
        style: { width: "100%" },
        disabled: !P
      })
    ),
    // ── Section: 审批级别 ──
    t.createElement(y, { style: { margin: "8px 0 16px" } }),
    t.createElement("div", { style: Ye }, "审批级别"),
    xe(
      "工具执行审批",
      t.createElement(d, {
        value: Be,
        onChange: (te) => Fe(te),
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
    xe(
      "启用迭代限制",
      t.createElement(g, {
        checked: z,
        onChange: (te) => E(te)
      }),
      "停止 Agent 前的最大循环轮次"
    ),
    z ? xe(
      "最大迭代次数",
      t.createElement(i, {
        min: 1,
        max: 500,
        value: ee,
        onChange: (te) => J(te ?? 100),
        style: { width: "100%" }
      })
    ) : null,
    xe(
      "启用重复循环保护",
      t.createElement(g, {
        checked: _,
        onChange: (te) => q(te)
      }),
      "检测并阻止重复操作循环"
    ),
    _ ? Le(
      "检测窗口大小",
      t.createElement(i, {
        min: 2,
        max: 20,
        value: re,
        onChange: (te) => Y(te ?? 3),
        style: { width: "100%" }
      }),
      "相似度阈值",
      t.createElement(i, {
        min: 0,
        max: 1,
        step: 0.05,
        value: K,
        onChange: (te) => ce(te ?? 1),
        style: { width: "100%" }
      })
    ) : null,
    // ── Section: LLM 重试 ──
    t.createElement(y, { style: { margin: "8px 0 16px" } }),
    t.createElement("div", { style: Ye }, "LLM 重试"),
    xe(
      "启用 LLM 重试",
      t.createElement(g, {
        checked: O,
        onChange: (te) => oe(te)
      })
    ),
    Le(
      "最大重试次数",
      t.createElement(i, {
        min: 1,
        value: pe,
        onChange: (te) => ie(te ?? 3),
        style: { width: "100%" },
        disabled: !O
      }),
      "退避基数 (秒)",
      t.createElement(i, {
        min: 0.1,
        step: 0.1,
        value: le,
        onChange: (te) => ye(te ?? 2),
        style: { width: "100%" },
        disabled: !O
      })
    ),
    xe(
      "退避上限 (秒)",
      t.createElement(i, {
        min: 0.5,
        step: 0.5,
        value: Ee,
        onChange: (te) => Ce(te ?? 60),
        style: { width: 200 },
        disabled: !O
      })
    ),
    // ── Section: LLM 限流 ──
    t.createElement(y, { style: { margin: "8px 0 16px" } }),
    t.createElement("div", { style: Ye }, "LLM 限流"),
    Le(
      "最大并发数",
      t.createElement(i, {
        min: 1,
        value: Oe,
        onChange: (te) => we(te ?? 1),
        style: { width: "100%" }
      }),
      "最大 QPM (0=不限)",
      t.createElement(i, {
        min: 0,
        step: 10,
        value: ne,
        onChange: (te) => Se(te ?? 0),
        style: { width: "100%" }
      })
    ),
    Le(
      "限流暂停时间 (秒)",
      t.createElement(i, {
        min: 1,
        step: 0.5,
        value: he,
        onChange: (te) => Z(te ?? 1),
        style: { width: "100%" }
      }),
      "限流抖动 (秒)",
      t.createElement(i, {
        min: 0,
        step: 0.5,
        value: de,
        onChange: (te) => fe(te ?? 0),
        style: { width: "100%" }
      })
    ),
    xe(
      "获取超时 (秒)",
      t.createElement(i, {
        min: 10,
        step: 10,
        value: V,
        onChange: (te) => S(te ?? 30),
        style: { width: 200 }
      }),
      "应大于 限流暂停 + 抖动"
    ),
    // ── Section: 上下文与记忆 ──
    t.createElement(y, { style: { margin: "8px 0 16px" } }),
    t.createElement("div", { style: Ye }, "上下文与记忆"),
    Le(
      "上下文管理后端",
      t.createElement(d, {
        value: w,
        onChange: (te) => ae(te),
        style: { width: "100%" },
        options: [{ value: "light", label: "light" }]
      }),
      "上下文策略",
      t.createElement(d, {
        value: ue,
        onChange: (te) => ze(te),
        style: { width: "100%" },
        options: [
          { value: "scroll", label: "scroll (滚动窗口)" },
          { value: "native", label: "native (原生)" }
        ]
      })
    ),
    Le(
      "记忆管理后端",
      t.createElement(d, {
        value: Te,
        onChange: (te) => Re(te),
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
        value: me,
        onChange: (te) => F(te ?? 50),
        style: { width: "100%" }
      })
    ),
    // ── Save button ──
    t.createElement(
      "div",
      { style: { display: "flex", justifyContent: "flex-end", marginTop: 16 } },
      t.createElement(
        f,
        {
          type: "primary",
          icon: x ? t.createElement(x) : void 0,
          loading: N,
          onClick: Ue,
          style: je
        },
        "保存运行配置"
      )
    )
  );
}
function Zl({
  expert: e,
  open: t,
  onClose: a,
  onRefresh: n
}) {
  const l = $().React, { useState: r, useEffect: o, useCallback: i } = l, { Modal: s, Tabs: d, Spin: g, Typography: f } = $().antd, { SettingOutlined: c } = $().antdIcons || {}, { Text: m } = f, [u, y] = r([]), [h, x] = r(!1), [T, k] = r("heartbeat"), M = i(async () => {
    if (e) {
      x(!0);
      try {
        const j = await ql(e.agent.id);
        y(j);
      } catch {
        y([]);
      } finally {
        x(!1);
      }
    }
  }, [e]);
  if (o(() => {
    t && e && M();
  }, [t, e, M]), !e) return null;
  const { agent: N } = e, H = () => {
    M(), n();
  }, X = [
    {
      key: "heartbeat",
      label: "心跳",
      children: l.createElement(Vl, {
        agentId: N.id
      })
    },
    {
      key: "files",
      label: "文件",
      children: h ? l.createElement(
        "div",
        { style: { textAlign: "center", padding: 40 } },
        l.createElement(g, { size: "large" })
      ) : l.createElement(za, {
        agentId: N.id,
        systemPromptFiles: u,
        onRefresh: H
      })
    },
    {
      key: "skills",
      label: `技能 (${e.skills.filter((j) => j.enabled !== !1).length})`,
      children: l.createElement(Xl, {
        agentId: N.id,
        onRefresh: n
      })
    },
    {
      key: "mcp",
      label: `MCP (${e.mcps.length})`,
      children: l.createElement(Ql, {
        agentId: N.id,
        onRefresh: n,
        isActive: T === "mcp"
      })
    },
    {
      key: "running",
      label: "运行配置",
      children: l.createElement(Yl, {
        agentId: N.id
      })
    }
  ];
  return l.createElement(
    s,
    {
      open: t,
      title: l.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 8 } },
        c ? l.createElement(c, { style: { fontSize: 18 } }) : null,
        l.createElement("span", null, `配置 - ${N.name}`),
        l.createElement(
          m,
          { type: "secondary", style: { fontSize: 12, fontWeight: 400 } },
          N.id
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
    l.createElement(d, {
      items: X,
      activeKey: T,
      onChange: (j) => k(j),
      size: "small",
      tabBarStyle: { marginBottom: 16 }
    })
  );
}
const er = [
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
], tr = er;
function Zn(e) {
  return Gt(`/ugsci/avatar/${encodeURIComponent(e)}`);
}
function ea(e) {
  const t = e.map(encodeURIComponent).join(",");
  return Gt(`/ugsci/avatar/team/${t}`);
}
function He({
  name: e,
  size: t = 32,
  borderRadius: a = "50%"
}) {
  const n = $().React, [l, r] = n.useState(0), o = l === 0 ? Zn(e) : `${Zn(e)}?_r=${l}`;
  return n.createElement("img", {
    src: o,
    alt: e,
    onError: () => {
      l < 1 && r(l + 1);
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
  const n = $().React, [l, r] = n.useState(0);
  if (!e || e.length === 0)
    return n.createElement("span", {
      style: {
        width: t,
        height: t,
        display: "inline-block"
      }
    });
  const o = e.slice(0, 5), i = l === 0 ? ea(o) : `${ea(o)}?_r=${l}`;
  return n.createElement("img", {
    src: i,
    alt: "team",
    onError: () => {
      l < 1 && r(l + 1);
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
  const t = $();
  if (t.refreshAgents)
    try {
      await t.refreshAgents({ force: !0 });
    } catch (n) {
      console.warn("[ugsci] Failed to refresh newly created agent:", n);
      return;
    }
  (a = t.setSelectedAgent) == null || a.call(t, e);
}
function nr({
  expert: e,
  onClick: t,
  onSummon: a,
  onConfigure: n
}) {
  const l = $().React, { Card: r, Tag: o, Badge: i, Typography: s, Spin: d, Button: g, Tooltip: f } = $().antd, { Text: c } = s, { ThunderboltOutlined: m, SettingOutlined: u } = $().antdIcons || {}, { agent: y, skills: h, mcps: x, loading: T } = e, k = y.enabled, M = h.filter((X) => X.enabled !== !1).map((X) => X.name), N = x.map((X) => X.name || X.key), H = y.active_model ? `${y.active_model.provider_id}/${y.active_model.model}` : null;
  return l.createElement(
    r,
    {
      hoverable: !0,
      onClick: t,
      size: "small",
      style: {
        cursor: "pointer",
        transition: "all 0.2s ease",
        borderColor: k ? void 0 : "var(--ant-color-border, #d9d9d9)",
        opacity: k ? 1 : 0.7,
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
        l.createElement(He, { name: y.name, size: 36 }),
        l.createElement(
          "div",
          null,
          l.createElement(
            c,
            { strong: !0, style: { fontSize: 15 } },
            y.name
          ),
          l.createElement(
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
      l.createElement(i, {
        status: k ? "success" : "default",
        text: k ? "启用" : "停用"
      })
    ),
    // Description (rendered as markdown)
    y.description ? l.createElement(
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
      Ft(y.description, l)
    ) : l.createElement(
      "div",
      { style: { fontSize: 12, color: "var(--ant-color-text-quaternary, #bfbfbf)", marginBottom: 10, minHeight: 54, flex: "1 0 auto" } },
      "暂无描述"
    ),
    // Model info
    H ? l.createElement(
      "div",
      { style: { marginBottom: 8 } },
      l.createElement(
        o,
        { color: "geekblue", style: { fontSize: 11 } },
        `🤖 ${H}`
      )
    ) : null,
    // Skills
    T ? l.createElement(d, { size: "small" }) : l.createElement(
      "div",
      { style: { marginBottom: 6 } },
      l.createElement(
        "div",
        { style: { fontSize: 11, color: "var(--ant-color-text-tertiary, #8c8c8c)", marginBottom: 4 } },
        `技能 (${M.length})`
      ),
      l.createElement(Yn, {
        items: M,
        max: 4,
        color: "cyan",
        emptyText: "未配置技能"
      })
    ),
    // MCP
    !T && N.length > 0 ? l.createElement(
      "div",
      { style: { marginTop: "auto" } },
      l.createElement(
        "div",
        { style: { fontSize: 11, color: "var(--ant-color-text-tertiary, #8c8c8c)", marginBottom: 4 } },
        `MCP (${N.length})`
      ),
      l.createElement(Yn, {
        items: N,
        max: 3,
        color: "purple"
      })
    ) : null,
    // Bottom bar: gear icon (left) + summon button (right)
    l.createElement(
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
      l.createElement(
        f,
        { title: "配置专家", placement: "top" },
        l.createElement(
          g,
          {
            type: "text",
            size: "small",
            icon: u ? l.createElement(u, {
              style: { fontSize: 16, color: "var(--ant-color-text-tertiary, #8c8c8c)" }
            }) : void 0,
            onClick: (X) => {
              X.stopPropagation(), n && n();
            }
          }
        )
      ),
      // Summon button (bottom-right)
      l.createElement(
        g,
        {
          type: "primary",
          size: "small",
          icon: m ? l.createElement(m) : void 0,
          disabled: !k,
          onClick: (X) => {
            X.stopPropagation(), a && a();
          },
          style: je
        },
        "召唤专家"
      )
    )
  );
}
function ar({
  expert: e,
  open: t,
  onClose: a,
  onRefresh: n
}) {
  const l = $().React, {
    Drawer: r,
    Descriptions: o,
    Tag: i,
    Typography: s,
    Space: d,
    Button: g,
    Empty: f,
    Tabs: c,
    List: m,
    Spin: u,
    Modal: y,
    message: h
  } = $().antd, { Text: x, Paragraph: T } = s, {
    EditOutlined: k,
    ThunderboltOutlined: M,
    FileTextOutlined: N,
    ToolOutlined: H,
    PlusOutlined: X
  } = $().antdIcons || {}, [j, R] = l.useState(!1), [W, Q] = l.useState(
    []
  ), [P, b] = l.useState(!1);
  if (!e) return null;
  const { agent: v, config: I, skills: C, mcps: B, loading: D } = e, L = C.filter((O) => O.enabled !== !1), z = (O) => {
    window.history.pushState({}, "", O), window.dispatchEvent(new PopStateEvent("popstate"));
  }, E = l.createElement(
    "div",
    null,
    l.createElement(
      o,
      { column: 1, bordered: !0, size: "small" },
      l.createElement(o.Item, { label: "专家名称" }, v.name),
      l.createElement(
        o.Item,
        { label: "专家 ID" },
        l.createElement("code", { style: { fontSize: 12 } }, v.id)
      ),
      l.createElement(
        o.Item,
        { label: "状态" },
        l.createElement(
          i,
          { color: v.enabled ? "green" : "default" },
          v.enabled ? "启用" : "停用"
        )
      ),
      l.createElement(
        o.Item,
        { label: "功能简介" },
        v.description ? Ft(v.description, l) : "暂无描述"
      ),
      l.createElement(
        o.Item,
        { label: "使用模型" },
        v.active_model ? `${v.active_model.provider_id} / ${v.active_model.model}` : "使用全局默认模型"
      ),
      I != null && I.workspace_dir ? l.createElement(
        o.Item,
        { label: "工作区路径" },
        l.createElement(
          "code",
          { style: { fontSize: 11 } },
          I.workspace_dir
        )
      ) : null,
      I != null && I.approval_level ? l.createElement(
        o.Item,
        { label: "审批级别" },
        I.approval_level
      ) : null
    ),
    // System prompt files
    I != null && I.system_prompt_files && I.system_prompt_files.length > 0 ? l.createElement(
      "div",
      { style: { marginTop: 16 } },
      l.createElement(
        "div",
        {
          style: {
            display: "flex",
            alignItems: "center",
            gap: 6,
            marginBottom: 8
          }
        },
        N ? l.createElement(N, {
          style: { fontSize: 14, color: "#1677ff" }
        }) : null,
        l.createElement(x, { strong: !0 }, "系统提示词文件")
      ),
      l.createElement(
        d,
        { wrap: !0 },
        ...I.system_prompt_files.map(
          (O, oe) => l.createElement(
            i,
            {
              key: oe,
              icon: N ? l.createElement(N) : void 0,
              style: { fontSize: 12 }
            },
            O
          )
        )
      )
    ) : null
  ), ee = async () => {
    R(!0), b(!0);
    try {
      const O = await qt(!0);
      Q(O);
    } catch (O) {
      h.error(O.message || "加载技能池失败");
    } finally {
      b(!1);
    }
  }, J = async (O) => {
    let oe = 0, pe = 0;
    for (const ie of O)
      try {
        await yn(v.id, ie), oe++;
      } catch {
        pe++;
      }
    oe > 0 ? (h.success(
      `成功添加 ${oe} 个技能${pe > 0 ? `，${pe} 个失败` : ""}`
    ), n()) : pe > 0 && h.error("添加技能失败"), R(!1);
  }, _ = async (O) => {
    try {
      await hn(v.id, O), h.success(`技能「${O}」已移除`), n();
    } catch (oe) {
      h.error(oe.message || "移除技能失败");
    }
  }, q = async (O) => {
    try {
      await Ta(v.id, O), h.success(`MCP「${O}」已移除`), n();
    } catch (oe) {
      h.error(oe.message || "移除 MCP 失败");
    }
  }, re = D ? l.createElement(
    "div",
    { style: { textAlign: "center", padding: 40 } },
    l.createElement(u, { size: "large" })
  ) : l.createElement(
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
        x,
        { strong: !0 },
        `已启用技能 (${L.length})`
      ),
      l.createElement(
        g,
        {
          type: "primary",
          size: "small",
          icon: X ? l.createElement(X) : void 0,
          onClick: ee
        },
        "从技能池添加"
      )
    ),
    L.length === 0 ? l.createElement(f, {
      description: "该专家暂无已启用的技能",
      image: f.PRESENTED_IMAGE_SIMPLE
    }) : l.createElement(m, {
      dataSource: L,
      renderItem: (O) => l.createElement(
        m.Item,
        {
          actions: [
            l.createElement(
              g,
              {
                type: "link",
                size: "small",
                danger: !0,
                onClick: () => _(O.name)
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
            O.emoji ? l.createElement(
              "span",
              { style: { fontSize: 16 } },
              O.emoji
            ) : null,
            l.createElement(x, { strong: !0 }, O.name),
            O.version_text ? l.createElement(
              i,
              { style: { fontSize: 10 } },
              `v${O.version_text}`
            ) : null
          ),
          O.description ? l.createElement(
            T,
            {
              type: "secondary",
              style: { fontSize: 12, margin: 0 },
              ellipsis: { rows: 2 }
            },
            O.description
          ) : null,
          O.tags && O.tags.length > 0 ? l.createElement(
            "div",
            { style: { marginTop: 4 } },
            ...O.tags.map(
              (oe, pe) => l.createElement(
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
    l.createElement(Ia, {
      open: j,
      onClose: () => R(!1),
      poolSkills: W,
      installedSkillNames: L.map((O) => O.name),
      loading: P,
      onInstall: J
    })
  ), Y = D ? l.createElement(
    "div",
    { style: { textAlign: "center", padding: 40 } },
    l.createElement(u, { size: "large" })
  ) : l.createElement(
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
        x,
        { strong: !0 },
        `MCP 客户端 (${B.length})`
      ),
      l.createElement(
        g,
        {
          type: "primary",
          size: "small",
          icon: X ? l.createElement(X) : void 0,
          onClick: () => {
            window.history.pushState({}, "", `/agents/${v.id}/mcp`), window.dispatchEvent(new PopStateEvent("popstate"));
          }
        },
        "配置 MCP"
      )
    ),
    B.length === 0 ? l.createElement(f, {
      description: "该专家暂无关联的 MCP 客户端，点击「配置 MCP」添加",
      image: f.PRESENTED_IMAGE_SIMPLE
    }) : l.createElement(m, {
      dataSource: B,
      renderItem: (O) => l.createElement(
        m.Item,
        {
          actions: [
            l.createElement(
              g,
              {
                type: "link",
                size: "small",
                danger: !0,
                onClick: () => q(O.key)
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
            l.createElement(
              "span",
              { style: { fontSize: 14 } },
              "🔌"
            ),
            l.createElement(
              x,
              { strong: !0 },
              O.name || O.key
            ),
            l.createElement(
              i,
              {
                color: O.enabled ? "green" : "default",
                style: { fontSize: 10 }
              },
              O.enabled ? "启用" : "停用"
            ),
            l.createElement(
              i,
              { color: "purple", style: { fontSize: 10 } },
              O.transport
            )
          ),
          O.description ? l.createElement(
            T,
            {
              type: "secondary",
              style: { fontSize: 12, margin: 0 },
              ellipsis: { rows: 2 }
            },
            O.description
          ) : null,
          O.tools && O.tools.length > 0 ? l.createElement(
            "div",
            {
              style: {
                marginTop: 4,
                fontSize: 11,
                color: "var(--ant-color-text-tertiary, #8c8c8c)"
              }
            },
            `提供 ${O.tools.length} 个工具`
          ) : null
        )
      )
    })
  ), K = I != null && I.tools ? l.createElement(
    "div",
    { style: { padding: 16 } },
    l.createElement(
      "div",
      { style: { marginBottom: 12 } },
      l.createElement(
        "div",
        {
          style: {
            display: "flex",
            alignItems: "center",
            gap: 6,
            marginBottom: 8
          }
        },
        H ? l.createElement(H, {
          style: { fontSize: 14, color: "#1677ff" }
        }) : null,
        l.createElement(x, { strong: !0 }, "工具配置")
      ),
      l.createElement(
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
  ) : l.createElement(f, {
    description: "暂无工具配置",
    image: f.PRESENTED_IMAGE_SIMPLE
  }), ce = [
    { key: "basic", label: "基本信息", children: E },
    {
      key: "skills",
      label: `技能 (${L.length})`,
      children: re
    },
    {
      key: "prompts",
      label: "推荐提问",
      children: l.createElement(Kl, {
        skills: L,
        agentId: v.id
      })
    },
    {
      key: "knowledge",
      label: "专家记忆",
      children: l.createElement(za, {
        agentId: v.id,
        systemPromptFiles: (I == null ? void 0 : I.system_prompt_files) || [],
        onRefresh: () => n()
      })
    },
    { key: "mcp", label: `MCP (${B.length})`, children: Y },
    { key: "tools", label: "工具配置", children: K }
  ];
  return l.createElement(
    r,
    {
      title: l.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 8 } },
        l.createElement(He, { name: v.name, size: 28 }),
        l.createElement("span", null, v.name)
      ),
      open: t,
      onClose: a,
      width: 560,
      extra: l.createElement(
        d,
        null,
        l.createElement(
          g,
          {
            size: "small",
            icon: k ? l.createElement(k) : void 0,
            onClick: () => {
              a();
              try {
                const O = $();
                O.setSelectedAgent && O.setSelectedAgent(v.id);
              } catch (O) {
                console.warn("[ugsci] Failed to set selected agent:", O);
              }
              setTimeout(() => z("/agents"), 0);
            }
          },
          "编辑专家"
        ),
        l.createElement(
          g,
          {
            type: "primary",
            size: "small",
            icon: M ? l.createElement(M) : void 0,
            onClick: () => {
              a();
              try {
                const O = $();
                O.setSelectedAgent && O.setSelectedAgent(v.id);
              } catch (O) {
                console.warn("[ugsci] Failed to set selected agent:", O);
              }
              setTimeout(() => z("/chat"), 0);
            }
          },
          "开始对话"
        )
      )
    },
    l.createElement(c, {
      items: ce,
      defaultActiveKey: "basic"
    })
  );
}
function lr({
  open: e,
  onClose: t,
  onCreated: a
}) {
  const n = $().React, { useState: l } = n, {
    Modal: r,
    Card: o,
    Tag: i,
    Input: s,
    Row: d,
    Col: g,
    Spin: f,
    message: c,
    Typography: m
  } = $().antd, { Text: u } = m, { FileAddOutlined: y } = $().antdIcons || {}, [h, x] = l(!1), [T, k] = l(""), [M, N] = l(!1), H = async (R) => {
    x(!0);
    try {
      const W = await se("/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: R.id || void 0,
          name: R.name,
          description: R.description,
          skill_names: R.skillNames
        })
      }), Q = R.systemPrompt.trim() || `# ${R.name}

你是${R.name}。${R.description ? `

职责：${R.description}` : ""}
`, b = (await Promise.allSettled([
        Lt(W.id, "AGENTS.md", Q),
        ...R.mcpClients.map(
          ({ clientKey: v, client: I }) => vn(W.id, {
            client_key: v,
            client: I
          })
        )
      ])).filter(
        (v) => v.status === "rejected"
      ).length;
      b > 0 ? c.warning(
        `专家「${R.name}」已创建，${b} 项初始配置失败，可在专家配置中重试`
      ) : c.success(`专家「${R.name}」创建成功`), await ta(W.id), N(!1), setTimeout(() => {
        t(), a();
      }, 0);
    } catch (W) {
      c.error(W.message || "创建专家失败");
    } finally {
      x(!1);
    }
  }, X = tr.filter((R) => {
    if (!T.trim()) return !0;
    const W = T.toLowerCase();
    return R.name.toLowerCase().includes(W) || R.description.toLowerCase().includes(W) || R.category.toLowerCase().includes(W);
  }), j = async (R) => {
    x(!0);
    try {
      const W = await se("/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: R.name,
          description: R.description,
          skill_names: R.recommended_skills
        })
      });
      await Lt(W.id, "AGENTS.md", R.system_prompt);
      const Q = await fn(W.id);
      Q.approval_level = R.approval_level, await se(`/agents/${encodeURIComponent(W.id)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Q)
      }), await ta(W.id), c.success(`专家「${R.name}」创建成功`), t(), a();
    } catch (W) {
      c.error(W.message || "创建专家失败");
    } finally {
      x(!1);
    }
  };
  return n.createElement(
    n.Fragment,
    null,
    n.createElement(
      r,
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
          value: T,
          onChange: (R) => k(R.target.value),
          allowClear: !0
        })
      ),
      h ? n.createElement(
        "div",
        { style: { textAlign: "center", padding: 60 } },
        n.createElement(f, { size: "large" }),
        n.createElement(
          "div",
          { style: { marginTop: 12, color: "var(--ant-color-text-tertiary, #8c8c8c)" } },
          "正在创建专家..."
        )
      ) : n.createElement(
        d,
        { gutter: [12, 12] },
        // ── Blank template card (always first) ──
        T.trim() ? null : n.createElement(
          g,
          { xs: 24, sm: 12 },
          n.createElement(
            o,
            {
              hoverable: !0,
              size: "small",
              onClick: () => N(!0),
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
                  u,
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
        ...X.map(
          (R) => n.createElement(
            g,
            { key: R.id, xs: 24, sm: 12 },
            n.createElement(
              o,
              {
                hoverable: !0,
                size: "small",
                onClick: () => j(R),
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
                  name: R.name,
                  size: 40
                }),
                n.createElement(
                  "div",
                  { style: { flex: 1 } },
                  n.createElement(
                    u,
                    { strong: !0, style: { fontSize: 15 } },
                    R.name
                  ),
                  n.createElement(
                    "div",
                    null,
                    n.createElement(
                      i,
                      { color: "blue", style: { fontSize: 10 } },
                      R.category
                    ),
                    R.approval_level === "MANUAL" ? n.createElement(
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
                Ft(R.description, n)
              )
            )
          )
        )
      )
    ),
    // ── Blank template creation modal (sibling, not nested inside Modal) ──
    n.createElement(or, {
      open: M,
      onCancel: () => N(!1),
      onCreate: H
    })
  );
}
function ft(e) {
  return typeof e == "object" && e !== null && !Array.isArray(e);
}
function rr(e) {
  const t = e.trim();
  if (!t) return [];
  const a = JSON.parse(t);
  if (!ft(a))
    throw new Error("MCP 配置必须是 JSON 对象");
  const n = a.mcpServers ?? a;
  if (!ft(n))
    throw new Error("mcpServers 必须是 JSON 对象");
  return Object.entries(n).map(([l, r]) => {
    const o = l.trim();
    if (!o || !ft(r))
      throw new Error(`MCP「${l || "未命名"}」配置无效`);
    const i = typeof r.url == "string" ? r.url : "", s = typeof r.command == "string" ? r.command : "";
    if (!i && !s)
      throw new Error(`MCP「${o}」需要配置 url 或 command`);
    const g = (typeof r.transport == "string" ? r.transport : typeof r.type == "string" ? r.type : "") === "sse" ? "sse" : i ? "streamable_http" : "stdio";
    return {
      clientKey: o,
      client: {
        name: typeof r.name == "string" ? r.name : o,
        description: typeof r.description == "string" ? r.description : "",
        enabled: typeof r.enabled == "boolean" ? r.enabled : !0,
        transport: g,
        url: i,
        command: s,
        args: Array.isArray(r.args) ? r.args : [],
        env: ft(r.env) ? r.env : {},
        cwd: typeof r.cwd == "string" ? r.cwd : "",
        headers: ft(r.headers) ? r.headers : {}
      }
    };
  });
}
function or({
  open: e,
  onCancel: t,
  onCreate: a
}) {
  const n = $().React, { useState: l, useEffect: r, useMemo: o } = n, {
    Modal: i,
    Input: s,
    Select: d,
    Button: g,
    Row: f,
    Col: c,
    Spin: m,
    Tag: u,
    Typography: y,
    message: h
  } = $().antd, { CheckCircleOutlined: x } = $().antdIcons || {}, { Text: T } = y, [k, M] = l(""), [N, H] = l(""), [X, j] = l(""), [R, W] = l(""), [Q, P] = l([]), [b, v] = l([]), [I, C] = l(!1), [B, D] = l(""), [L, z] = l(!1);
  r(() => {
    e && (M(""), H(""), j(""), W(""), v([]), D(""), z(!1), C(!0), qt(!0).then(P).catch((Y) => {
      P([]), h.error(Y.message || "加载技能池失败");
    }).finally(() => C(!1)));
  }, [e]);
  const E = N.trim(), ee = o(() => E ? E.length < 2 || E.length > 64 ? "ID 长度需为 2-64 个字符" : /^[a-zA-Z0-9][a-zA-Z0-9_-]*[a-zA-Z0-9]$/.test(E) ? E === "default" ? "default 是系统保留 ID" : "" : "仅允许字母、数字、连字符和下划线，且不能以符号开头或结尾" : "", [E]), J = o(() => {
    try {
      return { clients: rr(B), error: "" };
    } catch (Y) {
      return { clients: [], error: Y.message || "MCP 配置无效" };
    }
  }, [B]), _ = () => {
    const Y = k.trim();
    if (!Y) {
      h.warning("请输入专家名称");
      return;
    }
    if (ee) {
      h.warning(ee);
      return;
    }
    if (J.error) {
      h.warning(J.error);
      return;
    }
    z(!0), Promise.resolve(
      a({
        id: E,
        name: Y,
        description: X.trim(),
        systemPrompt: R,
        skillNames: b,
        mcpClients: J.clients
      })
    ).finally(() => z(!1));
  }, q = () => {
    v(
      Q.filter((Y) => Y.source === "builtin").map((Y) => Y.name)
    );
  }, re = (Y, K) => n.createElement(
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
    n.createElement(T, { strong: !0, style: { fontSize: 15 } }, Y),
    K ? n.createElement(T, { type: "secondary", style: { fontSize: 12 } }, K) : null
  );
  return n.createElement(
    i,
    {
      open: e,
      title: "创建专家",
      onCancel: t,
      onOk: _,
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
      re("基本信息", "ID 留空时自动生成"),
      n.createElement(
        f,
        { gutter: [16, 12] },
        n.createElement(
          c,
          { xs: 24, md: 12 },
          n.createElement(
            "label",
            { style: { display: "block", fontSize: 13, marginBottom: 6 } },
            "专家名称",
            n.createElement("span", { style: { color: "#ff4d4f", marginLeft: 4 } }, "*")
          ),
          n.createElement(s, {
            placeholder: "例如：合同审查专家",
            value: k,
            onChange: (Y) => M(Y.target.value),
            maxLength: 50
          })
        ),
        n.createElement(
          c,
          { xs: 24, md: 12 },
          n.createElement(
            "label",
            { style: { display: "block", fontSize: 13, marginBottom: 6 } },
            "智能体 ID（可选）"
          ),
          n.createElement(s, {
            placeholder: "例如：contract-reviewer",
            value: N,
            onChange: (Y) => H(Y.target.value),
            maxLength: 64,
            status: ee ? "error" : void 0
          }),
          ee ? n.createElement("div", { style: { color: "#ff4d4f", fontSize: 12, marginTop: 4 } }, ee) : null
        ),
        n.createElement(
          c,
          { span: 24 },
          n.createElement(
            "label",
            { style: { display: "block", fontSize: 13, marginBottom: 6 } },
            "专家描述（可选）"
          ),
          n.createElement(s.TextArea, {
            placeholder: "简要描述该专家的职责和能力",
            value: X,
            onChange: (Y) => j(Y.target.value),
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
      re("角色指令", "保存为 AGENTS.md"),
      n.createElement(s.TextArea, {
        placeholder: "定义专家的角色、目标、工作方式和输出要求；留空时将根据名称与描述生成基础指令",
        value: R,
        onChange: (Y) => W(Y.target.value),
        rows: 6,
        style: { fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", fontSize: 12 }
      })
    ),
    n.createElement(
      "div",
      { style: { borderTop: "1px solid #f0f0f0", paddingTop: 20 } },
      re("初始能力"),
      n.createElement(
        f,
        { gutter: [20, 16], align: "top" },
        n.createElement(
          c,
          { xs: 24, md: 12 },
          n.createElement(
            "div",
            { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 } },
            n.createElement(T, { strong: !0 }, "初始技能"),
            n.createElement(
              "div",
              { style: { display: "flex", gap: 4 } },
              n.createElement(g, { size: "small", onClick: q, disabled: I }, "内置"),
              n.createElement(g, { size: "small", onClick: () => v([]), disabled: b.length === 0 }, "清空")
            )
          ),
          I ? n.createElement("div", { style: { textAlign: "center", padding: 32 } }, n.createElement(m, { size: "small" })) : n.createElement(d, {
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
            b.length > 0 ? n.createElement(u, { color: "blue" }, `已选择 ${b.length} 个技能`) : n.createElement(T, { type: "secondary", style: { fontSize: 12 } }, "暂不添加技能")
          )
        ),
        n.createElement(
          c,
          { xs: 24, md: 12 },
          n.createElement(T, { strong: !0, style: { display: "block", marginBottom: 8 } }, "初始 MCP"),
          n.createElement(s.TextArea, {
            placeholder: `{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem"]
    }
  }
}`,
            value: B,
            onChange: (Y) => D(Y.target.value),
            rows: 8,
            status: J.error ? "error" : void 0,
            style: { fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", fontSize: 12 }
          }),
          n.createElement(
            "div",
            { style: { marginTop: 8, minHeight: 22 } },
            J.error ? n.createElement(T, { type: "danger", style: { fontSize: 12 } }, J.error) : J.clients.length > 0 ? n.createElement(
              u,
              {
                color: "green",
                icon: x ? n.createElement(x) : void 0
              },
              `已识别 ${J.clients.length} 个 MCP`
            ) : n.createElement(T, { type: "secondary", style: { fontSize: 12 } }, "暂不添加 MCP")
          )
        )
      )
    )
  );
}
const Oa = "ugsci_custom_teams";
function sr(e) {
  if (!e || typeof e != "object") return !1;
  const t = e;
  return typeof t.id == "string" && typeof t.name == "string" && typeof t.taskTemplate == "string" && typeof t.orchestrationPrompt == "string" && Array.isArray(t.members);
}
function yt() {
  try {
    const e = JSON.parse(
      localStorage.getItem(Oa) || "[]"
    );
    return Array.isArray(e) ? e.filter(sr) : [];
  } catch {
    return [];
  }
}
function wn(e) {
  try {
    localStorage.setItem(Oa, JSON.stringify(e));
  } catch {
  }
}
function ir(e) {
  return {
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
}
function cr(e) {
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
    custom: !0
  };
}
async function on(e = !0) {
  const t = await Ve("/ugsci/team/custom");
  if (!t.ok) {
    const l = await t.text().catch(() => "");
    throw new Error(l || `HTTP ${t.status}`);
  }
  const n = (await t.json()).map(cr);
  return e && wn(n), n;
}
async function Ma(e) {
  const t = await Ve("/ugsci/team/custom", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(ir(e))
  });
  if (!t.ok) {
    const n = await t.text().catch(() => "");
    throw new Error(n || `HTTP ${t.status}`);
  }
  const a = await t.json();
  return { ...e, id: a.team_id };
}
async function dr(e) {
  const t = await Ve(
    `/ugsci/team/custom/${encodeURIComponent(e)}`,
    { method: "DELETE" }
  );
  if (!t.ok && t.status !== 404) {
    const a = await t.text().catch(() => "");
    throw new Error(a || `HTTP ${t.status}`);
  }
}
async function mr() {
  const e = yt();
  if (e.length === 0) return;
  const t = await on(!1), a = new Set(t.map((n) => n.id));
  await Promise.all(
    e.filter((n) => !a.has(n.id)).map((n) => Ma(n))
  );
}
async function ur(e) {
  var l, r;
  const t = (l = e.body) == null ? void 0 : l.getReader();
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
        const d = n.slice(0, s);
        n = n.slice(s + 2);
        for (const g of d.split(`
`)) {
          if (!g.startsWith("data: ")) continue;
          const f = g.slice(6);
          let c;
          try {
            c = JSON.parse(f);
          } catch {
            continue;
          }
          if (c.error) {
            const m = c.error, u = typeof m == "string" ? m : (m == null ? void 0 : m.message) || "工作流启动失败";
            throw new Error(u);
          }
          if (c.object === "response" || c.type === "response") {
            const m = c.status;
            if (m === "failed" || m === "error") {
              const u = ((r = c.error) == null ? void 0 : r.message) || "工作流启动失败";
              throw new Error(u);
            }
            return;
          }
          if (c.object === "content" || c.type === "message")
            return;
        }
      }
    }
  } finally {
    t.releaseLock();
  }
}
async function pr(e, t, a) {
  const n = `console:default:team-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, l = await Ve("/chats", {
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
  if (!l.ok) {
    const s = await l.text().catch(() => "");
    throw new Error(
      s || `创建会话失败 (HTTP ${l.status})`
    );
  }
  const o = (await l.json()).id, i = await Ve("/console/chat", {
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
  return await ur(i), o;
}
function La(e, t) {
  var l;
  const a = t.replace(/\s+/g, ""), n = e.find(
    (r) => r.name === t || r.name.replace(/\s+/g, "") === a
  );
  return n ? n.id : ((l = e.find(
    (r) => r.name.includes(t) || t.includes(r.name) || r.name.replace(/\s+/g, "").includes(a)
  )) == null ? void 0 : l.id) || null;
}
function Ra() {
  var t;
  const e = (t = window.QwenPaw) == null ? void 0 : t.host;
  if (!e) throw new Error("[ugsci] QwenPaw.host not available");
  return e;
}
async function Sn(e, t, a) {
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
function gr(e, t) {
  return Sn("/ugsci/team/state", e, t);
}
async function fr(e, t) {
  const a = await Ve("/ugsci/team/runs", {
    headers: { "X-Agent-Id": e },
    signal: t
  });
  if (!a.ok)
    throw new Error(`Failed to load team runs: ${a.status}`);
  return await a.json();
}
function na({ activeOnly: e = !1 }) {
  const t = Ra(), a = t.React, { useCallback: n, useEffect: l, useRef: r, useState: o } = a, { Alert: i, Button: s, Card: d, Empty: g, Spin: f, Tag: c, Typography: m } = t.antd, { Text: u, Paragraph: y } = m, h = t.useSelectedAgent ? t.useSelectedAgent() : { id: "default" }, x = (h == null ? void 0 : h.id) || "default", [T, k] = o([]), [M, N] = o(!0), [H, X] = o(!1), j = r(null), R = r(0), W = n(async () => {
    var v;
    (v = j.current) == null || v.abort();
    const P = new AbortController();
    j.current = P;
    const b = ++R.current;
    N(!0);
    try {
      const I = await fr(x, P.signal);
      if (P.signal.aborted || b !== R.current) return;
      k(I), X(!1);
    } catch {
      if (P.signal.aborted || b !== R.current) return;
      X(!0);
    } finally {
      !P.signal.aborted && b === R.current && N(!1);
    }
  }, [x]);
  if (l(() => (W(), () => {
    var P;
    (P = j.current) == null || P.abort(), R.current += 1;
  }), [W]), M) return a.createElement(f);
  if (H)
    return a.createElement(i, {
      type: "warning",
      message: "讨论运行记录加载失败",
      action: a.createElement(s, { size: "small", onClick: () => void W() }, "重试")
    });
  const Q = T.filter(
    (P) => e ? P.status === "active" : P.status !== "active"
  );
  return Q.length === 0 ? a.createElement(g, {
    description: e ? "暂无进行中的专家团讨论" : "暂无历史讨论"
  }) : a.createElement(
    "div",
    { style: { display: "flex", flexDirection: "column", gap: 8 } },
    ...Q.map(
      (P) => a.createElement(
        d,
        { key: P.instance_id, size: "small" },
        a.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 8 } },
          a.createElement(u, { strong: !0 }, P.team_name || P.team_id),
          a.createElement(c, { color: P.status === "completed" ? "green" : P.status === "terminated" ? "orange" : "blue" }, P.status),
          a.createElement(c, null, P.current_phase),
          a.createElement(u, { type: "secondary" }, `迭代 ${P.iteration}`)
        ),
        a.createElement(y, { ellipsis: { rows: 2 }, style: { margin: "8px 0 0" } }, P.task || "暂无任务描述")
      )
    )
  );
}
async function yr() {
  const e = await Sn(
    "/ugsci/team/preset-teams"
  );
  return (e == null ? void 0 : e.teams) ?? null;
}
async function hr() {
  const e = await Sn(
    "/ugsci/team/roles"
  );
  return (e == null ? void 0 : e.roles) ?? null;
}
const Er = {
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
], vr = 3;
function br() {
  const e = Ra(), t = e.React, { useState: a, useEffect: n, useCallback: l, useRef: r } = t, { Card: o, Tag: i, Typography: s, Button: d, Steps: g, Empty: f, Alert: c } = e.antd, { ReloadOutlined: m } = e.antdIcons || {}, { Text: u, Paragraph: y } = s, h = e.useSelectedAgent ? e.useSelectedAgent() : { id: "default" }, x = (h == null ? void 0 : h.id) || "default", [T, k] = a(null), [M, N] = a(!1), H = r(null), X = r(0), j = r(0), R = r(null), W = l(
    async (E) => {
      var q;
      (q = R.current) == null || q.abort();
      const ee = new AbortController();
      R.current = ee;
      const J = ++j.current;
      E && N(!0);
      const _ = await gr(x, ee.signal);
      ee.signal.aborted || J !== j.current || (_ ? (X.current = 0, H.current = _, k(_)) : X.current += 1, N(!1));
    },
    [x]
  ), Q = l(() => W(!0), [W]);
  if (n(() => {
    var ee;
    (ee = R.current) == null || ee.abort(), j.current += 1, X.current = 0, H.current = null, k(null), Q();
    const E = window.setInterval(() => {
      var J, _;
      X.current >= vr || ((J = H.current) == null ? void 0 : J.status) === "completed" || ((_ = H.current) == null ? void 0 : _.status) === "terminated" || W(!1);
    }, 5e3);
    return () => {
      var J;
      window.clearInterval(E), (J = R.current) == null || J.abort(), j.current += 1;
    };
  }, [x, W, Q]), (T == null ? void 0 : T.status) === "unreadable")
    return t.createElement(c, {
      type: "warning",
      showIcon: !0,
      message: "专家团状态暂时无法读取",
      description: `实例 ${T.instance_id || "未知"} 的状态文件需要检查。`,
      style: { marginBottom: 16 },
      action: t.createElement(
        d,
        { size: "small", onClick: Q, loading: M },
        "重试"
      )
    });
  if (!T || !T.active) {
    if ((T == null ? void 0 : T.status) === "completed" || (T == null ? void 0 : T.status) === "terminated") {
      const E = T.status === "completed";
      return t.createElement(c, {
        type: E ? "success" : "info",
        showIcon: !0,
        message: E ? "专家团工作流已完成" : "专家团工作流已终止",
        description: E ? `实例 ${T.instance_id || "未知"} 已完成，结果文件保留在工作区。` : `原因：${T.state.termination_reason || "未知"}`,
        style: { marginBottom: 16 }
      });
    }
    return t.createElement(f, {
      description: "暂无活跃的专家团工作流",
      style: { padding: 24 }
    });
  }
  const P = T.state, b = P.current_phase || "plan", v = aa.indexOf(b), I = P.team_name || "未知团队", C = P.team_mode || "pipeline", B = P.iteration || 0, D = P.members || [], L = P.verify_retries || 0, z = {
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
        t.createElement(u, { strong: !0 }, `${I} — 工作流状态`),
        t.createElement(
          i,
          { color: "blue", style: { fontSize: 10 } },
          z[C] || C
        ),
        t.createElement(
          i,
          { style: { fontSize: 10 } },
          `迭代 ${B}`
        ),
        L > 0 ? t.createElement(
          i,
          { color: "orange", style: { fontSize: 10 } },
          `验证重试 ${L}`
        ) : null
      ),
      extra: t.createElement(
        d,
        {
          size: "small",
          type: "text",
          icon: m ? t.createElement(m) : void 0,
          onClick: Q,
          loading: M
        },
        "刷新"
      )
    },
    t.createElement(g, {
      current: v,
      size: "small",
      items: aa.map((E) => {
        const ee = Er[E];
        return {
          title: `${ee.icon} ${ee.label}`,
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
      ...D.map(
        (E, ee) => t.createElement(
          i,
          { key: `${E.name}-${ee}`, style: { fontSize: 11 } },
          `${E.emoji || ""} ${E.name}（${E.role}）`
        )
      )
    ),
    P.task ? t.createElement(
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
      `任务: ${P.task}`
    ) : null
  );
}
function wr({ team: e }) {
  const t = $().React, { Typography: a, Tag: n } = $().antd, { Text: l } = a, r = {
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
  }, i = e.steps || [], s = e.mode === "roundtable" || e.mode === "router", d = {
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
      l,
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
          flexDirection: s ? "row" : "column",
          gap: 8,
          alignItems: s ? "flex-start" : "stretch",
          flexWrap: "wrap"
        }
      },
      ...i.length > 0 ? i.map((g, f) => [
        f > 0 && !s ? t.createElement(
          "div",
          {
            key: `arrow-${f}`,
            style: {
              textAlign: "center",
              color: o[e.mode],
              fontSize: 14
            }
          },
          r[e.mode]
        ) : null,
        t.createElement(
          "div",
          {
            key: `step-${f}`,
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
          t.createElement(He, {
            name: g.agentName,
            size: 24
          }),
          t.createElement(
            "div",
            null,
            t.createElement(
              l,
              { strong: !0, style: { fontSize: 12 } },
              g.agentName
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
              g.instruction
            ),
            t.createElement(
              n,
              {
                ...g.passContext ? { color: "blue" } : {},
                style: { fontSize: 9, marginTop: 2 }
              },
              g.passContext ? "传递上下文" : "独立"
            )
          )
        )
      ]).flat() : e.members.map((g, f) => [
        f > 0 && !s ? t.createElement(
          "div",
          {
            key: `arrow-${f}`,
            style: {
              textAlign: "center",
              color: o[e.mode],
              fontSize: 14
            }
          },
          r[e.mode]
        ) : null,
        t.createElement(
          "div",
          {
            key: `member-${f}`,
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
          t.createElement(He, {
            name: g.name,
            size: 24
          }),
          t.createElement(
            "div",
            null,
            t.createElement(
              l,
              { strong: !0, style: { fontSize: 12 } },
              g.name
            ),
            t.createElement(
              "div",
              { style: { fontSize: 11, color: "var(--ant-color-text-tertiary, #8c8c8c)" } },
              g.role
            )
          )
        )
      ]).flat()
    )
  );
}
function _t(e) {
  const t = e.replace(/\s+/g, "").toLowerCase();
  return t.includes("测井") ? "log-analyst" : t.includes("地球物理") ? "geophysicist" : t.includes("油藏") ? "reservoir-engineer" : t.includes("钻井") ? "drilling-engineer" : t.includes("采油") || t.includes("生产") ? "production-engineer" : t.includes("pvt") || t.includes("物性") ? "pvt-analyst" : t.includes("审核") || t.includes("verifier") ? "domain-reviewer" : t.includes("master") || t.includes("planner") ? "planner" : "analyst";
}
const Sr = [
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
function xr({
  open: e,
  onClose: t,
  agents: a,
  editingTeam: n,
  onSaved: l
}) {
  const r = $().React, { useState: o, useEffect: i, useCallback: s } = r, {
    Modal: d,
    Input: g,
    Button: f,
    Select: c,
    Tag: m,
    Typography: u,
    Switch: y,
    Empty: h,
    message: x,
    Divider: T,
    Steps: k
  } = $().antd, { PlusOutlined: M, DeleteOutlined: N, SaveOutlined: H, ArrowRightOutlined: X } = $().antdIcons || {}, { Text: j, Paragraph: R } = u, [W, Q] = o(""), [P, b] = o("🤝"), [v, I] = o(""), [C, B] = o("pipeline"), [D, L] = o(""), [z, E] = o(""), [ee, J] = o([]), [_, q] = o([]), [re, Y] = o(!1), [K, ce] = o(2), [O, oe] = o(""), [pe, ie] = o(""), [le, ye] = o({}), [Ee, Ce] = o({}), [Oe, we] = o(
    Sr
  ), ne = [
    { value: "pipeline", icon: "→", title: "顺序交接", description: "上一步产物成为下一位专家的上下文", topology: "A → B → C", accent: "#08979c" },
    { value: "roundtable", icon: "⇉", title: "并行汇聚", description: "独立并行分析，避免观点相互污染", topology: "A ∥ B ∥ C → 汇总", accent: "#531dab" },
    { value: "coordinator", icon: "◎", title: "主管协作", description: "主控专家拆解任务并按需组织成员", topology: "主管 → 专家组", accent: "#0958d9" },
    { value: "router", icon: "◇", title: "智能路由", description: "按任务能力需求选择最小充分专家集合", topology: "任务 → 路由 → 子集", accent: "#d46b08" },
    { value: "review_loop", icon: "↻", title: "评审迭代", description: "产出、独立审查、修订，直到满足标准", topology: "执行 ⇄ 评审", accent: "#389e0d" },
    { value: "debate", icon: "⚖", title: "多方论证", description: "独立立场、交叉质询，再由裁决者综合", topology: "观点 ⇄ 反驳 → 裁决", accent: "#c41d7f" }
  ];
  i(() => {
    e && (n ? (Q(n.name), b(n.emoji), I(n.description), B(n.mode), L(n.coordinatorName || ""), E(n.taskTemplate), J(n.steps || []), q(n.members.map((S) => S.name)), ce(n.maxReviewRounds || 2), oe(n.successCriteria || ""), ie(n.routingInstruction || ""), ye(
      Object.fromEntries(
        n.members.map((S) => [
          S.name,
          S.bindingMode || (S.agentId ? "fixed" : "preferred")
        ])
      )
    ), Ce(
      Object.fromEntries(
        n.members.map((S) => [
          S.name,
          S.roleKey || _t(S.name)
        ])
      )
    )) : (Q(""), b("🤝"), I(""), B("pipeline"), L(""), E(`请执行以下任务：
任务描述：{任务描述}`), J([]), q([]), ce(2), oe(""), ie(""), ye({}), Ce({})));
  }, [e, n]), i(() => {
    e && hr().then((S) => {
      S != null && S.length && we(S);
    });
  }, [e]);
  const Se = s(() => {
    if (C === "roundtable" || C === "debate" || C === "router") {
      const S = _.map((me) => ({
        agentName: me,
        instruction: "请给出你的专业评估意见",
        passContext: !1
      }));
      J(S);
    } else if (C === "pipeline") {
      const S = new Map(ee.map((F) => [F.agentName, F])), me = _.map((F) => S.get(F) || {
        agentName: F,
        instruction: "请完成你的专业部分",
        passContext: !0
      });
      J(me);
    }
  }, [C, _, ee]), he = (S) => {
    _.includes(S) || (q([..._, S]), ye({ ...le, [S]: "fixed" }), Ce({
      ...Ee,
      [S]: _t(S)
    }), (C === "coordinator" || C === "debate") && !D && L(S));
  }, Z = (S) => {
    const me = _.filter((ae) => ae !== S);
    q(me), J(ee.filter((ae) => ae.agentName !== S));
    const F = { ...le };
    delete F[S], ye(F);
    const w = { ...Ee };
    delete w[S], Ce(w), D === S && L(me[0] || "");
  }, de = (S, me, F) => {
    const w = [...ee];
    w[S] = { ...w[S], [me]: F }, J(w);
  }, fe = async () => {
    if (!W.trim()) {
      x.warning("请输入团队名称");
      return;
    }
    if (_.length < 2) {
      x.warning("至少需要选择 2 个成员");
      return;
    }
    if (!z.trim()) {
      x.warning("请输入任务模板");
      return;
    }
    if ((C === "coordinator" || C === "debate") && !D) {
      x.warning(C === "debate" ? "请选择裁决者" : "请选择主控专家");
      return;
    }
    Y(!0);
    try {
      let S = [..._];
      C === "coordinator" && D ? S = [D, ...S.filter((Te) => Te !== D)] : C === "debate" && D && (S = [...S.filter((Te) => Te !== D), D]);
      const me = S.map(
        (Te) => {
          var Ue;
          const Re = a.find((xe) => xe.name === Te), Be = le[Te] || "fixed", Fe = Ee[Te] || _t(Te), We = Oe.find((xe) => xe.key === Fe);
          return {
            name: Te,
            role: (We == null ? void 0 : We.display_name) || ((Ue = Re == null ? void 0 : Re.description) == null ? void 0 : Ue.slice(0, 30)) || "需求分析师",
            emoji: "",
            agentId: Be === "temporary" || Re == null ? void 0 : Re.id,
            roleKey: Fe,
            bindingMode: Be
          };
        }
      );
      let F = ee;
      (ee.length === 0 || ee.length !== _.length) && (F = _.map((Te) => ({
        agentName: Te,
        instruction: "请完成你的专业部分",
        passContext: C === "pipeline"
      })));
      const w = {
        id: (n == null ? void 0 : n.id) || `custom-${Date.now()}`,
        name: W.trim(),
        emoji: P,
        category: "自定义",
        description: v.trim() || `${W.trim()}（${_.length}人团队）`,
        mode: C,
        members: me,
        coordinatorName: C === "coordinator" || C === "debate" ? D : void 0,
        taskTemplate: z.trim(),
        orchestrationPrompt: "",
        // Custom teams use steps-based instructions
        steps: F,
        custom: !0,
        createdAt: (n == null ? void 0 : n.createdAt) || Date.now(),
        maxReviewRounds: K,
        successCriteria: O.trim(),
        routingInstruction: pe.trim()
      }, ae = await Ma(w), ue = yt(), ze = ue.findIndex((Te) => Te.id === ae.id);
      ze >= 0 ? ue[ze] = ae : ue.push(ae), wn(ue), x.success(n ? "团队已更新" : "团队已创建"), l(), t();
    } catch (S) {
      x.error(S.message || "保存失败");
    } finally {
      Y(!1);
    }
  }, V = a.filter(
    (S) => !_.includes(S.name)
  );
  return r.createElement(
    d,
    {
      open: e,
      onCancel: t,
      title: r.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 8 } },
        r.createElement(
          "span",
          { style: { fontSize: 20 } },
          n ? "✏️" : "➕"
        ),
        r.createElement(
          "span",
          null,
          n ? "编辑专家团" : "创建专家团"
        )
      ),
      width: 860,
      onOk: fe,
      okText: "保存专家团",
      confirmLoading: re,
      okButtonProps: {
        icon: H ? r.createElement(H) : void 0
      }
    },
    // Step 1: Basic info
    r.createElement(
      "div",
      { style: { marginBottom: 16 } },
      r.createElement(
        j,
        {
          strong: !0,
          style: { display: "block", marginBottom: 8, fontSize: 13 }
        },
        "1. 定义任务工作流"
      ),
      r.createElement(
        "div",
        { style: { display: "flex", gap: 8, marginBottom: 8, alignItems: "center" } },
        _.length > 0 ? r.createElement(bn, {
          members: _,
          size: 36
        }) : null,
        r.createElement(g, {
          placeholder: "专家团名称（如：储层评价与质量复核专家团）",
          value: W,
          onChange: (S) => Q(S.target.value),
          style: { flex: 1 }
        })
      ),
      r.createElement(g.TextArea, {
        placeholder: "说明这个工作流解决什么问题、适用于什么场景",
        value: v,
        onChange: (S) => I(S.target.value),
        rows: 2,
        style: { marginBottom: 8 }
      }),
      r.createElement(
        j,
        { strong: !0, style: { display: "block", margin: "12px 0 8px", fontSize: 13 } },
        "选择协同模式"
      ),
      r.createElement(
        "div",
        {
          style: {
            display: "grid",
            gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
            gap: 8
          }
        },
        ...ne.map((S) => {
          const me = C === S.value;
          return r.createElement(
            "button",
            {
              key: S.value,
              type: "button",
              onClick: () => {
                B(S.value), S.value !== "coordinator" && S.value !== "debate" && L("");
              },
              style: {
                textAlign: "left",
                padding: 10,
                borderRadius: 8,
                cursor: "pointer",
                background: me ? `${S.accent}0d` : "var(--ant-color-bg-container, #fff)",
                border: `1px solid ${me ? S.accent : "var(--ant-color-border, #d9d9d9)"}`,
                boxShadow: me ? `0 0 0 2px ${S.accent}1a` : "none"
              }
            },
            r.createElement(
              "div",
              { style: { display: "flex", alignItems: "center", gap: 7, color: S.accent, fontWeight: 600 } },
              r.createElement("span", { style: { fontSize: 18 } }, S.icon),
              S.title
            ),
            r.createElement("div", { style: { fontSize: 11, color: "#595959", marginTop: 5, lineHeight: 1.45 } }, S.description),
            r.createElement("div", { style: { fontSize: 10, color: S.accent, marginTop: 5, fontFamily: "monospace" } }, S.topology)
          );
        })
      )
    ),
    r.createElement(T, { style: { margin: "12px 0" } }),
    // Step 2: Select members
    r.createElement(
      "div",
      { style: { marginBottom: 16 } },
      r.createElement(
        j,
        {
          strong: !0,
          style: { display: "block", marginBottom: 8, fontSize: 13 }
        },
        "2. 配置专家角色"
      ),
      // Available agents
      V.length > 0 ? r.createElement(
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
          (S) => r.createElement(
            f,
            {
              key: S.id,
              size: "small",
              icon: M ? r.createElement(M) : void 0,
              onClick: () => he(S.name)
            },
            S.name
          )
        )
      ) : null,
      // Selected members
      _.length === 0 ? r.createElement(h, {
        description: "请从上方添加团队成员",
        image: h.PRESENTED_IMAGE_SIMPLE
      }) : r.createElement(
        "div",
        { style: { display: "flex", flexDirection: "column", gap: 4 } },
        ..._.map(
          (S) => r.createElement(
            "div",
            {
              key: S,
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
            r.createElement(
              "div",
              { style: { display: "flex", alignItems: "center", gap: 6 } },
              r.createElement(He, { name: S, size: 24 }),
              r.createElement(
                j,
                { strong: !0, style: { fontSize: 13 } },
                S
              ),
              (C === "coordinator" || C === "debate") && D === S ? r.createElement(
                m,
                { color: "blue", style: { fontSize: 10 } },
                C === "debate" ? "裁决者" : "主控"
              ) : null
            ),
            r.createElement(
              "div",
              { style: { display: "flex", gap: 4 } },
              r.createElement(c, {
                size: "small",
                value: Ee[S] || _t(S),
                style: { width: 132 },
                onChange: (me) => Ce({ ...Ee, [S]: me }),
                options: Oe.map((me) => ({
                  value: me.key,
                  label: me.display_name
                }))
              }),
              r.createElement(c, {
                size: "small",
                value: le[S] || "fixed",
                style: { width: 118 },
                onChange: (me) => ye({ ...le, [S]: me }),
                options: [
                  { value: "fixed", label: "固定实例" },
                  { value: "preferred", label: "优先实例" },
                  { value: "temporary", label: "临时派生" }
                ]
              }),
              C === "coordinator" || C === "debate" ? r.createElement(
                f,
                {
                  size: "small",
                  type: "link",
                  onClick: () => L(S)
                },
                C === "debate" ? "设为裁决者" : "设为主控"
              ) : null,
              r.createElement(
                f,
                {
                  size: "small",
                  type: "link",
                  danger: !0,
                  icon: N ? r.createElement(N) : void 0,
                  onClick: () => Z(S)
                },
                "移除"
              )
            )
          )
        )
      )
    ),
    C === "review_loop" || C === "router" ? r.createElement(
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
      C === "review_loop" ? r.createElement(
        "div",
        { style: { display: "grid", gridTemplateColumns: "150px 1fr", gap: 10 } },
        r.createElement(c, {
          value: K,
          onChange: (S) => ce(S),
          options: [1, 2, 3, 4, 5].map((S) => ({ value: S, label: `最多 ${S} 轮` }))
        }),
        r.createElement(g, {
          value: O,
          onChange: (S) => oe(S.target.value),
          placeholder: "验收标准，例如：关键结论均有数据依据，且无高风险缺陷"
        })
      ) : r.createElement(g, {
        value: pe,
        onChange: (S) => ie(S.target.value),
        placeholder: "路由偏好，例如：仅调用任务必需的专家；涉及模拟时优先油藏工程师"
      })
    ) : null,
    r.createElement(T, { style: { margin: "12px 0" } }),
    // Step 3: Define execution steps (for pipeline/roundtable)
    _.length > 0 ? r.createElement(
      "div",
      { style: { marginBottom: 16 } },
      r.createElement(
        j,
        {
          strong: !0,
          style: { display: "block", marginBottom: 8, fontSize: 13 }
        },
        `3. 配置专家任务${C === "roundtable" ? "（并行独立）" : C === "pipeline" ? "（顺序交接）" : C === "router" ? "（作为候选能力）" : C === "review_loop" ? "（首位执行、末位评审）" : C === "debate" ? "（末位为裁决者）" : "（由主控动态编排）"}`
      ),
      // Auto-sync button
      r.createElement(
        f,
        {
          size: "small",
          type: "dashed",
          onClick: Se,
          style: { marginBottom: 8 }
        },
        "自动生成步骤"
      ),
      // Steps list
      ee.length === 0 ? r.createElement(
        j,
        { type: "secondary", style: { fontSize: 12 } },
        "点击「自动生成步骤」或手动配置每步的指令"
      ) : r.createElement(
        "div",
        { style: { display: "flex", flexDirection: "column", gap: 6 } },
        ...ee.map(
          (S, me) => r.createElement(
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
            r.createElement(
              "div",
              {
                style: {
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  marginBottom: 6
                }
              },
              C === "pipeline" ? r.createElement(
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
              ) : r.createElement(
                "span",
                { style: { fontSize: 14 } },
                "🔀"
              ),
              r.createElement(
                m,
                { color: "blue", style: { fontSize: 11 } },
                S.agentName
              ),
              r.createElement(
                "div",
                { style: { flex: 1 } },
                r.createElement(g, {
                  placeholder: "请输入该步骤的指令...",
                  value: S.instruction,
                  onChange: (F) => de(me, "instruction", F.target.value),
                  size: "small"
                })
              )
            ),
            r.createElement(
              "div",
              {
                style: {
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  paddingLeft: 28
                }
              },
              r.createElement(y, {
                size: "small",
                checked: S.passContext,
                onChange: (F) => de(me, "passContext", F)
              }),
              r.createElement(
                j,
                { type: "secondary", style: { fontSize: 11 } },
                S.passContext ? "传递上一步结果作为上下文" : "独立执行"
              )
            )
          )
        )
      )
    ) : null,
    r.createElement(T, { style: { margin: "12px 0" } }),
    // Step 4: Task template
    r.createElement(
      "div",
      null,
      r.createElement(
        j,
        {
          strong: !0,
          style: { display: "block", marginBottom: 8, fontSize: 13 }
        },
        `${_.length > 0 ? "4" : "3"}. 任务模板`
      ),
      r.createElement(g.TextArea, {
        placeholder: `输入任务模板，可用 {参数名} 作为占位符...

例如：
请对区块 {区块名} 的井 {井号} 进行储层评价`,
        value: z,
        onChange: (S) => E(S.target.value),
        rows: 4,
        style: { fontFamily: "monospace", fontSize: 13 }
      }),
      r.createElement(
        j,
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
  onDelete: l
}) {
  var b;
  const r = $().React, { useState: o } = r, { Card: i, Tag: s, Typography: d, Button: g, Tooltip: f, Popconfirm: c } = $().antd, {
    TeamOutlined: m,
    RocketOutlined: u,
    UserOutlined: y,
    EditOutlined: h,
    DeleteOutlined: x,
    DownOutlined: T,
    UpOutlined: k
  } = $().antdIcons || {}, { Text: M, Paragraph: N } = d, [H, X] = o(!1), j = {
    coordinator: { label: "主管协作", color: "blue" },
    pipeline: { label: "顺序交接", color: "cyan" },
    roundtable: { label: "并行汇聚", color: "purple" },
    router: { label: "智能路由", color: "orange" },
    review_loop: { label: "评审迭代", color: "green" },
    debate: { label: "多方论证", color: "magenta" }
  }, R = j[e.mode] || j.coordinator, W = e.members.map((v) => {
    const I = v.bindingMode === "temporary", C = I ? null : (v.agentId && t.some((B) => B.id === v.agentId) ? v.agentId : null) || La(t, v.name);
    return { ...v, found: !!C, agentId: C, temporary: I };
  }), Q = W.filter((v) => v.found).length, P = e.coordinatorName || ((b = e.members[0]) == null ? void 0 : b.name);
  return r.createElement(
    i,
    {
      hoverable: !0,
      size: "small",
      style: { height: "100%", display: "flex", flexDirection: "column" }
    },
    // Header: emoji + name + mode tag + custom badge
    r.createElement(
      "div",
      {
        style: {
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 10
        }
      },
      r.createElement(bn, {
        members: e.members.map((v) => v.name),
        size: 36
      }),
      r.createElement(
        "div",
        { style: { flex: 1 } },
        r.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 6 } },
          r.createElement(
            M,
            { strong: !0, style: { fontSize: 14 } },
            e.name
          ),
          e.custom ? r.createElement(
            s,
            { color: "gold", style: { fontSize: 9 } },
            "自定义"
          ) : null
        ),
        r.createElement(
          "div",
          { style: { display: "flex", gap: 4, marginTop: 4 } },
          r.createElement(
            s,
            { color: R.color, style: { fontSize: 10 } },
            R.label
          ),
          r.createElement(
            s,
            { color: "green", style: { fontSize: 10 } },
            `${e.members.length} 位专家`
          ),
          Q < e.members.length ? r.createElement(
            f,
            {
              title: `OMP 架构下，未创建的专家将通过 spawn_subagent 自动派发，
控制器会根据角色 prompt 创建子 agent 执行任务。`
            },
            r.createElement(
              s,
              { color: "blue", style: { fontSize: 10 } },
              "OMP 自动派发"
            )
          ) : r.createElement(
            s,
            { color: "green", style: { fontSize: 10 } },
            "全部就绪"
          )
        )
      ),
      // Edit/delete for custom teams
      e.custom ? r.createElement(
        "div",
        { style: { display: "flex", gap: 2 } },
        n ? r.createElement(
          f,
          { title: "编辑" },
          r.createElement(g, {
            type: "text",
            size: "small",
            icon: h ? r.createElement(h) : void 0,
            onClick: (v) => {
              v.stopPropagation(), n(e);
            }
          })
        ) : null,
        l ? r.createElement(
          f,
          { title: "删除" },
          r.createElement(
            c,
            {
              title: `删除专家团「${e.name}」？`,
              description: "此操作会删除后端定义，但不会删除既有讨论记录。",
              okText: "删除",
              cancelText: "取消",
              okButtonProps: { danger: !0 },
              onConfirm: () => l(e)
            },
            r.createElement(g, {
              type: "text",
              size: "small",
              danger: !0,
              icon: x ? r.createElement(x) : void 0,
              onClick: (v) => v.stopPropagation()
            })
          )
        ) : null
      ) : null
    ),
    // Description
    r.createElement(
      N,
      {
        type: "secondary",
        style: { fontSize: 12, margin: 0, marginBottom: 10, lineHeight: 1.5 },
        ellipsis: { rows: 2 }
      },
      e.description
    ),
    // Member avatars
    r.createElement(
      "div",
      {
        style: {
          display: "flex",
          gap: 6,
          marginBottom: 10,
          flexWrap: "wrap"
        }
      },
      ...W.map(
        (v) => r.createElement(
          f,
          {
            key: v.name,
            title: `${v.name}（${v.role}）${v.temporary ? " - OMP 临时派生" : v.found ? " - 已绑定实例" : " - OMP 按角色派发"}`
          },
          r.createElement(
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
            r.createElement(He, { name: v.name, size: 18 }),
            r.createElement(
              M,
              {
                style: { fontSize: 11, color: v.found ? "#1f4e8c" : "#531dab" }
              },
              v.name
            ),
            v.temporary ? r.createElement(
              s,
              { color: "purple", style: { fontSize: 9, marginInlineEnd: 0 } },
              "派生"
            ) : null
          )
        )
      )
    ),
    // Toggle flow diagram
    r.createElement(
      g,
      {
        type: "link",
        size: "small",
        style: { padding: "0 0 4px 0", fontSize: 11, height: "auto" },
        onClick: (v) => {
          v.stopPropagation(), X(!H);
        },
        icon: H ? k ? r.createElement(k) : "▲" : T ? r.createElement(T) : "▼"
      },
      H ? "收起流程" : "查看执行流程"
    ),
    H ? r.createElement(wr, { team: e }) : null,
    // Footer: launch button
    r.createElement(
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
      r.createElement(
        M,
        { type: "secondary", style: { fontSize: 11 } },
        P ? `${e.mode === "debate" ? "裁决者" : "主控"}: ${P}` : "OMP 动态编排"
      ),
      r.createElement(
        g,
        {
          type: "primary",
          size: "small",
          icon: u ? r.createElement(u) : void 0,
          disabled: t.length === 0,
          onClick: () => a(e),
          style: je
        },
        "运行工作流"
      )
    )
  );
}
function kr({
  agents: e,
  onLaunch: t
}) {
  const a = $().React, { useMemo: n, useState: l, useCallback: r, useEffect: o } = a, {
    Row: i,
    Col: s,
    Input: d,
    Empty: g,
    Typography: f,
    Tag: c,
    Button: m,
    Divider: u,
    Tabs: y,
    message: h
  } = $().antd, { SearchOutlined: x, PlusOutlined: T, RocketOutlined: k } = $().antdIcons || {}, { Text: M } = f, [N, H] = l(""), [X, j] = l([]), [R, W] = l([]), [Q, P] = l(!1), [b, v] = l(null);
  o(() => {
    j(yt());
    let J = !0;
    return (async () => {
      try {
        await mr();
        const _ = await on();
        J && j(_);
      } catch (_) {
        console.warn("[ugsci] Failed to load backend expert teams:", _), J && h.warning("专家团后端同步失败，当前显示本地缓存");
      }
    })(), yr().then((_) => {
      J && _ && W(_);
    }), () => {
      J = !1;
    };
  }, []);
  const I = r(() => {
    on().then(j).catch((J) => {
      console.warn("[ugsci] Failed to refresh expert teams:", J), j(yt());
    });
  }, []), C = r(
    (J) => {
      dr(J.id).then(() => {
        const q = yt().filter((re) => re.id !== J.id);
        wn(q), j(q), h.success(`团队「${J.name}」已删除`);
      }).catch((_) => h.error(_.message || "删除专家团失败"));
    },
    [h]
  ), B = r((J) => {
    v(J), P(!0);
  }, []), D = r(() => {
    v(null), P(!0);
  }, []), L = n(() => [...X, ...R], [X, R]), z = n(() => {
    if (!N.trim()) return L;
    const J = N.toLowerCase();
    return L.filter(
      (_) => _.name.toLowerCase().includes(J) || _.description.toLowerCase().includes(J) || _.category.toLowerCase().includes(J)
    );
  }, [L, N]), E = z.filter((J) => J.custom), ee = z.filter((J) => !J.custom);
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
      a.createElement(d, {
        placeholder: "搜索团队名称、描述或类别...",
        prefix: x ? a.createElement(x) : void 0,
        value: N,
        onChange: (J) => H(J.target.value),
        allowClear: !0,
        style: { flex: "1 1 280px", maxWidth: 400 }
      }),
      a.createElement(
        m,
        {
          type: "primary",
          size: "small",
          icon: T ? a.createElement(T) : void 0,
          onClick: D,
          style: je
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
            label: `预设团队${ee.length ? ` (${ee.length})` : ""}`,
            children: a.createElement(
              "div",
              null,
              ee.length > 0 ? a.createElement(
                i,
                { gutter: [12, 12] },
                ...ee.map(
                  (J) => a.createElement(
                    s,
                    { key: J.id, xs: 24, sm: 12, md: 8 },
                    a.createElement(la, {
                      team: J,
                      agents: e,
                      onLaunch: t
                    })
                  )
                )
              ) : a.createElement(g, {
                description: "未找到匹配的预设团队",
                image: g.PRESENTED_IMAGE_SIMPLE
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
                  (J) => a.createElement(
                    s,
                    { key: J.id, xs: 24, sm: 12, md: 8 },
                    a.createElement(la, {
                      team: J,
                      agents: e,
                      onLaunch: t,
                      onEdit: B,
                      onDelete: C
                    })
                  )
                )
              ) : a.createElement(g, {
                description: "暂无自定义团队，点击「创建专家团」自定义",
                image: g.PRESENTED_IMAGE_SIMPLE
              })
            )
          },
          {
            key: "active",
            label: "进行中的讨论",
            children: a.createElement(
              a.Fragment,
              null,
              a.createElement(br),
              a.createElement(na, { activeOnly: !0 })
            )
          },
          {
            key: "history",
            label: "讨论历史",
            children: a.createElement(na)
          }
        ]
      }
    ),
    // Team Builder Modal
    a.createElement(xr, {
      open: Q,
      onClose: () => {
        P(!1), v(null);
      },
      agents: e,
      editingTeam: b,
      onSaved: I
    })
  );
}
const Cr = [
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
], Tr = 5e3, _r = {
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
function Ir(e) {
  window.history.pushState({}, "", e), window.dispatchEvent(new PopStateEvent("popstate"));
}
function en(e, t) {
  const a = new URLSearchParams();
  e && a.set("flow", e), t && a.set("run", t), Ir(`/flowforge${a.size ? `?${a.toString()}` : ""}`);
}
function zr(e) {
  return e ? new Date(e * 1e3).toLocaleString("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  }) : "—";
}
function Ar(e) {
  if (!e || e <= 0) return "—";
  if (e < 1e3) return `${e}ms`;
  const t = Math.floor(e / 1e3);
  if (t < 60) return `${t}s`;
  const a = Math.floor(t / 60), n = t % 60;
  return `${a}m${n}s`;
}
function $r(e) {
  if (!e) return "";
  const t = Object.keys(e).length;
  if (t === 0) return "";
  const a = Object.values(e).filter(
    (l) => l === "success" || l === "completed" || l === "skipped" || l === "cached"
  ).length, n = Object.values(e).filter(
    (l) => l === "error" || l === "failed"
  ).length;
  return n > 0 ? `${a}/${t} 节点完成 (${n} 失败)` : `${a}/${t} 节点完成`;
}
const It = /* @__PURE__ */ new Set(["running", "queued", "paused", "waiting_human"]);
function Pr() {
  const e = $().React, { useCallback: t, useEffect: a, useRef: n, useState: l } = e, {
    Alert: r,
    Button: o,
    Card: i,
    Col: s,
    Empty: d,
    Input: g,
    Popconfirm: f,
    Row: c,
    Space: m,
    Spin: u,
    Tabs: y,
    Tag: h,
    Tooltip: x,
    Typography: T,
    message: k
  } = $().antd, {
    ApartmentOutlined: M,
    DeleteOutlined: N,
    ReloadOutlined: H,
    RocketOutlined: X,
    PlayCircleOutlined: j,
    StopOutlined: R
  } = $().antdIcons || {}, { Text: W, Paragraph: Q, Title: P } = T, b = $().useSelectedAgent, v = b ? b() : { id: "default" }, I = (v == null ? void 0 : v.id) || "default", [C, B] = l([]), [D, L] = l([]), [z, E] = l([]), [ee, J] = l(!0), [_, q] = l(!0), [re, Y] = l(null), [K, ce] = l(""), [O, oe] = l(""), [pe, ie] = l("templates"), [le, ye] = l(/* @__PURE__ */ new Set()), Ee = n(null), Ce = D.some((w) => It.has(w.status)), Oe = e.useMemo(() => {
    const w = {};
    return C.forEach((ae) => {
      w[ae.id] = ae.name;
    }), w;
  }, [C]), we = e.useMemo(() => {
    const w = {};
    return D.forEach((ae) => {
      It.has(ae.status) && (w[ae.flow_id] = (w[ae.flow_id] || 0) + 1);
    }), w;
  }, [D]), ne = t(async (w = !1) => {
    w || J(!0);
    try {
      const [ae, ue, ze] = await Promise.all([
        se("/flowforge/flows", { bypassCache: !0 }),
        se("/flowforge/runs", { bypassCache: !0 }),
        Ht().catch(() => [])
      ]);
      B(ae), L(ue), E(ze), q(!0);
    } catch (ae) {
      console.warn("[ugsci] FlowForge is unavailable:", ae), q(!1);
    } finally {
      w || J(!1);
    }
  }, []);
  a(() => {
    ne();
  }, [ne]), a(() => {
    if (!_ || !Ce) {
      Ee.current && (clearTimeout(Ee.current), Ee.current = null);
      return;
    }
    return Ee.current = setTimeout(() => {
      ne(!0);
    }, Tr), () => {
      Ee.current && (clearTimeout(Ee.current), Ee.current = null);
    };
  }, [Ce, _, ne]);
  const Se = t(
    async (w) => {
      if (!re) {
        Y(w.key);
        try {
          const ae = await se(
            "/flowforge/generate",
            {
              method: "POST",
              body: JSON.stringify({
                prompt: w.sop,
                name: w.name,
                agent_id: I
              })
            }
          ), ue = {
            ...ae.nodes || {}
          }, ze = Object.entries(ue).filter(([Ue]) => /^step_\d+$/.test(Ue)).sort(([Ue], [xe]) => Number(Ue.slice(5)) - Number(xe.slice(5))), Te = {};
          let Re = 0, Be = 0;
          ze.forEach(([Ue, xe], Le) => {
            const te = w.roleHints[Le] || "", Ae = w.roleKeys[Le] || "analyst", $e = z.find(
              (qe) => `${qe.name} ${qe.id}`.toLowerCase().includes(te.toLowerCase())
            );
            $e ? Re++ : Be++;
            const Me = ($e == null ? void 0 : $e.id) || I, Je = { ...xe.inputs || {} };
            Je.agent_id = Me, ue[Ue] = {
              ...xe,
              inputs: Je,
              metadata: {
                ...xe.metadata || {},
                binding_policy: "fixed_instance",
                role_hint: te,
                role_key: Ae,
                agent_id: Me
              }
            }, Te[Ue] = {
              binding_policy: "fixed_instance",
              role_hint: te,
              role_key: Ae,
              agent_id: Me
            };
          });
          const Fe = {
            ...ae,
            nodes: ue,
            id: `${w.key}-${Date.now()}`,
            name: w.name,
            description: w.description,
            metadata: {
              ...ae.metadata || {},
              domain: "oil-gas",
              template_key: w.key,
              expert_binding_policy: "fixed_instance",
              controller_agent_id: I,
              node_bindings: Te
            }
          };
          await se("/flowforge/flows", {
            method: "POST",
            body: JSON.stringify(Fe)
          });
          const We = ze.length > 0 ? `（${Re} 个专家已匹配，${Be} 个回退到控制器）` : "";
          k.success(`已创建工作流草稿「${w.name}」${We}`), await ne();
        } catch (ae) {
          k.error(ae.message || "创建工作流失败");
        } finally {
          Y(null);
        }
      }
    },
    [z, I, re, ne, k]
  ), he = t(async () => {
    if (!re) {
      if (!O.trim()) {
        k.warning("请先描述工作流步骤和控制要求");
        return;
      }
      Y("natural-language");
      try {
        const w = await se(
          "/flowforge/generate",
          {
            method: "POST",
            body: JSON.stringify({
              prompt: O.trim(),
              name: K.trim(),
              agent_id: I
            })
          }
        ), ae = {
          ...w,
          id: `natural-${Date.now()}`,
          metadata: {
            ...w.metadata || {},
            domain: "oil-gas",
            source: "natural-language",
            expert_binding_policy: "fixed_instance",
            controller_agent_id: I
          }
        };
        await se("/flowforge/flows", {
          method: "POST",
          body: JSON.stringify(ae)
        }), k.success("已从自然语言生成可编辑工作流草稿"), ce(""), oe(""), await ne();
      } catch (w) {
        k.error(w.message || "自然语言生成失败");
      } finally {
        Y(null);
      }
    }
  }, [I, re, ne, k, K, O]), Z = t(
    async (w, ae) => {
      try {
        await se(`/flowforge/flows/${encodeURIComponent(w)}/run`, {
          method: "POST",
          body: JSON.stringify({ inputs: {} })
        }), k.success(`已启动工作流「${ae}」`), await ne(!0);
      } catch (ue) {
        k.error(ue.message || "启动工作流失败");
      }
    },
    [ne, k]
  ), de = t(
    async (w, ae) => {
      try {
        await se(`/flowforge/flows/${encodeURIComponent(w)}`, {
          method: "DELETE"
        }), k.success(`已删除工作流「${ae}」`), await ne();
      } catch (ue) {
        k.error(ue.message || "删除工作流失败");
      }
    },
    [ne, k]
  ), fe = t(
    async (w) => {
      ye((ae) => {
        const ue = new Set(ae);
        return ue.add(w), ue;
      });
      try {
        await se(`/flowforge/runs/${encodeURIComponent(w)}/cancel`, {
          method: "POST"
        }), k.success("已请求取消运行"), await ne(!0);
      } catch (ae) {
        k.error(ae.message || "取消运行失败");
      } finally {
        ye((ae) => {
          const ue = new Set(ae);
          return ue.delete(w), ue;
        });
      }
    },
    [ne, k]
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
        e.createElement(g, {
          value: K,
          onChange: (w) => ce(w.target.value),
          placeholder: "工作流名称（可选）",
          maxLength: 80
        }),
        e.createElement(g.TextArea, {
          value: O,
          onChange: (w) => oe(w.target.value),
          placeholder: "例如：先检查某储气库本周期压力和注采量数据，再由油藏工程师预测下周期能力，由独立完整性专家复核风险，最后形成带证据和不确定性的建议。",
          autoSize: { minRows: 3, maxRows: 8 }
        }),
        e.createElement(
          o,
          {
            type: "primary",
            onClick: () => void he(),
            loading: re === "natural-language",
            disabled: !_ || !!re,
            style: je
          },
          "生成可编辑草稿"
        )
      )
    ),
    e.createElement(
      c,
      { gutter: [12, 12] },
      ...Cr.map(
        (w) => e.createElement(
          s,
          { key: w.key, xs: 24, md: 8 },
          e.createElement(
            i,
            { style: { height: "100%" } },
            e.createElement(
              m,
              { align: "start", style: { width: "100%" } },
              e.createElement("span", { style: { fontSize: 28 } }, w.icon),
              e.createElement(
                "div",
                { style: { flex: 1 } },
                e.createElement(P, { level: 5, style: { margin: 0 } }, w.name),
                e.createElement(h, { color: "blue", style: { marginTop: 6 } }, w.category),
                e.createElement(
                  Q,
                  { type: "secondary", style: { margin: "10px 0 14px" } },
                  w.description
                ),
                e.createElement(
                  o,
                  {
                    type: "primary",
                    loading: re === w.key,
                    disabled: !_ || !!re,
                    onClick: () => void Se(w),
                    style: je
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
        c,
        { gutter: [12, 12] },
        ...[
          ["固定实例", "生产关键节点使用指定且已验证的专家实例", "当前可执行"],
          ["优先实例", "定义中记录首选实例和治理降级策略", "规划中"],
          ["模板派生", "由 OMP 控制节点按角色模板临时创建隔离角色", "规划中"],
          ["动态路由", "按能力、健康、权限和成本选择实例", "规划中"]
        ].map(
          ([w, ae, ue]) => e.createElement(
            s,
            { key: w, xs: 24, sm: 12, lg: 6 },
            e.createElement(W, { strong: !0 }, w),
            e.createElement(
              h,
              {
                color: ue === "当前可执行" ? "green" : "default",
                style: { marginLeft: 6, fontSize: 10 }
              },
              ue
            ),
            e.createElement("div", { style: { color: "var(--ant-color-text-tertiary, #8c8c8c)", fontSize: 12, marginTop: 4 } }, ae)
          )
        )
      )
    )
  ), S = ee ? e.createElement(u) : C.length === 0 ? e.createElement(d, { description: "暂无工作流，可从模板创建" }) : e.createElement(
    c,
    { gutter: [12, 12] },
    ...C.map((w) => {
      const ae = we[w.id] || 0;
      return e.createElement(
        s,
        { key: w.id, xs: 24, md: 12, xl: 8 },
        e.createElement(
          i,
          {
            size: "small",
            title: e.createElement(
              m,
              { size: 6 },
              e.createElement("span", null, w.name),
              ae > 0 ? e.createElement(
                h,
                { color: "blue" },
                `${ae} 个运行中`
              ) : null
            ),
            extra: e.createElement(h, null, `v${w.version}`)
          },
          e.createElement(Q, { ellipsis: { rows: 2 } }, w.description || "暂无描述"),
          e.createElement(
            m,
            { size: 8, wrap: !0 },
            e.createElement(h, { color: "geekblue" }, `${w.node_count} 个节点`),
            e.createElement(o, {
              size: "small",
              type: "primary",
              icon: j ? e.createElement(j) : void 0,
              disabled: !_,
              onClick: () => void Z(w.id, w.name)
            }, "运行"),
            e.createElement(o, {
              size: "small",
              onClick: () => en(w.id)
            }, "编辑"),
            e.createElement(
              f,
              {
                title: "确认删除",
                description: `确定要删除工作流「${w.name}」吗？此操作不可撤销。`,
                onConfirm: () => void de(w.id, w.name),
                okText: "删除",
                cancelText: "取消",
                okButtonProps: { danger: !0 }
              },
              e.createElement(o, {
                size: "small",
                danger: !0,
                icon: N ? e.createElement(N) : void 0
              }, "删除")
            )
          )
        )
      );
    })
  ), me = ee ? e.createElement(u) : D.length === 0 ? e.createElement(d, { description: "暂无工作流运行记录" }) : e.createElement(
    "div",
    { style: { display: "flex", flexDirection: "column", gap: 8 } },
    ...D.map((w) => {
      const ae = Oe[w.flow_id] || w.flow_id, ue = It.has(w.status), ze = $r(w.node_statuses), Te = w.duration_ms && w.duration_ms > 0 ? w.duration_ms : w.finished_at && w.started_at ? (w.finished_at - w.started_at) * 1e3 : ue && w.started_at ? (Date.now() / 1e3 - w.started_at) * 1e3 : 0;
      return e.createElement(
        i,
        { key: w.run_id, size: "small" },
        e.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" } },
          e.createElement(
            h,
            { color: _r[w.status] || "default" },
            w.status
          ),
          e.createElement(W, { strong: !0 }, ae),
          e.createElement(
            x,
            { title: w.run_id },
            e.createElement(
              W,
              { type: "secondary", style: { fontFamily: "monospace", fontSize: 11 } },
              w.run_id.slice(0, 8) + "…"
            )
          ),
          e.createElement(
            W,
            { type: "secondary", style: { fontSize: 12 } },
            zr(w.started_at)
          ),
          Te > 0 ? e.createElement(
            W,
            { type: "secondary", style: { fontSize: 12 } },
            `耗时 ${Ar(Te)}`
          ) : null,
          ze ? e.createElement(h, { color: "geekblue", style: { fontSize: 11 } }, ze) : null,
          w.error ? e.createElement(
            x,
            { title: w.error },
            e.createElement(W, { type: "danger", style: { fontSize: 12 } }, "（有错误）")
          ) : null,
          e.createElement(
            "div",
            { style: { marginLeft: "auto", display: "flex", gap: 6 } },
            ue ? e.createElement(
              f,
              {
                title: "确认取消运行？",
                onConfirm: () => void fe(w.run_id),
                okText: "取消运行",
                cancelText: "保留",
                okButtonProps: { danger: !0 }
              },
              e.createElement(o, {
                size: "small",
                danger: !0,
                loading: le.has(w.run_id),
                icon: R ? e.createElement(R) : void 0
              }, "取消运行")
            ) : null,
            e.createElement(
              o,
              { size: "small", type: "link", onClick: () => en(void 0, w.run_id) },
              "查看详情"
            )
          )
        )
      );
    })
  ), F = e.createElement(
    m,
    null,
    e.createElement(o, {
      icon: H ? e.createElement(H) : void 0,
      onClick: () => void ne(),
      loading: ee
    }, "刷新"),
    pe !== "templates" ? e.createElement(o, {
      type: "primary",
      icon: M ? e.createElement(M) : X ? e.createElement(X) : void 0,
      onClick: () => en(),
      disabled: !_,
      style: je
    }, "打开流程编辑器") : null
  );
  return e.createElement(
    "div",
    null,
    _ ? null : e.createElement(r, {
      type: "warning",
      message: "FlowForge 引擎未启动",
      description: "协作工作流功能需要 FlowForge 后端引擎支持。请检查后端是否正常运行，或联系管理员。",
      showIcon: !0,
      style: { marginBottom: 16 }
    }),
    e.createElement(y, {
      items: [
        { key: "templates", label: "工作流模板", children: V },
        { key: "mine", label: `我的工作流 (${C.length})`, children: S },
        {
          key: "runs",
          label: e.createElement(
            "span",
            null,
            "运行中心 (",
            D.length,
            Ce ? e.createElement(
              "span",
              { style: { color: "#1677ff", marginLeft: 2 } },
              `·${D.filter((w) => It.has(w.status)).length} 活跃`
            ) : null,
            ")"
          ),
          children: me
        }
      ],
      activeKey: pe,
      onChange: (w) => ie(w),
      tabBarExtraContent: F
    })
  );
}
function ra(e, t) {
  var l, r;
  const a = e.coordinatorName || ((l = e.members[0]) == null ? void 0 : l.name), n = e.members.find((o) => o.name === a) || e.members[0];
  if ((n == null ? void 0 : n.bindingMode) !== "temporary" && (n != null && n.agentId) && t.some((o) => o.id === n.agentId))
    return n.agentId;
  if (a && (n == null ? void 0 : n.bindingMode) !== "temporary") {
    const o = La(t, a);
    if (o) return o;
  }
  return (n == null ? void 0 : n.bindingMode) === "fixed" ? null : ((r = t[0]) == null ? void 0 : r.id) || null;
}
function oa() {
  const e = new URLSearchParams(window.location.search).get("section");
  return e === "teams" || e === "workflows" ? e : "experts";
}
function Or() {
  var de, fe;
  const e = $().React, { useState: t, useEffect: a, useCallback: n, useMemo: l } = e, {
    Spin: r,
    Empty: o,
    Input: i,
    Button: s,
    message: d,
    Row: g,
    Col: f,
    Tabs: c,
    Modal: m,
    Typography: u
  } = $().antd, {
    ReloadOutlined: y,
    PlusOutlined: h,
    SearchOutlined: x,
    TeamOutlined: T,
    UserOutlined: k
  } = $().antdIcons || {}, { Text: M, Paragraph: N } = u, [H, X] = t([]), [j, R] = t(!0), [W, Q] = t(!1), [P, b] = t(null), [v, I] = t(""), [C, B] = t(!1), [D, L] = t(oa), [z, E] = t(
    null
  ), [ee, J] = t(""), [_, q] = t(!1), [re, Y] = t(!1), [K, ce] = t(null), [O, oe] = t([]), pe = n(async () => {
    R(!0);
    try {
      const V = await Ht(), S = await Promise.all(
        V.map(async (me) => {
          try {
            const [F, w, ae] = await Promise.all([
              fn(me.id).catch(() => null),
              Jt(me.id).catch(() => []),
              En(me.id).catch(() => [])
            ]);
            return {
              agent: me,
              config: F,
              skills: w,
              mcps: ae,
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
      X(S), oe(V);
    } catch (V) {
      d.error(V.message || "加载专家列表失败"), X([]);
    } finally {
      R(!1);
    }
  }, []);
  a(() => {
    pe();
  }, [pe]), a(() => {
    const V = () => L(oa());
    return window.addEventListener("popstate", V), () => window.removeEventListener("popstate", V);
  }, []), a(() => {
    if (K && re) {
      const V = H.find(
        (S) => S.agent.id === K.agent.id
      );
      V && V !== K && ce(V);
    }
  }, [H, K, re]);
  const ie = n(
    async (V) => {
      var w;
      const S = V.coordinatorName || ((w = V.members[0]) == null ? void 0 : w.name), me = ra(V, O);
      if (!me) {
        const ae = V.members.find(
          (ue) => ue.name === S
        );
        d.error(
          (ae == null ? void 0 : ae.bindingMode) === "fixed" ? `固定协调者「${S || "协调者"}」当前不可用，请修复绑定后再运行` : "没有可用的 Agent 作为工作流控制器"
        );
        return;
      }
      if (/\{.+?\}/.test(V.taskTemplate)) {
        J(V.taskTemplate), E(V);
        return;
      }
      await le(V, me, V.taskTemplate);
    },
    [O, d]
  ), le = n(
    async (V, S, me) => {
      q(!0);
      try {
        const F = me || V.taskTemplate, w = V.custom ? `@${V.id}` : V.name, ae = `/ugsci-team ${V.mode} ${w} ${F}`, ue = $();
        ue.setSelectedAgent && ue.setSelectedAgent(S);
        const ze = await pr(
          S,
          ae,
          V.name
        );
        d.success(
          `OMP 工作流已启动：${V.name}（${V.mode}模式）`
        ), E(null), ye(`/chat/${ze}`);
      } catch (F) {
        d.error(F.message || "发起团队任务失败");
      } finally {
        q(!1);
      }
    },
    [d]
  ), ye = (V) => {
    window.history.pushState({}, "", V), window.dispatchEvent(new PopStateEvent("popstate"));
  }, Ee = n((V) => {
    b(V), Q(!0);
  }, []), Ce = n((V) => {
    ce(V), Y(!0);
  }, []), Oe = n(
    (V) => {
      if (!V.agent.enabled) {
        d.warning(`专家「${V.agent.name}」未启用，请先启用`);
        return;
      }
      try {
        const S = $();
        S.setSelectedAgent && S.setSelectedAgent(V.agent.id);
      } catch (S) {
        console.warn("[ugsci] Failed to set selected agent:", S);
      }
      d.success(`已召唤专家「${V.agent.name}」，正在跳转至对话...`), ye("/chat");
    },
    [d]
  ), we = l(() => {
    if (!v.trim()) return H;
    const V = v.toLowerCase();
    return H.filter(
      (S) => {
        var me;
        return S.agent.name.toLowerCase().includes(V) || ((me = S.agent.description) == null ? void 0 : me.toLowerCase().includes(V)) || S.agent.id.toLowerCase().includes(V) || S.skills.some((F) => F.name.toLowerCase().includes(V));
      }
    );
  }, [H, v]), ne = H.filter((V) => V.agent.enabled).length, Se = H.reduce(
    (V, S) => V + S.skills.filter((me) => me.enabled !== !1).length,
    0
  ), he = H.reduce((V, S) => V + S.mcps.length, 0), Z = [
    {
      key: "experts",
      label: e.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        k ? e.createElement(k, { style: { fontSize: 14 } }) : null,
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
            prefix: x ? e.createElement(x) : void 0,
            value: v,
            onChange: (V) => I(V.target.value),
            allowClear: !0,
            style: { flex: "1 1 280px", maxWidth: 400 }
          }),
          e.createElement(
            s,
            {
              type: "primary",
              icon: h ? e.createElement(h) : void 0,
              onClick: () => B(!0),
              style: je
            },
            "创建专家"
          )
        ),
        // Content
        j ? e.createElement(
          "div",
          { style: { textAlign: "center", padding: 60 } },
          e.createElement(r, { size: "large" })
        ) : we.length === 0 ? e.createElement(o, {
          description: v ? "未找到匹配的专家" : "暂无专家，点击「创建专家」添加"
        }) : e.createElement(
          g,
          { gutter: [12, 12], align: "stretch" },
          ...we.map(
            (V) => e.createElement(
              f,
              {
                key: V.agent.id,
                xs: 24,
                sm: 12,
                md: 8,
                lg: 6,
                style: { display: "flex" }
              },
              e.createElement(nr, {
                expert: V,
                onClick: () => Ee(V),
                onSummon: () => Oe(V),
                onConfigure: () => Ce(V)
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
        T ? e.createElement(T, { style: { fontSize: 14 } }) : null,
        "专家团"
      ),
      children: e.createElement(kr, {
        agents: O,
        onLaunch: ie
      })
    },
    {
      key: "workflows",
      label: e.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        (de = $().antdIcons) != null && de.ApartmentOutlined ? e.createElement($().antdIcons.ApartmentOutlined, {
          style: { fontSize: 14 }
        }) : null,
        "协作工作流"
      ),
      children: e.createElement(Pr)
    }
  ];
  return e.createElement(
    "div",
    { style: { padding: 24 } },
    e.createElement(Wt, {
      title: "专家·协作",
      subtitle: D === "experts" ? `共 ${H.length} 位专家（${ne} 位启用）· ${Se} 个技能 · ${he} 个 MCP 客户端` : D === "teams" ? "开放式多专家讨论、联合研判与 OMP 动态协作" : "流程化、可观测、可验证的油气与储气库协作流程",
      extra: e.createElement(
        e.Fragment,
        null,
        D === "experts" ? e.createElement(
          s,
          {
            icon: y ? e.createElement(y) : void 0,
            onClick: () => {
              wt(), pe();
            },
            loading: j
          },
          "刷新"
        ) : null
      )
    }),
    e.createElement(c, {
      items: Z,
      activeKey: D,
      onChange: (V) => {
        L(V);
        const S = new URL(window.location.href);
        V === "experts" ? S.searchParams.delete("section") : S.searchParams.set("section", V), window.history.pushState({}, "", `${S.pathname}${S.search}`);
      }
    }),
    // Drawer
    e.createElement(ar, {
      expert: P,
      open: W,
      onClose: () => Q(!1),
      onRefresh: () => pe()
    }),
    // Template Modal
    e.createElement(lr, {
      open: C,
      onClose: () => B(!1),
      onCreated: () => pe()
    }),
    // Config Modal (gear icon)
    e.createElement(Zl, {
      expert: K,
      open: re,
      onClose: () => Y(!1),
      onRefresh: () => pe()
    }),
    // Team Launch Modal (for filling placeholders)
    z ? e.createElement(
      m,
      {
        open: !0,
        title: e.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 8 } },
          e.createElement(bn, {
            members: z.members.map((V) => V.name),
            size: 28
          }),
          e.createElement(
            "span",
            null,
            `发起团队任务 - ${z.name}`
          )
        ),
        onCancel: () => E(null),
        onOk: () => {
          const V = ra(
            z,
            O
          );
          if (!V) {
            d.error("固定协调者不可用或没有可用的控制器 Agent");
            return;
          }
          const S = ee.trim() || z.taskTemplate;
          le(z, V, S);
        },
        confirmLoading: _,
        okText: "发起任务",
        width: 600
      },
      e.createElement(
        "div",
        null,
        e.createElement(
          M,
          {
            type: "secondary",
            style: { fontSize: 12, display: "block", marginBottom: 8 }
          },
          "任务内容（请替换 {参数名} 等占位符后发起）："
        ),
        e.createElement(i.TextArea, {
          value: ee,
          onChange: (V) => J(V.target.value),
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
          M,
          { style: { fontSize: 12, color: "#0958d9" } },
          `协调者: ${z.coordinatorName || ((fe = z.members[0]) == null ? void 0 : fe.name) || "—"} · 成员: ${z.members.map((V) => V.name).join("、")}`
        )
      )
    ) : null
  );
}
function Mr({
  agentId: e,
  agentName: t,
  refreshKey: a = 0,
  onNavigate: n
}) {
  const l = $().React, { useState: r, useEffect: o, useCallback: i } = l, {
    Spin: s,
    Empty: d,
    Button: g,
    Row: f,
    Col: c,
    Card: m,
    Tag: u,
    Checkbox: y,
    Modal: h,
    Typography: x,
    Drawer: T,
    Descriptions: k,
    message: M
  } = $().antd, {
    ReloadOutlined: N,
    ThunderboltOutlined: H,
    SettingOutlined: X,
    CheckSquareOutlined: j,
    EyeOutlined: R,
    EyeInvisibleOutlined: W,
    DeleteOutlined: Q,
    CloseOutlined: P
  } = $().antdIcons || {}, { Text: b, Paragraph: v } = x, [I, C] = r([]), [B, D] = r(!0), [L, z] = r(!1), [E, ee] = r(null), [J, _] = r(!1), [q, re] = r(
    /* @__PURE__ */ new Set()
  ), [Y, K] = r(!1), [ce, O] = r(null), [oe, pe] = r(!1), ie = i(async () => {
    if (e) {
      D(!0);
      try {
        const Z = await Jt(e);
        C(Z);
      } catch (Z) {
        M.error(Z.message || "加载技能失败"), C([]);
      } finally {
        D(!1);
      }
    }
  }, [e]);
  o(() => {
    ie();
  }, [ie, a]);
  const le = (Z) => {
    re((de) => {
      const fe = new Set(de);
      return fe.has(Z) ? fe.delete(Z) : fe.add(Z), fe;
    });
  }, ye = () => re(/* @__PURE__ */ new Set()), Ee = () => re(new Set(I.map((Z) => Z.name))), Ce = () => {
    J ? (ye(), _(!1)) : _(!0);
  }, Oe = async () => {
    const Z = Array.from(q);
    if (Z.length !== 0) {
      K(!0);
      try {
        const { results: de } = await $l(e, Z), fe = Object.entries(de).filter(
          ([, S]) => S.success === !1
        ), V = Z.length - fe.length;
        fe.length > 0 ? M.warning(
          `批量启用完成：成功 ${V} 个，失败 ${fe.length} 个`
        ) : M.success(`成功启用 ${Z.length} 个技能`), ye(), await ie();
      } catch (de) {
        M.error(de.message || "批量启用失败");
      } finally {
        K(!1);
      }
    }
  }, we = async () => {
    const Z = Array.from(q);
    if (Z.length !== 0) {
      K(!0);
      try {
        const { results: de } = await Pl(e, Z), fe = Object.entries(de).filter(
          ([, S]) => S.success === !1
        ), V = Z.length - fe.length;
        fe.length > 0 ? M.warning(
          `批量停用完成：成功 ${V} 个，失败 ${fe.length} 个`
        ) : M.success(`成功停用 ${Z.length} 个技能`), ye(), await ie();
      } catch (de) {
        M.error(de.message || "批量停用失败");
      } finally {
        K(!1);
      }
    }
  }, ne = () => {
    const Z = Array.from(q);
    Z.length !== 0 && h.confirm({
      title: `确认删除 ${Z.length} 个技能？`,
      content: "删除后技能将从当前专家工作区移除，此操作不可撤销。技能池中的原始技能不受影响。",
      okText: "确认删除",
      cancelText: "取消",
      okButtonProps: { danger: !0 },
      onOk: async () => {
        K(!0);
        try {
          const { results: de } = await Ol(e, Z), fe = Object.entries(de).filter(
            ([, S]) => S.success === !1
          ), V = Z.length - fe.length;
          fe.length > 0 ? M.warning(
            `批量删除完成：成功 ${V} 个，失败 ${fe.length} 个`
          ) : M.success(`成功删除 ${Z.length} 个技能`), ye(), await ie();
        } catch (de) {
          M.error(de.message || "批量删除失败");
        } finally {
          K(!1);
        }
      }
    });
  }, Se = async (Z) => {
    pe(!0);
    try {
      Z.enabled === !1 ? (await Ca(e, Z.name), M.success(`已启用技能「${Z.name}」`)) : (await _a(e, Z.name), M.success(`已禁用技能「${Z.name}」`)), await ie();
    } catch (de) {
      M.error(de.message || "操作失败");
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
          await hn(e, Z.name), M.success(`已删除技能「${Z.name}」`), await ie();
        } catch (de) {
          M.error(de.message || "删除失败");
        } finally {
          pe(!1);
        }
      }
    });
  };
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
          marginBottom: 16,
          flexWrap: "wrap",
          gap: 8
        }
      },
      l.createElement(
        b,
        { type: "secondary", style: { fontSize: 13 } },
        J ? `已选择 ${q.size} / ${I.length} 个技能` : `共 ${I.length} 个技能`
      ),
      l.createElement(
        "div",
        { style: { display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" } },
        J ? l.createElement(
          l.Fragment,
          null,
          l.createElement(
            g,
            { size: "small", onClick: Ee },
            "全选"
          ),
          l.createElement(
            g,
            {
              size: "small",
              icon: P ? l.createElement(P) : void 0,
              onClick: ye
            },
            "取消选择"
          ),
          l.createElement(
            g,
            {
              size: "small",
              type: "default",
              icon: R ? l.createElement(R) : void 0,
              disabled: q.size === 0 || Y,
              loading: Y,
              onClick: Oe
            },
            "批量启用"
          ),
          l.createElement(
            g,
            {
              size: "small",
              danger: !0,
              icon: W ? l.createElement(W) : void 0,
              disabled: q.size === 0 || Y,
              loading: Y,
              onClick: we
            },
            "批量停用"
          ),
          l.createElement(
            g,
            {
              size: "small",
              danger: !0,
              icon: Q ? l.createElement(Q) : void 0,
              disabled: q.size === 0 || Y,
              loading: Y,
              onClick: ne
            },
            `删除 (${q.size})`
          ),
          l.createElement(
            g,
            {
              size: "small",
              type: "primary",
              onClick: Ce
            },
            "退出批量"
          )
        ) : l.createElement(
          l.Fragment,
          null,
          l.createElement(
            g,
            {
              size: "small",
              icon: j ? l.createElement(j) : void 0,
              onClick: Ce,
              disabled: I.length === 0
            },
            "批量管理"
          ),
          l.createElement(
            g,
            {
              icon: N ? l.createElement(N) : void 0,
              onClick: () => {
                wt(), ie();
              }
            },
            "刷新"
          )
        )
      )
    ),
    B ? l.createElement(
      "div",
      { style: { textAlign: "center", padding: 60 } },
      l.createElement(s, { size: "large" })
    ) : I.length === 0 ? l.createElement(d, {
      description: "当前智能体未加载任何技能"
    }) : l.createElement(
      f,
      { gutter: [12, 12] },
      ...I.map(
        (Z) => l.createElement(
          c,
          { key: Z.name, xs: 24, sm: 12, md: 8, lg: 6 },
          l.createElement(
            m,
            {
              hoverable: !0,
              size: "small",
              style: {
                cursor: J ? "default" : "pointer",
                height: "100%",
                position: "relative",
                borderColor: J && q.has(Z.name) ? "#0072f5" : void 0,
                borderWidth: J && q.has(Z.name) ? 2 : 1
              },
              onClick: () => {
                J ? le(Z.name) : (ee(Z), z(!0));
              },
              onMouseEnter: () => {
                J || O(Z.name);
              },
              onMouseLeave: () => O(null)
            },
            J ? l.createElement(
              "div",
              {
                style: {
                  position: "absolute",
                  top: 8,
                  right: 8,
                  zIndex: 1
                },
                onClick: (de) => {
                  de.stopPropagation(), le(Z.name);
                }
              },
              l.createElement(y, {
                checked: q.has(Z.name)
              })
            ) : null,
            l.createElement(
              "div",
              {
                style: {
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 8
                }
              },
              Z.emoji ? l.createElement(
                "span",
                { style: { fontSize: 18 } },
                Z.emoji
              ) : l.createElement(
                "span",
                { style: { fontSize: 18 } },
                "⚡"
              ),
              l.createElement(
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
              Z.enabled === !1 ? l.createElement(
                u,
                { color: "default", style: { fontSize: 10 } },
                "已禁用"
              ) : l.createElement(
                u,
                { color: "green", style: { fontSize: 10 } },
                "已启用"
              )
            ),
            Z.description ? l.createElement(
              v,
              {
                type: "secondary",
                style: { fontSize: 11, margin: 0, lineHeight: 1.4 },
                ellipsis: { rows: 2 }
              },
              Z.description
            ) : null,
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
              Z.version_text ? l.createElement(
                u,
                { style: { fontSize: 10 } },
                `v${Z.version_text}`
              ) : null,
              ...(Z.tags || []).slice(0, 3).map(
                (de, fe) => l.createElement(
                  u,
                  { key: fe, color: "blue", style: { fontSize: 10 } },
                  de
                )
              )
            ),
            // Hover action footer (not in batch mode)
            !J && ce === Z.name ? l.createElement(
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
              l.createElement(
                g,
                {
                  size: "small",
                  type: "default",
                  icon: Z.enabled === !1 ? R ? l.createElement(R) : void 0 : W ? l.createElement(W) : void 0,
                  disabled: oe,
                  onClick: (de) => {
                    de.stopPropagation(), Se(Z);
                  }
                },
                Z.enabled === !1 ? "启用" : "禁用"
              ),
              l.createElement(
                g,
                {
                  size: "small",
                  danger: !0,
                  icon: Q ? l.createElement(Q) : void 0,
                  disabled: oe,
                  onClick: (de) => {
                    de.stopPropagation(), he(Z);
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
    E ? l.createElement(
      T,
      {
        title: l.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 8 } },
          l.createElement(
            "span",
            { style: { fontSize: 18 } },
            E.emoji || "⚡"
          ),
          l.createElement("span", null, E.name)
        ),
        open: L,
        onClose: () => z(!1),
        width: 520,
        extra: l.createElement(
          g,
          {
            type: "primary",
            size: "small",
            icon: X ? l.createElement(X) : void 0,
            onClick: () => n("/skills")
          },
          "管理技能"
        )
      },
      l.createElement(
        k,
        { column: 1, bordered: !0, size: "small" },
        l.createElement(
          k.Item,
          { label: "技能名称" },
          E.name
        ),
        l.createElement(
          k.Item,
          { label: "描述" },
          E.description || "-"
        ),
        E.version_text ? l.createElement(
          k.Item,
          { label: "版本" },
          E.version_text
        ) : null,
        l.createElement(
          k.Item,
          { label: "来源" },
          E.source || "-"
        ),
        l.createElement(
          k.Item,
          { label: "状态" },
          E.enabled === !1 ? "已禁用" : "已启用"
        ),
        E.installed_from ? l.createElement(
          k.Item,
          { label: "安装来源" },
          E.installed_from
        ) : null
      ),
      // Tags
      E.tags && E.tags.length > 0 ? l.createElement(
        "div",
        { style: { marginTop: 16 } },
        l.createElement(
          b,
          {
            strong: !0,
            style: { display: "block", marginBottom: 8 }
          },
          "标签"
        ),
        l.createElement(
          "div",
          { style: { display: "flex", flexWrap: "wrap", gap: 4 } },
          ...E.tags.map(
            (Z, de) => l.createElement(u, { key: de, color: "blue" }, Z)
          )
        )
      ) : null,
      // Skill content preview
      E.content ? l.createElement(
        "div",
        { style: { marginTop: 16 } },
        l.createElement(
          b,
          {
            strong: !0,
            style: { display: "block", marginBottom: 8 }
          },
          "技能内容"
        ),
        l.createElement(
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
function Lr({
  poolSkills: e,
  workspaceSkills: t,
  agents: a,
  loading: n,
  onReload: l,
  onSkillInstalled: r,
  agentId: o,
  agentName: i
}) {
  const s = $().React, { useState: d, useMemo: g, useCallback: f, useEffect: c, useRef: m } = s, {
    Spin: u,
    Empty: y,
    Input: h,
    Button: x,
    Row: T,
    Col: k,
    Card: M,
    Tag: N,
    Typography: H,
    Drawer: X,
    Descriptions: j,
    List: R,
    Modal: W,
    message: Q
  } = $().antd, {
    ReloadOutlined: P,
    SearchOutlined: b,
    DownloadOutlined: v,
    ThunderboltOutlined: I,
    DeleteOutlined: C,
    PlusOutlined: B
  } = $().antdIcons || {}, { Text: D, Paragraph: L } = H, [z, E] = d(""), [ee, J] = d(!1), [_, q] = d(null), [re, Y] = d([]), [K, ce] = d(!1), [O, oe] = d(24), [pe, ie] = d(null), [le, ye] = d(!1), Ee = m(0), Ce = m(null), Oe = g(
    () => {
      var F;
      return new Set(
        ((F = t.find((w) => w.agent_id === o)) == null ? void 0 : F.skill_names) || []
      );
    },
    [t, o]
  ), we = g(() => {
    if (!z.trim()) return e;
    const F = z.toLowerCase();
    return e.filter(
      (w) => {
        var ae, ue;
        return w.name.toLowerCase().includes(F) || ((ae = w.description) == null ? void 0 : ae.toLowerCase().includes(F)) || ((ue = w.tags) == null ? void 0 : ue.some((ze) => ze.toLowerCase().includes(F)));
      }
    );
  }, [e, z]), ne = g(
    () => we.slice(0, O),
    [we, O]
  );
  c(() => {
    if (ne.length >= we.length) return;
    const F = Ce.current;
    if (!F) return;
    const w = () => {
      oe(
        (ue) => Math.min(ue + 24, we.length)
      );
    };
    if (typeof IntersectionObserver < "u") {
      const ue = new IntersectionObserver(
        (ze) => {
          ze.some((Te) => Te.isIntersecting) && w();
        },
        { rootMargin: "240px 0px" }
      );
      return ue.observe(F), () => ue.disconnect();
    }
    const ae = () => {
      F.getBoundingClientRect().top <= window.innerHeight + 240 && w();
    };
    return window.addEventListener("scroll", ae, { passive: !0 }), ae(), () => window.removeEventListener("scroll", ae);
  }, [we.length, ne.length]);
  const Se = f((F) => {
    E(F), oe(24);
  }, []), he = f(() => {
    const F = Ee.current;
    requestAnimationFrame(() => {
      window.scrollTo({ top: F, behavior: "auto" }), document.scrollingElement && (document.scrollingElement.scrollTop = F);
    });
  }, []), Z = f(async () => {
    var F;
    Ee.current = ((F = document.scrollingElement) == null ? void 0 : F.scrollTop) ?? window.scrollY ?? 0;
    try {
      await l();
    } finally {
      he();
    }
  }, [l, he]), de = f(
    (F) => {
      const w = [];
      for (const ae of t)
        if (ae.skill_names.includes(F)) {
          const ue = a.find((ze) => ze.id === ae.agent_id);
          w.push((ue == null ? void 0 : ue.name) || ae.agent_name || ae.agent_id);
        }
      return w;
    },
    [t, a]
  ), fe = f(
    async (F) => {
      if (q(F), Y(de(F.name)), J(!0), !F.content) {
        ce(!0);
        try {
          const w = await kl(F.name);
          q({ ...F, content: w });
        } catch {
        } finally {
          ce(!1);
        }
      }
    },
    [de]
  );
  c(() => {
    _ && Y(de(_.name));
  }, [_, de, t]);
  const V = async (F) => {
    ye(!0);
    try {
      await yn(o, F.name), Q.success(
        `已将技能「${F.name}」加载到当前专家「${i}」`
      ), r(F);
    } catch (w) {
      Q.error(w.message || "加载技能失败");
    } finally {
      ye(!1);
    }
  }, S = (F) => {
    if (F.protected) {
      Q.warning("内置技能不可删除");
      return;
    }
    W.confirm({
      title: `确认从技能池删除「${F.name}」？`,
      content: "删除后所有已安装此技能的专家将不受影响，但技能池中将不再包含此技能。此操作不可撤销。",
      okText: "确认删除",
      cancelText: "取消",
      okButtonProps: { danger: !0 },
      onOk: async () => {
        ye(!0);
        try {
          await Ll(F.name), Q.success(`已从技能池删除「${F.name}」`), await Z();
        } catch (w) {
          Q.error(w.message || "删除失败");
        } finally {
          ye(!1);
        }
      }
    });
  }, me = (F) => {
    window.history.pushState({}, "", F), window.dispatchEvent(new PopStateEvent("popstate"));
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
        value: z,
        onChange: (F) => Se(F.target.value),
        allowClear: !0,
        style: { maxWidth: 400 }
      }),
      s.createElement(
        "div",
        { style: { display: "flex", gap: 8 } },
        s.createElement(
          x,
          {
            icon: P ? s.createElement(P) : void 0,
            onClick: Z,
            loading: n,
            size: "small"
          },
          "刷新"
        ),
        s.createElement(
          x,
          {
            type: "primary",
            icon: v ? s.createElement(v) : void 0,
            onClick: () => me("/skill-pool"),
            size: "small",
            style: je
          },
          "管理技能池"
        )
      )
    ),
    n ? s.createElement(
      "div",
      { style: { textAlign: "center", padding: 60 } },
      s.createElement(u, { size: "large" })
    ) : we.length === 0 ? s.createElement(y, {
      description: z ? "未找到匹配的技能" : "技能池为空"
    }) : s.createElement(
      s.Fragment,
      null,
      s.createElement(
        T,
        { gutter: [12, 12] },
        ...ne.map(
          (F) => s.createElement(
            k,
            { key: F.name, xs: 24, sm: 12, md: 8, lg: 6 },
            s.createElement(
              M,
              {
                hoverable: !0,
                size: "small",
                style: { cursor: "pointer", height: "100%" },
                onClick: () => fe(F),
                onMouseEnter: () => ie(F.name),
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
                F.emoji ? s.createElement(
                  "span",
                  { style: { fontSize: 18 } },
                  F.emoji
                ) : s.createElement(
                  "span",
                  { style: { fontSize: 18 } },
                  "⚡"
                ),
                s.createElement(
                  D,
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
                  F.name
                ),
                F.protected ? s.createElement(
                  N,
                  { color: "gold", style: { fontSize: 10 } },
                  "内置"
                ) : null
              ),
              F.description ? s.createElement(
                L,
                {
                  type: "secondary",
                  style: { fontSize: 11, margin: 0, lineHeight: 1.4 },
                  ellipsis: { rows: 2 }
                },
                F.description
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
                F.version_text ? s.createElement(
                  N,
                  { style: { fontSize: 10 } },
                  `v${F.version_text}`
                ) : null,
                ...(F.tags || []).slice(0, 3).map(
                  (w, ae) => s.createElement(
                    N,
                    { key: ae, color: "cyan", style: { fontSize: 10 } },
                    w
                  )
                )
              ),
              // Hover action footer
              pe === F.name ? s.createElement(
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
                  x,
                  {
                    size: "small",
                    type: "primary",
                    icon: B ? s.createElement(B) : void 0,
                    disabled: le || Oe.has(F.name),
                    onClick: (w) => {
                      w.stopPropagation(), V(F);
                    }
                  },
                  Oe.has(F.name) ? "已加载" : "加载到当前Agent"
                ),
                s.createElement(
                  x,
                  {
                    size: "small",
                    danger: !0,
                    icon: C ? s.createElement(C) : void 0,
                    disabled: le || F.protected,
                    onClick: (w) => {
                      w.stopPropagation(), S(F);
                    }
                  },
                  "删除"
                )
              ) : null
            )
          )
        ),
        // Infinite-scroll sentinel
        ne.length < we.length ? s.createElement(
          "div",
          {
            ref: Ce,
            style: {
              minHeight: 40,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginTop: 16
            }
          },
          s.createElement(
            D,
            { type: "secondary", style: { fontSize: 12 } },
            `继续下滑自动加载 · 还剩 ${we.length - ne.length} 个`
          )
        ) : null
      )
    ),
    // Skill detail drawer
    _ ? s.createElement(
      X,
      {
        title: s.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 8 } },
          s.createElement(
            "span",
            { style: { fontSize: 18 } },
            _.emoji || "⚡"
          ),
          s.createElement("span", null, _.name)
        ),
        open: ee,
        onClose: () => J(!1),
        width: 520,
        extra: s.createElement(
          x,
          {
            type: "primary",
            size: "small",
            icon: I ? s.createElement(I) : void 0,
            onClick: () => me("/skills")
          },
          "管理技能"
        )
      },
      s.createElement(
        j,
        { column: 1, bordered: !0, size: "small" },
        s.createElement(
          j.Item,
          { label: "技能名称" },
          _.name
        ),
        s.createElement(
          j.Item,
          { label: "描述" },
          _.description || "-"
        ),
        _.version_text ? s.createElement(
          j.Item,
          { label: "版本" },
          _.version_text
        ) : null,
        s.createElement(
          j.Item,
          { label: "来源" },
          _.source || "-"
        ),
        s.createElement(
          j.Item,
          { label: "受保护" },
          _.protected ? "是（内置）" : "否"
        ),
        _.sync_status ? s.createElement(
          j.Item,
          { label: "同步状态" },
          _.sync_status
        ) : null,
        _.installed_from ? s.createElement(
          j.Item,
          { label: "安装来源" },
          _.installed_from
        ) : null
      ),
      // Tags
      _.tags && _.tags.length > 0 ? s.createElement(
        "div",
        { style: { marginTop: 16 } },
        s.createElement(
          D,
          {
            strong: !0,
            style: { display: "block", marginBottom: 8 }
          },
          "标签"
        ),
        s.createElement(
          "div",
          { style: { display: "flex", flexWrap: "wrap", gap: 4 } },
          ..._.tags.map(
            (F, w) => s.createElement(N, { key: w, color: "cyan" }, F)
          )
        )
      ) : null,
      // Installed agents
      s.createElement(
        "div",
        { style: { marginTop: 16 } },
        s.createElement(
          D,
          { strong: !0, style: { display: "block", marginBottom: 8 } },
          `已安装此技能的专家 (${re.length})`
        ),
        re.length > 0 ? s.createElement(R, {
          size: "small",
          dataSource: re,
          renderItem: (F) => s.createElement(
            R.Item,
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
              s.createElement(He, { name: F, size: 20 }),
              s.createElement(
                D,
                { style: { fontSize: 13 } },
                F
              )
            )
          )
        }) : s.createElement(
          D,
          { type: "secondary", style: { fontSize: 12 } },
          "暂无专家安装此技能"
        )
      ),
      // Skill content preview (lazy-loaded)
      K ? s.createElement(
        "div",
        { style: { marginTop: 16, textAlign: "center" } },
        s.createElement(u, { size: "small" })
      ) : _.content ? s.createElement(
        "div",
        { style: { marginTop: 16 } },
        s.createElement(
          D,
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
          _.content.slice(0, 2e3) + (_.content.length > 2e3 ? `

... (内容已截断)` : "")
        )
      ) : null
    ) : null
  );
}
function Rr({
  embedded: e = !1
} = {}) {
  const t = $().React, { useState: a, useEffect: n, useCallback: l, useMemo: r } = t, { Tabs: o, message: i } = $().antd, { ThunderboltOutlined: s, AppstoreOutlined: d } = $().antdIcons || {}, f = $().useSelectedAgent, c = f ? f() : null, m = (c == null ? void 0 : c.id) || "default";
  n(() => {
    gn();
  }, [m]);
  const [u, y] = a([]), [h, x] = a([]), [T, k] = a([]), [M, N] = a(!0), [H, X] = a("agent-skills"), [j, R] = a(0), W = l(async () => {
    N(!0);
    try {
      const [C, B, D] = await Promise.all([
        qt(!0),
        Ht(),
        Cl()
      ]);
      x(C), y(B), k(D);
    } catch (C) {
      i.error(C.message || "加载技能列表失败"), x([]);
    } finally {
      N(!1);
    }
  }, []);
  n(() => {
    W();
  }, [W]);
  const Q = r(() => {
    const C = u.find((B) => B.id === m);
    return (C == null ? void 0 : C.name) || m;
  }, [u, m]), P = l(
    (C) => {
      k(
        (B) => B.some((D) => D.agent_id === m) ? B.map((D) => D.agent_id !== m || D.skill_names.includes(C.name) ? D : {
          ...D,
          skill_names: [...D.skill_names, C.name]
        }) : [
          ...B,
          {
            agent_id: m,
            agent_name: Q,
            skill_names: [C.name]
          }
        ]
      ), R((B) => B + 1);
    },
    [m, Q]
  ), b = (C) => {
    window.history.pushState({}, "", C), window.dispatchEvent(new PopStateEvent("popstate"));
  }, v = [
    {
      key: "agent-skills",
      label: t.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        s ? t.createElement(s, { style: { fontSize: 14 } }) : null,
        "当前专家"
      ),
      children: t.createElement(Mr, {
        agentId: m,
        agentName: Q,
        refreshKey: j,
        onNavigate: b
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
      children: t.createElement(Lr, {
        poolSkills: h,
        workspaceSkills: T,
        agents: u,
        loading: M,
        onReload: W,
        onSkillInstalled: P,
        agentId: m,
        agentName: Q
      })
    }
  ], I = t.createElement(o, {
    items: v,
    activeKey: H,
    onChange: (C) => X(C)
  });
  return e ? I : t.createElement(
    "div",
    { style: { padding: 24 } },
    t.createElement(Wt, {
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
}, Ba = {
  reservoir_simulation: "🛢️",
  geological_modeling: "🏔️",
  well_log_analysis: "📡",
  production_engineering: "⚙️",
  post_processing: "📊",
  multiphysics: "🔬"
}, Ua = /* @__PURE__ */ new Set(["cmg", "comsol", "tnavigator", "eclipse", "intersect", "visage"]);
function ja(e) {
  return Gt(`/ugsci/engines/icon/${encodeURIComponent(e)}`);
}
async function Br() {
  return se("/ugsci/engines/list");
}
async function Ur(e) {
  return se("/ugsci/engines/", {
    method: "POST",
    body: JSON.stringify(e)
  });
}
async function jr(e, t) {
  return se(`/ugsci/engines/${encodeURIComponent(e)}`, {
    method: "PUT",
    body: JSON.stringify(t)
  });
}
async function Nr(e) {
  return se(
    `/ugsci/engines/${encodeURIComponent(e)}`,
    { method: "DELETE" }
  );
}
async function Dr() {
  return se("/ugsci/engines/detect/refresh", {
    method: "POST"
  });
}
function Gr({
  engine: e,
  onClick: t
}) {
  const a = $().React, { Card: n, Tag: l, Typography: r } = $().antd, { Text: o } = r, i = e.status === "detected", s = Ba[e.category] || "📦", g = Ua.has(e.id) ? a.createElement("img", {
    src: ja(e.id),
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
        g,
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
          l,
          { color: "success", style: { fontSize: 11 } },
          "✅ 已检测"
        ) : e.executable_path ? a.createElement(
          l,
          { color: "warning", style: { fontSize: 11 } },
          "⚠ 路径无效"
        ) : a.createElement(
          l,
          { style: { fontSize: 11 } },
          "🔧 待配置"
        ),
        e.is_default ? a.createElement(
          l,
          { color: "blue", style: { fontSize: 10 } },
          "默认"
        ) : e.is_custom ? a.createElement(
          l,
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
        l,
        { style: { fontSize: 11 } },
        sn[e.category] || e.category
      ) : null,
      e.version ? a.createElement(
        l,
        { color: "blue", style: { fontSize: 11 } },
        `v${e.version}`
      ) : null,
      ...(e.modules || []).map(
        (f) => a.createElement(
          l,
          { key: f, color: "cyan", style: { fontSize: 10 } },
          f
        )
      )
    )
  );
}
function Fr() {
  const e = $().React, { useState: t, useEffect: a, useCallback: n, useMemo: l } = e, {
    Spin: r,
    Empty: o,
    Button: i,
    message: s,
    Row: d,
    Col: g,
    Drawer: f,
    Descriptions: c,
    Tag: m,
    Typography: u,
    Modal: y,
    Input: h,
    Select: x,
    Popconfirm: T,
    Space: k
  } = $().antd, {
    ReloadOutlined: M,
    SearchOutlined: N,
    PlusOutlined: H,
    EditOutlined: X,
    DeleteOutlined: j,
    CopyOutlined: R,
    ExperimentOutlined: W
  } = $().antdIcons || {}, { Text: Q, Paragraph: P } = u, [b, v] = t([]), [I, C] = t(!0), [B, D] = t(""), [L, z] = t(!1), [E, ee] = t(null), [J, _] = t(!1), [q, re] = t(null), [Y, K] = t({}), [ce, O] = t(!1), oe = n(async () => {
    C(!0);
    try {
      const ne = await Br();
      v(ne.engines || []);
    } catch (ne) {
      s.error(ne.message || "加载引擎列表失败"), v([]);
    } finally {
      C(!1);
    }
  }, []);
  a(() => {
    oe();
  }, [oe]);
  const pe = l(() => {
    if (!B.trim()) return b;
    const ne = B.toLowerCase();
    return b.filter(
      (Se) => {
        var he;
        return Se.name.toLowerCase().includes(ne) || Se.vendor.toLowerCase().includes(ne) || Se.category.toLowerCase().includes(ne) || ((he = Se.description) == null ? void 0 : he.toLowerCase().includes(ne));
      }
    );
  }, [b, B]);
  b.filter((ne) => ne.status === "detected").length;
  const ie = n((ne) => {
    navigator.clipboard.writeText(ne).then(() => s.success("路径已复制")).catch(() => s.error("复制失败"));
  }, []), le = n(() => {
    re(null), K({
      name: "",
      vendor: "",
      version: "",
      executable_path: "",
      category: "",
      description: "",
      invocation_hint: ""
    }), _(!0);
  }, []), ye = n((ne) => {
    re(ne), K({ ...ne }), _(!0), z(!1);
  }, []), Ee = n(async () => {
    var ne;
    if (!((ne = Y.name) != null && ne.trim())) {
      s.warning("请输入引擎名称");
      return;
    }
    O(!0);
    try {
      q ? (await jr(q.id, Y), s.success("引擎已更新")) : (await Ur(Y), s.success("引擎已添加")), _(!1), oe();
    } catch (Se) {
      s.error(Se.message || "保存失败");
    } finally {
      O(!1);
    }
  }, [Y, q, oe]), Ce = n(
    async (ne) => {
      try {
        await Nr(ne), s.success("引擎已删除"), z(!1), oe();
      } catch (Se) {
        s.error(Se.message || "删除失败");
      }
    },
    [oe]
  ), Oe = n(async () => {
    C(!0);
    try {
      const ne = await Dr();
      v(ne.engines || []), s.success("自动检测完成");
    } catch (ne) {
      s.error(ne.message || "检测失败");
    } finally {
      C(!1);
    }
  }, []), we = n(
    (ne, Se, he) => {
      const Z = Y[Se] || "";
      return e.createElement(
        "div",
        { style: { marginBottom: 12 } },
        e.createElement(
          Q,
          { style: { fontSize: 13, display: "block", marginBottom: 4 } },
          ne
        ),
        he != null && he.select ? e.createElement(x, {
          value: Z || void 0,
          onChange: (de) => K((fe) => ({ ...fe, [Se]: de })),
          style: { width: "100%" },
          options: he.select.options,
          allowClear: !0,
          placeholder: `选择${ne}`
        }) : he != null && he.textarea ? e.createElement(h.TextArea, {
          value: Z,
          onChange: (de) => K((fe) => ({ ...fe, [Se]: de.target.value })),
          rows: 3,
          placeholder: `输入${ne}`
        }) : e.createElement(h, {
          value: Z,
          onChange: (de) => K((fe) => ({ ...fe, [Se]: de.target.value })),
          placeholder: `输入${ne}`
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
        prefix: N ? e.createElement(N) : void 0,
        value: B,
        onChange: (ne) => D(ne.target.value),
        allowClear: !0,
        style: { maxWidth: 280 }
      }),
      e.createElement(
        i,
        {
          icon: M ? e.createElement(M) : void 0,
          onClick: Oe,
          loading: I
        },
        "自动检测"
      ),
      e.createElement(
        i,
        {
          type: "primary",
          icon: H ? e.createElement(H) : void 0,
          onClick: le,
          style: je
        },
        "添加引擎"
      )
    ),
    // Content
    I ? e.createElement(
      "div",
      { style: { textAlign: "center", padding: 60 } },
      e.createElement(r, {
        size: "large",
        tip: "正在加载引擎..."
      })
    ) : pe.length === 0 ? e.createElement(o, {
      description: B ? "无匹配引擎" : "暂无引擎，点击「添加引擎」开始"
    }) : e.createElement(
      d,
      { gutter: [12, 12], align: "stretch" },
      ...pe.map(
        (ne) => e.createElement(
          g,
          {
            key: ne.id,
            xs: 24,
            sm: 12,
            md: 8,
            lg: 6,
            style: { display: "flex" }
          },
          e.createElement(Gr, {
            engine: ne,
            onClick: () => {
              ee(ne), z(!0);
            }
          })
        )
      )
    ),
    // Detail drawer
    E ? e.createElement(
      f,
      {
        title: e.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 8 } },
          e.createElement(
            "span",
            { style: { display: "flex", alignItems: "center" } },
            Ua.has(E.id) ? e.createElement("img", {
              src: ja(E.id),
              alt: E.name,
              style: { width: 20, height: 20, objectFit: "contain" }
            }) : e.createElement(
              "span",
              { style: { fontSize: 18 } },
              Ba[E.category] || "📦"
            )
          ),
          e.createElement("span", null, E.name)
        ),
        open: L,
        onClose: () => z(!1),
        width: 520,
        extra: e.createElement(
          k,
          null,
          e.createElement(
            i,
            {
              size: "small",
              icon: X ? e.createElement(X) : void 0,
              onClick: () => ye(E)
            },
            "编辑"
          ),
          E.is_default ? null : e.createElement(
            T,
            {
              title: "确认删除此引擎？",
              description: E.name,
              onConfirm: () => Ce(E.id),
              okText: "删除",
              cancelText: "取消",
              okButtonProps: { danger: !0 }
            },
            e.createElement(
              i,
              {
                size: "small",
                danger: !0,
                icon: j ? e.createElement(j) : void 0
              },
              "删除"
            )
          )
        )
      },
      e.createElement(
        c,
        { column: 1, bordered: !0, size: "small" },
        e.createElement(
          c.Item,
          { label: "引擎名称" },
          E.name
        ),
        e.createElement(
          c.Item,
          { label: "厂商" },
          E.vendor || "—"
        ),
        e.createElement(
          c.Item,
          { label: "分类" },
          E.category ? sn[E.category] || E.category : "—"
        ),
        e.createElement(
          c.Item,
          { label: "状态" },
          e.createElement(
            m,
            {
              color: E.status === "detected" ? "success" : E.status === "not_found" ? "error" : "default"
            },
            E.status === "detected" ? "✅ 已检测" : E.status === "not_found" ? "❌ 路径无效" : "🔧 待配置"
          )
        ),
        e.createElement(
          c.Item,
          { label: "版本" },
          E.version || "—"
        ),
        E.executable_path ? e.createElement(
          c.Item,
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
                icon: R ? e.createElement(R) : void 0,
                onClick: () => ie(E.executable_path)
              }
            )
          )
        ) : null,
        E.install_dir ? e.createElement(
          c.Item,
          { label: "安装目录" },
          e.createElement(
            "code",
            { style: { fontSize: 12, wordBreak: "break-all" } },
            E.install_dir
          )
        ) : null,
        // Display detected modules with paths
        E.modules && E.modules.length > 0 ? e.createElement(
          c.Item,
          { label: "已检测模块" },
          e.createElement(
            "div",
            { style: { display: "flex", flexDirection: "column", gap: 4 } },
            ...E.modules.map(
              (ne) => e.createElement(
                "div",
                {
                  key: ne,
                  style: { display: "flex", alignItems: "center", gap: 8 }
                },
                e.createElement(
                  m,
                  { color: "cyan", style: { fontSize: 11 } },
                  ne
                ),
                E.module_paths && E.module_paths[ne] ? e.createElement(
                  "code",
                  { style: { fontSize: 11, wordBreak: "break-all" } },
                  E.module_paths[ne]
                ) : null
              )
            )
          )
        ) : null,
        E.license_server ? e.createElement(
          c.Item,
          { label: "许可证服务器" },
          E.license_server
        ) : null,
        e.createElement(
          c.Item,
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
          m,
          { color: "blue" },
          "默认引擎"
        ) : E.is_custom ? e.createElement(
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
        title: q ? "编辑引擎" : "添加引擎",
        open: J,
        onOk: Ee,
        onCancel: () => _(!1),
        okText: q ? "保存" : "添加",
        cancelText: "取消",
        confirmLoading: ce,
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
            options: Object.entries(sn).map(([ne, Se]) => ({
              label: Se,
              value: ne
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
async function Wr(e = !1) {
  const t = await se(
    "/ugsci/domain-engines/list",
    e ? { bypassCache: !0 } : void 0
  );
  return (t == null ? void 0 : t.engines) || [];
}
async function Hr(e, t = !1) {
  const a = await se("/tools", {
    headers: { "X-Agent-Id": e },
    ...t ? { bypassCache: !0 } : {}
  }) || [];
  return new Map(a.map((n) => [n.name, n]));
}
async function Jr(e, t = !1) {
  const a = /* @__PURE__ */ new Map(), n = {
    headers: { "X-Agent-Id": e },
    ...t ? { bypassCache: !0 } : {}
  };
  let l;
  try {
    l = await se(
      "/mcp",
      n
    ) || [];
  } catch {
    return a;
  }
  for (const r of l) {
    const o = r.key;
    if (!r.enabled) {
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
function sa(e) {
  return e ? e.overall === "available" ? "available" : e.overall === "unavailable" ? "unavailable" : "unknown" : "unknown";
}
function qr(e) {
  return e ? e.enabled ? e.error ? "error" : e.toolCount > 0 ? "available" : "error" : "unconfigured" : "unavailable";
}
function Kr(e, t = null, a = /* @__PURE__ */ new Map()) {
  const n = e.engine, l = e.dependency_status;
  let r, o, i;
  if (n.source === "builtin") {
    const s = sa(l), d = n.operations.flatMap((c) => c.tool_names), g = d.filter((c) => a.has(c)), f = g.filter(
      (c) => {
        var m;
        return (m = a.get(c)) == null ? void 0 : m.enabled;
      }
    );
    s !== "available" ? r = s : g.length !== d.length ? r = "error" : f.length === 0 ? r = "unconfigured" : r = "available", o = f.length, i = null;
  } else n.source === "mcp" ? (r = qr(t), o = (t == null ? void 0 : t.toolCount) ?? 0, i = (t == null ? void 0 : t.key) ?? n.provider.id) : (r = sa(l), o = 0, i = null);
  return {
    definition: n,
    dependencyStatus: l,
    checkedAt: e.checked_at,
    effectiveStatus: r,
    discoveredToolCount: o,
    mcpProviderKey: i
  };
}
function Vr(e) {
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
}, Xr = {
  geology_well_logging: "📡",
  production_engineering: "⚙️",
  fluid_thermodynamics: "🧪",
  scientific_computing: "🧮",
  data_modeling: "📊"
}, Qr = {
  builtin: "内置",
  mcp: "MCP",
  library: "计算库"
};
function Yr({
  view: e,
  onClick: t
}) {
  const a = $().React, { Card: n, Tag: l, Typography: r } = $().antd, { Text: o } = r, i = e.definition, s = Xr[i.domain] || "📦", d = e.effectiveStatus, g = i.operations.length, f = e.discoveredToolCount;
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
            Qr[i.source] || i.source
          )
        )
      ),
      a.createElement(
        l,
        { color: dn[d] || "default", style: { fontSize: 11 } },
        cn[d] || d
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
        l,
        { style: { fontSize: 11 } },
        `${g} 操作`
      ),
      f > 0 ? a.createElement(
        l,
        { color: "blue", style: { fontSize: 11 } },
        `${f} 工具`
      ) : null,
      ...(i.tags || []).map(
        (c) => a.createElement(
          l,
          { key: c, color: "cyan", style: { fontSize: 10 } },
          c
        )
      )
    )
  );
}
function Zr({
  view: e,
  open: t,
  onClose: a,
  onNavigateToMcp: n,
  onNavigateToTools: l,
  onNavigateToSkills: r
}) {
  const o = $().React, { Drawer: i, Descriptions: s, Tag: d, Typography: g, Button: f, Space: c, Divider: m } = $().antd, { Text: u, Paragraph: y } = g;
  if (!e) return null;
  const h = e.definition, x = e.dependencyStatus;
  return o.createElement(
    i,
    {
      title: o.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 8 } },
        o.createElement("span", null, h.name),
        o.createElement(
          d,
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
      o.createElement(u, { strong: !0 }, "领域操作")
    ),
    ...h.operations.map(
      (T) => o.createElement(
        "div",
        {
          key: T.id,
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
          o.createElement(u, { strong: !0, style: { fontSize: 13 } }, T.name),
          o.createElement(
            u,
            { type: "secondary", style: { fontSize: 11, marginLeft: 8 } },
            T.id
          )
        ),
        o.createElement(
          u,
          { type: "secondary", style: { fontSize: 12 } },
          T.description
        ),
        T.tool_names.length > 0 ? o.createElement(
          "div",
          { style: { marginTop: 4, display: "flex", gap: 4, flexWrap: "wrap" } },
          ...T.tool_names.map(
            (k) => o.createElement(
              d,
              { key: k, color: "blue", style: { fontSize: 10 } },
              k
            )
          )
        ) : null
      )
    ),
    // Dependencies
    o.createElement(m, null),
    o.createElement(u, { strong: !0 }, "实现与依赖"),
    x && x.dependencies.length > 0 ? o.createElement(
      "div",
      { style: { marginTop: 8 } },
      ...x.dependencies.map(
        (T) => o.createElement(
          "div",
          {
            key: T.name,
            style: {
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "4px 0"
            }
          },
          o.createElement(u, { style: { fontSize: 13 } }, T.name),
          o.createElement(
            d,
            {
              color: dn[T.status] || "default",
              style: { fontSize: 11 }
            },
            cn[T.status] || T.status
          )
        )
      )
    ) : o.createElement(
      y,
      { type: "secondary", style: { fontSize: 12 } },
      "无外部依赖"
    ),
    // Actions
    o.createElement(m, null),
    o.createElement(u, { strong: !0 }, "问题处理"),
    o.createElement(
      "div",
      { style: { marginTop: 8, display: "flex", gap: 8, flexWrap: "wrap" } },
      h.source === "mcp" ? o.createElement(
        f,
        { size: "small", onClick: n },
        "配置 MCP 服务"
      ) : h.source === "library" ? o.createElement(
        f,
        { size: "small", onClick: r },
        "查看相关技能"
      ) : o.createElement(
        f,
        { size: "small", onClick: () => l("builtin") },
        "查看内置工具"
      )
    )
  );
}
const eo = {
  geology_well_logging: "测井地质",
  production_engineering: "采油工程",
  fluid_thermodynamics: "流体热力学",
  scientific_computing: "科学计算",
  data_modeling: "数据建模"
};
function to({
  onNavigateToMcp: e,
  onNavigateToTools: t,
  onNavigateToSkills: a
} = {}) {
  var re, Y;
  const n = $().React, { useState: l, useEffect: r, useCallback: o, useMemo: i, useRef: s } = n, {
    Spin: d,
    Empty: g,
    Button: f,
    message: c,
    Row: m,
    Col: u,
    Input: y,
    Drawer: h,
    Typography: x
  } = $().antd, { ReloadOutlined: T, SearchOutlined: k } = $().antdIcons || {}, { Text: M } = x, N = (Y = (re = $()).useSelectedAgent) == null ? void 0 : Y.call(re), H = (N == null ? void 0 : N.id) || "default", [X, j] = l([]), [R, W] = l(!0), [Q, P] = l(""), [b, v] = l(!1), [I, C] = l(null), B = s(H);
  B.current = H;
  const D = o(
    async (K = !1) => {
      W(!0);
      const ce = B.current;
      try {
        const [O, oe, pe] = await Promise.all([
          Wr(K),
          Jr(ce, K),
          Hr(ce, K)
        ]);
        if (ce !== B.current) return;
        const ie = [];
        for (const le of O)
          try {
            let ye = null;
            if (le.engine.source === "mcp") {
              const Ee = le.engine.provider.id;
              ye = oe.get(Ee) || null;
            }
            ie.push(Kr(le, ye, pe));
          } catch {
          }
        j(ie);
      } catch (O) {
        const oe = O instanceof Error ? O.message : "加载领域引擎失败";
        c.error(oe), j([]);
      } finally {
        W(!1);
      }
    },
    []
  );
  r(() => {
    D();
  }, [H, D]);
  const L = i(() => {
    if (!Q.trim()) return X;
    const K = Q.toLowerCase();
    return X.filter(
      (ce) => ce.definition.name.toLowerCase().includes(K) || ce.definition.domain.toLowerCase().includes(K) || ce.definition.description.toLowerCase().includes(K) || ce.definition.tags.some((O) => O.toLowerCase().includes(K))
    );
  }, [X, Q]), z = i(
    () => Vr(L),
    [L]
  ), E = o(() => {
    D(!0);
  }, [D]), ee = o((K) => {
    C(K), v(!0);
  }, []), J = o(() => {
    v(!1), e == null || e();
  }, [e]), _ = o(
    (K) => {
      v(!1), t == null || t(K);
    },
    [t]
  ), q = o(() => {
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
        prefix: k ? n.createElement(k) : void 0,
        value: Q,
        onChange: (K) => P(K.target.value),
        allowClear: !0,
        style: { maxWidth: 280 }
      }),
      n.createElement(
        f,
        {
          icon: T ? n.createElement(T) : void 0,
          onClick: E,
          loading: R
        },
        "刷新"
      )
    ),
    // Content
    R ? n.createElement(
      "div",
      { style: { textAlign: "center", padding: 60 } },
      n.createElement(d, {
        size: "large",
        tip: "正在加载领域引擎..."
      })
    ) : L.length === 0 ? n.createElement(g, {
      description: Q ? "无匹配引擎" : "暂无领域引擎"
    }) : n.createElement(
      "div",
      null,
      ...Array.from(z.entries()).map(
        ([K, ce]) => n.createElement(
          "div",
          { key: K, style: { marginBottom: 20 } },
          n.createElement(
            M,
            {
              strong: !0,
              style: {
                fontSize: 14,
                display: "block",
                marginBottom: 8
              }
            },
            eo[K] || K
          ),
          n.createElement(
            m,
            { gutter: [12, 12], align: "stretch" },
            ...ce.map(
              (O) => n.createElement(
                u,
                {
                  key: O.definition.id,
                  xs: 24,
                  sm: 12,
                  md: 8,
                  lg: 6,
                  style: { display: "flex" }
                },
                n.createElement(Yr, {
                  view: O,
                  onClick: () => ee(O)
                })
              )
            )
          )
        )
      )
    ),
    // Detail drawer
    n.createElement(Zr, {
      view: I,
      open: b,
      onClose: () => v(!1),
      onNavigateToMcp: J,
      onNavigateToTools: _,
      onNavigateToSkills: q
    })
  );
}
const no = Rr, Na = /* @__PURE__ */ new Set(["tools", "engines", "skills"]);
function ao(e) {
  try {
    const t = new URLSearchParams(window.location.search).get("tab");
    return t && Na.has(t) ? t : e;
  } catch {
    return e;
  }
}
function ia(e) {
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
  const t = $().React, { useEffect: a, useState: n } = t, { Alert: l, Spin: r } = $().antd, [o, i] = n(null), [s, d] = n("");
  if (a(() => {
    let f = !0;
    const c = $().loadBuiltinPage;
    return i(null), c ? (d(""), c(e).then((m) => {
      f && i(() => m);
    }).catch((m) => {
      f && d(
        m instanceof Error ? m.message : "加载原生管理页面失败"
      );
    }), () => {
      f = !1;
    }) : (d("当前 QwenPaw 版本不支持原生页面嵌入"), () => {
      f = !1;
    });
  }, [e]), s)
    return t.createElement(l, {
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
        r,
        { tip: "正在加载原生管理功能..." },
        t.createElement("div", { style: { minHeight: 24 } })
      )
    );
  const g = e === "mcp" ? {
    title: "UGSci MCP",
    description: "连接外部工具、数据服务与计算能力，扩展当前专家的可调用范围",
    managedTitle: "已接入服务",
    managedDescription: "启用后可由当前专家调用，并可按工具配置访问权限",
    create: "接入 MCP 服务"
  } : void 0;
  return t.createElement(o, { embedded: !0, embeddedLabels: g });
}
function lo({
  activeSubTab: e,
  onSubTabChange: t
}) {
  const a = $().React, { Tabs: n } = $().antd;
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
function ro({
  onNavigateToMcp: e,
  onNavigateToTools: t,
  onNavigateToSkills: a
} = {}) {
  const n = $().React, { Tabs: l } = $().antd;
  return n.createElement(l, {
    defaultActiveKey: "simulation",
    items: [
      {
        key: "simulation",
        label: "仿真软件",
        children: n.createElement(Fr)
      },
      {
        key: "domain",
        label: "领域计算",
        children: n.createElement(
          to,
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
function Da({
  initialTab: e = "engines"
} = {}) {
  var x, T;
  const t = $().React, { useEffect: a, useState: n } = t, { Tabs: l, Tag: r } = $().antd, { RocketOutlined: o, ToolOutlined: i, ThunderboltOutlined: s } = $().antdIcons || {}, d = (T = (x = $()).useSelectedAgent) == null ? void 0 : T.call(x), g = (d == null ? void 0 : d.id) || "default", [f, c] = n(
    () => ao(e)
  ), [m, u] = n("mcp");
  a(() => {
    try {
      const k = new URLSearchParams(window.location.search).get("tab");
      k && !Na.has(k) && ia(f);
    } catch {
    }
  }, [f]);
  const y = (k) => {
    c(k), ia(k);
  }, h = (k, M) => t.createElement(
    "span",
    { style: { display: "inline-flex", alignItems: "center", gap: 6 } },
    M ? t.createElement(M, { style: { fontSize: 14 } }) : null,
    k
  );
  return t.createElement(
    "div",
    { style: { padding: 24 } },
    t.createElement(Wt, {
      title: "工具·技能",
      subtitle: "管理当前专家可调用的引擎、工具、运行服务与专业技能",
      extra: t.createElement(
        r,
        { color: "blue" },
        `当前专家：${g}`
      )
    }),
    t.createElement(l, {
      activeKey: f,
      onChange: (k) => y(k),
      items: [
        {
          key: "engines",
          label: h("引擎", o),
          children: t.createElement(
            ro,
            {
              onNavigateToMcp: () => {
                u("mcp"), y("tools");
              },
              onNavigateToTools: (k) => {
                u(k || "mcp"), y("tools");
              },
              onNavigateToSkills: () => y("skills")
            }
          )
        },
        {
          key: "tools",
          label: h("工具", i),
          children: t.createElement(lo, {
            activeSubTab: m,
            onSubTabChange: u
          })
        },
        {
          key: "skills",
          label: h("技能", s),
          children: t.createElement(no, {
            embedded: !0
          })
        }
      ]
    })
  );
}
const Ga = Da;
function oo() {
  return $().React.createElement(Ga, {
    initialTab: "tools"
  });
}
function so() {
  return $().React.createElement(Ga, {
    initialTab: "skills"
  });
}
const ca = {
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
function io(e) {
  if (!e.env) return !1;
  const t = Object.entries(e.env);
  return t.length === 0 ? !1 : t.some(([, a]) => typeof a == "string" && a.length > 0);
}
const Mt = "ugsci.market.githubSources", da = "https://github.com/anthropics/skills/tree/main/skills", Fa = "https://ugsci-awesome-tools.oss-cn-beijing.aliyuncs.com", co = `${Fa}/skills`;
function mo(e) {
  const t = e.replace(/^\/+/, "");
  return Gt(`/plugins/oss-proxy?path=${encodeURIComponent(t)}`);
}
function Rt(e) {
  const t = e.replace(/^\/+/, "");
  return Ve(`/plugins/oss-proxy?path=${encodeURIComponent(t)}`);
}
async function xn(e) {
  const t = e.replace(/^\/+/, ""), a = await Rt(t);
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
function uo(e) {
  var l, r;
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
    iconUrl: e.icon_url ? mo(e.icon_url) : void 0,
    category: e.category ? ct(e.category) : "",
    description: e.description,
    transport: e.transport || "stdio",
    command: ((l = e.config) == null ? void 0 : l.command) || "",
    args: ((r = e.config) == null ? void 0 : r.args) || [],
    env: Object.keys(t).length > 0 ? t : void 0
  };
}
const Wa = "ugsci.market.mcpSources", Ha = "ugsci.market.expertSources";
function Ja(e, t) {
  try {
    const a = localStorage.getItem(e);
    if (!a) return [];
    const n = JSON.parse(a);
    return Array.isArray(n) ? n.filter(
      (l) => l && typeof l.id == "string" && typeof l.label == "string" && typeof l.url == "string"
    ).map((l) => ({
      id: l.id,
      label: l.label,
      url: l.url,
      enabled: l.enabled !== !1,
      type: t
    })) : [];
  } catch {
    return [];
  }
}
function qa(e, t) {
  try {
    localStorage.setItem(e, JSON.stringify(t));
  } catch {
  }
}
function po() {
  return Ja(Wa, "mcp");
}
function zt(e) {
  qa(Wa, e);
}
function go() {
  return Ja(Ha, "expert");
}
function At(e) {
  qa(Ha, e);
}
function Ka(e) {
  try {
    const t = new URL(e.trim()), a = t.hostname.toLowerCase();
    let n;
    if (a === "github.com" || a === "www.github.com")
      n = "github";
    else if (a === "gitee.com" || a === "www.gitee.com")
      n = "gitee";
    else
      return null;
    const l = t.pathname.split("/").filter((d) => d.length > 0);
    if (l.length < 2) return null;
    const r = decodeURIComponent(l[0]), o = decodeURIComponent(l[1]);
    let i = "main", s = "";
    return l.length >= 4 && (l[2] === "tree" || l[2] === "blob") ? (i = decodeURIComponent(l[3]), l.length > 4 && (s = l.slice(4).map(decodeURIComponent).join("/"))) : l.length > 2 && (s = l.slice(2).map(decodeURIComponent).join("/")), s = s.replace(/\/+$/, "").replace(/^\/+/, ""), {
      owner: r,
      repo: o,
      ref: i || "main",
      skillsPath: s,
      label: `${r}/${o}`,
      platform: n
    };
  } catch {
    return null;
  }
}
function Va(e, t, a, n = "github") {
  return n === "oss" ? `oss:${e}/${a || "/"}` : `${n}:${e}/${t}:${a || "/"}`;
}
function fo(e) {
  try {
    const t = new URL(e.trim()), a = t.hostname.toLowerCase(), n = a.match(
      /^([a-z0-9][a-z0-9-]{1,61}[a-z0-9])\.oss-([a-z0-9-]+)\.aliyuncs\.com$/
    );
    if (!n) return null;
    const l = n[1], r = `${t.protocol}//${a}`, o = decodeURIComponent(t.pathname).replace(/^\/+/, "").replace(/\/+$/, "");
    return o ? {
      endpoint: r,
      prefix: o,
      label: "UGSci",
      platform: "oss"
    } : null;
  } catch {
    return null;
  }
}
function yo() {
  try {
    const e = localStorage.getItem(Mt);
    if (!e) {
      const n = [], l = Ka(da);
      return l && n.push({
        id: Va(
          l.owner,
          l.repo,
          l.skillsPath,
          l.platform
        ),
        url: da,
        label: l.label,
        owner: l.owner,
        repo: l.repo,
        ref: l.ref,
        skillsPath: l.skillsPath,
        enabled: !1,
        platform: l.platform
      }), localStorage.setItem(Mt, JSON.stringify(n)), n;
    }
    const t = JSON.parse(e);
    if (!Array.isArray(t)) return [];
    const a = t.filter(
      (n) => n && typeof n.id == "string" && (typeof n.owner == "string" || n.platform === "oss") && !(n.platform === "oss" && n.url === co)
    ).map((n) => ({
      ...n,
      platform: n.platform || "github",
      owner: n.owner || "",
      repo: n.repo || "",
      ref: n.ref || "",
      skillsPath: n.skillsPath || ""
    }));
    return a.length !== t.length && localStorage.setItem(
      Mt,
      JSON.stringify(a)
    ), a;
  } catch {
    return [];
  }
}
function $t(e) {
  try {
    localStorage.setItem(
      Mt,
      JSON.stringify(e)
    );
  } catch {
  }
}
function ho(e) {
  const t = e.match(/^---\s*\n([\s\S]*?)\n---/);
  if (!t) return {};
  const a = t[1], n = {}, l = a.split(`
`);
  let r = "";
  for (const o of l) {
    const i = o.match(/^(\w[\w-]*)\s*:\s*(.*)$/);
    if (i) {
      r = i[1];
      let s = i[2].trim();
      (s.startsWith('"') && s.endsWith('"') || s.startsWith("'") && s.endsWith("'")) && (s = s.slice(1, -1)), r === "name" ? n.name = s : r === "description" ? n.description = s : r === "version" ? n.version = s : r === "author" && (n.author = s);
    }
  }
  return n;
}
async function Eo(e) {
  const t = e.platform === "gitee", a = e.skillsPath ? encodeURIComponent(e.skillsPath).replace(/%2F/g, "/") : "", n = t ? `https://gitee.com/api/v5/repos/${e.owner}/${e.repo}/contents/${a}?ref=${encodeURIComponent(e.ref)}` : `https://api.github.com/repos/${e.owner}/${e.repo}/contents/${a}?ref=${encodeURIComponent(e.ref)}`, l = {
    Accept: t ? "application/json" : "application/vnd.github+json"
  };
  t && e.accessToken && (l.Authorization = `token ${e.accessToken}`);
  const r = await fetch(n, {
    headers: l
  });
  if (!r.ok)
    throw new Error(
      `${t ? "Gitee" : "GitHub"} API ${r.status}: ${e.label} (${e.skillsPath || "/"})`
    );
  const o = await r.json();
  if (!Array.isArray(o)) return [];
  const i = o.filter(
    (d) => d.type === "dir" && d.name
  );
  return await Promise.all(
    i.map(async (d) => {
      const g = e.skillsPath ? e.skillsPath + "/" : "", f = t ? `https://gitee.com/${e.owner}/${e.repo}/raw/${e.ref}/${g}${d.name}/SKILL.md` : `https://raw.githubusercontent.com/${e.owner}/${e.repo}/${e.ref}/${g}${d.name}/SKILL.md`, c = t ? `https://gitee.com/${e.owner}/${e.repo}/tree/${e.ref}/${g}${d.name}` : `https://github.com/${e.owner}/${e.repo}/tree/${e.ref}/${g}${d.name}`, m = {
        sourceId: e.id,
        sourceLabel: e.label,
        name: d.name,
        description: "",
        source_url: c,
        html_url: c,
        version: null,
        author: null
      };
      try {
        const u = {};
        t && e.accessToken && (u.Authorization = `token ${e.accessToken}`);
        const y = await fetch(f, {
          headers: u
        });
        if (!y.ok) return m;
        const h = await y.text(), x = ho(h);
        return {
          ...m,
          name: x.name || d.name,
          description: x.description || "",
          version: x.version || null,
          author: x.author || null
        };
      } catch {
        return m;
      }
    })
  );
}
async function vo(e) {
  const t = fo(e.url);
  if (!t)
    throw new Error(`Invalid OSS URL: ${e.url}`);
  const { endpoint: a, prefix: n } = t, l = n.split("/").map(encodeURIComponent).join("/"), r = await Rt(
    `${l}/manifest.json`
  );
  if (!r.ok)
    throw new Error(
      `无法获取技能列表: manifest.json (${r.status})`
    );
  const o = await r.json(), i = [];
  if (o && o.tag_groups && typeof o.tag_groups == "object")
    for (const [g, f] of Object.entries(o.tag_groups))
      Array.isArray(f) && i.push({
        id: g,
        label: ct(g),
        tags: f
      });
  const s = [];
  function d(g, f) {
    for (const c of g) {
      if (c.type === "collection" && Array.isArray(c.children)) {
        d(c.children, c.name);
        continue;
      }
      const m = c.path || c.name || "";
      if (!m) continue;
      const u = m.split("/").map(encodeURIComponent).join("/"), y = `${a}/${l}/${u}`;
      let h = null;
      if (c.metadata) {
        const T = c.metadata.match(/version:\s*"?([\d.]+)"?/);
        T && (h = T[1]);
      }
      const x = f ? `${e.label}/${f}` : e.label;
      s.push({
        sourceId: e.id,
        sourceLabel: e.label,
        sourcePath: x,
        name: c.name || m.split("/").pop() || m,
        description: c.description || "",
        source_url: y,
        html_url: y,
        version: h,
        author: null,
        tag: c.tag || void 0,
        isOfficial: !0
      });
    }
  }
  if (Array.isArray(o) ? d(
    o.map(
      (g) => typeof g == "string" ? { name: g, path: g } : g
    )
  ) : o && Array.isArray(o.skills) && d(o.skills), s.length === 0)
    throw new Error(
      `manifest.json 中未找到技能。请检查 ${e.url}/manifest.json`
    );
  return { skills: s, categories: i };
}
async function bo() {
  const e = await xn("mcp/manifest.json"), t = [], a = {};
  if (e.tag_groups && typeof e.tag_groups == "object")
    for (const [l, r] of Object.entries(e.tag_groups))
      Array.isArray(r) && (a[l] = r, t.push({
        id: l,
        label: ct(l),
        tags: r
      }));
  return { servers: (e.servers || []).map((l) => {
    let r = "";
    const o = l.tags || [];
    for (const [i, s] of Object.entries(a))
      if (s.some((d) => o.includes(d))) {
        r = i;
        break;
      }
    return {
      id: l.id || l.name,
      name: l.name || l.id,
      description: l.description || "",
      tags: o,
      transport: l.transport || "stdio",
      config: l.config,
      env: Array.isArray(l.env) ? l.env : void 0,
      source: l.source,
      icon: l.icon,
      icon_url: l.icon_url || l.icon_path || void 0,
      category: r
    };
  }), categories: t };
}
async function wo() {
  const e = await xn("skills/manifest.json"), t = [], a = /* @__PURE__ */ new Set();
  function n(l, r) {
    for (const o of l) {
      if ((o == null ? void 0 : o.type) === "collection" && Array.isArray(o.children)) {
        n(o.children, o.name || r);
        continue;
      }
      const i = String((o == null ? void 0 : o.path) || (o == null ? void 0 : o.name) || "").trim();
      if (!i) continue;
      const s = i.split("/").map(encodeURIComponent).join("/"), d = `${Fa}/skills/${s}`, g = typeof o.tag == "string" && o.tag.trim() ? o.tag.trim() : void 0;
      g && a.add(g);
      let f = null;
      if (typeof o.metadata == "string") {
        const c = o.metadata.match(/version:\s*"?([\d.]+)"?/);
        c && (f = c[1]);
      }
      t.push({
        sourceId: "oss:ugsci-official",
        sourceLabel: "UGSci",
        sourcePath: r ? `UGSci/${r}` : "UGSci",
        name: o.name || i.split("/").pop() || i,
        description: o.description || "",
        source_url: d,
        html_url: d,
        version: f,
        author: null,
        tag: g,
        isOfficial: !0
      });
    }
  }
  if (Array.isArray(e) ? n(
    e.map(
      (l) => typeof l == "string" ? { name: l, path: l } : l
    )
  ) : e && Array.isArray(e.skills) && n(e.skills), t.length === 0)
    throw new Error("OSS 技能清单中没有可用技能");
  return {
    skills: t,
    categories: Array.from(a).map((l) => ({
      id: l,
      label: l
    }))
  };
}
async function So() {
  const e = await xn("agents/manifest.json"), t = [], a = {};
  if (e.tag_groups && typeof e.tag_groups == "object")
    for (const [l, r] of Object.entries(e.tag_groups))
      Array.isArray(r) && (a[l] = r, t.push({
        id: l,
        label: ct(l),
        tags: r
      }));
  return { agents: (e.agents || []).map((l) => {
    let r = "";
    const o = l.tags || [];
    for (const [i, s] of Object.entries(a))
      if (s.some((d) => o.includes(d))) {
        r = i;
        break;
      }
    return {
      id: l.id || l.name,
      name: l.name || l.id,
      description: l.description || "",
      path: l.path || "",
      tags: o,
      config: l.config,
      instructions: l.instructions,
      skills_manifest: l.skills_manifest,
      drivers: l.drivers,
      category: r
    };
  }), categories: t };
}
async function xo(e) {
  const t = e.filter((o) => o.enabled), a = await Promise.all(
    t.map(async (o) => {
      try {
        if (o.platform === "oss") {
          const { skills: i, categories: s } = await vo(o);
          return { skills: i, categories: s, error: null, label: o.label };
        } else
          return { skills: await Eo(o), categories: [], error: null, label: o.label };
      } catch (i) {
        return {
          skills: [],
          categories: [],
          error: i.message || String(i),
          label: o.label
        };
      }
    })
  ), n = [], l = [], r = [];
  for (const o of a)
    n.push(...o.skills), l.push(...o.categories), o.error && r.push({ label: o.label, message: o.error });
  return { skills: n, errors: r, categories: l };
}
function ko({
  open: e,
  onClose: t,
  sources: a,
  onChange: n
}) {
  const l = $().React, { useState: r } = l, {
    Modal: o,
    Input: i,
    Button: s,
    List: d,
    Tag: g,
    Switch: f,
    Typography: c,
    Tooltip: m,
    message: u
  } = $().antd, {
    PlusOutlined: y,
    DeleteOutlined: h,
    LinkOutlined: x,
    GithubOutlined: T
  } = $().antdIcons || {}, { Text: k } = c, [M, N] = r(""), [H, X] = r(""), j = () => {
    const P = M.trim();
    if (!P) return;
    const b = Ka(P);
    if (!b) {
      u.error("无效的仓库 URL，请输入类似 https://github.com/owner/repo/tree/main/skills 或 https://gitee.com/owner/repo/tree/master/skills 的链接");
      return;
    }
    const v = Va(b.owner, b.repo, b.skillsPath, b.platform);
    if (a.some((B) => B.id === v)) {
      u.warning("该源已存在");
      return;
    }
    const I = {
      id: v,
      url: P,
      label: b.label,
      owner: b.owner,
      repo: b.repo,
      ref: b.ref,
      skillsPath: b.skillsPath,
      enabled: !0,
      platform: b.platform,
      accessToken: H.trim() || void 0
    }, C = [...a, I];
    $t(C), n(C), N(""), X(""), u.success(`已添加源: ${b.label}`);
  }, R = (P, b) => {
    const v = a.map(
      (I) => I.id === P ? { ...I, enabled: b } : I
    );
    $t(v), n(v);
  }, W = (P, b) => {
    const v = a.map(
      (I) => I.id === P ? { ...I, accessToken: b.trim() || void 0 } : I
    );
    $t(v), n(v);
  }, Q = (P) => {
    const b = a.filter((v) => v.id !== P);
    $t(b), n(b), u.success("已移除源");
  };
  return l.createElement(
    o,
    {
      open: e,
      onCancel: t,
      title: l.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 8 } },
        T ? l.createElement(T, { style: { fontSize: 18 } }) : null,
        l.createElement("span", null, "配置技能源")
      ),
      footer: l.createElement(
        s,
        { onClick: t },
        "关闭"
      ),
      width: 640
    },
    l.createElement(
      "div",
      { style: { marginBottom: 16 } },
      l.createElement(
        k,
        { type: "secondary", style: { fontSize: 12, display: "block", marginBottom: 8 } },
        "添加 GitHub 或 Gitee 仓库作为技能源，系统将从该仓库的指定目录获取技能列表。支持格式："
      ),
      l.createElement(
        "div",
        { style: { display: "flex", gap: 8, alignItems: "center" } },
        l.createElement(i, {
          placeholder: "https://github.com/owner/repo/tree/main/skills 或 https://gitee.com/owner/repo/tree/master/skills",
          value: M,
          onChange: (P) => N(P.target.value),
          onPressEnter: j,
          prefix: x ? l.createElement(x) : void 0,
          style: { flex: 1 }
        }),
        l.createElement(
          s,
          {
            type: "primary",
            icon: y ? l.createElement(y) : void 0,
            onClick: j
          },
          "添加"
        )
      ),
      // Gitee token input (shown when URL looks like a Gitee link)
      M.trim() && M.trim().toLowerCase().includes("gitee.com") ? l.createElement(
        "div",
        { style: { marginTop: 8, display: "flex", gap: 8, alignItems: "center" } },
        l.createElement(
          k,
          { type: "secondary", style: { fontSize: 12, whiteSpace: "nowrap" } },
          "Gitee Token:"
        ),
        l.createElement(i.Password, {
          placeholder: "私有仓库请填写 Gitee 私人令牌（可选）",
          value: H,
          onChange: (P) => X(P.target.value),
          style: { flex: 1 }
        })
      ) : null
    ),
    l.createElement(
      "div",
      { style: { marginBottom: 8, display: "flex", alignItems: "center", justifyContent: "space-between" } },
      l.createElement(k, { strong: !0 }, `已配置源 (${a.length})`)
    ),
    l.createElement(d, {
      size: "small",
      bordered: !0,
      dataSource: a,
      renderItem: (P) => l.createElement(
        d.Item,
        {
          actions: [
            l.createElement(
              m,
              { title: P.enabled ? "点击禁用" : "点击启用" },
              l.createElement(f, {
                size: "small",
                checked: P.enabled,
                onChange: (b) => R(P.id, b)
              })
            ),
            l.createElement(
              m,
              { title: "移除此源" },
              l.createElement(
                s,
                {
                  size: "small",
                  type: "text",
                  danger: !0,
                  icon: h ? l.createElement(h) : void 0,
                  onClick: () => Q(P.id)
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
            { style: { display: "flex", alignItems: "center", gap: 6, marginBottom: 4 } },
            l.createElement(
              g,
              { color: P.platform === "gitee" ? "orange" : P.platform === "oss" ? "green" : "blue", style: { fontSize: 11 } },
              P.platform === "gitee" ? "Gitee" : P.platform === "oss" ? "OSS" : "GitHub"
            ),
            l.createElement(
              g,
              { style: { fontSize: 11 } },
              P.label
            ),
            P.skillsPath ? l.createElement(
              k,
              { type: "secondary", style: { fontSize: 11 } },
              `/${P.skillsPath}`
            ) : null,
            P.platform !== "oss" ? l.createElement(
              k,
              { type: "secondary", style: { fontSize: 11 } },
              `@${P.ref}`
            ) : null
          ),
          l.createElement(
            k,
            {
              type: "secondary",
              style: { fontSize: 11, wordBreak: "break-all" }
            },
            P.url
          ),
          // Gitee token input for existing Gitee sources
          P.platform === "gitee" ? l.createElement(
            "div",
            { style: { marginTop: 6, display: "flex", gap: 6, alignItems: "center" } },
            l.createElement(
              k,
              { type: "secondary", style: { fontSize: 11, whiteSpace: "nowrap" } },
              "Token:"
            ),
            l.createElement(i.Password, {
              size: "small",
              placeholder: "Gitee 私人令牌（可选，用于私有仓库）",
              value: P.accessToken || "",
              onChange: (b) => W(P.id, b.target.value),
              style: { flex: 1 }
            })
          ) : null
        )
      )
    })
  );
}
function ma({
  open: e,
  onClose: t,
  sources: a,
  onChange: n,
  type: l
}) {
  const r = $().React, { useState: o } = r, {
    Modal: i,
    Input: s,
    Button: d,
    List: g,
    Tag: f,
    Switch: c,
    Typography: m,
    Tooltip: u,
    message: y
  } = $().antd, {
    PlusOutlined: h,
    DeleteOutlined: x,
    LinkOutlined: T,
    ApiOutlined: k,
    UserOutlined: M,
    ImportOutlined: N,
    ExportOutlined: H,
    CopyOutlined: X
  } = $().antdIcons || {}, { Text: j } = m, [R, W] = o(""), [Q, P] = o(""), [b, v] = o(""), [I, C] = o(!1), B = l === "mcp" ? "MCP" : "专家模板", D = l === "mcp" ? k ? r.createElement(k, { style: { fontSize: 18 } }) : null : M ? r.createElement(M, { style: { fontSize: 18 } }) : null, L = () => {
    const _ = R.trim(), q = Q.trim();
    if (!_) return;
    const re = q || _.slice(0, 40), Y = `${l}:${_}`;
    if (a.some((O) => O.id === Y)) {
      y.warning("该源已存在");
      return;
    }
    const K = {
      id: Y,
      label: re,
      url: _,
      enabled: !0,
      type: l
    }, ce = [...a, K];
    l === "mcp" ? zt(ce) : At(ce), n(ce), W(""), P(""), y.success(`已添加${B}源: ${re}`);
  }, z = (_, q) => {
    const re = a.map(
      (Y) => Y.id === _ ? { ...Y, enabled: q } : Y
    );
    l === "mcp" ? zt(re) : At(re), n(re);
  }, E = (_) => {
    const q = a.filter((re) => re.id !== _);
    l === "mcp" ? zt(q) : At(q), n(q), y.success("已移除源");
  }, ee = () => {
    const _ = JSON.stringify(
      { type: l, sources: a },
      null,
      2
    );
    try {
      navigator.clipboard.writeText(_), y.success(`${B}源已复制到剪贴板（${a.length} 个源）`);
    } catch {
      const q = document.createElement("textarea");
      q.value = _, document.body.appendChild(q), q.select(), document.execCommand("copy"), document.body.removeChild(q), y.success(`${B}源已复制到剪贴板（${a.length} 个源）`);
    }
  }, J = () => {
    const _ = b.trim();
    if (!_) {
      y.warning("请粘贴 JSON 内容");
      return;
    }
    try {
      const q = JSON.parse(_);
      let re = [];
      if (Array.isArray(q))
        re = q;
      else if (q && Array.isArray(q.sources))
        re = q.sources;
      else if (q && typeof q == "object")
        re = [q];
      else
        throw new Error("Invalid format");
      const Y = re.filter(
        (oe) => oe && typeof oe.url == "string" && typeof oe.label == "string"
      );
      if (Y.length === 0) {
        y.error("未找到有效的源数据");
        return;
      }
      const K = new Set(a.map((oe) => oe.id)), ce = [];
      for (const oe of Y) {
        const pe = oe.id || `${l}:${oe.url}`;
        K.has(pe) || ce.push({
          id: pe,
          label: oe.label,
          url: oe.url,
          enabled: oe.enabled !== !1,
          type: l
        });
      }
      if (ce.length === 0) {
        y.info("所有源均已存在，无新增");
        return;
      }
      const O = [...a, ...ce];
      l === "mcp" ? zt(O) : At(O), n(O), v(""), C(!1), y.success(`成功导入 ${ce.length} 个${B}源`);
    } catch (q) {
      y.error(`JSON 解析失败: ${q.message || "格式错误"}`);
    }
  };
  return r.createElement(
    i,
    {
      open: e,
      onCancel: t,
      title: r.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 8 } },
        D,
        r.createElement("span", null, `配置${B}源`)
      ),
      footer: r.createElement(
        "div",
        { style: { display: "flex", justifyContent: "space-between" } },
        r.createElement(
          "div",
          { style: { display: "flex", gap: 8 } },
          r.createElement(
            d,
            {
              icon: H ? r.createElement(H) : void 0,
              onClick: ee,
              disabled: a.length === 0,
              size: "small"
            },
            "导出到剪贴板"
          ),
          r.createElement(
            d,
            {
              icon: N ? r.createElement(N) : void 0,
              onClick: () => C(!I),
              size: "small"
            },
            I ? "隐藏导入" : "导入JSON"
          )
        ),
        r.createElement(
          d,
          { onClick: t },
          "关闭"
        )
      ),
      width: 680
    },
    // Description
    r.createElement(
      j,
      { type: "secondary", style: { fontSize: 12, display: "block", marginBottom: 12 } },
      `配置${B}源地址，支持从远程仓库或团队共享的 JSON 导入${B}配置。`
    ),
    // Import section (collapsible)
    I ? r.createElement(
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
      r.createElement(
        j,
        { strong: !0, style: { fontSize: 12, display: "block", marginBottom: 8 } },
        `粘贴${B}源 JSON（支持从导出的剪贴板内容粘贴）`
      ),
      r.createElement(s.TextArea, {
        placeholder: l === "mcp" ? `{
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
        onChange: (_) => v(_.target.value),
        autoSize: { minRows: 4, maxRows: 10 },
        style: { fontFamily: "monospace", fontSize: 12 }
      }),
      r.createElement(
        "div",
        { style: { marginTop: 8, display: "flex", gap: 8 } },
        r.createElement(
          d,
          {
            type: "primary",
            size: "small",
            onClick: J
          },
          "导入"
        ),
        r.createElement(
          d,
          {
            size: "small",
            onClick: () => v("")
          },
          "清空"
        )
      )
    ) : null,
    // Add new source
    r.createElement(
      "div",
      { style: { marginBottom: 16, display: "flex", gap: 8, alignItems: "center" } },
      r.createElement(s, {
        placeholder: "源名称（可选，如：团队MCP仓库）",
        value: Q,
        onChange: (_) => P(_.target.value),
        style: { width: 200 }
      }),
      r.createElement(s, {
        placeholder: l === "mcp" ? "https://raw.githubusercontent.com/team/mcp-registry/main/mcp.json" : "https://raw.githubusercontent.com/team/expert-registry/main/experts.json",
        value: R,
        onChange: (_) => W(_.target.value),
        onPressEnter: L,
        prefix: T ? r.createElement(T) : void 0,
        style: { flex: 1 }
      }),
      r.createElement(
        d,
        {
          type: "primary",
          icon: h ? r.createElement(h) : void 0,
          onClick: L
        },
        "添加"
      )
    ),
    // Source list
    r.createElement(
      "div",
      {
        style: {
          marginBottom: 8,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between"
        }
      },
      r.createElement(
        j,
        { strong: !0 },
        `已配置源 (${a.length})`
      )
    ),
    r.createElement(g, {
      size: "small",
      bordered: !0,
      dataSource: a,
      renderItem: (_) => r.createElement(
        g.Item,
        {
          actions: [
            r.createElement(
              u,
              { title: _.enabled ? "点击禁用" : "点击启用" },
              r.createElement(c, {
                size: "small",
                checked: _.enabled,
                onChange: (q) => z(_.id, q)
              })
            ),
            r.createElement(
              u,
              { title: "移除此源" },
              r.createElement(
                d,
                {
                  size: "small",
                  type: "text",
                  danger: !0,
                  icon: x ? r.createElement(x) : void 0,
                  onClick: () => E(_.id)
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
            {
              style: {
                display: "flex",
                alignItems: "center",
                gap: 6,
                marginBottom: 4
              }
            },
            r.createElement(
              f,
              {
                color: l === "mcp" ? "purple" : "blue",
                style: { fontSize: 11 }
              },
              _.label
            ),
            _.enabled ? null : r.createElement(
              f,
              { style: { fontSize: 10 } },
              "已禁用"
            )
          ),
          r.createElement(
            j,
            {
              type: "secondary",
              style: { fontSize: 11, wordBreak: "break-all" }
            },
            _.url
          )
        )
      )
    }),
    // Share hint
    r.createElement(
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
      r.createElement(
        "span",
        null,
        "💡 ",
        "点击「导出到剪贴板」可复制所有源配置，分享给团队成员后粘贴到「导入JSON」即可快速配置。"
      )
    )
  );
}
async function Co() {
  return se("/market/providers");
}
async function To(e) {
  return se(
    `/market/categories?lang=${encodeURIComponent(e)}`
  );
}
async function _o(e, t, a, n, l) {
  return se("/market/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: e,
      provider_pages: t,
      limit: a,
      lang: n,
      category: l || void 0
    })
  });
}
function ua(e) {
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
async function pa(e, t) {
  const a = { bundle_url: e };
  return t && (a.access_token = t), se("/skills/pool/import", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(a)
  });
}
function Io() {
  const e = $().React, { useState: t, useEffect: a, useCallback: n, useMemo: l, useRef: r } = e, {
    Spin: o,
    Empty: i,
    Input: s,
    Button: d,
    message: g,
    Row: f,
    Col: c,
    Card: m,
    Tag: u,
    Tooltip: y,
    Typography: h,
    Select: x,
    Drawer: T,
    Descriptions: k,
    Tabs: M,
    Badge: N,
    Progress: H,
    Modal: X,
    Alert: j
  } = $().antd, {
    ReloadOutlined: R,
    SearchOutlined: W,
    DownloadOutlined: Q,
    AppstoreOutlined: P,
    ShopOutlined: b,
    CheckCircleOutlined: v,
    LoadingOutlined: I,
    UserOutlined: C,
    UserAddOutlined: B,
    SettingOutlined: D,
    GithubOutlined: L,
    ApiOutlined: z
  } = $().antdIcons || {}, { Text: E, Paragraph: ee, Title: J } = h, [_, q] = t("skills"), [re, Y] = t([]), [K, ce] = t([]), [O, oe] = t([]), [pe, ie] = t(""), [le, ye] = t(""), [Ee, Ce] = t(!1), [Oe, we] = t(!1), [ne, Se] = t(
    {}
  ), [he, Z] = t(null), [de, fe] = t({}), [V, S] = t([]), [me, F] = t(""), [w, ae] = t(""), [ue, ze] = t(""), [Te, Re] = t({}), [Be, Fe] = t(""), [We, Ue] = t(/* @__PURE__ */ new Set()), [xe, Le] = t(null), [te, Ae] = t({}), [$e, Me] = t([]), [Je, qe] = t([]), [Ie, St] = t([]), [Kt, mt] = t(""), [Xe, xt] = t(!1), [tl, Tn] = t(!1), [nl, _n] = t([]), [al, In] = t(!1), [ll, zn] = t([]), [rl, An] = t(!1), [$n, Pn] = t([]), [On, Mn] = t([]), [Ln, Rn] = t(!1), [tt, Bn] = t(""), [Un, jn] = t([]), [Nn, Dn] = t([]), [Gn, Fn] = t(!1), [nt, Wn] = t(""), [Vt, Hn] = t(!1), [Ne, kt] = t(null), [ut, ol] = t([]), pt = r(null);
  a(() => {
    Promise.all([
      Co().catch(() => []),
      To("zh").catch(() => []),
      Ht().catch(() => [])
    ]).then(([p, U, G]) => {
      Y(p), ce(U), S(G), G.length > 0 && (F(G[0].id), Fe(G[0].id));
    });
  }, []);
  const Ct = n(async (p) => {
    const U = p ?? yo();
    if (Me(p || U), U.filter((ge) => ge.enabled).length === 0) {
      qe([]);
      return;
    }
    xt(!0);
    try {
      const { skills: ge, errors: be, categories: Pe } = await xo(U);
      if (qe(ge), ol(Pe), be.length > 0) {
        for (const ke of be)
          console.warn(`[ugsci] GitHub source '${ke.label}' error: ${ke.message}`);
        g.warning(
          `部分源加载失败: ${be.map((ke) => ke.label).join(", ")}`
        );
      }
    } catch (ge) {
      g.error(ge.message || "加载技能源失败"), qe([]);
    } finally {
      xt(!1);
    }
  }, []), Xt = n(async () => {
    var ge, be, Pe;
    Rn(!0), Fn(!0), xt(!0);
    const [p, U, G] = await Promise.allSettled([
      bo(),
      So(),
      wo()
    ]);
    if (p.status === "fulfilled" ? (Pn(p.value.servers), Mn(p.value.categories)) : (console.warn(`[ugsci] MCP manifest error: ${((ge = p.reason) == null ? void 0 : ge.message) || p.reason}`), Pn([]), Mn([])), Rn(!1), U.status === "fulfilled" ? (jn(U.value.agents), Dn(U.value.categories)) : (console.warn(`[ugsci] Agents manifest error: ${((be = U.reason) == null ? void 0 : be.message) || U.reason}`), jn([]), Dn([])), Fn(!1), G.status === "fulfilled")
      St(G.value.skills), mt("");
    else {
      const ke = ((Pe = G.reason) == null ? void 0 : Pe.message) || String(G.reason);
      console.warn(`[ugsci] Skills manifest error: ${ke}`), St([]), mt(ke);
    }
    xt(!1);
  }, []);
  a(() => {
    Ct(), Xt(), _n(po()), zn(go());
  }, [Ct, Xt]);
  const Tt = n(
    async (p, U, G) => {
      Ce(!0);
      try {
        const ge = await _o(
          p,
          G,
          20,
          "zh",
          U || void 0
        );
        G === void 0 || Object.keys(G).length === 0 ? oe(ge.results) : oe((ke) => [...ke, ...ge.results]);
        const be = Object.values(ge.by_provider || {}).some(
          (ke) => ke.has_more
        );
        we(be);
        const Pe = {};
        for (const [ke, Qe] of Object.entries(ge.by_provider || {}))
          Pe[ke] = (G[ke] || 1) + 1;
        if (Se(Pe), ge.errors.length > 0)
          for (const ke of ge.errors)
            console.warn(
              `[ugsci] Market provider '${ke.provider}' error: ${ke.message}`
            );
      } catch (ge) {
        g.error(ge.message || "搜索市场失败"), oe([]);
      } finally {
        Ce(!1);
      }
    },
    []
  );
  a(() => (pt.current && clearTimeout(pt.current), pt.current = setTimeout(() => {
    Tt(pe, le, {});
  }, 400), () => {
    pt.current && clearTimeout(pt.current);
  }), [pe, le, Tt]);
  const sl = () => {
    Tt(pe, le, ne);
  }, Jn = async (p) => {
    const U = `${p.source}:${p.slug}`;
    try {
      fe((ge) => ({ ...ge, [U]: "installing" }));
      const G = await pa(p.source_url);
      G.installed && g.success(
        `技能「${G.name || p.name}」已安装到技能池，可在技能中心查看`
      ), fe((ge) => {
        const be = { ...ge };
        return delete be[U], be;
      });
    } catch (G) {
      g.error(ua(G) || "安装技能失败"), fe((ge) => {
        const be = { ...ge };
        return delete be[U], be;
      });
    }
  }, il = (p) => {
    window.history.pushState({}, "", p), window.dispatchEvent(new PopStateEvent("popstate"));
  }, cl = async (p) => {
    const U = `github:${p.sourceId}:${p.name}`, G = $e.find((be) => be.id === p.sourceId), ge = (G == null ? void 0 : G.accessToken) || void 0;
    try {
      fe((Pe) => ({ ...Pe, [U]: "installing" }));
      const be = await pa(p.source_url, ge);
      be.installed && g.success(
        `技能「${be.name || p.name}」已安装到技能池，可在技能中心查看`
      ), fe((Pe) => {
        const ke = { ...Pe };
        return delete ke[U], ke;
      });
    } catch (be) {
      g.error(ua(be) || "安装技能失败"), fe((Pe) => {
        const ke = { ...Pe };
        return delete ke[U], ke;
      });
    }
  }, et = l(() => {
    const p = [], U = /* @__PURE__ */ new Set();
    for (const G of [...Ie, ...Je]) {
      const ge = G.source_url || `${G.sourceLabel}:${G.name}`;
      U.has(ge) || (U.add(ge), p.push(G));
    }
    return p;
  }, [Ie, Je]), qn = l(() => {
    const p = [], U = /* @__PURE__ */ new Set();
    if (ut.length > 0)
      for (const G of ut)
        U.has(G.id) || (U.add(G.id), p.push(G));
    for (const G of et)
      G.tag && !U.has(G.tag) && (U.add(G.tag), p.push({ id: G.tag, label: G.tag }));
    for (const G of et)
      !G.isOfficial && G.sourceLabel && !U.has(G.sourceLabel) && (U.add(G.sourceLabel), p.push({ id: G.sourceLabel, label: G.sourceLabel }));
    return p;
  }, [et, ut]), Qt = l(() => {
    let p = et;
    if (le) {
      const U = ut.find((G) => G.id === le);
      U && U.tags ? p = p.filter(
        (G) => G.tag && U.tags.includes(G.tag) || G.sourceLabel === le
      ) : p = p.filter(
        (G) => G.tag === le || G.sourceLabel === le
      );
    }
    if (pe.trim()) {
      const U = pe.toLowerCase();
      p = p.filter(
        (G) => {
          var ge;
          return G.name.toLowerCase().includes(U) || ((ge = G.description) == null ? void 0 : ge.toLowerCase().includes(U));
        }
      );
    }
    return p;
  }, [et, pe, le, ut]), Kn = re.filter((p) => p.available), at = l(() => le ? O.filter((p) => {
    const U = Kn.find((G) => G.key === p.source);
    return (U == null ? void 0 : U.label) === le;
  }) : O, [O, le, Kn]), dl = e.createElement(
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
        prefix: W ? e.createElement(W) : void 0,
        value: pe,
        onChange: (p) => ie(p.target.value),
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
        d,
        {
          icon: L ? e.createElement(L) : void 0,
          onClick: () => Tn(!0),
          size: "small"
        },
        "配置技能源"
      )
    ),
    // Dynamic category filter tags (from OSS manifest tags + imported sources)
    Kt && et.length === 0 ? e.createElement(j, {
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
        E,
        { type: "secondary", style: { fontSize: 12, marginRight: 4 } },
        "分类:"
      ),
      e.createElement(
        u,
        {
          style: {
            fontSize: 11,
            cursor: "pointer",
            borderRadius: 12
          },
          color: le === "" ? "blue" : void 0,
          onClick: () => ye("")
        },
        "全部"
      ),
      ...qn.map((p) => {
        const U = Je.some(
          (G) => !G.isOfficial && G.sourceLabel === p.id
        );
        return e.createElement(
          u,
          {
            key: p.id,
            style: {
              fontSize: 11,
              cursor: "pointer",
              borderRadius: 12
            },
            color: le === p.id ? U ? "blue" : "geekblue" : void 0,
            icon: U && L ? e.createElement(L) : void 0,
            onClick: () => ye(
              le === p.id ? "" : p.id
            )
          },
          p.label
        );
      })
    ) : null,
    // GitHub skills section
    Xe && et.length === 0 ? e.createElement(
      "div",
      { style: { textAlign: "center", padding: 40, marginBottom: 16 } },
      e.createElement(o, { size: "large" }, e.createElement("div", { style: { minHeight: 60, display: "flex", alignItems: "center", justifyContent: "center" } }, "正在加载技能..."))
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
        L ? e.createElement(L, {
          style: { fontSize: 14, color: "#1677ff" }
        }) : null,
        e.createElement(
          E,
          { strong: !0, style: { fontSize: 13 } },
          `技能市场 (${Qt.length})`
        )
      ),
      e.createElement(
        f,
        { gutter: [12, 12] },
        ...Qt.map((p) => {
          const U = `github:${p.sourceId}:${p.name}`, G = de[U];
          return e.createElement(
            c,
            { key: U, xs: 24, sm: 12, md: 8, lg: 6 },
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
                L ? e.createElement(L, {
                  style: { fontSize: 18, color: "var(--ant-color-text-secondary, #57606a)" }
                }) : e.createElement(
                  "span",
                  { style: { fontSize: 18 } },
                  "📦"
                ),
                e.createElement(
                  y,
                  { title: p.name },
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
                    p.name
                  )
                )
              ),
              e.createElement(
                ee,
                {
                  type: "secondary",
                  style: { fontSize: 11, margin: 0, lineHeight: 1.4 },
                  ellipsis: { rows: 2 }
                },
                p.description || "暂无描述"
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
                  p.sourcePath || p.sourceLabel ? e.createElement(
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
                    p.sourcePath || p.sourceLabel
                  ) : null,
                  // Show tag as category badge
                  p.tag ? e.createElement(
                    u,
                    { color: "geekblue", style: { fontSize: 10 } },
                    p.tag
                  ) : null,
                  p.version ? e.createElement(
                    u,
                    { style: { fontSize: 10 } },
                    `v${p.version}`
                  ) : null
                ),
                G ? e.createElement(
                  d,
                  {
                    size: "small",
                    disabled: !0,
                    icon: I ? e.createElement(I) : void 0
                  },
                  "安装中"
                ) : e.createElement(
                  d,
                  {
                    type: "primary",
                    size: "small",
                    icon: Q ? e.createElement(Q) : void 0,
                    onClick: () => cl(p)
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
      f,
      { gutter: [12, 12] },
      ...at.map((p) => {
        const U = `${p.source}:${p.slug}`, G = de[U];
        return e.createElement(
          c,
          { key: U, xs: 24, sm: 12, md: 8, lg: 6 },
          e.createElement(
            m,
            {
              hoverable: !0,
              size: "small",
              style: { height: "100%", cursor: "pointer" },
              onClick: () => Z(p)
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
              p.icon_url ? e.createElement("img", {
                src: p.icon_url,
                alt: p.name,
                style: { width: 24, height: 24, borderRadius: 4 }
              }) : e.createElement(
                "span",
                { style: { fontSize: 18 } },
                "📦"
              ),
              e.createElement(
                y,
                { title: p.name },
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
                  p.name
                )
              )
            ),
            e.createElement(
              ee,
              {
                type: "secondary",
                style: { fontSize: 11, margin: 0, lineHeight: 1.4 },
                ellipsis: { rows: 2 }
              },
              p.description || "暂无描述"
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
                  u,
                  { color: "geekblue", style: { fontSize: 10 } },
                  p.source
                ),
                p.version ? e.createElement(
                  u,
                  { style: { fontSize: 10 } },
                  `v${p.version}`
                ) : null
              ),
              G ? e.createElement(
                d,
                {
                  size: "small",
                  disabled: !0,
                  icon: I ? e.createElement(I) : void 0
                },
                "安装中"
              ) : e.createElement(
                d,
                {
                  type: "primary",
                  size: "small",
                  icon: Q ? e.createElement(Q) : void 0,
                  onClick: (ge) => {
                    ge.stopPropagation(), Jn(p);
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
    Oe && !Ee ? e.createElement(
      "div",
      { style: { textAlign: "center", marginTop: 16 } },
      e.createElement(
        d,
        { onClick: sl, loading: Ee },
        "加载更多"
      )
    ) : null,
    // Detail Drawer
    he ? e.createElement(
      T,
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
          d,
          {
            type: "primary",
            icon: Q ? e.createElement(Q) : void 0,
            onClick: () => {
              Jn(he);
            }
          },
          "安装到技能池"
        )
      },
      e.createElement(
        k,
        { column: 1, bordered: !0, size: "small" },
        e.createElement(
          k.Item,
          { label: "来源" },
          he.source
        ),
        e.createElement(
          k.Item,
          { label: "描述" },
          he.description || "-"
        ),
        he.version ? e.createElement(
          k.Item,
          { label: "版本" },
          he.version
        ) : null,
        he.author ? e.createElement(
          k.Item,
          { label: "作者" },
          he.author
        ) : null,
        e.createElement(
          k.Item,
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
            ([p, U]) => e.createElement(
              "div",
              { key: p, style: { textAlign: "center" } },
              e.createElement(
                "div",
                {
                  style: {
                    fontSize: 18,
                    fontWeight: 600,
                    color: "#1677ff"
                  }
                },
                String(U)
              ),
              e.createElement(
                E,
                { type: "secondary", style: { fontSize: 11 } },
                p
              )
            )
          )
        )
      ) : null
    ) : null
  ), Yt = l(() => {
    let p = Un;
    if (nt && (p = p.filter((U) => U.category === nt)), w.trim()) {
      const U = w.toLowerCase();
      p = p.filter(
        (G) => G.name.toLowerCase().includes(U) || G.description.toLowerCase().includes(U) || G.tags.some((ge) => ge.toLowerCase().includes(U))
      );
    }
    return p;
  }, [Un, w, nt]), ml = async (p) => {
    if (!Vt) {
      Hn(!0);
      try {
        let U = p.description;
        if (p.instructions)
          try {
            const be = p.instructions.replace(/^\/+/, ""), Pe = await Rt(be);
            Pe.ok && (U = await Pe.text());
          } catch {
          }
        let G = [];
        if (p.skills_manifest)
          try {
            const be = p.skills_manifest.replace(/^\/+/, ""), Pe = await Rt(be);
            if (Pe.ok) {
              const ke = await Pe.json();
              Array.isArray(ke) ? G = ke.map((Qe) => typeof Qe == "string" ? Qe : Qe.name).filter(Boolean) : ke.skills && (G = ke.skills.map((Qe) => typeof Qe == "string" ? Qe : Qe.name).filter(Boolean));
            }
          } catch {
          }
        const ge = await se("/agents", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: p.name,
            description: p.description,
            skill_names: G
          })
        });
        await Lt(ge.id, "AGENTS.md", U), g.success(`专家「${p.name}」创建成功，已跳转至专家`), il("/ugsci-experts");
      } catch (U) {
        g.error(U.message || "创建专家失败");
      } finally {
        Hn(!1);
      }
    }
  }, Vn = n(async (p) => {
    if (p)
      try {
        const U = await En(p);
        Ue(new Set(U.map((G) => G.key)));
      } catch {
        Ue(/* @__PURE__ */ new Set());
      }
  }, []);
  a(() => {
    Be && Vn(Be);
  }, [Be, Vn]);
  const ul = async (p) => {
    if (!Be) {
      g.warning("请先选择目标专家");
      return;
    }
    if (io(p)) {
      const U = Object.entries(p.env), G = {};
      for (const [ge] of U)
        G[ge] = "";
      Ae(G), Le(p);
      return;
    }
    await Xn(p, p.env || {});
  }, Xn = async (p, U) => {
    Re((G) => ({ ...G, [p.id]: !0 }));
    try {
      const G = p.id;
      await vn(Be, {
        client_key: G,
        client: {
          name: p.name,
          description: p.description,
          enabled: !0,
          transport: p.transport,
          url: p.url || "",
          command: p.command || "",
          args: p.args || [],
          env: U,
          cwd: p.cwd || "",
          headers: p.headers || {}
        }
      }), g.success(`MCP「${p.name}」已添加到当前专家`), Ue((ge) => new Set(ge).add(G));
    } catch (G) {
      g.error(G.message || `添加 MCP「${p.name}」失败`);
    } finally {
      Re((G) => ({ ...G, [p.id]: !1 }));
    }
  }, pl = async () => {
    if (!xe) return;
    const p = [];
    for (const [G, ge] of Object.entries(te))
      if (!ge || !ge.trim()) {
        const be = ca[G];
        p.push((be == null ? void 0 : be.label) || G);
      }
    if (p.length > 0) {
      g.warning(`请填写以下配置项: ${p.join(", ")}`);
      return;
    }
    const U = xe;
    Le(null), Ae({}), await Xn(U, { ...te });
  }, Zt = l(() => {
    let p = $n;
    if (tt && (p = p.filter((U) => U.category === tt)), ue.trim()) {
      const U = ue.toLowerCase();
      p = p.filter(
        (G) => G.name.toLowerCase().includes(U) || G.description.toLowerCase().includes(U) || G.tags.some((ge) => ge.toLowerCase().includes(U))
      );
    }
    return p.map(uo);
  }, [$n, ue, tt]), gl = e.createElement(
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
        prefix: W ? e.createElement(W) : void 0,
        value: ue,
        onChange: (p) => ze(p.target.value),
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
        e.createElement(x, {
          value: Be,
          onChange: (p) => Fe(p),
          style: { minWidth: 180 },
          size: "small",
          options: V.map((p) => ({ value: p.id, label: p.name }))
        })
      ),
      // Configure MCP source button
      e.createElement(
        d,
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
        E,
        { type: "secondary", style: { fontSize: 12, marginRight: 4 } },
        "分类:"
      ),
      e.createElement(
        u,
        {
          style: { fontSize: 11, cursor: "pointer", borderRadius: 12 },
          color: tt === "" ? "blue" : void 0,
          onClick: () => Bn("")
        },
        "全部"
      ),
      ...On.map(
        (p) => e.createElement(
          u,
          {
            key: p.id,
            style: { fontSize: 11, cursor: "pointer", borderRadius: 12 },
            color: tt === p.id ? "geekblue" : void 0,
            onClick: () => Bn(
              tt === p.id ? "" : p.id
            )
          },
          p.label
        )
      )
    ) : null,
    // MCP server cards (dynamic from OSS)
    Ln && Zt.length === 0 ? e.createElement(
      "div",
      { style: { textAlign: "center", padding: 40 } },
      e.createElement(o, { size: "large" }, e.createElement("div", { style: { minHeight: 60, display: "flex", alignItems: "center", justifyContent: "center" } }, "正在加载 MCP 服务器..."))
    ) : Zt.length === 0 ? e.createElement(i, {
      description: "未找到匹配的 MCP 服务器",
      image: i.PRESENTED_IMAGE_SIMPLE
    }) : e.createElement(
      f,
      { gutter: [12, 12] },
      ...Zt.map(
        (p) => e.createElement(
          c,
          { key: p.id, xs: 24, sm: 12, md: 8 },
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
                p.iconUrl ? e.createElement("img", {
                  src: p.iconUrl,
                  alt: p.name,
                  style: { width: 28, height: 28, objectFit: "contain" },
                  onError: (U) => {
                    U.target.style.display = "none";
                  }
                }) : p.emoji
              ),
              e.createElement(
                "div",
                { style: { flex: 1 } },
                e.createElement(
                  E,
                  { strong: !0, style: { fontSize: 14 } },
                  p.name
                ),
                e.createElement(
                  "div",
                  { style: { display: "flex", gap: 4, marginTop: 4, flexWrap: "wrap" } },
                  e.createElement(
                    u,
                    { color: "blue", style: { fontSize: 10 } },
                    p.category
                  ),
                  e.createElement(
                    u,
                    {
                      color: p.transport === "stdio" ? "purple" : "cyan",
                      style: { fontSize: 10 }
                    },
                    p.transport
                  ),
                  p.env && Object.keys(p.env).length > 0 ? e.createElement(
                    u,
                    { color: "orange", style: { fontSize: 10 } },
                    "需配置密钥"
                  ) : null
                )
              )
            ),
            // Description
            e.createElement(
              ee,
              {
                type: "secondary",
                style: { fontSize: 12, margin: 0, lineHeight: 1.5 },
                ellipsis: { rows: 3 }
              },
              p.description
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
                p.transport === "stdio" ? `${p.command} ${(p.args || []).join(" ")}` : p.url || ""
              ),
              We.has(p.id) ? e.createElement(
                d,
                { size: "small", disabled: !0 },
                "已安装"
              ) : e.createElement(
                d,
                {
                  type: "primary",
                  size: "small",
                  loading: !!Te[p.id],
                  icon: z ? e.createElement(z) : void 0,
                  onClick: () => ul(p)
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
  ), fl = xe ? e.createElement(
    X,
    {
      title: e.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 8 } },
        e.createElement("span", { style: { fontSize: 20, display: "inline-flex", alignItems: "center", justifyContent: "center", width: 24, height: 24 } }, xe.iconUrl ? e.createElement("img", { src: xe.iconUrl, alt: xe.name, style: { width: 22, height: 22, objectFit: "contain" }, onError: (p) => {
          p.target.style.display = "none";
        } }) : xe.emoji),
        e.createElement("span", null, `配置 ${xe.name} 密钥`)
      ),
      open: !!xe,
      onCancel: () => {
        Le(null), Ae({});
      },
      onOk: pl,
      okText: "安装",
      cancelText: "取消",
      width: 520,
      destroyOnClose: !0
    },
    // Description
    e.createElement(
      E,
      { type: "secondary", style: { display: "block", marginBottom: 16, fontSize: 12 } },
      xe.description
    ),
    ...Object.entries(xe.env || {}).map(([p]) => {
      const U = ca[p], G = (U == null ? void 0 : U.isSecret) !== !1;
      return e.createElement(
        "div",
        { key: p, style: { marginBottom: 16 } },
        e.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 6, marginBottom: 4 } },
          e.createElement(
            E,
            { strong: !0, style: { fontSize: 13 } },
            (U == null ? void 0 : U.label) || p
          ),
          e.createElement(
            u,
            { color: "orange", style: { fontSize: 10 } },
            "必填"
          )
        ),
        // Help text with optional link
        U ? e.createElement(
          "div",
          { style: { marginBottom: 6, fontSize: 12, color: "var(--ant-color-text-tertiary, #8c8c8c)" } },
          U.help,
          U.link ? e.createElement(
            "a",
            {
              href: U.link,
              target: "_blank",
              rel: "noopener noreferrer",
              style: { marginLeft: 4, fontSize: 12 }
            },
            "获取方式 ↗"
          ) : null
        ) : null,
        // Input field
        G ? e.createElement(s.Password, {
          placeholder: `请输入 ${(U == null ? void 0 : U.label) || p}`,
          value: te[p] || "",
          onChange: (ge) => Ae((be) => ({
            ...be,
            [p]: ge.target.value
          })),
          style: { width: "100%" }
        }) : e.createElement(s, {
          placeholder: `请输入 ${(U == null ? void 0 : U.label) || p}`,
          value: te[p] || "",
          onChange: (ge) => Ae((be) => ({
            ...be,
            [p]: ge.target.value
          })),
          style: { width: "100%" }
        }),
        // Show env key name for reference
        e.createElement(
          E,
          { type: "secondary", style: { fontSize: 11, display: "block", marginTop: 2 } },
          `环境变量名: ${p}`
        )
      );
    })
  ) : null, yl = e.createElement(
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
        prefix: W ? e.createElement(W) : void 0,
        value: w,
        onChange: (p) => ae(p.target.value),
        allowClear: !0,
        style: { maxWidth: 400, flex: 1, minWidth: 200 }
      }),
      e.createElement(
        d,
        {
          icon: C ? e.createElement(C) : void 0,
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
        E,
        { type: "secondary", style: { fontSize: 12, marginRight: 4 } },
        "分类:"
      ),
      e.createElement(
        u,
        {
          style: { fontSize: 11, cursor: "pointer", borderRadius: 12 },
          color: nt === "" ? "blue" : void 0,
          onClick: () => Wn("")
        },
        "全部"
      ),
      ...Nn.map(
        (p) => e.createElement(
          u,
          {
            key: p.id,
            style: { fontSize: 11, cursor: "pointer", borderRadius: 12 },
            color: nt === p.id ? "geekblue" : void 0,
            onClick: () => Wn(
              nt === p.id ? "" : p.id
            )
          },
          p.label
        )
      )
    ) : null,
    // Agent cards (dynamic from OSS)
    Gn && Yt.length === 0 ? e.createElement(
      "div",
      { style: { textAlign: "center", padding: 40 } },
      e.createElement(o, { size: "large" }, e.createElement("div", { style: { minHeight: 60, display: "flex", alignItems: "center", justifyContent: "center" } }, "正在加载人才市场..."))
    ) : Yt.length === 0 ? e.createElement(i, {
      description: "未找到匹配的人才",
      image: i.PRESENTED_IMAGE_SIMPLE
    }) : e.createElement(
      f,
      { gutter: [12, 12] },
      ...Yt.map(
        (p) => e.createElement(
          c,
          { key: p.id, xs: 24, sm: 12, md: 8 },
          e.createElement(
            m,
            {
              hoverable: !0,
              size: "small",
              style: { height: "100%", cursor: "pointer" },
              onClick: () => kt(p)
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
                name: p.name,
                size: 40
              }),
              e.createElement(
                "div",
                { style: { flex: 1 } },
                e.createElement(
                  E,
                  { strong: !0, style: { fontSize: 14 } },
                  p.name
                ),
                e.createElement(
                  "div",
                  { style: { display: "flex", gap: 4, marginTop: 4, flexWrap: "wrap" } },
                  p.category ? e.createElement(
                    u,
                    { color: "blue", style: { fontSize: 10 } },
                    ct(p.category)
                  ) : null,
                  p.tags.includes("mcp") ? e.createElement(
                    u,
                    { color: "purple", style: { fontSize: 10 } },
                    "MCP"
                  ) : null
                )
              )
            ),
            e.createElement(
              ee,
              {
                type: "secondary",
                style: { fontSize: 12, margin: 0, lineHeight: 1.5 },
                ellipsis: { rows: 3 }
              },
              p.description
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
                p.tags.filter((U) => U !== "agent" && U !== "template" && U !== "workspace").slice(0, 3).join(" · ") || "人才模板"
              ),
              e.createElement(
                d,
                {
                  type: "primary",
                  size: "small",
                  icon: B ? e.createElement(B) : void 0
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
  ), hl = [
    {
      key: "skills",
      label: e.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        P ? e.createElement(P, { style: { fontSize: 14 } }) : null,
        "技能市场"
      ),
      children: dl
    },
    {
      key: "mcp",
      label: e.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        z ? e.createElement(z, { style: { fontSize: 14 } }) : null,
        "MCP 市场"
      ),
      children: gl
    },
    {
      key: "experts",
      label: e.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        B ? e.createElement(B, { style: { fontSize: 14 } }) : null,
        "人才市场"
      ),
      children: yl
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
          d,
          {
            type: "primary",
            icon: R ? e.createElement(R) : void 0,
            onClick: () => {
              Tt(pe, le, {}), Ct(), Xt();
            },
            loading: Ee || Xe || Ln || Gn
          },
          "刷新"
        )
      )
    }),
    e.createElement(M, {
      items: hl,
      activeKey: _,
      onChange: (p) => q(p)
    }),
    // Skill source config modal
    e.createElement(ko, {
      open: tl,
      onClose: () => Tn(!1),
      sources: $e,
      onChange: (p) => {
        Me(p), Ct(p);
      }
    }),
    // MCP source config modal
    e.createElement(ma, {
      open: al,
      onClose: () => In(!1),
      sources: nl,
      onChange: (p) => _n(p),
      type: "mcp"
    }),
    // MCP token config modal (for templates requiring secrets)
    fl,
    // Expert source config modal
    e.createElement(ma, {
      open: rl,
      onClose: () => An(!1),
      sources: ll,
      onChange: (p) => zn(p),
      type: "expert"
    }),
    // ── Agent Detail Modal (click card to view details, then create) ──
    Ne ? e.createElement(
      X,
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
            name: Ne.name,
            size: 40
          }),
          e.createElement(
            "div",
            null,
            e.createElement(
              E,
              { strong: !0, style: { fontSize: 16 } },
              Ne.name
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
              Ne.category ? e.createElement(
                u,
                { color: "blue", style: { fontSize: 10 } },
                ct(Ne.category)
              ) : null,
              ...Ne.tags.filter(
                (p) => p !== "agent" && p !== "template" && p !== "workspace"
              ).slice(0, 5).map(
                (p) => e.createElement(
                  u,
                  { key: p, style: { fontSize: 10 } },
                  p
                )
              )
            )
          )
        ),
        open: !0,
        onCancel: () => kt(null),
        width: 640,
        footer: e.createElement(
          "div",
          { style: { textAlign: "right" } },
          e.createElement(
            d,
            {
              onClick: () => kt(null),
              style: { marginRight: 8 }
            },
            "取消"
          ),
          e.createElement(
            d,
            {
              type: "primary",
              loading: Vt,
              disabled: Vt,
              icon: B ? e.createElement(B) : void 0,
              style: je,
              onClick: async () => {
                await ml(Ne), kt(null);
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
          ee,
          {
            type: "secondary",
            style: { fontSize: 13, lineHeight: 1.7, margin: 0 }
          },
          Ne.description
        )
      ),
      // Skills manifest hint
      Ne.skills_manifest ? e.createElement(
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
      Ne.instructions ? e.createElement(
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
      Ne.drivers && Object.keys(Ne.drivers).length > 0 ? e.createElement(
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
          ...Object.entries(Ne.drivers).map(
            ([p, U]) => e.createElement(
              u,
              { key: p, color: "cyan", style: { fontSize: 11 } },
              `${p}${U && U.length > 0 ? ` (${U.join(", ")})` : ""}`
            )
          )
        )
      ) : null
    ) : null
  );
}
function zo() {
  try {
    const t = localStorage.getItem("language") || "";
    if (t) return t.split("-")[0];
  } catch {
  }
  return ((typeof navigator < "u" ? navigator.language : "") || "").split("-")[0] || "en";
}
const ga = {
  zh: "您好，UGSci 智能助手在线。无论是油气藏分析、数值模拟还是工程决策，描述您的场景，我来交付结果。",
  en: "UGSci AI assistant is online. From reservoir analysis to numerical simulation and engineering decisions — describe your scenario and I'll deliver results.",
  ja: "UGSci AIアシスタントがオンラインです。油層解析、数値シミュレーション、エンジニアリングの意思決定など、シナリオを描写してください。結果をお届けします。",
  ru: "UGSci AI-ассистент онлайн. От анализа пласта до численного моделирования и инженерных решений — опишите свой сценарий, и я предоставлю результат.",
  vi: "Trợ lý AI UGSci đang trực tuyến. Từ phân tích mỏ, mô phỏng số đến ra quyết định kỹ thuật — mô tả kịch bản của bạn, tôi sẽ giao kết quả.",
  id: "Asisten AI UGSci sedang online. Dari analisis reservoir, simulasi numerik hingga keputusan engineering — jelaskan skenario Anda, saya akan memberikan hasilnya."
}, fa = {
  zh: { label: "能告诉我你都能做点什么吗？", value: "能告诉我你都能做点什么吗" },
  en: { label: "Can you tell me what you can do?", value: "Can you tell me what you can do?" },
  ja: { label: "あなたができることを教えてください", value: "あなたができることを教えてください" },
  ru: { label: "Расскажи, что ты умеешь делать?", value: "Расскажи, что ты умеешь делать?" },
  vi: { label: "Bạn có thể cho tôi biết bạn làm được gì không?", value: "Bạn có thể cho tôi biết bạn làm được gì không?" },
  id: { label: "Bisa cerita apa saja yang bisa Anda lakukan?", value: "Bisa cerita apa saja yang bisa Anda lakukan?" }
};
function Ao() {
  const e = $(), t = e.React, { useEffect: a, useRef: n } = t, l = e.useSelectedAgent ? e.useSelectedAgent() : { id: "default" }, r = (l == null ? void 0 : l.id) || "default", o = n(null), i = n(null);
  return a(() => {
    if (o.current === r) return;
    o.current = r, gn();
    const s = zo(), d = ga[s] || ga.en, g = fa[s] || fa.en;
    let f = !1;
    return (async () => {
      var c, m;
      try {
        const u = await Jt(r);
        if (f) return;
        const y = ka(u);
        if (i.current) {
          try {
            i.current();
          } catch {
          }
          i.current = null;
        }
        const h = window.QwenPaw;
        (c = h == null ? void 0 : h.chat) != null && c.welcome && (y.length > 0 ? (i.current = h.chat.welcome.set("ugsci", {
          description: d,
          prompts: y
        }), console.info(
          `[ugsci] Injected ${y.length} welcome prompts for agent "${r}"`
        )) : (i.current = h.chat.welcome.set("ugsci", {
          description: d,
          prompts: [g]
        }), console.info(
          `[ugsci] No skills for agent "${r}" — using default prompt`
        )));
      } catch (u) {
        console.warn(
          `[ugsci] Failed to inject welcome prompts for agent "${r}":`,
          u
        );
        const y = window.QwenPaw;
        if ((m = y == null ? void 0 : y.chat) != null && m.welcome && !f) {
          if (i.current) {
            try {
              i.current();
            } catch {
            }
            i.current = null;
          }
          i.current = y.chat.welcome.set("ugsci", {
            description: d,
            prompts: [g]
          });
        }
      }
    })(), () => {
      f = !0;
    };
  }, [r]), null;
}
const $o = 256;
let De = {};
const un = /* @__PURE__ */ new Set(), Bt = () => un.forEach((e) => e()), Po = (e) => (un.add(e), () => un.delete(e)), ya = () => De;
function Ut(e, t) {
  return `${e}::${t}`;
}
function ht(e) {
  var t;
  if (!e || typeof e != "string") return null;
  try {
    const a = JSON.parse(e);
    if (Array.isArray(a)) {
      const n = (t = a.find((l) => (l == null ? void 0 : l.type) === "text")) == null ? void 0 : t.text;
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
      const n = (t = a.find((l) => (l == null ? void 0 : l.type) === "text")) == null ? void 0 : t.text;
      return typeof n == "string" ? Et(n) : null;
    }
    return a && a.ok === !1 ? a : null;
  } catch {
    return null;
  }
}
const ha = /* @__PURE__ */ new Set(["plugin_call_output", "function_call_output", "tool_call_output", "mcp_call_output", "component_call_output"]), tn = /* @__PURE__ */ new Set(["emit_ui_tree", "emit_ui_patch"]);
function Xa(e) {
  var n, l, r, o;
  if (!Array.isArray(e)) return [];
  const t = [], a = (i, s = !1) => {
    var f, c;
    if (!i || typeof i != "object") return;
    if (Array.isArray(i)) {
      if (s ? i.map((u) => {
        var y;
        return ((y = u == null ? void 0 : u.data) == null ? void 0 : y.name) ?? (u == null ? void 0 : u.name);
      }).find((u) => tn.has(String(u || ""))) : void 0)
        for (const u of i) {
          const y = ((f = u == null ? void 0 : u.data) == null ? void 0 : f.output) ?? (u == null ? void 0 : u.output) ?? ((c = u == null ? void 0 : u.data) == null ? void 0 : c.result) ?? (u == null ? void 0 : u.result);
          if (y == null) continue;
          const h = typeof y == "string" ? y : JSON.stringify(y), x = ht(h) || Et(h);
          x && t.push(x);
        }
      i.forEach((u) => a(u));
      return;
    }
    const d = i;
    if (d.type === "tool_result" && tn.has(String(d.name || ""))) {
      const u = (Array.isArray(d.output) ? d.output : []).find((T) => (T == null ? void 0 : T.type) === "text"), y = (u == null ? void 0 : u.text) ?? d.output, h = typeof y == "string" ? y : JSON.stringify(y), x = ht(h) || Et(h);
      x && t.push(x);
      return;
    }
    const g = ha.has(String(d.type || ""));
    Object.entries(d).forEach(
      ([m, u]) => a(u, g && m === "content")
    );
  };
  a(e);
  for (const i of e) {
    if (!i || typeof i != "object") continue;
    const s = i;
    if (!ha.has(String(s.type || "")) || !Array.isArray(s.content)) continue;
    const d = s.content, g = (l = (n = d[0]) == null ? void 0 : n.data) == null ? void 0 : l.name;
    if (!tn.has(g)) continue;
    const f = (o = (r = d[1]) == null ? void 0 : r.data) == null ? void 0 : o.output;
    if (f == null) continue;
    const c = typeof f == "string" ? f : JSON.stringify(f), m = ht(c) || Et(c);
    m && t.push(m);
  }
  return Array.from(new Map(t.map((i) => [`${i.kind}:${i.ui_id}:${i.revision}`, i])).values());
}
function Qa(e) {
  var o;
  const t = Ut(e.sessionId, e.uiId), a = Object.entries(De).filter(([, i]) => i.uiId === e.uiId).sort(([, i], [, s]) => s.revision - i.revision), n = De[t] || ((o = a[0]) == null ? void 0 : o[1]);
  if (n && e.revision < n.revision) return;
  const l = { ...De };
  for (const [i] of a) i !== t && delete l[i];
  l[t] = n && e.revision === n.revision ? { ...n, ...e, tree: n.tree } : e;
  const r = Object.entries(l).sort(([, i], [, s]) => s.updatedAt - i.updatedAt);
  De = Object.fromEntries(r.slice(0, $o)), Bt();
}
function Oo(e, t) {
  for (const a of Xa(t))
    !a.ui_id || !a.tree || Qa({
      schemaVersion: "1",
      uiId: a.ui_id,
      revision: a.revision || 1,
      tree: a.tree,
      sessionId: e,
      sourceToolCallId: a.tool_call_id,
      updatedAt: Date.now()
    });
}
const Mo = {
  setSnapshot: Qa,
  applyPatch(e, t, a, n) {
    var d, g;
    const l = (d = window.QwenPaw) == null ? void 0 : d.host, r = n || ((g = l == null ? void 0 : l.getCurrentSessionId) == null ? void 0 : g.call(l)) || "", o = Ut(r, e.ui_id), i = De[o] || Object.values(De).find((f) => f.uiId === e.ui_id);
    if (!i || a <= i.revision) return;
    De = { ...Object.fromEntries(Object.entries(De).filter(([, f]) => f.uiId !== e.ui_id)), [o]: { ...i, sessionId: r, tree: t, revision: a, updatedAt: Date.now() } }, Bt();
  },
  getSnapshot: (e, t) => De[Ut(e, t)],
  clearSession(e) {
    De = Object.fromEntries(Object.entries(De).filter(([, t]) => t.sessionId !== e)), Bt();
  },
  hydrateFromMessages: Oo
};
function Lo({ children: e }) {
  return e;
}
function Ro() {
  var a, n;
  const e = (n = (a = window.QwenPaw) == null ? void 0 : a.host) == null ? void 0 : n.React;
  if (!e) throw new Error("useGenUiStore: host React not available");
  return { snapshots: e.useSyncExternalStore(Po, ya, ya), ...Mo };
}
function Bo() {
  De = {}, Bt();
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
function Uo(e) {
  const t = e.data;
  if (!t) return { resultText: "", status: "calling", toolName: "" };
  const a = t.status || "calling", n = t.content;
  if (!Array.isArray(n) || n.length === 0)
    return { resultText: "", status: a, toolName: "" };
  const l = n[0], r = l == null ? void 0 : l.data, o = (r == null ? void 0 : r.name) || "";
  if (n.length > 1) {
    const i = n[1], s = i == null ? void 0 : i.data, d = (s == null ? void 0 : s.output) ?? (s == null ? void 0 : s.content) ?? (i == null ? void 0 : i.output) ?? (i == null ? void 0 : i.content) ?? (s == null ? void 0 : s.result) ?? (i == null ? void 0 : i.result);
    if (d != null) return { resultText: vt(d), status: a, toolName: o };
  }
  if (r != null && r.output) {
    const i = r.output;
    return { resultText: vt(i), status: a, toolName: o };
  }
  return { resultText: "", status: a, toolName: o };
}
function Pt(e) {
  var m, u, y, h;
  const t = (m = window.QwenPaw) == null ? void 0 : m.host, a = t == null ? void 0 : t.React;
  if (!a) return null;
  const { resultText: n, status: l, toolName: r } = Uo(e), o = l === "in_progress" || l === "calling", i = l === "failed" || l === "error", s = ht(n), d = s ? null : Et(n);
  let g = 0;
  (u = s == null ? void 0 : s.tree) != null && u.root && (g = Ya(s.tree.root));
  const f = r === "emit_ui_patch" || (s == null ? void 0 : s.kind) === "genui_patch", c = o ? f ? "📝 Patching UI Tree..." : "🎨 Generating UI Tree..." : i ? f ? "📝 UI Patch Error" : "🎨 UI Tree Error" : s ? f ? `📝 UI Patched (rev ${s.revision ?? "?"})` : `🎨 UI Tree (${g} nodes)` : f ? "📝 UI Patch" : "🎨 UI Tree";
  return a.createElement(
    "details",
    { open: o || i, style: { margin: "4px 0", border: "1px solid var(--ant-color-border, #d9d9d9)", borderRadius: 8, padding: "4px 8px", fontSize: 13 } },
    a.createElement(
      "summary",
      { style: { cursor: "pointer", display: "flex", alignItems: "center", gap: 6 } },
      a.createElement("span", null, f ? "📝" : "🎨"),
      a.createElement("span", null, c),
      s != null && s.ok ? a.createElement("span", { style: { fontSize: 11, color: "#999", marginLeft: "auto" } }, `ui_id: ${((y = s.ui_id) == null ? void 0 : y.slice(0, 16)) ?? ""}…`) : null
    ),
    i || d && !s ? a.createElement(
      "div",
      { style: { padding: "8px 12px", fontSize: 12 } },
      a.createElement("div", { style: { color: "var(--ant-color-error, #ff4d4f)", marginBottom: 4 } }, (d == null ? void 0 : d.message) || "Unknown error"),
      d != null && d.hint ? a.createElement("div", { style: { color: "#999" } }, `💡 ${d.hint}`) : null
    ) : s != null && s.ok ? a.createElement(
      "div",
      { style: { padding: "8px 12px", fontSize: 12, color: "#999" } },
      (h = s.tree) != null && h.root ? `GenUI 已在回复正文中展示（${g} 个节点，revision ${s.revision ?? 1}）。` : "GenUI 工具已完成，但没有可展示的树。"
    ) : a.createElement("pre", { style: { fontSize: 12, padding: "8px 12px", background: "rgba(0,0,0,0.03)", borderRadius: 8, overflow: "auto", maxHeight: 200 } }, n || "(waiting for result...)")
  );
}
function Ya(e) {
  if (!e || typeof e != "object") return 0;
  let t = 1;
  if (Array.isArray(e.children)) for (const a of e.children) t += Ya(a);
  return t;
}
const jo = /* @__PURE__ */ new Set(["send_message"]), Ea = 1e4, No = 500, va = {};
function Do() {
  var e;
  try {
    const t = window.QwenPaw, a = (e = t == null ? void 0 : t.genui) == null ? void 0 : e.config;
    if (a != null && a.allow_actions && Array.isArray(a.allow_actions)) {
      const n = a.allow_actions.filter(
        (l) => typeof l == "string" && l.length > 0
      );
      if (n.length > 0)
        return new Set(n);
    }
  } catch {
  }
  return new Set(jo);
}
function Go(e) {
  const t = Date.now(), a = va[e] || 0;
  return t - a < No ? (console.warn("[ugsci.genui] Action '" + e + "' throttled"), !0) : (va[e] = t, !1);
}
function Fo(e, t) {
  return e.replace(/\{\{\s*([\w.-]+)\s*\}\}/g, (a, n) => {
    const l = t[n];
    return l == null ? "" : typeof l == "string" ? l : JSON.stringify(l);
  });
}
function Za(e, t = {}) {
  var r, o, i, s, d;
  let a;
  if (typeof e == "string") a = { type: e };
  else if (e && typeof e == "object") a = e;
  else return { ok: !1, message: "无效操作" };
  const n = a.type === "submit_form" ? "send_message" : a.type, l = Do();
  if (!l.has(n))
    return console.warn(
      "[ugsci.genui] Action '" + a.type + "' not allowed (allowed: " + Array.from(l).join(", ") + ")"
    ), { ok: !1, message: "此操作未获允许" };
  if (Go(n)) return { ok: !1, message: "操作过于频繁，请稍后重试" };
  if (n === "send_message") {
    const g = t.formValues || {};
    let f = ((r = a.payload) == null ? void 0 : r.content) || ((o = a.payload) == null ? void 0 : o.message) || "";
    const c = /\{\{\s*[\w.-]+\s*\}\}/.test(f);
    return f = Fo(f, g).trim(), f && !c && Object.keys(g).length > 0 && (f += `
${Object.entries(g).map(([u, y]) => `${u}: ${typeof y == "string" ? y : JSON.stringify(y)}`).join(`
`)}`), !f && Object.keys(g).length > 0 && (f = `${t.formId ? `提交表单 ${t.formId}` : "提交表单"}
${Object.entries(g).map(([y, h]) => `${y}: ${typeof h == "string" ? h : JSON.stringify(h)}`).join(`
`)}`), !f || !f.trim() ? (console.warn("[ugsci.genui] send_message: content is empty"), { ok: !1, message: "消息内容为空" }) : f.length > Ea ? (console.warn("[ugsci.genui] send_message: content length " + f.length + " exceeds max " + Ea), { ok: !1, message: "消息内容过长" }) : !((d = (s = (i = window.QwenPaw) == null ? void 0 : i.chat) == null ? void 0 : s.sendMessage) != null && d.call(s, f)) ? (console.info("[ugsci.genui] send_message: could not find chat sender, content:", f), { ok: !1, message: "当前无法发送消息" }) : { ok: !0, message: "已提交" };
  }
  return { ok: !1, message: "尚未实现此操作" };
}
const Ge = /* @__PURE__ */ new Map(), Wo = 128, Ot = /* @__PURE__ */ new Map();
function jt(e) {
  return e.startsWith("http://") || e.startsWith("https://") || e.startsWith("data:") || e.startsWith("blob:");
}
function Ho(e) {
  return e ? !!(e.startsWith("/") || /^[A-Za-z]:[\\/]/.test(e) || e.startsWith("\\\\")) : !1;
}
function Jo(e) {
  return e.startsWith("workspace://");
}
function qo(e) {
  return Jo(e) ? e.slice(12) : e;
}
async function Ko(e) {
  if (!e) return null;
  if (jt(e)) return e;
  if (Ge.has(e))
    return Ge.get(e) ?? null;
  if (Ot.has(e))
    return Ot.get(e);
  const t = Vo(e);
  Ot.set(e, t);
  try {
    const a = await t;
    if (!Ge.has(e) && Ge.size >= Wo) {
      const n = Ge.keys().next().value;
      if (n !== void 0) {
        const l = Ge.get(n);
        l != null && l.startsWith("blob:") && URL.revokeObjectURL(l), Ge.delete(n);
      }
    }
    return Ge.set(e, a), a;
  } finally {
    Ot.delete(e);
  }
}
async function Vo(e) {
  const t = window.QwenPaw, a = t == null ? void 0 : t.host;
  if (!a)
    return console.warn("[ugsci.genui] Host runtime not available for media resolution"), null;
  const n = qo(e);
  if (typeof a.resolveWorkspaceBlob == "function")
    try {
      const l = await a.resolveWorkspaceBlob(n);
      if (l) return l;
    } catch (l) {
      console.warn("[ugsci.genui] host.resolveWorkspaceBlob failed:", l);
    }
  try {
    return await Xo(n, a);
  } catch (l) {
    return console.warn(
      `[ugsci.genui] Failed to resolve media URL for '${e}':`,
      l
    ), null;
  }
}
async function Xo(e, t) {
  let a = null;
  const n = t == null ? void 0 : t.workspaceApi, l = t == null ? void 0 : t.chatApi;
  if (Ho(e) && (l != null && l.filePreviewUrl) ? a = l.filePreviewUrl(e) : n != null && n.getBinaryFileUrl && (a = n.getBinaryFileUrl(e)), !a)
    return e;
  const r = {}, o = t == null ? void 0 : t.buildAuthHeaders;
  if (typeof o == "function")
    try {
      const d = o();
      d && typeof d == "object" && Object.assign(r, d);
    } catch {
    }
  const i = await fetch(a, { headers: r });
  if (!i.ok)
    throw new Error(`HTTP ${i.status}: ${i.statusText}`);
  const s = await i.blob();
  return URL.createObjectURL(s);
}
function Nt(e) {
  return e ? jt(e) ? e : Ge.get(e) ?? null : null;
}
function Qo() {
  for (const e of Ge.values())
    if (e && e.startsWith("blob:"))
      try {
        URL.revokeObjectURL(e);
      } catch {
      }
  Ge.clear();
}
const ba = (e) => typeof e == "string" ? e : e != null ? String(e) : "";
let nn = null;
function kn(e) {
  return nn || (nn = e.createContext(null)), nn;
}
function Dt(e) {
  const t = e.props || {}, a = ba(t.name);
  if (a) return a;
  const n = ba(t.label), l = n.match(/^\s*([a-e])(?:\b|\s|（|\()/i);
  return l ? l[1].toLowerCase() : n || e.nodeId;
}
function el(e, t = {}) {
  if (["Input", "NumberInput", "Select", "Textarea", "Switch", "Slider", "FileInput"].includes(e.kind)) {
    const a = e.props || {}, n = a.value ?? a.checked;
    n !== void 0 && (t[Dt(e)] = n);
  }
  for (const a of e.children || []) el(a, t);
  return t;
}
function Yo({
  node: e,
  children: t
}) {
  var i, s;
  const a = (s = (i = window.QwenPaw) == null ? void 0 : i.host) == null ? void 0 : s.React;
  if (!a) return null;
  const n = a.useMemo(() => el(e), [e]), [l, r] = a.useState(n);
  a.useEffect(
    () => r((d) => ({ ...n, ...d })),
    [n]
  );
  const o = a.useMemo(
    () => ({
      values: l,
      setValue: (d, g) => r((f) => ({ ...f, [d]: g }))
    }),
    [l]
  );
  return a.createElement(
    kn(a).Provider,
    { value: o },
    t
  );
}
const A = (e) => typeof e == "string" ? e : e != null ? String(e) : "", _e = (e) => typeof e == "number" ? e : typeof e == "string" && Number(e) || 0, Ze = (e) => !!e, Ke = (e) => Array.isArray(e) ? e : [], wa = { xs: "12px", sm: "13px", base: "14px", lg: "16px" }, ve = {
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
function Zo({ node: e }) {
  var c;
  const t = (c = window.QwenPaw) == null ? void 0 : c.host, a = t == null ? void 0 : t.React, n = (t == null ? void 0 : t.antd) || {};
  if (!a) return null;
  const l = e.props || {}, [r, o] = a.useState({}), [i, s] = a.useState(null), d = a.useMemo(() => {
    const m = {};
    for (const u of e.children || []) {
      const y = u.props || {}, h = Dt(u);
      y.value !== void 0 ? m[h] = y.value : y.checked !== void 0 && (m[h] = y.checked);
    }
    return m;
  }, [e]);
  a.useEffect(() => o((m) => ({ ...d, ...m })), [d]);
  const g = a.useMemo(() => ({ values: r, setValue: (m, u) => {
    s(null), o((y) => ({ ...y, [m]: u }));
  } }), [r]), f = () => {
    var y, h;
    const m = (e.children || []).filter((x) => {
      var T;
      return (T = x.props) == null ? void 0 : T.required;
    }).find((x) => {
      const T = Dt(x), k = r[T];
      return k == null || k === "" || Array.isArray(k) && k.length === 0;
    });
    if (m) {
      s({ ok: !1, message: `${A((y = m.props) == null ? void 0 : y.label) || A((h = m.props) == null ? void 0 : h.name) || "必填项"}不能为空` });
      return;
    }
    const u = l.action && typeof l.action == "object" ? l.action : { type: "submit_form", payload: {} };
    s(Za(u, { formValues: r, formId: A(l.formId) || e.nodeId }));
  };
  return a.createElement(
    Cn(a).Provider,
    { value: g },
    a.createElement(
      "div",
      { style: { margin: "4px 0" } },
      l.title ? a.createElement("div", { style: { fontWeight: 600, marginBottom: 8 } }, A(l.title)) : null,
      ...(e.children || []).map((m, u) => a.createElement(st, { key: m.nodeId || u, node: m })),
      a.createElement(n.Button || "button", { type: "primary", size: "small", style: { marginTop: 8 }, onClick: f }, A(l.submitLabel) || "提交"),
      i ? a.createElement("div", { role: "status", style: { marginTop: 6, fontSize: 12, color: i.ok ? ve.success : ve.error } }, i.message) : null
    )
  );
}
function es({ node: e, fieldType: t }) {
  var x, T, k;
  const a = (x = window.QwenPaw) == null ? void 0 : x.host, n = a == null ? void 0 : a.React, l = (a == null ? void 0 : a.antd) || {};
  if (!n) return null;
  const r = e.props || {}, o = n.useContext(Cn(n)), i = n.useContext(kn(n)), s = o || i, [d, g] = n.useState(r.value ?? r.checked ?? ""), f = Dt(e), c = r.value ?? r.checked ?? "", m = s ? ((T = s.values) == null ? void 0 : T[f]) ?? c : d, u = (M) => {
    const N = M != null && M.target ? t === "Switch" ? M.target.checked : M.target.value : M;
    s ? s.setValue(f, N) : g(N);
  }, y = (M) => n.createElement(
    "div",
    { style: { display: "flex", flexDirection: "column", gap: 4, margin: "4px 0" } },
    r.label && t !== "Switch" ? n.createElement("label", { style: { fontSize: 12, color: ve.muted } }, A(r.label), r.required ? n.createElement("span", { style: { color: ve.error } }, " *") : null) : null,
    M,
    r.description ? n.createElement("span", { style: { fontSize: 11, color: ve.muted } }, A(r.description)) : null
  ), h = A(r.label) || A(r.placeholder) || f;
  return t === "Input" ? y(n.createElement(l.Input || "input", { "aria-label": h, placeholder: A(r.placeholder), value: m, onChange: u, size: "small" })) : t === "NumberInput" ? y(n.createElement(l.InputNumber || "input", { "aria-label": h, value: m, min: r.min, max: r.max, step: r.step, onChange: u, size: "small", style: { width: "100%" } })) : t === "Textarea" ? y(n.createElement(((k = l.Input) == null ? void 0 : k.TextArea) || "textarea", { "aria-label": h, placeholder: A(r.placeholder), value: m, rows: _e(r.rows) || 3, onChange: u, style: { width: "100%" } })) : t === "Select" ? y(n.createElement(l.Select || "select", { "aria-label": h, placeholder: A(r.placeholder), value: m || void 0, onChange: u, size: "small", style: { width: "100%" } }, Ke(r.options).map((M, N) => {
    var H;
    return n.createElement(((H = l.Select) == null ? void 0 : H.Option) || "option", { key: N, value: A(typeof M == "object" ? M.value : M) }, A(typeof M == "object" ? M.label : M));
  }))) : t === "Switch" ? n.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8 } }, n.createElement(l.Switch || "input", { type: "checkbox", checked: !!m, onChange: u, size: "small" }), n.createElement("span", null, A(r.label))) : t === "Slider" ? y(n.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8 } }, n.createElement(l.Slider || "input", { type: "range", value: _e(m), min: r.min ?? 0, max: r.max ?? 100, step: r.step ?? 1, onChange: u, style: { flex: 1 } }), n.createElement("span", { style: { minWidth: 32, fontSize: 12 } }, A(m)))) : t === "FileInput" ? n.createElement(
    "label",
    { style: { display: "inline-flex", alignItems: "center", gap: 8, cursor: "pointer" } },
    n.createElement("span", null, A(r.label) || "选择文件"),
    n.createElement("input", { type: "file", multiple: Ze(r.multiple), accept: A(r.accept) || void 0, onChange: (M) => s == null ? void 0 : s.setValue(f, Array.from(M.target.files || []).map((N) => ({ name: N.name, size: N.size, type: N.type }))) })
  ) : null;
}
function ln({ node: e, link: t = !1, toggle: a = !1 }) {
  var m;
  const n = (m = window.QwenPaw) == null ? void 0 : m.host, l = n == null ? void 0 : n.React, r = (n == null ? void 0 : n.antd) || {};
  if (!l) return null;
  const o = e.props || {}, i = l.useContext(Cn(l)), [s, d] = l.useState(Ze(o.checked)), [g, f] = l.useState(null), c = () => {
    a && d((u) => !u), o.action && typeof o.action == "object" ? f(Za(o.action, { formValues: i == null ? void 0 : i.values, formId: i ? "form" : void 0 })) : t && typeof o.href == "string" && /^(https?:\/\/|\/)/.test(o.href) && window.open(o.href, "_blank", "noopener,noreferrer");
  };
  return l.createElement(
    "span",
    { style: { display: "inline-flex", flexDirection: "column", gap: 3 } },
    l.createElement(r.Button || "button", { type: t ? "link" : (a ? s : A(o.variant) === "primary") ? "primary" : "default", size: "small", disabled: Ze(o.disabled), loading: Ze(o.loading), onClick: c }, A(o.label) || "Action"),
    g ? l.createElement("span", { role: "status", style: { fontSize: 11, color: g.ok ? ve.success : ve.error } }, g.message) : null
  );
}
function ts({ node: e, children: t }) {
  var r;
  const a = (r = window.QwenPaw) == null ? void 0 : r.host, n = a == null ? void 0 : a.React;
  if (!n) return null;
  class l extends n.Component {
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
  return n.createElement(l, { node: e }, t);
}
function st({ node: e }) {
  var i;
  const t = (i = window.QwenPaw) == null ? void 0 : i.host;
  if (!(t != null && t.React)) return null;
  const a = t.React, n = t.antd || {}, l = e.props || {}, r = e.children || [], o = () => r.map(
    (s, d) => a.createElement(st, { key: s.nodeId || d, node: s })
  );
  return a.createElement(
    ts,
    { node: e },
    ns(a, n, e, l, r, o)
  );
}
function ns(e, t, a, n, l, r) {
  var o, i, s, d, g, f;
  switch (a.kind) {
    case "Stack":
      return e.createElement("div", { style: { display: "flex", flexDirection: "column", gap: `${_e(n.gap) || 12}px`, padding: n.padding ? `${_e(n.padding)}px` : void 0 } }, r());
    case "Row":
      return e.createElement("div", { style: { display: "flex", flexDirection: "row", gap: `${_e(n.gap) || 12}px`, alignItems: A(n.align) || void 0, justifyContent: A(n.justify) || void 0 } }, r());
    case "Grid":
      return e.createElement("div", { style: { display: "grid", gridTemplateColumns: `repeat(${Math.min(Math.max(_e(n.columns) || 2, 1), 6)}, 1fr)`, gap: `${_e(n.gap) || 12}px` } }, r());
    case "Spacer":
      return e.createElement("div", { style: { height: `${_e(n.size) || 16}px` } });
    case "ScrollArea":
      return e.createElement("div", { style: { maxHeight: n.maxHeight ? `${_e(n.maxHeight)}px` : "300px", overflowY: "auto", padding: n.padding ? `${_e(n.padding)}px` : void 0 } }, r());
    case "AspectBox": {
      const c = A(n.ratio) || "16:9", [m, u] = c.split(":").map(Number), y = m && u ? `${u}/${m}` : "9/16";
      return e.createElement("div", { style: { aspectRatio: y, overflow: "hidden", borderRadius: 8, display: "flex", justifyContent: "center", alignItems: "center" } }, r());
    }
    case "Text":
      return e.createElement("div", { style: { fontSize: wa[A(n.size)] || wa.base, color: ve[A(n.color)] || ve.default, fontWeight: Ze(n.bold) ? "bold" : "normal", lineHeight: 1.6 } }, A(n.value));
    case "Heading": {
      const c = Math.min(Math.max(_e(n.level) || 2, 1), 4), m = { 1: "24px", 2: "20px", 3: "18px", 4: "16px" };
      return e.createElement("div", { style: { fontSize: m[c], fontWeight: "bold", margin: "4px 0" } }, A(n.value));
    }
    case "Divider":
      return e.createElement(t.Divider || "hr", n.label ? { children: A(n.label) } : {});
    case "Markdown": {
      const c = (o = window.QwenPaw) == null ? void 0 : o.host, m = c == null ? void 0 : c.ReactMarkdown;
      if (m) {
        const u = c != null && c.remarkGfm ? [c.remarkGfm] : [];
        return e.createElement(
          "div",
          { className: "qwenpaw-genui-markdown" },
          e.createElement(m, { children: A(n.content || n.value), remarkPlugins: u })
        );
      }
      return e.createElement("div", { style: { whiteSpace: "pre-wrap", lineHeight: 1.6 } }, A(n.content || n.value));
    }
    case "CodeBlock":
      return e.createElement("pre", { style: { padding: 12, background: "var(--ant-color-fill-tertiary, rgba(0,0,0,0.04))", borderRadius: 8, overflow: "auto", fontSize: 13, fontFamily: "monospace" } }, A(n.code));
    case "SectionHeader":
      return e.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8, marginBottom: 8 } }, n.icon ? e.createElement("span", { style: { fontSize: 20 } }, A(n.icon)) : null, e.createElement("div", null, e.createElement("div", { style: { fontSize: 16, fontWeight: 600 } }, A(n.title)), n.subtitle ? e.createElement("div", { style: { fontSize: 12, color: ve.muted } }, A(n.subtitle)) : null));
    case "KeyValueList": {
      const c = Ke(n.items);
      return e.createElement(
        "div",
        { style: { display: "flex", flexDirection: "column", gap: 4 } },
        ...c.map((m, u) => e.createElement(
          "div",
          { key: u, style: { display: "flex", justifyContent: "space-between", padding: "2px 0", borderBottom: u < c.length - 1 ? "1px solid var(--ant-color-border-secondary, #f0f0f0)" : "none" } },
          e.createElement("span", { style: { color: ve.muted, fontSize: 13 } }, A(m.key)),
          e.createElement("span", { style: { fontWeight: 500, fontSize: 13 } }, A(m.value))
        ))
      );
    }
    case "Badge":
      return e.createElement(t.Tag || "span", { color: A(n.variant) || "default", children: A(n.value) });
    case "Tag":
      return e.createElement(t.Tag || "span", { color: A(n.color) || "default", children: A(n.label) });
    case "Stat":
      return e.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 2 } }, e.createElement("span", { style: { fontSize: 12, color: ve.muted } }, A(n.label)), e.createElement("span", { style: { fontSize: 20, fontWeight: "bold" } }, A(n.value)), n.delta ? e.createElement("span", { style: { fontSize: 12, color: A(n.trend) === "up" ? ve.success : A(n.trend) === "down" ? ve.error : ve.muted } }, A(n.delta)) : null);
    case "Progress":
      return e.createElement(t.Progress || "div", { percent: _e(n.value), size: "small" });
    case "Skeleton": {
      const c = _e(n.rows) || 3;
      return e.createElement(
        "div",
        { style: { display: "flex", flexDirection: "column", gap: 8 } },
        ...Array.from({ length: c }).map(
          (m, u) => e.createElement(t.Skeleton || "div", { key: u, active: Ze(n.active), title: !1, paragraph: { rows: 1 } })
        )
      );
    }
    case "Avatar":
      return e.createElement(t.Avatar || "div", { src: Nt(A(n.src)) || A(n.src), size: _e(n.size) || 32 }, ((s = (i = A(n.name)) == null ? void 0 : i.charAt(0)) == null ? void 0 : s.toUpperCase()) || "");
    case "Icon":
      return e.createElement("span", { style: { fontSize: _e(n.size) || 16, color: ve[A(n.color)] || ve.default } }, A(n.name));
    case "Card":
      return e.createElement(t.Card || "div", { title: n.title ? A(n.title) : void 0, size: "small", style: { margin: "4px 0" } }, r());
    case "DataCard":
      return e.createElement(t.Card || "div", { size: "small", style: { margin: "4px 0" } }, e.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center" } }, e.createElement("div", null, e.createElement("div", { style: { fontSize: 12, color: ve.muted } }, A(n.title)), e.createElement("div", { style: { fontSize: 24, fontWeight: "bold" } }, A(n.value))), n.icon ? e.createElement("span", { style: { fontSize: 32 } }, A(n.icon)) : null));
    case "MetricCard":
      return e.createElement(t.Card || "div", { size: "small", style: { margin: "4px 0" } }, e.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center" } }, e.createElement("div", null, e.createElement("div", { style: { fontSize: 12, color: ve.muted } }, A(n.title)), e.createElement("div", { style: { fontSize: 24, fontWeight: "bold" } }, A(n.value)), n.delta ? e.createElement("span", { style: { fontSize: 12, color: A(n.trend) === "up" ? ve.success : A(n.trend) === "down" ? ve.error : ve.muted } }, `${A(n.delta)} ${n.period ? A(n.period) : ""}`.trim()) : null), n.icon ? e.createElement("span", { style: { fontSize: 32 } }, A(n.icon)) : null));
    case "AlertCard":
    case "Alert":
      return e.createElement(t.Alert || "div", { type: A(n.severity) === "success" ? "success" : A(n.severity) === "warning" ? "warning" : A(n.severity) === "error" ? "error" : "info", message: n.title ? A(n.title) : void 0, description: A(n.message), showIcon: !0, style: { margin: "4px 0" } });
    case "Callout":
      return e.createElement(t.Alert || "div", { type: A(n.variant) === "tip" ? "success" : A(n.variant) === "warning" ? "warning" : A(n.variant) === "important" ? "error" : "info", message: n.title ? A(n.title) : void 0, description: A(n.message), showIcon: !0 });
    case "WeatherCard":
      return e.createElement(t.Card || "div", { size: "small", style: { margin: "4px 0", display: "flex", alignItems: "center", gap: 16 } }, n.icon ? e.createElement("span", { style: { fontSize: 40 } }, A(n.icon)) : null, e.createElement("div", null, e.createElement("div", { style: { fontSize: 24, fontWeight: "bold" } }, A(n.temperature)), e.createElement("div", { style: { color: ve.muted } }, A(n.condition)), e.createElement("div", { style: { fontSize: 12, color: ve.muted } }, A(n.location))));
    case "ProfileCard":
      return e.createElement(t.Card || "div", { size: "small", style: { margin: "4px 0" } }, e.createElement("div", { style: { display: "flex", gap: 12, alignItems: "center" } }, e.createElement(t.Avatar || "div", { src: Nt(A(n.avatar)) || A(n.avatar), size: 48 }, (g = (d = A(n.name)) == null ? void 0 : d.charAt(0)) == null ? void 0 : g.toUpperCase()), e.createElement("div", null, e.createElement("div", { style: { fontWeight: 600 } }, A(n.name)), e.createElement("div", { style: { fontSize: 12, color: ve.muted } }, A(n.role)), n.bio ? e.createElement("div", { style: { fontSize: 12, marginTop: 4 } }, A(n.bio)) : null)));
    case "MediaCard":
      return e.createElement(t.Card || "div", { size: "small", style: { margin: "4px 0", overflow: "hidden" } }, e.createElement(rn, { src: A(n.src), alt: A(n.title), style: { width: "100%", maxHeight: 200, objectFit: "cover" } }), e.createElement("div", { style: { padding: "8px 12px" } }, e.createElement("div", { style: { fontWeight: 600 } }, A(n.title)), n.caption ? e.createElement("div", { style: { fontSize: 12, color: ve.muted } }, A(n.caption)) : null));
    case "QuoteCard":
      return e.createElement(t.Card || "div", { size: "small", style: { margin: "4px 0", fontStyle: "italic" } }, e.createElement("div", { style: { fontSize: 14, lineHeight: 1.6 } }, `"${A(n.quote)}"`), e.createElement("div", { style: { fontSize: 12, color: ve.muted, marginTop: 8 } }, `— ${A(n.author)}${n.role ? `, ${A(n.role)}` : ""}`));
    case "TimelineCard":
      return e.createElement(t.Card || "div", { size: "small", style: { margin: "4px 0" } }, e.createElement("div", { style: { display: "flex", gap: 8, alignItems: "flex-start" } }, e.createElement("div", { style: { width: 8, height: 8, borderRadius: "50%", background: A(n.status) === "done" ? ve.success : A(n.status) === "pending" ? ve.warning : ve.primary, marginTop: 4, flexShrink: 0 } }), e.createElement("div", null, e.createElement("div", { style: { fontWeight: 600 } }, A(n.title)), n.date ? e.createElement("div", { style: { fontSize: 12, color: ve.muted } }, A(n.date)) : null, n.description ? e.createElement("div", { style: { fontSize: 13, marginTop: 4 } }, A(n.description)) : null)));
    case "KpiBoard":
      return e.createElement("div", { style: { margin: "4px 0" } }, n.title ? e.createElement("div", { style: { fontSize: 16, fontWeight: 600, marginBottom: 8 } }, A(n.title)) : null, e.createElement("div", { style: { display: "grid", gridTemplateColumns: `repeat(${Math.min(Math.max(_e(n.columns) || 3, 1), 6)}, 1fr)`, gap: 12 } }, r()));
    case "FeatureGrid":
      return e.createElement("div", { style: { display: "grid", gridTemplateColumns: `repeat(${Math.min(Math.max(_e(n.columns) || 2, 1), 4)}, 1fr)`, gap: `${_e(n.gap) || 12}px`, margin: "4px 0" } }, r());
    case "Stepper": {
      const c = Ke(n.steps).map((u) => A(u)), m = _e(n.current);
      return e.createElement(
        t.Steps || "div",
        { current: m, size: "small", style: { margin: "4px 0" } },
        ...c.map((u, y) => {
          var h;
          return e.createElement(((h = t.Steps) == null ? void 0 : h.Item) || "div", { key: y, title: u });
        })
      );
    }
    case "Table": {
      const c = Ke(n.headers).map((h) => A(h)), u = l.filter((h) => h.kind === "TableRow").map((h, x) => {
        const T = (h.children || []).filter((M) => M.kind === "TableCell"), k = { key: x };
        return c.forEach((M, N) => {
          var X, j;
          const H = (j = (X = T[N]) == null ? void 0 : X.props) == null ? void 0 : j.value;
          k[M] = H == null ? "" : A(H);
        }), k;
      }), y = c.map((h) => ({ title: h, dataIndex: h, key: h }));
      return e.createElement(t.Table || "table", { dataSource: u, columns: y, size: Ze(n.compact) ? "small" : "middle", pagination: !1, style: { margin: "4px 0" } });
    }
    case "List": {
      const c = l.filter((m) => m.kind === "ListItem");
      return e.createElement(
        t.List || "ul",
        { size: "small", style: { margin: "4px 0" } },
        c.map((m, u) => {
          var y, h, x;
          return e.createElement(((y = t.List) == null ? void 0 : y.Item) || "li", { key: u }, (h = m.props) != null && h.icon ? e.createElement("span", { style: { marginRight: 6 } }, A(m.props.icon)) : null, A((x = m.props) == null ? void 0 : x.value));
        })
      );
    }
    case "ImageGallery": {
      const c = l.filter((m) => m.kind === "Image");
      return e.createElement(
        "div",
        { style: { display: "grid", gridTemplateColumns: `repeat(${Math.min(Math.max(_e(n.columns) || 3, 1), 6)}, 1fr)`, gap: `${_e(n.gap) || 8}px`, margin: "4px 0" } },
        ...c.map((m, u) => {
          const y = m.props || {};
          return e.createElement(rn, { key: u, src: A(y.src), alt: A(y.alt), style: { width: "100%", height: 120, objectFit: "cover", borderRadius: 8, cursor: "pointer" } });
        })
      );
    }
    case "Image":
      return e.createElement("div", null, e.createElement(rn, { src: A(n.src), alt: A(n.alt), style: { maxWidth: "100%", borderRadius: Ze(n.rounded) ? "8px" : void 0, maxHeight: n.maxHeight ? `${_e(n.maxHeight)}px` : void 0 } }), n.caption ? e.createElement("div", { style: { fontSize: 12, color: ve.muted } }, A(n.caption)) : null);
    case "Chart":
      return e.createElement(as, { props: n });
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
      return e.createElement(es, { node: a, fieldType: a.kind });
    case "Form":
      return e.createElement(Zo, { node: a });
    case "Chip":
      return e.createElement(t.Tag || "span", { color: A(n.color) || "default", closable: !0, onClose: () => {
      }, children: A(n.label) });
    case "ChipGroup": {
      const c = Ke(n.items);
      return e.createElement("div", { style: { display: "flex", flexWrap: "wrap", gap: 4 } }, ...c.map((m, u) => e.createElement(t.Tag || "span", { key: u }, A(m))));
    }
    case "Tabs": {
      const m = l.filter((u) => u.kind === "TabItem").map((u) => {
        var y, h, x;
        return {
          key: A((y = u.props) == null ? void 0 : y.key) || A((h = u.props) == null ? void 0 : h.tab),
          label: A((x = u.props) == null ? void 0 : x.tab),
          children: (u.children || []).map((T, k) => e.createElement(st, { key: T.nodeId || k, node: T }))
        };
      });
      return t.Tabs ? e.createElement(t.Tabs, { items: m, defaultActiveKey: A(n.activeKey) || ((f = m[0]) == null ? void 0 : f.key) }) : e.createElement("div", null, ...m.map((u, y) => e.createElement("div", { key: y }, e.createElement("div", { style: { fontWeight: 600, marginBottom: 4 } }, u.label), u.children)));
    }
    case "TabItem":
      return e.createElement("div", null, r());
    case "Accordion": {
      const c = l.filter((m) => m.kind === "AccordionItem");
      if (t.Collapse) {
        const m = c.map((u) => {
          var y, h, x;
          return {
            key: A((y = u.props) == null ? void 0 : y.key) || A((h = u.props) == null ? void 0 : h.header),
            label: A((x = u.props) == null ? void 0 : x.header),
            children: (u.children || []).map((T, k) => e.createElement(st, { key: T.nodeId || k, node: T }))
          };
        });
        return e.createElement(t.Collapse, { items: m });
      }
      return e.createElement("div", null, ...c.map((m, u) => {
        var y;
        return e.createElement("details", { key: u }, e.createElement("summary", { style: { fontWeight: 600, cursor: "pointer", padding: "4px 0" } }, A((y = m.props) == null ? void 0 : y.header)), e.createElement("div", { style: { paddingLeft: 12 } }, (m.children || []).map((h, x) => e.createElement(st, { key: h.nodeId || x, node: h }))));
      }));
    }
    case "AccordionItem":
      return e.createElement("div", null, r());
    case "JsonDebug":
      return e.createElement("details", { style: { margin: "4px 0", fontSize: 12 } }, e.createElement("summary", null, A(n.label) || "Debug JSON"), e.createElement("pre", { style: { fontSize: 12, padding: 8, background: "var(--ant-color-fill-tertiary, rgba(0,0,0,0.04))", borderRadius: 4, overflow: "auto" } }, JSON.stringify(n.data ?? n, null, 2)));
    default:
      return e.createElement("div", { style: { padding: 8, border: "1px dashed var(--ant-color-border, #d9d9d9)", borderRadius: 8, fontSize: 12, color: ve.muted, fontFamily: "monospace" } }, `Unknown component: ${a.kind}`);
  }
}
const lt = ["#1677ff", "#52c41a", "#faad14", "#ff4d4f", "#722ed1", "#13c2c2", "#eb2f96"];
function as({ props: e }) {
  var Q, P;
  const t = (P = (Q = window.QwenPaw) == null ? void 0 : Q.host) == null ? void 0 : P.React;
  if (!t) return null;
  const a = t.useContext(kn(t)), n = A(e.chart) || "line", l = A(e.title);
  let r = Ke(e.categories).map((b) => A(b)), o = Ke(e.series);
  const i = _e(e.height) || 200, s = e.showLegend !== !1, d = 400, g = e.generator && typeof e.generator == "object" ? e.generator : {}, f = Ke(g.coefficients).map(A), c = ["a", "b", "c", "d", "e"], m = f.length > 0 ? f : c;
  if ((A(g.type) === "polynomial" || f.length > 0 || c.every((b) => {
    var v;
    return ((v = a == null ? void 0 : a.values) == null ? void 0 : v[b]) !== void 0;
  })) && a) {
    const b = typeof g.xMin == "number" ? g.xMin : -3, v = typeof g.xMax == "number" ? g.xMax : 3, I = Math.min(Math.max(_e(g.samples) || 61, 10), 400), C = Array.from({ length: I }, (D, L) => b + (v - b) * L / (I - 1)), B = m.map((D) => {
      var L;
      return _e((L = a.values) == null ? void 0 : L[D]);
    });
    r = C.map((D) => Number(D.toFixed(2)).toString()), o = [{ name: A(g.label) || "f(x)", values: C.map((D) => B.reduce((L, z, E) => L + z * Math.pow(D, B.length - E - 1), 0)) }];
  }
  const y = o.map((b, v) => {
    const I = b, C = Ke(I.values).map((B) => _e(B));
    return { name: A(I.name) || `Series ${v + 1}`, values: C };
  });
  if (r.length === 0 || y.length === 0)
    return t.createElement("div", { style: { padding: 12, color: ve.muted, fontSize: 12 } }, "Chart: no data");
  if (n === "pie") {
    const b = y[0].values.map((z) => Math.abs(z)), v = b.reduce((z, E) => z + E, 0) || 1, I = d / 2, C = i / 2, B = Math.min(d, i) / 2 - 20;
    let D = -Math.PI / 2;
    const L = b.map((z, E) => {
      const ee = z / v * 2 * Math.PI, J = I + B * Math.cos(D), _ = C + B * Math.sin(D), q = I + B * Math.cos(D + ee), re = C + B * Math.sin(D + ee), Y = ee > Math.PI ? 1 : 0, K = `M ${I} ${C} L ${J} ${_} A ${B} ${B} 0 ${Y} 1 ${q} ${re} Z`;
      return D += ee, { path: K, color: lt[E % lt.length], label: r[E] || `#${E + 1}`, val: z };
    });
    return t.createElement(
      "div",
      { style: { margin: "4px 0" } },
      l ? t.createElement("div", { style: { fontSize: 13, fontWeight: 600, marginBottom: 4 } }, l) : null,
      t.createElement(
        "svg",
        { width: d, height: i, style: { maxWidth: "100%" } },
        ...L.map((z, E) => t.createElement("path", { key: E, d: z.path, fill: z.color, stroke: "#fff", strokeWidth: 1 }))
      ),
      s ? t.createElement(
        "div",
        { style: { display: "flex", flexWrap: "wrap", gap: 8, marginTop: 4, fontSize: 11 } },
        ...L.map((z, E) => t.createElement(
          "span",
          { key: E, style: { display: "flex", alignItems: "center", gap: 4 } },
          t.createElement("span", { style: { display: "inline-block", width: 10, height: 10, borderRadius: 2, background: z.color } }),
          `${z.label}: ${z.val}`
        ))
      ) : null
    );
  }
  const h = y.flatMap((b) => b.values), x = Math.max(...h, 0), T = Math.min(...h, 0), k = x - T || 1, M = r.length > 0 ? (d - 40) / r.length : 0, N = y.length > 0 ? Math.max(1, M / y.length - 2) : 0, H = r.length > 1 ? (d - 40) / (r.length - 1) : 0, X = Math.max(1, Math.ceil(r.length / 8)), j = (b) => i - 20 - (b - T) / k * (i - 40), R = j(0), W = (b) => 30 + b * H;
  return t.createElement(
    "div",
    { style: { margin: "4px 0" } },
    l ? t.createElement("div", { style: { fontSize: 13, fontWeight: 600, marginBottom: 4 } }, l) : null,
    t.createElement(
      "svg",
      { width: d, height: i, style: { maxWidth: "100%" } },
      ...[0, 0.25, 0.5, 0.75, 1].map((b, v) => {
        const I = i - 20 - b * (i - 40);
        return t.createElement("line", { key: `g${v}`, x1: 30, y1: I, x2: d - 10, y2: I, stroke: "var(--ant-color-border-secondary, #f0f0f0)", strokeWidth: 1 });
      }),
      ...r.map((b, v) => v % X === 0 || v === r.length - 1 ? t.createElement("text", { key: `x${v}`, x: W(v), y: i - 6, fontSize: 10, fill: ve.muted, textAnchor: "middle" }, b.length > 6 ? b.slice(0, 6) + "…" : b) : null),
      ...y.map((b, v) => {
        const I = lt[v % lt.length];
        if (n === "bar")
          return b.values.map((D, L) => t.createElement("rect", {
            key: `b${v}-${L}`,
            x: 30 + L * M + v * (N + 2) + 1,
            y: Math.min(j(D), R),
            width: N,
            height: Math.abs(R - j(D)),
            fill: I,
            rx: 2
          }));
        const C = b.values.map((D, L) => `${W(L)},${j(D)}`).join(" "), B = [t.createElement("polyline", { key: `l${v}`, points: C, fill: "none", stroke: I, strokeWidth: 2 })];
        if (n === "area") {
          const D = `${W(0)},${i - 20} ${C} ${W(b.values.length - 1)},${i - 20}`;
          B.unshift(t.createElement("polygon", { key: `a${v}`, points: D, fill: I, opacity: 0.15 }));
        }
        return B;
      })
    ),
    s ? t.createElement(
      "div",
      { style: { display: "flex", flexWrap: "wrap", gap: 8, marginTop: 4, fontSize: 11 } },
      ...y.map((b, v) => t.createElement(
        "span",
        { key: v, style: { display: "flex", alignItems: "center", gap: 4 } },
        t.createElement("span", { style: { display: "inline-block", width: 10, height: 10, borderRadius: 2, background: lt[v % lt.length] } }),
        b.name
      ))
    ) : null
  );
}
function rn(e) {
  var i;
  const t = (i = window.QwenPaw) == null ? void 0 : i.host, a = t == null ? void 0 : t.React;
  if (!a) return null;
  const { useState: n, useEffect: l } = a, [r, o] = n(
    Nt(e.src) || (jt(e.src) ? e.src : null)
  );
  return l(() => {
    if (!e.src) return;
    if (jt(e.src)) {
      o(e.src);
      return;
    }
    const s = Nt(e.src);
    if (s) {
      o(s);
      return;
    }
    let d = !1;
    return Ko(e.src).then((g) => {
      d || o(g);
    }), () => {
      d = !0;
    };
  }, [e.src]), r ? a.createElement("img", {
    src: r,
    alt: e.alt || "",
    style: e.style || {},
    onError: () => {
      console.warn("[ugsci.genui] Image failed to load:", e.src);
    }
  }) : a.createElement("div", {
    style: {
      ...e.style || {},
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      minHeight: 80,
      color: ve.muted,
      fontSize: 12,
      background: "var(--ant-color-fill-tertiary, rgba(0,0,0,0.04))",
      borderRadius: 8
    }
  }, "Loading image…");
}
async function ls(e, t) {
  var g;
  const a = e.getBoundingClientRect(), n = Math.min(window.devicePixelRatio || 1, 2), l = document.createElement("canvas");
  l.width = Math.ceil(a.width * n), l.height = Math.ceil(Math.max(a.height, e.scrollHeight) * n);
  const r = l.getContext("2d");
  if (!r) throw new Error("canvas is unavailable");
  r.scale(n, n), r.fillStyle = "#fff", r.fillRect(0, 0, l.width, l.height);
  for (const f of Array.from(e.querySelectorAll("*"))) {
    const c = f.getBoundingClientRect();
    if (!c.width || !c.height) continue;
    const m = getComputedStyle(f), u = c.left - a.left, y = c.top - a.top;
    m.backgroundColor && m.backgroundColor !== "rgba(0, 0, 0, 0)" && (r.fillStyle = m.backgroundColor, r.fillRect(u, y, c.width, c.height)), m.borderTopWidth !== "0px" && (r.strokeStyle = m.borderTopColor, r.strokeRect(u, y, c.width, c.height));
  }
  const o = document.createTreeWalker(e, NodeFilter.SHOW_TEXT);
  for (; o.nextNode(); ) {
    const f = o.currentNode, c = (g = f.textContent) == null ? void 0 : g.trim();
    if (!c) continue;
    const m = document.createRange();
    m.selectNodeContents(f);
    const u = m.getBoundingClientRect(), y = f.parentElement;
    if (!y || !u.width) continue;
    const h = getComputedStyle(y);
    r.font = `${h.fontWeight} ${h.fontSize} ${h.fontFamily}`, r.fillStyle = h.color || "#111", r.textBaseline = "top", r.fillText(c, u.left - a.left, u.top - a.top, Math.max(1, a.width - (u.left - a.left)));
  }
  for (const f of Array.from(e.querySelectorAll("input,textarea"))) {
    if (!f.value) continue;
    const c = f.getBoundingClientRect(), m = getComputedStyle(f);
    r.font = `${m.fontSize} ${m.fontFamily}`, r.fillStyle = m.color || "#111", r.fillText(f.value, c.left - a.left + 8, c.top - a.top + 6);
  }
  const i = await new Promise((f, c) => l.toBlob((m) => m ? f(m) : c(new Error("PNG encoding failed")), "image/png")), s = URL.createObjectURL(i), d = document.createElement("a");
  d.download = `${t}.png`, d.href = s, d.click(), setTimeout(() => URL.revokeObjectURL(s), 1e3), console.info("[ugsci.genui] PNG export created", { filename: t, bytes: i.size });
}
function rs(e, t) {
  const a = window.open("", "_blank", "noopener,noreferrer");
  if (!a) throw new Error("print window was blocked");
  a.document.write(`<!doctype html><html><head><title>${t}</title><style>body{font-family:system-ui;padding:24px}@media print{button{display:none}}</style></head><body>${e.outerHTML}</body></html>`), a.document.close(), a.addEventListener("load", () => {
    a.focus(), a.print(), a.close();
  }, { once: !0 });
}
const it = /* @__PURE__ */ new Map();
function os(e) {
  it.set(e, (it.get(e) || 0) + 1);
}
function ss(e) {
  const t = (it.get(e) || 1) - 1;
  t > 0 ? it.set(e, t) : it.delete(e);
}
function is(e) {
  return (it.get(e) || 0) > 0;
}
function cs({ data: e }) {
  var g, f;
  const t = (g = window.QwenPaw) == null ? void 0 : g.host, a = t == null ? void 0 : t.React;
  if (!a) return null;
  const n = Ro(), l = ((f = t.getCurrentSessionId) == null ? void 0 : f.call(t)) || "__current_chat__", r = Array.isArray(e.output) ? e.output : [], o = a.useMemo(
    () => Xa(r),
    [r]
  );
  a.useEffect(() => {
    for (const c of o)
      !c.ui_id || !c.tree || n.setSnapshot({
        schemaVersion: "1",
        uiId: c.ui_id,
        revision: c.revision || 1,
        tree: c.tree,
        sessionId: l,
        sourceToolCallId: c.tool_call_id,
        updatedAt: Date.now()
      });
  }, [o, l]);
  const i = a.useMemo(
    () => o.filter((c) => c.kind === "genui" && !!c.ui_id).map((c) => c.ui_id),
    [o]
  ), s = i.join("\0");
  a.useEffect(() => {
    for (const c of i) os(c);
    return () => {
      for (const c of i) ss(c);
    };
  }, [s]);
  const d = Object.values(n.snapshots).filter((c) => c.sessionId === l).filter(
    (c) => (
      // Only include snapshots whose ui_id appears in this response's results
      o.some(
        (m) => m.ui_id === c.uiId && (m.kind === "genui" || m.kind === "genui_patch" && !is(c.uiId))
      )
    )
  ).sort((c, m) => c.updatedAt - m.updatedAt);
  return d.length === 0 ? null : a.createElement(
    "div",
    { className: "qwenpaw-genui-inline", style: { marginTop: 8, marginBottom: 8 } },
    ...d.map(
      (c) => a.createElement(
        "div",
        {
          key: Ut(c.sessionId, c.uiId),
          className: "qwenpaw-genui-tree",
          "data-genui-id": c.uiId,
          style: { border: "1px solid var(--ant-color-border-secondary, #f0f0f0)", borderRadius: 12, padding: 16, marginBottom: 8, background: "var(--ant-color-bg-container, #fff)" },
          ref: (m) => {
            m && (m.__genuiId = c.uiId);
          }
        },
        a.createElement(
          "div",
          { className: "qwenpaw-genui-export-target" },
          a.createElement(Yo, {
            node: c.tree.root,
            children: a.createElement(st, { node: c.tree.root })
          })
        ),
        a.createElement(
          "div",
          { style: { display: "flex", justifyContent: "flex-end", gap: 6, marginTop: 8 } },
          a.createElement("button", { type: "button", title: "导出 PNG", onClick: (m) => {
            var y;
            const u = (y = m.currentTarget.closest(".qwenpaw-genui-tree")) == null ? void 0 : y.querySelector(".qwenpaw-genui-export-target");
            u && ls(u, c.uiId).catch((h) => console.warn("[ugsci.genui] PNG export failed", h));
          } }, "PNG"),
          a.createElement("button", { type: "button", title: "打印或另存为 PDF", onClick: (m) => {
            var y;
            const u = (y = m.currentTarget.closest(".qwenpaw-genui-tree")) == null ? void 0 : y.querySelector(".qwenpaw-genui-export-target");
            u && rs(u, c.uiId);
          } }, "PDF")
        )
      )
    )
  );
}
let rt = null;
function ds(e, t) {
  var l, r, o;
  const a = "ugsci";
  rt == null || rt();
  const n = [];
  return se("/ugsci/genui/config", { bypassCache: !0 }).then((i) => {
    e.genui = { ...e.genui || {}, config: i };
  }).catch((i) => console.warn("[ugsci.genui] Failed to load runtime config", i)), (l = e.chat) != null && l.toolRender && (n.push(e.chat.toolRender(a, "emit_ui_tree", Pt)), n.push(e.chat.toolRender(a, "emit_ui_patch", Pt)), n.push(e.chat.toolRender(a, "list_ui_components", Pt)), n.push(e.chat.toolRender(a, "get_genui_guide", Pt)), console.info("[ugsci.genui] Registered 4 tool card renderers")), (o = (r = e.chat) == null ? void 0 : r.response) != null && o.append && (n.push(e.chat.response.append(
    a,
    (i) => t.createElement(Lo, null, t.createElement(cs, { data: i.data })),
    { id: "ugsci.genui.response-append", order: 50 }
  )), console.info("[ugsci.genui] Registered response.append slot")), rt = () => {
    var i;
    for (const s of n.reverse()) (i = s == null ? void 0 : s.dispose) == null || i.call(s);
    Bo(), Qo(), rt = null;
  }, rt;
}
function Sa(e) {
  const t = window.QwenPaw;
  t && (t.genui = { ...t.genui || {}, config: e });
}
function ms() {
  const e = $().React, { Alert: t, Card: a, Space: n, Spin: l, Switch: r, Typography: o, message: i } = $().antd, { useEffect: s, useState: d } = e, [g, f] = d(null), [c, m] = d(!1);
  s(() => {
    let y = !0;
    return se("/ugsci/genui/config").then((h) => {
      y && (f(h), Sa(h));
    }).catch((h) => i.error(`读取 GenUI 设置失败：${String(h)}`)), () => {
      y = !1;
    };
  }, []);
  const u = async (y) => {
    m(!0);
    try {
      const h = await se("/ugsci/genui/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: y })
      });
      f(h), Sa(h), i.success(h.overridden ? "设置已保存，但环境变量或插件配置正在覆盖它" : y ? "GenUI 已开启" : "GenUI 已关闭");
    } catch (h) {
      i.error(`保存 GenUI 设置失败：${String(h)}`);
    } finally {
      m(!1);
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
      g === null ? e.createElement(l) : e.createElement(
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
          e.createElement(r, {
            checked: g.persisted_enabled,
            loading: c,
            onChange: u
          })
        ),
        e.createElement(t, {
          type: g.enabled ? "success" : "warning",
          showIcon: !0,
          message: g.enabled ? "GenUI 当前有效；各 Agent 仍可显式关闭自己的 GenUI 工具" : g.overridden ? "GenUI 当前被环境变量或插件配置关闭；本地设置已保存但暂不生效。" : "GenUI 已全局关闭；已有界面仍可查看，但 Agent 不会再生成或更新界面。"
        })
      )
    )
  );
}
function us() {
  var d, g, f;
  const e = window.QwenPaw;
  if (!(e != null && e.menu) || !(e != null && e.route)) {
    console.warn(
      "[ugsci] QwenPaw.menu/route API not available — plugin disabled"
    );
    return;
  }
  const t = $().React, a = "ugsci";
  (g = (d = e.chat) == null ? void 0 : d.rightHeader) != null && g.add ? (e.chat.rightHeader.add(a, t.createElement(Ao), {
    id: "ugsci.welcome-injector",
    order: -1
    // render before other right-header items (invisible anyway)
  }), console.info("[ugsci] WelcomePromptsInjector registered via rightHeader")) : console.warn(
    "[ugsci] QP.chat.rightHeader.add not available — agent-specific welcome prompts disabled"
  );
  const n = $().antdIcons || {}, l = n.UserSwitchOutlined, r = n.ToolOutlined, o = n.ShopOutlined, i = n.AppstoreOutlined;
  e.route.add(a, {
    id: "ugsci.experts",
    path: "/ugsci-experts",
    component: Or
  }), e.menu.add(a, {
    id: "ugsci.experts",
    location: "primary.agentScoped",
    label: () => "专家·协作",
    icon: l ? t.createElement(l, { style: { fontSize: 16 } }) : void 0,
    route: "ugsci.experts",
    order: 5,
    visible: () => gt()
  }), e.route.add(a, {
    id: "ugsci.genui-settings",
    path: "/ugsci-genui-settings",
    component: ms
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
    component: Da
  }), e.menu.add(a, {
    id: "ugsci.tools-skills",
    location: "primary.agentScoped",
    label: () => "工具·技能",
    icon: r ? t.createElement(r, { style: { fontSize: 16 } }) : void 0,
    route: "ugsci.tools-skills",
    order: 6,
    visible: () => gt()
  }), e.route.add(a, {
    id: "ugsci.capabilities",
    path: "/ugsci-capabilities",
    component: oo
  }), e.route.add(a, {
    id: "ugsci.skills-center",
    path: "/ugsci-skills",
    component: so
  }), e.route.add(a, {
    id: "ugsci.market",
    path: "/ugsci-market",
    component: Io
  }), e.menu.add(a, {
    id: "ugsci.market",
    location: "primary.agentScoped",
    label: () => "市场",
    icon: o ? t.createElement(o, { style: { fontSize: 16 } }) : void 0,
    route: "ugsci.market",
    order: 7,
    visible: () => gt()
  }), (f = e.sidebar) != null && f.registerSimpleModeItems ? (e.sidebar.registerSimpleModeItems([
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
  for (const c of s) {
    try {
      const u = e.menu.snapshot("primary.agentScoped").find((y) => y.id === c);
      u && e.menu.replace(a, c, {
        ...u,
        visible: () => !gt()
      });
    } catch {
    }
    try {
      const u = e.menu.snapshot("primary.settings").find((y) => y.id === c);
      u && e.menu.replace(a, c, {
        ...u,
        visible: () => !gt()
      });
    } catch {
    }
  }
  ds(e, t), console.info(
    "[ugsci] Plugin registered: unified Tools & Skills center + compatibility routes, simple-mode navigation active"
  );
}
function pn() {
  try {
    us();
  } catch (e) {
    console.error("[ugsci] Failed to build plugin:", e), setTimeout(pn, 500);
  }
}
var xa;
if ((xa = window.QwenPaw) != null && xa.host)
  pn();
else {
  const e = setInterval(() => {
    var t;
    (t = window.QwenPaw) != null && t.host && (clearInterval(e), pn());
  }, 200);
  setTimeout(() => clearInterval(e), 1e4);
}
