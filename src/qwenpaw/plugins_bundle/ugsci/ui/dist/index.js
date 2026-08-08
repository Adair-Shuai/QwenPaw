function _() {
  var t;
  const e = (t = window.QwenPaw) == null ? void 0 : t.host;
  if (!e) throw new Error("[ugsci] QwenPaw.host not available");
  return e;
}
function Ga() {
  try {
    return _().getApiToken() || "";
  } catch {
    return "";
  }
}
function It(e) {
  return _().getApiUrl(e);
}
function Ha(e) {
  const t = Ga();
  return {
    "Content-Type": "application/json",
    ...t ? { Authorization: `Bearer ${t}` } : {},
    ...e
  };
}
function Wa(e) {
  const t = new Headers(e), a = {};
  return t.forEach((l, n) => {
    a[n] = l;
  }), a;
}
function Je(e, t) {
  const a = _(), l = Wa(t == null ? void 0 : t.headers);
  return a.fetch ? a.fetch(e, { ...t, headers: l }) : fetch(a.getApiUrl(e), {
    ...t,
    headers: { ...Ha(), ...l }
  });
}
const mt = /* @__PURE__ */ new Map(), Ja = 15e3;
function qa(e) {
  return e ? e instanceof Headers ? e.get("X-Agent-Id") || e.get("x-agent-id") || "" : e["X-Agent-Id"] || e["x-agent-id"] || "" : "";
}
function Ka(e, t, a) {
  return `${e}:${t}:${a}`;
}
function ut() {
  mt.clear();
}
function qt(e) {
  for (const [t, a] of mt)
    (e ? a.agentId === e : a.agentId) && mt.delete(t);
}
async function ie(e, t) {
  const a = ((t == null ? void 0 : t.method) || "GET").toUpperCase(), { bypassCache: l, ...n } = t || {}, r = qa(
    n.headers
  ), o = Ka(a, e, r);
  if (a !== "GET" && (r ? qt(r) : ut()), a === "GET" && !l) {
    const d = mt.get(o);
    if (d && Date.now() - d.ts < Ja)
      return d.data;
  }
  const c = await Je(e, n);
  if (!c.ok) {
    const d = await c.text().catch(() => "");
    throw new Error(d || `HTTP ${c.status}`);
  }
  if (c.status === 204) return null;
  const s = await c.json();
  return a === "GET" && mt.set(o, {
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
function st() {
  try {
    return localStorage.getItem("qwenpaw_sidebar_mode") === "simple";
  } catch {
    return !1;
  }
}
function zt(e, t) {
  const a = _();
  return a.ReactMarkdown && a.remarkGfm ? t.createElement(
    a.ReactMarkdown,
    { remarkPlugins: [a.remarkGfm] },
    e
  ) : e.replace(/\*\*(.+?)\*\*/g, "$1").replace(/\*(.+?)\*/g, "$1").replace(/`(.+?)`/g, "$1").replace(/^#+\s*/gm, "").replace(/^[-*]\s+/gm, "• ");
}
function $t({
  title: e,
  subtitle: t,
  extra: a
}) {
  const l = _().React, { Space: n } = _().antd;
  return l.createElement(
    "div",
    {
      style: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20,
        paddingBottom: 12,
        borderBottom: "1px solid var(--ant-color-border-secondary, #f0f0f0)"
      }
    },
    l.createElement(
      "div",
      null,
      l.createElement(
        "h2",
        { style: { margin: 0, fontSize: 20, fontWeight: 600 } },
        e
      ),
      t ? l.createElement(
        "div",
        { style: { marginTop: 4, fontSize: 13, color: "var(--ant-color-text-tertiary, #8c8c8c)" } },
        t
      ) : null
    ),
    a ? l.createElement(n, null, a) : null
  );
}
async function At() {
  const e = await ie("/agents");
  return (e == null ? void 0 : e.agents) || [];
}
async function Kt(e) {
  return ie(
    `/agents/${encodeURIComponent(e)}`
  );
}
async function Pt(e) {
  return await ie(
    `/agents/${encodeURIComponent(e)}/skills`
  ) || [];
}
async function Rt(e = !1) {
  return await ie(`/skills/pool${e ? "?summary=true" : ""}`) || [];
}
async function Va(e) {
  const t = await ie(
    `/skills/pool/${encodeURIComponent(e)}/content`
  );
  return (t == null ? void 0 : t.content) || "";
}
async function Xa() {
  return await ie(
    "/skills/workspaces"
  ) || [];
}
function at(e, t = "") {
  return `/agents/${encodeURIComponent(e)}/skills${t}`;
}
function Xn(e) {
  var a;
  const t = [];
  for (const l of e) {
    if (l.enabled === !1) continue;
    const n = (a = l.description) == null ? void 0 : a.trim();
    if (!n) continue;
    const r = (l.name || n).length > 20 ? (l.name || n).substring(0, 18) + "…" : l.name || n;
    let o = n;
    if (o = o.replace(/\*\*(.+?)\*\*/g, "$1").replace(/\*(.+?)\*/g, "$1").replace(/`(.+?)`/g, "$1").replace(/^#+\s*/gm, "").trim(), /^(用于|帮助|提供|支持|实现|完成|分析|计算|生成|创建|检查)/.test(o) ? o = `请${o}` : /^(a |an |the )/i.test(o) ? o = `Help me with ${o}` : /[。？！.?!]$/.test(o) || (o = `帮我${o}`), o.length > 80 && (o = o.substring(0, 77) + "..."), t.push({ label: r, value: o }), t.length >= 4) break;
  }
  return t;
}
async function Ya(e) {
  return await ie("/workspace/files", {
    headers: { "X-Agent-Id": e }
  }) || [];
}
async function Tt(e, t, a) {
  return ie(`/workspace/files/${encodeURIComponent(t)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify({ content: a })
  });
}
async function Qa(e, t, a, l) {
  return ie("/workspace/prompt-files", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify({ filename: t, content: a, enable: l })
  });
}
const Za = /* @__PURE__ */ new Set([
  "CON",
  "PRN",
  "AUX",
  "NUL",
  ...Array.from({ length: 9 }, (e, t) => `COM${t + 1}`),
  ...Array.from({ length: 9 }, (e, t) => `LPT${t + 1}`)
]);
function el(e) {
  let t = e.trim();
  if (!t) throw new Error("请输入文件名");
  if (/[\\/]/.test(t)) throw new Error("文件名不能包含路径分隔符");
  if (/[<>:\"|?*\u0000-\u001f]/.test(t))
    throw new Error("文件名包含系统不支持的字符");
  if (/[ .]$/.test(t)) throw new Error("文件名不能以空格或句点结尾");
  t.toLowerCase().endsWith(".md") ? t = `${t.slice(0, -3)}.md` : t += ".md";
  const a = t.split(".", 1)[0].toUpperCase();
  if (!t.slice(0, -3)) throw new Error("文件名不能为空");
  if (Za.has(a))
    throw new Error("该文件名是系统保留名称，请更换");
  if (new TextEncoder().encode(t).length > 255)
    throw new Error("文件名过长");
  return t;
}
async function tl(e, t) {
  const a = await Kt(e);
  a.system_prompt_files = t, await ie(`/agents/${encodeURIComponent(e)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(a)
  });
}
async function Vt(e, t) {
  await ie("/skills/pool/download", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      skill_name: t,
      targets: [{ workspace_id: e }],
      overwrite: !1
    })
  });
}
async function Yn(e, t) {
  await ie(
    at(e, `/${encodeURIComponent(t)}/enable`),
    {
      method: "POST"
    }
  );
}
async function Xt(e, t) {
  await ie(at(e, `/${encodeURIComponent(t)}`), {
    method: "DELETE"
  });
}
async function nl(e, t) {
  return ie(at(e, "/batch-enable"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(t)
  });
}
async function al(e, t) {
  return ie(at(e, "/batch-disable"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(t)
  });
}
async function ll(e, t) {
  return ie(at(e, "/batch-delete"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(t)
  });
}
async function Yt(e) {
  return await ie("/mcp", {
    headers: { "X-Agent-Id": e }
  }) || [];
}
async function Qn(e, t) {
  await ie(`/mcp/${encodeURIComponent(t)}`, {
    method: "DELETE",
    headers: { "X-Agent-Id": e }
  });
}
async function Qt(e, t) {
  return ie("/mcp", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify(t)
  });
}
async function rl(e, t) {
  return ie(
    `/mcp/toggle/${encodeURIComponent(t)}`,
    {
      method: "PATCH",
      headers: { "X-Agent-Id": e }
    }
  );
}
async function Zn(e, t) {
  await ie(
    at(e, `/${encodeURIComponent(t)}/disable`),
    {
      method: "POST"
    }
  );
}
async function ol(e) {
  await ie(`/skills/pool/${encodeURIComponent(e)}`, {
    method: "DELETE"
  });
}
function sl(e) {
  const t = (e || "").trim();
  if (!t) return { number: 6, unit: "h" };
  const a = t.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/i);
  if (!a) return { number: 6, unit: "h" };
  const l = parseInt(a[1] || "0", 10), n = parseInt(a[2] || "0", 10), r = parseInt(a[3] || "0", 10), o = l * 60 + n + Math.round(r / 60);
  return o <= 0 ? { number: 6, unit: "h" } : o >= 60 && o % 60 === 0 ? { number: o / 60, unit: "h" } : { number: o, unit: "m" };
}
function il(e) {
  return e.unit === "h" ? `${e.number}h` : `${e.number}m`;
}
async function cl(e) {
  return ie("/config/heartbeat", {
    headers: { "X-Agent-Id": e }
  });
}
async function dl(e, t) {
  return ie("/config/heartbeat", {
    method: "PUT",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify(t)
  });
}
async function ml(e) {
  await ie("/config/heartbeat/run", {
    method: "POST",
    headers: { "X-Agent-Id": e }
  });
}
async function ul(e) {
  return ie("/workspace/running-config", {
    headers: { "X-Agent-Id": e }
  });
}
async function pl(e, t) {
  return ie("/workspace/running-config", {
    method: "PUT",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify(t)
  });
}
async function gl(e) {
  return (await ie("/workspace/language", {
    headers: { "X-Agent-Id": e }
  })).language || "zh";
}
async function fl(e, t) {
  await ie("/workspace/language", {
    method: "PUT",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify({ language: t })
  });
}
async function yl() {
  return (await ie("/config/user-timezone")).timezone || "UTC";
}
async function El(e) {
  await ie("/config/user-timezone", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ timezone: e })
  });
}
async function hl(e) {
  return await ie("/workspace/system-prompt-files", {
    headers: { "X-Agent-Id": e }
  }) || [];
}
const zn = ["AGENTS.md", "SOUL.md", "PROFILE.md"];
function $n({
  items: e,
  max: t = 5,
  color: a = "blue",
  emptyText: l = "无"
}) {
  const n = _().React, { Tag: r } = _().antd;
  return !e || e.length === 0 ? n.createElement(
    "span",
    { style: { fontSize: 12, color: "var(--ant-color-text-quaternary, #bfbfbf)" } },
    l
  ) : n.createElement(
    "div",
    { style: { display: "flex", flexWrap: "wrap", gap: 4 } },
    ...e.slice(0, t).map(
      (o, c) => n.createElement(
        r,
        { key: c, color: a, style: { fontSize: 11, marginRight: 0 } },
        o
      )
    ),
    e.length > t ? n.createElement(
      r,
      { style: { fontSize: 11, marginRight: 0 } },
      `+${e.length - t}`
    ) : null
  );
}
function ea({
  open: e,
  onClose: t,
  poolSkills: a,
  installedSkillNames: l,
  loading: n,
  onInstall: r
}) {
  const o = _().React, { useState: c, useEffect: s, useMemo: d } = o, { Modal: m, Button: f, Empty: u, Spin: h, Input: x, Tag: C, Tooltip: b, Typography: v } = _().antd, { CheckOutlined: I, SearchOutlined: z } = _().antdIcons || {}, { Text: N } = v, [D, G] = c([]), [B, M] = c("");
  s(() => {
    e && (G([]), M(""));
  }, [e]);
  const A = d(() => {
    if (!B.trim()) return a;
    const w = B.toLowerCase();
    return a.filter(
      (E) => {
        var $, k;
        return E.name.toLowerCase().includes(w) || (($ = E.description) == null ? void 0 : $.toLowerCase().includes(w)) || ((k = E.tags) == null ? void 0 : k.some((q) => q.toLowerCase().includes(w)));
      }
    );
  }, [a, B]), H = A.filter(
    (w) => !l.includes(w.name)
  ), K = (w) => {
    G(
      (E) => E.includes(w) ? E.filter(($) => $ !== w) : [...E, w]
    );
  }, T = async () => {
    D.length !== 0 && (await r(D), G([]));
  };
  return o.createElement(
    m,
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
          N,
          { type: "secondary", style: { fontSize: 13 } },
          `已选择 ${D.length} 个技能`
        ),
        o.createElement(
          "div",
          { style: { display: "flex", gap: 8 } },
          o.createElement(f, { onClick: t }, "取消"),
          o.createElement(
            f,
            {
              type: "primary",
              onClick: T,
              disabled: D.length === 0
            },
            D.length > 0 ? `添加 (${D.length})` : "添加"
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
      o.createElement(x, {
        placeholder: "搜索技能名称、描述或标签...",
        prefix: z ? o.createElement(z) : void 0,
        value: B,
        onChange: (w) => M(w.target.value),
        allowClear: !0,
        style: { flex: 1 }
      }),
      o.createElement(
        f,
        {
          size: "small",
          type: "primary",
          onClick: () => G(H.map((w) => w.name))
        },
        "全选"
      ),
      o.createElement(
        f,
        {
          size: "small",
          onClick: () => G([])
        },
        "清空"
      )
    ),
    // Skill grid (card style matching Skill Center)
    n ? o.createElement(
      "div",
      { style: { textAlign: "center", padding: 40 } },
      o.createElement(h, { size: "large" })
    ) : A.length === 0 ? o.createElement(u, {
      description: B ? "未找到匹配的技能" : "技能池暂无可用技能",
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
      ...A.map((w) => {
        const E = D.includes(w.name), $ = l.includes(w.name);
        return o.createElement(
          "div",
          {
            key: w.name,
            onClick: () => !$ && K(w.name),
            style: {
              position: "relative",
              padding: "10px 12px",
              border: `1px solid ${E ? "var(--ant-color-primary, #0072f5)" : "var(--ant-color-border-secondary, #e8e8e8)"}`,
              borderRadius: 6,
              cursor: $ ? "not-allowed" : "pointer",
              transition: "all 0.15s ease",
              background: E ? "var(--ant-color-primary-bg, rgba(0, 114, 245, 0.06))" : $ ? "var(--ant-color-fill-quaternary, #fafafa)" : "var(--ant-color-bg-container, #fff)",
              opacity: $ ? 0.5 : 1,
              minHeight: 64
            }
          },
          E ? o.createElement(
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
            I ? o.createElement(I) : "✓"
          ) : null,
          $ ? o.createElement(
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
                paddingRight: $ || E ? 24 : 0
              }
            },
            o.createElement(
              "span",
              { style: { fontSize: 16 } },
              w.emoji || "⚡"
            ),
            o.createElement(
              b,
              { title: w.name },
              o.createElement(
                N,
                {
                  strong: !0,
                  style: {
                    fontSize: 13,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap"
                  }
                },
                w.name
              )
            )
          ),
          w.description ? o.createElement(
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
            w.description
          ) : null,
          w.tags && w.tags.length > 0 ? o.createElement(
            "div",
            {
              style: {
                marginTop: 4,
                display: "flex",
                gap: 2,
                flexWrap: "wrap"
              }
            },
            ...w.tags.slice(0, 2).map(
              (k, q) => o.createElement(
                C,
                {
                  key: q,
                  color: "cyan",
                  style: { fontSize: 10, marginRight: 0 }
                },
                k
              )
            )
          ) : null
        );
      })
    )
  );
}
function ta({
  agentId: e,
  systemPromptFiles: t,
  onRefresh: a
}) {
  const l = _().React, { useState: n, useEffect: r, useCallback: o, useRef: c } = l, {
    List: s,
    Tag: d,
    Switch: m,
    Button: f,
    Modal: u,
    Input: h,
    Spin: x,
    Empty: C,
    message: b,
    Typography: v,
    Segmented: I,
    Alert: z
  } = _().antd, { FileTextOutlined: N, PlusOutlined: D, EditOutlined: G, ReloadOutlined: B } = _().antdIcons || {}, { Text: M } = v, [A, H] = n([]), [K, T] = n(!0), [w, E] = n(
    t || []
  ), [$, k] = n(!1), [q, Z] = n(null), [U, P] = n(""), [p, te] = n(""), [W, S] = n(!1), [J, le] = n("source"), X = c(0), ee = o(async () => {
    const oe = ++X.current;
    T(!0);
    try {
      const ae = await Ya(e);
      oe === X.current && H(ae);
    } catch (ae) {
      oe === X.current && (b.error(ae.message || "加载工作区文档失败"), H([]));
    } finally {
      oe === X.current && T(!1);
    }
  }, [e]);
  r(() => {
    ee();
  }, [ee]), r(() => {
    E(t || []);
  }, [t]);
  const fe = async (oe, ae) => {
    const Ee = new Set(w);
    if (ae)
      Ee.add(oe);
    else {
      if (zn.includes(oe) && oe === "AGENTS.md") {
        b.warning("AGENTS.md 是核心文件，不能停用");
        return;
      }
      Ee.delete(oe);
    }
    const he = Array.from(Ee);
    E(he);
    try {
      await tl(e, he), b.success(ae ? "已启用记忆文件" : "已停用记忆文件"), a();
    } catch (ke) {
      b.error(ke.message || "更新失败"), E(t || []);
    }
  }, R = async (oe) => {
    try {
      const ae = await ie(
        `/workspace/files/${encodeURIComponent(oe)}`,
        { headers: { "X-Agent-Id": e } }
      );
      Z(oe), P(ae.content || ""), le("source"), k(!0);
    } catch (ae) {
      b.error(ae.message || "读取文件失败");
    }
  }, re = () => {
    Z(null), P(""), te(""), le("source"), k(!0);
  }, pe = async () => {
    let oe;
    try {
      oe = el(q || p);
    } catch (ae) {
      b.warning(ae.message || "文件名无效");
      return;
    }
    if (!U.trim()) {
      b.warning("Markdown 文档不能为空");
      return;
    }
    if (new TextEncoder().encode(U).length > 1024 * 1024) {
      b.warning("Markdown 文档不能超过 1 MB");
      return;
    }
    S(!0);
    try {
      if (q)
        await Tt(e, oe, U);
      else {
        const ae = await Qa(
          e,
          oe,
          U,
          !0
        );
        E(ae.system_prompt_files);
      }
      b.success("保存成功"), k(!1), ee(), a();
    } catch (ae) {
      const Ee = ae != null && ae.message ? `：${ae.message}` : "";
      b.error(
        q ? (ae == null ? void 0 : ae.message) || "保存失败" : `创建并挂载失败，服务端已回滚文件${Ee}`
      );
    } finally {
      S(!1);
    }
  };
  return K ? l.createElement(
    "div",
    { style: { textAlign: "center", padding: 40 } },
    l.createElement(x, { size: "large" })
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
        "div",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        N ? l.createElement(N, {
          style: { fontSize: 14, color: "var(--ant-color-primary, #1677ff)" }
        }) : null,
        l.createElement(
          M,
          { strong: !0 },
          `工作区文档 (${A.length})`
        ),
        l.createElement(
          M,
          { type: "secondary", style: { fontSize: 12 } },
          `· ${w.length} 个已挂载到系统提示`
        )
      ),
      l.createElement(
        "div",
        { style: { display: "flex", gap: 8 } },
        l.createElement(
          f,
          {
            size: "small",
            icon: B ? l.createElement(B) : void 0,
            onClick: ee
          },
          "刷新"
        ),
        l.createElement(
          f,
          {
            type: "primary",
            size: "small",
            icon: D ? l.createElement(D) : void 0,
            onClick: re
          },
          "新建 Markdown 文档"
        )
      )
    ),
    A.length === 0 ? l.createElement(C, {
      description: "暂无 Markdown 文档，点击「新建 Markdown 文档」添加",
      image: C.PRESENTED_IMAGE_SIMPLE
    }) : l.createElement(s, {
      dataSource: A,
      renderItem: (oe) => {
        const ae = w.includes(oe.filename), Ee = zn.includes(oe.filename);
        return l.createElement(
          s.Item,
          {
            actions: [
              l.createElement(
                f,
                {
                  type: "link",
                  size: "small",
                  icon: G ? l.createElement(G) : void 0,
                  onClick: () => R(oe.filename)
                },
                "编辑"
              )
            ]
          },
          l.createElement(s.Item.Meta, {
            avatar: l.createElement(N, {
              style: {
                fontSize: 20,
                color: ae ? "var(--ant-color-primary, #1677ff)" : "var(--ant-color-text-quaternary, #bfbfbf)"
              }
            }),
            title: l.createElement(
              "div",
              {
                style: {
                  display: "flex",
                  alignItems: "center",
                  gap: 6
                }
              },
              l.createElement(M, null, oe.filename),
              Ee ? l.createElement(
                d,
                { color: "default", style: { fontSize: 10 } },
                "内置"
              ) : l.createElement(
                d,
                { color: "cyan", style: { fontSize: 10 } },
                "工作文档"
              )
            ),
            description: l.createElement(
              "div",
              { style: { fontSize: 12 } },
              `${(oe.size / 1024).toFixed(1)} KB · 修改于 ${new Date(oe.modified_time).toLocaleString()}`
            )
          }),
          l.createElement(m, {
            checked: ae,
            size: "small",
            onChange: (he) => fe(oe.filename, he)
          })
        );
      }
    }),
    // Edit/New file modal
    l.createElement(
      u,
      {
        open: $,
        onCancel: () => k(!1),
        title: q ? `编辑 ${q}` : "新建 Markdown 文档",
        width: 700,
        onOk: pe,
        confirmLoading: W,
        okText: "保存"
      },
      q ? null : l.createElement(
        "div",
        { style: { marginBottom: 12 } },
        l.createElement(h, {
          placeholder: "文件名（如：油藏工程记忆库.md）",
          value: p,
          onChange: (oe) => te(oe.target.value),
          addonAfter: p.endsWith(".md") ? "" : ".md"
        })
      ),
      l.createElement(
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
        l.createElement(I, {
          size: "small",
          value: J,
          options: [
            { label: "源码", value: "source" },
            { label: "预览", value: "preview" }
          ],
          onChange: (oe) => le(oe)
        }),
        l.createElement(
          M,
          { type: "secondary", style: { fontSize: 12 } },
          `${U.length} 字符 · 约 ${Math.ceil(U.length / 4)} tokens · ${q && w.includes(q) ? "已挂载" : q ? "未挂载" : "保存后自动挂载"}`
        )
      ),
      U.trim() ? null : l.createElement(z, {
        type: "warning",
        showIcon: !0,
        message: "文档内容为空，保存前需要填写 Markdown 内容",
        style: { marginBottom: 10 }
      }),
      J === "source" ? l.createElement(h.TextArea, {
        value: U,
        onChange: (oe) => P(oe.target.value),
        rows: 14,
        placeholder: `输入 Markdown 内容...

例如：
# 某区块油藏基础参数

- 地层压力: 25 MPa
- 地层温度: 85°C
- 原油密度: 0.85 g/cm³`,
        style: { fontFamily: "monospace", fontSize: 13 }
      }) : l.createElement(
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
        zt(U, l)
      )
    )
  );
}
function vl({
  skills: e,
  agentId: t
}) {
  const a = _().React, { useMemo: l } = a, {
    List: n,
    Tag: r,
    Typography: o,
    Empty: c,
    Button: s,
    message: d
  } = _().antd, { ThunderboltOutlined: m, CopyOutlined: f } = _().antdIcons || {}, { Text: u } = o, h = l(() => Xn(e), [e]), x = (b) => {
    try {
      const v = _();
      v.setSelectedAgent && v.setSelectedAgent(t);
    } catch {
    }
    try {
      sessionStorage.setItem("ugsci_pending_prompt", b.value);
    } catch {
    }
    window.history.pushState({}, "", "/chat"), window.dispatchEvent(new PopStateEvent("popstate"));
  }, C = (b) => {
    var v;
    (v = navigator.clipboard) == null || v.writeText(b.value).then(() => {
      d.success("已复制到剪贴板");
    });
  };
  return h.length === 0 ? a.createElement(c, {
    description: "暂无推荐提问，请先为专家添加技能",
    image: c.PRESENTED_IMAGE_SIMPLE
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
      m ? a.createElement(m, {
        style: { fontSize: 14, color: "var(--ant-color-primary, #1677ff)" }
      }) : null,
      a.createElement(
        u,
        { strong: !0 },
        `推荐提问 (${h.length})`
      ),
      a.createElement(
        u,
        { type: "secondary", style: { fontSize: 12 } },
        "· 从技能描述中自动提取"
      )
    ),
    a.createElement(n, {
      dataSource: h,
      renderItem: (b, v) => a.createElement(
        n.Item,
        {
          actions: [
            a.createElement(
              s,
              {
                type: "link",
                size: "small",
                icon: f ? a.createElement(f) : void 0,
                onClick: () => C(b)
              },
              "复制"
            )
          ]
        },
        a.createElement(n.Item.Meta, {
          avatar: a.createElement(
            r,
            { color: "blue", style: { borderRadius: "50%" } },
            `${v + 1}`
          ),
          title: a.createElement(
            "div",
            {
              style: {
                cursor: "pointer",
                color: "var(--ant-color-primary, #1677ff)"
              },
              onClick: () => x(b)
            },
            b.value
          ),
          description: a.createElement(
            u,
            { type: "secondary", style: { fontSize: 12 } },
            b.label
          )
        })
      )
    })
  );
}
const tt = {
  marginBottom: 4,
  fontSize: 13,
  fontWeight: 500,
  color: "var(--ant-color-text, rgba(0,0,0,0.85))",
  display: "flex",
  alignItems: "center",
  gap: 4
}, na = { marginBottom: 16 }, aa = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "0 16px",
  marginBottom: 16
}, Ve = {
  fontSize: 13,
  fontWeight: 600,
  color: "var(--ant-color-text, rgba(0,0,0,0.85))",
  marginBottom: 12,
  paddingBottom: 8,
  borderBottom: "1px solid var(--ant-color-border-secondary, #f0f0f0)"
}, la = {
  fontSize: 12,
  color: "var(--ant-color-text-tertiary, rgba(0,0,0,0.45))",
  marginLeft: 8
};
function bl({ agentId: e }) {
  const t = _().React, { useState: a, useEffect: l, useCallback: n } = t, {
    Switch: r,
    InputNumber: o,
    Select: c,
    Button: s,
    Spin: d,
    Space: m,
    Typography: f,
    message: u
  } = _().antd, { PlayCircleOutlined: h, SaveOutlined: x } = _().antdIcons || {}, { Text: C } = f, [b, v] = a(!0), [I, z] = a(!1), [N, D] = a(!1), [G, B] = a(!1), [M, A] = a(6), [H, K] = a("h"), [T, w] = a("main"), [E, $] = a(300), [k, q] = a(!1), [Z, U] = a("08:00"), [P, p] = a("22:00"), te = n(async () => {
    var ee, fe;
    v(!0);
    try {
      const R = await cl(e), re = sl(R.every ?? "6h");
      B(R.enabled ?? !1), A(re.number), K(re.unit), w(R.target ?? "main"), $(R.timeoutSeconds ?? 300), q(!!R.activeHours), U(((ee = R.activeHours) == null ? void 0 : ee.start) ?? "08:00"), p(((fe = R.activeHours) == null ? void 0 : fe.end) ?? "22:00");
    } catch (R) {
      u.error(R.message || "加载心跳配置失败");
    } finally {
      v(!1);
    }
  }, [e]);
  l(() => {
    te();
  }, [te]);
  const W = async () => {
    z(!0);
    try {
      await dl(e, {
        enabled: G,
        every: il({ number: M, unit: H }),
        target: T,
        timeoutSeconds: E,
        activeHours: k && Z && P ? { start: Z, end: P } : void 0
      }), u.success("心跳配置已保存");
    } catch (ee) {
      u.error(ee.message || "保存心跳配置失败");
    } finally {
      z(!1);
    }
  }, S = async () => {
    D(!0);
    try {
      await ml(e), u.success("已触发心跳检查");
    } catch (ee) {
      u.error(ee.message || "触发心跳失败");
    } finally {
      D(!1);
    }
  };
  if (b)
    return t.createElement(
      "div",
      { style: { textAlign: "center", padding: 40 } },
      t.createElement(d, { size: "large" })
    );
  const J = (ee, fe, R) => t.createElement(
    "div",
    { style: na },
    t.createElement("div", { style: tt }, ee),
    fe,
    R ? t.createElement(
      C,
      { type: "secondary", style: la },
      R
    ) : null
  ), le = (ee, fe, R, re) => t.createElement(
    "div",
    { style: aa },
    t.createElement(
      "div",
      null,
      t.createElement("div", { style: tt }, ee),
      fe
    ),
    t.createElement(
      "div",
      null,
      t.createElement("div", { style: tt }, R),
      re
    )
  ), { Divider: X } = _().antd;
  return t.createElement(
    "div",
    { style: { paddingBottom: 8 } },
    // ── Section: 基本设置 ──
    t.createElement("div", { style: Ve }, "基本设置"),
    J(
      "启用心跳",
      t.createElement(r, {
        checked: G,
        onChange: (ee) => B(ee)
      }),
      G ? "已启用，专家将定期自检" : "已停用"
    ),
    le(
      "检查频率",
      t.createElement(
        m,
        null,
        t.createElement(o, {
          min: 1,
          value: M,
          onChange: (ee) => A(ee ?? 1),
          style: { width: "100%" }
        }),
        t.createElement(c, {
          value: H,
          onChange: (ee) => K(ee),
          style: { width: 90 },
          options: [
            { value: "m", label: "分钟" },
            { value: "h", label: "小时" }
          ]
        })
      ),
      "心跳目标",
      t.createElement(c, {
        value: T,
        onChange: (ee) => w(ee),
        style: { width: "100%" },
        options: [
          { value: "main", label: "主会话 (main)" },
          { value: "last", label: "最近会话 (last)" },
          { value: "inbox", label: "收件箱 (inbox)" }
        ]
      })
    ),
    J(
      "超时时间 (秒)",
      t.createElement(o, {
        min: 1,
        max: 3600,
        value: E,
        onChange: (ee) => $(ee ?? 300),
        style: { width: 200 }
      })
    ),
    // ── Section: 活跃时段 ──
    t.createElement(X, { style: { margin: "8px 0 16px" } }),
    t.createElement("div", { style: Ve }, "活跃时段"),
    J(
      "启用活跃时段限制",
      t.createElement(r, {
        checked: k,
        onChange: (ee) => q(ee)
      }),
      "仅在指定时段内触发心跳"
    ),
    k ? le(
      "开始时间",
      t.createElement("input", {
        type: "time",
        value: Z,
        onChange: (ee) => U(ee.target.value),
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
        value: P,
        onChange: (ee) => p(ee.target.value),
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
          icon: x ? t.createElement(x) : void 0,
          loading: I,
          onClick: W,
          style: je
        },
        "保存配置"
      ),
      t.createElement(
        s,
        {
          icon: h ? t.createElement(h) : void 0,
          loading: N,
          onClick: S
        },
        "立即执行"
      )
    )
  );
}
function wl({
  agentId: e,
  onRefresh: t
}) {
  const a = _().React, { useState: l, useEffect: n, useCallback: r } = a, {
    List: o,
    Tag: c,
    Switch: s,
    Button: d,
    Empty: m,
    Spin: f,
    Typography: u,
    message: h
  } = _().antd, { PlusOutlined: x, ReloadOutlined: C, DeleteOutlined: b } = _().antdIcons || {}, { Text: v, Paragraph: I } = u, [z, N] = l([]), [D, G] = l(!0), [B, M] = l(!1), [A, H] = l([]), [K, T] = l(!1), w = r(async () => {
    G(!0);
    try {
      const U = await Pt(e);
      N(U);
    } catch (U) {
      h.error(U.message || "加载技能失败"), N([]);
    } finally {
      G(!1);
    }
  }, [e]);
  n(() => {
    w();
  }, [w]);
  const E = async () => {
    M(!0), T(!0);
    try {
      const U = await Rt(!0);
      H(U);
    } catch (U) {
      h.error(U.message || "加载技能池失败");
    } finally {
      T(!1);
    }
  }, $ = async (U) => {
    let P = 0, p = 0;
    for (const te of U)
      try {
        await Vt(e, te), P++;
      } catch {
        p++;
      }
    P > 0 ? (h.success(
      `成功添加 ${P} 个技能${p > 0 ? `，${p} 个失败` : ""}`
    ), w(), t()) : p > 0 && h.error("添加技能失败"), M(!1);
  }, k = async (U, P) => {
    try {
      P ? await Yn(e, U.name) : await Zn(e, U.name), h.success(P ? "已启用" : "已停用"), w(), t();
    } catch (p) {
      h.error(p.message || "操作失败");
    }
  }, q = async (U) => {
    try {
      await Xt(e, U), h.success(`技能「${U}」已移除`), w(), t();
    } catch (P) {
      h.error(P.message || "移除技能失败");
    }
  };
  if (D)
    return a.createElement(
      "div",
      { style: { textAlign: "center", padding: 40 } },
      a.createElement(f, { size: "large" })
    );
  const Z = z.filter((U) => U.enabled !== !1);
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
        v,
        { strong: !0 },
        `技能列表 (${z.length}，已启用 ${Z.length})`
      ),
      a.createElement(
        "div",
        { style: { display: "flex", gap: 8 } },
        a.createElement(
          d,
          {
            size: "small",
            icon: C ? a.createElement(C) : void 0,
            onClick: () => {
              ut(), w();
            }
          },
          "刷新"
        ),
        a.createElement(
          d,
          {
            type: "primary",
            size: "small",
            icon: x ? a.createElement(x) : void 0,
            onClick: E,
            style: je
          },
          "从技能池添加"
        )
      )
    ),
    z.length === 0 ? a.createElement(m, {
      description: "该专家暂无技能",
      image: m.PRESENTED_IMAGE_SIMPLE
    }) : a.createElement(o, {
      dataSource: z,
      renderItem: (U) => a.createElement(
        o.Item,
        {
          actions: [
            a.createElement(s, {
              key: "toggle",
              size: "small",
              checked: U.enabled !== !1,
              onChange: (P) => k(U, P)
            }),
            a.createElement(
              d,
              {
                key: "del",
                type: "link",
                size: "small",
                danger: !0,
                icon: b ? a.createElement(b) : void 0,
                onClick: () => q(U.name)
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
            U.emoji ? a.createElement(
              "span",
              { style: { fontSize: 16 } },
              U.emoji
            ) : null,
            a.createElement(v, { strong: !0 }, U.name),
            U.version_text ? a.createElement(
              c,
              { style: { fontSize: 10 } },
              `v${U.version_text}`
            ) : null
          ),
          U.description ? a.createElement(
            I,
            {
              type: "secondary",
              style: { fontSize: 12, margin: 0 },
              ellipsis: { rows: 2 }
            },
            U.description
          ) : null
        )
      )
    }),
    a.createElement(ea, {
      open: B,
      onClose: () => M(!1),
      poolSkills: A,
      installedSkillNames: z.map((U) => U.name),
      loading: K,
      onInstall: $
    })
  );
}
function Sl({
  agentId: e,
  onRefresh: t,
  isActive: a
}) {
  const l = _().React, { useState: n, useEffect: r, useCallback: o } = l, {
    List: c,
    Tag: s,
    Button: d,
    Empty: m,
    Spin: f,
    Modal: u,
    Input: h,
    Typography: x,
    message: C
  } = _().antd, { PlusOutlined: b, ReloadOutlined: v, DeleteOutlined: I } = _().antdIcons || {}, { Text: z, Paragraph: N } = x, { TextArea: D } = h, [G, B] = n([]), [M, A] = n(!0), [H, K] = n(!1), [T, w] = n(`{
  "mcpServers": {
    "example-client": {
      "command": "npx",
      "args": ["-y", "@example/mcp-server"],
      "env": {}
    }
  }
}`), [E, $] = n(!1), k = o(async () => {
    A(!0);
    try {
      const P = await Yt(e);
      B(P);
    } catch (P) {
      C.error(P.message || "加载 MCP 失败"), B([]);
    } finally {
      A(!1);
    }
  }, [e]);
  r(() => {
    k();
  }, [k]), r(() => {
    a && k();
  }, [a, k]);
  const q = async (P) => {
    try {
      await rl(e, P), C.success("已切换 MCP 状态"), k(), t();
    } catch (p) {
      C.error(p.message || "切换失败");
    }
  }, Z = async (P) => {
    try {
      await Qn(e, P), C.success(`MCP「${P}」已移除`), k(), t();
    } catch (p) {
      C.error(p.message || "移除 MCP 失败");
    }
  }, U = async () => {
    $(!0);
    try {
      const P = JSON.parse(T), p = P.mcpServers || P, te = Object.entries(p);
      if (te.length === 0) {
        C.warning("未找到 MCP 客户端配置");
        return;
      }
      for (const [W, S] of te) {
        const J = S, le = J.url ? "streamable_http" : "stdio";
        await Qt(e, {
          client_key: W,
          client: {
            name: J.name || W,
            description: J.description || "",
            enabled: !0,
            transport: le,
            url: J.url || "",
            command: J.command || "",
            args: J.args || [],
            env: J.env || {},
            cwd: J.cwd || "",
            headers: J.headers || {}
          }
        });
      }
      C.success("MCP 客户端已创建"), K(!1), k(), t();
    } catch (P) {
      P instanceof SyntaxError ? C.error("JSON 格式错误：" + P.message) : C.error(P.message || "创建 MCP 失败");
    } finally {
      $(!1);
    }
  };
  return M ? l.createElement(
    "div",
    { style: { textAlign: "center", padding: 40 } },
    l.createElement(f, { size: "large" })
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
      l.createElement(z, { strong: !0 }, `MCP 客户端 (${G.length})`),
      l.createElement(
        "div",
        { style: { display: "flex", gap: 8 } },
        l.createElement(
          d,
          {
            size: "small",
            icon: v ? l.createElement(v) : void 0,
            onClick: () => {
              ut(), k();
            }
          },
          "刷新"
        ),
        l.createElement(
          d,
          {
            type: "primary",
            size: "small",
            icon: b ? l.createElement(b) : void 0,
            onClick: () => K(!0),
            style: je
          },
          "添加 MCP"
        )
      )
    ),
    G.length === 0 ? l.createElement(m, {
      description: "该专家暂无 MCP 客户端",
      image: m.PRESENTED_IMAGE_SIMPLE
    }) : l.createElement(c, {
      dataSource: G,
      renderItem: (P) => l.createElement(
        c.Item,
        {
          actions: [
            l.createElement(
              d,
              {
                key: "toggle",
                size: "small",
                onClick: () => q(P.key)
              },
              P.enabled ? "停用" : "启用"
            ),
            l.createElement(
              d,
              {
                key: "del",
                type: "link",
                size: "small",
                danger: !0,
                icon: I ? l.createElement(I) : void 0,
                onClick: () => Z(P.key)
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
            l.createElement("span", { style: { fontSize: 14 } }, "🔌"),
            l.createElement(z, { strong: !0 }, P.name || P.key),
            l.createElement(
              s,
              {
                color: P.enabled ? "green" : "default",
                style: { fontSize: 10 }
              },
              P.enabled ? "启用" : "停用"
            ),
            l.createElement(
              s,
              { color: "purple", style: { fontSize: 10 } },
              P.transport
            )
          ),
          P.description ? l.createElement(
            N,
            {
              type: "secondary",
              style: { fontSize: 12, margin: 0 },
              ellipsis: { rows: 2 }
            },
            P.description
          ) : null,
          P.tools && P.tools.length > 0 ? l.createElement(
            "div",
            { style: { marginTop: 4, fontSize: 11, color: "var(--ant-color-text-tertiary, #8c8c8c)" } },
            `提供 ${P.tools.length} 个工具`
          ) : null
        )
      )
    }),
    // Create MCP modal
    l.createElement(
      u,
      {
        open: H,
        title: "添加 MCP 客户端 (JSON)",
        onCancel: () => K(!1),
        onOk: U,
        confirmLoading: E,
        okText: "创建",
        width: 560
      },
      l.createElement(
        "div",
        { style: { marginBottom: 8, fontSize: 12, color: "var(--ant-color-text-tertiary, #8c8c8c)" } },
        "粘贴 MCP 配置 JSON（支持 mcpServers 格式），将创建到当前专家工作区："
      ),
      l.createElement(D, {
        value: T,
        onChange: (P) => w(P.target.value),
        rows: 12,
        style: { fontFamily: "monospace", fontSize: 12 }
      })
    )
  );
}
function xl({ agentId: e }) {
  const t = _().React, { useState: a, useEffect: l, useCallback: n, useRef: r } = t, {
    Card: o,
    InputNumber: c,
    Input: s,
    Select: d,
    Switch: m,
    Button: f,
    Spin: u,
    Space: h,
    Typography: x,
    Divider: C,
    message: b
  } = _().antd, { SaveOutlined: v } = _().antdIcons || {}, { Text: I } = x, [z, N] = a(!0), [D, G] = a(!1), B = r(null), [M, A] = a(60), [H, K] = a(""), [T, w] = a(!0), [E, $] = a(30), [k, q] = a("zh"), [Z, U] = a("UTC"), [P, p] = a(!0), [te, W] = a(100), [S, J] = a(!0), [le, X] = a(3), [ee, fe] = a(1), [R, re] = a(!0), [pe, oe] = a(3), [ae, Ee] = a(2), [he, ke] = a(60), [Ae, be] = a(1), [Q, we] = a(0), [ye, V] = a(1), [de, ge] = a(0), [F, y] = a(30), [me, j] = a(50), [g, ne] = a("light"), [ce, _e] = a("scroll"), [Ce, Oe] = a("remelight"), [Me, De] = a("AUTO"), Fe = n(async () => {
    var Y, Ie, ze, Pe, He, We;
    N(!0);
    try {
      const [Te, pt, Ot] = await Promise.all([
        ul(e),
        gl(e).catch(() => "zh"),
        yl().catch(() => "UTC")
      ]);
      B.current = Te, A(Te.shell_command_timeout ?? 60), K(Te.shell_command_executable ?? "");
      const lt = Te.auto_title_config ?? { enabled: !0, timeout_seconds: 30 };
      w(lt.enabled ?? !0), $(lt.timeout_seconds ?? 30), q(pt), U(Ot);
      const qe = Te.loop ?? {};
      p(((Y = qe.iteration) == null ? void 0 : Y.enabled) ?? !0), W(((Ie = qe.iteration) == null ? void 0 : Ie.max_iterations) ?? Te.max_iters ?? 100), J(((ze = qe.doom_loop) == null ? void 0 : ze.enabled) ?? !0), X(((Pe = qe.doom_loop) == null ? void 0 : Pe.window_size) ?? 3), fe(((He = qe.doom_loop) == null ? void 0 : He.similarity_threshold) ?? 1), re(Te.llm_retry_enabled ?? !0), oe(Te.llm_max_retries ?? 3), Ee(Te.llm_backoff_base ?? 2), ke(Te.llm_backoff_cap ?? 60), be(Te.llm_max_concurrent ?? 1), we(Te.llm_max_qpm ?? 0), V(Te.llm_rate_limit_pause ?? 1), ge(Te.llm_rate_limit_jitter ?? 0), y(Te.llm_acquire_timeout ?? 30), j(Te.history_max_length ?? 50), ne(Te.context_manager_backend ?? "light"), _e(((We = Te.light_context_config) == null ? void 0 : We.strategy) ?? "scroll"), Oe(Te.memory_manager_backend ?? "remelight"), De(Te.approval_level ?? "AUTO");
    } catch (Te) {
      b.error(Te.message || "加载运行配置失败");
    } finally {
      N(!1);
    }
  }, [e]);
  l(() => {
    Fe();
  }, [Fe]);
  const Le = async () => {
    var Ie, ze;
    const Y = B.current;
    if (Y) {
      G(!0);
      try {
        const Pe = {
          ...Y,
          max_iters: te,
          loop: {
            ...Y.loop ?? {},
            iteration: { enabled: P, max_iterations: te },
            doom_loop: {
              enabled: S,
              window_size: le,
              similarity_threshold: ee,
              stages: ((ze = (Ie = Y.loop) == null ? void 0 : Ie.doom_loop) == null ? void 0 : ze.stages) ?? []
            }
          },
          shell_command_timeout: M,
          shell_command_executable: H,
          auto_title_config: {
            enabled: T,
            timeout_seconds: E
          },
          llm_retry_enabled: R,
          llm_max_retries: pe,
          llm_backoff_base: ae,
          llm_backoff_cap: he,
          llm_max_concurrent: Ae,
          llm_max_qpm: Q,
          llm_rate_limit_pause: ye,
          llm_rate_limit_jitter: de,
          llm_acquire_timeout: F,
          history_max_length: me,
          context_manager_backend: g,
          light_context_config: {
            ...Y.light_context_config ?? {},
            strategy: ce
          },
          memory_manager_backend: Ce,
          approval_level: Me
        };
        await pl(e, Pe), B.current = Pe, k && await fl(e, k).catch(() => {
        }), Z && await El(Z).catch(() => {
        }), b.success("运行配置已保存");
      } catch (Pe) {
        b.error(Pe.message || "保存运行配置失败");
      } finally {
        G(!1);
      }
    }
  };
  if (z)
    return t.createElement(
      "div",
      { style: { textAlign: "center", padding: 40 } },
      t.createElement(u, { size: "large" })
    );
  const Se = (Y, Ie, ze) => t.createElement(
    "div",
    { style: na },
    t.createElement("div", { style: tt }, Y),
    Ie,
    ze ? t.createElement(
      I,
      { type: "secondary", style: la },
      ze
    ) : null
  ), Re = (Y, Ie, ze, Pe) => t.createElement(
    "div",
    { style: aa },
    t.createElement(
      "div",
      null,
      t.createElement("div", { style: tt }, Y),
      Ie
    ),
    t.createElement(
      "div",
      null,
      t.createElement("div", { style: tt }, ze),
      Pe
    )
  );
  return t.createElement(
    "div",
    { style: { paddingBottom: 8 } },
    // ── Section: 基础设置 ──
    t.createElement(
      "div",
      { style: Ve },
      "基础设置"
    ),
    Re(
      "Shell 命令超时 (秒)",
      t.createElement(c, {
        min: 1,
        value: M,
        onChange: (Y) => A(Y ?? 60),
        style: { width: "100%" }
      }),
      "Shell 可执行文件",
      t.createElement(s, {
        value: H,
        onChange: (Y) => K(Y.target.value),
        placeholder: "留空使用系统默认",
        style: { width: "100%" }
      })
    ),
    Re(
      "语言",
      t.createElement(d, {
        value: k,
        onChange: (Y) => q(Y),
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
        value: Z,
        onChange: (Y) => U(Y),
        style: { width: "100%" },
        showSearch: !0,
        filterOption: (Y, Ie) => {
          var ze;
          return (((ze = Ie == null ? void 0 : Ie.label) == null ? void 0 : ze.toString()) || "").toLowerCase().includes(Y.toLowerCase());
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
        ].map((Y) => ({ value: Y, label: Y }))
      })
    ),
    Re(
      "自动生成会话标题",
      t.createElement(h, null, t.createElement(m, {
        checked: T,
        onChange: (Y) => w(Y)
      })),
      "标题生成超时 (秒)",
      t.createElement(c, {
        min: 5,
        value: E,
        onChange: (Y) => $(Y ?? 30),
        style: { width: "100%" },
        disabled: !T
      })
    ),
    // ── Section: 审批级别 ──
    t.createElement(C, { style: { margin: "8px 0 16px" } }),
    t.createElement("div", { style: Ve }, "审批级别"),
    Se(
      "工具执行审批",
      t.createElement(d, {
        value: Me,
        onChange: (Y) => De(Y),
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
    t.createElement(C, { style: { margin: "8px 0 16px" } }),
    t.createElement("div", { style: Ve }, "迭代与循环"),
    Se(
      "启用迭代限制",
      t.createElement(m, {
        checked: P,
        onChange: (Y) => p(Y)
      }),
      "停止 Agent 前的最大循环轮次"
    ),
    P ? Se(
      "最大迭代次数",
      t.createElement(c, {
        min: 1,
        max: 500,
        value: te,
        onChange: (Y) => W(Y ?? 100),
        style: { width: "100%" }
      })
    ) : null,
    Se(
      "启用重复循环保护",
      t.createElement(m, {
        checked: S,
        onChange: (Y) => J(Y)
      }),
      "检测并阻止重复操作循环"
    ),
    S ? Re(
      "检测窗口大小",
      t.createElement(c, {
        min: 2,
        max: 20,
        value: le,
        onChange: (Y) => X(Y ?? 3),
        style: { width: "100%" }
      }),
      "相似度阈值",
      t.createElement(c, {
        min: 0,
        max: 1,
        step: 0.05,
        value: ee,
        onChange: (Y) => fe(Y ?? 1),
        style: { width: "100%" }
      })
    ) : null,
    // ── Section: LLM 重试 ──
    t.createElement(C, { style: { margin: "8px 0 16px" } }),
    t.createElement("div", { style: Ve }, "LLM 重试"),
    Se(
      "启用 LLM 重试",
      t.createElement(m, {
        checked: R,
        onChange: (Y) => re(Y)
      })
    ),
    Re(
      "最大重试次数",
      t.createElement(c, {
        min: 1,
        value: pe,
        onChange: (Y) => oe(Y ?? 3),
        style: { width: "100%" },
        disabled: !R
      }),
      "退避基数 (秒)",
      t.createElement(c, {
        min: 0.1,
        step: 0.1,
        value: ae,
        onChange: (Y) => Ee(Y ?? 2),
        style: { width: "100%" },
        disabled: !R
      })
    ),
    Se(
      "退避上限 (秒)",
      t.createElement(c, {
        min: 0.5,
        step: 0.5,
        value: he,
        onChange: (Y) => ke(Y ?? 60),
        style: { width: 200 },
        disabled: !R
      })
    ),
    // ── Section: LLM 限流 ──
    t.createElement(C, { style: { margin: "8px 0 16px" } }),
    t.createElement("div", { style: Ve }, "LLM 限流"),
    Re(
      "最大并发数",
      t.createElement(c, {
        min: 1,
        value: Ae,
        onChange: (Y) => be(Y ?? 1),
        style: { width: "100%" }
      }),
      "最大 QPM (0=不限)",
      t.createElement(c, {
        min: 0,
        step: 10,
        value: Q,
        onChange: (Y) => we(Y ?? 0),
        style: { width: "100%" }
      })
    ),
    Re(
      "限流暂停时间 (秒)",
      t.createElement(c, {
        min: 1,
        step: 0.5,
        value: ye,
        onChange: (Y) => V(Y ?? 1),
        style: { width: "100%" }
      }),
      "限流抖动 (秒)",
      t.createElement(c, {
        min: 0,
        step: 0.5,
        value: de,
        onChange: (Y) => ge(Y ?? 0),
        style: { width: "100%" }
      })
    ),
    Se(
      "获取超时 (秒)",
      t.createElement(c, {
        min: 10,
        step: 10,
        value: F,
        onChange: (Y) => y(Y ?? 30),
        style: { width: 200 }
      }),
      "应大于 限流暂停 + 抖动"
    ),
    // ── Section: 上下文与记忆 ──
    t.createElement(C, { style: { margin: "8px 0 16px" } }),
    t.createElement("div", { style: Ve }, "上下文与记忆"),
    Re(
      "上下文管理后端",
      t.createElement(d, {
        value: g,
        onChange: (Y) => ne(Y),
        style: { width: "100%" },
        options: [{ value: "light", label: "light" }]
      }),
      "上下文策略",
      t.createElement(d, {
        value: ce,
        onChange: (Y) => _e(Y),
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
        value: Ce,
        onChange: (Y) => Oe(Y),
        style: { width: "100%" },
        options: [
          { value: "remelight", label: "remelight" },
          { value: "adbpg", label: "adbpg" },
          { value: "none", label: "none (禁用)" }
        ]
      }),
      "历史消息最大长度",
      t.createElement(c, {
        min: 1,
        value: me,
        onChange: (Y) => j(Y ?? 50),
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
          icon: v ? t.createElement(v) : void 0,
          loading: D,
          onClick: Le,
          style: je
        },
        "保存运行配置"
      )
    )
  );
}
function kl({
  expert: e,
  open: t,
  onClose: a,
  onRefresh: l
}) {
  const n = _().React, { useState: r, useEffect: o, useCallback: c } = n, { Modal: s, Tabs: d, Spin: m, Typography: f } = _().antd, { SettingOutlined: u } = _().antdIcons || {}, { Text: h } = f, [x, C] = r([]), [b, v] = r(!1), [I, z] = r("heartbeat"), N = c(async () => {
    if (e) {
      v(!0);
      try {
        const M = await hl(e.agent.id);
        C(M);
      } catch {
        C([]);
      } finally {
        v(!1);
      }
    }
  }, [e]);
  if (o(() => {
    t && e && N();
  }, [t, e, N]), !e) return null;
  const { agent: D } = e, G = () => {
    N(), l();
  }, B = [
    {
      key: "heartbeat",
      label: "心跳",
      children: n.createElement(bl, {
        agentId: D.id
      })
    },
    {
      key: "files",
      label: "文件",
      children: b ? n.createElement(
        "div",
        { style: { textAlign: "center", padding: 40 } },
        n.createElement(m, { size: "large" })
      ) : n.createElement(ta, {
        agentId: D.id,
        systemPromptFiles: x,
        onRefresh: G
      })
    },
    {
      key: "skills",
      label: `技能 (${e.skills.filter((M) => M.enabled !== !1).length})`,
      children: n.createElement(wl, {
        agentId: D.id,
        onRefresh: l
      })
    },
    {
      key: "mcp",
      label: `MCP (${e.mcps.length})`,
      children: n.createElement(Sl, {
        agentId: D.id,
        onRefresh: l,
        isActive: I === "mcp"
      })
    },
    {
      key: "running",
      label: "运行配置",
      children: n.createElement(xl, {
        agentId: D.id
      })
    }
  ];
  return n.createElement(
    s,
    {
      open: t,
      title: n.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 8 } },
        u ? n.createElement(u, { style: { fontSize: 18 } }) : null,
        n.createElement("span", null, `配置 - ${D.name}`),
        n.createElement(
          h,
          { type: "secondary", style: { fontSize: 12, fontWeight: 400 } },
          D.id
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
    n.createElement(d, {
      items: B,
      activeKey: I,
      onChange: (M) => z(M),
      size: "small",
      tabBarStyle: { marginBottom: 16 }
    })
  );
}
const Cl = [
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
], Tl = Cl;
function An(e) {
  return It(`/ugsci/avatar/${encodeURIComponent(e)}`);
}
function Pn(e) {
  const t = e.map(encodeURIComponent).join(",");
  return It(`/ugsci/avatar/team/${t}`);
}
function Ge({
  name: e,
  size: t = 32,
  borderRadius: a = "50%"
}) {
  const l = _().React, [n, r] = l.useState(0), o = n === 0 ? An(e) : `${An(e)}?_r=${n}`;
  return l.createElement("img", {
    src: o,
    alt: e,
    onError: () => {
      n < 1 && r(n + 1);
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
function Zt({
  members: e,
  size: t = 32,
  borderRadius: a = "50%"
}) {
  const l = _().React, [n, r] = l.useState(0);
  if (!e || e.length === 0)
    return l.createElement("span", {
      style: {
        width: t,
        height: t,
        display: "inline-block"
      }
    });
  const o = e.slice(0, 5), c = n === 0 ? Pn(o) : `${Pn(o)}?_r=${n}`;
  return l.createElement("img", {
    src: c,
    alt: "team",
    onError: () => {
      n < 1 && r(n + 1);
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
async function Rn(e) {
  var a;
  const t = _();
  if (t.refreshAgents)
    try {
      await t.refreshAgents({ force: !0 });
    } catch (l) {
      console.warn("[ugsci] Failed to refresh newly created agent:", l);
      return;
    }
  (a = t.setSelectedAgent) == null || a.call(t, e);
}
function _l({
  expert: e,
  onClick: t,
  onSummon: a,
  onConfigure: l
}) {
  const n = _().React, { Card: r, Tag: o, Badge: c, Typography: s, Spin: d, Button: m, Tooltip: f } = _().antd, { Text: u } = s, { ThunderboltOutlined: h, SettingOutlined: x } = _().antdIcons || {}, { agent: C, skills: b, mcps: v, loading: I } = e, z = C.enabled, N = b.filter((B) => B.enabled !== !1).map((B) => B.name), D = v.map((B) => B.name || B.key), G = C.active_model ? `${C.active_model.provider_id}/${C.active_model.model}` : null;
  return n.createElement(
    r,
    {
      hoverable: !0,
      onClick: t,
      size: "small",
      style: {
        cursor: "pointer",
        transition: "all 0.2s ease",
        borderColor: z ? void 0 : "var(--ant-color-border, #d9d9d9)",
        opacity: z ? 1 : 0.7,
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
        n.createElement(Ge, { name: C.name, size: 36 }),
        n.createElement(
          "div",
          null,
          n.createElement(
            u,
            { strong: !0, style: { fontSize: 15 } },
            C.name
          ),
          n.createElement(
            "div",
            {
              style: {
                fontSize: 11,
                color: "var(--ant-color-text-quaternary, #bfbfbf)",
                fontFamily: "monospace"
              }
            },
            C.id
          )
        )
      ),
      n.createElement(c, {
        status: z ? "success" : "default",
        text: z ? "启用" : "停用"
      })
    ),
    // Description (rendered as markdown)
    C.description ? n.createElement(
      "div",
      {
        style: {
          fontSize: 12,
          color: "var(--ant-color-text-secondary, #595959)",
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
      zt(C.description, n)
    ) : n.createElement(
      "div",
      { style: { fontSize: 12, color: "var(--ant-color-text-quaternary, #bfbfbf)", marginBottom: 10, minHeight: 54, flex: "1 0 auto" } },
      "暂无描述"
    ),
    // Model info
    G ? n.createElement(
      "div",
      { style: { marginBottom: 8 } },
      n.createElement(
        o,
        { color: "geekblue", style: { fontSize: 11 } },
        `🤖 ${G}`
      )
    ) : null,
    // Skills
    I ? n.createElement(d, { size: "small" }) : n.createElement(
      "div",
      { style: { marginBottom: 6 } },
      n.createElement(
        "div",
        { style: { fontSize: 11, color: "var(--ant-color-text-tertiary, #8c8c8c)", marginBottom: 4 } },
        `技能 (${N.length})`
      ),
      n.createElement($n, {
        items: N,
        max: 4,
        color: "cyan",
        emptyText: "未配置技能"
      })
    ),
    // MCP
    !I && D.length > 0 ? n.createElement(
      "div",
      { style: { marginTop: "auto" } },
      n.createElement(
        "div",
        { style: { fontSize: 11, color: "var(--ant-color-text-tertiary, #8c8c8c)", marginBottom: 4 } },
        `MCP (${D.length})`
      ),
      n.createElement($n, {
        items: D,
        max: 3,
        color: "purple"
      })
    ) : null,
    // Bottom bar: gear icon (left) + summon button (right)
    n.createElement(
      "div",
      {
        style: {
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: 10,
          paddingTop: 8,
          borderTop: "1px solid var(--ant-color-border-secondary, #f0f0f0)"
        }
      },
      // Gear icon (bottom-left) — opens configuration modal
      n.createElement(
        f,
        { title: "配置专家", placement: "top" },
        n.createElement(
          m,
          {
            type: "text",
            size: "small",
            icon: x ? n.createElement(x, {
              style: { fontSize: 16, color: "var(--ant-color-text-tertiary, #8c8c8c)" }
            }) : void 0,
            onClick: (B) => {
              B.stopPropagation(), l && l();
            }
          }
        )
      ),
      // Summon button (bottom-right)
      n.createElement(
        m,
        {
          type: "primary",
          size: "small",
          icon: h ? n.createElement(h) : void 0,
          disabled: !z,
          onClick: (B) => {
            B.stopPropagation(), a && a();
          },
          style: je
        },
        "召唤专家"
      )
    )
  );
}
function Il({
  expert: e,
  open: t,
  onClose: a,
  onRefresh: l
}) {
  const n = _().React, {
    Drawer: r,
    Descriptions: o,
    Tag: c,
    Typography: s,
    Space: d,
    Button: m,
    Empty: f,
    Tabs: u,
    List: h,
    Spin: x,
    Modal: C,
    message: b
  } = _().antd, { Text: v, Paragraph: I } = s, {
    EditOutlined: z,
    ThunderboltOutlined: N,
    FileTextOutlined: D,
    ToolOutlined: G,
    PlusOutlined: B
  } = _().antdIcons || {}, [M, A] = n.useState(!1), [H, K] = n.useState(
    []
  ), [T, w] = n.useState(!1);
  if (!e) return null;
  const { agent: E, config: $, skills: k, mcps: q, loading: Z } = e, U = k.filter((R) => R.enabled !== !1), P = (R) => {
    window.history.pushState({}, "", R), window.dispatchEvent(new PopStateEvent("popstate"));
  }, p = n.createElement(
    "div",
    null,
    n.createElement(
      o,
      { column: 1, bordered: !0, size: "small" },
      n.createElement(o.Item, { label: "专家名称" }, E.name),
      n.createElement(
        o.Item,
        { label: "专家 ID" },
        n.createElement("code", { style: { fontSize: 12 } }, E.id)
      ),
      n.createElement(
        o.Item,
        { label: "状态" },
        n.createElement(
          c,
          { color: E.enabled ? "green" : "default" },
          E.enabled ? "启用" : "停用"
        )
      ),
      n.createElement(
        o.Item,
        { label: "功能简介" },
        E.description ? zt(E.description, n) : "暂无描述"
      ),
      n.createElement(
        o.Item,
        { label: "使用模型" },
        E.active_model ? `${E.active_model.provider_id} / ${E.active_model.model}` : "使用全局默认模型"
      ),
      $ != null && $.workspace_dir ? n.createElement(
        o.Item,
        { label: "工作区路径" },
        n.createElement(
          "code",
          { style: { fontSize: 11 } },
          $.workspace_dir
        )
      ) : null,
      $ != null && $.approval_level ? n.createElement(
        o.Item,
        { label: "审批级别" },
        $.approval_level
      ) : null
    ),
    // System prompt files
    $ != null && $.system_prompt_files && $.system_prompt_files.length > 0 ? n.createElement(
      "div",
      { style: { marginTop: 16 } },
      n.createElement(
        "div",
        {
          style: {
            display: "flex",
            alignItems: "center",
            gap: 6,
            marginBottom: 8
          }
        },
        D ? n.createElement(D, {
          style: { fontSize: 14, color: "var(--ant-color-primary, #1677ff)" }
        }) : null,
        n.createElement(v, { strong: !0 }, "系统提示词文件")
      ),
      n.createElement(
        d,
        { wrap: !0 },
        ...$.system_prompt_files.map(
          (R, re) => n.createElement(
            c,
            {
              key: re,
              icon: D ? n.createElement(D) : void 0,
              style: { fontSize: 12 }
            },
            R
          )
        )
      )
    ) : null
  ), te = async () => {
    A(!0), w(!0);
    try {
      const R = await Rt(!0);
      K(R);
    } catch (R) {
      b.error(R.message || "加载技能池失败");
    } finally {
      w(!1);
    }
  }, W = async (R) => {
    let re = 0, pe = 0;
    for (const oe of R)
      try {
        await Vt(E.id, oe), re++;
      } catch {
        pe++;
      }
    re > 0 ? (b.success(
      `成功添加 ${re} 个技能${pe > 0 ? `，${pe} 个失败` : ""}`
    ), l()) : pe > 0 && b.error("添加技能失败"), A(!1);
  }, S = async (R) => {
    try {
      await Xt(E.id, R), b.success(`技能「${R}」已移除`), l();
    } catch (re) {
      b.error(re.message || "移除技能失败");
    }
  }, J = async (R) => {
    try {
      await Qn(E.id, R), b.success(`MCP「${R}」已移除`), l();
    } catch (re) {
      b.error(re.message || "移除 MCP 失败");
    }
  }, le = Z ? n.createElement(
    "div",
    { style: { textAlign: "center", padding: 40 } },
    n.createElement(x, { size: "large" })
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
        v,
        { strong: !0 },
        `已启用技能 (${U.length})`
      ),
      n.createElement(
        m,
        {
          type: "primary",
          size: "small",
          icon: B ? n.createElement(B) : void 0,
          onClick: te
        },
        "从技能池添加"
      )
    ),
    U.length === 0 ? n.createElement(f, {
      description: "该专家暂无已启用的技能",
      image: f.PRESENTED_IMAGE_SIMPLE
    }) : n.createElement(h, {
      dataSource: U,
      renderItem: (R) => n.createElement(
        h.Item,
        {
          actions: [
            n.createElement(
              m,
              {
                type: "link",
                size: "small",
                danger: !0,
                onClick: () => S(R.name)
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
            R.emoji ? n.createElement(
              "span",
              { style: { fontSize: 16 } },
              R.emoji
            ) : null,
            n.createElement(v, { strong: !0 }, R.name),
            R.version_text ? n.createElement(
              c,
              { style: { fontSize: 10 } },
              `v${R.version_text}`
            ) : null
          ),
          R.description ? n.createElement(
            I,
            {
              type: "secondary",
              style: { fontSize: 12, margin: 0 },
              ellipsis: { rows: 2 }
            },
            R.description
          ) : null,
          R.tags && R.tags.length > 0 ? n.createElement(
            "div",
            { style: { marginTop: 4 } },
            ...R.tags.map(
              (re, pe) => n.createElement(
                c,
                {
                  key: pe,
                  color: "cyan",
                  style: { fontSize: 10 }
                },
                re
              )
            )
          ) : null
        )
      )
    }),
    // Skill Picker Modal (card-grid style, consistent with Skill Center)
    n.createElement(ea, {
      open: M,
      onClose: () => A(!1),
      poolSkills: H,
      installedSkillNames: U.map((R) => R.name),
      loading: T,
      onInstall: W
    })
  ), X = Z ? n.createElement(
    "div",
    { style: { textAlign: "center", padding: 40 } },
    n.createElement(x, { size: "large" })
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
        v,
        { strong: !0 },
        `MCP 客户端 (${q.length})`
      ),
      n.createElement(
        m,
        {
          type: "primary",
          size: "small",
          icon: B ? n.createElement(B) : void 0,
          onClick: () => {
            window.history.pushState({}, "", `/agents/${E.id}/mcp`), window.dispatchEvent(new PopStateEvent("popstate"));
          }
        },
        "配置 MCP"
      )
    ),
    q.length === 0 ? n.createElement(f, {
      description: "该专家暂无关联的 MCP 客户端，点击「配置 MCP」添加",
      image: f.PRESENTED_IMAGE_SIMPLE
    }) : n.createElement(h, {
      dataSource: q,
      renderItem: (R) => n.createElement(
        h.Item,
        {
          actions: [
            n.createElement(
              m,
              {
                type: "link",
                size: "small",
                danger: !0,
                onClick: () => J(R.key)
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
            n.createElement(
              "span",
              { style: { fontSize: 14 } },
              "🔌"
            ),
            n.createElement(
              v,
              { strong: !0 },
              R.name || R.key
            ),
            n.createElement(
              c,
              {
                color: R.enabled ? "green" : "default",
                style: { fontSize: 10 }
              },
              R.enabled ? "启用" : "停用"
            ),
            n.createElement(
              c,
              { color: "purple", style: { fontSize: 10 } },
              R.transport
            )
          ),
          R.description ? n.createElement(
            I,
            {
              type: "secondary",
              style: { fontSize: 12, margin: 0 },
              ellipsis: { rows: 2 }
            },
            R.description
          ) : null,
          R.tools && R.tools.length > 0 ? n.createElement(
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
  ), ee = $ != null && $.tools ? n.createElement(
    "div",
    { style: { padding: 16 } },
    n.createElement(
      "div",
      { style: { marginBottom: 12 } },
      n.createElement(
        "div",
        {
          style: {
            display: "flex",
            alignItems: "center",
            gap: 6,
            marginBottom: 8
          }
        },
        G ? n.createElement(G, {
          style: { fontSize: 14, color: "var(--ant-color-primary, #1677ff)" }
        }) : null,
        n.createElement(v, { strong: !0 }, "工具配置")
      ),
      n.createElement(
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
        JSON.stringify($.tools, null, 2)
      )
    )
  ) : n.createElement(f, {
    description: "暂无工具配置",
    image: f.PRESENTED_IMAGE_SIMPLE
  }), fe = [
    { key: "basic", label: "基本信息", children: p },
    {
      key: "skills",
      label: `技能 (${U.length})`,
      children: le
    },
    {
      key: "prompts",
      label: "推荐提问",
      children: n.createElement(vl, {
        skills: U,
        agentId: E.id
      })
    },
    {
      key: "knowledge",
      label: "专家记忆",
      children: n.createElement(ta, {
        agentId: E.id,
        systemPromptFiles: ($ == null ? void 0 : $.system_prompt_files) || [],
        onRefresh: () => l()
      })
    },
    { key: "mcp", label: `MCP (${q.length})`, children: X },
    { key: "tools", label: "工具配置", children: ee }
  ];
  return n.createElement(
    r,
    {
      title: n.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 8 } },
        n.createElement(Ge, { name: E.name, size: 28 }),
        n.createElement("span", null, E.name)
      ),
      open: t,
      onClose: a,
      width: 560,
      extra: n.createElement(
        d,
        null,
        n.createElement(
          m,
          {
            size: "small",
            icon: z ? n.createElement(z) : void 0,
            onClick: () => {
              a();
              try {
                const R = _();
                R.setSelectedAgent && R.setSelectedAgent(E.id);
              } catch (R) {
                console.warn("[ugsci] Failed to set selected agent:", R);
              }
              setTimeout(() => P("/agents"), 0);
            }
          },
          "编辑专家"
        ),
        n.createElement(
          m,
          {
            type: "primary",
            size: "small",
            icon: N ? n.createElement(N) : void 0,
            onClick: () => {
              a();
              try {
                const R = _();
                R.setSelectedAgent && R.setSelectedAgent(E.id);
              } catch (R) {
                console.warn("[ugsci] Failed to set selected agent:", R);
              }
              setTimeout(() => P("/chat"), 0);
            }
          },
          "开始对话"
        )
      )
    },
    n.createElement(u, {
      items: fe,
      defaultActiveKey: "basic"
    })
  );
}
function zl({
  open: e,
  onClose: t,
  onCreated: a
}) {
  const l = _().React, { useState: n } = l, {
    Modal: r,
    Card: o,
    Tag: c,
    Input: s,
    Row: d,
    Col: m,
    Spin: f,
    message: u,
    Typography: h
  } = _().antd, { Text: x } = h, { FileAddOutlined: C } = _().antdIcons || {}, [b, v] = n(!1), [I, z] = n(""), [N, D] = n(!1), G = async (A) => {
    v(!0);
    try {
      const H = await ie("/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: A.id || void 0,
          name: A.name,
          description: A.description,
          skill_names: A.skillNames
        })
      }), K = A.systemPrompt.trim() || `# ${A.name}

你是${A.name}。${A.description ? `

职责：${A.description}` : ""}
`, w = (await Promise.allSettled([
        Tt(H.id, "AGENTS.md", K),
        ...A.mcpClients.map(
          ({ clientKey: E, client: $ }) => Qt(H.id, {
            client_key: E,
            client: $
          })
        )
      ])).filter(
        (E) => E.status === "rejected"
      ).length;
      w > 0 ? u.warning(
        `专家「${A.name}」已创建，${w} 项初始配置失败，可在专家配置中重试`
      ) : u.success(`专家「${A.name}」创建成功`), await Rn(H.id), D(!1), setTimeout(() => {
        t(), a();
      }, 0);
    } catch (H) {
      u.error(H.message || "创建专家失败");
    } finally {
      v(!1);
    }
  }, B = Tl.filter((A) => {
    if (!I.trim()) return !0;
    const H = I.toLowerCase();
    return A.name.toLowerCase().includes(H) || A.description.toLowerCase().includes(H) || A.category.toLowerCase().includes(H);
  }), M = async (A) => {
    v(!0);
    try {
      const H = await ie("/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: A.name,
          description: A.description,
          skill_names: A.recommended_skills
        })
      });
      await Tt(H.id, "AGENTS.md", A.system_prompt);
      const K = await Kt(H.id);
      K.approval_level = A.approval_level, await ie(`/agents/${encodeURIComponent(H.id)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(K)
      }), await Rn(H.id), u.success(`专家「${A.name}」创建成功`), t(), a();
    } catch (H) {
      u.error(H.message || "创建专家失败");
    } finally {
      v(!1);
    }
  };
  return l.createElement(
    l.Fragment,
    null,
    l.createElement(
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
      l.createElement(
        "div",
        { style: { marginBottom: 16 } },
        l.createElement(s, {
          placeholder: "搜索模板名称或类别...",
          value: I,
          onChange: (A) => z(A.target.value),
          allowClear: !0
        })
      ),
      b ? l.createElement(
        "div",
        { style: { textAlign: "center", padding: 60 } },
        l.createElement(f, { size: "large" }),
        l.createElement(
          "div",
          { style: { marginTop: 12, color: "var(--ant-color-text-tertiary, #8c8c8c)" } },
          "正在创建专家..."
        )
      ) : l.createElement(
        d,
        { gutter: [12, 12] },
        // ── Blank template card (always first) ──
        I.trim() ? null : l.createElement(
          m,
          { xs: 24, sm: 12 },
          l.createElement(
            o,
            {
              hoverable: !0,
              size: "small",
              onClick: () => D(!0),
              style: {
                cursor: "pointer",
                height: "100%",
                border: "2px dashed var(--ant-color-border, #d9d9d9)",
                background: "var(--ant-color-fill-quaternary, #fafafa)"
              }
            },
            l.createElement(
              "div",
              {
                style: {
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 10,
                  marginBottom: 8
                }
              },
              l.createElement(
                "span",
                { style: { fontSize: 28, color: "var(--ant-color-text-tertiary, #8c8c8c)" } },
                C ? l.createElement(C) : "📝"
              ),
              l.createElement(
                "div",
                { style: { flex: 1 } },
                l.createElement(
                  x,
                  { strong: !0, style: { fontSize: 15 } },
                  "从空白模版开始创建"
                ),
                l.createElement(
                  "div",
                  null,
                  l.createElement(
                    c,
                    { color: "default", style: { fontSize: 10 } },
                    "空白"
                  )
                )
              )
            ),
            l.createElement(
              "div",
              {
                style: {
                  fontSize: 12,
                  color: "var(--ant-color-text-secondary, #595959)",
                  lineHeight: 1.5
                }
              },
              "创建一个全新的专家，不使用任何预设模板。创建后可自行配置系统提示词、技能和 MCP 客户端。"
            )
          )
        ),
        ...B.map(
          (A) => l.createElement(
            m,
            { key: A.id, xs: 24, sm: 12 },
            l.createElement(
              o,
              {
                hoverable: !0,
                size: "small",
                onClick: () => M(A),
                style: { cursor: "pointer", height: "100%" }
              },
              l.createElement(
                "div",
                {
                  style: {
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 10,
                    marginBottom: 8
                  }
                },
                l.createElement(Ge, {
                  name: A.name,
                  size: 40
                }),
                l.createElement(
                  "div",
                  { style: { flex: 1 } },
                  l.createElement(
                    x,
                    { strong: !0, style: { fontSize: 15 } },
                    A.name
                  ),
                  l.createElement(
                    "div",
                    null,
                    l.createElement(
                      c,
                      { color: "blue", style: { fontSize: 10 } },
                      A.category
                    ),
                    A.approval_level === "MANUAL" ? l.createElement(
                      c,
                      { color: "orange", style: { fontSize: 10 } },
                      "需审批"
                    ) : null
                  )
                )
              ),
              l.createElement(
                "div",
                {
                  style: {
                    fontSize: 12,
                    color: "var(--ant-color-text-secondary, #595959)",
                    lineHeight: 1.5
                  }
                },
                zt(A.description, l)
              )
            )
          )
        )
      )
    ),
    // ── Blank template creation modal (sibling, not nested inside Modal) ──
    l.createElement(Al, {
      open: N,
      onCancel: () => D(!1),
      onCreate: G
    })
  );
}
function it(e) {
  return typeof e == "object" && e !== null && !Array.isArray(e);
}
function $l(e) {
  const t = e.trim();
  if (!t) return [];
  const a = JSON.parse(t);
  if (!it(a))
    throw new Error("MCP 配置必须是 JSON 对象");
  const l = a.mcpServers ?? a;
  if (!it(l))
    throw new Error("mcpServers 必须是 JSON 对象");
  return Object.entries(l).map(([n, r]) => {
    const o = n.trim();
    if (!o || !it(r))
      throw new Error(`MCP「${n || "未命名"}」配置无效`);
    const c = typeof r.url == "string" ? r.url : "", s = typeof r.command == "string" ? r.command : "";
    if (!c && !s)
      throw new Error(`MCP「${o}」需要配置 url 或 command`);
    const m = (typeof r.transport == "string" ? r.transport : typeof r.type == "string" ? r.type : "") === "sse" ? "sse" : c ? "streamable_http" : "stdio";
    return {
      clientKey: o,
      client: {
        name: typeof r.name == "string" ? r.name : o,
        description: typeof r.description == "string" ? r.description : "",
        enabled: typeof r.enabled == "boolean" ? r.enabled : !0,
        transport: m,
        url: c,
        command: s,
        args: Array.isArray(r.args) ? r.args : [],
        env: it(r.env) ? r.env : {},
        cwd: typeof r.cwd == "string" ? r.cwd : "",
        headers: it(r.headers) ? r.headers : {}
      }
    };
  });
}
function Al({
  open: e,
  onCancel: t,
  onCreate: a
}) {
  const l = _().React, { useState: n, useEffect: r, useMemo: o } = l, {
    Modal: c,
    Input: s,
    Select: d,
    Button: m,
    Row: f,
    Col: u,
    Spin: h,
    Tag: x,
    Typography: C,
    message: b
  } = _().antd, { CheckCircleOutlined: v } = _().antdIcons || {}, { Text: I } = C, [z, N] = n(""), [D, G] = n(""), [B, M] = n(""), [A, H] = n(""), [K, T] = n([]), [w, E] = n([]), [$, k] = n(!1), [q, Z] = n(""), [U, P] = n(!1);
  r(() => {
    e && (N(""), G(""), M(""), H(""), E([]), Z(""), P(!1), k(!0), Rt(!0).then(T).catch((X) => {
      T([]), b.error(X.message || "加载技能池失败");
    }).finally(() => k(!1)));
  }, [e]);
  const p = D.trim(), te = o(() => p ? p.length < 2 || p.length > 64 ? "ID 长度需为 2-64 个字符" : /^[a-zA-Z0-9][a-zA-Z0-9_-]*[a-zA-Z0-9]$/.test(p) ? p === "default" ? "default 是系统保留 ID" : "" : "仅允许字母、数字、连字符和下划线，且不能以符号开头或结尾" : "", [p]), W = o(() => {
    try {
      return { clients: $l(q), error: "" };
    } catch (X) {
      return { clients: [], error: X.message || "MCP 配置无效" };
    }
  }, [q]), S = () => {
    const X = z.trim();
    if (!X) {
      b.warning("请输入专家名称");
      return;
    }
    if (te) {
      b.warning(te);
      return;
    }
    if (W.error) {
      b.warning(W.error);
      return;
    }
    P(!0), Promise.resolve(
      a({
        id: p,
        name: X,
        description: B.trim(),
        systemPrompt: A,
        skillNames: w,
        mcpClients: W.clients
      })
    ).finally(() => P(!1));
  }, J = () => {
    E(
      K.filter((X) => X.source === "builtin").map((X) => X.name)
    );
  }, le = (X, ee) => l.createElement(
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
    l.createElement(I, { strong: !0, style: { fontSize: 15 } }, X),
    ee ? l.createElement(I, { type: "secondary", style: { fontSize: 12 } }, ee) : null
  );
  return l.createElement(
    c,
    {
      open: e,
      title: "创建专家",
      onCancel: t,
      onOk: S,
      okText: "创建专家",
      cancelText: "取消",
      okButtonProps: { loading: U },
      maskClosable: !0,
      keyboard: !0,
      width: 880,
      styles: { body: { maxHeight: "72vh", overflowY: "auto", paddingTop: 8 } }
    },
    l.createElement(
      "div",
      { style: { paddingBottom: 20 } },
      le("基本信息", "ID 留空时自动生成"),
      l.createElement(
        f,
        { gutter: [16, 12] },
        l.createElement(
          u,
          { xs: 24, md: 12 },
          l.createElement(
            "label",
            { style: { display: "block", fontSize: 13, marginBottom: 6 } },
            "专家名称",
            l.createElement("span", { style: { color: "var(--ant-color-error, #ff4d4f)", marginLeft: 4 } }, "*")
          ),
          l.createElement(s, {
            placeholder: "例如：合同审查专家",
            value: z,
            onChange: (X) => N(X.target.value),
            maxLength: 50
          })
        ),
        l.createElement(
          u,
          { xs: 24, md: 12 },
          l.createElement(
            "label",
            { style: { display: "block", fontSize: 13, marginBottom: 6 } },
            "智能体 ID（可选）"
          ),
          l.createElement(s, {
            placeholder: "例如：contract-reviewer",
            value: D,
            onChange: (X) => G(X.target.value),
            maxLength: 64,
            status: te ? "error" : void 0
          }),
          te ? l.createElement("div", { style: { color: "var(--ant-color-error, #ff4d4f)", fontSize: 12, marginTop: 4 } }, te) : null
        ),
        l.createElement(
          u,
          { span: 24 },
          l.createElement(
            "label",
            { style: { display: "block", fontSize: 13, marginBottom: 6 } },
            "专家描述（可选）"
          ),
          l.createElement(s.TextArea, {
            placeholder: "简要描述该专家的职责和能力",
            value: B,
            onChange: (X) => M(X.target.value),
            rows: 2,
            maxLength: 200,
            showCount: !0
          })
        )
      )
    ),
    l.createElement(
      "div",
      { style: { borderTop: "1px solid var(--ant-color-border-secondary, #f0f0f0)", padding: "20px 0" } },
      le("角色指令", "保存为 AGENTS.md"),
      l.createElement(s.TextArea, {
        placeholder: "定义专家的角色、目标、工作方式和输出要求；留空时将根据名称与描述生成基础指令",
        value: A,
        onChange: (X) => H(X.target.value),
        rows: 6,
        style: { fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", fontSize: 12 }
      })
    ),
    l.createElement(
      "div",
      { style: { borderTop: "1px solid var(--ant-color-border-secondary, #f0f0f0)", paddingTop: 20 } },
      le("初始能力"),
      l.createElement(
        f,
        { gutter: [20, 16], align: "top" },
        l.createElement(
          u,
          { xs: 24, md: 12 },
          l.createElement(
            "div",
            { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 } },
            l.createElement(I, { strong: !0 }, "初始技能"),
            l.createElement(
              "div",
              { style: { display: "flex", gap: 4 } },
              l.createElement(m, { size: "small", onClick: J, disabled: $ }, "内置"),
              l.createElement(m, { size: "small", onClick: () => E([]), disabled: w.length === 0 }, "清空")
            )
          ),
          $ ? l.createElement("div", { style: { textAlign: "center", padding: 32 } }, l.createElement(h, { size: "small" })) : l.createElement(d, {
            mode: "multiple",
            value: w,
            onChange: E,
            placeholder: "搜索并选择技能",
            showSearch: !0,
            allowClear: !0,
            optionFilterProp: "label",
            maxTagCount: "responsive",
            style: { width: "100%" },
            options: K.map((X) => ({
              value: X.name,
              label: X.name
            })),
            notFoundContent: "暂无可用技能"
          }),
          l.createElement(
            "div",
            { style: { marginTop: 8, minHeight: 22 } },
            w.length > 0 ? l.createElement(x, { color: "blue" }, `已选择 ${w.length} 个技能`) : l.createElement(I, { type: "secondary", style: { fontSize: 12 } }, "暂不添加技能")
          )
        ),
        l.createElement(
          u,
          { xs: 24, md: 12 },
          l.createElement(I, { strong: !0, style: { display: "block", marginBottom: 8 } }, "初始 MCP"),
          l.createElement(s.TextArea, {
            placeholder: `{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem"]
    }
  }
}`,
            value: q,
            onChange: (X) => Z(X.target.value),
            rows: 8,
            status: W.error ? "error" : void 0,
            style: { fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", fontSize: 12 }
          }),
          l.createElement(
            "div",
            { style: { marginTop: 8, minHeight: 22 } },
            W.error ? l.createElement(I, { type: "danger", style: { fontSize: 12 } }, W.error) : W.clients.length > 0 ? l.createElement(
              x,
              {
                color: "green",
                icon: v ? l.createElement(v) : void 0
              },
              `已识别 ${W.clients.length} 个 MCP`
            ) : l.createElement(I, { type: "secondary", style: { fontSize: 12 } }, "暂不添加 MCP")
          )
        )
      )
    )
  );
}
const ra = "ugsci_custom_teams";
function Pl(e) {
  if (!e || typeof e != "object") return !1;
  const t = e;
  return typeof t.id == "string" && typeof t.name == "string" && typeof t.taskTemplate == "string" && typeof t.orchestrationPrompt == "string" && Array.isArray(t.members);
}
function ct() {
  try {
    const e = JSON.parse(
      localStorage.getItem(ra) || "[]"
    );
    return Array.isArray(e) ? e.filter(Pl) : [];
  } catch {
    return [];
  }
}
function en(e) {
  try {
    localStorage.setItem(ra, JSON.stringify(e));
  } catch {
  }
}
function Rl(e) {
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
function Ol(e) {
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
async function Gt(e = !0) {
  const t = await Je("/ugsci/team/custom");
  if (!t.ok) {
    const n = await t.text().catch(() => "");
    throw new Error(n || `HTTP ${t.status}`);
  }
  const l = (await t.json()).map(Ol);
  return e && en(l), l;
}
async function oa(e) {
  const t = await Je("/ugsci/team/custom", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(Rl(e))
  });
  if (!t.ok) {
    const l = await t.text().catch(() => "");
    throw new Error(l || `HTTP ${t.status}`);
  }
  const a = await t.json();
  return { ...e, id: a.team_id };
}
async function Ml(e) {
  const t = await Je(
    `/ugsci/team/custom/${encodeURIComponent(e)}`,
    { method: "DELETE" }
  );
  if (!t.ok && t.status !== 404) {
    const a = await t.text().catch(() => "");
    throw new Error(a || `HTTP ${t.status}`);
  }
}
async function Ll() {
  const e = ct();
  if (e.length === 0) return;
  const t = await Gt(!1), a = new Set(t.map((l) => l.id));
  await Promise.all(
    e.filter((l) => !a.has(l.id)).map((l) => oa(l))
  );
}
async function Bl(e) {
  var n, r;
  const t = (n = e.body) == null ? void 0 : n.getReader();
  if (!t) return;
  const a = new TextDecoder();
  let l = "";
  try {
    for (; ; ) {
      const { done: o, value: c } = await t.read();
      if (o) break;
      l += a.decode(c, { stream: !0 });
      let s;
      for (; (s = l.indexOf(`

`)) >= 0; ) {
        const d = l.slice(0, s);
        l = l.slice(s + 2);
        for (const m of d.split(`
`)) {
          if (!m.startsWith("data: ")) continue;
          const f = m.slice(6);
          let u;
          try {
            u = JSON.parse(f);
          } catch {
            continue;
          }
          if (u.error) {
            const h = u.error, x = typeof h == "string" ? h : (h == null ? void 0 : h.message) || "工作流启动失败";
            throw new Error(x);
          }
          if (u.object === "response" || u.type === "response") {
            const h = u.status;
            if (h === "failed" || h === "error") {
              const x = ((r = u.error) == null ? void 0 : r.message) || "工作流启动失败";
              throw new Error(x);
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
async function jl(e, t, a) {
  const l = `console:default:team-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, n = await Je("/chats", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Agent-Id": e
    },
    body: JSON.stringify({
      session_id: l,
      user_id: "default",
      channel: "console",
      name: a ? `团队：${a}` : "团队任务"
    })
  });
  if (!n.ok) {
    const s = await n.text().catch(() => "");
    throw new Error(
      s || `创建会话失败 (HTTP ${n.status})`
    );
  }
  const o = (await n.json()).id, c = await Je("/console/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Agent-Id": e
    },
    body: JSON.stringify({
      channel: "console",
      user_id: "default",
      session_id: l,
      stream: !0,
      input: [
        {
          role: "user",
          content: [{ type: "text", text: t }]
        }
      ]
    })
  });
  if (!c.ok) {
    const s = await c.text().catch(() => "");
    throw new Error(s || `HTTP ${c.status}`);
  }
  return await Bl(c), o;
}
function sa(e, t) {
  var n;
  const a = t.replace(/\s+/g, ""), l = e.find(
    (r) => r.name === t || r.name.replace(/\s+/g, "") === a
  );
  return l ? l.id : ((n = e.find(
    (r) => r.name.includes(t) || t.includes(r.name) || r.name.replace(/\s+/g, "").includes(a)
  )) == null ? void 0 : n.id) || null;
}
function ia() {
  var t;
  const e = (t = window.QwenPaw) == null ? void 0 : t.host;
  if (!e) throw new Error("[ugsci] QwenPaw.host not available");
  return e;
}
async function tn(e, t, a) {
  try {
    const l = await Je(e, {
      headers: t ? { "X-Agent-Id": t } : void 0,
      signal: a
    });
    return l.ok ? await l.json() : null;
  } catch {
    return null;
  }
}
function Ul(e, t) {
  return tn("/ugsci/team/state", e, t);
}
async function Nl(e, t) {
  const a = await Je("/ugsci/team/runs", {
    headers: { "X-Agent-Id": e },
    signal: t
  });
  if (!a.ok)
    throw new Error(`Failed to load team runs: ${a.status}`);
  return await a.json();
}
function On({ activeOnly: e = !1 }) {
  const t = ia(), a = t.React, { useCallback: l, useEffect: n, useRef: r, useState: o } = a, { Alert: c, Button: s, Card: d, Empty: m, Spin: f, Tag: u, Typography: h } = t.antd, { Text: x, Paragraph: C } = h, b = t.useSelectedAgent ? t.useSelectedAgent() : { id: "default" }, v = (b == null ? void 0 : b.id) || "default", [I, z] = o([]), [N, D] = o(!0), [G, B] = o(!1), M = r(null), A = r(0), H = l(async () => {
    var E;
    (E = M.current) == null || E.abort();
    const T = new AbortController();
    M.current = T;
    const w = ++A.current;
    D(!0);
    try {
      const $ = await Nl(v, T.signal);
      if (T.signal.aborted || w !== A.current) return;
      z($), B(!1);
    } catch {
      if (T.signal.aborted || w !== A.current) return;
      B(!0);
    } finally {
      !T.signal.aborted && w === A.current && D(!1);
    }
  }, [v]);
  if (n(() => (H(), () => {
    var T;
    (T = M.current) == null || T.abort(), A.current += 1;
  }), [H]), N) return a.createElement(f);
  if (G)
    return a.createElement(c, {
      type: "warning",
      message: "讨论运行记录加载失败",
      action: a.createElement(s, { size: "small", onClick: () => void H() }, "重试")
    });
  const K = I.filter(
    (T) => e ? T.status === "active" : T.status !== "active"
  );
  return K.length === 0 ? a.createElement(m, {
    description: e ? "暂无进行中的专家团讨论" : "暂无历史讨论"
  }) : a.createElement(
    "div",
    { style: { display: "flex", flexDirection: "column", gap: 8 } },
    ...K.map(
      (T) => a.createElement(
        d,
        { key: T.instance_id, size: "small" },
        a.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 8 } },
          a.createElement(x, { strong: !0 }, T.team_name || T.team_id),
          a.createElement(u, { color: T.status === "completed" ? "green" : T.status === "terminated" ? "orange" : "blue" }, T.status),
          a.createElement(u, null, T.current_phase),
          a.createElement(x, { type: "secondary" }, `迭代 ${T.iteration}`)
        ),
        a.createElement(C, { ellipsis: { rows: 2 }, style: { margin: "8px 0 0" } }, T.task || "暂无任务描述")
      )
    )
  );
}
async function Dl() {
  const e = await tn(
    "/ugsci/team/preset-teams"
  );
  return (e == null ? void 0 : e.teams) ?? null;
}
async function Fl() {
  const e = await tn(
    "/ugsci/team/roles"
  );
  return (e == null ? void 0 : e.roles) ?? null;
}
const Gl = {
  plan: { label: "规划", color: "#1677ff", icon: "📋" },
  dispatch: { label: "分派", color: "#13c2c2", icon: "🚀" },
  verify: { label: "验证", color: "#fa8c16", icon: "🔍" },
  synthesize: { label: "综合", color: "#722ed1", icon: "📊" },
  completed: { label: "完成", color: "#52c41a", icon: "✅" }
}, Mn = [
  "plan",
  "dispatch",
  "verify",
  "synthesize",
  "completed"
], Hl = 3;
function Wl() {
  const e = ia(), t = e.React, { useState: a, useEffect: l, useCallback: n, useRef: r } = t, { Card: o, Tag: c, Typography: s, Button: d, Steps: m, Empty: f, Alert: u } = e.antd, { ReloadOutlined: h } = e.antdIcons || {}, { Text: x, Paragraph: C } = s, b = e.useSelectedAgent ? e.useSelectedAgent() : { id: "default" }, v = (b == null ? void 0 : b.id) || "default", [I, z] = a(null), [N, D] = a(!1), G = r(null), B = r(0), M = r(0), A = r(null), H = n(
    async (p) => {
      var J;
      (J = A.current) == null || J.abort();
      const te = new AbortController();
      A.current = te;
      const W = ++M.current;
      p && D(!0);
      const S = await Ul(v, te.signal);
      te.signal.aborted || W !== M.current || (S ? (B.current = 0, G.current = S, z(S)) : B.current += 1, D(!1));
    },
    [v]
  ), K = n(() => H(!0), [H]);
  if (l(() => {
    var te;
    (te = A.current) == null || te.abort(), M.current += 1, B.current = 0, G.current = null, z(null), K();
    const p = window.setInterval(() => {
      var W, S;
      B.current >= Hl || ((W = G.current) == null ? void 0 : W.status) === "completed" || ((S = G.current) == null ? void 0 : S.status) === "terminated" || H(!1);
    }, 5e3);
    return () => {
      var W;
      window.clearInterval(p), (W = A.current) == null || W.abort(), M.current += 1;
    };
  }, [v, H, K]), (I == null ? void 0 : I.status) === "unreadable")
    return t.createElement(u, {
      type: "warning",
      showIcon: !0,
      message: "专家团状态暂时无法读取",
      description: `实例 ${I.instance_id || "未知"} 的状态文件需要检查。`,
      style: { marginBottom: 16 },
      action: t.createElement(
        d,
        { size: "small", onClick: K, loading: N },
        "重试"
      )
    });
  if (!I || !I.active) {
    if ((I == null ? void 0 : I.status) === "completed" || (I == null ? void 0 : I.status) === "terminated") {
      const p = I.status === "completed";
      return t.createElement(u, {
        type: p ? "success" : "info",
        showIcon: !0,
        message: p ? "专家团工作流已完成" : "专家团工作流已终止",
        description: p ? `实例 ${I.instance_id || "未知"} 已完成，结果文件保留在工作区。` : `原因：${I.state.termination_reason || "未知"}`,
        style: { marginBottom: 16 }
      });
    }
    return t.createElement(f, {
      description: "暂无活跃的专家团工作流",
      style: { padding: 24 }
    });
  }
  const T = I.state, w = T.current_phase || "plan", E = Mn.indexOf(w), $ = T.team_name || "未知团队", k = T.team_mode || "pipeline", q = T.iteration || 0, Z = T.members || [], U = T.verify_retries || 0, P = {
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
        t.createElement(x, { strong: !0 }, `${$} — 工作流状态`),
        t.createElement(
          c,
          { color: "blue", style: { fontSize: 10 } },
          P[k] || k
        ),
        t.createElement(
          c,
          { style: { fontSize: 10 } },
          `迭代 ${q}`
        ),
        U > 0 ? t.createElement(
          c,
          { color: "orange", style: { fontSize: 10 } },
          `验证重试 ${U}`
        ) : null
      ),
      extra: t.createElement(
        d,
        {
          size: "small",
          type: "text",
          icon: h ? t.createElement(h) : void 0,
          onClick: K,
          loading: N
        },
        "刷新"
      )
    },
    t.createElement(m, {
      current: E,
      size: "small",
      items: Mn.map((p) => {
        const te = Gl[p];
        return {
          title: `${te.icon} ${te.label}`,
          description: p === "plan" ? "分析任务，创建任务分解" : p === "dispatch" ? "分派专家执行任务" : p === "verify" ? "交叉验证专家结果" : p === "synthesize" ? "综合形成最终报告" : "工作流完成"
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
      ...Z.map(
        (p, te) => t.createElement(
          c,
          { key: `${p.name}-${te}`, style: { fontSize: 11 } },
          `${p.emoji || ""} ${p.name}（${p.role}）`
        )
      )
    ),
    T.task ? t.createElement(
      C,
      {
        style: {
          fontSize: 12,
          marginTop: 8,
          marginBottom: 0,
          color: "var(--ant-color-text-secondary, #666)"
        },
        ellipsis: { rows: 2 }
      },
      `任务: ${T.task}`
    ) : null
  );
}
function Jl({ team: e }) {
  const t = _().React, { Typography: a, Tag: l } = _().antd, { Text: n } = a, r = {
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
  }, c = e.steps || [], s = e.mode === "roundtable" || e.mode === "router", d = {
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
      n,
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
      ...c.length > 0 ? c.map((m, f) => [
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
          t.createElement(Ge, {
            name: m.agentName,
            size: 24
          }),
          t.createElement(
            "div",
            null,
            t.createElement(
              n,
              { strong: !0, style: { fontSize: 12 } },
              m.agentName
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
              m.instruction
            ),
            t.createElement(
              l,
              {
                ...m.passContext ? { color: "blue" } : {},
                style: { fontSize: 9, marginTop: 2 }
              },
              m.passContext ? "传递上下文" : "独立"
            )
          )
        )
      ]).flat() : e.members.map((m, f) => [
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
          t.createElement(Ge, {
            name: m.name,
            size: 24
          }),
          t.createElement(
            "div",
            null,
            t.createElement(
              n,
              { strong: !0, style: { fontSize: 12 } },
              m.name
            ),
            t.createElement(
              "div",
              { style: { fontSize: 11, color: "var(--ant-color-text-tertiary, #8c8c8c)" } },
              m.role
            )
          )
        )
      ]).flat()
    )
  );
}
function ht(e) {
  const t = e.replace(/\s+/g, "").toLowerCase();
  return t.includes("测井") ? "log-analyst" : t.includes("地球物理") ? "geophysicist" : t.includes("油藏") ? "reservoir-engineer" : t.includes("钻井") ? "drilling-engineer" : t.includes("采油") || t.includes("生产") ? "production-engineer" : t.includes("pvt") || t.includes("物性") ? "pvt-analyst" : t.includes("审核") || t.includes("verifier") ? "domain-reviewer" : t.includes("master") || t.includes("planner") ? "planner" : "analyst";
}
const ql = [
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
function Kl({
  open: e,
  onClose: t,
  agents: a,
  editingTeam: l,
  onSaved: n
}) {
  const r = _().React, { useState: o, useEffect: c, useCallback: s } = r, {
    Modal: d,
    Input: m,
    Button: f,
    Select: u,
    Tag: h,
    Typography: x,
    Switch: C,
    Empty: b,
    message: v,
    Divider: I,
    Steps: z
  } = _().antd, { PlusOutlined: N, DeleteOutlined: D, SaveOutlined: G, ArrowRightOutlined: B } = _().antdIcons || {}, { Text: M, Paragraph: A } = x, [H, K] = o(""), [T, w] = o("🤝"), [E, $] = o(""), [k, q] = o("pipeline"), [Z, U] = o(""), [P, p] = o(""), [te, W] = o([]), [S, J] = o([]), [le, X] = o(!1), [ee, fe] = o(2), [R, re] = o(""), [pe, oe] = o(""), [ae, Ee] = o({}), [he, ke] = o({}), [Ae, be] = o(
    ql
  ), Q = [
    { value: "pipeline", icon: "→", title: "顺序交接", description: "上一步产物成为下一位专家的上下文", topology: "A → B → C", accent: "#08979c" },
    { value: "roundtable", icon: "⇉", title: "并行汇聚", description: "独立并行分析，避免观点相互污染", topology: "A ∥ B ∥ C → 汇总", accent: "#531dab" },
    { value: "coordinator", icon: "◎", title: "主管协作", description: "主控专家拆解任务并按需组织成员", topology: "主管 → 专家组", accent: "#0958d9" },
    { value: "router", icon: "◇", title: "智能路由", description: "按任务能力需求选择最小充分专家集合", topology: "任务 → 路由 → 子集", accent: "#d46b08" },
    { value: "review_loop", icon: "↻", title: "评审迭代", description: "产出、独立审查、修订，直到满足标准", topology: "执行 ⇄ 评审", accent: "#389e0d" },
    { value: "debate", icon: "⚖", title: "多方论证", description: "独立立场、交叉质询，再由裁决者综合", topology: "观点 ⇄ 反驳 → 裁决", accent: "#c41d7f" }
  ];
  c(() => {
    e && (l ? (K(l.name), w(l.emoji), $(l.description), q(l.mode), U(l.coordinatorName || ""), p(l.taskTemplate), W(l.steps || []), J(l.members.map((y) => y.name)), fe(l.maxReviewRounds || 2), re(l.successCriteria || ""), oe(l.routingInstruction || ""), Ee(
      Object.fromEntries(
        l.members.map((y) => [
          y.name,
          y.bindingMode || (y.agentId ? "fixed" : "preferred")
        ])
      )
    ), ke(
      Object.fromEntries(
        l.members.map((y) => [
          y.name,
          y.roleKey || ht(y.name)
        ])
      )
    )) : (K(""), w("🤝"), $(""), q("pipeline"), U(""), p(`请执行以下任务：
任务描述：{任务描述}`), W([]), J([]), fe(2), re(""), oe(""), Ee({}), ke({})));
  }, [e, l]), c(() => {
    e && Fl().then((y) => {
      y != null && y.length && be(y);
    });
  }, [e]);
  const we = s(() => {
    if (k === "roundtable" || k === "debate" || k === "router") {
      const y = S.map((me) => ({
        agentName: me,
        instruction: "请给出你的专业评估意见",
        passContext: !1
      }));
      W(y);
    } else if (k === "pipeline") {
      const y = new Map(te.map((j) => [j.agentName, j])), me = S.map((j) => y.get(j) || {
        agentName: j,
        instruction: "请完成你的专业部分",
        passContext: !0
      });
      W(me);
    }
  }, [k, S, te]), ye = (y) => {
    S.includes(y) || (J([...S, y]), Ee({ ...ae, [y]: "fixed" }), ke({
      ...he,
      [y]: ht(y)
    }), (k === "coordinator" || k === "debate") && !Z && U(y));
  }, V = (y) => {
    const me = S.filter((ne) => ne !== y);
    J(me), W(te.filter((ne) => ne.agentName !== y));
    const j = { ...ae };
    delete j[y], Ee(j);
    const g = { ...he };
    delete g[y], ke(g), Z === y && U(me[0] || "");
  }, de = (y, me, j) => {
    const g = [...te];
    g[y] = { ...g[y], [me]: j }, W(g);
  }, ge = async () => {
    if (!H.trim()) {
      v.warning("请输入团队名称");
      return;
    }
    if (S.length < 2) {
      v.warning("至少需要选择 2 个成员");
      return;
    }
    if (!P.trim()) {
      v.warning("请输入任务模板");
      return;
    }
    if ((k === "coordinator" || k === "debate") && !Z) {
      v.warning(k === "debate" ? "请选择裁决者" : "请选择主控专家");
      return;
    }
    X(!0);
    try {
      let y = [...S];
      k === "coordinator" && Z ? y = [Z, ...y.filter((Ce) => Ce !== Z)] : k === "debate" && Z && (y = [...y.filter((Ce) => Ce !== Z), Z]);
      const me = y.map(
        (Ce) => {
          var Le;
          const Oe = a.find((Se) => Se.name === Ce), Me = ae[Ce] || "fixed", De = he[Ce] || ht(Ce), Fe = Ae.find((Se) => Se.key === De);
          return {
            name: Ce,
            role: (Fe == null ? void 0 : Fe.display_name) || ((Le = Oe == null ? void 0 : Oe.description) == null ? void 0 : Le.slice(0, 30)) || "需求分析师",
            emoji: "",
            agentId: Me === "temporary" || Oe == null ? void 0 : Oe.id,
            roleKey: De,
            bindingMode: Me
          };
        }
      );
      let j = te;
      (te.length === 0 || te.length !== S.length) && (j = S.map((Ce) => ({
        agentName: Ce,
        instruction: "请完成你的专业部分",
        passContext: k === "pipeline"
      })));
      const g = {
        id: (l == null ? void 0 : l.id) || `custom-${Date.now()}`,
        name: H.trim(),
        emoji: T,
        category: "自定义",
        description: E.trim() || `${H.trim()}（${S.length}人团队）`,
        mode: k,
        members: me,
        coordinatorName: k === "coordinator" || k === "debate" ? Z : void 0,
        taskTemplate: P.trim(),
        orchestrationPrompt: "",
        // Custom teams use steps-based instructions
        steps: j,
        custom: !0,
        createdAt: (l == null ? void 0 : l.createdAt) || Date.now(),
        maxReviewRounds: ee,
        successCriteria: R.trim(),
        routingInstruction: pe.trim()
      }, ne = await oa(g), ce = ct(), _e = ce.findIndex((Ce) => Ce.id === ne.id);
      _e >= 0 ? ce[_e] = ne : ce.push(ne), en(ce), v.success(l ? "团队已更新" : "团队已创建"), n(), t();
    } catch (y) {
      v.error(y.message || "保存失败");
    } finally {
      X(!1);
    }
  }, F = a.filter(
    (y) => !S.includes(y.name)
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
          l ? "✏️" : "➕"
        ),
        r.createElement(
          "span",
          null,
          l ? "编辑专家团" : "创建专家团"
        )
      ),
      width: 860,
      onOk: ge,
      okText: "保存专家团",
      confirmLoading: le,
      okButtonProps: {
        icon: G ? r.createElement(G) : void 0
      }
    },
    // Step 1: Basic info
    r.createElement(
      "div",
      { style: { marginBottom: 16 } },
      r.createElement(
        M,
        {
          strong: !0,
          style: { display: "block", marginBottom: 8, fontSize: 13 }
        },
        "1. 定义任务工作流"
      ),
      r.createElement(
        "div",
        { style: { display: "flex", gap: 8, marginBottom: 8, alignItems: "center" } },
        S.length > 0 ? r.createElement(Zt, {
          members: S,
          size: 36
        }) : null,
        r.createElement(m, {
          placeholder: "专家团名称（如：储层评价与质量复核专家团）",
          value: H,
          onChange: (y) => K(y.target.value),
          style: { flex: 1 }
        })
      ),
      r.createElement(m.TextArea, {
        placeholder: "说明这个工作流解决什么问题、适用于什么场景",
        value: E,
        onChange: (y) => $(y.target.value),
        rows: 2,
        style: { marginBottom: 8 }
      }),
      r.createElement(
        M,
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
        ...Q.map((y) => {
          const me = k === y.value;
          return r.createElement(
            "button",
            {
              key: y.value,
              type: "button",
              onClick: () => {
                q(y.value), y.value !== "coordinator" && y.value !== "debate" && U("");
              },
              style: {
                textAlign: "left",
                padding: 10,
                borderRadius: 8,
                cursor: "pointer",
                background: me ? `${y.accent}0d` : "var(--ant-color-bg-container, #fff)",
                border: `1px solid ${me ? y.accent : "var(--ant-color-border, #d9d9d9)"}`,
                boxShadow: me ? `0 0 0 2px ${y.accent}1a` : "none"
              }
            },
            r.createElement(
              "div",
              { style: { display: "flex", alignItems: "center", gap: 7, color: y.accent, fontWeight: 600 } },
              r.createElement("span", { style: { fontSize: 18 } }, y.icon),
              y.title
            ),
            r.createElement("div", { style: { fontSize: 11, color: "var(--ant-color-text-secondary, #595959)", marginTop: 5, lineHeight: 1.45 } }, y.description),
            r.createElement("div", { style: { fontSize: 10, color: y.accent, marginTop: 5, fontFamily: "monospace" } }, y.topology)
          );
        })
      )
    ),
    r.createElement(I, { style: { margin: "12px 0" } }),
    // Step 2: Select members
    r.createElement(
      "div",
      { style: { marginBottom: 16 } },
      r.createElement(
        M,
        {
          strong: !0,
          style: { display: "block", marginBottom: 8, fontSize: 13 }
        },
        "2. 配置专家角色"
      ),
      // Available agents
      F.length > 0 ? r.createElement(
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
        ...F.map(
          (y) => r.createElement(
            f,
            {
              key: y.id,
              size: "small",
              icon: N ? r.createElement(N) : void 0,
              onClick: () => ye(y.name)
            },
            y.name
          )
        )
      ) : null,
      // Selected members
      S.length === 0 ? r.createElement(b, {
        description: "请从上方添加团队成员",
        image: b.PRESENTED_IMAGE_SIMPLE
      }) : r.createElement(
        "div",
        { style: { display: "flex", flexDirection: "column", gap: 4 } },
        ...S.map(
          (y) => r.createElement(
            "div",
            {
              key: y,
              style: {
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "6px 10px",
                background: "var(--ant-color-primary-bg, #f0f5ff)",
                borderRadius: 6,
                border: "1px solid var(--ant-color-primary-border, #d6e4ff)"
              }
            },
            r.createElement(
              "div",
              { style: { display: "flex", alignItems: "center", gap: 6 } },
              r.createElement(Ge, { name: y, size: 24 }),
              r.createElement(
                M,
                { strong: !0, style: { fontSize: 13 } },
                y
              ),
              (k === "coordinator" || k === "debate") && Z === y ? r.createElement(
                h,
                { color: "blue", style: { fontSize: 10 } },
                k === "debate" ? "裁决者" : "主控"
              ) : null
            ),
            r.createElement(
              "div",
              { style: { display: "flex", gap: 4 } },
              r.createElement(u, {
                size: "small",
                value: he[y] || ht(y),
                style: { width: 132 },
                onChange: (me) => ke({ ...he, [y]: me }),
                options: Ae.map((me) => ({
                  value: me.key,
                  label: me.display_name
                }))
              }),
              r.createElement(u, {
                size: "small",
                value: ae[y] || "fixed",
                style: { width: 118 },
                onChange: (me) => Ee({ ...ae, [y]: me }),
                options: [
                  { value: "fixed", label: "固定实例" },
                  { value: "preferred", label: "优先实例" },
                  { value: "temporary", label: "临时派生" }
                ]
              }),
              k === "coordinator" || k === "debate" ? r.createElement(
                f,
                {
                  size: "small",
                  type: "link",
                  onClick: () => U(y)
                },
                k === "debate" ? "设为裁决者" : "设为主控"
              ) : null,
              r.createElement(
                f,
                {
                  size: "small",
                  type: "link",
                  danger: !0,
                  icon: D ? r.createElement(D) : void 0,
                  onClick: () => V(y)
                },
                "移除"
              )
            )
          )
        )
      )
    ),
    k === "review_loop" || k === "router" ? r.createElement(
      "div",
      {
        style: {
          margin: "0 0 16px",
          padding: 12,
          borderRadius: 8,
          background: "var(--ant-color-fill-quaternary, #fafafa)",
          border: "1px solid var(--ant-color-border-secondary, #f0f0f0)"
        }
      },
      k === "review_loop" ? r.createElement(
        "div",
        { style: { display: "grid", gridTemplateColumns: "150px 1fr", gap: 10 } },
        r.createElement(u, {
          value: ee,
          onChange: (y) => fe(y),
          options: [1, 2, 3, 4, 5].map((y) => ({ value: y, label: `最多 ${y} 轮` }))
        }),
        r.createElement(m, {
          value: R,
          onChange: (y) => re(y.target.value),
          placeholder: "验收标准，例如：关键结论均有数据依据，且无高风险缺陷"
        })
      ) : r.createElement(m, {
        value: pe,
        onChange: (y) => oe(y.target.value),
        placeholder: "路由偏好，例如：仅调用任务必需的专家；涉及模拟时优先油藏工程师"
      })
    ) : null,
    r.createElement(I, { style: { margin: "12px 0" } }),
    // Step 3: Define execution steps (for pipeline/roundtable)
    S.length > 0 ? r.createElement(
      "div",
      { style: { marginBottom: 16 } },
      r.createElement(
        M,
        {
          strong: !0,
          style: { display: "block", marginBottom: 8, fontSize: 13 }
        },
        `3. 配置专家任务${k === "roundtable" ? "（并行独立）" : k === "pipeline" ? "（顺序交接）" : k === "router" ? "（作为候选能力）" : k === "review_loop" ? "（首位执行、末位评审）" : k === "debate" ? "（末位为裁决者）" : "（由主控动态编排）"}`
      ),
      // Auto-sync button
      r.createElement(
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
      te.length === 0 ? r.createElement(
        M,
        { type: "secondary", style: { fontSize: 12 } },
        "点击「自动生成步骤」或手动配置每步的指令"
      ) : r.createElement(
        "div",
        { style: { display: "flex", flexDirection: "column", gap: 6 } },
        ...te.map(
          (y, me) => r.createElement(
            "div",
            {
              key: me,
              style: {
                padding: 8,
                background: "var(--ant-color-bg-container, #fff)",
                borderRadius: 6,
                border: "1px solid var(--ant-color-border-secondary, #e8e8e8)"
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
              k === "pipeline" ? r.createElement(
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
                h,
                { color: "blue", style: { fontSize: 11 } },
                y.agentName
              ),
              r.createElement(
                "div",
                { style: { flex: 1 } },
                r.createElement(m, {
                  placeholder: "请输入该步骤的指令...",
                  value: y.instruction,
                  onChange: (j) => de(me, "instruction", j.target.value),
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
              r.createElement(C, {
                size: "small",
                checked: y.passContext,
                onChange: (j) => de(me, "passContext", j)
              }),
              r.createElement(
                M,
                { type: "secondary", style: { fontSize: 11 } },
                y.passContext ? "传递上一步结果作为上下文" : "独立执行"
              )
            )
          )
        )
      )
    ) : null,
    r.createElement(I, { style: { margin: "12px 0" } }),
    // Step 4: Task template
    r.createElement(
      "div",
      null,
      r.createElement(
        M,
        {
          strong: !0,
          style: { display: "block", marginBottom: 8, fontSize: 13 }
        },
        `${S.length > 0 ? "4" : "3"}. 任务模板`
      ),
      r.createElement(m.TextArea, {
        placeholder: `输入任务模板，可用 {参数名} 作为占位符...

例如：
请对区块 {区块名} 的井 {井号} 进行储层评价`,
        value: P,
        onChange: (y) => p(y.target.value),
        rows: 4,
        style: { fontFamily: "monospace", fontSize: 13 }
      }),
      r.createElement(
        M,
        {
          type: "secondary",
          style: { fontSize: 11, display: "block", marginTop: 4 }
        },
        "占位符 {参数名} 在发起任务时可由用户填写替换"
      )
    )
  );
}
function Ln({
  team: e,
  agents: t,
  onLaunch: a,
  onEdit: l,
  onDelete: n
}) {
  var w;
  const r = _().React, { useState: o } = r, { Card: c, Tag: s, Typography: d, Button: m, Tooltip: f, Popconfirm: u } = _().antd, {
    TeamOutlined: h,
    RocketOutlined: x,
    UserOutlined: C,
    EditOutlined: b,
    DeleteOutlined: v,
    DownOutlined: I,
    UpOutlined: z
  } = _().antdIcons || {}, { Text: N, Paragraph: D } = d, [G, B] = o(!1), M = {
    coordinator: { label: "主管协作", color: "blue" },
    pipeline: { label: "顺序交接", color: "cyan" },
    roundtable: { label: "并行汇聚", color: "purple" },
    router: { label: "智能路由", color: "orange" },
    review_loop: { label: "评审迭代", color: "green" },
    debate: { label: "多方论证", color: "magenta" }
  }, A = M[e.mode] || M.coordinator, H = e.members.map((E) => {
    const $ = E.bindingMode === "temporary", k = $ ? null : (E.agentId && t.some((q) => q.id === E.agentId) ? E.agentId : null) || sa(t, E.name);
    return { ...E, found: !!k, agentId: k, temporary: $ };
  }), K = H.filter((E) => E.found).length, T = e.coordinatorName || ((w = e.members[0]) == null ? void 0 : w.name);
  return r.createElement(
    c,
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
      r.createElement(Zt, {
        members: e.members.map((E) => E.name),
        size: 36
      }),
      r.createElement(
        "div",
        { style: { flex: 1 } },
        r.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 6 } },
          r.createElement(
            N,
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
            { color: A.color, style: { fontSize: 10 } },
            A.label
          ),
          r.createElement(
            s,
            { color: "green", style: { fontSize: 10 } },
            `${e.members.length} 位专家`
          ),
          K < e.members.length ? r.createElement(
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
        l ? r.createElement(
          f,
          { title: "编辑" },
          r.createElement(m, {
            type: "text",
            size: "small",
            icon: b ? r.createElement(b) : void 0,
            onClick: (E) => {
              E.stopPropagation(), l(e);
            }
          })
        ) : null,
        n ? r.createElement(
          f,
          { title: "删除" },
          r.createElement(
            u,
            {
              title: `删除专家团「${e.name}」？`,
              description: "此操作会删除后端定义，但不会删除既有讨论记录。",
              okText: "删除",
              cancelText: "取消",
              okButtonProps: { danger: !0 },
              onConfirm: () => n(e)
            },
            r.createElement(m, {
              type: "text",
              size: "small",
              danger: !0,
              icon: v ? r.createElement(v) : void 0,
              onClick: (E) => E.stopPropagation()
            })
          )
        ) : null
      ) : null
    ),
    // Description
    r.createElement(
      D,
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
      ...H.map(
        (E) => r.createElement(
          f,
          {
            key: E.name,
            title: `${E.name}（${E.role}）${E.temporary ? " - OMP 临时派生" : E.found ? " - 已绑定实例" : " - OMP 按角色派发"}`
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
                background: E.found ? "var(--ant-color-primary-bg, #f0f5ff)" : "var(--ant-color-fill-tertiary, #f0f0ff)",
                border: `1px solid ${E.found ? "var(--ant-color-primary-border, #d6e4ff)" : "var(--ant-color-purple, #d3adf7)"}`,
                fontSize: 11
              }
            },
            r.createElement(Ge, { name: E.name, size: 18 }),
            r.createElement(
              N,
              {
                style: { fontSize: 11, color: E.found ? "var(--ant-color-primary-text, #1f4e8c)" : "var(--ant-color-purple, #531dab)" }
              },
              E.name
            ),
            E.temporary ? r.createElement(
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
      m,
      {
        type: "link",
        size: "small",
        style: { padding: "0 0 4px 0", fontSize: 11, height: "auto" },
        onClick: (E) => {
          E.stopPropagation(), B(!G);
        },
        icon: G ? z ? r.createElement(z) : "▲" : I ? r.createElement(I) : "▼"
      },
      G ? "收起流程" : "查看执行流程"
    ),
    G ? r.createElement(Jl, { team: e }) : null,
    // Footer: launch button
    r.createElement(
      "div",
      {
        style: {
          marginTop: "auto",
          paddingTop: 8,
          borderTop: "1px solid var(--ant-color-border-secondary, #f0f0f0)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }
      },
      r.createElement(
        N,
        { type: "secondary", style: { fontSize: 11 } },
        T ? `${e.mode === "debate" ? "裁决者" : "主控"}: ${T}` : "OMP 动态编排"
      ),
      r.createElement(
        m,
        {
          type: "primary",
          size: "small",
          icon: x ? r.createElement(x) : void 0,
          disabled: t.length === 0,
          onClick: () => a(e),
          style: je
        },
        "运行工作流"
      )
    )
  );
}
function Vl({
  agents: e,
  onLaunch: t
}) {
  const a = _().React, { useMemo: l, useState: n, useCallback: r, useEffect: o } = a, {
    Row: c,
    Col: s,
    Input: d,
    Empty: m,
    Typography: f,
    Tag: u,
    Button: h,
    Divider: x,
    Tabs: C,
    message: b
  } = _().antd, { SearchOutlined: v, PlusOutlined: I, RocketOutlined: z } = _().antdIcons || {}, { Text: N } = f, [D, G] = n(""), [B, M] = n([]), [A, H] = n([]), [K, T] = n(!1), [w, E] = n(null);
  o(() => {
    M(ct());
    let W = !0;
    return (async () => {
      try {
        await Ll();
        const S = await Gt();
        W && M(S);
      } catch (S) {
        console.warn("[ugsci] Failed to load backend expert teams:", S), W && b.warning("专家团后端同步失败，当前显示本地缓存");
      }
    })(), Dl().then((S) => {
      W && S && H(S);
    }), () => {
      W = !1;
    };
  }, []);
  const $ = r(() => {
    Gt().then(M).catch((W) => {
      console.warn("[ugsci] Failed to refresh expert teams:", W), M(ct());
    });
  }, []), k = r(
    (W) => {
      Ml(W.id).then(() => {
        const J = ct().filter((le) => le.id !== W.id);
        en(J), M(J), b.success(`团队「${W.name}」已删除`);
      }).catch((S) => b.error(S.message || "删除专家团失败"));
    },
    [b]
  ), q = r((W) => {
    E(W), T(!0);
  }, []), Z = r(() => {
    E(null), T(!0);
  }, []), U = l(() => [...B, ...A], [B, A]), P = l(() => {
    if (!D.trim()) return U;
    const W = D.toLowerCase();
    return U.filter(
      (S) => S.name.toLowerCase().includes(W) || S.description.toLowerCase().includes(W) || S.category.toLowerCase().includes(W)
    );
  }, [U, D]), p = P.filter((W) => W.custom), te = P.filter((W) => !W.custom);
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
        prefix: v ? a.createElement(v) : void 0,
        value: D,
        onChange: (W) => G(W.target.value),
        allowClear: !0,
        style: { flex: "1 1 280px", maxWidth: 400 }
      }),
      a.createElement(
        h,
        {
          type: "primary",
          size: "small",
          icon: I ? a.createElement(I) : void 0,
          onClick: Z,
          style: je
        },
        "创建专家团"
      )
    ),
    // Tabs: preset teams vs custom teams
    a.createElement(
      C,
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
                c,
                { gutter: [12, 12] },
                ...te.map(
                  (W) => a.createElement(
                    s,
                    { key: W.id, xs: 24, sm: 12, md: 8 },
                    a.createElement(Ln, {
                      team: W,
                      agents: e,
                      onLaunch: t
                    })
                  )
                )
              ) : a.createElement(m, {
                description: "未找到匹配的预设团队",
                image: m.PRESENTED_IMAGE_SIMPLE
              })
            )
          },
          {
            key: "custom",
            label: `自定义团队${p.length ? ` (${p.length})` : ""}`,
            children: a.createElement(
              "div",
              null,
              p.length > 0 ? a.createElement(
                c,
                { gutter: [12, 12] },
                ...p.map(
                  (W) => a.createElement(
                    s,
                    { key: W.id, xs: 24, sm: 12, md: 8 },
                    a.createElement(Ln, {
                      team: W,
                      agents: e,
                      onLaunch: t,
                      onEdit: q,
                      onDelete: k
                    })
                  )
                )
              ) : a.createElement(m, {
                description: "暂无自定义团队，点击「创建专家团」自定义",
                image: m.PRESENTED_IMAGE_SIMPLE
              })
            )
          },
          {
            key: "active",
            label: "进行中的讨论",
            children: a.createElement(
              a.Fragment,
              null,
              a.createElement(Wl),
              a.createElement(On, { activeOnly: !0 })
            )
          },
          {
            key: "history",
            label: "讨论历史",
            children: a.createElement(On)
          }
        ]
      }
    ),
    // Team Builder Modal
    a.createElement(Kl, {
      open: K,
      onClose: () => {
        T(!1), E(null);
      },
      agents: e,
      editingTeam: w,
      onSaved: $
    })
  );
}
const Xl = [
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
], Yl = 5e3, Ql = {
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
function Zl(e) {
  window.history.pushState({}, "", e), window.dispatchEvent(new PopStateEvent("popstate"));
}
function Nt(e, t) {
  const a = new URLSearchParams();
  e && a.set("flow", e), t && a.set("run", t), Zl(`/flowforge${a.size ? `?${a.toString()}` : ""}`);
}
function er(e) {
  return e ? new Date(e * 1e3).toLocaleString("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  }) : "—";
}
function tr(e) {
  if (!e || e <= 0) return "—";
  if (e < 1e3) return `${e}ms`;
  const t = Math.floor(e / 1e3);
  if (t < 60) return `${t}s`;
  const a = Math.floor(t / 60), l = t % 60;
  return `${a}m${l}s`;
}
function nr(e) {
  if (!e) return "";
  const t = Object.keys(e).length;
  if (t === 0) return "";
  const a = Object.values(e).filter(
    (n) => n === "success" || n === "completed" || n === "skipped" || n === "cached"
  ).length, l = Object.values(e).filter(
    (n) => n === "error" || n === "failed"
  ).length;
  return l > 0 ? `${a}/${t} 节点完成 (${l} 失败)` : `${a}/${t} 节点完成`;
}
const vt = /* @__PURE__ */ new Set(["running", "queued", "paused", "waiting_human"]);
function ar() {
  const e = _().React, { useCallback: t, useEffect: a, useRef: l, useState: n } = e, {
    Alert: r,
    Button: o,
    Card: c,
    Col: s,
    Empty: d,
    Input: m,
    Popconfirm: f,
    Row: u,
    Space: h,
    Spin: x,
    Tabs: C,
    Tag: b,
    Tooltip: v,
    Typography: I,
    message: z
  } = _().antd, {
    ApartmentOutlined: N,
    DeleteOutlined: D,
    ReloadOutlined: G,
    RocketOutlined: B,
    PlayCircleOutlined: M,
    StopOutlined: A
  } = _().antdIcons || {}, { Text: H, Paragraph: K, Title: T } = I, w = _().useSelectedAgent, E = w ? w() : { id: "default" }, $ = (E == null ? void 0 : E.id) || "default", [k, q] = n([]), [Z, U] = n([]), [P, p] = n([]), [te, W] = n(!0), [S, J] = n(!0), [le, X] = n(null), [ee, fe] = n(""), [R, re] = n(""), [pe, oe] = n("templates"), [ae, Ee] = n(/* @__PURE__ */ new Set()), he = l(null), ke = Z.some((g) => vt.has(g.status)), Ae = e.useMemo(() => {
    const g = {};
    return k.forEach((ne) => {
      g[ne.id] = ne.name;
    }), g;
  }, [k]), be = e.useMemo(() => {
    const g = {};
    return Z.forEach((ne) => {
      vt.has(ne.status) && (g[ne.flow_id] = (g[ne.flow_id] || 0) + 1);
    }), g;
  }, [Z]), Q = t(async (g = !1) => {
    g || W(!0);
    try {
      const [ne, ce, _e] = await Promise.all([
        ie("/flowforge/flows", { bypassCache: !0 }),
        ie("/flowforge/runs", { bypassCache: !0 }),
        At().catch(() => [])
      ]);
      q(ne), U(ce), p(_e), J(!0);
    } catch (ne) {
      console.warn("[ugsci] FlowForge is unavailable:", ne), J(!1);
    } finally {
      g || W(!1);
    }
  }, []);
  a(() => {
    Q();
  }, [Q]), a(() => {
    if (!S || !ke) {
      he.current && (clearTimeout(he.current), he.current = null);
      return;
    }
    return he.current = setTimeout(() => {
      Q(!0);
    }, Yl), () => {
      he.current && (clearTimeout(he.current), he.current = null);
    };
  }, [ke, S, Q]);
  const we = t(
    async (g) => {
      if (!le) {
        X(g.key);
        try {
          const ne = await ie(
            "/flowforge/generate",
            {
              method: "POST",
              body: JSON.stringify({
                prompt: g.sop,
                name: g.name,
                agent_id: $
              })
            }
          ), ce = {
            ...ne.nodes || {}
          }, _e = Object.entries(ce).filter(([Le]) => /^step_\d+$/.test(Le)).sort(([Le], [Se]) => Number(Le.slice(5)) - Number(Se.slice(5))), Ce = {};
          let Oe = 0, Me = 0;
          _e.forEach(([Le, Se], Re) => {
            const Y = g.roleHints[Re] || "", Ie = g.roleKeys[Re] || "analyst", ze = P.find(
              (We) => `${We.name} ${We.id}`.toLowerCase().includes(Y.toLowerCase())
            );
            ze ? Oe++ : Me++;
            const Pe = (ze == null ? void 0 : ze.id) || $, He = { ...Se.inputs || {} };
            He.agent_id = Pe, ce[Le] = {
              ...Se,
              inputs: He,
              metadata: {
                ...Se.metadata || {},
                binding_policy: "fixed_instance",
                role_hint: Y,
                role_key: Ie,
                agent_id: Pe
              }
            }, Ce[Le] = {
              binding_policy: "fixed_instance",
              role_hint: Y,
              role_key: Ie,
              agent_id: Pe
            };
          });
          const De = {
            ...ne,
            nodes: ce,
            id: `${g.key}-${Date.now()}`,
            name: g.name,
            description: g.description,
            metadata: {
              ...ne.metadata || {},
              domain: "oil-gas",
              template_key: g.key,
              expert_binding_policy: "fixed_instance",
              controller_agent_id: $,
              node_bindings: Ce
            }
          };
          await ie("/flowforge/flows", {
            method: "POST",
            body: JSON.stringify(De)
          });
          const Fe = _e.length > 0 ? `（${Oe} 个专家已匹配，${Me} 个回退到控制器）` : "";
          z.success(`已创建工作流草稿「${g.name}」${Fe}`), await Q();
        } catch (ne) {
          z.error(ne.message || "创建工作流失败");
        } finally {
          X(null);
        }
      }
    },
    [P, $, le, Q, z]
  ), ye = t(async () => {
    if (!le) {
      if (!R.trim()) {
        z.warning("请先描述工作流步骤和控制要求");
        return;
      }
      X("natural-language");
      try {
        const g = await ie(
          "/flowforge/generate",
          {
            method: "POST",
            body: JSON.stringify({
              prompt: R.trim(),
              name: ee.trim(),
              agent_id: $
            })
          }
        ), ne = {
          ...g,
          id: `natural-${Date.now()}`,
          metadata: {
            ...g.metadata || {},
            domain: "oil-gas",
            source: "natural-language",
            expert_binding_policy: "fixed_instance",
            controller_agent_id: $
          }
        };
        await ie("/flowforge/flows", {
          method: "POST",
          body: JSON.stringify(ne)
        }), z.success("已从自然语言生成可编辑工作流草稿"), fe(""), re(""), await Q();
      } catch (g) {
        z.error(g.message || "自然语言生成失败");
      } finally {
        X(null);
      }
    }
  }, [$, le, Q, z, ee, R]), V = t(
    async (g, ne) => {
      try {
        await ie(`/flowforge/flows/${encodeURIComponent(g)}/run`, {
          method: "POST",
          body: JSON.stringify({ inputs: {} })
        }), z.success(`已启动工作流「${ne}」`), await Q(!0);
      } catch (ce) {
        z.error(ce.message || "启动工作流失败");
      }
    },
    [Q, z]
  ), de = t(
    async (g, ne) => {
      try {
        await ie(`/flowforge/flows/${encodeURIComponent(g)}`, {
          method: "DELETE"
        }), z.success(`已删除工作流「${ne}」`), await Q();
      } catch (ce) {
        z.error(ce.message || "删除工作流失败");
      }
    },
    [Q, z]
  ), ge = t(
    async (g) => {
      Ee((ne) => {
        const ce = new Set(ne);
        return ce.add(g), ce;
      });
      try {
        await ie(`/flowforge/runs/${encodeURIComponent(g)}/cancel`, {
          method: "POST"
        }), z.success("已请求取消运行"), await Q(!0);
      } catch (ne) {
        z.error(ne.message || "取消运行失败");
      } finally {
        Ee((ne) => {
          const ce = new Set(ne);
          return ce.delete(g), ce;
        });
      }
    },
    [Q, z]
  ), F = e.createElement(
    "div",
    null,
    e.createElement(
      c,
      {
        size: "small",
        title: "用自然语言生成工作流",
        style: { marginBottom: 16 }
      },
      e.createElement(
        h,
        { direction: "vertical", style: { width: "100%" }, size: 10 },
        e.createElement(m, {
          value: ee,
          onChange: (g) => fe(g.target.value),
          placeholder: "工作流名称（可选）",
          maxLength: 80
        }),
        e.createElement(m.TextArea, {
          value: R,
          onChange: (g) => re(g.target.value),
          placeholder: "例如：先检查某储气库本周期压力和注采量数据，再由油藏工程师预测下周期能力，由独立完整性专家复核风险，最后形成带证据和不确定性的建议。",
          autoSize: { minRows: 3, maxRows: 8 }
        }),
        e.createElement(
          o,
          {
            type: "primary",
            onClick: () => void ye(),
            loading: le === "natural-language",
            disabled: !S || !!le,
            style: je
          },
          "生成可编辑草稿"
        )
      )
    ),
    e.createElement(
      u,
      { gutter: [12, 12] },
      ...Xl.map(
        (g) => e.createElement(
          s,
          { key: g.key, xs: 24, md: 8 },
          e.createElement(
            c,
            { style: { height: "100%" } },
            e.createElement(
              h,
              { align: "start", style: { width: "100%" } },
              e.createElement("span", { style: { fontSize: 28 } }, g.icon),
              e.createElement(
                "div",
                { style: { flex: 1 } },
                e.createElement(T, { level: 5, style: { margin: 0 } }, g.name),
                e.createElement(b, { color: "blue", style: { marginTop: 6 } }, g.category),
                e.createElement(
                  K,
                  { type: "secondary", style: { margin: "10px 0 14px" } },
                  g.description
                ),
                e.createElement(
                  o,
                  {
                    type: "primary",
                    loading: le === g.key,
                    disabled: !S || !!le,
                    onClick: () => void we(g),
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
      c,
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
          ([g, ne, ce]) => e.createElement(
            s,
            { key: g, xs: 24, sm: 12, lg: 6 },
            e.createElement(H, { strong: !0 }, g),
            e.createElement(
              b,
              {
                color: ce === "当前可执行" ? "green" : "default",
                style: { marginLeft: 6, fontSize: 10 }
              },
              ce
            ),
            e.createElement("div", { style: { color: "var(--ant-color-text-tertiary, #8c8c8c)", fontSize: 12, marginTop: 4 } }, ne)
          )
        )
      )
    )
  ), y = te ? e.createElement(x) : k.length === 0 ? e.createElement(d, { description: "暂无工作流，可从模板创建" }) : e.createElement(
    u,
    { gutter: [12, 12] },
    ...k.map((g) => {
      const ne = be[g.id] || 0;
      return e.createElement(
        s,
        { key: g.id, xs: 24, md: 12, xl: 8 },
        e.createElement(
          c,
          {
            size: "small",
            title: e.createElement(
              h,
              { size: 6 },
              e.createElement("span", null, g.name),
              ne > 0 ? e.createElement(
                b,
                { color: "blue" },
                `${ne} 个运行中`
              ) : null
            ),
            extra: e.createElement(b, null, `v${g.version}`)
          },
          e.createElement(K, { ellipsis: { rows: 2 } }, g.description || "暂无描述"),
          e.createElement(
            h,
            { size: 8, wrap: !0 },
            e.createElement(b, { color: "geekblue" }, `${g.node_count} 个节点`),
            e.createElement(o, {
              size: "small",
              type: "primary",
              icon: M ? e.createElement(M) : void 0,
              disabled: !S,
              onClick: () => void V(g.id, g.name)
            }, "运行"),
            e.createElement(o, {
              size: "small",
              onClick: () => Nt(g.id)
            }, "编辑"),
            e.createElement(
              f,
              {
                title: "确认删除",
                description: `确定要删除工作流「${g.name}」吗？此操作不可撤销。`,
                onConfirm: () => void de(g.id, g.name),
                okText: "删除",
                cancelText: "取消",
                okButtonProps: { danger: !0 }
              },
              e.createElement(o, {
                size: "small",
                danger: !0,
                icon: D ? e.createElement(D) : void 0
              }, "删除")
            )
          )
        )
      );
    })
  ), me = te ? e.createElement(x) : Z.length === 0 ? e.createElement(d, { description: "暂无工作流运行记录" }) : e.createElement(
    "div",
    { style: { display: "flex", flexDirection: "column", gap: 8 } },
    ...Z.map((g) => {
      const ne = Ae[g.flow_id] || g.flow_id, ce = vt.has(g.status), _e = nr(g.node_statuses), Ce = g.duration_ms && g.duration_ms > 0 ? g.duration_ms : g.finished_at && g.started_at ? (g.finished_at - g.started_at) * 1e3 : ce && g.started_at ? (Date.now() / 1e3 - g.started_at) * 1e3 : 0;
      return e.createElement(
        c,
        { key: g.run_id, size: "small" },
        e.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" } },
          e.createElement(
            b,
            { color: Ql[g.status] || "default" },
            g.status
          ),
          e.createElement(H, { strong: !0 }, ne),
          e.createElement(
            v,
            { title: g.run_id },
            e.createElement(
              H,
              { type: "secondary", style: { fontFamily: "monospace", fontSize: 11 } },
              g.run_id.slice(0, 8) + "…"
            )
          ),
          e.createElement(
            H,
            { type: "secondary", style: { fontSize: 12 } },
            er(g.started_at)
          ),
          Ce > 0 ? e.createElement(
            H,
            { type: "secondary", style: { fontSize: 12 } },
            `耗时 ${tr(Ce)}`
          ) : null,
          _e ? e.createElement(b, { color: "geekblue", style: { fontSize: 11 } }, _e) : null,
          g.error ? e.createElement(
            v,
            { title: g.error },
            e.createElement(H, { type: "danger", style: { fontSize: 12 } }, "（有错误）")
          ) : null,
          e.createElement(
            "div",
            { style: { marginLeft: "auto", display: "flex", gap: 6 } },
            ce ? e.createElement(
              f,
              {
                title: "确认取消运行？",
                onConfirm: () => void ge(g.run_id),
                okText: "取消运行",
                cancelText: "保留",
                okButtonProps: { danger: !0 }
              },
              e.createElement(o, {
                size: "small",
                danger: !0,
                loading: ae.has(g.run_id),
                icon: A ? e.createElement(A) : void 0
              }, "取消运行")
            ) : null,
            e.createElement(
              o,
              { size: "small", type: "link", onClick: () => Nt(void 0, g.run_id) },
              "查看详情"
            )
          )
        )
      );
    })
  ), j = e.createElement(
    h,
    null,
    e.createElement(o, {
      icon: G ? e.createElement(G) : void 0,
      onClick: () => void Q(),
      loading: te
    }, "刷新"),
    pe !== "templates" ? e.createElement(o, {
      type: "primary",
      icon: N ? e.createElement(N) : B ? e.createElement(B) : void 0,
      onClick: () => Nt(),
      disabled: !S,
      style: je
    }, "打开流程编辑器") : null
  );
  return e.createElement(
    "div",
    null,
    S ? null : e.createElement(r, {
      type: "warning",
      message: "FlowForge 引擎未启动",
      description: "协作工作流功能需要 FlowForge 后端引擎支持。请检查后端是否正常运行，或联系管理员。",
      showIcon: !0,
      style: { marginBottom: 16 }
    }),
    e.createElement(C, {
      items: [
        { key: "templates", label: "工作流模板", children: F },
        { key: "mine", label: `我的工作流 (${k.length})`, children: y },
        {
          key: "runs",
          label: e.createElement(
            "span",
            null,
            "运行中心 (",
            Z.length,
            ke ? e.createElement(
              "span",
              { style: { color: "var(--ant-color-primary, #1677ff)", marginLeft: 2 } },
              `·${Z.filter((g) => vt.has(g.status)).length} 活跃`
            ) : null,
            ")"
          ),
          children: me
        }
      ],
      activeKey: pe,
      onChange: (g) => oe(g),
      tabBarExtraContent: j
    })
  );
}
function Bn(e, t) {
  var n, r;
  const a = e.coordinatorName || ((n = e.members[0]) == null ? void 0 : n.name), l = e.members.find((o) => o.name === a) || e.members[0];
  if ((l == null ? void 0 : l.bindingMode) !== "temporary" && (l != null && l.agentId) && t.some((o) => o.id === l.agentId))
    return l.agentId;
  if (a && (l == null ? void 0 : l.bindingMode) !== "temporary") {
    const o = sa(t, a);
    if (o) return o;
  }
  return (l == null ? void 0 : l.bindingMode) === "fixed" ? null : ((r = t[0]) == null ? void 0 : r.id) || null;
}
function jn() {
  const e = new URLSearchParams(window.location.search).get("section");
  return e === "teams" || e === "workflows" ? e : "experts";
}
function lr() {
  var de, ge;
  const e = _().React, { useState: t, useEffect: a, useCallback: l, useMemo: n } = e, {
    Spin: r,
    Empty: o,
    Input: c,
    Button: s,
    message: d,
    Row: m,
    Col: f,
    Tabs: u,
    Modal: h,
    Typography: x
  } = _().antd, {
    ReloadOutlined: C,
    PlusOutlined: b,
    SearchOutlined: v,
    TeamOutlined: I,
    UserOutlined: z
  } = _().antdIcons || {}, { Text: N, Paragraph: D } = x, [G, B] = t([]), [M, A] = t(!0), [H, K] = t(!1), [T, w] = t(null), [E, $] = t(""), [k, q] = t(!1), [Z, U] = t(jn), [P, p] = t(
    null
  ), [te, W] = t(""), [S, J] = t(!1), [le, X] = t(!1), [ee, fe] = t(null), [R, re] = t([]), pe = l(async () => {
    A(!0);
    try {
      const F = await At(), y = await Promise.all(
        F.map(async (me) => {
          try {
            const [j, g, ne] = await Promise.all([
              Kt(me.id).catch(() => null),
              Pt(me.id).catch(() => []),
              Yt(me.id).catch(() => [])
            ]);
            return {
              agent: me,
              config: j,
              skills: g,
              mcps: ne,
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
      B(y), re(F);
    } catch (F) {
      d.error(F.message || "加载专家列表失败"), B([]);
    } finally {
      A(!1);
    }
  }, []);
  a(() => {
    pe();
  }, [pe]), a(() => {
    const F = () => U(jn());
    return window.addEventListener("popstate", F), () => window.removeEventListener("popstate", F);
  }, []), a(() => {
    if (ee && le) {
      const F = G.find(
        (y) => y.agent.id === ee.agent.id
      );
      F && F !== ee && fe(F);
    }
  }, [G, ee, le]);
  const oe = l(
    async (F) => {
      var g;
      const y = F.coordinatorName || ((g = F.members[0]) == null ? void 0 : g.name), me = Bn(F, R);
      if (!me) {
        const ne = F.members.find(
          (ce) => ce.name === y
        );
        d.error(
          (ne == null ? void 0 : ne.bindingMode) === "fixed" ? `固定协调者「${y || "协调者"}」当前不可用，请修复绑定后再运行` : "没有可用的 Agent 作为工作流控制器"
        );
        return;
      }
      if (/\{.+?\}/.test(F.taskTemplate)) {
        W(F.taskTemplate), p(F);
        return;
      }
      await ae(F, me, F.taskTemplate);
    },
    [R, d]
  ), ae = l(
    async (F, y, me) => {
      J(!0);
      try {
        const j = me || F.taskTemplate, g = F.custom ? `@${F.id}` : F.name, ne = `/ugsci-team ${F.mode} ${g} ${j}`, ce = _();
        ce.setSelectedAgent && ce.setSelectedAgent(y);
        const _e = await jl(
          y,
          ne,
          F.name
        );
        d.success(
          `OMP 工作流已启动：${F.name}（${F.mode}模式）`
        ), p(null), Ee(`/chat/${_e}`);
      } catch (j) {
        d.error(j.message || "发起团队任务失败");
      } finally {
        J(!1);
      }
    },
    [d]
  ), Ee = (F) => {
    window.history.pushState({}, "", F), window.dispatchEvent(new PopStateEvent("popstate"));
  }, he = l((F) => {
    w(F), K(!0);
  }, []), ke = l((F) => {
    fe(F), X(!0);
  }, []), Ae = l(
    (F) => {
      if (!F.agent.enabled) {
        d.warning(`专家「${F.agent.name}」未启用，请先启用`);
        return;
      }
      try {
        const y = _();
        y.setSelectedAgent && y.setSelectedAgent(F.agent.id);
      } catch (y) {
        console.warn("[ugsci] Failed to set selected agent:", y);
      }
      d.success(`已召唤专家「${F.agent.name}」，正在跳转至对话...`), Ee("/chat");
    },
    [d]
  ), be = n(() => {
    if (!E.trim()) return G;
    const F = E.toLowerCase();
    return G.filter(
      (y) => {
        var me;
        return y.agent.name.toLowerCase().includes(F) || ((me = y.agent.description) == null ? void 0 : me.toLowerCase().includes(F)) || y.agent.id.toLowerCase().includes(F) || y.skills.some((j) => j.name.toLowerCase().includes(F));
      }
    );
  }, [G, E]), Q = G.filter((F) => F.agent.enabled).length, we = G.reduce(
    (F, y) => F + y.skills.filter((me) => me.enabled !== !1).length,
    0
  ), ye = G.reduce((F, y) => F + y.mcps.length, 0), V = [
    {
      key: "experts",
      label: e.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        z ? e.createElement(z, { style: { fontSize: 14 } }) : null,
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
          e.createElement(c, {
            placeholder: "搜索专家名称、描述或技能...",
            prefix: v ? e.createElement(v) : void 0,
            value: E,
            onChange: (F) => $(F.target.value),
            allowClear: !0,
            style: { flex: "1 1 280px", maxWidth: 400 }
          }),
          e.createElement(
            s,
            {
              type: "primary",
              icon: b ? e.createElement(b) : void 0,
              onClick: () => q(!0),
              style: je
            },
            "创建专家"
          )
        ),
        // Content
        M ? e.createElement(
          "div",
          { style: { textAlign: "center", padding: 60 } },
          e.createElement(r, { size: "large" })
        ) : be.length === 0 ? e.createElement(o, {
          description: E ? "未找到匹配的专家" : "暂无专家，点击「创建专家」添加"
        }) : e.createElement(
          m,
          { gutter: [12, 12], align: "stretch" },
          ...be.map(
            (F) => e.createElement(
              f,
              {
                key: F.agent.id,
                xs: 24,
                sm: 12,
                md: 8,
                lg: 6,
                style: { display: "flex" }
              },
              e.createElement(_l, {
                expert: F,
                onClick: () => he(F),
                onSummon: () => Ae(F),
                onConfigure: () => ke(F)
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
        I ? e.createElement(I, { style: { fontSize: 14 } }) : null,
        "专家团"
      ),
      children: e.createElement(Vl, {
        agents: R,
        onLaunch: oe
      })
    },
    {
      key: "workflows",
      label: e.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        (de = _().antdIcons) != null && de.ApartmentOutlined ? e.createElement(_().antdIcons.ApartmentOutlined, {
          style: { fontSize: 14 }
        }) : null,
        "协作工作流"
      ),
      children: e.createElement(ar)
    }
  ];
  return e.createElement(
    "div",
    { style: { padding: 24 } },
    e.createElement($t, {
      title: "专家·协作",
      subtitle: Z === "experts" ? `共 ${G.length} 位专家（${Q} 位启用）· ${we} 个技能 · ${ye} 个 MCP 客户端` : Z === "teams" ? "开放式多专家讨论、联合研判与 OMP 动态协作" : "流程化、可观测、可验证的油气与储气库协作流程",
      extra: e.createElement(
        e.Fragment,
        null,
        Z === "experts" ? e.createElement(
          s,
          {
            icon: C ? e.createElement(C) : void 0,
            onClick: () => {
              ut(), pe();
            },
            loading: M
          },
          "刷新"
        ) : null
      )
    }),
    e.createElement(u, {
      items: V,
      activeKey: Z,
      onChange: (F) => {
        U(F);
        const y = new URL(window.location.href);
        F === "experts" ? y.searchParams.delete("section") : y.searchParams.set("section", F), window.history.pushState({}, "", `${y.pathname}${y.search}`);
      }
    }),
    // Drawer
    e.createElement(Il, {
      expert: T,
      open: H,
      onClose: () => K(!1),
      onRefresh: () => pe()
    }),
    // Template Modal
    e.createElement(zl, {
      open: k,
      onClose: () => q(!1),
      onCreated: () => pe()
    }),
    // Config Modal (gear icon)
    e.createElement(kl, {
      expert: ee,
      open: le,
      onClose: () => X(!1),
      onRefresh: () => pe()
    }),
    // Team Launch Modal (for filling placeholders)
    P ? e.createElement(
      h,
      {
        open: !0,
        title: e.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 8 } },
          e.createElement(Zt, {
            members: P.members.map((F) => F.name),
            size: 28
          }),
          e.createElement(
            "span",
            null,
            `发起团队任务 - ${P.name}`
          )
        ),
        onCancel: () => p(null),
        onOk: () => {
          const F = Bn(
            P,
            R
          );
          if (!F) {
            d.error("固定协调者不可用或没有可用的控制器 Agent");
            return;
          }
          const y = te.trim() || P.taskTemplate;
          ae(P, F, y);
        },
        confirmLoading: S,
        okText: "发起任务",
        width: 600
      },
      e.createElement(
        "div",
        null,
        e.createElement(
          N,
          {
            type: "secondary",
            style: { fontSize: 12, display: "block", marginBottom: 8 }
          },
          "任务内容（请替换 {参数名} 等占位符后发起）："
        ),
        e.createElement(c.TextArea, {
          value: te,
          onChange: (F) => W(F.target.value),
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
            background: "var(--ant-color-primary-bg, #e6f4ff)",
            borderRadius: 6
          }
        },
        e.createElement(
          N,
          { style: { fontSize: 12, color: "var(--ant-color-primary-text, #0958d9)" } },
          `协调者: ${P.coordinatorName || ((ge = P.members[0]) == null ? void 0 : ge.name) || "—"} · 成员: ${P.members.map((F) => F.name).join("、")}`
        )
      )
    ) : null
  );
}
function rr({
  agentId: e,
  agentName: t,
  refreshKey: a = 0,
  onNavigate: l
}) {
  const n = _().React, { useState: r, useEffect: o, useCallback: c } = n, {
    Spin: s,
    Empty: d,
    Button: m,
    Row: f,
    Col: u,
    Card: h,
    Tag: x,
    Checkbox: C,
    Modal: b,
    Typography: v,
    Drawer: I,
    Descriptions: z,
    message: N
  } = _().antd, {
    ReloadOutlined: D,
    ThunderboltOutlined: G,
    SettingOutlined: B,
    CheckSquareOutlined: M,
    EyeOutlined: A,
    EyeInvisibleOutlined: H,
    DeleteOutlined: K,
    CloseOutlined: T
  } = _().antdIcons || {}, { Text: w, Paragraph: E } = v, [$, k] = r([]), [q, Z] = r(!0), [U, P] = r(!1), [p, te] = r(null), [W, S] = r(!1), [J, le] = r(
    /* @__PURE__ */ new Set()
  ), [X, ee] = r(!1), [fe, R] = r(null), [re, pe] = r(!1), oe = c(async () => {
    if (e) {
      Z(!0);
      try {
        const V = await Pt(e);
        k(V);
      } catch (V) {
        N.error(V.message || "加载技能失败"), k([]);
      } finally {
        Z(!1);
      }
    }
  }, [e]);
  o(() => {
    oe();
  }, [oe, a]);
  const ae = (V) => {
    le((de) => {
      const ge = new Set(de);
      return ge.has(V) ? ge.delete(V) : ge.add(V), ge;
    });
  }, Ee = () => le(/* @__PURE__ */ new Set()), he = () => le(new Set($.map((V) => V.name))), ke = () => {
    W ? (Ee(), S(!1)) : S(!0);
  }, Ae = async () => {
    const V = Array.from(J);
    if (V.length !== 0) {
      ee(!0);
      try {
        const { results: de } = await nl(e, V), ge = Object.entries(de).filter(
          ([, y]) => y.success === !1
        ), F = V.length - ge.length;
        ge.length > 0 ? N.warning(
          `批量启用完成：成功 ${F} 个，失败 ${ge.length} 个`
        ) : N.success(`成功启用 ${V.length} 个技能`), Ee(), await oe();
      } catch (de) {
        N.error(de.message || "批量启用失败");
      } finally {
        ee(!1);
      }
    }
  }, be = async () => {
    const V = Array.from(J);
    if (V.length !== 0) {
      ee(!0);
      try {
        const { results: de } = await al(e, V), ge = Object.entries(de).filter(
          ([, y]) => y.success === !1
        ), F = V.length - ge.length;
        ge.length > 0 ? N.warning(
          `批量停用完成：成功 ${F} 个，失败 ${ge.length} 个`
        ) : N.success(`成功停用 ${V.length} 个技能`), Ee(), await oe();
      } catch (de) {
        N.error(de.message || "批量停用失败");
      } finally {
        ee(!1);
      }
    }
  }, Q = () => {
    const V = Array.from(J);
    V.length !== 0 && b.confirm({
      title: `确认删除 ${V.length} 个技能？`,
      content: "删除后技能将从当前专家工作区移除，此操作不可撤销。技能池中的原始技能不受影响。",
      okText: "确认删除",
      cancelText: "取消",
      okButtonProps: { danger: !0 },
      onOk: async () => {
        ee(!0);
        try {
          const { results: de } = await ll(e, V), ge = Object.entries(de).filter(
            ([, y]) => y.success === !1
          ), F = V.length - ge.length;
          ge.length > 0 ? N.warning(
            `批量删除完成：成功 ${F} 个，失败 ${ge.length} 个`
          ) : N.success(`成功删除 ${V.length} 个技能`), Ee(), await oe();
        } catch (de) {
          N.error(de.message || "批量删除失败");
        } finally {
          ee(!1);
        }
      }
    });
  }, we = async (V) => {
    pe(!0);
    try {
      V.enabled === !1 ? (await Yn(e, V.name), N.success(`已启用技能「${V.name}」`)) : (await Zn(e, V.name), N.success(`已禁用技能「${V.name}」`)), await oe();
    } catch (de) {
      N.error(de.message || "操作失败");
    } finally {
      pe(!1);
    }
  }, ye = (V) => {
    b.confirm({
      title: `确认删除技能「${V.name}」？`,
      content: "删除后技能将从当前专家工作区移除，此操作不可撤销。技能池中的原始技能不受影响。",
      okText: "确认删除",
      cancelText: "取消",
      okButtonProps: { danger: !0 },
      onOk: async () => {
        pe(!0);
        try {
          await Xt(e, V.name), N.success(`已删除技能「${V.name}」`), await oe();
        } catch (de) {
          N.error(de.message || "删除失败");
        } finally {
          pe(!1);
        }
      }
    });
  };
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
          marginBottom: 16,
          flexWrap: "wrap",
          gap: 8
        }
      },
      n.createElement(
        w,
        { type: "secondary", style: { fontSize: 13 } },
        W ? `已选择 ${J.size} / ${$.length} 个技能` : `共 ${$.length} 个技能`
      ),
      n.createElement(
        "div",
        { style: { display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" } },
        W ? n.createElement(
          n.Fragment,
          null,
          n.createElement(
            m,
            { size: "small", onClick: he },
            "全选"
          ),
          n.createElement(
            m,
            {
              size: "small",
              icon: T ? n.createElement(T) : void 0,
              onClick: Ee
            },
            "取消选择"
          ),
          n.createElement(
            m,
            {
              size: "small",
              type: "default",
              icon: A ? n.createElement(A) : void 0,
              disabled: J.size === 0 || X,
              loading: X,
              onClick: Ae
            },
            "批量启用"
          ),
          n.createElement(
            m,
            {
              size: "small",
              danger: !0,
              icon: H ? n.createElement(H) : void 0,
              disabled: J.size === 0 || X,
              loading: X,
              onClick: be
            },
            "批量停用"
          ),
          n.createElement(
            m,
            {
              size: "small",
              danger: !0,
              icon: K ? n.createElement(K) : void 0,
              disabled: J.size === 0 || X,
              loading: X,
              onClick: Q
            },
            `删除 (${J.size})`
          ),
          n.createElement(
            m,
            {
              size: "small",
              type: "primary",
              onClick: ke
            },
            "退出批量"
          )
        ) : n.createElement(
          n.Fragment,
          null,
          n.createElement(
            m,
            {
              size: "small",
              icon: M ? n.createElement(M) : void 0,
              onClick: ke,
              disabled: $.length === 0
            },
            "批量管理"
          ),
          n.createElement(
            m,
            {
              icon: D ? n.createElement(D) : void 0,
              onClick: () => {
                ut(), oe();
              }
            },
            "刷新"
          )
        )
      )
    ),
    q ? n.createElement(
      "div",
      { style: { textAlign: "center", padding: 60 } },
      n.createElement(s, { size: "large" })
    ) : $.length === 0 ? n.createElement(d, {
      description: "当前智能体未加载任何技能"
    }) : n.createElement(
      f,
      { gutter: [12, 12] },
      ...$.map(
        (V) => n.createElement(
          u,
          { key: V.name, xs: 24, sm: 12, md: 8, lg: 6 },
          n.createElement(
            h,
            {
              hoverable: !0,
              size: "small",
              style: {
                cursor: W ? "default" : "pointer",
                height: "100%",
                position: "relative",
                borderColor: W && J.has(V.name) ? "var(--ant-color-primary, #0072f5)" : void 0,
                borderWidth: W && J.has(V.name) ? 2 : 1
              },
              onClick: () => {
                W ? ae(V.name) : (te(V), P(!0));
              },
              onMouseEnter: () => {
                W || R(V.name);
              },
              onMouseLeave: () => R(null)
            },
            W ? n.createElement(
              "div",
              {
                style: {
                  position: "absolute",
                  top: 8,
                  right: 8,
                  zIndex: 1
                },
                onClick: (de) => {
                  de.stopPropagation(), ae(V.name);
                }
              },
              n.createElement(C, {
                checked: J.has(V.name)
              })
            ) : null,
            n.createElement(
              "div",
              {
                style: {
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 8
                }
              },
              V.emoji ? n.createElement(
                "span",
                { style: { fontSize: 18 } },
                V.emoji
              ) : n.createElement(
                "span",
                { style: { fontSize: 18 } },
                "⚡"
              ),
              n.createElement(
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
                V.name
              ),
              V.enabled === !1 ? n.createElement(
                x,
                { color: "default", style: { fontSize: 10 } },
                "已禁用"
              ) : n.createElement(
                x,
                { color: "green", style: { fontSize: 10 } },
                "已启用"
              )
            ),
            V.description ? n.createElement(
              E,
              {
                type: "secondary",
                style: { fontSize: 11, margin: 0, lineHeight: 1.4 },
                ellipsis: { rows: 2 }
              },
              V.description
            ) : null,
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
              V.version_text ? n.createElement(
                x,
                { style: { fontSize: 10 } },
                `v${V.version_text}`
              ) : null,
              ...(V.tags || []).slice(0, 3).map(
                (de, ge) => n.createElement(
                  x,
                  { key: ge, color: "blue", style: { fontSize: 10 } },
                  de
                )
              )
            ),
            // Hover action footer (not in batch mode)
            !W && fe === V.name ? n.createElement(
              "div",
              {
                style: {
                  marginTop: 8,
                  paddingTop: 8,
                  borderTop: "1px solid var(--ant-color-border-secondary, #f0f0f0)",
                  display: "flex",
                  gap: 8,
                  justifyContent: "flex-end"
                }
              },
              n.createElement(
                m,
                {
                  size: "small",
                  type: "default",
                  icon: V.enabled === !1 ? A ? n.createElement(A) : void 0 : H ? n.createElement(H) : void 0,
                  disabled: re,
                  onClick: (de) => {
                    de.stopPropagation(), we(V);
                  }
                },
                V.enabled === !1 ? "启用" : "禁用"
              ),
              n.createElement(
                m,
                {
                  size: "small",
                  danger: !0,
                  icon: K ? n.createElement(K) : void 0,
                  disabled: re,
                  onClick: (de) => {
                    de.stopPropagation(), ye(V);
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
    p ? n.createElement(
      I,
      {
        title: n.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 8 } },
          n.createElement(
            "span",
            { style: { fontSize: 18 } },
            p.emoji || "⚡"
          ),
          n.createElement("span", null, p.name)
        ),
        open: U,
        onClose: () => P(!1),
        width: 520,
        extra: n.createElement(
          m,
          {
            type: "primary",
            size: "small",
            icon: B ? n.createElement(B) : void 0,
            onClick: () => l("/skills")
          },
          "管理技能"
        )
      },
      n.createElement(
        z,
        { column: 1, bordered: !0, size: "small" },
        n.createElement(
          z.Item,
          { label: "技能名称" },
          p.name
        ),
        n.createElement(
          z.Item,
          { label: "描述" },
          p.description || "-"
        ),
        p.version_text ? n.createElement(
          z.Item,
          { label: "版本" },
          p.version_text
        ) : null,
        n.createElement(
          z.Item,
          { label: "来源" },
          p.source || "-"
        ),
        n.createElement(
          z.Item,
          { label: "状态" },
          p.enabled === !1 ? "已禁用" : "已启用"
        ),
        p.installed_from ? n.createElement(
          z.Item,
          { label: "安装来源" },
          p.installed_from
        ) : null
      ),
      // Tags
      p.tags && p.tags.length > 0 ? n.createElement(
        "div",
        { style: { marginTop: 16 } },
        n.createElement(
          w,
          {
            strong: !0,
            style: { display: "block", marginBottom: 8 }
          },
          "标签"
        ),
        n.createElement(
          "div",
          { style: { display: "flex", flexWrap: "wrap", gap: 4 } },
          ...p.tags.map(
            (V, de) => n.createElement(x, { key: de, color: "blue" }, V)
          )
        )
      ) : null,
      // Skill content preview
      p.content ? n.createElement(
        "div",
        { style: { marginTop: 16 } },
        n.createElement(
          w,
          {
            strong: !0,
            style: { display: "block", marginBottom: 8 }
          },
          "技能内容"
        ),
        n.createElement(
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
          p.content.slice(0, 2e3) + (p.content.length > 2e3 ? `

... (内容已截断)` : "")
        )
      ) : null
    ) : null
  );
}
function or({
  poolSkills: e,
  workspaceSkills: t,
  agents: a,
  loading: l,
  onReload: n,
  onSkillInstalled: r,
  agentId: o,
  agentName: c
}) {
  const s = _().React, { useState: d, useMemo: m, useCallback: f, useEffect: u, useRef: h } = s, {
    Spin: x,
    Empty: C,
    Input: b,
    Button: v,
    Row: I,
    Col: z,
    Card: N,
    Tag: D,
    Typography: G,
    Drawer: B,
    Descriptions: M,
    List: A,
    Modal: H,
    message: K
  } = _().antd, {
    ReloadOutlined: T,
    SearchOutlined: w,
    DownloadOutlined: E,
    ThunderboltOutlined: $,
    DeleteOutlined: k,
    PlusOutlined: q
  } = _().antdIcons || {}, { Text: Z, Paragraph: U } = G, [P, p] = d(""), [te, W] = d(!1), [S, J] = d(null), [le, X] = d([]), [ee, fe] = d(!1), [R, re] = d(24), [pe, oe] = d(null), [ae, Ee] = d(!1), he = h(0), ke = h(null), Ae = m(
    () => {
      var j;
      return new Set(
        ((j = t.find((g) => g.agent_id === o)) == null ? void 0 : j.skills.map((g) => g.name)) || []
      );
    },
    [t, o]
  ), be = m(() => {
    if (!P.trim()) return e;
    const j = P.toLowerCase();
    return e.filter(
      (g) => {
        var ne, ce;
        return g.name.toLowerCase().includes(j) || ((ne = g.description) == null ? void 0 : ne.toLowerCase().includes(j)) || ((ce = g.tags) == null ? void 0 : ce.some((_e) => _e.toLowerCase().includes(j)));
      }
    );
  }, [e, P]), Q = m(
    () => be.slice(0, R),
    [be, R]
  );
  u(() => {
    if (Q.length >= be.length) return;
    const j = ke.current;
    if (!j) return;
    const g = () => {
      re(
        (ce) => Math.min(ce + 24, be.length)
      );
    };
    if (typeof IntersectionObserver < "u") {
      const ce = new IntersectionObserver(
        (_e) => {
          _e.some((Ce) => Ce.isIntersecting) && g();
        },
        { rootMargin: "240px 0px" }
      );
      return ce.observe(j), () => ce.disconnect();
    }
    const ne = () => {
      j.getBoundingClientRect().top <= window.innerHeight + 240 && g();
    };
    return window.addEventListener("scroll", ne, { passive: !0 }), ne(), () => window.removeEventListener("scroll", ne);
  }, [be.length, Q.length]);
  const we = f((j) => {
    p(j), re(24);
  }, []), ye = f(() => {
    const j = he.current;
    requestAnimationFrame(() => {
      window.scrollTo({ top: j, behavior: "auto" }), document.scrollingElement && (document.scrollingElement.scrollTop = j);
    });
  }, []), V = f(async () => {
    var j;
    he.current = ((j = document.scrollingElement) == null ? void 0 : j.scrollTop) ?? window.scrollY ?? 0;
    try {
      await n();
    } finally {
      ye();
    }
  }, [n, ye]), de = f(
    (j) => {
      const g = [];
      for (const ne of t)
        if (ne.skills.some((ce) => ce.name === j)) {
          const ce = a.find((_e) => _e.id === ne.agent_id);
          g.push((ce == null ? void 0 : ce.name) || ne.agent_name || ne.agent_id);
        }
      return g;
    },
    [t, a]
  ), ge = f(
    async (j) => {
      if (J(j), X(de(j.name)), W(!0), !j.content) {
        fe(!0);
        try {
          const g = await Va(j.name);
          J({ ...j, content: g });
        } catch {
        } finally {
          fe(!1);
        }
      }
    },
    [de]
  );
  u(() => {
    S && X(de(S.name));
  }, [S, de, t]);
  const F = async (j) => {
    Ee(!0);
    try {
      await Vt(o, j.name), K.success(
        `已将技能「${j.name}」加载到当前专家「${c}」`
      ), r(j);
    } catch (g) {
      K.error(g.message || "加载技能失败");
    } finally {
      Ee(!1);
    }
  }, y = (j) => {
    if (j.protected) {
      K.warning("内置技能不可删除");
      return;
    }
    H.confirm({
      title: `确认从技能池删除「${j.name}」？`,
      content: "删除后所有已安装此技能的专家将不受影响，但技能池中将不再包含此技能。此操作不可撤销。",
      okText: "确认删除",
      cancelText: "取消",
      okButtonProps: { danger: !0 },
      onOk: async () => {
        Ee(!0);
        try {
          await ol(j.name), K.success(`已从技能池删除「${j.name}」`), await V();
        } catch (g) {
          K.error(g.message || "删除失败");
        } finally {
          Ee(!1);
        }
      }
    });
  }, me = (j) => {
    window.history.pushState({}, "", j), window.dispatchEvent(new PopStateEvent("popstate"));
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
      s.createElement(b, {
        placeholder: "搜索技能名称、描述或标签...",
        prefix: w ? s.createElement(w) : void 0,
        value: P,
        onChange: (j) => we(j.target.value),
        allowClear: !0,
        style: { maxWidth: 400 }
      }),
      s.createElement(
        "div",
        { style: { display: "flex", gap: 8 } },
        s.createElement(
          v,
          {
            icon: T ? s.createElement(T) : void 0,
            onClick: V,
            loading: l,
            size: "small"
          },
          "刷新"
        ),
        s.createElement(
          v,
          {
            type: "primary",
            icon: E ? s.createElement(E) : void 0,
            onClick: () => me("/skill-pool"),
            size: "small",
            style: je
          },
          "管理技能池"
        )
      )
    ),
    l ? s.createElement(
      "div",
      { style: { textAlign: "center", padding: 60 } },
      s.createElement(x, { size: "large" })
    ) : be.length === 0 ? s.createElement(C, {
      description: P ? "未找到匹配的技能" : "技能池为空"
    }) : s.createElement(
      s.Fragment,
      null,
      s.createElement(
        I,
        { gutter: [12, 12] },
        ...Q.map(
          (j) => s.createElement(
            z,
            { key: j.name, xs: 24, sm: 12, md: 8, lg: 6 },
            s.createElement(
              N,
              {
                hoverable: !0,
                size: "small",
                style: { cursor: "pointer", height: "100%" },
                onClick: () => ge(j),
                onMouseEnter: () => oe(j.name),
                onMouseLeave: () => oe(null)
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
                j.emoji ? s.createElement(
                  "span",
                  { style: { fontSize: 18 } },
                  j.emoji
                ) : s.createElement(
                  "span",
                  { style: { fontSize: 18 } },
                  "⚡"
                ),
                s.createElement(
                  Z,
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
                j.protected ? s.createElement(
                  D,
                  { color: "gold", style: { fontSize: 10 } },
                  "内置"
                ) : null
              ),
              j.description ? s.createElement(
                U,
                {
                  type: "secondary",
                  style: { fontSize: 11, margin: 0, lineHeight: 1.4 },
                  ellipsis: { rows: 2 }
                },
                j.description
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
                j.version_text ? s.createElement(
                  D,
                  { style: { fontSize: 10 } },
                  `v${j.version_text}`
                ) : null,
                ...(j.tags || []).slice(0, 3).map(
                  (g, ne) => s.createElement(
                    D,
                    { key: ne, color: "cyan", style: { fontSize: 10 } },
                    g
                  )
                )
              ),
              // Hover action footer
              pe === j.name ? s.createElement(
                "div",
                {
                  style: {
                    marginTop: 8,
                    paddingTop: 8,
                    borderTop: "1px solid var(--ant-color-border-secondary, #f0f0f0)",
                    display: "flex",
                    gap: 8,
                    justifyContent: "flex-end"
                  }
                },
                s.createElement(
                  v,
                  {
                    size: "small",
                    type: "primary",
                    icon: q ? s.createElement(q) : void 0,
                    disabled: ae || Ae.has(j.name),
                    onClick: (g) => {
                      g.stopPropagation(), F(j);
                    }
                  },
                  Ae.has(j.name) ? "已加载" : "加载到当前Agent"
                ),
                s.createElement(
                  v,
                  {
                    size: "small",
                    danger: !0,
                    icon: k ? s.createElement(k) : void 0,
                    disabled: ae || j.protected,
                    onClick: (g) => {
                      g.stopPropagation(), y(j);
                    }
                  },
                  "删除"
                )
              ) : null
            )
          )
        ),
        // Infinite-scroll sentinel
        Q.length < be.length ? s.createElement(
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
            Z,
            { type: "secondary", style: { fontSize: 12 } },
            `继续下滑自动加载 · 还剩 ${be.length - Q.length} 个`
          )
        ) : null
      )
    ),
    // Skill detail drawer
    S ? s.createElement(
      B,
      {
        title: s.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 8 } },
          s.createElement(
            "span",
            { style: { fontSize: 18 } },
            S.emoji || "⚡"
          ),
          s.createElement("span", null, S.name)
        ),
        open: te,
        onClose: () => W(!1),
        width: 520,
        extra: s.createElement(
          v,
          {
            type: "primary",
            size: "small",
            icon: $ ? s.createElement($) : void 0,
            onClick: () => me("/skills")
          },
          "管理技能"
        )
      },
      s.createElement(
        M,
        { column: 1, bordered: !0, size: "small" },
        s.createElement(
          M.Item,
          { label: "技能名称" },
          S.name
        ),
        s.createElement(
          M.Item,
          { label: "描述" },
          S.description || "-"
        ),
        S.version_text ? s.createElement(
          M.Item,
          { label: "版本" },
          S.version_text
        ) : null,
        s.createElement(
          M.Item,
          { label: "来源" },
          S.source || "-"
        ),
        s.createElement(
          M.Item,
          { label: "受保护" },
          S.protected ? "是（内置）" : "否"
        ),
        S.sync_status ? s.createElement(
          M.Item,
          { label: "同步状态" },
          S.sync_status
        ) : null,
        S.installed_from ? s.createElement(
          M.Item,
          { label: "安装来源" },
          S.installed_from
        ) : null
      ),
      // Tags
      S.tags && S.tags.length > 0 ? s.createElement(
        "div",
        { style: { marginTop: 16 } },
        s.createElement(
          Z,
          {
            strong: !0,
            style: { display: "block", marginBottom: 8 }
          },
          "标签"
        ),
        s.createElement(
          "div",
          { style: { display: "flex", flexWrap: "wrap", gap: 4 } },
          ...S.tags.map(
            (j, g) => s.createElement(D, { key: g, color: "cyan" }, j)
          )
        )
      ) : null,
      // Installed agents
      s.createElement(
        "div",
        { style: { marginTop: 16 } },
        s.createElement(
          Z,
          { strong: !0, style: { display: "block", marginBottom: 8 } },
          `已安装此技能的专家 (${le.length})`
        ),
        le.length > 0 ? s.createElement(A, {
          size: "small",
          dataSource: le,
          renderItem: (j) => s.createElement(
            A.Item,
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
              s.createElement(Ge, { name: j, size: 20 }),
              s.createElement(
                Z,
                { style: { fontSize: 13 } },
                j
              )
            )
          )
        }) : s.createElement(
          Z,
          { type: "secondary", style: { fontSize: 12 } },
          "暂无专家安装此技能"
        )
      ),
      // Skill content preview (lazy-loaded)
      ee ? s.createElement(
        "div",
        { style: { marginTop: 16, textAlign: "center" } },
        s.createElement(x, { size: "small" })
      ) : S.content ? s.createElement(
        "div",
        { style: { marginTop: 16 } },
        s.createElement(
          Z,
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
          S.content.slice(0, 2e3) + (S.content.length > 2e3 ? `

... (内容已截断)` : "")
        )
      ) : null
    ) : null
  );
}
function sr({
  embedded: e = !1
} = {}) {
  const t = _().React, { useState: a, useEffect: l, useCallback: n, useMemo: r } = t, { Tabs: o, message: c } = _().antd, { ThunderboltOutlined: s, AppstoreOutlined: d } = _().antdIcons || {}, f = _().useSelectedAgent, u = f ? f() : null, h = (u == null ? void 0 : u.id) || "default";
  l(() => {
    qt();
  }, [h]);
  const [x, C] = a([]), [b, v] = a([]), [I, z] = a([]), [N, D] = a(!0), [G, B] = a("agent-skills"), [M, A] = a(0), H = n(async () => {
    D(!0);
    try {
      const [k, q, Z] = await Promise.all([
        Rt(!0),
        At(),
        Xa()
      ]);
      v(k), C(q), z(Z);
    } catch (k) {
      c.error(k.message || "加载技能列表失败"), v([]);
    } finally {
      D(!1);
    }
  }, []);
  l(() => {
    H();
  }, [H]);
  const K = r(() => {
    const k = x.find((q) => q.id === h);
    return (k == null ? void 0 : k.name) || h;
  }, [x, h]), T = n(
    (k) => {
      z(
        (q) => q.map((Z) => Z.agent_id !== h || Z.skills.some((U) => U.name === k.name) ? Z : {
          ...Z,
          skills: [
            ...Z.skills,
            {
              name: k.name,
              description: k.description,
              version_text: k.version_text,
              content: k.content || "",
              source: k.source || "pool",
              enabled: !0,
              tags: k.tags,
              emoji: k.emoji,
              installed_from: k.installed_from
            }
          ]
        })
      ), A((q) => q + 1);
    },
    [h]
  ), w = (k) => {
    window.history.pushState({}, "", k), window.dispatchEvent(new PopStateEvent("popstate"));
  }, E = [
    {
      key: "agent-skills",
      label: t.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        s ? t.createElement(s, { style: { fontSize: 14 } }) : null,
        "当前专家"
      ),
      children: t.createElement(rr, {
        agentId: h,
        agentName: K,
        refreshKey: M,
        onNavigate: w
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
      children: t.createElement(or, {
        poolSkills: b,
        workspaceSkills: I,
        agents: x,
        loading: N,
        onReload: H,
        onSkillInstalled: T,
        agentId: h,
        agentName: K
      })
    }
  ], $ = t.createElement(o, {
    items: E,
    activeKey: G,
    onChange: (k) => B(k)
  });
  return e ? $ : t.createElement(
    "div",
    { style: { padding: 24 } },
    t.createElement($t, {
      title: "技能",
      subtitle: `技能池共 ${b.length} 个技能 · 当前智能体：${K}`
    }),
    $
  );
}
const Ht = {
  reservoir_simulation: "油藏数值模拟",
  geological_modeling: "地质建模",
  well_log_analysis: "测井分析",
  production_engineering: "采油工程",
  post_processing: "后处理与可视化",
  multiphysics: "多物理场仿真"
}, ca = {
  reservoir_simulation: "🛢️",
  geological_modeling: "🏔️",
  well_log_analysis: "📡",
  production_engineering: "⚙️",
  post_processing: "📊",
  multiphysics: "🔬"
}, da = /* @__PURE__ */ new Set(["cmg", "comsol", "tnavigator", "eclipse", "intersect", "visage"]);
function ma(e) {
  return It(`/ugsci/engines/icon/${encodeURIComponent(e)}`);
}
async function ir() {
  return ie("/ugsci/engines/list");
}
async function cr(e) {
  return ie("/ugsci/engines/", {
    method: "POST",
    body: JSON.stringify(e)
  });
}
async function dr(e, t) {
  return ie(`/ugsci/engines/${encodeURIComponent(e)}`, {
    method: "PUT",
    body: JSON.stringify(t)
  });
}
async function mr(e) {
  return ie(
    `/ugsci/engines/${encodeURIComponent(e)}`,
    { method: "DELETE" }
  );
}
async function ur() {
  return ie("/ugsci/engines/detect/refresh", {
    method: "POST"
  });
}
function pr({
  engine: e,
  onClick: t
}) {
  const a = _().React, { Card: l, Tag: n, Typography: r } = _().antd, { Text: o } = r, c = e.status === "detected", s = ca[e.category] || "📦", m = da.has(e.id) ? a.createElement("img", {
    src: ma(e.id),
    alt: e.name,
    style: { width: 24, height: 24, objectFit: "contain" }
  }) : a.createElement("span", { style: { fontSize: 20 } }, s);
  return a.createElement(
    l,
    {
      hoverable: !0,
      onClick: t,
      size: "small",
      style: {
        cursor: "pointer",
        borderColor: c ? void 0 : "var(--ant-color-border, #d9d9d9)",
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
        m,
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
        c ? a.createElement(
          n,
          { color: "success", style: { fontSize: 11 } },
          "✅ 已检测"
        ) : e.executable_path ? a.createElement(
          n,
          { color: "warning", style: { fontSize: 11 } },
          "⚠ 路径无效"
        ) : a.createElement(
          n,
          { style: { fontSize: 11 } },
          "🔧 待配置"
        ),
        e.is_default ? a.createElement(
          n,
          { color: "blue", style: { fontSize: 10 } },
          "默认"
        ) : e.is_custom ? a.createElement(
          n,
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
        n,
        { style: { fontSize: 11 } },
        Ht[e.category] || e.category
      ) : null,
      e.version ? a.createElement(
        n,
        { color: "blue", style: { fontSize: 11 } },
        `v${e.version}`
      ) : null,
      ...(e.modules || []).map(
        (f) => a.createElement(
          n,
          { key: f, color: "cyan", style: { fontSize: 10 } },
          f
        )
      )
    )
  );
}
function gr() {
  const e = _().React, { useState: t, useEffect: a, useCallback: l, useMemo: n } = e, {
    Spin: r,
    Empty: o,
    Button: c,
    message: s,
    Row: d,
    Col: m,
    Drawer: f,
    Descriptions: u,
    Tag: h,
    Typography: x,
    Modal: C,
    Input: b,
    Select: v,
    Popconfirm: I,
    Space: z
  } = _().antd, {
    ReloadOutlined: N,
    SearchOutlined: D,
    PlusOutlined: G,
    EditOutlined: B,
    DeleteOutlined: M,
    CopyOutlined: A,
    ExperimentOutlined: H
  } = _().antdIcons || {}, { Text: K, Paragraph: T } = x, [w, E] = t([]), [$, k] = t(!0), [q, Z] = t(""), [U, P] = t(!1), [p, te] = t(null), [W, S] = t(!1), [J, le] = t(null), [X, ee] = t({}), [fe, R] = t(!1), re = l(async () => {
    k(!0);
    try {
      const Q = await ir();
      E(Q.engines || []);
    } catch (Q) {
      s.error(Q.message || "加载引擎列表失败"), E([]);
    } finally {
      k(!1);
    }
  }, []);
  a(() => {
    re();
  }, [re]);
  const pe = n(() => {
    if (!q.trim()) return w;
    const Q = q.toLowerCase();
    return w.filter(
      (we) => {
        var ye;
        return we.name.toLowerCase().includes(Q) || we.vendor.toLowerCase().includes(Q) || we.category.toLowerCase().includes(Q) || ((ye = we.description) == null ? void 0 : ye.toLowerCase().includes(Q));
      }
    );
  }, [w, q]);
  w.filter((Q) => Q.status === "detected").length;
  const oe = l((Q) => {
    navigator.clipboard.writeText(Q).then(() => s.success("路径已复制")).catch(() => s.error("复制失败"));
  }, []), ae = l(() => {
    le(null), ee({
      name: "",
      vendor: "",
      version: "",
      executable_path: "",
      category: "",
      description: "",
      invocation_hint: ""
    }), S(!0);
  }, []), Ee = l((Q) => {
    le(Q), ee({ ...Q }), S(!0), P(!1);
  }, []), he = l(async () => {
    var Q;
    if (!((Q = X.name) != null && Q.trim())) {
      s.warning("请输入引擎名称");
      return;
    }
    R(!0);
    try {
      J ? (await dr(J.id, X), s.success("引擎已更新")) : (await cr(X), s.success("引擎已添加")), S(!1), re();
    } catch (we) {
      s.error(we.message || "保存失败");
    } finally {
      R(!1);
    }
  }, [X, J, re]), ke = l(
    async (Q) => {
      try {
        await mr(Q), s.success("引擎已删除"), P(!1), re();
      } catch (we) {
        s.error(we.message || "删除失败");
      }
    },
    [re]
  ), Ae = l(async () => {
    k(!0);
    try {
      const Q = await ur();
      E(Q.engines || []), s.success("自动检测完成");
    } catch (Q) {
      s.error(Q.message || "检测失败");
    } finally {
      k(!1);
    }
  }, []), be = l(
    (Q, we, ye) => {
      const V = X[we] || "";
      return e.createElement(
        "div",
        { style: { marginBottom: 12 } },
        e.createElement(
          K,
          { style: { fontSize: 13, display: "block", marginBottom: 4 } },
          Q
        ),
        ye != null && ye.select ? e.createElement(v, {
          value: V || void 0,
          onChange: (de) => ee((ge) => ({ ...ge, [we]: de })),
          style: { width: "100%" },
          options: ye.select.options,
          allowClear: !0,
          placeholder: `选择${Q}`
        }) : ye != null && ye.textarea ? e.createElement(b.TextArea, {
          value: V,
          onChange: (de) => ee((ge) => ({ ...ge, [we]: de.target.value })),
          rows: 3,
          placeholder: `输入${Q}`
        }) : e.createElement(b, {
          value: V,
          onChange: (de) => ee((ge) => ({ ...ge, [we]: de.target.value })),
          placeholder: `输入${Q}`
        })
      );
    },
    [X]
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
      e.createElement(b, {
        placeholder: "搜索引擎名称、厂商...",
        prefix: D ? e.createElement(D) : void 0,
        value: q,
        onChange: (Q) => Z(Q.target.value),
        allowClear: !0,
        style: { maxWidth: 280 }
      }),
      e.createElement(
        c,
        {
          icon: N ? e.createElement(N) : void 0,
          onClick: Ae,
          loading: $
        },
        "自动检测"
      ),
      e.createElement(
        c,
        {
          type: "primary",
          icon: G ? e.createElement(G) : void 0,
          onClick: ae,
          style: je
        },
        "添加引擎"
      )
    ),
    // Content
    $ ? e.createElement(
      "div",
      { style: { textAlign: "center", padding: 60 } },
      e.createElement(r, {
        size: "large",
        tip: "正在加载引擎..."
      })
    ) : pe.length === 0 ? e.createElement(o, {
      description: q ? "无匹配引擎" : "暂无引擎，点击「添加引擎」开始"
    }) : e.createElement(
      d,
      { gutter: [12, 12], align: "stretch" },
      ...pe.map(
        (Q) => e.createElement(
          m,
          {
            key: Q.id,
            xs: 24,
            sm: 12,
            md: 8,
            lg: 6,
            style: { display: "flex" }
          },
          e.createElement(pr, {
            engine: Q,
            onClick: () => {
              te(Q), P(!0);
            }
          })
        )
      )
    ),
    // Detail drawer
    p ? e.createElement(
      f,
      {
        title: e.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 8 } },
          e.createElement(
            "span",
            { style: { display: "flex", alignItems: "center" } },
            da.has(p.id) ? e.createElement("img", {
              src: ma(p.id),
              alt: p.name,
              style: { width: 20, height: 20, objectFit: "contain" }
            }) : e.createElement(
              "span",
              { style: { fontSize: 18 } },
              ca[p.category] || "📦"
            )
          ),
          e.createElement("span", null, p.name)
        ),
        open: U,
        onClose: () => P(!1),
        width: 520,
        extra: e.createElement(
          z,
          null,
          e.createElement(
            c,
            {
              size: "small",
              icon: B ? e.createElement(B) : void 0,
              onClick: () => Ee(p)
            },
            "编辑"
          ),
          p.is_default ? null : e.createElement(
            I,
            {
              title: "确认删除此引擎？",
              description: p.name,
              onConfirm: () => ke(p.id),
              okText: "删除",
              cancelText: "取消",
              okButtonProps: { danger: !0 }
            },
            e.createElement(
              c,
              {
                size: "small",
                danger: !0,
                icon: M ? e.createElement(M) : void 0
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
          p.name
        ),
        e.createElement(
          u.Item,
          { label: "厂商" },
          p.vendor || "—"
        ),
        e.createElement(
          u.Item,
          { label: "分类" },
          p.category ? Ht[p.category] || p.category : "—"
        ),
        e.createElement(
          u.Item,
          { label: "状态" },
          e.createElement(
            h,
            {
              color: p.status === "detected" ? "success" : p.status === "not_found" ? "error" : "default"
            },
            p.status === "detected" ? "✅ 已检测" : p.status === "not_found" ? "❌ 路径无效" : "🔧 待配置"
          )
        ),
        e.createElement(
          u.Item,
          { label: "版本" },
          p.version || "—"
        ),
        p.executable_path ? e.createElement(
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
              p.executable_path
            ),
            e.createElement(
              c,
              {
                size: "small",
                type: "text",
                icon: A ? e.createElement(A) : void 0,
                onClick: () => oe(p.executable_path)
              }
            )
          )
        ) : null,
        p.install_dir ? e.createElement(
          u.Item,
          { label: "安装目录" },
          e.createElement(
            "code",
            { style: { fontSize: 12, wordBreak: "break-all" } },
            p.install_dir
          )
        ) : null,
        // Display detected modules with paths
        p.modules && p.modules.length > 0 ? e.createElement(
          u.Item,
          { label: "已检测模块" },
          e.createElement(
            "div",
            { style: { display: "flex", flexDirection: "column", gap: 4 } },
            ...p.modules.map(
              (Q) => e.createElement(
                "div",
                {
                  key: Q,
                  style: { display: "flex", alignItems: "center", gap: 8 }
                },
                e.createElement(
                  h,
                  { color: "cyan", style: { fontSize: 11 } },
                  Q
                ),
                p.module_paths && p.module_paths[Q] ? e.createElement(
                  "code",
                  { style: { fontSize: 11, wordBreak: "break-all" } },
                  p.module_paths[Q]
                ) : null
              )
            )
          )
        ) : null,
        p.license_server ? e.createElement(
          u.Item,
          { label: "许可证服务器" },
          p.license_server
        ) : null,
        e.createElement(
          u.Item,
          { label: "描述" },
          p.description || "—"
        )
      ),
      // Invocation hint
      p.invocation_hint ? e.createElement(
        "div",
        {
          style: {
            marginTop: 16,
            padding: 12,
            background: "var(--ant-color-primary-bg, #e6f4ff)",
            borderRadius: 8
          }
        },
        e.createElement(
          K,
          { strong: !0, style: { fontSize: 13 } },
          "💡 调用方式"
        ),
        e.createElement(
          "div",
          { style: { marginTop: 8, fontSize: 13, lineHeight: 1.6 } },
          p.invocation_hint
        )
      ) : null,
      // Type badge
      e.createElement(
        "div",
        { style: { marginTop: 12 } },
        p.is_default ? e.createElement(
          h,
          { color: "blue" },
          "默认引擎"
        ) : p.is_custom ? e.createElement(
          h,
          { color: "purple" },
          "自定义引擎"
        ) : null
      )
    ) : null,
    // Add/Edit modal
    e.createElement(
      C,
      {
        title: J ? "编辑引擎" : "添加引擎",
        open: W,
        onOk: he,
        onCancel: () => S(!1),
        okText: J ? "保存" : "添加",
        cancelText: "取消",
        confirmLoading: fe,
        width: 560
      },
      e.createElement(
        "div",
        { style: { maxHeight: 480, overflow: "auto", paddingRight: 8 } },
        be("引擎名称 *", "name"),
        be("厂商", "vendor"),
        be("版本", "version"),
        be("可执行文件路径", "executable_path"),
        be("安装目录", "install_dir"),
        be("分类", "category", {
          select: {
            options: Object.entries(Ht).map(([Q, we]) => ({
              label: we,
              value: Q
            }))
          }
        }),
        be("描述", "description", { textarea: !0 }),
        be("调用方式提示", "invocation_hint", { textarea: !0 }),
        be("许可证服务器", "license_server")
      )
    )
  );
}
const fr = sr, ua = /* @__PURE__ */ new Set(["tools", "engines", "skills"]);
function yr(e) {
  try {
    const t = new URLSearchParams(window.location.search).get("tab");
    return t && ua.has(t) ? t : e;
  } catch {
    return e;
  }
}
function Un(e) {
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
function Wt({ page: e }) {
  const t = _().React, { useEffect: a, useState: l } = t, { Alert: n, Spin: r } = _().antd, [o, c] = l(null), [s, d] = l("");
  if (a(() => {
    let f = !0;
    const u = _().loadBuiltinPage;
    return c(null), u ? (d(""), u(e).then((h) => {
      f && c(() => h);
    }).catch((h) => {
      f && d(
        h instanceof Error ? h.message : "加载原生管理页面失败"
      );
    }), () => {
      f = !1;
    }) : (d("当前 QwenPaw 版本不支持原生页面嵌入"), () => {
      f = !1;
    });
  }, [e]), s)
    return t.createElement(n, {
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
  const m = e === "mcp" ? {
    title: "UGSci MCP",
    description: "连接外部工具、数据服务与计算能力，扩展当前专家的可调用范围",
    managedTitle: "已接入服务",
    managedDescription: "启用后可由当前专家调用，并可按工具配置访问权限",
    create: "接入 MCP 服务"
  } : void 0;
  return t.createElement(o, { embedded: !0, embeddedLabels: m });
}
function Er() {
  const e = _().React, { Tabs: t } = _().antd;
  return e.createElement(t, {
    defaultActiveKey: "mcp",
    items: [
      {
        key: "mcp",
        label: "MCP 接入",
        children: e.createElement(Wt, { page: "mcp" })
      },
      {
        key: "builtin",
        label: "平台内置",
        children: e.createElement(Wt, { page: "tools" })
      }
    ]
  });
}
function hr() {
  const e = _().React, { Empty: t, Typography: a } = _().antd, { Paragraph: l } = a;
  return e.createElement(
    "div",
    { style: { padding: "36px 12px" } },
    e.createElement(t, {
      description: e.createElement(
        "div",
        null,
        e.createElement("div", null, "暂无已注册的领域计算引擎"),
        e.createElement(
          l,
          {
            type: "secondary",
            style: { maxWidth: 560, margin: "8px auto 0" }
          },
          "后续 PVT、气藏工程、井筒计算等内核可按引擎注册，并向工具层暴露标准调用接口。"
        )
      )
    })
  );
}
function vr() {
  const e = _().React, { Tabs: t } = _().antd;
  return e.createElement(t, {
    defaultActiveKey: "simulation",
    items: [
      {
        key: "simulation",
        label: "仿真软件",
        children: e.createElement(gr)
      },
      {
        key: "domain",
        label: "领域计算",
        children: e.createElement(hr)
      },
      {
        key: "runtime",
        label: "运行服务",
        children: e.createElement(Wt, { page: "acp" })
      }
    ]
  });
}
function pa({
  initialTab: e = "engines"
} = {}) {
  var C, b;
  const t = _().React, { useEffect: a, useState: l } = t, { Tabs: n, Tag: r } = _().antd, { RocketOutlined: o, ToolOutlined: c, ThunderboltOutlined: s } = _().antdIcons || {}, d = (b = (C = _()).useSelectedAgent) == null ? void 0 : b.call(C), m = (d == null ? void 0 : d.id) || "default", [f, u] = l(
    () => yr(e)
  );
  a(() => {
    try {
      const v = new URLSearchParams(window.location.search).get("tab");
      v && !ua.has(v) && Un(f);
    } catch {
    }
  }, [f]);
  const h = (v) => {
    u(v), Un(v);
  }, x = (v, I) => t.createElement(
    "span",
    { style: { display: "inline-flex", alignItems: "center", gap: 6 } },
    I ? t.createElement(I, { style: { fontSize: 14 } }) : null,
    v
  );
  return t.createElement(
    "div",
    { style: { padding: 24 } },
    t.createElement($t, {
      title: "工具·技能",
      subtitle: "管理当前专家可调用的引擎、工具、运行服务与专业技能",
      extra: t.createElement(
        r,
        { color: "blue" },
        `当前专家：${m}`
      )
    }),
    t.createElement(n, {
      activeKey: f,
      onChange: (v) => h(v),
      items: [
        {
          key: "engines",
          label: x("引擎", o),
          children: t.createElement(vr)
        },
        {
          key: "tools",
          label: x("工具", c),
          children: t.createElement(Er)
        },
        {
          key: "skills",
          label: x("技能", s),
          children: t.createElement(fr, {
            embedded: !0
          })
        }
      ]
    })
  );
}
const ga = pa;
function br() {
  return _().React.createElement(ga, {
    initialTab: "tools"
  });
}
function wr() {
  return _().React.createElement(ga, {
    initialTab: "skills"
  });
}
const Nn = {
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
function Sr(e) {
  if (!e.env) return !1;
  const t = Object.entries(e.env);
  return t.length === 0 ? !1 : t.some(([, a]) => typeof a == "string" && a.length > 0);
}
const kt = "ugsci.market.githubSources", Dn = "https://github.com/anthropics/skills/tree/main/skills", fa = "https://ugsci-awesome-tools.oss-cn-beijing.aliyuncs.com", xr = `${fa}/skills`;
function kr(e) {
  const t = e.replace(/^\/+/, "");
  return It(`/plugins/oss-proxy?path=${encodeURIComponent(t)}`);
}
function _t(e) {
  const t = e.replace(/^\/+/, "");
  return Je(`/plugins/oss-proxy?path=${encodeURIComponent(t)}`);
}
async function nn(e) {
  const t = e.replace(/^\/+/, ""), a = await _t(t);
  if (!a.ok)
    throw new Error(`OSS fetch failed (${a.status}): ${t}`);
  return await a.json();
}
function nt(e) {
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
function Cr(e) {
  var n, r;
  const t = {};
  if (e.env && e.env.length > 0)
    for (const o of e.env)
      t[o] = `your-${o.toLowerCase().replace(/_/g, "-")}`;
  let a = "🔌";
  const l = (e.icon || "").toLowerCase();
  return l.includes("folder") ? a = "📁" : l.includes("git") ? a = "🌿" : l.includes("github") ? a = "🐙" : l.includes("database") || l.includes("postgres") || l.includes("sqlite") ? a = "🗄️" : l.includes("search") || l.includes("brave") ? a = "🔍" : l.includes("browser") || l.includes("puppeteer") ? a = "🎭" : l.includes("memory") || l.includes("brain") ? a = "🧠" : l.includes("file") || l.includes("fetch") ? a = "🌐" : l.includes("slack") ? a = "💬" : l.includes("google") ? a = "📁" : l.includes("notion") ? a = "📝" : l.includes("jupyter") ? a = "📊" : l.includes("science") || l.includes("flask") ? a = "🔬" : l.includes("book") || l.includes("arxiv") ? a = "📚" : l.includes("patent") && (a = "📜"), {
    id: e.id,
    name: e.name,
    emoji: a,
    iconUrl: e.icon_url ? kr(e.icon_url) : void 0,
    category: e.category ? nt(e.category) : "",
    description: e.description,
    transport: e.transport || "stdio",
    command: ((n = e.config) == null ? void 0 : n.command) || "",
    args: ((r = e.config) == null ? void 0 : r.args) || [],
    env: Object.keys(t).length > 0 ? t : void 0
  };
}
const ya = "ugsci.market.mcpSources", Ea = "ugsci.market.expertSources";
function ha(e, t) {
  try {
    const a = localStorage.getItem(e);
    if (!a) return [];
    const l = JSON.parse(a);
    return Array.isArray(l) ? l.filter(
      (n) => n && typeof n.id == "string" && typeof n.label == "string" && typeof n.url == "string"
    ).map((n) => ({
      id: n.id,
      label: n.label,
      url: n.url,
      enabled: n.enabled !== !1,
      type: t
    })) : [];
  } catch {
    return [];
  }
}
function va(e, t) {
  try {
    localStorage.setItem(e, JSON.stringify(t));
  } catch {
  }
}
function Tr() {
  return ha(ya, "mcp");
}
function bt(e) {
  va(ya, e);
}
function _r() {
  return ha(Ea, "expert");
}
function wt(e) {
  va(Ea, e);
}
function ba(e) {
  try {
    const t = new URL(e.trim()), a = t.hostname.toLowerCase();
    let l;
    if (a === "github.com" || a === "www.github.com")
      l = "github";
    else if (a === "gitee.com" || a === "www.gitee.com")
      l = "gitee";
    else
      return null;
    const n = t.pathname.split("/").filter((d) => d.length > 0);
    if (n.length < 2) return null;
    const r = decodeURIComponent(n[0]), o = decodeURIComponent(n[1]);
    let c = "main", s = "";
    return n.length >= 4 && (n[2] === "tree" || n[2] === "blob") ? (c = decodeURIComponent(n[3]), n.length > 4 && (s = n.slice(4).map(decodeURIComponent).join("/"))) : n.length > 2 && (s = n.slice(2).map(decodeURIComponent).join("/")), s = s.replace(/\/+$/, "").replace(/^\/+/, ""), {
      owner: r,
      repo: o,
      ref: c || "main",
      skillsPath: s,
      label: `${r}/${o}`,
      platform: l
    };
  } catch {
    return null;
  }
}
function wa(e, t, a, l = "github") {
  return l === "oss" ? `oss:${e}/${a || "/"}` : `${l}:${e}/${t}:${a || "/"}`;
}
function Ir(e) {
  try {
    const t = new URL(e.trim()), a = t.hostname.toLowerCase(), l = a.match(
      /^([a-z0-9][a-z0-9-]{1,61}[a-z0-9])\.oss-([a-z0-9-]+)\.aliyuncs\.com$/
    );
    if (!l) return null;
    const n = l[1], r = `${t.protocol}//${a}`, o = decodeURIComponent(t.pathname).replace(/^\/+/, "").replace(/\/+$/, "");
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
function zr() {
  try {
    const e = localStorage.getItem(kt);
    if (!e) {
      const l = [], n = ba(Dn);
      return n && l.push({
        id: wa(
          n.owner,
          n.repo,
          n.skillsPath,
          n.platform
        ),
        url: Dn,
        label: n.label,
        owner: n.owner,
        repo: n.repo,
        ref: n.ref,
        skillsPath: n.skillsPath,
        enabled: !1,
        platform: n.platform
      }), localStorage.setItem(kt, JSON.stringify(l)), l;
    }
    const t = JSON.parse(e);
    if (!Array.isArray(t)) return [];
    const a = t.filter(
      (l) => l && typeof l.id == "string" && (typeof l.owner == "string" || l.platform === "oss") && !(l.platform === "oss" && l.url === xr)
    ).map((l) => ({
      ...l,
      platform: l.platform || "github",
      owner: l.owner || "",
      repo: l.repo || "",
      ref: l.ref || "",
      skillsPath: l.skillsPath || ""
    }));
    return a.length !== t.length && localStorage.setItem(
      kt,
      JSON.stringify(a)
    ), a;
  } catch {
    return [];
  }
}
function St(e) {
  try {
    localStorage.setItem(
      kt,
      JSON.stringify(e)
    );
  } catch {
  }
}
function $r(e) {
  const t = e.match(/^---\s*\n([\s\S]*?)\n---/);
  if (!t) return {};
  const a = t[1], l = {}, n = a.split(`
`);
  let r = "";
  for (const o of n) {
    const c = o.match(/^(\w[\w-]*)\s*:\s*(.*)$/);
    if (c) {
      r = c[1];
      let s = c[2].trim();
      (s.startsWith('"') && s.endsWith('"') || s.startsWith("'") && s.endsWith("'")) && (s = s.slice(1, -1)), r === "name" ? l.name = s : r === "description" ? l.description = s : r === "version" ? l.version = s : r === "author" && (l.author = s);
    }
  }
  return l;
}
async function Ar(e) {
  const t = e.platform === "gitee", a = e.skillsPath ? encodeURIComponent(e.skillsPath).replace(/%2F/g, "/") : "", l = t ? `https://gitee.com/api/v5/repos/${e.owner}/${e.repo}/contents/${a}?ref=${encodeURIComponent(e.ref)}` : `https://api.github.com/repos/${e.owner}/${e.repo}/contents/${a}?ref=${encodeURIComponent(e.ref)}`, n = {
    Accept: t ? "application/json" : "application/vnd.github+json"
  };
  t && e.accessToken && (n.Authorization = `token ${e.accessToken}`);
  const r = await fetch(l, {
    headers: n
  });
  if (!r.ok)
    throw new Error(
      `${t ? "Gitee" : "GitHub"} API ${r.status}: ${e.label} (${e.skillsPath || "/"})`
    );
  const o = await r.json();
  if (!Array.isArray(o)) return [];
  const c = o.filter(
    (d) => d.type === "dir" && d.name
  );
  return await Promise.all(
    c.map(async (d) => {
      const m = e.skillsPath ? e.skillsPath + "/" : "", f = t ? `https://gitee.com/${e.owner}/${e.repo}/raw/${e.ref}/${m}${d.name}/SKILL.md` : `https://raw.githubusercontent.com/${e.owner}/${e.repo}/${e.ref}/${m}${d.name}/SKILL.md`, u = t ? `https://gitee.com/${e.owner}/${e.repo}/tree/${e.ref}/${m}${d.name}` : `https://github.com/${e.owner}/${e.repo}/tree/${e.ref}/${m}${d.name}`, h = {
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
        const x = {};
        t && e.accessToken && (x.Authorization = `token ${e.accessToken}`);
        const C = await fetch(f, {
          headers: x
        });
        if (!C.ok) return h;
        const b = await C.text(), v = $r(b);
        return {
          ...h,
          name: v.name || d.name,
          description: v.description || "",
          version: v.version || null,
          author: v.author || null
        };
      } catch {
        return h;
      }
    })
  );
}
async function Pr(e) {
  const t = Ir(e.url);
  if (!t)
    throw new Error(`Invalid OSS URL: ${e.url}`);
  const { endpoint: a, prefix: l } = t, n = l.split("/").map(encodeURIComponent).join("/"), r = await _t(
    `${n}/manifest.json`
  );
  if (!r.ok)
    throw new Error(
      `无法获取技能列表: manifest.json (${r.status})`
    );
  const o = await r.json(), c = [];
  if (o && o.tag_groups && typeof o.tag_groups == "object")
    for (const [m, f] of Object.entries(o.tag_groups))
      Array.isArray(f) && c.push({
        id: m,
        label: nt(m),
        tags: f
      });
  const s = [];
  function d(m, f) {
    for (const u of m) {
      if (u.type === "collection" && Array.isArray(u.children)) {
        d(u.children, u.name);
        continue;
      }
      const h = u.path || u.name || "";
      if (!h) continue;
      const x = h.split("/").map(encodeURIComponent).join("/"), C = `${a}/${n}/${x}`;
      let b = null;
      if (u.metadata) {
        const I = u.metadata.match(/version:\s*"?([\d.]+)"?/);
        I && (b = I[1]);
      }
      const v = f ? `${e.label}/${f}` : e.label;
      s.push({
        sourceId: e.id,
        sourceLabel: e.label,
        sourcePath: v,
        name: u.name || h.split("/").pop() || h,
        description: u.description || "",
        source_url: C,
        html_url: C,
        version: b,
        author: null,
        tag: u.tag || void 0,
        isOfficial: !0
      });
    }
  }
  if (Array.isArray(o) ? d(
    o.map(
      (m) => typeof m == "string" ? { name: m, path: m } : m
    )
  ) : o && Array.isArray(o.skills) && d(o.skills), s.length === 0)
    throw new Error(
      `manifest.json 中未找到技能。请检查 ${e.url}/manifest.json`
    );
  return { skills: s, categories: c };
}
async function Rr() {
  const e = await nn("mcp/manifest.json"), t = [], a = {};
  if (e.tag_groups && typeof e.tag_groups == "object")
    for (const [n, r] of Object.entries(e.tag_groups))
      Array.isArray(r) && (a[n] = r, t.push({
        id: n,
        label: nt(n),
        tags: r
      }));
  return { servers: (e.servers || []).map((n) => {
    let r = "";
    const o = n.tags || [];
    for (const [c, s] of Object.entries(a))
      if (s.some((d) => o.includes(d))) {
        r = c;
        break;
      }
    return {
      id: n.id || n.name,
      name: n.name || n.id,
      description: n.description || "",
      tags: o,
      transport: n.transport || "stdio",
      config: n.config,
      env: Array.isArray(n.env) ? n.env : void 0,
      source: n.source,
      icon: n.icon,
      icon_url: n.icon_url || n.icon_path || void 0,
      category: r
    };
  }), categories: t };
}
async function Or() {
  const e = await nn("skills/manifest.json"), t = [], a = /* @__PURE__ */ new Set();
  function l(n, r) {
    for (const o of n) {
      if ((o == null ? void 0 : o.type) === "collection" && Array.isArray(o.children)) {
        l(o.children, o.name || r);
        continue;
      }
      const c = String((o == null ? void 0 : o.path) || (o == null ? void 0 : o.name) || "").trim();
      if (!c) continue;
      const s = c.split("/").map(encodeURIComponent).join("/"), d = `${fa}/skills/${s}`, m = typeof o.tag == "string" && o.tag.trim() ? o.tag.trim() : void 0;
      m && a.add(m);
      let f = null;
      if (typeof o.metadata == "string") {
        const u = o.metadata.match(/version:\s*"?([\d.]+)"?/);
        u && (f = u[1]);
      }
      t.push({
        sourceId: "oss:ugsci-official",
        sourceLabel: "UGSci",
        sourcePath: r ? `UGSci/${r}` : "UGSci",
        name: o.name || c.split("/").pop() || c,
        description: o.description || "",
        source_url: d,
        html_url: d,
        version: f,
        author: null,
        tag: m,
        isOfficial: !0
      });
    }
  }
  if (Array.isArray(e) ? l(
    e.map(
      (n) => typeof n == "string" ? { name: n, path: n } : n
    )
  ) : e && Array.isArray(e.skills) && l(e.skills), t.length === 0)
    throw new Error("OSS 技能清单中没有可用技能");
  return {
    skills: t,
    categories: Array.from(a).map((n) => ({
      id: n,
      label: n
    }))
  };
}
async function Mr() {
  const e = await nn("agents/manifest.json"), t = [], a = {};
  if (e.tag_groups && typeof e.tag_groups == "object")
    for (const [n, r] of Object.entries(e.tag_groups))
      Array.isArray(r) && (a[n] = r, t.push({
        id: n,
        label: nt(n),
        tags: r
      }));
  return { agents: (e.agents || []).map((n) => {
    let r = "";
    const o = n.tags || [];
    for (const [c, s] of Object.entries(a))
      if (s.some((d) => o.includes(d))) {
        r = c;
        break;
      }
    return {
      id: n.id || n.name,
      name: n.name || n.id,
      description: n.description || "",
      path: n.path || "",
      tags: o,
      config: n.config,
      instructions: n.instructions,
      skills_manifest: n.skills_manifest,
      drivers: n.drivers,
      category: r
    };
  }), categories: t };
}
async function Lr(e) {
  const t = e.filter((o) => o.enabled), a = await Promise.all(
    t.map(async (o) => {
      try {
        if (o.platform === "oss") {
          const { skills: c, categories: s } = await Pr(o);
          return { skills: c, categories: s, error: null, label: o.label };
        } else
          return { skills: await Ar(o), categories: [], error: null, label: o.label };
      } catch (c) {
        return {
          skills: [],
          categories: [],
          error: c.message || String(c),
          label: o.label
        };
      }
    })
  ), l = [], n = [], r = [];
  for (const o of a)
    l.push(...o.skills), n.push(...o.categories), o.error && r.push({ label: o.label, message: o.error });
  return { skills: l, errors: r, categories: n };
}
function Br({
  open: e,
  onClose: t,
  sources: a,
  onChange: l
}) {
  const n = _().React, { useState: r } = n, {
    Modal: o,
    Input: c,
    Button: s,
    List: d,
    Tag: m,
    Switch: f,
    Typography: u,
    Tooltip: h,
    message: x
  } = _().antd, {
    PlusOutlined: C,
    DeleteOutlined: b,
    LinkOutlined: v,
    GithubOutlined: I
  } = _().antdIcons || {}, { Text: z } = u, [N, D] = r(""), [G, B] = r(""), M = () => {
    const T = N.trim();
    if (!T) return;
    const w = ba(T);
    if (!w) {
      x.error("无效的仓库 URL，请输入类似 https://github.com/owner/repo/tree/main/skills 或 https://gitee.com/owner/repo/tree/master/skills 的链接");
      return;
    }
    const E = wa(w.owner, w.repo, w.skillsPath, w.platform);
    if (a.some((q) => q.id === E)) {
      x.warning("该源已存在");
      return;
    }
    const $ = {
      id: E,
      url: T,
      label: w.label,
      owner: w.owner,
      repo: w.repo,
      ref: w.ref,
      skillsPath: w.skillsPath,
      enabled: !0,
      platform: w.platform,
      accessToken: G.trim() || void 0
    }, k = [...a, $];
    St(k), l(k), D(""), B(""), x.success(`已添加源: ${w.label}`);
  }, A = (T, w) => {
    const E = a.map(
      ($) => $.id === T ? { ...$, enabled: w } : $
    );
    St(E), l(E);
  }, H = (T, w) => {
    const E = a.map(
      ($) => $.id === T ? { ...$, accessToken: w.trim() || void 0 } : $
    );
    St(E), l(E);
  }, K = (T) => {
    const w = a.filter((E) => E.id !== T);
    St(w), l(w), x.success("已移除源");
  };
  return n.createElement(
    o,
    {
      open: e,
      onCancel: t,
      title: n.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 8 } },
        I ? n.createElement(I, { style: { fontSize: 18 } }) : null,
        n.createElement("span", null, "配置技能源")
      ),
      footer: n.createElement(
        s,
        { onClick: t },
        "关闭"
      ),
      width: 640
    },
    n.createElement(
      "div",
      { style: { marginBottom: 16 } },
      n.createElement(
        z,
        { type: "secondary", style: { fontSize: 12, display: "block", marginBottom: 8 } },
        "添加 GitHub 或 Gitee 仓库作为技能源，系统将从该仓库的指定目录获取技能列表。支持格式："
      ),
      n.createElement(
        "div",
        { style: { display: "flex", gap: 8, alignItems: "center" } },
        n.createElement(c, {
          placeholder: "https://github.com/owner/repo/tree/main/skills 或 https://gitee.com/owner/repo/tree/master/skills",
          value: N,
          onChange: (T) => D(T.target.value),
          onPressEnter: M,
          prefix: v ? n.createElement(v) : void 0,
          style: { flex: 1 }
        }),
        n.createElement(
          s,
          {
            type: "primary",
            icon: C ? n.createElement(C) : void 0,
            onClick: M
          },
          "添加"
        )
      ),
      // Gitee token input (shown when URL looks like a Gitee link)
      N.trim() && N.trim().toLowerCase().includes("gitee.com") ? n.createElement(
        "div",
        { style: { marginTop: 8, display: "flex", gap: 8, alignItems: "center" } },
        n.createElement(
          z,
          { type: "secondary", style: { fontSize: 12, whiteSpace: "nowrap" } },
          "Gitee Token:"
        ),
        n.createElement(c.Password, {
          placeholder: "私有仓库请填写 Gitee 私人令牌（可选）",
          value: G,
          onChange: (T) => B(T.target.value),
          style: { flex: 1 }
        })
      ) : null
    ),
    n.createElement(
      "div",
      { style: { marginBottom: 8, display: "flex", alignItems: "center", justifyContent: "space-between" } },
      n.createElement(z, { strong: !0 }, `已配置源 (${a.length})`)
    ),
    n.createElement(d, {
      size: "small",
      bordered: !0,
      dataSource: a,
      renderItem: (T) => n.createElement(
        d.Item,
        {
          actions: [
            n.createElement(
              h,
              { title: T.enabled ? "点击禁用" : "点击启用" },
              n.createElement(f, {
                size: "small",
                checked: T.enabled,
                onChange: (w) => A(T.id, w)
              })
            ),
            n.createElement(
              h,
              { title: "移除此源" },
              n.createElement(
                s,
                {
                  size: "small",
                  type: "text",
                  danger: !0,
                  icon: b ? n.createElement(b) : void 0,
                  onClick: () => K(T.id)
                }
              )
            )
          ]
        },
        n.createElement(
          "div",
          { style: { flex: 1, minWidth: 0 } },
          n.createElement(
            "div",
            { style: { display: "flex", alignItems: "center", gap: 6, marginBottom: 4 } },
            n.createElement(
              m,
              { color: T.platform === "gitee" ? "orange" : T.platform === "oss" ? "green" : "blue", style: { fontSize: 11 } },
              T.platform === "gitee" ? "Gitee" : T.platform === "oss" ? "OSS" : "GitHub"
            ),
            n.createElement(
              m,
              { style: { fontSize: 11 } },
              T.label
            ),
            T.skillsPath ? n.createElement(
              z,
              { type: "secondary", style: { fontSize: 11 } },
              `/${T.skillsPath}`
            ) : null,
            T.platform !== "oss" ? n.createElement(
              z,
              { type: "secondary", style: { fontSize: 11 } },
              `@${T.ref}`
            ) : null
          ),
          n.createElement(
            z,
            {
              type: "secondary",
              style: { fontSize: 11, wordBreak: "break-all" }
            },
            T.url
          ),
          // Gitee token input for existing Gitee sources
          T.platform === "gitee" ? n.createElement(
            "div",
            { style: { marginTop: 6, display: "flex", gap: 6, alignItems: "center" } },
            n.createElement(
              z,
              { type: "secondary", style: { fontSize: 11, whiteSpace: "nowrap" } },
              "Token:"
            ),
            n.createElement(c.Password, {
              size: "small",
              placeholder: "Gitee 私人令牌（可选，用于私有仓库）",
              value: T.accessToken || "",
              onChange: (w) => H(T.id, w.target.value),
              style: { flex: 1 }
            })
          ) : null
        )
      )
    })
  );
}
function Fn({
  open: e,
  onClose: t,
  sources: a,
  onChange: l,
  type: n
}) {
  const r = _().React, { useState: o } = r, {
    Modal: c,
    Input: s,
    Button: d,
    List: m,
    Tag: f,
    Switch: u,
    Typography: h,
    Tooltip: x,
    message: C
  } = _().antd, {
    PlusOutlined: b,
    DeleteOutlined: v,
    LinkOutlined: I,
    ApiOutlined: z,
    UserOutlined: N,
    ImportOutlined: D,
    ExportOutlined: G,
    CopyOutlined: B
  } = _().antdIcons || {}, { Text: M } = h, [A, H] = o(""), [K, T] = o(""), [w, E] = o(""), [$, k] = o(!1), q = n === "mcp" ? "MCP" : "专家模板", Z = n === "mcp" ? z ? r.createElement(z, { style: { fontSize: 18 } }) : null : N ? r.createElement(N, { style: { fontSize: 18 } }) : null, U = () => {
    const S = A.trim(), J = K.trim();
    if (!S) return;
    const le = J || S.slice(0, 40), X = `${n}:${S}`;
    if (a.some((R) => R.id === X)) {
      C.warning("该源已存在");
      return;
    }
    const ee = {
      id: X,
      label: le,
      url: S,
      enabled: !0,
      type: n
    }, fe = [...a, ee];
    n === "mcp" ? bt(fe) : wt(fe), l(fe), H(""), T(""), C.success(`已添加${q}源: ${le}`);
  }, P = (S, J) => {
    const le = a.map(
      (X) => X.id === S ? { ...X, enabled: J } : X
    );
    n === "mcp" ? bt(le) : wt(le), l(le);
  }, p = (S) => {
    const J = a.filter((le) => le.id !== S);
    n === "mcp" ? bt(J) : wt(J), l(J), C.success("已移除源");
  }, te = () => {
    const S = JSON.stringify(
      { type: n, sources: a },
      null,
      2
    );
    try {
      navigator.clipboard.writeText(S), C.success(`${q}源已复制到剪贴板（${a.length} 个源）`);
    } catch {
      const J = document.createElement("textarea");
      J.value = S, document.body.appendChild(J), J.select(), document.execCommand("copy"), document.body.removeChild(J), C.success(`${q}源已复制到剪贴板（${a.length} 个源）`);
    }
  }, W = () => {
    const S = w.trim();
    if (!S) {
      C.warning("请粘贴 JSON 内容");
      return;
    }
    try {
      const J = JSON.parse(S);
      let le = [];
      if (Array.isArray(J))
        le = J;
      else if (J && Array.isArray(J.sources))
        le = J.sources;
      else if (J && typeof J == "object")
        le = [J];
      else
        throw new Error("Invalid format");
      const X = le.filter(
        (re) => re && typeof re.url == "string" && typeof re.label == "string"
      );
      if (X.length === 0) {
        C.error("未找到有效的源数据");
        return;
      }
      const ee = new Set(a.map((re) => re.id)), fe = [];
      for (const re of X) {
        const pe = re.id || `${n}:${re.url}`;
        ee.has(pe) || fe.push({
          id: pe,
          label: re.label,
          url: re.url,
          enabled: re.enabled !== !1,
          type: n
        });
      }
      if (fe.length === 0) {
        C.info("所有源均已存在，无新增");
        return;
      }
      const R = [...a, ...fe];
      n === "mcp" ? bt(R) : wt(R), l(R), E(""), k(!1), C.success(`成功导入 ${fe.length} 个${q}源`);
    } catch (J) {
      C.error(`JSON 解析失败: ${J.message || "格式错误"}`);
    }
  };
  return r.createElement(
    c,
    {
      open: e,
      onCancel: t,
      title: r.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 8 } },
        Z,
        r.createElement("span", null, `配置${q}源`)
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
              icon: G ? r.createElement(G) : void 0,
              onClick: te,
              disabled: a.length === 0,
              size: "small"
            },
            "导出到剪贴板"
          ),
          r.createElement(
            d,
            {
              icon: D ? r.createElement(D) : void 0,
              onClick: () => k(!$),
              size: "small"
            },
            $ ? "隐藏导入" : "导入JSON"
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
      M,
      { type: "secondary", style: { fontSize: 12, display: "block", marginBottom: 12 } },
      `配置${q}源地址，支持从远程仓库或团队共享的 JSON 导入${q}配置。`
    ),
    // Import section (collapsible)
    $ ? r.createElement(
      "div",
      {
        style: {
          marginBottom: 16,
          padding: 12,
          background: "var(--ant-color-fill-quaternary, #fafafa)",
          borderRadius: 8,
          border: "1px solid var(--ant-color-border-secondary, #f0f0f0)"
        }
      },
      r.createElement(
        M,
        { strong: !0, style: { fontSize: 12, display: "block", marginBottom: 8 } },
        `粘贴${q}源 JSON（支持从导出的剪贴板内容粘贴）`
      ),
      r.createElement(s.TextArea, {
        placeholder: n === "mcp" ? `{
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
        value: w,
        onChange: (S) => E(S.target.value),
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
            onClick: W
          },
          "导入"
        ),
        r.createElement(
          d,
          {
            size: "small",
            onClick: () => E("")
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
        value: K,
        onChange: (S) => T(S.target.value),
        style: { width: 200 }
      }),
      r.createElement(s, {
        placeholder: n === "mcp" ? "https://raw.githubusercontent.com/team/mcp-registry/main/mcp.json" : "https://raw.githubusercontent.com/team/expert-registry/main/experts.json",
        value: A,
        onChange: (S) => H(S.target.value),
        onPressEnter: U,
        prefix: I ? r.createElement(I) : void 0,
        style: { flex: 1 }
      }),
      r.createElement(
        d,
        {
          type: "primary",
          icon: b ? r.createElement(b) : void 0,
          onClick: U
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
        M,
        { strong: !0 },
        `已配置源 (${a.length})`
      )
    ),
    r.createElement(m, {
      size: "small",
      bordered: !0,
      dataSource: a,
      renderItem: (S) => r.createElement(
        m.Item,
        {
          actions: [
            r.createElement(
              x,
              { title: S.enabled ? "点击禁用" : "点击启用" },
              r.createElement(u, {
                size: "small",
                checked: S.enabled,
                onChange: (J) => P(S.id, J)
              })
            ),
            r.createElement(
              x,
              { title: "移除此源" },
              r.createElement(
                d,
                {
                  size: "small",
                  type: "text",
                  danger: !0,
                  icon: v ? r.createElement(v) : void 0,
                  onClick: () => p(S.id)
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
                color: n === "mcp" ? "purple" : "blue",
                style: { fontSize: 11 }
              },
              S.label
            ),
            S.enabled ? null : r.createElement(
              f,
              { style: { fontSize: 10 } },
              "已禁用"
            )
          ),
          r.createElement(
            M,
            {
              type: "secondary",
              style: { fontSize: 11, wordBreak: "break-all" }
            },
            S.url
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
          background: "var(--ant-color-primary-bg, #e6f4ff)",
          borderRadius: 6,
          fontSize: 12,
          color: "var(--ant-color-primary, #1677ff)"
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
async function jr() {
  return ie("/market/providers");
}
async function Ur(e) {
  return ie(
    `/market/categories?lang=${encodeURIComponent(e)}`
  );
}
async function Nr(e, t, a, l, n) {
  return ie("/market/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: e,
      provider_pages: t,
      limit: a,
      lang: l,
      category: n || void 0
    })
  });
}
function Gn(e) {
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
async function Hn(e, t) {
  const a = { bundle_url: e };
  return t && (a.access_token = t), ie("/skills/pool/import", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(a)
  });
}
function Dr() {
  const e = _().React, { useState: t, useEffect: a, useCallback: l, useMemo: n, useRef: r } = e, {
    Spin: o,
    Empty: c,
    Input: s,
    Button: d,
    message: m,
    Row: f,
    Col: u,
    Card: h,
    Tag: x,
    Tooltip: C,
    Typography: b,
    Select: v,
    Drawer: I,
    Descriptions: z,
    Tabs: N,
    Badge: D,
    Progress: G,
    Modal: B,
    Alert: M
  } = _().antd, {
    ReloadOutlined: A,
    SearchOutlined: H,
    DownloadOutlined: K,
    AppstoreOutlined: T,
    ShopOutlined: w,
    CheckCircleOutlined: E,
    LoadingOutlined: $,
    UserOutlined: k,
    UserAddOutlined: q,
    SettingOutlined: Z,
    GithubOutlined: U,
    ApiOutlined: P
  } = _().antdIcons || {}, { Text: p, Paragraph: te, Title: W } = b, [S, J] = t("skills"), [le, X] = t([]), [ee, fe] = t([]), [R, re] = t([]), [pe, oe] = t(""), [ae, Ee] = t(""), [he, ke] = t(!1), [Ae, be] = t(!1), [Q, we] = t(
    {}
  ), [ye, V] = t(null), [de, ge] = t({}), [F, y] = t([]), [me, j] = t(""), [g, ne] = t(""), [ce, _e] = t(""), [Ce, Oe] = t({}), [Me, De] = t(""), [Fe, Le] = t(/* @__PURE__ */ new Set()), [Se, Re] = t(null), [Y, Ie] = t({}), [ze, Pe] = t([]), [He, We] = t([]), [Te, pt] = t([]), [Ot, lt] = t(""), [qe, gt] = t(!1), [Ta, an] = t(!1), [_a, ln] = t([]), [Ia, rn] = t(!1), [za, on] = t([]), [$a, sn] = t(!1), [cn, dn] = t([]), [mn, un] = t([]), [pn, gn] = t(!1), [Ye, fn] = t(""), [yn, En] = t([]), [hn, vn] = t([]), [bn, wn] = t(!1), [Qe, Sn] = t(""), [Mt, xn] = t(!1), [Ue, ft] = t(null), [rt, Aa] = t([]), ot = r(null);
  a(() => {
    Promise.all([
      jr().catch(() => []),
      Ur("zh").catch(() => []),
      At().catch(() => [])
    ]).then(([i, O, L]) => {
      X(i), fe(O), y(L), L.length > 0 && (j(L[0].id), De(L[0].id));
    });
  }, []);
  const yt = l(async (i) => {
    const O = i ?? zr();
    if (Pe(i || O), O.filter((ue) => ue.enabled).length === 0) {
      We([]);
      return;
    }
    gt(!0);
    try {
      const { skills: ue, errors: ve, categories: $e } = await Lr(O);
      if (We(ue), Aa($e), ve.length > 0) {
        for (const xe of ve)
          console.warn(`[ugsci] GitHub source '${xe.label}' error: ${xe.message}`);
        m.warning(
          `部分源加载失败: ${ve.map((xe) => xe.label).join(", ")}`
        );
      }
    } catch (ue) {
      m.error(ue.message || "加载技能源失败"), We([]);
    } finally {
      gt(!1);
    }
  }, []), Lt = l(async () => {
    var ue, ve, $e;
    gn(!0), wn(!0), gt(!0);
    const [i, O, L] = await Promise.allSettled([
      Rr(),
      Mr(),
      Or()
    ]);
    if (i.status === "fulfilled" ? (dn(i.value.servers), un(i.value.categories)) : (console.warn(`[ugsci] MCP manifest error: ${((ue = i.reason) == null ? void 0 : ue.message) || i.reason}`), dn([]), un([])), gn(!1), O.status === "fulfilled" ? (En(O.value.agents), vn(O.value.categories)) : (console.warn(`[ugsci] Agents manifest error: ${((ve = O.reason) == null ? void 0 : ve.message) || O.reason}`), En([]), vn([])), wn(!1), L.status === "fulfilled")
      pt(L.value.skills), lt("");
    else {
      const xe = (($e = L.reason) == null ? void 0 : $e.message) || String(L.reason);
      console.warn(`[ugsci] Skills manifest error: ${xe}`), pt([]), lt(xe);
    }
    gt(!1);
  }, []);
  a(() => {
    yt(), Lt(), ln(Tr()), on(_r());
  }, [yt, Lt]);
  const Et = l(
    async (i, O, L) => {
      ke(!0);
      try {
        const ue = await Nr(
          i,
          L,
          20,
          "zh",
          O || void 0
        );
        L === void 0 || Object.keys(L).length === 0 ? re(ue.results) : re((xe) => [...xe, ...ue.results]);
        const ve = Object.values(ue.by_provider || {}).some(
          (xe) => xe.has_more
        );
        be(ve);
        const $e = {};
        for (const [xe, Ke] of Object.entries(ue.by_provider || {}))
          $e[xe] = (L[xe] || 1) + 1;
        if (we($e), ue.errors.length > 0)
          for (const xe of ue.errors)
            console.warn(
              `[ugsci] Market provider '${xe.provider}' error: ${xe.message}`
            );
      } catch (ue) {
        m.error(ue.message || "搜索市场失败"), re([]);
      } finally {
        ke(!1);
      }
    },
    []
  );
  a(() => (ot.current && clearTimeout(ot.current), ot.current = setTimeout(() => {
    Et(pe, ae, {});
  }, 400), () => {
    ot.current && clearTimeout(ot.current);
  }), [pe, ae, Et]);
  const Pa = () => {
    Et(pe, ae, Q);
  }, kn = async (i) => {
    const O = `${i.source}:${i.slug}`;
    try {
      ge((ue) => ({ ...ue, [O]: "installing" }));
      const L = await Hn(i.source_url);
      L.installed && m.success(
        `技能「${L.name || i.name}」已安装到技能池，可在技能中心查看`
      ), ge((ue) => {
        const ve = { ...ue };
        return delete ve[O], ve;
      });
    } catch (L) {
      m.error(Gn(L) || "安装技能失败"), ge((ue) => {
        const ve = { ...ue };
        return delete ve[O], ve;
      });
    }
  }, Ra = (i) => {
    window.history.pushState({}, "", i), window.dispatchEvent(new PopStateEvent("popstate"));
  }, Oa = async (i) => {
    const O = `github:${i.sourceId}:${i.name}`, L = ze.find((ve) => ve.id === i.sourceId), ue = (L == null ? void 0 : L.accessToken) || void 0;
    try {
      ge(($e) => ({ ...$e, [O]: "installing" }));
      const ve = await Hn(i.source_url, ue);
      ve.installed && m.success(
        `技能「${ve.name || i.name}」已安装到技能池，可在技能中心查看`
      ), ge(($e) => {
        const xe = { ...$e };
        return delete xe[O], xe;
      });
    } catch (ve) {
      m.error(Gn(ve) || "安装技能失败"), ge(($e) => {
        const xe = { ...$e };
        return delete xe[O], xe;
      });
    }
  }, Xe = n(() => {
    const i = [], O = /* @__PURE__ */ new Set();
    for (const L of [...Te, ...He]) {
      const ue = L.source_url || `${L.sourceLabel}:${L.name}`;
      O.has(ue) || (O.add(ue), i.push(L));
    }
    return i;
  }, [Te, He]), Cn = n(() => {
    const i = [], O = /* @__PURE__ */ new Set();
    if (rt.length > 0)
      for (const L of rt)
        O.has(L.id) || (O.add(L.id), i.push(L));
    for (const L of Xe)
      L.tag && !O.has(L.tag) && (O.add(L.tag), i.push({ id: L.tag, label: L.tag }));
    for (const L of Xe)
      !L.isOfficial && L.sourceLabel && !O.has(L.sourceLabel) && (O.add(L.sourceLabel), i.push({ id: L.sourceLabel, label: L.sourceLabel }));
    return i;
  }, [Xe, rt]), Bt = n(() => {
    let i = Xe;
    if (ae) {
      const O = rt.find((L) => L.id === ae);
      O && O.tags ? i = i.filter(
        (L) => L.tag && O.tags.includes(L.tag) || L.sourceLabel === ae
      ) : i = i.filter(
        (L) => L.tag === ae || L.sourceLabel === ae
      );
    }
    if (pe.trim()) {
      const O = pe.toLowerCase();
      i = i.filter(
        (L) => {
          var ue;
          return L.name.toLowerCase().includes(O) || ((ue = L.description) == null ? void 0 : ue.toLowerCase().includes(O));
        }
      );
    }
    return i;
  }, [Xe, pe, ae, rt]), Tn = le.filter((i) => i.available), Ze = n(() => ae ? R.filter((i) => {
    const O = Tn.find((L) => L.key === i.source);
    return (O == null ? void 0 : O.label) === ae;
  }) : R, [R, ae, Tn]), Ma = e.createElement(
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
        prefix: H ? e.createElement(H) : void 0,
        value: pe,
        onChange: (i) => oe(i.target.value),
        allowClear: !0,
        style: { flex: 1, minWidth: 200, maxWidth: 400 }
      }),
      // Pool install info
      e.createElement(
        p,
        { type: "secondary", style: { fontSize: 12 } },
        "安装后进入技能池"
      ),
      // Configure skill source button
      e.createElement(
        d,
        {
          icon: U ? e.createElement(U) : void 0,
          onClick: () => an(!0),
          size: "small"
        },
        "配置技能源"
      )
    ),
    // Dynamic category filter tags (from OSS manifest tags + imported sources)
    Ot && Xe.length === 0 ? e.createElement(M, {
      type: "warning",
      showIcon: !0,
      message: "UGSci 官方 OSS 技能库加载失败",
      description: "请检查网络或后端 OSS 代理服务，然后点击右上角“刷新”重试。",
      style: { marginBottom: 12 }
    }) : null,
    Cn.length > 0 ? e.createElement(
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
        p,
        { type: "secondary", style: { fontSize: 12, marginRight: 4 } },
        "分类:"
      ),
      e.createElement(
        x,
        {
          style: {
            fontSize: 11,
            cursor: "pointer",
            borderRadius: 12
          },
          color: ae === "" ? "blue" : void 0,
          onClick: () => Ee("")
        },
        "全部"
      ),
      ...Cn.map((i) => {
        const O = He.some(
          (L) => !L.isOfficial && L.sourceLabel === i.id
        );
        return e.createElement(
          x,
          {
            key: i.id,
            style: {
              fontSize: 11,
              cursor: "pointer",
              borderRadius: 12
            },
            color: ae === i.id ? O ? "blue" : "geekblue" : void 0,
            icon: O && U ? e.createElement(U) : void 0,
            onClick: () => Ee(
              ae === i.id ? "" : i.id
            )
          },
          i.label
        );
      })
    ) : null,
    // GitHub skills section
    qe && Xe.length === 0 ? e.createElement(
      "div",
      { style: { textAlign: "center", padding: 40, marginBottom: 16 } },
      e.createElement(o, { size: "large" }, e.createElement("div", { style: { minHeight: 60, display: "flex", alignItems: "center", justifyContent: "center" } }, "正在加载技能..."))
    ) : Bt.length > 0 ? e.createElement(
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
        U ? e.createElement(U, {
          style: { fontSize: 14, color: "var(--ant-color-primary, #1677ff)" }
        }) : null,
        e.createElement(
          p,
          { strong: !0, style: { fontSize: 13 } },
          `技能市场 (${Bt.length})`
        )
      ),
      e.createElement(
        f,
        { gutter: [12, 12] },
        ...Bt.map((i) => {
          const O = `github:${i.sourceId}:${i.name}`, L = de[O];
          return e.createElement(
            u,
            { key: O, xs: 24, sm: 12, md: 8, lg: 6 },
            e.createElement(
              h,
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
                U ? e.createElement(U, {
                  style: { fontSize: 18, color: "var(--ant-color-text-secondary, #57606a)" }
                }) : e.createElement(
                  "span",
                  { style: { fontSize: 18 } },
                  "📦"
                ),
                e.createElement(
                  C,
                  { title: i.name },
                  e.createElement(
                    p,
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
                    i.name
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
                i.description || "暂无描述"
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
                  i.sourcePath || i.sourceLabel ? e.createElement(
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
                    P ? e.createElement(P, { style: { fontSize: 10 } }) : null,
                    i.sourcePath || i.sourceLabel
                  ) : null,
                  // Show tag as category badge
                  i.tag ? e.createElement(
                    x,
                    { color: "geekblue", style: { fontSize: 10 } },
                    i.tag
                  ) : null,
                  i.version ? e.createElement(
                    x,
                    { style: { fontSize: 10 } },
                    `v${i.version}`
                  ) : null
                ),
                L ? e.createElement(
                  d,
                  {
                    size: "small",
                    disabled: !0,
                    icon: $ ? e.createElement($) : void 0
                  },
                  "安装中"
                ) : e.createElement(
                  d,
                  {
                    type: "primary",
                    size: "small",
                    icon: K ? e.createElement(K) : void 0,
                    onClick: () => Oa(i)
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
    Ze.length > 0 || he ? e.createElement(
      "div",
      {
        style: {
          marginBottom: 10,
          display: "flex",
          alignItems: "center",
          gap: 6
        }
      },
      w ? e.createElement(w, {
        style: { fontSize: 14, color: "var(--ant-color-primary, #1677ff)" }
      }) : null,
      e.createElement(
        p,
        { strong: !0, style: { fontSize: 13 } },
        `技能市场${Ze.length > 0 ? ` (${Ze.length})` : ""}`
      )
    ) : null,
    // Results grid
    he && Ze.length === 0 ? e.createElement(
      "div",
      { style: { textAlign: "center", padding: 60 } },
      e.createElement(o, { size: "large" })
    ) : Ze.length === 0 ? e.createElement(c, {
      description: pe ? `未找到匹配「${pe}」的技能` : "输入关键词搜索技能市场",
      image: c.PRESENTED_IMAGE_SIMPLE
    }) : e.createElement(
      f,
      { gutter: [12, 12] },
      ...Ze.map((i) => {
        const O = `${i.source}:${i.slug}`, L = de[O];
        return e.createElement(
          u,
          { key: O, xs: 24, sm: 12, md: 8, lg: 6 },
          e.createElement(
            h,
            {
              hoverable: !0,
              size: "small",
              style: { height: "100%", cursor: "pointer" },
              onClick: () => V(i)
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
              i.icon_url ? e.createElement("img", {
                src: i.icon_url,
                alt: i.name,
                style: { width: 24, height: 24, borderRadius: 4 }
              }) : e.createElement(
                "span",
                { style: { fontSize: 18 } },
                "📦"
              ),
              e.createElement(
                C,
                { title: i.name },
                e.createElement(
                  p,
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
                  i.name
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
              i.description || "暂无描述"
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
                  x,
                  { color: "geekblue", style: { fontSize: 10 } },
                  i.source
                ),
                i.version ? e.createElement(
                  x,
                  { style: { fontSize: 10 } },
                  `v${i.version}`
                ) : null
              ),
              L ? e.createElement(
                d,
                {
                  size: "small",
                  disabled: !0,
                  icon: $ ? e.createElement($) : void 0
                },
                "安装中"
              ) : e.createElement(
                d,
                {
                  type: "primary",
                  size: "small",
                  icon: K ? e.createElement(K) : void 0,
                  onClick: (ue) => {
                    ue.stopPropagation(), kn(i);
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
        d,
        { onClick: Pa, loading: he },
        "加载更多"
      )
    ) : null,
    // Detail Drawer
    ye ? e.createElement(
      I,
      {
        title: e.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 8 } },
          ye.icon_url ? e.createElement("img", {
            src: ye.icon_url,
            alt: ye.name,
            style: { width: 28, height: 28, borderRadius: 4 }
          }) : e.createElement(
            "span",
            { style: { fontSize: 20 } },
            "📦"
          ),
          e.createElement("span", null, ye.name)
        ),
        open: !0,
        onClose: () => V(null),
        width: 480,
        extra: e.createElement(
          d,
          {
            type: "primary",
            icon: K ? e.createElement(K) : void 0,
            onClick: () => {
              kn(ye);
            }
          },
          "安装到技能池"
        )
      },
      e.createElement(
        z,
        { column: 1, bordered: !0, size: "small" },
        e.createElement(
          z.Item,
          { label: "来源" },
          ye.source
        ),
        e.createElement(
          z.Item,
          { label: "描述" },
          ye.description || "-"
        ),
        ye.version ? e.createElement(
          z.Item,
          { label: "版本" },
          ye.version
        ) : null,
        ye.author ? e.createElement(
          z.Item,
          { label: "作者" },
          ye.author
        ) : null,
        e.createElement(
          z.Item,
          { label: "来源链接" },
          e.createElement(
            "a",
            { href: ye.source_url, target: "_blank" },
            ye.source_url
          )
        )
      ),
      ye.stats ? e.createElement(
        "div",
        { style: { marginTop: 16 } },
        e.createElement(
          p,
          {
            strong: !0,
            style: { display: "block", marginBottom: 8 }
          },
          "统计"
        ),
        e.createElement(
          "div",
          { style: { display: "flex", gap: 12, flexWrap: "wrap" } },
          ...Object.entries(ye.stats).map(
            ([i, O]) => e.createElement(
              "div",
              { key: i, style: { textAlign: "center" } },
              e.createElement(
                "div",
                {
                  style: {
                    fontSize: 18,
                    fontWeight: 600,
                    color: "var(--ant-color-primary, #1677ff)"
                  }
                },
                String(O)
              ),
              e.createElement(
                p,
                { type: "secondary", style: { fontSize: 11 } },
                i
              )
            )
          )
        )
      ) : null
    ) : null
  ), jt = n(() => {
    let i = yn;
    if (Qe && (i = i.filter((O) => O.category === Qe)), g.trim()) {
      const O = g.toLowerCase();
      i = i.filter(
        (L) => L.name.toLowerCase().includes(O) || L.description.toLowerCase().includes(O) || L.tags.some((ue) => ue.toLowerCase().includes(O))
      );
    }
    return i;
  }, [yn, g, Qe]), La = async (i) => {
    if (!Mt) {
      xn(!0);
      try {
        let O = i.description;
        if (i.instructions)
          try {
            const ve = i.instructions.replace(/^\/+/, ""), $e = await _t(ve);
            $e.ok && (O = await $e.text());
          } catch {
          }
        let L = [];
        if (i.skills_manifest)
          try {
            const ve = i.skills_manifest.replace(/^\/+/, ""), $e = await _t(ve);
            if ($e.ok) {
              const xe = await $e.json();
              Array.isArray(xe) ? L = xe.map((Ke) => typeof Ke == "string" ? Ke : Ke.name).filter(Boolean) : xe.skills && (L = xe.skills.map((Ke) => typeof Ke == "string" ? Ke : Ke.name).filter(Boolean));
            }
          } catch {
          }
        const ue = await ie("/agents", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: i.name,
            description: i.description,
            skill_names: L
          })
        });
        await Tt(ue.id, "AGENTS.md", O), m.success(`专家「${i.name}」创建成功，已跳转至专家`), Ra("/ugsci-experts");
      } catch (O) {
        m.error(O.message || "创建专家失败");
      } finally {
        xn(!1);
      }
    }
  }, _n = l(async (i) => {
    if (i)
      try {
        const O = await Yt(i);
        Le(new Set(O.map((L) => L.key)));
      } catch {
        Le(/* @__PURE__ */ new Set());
      }
  }, []);
  a(() => {
    Me && _n(Me);
  }, [Me, _n]);
  const Ba = async (i) => {
    if (!Me) {
      m.warning("请先选择目标专家");
      return;
    }
    if (Sr(i)) {
      const O = Object.entries(i.env), L = {};
      for (const [ue] of O)
        L[ue] = "";
      Ie(L), Re(i);
      return;
    }
    await In(i, i.env || {});
  }, In = async (i, O) => {
    Oe((L) => ({ ...L, [i.id]: !0 }));
    try {
      const L = i.id;
      await Qt(Me, {
        client_key: L,
        client: {
          name: i.name,
          description: i.description,
          enabled: !0,
          transport: i.transport,
          url: i.url || "",
          command: i.command || "",
          args: i.args || [],
          env: O,
          cwd: i.cwd || "",
          headers: i.headers || {}
        }
      }), m.success(`MCP「${i.name}」已添加到当前专家`), Le((ue) => new Set(ue).add(L));
    } catch (L) {
      m.error(L.message || `添加 MCP「${i.name}」失败`);
    } finally {
      Oe((L) => ({ ...L, [i.id]: !1 }));
    }
  }, ja = async () => {
    if (!Se) return;
    const i = [];
    for (const [L, ue] of Object.entries(Y))
      if (!ue || !ue.trim()) {
        const ve = Nn[L];
        i.push((ve == null ? void 0 : ve.label) || L);
      }
    if (i.length > 0) {
      m.warning(`请填写以下配置项: ${i.join(", ")}`);
      return;
    }
    const O = Se;
    Re(null), Ie({}), await In(O, { ...Y });
  }, Ut = n(() => {
    let i = cn;
    if (Ye && (i = i.filter((O) => O.category === Ye)), ce.trim()) {
      const O = ce.toLowerCase();
      i = i.filter(
        (L) => L.name.toLowerCase().includes(O) || L.description.toLowerCase().includes(O) || L.tags.some((ue) => ue.toLowerCase().includes(O))
      );
    }
    return i.map(Cr);
  }, [cn, ce, Ye]), Ua = e.createElement(
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
        prefix: H ? e.createElement(H) : void 0,
        value: ce,
        onChange: (i) => _e(i.target.value),
        allowClear: !0,
        style: { maxWidth: 300 }
      }),
      e.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        e.createElement(
          p,
          { type: "secondary", style: { fontSize: 12, whiteSpace: "nowrap" } },
          "安装到："
        ),
        e.createElement(v, {
          value: Me,
          onChange: (i) => De(i),
          style: { minWidth: 180 },
          size: "small",
          options: F.map((i) => ({ value: i.id, label: i.name }))
        })
      ),
      // Configure MCP source button
      e.createElement(
        d,
        {
          icon: P ? e.createElement(P) : void 0,
          onClick: () => rn(!0),
          size: "small"
        },
        "配置 MCP 源"
      )
    ),
    // Dynamic category tag row (from OSS manifest tag_groups)
    mn.length > 0 ? e.createElement(
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
        p,
        { type: "secondary", style: { fontSize: 12, marginRight: 4 } },
        "分类:"
      ),
      e.createElement(
        x,
        {
          style: { fontSize: 11, cursor: "pointer", borderRadius: 12 },
          color: Ye === "" ? "blue" : void 0,
          onClick: () => fn("")
        },
        "全部"
      ),
      ...mn.map(
        (i) => e.createElement(
          x,
          {
            key: i.id,
            style: { fontSize: 11, cursor: "pointer", borderRadius: 12 },
            color: Ye === i.id ? "geekblue" : void 0,
            onClick: () => fn(
              Ye === i.id ? "" : i.id
            )
          },
          i.label
        )
      )
    ) : null,
    // MCP server cards (dynamic from OSS)
    pn && Ut.length === 0 ? e.createElement(
      "div",
      { style: { textAlign: "center", padding: 40 } },
      e.createElement(o, { size: "large" }, e.createElement("div", { style: { minHeight: 60, display: "flex", alignItems: "center", justifyContent: "center" } }, "正在加载 MCP 服务器..."))
    ) : Ut.length === 0 ? e.createElement(c, {
      description: "未找到匹配的 MCP 服务器",
      image: c.PRESENTED_IMAGE_SIMPLE
    }) : e.createElement(
      f,
      { gutter: [12, 12] },
      ...Ut.map(
        (i) => e.createElement(
          u,
          { key: i.id, xs: 24, sm: 12, md: 8 },
          e.createElement(
            h,
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
                i.iconUrl ? e.createElement("img", {
                  src: i.iconUrl,
                  alt: i.name,
                  style: { width: 28, height: 28, objectFit: "contain" },
                  onError: (O) => {
                    O.target.style.display = "none";
                  }
                }) : i.emoji
              ),
              e.createElement(
                "div",
                { style: { flex: 1 } },
                e.createElement(
                  p,
                  { strong: !0, style: { fontSize: 14 } },
                  i.name
                ),
                e.createElement(
                  "div",
                  { style: { display: "flex", gap: 4, marginTop: 4, flexWrap: "wrap" } },
                  e.createElement(
                    x,
                    { color: "blue", style: { fontSize: 10 } },
                    i.category
                  ),
                  e.createElement(
                    x,
                    {
                      color: i.transport === "stdio" ? "purple" : "cyan",
                      style: { fontSize: 10 }
                    },
                    i.transport
                  ),
                  i.env && Object.keys(i.env).length > 0 ? e.createElement(
                    x,
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
              i.description
            ),
            // Footer: config preview + install button
            e.createElement(
              "div",
              {
                style: {
                  marginTop: 10,
                  paddingTop: 8,
                  borderTop: "1px solid var(--ant-color-border-secondary, #f0f0f0)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center"
                }
              },
              e.createElement(
                p,
                { type: "secondary", style: { fontSize: 11 } },
                i.transport === "stdio" ? `${i.command} ${(i.args || []).join(" ")}` : i.url || ""
              ),
              Fe.has(i.id) ? e.createElement(
                d,
                { size: "small", disabled: !0 },
                "已安装"
              ) : e.createElement(
                d,
                {
                  type: "primary",
                  size: "small",
                  loading: !!Ce[i.id],
                  icon: P ? e.createElement(P) : void 0,
                  onClick: () => Ba(i)
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
      w ? e.createElement(w, {
        style: { fontSize: 24, color: "var(--ant-color-text-quaternary, #bfbfbf)", marginBottom: 8 }
      }) : null,
      e.createElement(
        p,
        { type: "secondary", style: { fontSize: 12 } },
        "MCP 服务器列表来自 UGSci 官方源，自动同步更新"
      )
    )
  ), Na = Se ? e.createElement(
    B,
    {
      title: e.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 8 } },
        e.createElement("span", { style: { fontSize: 20, display: "inline-flex", alignItems: "center", justifyContent: "center", width: 24, height: 24 } }, Se.iconUrl ? e.createElement("img", { src: Se.iconUrl, alt: Se.name, style: { width: 22, height: 22, objectFit: "contain" }, onError: (i) => {
          i.target.style.display = "none";
        } }) : Se.emoji),
        e.createElement("span", null, `配置 ${Se.name} 密钥`)
      ),
      open: !!Se,
      onCancel: () => {
        Re(null), Ie({});
      },
      onOk: ja,
      okText: "安装",
      cancelText: "取消",
      width: 520,
      destroyOnClose: !0
    },
    // Description
    e.createElement(
      p,
      { type: "secondary", style: { display: "block", marginBottom: 16, fontSize: 12 } },
      Se.description
    ),
    ...Object.entries(Se.env || {}).map(([i]) => {
      const O = Nn[i], L = (O == null ? void 0 : O.isSecret) !== !1;
      return e.createElement(
        "div",
        { key: i, style: { marginBottom: 16 } },
        e.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 6, marginBottom: 4 } },
          e.createElement(
            p,
            { strong: !0, style: { fontSize: 13 } },
            (O == null ? void 0 : O.label) || i
          ),
          e.createElement(
            x,
            { color: "orange", style: { fontSize: 10 } },
            "必填"
          )
        ),
        // Help text with optional link
        O ? e.createElement(
          "div",
          { style: { marginBottom: 6, fontSize: 12, color: "var(--ant-color-text-tertiary, #8c8c8c)" } },
          O.help,
          O.link ? e.createElement(
            "a",
            {
              href: O.link,
              target: "_blank",
              rel: "noopener noreferrer",
              style: { marginLeft: 4, fontSize: 12 }
            },
            "获取方式 ↗"
          ) : null
        ) : null,
        // Input field
        L ? e.createElement(s.Password, {
          placeholder: `请输入 ${(O == null ? void 0 : O.label) || i}`,
          value: Y[i] || "",
          onChange: (ue) => Ie((ve) => ({
            ...ve,
            [i]: ue.target.value
          })),
          style: { width: "100%" }
        }) : e.createElement(s, {
          placeholder: `请输入 ${(O == null ? void 0 : O.label) || i}`,
          value: Y[i] || "",
          onChange: (ue) => Ie((ve) => ({
            ...ve,
            [i]: ue.target.value
          })),
          style: { width: "100%" }
        }),
        // Show env key name for reference
        e.createElement(
          p,
          { type: "secondary", style: { fontSize: 11, display: "block", marginTop: 2 } },
          `环境变量名: ${i}`
        )
      );
    })
  ) : null, Da = e.createElement(
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
        prefix: H ? e.createElement(H) : void 0,
        value: g,
        onChange: (i) => ne(i.target.value),
        allowClear: !0,
        style: { maxWidth: 400, flex: 1, minWidth: 200 }
      }),
      e.createElement(
        d,
        {
          icon: k ? e.createElement(k) : void 0,
          onClick: () => sn(!0),
          size: "small"
        },
        "配置专家源"
      )
    ),
    // Dynamic category tag row (from OSS manifest tag_groups)
    hn.length > 0 ? e.createElement(
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
        p,
        { type: "secondary", style: { fontSize: 12, marginRight: 4 } },
        "分类:"
      ),
      e.createElement(
        x,
        {
          style: { fontSize: 11, cursor: "pointer", borderRadius: 12 },
          color: Qe === "" ? "blue" : void 0,
          onClick: () => Sn("")
        },
        "全部"
      ),
      ...hn.map(
        (i) => e.createElement(
          x,
          {
            key: i.id,
            style: { fontSize: 11, cursor: "pointer", borderRadius: 12 },
            color: Qe === i.id ? "geekblue" : void 0,
            onClick: () => Sn(
              Qe === i.id ? "" : i.id
            )
          },
          i.label
        )
      )
    ) : null,
    // Agent cards (dynamic from OSS)
    bn && jt.length === 0 ? e.createElement(
      "div",
      { style: { textAlign: "center", padding: 40 } },
      e.createElement(o, { size: "large" }, e.createElement("div", { style: { minHeight: 60, display: "flex", alignItems: "center", justifyContent: "center" } }, "正在加载人才市场..."))
    ) : jt.length === 0 ? e.createElement(c, {
      description: "未找到匹配的人才",
      image: c.PRESENTED_IMAGE_SIMPLE
    }) : e.createElement(
      f,
      { gutter: [12, 12] },
      ...jt.map(
        (i) => e.createElement(
          u,
          { key: i.id, xs: 24, sm: 12, md: 8 },
          e.createElement(
            h,
            {
              hoverable: !0,
              size: "small",
              style: { height: "100%", cursor: "pointer" },
              onClick: () => ft(i)
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
              e.createElement(Ge, {
                name: i.name,
                size: 40
              }),
              e.createElement(
                "div",
                { style: { flex: 1 } },
                e.createElement(
                  p,
                  { strong: !0, style: { fontSize: 14 } },
                  i.name
                ),
                e.createElement(
                  "div",
                  { style: { display: "flex", gap: 4, marginTop: 4, flexWrap: "wrap" } },
                  i.category ? e.createElement(
                    x,
                    { color: "blue", style: { fontSize: 10 } },
                    nt(i.category)
                  ) : null,
                  i.tags.includes("mcp") ? e.createElement(
                    x,
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
              i.description
            ),
            e.createElement(
              "div",
              {
                style: {
                  marginTop: 10,
                  paddingTop: 8,
                  borderTop: "1px solid var(--ant-color-border-secondary, #f0f0f0)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center"
                }
              },
              e.createElement(
                p,
                { type: "secondary", style: { fontSize: 11 } },
                i.tags.filter((O) => O !== "agent" && O !== "template" && O !== "workspace").slice(0, 3).join(" · ") || "人才模板"
              ),
              e.createElement(
                d,
                {
                  type: "primary",
                  size: "small",
                  icon: q ? e.createElement(q) : void 0
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
      w ? e.createElement(w, {
        style: { fontSize: 24, color: "var(--ant-color-text-quaternary, #bfbfbf)", marginBottom: 8 }
      }) : null,
      e.createElement(
        p,
        { type: "secondary", style: { fontSize: 12 } },
        "人才市场来自 UGSci 官方源，自动同步更新"
      )
    )
  ), Fa = [
    {
      key: "skills",
      label: e.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        T ? e.createElement(T, { style: { fontSize: 14 } }) : null,
        "技能市场"
      ),
      children: Ma
    },
    {
      key: "mcp",
      label: e.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        P ? e.createElement(P, { style: { fontSize: 14 } }) : null,
        "MCP 市场"
      ),
      children: Ua
    },
    {
      key: "experts",
      label: e.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        q ? e.createElement(q, { style: { fontSize: 14 } }) : null,
        "人才市场"
      ),
      children: Da
    }
  ];
  return e.createElement(
    "div",
    { style: { padding: 24 } },
    e.createElement($t, {
      title: "市场",
      subtitle: "浏览技能市场 · 选择 MCP 服务器 · 人才市场 · 随时更新能力和专家",
      extra: e.createElement(
        "div",
        { style: { display: "flex", gap: 8 } },
        e.createElement(
          d,
          {
            type: "primary",
            icon: A ? e.createElement(A) : void 0,
            onClick: () => {
              Et(pe, ae, {}), yt(), Lt();
            },
            loading: he || qe || pn || bn
          },
          "刷新"
        )
      )
    }),
    e.createElement(N, {
      items: Fa,
      activeKey: S,
      onChange: (i) => J(i)
    }),
    // Skill source config modal
    e.createElement(Br, {
      open: Ta,
      onClose: () => an(!1),
      sources: ze,
      onChange: (i) => {
        Pe(i), yt(i);
      }
    }),
    // MCP source config modal
    e.createElement(Fn, {
      open: Ia,
      onClose: () => rn(!1),
      sources: _a,
      onChange: (i) => ln(i),
      type: "mcp"
    }),
    // MCP token config modal (for templates requiring secrets)
    Na,
    // Expert source config modal
    e.createElement(Fn, {
      open: $a,
      onClose: () => sn(!1),
      sources: za,
      onChange: (i) => on(i),
      type: "expert"
    }),
    // ── Agent Detail Modal (click card to view details, then create) ──
    Ue ? e.createElement(
      B,
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
          e.createElement(Ge, {
            name: Ue.name,
            size: 40
          }),
          e.createElement(
            "div",
            null,
            e.createElement(
              p,
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
                x,
                { color: "blue", style: { fontSize: 10 } },
                nt(Ue.category)
              ) : null,
              ...Ue.tags.filter(
                (i) => i !== "agent" && i !== "template" && i !== "workspace"
              ).slice(0, 5).map(
                (i) => e.createElement(
                  x,
                  { key: i, style: { fontSize: 10 } },
                  i
                )
              )
            )
          )
        ),
        open: !0,
        onCancel: () => ft(null),
        width: 640,
        footer: e.createElement(
          "div",
          { style: { textAlign: "right" } },
          e.createElement(
            d,
            {
              onClick: () => ft(null),
              style: { marginRight: 8 }
            },
            "取消"
          ),
          e.createElement(
            d,
            {
              type: "primary",
              loading: Mt,
              disabled: Mt,
              icon: q ? e.createElement(q) : void 0,
              style: je,
              onClick: async () => {
                await La(Ue), ft(null);
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
          p,
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
            background: "var(--ant-color-success-bg, #f6ffed)",
            borderRadius: 8,
            border: "1px solid var(--ant-color-success-border, #b7eb8f)"
          }
        },
        e.createElement(
          p,
          { style: { fontSize: 12, color: "var(--ant-color-success, #52c41a)" } },
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
            background: "var(--ant-color-primary-bg, #e6f4ff)",
            borderRadius: 8,
            border: "1px solid var(--ant-color-primary-border, #91caff)"
          }
        },
        e.createElement(
          p,
          { style: { fontSize: 12, color: "var(--ant-color-primary, #1677ff)" } },
          "✓ 包含系统提示词，创建后将自动写入 AGENTS.md"
        )
      ) : null,
      // Drivers
      Ue.drivers && Object.keys(Ue.drivers).length > 0 ? e.createElement(
        "div",
        null,
        e.createElement(
          p,
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
            ([i, O]) => e.createElement(
              x,
              { key: i, color: "cyan", style: { fontSize: 11 } },
              `${i}${O && O.length > 0 ? ` (${O.join(", ")})` : ""}`
            )
          )
        )
      ) : null
    ) : null
  );
}
function Fr() {
  try {
    const t = localStorage.getItem("language") || "";
    if (t) return t.split("-")[0];
  } catch {
  }
  return ((typeof navigator < "u" ? navigator.language : "") || "").split("-")[0] || "en";
}
const Wn = {
  zh: "您好，UGSci 智能助手在线。无论是油气藏分析、数值模拟还是工程决策，描述您的场景，我来交付结果。",
  en: "UGSci AI assistant is online. From reservoir analysis to numerical simulation and engineering decisions — describe your scenario and I'll deliver results.",
  ja: "UGSci AIアシスタントがオンラインです。油層解析、数値シミュレーション、エンジニアリングの意思決定など、シナリオを描写してください。結果をお届けします。",
  ru: "UGSci AI-ассистент онлайн. От анализа пласта до численного моделирования и инженерных решений — опишите свой сценарий, и я предоставлю результат.",
  vi: "Trợ lý AI UGSci đang trực tuyến. Từ phân tích mỏ, mô phỏng số đến ra quyết định kỹ thuật — mô tả kịch bản của bạn, tôi sẽ giao kết quả.",
  id: "Asisten AI UGSci sedang online. Dari analisis reservoir, simulasi numerik hingga keputusan engineering — jelaskan skenario Anda, saya akan memberikan hasilnya."
}, Jn = {
  zh: { label: "能告诉我你都能做点什么吗？", value: "能告诉我你都能做点什么吗" },
  en: { label: "Can you tell me what you can do?", value: "Can you tell me what you can do?" },
  ja: { label: "あなたができることを教えてください", value: "あなたができることを教えてください" },
  ru: { label: "Расскажи, что ты умеешь делать?", value: "Расскажи, что ты умеешь делать?" },
  vi: { label: "Bạn có thể cho tôi biết bạn làm được gì không?", value: "Bạn có thể cho tôi biết bạn làm được gì không?" },
  id: { label: "Bisa cerita apa saja yang bisa Anda lakukan?", value: "Bisa cerita apa saja yang bisa Anda lakukan?" }
};
function Gr() {
  const e = _(), t = e.React, { useEffect: a, useRef: l } = t, n = e.useSelectedAgent ? e.useSelectedAgent() : { id: "default" }, r = (n == null ? void 0 : n.id) || "default", o = l(null), c = l(null);
  return a(() => {
    if (o.current === r) return;
    o.current = r, qt();
    const s = Fr(), d = Wn[s] || Wn.en, m = Jn[s] || Jn.en;
    let f = !1;
    return (async () => {
      var u, h;
      try {
        const x = await Pt(r);
        if (f) return;
        const C = Xn(x);
        if (c.current) {
          try {
            c.current();
          } catch {
          }
          c.current = null;
        }
        const b = window.QwenPaw;
        (u = b == null ? void 0 : b.chat) != null && u.welcome && (C.length > 0 ? (c.current = b.chat.welcome.set("ugsci", {
          description: d,
          prompts: C
        }), console.info(
          `[ugsci] Injected ${C.length} welcome prompts for agent "${r}"`
        )) : (c.current = b.chat.welcome.set("ugsci", {
          description: d,
          prompts: [m]
        }), console.info(
          `[ugsci] No skills for agent "${r}" — using default prompt`
        )));
      } catch (x) {
        console.warn(
          `[ugsci] Failed to inject welcome prompts for agent "${r}":`,
          x
        );
        const C = window.QwenPaw;
        if ((h = C == null ? void 0 : C.chat) != null && h.welcome && !f) {
          if (c.current) {
            try {
              c.current();
            } catch {
            }
            c.current = null;
          }
          c.current = C.chat.welcome.set("ugsci", {
            description: d,
            prompts: [m]
          });
        }
      }
    })(), () => {
      f = !0;
    };
  }, [r]), null;
}
function Hr(e) {
  const t = e.data;
  if (!t) return { resultText: "", status: "calling" };
  const a = t.status || "calling", l = t.content;
  if (!Array.isArray(l) || l.length === 0)
    return { resultText: "", status: a };
  if (l.length > 1) {
    const o = l[1], c = o == null ? void 0 : o.data, s = c == null ? void 0 : c.output;
    if (typeof s == "string") return { resultText: s, status: a };
    if (s != null) return { resultText: JSON.stringify(s, null, 2), status: a };
  }
  const n = l[0], r = n == null ? void 0 : n.data;
  if (r != null && r.output) {
    const o = r.output;
    return { resultText: typeof o == "string" ? o : JSON.stringify(o, null, 2), status: a };
  }
  return { resultText: "", status: a };
}
function Dt(e) {
  var d, m, f;
  const t = (d = window.QwenPaw) == null ? void 0 : d.host, a = t == null ? void 0 : t.React;
  if (!a) return null;
  const { resultText: l, status: n } = Hr(e), r = n === "in_progress" || n === "calling", o = n === "failed" || n === "error";
  let c = {};
  if (l)
    try {
      const u = JSON.parse(l);
      u && typeof u == "object" && (c = u, (m = u.tree) != null && m.root && (c.nodeCount = Sa(u.tree.root)));
    } catch {
    }
  const s = r ? "🎨 Generating UI Tree..." : o ? "🎨 UI Tree Error" : c.ok ? `🎨 UI Tree (${c.nodeCount ?? 0} nodes)` : "🎨 UI Tree";
  return a.createElement(
    "details",
    { open: r || o, style: { margin: "4px 0", border: "1px solid var(--ant-color-border, #d9d9d9)", borderRadius: 8, padding: "4px 8px", fontSize: 13 } },
    a.createElement(
      "summary",
      { style: { cursor: "pointer", display: "flex", alignItems: "center", gap: 6 } },
      a.createElement("span", null, "🎨"),
      a.createElement("span", null, s),
      c.ok ? a.createElement("span", { style: { fontSize: 11, color: "var(--ant-color-text-quaternary, #999)", marginLeft: "auto" } }, `ui_id: ${((f = c.ui_id) == null ? void 0 : f.slice(0, 16)) ?? ""}…`) : null
    ),
    o || c.ok === !1 ? a.createElement(
      "div",
      { style: { padding: "8px 12px", fontSize: 12 } },
      a.createElement("div", { style: { color: "var(--ant-color-error, #ff4d4f)", marginBottom: 4 } }, c.message || "Unknown error"),
      c.hint ? a.createElement("div", { style: { color: "var(--ant-color-text-quaternary, #999)" } }, `💡 ${c.hint}`) : null
    ) : c.ok ? a.createElement("div", { style: { padding: "8px 12px", fontSize: 12, color: "var(--ant-color-text-quaternary, #999)" } }, `UI tree rendered below (${c.nodeCount ?? 0} nodes, revision ${c.revision ?? 1})`) : a.createElement("pre", { style: { fontSize: 12, padding: "8px 12px", background: "var(--ant-color-fill-tertiary, rgba(0,0,0,0.03))", borderRadius: 8, overflow: "auto", maxHeight: 200 } }, l || "(waiting for result...)")
  );
}
function Sa(e) {
  if (!e || typeof e != "object") return 0;
  let t = 1;
  if (Array.isArray(e.children)) for (const a of e.children) t += Sa(a);
  return t;
}
const Wr = /* @__PURE__ */ new Set(["send_message"]);
function qn(e) {
  var a, l, n;
  let t;
  if (typeof e == "string") t = { type: e };
  else if (e && typeof e == "object") t = e;
  else return;
  if (!Wr.has(t.type)) {
    console.warn(`[ugsci.genui] Action '${t.type}' not allowed in phase-1`);
    return;
  }
  if (t.type === "send_message") {
    const r = ((a = t.payload) == null ? void 0 : a.content) || ((l = t.payload) == null ? void 0 : l.message) || "";
    if (!r) return;
    const o = window.QwenPaw;
    (n = o == null ? void 0 : o.chat) != null && n.sendMessage ? o.chat.sendMessage(r) : console.info("[ugsci.genui] sendMessage fallback:", r);
  }
}
const se = (e) => typeof e == "string" ? e : e != null ? String(e) : "", Ne = (e) => typeof e == "number" ? e : typeof e == "string" && Number(e) || 0, Ft = (e) => !!e, dt = (e) => Array.isArray(e) ? e : [], Kn = { xs: "12px", sm: "13px", base: "14px", lg: "16px" }, Be = {
  muted: "var(--ant-color-text-secondary, #8c8c8c)",
  default: "var(--ant-color-text, #000000d9)",
  primary: "var(--ant-color-primary, #1677ff)",
  success: "var(--ant-color-success, #52c41a)",
  warning: "var(--ant-color-warning, #faad14)",
  error: "var(--ant-color-error, #ff4d4f)"
};
function xa({ node: e }) {
  var c;
  const t = (c = window.QwenPaw) == null ? void 0 : c.host;
  if (!(t != null && t.React)) return null;
  const a = t.React, l = t.antd || {}, n = e.props || {}, r = e.children || [], o = () => r.map((s, d) => a.createElement(xa, { key: s.nodeId || d, node: s }));
  switch (e.kind) {
    case "Stack":
      return a.createElement("div", { style: { display: "flex", flexDirection: "column", gap: `${Ne(n.gap) || 12}px`, padding: n.padding ? `${Ne(n.padding)}px` : void 0 } }, o());
    case "Row":
      return a.createElement("div", { style: { display: "flex", flexDirection: "row", gap: `${Ne(n.gap) || 12}px` } }, o());
    case "Grid":
      return a.createElement("div", { style: { display: "grid", gridTemplateColumns: `repeat(${Math.min(Math.max(Ne(n.columns) || 2, 1), 6)}, 1fr)`, gap: `${Ne(n.gap) || 12}px` } }, o());
    case "Spacer":
      return a.createElement("div", { style: { height: `${Ne(n.size) || 16}px` } });
    case "Text":
      return a.createElement("div", { style: { fontSize: Kn[se(n.size)] || Kn.base, color: Be[se(n.color)] || Be.default, fontWeight: Ft(n.bold) ? "bold" : "normal", lineHeight: 1.6 } }, se(n.value));
    case "Heading": {
      const s = Math.min(Math.max(Ne(n.level) || 2, 1), 4), d = { 1: "24px", 2: "20px", 3: "18px", 4: "16px" };
      return a.createElement("div", { style: { fontSize: d[s], fontWeight: "bold", margin: "4px 0" } }, se(n.value));
    }
    case "Divider":
      return a.createElement(l.Divider || "hr", n.label ? { children: se(n.label) } : {});
    case "Badge":
      return a.createElement(l.Badge || "span", { count: se(n.value), status: "default" });
    case "Tag":
      return a.createElement(l.Tag || "span", { color: se(n.color) || "default", children: se(n.label) });
    case "Stat":
      return a.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 2 } }, a.createElement("span", { style: { fontSize: 12, color: Be.muted } }, se(n.label)), a.createElement("span", { style: { fontSize: 20, fontWeight: "bold" } }, se(n.value)), n.delta ? a.createElement("span", { style: { fontSize: 12, color: se(n.trend) === "up" ? Be.success : se(n.trend) === "down" ? Be.error : Be.muted } }, se(n.delta)) : null);
    case "Progress":
      return a.createElement(l.Progress || "div", { percent: Ne(n.value), size: "small" });
    case "Image":
      return a.createElement("div", null, a.createElement("img", { src: se(n.src), alt: se(n.alt), style: { maxWidth: "100%", borderRadius: Ft(n.rounded) ? "8px" : void 0, maxHeight: n.maxHeight ? `${Ne(n.maxHeight)}px` : void 0 } }), n.caption ? a.createElement("div", { style: { fontSize: 12, color: Be.muted } }, se(n.caption)) : null);
    case "Table": {
      const s = dt(n.headers).map((u) => se(u)), m = r.filter((u) => u.kind === "TableRow").map((u, h) => {
        const x = (u.children || []).filter((b) => b.kind === "TableCell"), C = { key: h };
        return s.forEach((b, v) => {
          var I, z;
          C[b] = (z = (I = x[v]) == null ? void 0 : I.props) != null && z.value ? se(x[v].props.value) : "";
        }), C;
      }), f = s.map((u) => ({ title: u, dataIndex: u, key: u }));
      return a.createElement(l.Table || "table", { dataSource: m, columns: f, size: Ft(n.compact) ? "small" : "middle", pagination: !1, style: { margin: "4px 0" } });
    }
    case "List": {
      const s = r.filter((d) => d.kind === "ListItem");
      return a.createElement(l.List || "ul", { size: "small", style: { margin: "4px 0" } }, s.map((d, m) => {
        var f, u;
        return a.createElement(((f = l.List) == null ? void 0 : f.Item) || "li", { key: m }, se((u = d.props) == null ? void 0 : u.value));
      }));
    }
    case "CodeBlock":
      return a.createElement("pre", { style: { padding: 12, background: "var(--ant-color-fill-tertiary, rgba(0,0,0,0.04))", borderRadius: 8, overflow: "auto", fontSize: 13, fontFamily: "monospace" } }, se(n.code));
    case "Markdown":
      return a.createElement(l.Typography || "div", { children: se(n.content || n.value) });
    case "Chart":
      return a.createElement(Jr, { props: n });
    case "Card":
      return a.createElement(l.Card || "div", { title: n.title ? se(n.title) : void 0, size: "small", style: { margin: "4px 0" } }, o());
    case "DataCard":
      return a.createElement(l.Card || "div", { size: "small", style: { margin: "4px 0" } }, a.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center" } }, a.createElement("div", null, a.createElement("div", { style: { fontSize: 12, color: Be.muted } }, se(n.title)), a.createElement("div", { style: { fontSize: 24, fontWeight: "bold" } }, se(n.value))), n.icon ? a.createElement("span", { style: { fontSize: 32 } }, se(n.icon)) : null));
    case "MetricCard":
      return a.createElement(l.Card || "div", { size: "small", style: { margin: "4px 0" } }, a.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center" } }, a.createElement("div", null, a.createElement("div", { style: { fontSize: 12, color: Be.muted } }, se(n.title)), a.createElement("div", { style: { fontSize: 24, fontWeight: "bold" } }, se(n.value)), n.delta ? a.createElement("span", { style: { fontSize: 12, color: se(n.trend) === "up" ? Be.success : se(n.trend) === "down" ? Be.error : Be.muted } }, `${se(n.delta)} ${n.period ? se(n.period) : ""}`.trim()) : null), n.icon ? a.createElement("span", { style: { fontSize: 32 } }, se(n.icon)) : null));
    case "AlertCard":
    case "Alert":
      return a.createElement(l.Alert || "div", { type: se(n.severity) === "success" ? "success" : se(n.severity) === "warning" ? "warning" : se(n.severity) === "error" ? "error" : "info", message: n.title ? se(n.title) : void 0, description: se(n.message), showIcon: !0, style: { margin: "4px 0" } });
    case "Callout":
      return a.createElement(l.Alert || "div", { type: se(n.variant) === "tip" ? "success" : se(n.variant) === "warning" ? "warning" : se(n.variant) === "important" ? "error" : "info", message: n.title ? se(n.title) : void 0, description: se(n.message), showIcon: !0 });
    case "Button":
      return a.createElement(l.Button || "button", { type: se(n.variant) === "primary" ? "primary" : "default", size: "small", children: se(n.label) || "Action", onClick: () => {
        n.action && typeof n.action == "object" ? qn(n.action) : n.actionId && qn(n.actionId);
      } });
    case "Input":
      return a.createElement(l.Input || "input", { placeholder: se(n.placeholder), value: se(n.value), disabled: !0, size: "small" });
    case "Select":
      return a.createElement(l.Select || "select", { placeholder: se(n.placeholder), value: se(n.value) || void 0, disabled: !0, size: "small", style: { width: "100%" } }, dt(n.options).map((s, d) => {
        var m;
        return a.createElement(((m = l.Select) == null ? void 0 : m.Option) || "option", { key: d, value: se(s) }, se(s));
      }));
    case "JsonDebug":
      return a.createElement("details", { style: { margin: "4px 0", fontSize: 12 } }, a.createElement("summary", null, se(n.label) || "Debug JSON"), a.createElement("pre", { style: { fontSize: 12, padding: 8, background: "var(--ant-color-fill-tertiary, rgba(0,0,0,0.04))", borderRadius: 4, overflow: "auto" } }, JSON.stringify(n.data ?? n, null, 2)));
    default:
      return a.createElement("div", { style: { padding: 8, border: "1px dashed var(--ant-color-border, #d9d9d9)", borderRadius: 8, fontSize: 12, color: Be.muted, fontFamily: "monospace" } }, `Unknown component: ${e.kind}`);
  }
}
const et = ["#1677ff", "#52c41a", "#faad14", "#ff4d4f", "#722ed1", "#13c2c2", "#eb2f96"];
function Jr({ props: e }) {
  var C, b;
  const t = (b = (C = window.QwenPaw) == null ? void 0 : C.host) == null ? void 0 : b.React;
  if (!t) return null;
  const a = se(e.chart) || "line", l = se(e.title), n = dt(e.categories).map((v) => se(v)), r = dt(e.series), o = Ne(e.height) || 200, c = e.showLegend !== !1, s = 400, d = r.map((v, I) => {
    const z = v, N = dt(z.values).map((D) => Ne(D));
    return { name: se(z.name) || `Series ${I + 1}`, values: N };
  });
  if (n.length === 0 || d.length === 0)
    return t.createElement("div", { style: { padding: 12, color: Be.muted, fontSize: 12 } }, "Chart: no data");
  if (a === "pie") {
    const v = d[0].values.reduce((B, M) => B + M, 0) || 1, I = s / 2, z = o / 2, N = Math.min(s, o) / 2 - 20;
    let D = -Math.PI / 2;
    const G = d[0].values.map((B, M) => {
      const A = B / v * 2 * Math.PI, H = I + N * Math.cos(D), K = z + N * Math.sin(D), T = I + N * Math.cos(D + A), w = z + N * Math.sin(D + A), E = A > Math.PI ? 1 : 0, $ = `M ${I} ${z} L ${H} ${K} A ${N} ${N} 0 ${E} 1 ${T} ${w} Z`;
      return D += A, { path: $, color: et[M % et.length], label: n[M] || `#${M + 1}`, val: B };
    });
    return t.createElement(
      "div",
      { style: { margin: "4px 0" } },
      l ? t.createElement("div", { style: { fontSize: 13, fontWeight: 600, marginBottom: 4 } }, l) : null,
      t.createElement(
        "svg",
        { width: s, height: o, style: { maxWidth: "100%" } },
        ...G.map((B, M) => t.createElement("path", { key: M, d: B.path, fill: B.color, stroke: "#fff", strokeWidth: 1 }))
      ),
      c ? t.createElement(
        "div",
        { style: { display: "flex", flexWrap: "wrap", gap: 8, marginTop: 4, fontSize: 11 } },
        ...G.map((B, M) => t.createElement(
          "span",
          { key: M, style: { display: "flex", alignItems: "center", gap: 4 } },
          t.createElement("span", { style: { display: "inline-block", width: 10, height: 10, borderRadius: 2, background: B.color } }),
          `${B.label}: ${B.val}`
        ))
      ) : null
    );
  }
  const m = Math.max(...d.flatMap((v) => v.values), 1), f = n.length > 0 ? (s - 40) / (n.length * d.length) - 2 : 0, u = n.length > 1 ? (s - 40) / (n.length - 1) : 0, h = (v) => o - 20 - v / m * (o - 40), x = (v) => 30 + v * u;
  return t.createElement(
    "div",
    { style: { margin: "4px 0" } },
    l ? t.createElement("div", { style: { fontSize: 13, fontWeight: 600, marginBottom: 4 } }, l) : null,
    t.createElement(
      "svg",
      { width: s, height: o, style: { maxWidth: "100%" } },
      ...[0, 0.25, 0.5, 0.75, 1].map((v, I) => {
        const z = o - 20 - v * (o - 40);
        return t.createElement("line", { key: `g${I}`, x1: 30, y1: z, x2: s - 10, y2: z, stroke: "var(--ant-color-border-secondary, #f0f0f0)", strokeWidth: 1 });
      }),
      ...n.map((v, I) => t.createElement("text", { key: `x${I}`, x: x(I), y: o - 6, fontSize: 10, fill: Be.muted, textAnchor: "middle" }, v.length > 6 ? v.slice(0, 6) + "…" : v)),
      ...d.map((v, I) => {
        const z = et[I % et.length];
        if (a === "bar")
          return v.values.map((G, B) => t.createElement("rect", {
            key: `b${I}-${B}`,
            x: x(B) + I * (f + 2) - f / 2,
            y: h(G),
            width: f,
            height: o - 20 - h(G),
            fill: z,
            rx: 2
          }));
        const N = v.values.map((G, B) => `${x(B)},${h(G)}`).join(" "), D = [t.createElement("polyline", { key: `l${I}`, points: N, fill: "none", stroke: z, strokeWidth: 2 })];
        if (a === "area") {
          const G = `${x(0)},${o - 20} ${N} ${x(v.values.length - 1)},${o - 20}`;
          D.unshift(t.createElement("polygon", { key: `a${I}`, points: G, fill: z, opacity: 0.15 }));
        }
        return D;
      })
    ),
    c ? t.createElement(
      "div",
      { style: { display: "flex", flexWrap: "wrap", gap: 8, marginTop: 4, fontSize: 11 } },
      ...d.map((v, I) => t.createElement(
        "span",
        { key: I, style: { display: "flex", alignItems: "center", gap: 4 } },
        t.createElement("span", { style: { display: "inline-block", width: 10, height: 10, borderRadius: 2, background: et[I % et.length] } }),
        v.name
      ))
    ) : null
  );
}
let xt = null;
function ka() {
  var t, a;
  if (xt) return xt;
  const e = (a = (t = window.QwenPaw) == null ? void 0 : t.host) == null ? void 0 : a.React;
  return e ? (xt = e.createContext(null), xt) : null;
}
function Ct(e, t) {
  return `${e}::${t}`;
}
function qr(e) {
  try {
    const t = JSON.parse(e);
    return t && typeof t == "object" && t.ok === !0 && t.kind === "genui" ? t : null;
  } catch {
    return null;
  }
}
const Kr = /* @__PURE__ */ new Set([
  "plugin_call_output",
  "function_call_output",
  "tool_call_output",
  "mcp_call_output",
  "component_call_output"
]);
function Ca(e) {
  if (!Array.isArray(e)) return [];
  const t = [];
  for (const a of e) {
    if (!a || typeof a != "object") continue;
    const l = a, n = l.type;
    if (!n || !Kr.has(n)) continue;
    const r = l.content;
    if (!Array.isArray(r) || r.length === 0) continue;
    const o = r[0];
    if (!o || typeof o != "object") continue;
    const c = o.data;
    if (!(!c || (c.name || "") !== "emit_ui_tree") && r.length > 1) {
      const d = r[1], m = d == null ? void 0 : d.data, f = m == null ? void 0 : m.output;
      if (typeof f == "string") {
        const u = qr(f);
        u && t.push(u);
      }
    }
  }
  return t;
}
function Vr({ children: e }) {
  var m, f;
  const t = (f = (m = window.QwenPaw) == null ? void 0 : m.host) == null ? void 0 : f.React;
  if (!t) return null;
  const [a, l] = t.useState({}), n = t.useCallback((u) => {
    const h = Ct(u.sessionId, u.uiId);
    l((x) => ({ ...x, [h]: u }));
  }, []), r = t.useCallback(
    (u, h) => a[Ct(u, h)],
    [a]
  ), o = t.useCallback((u) => {
    l((h) => {
      const x = {};
      for (const [C, b] of Object.entries(h))
        b.sessionId !== u && (x[C] = b);
      return x;
    });
  }, []), c = t.useCallback(
    (u, h) => {
      const x = Ca(h);
      for (const C of x)
        C.ui_id && C.tree && l((b) => ({
          ...b,
          [Ct(u, C.ui_id)]: {
            schemaVersion: "1",
            uiId: C.ui_id,
            revision: C.revision || 1,
            tree: C.tree,
            sessionId: u,
            updatedAt: Date.now()
          }
        }));
    },
    []
  ), s = t.useMemo(
    () => ({ snapshots: a, setSnapshot: n, getSnapshot: r, clearSession: o, hydrateFromMessages: c }),
    [a, n, r, o, c]
  ), d = ka();
  return d ? t.createElement(d.Provider, { value: s }, e) : null;
}
function Xr() {
  var l, n;
  const e = (n = (l = window.QwenPaw) == null ? void 0 : l.host) == null ? void 0 : n.React, t = ka();
  if (!e || !t) throw new Error("useGenUiStore: host React not available");
  const a = e.useContext(t);
  if (!a) throw new Error("useGenUiStore must be used within GenUiStoreProvider");
  return a;
}
function Yr({ data: e }) {
  var s, d;
  const t = (s = window.QwenPaw) == null ? void 0 : s.host, a = t == null ? void 0 : t.React;
  if (!a) return null;
  const l = Xr(), n = ((d = t.getCurrentSessionId) == null ? void 0 : d.call(t)) || "", r = e.output, o = Ca(r);
  a.useEffect(() => {
    o.length > 0 && n && l.hydrateFromMessages(n, r);
  }, [o, n]);
  const c = Object.values(l.snapshots).filter(
    (m) => m.sessionId === n
  );
  return c.length === 0 ? null : a.createElement(
    "div",
    { className: "qwenpaw-genui-inline", style: { marginTop: 8, marginBottom: 8 } },
    ...c.map(
      (m) => a.createElement(
        "div",
        {
          key: Ct(m.sessionId, m.uiId),
          className: "qwenpaw-genui-tree",
          style: { border: "1px solid var(--ant-color-border-secondary, #f0f0f0)", borderRadius: 12, padding: 16, marginBottom: 8, background: "var(--ant-color-bg-container, #fff)" }
        },
        a.createElement(xa, { node: m.tree.root })
      )
    )
  );
}
function Qr(e, t) {
  var l, n, r;
  const a = "ugsci";
  (l = e.chat) != null && l.toolRender && (e.chat.toolRender(a, "emit_ui_tree", Dt), e.chat.toolRender(a, "list_ui_components", Dt), e.chat.toolRender(a, "get_genui_guide", Dt), console.info("[ugsci.genui] Registered 3 tool card renderers")), (r = (n = e.chat) == null ? void 0 : n.response) != null && r.append && (e.chat.response.append(
    a,
    (o) => t.createElement(Vr, null, t.createElement(Yr, { data: o.data })),
    { id: "ugsci.genui.response-append", order: 50 }
  ), console.info("[ugsci.genui] Registered response.append slot"));
}
function Zr() {
  var s, d, m;
  const e = window.QwenPaw;
  if (!(e != null && e.menu) || !(e != null && e.route)) {
    console.warn(
      "[ugsci] QwenPaw.menu/route API not available — plugin disabled"
    );
    return;
  }
  const t = _().React, a = "ugsci";
  (d = (s = e.chat) == null ? void 0 : s.rightHeader) != null && d.add ? (e.chat.rightHeader.add(a, t.createElement(Gr), {
    id: "ugsci.welcome-injector",
    order: -1
    // render before other right-header items (invisible anyway)
  }), console.info("[ugsci] WelcomePromptsInjector registered via rightHeader")) : console.warn(
    "[ugsci] QP.chat.rightHeader.add not available — agent-specific welcome prompts disabled"
  );
  const l = _().antdIcons || {}, n = l.UserSwitchOutlined, r = l.ToolOutlined, o = l.ShopOutlined;
  e.route.add(a, {
    id: "ugsci.experts",
    path: "/ugsci-experts",
    component: lr
  }), e.menu.add(a, {
    id: "ugsci.experts",
    location: "primary.agentScoped",
    label: () => "专家·协作",
    icon: n ? t.createElement(n, { style: { fontSize: 16 } }) : void 0,
    route: "ugsci.experts",
    order: 5,
    visible: () => st()
  }), e.route.add(a, {
    id: "ugsci.tools-skills",
    path: "/ugsci-tools-skills",
    component: pa
  }), e.menu.add(a, {
    id: "ugsci.tools-skills",
    location: "primary.agentScoped",
    label: () => "工具·技能",
    icon: r ? t.createElement(r, { style: { fontSize: 16 } }) : void 0,
    route: "ugsci.tools-skills",
    order: 6,
    visible: () => st()
  }), e.route.add(a, {
    id: "ugsci.capabilities",
    path: "/ugsci-capabilities",
    component: br
  }), e.route.add(a, {
    id: "ugsci.skills-center",
    path: "/ugsci-skills",
    component: wr
  }), e.route.add(a, {
    id: "ugsci.market",
    path: "/ugsci-market",
    component: Dr
  }), e.menu.add(a, {
    id: "ugsci.market",
    location: "primary.agentScoped",
    label: () => "市场",
    icon: o ? t.createElement(o, { style: { fontSize: 16 } }) : void 0,
    route: "ugsci.market",
    order: 7,
    visible: () => st()
  }), (m = e.sidebar) != null && m.registerSimpleModeItems ? (e.sidebar.registerSimpleModeItems([
    "ugsci.experts",
    "ugsci.tools-skills",
    "ugsci.market"
  ]), console.info("[ugsci] Registered 3 items for simple-mode visibility")) : console.warn(
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
  for (const f of c) {
    try {
      const h = e.menu.snapshot("primary.agentScoped").find((x) => x.id === f);
      h && e.menu.replace(a, f, {
        ...h,
        visible: () => !st()
      });
    } catch {
    }
    try {
      const h = e.menu.snapshot("primary.settings").find((x) => x.id === f);
      h && e.menu.replace(a, f, {
        ...h,
        visible: () => !st()
      });
    } catch {
    }
  }
  try {
    Qr(e, t);
  } catch (f) {
    console.error("[ugsci] Failed to register GenUI frontend:", f);
  }
  console.info(
    "[ugsci] Plugin registered: unified Tools & Skills center + compatibility routes, simple-mode navigation active"
  );
}
function Jt() {
  try {
    Zr();
  } catch (e) {
    console.error("[ugsci] Failed to build plugin:", e), setTimeout(Jt, 500);
  }
}
var Vn;
if ((Vn = window.QwenPaw) != null && Vn.host)
  Jt();
else {
  const e = setInterval(() => {
    var t;
    (t = window.QwenPaw) != null && t.host && (clearInterval(e), Jt());
  }, 200);
  setTimeout(() => clearInterval(e), 1e4);
}
