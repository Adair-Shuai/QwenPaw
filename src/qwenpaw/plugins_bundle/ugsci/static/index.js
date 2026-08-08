function x() {
  var t;
  const e = (t = window.QwenPaw) == null ? void 0 : t.host;
  if (!e) throw new Error("[ugsci] QwenPaw.host not available");
  return e;
}
function Ia() {
  try {
    return x().getApiToken() || "";
  } catch {
    return "";
  }
}
function St(e) {
  return x().getApiUrl(e);
}
function za(e) {
  const t = Ia();
  return {
    "Content-Type": "application/json",
    ...t ? { Authorization: `Bearer ${t}` } : {},
    ...e
  };
}
function Aa(e) {
  const t = new Headers(e), l = {};
  return t.forEach((a, n) => {
    l[n] = a;
  }), l;
}
function Ge(e, t) {
  const l = x(), a = Aa(t == null ? void 0 : t.headers);
  return l.fetch ? l.fetch(e, { ...t, headers: a }) : fetch(l.getApiUrl(e), {
    ...t,
    headers: { ...za(), ...a }
  });
}
const ot = /* @__PURE__ */ new Map(), Pa = 15e3;
function $a(e) {
  return e ? e instanceof Headers ? e.get("X-Agent-Id") || e.get("x-agent-id") || "" : e["X-Agent-Id"] || e["x-agent-id"] || "" : "";
}
function Oa(e, t, l) {
  return `${e}:${t}:${l}`;
}
function st() {
  ot.clear();
}
function jt(e) {
  for (const [t, l] of ot)
    (e ? l.agentId === e : l.agentId) && ot.delete(t);
}
async function se(e, t) {
  const l = ((t == null ? void 0 : t.method) || "GET").toUpperCase(), { bypassCache: a, ...n } = t || {}, r = $a(
    n.headers
  ), o = Oa(l, e, r);
  if (l !== "GET" && (r ? jt(r) : st()), l === "GET" && !a) {
    const d = ot.get(o);
    if (d && Date.now() - d.ts < Pa)
      return d.data;
  }
  const c = await Ge(e, n);
  if (!c.ok) {
    const d = await c.text().catch(() => "");
    throw new Error(d || `HTTP ${c.status}`);
  }
  if (c.status === 204) return null;
  const i = await c.json();
  return l === "GET" && ot.set(o, {
    data: i,
    ts: Date.now(),
    agentId: r || void 0
  }), i;
}
const Le = {
  background: "#0072f5",
  color: "#fff",
  fontSize: 13,
  fontWeight: 600,
  border: "none",
  borderRadius: 8
};
function at() {
  try {
    return localStorage.getItem("qwenpaw_sidebar_mode") === "simple";
  } catch {
    return !1;
  }
}
function wt(e, t) {
  const l = x();
  return l.ReactMarkdown && l.remarkGfm ? t.createElement(
    l.ReactMarkdown,
    { remarkPlugins: [l.remarkGfm] },
    e
  ) : e.replace(/\*\*(.+?)\*\*/g, "$1").replace(/\*(.+?)\*/g, "$1").replace(/`(.+?)`/g, "$1").replace(/^#+\s*/gm, "").replace(/^[-*]\s+/gm, "• ");
}
function xt({
  title: e,
  subtitle: t,
  extra: l
}) {
  const a = x().React, { Space: n } = x().antd;
  return a.createElement(
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
    a.createElement(
      "div",
      null,
      a.createElement(
        "h2",
        { style: { margin: 0, fontSize: 20, fontWeight: 600 } },
        e
      ),
      t ? a.createElement(
        "div",
        { style: { marginTop: 4, fontSize: 13, color: "var(--ant-color-text-tertiary, #8c8c8c)" } },
        t
      ) : null
    ),
    l ? a.createElement(n, null, l) : null
  );
}
async function kt() {
  const e = await se("/agents");
  return (e == null ? void 0 : e.agents) || [];
}
async function Ut(e) {
  return se(
    `/agents/${encodeURIComponent(e)}`
  );
}
async function Ct(e) {
  return await se(
    `/agents/${encodeURIComponent(e)}/skills`
  ) || [];
}
async function Tt(e = !1) {
  return await se(`/skills/pool${e ? "?summary=true" : ""}`) || [];
}
async function Ra(e) {
  const t = await se(
    `/skills/pool/${encodeURIComponent(e)}/content`
  );
  return (t == null ? void 0 : t.content) || "";
}
async function Ma() {
  return await se(
    "/skills/workspaces"
  ) || [];
}
function Ze(e, t = "") {
  return `/agents/${encodeURIComponent(e)}/skills${t}`;
}
function Un(e) {
  var l;
  const t = [];
  for (const a of e) {
    if (a.enabled === !1) continue;
    const n = (l = a.description) == null ? void 0 : l.trim();
    if (!n) continue;
    const r = (a.name || n).length > 20 ? (a.name || n).substring(0, 18) + "…" : a.name || n;
    let o = n;
    if (o = o.replace(/\*\*(.+?)\*\*/g, "$1").replace(/\*(.+?)\*/g, "$1").replace(/`(.+?)`/g, "$1").replace(/^#+\s*/gm, "").trim(), /^(用于|帮助|提供|支持|实现|完成|分析|计算|生成|创建|检查)/.test(o) ? o = `请${o}` : /^(a |an |the )/i.test(o) ? o = `Help me with ${o}` : /[。？！.?!]$/.test(o) || (o = `帮我${o}`), o.length > 80 && (o = o.substring(0, 77) + "..."), t.push({ label: r, value: o }), t.length >= 4) break;
  }
  return t;
}
async function La(e) {
  return await se("/workspace/files", {
    headers: { "X-Agent-Id": e }
  }) || [];
}
async function vt(e, t, l) {
  return se(`/workspace/files/${encodeURIComponent(t)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify({ content: l })
  });
}
async function Ba(e, t, l, a) {
  return se("/workspace/prompt-files", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify({ filename: t, content: l, enable: a })
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
function Ua(e) {
  let t = e.trim();
  if (!t) throw new Error("请输入文件名");
  if (/[\\/]/.test(t)) throw new Error("文件名不能包含路径分隔符");
  if (/[<>:\"|?*\u0000-\u001f]/.test(t))
    throw new Error("文件名包含系统不支持的字符");
  if (/[ .]$/.test(t)) throw new Error("文件名不能以空格或句点结尾");
  t.toLowerCase().endsWith(".md") ? t = `${t.slice(0, -3)}.md` : t += ".md";
  const l = t.split(".", 1)[0].toUpperCase();
  if (!t.slice(0, -3)) throw new Error("文件名不能为空");
  if (ja.has(l))
    throw new Error("该文件名是系统保留名称，请更换");
  if (new TextEncoder().encode(t).length > 255)
    throw new Error("文件名过长");
  return t;
}
async function Na(e, t) {
  const l = await Ut(e);
  l.system_prompt_files = t, await se(`/agents/${encodeURIComponent(e)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(l)
  });
}
async function Nt(e, t) {
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
async function Nn(e, t) {
  await se(
    Ze(e, `/${encodeURIComponent(t)}/enable`),
    {
      method: "POST"
    }
  );
}
async function Dt(e, t) {
  await se(Ze(e, `/${encodeURIComponent(t)}`), {
    method: "DELETE"
  });
}
async function Da(e, t) {
  return se(Ze(e, "/batch-enable"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(t)
  });
}
async function Fa(e, t) {
  return se(Ze(e, "/batch-disable"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(t)
  });
}
async function Ga(e, t) {
  return se(Ze(e, "/batch-delete"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(t)
  });
}
async function Ft(e) {
  return await se("/mcp", {
    headers: { "X-Agent-Id": e }
  }) || [];
}
async function Dn(e, t) {
  await se(`/mcp/${encodeURIComponent(t)}`, {
    method: "DELETE",
    headers: { "X-Agent-Id": e }
  });
}
async function Gt(e, t) {
  return se("/mcp", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify(t)
  });
}
async function Ha(e, t) {
  return se(
    `/mcp/toggle/${encodeURIComponent(t)}`,
    {
      method: "PATCH",
      headers: { "X-Agent-Id": e }
    }
  );
}
async function Fn(e, t) {
  await se(
    Ze(e, `/${encodeURIComponent(t)}/disable`),
    {
      method: "POST"
    }
  );
}
async function Wa(e) {
  await se(`/skills/pool/${encodeURIComponent(e)}`, {
    method: "DELETE"
  });
}
function Ja(e) {
  const t = (e || "").trim();
  if (!t) return { number: 6, unit: "h" };
  const l = t.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/i);
  if (!l) return { number: 6, unit: "h" };
  const a = parseInt(l[1] || "0", 10), n = parseInt(l[2] || "0", 10), r = parseInt(l[3] || "0", 10), o = a * 60 + n + Math.round(r / 60);
  return o <= 0 ? { number: 6, unit: "h" } : o >= 60 && o % 60 === 0 ? { number: o / 60, unit: "h" } : { number: o, unit: "m" };
}
function Ka(e) {
  return e.unit === "h" ? `${e.number}h` : `${e.number}m`;
}
async function qa(e) {
  return se("/config/heartbeat", {
    headers: { "X-Agent-Id": e }
  });
}
async function Xa(e, t) {
  return se("/config/heartbeat", {
    method: "PUT",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify(t)
  });
}
async function Va(e) {
  await se("/config/heartbeat/run", {
    method: "POST",
    headers: { "X-Agent-Id": e }
  });
}
async function Ya(e) {
  return se("/workspace/running-config", {
    headers: { "X-Agent-Id": e }
  });
}
async function Qa(e, t) {
  return se("/workspace/running-config", {
    method: "PUT",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify(t)
  });
}
async function Za(e) {
  return (await se("/workspace/language", {
    headers: { "X-Agent-Id": e }
  })).language || "zh";
}
async function el(e, t) {
  await se("/workspace/language", {
    method: "PUT",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify({ language: t })
  });
}
async function tl() {
  return (await se("/config/user-timezone")).timezone || "UTC";
}
async function nl(e) {
  await se("/config/user-timezone", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ timezone: e })
  });
}
async function al(e) {
  return await se("/workspace/system-prompt-files", {
    headers: { "X-Agent-Id": e }
  }) || [];
}
const bn = ["AGENTS.md", "SOUL.md", "PROFILE.md"];
function Sn({
  items: e,
  max: t = 5,
  color: l = "blue",
  emptyText: a = "无"
}) {
  const n = x().React, { Tag: r } = x().antd;
  return !e || e.length === 0 ? n.createElement(
    "span",
    { style: { fontSize: 12, color: "var(--ant-color-text-quaternary, #bfbfbf)" } },
    a
  ) : n.createElement(
    "div",
    { style: { display: "flex", flexWrap: "wrap", gap: 4 } },
    ...e.slice(0, t).map(
      (o, c) => n.createElement(
        r,
        { key: c, color: l, style: { fontSize: 11, marginRight: 0 } },
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
function Gn({
  open: e,
  onClose: t,
  poolSkills: l,
  installedSkillNames: a,
  loading: n,
  onInstall: r
}) {
  const o = x().React, { useState: c, useEffect: i, useMemo: d } = o, { Modal: u, Button: b, Empty: y, Spin: S, Input: C, Tag: $, Tooltip: w, Typography: z } = x().antd, { CheckOutlined: j, SearchOutlined: R } = x().antdIcons || {}, { Text: W } = z, [G, J] = c([]), [K, B] = c("");
  i(() => {
    e && (J([]), B(""));
  }, [e]);
  const P = d(() => {
    if (!K.trim()) return l;
    const E = K.toLowerCase();
    return l.filter(
      (f) => {
        var T, v;
        return f.name.toLowerCase().includes(E) || ((T = f.description) == null ? void 0 : T.toLowerCase().includes(E)) || ((v = f.tags) == null ? void 0 : v.some((H) => H.toLowerCase().includes(E)));
      }
    );
  }, [l, K]), F = P.filter(
    (E) => !a.includes(E.name)
  ), X = (E) => {
    J(
      (f) => f.includes(E) ? f.filter((T) => T !== E) : [...f, E]
    );
  }, k = async () => {
    G.length !== 0 && (await r(G), J([]));
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
          W,
          { type: "secondary", style: { fontSize: 13 } },
          `已选择 ${G.length} 个技能`
        ),
        o.createElement(
          "div",
          { style: { display: "flex", gap: 8 } },
          o.createElement(b, { onClick: t }, "取消"),
          o.createElement(
            b,
            {
              type: "primary",
              onClick: k,
              disabled: G.length === 0
            },
            G.length > 0 ? `添加 (${G.length})` : "添加"
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
      o.createElement(C, {
        placeholder: "搜索技能名称、描述或标签...",
        prefix: R ? o.createElement(R) : void 0,
        value: K,
        onChange: (E) => B(E.target.value),
        allowClear: !0,
        style: { flex: 1 }
      }),
      o.createElement(
        b,
        {
          size: "small",
          type: "primary",
          onClick: () => J(F.map((E) => E.name))
        },
        "全选"
      ),
      o.createElement(
        b,
        {
          size: "small",
          onClick: () => J([])
        },
        "清空"
      )
    ),
    // Skill grid (card style matching Skill Center)
    n ? o.createElement(
      "div",
      { style: { textAlign: "center", padding: 40 } },
      o.createElement(S, { size: "large" })
    ) : P.length === 0 ? o.createElement(y, {
      description: K ? "未找到匹配的技能" : "技能池暂无可用技能",
      image: y.PRESENTED_IMAGE_SIMPLE
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
      ...P.map((E) => {
        const f = G.includes(E.name), T = a.includes(E.name);
        return o.createElement(
          "div",
          {
            key: E.name,
            onClick: () => !T && X(E.name),
            style: {
              position: "relative",
              padding: "10px 12px",
              border: `1px solid ${f ? "#0072f5" : "var(--ant-color-border-secondary, #e8e8e8)"}`,
              borderRadius: 6,
              cursor: T ? "not-allowed" : "pointer",
              transition: "all 0.15s ease",
              background: f ? "rgba(0, 114, 245, 0.06)" : T ? "var(--ant-color-fill-quaternary, #fafafa)" : "var(--ant-color-bg-container, #fff)",
              opacity: T ? 0.5 : 1,
              minHeight: 64
            }
          },
          f ? o.createElement(
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
            j ? o.createElement(j) : "✓"
          ) : null,
          T ? o.createElement(
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
                paddingRight: T || f ? 24 : 0
              }
            },
            o.createElement(
              "span",
              { style: { fontSize: 16 } },
              E.emoji || "⚡"
            ),
            o.createElement(
              w,
              { title: E.name },
              o.createElement(
                W,
                {
                  strong: !0,
                  style: {
                    fontSize: 13,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap"
                  }
                },
                E.name
              )
            )
          ),
          E.description ? o.createElement(
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
            E.description
          ) : null,
          E.tags && E.tags.length > 0 ? o.createElement(
            "div",
            {
              style: {
                marginTop: 4,
                display: "flex",
                gap: 2,
                flexWrap: "wrap"
              }
            },
            ...E.tags.slice(0, 2).map(
              (v, H) => o.createElement(
                $,
                {
                  key: H,
                  color: "cyan",
                  style: { fontSize: 10, marginRight: 0 }
                },
                v
              )
            )
          ) : null
        );
      })
    )
  );
}
function Hn({
  agentId: e,
  systemPromptFiles: t,
  onRefresh: l
}) {
  const a = x().React, { useState: n, useEffect: r, useCallback: o, useRef: c } = a, {
    List: i,
    Tag: d,
    Switch: u,
    Button: b,
    Modal: y,
    Input: S,
    Spin: C,
    Empty: $,
    message: w,
    Typography: z,
    Segmented: j,
    Alert: R
  } = x().antd, { FileTextOutlined: W, PlusOutlined: G, EditOutlined: J, ReloadOutlined: K } = x().antdIcons || {}, { Text: B } = z, [P, F] = n([]), [X, k] = n(!0), [E, f] = n(
    t || []
  ), [T, v] = n(!1), [H, Z] = n(null), [L, _] = n(""), [m, te] = n(""), [N, h] = n(!1), [D, le] = n("source"), V = c(0), ee = o(async () => {
    const oe = ++V.current;
    k(!0);
    try {
      const ae = await La(e);
      oe === V.current && F(ae);
    } catch (ae) {
      oe === V.current && (w.error(ae.message || "加载工作区文档失败"), F([]));
    } finally {
      oe === V.current && k(!1);
    }
  }, [e]);
  r(() => {
    ee();
  }, [ee]), r(() => {
    f(t || []);
  }, [t]);
  const ge = async (oe, ae) => {
    const ye = new Set(E);
    if (ae)
      ye.add(oe);
    else {
      if (bn.includes(oe) && oe === "AGENTS.md") {
        w.warning("AGENTS.md 是核心文件，不能停用");
        return;
      }
      ye.delete(oe);
    }
    const Ee = Array.from(ye);
    f(Ee);
    try {
      await Na(e, Ee), w.success(ae ? "已启用记忆文件" : "已停用记忆文件"), l();
    } catch (xe) {
      w.error(xe.message || "更新失败"), f(t || []);
    }
  }, I = async (oe) => {
    try {
      const ae = await se(
        `/workspace/files/${encodeURIComponent(oe)}`,
        { headers: { "X-Agent-Id": e } }
      );
      Z(oe), _(ae.content || ""), le("source"), v(!0);
    } catch (ae) {
      w.error(ae.message || "读取文件失败");
    }
  }, re = () => {
    Z(null), _(""), te(""), le("source"), v(!0);
  }, ue = async () => {
    let oe;
    try {
      oe = Ua(H || m);
    } catch (ae) {
      w.warning(ae.message || "文件名无效");
      return;
    }
    if (!L.trim()) {
      w.warning("Markdown 文档不能为空");
      return;
    }
    if (new TextEncoder().encode(L).length > 1024 * 1024) {
      w.warning("Markdown 文档不能超过 1 MB");
      return;
    }
    h(!0);
    try {
      if (H)
        await vt(e, oe, L);
      else {
        const ae = await Ba(
          e,
          oe,
          L,
          !0
        );
        f(ae.system_prompt_files);
      }
      w.success("保存成功"), v(!1), ee(), l();
    } catch (ae) {
      const ye = ae != null && ae.message ? `：${ae.message}` : "";
      w.error(
        H ? (ae == null ? void 0 : ae.message) || "保存失败" : `创建并挂载失败，服务端已回滚文件${ye}`
      );
    } finally {
      h(!1);
    }
  };
  return X ? a.createElement(
    "div",
    { style: { textAlign: "center", padding: 40 } },
    a.createElement(C, { size: "large" })
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
        "div",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        W ? a.createElement(W, {
          style: { fontSize: 14, color: "#1677ff" }
        }) : null,
        a.createElement(
          B,
          { strong: !0 },
          `工作区文档 (${P.length})`
        ),
        a.createElement(
          B,
          { type: "secondary", style: { fontSize: 12 } },
          `· ${E.length} 个已挂载到系统提示`
        )
      ),
      a.createElement(
        "div",
        { style: { display: "flex", gap: 8 } },
        a.createElement(
          b,
          {
            size: "small",
            icon: K ? a.createElement(K) : void 0,
            onClick: ee
          },
          "刷新"
        ),
        a.createElement(
          b,
          {
            type: "primary",
            size: "small",
            icon: G ? a.createElement(G) : void 0,
            onClick: re
          },
          "新建 Markdown 文档"
        )
      )
    ),
    P.length === 0 ? a.createElement($, {
      description: "暂无 Markdown 文档，点击「新建 Markdown 文档」添加",
      image: $.PRESENTED_IMAGE_SIMPLE
    }) : a.createElement(i, {
      dataSource: P,
      renderItem: (oe) => {
        const ae = E.includes(oe.filename), ye = bn.includes(oe.filename);
        return a.createElement(
          i.Item,
          {
            actions: [
              a.createElement(
                b,
                {
                  type: "link",
                  size: "small",
                  icon: J ? a.createElement(J) : void 0,
                  onClick: () => I(oe.filename)
                },
                "编辑"
              )
            ]
          },
          a.createElement(i.Item.Meta, {
            avatar: a.createElement(W, {
              style: {
                fontSize: 20,
                color: ae ? "#1677ff" : "var(--ant-color-text-quaternary, #bfbfbf)"
              }
            }),
            title: a.createElement(
              "div",
              {
                style: {
                  display: "flex",
                  alignItems: "center",
                  gap: 6
                }
              },
              a.createElement(B, null, oe.filename),
              ye ? a.createElement(
                d,
                { color: "default", style: { fontSize: 10 } },
                "内置"
              ) : a.createElement(
                d,
                { color: "cyan", style: { fontSize: 10 } },
                "工作文档"
              )
            ),
            description: a.createElement(
              "div",
              { style: { fontSize: 12 } },
              `${(oe.size / 1024).toFixed(1)} KB · 修改于 ${new Date(oe.modified_time).toLocaleString()}`
            )
          }),
          a.createElement(u, {
            checked: ae,
            size: "small",
            onChange: (Ee) => ge(oe.filename, Ee)
          })
        );
      }
    }),
    // Edit/New file modal
    a.createElement(
      y,
      {
        open: T,
        onCancel: () => v(!1),
        title: H ? `编辑 ${H}` : "新建 Markdown 文档",
        width: 700,
        onOk: ue,
        confirmLoading: N,
        okText: "保存"
      },
      H ? null : a.createElement(
        "div",
        { style: { marginBottom: 12 } },
        a.createElement(S, {
          placeholder: "文件名（如：油藏工程记忆库.md）",
          value: m,
          onChange: (oe) => te(oe.target.value),
          addonAfter: m.endsWith(".md") ? "" : ".md"
        })
      ),
      a.createElement(
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
        a.createElement(j, {
          size: "small",
          value: D,
          options: [
            { label: "源码", value: "source" },
            { label: "预览", value: "preview" }
          ],
          onChange: (oe) => le(oe)
        }),
        a.createElement(
          B,
          { type: "secondary", style: { fontSize: 12 } },
          `${L.length} 字符 · 约 ${Math.ceil(L.length / 4)} tokens · ${H && E.includes(H) ? "已挂载" : H ? "未挂载" : "保存后自动挂载"}`
        )
      ),
      L.trim() ? null : a.createElement(R, {
        type: "warning",
        showIcon: !0,
        message: "文档内容为空，保存前需要填写 Markdown 内容",
        style: { marginBottom: 10 }
      }),
      D === "source" ? a.createElement(S.TextArea, {
        value: L,
        onChange: (oe) => _(oe.target.value),
        rows: 14,
        placeholder: `输入 Markdown 内容...

例如：
# 某区块油藏基础参数

- 地层压力: 25 MPa
- 地层温度: 85°C
- 原油密度: 0.85 g/cm³`,
        style: { fontFamily: "monospace", fontSize: 13 }
      }) : a.createElement(
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
        wt(L, a)
      )
    )
  );
}
function ll({
  skills: e,
  agentId: t
}) {
  const l = x().React, { useMemo: a } = l, {
    List: n,
    Tag: r,
    Typography: o,
    Empty: c,
    Button: i,
    message: d
  } = x().antd, { ThunderboltOutlined: u, CopyOutlined: b } = x().antdIcons || {}, { Text: y } = o, S = a(() => Un(e), [e]), C = (w) => {
    try {
      const z = x();
      z.setSelectedAgent && z.setSelectedAgent(t);
    } catch {
    }
    try {
      sessionStorage.setItem("ugsci_pending_prompt", w.value);
    } catch {
    }
    window.history.pushState({}, "", "/chat"), window.dispatchEvent(new PopStateEvent("popstate"));
  }, $ = (w) => {
    var z;
    (z = navigator.clipboard) == null || z.writeText(w.value).then(() => {
      d.success("已复制到剪贴板");
    });
  };
  return S.length === 0 ? l.createElement(c, {
    description: "暂无推荐提问，请先为专家添加技能",
    image: c.PRESENTED_IMAGE_SIMPLE
  }) : l.createElement(
    "div",
    null,
    l.createElement(
      "div",
      {
        style: {
          display: "flex",
          alignItems: "center",
          gap: 6,
          marginBottom: 12
        }
      },
      u ? l.createElement(u, {
        style: { fontSize: 14, color: "#1677ff" }
      }) : null,
      l.createElement(
        y,
        { strong: !0 },
        `推荐提问 (${S.length})`
      ),
      l.createElement(
        y,
        { type: "secondary", style: { fontSize: 12 } },
        "· 从技能描述中自动提取"
      )
    ),
    l.createElement(n, {
      dataSource: S,
      renderItem: (w, z) => l.createElement(
        n.Item,
        {
          actions: [
            l.createElement(
              i,
              {
                type: "link",
                size: "small",
                icon: b ? l.createElement(b) : void 0,
                onClick: () => $(w)
              },
              "复制"
            )
          ]
        },
        l.createElement(n.Item.Meta, {
          avatar: l.createElement(
            r,
            { color: "blue", style: { borderRadius: "50%" } },
            `${z + 1}`
          ),
          title: l.createElement(
            "div",
            {
              style: {
                cursor: "pointer",
                color: "#1677ff"
              },
              onClick: () => C(w)
            },
            w.value
          ),
          description: l.createElement(
            y,
            { type: "secondary", style: { fontSize: 12 } },
            w.label
          )
        })
      )
    })
  );
}
const Ye = {
  marginBottom: 4,
  fontSize: 13,
  fontWeight: 500,
  color: "rgba(0,0,0,0.85)",
  display: "flex",
  alignItems: "center",
  gap: 4
}, Wn = { marginBottom: 16 }, Jn = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "0 16px",
  marginBottom: 16
}, Je = {
  fontSize: 13,
  fontWeight: 600,
  color: "rgba(0,0,0,0.85)",
  marginBottom: 12,
  paddingBottom: 8,
  borderBottom: "1px solid #f0f0f0"
}, Kn = {
  fontSize: 12,
  color: "rgba(0,0,0,0.45)",
  marginLeft: 8
};
function rl({ agentId: e }) {
  const t = x().React, { useState: l, useEffect: a, useCallback: n } = t, {
    Switch: r,
    InputNumber: o,
    Select: c,
    Button: i,
    Spin: d,
    Space: u,
    Typography: b,
    message: y
  } = x().antd, { PlayCircleOutlined: S, SaveOutlined: C } = x().antdIcons || {}, { Text: $ } = b, [w, z] = l(!0), [j, R] = l(!1), [W, G] = l(!1), [J, K] = l(!1), [B, P] = l(6), [F, X] = l("h"), [k, E] = l("main"), [f, T] = l(300), [v, H] = l(!1), [Z, L] = l("08:00"), [_, m] = l("22:00"), te = n(async () => {
    var ee, ge;
    z(!0);
    try {
      const I = await qa(e), re = Ja(I.every ?? "6h");
      K(I.enabled ?? !1), P(re.number), X(re.unit), E(I.target ?? "main"), T(I.timeoutSeconds ?? 300), H(!!I.activeHours), L(((ee = I.activeHours) == null ? void 0 : ee.start) ?? "08:00"), m(((ge = I.activeHours) == null ? void 0 : ge.end) ?? "22:00");
    } catch (I) {
      y.error(I.message || "加载心跳配置失败");
    } finally {
      z(!1);
    }
  }, [e]);
  a(() => {
    te();
  }, [te]);
  const N = async () => {
    R(!0);
    try {
      await Xa(e, {
        enabled: J,
        every: Ka({ number: B, unit: F }),
        target: k,
        timeoutSeconds: f,
        activeHours: v && Z && _ ? { start: Z, end: _ } : void 0
      }), y.success("心跳配置已保存");
    } catch (ee) {
      y.error(ee.message || "保存心跳配置失败");
    } finally {
      R(!1);
    }
  }, h = async () => {
    G(!0);
    try {
      await Va(e), y.success("已触发心跳检查");
    } catch (ee) {
      y.error(ee.message || "触发心跳失败");
    } finally {
      G(!1);
    }
  };
  if (w)
    return t.createElement(
      "div",
      { style: { textAlign: "center", padding: 40 } },
      t.createElement(d, { size: "large" })
    );
  const D = (ee, ge, I) => t.createElement(
    "div",
    { style: Wn },
    t.createElement("div", { style: Ye }, ee),
    ge,
    I ? t.createElement(
      $,
      { type: "secondary", style: Kn },
      I
    ) : null
  ), le = (ee, ge, I, re) => t.createElement(
    "div",
    { style: Jn },
    t.createElement(
      "div",
      null,
      t.createElement("div", { style: Ye }, ee),
      ge
    ),
    t.createElement(
      "div",
      null,
      t.createElement("div", { style: Ye }, I),
      re
    )
  ), { Divider: V } = x().antd;
  return t.createElement(
    "div",
    { style: { paddingBottom: 8 } },
    // ── Section: 基本设置 ──
    t.createElement("div", { style: Je }, "基本设置"),
    D(
      "启用心跳",
      t.createElement(r, {
        checked: J,
        onChange: (ee) => K(ee)
      }),
      J ? "已启用，专家将定期自检" : "已停用"
    ),
    le(
      "检查频率",
      t.createElement(
        u,
        null,
        t.createElement(o, {
          min: 1,
          value: B,
          onChange: (ee) => P(ee ?? 1),
          style: { width: "100%" }
        }),
        t.createElement(c, {
          value: F,
          onChange: (ee) => X(ee),
          style: { width: 90 },
          options: [
            { value: "m", label: "分钟" },
            { value: "h", label: "小时" }
          ]
        })
      ),
      "心跳目标",
      t.createElement(c, {
        value: k,
        onChange: (ee) => E(ee),
        style: { width: "100%" },
        options: [
          { value: "main", label: "主会话 (main)" },
          { value: "last", label: "最近会话 (last)" },
          { value: "inbox", label: "收件箱 (inbox)" }
        ]
      })
    ),
    D(
      "超时时间 (秒)",
      t.createElement(o, {
        min: 1,
        max: 3600,
        value: f,
        onChange: (ee) => T(ee ?? 300),
        style: { width: 200 }
      })
    ),
    // ── Section: 活跃时段 ──
    t.createElement(V, { style: { margin: "8px 0 16px" } }),
    t.createElement("div", { style: Je }, "活跃时段"),
    D(
      "启用活跃时段限制",
      t.createElement(r, {
        checked: v,
        onChange: (ee) => H(ee)
      }),
      "仅在指定时段内触发心跳"
    ),
    v ? le(
      "开始时间",
      t.createElement("input", {
        type: "time",
        value: Z,
        onChange: (ee) => L(ee.target.value),
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
        value: _,
        onChange: (ee) => m(ee.target.value),
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
          icon: C ? t.createElement(C) : void 0,
          loading: j,
          onClick: N,
          style: Le
        },
        "保存配置"
      ),
      t.createElement(
        i,
        {
          icon: S ? t.createElement(S) : void 0,
          loading: W,
          onClick: h
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
  const l = x().React, { useState: a, useEffect: n, useCallback: r } = l, {
    List: o,
    Tag: c,
    Switch: i,
    Button: d,
    Empty: u,
    Spin: b,
    Typography: y,
    message: S
  } = x().antd, { PlusOutlined: C, ReloadOutlined: $, DeleteOutlined: w } = x().antdIcons || {}, { Text: z, Paragraph: j } = y, [R, W] = a([]), [G, J] = a(!0), [K, B] = a(!1), [P, F] = a([]), [X, k] = a(!1), E = r(async () => {
    J(!0);
    try {
      const L = await Ct(e);
      W(L);
    } catch (L) {
      S.error(L.message || "加载技能失败"), W([]);
    } finally {
      J(!1);
    }
  }, [e]);
  n(() => {
    E();
  }, [E]);
  const f = async () => {
    B(!0), k(!0);
    try {
      const L = await Tt(!0);
      F(L);
    } catch (L) {
      S.error(L.message || "加载技能池失败");
    } finally {
      k(!1);
    }
  }, T = async (L) => {
    let _ = 0, m = 0;
    for (const te of L)
      try {
        await Nt(e, te), _++;
      } catch {
        m++;
      }
    _ > 0 ? (S.success(
      `成功添加 ${_} 个技能${m > 0 ? `，${m} 个失败` : ""}`
    ), E(), t()) : m > 0 && S.error("添加技能失败"), B(!1);
  }, v = async (L, _) => {
    try {
      _ ? await Nn(e, L.name) : await Fn(e, L.name), S.success(_ ? "已启用" : "已停用"), E(), t();
    } catch (m) {
      S.error(m.message || "操作失败");
    }
  }, H = async (L) => {
    try {
      await Dt(e, L), S.success(`技能「${L}」已移除`), E(), t();
    } catch (_) {
      S.error(_.message || "移除技能失败");
    }
  };
  if (G)
    return l.createElement(
      "div",
      { style: { textAlign: "center", padding: 40 } },
      l.createElement(b, { size: "large" })
    );
  const Z = R.filter((L) => L.enabled !== !1);
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
          marginBottom: 12
        }
      },
      l.createElement(
        z,
        { strong: !0 },
        `技能列表 (${R.length}，已启用 ${Z.length})`
      ),
      l.createElement(
        "div",
        { style: { display: "flex", gap: 8 } },
        l.createElement(
          d,
          {
            size: "small",
            icon: $ ? l.createElement($) : void 0,
            onClick: () => {
              st(), E();
            }
          },
          "刷新"
        ),
        l.createElement(
          d,
          {
            type: "primary",
            size: "small",
            icon: C ? l.createElement(C) : void 0,
            onClick: f,
            style: Le
          },
          "从技能池添加"
        )
      )
    ),
    R.length === 0 ? l.createElement(u, {
      description: "该专家暂无技能",
      image: u.PRESENTED_IMAGE_SIMPLE
    }) : l.createElement(o, {
      dataSource: R,
      renderItem: (L) => l.createElement(
        o.Item,
        {
          actions: [
            l.createElement(i, {
              key: "toggle",
              size: "small",
              checked: L.enabled !== !1,
              onChange: (_) => v(L, _)
            }),
            l.createElement(
              d,
              {
                key: "del",
                type: "link",
                size: "small",
                danger: !0,
                icon: w ? l.createElement(w) : void 0,
                onClick: () => H(L.name)
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
            L.emoji ? l.createElement(
              "span",
              { style: { fontSize: 16 } },
              L.emoji
            ) : null,
            l.createElement(z, { strong: !0 }, L.name),
            L.version_text ? l.createElement(
              c,
              { style: { fontSize: 10 } },
              `v${L.version_text}`
            ) : null
          ),
          L.description ? l.createElement(
            j,
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
    l.createElement(Gn, {
      open: K,
      onClose: () => B(!1),
      poolSkills: P,
      installedSkillNames: R.map((L) => L.name),
      loading: X,
      onInstall: T
    })
  );
}
function sl({
  agentId: e,
  onRefresh: t,
  isActive: l
}) {
  const a = x().React, { useState: n, useEffect: r, useCallback: o } = a, {
    List: c,
    Tag: i,
    Button: d,
    Empty: u,
    Spin: b,
    Modal: y,
    Input: S,
    Typography: C,
    message: $
  } = x().antd, { PlusOutlined: w, ReloadOutlined: z, DeleteOutlined: j } = x().antdIcons || {}, { Text: R, Paragraph: W } = C, { TextArea: G } = S, [J, K] = n([]), [B, P] = n(!0), [F, X] = n(!1), [k, E] = n(`{
  "mcpServers": {
    "example-client": {
      "command": "npx",
      "args": ["-y", "@example/mcp-server"],
      "env": {}
    }
  }
}`), [f, T] = n(!1), v = o(async () => {
    P(!0);
    try {
      const _ = await Ft(e);
      K(_);
    } catch (_) {
      $.error(_.message || "加载 MCP 失败"), K([]);
    } finally {
      P(!1);
    }
  }, [e]);
  r(() => {
    v();
  }, [v]), r(() => {
    l && v();
  }, [l, v]);
  const H = async (_) => {
    try {
      await Ha(e, _), $.success("已切换 MCP 状态"), v(), t();
    } catch (m) {
      $.error(m.message || "切换失败");
    }
  }, Z = async (_) => {
    try {
      await Dn(e, _), $.success(`MCP「${_}」已移除`), v(), t();
    } catch (m) {
      $.error(m.message || "移除 MCP 失败");
    }
  }, L = async () => {
    T(!0);
    try {
      const _ = JSON.parse(k), m = _.mcpServers || _, te = Object.entries(m);
      if (te.length === 0) {
        $.warning("未找到 MCP 客户端配置");
        return;
      }
      for (const [N, h] of te) {
        const D = h, le = D.url ? "streamable_http" : "stdio";
        await Gt(e, {
          client_key: N,
          client: {
            name: D.name || N,
            description: D.description || "",
            enabled: !0,
            transport: le,
            url: D.url || "",
            command: D.command || "",
            args: D.args || [],
            env: D.env || {},
            cwd: D.cwd || "",
            headers: D.headers || {}
          }
        });
      }
      $.success("MCP 客户端已创建"), X(!1), v(), t();
    } catch (_) {
      _ instanceof SyntaxError ? $.error("JSON 格式错误：" + _.message) : $.error(_.message || "创建 MCP 失败");
    } finally {
      T(!1);
    }
  };
  return B ? a.createElement(
    "div",
    { style: { textAlign: "center", padding: 40 } },
    a.createElement(b, { size: "large" })
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
      a.createElement(R, { strong: !0 }, `MCP 客户端 (${J.length})`),
      a.createElement(
        "div",
        { style: { display: "flex", gap: 8 } },
        a.createElement(
          d,
          {
            size: "small",
            icon: z ? a.createElement(z) : void 0,
            onClick: () => {
              st(), v();
            }
          },
          "刷新"
        ),
        a.createElement(
          d,
          {
            type: "primary",
            size: "small",
            icon: w ? a.createElement(w) : void 0,
            onClick: () => X(!0),
            style: Le
          },
          "添加 MCP"
        )
      )
    ),
    J.length === 0 ? a.createElement(u, {
      description: "该专家暂无 MCP 客户端",
      image: u.PRESENTED_IMAGE_SIMPLE
    }) : a.createElement(c, {
      dataSource: J,
      renderItem: (_) => a.createElement(
        c.Item,
        {
          actions: [
            a.createElement(
              d,
              {
                key: "toggle",
                size: "small",
                onClick: () => H(_.key)
              },
              _.enabled ? "停用" : "启用"
            ),
            a.createElement(
              d,
              {
                key: "del",
                type: "link",
                size: "small",
                danger: !0,
                icon: j ? a.createElement(j) : void 0,
                onClick: () => Z(_.key)
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
            a.createElement("span", { style: { fontSize: 14 } }, "🔌"),
            a.createElement(R, { strong: !0 }, _.name || _.key),
            a.createElement(
              i,
              {
                color: _.enabled ? "green" : "default",
                style: { fontSize: 10 }
              },
              _.enabled ? "启用" : "停用"
            ),
            a.createElement(
              i,
              { color: "purple", style: { fontSize: 10 } },
              _.transport
            )
          ),
          _.description ? a.createElement(
            W,
            {
              type: "secondary",
              style: { fontSize: 12, margin: 0 },
              ellipsis: { rows: 2 }
            },
            _.description
          ) : null,
          _.tools && _.tools.length > 0 ? a.createElement(
            "div",
            { style: { marginTop: 4, fontSize: 11, color: "var(--ant-color-text-tertiary, #8c8c8c)" } },
            `提供 ${_.tools.length} 个工具`
          ) : null
        )
      )
    }),
    // Create MCP modal
    a.createElement(
      y,
      {
        open: F,
        title: "添加 MCP 客户端 (JSON)",
        onCancel: () => X(!1),
        onOk: L,
        confirmLoading: f,
        okText: "创建",
        width: 560
      },
      a.createElement(
        "div",
        { style: { marginBottom: 8, fontSize: 12, color: "var(--ant-color-text-tertiary, #8c8c8c)" } },
        "粘贴 MCP 配置 JSON（支持 mcpServers 格式），将创建到当前专家工作区："
      ),
      a.createElement(G, {
        value: k,
        onChange: (_) => E(_.target.value),
        rows: 12,
        style: { fontFamily: "monospace", fontSize: 12 }
      })
    )
  );
}
function il({ agentId: e }) {
  const t = x().React, { useState: l, useEffect: a, useCallback: n, useRef: r } = t, {
    Card: o,
    InputNumber: c,
    Input: i,
    Select: d,
    Switch: u,
    Button: b,
    Spin: y,
    Space: S,
    Typography: C,
    Divider: $,
    message: w
  } = x().antd, { SaveOutlined: z } = x().antdIcons || {}, { Text: j } = C, [R, W] = l(!0), [G, J] = l(!1), K = r(null), [B, P] = l(60), [F, X] = l(""), [k, E] = l(!0), [f, T] = l(30), [v, H] = l("zh"), [Z, L] = l("UTC"), [_, m] = l(!0), [te, N] = l(100), [h, D] = l(!0), [le, V] = l(3), [ee, ge] = l(1), [I, re] = l(!0), [ue, oe] = l(3), [ae, ye] = l(2), [Ee, xe] = l(60), [Ae, ve] = l(1), [Q, be] = l(0), [fe, q] = l(1), [ce, pe] = l(0), [U, g] = l(30), [de, M] = l(50), [p, ne] = l("light"), [ie, Te] = l("scroll"), [ke, Oe] = l("remelight"), [Re, je] = l("AUTO"), Ue = n(async () => {
    var Y, _e, Ie, Pe, De, Fe;
    W(!0);
    try {
      const [Ce, it, _t] = await Promise.all([
        Ya(e),
        Za(e).catch(() => "zh"),
        tl().catch(() => "UTC")
      ]);
      K.current = Ce, P(Ce.shell_command_timeout ?? 60), X(Ce.shell_command_executable ?? "");
      const et = Ce.auto_title_config ?? { enabled: !0, timeout_seconds: 30 };
      E(et.enabled ?? !0), T(et.timeout_seconds ?? 30), H(it), L(_t);
      const He = Ce.loop ?? {};
      m(((Y = He.iteration) == null ? void 0 : Y.enabled) ?? !0), N(((_e = He.iteration) == null ? void 0 : _e.max_iterations) ?? Ce.max_iters ?? 100), D(((Ie = He.doom_loop) == null ? void 0 : Ie.enabled) ?? !0), V(((Pe = He.doom_loop) == null ? void 0 : Pe.window_size) ?? 3), ge(((De = He.doom_loop) == null ? void 0 : De.similarity_threshold) ?? 1), re(Ce.llm_retry_enabled ?? !0), oe(Ce.llm_max_retries ?? 3), ye(Ce.llm_backoff_base ?? 2), xe(Ce.llm_backoff_cap ?? 60), ve(Ce.llm_max_concurrent ?? 1), be(Ce.llm_max_qpm ?? 0), q(Ce.llm_rate_limit_pause ?? 1), pe(Ce.llm_rate_limit_jitter ?? 0), g(Ce.llm_acquire_timeout ?? 30), M(Ce.history_max_length ?? 50), ne(Ce.context_manager_backend ?? "light"), Te(((Fe = Ce.light_context_config) == null ? void 0 : Fe.strategy) ?? "scroll"), Oe(Ce.memory_manager_backend ?? "remelight"), je(Ce.approval_level ?? "AUTO");
    } catch (Ce) {
      w.error(Ce.message || "加载运行配置失败");
    } finally {
      W(!1);
    }
  }, [e]);
  a(() => {
    Ue();
  }, [Ue]);
  const Me = async () => {
    var _e, Ie;
    const Y = K.current;
    if (Y) {
      J(!0);
      try {
        const Pe = {
          ...Y,
          max_iters: te,
          loop: {
            ...Y.loop ?? {},
            iteration: { enabled: _, max_iterations: te },
            doom_loop: {
              enabled: h,
              window_size: le,
              similarity_threshold: ee,
              stages: ((Ie = (_e = Y.loop) == null ? void 0 : _e.doom_loop) == null ? void 0 : Ie.stages) ?? []
            }
          },
          shell_command_timeout: B,
          shell_command_executable: F,
          auto_title_config: {
            enabled: k,
            timeout_seconds: f
          },
          llm_retry_enabled: I,
          llm_max_retries: ue,
          llm_backoff_base: ae,
          llm_backoff_cap: Ee,
          llm_max_concurrent: Ae,
          llm_max_qpm: Q,
          llm_rate_limit_pause: fe,
          llm_rate_limit_jitter: ce,
          llm_acquire_timeout: U,
          history_max_length: de,
          context_manager_backend: p,
          light_context_config: {
            ...Y.light_context_config ?? {},
            strategy: ie
          },
          memory_manager_backend: ke,
          approval_level: Re
        };
        await Qa(e, Pe), K.current = Pe, v && await el(e, v).catch(() => {
        }), Z && await nl(Z).catch(() => {
        }), w.success("运行配置已保存");
      } catch (Pe) {
        w.error(Pe.message || "保存运行配置失败");
      } finally {
        J(!1);
      }
    }
  };
  if (R)
    return t.createElement(
      "div",
      { style: { textAlign: "center", padding: 40 } },
      t.createElement(y, { size: "large" })
    );
  const Se = (Y, _e, Ie) => t.createElement(
    "div",
    { style: Wn },
    t.createElement("div", { style: Ye }, Y),
    _e,
    Ie ? t.createElement(
      j,
      { type: "secondary", style: Kn },
      Ie
    ) : null
  ), $e = (Y, _e, Ie, Pe) => t.createElement(
    "div",
    { style: Jn },
    t.createElement(
      "div",
      null,
      t.createElement("div", { style: Ye }, Y),
      _e
    ),
    t.createElement(
      "div",
      null,
      t.createElement("div", { style: Ye }, Ie),
      Pe
    )
  );
  return t.createElement(
    "div",
    { style: { paddingBottom: 8 } },
    // ── Section: 基础设置 ──
    t.createElement(
      "div",
      { style: Je },
      "基础设置"
    ),
    $e(
      "Shell 命令超时 (秒)",
      t.createElement(c, {
        min: 1,
        value: B,
        onChange: (Y) => P(Y ?? 60),
        style: { width: "100%" }
      }),
      "Shell 可执行文件",
      t.createElement(i, {
        value: F,
        onChange: (Y) => X(Y.target.value),
        placeholder: "留空使用系统默认",
        style: { width: "100%" }
      })
    ),
    $e(
      "语言",
      t.createElement(d, {
        value: v,
        onChange: (Y) => H(Y),
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
        onChange: (Y) => L(Y),
        style: { width: "100%" },
        showSearch: !0,
        filterOption: (Y, _e) => {
          var Ie;
          return (((Ie = _e == null ? void 0 : _e.label) == null ? void 0 : Ie.toString()) || "").toLowerCase().includes(Y.toLowerCase());
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
    $e(
      "自动生成会话标题",
      t.createElement(S, null, t.createElement(u, {
        checked: k,
        onChange: (Y) => E(Y)
      })),
      "标题生成超时 (秒)",
      t.createElement(c, {
        min: 5,
        value: f,
        onChange: (Y) => T(Y ?? 30),
        style: { width: "100%" },
        disabled: !k
      })
    ),
    // ── Section: 审批级别 ──
    t.createElement($, { style: { margin: "8px 0 16px" } }),
    t.createElement("div", { style: Je }, "审批级别"),
    Se(
      "工具执行审批",
      t.createElement(d, {
        value: Re,
        onChange: (Y) => je(Y),
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
    t.createElement($, { style: { margin: "8px 0 16px" } }),
    t.createElement("div", { style: Je }, "迭代与循环"),
    Se(
      "启用迭代限制",
      t.createElement(u, {
        checked: _,
        onChange: (Y) => m(Y)
      }),
      "停止 Agent 前的最大循环轮次"
    ),
    _ ? Se(
      "最大迭代次数",
      t.createElement(c, {
        min: 1,
        max: 500,
        value: te,
        onChange: (Y) => N(Y ?? 100),
        style: { width: "100%" }
      })
    ) : null,
    Se(
      "启用重复循环保护",
      t.createElement(u, {
        checked: h,
        onChange: (Y) => D(Y)
      }),
      "检测并阻止重复操作循环"
    ),
    h ? $e(
      "检测窗口大小",
      t.createElement(c, {
        min: 2,
        max: 20,
        value: le,
        onChange: (Y) => V(Y ?? 3),
        style: { width: "100%" }
      }),
      "相似度阈值",
      t.createElement(c, {
        min: 0,
        max: 1,
        step: 0.05,
        value: ee,
        onChange: (Y) => ge(Y ?? 1),
        style: { width: "100%" }
      })
    ) : null,
    // ── Section: LLM 重试 ──
    t.createElement($, { style: { margin: "8px 0 16px" } }),
    t.createElement("div", { style: Je }, "LLM 重试"),
    Se(
      "启用 LLM 重试",
      t.createElement(u, {
        checked: I,
        onChange: (Y) => re(Y)
      })
    ),
    $e(
      "最大重试次数",
      t.createElement(c, {
        min: 1,
        value: ue,
        onChange: (Y) => oe(Y ?? 3),
        style: { width: "100%" },
        disabled: !I
      }),
      "退避基数 (秒)",
      t.createElement(c, {
        min: 0.1,
        step: 0.1,
        value: ae,
        onChange: (Y) => ye(Y ?? 2),
        style: { width: "100%" },
        disabled: !I
      })
    ),
    Se(
      "退避上限 (秒)",
      t.createElement(c, {
        min: 0.5,
        step: 0.5,
        value: Ee,
        onChange: (Y) => xe(Y ?? 60),
        style: { width: 200 },
        disabled: !I
      })
    ),
    // ── Section: LLM 限流 ──
    t.createElement($, { style: { margin: "8px 0 16px" } }),
    t.createElement("div", { style: Je }, "LLM 限流"),
    $e(
      "最大并发数",
      t.createElement(c, {
        min: 1,
        value: Ae,
        onChange: (Y) => ve(Y ?? 1),
        style: { width: "100%" }
      }),
      "最大 QPM (0=不限)",
      t.createElement(c, {
        min: 0,
        step: 10,
        value: Q,
        onChange: (Y) => be(Y ?? 0),
        style: { width: "100%" }
      })
    ),
    $e(
      "限流暂停时间 (秒)",
      t.createElement(c, {
        min: 1,
        step: 0.5,
        value: fe,
        onChange: (Y) => q(Y ?? 1),
        style: { width: "100%" }
      }),
      "限流抖动 (秒)",
      t.createElement(c, {
        min: 0,
        step: 0.5,
        value: ce,
        onChange: (Y) => pe(Y ?? 0),
        style: { width: "100%" }
      })
    ),
    Se(
      "获取超时 (秒)",
      t.createElement(c, {
        min: 10,
        step: 10,
        value: U,
        onChange: (Y) => g(Y ?? 30),
        style: { width: 200 }
      }),
      "应大于 限流暂停 + 抖动"
    ),
    // ── Section: 上下文与记忆 ──
    t.createElement($, { style: { margin: "8px 0 16px" } }),
    t.createElement("div", { style: Je }, "上下文与记忆"),
    $e(
      "上下文管理后端",
      t.createElement(d, {
        value: p,
        onChange: (Y) => ne(Y),
        style: { width: "100%" },
        options: [{ value: "light", label: "light" }]
      }),
      "上下文策略",
      t.createElement(d, {
        value: ie,
        onChange: (Y) => Te(Y),
        style: { width: "100%" },
        options: [
          { value: "scroll", label: "scroll (滚动窗口)" },
          { value: "native", label: "native (原生)" }
        ]
      })
    ),
    $e(
      "记忆管理后端",
      t.createElement(d, {
        value: ke,
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
        value: de,
        onChange: (Y) => M(Y ?? 50),
        style: { width: "100%" }
      })
    ),
    // ── Save button ──
    t.createElement(
      "div",
      { style: { display: "flex", justifyContent: "flex-end", marginTop: 16 } },
      t.createElement(
        b,
        {
          type: "primary",
          icon: z ? t.createElement(z) : void 0,
          loading: G,
          onClick: Me,
          style: Le
        },
        "保存运行配置"
      )
    )
  );
}
function cl({
  expert: e,
  open: t,
  onClose: l,
  onRefresh: a
}) {
  const n = x().React, { useState: r, useEffect: o, useCallback: c } = n, { Modal: i, Tabs: d, Spin: u, Typography: b } = x().antd, { SettingOutlined: y } = x().antdIcons || {}, { Text: S } = b, [C, $] = r([]), [w, z] = r(!1), [j, R] = r("heartbeat"), W = c(async () => {
    if (e) {
      z(!0);
      try {
        const B = await al(e.agent.id);
        $(B);
      } catch {
        $([]);
      } finally {
        z(!1);
      }
    }
  }, [e]);
  if (o(() => {
    t && e && W();
  }, [t, e, W]), !e) return null;
  const { agent: G } = e, J = () => {
    W(), a();
  }, K = [
    {
      key: "heartbeat",
      label: "心跳",
      children: n.createElement(rl, {
        agentId: G.id
      })
    },
    {
      key: "files",
      label: "文件",
      children: w ? n.createElement(
        "div",
        { style: { textAlign: "center", padding: 40 } },
        n.createElement(u, { size: "large" })
      ) : n.createElement(Hn, {
        agentId: G.id,
        systemPromptFiles: C,
        onRefresh: J
      })
    },
    {
      key: "skills",
      label: `技能 (${e.skills.filter((B) => B.enabled !== !1).length})`,
      children: n.createElement(ol, {
        agentId: G.id,
        onRefresh: a
      })
    },
    {
      key: "mcp",
      label: `MCP (${e.mcps.length})`,
      children: n.createElement(sl, {
        agentId: G.id,
        onRefresh: a,
        isActive: j === "mcp"
      })
    },
    {
      key: "running",
      label: "运行配置",
      children: n.createElement(il, {
        agentId: G.id
      })
    }
  ];
  return n.createElement(
    i,
    {
      open: t,
      title: n.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 8 } },
        y ? n.createElement(y, { style: { fontSize: 18 } }) : null,
        n.createElement("span", null, `配置 - ${G.name}`),
        n.createElement(
          S,
          { type: "secondary", style: { fontSize: 12, fontWeight: 400 } },
          G.id
        )
      ),
      onCancel: l,
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
      items: K,
      activeKey: j,
      onChange: (B) => R(B),
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
function wn(e) {
  return St(`/ugsci/avatar/${encodeURIComponent(e)}`);
}
function xn(e) {
  const t = e.map(encodeURIComponent).join(",");
  return St(`/ugsci/avatar/team/${t}`);
}
function Ne({
  name: e,
  size: t = 32,
  borderRadius: l = "50%"
}) {
  const a = x().React, [n, r] = a.useState(0), o = n === 0 ? wn(e) : `${wn(e)}?_r=${n}`;
  return a.createElement("img", {
    src: o,
    alt: e,
    onError: () => {
      n < 1 && r(n + 1);
    },
    style: {
      width: t,
      height: t,
      borderRadius: l,
      objectFit: "cover",
      flexShrink: 0
    }
  });
}
function Ht({
  members: e,
  size: t = 32,
  borderRadius: l = "50%"
}) {
  const a = x().React, [n, r] = a.useState(0);
  if (!e || e.length === 0)
    return a.createElement("span", {
      style: {
        width: t,
        height: t,
        display: "inline-block"
      }
    });
  const o = e.slice(0, 5), c = n === 0 ? xn(o) : `${xn(o)}?_r=${n}`;
  return a.createElement("img", {
    src: c,
    alt: "team",
    onError: () => {
      n < 1 && r(n + 1);
    },
    style: {
      width: t,
      height: t,
      borderRadius: l,
      objectFit: "cover",
      flexShrink: 0
    }
  });
}
async function kn(e) {
  var l;
  const t = x();
  if (t.refreshAgents)
    try {
      await t.refreshAgents({ force: !0 });
    } catch (a) {
      console.warn("[ugsci] Failed to refresh newly created agent:", a);
      return;
    }
  (l = t.setSelectedAgent) == null || l.call(t, e);
}
function ul({
  expert: e,
  onClick: t,
  onSummon: l,
  onConfigure: a
}) {
  const n = x().React, { Card: r, Tag: o, Badge: c, Typography: i, Spin: d, Button: u, Tooltip: b } = x().antd, { Text: y } = i, { ThunderboltOutlined: S, SettingOutlined: C } = x().antdIcons || {}, { agent: $, skills: w, mcps: z, loading: j } = e, R = $.enabled, W = w.filter((K) => K.enabled !== !1).map((K) => K.name), G = z.map((K) => K.name || K.key), J = $.active_model ? `${$.active_model.provider_id}/${$.active_model.model}` : null;
  return n.createElement(
    r,
    {
      hoverable: !0,
      onClick: t,
      size: "small",
      style: {
        cursor: "pointer",
        transition: "all 0.2s ease",
        borderColor: R ? void 0 : "var(--ant-color-border, #d9d9d9)",
        opacity: R ? 1 : 0.7,
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
        n.createElement(Ne, { name: $.name, size: 36 }),
        n.createElement(
          "div",
          null,
          n.createElement(
            y,
            { strong: !0, style: { fontSize: 15 } },
            $.name
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
            $.id
          )
        )
      ),
      n.createElement(c, {
        status: R ? "success" : "default",
        text: R ? "启用" : "停用"
      })
    ),
    // Description (rendered as markdown)
    $.description ? n.createElement(
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
      wt($.description, n)
    ) : n.createElement(
      "div",
      { style: { fontSize: 12, color: "var(--ant-color-text-quaternary, #bfbfbf)", marginBottom: 10, minHeight: 54, flex: "1 0 auto" } },
      "暂无描述"
    ),
    // Model info
    J ? n.createElement(
      "div",
      { style: { marginBottom: 8 } },
      n.createElement(
        o,
        { color: "geekblue", style: { fontSize: 11 } },
        `🤖 ${J}`
      )
    ) : null,
    // Skills
    j ? n.createElement(d, { size: "small" }) : n.createElement(
      "div",
      { style: { marginBottom: 6 } },
      n.createElement(
        "div",
        { style: { fontSize: 11, color: "var(--ant-color-text-tertiary, #8c8c8c)", marginBottom: 4 } },
        `技能 (${W.length})`
      ),
      n.createElement(Sn, {
        items: W,
        max: 4,
        color: "cyan",
        emptyText: "未配置技能"
      })
    ),
    // MCP
    !j && G.length > 0 ? n.createElement(
      "div",
      { style: { marginTop: "auto" } },
      n.createElement(
        "div",
        { style: { fontSize: 11, color: "var(--ant-color-text-tertiary, #8c8c8c)", marginBottom: 4 } },
        `MCP (${G.length})`
      ),
      n.createElement(Sn, {
        items: G,
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
          borderTop: "1px solid #f0f0f0"
        }
      },
      // Gear icon (bottom-left) — opens configuration modal
      n.createElement(
        b,
        { title: "配置专家", placement: "top" },
        n.createElement(
          u,
          {
            type: "text",
            size: "small",
            icon: C ? n.createElement(C, {
              style: { fontSize: 16, color: "var(--ant-color-text-tertiary, #8c8c8c)" }
            }) : void 0,
            onClick: (K) => {
              K.stopPropagation(), a && a();
            }
          }
        )
      ),
      // Summon button (bottom-right)
      n.createElement(
        u,
        {
          type: "primary",
          size: "small",
          icon: S ? n.createElement(S) : void 0,
          disabled: !R,
          onClick: (K) => {
            K.stopPropagation(), l && l();
          },
          style: Le
        },
        "召唤专家"
      )
    )
  );
}
function pl({
  expert: e,
  open: t,
  onClose: l,
  onRefresh: a
}) {
  const n = x().React, {
    Drawer: r,
    Descriptions: o,
    Tag: c,
    Typography: i,
    Space: d,
    Button: u,
    Empty: b,
    Tabs: y,
    List: S,
    Spin: C,
    Modal: $,
    message: w
  } = x().antd, { Text: z, Paragraph: j } = i, {
    EditOutlined: R,
    ThunderboltOutlined: W,
    FileTextOutlined: G,
    ToolOutlined: J,
    PlusOutlined: K
  } = x().antdIcons || {}, [B, P] = n.useState(!1), [F, X] = n.useState(
    []
  ), [k, E] = n.useState(!1);
  if (!e) return null;
  const { agent: f, config: T, skills: v, mcps: H, loading: Z } = e, L = v.filter((I) => I.enabled !== !1), _ = (I) => {
    window.history.pushState({}, "", I), window.dispatchEvent(new PopStateEvent("popstate"));
  }, m = n.createElement(
    "div",
    null,
    n.createElement(
      o,
      { column: 1, bordered: !0, size: "small" },
      n.createElement(o.Item, { label: "专家名称" }, f.name),
      n.createElement(
        o.Item,
        { label: "专家 ID" },
        n.createElement("code", { style: { fontSize: 12 } }, f.id)
      ),
      n.createElement(
        o.Item,
        { label: "状态" },
        n.createElement(
          c,
          { color: f.enabled ? "green" : "default" },
          f.enabled ? "启用" : "停用"
        )
      ),
      n.createElement(
        o.Item,
        { label: "功能简介" },
        f.description ? wt(f.description, n) : "暂无描述"
      ),
      n.createElement(
        o.Item,
        { label: "使用模型" },
        f.active_model ? `${f.active_model.provider_id} / ${f.active_model.model}` : "使用全局默认模型"
      ),
      T != null && T.workspace_dir ? n.createElement(
        o.Item,
        { label: "工作区路径" },
        n.createElement(
          "code",
          { style: { fontSize: 11 } },
          T.workspace_dir
        )
      ) : null,
      T != null && T.approval_level ? n.createElement(
        o.Item,
        { label: "审批级别" },
        T.approval_level
      ) : null
    ),
    // System prompt files
    T != null && T.system_prompt_files && T.system_prompt_files.length > 0 ? n.createElement(
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
        G ? n.createElement(G, {
          style: { fontSize: 14, color: "#1677ff" }
        }) : null,
        n.createElement(z, { strong: !0 }, "系统提示词文件")
      ),
      n.createElement(
        d,
        { wrap: !0 },
        ...T.system_prompt_files.map(
          (I, re) => n.createElement(
            c,
            {
              key: re,
              icon: G ? n.createElement(G) : void 0,
              style: { fontSize: 12 }
            },
            I
          )
        )
      )
    ) : null
  ), te = async () => {
    P(!0), E(!0);
    try {
      const I = await Tt(!0);
      X(I);
    } catch (I) {
      w.error(I.message || "加载技能池失败");
    } finally {
      E(!1);
    }
  }, N = async (I) => {
    let re = 0, ue = 0;
    for (const oe of I)
      try {
        await Nt(f.id, oe), re++;
      } catch {
        ue++;
      }
    re > 0 ? (w.success(
      `成功添加 ${re} 个技能${ue > 0 ? `，${ue} 个失败` : ""}`
    ), a()) : ue > 0 && w.error("添加技能失败"), P(!1);
  }, h = async (I) => {
    try {
      await Dt(f.id, I), w.success(`技能「${I}」已移除`), a();
    } catch (re) {
      w.error(re.message || "移除技能失败");
    }
  }, D = async (I) => {
    try {
      await Dn(f.id, I), w.success(`MCP「${I}」已移除`), a();
    } catch (re) {
      w.error(re.message || "移除 MCP 失败");
    }
  }, le = Z ? n.createElement(
    "div",
    { style: { textAlign: "center", padding: 40 } },
    n.createElement(C, { size: "large" })
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
        z,
        { strong: !0 },
        `已启用技能 (${L.length})`
      ),
      n.createElement(
        u,
        {
          type: "primary",
          size: "small",
          icon: K ? n.createElement(K) : void 0,
          onClick: te
        },
        "从技能池添加"
      )
    ),
    L.length === 0 ? n.createElement(b, {
      description: "该专家暂无已启用的技能",
      image: b.PRESENTED_IMAGE_SIMPLE
    }) : n.createElement(S, {
      dataSource: L,
      renderItem: (I) => n.createElement(
        S.Item,
        {
          actions: [
            n.createElement(
              u,
              {
                type: "link",
                size: "small",
                danger: !0,
                onClick: () => h(I.name)
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
            I.emoji ? n.createElement(
              "span",
              { style: { fontSize: 16 } },
              I.emoji
            ) : null,
            n.createElement(z, { strong: !0 }, I.name),
            I.version_text ? n.createElement(
              c,
              { style: { fontSize: 10 } },
              `v${I.version_text}`
            ) : null
          ),
          I.description ? n.createElement(
            j,
            {
              type: "secondary",
              style: { fontSize: 12, margin: 0 },
              ellipsis: { rows: 2 }
            },
            I.description
          ) : null,
          I.tags && I.tags.length > 0 ? n.createElement(
            "div",
            { style: { marginTop: 4 } },
            ...I.tags.map(
              (re, ue) => n.createElement(
                c,
                {
                  key: ue,
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
    n.createElement(Gn, {
      open: B,
      onClose: () => P(!1),
      poolSkills: F,
      installedSkillNames: L.map((I) => I.name),
      loading: k,
      onInstall: N
    })
  ), V = Z ? n.createElement(
    "div",
    { style: { textAlign: "center", padding: 40 } },
    n.createElement(C, { size: "large" })
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
        z,
        { strong: !0 },
        `MCP 客户端 (${H.length})`
      ),
      n.createElement(
        u,
        {
          type: "primary",
          size: "small",
          icon: K ? n.createElement(K) : void 0,
          onClick: () => {
            window.history.pushState({}, "", `/agents/${f.id}/mcp`), window.dispatchEvent(new PopStateEvent("popstate"));
          }
        },
        "配置 MCP"
      )
    ),
    H.length === 0 ? n.createElement(b, {
      description: "该专家暂无关联的 MCP 客户端，点击「配置 MCP」添加",
      image: b.PRESENTED_IMAGE_SIMPLE
    }) : n.createElement(S, {
      dataSource: H,
      renderItem: (I) => n.createElement(
        S.Item,
        {
          actions: [
            n.createElement(
              u,
              {
                type: "link",
                size: "small",
                danger: !0,
                onClick: () => D(I.key)
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
              z,
              { strong: !0 },
              I.name || I.key
            ),
            n.createElement(
              c,
              {
                color: I.enabled ? "green" : "default",
                style: { fontSize: 10 }
              },
              I.enabled ? "启用" : "停用"
            ),
            n.createElement(
              c,
              { color: "purple", style: { fontSize: 10 } },
              I.transport
            )
          ),
          I.description ? n.createElement(
            j,
            {
              type: "secondary",
              style: { fontSize: 12, margin: 0 },
              ellipsis: { rows: 2 }
            },
            I.description
          ) : null,
          I.tools && I.tools.length > 0 ? n.createElement(
            "div",
            {
              style: {
                marginTop: 4,
                fontSize: 11,
                color: "var(--ant-color-text-tertiary, #8c8c8c)"
              }
            },
            `提供 ${I.tools.length} 个工具`
          ) : null
        )
      )
    })
  ), ee = T != null && T.tools ? n.createElement(
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
        J ? n.createElement(J, {
          style: { fontSize: 14, color: "#1677ff" }
        }) : null,
        n.createElement(z, { strong: !0 }, "工具配置")
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
        JSON.stringify(T.tools, null, 2)
      )
    )
  ) : n.createElement(b, {
    description: "暂无工具配置",
    image: b.PRESENTED_IMAGE_SIMPLE
  }), ge = [
    { key: "basic", label: "基本信息", children: m },
    {
      key: "skills",
      label: `技能 (${L.length})`,
      children: le
    },
    {
      key: "prompts",
      label: "推荐提问",
      children: n.createElement(ll, {
        skills: L,
        agentId: f.id
      })
    },
    {
      key: "knowledge",
      label: "专家记忆",
      children: n.createElement(Hn, {
        agentId: f.id,
        systemPromptFiles: (T == null ? void 0 : T.system_prompt_files) || [],
        onRefresh: () => a()
      })
    },
    { key: "mcp", label: `MCP (${H.length})`, children: V },
    { key: "tools", label: "工具配置", children: ee }
  ];
  return n.createElement(
    r,
    {
      title: n.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 8 } },
        n.createElement(Ne, { name: f.name, size: 28 }),
        n.createElement("span", null, f.name)
      ),
      open: t,
      onClose: l,
      width: 560,
      extra: n.createElement(
        d,
        null,
        n.createElement(
          u,
          {
            size: "small",
            icon: R ? n.createElement(R) : void 0,
            onClick: () => {
              l();
              try {
                const I = x();
                I.setSelectedAgent && I.setSelectedAgent(f.id);
              } catch (I) {
                console.warn("[ugsci] Failed to set selected agent:", I);
              }
              setTimeout(() => _("/agents"), 0);
            }
          },
          "编辑专家"
        ),
        n.createElement(
          u,
          {
            type: "primary",
            size: "small",
            icon: W ? n.createElement(W) : void 0,
            onClick: () => {
              l();
              try {
                const I = x();
                I.setSelectedAgent && I.setSelectedAgent(f.id);
              } catch (I) {
                console.warn("[ugsci] Failed to set selected agent:", I);
              }
              setTimeout(() => _("/chat"), 0);
            }
          },
          "开始对话"
        )
      )
    },
    n.createElement(y, {
      items: ge,
      defaultActiveKey: "basic"
    })
  );
}
function gl({
  open: e,
  onClose: t,
  onCreated: l
}) {
  const a = x().React, { useState: n } = a, {
    Modal: r,
    Card: o,
    Tag: c,
    Input: i,
    Row: d,
    Col: u,
    Spin: b,
    message: y,
    Typography: S
  } = x().antd, { Text: C } = S, { FileAddOutlined: $ } = x().antdIcons || {}, [w, z] = n(!1), [j, R] = n(""), [W, G] = n(!1), J = async (P) => {
    z(!0);
    try {
      const F = await se("/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: P.id || void 0,
          name: P.name,
          description: P.description,
          skill_names: P.skillNames
        })
      }), X = P.systemPrompt.trim() || `# ${P.name}

你是${P.name}。${P.description ? `

职责：${P.description}` : ""}
`, E = (await Promise.allSettled([
        vt(F.id, "AGENTS.md", X),
        ...P.mcpClients.map(
          ({ clientKey: f, client: T }) => Gt(F.id, {
            client_key: f,
            client: T
          })
        )
      ])).filter(
        (f) => f.status === "rejected"
      ).length;
      E > 0 ? y.warning(
        `专家「${P.name}」已创建，${E} 项初始配置失败，可在专家配置中重试`
      ) : y.success(`专家「${P.name}」创建成功`), await kn(F.id), G(!1), setTimeout(() => {
        t(), l();
      }, 0);
    } catch (F) {
      y.error(F.message || "创建专家失败");
    } finally {
      z(!1);
    }
  }, K = ml.filter((P) => {
    if (!j.trim()) return !0;
    const F = j.toLowerCase();
    return P.name.toLowerCase().includes(F) || P.description.toLowerCase().includes(F) || P.category.toLowerCase().includes(F);
  }), B = async (P) => {
    z(!0);
    try {
      const F = await se("/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: P.name,
          description: P.description,
          skill_names: P.recommended_skills
        })
      });
      await vt(F.id, "AGENTS.md", P.system_prompt);
      const X = await Ut(F.id);
      X.approval_level = P.approval_level, await se(`/agents/${encodeURIComponent(F.id)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(X)
      }), await kn(F.id), y.success(`专家「${P.name}」创建成功`), t(), l();
    } catch (F) {
      y.error(F.message || "创建专家失败");
    } finally {
      z(!1);
    }
  };
  return a.createElement(
    a.Fragment,
    null,
    a.createElement(
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
      a.createElement(
        "div",
        { style: { marginBottom: 16 } },
        a.createElement(i, {
          placeholder: "搜索模板名称或类别...",
          value: j,
          onChange: (P) => R(P.target.value),
          allowClear: !0
        })
      ),
      w ? a.createElement(
        "div",
        { style: { textAlign: "center", padding: 60 } },
        a.createElement(b, { size: "large" }),
        a.createElement(
          "div",
          { style: { marginTop: 12, color: "var(--ant-color-text-tertiary, #8c8c8c)" } },
          "正在创建专家..."
        )
      ) : a.createElement(
        d,
        { gutter: [12, 12] },
        // ── Blank template card (always first) ──
        j.trim() ? null : a.createElement(
          u,
          { xs: 24, sm: 12 },
          a.createElement(
            o,
            {
              hoverable: !0,
              size: "small",
              onClick: () => G(!0),
              style: {
                cursor: "pointer",
                height: "100%",
                border: "2px dashed var(--ant-color-border, #d9d9d9)",
                background: "var(--ant-color-fill-quaternary, #fafafa)"
              }
            },
            a.createElement(
              "div",
              {
                style: {
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 10,
                  marginBottom: 8
                }
              },
              a.createElement(
                "span",
                { style: { fontSize: 28, color: "var(--ant-color-text-tertiary, #8c8c8c)" } },
                $ ? a.createElement($) : "📝"
              ),
              a.createElement(
                "div",
                { style: { flex: 1 } },
                a.createElement(
                  C,
                  { strong: !0, style: { fontSize: 15 } },
                  "从空白模版开始创建"
                ),
                a.createElement(
                  "div",
                  null,
                  a.createElement(
                    c,
                    { color: "default", style: { fontSize: 10 } },
                    "空白"
                  )
                )
              )
            ),
            a.createElement(
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
        ...K.map(
          (P) => a.createElement(
            u,
            { key: P.id, xs: 24, sm: 12 },
            a.createElement(
              o,
              {
                hoverable: !0,
                size: "small",
                onClick: () => B(P),
                style: { cursor: "pointer", height: "100%" }
              },
              a.createElement(
                "div",
                {
                  style: {
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 10,
                    marginBottom: 8
                  }
                },
                a.createElement(Ne, {
                  name: P.name,
                  size: 40
                }),
                a.createElement(
                  "div",
                  { style: { flex: 1 } },
                  a.createElement(
                    C,
                    { strong: !0, style: { fontSize: 15 } },
                    P.name
                  ),
                  a.createElement(
                    "div",
                    null,
                    a.createElement(
                      c,
                      { color: "blue", style: { fontSize: 10 } },
                      P.category
                    ),
                    P.approval_level === "MANUAL" ? a.createElement(
                      c,
                      { color: "orange", style: { fontSize: 10 } },
                      "需审批"
                    ) : null
                  )
                )
              ),
              a.createElement(
                "div",
                {
                  style: {
                    fontSize: 12,
                    color: "#595959",
                    lineHeight: 1.5
                  }
                },
                wt(P.description, a)
              )
            )
          )
        )
      )
    ),
    // ── Blank template creation modal (sibling, not nested inside Modal) ──
    a.createElement(yl, {
      open: W,
      onCancel: () => G(!1),
      onCreate: J
    })
  );
}
function lt(e) {
  return typeof e == "object" && e !== null && !Array.isArray(e);
}
function fl(e) {
  const t = e.trim();
  if (!t) return [];
  const l = JSON.parse(t);
  if (!lt(l))
    throw new Error("MCP 配置必须是 JSON 对象");
  const a = l.mcpServers ?? l;
  if (!lt(a))
    throw new Error("mcpServers 必须是 JSON 对象");
  return Object.entries(a).map(([n, r]) => {
    const o = n.trim();
    if (!o || !lt(r))
      throw new Error(`MCP「${n || "未命名"}」配置无效`);
    const c = typeof r.url == "string" ? r.url : "", i = typeof r.command == "string" ? r.command : "";
    if (!c && !i)
      throw new Error(`MCP「${o}」需要配置 url 或 command`);
    const u = (typeof r.transport == "string" ? r.transport : typeof r.type == "string" ? r.type : "") === "sse" ? "sse" : c ? "streamable_http" : "stdio";
    return {
      clientKey: o,
      client: {
        name: typeof r.name == "string" ? r.name : o,
        description: typeof r.description == "string" ? r.description : "",
        enabled: typeof r.enabled == "boolean" ? r.enabled : !0,
        transport: u,
        url: c,
        command: i,
        args: Array.isArray(r.args) ? r.args : [],
        env: lt(r.env) ? r.env : {},
        cwd: typeof r.cwd == "string" ? r.cwd : "",
        headers: lt(r.headers) ? r.headers : {}
      }
    };
  });
}
function yl({
  open: e,
  onCancel: t,
  onCreate: l
}) {
  const a = x().React, { useState: n, useEffect: r, useMemo: o } = a, {
    Modal: c,
    Input: i,
    Select: d,
    Button: u,
    Row: b,
    Col: y,
    Spin: S,
    Tag: C,
    Typography: $,
    message: w
  } = x().antd, { CheckCircleOutlined: z } = x().antdIcons || {}, { Text: j } = $, [R, W] = n(""), [G, J] = n(""), [K, B] = n(""), [P, F] = n(""), [X, k] = n([]), [E, f] = n([]), [T, v] = n(!1), [H, Z] = n(""), [L, _] = n(!1);
  r(() => {
    e && (W(""), J(""), B(""), F(""), f([]), Z(""), _(!1), v(!0), Tt(!0).then(k).catch((V) => {
      k([]), w.error(V.message || "加载技能池失败");
    }).finally(() => v(!1)));
  }, [e]);
  const m = G.trim(), te = o(() => m ? m.length < 2 || m.length > 64 ? "ID 长度需为 2-64 个字符" : /^[a-zA-Z0-9][a-zA-Z0-9_-]*[a-zA-Z0-9]$/.test(m) ? m === "default" ? "default 是系统保留 ID" : "" : "仅允许字母、数字、连字符和下划线，且不能以符号开头或结尾" : "", [m]), N = o(() => {
    try {
      return { clients: fl(H), error: "" };
    } catch (V) {
      return { clients: [], error: V.message || "MCP 配置无效" };
    }
  }, [H]), h = () => {
    const V = R.trim();
    if (!V) {
      w.warning("请输入专家名称");
      return;
    }
    if (te) {
      w.warning(te);
      return;
    }
    if (N.error) {
      w.warning(N.error);
      return;
    }
    _(!0), Promise.resolve(
      l({
        id: m,
        name: V,
        description: K.trim(),
        systemPrompt: P,
        skillNames: E,
        mcpClients: N.clients
      })
    ).finally(() => _(!1));
  }, D = () => {
    f(
      X.filter((V) => V.source === "builtin").map((V) => V.name)
    );
  }, le = (V, ee) => a.createElement(
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
    a.createElement(j, { strong: !0, style: { fontSize: 15 } }, V),
    ee ? a.createElement(j, { type: "secondary", style: { fontSize: 12 } }, ee) : null
  );
  return a.createElement(
    c,
    {
      open: e,
      title: "创建专家",
      onCancel: t,
      onOk: h,
      okText: "创建专家",
      cancelText: "取消",
      okButtonProps: { loading: L },
      maskClosable: !0,
      keyboard: !0,
      width: 880,
      styles: { body: { maxHeight: "72vh", overflowY: "auto", paddingTop: 8 } }
    },
    a.createElement(
      "div",
      { style: { paddingBottom: 20 } },
      le("基本信息", "ID 留空时自动生成"),
      a.createElement(
        b,
        { gutter: [16, 12] },
        a.createElement(
          y,
          { xs: 24, md: 12 },
          a.createElement(
            "label",
            { style: { display: "block", fontSize: 13, marginBottom: 6 } },
            "专家名称",
            a.createElement("span", { style: { color: "#ff4d4f", marginLeft: 4 } }, "*")
          ),
          a.createElement(i, {
            placeholder: "例如：合同审查专家",
            value: R,
            onChange: (V) => W(V.target.value),
            maxLength: 50
          })
        ),
        a.createElement(
          y,
          { xs: 24, md: 12 },
          a.createElement(
            "label",
            { style: { display: "block", fontSize: 13, marginBottom: 6 } },
            "智能体 ID（可选）"
          ),
          a.createElement(i, {
            placeholder: "例如：contract-reviewer",
            value: G,
            onChange: (V) => J(V.target.value),
            maxLength: 64,
            status: te ? "error" : void 0
          }),
          te ? a.createElement("div", { style: { color: "#ff4d4f", fontSize: 12, marginTop: 4 } }, te) : null
        ),
        a.createElement(
          y,
          { span: 24 },
          a.createElement(
            "label",
            { style: { display: "block", fontSize: 13, marginBottom: 6 } },
            "专家描述（可选）"
          ),
          a.createElement(i.TextArea, {
            placeholder: "简要描述该专家的职责和能力",
            value: K,
            onChange: (V) => B(V.target.value),
            rows: 2,
            maxLength: 200,
            showCount: !0
          })
        )
      )
    ),
    a.createElement(
      "div",
      { style: { borderTop: "1px solid #f0f0f0", padding: "20px 0" } },
      le("角色指令", "保存为 AGENTS.md"),
      a.createElement(i.TextArea, {
        placeholder: "定义专家的角色、目标、工作方式和输出要求；留空时将根据名称与描述生成基础指令",
        value: P,
        onChange: (V) => F(V.target.value),
        rows: 6,
        style: { fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", fontSize: 12 }
      })
    ),
    a.createElement(
      "div",
      { style: { borderTop: "1px solid #f0f0f0", paddingTop: 20 } },
      le("初始能力"),
      a.createElement(
        b,
        { gutter: [20, 16], align: "top" },
        a.createElement(
          y,
          { xs: 24, md: 12 },
          a.createElement(
            "div",
            { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 } },
            a.createElement(j, { strong: !0 }, "初始技能"),
            a.createElement(
              "div",
              { style: { display: "flex", gap: 4 } },
              a.createElement(u, { size: "small", onClick: D, disabled: T }, "内置"),
              a.createElement(u, { size: "small", onClick: () => f([]), disabled: E.length === 0 }, "清空")
            )
          ),
          T ? a.createElement("div", { style: { textAlign: "center", padding: 32 } }, a.createElement(S, { size: "small" })) : a.createElement(d, {
            mode: "multiple",
            value: E,
            onChange: f,
            placeholder: "搜索并选择技能",
            showSearch: !0,
            allowClear: !0,
            optionFilterProp: "label",
            maxTagCount: "responsive",
            style: { width: "100%" },
            options: X.map((V) => ({
              value: V.name,
              label: V.name
            })),
            notFoundContent: "暂无可用技能"
          }),
          a.createElement(
            "div",
            { style: { marginTop: 8, minHeight: 22 } },
            E.length > 0 ? a.createElement(C, { color: "blue" }, `已选择 ${E.length} 个技能`) : a.createElement(j, { type: "secondary", style: { fontSize: 12 } }, "暂不添加技能")
          )
        ),
        a.createElement(
          y,
          { xs: 24, md: 12 },
          a.createElement(j, { strong: !0, style: { display: "block", marginBottom: 8 } }, "初始 MCP"),
          a.createElement(i.TextArea, {
            placeholder: `{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem"]
    }
  }
}`,
            value: H,
            onChange: (V) => Z(V.target.value),
            rows: 8,
            status: N.error ? "error" : void 0,
            style: { fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", fontSize: 12 }
          }),
          a.createElement(
            "div",
            { style: { marginTop: 8, minHeight: 22 } },
            N.error ? a.createElement(j, { type: "danger", style: { fontSize: 12 } }, N.error) : N.clients.length > 0 ? a.createElement(
              C,
              {
                color: "green",
                icon: z ? a.createElement(z) : void 0
              },
              `已识别 ${N.clients.length} 个 MCP`
            ) : a.createElement(j, { type: "secondary", style: { fontSize: 12 } }, "暂不添加 MCP")
          )
        )
      )
    )
  );
}
const qn = "ugsci_custom_teams";
function El(e) {
  if (!e || typeof e != "object") return !1;
  const t = e;
  return typeof t.id == "string" && typeof t.name == "string" && typeof t.taskTemplate == "string" && typeof t.orchestrationPrompt == "string" && Array.isArray(t.members);
}
function rt() {
  try {
    const e = JSON.parse(
      localStorage.getItem(qn) || "[]"
    );
    return Array.isArray(e) ? e.filter(El) : [];
  } catch {
    return [];
  }
}
function Wt(e) {
  try {
    localStorage.setItem(qn, JSON.stringify(e));
  } catch {
  }
}
function hl(e) {
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
function vl(e) {
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
async function Rt(e = !0) {
  const t = await Ge("/ugsci/team/custom");
  if (!t.ok) {
    const n = await t.text().catch(() => "");
    throw new Error(n || `HTTP ${t.status}`);
  }
  const a = (await t.json()).map(vl);
  return e && Wt(a), a;
}
async function Xn(e) {
  const t = await Ge("/ugsci/team/custom", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(hl(e))
  });
  if (!t.ok) {
    const a = await t.text().catch(() => "");
    throw new Error(a || `HTTP ${t.status}`);
  }
  const l = await t.json();
  return { ...e, id: l.team_id };
}
async function bl(e) {
  const t = await Ge(
    `/ugsci/team/custom/${encodeURIComponent(e)}`,
    { method: "DELETE" }
  );
  if (!t.ok && t.status !== 404) {
    const l = await t.text().catch(() => "");
    throw new Error(l || `HTTP ${t.status}`);
  }
}
async function Sl() {
  const e = rt();
  if (e.length === 0) return;
  const t = await Rt(!1), l = new Set(t.map((a) => a.id));
  await Promise.all(
    e.filter((a) => !l.has(a.id)).map((a) => Xn(a))
  );
}
async function wl(e) {
  var n, r;
  const t = (n = e.body) == null ? void 0 : n.getReader();
  if (!t) return;
  const l = new TextDecoder();
  let a = "";
  try {
    for (; ; ) {
      const { done: o, value: c } = await t.read();
      if (o) break;
      a += l.decode(c, { stream: !0 });
      let i;
      for (; (i = a.indexOf(`

`)) >= 0; ) {
        const d = a.slice(0, i);
        a = a.slice(i + 2);
        for (const u of d.split(`
`)) {
          if (!u.startsWith("data: ")) continue;
          const b = u.slice(6);
          let y;
          try {
            y = JSON.parse(b);
          } catch {
            continue;
          }
          if (y.error) {
            const S = y.error, C = typeof S == "string" ? S : (S == null ? void 0 : S.message) || "工作流启动失败";
            throw new Error(C);
          }
          if (y.object === "response" || y.type === "response") {
            const S = y.status;
            if (S === "failed" || S === "error") {
              const C = ((r = y.error) == null ? void 0 : r.message) || "工作流启动失败";
              throw new Error(C);
            }
            return;
          }
          if (y.object === "content" || y.type === "message")
            return;
        }
      }
    }
  } finally {
    t.releaseLock();
  }
}
async function xl(e, t, l) {
  const a = `console:default:team-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, n = await Ge("/chats", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Agent-Id": e
    },
    body: JSON.stringify({
      session_id: a,
      user_id: "default",
      channel: "console",
      name: l ? `团队：${l}` : "团队任务"
    })
  });
  if (!n.ok) {
    const i = await n.text().catch(() => "");
    throw new Error(
      i || `创建会话失败 (HTTP ${n.status})`
    );
  }
  const o = (await n.json()).id, c = await Ge("/console/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Agent-Id": e
    },
    body: JSON.stringify({
      channel: "console",
      user_id: "default",
      session_id: a,
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
    const i = await c.text().catch(() => "");
    throw new Error(i || `HTTP ${c.status}`);
  }
  return await wl(c), o;
}
function Vn(e, t) {
  var n;
  const l = t.replace(/\s+/g, ""), a = e.find(
    (r) => r.name === t || r.name.replace(/\s+/g, "") === l
  );
  return a ? a.id : ((n = e.find(
    (r) => r.name.includes(t) || t.includes(r.name) || r.name.replace(/\s+/g, "").includes(l)
  )) == null ? void 0 : n.id) || null;
}
function Yn() {
  var t;
  const e = (t = window.QwenPaw) == null ? void 0 : t.host;
  if (!e) throw new Error("[ugsci] QwenPaw.host not available");
  return e;
}
async function Jt(e, t, l) {
  try {
    const a = await Ge(e, {
      headers: t ? { "X-Agent-Id": t } : void 0,
      signal: l
    });
    return a.ok ? await a.json() : null;
  } catch {
    return null;
  }
}
function kl(e, t) {
  return Jt("/ugsci/team/state", e, t);
}
async function Cl(e, t) {
  const l = await Ge("/ugsci/team/runs", {
    headers: { "X-Agent-Id": e },
    signal: t
  });
  if (!l.ok)
    throw new Error(`Failed to load team runs: ${l.status}`);
  return await l.json();
}
function Cn({ activeOnly: e = !1 }) {
  const t = Yn(), l = t.React, { useCallback: a, useEffect: n, useRef: r, useState: o } = l, { Alert: c, Button: i, Card: d, Empty: u, Spin: b, Tag: y, Typography: S } = t.antd, { Text: C, Paragraph: $ } = S, w = t.useSelectedAgent ? t.useSelectedAgent() : { id: "default" }, z = (w == null ? void 0 : w.id) || "default", [j, R] = o([]), [W, G] = o(!0), [J, K] = o(!1), B = r(null), P = r(0), F = a(async () => {
    var f;
    (f = B.current) == null || f.abort();
    const k = new AbortController();
    B.current = k;
    const E = ++P.current;
    G(!0);
    try {
      const T = await Cl(z, k.signal);
      if (k.signal.aborted || E !== P.current) return;
      R(T), K(!1);
    } catch {
      if (k.signal.aborted || E !== P.current) return;
      K(!0);
    } finally {
      !k.signal.aborted && E === P.current && G(!1);
    }
  }, [z]);
  if (n(() => (F(), () => {
    var k;
    (k = B.current) == null || k.abort(), P.current += 1;
  }), [F]), W) return l.createElement(b);
  if (J)
    return l.createElement(c, {
      type: "warning",
      message: "讨论运行记录加载失败",
      action: l.createElement(i, { size: "small", onClick: () => void F() }, "重试")
    });
  const X = j.filter(
    (k) => e ? k.status === "active" : k.status !== "active"
  );
  return X.length === 0 ? l.createElement(u, {
    description: e ? "暂无进行中的专家团讨论" : "暂无历史讨论"
  }) : l.createElement(
    "div",
    { style: { display: "flex", flexDirection: "column", gap: 8 } },
    ...X.map(
      (k) => l.createElement(
        d,
        { key: k.instance_id, size: "small" },
        l.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 8 } },
          l.createElement(C, { strong: !0 }, k.team_name || k.team_id),
          l.createElement(y, { color: k.status === "completed" ? "green" : k.status === "terminated" ? "orange" : "blue" }, k.status),
          l.createElement(y, null, k.current_phase),
          l.createElement(C, { type: "secondary" }, `迭代 ${k.iteration}`)
        ),
        l.createElement($, { ellipsis: { rows: 2 }, style: { margin: "8px 0 0" } }, k.task || "暂无任务描述")
      )
    )
  );
}
async function Tl() {
  const e = await Jt(
    "/ugsci/team/preset-teams"
  );
  return (e == null ? void 0 : e.teams) ?? null;
}
async function _l() {
  const e = await Jt(
    "/ugsci/team/roles"
  );
  return (e == null ? void 0 : e.roles) ?? null;
}
const Il = {
  plan: { label: "规划", color: "#1677ff", icon: "📋" },
  dispatch: { label: "分派", color: "#13c2c2", icon: "🚀" },
  verify: { label: "验证", color: "#fa8c16", icon: "🔍" },
  synthesize: { label: "综合", color: "#722ed1", icon: "📊" },
  completed: { label: "完成", color: "#52c41a", icon: "✅" }
}, Tn = [
  "plan",
  "dispatch",
  "verify",
  "synthesize",
  "completed"
], zl = 3;
function Al() {
  const e = Yn(), t = e.React, { useState: l, useEffect: a, useCallback: n, useRef: r } = t, { Card: o, Tag: c, Typography: i, Button: d, Steps: u, Empty: b, Alert: y } = e.antd, { ReloadOutlined: S } = e.antdIcons || {}, { Text: C, Paragraph: $ } = i, w = e.useSelectedAgent ? e.useSelectedAgent() : { id: "default" }, z = (w == null ? void 0 : w.id) || "default", [j, R] = l(null), [W, G] = l(!1), J = r(null), K = r(0), B = r(0), P = r(null), F = n(
    async (m) => {
      var D;
      (D = P.current) == null || D.abort();
      const te = new AbortController();
      P.current = te;
      const N = ++B.current;
      m && G(!0);
      const h = await kl(z, te.signal);
      te.signal.aborted || N !== B.current || (h ? (K.current = 0, J.current = h, R(h)) : K.current += 1, G(!1));
    },
    [z]
  ), X = n(() => F(!0), [F]);
  if (a(() => {
    var te;
    (te = P.current) == null || te.abort(), B.current += 1, K.current = 0, J.current = null, R(null), X();
    const m = window.setInterval(() => {
      var N, h;
      K.current >= zl || ((N = J.current) == null ? void 0 : N.status) === "completed" || ((h = J.current) == null ? void 0 : h.status) === "terminated" || F(!1);
    }, 5e3);
    return () => {
      var N;
      window.clearInterval(m), (N = P.current) == null || N.abort(), B.current += 1;
    };
  }, [z, F, X]), (j == null ? void 0 : j.status) === "unreadable")
    return t.createElement(y, {
      type: "warning",
      showIcon: !0,
      message: "专家团状态暂时无法读取",
      description: `实例 ${j.instance_id || "未知"} 的状态文件需要检查。`,
      style: { marginBottom: 16 },
      action: t.createElement(
        d,
        { size: "small", onClick: X, loading: W },
        "重试"
      )
    });
  if (!j || !j.active) {
    if ((j == null ? void 0 : j.status) === "completed" || (j == null ? void 0 : j.status) === "terminated") {
      const m = j.status === "completed";
      return t.createElement(y, {
        type: m ? "success" : "info",
        showIcon: !0,
        message: m ? "专家团工作流已完成" : "专家团工作流已终止",
        description: m ? `实例 ${j.instance_id || "未知"} 已完成，结果文件保留在工作区。` : `原因：${j.state.termination_reason || "未知"}`,
        style: { marginBottom: 16 }
      });
    }
    return t.createElement(b, {
      description: "暂无活跃的专家团工作流",
      style: { padding: 24 }
    });
  }
  const k = j.state, E = k.current_phase || "plan", f = Tn.indexOf(E), T = k.team_name || "未知团队", v = k.team_mode || "pipeline", H = k.iteration || 0, Z = k.members || [], L = k.verify_retries || 0, _ = {
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
        t.createElement(C, { strong: !0 }, `${T} — 工作流状态`),
        t.createElement(
          c,
          { color: "blue", style: { fontSize: 10 } },
          _[v] || v
        ),
        t.createElement(
          c,
          { style: { fontSize: 10 } },
          `迭代 ${H}`
        ),
        L > 0 ? t.createElement(
          c,
          { color: "orange", style: { fontSize: 10 } },
          `验证重试 ${L}`
        ) : null
      ),
      extra: t.createElement(
        d,
        {
          size: "small",
          type: "text",
          icon: S ? t.createElement(S) : void 0,
          onClick: X,
          loading: W
        },
        "刷新"
      )
    },
    t.createElement(u, {
      current: f,
      size: "small",
      items: Tn.map((m) => {
        const te = Il[m];
        return {
          title: `${te.icon} ${te.label}`,
          description: m === "plan" ? "分析任务，创建任务分解" : m === "dispatch" ? "分派专家执行任务" : m === "verify" ? "交叉验证专家结果" : m === "synthesize" ? "综合形成最终报告" : "工作流完成"
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
        (m, te) => t.createElement(
          c,
          { key: `${m.name}-${te}`, style: { fontSize: 11 } },
          `${m.emoji || ""} ${m.name}（${m.role}）`
        )
      )
    ),
    k.task ? t.createElement(
      $,
      {
        style: {
          fontSize: 12,
          marginTop: 8,
          marginBottom: 0,
          color: "var(--ant-color-text-secondary, #666)"
        },
        ellipsis: { rows: 2 }
      },
      `任务: ${k.task}`
    ) : null
  );
}
function Pl({ team: e }) {
  const t = x().React, { Typography: l, Tag: a } = x().antd, { Text: n } = l, r = {
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
  }, c = e.steps || [], i = e.mode === "roundtable" || e.mode === "router", d = {
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
          flexDirection: i ? "row" : "column",
          gap: 8,
          alignItems: i ? "flex-start" : "stretch",
          flexWrap: "wrap"
        }
      },
      ...c.length > 0 ? c.map((u, b) => [
        b > 0 && !i ? t.createElement(
          "div",
          {
            key: `arrow-${b}`,
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
            key: `step-${b}`,
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
          t.createElement(Ne, {
            name: u.agentName,
            size: 24
          }),
          t.createElement(
            "div",
            null,
            t.createElement(
              n,
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
              a,
              {
                ...u.passContext ? { color: "blue" } : {},
                style: { fontSize: 9, marginTop: 2 }
              },
              u.passContext ? "传递上下文" : "独立"
            )
          )
        )
      ]).flat() : e.members.map((u, b) => [
        b > 0 && !i ? t.createElement(
          "div",
          {
            key: `arrow-${b}`,
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
            key: `member-${b}`,
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
          t.createElement(Ne, {
            name: u.name,
            size: 24
          }),
          t.createElement(
            "div",
            null,
            t.createElement(
              n,
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
function pt(e) {
  const t = e.replace(/\s+/g, "").toLowerCase();
  return t.includes("测井") ? "log-analyst" : t.includes("地球物理") ? "geophysicist" : t.includes("油藏") ? "reservoir-engineer" : t.includes("钻井") ? "drilling-engineer" : t.includes("采油") || t.includes("生产") ? "production-engineer" : t.includes("pvt") || t.includes("物性") ? "pvt-analyst" : t.includes("审核") || t.includes("verifier") ? "domain-reviewer" : t.includes("master") || t.includes("planner") ? "planner" : "analyst";
}
const $l = [
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
function Ol({
  open: e,
  onClose: t,
  agents: l,
  editingTeam: a,
  onSaved: n
}) {
  const r = x().React, { useState: o, useEffect: c, useCallback: i } = r, {
    Modal: d,
    Input: u,
    Button: b,
    Select: y,
    Tag: S,
    Typography: C,
    Switch: $,
    Empty: w,
    message: z,
    Divider: j,
    Steps: R
  } = x().antd, { PlusOutlined: W, DeleteOutlined: G, SaveOutlined: J, ArrowRightOutlined: K } = x().antdIcons || {}, { Text: B, Paragraph: P } = C, [F, X] = o(""), [k, E] = o("🤝"), [f, T] = o(""), [v, H] = o("pipeline"), [Z, L] = o(""), [_, m] = o(""), [te, N] = o([]), [h, D] = o([]), [le, V] = o(!1), [ee, ge] = o(2), [I, re] = o(""), [ue, oe] = o(""), [ae, ye] = o({}), [Ee, xe] = o({}), [Ae, ve] = o(
    $l
  ), Q = [
    { value: "pipeline", icon: "→", title: "顺序交接", description: "上一步产物成为下一位专家的上下文", topology: "A → B → C", accent: "#08979c" },
    { value: "roundtable", icon: "⇉", title: "并行汇聚", description: "独立并行分析，避免观点相互污染", topology: "A ∥ B ∥ C → 汇总", accent: "#531dab" },
    { value: "coordinator", icon: "◎", title: "主管协作", description: "主控专家拆解任务并按需组织成员", topology: "主管 → 专家组", accent: "#0958d9" },
    { value: "router", icon: "◇", title: "智能路由", description: "按任务能力需求选择最小充分专家集合", topology: "任务 → 路由 → 子集", accent: "#d46b08" },
    { value: "review_loop", icon: "↻", title: "评审迭代", description: "产出、独立审查、修订，直到满足标准", topology: "执行 ⇄ 评审", accent: "#389e0d" },
    { value: "debate", icon: "⚖", title: "多方论证", description: "独立立场、交叉质询，再由裁决者综合", topology: "观点 ⇄ 反驳 → 裁决", accent: "#c41d7f" }
  ];
  c(() => {
    e && (a ? (X(a.name), E(a.emoji), T(a.description), H(a.mode), L(a.coordinatorName || ""), m(a.taskTemplate), N(a.steps || []), D(a.members.map((g) => g.name)), ge(a.maxReviewRounds || 2), re(a.successCriteria || ""), oe(a.routingInstruction || ""), ye(
      Object.fromEntries(
        a.members.map((g) => [
          g.name,
          g.bindingMode || (g.agentId ? "fixed" : "preferred")
        ])
      )
    ), xe(
      Object.fromEntries(
        a.members.map((g) => [
          g.name,
          g.roleKey || pt(g.name)
        ])
      )
    )) : (X(""), E("🤝"), T(""), H("pipeline"), L(""), m(`请执行以下任务：
任务描述：{任务描述}`), N([]), D([]), ge(2), re(""), oe(""), ye({}), xe({})));
  }, [e, a]), c(() => {
    e && _l().then((g) => {
      g != null && g.length && ve(g);
    });
  }, [e]);
  const be = i(() => {
    if (v === "roundtable" || v === "debate" || v === "router") {
      const g = h.map((de) => ({
        agentName: de,
        instruction: "请给出你的专业评估意见",
        passContext: !1
      }));
      N(g);
    } else if (v === "pipeline") {
      const g = new Map(te.map((M) => [M.agentName, M])), de = h.map((M) => g.get(M) || {
        agentName: M,
        instruction: "请完成你的专业部分",
        passContext: !0
      });
      N(de);
    }
  }, [v, h, te]), fe = (g) => {
    h.includes(g) || (D([...h, g]), ye({ ...ae, [g]: "fixed" }), xe({
      ...Ee,
      [g]: pt(g)
    }), (v === "coordinator" || v === "debate") && !Z && L(g));
  }, q = (g) => {
    const de = h.filter((ne) => ne !== g);
    D(de), N(te.filter((ne) => ne.agentName !== g));
    const M = { ...ae };
    delete M[g], ye(M);
    const p = { ...Ee };
    delete p[g], xe(p), Z === g && L(de[0] || "");
  }, ce = (g, de, M) => {
    const p = [...te];
    p[g] = { ...p[g], [de]: M }, N(p);
  }, pe = async () => {
    if (!F.trim()) {
      z.warning("请输入团队名称");
      return;
    }
    if (h.length < 2) {
      z.warning("至少需要选择 2 个成员");
      return;
    }
    if (!_.trim()) {
      z.warning("请输入任务模板");
      return;
    }
    if ((v === "coordinator" || v === "debate") && !Z) {
      z.warning(v === "debate" ? "请选择裁决者" : "请选择主控专家");
      return;
    }
    V(!0);
    try {
      let g = [...h];
      v === "coordinator" && Z ? g = [Z, ...g.filter((ke) => ke !== Z)] : v === "debate" && Z && (g = [...g.filter((ke) => ke !== Z), Z]);
      const de = g.map(
        (ke) => {
          var Me;
          const Oe = l.find((Se) => Se.name === ke), Re = ae[ke] || "fixed", je = Ee[ke] || pt(ke), Ue = Ae.find((Se) => Se.key === je);
          return {
            name: ke,
            role: (Ue == null ? void 0 : Ue.display_name) || ((Me = Oe == null ? void 0 : Oe.description) == null ? void 0 : Me.slice(0, 30)) || "需求分析师",
            emoji: "",
            agentId: Re === "temporary" || Oe == null ? void 0 : Oe.id,
            roleKey: je,
            bindingMode: Re
          };
        }
      );
      let M = te;
      (te.length === 0 || te.length !== h.length) && (M = h.map((ke) => ({
        agentName: ke,
        instruction: "请完成你的专业部分",
        passContext: v === "pipeline"
      })));
      const p = {
        id: (a == null ? void 0 : a.id) || `custom-${Date.now()}`,
        name: F.trim(),
        emoji: k,
        category: "自定义",
        description: f.trim() || `${F.trim()}（${h.length}人团队）`,
        mode: v,
        members: de,
        coordinatorName: v === "coordinator" || v === "debate" ? Z : void 0,
        taskTemplate: _.trim(),
        orchestrationPrompt: "",
        // Custom teams use steps-based instructions
        steps: M,
        custom: !0,
        createdAt: (a == null ? void 0 : a.createdAt) || Date.now(),
        maxReviewRounds: ee,
        successCriteria: I.trim(),
        routingInstruction: ue.trim()
      }, ne = await Xn(p), ie = rt(), Te = ie.findIndex((ke) => ke.id === ne.id);
      Te >= 0 ? ie[Te] = ne : ie.push(ne), Wt(ie), z.success(a ? "团队已更新" : "团队已创建"), n(), t();
    } catch (g) {
      z.error(g.message || "保存失败");
    } finally {
      V(!1);
    }
  }, U = l.filter(
    (g) => !h.includes(g.name)
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
          a ? "✏️" : "➕"
        ),
        r.createElement(
          "span",
          null,
          a ? "编辑专家团" : "创建专家团"
        )
      ),
      width: 860,
      onOk: pe,
      okText: "保存专家团",
      confirmLoading: le,
      okButtonProps: {
        icon: J ? r.createElement(J) : void 0
      }
    },
    // Step 1: Basic info
    r.createElement(
      "div",
      { style: { marginBottom: 16 } },
      r.createElement(
        B,
        {
          strong: !0,
          style: { display: "block", marginBottom: 8, fontSize: 13 }
        },
        "1. 定义任务工作流"
      ),
      r.createElement(
        "div",
        { style: { display: "flex", gap: 8, marginBottom: 8, alignItems: "center" } },
        h.length > 0 ? r.createElement(Ht, {
          members: h,
          size: 36
        }) : null,
        r.createElement(u, {
          placeholder: "专家团名称（如：储层评价与质量复核专家团）",
          value: F,
          onChange: (g) => X(g.target.value),
          style: { flex: 1 }
        })
      ),
      r.createElement(u.TextArea, {
        placeholder: "说明这个工作流解决什么问题、适用于什么场景",
        value: f,
        onChange: (g) => T(g.target.value),
        rows: 2,
        style: { marginBottom: 8 }
      }),
      r.createElement(
        B,
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
        ...Q.map((g) => {
          const de = v === g.value;
          return r.createElement(
            "button",
            {
              key: g.value,
              type: "button",
              onClick: () => {
                H(g.value), g.value !== "coordinator" && g.value !== "debate" && L("");
              },
              style: {
                textAlign: "left",
                padding: 10,
                borderRadius: 8,
                cursor: "pointer",
                background: de ? `${g.accent}0d` : "var(--ant-color-bg-container, #fff)",
                border: `1px solid ${de ? g.accent : "var(--ant-color-border, #d9d9d9)"}`,
                boxShadow: de ? `0 0 0 2px ${g.accent}1a` : "none"
              }
            },
            r.createElement(
              "div",
              { style: { display: "flex", alignItems: "center", gap: 7, color: g.accent, fontWeight: 600 } },
              r.createElement("span", { style: { fontSize: 18 } }, g.icon),
              g.title
            ),
            r.createElement("div", { style: { fontSize: 11, color: "#595959", marginTop: 5, lineHeight: 1.45 } }, g.description),
            r.createElement("div", { style: { fontSize: 10, color: g.accent, marginTop: 5, fontFamily: "monospace" } }, g.topology)
          );
        })
      )
    ),
    r.createElement(j, { style: { margin: "12px 0" } }),
    // Step 2: Select members
    r.createElement(
      "div",
      { style: { marginBottom: 16 } },
      r.createElement(
        B,
        {
          strong: !0,
          style: { display: "block", marginBottom: 8, fontSize: 13 }
        },
        "2. 配置专家角色"
      ),
      // Available agents
      U.length > 0 ? r.createElement(
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
        ...U.map(
          (g) => r.createElement(
            b,
            {
              key: g.id,
              size: "small",
              icon: W ? r.createElement(W) : void 0,
              onClick: () => fe(g.name)
            },
            g.name
          )
        )
      ) : null,
      // Selected members
      h.length === 0 ? r.createElement(w, {
        description: "请从上方添加团队成员",
        image: w.PRESENTED_IMAGE_SIMPLE
      }) : r.createElement(
        "div",
        { style: { display: "flex", flexDirection: "column", gap: 4 } },
        ...h.map(
          (g) => r.createElement(
            "div",
            {
              key: g,
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
              r.createElement(Ne, { name: g, size: 24 }),
              r.createElement(
                B,
                { strong: !0, style: { fontSize: 13 } },
                g
              ),
              (v === "coordinator" || v === "debate") && Z === g ? r.createElement(
                S,
                { color: "blue", style: { fontSize: 10 } },
                v === "debate" ? "裁决者" : "主控"
              ) : null
            ),
            r.createElement(
              "div",
              { style: { display: "flex", gap: 4 } },
              r.createElement(y, {
                size: "small",
                value: Ee[g] || pt(g),
                style: { width: 132 },
                onChange: (de) => xe({ ...Ee, [g]: de }),
                options: Ae.map((de) => ({
                  value: de.key,
                  label: de.display_name
                }))
              }),
              r.createElement(y, {
                size: "small",
                value: ae[g] || "fixed",
                style: { width: 118 },
                onChange: (de) => ye({ ...ae, [g]: de }),
                options: [
                  { value: "fixed", label: "固定实例" },
                  { value: "preferred", label: "优先实例" },
                  { value: "temporary", label: "临时派生" }
                ]
              }),
              v === "coordinator" || v === "debate" ? r.createElement(
                b,
                {
                  size: "small",
                  type: "link",
                  onClick: () => L(g)
                },
                v === "debate" ? "设为裁决者" : "设为主控"
              ) : null,
              r.createElement(
                b,
                {
                  size: "small",
                  type: "link",
                  danger: !0,
                  icon: G ? r.createElement(G) : void 0,
                  onClick: () => q(g)
                },
                "移除"
              )
            )
          )
        )
      )
    ),
    v === "review_loop" || v === "router" ? r.createElement(
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
      v === "review_loop" ? r.createElement(
        "div",
        { style: { display: "grid", gridTemplateColumns: "150px 1fr", gap: 10 } },
        r.createElement(y, {
          value: ee,
          onChange: (g) => ge(g),
          options: [1, 2, 3, 4, 5].map((g) => ({ value: g, label: `最多 ${g} 轮` }))
        }),
        r.createElement(u, {
          value: I,
          onChange: (g) => re(g.target.value),
          placeholder: "验收标准，例如：关键结论均有数据依据，且无高风险缺陷"
        })
      ) : r.createElement(u, {
        value: ue,
        onChange: (g) => oe(g.target.value),
        placeholder: "路由偏好，例如：仅调用任务必需的专家；涉及模拟时优先油藏工程师"
      })
    ) : null,
    r.createElement(j, { style: { margin: "12px 0" } }),
    // Step 3: Define execution steps (for pipeline/roundtable)
    h.length > 0 ? r.createElement(
      "div",
      { style: { marginBottom: 16 } },
      r.createElement(
        B,
        {
          strong: !0,
          style: { display: "block", marginBottom: 8, fontSize: 13 }
        },
        `3. 配置专家任务${v === "roundtable" ? "（并行独立）" : v === "pipeline" ? "（顺序交接）" : v === "router" ? "（作为候选能力）" : v === "review_loop" ? "（首位执行、末位评审）" : v === "debate" ? "（末位为裁决者）" : "（由主控动态编排）"}`
      ),
      // Auto-sync button
      r.createElement(
        b,
        {
          size: "small",
          type: "dashed",
          onClick: be,
          style: { marginBottom: 8 }
        },
        "自动生成步骤"
      ),
      // Steps list
      te.length === 0 ? r.createElement(
        B,
        { type: "secondary", style: { fontSize: 12 } },
        "点击「自动生成步骤」或手动配置每步的指令"
      ) : r.createElement(
        "div",
        { style: { display: "flex", flexDirection: "column", gap: 6 } },
        ...te.map(
          (g, de) => r.createElement(
            "div",
            {
              key: de,
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
              v === "pipeline" ? r.createElement(
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
                `${de + 1}`
              ) : r.createElement(
                "span",
                { style: { fontSize: 14 } },
                "🔀"
              ),
              r.createElement(
                S,
                { color: "blue", style: { fontSize: 11 } },
                g.agentName
              ),
              r.createElement(
                "div",
                { style: { flex: 1 } },
                r.createElement(u, {
                  placeholder: "请输入该步骤的指令...",
                  value: g.instruction,
                  onChange: (M) => ce(de, "instruction", M.target.value),
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
              r.createElement($, {
                size: "small",
                checked: g.passContext,
                onChange: (M) => ce(de, "passContext", M)
              }),
              r.createElement(
                B,
                { type: "secondary", style: { fontSize: 11 } },
                g.passContext ? "传递上一步结果作为上下文" : "独立执行"
              )
            )
          )
        )
      )
    ) : null,
    r.createElement(j, { style: { margin: "12px 0" } }),
    // Step 4: Task template
    r.createElement(
      "div",
      null,
      r.createElement(
        B,
        {
          strong: !0,
          style: { display: "block", marginBottom: 8, fontSize: 13 }
        },
        `${h.length > 0 ? "4" : "3"}. 任务模板`
      ),
      r.createElement(u.TextArea, {
        placeholder: `输入任务模板，可用 {参数名} 作为占位符...

例如：
请对区块 {区块名} 的井 {井号} 进行储层评价`,
        value: _,
        onChange: (g) => m(g.target.value),
        rows: 4,
        style: { fontFamily: "monospace", fontSize: 13 }
      }),
      r.createElement(
        B,
        {
          type: "secondary",
          style: { fontSize: 11, display: "block", marginTop: 4 }
        },
        "占位符 {参数名} 在发起任务时可由用户填写替换"
      )
    )
  );
}
function _n({
  team: e,
  agents: t,
  onLaunch: l,
  onEdit: a,
  onDelete: n
}) {
  var E;
  const r = x().React, { useState: o } = r, { Card: c, Tag: i, Typography: d, Button: u, Tooltip: b, Popconfirm: y } = x().antd, {
    TeamOutlined: S,
    RocketOutlined: C,
    UserOutlined: $,
    EditOutlined: w,
    DeleteOutlined: z,
    DownOutlined: j,
    UpOutlined: R
  } = x().antdIcons || {}, { Text: W, Paragraph: G } = d, [J, K] = o(!1), B = {
    coordinator: { label: "主管协作", color: "blue" },
    pipeline: { label: "顺序交接", color: "cyan" },
    roundtable: { label: "并行汇聚", color: "purple" },
    router: { label: "智能路由", color: "orange" },
    review_loop: { label: "评审迭代", color: "green" },
    debate: { label: "多方论证", color: "magenta" }
  }, P = B[e.mode] || B.coordinator, F = e.members.map((f) => {
    const T = f.bindingMode === "temporary", v = T ? null : (f.agentId && t.some((H) => H.id === f.agentId) ? f.agentId : null) || Vn(t, f.name);
    return { ...f, found: !!v, agentId: v, temporary: T };
  }), X = F.filter((f) => f.found).length, k = e.coordinatorName || ((E = e.members[0]) == null ? void 0 : E.name);
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
      r.createElement(Ht, {
        members: e.members.map((f) => f.name),
        size: 36
      }),
      r.createElement(
        "div",
        { style: { flex: 1 } },
        r.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 6 } },
          r.createElement(
            W,
            { strong: !0, style: { fontSize: 14 } },
            e.name
          ),
          e.custom ? r.createElement(
            i,
            { color: "gold", style: { fontSize: 9 } },
            "自定义"
          ) : null
        ),
        r.createElement(
          "div",
          { style: { display: "flex", gap: 4, marginTop: 4 } },
          r.createElement(
            i,
            { color: P.color, style: { fontSize: 10 } },
            P.label
          ),
          r.createElement(
            i,
            { color: "green", style: { fontSize: 10 } },
            `${e.members.length} 位专家`
          ),
          X < e.members.length ? r.createElement(
            b,
            {
              title: `OMP 架构下，未创建的专家将通过 spawn_subagent 自动派发，
控制器会根据角色 prompt 创建子 agent 执行任务。`
            },
            r.createElement(
              i,
              { color: "blue", style: { fontSize: 10 } },
              "OMP 自动派发"
            )
          ) : r.createElement(
            i,
            { color: "green", style: { fontSize: 10 } },
            "全部就绪"
          )
        )
      ),
      // Edit/delete for custom teams
      e.custom ? r.createElement(
        "div",
        { style: { display: "flex", gap: 2 } },
        a ? r.createElement(
          b,
          { title: "编辑" },
          r.createElement(u, {
            type: "text",
            size: "small",
            icon: w ? r.createElement(w) : void 0,
            onClick: (f) => {
              f.stopPropagation(), a(e);
            }
          })
        ) : null,
        n ? r.createElement(
          b,
          { title: "删除" },
          r.createElement(
            y,
            {
              title: `删除专家团「${e.name}」？`,
              description: "此操作会删除后端定义，但不会删除既有讨论记录。",
              okText: "删除",
              cancelText: "取消",
              okButtonProps: { danger: !0 },
              onConfirm: () => n(e)
            },
            r.createElement(u, {
              type: "text",
              size: "small",
              danger: !0,
              icon: z ? r.createElement(z) : void 0,
              onClick: (f) => f.stopPropagation()
            })
          )
        ) : null
      ) : null
    ),
    // Description
    r.createElement(
      G,
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
      ...F.map(
        (f) => r.createElement(
          b,
          {
            key: f.name,
            title: `${f.name}（${f.role}）${f.temporary ? " - OMP 临时派生" : f.found ? " - 已绑定实例" : " - OMP 按角色派发"}`
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
                background: f.found ? "#f0f5ff" : "#f0f0ff",
                border: `1px solid ${f.found ? "#d6e4ff" : "#d3adf7"}`,
                fontSize: 11
              }
            },
            r.createElement(Ne, { name: f.name, size: 18 }),
            r.createElement(
              W,
              {
                style: { fontSize: 11, color: f.found ? "#1f4e8c" : "#531dab" }
              },
              f.name
            ),
            f.temporary ? r.createElement(
              i,
              { color: "purple", style: { fontSize: 9, marginInlineEnd: 0 } },
              "派生"
            ) : null
          )
        )
      )
    ),
    // Toggle flow diagram
    r.createElement(
      u,
      {
        type: "link",
        size: "small",
        style: { padding: "0 0 4px 0", fontSize: 11, height: "auto" },
        onClick: (f) => {
          f.stopPropagation(), K(!J);
        },
        icon: J ? R ? r.createElement(R) : "▲" : j ? r.createElement(j) : "▼"
      },
      J ? "收起流程" : "查看执行流程"
    ),
    J ? r.createElement(Pl, { team: e }) : null,
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
        W,
        { type: "secondary", style: { fontSize: 11 } },
        k ? `${e.mode === "debate" ? "裁决者" : "主控"}: ${k}` : "OMP 动态编排"
      ),
      r.createElement(
        u,
        {
          type: "primary",
          size: "small",
          icon: C ? r.createElement(C) : void 0,
          disabled: t.length === 0,
          onClick: () => l(e),
          style: Le
        },
        "运行工作流"
      )
    )
  );
}
function Rl({
  agents: e,
  onLaunch: t
}) {
  const l = x().React, { useMemo: a, useState: n, useCallback: r, useEffect: o } = l, {
    Row: c,
    Col: i,
    Input: d,
    Empty: u,
    Typography: b,
    Tag: y,
    Button: S,
    Divider: C,
    Tabs: $,
    message: w
  } = x().antd, { SearchOutlined: z, PlusOutlined: j, RocketOutlined: R } = x().antdIcons || {}, { Text: W } = b, [G, J] = n(""), [K, B] = n([]), [P, F] = n([]), [X, k] = n(!1), [E, f] = n(null);
  o(() => {
    B(rt());
    let N = !0;
    return (async () => {
      try {
        await Sl();
        const h = await Rt();
        N && B(h);
      } catch (h) {
        console.warn("[ugsci] Failed to load backend expert teams:", h), N && w.warning("专家团后端同步失败，当前显示本地缓存");
      }
    })(), Tl().then((h) => {
      N && h && F(h);
    }), () => {
      N = !1;
    };
  }, []);
  const T = r(() => {
    Rt().then(B).catch((N) => {
      console.warn("[ugsci] Failed to refresh expert teams:", N), B(rt());
    });
  }, []), v = r(
    (N) => {
      bl(N.id).then(() => {
        const D = rt().filter((le) => le.id !== N.id);
        Wt(D), B(D), w.success(`团队「${N.name}」已删除`);
      }).catch((h) => w.error(h.message || "删除专家团失败"));
    },
    [w]
  ), H = r((N) => {
    f(N), k(!0);
  }, []), Z = r(() => {
    f(null), k(!0);
  }, []), L = a(() => [...K, ...P], [K, P]), _ = a(() => {
    if (!G.trim()) return L;
    const N = G.toLowerCase();
    return L.filter(
      (h) => h.name.toLowerCase().includes(N) || h.description.toLowerCase().includes(N) || h.category.toLowerCase().includes(N)
    );
  }, [L, G]), m = _.filter((N) => N.custom), te = _.filter((N) => !N.custom);
  return l.createElement(
    "div",
    null,
    // Toolbar
    l.createElement(
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
      l.createElement(d, {
        placeholder: "搜索团队名称、描述或类别...",
        prefix: z ? l.createElement(z) : void 0,
        value: G,
        onChange: (N) => J(N.target.value),
        allowClear: !0,
        style: { flex: "1 1 280px", maxWidth: 400 }
      }),
      l.createElement(
        S,
        {
          type: "primary",
          size: "small",
          icon: j ? l.createElement(j) : void 0,
          onClick: Z,
          style: Le
        },
        "创建专家团"
      )
    ),
    // Tabs: preset teams vs custom teams
    l.createElement(
      $,
      {
        defaultActiveKey: "preset",
        items: [
          {
            key: "preset",
            label: `预设团队${te.length ? ` (${te.length})` : ""}`,
            children: l.createElement(
              "div",
              null,
              te.length > 0 ? l.createElement(
                c,
                { gutter: [12, 12] },
                ...te.map(
                  (N) => l.createElement(
                    i,
                    { key: N.id, xs: 24, sm: 12, md: 8 },
                    l.createElement(_n, {
                      team: N,
                      agents: e,
                      onLaunch: t
                    })
                  )
                )
              ) : l.createElement(u, {
                description: "未找到匹配的预设团队",
                image: u.PRESENTED_IMAGE_SIMPLE
              })
            )
          },
          {
            key: "custom",
            label: `自定义团队${m.length ? ` (${m.length})` : ""}`,
            children: l.createElement(
              "div",
              null,
              m.length > 0 ? l.createElement(
                c,
                { gutter: [12, 12] },
                ...m.map(
                  (N) => l.createElement(
                    i,
                    { key: N.id, xs: 24, sm: 12, md: 8 },
                    l.createElement(_n, {
                      team: N,
                      agents: e,
                      onLaunch: t,
                      onEdit: H,
                      onDelete: v
                    })
                  )
                )
              ) : l.createElement(u, {
                description: "暂无自定义团队，点击「创建专家团」自定义",
                image: u.PRESENTED_IMAGE_SIMPLE
              })
            )
          },
          {
            key: "active",
            label: "进行中的讨论",
            children: l.createElement(
              l.Fragment,
              null,
              l.createElement(Al),
              l.createElement(Cn, { activeOnly: !0 })
            )
          },
          {
            key: "history",
            label: "讨论历史",
            children: l.createElement(Cn)
          }
        ]
      }
    ),
    // Team Builder Modal
    l.createElement(Ol, {
      open: X,
      onClose: () => {
        k(!1), f(null);
      },
      agents: e,
      editingTeam: E,
      onSaved: T
    })
  );
}
const Ml = [
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
], Ll = 5e3, Bl = {
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
function jl(e) {
  window.history.pushState({}, "", e), window.dispatchEvent(new PopStateEvent("popstate"));
}
function Ot(e, t) {
  const l = new URLSearchParams();
  e && l.set("flow", e), t && l.set("run", t), jl(`/flowforge${l.size ? `?${l.toString()}` : ""}`);
}
function Ul(e) {
  return e ? new Date(e * 1e3).toLocaleString("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  }) : "—";
}
function Nl(e) {
  if (!e || e <= 0) return "—";
  if (e < 1e3) return `${e}ms`;
  const t = Math.floor(e / 1e3);
  if (t < 60) return `${t}s`;
  const l = Math.floor(t / 60), a = t % 60;
  return `${l}m${a}s`;
}
function Dl(e) {
  if (!e) return "";
  const t = Object.keys(e).length;
  if (t === 0) return "";
  const l = Object.values(e).filter(
    (n) => n === "success" || n === "completed" || n === "skipped" || n === "cached"
  ).length, a = Object.values(e).filter(
    (n) => n === "error" || n === "failed"
  ).length;
  return a > 0 ? `${l}/${t} 节点完成 (${a} 失败)` : `${l}/${t} 节点完成`;
}
const gt = /* @__PURE__ */ new Set(["running", "queued", "paused", "waiting_human"]);
function Fl() {
  const e = x().React, { useCallback: t, useEffect: l, useRef: a, useState: n } = e, {
    Alert: r,
    Button: o,
    Card: c,
    Col: i,
    Empty: d,
    Input: u,
    Popconfirm: b,
    Row: y,
    Space: S,
    Spin: C,
    Tabs: $,
    Tag: w,
    Tooltip: z,
    Typography: j,
    message: R
  } = x().antd, {
    ApartmentOutlined: W,
    DeleteOutlined: G,
    ReloadOutlined: J,
    RocketOutlined: K,
    PlayCircleOutlined: B,
    StopOutlined: P
  } = x().antdIcons || {}, { Text: F, Paragraph: X, Title: k } = j, E = x().useSelectedAgent, f = E ? E() : { id: "default" }, T = (f == null ? void 0 : f.id) || "default", [v, H] = n([]), [Z, L] = n([]), [_, m] = n([]), [te, N] = n(!0), [h, D] = n(!0), [le, V] = n(null), [ee, ge] = n(""), [I, re] = n(""), [ue, oe] = n("templates"), [ae, ye] = n(/* @__PURE__ */ new Set()), Ee = a(null), xe = Z.some((p) => gt.has(p.status)), Ae = e.useMemo(() => {
    const p = {};
    return v.forEach((ne) => {
      p[ne.id] = ne.name;
    }), p;
  }, [v]), ve = e.useMemo(() => {
    const p = {};
    return Z.forEach((ne) => {
      gt.has(ne.status) && (p[ne.flow_id] = (p[ne.flow_id] || 0) + 1);
    }), p;
  }, [Z]), Q = t(async (p = !1) => {
    p || N(!0);
    try {
      const [ne, ie, Te] = await Promise.all([
        se("/flowforge/flows", { bypassCache: !0 }),
        se("/flowforge/runs", { bypassCache: !0 }),
        kt().catch(() => [])
      ]);
      H(ne), L(ie), m(Te), D(!0);
    } catch (ne) {
      console.warn("[ugsci] FlowForge is unavailable:", ne), D(!1);
    } finally {
      p || N(!1);
    }
  }, []);
  l(() => {
    Q();
  }, [Q]), l(() => {
    if (!h || !xe) {
      Ee.current && (clearTimeout(Ee.current), Ee.current = null);
      return;
    }
    return Ee.current = setTimeout(() => {
      Q(!0);
    }, Ll), () => {
      Ee.current && (clearTimeout(Ee.current), Ee.current = null);
    };
  }, [xe, h, Q]);
  const be = t(
    async (p) => {
      if (!le) {
        V(p.key);
        try {
          const ne = await se(
            "/flowforge/generate",
            {
              method: "POST",
              body: JSON.stringify({
                prompt: p.sop,
                name: p.name,
                agent_id: T
              })
            }
          ), ie = {
            ...ne.nodes || {}
          }, Te = Object.entries(ie).filter(([Me]) => /^step_\d+$/.test(Me)).sort(([Me], [Se]) => Number(Me.slice(5)) - Number(Se.slice(5))), ke = {};
          let Oe = 0, Re = 0;
          Te.forEach(([Me, Se], $e) => {
            const Y = p.roleHints[$e] || "", _e = p.roleKeys[$e] || "analyst", Ie = _.find(
              (Fe) => `${Fe.name} ${Fe.id}`.toLowerCase().includes(Y.toLowerCase())
            );
            Ie ? Oe++ : Re++;
            const Pe = (Ie == null ? void 0 : Ie.id) || T, De = { ...Se.inputs || {} };
            De.agent_id = Pe, ie[Me] = {
              ...Se,
              inputs: De,
              metadata: {
                ...Se.metadata || {},
                binding_policy: "fixed_instance",
                role_hint: Y,
                role_key: _e,
                agent_id: Pe
              }
            }, ke[Me] = {
              binding_policy: "fixed_instance",
              role_hint: Y,
              role_key: _e,
              agent_id: Pe
            };
          });
          const je = {
            ...ne,
            nodes: ie,
            id: `${p.key}-${Date.now()}`,
            name: p.name,
            description: p.description,
            metadata: {
              ...ne.metadata || {},
              domain: "oil-gas",
              template_key: p.key,
              expert_binding_policy: "fixed_instance",
              controller_agent_id: T,
              node_bindings: ke
            }
          };
          await se("/flowforge/flows", {
            method: "POST",
            body: JSON.stringify(je)
          });
          const Ue = Te.length > 0 ? `（${Oe} 个专家已匹配，${Re} 个回退到控制器）` : "";
          R.success(`已创建工作流草稿「${p.name}」${Ue}`), await Q();
        } catch (ne) {
          R.error(ne.message || "创建工作流失败");
        } finally {
          V(null);
        }
      }
    },
    [_, T, le, Q, R]
  ), fe = t(async () => {
    if (!le) {
      if (!I.trim()) {
        R.warning("请先描述工作流步骤和控制要求");
        return;
      }
      V("natural-language");
      try {
        const p = await se(
          "/flowforge/generate",
          {
            method: "POST",
            body: JSON.stringify({
              prompt: I.trim(),
              name: ee.trim(),
              agent_id: T
            })
          }
        ), ne = {
          ...p,
          id: `natural-${Date.now()}`,
          metadata: {
            ...p.metadata || {},
            domain: "oil-gas",
            source: "natural-language",
            expert_binding_policy: "fixed_instance",
            controller_agent_id: T
          }
        };
        await se("/flowforge/flows", {
          method: "POST",
          body: JSON.stringify(ne)
        }), R.success("已从自然语言生成可编辑工作流草稿"), ge(""), re(""), await Q();
      } catch (p) {
        R.error(p.message || "自然语言生成失败");
      } finally {
        V(null);
      }
    }
  }, [T, le, Q, R, ee, I]), q = t(
    async (p, ne) => {
      try {
        await se(`/flowforge/flows/${encodeURIComponent(p)}/run`, {
          method: "POST",
          body: JSON.stringify({ inputs: {} })
        }), R.success(`已启动工作流「${ne}」`), await Q(!0);
      } catch (ie) {
        R.error(ie.message || "启动工作流失败");
      }
    },
    [Q, R]
  ), ce = t(
    async (p, ne) => {
      try {
        await se(`/flowforge/flows/${encodeURIComponent(p)}`, {
          method: "DELETE"
        }), R.success(`已删除工作流「${ne}」`), await Q();
      } catch (ie) {
        R.error(ie.message || "删除工作流失败");
      }
    },
    [Q, R]
  ), pe = t(
    async (p) => {
      ye((ne) => {
        const ie = new Set(ne);
        return ie.add(p), ie;
      });
      try {
        await se(`/flowforge/runs/${encodeURIComponent(p)}/cancel`, {
          method: "POST"
        }), R.success("已请求取消运行"), await Q(!0);
      } catch (ne) {
        R.error(ne.message || "取消运行失败");
      } finally {
        ye((ne) => {
          const ie = new Set(ne);
          return ie.delete(p), ie;
        });
      }
    },
    [Q, R]
  ), U = e.createElement(
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
        S,
        { direction: "vertical", style: { width: "100%" }, size: 10 },
        e.createElement(u, {
          value: ee,
          onChange: (p) => ge(p.target.value),
          placeholder: "工作流名称（可选）",
          maxLength: 80
        }),
        e.createElement(u.TextArea, {
          value: I,
          onChange: (p) => re(p.target.value),
          placeholder: "例如：先检查某储气库本周期压力和注采量数据，再由油藏工程师预测下周期能力，由独立完整性专家复核风险，最后形成带证据和不确定性的建议。",
          autoSize: { minRows: 3, maxRows: 8 }
        }),
        e.createElement(
          o,
          {
            type: "primary",
            onClick: () => void fe(),
            loading: le === "natural-language",
            disabled: !h || !!le,
            style: Le
          },
          "生成可编辑草稿"
        )
      )
    ),
    e.createElement(
      y,
      { gutter: [12, 12] },
      ...Ml.map(
        (p) => e.createElement(
          i,
          { key: p.key, xs: 24, md: 8 },
          e.createElement(
            c,
            { style: { height: "100%" } },
            e.createElement(
              S,
              { align: "start", style: { width: "100%" } },
              e.createElement("span", { style: { fontSize: 28 } }, p.icon),
              e.createElement(
                "div",
                { style: { flex: 1 } },
                e.createElement(k, { level: 5, style: { margin: 0 } }, p.name),
                e.createElement(w, { color: "blue", style: { marginTop: 6 } }, p.category),
                e.createElement(
                  X,
                  { type: "secondary", style: { margin: "10px 0 14px" } },
                  p.description
                ),
                e.createElement(
                  o,
                  {
                    type: "primary",
                    loading: le === p.key,
                    disabled: !h || !!le,
                    onClick: () => void be(p),
                    style: Le
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
        y,
        { gutter: [12, 12] },
        ...[
          ["固定实例", "生产关键节点使用指定且已验证的专家实例", "当前可执行"],
          ["优先实例", "定义中记录首选实例和治理降级策略", "规划中"],
          ["模板派生", "由 OMP 控制节点按角色模板临时创建隔离角色", "规划中"],
          ["动态路由", "按能力、健康、权限和成本选择实例", "规划中"]
        ].map(
          ([p, ne, ie]) => e.createElement(
            i,
            { key: p, xs: 24, sm: 12, lg: 6 },
            e.createElement(F, { strong: !0 }, p),
            e.createElement(
              w,
              {
                color: ie === "当前可执行" ? "green" : "default",
                style: { marginLeft: 6, fontSize: 10 }
              },
              ie
            ),
            e.createElement("div", { style: { color: "var(--ant-color-text-tertiary, #8c8c8c)", fontSize: 12, marginTop: 4 } }, ne)
          )
        )
      )
    )
  ), g = te ? e.createElement(C) : v.length === 0 ? e.createElement(d, { description: "暂无工作流，可从模板创建" }) : e.createElement(
    y,
    { gutter: [12, 12] },
    ...v.map((p) => {
      const ne = ve[p.id] || 0;
      return e.createElement(
        i,
        { key: p.id, xs: 24, md: 12, xl: 8 },
        e.createElement(
          c,
          {
            size: "small",
            title: e.createElement(
              S,
              { size: 6 },
              e.createElement("span", null, p.name),
              ne > 0 ? e.createElement(
                w,
                { color: "blue" },
                `${ne} 个运行中`
              ) : null
            ),
            extra: e.createElement(w, null, `v${p.version}`)
          },
          e.createElement(X, { ellipsis: { rows: 2 } }, p.description || "暂无描述"),
          e.createElement(
            S,
            { size: 8, wrap: !0 },
            e.createElement(w, { color: "geekblue" }, `${p.node_count} 个节点`),
            e.createElement(o, {
              size: "small",
              type: "primary",
              icon: B ? e.createElement(B) : void 0,
              disabled: !h,
              onClick: () => void q(p.id, p.name)
            }, "运行"),
            e.createElement(o, {
              size: "small",
              onClick: () => Ot(p.id)
            }, "编辑"),
            e.createElement(
              b,
              {
                title: "确认删除",
                description: `确定要删除工作流「${p.name}」吗？此操作不可撤销。`,
                onConfirm: () => void ce(p.id, p.name),
                okText: "删除",
                cancelText: "取消",
                okButtonProps: { danger: !0 }
              },
              e.createElement(o, {
                size: "small",
                danger: !0,
                icon: G ? e.createElement(G) : void 0
              }, "删除")
            )
          )
        )
      );
    })
  ), de = te ? e.createElement(C) : Z.length === 0 ? e.createElement(d, { description: "暂无工作流运行记录" }) : e.createElement(
    "div",
    { style: { display: "flex", flexDirection: "column", gap: 8 } },
    ...Z.map((p) => {
      const ne = Ae[p.flow_id] || p.flow_id, ie = gt.has(p.status), Te = Dl(p.node_statuses), ke = p.duration_ms && p.duration_ms > 0 ? p.duration_ms : p.finished_at && p.started_at ? (p.finished_at - p.started_at) * 1e3 : ie && p.started_at ? (Date.now() / 1e3 - p.started_at) * 1e3 : 0;
      return e.createElement(
        c,
        { key: p.run_id, size: "small" },
        e.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" } },
          e.createElement(
            w,
            { color: Bl[p.status] || "default" },
            p.status
          ),
          e.createElement(F, { strong: !0 }, ne),
          e.createElement(
            z,
            { title: p.run_id },
            e.createElement(
              F,
              { type: "secondary", style: { fontFamily: "monospace", fontSize: 11 } },
              p.run_id.slice(0, 8) + "…"
            )
          ),
          e.createElement(
            F,
            { type: "secondary", style: { fontSize: 12 } },
            Ul(p.started_at)
          ),
          ke > 0 ? e.createElement(
            F,
            { type: "secondary", style: { fontSize: 12 } },
            `耗时 ${Nl(ke)}`
          ) : null,
          Te ? e.createElement(w, { color: "geekblue", style: { fontSize: 11 } }, Te) : null,
          p.error ? e.createElement(
            z,
            { title: p.error },
            e.createElement(F, { type: "danger", style: { fontSize: 12 } }, "（有错误）")
          ) : null,
          e.createElement(
            "div",
            { style: { marginLeft: "auto", display: "flex", gap: 6 } },
            ie ? e.createElement(
              b,
              {
                title: "确认取消运行？",
                onConfirm: () => void pe(p.run_id),
                okText: "取消运行",
                cancelText: "保留",
                okButtonProps: { danger: !0 }
              },
              e.createElement(o, {
                size: "small",
                danger: !0,
                loading: ae.has(p.run_id),
                icon: P ? e.createElement(P) : void 0
              }, "取消运行")
            ) : null,
            e.createElement(
              o,
              { size: "small", type: "link", onClick: () => Ot(void 0, p.run_id) },
              "查看详情"
            )
          )
        )
      );
    })
  ), M = e.createElement(
    S,
    null,
    e.createElement(o, {
      icon: J ? e.createElement(J) : void 0,
      onClick: () => void Q(),
      loading: te
    }, "刷新"),
    ue !== "templates" ? e.createElement(o, {
      type: "primary",
      icon: W ? e.createElement(W) : K ? e.createElement(K) : void 0,
      onClick: () => Ot(),
      disabled: !h,
      style: Le
    }, "打开流程编辑器") : null
  );
  return e.createElement(
    "div",
    null,
    h ? null : e.createElement(r, {
      type: "warning",
      message: "FlowForge 引擎未启动",
      description: "协作工作流功能需要 FlowForge 后端引擎支持。请检查后端是否正常运行，或联系管理员。",
      showIcon: !0,
      style: { marginBottom: 16 }
    }),
    e.createElement($, {
      items: [
        { key: "templates", label: "工作流模板", children: U },
        { key: "mine", label: `我的工作流 (${v.length})`, children: g },
        {
          key: "runs",
          label: e.createElement(
            "span",
            null,
            "运行中心 (",
            Z.length,
            xe ? e.createElement(
              "span",
              { style: { color: "#1677ff", marginLeft: 2 } },
              `·${Z.filter((p) => gt.has(p.status)).length} 活跃`
            ) : null,
            ")"
          ),
          children: de
        }
      ],
      activeKey: ue,
      onChange: (p) => oe(p),
      tabBarExtraContent: M
    })
  );
}
function In(e, t) {
  var n, r;
  const l = e.coordinatorName || ((n = e.members[0]) == null ? void 0 : n.name), a = e.members.find((o) => o.name === l) || e.members[0];
  if ((a == null ? void 0 : a.bindingMode) !== "temporary" && (a != null && a.agentId) && t.some((o) => o.id === a.agentId))
    return a.agentId;
  if (l && (a == null ? void 0 : a.bindingMode) !== "temporary") {
    const o = Vn(t, l);
    if (o) return o;
  }
  return (a == null ? void 0 : a.bindingMode) === "fixed" ? null : ((r = t[0]) == null ? void 0 : r.id) || null;
}
function zn() {
  const e = new URLSearchParams(window.location.search).get("section");
  return e === "teams" || e === "workflows" ? e : "experts";
}
function Gl() {
  var ce, pe;
  const e = x().React, { useState: t, useEffect: l, useCallback: a, useMemo: n } = e, {
    Spin: r,
    Empty: o,
    Input: c,
    Button: i,
    message: d,
    Row: u,
    Col: b,
    Tabs: y,
    Modal: S,
    Typography: C
  } = x().antd, {
    ReloadOutlined: $,
    PlusOutlined: w,
    SearchOutlined: z,
    TeamOutlined: j,
    UserOutlined: R
  } = x().antdIcons || {}, { Text: W, Paragraph: G } = C, [J, K] = t([]), [B, P] = t(!0), [F, X] = t(!1), [k, E] = t(null), [f, T] = t(""), [v, H] = t(!1), [Z, L] = t(zn), [_, m] = t(
    null
  ), [te, N] = t(""), [h, D] = t(!1), [le, V] = t(!1), [ee, ge] = t(null), [I, re] = t([]), ue = a(async () => {
    P(!0);
    try {
      const U = await kt(), g = await Promise.all(
        U.map(async (de) => {
          try {
            const [M, p, ne] = await Promise.all([
              Ut(de.id).catch(() => null),
              Ct(de.id).catch(() => []),
              Ft(de.id).catch(() => [])
            ]);
            return {
              agent: de,
              config: M,
              skills: p,
              mcps: ne,
              loading: !1
            };
          } catch {
            return {
              agent: de,
              config: null,
              skills: [],
              mcps: [],
              loading: !1
            };
          }
        })
      );
      K(g), re(U);
    } catch (U) {
      d.error(U.message || "加载专家列表失败"), K([]);
    } finally {
      P(!1);
    }
  }, []);
  l(() => {
    ue();
  }, [ue]), l(() => {
    const U = () => L(zn());
    return window.addEventListener("popstate", U), () => window.removeEventListener("popstate", U);
  }, []), l(() => {
    if (ee && le) {
      const U = J.find(
        (g) => g.agent.id === ee.agent.id
      );
      U && U !== ee && ge(U);
    }
  }, [J, ee, le]);
  const oe = a(
    async (U) => {
      var p;
      const g = U.coordinatorName || ((p = U.members[0]) == null ? void 0 : p.name), de = In(U, I);
      if (!de) {
        const ne = U.members.find(
          (ie) => ie.name === g
        );
        d.error(
          (ne == null ? void 0 : ne.bindingMode) === "fixed" ? `固定协调者「${g || "协调者"}」当前不可用，请修复绑定后再运行` : "没有可用的 Agent 作为工作流控制器"
        );
        return;
      }
      if (/\{.+?\}/.test(U.taskTemplate)) {
        N(U.taskTemplate), m(U);
        return;
      }
      await ae(U, de, U.taskTemplate);
    },
    [I, d]
  ), ae = a(
    async (U, g, de) => {
      D(!0);
      try {
        const M = de || U.taskTemplate, p = U.custom ? `@${U.id}` : U.name, ne = `/ugsci-team ${U.mode} ${p} ${M}`, ie = x();
        ie.setSelectedAgent && ie.setSelectedAgent(g);
        const Te = await xl(
          g,
          ne,
          U.name
        );
        d.success(
          `OMP 工作流已启动：${U.name}（${U.mode}模式）`
        ), m(null), ye(`/chat/${Te}`);
      } catch (M) {
        d.error(M.message || "发起团队任务失败");
      } finally {
        D(!1);
      }
    },
    [d]
  ), ye = (U) => {
    window.history.pushState({}, "", U), window.dispatchEvent(new PopStateEvent("popstate"));
  }, Ee = a((U) => {
    E(U), X(!0);
  }, []), xe = a((U) => {
    ge(U), V(!0);
  }, []), Ae = a(
    (U) => {
      if (!U.agent.enabled) {
        d.warning(`专家「${U.agent.name}」未启用，请先启用`);
        return;
      }
      try {
        const g = x();
        g.setSelectedAgent && g.setSelectedAgent(U.agent.id);
      } catch (g) {
        console.warn("[ugsci] Failed to set selected agent:", g);
      }
      d.success(`已召唤专家「${U.agent.name}」，正在跳转至对话...`), ye("/chat");
    },
    [d]
  ), ve = n(() => {
    if (!f.trim()) return J;
    const U = f.toLowerCase();
    return J.filter(
      (g) => {
        var de;
        return g.agent.name.toLowerCase().includes(U) || ((de = g.agent.description) == null ? void 0 : de.toLowerCase().includes(U)) || g.agent.id.toLowerCase().includes(U) || g.skills.some((M) => M.name.toLowerCase().includes(U));
      }
    );
  }, [J, f]), Q = J.filter((U) => U.agent.enabled).length, be = J.reduce(
    (U, g) => U + g.skills.filter((de) => de.enabled !== !1).length,
    0
  ), fe = J.reduce((U, g) => U + g.mcps.length, 0), q = [
    {
      key: "experts",
      label: e.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        R ? e.createElement(R, { style: { fontSize: 14 } }) : null,
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
            prefix: z ? e.createElement(z) : void 0,
            value: f,
            onChange: (U) => T(U.target.value),
            allowClear: !0,
            style: { flex: "1 1 280px", maxWidth: 400 }
          }),
          e.createElement(
            i,
            {
              type: "primary",
              icon: w ? e.createElement(w) : void 0,
              onClick: () => H(!0),
              style: Le
            },
            "创建专家"
          )
        ),
        // Content
        B ? e.createElement(
          "div",
          { style: { textAlign: "center", padding: 60 } },
          e.createElement(r, { size: "large" })
        ) : ve.length === 0 ? e.createElement(o, {
          description: f ? "未找到匹配的专家" : "暂无专家，点击「创建专家」添加"
        }) : e.createElement(
          u,
          { gutter: [12, 12], align: "stretch" },
          ...ve.map(
            (U) => e.createElement(
              b,
              {
                key: U.agent.id,
                xs: 24,
                sm: 12,
                md: 8,
                lg: 6,
                style: { display: "flex" }
              },
              e.createElement(ul, {
                expert: U,
                onClick: () => Ee(U),
                onSummon: () => Ae(U),
                onConfigure: () => xe(U)
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
        j ? e.createElement(j, { style: { fontSize: 14 } }) : null,
        "专家团"
      ),
      children: e.createElement(Rl, {
        agents: I,
        onLaunch: oe
      })
    },
    {
      key: "workflows",
      label: e.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        (ce = x().antdIcons) != null && ce.ApartmentOutlined ? e.createElement(x().antdIcons.ApartmentOutlined, {
          style: { fontSize: 14 }
        }) : null,
        "协作工作流"
      ),
      children: e.createElement(Fl)
    }
  ];
  return e.createElement(
    "div",
    { style: { padding: 24 } },
    e.createElement(xt, {
      title: "专家·协作",
      subtitle: Z === "experts" ? `共 ${J.length} 位专家（${Q} 位启用）· ${be} 个技能 · ${fe} 个 MCP 客户端` : Z === "teams" ? "开放式多专家讨论、联合研判与 OMP 动态协作" : "流程化、可观测、可验证的油气与储气库协作流程",
      extra: e.createElement(
        e.Fragment,
        null,
        Z === "experts" ? e.createElement(
          i,
          {
            icon: $ ? e.createElement($) : void 0,
            onClick: () => {
              st(), ue();
            },
            loading: B
          },
          "刷新"
        ) : null
      )
    }),
    e.createElement(y, {
      items: q,
      activeKey: Z,
      onChange: (U) => {
        L(U);
        const g = new URL(window.location.href);
        U === "experts" ? g.searchParams.delete("section") : g.searchParams.set("section", U), window.history.pushState({}, "", `${g.pathname}${g.search}`);
      }
    }),
    // Drawer
    e.createElement(pl, {
      expert: k,
      open: F,
      onClose: () => X(!1),
      onRefresh: () => ue()
    }),
    // Template Modal
    e.createElement(gl, {
      open: v,
      onClose: () => H(!1),
      onCreated: () => ue()
    }),
    // Config Modal (gear icon)
    e.createElement(cl, {
      expert: ee,
      open: le,
      onClose: () => V(!1),
      onRefresh: () => ue()
    }),
    // Team Launch Modal (for filling placeholders)
    _ ? e.createElement(
      S,
      {
        open: !0,
        title: e.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 8 } },
          e.createElement(Ht, {
            members: _.members.map((U) => U.name),
            size: 28
          }),
          e.createElement(
            "span",
            null,
            `发起团队任务 - ${_.name}`
          )
        ),
        onCancel: () => m(null),
        onOk: () => {
          const U = In(
            _,
            I
          );
          if (!U) {
            d.error("固定协调者不可用或没有可用的控制器 Agent");
            return;
          }
          const g = te.trim() || _.taskTemplate;
          ae(_, U, g);
        },
        confirmLoading: h,
        okText: "发起任务",
        width: 600
      },
      e.createElement(
        "div",
        null,
        e.createElement(
          W,
          {
            type: "secondary",
            style: { fontSize: 12, display: "block", marginBottom: 8 }
          },
          "任务内容（请替换 {参数名} 等占位符后发起）："
        ),
        e.createElement(c.TextArea, {
          value: te,
          onChange: (U) => N(U.target.value),
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
          W,
          { style: { fontSize: 12, color: "#0958d9" } },
          `协调者: ${_.coordinatorName || ((pe = _.members[0]) == null ? void 0 : pe.name) || "—"} · 成员: ${_.members.map((U) => U.name).join("、")}`
        )
      )
    ) : null
  );
}
function Hl({
  agentId: e,
  agentName: t,
  refreshKey: l = 0,
  onNavigate: a
}) {
  const n = x().React, { useState: r, useEffect: o, useCallback: c } = n, {
    Spin: i,
    Empty: d,
    Button: u,
    Row: b,
    Col: y,
    Card: S,
    Tag: C,
    Checkbox: $,
    Modal: w,
    Typography: z,
    Drawer: j,
    Descriptions: R,
    message: W
  } = x().antd, {
    ReloadOutlined: G,
    ThunderboltOutlined: J,
    SettingOutlined: K,
    CheckSquareOutlined: B,
    EyeOutlined: P,
    EyeInvisibleOutlined: F,
    DeleteOutlined: X,
    CloseOutlined: k
  } = x().antdIcons || {}, { Text: E, Paragraph: f } = z, [T, v] = r([]), [H, Z] = r(!0), [L, _] = r(!1), [m, te] = r(null), [N, h] = r(!1), [D, le] = r(
    /* @__PURE__ */ new Set()
  ), [V, ee] = r(!1), [ge, I] = r(null), [re, ue] = r(!1), oe = c(async () => {
    if (e) {
      Z(!0);
      try {
        const q = await Ct(e);
        v(q);
      } catch (q) {
        W.error(q.message || "加载技能失败"), v([]);
      } finally {
        Z(!1);
      }
    }
  }, [e]);
  o(() => {
    oe();
  }, [oe, l]);
  const ae = (q) => {
    le((ce) => {
      const pe = new Set(ce);
      return pe.has(q) ? pe.delete(q) : pe.add(q), pe;
    });
  }, ye = () => le(/* @__PURE__ */ new Set()), Ee = () => le(new Set(T.map((q) => q.name))), xe = () => {
    N ? (ye(), h(!1)) : h(!0);
  }, Ae = async () => {
    const q = Array.from(D);
    if (q.length !== 0) {
      ee(!0);
      try {
        const { results: ce } = await Da(e, q), pe = Object.entries(ce).filter(
          ([, g]) => g.success === !1
        ), U = q.length - pe.length;
        pe.length > 0 ? W.warning(
          `批量启用完成：成功 ${U} 个，失败 ${pe.length} 个`
        ) : W.success(`成功启用 ${q.length} 个技能`), ye(), await oe();
      } catch (ce) {
        W.error(ce.message || "批量启用失败");
      } finally {
        ee(!1);
      }
    }
  }, ve = async () => {
    const q = Array.from(D);
    if (q.length !== 0) {
      ee(!0);
      try {
        const { results: ce } = await Fa(e, q), pe = Object.entries(ce).filter(
          ([, g]) => g.success === !1
        ), U = q.length - pe.length;
        pe.length > 0 ? W.warning(
          `批量停用完成：成功 ${U} 个，失败 ${pe.length} 个`
        ) : W.success(`成功停用 ${q.length} 个技能`), ye(), await oe();
      } catch (ce) {
        W.error(ce.message || "批量停用失败");
      } finally {
        ee(!1);
      }
    }
  }, Q = () => {
    const q = Array.from(D);
    q.length !== 0 && w.confirm({
      title: `确认删除 ${q.length} 个技能？`,
      content: "删除后技能将从当前专家工作区移除，此操作不可撤销。技能池中的原始技能不受影响。",
      okText: "确认删除",
      cancelText: "取消",
      okButtonProps: { danger: !0 },
      onOk: async () => {
        ee(!0);
        try {
          const { results: ce } = await Ga(e, q), pe = Object.entries(ce).filter(
            ([, g]) => g.success === !1
          ), U = q.length - pe.length;
          pe.length > 0 ? W.warning(
            `批量删除完成：成功 ${U} 个，失败 ${pe.length} 个`
          ) : W.success(`成功删除 ${q.length} 个技能`), ye(), await oe();
        } catch (ce) {
          W.error(ce.message || "批量删除失败");
        } finally {
          ee(!1);
        }
      }
    });
  }, be = async (q) => {
    ue(!0);
    try {
      q.enabled === !1 ? (await Nn(e, q.name), W.success(`已启用技能「${q.name}」`)) : (await Fn(e, q.name), W.success(`已禁用技能「${q.name}」`)), await oe();
    } catch (ce) {
      W.error(ce.message || "操作失败");
    } finally {
      ue(!1);
    }
  }, fe = (q) => {
    w.confirm({
      title: `确认删除技能「${q.name}」？`,
      content: "删除后技能将从当前专家工作区移除，此操作不可撤销。技能池中的原始技能不受影响。",
      okText: "确认删除",
      cancelText: "取消",
      okButtonProps: { danger: !0 },
      onOk: async () => {
        ue(!0);
        try {
          await Dt(e, q.name), W.success(`已删除技能「${q.name}」`), await oe();
        } catch (ce) {
          W.error(ce.message || "删除失败");
        } finally {
          ue(!1);
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
        E,
        { type: "secondary", style: { fontSize: 13 } },
        N ? `已选择 ${D.size} / ${T.length} 个技能` : `共 ${T.length} 个技能`
      ),
      n.createElement(
        "div",
        { style: { display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" } },
        N ? n.createElement(
          n.Fragment,
          null,
          n.createElement(
            u,
            { size: "small", onClick: Ee },
            "全选"
          ),
          n.createElement(
            u,
            {
              size: "small",
              icon: k ? n.createElement(k) : void 0,
              onClick: ye
            },
            "取消选择"
          ),
          n.createElement(
            u,
            {
              size: "small",
              type: "default",
              icon: P ? n.createElement(P) : void 0,
              disabled: D.size === 0 || V,
              loading: V,
              onClick: Ae
            },
            "批量启用"
          ),
          n.createElement(
            u,
            {
              size: "small",
              danger: !0,
              icon: F ? n.createElement(F) : void 0,
              disabled: D.size === 0 || V,
              loading: V,
              onClick: ve
            },
            "批量停用"
          ),
          n.createElement(
            u,
            {
              size: "small",
              danger: !0,
              icon: X ? n.createElement(X) : void 0,
              disabled: D.size === 0 || V,
              loading: V,
              onClick: Q
            },
            `删除 (${D.size})`
          ),
          n.createElement(
            u,
            {
              size: "small",
              type: "primary",
              onClick: xe
            },
            "退出批量"
          )
        ) : n.createElement(
          n.Fragment,
          null,
          n.createElement(
            u,
            {
              size: "small",
              icon: B ? n.createElement(B) : void 0,
              onClick: xe,
              disabled: T.length === 0
            },
            "批量管理"
          ),
          n.createElement(
            u,
            {
              icon: G ? n.createElement(G) : void 0,
              onClick: () => {
                st(), oe();
              }
            },
            "刷新"
          )
        )
      )
    ),
    H ? n.createElement(
      "div",
      { style: { textAlign: "center", padding: 60 } },
      n.createElement(i, { size: "large" })
    ) : T.length === 0 ? n.createElement(d, {
      description: "当前智能体未加载任何技能"
    }) : n.createElement(
      b,
      { gutter: [12, 12] },
      ...T.map(
        (q) => n.createElement(
          y,
          { key: q.name, xs: 24, sm: 12, md: 8, lg: 6 },
          n.createElement(
            S,
            {
              hoverable: !0,
              size: "small",
              style: {
                cursor: N ? "default" : "pointer",
                height: "100%",
                position: "relative",
                borderColor: N && D.has(q.name) ? "#0072f5" : void 0,
                borderWidth: N && D.has(q.name) ? 2 : 1
              },
              onClick: () => {
                N ? ae(q.name) : (te(q), _(!0));
              },
              onMouseEnter: () => {
                N || I(q.name);
              },
              onMouseLeave: () => I(null)
            },
            N ? n.createElement(
              "div",
              {
                style: {
                  position: "absolute",
                  top: 8,
                  right: 8,
                  zIndex: 1
                },
                onClick: (ce) => {
                  ce.stopPropagation(), ae(q.name);
                }
              },
              n.createElement($, {
                checked: D.has(q.name)
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
              q.emoji ? n.createElement(
                "span",
                { style: { fontSize: 18 } },
                q.emoji
              ) : n.createElement(
                "span",
                { style: { fontSize: 18 } },
                "⚡"
              ),
              n.createElement(
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
                q.name
              ),
              q.enabled === !1 ? n.createElement(
                C,
                { color: "default", style: { fontSize: 10 } },
                "已禁用"
              ) : n.createElement(
                C,
                { color: "green", style: { fontSize: 10 } },
                "已启用"
              )
            ),
            q.description ? n.createElement(
              f,
              {
                type: "secondary",
                style: { fontSize: 11, margin: 0, lineHeight: 1.4 },
                ellipsis: { rows: 2 }
              },
              q.description
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
              q.version_text ? n.createElement(
                C,
                { style: { fontSize: 10 } },
                `v${q.version_text}`
              ) : null,
              ...(q.tags || []).slice(0, 3).map(
                (ce, pe) => n.createElement(
                  C,
                  { key: pe, color: "blue", style: { fontSize: 10 } },
                  ce
                )
              )
            ),
            // Hover action footer (not in batch mode)
            !N && ge === q.name ? n.createElement(
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
              n.createElement(
                u,
                {
                  size: "small",
                  type: "default",
                  icon: q.enabled === !1 ? P ? n.createElement(P) : void 0 : F ? n.createElement(F) : void 0,
                  disabled: re,
                  onClick: (ce) => {
                    ce.stopPropagation(), be(q);
                  }
                },
                q.enabled === !1 ? "启用" : "禁用"
              ),
              n.createElement(
                u,
                {
                  size: "small",
                  danger: !0,
                  icon: X ? n.createElement(X) : void 0,
                  disabled: re,
                  onClick: (ce) => {
                    ce.stopPropagation(), fe(q);
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
    m ? n.createElement(
      j,
      {
        title: n.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 8 } },
          n.createElement(
            "span",
            { style: { fontSize: 18 } },
            m.emoji || "⚡"
          ),
          n.createElement("span", null, m.name)
        ),
        open: L,
        onClose: () => _(!1),
        width: 520,
        extra: n.createElement(
          u,
          {
            type: "primary",
            size: "small",
            icon: K ? n.createElement(K) : void 0,
            onClick: () => a("/skills")
          },
          "管理技能"
        )
      },
      n.createElement(
        R,
        { column: 1, bordered: !0, size: "small" },
        n.createElement(
          R.Item,
          { label: "技能名称" },
          m.name
        ),
        n.createElement(
          R.Item,
          { label: "描述" },
          m.description || "-"
        ),
        m.version_text ? n.createElement(
          R.Item,
          { label: "版本" },
          m.version_text
        ) : null,
        n.createElement(
          R.Item,
          { label: "来源" },
          m.source || "-"
        ),
        n.createElement(
          R.Item,
          { label: "状态" },
          m.enabled === !1 ? "已禁用" : "已启用"
        ),
        m.installed_from ? n.createElement(
          R.Item,
          { label: "安装来源" },
          m.installed_from
        ) : null
      ),
      // Tags
      m.tags && m.tags.length > 0 ? n.createElement(
        "div",
        { style: { marginTop: 16 } },
        n.createElement(
          E,
          {
            strong: !0,
            style: { display: "block", marginBottom: 8 }
          },
          "标签"
        ),
        n.createElement(
          "div",
          { style: { display: "flex", flexWrap: "wrap", gap: 4 } },
          ...m.tags.map(
            (q, ce) => n.createElement(C, { key: ce, color: "blue" }, q)
          )
        )
      ) : null,
      // Skill content preview
      m.content ? n.createElement(
        "div",
        { style: { marginTop: 16 } },
        n.createElement(
          E,
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
          m.content.slice(0, 2e3) + (m.content.length > 2e3 ? `

... (内容已截断)` : "")
        )
      ) : null
    ) : null
  );
}
function Wl({
  poolSkills: e,
  workspaceSkills: t,
  agents: l,
  loading: a,
  onReload: n,
  onSkillInstalled: r,
  agentId: o,
  agentName: c
}) {
  const i = x().React, { useState: d, useMemo: u, useCallback: b, useEffect: y, useRef: S } = i, {
    Spin: C,
    Empty: $,
    Input: w,
    Button: z,
    Row: j,
    Col: R,
    Card: W,
    Tag: G,
    Typography: J,
    Drawer: K,
    Descriptions: B,
    List: P,
    Modal: F,
    message: X
  } = x().antd, {
    ReloadOutlined: k,
    SearchOutlined: E,
    DownloadOutlined: f,
    ThunderboltOutlined: T,
    DeleteOutlined: v,
    PlusOutlined: H
  } = x().antdIcons || {}, { Text: Z, Paragraph: L } = J, [_, m] = d(""), [te, N] = d(!1), [h, D] = d(null), [le, V] = d([]), [ee, ge] = d(!1), [I, re] = d(24), [ue, oe] = d(null), [ae, ye] = d(!1), Ee = S(0), xe = S(null), Ae = u(
    () => {
      var M;
      return new Set(
        ((M = t.find((p) => p.agent_id === o)) == null ? void 0 : M.skills.map((p) => p.name)) || []
      );
    },
    [t, o]
  ), ve = u(() => {
    if (!_.trim()) return e;
    const M = _.toLowerCase();
    return e.filter(
      (p) => {
        var ne, ie;
        return p.name.toLowerCase().includes(M) || ((ne = p.description) == null ? void 0 : ne.toLowerCase().includes(M)) || ((ie = p.tags) == null ? void 0 : ie.some((Te) => Te.toLowerCase().includes(M)));
      }
    );
  }, [e, _]), Q = u(
    () => ve.slice(0, I),
    [ve, I]
  );
  y(() => {
    if (Q.length >= ve.length) return;
    const M = xe.current;
    if (!M) return;
    const p = () => {
      re(
        (ie) => Math.min(ie + 24, ve.length)
      );
    };
    if (typeof IntersectionObserver < "u") {
      const ie = new IntersectionObserver(
        (Te) => {
          Te.some((ke) => ke.isIntersecting) && p();
        },
        { rootMargin: "240px 0px" }
      );
      return ie.observe(M), () => ie.disconnect();
    }
    const ne = () => {
      M.getBoundingClientRect().top <= window.innerHeight + 240 && p();
    };
    return window.addEventListener("scroll", ne, { passive: !0 }), ne(), () => window.removeEventListener("scroll", ne);
  }, [ve.length, Q.length]);
  const be = b((M) => {
    m(M), re(24);
  }, []), fe = b(() => {
    const M = Ee.current;
    requestAnimationFrame(() => {
      window.scrollTo({ top: M, behavior: "auto" }), document.scrollingElement && (document.scrollingElement.scrollTop = M);
    });
  }, []), q = b(async () => {
    var M;
    Ee.current = ((M = document.scrollingElement) == null ? void 0 : M.scrollTop) ?? window.scrollY ?? 0;
    try {
      await n();
    } finally {
      fe();
    }
  }, [n, fe]), ce = b(
    (M) => {
      const p = [];
      for (const ne of t)
        if (ne.skills.some((ie) => ie.name === M)) {
          const ie = l.find((Te) => Te.id === ne.agent_id);
          p.push((ie == null ? void 0 : ie.name) || ne.agent_name || ne.agent_id);
        }
      return p;
    },
    [t, l]
  ), pe = b(
    async (M) => {
      if (D(M), V(ce(M.name)), N(!0), !M.content) {
        ge(!0);
        try {
          const p = await Ra(M.name);
          D({ ...M, content: p });
        } catch {
        } finally {
          ge(!1);
        }
      }
    },
    [ce]
  );
  y(() => {
    h && V(ce(h.name));
  }, [h, ce, t]);
  const U = async (M) => {
    ye(!0);
    try {
      await Nt(o, M.name), X.success(
        `已将技能「${M.name}」加载到当前专家「${c}」`
      ), r(M);
    } catch (p) {
      X.error(p.message || "加载技能失败");
    } finally {
      ye(!1);
    }
  }, g = (M) => {
    if (M.protected) {
      X.warning("内置技能不可删除");
      return;
    }
    F.confirm({
      title: `确认从技能池删除「${M.name}」？`,
      content: "删除后所有已安装此技能的专家将不受影响，但技能池中将不再包含此技能。此操作不可撤销。",
      okText: "确认删除",
      cancelText: "取消",
      okButtonProps: { danger: !0 },
      onOk: async () => {
        ye(!0);
        try {
          await Wa(M.name), X.success(`已从技能池删除「${M.name}」`), await q();
        } catch (p) {
          X.error(p.message || "删除失败");
        } finally {
          ye(!1);
        }
      }
    });
  }, de = (M) => {
    window.history.pushState({}, "", M), window.dispatchEvent(new PopStateEvent("popstate"));
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
      i.createElement(w, {
        placeholder: "搜索技能名称、描述或标签...",
        prefix: E ? i.createElement(E) : void 0,
        value: _,
        onChange: (M) => be(M.target.value),
        allowClear: !0,
        style: { maxWidth: 400 }
      }),
      i.createElement(
        "div",
        { style: { display: "flex", gap: 8 } },
        i.createElement(
          z,
          {
            icon: k ? i.createElement(k) : void 0,
            onClick: q,
            loading: a,
            size: "small"
          },
          "刷新"
        ),
        i.createElement(
          z,
          {
            type: "primary",
            icon: f ? i.createElement(f) : void 0,
            onClick: () => de("/skill-pool"),
            size: "small",
            style: Le
          },
          "管理技能池"
        )
      )
    ),
    a ? i.createElement(
      "div",
      { style: { textAlign: "center", padding: 60 } },
      i.createElement(C, { size: "large" })
    ) : ve.length === 0 ? i.createElement($, {
      description: _ ? "未找到匹配的技能" : "技能池为空"
    }) : i.createElement(
      i.Fragment,
      null,
      i.createElement(
        j,
        { gutter: [12, 12] },
        ...Q.map(
          (M) => i.createElement(
            R,
            { key: M.name, xs: 24, sm: 12, md: 8, lg: 6 },
            i.createElement(
              W,
              {
                hoverable: !0,
                size: "small",
                style: { cursor: "pointer", height: "100%" },
                onClick: () => pe(M),
                onMouseEnter: () => oe(M.name),
                onMouseLeave: () => oe(null)
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
                M.emoji ? i.createElement(
                  "span",
                  { style: { fontSize: 18 } },
                  M.emoji
                ) : i.createElement(
                  "span",
                  { style: { fontSize: 18 } },
                  "⚡"
                ),
                i.createElement(
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
                  M.name
                ),
                M.protected ? i.createElement(
                  G,
                  { color: "gold", style: { fontSize: 10 } },
                  "内置"
                ) : null
              ),
              M.description ? i.createElement(
                L,
                {
                  type: "secondary",
                  style: { fontSize: 11, margin: 0, lineHeight: 1.4 },
                  ellipsis: { rows: 2 }
                },
                M.description
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
                M.version_text ? i.createElement(
                  G,
                  { style: { fontSize: 10 } },
                  `v${M.version_text}`
                ) : null,
                ...(M.tags || []).slice(0, 3).map(
                  (p, ne) => i.createElement(
                    G,
                    { key: ne, color: "cyan", style: { fontSize: 10 } },
                    p
                  )
                )
              ),
              // Hover action footer
              ue === M.name ? i.createElement(
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
                  z,
                  {
                    size: "small",
                    type: "primary",
                    icon: H ? i.createElement(H) : void 0,
                    disabled: ae || Ae.has(M.name),
                    onClick: (p) => {
                      p.stopPropagation(), U(M);
                    }
                  },
                  Ae.has(M.name) ? "已加载" : "加载到当前Agent"
                ),
                i.createElement(
                  z,
                  {
                    size: "small",
                    danger: !0,
                    icon: v ? i.createElement(v) : void 0,
                    disabled: ae || M.protected,
                    onClick: (p) => {
                      p.stopPropagation(), g(M);
                    }
                  },
                  "删除"
                )
              ) : null
            )
          )
        ),
        // Infinite-scroll sentinel
        Q.length < ve.length ? i.createElement(
          "div",
          {
            ref: xe,
            style: {
              minHeight: 40,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginTop: 16
            }
          },
          i.createElement(
            Z,
            { type: "secondary", style: { fontSize: 12 } },
            `继续下滑自动加载 · 还剩 ${ve.length - Q.length} 个`
          )
        ) : null
      )
    ),
    // Skill detail drawer
    h ? i.createElement(
      K,
      {
        title: i.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 8 } },
          i.createElement(
            "span",
            { style: { fontSize: 18 } },
            h.emoji || "⚡"
          ),
          i.createElement("span", null, h.name)
        ),
        open: te,
        onClose: () => N(!1),
        width: 520,
        extra: i.createElement(
          z,
          {
            type: "primary",
            size: "small",
            icon: T ? i.createElement(T) : void 0,
            onClick: () => de("/skills")
          },
          "管理技能"
        )
      },
      i.createElement(
        B,
        { column: 1, bordered: !0, size: "small" },
        i.createElement(
          B.Item,
          { label: "技能名称" },
          h.name
        ),
        i.createElement(
          B.Item,
          { label: "描述" },
          h.description || "-"
        ),
        h.version_text ? i.createElement(
          B.Item,
          { label: "版本" },
          h.version_text
        ) : null,
        i.createElement(
          B.Item,
          { label: "来源" },
          h.source || "-"
        ),
        i.createElement(
          B.Item,
          { label: "受保护" },
          h.protected ? "是（内置）" : "否"
        ),
        h.sync_status ? i.createElement(
          B.Item,
          { label: "同步状态" },
          h.sync_status
        ) : null,
        h.installed_from ? i.createElement(
          B.Item,
          { label: "安装来源" },
          h.installed_from
        ) : null
      ),
      // Tags
      h.tags && h.tags.length > 0 ? i.createElement(
        "div",
        { style: { marginTop: 16 } },
        i.createElement(
          Z,
          {
            strong: !0,
            style: { display: "block", marginBottom: 8 }
          },
          "标签"
        ),
        i.createElement(
          "div",
          { style: { display: "flex", flexWrap: "wrap", gap: 4 } },
          ...h.tags.map(
            (M, p) => i.createElement(G, { key: p, color: "cyan" }, M)
          )
        )
      ) : null,
      // Installed agents
      i.createElement(
        "div",
        { style: { marginTop: 16 } },
        i.createElement(
          Z,
          { strong: !0, style: { display: "block", marginBottom: 8 } },
          `已安装此技能的专家 (${le.length})`
        ),
        le.length > 0 ? i.createElement(P, {
          size: "small",
          dataSource: le,
          renderItem: (M) => i.createElement(
            P.Item,
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
              i.createElement(Ne, { name: M, size: 20 }),
              i.createElement(
                Z,
                { style: { fontSize: 13 } },
                M
              )
            )
          )
        }) : i.createElement(
          Z,
          { type: "secondary", style: { fontSize: 12 } },
          "暂无专家安装此技能"
        )
      ),
      // Skill content preview (lazy-loaded)
      ee ? i.createElement(
        "div",
        { style: { marginTop: 16, textAlign: "center" } },
        i.createElement(C, { size: "small" })
      ) : h.content ? i.createElement(
        "div",
        { style: { marginTop: 16 } },
        i.createElement(
          Z,
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
          h.content.slice(0, 2e3) + (h.content.length > 2e3 ? `

... (内容已截断)` : "")
        )
      ) : null
    ) : null
  );
}
function Jl({
  embedded: e = !1
} = {}) {
  const t = x().React, { useState: l, useEffect: a, useCallback: n, useMemo: r } = t, { Tabs: o, message: c } = x().antd, { ThunderboltOutlined: i, AppstoreOutlined: d } = x().antdIcons || {}, b = x().useSelectedAgent, y = b ? b() : null, S = (y == null ? void 0 : y.id) || "default";
  a(() => {
    jt();
  }, [S]);
  const [C, $] = l([]), [w, z] = l([]), [j, R] = l([]), [W, G] = l(!0), [J, K] = l("agent-skills"), [B, P] = l(0), F = n(async () => {
    G(!0);
    try {
      const [v, H, Z] = await Promise.all([
        Tt(!0),
        kt(),
        Ma()
      ]);
      z(v), $(H), R(Z);
    } catch (v) {
      c.error(v.message || "加载技能列表失败"), z([]);
    } finally {
      G(!1);
    }
  }, []);
  a(() => {
    F();
  }, [F]);
  const X = r(() => {
    const v = C.find((H) => H.id === S);
    return (v == null ? void 0 : v.name) || S;
  }, [C, S]), k = n(
    (v) => {
      R(
        (H) => H.map((Z) => Z.agent_id !== S || Z.skills.some((L) => L.name === v.name) ? Z : {
          ...Z,
          skills: [
            ...Z.skills,
            {
              name: v.name,
              description: v.description,
              version_text: v.version_text,
              content: v.content || "",
              source: v.source || "pool",
              enabled: !0,
              tags: v.tags,
              emoji: v.emoji,
              installed_from: v.installed_from
            }
          ]
        })
      ), P((H) => H + 1);
    },
    [S]
  ), E = (v) => {
    window.history.pushState({}, "", v), window.dispatchEvent(new PopStateEvent("popstate"));
  }, f = [
    {
      key: "agent-skills",
      label: t.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        i ? t.createElement(i, { style: { fontSize: 14 } }) : null,
        "当前专家"
      ),
      children: t.createElement(Hl, {
        agentId: S,
        agentName: X,
        refreshKey: B,
        onNavigate: E
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
      children: t.createElement(Wl, {
        poolSkills: w,
        workspaceSkills: j,
        agents: C,
        loading: W,
        onReload: F,
        onSkillInstalled: k,
        agentId: S,
        agentName: X
      })
    }
  ], T = t.createElement(o, {
    items: f,
    activeKey: J,
    onChange: (v) => K(v)
  });
  return e ? T : t.createElement(
    "div",
    { style: { padding: 24 } },
    t.createElement(xt, {
      title: "技能",
      subtitle: `技能池共 ${w.length} 个技能 · 当前智能体：${X}`
    }),
    T
  );
}
const Mt = {
  reservoir_simulation: "油藏数值模拟",
  geological_modeling: "地质建模",
  well_log_analysis: "测井分析",
  production_engineering: "采油工程",
  post_processing: "后处理与可视化",
  multiphysics: "多物理场仿真"
}, Qn = {
  reservoir_simulation: "🛢️",
  geological_modeling: "🏔️",
  well_log_analysis: "📡",
  production_engineering: "⚙️",
  post_processing: "📊",
  multiphysics: "🔬"
}, Zn = /* @__PURE__ */ new Set(["cmg", "comsol", "tnavigator", "eclipse", "intersect", "visage"]);
function ea(e) {
  return St(`/ugsci/engines/icon/${encodeURIComponent(e)}`);
}
async function Kl() {
  return se("/ugsci/engines/list");
}
async function ql(e) {
  return se("/ugsci/engines/", {
    method: "POST",
    body: JSON.stringify(e)
  });
}
async function Xl(e, t) {
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
async function Yl() {
  return se("/ugsci/engines/detect/refresh", {
    method: "POST"
  });
}
function Ql({
  engine: e,
  onClick: t
}) {
  const l = x().React, { Card: a, Tag: n, Typography: r } = x().antd, { Text: o } = r, c = e.status === "detected", i = Qn[e.category] || "📦", u = Zn.has(e.id) ? l.createElement("img", {
    src: ea(e.id),
    alt: e.name,
    style: { width: 24, height: 24, objectFit: "contain" }
  }) : l.createElement("span", { style: { fontSize: 20 } }, i);
  return l.createElement(
    a,
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
        u,
        l.createElement(
          "div",
          null,
          l.createElement(
            o,
            { strong: !0, style: { fontSize: 14 } },
            e.name
          ),
          l.createElement("br"),
          l.createElement(
            o,
            { type: "secondary", style: { fontSize: 11 } },
            e.vendor || "—"
          )
        )
      ),
      l.createElement(
        "div",
        { style: { display: "flex", flexDirection: "column", gap: 4, alignItems: "flex-end" } },
        c ? l.createElement(
          n,
          { color: "success", style: { fontSize: 11 } },
          "✅ 已检测"
        ) : e.executable_path ? l.createElement(
          n,
          { color: "warning", style: { fontSize: 11 } },
          "⚠ 路径无效"
        ) : l.createElement(
          n,
          { style: { fontSize: 11 } },
          "🔧 待配置"
        ),
        e.is_default ? l.createElement(
          n,
          { color: "blue", style: { fontSize: 10 } },
          "默认"
        ) : e.is_custom ? l.createElement(
          n,
          { color: "purple", style: { fontSize: 10 } },
          "自定义"
        ) : null
      )
    ),
    l.createElement(
      "div",
      { style: { flex: 1, minHeight: 32 } },
      l.createElement(
        o,
        { type: "secondary", style: { fontSize: 12 } },
        e.description || "暂无描述"
      )
    ),
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
      e.category ? l.createElement(
        n,
        { style: { fontSize: 11 } },
        Mt[e.category] || e.category
      ) : null,
      e.version ? l.createElement(
        n,
        { color: "blue", style: { fontSize: 11 } },
        `v${e.version}`
      ) : null,
      ...(e.modules || []).map(
        (b) => l.createElement(
          n,
          { key: b, color: "cyan", style: { fontSize: 10 } },
          b
        )
      )
    )
  );
}
function Zl() {
  const e = x().React, { useState: t, useEffect: l, useCallback: a, useMemo: n } = e, {
    Spin: r,
    Empty: o,
    Button: c,
    message: i,
    Row: d,
    Col: u,
    Drawer: b,
    Descriptions: y,
    Tag: S,
    Typography: C,
    Modal: $,
    Input: w,
    Select: z,
    Popconfirm: j,
    Space: R
  } = x().antd, {
    ReloadOutlined: W,
    SearchOutlined: G,
    PlusOutlined: J,
    EditOutlined: K,
    DeleteOutlined: B,
    CopyOutlined: P,
    ExperimentOutlined: F
  } = x().antdIcons || {}, { Text: X, Paragraph: k } = C, [E, f] = t([]), [T, v] = t(!0), [H, Z] = t(""), [L, _] = t(!1), [m, te] = t(null), [N, h] = t(!1), [D, le] = t(null), [V, ee] = t({}), [ge, I] = t(!1), re = a(async () => {
    v(!0);
    try {
      const Q = await Kl();
      f(Q.engines || []);
    } catch (Q) {
      i.error(Q.message || "加载引擎列表失败"), f([]);
    } finally {
      v(!1);
    }
  }, []);
  l(() => {
    re();
  }, [re]);
  const ue = n(() => {
    if (!H.trim()) return E;
    const Q = H.toLowerCase();
    return E.filter(
      (be) => {
        var fe;
        return be.name.toLowerCase().includes(Q) || be.vendor.toLowerCase().includes(Q) || be.category.toLowerCase().includes(Q) || ((fe = be.description) == null ? void 0 : fe.toLowerCase().includes(Q));
      }
    );
  }, [E, H]);
  E.filter((Q) => Q.status === "detected").length;
  const oe = a((Q) => {
    navigator.clipboard.writeText(Q).then(() => i.success("路径已复制")).catch(() => i.error("复制失败"));
  }, []), ae = a(() => {
    le(null), ee({
      name: "",
      vendor: "",
      version: "",
      executable_path: "",
      category: "",
      description: "",
      invocation_hint: ""
    }), h(!0);
  }, []), ye = a((Q) => {
    le(Q), ee({ ...Q }), h(!0), _(!1);
  }, []), Ee = a(async () => {
    var Q;
    if (!((Q = V.name) != null && Q.trim())) {
      i.warning("请输入引擎名称");
      return;
    }
    I(!0);
    try {
      D ? (await Xl(D.id, V), i.success("引擎已更新")) : (await ql(V), i.success("引擎已添加")), h(!1), re();
    } catch (be) {
      i.error(be.message || "保存失败");
    } finally {
      I(!1);
    }
  }, [V, D, re]), xe = a(
    async (Q) => {
      try {
        await Vl(Q), i.success("引擎已删除"), _(!1), re();
      } catch (be) {
        i.error(be.message || "删除失败");
      }
    },
    [re]
  ), Ae = a(async () => {
    v(!0);
    try {
      const Q = await Yl();
      f(Q.engines || []), i.success("自动检测完成");
    } catch (Q) {
      i.error(Q.message || "检测失败");
    } finally {
      v(!1);
    }
  }, []), ve = a(
    (Q, be, fe) => {
      const q = V[be] || "";
      return e.createElement(
        "div",
        { style: { marginBottom: 12 } },
        e.createElement(
          X,
          { style: { fontSize: 13, display: "block", marginBottom: 4 } },
          Q
        ),
        fe != null && fe.select ? e.createElement(z, {
          value: q || void 0,
          onChange: (ce) => ee((pe) => ({ ...pe, [be]: ce })),
          style: { width: "100%" },
          options: fe.select.options,
          allowClear: !0,
          placeholder: `选择${Q}`
        }) : fe != null && fe.textarea ? e.createElement(w.TextArea, {
          value: q,
          onChange: (ce) => ee((pe) => ({ ...pe, [be]: ce.target.value })),
          rows: 3,
          placeholder: `输入${Q}`
        }) : e.createElement(w, {
          value: q,
          onChange: (ce) => ee((pe) => ({ ...pe, [be]: ce.target.value })),
          placeholder: `输入${Q}`
        })
      );
    },
    [V]
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
      e.createElement(w, {
        placeholder: "搜索引擎名称、厂商...",
        prefix: G ? e.createElement(G) : void 0,
        value: H,
        onChange: (Q) => Z(Q.target.value),
        allowClear: !0,
        style: { maxWidth: 280 }
      }),
      e.createElement(
        c,
        {
          icon: W ? e.createElement(W) : void 0,
          onClick: Ae,
          loading: T
        },
        "自动检测"
      ),
      e.createElement(
        c,
        {
          type: "primary",
          icon: J ? e.createElement(J) : void 0,
          onClick: ae,
          style: Le
        },
        "添加引擎"
      )
    ),
    // Content
    T ? e.createElement(
      "div",
      { style: { textAlign: "center", padding: 60 } },
      e.createElement(r, {
        size: "large",
        tip: "正在加载引擎..."
      })
    ) : ue.length === 0 ? e.createElement(o, {
      description: H ? "无匹配引擎" : "暂无引擎，点击「添加引擎」开始"
    }) : e.createElement(
      d,
      { gutter: [12, 12], align: "stretch" },
      ...ue.map(
        (Q) => e.createElement(
          u,
          {
            key: Q.id,
            xs: 24,
            sm: 12,
            md: 8,
            lg: 6,
            style: { display: "flex" }
          },
          e.createElement(Ql, {
            engine: Q,
            onClick: () => {
              te(Q), _(!0);
            }
          })
        )
      )
    ),
    // Detail drawer
    m ? e.createElement(
      b,
      {
        title: e.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 8 } },
          e.createElement(
            "span",
            { style: { display: "flex", alignItems: "center" } },
            Zn.has(m.id) ? e.createElement("img", {
              src: ea(m.id),
              alt: m.name,
              style: { width: 20, height: 20, objectFit: "contain" }
            }) : e.createElement(
              "span",
              { style: { fontSize: 18 } },
              Qn[m.category] || "📦"
            )
          ),
          e.createElement("span", null, m.name)
        ),
        open: L,
        onClose: () => _(!1),
        width: 520,
        extra: e.createElement(
          R,
          null,
          e.createElement(
            c,
            {
              size: "small",
              icon: K ? e.createElement(K) : void 0,
              onClick: () => ye(m)
            },
            "编辑"
          ),
          m.is_default ? null : e.createElement(
            j,
            {
              title: "确认删除此引擎？",
              description: m.name,
              onConfirm: () => xe(m.id),
              okText: "删除",
              cancelText: "取消",
              okButtonProps: { danger: !0 }
            },
            e.createElement(
              c,
              {
                size: "small",
                danger: !0,
                icon: B ? e.createElement(B) : void 0
              },
              "删除"
            )
          )
        )
      },
      e.createElement(
        y,
        { column: 1, bordered: !0, size: "small" },
        e.createElement(
          y.Item,
          { label: "引擎名称" },
          m.name
        ),
        e.createElement(
          y.Item,
          { label: "厂商" },
          m.vendor || "—"
        ),
        e.createElement(
          y.Item,
          { label: "分类" },
          m.category ? Mt[m.category] || m.category : "—"
        ),
        e.createElement(
          y.Item,
          { label: "状态" },
          e.createElement(
            S,
            {
              color: m.status === "detected" ? "success" : m.status === "not_found" ? "error" : "default"
            },
            m.status === "detected" ? "✅ 已检测" : m.status === "not_found" ? "❌ 路径无效" : "🔧 待配置"
          )
        ),
        e.createElement(
          y.Item,
          { label: "版本" },
          m.version || "—"
        ),
        m.executable_path ? e.createElement(
          y.Item,
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
              m.executable_path
            ),
            e.createElement(
              c,
              {
                size: "small",
                type: "text",
                icon: P ? e.createElement(P) : void 0,
                onClick: () => oe(m.executable_path)
              }
            )
          )
        ) : null,
        m.install_dir ? e.createElement(
          y.Item,
          { label: "安装目录" },
          e.createElement(
            "code",
            { style: { fontSize: 12, wordBreak: "break-all" } },
            m.install_dir
          )
        ) : null,
        // Display detected modules with paths
        m.modules && m.modules.length > 0 ? e.createElement(
          y.Item,
          { label: "已检测模块" },
          e.createElement(
            "div",
            { style: { display: "flex", flexDirection: "column", gap: 4 } },
            ...m.modules.map(
              (Q) => e.createElement(
                "div",
                {
                  key: Q,
                  style: { display: "flex", alignItems: "center", gap: 8 }
                },
                e.createElement(
                  S,
                  { color: "cyan", style: { fontSize: 11 } },
                  Q
                ),
                m.module_paths && m.module_paths[Q] ? e.createElement(
                  "code",
                  { style: { fontSize: 11, wordBreak: "break-all" } },
                  m.module_paths[Q]
                ) : null
              )
            )
          )
        ) : null,
        m.license_server ? e.createElement(
          y.Item,
          { label: "许可证服务器" },
          m.license_server
        ) : null,
        e.createElement(
          y.Item,
          { label: "描述" },
          m.description || "—"
        )
      ),
      // Invocation hint
      m.invocation_hint ? e.createElement(
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
          m.invocation_hint
        )
      ) : null,
      // Type badge
      e.createElement(
        "div",
        { style: { marginTop: 12 } },
        m.is_default ? e.createElement(
          S,
          { color: "blue" },
          "默认引擎"
        ) : m.is_custom ? e.createElement(
          S,
          { color: "purple" },
          "自定义引擎"
        ) : null
      )
    ) : null,
    // Add/Edit modal
    e.createElement(
      $,
      {
        title: D ? "编辑引擎" : "添加引擎",
        open: N,
        onOk: Ee,
        onCancel: () => h(!1),
        okText: D ? "保存" : "添加",
        cancelText: "取消",
        confirmLoading: ge,
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
            options: Object.entries(Mt).map(([Q, be]) => ({
              label: be,
              value: Q
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
const er = Jl, ta = /* @__PURE__ */ new Set(["tools", "engines", "skills"]);
function tr(e) {
  try {
    const t = new URLSearchParams(window.location.search).get("tab");
    return t && ta.has(t) ? t : e;
  } catch {
    return e;
  }
}
function An(e) {
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
function Lt({ page: e }) {
  const t = x().React, { useEffect: l, useState: a } = t, { Alert: n, Spin: r } = x().antd, [o, c] = a(null), [i, d] = a("");
  if (l(() => {
    let b = !0;
    const y = x().loadBuiltinPage;
    return c(null), y ? (d(""), y(e).then((S) => {
      b && c(() => S);
    }).catch((S) => {
      b && d(
        S instanceof Error ? S.message : "加载原生管理页面失败"
      );
    }), () => {
      b = !1;
    }) : (d("当前 QwenPaw 版本不支持原生页面嵌入"), () => {
      b = !1;
    });
  }, [e]), i)
    return t.createElement(n, {
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
        r,
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
function nr() {
  const e = x().React, { Tabs: t } = x().antd;
  return e.createElement(t, {
    defaultActiveKey: "mcp",
    items: [
      {
        key: "mcp",
        label: "MCP 接入",
        children: e.createElement(Lt, { page: "mcp" })
      },
      {
        key: "builtin",
        label: "平台内置",
        children: e.createElement(Lt, { page: "tools" })
      }
    ]
  });
}
function ar() {
  const e = x().React, { Empty: t, Typography: l } = x().antd, { Paragraph: a } = l;
  return e.createElement(
    "div",
    { style: { padding: "36px 12px" } },
    e.createElement(t, {
      description: e.createElement(
        "div",
        null,
        e.createElement("div", null, "暂无已注册的领域计算引擎"),
        e.createElement(
          a,
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
function lr() {
  const e = x().React, { Tabs: t } = x().antd;
  return e.createElement(t, {
    defaultActiveKey: "simulation",
    items: [
      {
        key: "simulation",
        label: "仿真软件",
        children: e.createElement(Zl)
      },
      {
        key: "domain",
        label: "领域计算",
        children: e.createElement(ar)
      },
      {
        key: "runtime",
        label: "运行服务",
        children: e.createElement(Lt, { page: "acp" })
      }
    ]
  });
}
function na({
  initialTab: e = "engines"
} = {}) {
  var $, w;
  const t = x().React, { useEffect: l, useState: a } = t, { Tabs: n, Tag: r } = x().antd, { RocketOutlined: o, ToolOutlined: c, ThunderboltOutlined: i } = x().antdIcons || {}, d = (w = ($ = x()).useSelectedAgent) == null ? void 0 : w.call($), u = (d == null ? void 0 : d.id) || "default", [b, y] = a(
    () => tr(e)
  );
  l(() => {
    try {
      const z = new URLSearchParams(window.location.search).get("tab");
      z && !ta.has(z) && An(b);
    } catch {
    }
  }, [b]);
  const S = (z) => {
    y(z), An(z);
  }, C = (z, j) => t.createElement(
    "span",
    { style: { display: "inline-flex", alignItems: "center", gap: 6 } },
    j ? t.createElement(j, { style: { fontSize: 14 } }) : null,
    z
  );
  return t.createElement(
    "div",
    { style: { padding: 24 } },
    t.createElement(xt, {
      title: "工具·技能",
      subtitle: "管理当前专家可调用的引擎、工具、运行服务与专业技能",
      extra: t.createElement(
        r,
        { color: "blue" },
        `当前专家：${u}`
      )
    }),
    t.createElement(n, {
      activeKey: b,
      onChange: (z) => S(z),
      items: [
        {
          key: "engines",
          label: C("引擎", o),
          children: t.createElement(lr)
        },
        {
          key: "tools",
          label: C("工具", c),
          children: t.createElement(nr)
        },
        {
          key: "skills",
          label: C("技能", i),
          children: t.createElement(er, {
            embedded: !0
          })
        }
      ]
    })
  );
}
const aa = na;
function rr() {
  return x().React.createElement(aa, {
    initialTab: "tools"
  });
}
function or() {
  return x().React.createElement(aa, {
    initialTab: "skills"
  });
}
const Pn = {
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
function sr(e) {
  if (!e.env) return !1;
  const t = Object.entries(e.env);
  return t.length === 0 ? !1 : t.some(([, l]) => typeof l == "string" && l.length > 0);
}
const ht = "ugsci.market.githubSources", $n = "https://github.com/anthropics/skills/tree/main/skills", la = "https://ugsci-awesome-tools.oss-cn-beijing.aliyuncs.com", ir = `${la}/skills`;
function cr(e) {
  const t = e.replace(/^\/+/, "");
  return St(`/plugins/oss-proxy?path=${encodeURIComponent(t)}`);
}
function bt(e) {
  const t = e.replace(/^\/+/, "");
  return Ge(`/plugins/oss-proxy?path=${encodeURIComponent(t)}`);
}
async function Kt(e) {
  const t = e.replace(/^\/+/, ""), l = await bt(t);
  if (!l.ok)
    throw new Error(`OSS fetch failed (${l.status}): ${t}`);
  return await l.json();
}
function Qe(e) {
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
function dr(e) {
  var n, r;
  const t = {};
  if (e.env && e.env.length > 0)
    for (const o of e.env)
      t[o] = `your-${o.toLowerCase().replace(/_/g, "-")}`;
  let l = "🔌";
  const a = (e.icon || "").toLowerCase();
  return a.includes("folder") ? l = "📁" : a.includes("git") ? l = "🌿" : a.includes("github") ? l = "🐙" : a.includes("database") || a.includes("postgres") || a.includes("sqlite") ? l = "🗄️" : a.includes("search") || a.includes("brave") ? l = "🔍" : a.includes("browser") || a.includes("puppeteer") ? l = "🎭" : a.includes("memory") || a.includes("brain") ? l = "🧠" : a.includes("file") || a.includes("fetch") ? l = "🌐" : a.includes("slack") ? l = "💬" : a.includes("google") ? l = "📁" : a.includes("notion") ? l = "📝" : a.includes("jupyter") ? l = "📊" : a.includes("science") || a.includes("flask") ? l = "🔬" : a.includes("book") || a.includes("arxiv") ? l = "📚" : a.includes("patent") && (l = "📜"), {
    id: e.id,
    name: e.name,
    emoji: l,
    iconUrl: e.icon_url ? cr(e.icon_url) : void 0,
    category: e.category ? Qe(e.category) : "",
    description: e.description,
    transport: e.transport || "stdio",
    command: ((n = e.config) == null ? void 0 : n.command) || "",
    args: ((r = e.config) == null ? void 0 : r.args) || [],
    env: Object.keys(t).length > 0 ? t : void 0
  };
}
const ra = "ugsci.market.mcpSources", oa = "ugsci.market.expertSources";
function sa(e, t) {
  try {
    const l = localStorage.getItem(e);
    if (!l) return [];
    const a = JSON.parse(l);
    return Array.isArray(a) ? a.filter(
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
function ia(e, t) {
  try {
    localStorage.setItem(e, JSON.stringify(t));
  } catch {
  }
}
function mr() {
  return sa(ra, "mcp");
}
function ft(e) {
  ia(ra, e);
}
function ur() {
  return sa(oa, "expert");
}
function yt(e) {
  ia(oa, e);
}
function ca(e) {
  try {
    const t = new URL(e.trim()), l = t.hostname.toLowerCase();
    let a;
    if (l === "github.com" || l === "www.github.com")
      a = "github";
    else if (l === "gitee.com" || l === "www.gitee.com")
      a = "gitee";
    else
      return null;
    const n = t.pathname.split("/").filter((d) => d.length > 0);
    if (n.length < 2) return null;
    const r = decodeURIComponent(n[0]), o = decodeURIComponent(n[1]);
    let c = "main", i = "";
    return n.length >= 4 && (n[2] === "tree" || n[2] === "blob") ? (c = decodeURIComponent(n[3]), n.length > 4 && (i = n.slice(4).map(decodeURIComponent).join("/"))) : n.length > 2 && (i = n.slice(2).map(decodeURIComponent).join("/")), i = i.replace(/\/+$/, "").replace(/^\/+/, ""), {
      owner: r,
      repo: o,
      ref: c || "main",
      skillsPath: i,
      label: `${r}/${o}`,
      platform: a
    };
  } catch {
    return null;
  }
}
function da(e, t, l, a = "github") {
  return a === "oss" ? `oss:${e}/${l || "/"}` : `${a}:${e}/${t}:${l || "/"}`;
}
function pr(e) {
  try {
    const t = new URL(e.trim()), l = t.hostname.toLowerCase(), a = l.match(
      /^([a-z0-9][a-z0-9-]{1,61}[a-z0-9])\.oss-([a-z0-9-]+)\.aliyuncs\.com$/
    );
    if (!a) return null;
    const n = a[1], r = `${t.protocol}//${l}`, o = decodeURIComponent(t.pathname).replace(/^\/+/, "").replace(/\/+$/, "");
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
function gr() {
  try {
    const e = localStorage.getItem(ht);
    if (!e) {
      const a = [], n = ca($n);
      return n && a.push({
        id: da(
          n.owner,
          n.repo,
          n.skillsPath,
          n.platform
        ),
        url: $n,
        label: n.label,
        owner: n.owner,
        repo: n.repo,
        ref: n.ref,
        skillsPath: n.skillsPath,
        enabled: !1,
        platform: n.platform
      }), localStorage.setItem(ht, JSON.stringify(a)), a;
    }
    const t = JSON.parse(e);
    if (!Array.isArray(t)) return [];
    const l = t.filter(
      (a) => a && typeof a.id == "string" && (typeof a.owner == "string" || a.platform === "oss") && !(a.platform === "oss" && a.url === ir)
    ).map((a) => ({
      ...a,
      platform: a.platform || "github",
      owner: a.owner || "",
      repo: a.repo || "",
      ref: a.ref || "",
      skillsPath: a.skillsPath || ""
    }));
    return l.length !== t.length && localStorage.setItem(
      ht,
      JSON.stringify(l)
    ), l;
  } catch {
    return [];
  }
}
function Et(e) {
  try {
    localStorage.setItem(
      ht,
      JSON.stringify(e)
    );
  } catch {
  }
}
function fr(e) {
  const t = e.match(/^---\s*\n([\s\S]*?)\n---/);
  if (!t) return {};
  const l = t[1], a = {}, n = l.split(`
`);
  let r = "";
  for (const o of n) {
    const c = o.match(/^(\w[\w-]*)\s*:\s*(.*)$/);
    if (c) {
      r = c[1];
      let i = c[2].trim();
      (i.startsWith('"') && i.endsWith('"') || i.startsWith("'") && i.endsWith("'")) && (i = i.slice(1, -1)), r === "name" ? a.name = i : r === "description" ? a.description = i : r === "version" ? a.version = i : r === "author" && (a.author = i);
    }
  }
  return a;
}
async function yr(e) {
  const t = e.platform === "gitee", l = e.skillsPath ? encodeURIComponent(e.skillsPath).replace(/%2F/g, "/") : "", a = t ? `https://gitee.com/api/v5/repos/${e.owner}/${e.repo}/contents/${l}?ref=${encodeURIComponent(e.ref)}` : `https://api.github.com/repos/${e.owner}/${e.repo}/contents/${l}?ref=${encodeURIComponent(e.ref)}`, n = {
    Accept: t ? "application/json" : "application/vnd.github+json"
  };
  t && e.accessToken && (n.Authorization = `token ${e.accessToken}`);
  const r = await fetch(a, {
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
      const u = e.skillsPath ? e.skillsPath + "/" : "", b = t ? `https://gitee.com/${e.owner}/${e.repo}/raw/${e.ref}/${u}${d.name}/SKILL.md` : `https://raw.githubusercontent.com/${e.owner}/${e.repo}/${e.ref}/${u}${d.name}/SKILL.md`, y = t ? `https://gitee.com/${e.owner}/${e.repo}/tree/${e.ref}/${u}${d.name}` : `https://github.com/${e.owner}/${e.repo}/tree/${e.ref}/${u}${d.name}`, S = {
        sourceId: e.id,
        sourceLabel: e.label,
        name: d.name,
        description: "",
        source_url: y,
        html_url: y,
        version: null,
        author: null
      };
      try {
        const C = {};
        t && e.accessToken && (C.Authorization = `token ${e.accessToken}`);
        const $ = await fetch(b, {
          headers: C
        });
        if (!$.ok) return S;
        const w = await $.text(), z = fr(w);
        return {
          ...S,
          name: z.name || d.name,
          description: z.description || "",
          version: z.version || null,
          author: z.author || null
        };
      } catch {
        return S;
      }
    })
  );
}
async function Er(e) {
  const t = pr(e.url);
  if (!t)
    throw new Error(`Invalid OSS URL: ${e.url}`);
  const { endpoint: l, prefix: a } = t, n = a.split("/").map(encodeURIComponent).join("/"), r = await bt(
    `${n}/manifest.json`
  );
  if (!r.ok)
    throw new Error(
      `无法获取技能列表: manifest.json (${r.status})`
    );
  const o = await r.json(), c = [];
  if (o && o.tag_groups && typeof o.tag_groups == "object")
    for (const [u, b] of Object.entries(o.tag_groups))
      Array.isArray(b) && c.push({
        id: u,
        label: Qe(u),
        tags: b
      });
  const i = [];
  function d(u, b) {
    for (const y of u) {
      if (y.type === "collection" && Array.isArray(y.children)) {
        d(y.children, y.name);
        continue;
      }
      const S = y.path || y.name || "";
      if (!S) continue;
      const C = S.split("/").map(encodeURIComponent).join("/"), $ = `${l}/${n}/${C}`;
      let w = null;
      if (y.metadata) {
        const j = y.metadata.match(/version:\s*"?([\d.]+)"?/);
        j && (w = j[1]);
      }
      const z = b ? `${e.label}/${b}` : e.label;
      i.push({
        sourceId: e.id,
        sourceLabel: e.label,
        sourcePath: z,
        name: y.name || S.split("/").pop() || S,
        description: y.description || "",
        source_url: $,
        html_url: $,
        version: w,
        author: null,
        tag: y.tag || void 0,
        isOfficial: !0
      });
    }
  }
  if (Array.isArray(o) ? d(
    o.map(
      (u) => typeof u == "string" ? { name: u, path: u } : u
    )
  ) : o && Array.isArray(o.skills) && d(o.skills), i.length === 0)
    throw new Error(
      `manifest.json 中未找到技能。请检查 ${e.url}/manifest.json`
    );
  return { skills: i, categories: c };
}
async function hr() {
  const e = await Kt("mcp/manifest.json"), t = [], l = {};
  if (e.tag_groups && typeof e.tag_groups == "object")
    for (const [n, r] of Object.entries(e.tag_groups))
      Array.isArray(r) && (l[n] = r, t.push({
        id: n,
        label: Qe(n),
        tags: r
      }));
  return { servers: (e.servers || []).map((n) => {
    let r = "";
    const o = n.tags || [];
    for (const [c, i] of Object.entries(l))
      if (i.some((d) => o.includes(d))) {
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
async function vr() {
  const e = await Kt("skills/manifest.json"), t = [], l = /* @__PURE__ */ new Set();
  function a(n, r) {
    for (const o of n) {
      if ((o == null ? void 0 : o.type) === "collection" && Array.isArray(o.children)) {
        a(o.children, o.name || r);
        continue;
      }
      const c = String((o == null ? void 0 : o.path) || (o == null ? void 0 : o.name) || "").trim();
      if (!c) continue;
      const i = c.split("/").map(encodeURIComponent).join("/"), d = `${la}/skills/${i}`, u = typeof o.tag == "string" && o.tag.trim() ? o.tag.trim() : void 0;
      u && l.add(u);
      let b = null;
      if (typeof o.metadata == "string") {
        const y = o.metadata.match(/version:\s*"?([\d.]+)"?/);
        y && (b = y[1]);
      }
      t.push({
        sourceId: "oss:ugsci-official",
        sourceLabel: "UGSci",
        sourcePath: r ? `UGSci/${r}` : "UGSci",
        name: o.name || c.split("/").pop() || c,
        description: o.description || "",
        source_url: d,
        html_url: d,
        version: b,
        author: null,
        tag: u,
        isOfficial: !0
      });
    }
  }
  if (Array.isArray(e) ? a(
    e.map(
      (n) => typeof n == "string" ? { name: n, path: n } : n
    )
  ) : e && Array.isArray(e.skills) && a(e.skills), t.length === 0)
    throw new Error("OSS 技能清单中没有可用技能");
  return {
    skills: t,
    categories: Array.from(l).map((n) => ({
      id: n,
      label: n
    }))
  };
}
async function br() {
  const e = await Kt("agents/manifest.json"), t = [], l = {};
  if (e.tag_groups && typeof e.tag_groups == "object")
    for (const [n, r] of Object.entries(e.tag_groups))
      Array.isArray(r) && (l[n] = r, t.push({
        id: n,
        label: Qe(n),
        tags: r
      }));
  return { agents: (e.agents || []).map((n) => {
    let r = "";
    const o = n.tags || [];
    for (const [c, i] of Object.entries(l))
      if (i.some((d) => o.includes(d))) {
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
async function Sr(e) {
  const t = e.filter((o) => o.enabled), l = await Promise.all(
    t.map(async (o) => {
      try {
        if (o.platform === "oss") {
          const { skills: c, categories: i } = await Er(o);
          return { skills: c, categories: i, error: null, label: o.label };
        } else
          return { skills: await yr(o), categories: [], error: null, label: o.label };
      } catch (c) {
        return {
          skills: [],
          categories: [],
          error: c.message || String(c),
          label: o.label
        };
      }
    })
  ), a = [], n = [], r = [];
  for (const o of l)
    a.push(...o.skills), n.push(...o.categories), o.error && r.push({ label: o.label, message: o.error });
  return { skills: a, errors: r, categories: n };
}
function wr({
  open: e,
  onClose: t,
  sources: l,
  onChange: a
}) {
  const n = x().React, { useState: r } = n, {
    Modal: o,
    Input: c,
    Button: i,
    List: d,
    Tag: u,
    Switch: b,
    Typography: y,
    Tooltip: S,
    message: C
  } = x().antd, {
    PlusOutlined: $,
    DeleteOutlined: w,
    LinkOutlined: z,
    GithubOutlined: j
  } = x().antdIcons || {}, { Text: R } = y, [W, G] = r(""), [J, K] = r(""), B = () => {
    const k = W.trim();
    if (!k) return;
    const E = ca(k);
    if (!E) {
      C.error("无效的仓库 URL，请输入类似 https://github.com/owner/repo/tree/main/skills 或 https://gitee.com/owner/repo/tree/master/skills 的链接");
      return;
    }
    const f = da(E.owner, E.repo, E.skillsPath, E.platform);
    if (l.some((H) => H.id === f)) {
      C.warning("该源已存在");
      return;
    }
    const T = {
      id: f,
      url: k,
      label: E.label,
      owner: E.owner,
      repo: E.repo,
      ref: E.ref,
      skillsPath: E.skillsPath,
      enabled: !0,
      platform: E.platform,
      accessToken: J.trim() || void 0
    }, v = [...l, T];
    Et(v), a(v), G(""), K(""), C.success(`已添加源: ${E.label}`);
  }, P = (k, E) => {
    const f = l.map(
      (T) => T.id === k ? { ...T, enabled: E } : T
    );
    Et(f), a(f);
  }, F = (k, E) => {
    const f = l.map(
      (T) => T.id === k ? { ...T, accessToken: E.trim() || void 0 } : T
    );
    Et(f), a(f);
  }, X = (k) => {
    const E = l.filter((f) => f.id !== k);
    Et(E), a(E), C.success("已移除源");
  };
  return n.createElement(
    o,
    {
      open: e,
      onCancel: t,
      title: n.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 8 } },
        j ? n.createElement(j, { style: { fontSize: 18 } }) : null,
        n.createElement("span", null, "配置技能源")
      ),
      footer: n.createElement(
        i,
        { onClick: t },
        "关闭"
      ),
      width: 640
    },
    n.createElement(
      "div",
      { style: { marginBottom: 16 } },
      n.createElement(
        R,
        { type: "secondary", style: { fontSize: 12, display: "block", marginBottom: 8 } },
        "添加 GitHub 或 Gitee 仓库作为技能源，系统将从该仓库的指定目录获取技能列表。支持格式："
      ),
      n.createElement(
        "div",
        { style: { display: "flex", gap: 8, alignItems: "center" } },
        n.createElement(c, {
          placeholder: "https://github.com/owner/repo/tree/main/skills 或 https://gitee.com/owner/repo/tree/master/skills",
          value: W,
          onChange: (k) => G(k.target.value),
          onPressEnter: B,
          prefix: z ? n.createElement(z) : void 0,
          style: { flex: 1 }
        }),
        n.createElement(
          i,
          {
            type: "primary",
            icon: $ ? n.createElement($) : void 0,
            onClick: B
          },
          "添加"
        )
      ),
      // Gitee token input (shown when URL looks like a Gitee link)
      W.trim() && W.trim().toLowerCase().includes("gitee.com") ? n.createElement(
        "div",
        { style: { marginTop: 8, display: "flex", gap: 8, alignItems: "center" } },
        n.createElement(
          R,
          { type: "secondary", style: { fontSize: 12, whiteSpace: "nowrap" } },
          "Gitee Token:"
        ),
        n.createElement(c.Password, {
          placeholder: "私有仓库请填写 Gitee 私人令牌（可选）",
          value: J,
          onChange: (k) => K(k.target.value),
          style: { flex: 1 }
        })
      ) : null
    ),
    n.createElement(
      "div",
      { style: { marginBottom: 8, display: "flex", alignItems: "center", justifyContent: "space-between" } },
      n.createElement(R, { strong: !0 }, `已配置源 (${l.length})`)
    ),
    n.createElement(d, {
      size: "small",
      bordered: !0,
      dataSource: l,
      renderItem: (k) => n.createElement(
        d.Item,
        {
          actions: [
            n.createElement(
              S,
              { title: k.enabled ? "点击禁用" : "点击启用" },
              n.createElement(b, {
                size: "small",
                checked: k.enabled,
                onChange: (E) => P(k.id, E)
              })
            ),
            n.createElement(
              S,
              { title: "移除此源" },
              n.createElement(
                i,
                {
                  size: "small",
                  type: "text",
                  danger: !0,
                  icon: w ? n.createElement(w) : void 0,
                  onClick: () => X(k.id)
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
              u,
              { color: k.platform === "gitee" ? "orange" : k.platform === "oss" ? "green" : "blue", style: { fontSize: 11 } },
              k.platform === "gitee" ? "Gitee" : k.platform === "oss" ? "OSS" : "GitHub"
            ),
            n.createElement(
              u,
              { style: { fontSize: 11 } },
              k.label
            ),
            k.skillsPath ? n.createElement(
              R,
              { type: "secondary", style: { fontSize: 11 } },
              `/${k.skillsPath}`
            ) : null,
            k.platform !== "oss" ? n.createElement(
              R,
              { type: "secondary", style: { fontSize: 11 } },
              `@${k.ref}`
            ) : null
          ),
          n.createElement(
            R,
            {
              type: "secondary",
              style: { fontSize: 11, wordBreak: "break-all" }
            },
            k.url
          ),
          // Gitee token input for existing Gitee sources
          k.platform === "gitee" ? n.createElement(
            "div",
            { style: { marginTop: 6, display: "flex", gap: 6, alignItems: "center" } },
            n.createElement(
              R,
              { type: "secondary", style: { fontSize: 11, whiteSpace: "nowrap" } },
              "Token:"
            ),
            n.createElement(c.Password, {
              size: "small",
              placeholder: "Gitee 私人令牌（可选，用于私有仓库）",
              value: k.accessToken || "",
              onChange: (E) => F(k.id, E.target.value),
              style: { flex: 1 }
            })
          ) : null
        )
      )
    })
  );
}
function On({
  open: e,
  onClose: t,
  sources: l,
  onChange: a,
  type: n
}) {
  const r = x().React, { useState: o } = r, {
    Modal: c,
    Input: i,
    Button: d,
    List: u,
    Tag: b,
    Switch: y,
    Typography: S,
    Tooltip: C,
    message: $
  } = x().antd, {
    PlusOutlined: w,
    DeleteOutlined: z,
    LinkOutlined: j,
    ApiOutlined: R,
    UserOutlined: W,
    ImportOutlined: G,
    ExportOutlined: J,
    CopyOutlined: K
  } = x().antdIcons || {}, { Text: B } = S, [P, F] = o(""), [X, k] = o(""), [E, f] = o(""), [T, v] = o(!1), H = n === "mcp" ? "MCP" : "专家模板", Z = n === "mcp" ? R ? r.createElement(R, { style: { fontSize: 18 } }) : null : W ? r.createElement(W, { style: { fontSize: 18 } }) : null, L = () => {
    const h = P.trim(), D = X.trim();
    if (!h) return;
    const le = D || h.slice(0, 40), V = `${n}:${h}`;
    if (l.some((I) => I.id === V)) {
      $.warning("该源已存在");
      return;
    }
    const ee = {
      id: V,
      label: le,
      url: h,
      enabled: !0,
      type: n
    }, ge = [...l, ee];
    n === "mcp" ? ft(ge) : yt(ge), a(ge), F(""), k(""), $.success(`已添加${H}源: ${le}`);
  }, _ = (h, D) => {
    const le = l.map(
      (V) => V.id === h ? { ...V, enabled: D } : V
    );
    n === "mcp" ? ft(le) : yt(le), a(le);
  }, m = (h) => {
    const D = l.filter((le) => le.id !== h);
    n === "mcp" ? ft(D) : yt(D), a(D), $.success("已移除源");
  }, te = () => {
    const h = JSON.stringify(
      { type: n, sources: l },
      null,
      2
    );
    try {
      navigator.clipboard.writeText(h), $.success(`${H}源已复制到剪贴板（${l.length} 个源）`);
    } catch {
      const D = document.createElement("textarea");
      D.value = h, document.body.appendChild(D), D.select(), document.execCommand("copy"), document.body.removeChild(D), $.success(`${H}源已复制到剪贴板（${l.length} 个源）`);
    }
  }, N = () => {
    const h = E.trim();
    if (!h) {
      $.warning("请粘贴 JSON 内容");
      return;
    }
    try {
      const D = JSON.parse(h);
      let le = [];
      if (Array.isArray(D))
        le = D;
      else if (D && Array.isArray(D.sources))
        le = D.sources;
      else if (D && typeof D == "object")
        le = [D];
      else
        throw new Error("Invalid format");
      const V = le.filter(
        (re) => re && typeof re.url == "string" && typeof re.label == "string"
      );
      if (V.length === 0) {
        $.error("未找到有效的源数据");
        return;
      }
      const ee = new Set(l.map((re) => re.id)), ge = [];
      for (const re of V) {
        const ue = re.id || `${n}:${re.url}`;
        ee.has(ue) || ge.push({
          id: ue,
          label: re.label,
          url: re.url,
          enabled: re.enabled !== !1,
          type: n
        });
      }
      if (ge.length === 0) {
        $.info("所有源均已存在，无新增");
        return;
      }
      const I = [...l, ...ge];
      n === "mcp" ? ft(I) : yt(I), a(I), f(""), v(!1), $.success(`成功导入 ${ge.length} 个${H}源`);
    } catch (D) {
      $.error(`JSON 解析失败: ${D.message || "格式错误"}`);
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
        r.createElement("span", null, `配置${H}源`)
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
              icon: J ? r.createElement(J) : void 0,
              onClick: te,
              disabled: l.length === 0,
              size: "small"
            },
            "导出到剪贴板"
          ),
          r.createElement(
            d,
            {
              icon: G ? r.createElement(G) : void 0,
              onClick: () => v(!T),
              size: "small"
            },
            T ? "隐藏导入" : "导入JSON"
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
      B,
      { type: "secondary", style: { fontSize: 12, display: "block", marginBottom: 12 } },
      `配置${H}源地址，支持从远程仓库或团队共享的 JSON 导入${H}配置。`
    ),
    // Import section (collapsible)
    T ? r.createElement(
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
        B,
        { strong: !0, style: { fontSize: 12, display: "block", marginBottom: 8 } },
        `粘贴${H}源 JSON（支持从导出的剪贴板内容粘贴）`
      ),
      r.createElement(i.TextArea, {
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
        value: E,
        onChange: (h) => f(h.target.value),
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
            onClick: N
          },
          "导入"
        ),
        r.createElement(
          d,
          {
            size: "small",
            onClick: () => f("")
          },
          "清空"
        )
      )
    ) : null,
    // Add new source
    r.createElement(
      "div",
      { style: { marginBottom: 16, display: "flex", gap: 8, alignItems: "center" } },
      r.createElement(i, {
        placeholder: "源名称（可选，如：团队MCP仓库）",
        value: X,
        onChange: (h) => k(h.target.value),
        style: { width: 200 }
      }),
      r.createElement(i, {
        placeholder: n === "mcp" ? "https://raw.githubusercontent.com/team/mcp-registry/main/mcp.json" : "https://raw.githubusercontent.com/team/expert-registry/main/experts.json",
        value: P,
        onChange: (h) => F(h.target.value),
        onPressEnter: L,
        prefix: j ? r.createElement(j) : void 0,
        style: { flex: 1 }
      }),
      r.createElement(
        d,
        {
          type: "primary",
          icon: w ? r.createElement(w) : void 0,
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
        B,
        { strong: !0 },
        `已配置源 (${l.length})`
      )
    ),
    r.createElement(u, {
      size: "small",
      bordered: !0,
      dataSource: l,
      renderItem: (h) => r.createElement(
        u.Item,
        {
          actions: [
            r.createElement(
              C,
              { title: h.enabled ? "点击禁用" : "点击启用" },
              r.createElement(y, {
                size: "small",
                checked: h.enabled,
                onChange: (D) => _(h.id, D)
              })
            ),
            r.createElement(
              C,
              { title: "移除此源" },
              r.createElement(
                d,
                {
                  size: "small",
                  type: "text",
                  danger: !0,
                  icon: z ? r.createElement(z) : void 0,
                  onClick: () => m(h.id)
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
              b,
              {
                color: n === "mcp" ? "purple" : "blue",
                style: { fontSize: 11 }
              },
              h.label
            ),
            h.enabled ? null : r.createElement(
              b,
              { style: { fontSize: 10 } },
              "已禁用"
            )
          ),
          r.createElement(
            B,
            {
              type: "secondary",
              style: { fontSize: 11, wordBreak: "break-all" }
            },
            h.url
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
async function xr() {
  return se("/market/providers");
}
async function kr(e) {
  return se(
    `/market/categories?lang=${encodeURIComponent(e)}`
  );
}
async function Cr(e, t, l, a, n) {
  return se("/market/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: e,
      provider_pages: t,
      limit: l,
      lang: a,
      category: n || void 0
    })
  });
}
function Rn(e) {
  if (!e) return "";
  const t = e.message || String(e);
  try {
    const l = JSON.parse(t);
    if (l.detail) {
      if (typeof l.detail == "string") return l.detail;
      if (l.detail.message) return l.detail.message;
    }
  } catch {
  }
  return t;
}
async function Mn(e, t) {
  const l = { bundle_url: e };
  return t && (l.access_token = t), se("/skills/pool/import", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(l)
  });
}
function Tr() {
  const e = x().React, { useState: t, useEffect: l, useCallback: a, useMemo: n, useRef: r } = e, {
    Spin: o,
    Empty: c,
    Input: i,
    Button: d,
    message: u,
    Row: b,
    Col: y,
    Card: S,
    Tag: C,
    Tooltip: $,
    Typography: w,
    Select: z,
    Drawer: j,
    Descriptions: R,
    Tabs: W,
    Badge: G,
    Progress: J,
    Modal: K,
    Alert: B
  } = x().antd, {
    ReloadOutlined: P,
    SearchOutlined: F,
    DownloadOutlined: X,
    AppstoreOutlined: k,
    ShopOutlined: E,
    CheckCircleOutlined: f,
    LoadingOutlined: T,
    UserOutlined: v,
    UserAddOutlined: H,
    SettingOutlined: Z,
    GithubOutlined: L,
    ApiOutlined: _
  } = x().antdIcons || {}, { Text: m, Paragraph: te, Title: N } = w, [h, D] = t("skills"), [le, V] = t([]), [ee, ge] = t([]), [I, re] = t([]), [ue, oe] = t(""), [ae, ye] = t(""), [Ee, xe] = t(!1), [Ae, ve] = t(!1), [Q, be] = t(
    {}
  ), [fe, q] = t(null), [ce, pe] = t({}), [U, g] = t([]), [de, M] = t(""), [p, ne] = t(""), [ie, Te] = t(""), [ke, Oe] = t({}), [Re, je] = t(""), [Ue, Me] = t(/* @__PURE__ */ new Set()), [Se, $e] = t(null), [Y, _e] = t({}), [Ie, Pe] = t([]), [De, Fe] = t([]), [Ce, it] = t([]), [_t, et] = t(""), [He, ct] = t(!1), [ma, qt] = t(!1), [ua, Xt] = t([]), [pa, Vt] = t(!1), [ga, Yt] = t([]), [fa, Qt] = t(!1), [Zt, en] = t([]), [tn, nn] = t([]), [an, ln] = t(!1), [qe, rn] = t(""), [on, sn] = t([]), [cn, dn] = t([]), [mn, un] = t(!1), [Xe, pn] = t(""), [It, gn] = t(!1), [Be, dt] = t(null), [tt, ya] = t([]), nt = r(null);
  l(() => {
    Promise.all([
      xr().catch(() => []),
      kr("zh").catch(() => []),
      kt().catch(() => [])
    ]).then(([s, A, O]) => {
      V(s), ge(A), g(O), O.length > 0 && (M(O[0].id), je(O[0].id));
    });
  }, []);
  const mt = a(async (s) => {
    const A = s ?? gr();
    if (Pe(s || A), A.filter((me) => me.enabled).length === 0) {
      Fe([]);
      return;
    }
    ct(!0);
    try {
      const { skills: me, errors: he, categories: ze } = await Sr(A);
      if (Fe(me), ya(ze), he.length > 0) {
        for (const we of he)
          console.warn(`[ugsci] GitHub source '${we.label}' error: ${we.message}`);
        u.warning(
          `部分源加载失败: ${he.map((we) => we.label).join(", ")}`
        );
      }
    } catch (me) {
      u.error(me.message || "加载技能源失败"), Fe([]);
    } finally {
      ct(!1);
    }
  }, []), zt = a(async () => {
    var me, he, ze;
    ln(!0), un(!0), ct(!0);
    const [s, A, O] = await Promise.allSettled([
      hr(),
      br(),
      vr()
    ]);
    if (s.status === "fulfilled" ? (en(s.value.servers), nn(s.value.categories)) : (console.warn(`[ugsci] MCP manifest error: ${((me = s.reason) == null ? void 0 : me.message) || s.reason}`), en([]), nn([])), ln(!1), A.status === "fulfilled" ? (sn(A.value.agents), dn(A.value.categories)) : (console.warn(`[ugsci] Agents manifest error: ${((he = A.reason) == null ? void 0 : he.message) || A.reason}`), sn([]), dn([])), un(!1), O.status === "fulfilled")
      it(O.value.skills), et("");
    else {
      const we = ((ze = O.reason) == null ? void 0 : ze.message) || String(O.reason);
      console.warn(`[ugsci] Skills manifest error: ${we}`), it([]), et(we);
    }
    ct(!1);
  }, []);
  l(() => {
    mt(), zt(), Xt(mr()), Yt(ur());
  }, [mt, zt]);
  const ut = a(
    async (s, A, O) => {
      xe(!0);
      try {
        const me = await Cr(
          s,
          O,
          20,
          "zh",
          A || void 0
        );
        O === void 0 || Object.keys(O).length === 0 ? re(me.results) : re((we) => [...we, ...me.results]);
        const he = Object.values(me.by_provider || {}).some(
          (we) => we.has_more
        );
        ve(he);
        const ze = {};
        for (const [we, We] of Object.entries(me.by_provider || {}))
          ze[we] = (O[we] || 1) + 1;
        if (be(ze), me.errors.length > 0)
          for (const we of me.errors)
            console.warn(
              `[ugsci] Market provider '${we.provider}' error: ${we.message}`
            );
      } catch (me) {
        u.error(me.message || "搜索市场失败"), re([]);
      } finally {
        xe(!1);
      }
    },
    []
  );
  l(() => (nt.current && clearTimeout(nt.current), nt.current = setTimeout(() => {
    ut(ue, ae, {});
  }, 400), () => {
    nt.current && clearTimeout(nt.current);
  }), [ue, ae, ut]);
  const Ea = () => {
    ut(ue, ae, Q);
  }, fn = async (s) => {
    const A = `${s.source}:${s.slug}`;
    try {
      pe((me) => ({ ...me, [A]: "installing" }));
      const O = await Mn(s.source_url);
      O.installed && u.success(
        `技能「${O.name || s.name}」已安装到技能池，可在技能中心查看`
      ), pe((me) => {
        const he = { ...me };
        return delete he[A], he;
      });
    } catch (O) {
      u.error(Rn(O) || "安装技能失败"), pe((me) => {
        const he = { ...me };
        return delete he[A], he;
      });
    }
  }, ha = (s) => {
    window.history.pushState({}, "", s), window.dispatchEvent(new PopStateEvent("popstate"));
  }, va = async (s) => {
    const A = `github:${s.sourceId}:${s.name}`, O = Ie.find((he) => he.id === s.sourceId), me = (O == null ? void 0 : O.accessToken) || void 0;
    try {
      pe((ze) => ({ ...ze, [A]: "installing" }));
      const he = await Mn(s.source_url, me);
      he.installed && u.success(
        `技能「${he.name || s.name}」已安装到技能池，可在技能中心查看`
      ), pe((ze) => {
        const we = { ...ze };
        return delete we[A], we;
      });
    } catch (he) {
      u.error(Rn(he) || "安装技能失败"), pe((ze) => {
        const we = { ...ze };
        return delete we[A], we;
      });
    }
  }, Ke = n(() => {
    const s = [], A = /* @__PURE__ */ new Set();
    for (const O of [...Ce, ...De]) {
      const me = O.source_url || `${O.sourceLabel}:${O.name}`;
      A.has(me) || (A.add(me), s.push(O));
    }
    return s;
  }, [Ce, De]), yn = n(() => {
    const s = [], A = /* @__PURE__ */ new Set();
    if (tt.length > 0)
      for (const O of tt)
        A.has(O.id) || (A.add(O.id), s.push(O));
    for (const O of Ke)
      O.tag && !A.has(O.tag) && (A.add(O.tag), s.push({ id: O.tag, label: O.tag }));
    for (const O of Ke)
      !O.isOfficial && O.sourceLabel && !A.has(O.sourceLabel) && (A.add(O.sourceLabel), s.push({ id: O.sourceLabel, label: O.sourceLabel }));
    return s;
  }, [Ke, tt]), At = n(() => {
    let s = Ke;
    if (ae) {
      const A = tt.find((O) => O.id === ae);
      A && A.tags ? s = s.filter(
        (O) => O.tag && A.tags.includes(O.tag) || O.sourceLabel === ae
      ) : s = s.filter(
        (O) => O.tag === ae || O.sourceLabel === ae
      );
    }
    if (ue.trim()) {
      const A = ue.toLowerCase();
      s = s.filter(
        (O) => {
          var me;
          return O.name.toLowerCase().includes(A) || ((me = O.description) == null ? void 0 : me.toLowerCase().includes(A));
        }
      );
    }
    return s;
  }, [Ke, ue, ae, tt]), En = le.filter((s) => s.available), Ve = n(() => ae ? I.filter((s) => {
    const A = En.find((O) => O.key === s.source);
    return (A == null ? void 0 : A.label) === ae;
  }) : I, [I, ae, En]), ba = e.createElement(
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
      e.createElement(i, {
        placeholder: "搜索技能市场...",
        prefix: F ? e.createElement(F) : void 0,
        value: ue,
        onChange: (s) => oe(s.target.value),
        allowClear: !0,
        style: { flex: 1, minWidth: 200, maxWidth: 400 }
      }),
      // Pool install info
      e.createElement(
        m,
        { type: "secondary", style: { fontSize: 12 } },
        "安装后进入技能池"
      ),
      // Configure skill source button
      e.createElement(
        d,
        {
          icon: L ? e.createElement(L) : void 0,
          onClick: () => qt(!0),
          size: "small"
        },
        "配置技能源"
      )
    ),
    // Dynamic category filter tags (from OSS manifest tags + imported sources)
    _t && Ke.length === 0 ? e.createElement(B, {
      type: "warning",
      showIcon: !0,
      message: "UGSci 官方 OSS 技能库加载失败",
      description: "请检查网络或后端 OSS 代理服务，然后点击右上角“刷新”重试。",
      style: { marginBottom: 12 }
    }) : null,
    yn.length > 0 ? e.createElement(
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
        m,
        { type: "secondary", style: { fontSize: 12, marginRight: 4 } },
        "分类:"
      ),
      e.createElement(
        C,
        {
          style: {
            fontSize: 11,
            cursor: "pointer",
            borderRadius: 12
          },
          color: ae === "" ? "blue" : void 0,
          onClick: () => ye("")
        },
        "全部"
      ),
      ...yn.map((s) => {
        const A = De.some(
          (O) => !O.isOfficial && O.sourceLabel === s.id
        );
        return e.createElement(
          C,
          {
            key: s.id,
            style: {
              fontSize: 11,
              cursor: "pointer",
              borderRadius: 12
            },
            color: ae === s.id ? A ? "blue" : "geekblue" : void 0,
            icon: A && L ? e.createElement(L) : void 0,
            onClick: () => ye(
              ae === s.id ? "" : s.id
            )
          },
          s.label
        );
      })
    ) : null,
    // GitHub skills section
    He && Ke.length === 0 ? e.createElement(
      "div",
      { style: { textAlign: "center", padding: 40, marginBottom: 16 } },
      e.createElement(o, { size: "large" }, e.createElement("div", { style: { minHeight: 60, display: "flex", alignItems: "center", justifyContent: "center" } }, "正在加载技能..."))
    ) : At.length > 0 ? e.createElement(
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
          m,
          { strong: !0, style: { fontSize: 13 } },
          `技能市场 (${At.length})`
        )
      ),
      e.createElement(
        b,
        { gutter: [12, 12] },
        ...At.map((s) => {
          const A = `github:${s.sourceId}:${s.name}`, O = ce[A];
          return e.createElement(
            y,
            { key: A, xs: 24, sm: 12, md: 8, lg: 6 },
            e.createElement(
              S,
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
                  $,
                  { title: s.name },
                  e.createElement(
                    m,
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
                    s.name
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
                s.description || "暂无描述"
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
                  s.sourcePath || s.sourceLabel ? e.createElement(
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
                    _ ? e.createElement(_, { style: { fontSize: 10 } }) : null,
                    s.sourcePath || s.sourceLabel
                  ) : null,
                  // Show tag as category badge
                  s.tag ? e.createElement(
                    C,
                    { color: "geekblue", style: { fontSize: 10 } },
                    s.tag
                  ) : null,
                  s.version ? e.createElement(
                    C,
                    { style: { fontSize: 10 } },
                    `v${s.version}`
                  ) : null
                ),
                O ? e.createElement(
                  d,
                  {
                    size: "small",
                    disabled: !0,
                    icon: T ? e.createElement(T) : void 0
                  },
                  "安装中"
                ) : e.createElement(
                  d,
                  {
                    type: "primary",
                    size: "small",
                    icon: X ? e.createElement(X) : void 0,
                    onClick: () => va(s)
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
    Ve.length > 0 || Ee ? e.createElement(
      "div",
      {
        style: {
          marginBottom: 10,
          display: "flex",
          alignItems: "center",
          gap: 6
        }
      },
      E ? e.createElement(E, {
        style: { fontSize: 14, color: "#1677ff" }
      }) : null,
      e.createElement(
        m,
        { strong: !0, style: { fontSize: 13 } },
        `技能市场${Ve.length > 0 ? ` (${Ve.length})` : ""}`
      )
    ) : null,
    // Results grid
    Ee && Ve.length === 0 ? e.createElement(
      "div",
      { style: { textAlign: "center", padding: 60 } },
      e.createElement(o, { size: "large" })
    ) : Ve.length === 0 ? e.createElement(c, {
      description: ue ? `未找到匹配「${ue}」的技能` : "输入关键词搜索技能市场",
      image: c.PRESENTED_IMAGE_SIMPLE
    }) : e.createElement(
      b,
      { gutter: [12, 12] },
      ...Ve.map((s) => {
        const A = `${s.source}:${s.slug}`, O = ce[A];
        return e.createElement(
          y,
          { key: A, xs: 24, sm: 12, md: 8, lg: 6 },
          e.createElement(
            S,
            {
              hoverable: !0,
              size: "small",
              style: { height: "100%", cursor: "pointer" },
              onClick: () => q(s)
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
              s.icon_url ? e.createElement("img", {
                src: s.icon_url,
                alt: s.name,
                style: { width: 24, height: 24, borderRadius: 4 }
              }) : e.createElement(
                "span",
                { style: { fontSize: 18 } },
                "📦"
              ),
              e.createElement(
                $,
                { title: s.name },
                e.createElement(
                  m,
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
                  s.name
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
              s.description || "暂无描述"
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
                  C,
                  { color: "geekblue", style: { fontSize: 10 } },
                  s.source
                ),
                s.version ? e.createElement(
                  C,
                  { style: { fontSize: 10 } },
                  `v${s.version}`
                ) : null
              ),
              O ? e.createElement(
                d,
                {
                  size: "small",
                  disabled: !0,
                  icon: T ? e.createElement(T) : void 0
                },
                "安装中"
              ) : e.createElement(
                d,
                {
                  type: "primary",
                  size: "small",
                  icon: X ? e.createElement(X) : void 0,
                  onClick: (me) => {
                    me.stopPropagation(), fn(s);
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
    Ae && !Ee ? e.createElement(
      "div",
      { style: { textAlign: "center", marginTop: 16 } },
      e.createElement(
        d,
        { onClick: Ea, loading: Ee },
        "加载更多"
      )
    ) : null,
    // Detail Drawer
    fe ? e.createElement(
      j,
      {
        title: e.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 8 } },
          fe.icon_url ? e.createElement("img", {
            src: fe.icon_url,
            alt: fe.name,
            style: { width: 28, height: 28, borderRadius: 4 }
          }) : e.createElement(
            "span",
            { style: { fontSize: 20 } },
            "📦"
          ),
          e.createElement("span", null, fe.name)
        ),
        open: !0,
        onClose: () => q(null),
        width: 480,
        extra: e.createElement(
          d,
          {
            type: "primary",
            icon: X ? e.createElement(X) : void 0,
            onClick: () => {
              fn(fe);
            }
          },
          "安装到技能池"
        )
      },
      e.createElement(
        R,
        { column: 1, bordered: !0, size: "small" },
        e.createElement(
          R.Item,
          { label: "来源" },
          fe.source
        ),
        e.createElement(
          R.Item,
          { label: "描述" },
          fe.description || "-"
        ),
        fe.version ? e.createElement(
          R.Item,
          { label: "版本" },
          fe.version
        ) : null,
        fe.author ? e.createElement(
          R.Item,
          { label: "作者" },
          fe.author
        ) : null,
        e.createElement(
          R.Item,
          { label: "来源链接" },
          e.createElement(
            "a",
            { href: fe.source_url, target: "_blank" },
            fe.source_url
          )
        )
      ),
      fe.stats ? e.createElement(
        "div",
        { style: { marginTop: 16 } },
        e.createElement(
          m,
          {
            strong: !0,
            style: { display: "block", marginBottom: 8 }
          },
          "统计"
        ),
        e.createElement(
          "div",
          { style: { display: "flex", gap: 12, flexWrap: "wrap" } },
          ...Object.entries(fe.stats).map(
            ([s, A]) => e.createElement(
              "div",
              { key: s, style: { textAlign: "center" } },
              e.createElement(
                "div",
                {
                  style: {
                    fontSize: 18,
                    fontWeight: 600,
                    color: "#1677ff"
                  }
                },
                String(A)
              ),
              e.createElement(
                m,
                { type: "secondary", style: { fontSize: 11 } },
                s
              )
            )
          )
        )
      ) : null
    ) : null
  ), Pt = n(() => {
    let s = on;
    if (Xe && (s = s.filter((A) => A.category === Xe)), p.trim()) {
      const A = p.toLowerCase();
      s = s.filter(
        (O) => O.name.toLowerCase().includes(A) || O.description.toLowerCase().includes(A) || O.tags.some((me) => me.toLowerCase().includes(A))
      );
    }
    return s;
  }, [on, p, Xe]), Sa = async (s) => {
    if (!It) {
      gn(!0);
      try {
        let A = s.description;
        if (s.instructions)
          try {
            const he = s.instructions.replace(/^\/+/, ""), ze = await bt(he);
            ze.ok && (A = await ze.text());
          } catch {
          }
        let O = [];
        if (s.skills_manifest)
          try {
            const he = s.skills_manifest.replace(/^\/+/, ""), ze = await bt(he);
            if (ze.ok) {
              const we = await ze.json();
              Array.isArray(we) ? O = we.map((We) => typeof We == "string" ? We : We.name).filter(Boolean) : we.skills && (O = we.skills.map((We) => typeof We == "string" ? We : We.name).filter(Boolean));
            }
          } catch {
          }
        const me = await se("/agents", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: s.name,
            description: s.description,
            skill_names: O
          })
        });
        await vt(me.id, "AGENTS.md", A), u.success(`专家「${s.name}」创建成功，已跳转至专家`), ha("/ugsci-experts");
      } catch (A) {
        u.error(A.message || "创建专家失败");
      } finally {
        gn(!1);
      }
    }
  }, hn = a(async (s) => {
    if (s)
      try {
        const A = await Ft(s);
        Me(new Set(A.map((O) => O.key)));
      } catch {
        Me(/* @__PURE__ */ new Set());
      }
  }, []);
  l(() => {
    Re && hn(Re);
  }, [Re, hn]);
  const wa = async (s) => {
    if (!Re) {
      u.warning("请先选择目标专家");
      return;
    }
    if (sr(s)) {
      const A = Object.entries(s.env), O = {};
      for (const [me] of A)
        O[me] = "";
      _e(O), $e(s);
      return;
    }
    await vn(s, s.env || {});
  }, vn = async (s, A) => {
    Oe((O) => ({ ...O, [s.id]: !0 }));
    try {
      const O = s.id;
      await Gt(Re, {
        client_key: O,
        client: {
          name: s.name,
          description: s.description,
          enabled: !0,
          transport: s.transport,
          url: s.url || "",
          command: s.command || "",
          args: s.args || [],
          env: A,
          cwd: s.cwd || "",
          headers: s.headers || {}
        }
      }), u.success(`MCP「${s.name}」已添加到当前专家`), Me((me) => new Set(me).add(O));
    } catch (O) {
      u.error(O.message || `添加 MCP「${s.name}」失败`);
    } finally {
      Oe((O) => ({ ...O, [s.id]: !1 }));
    }
  }, xa = async () => {
    if (!Se) return;
    const s = [];
    for (const [O, me] of Object.entries(Y))
      if (!me || !me.trim()) {
        const he = Pn[O];
        s.push((he == null ? void 0 : he.label) || O);
      }
    if (s.length > 0) {
      u.warning(`请填写以下配置项: ${s.join(", ")}`);
      return;
    }
    const A = Se;
    $e(null), _e({}), await vn(A, { ...Y });
  }, $t = n(() => {
    let s = Zt;
    if (qe && (s = s.filter((A) => A.category === qe)), ie.trim()) {
      const A = ie.toLowerCase();
      s = s.filter(
        (O) => O.name.toLowerCase().includes(A) || O.description.toLowerCase().includes(A) || O.tags.some((me) => me.toLowerCase().includes(A))
      );
    }
    return s.map(dr);
  }, [Zt, ie, qe]), ka = e.createElement(
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
      e.createElement(i, {
        placeholder: "搜索 MCP 服务器...",
        prefix: F ? e.createElement(F) : void 0,
        value: ie,
        onChange: (s) => Te(s.target.value),
        allowClear: !0,
        style: { maxWidth: 300 }
      }),
      e.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        e.createElement(
          m,
          { type: "secondary", style: { fontSize: 12, whiteSpace: "nowrap" } },
          "安装到："
        ),
        e.createElement(z, {
          value: Re,
          onChange: (s) => je(s),
          style: { minWidth: 180 },
          size: "small",
          options: U.map((s) => ({ value: s.id, label: s.name }))
        })
      ),
      // Configure MCP source button
      e.createElement(
        d,
        {
          icon: _ ? e.createElement(_) : void 0,
          onClick: () => Vt(!0),
          size: "small"
        },
        "配置 MCP 源"
      )
    ),
    // Dynamic category tag row (from OSS manifest tag_groups)
    tn.length > 0 ? e.createElement(
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
        m,
        { type: "secondary", style: { fontSize: 12, marginRight: 4 } },
        "分类:"
      ),
      e.createElement(
        C,
        {
          style: { fontSize: 11, cursor: "pointer", borderRadius: 12 },
          color: qe === "" ? "blue" : void 0,
          onClick: () => rn("")
        },
        "全部"
      ),
      ...tn.map(
        (s) => e.createElement(
          C,
          {
            key: s.id,
            style: { fontSize: 11, cursor: "pointer", borderRadius: 12 },
            color: qe === s.id ? "geekblue" : void 0,
            onClick: () => rn(
              qe === s.id ? "" : s.id
            )
          },
          s.label
        )
      )
    ) : null,
    // MCP server cards (dynamic from OSS)
    an && $t.length === 0 ? e.createElement(
      "div",
      { style: { textAlign: "center", padding: 40 } },
      e.createElement(o, { size: "large" }, e.createElement("div", { style: { minHeight: 60, display: "flex", alignItems: "center", justifyContent: "center" } }, "正在加载 MCP 服务器..."))
    ) : $t.length === 0 ? e.createElement(c, {
      description: "未找到匹配的 MCP 服务器",
      image: c.PRESENTED_IMAGE_SIMPLE
    }) : e.createElement(
      b,
      { gutter: [12, 12] },
      ...$t.map(
        (s) => e.createElement(
          y,
          { key: s.id, xs: 24, sm: 12, md: 8 },
          e.createElement(
            S,
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
                s.iconUrl ? e.createElement("img", {
                  src: s.iconUrl,
                  alt: s.name,
                  style: { width: 28, height: 28, objectFit: "contain" },
                  onError: (A) => {
                    A.target.style.display = "none";
                  }
                }) : s.emoji
              ),
              e.createElement(
                "div",
                { style: { flex: 1 } },
                e.createElement(
                  m,
                  { strong: !0, style: { fontSize: 14 } },
                  s.name
                ),
                e.createElement(
                  "div",
                  { style: { display: "flex", gap: 4, marginTop: 4, flexWrap: "wrap" } },
                  e.createElement(
                    C,
                    { color: "blue", style: { fontSize: 10 } },
                    s.category
                  ),
                  e.createElement(
                    C,
                    {
                      color: s.transport === "stdio" ? "purple" : "cyan",
                      style: { fontSize: 10 }
                    },
                    s.transport
                  ),
                  s.env && Object.keys(s.env).length > 0 ? e.createElement(
                    C,
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
              s.description
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
                m,
                { type: "secondary", style: { fontSize: 11 } },
                s.transport === "stdio" ? `${s.command} ${(s.args || []).join(" ")}` : s.url || ""
              ),
              Ue.has(s.id) ? e.createElement(
                d,
                { size: "small", disabled: !0 },
                "已安装"
              ) : e.createElement(
                d,
                {
                  type: "primary",
                  size: "small",
                  loading: !!ke[s.id],
                  icon: _ ? e.createElement(_) : void 0,
                  onClick: () => wa(s)
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
      E ? e.createElement(E, {
        style: { fontSize: 24, color: "var(--ant-color-text-quaternary, #bfbfbf)", marginBottom: 8 }
      }) : null,
      e.createElement(
        m,
        { type: "secondary", style: { fontSize: 12 } },
        "MCP 服务器列表来自 UGSci 官方源，自动同步更新"
      )
    )
  ), Ca = Se ? e.createElement(
    K,
    {
      title: e.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 8 } },
        e.createElement("span", { style: { fontSize: 20, display: "inline-flex", alignItems: "center", justifyContent: "center", width: 24, height: 24 } }, Se.iconUrl ? e.createElement("img", { src: Se.iconUrl, alt: Se.name, style: { width: 22, height: 22, objectFit: "contain" }, onError: (s) => {
          s.target.style.display = "none";
        } }) : Se.emoji),
        e.createElement("span", null, `配置 ${Se.name} 密钥`)
      ),
      open: !!Se,
      onCancel: () => {
        $e(null), _e({});
      },
      onOk: xa,
      okText: "安装",
      cancelText: "取消",
      width: 520,
      destroyOnClose: !0
    },
    // Description
    e.createElement(
      m,
      { type: "secondary", style: { display: "block", marginBottom: 16, fontSize: 12 } },
      Se.description
    ),
    ...Object.entries(Se.env || {}).map(([s]) => {
      const A = Pn[s], O = (A == null ? void 0 : A.isSecret) !== !1;
      return e.createElement(
        "div",
        { key: s, style: { marginBottom: 16 } },
        e.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 6, marginBottom: 4 } },
          e.createElement(
            m,
            { strong: !0, style: { fontSize: 13 } },
            (A == null ? void 0 : A.label) || s
          ),
          e.createElement(
            C,
            { color: "orange", style: { fontSize: 10 } },
            "必填"
          )
        ),
        // Help text with optional link
        A ? e.createElement(
          "div",
          { style: { marginBottom: 6, fontSize: 12, color: "var(--ant-color-text-tertiary, #8c8c8c)" } },
          A.help,
          A.link ? e.createElement(
            "a",
            {
              href: A.link,
              target: "_blank",
              rel: "noopener noreferrer",
              style: { marginLeft: 4, fontSize: 12 }
            },
            "获取方式 ↗"
          ) : null
        ) : null,
        // Input field
        O ? e.createElement(i.Password, {
          placeholder: `请输入 ${(A == null ? void 0 : A.label) || s}`,
          value: Y[s] || "",
          onChange: (me) => _e((he) => ({
            ...he,
            [s]: me.target.value
          })),
          style: { width: "100%" }
        }) : e.createElement(i, {
          placeholder: `请输入 ${(A == null ? void 0 : A.label) || s}`,
          value: Y[s] || "",
          onChange: (me) => _e((he) => ({
            ...he,
            [s]: me.target.value
          })),
          style: { width: "100%" }
        }),
        // Show env key name for reference
        e.createElement(
          m,
          { type: "secondary", style: { fontSize: 11, display: "block", marginTop: 2 } },
          `环境变量名: ${s}`
        )
      );
    })
  ) : null, Ta = e.createElement(
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
      e.createElement(i, {
        placeholder: "搜索人才...",
        prefix: F ? e.createElement(F) : void 0,
        value: p,
        onChange: (s) => ne(s.target.value),
        allowClear: !0,
        style: { maxWidth: 400, flex: 1, minWidth: 200 }
      }),
      e.createElement(
        d,
        {
          icon: v ? e.createElement(v) : void 0,
          onClick: () => Qt(!0),
          size: "small"
        },
        "配置专家源"
      )
    ),
    // Dynamic category tag row (from OSS manifest tag_groups)
    cn.length > 0 ? e.createElement(
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
        m,
        { type: "secondary", style: { fontSize: 12, marginRight: 4 } },
        "分类:"
      ),
      e.createElement(
        C,
        {
          style: { fontSize: 11, cursor: "pointer", borderRadius: 12 },
          color: Xe === "" ? "blue" : void 0,
          onClick: () => pn("")
        },
        "全部"
      ),
      ...cn.map(
        (s) => e.createElement(
          C,
          {
            key: s.id,
            style: { fontSize: 11, cursor: "pointer", borderRadius: 12 },
            color: Xe === s.id ? "geekblue" : void 0,
            onClick: () => pn(
              Xe === s.id ? "" : s.id
            )
          },
          s.label
        )
      )
    ) : null,
    // Agent cards (dynamic from OSS)
    mn && Pt.length === 0 ? e.createElement(
      "div",
      { style: { textAlign: "center", padding: 40 } },
      e.createElement(o, { size: "large" }, e.createElement("div", { style: { minHeight: 60, display: "flex", alignItems: "center", justifyContent: "center" } }, "正在加载人才市场..."))
    ) : Pt.length === 0 ? e.createElement(c, {
      description: "未找到匹配的人才",
      image: c.PRESENTED_IMAGE_SIMPLE
    }) : e.createElement(
      b,
      { gutter: [12, 12] },
      ...Pt.map(
        (s) => e.createElement(
          y,
          { key: s.id, xs: 24, sm: 12, md: 8 },
          e.createElement(
            S,
            {
              hoverable: !0,
              size: "small",
              style: { height: "100%", cursor: "pointer" },
              onClick: () => dt(s)
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
              e.createElement(Ne, {
                name: s.name,
                size: 40
              }),
              e.createElement(
                "div",
                { style: { flex: 1 } },
                e.createElement(
                  m,
                  { strong: !0, style: { fontSize: 14 } },
                  s.name
                ),
                e.createElement(
                  "div",
                  { style: { display: "flex", gap: 4, marginTop: 4, flexWrap: "wrap" } },
                  s.category ? e.createElement(
                    C,
                    { color: "blue", style: { fontSize: 10 } },
                    Qe(s.category)
                  ) : null,
                  s.tags.includes("mcp") ? e.createElement(
                    C,
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
              s.description
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
                m,
                { type: "secondary", style: { fontSize: 11 } },
                s.tags.filter((A) => A !== "agent" && A !== "template" && A !== "workspace").slice(0, 3).join(" · ") || "人才模板"
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
      E ? e.createElement(E, {
        style: { fontSize: 24, color: "var(--ant-color-text-quaternary, #bfbfbf)", marginBottom: 8 }
      }) : null,
      e.createElement(
        m,
        { type: "secondary", style: { fontSize: 12 } },
        "人才市场来自 UGSci 官方源，自动同步更新"
      )
    )
  ), _a = [
    {
      key: "skills",
      label: e.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        k ? e.createElement(k, { style: { fontSize: 14 } }) : null,
        "技能市场"
      ),
      children: ba
    },
    {
      key: "mcp",
      label: e.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        _ ? e.createElement(_, { style: { fontSize: 14 } }) : null,
        "MCP 市场"
      ),
      children: ka
    },
    {
      key: "experts",
      label: e.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        H ? e.createElement(H, { style: { fontSize: 14 } }) : null,
        "人才市场"
      ),
      children: Ta
    }
  ];
  return e.createElement(
    "div",
    { style: { padding: 24 } },
    e.createElement(xt, {
      title: "市场",
      subtitle: "浏览技能市场 · 选择 MCP 服务器 · 人才市场 · 随时更新能力和专家",
      extra: e.createElement(
        "div",
        { style: { display: "flex", gap: 8 } },
        e.createElement(
          d,
          {
            type: "primary",
            icon: P ? e.createElement(P) : void 0,
            onClick: () => {
              ut(ue, ae, {}), mt(), zt();
            },
            loading: Ee || He || an || mn
          },
          "刷新"
        )
      )
    }),
    e.createElement(W, {
      items: _a,
      activeKey: h,
      onChange: (s) => D(s)
    }),
    // Skill source config modal
    e.createElement(wr, {
      open: ma,
      onClose: () => qt(!1),
      sources: Ie,
      onChange: (s) => {
        Pe(s), mt(s);
      }
    }),
    // MCP source config modal
    e.createElement(On, {
      open: pa,
      onClose: () => Vt(!1),
      sources: ua,
      onChange: (s) => Xt(s),
      type: "mcp"
    }),
    // MCP token config modal (for templates requiring secrets)
    Ca,
    // Expert source config modal
    e.createElement(On, {
      open: fa,
      onClose: () => Qt(!1),
      sources: ga,
      onChange: (s) => Yt(s),
      type: "expert"
    }),
    // ── Agent Detail Modal (click card to view details, then create) ──
    Be ? e.createElement(
      K,
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
          e.createElement(Ne, {
            name: Be.name,
            size: 40
          }),
          e.createElement(
            "div",
            null,
            e.createElement(
              m,
              { strong: !0, style: { fontSize: 16 } },
              Be.name
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
              Be.category ? e.createElement(
                C,
                { color: "blue", style: { fontSize: 10 } },
                Qe(Be.category)
              ) : null,
              ...Be.tags.filter(
                (s) => s !== "agent" && s !== "template" && s !== "workspace"
              ).slice(0, 5).map(
                (s) => e.createElement(
                  C,
                  { key: s, style: { fontSize: 10 } },
                  s
                )
              )
            )
          )
        ),
        open: !0,
        onCancel: () => dt(null),
        width: 640,
        footer: e.createElement(
          "div",
          { style: { textAlign: "right" } },
          e.createElement(
            d,
            {
              onClick: () => dt(null),
              style: { marginRight: 8 }
            },
            "取消"
          ),
          e.createElement(
            d,
            {
              type: "primary",
              loading: It,
              disabled: It,
              icon: H ? e.createElement(H) : void 0,
              style: Le,
              onClick: async () => {
                await Sa(Be), dt(null);
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
          m,
          { strong: !0, style: { display: "block", marginBottom: 6 } },
          "简介"
        ),
        e.createElement(
          te,
          {
            type: "secondary",
            style: { fontSize: 13, lineHeight: 1.7, margin: 0 }
          },
          Be.description
        )
      ),
      // Skills manifest hint
      Be.skills_manifest ? e.createElement(
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
          m,
          { style: { fontSize: 12, color: "#52c41a" } },
          "✓ 包含技能清单，创建后将自动安装推荐技能"
        )
      ) : null,
      // Instructions hint
      Be.instructions ? e.createElement(
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
          m,
          { style: { fontSize: 12, color: "#1677ff" } },
          "✓ 包含系统提示词，创建后将自动写入 AGENTS.md"
        )
      ) : null,
      // Drivers
      Be.drivers && Object.keys(Be.drivers).length > 0 ? e.createElement(
        "div",
        null,
        e.createElement(
          m,
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
          ...Object.entries(Be.drivers).map(
            ([s, A]) => e.createElement(
              C,
              { key: s, color: "cyan", style: { fontSize: 11 } },
              `${s}${A && A.length > 0 ? ` (${A.join(", ")})` : ""}`
            )
          )
        )
      ) : null
    ) : null
  );
}
function _r() {
  try {
    const t = localStorage.getItem("language") || "";
    if (t) return t.split("-")[0];
  } catch {
  }
  return ((typeof navigator < "u" ? navigator.language : "") || "").split("-")[0] || "en";
}
const Ln = {
  zh: "您好，UGSci 智能助手在线。无论是油气藏分析、数值模拟还是工程决策，描述您的场景，我来交付结果。",
  en: "UGSci AI assistant is online. From reservoir analysis to numerical simulation and engineering decisions — describe your scenario and I'll deliver results.",
  ja: "UGSci AIアシスタントがオンラインです。油層解析、数値シミュレーション、エンジニアリングの意思決定など、シナリオを描写してください。結果をお届けします。",
  ru: "UGSci AI-ассистент онлайн. От анализа пласта до численного моделирования и инженерных решений — опишите свой сценарий, и я предоставлю результат.",
  vi: "Trợ lý AI UGSci đang trực tuyến. Từ phân tích mỏ, mô phỏng số đến ra quyết định kỹ thuật — mô tả kịch bản của bạn, tôi sẽ giao kết quả.",
  id: "Asisten AI UGSci sedang online. Dari analisis reservoir, simulasi numerik hingga keputusan engineering — jelaskan skenario Anda, saya akan memberikan hasilnya."
}, Bn = {
  zh: { label: "能告诉我你都能做点什么吗？", value: "能告诉我你都能做点什么吗" },
  en: { label: "Can you tell me what you can do?", value: "Can you tell me what you can do?" },
  ja: { label: "あなたができることを教えてください", value: "あなたができることを教えてください" },
  ru: { label: "Расскажи, что ты умеешь делать?", value: "Расскажи, что ты умеешь делать?" },
  vi: { label: "Bạn có thể cho tôi biết bạn làm được gì không?", value: "Bạn có thể cho tôi biết bạn làm được gì không?" },
  id: { label: "Bisa cerita apa saja yang bisa Anda lakukan?", value: "Bisa cerita apa saja yang bisa Anda lakukan?" }
};
function Ir() {
  const e = x(), t = e.React, { useEffect: l, useRef: a } = t, n = e.useSelectedAgent ? e.useSelectedAgent() : { id: "default" }, r = (n == null ? void 0 : n.id) || "default", o = a(null), c = a(null);
  return l(() => {
    if (o.current === r) return;
    o.current = r, jt();
    const i = _r(), d = Ln[i] || Ln.en, u = Bn[i] || Bn.en;
    let b = !1;
    return (async () => {
      var y, S;
      try {
        const C = await Ct(r);
        if (b) return;
        const $ = Un(C);
        if (c.current) {
          try {
            c.current();
          } catch {
          }
          c.current = null;
        }
        const w = window.QwenPaw;
        (y = w == null ? void 0 : w.chat) != null && y.welcome && ($.length > 0 ? (c.current = w.chat.welcome.set("ugsci", {
          description: d,
          prompts: $
        }), console.info(
          `[ugsci] Injected ${$.length} welcome prompts for agent "${r}"`
        )) : (c.current = w.chat.welcome.set("ugsci", {
          description: d,
          prompts: [u]
        }), console.info(
          `[ugsci] No skills for agent "${r}" — using default prompt`
        )));
      } catch (C) {
        console.warn(
          `[ugsci] Failed to inject welcome prompts for agent "${r}":`,
          C
        );
        const $ = window.QwenPaw;
        if ((S = $ == null ? void 0 : $.chat) != null && S.welcome && !b) {
          if (c.current) {
            try {
              c.current();
            } catch {
            }
            c.current = null;
          }
          c.current = $.chat.welcome.set("ugsci", {
            description: d,
            prompts: [u]
          });
        }
      }
    })(), () => {
      b = !0;
    };
  }, [r]), null;
}
function zr() {
  var i, d, u;
  const e = window.QwenPaw;
  if (!(e != null && e.menu) || !(e != null && e.route)) {
    console.warn(
      "[ugsci] QwenPaw.menu/route API not available — plugin disabled"
    );
    return;
  }
  const t = x().React, l = "ugsci";
  (d = (i = e.chat) == null ? void 0 : i.rightHeader) != null && d.add ? (e.chat.rightHeader.add(l, t.createElement(Ir), {
    id: "ugsci.welcome-injector",
    order: -1
    // render before other right-header items (invisible anyway)
  }), console.info("[ugsci] WelcomePromptsInjector registered via rightHeader")) : console.warn(
    "[ugsci] QP.chat.rightHeader.add not available — agent-specific welcome prompts disabled"
  );
  const a = x().antdIcons || {}, n = a.UserSwitchOutlined, r = a.ToolOutlined, o = a.ShopOutlined;
  e.route.add(l, {
    id: "ugsci.experts",
    path: "/ugsci-experts",
    component: Gl
  }), e.menu.add(l, {
    id: "ugsci.experts",
    location: "primary.agentScoped",
    label: () => "专家·协作",
    icon: n ? t.createElement(n, { style: { fontSize: 16 } }) : void 0,
    route: "ugsci.experts",
    order: 5,
    visible: () => at()
  }), e.route.add(l, {
    id: "ugsci.tools-skills",
    path: "/ugsci-tools-skills",
    component: na
  }), e.menu.add(l, {
    id: "ugsci.tools-skills",
    location: "primary.agentScoped",
    label: () => "工具·技能",
    icon: r ? t.createElement(r, { style: { fontSize: 16 } }) : void 0,
    route: "ugsci.tools-skills",
    order: 6,
    visible: () => at()
  }), e.route.add(l, {
    id: "ugsci.capabilities",
    path: "/ugsci-capabilities",
    component: rr
  }), e.route.add(l, {
    id: "ugsci.skills-center",
    path: "/ugsci-skills",
    component: or
  }), e.route.add(l, {
    id: "ugsci.market",
    path: "/ugsci-market",
    component: Tr
  }), e.menu.add(l, {
    id: "ugsci.market",
    location: "primary.agentScoped",
    label: () => "市场",
    icon: o ? t.createElement(o, { style: { fontSize: 16 } }) : void 0,
    route: "ugsci.market",
    order: 7,
    visible: () => at()
  }), (u = e.sidebar) != null && u.registerSimpleModeItems ? (e.sidebar.registerSimpleModeItems([
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
  for (const b of c) {
    try {
      const S = e.menu.snapshot("primary.agentScoped").find((C) => C.id === b);
      S && e.menu.replace(l, b, {
        ...S,
        visible: () => !at()
      });
    } catch {
    }
    try {
      const S = e.menu.snapshot("primary.settings").find((C) => C.id === b);
      S && e.menu.replace(l, b, {
        ...S,
        visible: () => !at()
      });
    } catch {
    }
  }
  console.info(
    "[ugsci] Plugin registered: unified Tools & Skills center + compatibility routes, simple-mode navigation active"
  );
}
function Bt() {
  try {
    zr();
  } catch (e) {
    console.error("[ugsci] Failed to build plugin:", e), setTimeout(Bt, 500);
  }
}
var jn;
if ((jn = window.QwenPaw) != null && jn.host)
  Bt();
else {
  const e = setInterval(() => {
    var t;
    (t = window.QwenPaw) != null && t.host && (clearInterval(e), Bt());
  }, 200);
  setTimeout(() => clearInterval(e), 1e4);
}
