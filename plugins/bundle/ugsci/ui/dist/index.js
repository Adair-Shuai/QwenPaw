function z() {
  var t;
  const e = (t = window.QwenPaw) == null ? void 0 : t.host;
  if (!e) throw new Error("[ugsci] QwenPaw.host not available");
  return e;
}
function Ol() {
  try {
    return z().getApiToken() || "";
  } catch {
    return "";
  }
}
function sn(e) {
  return z().getApiUrl(e);
}
function Ml(e) {
  const t = Ol();
  return {
    "Content-Type": "application/json",
    ...t ? { Authorization: `Bearer ${t}` } : {},
    ...e
  };
}
function Rl(e) {
  const t = new Headers(e), n = {};
  return t.forEach((r, a) => {
    n[a] = r;
  }), n;
}
function Qe(e, t) {
  const n = z(), r = Rl(t == null ? void 0 : t.headers);
  return n.fetch ? n.fetch(e, { ...t, headers: r }) : fetch(n.getApiUrl(e), {
    ...t,
    headers: { ...Ml(), ...r }
  });
}
const $t = /* @__PURE__ */ new Map(), Ll = 15e3;
function Bl(e) {
  return e ? e instanceof Headers ? e.get("X-Agent-Id") || e.get("x-agent-id") || "" : e["X-Agent-Id"] || e["x-agent-id"] || "" : "";
}
function Ul(e, t, n) {
  return `${e}:${t}:${n}`;
}
function Bt() {
  $t.clear();
}
function jn(e) {
  for (const [t, n] of $t)
    (e ? n.agentId === e : n.agentId) && $t.delete(t);
}
async function de(e, t) {
  const n = ((t == null ? void 0 : t.method) || "GET").toUpperCase(), { bypassCache: r, ...a } = t || {}, l = Bl(
    a.headers
  ), o = Ul(n, e, l);
  if (n !== "GET" && (l ? jn(l) : Bt()), n === "GET" && !r) {
    const d = $t.get(o);
    if (d && Date.now() - d.ts < Ll)
      return d.data;
  }
  const i = await Qe(e, a);
  if (!i.ok) {
    const d = await i.text().catch(() => "");
    throw new Error(d || `HTTP ${i.status}`);
  }
  if (i.status === 204) return null;
  const s = await i.json();
  return n === "GET" && $t.set(o, {
    data: s,
    ts: Date.now(),
    agentId: l || void 0
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
function wt() {
  try {
    return localStorage.getItem("qwenpaw_sidebar_mode") === "simple";
  } catch {
    return !1;
  }
}
function cn(e, t) {
  const n = z();
  return n.ReactMarkdown && n.remarkGfm ? t.createElement(
    n.ReactMarkdown,
    { remarkPlugins: [n.remarkGfm] },
    e
  ) : e.replace(/\*\*(.+?)\*\*/g, "$1").replace(/\*(.+?)\*/g, "$1").replace(/`(.+?)`/g, "$1").replace(/^#+\s*/gm, "").replace(/^[-*]\s+/gm, "• ");
}
function dn({
  title: e,
  subtitle: t,
  extra: n
}) {
  const r = z().React, { Space: a } = z().antd;
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
async function un() {
  const e = await de("/agents");
  return (e == null ? void 0 : e.agents) || [];
}
async function Nn(e) {
  return de(
    `/agents/${encodeURIComponent(e)}`
  );
}
async function mn(e) {
  return await de(
    `/agents/${encodeURIComponent(e)}/skills`
  ) || [];
}
async function pn(e = !1) {
  return await de(`/skills/pool${e ? "?summary=true" : ""}`) || [];
}
async function jl(e) {
  const t = await de(
    `/skills/pool/${encodeURIComponent(e)}/content`
  );
  return (t == null ? void 0 : t.content) || "";
}
async function Nl() {
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
function ht(e, t = "") {
  return `/agents/${encodeURIComponent(e)}/skills${t}`;
}
function ga(e) {
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
async function Fl(e) {
  return await de("/workspace/files", {
    headers: { "X-Agent-Id": e }
  }) || [];
}
async function en(e, t, n) {
  return de(`/workspace/files/${encodeURIComponent(t)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify({ content: n })
  });
}
async function Dl(e, t, n, r) {
  return de("/workspace/prompt-files", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify({ filename: t, content: n, enable: r })
  });
}
const Gl = /* @__PURE__ */ new Set([
  "CON",
  "PRN",
  "AUX",
  "NUL",
  ...Array.from({ length: 9 }, (e, t) => `COM${t + 1}`),
  ...Array.from({ length: 9 }, (e, t) => `LPT${t + 1}`)
]);
function Hl(e) {
  let t = e.trim();
  if (!t) throw new Error("请输入文件名");
  if (/[\\/]/.test(t)) throw new Error("文件名不能包含路径分隔符");
  if (/[<>:\"|?*\u0000-\u001f]/.test(t))
    throw new Error("文件名包含系统不支持的字符");
  if (/[ .]$/.test(t)) throw new Error("文件名不能以空格或句点结尾");
  t.toLowerCase().endsWith(".md") ? t = `${t.slice(0, -3)}.md` : t += ".md";
  const n = t.split(".", 1)[0].toUpperCase();
  if (!t.slice(0, -3)) throw new Error("文件名不能为空");
  if (Gl.has(n))
    throw new Error("该文件名是系统保留名称，请更换");
  if (new TextEncoder().encode(t).length > 255)
    throw new Error("文件名过长");
  return t;
}
async function Wl(e, t) {
  const n = await Nn(e);
  n.system_prompt_files = t, await de(`/agents/${encodeURIComponent(e)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(n)
  });
}
async function Fn(e, t) {
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
async function ya(e, t) {
  await de(
    ht(e, `/${encodeURIComponent(t)}/enable`),
    {
      method: "POST"
    }
  );
}
async function Dn(e, t) {
  await de(ht(e, `/${encodeURIComponent(t)}`), {
    method: "DELETE"
  });
}
async function Vl(e, t) {
  return de(ht(e, "/batch-enable"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(t)
  });
}
async function ql(e, t) {
  return de(ht(e, "/batch-disable"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(t)
  });
}
async function Jl(e, t) {
  return de(ht(e, "/batch-delete"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(t)
  });
}
async function Gn(e) {
  return await de("/mcp", {
    headers: { "X-Agent-Id": e }
  }) || [];
}
async function ha(e, t) {
  await de(`/mcp/${encodeURIComponent(t)}`, {
    method: "DELETE",
    headers: { "X-Agent-Id": e }
  });
}
async function Hn(e, t) {
  return de("/mcp", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify(t)
  });
}
async function Kl(e, t) {
  return de(
    `/mcp/toggle/${encodeURIComponent(t)}`,
    {
      method: "PATCH",
      headers: { "X-Agent-Id": e }
    }
  );
}
async function Ea(e, t) {
  await de(
    ht(e, `/${encodeURIComponent(t)}/disable`),
    {
      method: "POST"
    }
  );
}
async function Xl(e) {
  await de(`/skills/pool/${encodeURIComponent(e)}`, {
    method: "DELETE"
  });
}
function Yl(e) {
  const t = (e || "").trim();
  if (!t) return { number: 6, unit: "h" };
  const n = t.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/i);
  if (!n) return { number: 6, unit: "h" };
  const r = parseInt(n[1] || "0", 10), a = parseInt(n[2] || "0", 10), l = parseInt(n[3] || "0", 10), o = r * 60 + a + Math.round(l / 60);
  return o <= 0 ? { number: 6, unit: "h" } : o >= 60 && o % 60 === 0 ? { number: o / 60, unit: "h" } : { number: o, unit: "m" };
}
function Ql(e) {
  return e.unit === "h" ? `${e.number}h` : `${e.number}m`;
}
async function Zl(e) {
  return de("/config/heartbeat", {
    headers: { "X-Agent-Id": e }
  });
}
async function eo(e, t) {
  return de("/config/heartbeat", {
    method: "PUT",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify(t)
  });
}
async function to(e) {
  await de("/config/heartbeat/run", {
    method: "POST",
    headers: { "X-Agent-Id": e }
  });
}
async function no(e) {
  return de("/workspace/running-config", {
    headers: { "X-Agent-Id": e }
  });
}
async function ro(e, t) {
  return de("/workspace/running-config", {
    method: "PUT",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify(t)
  });
}
async function ao(e) {
  return (await de("/workspace/language", {
    headers: { "X-Agent-Id": e }
  })).language || "zh";
}
async function lo(e, t) {
  await de("/workspace/language", {
    method: "PUT",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify({ language: t })
  });
}
async function oo() {
  return (await de("/config/user-timezone")).timezone || "UTC";
}
async function so(e) {
  await de("/config/user-timezone", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ timezone: e })
  });
}
async function io(e) {
  return await de("/workspace/system-prompt-files", {
    headers: { "X-Agent-Id": e }
  }) || [];
}
const kr = ["AGENTS.md", "SOUL.md", "PROFILE.md"];
function Cr({
  items: e,
  max: t = 5,
  color: n = "blue",
  emptyText: r = "无"
}) {
  const a = z().React, { Tag: l } = z().antd;
  return !e || e.length === 0 ? a.createElement(
    "span",
    { style: { fontSize: 12, color: "var(--ant-color-text-quaternary, #bfbfbf)" } },
    r
  ) : a.createElement(
    "div",
    { style: { display: "flex", flexWrap: "wrap", gap: 4 } },
    ...e.slice(0, t).map(
      (o, i) => a.createElement(
        l,
        { key: i, color: n, style: { fontSize: 11, marginRight: 0 } },
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
function ba({
  open: e,
  onClose: t,
  poolSkills: n,
  installedSkillNames: r,
  loading: a,
  onInstall: l
}) {
  const o = z().React, { useState: i, useEffect: s, useMemo: d } = o, { Modal: u, Button: p, Empty: c, Spin: m, Input: h, Tag: f, Tooltip: g, Typography: E } = z().antd, { CheckOutlined: v, SearchOutlined: b } = z().antdIcons || {}, { Text: w } = E, [I, R] = i([]), [U, P] = i("");
  s(() => {
    e && (R([]), P(""));
  }, [e]);
  const $ = d(() => {
    if (!U.trim()) return n;
    const x = U.toLowerCase();
    return n.filter(
      (S) => {
        var _, A;
        return S.name.toLowerCase().includes(x) || ((_ = S.description) == null ? void 0 : _.toLowerCase().includes(x)) || ((A = S.tags) == null ? void 0 : A.some((H) => H.toLowerCase().includes(x)));
      }
    );
  }, [n, U]), F = $.filter(
    (x) => !r.includes(x.name)
  ), W = (x) => {
    R(
      (S) => S.includes(x) ? S.filter((_) => _ !== x) : [...S, x]
    );
  }, N = async () => {
    I.length !== 0 && (await l(I), R([]));
  };
  return o.createElement(
    u,
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
          w,
          { type: "secondary", style: { fontSize: 13 } },
          `已选择 ${I.length} 个技能`
        ),
        o.createElement(
          "div",
          { style: { display: "flex", gap: 8 } },
          o.createElement(p, { onClick: t }, "取消"),
          o.createElement(
            p,
            {
              type: "primary",
              onClick: N,
              disabled: I.length === 0
            },
            I.length > 0 ? `添加 (${I.length})` : "添加"
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
      o.createElement(h, {
        placeholder: "搜索技能名称、描述或标签...",
        prefix: b ? o.createElement(b) : void 0,
        value: U,
        onChange: (x) => P(x.target.value),
        allowClear: !0,
        style: { flex: 1 }
      }),
      o.createElement(
        p,
        {
          size: "small",
          type: "primary",
          onClick: () => R(F.map((x) => x.name))
        },
        "全选"
      ),
      o.createElement(
        p,
        {
          size: "small",
          onClick: () => R([])
        },
        "清空"
      )
    ),
    // Skill grid (card style matching Skill Center)
    a ? o.createElement(
      "div",
      { style: { textAlign: "center", padding: 40 } },
      o.createElement(m, { size: "large" })
    ) : $.length === 0 ? o.createElement(c, {
      description: U ? "未找到匹配的技能" : "技能池暂无可用技能",
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
      ...$.map((x) => {
        const S = I.includes(x.name), _ = r.includes(x.name);
        return o.createElement(
          "div",
          {
            key: x.name,
            onClick: () => !_ && W(x.name),
            style: {
              position: "relative",
              padding: "10px 12px",
              border: `1px solid ${S ? "#0072f5" : "var(--ant-color-border-secondary, #e8e8e8)"}`,
              borderRadius: 6,
              cursor: _ ? "not-allowed" : "pointer",
              transition: "all 0.15s ease",
              background: S ? "rgba(0, 114, 245, 0.06)" : _ ? "var(--ant-color-fill-quaternary, #fafafa)" : "var(--ant-color-bg-container, #fff)",
              opacity: _ ? 0.5 : 1,
              minHeight: 64
            }
          },
          S ? o.createElement(
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
                paddingRight: _ || S ? 24 : 0
              }
            },
            o.createElement(
              "span",
              { style: { fontSize: 16 } },
              x.emoji || "⚡"
            ),
            o.createElement(
              g,
              { title: x.name },
              o.createElement(
                w,
                {
                  strong: !0,
                  style: {
                    fontSize: 13,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap"
                  }
                },
                x.name
              )
            )
          ),
          x.description ? o.createElement(
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
            x.description
          ) : null,
          x.tags && x.tags.length > 0 ? o.createElement(
            "div",
            {
              style: {
                marginTop: 4,
                display: "flex",
                gap: 2,
                flexWrap: "wrap"
              }
            },
            ...x.tags.slice(0, 2).map(
              (A, H) => o.createElement(
                f,
                {
                  key: H,
                  color: "cyan",
                  style: { fontSize: 10, marginRight: 0 }
                },
                A
              )
            )
          ) : null
        );
      })
    )
  );
}
function va({
  agentId: e,
  systemPromptFiles: t,
  onRefresh: n
}) {
  const r = z().React, { useState: a, useEffect: l, useCallback: o, useRef: i } = r, {
    List: s,
    Tag: d,
    Switch: u,
    Button: p,
    Modal: c,
    Input: m,
    Spin: h,
    Empty: f,
    message: g,
    Typography: E,
    Segmented: v,
    Alert: b
  } = z().antd, { FileTextOutlined: w, PlusOutlined: I, EditOutlined: R, ReloadOutlined: U } = z().antdIcons || {}, { Text: P } = E, [$, F] = a([]), [W, N] = a(!0), [x, S] = a(
    t || []
  ), [_, A] = a(!1), [H, D] = a(null), [j, O] = a(""), [k, se] = a(""), [oe, B] = a(!1), [L, ae] = a("source"), ne = i(0), J = o(async () => {
    const Q = ++ne.current;
    N(!0);
    try {
      const Z = await Fl(e);
      Q === ne.current && F(Z);
    } catch (Z) {
      Q === ne.current && (g.error(Z.message || "加载工作区文档失败"), F([]));
    } finally {
      Q === ne.current && N(!1);
    }
  }, [e]);
  l(() => {
    J();
  }, [J]), l(() => {
    S(t || []);
  }, [t]);
  const pe = async (Q, Z) => {
    const ce = new Set(x);
    if (Z)
      ce.add(Q);
    else {
      if (kr.includes(Q) && Q === "AGENTS.md") {
        g.warning("AGENTS.md 是核心文件，不能停用");
        return;
      }
      ce.delete(Q);
    }
    const Ee = Array.from(ce);
    S(Ee);
    try {
      await Wl(e, Ee), g.success(Z ? "已启用记忆文件" : "已停用记忆文件"), n();
    } catch (Se) {
      g.error(Se.message || "更新失败"), S(t || []);
    }
  }, M = async (Q) => {
    try {
      const Z = await de(
        `/workspace/files/${encodeURIComponent(Q)}`,
        { headers: { "X-Agent-Id": e } }
      );
      D(Q), O(Z.content || ""), ae("source"), A(!0);
    } catch (Z) {
      g.error(Z.message || "读取文件失败");
    }
  }, ie = () => {
    D(null), O(""), se(""), ae("source"), A(!0);
  }, me = async () => {
    let Q;
    try {
      Q = Hl(H || k);
    } catch (Z) {
      g.warning(Z.message || "文件名无效");
      return;
    }
    if (!j.trim()) {
      g.warning("Markdown 文档不能为空");
      return;
    }
    if (new TextEncoder().encode(j).length > 1024 * 1024) {
      g.warning("Markdown 文档不能超过 1 MB");
      return;
    }
    B(!0);
    try {
      if (H)
        await en(e, Q, j);
      else {
        const Z = await Dl(
          e,
          Q,
          j,
          !0
        );
        S(Z.system_prompt_files);
      }
      g.success("保存成功"), A(!1), J(), n();
    } catch (Z) {
      const ce = Z != null && Z.message ? `：${Z.message}` : "";
      g.error(
        H ? (Z == null ? void 0 : Z.message) || "保存失败" : `创建并挂载失败，服务端已回滚文件${ce}`
      );
    } finally {
      B(!1);
    }
  };
  return W ? r.createElement(
    "div",
    { style: { textAlign: "center", padding: 40 } },
    r.createElement(h, { size: "large" })
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
        w ? r.createElement(w, {
          style: { fontSize: 14, color: "#1677ff" }
        }) : null,
        r.createElement(
          P,
          { strong: !0 },
          `工作区文档 (${$.length})`
        ),
        r.createElement(
          P,
          { type: "secondary", style: { fontSize: 12 } },
          `· ${x.length} 个已挂载到系统提示`
        )
      ),
      r.createElement(
        "div",
        { style: { display: "flex", gap: 8 } },
        r.createElement(
          p,
          {
            size: "small",
            icon: U ? r.createElement(U) : void 0,
            onClick: J
          },
          "刷新"
        ),
        r.createElement(
          p,
          {
            type: "primary",
            size: "small",
            icon: I ? r.createElement(I) : void 0,
            onClick: ie
          },
          "新建 Markdown 文档"
        )
      )
    ),
    $.length === 0 ? r.createElement(f, {
      description: "暂无 Markdown 文档，点击「新建 Markdown 文档」添加",
      image: f.PRESENTED_IMAGE_SIMPLE
    }) : r.createElement(s, {
      dataSource: $,
      renderItem: (Q) => {
        const Z = x.includes(Q.filename), ce = kr.includes(Q.filename);
        return r.createElement(
          s.Item,
          {
            actions: [
              r.createElement(
                p,
                {
                  type: "link",
                  size: "small",
                  icon: R ? r.createElement(R) : void 0,
                  onClick: () => M(Q.filename)
                },
                "编辑"
              )
            ]
          },
          r.createElement(s.Item.Meta, {
            avatar: r.createElement(w, {
              style: {
                fontSize: 20,
                color: Z ? "#1677ff" : "var(--ant-color-text-quaternary, #bfbfbf)"
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
              r.createElement(P, null, Q.filename),
              ce ? r.createElement(
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
              `${(Q.size / 1024).toFixed(1)} KB · 修改于 ${new Date(Q.modified_time).toLocaleString()}`
            )
          }),
          r.createElement(u, {
            checked: Z,
            size: "small",
            onChange: (Ee) => pe(Q.filename, Ee)
          })
        );
      }
    }),
    // Edit/New file modal
    r.createElement(
      c,
      {
        open: _,
        onCancel: () => A(!1),
        title: H ? `编辑 ${H}` : "新建 Markdown 文档",
        width: 700,
        onOk: me,
        confirmLoading: oe,
        okText: "保存"
      },
      H ? null : r.createElement(
        "div",
        { style: { marginBottom: 12 } },
        r.createElement(m, {
          placeholder: "文件名（如：油藏工程记忆库.md）",
          value: k,
          onChange: (Q) => se(Q.target.value),
          addonAfter: k.endsWith(".md") ? "" : ".md"
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
          onChange: (Q) => ae(Q)
        }),
        r.createElement(
          P,
          { type: "secondary", style: { fontSize: 12 } },
          `${j.length} 字符 · 约 ${Math.ceil(j.length / 4)} tokens · ${H && x.includes(H) ? "已挂载" : H ? "未挂载" : "保存后自动挂载"}`
        )
      ),
      j.trim() ? null : r.createElement(b, {
        type: "warning",
        showIcon: !0,
        message: "文档内容为空，保存前需要填写 Markdown 内容",
        style: { marginBottom: 10 }
      }),
      L === "source" ? r.createElement(m.TextArea, {
        value: j,
        onChange: (Q) => O(Q.target.value),
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
        cn(j, r)
      )
    )
  );
}
function co({
  skills: e,
  agentId: t
}) {
  const n = z().React, { useMemo: r } = n, {
    List: a,
    Tag: l,
    Typography: o,
    Empty: i,
    Button: s,
    message: d
  } = z().antd, { ThunderboltOutlined: u, CopyOutlined: p } = z().antdIcons || {}, { Text: c } = o, m = r(() => ga(e), [e]), h = (g) => {
    try {
      const E = z();
      E.setSelectedAgent && E.setSelectedAgent(t);
    } catch {
    }
    try {
      sessionStorage.setItem("ugsci_pending_prompt", g.value);
    } catch {
    }
    window.history.pushState({}, "", "/chat"), window.dispatchEvent(new PopStateEvent("popstate"));
  }, f = (g) => {
    var E;
    (E = navigator.clipboard) == null || E.writeText(g.value).then(() => {
      d.success("已复制到剪贴板");
    });
  };
  return m.length === 0 ? n.createElement(i, {
    description: "暂无推荐提问，请先为专家添加技能",
    image: i.PRESENTED_IMAGE_SIMPLE
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
      u ? n.createElement(u, {
        style: { fontSize: 14, color: "#1677ff" }
      }) : null,
      n.createElement(
        c,
        { strong: !0 },
        `推荐提问 (${m.length})`
      ),
      n.createElement(
        c,
        { type: "secondary", style: { fontSize: 12 } },
        "· 从技能描述中自动提取"
      )
    ),
    n.createElement(a, {
      dataSource: m,
      renderItem: (g, E) => n.createElement(
        a.Item,
        {
          actions: [
            n.createElement(
              s,
              {
                type: "link",
                size: "small",
                icon: p ? n.createElement(p) : void 0,
                onClick: () => f(g)
              },
              "复制"
            )
          ]
        },
        n.createElement(a.Item.Meta, {
          avatar: n.createElement(
            l,
            { color: "blue", style: { borderRadius: "50%" } },
            `${E + 1}`
          ),
          title: n.createElement(
            "div",
            {
              style: {
                cursor: "pointer",
                color: "#1677ff"
              },
              onClick: () => h(g)
            },
            g.value
          ),
          description: n.createElement(
            c,
            { type: "secondary", style: { fontSize: 12 } },
            g.label
          )
        })
      )
    })
  );
}
const ft = {
  marginBottom: 4,
  fontSize: 13,
  fontWeight: 500,
  color: "rgba(0,0,0,0.85)",
  display: "flex",
  alignItems: "center",
  gap: 4
}, wa = { marginBottom: 16 }, Sa = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "0 16px",
  marginBottom: 16
}, tt = {
  fontSize: 13,
  fontWeight: 600,
  color: "rgba(0,0,0,0.85)",
  marginBottom: 12,
  paddingBottom: 8,
  borderBottom: "1px solid #f0f0f0"
}, xa = {
  fontSize: 12,
  color: "rgba(0,0,0,0.45)",
  marginLeft: 8
};
function uo({ agentId: e }) {
  const t = z().React, { useState: n, useEffect: r, useCallback: a } = t, {
    Switch: l,
    InputNumber: o,
    Select: i,
    Button: s,
    Spin: d,
    Space: u,
    Typography: p,
    message: c
  } = z().antd, { PlayCircleOutlined: m, SaveOutlined: h } = z().antdIcons || {}, { Text: f } = p, [g, E] = n(!0), [v, b] = n(!1), [w, I] = n(!1), [R, U] = n(!1), [P, $] = n(6), [F, W] = n("h"), [N, x] = n("main"), [S, _] = n(300), [A, H] = n(!1), [D, j] = n("08:00"), [O, k] = n("22:00"), se = a(async () => {
    var J, pe;
    E(!0);
    try {
      const M = await Zl(e), ie = Yl(M.every ?? "6h");
      U(M.enabled ?? !1), $(ie.number), W(ie.unit), x(M.target ?? "main"), _(M.timeoutSeconds ?? 300), H(!!M.activeHours), j(((J = M.activeHours) == null ? void 0 : J.start) ?? "08:00"), k(((pe = M.activeHours) == null ? void 0 : pe.end) ?? "22:00");
    } catch (M) {
      c.error(M.message || "加载心跳配置失败");
    } finally {
      E(!1);
    }
  }, [e]);
  r(() => {
    se();
  }, [se]);
  const oe = async () => {
    b(!0);
    try {
      await eo(e, {
        enabled: R,
        every: Ql({ number: P, unit: F }),
        target: N,
        timeoutSeconds: S,
        activeHours: A && D && O ? { start: D, end: O } : void 0
      }), c.success("心跳配置已保存");
    } catch (J) {
      c.error(J.message || "保存心跳配置失败");
    } finally {
      b(!1);
    }
  }, B = async () => {
    I(!0);
    try {
      await to(e), c.success("已触发心跳检查");
    } catch (J) {
      c.error(J.message || "触发心跳失败");
    } finally {
      I(!1);
    }
  };
  if (g)
    return t.createElement(
      "div",
      { style: { textAlign: "center", padding: 40 } },
      t.createElement(d, { size: "large" })
    );
  const L = (J, pe, M) => t.createElement(
    "div",
    { style: wa },
    t.createElement("div", { style: ft }, J),
    pe,
    M ? t.createElement(
      f,
      { type: "secondary", style: xa },
      M
    ) : null
  ), ae = (J, pe, M, ie) => t.createElement(
    "div",
    { style: Sa },
    t.createElement(
      "div",
      null,
      t.createElement("div", { style: ft }, J),
      pe
    ),
    t.createElement(
      "div",
      null,
      t.createElement("div", { style: ft }, M),
      ie
    )
  ), { Divider: ne } = z().antd;
  return t.createElement(
    "div",
    { style: { paddingBottom: 8 } },
    // ── Section: 基本设置 ──
    t.createElement("div", { style: tt }, "基本设置"),
    L(
      "启用心跳",
      t.createElement(l, {
        checked: R,
        onChange: (J) => U(J)
      }),
      R ? "已启用，专家将定期自检" : "已停用"
    ),
    ae(
      "检查频率",
      t.createElement(
        u,
        null,
        t.createElement(o, {
          min: 1,
          value: P,
          onChange: (J) => $(J ?? 1),
          style: { width: "100%" }
        }),
        t.createElement(i, {
          value: F,
          onChange: (J) => W(J),
          style: { width: 90 },
          options: [
            { value: "m", label: "分钟" },
            { value: "h", label: "小时" }
          ]
        })
      ),
      "心跳目标",
      t.createElement(i, {
        value: N,
        onChange: (J) => x(J),
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
        value: S,
        onChange: (J) => _(J ?? 300),
        style: { width: 200 }
      })
    ),
    // ── Section: 活跃时段 ──
    t.createElement(ne, { style: { margin: "8px 0 16px" } }),
    t.createElement("div", { style: tt }, "活跃时段"),
    L(
      "启用活跃时段限制",
      t.createElement(l, {
        checked: A,
        onChange: (J) => H(J)
      }),
      "仅在指定时段内触发心跳"
    ),
    A ? ae(
      "开始时间",
      t.createElement("input", {
        type: "time",
        value: D,
        onChange: (J) => j(J.target.value),
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
        value: O,
        onChange: (J) => k(J.target.value),
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
          icon: h ? t.createElement(h) : void 0,
          loading: v,
          onClick: oe,
          style: je
        },
        "保存配置"
      ),
      t.createElement(
        s,
        {
          icon: m ? t.createElement(m) : void 0,
          loading: w,
          onClick: B
        },
        "立即执行"
      )
    )
  );
}
function mo({
  agentId: e,
  onRefresh: t
}) {
  const n = z().React, { useState: r, useEffect: a, useCallback: l } = n, {
    List: o,
    Tag: i,
    Switch: s,
    Button: d,
    Empty: u,
    Spin: p,
    Typography: c,
    message: m
  } = z().antd, { PlusOutlined: h, ReloadOutlined: f, DeleteOutlined: g } = z().antdIcons || {}, { Text: E, Paragraph: v } = c, [b, w] = r([]), [I, R] = r(!0), [U, P] = r(!1), [$, F] = r([]), [W, N] = r(!1), x = l(async () => {
    R(!0);
    try {
      const j = await mn(e);
      w(j);
    } catch (j) {
      m.error(j.message || "加载技能失败"), w([]);
    } finally {
      R(!1);
    }
  }, [e]);
  a(() => {
    x();
  }, [x]);
  const S = async () => {
    P(!0), N(!0);
    try {
      const j = await pn(!0);
      F(j);
    } catch (j) {
      m.error(j.message || "加载技能池失败");
    } finally {
      N(!1);
    }
  }, _ = async (j) => {
    let O = 0, k = 0;
    for (const se of j)
      try {
        await Fn(e, se), O++;
      } catch {
        k++;
      }
    O > 0 ? (m.success(
      `成功添加 ${O} 个技能${k > 0 ? `，${k} 个失败` : ""}`
    ), x(), t()) : k > 0 && m.error("添加技能失败"), P(!1);
  }, A = async (j, O) => {
    try {
      O ? await ya(e, j.name) : await Ea(e, j.name), m.success(O ? "已启用" : "已停用"), x(), t();
    } catch (k) {
      m.error(k.message || "操作失败");
    }
  }, H = async (j) => {
    try {
      await Dn(e, j), m.success(`技能「${j}」已移除`), x(), t();
    } catch (O) {
      m.error(O.message || "移除技能失败");
    }
  };
  if (I)
    return n.createElement(
      "div",
      { style: { textAlign: "center", padding: 40 } },
      n.createElement(p, { size: "large" })
    );
  const D = b.filter((j) => j.enabled !== !1);
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
        E,
        { strong: !0 },
        `技能列表 (${b.length}，已启用 ${D.length})`
      ),
      n.createElement(
        "div",
        { style: { display: "flex", gap: 8 } },
        n.createElement(
          d,
          {
            size: "small",
            icon: f ? n.createElement(f) : void 0,
            onClick: () => {
              Bt(), x();
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
            onClick: S,
            style: je
          },
          "从技能池添加"
        )
      )
    ),
    b.length === 0 ? n.createElement(u, {
      description: "该专家暂无技能",
      image: u.PRESENTED_IMAGE_SIMPLE
    }) : n.createElement(o, {
      dataSource: b,
      renderItem: (j) => n.createElement(
        o.Item,
        {
          actions: [
            n.createElement(s, {
              key: "toggle",
              size: "small",
              checked: j.enabled !== !1,
              onChange: (O) => A(j, O)
            }),
            n.createElement(
              d,
              {
                key: "del",
                type: "link",
                size: "small",
                danger: !0,
                icon: g ? n.createElement(g) : void 0,
                onClick: () => H(j.name)
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
            j.emoji ? n.createElement(
              "span",
              { style: { fontSize: 16 } },
              j.emoji
            ) : null,
            n.createElement(E, { strong: !0 }, j.name),
            j.version_text ? n.createElement(
              i,
              { style: { fontSize: 10 } },
              `v${j.version_text}`
            ) : null
          ),
          j.description ? n.createElement(
            v,
            {
              type: "secondary",
              style: { fontSize: 12, margin: 0 },
              ellipsis: { rows: 2 }
            },
            j.description
          ) : null
        )
      )
    }),
    n.createElement(ba, {
      open: U,
      onClose: () => P(!1),
      poolSkills: $,
      installedSkillNames: b.map((j) => j.name),
      loading: W,
      onInstall: _
    })
  );
}
function po({
  agentId: e,
  onRefresh: t,
  isActive: n
}) {
  const r = z().React, { useState: a, useEffect: l, useCallback: o } = r, {
    List: i,
    Tag: s,
    Button: d,
    Empty: u,
    Spin: p,
    Modal: c,
    Input: m,
    Typography: h,
    message: f
  } = z().antd, { PlusOutlined: g, ReloadOutlined: E, DeleteOutlined: v } = z().antdIcons || {}, { Text: b, Paragraph: w } = h, { TextArea: I } = m, [R, U] = a([]), [P, $] = a(!0), [F, W] = a(!1), [N, x] = a(`{
  "mcpServers": {
    "example-client": {
      "command": "npx",
      "args": ["-y", "@example/mcp-server"],
      "env": {}
    }
  }
}`), [S, _] = a(!1), A = o(async () => {
    $(!0);
    try {
      const O = await Gn(e);
      U(O);
    } catch (O) {
      f.error(O.message || "加载 MCP 失败"), U([]);
    } finally {
      $(!1);
    }
  }, [e]);
  l(() => {
    A();
  }, [A]), l(() => {
    n && A();
  }, [n, A]);
  const H = async (O) => {
    try {
      await Kl(e, O), f.success("已切换 MCP 状态"), A(), t();
    } catch (k) {
      f.error(k.message || "切换失败");
    }
  }, D = async (O) => {
    try {
      await ha(e, O), f.success(`MCP「${O}」已移除`), A(), t();
    } catch (k) {
      f.error(k.message || "移除 MCP 失败");
    }
  }, j = async () => {
    _(!0);
    try {
      const O = JSON.parse(N), k = O.mcpServers || O, se = Object.entries(k);
      if (se.length === 0) {
        f.warning("未找到 MCP 客户端配置");
        return;
      }
      for (const [oe, B] of se) {
        const L = B, ae = L.url ? "streamable_http" : "stdio";
        await Hn(e, {
          client_key: oe,
          client: {
            name: L.name || oe,
            description: L.description || "",
            enabled: !0,
            transport: ae,
            url: L.url || "",
            command: L.command || "",
            args: L.args || [],
            env: L.env || {},
            cwd: L.cwd || "",
            headers: L.headers || {}
          }
        });
      }
      f.success("MCP 客户端已创建"), W(!1), A(), t();
    } catch (O) {
      O instanceof SyntaxError ? f.error("JSON 格式错误：" + O.message) : f.error(O.message || "创建 MCP 失败");
    } finally {
      _(!1);
    }
  };
  return P ? r.createElement(
    "div",
    { style: { textAlign: "center", padding: 40 } },
    r.createElement(p, { size: "large" })
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
      r.createElement(b, { strong: !0 }, `MCP 客户端 (${R.length})`),
      r.createElement(
        "div",
        { style: { display: "flex", gap: 8 } },
        r.createElement(
          d,
          {
            size: "small",
            icon: E ? r.createElement(E) : void 0,
            onClick: () => {
              Bt(), A();
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
            onClick: () => W(!0),
            style: je
          },
          "添加 MCP"
        )
      )
    ),
    R.length === 0 ? r.createElement(u, {
      description: "该专家暂无 MCP 客户端",
      image: u.PRESENTED_IMAGE_SIMPLE
    }) : r.createElement(i, {
      dataSource: R,
      renderItem: (O) => r.createElement(
        i.Item,
        {
          actions: [
            r.createElement(
              d,
              {
                key: "toggle",
                size: "small",
                onClick: () => H(O.key)
              },
              O.enabled ? "停用" : "启用"
            ),
            r.createElement(
              d,
              {
                key: "del",
                type: "link",
                size: "small",
                danger: !0,
                icon: v ? r.createElement(v) : void 0,
                onClick: () => D(O.key)
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
            r.createElement(b, { strong: !0 }, O.name || O.key),
            r.createElement(
              s,
              {
                color: O.enabled ? "green" : "default",
                style: { fontSize: 10 }
              },
              O.enabled ? "启用" : "停用"
            ),
            r.createElement(
              s,
              { color: "purple", style: { fontSize: 10 } },
              O.transport
            )
          ),
          O.description ? r.createElement(
            w,
            {
              type: "secondary",
              style: { fontSize: 12, margin: 0 },
              ellipsis: { rows: 2 }
            },
            O.description
          ) : null,
          O.tools && O.tools.length > 0 ? r.createElement(
            "div",
            { style: { marginTop: 4, fontSize: 11, color: "var(--ant-color-text-tertiary, #8c8c8c)" } },
            `提供 ${O.tools.length} 个工具`
          ) : null
        )
      )
    }),
    // Create MCP modal
    r.createElement(
      c,
      {
        open: F,
        title: "添加 MCP 客户端 (JSON)",
        onCancel: () => W(!1),
        onOk: j,
        confirmLoading: S,
        okText: "创建",
        width: 560
      },
      r.createElement(
        "div",
        { style: { marginBottom: 8, fontSize: 12, color: "var(--ant-color-text-tertiary, #8c8c8c)" } },
        "粘贴 MCP 配置 JSON（支持 mcpServers 格式），将创建到当前专家工作区："
      ),
      r.createElement(I, {
        value: N,
        onChange: (O) => x(O.target.value),
        rows: 12,
        style: { fontFamily: "monospace", fontSize: 12 }
      })
    )
  );
}
function fo({ agentId: e }) {
  const t = z().React, { useState: n, useEffect: r, useCallback: a, useRef: l } = t, {
    Card: o,
    InputNumber: i,
    Input: s,
    Select: d,
    Switch: u,
    Button: p,
    Spin: c,
    Space: m,
    Typography: h,
    Divider: f,
    message: g
  } = z().antd, { SaveOutlined: E } = z().antdIcons || {}, { Text: v } = h, [b, w] = n(!0), [I, R] = n(!1), U = l(null), [P, $] = n(60), [F, W] = n(""), [N, x] = n(!0), [S, _] = n(30), [A, H] = n("zh"), [D, j] = n("UTC"), [O, k] = n(!0), [se, oe] = n(100), [B, L] = n(!0), [ae, ne] = n(3), [J, pe] = n(1), [M, ie] = n(!0), [me, Q] = n(3), [Z, ce] = n(2), [Ee, Se] = n(60), [$e, xe] = n(1), [ee, we] = n(0), [be, te] = n(1), [ue, ge] = n(0), [K, C] = n(30), [ye, q] = n(50), [T, re] = n("light"), [fe, Ae] = n("scroll"), [Le, We] = n("remelight"), [Be, qe] = n("AUTO"), st = a(async () => {
    var le, ze, Pe, Me, Xe, Ye;
    w(!0);
    try {
      const [Ie, Ut, yn] = await Promise.all([
        no(e),
        ao(e).catch(() => "zh"),
        oo().catch(() => "UTC")
      ]);
      U.current = Ie, $(Ie.shell_command_timeout ?? 60), W(Ie.shell_command_executable ?? "");
      const Et = Ie.auto_title_config ?? { enabled: !0, timeout_seconds: 30 };
      x(Et.enabled ?? !0), _(Et.timeout_seconds ?? 30), H(Ut), j(yn);
      const Ze = Ie.loop ?? {};
      k(((le = Ze.iteration) == null ? void 0 : le.enabled) ?? !0), oe(((ze = Ze.iteration) == null ? void 0 : ze.max_iterations) ?? Ie.max_iters ?? 100), L(((Pe = Ze.doom_loop) == null ? void 0 : Pe.enabled) ?? !0), ne(((Me = Ze.doom_loop) == null ? void 0 : Me.window_size) ?? 3), pe(((Xe = Ze.doom_loop) == null ? void 0 : Xe.similarity_threshold) ?? 1), ie(Ie.llm_retry_enabled ?? !0), Q(Ie.llm_max_retries ?? 3), ce(Ie.llm_backoff_base ?? 2), Se(Ie.llm_backoff_cap ?? 60), xe(Ie.llm_max_concurrent ?? 1), we(Ie.llm_max_qpm ?? 0), te(Ie.llm_rate_limit_pause ?? 1), ge(Ie.llm_rate_limit_jitter ?? 0), C(Ie.llm_acquire_timeout ?? 30), q(Ie.history_max_length ?? 50), re(Ie.context_manager_backend ?? "light"), Ae(((Ye = Ie.light_context_config) == null ? void 0 : Ye.strategy) ?? "scroll"), We(Ie.memory_manager_backend ?? "remelight"), qe(Ie.approval_level ?? "AUTO");
    } catch (Ie) {
      g.error(Ie.message || "加载运行配置失败");
    } finally {
      w(!1);
    }
  }, [e]);
  r(() => {
    st();
  }, [st]);
  const Ve = async () => {
    var ze, Pe;
    const le = U.current;
    if (le) {
      R(!0);
      try {
        const Me = {
          ...le,
          max_iters: se,
          loop: {
            ...le.loop ?? {},
            iteration: { enabled: O, max_iterations: se },
            doom_loop: {
              enabled: B,
              window_size: ae,
              similarity_threshold: J,
              stages: ((Pe = (ze = le.loop) == null ? void 0 : ze.doom_loop) == null ? void 0 : Pe.stages) ?? []
            }
          },
          shell_command_timeout: P,
          shell_command_executable: F,
          auto_title_config: {
            enabled: N,
            timeout_seconds: S
          },
          llm_retry_enabled: M,
          llm_max_retries: me,
          llm_backoff_base: Z,
          llm_backoff_cap: Ee,
          llm_max_concurrent: $e,
          llm_max_qpm: ee,
          llm_rate_limit_pause: be,
          llm_rate_limit_jitter: ue,
          llm_acquire_timeout: K,
          history_max_length: ye,
          context_manager_backend: T,
          light_context_config: {
            ...le.light_context_config ?? {},
            strategy: fe
          },
          memory_manager_backend: Le,
          approval_level: Be
        };
        await ro(e, Me), U.current = Me, A && await lo(e, A).catch(() => {
        }), D && await so(D).catch(() => {
        }), g.success("运行配置已保存");
      } catch (Me) {
        g.error(Me.message || "保存运行配置失败");
      } finally {
        R(!1);
      }
    }
  };
  if (b)
    return t.createElement(
      "div",
      { style: { textAlign: "center", padding: 40 } },
      t.createElement(c, { size: "large" })
    );
  const _e = (le, ze, Pe) => t.createElement(
    "div",
    { style: wa },
    t.createElement("div", { style: ft }, le),
    ze,
    Pe ? t.createElement(
      v,
      { type: "secondary", style: xa },
      Pe
    ) : null
  ), Re = (le, ze, Pe, Me) => t.createElement(
    "div",
    { style: Sa },
    t.createElement(
      "div",
      null,
      t.createElement("div", { style: ft }, le),
      ze
    ),
    t.createElement(
      "div",
      null,
      t.createElement("div", { style: ft }, Pe),
      Me
    )
  );
  return t.createElement(
    "div",
    { style: { paddingBottom: 8 } },
    // ── Section: 基础设置 ──
    t.createElement(
      "div",
      { style: tt },
      "基础设置"
    ),
    Re(
      "Shell 命令超时 (秒)",
      t.createElement(i, {
        min: 1,
        value: P,
        onChange: (le) => $(le ?? 60),
        style: { width: "100%" }
      }),
      "Shell 可执行文件",
      t.createElement(s, {
        value: F,
        onChange: (le) => W(le.target.value),
        placeholder: "留空使用系统默认",
        style: { width: "100%" }
      })
    ),
    Re(
      "语言",
      t.createElement(d, {
        value: A,
        onChange: (le) => H(le),
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
        onChange: (le) => j(le),
        style: { width: "100%" },
        showSearch: !0,
        filterOption: (le, ze) => {
          var Pe;
          return (((Pe = ze == null ? void 0 : ze.label) == null ? void 0 : Pe.toString()) || "").toLowerCase().includes(le.toLowerCase());
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
        ].map((le) => ({ value: le, label: le }))
      })
    ),
    Re(
      "自动生成会话标题",
      t.createElement(m, null, t.createElement(u, {
        checked: N,
        onChange: (le) => x(le)
      })),
      "标题生成超时 (秒)",
      t.createElement(i, {
        min: 5,
        value: S,
        onChange: (le) => _(le ?? 30),
        style: { width: "100%" },
        disabled: !N
      })
    ),
    // ── Section: 审批级别 ──
    t.createElement(f, { style: { margin: "8px 0 16px" } }),
    t.createElement("div", { style: tt }, "审批级别"),
    _e(
      "工具执行审批",
      t.createElement(d, {
        value: Be,
        onChange: (le) => qe(le),
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
    t.createElement(f, { style: { margin: "8px 0 16px" } }),
    t.createElement("div", { style: tt }, "迭代与循环"),
    _e(
      "启用迭代限制",
      t.createElement(u, {
        checked: O,
        onChange: (le) => k(le)
      }),
      "停止 Agent 前的最大循环轮次"
    ),
    O ? _e(
      "最大迭代次数",
      t.createElement(i, {
        min: 1,
        max: 500,
        value: se,
        onChange: (le) => oe(le ?? 100),
        style: { width: "100%" }
      })
    ) : null,
    _e(
      "启用重复循环保护",
      t.createElement(u, {
        checked: B,
        onChange: (le) => L(le)
      }),
      "检测并阻止重复操作循环"
    ),
    B ? Re(
      "检测窗口大小",
      t.createElement(i, {
        min: 2,
        max: 20,
        value: ae,
        onChange: (le) => ne(le ?? 3),
        style: { width: "100%" }
      }),
      "相似度阈值",
      t.createElement(i, {
        min: 0,
        max: 1,
        step: 0.05,
        value: J,
        onChange: (le) => pe(le ?? 1),
        style: { width: "100%" }
      })
    ) : null,
    // ── Section: LLM 重试 ──
    t.createElement(f, { style: { margin: "8px 0 16px" } }),
    t.createElement("div", { style: tt }, "LLM 重试"),
    _e(
      "启用 LLM 重试",
      t.createElement(u, {
        checked: M,
        onChange: (le) => ie(le)
      })
    ),
    Re(
      "最大重试次数",
      t.createElement(i, {
        min: 1,
        value: me,
        onChange: (le) => Q(le ?? 3),
        style: { width: "100%" },
        disabled: !M
      }),
      "退避基数 (秒)",
      t.createElement(i, {
        min: 0.1,
        step: 0.1,
        value: Z,
        onChange: (le) => ce(le ?? 2),
        style: { width: "100%" },
        disabled: !M
      })
    ),
    _e(
      "退避上限 (秒)",
      t.createElement(i, {
        min: 0.5,
        step: 0.5,
        value: Ee,
        onChange: (le) => Se(le ?? 60),
        style: { width: 200 },
        disabled: !M
      })
    ),
    // ── Section: LLM 限流 ──
    t.createElement(f, { style: { margin: "8px 0 16px" } }),
    t.createElement("div", { style: tt }, "LLM 限流"),
    Re(
      "最大并发数",
      t.createElement(i, {
        min: 1,
        value: $e,
        onChange: (le) => xe(le ?? 1),
        style: { width: "100%" }
      }),
      "最大 QPM (0=不限)",
      t.createElement(i, {
        min: 0,
        step: 10,
        value: ee,
        onChange: (le) => we(le ?? 0),
        style: { width: "100%" }
      })
    ),
    Re(
      "限流暂停时间 (秒)",
      t.createElement(i, {
        min: 1,
        step: 0.5,
        value: be,
        onChange: (le) => te(le ?? 1),
        style: { width: "100%" }
      }),
      "限流抖动 (秒)",
      t.createElement(i, {
        min: 0,
        step: 0.5,
        value: ue,
        onChange: (le) => ge(le ?? 0),
        style: { width: "100%" }
      })
    ),
    _e(
      "获取超时 (秒)",
      t.createElement(i, {
        min: 10,
        step: 10,
        value: K,
        onChange: (le) => C(le ?? 30),
        style: { width: 200 }
      }),
      "应大于 限流暂停 + 抖动"
    ),
    // ── Section: 上下文与记忆 ──
    t.createElement(f, { style: { margin: "8px 0 16px" } }),
    t.createElement("div", { style: tt }, "上下文与记忆"),
    Re(
      "上下文管理后端",
      t.createElement(d, {
        value: T,
        onChange: (le) => re(le),
        style: { width: "100%" },
        options: [{ value: "light", label: "light" }]
      }),
      "上下文策略",
      t.createElement(d, {
        value: fe,
        onChange: (le) => Ae(le),
        style: { width: "100%" },
        options: [
          { value: "scroll", label: "scroll (滚动窗口)" },
          { value: "native", label: "native (原生)" }
        ]
      })
    ),
    Re(
      "记忆管理后端",
      t.createElement(d, {
        value: Le,
        onChange: (le) => We(le),
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
        value: ye,
        onChange: (le) => q(le ?? 50),
        style: { width: "100%" }
      })
    ),
    // ── Save button ──
    t.createElement(
      "div",
      { style: { display: "flex", justifyContent: "flex-end", marginTop: 16 } },
      t.createElement(
        p,
        {
          type: "primary",
          icon: E ? t.createElement(E) : void 0,
          loading: I,
          onClick: Ve,
          style: je
        },
        "保存运行配置"
      )
    )
  );
}
function go({
  expert: e,
  open: t,
  onClose: n,
  onRefresh: r
}) {
  const a = z().React, { useState: l, useEffect: o, useCallback: i } = a, { Modal: s, Tabs: d, Spin: u, Typography: p } = z().antd, { SettingOutlined: c } = z().antdIcons || {}, { Text: m } = p, [h, f] = l([]), [g, E] = l(!1), [v, b] = l("heartbeat"), w = i(async () => {
    if (e) {
      E(!0);
      try {
        const P = await io(e.agent.id);
        f(P);
      } catch {
        f([]);
      } finally {
        E(!1);
      }
    }
  }, [e]);
  if (o(() => {
    t && e && w();
  }, [t, e, w]), !e) return null;
  const { agent: I } = e, R = () => {
    w(), r();
  }, U = [
    {
      key: "heartbeat",
      label: "心跳",
      children: a.createElement(uo, {
        agentId: I.id
      })
    },
    {
      key: "files",
      label: "文件",
      children: g ? a.createElement(
        "div",
        { style: { textAlign: "center", padding: 40 } },
        a.createElement(u, { size: "large" })
      ) : a.createElement(va, {
        agentId: I.id,
        systemPromptFiles: h,
        onRefresh: R
      })
    },
    {
      key: "skills",
      label: `技能 (${e.skills.filter((P) => P.enabled !== !1).length})`,
      children: a.createElement(mo, {
        agentId: I.id,
        onRefresh: r
      })
    },
    {
      key: "mcp",
      label: `MCP (${e.mcps.length})`,
      children: a.createElement(po, {
        agentId: I.id,
        onRefresh: r,
        isActive: v === "mcp"
      })
    },
    {
      key: "running",
      label: "运行配置",
      children: a.createElement(fo, {
        agentId: I.id
      })
    }
  ];
  return a.createElement(
    s,
    {
      open: t,
      title: a.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 8 } },
        c ? a.createElement(c, { style: { fontSize: 18 } }) : null,
        a.createElement("span", null, `配置 - ${I.name}`),
        a.createElement(
          m,
          { type: "secondary", style: { fontSize: 12, fontWeight: 400 } },
          I.id
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
      items: U,
      activeKey: v,
      onChange: (P) => b(P),
      size: "small",
      tabBarStyle: { marginBottom: 16 }
    })
  );
}
const yo = [
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
], ho = yo;
function Tr(e) {
  return sn(`/ugsci/avatar/${encodeURIComponent(e)}`);
}
function _r(e) {
  const t = e.map(encodeURIComponent).join(",");
  return sn(`/ugsci/avatar/team/${t}`);
}
function Ke({
  name: e,
  size: t = 32,
  borderRadius: n = "50%"
}) {
  const r = z().React, [a, l] = r.useState(0), o = a === 0 ? Tr(e) : `${Tr(e)}?_r=${a}`;
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
function Wn({
  members: e,
  size: t = 32,
  borderRadius: n = "50%"
}) {
  const r = z().React, [a, l] = r.useState(0);
  if (!e || e.length === 0)
    return r.createElement("span", {
      style: {
        width: t,
        height: t,
        display: "inline-block"
      }
    });
  const o = e.slice(0, 5), i = a === 0 ? _r(o) : `${_r(o)}?_r=${a}`;
  return r.createElement("img", {
    src: i,
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
async function Ir(e) {
  var n;
  const t = z();
  if (t.refreshAgents)
    try {
      await t.refreshAgents({ force: !0 });
    } catch (r) {
      console.warn("[ugsci] Failed to refresh newly created agent:", r);
      return;
    }
  (n = t.setSelectedAgent) == null || n.call(t, e);
}
function Eo({
  expert: e,
  onClick: t,
  onSummon: n,
  onConfigure: r
}) {
  const a = z().React, { Card: l, Tag: o, Badge: i, Typography: s, Spin: d, Button: u, Tooltip: p } = z().antd, { Text: c } = s, { ThunderboltOutlined: m, SettingOutlined: h } = z().antdIcons || {}, { agent: f, skills: g, mcps: E, loading: v } = e, b = f.enabled, w = g.filter((U) => U.enabled !== !1).map((U) => U.name), I = E.map((U) => U.name || U.key), R = f.active_model ? `${f.active_model.provider_id}/${f.active_model.model}` : null;
  return a.createElement(
    l,
    {
      hoverable: !0,
      onClick: t,
      size: "small",
      style: {
        cursor: "pointer",
        transition: "all 0.2s ease",
        borderColor: b ? void 0 : "var(--ant-color-border, #d9d9d9)",
        opacity: b ? 1 : 0.7,
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
        a.createElement(Ke, { name: f.name, size: 36 }),
        a.createElement(
          "div",
          null,
          a.createElement(
            c,
            { strong: !0, style: { fontSize: 15 } },
            f.name
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
            f.id
          )
        )
      ),
      a.createElement(i, {
        status: b ? "success" : "default",
        text: b ? "启用" : "停用"
      })
    ),
    // Description (rendered as markdown)
    f.description ? a.createElement(
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
      cn(f.description, a)
    ) : a.createElement(
      "div",
      { style: { fontSize: 12, color: "var(--ant-color-text-quaternary, #bfbfbf)", marginBottom: 10, minHeight: 54, flex: "1 0 auto" } },
      "暂无描述"
    ),
    // Model info
    R ? a.createElement(
      "div",
      { style: { marginBottom: 8 } },
      a.createElement(
        o,
        { color: "geekblue", style: { fontSize: 11 } },
        `🤖 ${R}`
      )
    ) : null,
    // Skills
    v ? a.createElement(d, { size: "small" }) : a.createElement(
      "div",
      { style: { marginBottom: 6 } },
      a.createElement(
        "div",
        { style: { fontSize: 11, color: "var(--ant-color-text-tertiary, #8c8c8c)", marginBottom: 4 } },
        `技能 (${w.length})`
      ),
      a.createElement(Cr, {
        items: w,
        max: 4,
        color: "cyan",
        emptyText: "未配置技能"
      })
    ),
    // MCP
    !v && I.length > 0 ? a.createElement(
      "div",
      { style: { marginTop: "auto" } },
      a.createElement(
        "div",
        { style: { fontSize: 11, color: "var(--ant-color-text-tertiary, #8c8c8c)", marginBottom: 4 } },
        `MCP (${I.length})`
      ),
      a.createElement(Cr, {
        items: I,
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
        p,
        { title: "配置专家", placement: "top" },
        a.createElement(
          u,
          {
            type: "text",
            size: "small",
            icon: h ? a.createElement(h, {
              style: { fontSize: 16, color: "var(--ant-color-text-tertiary, #8c8c8c)" }
            }) : void 0,
            onClick: (U) => {
              U.stopPropagation(), r && r();
            }
          }
        )
      ),
      // Summon button (bottom-right)
      a.createElement(
        u,
        {
          type: "primary",
          size: "small",
          icon: m ? a.createElement(m) : void 0,
          disabled: !b,
          onClick: (U) => {
            U.stopPropagation(), n && n();
          },
          style: je
        },
        "召唤专家"
      )
    )
  );
}
function bo({
  expert: e,
  open: t,
  onClose: n,
  onRefresh: r
}) {
  const a = z().React, {
    Drawer: l,
    Descriptions: o,
    Tag: i,
    Typography: s,
    Space: d,
    Button: u,
    Empty: p,
    Tabs: c,
    List: m,
    Spin: h,
    Modal: f,
    message: g
  } = z().antd, { Text: E, Paragraph: v } = s, {
    EditOutlined: b,
    ThunderboltOutlined: w,
    FileTextOutlined: I,
    ToolOutlined: R,
    PlusOutlined: U
  } = z().antdIcons || {}, [P, $] = a.useState(!1), [F, W] = a.useState(
    []
  ), [N, x] = a.useState(!1);
  if (!e) return null;
  const { agent: S, config: _, skills: A, mcps: H, loading: D } = e, j = A.filter((M) => M.enabled !== !1), O = (M) => {
    window.history.pushState({}, "", M), window.dispatchEvent(new PopStateEvent("popstate"));
  }, k = a.createElement(
    "div",
    null,
    a.createElement(
      o,
      { column: 1, bordered: !0, size: "small" },
      a.createElement(o.Item, { label: "专家名称" }, S.name),
      a.createElement(
        o.Item,
        { label: "专家 ID" },
        a.createElement("code", { style: { fontSize: 12 } }, S.id)
      ),
      a.createElement(
        o.Item,
        { label: "状态" },
        a.createElement(
          i,
          { color: S.enabled ? "green" : "default" },
          S.enabled ? "启用" : "停用"
        )
      ),
      a.createElement(
        o.Item,
        { label: "功能简介" },
        S.description ? cn(S.description, a) : "暂无描述"
      ),
      a.createElement(
        o.Item,
        { label: "使用模型" },
        S.active_model ? `${S.active_model.provider_id} / ${S.active_model.model}` : "使用全局默认模型"
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
        I ? a.createElement(I, {
          style: { fontSize: 14, color: "#1677ff" }
        }) : null,
        a.createElement(E, { strong: !0 }, "系统提示词文件")
      ),
      a.createElement(
        d,
        { wrap: !0 },
        ..._.system_prompt_files.map(
          (M, ie) => a.createElement(
            i,
            {
              key: ie,
              icon: I ? a.createElement(I) : void 0,
              style: { fontSize: 12 }
            },
            M
          )
        )
      )
    ) : null
  ), se = async () => {
    $(!0), x(!0);
    try {
      const M = await pn(!0);
      W(M);
    } catch (M) {
      g.error(M.message || "加载技能池失败");
    } finally {
      x(!1);
    }
  }, oe = async (M) => {
    let ie = 0, me = 0;
    for (const Q of M)
      try {
        await Fn(S.id, Q), ie++;
      } catch {
        me++;
      }
    ie > 0 ? (g.success(
      `成功添加 ${ie} 个技能${me > 0 ? `，${me} 个失败` : ""}`
    ), r()) : me > 0 && g.error("添加技能失败"), $(!1);
  }, B = async (M) => {
    try {
      await Dn(S.id, M), g.success(`技能「${M}」已移除`), r();
    } catch (ie) {
      g.error(ie.message || "移除技能失败");
    }
  }, L = async (M) => {
    try {
      await ha(S.id, M), g.success(`MCP「${M}」已移除`), r();
    } catch (ie) {
      g.error(ie.message || "移除 MCP 失败");
    }
  }, ae = D ? a.createElement(
    "div",
    { style: { textAlign: "center", padding: 40 } },
    a.createElement(h, { size: "large" })
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
        E,
        { strong: !0 },
        `已启用技能 (${j.length})`
      ),
      a.createElement(
        u,
        {
          type: "primary",
          size: "small",
          icon: U ? a.createElement(U) : void 0,
          onClick: se
        },
        "从技能池添加"
      )
    ),
    j.length === 0 ? a.createElement(p, {
      description: "该专家暂无已启用的技能",
      image: p.PRESENTED_IMAGE_SIMPLE
    }) : a.createElement(m, {
      dataSource: j,
      renderItem: (M) => a.createElement(
        m.Item,
        {
          actions: [
            a.createElement(
              u,
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
            a.createElement(E, { strong: !0 }, M.name),
            M.version_text ? a.createElement(
              i,
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
              (ie, me) => a.createElement(
                i,
                {
                  key: me,
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
    a.createElement(ba, {
      open: P,
      onClose: () => $(!1),
      poolSkills: F,
      installedSkillNames: j.map((M) => M.name),
      loading: N,
      onInstall: oe
    })
  ), ne = D ? a.createElement(
    "div",
    { style: { textAlign: "center", padding: 40 } },
    a.createElement(h, { size: "large" })
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
        E,
        { strong: !0 },
        `MCP 客户端 (${H.length})`
      ),
      a.createElement(
        u,
        {
          type: "primary",
          size: "small",
          icon: U ? a.createElement(U) : void 0,
          onClick: () => {
            window.history.pushState({}, "", `/agents/${S.id}/mcp`), window.dispatchEvent(new PopStateEvent("popstate"));
          }
        },
        "配置 MCP"
      )
    ),
    H.length === 0 ? a.createElement(p, {
      description: "该专家暂无关联的 MCP 客户端，点击「配置 MCP」添加",
      image: p.PRESENTED_IMAGE_SIMPLE
    }) : a.createElement(m, {
      dataSource: H,
      renderItem: (M) => a.createElement(
        m.Item,
        {
          actions: [
            a.createElement(
              u,
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
              E,
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
  ), J = _ != null && _.tools ? a.createElement(
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
        R ? a.createElement(R, {
          style: { fontSize: 14, color: "#1677ff" }
        }) : null,
        a.createElement(E, { strong: !0 }, "工具配置")
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
  ) : a.createElement(p, {
    description: "暂无工具配置",
    image: p.PRESENTED_IMAGE_SIMPLE
  }), pe = [
    { key: "basic", label: "基本信息", children: k },
    {
      key: "skills",
      label: `技能 (${j.length})`,
      children: ae
    },
    {
      key: "prompts",
      label: "推荐提问",
      children: a.createElement(co, {
        skills: j,
        agentId: S.id
      })
    },
    {
      key: "knowledge",
      label: "专家记忆",
      children: a.createElement(va, {
        agentId: S.id,
        systemPromptFiles: (_ == null ? void 0 : _.system_prompt_files) || [],
        onRefresh: () => r()
      })
    },
    { key: "mcp", label: `MCP (${H.length})`, children: ne },
    { key: "tools", label: "工具配置", children: J }
  ];
  return a.createElement(
    l,
    {
      title: a.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 8 } },
        a.createElement(Ke, { name: S.name, size: 28 }),
        a.createElement("span", null, S.name)
      ),
      open: t,
      onClose: n,
      width: 560,
      extra: a.createElement(
        d,
        null,
        a.createElement(
          u,
          {
            size: "small",
            icon: b ? a.createElement(b) : void 0,
            onClick: () => {
              n();
              try {
                const M = z();
                M.setSelectedAgent && M.setSelectedAgent(S.id);
              } catch (M) {
                console.warn("[ugsci] Failed to set selected agent:", M);
              }
              setTimeout(() => O("/agents"), 0);
            }
          },
          "编辑专家"
        ),
        a.createElement(
          u,
          {
            type: "primary",
            size: "small",
            icon: w ? a.createElement(w) : void 0,
            onClick: () => {
              n();
              try {
                const M = z();
                M.setSelectedAgent && M.setSelectedAgent(S.id);
              } catch (M) {
                console.warn("[ugsci] Failed to set selected agent:", M);
              }
              setTimeout(() => O("/chat"), 0);
            }
          },
          "开始对话"
        )
      )
    },
    a.createElement(c, {
      items: pe,
      defaultActiveKey: "basic"
    })
  );
}
function vo({
  open: e,
  onClose: t,
  onCreated: n
}) {
  const r = z().React, { useState: a } = r, {
    Modal: l,
    Card: o,
    Tag: i,
    Input: s,
    Row: d,
    Col: u,
    Spin: p,
    message: c,
    Typography: m
  } = z().antd, { Text: h } = m, { FileAddOutlined: f } = z().antdIcons || {}, [g, E] = a(!1), [v, b] = a(""), [w, I] = a(!1), R = async ($) => {
    E(!0);
    try {
      const F = await de("/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: $.id || void 0,
          name: $.name,
          description: $.description,
          skill_names: $.skillNames
        })
      }), W = $.systemPrompt.trim() || `# ${$.name}

你是${$.name}。${$.description ? `

职责：${$.description}` : ""}
`, x = (await Promise.allSettled([
        en(F.id, "AGENTS.md", W),
        ...$.mcpClients.map(
          ({ clientKey: S, client: _ }) => Hn(F.id, {
            client_key: S,
            client: _
          })
        )
      ])).filter(
        (S) => S.status === "rejected"
      ).length;
      x > 0 ? c.warning(
        `专家「${$.name}」已创建，${x} 项初始配置失败，可在专家配置中重试`
      ) : c.success(`专家「${$.name}」创建成功`), await Ir(F.id), I(!1), setTimeout(() => {
        t(), n();
      }, 0);
    } catch (F) {
      c.error(F.message || "创建专家失败");
    } finally {
      E(!1);
    }
  }, U = ho.filter(($) => {
    if (!v.trim()) return !0;
    const F = v.toLowerCase();
    return $.name.toLowerCase().includes(F) || $.description.toLowerCase().includes(F) || $.category.toLowerCase().includes(F);
  }), P = async ($) => {
    E(!0);
    try {
      const F = await de("/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: $.name,
          description: $.description,
          skill_names: $.recommended_skills
        })
      });
      await en(F.id, "AGENTS.md", $.system_prompt);
      const W = await Nn(F.id);
      W.approval_level = $.approval_level, await de(`/agents/${encodeURIComponent(F.id)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(W)
      }), await Ir(F.id), c.success(`专家「${$.name}」创建成功`), t(), n();
    } catch (F) {
      c.error(F.message || "创建专家失败");
    } finally {
      E(!1);
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
        r.createElement(s, {
          placeholder: "搜索模板名称或类别...",
          value: v,
          onChange: ($) => b($.target.value),
          allowClear: !0
        })
      ),
      g ? r.createElement(
        "div",
        { style: { textAlign: "center", padding: 60 } },
        r.createElement(p, { size: "large" }),
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
          u,
          { xs: 24, sm: 12 },
          r.createElement(
            o,
            {
              hoverable: !0,
              size: "small",
              onClick: () => I(!0),
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
                f ? r.createElement(f) : "📝"
              ),
              r.createElement(
                "div",
                { style: { flex: 1 } },
                r.createElement(
                  h,
                  { strong: !0, style: { fontSize: 15 } },
                  "从空白模版开始创建"
                ),
                r.createElement(
                  "div",
                  null,
                  r.createElement(
                    i,
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
        ...U.map(
          ($) => r.createElement(
            u,
            { key: $.id, xs: 24, sm: 12 },
            r.createElement(
              o,
              {
                hoverable: !0,
                size: "small",
                onClick: () => P($),
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
                r.createElement(Ke, {
                  name: $.name,
                  size: 40
                }),
                r.createElement(
                  "div",
                  { style: { flex: 1 } },
                  r.createElement(
                    h,
                    { strong: !0, style: { fontSize: 15 } },
                    $.name
                  ),
                  r.createElement(
                    "div",
                    null,
                    r.createElement(
                      i,
                      { color: "blue", style: { fontSize: 10 } },
                      $.category
                    ),
                    $.approval_level === "MANUAL" ? r.createElement(
                      i,
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
                cn($.description, r)
              )
            )
          )
        )
      )
    ),
    // ── Blank template creation modal (sibling, not nested inside Modal) ──
    r.createElement(So, {
      open: w,
      onCancel: () => I(!1),
      onCreate: R
    })
  );
}
function St(e) {
  return typeof e == "object" && e !== null && !Array.isArray(e);
}
function wo(e) {
  const t = e.trim();
  if (!t) return [];
  const n = JSON.parse(t);
  if (!St(n))
    throw new Error("MCP 配置必须是 JSON 对象");
  const r = n.mcpServers ?? n;
  if (!St(r))
    throw new Error("mcpServers 必须是 JSON 对象");
  return Object.entries(r).map(([a, l]) => {
    const o = a.trim();
    if (!o || !St(l))
      throw new Error(`MCP「${a || "未命名"}」配置无效`);
    const i = typeof l.url == "string" ? l.url : "", s = typeof l.command == "string" ? l.command : "";
    if (!i && !s)
      throw new Error(`MCP「${o}」需要配置 url 或 command`);
    const u = (typeof l.transport == "string" ? l.transport : typeof l.type == "string" ? l.type : "") === "sse" ? "sse" : i ? "streamable_http" : "stdio";
    return {
      clientKey: o,
      client: {
        name: typeof l.name == "string" ? l.name : o,
        description: typeof l.description == "string" ? l.description : "",
        enabled: typeof l.enabled == "boolean" ? l.enabled : !0,
        transport: u,
        url: i,
        command: s,
        args: Array.isArray(l.args) ? l.args : [],
        env: St(l.env) ? l.env : {},
        cwd: typeof l.cwd == "string" ? l.cwd : "",
        headers: St(l.headers) ? l.headers : {}
      }
    };
  });
}
function So({
  open: e,
  onCancel: t,
  onCreate: n
}) {
  const r = z().React, { useState: a, useEffect: l, useMemo: o } = r, {
    Modal: i,
    Input: s,
    Select: d,
    Button: u,
    Row: p,
    Col: c,
    Spin: m,
    Tag: h,
    Typography: f,
    message: g
  } = z().antd, { CheckCircleOutlined: E } = z().antdIcons || {}, { Text: v } = f, [b, w] = a(""), [I, R] = a(""), [U, P] = a(""), [$, F] = a(""), [W, N] = a([]), [x, S] = a([]), [_, A] = a(!1), [H, D] = a(""), [j, O] = a(!1);
  l(() => {
    e && (w(""), R(""), P(""), F(""), S([]), D(""), O(!1), A(!0), pn(!0).then(N).catch((ne) => {
      N([]), g.error(ne.message || "加载技能池失败");
    }).finally(() => A(!1)));
  }, [e]);
  const k = I.trim(), se = o(() => k ? k.length < 2 || k.length > 64 ? "ID 长度需为 2-64 个字符" : /^[a-zA-Z0-9][a-zA-Z0-9_-]*[a-zA-Z0-9]$/.test(k) ? k === "default" ? "default 是系统保留 ID" : "" : "仅允许字母、数字、连字符和下划线，且不能以符号开头或结尾" : "", [k]), oe = o(() => {
    try {
      return { clients: wo(H), error: "" };
    } catch (ne) {
      return { clients: [], error: ne.message || "MCP 配置无效" };
    }
  }, [H]), B = () => {
    const ne = b.trim();
    if (!ne) {
      g.warning("请输入专家名称");
      return;
    }
    if (se) {
      g.warning(se);
      return;
    }
    if (oe.error) {
      g.warning(oe.error);
      return;
    }
    O(!0), Promise.resolve(
      n({
        id: k,
        name: ne,
        description: U.trim(),
        systemPrompt: $,
        skillNames: x,
        mcpClients: oe.clients
      })
    ).finally(() => O(!1));
  }, L = () => {
    S(
      W.filter((ne) => ne.source === "builtin").map((ne) => ne.name)
    );
  }, ae = (ne, J) => r.createElement(
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
    r.createElement(v, { strong: !0, style: { fontSize: 15 } }, ne),
    J ? r.createElement(v, { type: "secondary", style: { fontSize: 12 } }, J) : null
  );
  return r.createElement(
    i,
    {
      open: e,
      title: "创建专家",
      onCancel: t,
      onOk: B,
      okText: "创建专家",
      cancelText: "取消",
      okButtonProps: { loading: j },
      maskClosable: !0,
      keyboard: !0,
      width: 880,
      styles: { body: { maxHeight: "72vh", overflowY: "auto", paddingTop: 8 } }
    },
    r.createElement(
      "div",
      { style: { paddingBottom: 20 } },
      ae("基本信息", "ID 留空时自动生成"),
      r.createElement(
        p,
        { gutter: [16, 12] },
        r.createElement(
          c,
          { xs: 24, md: 12 },
          r.createElement(
            "label",
            { style: { display: "block", fontSize: 13, marginBottom: 6 } },
            "专家名称",
            r.createElement("span", { style: { color: "#ff4d4f", marginLeft: 4 } }, "*")
          ),
          r.createElement(s, {
            placeholder: "例如：合同审查专家",
            value: b,
            onChange: (ne) => w(ne.target.value),
            maxLength: 50
          })
        ),
        r.createElement(
          c,
          { xs: 24, md: 12 },
          r.createElement(
            "label",
            { style: { display: "block", fontSize: 13, marginBottom: 6 } },
            "智能体 ID（可选）"
          ),
          r.createElement(s, {
            placeholder: "例如：contract-reviewer",
            value: I,
            onChange: (ne) => R(ne.target.value),
            maxLength: 64,
            status: se ? "error" : void 0
          }),
          se ? r.createElement("div", { style: { color: "#ff4d4f", fontSize: 12, marginTop: 4 } }, se) : null
        ),
        r.createElement(
          c,
          { span: 24 },
          r.createElement(
            "label",
            { style: { display: "block", fontSize: 13, marginBottom: 6 } },
            "专家描述（可选）"
          ),
          r.createElement(s.TextArea, {
            placeholder: "简要描述该专家的职责和能力",
            value: U,
            onChange: (ne) => P(ne.target.value),
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
      ae("角色指令", "保存为 AGENTS.md"),
      r.createElement(s.TextArea, {
        placeholder: "定义专家的角色、目标、工作方式和输出要求；留空时将根据名称与描述生成基础指令",
        value: $,
        onChange: (ne) => F(ne.target.value),
        rows: 6,
        style: { fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", fontSize: 12 }
      })
    ),
    r.createElement(
      "div",
      { style: { borderTop: "1px solid #f0f0f0", paddingTop: 20 } },
      ae("初始能力"),
      r.createElement(
        p,
        { gutter: [20, 16], align: "top" },
        r.createElement(
          c,
          { xs: 24, md: 12 },
          r.createElement(
            "div",
            { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 } },
            r.createElement(v, { strong: !0 }, "初始技能"),
            r.createElement(
              "div",
              { style: { display: "flex", gap: 4 } },
              r.createElement(u, { size: "small", onClick: L, disabled: _ }, "内置"),
              r.createElement(u, { size: "small", onClick: () => S([]), disabled: x.length === 0 }, "清空")
            )
          ),
          _ ? r.createElement("div", { style: { textAlign: "center", padding: 32 } }, r.createElement(m, { size: "small" })) : r.createElement(d, {
            mode: "multiple",
            value: x,
            onChange: S,
            placeholder: "搜索并选择技能",
            showSearch: !0,
            allowClear: !0,
            optionFilterProp: "label",
            maxTagCount: "responsive",
            style: { width: "100%" },
            options: W.map((ne) => ({
              value: ne.name,
              label: ne.name
            })),
            notFoundContent: "暂无可用技能"
          }),
          r.createElement(
            "div",
            { style: { marginTop: 8, minHeight: 22 } },
            x.length > 0 ? r.createElement(h, { color: "blue" }, `已选择 ${x.length} 个技能`) : r.createElement(v, { type: "secondary", style: { fontSize: 12 } }, "暂不添加技能")
          )
        ),
        r.createElement(
          c,
          { xs: 24, md: 12 },
          r.createElement(v, { strong: !0, style: { display: "block", marginBottom: 8 } }, "初始 MCP"),
          r.createElement(s.TextArea, {
            placeholder: `{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem"]
    }
  }
}`,
            value: H,
            onChange: (ne) => D(ne.target.value),
            rows: 8,
            status: oe.error ? "error" : void 0,
            style: { fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", fontSize: 12 }
          }),
          r.createElement(
            "div",
            { style: { marginTop: 8, minHeight: 22 } },
            oe.error ? r.createElement(v, { type: "danger", style: { fontSize: 12 } }, oe.error) : oe.clients.length > 0 ? r.createElement(
              h,
              {
                color: "green",
                icon: E ? r.createElement(E) : void 0
              },
              `已识别 ${oe.clients.length} 个 MCP`
            ) : r.createElement(v, { type: "secondary", style: { fontSize: 12 } }, "暂不添加 MCP")
          )
        )
      )
    )
  );
}
const ka = "ugsci_custom_teams";
function xo(e) {
  if (!e || typeof e != "object") return !1;
  const t = e;
  return typeof t.id == "string" && typeof t.name == "string" && typeof t.taskTemplate == "string" && typeof t.orchestrationPrompt == "string" && Array.isArray(t.members);
}
function ko() {
  try {
    const e = JSON.parse(
      localStorage.getItem(ka) || "[]"
    );
    return Array.isArray(e) ? e.filter(xo) : [];
  } catch {
    return [];
  }
}
function Co(e) {
  try {
    localStorage.setItem(ka, JSON.stringify(e));
  } catch {
  }
}
function To(e) {
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
function _o(e) {
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
async function An(e = !0) {
  const t = await Qe("/ugsci/team/custom");
  if (!t.ok) {
    const a = await t.text().catch(() => "");
    throw new Error(a || `HTTP ${t.status}`);
  }
  const r = (await t.json()).map(_o);
  return e && Co(r), r;
}
async function Ca(e) {
  const t = await Qe("/ugsci/team/custom", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(To(e))
  });
  if (!t.ok) {
    const r = await t.text().catch(() => "");
    throw new Error(r || `HTTP ${t.status}`);
  }
  const n = await t.json();
  return { ...e, id: n.team_id };
}
async function Io(e) {
  const t = await Qe(
    `/ugsci/team/custom/${encodeURIComponent(e)}`,
    { method: "DELETE" }
  );
  if (!t.ok && t.status !== 404) {
    const n = await t.text().catch(() => "");
    throw new Error(n || `HTTP ${t.status}`);
  }
}
async function Ao() {
  const e = ko();
  if (e.length === 0) return;
  const t = await An(!1), n = new Set(t.map((r) => r.id));
  await Promise.all(
    e.filter((r) => !n.has(r.id)).map((r) => Ca(r))
  );
}
async function zo(e) {
  var a, l;
  const t = (a = e.body) == null ? void 0 : a.getReader();
  if (!t) return;
  const n = new TextDecoder();
  let r = "";
  try {
    for (; ; ) {
      const { done: o, value: i } = await t.read();
      if (o) break;
      r += n.decode(i, { stream: !0 });
      let s;
      for (; (s = r.indexOf(`

`)) >= 0; ) {
        const d = r.slice(0, s);
        r = r.slice(s + 2);
        for (const u of d.split(`
`)) {
          if (!u.startsWith("data: ")) continue;
          const p = u.slice(6);
          let c;
          try {
            c = JSON.parse(p);
          } catch {
            continue;
          }
          if (c.error) {
            const m = c.error, h = typeof m == "string" ? m : (m == null ? void 0 : m.message) || "工作流启动失败";
            throw new Error(h);
          }
          if (c.object === "response" || c.type === "response") {
            const m = c.status;
            if (m === "failed" || m === "error") {
              const h = ((l = c.error) == null ? void 0 : l.message) || "工作流启动失败";
              throw new Error(h);
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
async function $o(e, t, n) {
  const r = `console:default:team-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, a = await Qe("/chats", {
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
    const s = await a.text().catch(() => "");
    throw new Error(
      s || `创建会话失败 (HTTP ${a.status})`
    );
  }
  const o = (await a.json()).id, i = await Qe("/console/chat", {
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
  if (!i.ok) {
    const s = await i.text().catch(() => "");
    throw new Error(s || `HTTP ${i.status}`);
  }
  return await zo(i), o;
}
function Ta(e, t) {
  var a;
  const n = t.replace(/\s+/g, ""), r = e.find(
    (l) => l.name === t || l.name.replace(/\s+/g, "") === n
  );
  return r ? r.id : ((a = e.find(
    (l) => l.name.includes(t) || t.includes(l.name) || l.name.replace(/\s+/g, "").includes(n)
  )) == null ? void 0 : a.id) || null;
}
function _a() {
  var t;
  const e = (t = window.QwenPaw) == null ? void 0 : t.host;
  if (!e) throw new Error("[ugsci] QwenPaw.host not available");
  return e;
}
async function Ia(e, t) {
  const n = await e.text().catch(() => "");
  if (!n) return t;
  try {
    const r = JSON.parse(n);
    if (typeof r.detail == "string") return r.detail;
  } catch {
  }
  return n;
}
async function Vn(e, t, n) {
  const r = await Qe(e, {
    headers: t ? { "X-Agent-Id": t } : void 0,
    signal: n
  });
  if (!r.ok)
    throw new Error(
      await Ia(r, `HTTP ${r.status}`)
    );
  return await r.json();
}
function Po(e, t) {
  return Vn("/ugsci/team/state", e, t);
}
async function Oo(e, t) {
  const n = await Qe("/ugsci/team/runs", {
    headers: { "X-Agent-Id": e },
    signal: t
  });
  if (!n.ok)
    throw new Error(
      await Ia(
        n,
        `Failed to load team runs: ${n.status}`
      )
    );
  return await n.json();
}
const Mo = 5e3;
function Ar({
  activeOnly: e = !1,
  enabled: t = !0
}) {
  const n = _a(), r = n.React, { useCallback: a, useEffect: l, useRef: o, useState: i } = r, { Alert: s, Button: d, Card: u, Empty: p, Spin: c, Tag: m, Typography: h } = n.antd, { Text: f, Paragraph: g } = h, E = n.useSelectedAgent ? n.useSelectedAgent() : { id: "default" }, v = (E == null ? void 0 : E.id) || "default", [b, w] = i([]), [I, R] = i(!0), [U, P] = i(null), [$, F] = i(!1), W = o(null), N = o(0), x = o(!1), S = o(v), _ = a(
    async (D = !0, j = !0) => {
      var se;
      if (!t || !j && x.current) return;
      (se = W.current) == null || se.abort();
      const O = new AbortController();
      W.current = O;
      const k = ++N.current;
      x.current = !0, D && R(!0);
      try {
        const oe = await Oo(v, O.signal);
        if (O.signal.aborted || k !== N.current)
          return;
        w(oe), F(!0), P(null);
      } catch (oe) {
        if (O.signal.aborted || k !== N.current)
          return;
        P(
          oe instanceof Error ? oe.message : "讨论运行记录加载失败"
        );
      } finally {
        !O.signal.aborted && k === N.current && (W.current = null, x.current = !1, R(!1));
      }
    },
    [v, t]
  );
  if (l(() => {
    var j;
    if (!t) {
      (j = W.current) == null || j.abort(), W.current = null, x.current = !1, N.current += 1;
      return;
    }
    S.current !== v && (S.current = v, w([]), P(null), F(!1)), _(!0, !0);
    const D = e ? window.setInterval(() => {
      _(!1, !1);
    }, Mo) : null;
    return () => {
      var O;
      D !== null && window.clearInterval(D), (O = W.current) == null || O.abort(), W.current = null, x.current = !1, N.current += 1;
    };
  }, [e, v, t, _]), I && !$) return r.createElement(c);
  if (U && !$)
    return r.createElement(s, {
      type: "warning",
      message: "讨论运行记录加载失败",
      description: U,
      action: r.createElement(
        d,
        { size: "small", onClick: () => void _(!0, !0), loading: I },
        "重试"
      )
    });
  const A = b.filter(
    (D) => e ? D.status === "active" : D.status !== "active"
  ), H = (D) => U ? r.createElement(
    r.Fragment,
    null,
    r.createElement(s, {
      type: "warning",
      message: "讨论运行记录更新失败，当前显示上次成功读取的结果",
      description: U,
      action: r.createElement(
        d,
        {
          size: "small",
          onClick: () => void _(!0, !0),
          loading: I
        },
        "重试"
      )
    }),
    D
  ) : D;
  return A.length === 0 ? H(
    r.createElement(
      p,
      {
        description: e ? "暂无进行中的专家团讨论" : "暂无历史讨论"
      },
      r.createElement(
        d,
        { size: "small", onClick: () => void _(!0, !0), loading: I },
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
          d,
          { size: "small", onClick: () => void _(!0, !0), loading: I },
          "刷新"
        )
      ),
      r.createElement(
        "div",
        { style: { display: "flex", flexDirection: "column", gap: 8 } },
        ...A.map(
          (D) => r.createElement(
            u,
            { key: D.instance_id, size: "small" },
            r.createElement(
              "div",
              { style: { display: "flex", alignItems: "center", gap: 8 } },
              r.createElement(
                f,
                { strong: !0 },
                D.team_name || D.team_id
              ),
              r.createElement(
                m,
                {
                  color: D.status === "completed" ? "green" : D.status === "terminated" ? "orange" : "blue"
                },
                D.status
              ),
              r.createElement(m, null, D.current_phase),
              r.createElement(
                f,
                { type: "secondary" },
                `迭代 ${D.iteration}`
              )
            ),
            r.createElement(
              g,
              { ellipsis: { rows: 2 }, style: { margin: "8px 0 0" } },
              D.task || "暂无任务描述"
            )
          )
        )
      )
    )
  );
}
async function Ro() {
  try {
    return (await Vn(
      "/ugsci/team/preset-teams"
    )).teams;
  } catch {
    return null;
  }
}
async function Lo() {
  try {
    return (await Vn(
      "/ugsci/team/roles"
    )).roles;
  } catch {
    return null;
  }
}
const Bo = {
  plan: { label: "规划", color: "#1677ff", icon: "📋" },
  dispatch: { label: "分派", color: "#13c2c2", icon: "🚀" },
  verify: { label: "验证", color: "#fa8c16", icon: "🔍" },
  synthesize: { label: "综合", color: "#722ed1", icon: "📊" },
  completed: { label: "完成", color: "#52c41a", icon: "✅" }
}, zr = [
  "plan",
  "dispatch",
  "verify",
  "synthesize",
  "completed"
], $r = 5e3, Uo = 3e4;
function jo({ enabled: e = !0 }) {
  const t = _a(), n = t.React, { useState: r, useEffect: a, useCallback: l, useRef: o } = n, { Card: i, Tag: s, Typography: d, Button: u, Steps: p, Empty: c, Alert: m, Spin: h } = t.antd, { ReloadOutlined: f } = t.antdIcons || {}, { Text: g, Paragraph: E } = d, v = t.useSelectedAgent ? t.useSelectedAgent() : { id: "default" }, b = (v == null ? void 0 : v.id) || "default", [w, I] = r(null), [R, U] = r(!1), [P, $] = r(null), F = o(null), W = o(0), N = o(0), x = o(0), S = o(null), _ = o(!1), A = l(
    async (J, pe = !0) => {
      var me;
      if (!e || !pe && _.current) return;
      (me = S.current) == null || me.abort();
      const M = new AbortController();
      S.current = M;
      const ie = ++x.current;
      _.current = !0, J && U(!0);
      try {
        const Q = await Po(b, M.signal);
        if (M.signal.aborted || ie !== x.current)
          return;
        W.current = 0, N.current = 0, F.current = Q, I(Q), $(null);
      } catch (Q) {
        if (M.signal.aborted || ie !== x.current)
          return;
        W.current += 1;
        const Z = Math.min(
          Uo,
          $r * 2 ** (W.current - 1)
        );
        N.current = Date.now() + Z, $(
          Q instanceof Error ? Q.message : "专家团状态加载失败"
        );
      } finally {
        !M.signal.aborted && ie === x.current && (S.current = null, _.current = !1, U(!1));
      }
    },
    [b, e]
  ), H = l(() => (W.current = 0, N.current = 0, A(!0)), [A]);
  if (a(() => {
    var pe;
    if ((pe = S.current) == null || pe.abort(), S.current = null, _.current = !1, x.current += 1, W.current = 0, N.current = 0, F.current = null, I(null), $(null), !e) return;
    H();
    const J = window.setInterval(() => {
      var M, ie;
      Date.now() < N.current || ((M = F.current) == null ? void 0 : M.status) === "completed" || ((ie = F.current) == null ? void 0 : ie.status) === "terminated" || A(!1, !1);
    }, $r);
    return () => {
      var M;
      window.clearInterval(J), (M = S.current) == null || M.abort(), S.current = null, _.current = !1, x.current += 1;
    };
  }, [b, e, A, H]), R && !w && !P)
    return n.createElement(h);
  if (P && !w)
    return n.createElement(m, {
      type: "warning",
      showIcon: !0,
      message: "专家团状态加载失败",
      description: P,
      style: { marginBottom: 16 },
      action: n.createElement(
        u,
        { size: "small", onClick: H, loading: R },
        "重试"
      )
    });
  const D = (J) => P ? n.createElement(
    n.Fragment,
    null,
    n.createElement(m, {
      type: "warning",
      showIcon: !0,
      message: "状态更新失败，当前显示上次成功读取的结果",
      description: P,
      style: { marginBottom: 16 },
      action: n.createElement(
        u,
        { size: "small", onClick: H, loading: R },
        "重试"
      )
    }),
    J
  ) : J;
  if ((w == null ? void 0 : w.status) === "unreadable")
    return D(
      n.createElement(m, {
        type: "warning",
        showIcon: !0,
        message: "专家团状态暂时无法读取",
        description: `实例 ${w.instance_id || "未知"} 的状态文件需要检查。`,
        style: { marginBottom: 16 },
        action: n.createElement(
          u,
          { size: "small", onClick: H, loading: R },
          "重试"
        )
      })
    );
  if (!w || !w.active) {
    if ((w == null ? void 0 : w.status) === "completed" || (w == null ? void 0 : w.status) === "terminated") {
      const J = w.status === "completed";
      return D(
        n.createElement(m, {
          type: J ? "success" : "info",
          showIcon: !0,
          message: J ? "专家团工作流已完成" : "专家团工作流已终止",
          description: J ? `实例 ${w.instance_id || "未知"} 已完成，结果文件保留在工作区。` : `原因：${w.state.termination_reason || "未知"}`,
          style: { marginBottom: 16 }
        })
      );
    }
    return D(
      n.createElement(c, {
        description: "暂无活跃的专家团工作流",
        style: { padding: 24 }
      })
    );
  }
  const j = w.state, O = j.current_phase || "plan", k = zr.indexOf(O), se = j.team_name || "未知团队", oe = j.team_mode || "pipeline", B = j.iteration || 0, L = j.members || [], ae = j.verify_retries || 0, ne = {
    pipeline: "顺序交接",
    coordinator: "主管协作",
    roundtable: "并行汇聚",
    router: "智能路由",
    review_loop: "评审迭代",
    debate: "多方论证"
  };
  return D(
    n.createElement(
      i,
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
            `${se} — 工作流状态`
          ),
          n.createElement(
            s,
            { color: "blue", style: { fontSize: 10 } },
            ne[oe] || oe
          ),
          n.createElement(
            s,
            { style: { fontSize: 10 } },
            `迭代 ${B}`
          ),
          ae > 0 ? n.createElement(
            s,
            { color: "orange", style: { fontSize: 10 } },
            `验证重试 ${ae}`
          ) : null
        ),
        extra: n.createElement(
          u,
          {
            size: "small",
            type: "text",
            icon: f ? n.createElement(f) : void 0,
            onClick: H,
            loading: R
          },
          "刷新"
        )
      },
      n.createElement(p, {
        current: k,
        size: "small",
        items: zr.map((J) => {
          const pe = Bo[J];
          return {
            title: `${pe.icon} ${pe.label}`,
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
          (J, pe) => n.createElement(
            s,
            { key: `${J.name}-${pe}`, style: { fontSize: 11 } },
            `${J.emoji || ""} ${J.name}（${J.role}）`
          )
        )
      ),
      j.task ? n.createElement(
        E,
        {
          style: {
            fontSize: 12,
            marginTop: 8,
            marginBottom: 0,
            color: "var(--ant-color-text-secondary, #666)"
          },
          ellipsis: { rows: 2 }
        },
        `任务: ${j.task}`
      ) : null
    )
  );
}
function No({ team: e }) {
  const t = z().React, { Typography: n, Tag: r } = z().antd, { Text: a } = n, l = {
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
          flexDirection: s ? "row" : "column",
          gap: 8,
          alignItems: s ? "flex-start" : "stretch",
          flexWrap: "wrap"
        }
      },
      ...i.length > 0 ? i.map((u, p) => [
        p > 0 && !s ? t.createElement(
          "div",
          {
            key: `arrow-${p}`,
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
            key: `step-${p}`,
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
          t.createElement(Ke, {
            name: u.agentName,
            size: 24
          }),
          t.createElement(
            "div",
            null,
            t.createElement(
              a,
              { strong: !0, style: { fontSize: 12 } },
              u.agentName
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
              u.instruction
            ),
            t.createElement(
              r,
              {
                ...u.passContext ? { color: "blue" } : {},
                style: { fontSize: 9, marginTop: 2 }
              },
              u.passContext ? "传递上下文" : "独立"
            )
          )
        )
      ]).flat() : e.members.map((u, p) => [
        p > 0 && !s ? t.createElement(
          "div",
          {
            key: `arrow-${p}`,
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
            key: `member-${p}`,
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
          t.createElement(Ke, {
            name: u.name,
            size: 24
          }),
          t.createElement(
            "div",
            null,
            t.createElement(
              a,
              { strong: !0, style: { fontSize: 12 } },
              u.name
            ),
            t.createElement(
              "div",
              { style: { fontSize: 11, color: "var(--ant-color-text-tertiary, #8c8c8c)" } },
              u.role
            )
          )
        )
      ]).flat()
    )
  );
}
function Gt(e) {
  const t = e.replace(/\s+/g, "").toLowerCase();
  return t.includes("测井") ? "log-analyst" : t.includes("地球物理") ? "geophysicist" : t.includes("油藏") ? "reservoir-engineer" : t.includes("钻井") ? "drilling-engineer" : t.includes("采油") || t.includes("生产") ? "production-engineer" : t.includes("pvt") || t.includes("物性") ? "pvt-analyst" : t.includes("审核") || t.includes("verifier") ? "domain-reviewer" : t.includes("master") || t.includes("planner") ? "planner" : "analyst";
}
const Fo = [
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
function Do({
  open: e,
  onClose: t,
  agents: n,
  editingTeam: r,
  onSaved: a
}) {
  const l = z().React, { useState: o, useEffect: i, useCallback: s } = l, {
    Modal: d,
    Input: u,
    Button: p,
    Select: c,
    Tag: m,
    Typography: h,
    Switch: f,
    Empty: g,
    message: E,
    Divider: v,
    Steps: b
  } = z().antd, { PlusOutlined: w, DeleteOutlined: I, SaveOutlined: R, ArrowRightOutlined: U } = z().antdIcons || {}, { Text: P, Paragraph: $ } = h, [F, W] = o(""), [N, x] = o("🤝"), [S, _] = o(""), [A, H] = o("pipeline"), [D, j] = o(""), [O, k] = o(""), [se, oe] = o([]), [B, L] = o([]), [ae, ne] = o(!1), [J, pe] = o(2), [M, ie] = o(""), [me, Q] = o(""), [Z, ce] = o({}), [Ee, Se] = o({}), [$e, xe] = o(
    Fo
  ), ee = [
    { value: "pipeline", icon: "→", title: "顺序交接", description: "上一步产物成为下一位专家的上下文", topology: "A → B → C", accent: "#08979c" },
    { value: "roundtable", icon: "⇉", title: "并行汇聚", description: "独立并行分析，避免观点相互污染", topology: "A ∥ B ∥ C → 汇总", accent: "#531dab" },
    { value: "coordinator", icon: "◎", title: "主管协作", description: "主控专家拆解任务并按需组织成员", topology: "主管 → 专家组", accent: "#0958d9" },
    { value: "router", icon: "◇", title: "智能路由", description: "按任务能力需求选择最小充分专家集合", topology: "任务 → 路由 → 子集", accent: "#d46b08" },
    { value: "review_loop", icon: "↻", title: "评审迭代", description: "产出、独立审查、修订，直到满足标准", topology: "执行 ⇄ 评审", accent: "#389e0d" },
    { value: "debate", icon: "⚖", title: "多方论证", description: "独立立场、交叉质询，再由裁决者综合", topology: "观点 ⇄ 反驳 → 裁决", accent: "#c41d7f" }
  ];
  i(() => {
    e && (r ? (W(r.name), x(r.emoji), _(r.description), H(r.mode), j(r.coordinatorName || ""), k(r.taskTemplate), oe(r.steps || []), L(r.members.map((C) => C.name)), pe(r.maxReviewRounds || 2), ie(r.successCriteria || ""), Q(r.routingInstruction || ""), ce(
      Object.fromEntries(
        r.members.map((C) => [
          C.name,
          C.bindingMode || (C.agentId ? "fixed" : "preferred")
        ])
      )
    ), Se(
      Object.fromEntries(
        r.members.map((C) => [
          C.name,
          C.roleKey || Gt(C.name)
        ])
      )
    )) : (W(""), x("🤝"), _(""), H("pipeline"), j(""), k(`请执行以下任务：
任务描述：{任务描述}`), oe([]), L([]), pe(2), ie(""), Q(""), ce({}), Se({})));
  }, [e, r]), i(() => {
    e && Lo().then((C) => {
      C != null && C.length && xe(C);
    });
  }, [e]);
  const we = s(() => {
    if (A === "roundtable" || A === "debate" || A === "router") {
      const C = B.map((ye) => ({
        agentName: ye,
        instruction: "请给出你的专业评估意见",
        passContext: !1
      }));
      oe(C);
    } else if (A === "pipeline") {
      const C = new Map(se.map((q) => [q.agentName, q])), ye = B.map((q) => C.get(q) || {
        agentName: q,
        instruction: "请完成你的专业部分",
        passContext: !0
      });
      oe(ye);
    }
  }, [A, B, se]), be = (C) => {
    B.includes(C) || (L([...B, C]), ce({ ...Z, [C]: "fixed" }), Se({
      ...Ee,
      [C]: Gt(C)
    }), (A === "coordinator" || A === "debate") && !D && j(C));
  }, te = (C) => {
    const ye = B.filter((re) => re !== C);
    L(ye), oe(se.filter((re) => re.agentName !== C));
    const q = { ...Z };
    delete q[C], ce(q);
    const T = { ...Ee };
    delete T[C], Se(T), D === C && j(ye[0] || "");
  }, ue = (C, ye, q) => {
    const T = [...se];
    T[C] = { ...T[C], [ye]: q }, oe(T);
  }, ge = async () => {
    if (!F.trim()) {
      E.warning("请输入团队名称");
      return;
    }
    if (B.length < 2) {
      E.warning("至少需要选择 2 个成员");
      return;
    }
    if (!O.trim()) {
      E.warning("请输入任务模板");
      return;
    }
    if ((A === "coordinator" || A === "debate") && !D) {
      E.warning(A === "debate" ? "请选择裁决者" : "请选择主控专家");
      return;
    }
    ne(!0);
    try {
      let C = [...B];
      A === "coordinator" && D ? C = [D, ...C.filter((re) => re !== D)] : A === "debate" && D && (C = [...C.filter((re) => re !== D), D]);
      const ye = C.map(
        (re) => {
          var Be;
          const fe = n.find((qe) => qe.name === re), Ae = Z[re] || "fixed", Le = Ee[re] || Gt(re), We = $e.find((qe) => qe.key === Le);
          return {
            name: re,
            role: (We == null ? void 0 : We.display_name) || ((Be = fe == null ? void 0 : fe.description) == null ? void 0 : Be.slice(0, 30)) || "需求分析师",
            emoji: "",
            agentId: Ae === "temporary" || fe == null ? void 0 : fe.id,
            roleKey: Le,
            bindingMode: Ae
          };
        }
      );
      let q = se;
      (se.length === 0 || se.length !== B.length) && (q = B.map((re) => ({
        agentName: re,
        instruction: "请完成你的专业部分",
        passContext: A === "pipeline"
      })));
      const T = {
        id: (r == null ? void 0 : r.id) || `custom-${Date.now()}`,
        name: F.trim(),
        emoji: N,
        category: "自定义",
        description: S.trim() || `${F.trim()}（${B.length}人团队）`,
        mode: A,
        members: ye,
        coordinatorName: A === "coordinator" || A === "debate" ? D : void 0,
        taskTemplate: O.trim(),
        orchestrationPrompt: "",
        // Custom teams use steps-based instructions
        steps: q,
        custom: !0,
        createdAt: (r == null ? void 0 : r.createdAt) || Date.now(),
        updatedAt: r == null ? void 0 : r.updatedAt,
        version: r == null ? void 0 : r.version,
        maxReviewRounds: J,
        successCriteria: M.trim(),
        routingInstruction: me.trim()
      };
      await Ca(T), E.success(r ? "团队已更新" : "团队已创建"), a(), t();
    } catch (C) {
      E.error(C.message || "保存失败");
    } finally {
      ne(!1);
    }
  }, K = n.filter(
    (C) => !B.includes(C.name)
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
      onOk: ge,
      okText: "保存专家团",
      confirmLoading: ae,
      okButtonProps: {
        icon: R ? l.createElement(R) : void 0
      }
    },
    // Step 1: Basic info
    l.createElement(
      "div",
      { style: { marginBottom: 16 } },
      l.createElement(
        P,
        {
          strong: !0,
          style: { display: "block", marginBottom: 8, fontSize: 13 }
        },
        "1. 定义任务工作流"
      ),
      l.createElement(
        "div",
        { style: { display: "flex", gap: 8, marginBottom: 8, alignItems: "center" } },
        B.length > 0 ? l.createElement(Wn, {
          members: B,
          size: 36
        }) : null,
        l.createElement(u, {
          placeholder: "专家团名称（如：储层评价与质量复核专家团）",
          value: F,
          onChange: (C) => W(C.target.value),
          style: { flex: 1 }
        })
      ),
      l.createElement(u.TextArea, {
        placeholder: "说明这个工作流解决什么问题、适用于什么场景",
        value: S,
        onChange: (C) => _(C.target.value),
        rows: 2,
        style: { marginBottom: 8 }
      }),
      l.createElement(
        P,
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
          const ye = A === C.value;
          return l.createElement(
            "button",
            {
              key: C.value,
              type: "button",
              onClick: () => {
                H(C.value), C.value !== "coordinator" && C.value !== "debate" && j("");
              },
              style: {
                textAlign: "left",
                padding: 10,
                borderRadius: 8,
                cursor: "pointer",
                background: ye ? `${C.accent}0d` : "var(--ant-color-bg-container, #fff)",
                border: `1px solid ${ye ? C.accent : "var(--ant-color-border, #d9d9d9)"}`,
                boxShadow: ye ? `0 0 0 2px ${C.accent}1a` : "none"
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
    l.createElement(v, { style: { margin: "12px 0" } }),
    // Step 2: Select members
    l.createElement(
      "div",
      { style: { marginBottom: 16 } },
      l.createElement(
        P,
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
          (C) => l.createElement(
            p,
            {
              key: C.id,
              size: "small",
              icon: w ? l.createElement(w) : void 0,
              onClick: () => be(C.name)
            },
            C.name
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
              l.createElement(Ke, { name: C, size: 24 }),
              l.createElement(
                P,
                { strong: !0, style: { fontSize: 13 } },
                C
              ),
              (A === "coordinator" || A === "debate") && D === C ? l.createElement(
                m,
                { color: "blue", style: { fontSize: 10 } },
                A === "debate" ? "裁决者" : "主控"
              ) : null
            ),
            l.createElement(
              "div",
              { style: { display: "flex", gap: 4 } },
              l.createElement(c, {
                size: "small",
                value: Ee[C] || Gt(C),
                style: { width: 132 },
                onChange: (ye) => Se({ ...Ee, [C]: ye }),
                options: $e.map((ye) => ({
                  value: ye.key,
                  label: ye.display_name
                }))
              }),
              l.createElement(c, {
                size: "small",
                value: Z[C] || "fixed",
                style: { width: 118 },
                onChange: (ye) => ce({ ...Z, [C]: ye }),
                options: [
                  { value: "fixed", label: "固定实例" },
                  { value: "preferred", label: "优先实例" },
                  { value: "temporary", label: "临时派生" }
                ]
              }),
              A === "coordinator" || A === "debate" ? l.createElement(
                p,
                {
                  size: "small",
                  type: "link",
                  onClick: () => j(C)
                },
                A === "debate" ? "设为裁决者" : "设为主控"
              ) : null,
              l.createElement(
                p,
                {
                  size: "small",
                  type: "link",
                  danger: !0,
                  icon: I ? l.createElement(I) : void 0,
                  onClick: () => te(C)
                },
                "移除"
              )
            )
          )
        )
      )
    ),
    A === "review_loop" || A === "router" ? l.createElement(
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
      A === "review_loop" ? l.createElement(
        "div",
        { style: { display: "grid", gridTemplateColumns: "150px 1fr", gap: 10 } },
        l.createElement(c, {
          value: J,
          onChange: (C) => pe(C),
          options: [1, 2, 3, 4, 5].map((C) => ({ value: C, label: `最多 ${C} 轮` }))
        }),
        l.createElement(u, {
          value: M,
          onChange: (C) => ie(C.target.value),
          placeholder: "验收标准，例如：关键结论均有数据依据，且无高风险缺陷"
        })
      ) : l.createElement(u, {
        value: me,
        onChange: (C) => Q(C.target.value),
        placeholder: "路由偏好，例如：仅调用任务必需的专家；涉及模拟时优先油藏工程师"
      })
    ) : null,
    l.createElement(v, { style: { margin: "12px 0" } }),
    // Step 3: Define execution steps (for pipeline/roundtable)
    B.length > 0 ? l.createElement(
      "div",
      { style: { marginBottom: 16 } },
      l.createElement(
        P,
        {
          strong: !0,
          style: { display: "block", marginBottom: 8, fontSize: 13 }
        },
        `3. 配置专家任务${A === "roundtable" ? "（并行独立）" : A === "pipeline" ? "（顺序交接）" : A === "router" ? "（作为候选能力）" : A === "review_loop" ? "（首位执行、末位评审）" : A === "debate" ? "（末位为裁决者）" : "（由主控动态编排）"}`
      ),
      // Auto-sync button
      l.createElement(
        p,
        {
          size: "small",
          type: "dashed",
          onClick: we,
          style: { marginBottom: 8 }
        },
        "自动生成步骤"
      ),
      // Steps list
      se.length === 0 ? l.createElement(
        P,
        { type: "secondary", style: { fontSize: 12 } },
        "点击「自动生成步骤」或手动配置每步的指令"
      ) : l.createElement(
        "div",
        { style: { display: "flex", flexDirection: "column", gap: 6 } },
        ...se.map(
          (C, ye) => l.createElement(
            "div",
            {
              key: ye,
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
              A === "pipeline" ? l.createElement(
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
                `${ye + 1}`
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
                l.createElement(u, {
                  placeholder: "请输入该步骤的指令...",
                  value: C.instruction,
                  onChange: (q) => ue(ye, "instruction", q.target.value),
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
              l.createElement(f, {
                size: "small",
                checked: C.passContext,
                onChange: (q) => ue(ye, "passContext", q)
              }),
              l.createElement(
                P,
                { type: "secondary", style: { fontSize: 11 } },
                C.passContext ? "传递上一步结果作为上下文" : "独立执行"
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
        P,
        {
          strong: !0,
          style: { display: "block", marginBottom: 8, fontSize: 13 }
        },
        `${B.length > 0 ? "4" : "3"}. 任务模板`
      ),
      l.createElement(u.TextArea, {
        placeholder: `输入任务模板，可用 {参数名} 作为占位符...

例如：
请对区块 {区块名} 的井 {井号} 进行储层评价`,
        value: O,
        onChange: (C) => k(C.target.value),
        rows: 4,
        style: { fontFamily: "monospace", fontSize: 13 }
      }),
      l.createElement(
        P,
        {
          type: "secondary",
          style: { fontSize: 11, display: "block", marginTop: 4 }
        },
        "占位符 {参数名} 在发起任务时可由用户填写替换"
      )
    )
  );
}
function Pr({
  team: e,
  agents: t,
  onLaunch: n,
  onEdit: r,
  onDelete: a
}) {
  var x;
  const l = z().React, { useState: o } = l, { Card: i, Tag: s, Typography: d, Button: u, Tooltip: p, Popconfirm: c } = z().antd, {
    TeamOutlined: m,
    RocketOutlined: h,
    UserOutlined: f,
    EditOutlined: g,
    DeleteOutlined: E,
    DownOutlined: v,
    UpOutlined: b
  } = z().antdIcons || {}, { Text: w, Paragraph: I } = d, [R, U] = o(!1), P = {
    coordinator: { label: "主管协作", color: "blue" },
    pipeline: { label: "顺序交接", color: "cyan" },
    roundtable: { label: "并行汇聚", color: "purple" },
    router: { label: "智能路由", color: "orange" },
    review_loop: { label: "评审迭代", color: "green" },
    debate: { label: "多方论证", color: "magenta" }
  }, $ = P[e.mode] || P.coordinator, F = e.members.map((S) => {
    const _ = S.bindingMode === "temporary", A = _ ? null : (S.agentId && t.some((H) => H.id === S.agentId) ? S.agentId : null) || Ta(t, S.name);
    return { ...S, found: !!A, agentId: A, temporary: _ };
  }), W = F.filter((S) => S.found).length, N = e.coordinatorName || ((x = e.members[0]) == null ? void 0 : x.name);
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
      l.createElement(Wn, {
        members: e.members.map((S) => S.name),
        size: 36
      }),
      l.createElement(
        "div",
        { style: { flex: 1 } },
        l.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 6 } },
          l.createElement(
            w,
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
            { color: $.color, style: { fontSize: 10 } },
            $.label
          ),
          l.createElement(
            s,
            { color: "green", style: { fontSize: 10 } },
            `${e.members.length} 位专家`
          ),
          W < e.members.length ? l.createElement(
            p,
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
        r ? l.createElement(
          p,
          { title: "编辑" },
          l.createElement(u, {
            type: "text",
            size: "small",
            icon: g ? l.createElement(g) : void 0,
            onClick: (S) => {
              S.stopPropagation(), r(e);
            }
          })
        ) : null,
        a ? l.createElement(
          p,
          { title: "删除" },
          l.createElement(
            c,
            {
              title: `删除专家团「${e.name}」？`,
              description: "此操作会删除后端定义，但不会删除既有讨论记录。",
              okText: "删除",
              cancelText: "取消",
              okButtonProps: { danger: !0 },
              onConfirm: () => a(e)
            },
            l.createElement(u, {
              type: "text",
              size: "small",
              danger: !0,
              icon: E ? l.createElement(E) : void 0,
              onClick: (S) => S.stopPropagation()
            })
          )
        ) : null
      ) : null
    ),
    // Description
    l.createElement(
      I,
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
        (S) => l.createElement(
          p,
          {
            key: S.name,
            title: `${S.name}（${S.role}）${S.temporary ? " - OMP 临时派生" : S.found ? " - 已绑定实例" : " - OMP 按角色派发"}`
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
                background: S.found ? "#f0f5ff" : "#f0f0ff",
                border: `1px solid ${S.found ? "#d6e4ff" : "#d3adf7"}`,
                fontSize: 11
              }
            },
            l.createElement(Ke, { name: S.name, size: 18 }),
            l.createElement(
              w,
              {
                style: { fontSize: 11, color: S.found ? "#1f4e8c" : "#531dab" }
              },
              S.name
            ),
            S.temporary ? l.createElement(
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
      u,
      {
        type: "link",
        size: "small",
        style: { padding: "0 0 4px 0", fontSize: 11, height: "auto" },
        onClick: (S) => {
          S.stopPropagation(), U(!R);
        },
        icon: R ? b ? l.createElement(b) : "▲" : v ? l.createElement(v) : "▼"
      },
      R ? "收起流程" : "查看执行流程"
    ),
    R ? l.createElement(No, { team: e }) : null,
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
        w,
        { type: "secondary", style: { fontSize: 11 } },
        N ? `${e.mode === "debate" ? "裁决者" : "主控"}: ${N}` : "OMP 动态编排"
      ),
      l.createElement(
        u,
        {
          type: "primary",
          size: "small",
          icon: h ? l.createElement(h) : void 0,
          disabled: t.length === 0,
          onClick: () => n(e),
          style: je
        },
        "运行工作流"
      )
    )
  );
}
function Go({
  agents: e,
  onLaunch: t
}) {
  const n = z().React, { useMemo: r, useState: a, useCallback: l, useEffect: o } = n, {
    Row: i,
    Col: s,
    Input: d,
    Empty: u,
    Typography: p,
    Tag: c,
    Button: m,
    Divider: h,
    Tabs: f,
    message: g
  } = z().antd, { SearchOutlined: E, PlusOutlined: v, RocketOutlined: b } = z().antdIcons || {}, { Text: w } = p, [I, R] = a(""), [U, P] = a([]), [$, F] = a([]), [W, N] = a(!1), [x, S] = a(null), [_, A] = a("preset");
  o(() => {
    let L = !0;
    return (async () => {
      try {
        await Ao();
        const ae = await An();
        L && P(ae);
      } catch (ae) {
        console.warn("[ugsci] Failed to load backend expert teams:", ae), L && (P([]), g.warning("专家团后端加载失败，请检查服务后重试"));
      }
    })(), Ro().then((ae) => {
      L && ae && F(ae);
    }), () => {
      L = !1;
    };
  }, []);
  const H = l(() => {
    An().then(P).catch((L) => {
      console.warn("[ugsci] Failed to refresh expert teams:", L), P([]), g.warning("专家团后端加载失败，请检查服务后重试");
    });
  }, [g]), D = l(
    (L) => {
      Io(L.id).then(() => {
        H(), g.success(`团队「${L.name}」已删除`);
      }).catch((ae) => g.error(ae.message || "删除专家团失败"));
    },
    [g, H]
  ), j = l((L) => {
    S(L), N(!0);
  }, []), O = l(() => {
    S(null), N(!0);
  }, []), k = r(() => [...U, ...$], [U, $]), se = r(() => {
    if (!I.trim()) return k;
    const L = I.toLowerCase();
    return k.filter(
      (ae) => ae.name.toLowerCase().includes(L) || ae.description.toLowerCase().includes(L) || ae.category.toLowerCase().includes(L)
    );
  }, [k, I]), oe = se.filter((L) => L.custom), B = se.filter((L) => !L.custom);
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
        prefix: E ? n.createElement(E) : void 0,
        value: I,
        onChange: (L) => R(L.target.value),
        allowClear: !0,
        style: { flex: "1 1 280px", maxWidth: 400 }
      }),
      n.createElement(
        m,
        {
          type: "primary",
          size: "small",
          icon: v ? n.createElement(v) : void 0,
          onClick: O,
          style: je
        },
        "创建专家团"
      )
    ),
    // Tabs: preset teams vs custom teams
    n.createElement(
      f,
      {
        activeKey: _,
        onChange: A,
        items: [
          {
            key: "preset",
            label: `预设团队${B.length ? ` (${B.length})` : ""}`,
            children: n.createElement(
              "div",
              null,
              B.length > 0 ? n.createElement(
                i,
                { gutter: [12, 12] },
                ...B.map(
                  (L) => n.createElement(
                    s,
                    { key: L.id, xs: 24, sm: 12, md: 8 },
                    n.createElement(Pr, {
                      team: L,
                      agents: e,
                      onLaunch: t
                    })
                  )
                )
              ) : n.createElement(u, {
                description: "未找到匹配的预设团队",
                image: u.PRESENTED_IMAGE_SIMPLE
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
                i,
                { gutter: [12, 12] },
                ...oe.map(
                  (L) => n.createElement(
                    s,
                    { key: L.id, xs: 24, sm: 12, md: 8 },
                    n.createElement(Pr, {
                      team: L,
                      agents: e,
                      onLaunch: t,
                      onEdit: j,
                      onDelete: D
                    })
                  )
                )
              ) : n.createElement(u, {
                description: "暂无自定义团队，点击「创建专家团」自定义",
                image: u.PRESENTED_IMAGE_SIMPLE
              })
            )
          },
          {
            key: "active",
            label: "进行中的讨论",
            children: n.createElement(
              n.Fragment,
              null,
              n.createElement(jo, {
                enabled: _ === "active"
              }),
              n.createElement(Ar, {
                activeOnly: !0,
                enabled: _ === "active"
              })
            )
          },
          {
            key: "history",
            label: "讨论历史",
            children: n.createElement(Ar, {
              enabled: _ === "history"
            })
          }
        ]
      }
    ),
    // Team Builder Modal
    n.createElement(Do, {
      open: W,
      onClose: () => {
        N(!1), S(null);
      },
      agents: e,
      editingTeam: x,
      onSaved: H
    })
  );
}
const Ho = [
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
], Wo = 5e3, Vo = {
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
function qo(e) {
  window.history.pushState({}, "", e), window.dispatchEvent(new PopStateEvent("popstate"));
}
function Sn(e, t) {
  const n = new URLSearchParams();
  e && n.set("flow", e), t && n.set("run", t), qo(`/flowforge${n.size ? `?${n.toString()}` : ""}`);
}
function Jo(e) {
  return e ? new Date(e * 1e3).toLocaleString("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  }) : "—";
}
function Ko(e) {
  if (!e || e <= 0) return "—";
  if (e < 1e3) return `${e}ms`;
  const t = Math.floor(e / 1e3);
  if (t < 60) return `${t}s`;
  const n = Math.floor(t / 60), r = t % 60;
  return `${n}m${r}s`;
}
function Xo(e) {
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
const Ht = /* @__PURE__ */ new Set(["running", "queued", "paused", "waiting_human"]);
function Yo() {
  const e = z().React, { useCallback: t, useEffect: n, useRef: r, useState: a } = e, {
    Alert: l,
    Button: o,
    Card: i,
    Col: s,
    Empty: d,
    Input: u,
    Popconfirm: p,
    Row: c,
    Space: m,
    Spin: h,
    Tabs: f,
    Tag: g,
    Tooltip: E,
    Typography: v,
    message: b
  } = z().antd, {
    ApartmentOutlined: w,
    DeleteOutlined: I,
    ReloadOutlined: R,
    RocketOutlined: U,
    PlayCircleOutlined: P,
    StopOutlined: $
  } = z().antdIcons || {}, { Text: F, Paragraph: W, Title: N } = v, x = z().useSelectedAgent, S = x ? x() : { id: "default" }, _ = (S == null ? void 0 : S.id) || "default", [A, H] = a([]), [D, j] = a([]), [O, k] = a([]), [se, oe] = a(!0), [B, L] = a(!0), [ae, ne] = a(null), [J, pe] = a(""), [M, ie] = a(""), [me, Q] = a("templates"), [Z, ce] = a(/* @__PURE__ */ new Set()), Ee = r(null), Se = D.some((T) => Ht.has(T.status)), $e = e.useMemo(() => {
    const T = {};
    return A.forEach((re) => {
      T[re.id] = re.name;
    }), T;
  }, [A]), xe = e.useMemo(() => {
    const T = {};
    return D.forEach((re) => {
      Ht.has(re.status) && (T[re.flow_id] = (T[re.flow_id] || 0) + 1);
    }), T;
  }, [D]), ee = t(async (T = !1) => {
    T || oe(!0);
    try {
      const [re, fe, Ae] = await Promise.all([
        de("/flowforge/flows", { bypassCache: !0 }),
        de("/flowforge/runs", { bypassCache: !0 }),
        un().catch(() => [])
      ]);
      H(re), j(fe), k(Ae), L(!0);
    } catch (re) {
      console.warn("[ugsci] FlowForge is unavailable:", re), L(!1);
    } finally {
      T || oe(!1);
    }
  }, []);
  n(() => {
    ee();
  }, [ee]), n(() => {
    if (!B || !Se) {
      Ee.current && (clearTimeout(Ee.current), Ee.current = null);
      return;
    }
    return Ee.current = setTimeout(() => {
      ee(!0);
    }, Wo), () => {
      Ee.current && (clearTimeout(Ee.current), Ee.current = null);
    };
  }, [Se, B, ee]);
  const we = t(
    async (T) => {
      if (!ae) {
        ne(T.key);
        try {
          const re = await de(
            "/flowforge/generate",
            {
              method: "POST",
              body: JSON.stringify({
                prompt: T.sop,
                name: T.name,
                agent_id: _
              })
            }
          ), fe = {
            ...re.nodes || {}
          }, Ae = Object.entries(fe).filter(([Ve]) => /^step_\d+$/.test(Ve)).sort(([Ve], [_e]) => Number(Ve.slice(5)) - Number(_e.slice(5))), Le = {};
          let We = 0, Be = 0;
          Ae.forEach(([Ve, _e], Re) => {
            const le = T.roleHints[Re] || "", ze = T.roleKeys[Re] || "analyst", Pe = O.find(
              (Ye) => `${Ye.name} ${Ye.id}`.toLowerCase().includes(le.toLowerCase())
            );
            Pe ? We++ : Be++;
            const Me = (Pe == null ? void 0 : Pe.id) || _, Xe = { ..._e.inputs || {} };
            Xe.agent_id = Me, fe[Ve] = {
              ..._e,
              inputs: Xe,
              metadata: {
                ..._e.metadata || {},
                binding_policy: "fixed_instance",
                role_hint: le,
                role_key: ze,
                agent_id: Me
              }
            }, Le[Ve] = {
              binding_policy: "fixed_instance",
              role_hint: le,
              role_key: ze,
              agent_id: Me
            };
          });
          const qe = {
            ...re,
            nodes: fe,
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
          await de("/flowforge/flows", {
            method: "POST",
            body: JSON.stringify(qe)
          });
          const st = Ae.length > 0 ? `（${We} 个专家已匹配，${Be} 个回退到控制器）` : "";
          b.success(`已创建工作流草稿「${T.name}」${st}`), await ee();
        } catch (re) {
          b.error(re.message || "创建工作流失败");
        } finally {
          ne(null);
        }
      }
    },
    [O, _, ae, ee, b]
  ), be = t(async () => {
    if (!ae) {
      if (!M.trim()) {
        b.warning("请先描述工作流步骤和控制要求");
        return;
      }
      ne("natural-language");
      try {
        const T = await de(
          "/flowforge/generate",
          {
            method: "POST",
            body: JSON.stringify({
              prompt: M.trim(),
              name: J.trim(),
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
        await de("/flowforge/flows", {
          method: "POST",
          body: JSON.stringify(re)
        }), b.success("已从自然语言生成可编辑工作流草稿"), pe(""), ie(""), await ee();
      } catch (T) {
        b.error(T.message || "自然语言生成失败");
      } finally {
        ne(null);
      }
    }
  }, [_, ae, ee, b, J, M]), te = t(
    async (T, re) => {
      try {
        await de(`/flowforge/flows/${encodeURIComponent(T)}/run`, {
          method: "POST",
          body: JSON.stringify({ inputs: {} })
        }), b.success(`已启动工作流「${re}」`), await ee(!0);
      } catch (fe) {
        b.error(fe.message || "启动工作流失败");
      }
    },
    [ee, b]
  ), ue = t(
    async (T, re) => {
      try {
        await de(`/flowforge/flows/${encodeURIComponent(T)}`, {
          method: "DELETE"
        }), b.success(`已删除工作流「${re}」`), await ee();
      } catch (fe) {
        b.error(fe.message || "删除工作流失败");
      }
    },
    [ee, b]
  ), ge = t(
    async (T) => {
      ce((re) => {
        const fe = new Set(re);
        return fe.add(T), fe;
      });
      try {
        await de(`/flowforge/runs/${encodeURIComponent(T)}/cancel`, {
          method: "POST"
        }), b.success("已请求取消运行"), await ee(!0);
      } catch (re) {
        b.error(re.message || "取消运行失败");
      } finally {
        ce((re) => {
          const fe = new Set(re);
          return fe.delete(T), fe;
        });
      }
    },
    [ee, b]
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
        m,
        { direction: "vertical", style: { width: "100%" }, size: 10 },
        e.createElement(u, {
          value: J,
          onChange: (T) => pe(T.target.value),
          placeholder: "工作流名称（可选）",
          maxLength: 80
        }),
        e.createElement(u.TextArea, {
          value: M,
          onChange: (T) => ie(T.target.value),
          placeholder: "例如：先检查某储气库本周期压力和注采量数据，再由油藏工程师预测下周期能力，由独立完整性专家复核风险，最后形成带证据和不确定性的建议。",
          autoSize: { minRows: 3, maxRows: 8 }
        }),
        e.createElement(
          o,
          {
            type: "primary",
            onClick: () => void be(),
            loading: ae === "natural-language",
            disabled: !B || !!ae,
            style: je
          },
          "生成可编辑草稿"
        )
      )
    ),
    e.createElement(
      c,
      { gutter: [12, 12] },
      ...Ho.map(
        (T) => e.createElement(
          s,
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
                e.createElement(N, { level: 5, style: { margin: 0 } }, T.name),
                e.createElement(g, { color: "blue", style: { marginTop: 6 } }, T.category),
                e.createElement(
                  W,
                  { type: "secondary", style: { margin: "10px 0 14px" } },
                  T.description
                ),
                e.createElement(
                  o,
                  {
                    type: "primary",
                    loading: ae === T.key,
                    disabled: !B || !!ae,
                    onClick: () => void we(T),
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
          ([T, re, fe]) => e.createElement(
            s,
            { key: T, xs: 24, sm: 12, lg: 6 },
            e.createElement(F, { strong: !0 }, T),
            e.createElement(
              g,
              {
                color: fe === "当前可执行" ? "green" : "default",
                style: { marginLeft: 6, fontSize: 10 }
              },
              fe
            ),
            e.createElement("div", { style: { color: "var(--ant-color-text-tertiary, #8c8c8c)", fontSize: 12, marginTop: 4 } }, re)
          )
        )
      )
    )
  ), C = se ? e.createElement(h) : A.length === 0 ? e.createElement(d, { description: "暂无工作流，可从模板创建" }) : e.createElement(
    c,
    { gutter: [12, 12] },
    ...A.map((T) => {
      const re = xe[T.id] || 0;
      return e.createElement(
        s,
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
                g,
                { color: "blue" },
                `${re} 个运行中`
              ) : null
            ),
            extra: e.createElement(g, null, `v${T.version}`)
          },
          e.createElement(W, { ellipsis: { rows: 2 } }, T.description || "暂无描述"),
          e.createElement(
            m,
            { size: 8, wrap: !0 },
            e.createElement(g, { color: "geekblue" }, `${T.node_count} 个节点`),
            e.createElement(o, {
              size: "small",
              type: "primary",
              icon: P ? e.createElement(P) : void 0,
              disabled: !B,
              onClick: () => void te(T.id, T.name)
            }, "运行"),
            e.createElement(o, {
              size: "small",
              onClick: () => Sn(T.id)
            }, "编辑"),
            e.createElement(
              p,
              {
                title: "确认删除",
                description: `确定要删除工作流「${T.name}」吗？此操作不可撤销。`,
                onConfirm: () => void ue(T.id, T.name),
                okText: "删除",
                cancelText: "取消",
                okButtonProps: { danger: !0 }
              },
              e.createElement(o, {
                size: "small",
                danger: !0,
                icon: I ? e.createElement(I) : void 0
              }, "删除")
            )
          )
        )
      );
    })
  ), ye = se ? e.createElement(h) : D.length === 0 ? e.createElement(d, { description: "暂无工作流运行记录" }) : e.createElement(
    "div",
    { style: { display: "flex", flexDirection: "column", gap: 8 } },
    ...D.map((T) => {
      const re = $e[T.flow_id] || T.flow_id, fe = Ht.has(T.status), Ae = Xo(T.node_statuses), Le = T.duration_ms && T.duration_ms > 0 ? T.duration_ms : T.finished_at && T.started_at ? (T.finished_at - T.started_at) * 1e3 : fe && T.started_at ? (Date.now() / 1e3 - T.started_at) * 1e3 : 0;
      return e.createElement(
        i,
        { key: T.run_id, size: "small" },
        e.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" } },
          e.createElement(
            g,
            { color: Vo[T.status] || "default" },
            T.status
          ),
          e.createElement(F, { strong: !0 }, re),
          e.createElement(
            E,
            { title: T.run_id },
            e.createElement(
              F,
              { type: "secondary", style: { fontFamily: "monospace", fontSize: 11 } },
              T.run_id.slice(0, 8) + "…"
            )
          ),
          e.createElement(
            F,
            { type: "secondary", style: { fontSize: 12 } },
            Jo(T.started_at)
          ),
          Le > 0 ? e.createElement(
            F,
            { type: "secondary", style: { fontSize: 12 } },
            `耗时 ${Ko(Le)}`
          ) : null,
          Ae ? e.createElement(g, { color: "geekblue", style: { fontSize: 11 } }, Ae) : null,
          T.error ? e.createElement(
            E,
            { title: T.error },
            e.createElement(F, { type: "danger", style: { fontSize: 12 } }, "（有错误）")
          ) : null,
          e.createElement(
            "div",
            { style: { marginLeft: "auto", display: "flex", gap: 6 } },
            fe ? e.createElement(
              p,
              {
                title: "确认取消运行？",
                onConfirm: () => void ge(T.run_id),
                okText: "取消运行",
                cancelText: "保留",
                okButtonProps: { danger: !0 }
              },
              e.createElement(o, {
                size: "small",
                danger: !0,
                loading: Z.has(T.run_id),
                icon: $ ? e.createElement($) : void 0
              }, "取消运行")
            ) : null,
            e.createElement(
              o,
              { size: "small", type: "link", onClick: () => Sn(void 0, T.run_id) },
              "查看详情"
            )
          )
        )
      );
    })
  ), q = e.createElement(
    m,
    null,
    e.createElement(o, {
      icon: R ? e.createElement(R) : void 0,
      onClick: () => void ee(),
      loading: se
    }, "刷新"),
    me !== "templates" ? e.createElement(o, {
      type: "primary",
      icon: w ? e.createElement(w) : U ? e.createElement(U) : void 0,
      onClick: () => Sn(),
      disabled: !B,
      style: je
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
    e.createElement(f, {
      items: [
        { key: "templates", label: "工作流模板", children: K },
        { key: "mine", label: `我的工作流 (${A.length})`, children: C },
        {
          key: "runs",
          label: e.createElement(
            "span",
            null,
            "运行中心 (",
            D.length,
            Se ? e.createElement(
              "span",
              { style: { color: "#1677ff", marginLeft: 2 } },
              `·${D.filter((T) => Ht.has(T.status)).length} 活跃`
            ) : null,
            ")"
          ),
          children: ye
        }
      ],
      activeKey: me,
      onChange: (T) => Q(T),
      tabBarExtraContent: q
    })
  );
}
function Or(e, t) {
  var a, l;
  const n = e.coordinatorName || ((a = e.members[0]) == null ? void 0 : a.name), r = e.members.find((o) => o.name === n) || e.members[0];
  if ((r == null ? void 0 : r.bindingMode) !== "temporary" && (r != null && r.agentId) && t.some((o) => o.id === r.agentId))
    return r.agentId;
  if (n && (r == null ? void 0 : r.bindingMode) !== "temporary") {
    const o = Ta(t, n);
    if (o) return o;
  }
  return (r == null ? void 0 : r.bindingMode) === "fixed" ? null : ((l = t[0]) == null ? void 0 : l.id) || null;
}
function Mr() {
  const e = new URLSearchParams(window.location.search).get("section");
  return e === "teams" || e === "workflows" ? e : "experts";
}
function Qo() {
  var ue, ge;
  const e = z().React, { useState: t, useEffect: n, useCallback: r, useMemo: a } = e, {
    Spin: l,
    Empty: o,
    Input: i,
    Button: s,
    message: d,
    Row: u,
    Col: p,
    Tabs: c,
    Modal: m,
    Typography: h
  } = z().antd, {
    ReloadOutlined: f,
    PlusOutlined: g,
    SearchOutlined: E,
    TeamOutlined: v,
    UserOutlined: b
  } = z().antdIcons || {}, { Text: w, Paragraph: I } = h, [R, U] = t([]), [P, $] = t(!0), [F, W] = t(!1), [N, x] = t(null), [S, _] = t(""), [A, H] = t(!1), [D, j] = t(Mr), [O, k] = t(
    null
  ), [se, oe] = t(""), [B, L] = t(!1), [ae, ne] = t(!1), [J, pe] = t(null), [M, ie] = t([]), me = r(async () => {
    $(!0);
    try {
      const K = await un(), C = await Promise.all(
        K.map(async (ye) => {
          try {
            const [q, T, re] = await Promise.all([
              Nn(ye.id).catch(() => null),
              mn(ye.id).catch(() => []),
              Gn(ye.id).catch(() => [])
            ]);
            return {
              agent: ye,
              config: q,
              skills: T,
              mcps: re,
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
      U(C), ie(K);
    } catch (K) {
      d.error(K.message || "加载专家列表失败"), U([]);
    } finally {
      $(!1);
    }
  }, []);
  n(() => {
    me();
  }, [me]), n(() => {
    const K = () => j(Mr());
    return window.addEventListener("popstate", K), () => window.removeEventListener("popstate", K);
  }, []), n(() => {
    if (J && ae) {
      const K = R.find(
        (C) => C.agent.id === J.agent.id
      );
      K && K !== J && pe(K);
    }
  }, [R, J, ae]);
  const Q = r(
    async (K) => {
      var T;
      const C = K.coordinatorName || ((T = K.members[0]) == null ? void 0 : T.name), ye = Or(K, M);
      if (!ye) {
        const re = K.members.find(
          (fe) => fe.name === C
        );
        d.error(
          (re == null ? void 0 : re.bindingMode) === "fixed" ? `固定协调者「${C || "协调者"}」当前不可用，请修复绑定后再运行` : "没有可用的 Agent 作为工作流控制器"
        );
        return;
      }
      if (/\{.+?\}/.test(K.taskTemplate)) {
        oe(K.taskTemplate), k(K);
        return;
      }
      await Z(K, ye, K.taskTemplate);
    },
    [M, d]
  ), Z = r(
    async (K, C, ye) => {
      L(!0);
      try {
        const q = ye || K.taskTemplate, T = K.custom ? `@${K.id}` : K.name, re = `/ugsci-team ${K.mode} ${T} ${q}`, fe = z();
        fe.setSelectedAgent && fe.setSelectedAgent(C);
        const Ae = await $o(
          C,
          re,
          K.name
        );
        d.success(
          `OMP 工作流已启动：${K.name}（${K.mode}模式）`
        ), k(null), ce(`/chat/${Ae}`);
      } catch (q) {
        d.error(q.message || "发起团队任务失败");
      } finally {
        L(!1);
      }
    },
    [d]
  ), ce = (K) => {
    window.history.pushState({}, "", K), window.dispatchEvent(new PopStateEvent("popstate"));
  }, Ee = r((K) => {
    x(K), W(!0);
  }, []), Se = r((K) => {
    pe(K), ne(!0);
  }, []), $e = r(
    (K) => {
      if (!K.agent.enabled) {
        d.warning(`专家「${K.agent.name}」未启用，请先启用`);
        return;
      }
      try {
        const C = z();
        C.setSelectedAgent && C.setSelectedAgent(K.agent.id);
      } catch (C) {
        console.warn("[ugsci] Failed to set selected agent:", C);
      }
      d.success(`已召唤专家「${K.agent.name}」，正在跳转至对话...`), ce("/chat");
    },
    [d]
  ), xe = a(() => {
    if (!S.trim()) return R;
    const K = S.toLowerCase();
    return R.filter(
      (C) => {
        var ye;
        return C.agent.name.toLowerCase().includes(K) || ((ye = C.agent.description) == null ? void 0 : ye.toLowerCase().includes(K)) || C.agent.id.toLowerCase().includes(K) || C.skills.some((q) => q.name.toLowerCase().includes(K));
      }
    );
  }, [R, S]), ee = R.filter((K) => K.agent.enabled).length, we = R.reduce(
    (K, C) => K + C.skills.filter((ye) => ye.enabled !== !1).length,
    0
  ), be = R.reduce((K, C) => K + C.mcps.length, 0), te = [
    {
      key: "experts",
      label: e.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        b ? e.createElement(b, { style: { fontSize: 14 } }) : null,
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
            prefix: E ? e.createElement(E) : void 0,
            value: S,
            onChange: (K) => _(K.target.value),
            allowClear: !0,
            style: { flex: "1 1 280px", maxWidth: 400 }
          }),
          e.createElement(
            s,
            {
              type: "primary",
              icon: g ? e.createElement(g) : void 0,
              onClick: () => H(!0),
              style: je
            },
            "创建专家"
          )
        ),
        // Content
        P ? e.createElement(
          "div",
          { style: { textAlign: "center", padding: 60 } },
          e.createElement(l, { size: "large" })
        ) : xe.length === 0 ? e.createElement(o, {
          description: S ? "未找到匹配的专家" : "暂无专家，点击「创建专家」添加"
        }) : e.createElement(
          u,
          { gutter: [12, 12], align: "stretch" },
          ...xe.map(
            (K) => e.createElement(
              p,
              {
                key: K.agent.id,
                xs: 24,
                sm: 12,
                md: 8,
                lg: 6,
                style: { display: "flex" }
              },
              e.createElement(Eo, {
                expert: K,
                onClick: () => Ee(K),
                onSummon: () => $e(K),
                onConfigure: () => Se(K)
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
      children: e.createElement(Go, {
        agents: M,
        onLaunch: Q
      })
    },
    {
      key: "workflows",
      label: e.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        (ue = z().antdIcons) != null && ue.ApartmentOutlined ? e.createElement(z().antdIcons.ApartmentOutlined, {
          style: { fontSize: 14 }
        }) : null,
        "协作工作流"
      ),
      children: e.createElement(Yo)
    }
  ];
  return e.createElement(
    "div",
    { style: { padding: 24 } },
    e.createElement(dn, {
      title: "专家·协作",
      subtitle: D === "experts" ? `共 ${R.length} 位专家（${ee} 位启用）· ${we} 个技能 · ${be} 个 MCP 客户端` : D === "teams" ? "开放式多专家讨论、联合研判与 OMP 动态协作" : "流程化、可观测、可验证的油气与储气库协作流程",
      extra: e.createElement(
        e.Fragment,
        null,
        D === "experts" ? e.createElement(
          s,
          {
            icon: f ? e.createElement(f) : void 0,
            onClick: () => {
              Bt(), me();
            },
            loading: P
          },
          "刷新"
        ) : null
      )
    }),
    e.createElement(c, {
      items: te,
      activeKey: D,
      onChange: (K) => {
        j(K);
        const C = new URL(window.location.href);
        K === "experts" ? C.searchParams.delete("section") : C.searchParams.set("section", K), window.history.pushState({}, "", `${C.pathname}${C.search}`);
      }
    }),
    // Drawer
    e.createElement(bo, {
      expert: N,
      open: F,
      onClose: () => W(!1),
      onRefresh: () => me()
    }),
    // Template Modal
    e.createElement(vo, {
      open: A,
      onClose: () => H(!1),
      onCreated: () => me()
    }),
    // Config Modal (gear icon)
    e.createElement(go, {
      expert: J,
      open: ae,
      onClose: () => ne(!1),
      onRefresh: () => me()
    }),
    // Team Launch Modal (for filling placeholders)
    O ? e.createElement(
      m,
      {
        open: !0,
        title: e.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 8 } },
          e.createElement(Wn, {
            members: O.members.map((K) => K.name),
            size: 28
          }),
          e.createElement(
            "span",
            null,
            `发起团队任务 - ${O.name}`
          )
        ),
        onCancel: () => k(null),
        onOk: () => {
          const K = Or(
            O,
            M
          );
          if (!K) {
            d.error("固定协调者不可用或没有可用的控制器 Agent");
            return;
          }
          const C = se.trim() || O.taskTemplate;
          Z(O, K, C);
        },
        confirmLoading: B,
        okText: "发起任务",
        width: 600
      },
      e.createElement(
        "div",
        null,
        e.createElement(
          w,
          {
            type: "secondary",
            style: { fontSize: 12, display: "block", marginBottom: 8 }
          },
          "任务内容（请替换 {参数名} 等占位符后发起）："
        ),
        e.createElement(i.TextArea, {
          value: se,
          onChange: (K) => oe(K.target.value),
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
          w,
          { style: { fontSize: 12, color: "#0958d9" } },
          `协调者: ${O.coordinatorName || ((ge = O.members[0]) == null ? void 0 : ge.name) || "—"} · 成员: ${O.members.map((K) => K.name).join("、")}`
        )
      )
    ) : null
  );
}
function Zo({
  agentId: e,
  agentName: t,
  refreshKey: n = 0,
  onNavigate: r
}) {
  const a = z().React, { useState: l, useEffect: o, useCallback: i } = a, {
    Spin: s,
    Empty: d,
    Button: u,
    Row: p,
    Col: c,
    Card: m,
    Tag: h,
    Checkbox: f,
    Modal: g,
    Typography: E,
    Drawer: v,
    Descriptions: b,
    message: w
  } = z().antd, {
    ReloadOutlined: I,
    ThunderboltOutlined: R,
    SettingOutlined: U,
    CheckSquareOutlined: P,
    EyeOutlined: $,
    EyeInvisibleOutlined: F,
    DeleteOutlined: W,
    CloseOutlined: N
  } = z().antdIcons || {}, { Text: x, Paragraph: S } = E, [_, A] = l([]), [H, D] = l(!0), [j, O] = l(!1), [k, se] = l(null), [oe, B] = l(!1), [L, ae] = l(
    /* @__PURE__ */ new Set()
  ), [ne, J] = l(!1), [pe, M] = l(null), [ie, me] = l(!1), Q = i(async () => {
    if (e) {
      D(!0);
      try {
        const te = await mn(e);
        A(te);
      } catch (te) {
        w.error(te.message || "加载技能失败"), A([]);
      } finally {
        D(!1);
      }
    }
  }, [e]);
  o(() => {
    Q();
  }, [Q, n]);
  const Z = (te) => {
    ae((ue) => {
      const ge = new Set(ue);
      return ge.has(te) ? ge.delete(te) : ge.add(te), ge;
    });
  }, ce = () => ae(/* @__PURE__ */ new Set()), Ee = () => ae(new Set(_.map((te) => te.name))), Se = () => {
    oe ? (ce(), B(!1)) : B(!0);
  }, $e = async () => {
    const te = Array.from(L);
    if (te.length !== 0) {
      J(!0);
      try {
        const { results: ue } = await Vl(e, te), ge = Object.entries(ue).filter(
          ([, C]) => C.success === !1
        ), K = te.length - ge.length;
        ge.length > 0 ? w.warning(
          `批量启用完成：成功 ${K} 个，失败 ${ge.length} 个`
        ) : w.success(`成功启用 ${te.length} 个技能`), ce(), await Q();
      } catch (ue) {
        w.error(ue.message || "批量启用失败");
      } finally {
        J(!1);
      }
    }
  }, xe = async () => {
    const te = Array.from(L);
    if (te.length !== 0) {
      J(!0);
      try {
        const { results: ue } = await ql(e, te), ge = Object.entries(ue).filter(
          ([, C]) => C.success === !1
        ), K = te.length - ge.length;
        ge.length > 0 ? w.warning(
          `批量停用完成：成功 ${K} 个，失败 ${ge.length} 个`
        ) : w.success(`成功停用 ${te.length} 个技能`), ce(), await Q();
      } catch (ue) {
        w.error(ue.message || "批量停用失败");
      } finally {
        J(!1);
      }
    }
  }, ee = () => {
    const te = Array.from(L);
    te.length !== 0 && g.confirm({
      title: `确认删除 ${te.length} 个技能？`,
      content: "删除后技能将从当前专家工作区移除，此操作不可撤销。技能池中的原始技能不受影响。",
      okText: "确认删除",
      cancelText: "取消",
      okButtonProps: { danger: !0 },
      onOk: async () => {
        J(!0);
        try {
          const { results: ue } = await Jl(e, te), ge = Object.entries(ue).filter(
            ([, C]) => C.success === !1
          ), K = te.length - ge.length;
          ge.length > 0 ? w.warning(
            `批量删除完成：成功 ${K} 个，失败 ${ge.length} 个`
          ) : w.success(`成功删除 ${te.length} 个技能`), ce(), await Q();
        } catch (ue) {
          w.error(ue.message || "批量删除失败");
        } finally {
          J(!1);
        }
      }
    });
  }, we = async (te) => {
    me(!0);
    try {
      te.enabled === !1 ? (await ya(e, te.name), w.success(`已启用技能「${te.name}」`)) : (await Ea(e, te.name), w.success(`已禁用技能「${te.name}」`)), await Q();
    } catch (ue) {
      w.error(ue.message || "操作失败");
    } finally {
      me(!1);
    }
  }, be = (te) => {
    g.confirm({
      title: `确认删除技能「${te.name}」？`,
      content: "删除后技能将从当前专家工作区移除，此操作不可撤销。技能池中的原始技能不受影响。",
      okText: "确认删除",
      cancelText: "取消",
      okButtonProps: { danger: !0 },
      onOk: async () => {
        me(!0);
        try {
          await Dn(e, te.name), w.success(`已删除技能「${te.name}」`), await Q();
        } catch (ue) {
          w.error(ue.message || "删除失败");
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
        x,
        { type: "secondary", style: { fontSize: 13 } },
        oe ? `已选择 ${L.size} / ${_.length} 个技能` : `共 ${_.length} 个技能`
      ),
      a.createElement(
        "div",
        { style: { display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" } },
        oe ? a.createElement(
          a.Fragment,
          null,
          a.createElement(
            u,
            { size: "small", onClick: Ee },
            "全选"
          ),
          a.createElement(
            u,
            {
              size: "small",
              icon: N ? a.createElement(N) : void 0,
              onClick: ce
            },
            "取消选择"
          ),
          a.createElement(
            u,
            {
              size: "small",
              type: "default",
              icon: $ ? a.createElement($) : void 0,
              disabled: L.size === 0 || ne,
              loading: ne,
              onClick: $e
            },
            "批量启用"
          ),
          a.createElement(
            u,
            {
              size: "small",
              danger: !0,
              icon: F ? a.createElement(F) : void 0,
              disabled: L.size === 0 || ne,
              loading: ne,
              onClick: xe
            },
            "批量停用"
          ),
          a.createElement(
            u,
            {
              size: "small",
              danger: !0,
              icon: W ? a.createElement(W) : void 0,
              disabled: L.size === 0 || ne,
              loading: ne,
              onClick: ee
            },
            `删除 (${L.size})`
          ),
          a.createElement(
            u,
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
            u,
            {
              size: "small",
              icon: P ? a.createElement(P) : void 0,
              onClick: Se,
              disabled: _.length === 0
            },
            "批量管理"
          ),
          a.createElement(
            u,
            {
              icon: I ? a.createElement(I) : void 0,
              onClick: () => {
                Bt(), Q();
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
      a.createElement(s, { size: "large" })
    ) : _.length === 0 ? a.createElement(d, {
      description: "当前智能体未加载任何技能"
    }) : a.createElement(
      p,
      { gutter: [12, 12] },
      ..._.map(
        (te) => a.createElement(
          c,
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
                borderColor: oe && L.has(te.name) ? "#0072f5" : void 0,
                borderWidth: oe && L.has(te.name) ? 2 : 1
              },
              onClick: () => {
                oe ? Z(te.name) : (se(te), O(!0));
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
                onClick: (ue) => {
                  ue.stopPropagation(), Z(te.name);
                }
              },
              a.createElement(f, {
                checked: L.has(te.name)
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
                x,
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
                h,
                { color: "default", style: { fontSize: 10 } },
                "已禁用"
              ) : a.createElement(
                h,
                { color: "green", style: { fontSize: 10 } },
                "已启用"
              )
            ),
            te.description ? a.createElement(
              S,
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
                h,
                { style: { fontSize: 10 } },
                `v${te.version_text}`
              ) : null,
              ...(te.tags || []).slice(0, 3).map(
                (ue, ge) => a.createElement(
                  h,
                  { key: ge, color: "blue", style: { fontSize: 10 } },
                  ue
                )
              )
            ),
            // Hover action footer (not in batch mode)
            !oe && pe === te.name ? a.createElement(
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
                u,
                {
                  size: "small",
                  type: "default",
                  icon: te.enabled === !1 ? $ ? a.createElement($) : void 0 : F ? a.createElement(F) : void 0,
                  disabled: ie,
                  onClick: (ue) => {
                    ue.stopPropagation(), we(te);
                  }
                },
                te.enabled === !1 ? "启用" : "禁用"
              ),
              a.createElement(
                u,
                {
                  size: "small",
                  danger: !0,
                  icon: W ? a.createElement(W) : void 0,
                  disabled: ie,
                  onClick: (ue) => {
                    ue.stopPropagation(), be(te);
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
    k ? a.createElement(
      v,
      {
        title: a.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 8 } },
          a.createElement(
            "span",
            { style: { fontSize: 18 } },
            k.emoji || "⚡"
          ),
          a.createElement("span", null, k.name)
        ),
        open: j,
        onClose: () => O(!1),
        width: 520,
        extra: a.createElement(
          u,
          {
            type: "primary",
            size: "small",
            icon: U ? a.createElement(U) : void 0,
            onClick: () => r("/skills")
          },
          "管理技能"
        )
      },
      a.createElement(
        b,
        { column: 1, bordered: !0, size: "small" },
        a.createElement(
          b.Item,
          { label: "技能名称" },
          k.name
        ),
        a.createElement(
          b.Item,
          { label: "描述" },
          k.description || "-"
        ),
        k.version_text ? a.createElement(
          b.Item,
          { label: "版本" },
          k.version_text
        ) : null,
        a.createElement(
          b.Item,
          { label: "来源" },
          k.source || "-"
        ),
        a.createElement(
          b.Item,
          { label: "状态" },
          k.enabled === !1 ? "已禁用" : "已启用"
        ),
        k.installed_from ? a.createElement(
          b.Item,
          { label: "安装来源" },
          k.installed_from
        ) : null
      ),
      // Tags
      k.tags && k.tags.length > 0 ? a.createElement(
        "div",
        { style: { marginTop: 16 } },
        a.createElement(
          x,
          {
            strong: !0,
            style: { display: "block", marginBottom: 8 }
          },
          "标签"
        ),
        a.createElement(
          "div",
          { style: { display: "flex", flexWrap: "wrap", gap: 4 } },
          ...k.tags.map(
            (te, ue) => a.createElement(h, { key: ue, color: "blue" }, te)
          )
        )
      ) : null,
      // Skill content preview
      k.content ? a.createElement(
        "div",
        { style: { marginTop: 16 } },
        a.createElement(
          x,
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
          k.content.slice(0, 2e3) + (k.content.length > 2e3 ? `

... (内容已截断)` : "")
        )
      ) : null
    ) : null
  );
}
function es({
  poolSkills: e,
  workspaceSkills: t,
  agents: n,
  loading: r,
  onReload: a,
  onSkillInstalled: l,
  agentId: o,
  agentName: i
}) {
  const s = z().React, { useState: d, useMemo: u, useCallback: p, useEffect: c, useRef: m } = s, {
    Spin: h,
    Empty: f,
    Input: g,
    Button: E,
    Row: v,
    Col: b,
    Card: w,
    Tag: I,
    Typography: R,
    Drawer: U,
    Descriptions: P,
    List: $,
    Modal: F,
    message: W
  } = z().antd, {
    ReloadOutlined: N,
    SearchOutlined: x,
    DownloadOutlined: S,
    ThunderboltOutlined: _,
    DeleteOutlined: A,
    PlusOutlined: H
  } = z().antdIcons || {}, { Text: D, Paragraph: j } = R, [O, k] = d(""), [se, oe] = d(!1), [B, L] = d(null), [ae, ne] = d([]), [J, pe] = d(!1), [M, ie] = d(24), [me, Q] = d(null), [Z, ce] = d(!1), Ee = m(0), Se = m(null), $e = u(
    () => {
      var q;
      return new Set(
        ((q = t.find((T) => T.agent_id === o)) == null ? void 0 : q.skill_names) || []
      );
    },
    [t, o]
  ), xe = u(() => {
    if (!O.trim()) return e;
    const q = O.toLowerCase();
    return e.filter(
      (T) => {
        var re, fe;
        return T.name.toLowerCase().includes(q) || ((re = T.description) == null ? void 0 : re.toLowerCase().includes(q)) || ((fe = T.tags) == null ? void 0 : fe.some((Ae) => Ae.toLowerCase().includes(q)));
      }
    );
  }, [e, O]), ee = u(
    () => xe.slice(0, M),
    [xe, M]
  );
  c(() => {
    if (ee.length >= xe.length) return;
    const q = Se.current;
    if (!q) return;
    const T = () => {
      ie(
        (fe) => Math.min(fe + 24, xe.length)
      );
    };
    if (typeof IntersectionObserver < "u") {
      const fe = new IntersectionObserver(
        (Ae) => {
          Ae.some((Le) => Le.isIntersecting) && T();
        },
        { rootMargin: "240px 0px" }
      );
      return fe.observe(q), () => fe.disconnect();
    }
    const re = () => {
      q.getBoundingClientRect().top <= window.innerHeight + 240 && T();
    };
    return window.addEventListener("scroll", re, { passive: !0 }), re(), () => window.removeEventListener("scroll", re);
  }, [xe.length, ee.length]);
  const we = p((q) => {
    k(q), ie(24);
  }, []), be = p(() => {
    const q = Ee.current;
    requestAnimationFrame(() => {
      window.scrollTo({ top: q, behavior: "auto" }), document.scrollingElement && (document.scrollingElement.scrollTop = q);
    });
  }, []), te = p(async () => {
    var q;
    Ee.current = ((q = document.scrollingElement) == null ? void 0 : q.scrollTop) ?? window.scrollY ?? 0;
    try {
      await a();
    } finally {
      be();
    }
  }, [a, be]), ue = p(
    (q) => {
      const T = [];
      for (const re of t)
        if (re.skill_names.includes(q)) {
          const fe = n.find((Ae) => Ae.id === re.agent_id);
          T.push((fe == null ? void 0 : fe.name) || re.agent_name || re.agent_id);
        }
      return T;
    },
    [t, n]
  ), ge = p(
    async (q) => {
      if (L(q), ne(ue(q.name)), oe(!0), !q.content) {
        pe(!0);
        try {
          const T = await jl(q.name);
          L({ ...q, content: T });
        } catch {
        } finally {
          pe(!1);
        }
      }
    },
    [ue]
  );
  c(() => {
    B && ne(ue(B.name));
  }, [B, ue, t]);
  const K = async (q) => {
    ce(!0);
    try {
      await Fn(o, q.name), W.success(
        `已将技能「${q.name}」加载到当前专家「${i}」`
      ), l(q);
    } catch (T) {
      W.error(T.message || "加载技能失败");
    } finally {
      ce(!1);
    }
  }, C = (q) => {
    if (q.protected) {
      W.warning("内置技能不可删除");
      return;
    }
    F.confirm({
      title: `确认从技能池删除「${q.name}」？`,
      content: "删除后所有已安装此技能的专家将不受影响，但技能池中将不再包含此技能。此操作不可撤销。",
      okText: "确认删除",
      cancelText: "取消",
      okButtonProps: { danger: !0 },
      onOk: async () => {
        ce(!0);
        try {
          await Xl(q.name), W.success(`已从技能池删除「${q.name}」`), await te();
        } catch (T) {
          W.error(T.message || "删除失败");
        } finally {
          ce(!1);
        }
      }
    });
  }, ye = (q) => {
    window.history.pushState({}, "", q), window.dispatchEvent(new PopStateEvent("popstate"));
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
      s.createElement(g, {
        placeholder: "搜索技能名称、描述或标签...",
        prefix: x ? s.createElement(x) : void 0,
        value: O,
        onChange: (q) => we(q.target.value),
        allowClear: !0,
        style: { maxWidth: 400 }
      }),
      s.createElement(
        "div",
        { style: { display: "flex", gap: 8 } },
        s.createElement(
          E,
          {
            icon: N ? s.createElement(N) : void 0,
            onClick: te,
            loading: r,
            size: "small"
          },
          "刷新"
        ),
        s.createElement(
          E,
          {
            type: "primary",
            icon: S ? s.createElement(S) : void 0,
            onClick: () => ye("/skill-pool"),
            size: "small",
            style: je
          },
          "管理技能池"
        )
      )
    ),
    r ? s.createElement(
      "div",
      { style: { textAlign: "center", padding: 60 } },
      s.createElement(h, { size: "large" })
    ) : xe.length === 0 ? s.createElement(f, {
      description: O ? "未找到匹配的技能" : "技能池为空"
    }) : s.createElement(
      s.Fragment,
      null,
      s.createElement(
        v,
        { gutter: [12, 12] },
        ...ee.map(
          (q) => s.createElement(
            b,
            { key: q.name, xs: 24, sm: 12, md: 8, lg: 6 },
            s.createElement(
              w,
              {
                hoverable: !0,
                size: "small",
                style: { cursor: "pointer", height: "100%" },
                onClick: () => ge(q),
                onMouseEnter: () => Q(q.name),
                onMouseLeave: () => Q(null)
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
                q.emoji ? s.createElement(
                  "span",
                  { style: { fontSize: 18 } },
                  q.emoji
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
                  q.name
                ),
                q.protected ? s.createElement(
                  I,
                  { color: "gold", style: { fontSize: 10 } },
                  "内置"
                ) : null
              ),
              q.description ? s.createElement(
                j,
                {
                  type: "secondary",
                  style: { fontSize: 11, margin: 0, lineHeight: 1.4 },
                  ellipsis: { rows: 2 }
                },
                q.description
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
                q.version_text ? s.createElement(
                  I,
                  { style: { fontSize: 10 } },
                  `v${q.version_text}`
                ) : null,
                ...(q.tags || []).slice(0, 3).map(
                  (T, re) => s.createElement(
                    I,
                    { key: re, color: "cyan", style: { fontSize: 10 } },
                    T
                  )
                )
              ),
              // Hover action footer
              me === q.name ? s.createElement(
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
                  E,
                  {
                    size: "small",
                    type: "primary",
                    icon: H ? s.createElement(H) : void 0,
                    disabled: Z || $e.has(q.name),
                    onClick: (T) => {
                      T.stopPropagation(), K(q);
                    }
                  },
                  $e.has(q.name) ? "已加载" : "加载到当前Agent"
                ),
                s.createElement(
                  E,
                  {
                    size: "small",
                    danger: !0,
                    icon: A ? s.createElement(A) : void 0,
                    disabled: Z || q.protected,
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
        ee.length < xe.length ? s.createElement(
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
          s.createElement(
            D,
            { type: "secondary", style: { fontSize: 12 } },
            `继续下滑自动加载 · 还剩 ${xe.length - ee.length} 个`
          )
        ) : null
      )
    ),
    // Skill detail drawer
    B ? s.createElement(
      U,
      {
        title: s.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 8 } },
          s.createElement(
            "span",
            { style: { fontSize: 18 } },
            B.emoji || "⚡"
          ),
          s.createElement("span", null, B.name)
        ),
        open: se,
        onClose: () => oe(!1),
        width: 520,
        extra: s.createElement(
          E,
          {
            type: "primary",
            size: "small",
            icon: _ ? s.createElement(_) : void 0,
            onClick: () => ye("/skills")
          },
          "管理技能"
        )
      },
      s.createElement(
        P,
        { column: 1, bordered: !0, size: "small" },
        s.createElement(
          P.Item,
          { label: "技能名称" },
          B.name
        ),
        s.createElement(
          P.Item,
          { label: "描述" },
          B.description || "-"
        ),
        B.version_text ? s.createElement(
          P.Item,
          { label: "版本" },
          B.version_text
        ) : null,
        s.createElement(
          P.Item,
          { label: "来源" },
          B.source || "-"
        ),
        s.createElement(
          P.Item,
          { label: "受保护" },
          B.protected ? "是（内置）" : "否"
        ),
        B.sync_status ? s.createElement(
          P.Item,
          { label: "同步状态" },
          B.sync_status
        ) : null,
        B.installed_from ? s.createElement(
          P.Item,
          { label: "安装来源" },
          B.installed_from
        ) : null
      ),
      // Tags
      B.tags && B.tags.length > 0 ? s.createElement(
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
          ...B.tags.map(
            (q, T) => s.createElement(I, { key: T, color: "cyan" }, q)
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
          `已安装此技能的专家 (${ae.length})`
        ),
        ae.length > 0 ? s.createElement($, {
          size: "small",
          dataSource: ae,
          renderItem: (q) => s.createElement(
            $.Item,
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
              s.createElement(Ke, { name: q, size: 20 }),
              s.createElement(
                D,
                { style: { fontSize: 13 } },
                q
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
      J ? s.createElement(
        "div",
        { style: { marginTop: 16, textAlign: "center" } },
        s.createElement(h, { size: "small" })
      ) : B.content ? s.createElement(
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
          B.content.slice(0, 2e3) + (B.content.length > 2e3 ? `

... (内容已截断)` : "")
        )
      ) : null
    ) : null
  );
}
function ts({
  embedded: e = !1
} = {}) {
  const t = z().React, { useState: n, useEffect: r, useCallback: a, useMemo: l } = t, { Tabs: o, message: i } = z().antd, { ThunderboltOutlined: s, AppstoreOutlined: d } = z().antdIcons || {}, p = z().useSelectedAgent, c = p ? p() : null, m = (c == null ? void 0 : c.id) || "default";
  r(() => {
    jn();
  }, [m]);
  const [h, f] = n([]), [g, E] = n([]), [v, b] = n([]), [w, I] = n(!0), [R, U] = n("agent-skills"), [P, $] = n(0), F = a(async () => {
    I(!0);
    try {
      const [A, H, D] = await Promise.all([
        pn(!0),
        un(),
        Nl()
      ]);
      E(A), f(H), b(D);
    } catch (A) {
      i.error(A.message || "加载技能列表失败"), E([]);
    } finally {
      I(!1);
    }
  }, []);
  r(() => {
    F();
  }, [F]);
  const W = l(() => {
    const A = h.find((H) => H.id === m);
    return (A == null ? void 0 : A.name) || m;
  }, [h, m]), N = a(
    (A) => {
      b(
        (H) => H.some((D) => D.agent_id === m) ? H.map((D) => D.agent_id !== m || D.skill_names.includes(A.name) ? D : {
          ...D,
          skill_names: [...D.skill_names, A.name]
        }) : [
          ...H,
          {
            agent_id: m,
            agent_name: W,
            skill_names: [A.name]
          }
        ]
      ), $((H) => H + 1);
    },
    [m, W]
  ), x = (A) => {
    window.history.pushState({}, "", A), window.dispatchEvent(new PopStateEvent("popstate"));
  }, S = [
    {
      key: "agent-skills",
      label: t.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        s ? t.createElement(s, { style: { fontSize: 14 } }) : null,
        "当前专家"
      ),
      children: t.createElement(Zo, {
        agentId: m,
        agentName: W,
        refreshKey: P,
        onNavigate: x
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
      children: t.createElement(es, {
        poolSkills: g,
        workspaceSkills: v,
        agents: h,
        loading: w,
        onReload: F,
        onSkillInstalled: N,
        agentId: m,
        agentName: W
      })
    }
  ], _ = t.createElement(o, {
    items: S,
    activeKey: R,
    onChange: (A) => U(A)
  });
  return e ? _ : t.createElement(
    "div",
    { style: { padding: 24 } },
    t.createElement(dn, {
      title: "技能",
      subtitle: `技能池共 ${g.length} 个技能 · 当前智能体：${W}`
    }),
    _
  );
}
const zn = {
  reservoir_simulation: "油藏数值模拟",
  geological_modeling: "地质建模",
  well_log_analysis: "测井分析",
  production_engineering: "采油工程",
  post_processing: "后处理与可视化",
  multiphysics: "多物理场仿真"
}, Aa = {
  reservoir_simulation: "🛢️",
  geological_modeling: "🏔️",
  well_log_analysis: "📡",
  production_engineering: "⚙️",
  post_processing: "📊",
  multiphysics: "🔬"
}, za = /* @__PURE__ */ new Set(["cmg", "comsol", "tnavigator", "eclipse", "intersect", "visage"]);
function $a(e) {
  return sn(`/ugsci/engines/icon/${encodeURIComponent(e)}`);
}
async function ns() {
  return de("/ugsci/engines/list");
}
async function rs(e) {
  return de("/ugsci/engines/", {
    method: "POST",
    body: JSON.stringify(e)
  });
}
async function as(e, t) {
  return de(`/ugsci/engines/${encodeURIComponent(e)}`, {
    method: "PUT",
    body: JSON.stringify(t)
  });
}
async function ls(e) {
  return de(
    `/ugsci/engines/${encodeURIComponent(e)}`,
    { method: "DELETE" }
  );
}
async function os() {
  return de("/ugsci/engines/detect/refresh", {
    method: "POST"
  });
}
function ss({
  engine: e,
  onClick: t
}) {
  const n = z().React, { Card: r, Tag: a, Typography: l } = z().antd, { Text: o } = l, i = e.status === "detected", s = Aa[e.category] || "📦", u = za.has(e.id) ? n.createElement("img", {
    src: $a(e.id),
    alt: e.name,
    style: { width: 24, height: 24, objectFit: "contain" }
  }) : n.createElement("span", { style: { fontSize: 20 } }, s);
  return n.createElement(
    r,
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
        u,
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
        i ? n.createElement(
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
        zn[e.category] || e.category
      ) : null,
      e.version ? n.createElement(
        a,
        { color: "blue", style: { fontSize: 11 } },
        `v${e.version}`
      ) : null,
      ...(e.modules || []).map(
        (p) => n.createElement(
          a,
          { key: p, color: "cyan", style: { fontSize: 10 } },
          p
        )
      )
    )
  );
}
function is() {
  const e = z().React, { useState: t, useEffect: n, useCallback: r, useMemo: a } = e, {
    Spin: l,
    Empty: o,
    Button: i,
    message: s,
    Row: d,
    Col: u,
    Drawer: p,
    Descriptions: c,
    Tag: m,
    Typography: h,
    Modal: f,
    Input: g,
    Select: E,
    Popconfirm: v,
    Space: b
  } = z().antd, {
    ReloadOutlined: w,
    SearchOutlined: I,
    PlusOutlined: R,
    EditOutlined: U,
    DeleteOutlined: P,
    CopyOutlined: $,
    ExperimentOutlined: F
  } = z().antdIcons || {}, { Text: W, Paragraph: N } = h, [x, S] = t([]), [_, A] = t(!0), [H, D] = t(""), [j, O] = t(!1), [k, se] = t(null), [oe, B] = t(!1), [L, ae] = t(null), [ne, J] = t({}), [pe, M] = t(!1), ie = r(async () => {
    A(!0);
    try {
      const ee = await ns();
      S(ee.engines || []);
    } catch (ee) {
      s.error(ee.message || "加载引擎列表失败"), S([]);
    } finally {
      A(!1);
    }
  }, []);
  n(() => {
    ie();
  }, [ie]);
  const me = a(() => {
    if (!H.trim()) return x;
    const ee = H.toLowerCase();
    return x.filter(
      (we) => {
        var be;
        return we.name.toLowerCase().includes(ee) || we.vendor.toLowerCase().includes(ee) || we.category.toLowerCase().includes(ee) || ((be = we.description) == null ? void 0 : be.toLowerCase().includes(ee));
      }
    );
  }, [x, H]);
  x.filter((ee) => ee.status === "detected").length;
  const Q = r((ee) => {
    navigator.clipboard.writeText(ee).then(() => s.success("路径已复制")).catch(() => s.error("复制失败"));
  }, []), Z = r(() => {
    ae(null), J({
      name: "",
      vendor: "",
      version: "",
      executable_path: "",
      category: "",
      description: "",
      invocation_hint: ""
    }), B(!0);
  }, []), ce = r((ee) => {
    ae(ee), J({ ...ee }), B(!0), O(!1);
  }, []), Ee = r(async () => {
    var ee;
    if (!((ee = ne.name) != null && ee.trim())) {
      s.warning("请输入引擎名称");
      return;
    }
    M(!0);
    try {
      L ? (await as(L.id, ne), s.success("引擎已更新")) : (await rs(ne), s.success("引擎已添加")), B(!1), ie();
    } catch (we) {
      s.error(we.message || "保存失败");
    } finally {
      M(!1);
    }
  }, [ne, L, ie]), Se = r(
    async (ee) => {
      try {
        await ls(ee), s.success("引擎已删除"), O(!1), ie();
      } catch (we) {
        s.error(we.message || "删除失败");
      }
    },
    [ie]
  ), $e = r(async () => {
    A(!0);
    try {
      const ee = await os();
      S(ee.engines || []), s.success("自动检测完成");
    } catch (ee) {
      s.error(ee.message || "检测失败");
    } finally {
      A(!1);
    }
  }, []), xe = r(
    (ee, we, be) => {
      const te = ne[we] || "";
      return e.createElement(
        "div",
        { style: { marginBottom: 12 } },
        e.createElement(
          W,
          { style: { fontSize: 13, display: "block", marginBottom: 4 } },
          ee
        ),
        be != null && be.select ? e.createElement(E, {
          value: te || void 0,
          onChange: (ue) => J((ge) => ({ ...ge, [we]: ue })),
          style: { width: "100%" },
          options: be.select.options,
          allowClear: !0,
          placeholder: `选择${ee}`
        }) : be != null && be.textarea ? e.createElement(g.TextArea, {
          value: te,
          onChange: (ue) => J((ge) => ({ ...ge, [we]: ue.target.value })),
          rows: 3,
          placeholder: `输入${ee}`
        }) : e.createElement(g, {
          value: te,
          onChange: (ue) => J((ge) => ({ ...ge, [we]: ue.target.value })),
          placeholder: `输入${ee}`
        })
      );
    },
    [ne]
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
        prefix: I ? e.createElement(I) : void 0,
        value: H,
        onChange: (ee) => D(ee.target.value),
        allowClear: !0,
        style: { maxWidth: 280 }
      }),
      e.createElement(
        i,
        {
          icon: w ? e.createElement(w) : void 0,
          onClick: $e,
          loading: _
        },
        "自动检测"
      ),
      e.createElement(
        i,
        {
          type: "primary",
          icon: R ? e.createElement(R) : void 0,
          onClick: Z,
          style: je
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
    ) : me.length === 0 ? e.createElement(o, {
      description: H ? "无匹配引擎" : "暂无引擎，点击「添加引擎」开始"
    }) : e.createElement(
      d,
      { gutter: [12, 12], align: "stretch" },
      ...me.map(
        (ee) => e.createElement(
          u,
          {
            key: ee.id,
            xs: 24,
            sm: 12,
            md: 8,
            lg: 6,
            style: { display: "flex" }
          },
          e.createElement(ss, {
            engine: ee,
            onClick: () => {
              se(ee), O(!0);
            }
          })
        )
      )
    ),
    // Detail drawer
    k ? e.createElement(
      p,
      {
        title: e.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 8 } },
          e.createElement(
            "span",
            { style: { display: "flex", alignItems: "center" } },
            za.has(k.id) ? e.createElement("img", {
              src: $a(k.id),
              alt: k.name,
              style: { width: 20, height: 20, objectFit: "contain" }
            }) : e.createElement(
              "span",
              { style: { fontSize: 18 } },
              Aa[k.category] || "📦"
            )
          ),
          e.createElement("span", null, k.name)
        ),
        open: j,
        onClose: () => O(!1),
        width: 520,
        extra: e.createElement(
          b,
          null,
          e.createElement(
            i,
            {
              size: "small",
              icon: U ? e.createElement(U) : void 0,
              onClick: () => ce(k)
            },
            "编辑"
          ),
          k.is_default ? null : e.createElement(
            v,
            {
              title: "确认删除此引擎？",
              description: k.name,
              onConfirm: () => Se(k.id),
              okText: "删除",
              cancelText: "取消",
              okButtonProps: { danger: !0 }
            },
            e.createElement(
              i,
              {
                size: "small",
                danger: !0,
                icon: P ? e.createElement(P) : void 0
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
          k.name
        ),
        e.createElement(
          c.Item,
          { label: "厂商" },
          k.vendor || "—"
        ),
        e.createElement(
          c.Item,
          { label: "分类" },
          k.category ? zn[k.category] || k.category : "—"
        ),
        e.createElement(
          c.Item,
          { label: "状态" },
          e.createElement(
            m,
            {
              color: k.status === "detected" ? "success" : k.status === "not_found" ? "error" : "default"
            },
            k.status === "detected" ? "✅ 已检测" : k.status === "not_found" ? "❌ 路径无效" : "🔧 待配置"
          )
        ),
        e.createElement(
          c.Item,
          { label: "版本" },
          k.version || "—"
        ),
        k.executable_path ? e.createElement(
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
              k.executable_path
            ),
            e.createElement(
              i,
              {
                size: "small",
                type: "text",
                icon: $ ? e.createElement($) : void 0,
                onClick: () => Q(k.executable_path)
              }
            )
          )
        ) : null,
        k.install_dir ? e.createElement(
          c.Item,
          { label: "安装目录" },
          e.createElement(
            "code",
            { style: { fontSize: 12, wordBreak: "break-all" } },
            k.install_dir
          )
        ) : null,
        // Display detected modules with paths
        k.modules && k.modules.length > 0 ? e.createElement(
          c.Item,
          { label: "已检测模块" },
          e.createElement(
            "div",
            { style: { display: "flex", flexDirection: "column", gap: 4 } },
            ...k.modules.map(
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
                k.module_paths && k.module_paths[ee] ? e.createElement(
                  "code",
                  { style: { fontSize: 11, wordBreak: "break-all" } },
                  k.module_paths[ee]
                ) : null
              )
            )
          )
        ) : null,
        k.license_server ? e.createElement(
          c.Item,
          { label: "许可证服务器" },
          k.license_server
        ) : null,
        e.createElement(
          c.Item,
          { label: "描述" },
          k.description || "—"
        )
      ),
      // Invocation hint
      k.invocation_hint ? e.createElement(
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
          W,
          { strong: !0, style: { fontSize: 13 } },
          "💡 调用方式"
        ),
        e.createElement(
          "div",
          { style: { marginTop: 8, fontSize: 13, lineHeight: 1.6 } },
          k.invocation_hint
        )
      ) : null,
      // Type badge
      e.createElement(
        "div",
        { style: { marginTop: 12 } },
        k.is_default ? e.createElement(
          m,
          { color: "blue" },
          "默认引擎"
        ) : k.is_custom ? e.createElement(
          m,
          { color: "purple" },
          "自定义引擎"
        ) : null
      )
    ) : null,
    // Add/Edit modal
    e.createElement(
      f,
      {
        title: L ? "编辑引擎" : "添加引擎",
        open: oe,
        onOk: Ee,
        onCancel: () => B(!1),
        okText: L ? "保存" : "添加",
        cancelText: "取消",
        confirmLoading: pe,
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
            options: Object.entries(zn).map(([ee, we]) => ({
              label: we,
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
async function cs(e = !1) {
  const t = await de(
    "/ugsci/domain-engines/list",
    e ? { bypassCache: !0 } : void 0
  );
  return (t == null ? void 0 : t.engines) || [];
}
function ds(e = !1) {
  return de(
    "/ugsci/domain-engines/neqsim/runtime",
    e ? { bypassCache: !0 } : void 0
  );
}
function us() {
  return de("/ugsci/domain-engines/neqsim/install", {
    method: "POST"
  });
}
function ms(e) {
  return de(
    `/ugsci/domain-engines/neqsim/install/${encodeURIComponent(e)}`,
    { bypassCache: !0 }
  );
}
async function ps(e, t = !1) {
  const n = await de("/tools", {
    headers: { "X-Agent-Id": e },
    ...t ? { bypassCache: !0 } : {}
  }) || [];
  return new Map(n.map((r) => [r.name, r]));
}
async function fs(e, t = !1) {
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
      const i = await de(
        `/mcp/tools/${encodeURIComponent(o)}`,
        r
      ) || [];
      n.set(o, {
        key: o,
        enabled: !0,
        toolCount: i.filter((s) => s.enabled).length,
        error: null
      });
    } catch (i) {
      n.set(o, {
        key: o,
        enabled: !0,
        toolCount: 0,
        error: i instanceof Error ? i.message : "Tool query failed"
      });
    }
  }
  return n;
}
function Rr(e) {
  return e ? e.overall === "available" ? "available" : e.overall === "unavailable" ? "unavailable" : "unknown" : "unknown";
}
function Lr(e) {
  return e ? e.enabled ? e.error ? "error" : e.toolCount > 0 ? "available" : "error" : "unconfigured" : "unavailable";
}
function gs(e, t = null, n = /* @__PURE__ */ new Map()) {
  const r = e.engine, a = e.dependency_status;
  let l, o, i;
  if (r.provider.kind === "driver")
    a.overall === "unavailable" ? l = "needs_install" : l = Lr(t), o = (t == null ? void 0 : t.toolCount) ?? 0, i = (t == null ? void 0 : t.key) ?? r.provider.id;
  else if (r.source === "builtin") {
    const s = Rr(a), d = r.operations.flatMap((c) => c.tool_names), u = d.filter((c) => n.has(c)), p = u.filter(
      (c) => {
        var m;
        return (m = n.get(c)) == null ? void 0 : m.enabled;
      }
    );
    s !== "available" ? l = s : u.length !== d.length ? l = "error" : p.length === 0 ? l = "unconfigured" : l = "available", o = p.length, i = null;
  } else r.source === "mcp" ? (l = Lr(t), o = (t == null ? void 0 : t.toolCount) ?? 0, i = (t == null ? void 0 : t.key) ?? r.provider.id) : (l = Rr(a), o = 0, i = null);
  return {
    definition: r,
    dependencyStatus: a,
    checkedAt: e.checked_at,
    effectiveStatus: l,
    discoveredToolCount: o,
    mcpProviderKey: i
  };
}
function ys(e) {
  const t = /* @__PURE__ */ new Map();
  for (const n of e) {
    const r = n.definition.domain;
    t.has(r) || t.set(r, []), t.get(r).push(n);
  }
  return t;
}
const $n = {
  available: "可用",
  unavailable: "不可用",
  unknown: "未知",
  needs_install: "待安装",
  unconfigured: "未配置",
  error: "错误"
}, Pn = {
  available: "success",
  unavailable: "error",
  unknown: "default",
  needs_install: "warning",
  unconfigured: "warning",
  error: "error"
}, hs = {
  geology_well_logging: "📡",
  production_engineering: "⚙️",
  fluid_thermodynamics: "🧪",
  scientific_computing: "🧮",
  data_modeling: "📊"
}, Es = {
  builtin: "内置",
  mcp: "MCP",
  library: "计算库"
}, bs = {
  deterministic: "确定性",
  stochastic: "随机/概率",
  external: "外部 Provider",
  visualization: "可视化"
}, vs = {
  deterministic: "green",
  stochastic: "purple",
  external: "blue",
  visualization: "cyan"
};
function ws({
  view: e,
  onClick: t
}) {
  const n = z().React, { Card: r, Tag: a, Typography: l } = z().antd, { Text: o } = l, i = e.definition, s = hs[i.domain] || "📦", d = e.effectiveStatus, u = i.operations.length, p = e.discoveredToolCount;
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
        n.createElement("span", { style: { fontSize: 20 } }, s),
        n.createElement(
          "div",
          null,
          n.createElement(
            o,
            { strong: !0, style: { fontSize: 14 } },
            i.name
          ),
          n.createElement("br"),
          n.createElement(
            o,
            { type: "secondary", style: { fontSize: 11 } },
            i.provider.kind === "driver" ? "内置 · MCP" : Es[i.source] || i.source
          )
        )
      ),
      n.createElement(
        a,
        { color: Pn[d] || "default", style: { fontSize: 11 } },
        $n[d] || d
      )
    ),
    n.createElement(
      "div",
      { style: { flex: 1, minHeight: 32 } },
      n.createElement(
        o,
        { type: "secondary", style: { fontSize: 12 } },
        i.description
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
        `${u} 操作`
      ),
      n.createElement(
        a,
        {
          color: vs[i.execution_class] || "default",
          style: { fontSize: 11 }
        },
        bs[i.execution_class] || i.execution_class
      ),
      p > 0 ? n.createElement(
        a,
        { color: "blue", style: { fontSize: 11 } },
        `${p} 工具`
      ) : null,
      ...(i.tags || []).map(
        (c) => n.createElement(
          a,
          { key: c, color: "cyan", style: { fontSize: 10 } },
          c
        )
      )
    )
  );
}
function Ss({
  view: e,
  open: t,
  onClose: n,
  onNavigateToMcp: r,
  onNavigateToTools: a,
  onNavigateToSkills: l,
  onInstallNeqsim: o,
  neqsimInstallState: i
}) {
  const s = z().React, { Drawer: d, Descriptions: u, Tag: p, Typography: c, Button: m, Space: h, Divider: f } = z().antd, { Text: g, Paragraph: E } = c;
  if (!e) return null;
  const v = e.definition, b = e.dependencyStatus;
  return s.createElement(
    d,
    {
      title: s.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 8 } },
        s.createElement("span", null, v.name),
        s.createElement(
          p,
          {
            color: Pn[e.effectiveStatus] || "default",
            style: { fontSize: 11 }
          },
          $n[e.effectiveStatus] || e.effectiveStatus
        )
      ),
      open: t,
      onClose: n,
      width: 560,
      rootClassName: "ugsci-domain-engine-detail-drawer"
    },
    // Overview
    s.createElement(
      u,
      { column: 1, bordered: !0, size: "small" },
      s.createElement(
        u.Item,
        { label: "领域" },
        v.domain
      ),
      s.createElement(
        u.Item,
        { label: "来源" },
        v.provider.kind === "driver" ? "内置能力 · MCP Driver" : v.source === "builtin" ? "内置工具" : v.source === "mcp" ? "MCP 服务" : "科学计算库 / 技能"
      ),
      s.createElement(
        u.Item,
        { label: "实现" },
        `${v.provider.kind}:${v.provider.id}`
      ),
      s.createElement(
        u.Item,
        { label: "计算类别" },
        v.execution_class === "deterministic" ? "确定性计算" : v.execution_class === "stochastic" ? "随机/概率计算" : v.execution_class === "external" ? "外部 Provider" : "可视化"
      ),
      s.createElement(
        u.Item,
        { label: "内核版本" },
        v.engine_version
      ),
      s.createElement(
        u.Item,
        { label: "描述" },
        v.description
      ),
      s.createElement(
        u.Item,
        { label: "检测时间" },
        e.checkedAt
      )
    ),
    // Operations
    s.createElement(
      "div",
      { style: { marginTop: 16, marginBottom: 8 } },
      s.createElement(g, { strong: !0 }, "领域操作")
    ),
    ...v.operations.map(
      (w) => s.createElement(
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
        s.createElement(
          "div",
          null,
          s.createElement(g, { strong: !0, style: { fontSize: 13 } }, w.name),
          s.createElement(
            g,
            { type: "secondary", style: { fontSize: 11, marginLeft: 8 } },
            w.id
          )
        ),
        s.createElement(
          g,
          { type: "secondary", style: { fontSize: 12 } },
          w.description
        ),
        w.tool_names.length > 0 ? s.createElement(
          "div",
          { style: { marginTop: 4, display: "flex", gap: 4, flexWrap: "wrap" } },
          ...w.tool_names.map(
            (I) => s.createElement(
              p,
              { key: I, color: "blue", style: { fontSize: 10 } },
              I
            )
          )
        ) : null
      )
    ),
    // Dependencies
    s.createElement(f, null),
    s.createElement(g, { strong: !0 }, "实现与依赖"),
    b && b.dependencies.length > 0 ? s.createElement(
      "div",
      { style: { marginTop: 8 } },
      ...b.dependencies.map(
        (w) => s.createElement(
          "div",
          {
            key: w.name,
            style: {
              padding: "8px 0",
              borderBottom: "1px solid var(--ant-color-border-secondary, #f0f0f0)"
            }
          },
          s.createElement(
            "div",
            {
              style: {
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }
            },
            s.createElement(g, { style: { fontSize: 13 } }, w.name),
            s.createElement(
              p,
              {
                color: Pn[w.status] || "default",
                style: { fontSize: 11 }
              },
              $n[w.status] || w.status
            )
          ),
          w.status !== "available" && w.reason ? s.createElement(
            g,
            { type: "secondary", style: { display: "block", fontSize: 12, marginTop: 4 } },
            w.reason
          ) : null,
          w.status !== "available" && w.install_hint ? s.createElement(
            g,
            { style: { display: "block", fontSize: 12, marginTop: 4 } },
            `安装：${w.install_hint}`
          ) : null,
          w.status !== "available" && w.enable_hint ? s.createElement(
            g,
            { style: { display: "block", fontSize: 12, marginTop: 2 } },
            `启用：${w.enable_hint}`
          ) : null
        )
      )
    ) : s.createElement(
      E,
      { type: "secondary", style: { fontSize: 12 } },
      "无外部依赖"
    ),
    // Actions
    s.createElement(f, null),
    s.createElement(g, { strong: !0 }, "问题处理"),
    s.createElement(
      "div",
      { style: { marginTop: 8, display: "flex", gap: 8, flexWrap: "wrap" } },
      v.id === "neqsim" && e.effectiveStatus === "needs_install" ? s.createElement(
        m,
        {
          size: "small",
          type: "primary",
          loading: (i == null ? void 0 : i.status) === "queued" || (i == null ? void 0 : i.status) === "running",
          onClick: o
        },
        (i == null ? void 0 : i.status) === "running" ? `${i.message} (${i.progress}%)` : "安装 NeqSim 运行环境"
      ) : null,
      v.provider.kind === "driver" ? s.createElement(
        m,
        { size: "small", onClick: r },
        "查看内置 MCP Driver"
      ) : v.source === "library" ? s.createElement(
        m,
        { size: "small", onClick: l },
        "查看相关技能"
      ) : s.createElement(
        m,
        { size: "small", onClick: () => a("builtin") },
        "查看内置工具"
      )
    ),
    v.id === "neqsim" && (i == null ? void 0 : i.status) === "failed" ? s.createElement(
      E,
      { type: "danger", style: { marginTop: 8, fontSize: 12 } },
      i.error || "安装失败"
    ) : null,
    v.id === "neqsim" && (i != null && i.warning) ? s.createElement(
      E,
      { type: "warning", style: { marginTop: 8, fontSize: 12 } },
      i.warning
    ) : null
  );
}
const xs = {
  geology_well_logging: "测井地质",
  production_engineering: "采油工程",
  fluid_thermodynamics: "流体热力学",
  scientific_computing: "科学计算",
  data_modeling: "数据建模"
};
function ks(e) {
  return e instanceof Error ? /Install task not found|HTTP 404/i.test(e.message) : !1;
}
function Cs({
  onNavigateToMcp: e,
  onNavigateToTools: t,
  onNavigateToSkills: n
} = {}) {
  var ie, me;
  const r = z().React, { useState: a, useEffect: l, useCallback: o, useMemo: i, useRef: s } = r, {
    Spin: d,
    Empty: u,
    Button: p,
    message: c,
    Row: m,
    Col: h,
    Input: f,
    Drawer: g,
    Typography: E
  } = z().antd, { ReloadOutlined: v, SearchOutlined: b } = z().antdIcons || {}, { Text: w } = E, I = (me = (ie = z()).useSelectedAgent) == null ? void 0 : me.call(ie), R = (I == null ? void 0 : I.id) || "default", [U, P] = a([]), [$, F] = a(!0), [W, N] = a(""), [x, S] = a(!1), [_, A] = a(null), [H, D] = a(null), j = s(R);
  j.current = R;
  const O = s(_);
  O.current = _;
  const k = s(0);
  l(() => () => {
    k.current += 1;
  }, []);
  const se = o(
    async (Q = !1, Z = !1) => {
      var $e, xe;
      Z || F(!0);
      const ce = Z && typeof window < "u" ? {
        x: window.scrollX,
        y: window.scrollY,
        drawerBody: typeof document < "u" ? document.querySelector(
          ".ugsci-domain-engine-detail-drawer .ant-drawer-body"
        ) : null,
        drawerTop: typeof document < "u" && (($e = document.querySelector(
          ".ugsci-domain-engine-detail-drawer .ant-drawer-body"
        )) == null ? void 0 : $e.scrollTop) || 0
      } : null, Ee = () => {
        if (!ce || typeof window > "u") return;
        const ee = () => {
          var we;
          window.scrollTo(ce.x, ce.y), (we = ce.drawerBody) != null && we.isConnected && (ce.drawerBody.scrollTop = ce.drawerTop);
        };
        typeof window.requestAnimationFrame == "function" ? window.requestAnimationFrame(ee) : ee();
      }, Se = j.current;
      try {
        const [ee, we, be] = await Promise.all([
          cs(Q),
          fs(Se, Q),
          ps(Se, Q)
        ]);
        if (Se !== j.current) return;
        const te = [];
        for (const ge of ee)
          try {
            let K = null;
            if (ge.engine.provider.kind === "driver") {
              const C = ge.engine.provider.id;
              K = we.get(C) || null;
            }
            te.push(gs(ge, K, be));
          } catch {
          }
        P(te);
        const ue = (xe = O.current) == null ? void 0 : xe.definition.id;
        if (ue) {
          const ge = te.find(
            (K) => K.definition.id === ue
          );
          ge && (O.current = ge, A(ge));
        }
        Ee();
      } catch (ee) {
        const we = ee instanceof Error ? ee.message : "加载领域引擎失败";
        c.error(we), Z || P([]);
      } finally {
        Z || F(!1);
      }
    },
    []
  );
  l(() => {
    se();
  }, [R, se]);
  const oe = i(() => {
    if (!W.trim()) return U;
    const Q = W.toLowerCase();
    return U.filter(
      (Z) => Z.definition.name.toLowerCase().includes(Q) || Z.definition.domain.toLowerCase().includes(Q) || Z.definition.description.toLowerCase().includes(Q) || Z.definition.tags.some((ce) => ce.toLowerCase().includes(Q))
    );
  }, [U, W]), B = i(
    () => ys(oe),
    [oe]
  ), L = o(() => {
    se(!0);
  }, [se]), ae = o((Q) => {
    O.current = Q, A(Q), S(!0);
  }, []), ne = o(() => {
    S(!1), e == null || e();
  }, [e]), J = o(
    (Q) => {
      S(!1), t == null || t(Q);
    },
    [t]
  ), pe = o(() => {
    S(!1), n == null || n();
  }, [n]), M = o(async () => {
    const Q = ++k.current, Z = () => Q === k.current;
    try {
      let ce = await us();
      if (!Z()) return;
      for (D(ce); ce.status === "queued" || ce.status === "running"; ) {
        if (await new Promise((Ee) => setTimeout(Ee, 1e3)), !Z()) return;
        try {
          ce = await ms(ce.id);
        } catch (Ee) {
          if (!ks(Ee)) throw Ee;
          const Se = await ds(!0);
          if (!Z()) return;
          Se.ready ? ce = {
            ...ce,
            status: "completed",
            progress: 100,
            message: "后端重启后已恢复 NeqSim 运行环境状态",
            error: "",
            runtime: Se,
            recovered: !0
          } : ce = {
            ...ce,
            status: "failed",
            message: "安装进程因后端重启中断",
            error: "后端重启后未发现完整的 NeqSim 运行环境，请重新安装",
            runtime: Se,
            recovered: !0
          };
        }
        if (!Z()) return;
        D(ce);
      }
      if (!Z()) return;
      ce.status === "completed" ? (ce.warning ? c.warning(ce.warning) : c.success("NeqSim 运行环境已安装并启用"), await se(!0, !0)) : c.error(ce.error || "NeqSim 安装失败");
    } catch (ce) {
      if (!Z()) return;
      c.error(ce instanceof Error ? ce.message : "NeqSim 安装失败");
    }
  }, [se]);
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
      r.createElement(f, {
        placeholder: "搜索领域引擎...",
        prefix: b ? r.createElement(b) : void 0,
        value: W,
        onChange: (Q) => N(Q.target.value),
        allowClear: !0,
        style: { maxWidth: 280 }
      }),
      r.createElement(
        p,
        {
          icon: v ? r.createElement(v) : void 0,
          onClick: L,
          loading: $
        },
        "刷新"
      )
    ),
    // Content
    $ ? r.createElement(
      "div",
      { style: { textAlign: "center", padding: 60 } },
      r.createElement(d, {
        size: "large",
        tip: "正在加载领域引擎..."
      })
    ) : oe.length === 0 ? r.createElement(u, {
      description: W ? "无匹配引擎" : "暂无领域引擎"
    }) : r.createElement(
      "div",
      null,
      ...Array.from(B.entries()).map(
        ([Q, Z]) => r.createElement(
          "div",
          { key: Q, style: { marginBottom: 20 } },
          r.createElement(
            w,
            {
              strong: !0,
              style: {
                fontSize: 14,
                display: "block",
                marginBottom: 8
              }
            },
            xs[Q] || Q
          ),
          r.createElement(
            m,
            { gutter: [12, 12], align: "stretch" },
            ...Z.map(
              (ce) => r.createElement(
                h,
                {
                  key: ce.definition.id,
                  xs: 24,
                  sm: 12,
                  md: 8,
                  lg: 6,
                  style: { display: "flex" }
                },
                r.createElement(ws, {
                  view: ce,
                  onClick: () => ae(ce)
                })
              )
            )
          )
        )
      )
    ),
    // Detail drawer
    r.createElement(Ss, {
      view: _,
      open: x,
      onClose: () => S(!1),
      onNavigateToMcp: ne,
      onNavigateToTools: J,
      onNavigateToSkills: pe,
      onInstallNeqsim: M,
      neqsimInstallState: H
    })
  );
}
const Ts = ts, Pa = /* @__PURE__ */ new Set(["tools", "engines", "skills"]);
function _s(e) {
  try {
    const t = new URLSearchParams(window.location.search).get("tab");
    return t && Pa.has(t) ? t : e;
  } catch {
    return e;
  }
}
function Br(e) {
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
function On({ page: e }) {
  const t = z().React, { useEffect: n, useState: r } = t, { Alert: a, Spin: l } = z().antd, [o, i] = r(null), [s, d] = r("");
  if (n(() => {
    let p = !0;
    const c = z().loadBuiltinPage;
    return i(null), c ? (d(""), c(e).then((m) => {
      p && i(() => m);
    }).catch((m) => {
      p && d(
        m instanceof Error ? m.message : "加载原生管理页面失败"
      );
    }), () => {
      p = !1;
    }) : (d("当前 QwenPaw 版本不支持原生页面嵌入"), () => {
      p = !1;
    });
  }, [e]), s)
    return t.createElement(a, {
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
  const u = e === "mcp" ? {
    title: "UGSci MCP",
    description: "连接外部工具、数据服务与计算能力，扩展当前专家的可调用范围",
    managedTitle: "已接入服务",
    managedDescription: "启用后可由当前专家调用，并可按工具配置访问权限",
    create: "接入 MCP 服务"
  } : void 0;
  return t.createElement(o, { embedded: !0, embeddedLabels: u });
}
function Is({
  activeSubTab: e,
  onSubTabChange: t
}) {
  const n = z().React, { Tabs: r } = z().antd;
  return n.createElement(r, {
    activeKey: e,
    onChange: t,
    items: [
      {
        key: "mcp",
        label: "MCP 接入",
        children: n.createElement(On, { page: "mcp" })
      },
      {
        key: "builtin",
        label: "平台内置",
        children: n.createElement(On, { page: "tools" })
      }
    ]
  });
}
function As({
  onNavigateToMcp: e,
  onNavigateToTools: t,
  onNavigateToSkills: n
} = {}) {
  const r = z().React, { Tabs: a } = z().antd;
  return r.createElement(a, {
    defaultActiveKey: "simulation",
    items: [
      {
        key: "simulation",
        label: "仿真软件",
        children: r.createElement(is)
      },
      {
        key: "domain",
        label: "领域计算",
        children: r.createElement(
          Cs,
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
        children: r.createElement(On, { page: "acp" })
      }
    ]
  });
}
function Oa({
  initialTab: e = "engines"
} = {}) {
  var E, v;
  const t = z().React, { useEffect: n, useState: r } = t, { Tabs: a, Tag: l } = z().antd, { RocketOutlined: o, ToolOutlined: i, ThunderboltOutlined: s } = z().antdIcons || {}, d = (v = (E = z()).useSelectedAgent) == null ? void 0 : v.call(E), u = (d == null ? void 0 : d.id) || "default", [p, c] = r(
    () => _s(e)
  ), [m, h] = r("mcp");
  n(() => {
    try {
      const b = new URLSearchParams(window.location.search).get("tab");
      b && !Pa.has(b) && Br(p);
    } catch {
    }
  }, [p]);
  const f = (b) => {
    c(b), Br(b);
  }, g = (b, w) => t.createElement(
    "span",
    { style: { display: "inline-flex", alignItems: "center", gap: 6 } },
    w ? t.createElement(w, { style: { fontSize: 14 } }) : null,
    b
  );
  return t.createElement(
    "div",
    { style: { padding: 24 } },
    t.createElement(dn, {
      title: "工具·技能",
      subtitle: "管理当前专家可调用的引擎、工具、运行服务与专业技能",
      extra: t.createElement(
        l,
        { color: "blue" },
        `当前专家：${u}`
      )
    }),
    t.createElement(a, {
      activeKey: p,
      onChange: (b) => f(b),
      items: [
        {
          key: "engines",
          label: g("引擎", o),
          children: t.createElement(
            As,
            {
              onNavigateToMcp: () => {
                h("mcp"), f("tools");
              },
              onNavigateToTools: (b) => {
                h(b || "mcp"), f("tools");
              },
              onNavigateToSkills: () => f("skills")
            }
          )
        },
        {
          key: "tools",
          label: g("工具", i),
          children: t.createElement(Is, {
            activeSubTab: m,
            onSubTabChange: h
          })
        },
        {
          key: "skills",
          label: g("技能", s),
          children: t.createElement(Ts, {
            embedded: !0
          })
        }
      ]
    })
  );
}
const Ma = Oa;
function zs() {
  return z().React.createElement(Ma, {
    initialTab: "tools"
  });
}
function $s() {
  return z().React.createElement(Ma, {
    initialTab: "skills"
  });
}
const Ur = {
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
function Ps(e) {
  if (!e.env) return !1;
  const t = Object.entries(e.env);
  return t.length === 0 ? !1 : t.some(([, n]) => typeof n == "string" && n.length > 0);
}
const Qt = "ugsci.market.githubSources", jr = "https://github.com/anthropics/skills/tree/main/skills", Ra = "https://ugsci-awesome-tools.oss-cn-beijing.aliyuncs.com", Os = `${Ra}/skills`;
function Ms(e) {
  const t = e.replace(/^\/+/, "");
  return sn(`/plugins/oss-proxy?path=${encodeURIComponent(t)}`);
}
function tn(e) {
  const t = e.replace(/^\/+/, "");
  return Qe(`/plugins/oss-proxy?path=${encodeURIComponent(t)}`);
}
async function qn(e) {
  const t = e.replace(/^\/+/, ""), n = await tn(t);
  if (!n.ok)
    throw new Error(`OSS fetch failed (${n.status}): ${t}`);
  return await n.json();
}
function yt(e) {
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
function Rs(e) {
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
    iconUrl: e.icon_url ? Ms(e.icon_url) : void 0,
    category: e.category ? yt(e.category) : "",
    description: e.description,
    transport: e.transport || "stdio",
    command: ((a = e.config) == null ? void 0 : a.command) || "",
    args: ((l = e.config) == null ? void 0 : l.args) || [],
    env: Object.keys(t).length > 0 ? t : void 0
  };
}
const La = "ugsci.market.mcpSources", Ba = "ugsci.market.expertSources";
function Ua(e, t) {
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
function ja(e, t) {
  try {
    localStorage.setItem(e, JSON.stringify(t));
  } catch {
  }
}
function Ls() {
  return Ua(La, "mcp");
}
function Wt(e) {
  ja(La, e);
}
function Bs() {
  return Ua(Ba, "expert");
}
function Vt(e) {
  ja(Ba, e);
}
function Na(e) {
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
    let i = "main", s = "";
    return a.length >= 4 && (a[2] === "tree" || a[2] === "blob") ? (i = decodeURIComponent(a[3]), a.length > 4 && (s = a.slice(4).map(decodeURIComponent).join("/"))) : a.length > 2 && (s = a.slice(2).map(decodeURIComponent).join("/")), s = s.replace(/\/+$/, "").replace(/^\/+/, ""), {
      owner: l,
      repo: o,
      ref: i || "main",
      skillsPath: s,
      label: `${l}/${o}`,
      platform: r
    };
  } catch {
    return null;
  }
}
function Fa(e, t, n, r = "github") {
  return r === "oss" ? `oss:${e}/${n || "/"}` : `${r}:${e}/${t}:${n || "/"}`;
}
function Us(e) {
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
function js() {
  try {
    const e = localStorage.getItem(Qt);
    if (!e) {
      const r = [], a = Na(jr);
      return a && r.push({
        id: Fa(
          a.owner,
          a.repo,
          a.skillsPath,
          a.platform
        ),
        url: jr,
        label: a.label,
        owner: a.owner,
        repo: a.repo,
        ref: a.ref,
        skillsPath: a.skillsPath,
        enabled: !1,
        platform: a.platform
      }), localStorage.setItem(Qt, JSON.stringify(r)), r;
    }
    const t = JSON.parse(e);
    if (!Array.isArray(t)) return [];
    const n = t.filter(
      (r) => r && typeof r.id == "string" && (typeof r.owner == "string" || r.platform === "oss") && !(r.platform === "oss" && r.url === Os)
    ).map((r) => ({
      ...r,
      platform: r.platform || "github",
      owner: r.owner || "",
      repo: r.repo || "",
      ref: r.ref || "",
      skillsPath: r.skillsPath || ""
    }));
    return n.length !== t.length && localStorage.setItem(
      Qt,
      JSON.stringify(n)
    ), n;
  } catch {
    return [];
  }
}
function qt(e) {
  try {
    localStorage.setItem(
      Qt,
      JSON.stringify(e)
    );
  } catch {
  }
}
function Ns(e) {
  const t = e.match(/^---\s*\n([\s\S]*?)\n---/);
  if (!t) return {};
  const n = t[1], r = {}, a = n.split(`
`);
  let l = "";
  for (const o of a) {
    const i = o.match(/^(\w[\w-]*)\s*:\s*(.*)$/);
    if (i) {
      l = i[1];
      let s = i[2].trim();
      (s.startsWith('"') && s.endsWith('"') || s.startsWith("'") && s.endsWith("'")) && (s = s.slice(1, -1)), l === "name" ? r.name = s : l === "description" ? r.description = s : l === "version" ? r.version = s : l === "author" && (r.author = s);
    }
  }
  return r;
}
async function Fs(e) {
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
  const i = o.filter(
    (d) => d.type === "dir" && d.name
  );
  return await Promise.all(
    i.map(async (d) => {
      const u = e.skillsPath ? e.skillsPath + "/" : "", p = t ? `https://gitee.com/${e.owner}/${e.repo}/raw/${e.ref}/${u}${d.name}/SKILL.md` : `https://raw.githubusercontent.com/${e.owner}/${e.repo}/${e.ref}/${u}${d.name}/SKILL.md`, c = t ? `https://gitee.com/${e.owner}/${e.repo}/tree/${e.ref}/${u}${d.name}` : `https://github.com/${e.owner}/${e.repo}/tree/${e.ref}/${u}${d.name}`, m = {
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
        const h = {};
        t && e.accessToken && (h.Authorization = `token ${e.accessToken}`);
        const f = await fetch(p, {
          headers: h
        });
        if (!f.ok) return m;
        const g = await f.text(), E = Ns(g);
        return {
          ...m,
          name: E.name || d.name,
          description: E.description || "",
          version: E.version || null,
          author: E.author || null
        };
      } catch {
        return m;
      }
    })
  );
}
async function Ds(e) {
  const t = Us(e.url);
  if (!t)
    throw new Error(`Invalid OSS URL: ${e.url}`);
  const { endpoint: n, prefix: r } = t, a = r.split("/").map(encodeURIComponent).join("/"), l = await tn(
    `${a}/manifest.json`
  );
  if (!l.ok)
    throw new Error(
      `无法获取技能列表: manifest.json (${l.status})`
    );
  const o = await l.json(), i = [];
  if (o && o.tag_groups && typeof o.tag_groups == "object")
    for (const [u, p] of Object.entries(o.tag_groups))
      Array.isArray(p) && i.push({
        id: u,
        label: yt(u),
        tags: p
      });
  const s = [];
  function d(u, p) {
    for (const c of u) {
      if (c.type === "collection" && Array.isArray(c.children)) {
        d(c.children, c.name);
        continue;
      }
      const m = c.path || c.name || "";
      if (!m) continue;
      const h = m.split("/").map(encodeURIComponent).join("/"), f = `${n}/${a}/${h}`;
      let g = null;
      if (c.metadata) {
        const v = c.metadata.match(/version:\s*"?([\d.]+)"?/);
        v && (g = v[1]);
      }
      const E = p ? `${e.label}/${p}` : e.label;
      s.push({
        sourceId: e.id,
        sourceLabel: e.label,
        sourcePath: E,
        name: c.name || m.split("/").pop() || m,
        description: c.description || "",
        source_url: f,
        html_url: f,
        version: g,
        author: null,
        tag: c.tag || void 0,
        isOfficial: !0
      });
    }
  }
  if (Array.isArray(o) ? d(
    o.map(
      (u) => typeof u == "string" ? { name: u, path: u } : u
    )
  ) : o && Array.isArray(o.skills) && d(o.skills), s.length === 0)
    throw new Error(
      `manifest.json 中未找到技能。请检查 ${e.url}/manifest.json`
    );
  return { skills: s, categories: i };
}
async function Gs() {
  const e = await qn("mcp/manifest.json"), t = [], n = {};
  if (e.tag_groups && typeof e.tag_groups == "object")
    for (const [a, l] of Object.entries(e.tag_groups))
      Array.isArray(l) && (n[a] = l, t.push({
        id: a,
        label: yt(a),
        tags: l
      }));
  return { servers: (e.servers || []).map((a) => {
    let l = "";
    const o = a.tags || [];
    for (const [i, s] of Object.entries(n))
      if (s.some((d) => o.includes(d))) {
        l = i;
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
async function Hs() {
  const e = await qn("skills/manifest.json"), t = [], n = /* @__PURE__ */ new Set();
  function r(a, l) {
    for (const o of a) {
      if ((o == null ? void 0 : o.type) === "collection" && Array.isArray(o.children)) {
        r(o.children, o.name || l);
        continue;
      }
      const i = String((o == null ? void 0 : o.path) || (o == null ? void 0 : o.name) || "").trim();
      if (!i) continue;
      const s = i.split("/").map(encodeURIComponent).join("/"), d = `${Ra}/skills/${s}`, u = typeof o.tag == "string" && o.tag.trim() ? o.tag.trim() : void 0;
      u && n.add(u);
      let p = null;
      if (typeof o.metadata == "string") {
        const c = o.metadata.match(/version:\s*"?([\d.]+)"?/);
        c && (p = c[1]);
      }
      t.push({
        sourceId: "oss:ugsci-official",
        sourceLabel: "UGSci",
        sourcePath: l ? `UGSci/${l}` : "UGSci",
        name: o.name || i.split("/").pop() || i,
        description: o.description || "",
        source_url: d,
        html_url: d,
        version: p,
        author: null,
        tag: u,
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
async function Ws() {
  const e = await qn("agents/manifest.json"), t = [], n = {};
  if (e.tag_groups && typeof e.tag_groups == "object")
    for (const [a, l] of Object.entries(e.tag_groups))
      Array.isArray(l) && (n[a] = l, t.push({
        id: a,
        label: yt(a),
        tags: l
      }));
  return { agents: (e.agents || []).map((a) => {
    let l = "";
    const o = a.tags || [];
    for (const [i, s] of Object.entries(n))
      if (s.some((d) => o.includes(d))) {
        l = i;
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
async function Vs(e) {
  const t = e.filter((o) => o.enabled), n = await Promise.all(
    t.map(async (o) => {
      try {
        if (o.platform === "oss") {
          const { skills: i, categories: s } = await Ds(o);
          return { skills: i, categories: s, error: null, label: o.label };
        } else
          return { skills: await Fs(o), categories: [], error: null, label: o.label };
      } catch (i) {
        return {
          skills: [],
          categories: [],
          error: i.message || String(i),
          label: o.label
        };
      }
    })
  ), r = [], a = [], l = [];
  for (const o of n)
    r.push(...o.skills), a.push(...o.categories), o.error && l.push({ label: o.label, message: o.error });
  return { skills: r, errors: l, categories: a };
}
function qs({
  open: e,
  onClose: t,
  sources: n,
  onChange: r
}) {
  const a = z().React, { useState: l } = a, {
    Modal: o,
    Input: i,
    Button: s,
    List: d,
    Tag: u,
    Switch: p,
    Typography: c,
    Tooltip: m,
    message: h
  } = z().antd, {
    PlusOutlined: f,
    DeleteOutlined: g,
    LinkOutlined: E,
    GithubOutlined: v
  } = z().antdIcons || {}, { Text: b } = c, [w, I] = l(""), [R, U] = l(""), P = () => {
    const N = w.trim();
    if (!N) return;
    const x = Na(N);
    if (!x) {
      h.error("无效的仓库 URL，请输入类似 https://github.com/owner/repo/tree/main/skills 或 https://gitee.com/owner/repo/tree/master/skills 的链接");
      return;
    }
    const S = Fa(x.owner, x.repo, x.skillsPath, x.platform);
    if (n.some((H) => H.id === S)) {
      h.warning("该源已存在");
      return;
    }
    const _ = {
      id: S,
      url: N,
      label: x.label,
      owner: x.owner,
      repo: x.repo,
      ref: x.ref,
      skillsPath: x.skillsPath,
      enabled: !0,
      platform: x.platform,
      accessToken: R.trim() || void 0
    }, A = [...n, _];
    qt(A), r(A), I(""), U(""), h.success(`已添加源: ${x.label}`);
  }, $ = (N, x) => {
    const S = n.map(
      (_) => _.id === N ? { ..._, enabled: x } : _
    );
    qt(S), r(S);
  }, F = (N, x) => {
    const S = n.map(
      (_) => _.id === N ? { ..._, accessToken: x.trim() || void 0 } : _
    );
    qt(S), r(S);
  }, W = (N) => {
    const x = n.filter((S) => S.id !== N);
    qt(x), r(x), h.success("已移除源");
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
        s,
        { onClick: t },
        "关闭"
      ),
      width: 640
    },
    a.createElement(
      "div",
      { style: { marginBottom: 16 } },
      a.createElement(
        b,
        { type: "secondary", style: { fontSize: 12, display: "block", marginBottom: 8 } },
        "添加 GitHub 或 Gitee 仓库作为技能源，系统将从该仓库的指定目录获取技能列表。支持格式："
      ),
      a.createElement(
        "div",
        { style: { display: "flex", gap: 8, alignItems: "center" } },
        a.createElement(i, {
          placeholder: "https://github.com/owner/repo/tree/main/skills 或 https://gitee.com/owner/repo/tree/master/skills",
          value: w,
          onChange: (N) => I(N.target.value),
          onPressEnter: P,
          prefix: E ? a.createElement(E) : void 0,
          style: { flex: 1 }
        }),
        a.createElement(
          s,
          {
            type: "primary",
            icon: f ? a.createElement(f) : void 0,
            onClick: P
          },
          "添加"
        )
      ),
      // Gitee token input (shown when URL looks like a Gitee link)
      w.trim() && w.trim().toLowerCase().includes("gitee.com") ? a.createElement(
        "div",
        { style: { marginTop: 8, display: "flex", gap: 8, alignItems: "center" } },
        a.createElement(
          b,
          { type: "secondary", style: { fontSize: 12, whiteSpace: "nowrap" } },
          "Gitee Token:"
        ),
        a.createElement(i.Password, {
          placeholder: "私有仓库请填写 Gitee 私人令牌（可选）",
          value: R,
          onChange: (N) => U(N.target.value),
          style: { flex: 1 }
        })
      ) : null
    ),
    a.createElement(
      "div",
      { style: { marginBottom: 8, display: "flex", alignItems: "center", justifyContent: "space-between" } },
      a.createElement(b, { strong: !0 }, `已配置源 (${n.length})`)
    ),
    a.createElement(d, {
      size: "small",
      bordered: !0,
      dataSource: n,
      renderItem: (N) => a.createElement(
        d.Item,
        {
          actions: [
            a.createElement(
              m,
              { title: N.enabled ? "点击禁用" : "点击启用" },
              a.createElement(p, {
                size: "small",
                checked: N.enabled,
                onChange: (x) => $(N.id, x)
              })
            ),
            a.createElement(
              m,
              { title: "移除此源" },
              a.createElement(
                s,
                {
                  size: "small",
                  type: "text",
                  danger: !0,
                  icon: g ? a.createElement(g) : void 0,
                  onClick: () => W(N.id)
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
              u,
              { color: N.platform === "gitee" ? "orange" : N.platform === "oss" ? "green" : "blue", style: { fontSize: 11 } },
              N.platform === "gitee" ? "Gitee" : N.platform === "oss" ? "OSS" : "GitHub"
            ),
            a.createElement(
              u,
              { style: { fontSize: 11 } },
              N.label
            ),
            N.skillsPath ? a.createElement(
              b,
              { type: "secondary", style: { fontSize: 11 } },
              `/${N.skillsPath}`
            ) : null,
            N.platform !== "oss" ? a.createElement(
              b,
              { type: "secondary", style: { fontSize: 11 } },
              `@${N.ref}`
            ) : null
          ),
          a.createElement(
            b,
            {
              type: "secondary",
              style: { fontSize: 11, wordBreak: "break-all" }
            },
            N.url
          ),
          // Gitee token input for existing Gitee sources
          N.platform === "gitee" ? a.createElement(
            "div",
            { style: { marginTop: 6, display: "flex", gap: 6, alignItems: "center" } },
            a.createElement(
              b,
              { type: "secondary", style: { fontSize: 11, whiteSpace: "nowrap" } },
              "Token:"
            ),
            a.createElement(i.Password, {
              size: "small",
              placeholder: "Gitee 私人令牌（可选，用于私有仓库）",
              value: N.accessToken || "",
              onChange: (x) => F(N.id, x.target.value),
              style: { flex: 1 }
            })
          ) : null
        )
      )
    })
  );
}
function Nr({
  open: e,
  onClose: t,
  sources: n,
  onChange: r,
  type: a
}) {
  const l = z().React, { useState: o } = l, {
    Modal: i,
    Input: s,
    Button: d,
    List: u,
    Tag: p,
    Switch: c,
    Typography: m,
    Tooltip: h,
    message: f
  } = z().antd, {
    PlusOutlined: g,
    DeleteOutlined: E,
    LinkOutlined: v,
    ApiOutlined: b,
    UserOutlined: w,
    ImportOutlined: I,
    ExportOutlined: R,
    CopyOutlined: U
  } = z().antdIcons || {}, { Text: P } = m, [$, F] = o(""), [W, N] = o(""), [x, S] = o(""), [_, A] = o(!1), H = a === "mcp" ? "MCP" : "专家模板", D = a === "mcp" ? b ? l.createElement(b, { style: { fontSize: 18 } }) : null : w ? l.createElement(w, { style: { fontSize: 18 } }) : null, j = () => {
    const B = $.trim(), L = W.trim();
    if (!B) return;
    const ae = L || B.slice(0, 40), ne = `${a}:${B}`;
    if (n.some((M) => M.id === ne)) {
      f.warning("该源已存在");
      return;
    }
    const J = {
      id: ne,
      label: ae,
      url: B,
      enabled: !0,
      type: a
    }, pe = [...n, J];
    a === "mcp" ? Wt(pe) : Vt(pe), r(pe), F(""), N(""), f.success(`已添加${H}源: ${ae}`);
  }, O = (B, L) => {
    const ae = n.map(
      (ne) => ne.id === B ? { ...ne, enabled: L } : ne
    );
    a === "mcp" ? Wt(ae) : Vt(ae), r(ae);
  }, k = (B) => {
    const L = n.filter((ae) => ae.id !== B);
    a === "mcp" ? Wt(L) : Vt(L), r(L), f.success("已移除源");
  }, se = () => {
    const B = JSON.stringify(
      { type: a, sources: n },
      null,
      2
    );
    try {
      navigator.clipboard.writeText(B), f.success(`${H}源已复制到剪贴板（${n.length} 个源）`);
    } catch {
      const L = document.createElement("textarea");
      L.value = B, document.body.appendChild(L), L.select(), document.execCommand("copy"), document.body.removeChild(L), f.success(`${H}源已复制到剪贴板（${n.length} 个源）`);
    }
  }, oe = () => {
    const B = x.trim();
    if (!B) {
      f.warning("请粘贴 JSON 内容");
      return;
    }
    try {
      const L = JSON.parse(B);
      let ae = [];
      if (Array.isArray(L))
        ae = L;
      else if (L && Array.isArray(L.sources))
        ae = L.sources;
      else if (L && typeof L == "object")
        ae = [L];
      else
        throw new Error("Invalid format");
      const ne = ae.filter(
        (ie) => ie && typeof ie.url == "string" && typeof ie.label == "string"
      );
      if (ne.length === 0) {
        f.error("未找到有效的源数据");
        return;
      }
      const J = new Set(n.map((ie) => ie.id)), pe = [];
      for (const ie of ne) {
        const me = ie.id || `${a}:${ie.url}`;
        J.has(me) || pe.push({
          id: me,
          label: ie.label,
          url: ie.url,
          enabled: ie.enabled !== !1,
          type: a
        });
      }
      if (pe.length === 0) {
        f.info("所有源均已存在，无新增");
        return;
      }
      const M = [...n, ...pe];
      a === "mcp" ? Wt(M) : Vt(M), r(M), S(""), A(!1), f.success(`成功导入 ${pe.length} 个${H}源`);
    } catch (L) {
      f.error(`JSON 解析失败: ${L.message || "格式错误"}`);
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
        D,
        l.createElement("span", null, `配置${H}源`)
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
              icon: R ? l.createElement(R) : void 0,
              onClick: se,
              disabled: n.length === 0,
              size: "small"
            },
            "导出到剪贴板"
          ),
          l.createElement(
            d,
            {
              icon: I ? l.createElement(I) : void 0,
              onClick: () => A(!_),
              size: "small"
            },
            _ ? "隐藏导入" : "导入JSON"
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
      P,
      { type: "secondary", style: { fontSize: 12, display: "block", marginBottom: 12 } },
      `配置${H}源地址，支持从远程仓库或团队共享的 JSON 导入${H}配置。`
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
        P,
        { strong: !0, style: { fontSize: 12, display: "block", marginBottom: 8 } },
        `粘贴${H}源 JSON（支持从导出的剪贴板内容粘贴）`
      ),
      l.createElement(s.TextArea, {
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
        value: x,
        onChange: (B) => S(B.target.value),
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
            onClick: () => S("")
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
        value: W,
        onChange: (B) => N(B.target.value),
        style: { width: 200 }
      }),
      l.createElement(s, {
        placeholder: a === "mcp" ? "https://raw.githubusercontent.com/team/mcp-registry/main/mcp.json" : "https://raw.githubusercontent.com/team/expert-registry/main/experts.json",
        value: $,
        onChange: (B) => F(B.target.value),
        onPressEnter: j,
        prefix: v ? l.createElement(v) : void 0,
        style: { flex: 1 }
      }),
      l.createElement(
        d,
        {
          type: "primary",
          icon: g ? l.createElement(g) : void 0,
          onClick: j
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
        P,
        { strong: !0 },
        `已配置源 (${n.length})`
      )
    ),
    l.createElement(u, {
      size: "small",
      bordered: !0,
      dataSource: n,
      renderItem: (B) => l.createElement(
        u.Item,
        {
          actions: [
            l.createElement(
              h,
              { title: B.enabled ? "点击禁用" : "点击启用" },
              l.createElement(c, {
                size: "small",
                checked: B.enabled,
                onChange: (L) => O(B.id, L)
              })
            ),
            l.createElement(
              h,
              { title: "移除此源" },
              l.createElement(
                d,
                {
                  size: "small",
                  type: "text",
                  danger: !0,
                  icon: E ? l.createElement(E) : void 0,
                  onClick: () => k(B.id)
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
              p,
              {
                color: a === "mcp" ? "purple" : "blue",
                style: { fontSize: 11 }
              },
              B.label
            ),
            B.enabled ? null : l.createElement(
              p,
              { style: { fontSize: 10 } },
              "已禁用"
            )
          ),
          l.createElement(
            P,
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
async function Js() {
  return de("/market/providers");
}
async function Ks(e) {
  return de(
    `/market/categories?lang=${encodeURIComponent(e)}`
  );
}
async function Xs(e, t, n, r, a) {
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
function Fr(e) {
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
async function Dr(e, t) {
  const n = { bundle_url: e };
  return t && (n.access_token = t), de("/skills/pool/import", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(n)
  });
}
function Ys() {
  const e = z().React, { useState: t, useEffect: n, useCallback: r, useMemo: a, useRef: l } = e, {
    Spin: o,
    Empty: i,
    Input: s,
    Button: d,
    message: u,
    Row: p,
    Col: c,
    Card: m,
    Tag: h,
    Tooltip: f,
    Typography: g,
    Select: E,
    Drawer: v,
    Descriptions: b,
    Tabs: w,
    Badge: I,
    Progress: R,
    Modal: U,
    Alert: P
  } = z().antd, {
    ReloadOutlined: $,
    SearchOutlined: F,
    DownloadOutlined: W,
    AppstoreOutlined: N,
    ShopOutlined: x,
    CheckCircleOutlined: S,
    LoadingOutlined: _,
    UserOutlined: A,
    UserAddOutlined: H,
    SettingOutlined: D,
    GithubOutlined: j,
    ApiOutlined: O
  } = z().antdIcons || {}, { Text: k, Paragraph: se, Title: oe } = g, [B, L] = t("skills"), [ae, ne] = t([]), [J, pe] = t([]), [M, ie] = t([]), [me, Q] = t(""), [Z, ce] = t(""), [Ee, Se] = t(!1), [$e, xe] = t(!1), [ee, we] = t(
    {}
  ), [be, te] = t(null), [ue, ge] = t({}), [K, C] = t([]), [ye, q] = t(""), [T, re] = t(""), [fe, Ae] = t(""), [Le, We] = t({}), [Be, qe] = t(""), [st, Ve] = t(/* @__PURE__ */ new Set()), [_e, Re] = t(null), [le, ze] = t({}), [Pe, Me] = t([]), [Xe, Ye] = t([]), [Ie, Ut] = t([]), [yn, Et] = t(""), [Ze, jt] = t(!1), [yl, Zn] = t(!1), [hl, er] = t([]), [El, tr] = t(!1), [bl, nr] = t([]), [vl, rr] = t(!1), [ar, lr] = t([]), [or, sr] = t([]), [ir, cr] = t(!1), [it, dr] = t(""), [ur, mr] = t([]), [pr, fr] = t([]), [gr, yr] = t(!1), [ct, hr] = t(""), [hn, Er] = t(!1), [Fe, Nt] = t(null), [bt, wl] = t([]), vt = l(null);
  n(() => {
    Promise.all([
      Js().catch(() => []),
      Ks("zh").catch(() => []),
      un().catch(() => [])
    ]).then(([y, G, V]) => {
      ne(y), pe(G), C(V), V.length > 0 && (q(V[0].id), qe(V[0].id));
    });
  }, []);
  const Ft = r(async (y) => {
    const G = y ?? js();
    if (Me(y || G), G.filter((he) => he.enabled).length === 0) {
      Ye([]);
      return;
    }
    jt(!0);
    try {
      const { skills: he, errors: ke, categories: Oe } = await Vs(G);
      if (Ye(he), wl(Oe), ke.length > 0) {
        for (const Te of ke)
          console.warn(`[ugsci] GitHub source '${Te.label}' error: ${Te.message}`);
        u.warning(
          `部分源加载失败: ${ke.map((Te) => Te.label).join(", ")}`
        );
      }
    } catch (he) {
      u.error(he.message || "加载技能源失败"), Ye([]);
    } finally {
      jt(!1);
    }
  }, []), En = r(async () => {
    var he, ke, Oe;
    cr(!0), yr(!0), jt(!0);
    const [y, G, V] = await Promise.allSettled([
      Gs(),
      Ws(),
      Hs()
    ]);
    if (y.status === "fulfilled" ? (lr(y.value.servers), sr(y.value.categories)) : (console.warn(`[ugsci] MCP manifest error: ${((he = y.reason) == null ? void 0 : he.message) || y.reason}`), lr([]), sr([])), cr(!1), G.status === "fulfilled" ? (mr(G.value.agents), fr(G.value.categories)) : (console.warn(`[ugsci] Agents manifest error: ${((ke = G.reason) == null ? void 0 : ke.message) || G.reason}`), mr([]), fr([])), yr(!1), V.status === "fulfilled")
      Ut(V.value.skills), Et("");
    else {
      const Te = ((Oe = V.reason) == null ? void 0 : Oe.message) || String(V.reason);
      console.warn(`[ugsci] Skills manifest error: ${Te}`), Ut([]), Et(Te);
    }
    jt(!1);
  }, []);
  n(() => {
    Ft(), En(), er(Ls()), nr(Bs());
  }, [Ft, En]);
  const Dt = r(
    async (y, G, V) => {
      Se(!0);
      try {
        const he = await Xs(
          y,
          V,
          20,
          "zh",
          G || void 0
        );
        V === void 0 || Object.keys(V).length === 0 ? ie(he.results) : ie((Te) => [...Te, ...he.results]);
        const ke = Object.values(he.by_provider || {}).some(
          (Te) => Te.has_more
        );
        xe(ke);
        const Oe = {};
        for (const [Te, et] of Object.entries(he.by_provider || {}))
          Oe[Te] = (V[Te] || 1) + 1;
        if (we(Oe), he.errors.length > 0)
          for (const Te of he.errors)
            console.warn(
              `[ugsci] Market provider '${Te.provider}' error: ${Te.message}`
            );
      } catch (he) {
        u.error(he.message || "搜索市场失败"), ie([]);
      } finally {
        Se(!1);
      }
    },
    []
  );
  n(() => (vt.current && clearTimeout(vt.current), vt.current = setTimeout(() => {
    Dt(me, Z, {});
  }, 400), () => {
    vt.current && clearTimeout(vt.current);
  }), [me, Z, Dt]);
  const Sl = () => {
    Dt(me, Z, ee);
  }, br = async (y) => {
    const G = `${y.source}:${y.slug}`;
    try {
      ge((he) => ({ ...he, [G]: "installing" }));
      const V = await Dr(y.source_url);
      V.installed && u.success(
        `技能「${V.name || y.name}」已安装到技能池，可在技能中心查看`
      ), ge((he) => {
        const ke = { ...he };
        return delete ke[G], ke;
      });
    } catch (V) {
      u.error(Fr(V) || "安装技能失败"), ge((he) => {
        const ke = { ...he };
        return delete ke[G], ke;
      });
    }
  }, xl = (y) => {
    window.history.pushState({}, "", y), window.dispatchEvent(new PopStateEvent("popstate"));
  }, kl = async (y) => {
    const G = `github:${y.sourceId}:${y.name}`, V = Pe.find((ke) => ke.id === y.sourceId), he = (V == null ? void 0 : V.accessToken) || void 0;
    try {
      ge((Oe) => ({ ...Oe, [G]: "installing" }));
      const ke = await Dr(y.source_url, he);
      ke.installed && u.success(
        `技能「${ke.name || y.name}」已安装到技能池，可在技能中心查看`
      ), ge((Oe) => {
        const Te = { ...Oe };
        return delete Te[G], Te;
      });
    } catch (ke) {
      u.error(Fr(ke) || "安装技能失败"), ge((Oe) => {
        const Te = { ...Oe };
        return delete Te[G], Te;
      });
    }
  }, lt = a(() => {
    const y = [], G = /* @__PURE__ */ new Set();
    for (const V of [...Ie, ...Xe]) {
      const he = V.source_url || `${V.sourceLabel}:${V.name}`;
      G.has(he) || (G.add(he), y.push(V));
    }
    return y;
  }, [Ie, Xe]), vr = a(() => {
    const y = [], G = /* @__PURE__ */ new Set();
    if (bt.length > 0)
      for (const V of bt)
        G.has(V.id) || (G.add(V.id), y.push(V));
    for (const V of lt)
      V.tag && !G.has(V.tag) && (G.add(V.tag), y.push({ id: V.tag, label: V.tag }));
    for (const V of lt)
      !V.isOfficial && V.sourceLabel && !G.has(V.sourceLabel) && (G.add(V.sourceLabel), y.push({ id: V.sourceLabel, label: V.sourceLabel }));
    return y;
  }, [lt, bt]), bn = a(() => {
    let y = lt;
    if (Z) {
      const G = bt.find((V) => V.id === Z);
      G && G.tags ? y = y.filter(
        (V) => V.tag && G.tags.includes(V.tag) || V.sourceLabel === Z
      ) : y = y.filter(
        (V) => V.tag === Z || V.sourceLabel === Z
      );
    }
    if (me.trim()) {
      const G = me.toLowerCase();
      y = y.filter(
        (V) => {
          var he;
          return V.name.toLowerCase().includes(G) || ((he = V.description) == null ? void 0 : he.toLowerCase().includes(G));
        }
      );
    }
    return y;
  }, [lt, me, Z, bt]), wr = ae.filter((y) => y.available), dt = a(() => Z ? M.filter((y) => {
    const G = wr.find((V) => V.key === y.source);
    return (G == null ? void 0 : G.label) === Z;
  }) : M, [M, Z, wr]), Cl = e.createElement(
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
        prefix: F ? e.createElement(F) : void 0,
        value: me,
        onChange: (y) => Q(y.target.value),
        allowClear: !0,
        style: { flex: 1, minWidth: 200, maxWidth: 400 }
      }),
      // Pool install info
      e.createElement(
        k,
        { type: "secondary", style: { fontSize: 12 } },
        "安装后进入技能池"
      ),
      // Configure skill source button
      e.createElement(
        d,
        {
          icon: j ? e.createElement(j) : void 0,
          onClick: () => Zn(!0),
          size: "small"
        },
        "配置技能源"
      )
    ),
    // Dynamic category filter tags (from OSS manifest tags + imported sources)
    yn && lt.length === 0 ? e.createElement(P, {
      type: "warning",
      showIcon: !0,
      message: "UGSci 官方 OSS 技能库加载失败",
      description: "请检查网络或后端 OSS 代理服务，然后点击右上角“刷新”重试。",
      style: { marginBottom: 12 }
    }) : null,
    vr.length > 0 ? e.createElement(
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
        k,
        { type: "secondary", style: { fontSize: 12, marginRight: 4 } },
        "分类:"
      ),
      e.createElement(
        h,
        {
          style: {
            fontSize: 11,
            cursor: "pointer",
            borderRadius: 12
          },
          color: Z === "" ? "blue" : void 0,
          onClick: () => ce("")
        },
        "全部"
      ),
      ...vr.map((y) => {
        const G = Xe.some(
          (V) => !V.isOfficial && V.sourceLabel === y.id
        );
        return e.createElement(
          h,
          {
            key: y.id,
            style: {
              fontSize: 11,
              cursor: "pointer",
              borderRadius: 12
            },
            color: Z === y.id ? G ? "blue" : "geekblue" : void 0,
            icon: G && j ? e.createElement(j) : void 0,
            onClick: () => ce(
              Z === y.id ? "" : y.id
            )
          },
          y.label
        );
      })
    ) : null,
    // GitHub skills section
    Ze && lt.length === 0 ? e.createElement(
      "div",
      { style: { textAlign: "center", padding: 40, marginBottom: 16 } },
      e.createElement(o, { size: "large" }, e.createElement("div", { style: { minHeight: 60, display: "flex", alignItems: "center", justifyContent: "center" } }, "正在加载技能..."))
    ) : bn.length > 0 ? e.createElement(
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
        j ? e.createElement(j, {
          style: { fontSize: 14, color: "#1677ff" }
        }) : null,
        e.createElement(
          k,
          { strong: !0, style: { fontSize: 13 } },
          `技能市场 (${bn.length})`
        )
      ),
      e.createElement(
        p,
        { gutter: [12, 12] },
        ...bn.map((y) => {
          const G = `github:${y.sourceId}:${y.name}`, V = ue[G];
          return e.createElement(
            c,
            { key: G, xs: 24, sm: 12, md: 8, lg: 6 },
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
                j ? e.createElement(j, {
                  style: { fontSize: 18, color: "var(--ant-color-text-secondary, #57606a)" }
                }) : e.createElement(
                  "span",
                  { style: { fontSize: 18 } },
                  "📦"
                ),
                e.createElement(
                  f,
                  { title: y.name },
                  e.createElement(
                    k,
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
                    y.name
                  )
                )
              ),
              e.createElement(
                se,
                {
                  type: "secondary",
                  style: { fontSize: 11, margin: 0, lineHeight: 1.4 },
                  ellipsis: { rows: 2 }
                },
                y.description || "暂无描述"
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
                  y.sourcePath || y.sourceLabel ? e.createElement(
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
                    O ? e.createElement(O, { style: { fontSize: 10 } }) : null,
                    y.sourcePath || y.sourceLabel
                  ) : null,
                  // Show tag as category badge
                  y.tag ? e.createElement(
                    h,
                    { color: "geekblue", style: { fontSize: 10 } },
                    y.tag
                  ) : null,
                  y.version ? e.createElement(
                    h,
                    { style: { fontSize: 10 } },
                    `v${y.version}`
                  ) : null
                ),
                V ? e.createElement(
                  d,
                  {
                    size: "small",
                    disabled: !0,
                    icon: _ ? e.createElement(_) : void 0
                  },
                  "安装中"
                ) : e.createElement(
                  d,
                  {
                    type: "primary",
                    size: "small",
                    icon: W ? e.createElement(W) : void 0,
                    onClick: () => kl(y)
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
    dt.length > 0 || Ee ? e.createElement(
      "div",
      {
        style: {
          marginBottom: 10,
          display: "flex",
          alignItems: "center",
          gap: 6
        }
      },
      x ? e.createElement(x, {
        style: { fontSize: 14, color: "#1677ff" }
      }) : null,
      e.createElement(
        k,
        { strong: !0, style: { fontSize: 13 } },
        `技能市场${dt.length > 0 ? ` (${dt.length})` : ""}`
      )
    ) : null,
    // Results grid
    Ee && dt.length === 0 ? e.createElement(
      "div",
      { style: { textAlign: "center", padding: 60 } },
      e.createElement(o, { size: "large" })
    ) : dt.length === 0 ? e.createElement(i, {
      description: me ? `未找到匹配「${me}」的技能` : "输入关键词搜索技能市场",
      image: i.PRESENTED_IMAGE_SIMPLE
    }) : e.createElement(
      p,
      { gutter: [12, 12] },
      ...dt.map((y) => {
        const G = `${y.source}:${y.slug}`, V = ue[G];
        return e.createElement(
          c,
          { key: G, xs: 24, sm: 12, md: 8, lg: 6 },
          e.createElement(
            m,
            {
              hoverable: !0,
              size: "small",
              style: { height: "100%", cursor: "pointer" },
              onClick: () => te(y)
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
              y.icon_url ? e.createElement("img", {
                src: y.icon_url,
                alt: y.name,
                style: { width: 24, height: 24, borderRadius: 4 }
              }) : e.createElement(
                "span",
                { style: { fontSize: 18 } },
                "📦"
              ),
              e.createElement(
                f,
                { title: y.name },
                e.createElement(
                  k,
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
                  y.name
                )
              )
            ),
            e.createElement(
              se,
              {
                type: "secondary",
                style: { fontSize: 11, margin: 0, lineHeight: 1.4 },
                ellipsis: { rows: 2 }
              },
              y.description || "暂无描述"
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
                  h,
                  { color: "geekblue", style: { fontSize: 10 } },
                  y.source
                ),
                y.version ? e.createElement(
                  h,
                  { style: { fontSize: 10 } },
                  `v${y.version}`
                ) : null
              ),
              V ? e.createElement(
                d,
                {
                  size: "small",
                  disabled: !0,
                  icon: _ ? e.createElement(_) : void 0
                },
                "安装中"
              ) : e.createElement(
                d,
                {
                  type: "primary",
                  size: "small",
                  icon: W ? e.createElement(W) : void 0,
                  onClick: (he) => {
                    he.stopPropagation(), br(y);
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
    $e && !Ee ? e.createElement(
      "div",
      { style: { textAlign: "center", marginTop: 16 } },
      e.createElement(
        d,
        { onClick: Sl, loading: Ee },
        "加载更多"
      )
    ) : null,
    // Detail Drawer
    be ? e.createElement(
      v,
      {
        title: e.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 8 } },
          be.icon_url ? e.createElement("img", {
            src: be.icon_url,
            alt: be.name,
            style: { width: 28, height: 28, borderRadius: 4 }
          }) : e.createElement(
            "span",
            { style: { fontSize: 20 } },
            "📦"
          ),
          e.createElement("span", null, be.name)
        ),
        open: !0,
        onClose: () => te(null),
        width: 480,
        extra: e.createElement(
          d,
          {
            type: "primary",
            icon: W ? e.createElement(W) : void 0,
            onClick: () => {
              br(be);
            }
          },
          "安装到技能池"
        )
      },
      e.createElement(
        b,
        { column: 1, bordered: !0, size: "small" },
        e.createElement(
          b.Item,
          { label: "来源" },
          be.source
        ),
        e.createElement(
          b.Item,
          { label: "描述" },
          be.description || "-"
        ),
        be.version ? e.createElement(
          b.Item,
          { label: "版本" },
          be.version
        ) : null,
        be.author ? e.createElement(
          b.Item,
          { label: "作者" },
          be.author
        ) : null,
        e.createElement(
          b.Item,
          { label: "来源链接" },
          e.createElement(
            "a",
            { href: be.source_url, target: "_blank" },
            be.source_url
          )
        )
      ),
      be.stats ? e.createElement(
        "div",
        { style: { marginTop: 16 } },
        e.createElement(
          k,
          {
            strong: !0,
            style: { display: "block", marginBottom: 8 }
          },
          "统计"
        ),
        e.createElement(
          "div",
          { style: { display: "flex", gap: 12, flexWrap: "wrap" } },
          ...Object.entries(be.stats).map(
            ([y, G]) => e.createElement(
              "div",
              { key: y, style: { textAlign: "center" } },
              e.createElement(
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
              e.createElement(
                k,
                { type: "secondary", style: { fontSize: 11 } },
                y
              )
            )
          )
        )
      ) : null
    ) : null
  ), vn = a(() => {
    let y = ur;
    if (ct && (y = y.filter((G) => G.category === ct)), T.trim()) {
      const G = T.toLowerCase();
      y = y.filter(
        (V) => V.name.toLowerCase().includes(G) || V.description.toLowerCase().includes(G) || V.tags.some((he) => he.toLowerCase().includes(G))
      );
    }
    return y;
  }, [ur, T, ct]), Tl = async (y) => {
    if (!hn) {
      Er(!0);
      try {
        let G = y.description;
        if (y.instructions)
          try {
            const ke = y.instructions.replace(/^\/+/, ""), Oe = await tn(ke);
            Oe.ok && (G = await Oe.text());
          } catch {
          }
        let V = [];
        if (y.skills_manifest)
          try {
            const ke = y.skills_manifest.replace(/^\/+/, ""), Oe = await tn(ke);
            if (Oe.ok) {
              const Te = await Oe.json();
              Array.isArray(Te) ? V = Te.map((et) => typeof et == "string" ? et : et.name).filter(Boolean) : Te.skills && (V = Te.skills.map((et) => typeof et == "string" ? et : et.name).filter(Boolean));
            }
          } catch {
          }
        const he = await de("/agents", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: y.name,
            description: y.description,
            skill_names: V
          })
        });
        await en(he.id, "AGENTS.md", G), u.success(`专家「${y.name}」创建成功，已跳转至专家`), xl("/ugsci-experts");
      } catch (G) {
        u.error(G.message || "创建专家失败");
      } finally {
        Er(!1);
      }
    }
  }, Sr = r(async (y) => {
    if (y)
      try {
        const G = await Gn(y);
        Ve(new Set(G.map((V) => V.key)));
      } catch {
        Ve(/* @__PURE__ */ new Set());
      }
  }, []);
  n(() => {
    Be && Sr(Be);
  }, [Be, Sr]);
  const _l = async (y) => {
    if (!Be) {
      u.warning("请先选择目标专家");
      return;
    }
    if (Ps(y)) {
      const G = Object.entries(y.env), V = {};
      for (const [he] of G)
        V[he] = "";
      ze(V), Re(y);
      return;
    }
    await xr(y, y.env || {});
  }, xr = async (y, G) => {
    We((V) => ({ ...V, [y.id]: !0 }));
    try {
      const V = y.id;
      await Hn(Be, {
        client_key: V,
        client: {
          name: y.name,
          description: y.description,
          enabled: !0,
          transport: y.transport,
          url: y.url || "",
          command: y.command || "",
          args: y.args || [],
          env: G,
          cwd: y.cwd || "",
          headers: y.headers || {}
        }
      }), u.success(`MCP「${y.name}」已添加到当前专家`), Ve((he) => new Set(he).add(V));
    } catch (V) {
      u.error(V.message || `添加 MCP「${y.name}」失败`);
    } finally {
      We((V) => ({ ...V, [y.id]: !1 }));
    }
  }, Il = async () => {
    if (!_e) return;
    const y = [];
    for (const [V, he] of Object.entries(le))
      if (!he || !he.trim()) {
        const ke = Ur[V];
        y.push((ke == null ? void 0 : ke.label) || V);
      }
    if (y.length > 0) {
      u.warning(`请填写以下配置项: ${y.join(", ")}`);
      return;
    }
    const G = _e;
    Re(null), ze({}), await xr(G, { ...le });
  }, wn = a(() => {
    let y = ar;
    if (it && (y = y.filter((G) => G.category === it)), fe.trim()) {
      const G = fe.toLowerCase();
      y = y.filter(
        (V) => V.name.toLowerCase().includes(G) || V.description.toLowerCase().includes(G) || V.tags.some((he) => he.toLowerCase().includes(G))
      );
    }
    return y.map(Rs);
  }, [ar, fe, it]), Al = e.createElement(
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
        prefix: F ? e.createElement(F) : void 0,
        value: fe,
        onChange: (y) => Ae(y.target.value),
        allowClear: !0,
        style: { maxWidth: 300 }
      }),
      e.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        e.createElement(
          k,
          { type: "secondary", style: { fontSize: 12, whiteSpace: "nowrap" } },
          "安装到："
        ),
        e.createElement(E, {
          value: Be,
          onChange: (y) => qe(y),
          style: { minWidth: 180 },
          size: "small",
          options: K.map((y) => ({ value: y.id, label: y.name }))
        })
      ),
      // Configure MCP source button
      e.createElement(
        d,
        {
          icon: O ? e.createElement(O) : void 0,
          onClick: () => tr(!0),
          size: "small"
        },
        "配置 MCP 源"
      )
    ),
    // Dynamic category tag row (from OSS manifest tag_groups)
    or.length > 0 ? e.createElement(
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
        k,
        { type: "secondary", style: { fontSize: 12, marginRight: 4 } },
        "分类:"
      ),
      e.createElement(
        h,
        {
          style: { fontSize: 11, cursor: "pointer", borderRadius: 12 },
          color: it === "" ? "blue" : void 0,
          onClick: () => dr("")
        },
        "全部"
      ),
      ...or.map(
        (y) => e.createElement(
          h,
          {
            key: y.id,
            style: { fontSize: 11, cursor: "pointer", borderRadius: 12 },
            color: it === y.id ? "geekblue" : void 0,
            onClick: () => dr(
              it === y.id ? "" : y.id
            )
          },
          y.label
        )
      )
    ) : null,
    // MCP server cards (dynamic from OSS)
    ir && wn.length === 0 ? e.createElement(
      "div",
      { style: { textAlign: "center", padding: 40 } },
      e.createElement(o, { size: "large" }, e.createElement("div", { style: { minHeight: 60, display: "flex", alignItems: "center", justifyContent: "center" } }, "正在加载 MCP 服务器..."))
    ) : wn.length === 0 ? e.createElement(i, {
      description: "未找到匹配的 MCP 服务器",
      image: i.PRESENTED_IMAGE_SIMPLE
    }) : e.createElement(
      p,
      { gutter: [12, 12] },
      ...wn.map(
        (y) => e.createElement(
          c,
          { key: y.id, xs: 24, sm: 12, md: 8 },
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
                y.iconUrl ? e.createElement("img", {
                  src: y.iconUrl,
                  alt: y.name,
                  style: { width: 28, height: 28, objectFit: "contain" },
                  onError: (G) => {
                    G.target.style.display = "none";
                  }
                }) : y.emoji
              ),
              e.createElement(
                "div",
                { style: { flex: 1 } },
                e.createElement(
                  k,
                  { strong: !0, style: { fontSize: 14 } },
                  y.name
                ),
                e.createElement(
                  "div",
                  { style: { display: "flex", gap: 4, marginTop: 4, flexWrap: "wrap" } },
                  e.createElement(
                    h,
                    { color: "blue", style: { fontSize: 10 } },
                    y.category
                  ),
                  e.createElement(
                    h,
                    {
                      color: y.transport === "stdio" ? "purple" : "cyan",
                      style: { fontSize: 10 }
                    },
                    y.transport
                  ),
                  y.env && Object.keys(y.env).length > 0 ? e.createElement(
                    h,
                    { color: "orange", style: { fontSize: 10 } },
                    "需配置密钥"
                  ) : null
                )
              )
            ),
            // Description
            e.createElement(
              se,
              {
                type: "secondary",
                style: { fontSize: 12, margin: 0, lineHeight: 1.5 },
                ellipsis: { rows: 3 }
              },
              y.description
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
                k,
                { type: "secondary", style: { fontSize: 11 } },
                y.transport === "stdio" ? `${y.command} ${(y.args || []).join(" ")}` : y.url || ""
              ),
              st.has(y.id) ? e.createElement(
                d,
                { size: "small", disabled: !0 },
                "已安装"
              ) : e.createElement(
                d,
                {
                  type: "primary",
                  size: "small",
                  loading: !!Le[y.id],
                  icon: O ? e.createElement(O) : void 0,
                  onClick: () => _l(y)
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
      x ? e.createElement(x, {
        style: { fontSize: 24, color: "var(--ant-color-text-quaternary, #bfbfbf)", marginBottom: 8 }
      }) : null,
      e.createElement(
        k,
        { type: "secondary", style: { fontSize: 12 } },
        "MCP 服务器列表来自 UGSci 官方源，自动同步更新"
      )
    )
  ), zl = _e ? e.createElement(
    U,
    {
      title: e.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 8 } },
        e.createElement("span", { style: { fontSize: 20, display: "inline-flex", alignItems: "center", justifyContent: "center", width: 24, height: 24 } }, _e.iconUrl ? e.createElement("img", { src: _e.iconUrl, alt: _e.name, style: { width: 22, height: 22, objectFit: "contain" }, onError: (y) => {
          y.target.style.display = "none";
        } }) : _e.emoji),
        e.createElement("span", null, `配置 ${_e.name} 密钥`)
      ),
      open: !!_e,
      onCancel: () => {
        Re(null), ze({});
      },
      onOk: Il,
      okText: "安装",
      cancelText: "取消",
      width: 520,
      destroyOnClose: !0
    },
    // Description
    e.createElement(
      k,
      { type: "secondary", style: { display: "block", marginBottom: 16, fontSize: 12 } },
      _e.description
    ),
    ...Object.entries(_e.env || {}).map(([y]) => {
      const G = Ur[y], V = (G == null ? void 0 : G.isSecret) !== !1;
      return e.createElement(
        "div",
        { key: y, style: { marginBottom: 16 } },
        e.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 6, marginBottom: 4 } },
          e.createElement(
            k,
            { strong: !0, style: { fontSize: 13 } },
            (G == null ? void 0 : G.label) || y
          ),
          e.createElement(
            h,
            { color: "orange", style: { fontSize: 10 } },
            "必填"
          )
        ),
        // Help text with optional link
        G ? e.createElement(
          "div",
          { style: { marginBottom: 6, fontSize: 12, color: "var(--ant-color-text-tertiary, #8c8c8c)" } },
          G.help,
          G.link ? e.createElement(
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
        V ? e.createElement(s.Password, {
          placeholder: `请输入 ${(G == null ? void 0 : G.label) || y}`,
          value: le[y] || "",
          onChange: (he) => ze((ke) => ({
            ...ke,
            [y]: he.target.value
          })),
          style: { width: "100%" }
        }) : e.createElement(s, {
          placeholder: `请输入 ${(G == null ? void 0 : G.label) || y}`,
          value: le[y] || "",
          onChange: (he) => ze((ke) => ({
            ...ke,
            [y]: he.target.value
          })),
          style: { width: "100%" }
        }),
        // Show env key name for reference
        e.createElement(
          k,
          { type: "secondary", style: { fontSize: 11, display: "block", marginTop: 2 } },
          `环境变量名: ${y}`
        )
      );
    })
  ) : null, $l = e.createElement(
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
        prefix: F ? e.createElement(F) : void 0,
        value: T,
        onChange: (y) => re(y.target.value),
        allowClear: !0,
        style: { maxWidth: 400, flex: 1, minWidth: 200 }
      }),
      e.createElement(
        d,
        {
          icon: A ? e.createElement(A) : void 0,
          onClick: () => rr(!0),
          size: "small"
        },
        "配置专家源"
      )
    ),
    // Dynamic category tag row (from OSS manifest tag_groups)
    pr.length > 0 ? e.createElement(
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
        k,
        { type: "secondary", style: { fontSize: 12, marginRight: 4 } },
        "分类:"
      ),
      e.createElement(
        h,
        {
          style: { fontSize: 11, cursor: "pointer", borderRadius: 12 },
          color: ct === "" ? "blue" : void 0,
          onClick: () => hr("")
        },
        "全部"
      ),
      ...pr.map(
        (y) => e.createElement(
          h,
          {
            key: y.id,
            style: { fontSize: 11, cursor: "pointer", borderRadius: 12 },
            color: ct === y.id ? "geekblue" : void 0,
            onClick: () => hr(
              ct === y.id ? "" : y.id
            )
          },
          y.label
        )
      )
    ) : null,
    // Agent cards (dynamic from OSS)
    gr && vn.length === 0 ? e.createElement(
      "div",
      { style: { textAlign: "center", padding: 40 } },
      e.createElement(o, { size: "large" }, e.createElement("div", { style: { minHeight: 60, display: "flex", alignItems: "center", justifyContent: "center" } }, "正在加载人才市场..."))
    ) : vn.length === 0 ? e.createElement(i, {
      description: "未找到匹配的人才",
      image: i.PRESENTED_IMAGE_SIMPLE
    }) : e.createElement(
      p,
      { gutter: [12, 12] },
      ...vn.map(
        (y) => e.createElement(
          c,
          { key: y.id, xs: 24, sm: 12, md: 8 },
          e.createElement(
            m,
            {
              hoverable: !0,
              size: "small",
              style: { height: "100%", cursor: "pointer" },
              onClick: () => Nt(y)
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
              e.createElement(Ke, {
                name: y.name,
                size: 40
              }),
              e.createElement(
                "div",
                { style: { flex: 1 } },
                e.createElement(
                  k,
                  { strong: !0, style: { fontSize: 14 } },
                  y.name
                ),
                e.createElement(
                  "div",
                  { style: { display: "flex", gap: 4, marginTop: 4, flexWrap: "wrap" } },
                  y.category ? e.createElement(
                    h,
                    { color: "blue", style: { fontSize: 10 } },
                    yt(y.category)
                  ) : null,
                  y.tags.includes("mcp") ? e.createElement(
                    h,
                    { color: "purple", style: { fontSize: 10 } },
                    "MCP"
                  ) : null
                )
              )
            ),
            e.createElement(
              se,
              {
                type: "secondary",
                style: { fontSize: 12, margin: 0, lineHeight: 1.5 },
                ellipsis: { rows: 3 }
              },
              y.description
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
                k,
                { type: "secondary", style: { fontSize: 11 } },
                y.tags.filter((G) => G !== "agent" && G !== "template" && G !== "workspace").slice(0, 3).join(" · ") || "人才模板"
              ),
              e.createElement(
                d,
                {
                  type: "primary",
                  size: "small",
                  icon: H ? e.createElement(H) : void 0
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
      x ? e.createElement(x, {
        style: { fontSize: 24, color: "var(--ant-color-text-quaternary, #bfbfbf)", marginBottom: 8 }
      }) : null,
      e.createElement(
        k,
        { type: "secondary", style: { fontSize: 12 } },
        "人才市场来自 UGSci 官方源，自动同步更新"
      )
    )
  ), Pl = [
    {
      key: "skills",
      label: e.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        N ? e.createElement(N, { style: { fontSize: 14 } }) : null,
        "技能市场"
      ),
      children: Cl
    },
    {
      key: "mcp",
      label: e.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        O ? e.createElement(O, { style: { fontSize: 14 } }) : null,
        "MCP 市场"
      ),
      children: Al
    },
    {
      key: "experts",
      label: e.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        H ? e.createElement(H, { style: { fontSize: 14 } }) : null,
        "人才市场"
      ),
      children: $l
    }
  ];
  return e.createElement(
    "div",
    { style: { padding: 24 } },
    e.createElement(dn, {
      title: "市场",
      subtitle: "浏览技能市场 · 选择 MCP 服务器 · 人才市场 · 随时更新能力和专家",
      extra: e.createElement(
        "div",
        { style: { display: "flex", gap: 8 } },
        e.createElement(
          d,
          {
            type: "primary",
            icon: $ ? e.createElement($) : void 0,
            onClick: () => {
              Dt(me, Z, {}), Ft(), En();
            },
            loading: Ee || Ze || ir || gr
          },
          "刷新"
        )
      )
    }),
    e.createElement(w, {
      items: Pl,
      activeKey: B,
      onChange: (y) => L(y)
    }),
    // Skill source config modal
    e.createElement(qs, {
      open: yl,
      onClose: () => Zn(!1),
      sources: Pe,
      onChange: (y) => {
        Me(y), Ft(y);
      }
    }),
    // MCP source config modal
    e.createElement(Nr, {
      open: El,
      onClose: () => tr(!1),
      sources: hl,
      onChange: (y) => er(y),
      type: "mcp"
    }),
    // MCP token config modal (for templates requiring secrets)
    zl,
    // Expert source config modal
    e.createElement(Nr, {
      open: vl,
      onClose: () => rr(!1),
      sources: bl,
      onChange: (y) => nr(y),
      type: "expert"
    }),
    // ── Agent Detail Modal (click card to view details, then create) ──
    Fe ? e.createElement(
      U,
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
          e.createElement(Ke, {
            name: Fe.name,
            size: 40
          }),
          e.createElement(
            "div",
            null,
            e.createElement(
              k,
              { strong: !0, style: { fontSize: 16 } },
              Fe.name
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
              Fe.category ? e.createElement(
                h,
                { color: "blue", style: { fontSize: 10 } },
                yt(Fe.category)
              ) : null,
              ...Fe.tags.filter(
                (y) => y !== "agent" && y !== "template" && y !== "workspace"
              ).slice(0, 5).map(
                (y) => e.createElement(
                  h,
                  { key: y, style: { fontSize: 10 } },
                  y
                )
              )
            )
          )
        ),
        open: !0,
        onCancel: () => Nt(null),
        width: 640,
        footer: e.createElement(
          "div",
          { style: { textAlign: "right" } },
          e.createElement(
            d,
            {
              onClick: () => Nt(null),
              style: { marginRight: 8 }
            },
            "取消"
          ),
          e.createElement(
            d,
            {
              type: "primary",
              loading: hn,
              disabled: hn,
              icon: H ? e.createElement(H) : void 0,
              style: je,
              onClick: async () => {
                await Tl(Fe), Nt(null);
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
          k,
          { strong: !0, style: { display: "block", marginBottom: 6 } },
          "简介"
        ),
        e.createElement(
          se,
          {
            type: "secondary",
            style: { fontSize: 13, lineHeight: 1.7, margin: 0 }
          },
          Fe.description
        )
      ),
      // Skills manifest hint
      Fe.skills_manifest ? e.createElement(
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
          k,
          { style: { fontSize: 12, color: "#52c41a" } },
          "✓ 包含技能清单，创建后将自动安装推荐技能"
        )
      ) : null,
      // Instructions hint
      Fe.instructions ? e.createElement(
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
          k,
          { style: { fontSize: 12, color: "#1677ff" } },
          "✓ 包含系统提示词，创建后将自动写入 AGENTS.md"
        )
      ) : null,
      // Drivers
      Fe.drivers && Object.keys(Fe.drivers).length > 0 ? e.createElement(
        "div",
        null,
        e.createElement(
          k,
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
          ...Object.entries(Fe.drivers).map(
            ([y, G]) => e.createElement(
              h,
              { key: y, color: "cyan", style: { fontSize: 11 } },
              `${y}${G && G.length > 0 ? ` (${G.join(", ")})` : ""}`
            )
          )
        )
      ) : null
    ) : null
  );
}
function Qs() {
  try {
    const t = localStorage.getItem("language") || "";
    if (t) return t.split("-")[0];
  } catch {
  }
  return ((typeof navigator < "u" ? navigator.language : "") || "").split("-")[0] || "en";
}
const Gr = {
  zh: "您好，UGSci 智能助手在线。无论是油气藏分析、数值模拟还是工程决策，描述您的场景，我来交付结果。",
  en: "UGSci AI assistant is online. From reservoir analysis to numerical simulation and engineering decisions — describe your scenario and I'll deliver results.",
  ja: "UGSci AIアシスタントがオンラインです。油層解析、数値シミュレーション、エンジニアリングの意思決定など、シナリオを描写してください。結果をお届けします。",
  ru: "UGSci AI-ассистент онлайн. От анализа пласта до численного моделирования и инженерных решений — опишите свой сценарий, и я предоставлю результат.",
  vi: "Trợ lý AI UGSci đang trực tuyến. Từ phân tích mỏ, mô phỏng số đến ra quyết định kỹ thuật — mô tả kịch bản của bạn, tôi sẽ giao kết quả.",
  id: "Asisten AI UGSci sedang online. Dari analisis reservoir, simulasi numerik hingga keputusan engineering — jelaskan skenario Anda, saya akan memberikan hasilnya."
}, Hr = {
  zh: { label: "能告诉我你都能做点什么吗？", value: "能告诉我你都能做点什么吗" },
  en: { label: "Can you tell me what you can do?", value: "Can you tell me what you can do?" },
  ja: { label: "あなたができることを教えてください", value: "あなたができることを教えてください" },
  ru: { label: "Расскажи, что ты умеешь делать?", value: "Расскажи, что ты умеешь делать?" },
  vi: { label: "Bạn có thể cho tôi biết bạn làm được gì không?", value: "Bạn có thể cho tôi biết bạn làm được gì không?" },
  id: { label: "Bisa cerita apa saja yang bisa Anda lakukan?", value: "Bisa cerita apa saja yang bisa Anda lakukan?" }
};
function Zs() {
  const e = z(), t = e.React, { useEffect: n, useRef: r } = t, a = e.useSelectedAgent ? e.useSelectedAgent() : { id: "default" }, l = (a == null ? void 0 : a.id) || "default", o = r(null), i = r(null);
  return n(() => {
    if (o.current === l) return;
    o.current = l, jn();
    const s = Qs(), d = Gr[s] || Gr.en, u = Hr[s] || Hr.en;
    let p = !1;
    return (async () => {
      var c, m;
      try {
        const h = await mn(l);
        if (p) return;
        const f = ga(h);
        if (i.current) {
          try {
            i.current();
          } catch {
          }
          i.current = null;
        }
        const g = window.QwenPaw;
        (c = g == null ? void 0 : g.chat) != null && c.welcome && (f.length > 0 ? (i.current = g.chat.welcome.set("ugsci", {
          description: d,
          prompts: f
        }), console.info(
          `[ugsci] Injected ${f.length} welcome prompts for agent "${l}"`
        )) : (i.current = g.chat.welcome.set("ugsci", {
          description: d,
          prompts: [u]
        }), console.info(
          `[ugsci] No skills for agent "${l}" — using default prompt`
        )));
      } catch (h) {
        console.warn(
          `[ugsci] Failed to inject welcome prompts for agent "${l}":`,
          h
        );
        const f = window.QwenPaw;
        if ((m = f == null ? void 0 : f.chat) != null && m.welcome && !p) {
          if (i.current) {
            try {
              i.current();
            } catch {
            }
            i.current = null;
          }
          i.current = f.chat.welcome.set("ugsci", {
            description: d,
            prompts: [u]
          });
        }
      }
    })(), () => {
      p = !0;
    };
  }, [l]), null;
}
const ei = 256;
let Ue = {};
const Mn = /* @__PURE__ */ new Set(), nn = () => Mn.forEach((e) => e()), ti = (e) => (Mn.add(e), () => Mn.delete(e)), Pt = /* @__PURE__ */ new Map();
function Wr(e, t) {
  const n = [];
  for (const l of t) {
    if (!l) continue;
    const o = Ue[Ot(e, l)] || Object.values(Ue).find((i) => i.uiId === l);
    o && n.push(o);
  }
  const r = `${e}::${t.join("\0")}`, a = Pt.get(r);
  return a && a.length === n.length && a.every((l, o) => l === n[o]) ? a : (Pt.set(r, n), n);
}
function Ot(e, t) {
  return `${e}::${t}`;
}
function rn(e) {
  return !e || typeof e != "object" ? null : e.ok === !0 && (e.kind === "genui" || e.kind === "genui_patch") ? e : e.genui && typeof e.genui == "object" ? rn(e.genui) : e.ui && typeof e.ui == "object" ? rn(e.ui.genui) : null;
}
function _t(e) {
  if (!e || typeof e != "string") return null;
  try {
    const t = JSON.parse(e);
    if (Array.isArray(t)) {
      for (const n of t) {
        const r = (n == null ? void 0 : n.type) === "text" ? n.text : void 0, a = typeof r == "string" ? _t(r) : rn(n);
        if (a) return a;
      }
      return null;
    }
    return rn(t);
  } catch {
    return null;
  }
}
function It(e) {
  var t;
  if (!e || typeof e != "string") return null;
  try {
    const n = JSON.parse(e);
    if (Array.isArray(n)) {
      const r = (t = n.find((a) => (a == null ? void 0 : a.type) === "text")) == null ? void 0 : t.text;
      return typeof r == "string" ? It(r) : null;
    }
    return n && n.ok === !1 ? n : null;
  } catch {
    return null;
  }
}
const Vr = /* @__PURE__ */ new Set(["plugin_call_output", "function_call_output", "tool_call_output", "mcp_call_output", "component_call_output"]), xn = /* @__PURE__ */ new Set(["emit_ui_tree", "emit_ui_patch"]);
function Da(e) {
  var r, a, l, o;
  if (!Array.isArray(e)) return [];
  const t = [], n = (i, s = !1) => {
    var p, c, m;
    if (!i || typeof i != "object") return;
    if (Array.isArray(i)) {
      const h = s ? i.map((f) => {
        var g;
        return ((g = f == null ? void 0 : f.data) == null ? void 0 : g.name) ?? (f == null ? void 0 : f.name);
      }).filter((f) => !!f).map((f) => String(f)) : [];
      if (s && h.length) {
        const f = h.some((g) => xn.has(g));
        for (const g of i) {
          const E = ((p = g == null ? void 0 : g.data) == null ? void 0 : p.output) ?? (g == null ? void 0 : g.output) ?? ((c = g == null ? void 0 : g.data) == null ? void 0 : c.result) ?? (g == null ? void 0 : g.result) ?? ((m = g == null ? void 0 : g.data) == null ? void 0 : m.content) ?? (g == null ? void 0 : g.content);
          if (E == null) continue;
          const v = typeof E == "string" ? E : JSON.stringify(E), b = _t(v) || (f ? It(v) : null);
          b && t.push(b);
        }
      }
      i.forEach((f) => n(f));
      return;
    }
    const d = i;
    if (d.type === "tool_result") {
      const f = (Array.isArray(d.output) ? d.output : []).filter((v) => (v == null ? void 0 : v.type) === "text").map((v) => v.text), g = f.length ? f.join(`
`) : d.output, E = f.length ? f : [typeof g == "string" ? g : JSON.stringify(g)];
      for (const v of E) {
        const b = _t(v) || (xn.has(String(d.name || "")) ? It(v) : null);
        b && t.push(b);
      }
      return;
    }
    const u = Vr.has(String(d.type || ""));
    Object.entries(d).forEach(
      ([h, f]) => n(f, u && h === "content")
    );
  };
  n(e);
  for (const i of e) {
    if (!i || typeof i != "object") continue;
    const s = i;
    if (!Vr.has(String(s.type || "")) || !Array.isArray(s.content)) continue;
    const d = s.content, u = (a = (r = d[0]) == null ? void 0 : r.data) == null ? void 0 : a.name;
    if (!u) continue;
    const p = (o = (l = d[1]) == null ? void 0 : l.data) == null ? void 0 : o.output;
    if (p == null) continue;
    const c = typeof p == "string" ? p : JSON.stringify(p), m = _t(c) || (xn.has(String(u)) ? It(c) : null);
    m && t.push(m);
  }
  return Array.from(new Map(t.map((i) => [`${i.kind}:${i.ui_id}:${i.revision}`, i])).values());
}
function Ga(e) {
  var o;
  const t = Ot(e.sessionId, e.uiId), n = Object.entries(Ue).filter(([, i]) => i.uiId === e.uiId).sort(([, i], [, s]) => s.revision - i.revision), r = Ue[t] || ((o = n[0]) == null ? void 0 : o[1]);
  if (r && e.revision < r.revision) return;
  const a = { ...Ue };
  for (const [i] of n) i !== t && delete a[i];
  a[t] = r && e.revision === r.revision ? { ...r, ...e, tree: r.tree } : e;
  const l = Object.entries(a).sort(([, i], [, s]) => s.updatedAt - i.updatedAt);
  Ue = Object.fromEntries(l.slice(0, ei)), nn();
}
function ni(e, t) {
  for (const n of Da(t))
    !n.ui_id || !n.tree || Ga({
      schemaVersion: "1",
      uiId: n.ui_id,
      revision: n.revision || 1,
      tree: n.tree,
      sessionId: e,
      sourceToolCallId: n.tool_call_id,
      updatedAt: Date.now()
    });
}
const Ha = {
  setSnapshot: Ga,
  applyPatch(e, t, n, r) {
    var d, u;
    const a = (d = window.QwenPaw) == null ? void 0 : d.host, l = r || ((u = a == null ? void 0 : a.getCurrentSessionId) == null ? void 0 : u.call(a)) || "", o = Ot(l, e.ui_id), i = Ue[o] || Object.values(Ue).find((p) => p.uiId === e.ui_id);
    if (!i || n <= i.revision) return;
    Ue = { ...Object.fromEntries(Object.entries(Ue).filter(([, p]) => p.uiId !== e.ui_id)), [o]: { ...i, sessionId: l, tree: t, revision: n, updatedAt: Date.now() } }, nn();
  },
  getSnapshot: (e, t) => Ue[Ot(e, t)],
  clearSession(e) {
    Ue = Object.fromEntries(Object.entries(Ue).filter(([, t]) => t.sessionId !== e));
    for (const t of [...Pt.keys()])
      t.startsWith(`${e}::`) && Pt.delete(t);
    nn();
  },
  hydrateFromMessages: ni
};
function ri({ children: e }) {
  return e;
}
function ai() {
  return Ha;
}
function li(e, t) {
  var l, o;
  const n = (o = (l = window.QwenPaw) == null ? void 0 : l.host) == null ? void 0 : o.React;
  if (!n) throw new Error("useGenUiSnapshots: host React not available");
  const r = t.join("\0"), a = r === "" ? [] : r.split("\0");
  return n.useSyncExternalStore(
    ti,
    () => Wr(e, a),
    () => Wr(e, a)
  );
}
function oi(e) {
  Ha.clearSession(e);
}
function si() {
  Ue = {}, Pt.clear(), nn();
}
function At(e) {
  var t;
  if (typeof e == "string") {
    if (e.trimStart().startsWith("["))
      try {
        return At(JSON.parse(e));
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
    if (n.output !== void 0) return At(n.output);
    if (n.content !== void 0) return At(n.content);
  }
  return e == null ? "" : JSON.stringify(e);
}
function ii(e) {
  const t = e.data;
  if (!t) return { resultText: "", status: "calling", toolName: "" };
  const n = t.status || "calling", r = t.content;
  if (!Array.isArray(r) || r.length === 0)
    return { resultText: "", status: n, toolName: "" };
  const a = r[0], l = a == null ? void 0 : a.data, o = (l == null ? void 0 : l.name) || "";
  if (r.length > 1) {
    const i = r[1], s = i == null ? void 0 : i.data, d = (s == null ? void 0 : s.output) ?? (s == null ? void 0 : s.content) ?? (i == null ? void 0 : i.output) ?? (i == null ? void 0 : i.content) ?? (s == null ? void 0 : s.result) ?? (i == null ? void 0 : i.result);
    if (d != null) return { resultText: At(d), status: n, toolName: o };
  }
  if (l != null && l.output) {
    const i = l.output;
    return { resultText: At(i), status: n, toolName: o };
  }
  return { resultText: "", status: n, toolName: o };
}
function qr(e) {
  var m, h, f, g;
  const t = (m = window.QwenPaw) == null ? void 0 : m.host, n = t == null ? void 0 : t.React;
  if (!n) return null;
  const { resultText: r, status: a, toolName: l } = ii(e), o = a === "in_progress" || a === "calling", i = a === "failed" || a === "error", s = _t(r), d = s ? null : It(r);
  let u = 0;
  (h = s == null ? void 0 : s.tree) != null && h.root && (u = Wa(s.tree.root));
  const p = l === "emit_ui_patch" || (s == null ? void 0 : s.kind) === "genui_patch", c = o ? p ? "📝 Patching UI Tree..." : "🎨 Generating UI Tree..." : i ? p ? "📝 UI Patch Error" : "🎨 UI Tree Error" : s ? p ? `📝 UI Patched (rev ${s.revision ?? "?"})` : `🎨 UI Tree (${u} nodes)` : p ? "📝 UI Patch" : "🎨 UI Tree";
  return n.createElement(
    "details",
    { open: o || i, style: { margin: "4px 0", border: "1px solid var(--ant-color-border, #d9d9d9)", borderRadius: 8, padding: "4px 8px", fontSize: 13 } },
    n.createElement(
      "summary",
      { style: { cursor: "pointer", display: "flex", alignItems: "center", gap: 6 } },
      n.createElement("span", null, p ? "📝" : "🎨"),
      n.createElement("span", null, c),
      s != null && s.ok ? n.createElement("span", { style: { fontSize: 11, color: "#999", marginLeft: "auto" } }, `ui_id: ${((f = s.ui_id) == null ? void 0 : f.slice(0, 16)) ?? ""}…`) : null
    ),
    i || d && !s ? n.createElement(
      "div",
      { style: { padding: "8px 12px", fontSize: 12 } },
      n.createElement("div", { style: { color: "var(--ant-color-error, #ff4d4f)", marginBottom: 4 } }, (d == null ? void 0 : d.message) || "Unknown error"),
      d != null && d.hint ? n.createElement("div", { style: { color: "#999" } }, `💡 ${d.hint}`) : null
    ) : s != null && s.ok ? n.createElement(
      "div",
      { style: { padding: "8px 12px", fontSize: 12, color: "#999" } },
      (g = s.tree) != null && g.root ? `GenUI 已在回复正文中展示（${u} 个节点，revision ${s.revision ?? 1}）。` : "GenUI 工具已完成，但没有可展示的树。"
    ) : n.createElement("pre", { style: { fontSize: 12, padding: "8px 12px", background: "rgba(0,0,0,0.03)", borderRadius: 8, overflow: "auto", maxHeight: 200 } }, r || "(waiting for result...)")
  );
}
function Wa(e) {
  if (!e || typeof e != "object") return 0;
  let t = 1;
  if (Array.isArray(e.children)) for (const n of e.children) t += Wa(n);
  return t;
}
function Zt(e) {
  var t;
  if (typeof e == "string") {
    if (e.trimStart().startsWith("["))
      try {
        return Zt(JSON.parse(e));
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
    if (n.output !== void 0) return Zt(n.output);
    if (n.content !== void 0) return Zt(n.content);
  }
  return e == null ? "" : JSON.stringify(e);
}
function ci(e) {
  var o;
  const t = e.data;
  if (!t) return { resultText: "", status: "calling", toolName: "" };
  const n = t.status || "calling", r = t.content;
  if (!Array.isArray(r) || r.length === 0)
    return { resultText: "", status: n, toolName: "" };
  const a = (o = r[0]) == null ? void 0 : o.data, l = (a == null ? void 0 : a.name) || "";
  if (r.length > 1) {
    const i = r[1], s = i == null ? void 0 : i.data, d = (s == null ? void 0 : s.output) ?? (s == null ? void 0 : s.content) ?? (i == null ? void 0 : i.output) ?? (i == null ? void 0 : i.content);
    if (d != null) return { resultText: Zt(d), status: n, toolName: l };
  }
  return { resultText: "", status: n, toolName: l };
}
function Jr(e) {
  var u;
  const t = (u = window.QwenPaw) == null ? void 0 : u.host, n = t == null ? void 0 : t.React;
  if (!n) return null;
  const { resultText: r, status: a, toolName: l } = ci(e), o = l === "get_genui_guide", i = a === "in_progress" || a === "calling";
  let s = o ? "GenUI 指南" : "组件目录", d = r;
  try {
    const p = r ? JSON.parse(r) : null;
    if (p && typeof p == "object") {
      const c = p.components;
      Array.isArray(c) ? (s = `组件目录（${c.length} 个 kind）`, d = c.map((m) => m == null ? void 0 : m.kind).filter(Boolean).join(" · ")) : (p.purpose || p.layout_structure) && (s = "GenUI 指南", d = String(p.purpose || "布局与语法说明已返回，模型可按此编写 emit_ui_tree。"));
    }
  } catch {
  }
  return n.createElement(
    "details",
    { style: { margin: "4px 0", border: "1px solid var(--ant-color-border, #d9d9d9)", borderRadius: 8, padding: "4px 8px", fontSize: 13 } },
    n.createElement("summary", { style: { cursor: "pointer" } }, i ? o ? "查阅 GenUI 指南…" : "查阅组件目录…" : s),
    n.createElement("div", { style: { padding: "8px 4px", fontSize: 12, color: "#666", lineHeight: 1.5 } }, d || "(waiting…)")
  );
}
const di = /* @__PURE__ */ new Set(["send_message"]), Kr = 1e4, ui = 500, Xr = {};
function mi() {
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
  return new Set(di);
}
function pi(e) {
  const t = Date.now(), n = Xr[e] || 0;
  return t - n < ui ? (console.warn("[ugsci.genui] Action '" + e + "' throttled"), !0) : (Xr[e] = t, !1);
}
function fi(e, t) {
  return e.replace(/\{\{\s*([\w.-]+)\s*\}\}/g, (n, r) => {
    const a = t[r];
    return a == null ? "" : typeof a == "string" ? a : JSON.stringify(a);
  });
}
function Rn(e, t = {}) {
  var l, o, i, s, d, u, p;
  let n;
  if (typeof e == "string") n = { type: e };
  else if (e && typeof e == "object") n = e;
  else return { ok: !1, message: "无效操作" };
  const r = n.type === "submit_form" ? "send_message" : n.type, a = mi();
  if (!a.has(r))
    return console.warn(
      "[ugsci.genui] Action '" + n.type + "' not allowed (allowed: " + Array.from(a).join(", ") + ")"
    ), { ok: !1, message: "此操作未获允许" };
  if (pi(r)) return { ok: !1, message: "操作过于频繁，请稍后重试" };
  if (r === "send_message") {
    const c = t.formValues || {};
    let m = ((l = n.payload) == null ? void 0 : l.content) || ((o = n.payload) == null ? void 0 : o.message) || "";
    const h = /\{\{\s*[\w.-]+\s*\}\}/.test(m);
    return m = fi(m, c).trim(), m && !h && Object.keys(c).length > 0 && (m += `
${Object.entries(c).map(([g, E]) => `${g}: ${typeof E == "string" ? E : JSON.stringify(E)}`).join(`
`)}`), !m && Object.keys(c).length > 0 && (m = `${t.formId ? `提交表单 ${t.formId}` : "提交表单"}
${Object.entries(c).map(([E, v]) => `${E}: ${typeof v == "string" ? v : JSON.stringify(v)}`).join(`
`)}`), !m || !m.trim() ? (console.warn("[ugsci.genui] send_message: content is empty"), { ok: !1, message: "消息内容为空" }) : m.length > Kr ? (console.warn("[ugsci.genui] send_message: content length " + m.length + " exceeds max " + Kr), { ok: !1, message: "消息内容过长" }) : !((d = (s = (i = window.QwenPaw) == null ? void 0 : i.chat) == null ? void 0 : s.sendMessage) != null && d.call(s, m)) ? (console.info("[ugsci.genui] send_message: could not find chat sender, content:", m), { ok: !1, message: "当前无法发送消息" }) : { ok: !0, message: "已提交" };
  }
  if (r === "open_url") {
    const c = ((u = n.payload) == null ? void 0 : u.url) || ((p = n.payload) == null ? void 0 : p.href) || "", m = typeof c == "string" ? c.trim() : "";
    return /^https?:\/\//i.test(m) ? (window.open(m, "_blank", "noopener,noreferrer"), { ok: !0, message: "已打开链接" }) : (console.warn("[ugsci.genui] open_url: only http(s) URLs are allowed"), { ok: !1, message: "仅允许 http(s) 链接" });
  }
  return { ok: !1, message: "尚未实现此操作" };
}
const Je = /* @__PURE__ */ new Map(), Mt = /* @__PURE__ */ new Map(), gi = 128, Jt = /* @__PURE__ */ new Map();
function an(e) {
  return e.startsWith("http://") || e.startsWith("https://") || e.startsWith("data:") || e.startsWith("blob:");
}
function yi(e) {
  return e ? !!(e.startsWith("/") || /^[A-Za-z]:[\\/]/.test(e) || e.startsWith("\\\\")) : !1;
}
function hi(e) {
  return e.startsWith("workspace://");
}
function Ei(e) {
  return hi(e) ? e.slice(12) : e;
}
async function bi(e) {
  if (!e) return null;
  if (an(e)) return e;
  if (Je.has(e))
    return Je.get(e) ?? null;
  if (Jt.has(e))
    return Jt.get(e);
  const t = vi(e);
  Jt.set(e, t);
  try {
    const n = await t;
    if (!Je.has(e) && Je.size >= gi) {
      const r = Je.keys().next().value;
      if (r !== void 0) {
        const a = Je.get(r);
        a != null && a.startsWith("blob:") && URL.revokeObjectURL(a), Je.delete(r);
      }
    }
    return Je.set(e, n), n && Mt.delete(e), n;
  } finally {
    Jt.delete(e);
  }
}
async function vi(e) {
  const t = window.QwenPaw, n = t == null ? void 0 : t.host;
  if (!n) {
    const a = "宿主媒体 API 不可用。请在 QwenPaw 工作区中打开此内容，或改用 http(s)、data、blob URL。";
    return Mt.set(e, a), console.warn("[ugsci.genui]", a), null;
  }
  const r = Ei(e);
  if (typeof n.resolveWorkspaceBlob == "function")
    try {
      const a = await n.resolveWorkspaceBlob(r);
      if (a) return a;
    } catch (a) {
      console.warn("[ugsci.genui] host.resolveWorkspaceBlob failed:", a);
    }
  try {
    return await wi(r, n);
  } catch (a) {
    const l = a instanceof Error ? a.message : String(a);
    return Mt.set(
      e,
      `无法读取本地媒体：${l}。请确认文件位于当前工作区且文件预览 API 已启用。`
    ), console.warn(
      `[ugsci.genui] Failed to resolve media URL for '${e}':`,
      a
    ), null;
  }
}
async function wi(e, t) {
  let n = null;
  const r = t == null ? void 0 : t.workspaceApi, a = t == null ? void 0 : t.chatApi;
  if (yi(e) && (a != null && a.filePreviewUrl) ? n = a.filePreviewUrl(e) : r != null && r.getBinaryFileUrl && (n = r.getBinaryFileUrl(e)), !n)
    throw new Error("宿主未提供 workspaceApi.getBinaryFileUrl 或 chatApi.filePreviewUrl");
  const l = {}, o = t == null ? void 0 : t.buildAuthHeaders;
  if (typeof o == "function")
    try {
      const d = o();
      d && typeof d == "object" && Object.assign(l, d);
    } catch {
    }
  const i = await fetch(n, { headers: l });
  if (!i.ok)
    throw new Error(`HTTP ${i.status}: ${i.statusText}`);
  const s = await i.blob();
  return URL.createObjectURL(s);
}
function Yr(e) {
  return e ? an(e) ? e : Je.get(e) ?? null : null;
}
function Qr(e) {
  return Mt.get(e) ?? null;
}
function Si() {
  for (const e of Je.values())
    if (e && e.startsWith("blob:"))
      try {
        URL.revokeObjectURL(e);
      } catch {
      }
  Je.clear(), Mt.clear();
}
const Va = [
  "Input",
  "NumberInput",
  "Select",
  "Textarea",
  "Switch",
  "Slider",
  "FileInput"
], ut = ["#1677ff", "#52c41a", "#faad14", "#ff4d4f", "#722ed1", "#13c2c2", "#eb2f96"], xi = /* @__PURE__ */ new Set([
  "Button",
  "InteractiveButton",
  "ToggleButton",
  "LinkButton"
]);
function ve(e) {
  return typeof e == "string" ? e : e == null ? "" : String(e);
}
function He(e) {
  if (typeof e == "number" && Number.isFinite(e)) return e;
  if (typeof e == "string") {
    const t = Number(e);
    return Number.isFinite(t) ? t : 0;
  }
  return 0;
}
function Ct(e) {
  return Array.isArray(e) ? e : [];
}
function zt(e) {
  return !!e;
}
function Rt(e) {
  const t = e.props || {}, n = ve(t.name);
  if (n) return n;
  const r = ve(t.label), a = r.match(/^\s*([a-e])(?:\b|\s|（|\()/i);
  return a ? a[1].toLowerCase() : r || ve(e.nodeId);
}
function qa(e) {
  return Va.includes(e);
}
function Ja(e) {
  return Math.min(Math.max(He(e) || 2, 1), 4);
}
function ki(e, t, n = 6) {
  const r = He(e);
  return Math.min(Math.max(r > 0 ? r : t, 1), n);
}
function Ci(e) {
  const n = (ve(e) || "16:9").split(":"), r = Number(n[0]), a = Number(n[1]);
  return r > 0 && a > 0 ? `${r} / ${a}` : "16 / 9";
}
function Ti(e) {
  return /^https?:\/\//i.test(ve(e).trim());
}
function Ge(e, t) {
  const n = {}, r = `${He(t.gap) || 12}px`;
  if (e === "Stack")
    n.display = "flex", n.flexDirection = "column", n.gap = r, t.padding != null && (n.padding = `${He(t.padding)}px`);
  else if (e === "Row")
    n.display = "flex", n.flexDirection = "row", n.gap = r, t.align && (n.alignItems = ve(t.align)), t.justify && (n.justifyContent = ve(t.justify));
  else if (e === "Grid" || e === "FeatureGrid" || e === "KpiBoard" || e === "ImageGallery") {
    const a = e === "KpiBoard" ? 3 : e === "FeatureGrid" ? 2 : e === "ImageGallery" ? 3 : 2, l = e === "FeatureGrid" ? 4 : 6;
    n.display = "grid", n.gridTemplateColumns = `repeat(${ki(t.columns, a, l)}, minmax(0, 1fr))`, n.gap = e === "ImageGallery" ? `${He(t.gap) || 8}px` : r;
  } else e === "ScrollArea" ? (n.maxHeight = `${He(t.maxHeight) || 300}px`, n.overflowY = "auto", t.padding != null && (n.padding = `${He(t.padding)}px`)) : e === "AspectBox" ? (n.aspectRatio = Ci(t.ratio), n.overflow = "hidden", n.borderRadius = "8px", n.display = "flex", n.justifyContent = "center", n.alignItems = "center") : e === "Spacer" && (n.height = `${He(t.size) || 16}px`);
  return n;
}
function Jn(e, t) {
  function n(p) {
    return typeof p == "string" ? p : p == null ? "" : String(p);
  }
  function r(p) {
    if (typeof p == "number" && Number.isFinite(p)) return p;
    if (typeof p == "string") {
      const c = Number(p);
      return Number.isFinite(c) ? c : 0;
    }
    return 0;
  }
  function a(p) {
    return Array.isArray(p) ? p : [];
  }
  const l = e.generator && typeof e.generator == "object" ? e.generator : {}, o = a(l.coefficients).map(n).filter(Boolean), i = n(l.type) === "polynomial" || o.length > 0;
  let s = a(e.categories).map(n), d = a(e.series);
  if (i && t) {
    const p = o.length > 0 ? o : ["a", "b", "c", "d", "e"], c = typeof l.xMin == "number" ? l.xMin : -3, m = typeof l.xMax == "number" ? l.xMax : 3, h = Math.min(Math.max(r(l.samples) || 61, 10), 400), f = Array.from({ length: h }, (E, v) => c + (m - c) * v / Math.max(h - 1, 1)), g = p.map((E) => r(t[E]));
    s = f.map((E) => Number(E.toFixed(2)).toString()), d = [{
      name: n(l.label) || "f(x)",
      values: f.map((E) => g.reduce((v, b, w) => v + b * Math.pow(E, g.length - w - 1), 0))
    }];
  }
  const u = d.map((p, c) => {
    const m = p && typeof p == "object" ? p : {};
    return {
      name: n(m.name) || `Series ${c + 1}`,
      values: a(m.values).map(r)
    };
  });
  return {
    title: n(e.title),
    chartType: n(e.chart) || "line",
    categories: s,
    series: u,
    height: r(e.height) || 200,
    showLegend: e.showLegend !== !1,
    empty: s.length === 0 || u.length === 0
  };
}
function Ka(e, t, n = 640) {
  const r = ["#1677ff", "#52c41a", "#faad14", "#ff4d4f", "#722ed1", "#13c2c2", "#eb2f96"];
  if (e.replaceChildren(), t.title) {
    const m = document.createElement("div");
    m.className = "chart-title", m.textContent = t.title, e.appendChild(m);
  }
  if (t.empty) {
    const m = document.createElement("div");
    m.className = "muted", m.textContent = "Chart: no data", e.appendChild(m);
    return;
  }
  const a = t.height || 240, l = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  if (l.setAttribute("viewBox", `0 0 ${n} ${a}`), l.setAttribute("role", "img"), l.setAttribute("aria-label", t.title || "Chart"), t.chartType === "pie") {
    const m = t.series[0].values.map((b) => Math.abs(b)), h = m.reduce((b, w) => b + w, 0) || 1, f = n / 2, g = a / 2, E = Math.min(n, a) / 2 - 20;
    let v = -Math.PI / 2;
    if (m.forEach((b, w) => {
      const I = b / h * Math.PI * 2, R = f + E * Math.cos(v), U = g + E * Math.sin(v), P = f + E * Math.cos(v + I), $ = g + E * Math.sin(v + I), F = document.createElementNS(l.namespaceURI, "path");
      F.setAttribute("d", `M ${f} ${g} L ${R} ${U} A ${E} ${E} 0 ${I > Math.PI ? 1 : 0} 1 ${P} ${$} Z`), F.setAttribute("fill", r[w % r.length]), l.appendChild(F), v += I;
    }), e.appendChild(l), t.showLegend) {
      const b = document.createElement("div");
      b.className = "legend", m.forEach((w, I) => {
        const R = document.createElement("span"), U = document.createElement("i");
        U.style.background = r[I % r.length], R.append(U, document.createTextNode(`${t.categories[I] || `#${I + 1}`}: ${w}`)), b.appendChild(R);
      }), e.appendChild(b);
    }
    return;
  }
  const o = t.series.flatMap((m) => m.values), i = Math.max(...o, 0), s = Math.min(...o, 0), d = i - s || 1, u = (m) => a - 24 - (m - s) / d * (a - 44), p = (m) => 30 + m * (n - 50) / Math.max(t.categories.length - 1, 1), c = document.createElementNS(l.namespaceURI, "line");
  if (c.setAttribute("x1", "30"), c.setAttribute("x2", String(n - 15)), c.setAttribute("y1", String(u(0))), c.setAttribute("y2", String(u(0))), c.setAttribute("stroke", "#d9d9d9"), l.appendChild(c), t.series.forEach((m, h) => {
    const f = r[h % r.length];
    if (t.chartType === "bar") {
      const v = (n - 50) / Math.max(t.categories.length, 1), b = Math.max(1, v / t.series.length - 3);
      m.values.forEach((w, I) => {
        const R = document.createElementNS(l.namespaceURI, "rect"), U = Math.min(u(w), u(0)), P = Math.max(u(w), u(0));
        R.setAttribute("x", String(30 + I * v + h * (b + 2))), R.setAttribute("y", String(U)), R.setAttribute("width", String(b)), R.setAttribute("height", String(Math.max(1, P - U))), R.setAttribute("fill", f), l.appendChild(R);
      });
      return;
    }
    const g = m.values.map((v, b) => `${p(b)},${u(v)}`).join(" "), E = document.createElementNS(l.namespaceURI, "polyline");
    E.setAttribute("points", g), E.setAttribute("fill", t.chartType === "area" ? `${f}22` : "none"), E.setAttribute("stroke", f), E.setAttribute("stroke-width", "2"), l.appendChild(E);
  }), e.appendChild(l), t.showLegend) {
    const m = document.createElement("div");
    m.className = "legend", t.series.forEach((h, f) => {
      const g = document.createElement("span"), E = document.createElement("i");
      E.style.background = r[f % r.length], g.append(E, document.createTextNode(h.name)), m.appendChild(g);
    }), e.appendChild(m);
  }
}
const _i = {
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
}, Ii = {
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
function Xa(e) {
  const t = ve(e).trim();
  if (!t) return { kind: "empty" };
  const n = t.toLowerCase().replace(/\s+/g, "-"), r = Ii[n];
  return r ? { kind: "svg", paths: _i[r] } : /^[\w.-]+$/.test(t) ? { kind: "empty" } : t.length <= 8 ? { kind: "emoji", text: t.slice(0, 8) } : { kind: "empty" };
}
function Ai(e, t, n = {}) {
  const r = Xa(t), a = n.size && n.size > 0 ? n.size : 16;
  if (e.setAttribute("aria-hidden", "true"), e.replaceChildren(), r.kind === "emoji") {
    e.textContent = r.text, e.style.fontSize = `${a}px`, n.color && (e.style.color = n.color);
    return;
  }
  if (r.kind === "empty") return;
  const l = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  l.setAttribute("width", String(a)), l.setAttribute("height", String(a)), l.setAttribute("viewBox", "0 0 24 24"), l.setAttribute("fill", "none"), l.setAttribute("stroke", n.color || "currentColor"), l.setAttribute("stroke-width", "2"), l.setAttribute("stroke-linecap", "round"), l.setAttribute("stroke-linejoin", "round"), l.setAttribute("focusable", "false"), l.style.display = "block";
  for (const o of r.paths) {
    const i = document.createElementNS("http://www.w3.org/2000/svg", "path");
    i.setAttribute("d", o), l.appendChild(i);
  }
  e.appendChild(l);
}
let kn = null;
function fn(e) {
  return kn || (kn = e.createContext(null)), kn;
}
function Ya(e, t = {}) {
  if (qa(e.kind)) {
    const n = e.props || {}, r = n.value ?? n.checked;
    r !== void 0 && (t[Rt(e)] = r);
  }
  for (const n of e.children || []) Ya(n, t);
  return t;
}
function zi({
  node: e,
  children: t,
  onValuesChange: n
}) {
  var s, d;
  const r = (d = (s = window.QwenPaw) == null ? void 0 : s.host) == null ? void 0 : d.React;
  if (!r) return null;
  const a = r.useMemo(() => Ya(e), [e]), [l, o] = r.useState(a);
  r.useEffect(
    () => o((u) => ({ ...a, ...u })),
    [a]
  ), r.useEffect(() => {
    n == null || n(l);
  }, [l, n]);
  const i = r.useMemo(
    () => ({
      values: l,
      setValue: (u, p) => o((c) => ({ ...c, [u]: p }))
    }),
    [l]
  );
  return r.createElement(
    fn(r).Provider,
    { value: i },
    t
  );
}
const X = (e) => typeof e == "string" ? e : e != null ? String(e) : "", nt = (e) => typeof e == "number" ? e : typeof e == "string" && Number(e) || 0, rt = (e) => !!e, Tt = (e) => Array.isArray(e) ? e : [], $i = (e, t) => {
  const n = Object.keys(e), r = Object.keys(t);
  return n.length === r.length && n.every((a) => Object.is(e[a], t[a]));
}, Zr = { xs: "12px", sm: "13px", base: "14px", lg: "16px" }, Ce = {
  muted: "var(--ant-color-text-secondary, #8c8c8c)",
  default: "var(--ant-color-text, #000000d9)",
  primary: "var(--ant-color-primary, #1677ff)",
  success: "var(--ant-color-success, #52c41a)",
  warning: "var(--ant-color-warning, #faad14)",
  error: "var(--ant-color-error, #ff4d4f)"
}, Pi = new Set(Va);
function Oi(e) {
  const t = [], n = (r) => {
    Pi.has(r.kind) && t.push(r);
    for (const a of r.children || []) n(a);
  };
  for (const r of e.children || []) n(r);
  return t;
}
let Cn = null;
function Kn(e) {
  return Cn || (Cn = e.createContext(null)), Cn;
}
function Mi({ node: e }) {
  var h;
  const t = (h = window.QwenPaw) == null ? void 0 : h.host, n = t == null ? void 0 : t.React, r = (t == null ? void 0 : t.antd) || {};
  if (!n) return null;
  const a = e.props || {}, l = n.useContext(fn(n)), [o, i] = n.useState({}), [s, d] = n.useState(null), u = n.useMemo(
    () => Oi(e),
    [e]
  ), p = n.useMemo(() => {
    const f = {};
    for (const g of u) {
      const E = g.props || {}, v = Rt(g);
      E.value !== void 0 ? f[v] = E.value : E.checked !== void 0 && (f[v] = E.checked);
    }
    return f;
  }, [u]);
  n.useEffect(() => i((f) => {
    const g = { ...p, ...f, ...(l == null ? void 0 : l.values) || {} };
    return $i(f, g) ? f : g;
  }), [p, l == null ? void 0 : l.values]);
  const c = n.useMemo(() => ({ values: o, setValue: (f, g) => {
    d(null), i((E) => ({ ...E, [f]: g })), l == null || l.setValue(f, g);
  } }), [o, l]), m = () => {
    var E, v;
    const f = u.filter((b) => {
      var w;
      return (w = b.props) == null ? void 0 : w.required;
    }).find((b) => {
      const w = Rt(b), I = o[w];
      return I == null || I === "" || Array.isArray(I) && I.length === 0;
    });
    if (f) {
      d({ ok: !1, message: `${X((E = f.props) == null ? void 0 : E.label) || X((v = f.props) == null ? void 0 : v.name) || "必填项"}不能为空` });
      return;
    }
    const g = a.action && typeof a.action == "object" ? a.action : { type: "submit_form", payload: {} };
    d(Rn(g, { formValues: o, formId: X(a.formId) || e.nodeId }));
  };
  return n.createElement(
    Kn(n).Provider,
    { value: c },
    n.createElement(
      "div",
      { style: { margin: "4px 0" } },
      a.title ? n.createElement("div", { style: { fontWeight: 600, marginBottom: 8 } }, X(a.title)) : null,
      ...(e.children || []).map((f, g) => n.createElement(Lt(n), { key: f.nodeId || g, node: f })),
      n.createElement(r.Button || "button", { type: "primary", size: "small", style: { marginTop: 8 }, onClick: m }, X(a.submitLabel) || "提交"),
      s ? n.createElement("div", { role: "status", style: { marginTop: 6, fontSize: 12, color: s.ok ? Ce.success : Ce.error } }, s.message) : null
    )
  );
}
function Ri({ node: e, fieldType: t }) {
  var E, v, b;
  const n = (E = window.QwenPaw) == null ? void 0 : E.host, r = n == null ? void 0 : n.React, a = (n == null ? void 0 : n.antd) || {};
  if (!r) return null;
  const l = e.props || {}, o = r.useContext(Kn(r)), i = r.useContext(fn(r)), s = o || i, [d, u] = r.useState(l.value ?? l.checked ?? ""), p = Rt(e), c = l.value ?? l.checked ?? "", m = s ? ((v = s.values) == null ? void 0 : v[p]) ?? c : d, h = (w) => {
    const I = w != null && w.target ? t === "Switch" ? w.target.checked : w.target.value : w;
    s ? s.setValue(p, I) : u(I);
  }, f = (w) => r.createElement(
    "div",
    { style: { display: "flex", flexDirection: "column", gap: 4, margin: "4px 0" } },
    l.label && t !== "Switch" ? r.createElement("label", { style: { fontSize: 12, color: Ce.muted } }, X(l.label), l.required ? r.createElement("span", { style: { color: Ce.error } }, " *") : null) : null,
    w,
    l.description ? r.createElement("span", { style: { fontSize: 11, color: Ce.muted } }, X(l.description)) : null
  ), g = X(l.label) || X(l.placeholder) || p;
  return t === "Input" ? f(r.createElement(a.Input || "input", { "aria-label": g, placeholder: X(l.placeholder), value: m, onChange: h, size: "small" })) : t === "NumberInput" ? f(r.createElement(a.InputNumber || "input", { "aria-label": g, value: m, min: l.min, max: l.max, step: l.step, onChange: h, size: "small", style: { width: "100%" } })) : t === "Textarea" ? f(r.createElement(((b = a.Input) == null ? void 0 : b.TextArea) || "textarea", { "aria-label": g, placeholder: X(l.placeholder), value: m, rows: nt(l.rows) || 3, onChange: h, style: { width: "100%" } })) : t === "Select" ? f(r.createElement(a.Select || "select", { "aria-label": g, placeholder: X(l.placeholder), value: m || void 0, onChange: h, size: "small", style: { width: "100%" } }, Tt(l.options).map((w, I) => {
    var R;
    return r.createElement(((R = a.Select) == null ? void 0 : R.Option) || "option", { key: I, value: X(typeof w == "object" ? w.value : w) }, X(typeof w == "object" ? w.label : w));
  }))) : t === "Switch" ? r.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8 } }, r.createElement(a.Switch || "input", { type: "checkbox", checked: !!m, onChange: h, size: "small" }), r.createElement("span", null, X(l.label))) : t === "Slider" ? f(r.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8 } }, r.createElement(a.Slider || "input", { type: "range", value: nt(m), min: l.min ?? 0, max: l.max ?? 100, step: l.step ?? 1, onChange: h, style: { flex: 1 } }), r.createElement("span", { style: { minWidth: 32, fontSize: 12 } }, X(m)))) : t === "FileInput" ? r.createElement(
    "label",
    { style: { display: "inline-flex", alignItems: "center", gap: 8, cursor: "pointer" } },
    r.createElement("span", null, X(l.label) || "选择文件"),
    r.createElement("input", { type: "file", multiple: rt(l.multiple), accept: X(l.accept) || void 0, onChange: (w) => s == null ? void 0 : s.setValue(p, Array.from(w.target.files || []).map((I) => ({ name: I.name, size: I.size, type: I.type }))) })
  ) : null;
}
function Tn({ node: e, link: t = !1, toggle: n = !1 }) {
  var m;
  const r = (m = window.QwenPaw) == null ? void 0 : m.host, a = r == null ? void 0 : r.React, l = (r == null ? void 0 : r.antd) || {};
  if (!a) return null;
  const o = e.props || {}, i = a.useContext(Kn(a)), [s, d] = a.useState(rt(o.checked)), [u, p] = a.useState(null), c = () => {
    n && d((h) => !h), o.action && typeof o.action == "object" ? p(Rn(o.action, { formValues: i == null ? void 0 : i.values, formId: i ? "form" : void 0 })) : t && typeof o.href == "string" && p(Rn({ type: "open_url", payload: { url: o.href } }));
  };
  return a.createElement(
    "span",
    { style: { display: "inline-flex", flexDirection: "column", gap: 3 } },
    a.createElement(l.Button || "button", { type: t ? "link" : (n ? s : X(o.variant) === "primary") ? "primary" : "default", size: "small", disabled: rt(o.disabled), loading: rt(o.loading), onClick: c }, X(o.label) || "Action"),
    u ? a.createElement("span", { role: "status", style: { fontSize: 11, color: u.ok ? Ce.success : Ce.error } }, u.message) : null
  );
}
let ea = null, Kt = null;
function Li(e) {
  return Kt && ea === e || (ea = e, Kt = class extends e.Component {
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
        style: { padding: 8, border: "1px dashed var(--ant-color-error, #ff4d4f)", borderRadius: 8, fontSize: 12, color: Ce.error, fontFamily: "monospace" }
      }, `Component error: ${this.props.node.kind}`) : this.props.children;
    }
  }), Kt;
}
function Bi({ node: e }) {
  var s;
  const t = (s = window.QwenPaw) == null ? void 0 : s.host;
  if (!(t != null && t.React)) return null;
  const n = t.React, r = t.antd || {}, a = Lt(n), l = e.props || {}, o = e.children || [];
  return ji(n, r, e, l, o, () => o.map(
    (d, u) => n.createElement(a, { key: d.nodeId || u, node: d })
  ));
}
let Xt = null, ta = null;
function Lt(e) {
  return Xt && ta === e || (Xt = e.memo(Bi, (t, n) => t.node === n.node), ta = e), Xt;
}
function Ui({ node: e }) {
  var r;
  const t = (r = window.QwenPaw) == null ? void 0 : r.host;
  if (!(t != null && t.React)) return null;
  const n = t.React;
  return n.createElement(
    Li(n),
    { node: e },
    n.createElement(Lt(n), { node: e })
  );
}
function ji(e, t, n, r, a, l) {
  var o, i;
  switch (n.kind) {
    case "Stack":
      return e.createElement("div", { style: Ge("Stack", r) }, l());
    case "Row":
      return e.createElement("div", { style: Ge("Row", r) }, l());
    case "Grid":
      return e.createElement("div", { style: Ge("Grid", r) }, l());
    case "Spacer":
      return e.createElement("div", { style: Ge("Spacer", r) });
    case "ScrollArea":
      return e.createElement("div", { style: Ge("ScrollArea", r) }, l());
    case "AspectBox":
      return e.createElement("div", { style: Ge("AspectBox", r) }, l());
    case "Text":
      return e.createElement("div", { style: { fontSize: Zr[X(r.size)] || Zr.base, color: Ce[X(r.color)] || Ce.default, fontWeight: rt(r.bold) ? "bold" : "normal", lineHeight: 1.6 } }, X(r.value));
    case "Heading": {
      const s = Ja(r.level), d = { 1: "24px", 2: "20px", 3: "18px", 4: "16px" };
      return e.createElement(`h${s}`, { style: { fontSize: d[s], fontWeight: "bold", margin: "4px 0" } }, X(r.value));
    }
    case "Divider":
      return e.createElement(t.Divider || "hr", r.label ? { children: X(r.label) } : {});
    case "Markdown": {
      const s = (o = window.QwenPaw) == null ? void 0 : o.host, d = s == null ? void 0 : s.ReactMarkdown;
      if (d) {
        const u = s != null && s.remarkGfm ? [s.remarkGfm] : [];
        return e.createElement(
          "div",
          { className: "qwenpaw-genui-markdown" },
          e.createElement(d, { children: X(r.content || r.value), remarkPlugins: u })
        );
      }
      return e.createElement("div", { style: { whiteSpace: "pre-wrap", lineHeight: 1.6 } }, X(r.content || r.value));
    }
    case "CodeBlock":
      return e.createElement("pre", { style: { padding: 12, background: "var(--ant-color-fill-tertiary, rgba(0,0,0,0.04))", borderRadius: 8, overflow: "auto", fontSize: 13, fontFamily: "monospace" } }, X(r.code));
    case "SectionHeader":
      return e.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8, marginBottom: 8 } }, r.icon ? e.createElement("span", { style: { fontSize: 20 } }, X(r.icon)) : null, e.createElement("div", null, e.createElement("div", { style: { fontSize: 16, fontWeight: 600 } }, X(r.title)), r.subtitle ? e.createElement("div", { style: { fontSize: 12, color: Ce.muted } }, X(r.subtitle)) : null));
    case "KeyValueList": {
      const s = Tt(r.items);
      return e.createElement(
        "div",
        { style: { display: "flex", flexDirection: "column", gap: 4 } },
        ...s.map((d, u) => e.createElement(
          "div",
          { key: u, style: { display: "flex", justifyContent: "space-between", padding: "2px 0", borderBottom: u < s.length - 1 ? "1px solid var(--ant-color-border-secondary, #f0f0f0)" : "none" } },
          e.createElement("span", { style: { color: Ce.muted, fontSize: 13 } }, X(d.key)),
          e.createElement("span", { style: { fontWeight: 500, fontSize: 13 } }, X(d.value))
        ))
      );
    }
    case "Badge":
      return e.createElement(t.Tag || "span", { color: X(r.variant) || "default", children: X(r.value) });
    case "Tag":
      return e.createElement(t.Tag || "span", { color: X(r.color) || "default", children: X(r.label) });
    case "Stat":
      return e.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 2 } }, e.createElement("span", { style: { fontSize: 12, color: Ce.muted } }, X(r.label)), e.createElement("span", { style: { fontSize: 20, fontWeight: "bold" } }, X(r.value)), r.delta ? e.createElement("span", { style: { fontSize: 12, color: X(r.trend) === "up" ? Ce.success : X(r.trend) === "down" ? Ce.error : Ce.muted } }, X(r.delta)) : null);
    case "Progress":
      return e.createElement(t.Progress || "div", { percent: nt(r.value), size: "small" });
    case "Skeleton": {
      const s = nt(r.rows) || 3;
      return e.createElement(
        "div",
        { style: { display: "flex", flexDirection: "column", gap: 8 } },
        ...Array.from({ length: s }).map(
          (d, u) => e.createElement(t.Skeleton || "div", { key: u, active: rt(r.active), title: !1, paragraph: { rows: 1 } })
        )
      );
    }
    case "Avatar":
      return e.createElement(Fi, {
        src: X(r.src),
        name: X(r.name),
        size: nt(r.size) || 32
      });
    case "Icon": {
      const s = Xa(r.name), d = nt(r.size) || 16, u = Ce[X(r.color)] || Ce.default;
      return s.kind === "emoji" ? e.createElement("span", { "aria-hidden": !0, style: { fontSize: d, color: u, lineHeight: 1 } }, s.text) : s.kind === "svg" ? e.createElement("svg", {
        width: d,
        height: d,
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: u,
        strokeWidth: 2,
        strokeLinecap: "round",
        strokeLinejoin: "round",
        "aria-hidden": !0,
        focusable: "false",
        style: { display: "inline-block", verticalAlign: "middle" }
      }, ...s.paths.map((p, c) => e.createElement("path", { key: c, d: p }))) : e.createElement("span", { "aria-hidden": !0, style: { width: d, height: d, display: "inline-block" } });
    }
    case "Card":
      return e.createElement(t.Card || "div", { title: r.title ? X(r.title) : void 0, size: "small", style: { margin: "4px 0" } }, l());
    case "DataCard":
      return e.createElement(t.Card || "div", { size: "small", style: { margin: "4px 0" } }, e.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center" } }, e.createElement("div", null, e.createElement("div", { style: { fontSize: 12, color: Ce.muted } }, X(r.title)), e.createElement("div", { style: { fontSize: 24, fontWeight: "bold" } }, X(r.value))), r.icon ? e.createElement("span", { style: { fontSize: 32 } }, X(r.icon)) : null));
    case "MetricCard":
      return e.createElement(t.Card || "div", { size: "small", style: { margin: "4px 0" } }, e.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center" } }, e.createElement("div", null, e.createElement("div", { style: { fontSize: 12, color: Ce.muted } }, X(r.title)), e.createElement("div", { style: { fontSize: 24, fontWeight: "bold" } }, X(r.value)), r.delta ? e.createElement("span", { style: { fontSize: 12, color: X(r.trend) === "up" ? Ce.success : X(r.trend) === "down" ? Ce.error : Ce.muted } }, `${X(r.delta)} ${r.period ? X(r.period) : ""}`.trim()) : null), r.icon ? e.createElement("span", { style: { fontSize: 32 } }, X(r.icon)) : null));
    case "AlertCard":
    case "Alert":
      return e.createElement(t.Alert || "div", { type: X(r.severity) === "success" ? "success" : X(r.severity) === "warning" ? "warning" : X(r.severity) === "error" ? "error" : "info", message: r.title ? X(r.title) : void 0, description: X(r.message), showIcon: !0, style: { margin: "4px 0" } });
    case "Callout":
      return e.createElement(t.Alert || "div", { type: X(r.variant) === "tip" ? "success" : X(r.variant) === "warning" ? "warning" : X(r.variant) === "important" ? "error" : "info", message: r.title ? X(r.title) : void 0, description: X(r.message), showIcon: !0 });
    case "TimelineCard":
      return e.createElement(t.Card || "div", { size: "small", style: { margin: "4px 0" } }, e.createElement("div", { style: { display: "flex", gap: 8, alignItems: "flex-start" } }, e.createElement("div", { style: { width: 8, height: 8, borderRadius: "50%", background: X(r.status) === "done" ? Ce.success : X(r.status) === "pending" ? Ce.warning : Ce.primary, marginTop: 4, flexShrink: 0 } }), e.createElement("div", null, e.createElement("div", { style: { fontWeight: 600 } }, X(r.title)), r.date ? e.createElement("div", { style: { fontSize: 12, color: Ce.muted } }, X(r.date)) : null, r.description ? e.createElement("div", { style: { fontSize: 13, marginTop: 4 } }, X(r.description)) : null)));
    case "KpiBoard":
      return e.createElement("div", { style: { margin: "4px 0" } }, r.title ? e.createElement("div", { style: { fontSize: 16, fontWeight: 600, marginBottom: 8 } }, X(r.title)) : null, e.createElement("div", { style: Ge("KpiBoard", r) }, l()));
    case "FeatureGrid":
      return e.createElement("div", { style: { ...Ge("FeatureGrid", r), margin: "4px 0" } }, l());
    case "Stepper": {
      const s = Tt(r.steps).map((u) => X(u)), d = nt(r.current);
      return e.createElement(
        t.Steps || "div",
        { current: d, size: "small", style: { margin: "4px 0" } },
        ...s.map((u, p) => {
          var c;
          return e.createElement(((c = t.Steps) == null ? void 0 : c.Item) || "div", { key: p, title: u });
        })
      );
    }
    case "Table": {
      const s = Tt(r.headers).map((c) => X(c)), u = a.filter((c) => c.kind === "TableRow").map((c, m) => {
        const h = (c.children || []).filter((g) => g.kind === "TableCell"), f = { key: m };
        return s.forEach((g, E) => {
          var b, w;
          const v = (w = (b = h[E]) == null ? void 0 : b.props) == null ? void 0 : w.value;
          f[g] = v == null ? "" : X(v);
        }), f;
      }), p = s.map((c) => ({ title: c, dataIndex: c, key: c }));
      return e.createElement(t.Table || "table", { dataSource: u, columns: p, size: rt(r.compact) ? "small" : "middle", pagination: !1, style: { margin: "4px 0" } });
    }
    case "List": {
      const s = a.filter((d) => d.kind === "ListItem");
      return e.createElement(
        t.List || "ul",
        { size: "small", style: { margin: "4px 0" } },
        s.map((d, u) => {
          var p, c, m;
          return e.createElement(((p = t.List) == null ? void 0 : p.Item) || "li", { key: u }, (c = d.props) != null && c.icon ? e.createElement("span", { style: { marginRight: 6 } }, X(d.props.icon)) : null, X((m = d.props) == null ? void 0 : m.value));
        })
      );
    }
    case "ImageGallery": {
      const s = a.filter((d) => d.kind === "Image");
      return e.createElement(
        "div",
        { style: { ...Ge("ImageGallery", r), margin: "4px 0" } },
        ...s.map((d, u) => {
          const p = d.props || {};
          return e.createElement(Ln, { key: u, src: X(p.src), alt: X(p.alt), style: { width: "100%", height: 120, objectFit: "cover", borderRadius: 8, cursor: "pointer" } });
        })
      );
    }
    case "Image":
      return e.createElement("div", null, e.createElement(Ln, { src: X(r.src), alt: X(r.alt), style: { maxWidth: "100%", borderRadius: rt(r.rounded) ? "8px" : void 0, maxHeight: r.maxHeight ? `${nt(r.maxHeight)}px` : void 0 } }), r.caption ? e.createElement("div", { style: { fontSize: 12, color: Ce.muted } }, X(r.caption)) : null);
    case "Chart":
      return e.createElement(Ni, { props: r });
    case "Button":
    case "InteractiveButton":
      return e.createElement(Tn, { node: n });
    case "ToggleButton":
      return e.createElement(Tn, { node: n, toggle: !0 });
    case "LinkButton":
      return e.createElement(Tn, { node: n, link: !0 });
    case "Input":
    case "NumberInput":
    case "Select":
    case "Textarea":
    case "Switch":
    case "Slider":
    case "FileInput":
      return e.createElement(Ri, { node: n, fieldType: n.kind });
    case "Form":
      return e.createElement(Mi, { node: n });
    case "Chip":
      return e.createElement(t.Tag || "span", { color: X(r.color) || "default", closable: !0, onClose: () => {
      }, children: X(r.label) });
    case "ChipGroup": {
      const s = Tt(r.items);
      return e.createElement("div", { style: { display: "flex", flexWrap: "wrap", gap: 4 } }, ...s.map((d, u) => e.createElement(t.Tag || "span", { key: u }, X(d))));
    }
    case "Tabs": {
      const s = Lt(e), u = a.filter((p) => p.kind === "TabItem").map((p) => {
        var c, m, h;
        return {
          key: X((c = p.props) == null ? void 0 : c.key) || X((m = p.props) == null ? void 0 : m.tab),
          label: X((h = p.props) == null ? void 0 : h.tab),
          children: (p.children || []).map((f, g) => e.createElement(s, { key: f.nodeId || g, node: f }))
        };
      });
      return t.Tabs ? e.createElement(t.Tabs, { items: u, defaultActiveKey: X(r.activeKey) || ((i = u[0]) == null ? void 0 : i.key) }) : e.createElement("div", null, ...u.map((p, c) => e.createElement("div", { key: c }, e.createElement("div", { style: { fontWeight: 600, marginBottom: 4 } }, p.label), p.children)));
    }
    case "TabItem":
      return e.createElement("div", null, l());
    case "Accordion": {
      const s = Lt(e), d = a.filter((u) => u.kind === "AccordionItem");
      if (t.Collapse) {
        const u = d.map((p) => {
          var c, m, h;
          return {
            key: X((c = p.props) == null ? void 0 : c.key) || X((m = p.props) == null ? void 0 : m.header),
            label: X((h = p.props) == null ? void 0 : h.header),
            children: (p.children || []).map((f, g) => e.createElement(s, { key: f.nodeId || g, node: f }))
          };
        });
        return e.createElement(t.Collapse, { items: u });
      }
      return e.createElement("div", null, ...d.map((u, p) => {
        var c;
        return e.createElement("details", { key: p }, e.createElement("summary", { style: { fontWeight: 600, cursor: "pointer", padding: "4px 0" } }, X((c = u.props) == null ? void 0 : c.header)), e.createElement("div", { style: { paddingLeft: 12 } }, (u.children || []).map((m, h) => e.createElement(s, { key: m.nodeId || h, node: m }))));
      }));
    }
    case "AccordionItem":
      return e.createElement("div", null, l());
    case "JsonDebug":
      return e.createElement("details", { style: { margin: "4px 0", fontSize: 12 } }, e.createElement("summary", null, X(r.label) || "Debug JSON"), e.createElement("pre", { style: { fontSize: 12, padding: 8, background: "var(--ant-color-fill-tertiary, rgba(0,0,0,0.04))", borderRadius: 4, overflow: "auto" } }, JSON.stringify(r.data ?? r, null, 2)));
    default:
      return e.createElement("div", { style: { padding: 8, border: "1px dashed var(--ant-color-border, #d9d9d9)", borderRadius: 8, fontSize: 12, color: Ce.muted, fontFamily: "monospace" } }, `Unknown component: ${n.kind}`);
  }
}
function Ni({ props: e }) {
  var R, U;
  const t = (U = (R = window.QwenPaw) == null ? void 0 : R.host) == null ? void 0 : U.React;
  if (!t) return null;
  const n = t.useContext(fn(t)), r = Jn(e, n == null ? void 0 : n.values), a = r.chartType, l = r.title, o = r.categories, i = r.series, s = r.height, d = r.showLegend, u = 400;
  if (r.empty)
    return t.createElement("div", { style: { padding: 12, color: Ce.muted, fontSize: 12 } }, "Chart: no data");
  if (a === "pie") {
    const P = i[0].values.map((_) => Math.abs(_)), $ = P.reduce((_, A) => _ + A, 0) || 1, F = u / 2, W = s / 2, N = Math.min(u, s) / 2 - 20;
    let x = -Math.PI / 2;
    const S = P.map((_, A) => {
      const H = _ / $ * 2 * Math.PI, D = F + N * Math.cos(x), j = W + N * Math.sin(x), O = F + N * Math.cos(x + H), k = W + N * Math.sin(x + H), se = H > Math.PI ? 1 : 0, oe = `M ${F} ${W} L ${D} ${j} A ${N} ${N} 0 ${se} 1 ${O} ${k} Z`;
      return x += H, { path: oe, color: ut[A % ut.length], label: o[A] || `#${A + 1}`, val: _ };
    });
    return t.createElement(
      "div",
      { style: { margin: "4px 0" } },
      l ? t.createElement("div", { style: { fontSize: 13, fontWeight: 600, marginBottom: 4 } }, l) : null,
      t.createElement(
        "svg",
        { width: u, height: s, style: { maxWidth: "100%" } },
        ...S.map((_, A) => t.createElement("path", { key: A, d: _.path, fill: _.color, stroke: "#fff", strokeWidth: 1 }))
      ),
      d ? t.createElement(
        "div",
        { style: { display: "flex", flexWrap: "wrap", gap: 8, marginTop: 4, fontSize: 11 } },
        ...S.map((_, A) => t.createElement(
          "span",
          { key: A, style: { display: "flex", alignItems: "center", gap: 4 } },
          t.createElement("span", { style: { display: "inline-block", width: 10, height: 10, borderRadius: 2, background: _.color } }),
          `${_.label}: ${_.val}`
        ))
      ) : null
    );
  }
  const p = i.flatMap((P) => P.values), c = Math.max(...p, 0), m = Math.min(...p, 0), h = c - m || 1, f = o.length > 0 ? (u - 40) / o.length : 0, g = i.length > 0 ? Math.max(1, f / i.length - 2) : 0, E = o.length > 1 ? (u - 40) / (o.length - 1) : 0, v = Math.max(1, Math.ceil(o.length / 8)), b = (P) => s - 20 - (P - m) / h * (s - 40), w = b(0), I = (P) => 30 + P * E;
  return t.createElement(
    "div",
    { style: { margin: "4px 0" } },
    l ? t.createElement("div", { style: { fontSize: 13, fontWeight: 600, marginBottom: 4 } }, l) : null,
    t.createElement(
      "svg",
      { width: u, height: s, style: { maxWidth: "100%" } },
      ...[0, 0.25, 0.5, 0.75, 1].map((P, $) => {
        const F = s - 20 - P * (s - 40);
        return t.createElement("line", { key: `g${$}`, x1: 30, y1: F, x2: u - 10, y2: F, stroke: "var(--ant-color-border-secondary, #f0f0f0)", strokeWidth: 1 });
      }),
      ...o.map((P, $) => $ % v === 0 || $ === o.length - 1 ? t.createElement("text", { key: `x${$}`, x: I($), y: s - 6, fontSize: 10, fill: Ce.muted, textAnchor: "middle" }, P.length > 6 ? P.slice(0, 6) + "…" : P) : null),
      ...i.map((P, $) => {
        const F = ut[$ % ut.length];
        if (a === "bar")
          return P.values.map((x, S) => t.createElement("rect", {
            key: `b${$}-${S}`,
            x: 30 + S * f + $ * (g + 2) + 1,
            y: Math.min(b(x), w),
            width: g,
            height: Math.abs(w - b(x)),
            fill: F,
            rx: 2
          }));
        const W = P.values.map((x, S) => `${I(S)},${b(x)}`).join(" "), N = [t.createElement("polyline", { key: `l${$}`, points: W, fill: "none", stroke: F, strokeWidth: 2 })];
        if (a === "area") {
          const x = `${I(0)},${s - 20} ${W} ${I(P.values.length - 1)},${s - 20}`;
          N.unshift(t.createElement("polygon", { key: `a${$}`, points: x, fill: F, opacity: 0.15 }));
        }
        return N;
      })
    ),
    d ? t.createElement(
      "div",
      { style: { display: "flex", flexWrap: "wrap", gap: 8, marginTop: 4, fontSize: 11 } },
      ...i.map((P, $) => t.createElement(
        "span",
        { key: $, style: { display: "flex", alignItems: "center", gap: 4 } },
        t.createElement("span", { style: { display: "inline-block", width: 10, height: 10, borderRadius: 2, background: ut[$ % ut.length] } }),
        P.name
      ))
    ) : null
  );
}
function Ln(e) {
  var d;
  const t = (d = window.QwenPaw) == null ? void 0 : d.host, n = t == null ? void 0 : t.React;
  if (!n) return null;
  const { useState: r, useEffect: a } = n, [l, o] = r(
    Yr(e.src) || (an(e.src) ? e.src : null)
  ), [i, s] = r(
    Qr(e.src)
  );
  return a(() => {
    if (!e.src) return;
    if (an(e.src)) {
      o(e.src), s(null);
      return;
    }
    const u = Yr(e.src);
    if (u) {
      o(u), s(null);
      return;
    }
    o(null), s(null);
    let p = !1;
    return bi(e.src).then((c) => {
      p || (o(c), s(c ? null : Qr(e.src)));
    }), () => {
      p = !0;
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
      role: i ? "alert" : "status",
      style: {
        ...e.style || {},
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: 80,
        padding: 12,
        textAlign: "center",
        color: i ? Ce.error : Ce.muted,
        fontSize: 12,
        background: "var(--ant-color-fill-tertiary, rgba(0,0,0,0.04))",
        borderRadius: 8
      }
    },
    i ? `媒体加载失败：${i}` : "正在解析图片…"
  );
}
function Fi(e) {
  var a, l, o;
  const t = (a = window.QwenPaw) == null ? void 0 : a.host, n = t == null ? void 0 : t.React, r = (t == null ? void 0 : t.antd) || {};
  return n ? e.src ? n.createElement(Ln, {
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
const Di = `#genui-root { max-width: 960px; margin: auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px; background: #fff; box-shadow: 0 8px 30px rgba(0,0,0,.05); }
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
@media print { body { padding: 0; } }`, na = {
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
function Gi(e) {
  return e.replace(/[&<>"']/g, (t) => t === "&" ? "&amp;" : t === "<" ? "&lt;" : t === ">" ? "&gt;" : t === '"' ? "&quot;" : "&#39;");
}
function Hi(e) {
  return JSON.stringify(e).replace(/</g, "\\u003c");
}
function Y(e, t = "", n) {
  const r = document.createElement(e);
  return t && (r.className = t), n != null && n !== "" && (r.textContent = ve(n)), r;
}
function Yt(e, t) {
  Object.assign(e.style, t);
}
function xt(e, t, n) {
  for (const r of t || []) e.appendChild(Xn(r, n));
  return e;
}
function ra(e, t, n) {
  return t && e.appendChild(Y("div", "muted small", t)), e.appendChild(Y("div", "display-value", n)), e;
}
function Qa(e, t, n, r) {
  const a = ve(e);
  if (r.missing.has(a)) {
    const o = Y("div", `media-unavailable ${n}`.trim(), "此媒体未能离线嵌入");
    return o.setAttribute("role", "img"), o.setAttribute("aria-label", ve(t)), o;
  }
  const l = Y("img", n);
  return l.src = r.media[a] || a, l.alt = ve(t), l;
}
function Wi(e, t, n) {
  return e ? Qa(e, t, "avatar", n) : Y("span", "avatar avatar-fallback", ve(t).charAt(0).toUpperCase());
}
function Vi(e) {
  const t = Y("div", "markdown");
  let n = null;
  for (const r of ve(e).split(/\r?\n/)) {
    const a = r.match(/^(#{1,4})\s+(.*)$/), l = r.match(/^\s*[-*]\s+(.*)$/);
    a ? (n = null, t.appendChild(Y(`h${a[1].length}`, "", a[2]))) : l ? (n || (n = Y("ul"), t.appendChild(n)), n.appendChild(Y("li", "", l[1]))) : r.trim() ? (n = null, t.appendChild(Y("p", "", r))) : (n = null, t.appendChild(document.createElement("br")));
  }
  return t;
}
function qi(e, t) {
  const n = e.props || {}, r = e.kind, a = Rt(e), l = Y("label", "field");
  n.label && r !== "Switch" && l.appendChild(Y("span", "field-label", `${ve(n.label)}${n.required ? " *" : ""}`));
  let o;
  if (r === "Textarea") {
    const s = Y("textarea");
    s.rows = He(n.rows) || 3, s.placeholder = ve(n.placeholder), o = s;
  } else if (r === "Select") {
    const s = Y("select");
    for (const d of Ct(n.options)) {
      const u = Y("option"), p = d && typeof d == "object" ? d : null;
      u.value = ve(p ? p.value : d), u.textContent = ve(p ? p.label : d), s.appendChild(u);
    }
    o = s;
  } else {
    const s = Y("input");
    s.type = r === "Slider" ? "range" : r === "Switch" ? "checkbox" : r === "NumberInput" ? "number" : r === "FileInput" ? "file" : "text", n.min != null && (s.min = ve(n.min)), n.max != null && (s.max = ve(n.max)), n.step != null && (s.step = ve(n.step)), r === "FileInput" ? (n.accept && (s.accept = ve(n.accept)), s.multiple = zt(n.multiple)) : s.placeholder = ve(n.placeholder), o = s;
  }
  const i = Object.prototype.hasOwnProperty.call(t.values, a) ? t.values[a] : n.value != null ? n.value : n.checked != null ? n.checked : "";
  if (r === "Switch") {
    const s = o;
    s.checked = zt(i), s.checked ? s.setAttribute("checked", "") : s.removeAttribute("checked");
  } else if (r === "Textarea")
    o.value = ve(i), o.textContent = ve(i);
  else if (r === "Select") {
    const s = ve(i);
    o.value = s;
    for (const d of Array.from(o.options))
      d.value === s ? d.setAttribute("selected", "") : d.removeAttribute("selected");
  } else r !== "FileInput" && (o.value = ve(i), o.setAttribute("value", ve(i)));
  if (o.setAttribute("data-genui-field", a), o.setAttribute("data-genui-kind", r), r === "Switch") {
    const s = Y("span", "switch-line");
    s.append(o, Y("span", "", n.label)), l.appendChild(s);
  } else if (r === "Slider") {
    const s = Y("span", "slider-line");
    s.append(o, Y("output", "slider-value", i)), l.appendChild(s);
  } else
    l.appendChild(o);
  return n.description && l.appendChild(Y("small", "description", n.description)), l;
}
function Xn(e, t) {
  var l, o, i, s, d, u, p;
  if (!e || typeof e != "object") return Y("div");
  const n = e.props || {}, r = e.children || [];
  if (qa(e.kind)) return qi(e, t);
  if (e.kind === "Chart") {
    const c = Y("div", "chart");
    return c.setAttribute("data-genui-chart", JSON.stringify(n)), Ka(c, Jn(n, t.values)), c;
  }
  if (e.kind === "Heading") return Y(`h${Ja(n.level)}`, "", n.value);
  if (e.kind === "Text") return Y("div", zt(n.bold) ? "text bold" : "text", n.value);
  if (e.kind === "Markdown") return Vi(n.content || n.value);
  if (e.kind === "CodeBlock") return Y("pre", "code", n.code);
  if (e.kind === "SectionHeader") {
    const c = Y("div", "section-header");
    n.icon && c.appendChild(Y("span", "section-icon", n.icon));
    const m = Y("div");
    return m.appendChild(Y("strong", "", n.title)), n.subtitle && m.appendChild(Y("div", "muted small", n.subtitle)), c.appendChild(m), c;
  }
  if (e.kind === "KeyValueList") {
    const c = Y("dl", "key-values");
    for (const m of Ct(n.items)) {
      const h = m && typeof m == "object" ? m : {};
      c.append(Y("dt", "", h.key), Y("dd", "", h.value));
    }
    return c;
  }
  if (e.kind === "Divider") {
    const c = Y("div", "divider");
    return n.label && c.appendChild(Y("span", "", n.label)), c;
  }
  if (e.kind === "Spacer") {
    const c = Y("div");
    return Yt(c, Ge("Spacer", n)), c;
  }
  if (e.kind === "Tabs") {
    const c = Y("div", "tabs");
    c.setAttribute("data-genui-tabs", "1");
    const m = Y("div", "tab-buttons"), h = Y("div");
    return r.filter((g) => g.kind === "TabItem").forEach((g, E) => {
      var v;
      m.appendChild(Y("button", E ? "" : "active", (v = g.props) == null ? void 0 : v.tab)), h.appendChild(xt(Y("div", E ? "tab-panel hidden" : "tab-panel"), g.children, t));
    }), c.append(m, h), c;
  }
  if (e.kind === "Accordion") {
    const c = Y("div");
    for (const m of r.filter((h) => h.kind === "AccordionItem")) {
      const h = Y("details");
      h.append(Y("summary", "", (l = m.props) == null ? void 0 : l.header), xt(Y("div", "accordion-body"), m.children, t)), c.appendChild(h);
    }
    return c;
  }
  if (e.kind === "Form") {
    const c = Y("div", "stack form");
    n.title && c.appendChild(Y("div", "card-title", n.title)), xt(c, r, t);
    const m = Y("button", "button", ve(n.submitLabel) || "提交");
    return m.setAttribute("data-genui-submit", "1"), c.appendChild(m), c;
  }
  if (xi.has(e.kind)) {
    const c = Y("button", e.kind === "LinkButton" ? "link-button" : "button", ve(n.label) || "Action");
    return zt(n.disabled) && (c.disabled = !0), c.setAttribute("data-genui-action", e.kind), e.kind === "LinkButton" && Ti(n.href) && c.setAttribute("data-genui-href", ve(n.href).trim()), c;
  }
  if (e.kind === "Image") {
    const c = Y("figure");
    return c.appendChild(Qa(n.src, n.alt, "", t)), n.caption && c.appendChild(Y("figcaption", "", n.caption)), c;
  }
  if (e.kind === "ImageGallery") {
    const c = Y("div", "image-gallery");
    Yt(c, Ge("ImageGallery", n));
    for (const m of r.filter((h) => h.kind === "Image"))
      c.appendChild(Xn(m, t));
    return c;
  }
  if (e.kind === "Avatar") return Wi(n.src, n.name, t);
  if (e.kind === "Badge" || e.kind === "Tag" || e.kind === "Chip")
    return Y("span", "tag", n.value || n.label);
  if (e.kind === "Progress") {
    const c = Y("progress");
    return c.max = 100, c.value = He(n.value), c;
  }
  if (e.kind === "Stat") {
    const c = Y("div", "stat");
    return c.append(Y("span", "muted small", n.label), Y("strong", "stat-value", n.value)), n.delta && c.appendChild(Y("span", `small trend-${ve(n.trend)}`, n.delta)), c;
  }
  if (e.kind === "DataCard" || e.kind === "MetricCard") {
    const c = Y("div", "card metric-card"), m = ra(Y("div"), n.title, n.value);
    return n.delta && m.appendChild(Y("div", `small trend-${ve(n.trend)}`, `${ve(n.delta)}${n.period ? ` ${ve(n.period)}` : ""}`)), c.appendChild(m), n.icon && c.appendChild(Y("span", "metric-icon", n.icon)), c;
  }
  if (e.kind === "TimelineCard") {
    const c = Y("div", "card timeline");
    return c.append(Y("i", `timeline-dot status-${ve(n.status)}`), ra(Y("div"), n.title, n.date)), n.description && c.appendChild(Y("div", "small", n.description)), c;
  }
  if (e.kind === "Stepper") {
    const c = Y("ol", "stepper");
    return Ct(n.steps).forEach((m, h) => {
      c.appendChild(Y("li", h <= He(n.current) ? "active" : "", m));
    }), c;
  }
  if (e.kind === "Table") {
    const c = Y("table", "data-table"), m = Y("thead"), h = Y("tr");
    for (const g of Ct(n.headers)) h.appendChild(Y("th", "", g));
    m.appendChild(h);
    const f = Y("tbody");
    for (const g of r.filter((E) => E.kind === "TableRow")) {
      const E = Y("tr", (o = g.props) != null && o.highlight ? "highlight" : "");
      for (const v of (g.children || []).filter((b) => b.kind === "TableCell")) {
        const b = Y("td", (i = v.props) != null && i.bold ? "bold" : "", (s = v.props) == null ? void 0 : s.value);
        (d = v.props) != null && d.align && (b.style.textAlign = ve(v.props.align)), E.appendChild(b);
      }
      f.appendChild(E);
    }
    return c.append(m, f), c;
  }
  if (e.kind === "List") {
    const c = Y(zt(n.ordered) ? "ol" : "ul", "data-list");
    for (const m of r.filter((h) => h.kind === "ListItem"))
      c.appendChild(Y("li", "", `${(u = m.props) != null && u.icon ? `${ve(m.props.icon)} ` : ""}${ve((p = m.props) == null ? void 0 : p.value)}`));
    return c;
  }
  if (e.kind === "ChipGroup") {
    const c = Y("div", "chips");
    for (const m of Ct(n.items)) c.appendChild(Y("span", "tag", m));
    return c;
  }
  if (e.kind === "Skeleton") {
    const c = Y("div", "skeletons");
    for (let m = 0; m < (He(n.rows) || 3); m += 1) c.appendChild(Y("i", "skeleton"));
    return c;
  }
  if (e.kind === "Icon") {
    const c = Y("span", "icon");
    return Ai(c, n.name, { size: He(n.size) || 16 }), c;
  }
  if (e.kind === "JsonDebug") {
    const c = Y("details");
    return c.append(
      Y("summary", "", ve(n.label) || "Debug JSON"),
      Y("pre", "code", JSON.stringify(n.data == null ? n : n.data, null, 2))
    ), c;
  }
  if (e.kind === "KpiBoard") {
    const c = Y("div", "stack");
    n.title && c.appendChild(Y("div", "card-title", n.title));
    const m = Y("div", "grid");
    return Yt(m, Ge("KpiBoard", n)), xt(m, r, t), c.appendChild(m), c;
  }
  if (!Object.prototype.hasOwnProperty.call(na, e.kind))
    return Y("div", "unknown-component", `Unknown component: ${ve(e.kind)}`);
  const a = Y("div", na[e.kind]);
  return Yt(a, Ge(e.kind, n)), e.kind === "Card" && n.title && a.appendChild(Y("div", "card-title", n.title)), e.kind === "Card" && n.subtitle && a.appendChild(Y("div", "muted small card-subtitle", n.subtitle)), (e.kind === "Alert" || e.kind === "AlertCard" || e.kind === "Callout") && (n.title || n.message) ? (n.title && a.appendChild(Y("strong", "", n.title)), n.message && a.appendChild(Y("div", "", n.message))) : xt(a, r, t), a;
}
function aa(e, t) {
  const n = Function.prototype.toString.call(e).replace(/^export\s+/, "").trim();
  if (!n.includes("{")) throw new Error(`cannot serialize ${t}`);
  return `var ${t} = (${n});`;
}
function Ji() {
  return `(function () {
  "use strict";
  ${aa(Jn, "resolveChartModel")}
  ${aa(Ka, "paintChartElement")}
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
function Ki(e, t = {}, n = { sources: {}, missing: [] }) {
  const r = Y("main");
  return r.id = "genui-root", r.appendChild(Xn(e, {
    values: t,
    media: n.sources || {},
    missing: new Set(n.missing || [])
  })), r;
}
function Za(e, t = {}, n = { sources: {}, missing: [] }, r = "GenUI") {
  const a = Ki(e, t, n);
  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${Gi(String(r || "GenUI").slice(0, 120))}</title>
  <style>
    :root { color-scheme: light; }
    html, body { margin: 0; padding: 0; background: #f5f7fa; color: #1f2329; }
    body { padding: 24px; font-family: system-ui, -apple-system, "Segoe UI", sans-serif; }
    *, *::before, *::after { box-sizing: border-box; }
    ${Di}
  </style>
</head>
<body>${a.outerHTML}
<script id="genui-values-data" type="application/json">${Hi(t)}<\/script>
<script>${Ji()}<\/script></body>
</html>`;
}
function el(e, t) {
  const n = document.createElement("a");
  n.download = t, n.href = e, n.click();
}
async function Xi(e, t) {
  const { toPng: n } = await Promise.resolve().then(() => ad), r = await n(e, {
    cacheBust: !0,
    pixelRatio: Math.min(window.devicePixelRatio || 1, 2),
    backgroundColor: "#ffffff"
  });
  el(r, `${t}.png`), console.info("[ugsci.genui] PNG export created", { filename: t, via: "html-to-image" });
}
function Yi(e) {
  return new Promise((t, n) => {
    const r = new FileReader();
    r.onload = () => t(String(r.result || "")), r.onerror = () => n(r.error || new Error("media encoding failed")), r.readAsDataURL(e);
  });
}
async function Qi(e) {
  const t = e.currentSrc || e.src;
  if (!t) return null;
  if (t.startsWith("data:")) return t;
  try {
    const n = await fetch(t);
    return n.ok ? await Yi(await n.blob()) : null;
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
async function tl(e) {
  const t = {}, n = [], r = Array.from(e.querySelectorAll("img[data-genui-media-source]"));
  return await Promise.all(r.map(async (a) => {
    const l = a.dataset.genuiMediaSource || "", o = await Qi(a);
    l && (o ? t[l] = o : n.push(l));
  })), { sources: t, missing: Array.from(new Set(n)) };
}
async function Zi(e, t, n, r, a = r) {
  const l = await tl(e), o = Za(t, n, l, a), i = new Blob([o], { type: "text/html;charset=utf-8" }), s = URL.createObjectURL(i);
  el(s, `${r}.html`), setTimeout(() => URL.revokeObjectURL(s), 1e3), l.missing.length && console.warn("[ugsci.genui] HTML export has media that could not be embedded", { filename: r, missing: l.missing }), console.info("[ugsci.genui] HTML export created", { filename: r, bytes: i.size, embeddedMedia: Object.keys(l.sources).length, missingMedia: l.missing.length });
}
async function ec(e, t, n, r) {
  const a = await tl(e), l = Za(t, n, a, r), o = window.open("", "_blank", "noopener,noreferrer");
  if (!o) throw new Error("print window was blocked");
  o.document.open(), o.document.write(l), o.document.close(), await new Promise((i) => {
    const s = () => i();
    if (o.document.readyState === "complete") {
      window.setTimeout(s, 50);
      return;
    }
    o.addEventListener("load", s, { once: !0 }), window.setTimeout(s, 400);
  }), o.focus(), o.print(), o.close(), a.missing.length && console.warn("[ugsci.genui] PDF print has media that could not be embedded", { missing: a.missing });
}
const tc = [], gt = /* @__PURE__ */ new Map();
function nc(e) {
  gt.set(e, (gt.get(e) || 0) + 1);
}
function rc(e) {
  const t = (gt.get(e) || 1) - 1;
  t > 0 ? gt.set(e, t) : gt.delete(e);
}
function ac(e) {
  return (gt.get(e) || 0) > 0;
}
function lc({ data: e }) {
  var m, h;
  const t = (m = window.QwenPaw) == null ? void 0 : m.host, n = t == null ? void 0 : t.React;
  if (!n) return null;
  const r = ai(), a = n.useRef(/* @__PURE__ */ new Map()), l = ((h = t.getCurrentSessionId) == null ? void 0 : h.call(t)) || "__current_chat__", o = Array.isArray(e.output) ? e.output : tc, i = n.useMemo(
    () => Da(o),
    [o]
  );
  n.useEffect(() => {
    for (const f of i) {
      if (!f.ui_id || !f.tree) continue;
      const g = r.getSnapshot(l, f.ui_id);
      g && g.revision >= (f.revision || 1) || r.setSnapshot({
        schemaVersion: "1",
        uiId: f.ui_id,
        revision: f.revision || 1,
        tree: f.tree,
        sessionId: l,
        sourceToolCallId: f.tool_call_id,
        updatedAt: Date.now()
      });
    }
  }, [i, l]);
  const s = n.useMemo(
    () => i.filter((f) => f.kind === "genui" && !!f.ui_id).map((f) => f.ui_id),
    [i]
  ), d = s.join("\0");
  n.useEffect(() => {
    for (const f of s) nc(f);
    return () => {
      for (const f of s) rc(f);
    };
  }, [d]);
  const u = n.useMemo(
    () => i.map((f) => f.ui_id).filter((f) => !!f),
    [i]
  ), c = li(l, u).filter(
    (f) => (
      // Only include snapshots whose ui_id appears in this response's results
      i.some(
        (g) => g.ui_id === f.uiId && (g.kind === "genui" || g.kind === "genui_patch" && !ac(f.uiId))
      )
    )
  ).sort((f, g) => f.updatedAt - g.updatedAt);
  return c.length === 0 ? null : n.createElement(
    "div",
    { className: "qwenpaw-genui-inline", style: { marginTop: 8, marginBottom: 8 } },
    ...c.map(
      (f) => n.createElement(
        "div",
        {
          key: Ot(f.sessionId, f.uiId),
          className: "qwenpaw-genui-tree",
          "data-genui-id": f.uiId,
          style: { border: "1px solid var(--ant-color-border-secondary, #f0f0f0)", borderRadius: 12, padding: 16, marginBottom: 8, background: "var(--ant-color-bg-container, #fff)" },
          ref: (g) => {
            g && (g.__genuiId = f.uiId);
          }
        },
        n.createElement(
          "div",
          { className: "qwenpaw-genui-export-target" },
          n.createElement(zi, {
            node: f.tree.root,
            onValuesChange: (g) => a.current.set(f.uiId, g),
            children: n.createElement(Ui, { node: f.tree.root })
          })
        ),
        n.createElement(
          "div",
          { style: { display: "flex", justifyContent: "flex-end", gap: 6, marginTop: 8 } },
          n.createElement("button", { type: "button", title: "导出 PNG", onClick: (g) => {
            var v;
            const E = (v = g.currentTarget.closest(".qwenpaw-genui-tree")) == null ? void 0 : v.querySelector(".qwenpaw-genui-export-target");
            E && Xi(E, f.uiId).catch((b) => console.warn("[ugsci.genui] PNG export failed", b));
          } }, "PNG"),
          n.createElement("button", { type: "button", title: "打印或另存为 PDF", onClick: (g) => {
            var v;
            const E = (v = g.currentTarget.closest(".qwenpaw-genui-tree")) == null ? void 0 : v.querySelector(".qwenpaw-genui-export-target");
            E && ec(E, f.tree.root, a.current.get(f.uiId) || {}, f.uiId).catch((b) => console.warn("[ugsci.genui] PDF print failed", b));
          } }, "PDF"),
          n.createElement("button", { type: "button", title: "导出 HTML", onClick: (g) => {
            var v;
            const E = (v = g.currentTarget.closest(".qwenpaw-genui-tree")) == null ? void 0 : v.querySelector(".qwenpaw-genui-export-target");
            E && Zi(E, f.tree.root, a.current.get(f.uiId) || {}, f.uiId, f.uiId).catch((b) => console.warn("[ugsci.genui] HTML export failed", b));
          } }, "HTML")
        )
      )
    )
  );
}
let ot = null;
function oc(e, t) {
  var a, l, o;
  const n = "ugsci";
  ot == null || ot();
  const r = [];
  return de("/ugsci/genui/config", { bypassCache: !0 }).then((i) => {
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
  }), (a = e.chat) != null && a.toolRender && (r.push(e.chat.toolRender(n, "emit_ui_tree", qr)), r.push(e.chat.toolRender(n, "emit_ui_patch", qr)), r.push(e.chat.toolRender(n, "list_ui_components", Jr)), r.push(e.chat.toolRender(n, "get_genui_guide", Jr)), console.info("[ugsci.genui] Registered emit/patch + catalog/guide cards")), (o = (l = e.chat) == null ? void 0 : l.response) != null && o.append && (r.push(e.chat.response.append(
    n,
    (i) => t.createElement(ri, null, t.createElement(lc, { data: i.data })),
    { id: "ugsci.genui.response-append", order: 50 }
  )), console.info("[ugsci.genui] Registered response.append slot")), ot = () => {
    var i;
    for (const s of r.reverse()) (i = s == null ? void 0 : s.dispose) == null || i.call(s);
    if (si(), Si(), e.genui) {
      const s = { ...e.genui };
      delete s.dispose, delete s.clearSession, e.genui = s;
    }
    ot = null;
  }, e.genui = { ...e.genui || {}, dispose: ot, clearSession: oi }, ot;
}
const la = {
  enabled: !0,
  persisted_enabled: !0,
  overridden: !1,
  channels: ["response.append"],
  allow_html: !1,
  allow_actions: [],
  backend_unavailable: !0
};
function _n(e) {
  const t = window.QwenPaw;
  t && (t.genui = { ...t.genui || {}, config: e });
}
function sc() {
  const e = z().React, { Alert: t, Card: n, Space: r, Spin: a, Switch: l, Typography: o, message: i } = z().antd, { useEffect: s, useState: d } = e, [u, p] = d(null), [c, m] = d(!1);
  s(() => {
    let f = !0, g = null;
    const E = (v = !1) => {
      de("/ugsci/genui/config").then((b) => {
        f && (p(b), _n(b));
      }).catch((b) => {
        f && (p(la), _n(la), v && i.error(String(b)), g = setTimeout(() => E(!1), 3e4));
      });
    };
    return E(!0), () => {
      f = !1, g && clearTimeout(g);
    };
  }, []);
  const h = async (f) => {
    m(!0);
    try {
      const g = await de("/ugsci/genui/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: f })
      });
      p(g), _n(g), i.success(g.overridden ? "设置已保存，但环境变量或插件配置正在覆盖它" : f ? "GenUI 已开启" : "GenUI 已关闭");
    } catch (g) {
      i.error(`保存 GenUI 设置失败：${String(g)}`);
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
      n,
      null,
      u === null ? e.createElement(a) : e.createElement(
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
            checked: u.persisted_enabled,
            loading: c,
            disabled: u.backend_unavailable,
            onChange: h
          })
        ),
        e.createElement(t, {
          type: u.backend_unavailable ? "error" : u.enabled ? "success" : "warning",
          showIcon: !0,
          message: u.backend_unavailable ? "UGSci 后端当前不可用，正在使用兼容降级模式；设置不会写入。" : u.enabled ? "GenUI 当前有效；各 Agent 仍可显式关闭自己的 GenUI 工具" : u.overridden ? "GenUI 当前被环境变量或插件配置关闭；本地设置已保存但暂不生效。" : "GenUI 已全局关闭；已有界面仍可查看，但 Agent 不会再生成或更新界面。"
        })
      )
    )
  );
}
let kt = null;
function nl() {
  return kt || (kt = (async () => {
    var r;
    const e = (r = window.QwenPaw) == null ? void 0 : r.host;
    if (!(e != null && e.getApiUrl))
      throw new Error("[oilgas-vis] QwenPaw.host.getApiUrl not available");
    const t = e.getApiUrl(
      "frontend_plugin/ugsci/files/ui/dist/viewer-runtime.js"
    );
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
    throw kt = null, e;
  }), kt);
}
function ic() {
  const e = z().React, { useEffect: t, useRef: n, useState: r } = e, { Spin: a, Alert: l, Button: o, Typography: i, message: s } = z().antd, { Text: d } = i, u = n(null), p = n(null), [c, m] = r(!0), [h, f] = r(null);
  return t(() => {
    let g = !1;
    async function E() {
      if (u.current)
        try {
          m(!0), f(null);
          const v = await nl();
          if (g) return;
          const b = z(), I = {
            apiBase: b.getApiUrl("ugsci/visualization"),
            authToken: b.getApiToken() || void 0
          };
          p.current = v.mount(u.current, I), g || m(!1);
        } catch (v) {
          if (!g) {
            const b = v instanceof Error ? v.message : "Failed to load viewer";
            f(b), m(!1), s.error(`可视化引擎加载失败: ${b}`);
          }
        }
    }
    return E(), () => {
      if (g = !0, p.current) {
        try {
          p.current.dispose();
        } catch (v) {
          console.warn("[oilgas-vis] Dispose error:", v);
        }
        p.current = null;
      }
    };
  }, []), h ? e.createElement(
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
      description: h,
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
      ref: u,
      style: { width: "100%", height: "100%" }
    }),
    c && e.createElement(
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
function rl(e, t) {
  var a;
  const n = ((a = e.getApiToken) == null ? void 0 : a.call(e)) || "", r = typeof e.buildAuthHeaders == "function" ? { ...e.buildAuthHeaders(t.agentId) } : n ? { Authorization: `Bearer ${n}` } : {};
  return t.agentId && (r["X-Agent-Id"] = t.agentId), t.chatId && (r["X-Chat-Id"] = t.chatId), !t.chatId && t.projectDirOverride && (r["X-Session-Project-Dir"] = t.projectDirOverride), r;
}
async function al(e, t, n) {
  if (typeof e.fetch == "function")
    return e.fetch(t, n);
  const r = t.replace(/^\/ugsci\/visualization/, "");
  return fetch(`${e.getApiUrl("ugsci/visualization")}${r}`, n);
}
function oa(e) {
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
function cc({ jobId: e, file: t }) {
  const n = z().React, { useEffect: r, useRef: a, useState: l } = n, o = z(), i = a(null), s = a(null), [d, u] = l("queued"), [p, c] = l(0), [m, h] = l(null), [f, g] = l(null);
  return r(() => {
    let E = !1;
    return (async () => {
      var w;
      const b = `/ugsci/visualization/imports/${e}`;
      for (let I = 0; I < 240 && !E; I += 1) {
        try {
          const R = await al(o, b, {
            headers: { ...rl(o, t) }
          });
          if (!R.ok) throw new Error(`状态查询失败: HTTP ${R.status}`);
          const U = await R.json();
          if (E) return;
          if (c(Number(U.progress || 0)), u(U.status), U.status === "completed") {
            if (!((w = U.result) != null && w.id)) throw new Error("导入完成但未返回数据集 ID");
            g(U.result.id);
            return;
          }
          if (U.status === "failed" || U.status === "cancelled") {
            h(U.error || oa(U.status));
            return;
          }
        } catch (R) {
          if (I >= 239 && !E) {
            u("failed"), h(R instanceof Error ? R.message : String(R));
            return;
          }
        }
        await new Promise((R) => setTimeout(R, 750));
      }
    })(), () => {
      E = !0;
    };
  }, [e, t.agentId, t.chatId, t.projectDirOverride]), r(() => {
    if (d !== "completed" || !f || !i.current) return;
    let E = !1;
    return (async () => {
      var v, b;
      try {
        const w = await nl();
        if (E || !i.current) return;
        s.current = w.mount(i.current, {
          apiBase: o.getApiUrl("ugsci/visualization"),
          authToken: o.getApiToken() || void 0
        });
        let I;
        for (let R = 0; R < 20 && !E; R += 1)
          try {
            await ((b = (v = s.current).executeCommand) == null ? void 0 : b.call(v, "open", { datasetId: f })), I = void 0;
            break;
          } catch (U) {
            I = U;
            const P = U instanceof Error ? U.message : String(U);
            if (!P.includes("数据集不存在") && !P.includes("dataset"))
              throw U;
            await new Promise(($) => setTimeout($, 250));
          }
        if (I && !E) throw I;
      } catch (w) {
        E || (u("failed"), h(w instanceof Error ? w.message : String(w)));
      }
    })(), () => {
      var v;
      E = !0;
      try {
        (v = s.current) == null || v.dispose();
      } catch {
      }
      s.current = null;
    };
  }, [d, f]), n.createElement(
    "div",
    { style: { width: "100%", marginTop: 8 } },
    d === "completed" ? n.createElement("div", {
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
    }) : n.createElement(
      "div",
      { style: { padding: "12px 16px", width: "100%", color: "#8b949e" } },
      `${oa(d)}${p > 0 ? `（${Math.round(p * 100)}%）` : ""}`
    ),
    m ? n.createElement(
      "div",
      { style: { marginTop: 6, color: "#ff7875", fontSize: 12 } },
      `预览状态：${m}`
    ) : null
  );
}
function dc(e) {
  const t = z().React, { useEffect: n, useState: r } = t, { Button: a, Spin: l, Alert: o, Typography: i } = z().antd, { Text: s } = i, d = e.artifact || e.file || {}, u = d.filename || d.title || e.filename || "unknown", p = d.workspacePath || d.path || e.workspacePath, [c, m] = r("idle"), [h, f] = r(null), [g, E] = r(null);
  return n(() => {
    if (!p) return;
    let v = !1;
    return m("submitting"), f(null), E(null), (async () => {
      try {
        const b = z(), w = await al(b, "/ugsci/visualization/imports/workspace", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...rl(b, d)
          },
          body: JSON.stringify({
            path: p,
            root: d.workspaceRoot || "project",
            name: u.replace(/\.[^.]+$/, "")
          })
        });
        if (!w.ok) throw new Error(`Import failed: HTTP ${w.status}`);
        const I = await w.json();
        v || (f(I.job_id), m("submitted"));
      } catch (b) {
        v || (E(b instanceof Error ? b.message : String(b)), m("failed"));
      }
    })(), () => {
      v = !0;
    };
  }, [p, u, d.workspaceRoot, d.agentId, d.chatId, d.projectDirOverride]), c === "submitting" ? t.createElement(
    "div",
    { style: { padding: 24, textAlign: "center" } },
    t.createElement(l, { size: "large" }),
    t.createElement(
      "div",
      { style: { marginTop: 8, color: "#8b949e" } },
      "正在提交工作区文件，浏览器不会复制大型文件..."
    )
  ) : c === "failed" ? t.createElement(
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
    t.createElement(s, { strong: !0 }, `文件: ${u}`),
    d.size ? t.createElement(s, { type: "secondary" }, `大小: ${(d.size / 1024 / 1024).toFixed(1)} MB`) : null,
    h ? t.createElement(cc, { jobId: h, file: d }) : t.createElement(s, { type: "secondary" }, "正在准备导入任务..."),
    t.createElement(a, {
      type: "primary",
      onClick: () => {
        window.history.pushState({}, "", "/oilgas-visualization"), window.dispatchEvent(new PopStateEvent("popstate"));
      }
    }, "打开油气可视化页面")
  );
}
function uc(e, t) {
  const n = "__ugsciVisualizationFrontendRegistered", r = window;
  if (r[n]) return;
  r[n] = !0;
  const a = z().antdIcons || {}, l = a.GlobalOutlined || a.AppstoreOutlined;
  e.route.add("ugsci", {
    id: "ugsci.visualization",
    path: "/oilgas-visualization",
    component: ic
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
        component: dc,
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
    } catch (i) {
      console.warn("[ugsci] Visualization workspace renderer registration failed:", i);
    }
}
function mc() {
  var d, u, p;
  const e = window.QwenPaw;
  if (!(e != null && e.menu) || !(e != null && e.route)) {
    console.warn(
      "[ugsci] QwenPaw.menu/route API not available — plugin disabled"
    );
    return;
  }
  const t = z().React, n = "ugsci";
  (u = (d = e.chat) == null ? void 0 : d.rightHeader) != null && u.add ? (e.chat.rightHeader.add(n, t.createElement(Zs), {
    id: "ugsci.welcome-injector",
    order: -1
    // render before other right-header items (invisible anyway)
  }), console.info("[ugsci] WelcomePromptsInjector registered via rightHeader")) : console.warn(
    "[ugsci] QP.chat.rightHeader.add not available — agent-specific welcome prompts disabled"
  );
  const r = z().antdIcons || {}, a = r.UserSwitchOutlined, l = r.ToolOutlined, o = r.ShopOutlined, i = r.AppstoreOutlined;
  e.route.add(n, {
    id: "ugsci.experts",
    path: "/ugsci-experts",
    component: Qo
  }), e.menu.add(n, {
    id: "ugsci.experts",
    location: "primary.agentScoped",
    label: () => "专家·协作",
    icon: a ? t.createElement(a, { style: { fontSize: 16 } }) : void 0,
    route: "ugsci.experts",
    order: 5,
    visible: () => wt()
  }), e.route.add(n, {
    id: "ugsci.genui-settings",
    path: "/ugsci-genui-settings",
    component: sc
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
    component: Oa
  }), e.menu.add(n, {
    id: "ugsci.tools-skills",
    location: "primary.agentScoped",
    label: () => "工具·技能",
    icon: l ? t.createElement(l, { style: { fontSize: 16 } }) : void 0,
    route: "ugsci.tools-skills",
    order: 6,
    visible: () => wt()
  }), e.route.add(n, {
    id: "ugsci.capabilities",
    path: "/ugsci-capabilities",
    component: zs
  }), e.route.add(n, {
    id: "ugsci.skills-center",
    path: "/ugsci-skills",
    component: $s
  }), e.route.add(n, {
    id: "ugsci.market",
    path: "/ugsci-market",
    component: Ys
  }), e.menu.add(n, {
    id: "ugsci.market",
    location: "primary.agentScoped",
    label: () => "市场",
    icon: o ? t.createElement(o, { style: { fontSize: 16 } }) : void 0,
    route: "ugsci.market",
    order: 7,
    visible: () => wt()
  }), (p = e.sidebar) != null && p.registerSimpleModeItems ? (e.sidebar.registerSimpleModeItems([
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
      const h = e.menu.snapshot("primary.agentScoped").find((f) => f.id === c);
      h && e.menu.replace(n, c, {
        ...h,
        visible: () => !wt()
      });
    } catch {
    }
    try {
      const h = e.menu.snapshot("primary.settings").find((f) => f.id === c);
      h && e.menu.replace(n, c, {
        ...h,
        visible: () => !wt()
      });
    } catch {
    }
  }
  try {
    const m = e.menu.snapshot("primary.agentScoped").find((h) => h.id === "oilgas-vis.page");
    m && e.menu.replace(n, "oilgas-vis.page", {
      ...m,
      visible: () => !1
    });
  } catch {
  }
  oc(e, t), uc(e, t), console.info(
    "[ugsci] Plugin registered: unified Tools & Skills center + compatibility routes, simple-mode navigation active"
  );
}
function Bn() {
  try {
    mc();
  } catch (e) {
    console.error("[ugsci] Failed to build plugin:", e), setTimeout(Bn, 500);
  }
}
var fa;
if ((fa = window.QwenPaw) != null && fa.host)
  Bn();
else {
  const e = setInterval(() => {
    var t;
    (t = window.QwenPaw) != null && t.host && (clearInterval(e), Bn());
  }, 200);
  setTimeout(() => clearInterval(e), 1e4);
}
function pc(e, t) {
  if (e.match(/^[a-z]+:\/\//i))
    return e;
  if (e.match(/^\/\//))
    return window.location.protocol + e;
  if (e.match(/^[a-z]+:/i))
    return e;
  const n = document.implementation.createHTMLDocument(), r = n.createElement("base"), a = n.createElement("a");
  return n.head.appendChild(r), n.body.appendChild(a), t && (r.href = t), a.href = e, a.href;
}
const fc = /* @__PURE__ */ (() => {
  let e = 0;
  const t = () => (
    // eslint-disable-next-line no-bitwise
    `0000${(Math.random() * 36 ** 4 << 0).toString(36)}`.slice(-4)
  );
  return () => (e += 1, `u${t()}${e}`);
})();
function at(e) {
  const t = [];
  for (let n = 0, r = e.length; n < r; n++)
    t.push(e[n]);
  return t;
}
let mt = null;
function ll(e = {}) {
  return mt || (e.includeStyleProperties ? (mt = e.includeStyleProperties, mt) : (mt = at(window.getComputedStyle(document.documentElement)), mt));
}
function ln(e, t) {
  const r = (e.ownerDocument.defaultView || window).getComputedStyle(e).getPropertyValue(t);
  return r ? parseFloat(r.replace("px", "")) : 0;
}
function gc(e) {
  const t = ln(e, "border-left-width"), n = ln(e, "border-right-width");
  return e.clientWidth + t + n;
}
function yc(e) {
  const t = ln(e, "border-top-width"), n = ln(e, "border-bottom-width");
  return e.clientHeight + t + n;
}
function ol(e, t = {}) {
  const n = t.width || gc(e), r = t.height || yc(e);
  return { width: n, height: r };
}
function hc() {
  let e, t;
  try {
    t = process;
  } catch {
  }
  const n = t && t.env ? t.env.devicePixelRatio : null;
  return n && (e = parseInt(n, 10), Number.isNaN(e) && (e = 1)), e || window.devicePixelRatio || 1;
}
const De = 16384;
function Ec(e) {
  (e.width > De || e.height > De) && (e.width > De && e.height > De ? e.width > e.height ? (e.height *= De / e.width, e.width = De) : (e.width *= De / e.height, e.height = De) : e.width > De ? (e.height *= De / e.width, e.width = De) : (e.width *= De / e.height, e.height = De));
}
function on(e) {
  return new Promise((t, n) => {
    const r = new Image();
    r.onload = () => {
      r.decode().then(() => {
        requestAnimationFrame(() => t(r));
      });
    }, r.onerror = n, r.crossOrigin = "anonymous", r.decoding = "async", r.src = e;
  });
}
async function bc(e) {
  return Promise.resolve().then(() => new XMLSerializer().serializeToString(e)).then(encodeURIComponent).then((t) => `data:image/svg+xml;charset=utf-8,${t}`);
}
async function vc(e, t, n) {
  const r = "http://www.w3.org/2000/svg", a = document.createElementNS(r, "svg"), l = document.createElementNS(r, "foreignObject");
  return a.setAttribute("width", `${t}`), a.setAttribute("height", `${n}`), a.setAttribute("viewBox", `0 0 ${t} ${n}`), l.setAttribute("width", "100%"), l.setAttribute("height", "100%"), l.setAttribute("x", "0"), l.setAttribute("y", "0"), l.setAttribute("externalResourcesRequired", "true"), a.appendChild(l), l.appendChild(e), bc(a);
}
const Ne = (e, t) => {
  if (e instanceof t)
    return !0;
  const n = Object.getPrototypeOf(e);
  return n === null ? !1 : n.constructor.name === t.name || Ne(n, t);
};
function wc(e) {
  const t = e.getPropertyValue("content");
  return `${e.cssText} content: '${t.replace(/'|"/g, "")}';`;
}
function Sc(e, t) {
  return ll(t).map((n) => {
    const r = e.getPropertyValue(n), a = e.getPropertyPriority(n);
    return `${n}: ${r}${a ? " !important" : ""};`;
  }).join(" ");
}
function xc(e, t, n, r) {
  const a = `.${e}:${t}`, l = n.cssText ? wc(n) : Sc(n, r);
  return document.createTextNode(`${a}{${l}}`);
}
function sa(e, t, n, r) {
  const a = window.getComputedStyle(e, n), l = a.getPropertyValue("content");
  if (l === "" || l === "none")
    return;
  const o = fc();
  try {
    t.className = `${t.className} ${o}`;
  } catch {
    return;
  }
  const i = document.createElement("style");
  i.appendChild(xc(o, n, a, r)), t.appendChild(i);
}
function kc(e, t, n) {
  sa(e, t, ":before", n), sa(e, t, ":after", n);
}
const ia = "application/font-woff", ca = "image/jpeg", Cc = {
  woff: ia,
  woff2: ia,
  ttf: "application/font-truetype",
  eot: "application/vnd.ms-fontobject",
  png: "image/png",
  jpg: ca,
  jpeg: ca,
  gif: "image/gif",
  tiff: "image/tiff",
  svg: "image/svg+xml",
  webp: "image/webp"
};
function Tc(e) {
  const t = /\.([^./]*?)$/g.exec(e);
  return t ? t[1] : "";
}
function Yn(e) {
  const t = Tc(e).toLowerCase();
  return Cc[t] || "";
}
function _c(e) {
  return e.split(/,/)[1];
}
function Un(e) {
  return e.search(/^(data:)/) !== -1;
}
function Ic(e, t) {
  return `data:${t};base64,${e}`;
}
async function sl(e, t, n) {
  const r = await fetch(e, t);
  if (r.status === 404)
    throw new Error(`Resource "${r.url}" not found`);
  const a = await r.blob();
  return new Promise((l, o) => {
    const i = new FileReader();
    i.onerror = o, i.onloadend = () => {
      try {
        l(n({ res: r, result: i.result }));
      } catch (s) {
        o(s);
      }
    }, i.readAsDataURL(a);
  });
}
const In = {};
function Ac(e, t, n) {
  let r = e.replace(/\?.*/, "");
  return n && (r = e), /ttf|otf|eot|woff2?/i.test(r) && (r = r.replace(/.*\//, "")), t ? `[${t}]${r}` : r;
}
async function Qn(e, t, n) {
  const r = Ac(e, t, n.includeQueryParams);
  if (In[r] != null)
    return In[r];
  n.cacheBust && (e += (/\?/.test(e) ? "&" : "?") + (/* @__PURE__ */ new Date()).getTime());
  let a;
  try {
    const l = await sl(e, n.fetchRequestInit, ({ res: o, result: i }) => (t || (t = o.headers.get("Content-Type") || ""), _c(i)));
    a = Ic(l, t);
  } catch (l) {
    a = n.imagePlaceholder || "";
    let o = `Failed to fetch resource: ${e}`;
    l && (o = typeof l == "string" ? l : l.message), o && console.warn(o);
  }
  return In[r] = a, a;
}
async function zc(e) {
  const t = e.toDataURL();
  return t === "data:," ? e.cloneNode(!1) : on(t);
}
async function $c(e, t) {
  if (e.currentSrc) {
    const l = document.createElement("canvas"), o = l.getContext("2d");
    l.width = e.clientWidth, l.height = e.clientHeight, o == null || o.drawImage(e, 0, 0, l.width, l.height);
    const i = l.toDataURL();
    return on(i);
  }
  const n = e.poster, r = Yn(n), a = await Qn(n, r, t);
  return on(a);
}
async function Pc(e, t) {
  var n;
  try {
    if (!((n = e == null ? void 0 : e.contentDocument) === null || n === void 0) && n.body)
      return await gn(e.contentDocument.body, t, !0);
  } catch {
  }
  return e.cloneNode(!1);
}
async function Oc(e, t) {
  return Ne(e, HTMLCanvasElement) ? zc(e) : Ne(e, HTMLVideoElement) ? $c(e, t) : Ne(e, HTMLIFrameElement) ? Pc(e, t) : e.cloneNode(il(e));
}
const Mc = (e) => e.tagName != null && e.tagName.toUpperCase() === "SLOT", il = (e) => e.tagName != null && e.tagName.toUpperCase() === "SVG";
async function Rc(e, t, n) {
  var r, a;
  if (il(t))
    return t;
  let l = [];
  return Mc(e) && e.assignedNodes ? l = at(e.assignedNodes()) : Ne(e, HTMLIFrameElement) && (!((r = e.contentDocument) === null || r === void 0) && r.body) ? l = at(e.contentDocument.body.childNodes) : l = at(((a = e.shadowRoot) !== null && a !== void 0 ? a : e).childNodes), l.length === 0 || Ne(e, HTMLVideoElement) || await l.reduce((o, i) => o.then(() => gn(i, n)).then((s) => {
    s && t.appendChild(s);
  }), Promise.resolve()), t;
}
function Lc(e, t, n) {
  const r = t.style;
  if (!r)
    return;
  const a = window.getComputedStyle(e);
  a.cssText ? (r.cssText = a.cssText, r.transformOrigin = a.transformOrigin) : ll(n).forEach((l) => {
    let o = a.getPropertyValue(l);
    l === "font-size" && o.endsWith("px") && (o = `${Math.floor(parseFloat(o.substring(0, o.length - 2))) - 0.1}px`), Ne(e, HTMLIFrameElement) && l === "display" && o === "inline" && (o = "block"), l === "d" && t.getAttribute("d") && (o = `path(${t.getAttribute("d")})`), r.setProperty(l, o, a.getPropertyPriority(l));
  });
}
function Bc(e, t) {
  Ne(e, HTMLTextAreaElement) && (t.innerHTML = e.value), Ne(e, HTMLInputElement) && t.setAttribute("value", e.value);
}
function Uc(e, t) {
  if (Ne(e, HTMLSelectElement)) {
    const n = t, r = Array.from(n.children).find((a) => e.value === a.getAttribute("value"));
    r && r.setAttribute("selected", "");
  }
}
function jc(e, t, n) {
  return Ne(t, Element) && (Lc(e, t, n), kc(e, t, n), Bc(e, t), Uc(e, t)), t;
}
async function Nc(e, t) {
  const n = e.querySelectorAll ? e.querySelectorAll("use") : [];
  if (n.length === 0)
    return e;
  const r = {};
  for (let l = 0; l < n.length; l++) {
    const i = n[l].getAttribute("xlink:href");
    if (i) {
      const s = e.querySelector(i), d = document.querySelector(i);
      !s && d && !r[i] && (r[i] = await gn(d, t, !0));
    }
  }
  const a = Object.values(r);
  if (a.length) {
    const l = "http://www.w3.org/1999/xhtml", o = document.createElementNS(l, "svg");
    o.setAttribute("xmlns", l), o.style.position = "absolute", o.style.width = "0", o.style.height = "0", o.style.overflow = "hidden", o.style.display = "none";
    const i = document.createElementNS(l, "defs");
    o.appendChild(i);
    for (let s = 0; s < a.length; s++)
      i.appendChild(a[s]);
    e.appendChild(o);
  }
  return e;
}
async function gn(e, t, n) {
  return !n && t.filter && !t.filter(e) ? null : Promise.resolve(e).then((r) => Oc(r, t)).then((r) => Rc(e, r, t)).then((r) => jc(e, r, t)).then((r) => Nc(r, t));
}
const cl = /url\((['"]?)([^'"]+?)\1\)/g, Fc = /url\([^)]+\)\s*format\((["']?)([^"']+)\1\)/g, Dc = /src:\s*(?:url\([^)]+\)\s*format\([^)]+\)[,;]\s*)+/g;
function Gc(e) {
  const t = e.replace(/([.*+?^${}()|\[\]\/\\])/g, "\\$1");
  return new RegExp(`(url\\(['"]?)(${t})(['"]?\\))`, "g");
}
function Hc(e) {
  const t = [];
  return e.replace(cl, (n, r, a) => (t.push(a), n)), t.filter((n) => !Un(n));
}
async function Wc(e, t, n, r, a) {
  try {
    const l = n ? pc(t, n) : t, o = Yn(t);
    let i;
    return a || (i = await Qn(l, o, r)), e.replace(Gc(t), `$1${i}$3`);
  } catch {
  }
  return e;
}
function Vc(e, { preferredFontFormat: t }) {
  return t ? e.replace(Dc, (n) => {
    for (; ; ) {
      const [r, , a] = Fc.exec(n) || [];
      if (!a)
        return "";
      if (a === t)
        return `src: ${r};`;
    }
  }) : e;
}
function dl(e) {
  return e.search(cl) !== -1;
}
async function ul(e, t, n) {
  if (!dl(e))
    return e;
  const r = Vc(e, n);
  return Hc(r).reduce((l, o) => l.then((i) => Wc(i, o, t, n)), Promise.resolve(r));
}
async function pt(e, t, n) {
  var r;
  const a = (r = t.style) === null || r === void 0 ? void 0 : r.getPropertyValue(e);
  if (a) {
    const l = await ul(a, null, n);
    return t.style.setProperty(e, l, t.style.getPropertyPriority(e)), !0;
  }
  return !1;
}
async function qc(e, t) {
  await pt("background", e, t) || await pt("background-image", e, t), await pt("mask", e, t) || await pt("-webkit-mask", e, t) || await pt("mask-image", e, t) || await pt("-webkit-mask-image", e, t);
}
async function Jc(e, t) {
  const n = Ne(e, HTMLImageElement);
  if (!(n && !Un(e.src)) && !(Ne(e, SVGImageElement) && !Un(e.href.baseVal)))
    return;
  const r = n ? e.src : e.href.baseVal, a = await Qn(r, Yn(r), t);
  await new Promise((l, o) => {
    e.onload = l, e.onerror = t.onImageErrorHandler ? (...s) => {
      try {
        l(t.onImageErrorHandler(...s));
      } catch (d) {
        o(d);
      }
    } : o;
    const i = e;
    i.decode && (i.decode = l), i.loading === "lazy" && (i.loading = "eager"), n ? (e.srcset = "", e.src = a) : e.href.baseVal = a;
  });
}
async function Kc(e, t) {
  const r = at(e.childNodes).map((a) => ml(a, t));
  await Promise.all(r).then(() => e);
}
async function ml(e, t) {
  Ne(e, Element) && (await qc(e, t), await Jc(e, t), await Kc(e, t));
}
function Xc(e, t) {
  const { style: n } = e;
  t.backgroundColor && (n.backgroundColor = t.backgroundColor), t.width && (n.width = `${t.width}px`), t.height && (n.height = `${t.height}px`);
  const r = t.style;
  return r != null && Object.keys(r).forEach((a) => {
    n[a] = r[a];
  }), e;
}
const da = {};
async function ua(e) {
  let t = da[e];
  if (t != null)
    return t;
  const r = await (await fetch(e)).text();
  return t = { url: e, cssText: r }, da[e] = t, t;
}
async function ma(e, t) {
  let n = e.cssText;
  const r = /url\(["']?([^"')]+)["']?\)/g, l = (n.match(/url\([^)]+\)/g) || []).map(async (o) => {
    let i = o.replace(r, "$1");
    return i.startsWith("https://") || (i = new URL(i, e.url).href), sl(i, t.fetchRequestInit, ({ result: s }) => (n = n.replace(o, `url(${s})`), [o, s]));
  });
  return Promise.all(l).then(() => n);
}
function pa(e) {
  if (e == null)
    return [];
  const t = [], n = /(\/\*[\s\S]*?\*\/)/gi;
  let r = e.replace(n, "");
  const a = new RegExp("((@.*?keyframes [\\s\\S]*?){([\\s\\S]*?}\\s*?)})", "gi");
  for (; ; ) {
    const s = a.exec(r);
    if (s === null)
      break;
    t.push(s[0]);
  }
  r = r.replace(a, "");
  const l = /@import[\s\S]*?url\([^)]*\)[\s\S]*?;/gi, o = "((\\s*?(?:\\/\\*[\\s\\S]*?\\*\\/)?\\s*?@media[\\s\\S]*?){([\\s\\S]*?)}\\s*?})|(([\\s\\S]*?){([\\s\\S]*?)})", i = new RegExp(o, "gi");
  for (; ; ) {
    let s = l.exec(r);
    if (s === null) {
      if (s = i.exec(r), s === null)
        break;
      l.lastIndex = i.lastIndex;
    } else
      i.lastIndex = l.lastIndex;
    t.push(s[0]);
  }
  return t;
}
async function Yc(e, t) {
  const n = [], r = [];
  return e.forEach((a) => {
    if ("cssRules" in a)
      try {
        at(a.cssRules || []).forEach((l, o) => {
          if (l.type === CSSRule.IMPORT_RULE) {
            let i = o + 1;
            const s = l.href, d = ua(s).then((u) => ma(u, t)).then((u) => pa(u).forEach((p) => {
              try {
                a.insertRule(p, p.startsWith("@import") ? i += 1 : a.cssRules.length);
              } catch (c) {
                console.error("Error inserting rule from remote css", {
                  rule: p,
                  error: c
                });
              }
            })).catch((u) => {
              console.error("Error loading remote css", u.toString());
            });
            r.push(d);
          }
        });
      } catch (l) {
        const o = e.find((i) => i.href == null) || document.styleSheets[0];
        a.href != null && r.push(ua(a.href).then((i) => ma(i, t)).then((i) => pa(i).forEach((s) => {
          o.insertRule(s, o.cssRules.length);
        })).catch((i) => {
          console.error("Error loading remote stylesheet", i);
        })), console.error("Error inlining remote css file", l);
      }
  }), Promise.all(r).then(() => (e.forEach((a) => {
    if ("cssRules" in a)
      try {
        at(a.cssRules || []).forEach((l) => {
          n.push(l);
        });
      } catch (l) {
        console.error(`Error while reading CSS rules from ${a.href}`, l);
      }
  }), n));
}
function Qc(e) {
  return e.filter((t) => t.type === CSSRule.FONT_FACE_RULE).filter((t) => dl(t.style.getPropertyValue("src")));
}
async function Zc(e, t) {
  if (e.ownerDocument == null)
    throw new Error("Provided element is not within a Document");
  const n = at(e.ownerDocument.styleSheets), r = await Yc(n, t);
  return Qc(r);
}
function pl(e) {
  return e.trim().replace(/["']/g, "");
}
function ed(e) {
  const t = /* @__PURE__ */ new Set();
  function n(r) {
    (r.style.fontFamily || getComputedStyle(r).fontFamily).split(",").forEach((l) => {
      t.add(pl(l));
    }), Array.from(r.children).forEach((l) => {
      l instanceof HTMLElement && n(l);
    });
  }
  return n(e), t;
}
async function td(e, t) {
  const n = await Zc(e, t), r = ed(e);
  return (await Promise.all(n.filter((l) => r.has(pl(l.style.fontFamily))).map((l) => {
    const o = l.parentStyleSheet ? l.parentStyleSheet.href : null;
    return ul(l.cssText, o, t);
  }))).join(`
`);
}
async function nd(e, t) {
  const n = t.fontEmbedCSS != null ? t.fontEmbedCSS : t.skipFonts ? null : await td(e, t);
  if (n) {
    const r = document.createElement("style"), a = document.createTextNode(n);
    r.appendChild(a), e.firstChild ? e.insertBefore(r, e.firstChild) : e.appendChild(r);
  }
}
async function fl(e, t = {}) {
  const { width: n, height: r } = ol(e, t), a = await gn(e, t, !0);
  return await nd(a, t), await ml(a, t), Xc(a, t), await vc(a, n, r);
}
async function gl(e, t = {}) {
  const { width: n, height: r } = ol(e, t), a = await fl(e, t), l = await on(a), o = document.createElement("canvas"), i = o.getContext("2d"), s = t.pixelRatio || hc(), d = t.canvasWidth || n, u = t.canvasHeight || r;
  return o.width = d * s, o.height = u * s, t.skipAutoScale || Ec(o), o.style.width = `${d}`, o.style.height = `${u}`, t.backgroundColor && (i.fillStyle = t.backgroundColor, i.fillRect(0, 0, o.width, o.height)), i.drawImage(l, 0, 0, o.width, o.height), o;
}
async function rd(e, t = {}) {
  return (await gl(e, t)).toDataURL();
}
const ad = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  toCanvas: gl,
  toPng: rd,
  toSvg: fl
}, Symbol.toStringTag, { value: "Module" }));
