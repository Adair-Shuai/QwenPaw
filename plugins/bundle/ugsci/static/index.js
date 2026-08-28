function T() {
  var t;
  const e = (t = window.QwenPaw) == null ? void 0 : t.host;
  if (!e) throw new Error("[ugsci] QwenPaw.host not available");
  return e;
}
function Vl() {
  try {
    return T().getApiToken() || "";
  } catch {
    return "";
  }
}
function dn(e) {
  return T().getApiUrl(e);
}
function Jl(e) {
  const t = Vl();
  return {
    "Content-Type": "application/json",
    ...t ? { Authorization: `Bearer ${t}` } : {},
    ...e
  };
}
function ql(e) {
  const t = new Headers(e), n = {};
  return t.forEach((r, a) => {
    n[a] = r;
  }), n;
}
function Qe(e, t) {
  const n = T(), r = ql(t == null ? void 0 : t.headers);
  return n.fetch ? n.fetch(e, { ...t, headers: r }) : fetch(n.getApiUrl(e), {
    ...t,
    headers: { ...Jl(), ...r }
  });
}
const zt = /* @__PURE__ */ new Map(), Kl = 15e3;
function Xl(e) {
  return e ? e instanceof Headers ? e.get("X-Agent-Id") || e.get("x-agent-id") || "" : e["X-Agent-Id"] || e["x-agent-id"] || "" : "";
}
function Yl(e, t, n) {
  return `${e}:${t}:${n}`;
}
function Lt() {
  zt.clear();
}
function Dn(e) {
  for (const [t, n] of zt)
    (e ? n.agentId === e : n.agentId) && zt.delete(t);
}
async function de(e, t) {
  const n = ((t == null ? void 0 : t.method) || "GET").toUpperCase(), { bypassCache: r, ...a } = t || {}, l = Xl(
    a.headers
  ), s = Yl(n, e, l);
  if (n !== "GET" && (l ? Dn(l) : Lt()), n === "GET" && !r) {
    const c = zt.get(s);
    if (c && Date.now() - c.ts < Kl)
      return c.data;
  }
  const i = await Qe(e, a);
  if (!i.ok) {
    const c = await i.text().catch(() => "");
    throw new Error(c || `HTTP ${i.status}`);
  }
  if (i.status === 204) return null;
  const o = await i.json();
  return n === "GET" && zt.set(s, {
    data: o,
    ts: Date.now(),
    agentId: l || void 0
  }), o;
}
const je = {
  background: "#0072f5",
  color: "#fff",
  fontSize: 13,
  fontWeight: 600,
  border: "none",
  borderRadius: 8
};
function Ht() {
  try {
    return localStorage.getItem("qwenpaw_sidebar_mode") === "simple";
  } catch {
    return !1;
  }
}
function Fn(e, t) {
  const n = T();
  return n.ReactMarkdown && n.remarkGfm ? t.createElement(
    n.ReactMarkdown,
    { remarkPlugins: [n.remarkGfm] },
    e
  ) : e.replace(/\*\*(.+?)\*\*/g, "$1").replace(/\*(.+?)\*/g, "$1").replace(/`(.+?)`/g, "$1").replace(/^#+\s*/gm, "").replace(/^[-*]\s+/gm, "• ");
}
function un({
  title: e,
  subtitle: t,
  extra: n
}) {
  const r = T().React, { Space: a } = T().antd;
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
async function mn() {
  const e = await de("/agents");
  return (e == null ? void 0 : e.agents) || [];
}
async function Gn(e) {
  return de(
    `/agents/${encodeURIComponent(e)}`
  );
}
async function pn(e) {
  return await de(
    `/agents/${encodeURIComponent(e)}/skills`
  ) || [];
}
async function fn(e = !1) {
  return await de(`/skills/pool${e ? "?summary=true" : ""}`) || [];
}
async function Ql(e) {
  const t = await de(
    `/skills/pool/${encodeURIComponent(e)}/content`
  );
  return (t == null ? void 0 : t.content) || "";
}
async function Zl() {
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
function Sa(e) {
  var n;
  const t = [];
  for (const r of e) {
    if (r.enabled === !1) continue;
    const a = (n = r.description) == null ? void 0 : n.trim();
    if (!a) continue;
    const l = (r.name || a).length > 20 ? (r.name || a).substring(0, 18) + "…" : r.name || a;
    let s = a;
    if (s = s.replace(/\*\*(.+?)\*\*/g, "$1").replace(/\*(.+?)\*/g, "$1").replace(/`(.+?)`/g, "$1").replace(/^#+\s*/gm, "").trim(), /^(用于|帮助|提供|支持|实现|完成|分析|计算|生成|创建|检查)/.test(s) ? s = `请${s}` : /^(a |an |the )/i.test(s) ? s = `Help me with ${s}` : /[。？！.?!]$/.test(s) || (s = `帮我${s}`), s.length > 80 && (s = s.substring(0, 77) + "..."), t.push({ label: l, value: s }), t.length >= 4) break;
  }
  return t;
}
async function eo(e) {
  return await de("/workspace/files", {
    headers: { "X-Agent-Id": e }
  }) || [];
}
async function nn(e, t, n) {
  return de(`/workspace/files/${encodeURIComponent(t)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify({ content: n })
  });
}
async function to(e, t, n, r) {
  return de("/workspace/prompt-files", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify({ filename: t, content: n, enable: r })
  });
}
const no = /* @__PURE__ */ new Set([
  "CON",
  "PRN",
  "AUX",
  "NUL",
  ...Array.from({ length: 9 }, (e, t) => `COM${t + 1}`),
  ...Array.from({ length: 9 }, (e, t) => `LPT${t + 1}`)
]);
function ro(e) {
  let t = e.trim();
  if (!t) throw new Error("请输入文件名");
  if (/[\\/]/.test(t)) throw new Error("文件名不能包含路径分隔符");
  if (/[<>:\"|?*\u0000-\u001f]/.test(t))
    throw new Error("文件名包含系统不支持的字符");
  if (/[ .]$/.test(t)) throw new Error("文件名不能以空格或句点结尾");
  t.toLowerCase().endsWith(".md") ? t = `${t.slice(0, -3)}.md` : t += ".md";
  const n = t.split(".", 1)[0].toUpperCase();
  if (!t.slice(0, -3)) throw new Error("文件名不能为空");
  if (no.has(n))
    throw new Error("该文件名是系统保留名称，请更换");
  if (new TextEncoder().encode(t).length > 255)
    throw new Error("文件名过长");
  return t;
}
async function ao(e, t) {
  const n = await Gn(e);
  n.system_prompt_files = t, await de(`/agents/${encodeURIComponent(e)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(n)
  });
}
async function Hn(e, t) {
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
async function xa(e, t) {
  await de(
    ht(e, `/${encodeURIComponent(t)}/enable`),
    {
      method: "POST"
    }
  );
}
async function Wn(e, t) {
  await de(ht(e, `/${encodeURIComponent(t)}`), {
    method: "DELETE"
  });
}
async function lo(e, t) {
  return de(ht(e, "/batch-enable"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(t)
  });
}
async function oo(e, t) {
  return de(ht(e, "/batch-disable"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(t)
  });
}
async function so(e, t) {
  return de(ht(e, "/batch-delete"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(t)
  });
}
async function Vn(e) {
  return await de("/mcp", {
    headers: { "X-Agent-Id": e }
  }) || [];
}
async function ka(e, t) {
  await de(`/mcp/${encodeURIComponent(t)}`, {
    method: "DELETE",
    headers: { "X-Agent-Id": e }
  });
}
async function Jn(e, t) {
  return de("/mcp", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify(t)
  });
}
async function io(e, t) {
  return de(
    `/mcp/toggle/${encodeURIComponent(t)}`,
    {
      method: "PATCH",
      headers: { "X-Agent-Id": e }
    }
  );
}
async function Ca(e, t) {
  await de(
    ht(e, `/${encodeURIComponent(t)}/disable`),
    {
      method: "POST"
    }
  );
}
async function co(e) {
  await de(`/skills/pool/${encodeURIComponent(e)}`, {
    method: "DELETE"
  });
}
function uo(e) {
  const t = (e || "").trim();
  if (!t) return { number: 6, unit: "h" };
  const n = t.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/i);
  if (!n) return { number: 6, unit: "h" };
  const r = parseInt(n[1] || "0", 10), a = parseInt(n[2] || "0", 10), l = parseInt(n[3] || "0", 10), s = r * 60 + a + Math.round(l / 60);
  return s <= 0 ? { number: 6, unit: "h" } : s >= 60 && s % 60 === 0 ? { number: s / 60, unit: "h" } : { number: s, unit: "m" };
}
function mo(e) {
  return e.unit === "h" ? `${e.number}h` : `${e.number}m`;
}
async function po(e) {
  return de("/config/heartbeat", {
    headers: { "X-Agent-Id": e }
  });
}
async function fo(e, t) {
  return de("/config/heartbeat", {
    method: "PUT",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify(t)
  });
}
async function go(e) {
  await de("/config/heartbeat/run", {
    method: "POST",
    headers: { "X-Agent-Id": e }
  });
}
async function yo(e) {
  return de("/workspace/running-config", {
    headers: { "X-Agent-Id": e }
  });
}
async function ho(e, t) {
  return de("/workspace/running-config", {
    method: "PUT",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify(t)
  });
}
async function Eo(e) {
  return (await de("/workspace/language", {
    headers: { "X-Agent-Id": e }
  })).language || "zh";
}
async function bo(e, t) {
  await de("/workspace/language", {
    method: "PUT",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify({ language: t })
  });
}
async function vo() {
  return (await de("/config/user-timezone")).timezone || "UTC";
}
async function wo(e) {
  await de("/config/user-timezone", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ timezone: e })
  });
}
async function So(e) {
  return await de("/workspace/system-prompt-files", {
    headers: { "X-Agent-Id": e }
  }) || [];
}
const Ar = ["AGENTS.md", "SOUL.md", "PROFILE.md"];
function xo({
  items: e,
  max: t = 5,
  color: n = "blue",
  emptyText: r = "无"
}) {
  const a = T().React, { Tag: l } = T().antd;
  return !e || e.length === 0 ? a.createElement(
    "span",
    { style: { fontSize: 12, color: "var(--ant-color-text-quaternary, #bfbfbf)" } },
    r
  ) : a.createElement(
    "div",
    { style: { display: "flex", flexWrap: "wrap", gap: 4 } },
    ...e.slice(0, t).map(
      (s, i) => a.createElement(
        l,
        { key: i, color: n, style: { fontSize: 11, marginRight: 0 } },
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
function Ta({
  open: e,
  onClose: t,
  poolSkills: n,
  installedSkillNames: r,
  loading: a,
  onInstall: l
}) {
  const s = T().React, { useState: i, useEffect: o, useMemo: c } = s, { Modal: u, Button: f, Empty: d, Spin: m, Input: v, Tag: g, Tooltip: p, Typography: h } = T().antd, { CheckOutlined: E, SearchOutlined: w } = T().antdIcons || {}, { Text: b } = h, [x, M] = i([]), [D, $] = i("");
  o(() => {
    e && (M([]), $(""));
  }, [e]);
  const A = c(() => {
    if (!D.trim()) return n;
    const k = D.toLowerCase();
    return n.filter(
      (S) => {
        var z, I;
        return S.name.toLowerCase().includes(k) || ((z = S.description) == null ? void 0 : z.toLowerCase().includes(k)) || ((I = S.tags) == null ? void 0 : I.some((W) => W.toLowerCase().includes(k)));
      }
    );
  }, [n, D]), F = A.filter(
    (k) => !r.includes(k.name)
  ), V = (k) => {
    M(
      (S) => S.includes(k) ? S.filter((z) => z !== k) : [...S, k]
    );
  }, U = async () => {
    x.length !== 0 && (await l(x), M([]));
  };
  return s.createElement(
    u,
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
          b,
          { type: "secondary", style: { fontSize: 13 } },
          `已选择 ${x.length} 个技能`
        ),
        s.createElement(
          "div",
          { style: { display: "flex", gap: 8 } },
          s.createElement(f, { onClick: t }, "取消"),
          s.createElement(
            f,
            {
              type: "primary",
              onClick: U,
              disabled: x.length === 0
            },
            x.length > 0 ? `添加 (${x.length})` : "添加"
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
      s.createElement(v, {
        placeholder: "搜索技能名称、描述或标签...",
        prefix: w ? s.createElement(w) : void 0,
        value: D,
        onChange: (k) => $(k.target.value),
        allowClear: !0,
        style: { flex: 1 }
      }),
      s.createElement(
        f,
        {
          size: "small",
          type: "primary",
          onClick: () => M(F.map((k) => k.name))
        },
        "全选"
      ),
      s.createElement(
        f,
        {
          size: "small",
          onClick: () => M([])
        },
        "清空"
      )
    ),
    // Skill grid (card style matching Skill Center)
    a ? s.createElement(
      "div",
      { style: { textAlign: "center", padding: 40 } },
      s.createElement(m, { size: "large" })
    ) : A.length === 0 ? s.createElement(d, {
      description: D ? "未找到匹配的技能" : "技能池暂无可用技能",
      image: d.PRESENTED_IMAGE_SIMPLE
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
      ...A.map((k) => {
        const S = x.includes(k.name), z = r.includes(k.name);
        return s.createElement(
          "div",
          {
            key: k.name,
            onClick: () => !z && V(k.name),
            style: {
              position: "relative",
              padding: "10px 12px",
              border: `1px solid ${S ? "#0072f5" : "var(--ant-color-border-secondary, #e8e8e8)"}`,
              borderRadius: 6,
              cursor: z ? "not-allowed" : "pointer",
              transition: "all 0.15s ease",
              background: S ? "rgba(0, 114, 245, 0.06)" : z ? "var(--ant-color-fill-quaternary, #fafafa)" : "var(--ant-color-bg-container, #fff)",
              opacity: z ? 0.5 : 1,
              minHeight: 64
            }
          },
          S ? s.createElement(
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
            E ? s.createElement(E) : "✓"
          ) : null,
          z ? s.createElement(
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
                paddingRight: z || S ? 24 : 0
              }
            },
            s.createElement(
              "span",
              { style: { fontSize: 16 } },
              k.emoji || "⚡"
            ),
            s.createElement(
              p,
              { title: k.name },
              s.createElement(
                b,
                {
                  strong: !0,
                  style: {
                    fontSize: 13,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap"
                  }
                },
                k.name
              )
            )
          ),
          k.description ? s.createElement(
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
            k.description
          ) : null,
          k.tags && k.tags.length > 0 ? s.createElement(
            "div",
            {
              style: {
                marginTop: 4,
                display: "flex",
                gap: 2,
                flexWrap: "wrap"
              }
            },
            ...k.tags.slice(0, 2).map(
              (I, W) => s.createElement(
                g,
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
function _a({
  agentId: e,
  systemPromptFiles: t,
  onRefresh: n
}) {
  const r = T().React, { useState: a, useEffect: l, useCallback: s, useRef: i } = r, {
    List: o,
    Tag: c,
    Switch: u,
    Button: f,
    Modal: d,
    Input: m,
    Spin: v,
    Empty: g,
    message: p,
    Typography: h,
    Segmented: E,
    Alert: w
  } = T().antd, { FileTextOutlined: b, PlusOutlined: x, EditOutlined: M, ReloadOutlined: D } = T().antdIcons || {}, { Text: $ } = h, [A, F] = a([]), [V, U] = a(!0), [k, S] = a(
    t || []
  ), [z, I] = a(!1), [W, j] = a(null), [G, O] = a(""), [P, ee] = a(""), [oe, B] = a(!1), [L, le] = a("source"), re = i(0), q = s(async () => {
    const Z = ++re.current;
    U(!0);
    try {
      const ie = await eo(e);
      Z === re.current && F(ie);
    } catch (ie) {
      Z === re.current && (p.error(ie.message || "加载工作区文档失败"), F([]));
    } finally {
      Z === re.current && U(!1);
    }
  }, [e]);
  l(() => {
    q();
  }, [q]), l(() => {
    S(t || []);
  }, [t]);
  const me = async (Z, ie) => {
    const te = new Set(k);
    if (ie)
      te.add(Z);
    else {
      if (Ar.includes(Z) && Z === "AGENTS.md") {
        p.warning("AGENTS.md 是核心文件，不能停用");
        return;
      }
      te.delete(Z);
    }
    const be = Array.from(te);
    S(be);
    try {
      await ao(e, be), p.success(ie ? "已启用记忆文件" : "已停用记忆文件"), n();
    } catch (ve) {
      p.error(ve.message || "更新失败"), S(t || []);
    }
  }, R = async (Z) => {
    try {
      const ie = await de(
        `/workspace/files/${encodeURIComponent(Z)}`,
        { headers: { "X-Agent-Id": e } }
      );
      j(Z), O(ie.content || ""), le("source"), I(!0);
    } catch (ie) {
      p.error(ie.message || "读取文件失败");
    }
  }, ce = () => {
    j(null), O(""), ee(""), le("source"), I(!0);
  }, ye = async () => {
    let Z;
    try {
      Z = ro(W || P);
    } catch (ie) {
      p.warning(ie.message || "文件名无效");
      return;
    }
    if (!G.trim()) {
      p.warning("Markdown 文档不能为空");
      return;
    }
    if (new TextEncoder().encode(G).length > 1024 * 1024) {
      p.warning("Markdown 文档不能超过 1 MB");
      return;
    }
    B(!0);
    try {
      if (W)
        await nn(e, Z, G);
      else {
        const ie = await to(
          e,
          Z,
          G,
          !0
        );
        S(ie.system_prompt_files);
      }
      p.success("保存成功"), I(!1), q(), n();
    } catch (ie) {
      const te = ie != null && ie.message ? `：${ie.message}` : "";
      p.error(
        W ? (ie == null ? void 0 : ie.message) || "保存失败" : `创建并挂载失败，服务端已回滚文件${te}`
      );
    } finally {
      B(!1);
    }
  };
  return V ? r.createElement(
    "div",
    { style: { textAlign: "center", padding: 40 } },
    r.createElement(v, { size: "large" })
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
        b ? r.createElement(b, {
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
          `· ${k.length} 个已挂载到系统提示`
        )
      ),
      r.createElement(
        "div",
        { style: { display: "flex", gap: 8 } },
        r.createElement(
          f,
          {
            size: "small",
            icon: D ? r.createElement(D) : void 0,
            onClick: q
          },
          "刷新"
        ),
        r.createElement(
          f,
          {
            type: "primary",
            size: "small",
            icon: x ? r.createElement(x) : void 0,
            onClick: ce
          },
          "新建 Markdown 文档"
        )
      )
    ),
    A.length === 0 ? r.createElement(g, {
      description: "暂无 Markdown 文档，点击「新建 Markdown 文档」添加",
      image: g.PRESENTED_IMAGE_SIMPLE
    }) : r.createElement(o, {
      dataSource: A,
      renderItem: (Z) => {
        const ie = k.includes(Z.filename), te = Ar.includes(Z.filename);
        return r.createElement(
          o.Item,
          {
            actions: [
              r.createElement(
                f,
                {
                  type: "link",
                  size: "small",
                  icon: M ? r.createElement(M) : void 0,
                  onClick: () => R(Z.filename)
                },
                "编辑"
              )
            ]
          },
          r.createElement(o.Item.Meta, {
            avatar: r.createElement(b, {
              style: {
                fontSize: 20,
                color: ie ? "#1677ff" : "var(--ant-color-text-quaternary, #bfbfbf)"
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
              `${(Z.size / 1024).toFixed(1)} KB · 修改于 ${new Date(Z.modified_time).toLocaleString()}`
            )
          }),
          r.createElement(u, {
            checked: ie,
            size: "small",
            onChange: (be) => me(Z.filename, be)
          })
        );
      }
    }),
    // Edit/New file modal
    r.createElement(
      d,
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
        r.createElement(m, {
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
        r.createElement(E, {
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
          `${G.length} 字符 · 约 ${Math.ceil(G.length / 4)} tokens · ${W && k.includes(W) ? "已挂载" : W ? "未挂载" : "保存后自动挂载"}`
        )
      ),
      G.trim() ? null : r.createElement(w, {
        type: "warning",
        showIcon: !0,
        message: "文档内容为空，保存前需要填写 Markdown 内容",
        style: { marginBottom: 10 }
      }),
      L === "source" ? r.createElement(m.TextArea, {
        value: G,
        onChange: (Z) => O(Z.target.value),
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
        Fn(G, r)
      )
    )
  );
}
function ko({
  skills: e,
  agentId: t
}) {
  const n = T().React, { useMemo: r } = n, {
    List: a,
    Tag: l,
    Typography: s,
    Empty: i,
    Button: o,
    message: c
  } = T().antd, { ThunderboltOutlined: u, CopyOutlined: f } = T().antdIcons || {}, { Text: d } = s, m = r(() => Sa(e), [e]), v = (p) => {
    try {
      const h = T();
      h.setSelectedAgent && h.setSelectedAgent(t);
    } catch {
    }
    try {
      sessionStorage.setItem("ugsci_pending_prompt", p.value);
    } catch {
    }
    window.history.pushState({}, "", "/chat"), window.dispatchEvent(new PopStateEvent("popstate"));
  }, g = (p) => {
    var h;
    (h = navigator.clipboard) == null || h.writeText(p.value).then(() => {
      c.success("已复制到剪贴板");
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
        d,
        { strong: !0 },
        `推荐提问 (${m.length})`
      ),
      n.createElement(
        d,
        { type: "secondary", style: { fontSize: 12 } },
        "· 从技能描述中自动提取"
      )
    ),
    n.createElement(a, {
      dataSource: m,
      renderItem: (p, h) => n.createElement(
        a.Item,
        {
          actions: [
            n.createElement(
              o,
              {
                type: "link",
                size: "small",
                icon: f ? n.createElement(f) : void 0,
                onClick: () => g(p)
              },
              "复制"
            )
          ]
        },
        n.createElement(a.Item.Meta, {
          avatar: n.createElement(
            l,
            { color: "blue", style: { borderRadius: "50%" } },
            `${h + 1}`
          ),
          title: n.createElement(
            "div",
            {
              style: {
                cursor: "pointer",
                color: "#1677ff"
              },
              onClick: () => v(p)
            },
            p.value
          ),
          description: n.createElement(
            d,
            { type: "secondary", style: { fontSize: 12 } },
            p.label
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
}, Ia = { marginBottom: 16 }, Aa = {
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
}, za = {
  fontSize: 12,
  color: "rgba(0,0,0,0.45)",
  marginLeft: 8
};
function Co({ agentId: e }) {
  const t = T().React, { useState: n, useEffect: r, useCallback: a } = t, {
    Switch: l,
    InputNumber: s,
    Select: i,
    Button: o,
    Spin: c,
    Space: u,
    Typography: f,
    message: d
  } = T().antd, { PlayCircleOutlined: m, SaveOutlined: v } = T().antdIcons || {}, { Text: g } = f, [p, h] = n(!0), [E, w] = n(!1), [b, x] = n(!1), [M, D] = n(!1), [$, A] = n(6), [F, V] = n("h"), [U, k] = n("main"), [S, z] = n(300), [I, W] = n(!1), [j, G] = n("08:00"), [O, P] = n("22:00"), ee = a(async () => {
    var q, me;
    h(!0);
    try {
      const R = await po(e), ce = uo(R.every ?? "6h");
      D(R.enabled ?? !1), A(ce.number), V(ce.unit), k(R.target ?? "main"), z(R.timeoutSeconds ?? 300), W(!!R.activeHours), G(((q = R.activeHours) == null ? void 0 : q.start) ?? "08:00"), P(((me = R.activeHours) == null ? void 0 : me.end) ?? "22:00");
    } catch (R) {
      d.error(R.message || "加载心跳配置失败");
    } finally {
      h(!1);
    }
  }, [e]);
  r(() => {
    ee();
  }, [ee]);
  const oe = async () => {
    w(!0);
    try {
      await fo(e, {
        enabled: M,
        every: mo({ number: $, unit: F }),
        target: U,
        timeoutSeconds: S,
        activeHours: I && j && O ? { start: j, end: O } : void 0
      }), d.success("心跳配置已保存");
    } catch (q) {
      d.error(q.message || "保存心跳配置失败");
    } finally {
      w(!1);
    }
  }, B = async () => {
    x(!0);
    try {
      await go(e), d.success("已触发心跳检查");
    } catch (q) {
      d.error(q.message || "触发心跳失败");
    } finally {
      x(!1);
    }
  };
  if (p)
    return t.createElement(
      "div",
      { style: { textAlign: "center", padding: 40 } },
      t.createElement(c, { size: "large" })
    );
  const L = (q, me, R) => t.createElement(
    "div",
    { style: Ia },
    t.createElement("div", { style: ft }, q),
    me,
    R ? t.createElement(
      g,
      { type: "secondary", style: za },
      R
    ) : null
  ), le = (q, me, R, ce) => t.createElement(
    "div",
    { style: Aa },
    t.createElement(
      "div",
      null,
      t.createElement("div", { style: ft }, q),
      me
    ),
    t.createElement(
      "div",
      null,
      t.createElement("div", { style: ft }, R),
      ce
    )
  ), { Divider: re } = T().antd;
  return t.createElement(
    "div",
    { style: { paddingBottom: 8 } },
    // ── Section: 基本设置 ──
    t.createElement("div", { style: tt }, "基本设置"),
    L(
      "启用心跳",
      t.createElement(l, {
        checked: M,
        onChange: (q) => D(q)
      }),
      M ? "已启用，专家将定期自检" : "已停用"
    ),
    le(
      "检查频率",
      t.createElement(
        u,
        null,
        t.createElement(s, {
          min: 1,
          value: $,
          onChange: (q) => A(q ?? 1),
          style: { width: "100%" }
        }),
        t.createElement(i, {
          value: F,
          onChange: (q) => V(q),
          style: { width: 90 },
          options: [
            { value: "m", label: "分钟" },
            { value: "h", label: "小时" }
          ]
        })
      ),
      "心跳目标",
      t.createElement(i, {
        value: U,
        onChange: (q) => k(q),
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
        value: S,
        onChange: (q) => z(q ?? 300),
        style: { width: 200 }
      })
    ),
    // ── Section: 活跃时段 ──
    t.createElement(re, { style: { margin: "8px 0 16px" } }),
    t.createElement("div", { style: tt }, "活跃时段"),
    L(
      "启用活跃时段限制",
      t.createElement(l, {
        checked: I,
        onChange: (q) => W(q)
      }),
      "仅在指定时段内触发心跳"
    ),
    I ? le(
      "开始时间",
      t.createElement("input", {
        type: "time",
        value: j,
        onChange: (q) => G(q.target.value),
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
        onChange: (q) => P(q.target.value),
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
          icon: v ? t.createElement(v) : void 0,
          loading: E,
          onClick: oe,
          style: je
        },
        "保存配置"
      ),
      t.createElement(
        o,
        {
          icon: m ? t.createElement(m) : void 0,
          loading: b,
          onClick: B
        },
        "立即执行"
      )
    )
  );
}
function To({
  agentId: e,
  onRefresh: t
}) {
  const n = T().React, { useState: r, useEffect: a, useCallback: l } = n, {
    List: s,
    Tag: i,
    Switch: o,
    Button: c,
    Empty: u,
    Spin: f,
    Typography: d,
    message: m
  } = T().antd, { PlusOutlined: v, ReloadOutlined: g, DeleteOutlined: p } = T().antdIcons || {}, { Text: h, Paragraph: E } = d, [w, b] = r([]), [x, M] = r(!0), [D, $] = r(!1), [A, F] = r([]), [V, U] = r(!1), k = l(async () => {
    M(!0);
    try {
      const G = await pn(e);
      b(G);
    } catch (G) {
      m.error(G.message || "加载技能失败"), b([]);
    } finally {
      M(!1);
    }
  }, [e]);
  a(() => {
    k();
  }, [k]);
  const S = async () => {
    $(!0), U(!0);
    try {
      const G = await fn(!0);
      F(G);
    } catch (G) {
      m.error(G.message || "加载技能池失败");
    } finally {
      U(!1);
    }
  }, z = async (G) => {
    let O = 0, P = 0;
    for (const ee of G)
      try {
        await Hn(e, ee), O++;
      } catch {
        P++;
      }
    O > 0 ? (m.success(
      `成功添加 ${O} 个技能${P > 0 ? `，${P} 个失败` : ""}`
    ), k(), t()) : P > 0 && m.error("添加技能失败"), $(!1);
  }, I = async (G, O) => {
    try {
      O ? await xa(e, G.name) : await Ca(e, G.name), m.success(O ? "已启用" : "已停用"), k(), t();
    } catch (P) {
      m.error(P.message || "操作失败");
    }
  }, W = async (G) => {
    try {
      await Wn(e, G), m.success(`技能「${G}」已移除`), k(), t();
    } catch (O) {
      m.error(O.message || "移除技能失败");
    }
  };
  if (x)
    return n.createElement(
      "div",
      { style: { textAlign: "center", padding: 40 } },
      n.createElement(f, { size: "large" })
    );
  const j = w.filter((G) => G.enabled !== !1);
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
        h,
        { strong: !0 },
        `技能列表 (${w.length}，已启用 ${j.length})`
      ),
      n.createElement(
        "div",
        { style: { display: "flex", gap: 8 } },
        n.createElement(
          c,
          {
            size: "small",
            icon: g ? n.createElement(g) : void 0,
            onClick: () => {
              Lt(), k();
            }
          },
          "刷新"
        ),
        n.createElement(
          c,
          {
            type: "primary",
            size: "small",
            icon: v ? n.createElement(v) : void 0,
            onClick: S,
            style: je
          },
          "从技能池添加"
        )
      )
    ),
    w.length === 0 ? n.createElement(u, {
      description: "该专家暂无技能",
      image: u.PRESENTED_IMAGE_SIMPLE
    }) : n.createElement(s, {
      dataSource: w,
      renderItem: (G) => n.createElement(
        s.Item,
        {
          actions: [
            n.createElement(o, {
              key: "toggle",
              size: "small",
              checked: G.enabled !== !1,
              onChange: (O) => I(G, O)
            }),
            n.createElement(
              c,
              {
                key: "del",
                type: "link",
                size: "small",
                danger: !0,
                icon: p ? n.createElement(p) : void 0,
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
            n.createElement(h, { strong: !0 }, G.name),
            G.version_text ? n.createElement(
              i,
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
    n.createElement(Ta, {
      open: D,
      onClose: () => $(!1),
      poolSkills: A,
      installedSkillNames: w.map((G) => G.name),
      loading: V,
      onInstall: z
    })
  );
}
function _o({
  agentId: e,
  onRefresh: t,
  isActive: n
}) {
  const r = T().React, { useState: a, useEffect: l, useCallback: s } = r, {
    List: i,
    Tag: o,
    Button: c,
    Empty: u,
    Spin: f,
    Modal: d,
    Input: m,
    Typography: v,
    message: g
  } = T().antd, { PlusOutlined: p, ReloadOutlined: h, DeleteOutlined: E } = T().antdIcons || {}, { Text: w, Paragraph: b } = v, { TextArea: x } = m, [M, D] = a([]), [$, A] = a(!0), [F, V] = a(!1), [U, k] = a(`{
  "mcpServers": {
    "example-client": {
      "command": "npx",
      "args": ["-y", "@example/mcp-server"],
      "env": {}
    }
  }
}`), [S, z] = a(!1), I = s(async () => {
    A(!0);
    try {
      const O = await Vn(e);
      D(O);
    } catch (O) {
      g.error(O.message || "加载 MCP 失败"), D([]);
    } finally {
      A(!1);
    }
  }, [e]);
  l(() => {
    I();
  }, [I]), l(() => {
    n && I();
  }, [n, I]);
  const W = async (O) => {
    try {
      await io(e, O), g.success("已切换 MCP 状态"), I(), t();
    } catch (P) {
      g.error(P.message || "切换失败");
    }
  }, j = async (O) => {
    try {
      await ka(e, O), g.success(`MCP「${O}」已移除`), I(), t();
    } catch (P) {
      g.error(P.message || "移除 MCP 失败");
    }
  }, G = async () => {
    z(!0);
    try {
      const O = JSON.parse(U), P = O.mcpServers || O, ee = Object.entries(P);
      if (ee.length === 0) {
        g.warning("未找到 MCP 客户端配置");
        return;
      }
      for (const [oe, B] of ee) {
        const L = B, le = L.url ? "streamable_http" : "stdio";
        await Jn(e, {
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
      g.success("MCP 客户端已创建"), V(!1), I(), t();
    } catch (O) {
      O instanceof SyntaxError ? g.error("JSON 格式错误：" + O.message) : g.error(O.message || "创建 MCP 失败");
    } finally {
      z(!1);
    }
  };
  return $ ? r.createElement(
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
      r.createElement(w, { strong: !0 }, `MCP 客户端 (${M.length})`),
      r.createElement(
        "div",
        { style: { display: "flex", gap: 8 } },
        r.createElement(
          c,
          {
            size: "small",
            icon: h ? r.createElement(h) : void 0,
            onClick: () => {
              Lt(), I();
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
            onClick: () => V(!0),
            style: je
          },
          "添加 MCP"
        )
      )
    ),
    M.length === 0 ? r.createElement(u, {
      description: "该专家暂无 MCP 客户端",
      image: u.PRESENTED_IMAGE_SIMPLE
    }) : r.createElement(i, {
      dataSource: M,
      renderItem: (O) => r.createElement(
        i.Item,
        {
          actions: [
            r.createElement(
              c,
              {
                key: "toggle",
                size: "small",
                onClick: () => W(O.key)
              },
              O.enabled ? "停用" : "启用"
            ),
            r.createElement(
              c,
              {
                key: "del",
                type: "link",
                size: "small",
                danger: !0,
                icon: E ? r.createElement(E) : void 0,
                onClick: () => j(O.key)
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
            r.createElement(w, { strong: !0 }, O.name || O.key),
            r.createElement(
              o,
              {
                color: O.enabled ? "green" : "default",
                style: { fontSize: 10 }
              },
              O.enabled ? "启用" : "停用"
            ),
            r.createElement(
              o,
              { color: "purple", style: { fontSize: 10 } },
              O.transport
            )
          ),
          O.description ? r.createElement(
            b,
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
      d,
      {
        open: F,
        title: "添加 MCP 客户端 (JSON)",
        onCancel: () => V(!1),
        onOk: G,
        confirmLoading: S,
        okText: "创建",
        width: 560
      },
      r.createElement(
        "div",
        { style: { marginBottom: 8, fontSize: 12, color: "var(--ant-color-text-tertiary, #8c8c8c)" } },
        "粘贴 MCP 配置 JSON（支持 mcpServers 格式），将创建到当前专家工作区："
      ),
      r.createElement(x, {
        value: U,
        onChange: (O) => k(O.target.value),
        rows: 12,
        style: { fontFamily: "monospace", fontSize: 12 }
      })
    )
  );
}
function Io({ agentId: e }) {
  const t = T().React, { useState: n, useEffect: r, useCallback: a, useRef: l } = t, {
    Card: s,
    InputNumber: i,
    Input: o,
    Select: c,
    Switch: u,
    Button: f,
    Spin: d,
    Space: m,
    Typography: v,
    Divider: g,
    message: p
  } = T().antd, { SaveOutlined: h } = T().antdIcons || {}, { Text: E } = v, [w, b] = n(!0), [x, M] = n(!1), D = l(null), [$, A] = n(60), [F, V] = n(""), [U, k] = n(!0), [S, z] = n(30), [I, W] = n("zh"), [j, G] = n("UTC"), [O, P] = n(!0), [ee, oe] = n(100), [B, L] = n(!0), [le, re] = n(3), [q, me] = n(1), [R, ce] = n(!0), [ye, Z] = n(3), [ie, te] = n(2), [be, ve] = n(60), [$e, Se] = n(1), [ne, we] = n(0), [Ce, K] = n(1), [ue, he] = n(0), [H, C] = n(30), [pe, X] = n(50), [_, ae] = n("light"), [fe, _e] = n("scroll"), [Le, We] = n("remelight"), [Ve, Be] = n("AUTO"), lt = a(async () => {
    var se, Pe, ze, Me, Xe, Ye;
    b(!0);
    try {
      const [Ie, Bt, Ut] = await Promise.all([
        yo(e),
        Eo(e).catch(() => "zh"),
        vo().catch(() => "UTC")
      ]);
      D.current = Ie, A(Ie.shell_command_timeout ?? 60), V(Ie.shell_command_executable ?? "");
      const jt = Ie.auto_title_config ?? { enabled: !0, timeout_seconds: 30 };
      k(jt.enabled ?? !0), z(jt.timeout_seconds ?? 30), W(Bt), G(Ut);
      const Ze = Ie.loop ?? {};
      P(((se = Ze.iteration) == null ? void 0 : se.enabled) ?? !0), oe(((Pe = Ze.iteration) == null ? void 0 : Pe.max_iterations) ?? Ie.max_iters ?? 100), L(((ze = Ze.doom_loop) == null ? void 0 : ze.enabled) ?? !0), re(((Me = Ze.doom_loop) == null ? void 0 : Me.window_size) ?? 3), me(((Xe = Ze.doom_loop) == null ? void 0 : Xe.similarity_threshold) ?? 1), ce(Ie.llm_retry_enabled ?? !0), Z(Ie.llm_max_retries ?? 3), te(Ie.llm_backoff_base ?? 2), ve(Ie.llm_backoff_cap ?? 60), Se(Ie.llm_max_concurrent ?? 1), we(Ie.llm_max_qpm ?? 0), K(Ie.llm_rate_limit_pause ?? 1), he(Ie.llm_rate_limit_jitter ?? 0), C(Ie.llm_acquire_timeout ?? 30), X(Ie.history_max_length ?? 50), ae(Ie.context_manager_backend ?? "light"), _e(((Ye = Ie.light_context_config) == null ? void 0 : Ye.strategy) ?? "scroll"), We(Ie.memory_manager_backend ?? "remelight"), Be(Ie.approval_level ?? "AUTO");
    } catch (Ie) {
      p.error(Ie.message || "加载运行配置失败");
    } finally {
      b(!1);
    }
  }, [e]);
  r(() => {
    lt();
  }, [lt]);
  const qe = async () => {
    var Pe, ze;
    const se = D.current;
    if (se) {
      M(!0);
      try {
        const Me = {
          ...se,
          max_iters: ee,
          loop: {
            ...se.loop ?? {},
            iteration: { enabled: O, max_iterations: ee },
            doom_loop: {
              enabled: B,
              window_size: le,
              similarity_threshold: q,
              stages: ((ze = (Pe = se.loop) == null ? void 0 : Pe.doom_loop) == null ? void 0 : ze.stages) ?? []
            }
          },
          shell_command_timeout: $,
          shell_command_executable: F,
          auto_title_config: {
            enabled: U,
            timeout_seconds: S
          },
          llm_retry_enabled: R,
          llm_max_retries: ye,
          llm_backoff_base: ie,
          llm_backoff_cap: be,
          llm_max_concurrent: $e,
          llm_max_qpm: ne,
          llm_rate_limit_pause: Ce,
          llm_rate_limit_jitter: ue,
          llm_acquire_timeout: H,
          history_max_length: pe,
          context_manager_backend: _,
          light_context_config: {
            ...se.light_context_config ?? {},
            strategy: fe
          },
          memory_manager_backend: Le,
          approval_level: Ve
        };
        await ho(e, Me), D.current = Me, I && await bo(e, I).catch(() => {
        }), j && await wo(j).catch(() => {
        }), p.success("运行配置已保存");
      } catch (Me) {
        p.error(Me.message || "保存运行配置失败");
      } finally {
        M(!1);
      }
    }
  };
  if (w)
    return t.createElement(
      "div",
      { style: { textAlign: "center", padding: 40 } },
      t.createElement(d, { size: "large" })
    );
  const Re = (se, Pe, ze) => t.createElement(
    "div",
    { style: Ia },
    t.createElement("div", { style: ft }, se),
    Pe,
    ze ? t.createElement(
      E,
      { type: "secondary", style: za },
      ze
    ) : null
  ), Ae = (se, Pe, ze, Me) => t.createElement(
    "div",
    { style: Aa },
    t.createElement(
      "div",
      null,
      t.createElement("div", { style: ft }, se),
      Pe
    ),
    t.createElement(
      "div",
      null,
      t.createElement("div", { style: ft }, ze),
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
    Ae(
      "Shell 命令超时 (秒)",
      t.createElement(i, {
        min: 1,
        value: $,
        onChange: (se) => A(se ?? 60),
        style: { width: "100%" }
      }),
      "Shell 可执行文件",
      t.createElement(o, {
        value: F,
        onChange: (se) => V(se.target.value),
        placeholder: "留空使用系统默认",
        style: { width: "100%" }
      })
    ),
    Ae(
      "语言",
      t.createElement(c, {
        value: I,
        onChange: (se) => W(se),
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
        value: j,
        onChange: (se) => G(se),
        style: { width: "100%" },
        showSearch: !0,
        filterOption: (se, Pe) => {
          var ze;
          return (((ze = Pe == null ? void 0 : Pe.label) == null ? void 0 : ze.toString()) || "").toLowerCase().includes(se.toLowerCase());
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
        ].map((se) => ({ value: se, label: se }))
      })
    ),
    Ae(
      "自动生成会话标题",
      t.createElement(m, null, t.createElement(u, {
        checked: U,
        onChange: (se) => k(se)
      })),
      "标题生成超时 (秒)",
      t.createElement(i, {
        min: 5,
        value: S,
        onChange: (se) => z(se ?? 30),
        style: { width: "100%" },
        disabled: !U
      })
    ),
    // ── Section: 审批级别 ──
    t.createElement(g, { style: { margin: "8px 0 16px" } }),
    t.createElement("div", { style: tt }, "审批级别"),
    Re(
      "工具执行审批",
      t.createElement(c, {
        value: Ve,
        onChange: (se) => Be(se),
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
    t.createElement(g, { style: { margin: "8px 0 16px" } }),
    t.createElement("div", { style: tt }, "迭代与循环"),
    Re(
      "启用迭代限制",
      t.createElement(u, {
        checked: O,
        onChange: (se) => P(se)
      }),
      "停止 Agent 前的最大循环轮次"
    ),
    O ? Re(
      "最大迭代次数",
      t.createElement(i, {
        min: 1,
        max: 500,
        value: ee,
        onChange: (se) => oe(se ?? 100),
        style: { width: "100%" }
      })
    ) : null,
    Re(
      "启用重复循环保护",
      t.createElement(u, {
        checked: B,
        onChange: (se) => L(se)
      }),
      "检测并阻止重复操作循环"
    ),
    B ? Ae(
      "检测窗口大小",
      t.createElement(i, {
        min: 2,
        max: 20,
        value: le,
        onChange: (se) => re(se ?? 3),
        style: { width: "100%" }
      }),
      "相似度阈值",
      t.createElement(i, {
        min: 0,
        max: 1,
        step: 0.05,
        value: q,
        onChange: (se) => me(se ?? 1),
        style: { width: "100%" }
      })
    ) : null,
    // ── Section: LLM 重试 ──
    t.createElement(g, { style: { margin: "8px 0 16px" } }),
    t.createElement("div", { style: tt }, "LLM 重试"),
    Re(
      "启用 LLM 重试",
      t.createElement(u, {
        checked: R,
        onChange: (se) => ce(se)
      })
    ),
    Ae(
      "最大重试次数",
      t.createElement(i, {
        min: 1,
        value: ye,
        onChange: (se) => Z(se ?? 3),
        style: { width: "100%" },
        disabled: !R
      }),
      "退避基数 (秒)",
      t.createElement(i, {
        min: 0.1,
        step: 0.1,
        value: ie,
        onChange: (se) => te(se ?? 2),
        style: { width: "100%" },
        disabled: !R
      })
    ),
    Re(
      "退避上限 (秒)",
      t.createElement(i, {
        min: 0.5,
        step: 0.5,
        value: be,
        onChange: (se) => ve(se ?? 60),
        style: { width: 200 },
        disabled: !R
      })
    ),
    // ── Section: LLM 限流 ──
    t.createElement(g, { style: { margin: "8px 0 16px" } }),
    t.createElement("div", { style: tt }, "LLM 限流"),
    Ae(
      "最大并发数",
      t.createElement(i, {
        min: 1,
        value: $e,
        onChange: (se) => Se(se ?? 1),
        style: { width: "100%" }
      }),
      "最大 QPM (0=不限)",
      t.createElement(i, {
        min: 0,
        step: 10,
        value: ne,
        onChange: (se) => we(se ?? 0),
        style: { width: "100%" }
      })
    ),
    Ae(
      "限流暂停时间 (秒)",
      t.createElement(i, {
        min: 1,
        step: 0.5,
        value: Ce,
        onChange: (se) => K(se ?? 1),
        style: { width: "100%" }
      }),
      "限流抖动 (秒)",
      t.createElement(i, {
        min: 0,
        step: 0.5,
        value: ue,
        onChange: (se) => he(se ?? 0),
        style: { width: "100%" }
      })
    ),
    Re(
      "获取超时 (秒)",
      t.createElement(i, {
        min: 10,
        step: 10,
        value: H,
        onChange: (se) => C(se ?? 30),
        style: { width: 200 }
      }),
      "应大于 限流暂停 + 抖动"
    ),
    // ── Section: 上下文与记忆 ──
    t.createElement(g, { style: { margin: "8px 0 16px" } }),
    t.createElement("div", { style: tt }, "上下文与记忆"),
    Ae(
      "上下文管理后端",
      t.createElement(c, {
        value: _,
        onChange: (se) => ae(se),
        style: { width: "100%" },
        options: [{ value: "light", label: "light" }]
      }),
      "上下文策略",
      t.createElement(c, {
        value: fe,
        onChange: (se) => _e(se),
        style: { width: "100%" },
        options: [
          { value: "scroll", label: "scroll (滚动窗口)" },
          { value: "native", label: "native (原生)" }
        ]
      })
    ),
    Ae(
      "记忆管理后端",
      t.createElement(c, {
        value: Le,
        onChange: (se) => We(se),
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
        value: pe,
        onChange: (se) => X(se ?? 50),
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
          icon: h ? t.createElement(h) : void 0,
          loading: x,
          onClick: qe,
          style: je
        },
        "保存运行配置"
      )
    )
  );
}
function Ao({
  expert: e,
  open: t,
  onClose: n,
  onRefresh: r
}) {
  const a = T().React, { useState: l, useEffect: s, useCallback: i } = a, { Modal: o, Tabs: c, Spin: u, Typography: f } = T().antd, { SettingOutlined: d } = T().antdIcons || {}, { Text: m } = f, [v, g] = l([]), [p, h] = l(!1), [E, w] = l("heartbeat"), b = i(async () => {
    if (e) {
      h(!0);
      try {
        const $ = await So(e.agent.id);
        g($);
      } catch {
        g([]);
      } finally {
        h(!1);
      }
    }
  }, [e]);
  if (s(() => {
    t && e && b();
  }, [t, e, b]), !e) return null;
  const { agent: x } = e, M = () => {
    b(), r();
  }, D = [
    {
      key: "heartbeat",
      label: "心跳",
      children: a.createElement(Co, {
        agentId: x.id
      })
    },
    {
      key: "files",
      label: "文件",
      children: p ? a.createElement(
        "div",
        { style: { textAlign: "center", padding: 40 } },
        a.createElement(u, { size: "large" })
      ) : a.createElement(_a, {
        agentId: x.id,
        systemPromptFiles: v,
        onRefresh: M
      })
    },
    {
      key: "skills",
      label: `技能 (${e.skills.filter(($) => $.enabled !== !1).length})`,
      children: a.createElement(To, {
        agentId: x.id,
        onRefresh: r
      })
    },
    {
      key: "mcp",
      label: `MCP (${e.mcps.length})`,
      children: a.createElement(_o, {
        agentId: x.id,
        onRefresh: r,
        isActive: E === "mcp"
      })
    },
    {
      key: "running",
      label: "运行配置",
      children: a.createElement(Io, {
        agentId: x.id
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
        d ? a.createElement(d, { style: { fontSize: 18 } }) : null,
        a.createElement("span", null, `配置 - ${x.name}`),
        a.createElement(
          m,
          { type: "secondary", style: { fontSize: 12, fontWeight: 400 } },
          x.id
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
      items: D,
      activeKey: E,
      onChange: ($) => w($),
      size: "small",
      tabBarStyle: { marginBottom: 16 }
    })
  );
}
const $a = [
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
], zo = $a;
function zr(e) {
  return dn(`/ugsci/avatar/${encodeURIComponent(e)}`);
}
function $r(e) {
  const t = e.map(encodeURIComponent).join(",");
  return dn(`/ugsci/avatar/team/${t}`);
}
function Ke({
  name: e,
  size: t = 32,
  borderRadius: n = "50%"
}) {
  const r = T().React, [a, l] = r.useState(0), s = a === 0 ? zr(e) : `${zr(e)}?_r=${a}`;
  return r.createElement("img", {
    src: s,
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
function qn({
  members: e,
  size: t = 32,
  borderRadius: n = "50%"
}) {
  const r = T().React, [a, l] = r.useState(0);
  if (!e || e.length === 0)
    return r.createElement("span", {
      style: {
        width: t,
        height: t,
        display: "inline-block"
      }
    });
  const s = e.slice(0, 5), i = a === 0 ? $r(s) : `${$r(s)}?_r=${a}`;
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
async function Pr(e) {
  var n;
  const t = T();
  if (t.refreshAgents)
    try {
      await t.refreshAgents({ force: !0 });
    } catch (r) {
      console.warn("[ugsci] Failed to refresh newly created agent:", r);
      return;
    }
  (n = t.setSelectedAgent) == null || n.call(t, e);
}
function $o({
  expert: e,
  onClick: t,
  onSummon: n,
  onConfigure: r
}) {
  var $;
  const a = T().React, { Card: l, Tag: s, Badge: i, Typography: o, Spin: c, Button: u, Tooltip: f } = T().antd, { Text: d } = o, { ThunderboltOutlined: m, SettingOutlined: v } = T().antdIcons || {}, { agent: g, skills: p, mcps: h, loading: E } = e, w = g.enabled, b = p.filter((A) => A.enabled !== !1), x = $a.find(
    (A) => A.id === g.id || A.name === g.name
  ), M = Array.from(
    new Set(
      ($ = x == null ? void 0 : x.tags) != null && $.length ? x.tags : b.flatMap((A) => A.tags || [])
    )
  ).slice(0, 3), D = (x == null ? void 0 : x.category) || "UGSci 专业专家";
  return a.createElement(
    l,
    {
      hoverable: !0,
      onClick: t,
      size: "small",
      style: {
        cursor: "pointer",
        transition: "all 0.2s ease",
        borderColor: w ? void 0 : "var(--ant-color-border, #d9d9d9)",
        opacity: w ? 1 : 0.7,
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
        a.createElement(Ke, { name: g.name, size: 36 }),
        a.createElement(
          "div",
          null,
          a.createElement(
            d,
            { strong: !0, style: { fontSize: 15 } },
            g.name
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
      a.createElement(i, {
        status: w ? "success" : "default",
        text: w ? "启用" : "停用"
      })
    ),
    // Keep the card scannable: only surface a few stable capability tags.
    a.createElement(
      "div",
      { style: { minHeight: 30, marginBottom: 10 } },
      M.length > 0 ? a.createElement(xo, {
        items: M,
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
    E ? a.createElement(c, { size: "small" }) : a.createElement(
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
      `技能 ${b.length}`,
      `MCP ${h.length}`
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
        f,
        { title: "配置专家", placement: "top" },
        a.createElement(
          u,
          {
            type: "text",
            size: "small",
            icon: v ? a.createElement(v, {
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
        u,
        {
          type: "primary",
          size: "small",
          icon: m ? a.createElement(m) : void 0,
          disabled: !w,
          onClick: (A) => {
            A.stopPropagation(), n && n();
          },
          style: je
        },
        "召唤专家"
      )
    )
  );
}
function Po({
  expert: e,
  open: t,
  onClose: n,
  onRefresh: r
}) {
  const a = T().React, {
    Drawer: l,
    Descriptions: s,
    Tag: i,
    Typography: o,
    Space: c,
    Button: u,
    Empty: f,
    Tabs: d,
    List: m,
    Spin: v,
    Modal: g,
    message: p
  } = T().antd, { Text: h, Paragraph: E } = o, {
    EditOutlined: w,
    ThunderboltOutlined: b,
    FileTextOutlined: x,
    ToolOutlined: M,
    PlusOutlined: D
  } = T().antdIcons || {}, [$, A] = a.useState(!1), [F, V] = a.useState(
    []
  ), [U, k] = a.useState(!1);
  if (!e) return null;
  const { agent: S, config: z, skills: I, mcps: W, loading: j } = e, G = I.filter((R) => R.enabled !== !1), O = (R) => {
    window.history.pushState({}, "", R), window.dispatchEvent(new PopStateEvent("popstate"));
  }, P = a.createElement(
    "div",
    null,
    a.createElement(
      s,
      { column: 1, bordered: !0, size: "small" },
      a.createElement(s.Item, { label: "专家名称" }, S.name),
      a.createElement(
        s.Item,
        { label: "专家 ID" },
        a.createElement("code", { style: { fontSize: 12 } }, S.id)
      ),
      a.createElement(
        s.Item,
        { label: "状态" },
        a.createElement(
          i,
          { color: S.enabled ? "green" : "default" },
          S.enabled ? "启用" : "停用"
        )
      ),
      a.createElement(
        s.Item,
        { label: "功能简介" },
        S.description ? Fn(S.description, a) : "暂无描述"
      ),
      a.createElement(
        s.Item,
        { label: "使用模型" },
        S.active_model ? `${S.active_model.provider_id} / ${S.active_model.model}` : "使用全局默认模型"
      ),
      z != null && z.workspace_dir ? a.createElement(
        s.Item,
        { label: "工作区路径" },
        a.createElement(
          "code",
          { style: { fontSize: 11 } },
          z.workspace_dir
        )
      ) : null,
      z != null && z.approval_level ? a.createElement(
        s.Item,
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
        x ? a.createElement(x, {
          style: { fontSize: 14, color: "#1677ff" }
        }) : null,
        a.createElement(h, { strong: !0 }, "系统提示词文件")
      ),
      a.createElement(
        c,
        { wrap: !0 },
        ...z.system_prompt_files.map(
          (R, ce) => a.createElement(
            i,
            {
              key: ce,
              icon: x ? a.createElement(x) : void 0,
              style: { fontSize: 12 }
            },
            R
          )
        )
      )
    ) : null
  ), ee = async () => {
    A(!0), k(!0);
    try {
      const R = await fn(!0);
      V(R);
    } catch (R) {
      p.error(R.message || "加载技能池失败");
    } finally {
      k(!1);
    }
  }, oe = async (R) => {
    let ce = 0, ye = 0;
    for (const Z of R)
      try {
        await Hn(S.id, Z), ce++;
      } catch {
        ye++;
      }
    ce > 0 ? (p.success(
      `成功添加 ${ce} 个技能${ye > 0 ? `，${ye} 个失败` : ""}`
    ), r()) : ye > 0 && p.error("添加技能失败"), A(!1);
  }, B = async (R) => {
    try {
      await Wn(S.id, R), p.success(`技能「${R}」已移除`), r();
    } catch (ce) {
      p.error(ce.message || "移除技能失败");
    }
  }, L = async (R) => {
    try {
      await ka(S.id, R), p.success(`MCP「${R}」已移除`), r();
    } catch (ce) {
      p.error(ce.message || "移除 MCP 失败");
    }
  }, le = j ? a.createElement(
    "div",
    { style: { textAlign: "center", padding: 40 } },
    a.createElement(v, { size: "large" })
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
        h,
        { strong: !0 },
        `已启用技能 (${G.length})`
      ),
      a.createElement(
        u,
        {
          type: "primary",
          size: "small",
          icon: D ? a.createElement(D) : void 0,
          onClick: ee
        },
        "从技能池添加"
      )
    ),
    G.length === 0 ? a.createElement(f, {
      description: "该专家暂无已启用的技能",
      image: f.PRESENTED_IMAGE_SIMPLE
    }) : a.createElement(m, {
      dataSource: G,
      renderItem: (R) => a.createElement(
        m.Item,
        {
          actions: [
            a.createElement(
              u,
              {
                type: "link",
                size: "small",
                danger: !0,
                onClick: () => B(R.name)
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
            R.emoji ? a.createElement(
              "span",
              { style: { fontSize: 16 } },
              R.emoji
            ) : null,
            a.createElement(h, { strong: !0 }, R.name),
            R.version_text ? a.createElement(
              i,
              { style: { fontSize: 10 } },
              `v${R.version_text}`
            ) : null
          ),
          R.description ? a.createElement(
            E,
            {
              type: "secondary",
              style: { fontSize: 12, margin: 0 },
              ellipsis: { rows: 2 }
            },
            R.description
          ) : null,
          R.tags && R.tags.length > 0 ? a.createElement(
            "div",
            { style: { marginTop: 4 } },
            ...R.tags.map(
              (ce, ye) => a.createElement(
                i,
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
    a.createElement(Ta, {
      open: $,
      onClose: () => A(!1),
      poolSkills: F,
      installedSkillNames: G.map((R) => R.name),
      loading: U,
      onInstall: oe
    })
  ), re = j ? a.createElement(
    "div",
    { style: { textAlign: "center", padding: 40 } },
    a.createElement(v, { size: "large" })
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
        h,
        { strong: !0 },
        `MCP 客户端 (${W.length})`
      ),
      a.createElement(
        u,
        {
          type: "primary",
          size: "small",
          icon: D ? a.createElement(D) : void 0,
          onClick: () => {
            window.history.pushState({}, "", `/agents/${S.id}/mcp`), window.dispatchEvent(new PopStateEvent("popstate"));
          }
        },
        "配置 MCP"
      )
    ),
    W.length === 0 ? a.createElement(f, {
      description: "该专家暂无关联的 MCP 客户端，点击「配置 MCP」添加",
      image: f.PRESENTED_IMAGE_SIMPLE
    }) : a.createElement(m, {
      dataSource: W,
      renderItem: (R) => a.createElement(
        m.Item,
        {
          actions: [
            a.createElement(
              u,
              {
                type: "link",
                size: "small",
                danger: !0,
                onClick: () => L(R.key)
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
              h,
              { strong: !0 },
              R.name || R.key
            ),
            a.createElement(
              i,
              {
                color: R.enabled ? "green" : "default",
                style: { fontSize: 10 }
              },
              R.enabled ? "启用" : "停用"
            ),
            a.createElement(
              i,
              { color: "purple", style: { fontSize: 10 } },
              R.transport
            )
          ),
          R.description ? a.createElement(
            E,
            {
              type: "secondary",
              style: { fontSize: 12, margin: 0 },
              ellipsis: { rows: 2 }
            },
            R.description
          ) : null,
          R.tools && R.tools.length > 0 ? a.createElement(
            "div",
            {
              style: {
                marginTop: 4,
                fontSize: 11,
                color: "var(--ant-color-text-tertiary, #8c8c8c)"
              }
            },
            `提供 ${R.tools.length} 个工具`
          ) : null
        )
      )
    })
  ), q = z != null && z.tools ? a.createElement(
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
        M ? a.createElement(M, {
          style: { fontSize: 14, color: "#1677ff" }
        }) : null,
        a.createElement(h, { strong: !0 }, "工具配置")
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
  ) : a.createElement(f, {
    description: "暂无工具配置",
    image: f.PRESENTED_IMAGE_SIMPLE
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
      children: a.createElement(ko, {
        skills: G,
        agentId: S.id
      })
    },
    {
      key: "knowledge",
      label: "专家记忆",
      children: a.createElement(_a, {
        agentId: S.id,
        systemPromptFiles: (z == null ? void 0 : z.system_prompt_files) || [],
        onRefresh: () => r()
      })
    },
    { key: "mcp", label: `MCP (${W.length})`, children: re },
    { key: "tools", label: "工具配置", children: q }
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
        c,
        null,
        a.createElement(
          u,
          {
            size: "small",
            icon: w ? a.createElement(w) : void 0,
            onClick: () => {
              n();
              try {
                const R = T();
                R.setSelectedAgent && R.setSelectedAgent(S.id);
              } catch (R) {
                console.warn("[ugsci] Failed to set selected agent:", R);
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
            icon: b ? a.createElement(b) : void 0,
            onClick: () => {
              n();
              try {
                const R = T();
                R.setSelectedAgent && R.setSelectedAgent(S.id);
              } catch (R) {
                console.warn("[ugsci] Failed to set selected agent:", R);
              }
              setTimeout(() => O("/chat"), 0);
            }
          },
          "开始对话"
        )
      )
    },
    a.createElement(d, {
      items: me,
      defaultActiveKey: "basic"
    })
  );
}
function Oo({
  open: e,
  onClose: t,
  onCreated: n
}) {
  const r = T().React, { useState: a } = r, {
    Modal: l,
    Card: s,
    Tag: i,
    Input: o,
    Row: c,
    Col: u,
    Spin: f,
    message: d,
    Typography: m
  } = T().antd, { Text: v } = m, { FileAddOutlined: g } = T().antdIcons || {}, [p, h] = a(!1), [E, w] = a(""), [b, x] = a(!1), M = async (A) => {
    h(!0);
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
`, k = (await Promise.allSettled([
        nn(F.id, "AGENTS.md", V),
        ...A.mcpClients.map(
          ({ clientKey: S, client: z }) => Jn(F.id, {
            client_key: S,
            client: z
          })
        )
      ])).filter(
        (S) => S.status === "rejected"
      ).length;
      k > 0 ? d.warning(
        `专家「${A.name}」已创建，${k} 项初始配置失败，可在专家配置中重试`
      ) : d.success(`专家「${A.name}」创建成功`), await Pr(F.id), x(!1), setTimeout(() => {
        t(), n();
      }, 0);
    } catch (F) {
      d.error(F.message || "创建专家失败");
    } finally {
      h(!1);
    }
  }, D = zo.filter((A) => {
    if (!E.trim()) return !0;
    const F = E.toLowerCase();
    return A.name.toLowerCase().includes(F) || A.description.toLowerCase().includes(F) || A.category.toLowerCase().includes(F);
  }), $ = async (A) => {
    h(!0);
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
      await nn(F.id, "AGENTS.md", A.system_prompt);
      const V = await Gn(F.id);
      V.approval_level = A.approval_level, await de(`/agents/${encodeURIComponent(F.id)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(V)
      }), await Pr(F.id), d.success(`专家「${A.name}」创建成功`), t(), n();
    } catch (F) {
      d.error(F.message || "创建专家失败");
    } finally {
      h(!1);
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
        r.createElement(o, {
          placeholder: "搜索模板名称或类别...",
          value: E,
          onChange: (A) => w(A.target.value),
          allowClear: !0
        })
      ),
      p ? r.createElement(
        "div",
        { style: { textAlign: "center", padding: 60 } },
        r.createElement(f, { size: "large" }),
        r.createElement(
          "div",
          { style: { marginTop: 12, color: "var(--ant-color-text-tertiary, #8c8c8c)" } },
          "正在创建专家..."
        )
      ) : r.createElement(
        c,
        { gutter: [12, 12] },
        // ── Blank template card (always first) ──
        E.trim() ? null : r.createElement(
          u,
          { xs: 24, sm: 12 },
          r.createElement(
            s,
            {
              hoverable: !0,
              size: "small",
              onClick: () => x(!0),
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
                g ? r.createElement(g) : "📝"
              ),
              r.createElement(
                "div",
                { style: { flex: 1 } },
                r.createElement(
                  v,
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
        ...D.map(
          (A) => r.createElement(
            u,
            { key: A.id, xs: 24, sm: 12 },
            r.createElement(
              s,
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
                r.createElement(Ke, {
                  name: A.name,
                  size: 40
                }),
                r.createElement(
                  "div",
                  { style: { flex: 1 } },
                  r.createElement(
                    v,
                    { strong: !0, style: { fontSize: 15 } },
                    A.name
                  ),
                  r.createElement(
                    "div",
                    null,
                    r.createElement(
                      i,
                      { color: "blue", style: { fontSize: 10 } },
                      A.category
                    ),
                    A.approval_level === "MANUAL" ? r.createElement(
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
                Fn(A.description, r)
              )
            )
          )
        )
      )
    ),
    // ── Blank template creation modal (sibling, not nested inside Modal) ──
    r.createElement(Mo, {
      open: b,
      onCancel: () => x(!1),
      onCreate: M
    })
  );
}
function vt(e) {
  return typeof e == "object" && e !== null && !Array.isArray(e);
}
function Ro(e) {
  const t = e.trim();
  if (!t) return [];
  const n = JSON.parse(t);
  if (!vt(n))
    throw new Error("MCP 配置必须是 JSON 对象");
  const r = n.mcpServers ?? n;
  if (!vt(r))
    throw new Error("mcpServers 必须是 JSON 对象");
  return Object.entries(r).map(([a, l]) => {
    const s = a.trim();
    if (!s || !vt(l))
      throw new Error(`MCP「${a || "未命名"}」配置无效`);
    const i = typeof l.url == "string" ? l.url : "", o = typeof l.command == "string" ? l.command : "";
    if (!i && !o)
      throw new Error(`MCP「${s}」需要配置 url 或 command`);
    const u = (typeof l.transport == "string" ? l.transport : typeof l.type == "string" ? l.type : "") === "sse" ? "sse" : i ? "streamable_http" : "stdio";
    return {
      clientKey: s,
      client: {
        name: typeof l.name == "string" ? l.name : s,
        description: typeof l.description == "string" ? l.description : "",
        enabled: typeof l.enabled == "boolean" ? l.enabled : !0,
        transport: u,
        url: i,
        command: o,
        args: Array.isArray(l.args) ? l.args : [],
        env: vt(l.env) ? l.env : {},
        cwd: typeof l.cwd == "string" ? l.cwd : "",
        headers: vt(l.headers) ? l.headers : {}
      }
    };
  });
}
function Mo({
  open: e,
  onCancel: t,
  onCreate: n
}) {
  const r = T().React, { useState: a, useEffect: l, useMemo: s } = r, {
    Modal: i,
    Input: o,
    Select: c,
    Button: u,
    Row: f,
    Col: d,
    Spin: m,
    Tag: v,
    Typography: g,
    message: p
  } = T().antd, { CheckCircleOutlined: h } = T().antdIcons || {}, { Text: E } = g, [w, b] = a(""), [x, M] = a(""), [D, $] = a(""), [A, F] = a(""), [V, U] = a([]), [k, S] = a([]), [z, I] = a(!1), [W, j] = a(""), [G, O] = a(!1);
  l(() => {
    e && (b(""), M(""), $(""), F(""), S([]), j(""), O(!1), I(!0), fn(!0).then(U).catch((re) => {
      U([]), p.error(re.message || "加载技能池失败");
    }).finally(() => I(!1)));
  }, [e]);
  const P = x.trim(), ee = s(() => P ? P.length < 2 || P.length > 64 ? "ID 长度需为 2-64 个字符" : /^[a-zA-Z0-9][a-zA-Z0-9_-]*[a-zA-Z0-9]$/.test(P) ? P === "default" ? "default 是系统保留 ID" : "" : "仅允许字母、数字、连字符和下划线，且不能以符号开头或结尾" : "", [P]), oe = s(() => {
    try {
      return { clients: Ro(W), error: "" };
    } catch (re) {
      return { clients: [], error: re.message || "MCP 配置无效" };
    }
  }, [W]), B = () => {
    const re = w.trim();
    if (!re) {
      p.warning("请输入专家名称");
      return;
    }
    if (ee) {
      p.warning(ee);
      return;
    }
    if (oe.error) {
      p.warning(oe.error);
      return;
    }
    O(!0), Promise.resolve(
      n({
        id: P,
        name: re,
        description: D.trim(),
        systemPrompt: A,
        skillNames: k,
        mcpClients: oe.clients
      })
    ).finally(() => O(!1));
  }, L = () => {
    S(
      V.filter((re) => re.source === "builtin").map((re) => re.name)
    );
  }, le = (re, q) => r.createElement(
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
    r.createElement(E, { strong: !0, style: { fontSize: 15 } }, re),
    q ? r.createElement(E, { type: "secondary", style: { fontSize: 12 } }, q) : null
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
        f,
        { gutter: [16, 12] },
        r.createElement(
          d,
          { xs: 24, md: 12 },
          r.createElement(
            "label",
            { style: { display: "block", fontSize: 13, marginBottom: 6 } },
            "专家名称",
            r.createElement("span", { style: { color: "#ff4d4f", marginLeft: 4 } }, "*")
          ),
          r.createElement(o, {
            placeholder: "例如：合同审查专家",
            value: w,
            onChange: (re) => b(re.target.value),
            maxLength: 50
          })
        ),
        r.createElement(
          d,
          { xs: 24, md: 12 },
          r.createElement(
            "label",
            { style: { display: "block", fontSize: 13, marginBottom: 6 } },
            "智能体 ID（可选）"
          ),
          r.createElement(o, {
            placeholder: "例如：contract-reviewer",
            value: x,
            onChange: (re) => M(re.target.value),
            maxLength: 64,
            status: ee ? "error" : void 0
          }),
          ee ? r.createElement("div", { style: { color: "#ff4d4f", fontSize: 12, marginTop: 4 } }, ee) : null
        ),
        r.createElement(
          d,
          { span: 24 },
          r.createElement(
            "label",
            { style: { display: "block", fontSize: 13, marginBottom: 6 } },
            "专家描述（可选）"
          ),
          r.createElement(o.TextArea, {
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
      r.createElement(o.TextArea, {
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
        f,
        { gutter: [20, 16], align: "top" },
        r.createElement(
          d,
          { xs: 24, md: 12 },
          r.createElement(
            "div",
            { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 } },
            r.createElement(E, { strong: !0 }, "初始技能"),
            r.createElement(
              "div",
              { style: { display: "flex", gap: 4 } },
              r.createElement(u, { size: "small", onClick: L, disabled: z }, "内置"),
              r.createElement(u, { size: "small", onClick: () => S([]), disabled: k.length === 0 }, "清空")
            )
          ),
          z ? r.createElement("div", { style: { textAlign: "center", padding: 32 } }, r.createElement(m, { size: "small" })) : r.createElement(c, {
            mode: "multiple",
            value: k,
            onChange: S,
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
            k.length > 0 ? r.createElement(v, { color: "blue" }, `已选择 ${k.length} 个技能`) : r.createElement(E, { type: "secondary", style: { fontSize: 12 } }, "暂不添加技能")
          )
        ),
        r.createElement(
          d,
          { xs: 24, md: 12 },
          r.createElement(E, { strong: !0, style: { display: "block", marginBottom: 8 } }, "初始 MCP"),
          r.createElement(o.TextArea, {
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
            oe.error ? r.createElement(E, { type: "danger", style: { fontSize: 12 } }, oe.error) : oe.clients.length > 0 ? r.createElement(
              v,
              {
                color: "green",
                icon: h ? r.createElement(h) : void 0
              },
              `已识别 ${oe.clients.length} 个 MCP`
            ) : r.createElement(E, { type: "secondary", style: { fontSize: 12 } }, "暂不添加 MCP")
          )
        )
      )
    )
  );
}
const Pa = "ugsci_custom_teams";
function Lo(e) {
  if (!e || typeof e != "object") return !1;
  const t = e;
  return typeof t.id == "string" && typeof t.name == "string" && typeof t.taskTemplate == "string" && typeof t.orchestrationPrompt == "string" && Array.isArray(t.members);
}
function Bo() {
  try {
    const e = JSON.parse(
      localStorage.getItem(Pa) || "[]"
    );
    return Array.isArray(e) ? e.filter(Lo) : [];
  } catch {
    return [];
  }
}
function Uo(e) {
  try {
    localStorage.setItem(Pa, JSON.stringify(e));
  } catch {
  }
}
function jo(e) {
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
function No(e) {
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
  const r = (await t.json()).map(No);
  return e && Uo(r), r;
}
async function Oa(e) {
  const t = await Qe("/ugsci/team/custom", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(jo(e))
  });
  if (!t.ok) {
    const r = await t.text().catch(() => "");
    throw new Error(r || `HTTP ${t.status}`);
  }
  const n = await t.json();
  return { ...e, id: n.team_id };
}
async function Do(e) {
  const t = await Qe(
    `/ugsci/team/custom/${encodeURIComponent(e)}`,
    { method: "DELETE" }
  );
  if (!t.ok && t.status !== 404) {
    const n = await t.text().catch(() => "");
    throw new Error(n || `HTTP ${t.status}`);
  }
}
async function Fo() {
  const e = Bo();
  if (e.length === 0) return;
  const t = await An(!1), n = new Set(t.map((r) => r.id));
  await Promise.all(
    e.filter((r) => !n.has(r.id)).map((r) => Oa(r))
  );
}
async function Go(e) {
  var a, l;
  const t = (a = e.body) == null ? void 0 : a.getReader();
  if (!t) return;
  const n = new TextDecoder();
  let r = "";
  try {
    for (; ; ) {
      const { done: s, value: i } = await t.read();
      if (s) break;
      r += n.decode(i, { stream: !0 });
      let o;
      for (; (o = r.indexOf(`

`)) >= 0; ) {
        const c = r.slice(0, o);
        r = r.slice(o + 2);
        for (const u of c.split(`
`)) {
          if (!u.startsWith("data: ")) continue;
          const f = u.slice(6);
          let d;
          try {
            d = JSON.parse(f);
          } catch {
            continue;
          }
          if (d.error) {
            const m = d.error, v = typeof m == "string" ? m : (m == null ? void 0 : m.message) || "工作流启动失败";
            throw new Error(v);
          }
          if (d.object === "response" || d.type === "response") {
            const m = d.status;
            if (m === "failed" || m === "error") {
              const v = ((l = d.error) == null ? void 0 : l.message) || "工作流启动失败";
              throw new Error(v);
            }
            return;
          }
          if (d.object === "content" || d.type === "message")
            return;
        }
      }
    }
  } finally {
    t.releaseLock();
  }
}
async function Ho(e, t, n) {
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
    const o = await a.text().catch(() => "");
    throw new Error(
      o || `创建会话失败 (HTTP ${a.status})`
    );
  }
  const s = (await a.json()).id, i = await Qe("/console/chat", {
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
    const o = await i.text().catch(() => "");
    throw new Error(o || `HTTP ${i.status}`);
  }
  return await Go(i), s;
}
function Ra(e, t) {
  var a;
  const n = t.replace(/\s+/g, ""), r = e.find(
    (l) => l.name === t || l.name.replace(/\s+/g, "") === n
  );
  return r ? r.id : ((a = e.find(
    (l) => l.name.includes(t) || t.includes(l.name) || l.name.replace(/\s+/g, "").includes(n)
  )) == null ? void 0 : a.id) || null;
}
function Ma() {
  var t;
  const e = (t = window.QwenPaw) == null ? void 0 : t.host;
  if (!e) throw new Error("[ugsci] QwenPaw.host not available");
  return e;
}
async function La(e, t) {
  const n = await e.text().catch(() => "");
  if (!n) return t;
  try {
    const r = JSON.parse(n);
    if (typeof r.detail == "string") return r.detail;
  } catch {
  }
  return n;
}
async function Kn(e, t, n) {
  const r = await Qe(e, {
    headers: t ? { "X-Agent-Id": t } : void 0,
    signal: n
  });
  if (!r.ok)
    throw new Error(
      await La(r, `HTTP ${r.status}`)
    );
  return await r.json();
}
function Wo(e, t) {
  return Kn("/ugsci/team/state", e, t);
}
async function Vo(e, t) {
  const n = await Qe("/ugsci/team/runs", {
    headers: { "X-Agent-Id": e },
    signal: t
  });
  if (!n.ok)
    throw new Error(
      await La(
        n,
        `Failed to load team runs: ${n.status}`
      )
    );
  return await n.json();
}
const Jo = 5e3;
function Or({
  activeOnly: e = !1,
  enabled: t = !0
}) {
  const n = Ma(), r = n.React, { useCallback: a, useEffect: l, useRef: s, useState: i } = r, { Alert: o, Button: c, Card: u, Empty: f, Spin: d, Tag: m, Typography: v } = n.antd, { Text: g, Paragraph: p } = v, h = n.useSelectedAgent ? n.useSelectedAgent() : { id: "default" }, E = (h == null ? void 0 : h.id) || "default", [w, b] = i([]), [x, M] = i(!0), [D, $] = i(null), [A, F] = i(!1), V = s(null), U = s(0), k = s(!1), S = s(E), z = a(
    async (j = !0, G = !0) => {
      var ee;
      if (!t || !G && k.current) return;
      (ee = V.current) == null || ee.abort();
      const O = new AbortController();
      V.current = O;
      const P = ++U.current;
      k.current = !0, j && M(!0);
      try {
        const oe = await Vo(E, O.signal);
        if (O.signal.aborted || P !== U.current)
          return;
        b(oe), F(!0), $(null);
      } catch (oe) {
        if (O.signal.aborted || P !== U.current)
          return;
        $(
          oe instanceof Error ? oe.message : "讨论运行记录加载失败"
        );
      } finally {
        !O.signal.aborted && P === U.current && (V.current = null, k.current = !1, M(!1));
      }
    },
    [E, t]
  );
  if (l(() => {
    var G;
    if (!t) {
      (G = V.current) == null || G.abort(), V.current = null, k.current = !1, U.current += 1;
      return;
    }
    S.current !== E && (S.current = E, b([]), $(null), F(!1)), z(!0, !0);
    const j = e ? window.setInterval(() => {
      z(!1, !1);
    }, Jo) : null;
    return () => {
      var O;
      j !== null && window.clearInterval(j), (O = V.current) == null || O.abort(), V.current = null, k.current = !1, U.current += 1;
    };
  }, [e, E, t, z]), x && !A) return r.createElement(d);
  if (D && !A)
    return r.createElement(o, {
      type: "warning",
      message: "讨论运行记录加载失败",
      description: D,
      action: r.createElement(
        c,
        { size: "small", onClick: () => void z(!0, !0), loading: x },
        "重试"
      )
    });
  const I = w.filter(
    (j) => e ? j.status === "active" : j.status !== "active"
  ), W = (j) => D ? r.createElement(
    r.Fragment,
    null,
    r.createElement(o, {
      type: "warning",
      message: "讨论运行记录更新失败，当前显示上次成功读取的结果",
      description: D,
      action: r.createElement(
        c,
        {
          size: "small",
          onClick: () => void z(!0, !0),
          loading: x
        },
        "重试"
      )
    }),
    j
  ) : j;
  return I.length === 0 ? W(
    r.createElement(
      f,
      {
        description: e ? "暂无进行中的专家团讨论" : "暂无历史讨论"
      },
      r.createElement(
        c,
        { size: "small", onClick: () => void z(!0, !0), loading: x },
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
          { size: "small", onClick: () => void z(!0, !0), loading: x },
          "刷新"
        )
      ),
      r.createElement(
        "div",
        { style: { display: "flex", flexDirection: "column", gap: 8 } },
        ...I.map(
          (j) => r.createElement(
            u,
            { key: j.instance_id, size: "small" },
            r.createElement(
              "div",
              { style: { display: "flex", alignItems: "center", gap: 8 } },
              r.createElement(
                g,
                { strong: !0 },
                j.team_name || j.team_id
              ),
              r.createElement(
                m,
                {
                  color: j.status === "completed" ? "green" : j.status === "terminated" ? "orange" : "blue"
                },
                j.status
              ),
              r.createElement(m, null, j.current_phase),
              r.createElement(
                g,
                { type: "secondary" },
                `迭代 ${j.iteration}`
              )
            ),
            r.createElement(
              p,
              { ellipsis: { rows: 2 }, style: { margin: "8px 0 0" } },
              j.task || "暂无任务描述"
            )
          )
        )
      )
    )
  );
}
async function qo() {
  try {
    return (await Kn(
      "/ugsci/team/preset-teams"
    )).teams;
  } catch {
    return null;
  }
}
async function Ko() {
  try {
    return (await Kn(
      "/ugsci/team/roles"
    )).roles;
  } catch {
    return null;
  }
}
const Xo = {
  plan: { label: "规划", color: "#1677ff", icon: "📋" },
  dispatch: { label: "分派", color: "#13c2c2", icon: "🚀" },
  verify: { label: "验证", color: "#fa8c16", icon: "🔍" },
  synthesize: { label: "综合", color: "#722ed1", icon: "📊" },
  completed: { label: "完成", color: "#52c41a", icon: "✅" }
}, Rr = [
  "plan",
  "dispatch",
  "verify",
  "synthesize",
  "completed"
], Mr = 5e3, Yo = 3e4;
function Qo({ enabled: e = !0 }) {
  const t = Ma(), n = t.React, { useState: r, useEffect: a, useCallback: l, useRef: s } = n, { Card: i, Tag: o, Typography: c, Button: u, Steps: f, Empty: d, Alert: m, Spin: v } = t.antd, { ReloadOutlined: g } = t.antdIcons || {}, { Text: p, Paragraph: h } = c, E = t.useSelectedAgent ? t.useSelectedAgent() : { id: "default" }, w = (E == null ? void 0 : E.id) || "default", [b, x] = r(null), [M, D] = r(!1), [$, A] = r(null), F = s(null), V = s(0), U = s(0), k = s(0), S = s(null), z = s(!1), I = l(
    async (q, me = !0) => {
      var ye;
      if (!e || !me && z.current) return;
      (ye = S.current) == null || ye.abort();
      const R = new AbortController();
      S.current = R;
      const ce = ++k.current;
      z.current = !0, q && D(!0);
      try {
        const Z = await Wo(w, R.signal);
        if (R.signal.aborted || ce !== k.current)
          return;
        V.current = 0, U.current = 0, F.current = Z, x(Z), A(null);
      } catch (Z) {
        if (R.signal.aborted || ce !== k.current)
          return;
        V.current += 1;
        const ie = Math.min(
          Yo,
          Mr * 2 ** (V.current - 1)
        );
        U.current = Date.now() + ie, A(
          Z instanceof Error ? Z.message : "专家团状态加载失败"
        );
      } finally {
        !R.signal.aborted && ce === k.current && (S.current = null, z.current = !1, D(!1));
      }
    },
    [w, e]
  ), W = l(() => (V.current = 0, U.current = 0, I(!0)), [I]);
  if (a(() => {
    var me;
    if ((me = S.current) == null || me.abort(), S.current = null, z.current = !1, k.current += 1, V.current = 0, U.current = 0, F.current = null, x(null), A(null), !e) return;
    W();
    const q = window.setInterval(() => {
      var R, ce;
      Date.now() < U.current || ((R = F.current) == null ? void 0 : R.status) === "completed" || ((ce = F.current) == null ? void 0 : ce.status) === "terminated" || I(!1, !1);
    }, Mr);
    return () => {
      var R;
      window.clearInterval(q), (R = S.current) == null || R.abort(), S.current = null, z.current = !1, k.current += 1;
    };
  }, [w, e, I, W]), M && !b && !$)
    return n.createElement(v);
  if ($ && !b)
    return n.createElement(m, {
      type: "warning",
      showIcon: !0,
      message: "专家团状态加载失败",
      description: $,
      style: { marginBottom: 16 },
      action: n.createElement(
        u,
        { size: "small", onClick: W, loading: M },
        "重试"
      )
    });
  const j = (q) => $ ? n.createElement(
    n.Fragment,
    null,
    n.createElement(m, {
      type: "warning",
      showIcon: !0,
      message: "状态更新失败，当前显示上次成功读取的结果",
      description: $,
      style: { marginBottom: 16 },
      action: n.createElement(
        u,
        { size: "small", onClick: W, loading: M },
        "重试"
      )
    }),
    q
  ) : q;
  if ((b == null ? void 0 : b.status) === "unreadable")
    return j(
      n.createElement(m, {
        type: "warning",
        showIcon: !0,
        message: "专家团状态暂时无法读取",
        description: `实例 ${b.instance_id || "未知"} 的状态文件需要检查。`,
        style: { marginBottom: 16 },
        action: n.createElement(
          u,
          { size: "small", onClick: W, loading: M },
          "重试"
        )
      })
    );
  if (!b || !b.active) {
    if ((b == null ? void 0 : b.status) === "completed" || (b == null ? void 0 : b.status) === "terminated") {
      const q = b.status === "completed";
      return j(
        n.createElement(m, {
          type: q ? "success" : "info",
          showIcon: !0,
          message: q ? "专家团工作流已完成" : "专家团工作流已终止",
          description: q ? `实例 ${b.instance_id || "未知"} 已完成，结果文件保留在工作区。` : `原因：${b.state.termination_reason || "未知"}`,
          style: { marginBottom: 16 }
        })
      );
    }
    return j(
      n.createElement(d, {
        description: "暂无活跃的专家团工作流",
        style: { padding: 24 }
      })
    );
  }
  const G = b.state, O = G.current_phase || "plan", P = Rr.indexOf(O), ee = G.team_name || "未知团队", oe = G.team_mode || "pipeline", B = G.iteration || 0, L = G.members || [], le = G.verify_retries || 0, re = {
    pipeline: "顺序交接",
    coordinator: "主管协作",
    roundtable: "并行汇聚",
    router: "智能路由",
    review_loop: "评审迭代",
    debate: "多方论证"
  };
  return j(
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
            p,
            { strong: !0 },
            `${ee} — 工作流状态`
          ),
          n.createElement(
            o,
            { color: "blue", style: { fontSize: 10 } },
            re[oe] || oe
          ),
          n.createElement(
            o,
            { style: { fontSize: 10 } },
            `迭代 ${B}`
          ),
          le > 0 ? n.createElement(
            o,
            { color: "orange", style: { fontSize: 10 } },
            `验证重试 ${le}`
          ) : null
        ),
        extra: n.createElement(
          u,
          {
            size: "small",
            type: "text",
            icon: g ? n.createElement(g) : void 0,
            onClick: W,
            loading: M
          },
          "刷新"
        )
      },
      n.createElement(f, {
        current: P,
        size: "small",
        items: Rr.map((q) => {
          const me = Xo[q];
          return {
            title: `${me.icon} ${me.label}`,
            description: q === "plan" ? "分析任务，创建任务分解" : q === "dispatch" ? "分派专家执行任务" : q === "verify" ? "交叉验证专家结果" : q === "synthesize" ? "综合形成最终报告" : "工作流完成"
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
          (q, me) => n.createElement(
            o,
            { key: `${q.name}-${me}`, style: { fontSize: 11 } },
            `${q.emoji || ""} ${q.name}（${q.role}）`
          )
        )
      ),
      G.task ? n.createElement(
        h,
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
function Zo({ team: e }) {
  const t = T().React, { Typography: n, Tag: r } = T().antd, { Text: a } = n, l = {
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
      ...i.length > 0 ? i.map((u, f) => [
        f > 0 && !o ? t.createElement(
          "div",
          {
            key: `arrow-${f}`,
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
            key: `step-${f}`,
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
      ]).flat() : e.members.map((u, f) => [
        f > 0 && !o ? t.createElement(
          "div",
          {
            key: `arrow-${f}`,
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
            key: `member-${f}`,
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
function Wt(e) {
  const t = e.replace(/\s+/g, "").toLowerCase();
  return t.includes("测井") ? "log-analyst" : t.includes("地球物理") ? "geophysicist" : t.includes("油藏") ? "reservoir-engineer" : t.includes("钻井") ? "drilling-engineer" : t.includes("采油") || t.includes("生产") ? "production-engineer" : t.includes("pvt") || t.includes("物性") ? "pvt-analyst" : t.includes("审核") || t.includes("verifier") ? "domain-reviewer" : t.includes("master") || t.includes("planner") ? "planner" : "analyst";
}
const es = [
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
function ts({
  open: e,
  onClose: t,
  agents: n,
  editingTeam: r,
  onSaved: a
}) {
  const l = T().React, { useState: s, useEffect: i, useCallback: o } = l, {
    Modal: c,
    Input: u,
    Button: f,
    Select: d,
    Tag: m,
    Typography: v,
    Switch: g,
    Empty: p,
    message: h,
    Divider: E,
    Steps: w
  } = T().antd, { PlusOutlined: b, DeleteOutlined: x, SaveOutlined: M, ArrowRightOutlined: D } = T().antdIcons || {}, { Text: $, Paragraph: A } = v, [F, V] = s(""), [U, k] = s("🤝"), [S, z] = s(""), [I, W] = s("pipeline"), [j, G] = s(""), [O, P] = s(""), [ee, oe] = s([]), [B, L] = s([]), [le, re] = s(!1), [q, me] = s(2), [R, ce] = s(""), [ye, Z] = s(""), [ie, te] = s({}), [be, ve] = s({}), [$e, Se] = s(
    es
  ), ne = [
    { value: "pipeline", icon: "→", title: "顺序交接", description: "上一步产物成为下一位专家的上下文", topology: "A → B → C", accent: "#08979c" },
    { value: "roundtable", icon: "⇉", title: "并行汇聚", description: "独立并行分析，避免观点相互污染", topology: "A ∥ B ∥ C → 汇总", accent: "#531dab" },
    { value: "coordinator", icon: "◎", title: "主管协作", description: "主控专家拆解任务并按需组织成员", topology: "主管 → 专家组", accent: "#0958d9" },
    { value: "router", icon: "◇", title: "智能路由", description: "按任务能力需求选择最小充分专家集合", topology: "任务 → 路由 → 子集", accent: "#d46b08" },
    { value: "review_loop", icon: "↻", title: "评审迭代", description: "产出、独立审查、修订，直到满足标准", topology: "执行 ⇄ 评审", accent: "#389e0d" },
    { value: "debate", icon: "⚖", title: "多方论证", description: "独立立场、交叉质询，再由裁决者综合", topology: "观点 ⇄ 反驳 → 裁决", accent: "#c41d7f" }
  ];
  i(() => {
    e && (r ? (V(r.name), k(r.emoji), z(r.description), W(r.mode), G(r.coordinatorName || ""), P(r.taskTemplate), oe(r.steps || []), L(r.members.map((C) => C.name)), me(r.maxReviewRounds || 2), ce(r.successCriteria || ""), Z(r.routingInstruction || ""), te(
      Object.fromEntries(
        r.members.map((C) => [
          C.name,
          C.bindingMode || (C.agentId ? "fixed" : "preferred")
        ])
      )
    ), ve(
      Object.fromEntries(
        r.members.map((C) => [
          C.name,
          C.roleKey || Wt(C.name)
        ])
      )
    )) : (V(""), k("🤝"), z(""), W("pipeline"), G(""), P(`请执行以下任务：
任务描述：{任务描述}`), oe([]), L([]), me(2), ce(""), Z(""), te({}), ve({})));
  }, [e, r]), i(() => {
    e && Ko().then((C) => {
      C != null && C.length && Se(C);
    });
  }, [e]);
  const we = o(() => {
    if (I === "roundtable" || I === "debate" || I === "router") {
      const C = B.map((pe) => ({
        agentName: pe,
        instruction: "请给出你的专业评估意见",
        passContext: !1
      }));
      oe(C);
    } else if (I === "pipeline") {
      const C = new Map(ee.map((X) => [X.agentName, X])), pe = B.map((X) => C.get(X) || {
        agentName: X,
        instruction: "请完成你的专业部分",
        passContext: !0
      });
      oe(pe);
    }
  }, [I, B, ee]), Ce = (C) => {
    B.includes(C) || (L([...B, C]), te({ ...ie, [C]: "fixed" }), ve({
      ...be,
      [C]: Wt(C)
    }), (I === "coordinator" || I === "debate") && !j && G(C));
  }, K = (C) => {
    const pe = B.filter((ae) => ae !== C);
    L(pe), oe(ee.filter((ae) => ae.agentName !== C));
    const X = { ...ie };
    delete X[C], te(X);
    const _ = { ...be };
    delete _[C], ve(_), j === C && G(pe[0] || "");
  }, ue = (C, pe, X) => {
    const _ = [...ee];
    _[C] = { ..._[C], [pe]: X }, oe(_);
  }, he = async () => {
    if (!F.trim()) {
      h.warning("请输入团队名称");
      return;
    }
    if (B.length < 2) {
      h.warning("至少需要选择 2 个成员");
      return;
    }
    if (!O.trim()) {
      h.warning("请输入任务模板");
      return;
    }
    if ((I === "coordinator" || I === "debate") && !j) {
      h.warning(I === "debate" ? "请选择裁决者" : "请选择主控专家");
      return;
    }
    re(!0);
    try {
      let C = [...B];
      I === "coordinator" && j ? C = [j, ...C.filter((ae) => ae !== j)] : I === "debate" && j && (C = [...C.filter((ae) => ae !== j), j]);
      const pe = C.map(
        (ae) => {
          var Ve;
          const fe = n.find((Be) => Be.name === ae), _e = ie[ae] || "fixed", Le = be[ae] || Wt(ae), We = $e.find((Be) => Be.key === Le);
          return {
            name: ae,
            role: (We == null ? void 0 : We.display_name) || ((Ve = fe == null ? void 0 : fe.description) == null ? void 0 : Ve.slice(0, 30)) || "需求分析师",
            emoji: "",
            agentId: _e === "temporary" || fe == null ? void 0 : fe.id,
            roleKey: Le,
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
        description: S.trim() || `${F.trim()}（${B.length}人团队）`,
        mode: I,
        members: pe,
        coordinatorName: I === "coordinator" || I === "debate" ? j : void 0,
        taskTemplate: O.trim(),
        orchestrationPrompt: "",
        // Custom teams use steps-based instructions
        steps: X,
        custom: !0,
        createdAt: (r == null ? void 0 : r.createdAt) || Date.now(),
        updatedAt: r == null ? void 0 : r.updatedAt,
        version: r == null ? void 0 : r.version,
        maxReviewRounds: q,
        successCriteria: R.trim(),
        routingInstruction: ye.trim()
      };
      await Oa(_), h.success(r ? "团队已更新" : "团队已创建"), a(), t();
    } catch (C) {
      h.error(C.message || "保存失败");
    } finally {
      re(!1);
    }
  }, H = n.filter(
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
        icon: M ? l.createElement(M) : void 0
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
        B.length > 0 ? l.createElement(qn, {
          members: B,
          size: 36
        }) : null,
        l.createElement(u, {
          placeholder: "专家团名称（如：储层评价与质量复核专家团）",
          value: F,
          onChange: (C) => V(C.target.value),
          style: { flex: 1 }
        })
      ),
      l.createElement(u.TextArea, {
        placeholder: "说明这个工作流解决什么问题、适用于什么场景",
        value: S,
        onChange: (C) => z(C.target.value),
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
        ...ne.map((C) => {
          const pe = I === C.value;
          return l.createElement(
            "button",
            {
              key: C.value,
              type: "button",
              onClick: () => {
                W(C.value), C.value !== "coordinator" && C.value !== "debate" && G("");
              },
              style: {
                textAlign: "left",
                padding: 10,
                borderRadius: 8,
                cursor: "pointer",
                background: pe ? `${C.accent}0d` : "var(--ant-color-bg-container, #fff)",
                border: `1px solid ${pe ? C.accent : "var(--ant-color-border, #d9d9d9)"}`,
                boxShadow: pe ? `0 0 0 2px ${C.accent}1a` : "none"
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
    l.createElement(E, { style: { margin: "12px 0" } }),
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
          (C) => l.createElement(
            f,
            {
              key: C.id,
              size: "small",
              icon: b ? l.createElement(b) : void 0,
              onClick: () => Ce(C.name)
            },
            C.name
          )
        )
      ) : null,
      // Selected members
      B.length === 0 ? l.createElement(p, {
        description: "请从上方添加团队成员",
        image: p.PRESENTED_IMAGE_SIMPLE
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
                $,
                { strong: !0, style: { fontSize: 13 } },
                C
              ),
              (I === "coordinator" || I === "debate") && j === C ? l.createElement(
                m,
                { color: "blue", style: { fontSize: 10 } },
                I === "debate" ? "裁决者" : "主控"
              ) : null
            ),
            l.createElement(
              "div",
              { style: { display: "flex", gap: 4 } },
              l.createElement(d, {
                size: "small",
                value: be[C] || Wt(C),
                style: { width: 132 },
                onChange: (pe) => ve({ ...be, [C]: pe }),
                options: $e.map((pe) => ({
                  value: pe.key,
                  label: pe.display_name
                }))
              }),
              l.createElement(d, {
                size: "small",
                value: ie[C] || "fixed",
                style: { width: 118 },
                onChange: (pe) => te({ ...ie, [C]: pe }),
                options: [
                  { value: "fixed", label: "固定实例" },
                  { value: "preferred", label: "优先实例" },
                  { value: "temporary", label: "临时派生" }
                ]
              }),
              I === "coordinator" || I === "debate" ? l.createElement(
                f,
                {
                  size: "small",
                  type: "link",
                  onClick: () => G(C)
                },
                I === "debate" ? "设为裁决者" : "设为主控"
              ) : null,
              l.createElement(
                f,
                {
                  size: "small",
                  type: "link",
                  danger: !0,
                  icon: x ? l.createElement(x) : void 0,
                  onClick: () => K(C)
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
        l.createElement(d, {
          value: q,
          onChange: (C) => me(C),
          options: [1, 2, 3, 4, 5].map((C) => ({ value: C, label: `最多 ${C} 轮` }))
        }),
        l.createElement(u, {
          value: R,
          onChange: (C) => ce(C.target.value),
          placeholder: "验收标准，例如：关键结论均有数据依据，且无高风险缺陷"
        })
      ) : l.createElement(u, {
        value: ye,
        onChange: (C) => Z(C.target.value),
        placeholder: "路由偏好，例如：仅调用任务必需的专家；涉及模拟时优先油藏工程师"
      })
    ) : null,
    l.createElement(E, { style: { margin: "12px 0" } }),
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
        f,
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
          (C, pe) => l.createElement(
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
              l.createElement(g, {
                size: "small",
                checked: C.passContext,
                onChange: (X) => ue(pe, "passContext", X)
              }),
              l.createElement(
                $,
                { type: "secondary", style: { fontSize: 11 } },
                C.passContext ? "传递上一步结果作为上下文" : "独立执行"
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
        $,
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
        onChange: (C) => P(C.target.value),
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
function Lr({
  team: e,
  agents: t,
  onLaunch: n,
  onEdit: r,
  onDelete: a
}) {
  var k;
  const l = T().React, { useState: s } = l, { Card: i, Tag: o, Typography: c, Button: u, Tooltip: f, Popconfirm: d } = T().antd, {
    TeamOutlined: m,
    RocketOutlined: v,
    UserOutlined: g,
    EditOutlined: p,
    DeleteOutlined: h,
    DownOutlined: E,
    UpOutlined: w
  } = T().antdIcons || {}, { Text: b, Paragraph: x } = c, [M, D] = s(!1), $ = {
    coordinator: { label: "主管协作", color: "blue" },
    pipeline: { label: "顺序交接", color: "cyan" },
    roundtable: { label: "并行汇聚", color: "purple" },
    router: { label: "智能路由", color: "orange" },
    review_loop: { label: "评审迭代", color: "green" },
    debate: { label: "多方论证", color: "magenta" }
  }, A = $[e.mode] || $.coordinator, F = e.members.map((S) => {
    const z = S.bindingMode === "temporary", I = z ? null : (S.agentId && t.some((W) => W.id === S.agentId) ? S.agentId : null) || Ra(t, S.name);
    return { ...S, found: !!I, agentId: I, temporary: z };
  }), V = F.filter((S) => S.found).length, U = e.coordinatorName || ((k = e.members[0]) == null ? void 0 : k.name);
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
      l.createElement(qn, {
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
            b,
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
            { color: A.color, style: { fontSize: 10 } },
            A.label
          ),
          l.createElement(
            o,
            { color: "green", style: { fontSize: 10 } },
            `${e.members.length} 位专家`
          ),
          V < e.members.length ? l.createElement(
            f,
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
        r ? l.createElement(
          f,
          { title: "编辑" },
          l.createElement(u, {
            type: "text",
            size: "small",
            icon: p ? l.createElement(p) : void 0,
            onClick: (S) => {
              S.stopPropagation(), r(e);
            }
          })
        ) : null,
        a ? l.createElement(
          f,
          { title: "删除" },
          l.createElement(
            d,
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
              icon: h ? l.createElement(h) : void 0,
              onClick: (S) => S.stopPropagation()
            })
          )
        ) : null
      ) : null
    ),
    // Description
    l.createElement(
      x,
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
          f,
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
              b,
              {
                style: { fontSize: 11, color: S.found ? "#1f4e8c" : "#531dab" }
              },
              S.name
            ),
            S.temporary ? l.createElement(
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
      u,
      {
        type: "link",
        size: "small",
        style: { padding: "0 0 4px 0", fontSize: 11, height: "auto" },
        onClick: (S) => {
          S.stopPropagation(), D(!M);
        },
        icon: M ? w ? l.createElement(w) : "▲" : E ? l.createElement(E) : "▼"
      },
      M ? "收起流程" : "查看执行流程"
    ),
    M ? l.createElement(Zo, { team: e }) : null,
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
        b,
        { type: "secondary", style: { fontSize: 11 } },
        U ? `${e.mode === "debate" ? "裁决者" : "主控"}: ${U}` : "OMP 动态编排"
      ),
      l.createElement(
        u,
        {
          type: "primary",
          size: "small",
          icon: v ? l.createElement(v) : void 0,
          disabled: t.length === 0,
          onClick: () => n(e),
          style: je
        },
        "运行工作流"
      )
    )
  );
}
function ns({
  agents: e,
  onLaunch: t
}) {
  const n = T().React, { useMemo: r, useState: a, useCallback: l, useEffect: s } = n, {
    Row: i,
    Col: o,
    Input: c,
    Empty: u,
    Typography: f,
    Tag: d,
    Button: m,
    Divider: v,
    Tabs: g,
    message: p
  } = T().antd, { SearchOutlined: h, PlusOutlined: E, RocketOutlined: w } = T().antdIcons || {}, { Text: b } = f, [x, M] = a(""), [D, $] = a([]), [A, F] = a([]), [V, U] = a(!1), [k, S] = a(null), [z, I] = a("preset");
  s(() => {
    let L = !0;
    return (async () => {
      try {
        await Fo();
        const le = await An();
        L && $(le);
      } catch (le) {
        console.warn("[ugsci] Failed to load backend expert teams:", le), L && ($([]), p.warning("专家团后端加载失败，请检查服务后重试"));
      }
    })(), qo().then((le) => {
      L && le && F(le);
    }), () => {
      L = !1;
    };
  }, []);
  const W = l(() => {
    An().then($).catch((L) => {
      console.warn("[ugsci] Failed to refresh expert teams:", L), $([]), p.warning("专家团后端加载失败，请检查服务后重试");
    });
  }, [p]), j = l(
    (L) => {
      Do(L.id).then(() => {
        W(), p.success(`团队「${L.name}」已删除`);
      }).catch((le) => p.error(le.message || "删除专家团失败"));
    },
    [p, W]
  ), G = l((L) => {
    S(L), U(!0);
  }, []), O = l(() => {
    S(null), U(!0);
  }, []), P = r(() => [...D, ...A], [D, A]), ee = r(() => {
    if (!x.trim()) return P;
    const L = x.toLowerCase();
    return P.filter(
      (le) => le.name.toLowerCase().includes(L) || le.description.toLowerCase().includes(L) || le.category.toLowerCase().includes(L)
    );
  }, [P, x]), oe = ee.filter((L) => L.custom), B = ee.filter((L) => !L.custom);
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
        prefix: h ? n.createElement(h) : void 0,
        value: x,
        onChange: (L) => M(L.target.value),
        allowClear: !0,
        style: { flex: "1 1 280px", maxWidth: 400 }
      }),
      n.createElement(
        m,
        {
          type: "primary",
          size: "small",
          icon: E ? n.createElement(E) : void 0,
          onClick: O,
          style: je
        },
        "创建专家团"
      )
    ),
    // Tabs: preset teams vs custom teams
    n.createElement(
      g,
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
                i,
                { gutter: [12, 12] },
                ...B.map(
                  (L) => n.createElement(
                    o,
                    { key: L.id, xs: 24, sm: 12, md: 8 },
                    n.createElement(Lr, {
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
                    o,
                    { key: L.id, xs: 24, sm: 12, md: 8 },
                    n.createElement(Lr, {
                      team: L,
                      agents: e,
                      onLaunch: t,
                      onEdit: G,
                      onDelete: j
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
              n.createElement(Qo, {
                enabled: z === "active"
              }),
              n.createElement(Or, {
                activeOnly: !0,
                enabled: z === "active"
              })
            )
          },
          {
            key: "history",
            label: "讨论历史",
            children: n.createElement(Or, {
              enabled: z === "history"
            })
          }
        ]
      }
    ),
    // Team Builder Modal
    n.createElement(ts, {
      open: V,
      onClose: () => {
        U(!1), S(null);
      },
      agents: e,
      editingTeam: k,
      onSaved: W
    })
  );
}
const rs = [
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
], as = 5e3, ls = {
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
function os(e) {
  window.history.pushState({}, "", e), window.dispatchEvent(new PopStateEvent("popstate"));
}
function Sn(e, t) {
  const n = new URLSearchParams();
  e && n.set("flow", e), t && n.set("run", t), os(`/flowforge${n.size ? `?${n.toString()}` : ""}`);
}
function ss(e) {
  return e ? new Date(e * 1e3).toLocaleString("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  }) : "—";
}
function is(e) {
  if (!e || e <= 0) return "—";
  if (e < 1e3) return `${e}ms`;
  const t = Math.floor(e / 1e3);
  if (t < 60) return `${t}s`;
  const n = Math.floor(t / 60), r = t % 60;
  return `${n}m${r}s`;
}
function cs(e) {
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
const Vt = /* @__PURE__ */ new Set(["running", "queued", "paused", "waiting_human"]);
function ds() {
  const e = T().React, { useCallback: t, useEffect: n, useRef: r, useState: a } = e, {
    Alert: l,
    Button: s,
    Card: i,
    Col: o,
    Empty: c,
    Input: u,
    Popconfirm: f,
    Row: d,
    Space: m,
    Spin: v,
    Tabs: g,
    Tag: p,
    Tooltip: h,
    Typography: E,
    message: w
  } = T().antd, {
    ApartmentOutlined: b,
    DeleteOutlined: x,
    ReloadOutlined: M,
    RocketOutlined: D,
    PlayCircleOutlined: $,
    StopOutlined: A
  } = T().antdIcons || {}, { Text: F, Paragraph: V, Title: U } = E, k = T().useSelectedAgent, S = k ? k() : { id: "default" }, z = (S == null ? void 0 : S.id) || "default", [I, W] = a([]), [j, G] = a([]), [O, P] = a([]), [ee, oe] = a(!0), [B, L] = a(!0), [le, re] = a(null), [q, me] = a(""), [R, ce] = a(""), [ye, Z] = a("templates"), [ie, te] = a(/* @__PURE__ */ new Set()), be = r(null), ve = j.some((_) => Vt.has(_.status)), $e = e.useMemo(() => {
    const _ = {};
    return I.forEach((ae) => {
      _[ae.id] = ae.name;
    }), _;
  }, [I]), Se = e.useMemo(() => {
    const _ = {};
    return j.forEach((ae) => {
      Vt.has(ae.status) && (_[ae.flow_id] = (_[ae.flow_id] || 0) + 1);
    }), _;
  }, [j]), ne = t(async (_ = !1) => {
    _ || oe(!0);
    try {
      const [ae, fe, _e] = await Promise.all([
        de("/flowforge/flows", { bypassCache: !0 }),
        de("/flowforge/runs", { bypassCache: !0 }),
        mn().catch(() => [])
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
    }, as), () => {
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
          }, _e = Object.entries(fe).filter(([qe]) => /^step_\d+$/.test(qe)).sort(([qe], [Re]) => Number(qe.slice(5)) - Number(Re.slice(5))), Le = {};
          let We = 0, Ve = 0;
          _e.forEach(([qe, Re], Ae) => {
            const se = _.roleHints[Ae] || "", Pe = _.roleKeys[Ae] || "analyst", ze = O.find(
              (Ye) => `${Ye.name} ${Ye.id}`.toLowerCase().includes(se.toLowerCase())
            );
            ze ? We++ : Ve++;
            const Me = (ze == null ? void 0 : ze.id) || z, Xe = { ...Re.inputs || {} };
            Xe.agent_id = Me, fe[qe] = {
              ...Re,
              inputs: Xe,
              metadata: {
                ...Re.metadata || {},
                binding_policy: "fixed_instance",
                role_hint: se,
                role_key: Pe,
                agent_id: Me
              }
            }, Le[qe] = {
              binding_policy: "fixed_instance",
              role_hint: se,
              role_key: Pe,
              agent_id: Me
            };
          });
          const Be = {
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
              node_bindings: Le
            }
          };
          await de("/flowforge/flows", {
            method: "POST",
            body: JSON.stringify(Be)
          });
          const lt = _e.length > 0 ? `（${We} 个专家已匹配，${Ve} 个回退到控制器）` : "";
          w.success(`已创建工作流草稿「${_.name}」${lt}`), await ne();
        } catch (ae) {
          w.error(ae.message || "创建工作流失败");
        } finally {
          re(null);
        }
      }
    },
    [O, z, le, ne, w]
  ), Ce = t(async () => {
    if (!le) {
      if (!R.trim()) {
        w.warning("请先描述工作流步骤和控制要求");
        return;
      }
      re("natural-language");
      try {
        const _ = await de(
          "/flowforge/generate",
          {
            method: "POST",
            body: JSON.stringify({
              prompt: R.trim(),
              name: q.trim(),
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
        }), w.success("已从自然语言生成可编辑工作流草稿"), me(""), ce(""), await ne();
      } catch (_) {
        w.error(_.message || "自然语言生成失败");
      } finally {
        re(null);
      }
    }
  }, [z, le, ne, w, q, R]), K = t(
    async (_, ae) => {
      try {
        await de(`/flowforge/flows/${encodeURIComponent(_)}/run`, {
          method: "POST",
          body: JSON.stringify({ inputs: {} })
        }), w.success(`已启动工作流「${ae}」`), await ne(!0);
      } catch (fe) {
        w.error(fe.message || "启动工作流失败");
      }
    },
    [ne, w]
  ), ue = t(
    async (_, ae) => {
      try {
        await de(`/flowforge/flows/${encodeURIComponent(_)}`, {
          method: "DELETE"
        }), w.success(`已删除工作流「${ae}」`), await ne();
      } catch (fe) {
        w.error(fe.message || "删除工作流失败");
      }
    },
    [ne, w]
  ), he = t(
    async (_) => {
      te((ae) => {
        const fe = new Set(ae);
        return fe.add(_), fe;
      });
      try {
        await de(`/flowforge/runs/${encodeURIComponent(_)}/cancel`, {
          method: "POST"
        }), w.success("已请求取消运行"), await ne(!0);
      } catch (ae) {
        w.error(ae.message || "取消运行失败");
      } finally {
        te((ae) => {
          const fe = new Set(ae);
          return fe.delete(_), fe;
        });
      }
    },
    [ne, w]
  ), H = e.createElement(
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
          value: q,
          onChange: (_) => me(_.target.value),
          placeholder: "工作流名称（可选）",
          maxLength: 80
        }),
        e.createElement(u.TextArea, {
          value: R,
          onChange: (_) => ce(_.target.value),
          placeholder: "例如：先检查某储气库本周期压力和注采量数据，再由油藏工程师预测下周期能力，由独立完整性专家复核风险，最后形成带证据和不确定性的建议。",
          autoSize: { minRows: 3, maxRows: 8 }
        }),
        e.createElement(
          s,
          {
            type: "primary",
            onClick: () => void Ce(),
            loading: le === "natural-language",
            disabled: !B || !!le,
            style: je
          },
          "生成可编辑草稿"
        )
      )
    ),
    e.createElement(
      d,
      { gutter: [12, 12] },
      ...rs.map(
        (_) => e.createElement(
          o,
          { key: _.key, xs: 24, md: 8 },
          e.createElement(
            i,
            { style: { height: "100%" } },
            e.createElement(
              m,
              { align: "start", style: { width: "100%" } },
              e.createElement("span", { style: { fontSize: 28 } }, _.icon),
              e.createElement(
                "div",
                { style: { flex: 1 } },
                e.createElement(U, { level: 5, style: { margin: 0 } }, _.name),
                e.createElement(p, { color: "blue", style: { marginTop: 6 } }, _.category),
                e.createElement(
                  V,
                  { type: "secondary", style: { margin: "10px 0 14px" } },
                  _.description
                ),
                e.createElement(
                  s,
                  {
                    type: "primary",
                    loading: le === _.key,
                    disabled: !B || !!le,
                    onClick: () => void we(_),
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
        d,
        { gutter: [12, 12] },
        ...[
          ["固定实例", "生产关键节点使用指定且已验证的专家实例", "当前可执行"],
          ["优先实例", "定义中记录首选实例和治理降级策略", "规划中"],
          ["模板派生", "由 OMP 控制节点按角色模板临时创建隔离角色", "规划中"],
          ["动态路由", "按能力、健康、权限和成本选择实例", "规划中"]
        ].map(
          ([_, ae, fe]) => e.createElement(
            o,
            { key: _, xs: 24, sm: 12, lg: 6 },
            e.createElement(F, { strong: !0 }, _),
            e.createElement(
              p,
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
  ), C = ee ? e.createElement(v) : I.length === 0 ? e.createElement(c, { description: "暂无工作流，可从模板创建" }) : e.createElement(
    d,
    { gutter: [12, 12] },
    ...I.map((_) => {
      const ae = Se[_.id] || 0;
      return e.createElement(
        o,
        { key: _.id, xs: 24, md: 12, xl: 8 },
        e.createElement(
          i,
          {
            size: "small",
            title: e.createElement(
              m,
              { size: 6 },
              e.createElement("span", null, _.name),
              ae > 0 ? e.createElement(
                p,
                { color: "blue" },
                `${ae} 个运行中`
              ) : null
            ),
            extra: e.createElement(p, null, `v${_.version}`)
          },
          e.createElement(V, { ellipsis: { rows: 2 } }, _.description || "暂无描述"),
          e.createElement(
            m,
            { size: 8, wrap: !0 },
            e.createElement(p, { color: "geekblue" }, `${_.node_count} 个节点`),
            e.createElement(s, {
              size: "small",
              type: "primary",
              icon: $ ? e.createElement($) : void 0,
              disabled: !B,
              onClick: () => void K(_.id, _.name)
            }, "运行"),
            e.createElement(s, {
              size: "small",
              onClick: () => Sn(_.id)
            }, "编辑"),
            e.createElement(
              f,
              {
                title: "确认删除",
                description: `确定要删除工作流「${_.name}」吗？此操作不可撤销。`,
                onConfirm: () => void ue(_.id, _.name),
                okText: "删除",
                cancelText: "取消",
                okButtonProps: { danger: !0 }
              },
              e.createElement(s, {
                size: "small",
                danger: !0,
                icon: x ? e.createElement(x) : void 0
              }, "删除")
            )
          )
        )
      );
    })
  ), pe = ee ? e.createElement(v) : j.length === 0 ? e.createElement(c, { description: "暂无工作流运行记录" }) : e.createElement(
    "div",
    { style: { display: "flex", flexDirection: "column", gap: 8 } },
    ...j.map((_) => {
      const ae = $e[_.flow_id] || _.flow_id, fe = Vt.has(_.status), _e = cs(_.node_statuses), Le = _.duration_ms && _.duration_ms > 0 ? _.duration_ms : _.finished_at && _.started_at ? (_.finished_at - _.started_at) * 1e3 : fe && _.started_at ? (Date.now() / 1e3 - _.started_at) * 1e3 : 0;
      return e.createElement(
        i,
        { key: _.run_id, size: "small" },
        e.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" } },
          e.createElement(
            p,
            { color: ls[_.status] || "default" },
            _.status
          ),
          e.createElement(F, { strong: !0 }, ae),
          e.createElement(
            h,
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
            ss(_.started_at)
          ),
          Le > 0 ? e.createElement(
            F,
            { type: "secondary", style: { fontSize: 12 } },
            `耗时 ${is(Le)}`
          ) : null,
          _e ? e.createElement(p, { color: "geekblue", style: { fontSize: 11 } }, _e) : null,
          _.error ? e.createElement(
            h,
            { title: _.error },
            e.createElement(F, { type: "danger", style: { fontSize: 12 } }, "（有错误）")
          ) : null,
          e.createElement(
            "div",
            { style: { marginLeft: "auto", display: "flex", gap: 6 } },
            fe ? e.createElement(
              f,
              {
                title: "确认取消运行？",
                onConfirm: () => void he(_.run_id),
                okText: "取消运行",
                cancelText: "保留",
                okButtonProps: { danger: !0 }
              },
              e.createElement(s, {
                size: "small",
                danger: !0,
                loading: ie.has(_.run_id),
                icon: A ? e.createElement(A) : void 0
              }, "取消运行")
            ) : null,
            e.createElement(
              s,
              { size: "small", type: "link", onClick: () => Sn(void 0, _.run_id) },
              "查看详情"
            )
          )
        )
      );
    })
  ), X = e.createElement(
    m,
    null,
    e.createElement(s, {
      icon: M ? e.createElement(M) : void 0,
      onClick: () => void ne(),
      loading: ee
    }, "刷新"),
    ye !== "templates" ? e.createElement(s, {
      type: "primary",
      icon: b ? e.createElement(b) : D ? e.createElement(D) : void 0,
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
    e.createElement(g, {
      items: [
        { key: "templates", label: "工作流模板", children: H },
        { key: "mine", label: `我的工作流 (${I.length})`, children: C },
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
              `·${j.filter((_) => Vt.has(_.status)).length} 活跃`
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
function Br(e, t) {
  var a, l;
  const n = e.coordinatorName || ((a = e.members[0]) == null ? void 0 : a.name), r = e.members.find((s) => s.name === n) || e.members[0];
  if ((r == null ? void 0 : r.bindingMode) !== "temporary" && (r != null && r.agentId) && t.some((s) => s.id === r.agentId))
    return r.agentId;
  if (n && (r == null ? void 0 : r.bindingMode) !== "temporary") {
    const s = Ra(t, n);
    if (s) return s;
  }
  return (r == null ? void 0 : r.bindingMode) === "fixed" ? null : ((l = t[0]) == null ? void 0 : l.id) || null;
}
function Ur() {
  const e = new URLSearchParams(window.location.search).get("section");
  return e === "teams" || e === "workflows" ? e : "experts";
}
function us() {
  var ue, he;
  const e = T().React, { useState: t, useEffect: n, useCallback: r, useMemo: a } = e, {
    Spin: l,
    Empty: s,
    Input: i,
    Button: o,
    message: c,
    Row: u,
    Col: f,
    Tabs: d,
    Modal: m,
    Typography: v
  } = T().antd, {
    ReloadOutlined: g,
    PlusOutlined: p,
    SearchOutlined: h,
    TeamOutlined: E,
    UserOutlined: w
  } = T().antdIcons || {}, { Text: b, Paragraph: x } = v, [M, D] = t([]), [$, A] = t(!0), [F, V] = t(!1), [U, k] = t(null), [S, z] = t(""), [I, W] = t(!1), [j, G] = t(Ur), [O, P] = t(
    null
  ), [ee, oe] = t(""), [B, L] = t(!1), [le, re] = t(!1), [q, me] = t(null), [R, ce] = t([]), ye = r(async () => {
    A(!0);
    try {
      const H = await mn(), C = await Promise.all(
        H.map(async (pe) => {
          try {
            const [X, _, ae] = await Promise.all([
              Gn(pe.id).catch(() => null),
              pn(pe.id).catch(() => []),
              Vn(pe.id).catch(() => [])
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
      D(C), ce(H);
    } catch (H) {
      c.error(H.message || "加载专家列表失败"), D([]);
    } finally {
      A(!1);
    }
  }, []);
  n(() => {
    ye();
  }, [ye]), n(() => {
    const H = () => G(Ur());
    return window.addEventListener("popstate", H), () => window.removeEventListener("popstate", H);
  }, []), n(() => {
    if (q && le) {
      const H = M.find(
        (C) => C.agent.id === q.agent.id
      );
      H && H !== q && me(H);
    }
  }, [M, q, le]);
  const Z = r(
    async (H) => {
      var _;
      const C = H.coordinatorName || ((_ = H.members[0]) == null ? void 0 : _.name), pe = Br(H, R);
      if (!pe) {
        const ae = H.members.find(
          (fe) => fe.name === C
        );
        c.error(
          (ae == null ? void 0 : ae.bindingMode) === "fixed" ? `固定协调者「${C || "协调者"}」当前不可用，请修复绑定后再运行` : "没有可用的 Agent 作为工作流控制器"
        );
        return;
      }
      if (/\{.+?\}/.test(H.taskTemplate)) {
        oe(H.taskTemplate), P(H);
        return;
      }
      await ie(H, pe, H.taskTemplate);
    },
    [R, c]
  ), ie = r(
    async (H, C, pe) => {
      L(!0);
      try {
        const X = pe || H.taskTemplate, _ = H.custom ? `@${H.id}` : H.name, ae = `/ugsci-team ${H.mode} ${_} ${X}`, fe = T();
        fe.setSelectedAgent && fe.setSelectedAgent(C);
        const _e = await Ho(
          C,
          ae,
          H.name
        );
        c.success(
          `OMP 工作流已启动：${H.name}（${H.mode}模式）`
        ), P(null), te(`/chat/${_e}`);
      } catch (X) {
        c.error(X.message || "发起团队任务失败");
      } finally {
        L(!1);
      }
    },
    [c]
  ), te = (H) => {
    window.history.pushState({}, "", H), window.dispatchEvent(new PopStateEvent("popstate"));
  }, be = r((H) => {
    k(H), V(!0);
  }, []), ve = r((H) => {
    me(H), re(!0);
  }, []), $e = r(
    (H) => {
      if (!H.agent.enabled) {
        c.warning(`专家「${H.agent.name}」未启用，请先启用`);
        return;
      }
      try {
        const C = T();
        C.setSelectedAgent && C.setSelectedAgent(H.agent.id);
      } catch (C) {
        console.warn("[ugsci] Failed to set selected agent:", C);
      }
      c.success(`已召唤专家「${H.agent.name}」，正在跳转至对话...`), te("/chat");
    },
    [c]
  ), Se = a(() => {
    if (!S.trim()) return M;
    const H = S.toLowerCase();
    return M.filter(
      (C) => {
        var pe;
        return C.agent.name.toLowerCase().includes(H) || ((pe = C.agent.description) == null ? void 0 : pe.toLowerCase().includes(H)) || C.agent.id.toLowerCase().includes(H) || C.skills.some((X) => X.name.toLowerCase().includes(H));
      }
    );
  }, [M, S]), ne = M.filter((H) => H.agent.enabled).length, we = M.reduce(
    (H, C) => H + C.skills.filter((pe) => pe.enabled !== !1).length,
    0
  ), Ce = M.reduce((H, C) => H + C.mcps.length, 0), K = [
    {
      key: "experts",
      label: e.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        w ? e.createElement(w, { style: { fontSize: 14 } }) : null,
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
            prefix: h ? e.createElement(h) : void 0,
            value: S,
            onChange: (H) => z(H.target.value),
            allowClear: !0,
            style: { flex: "1 1 280px", maxWidth: 400 }
          }),
          e.createElement(
            o,
            {
              type: "primary",
              icon: p ? e.createElement(p) : void 0,
              onClick: () => W(!0),
              style: je
            },
            "创建专家"
          )
        ),
        // Content
        $ ? e.createElement(
          "div",
          { style: { textAlign: "center", padding: 60 } },
          e.createElement(l, { size: "large" })
        ) : Se.length === 0 ? e.createElement(s, {
          description: S ? "未找到匹配的专家" : "暂无专家，点击「创建专家」添加"
        }) : e.createElement(
          u,
          { gutter: [12, 12], align: "stretch" },
          ...Se.map(
            (H) => e.createElement(
              f,
              {
                key: H.agent.id,
                xs: 24,
                sm: 12,
                md: 8,
                lg: 6,
                style: { display: "flex" }
              },
              e.createElement($o, {
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
        E ? e.createElement(E, { style: { fontSize: 14 } }) : null,
        "专家团"
      ),
      children: e.createElement(ns, {
        agents: R,
        onLaunch: Z
      })
    },
    {
      key: "workflows",
      label: e.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        (ue = T().antdIcons) != null && ue.ApartmentOutlined ? e.createElement(T().antdIcons.ApartmentOutlined, {
          style: { fontSize: 14 }
        }) : null,
        "协作工作流"
      ),
      children: e.createElement(ds)
    }
  ];
  return e.createElement(
    "div",
    { style: { padding: 24 } },
    e.createElement(un, {
      title: "专家·协作",
      subtitle: j === "experts" ? `共 ${M.length} 位专家（${ne} 位启用）· ${we} 个技能 · ${Ce} 个 MCP 客户端` : j === "teams" ? "开放式多专家讨论、联合研判与 OMP 动态协作" : "流程化、可观测、可验证的油气与储气库协作流程",
      extra: e.createElement(
        e.Fragment,
        null,
        j === "experts" ? e.createElement(
          o,
          {
            icon: g ? e.createElement(g) : void 0,
            onClick: () => {
              Lt(), ye();
            },
            loading: $
          },
          "刷新"
        ) : null
      )
    }),
    e.createElement(d, {
      items: K,
      activeKey: j,
      onChange: (H) => {
        G(H);
        const C = new URL(window.location.href);
        H === "experts" ? C.searchParams.delete("section") : C.searchParams.set("section", H), window.history.pushState({}, "", `${C.pathname}${C.search}`);
      }
    }),
    // Drawer
    e.createElement(Po, {
      expert: U,
      open: F,
      onClose: () => V(!1),
      onRefresh: () => ye()
    }),
    // Template Modal
    e.createElement(Oo, {
      open: I,
      onClose: () => W(!1),
      onCreated: () => ye()
    }),
    // Config Modal (gear icon)
    e.createElement(Ao, {
      expert: q,
      open: le,
      onClose: () => re(!1),
      onRefresh: () => ye()
    }),
    // Team Launch Modal (for filling placeholders)
    O ? e.createElement(
      m,
      {
        open: !0,
        title: e.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 8 } },
          e.createElement(qn, {
            members: O.members.map((H) => H.name),
            size: 28
          }),
          e.createElement(
            "span",
            null,
            `发起团队任务 - ${O.name}`
          )
        ),
        onCancel: () => P(null),
        onOk: () => {
          const H = Br(
            O,
            R
          );
          if (!H) {
            c.error("固定协调者不可用或没有可用的控制器 Agent");
            return;
          }
          const C = ee.trim() || O.taskTemplate;
          ie(O, H, C);
        },
        confirmLoading: B,
        okText: "发起任务",
        width: 600
      },
      e.createElement(
        "div",
        null,
        e.createElement(
          b,
          {
            type: "secondary",
            style: { fontSize: 12, display: "block", marginBottom: 8 }
          },
          "任务内容（请替换 {参数名} 等占位符后发起）："
        ),
        e.createElement(i.TextArea, {
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
          b,
          { style: { fontSize: 12, color: "#0958d9" } },
          `协调者: ${O.coordinatorName || ((he = O.members[0]) == null ? void 0 : he.name) || "—"} · 成员: ${O.members.map((H) => H.name).join("、")}`
        )
      )
    ) : null
  );
}
function ms({
  agentId: e,
  agentName: t,
  refreshKey: n = 0,
  onNavigate: r
}) {
  const a = T().React, { useState: l, useEffect: s, useCallback: i } = a, {
    Spin: o,
    Empty: c,
    Button: u,
    Row: f,
    Col: d,
    Card: m,
    Tag: v,
    Checkbox: g,
    Modal: p,
    Typography: h,
    Drawer: E,
    Descriptions: w,
    message: b
  } = T().antd, {
    ReloadOutlined: x,
    ThunderboltOutlined: M,
    SettingOutlined: D,
    CheckSquareOutlined: $,
    EyeOutlined: A,
    EyeInvisibleOutlined: F,
    DeleteOutlined: V,
    CloseOutlined: U
  } = T().antdIcons || {}, { Text: k, Paragraph: S } = h, [z, I] = l([]), [W, j] = l(!0), [G, O] = l(!1), [P, ee] = l(null), [oe, B] = l(!1), [L, le] = l(
    /* @__PURE__ */ new Set()
  ), [re, q] = l(!1), [me, R] = l(null), [ce, ye] = l(!1), Z = i(async () => {
    if (e) {
      j(!0);
      try {
        const K = await pn(e);
        I(K);
      } catch (K) {
        b.error(K.message || "加载技能失败"), I([]);
      } finally {
        j(!1);
      }
    }
  }, [e]);
  s(() => {
    Z();
  }, [Z, n]);
  const ie = (K) => {
    le((ue) => {
      const he = new Set(ue);
      return he.has(K) ? he.delete(K) : he.add(K), he;
    });
  }, te = () => le(/* @__PURE__ */ new Set()), be = () => le(new Set(z.map((K) => K.name))), ve = () => {
    oe ? (te(), B(!1)) : B(!0);
  }, $e = async () => {
    const K = Array.from(L);
    if (K.length !== 0) {
      q(!0);
      try {
        const { results: ue } = await lo(e, K), he = Object.entries(ue).filter(
          ([, C]) => C.success === !1
        ), H = K.length - he.length;
        he.length > 0 ? b.warning(
          `批量启用完成：成功 ${H} 个，失败 ${he.length} 个`
        ) : b.success(`成功启用 ${K.length} 个技能`), te(), await Z();
      } catch (ue) {
        b.error(ue.message || "批量启用失败");
      } finally {
        q(!1);
      }
    }
  }, Se = async () => {
    const K = Array.from(L);
    if (K.length !== 0) {
      q(!0);
      try {
        const { results: ue } = await oo(e, K), he = Object.entries(ue).filter(
          ([, C]) => C.success === !1
        ), H = K.length - he.length;
        he.length > 0 ? b.warning(
          `批量停用完成：成功 ${H} 个，失败 ${he.length} 个`
        ) : b.success(`成功停用 ${K.length} 个技能`), te(), await Z();
      } catch (ue) {
        b.error(ue.message || "批量停用失败");
      } finally {
        q(!1);
      }
    }
  }, ne = () => {
    const K = Array.from(L);
    K.length !== 0 && p.confirm({
      title: `确认删除 ${K.length} 个技能？`,
      content: "删除后技能将从当前专家工作区移除，此操作不可撤销。技能池中的原始技能不受影响。",
      okText: "确认删除",
      cancelText: "取消",
      okButtonProps: { danger: !0 },
      onOk: async () => {
        q(!0);
        try {
          const { results: ue } = await so(e, K), he = Object.entries(ue).filter(
            ([, C]) => C.success === !1
          ), H = K.length - he.length;
          he.length > 0 ? b.warning(
            `批量删除完成：成功 ${H} 个，失败 ${he.length} 个`
          ) : b.success(`成功删除 ${K.length} 个技能`), te(), await Z();
        } catch (ue) {
          b.error(ue.message || "批量删除失败");
        } finally {
          q(!1);
        }
      }
    });
  }, we = async (K) => {
    ye(!0);
    try {
      K.enabled === !1 ? (await xa(e, K.name), b.success(`已启用技能「${K.name}」`)) : (await Ca(e, K.name), b.success(`已禁用技能「${K.name}」`)), await Z();
    } catch (ue) {
      b.error(ue.message || "操作失败");
    } finally {
      ye(!1);
    }
  }, Ce = (K) => {
    p.confirm({
      title: `确认删除技能「${K.name}」？`,
      content: "删除后技能将从当前专家工作区移除，此操作不可撤销。技能池中的原始技能不受影响。",
      okText: "确认删除",
      cancelText: "取消",
      okButtonProps: { danger: !0 },
      onOk: async () => {
        ye(!0);
        try {
          await Wn(e, K.name), b.success(`已删除技能「${K.name}」`), await Z();
        } catch (ue) {
          b.error(ue.message || "删除失败");
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
        k,
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
            u,
            { size: "small", onClick: be },
            "全选"
          ),
          a.createElement(
            u,
            {
              size: "small",
              icon: U ? a.createElement(U) : void 0,
              onClick: te
            },
            "取消选择"
          ),
          a.createElement(
            u,
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
            u,
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
            u,
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
            u,
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
            u,
            {
              size: "small",
              icon: $ ? a.createElement($) : void 0,
              onClick: ve,
              disabled: z.length === 0
            },
            "批量管理"
          ),
          a.createElement(
            u,
            {
              icon: x ? a.createElement(x) : void 0,
              onClick: () => {
                Lt(), Z();
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
      a.createElement(o, { size: "large" })
    ) : z.length === 0 ? a.createElement(c, {
      description: "当前智能体未加载任何技能"
    }) : a.createElement(
      f,
      { gutter: [12, 12] },
      ...z.map(
        (K) => a.createElement(
          d,
          { key: K.name, xs: 24, sm: 12, md: 8, lg: 6 },
          a.createElement(
            m,
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
                oe ? ie(K.name) : (ee(K), O(!0));
              },
              onMouseEnter: () => {
                oe || R(K.name);
              },
              onMouseLeave: () => R(null)
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
                  ue.stopPropagation(), ie(K.name);
                }
              },
              a.createElement(g, {
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
                K.name
              ),
              K.enabled === !1 ? a.createElement(
                v,
                { color: "default", style: { fontSize: 10 } },
                "已禁用"
              ) : a.createElement(
                v,
                { color: "green", style: { fontSize: 10 } },
                "已启用"
              )
            ),
            K.description ? a.createElement(
              S,
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
                v,
                { style: { fontSize: 10 } },
                `v${K.version_text}`
              ) : null,
              ...(K.tags || []).slice(0, 3).map(
                (ue, he) => a.createElement(
                  v,
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
                u,
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
                u,
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
      E,
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
        onClose: () => O(!1),
        width: 520,
        extra: a.createElement(
          u,
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
        w,
        { column: 1, bordered: !0, size: "small" },
        a.createElement(
          w.Item,
          { label: "技能名称" },
          P.name
        ),
        a.createElement(
          w.Item,
          { label: "描述" },
          P.description || "-"
        ),
        P.version_text ? a.createElement(
          w.Item,
          { label: "版本" },
          P.version_text
        ) : null,
        a.createElement(
          w.Item,
          { label: "来源" },
          P.source || "-"
        ),
        a.createElement(
          w.Item,
          { label: "状态" },
          P.enabled === !1 ? "已禁用" : "已启用"
        ),
        P.installed_from ? a.createElement(
          w.Item,
          { label: "安装来源" },
          P.installed_from
        ) : null
      ),
      // Tags
      P.tags && P.tags.length > 0 ? a.createElement(
        "div",
        { style: { marginTop: 16 } },
        a.createElement(
          k,
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
            (K, ue) => a.createElement(v, { key: ue, color: "blue" }, K)
          )
        )
      ) : null,
      // Skill content preview
      P.content ? a.createElement(
        "div",
        { style: { marginTop: 16 } },
        a.createElement(
          k,
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
function ps({
  poolSkills: e,
  workspaceSkills: t,
  agents: n,
  loading: r,
  onReload: a,
  onSkillInstalled: l,
  agentId: s,
  agentName: i
}) {
  const o = T().React, { useState: c, useMemo: u, useCallback: f, useEffect: d, useRef: m } = o, {
    Spin: v,
    Empty: g,
    Input: p,
    Button: h,
    Row: E,
    Col: w,
    Card: b,
    Tag: x,
    Typography: M,
    Drawer: D,
    Descriptions: $,
    List: A,
    Modal: F,
    message: V
  } = T().antd, {
    ReloadOutlined: U,
    SearchOutlined: k,
    DownloadOutlined: S,
    ThunderboltOutlined: z,
    DeleteOutlined: I,
    PlusOutlined: W
  } = T().antdIcons || {}, { Text: j, Paragraph: G } = M, [O, P] = c(""), [ee, oe] = c(!1), [B, L] = c(null), [le, re] = c([]), [q, me] = c(!1), [R, ce] = c(24), [ye, Z] = c(null), [ie, te] = c(!1), be = m(0), ve = m(null), $e = u(
    () => {
      var X;
      return new Set(
        ((X = t.find((_) => _.agent_id === s)) == null ? void 0 : X.skill_names) || []
      );
    },
    [t, s]
  ), Se = u(() => {
    if (!O.trim()) return e;
    const X = O.toLowerCase();
    return e.filter(
      (_) => {
        var ae, fe;
        return _.name.toLowerCase().includes(X) || ((ae = _.description) == null ? void 0 : ae.toLowerCase().includes(X)) || ((fe = _.tags) == null ? void 0 : fe.some((_e) => _e.toLowerCase().includes(X)));
      }
    );
  }, [e, O]), ne = u(
    () => Se.slice(0, R),
    [Se, R]
  );
  d(() => {
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
          _e.some((Le) => Le.isIntersecting) && _();
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
  const we = f((X) => {
    P(X), ce(24);
  }, []), Ce = f(() => {
    const X = be.current;
    requestAnimationFrame(() => {
      window.scrollTo({ top: X, behavior: "auto" }), document.scrollingElement && (document.scrollingElement.scrollTop = X);
    });
  }, []), K = f(async () => {
    var X;
    be.current = ((X = document.scrollingElement) == null ? void 0 : X.scrollTop) ?? window.scrollY ?? 0;
    try {
      await a();
    } finally {
      Ce();
    }
  }, [a, Ce]), ue = f(
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
  ), he = f(
    async (X) => {
      if (L(X), re(ue(X.name)), oe(!0), !X.content) {
        me(!0);
        try {
          const _ = await Ql(X.name);
          L({ ...X, content: _ });
        } catch {
        } finally {
          me(!1);
        }
      }
    },
    [ue]
  );
  d(() => {
    B && re(ue(B.name));
  }, [B, ue, t]);
  const H = async (X) => {
    te(!0);
    try {
      await Hn(s, X.name), V.success(
        `已将技能「${X.name}」加载到当前专家「${i}」`
      ), l(X);
    } catch (_) {
      V.error(_.message || "加载技能失败");
    } finally {
      te(!1);
    }
  }, C = (X) => {
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
          await co(X.name), V.success(`已从技能池删除「${X.name}」`), await K();
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
      o.createElement(p, {
        placeholder: "搜索技能名称、描述或标签...",
        prefix: k ? o.createElement(k) : void 0,
        value: O,
        onChange: (X) => we(X.target.value),
        allowClear: !0,
        style: { maxWidth: 400 }
      }),
      o.createElement(
        "div",
        { style: { display: "flex", gap: 8 } },
        o.createElement(
          h,
          {
            icon: U ? o.createElement(U) : void 0,
            onClick: K,
            loading: r,
            size: "small"
          },
          "刷新"
        ),
        o.createElement(
          h,
          {
            type: "primary",
            icon: S ? o.createElement(S) : void 0,
            onClick: () => pe("/skill-pool"),
            size: "small",
            style: je
          },
          "管理技能池"
        )
      )
    ),
    r ? o.createElement(
      "div",
      { style: { textAlign: "center", padding: 60 } },
      o.createElement(v, { size: "large" })
    ) : Se.length === 0 ? o.createElement(g, {
      description: O ? "未找到匹配的技能" : "技能池为空"
    }) : o.createElement(
      o.Fragment,
      null,
      o.createElement(
        E,
        { gutter: [12, 12] },
        ...ne.map(
          (X) => o.createElement(
            w,
            { key: X.name, xs: 24, sm: 12, md: 8, lg: 6 },
            o.createElement(
              b,
              {
                hoverable: !0,
                size: "small",
                style: { cursor: "pointer", height: "100%" },
                onClick: () => he(X),
                onMouseEnter: () => Z(X.name),
                onMouseLeave: () => Z(null)
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
                X.emoji ? o.createElement(
                  "span",
                  { style: { fontSize: 18 } },
                  X.emoji
                ) : o.createElement(
                  "span",
                  { style: { fontSize: 18 } },
                  "⚡"
                ),
                o.createElement(
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
                X.protected ? o.createElement(
                  x,
                  { color: "gold", style: { fontSize: 10 } },
                  "内置"
                ) : null
              ),
              X.description ? o.createElement(
                G,
                {
                  type: "secondary",
                  style: { fontSize: 11, margin: 0, lineHeight: 1.4 },
                  ellipsis: { rows: 2 }
                },
                X.description
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
                X.version_text ? o.createElement(
                  x,
                  { style: { fontSize: 10 } },
                  `v${X.version_text}`
                ) : null,
                ...(X.tags || []).slice(0, 3).map(
                  (_, ae) => o.createElement(
                    x,
                    { key: ae, color: "cyan", style: { fontSize: 10 } },
                    _
                  )
                )
              ),
              // Hover action footer
              ye === X.name ? o.createElement(
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
                  h,
                  {
                    size: "small",
                    type: "primary",
                    icon: W ? o.createElement(W) : void 0,
                    disabled: ie || $e.has(X.name),
                    onClick: (_) => {
                      _.stopPropagation(), H(X);
                    }
                  },
                  $e.has(X.name) ? "已加载" : "加载到当前Agent"
                ),
                o.createElement(
                  h,
                  {
                    size: "small",
                    danger: !0,
                    icon: I ? o.createElement(I) : void 0,
                    disabled: ie || X.protected,
                    onClick: (_) => {
                      _.stopPropagation(), C(X);
                    }
                  },
                  "删除"
                )
              ) : null
            )
          )
        ),
        // Infinite-scroll sentinel
        ne.length < Se.length ? o.createElement(
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
          o.createElement(
            j,
            { type: "secondary", style: { fontSize: 12 } },
            `继续下滑自动加载 · 还剩 ${Se.length - ne.length} 个`
          )
        ) : null
      )
    ),
    // Skill detail drawer
    B ? o.createElement(
      D,
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
        open: ee,
        onClose: () => oe(!1),
        width: 520,
        extra: o.createElement(
          h,
          {
            type: "primary",
            size: "small",
            icon: z ? o.createElement(z) : void 0,
            onClick: () => pe("/skills")
          },
          "管理技能"
        )
      },
      o.createElement(
        $,
        { column: 1, bordered: !0, size: "small" },
        o.createElement(
          $.Item,
          { label: "技能名称" },
          B.name
        ),
        o.createElement(
          $.Item,
          { label: "描述" },
          B.description || "-"
        ),
        B.version_text ? o.createElement(
          $.Item,
          { label: "版本" },
          B.version_text
        ) : null,
        o.createElement(
          $.Item,
          { label: "来源" },
          B.source || "-"
        ),
        o.createElement(
          $.Item,
          { label: "受保护" },
          B.protected ? "是（内置）" : "否"
        ),
        B.sync_status ? o.createElement(
          $.Item,
          { label: "同步状态" },
          B.sync_status
        ) : null,
        B.installed_from ? o.createElement(
          $.Item,
          { label: "安装来源" },
          B.installed_from
        ) : null
      ),
      // Tags
      B.tags && B.tags.length > 0 ? o.createElement(
        "div",
        { style: { marginTop: 16 } },
        o.createElement(
          j,
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
            (X, _) => o.createElement(x, { key: _, color: "cyan" }, X)
          )
        )
      ) : null,
      // Installed agents
      o.createElement(
        "div",
        { style: { marginTop: 16 } },
        o.createElement(
          j,
          { strong: !0, style: { display: "block", marginBottom: 8 } },
          `已安装此技能的专家 (${le.length})`
        ),
        le.length > 0 ? o.createElement(A, {
          size: "small",
          dataSource: le,
          renderItem: (X) => o.createElement(
            A.Item,
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
              o.createElement(Ke, { name: X, size: 20 }),
              o.createElement(
                j,
                { style: { fontSize: 13 } },
                X
              )
            )
          )
        }) : o.createElement(
          j,
          { type: "secondary", style: { fontSize: 12 } },
          "暂无专家安装此技能"
        )
      ),
      // Skill content preview (lazy-loaded)
      q ? o.createElement(
        "div",
        { style: { marginTop: 16, textAlign: "center" } },
        o.createElement(v, { size: "small" })
      ) : B.content ? o.createElement(
        "div",
        { style: { marginTop: 16 } },
        o.createElement(
          j,
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
function fs({
  embedded: e = !1
} = {}) {
  const t = T().React, { useState: n, useEffect: r, useCallback: a, useMemo: l } = t, { Tabs: s, message: i } = T().antd, { ThunderboltOutlined: o, AppstoreOutlined: c } = T().antdIcons || {}, f = T().useSelectedAgent, d = f ? f() : null, m = (d == null ? void 0 : d.id) || "default";
  r(() => {
    Dn();
  }, [m]);
  const [v, g] = n([]), [p, h] = n([]), [E, w] = n([]), [b, x] = n(!0), [M, D] = n("agent-skills"), [$, A] = n(0), F = a(async () => {
    x(!0);
    try {
      const [I, W, j] = await Promise.all([
        fn(!0),
        mn(),
        Zl()
      ]);
      h(I), g(W), w(j);
    } catch (I) {
      i.error(I.message || "加载技能列表失败"), h([]);
    } finally {
      x(!1);
    }
  }, []);
  r(() => {
    F();
  }, [F]);
  const V = l(() => {
    const I = v.find((W) => W.id === m);
    return (I == null ? void 0 : I.name) || m;
  }, [v, m]), U = a(
    (I) => {
      w(
        (W) => W.some((j) => j.agent_id === m) ? W.map((j) => j.agent_id !== m || j.skill_names.includes(I.name) ? j : {
          ...j,
          skill_names: [...j.skill_names, I.name]
        }) : [
          ...W,
          {
            agent_id: m,
            agent_name: V,
            skill_names: [I.name]
          }
        ]
      ), A((W) => W + 1);
    },
    [m, V]
  ), k = (I) => {
    window.history.pushState({}, "", I), window.dispatchEvent(new PopStateEvent("popstate"));
  }, S = [
    {
      key: "agent-skills",
      label: t.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        o ? t.createElement(o, { style: { fontSize: 14 } }) : null,
        "当前专家"
      ),
      children: t.createElement(ms, {
        agentId: m,
        agentName: V,
        refreshKey: $,
        onNavigate: k
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
      children: t.createElement(ps, {
        poolSkills: p,
        workspaceSkills: E,
        agents: v,
        loading: b,
        onReload: F,
        onSkillInstalled: U,
        agentId: m,
        agentName: V
      })
    }
  ], z = t.createElement(s, {
    items: S,
    activeKey: M,
    onChange: (I) => D(I)
  });
  return e ? z : t.createElement(
    "div",
    { style: { padding: 24 } },
    t.createElement(un, {
      title: "技能",
      subtitle: `技能池共 ${p.length} 个技能 · 当前智能体：${V}`
    }),
    z
  );
}
const zn = {
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
  return dn(`/ugsci/engines/icon/${encodeURIComponent(e)}`);
}
async function gs() {
  return de("/ugsci/engines/list");
}
async function ys(e) {
  return de("/ugsci/engines/", {
    method: "POST",
    body: JSON.stringify(e)
  });
}
async function hs(e, t) {
  return de(`/ugsci/engines/${encodeURIComponent(e)}`, {
    method: "PUT",
    body: JSON.stringify(t)
  });
}
async function Es(e) {
  return de(
    `/ugsci/engines/${encodeURIComponent(e)}`,
    { method: "DELETE" }
  );
}
async function bs() {
  return de("/ugsci/engines/detect/refresh", {
    method: "POST"
  });
}
function vs({
  engine: e,
  onClick: t
}) {
  const n = T().React, { Card: r, Tag: a, Typography: l } = T().antd, { Text: s } = l, i = e.status === "detected", o = Ba[e.category] || "📦", u = Ua.has(e.id) ? n.createElement("img", {
    src: ja(e.id),
    alt: e.name,
    style: { width: 24, height: 24, objectFit: "contain" }
  }) : n.createElement("span", { style: { fontSize: 20 } }, o);
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
            s,
            { strong: !0, style: { fontSize: 14 } },
            e.name
          ),
          n.createElement("br"),
          n.createElement(
            s,
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
        s,
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
        (f) => n.createElement(
          a,
          { key: f, color: "cyan", style: { fontSize: 10 } },
          f
        )
      )
    )
  );
}
function ws() {
  const e = T().React, { useState: t, useEffect: n, useCallback: r, useMemo: a } = e, {
    Spin: l,
    Empty: s,
    Button: i,
    message: o,
    Row: c,
    Col: u,
    Drawer: f,
    Descriptions: d,
    Tag: m,
    Typography: v,
    Modal: g,
    Input: p,
    Select: h,
    Popconfirm: E,
    Space: w
  } = T().antd, {
    ReloadOutlined: b,
    SearchOutlined: x,
    PlusOutlined: M,
    EditOutlined: D,
    DeleteOutlined: $,
    CopyOutlined: A,
    ExperimentOutlined: F
  } = T().antdIcons || {}, { Text: V, Paragraph: U } = v, [k, S] = t([]), [z, I] = t(!0), [W, j] = t(""), [G, O] = t(!1), [P, ee] = t(null), [oe, B] = t(!1), [L, le] = t(null), [re, q] = t({}), [me, R] = t(!1), ce = r(async () => {
    I(!0);
    try {
      const ne = await gs();
      S(ne.engines || []);
    } catch (ne) {
      o.error(ne.message || "加载引擎列表失败"), S([]);
    } finally {
      I(!1);
    }
  }, []);
  n(() => {
    ce();
  }, [ce]);
  const ye = a(() => {
    if (!W.trim()) return k;
    const ne = W.toLowerCase();
    return k.filter(
      (we) => {
        var Ce;
        return we.name.toLowerCase().includes(ne) || we.vendor.toLowerCase().includes(ne) || we.category.toLowerCase().includes(ne) || ((Ce = we.description) == null ? void 0 : Ce.toLowerCase().includes(ne));
      }
    );
  }, [k, W]);
  k.filter((ne) => ne.status === "detected").length;
  const Z = r((ne) => {
    navigator.clipboard.writeText(ne).then(() => o.success("路径已复制")).catch(() => o.error("复制失败"));
  }, []), ie = r(() => {
    le(null), q({
      name: "",
      vendor: "",
      version: "",
      executable_path: "",
      category: "",
      description: "",
      invocation_hint: ""
    }), B(!0);
  }, []), te = r((ne) => {
    le(ne), q({ ...ne }), B(!0), O(!1);
  }, []), be = r(async () => {
    var ne;
    if (!((ne = re.name) != null && ne.trim())) {
      o.warning("请输入引擎名称");
      return;
    }
    R(!0);
    try {
      L ? (await hs(L.id, re), o.success("引擎已更新")) : (await ys(re), o.success("引擎已添加")), B(!1), ce();
    } catch (we) {
      o.error(we.message || "保存失败");
    } finally {
      R(!1);
    }
  }, [re, L, ce]), ve = r(
    async (ne) => {
      try {
        await Es(ne), o.success("引擎已删除"), O(!1), ce();
      } catch (we) {
        o.error(we.message || "删除失败");
      }
    },
    [ce]
  ), $e = r(async () => {
    I(!0);
    try {
      const ne = await bs();
      S(ne.engines || []), o.success("自动检测完成");
    } catch (ne) {
      o.error(ne.message || "检测失败");
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
        Ce != null && Ce.select ? e.createElement(h, {
          value: K || void 0,
          onChange: (ue) => q((he) => ({ ...he, [we]: ue })),
          style: { width: "100%" },
          options: Ce.select.options,
          allowClear: !0,
          placeholder: `选择${ne}`
        }) : Ce != null && Ce.textarea ? e.createElement(p.TextArea, {
          value: K,
          onChange: (ue) => q((he) => ({ ...he, [we]: ue.target.value })),
          rows: 3,
          placeholder: `输入${ne}`
        }) : e.createElement(p, {
          value: K,
          onChange: (ue) => q((he) => ({ ...he, [we]: ue.target.value })),
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
      e.createElement(p, {
        placeholder: "搜索引擎名称、厂商...",
        prefix: x ? e.createElement(x) : void 0,
        value: W,
        onChange: (ne) => j(ne.target.value),
        allowClear: !0,
        style: { maxWidth: 280 }
      }),
      e.createElement(
        i,
        {
          icon: b ? e.createElement(b) : void 0,
          onClick: $e,
          loading: z
        },
        "自动检测"
      ),
      e.createElement(
        i,
        {
          type: "primary",
          icon: M ? e.createElement(M) : void 0,
          onClick: ie,
          style: je
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
    ) : ye.length === 0 ? e.createElement(s, {
      description: W ? "无匹配引擎" : "暂无引擎，点击「添加引擎」开始"
    }) : e.createElement(
      c,
      { gutter: [12, 12], align: "stretch" },
      ...ye.map(
        (ne) => e.createElement(
          u,
          {
            key: ne.id,
            xs: 24,
            sm: 12,
            md: 8,
            lg: 6,
            style: { display: "flex" }
          },
          e.createElement(vs, {
            engine: ne,
            onClick: () => {
              ee(ne), O(!0);
            }
          })
        )
      )
    ),
    // Detail drawer
    P ? e.createElement(
      f,
      {
        title: e.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 8 } },
          e.createElement(
            "span",
            { style: { display: "flex", alignItems: "center" } },
            Ua.has(P.id) ? e.createElement("img", {
              src: ja(P.id),
              alt: P.name,
              style: { width: 20, height: 20, objectFit: "contain" }
            }) : e.createElement(
              "span",
              { style: { fontSize: 18 } },
              Ba[P.category] || "📦"
            )
          ),
          e.createElement("span", null, P.name)
        ),
        open: G,
        onClose: () => O(!1),
        width: 520,
        extra: e.createElement(
          w,
          null,
          e.createElement(
            i,
            {
              size: "small",
              icon: D ? e.createElement(D) : void 0,
              onClick: () => te(P)
            },
            "编辑"
          ),
          P.is_default ? null : e.createElement(
            E,
            {
              title: "确认删除此引擎？",
              description: P.name,
              onConfirm: () => ve(P.id),
              okText: "删除",
              cancelText: "取消",
              okButtonProps: { danger: !0 }
            },
            e.createElement(
              i,
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
        d,
        { column: 1, bordered: !0, size: "small" },
        e.createElement(
          d.Item,
          { label: "引擎名称" },
          P.name
        ),
        e.createElement(
          d.Item,
          { label: "厂商" },
          P.vendor || "—"
        ),
        e.createElement(
          d.Item,
          { label: "分类" },
          P.category ? zn[P.category] || P.category : "—"
        ),
        e.createElement(
          d.Item,
          { label: "状态" },
          e.createElement(
            m,
            {
              color: P.status === "detected" ? "success" : P.status === "not_found" ? "error" : "default"
            },
            P.status === "detected" ? "✅ 已检测" : P.status === "not_found" ? "❌ 路径无效" : "🔧 待配置"
          )
        ),
        e.createElement(
          d.Item,
          { label: "版本" },
          P.version || "—"
        ),
        P.executable_path ? e.createElement(
          d.Item,
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
              i,
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
          d.Item,
          { label: "安装目录" },
          e.createElement(
            "code",
            { style: { fontSize: 12, wordBreak: "break-all" } },
            P.install_dir
          )
        ) : null,
        // Display detected modules with paths
        P.modules && P.modules.length > 0 ? e.createElement(
          d.Item,
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
                  m,
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
          d.Item,
          { label: "许可证服务器" },
          P.license_server
        ) : null,
        e.createElement(
          d.Item,
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
          m,
          { color: "blue" },
          "默认引擎"
        ) : P.is_custom ? e.createElement(
          m,
          { color: "purple" },
          "自定义引擎"
        ) : null
      )
    ) : null,
    // Add/Edit modal
    e.createElement(
      g,
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
            options: Object.entries(zn).map(([ne, we]) => ({
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
async function Ss(e = !1) {
  const t = await de(
    "/ugsci/domain-engines/list",
    e ? { bypassCache: !0 } : void 0
  );
  return (t == null ? void 0 : t.engines) || [];
}
function xs(e = !1) {
  return de(
    "/ugsci/domain-engines/neqsim/runtime",
    e ? { bypassCache: !0 } : void 0
  );
}
function ks() {
  return de("/ugsci/domain-engines/neqsim/install", {
    method: "POST"
  });
}
function Cs(e) {
  return de(
    `/ugsci/domain-engines/neqsim/install/${encodeURIComponent(e)}`,
    { bypassCache: !0 }
  );
}
async function Ts(e, t = !1) {
  const n = await de("/tools", {
    headers: { "X-Agent-Id": e },
    ...t ? { bypassCache: !0 } : {}
  }) || [];
  return new Map(n.map((r) => [r.name, r]));
}
async function _s(e, t = !1) {
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
    const s = l.key;
    if (!l.enabled) {
      n.set(s, { key: s, enabled: !1, toolCount: 0, error: null });
      continue;
    }
    try {
      const i = await de(
        `/mcp/tools/${encodeURIComponent(s)}`,
        r
      ) || [];
      n.set(s, {
        key: s,
        enabled: !0,
        toolCount: i.filter((o) => o.enabled).length,
        error: null
      });
    } catch (i) {
      n.set(s, {
        key: s,
        enabled: !0,
        toolCount: 0,
        error: i instanceof Error ? i.message : "Tool query failed"
      });
    }
  }
  return n;
}
function jr(e) {
  return e ? e.overall === "available" ? "available" : e.overall === "unavailable" ? "unavailable" : "unknown" : "unknown";
}
function Nr(e) {
  return e ? e.enabled ? e.error ? "error" : e.toolCount > 0 ? "available" : "error" : "unconfigured" : "unavailable";
}
function Is(e, t = null, n = /* @__PURE__ */ new Map()) {
  const r = e.engine, a = e.dependency_status;
  let l, s, i;
  if (r.provider.kind === "driver")
    a.overall === "unavailable" ? l = "needs_install" : l = Nr(t), s = (t == null ? void 0 : t.toolCount) ?? 0, i = (t == null ? void 0 : t.key) ?? r.provider.id;
  else if (r.source === "builtin") {
    const o = jr(a), c = r.operations.flatMap((d) => d.tool_names), u = c.filter((d) => n.has(d)), f = u.filter(
      (d) => {
        var m;
        return (m = n.get(d)) == null ? void 0 : m.enabled;
      }
    );
    o !== "available" ? l = o : u.length !== c.length ? l = "error" : f.length === 0 ? l = "unconfigured" : l = "available", s = f.length, i = null;
  } else r.source === "mcp" ? (l = Nr(t), s = (t == null ? void 0 : t.toolCount) ?? 0, i = (t == null ? void 0 : t.key) ?? r.provider.id) : (l = jr(a), s = 0, i = null);
  return {
    definition: r,
    dependencyStatus: a,
    checkedAt: e.checked_at,
    effectiveStatus: l,
    discoveredToolCount: s,
    mcpProviderKey: i
  };
}
function As(e) {
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
}, zs = {
  geology_well_logging: "📡",
  production_engineering: "⚙️",
  fluid_thermodynamics: "🧪",
  scientific_computing: "🧮",
  data_modeling: "📊"
}, $s = {
  builtin: "内置",
  mcp: "MCP",
  library: "计算库"
}, Ps = {
  deterministic: "确定性",
  stochastic: "随机/概率",
  external: "外部 Provider",
  visualization: "可视化"
}, Os = {
  deterministic: "green",
  stochastic: "purple",
  external: "blue",
  visualization: "cyan"
};
function Rs({
  view: e,
  onClick: t
}) {
  const n = T().React, { Card: r, Tag: a, Typography: l } = T().antd, { Text: s } = l, i = e.definition, o = zs[i.domain] || "📦", c = e.effectiveStatus, u = i.operations.length, f = e.discoveredToolCount;
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
        n.createElement("span", { style: { fontSize: 20 } }, o),
        n.createElement(
          "div",
          null,
          n.createElement(
            s,
            { strong: !0, style: { fontSize: 14 } },
            i.name
          ),
          n.createElement("br"),
          n.createElement(
            s,
            { type: "secondary", style: { fontSize: 11 } },
            i.provider.kind === "driver" ? "内置 · MCP" : $s[i.source] || i.source
          )
        )
      ),
      n.createElement(
        a,
        { color: Pn[c] || "default", style: { fontSize: 11 } },
        $n[c] || c
      )
    ),
    n.createElement(
      "div",
      { style: { flex: 1, minHeight: 32 } },
      n.createElement(
        s,
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
          color: Os[i.execution_class] || "default",
          style: { fontSize: 11 }
        },
        Ps[i.execution_class] || i.execution_class
      ),
      f > 0 ? n.createElement(
        a,
        { color: "blue", style: { fontSize: 11 } },
        `${f} 工具`
      ) : null,
      ...(i.tags || []).map(
        (d) => n.createElement(
          a,
          { key: d, color: "cyan", style: { fontSize: 10 } },
          d
        )
      )
    )
  );
}
function Ms({
  view: e,
  open: t,
  onClose: n,
  onNavigateToMcp: r,
  onNavigateToTools: a,
  onNavigateToSkills: l,
  onInstallNeqsim: s,
  neqsimInstallState: i
}) {
  const o = T().React, { Drawer: c, Descriptions: u, Tag: f, Typography: d, Button: m, Space: v, Divider: g } = T().antd, { Text: p, Paragraph: h } = d;
  if (!e) return null;
  const E = e.definition, w = e.dependencyStatus;
  return o.createElement(
    c,
    {
      title: o.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 8 } },
        o.createElement("span", null, E.name),
        o.createElement(
          f,
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
    o.createElement(
      u,
      { column: 1, bordered: !0, size: "small" },
      o.createElement(
        u.Item,
        { label: "领域" },
        E.domain
      ),
      o.createElement(
        u.Item,
        { label: "来源" },
        E.provider.kind === "driver" ? "内置能力 · MCP Driver" : E.source === "builtin" ? "内置工具" : E.source === "mcp" ? "MCP 服务" : "科学计算库 / 技能"
      ),
      o.createElement(
        u.Item,
        { label: "实现" },
        `${E.provider.kind}:${E.provider.id}`
      ),
      o.createElement(
        u.Item,
        { label: "计算类别" },
        E.execution_class === "deterministic" ? "确定性计算" : E.execution_class === "stochastic" ? "随机/概率计算" : E.execution_class === "external" ? "外部 Provider" : "可视化"
      ),
      o.createElement(
        u.Item,
        { label: "内核版本" },
        E.engine_version
      ),
      o.createElement(
        u.Item,
        { label: "描述" },
        E.description
      ),
      o.createElement(
        u.Item,
        { label: "检测时间" },
        e.checkedAt
      )
    ),
    // Operations
    o.createElement(
      "div",
      { style: { marginTop: 16, marginBottom: 8 } },
      o.createElement(p, { strong: !0 }, "领域操作")
    ),
    ...E.operations.map(
      (b) => o.createElement(
        "div",
        {
          key: b.id,
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
          o.createElement(p, { strong: !0, style: { fontSize: 13 } }, b.name),
          o.createElement(
            p,
            { type: "secondary", style: { fontSize: 11, marginLeft: 8 } },
            b.id
          )
        ),
        o.createElement(
          p,
          { type: "secondary", style: { fontSize: 12 } },
          b.description
        ),
        b.tool_names.length > 0 ? o.createElement(
          "div",
          { style: { marginTop: 4, display: "flex", gap: 4, flexWrap: "wrap" } },
          ...b.tool_names.map(
            (x) => o.createElement(
              f,
              { key: x, color: "blue", style: { fontSize: 10 } },
              x
            )
          )
        ) : null
      )
    ),
    // Dependencies
    o.createElement(g, null),
    o.createElement(p, { strong: !0 }, "实现与依赖"),
    w && w.dependencies.length > 0 ? o.createElement(
      "div",
      { style: { marginTop: 8 } },
      ...w.dependencies.map(
        (b) => o.createElement(
          "div",
          {
            key: b.name,
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
            o.createElement(p, { style: { fontSize: 13 } }, b.name),
            o.createElement(
              f,
              {
                color: Pn[b.status] || "default",
                style: { fontSize: 11 }
              },
              $n[b.status] || b.status
            )
          ),
          b.status !== "available" && b.reason ? o.createElement(
            p,
            { type: "secondary", style: { display: "block", fontSize: 12, marginTop: 4 } },
            b.reason
          ) : null,
          b.status !== "available" && b.install_hint ? o.createElement(
            p,
            { style: { display: "block", fontSize: 12, marginTop: 4 } },
            `安装：${b.install_hint}`
          ) : null,
          b.status !== "available" && b.enable_hint ? o.createElement(
            p,
            { style: { display: "block", fontSize: 12, marginTop: 2 } },
            `启用：${b.enable_hint}`
          ) : null
        )
      )
    ) : o.createElement(
      h,
      { type: "secondary", style: { fontSize: 12 } },
      "无外部依赖"
    ),
    // Actions
    o.createElement(g, null),
    o.createElement(p, { strong: !0 }, "问题处理"),
    o.createElement(
      "div",
      { style: { marginTop: 8, display: "flex", gap: 8, flexWrap: "wrap" } },
      E.id === "neqsim" && e.effectiveStatus === "needs_install" ? o.createElement(
        m,
        {
          size: "small",
          type: "primary",
          loading: (i == null ? void 0 : i.status) === "queued" || (i == null ? void 0 : i.status) === "running",
          onClick: s
        },
        (i == null ? void 0 : i.status) === "running" ? `${i.message} (${i.progress}%)` : "安装 NeqSim 运行环境"
      ) : null,
      E.provider.kind === "driver" ? o.createElement(
        m,
        { size: "small", onClick: r },
        "查看内置 MCP Driver"
      ) : E.source === "library" ? o.createElement(
        m,
        { size: "small", onClick: l },
        "查看相关技能"
      ) : o.createElement(
        m,
        { size: "small", onClick: () => a("builtin") },
        "查看内置工具"
      )
    ),
    E.id === "neqsim" && (i == null ? void 0 : i.status) === "failed" ? o.createElement(
      h,
      { type: "danger", style: { marginTop: 8, fontSize: 12 } },
      i.error || "安装失败"
    ) : null,
    E.id === "neqsim" && (i != null && i.warning) ? o.createElement(
      h,
      { type: "warning", style: { marginTop: 8, fontSize: 12 } },
      i.warning
    ) : null
  );
}
const Ls = {
  geology_well_logging: "测井地质",
  production_engineering: "采油工程",
  fluid_thermodynamics: "流体热力学",
  scientific_computing: "科学计算",
  data_modeling: "数据建模"
};
function Bs(e) {
  return e instanceof Error ? /Install task not found|HTTP 404/i.test(e.message) : !1;
}
function Us({
  onNavigateToMcp: e,
  onNavigateToTools: t,
  onNavigateToSkills: n
} = {}) {
  var ce, ye;
  const r = T().React, { useState: a, useEffect: l, useCallback: s, useMemo: i, useRef: o } = r, {
    Spin: c,
    Empty: u,
    Button: f,
    message: d,
    Row: m,
    Col: v,
    Input: g,
    Drawer: p,
    Typography: h
  } = T().antd, { ReloadOutlined: E, SearchOutlined: w } = T().antdIcons || {}, { Text: b } = h, x = (ye = (ce = T()).useSelectedAgent) == null ? void 0 : ye.call(ce), M = (x == null ? void 0 : x.id) || "default", [D, $] = a([]), [A, F] = a(!0), [V, U] = a(""), [k, S] = a(!1), [z, I] = a(null), [W, j] = a(null), G = o(M);
  G.current = M;
  const O = o(z);
  O.current = z;
  const P = o(0);
  l(() => () => {
    P.current += 1;
  }, []);
  const ee = s(
    async (Z = !1, ie = !1) => {
      var $e, Se;
      ie || F(!0);
      const te = ie && typeof window < "u" ? {
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
          Ss(Z),
          _s(ve, Z),
          Ts(ve, Z)
        ]);
        if (ve !== G.current) return;
        const K = [];
        for (const he of ne)
          try {
            let H = null;
            if (he.engine.provider.kind === "driver") {
              const C = he.engine.provider.id;
              H = we.get(C) || null;
            }
            K.push(Is(he, H, Ce));
          } catch {
          }
        $(K);
        const ue = (Se = O.current) == null ? void 0 : Se.definition.id;
        if (ue) {
          const he = K.find(
            (H) => H.definition.id === ue
          );
          he && (O.current = he, I(he));
        }
        be();
      } catch (ne) {
        const we = ne instanceof Error ? ne.message : "加载领域引擎失败";
        d.error(we), ie || $([]);
      } finally {
        ie || F(!1);
      }
    },
    []
  );
  l(() => {
    ee();
  }, [M, ee]);
  const oe = i(() => {
    if (!V.trim()) return D;
    const Z = V.toLowerCase();
    return D.filter(
      (ie) => ie.definition.name.toLowerCase().includes(Z) || ie.definition.domain.toLowerCase().includes(Z) || ie.definition.description.toLowerCase().includes(Z) || ie.definition.tags.some((te) => te.toLowerCase().includes(Z))
    );
  }, [D, V]), B = i(
    () => As(oe),
    [oe]
  ), L = s(() => {
    ee(!0);
  }, [ee]), le = s((Z) => {
    O.current = Z, I(Z), S(!0);
  }, []), re = s(() => {
    S(!1), e == null || e();
  }, [e]), q = s(
    (Z) => {
      S(!1), t == null || t(Z);
    },
    [t]
  ), me = s(() => {
    S(!1), n == null || n();
  }, [n]), R = s(async () => {
    const Z = ++P.current, ie = () => Z === P.current;
    try {
      let te = await ks();
      if (!ie()) return;
      for (j(te); te.status === "queued" || te.status === "running"; ) {
        if (await new Promise((be) => setTimeout(be, 1e3)), !ie()) return;
        try {
          te = await Cs(te.id);
        } catch (be) {
          if (!Bs(be)) throw be;
          const ve = await xs(!0);
          if (!ie()) return;
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
        if (!ie()) return;
        j(te);
      }
      if (!ie()) return;
      te.status === "completed" ? (te.warning ? d.warning(te.warning) : d.success("NeqSim 运行环境已安装并启用"), await ee(!0, !0)) : d.error(te.error || "NeqSim 安装失败");
    } catch (te) {
      if (!ie()) return;
      d.error(te instanceof Error ? te.message : "NeqSim 安装失败");
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
      r.createElement(g, {
        placeholder: "搜索领域引擎...",
        prefix: w ? r.createElement(w) : void 0,
        value: V,
        onChange: (Z) => U(Z.target.value),
        allowClear: !0,
        style: { maxWidth: 280 }
      }),
      r.createElement(
        f,
        {
          icon: E ? r.createElement(E) : void 0,
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
      r.createElement(c, {
        size: "large",
        tip: "正在加载领域引擎..."
      })
    ) : oe.length === 0 ? r.createElement(u, {
      description: V ? "无匹配引擎" : "暂无领域引擎"
    }) : r.createElement(
      "div",
      null,
      ...Array.from(B.entries()).map(
        ([Z, ie]) => r.createElement(
          "div",
          { key: Z, style: { marginBottom: 20 } },
          r.createElement(
            b,
            {
              strong: !0,
              style: {
                fontSize: 14,
                display: "block",
                marginBottom: 8
              }
            },
            Ls[Z] || Z
          ),
          r.createElement(
            m,
            { gutter: [12, 12], align: "stretch" },
            ...ie.map(
              (te) => r.createElement(
                v,
                {
                  key: te.definition.id,
                  xs: 24,
                  sm: 12,
                  md: 8,
                  lg: 6,
                  style: { display: "flex" }
                },
                r.createElement(Rs, {
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
    r.createElement(Ms, {
      view: z,
      open: k,
      onClose: () => S(!1),
      onNavigateToMcp: re,
      onNavigateToTools: q,
      onNavigateToSkills: me,
      onInstallNeqsim: R,
      neqsimInstallState: W
    })
  );
}
const js = fs, Na = /* @__PURE__ */ new Set(["tools", "engines", "skills"]);
function Ns(e) {
  try {
    const t = new URLSearchParams(window.location.search).get("tab");
    return t && Na.has(t) ? t : e;
  } catch {
    return e;
  }
}
function Dr(e) {
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
  const t = T().React, { useEffect: n, useState: r } = t, { Alert: a, Spin: l } = T().antd, [s, i] = r(null), [o, c] = r("");
  if (n(() => {
    let f = !0;
    const d = T().loadBuiltinPage;
    return i(null), d ? (c(""), d(e).then((m) => {
      f && i(() => m);
    }).catch((m) => {
      f && c(
        m instanceof Error ? m.message : "加载原生管理页面失败"
      );
    }), () => {
      f = !1;
    }) : (c("当前 QwenPaw 版本不支持原生页面嵌入"), () => {
      f = !1;
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
  const u = e === "mcp" ? {
    title: "UGSci MCP",
    description: "连接外部工具、数据服务与计算能力，扩展当前专家的可调用范围",
    managedTitle: "已接入服务",
    managedDescription: "启用后可由当前专家调用，并可按工具配置访问权限",
    create: "接入 MCP 服务"
  } : void 0;
  return t.createElement(s, { embedded: !0, embeddedLabels: u });
}
function Ds({
  activeSubTab: e,
  onSubTabChange: t
}) {
  const n = T().React, { Tabs: r } = T().antd;
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
function Fs({
  onNavigateToMcp: e,
  onNavigateToTools: t,
  onNavigateToSkills: n
} = {}) {
  const r = T().React, { Tabs: a } = T().antd;
  return r.createElement(a, {
    defaultActiveKey: "simulation",
    items: [
      {
        key: "simulation",
        label: "仿真软件",
        children: r.createElement(ws)
      },
      {
        key: "domain",
        label: "领域计算",
        children: r.createElement(
          Us,
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
function Da({
  initialTab: e = "engines"
} = {}) {
  var h, E;
  const t = T().React, { useEffect: n, useState: r } = t, { Tabs: a, Tag: l } = T().antd, { RocketOutlined: s, ToolOutlined: i, ThunderboltOutlined: o } = T().antdIcons || {}, c = (E = (h = T()).useSelectedAgent) == null ? void 0 : E.call(h), u = (c == null ? void 0 : c.id) || "default", [f, d] = r(
    () => Ns(e)
  ), [m, v] = r("mcp");
  n(() => {
    try {
      const w = new URLSearchParams(window.location.search).get("tab");
      w && !Na.has(w) && Dr(f);
    } catch {
    }
  }, [f]);
  const g = (w) => {
    d(w), Dr(w);
  }, p = (w, b) => t.createElement(
    "span",
    { style: { display: "inline-flex", alignItems: "center", gap: 6 } },
    b ? t.createElement(b, { style: { fontSize: 14 } }) : null,
    w
  );
  return t.createElement(
    "div",
    { style: { padding: 24 } },
    t.createElement(un, {
      title: "工具·技能",
      subtitle: "管理当前专家可调用的引擎、工具、运行服务与专业技能",
      extra: t.createElement(
        l,
        { color: "blue" },
        `当前专家：${u}`
      )
    }),
    t.createElement(a, {
      activeKey: f,
      onChange: (w) => g(w),
      items: [
        {
          key: "engines",
          label: p("引擎", s),
          children: t.createElement(
            Fs,
            {
              onNavigateToMcp: () => {
                v("mcp"), g("tools");
              },
              onNavigateToTools: (w) => {
                v(w || "mcp"), g("tools");
              },
              onNavigateToSkills: () => g("skills")
            }
          )
        },
        {
          key: "tools",
          label: p("工具", i),
          children: t.createElement(Ds, {
            activeSubTab: m,
            onSubTabChange: v
          })
        },
        {
          key: "skills",
          label: p("技能", o),
          children: t.createElement(js, {
            embedded: !0
          })
        }
      ]
    })
  );
}
const Fa = Da;
function Gs() {
  return T().React.createElement(Fa, {
    initialTab: "tools"
  });
}
function Hs() {
  return T().React.createElement(Fa, {
    initialTab: "skills"
  });
}
const Fr = {
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
function Ws(e) {
  if (!e.env) return !1;
  const t = Object.entries(e.env);
  return t.length === 0 ? !1 : t.some(([, n]) => typeof n == "string" && n.length > 0);
}
const en = "ugsci.market.githubSources", Gr = "https://github.com/anthropics/skills/tree/main/skills", Ga = "https://ugsci-awesome-tools.oss-cn-beijing.aliyuncs.com", Vs = `${Ga}/skills`;
function Js(e) {
  const t = e.replace(/^\/+/, "");
  return dn(`/plugins/oss-proxy?path=${encodeURIComponent(t)}`);
}
function rn(e) {
  const t = e.replace(/^\/+/, "");
  return Qe(`/plugins/oss-proxy?path=${encodeURIComponent(t)}`);
}
async function Xn(e) {
  const t = e.replace(/^\/+/, ""), n = await rn(t);
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
function qs(e) {
  var a, l;
  const t = {};
  if (e.env && e.env.length > 0)
    for (const s of e.env)
      t[s] = `your-${s.toLowerCase().replace(/_/g, "-")}`;
  let n = "🔌";
  const r = (e.icon || "").toLowerCase();
  return r.includes("folder") ? n = "📁" : r.includes("git") ? n = "🌿" : r.includes("github") ? n = "🐙" : r.includes("database") || r.includes("postgres") || r.includes("sqlite") ? n = "🗄️" : r.includes("search") || r.includes("brave") ? n = "🔍" : r.includes("browser") || r.includes("puppeteer") ? n = "🎭" : r.includes("memory") || r.includes("brain") ? n = "🧠" : r.includes("file") || r.includes("fetch") ? n = "🌐" : r.includes("slack") ? n = "💬" : r.includes("google") ? n = "📁" : r.includes("notion") ? n = "📝" : r.includes("jupyter") ? n = "📊" : r.includes("science") || r.includes("flask") ? n = "🔬" : r.includes("book") || r.includes("arxiv") ? n = "📚" : r.includes("patent") && (n = "📜"), {
    id: e.id,
    name: e.name,
    emoji: n,
    iconUrl: e.icon_url ? Js(e.icon_url) : void 0,
    category: e.category ? yt(e.category) : "",
    description: e.description,
    transport: e.transport || "stdio",
    command: ((a = e.config) == null ? void 0 : a.command) || "",
    args: ((l = e.config) == null ? void 0 : l.args) || [],
    env: Object.keys(t).length > 0 ? t : void 0
  };
}
const Ha = "ugsci.market.mcpSources", Wa = "ugsci.market.expertSources";
function Va(e, t) {
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
function Ja(e, t) {
  try {
    localStorage.setItem(e, JSON.stringify(t));
  } catch {
  }
}
function Ks() {
  return Va(Ha, "mcp");
}
function Jt(e) {
  Ja(Ha, e);
}
function Xs() {
  return Va(Wa, "expert");
}
function qt(e) {
  Ja(Wa, e);
}
function qa(e) {
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
    const l = decodeURIComponent(a[0]), s = decodeURIComponent(a[1]);
    let i = "main", o = "";
    return a.length >= 4 && (a[2] === "tree" || a[2] === "blob") ? (i = decodeURIComponent(a[3]), a.length > 4 && (o = a.slice(4).map(decodeURIComponent).join("/"))) : a.length > 2 && (o = a.slice(2).map(decodeURIComponent).join("/")), o = o.replace(/\/+$/, "").replace(/^\/+/, ""), {
      owner: l,
      repo: s,
      ref: i || "main",
      skillsPath: o,
      label: `${l}/${s}`,
      platform: r
    };
  } catch {
    return null;
  }
}
function Ka(e, t, n, r = "github") {
  return r === "oss" ? `oss:${e}/${n || "/"}` : `${r}:${e}/${t}:${n || "/"}`;
}
function Ys(e) {
  try {
    const t = new URL(e.trim()), n = t.hostname.toLowerCase(), r = n.match(
      /^([a-z0-9][a-z0-9-]{1,61}[a-z0-9])\.oss-([a-z0-9-]+)\.aliyuncs\.com$/
    );
    if (!r) return null;
    const a = r[1], l = `${t.protocol}//${n}`, s = decodeURIComponent(t.pathname).replace(/^\/+/, "").replace(/\/+$/, "");
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
function Qs() {
  try {
    const e = localStorage.getItem(en);
    if (!e) {
      const r = [], a = qa(Gr);
      return a && r.push({
        id: Ka(
          a.owner,
          a.repo,
          a.skillsPath,
          a.platform
        ),
        url: Gr,
        label: a.label,
        owner: a.owner,
        repo: a.repo,
        ref: a.ref,
        skillsPath: a.skillsPath,
        enabled: !1,
        platform: a.platform
      }), localStorage.setItem(en, JSON.stringify(r)), r;
    }
    const t = JSON.parse(e);
    if (!Array.isArray(t)) return [];
    const n = t.filter(
      (r) => r && typeof r.id == "string" && (typeof r.owner == "string" || r.platform === "oss") && !(r.platform === "oss" && r.url === Vs)
    ).map((r) => ({
      ...r,
      platform: r.platform || "github",
      owner: r.owner || "",
      repo: r.repo || "",
      ref: r.ref || "",
      skillsPath: r.skillsPath || ""
    }));
    return n.length !== t.length && localStorage.setItem(
      en,
      JSON.stringify(n)
    ), n;
  } catch {
    return [];
  }
}
function Kt(e) {
  try {
    localStorage.setItem(
      en,
      JSON.stringify(e)
    );
  } catch {
  }
}
function Zs(e) {
  const t = e.match(/^---\s*\n([\s\S]*?)\n---/);
  if (!t) return {};
  const n = t[1], r = {}, a = n.split(`
`);
  let l = "";
  for (const s of a) {
    const i = s.match(/^(\w[\w-]*)\s*:\s*(.*)$/);
    if (i) {
      l = i[1];
      let o = i[2].trim();
      (o.startsWith('"') && o.endsWith('"') || o.startsWith("'") && o.endsWith("'")) && (o = o.slice(1, -1)), l === "name" ? r.name = o : l === "description" ? r.description = o : l === "version" ? r.version = o : l === "author" && (r.author = o);
    }
  }
  return r;
}
async function ei(e) {
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
  const s = await l.json();
  if (!Array.isArray(s)) return [];
  const i = s.filter(
    (c) => c.type === "dir" && c.name
  );
  return await Promise.all(
    i.map(async (c) => {
      const u = e.skillsPath ? e.skillsPath + "/" : "", f = t ? `https://gitee.com/${e.owner}/${e.repo}/raw/${e.ref}/${u}${c.name}/SKILL.md` : `https://raw.githubusercontent.com/${e.owner}/${e.repo}/${e.ref}/${u}${c.name}/SKILL.md`, d = t ? `https://gitee.com/${e.owner}/${e.repo}/tree/${e.ref}/${u}${c.name}` : `https://github.com/${e.owner}/${e.repo}/tree/${e.ref}/${u}${c.name}`, m = {
        sourceId: e.id,
        sourceLabel: e.label,
        name: c.name,
        description: "",
        source_url: d,
        html_url: d,
        version: null,
        author: null
      };
      try {
        const v = {};
        t && e.accessToken && (v.Authorization = `token ${e.accessToken}`);
        const g = await fetch(f, {
          headers: v
        });
        if (!g.ok) return m;
        const p = await g.text(), h = Zs(p);
        return {
          ...m,
          name: h.name || c.name,
          description: h.description || "",
          version: h.version || null,
          author: h.author || null
        };
      } catch {
        return m;
      }
    })
  );
}
async function ti(e) {
  const t = Ys(e.url);
  if (!t)
    throw new Error(`Invalid OSS URL: ${e.url}`);
  const { endpoint: n, prefix: r } = t, a = r.split("/").map(encodeURIComponent).join("/"), l = await rn(
    `${a}/manifest.json`
  );
  if (!l.ok)
    throw new Error(
      `无法获取技能列表: manifest.json (${l.status})`
    );
  const s = await l.json(), i = [];
  if (s && s.tag_groups && typeof s.tag_groups == "object")
    for (const [u, f] of Object.entries(s.tag_groups))
      Array.isArray(f) && i.push({
        id: u,
        label: yt(u),
        tags: f
      });
  const o = [];
  function c(u, f) {
    for (const d of u) {
      if (d.type === "collection" && Array.isArray(d.children)) {
        c(d.children, d.name);
        continue;
      }
      const m = d.path || d.name || "";
      if (!m) continue;
      const v = m.split("/").map(encodeURIComponent).join("/"), g = `${n}/${a}/${v}`;
      let p = null;
      if (d.metadata) {
        const E = d.metadata.match(/version:\s*"?([\d.]+)"?/);
        E && (p = E[1]);
      }
      const h = f ? `${e.label}/${f}` : e.label;
      o.push({
        sourceId: e.id,
        sourceLabel: e.label,
        sourcePath: h,
        name: d.name || m.split("/").pop() || m,
        description: d.description || "",
        source_url: g,
        html_url: g,
        version: p,
        author: null,
        tag: d.tag || void 0,
        isOfficial: !0
      });
    }
  }
  if (Array.isArray(s) ? c(
    s.map(
      (u) => typeof u == "string" ? { name: u, path: u } : u
    )
  ) : s && Array.isArray(s.skills) && c(s.skills), o.length === 0)
    throw new Error(
      `manifest.json 中未找到技能。请检查 ${e.url}/manifest.json`
    );
  return { skills: o, categories: i };
}
async function ni() {
  const e = await Xn("mcp/manifest.json"), t = [], n = {};
  if (e.tag_groups && typeof e.tag_groups == "object")
    for (const [a, l] of Object.entries(e.tag_groups))
      Array.isArray(l) && (n[a] = l, t.push({
        id: a,
        label: yt(a),
        tags: l
      }));
  return { servers: (e.servers || []).map((a) => {
    let l = "";
    const s = a.tags || [];
    for (const [i, o] of Object.entries(n))
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
async function ri() {
  const e = await Xn("skills/manifest.json"), t = [], n = /* @__PURE__ */ new Set();
  function r(a, l) {
    for (const s of a) {
      if ((s == null ? void 0 : s.type) === "collection" && Array.isArray(s.children)) {
        r(s.children, s.name || l);
        continue;
      }
      const i = String((s == null ? void 0 : s.path) || (s == null ? void 0 : s.name) || "").trim();
      if (!i) continue;
      const o = i.split("/").map(encodeURIComponent).join("/"), c = `${Ga}/skills/${o}`, u = typeof s.tag == "string" && s.tag.trim() ? s.tag.trim() : void 0;
      u && n.add(u);
      let f = null;
      if (typeof s.metadata == "string") {
        const d = s.metadata.match(/version:\s*"?([\d.]+)"?/);
        d && (f = d[1]);
      }
      t.push({
        sourceId: "oss:ugsci-official",
        sourceLabel: "UGSci",
        sourcePath: l ? `UGSci/${l}` : "UGSci",
        name: s.name || i.split("/").pop() || i,
        description: s.description || "",
        source_url: c,
        html_url: c,
        version: f,
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
async function ai() {
  const e = await Xn("agents/manifest.json"), t = [], n = {};
  if (e.tag_groups && typeof e.tag_groups == "object")
    for (const [a, l] of Object.entries(e.tag_groups))
      Array.isArray(l) && (n[a] = l, t.push({
        id: a,
        label: yt(a),
        tags: l
      }));
  return { agents: (e.agents || []).map((a) => {
    let l = "";
    const s = a.tags || [];
    for (const [i, o] of Object.entries(n))
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
async function li(e) {
  const t = e.filter((s) => s.enabled), n = await Promise.all(
    t.map(async (s) => {
      try {
        if (s.platform === "oss") {
          const { skills: i, categories: o } = await ti(s);
          return { skills: i, categories: o, error: null, label: s.label };
        } else
          return { skills: await ei(s), categories: [], error: null, label: s.label };
      } catch (i) {
        return {
          skills: [],
          categories: [],
          error: i.message || String(i),
          label: s.label
        };
      }
    })
  ), r = [], a = [], l = [];
  for (const s of n)
    r.push(...s.skills), a.push(...s.categories), s.error && l.push({ label: s.label, message: s.error });
  return { skills: r, errors: l, categories: a };
}
function oi({
  open: e,
  onClose: t,
  sources: n,
  onChange: r
}) {
  const a = T().React, { useState: l } = a, {
    Modal: s,
    Input: i,
    Button: o,
    List: c,
    Tag: u,
    Switch: f,
    Typography: d,
    Tooltip: m,
    message: v
  } = T().antd, {
    PlusOutlined: g,
    DeleteOutlined: p,
    LinkOutlined: h,
    GithubOutlined: E
  } = T().antdIcons || {}, { Text: w } = d, [b, x] = l(""), [M, D] = l(""), $ = () => {
    const U = b.trim();
    if (!U) return;
    const k = qa(U);
    if (!k) {
      v.error("无效的仓库 URL，请输入类似 https://github.com/owner/repo/tree/main/skills 或 https://gitee.com/owner/repo/tree/master/skills 的链接");
      return;
    }
    const S = Ka(k.owner, k.repo, k.skillsPath, k.platform);
    if (n.some((W) => W.id === S)) {
      v.warning("该源已存在");
      return;
    }
    const z = {
      id: S,
      url: U,
      label: k.label,
      owner: k.owner,
      repo: k.repo,
      ref: k.ref,
      skillsPath: k.skillsPath,
      enabled: !0,
      platform: k.platform,
      accessToken: M.trim() || void 0
    }, I = [...n, z];
    Kt(I), r(I), x(""), D(""), v.success(`已添加源: ${k.label}`);
  }, A = (U, k) => {
    const S = n.map(
      (z) => z.id === U ? { ...z, enabled: k } : z
    );
    Kt(S), r(S);
  }, F = (U, k) => {
    const S = n.map(
      (z) => z.id === U ? { ...z, accessToken: k.trim() || void 0 } : z
    );
    Kt(S), r(S);
  }, V = (U) => {
    const k = n.filter((S) => S.id !== U);
    Kt(k), r(k), v.success("已移除源");
  };
  return a.createElement(
    s,
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
        w,
        { type: "secondary", style: { fontSize: 12, display: "block", marginBottom: 8 } },
        "添加 GitHub 或 Gitee 仓库作为技能源，系统将从该仓库的指定目录获取技能列表。支持格式："
      ),
      a.createElement(
        "div",
        { style: { display: "flex", gap: 8, alignItems: "center" } },
        a.createElement(i, {
          placeholder: "https://github.com/owner/repo/tree/main/skills 或 https://gitee.com/owner/repo/tree/master/skills",
          value: b,
          onChange: (U) => x(U.target.value),
          onPressEnter: $,
          prefix: h ? a.createElement(h) : void 0,
          style: { flex: 1 }
        }),
        a.createElement(
          o,
          {
            type: "primary",
            icon: g ? a.createElement(g) : void 0,
            onClick: $
          },
          "添加"
        )
      ),
      // Gitee token input (shown when URL looks like a Gitee link)
      b.trim() && b.trim().toLowerCase().includes("gitee.com") ? a.createElement(
        "div",
        { style: { marginTop: 8, display: "flex", gap: 8, alignItems: "center" } },
        a.createElement(
          w,
          { type: "secondary", style: { fontSize: 12, whiteSpace: "nowrap" } },
          "Gitee Token:"
        ),
        a.createElement(i.Password, {
          placeholder: "私有仓库请填写 Gitee 私人令牌（可选）",
          value: M,
          onChange: (U) => D(U.target.value),
          style: { flex: 1 }
        })
      ) : null
    ),
    a.createElement(
      "div",
      { style: { marginBottom: 8, display: "flex", alignItems: "center", justifyContent: "space-between" } },
      a.createElement(w, { strong: !0 }, `已配置源 (${n.length})`)
    ),
    a.createElement(c, {
      size: "small",
      bordered: !0,
      dataSource: n,
      renderItem: (U) => a.createElement(
        c.Item,
        {
          actions: [
            a.createElement(
              m,
              { title: U.enabled ? "点击禁用" : "点击启用" },
              a.createElement(f, {
                size: "small",
                checked: U.enabled,
                onChange: (k) => A(U.id, k)
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
                  icon: p ? a.createElement(p) : void 0,
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
              u,
              { color: U.platform === "gitee" ? "orange" : U.platform === "oss" ? "green" : "blue", style: { fontSize: 11 } },
              U.platform === "gitee" ? "Gitee" : U.platform === "oss" ? "OSS" : "GitHub"
            ),
            a.createElement(
              u,
              { style: { fontSize: 11 } },
              U.label
            ),
            U.skillsPath ? a.createElement(
              w,
              { type: "secondary", style: { fontSize: 11 } },
              `/${U.skillsPath}`
            ) : null,
            U.platform !== "oss" ? a.createElement(
              w,
              { type: "secondary", style: { fontSize: 11 } },
              `@${U.ref}`
            ) : null
          ),
          a.createElement(
            w,
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
              w,
              { type: "secondary", style: { fontSize: 11, whiteSpace: "nowrap" } },
              "Token:"
            ),
            a.createElement(i.Password, {
              size: "small",
              placeholder: "Gitee 私人令牌（可选，用于私有仓库）",
              value: U.accessToken || "",
              onChange: (k) => F(U.id, k.target.value),
              style: { flex: 1 }
            })
          ) : null
        )
      )
    })
  );
}
function Hr({
  open: e,
  onClose: t,
  sources: n,
  onChange: r,
  type: a
}) {
  const l = T().React, { useState: s } = l, {
    Modal: i,
    Input: o,
    Button: c,
    List: u,
    Tag: f,
    Switch: d,
    Typography: m,
    Tooltip: v,
    message: g
  } = T().antd, {
    PlusOutlined: p,
    DeleteOutlined: h,
    LinkOutlined: E,
    ApiOutlined: w,
    UserOutlined: b,
    ImportOutlined: x,
    ExportOutlined: M,
    CopyOutlined: D
  } = T().antdIcons || {}, { Text: $ } = m, [A, F] = s(""), [V, U] = s(""), [k, S] = s(""), [z, I] = s(!1), W = a === "mcp" ? "MCP" : "专家模板", j = a === "mcp" ? w ? l.createElement(w, { style: { fontSize: 18 } }) : null : b ? l.createElement(b, { style: { fontSize: 18 } }) : null, G = () => {
    const B = A.trim(), L = V.trim();
    if (!B) return;
    const le = L || B.slice(0, 40), re = `${a}:${B}`;
    if (n.some((R) => R.id === re)) {
      g.warning("该源已存在");
      return;
    }
    const q = {
      id: re,
      label: le,
      url: B,
      enabled: !0,
      type: a
    }, me = [...n, q];
    a === "mcp" ? Jt(me) : qt(me), r(me), F(""), U(""), g.success(`已添加${W}源: ${le}`);
  }, O = (B, L) => {
    const le = n.map(
      (re) => re.id === B ? { ...re, enabled: L } : re
    );
    a === "mcp" ? Jt(le) : qt(le), r(le);
  }, P = (B) => {
    const L = n.filter((le) => le.id !== B);
    a === "mcp" ? Jt(L) : qt(L), r(L), g.success("已移除源");
  }, ee = () => {
    const B = JSON.stringify(
      { type: a, sources: n },
      null,
      2
    );
    try {
      navigator.clipboard.writeText(B), g.success(`${W}源已复制到剪贴板（${n.length} 个源）`);
    } catch {
      const L = document.createElement("textarea");
      L.value = B, document.body.appendChild(L), L.select(), document.execCommand("copy"), document.body.removeChild(L), g.success(`${W}源已复制到剪贴板（${n.length} 个源）`);
    }
  }, oe = () => {
    const B = k.trim();
    if (!B) {
      g.warning("请粘贴 JSON 内容");
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
        g.error("未找到有效的源数据");
        return;
      }
      const q = new Set(n.map((ce) => ce.id)), me = [];
      for (const ce of re) {
        const ye = ce.id || `${a}:${ce.url}`;
        q.has(ye) || me.push({
          id: ye,
          label: ce.label,
          url: ce.url,
          enabled: ce.enabled !== !1,
          type: a
        });
      }
      if (me.length === 0) {
        g.info("所有源均已存在，无新增");
        return;
      }
      const R = [...n, ...me];
      a === "mcp" ? Jt(R) : qt(R), r(R), S(""), I(!1), g.success(`成功导入 ${me.length} 个${W}源`);
    } catch (L) {
      g.error(`JSON 解析失败: ${L.message || "格式错误"}`);
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
            c,
            {
              icon: M ? l.createElement(M) : void 0,
              onClick: ee,
              disabled: n.length === 0,
              size: "small"
            },
            "导出到剪贴板"
          ),
          l.createElement(
            c,
            {
              icon: x ? l.createElement(x) : void 0,
              onClick: () => I(!z),
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
        value: k,
        onChange: (B) => S(B.target.value),
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
      l.createElement(o, {
        placeholder: "源名称（可选，如：团队MCP仓库）",
        value: V,
        onChange: (B) => U(B.target.value),
        style: { width: 200 }
      }),
      l.createElement(o, {
        placeholder: a === "mcp" ? "https://raw.githubusercontent.com/team/mcp-registry/main/mcp.json" : "https://raw.githubusercontent.com/team/expert-registry/main/experts.json",
        value: A,
        onChange: (B) => F(B.target.value),
        onPressEnter: G,
        prefix: E ? l.createElement(E) : void 0,
        style: { flex: 1 }
      }),
      l.createElement(
        c,
        {
          type: "primary",
          icon: p ? l.createElement(p) : void 0,
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
    l.createElement(u, {
      size: "small",
      bordered: !0,
      dataSource: n,
      renderItem: (B) => l.createElement(
        u.Item,
        {
          actions: [
            l.createElement(
              v,
              { title: B.enabled ? "点击禁用" : "点击启用" },
              l.createElement(d, {
                size: "small",
                checked: B.enabled,
                onChange: (L) => O(B.id, L)
              })
            ),
            l.createElement(
              v,
              { title: "移除此源" },
              l.createElement(
                c,
                {
                  size: "small",
                  type: "text",
                  danger: !0,
                  icon: h ? l.createElement(h) : void 0,
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
              f,
              {
                color: a === "mcp" ? "purple" : "blue",
                style: { fontSize: 11 }
              },
              B.label
            ),
            B.enabled ? null : l.createElement(
              f,
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
async function si() {
  return de("/market/providers");
}
async function ii(e) {
  return de(
    `/market/categories?lang=${encodeURIComponent(e)}`
  );
}
async function ci(e, t, n, r, a) {
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
function Wr(e) {
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
async function Vr(e, t) {
  const n = { bundle_url: e };
  return t && (n.access_token = t), de("/skills/pool/import", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(n)
  });
}
function di({ embedded: e = !1 } = {}) {
  const t = T().React, { useState: n, useEffect: r, useCallback: a, useMemo: l, useRef: s } = t, {
    Spin: i,
    Empty: o,
    Input: c,
    Button: u,
    message: f,
    Row: d,
    Col: m,
    Card: v,
    Tag: g,
    Tooltip: p,
    Typography: h,
    Select: E,
    Drawer: w,
    Descriptions: b,
    Tabs: x,
    Badge: M,
    Progress: D,
    Modal: $,
    Alert: A
  } = T().antd, {
    ReloadOutlined: F,
    SearchOutlined: V,
    DownloadOutlined: U,
    AppstoreOutlined: k,
    ShopOutlined: S,
    CheckCircleOutlined: z,
    LoadingOutlined: I,
    UserOutlined: W,
    UserAddOutlined: j,
    SettingOutlined: G,
    GithubOutlined: O,
    ApiOutlined: P
  } = T().antdIcons || {}, { Text: ee, Paragraph: oe, Title: B } = h, [L, le] = n("skills"), [re, q] = n([]), [me, R] = n([]), [ce, ye] = n([]), [Z, ie] = n(""), [te, be] = n(""), [ve, $e] = n(!1), [Se, ne] = n(!1), [we, Ce] = n(
    {}
  ), [K, ue] = n(null), [he, H] = n({}), [C, pe] = n([]), [X, _] = n(""), [ae, fe] = n(""), [_e, Le] = n(""), [We, Ve] = n({}), [Be, lt] = n(""), [qe, Re] = n(/* @__PURE__ */ new Set()), [Ae, se] = n(null), [Pe, ze] = n({}), [Me, Xe] = n([]), [Ye, Ie] = n([]), [Bt, Ut] = n([]), [jt, Ze] = n(""), [rr, Nt] = n(!1), [Al, ar] = n(!1), [zl, lr] = n([]), [$l, or] = n(!1), [Pl, sr] = n([]), [Ol, ir] = n(!1), [cr, dr] = n([]), [ur, mr] = n([]), [pr, fr] = n(!1), [it, gr] = n(""), [yr, hr] = n([]), [Er, br] = n([]), [vr, wr] = n(!1), [ct, Sr] = n(""), [hn, xr] = n(!1), [De, Dt] = n(null), [Et, Rl] = n([]), bt = s(null);
  r(() => {
    Promise.all([
      si().catch(() => []),
      ii("zh").catch(() => []),
      mn().catch(() => [])
    ]).then(([y, N, J]) => {
      q(y), R(N), pe(J), J.length > 0 && (_(J[0].id), lt(J[0].id));
    });
  }, []);
  const Ft = a(async (y) => {
    const N = y ?? Qs();
    if (Xe(y || N), N.filter((ge) => ge.enabled).length === 0) {
      Ie([]);
      return;
    }
    Nt(!0);
    try {
      const { skills: ge, errors: xe, categories: Oe } = await li(N);
      if (Ie(ge), Rl(Oe), xe.length > 0) {
        for (const Te of xe)
          console.warn(`[ugsci] GitHub source '${Te.label}' error: ${Te.message}`);
        f.warning(
          `部分源加载失败: ${xe.map((Te) => Te.label).join(", ")}`
        );
      }
    } catch (ge) {
      f.error(ge.message || "加载技能源失败"), Ie([]);
    } finally {
      Nt(!1);
    }
  }, []), En = a(async () => {
    var ge, xe, Oe;
    fr(!0), wr(!0), Nt(!0);
    const [y, N, J] = await Promise.allSettled([
      ni(),
      ai(),
      ri()
    ]);
    if (y.status === "fulfilled" ? (dr(y.value.servers), mr(y.value.categories)) : (console.warn(`[ugsci] MCP manifest error: ${((ge = y.reason) == null ? void 0 : ge.message) || y.reason}`), dr([]), mr([])), fr(!1), N.status === "fulfilled" ? (hr(N.value.agents), br(N.value.categories)) : (console.warn(`[ugsci] Agents manifest error: ${((xe = N.reason) == null ? void 0 : xe.message) || N.reason}`), hr([]), br([])), wr(!1), J.status === "fulfilled")
      Ut(J.value.skills), Ze("");
    else {
      const Te = ((Oe = J.reason) == null ? void 0 : Oe.message) || String(J.reason);
      console.warn(`[ugsci] Skills manifest error: ${Te}`), Ut([]), Ze(Te);
    }
    Nt(!1);
  }, []);
  r(() => {
    Ft(), En(), lr(Ks()), sr(Xs());
  }, [Ft, En]);
  const Gt = a(
    async (y, N, J) => {
      $e(!0);
      try {
        const ge = await ci(
          y,
          J,
          20,
          "zh",
          N || void 0
        );
        J === void 0 || Object.keys(J).length === 0 ? ye(ge.results) : ye((Te) => [...Te, ...ge.results]);
        const xe = Object.values(ge.by_provider || {}).some(
          (Te) => Te.has_more
        );
        ne(xe);
        const Oe = {};
        for (const [Te, et] of Object.entries(ge.by_provider || {}))
          Oe[Te] = (J[Te] || 1) + 1;
        if (Ce(Oe), ge.errors.length > 0)
          for (const Te of ge.errors)
            console.warn(
              `[ugsci] Market provider '${Te.provider}' error: ${Te.message}`
            );
      } catch (ge) {
        f.error(ge.message || "搜索市场失败"), ye([]);
      } finally {
        $e(!1);
      }
    },
    []
  );
  r(() => (bt.current && clearTimeout(bt.current), bt.current = setTimeout(() => {
    Gt(Z, te, {});
  }, 400), () => {
    bt.current && clearTimeout(bt.current);
  }), [Z, te, Gt]);
  const Ml = () => {
    Gt(Z, te, we);
  }, kr = async (y) => {
    const N = `${y.source}:${y.slug}`;
    try {
      H((ge) => ({ ...ge, [N]: "installing" }));
      const J = await Vr(y.source_url);
      J.installed && f.success(
        `技能「${J.name || y.name}」已安装到技能池，可在技能中心查看`
      ), H((ge) => {
        const xe = { ...ge };
        return delete xe[N], xe;
      });
    } catch (J) {
      f.error(Wr(J) || "安装技能失败"), H((ge) => {
        const xe = { ...ge };
        return delete xe[N], xe;
      });
    }
  }, Ll = (y) => {
    window.history.pushState({}, "", y), window.dispatchEvent(new PopStateEvent("popstate"));
  }, Bl = async (y) => {
    const N = `github:${y.sourceId}:${y.name}`, J = Me.find((xe) => xe.id === y.sourceId), ge = (J == null ? void 0 : J.accessToken) || void 0;
    try {
      H((Oe) => ({ ...Oe, [N]: "installing" }));
      const xe = await Vr(y.source_url, ge);
      xe.installed && f.success(
        `技能「${xe.name || y.name}」已安装到技能池，可在技能中心查看`
      ), H((Oe) => {
        const Te = { ...Oe };
        return delete Te[N], Te;
      });
    } catch (xe) {
      f.error(Wr(xe) || "安装技能失败"), H((Oe) => {
        const Te = { ...Oe };
        return delete Te[N], Te;
      });
    }
  }, ot = l(() => {
    const y = [], N = /* @__PURE__ */ new Set();
    for (const J of [...Bt, ...Ye]) {
      const ge = J.source_url || `${J.sourceLabel}:${J.name}`;
      N.has(ge) || (N.add(ge), y.push(J));
    }
    return y;
  }, [Bt, Ye]), Cr = l(() => {
    const y = [], N = /* @__PURE__ */ new Set();
    if (Et.length > 0)
      for (const J of Et)
        N.has(J.id) || (N.add(J.id), y.push(J));
    for (const J of ot)
      J.tag && !N.has(J.tag) && (N.add(J.tag), y.push({ id: J.tag, label: J.tag }));
    for (const J of ot)
      !J.isOfficial && J.sourceLabel && !N.has(J.sourceLabel) && (N.add(J.sourceLabel), y.push({ id: J.sourceLabel, label: J.sourceLabel }));
    return y;
  }, [ot, Et]), bn = l(() => {
    let y = ot;
    if (te) {
      const N = Et.find((J) => J.id === te);
      N && N.tags ? y = y.filter(
        (J) => J.tag && N.tags.includes(J.tag) || J.sourceLabel === te
      ) : y = y.filter(
        (J) => J.tag === te || J.sourceLabel === te
      );
    }
    if (Z.trim()) {
      const N = Z.toLowerCase();
      y = y.filter(
        (J) => {
          var ge;
          return J.name.toLowerCase().includes(N) || ((ge = J.description) == null ? void 0 : ge.toLowerCase().includes(N));
        }
      );
    }
    return y;
  }, [ot, Z, te, Et]), Tr = re.filter((y) => y.available), dt = l(() => te ? ce.filter((y) => {
    const N = Tr.find((J) => J.key === y.source);
    return (N == null ? void 0 : N.label) === te;
  }) : ce, [ce, te, Tr]), Ul = t.createElement(
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
        prefix: V ? t.createElement(V) : void 0,
        value: Z,
        onChange: (y) => ie(y.target.value),
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
        u,
        {
          icon: O ? t.createElement(O) : void 0,
          onClick: () => ar(!0),
          size: "small"
        },
        "配置技能源"
      )
    ),
    // Dynamic category filter tags (from OSS manifest tags + imported sources)
    jt && ot.length === 0 ? t.createElement(A, {
      type: "warning",
      showIcon: !0,
      message: "UGSci 官方 OSS 技能库加载失败",
      description: "请检查网络或后端 OSS 代理服务，然后点击右上角“刷新”重试。",
      style: { marginBottom: 12 }
    }) : null,
    Cr.length > 0 ? t.createElement(
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
        g,
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
      ...Cr.map((y) => {
        const N = Ye.some(
          (J) => !J.isOfficial && J.sourceLabel === y.id
        );
        return t.createElement(
          g,
          {
            key: y.id,
            style: {
              fontSize: 11,
              cursor: "pointer",
              borderRadius: 12
            },
            color: te === y.id ? N ? "blue" : "geekblue" : void 0,
            icon: N && O ? t.createElement(O) : void 0,
            onClick: () => be(
              te === y.id ? "" : y.id
            )
          },
          y.label
        );
      })
    ) : null,
    // GitHub skills section
    rr && ot.length === 0 ? t.createElement(
      "div",
      { style: { textAlign: "center", padding: 40, marginBottom: 16 } },
      t.createElement(i, { size: "large" }, t.createElement("div", { style: { minHeight: 60, display: "flex", alignItems: "center", justifyContent: "center" } }, "正在加载技能..."))
    ) : bn.length > 0 ? t.createElement(
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
        O ? t.createElement(O, {
          style: { fontSize: 14, color: "#1677ff" }
        }) : null,
        t.createElement(
          ee,
          { strong: !0, style: { fontSize: 13 } },
          `技能市场 (${bn.length})`
        )
      ),
      t.createElement(
        d,
        { gutter: [12, 12] },
        ...bn.map((y) => {
          const N = `github:${y.sourceId}:${y.name}`, J = he[N];
          return t.createElement(
            m,
            { key: N, xs: 24, sm: 12, md: 8, lg: 6 },
            t.createElement(
              v,
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
                O ? t.createElement(O, {
                  style: { fontSize: 18, color: "var(--ant-color-text-secondary, #57606a)" }
                }) : t.createElement(
                  "span",
                  { style: { fontSize: 18 } },
                  "📦"
                ),
                t.createElement(
                  p,
                  { title: y.name },
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
                    y.name
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
                y.description || "暂无描述"
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
                  y.sourcePath || y.sourceLabel ? t.createElement(
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
                    y.sourcePath || y.sourceLabel
                  ) : null,
                  // Show tag as category badge
                  y.tag ? t.createElement(
                    g,
                    { color: "geekblue", style: { fontSize: 10 } },
                    y.tag
                  ) : null,
                  y.version ? t.createElement(
                    g,
                    { style: { fontSize: 10 } },
                    `v${y.version}`
                  ) : null
                ),
                J ? t.createElement(
                  u,
                  {
                    size: "small",
                    disabled: !0,
                    icon: I ? t.createElement(I) : void 0
                  },
                  "安装中"
                ) : t.createElement(
                  u,
                  {
                    type: "primary",
                    size: "small",
                    icon: U ? t.createElement(U) : void 0,
                    onClick: () => Bl(y)
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
    dt.length > 0 || ve ? t.createElement(
      "div",
      {
        style: {
          marginBottom: 10,
          display: "flex",
          alignItems: "center",
          gap: 6
        }
      },
      S ? t.createElement(S, {
        style: { fontSize: 14, color: "#1677ff" }
      }) : null,
      t.createElement(
        ee,
        { strong: !0, style: { fontSize: 13 } },
        `技能市场${dt.length > 0 ? ` (${dt.length})` : ""}`
      )
    ) : null,
    // Results grid
    ve && dt.length === 0 ? t.createElement(
      "div",
      { style: { textAlign: "center", padding: 60 } },
      t.createElement(i, { size: "large" })
    ) : dt.length === 0 ? t.createElement(o, {
      description: Z ? `未找到匹配「${Z}」的技能` : "输入关键词搜索技能市场",
      image: o.PRESENTED_IMAGE_SIMPLE
    }) : t.createElement(
      d,
      { gutter: [12, 12] },
      ...dt.map((y) => {
        const N = `${y.source}:${y.slug}`, J = he[N];
        return t.createElement(
          m,
          { key: N, xs: 24, sm: 12, md: 8, lg: 6 },
          t.createElement(
            v,
            {
              hoverable: !0,
              size: "small",
              style: { height: "100%", cursor: "pointer" },
              onClick: () => ue(y)
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
              y.icon_url ? t.createElement("img", {
                src: y.icon_url,
                alt: y.name,
                style: { width: 24, height: 24, borderRadius: 4 }
              }) : t.createElement(
                "span",
                { style: { fontSize: 18 } },
                "📦"
              ),
              t.createElement(
                p,
                { title: y.name },
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
                  y.name
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
              y.description || "暂无描述"
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
                  g,
                  { color: "geekblue", style: { fontSize: 10 } },
                  y.source
                ),
                y.version ? t.createElement(
                  g,
                  { style: { fontSize: 10 } },
                  `v${y.version}`
                ) : null
              ),
              J ? t.createElement(
                u,
                {
                  size: "small",
                  disabled: !0,
                  icon: I ? t.createElement(I) : void 0
                },
                "安装中"
              ) : t.createElement(
                u,
                {
                  type: "primary",
                  size: "small",
                  icon: U ? t.createElement(U) : void 0,
                  onClick: (ge) => {
                    ge.stopPropagation(), kr(y);
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
        u,
        { onClick: Ml, loading: ve },
        "加载更多"
      )
    ) : null,
    // Detail Drawer
    K ? t.createElement(
      w,
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
          u,
          {
            type: "primary",
            icon: U ? t.createElement(U) : void 0,
            onClick: () => {
              kr(K);
            }
          },
          "安装到技能池"
        )
      },
      t.createElement(
        b,
        { column: 1, bordered: !0, size: "small" },
        t.createElement(
          b.Item,
          { label: "来源" },
          K.source
        ),
        t.createElement(
          b.Item,
          { label: "描述" },
          K.description || "-"
        ),
        K.version ? t.createElement(
          b.Item,
          { label: "版本" },
          K.version
        ) : null,
        K.author ? t.createElement(
          b.Item,
          { label: "作者" },
          K.author
        ) : null,
        t.createElement(
          b.Item,
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
            ([y, N]) => t.createElement(
              "div",
              { key: y, style: { textAlign: "center" } },
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
                y
              )
            )
          )
        )
      ) : null
    ) : null
  ), vn = l(() => {
    let y = yr;
    if (ct && (y = y.filter((N) => N.category === ct)), ae.trim()) {
      const N = ae.toLowerCase();
      y = y.filter(
        (J) => J.name.toLowerCase().includes(N) || J.description.toLowerCase().includes(N) || J.tags.some((ge) => ge.toLowerCase().includes(N))
      );
    }
    return y;
  }, [yr, ae, ct]), jl = async (y) => {
    if (!hn) {
      xr(!0);
      try {
        let N = y.description;
        if (y.instructions)
          try {
            const xe = y.instructions.replace(/^\/+/, ""), Oe = await rn(xe);
            Oe.ok && (N = await Oe.text());
          } catch {
          }
        let J = [];
        if (y.skills_manifest)
          try {
            const xe = y.skills_manifest.replace(/^\/+/, ""), Oe = await rn(xe);
            if (Oe.ok) {
              const Te = await Oe.json();
              Array.isArray(Te) ? J = Te.map((et) => typeof et == "string" ? et : et.name).filter(Boolean) : Te.skills && (J = Te.skills.map((et) => typeof et == "string" ? et : et.name).filter(Boolean));
            }
          } catch {
          }
        const ge = await de("/agents", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: y.name,
            description: y.description,
            skill_names: J
          })
        });
        await nn(ge.id, "AGENTS.md", N), f.success(`专家「${y.name}」创建成功，已跳转至专家`), Ll("/ugsci-experts");
      } catch (N) {
        f.error(N.message || "创建专家失败");
      } finally {
        xr(!1);
      }
    }
  }, _r = a(async (y) => {
    if (y)
      try {
        const N = await Vn(y);
        Re(new Set(N.map((J) => J.key)));
      } catch {
        Re(/* @__PURE__ */ new Set());
      }
  }, []);
  r(() => {
    Be && _r(Be);
  }, [Be, _r]);
  const Nl = async (y) => {
    if (!Be) {
      f.warning("请先选择目标专家");
      return;
    }
    if (Ws(y)) {
      const N = Object.entries(y.env), J = {};
      for (const [ge] of N)
        J[ge] = "";
      ze(J), se(y);
      return;
    }
    await Ir(y, y.env || {});
  }, Ir = async (y, N) => {
    Ve((J) => ({ ...J, [y.id]: !0 }));
    try {
      const J = y.id;
      await Jn(Be, {
        client_key: J,
        client: {
          name: y.name,
          description: y.description,
          enabled: !0,
          transport: y.transport,
          url: y.url || "",
          command: y.command || "",
          args: y.args || [],
          env: N,
          cwd: y.cwd || "",
          headers: y.headers || {}
        }
      }), f.success(`MCP「${y.name}」已添加到当前专家`), Re((ge) => new Set(ge).add(J));
    } catch (J) {
      f.error(J.message || `添加 MCP「${y.name}」失败`);
    } finally {
      Ve((J) => ({ ...J, [y.id]: !1 }));
    }
  }, Dl = async () => {
    if (!Ae) return;
    const y = [];
    for (const [J, ge] of Object.entries(Pe))
      if (!ge || !ge.trim()) {
        const xe = Fr[J];
        y.push((xe == null ? void 0 : xe.label) || J);
      }
    if (y.length > 0) {
      f.warning(`请填写以下配置项: ${y.join(", ")}`);
      return;
    }
    const N = Ae;
    se(null), ze({}), await Ir(N, { ...Pe });
  }, wn = l(() => {
    let y = cr;
    if (it && (y = y.filter((N) => N.category === it)), _e.trim()) {
      const N = _e.toLowerCase();
      y = y.filter(
        (J) => J.name.toLowerCase().includes(N) || J.description.toLowerCase().includes(N) || J.tags.some((ge) => ge.toLowerCase().includes(N))
      );
    }
    return y.map(qs);
  }, [cr, _e, it]), Fl = t.createElement(
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
        prefix: V ? t.createElement(V) : void 0,
        value: _e,
        onChange: (y) => Le(y.target.value),
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
          value: Be,
          onChange: (y) => lt(y),
          style: { minWidth: 180 },
          size: "small",
          options: C.map((y) => ({ value: y.id, label: y.name }))
        })
      ),
      // Configure MCP source button
      t.createElement(
        u,
        {
          icon: P ? t.createElement(P) : void 0,
          onClick: () => or(!0),
          size: "small"
        },
        "配置 MCP 源"
      )
    ),
    // Dynamic category tag row (from OSS manifest tag_groups)
    ur.length > 0 ? t.createElement(
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
        g,
        {
          style: { fontSize: 11, cursor: "pointer", borderRadius: 12 },
          color: it === "" ? "blue" : void 0,
          onClick: () => gr("")
        },
        "全部"
      ),
      ...ur.map(
        (y) => t.createElement(
          g,
          {
            key: y.id,
            style: { fontSize: 11, cursor: "pointer", borderRadius: 12 },
            color: it === y.id ? "geekblue" : void 0,
            onClick: () => gr(
              it === y.id ? "" : y.id
            )
          },
          y.label
        )
      )
    ) : null,
    // MCP server cards (dynamic from OSS)
    pr && wn.length === 0 ? t.createElement(
      "div",
      { style: { textAlign: "center", padding: 40 } },
      t.createElement(i, { size: "large" }, t.createElement("div", { style: { minHeight: 60, display: "flex", alignItems: "center", justifyContent: "center" } }, "正在加载 MCP 服务器..."))
    ) : wn.length === 0 ? t.createElement(o, {
      description: "未找到匹配的 MCP 服务器",
      image: o.PRESENTED_IMAGE_SIMPLE
    }) : t.createElement(
      d,
      { gutter: [12, 12] },
      ...wn.map(
        (y) => t.createElement(
          m,
          { key: y.id, xs: 24, sm: 12, md: 8 },
          t.createElement(
            v,
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
                y.iconUrl ? t.createElement("img", {
                  src: y.iconUrl,
                  alt: y.name,
                  style: { width: 28, height: 28, objectFit: "contain" },
                  onError: (N) => {
                    N.target.style.display = "none";
                  }
                }) : y.emoji
              ),
              t.createElement(
                "div",
                { style: { flex: 1 } },
                t.createElement(
                  ee,
                  { strong: !0, style: { fontSize: 14 } },
                  y.name
                ),
                t.createElement(
                  "div",
                  { style: { display: "flex", gap: 4, marginTop: 4, flexWrap: "wrap" } },
                  t.createElement(
                    g,
                    { color: "blue", style: { fontSize: 10 } },
                    y.category
                  ),
                  t.createElement(
                    g,
                    {
                      color: y.transport === "stdio" ? "purple" : "cyan",
                      style: { fontSize: 10 }
                    },
                    y.transport
                  ),
                  y.env && Object.keys(y.env).length > 0 ? t.createElement(
                    g,
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
              y.description
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
                y.transport === "stdio" ? `${y.command} ${(y.args || []).join(" ")}` : y.url || ""
              ),
              qe.has(y.id) ? t.createElement(
                u,
                { size: "small", disabled: !0 },
                "已安装"
              ) : t.createElement(
                u,
                {
                  type: "primary",
                  size: "small",
                  loading: !!We[y.id],
                  icon: P ? t.createElement(P) : void 0,
                  onClick: () => Nl(y)
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
      S ? t.createElement(S, {
        style: { fontSize: 24, color: "var(--ant-color-text-quaternary, #bfbfbf)", marginBottom: 8 }
      }) : null,
      t.createElement(
        ee,
        { type: "secondary", style: { fontSize: 12 } },
        "MCP 服务器列表来自 UGSci 官方源，自动同步更新"
      )
    )
  ), Gl = Ae ? t.createElement(
    $,
    {
      title: t.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 8 } },
        t.createElement("span", { style: { fontSize: 20, display: "inline-flex", alignItems: "center", justifyContent: "center", width: 24, height: 24 } }, Ae.iconUrl ? t.createElement("img", { src: Ae.iconUrl, alt: Ae.name, style: { width: 22, height: 22, objectFit: "contain" }, onError: (y) => {
          y.target.style.display = "none";
        } }) : Ae.emoji),
        t.createElement("span", null, `配置 ${Ae.name} 密钥`)
      ),
      open: !!Ae,
      onCancel: () => {
        se(null), ze({});
      },
      onOk: Dl,
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
    ...Object.entries(Ae.env || {}).map(([y]) => {
      const N = Fr[y], J = (N == null ? void 0 : N.isSecret) !== !1;
      return t.createElement(
        "div",
        { key: y, style: { marginBottom: 16 } },
        t.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 6, marginBottom: 4 } },
          t.createElement(
            ee,
            { strong: !0, style: { fontSize: 13 } },
            (N == null ? void 0 : N.label) || y
          ),
          t.createElement(
            g,
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
        J ? t.createElement(c.Password, {
          placeholder: `请输入 ${(N == null ? void 0 : N.label) || y}`,
          value: Pe[y] || "",
          onChange: (ge) => ze((xe) => ({
            ...xe,
            [y]: ge.target.value
          })),
          style: { width: "100%" }
        }) : t.createElement(c, {
          placeholder: `请输入 ${(N == null ? void 0 : N.label) || y}`,
          value: Pe[y] || "",
          onChange: (ge) => ze((xe) => ({
            ...xe,
            [y]: ge.target.value
          })),
          style: { width: "100%" }
        }),
        // Show env key name for reference
        t.createElement(
          ee,
          { type: "secondary", style: { fontSize: 11, display: "block", marginTop: 2 } },
          `环境变量名: ${y}`
        )
      );
    })
  ) : null, Hl = t.createElement(
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
        prefix: V ? t.createElement(V) : void 0,
        value: ae,
        onChange: (y) => fe(y.target.value),
        allowClear: !0,
        style: { maxWidth: 400, flex: 1, minWidth: 200 }
      }),
      t.createElement(
        u,
        {
          icon: W ? t.createElement(W) : void 0,
          onClick: () => ir(!0),
          size: "small"
        },
        "配置专家源"
      )
    ),
    // Dynamic category tag row (from OSS manifest tag_groups)
    Er.length > 0 ? t.createElement(
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
        g,
        {
          style: { fontSize: 11, cursor: "pointer", borderRadius: 12 },
          color: ct === "" ? "blue" : void 0,
          onClick: () => Sr("")
        },
        "全部"
      ),
      ...Er.map(
        (y) => t.createElement(
          g,
          {
            key: y.id,
            style: { fontSize: 11, cursor: "pointer", borderRadius: 12 },
            color: ct === y.id ? "geekblue" : void 0,
            onClick: () => Sr(
              ct === y.id ? "" : y.id
            )
          },
          y.label
        )
      )
    ) : null,
    // Agent cards (dynamic from OSS)
    vr && vn.length === 0 ? t.createElement(
      "div",
      { style: { textAlign: "center", padding: 40 } },
      t.createElement(i, { size: "large" }, t.createElement("div", { style: { minHeight: 60, display: "flex", alignItems: "center", justifyContent: "center" } }, "正在加载人才市场..."))
    ) : vn.length === 0 ? t.createElement(o, {
      description: "未找到匹配的人才",
      image: o.PRESENTED_IMAGE_SIMPLE
    }) : t.createElement(
      d,
      { gutter: [12, 12] },
      ...vn.map(
        (y) => t.createElement(
          m,
          { key: y.id, xs: 24, sm: 12, md: 8 },
          t.createElement(
            v,
            {
              hoverable: !0,
              size: "small",
              style: { height: "100%", cursor: "pointer" },
              onClick: () => Dt(y)
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
              t.createElement(Ke, {
                name: y.name,
                size: 40
              }),
              t.createElement(
                "div",
                { style: { flex: 1 } },
                t.createElement(
                  ee,
                  { strong: !0, style: { fontSize: 14 } },
                  y.name
                ),
                t.createElement(
                  "div",
                  { style: { display: "flex", gap: 4, marginTop: 4, flexWrap: "wrap" } },
                  y.category ? t.createElement(
                    g,
                    { color: "blue", style: { fontSize: 10 } },
                    yt(y.category)
                  ) : null,
                  y.tags.includes("mcp") ? t.createElement(
                    g,
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
              y.description
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
                y.tags.filter((N) => N !== "agent" && N !== "template" && N !== "workspace").slice(0, 3).join(" · ") || "人才模板"
              ),
              t.createElement(
                u,
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
      S ? t.createElement(S, {
        style: { fontSize: 24, color: "var(--ant-color-text-quaternary, #bfbfbf)", marginBottom: 8 }
      }) : null,
      t.createElement(
        ee,
        { type: "secondary", style: { fontSize: 12 } },
        "人才市场来自 UGSci 官方源，自动同步更新"
      )
    )
  ), Wl = [
    {
      key: "skills",
      label: t.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        k ? t.createElement(k, { style: { fontSize: 14 } }) : null,
        "技能市场"
      ),
      children: Ul
    },
    {
      key: "mcp",
      label: t.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        P ? t.createElement(P, { style: { fontSize: 14 } }) : null,
        "MCP 市场"
      ),
      children: Fl
    },
    {
      key: "experts",
      label: t.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        j ? t.createElement(j, { style: { fontSize: 14 } }) : null,
        "人才市场"
      ),
      children: Hl
    }
  ];
  return t.createElement(
    "div",
    { style: { padding: 24 } },
    e ? null : t.createElement(un, {
      title: "市场",
      subtitle: "浏览技能市场 · 选择 MCP 服务器 · 人才市场 · 随时更新能力和专家",
      extra: t.createElement(
        "div",
        { style: { display: "flex", gap: 8 } },
        t.createElement(
          u,
          {
            type: "primary",
            icon: F ? t.createElement(F) : void 0,
            onClick: () => {
              Gt(Z, te, {}), Ft(), En();
            },
            loading: ve || rr || pr || vr
          },
          "刷新"
        )
      )
    }),
    t.createElement(x, {
      items: Wl,
      activeKey: L,
      onChange: (y) => le(y)
    }),
    // Skill source config modal
    t.createElement(oi, {
      open: Al,
      onClose: () => ar(!1),
      sources: Me,
      onChange: (y) => {
        Xe(y), Ft(y);
      }
    }),
    // MCP source config modal
    t.createElement(Hr, {
      open: $l,
      onClose: () => or(!1),
      sources: zl,
      onChange: (y) => lr(y),
      type: "mcp"
    }),
    // MCP token config modal (for templates requiring secrets)
    Gl,
    // Expert source config modal
    t.createElement(Hr, {
      open: Ol,
      onClose: () => ir(!1),
      sources: Pl,
      onChange: (y) => sr(y),
      type: "expert"
    }),
    // ── Agent Detail Modal (click card to view details, then create) ──
    De ? t.createElement(
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
          t.createElement(Ke, {
            name: De.name,
            size: 40
          }),
          t.createElement(
            "div",
            null,
            t.createElement(
              ee,
              { strong: !0, style: { fontSize: 16 } },
              De.name
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
              De.category ? t.createElement(
                g,
                { color: "blue", style: { fontSize: 10 } },
                yt(De.category)
              ) : null,
              ...De.tags.filter(
                (y) => y !== "agent" && y !== "template" && y !== "workspace"
              ).slice(0, 5).map(
                (y) => t.createElement(
                  g,
                  { key: y, style: { fontSize: 10 } },
                  y
                )
              )
            )
          )
        ),
        open: !0,
        onCancel: () => Dt(null),
        width: 640,
        footer: t.createElement(
          "div",
          { style: { textAlign: "right" } },
          t.createElement(
            u,
            {
              onClick: () => Dt(null),
              style: { marginRight: 8 }
            },
            "取消"
          ),
          t.createElement(
            u,
            {
              type: "primary",
              loading: hn,
              disabled: hn,
              icon: j ? t.createElement(j) : void 0,
              style: je,
              onClick: async () => {
                await jl(De), Dt(null);
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
          De.description
        )
      ),
      // Skills manifest hint
      De.skills_manifest ? t.createElement(
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
      De.instructions ? t.createElement(
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
      De.drivers && Object.keys(De.drivers).length > 0 ? t.createElement(
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
          ...Object.entries(De.drivers).map(
            ([y, N]) => t.createElement(
              g,
              { key: y, color: "cyan", style: { fontSize: 11 } },
              `${y}${N && N.length > 0 ? ` (${N.join(", ")})` : ""}`
            )
          )
        )
      ) : null
    ) : null
  );
}
function ui() {
  try {
    const t = localStorage.getItem("language") || "";
    if (t) return t.split("-")[0];
  } catch {
  }
  return ((typeof navigator < "u" ? navigator.language : "") || "").split("-")[0] || "en";
}
const Jr = {
  zh: "您好，UGSci 智能助手在线。无论是油气藏分析、数值模拟还是工程决策，描述您的场景，我来交付结果。",
  en: "UGSci AI assistant is online. From reservoir analysis to numerical simulation and engineering decisions — describe your scenario and I'll deliver results.",
  ja: "UGSci AIアシスタントがオンラインです。油層解析、数値シミュレーション、エンジニアリングの意思決定など、シナリオを描写してください。結果をお届けします。",
  ru: "UGSci AI-ассистент онлайн. От анализа пласта до численного моделирования и инженерных решений — опишите свой сценарий, и я предоставлю результат.",
  vi: "Trợ lý AI UGSci đang trực tuyến. Từ phân tích mỏ, mô phỏng số đến ra quyết định kỹ thuật — mô tả kịch bản của bạn, tôi sẽ giao kết quả.",
  id: "Asisten AI UGSci sedang online. Dari analisis reservoir, simulasi numerik hingga keputusan engineering — jelaskan skenario Anda, saya akan memberikan hasilnya."
}, qr = {
  zh: { label: "能告诉我你都能做点什么吗？", value: "能告诉我你都能做点什么吗" },
  en: { label: "Can you tell me what you can do?", value: "Can you tell me what you can do?" },
  ja: { label: "あなたができることを教えてください", value: "あなたができることを教えてください" },
  ru: { label: "Расскажи, что ты умеешь делать?", value: "Расскажи, что ты умеешь делать?" },
  vi: { label: "Bạn có thể cho tôi biết bạn làm được gì không?", value: "Bạn có thể cho tôi biết bạn làm được gì không?" },
  id: { label: "Bisa cerita apa saja yang bisa Anda lakukan?", value: "Bisa cerita apa saja yang bisa Anda lakukan?" }
};
function mi() {
  const e = T(), t = e.React, { useEffect: n, useRef: r } = t, a = e.useSelectedAgent ? e.useSelectedAgent() : { id: "default" }, l = (a == null ? void 0 : a.id) || "default", s = r(null), i = r(null);
  return n(() => {
    if (s.current === l) return;
    s.current = l, Dn();
    const o = ui(), c = Jr[o] || Jr.en, u = qr[o] || qr.en;
    let f = !1;
    return (async () => {
      var d, m;
      try {
        const v = await pn(l);
        if (f) return;
        const g = Sa(v);
        if (i.current) {
          try {
            i.current();
          } catch {
          }
          i.current = null;
        }
        const p = window.QwenPaw;
        (d = p == null ? void 0 : p.chat) != null && d.welcome && (g.length > 0 ? (i.current = p.chat.welcome.set("ugsci", {
          description: c,
          prompts: g
        }), console.info(
          `[ugsci] Injected ${g.length} welcome prompts for agent "${l}"`
        )) : (i.current = p.chat.welcome.set("ugsci", {
          description: c,
          prompts: [u]
        }), console.info(
          `[ugsci] No skills for agent "${l}" — using default prompt`
        )));
      } catch (v) {
        console.warn(
          `[ugsci] Failed to inject welcome prompts for agent "${l}":`,
          v
        );
        const g = window.QwenPaw;
        if ((m = g == null ? void 0 : g.chat) != null && m.welcome && !f) {
          if (i.current) {
            try {
              i.current();
            } catch {
            }
            i.current = null;
          }
          i.current = g.chat.welcome.set("ugsci", {
            description: c,
            prompts: [u]
          });
        }
      }
    })(), () => {
      f = !0;
    };
  }, [l]), null;
}
const pi = 256;
let Ue = {};
const Rn = /* @__PURE__ */ new Set(), an = () => Rn.forEach((e) => e()), fi = (e) => (Rn.add(e), () => Rn.delete(e)), $t = /* @__PURE__ */ new Map();
function Kr(e, t) {
  const n = [];
  for (const l of t) {
    if (!l) continue;
    const s = Ue[Pt(e, l)] || Object.values(Ue).find((i) => i.uiId === l);
    s && n.push(s);
  }
  const r = `${e}::${t.join("\0")}`, a = $t.get(r);
  return a && a.length === n.length && a.every((l, s) => l === n[s]) ? a : ($t.set(r, n), n);
}
function Pt(e, t) {
  return `${e}::${t}`;
}
function ln(e) {
  return !e || typeof e != "object" ? null : e.ok === !0 && (e.kind === "genui" || e.kind === "genui_patch") ? e : e.genui && typeof e.genui == "object" ? ln(e.genui) : e.ui && typeof e.ui == "object" ? ln(e.ui.genui) : null;
}
function Tt(e) {
  if (!e || typeof e != "string") return null;
  try {
    const t = JSON.parse(e);
    if (Array.isArray(t)) {
      for (const n of t) {
        const r = (n == null ? void 0 : n.type) === "text" ? n.text : void 0, a = typeof r == "string" ? Tt(r) : ln(n);
        if (a) return a;
      }
      return null;
    }
    return ln(t);
  } catch {
    return null;
  }
}
function _t(e) {
  var t;
  if (!e || typeof e != "string") return null;
  try {
    const n = JSON.parse(e);
    if (Array.isArray(n)) {
      const r = (t = n.find((a) => (a == null ? void 0 : a.type) === "text")) == null ? void 0 : t.text;
      return typeof r == "string" ? _t(r) : null;
    }
    return n && n.ok === !1 ? n : null;
  } catch {
    return null;
  }
}
const Xr = /* @__PURE__ */ new Set(["plugin_call_output", "function_call_output", "tool_call_output", "mcp_call_output", "component_call_output"]), xn = /* @__PURE__ */ new Set(["emit_ui_tree", "emit_ui_patch"]);
function Xa(e) {
  var r, a, l, s;
  if (!Array.isArray(e)) return [];
  const t = [], n = (i, o = !1) => {
    var f, d, m;
    if (!i || typeof i != "object") return;
    if (Array.isArray(i)) {
      const v = o ? i.map((g) => {
        var p;
        return ((p = g == null ? void 0 : g.data) == null ? void 0 : p.name) ?? (g == null ? void 0 : g.name);
      }).filter((g) => !!g).map((g) => String(g)) : [];
      if (o && v.length) {
        const g = v.some((p) => xn.has(p));
        for (const p of i) {
          const h = ((f = p == null ? void 0 : p.data) == null ? void 0 : f.output) ?? (p == null ? void 0 : p.output) ?? ((d = p == null ? void 0 : p.data) == null ? void 0 : d.result) ?? (p == null ? void 0 : p.result) ?? ((m = p == null ? void 0 : p.data) == null ? void 0 : m.content) ?? (p == null ? void 0 : p.content);
          if (h == null) continue;
          const E = typeof h == "string" ? h : JSON.stringify(h), w = Tt(E) || (g ? _t(E) : null);
          w && t.push(w);
        }
      }
      i.forEach((g) => n(g));
      return;
    }
    const c = i;
    if (c.type === "tool_result") {
      const g = (Array.isArray(c.output) ? c.output : []).filter((E) => (E == null ? void 0 : E.type) === "text").map((E) => E.text), p = g.length ? g.join(`
`) : c.output, h = g.length ? g : [typeof p == "string" ? p : JSON.stringify(p)];
      for (const E of h) {
        const w = Tt(E) || (xn.has(String(c.name || "")) ? _t(E) : null);
        w && t.push(w);
      }
      return;
    }
    const u = Xr.has(String(c.type || ""));
    Object.entries(c).forEach(
      ([v, g]) => n(g, u && v === "content")
    );
  };
  n(e);
  for (const i of e) {
    if (!i || typeof i != "object") continue;
    const o = i;
    if (!Xr.has(String(o.type || "")) || !Array.isArray(o.content)) continue;
    const c = o.content, u = (a = (r = c[0]) == null ? void 0 : r.data) == null ? void 0 : a.name;
    if (!u) continue;
    const f = (s = (l = c[1]) == null ? void 0 : l.data) == null ? void 0 : s.output;
    if (f == null) continue;
    const d = typeof f == "string" ? f : JSON.stringify(f), m = Tt(d) || (xn.has(String(u)) ? _t(d) : null);
    m && t.push(m);
  }
  return Array.from(new Map(t.map((i) => [`${i.kind}:${i.ui_id}:${i.revision}`, i])).values());
}
function Ya(e) {
  var s;
  const t = Pt(e.sessionId, e.uiId), n = Object.entries(Ue).filter(([, i]) => i.uiId === e.uiId).sort(([, i], [, o]) => o.revision - i.revision), r = Ue[t] || ((s = n[0]) == null ? void 0 : s[1]);
  if (r && e.revision < r.revision) return;
  const a = { ...Ue };
  for (const [i] of n) i !== t && delete a[i];
  a[t] = r && e.revision === r.revision ? { ...r, ...e, tree: r.tree } : e;
  const l = Object.entries(a).sort(([, i], [, o]) => o.updatedAt - i.updatedAt);
  Ue = Object.fromEntries(l.slice(0, pi)), an();
}
function gi(e, t) {
  for (const n of Xa(t))
    !n.ui_id || !n.tree || Ya({
      schemaVersion: "1",
      uiId: n.ui_id,
      revision: n.revision || 1,
      tree: n.tree,
      sessionId: e,
      sourceToolCallId: n.tool_call_id,
      updatedAt: Date.now()
    });
}
const Qa = {
  setSnapshot: Ya,
  applyPatch(e, t, n, r) {
    var c, u;
    const a = (c = window.QwenPaw) == null ? void 0 : c.host, l = r || ((u = a == null ? void 0 : a.getCurrentSessionId) == null ? void 0 : u.call(a)) || "", s = Pt(l, e.ui_id), i = Ue[s] || Object.values(Ue).find((f) => f.uiId === e.ui_id);
    if (!i || n <= i.revision) return;
    Ue = { ...Object.fromEntries(Object.entries(Ue).filter(([, f]) => f.uiId !== e.ui_id)), [s]: { ...i, sessionId: l, tree: t, revision: n, updatedAt: Date.now() } }, an();
  },
  getSnapshot: (e, t) => Ue[Pt(e, t)],
  clearSession(e) {
    Ue = Object.fromEntries(Object.entries(Ue).filter(([, t]) => t.sessionId !== e));
    for (const t of [...$t.keys()])
      t.startsWith(`${e}::`) && $t.delete(t);
    an();
  },
  hydrateFromMessages: gi
};
function yi({ children: e }) {
  return e;
}
function hi() {
  return Qa;
}
function Ei(e, t) {
  var l, s;
  const n = (s = (l = window.QwenPaw) == null ? void 0 : l.host) == null ? void 0 : s.React;
  if (!n) throw new Error("useGenUiSnapshots: host React not available");
  const r = t.join("\0"), a = r === "" ? [] : r.split("\0");
  return n.useSyncExternalStore(
    fi,
    () => Kr(e, a),
    () => Kr(e, a)
  );
}
function bi(e) {
  Qa.clearSession(e);
}
function vi() {
  Ue = {}, $t.clear(), an();
}
function It(e) {
  var t;
  if (typeof e == "string") {
    if (e.trimStart().startsWith("["))
      try {
        return It(JSON.parse(e));
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
    if (n.output !== void 0) return It(n.output);
    if (n.content !== void 0) return It(n.content);
  }
  return e == null ? "" : JSON.stringify(e);
}
function wi(e) {
  const t = e.data;
  if (!t) return { resultText: "", status: "calling", toolName: "" };
  const n = t.status || "calling", r = t.content;
  if (!Array.isArray(r) || r.length === 0)
    return { resultText: "", status: n, toolName: "" };
  const a = r[0], l = a == null ? void 0 : a.data, s = (l == null ? void 0 : l.name) || "";
  if (r.length > 1) {
    const i = r[1], o = i == null ? void 0 : i.data, c = (o == null ? void 0 : o.output) ?? (o == null ? void 0 : o.content) ?? (i == null ? void 0 : i.output) ?? (i == null ? void 0 : i.content) ?? (o == null ? void 0 : o.result) ?? (i == null ? void 0 : i.result);
    if (c != null) return { resultText: It(c), status: n, toolName: s };
  }
  if (l != null && l.output) {
    const i = l.output;
    return { resultText: It(i), status: n, toolName: s };
  }
  return { resultText: "", status: n, toolName: s };
}
function Yr(e) {
  var m, v, g, p;
  const t = (m = window.QwenPaw) == null ? void 0 : m.host, n = t == null ? void 0 : t.React;
  if (!n) return null;
  const { resultText: r, status: a, toolName: l } = wi(e), s = a === "in_progress" || a === "calling", i = a === "failed" || a === "error", o = Tt(r), c = o ? null : _t(r);
  let u = 0;
  (v = o == null ? void 0 : o.tree) != null && v.root && (u = Za(o.tree.root));
  const f = l === "emit_ui_patch" || (o == null ? void 0 : o.kind) === "genui_patch", d = s ? f ? "📝 Patching UI Tree..." : "🎨 Generating UI Tree..." : i ? f ? "📝 UI Patch Error" : "🎨 UI Tree Error" : o ? f ? `📝 UI Patched (rev ${o.revision ?? "?"})` : `🎨 UI Tree (${u} nodes)` : f ? "📝 UI Patch" : "🎨 UI Tree";
  return n.createElement(
    "details",
    { open: s || i, style: { margin: "4px 0", border: "1px solid var(--ant-color-border, #d9d9d9)", borderRadius: 8, padding: "4px 8px", fontSize: 13 } },
    n.createElement(
      "summary",
      { style: { cursor: "pointer", display: "flex", alignItems: "center", gap: 6 } },
      n.createElement("span", null, f ? "📝" : "🎨"),
      n.createElement("span", null, d),
      o != null && o.ok ? n.createElement("span", { style: { fontSize: 11, color: "#999", marginLeft: "auto" } }, `ui_id: ${((g = o.ui_id) == null ? void 0 : g.slice(0, 16)) ?? ""}…`) : null
    ),
    i || c && !o ? n.createElement(
      "div",
      { style: { padding: "8px 12px", fontSize: 12 } },
      n.createElement("div", { style: { color: "var(--ant-color-error, #ff4d4f)", marginBottom: 4 } }, (c == null ? void 0 : c.message) || "Unknown error"),
      c != null && c.hint ? n.createElement("div", { style: { color: "#999" } }, `💡 ${c.hint}`) : null
    ) : o != null && o.ok ? n.createElement(
      "div",
      { style: { padding: "8px 12px", fontSize: 12, color: "#999" } },
      (p = o.tree) != null && p.root ? `GenUI 已在回复正文中展示（${u} 个节点，revision ${o.revision ?? 1}）。` : "GenUI 工具已完成，但没有可展示的树。"
    ) : n.createElement("pre", { style: { fontSize: 12, padding: "8px 12px", background: "rgba(0,0,0,0.03)", borderRadius: 8, overflow: "auto", maxHeight: 200 } }, r || "(waiting for result...)")
  );
}
function Za(e) {
  if (!e || typeof e != "object") return 0;
  let t = 1;
  if (Array.isArray(e.children)) for (const n of e.children) t += Za(n);
  return t;
}
function tn(e) {
  var t;
  if (typeof e == "string") {
    if (e.trimStart().startsWith("["))
      try {
        return tn(JSON.parse(e));
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
    if (n.output !== void 0) return tn(n.output);
    if (n.content !== void 0) return tn(n.content);
  }
  return e == null ? "" : JSON.stringify(e);
}
function Si(e) {
  var s;
  const t = e.data;
  if (!t) return { resultText: "", status: "calling", toolName: "" };
  const n = t.status || "calling", r = t.content;
  if (!Array.isArray(r) || r.length === 0)
    return { resultText: "", status: n, toolName: "" };
  const a = (s = r[0]) == null ? void 0 : s.data, l = (a == null ? void 0 : a.name) || "";
  if (r.length > 1) {
    const i = r[1], o = i == null ? void 0 : i.data, c = (o == null ? void 0 : o.output) ?? (o == null ? void 0 : o.content) ?? (i == null ? void 0 : i.output) ?? (i == null ? void 0 : i.content);
    if (c != null) return { resultText: tn(c), status: n, toolName: l };
  }
  return { resultText: "", status: n, toolName: l };
}
function Qr(e) {
  var u;
  const t = (u = window.QwenPaw) == null ? void 0 : u.host, n = t == null ? void 0 : t.React;
  if (!n) return null;
  const { resultText: r, status: a, toolName: l } = Si(e), s = l === "get_genui_guide", i = a === "in_progress" || a === "calling";
  let o = s ? "GenUI 指南" : "组件目录", c = r;
  try {
    const f = r ? JSON.parse(r) : null;
    if (f && typeof f == "object") {
      const d = f.components;
      Array.isArray(d) ? (o = `组件目录（${d.length} 个 kind）`, c = d.map((m) => m == null ? void 0 : m.kind).filter(Boolean).join(" · ")) : (f.purpose || f.layout_structure) && (o = "GenUI 指南", c = String(f.purpose || "布局与语法说明已返回，模型可按此编写 emit_ui_tree。"));
    }
  } catch {
  }
  return n.createElement(
    "details",
    { style: { margin: "4px 0", border: "1px solid var(--ant-color-border, #d9d9d9)", borderRadius: 8, padding: "4px 8px", fontSize: 13 } },
    n.createElement("summary", { style: { cursor: "pointer" } }, i ? s ? "查阅 GenUI 指南…" : "查阅组件目录…" : o),
    n.createElement("div", { style: { padding: "8px 4px", fontSize: 12, color: "#666", lineHeight: 1.5 } }, c || "(waiting…)")
  );
}
const xi = /* @__PURE__ */ new Set(["send_message"]), Zr = 1e4, ki = 500, ea = {};
function Ci() {
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
  return new Set(xi);
}
function Ti(e) {
  const t = Date.now(), n = ea[e] || 0;
  return t - n < ki ? (console.warn("[ugsci.genui] Action '" + e + "' throttled"), !0) : (ea[e] = t, !1);
}
function _i(e, t) {
  return e.replace(/\{\{\s*([\w.-]+)\s*\}\}/g, (n, r) => {
    const a = t[r];
    return a == null ? "" : typeof a == "string" ? a : JSON.stringify(a);
  });
}
function Mn(e, t = {}) {
  var l, s, i, o, c, u, f;
  let n;
  if (typeof e == "string") n = { type: e };
  else if (e && typeof e == "object") n = e;
  else return { ok: !1, message: "无效操作" };
  const r = n.type === "submit_form" ? "send_message" : n.type, a = Ci();
  if (!a.has(r))
    return console.warn(
      "[ugsci.genui] Action '" + n.type + "' not allowed (allowed: " + Array.from(a).join(", ") + ")"
    ), { ok: !1, message: "此操作未获允许" };
  if (Ti(r)) return { ok: !1, message: "操作过于频繁，请稍后重试" };
  if (r === "send_message") {
    const d = t.formValues || {};
    let m = ((l = n.payload) == null ? void 0 : l.content) || ((s = n.payload) == null ? void 0 : s.message) || "";
    const v = /\{\{\s*[\w.-]+\s*\}\}/.test(m);
    return m = _i(m, d).trim(), m && !v && Object.keys(d).length > 0 && (m += `
${Object.entries(d).map(([p, h]) => `${p}: ${typeof h == "string" ? h : JSON.stringify(h)}`).join(`
`)}`), !m && Object.keys(d).length > 0 && (m = `${t.formId ? `提交表单 ${t.formId}` : "提交表单"}
${Object.entries(d).map(([h, E]) => `${h}: ${typeof E == "string" ? E : JSON.stringify(E)}`).join(`
`)}`), !m || !m.trim() ? (console.warn("[ugsci.genui] send_message: content is empty"), { ok: !1, message: "消息内容为空" }) : m.length > Zr ? (console.warn("[ugsci.genui] send_message: content length " + m.length + " exceeds max " + Zr), { ok: !1, message: "消息内容过长" }) : !((c = (o = (i = window.QwenPaw) == null ? void 0 : i.chat) == null ? void 0 : o.sendMessage) != null && c.call(o, m)) ? (console.info("[ugsci.genui] send_message: could not find chat sender, content:", m), { ok: !1, message: "当前无法发送消息" }) : { ok: !0, message: "已提交" };
  }
  if (r === "open_url") {
    const d = ((u = n.payload) == null ? void 0 : u.url) || ((f = n.payload) == null ? void 0 : f.href) || "", m = typeof d == "string" ? d.trim() : "";
    return /^https?:\/\//i.test(m) ? (window.open(m, "_blank", "noopener,noreferrer"), { ok: !0, message: "已打开链接" }) : (console.warn("[ugsci.genui] open_url: only http(s) URLs are allowed"), { ok: !1, message: "仅允许 http(s) 链接" });
  }
  return { ok: !1, message: "尚未实现此操作" };
}
const Je = /* @__PURE__ */ new Map(), Ot = /* @__PURE__ */ new Map(), Ii = 128, Xt = /* @__PURE__ */ new Map();
function on(e) {
  return e.startsWith("http://") || e.startsWith("https://") || e.startsWith("data:") || e.startsWith("blob:");
}
function Ai(e) {
  return e ? !!(e.startsWith("/") || /^[A-Za-z]:[\\/]/.test(e) || e.startsWith("\\\\")) : !1;
}
function zi(e) {
  return e.startsWith("workspace://");
}
function $i(e) {
  return zi(e) ? e.slice(12) : e;
}
async function Pi(e) {
  if (!e) return null;
  if (on(e)) return e;
  if (Je.has(e))
    return Je.get(e) ?? null;
  if (Xt.has(e))
    return Xt.get(e);
  const t = Oi(e);
  Xt.set(e, t);
  try {
    const n = await t;
    if (!Je.has(e) && Je.size >= Ii) {
      const r = Je.keys().next().value;
      if (r !== void 0) {
        const a = Je.get(r);
        a != null && a.startsWith("blob:") && URL.revokeObjectURL(a), Je.delete(r);
      }
    }
    return Je.set(e, n), n && Ot.delete(e), n;
  } finally {
    Xt.delete(e);
  }
}
async function Oi(e) {
  const t = window.QwenPaw, n = t == null ? void 0 : t.host;
  if (!n) {
    const a = "宿主媒体 API 不可用。请在 QwenPaw 工作区中打开此内容，或改用 http(s)、data、blob URL。";
    return Ot.set(e, a), console.warn("[ugsci.genui]", a), null;
  }
  const r = $i(e);
  if (typeof n.resolveWorkspaceBlob == "function")
    try {
      const a = await n.resolveWorkspaceBlob(r);
      if (a) return a;
    } catch (a) {
      console.warn("[ugsci.genui] host.resolveWorkspaceBlob failed:", a);
    }
  try {
    return await Ri(r, n);
  } catch (a) {
    const l = a instanceof Error ? a.message : String(a);
    return Ot.set(
      e,
      `无法读取本地媒体：${l}。请确认文件位于当前工作区且文件预览 API 已启用。`
    ), console.warn(
      `[ugsci.genui] Failed to resolve media URL for '${e}':`,
      a
    ), null;
  }
}
async function Ri(e, t) {
  let n = null;
  const r = t == null ? void 0 : t.workspaceApi, a = t == null ? void 0 : t.chatApi;
  if (Ai(e) && (a != null && a.filePreviewUrl) ? n = a.filePreviewUrl(e) : r != null && r.getBinaryFileUrl && (n = r.getBinaryFileUrl(e)), !n)
    throw new Error("宿主未提供 workspaceApi.getBinaryFileUrl 或 chatApi.filePreviewUrl");
  const l = {}, s = t == null ? void 0 : t.buildAuthHeaders;
  if (typeof s == "function")
    try {
      const c = s();
      c && typeof c == "object" && Object.assign(l, c);
    } catch {
    }
  const i = await fetch(n, { headers: l });
  if (!i.ok)
    throw new Error(`HTTP ${i.status}: ${i.statusText}`);
  const o = await i.blob();
  return URL.createObjectURL(o);
}
function ta(e) {
  return e ? on(e) ? e : Je.get(e) ?? null : null;
}
function na(e) {
  return Ot.get(e) ?? null;
}
function Mi() {
  for (const e of Je.values())
    if (e && e.startsWith("blob:"))
      try {
        URL.revokeObjectURL(e);
      } catch {
      }
  Je.clear(), Ot.clear();
}
const el = [
  "Input",
  "NumberInput",
  "Select",
  "Textarea",
  "Switch",
  "Slider",
  "FileInput"
], ut = ["#1677ff", "#52c41a", "#faad14", "#ff4d4f", "#722ed1", "#13c2c2", "#eb2f96"], Li = /* @__PURE__ */ new Set([
  "Button",
  "InteractiveButton",
  "ToggleButton",
  "LinkButton"
]);
function Ee(e) {
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
function xt(e) {
  return Array.isArray(e) ? e : [];
}
function At(e) {
  return !!e;
}
function Rt(e) {
  const t = e.props || {}, n = Ee(t.name);
  if (n) return n;
  const r = Ee(t.label), a = r.match(/^\s*([a-e])(?:\b|\s|（|\()/i);
  return a ? a[1].toLowerCase() : r || Ee(e.nodeId);
}
function tl(e) {
  return el.includes(e);
}
function nl(e) {
  return Math.min(Math.max(He(e) || 2, 1), 4);
}
function Bi(e, t, n = 6) {
  const r = He(e);
  return Math.min(Math.max(r > 0 ? r : t, 1), n);
}
function Ui(e) {
  const n = (Ee(e) || "16:9").split(":"), r = Number(n[0]), a = Number(n[1]);
  return r > 0 && a > 0 ? `${r} / ${a}` : "16 / 9";
}
function ji(e) {
  return /^https?:\/\//i.test(Ee(e).trim());
}
function Ge(e, t) {
  const n = {}, r = `${He(t.gap) || 12}px`;
  if (e === "Stack")
    n.display = "flex", n.flexDirection = "column", n.gap = r, t.padding != null && (n.padding = `${He(t.padding)}px`);
  else if (e === "Row")
    n.display = "flex", n.flexDirection = "row", n.gap = r, t.align && (n.alignItems = Ee(t.align)), t.justify && (n.justifyContent = Ee(t.justify));
  else if (e === "Grid" || e === "FeatureGrid" || e === "KpiBoard" || e === "ImageGallery") {
    const a = e === "KpiBoard" ? 3 : e === "FeatureGrid" ? 2 : e === "ImageGallery" ? 3 : 2, l = e === "FeatureGrid" ? 4 : 6;
    n.display = "grid", n.gridTemplateColumns = `repeat(${Bi(t.columns, a, l)}, minmax(0, 1fr))`, n.gap = e === "ImageGallery" ? `${He(t.gap) || 8}px` : r;
  } else e === "ScrollArea" ? (n.maxHeight = `${He(t.maxHeight) || 300}px`, n.overflowY = "auto", t.padding != null && (n.padding = `${He(t.padding)}px`)) : e === "AspectBox" ? (n.aspectRatio = Ui(t.ratio), n.overflow = "hidden", n.borderRadius = "8px", n.display = "flex", n.justifyContent = "center", n.alignItems = "center") : e === "Spacer" && (n.height = `${He(t.size) || 16}px`);
  return n;
}
function Yn(e, t) {
  function n(f) {
    return typeof f == "string" ? f : f == null ? "" : String(f);
  }
  function r(f) {
    if (typeof f == "number" && Number.isFinite(f)) return f;
    if (typeof f == "string") {
      const d = Number(f);
      return Number.isFinite(d) ? d : 0;
    }
    return 0;
  }
  function a(f) {
    return Array.isArray(f) ? f : [];
  }
  const l = e.generator && typeof e.generator == "object" ? e.generator : {}, s = a(l.coefficients).map(n).filter(Boolean), i = n(l.type) === "polynomial" || s.length > 0;
  let o = a(e.categories).map(n), c = a(e.series);
  if (i && t) {
    const f = s.length > 0 ? s : ["a", "b", "c", "d", "e"], d = typeof l.xMin == "number" ? l.xMin : -3, m = typeof l.xMax == "number" ? l.xMax : 3, v = Math.min(Math.max(r(l.samples) || 61, 10), 400), g = Array.from({ length: v }, (h, E) => d + (m - d) * E / Math.max(v - 1, 1)), p = f.map((h) => r(t[h]));
    o = g.map((h) => Number(h.toFixed(2)).toString()), c = [{
      name: n(l.label) || "f(x)",
      values: g.map((h) => p.reduce((E, w, b) => E + w * Math.pow(h, p.length - b - 1), 0))
    }];
  }
  const u = c.map((f, d) => {
    const m = f && typeof f == "object" ? f : {};
    return {
      name: n(m.name) || `Series ${d + 1}`,
      values: a(m.values).map(r)
    };
  });
  return {
    title: n(e.title),
    chartType: n(e.chart) || "line",
    categories: o,
    series: u,
    height: r(e.height) || 200,
    showLegend: e.showLegend !== !1,
    empty: o.length === 0 || u.length === 0
  };
}
function rl(e, t, n = 640) {
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
    const m = t.series[0].values.map((w) => Math.abs(w)), v = m.reduce((w, b) => w + b, 0) || 1, g = n / 2, p = a / 2, h = Math.min(n, a) / 2 - 20;
    let E = -Math.PI / 2;
    if (m.forEach((w, b) => {
      const x = w / v * Math.PI * 2, M = g + h * Math.cos(E), D = p + h * Math.sin(E), $ = g + h * Math.cos(E + x), A = p + h * Math.sin(E + x), F = document.createElementNS(l.namespaceURI, "path");
      F.setAttribute("d", `M ${g} ${p} L ${M} ${D} A ${h} ${h} 0 ${x > Math.PI ? 1 : 0} 1 ${$} ${A} Z`), F.setAttribute("fill", r[b % r.length]), l.appendChild(F), E += x;
    }), e.appendChild(l), t.showLegend) {
      const w = document.createElement("div");
      w.className = "legend", m.forEach((b, x) => {
        const M = document.createElement("span"), D = document.createElement("i");
        D.style.background = r[x % r.length], M.append(D, document.createTextNode(`${t.categories[x] || `#${x + 1}`}: ${b}`)), w.appendChild(M);
      }), e.appendChild(w);
    }
    return;
  }
  const s = t.series.flatMap((m) => m.values), i = Math.max(...s, 0), o = Math.min(...s, 0), c = i - o || 1, u = (m) => a - 24 - (m - o) / c * (a - 44), f = (m) => 30 + m * (n - 50) / Math.max(t.categories.length - 1, 1), d = document.createElementNS(l.namespaceURI, "line");
  if (d.setAttribute("x1", "30"), d.setAttribute("x2", String(n - 15)), d.setAttribute("y1", String(u(0))), d.setAttribute("y2", String(u(0))), d.setAttribute("stroke", "#d9d9d9"), l.appendChild(d), t.series.forEach((m, v) => {
    const g = r[v % r.length];
    if (t.chartType === "bar") {
      const E = (n - 50) / Math.max(t.categories.length, 1), w = Math.max(1, E / t.series.length - 3);
      m.values.forEach((b, x) => {
        const M = document.createElementNS(l.namespaceURI, "rect"), D = Math.min(u(b), u(0)), $ = Math.max(u(b), u(0));
        M.setAttribute("x", String(30 + x * E + v * (w + 2))), M.setAttribute("y", String(D)), M.setAttribute("width", String(w)), M.setAttribute("height", String(Math.max(1, $ - D))), M.setAttribute("fill", g), l.appendChild(M);
      });
      return;
    }
    const p = m.values.map((E, w) => `${f(w)},${u(E)}`).join(" "), h = document.createElementNS(l.namespaceURI, "polyline");
    h.setAttribute("points", p), h.setAttribute("fill", t.chartType === "area" ? `${g}22` : "none"), h.setAttribute("stroke", g), h.setAttribute("stroke-width", "2"), l.appendChild(h);
  }), e.appendChild(l), t.showLegend) {
    const m = document.createElement("div");
    m.className = "legend", t.series.forEach((v, g) => {
      const p = document.createElement("span"), h = document.createElement("i");
      h.style.background = r[g % r.length], p.append(h, document.createTextNode(v.name)), m.appendChild(p);
    }), e.appendChild(m);
  }
}
const Ni = {
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
}, Di = {
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
function al(e) {
  const t = Ee(e).trim();
  if (!t) return { kind: "empty" };
  const n = t.toLowerCase().replace(/\s+/g, "-"), r = Di[n];
  return r ? { kind: "svg", paths: Ni[r] } : /^[\w.-]+$/.test(t) ? { kind: "empty" } : t.length <= 8 ? { kind: "emoji", text: t.slice(0, 8) } : { kind: "empty" };
}
function Fi(e, t, n = {}) {
  const r = al(t), a = n.size && n.size > 0 ? n.size : 16;
  if (e.setAttribute("aria-hidden", "true"), e.replaceChildren(), r.kind === "emoji") {
    e.textContent = r.text, e.style.fontSize = `${a}px`, n.color && (e.style.color = n.color);
    return;
  }
  if (r.kind === "empty") return;
  const l = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  l.setAttribute("width", String(a)), l.setAttribute("height", String(a)), l.setAttribute("viewBox", "0 0 24 24"), l.setAttribute("fill", "none"), l.setAttribute("stroke", n.color || "currentColor"), l.setAttribute("stroke-width", "2"), l.setAttribute("stroke-linecap", "round"), l.setAttribute("stroke-linejoin", "round"), l.setAttribute("focusable", "false"), l.style.display = "block";
  for (const s of r.paths) {
    const i = document.createElementNS("http://www.w3.org/2000/svg", "path");
    i.setAttribute("d", s), l.appendChild(i);
  }
  e.appendChild(l);
}
let kn = null;
function gn(e) {
  return kn || (kn = e.createContext(null)), kn;
}
function ll(e, t = {}) {
  if (tl(e.kind)) {
    const n = e.props || {}, r = n.value ?? n.checked;
    r !== void 0 && (t[Rt(e)] = r);
  }
  for (const n of e.children || []) ll(n, t);
  return t;
}
function Gi({
  node: e,
  children: t,
  onValuesChange: n
}) {
  var o, c;
  const r = (c = (o = window.QwenPaw) == null ? void 0 : o.host) == null ? void 0 : c.React;
  if (!r) return null;
  const a = r.useMemo(() => ll(e), [e]), [l, s] = r.useState(a);
  r.useEffect(
    () => s((u) => ({ ...a, ...u })),
    [a]
  ), r.useEffect(() => {
    n == null || n(l);
  }, [l, n]);
  const i = r.useMemo(
    () => ({
      values: l,
      setValue: (u, f) => s((d) => ({ ...d, [u]: f }))
    }),
    [l]
  );
  return r.createElement(
    gn(r).Provider,
    { value: i },
    t
  );
}
const Y = (e) => typeof e == "string" ? e : e != null ? String(e) : "", nt = (e) => typeof e == "number" ? e : typeof e == "string" && Number(e) || 0, rt = (e) => !!e, kt = (e) => Array.isArray(e) ? e : [], Hi = (e, t) => {
  const n = Object.keys(e), r = Object.keys(t);
  return n.length === r.length && n.every((a) => Object.is(e[a], t[a]));
}, ra = { xs: "12px", sm: "13px", base: "14px", lg: "16px" }, ke = {
  muted: "var(--ant-color-text-secondary, #8c8c8c)",
  default: "var(--ant-color-text, #000000d9)",
  primary: "var(--ant-color-primary, #1677ff)",
  success: "var(--ant-color-success, #52c41a)",
  warning: "var(--ant-color-warning, #faad14)",
  error: "var(--ant-color-error, #ff4d4f)"
}, Wi = new Set(el);
function Vi(e) {
  const t = [], n = (r) => {
    Wi.has(r.kind) && t.push(r);
    for (const a of r.children || []) n(a);
  };
  for (const r of e.children || []) n(r);
  return t;
}
let Cn = null;
function Qn(e) {
  return Cn || (Cn = e.createContext(null)), Cn;
}
function Ji({ node: e }) {
  var v;
  const t = (v = window.QwenPaw) == null ? void 0 : v.host, n = t == null ? void 0 : t.React, r = (t == null ? void 0 : t.antd) || {};
  if (!n) return null;
  const a = e.props || {}, l = n.useContext(gn(n)), [s, i] = n.useState({}), [o, c] = n.useState(null), u = n.useMemo(
    () => Vi(e),
    [e]
  ), f = n.useMemo(() => {
    const g = {};
    for (const p of u) {
      const h = p.props || {}, E = Rt(p);
      h.value !== void 0 ? g[E] = h.value : h.checked !== void 0 && (g[E] = h.checked);
    }
    return g;
  }, [u]);
  n.useEffect(() => i((g) => {
    const p = { ...f, ...g, ...(l == null ? void 0 : l.values) || {} };
    return Hi(g, p) ? g : p;
  }), [f, l == null ? void 0 : l.values]);
  const d = n.useMemo(() => ({ values: s, setValue: (g, p) => {
    c(null), i((h) => ({ ...h, [g]: p })), l == null || l.setValue(g, p);
  } }), [s, l]), m = () => {
    var h, E;
    const g = u.filter((w) => {
      var b;
      return (b = w.props) == null ? void 0 : b.required;
    }).find((w) => {
      const b = Rt(w), x = s[b];
      return x == null || x === "" || Array.isArray(x) && x.length === 0;
    });
    if (g) {
      c({ ok: !1, message: `${Y((h = g.props) == null ? void 0 : h.label) || Y((E = g.props) == null ? void 0 : E.name) || "必填项"}不能为空` });
      return;
    }
    const p = a.action && typeof a.action == "object" ? a.action : { type: "submit_form", payload: {} };
    c(Mn(p, { formValues: s, formId: Y(a.formId) || e.nodeId }));
  };
  return n.createElement(
    Qn(n).Provider,
    { value: d },
    n.createElement(
      "div",
      { style: { margin: "4px 0" } },
      a.title ? n.createElement("div", { style: { fontWeight: 600, marginBottom: 8 } }, Y(a.title)) : null,
      ...(e.children || []).map((g, p) => n.createElement(Mt(n), { key: g.nodeId || p, node: g })),
      n.createElement(r.Button || "button", { type: "primary", size: "small", style: { marginTop: 8 }, onClick: m }, Y(a.submitLabel) || "提交"),
      o ? n.createElement("div", { role: "status", style: { marginTop: 6, fontSize: 12, color: o.ok ? ke.success : ke.error } }, o.message) : null
    )
  );
}
function qi({ node: e, fieldType: t }) {
  var h, E, w;
  const n = (h = window.QwenPaw) == null ? void 0 : h.host, r = n == null ? void 0 : n.React, a = (n == null ? void 0 : n.antd) || {};
  if (!r) return null;
  const l = e.props || {}, s = r.useContext(Qn(r)), i = r.useContext(gn(r)), o = s || i, [c, u] = r.useState(l.value ?? l.checked ?? ""), f = Rt(e), d = l.value ?? l.checked ?? "", m = o ? ((E = o.values) == null ? void 0 : E[f]) ?? d : c, v = (b) => {
    const x = b != null && b.target ? t === "Switch" ? b.target.checked : b.target.value : b;
    o ? o.setValue(f, x) : u(x);
  }, g = (b) => r.createElement(
    "div",
    { style: { display: "flex", flexDirection: "column", gap: 4, margin: "4px 0" } },
    l.label && t !== "Switch" ? r.createElement("label", { style: { fontSize: 12, color: ke.muted } }, Y(l.label), l.required ? r.createElement("span", { style: { color: ke.error } }, " *") : null) : null,
    b,
    l.description ? r.createElement("span", { style: { fontSize: 11, color: ke.muted } }, Y(l.description)) : null
  ), p = Y(l.label) || Y(l.placeholder) || f;
  return t === "Input" ? g(r.createElement(a.Input || "input", { "aria-label": p, placeholder: Y(l.placeholder), value: m, onChange: v, size: "small" })) : t === "NumberInput" ? g(r.createElement(a.InputNumber || "input", { "aria-label": p, value: m, min: l.min, max: l.max, step: l.step, onChange: v, size: "small", style: { width: "100%" } })) : t === "Textarea" ? g(r.createElement(((w = a.Input) == null ? void 0 : w.TextArea) || "textarea", { "aria-label": p, placeholder: Y(l.placeholder), value: m, rows: nt(l.rows) || 3, onChange: v, style: { width: "100%" } })) : t === "Select" ? g(r.createElement(a.Select || "select", { "aria-label": p, placeholder: Y(l.placeholder), value: m || void 0, onChange: v, size: "small", style: { width: "100%" } }, kt(l.options).map((b, x) => {
    var M;
    return r.createElement(((M = a.Select) == null ? void 0 : M.Option) || "option", { key: x, value: Y(typeof b == "object" ? b.value : b) }, Y(typeof b == "object" ? b.label : b));
  }))) : t === "Switch" ? r.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8 } }, r.createElement(a.Switch || "input", { type: "checkbox", checked: !!m, onChange: v, size: "small" }), r.createElement("span", null, Y(l.label))) : t === "Slider" ? g(r.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8 } }, r.createElement(a.Slider || "input", { type: "range", value: nt(m), min: l.min ?? 0, max: l.max ?? 100, step: l.step ?? 1, onChange: v, style: { flex: 1 } }), r.createElement("span", { style: { minWidth: 32, fontSize: 12 } }, Y(m)))) : t === "FileInput" ? r.createElement(
    "label",
    { style: { display: "inline-flex", alignItems: "center", gap: 8, cursor: "pointer" } },
    r.createElement("span", null, Y(l.label) || "选择文件"),
    r.createElement("input", { type: "file", multiple: rt(l.multiple), accept: Y(l.accept) || void 0, onChange: (b) => o == null ? void 0 : o.setValue(f, Array.from(b.target.files || []).map((x) => ({ name: x.name, size: x.size, type: x.type }))) })
  ) : null;
}
function Tn({ node: e, link: t = !1, toggle: n = !1 }) {
  var m;
  const r = (m = window.QwenPaw) == null ? void 0 : m.host, a = r == null ? void 0 : r.React, l = (r == null ? void 0 : r.antd) || {};
  if (!a) return null;
  const s = e.props || {}, i = a.useContext(Qn(a)), [o, c] = a.useState(rt(s.checked)), [u, f] = a.useState(null), d = () => {
    n && c((v) => !v), s.action && typeof s.action == "object" ? f(Mn(s.action, { formValues: i == null ? void 0 : i.values, formId: i ? "form" : void 0 })) : t && typeof s.href == "string" && f(Mn({ type: "open_url", payload: { url: s.href } }));
  };
  return a.createElement(
    "span",
    { style: { display: "inline-flex", flexDirection: "column", gap: 3 } },
    a.createElement(l.Button || "button", { type: t ? "link" : (n ? o : Y(s.variant) === "primary") ? "primary" : "default", size: "small", disabled: rt(s.disabled), loading: rt(s.loading), onClick: d }, Y(s.label) || "Action"),
    u ? a.createElement("span", { role: "status", style: { fontSize: 11, color: u.ok ? ke.success : ke.error } }, u.message) : null
  );
}
let aa = null, Yt = null;
function Ki(e) {
  return Yt && aa === e || (aa = e, Yt = class extends e.Component {
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
  }), Yt;
}
function Xi({ node: e }) {
  var o;
  const t = (o = window.QwenPaw) == null ? void 0 : o.host;
  if (!(t != null && t.React)) return null;
  const n = t.React, r = t.antd || {}, a = Mt(n), l = e.props || {}, s = e.children || [];
  return Qi(n, r, e, l, s, () => s.map(
    (c, u) => n.createElement(a, { key: c.nodeId || u, node: c })
  ));
}
let Qt = null, la = null;
function Mt(e) {
  return Qt && la === e || (Qt = e.memo(Xi, (t, n) => t.node === n.node), la = e), Qt;
}
function Yi({ node: e }) {
  var r;
  const t = (r = window.QwenPaw) == null ? void 0 : r.host;
  if (!(t != null && t.React)) return null;
  const n = t.React;
  return n.createElement(
    Ki(n),
    { node: e },
    n.createElement(Mt(n), { node: e })
  );
}
function Qi(e, t, n, r, a, l) {
  var s, i;
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
      return e.createElement("div", { style: { fontSize: ra[Y(r.size)] || ra.base, color: ke[Y(r.color)] || ke.default, fontWeight: rt(r.bold) ? "bold" : "normal", lineHeight: 1.6 } }, Y(r.value));
    case "Heading": {
      const o = nl(r.level), c = { 1: "24px", 2: "20px", 3: "18px", 4: "16px" };
      return e.createElement(`h${o}`, { style: { fontSize: c[o], fontWeight: "bold", margin: "4px 0" } }, Y(r.value));
    }
    case "Divider":
      return e.createElement(t.Divider || "hr", r.label ? { children: Y(r.label) } : {});
    case "Markdown": {
      const o = (s = window.QwenPaw) == null ? void 0 : s.host, c = o == null ? void 0 : o.ReactMarkdown;
      if (c) {
        const u = o != null && o.remarkGfm ? [o.remarkGfm] : [];
        return e.createElement(
          "div",
          { className: "qwenpaw-genui-markdown" },
          e.createElement(c, { children: Y(r.content || r.value), remarkPlugins: u })
        );
      }
      return e.createElement("div", { style: { whiteSpace: "pre-wrap", lineHeight: 1.6 } }, Y(r.content || r.value));
    }
    case "CodeBlock":
      return e.createElement("pre", { style: { padding: 12, background: "var(--ant-color-fill-tertiary, rgba(0,0,0,0.04))", borderRadius: 8, overflow: "auto", fontSize: 13, fontFamily: "monospace" } }, Y(r.code));
    case "SectionHeader":
      return e.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8, marginBottom: 8 } }, r.icon ? e.createElement("span", { style: { fontSize: 20 } }, Y(r.icon)) : null, e.createElement("div", null, e.createElement("div", { style: { fontSize: 16, fontWeight: 600 } }, Y(r.title)), r.subtitle ? e.createElement("div", { style: { fontSize: 12, color: ke.muted } }, Y(r.subtitle)) : null));
    case "KeyValueList": {
      const o = kt(r.items);
      return e.createElement(
        "div",
        { style: { display: "flex", flexDirection: "column", gap: 4 } },
        ...o.map((c, u) => e.createElement(
          "div",
          { key: u, style: { display: "flex", justifyContent: "space-between", padding: "2px 0", borderBottom: u < o.length - 1 ? "1px solid var(--ant-color-border-secondary, #f0f0f0)" : "none" } },
          e.createElement("span", { style: { color: ke.muted, fontSize: 13 } }, Y(c.key)),
          e.createElement("span", { style: { fontWeight: 500, fontSize: 13 } }, Y(c.value))
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
      return e.createElement(t.Progress || "div", { percent: nt(r.value), size: "small" });
    case "Skeleton": {
      const o = nt(r.rows) || 3;
      return e.createElement(
        "div",
        { style: { display: "flex", flexDirection: "column", gap: 8 } },
        ...Array.from({ length: o }).map(
          (c, u) => e.createElement(t.Skeleton || "div", { key: u, active: rt(r.active), title: !1, paragraph: { rows: 1 } })
        )
      );
    }
    case "Avatar":
      return e.createElement(ec, {
        src: Y(r.src),
        name: Y(r.name),
        size: nt(r.size) || 32
      });
    case "Icon": {
      const o = al(r.name), c = nt(r.size) || 16, u = ke[Y(r.color)] || ke.default;
      return o.kind === "emoji" ? e.createElement("span", { "aria-hidden": !0, style: { fontSize: c, color: u, lineHeight: 1 } }, o.text) : o.kind === "svg" ? e.createElement("svg", {
        width: c,
        height: c,
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: u,
        strokeWidth: 2,
        strokeLinecap: "round",
        strokeLinejoin: "round",
        "aria-hidden": !0,
        focusable: "false",
        style: { display: "inline-block", verticalAlign: "middle" }
      }, ...o.paths.map((f, d) => e.createElement("path", { key: d, d: f }))) : e.createElement("span", { "aria-hidden": !0, style: { width: c, height: c, display: "inline-block" } });
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
      return e.createElement("div", { style: { margin: "4px 0" } }, r.title ? e.createElement("div", { style: { fontSize: 16, fontWeight: 600, marginBottom: 8 } }, Y(r.title)) : null, e.createElement("div", { style: Ge("KpiBoard", r) }, l()));
    case "FeatureGrid":
      return e.createElement("div", { style: { ...Ge("FeatureGrid", r), margin: "4px 0" } }, l());
    case "Stepper": {
      const o = kt(r.steps).map((u) => Y(u)), c = nt(r.current);
      return e.createElement(
        t.Steps || "div",
        { current: c, size: "small", style: { margin: "4px 0" } },
        ...o.map((u, f) => {
          var d;
          return e.createElement(((d = t.Steps) == null ? void 0 : d.Item) || "div", { key: f, title: u });
        })
      );
    }
    case "Table": {
      const o = kt(r.headers).map((d) => Y(d)), u = a.filter((d) => d.kind === "TableRow").map((d, m) => {
        const v = (d.children || []).filter((p) => p.kind === "TableCell"), g = { key: m };
        return o.forEach((p, h) => {
          var w, b;
          const E = (b = (w = v[h]) == null ? void 0 : w.props) == null ? void 0 : b.value;
          g[p] = E == null ? "" : Y(E);
        }), g;
      }), f = o.map((d) => ({ title: d, dataIndex: d, key: d }));
      return e.createElement(t.Table || "table", { dataSource: u, columns: f, size: rt(r.compact) ? "small" : "middle", pagination: !1, style: { margin: "4px 0" } });
    }
    case "List": {
      const o = a.filter((c) => c.kind === "ListItem");
      return e.createElement(
        t.List || "ul",
        { size: "small", style: { margin: "4px 0" } },
        o.map((c, u) => {
          var f, d, m;
          return e.createElement(((f = t.List) == null ? void 0 : f.Item) || "li", { key: u }, (d = c.props) != null && d.icon ? e.createElement("span", { style: { marginRight: 6 } }, Y(c.props.icon)) : null, Y((m = c.props) == null ? void 0 : m.value));
        })
      );
    }
    case "ImageGallery": {
      const o = a.filter((c) => c.kind === "Image");
      return e.createElement(
        "div",
        { style: { ...Ge("ImageGallery", r), margin: "4px 0" } },
        ...o.map((c, u) => {
          const f = c.props || {};
          return e.createElement(Ln, { key: u, src: Y(f.src), alt: Y(f.alt), style: { width: "100%", height: 120, objectFit: "cover", borderRadius: 8, cursor: "pointer" } });
        })
      );
    }
    case "Image":
      return e.createElement("div", null, e.createElement(Ln, { src: Y(r.src), alt: Y(r.alt), style: { maxWidth: "100%", borderRadius: rt(r.rounded) ? "8px" : void 0, maxHeight: r.maxHeight ? `${nt(r.maxHeight)}px` : void 0 } }), r.caption ? e.createElement("div", { style: { fontSize: 12, color: ke.muted } }, Y(r.caption)) : null);
    case "Chart":
      return e.createElement(Zi, { props: r });
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
      return e.createElement(qi, { node: n, fieldType: n.kind });
    case "Form":
      return e.createElement(Ji, { node: n });
    case "Chip":
      return e.createElement(t.Tag || "span", { color: Y(r.color) || "default", closable: !0, onClose: () => {
      }, children: Y(r.label) });
    case "ChipGroup": {
      const o = kt(r.items);
      return e.createElement("div", { style: { display: "flex", flexWrap: "wrap", gap: 4 } }, ...o.map((c, u) => e.createElement(t.Tag || "span", { key: u }, Y(c))));
    }
    case "Tabs": {
      const o = Mt(e), u = a.filter((f) => f.kind === "TabItem").map((f) => {
        var d, m, v;
        return {
          key: Y((d = f.props) == null ? void 0 : d.key) || Y((m = f.props) == null ? void 0 : m.tab),
          label: Y((v = f.props) == null ? void 0 : v.tab),
          children: (f.children || []).map((g, p) => e.createElement(o, { key: g.nodeId || p, node: g }))
        };
      });
      return t.Tabs ? e.createElement(t.Tabs, { items: u, defaultActiveKey: Y(r.activeKey) || ((i = u[0]) == null ? void 0 : i.key) }) : e.createElement("div", null, ...u.map((f, d) => e.createElement("div", { key: d }, e.createElement("div", { style: { fontWeight: 600, marginBottom: 4 } }, f.label), f.children)));
    }
    case "TabItem":
      return e.createElement("div", null, l());
    case "Accordion": {
      const o = Mt(e), c = a.filter((u) => u.kind === "AccordionItem");
      if (t.Collapse) {
        const u = c.map((f) => {
          var d, m, v;
          return {
            key: Y((d = f.props) == null ? void 0 : d.key) || Y((m = f.props) == null ? void 0 : m.header),
            label: Y((v = f.props) == null ? void 0 : v.header),
            children: (f.children || []).map((g, p) => e.createElement(o, { key: g.nodeId || p, node: g }))
          };
        });
        return e.createElement(t.Collapse, { items: u });
      }
      return e.createElement("div", null, ...c.map((u, f) => {
        var d;
        return e.createElement("details", { key: f }, e.createElement("summary", { style: { fontWeight: 600, cursor: "pointer", padding: "4px 0" } }, Y((d = u.props) == null ? void 0 : d.header)), e.createElement("div", { style: { paddingLeft: 12 } }, (u.children || []).map((m, v) => e.createElement(o, { key: m.nodeId || v, node: m }))));
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
function Zi({ props: e }) {
  var M, D;
  const t = (D = (M = window.QwenPaw) == null ? void 0 : M.host) == null ? void 0 : D.React;
  if (!t) return null;
  const n = t.useContext(gn(t)), r = Yn(e, n == null ? void 0 : n.values), a = r.chartType, l = r.title, s = r.categories, i = r.series, o = r.height, c = r.showLegend, u = 400;
  if (r.empty)
    return t.createElement("div", { style: { padding: 12, color: ke.muted, fontSize: 12 } }, "Chart: no data");
  if (a === "pie") {
    const $ = i[0].values.map((z) => Math.abs(z)), A = $.reduce((z, I) => z + I, 0) || 1, F = u / 2, V = o / 2, U = Math.min(u, o) / 2 - 20;
    let k = -Math.PI / 2;
    const S = $.map((z, I) => {
      const W = z / A * 2 * Math.PI, j = F + U * Math.cos(k), G = V + U * Math.sin(k), O = F + U * Math.cos(k + W), P = V + U * Math.sin(k + W), ee = W > Math.PI ? 1 : 0, oe = `M ${F} ${V} L ${j} ${G} A ${U} ${U} 0 ${ee} 1 ${O} ${P} Z`;
      return k += W, { path: oe, color: ut[I % ut.length], label: s[I] || `#${I + 1}`, val: z };
    });
    return t.createElement(
      "div",
      { style: { margin: "4px 0" } },
      l ? t.createElement("div", { style: { fontSize: 13, fontWeight: 600, marginBottom: 4 } }, l) : null,
      t.createElement(
        "svg",
        { width: u, height: o, style: { maxWidth: "100%" } },
        ...S.map((z, I) => t.createElement("path", { key: I, d: z.path, fill: z.color, stroke: "#fff", strokeWidth: 1 }))
      ),
      c ? t.createElement(
        "div",
        { style: { display: "flex", flexWrap: "wrap", gap: 8, marginTop: 4, fontSize: 11 } },
        ...S.map((z, I) => t.createElement(
          "span",
          { key: I, style: { display: "flex", alignItems: "center", gap: 4 } },
          t.createElement("span", { style: { display: "inline-block", width: 10, height: 10, borderRadius: 2, background: z.color } }),
          `${z.label}: ${z.val}`
        ))
      ) : null
    );
  }
  const f = i.flatMap(($) => $.values), d = Math.max(...f, 0), m = Math.min(...f, 0), v = d - m || 1, g = s.length > 0 ? (u - 40) / s.length : 0, p = i.length > 0 ? Math.max(1, g / i.length - 2) : 0, h = s.length > 1 ? (u - 40) / (s.length - 1) : 0, E = Math.max(1, Math.ceil(s.length / 8)), w = ($) => o - 20 - ($ - m) / v * (o - 40), b = w(0), x = ($) => 30 + $ * h;
  return t.createElement(
    "div",
    { style: { margin: "4px 0" } },
    l ? t.createElement("div", { style: { fontSize: 13, fontWeight: 600, marginBottom: 4 } }, l) : null,
    t.createElement(
      "svg",
      { width: u, height: o, style: { maxWidth: "100%" } },
      ...[0, 0.25, 0.5, 0.75, 1].map(($, A) => {
        const F = o - 20 - $ * (o - 40);
        return t.createElement("line", { key: `g${A}`, x1: 30, y1: F, x2: u - 10, y2: F, stroke: "var(--ant-color-border-secondary, #f0f0f0)", strokeWidth: 1 });
      }),
      ...s.map(($, A) => A % E === 0 || A === s.length - 1 ? t.createElement("text", { key: `x${A}`, x: x(A), y: o - 6, fontSize: 10, fill: ke.muted, textAnchor: "middle" }, $.length > 6 ? $.slice(0, 6) + "…" : $) : null),
      ...i.map(($, A) => {
        const F = ut[A % ut.length];
        if (a === "bar")
          return $.values.map((k, S) => t.createElement("rect", {
            key: `b${A}-${S}`,
            x: 30 + S * g + A * (p + 2) + 1,
            y: Math.min(w(k), b),
            width: p,
            height: Math.abs(b - w(k)),
            fill: F,
            rx: 2
          }));
        const V = $.values.map((k, S) => `${x(S)},${w(k)}`).join(" "), U = [t.createElement("polyline", { key: `l${A}`, points: V, fill: "none", stroke: F, strokeWidth: 2 })];
        if (a === "area") {
          const k = `${x(0)},${o - 20} ${V} ${x($.values.length - 1)},${o - 20}`;
          U.unshift(t.createElement("polygon", { key: `a${A}`, points: k, fill: F, opacity: 0.15 }));
        }
        return U;
      })
    ),
    c ? t.createElement(
      "div",
      { style: { display: "flex", flexWrap: "wrap", gap: 8, marginTop: 4, fontSize: 11 } },
      ...i.map(($, A) => t.createElement(
        "span",
        { key: A, style: { display: "flex", alignItems: "center", gap: 4 } },
        t.createElement("span", { style: { display: "inline-block", width: 10, height: 10, borderRadius: 2, background: ut[A % ut.length] } }),
        $.name
      ))
    ) : null
  );
}
function Ln(e) {
  var c;
  const t = (c = window.QwenPaw) == null ? void 0 : c.host, n = t == null ? void 0 : t.React;
  if (!n) return null;
  const { useState: r, useEffect: a } = n, [l, s] = r(
    ta(e.src) || (on(e.src) ? e.src : null)
  ), [i, o] = r(
    na(e.src)
  );
  return a(() => {
    if (!e.src) return;
    if (on(e.src)) {
      s(e.src), o(null);
      return;
    }
    const u = ta(e.src);
    if (u) {
      s(u), o(null);
      return;
    }
    s(null), o(null);
    let f = !1;
    return Pi(e.src).then((d) => {
      f || (s(d), o(d ? null : na(e.src)));
    }), () => {
      f = !0;
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
        color: i ? ke.error : ke.muted,
        fontSize: 12,
        background: "var(--ant-color-fill-tertiary, rgba(0,0,0,0.04))",
        borderRadius: 8
      }
    },
    i ? `媒体加载失败：${i}` : "正在解析图片…"
  );
}
function ec(e) {
  var a, l, s;
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
    ((s = (l = e.name) == null ? void 0 : l.charAt(0)) == null ? void 0 : s.toUpperCase()) || ""
  ) : null;
}
const tc = `#genui-root { max-width: 960px; margin: auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px; background: #fff; box-shadow: 0 8px 30px rgba(0,0,0,.05); }
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
@media print { body { padding: 0; } }`, oa = {
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
function nc(e) {
  return e.replace(/[&<>"']/g, (t) => t === "&" ? "&amp;" : t === "<" ? "&lt;" : t === ">" ? "&gt;" : t === '"' ? "&quot;" : "&#39;");
}
function rc(e) {
  return JSON.stringify(e).replace(/</g, "\\u003c");
}
function Q(e, t = "", n) {
  const r = document.createElement(e);
  return t && (r.className = t), n != null && n !== "" && (r.textContent = Ee(n)), r;
}
function Zt(e, t) {
  Object.assign(e.style, t);
}
function wt(e, t, n) {
  for (const r of t || []) e.appendChild(Zn(r, n));
  return e;
}
function sa(e, t, n) {
  return t && e.appendChild(Q("div", "muted small", t)), e.appendChild(Q("div", "display-value", n)), e;
}
function ol(e, t, n, r) {
  const a = Ee(e);
  if (r.missing.has(a)) {
    const s = Q("div", `media-unavailable ${n}`.trim(), "此媒体未能离线嵌入");
    return s.setAttribute("role", "img"), s.setAttribute("aria-label", Ee(t)), s;
  }
  const l = Q("img", n);
  return l.src = r.media[a] || a, l.alt = Ee(t), l;
}
function ac(e, t, n) {
  return e ? ol(e, t, "avatar", n) : Q("span", "avatar avatar-fallback", Ee(t).charAt(0).toUpperCase());
}
function lc(e) {
  const t = Q("div", "markdown");
  let n = null;
  for (const r of Ee(e).split(/\r?\n/)) {
    const a = r.match(/^(#{1,4})\s+(.*)$/), l = r.match(/^\s*[-*]\s+(.*)$/);
    a ? (n = null, t.appendChild(Q(`h${a[1].length}`, "", a[2]))) : l ? (n || (n = Q("ul"), t.appendChild(n)), n.appendChild(Q("li", "", l[1]))) : r.trim() ? (n = null, t.appendChild(Q("p", "", r))) : (n = null, t.appendChild(document.createElement("br")));
  }
  return t;
}
function oc(e, t) {
  const n = e.props || {}, r = e.kind, a = Rt(e), l = Q("label", "field");
  n.label && r !== "Switch" && l.appendChild(Q("span", "field-label", `${Ee(n.label)}${n.required ? " *" : ""}`));
  let s;
  if (r === "Textarea") {
    const o = Q("textarea");
    o.rows = He(n.rows) || 3, o.placeholder = Ee(n.placeholder), s = o;
  } else if (r === "Select") {
    const o = Q("select");
    for (const c of xt(n.options)) {
      const u = Q("option"), f = c && typeof c == "object" ? c : null;
      u.value = Ee(f ? f.value : c), u.textContent = Ee(f ? f.label : c), o.appendChild(u);
    }
    s = o;
  } else {
    const o = Q("input");
    o.type = r === "Slider" ? "range" : r === "Switch" ? "checkbox" : r === "NumberInput" ? "number" : r === "FileInput" ? "file" : "text", n.min != null && (o.min = Ee(n.min)), n.max != null && (o.max = Ee(n.max)), n.step != null && (o.step = Ee(n.step)), r === "FileInput" ? (n.accept && (o.accept = Ee(n.accept)), o.multiple = At(n.multiple)) : o.placeholder = Ee(n.placeholder), s = o;
  }
  const i = Object.prototype.hasOwnProperty.call(t.values, a) ? t.values[a] : n.value != null ? n.value : n.checked != null ? n.checked : "";
  if (r === "Switch") {
    const o = s;
    o.checked = At(i), o.checked ? o.setAttribute("checked", "") : o.removeAttribute("checked");
  } else if (r === "Textarea")
    s.value = Ee(i), s.textContent = Ee(i);
  else if (r === "Select") {
    const o = Ee(i);
    s.value = o;
    for (const c of Array.from(s.options))
      c.value === o ? c.setAttribute("selected", "") : c.removeAttribute("selected");
  } else r !== "FileInput" && (s.value = Ee(i), s.setAttribute("value", Ee(i)));
  if (s.setAttribute("data-genui-field", a), s.setAttribute("data-genui-kind", r), r === "Switch") {
    const o = Q("span", "switch-line");
    o.append(s, Q("span", "", n.label)), l.appendChild(o);
  } else if (r === "Slider") {
    const o = Q("span", "slider-line");
    o.append(s, Q("output", "slider-value", i)), l.appendChild(o);
  } else
    l.appendChild(s);
  return n.description && l.appendChild(Q("small", "description", n.description)), l;
}
function Zn(e, t) {
  var l, s, i, o, c, u, f;
  if (!e || typeof e != "object") return Q("div");
  const n = e.props || {}, r = e.children || [];
  if (tl(e.kind)) return oc(e, t);
  if (e.kind === "Chart") {
    const d = Q("div", "chart");
    return d.setAttribute("data-genui-chart", JSON.stringify(n)), rl(d, Yn(n, t.values)), d;
  }
  if (e.kind === "Heading") return Q(`h${nl(n.level)}`, "", n.value);
  if (e.kind === "Text") return Q("div", At(n.bold) ? "text bold" : "text", n.value);
  if (e.kind === "Markdown") return lc(n.content || n.value);
  if (e.kind === "CodeBlock") return Q("pre", "code", n.code);
  if (e.kind === "SectionHeader") {
    const d = Q("div", "section-header");
    n.icon && d.appendChild(Q("span", "section-icon", n.icon));
    const m = Q("div");
    return m.appendChild(Q("strong", "", n.title)), n.subtitle && m.appendChild(Q("div", "muted small", n.subtitle)), d.appendChild(m), d;
  }
  if (e.kind === "KeyValueList") {
    const d = Q("dl", "key-values");
    for (const m of xt(n.items)) {
      const v = m && typeof m == "object" ? m : {};
      d.append(Q("dt", "", v.key), Q("dd", "", v.value));
    }
    return d;
  }
  if (e.kind === "Divider") {
    const d = Q("div", "divider");
    return n.label && d.appendChild(Q("span", "", n.label)), d;
  }
  if (e.kind === "Spacer") {
    const d = Q("div");
    return Zt(d, Ge("Spacer", n)), d;
  }
  if (e.kind === "Tabs") {
    const d = Q("div", "tabs");
    d.setAttribute("data-genui-tabs", "1");
    const m = Q("div", "tab-buttons"), v = Q("div");
    return r.filter((p) => p.kind === "TabItem").forEach((p, h) => {
      var E;
      m.appendChild(Q("button", h ? "" : "active", (E = p.props) == null ? void 0 : E.tab)), v.appendChild(wt(Q("div", h ? "tab-panel hidden" : "tab-panel"), p.children, t));
    }), d.append(m, v), d;
  }
  if (e.kind === "Accordion") {
    const d = Q("div");
    for (const m of r.filter((v) => v.kind === "AccordionItem")) {
      const v = Q("details");
      v.append(Q("summary", "", (l = m.props) == null ? void 0 : l.header), wt(Q("div", "accordion-body"), m.children, t)), d.appendChild(v);
    }
    return d;
  }
  if (e.kind === "Form") {
    const d = Q("div", "stack form");
    n.title && d.appendChild(Q("div", "card-title", n.title)), wt(d, r, t);
    const m = Q("button", "button", Ee(n.submitLabel) || "提交");
    return m.setAttribute("data-genui-submit", "1"), d.appendChild(m), d;
  }
  if (Li.has(e.kind)) {
    const d = Q("button", e.kind === "LinkButton" ? "link-button" : "button", Ee(n.label) || "Action");
    return At(n.disabled) && (d.disabled = !0), d.setAttribute("data-genui-action", e.kind), e.kind === "LinkButton" && ji(n.href) && d.setAttribute("data-genui-href", Ee(n.href).trim()), d;
  }
  if (e.kind === "Image") {
    const d = Q("figure");
    return d.appendChild(ol(n.src, n.alt, "", t)), n.caption && d.appendChild(Q("figcaption", "", n.caption)), d;
  }
  if (e.kind === "ImageGallery") {
    const d = Q("div", "image-gallery");
    Zt(d, Ge("ImageGallery", n));
    for (const m of r.filter((v) => v.kind === "Image"))
      d.appendChild(Zn(m, t));
    return d;
  }
  if (e.kind === "Avatar") return ac(n.src, n.name, t);
  if (e.kind === "Badge" || e.kind === "Tag" || e.kind === "Chip")
    return Q("span", "tag", n.value || n.label);
  if (e.kind === "Progress") {
    const d = Q("progress");
    return d.max = 100, d.value = He(n.value), d;
  }
  if (e.kind === "Stat") {
    const d = Q("div", "stat");
    return d.append(Q("span", "muted small", n.label), Q("strong", "stat-value", n.value)), n.delta && d.appendChild(Q("span", `small trend-${Ee(n.trend)}`, n.delta)), d;
  }
  if (e.kind === "DataCard" || e.kind === "MetricCard") {
    const d = Q("div", "card metric-card"), m = sa(Q("div"), n.title, n.value);
    return n.delta && m.appendChild(Q("div", `small trend-${Ee(n.trend)}`, `${Ee(n.delta)}${n.period ? ` ${Ee(n.period)}` : ""}`)), d.appendChild(m), n.icon && d.appendChild(Q("span", "metric-icon", n.icon)), d;
  }
  if (e.kind === "TimelineCard") {
    const d = Q("div", "card timeline");
    return d.append(Q("i", `timeline-dot status-${Ee(n.status)}`), sa(Q("div"), n.title, n.date)), n.description && d.appendChild(Q("div", "small", n.description)), d;
  }
  if (e.kind === "Stepper") {
    const d = Q("ol", "stepper");
    return xt(n.steps).forEach((m, v) => {
      d.appendChild(Q("li", v <= He(n.current) ? "active" : "", m));
    }), d;
  }
  if (e.kind === "Table") {
    const d = Q("table", "data-table"), m = Q("thead"), v = Q("tr");
    for (const p of xt(n.headers)) v.appendChild(Q("th", "", p));
    m.appendChild(v);
    const g = Q("tbody");
    for (const p of r.filter((h) => h.kind === "TableRow")) {
      const h = Q("tr", (s = p.props) != null && s.highlight ? "highlight" : "");
      for (const E of (p.children || []).filter((w) => w.kind === "TableCell")) {
        const w = Q("td", (i = E.props) != null && i.bold ? "bold" : "", (o = E.props) == null ? void 0 : o.value);
        (c = E.props) != null && c.align && (w.style.textAlign = Ee(E.props.align)), h.appendChild(w);
      }
      g.appendChild(h);
    }
    return d.append(m, g), d;
  }
  if (e.kind === "List") {
    const d = Q(At(n.ordered) ? "ol" : "ul", "data-list");
    for (const m of r.filter((v) => v.kind === "ListItem"))
      d.appendChild(Q("li", "", `${(u = m.props) != null && u.icon ? `${Ee(m.props.icon)} ` : ""}${Ee((f = m.props) == null ? void 0 : f.value)}`));
    return d;
  }
  if (e.kind === "ChipGroup") {
    const d = Q("div", "chips");
    for (const m of xt(n.items)) d.appendChild(Q("span", "tag", m));
    return d;
  }
  if (e.kind === "Skeleton") {
    const d = Q("div", "skeletons");
    for (let m = 0; m < (He(n.rows) || 3); m += 1) d.appendChild(Q("i", "skeleton"));
    return d;
  }
  if (e.kind === "Icon") {
    const d = Q("span", "icon");
    return Fi(d, n.name, { size: He(n.size) || 16 }), d;
  }
  if (e.kind === "JsonDebug") {
    const d = Q("details");
    return d.append(
      Q("summary", "", Ee(n.label) || "Debug JSON"),
      Q("pre", "code", JSON.stringify(n.data == null ? n : n.data, null, 2))
    ), d;
  }
  if (e.kind === "KpiBoard") {
    const d = Q("div", "stack");
    n.title && d.appendChild(Q("div", "card-title", n.title));
    const m = Q("div", "grid");
    return Zt(m, Ge("KpiBoard", n)), wt(m, r, t), d.appendChild(m), d;
  }
  if (!Object.prototype.hasOwnProperty.call(oa, e.kind))
    return Q("div", "unknown-component", `Unknown component: ${Ee(e.kind)}`);
  const a = Q("div", oa[e.kind]);
  return Zt(a, Ge(e.kind, n)), e.kind === "Card" && n.title && a.appendChild(Q("div", "card-title", n.title)), e.kind === "Card" && n.subtitle && a.appendChild(Q("div", "muted small card-subtitle", n.subtitle)), (e.kind === "Alert" || e.kind === "AlertCard" || e.kind === "Callout") && (n.title || n.message) ? (n.title && a.appendChild(Q("strong", "", n.title)), n.message && a.appendChild(Q("div", "", n.message))) : wt(a, r, t), a;
}
function ia(e, t) {
  const n = Function.prototype.toString.call(e).replace(/^export\s+/, "").trim();
  if (!n.includes("{")) throw new Error(`cannot serialize ${t}`);
  return `var ${t} = (${n});`;
}
function sc() {
  return `(function () {
  "use strict";
  ${ia(Yn, "resolveChartModel")}
  ${ia(rl, "paintChartElement")}
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
function ic(e, t = {}, n = { sources: {}, missing: [] }) {
  const r = Q("main");
  return r.id = "genui-root", r.appendChild(Zn(e, {
    values: t,
    media: n.sources || {},
    missing: new Set(n.missing || [])
  })), r;
}
function sl(e, t = {}, n = { sources: {}, missing: [] }, r = "GenUI") {
  const a = ic(e, t, n);
  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${nc(String(r || "GenUI").slice(0, 120))}</title>
  <style>
    :root { color-scheme: light; }
    html, body { margin: 0; padding: 0; background: #f5f7fa; color: #1f2329; }
    body { padding: 24px; font-family: system-ui, -apple-system, "Segoe UI", sans-serif; }
    *, *::before, *::after { box-sizing: border-box; }
    ${tc}
  </style>
</head>
<body>${a.outerHTML}
<script id="genui-values-data" type="application/json">${rc(t)}<\/script>
<script>${sc()}<\/script></body>
</html>`;
}
function il(e, t) {
  const n = document.createElement("a");
  n.download = t, n.href = e, n.click();
}
async function cc(e, t) {
  const { toPng: n } = await Promise.resolve().then(() => zd), r = await n(e, {
    cacheBust: !0,
    pixelRatio: Math.min(window.devicePixelRatio || 1, 2),
    backgroundColor: "#ffffff"
  });
  il(r, `${t}.png`), console.info("[ugsci.genui] PNG export created", { filename: t, via: "html-to-image" });
}
function dc(e) {
  return new Promise((t, n) => {
    const r = new FileReader();
    r.onload = () => t(String(r.result || "")), r.onerror = () => n(r.error || new Error("media encoding failed")), r.readAsDataURL(e);
  });
}
async function uc(e) {
  const t = e.currentSrc || e.src;
  if (!t) return null;
  if (t.startsWith("data:")) return t;
  try {
    const n = await fetch(t);
    return n.ok ? await dc(await n.blob()) : null;
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
async function cl(e) {
  const t = {}, n = [], r = Array.from(e.querySelectorAll("img[data-genui-media-source]"));
  return await Promise.all(r.map(async (a) => {
    const l = a.dataset.genuiMediaSource || "", s = await uc(a);
    l && (s ? t[l] = s : n.push(l));
  })), { sources: t, missing: Array.from(new Set(n)) };
}
async function mc(e, t, n, r, a = r) {
  const l = await cl(e), s = sl(t, n, l, a), i = new Blob([s], { type: "text/html;charset=utf-8" }), o = URL.createObjectURL(i);
  il(o, `${r}.html`), setTimeout(() => URL.revokeObjectURL(o), 1e3), l.missing.length && console.warn("[ugsci.genui] HTML export has media that could not be embedded", { filename: r, missing: l.missing }), console.info("[ugsci.genui] HTML export created", { filename: r, bytes: i.size, embeddedMedia: Object.keys(l.sources).length, missingMedia: l.missing.length });
}
async function pc(e, t, n, r) {
  const a = await cl(e), l = sl(t, n, a, r), s = window.open("", "_blank", "noopener,noreferrer");
  if (!s) throw new Error("print window was blocked");
  s.document.open(), s.document.write(l), s.document.close(), await new Promise((i) => {
    const o = () => i();
    if (s.document.readyState === "complete") {
      window.setTimeout(o, 50);
      return;
    }
    s.addEventListener("load", o, { once: !0 }), window.setTimeout(o, 400);
  }), s.focus(), s.print(), s.close(), a.missing.length && console.warn("[ugsci.genui] PDF print has media that could not be embedded", { missing: a.missing });
}
const fc = [], gt = /* @__PURE__ */ new Map();
function gc(e) {
  gt.set(e, (gt.get(e) || 0) + 1);
}
function yc(e) {
  const t = (gt.get(e) || 1) - 1;
  t > 0 ? gt.set(e, t) : gt.delete(e);
}
function hc(e) {
  return (gt.get(e) || 0) > 0;
}
function Ec({ data: e }) {
  var m, v;
  const t = (m = window.QwenPaw) == null ? void 0 : m.host, n = t == null ? void 0 : t.React;
  if (!n) return null;
  const r = hi(), a = n.useRef(/* @__PURE__ */ new Map()), l = ((v = t.getCurrentSessionId) == null ? void 0 : v.call(t)) || "__current_chat__", s = Array.isArray(e.output) ? e.output : fc, i = n.useMemo(
    () => Xa(s),
    [s]
  );
  n.useEffect(() => {
    for (const g of i) {
      if (!g.ui_id || !g.tree) continue;
      const p = r.getSnapshot(l, g.ui_id);
      p && p.revision >= (g.revision || 1) || r.setSnapshot({
        schemaVersion: "1",
        uiId: g.ui_id,
        revision: g.revision || 1,
        tree: g.tree,
        sessionId: l,
        sourceToolCallId: g.tool_call_id,
        updatedAt: Date.now()
      });
    }
  }, [i, l]);
  const o = n.useMemo(
    () => i.filter((g) => g.kind === "genui" && !!g.ui_id).map((g) => g.ui_id),
    [i]
  ), c = o.join("\0");
  n.useEffect(() => {
    for (const g of o) gc(g);
    return () => {
      for (const g of o) yc(g);
    };
  }, [c]);
  const u = n.useMemo(
    () => i.map((g) => g.ui_id).filter((g) => !!g),
    [i]
  ), d = Ei(l, u).filter(
    (g) => (
      // Only include snapshots whose ui_id appears in this response's results
      i.some(
        (p) => p.ui_id === g.uiId && (p.kind === "genui" || p.kind === "genui_patch" && !hc(g.uiId))
      )
    )
  ).sort((g, p) => g.updatedAt - p.updatedAt);
  return d.length === 0 ? null : n.createElement(
    "div",
    { className: "qwenpaw-genui-inline", style: { marginTop: 8, marginBottom: 8 } },
    ...d.map(
      (g) => n.createElement(
        "div",
        {
          key: Pt(g.sessionId, g.uiId),
          className: "qwenpaw-genui-tree",
          "data-genui-id": g.uiId,
          style: { border: "1px solid var(--ant-color-border-secondary, #f0f0f0)", borderRadius: 12, padding: 16, marginBottom: 8, background: "var(--ant-color-bg-container, #fff)" },
          ref: (p) => {
            p && (p.__genuiId = g.uiId);
          }
        },
        n.createElement(
          "div",
          { className: "qwenpaw-genui-export-target" },
          n.createElement(Gi, {
            node: g.tree.root,
            onValuesChange: (p) => a.current.set(g.uiId, p),
            children: n.createElement(Yi, { node: g.tree.root })
          })
        ),
        n.createElement(
          "div",
          { style: { display: "flex", justifyContent: "flex-end", gap: 6, marginTop: 8 } },
          n.createElement("button", { type: "button", title: "导出 PNG", onClick: (p) => {
            var E;
            const h = (E = p.currentTarget.closest(".qwenpaw-genui-tree")) == null ? void 0 : E.querySelector(".qwenpaw-genui-export-target");
            h && cc(h, g.uiId).catch((w) => console.warn("[ugsci.genui] PNG export failed", w));
          } }, "PNG"),
          n.createElement("button", { type: "button", title: "打印或另存为 PDF", onClick: (p) => {
            var E;
            const h = (E = p.currentTarget.closest(".qwenpaw-genui-tree")) == null ? void 0 : E.querySelector(".qwenpaw-genui-export-target");
            h && pc(h, g.tree.root, a.current.get(g.uiId) || {}, g.uiId).catch((w) => console.warn("[ugsci.genui] PDF print failed", w));
          } }, "PDF"),
          n.createElement("button", { type: "button", title: "导出 HTML", onClick: (p) => {
            var E;
            const h = (E = p.currentTarget.closest(".qwenpaw-genui-tree")) == null ? void 0 : E.querySelector(".qwenpaw-genui-export-target");
            h && mc(h, g.tree.root, a.current.get(g.uiId) || {}, g.uiId, g.uiId).catch((w) => console.warn("[ugsci.genui] HTML export failed", w));
          } }, "HTML")
        )
      )
    )
  );
}
function bc({ payload: e }) {
  var i, o;
  const t = T().React, n = ((i = e == null ? void 0 : e.trace) == null ? void 0 : i.variables) || [], r = ((o = e == null ? void 0 : e.trace) == null ? void 0 : o.steps) || [], a = [
    ...n.map((c, u) => ({
      id: c.name,
      label: c.symbol || c.name,
      x: 20,
      y: 30 + u * 54,
      kind: "variable"
    })),
    ...r.map((c, u) => ({
      id: c.id,
      label: c.title,
      x: 380,
      y: 30 + u * 54,
      kind: "step",
      step: c
    }))
  ], l = new Map(a.map((c) => [c.id, c])), s = [];
  for (const c of r) {
    for (const u of c.reads || [])
      l.has(u) && s.push({ from: u, to: c.id });
    c.writes && l.has(c.writes) && s.push({ from: c.id, to: c.writes });
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
        t.createElement("path", { d: "M0,0 L0,6 L8,3 z", fill: "#94a3b8" })
      )
    ),
    ...s.map((c, u) => {
      const f = l.get(c.from), d = l.get(c.to);
      return t.createElement("line", {
        key: `e${u}`,
        x1: f.x + 155,
        y1: f.y + 16,
        x2: d.x,
        y2: d.y + 16,
        stroke: "#94a3b8",
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
          fill: c.kind === "variable" ? "#eff6ff" : "#f8fafc",
          stroke: "#cbd5e1"
        }),
        t.createElement(
          "text",
          { x: 8, y: 20, fill: "#334155", fontSize: 11 },
          `${c.id} · ${String(c.label).slice(0, 18)}`
        )
      )
    )
  );
}
function vc({ payload: e }) {
  var r;
  const t = T().React, n = (((r = e == null ? void 0 : e.trace) == null ? void 0 : r.steps) || []).map(
    (a) => t.createElement(
      "article",
      {
        key: a.id,
        style: { border: "1px solid #e2e8f0", borderRadius: 8, padding: 10 }
      },
      t.createElement("strong", null, a.title),
      t.createElement(
        "div",
        { style: { fontFamily: "monospace", margin: "5px 0" } },
        a.unicode || a.expression
      ),
      a.value !== null && a.value !== void 0 ? t.createElement(
        "div",
        null,
        `${a.display_value ?? a.value} ${a.display_unit || a.unit || ""}`
      ) : null,
      a.kind === "assert" ? t.createElement(
        "span",
        { style: { color: a.value ? "#16a34a" : "#dc2626" } },
        a.value ? "✓ 通过" : "✗ 失败"
      ) : null
    )
  );
  return t.createElement(
    "div",
    { style: { display: "grid", gap: 8 } },
    ...n
  );
}
const wc = 128;
let Bn = [], dl = "";
const Un = /* @__PURE__ */ new Set(), ul = () => Un.forEach((e) => e()), ml = (e) => (Un.add(e), () => Un.delete(e)), ca = () => Bn;
function er(e) {
  return !!(e && typeof e == "object" && e.trace && Array.isArray(e.trace.steps) && e.provenance && (e.operation || e.trace.formula_id));
}
function Sc(e) {
  if (!e || typeof e != "object" || !e.replay_id || !e.status || !er(e.result))
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
function pl(e, t) {
  var a, l, s, i, o;
  if (!er(e)) return null;
  const n = (a = e.replay) != null && a.replayId ? `replay:${e.replay.replayId}` : `${((l = e.trace) == null ? void 0 : l.formula_id) || "derivation"}:${((s = e.provenance) == null ? void 0 : s.input_fingerprint) || e.operation || crypto.randomUUID()}`, r = {
    uiId: n,
    sessionId: t || ((o = (i = T()).getCurrentSessionId) == null ? void 0 : o.call(i)) || "",
    payload: e,
    updatedAt: Date.now()
  };
  return Bn = [r, ...Bn.filter((c) => c.uiId !== n)].slice(
    0,
    wc
  ), ul(), r;
}
function fl(e) {
  dl = e, ul();
}
function xc() {
  return T().React.useSyncExternalStore(
    ml,
    () => dl,
    () => ""
  );
}
function kc(e) {
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
    const a = Sc(r);
    if (a) {
      t.push(a);
      return;
    }
    er(r) && t.push(r), Object.values(r).forEach(n);
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
function Cc(e, t) {
  kc(e).forEach(
    (n) => pl(n, t)
  );
}
function Tc(e) {
  const t = T().React, n = t.useSyncExternalStore(ml, ca, ca);
  return t.useMemo(
    () => n.filter((r) => r.sessionId === e),
    [n, e]
  );
}
function _c() {
  var d, m, v, g;
  const e = T().React, t = ((m = (d = T()).getCurrentSessionId) == null ? void 0 : m.call(d)) || "", n = Tc(t), r = xc(), [a, l] = e.useState(n[0]), [s, i] = e.useState("timeline");
  if (e.useEffect(() => {
    const p = n.find((h) => h.uiId === r);
    p && p !== a ? l(p) : n.some((h) => h.uiId === (a == null ? void 0 : a.uiId)) || l(n[0]);
  }, [n, r, a]), !n.length)
    return e.createElement(
      "div",
      { style: { padding: 20 } },
      "暂无推导记录。运行 UGSci 公式后可在此查看。"
    );
  const o = (a == null ? void 0 : a.payload) || n[0].payload, c = o.provenance || {}, u = o.replay, f = () => {
    var h, E, w;
    const p = c.replay_token;
    p && ((w = (E = (h = window.QwenPaw) == null ? void 0 : h.chat) == null ? void 0 : E.sendMessage) == null || w.call(
      E,
      `请调用 ugsci_replay_calculation 验证并重放以下令牌：
${p}`
    ));
  };
  return e.createElement(
    "div",
    {
      style: {
        display: "flex",
        flexDirection: "column",
        height: "100%",
        minHeight: 0,
        padding: 12,
        gap: 10,
        overflow: "auto"
      }
    },
    e.createElement(
      "div",
      { style: { display: "flex", gap: 6, flexWrap: "wrap" } },
      e.createElement(
        "strong",
        null,
        ((v = o.trace) == null ? void 0 : v.formula_name) || o.operation || "UGSci 推导"
      ),
      e.createElement(
        "span",
        null,
        c.source === "freeform" ? "⚠️ AI-推导 · 未审校" : `✅ 审定公式 · ${c.formula_id || ((g = o.trace) == null ? void 0 : g.formula_id) || ""}`
      ),
      c.reference ? e.createElement("span", null, c.reference) : null,
      u ? e.createElement(
        "span",
        {
          style: {
            color: u.reproducible ? "#15803d" : "#b45309"
          }
        },
        u.reproducible ? `✅ 可复现 · ${u.elapsedMs ?? "?"} ms` : "⚠️ 版本已变化"
      ) : null,
      c.replay_token ? e.createElement(
        "button",
        { type: "button", onClick: f },
        "重新计算"
      ) : null
    ),
    e.createElement(
      "div",
      { style: { display: "flex", gap: 6 } },
      ...["flow", "timeline", "logs"].map(
        (p) => e.createElement(
          "button",
          {
            key: p,
            type: "button",
            onClick: () => i(p),
            "aria-pressed": s === p
          },
          p === "flow" ? "流程" : p === "timeline" ? "时间线" : "日志"
        )
      )
    ),
    e.createElement(
      "select",
      {
        value: (a == null ? void 0 : a.uiId) || n[0].uiId,
        onChange: (p) => {
          fl(p.target.value), l(n.find((h) => h.uiId === p.target.value));
        }
      },
      ...n.map(
        (p) => {
          var h;
          return e.createElement(
            "option",
            { key: p.uiId, value: p.uiId },
            ((h = p.payload.trace) == null ? void 0 : h.formula_name) || p.uiId.slice(0, 18)
          );
        }
      )
    ),
    s === "flow" ? e.createElement(bc, { payload: o }) : s === "timeline" ? e.createElement(vc, { payload: o }) : e.createElement(
      "pre",
      { style: { whiteSpace: "pre-wrap", fontSize: 11 } },
      JSON.stringify(o, null, 2)
    )
  );
}
function Ct(e) {
  var t;
  if (typeof e == "string")
    try {
      return Ct(JSON.parse(e));
    } catch {
      return null;
    }
  return Array.isArray(e) ? Ct((t = e.find((n) => (n == null ? void 0 : n.type) === "text")) == null ? void 0 : t.text) : e != null && e.status && (e != null && e.result) ? {
    ...e.result,
    replay: {
      replayId: String(e.replay_id || ""),
      status: String(e.status),
      reproducible: e.reproducible === !0,
      elapsedMs: typeof e.elapsed_ms == "number" ? e.elapsed_ms : void 0,
      diff: e.diff && typeof e.diff == "object" ? e.diff : {}
    }
  } : (e == null ? void 0 : e.output) !== void 0 ? Ct(e.output) : (e == null ? void 0 : e.content) !== void 0 ? Ct(e.content) : e;
}
function Ic(e) {
  var o, c, u, f, d, m, v, g;
  const t = T().React, n = ((o = e == null ? void 0 : e.data) == null ? void 0 : o.content) || [], r = ((u = (c = n[1]) == null ? void 0 : c.data) == null ? void 0 : u.output) ?? ((d = (f = n[1]) == null ? void 0 : f.data) == null ? void 0 : d.content) ?? ((v = (m = n[0]) == null ? void 0 : m.data) == null ? void 0 : v.output), a = Ct(r), [l, s] = t.useState(null);
  t.useEffect(() => {
    a && s(pl(a));
  }, [r]);
  const i = () => {
    l != null && l.uiId && fl(l.uiId), window.dispatchEvent(
      new CustomEvent("qwenpaw:open-compute-workbench", {
        detail: { uiId: l == null ? void 0 : l.uiId }
      })
    );
  };
  return t.createElement(
    "div",
    {
      style: {
        border: "1px solid #cbd5e1",
        borderRadius: 8,
        padding: 8,
        margin: "4px 0"
      }
    },
    t.createElement(
      "strong",
      null,
      ((g = a == null ? void 0 : a.provenance) == null ? void 0 : g.source) === "freeform" ? "⚠️ AI-推导 · 未审校" : "✅ UGSci 审定推导"
    ),
    a ? t.createElement(
      "button",
      { type: "button", onClick: i, style: { marginLeft: 10 } },
      "在工作台打开"
    ) : t.createElement("span", null, "计算中…")
  );
}
let st = null;
function Ac(e, t) {
  var a, l, s, i;
  const n = "ugsci";
  st == null || st();
  const r = [];
  if (de("/ugsci/genui/config", {
    bypassCache: !0
  }).then((o) => {
    e.genui = { ...e.genui || {}, config: o };
  }).catch((o) => {
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
      o
    );
  }), (a = e.chat) != null && a.toolRender) {
    r.push(
      e.chat.toolRender(n, "emit_ui_tree", Yr)
    ), r.push(
      e.chat.toolRender(n, "emit_ui_patch", Yr)
    ), r.push(
      e.chat.toolRender(n, "list_ui_components", Qr)
    ), r.push(
      e.chat.toolRender(n, "get_genui_guide", Qr)
    );
    for (const o of [
      "ugsci_trace_calculation",
      "ugsci_replay_calculation",
      "ugsci_derive_formula",
      "ugsci_evaluate_formula",
      "ugsci_transform_formula",
      "ugsci_formula_preview"
    ])
      r.push(e.chat.toolRender(n, o, Ic));
    console.info("[ugsci.genui] Registered emit/patch + catalog/guide cards");
  }
  return (l = e.slot) != null && l.fill && r.push(
    e.slot.fill(
      n,
      "chat.workbench.compute",
      () => t.createElement(_c)
    )
  ), (i = (s = e.chat) == null ? void 0 : s.response) != null && i.append && (r.push(
    e.chat.response.append(
      n,
      (o) => {
        const c = () => (t.useEffect(
          () => Cc(o.data.output),
          [o.data.output]
        ), null);
        return t.createElement(
          yi,
          null,
          t.createElement(c),
          t.createElement(Ec, { data: o.data })
        );
      },
      { id: "ugsci.genui.response-append", order: 50 }
    )
  ), console.info("[ugsci.genui] Registered response.append slot")), st = () => {
    var o;
    for (const c of r.reverse()) (o = c == null ? void 0 : c.dispose) == null || o.call(c);
    if (vi(), Mi(), e.genui) {
      const c = { ...e.genui };
      delete c.dispose, delete c.clearSession, e.genui = c;
    }
    st = null;
  }, e.genui = {
    ...e.genui || {},
    dispose: st,
    clearSession: bi
  }, st;
}
const da = {
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
function zc() {
  const e = T().React, { Alert: t, Card: n, Space: r, Spin: a, Switch: l, Typography: s, message: i } = T().antd, { useEffect: o, useState: c } = e, [u, f] = c(null), [d, m] = c(!1);
  o(() => {
    let g = !0, p = null;
    const h = (E = !1) => {
      de("/ugsci/genui/config").then((w) => {
        g && (f(w), _n(w));
      }).catch((w) => {
        g && (f(da), _n(da), E && i.error(String(w)), p = setTimeout(() => h(!1), 3e4));
      });
    };
    return h(!0), () => {
      g = !1, p && clearTimeout(p);
    };
  }, []);
  const v = async (g) => {
    m(!0);
    try {
      const p = await de("/ugsci/genui/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: g })
      });
      f(p), _n(p), i.success(p.overridden ? "设置已保存，但环境变量或插件配置正在覆盖它" : g ? "GenUI 已开启" : "GenUI 已关闭");
    } catch (p) {
      i.error(`保存 GenUI 设置失败：${String(p)}`);
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
            e.createElement(s.Text, { strong: !0 }, "启用 GenUI"),
            e.createElement(
              s.Paragraph,
              { type: "secondary", style: { margin: "4px 0 0" } },
              "允许 Agent 生成卡片、表格、图表、表单，并在对话中交互和增量更新。"
            )
          ),
          e.createElement(l, {
            checked: u.persisted_enabled,
            loading: d,
            disabled: u.backend_unavailable,
            onChange: v
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
let St = null;
function gl() {
  return St || (St = (async () => {
    var r;
    const e = (r = window.QwenPaw) == null ? void 0 : r.host;
    if (!(e != null && e.getApiUrl))
      throw new Error("[oilgas-vis] QwenPaw.host.getApiUrl not available");
    const t = `${e.getApiUrl(
      "frontend_plugin/ugsci/files/ui/dist/viewer-runtime.js"
    )}?v=0.3.6`;
    console.info("[oilgas-vis] Loading viewer runtime from", t), await new Promise((a, l) => {
      const s = document.createElement("script");
      s.dataset.plugin = "ugsci", s.src = t, s.onload = () => a(), s.onerror = () => l(new Error("Viewer runtime failed to load")), document.head.appendChild(s);
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
    throw St = null, e;
  }), St);
}
function $c() {
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
function ua(e, t) {
  var a;
  const n = ((a = e.getApiToken) == null ? void 0 : a.call(e)) || "", r = typeof e.buildAuthHeaders == "function" ? { ...e.buildAuthHeaders(t.agentId) } : n ? { Authorization: `Bearer ${n}` } : {};
  return t.agentId && (r["X-Agent-Id"] = t.agentId), t.chatId && (r["X-Chat-Id"] = t.chatId), !t.chatId && t.projectDirOverride && (r["X-Session-Project-Dir"] = t.projectDirOverride), r;
}
async function ma(e, t, n) {
  if (typeof e.fetch == "function") return e.fetch(t, n);
  const r = t.replace(/^\/ugsci\/visualization/, "");
  return fetch(`${e.getApiUrl("ugsci/visualization")}${r}`, n);
}
async function Pc(e, t) {
  var a;
  const n = await ma(e, "/ugsci/visualization/imports/workspace", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...ua(e, t)
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
    const s = await ma(
      e,
      `/ugsci/visualization/imports/${r.job_id}`,
      { headers: ua(e, t) }
    );
    if (!s.ok) throw new Error(`状态查询失败: HTTP ${s.status}`);
    const i = await s.json();
    if (i.status === "completed") {
      if (!((a = i.result) != null && a.id)) throw new Error("导入完成但未返回数据集 ID");
      return i.result.id;
    }
    if (i.status === "failed" || i.status === "cancelled")
      throw new Error(i.error || "导入任务未完成");
    await new Promise((o) => setTimeout(o, 750));
  }
  throw new Error("导入超时，请稍后重试");
}
async function Oc(e, t) {
  var r;
  let n;
  for (let a = 0; a < 20; a += 1)
    try {
      await ((r = e.executeCommand) == null ? void 0 : r.call(e, "open", { datasetId: t }));
      return;
    } catch (l) {
      n = l, await new Promise((s) => setTimeout(s, 250));
    }
  if (n) throw n;
}
function Rc() {
  const e = T().React, { useEffect: t, useRef: n, useState: r } = e, { Spin: a, Alert: l, Button: s, Typography: i, message: o } = T().antd, { Text: c } = i, u = n(null), f = n(null), [d, m] = r(!0), [v, g] = r(null), [p, h] = r("正在加载三维可视化引擎...");
  return t(() => {
    let E = !1;
    async function w() {
      if (u.current)
        try {
          m(!0), g(null);
          const b = await gl();
          if (E) return;
          const x = T(), D = {
            apiBase: x.getApiUrl("ugsci/visualization"),
            authToken: x.getApiToken() || void 0
          };
          f.current = b.mount(u.current, D);
          const $ = $c();
          if ($) {
            h(`正在导入 ${$.name}...`);
            const A = await Pc(x, $);
            if (E || !f.current || (h("正在打开三维网格..."), await Oc(f.current, A), E)) return;
          }
          E || m(!1);
        } catch (b) {
          if (!E) {
            const x = b instanceof Error ? b.message : "Failed to load viewer";
            g(x), m(!1), o.error(`可视化引擎加载失败: ${x}`);
          }
        }
    }
    return w(), () => {
      if (E = !0, f.current) {
        try {
          f.current.dispose();
        } catch (b) {
          console.warn("[oilgas-vis] Dispose error:", b);
        }
        f.current = null;
      }
    };
  }, []), v ? e.createElement(
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
      description: v,
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
      ref: u,
      style: { width: "100%", height: "100%" }
    }),
    d && e.createElement(
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
        p
      )
    )
  );
}
function yl(e, t) {
  var a;
  const n = ((a = e.getApiToken) == null ? void 0 : a.call(e)) || "", r = typeof e.buildAuthHeaders == "function" ? { ...e.buildAuthHeaders(t.agentId) } : n ? { Authorization: `Bearer ${n}` } : {};
  return t.agentId && (r["X-Agent-Id"] = t.agentId), t.chatId && (r["X-Chat-Id"] = t.chatId), !t.chatId && t.projectDirOverride && (r["X-Session-Project-Dir"] = t.projectDirOverride), r;
}
async function hl(e, t, n) {
  if (typeof e.fetch == "function")
    return e.fetch(t, n);
  const r = t.replace(/^\/ugsci\/visualization/, "");
  return fetch(`${e.getApiUrl("ugsci/visualization")}${r}`, n);
}
function pa(e) {
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
function Mc({ jobId: e, file: t }) {
  const n = T().React, { useEffect: r, useRef: a, useState: l } = n, s = T(), i = a(null), o = a(null), [c, u] = l("queued"), [f, d] = l(0), [m, v] = l(null), [g, p] = l(null);
  return r(() => {
    let h = !1;
    return (async () => {
      var b;
      const w = `/ugsci/visualization/imports/${e}`;
      for (let x = 0; x < 240 && !h; x += 1) {
        try {
          const M = await hl(s, w, {
            headers: { ...yl(s, t) }
          });
          if (!M.ok) throw new Error(`状态查询失败: HTTP ${M.status}`);
          const D = await M.json();
          if (h) return;
          if (d(Number(D.progress || 0)), u(D.status), D.status === "completed") {
            if (!((b = D.result) != null && b.id)) throw new Error("导入完成但未返回数据集 ID");
            p(D.result.id);
            return;
          }
          if (D.status === "failed" || D.status === "cancelled") {
            v(D.error || pa(D.status));
            return;
          }
        } catch (M) {
          if (x >= 239 && !h) {
            u("failed"), v(M instanceof Error ? M.message : String(M));
            return;
          }
        }
        await new Promise((M) => setTimeout(M, 750));
      }
    })(), () => {
      h = !0;
    };
  }, [e, t.agentId, t.chatId, t.projectDirOverride]), r(() => {
    if (c !== "completed" || !g || !i.current) return;
    let h = !1;
    return (async () => {
      var E, w;
      try {
        const b = await gl();
        if (h || !i.current) return;
        o.current = b.mount(i.current, {
          apiBase: s.getApiUrl("ugsci/visualization"),
          authToken: s.getApiToken() || void 0
        });
        let x;
        for (let M = 0; M < 20 && !h; M += 1)
          try {
            await ((w = (E = o.current).executeCommand) == null ? void 0 : w.call(E, "open", { datasetId: g })), x = void 0;
            break;
          } catch (D) {
            x = D;
            const $ = D instanceof Error ? D.message : String(D);
            if (!$.includes("数据集不存在") && !$.includes("dataset"))
              throw D;
            await new Promise((A) => setTimeout(A, 250));
          }
        if (x && !h) throw x;
      } catch (b) {
        h || (u("failed"), v(b instanceof Error ? b.message : String(b)));
      }
    })(), () => {
      var E;
      h = !0;
      try {
        (E = o.current) == null || E.dispose();
      } catch {
      }
      o.current = null;
    };
  }, [c, g]), n.createElement(
    "div",
    { style: { width: "100%", marginTop: 8 } },
    c === "completed" ? n.createElement("div", {
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
      `${pa(c)}${f > 0 ? `（${Math.round(f * 100)}%）` : ""}`
    ),
    m ? n.createElement(
      "div",
      { style: { marginTop: 6, color: "#ff7875", fontSize: 12 } },
      `预览状态：${m}`
    ) : null
  );
}
function Lc(e) {
  const t = T().React, { useEffect: n, useState: r } = t, { Button: a, Spin: l, Alert: s, Typography: i } = T().antd, { Text: o } = i, c = e.artifact || e.file || {}, u = c.filename || c.title || e.filename || "unknown", f = c.workspacePath || c.path || e.workspacePath, [d, m] = r("idle"), [v, g] = r(null), [p, h] = r(null);
  return n(() => {
    if (!f) return;
    let E = !1;
    return m("submitting"), g(null), h(null), (async () => {
      try {
        const w = T(), b = await hl(w, "/ugsci/visualization/imports/workspace", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...yl(w, c)
          },
          body: JSON.stringify({
            path: f,
            root: c.workspaceRoot || "project",
            name: u.replace(/\.[^.]+$/, "")
          })
        });
        if (!b.ok) throw new Error(`Import failed: HTTP ${b.status}`);
        const x = await b.json();
        E || (g(x.job_id), m("submitted"));
      } catch (w) {
        E || (h(w instanceof Error ? w.message : String(w)), m("failed"));
      }
    })(), () => {
      E = !0;
    };
  }, [f, u, c.workspaceRoot, c.agentId, c.chatId, c.projectDirOverride]), d === "submitting" ? t.createElement(
    "div",
    { style: { padding: 24, textAlign: "center" } },
    t.createElement(l, { size: "large" }),
    t.createElement(
      "div",
      { style: { marginTop: 8, color: "#8b949e" } },
      "正在提交工作区文件，浏览器不会复制大型文件..."
    )
  ) : d === "failed" ? t.createElement(
    "div",
    { style: { padding: 24 } },
    t.createElement(s, {
      type: "warning",
      message: "导入失败",
      description: p,
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
    t.createElement(o, { strong: !0 }, `文件: ${u}`),
    c.size ? t.createElement(o, { type: "secondary" }, `大小: ${(c.size / 1024 / 1024).toFixed(1)} MB`) : null,
    v ? t.createElement(Mc, { jobId: v, file: c }) : t.createElement(o, { type: "secondary" }, "正在准备导入任务..."),
    t.createElement(a, {
      type: "primary",
      onClick: () => {
        window.history.pushState({}, "", "/oilgas-visualization"), window.dispatchEvent(new PopStateEvent("popstate"));
      }
    }, "打开油气可视化页面")
  );
}
function Bc(e, t) {
  const n = "__ugsciVisualizationFrontendRegistered", r = window;
  if (r[n]) return;
  r[n] = !0;
  const a = T().antdIcons || {}, l = a.GlobalOutlined || a.AppstoreOutlined;
  e.route.add("ugsci", {
    id: "ugsci.visualization",
    path: "/oilgas-visualization",
    component: Rc
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
        component: Lc,
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
function Uc() {
  var u, f, d, m;
  const e = window.QwenPaw;
  if (!(e != null && e.menu) || !(e != null && e.route)) {
    console.warn(
      "[ugsci] QwenPaw.menu/route API not available — plugin disabled"
    );
    return;
  }
  const t = T().React, n = "ugsci";
  function r() {
    return T().React.createElement(di, { embedded: !0 });
  }
  function a() {
    return T().React.useEffect(() => {
      window.history.replaceState({}, "", "/market?tab=ugsci"), window.dispatchEvent(new PopStateEvent("popstate"));
    }, []), null;
  }
  (f = (u = e.chat) == null ? void 0 : u.rightHeader) != null && f.add ? (e.chat.rightHeader.add(n, t.createElement(mi), {
    id: "ugsci.welcome-injector",
    order: -1
    // render before other right-header items (invisible anyway)
  }), console.info("[ugsci] WelcomePromptsInjector registered via rightHeader")) : console.warn(
    "[ugsci] QP.chat.rightHeader.add not available — agent-specific welcome prompts disabled"
  );
  const l = T().antdIcons || {}, s = l.UserSwitchOutlined, i = l.ToolOutlined, o = l.AppstoreOutlined;
  e.route.add(n, {
    id: "ugsci.experts",
    path: "/ugsci-experts",
    component: us
  }), e.menu.add(n, {
    id: "ugsci.experts",
    location: "primary.agentScoped",
    label: () => "专家·协作",
    icon: s ? t.createElement(s, { style: { fontSize: 16 } }) : void 0,
    route: "ugsci.experts",
    order: 5,
    visible: () => Ht()
  }), e.route.add(n, {
    id: "ugsci.genui-settings",
    path: "/ugsci-genui-settings",
    component: zc
  }), e.menu.add(n, {
    id: "ugsci.genui-settings",
    location: "primary.settings",
    parentId: "plugins-group",
    label: () => "GenUI 设置",
    icon: o ? t.createElement(o, { style: { fontSize: 16 } }) : void 0,
    route: "ugsci.genui-settings",
    order: 30
  }), e.route.add(n, {
    id: "ugsci.tools-skills",
    path: "/ugsci-tools-skills",
    component: Da
  }), e.menu.add(n, {
    id: "ugsci.tools-skills",
    location: "primary.agentScoped",
    label: () => "工具·技能",
    icon: i ? t.createElement(i, { style: { fontSize: 16 } }) : void 0,
    route: "ugsci.tools-skills",
    order: 6,
    visible: () => Ht()
  }), e.route.add(n, {
    id: "ugsci.capabilities",
    path: "/ugsci-capabilities",
    component: Gs
  }), e.route.add(n, {
    id: "ugsci.skills-center",
    path: "/ugsci-skills",
    component: Hs
  }), e.route.add(n, {
    id: "ugsci.market",
    path: "/ugsci-market",
    component: a
  }), (d = e.marketplace) == null || d.add(n, {
    id: "ugsci",
    label: "UGSci",
    component: r,
    order: 30
  }), (m = e.sidebar) != null && m.registerSimpleModeItems ? (e.sidebar.registerSimpleModeItems([
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
  for (const v of c) {
    try {
      const p = e.menu.snapshot("primary.agentScoped").find((h) => h.id === v);
      p && e.menu.replace(n, v, {
        ...p,
        visible: () => !Ht()
      });
    } catch {
    }
    try {
      const p = e.menu.snapshot("primary.settings").find((h) => h.id === v);
      p && e.menu.replace(n, v, {
        ...p,
        visible: () => !Ht()
      });
    } catch {
    }
  }
  try {
    const g = e.menu.snapshot("primary.agentScoped").find((p) => p.id === "oilgas-vis.page");
    g && e.menu.replace(n, "oilgas-vis.page", {
      ...g,
      visible: () => !1
    });
  } catch {
  }
  Ac(e, t), Bc(e, t), console.info(
    "[ugsci] Plugin registered: unified Tools & Skills center + compatibility routes, simple-mode navigation active"
  );
}
function jn() {
  try {
    Uc();
  } catch (e) {
    console.error("[ugsci] Failed to build plugin:", e), setTimeout(jn, 500);
  }
}
var wa;
if ((wa = window.QwenPaw) != null && wa.host)
  jn();
else {
  const e = setInterval(() => {
    var t;
    (t = window.QwenPaw) != null && t.host && (clearInterval(e), jn());
  }, 200);
  setTimeout(() => clearInterval(e), 1e4);
}
function jc(e, t) {
  if (e.match(/^[a-z]+:\/\//i))
    return e;
  if (e.match(/^\/\//))
    return window.location.protocol + e;
  if (e.match(/^[a-z]+:/i))
    return e;
  const n = document.implementation.createHTMLDocument(), r = n.createElement("base"), a = n.createElement("a");
  return n.head.appendChild(r), n.body.appendChild(a), t && (r.href = t), a.href = e, a.href;
}
const Nc = /* @__PURE__ */ (() => {
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
function El(e = {}) {
  return mt || (e.includeStyleProperties ? (mt = e.includeStyleProperties, mt) : (mt = at(window.getComputedStyle(document.documentElement)), mt));
}
function sn(e, t) {
  const r = (e.ownerDocument.defaultView || window).getComputedStyle(e).getPropertyValue(t);
  return r ? parseFloat(r.replace("px", "")) : 0;
}
function Dc(e) {
  const t = sn(e, "border-left-width"), n = sn(e, "border-right-width");
  return e.clientWidth + t + n;
}
function Fc(e) {
  const t = sn(e, "border-top-width"), n = sn(e, "border-bottom-width");
  return e.clientHeight + t + n;
}
function bl(e, t = {}) {
  const n = t.width || Dc(e), r = t.height || Fc(e);
  return { width: n, height: r };
}
function Gc() {
  let e, t;
  try {
    t = process;
  } catch {
  }
  const n = t && t.env ? t.env.devicePixelRatio : null;
  return n && (e = parseInt(n, 10), Number.isNaN(e) && (e = 1)), e || window.devicePixelRatio || 1;
}
const Fe = 16384;
function Hc(e) {
  (e.width > Fe || e.height > Fe) && (e.width > Fe && e.height > Fe ? e.width > e.height ? (e.height *= Fe / e.width, e.width = Fe) : (e.width *= Fe / e.height, e.height = Fe) : e.width > Fe ? (e.height *= Fe / e.width, e.width = Fe) : (e.width *= Fe / e.height, e.height = Fe));
}
function cn(e) {
  return new Promise((t, n) => {
    const r = new Image();
    r.onload = () => {
      r.decode().then(() => {
        requestAnimationFrame(() => t(r));
      });
    }, r.onerror = n, r.crossOrigin = "anonymous", r.decoding = "async", r.src = e;
  });
}
async function Wc(e) {
  return Promise.resolve().then(() => new XMLSerializer().serializeToString(e)).then(encodeURIComponent).then((t) => `data:image/svg+xml;charset=utf-8,${t}`);
}
async function Vc(e, t, n) {
  const r = "http://www.w3.org/2000/svg", a = document.createElementNS(r, "svg"), l = document.createElementNS(r, "foreignObject");
  return a.setAttribute("width", `${t}`), a.setAttribute("height", `${n}`), a.setAttribute("viewBox", `0 0 ${t} ${n}`), l.setAttribute("width", "100%"), l.setAttribute("height", "100%"), l.setAttribute("x", "0"), l.setAttribute("y", "0"), l.setAttribute("externalResourcesRequired", "true"), a.appendChild(l), l.appendChild(e), Wc(a);
}
const Ne = (e, t) => {
  if (e instanceof t)
    return !0;
  const n = Object.getPrototypeOf(e);
  return n === null ? !1 : n.constructor.name === t.name || Ne(n, t);
};
function Jc(e) {
  const t = e.getPropertyValue("content");
  return `${e.cssText} content: '${t.replace(/'|"/g, "")}';`;
}
function qc(e, t) {
  return El(t).map((n) => {
    const r = e.getPropertyValue(n), a = e.getPropertyPriority(n);
    return `${n}: ${r}${a ? " !important" : ""};`;
  }).join(" ");
}
function Kc(e, t, n, r) {
  const a = `.${e}:${t}`, l = n.cssText ? Jc(n) : qc(n, r);
  return document.createTextNode(`${a}{${l}}`);
}
function fa(e, t, n, r) {
  const a = window.getComputedStyle(e, n), l = a.getPropertyValue("content");
  if (l === "" || l === "none")
    return;
  const s = Nc();
  try {
    t.className = `${t.className} ${s}`;
  } catch {
    return;
  }
  const i = document.createElement("style");
  i.appendChild(Kc(s, n, a, r)), t.appendChild(i);
}
function Xc(e, t, n) {
  fa(e, t, ":before", n), fa(e, t, ":after", n);
}
const ga = "application/font-woff", ya = "image/jpeg", Yc = {
  woff: ga,
  woff2: ga,
  ttf: "application/font-truetype",
  eot: "application/vnd.ms-fontobject",
  png: "image/png",
  jpg: ya,
  jpeg: ya,
  gif: "image/gif",
  tiff: "image/tiff",
  svg: "image/svg+xml",
  webp: "image/webp"
};
function Qc(e) {
  const t = /\.([^./]*?)$/g.exec(e);
  return t ? t[1] : "";
}
function tr(e) {
  const t = Qc(e).toLowerCase();
  return Yc[t] || "";
}
function Zc(e) {
  return e.split(/,/)[1];
}
function Nn(e) {
  return e.search(/^(data:)/) !== -1;
}
function ed(e, t) {
  return `data:${t};base64,${e}`;
}
async function vl(e, t, n) {
  const r = await fetch(e, t);
  if (r.status === 404)
    throw new Error(`Resource "${r.url}" not found`);
  const a = await r.blob();
  return new Promise((l, s) => {
    const i = new FileReader();
    i.onerror = s, i.onloadend = () => {
      try {
        l(n({ res: r, result: i.result }));
      } catch (o) {
        s(o);
      }
    }, i.readAsDataURL(a);
  });
}
const In = {};
function td(e, t, n) {
  let r = e.replace(/\?.*/, "");
  return n && (r = e), /ttf|otf|eot|woff2?/i.test(r) && (r = r.replace(/.*\//, "")), t ? `[${t}]${r}` : r;
}
async function nr(e, t, n) {
  const r = td(e, t, n.includeQueryParams);
  if (In[r] != null)
    return In[r];
  n.cacheBust && (e += (/\?/.test(e) ? "&" : "?") + (/* @__PURE__ */ new Date()).getTime());
  let a;
  try {
    const l = await vl(e, n.fetchRequestInit, ({ res: s, result: i }) => (t || (t = s.headers.get("Content-Type") || ""), Zc(i)));
    a = ed(l, t);
  } catch (l) {
    a = n.imagePlaceholder || "";
    let s = `Failed to fetch resource: ${e}`;
    l && (s = typeof l == "string" ? l : l.message), s && console.warn(s);
  }
  return In[r] = a, a;
}
async function nd(e) {
  const t = e.toDataURL();
  return t === "data:," ? e.cloneNode(!1) : cn(t);
}
async function rd(e, t) {
  if (e.currentSrc) {
    const l = document.createElement("canvas"), s = l.getContext("2d");
    l.width = e.clientWidth, l.height = e.clientHeight, s == null || s.drawImage(e, 0, 0, l.width, l.height);
    const i = l.toDataURL();
    return cn(i);
  }
  const n = e.poster, r = tr(n), a = await nr(n, r, t);
  return cn(a);
}
async function ad(e, t) {
  var n;
  try {
    if (!((n = e == null ? void 0 : e.contentDocument) === null || n === void 0) && n.body)
      return await yn(e.contentDocument.body, t, !0);
  } catch {
  }
  return e.cloneNode(!1);
}
async function ld(e, t) {
  return Ne(e, HTMLCanvasElement) ? nd(e) : Ne(e, HTMLVideoElement) ? rd(e, t) : Ne(e, HTMLIFrameElement) ? ad(e, t) : e.cloneNode(wl(e));
}
const od = (e) => e.tagName != null && e.tagName.toUpperCase() === "SLOT", wl = (e) => e.tagName != null && e.tagName.toUpperCase() === "SVG";
async function sd(e, t, n) {
  var r, a;
  if (wl(t))
    return t;
  let l = [];
  return od(e) && e.assignedNodes ? l = at(e.assignedNodes()) : Ne(e, HTMLIFrameElement) && (!((r = e.contentDocument) === null || r === void 0) && r.body) ? l = at(e.contentDocument.body.childNodes) : l = at(((a = e.shadowRoot) !== null && a !== void 0 ? a : e).childNodes), l.length === 0 || Ne(e, HTMLVideoElement) || await l.reduce((s, i) => s.then(() => yn(i, n)).then((o) => {
    o && t.appendChild(o);
  }), Promise.resolve()), t;
}
function id(e, t, n) {
  const r = t.style;
  if (!r)
    return;
  const a = window.getComputedStyle(e);
  a.cssText ? (r.cssText = a.cssText, r.transformOrigin = a.transformOrigin) : El(n).forEach((l) => {
    let s = a.getPropertyValue(l);
    l === "font-size" && s.endsWith("px") && (s = `${Math.floor(parseFloat(s.substring(0, s.length - 2))) - 0.1}px`), Ne(e, HTMLIFrameElement) && l === "display" && s === "inline" && (s = "block"), l === "d" && t.getAttribute("d") && (s = `path(${t.getAttribute("d")})`), r.setProperty(l, s, a.getPropertyPriority(l));
  });
}
function cd(e, t) {
  Ne(e, HTMLTextAreaElement) && (t.innerHTML = e.value), Ne(e, HTMLInputElement) && t.setAttribute("value", e.value);
}
function dd(e, t) {
  if (Ne(e, HTMLSelectElement)) {
    const n = t, r = Array.from(n.children).find((a) => e.value === a.getAttribute("value"));
    r && r.setAttribute("selected", "");
  }
}
function ud(e, t, n) {
  return Ne(t, Element) && (id(e, t, n), Xc(e, t, n), cd(e, t), dd(e, t)), t;
}
async function md(e, t) {
  const n = e.querySelectorAll ? e.querySelectorAll("use") : [];
  if (n.length === 0)
    return e;
  const r = {};
  for (let l = 0; l < n.length; l++) {
    const i = n[l].getAttribute("xlink:href");
    if (i) {
      const o = e.querySelector(i), c = document.querySelector(i);
      !o && c && !r[i] && (r[i] = await yn(c, t, !0));
    }
  }
  const a = Object.values(r);
  if (a.length) {
    const l = "http://www.w3.org/1999/xhtml", s = document.createElementNS(l, "svg");
    s.setAttribute("xmlns", l), s.style.position = "absolute", s.style.width = "0", s.style.height = "0", s.style.overflow = "hidden", s.style.display = "none";
    const i = document.createElementNS(l, "defs");
    s.appendChild(i);
    for (let o = 0; o < a.length; o++)
      i.appendChild(a[o]);
    e.appendChild(s);
  }
  return e;
}
async function yn(e, t, n) {
  return !n && t.filter && !t.filter(e) ? null : Promise.resolve(e).then((r) => ld(r, t)).then((r) => sd(e, r, t)).then((r) => ud(e, r, t)).then((r) => md(r, t));
}
const Sl = /url\((['"]?)([^'"]+?)\1\)/g, pd = /url\([^)]+\)\s*format\((["']?)([^"']+)\1\)/g, fd = /src:\s*(?:url\([^)]+\)\s*format\([^)]+\)[,;]\s*)+/g;
function gd(e) {
  const t = e.replace(/([.*+?^${}()|\[\]\/\\])/g, "\\$1");
  return new RegExp(`(url\\(['"]?)(${t})(['"]?\\))`, "g");
}
function yd(e) {
  const t = [];
  return e.replace(Sl, (n, r, a) => (t.push(a), n)), t.filter((n) => !Nn(n));
}
async function hd(e, t, n, r, a) {
  try {
    const l = n ? jc(t, n) : t, s = tr(t);
    let i;
    return a || (i = await nr(l, s, r)), e.replace(gd(t), `$1${i}$3`);
  } catch {
  }
  return e;
}
function Ed(e, { preferredFontFormat: t }) {
  return t ? e.replace(fd, (n) => {
    for (; ; ) {
      const [r, , a] = pd.exec(n) || [];
      if (!a)
        return "";
      if (a === t)
        return `src: ${r};`;
    }
  }) : e;
}
function xl(e) {
  return e.search(Sl) !== -1;
}
async function kl(e, t, n) {
  if (!xl(e))
    return e;
  const r = Ed(e, n);
  return yd(r).reduce((l, s) => l.then((i) => hd(i, s, t, n)), Promise.resolve(r));
}
async function pt(e, t, n) {
  var r;
  const a = (r = t.style) === null || r === void 0 ? void 0 : r.getPropertyValue(e);
  if (a) {
    const l = await kl(a, null, n);
    return t.style.setProperty(e, l, t.style.getPropertyPriority(e)), !0;
  }
  return !1;
}
async function bd(e, t) {
  await pt("background", e, t) || await pt("background-image", e, t), await pt("mask", e, t) || await pt("-webkit-mask", e, t) || await pt("mask-image", e, t) || await pt("-webkit-mask-image", e, t);
}
async function vd(e, t) {
  const n = Ne(e, HTMLImageElement);
  if (!(n && !Nn(e.src)) && !(Ne(e, SVGImageElement) && !Nn(e.href.baseVal)))
    return;
  const r = n ? e.src : e.href.baseVal, a = await nr(r, tr(r), t);
  await new Promise((l, s) => {
    e.onload = l, e.onerror = t.onImageErrorHandler ? (...o) => {
      try {
        l(t.onImageErrorHandler(...o));
      } catch (c) {
        s(c);
      }
    } : s;
    const i = e;
    i.decode && (i.decode = l), i.loading === "lazy" && (i.loading = "eager"), n ? (e.srcset = "", e.src = a) : e.href.baseVal = a;
  });
}
async function wd(e, t) {
  const r = at(e.childNodes).map((a) => Cl(a, t));
  await Promise.all(r).then(() => e);
}
async function Cl(e, t) {
  Ne(e, Element) && (await bd(e, t), await vd(e, t), await wd(e, t));
}
function Sd(e, t) {
  const { style: n } = e;
  t.backgroundColor && (n.backgroundColor = t.backgroundColor), t.width && (n.width = `${t.width}px`), t.height && (n.height = `${t.height}px`);
  const r = t.style;
  return r != null && Object.keys(r).forEach((a) => {
    n[a] = r[a];
  }), e;
}
const ha = {};
async function Ea(e) {
  let t = ha[e];
  if (t != null)
    return t;
  const r = await (await fetch(e)).text();
  return t = { url: e, cssText: r }, ha[e] = t, t;
}
async function ba(e, t) {
  let n = e.cssText;
  const r = /url\(["']?([^"')]+)["']?\)/g, l = (n.match(/url\([^)]+\)/g) || []).map(async (s) => {
    let i = s.replace(r, "$1");
    return i.startsWith("https://") || (i = new URL(i, e.url).href), vl(i, t.fetchRequestInit, ({ result: o }) => (n = n.replace(s, `url(${o})`), [s, o]));
  });
  return Promise.all(l).then(() => n);
}
function va(e) {
  if (e == null)
    return [];
  const t = [], n = /(\/\*[\s\S]*?\*\/)/gi;
  let r = e.replace(n, "");
  const a = new RegExp("((@.*?keyframes [\\s\\S]*?){([\\s\\S]*?}\\s*?)})", "gi");
  for (; ; ) {
    const o = a.exec(r);
    if (o === null)
      break;
    t.push(o[0]);
  }
  r = r.replace(a, "");
  const l = /@import[\s\S]*?url\([^)]*\)[\s\S]*?;/gi, s = "((\\s*?(?:\\/\\*[\\s\\S]*?\\*\\/)?\\s*?@media[\\s\\S]*?){([\\s\\S]*?)}\\s*?})|(([\\s\\S]*?){([\\s\\S]*?)})", i = new RegExp(s, "gi");
  for (; ; ) {
    let o = l.exec(r);
    if (o === null) {
      if (o = i.exec(r), o === null)
        break;
      l.lastIndex = i.lastIndex;
    } else
      i.lastIndex = l.lastIndex;
    t.push(o[0]);
  }
  return t;
}
async function xd(e, t) {
  const n = [], r = [];
  return e.forEach((a) => {
    if ("cssRules" in a)
      try {
        at(a.cssRules || []).forEach((l, s) => {
          if (l.type === CSSRule.IMPORT_RULE) {
            let i = s + 1;
            const o = l.href, c = Ea(o).then((u) => ba(u, t)).then((u) => va(u).forEach((f) => {
              try {
                a.insertRule(f, f.startsWith("@import") ? i += 1 : a.cssRules.length);
              } catch (d) {
                console.error("Error inserting rule from remote css", {
                  rule: f,
                  error: d
                });
              }
            })).catch((u) => {
              console.error("Error loading remote css", u.toString());
            });
            r.push(c);
          }
        });
      } catch (l) {
        const s = e.find((i) => i.href == null) || document.styleSheets[0];
        a.href != null && r.push(Ea(a.href).then((i) => ba(i, t)).then((i) => va(i).forEach((o) => {
          s.insertRule(o, s.cssRules.length);
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
function kd(e) {
  return e.filter((t) => t.type === CSSRule.FONT_FACE_RULE).filter((t) => xl(t.style.getPropertyValue("src")));
}
async function Cd(e, t) {
  if (e.ownerDocument == null)
    throw new Error("Provided element is not within a Document");
  const n = at(e.ownerDocument.styleSheets), r = await xd(n, t);
  return kd(r);
}
function Tl(e) {
  return e.trim().replace(/["']/g, "");
}
function Td(e) {
  const t = /* @__PURE__ */ new Set();
  function n(r) {
    (r.style.fontFamily || getComputedStyle(r).fontFamily).split(",").forEach((l) => {
      t.add(Tl(l));
    }), Array.from(r.children).forEach((l) => {
      l instanceof HTMLElement && n(l);
    });
  }
  return n(e), t;
}
async function _d(e, t) {
  const n = await Cd(e, t), r = Td(e);
  return (await Promise.all(n.filter((l) => r.has(Tl(l.style.fontFamily))).map((l) => {
    const s = l.parentStyleSheet ? l.parentStyleSheet.href : null;
    return kl(l.cssText, s, t);
  }))).join(`
`);
}
async function Id(e, t) {
  const n = t.fontEmbedCSS != null ? t.fontEmbedCSS : t.skipFonts ? null : await _d(e, t);
  if (n) {
    const r = document.createElement("style"), a = document.createTextNode(n);
    r.appendChild(a), e.firstChild ? e.insertBefore(r, e.firstChild) : e.appendChild(r);
  }
}
async function _l(e, t = {}) {
  const { width: n, height: r } = bl(e, t), a = await yn(e, t, !0);
  return await Id(a, t), await Cl(a, t), Sd(a, t), await Vc(a, n, r);
}
async function Il(e, t = {}) {
  const { width: n, height: r } = bl(e, t), a = await _l(e, t), l = await cn(a), s = document.createElement("canvas"), i = s.getContext("2d"), o = t.pixelRatio || Gc(), c = t.canvasWidth || n, u = t.canvasHeight || r;
  return s.width = c * o, s.height = u * o, t.skipAutoScale || Hc(s), s.style.width = `${c}`, s.style.height = `${u}`, t.backgroundColor && (i.fillStyle = t.backgroundColor, i.fillRect(0, 0, s.width, s.height)), i.drawImage(l, 0, 0, s.width, s.height), s;
}
async function Ad(e, t = {}) {
  return (await Il(e, t)).toDataURL();
}
const zd = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  toCanvas: Il,
  toPng: Ad,
  toSvg: _l
}, Symbol.toStringTag, { value: "Module" }));
