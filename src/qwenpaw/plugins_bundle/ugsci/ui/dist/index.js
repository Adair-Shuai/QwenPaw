function P() {
  var t;
  const e = (t = window.QwenPaw) == null ? void 0 : t.host;
  if (!e) throw new Error("[ugsci] QwenPaw.host not available");
  return e;
}
function Za() {
  try {
    return P().getApiToken() || "";
  } catch {
    return "";
  }
}
function Lt(e) {
  return P().getApiUrl(e);
}
function el(e) {
  const t = Za();
  return {
    "Content-Type": "application/json",
    ...t ? { Authorization: `Bearer ${t}` } : {},
    ...e
  };
}
function tl(e) {
  const t = new Headers(e), l = {};
  return t.forEach((n, a) => {
    l[a] = n;
  }), l;
}
function Je(e, t) {
  const l = P(), n = tl(t == null ? void 0 : t.headers);
  return l.fetch ? l.fetch(e, { ...t, headers: n }) : fetch(l.getApiUrl(e), {
    ...t,
    headers: { ...el(), ...n }
  });
}
const gt = /* @__PURE__ */ new Map(), nl = 15e3;
function al(e) {
  return e ? e instanceof Headers ? e.get("X-Agent-Id") || e.get("x-agent-id") || "" : e["X-Agent-Id"] || e["x-agent-id"] || "" : "";
}
function ll(e, t, l) {
  return `${e}:${t}:${l}`;
}
function ft() {
  gt.clear();
}
function tn(e) {
  for (const [t, l] of gt)
    (e ? l.agentId === e : l.agentId) && gt.delete(t);
}
async function ie(e, t) {
  const l = ((t == null ? void 0 : t.method) || "GET").toUpperCase(), { bypassCache: n, ...a } = t || {}, r = al(
    a.headers
  ), o = ll(l, e, r);
  if (l !== "GET" && (r ? tn(r) : ft()), l === "GET" && !n) {
    const d = gt.get(o);
    if (d && Date.now() - d.ts < nl)
      return d.data;
  }
  const c = await Je(e, a);
  if (!c.ok) {
    const d = await c.text().catch(() => "");
    throw new Error(d || `HTTP ${c.status}`);
  }
  if (c.status === 204) return null;
  const s = await c.json();
  return l === "GET" && gt.set(o, {
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
function ct() {
  try {
    return localStorage.getItem("qwenpaw_sidebar_mode") === "simple";
  } catch {
    return !1;
  }
}
function Rt(e, t) {
  const l = P();
  return l.ReactMarkdown && l.remarkGfm ? t.createElement(
    l.ReactMarkdown,
    { remarkPlugins: [l.remarkGfm] },
    e
  ) : e.replace(/\*\*(.+?)\*\*/g, "$1").replace(/\*(.+?)\*/g, "$1").replace(/`(.+?)`/g, "$1").replace(/^#+\s*/gm, "").replace(/^[-*]\s+/gm, "• ");
}
function Bt({
  title: e,
  subtitle: t,
  extra: l
}) {
  const n = P().React, { Space: a } = P().antd;
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
    l ? n.createElement(a, null, l) : null
  );
}
async function Ut() {
  const e = await ie("/agents");
  return (e == null ? void 0 : e.agents) || [];
}
async function nn(e) {
  return ie(
    `/agents/${encodeURIComponent(e)}`
  );
}
async function jt(e) {
  return await ie(
    `/agents/${encodeURIComponent(e)}/skills`
  ) || [];
}
async function Nt(e = !1) {
  return await ie(`/skills/pool${e ? "?summary=true" : ""}`) || [];
}
async function rl(e) {
  const t = await ie(
    `/skills/pool/${encodeURIComponent(e)}/content`
  );
  return (t == null ? void 0 : t.content) || "";
}
async function ol() {
  return await ie(
    "/skills/workspaces"
  ) || [];
}
function rt(e, t = "") {
  return `/agents/${encodeURIComponent(e)}/skills${t}`;
}
function la(e) {
  var l;
  const t = [];
  for (const n of e) {
    if (n.enabled === !1) continue;
    const a = (l = n.description) == null ? void 0 : l.trim();
    if (!a) continue;
    const r = (n.name || a).length > 20 ? (n.name || a).substring(0, 18) + "…" : n.name || a;
    let o = a;
    if (o = o.replace(/\*\*(.+?)\*\*/g, "$1").replace(/\*(.+?)\*/g, "$1").replace(/`(.+?)`/g, "$1").replace(/^#+\s*/gm, "").trim(), /^(用于|帮助|提供|支持|实现|完成|分析|计算|生成|创建|检查)/.test(o) ? o = `请${o}` : /^(a |an |the )/i.test(o) ? o = `Help me with ${o}` : /[。？！.?!]$/.test(o) || (o = `帮我${o}`), o.length > 80 && (o = o.substring(0, 77) + "..."), t.push({ label: r, value: o }), t.length >= 4) break;
  }
  return t;
}
async function sl(e) {
  return await ie("/workspace/files", {
    headers: { "X-Agent-Id": e }
  }) || [];
}
async function $t(e, t, l) {
  return ie(`/workspace/files/${encodeURIComponent(t)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify({ content: l })
  });
}
async function il(e, t, l, n) {
  return ie("/workspace/prompt-files", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify({ filename: t, content: l, enable: n })
  });
}
const cl = /* @__PURE__ */ new Set([
  "CON",
  "PRN",
  "AUX",
  "NUL",
  ...Array.from({ length: 9 }, (e, t) => `COM${t + 1}`),
  ...Array.from({ length: 9 }, (e, t) => `LPT${t + 1}`)
]);
function dl(e) {
  let t = e.trim();
  if (!t) throw new Error("请输入文件名");
  if (/[\\/]/.test(t)) throw new Error("文件名不能包含路径分隔符");
  if (/[<>:\"|?*\u0000-\u001f]/.test(t))
    throw new Error("文件名包含系统不支持的字符");
  if (/[ .]$/.test(t)) throw new Error("文件名不能以空格或句点结尾");
  t.toLowerCase().endsWith(".md") ? t = `${t.slice(0, -3)}.md` : t += ".md";
  const l = t.split(".", 1)[0].toUpperCase();
  if (!t.slice(0, -3)) throw new Error("文件名不能为空");
  if (cl.has(l))
    throw new Error("该文件名是系统保留名称，请更换");
  if (new TextEncoder().encode(t).length > 255)
    throw new Error("文件名过长");
  return t;
}
async function ml(e, t) {
  const l = await nn(e);
  l.system_prompt_files = t, await ie(`/agents/${encodeURIComponent(e)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(l)
  });
}
async function an(e, t) {
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
async function ra(e, t) {
  await ie(
    rt(e, `/${encodeURIComponent(t)}/enable`),
    {
      method: "POST"
    }
  );
}
async function ln(e, t) {
  await ie(rt(e, `/${encodeURIComponent(t)}`), {
    method: "DELETE"
  });
}
async function ul(e, t) {
  return ie(rt(e, "/batch-enable"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(t)
  });
}
async function pl(e, t) {
  return ie(rt(e, "/batch-disable"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(t)
  });
}
async function gl(e, t) {
  return ie(rt(e, "/batch-delete"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(t)
  });
}
async function rn(e) {
  return await ie("/mcp", {
    headers: { "X-Agent-Id": e }
  }) || [];
}
async function oa(e, t) {
  await ie(`/mcp/${encodeURIComponent(t)}`, {
    method: "DELETE",
    headers: { "X-Agent-Id": e }
  });
}
async function on(e, t) {
  return ie("/mcp", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify(t)
  });
}
async function fl(e, t) {
  return ie(
    `/mcp/toggle/${encodeURIComponent(t)}`,
    {
      method: "PATCH",
      headers: { "X-Agent-Id": e }
    }
  );
}
async function sa(e, t) {
  await ie(
    rt(e, `/${encodeURIComponent(t)}/disable`),
    {
      method: "POST"
    }
  );
}
async function yl(e) {
  await ie(`/skills/pool/${encodeURIComponent(e)}`, {
    method: "DELETE"
  });
}
function El(e) {
  const t = (e || "").trim();
  if (!t) return { number: 6, unit: "h" };
  const l = t.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/i);
  if (!l) return { number: 6, unit: "h" };
  const n = parseInt(l[1] || "0", 10), a = parseInt(l[2] || "0", 10), r = parseInt(l[3] || "0", 10), o = n * 60 + a + Math.round(r / 60);
  return o <= 0 ? { number: 6, unit: "h" } : o >= 60 && o % 60 === 0 ? { number: o / 60, unit: "h" } : { number: o, unit: "m" };
}
function hl(e) {
  return e.unit === "h" ? `${e.number}h` : `${e.number}m`;
}
async function vl(e) {
  return ie("/config/heartbeat", {
    headers: { "X-Agent-Id": e }
  });
}
async function bl(e, t) {
  return ie("/config/heartbeat", {
    method: "PUT",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify(t)
  });
}
async function wl(e) {
  await ie("/config/heartbeat/run", {
    method: "POST",
    headers: { "X-Agent-Id": e }
  });
}
async function Sl(e) {
  return ie("/workspace/running-config", {
    headers: { "X-Agent-Id": e }
  });
}
async function xl(e, t) {
  return ie("/workspace/running-config", {
    method: "PUT",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify(t)
  });
}
async function kl(e) {
  return (await ie("/workspace/language", {
    headers: { "X-Agent-Id": e }
  })).language || "zh";
}
async function Cl(e, t) {
  await ie("/workspace/language", {
    method: "PUT",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify({ language: t })
  });
}
async function Tl() {
  return (await ie("/config/user-timezone")).timezone || "UTC";
}
async function _l(e) {
  await ie("/config/user-timezone", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ timezone: e })
  });
}
async function Il(e) {
  return await ie("/workspace/system-prompt-files", {
    headers: { "X-Agent-Id": e }
  }) || [];
}
const Bn = ["AGENTS.md", "SOUL.md", "PROFILE.md"];
function Un({
  items: e,
  max: t = 5,
  color: l = "blue",
  emptyText: n = "无"
}) {
  const a = P().React, { Tag: r } = P().antd;
  return !e || e.length === 0 ? a.createElement(
    "span",
    { style: { fontSize: 12, color: "var(--ant-color-text-quaternary, #bfbfbf)" } },
    n
  ) : a.createElement(
    "div",
    { style: { display: "flex", flexWrap: "wrap", gap: 4 } },
    ...e.slice(0, t).map(
      (o, c) => a.createElement(
        r,
        { key: c, color: l, style: { fontSize: 11, marginRight: 0 } },
        o
      )
    ),
    e.length > t ? a.createElement(
      r,
      { style: { fontSize: 11, marginRight: 0 } },
      `+${e.length - t}`
    ) : null
  );
}
function ia({
  open: e,
  onClose: t,
  poolSkills: l,
  installedSkillNames: n,
  loading: a,
  onInstall: r
}) {
  const o = P().React, { useState: c, useEffect: s, useMemo: d } = o, { Modal: u, Button: h, Empty: w, Spin: m, Input: p, Tag: g, Tooltip: f, Typography: E } = P().antd, { CheckOutlined: $, SearchOutlined: z } = P().antdIcons || {}, { Text: _ } = E, [O, D] = c([]), [H, L] = c("");
  s(() => {
    e && (D([]), L(""));
  }, [e]);
  const I = d(() => {
    if (!H.trim()) return l;
    const x = H.toLowerCase();
    return l.filter(
      (S) => {
        var M, k;
        return S.name.toLowerCase().includes(x) || ((M = S.description) == null ? void 0 : M.toLowerCase().includes(x)) || ((k = S.tags) == null ? void 0 : k.some((V) => V.toLowerCase().includes(x)));
      }
    );
  }, [l, H]), G = I.filter(
    (x) => !n.includes(x.name)
  ), W = (x) => {
    D(
      (S) => S.includes(x) ? S.filter((M) => M !== x) : [...S, x]
    );
  }, T = async () => {
    O.length !== 0 && (await r(O), D([]));
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
          _,
          { type: "secondary", style: { fontSize: 13 } },
          `已选择 ${O.length} 个技能`
        ),
        o.createElement(
          "div",
          { style: { display: "flex", gap: 8 } },
          o.createElement(h, { onClick: t }, "取消"),
          o.createElement(
            h,
            {
              type: "primary",
              onClick: T,
              disabled: O.length === 0
            },
            O.length > 0 ? `添加 (${O.length})` : "添加"
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
      o.createElement(p, {
        placeholder: "搜索技能名称、描述或标签...",
        prefix: z ? o.createElement(z) : void 0,
        value: H,
        onChange: (x) => L(x.target.value),
        allowClear: !0,
        style: { flex: 1 }
      }),
      o.createElement(
        h,
        {
          size: "small",
          type: "primary",
          onClick: () => D(G.map((x) => x.name))
        },
        "全选"
      ),
      o.createElement(
        h,
        {
          size: "small",
          onClick: () => D([])
        },
        "清空"
      )
    ),
    // Skill grid (card style matching Skill Center)
    a ? o.createElement(
      "div",
      { style: { textAlign: "center", padding: 40 } },
      o.createElement(m, { size: "large" })
    ) : I.length === 0 ? o.createElement(w, {
      description: H ? "未找到匹配的技能" : "技能池暂无可用技能",
      image: w.PRESENTED_IMAGE_SIMPLE
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
      ...I.map((x) => {
        const S = O.includes(x.name), M = n.includes(x.name);
        return o.createElement(
          "div",
          {
            key: x.name,
            onClick: () => !M && W(x.name),
            style: {
              position: "relative",
              padding: "10px 12px",
              border: `1px solid ${S ? "#0072f5" : "var(--ant-color-border-secondary, #e8e8e8)"}`,
              borderRadius: 6,
              cursor: M ? "not-allowed" : "pointer",
              transition: "all 0.15s ease",
              background: S ? "rgba(0, 114, 245, 0.06)" : M ? "var(--ant-color-fill-quaternary, #fafafa)" : "var(--ant-color-bg-container, #fff)",
              opacity: M ? 0.5 : 1,
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
            $ ? o.createElement($) : "✓"
          ) : null,
          M ? o.createElement(
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
                paddingRight: M || S ? 24 : 0
              }
            },
            o.createElement(
              "span",
              { style: { fontSize: 16 } },
              x.emoji || "⚡"
            ),
            o.createElement(
              f,
              { title: x.name },
              o.createElement(
                _,
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
              (k, V) => o.createElement(
                g,
                {
                  key: V,
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
function ca({
  agentId: e,
  systemPromptFiles: t,
  onRefresh: l
}) {
  const n = P().React, { useState: a, useEffect: r, useCallback: o, useRef: c } = n, {
    List: s,
    Tag: d,
    Switch: u,
    Button: h,
    Modal: w,
    Input: m,
    Spin: p,
    Empty: g,
    message: f,
    Typography: E,
    Segmented: $,
    Alert: z
  } = P().antd, { FileTextOutlined: _, PlusOutlined: O, EditOutlined: D, ReloadOutlined: H } = P().antdIcons || {}, { Text: L } = E, [I, G] = a([]), [W, T] = a(!0), [x, S] = a(
    t || []
  ), [M, k] = a(!1), [V, Q] = a(null), [j, R] = a(""), [y, ne] = a(""), [K, C] = a(!1), [q, re] = a("source"), Y = c(0), te = o(async () => {
    const se = ++Y.current;
    T(!0);
    try {
      const le = await sl(e);
      se === Y.current && G(le);
    } catch (le) {
      se === Y.current && (f.error(le.message || "加载工作区文档失败"), G([]));
    } finally {
      se === Y.current && T(!1);
    }
  }, [e]);
  r(() => {
    te();
  }, [te]), r(() => {
    S(t || []);
  }, [t]);
  const fe = async (se, le) => {
    const Ee = new Set(x);
    if (le)
      Ee.add(se);
    else {
      if (Bn.includes(se) && se === "AGENTS.md") {
        f.warning("AGENTS.md 是核心文件，不能停用");
        return;
      }
      Ee.delete(se);
    }
    const he = Array.from(Ee);
    S(he);
    try {
      await ml(e, he), f.success(le ? "已启用记忆文件" : "已停用记忆文件"), l();
    } catch (Te) {
      f.error(Te.message || "更新失败"), S(t || []);
    }
  }, B = async (se) => {
    try {
      const le = await ie(
        `/workspace/files/${encodeURIComponent(se)}`,
        { headers: { "X-Agent-Id": e } }
      );
      Q(se), R(le.content || ""), re("source"), k(!0);
    } catch (le) {
      f.error(le.message || "读取文件失败");
    }
  }, oe = () => {
    Q(null), R(""), ne(""), re("source"), k(!0);
  }, pe = async () => {
    let se;
    try {
      se = dl(V || y);
    } catch (le) {
      f.warning(le.message || "文件名无效");
      return;
    }
    if (!j.trim()) {
      f.warning("Markdown 文档不能为空");
      return;
    }
    if (new TextEncoder().encode(j).length > 1024 * 1024) {
      f.warning("Markdown 文档不能超过 1 MB");
      return;
    }
    C(!0);
    try {
      if (V)
        await $t(e, se, j);
      else {
        const le = await il(
          e,
          se,
          j,
          !0
        );
        S(le.system_prompt_files);
      }
      f.success("保存成功"), k(!1), te(), l();
    } catch (le) {
      const Ee = le != null && le.message ? `：${le.message}` : "";
      f.error(
        V ? (le == null ? void 0 : le.message) || "保存失败" : `创建并挂载失败，服务端已回滚文件${Ee}`
      );
    } finally {
      C(!1);
    }
  };
  return W ? n.createElement(
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
        _ ? n.createElement(_, {
          style: { fontSize: 14, color: "#1677ff" }
        }) : null,
        n.createElement(
          L,
          { strong: !0 },
          `工作区文档 (${I.length})`
        ),
        n.createElement(
          L,
          { type: "secondary", style: { fontSize: 12 } },
          `· ${x.length} 个已挂载到系统提示`
        )
      ),
      n.createElement(
        "div",
        { style: { display: "flex", gap: 8 } },
        n.createElement(
          h,
          {
            size: "small",
            icon: H ? n.createElement(H) : void 0,
            onClick: te
          },
          "刷新"
        ),
        n.createElement(
          h,
          {
            type: "primary",
            size: "small",
            icon: O ? n.createElement(O) : void 0,
            onClick: oe
          },
          "新建 Markdown 文档"
        )
      )
    ),
    I.length === 0 ? n.createElement(g, {
      description: "暂无 Markdown 文档，点击「新建 Markdown 文档」添加",
      image: g.PRESENTED_IMAGE_SIMPLE
    }) : n.createElement(s, {
      dataSource: I,
      renderItem: (se) => {
        const le = x.includes(se.filename), Ee = Bn.includes(se.filename);
        return n.createElement(
          s.Item,
          {
            actions: [
              n.createElement(
                h,
                {
                  type: "link",
                  size: "small",
                  icon: D ? n.createElement(D) : void 0,
                  onClick: () => B(se.filename)
                },
                "编辑"
              )
            ]
          },
          n.createElement(s.Item.Meta, {
            avatar: n.createElement(_, {
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
              n.createElement(L, null, se.filename),
              Ee ? n.createElement(
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
              `${(se.size / 1024).toFixed(1)} KB · 修改于 ${new Date(se.modified_time).toLocaleString()}`
            )
          }),
          n.createElement(u, {
            checked: le,
            size: "small",
            onChange: (he) => fe(se.filename, he)
          })
        );
      }
    }),
    // Edit/New file modal
    n.createElement(
      w,
      {
        open: M,
        onCancel: () => k(!1),
        title: V ? `编辑 ${V}` : "新建 Markdown 文档",
        width: 700,
        onOk: pe,
        confirmLoading: K,
        okText: "保存"
      },
      V ? null : n.createElement(
        "div",
        { style: { marginBottom: 12 } },
        n.createElement(m, {
          placeholder: "文件名（如：油藏工程记忆库.md）",
          value: y,
          onChange: (se) => ne(se.target.value),
          addonAfter: y.endsWith(".md") ? "" : ".md"
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
        n.createElement($, {
          size: "small",
          value: q,
          options: [
            { label: "源码", value: "source" },
            { label: "预览", value: "preview" }
          ],
          onChange: (se) => re(se)
        }),
        n.createElement(
          L,
          { type: "secondary", style: { fontSize: 12 } },
          `${j.length} 字符 · 约 ${Math.ceil(j.length / 4)} tokens · ${V && x.includes(V) ? "已挂载" : V ? "未挂载" : "保存后自动挂载"}`
        )
      ),
      j.trim() ? null : n.createElement(z, {
        type: "warning",
        showIcon: !0,
        message: "文档内容为空，保存前需要填写 Markdown 内容",
        style: { marginBottom: 10 }
      }),
      q === "source" ? n.createElement(m.TextArea, {
        value: j,
        onChange: (se) => R(se.target.value),
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
        Rt(j, n)
      )
    )
  );
}
function zl({
  skills: e,
  agentId: t
}) {
  const l = P().React, { useMemo: n } = l, {
    List: a,
    Tag: r,
    Typography: o,
    Empty: c,
    Button: s,
    message: d
  } = P().antd, { ThunderboltOutlined: u, CopyOutlined: h } = P().antdIcons || {}, { Text: w } = o, m = n(() => la(e), [e]), p = (f) => {
    try {
      const E = P();
      E.setSelectedAgent && E.setSelectedAgent(t);
    } catch {
    }
    try {
      sessionStorage.setItem("ugsci_pending_prompt", f.value);
    } catch {
    }
    window.history.pushState({}, "", "/chat"), window.dispatchEvent(new PopStateEvent("popstate"));
  }, g = (f) => {
    var E;
    (E = navigator.clipboard) == null || E.writeText(f.value).then(() => {
      d.success("已复制到剪贴板");
    });
  };
  return m.length === 0 ? l.createElement(c, {
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
        w,
        { strong: !0 },
        `推荐提问 (${m.length})`
      ),
      l.createElement(
        w,
        { type: "secondary", style: { fontSize: 12 } },
        "· 从技能描述中自动提取"
      )
    ),
    l.createElement(a, {
      dataSource: m,
      renderItem: (f, E) => l.createElement(
        a.Item,
        {
          actions: [
            l.createElement(
              s,
              {
                type: "link",
                size: "small",
                icon: h ? l.createElement(h) : void 0,
                onClick: () => g(f)
              },
              "复制"
            )
          ]
        },
        l.createElement(a.Item.Meta, {
          avatar: l.createElement(
            r,
            { color: "blue", style: { borderRadius: "50%" } },
            `${E + 1}`
          ),
          title: l.createElement(
            "div",
            {
              style: {
                cursor: "pointer",
                color: "#1677ff"
              },
              onClick: () => p(f)
            },
            f.value
          ),
          description: l.createElement(
            w,
            { type: "secondary", style: { fontSize: 12 } },
            f.label
          )
        })
      )
    })
  );
}
const at = {
  marginBottom: 4,
  fontSize: 13,
  fontWeight: 500,
  color: "rgba(0,0,0,0.85)",
  display: "flex",
  alignItems: "center",
  gap: 4
}, da = { marginBottom: 16 }, ma = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "0 16px",
  marginBottom: 16
}, Ve = {
  fontSize: 13,
  fontWeight: 600,
  color: "rgba(0,0,0,0.85)",
  marginBottom: 12,
  paddingBottom: 8,
  borderBottom: "1px solid #f0f0f0"
}, ua = {
  fontSize: 12,
  color: "rgba(0,0,0,0.45)",
  marginLeft: 8
};
function Al({ agentId: e }) {
  const t = P().React, { useState: l, useEffect: n, useCallback: a } = t, {
    Switch: r,
    InputNumber: o,
    Select: c,
    Button: s,
    Spin: d,
    Space: u,
    Typography: h,
    message: w
  } = P().antd, { PlayCircleOutlined: m, SaveOutlined: p } = P().antdIcons || {}, { Text: g } = h, [f, E] = l(!0), [$, z] = l(!1), [_, O] = l(!1), [D, H] = l(!1), [L, I] = l(6), [G, W] = l("h"), [T, x] = l("main"), [S, M] = l(300), [k, V] = l(!1), [Q, j] = l("08:00"), [R, y] = l("22:00"), ne = a(async () => {
    var te, fe;
    E(!0);
    try {
      const B = await vl(e), oe = El(B.every ?? "6h");
      H(B.enabled ?? !1), I(oe.number), W(oe.unit), x(B.target ?? "main"), M(B.timeoutSeconds ?? 300), V(!!B.activeHours), j(((te = B.activeHours) == null ? void 0 : te.start) ?? "08:00"), y(((fe = B.activeHours) == null ? void 0 : fe.end) ?? "22:00");
    } catch (B) {
      w.error(B.message || "加载心跳配置失败");
    } finally {
      E(!1);
    }
  }, [e]);
  n(() => {
    ne();
  }, [ne]);
  const K = async () => {
    z(!0);
    try {
      await bl(e, {
        enabled: D,
        every: hl({ number: L, unit: G }),
        target: T,
        timeoutSeconds: S,
        activeHours: k && Q && R ? { start: Q, end: R } : void 0
      }), w.success("心跳配置已保存");
    } catch (te) {
      w.error(te.message || "保存心跳配置失败");
    } finally {
      z(!1);
    }
  }, C = async () => {
    O(!0);
    try {
      await wl(e), w.success("已触发心跳检查");
    } catch (te) {
      w.error(te.message || "触发心跳失败");
    } finally {
      O(!1);
    }
  };
  if (f)
    return t.createElement(
      "div",
      { style: { textAlign: "center", padding: 40 } },
      t.createElement(d, { size: "large" })
    );
  const q = (te, fe, B) => t.createElement(
    "div",
    { style: da },
    t.createElement("div", { style: at }, te),
    fe,
    B ? t.createElement(
      g,
      { type: "secondary", style: ua },
      B
    ) : null
  ), re = (te, fe, B, oe) => t.createElement(
    "div",
    { style: ma },
    t.createElement(
      "div",
      null,
      t.createElement("div", { style: at }, te),
      fe
    ),
    t.createElement(
      "div",
      null,
      t.createElement("div", { style: at }, B),
      oe
    )
  ), { Divider: Y } = P().antd;
  return t.createElement(
    "div",
    { style: { paddingBottom: 8 } },
    // ── Section: 基本设置 ──
    t.createElement("div", { style: Ve }, "基本设置"),
    q(
      "启用心跳",
      t.createElement(r, {
        checked: D,
        onChange: (te) => H(te)
      }),
      D ? "已启用，专家将定期自检" : "已停用"
    ),
    re(
      "检查频率",
      t.createElement(
        u,
        null,
        t.createElement(o, {
          min: 1,
          value: L,
          onChange: (te) => I(te ?? 1),
          style: { width: "100%" }
        }),
        t.createElement(c, {
          value: G,
          onChange: (te) => W(te),
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
        onChange: (te) => x(te),
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
        value: S,
        onChange: (te) => M(te ?? 300),
        style: { width: 200 }
      })
    ),
    // ── Section: 活跃时段 ──
    t.createElement(Y, { style: { margin: "8px 0 16px" } }),
    t.createElement("div", { style: Ve }, "活跃时段"),
    q(
      "启用活跃时段限制",
      t.createElement(r, {
        checked: k,
        onChange: (te) => V(te)
      }),
      "仅在指定时段内触发心跳"
    ),
    k ? re(
      "开始时间",
      t.createElement("input", {
        type: "time",
        value: Q,
        onChange: (te) => j(te.target.value),
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
        onChange: (te) => y(te.target.value),
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
          icon: p ? t.createElement(p) : void 0,
          loading: $,
          onClick: K,
          style: je
        },
        "保存配置"
      ),
      t.createElement(
        s,
        {
          icon: m ? t.createElement(m) : void 0,
          loading: _,
          onClick: C
        },
        "立即执行"
      )
    )
  );
}
function $l({
  agentId: e,
  onRefresh: t
}) {
  const l = P().React, { useState: n, useEffect: a, useCallback: r } = l, {
    List: o,
    Tag: c,
    Switch: s,
    Button: d,
    Empty: u,
    Spin: h,
    Typography: w,
    message: m
  } = P().antd, { PlusOutlined: p, ReloadOutlined: g, DeleteOutlined: f } = P().antdIcons || {}, { Text: E, Paragraph: $ } = w, [z, _] = n([]), [O, D] = n(!0), [H, L] = n(!1), [I, G] = n([]), [W, T] = n(!1), x = r(async () => {
    D(!0);
    try {
      const j = await jt(e);
      _(j);
    } catch (j) {
      m.error(j.message || "加载技能失败"), _([]);
    } finally {
      D(!1);
    }
  }, [e]);
  a(() => {
    x();
  }, [x]);
  const S = async () => {
    L(!0), T(!0);
    try {
      const j = await Nt(!0);
      G(j);
    } catch (j) {
      m.error(j.message || "加载技能池失败");
    } finally {
      T(!1);
    }
  }, M = async (j) => {
    let R = 0, y = 0;
    for (const ne of j)
      try {
        await an(e, ne), R++;
      } catch {
        y++;
      }
    R > 0 ? (m.success(
      `成功添加 ${R} 个技能${y > 0 ? `，${y} 个失败` : ""}`
    ), x(), t()) : y > 0 && m.error("添加技能失败"), L(!1);
  }, k = async (j, R) => {
    try {
      R ? await ra(e, j.name) : await sa(e, j.name), m.success(R ? "已启用" : "已停用"), x(), t();
    } catch (y) {
      m.error(y.message || "操作失败");
    }
  }, V = async (j) => {
    try {
      await ln(e, j), m.success(`技能「${j}」已移除`), x(), t();
    } catch (R) {
      m.error(R.message || "移除技能失败");
    }
  };
  if (O)
    return l.createElement(
      "div",
      { style: { textAlign: "center", padding: 40 } },
      l.createElement(h, { size: "large" })
    );
  const Q = z.filter((j) => j.enabled !== !1);
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
        E,
        { strong: !0 },
        `技能列表 (${z.length}，已启用 ${Q.length})`
      ),
      l.createElement(
        "div",
        { style: { display: "flex", gap: 8 } },
        l.createElement(
          d,
          {
            size: "small",
            icon: g ? l.createElement(g) : void 0,
            onClick: () => {
              ft(), x();
            }
          },
          "刷新"
        ),
        l.createElement(
          d,
          {
            type: "primary",
            size: "small",
            icon: p ? l.createElement(p) : void 0,
            onClick: S,
            style: je
          },
          "从技能池添加"
        )
      )
    ),
    z.length === 0 ? l.createElement(u, {
      description: "该专家暂无技能",
      image: u.PRESENTED_IMAGE_SIMPLE
    }) : l.createElement(o, {
      dataSource: z,
      renderItem: (j) => l.createElement(
        o.Item,
        {
          actions: [
            l.createElement(s, {
              key: "toggle",
              size: "small",
              checked: j.enabled !== !1,
              onChange: (R) => k(j, R)
            }),
            l.createElement(
              d,
              {
                key: "del",
                type: "link",
                size: "small",
                danger: !0,
                icon: f ? l.createElement(f) : void 0,
                onClick: () => V(j.name)
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
            j.emoji ? l.createElement(
              "span",
              { style: { fontSize: 16 } },
              j.emoji
            ) : null,
            l.createElement(E, { strong: !0 }, j.name),
            j.version_text ? l.createElement(
              c,
              { style: { fontSize: 10 } },
              `v${j.version_text}`
            ) : null
          ),
          j.description ? l.createElement(
            $,
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
    l.createElement(ia, {
      open: H,
      onClose: () => L(!1),
      poolSkills: I,
      installedSkillNames: z.map((j) => j.name),
      loading: W,
      onInstall: M
    })
  );
}
function Pl({
  agentId: e,
  onRefresh: t,
  isActive: l
}) {
  const n = P().React, { useState: a, useEffect: r, useCallback: o } = n, {
    List: c,
    Tag: s,
    Button: d,
    Empty: u,
    Spin: h,
    Modal: w,
    Input: m,
    Typography: p,
    message: g
  } = P().antd, { PlusOutlined: f, ReloadOutlined: E, DeleteOutlined: $ } = P().antdIcons || {}, { Text: z, Paragraph: _ } = p, { TextArea: O } = m, [D, H] = a([]), [L, I] = a(!0), [G, W] = a(!1), [T, x] = a(`{
  "mcpServers": {
    "example-client": {
      "command": "npx",
      "args": ["-y", "@example/mcp-server"],
      "env": {}
    }
  }
}`), [S, M] = a(!1), k = o(async () => {
    I(!0);
    try {
      const R = await rn(e);
      H(R);
    } catch (R) {
      g.error(R.message || "加载 MCP 失败"), H([]);
    } finally {
      I(!1);
    }
  }, [e]);
  r(() => {
    k();
  }, [k]), r(() => {
    l && k();
  }, [l, k]);
  const V = async (R) => {
    try {
      await fl(e, R), g.success("已切换 MCP 状态"), k(), t();
    } catch (y) {
      g.error(y.message || "切换失败");
    }
  }, Q = async (R) => {
    try {
      await oa(e, R), g.success(`MCP「${R}」已移除`), k(), t();
    } catch (y) {
      g.error(y.message || "移除 MCP 失败");
    }
  }, j = async () => {
    M(!0);
    try {
      const R = JSON.parse(T), y = R.mcpServers || R, ne = Object.entries(y);
      if (ne.length === 0) {
        g.warning("未找到 MCP 客户端配置");
        return;
      }
      for (const [K, C] of ne) {
        const q = C, re = q.url ? "streamable_http" : "stdio";
        await on(e, {
          client_key: K,
          client: {
            name: q.name || K,
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
      g.success("MCP 客户端已创建"), W(!1), k(), t();
    } catch (R) {
      R instanceof SyntaxError ? g.error("JSON 格式错误：" + R.message) : g.error(R.message || "创建 MCP 失败");
    } finally {
      M(!1);
    }
  };
  return L ? n.createElement(
    "div",
    { style: { textAlign: "center", padding: 40 } },
    n.createElement(h, { size: "large" })
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
      n.createElement(z, { strong: !0 }, `MCP 客户端 (${D.length})`),
      n.createElement(
        "div",
        { style: { display: "flex", gap: 8 } },
        n.createElement(
          d,
          {
            size: "small",
            icon: E ? n.createElement(E) : void 0,
            onClick: () => {
              ft(), k();
            }
          },
          "刷新"
        ),
        n.createElement(
          d,
          {
            type: "primary",
            size: "small",
            icon: f ? n.createElement(f) : void 0,
            onClick: () => W(!0),
            style: je
          },
          "添加 MCP"
        )
      )
    ),
    D.length === 0 ? n.createElement(u, {
      description: "该专家暂无 MCP 客户端",
      image: u.PRESENTED_IMAGE_SIMPLE
    }) : n.createElement(c, {
      dataSource: D,
      renderItem: (R) => n.createElement(
        c.Item,
        {
          actions: [
            n.createElement(
              d,
              {
                key: "toggle",
                size: "small",
                onClick: () => V(R.key)
              },
              R.enabled ? "停用" : "启用"
            ),
            n.createElement(
              d,
              {
                key: "del",
                type: "link",
                size: "small",
                danger: !0,
                icon: $ ? n.createElement($) : void 0,
                onClick: () => Q(R.key)
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
            n.createElement(z, { strong: !0 }, R.name || R.key),
            n.createElement(
              s,
              {
                color: R.enabled ? "green" : "default",
                style: { fontSize: 10 }
              },
              R.enabled ? "启用" : "停用"
            ),
            n.createElement(
              s,
              { color: "purple", style: { fontSize: 10 } },
              R.transport
            )
          ),
          R.description ? n.createElement(
            _,
            {
              type: "secondary",
              style: { fontSize: 12, margin: 0 },
              ellipsis: { rows: 2 }
            },
            R.description
          ) : null,
          R.tools && R.tools.length > 0 ? n.createElement(
            "div",
            { style: { marginTop: 4, fontSize: 11, color: "var(--ant-color-text-tertiary, #8c8c8c)" } },
            `提供 ${R.tools.length} 个工具`
          ) : null
        )
      )
    }),
    // Create MCP modal
    n.createElement(
      w,
      {
        open: G,
        title: "添加 MCP 客户端 (JSON)",
        onCancel: () => W(!1),
        onOk: j,
        confirmLoading: S,
        okText: "创建",
        width: 560
      },
      n.createElement(
        "div",
        { style: { marginBottom: 8, fontSize: 12, color: "var(--ant-color-text-tertiary, #8c8c8c)" } },
        "粘贴 MCP 配置 JSON（支持 mcpServers 格式），将创建到当前专家工作区："
      ),
      n.createElement(O, {
        value: T,
        onChange: (R) => x(R.target.value),
        rows: 12,
        style: { fontFamily: "monospace", fontSize: 12 }
      })
    )
  );
}
function Ol({ agentId: e }) {
  const t = P().React, { useState: l, useEffect: n, useCallback: a, useRef: r } = t, {
    Card: o,
    InputNumber: c,
    Input: s,
    Select: d,
    Switch: u,
    Button: h,
    Spin: w,
    Space: m,
    Typography: p,
    Divider: g,
    message: f
  } = P().antd, { SaveOutlined: E } = P().antdIcons || {}, { Text: $ } = p, [z, _] = l(!0), [O, D] = l(!1), H = r(null), [L, I] = l(60), [G, W] = l(""), [T, x] = l(!0), [S, M] = l(30), [k, V] = l("zh"), [Q, j] = l("UTC"), [R, y] = l(!0), [ne, K] = l(100), [C, q] = l(!0), [re, Y] = l(3), [te, fe] = l(1), [B, oe] = l(!0), [pe, se] = l(3), [le, Ee] = l(2), [he, Te] = l(60), [Oe, be] = l(1), [ee, Se] = l(0), [ye, X] = l(1), [de, ge] = l(0), [J, b] = l(30), [me, F] = l(50), [v, ae] = l("light"), [ce, ze] = l("scroll"), [_e, Re] = l("remelight"), [Be, De] = l("AUTO"), Fe = a(async () => {
    var Z, Ae, $e, Me, He, We;
    _(!0);
    try {
      const [Ie, yt, Dt] = await Promise.all([
        Sl(e),
        kl(e).catch(() => "zh"),
        Tl().catch(() => "UTC")
      ]);
      H.current = Ie, I(Ie.shell_command_timeout ?? 60), W(Ie.shell_command_executable ?? "");
      const ot = Ie.auto_title_config ?? { enabled: !0, timeout_seconds: 30 };
      x(ot.enabled ?? !0), M(ot.timeout_seconds ?? 30), V(yt), j(Dt);
      const Ke = Ie.loop ?? {};
      y(((Z = Ke.iteration) == null ? void 0 : Z.enabled) ?? !0), K(((Ae = Ke.iteration) == null ? void 0 : Ae.max_iterations) ?? Ie.max_iters ?? 100), q((($e = Ke.doom_loop) == null ? void 0 : $e.enabled) ?? !0), Y(((Me = Ke.doom_loop) == null ? void 0 : Me.window_size) ?? 3), fe(((He = Ke.doom_loop) == null ? void 0 : He.similarity_threshold) ?? 1), oe(Ie.llm_retry_enabled ?? !0), se(Ie.llm_max_retries ?? 3), Ee(Ie.llm_backoff_base ?? 2), Te(Ie.llm_backoff_cap ?? 60), be(Ie.llm_max_concurrent ?? 1), Se(Ie.llm_max_qpm ?? 0), X(Ie.llm_rate_limit_pause ?? 1), ge(Ie.llm_rate_limit_jitter ?? 0), b(Ie.llm_acquire_timeout ?? 30), F(Ie.history_max_length ?? 50), ae(Ie.context_manager_backend ?? "light"), ze(((We = Ie.light_context_config) == null ? void 0 : We.strategy) ?? "scroll"), Re(Ie.memory_manager_backend ?? "remelight"), De(Ie.approval_level ?? "AUTO");
    } catch (Ie) {
      f.error(Ie.message || "加载运行配置失败");
    } finally {
      _(!1);
    }
  }, [e]);
  n(() => {
    Fe();
  }, [Fe]);
  const Ue = async () => {
    var Ae, $e;
    const Z = H.current;
    if (Z) {
      D(!0);
      try {
        const Me = {
          ...Z,
          max_iters: ne,
          loop: {
            ...Z.loop ?? {},
            iteration: { enabled: R, max_iterations: ne },
            doom_loop: {
              enabled: C,
              window_size: re,
              similarity_threshold: te,
              stages: (($e = (Ae = Z.loop) == null ? void 0 : Ae.doom_loop) == null ? void 0 : $e.stages) ?? []
            }
          },
          shell_command_timeout: L,
          shell_command_executable: G,
          auto_title_config: {
            enabled: T,
            timeout_seconds: S
          },
          llm_retry_enabled: B,
          llm_max_retries: pe,
          llm_backoff_base: le,
          llm_backoff_cap: he,
          llm_max_concurrent: Oe,
          llm_max_qpm: ee,
          llm_rate_limit_pause: ye,
          llm_rate_limit_jitter: de,
          llm_acquire_timeout: J,
          history_max_length: me,
          context_manager_backend: v,
          light_context_config: {
            ...Z.light_context_config ?? {},
            strategy: ce
          },
          memory_manager_backend: _e,
          approval_level: Be
        };
        await xl(e, Me), H.current = Me, k && await Cl(e, k).catch(() => {
        }), Q && await _l(Q).catch(() => {
        }), f.success("运行配置已保存");
      } catch (Me) {
        f.error(Me.message || "保存运行配置失败");
      } finally {
        D(!1);
      }
    }
  };
  if (z)
    return t.createElement(
      "div",
      { style: { textAlign: "center", padding: 40 } },
      t.createElement(w, { size: "large" })
    );
  const ke = (Z, Ae, $e) => t.createElement(
    "div",
    { style: da },
    t.createElement("div", { style: at }, Z),
    Ae,
    $e ? t.createElement(
      $,
      { type: "secondary", style: ua },
      $e
    ) : null
  ), Le = (Z, Ae, $e, Me) => t.createElement(
    "div",
    { style: ma },
    t.createElement(
      "div",
      null,
      t.createElement("div", { style: at }, Z),
      Ae
    ),
    t.createElement(
      "div",
      null,
      t.createElement("div", { style: at }, $e),
      Me
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
    Le(
      "Shell 命令超时 (秒)",
      t.createElement(c, {
        min: 1,
        value: L,
        onChange: (Z) => I(Z ?? 60),
        style: { width: "100%" }
      }),
      "Shell 可执行文件",
      t.createElement(s, {
        value: G,
        onChange: (Z) => W(Z.target.value),
        placeholder: "留空使用系统默认",
        style: { width: "100%" }
      })
    ),
    Le(
      "语言",
      t.createElement(d, {
        value: k,
        onChange: (Z) => V(Z),
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
        value: Q,
        onChange: (Z) => j(Z),
        style: { width: "100%" },
        showSearch: !0,
        filterOption: (Z, Ae) => {
          var $e;
          return ((($e = Ae == null ? void 0 : Ae.label) == null ? void 0 : $e.toString()) || "").toLowerCase().includes(Z.toLowerCase());
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
        ].map((Z) => ({ value: Z, label: Z }))
      })
    ),
    Le(
      "自动生成会话标题",
      t.createElement(m, null, t.createElement(u, {
        checked: T,
        onChange: (Z) => x(Z)
      })),
      "标题生成超时 (秒)",
      t.createElement(c, {
        min: 5,
        value: S,
        onChange: (Z) => M(Z ?? 30),
        style: { width: "100%" },
        disabled: !T
      })
    ),
    // ── Section: 审批级别 ──
    t.createElement(g, { style: { margin: "8px 0 16px" } }),
    t.createElement("div", { style: Ve }, "审批级别"),
    ke(
      "工具执行审批",
      t.createElement(d, {
        value: Be,
        onChange: (Z) => De(Z),
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
    t.createElement("div", { style: Ve }, "迭代与循环"),
    ke(
      "启用迭代限制",
      t.createElement(u, {
        checked: R,
        onChange: (Z) => y(Z)
      }),
      "停止 Agent 前的最大循环轮次"
    ),
    R ? ke(
      "最大迭代次数",
      t.createElement(c, {
        min: 1,
        max: 500,
        value: ne,
        onChange: (Z) => K(Z ?? 100),
        style: { width: "100%" }
      })
    ) : null,
    ke(
      "启用重复循环保护",
      t.createElement(u, {
        checked: C,
        onChange: (Z) => q(Z)
      }),
      "检测并阻止重复操作循环"
    ),
    C ? Le(
      "检测窗口大小",
      t.createElement(c, {
        min: 2,
        max: 20,
        value: re,
        onChange: (Z) => Y(Z ?? 3),
        style: { width: "100%" }
      }),
      "相似度阈值",
      t.createElement(c, {
        min: 0,
        max: 1,
        step: 0.05,
        value: te,
        onChange: (Z) => fe(Z ?? 1),
        style: { width: "100%" }
      })
    ) : null,
    // ── Section: LLM 重试 ──
    t.createElement(g, { style: { margin: "8px 0 16px" } }),
    t.createElement("div", { style: Ve }, "LLM 重试"),
    ke(
      "启用 LLM 重试",
      t.createElement(u, {
        checked: B,
        onChange: (Z) => oe(Z)
      })
    ),
    Le(
      "最大重试次数",
      t.createElement(c, {
        min: 1,
        value: pe,
        onChange: (Z) => se(Z ?? 3),
        style: { width: "100%" },
        disabled: !B
      }),
      "退避基数 (秒)",
      t.createElement(c, {
        min: 0.1,
        step: 0.1,
        value: le,
        onChange: (Z) => Ee(Z ?? 2),
        style: { width: "100%" },
        disabled: !B
      })
    ),
    ke(
      "退避上限 (秒)",
      t.createElement(c, {
        min: 0.5,
        step: 0.5,
        value: he,
        onChange: (Z) => Te(Z ?? 60),
        style: { width: 200 },
        disabled: !B
      })
    ),
    // ── Section: LLM 限流 ──
    t.createElement(g, { style: { margin: "8px 0 16px" } }),
    t.createElement("div", { style: Ve }, "LLM 限流"),
    Le(
      "最大并发数",
      t.createElement(c, {
        min: 1,
        value: Oe,
        onChange: (Z) => be(Z ?? 1),
        style: { width: "100%" }
      }),
      "最大 QPM (0=不限)",
      t.createElement(c, {
        min: 0,
        step: 10,
        value: ee,
        onChange: (Z) => Se(Z ?? 0),
        style: { width: "100%" }
      })
    ),
    Le(
      "限流暂停时间 (秒)",
      t.createElement(c, {
        min: 1,
        step: 0.5,
        value: ye,
        onChange: (Z) => X(Z ?? 1),
        style: { width: "100%" }
      }),
      "限流抖动 (秒)",
      t.createElement(c, {
        min: 0,
        step: 0.5,
        value: de,
        onChange: (Z) => ge(Z ?? 0),
        style: { width: "100%" }
      })
    ),
    ke(
      "获取超时 (秒)",
      t.createElement(c, {
        min: 10,
        step: 10,
        value: J,
        onChange: (Z) => b(Z ?? 30),
        style: { width: 200 }
      }),
      "应大于 限流暂停 + 抖动"
    ),
    // ── Section: 上下文与记忆 ──
    t.createElement(g, { style: { margin: "8px 0 16px" } }),
    t.createElement("div", { style: Ve }, "上下文与记忆"),
    Le(
      "上下文管理后端",
      t.createElement(d, {
        value: v,
        onChange: (Z) => ae(Z),
        style: { width: "100%" },
        options: [{ value: "light", label: "light" }]
      }),
      "上下文策略",
      t.createElement(d, {
        value: ce,
        onChange: (Z) => ze(Z),
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
        value: _e,
        onChange: (Z) => Re(Z),
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
        onChange: (Z) => F(Z ?? 50),
        style: { width: "100%" }
      })
    ),
    // ── Save button ──
    t.createElement(
      "div",
      { style: { display: "flex", justifyContent: "flex-end", marginTop: 16 } },
      t.createElement(
        h,
        {
          type: "primary",
          icon: E ? t.createElement(E) : void 0,
          loading: O,
          onClick: Ue,
          style: je
        },
        "保存运行配置"
      )
    )
  );
}
function Ml({
  expert: e,
  open: t,
  onClose: l,
  onRefresh: n
}) {
  const a = P().React, { useState: r, useEffect: o, useCallback: c } = a, { Modal: s, Tabs: d, Spin: u, Typography: h } = P().antd, { SettingOutlined: w } = P().antdIcons || {}, { Text: m } = h, [p, g] = r([]), [f, E] = r(!1), [$, z] = r("heartbeat"), _ = c(async () => {
    if (e) {
      E(!0);
      try {
        const L = await Il(e.agent.id);
        g(L);
      } catch {
        g([]);
      } finally {
        E(!1);
      }
    }
  }, [e]);
  if (o(() => {
    t && e && _();
  }, [t, e, _]), !e) return null;
  const { agent: O } = e, D = () => {
    _(), n();
  }, H = [
    {
      key: "heartbeat",
      label: "心跳",
      children: a.createElement(Al, {
        agentId: O.id
      })
    },
    {
      key: "files",
      label: "文件",
      children: f ? a.createElement(
        "div",
        { style: { textAlign: "center", padding: 40 } },
        a.createElement(u, { size: "large" })
      ) : a.createElement(ca, {
        agentId: O.id,
        systemPromptFiles: p,
        onRefresh: D
      })
    },
    {
      key: "skills",
      label: `技能 (${e.skills.filter((L) => L.enabled !== !1).length})`,
      children: a.createElement($l, {
        agentId: O.id,
        onRefresh: n
      })
    },
    {
      key: "mcp",
      label: `MCP (${e.mcps.length})`,
      children: a.createElement(Pl, {
        agentId: O.id,
        onRefresh: n,
        isActive: $ === "mcp"
      })
    },
    {
      key: "running",
      label: "运行配置",
      children: a.createElement(Ol, {
        agentId: O.id
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
        w ? a.createElement(w, { style: { fontSize: 18 } }) : null,
        a.createElement("span", null, `配置 - ${O.name}`),
        a.createElement(
          m,
          { type: "secondary", style: { fontSize: 12, fontWeight: 400 } },
          O.id
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
    a.createElement(d, {
      items: H,
      activeKey: $,
      onChange: (L) => z(L),
      size: "small",
      tabBarStyle: { marginBottom: 16 }
    })
  );
}
const Ll = [
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
], Rl = Ll;
function jn(e) {
  return Lt(`/ugsci/avatar/${encodeURIComponent(e)}`);
}
function Nn(e) {
  const t = e.map(encodeURIComponent).join(",");
  return Lt(`/ugsci/avatar/team/${t}`);
}
function Ge({
  name: e,
  size: t = 32,
  borderRadius: l = "50%"
}) {
  const n = P().React, [a, r] = n.useState(0), o = a === 0 ? jn(e) : `${jn(e)}?_r=${a}`;
  return n.createElement("img", {
    src: o,
    alt: e,
    onError: () => {
      a < 1 && r(a + 1);
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
function sn({
  members: e,
  size: t = 32,
  borderRadius: l = "50%"
}) {
  const n = P().React, [a, r] = n.useState(0);
  if (!e || e.length === 0)
    return n.createElement("span", {
      style: {
        width: t,
        height: t,
        display: "inline-block"
      }
    });
  const o = e.slice(0, 5), c = a === 0 ? Nn(o) : `${Nn(o)}?_r=${a}`;
  return n.createElement("img", {
    src: c,
    alt: "team",
    onError: () => {
      a < 1 && r(a + 1);
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
async function Dn(e) {
  var l;
  const t = P();
  if (t.refreshAgents)
    try {
      await t.refreshAgents({ force: !0 });
    } catch (n) {
      console.warn("[ugsci] Failed to refresh newly created agent:", n);
      return;
    }
  (l = t.setSelectedAgent) == null || l.call(t, e);
}
function Bl({
  expert: e,
  onClick: t,
  onSummon: l,
  onConfigure: n
}) {
  const a = P().React, { Card: r, Tag: o, Badge: c, Typography: s, Spin: d, Button: u, Tooltip: h } = P().antd, { Text: w } = s, { ThunderboltOutlined: m, SettingOutlined: p } = P().antdIcons || {}, { agent: g, skills: f, mcps: E, loading: $ } = e, z = g.enabled, _ = f.filter((H) => H.enabled !== !1).map((H) => H.name), O = E.map((H) => H.name || H.key), D = g.active_model ? `${g.active_model.provider_id}/${g.active_model.model}` : null;
  return a.createElement(
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
        a.createElement(Ge, { name: g.name, size: 36 }),
        a.createElement(
          "div",
          null,
          a.createElement(
            w,
            { strong: !0, style: { fontSize: 15 } },
            g.name
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
            g.id
          )
        )
      ),
      a.createElement(c, {
        status: z ? "success" : "default",
        text: z ? "启用" : "停用"
      })
    ),
    // Description (rendered as markdown)
    g.description ? a.createElement(
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
      Rt(g.description, a)
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
        o,
        { color: "geekblue", style: { fontSize: 11 } },
        `🤖 ${D}`
      )
    ) : null,
    // Skills
    $ ? a.createElement(d, { size: "small" }) : a.createElement(
      "div",
      { style: { marginBottom: 6 } },
      a.createElement(
        "div",
        { style: { fontSize: 11, color: "var(--ant-color-text-tertiary, #8c8c8c)", marginBottom: 4 } },
        `技能 (${_.length})`
      ),
      a.createElement(Un, {
        items: _,
        max: 4,
        color: "cyan",
        emptyText: "未配置技能"
      })
    ),
    // MCP
    !$ && O.length > 0 ? a.createElement(
      "div",
      { style: { marginTop: "auto" } },
      a.createElement(
        "div",
        { style: { fontSize: 11, color: "var(--ant-color-text-tertiary, #8c8c8c)", marginBottom: 4 } },
        `MCP (${O.length})`
      ),
      a.createElement(Un, {
        items: O,
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
        h,
        { title: "配置专家", placement: "top" },
        a.createElement(
          u,
          {
            type: "text",
            size: "small",
            icon: p ? a.createElement(p, {
              style: { fontSize: 16, color: "var(--ant-color-text-tertiary, #8c8c8c)" }
            }) : void 0,
            onClick: (H) => {
              H.stopPropagation(), n && n();
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
          disabled: !z,
          onClick: (H) => {
            H.stopPropagation(), l && l();
          },
          style: je
        },
        "召唤专家"
      )
    )
  );
}
function Ul({
  expert: e,
  open: t,
  onClose: l,
  onRefresh: n
}) {
  const a = P().React, {
    Drawer: r,
    Descriptions: o,
    Tag: c,
    Typography: s,
    Space: d,
    Button: u,
    Empty: h,
    Tabs: w,
    List: m,
    Spin: p,
    Modal: g,
    message: f
  } = P().antd, { Text: E, Paragraph: $ } = s, {
    EditOutlined: z,
    ThunderboltOutlined: _,
    FileTextOutlined: O,
    ToolOutlined: D,
    PlusOutlined: H
  } = P().antdIcons || {}, [L, I] = a.useState(!1), [G, W] = a.useState(
    []
  ), [T, x] = a.useState(!1);
  if (!e) return null;
  const { agent: S, config: M, skills: k, mcps: V, loading: Q } = e, j = k.filter((B) => B.enabled !== !1), R = (B) => {
    window.history.pushState({}, "", B), window.dispatchEvent(new PopStateEvent("popstate"));
  }, y = a.createElement(
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
          c,
          { color: S.enabled ? "green" : "default" },
          S.enabled ? "启用" : "停用"
        )
      ),
      a.createElement(
        o.Item,
        { label: "功能简介" },
        S.description ? Rt(S.description, a) : "暂无描述"
      ),
      a.createElement(
        o.Item,
        { label: "使用模型" },
        S.active_model ? `${S.active_model.provider_id} / ${S.active_model.model}` : "使用全局默认模型"
      ),
      M != null && M.workspace_dir ? a.createElement(
        o.Item,
        { label: "工作区路径" },
        a.createElement(
          "code",
          { style: { fontSize: 11 } },
          M.workspace_dir
        )
      ) : null,
      M != null && M.approval_level ? a.createElement(
        o.Item,
        { label: "审批级别" },
        M.approval_level
      ) : null
    ),
    // System prompt files
    M != null && M.system_prompt_files && M.system_prompt_files.length > 0 ? a.createElement(
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
        O ? a.createElement(O, {
          style: { fontSize: 14, color: "#1677ff" }
        }) : null,
        a.createElement(E, { strong: !0 }, "系统提示词文件")
      ),
      a.createElement(
        d,
        { wrap: !0 },
        ...M.system_prompt_files.map(
          (B, oe) => a.createElement(
            c,
            {
              key: oe,
              icon: O ? a.createElement(O) : void 0,
              style: { fontSize: 12 }
            },
            B
          )
        )
      )
    ) : null
  ), ne = async () => {
    I(!0), x(!0);
    try {
      const B = await Nt(!0);
      W(B);
    } catch (B) {
      f.error(B.message || "加载技能池失败");
    } finally {
      x(!1);
    }
  }, K = async (B) => {
    let oe = 0, pe = 0;
    for (const se of B)
      try {
        await an(S.id, se), oe++;
      } catch {
        pe++;
      }
    oe > 0 ? (f.success(
      `成功添加 ${oe} 个技能${pe > 0 ? `，${pe} 个失败` : ""}`
    ), n()) : pe > 0 && f.error("添加技能失败"), I(!1);
  }, C = async (B) => {
    try {
      await ln(S.id, B), f.success(`技能「${B}」已移除`), n();
    } catch (oe) {
      f.error(oe.message || "移除技能失败");
    }
  }, q = async (B) => {
    try {
      await oa(S.id, B), f.success(`MCP「${B}」已移除`), n();
    } catch (oe) {
      f.error(oe.message || "移除 MCP 失败");
    }
  }, re = Q ? a.createElement(
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
        E,
        { strong: !0 },
        `已启用技能 (${j.length})`
      ),
      a.createElement(
        u,
        {
          type: "primary",
          size: "small",
          icon: H ? a.createElement(H) : void 0,
          onClick: ne
        },
        "从技能池添加"
      )
    ),
    j.length === 0 ? a.createElement(h, {
      description: "该专家暂无已启用的技能",
      image: h.PRESENTED_IMAGE_SIMPLE
    }) : a.createElement(m, {
      dataSource: j,
      renderItem: (B) => a.createElement(
        m.Item,
        {
          actions: [
            a.createElement(
              u,
              {
                type: "link",
                size: "small",
                danger: !0,
                onClick: () => C(B.name)
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
            B.emoji ? a.createElement(
              "span",
              { style: { fontSize: 16 } },
              B.emoji
            ) : null,
            a.createElement(E, { strong: !0 }, B.name),
            B.version_text ? a.createElement(
              c,
              { style: { fontSize: 10 } },
              `v${B.version_text}`
            ) : null
          ),
          B.description ? a.createElement(
            $,
            {
              type: "secondary",
              style: { fontSize: 12, margin: 0 },
              ellipsis: { rows: 2 }
            },
            B.description
          ) : null,
          B.tags && B.tags.length > 0 ? a.createElement(
            "div",
            { style: { marginTop: 4 } },
            ...B.tags.map(
              (oe, pe) => a.createElement(
                c,
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
    a.createElement(ia, {
      open: L,
      onClose: () => I(!1),
      poolSkills: G,
      installedSkillNames: j.map((B) => B.name),
      loading: T,
      onInstall: K
    })
  ), Y = Q ? a.createElement(
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
        E,
        { strong: !0 },
        `MCP 客户端 (${V.length})`
      ),
      a.createElement(
        u,
        {
          type: "primary",
          size: "small",
          icon: H ? a.createElement(H) : void 0,
          onClick: () => {
            window.history.pushState({}, "", `/agents/${S.id}/mcp`), window.dispatchEvent(new PopStateEvent("popstate"));
          }
        },
        "配置 MCP"
      )
    ),
    V.length === 0 ? a.createElement(h, {
      description: "该专家暂无关联的 MCP 客户端，点击「配置 MCP」添加",
      image: h.PRESENTED_IMAGE_SIMPLE
    }) : a.createElement(m, {
      dataSource: V,
      renderItem: (B) => a.createElement(
        m.Item,
        {
          actions: [
            a.createElement(
              u,
              {
                type: "link",
                size: "small",
                danger: !0,
                onClick: () => q(B.key)
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
              B.name || B.key
            ),
            a.createElement(
              c,
              {
                color: B.enabled ? "green" : "default",
                style: { fontSize: 10 }
              },
              B.enabled ? "启用" : "停用"
            ),
            a.createElement(
              c,
              { color: "purple", style: { fontSize: 10 } },
              B.transport
            )
          ),
          B.description ? a.createElement(
            $,
            {
              type: "secondary",
              style: { fontSize: 12, margin: 0 },
              ellipsis: { rows: 2 }
            },
            B.description
          ) : null,
          B.tools && B.tools.length > 0 ? a.createElement(
            "div",
            {
              style: {
                marginTop: 4,
                fontSize: 11,
                color: "var(--ant-color-text-tertiary, #8c8c8c)"
              }
            },
            `提供 ${B.tools.length} 个工具`
          ) : null
        )
      )
    })
  ), te = M != null && M.tools ? a.createElement(
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
        JSON.stringify(M.tools, null, 2)
      )
    )
  ) : a.createElement(h, {
    description: "暂无工具配置",
    image: h.PRESENTED_IMAGE_SIMPLE
  }), fe = [
    { key: "basic", label: "基本信息", children: y },
    {
      key: "skills",
      label: `技能 (${j.length})`,
      children: re
    },
    {
      key: "prompts",
      label: "推荐提问",
      children: a.createElement(zl, {
        skills: j,
        agentId: S.id
      })
    },
    {
      key: "knowledge",
      label: "专家记忆",
      children: a.createElement(ca, {
        agentId: S.id,
        systemPromptFiles: (M == null ? void 0 : M.system_prompt_files) || [],
        onRefresh: () => n()
      })
    },
    { key: "mcp", label: `MCP (${V.length})`, children: Y },
    { key: "tools", label: "工具配置", children: te }
  ];
  return a.createElement(
    r,
    {
      title: a.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 8 } },
        a.createElement(Ge, { name: S.name, size: 28 }),
        a.createElement("span", null, S.name)
      ),
      open: t,
      onClose: l,
      width: 560,
      extra: a.createElement(
        d,
        null,
        a.createElement(
          u,
          {
            size: "small",
            icon: z ? a.createElement(z) : void 0,
            onClick: () => {
              l();
              try {
                const B = P();
                B.setSelectedAgent && B.setSelectedAgent(S.id);
              } catch (B) {
                console.warn("[ugsci] Failed to set selected agent:", B);
              }
              setTimeout(() => R("/agents"), 0);
            }
          },
          "编辑专家"
        ),
        a.createElement(
          u,
          {
            type: "primary",
            size: "small",
            icon: _ ? a.createElement(_) : void 0,
            onClick: () => {
              l();
              try {
                const B = P();
                B.setSelectedAgent && B.setSelectedAgent(S.id);
              } catch (B) {
                console.warn("[ugsci] Failed to set selected agent:", B);
              }
              setTimeout(() => R("/chat"), 0);
            }
          },
          "开始对话"
        )
      )
    },
    a.createElement(w, {
      items: fe,
      defaultActiveKey: "basic"
    })
  );
}
function jl({
  open: e,
  onClose: t,
  onCreated: l
}) {
  const n = P().React, { useState: a } = n, {
    Modal: r,
    Card: o,
    Tag: c,
    Input: s,
    Row: d,
    Col: u,
    Spin: h,
    message: w,
    Typography: m
  } = P().antd, { Text: p } = m, { FileAddOutlined: g } = P().antdIcons || {}, [f, E] = a(!1), [$, z] = a(""), [_, O] = a(!1), D = async (I) => {
    E(!0);
    try {
      const G = await ie("/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: I.id || void 0,
          name: I.name,
          description: I.description,
          skill_names: I.skillNames
        })
      }), W = I.systemPrompt.trim() || `# ${I.name}

你是${I.name}。${I.description ? `

职责：${I.description}` : ""}
`, x = (await Promise.allSettled([
        $t(G.id, "AGENTS.md", W),
        ...I.mcpClients.map(
          ({ clientKey: S, client: M }) => on(G.id, {
            client_key: S,
            client: M
          })
        )
      ])).filter(
        (S) => S.status === "rejected"
      ).length;
      x > 0 ? w.warning(
        `专家「${I.name}」已创建，${x} 项初始配置失败，可在专家配置中重试`
      ) : w.success(`专家「${I.name}」创建成功`), await Dn(G.id), O(!1), setTimeout(() => {
        t(), l();
      }, 0);
    } catch (G) {
      w.error(G.message || "创建专家失败");
    } finally {
      E(!1);
    }
  }, H = Rl.filter((I) => {
    if (!$.trim()) return !0;
    const G = $.toLowerCase();
    return I.name.toLowerCase().includes(G) || I.description.toLowerCase().includes(G) || I.category.toLowerCase().includes(G);
  }), L = async (I) => {
    E(!0);
    try {
      const G = await ie("/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: I.name,
          description: I.description,
          skill_names: I.recommended_skills
        })
      });
      await $t(G.id, "AGENTS.md", I.system_prompt);
      const W = await nn(G.id);
      W.approval_level = I.approval_level, await ie(`/agents/${encodeURIComponent(G.id)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(W)
      }), await Dn(G.id), w.success(`专家「${I.name}」创建成功`), t(), l();
    } catch (G) {
      w.error(G.message || "创建专家失败");
    } finally {
      E(!1);
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
          value: $,
          onChange: (I) => z(I.target.value),
          allowClear: !0
        })
      ),
      f ? n.createElement(
        "div",
        { style: { textAlign: "center", padding: 60 } },
        n.createElement(h, { size: "large" }),
        n.createElement(
          "div",
          { style: { marginTop: 12, color: "var(--ant-color-text-tertiary, #8c8c8c)" } },
          "正在创建专家..."
        )
      ) : n.createElement(
        d,
        { gutter: [12, 12] },
        // ── Blank template card (always first) ──
        $.trim() ? null : n.createElement(
          u,
          { xs: 24, sm: 12 },
          n.createElement(
            o,
            {
              hoverable: !0,
              size: "small",
              onClick: () => O(!0),
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
                g ? n.createElement(g) : "📝"
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
                    c,
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
        ...H.map(
          (I) => n.createElement(
            u,
            { key: I.id, xs: 24, sm: 12 },
            n.createElement(
              o,
              {
                hoverable: !0,
                size: "small",
                onClick: () => L(I),
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
                n.createElement(Ge, {
                  name: I.name,
                  size: 40
                }),
                n.createElement(
                  "div",
                  { style: { flex: 1 } },
                  n.createElement(
                    p,
                    { strong: !0, style: { fontSize: 15 } },
                    I.name
                  ),
                  n.createElement(
                    "div",
                    null,
                    n.createElement(
                      c,
                      { color: "blue", style: { fontSize: 10 } },
                      I.category
                    ),
                    I.approval_level === "MANUAL" ? n.createElement(
                      c,
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
                Rt(I.description, n)
              )
            )
          )
        )
      )
    ),
    // ── Blank template creation modal (sibling, not nested inside Modal) ──
    n.createElement(Dl, {
      open: _,
      onCancel: () => O(!1),
      onCreate: D
    })
  );
}
function dt(e) {
  return typeof e == "object" && e !== null && !Array.isArray(e);
}
function Nl(e) {
  const t = e.trim();
  if (!t) return [];
  const l = JSON.parse(t);
  if (!dt(l))
    throw new Error("MCP 配置必须是 JSON 对象");
  const n = l.mcpServers ?? l;
  if (!dt(n))
    throw new Error("mcpServers 必须是 JSON 对象");
  return Object.entries(n).map(([a, r]) => {
    const o = a.trim();
    if (!o || !dt(r))
      throw new Error(`MCP「${a || "未命名"}」配置无效`);
    const c = typeof r.url == "string" ? r.url : "", s = typeof r.command == "string" ? r.command : "";
    if (!c && !s)
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
        command: s,
        args: Array.isArray(r.args) ? r.args : [],
        env: dt(r.env) ? r.env : {},
        cwd: typeof r.cwd == "string" ? r.cwd : "",
        headers: dt(r.headers) ? r.headers : {}
      }
    };
  });
}
function Dl({
  open: e,
  onCancel: t,
  onCreate: l
}) {
  const n = P().React, { useState: a, useEffect: r, useMemo: o } = n, {
    Modal: c,
    Input: s,
    Select: d,
    Button: u,
    Row: h,
    Col: w,
    Spin: m,
    Tag: p,
    Typography: g,
    message: f
  } = P().antd, { CheckCircleOutlined: E } = P().antdIcons || {}, { Text: $ } = g, [z, _] = a(""), [O, D] = a(""), [H, L] = a(""), [I, G] = a(""), [W, T] = a([]), [x, S] = a([]), [M, k] = a(!1), [V, Q] = a(""), [j, R] = a(!1);
  r(() => {
    e && (_(""), D(""), L(""), G(""), S([]), Q(""), R(!1), k(!0), Nt(!0).then(T).catch((Y) => {
      T([]), f.error(Y.message || "加载技能池失败");
    }).finally(() => k(!1)));
  }, [e]);
  const y = O.trim(), ne = o(() => y ? y.length < 2 || y.length > 64 ? "ID 长度需为 2-64 个字符" : /^[a-zA-Z0-9][a-zA-Z0-9_-]*[a-zA-Z0-9]$/.test(y) ? y === "default" ? "default 是系统保留 ID" : "" : "仅允许字母、数字、连字符和下划线，且不能以符号开头或结尾" : "", [y]), K = o(() => {
    try {
      return { clients: Nl(V), error: "" };
    } catch (Y) {
      return { clients: [], error: Y.message || "MCP 配置无效" };
    }
  }, [V]), C = () => {
    const Y = z.trim();
    if (!Y) {
      f.warning("请输入专家名称");
      return;
    }
    if (ne) {
      f.warning(ne);
      return;
    }
    if (K.error) {
      f.warning(K.error);
      return;
    }
    R(!0), Promise.resolve(
      l({
        id: y,
        name: Y,
        description: H.trim(),
        systemPrompt: I,
        skillNames: x,
        mcpClients: K.clients
      })
    ).finally(() => R(!1));
  }, q = () => {
    S(
      W.filter((Y) => Y.source === "builtin").map((Y) => Y.name)
    );
  }, re = (Y, te) => n.createElement(
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
    n.createElement($, { strong: !0, style: { fontSize: 15 } }, Y),
    te ? n.createElement($, { type: "secondary", style: { fontSize: 12 } }, te) : null
  );
  return n.createElement(
    c,
    {
      open: e,
      title: "创建专家",
      onCancel: t,
      onOk: C,
      okText: "创建专家",
      cancelText: "取消",
      okButtonProps: { loading: j },
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
        h,
        { gutter: [16, 12] },
        n.createElement(
          w,
          { xs: 24, md: 12 },
          n.createElement(
            "label",
            { style: { display: "block", fontSize: 13, marginBottom: 6 } },
            "专家名称",
            n.createElement("span", { style: { color: "#ff4d4f", marginLeft: 4 } }, "*")
          ),
          n.createElement(s, {
            placeholder: "例如：合同审查专家",
            value: z,
            onChange: (Y) => _(Y.target.value),
            maxLength: 50
          })
        ),
        n.createElement(
          w,
          { xs: 24, md: 12 },
          n.createElement(
            "label",
            { style: { display: "block", fontSize: 13, marginBottom: 6 } },
            "智能体 ID（可选）"
          ),
          n.createElement(s, {
            placeholder: "例如：contract-reviewer",
            value: O,
            onChange: (Y) => D(Y.target.value),
            maxLength: 64,
            status: ne ? "error" : void 0
          }),
          ne ? n.createElement("div", { style: { color: "#ff4d4f", fontSize: 12, marginTop: 4 } }, ne) : null
        ),
        n.createElement(
          w,
          { span: 24 },
          n.createElement(
            "label",
            { style: { display: "block", fontSize: 13, marginBottom: 6 } },
            "专家描述（可选）"
          ),
          n.createElement(s.TextArea, {
            placeholder: "简要描述该专家的职责和能力",
            value: H,
            onChange: (Y) => L(Y.target.value),
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
        value: I,
        onChange: (Y) => G(Y.target.value),
        rows: 6,
        style: { fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", fontSize: 12 }
      })
    ),
    n.createElement(
      "div",
      { style: { borderTop: "1px solid #f0f0f0", paddingTop: 20 } },
      re("初始能力"),
      n.createElement(
        h,
        { gutter: [20, 16], align: "top" },
        n.createElement(
          w,
          { xs: 24, md: 12 },
          n.createElement(
            "div",
            { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 } },
            n.createElement($, { strong: !0 }, "初始技能"),
            n.createElement(
              "div",
              { style: { display: "flex", gap: 4 } },
              n.createElement(u, { size: "small", onClick: q, disabled: M }, "内置"),
              n.createElement(u, { size: "small", onClick: () => S([]), disabled: x.length === 0 }, "清空")
            )
          ),
          M ? n.createElement("div", { style: { textAlign: "center", padding: 32 } }, n.createElement(m, { size: "small" })) : n.createElement(d, {
            mode: "multiple",
            value: x,
            onChange: S,
            placeholder: "搜索并选择技能",
            showSearch: !0,
            allowClear: !0,
            optionFilterProp: "label",
            maxTagCount: "responsive",
            style: { width: "100%" },
            options: W.map((Y) => ({
              value: Y.name,
              label: Y.name
            })),
            notFoundContent: "暂无可用技能"
          }),
          n.createElement(
            "div",
            { style: { marginTop: 8, minHeight: 22 } },
            x.length > 0 ? n.createElement(p, { color: "blue" }, `已选择 ${x.length} 个技能`) : n.createElement($, { type: "secondary", style: { fontSize: 12 } }, "暂不添加技能")
          )
        ),
        n.createElement(
          w,
          { xs: 24, md: 12 },
          n.createElement($, { strong: !0, style: { display: "block", marginBottom: 8 } }, "初始 MCP"),
          n.createElement(s.TextArea, {
            placeholder: `{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem"]
    }
  }
}`,
            value: V,
            onChange: (Y) => Q(Y.target.value),
            rows: 8,
            status: K.error ? "error" : void 0,
            style: { fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", fontSize: 12 }
          }),
          n.createElement(
            "div",
            { style: { marginTop: 8, minHeight: 22 } },
            K.error ? n.createElement($, { type: "danger", style: { fontSize: 12 } }, K.error) : K.clients.length > 0 ? n.createElement(
              p,
              {
                color: "green",
                icon: E ? n.createElement(E) : void 0
              },
              `已识别 ${K.clients.length} 个 MCP`
            ) : n.createElement($, { type: "secondary", style: { fontSize: 12 } }, "暂不添加 MCP")
          )
        )
      )
    )
  );
}
const pa = "ugsci_custom_teams";
function Fl(e) {
  if (!e || typeof e != "object") return !1;
  const t = e;
  return typeof t.id == "string" && typeof t.name == "string" && typeof t.taskTemplate == "string" && typeof t.orchestrationPrompt == "string" && Array.isArray(t.members);
}
function ut() {
  try {
    const e = JSON.parse(
      localStorage.getItem(pa) || "[]"
    );
    return Array.isArray(e) ? e.filter(Fl) : [];
  } catch {
    return [];
  }
}
function cn(e) {
  try {
    localStorage.setItem(pa, JSON.stringify(e));
  } catch {
  }
}
function Gl(e) {
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
function Hl(e) {
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
async function Xt(e = !0) {
  const t = await Je("/ugsci/team/custom");
  if (!t.ok) {
    const a = await t.text().catch(() => "");
    throw new Error(a || `HTTP ${t.status}`);
  }
  const n = (await t.json()).map(Hl);
  return e && cn(n), n;
}
async function ga(e) {
  const t = await Je("/ugsci/team/custom", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(Gl(e))
  });
  if (!t.ok) {
    const n = await t.text().catch(() => "");
    throw new Error(n || `HTTP ${t.status}`);
  }
  const l = await t.json();
  return { ...e, id: l.team_id };
}
async function Wl(e) {
  const t = await Je(
    `/ugsci/team/custom/${encodeURIComponent(e)}`,
    { method: "DELETE" }
  );
  if (!t.ok && t.status !== 404) {
    const l = await t.text().catch(() => "");
    throw new Error(l || `HTTP ${t.status}`);
  }
}
async function Jl() {
  const e = ut();
  if (e.length === 0) return;
  const t = await Xt(!1), l = new Set(t.map((n) => n.id));
  await Promise.all(
    e.filter((n) => !l.has(n.id)).map((n) => ga(n))
  );
}
async function Kl(e) {
  var a, r;
  const t = (a = e.body) == null ? void 0 : a.getReader();
  if (!t) return;
  const l = new TextDecoder();
  let n = "";
  try {
    for (; ; ) {
      const { done: o, value: c } = await t.read();
      if (o) break;
      n += l.decode(c, { stream: !0 });
      let s;
      for (; (s = n.indexOf(`

`)) >= 0; ) {
        const d = n.slice(0, s);
        n = n.slice(s + 2);
        for (const u of d.split(`
`)) {
          if (!u.startsWith("data: ")) continue;
          const h = u.slice(6);
          let w;
          try {
            w = JSON.parse(h);
          } catch {
            continue;
          }
          if (w.error) {
            const m = w.error, p = typeof m == "string" ? m : (m == null ? void 0 : m.message) || "工作流启动失败";
            throw new Error(p);
          }
          if (w.object === "response" || w.type === "response") {
            const m = w.status;
            if (m === "failed" || m === "error") {
              const p = ((r = w.error) == null ? void 0 : r.message) || "工作流启动失败";
              throw new Error(p);
            }
            return;
          }
          if (w.object === "content" || w.type === "message")
            return;
        }
      }
    }
  } finally {
    t.releaseLock();
  }
}
async function ql(e, t, l) {
  const n = `console:default:team-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, a = await Je("/chats", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Agent-Id": e
    },
    body: JSON.stringify({
      session_id: n,
      user_id: "default",
      channel: "console",
      name: l ? `团队：${l}` : "团队任务"
    })
  });
  if (!a.ok) {
    const s = await a.text().catch(() => "");
    throw new Error(
      s || `创建会话失败 (HTTP ${a.status})`
    );
  }
  const o = (await a.json()).id, c = await Je("/console/chat", {
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
  if (!c.ok) {
    const s = await c.text().catch(() => "");
    throw new Error(s || `HTTP ${c.status}`);
  }
  return await Kl(c), o;
}
function fa(e, t) {
  var a;
  const l = t.replace(/\s+/g, ""), n = e.find(
    (r) => r.name === t || r.name.replace(/\s+/g, "") === l
  );
  return n ? n.id : ((a = e.find(
    (r) => r.name.includes(t) || t.includes(r.name) || r.name.replace(/\s+/g, "").includes(l)
  )) == null ? void 0 : a.id) || null;
}
function ya() {
  var t;
  const e = (t = window.QwenPaw) == null ? void 0 : t.host;
  if (!e) throw new Error("[ugsci] QwenPaw.host not available");
  return e;
}
async function dn(e, t, l) {
  try {
    const n = await Je(e, {
      headers: t ? { "X-Agent-Id": t } : void 0,
      signal: l
    });
    return n.ok ? await n.json() : null;
  } catch {
    return null;
  }
}
function Vl(e, t) {
  return dn("/ugsci/team/state", e, t);
}
async function Xl(e, t) {
  const l = await Je("/ugsci/team/runs", {
    headers: { "X-Agent-Id": e },
    signal: t
  });
  if (!l.ok)
    throw new Error(`Failed to load team runs: ${l.status}`);
  return await l.json();
}
function Fn({ activeOnly: e = !1 }) {
  const t = ya(), l = t.React, { useCallback: n, useEffect: a, useRef: r, useState: o } = l, { Alert: c, Button: s, Card: d, Empty: u, Spin: h, Tag: w, Typography: m } = t.antd, { Text: p, Paragraph: g } = m, f = t.useSelectedAgent ? t.useSelectedAgent() : { id: "default" }, E = (f == null ? void 0 : f.id) || "default", [$, z] = o([]), [_, O] = o(!0), [D, H] = o(!1), L = r(null), I = r(0), G = n(async () => {
    var S;
    (S = L.current) == null || S.abort();
    const T = new AbortController();
    L.current = T;
    const x = ++I.current;
    O(!0);
    try {
      const M = await Xl(E, T.signal);
      if (T.signal.aborted || x !== I.current) return;
      z(M), H(!1);
    } catch {
      if (T.signal.aborted || x !== I.current) return;
      H(!0);
    } finally {
      !T.signal.aborted && x === I.current && O(!1);
    }
  }, [E]);
  if (a(() => (G(), () => {
    var T;
    (T = L.current) == null || T.abort(), I.current += 1;
  }), [G]), _) return l.createElement(h);
  if (D)
    return l.createElement(c, {
      type: "warning",
      message: "讨论运行记录加载失败",
      action: l.createElement(s, { size: "small", onClick: () => void G() }, "重试")
    });
  const W = $.filter(
    (T) => e ? T.status === "active" : T.status !== "active"
  );
  return W.length === 0 ? l.createElement(u, {
    description: e ? "暂无进行中的专家团讨论" : "暂无历史讨论"
  }) : l.createElement(
    "div",
    { style: { display: "flex", flexDirection: "column", gap: 8 } },
    ...W.map(
      (T) => l.createElement(
        d,
        { key: T.instance_id, size: "small" },
        l.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 8 } },
          l.createElement(p, { strong: !0 }, T.team_name || T.team_id),
          l.createElement(w, { color: T.status === "completed" ? "green" : T.status === "terminated" ? "orange" : "blue" }, T.status),
          l.createElement(w, null, T.current_phase),
          l.createElement(p, { type: "secondary" }, `迭代 ${T.iteration}`)
        ),
        l.createElement(g, { ellipsis: { rows: 2 }, style: { margin: "8px 0 0" } }, T.task || "暂无任务描述")
      )
    )
  );
}
async function Yl() {
  const e = await dn(
    "/ugsci/team/preset-teams"
  );
  return (e == null ? void 0 : e.teams) ?? null;
}
async function Ql() {
  const e = await dn(
    "/ugsci/team/roles"
  );
  return (e == null ? void 0 : e.roles) ?? null;
}
const Zl = {
  plan: { label: "规划", color: "#1677ff", icon: "📋" },
  dispatch: { label: "分派", color: "#13c2c2", icon: "🚀" },
  verify: { label: "验证", color: "#fa8c16", icon: "🔍" },
  synthesize: { label: "综合", color: "#722ed1", icon: "📊" },
  completed: { label: "完成", color: "#52c41a", icon: "✅" }
}, Gn = [
  "plan",
  "dispatch",
  "verify",
  "synthesize",
  "completed"
], er = 3;
function tr() {
  const e = ya(), t = e.React, { useState: l, useEffect: n, useCallback: a, useRef: r } = t, { Card: o, Tag: c, Typography: s, Button: d, Steps: u, Empty: h, Alert: w } = e.antd, { ReloadOutlined: m } = e.antdIcons || {}, { Text: p, Paragraph: g } = s, f = e.useSelectedAgent ? e.useSelectedAgent() : { id: "default" }, E = (f == null ? void 0 : f.id) || "default", [$, z] = l(null), [_, O] = l(!1), D = r(null), H = r(0), L = r(0), I = r(null), G = a(
    async (y) => {
      var q;
      (q = I.current) == null || q.abort();
      const ne = new AbortController();
      I.current = ne;
      const K = ++L.current;
      y && O(!0);
      const C = await Vl(E, ne.signal);
      ne.signal.aborted || K !== L.current || (C ? (H.current = 0, D.current = C, z(C)) : H.current += 1, O(!1));
    },
    [E]
  ), W = a(() => G(!0), [G]);
  if (n(() => {
    var ne;
    (ne = I.current) == null || ne.abort(), L.current += 1, H.current = 0, D.current = null, z(null), W();
    const y = window.setInterval(() => {
      var K, C;
      H.current >= er || ((K = D.current) == null ? void 0 : K.status) === "completed" || ((C = D.current) == null ? void 0 : C.status) === "terminated" || G(!1);
    }, 5e3);
    return () => {
      var K;
      window.clearInterval(y), (K = I.current) == null || K.abort(), L.current += 1;
    };
  }, [E, G, W]), ($ == null ? void 0 : $.status) === "unreadable")
    return t.createElement(w, {
      type: "warning",
      showIcon: !0,
      message: "专家团状态暂时无法读取",
      description: `实例 ${$.instance_id || "未知"} 的状态文件需要检查。`,
      style: { marginBottom: 16 },
      action: t.createElement(
        d,
        { size: "small", onClick: W, loading: _ },
        "重试"
      )
    });
  if (!$ || !$.active) {
    if (($ == null ? void 0 : $.status) === "completed" || ($ == null ? void 0 : $.status) === "terminated") {
      const y = $.status === "completed";
      return t.createElement(w, {
        type: y ? "success" : "info",
        showIcon: !0,
        message: y ? "专家团工作流已完成" : "专家团工作流已终止",
        description: y ? `实例 ${$.instance_id || "未知"} 已完成，结果文件保留在工作区。` : `原因：${$.state.termination_reason || "未知"}`,
        style: { marginBottom: 16 }
      });
    }
    return t.createElement(h, {
      description: "暂无活跃的专家团工作流",
      style: { padding: 24 }
    });
  }
  const T = $.state, x = T.current_phase || "plan", S = Gn.indexOf(x), M = T.team_name || "未知团队", k = T.team_mode || "pipeline", V = T.iteration || 0, Q = T.members || [], j = T.verify_retries || 0, R = {
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
        t.createElement(p, { strong: !0 }, `${M} — 工作流状态`),
        t.createElement(
          c,
          { color: "blue", style: { fontSize: 10 } },
          R[k] || k
        ),
        t.createElement(
          c,
          { style: { fontSize: 10 } },
          `迭代 ${V}`
        ),
        j > 0 ? t.createElement(
          c,
          { color: "orange", style: { fontSize: 10 } },
          `验证重试 ${j}`
        ) : null
      ),
      extra: t.createElement(
        d,
        {
          size: "small",
          type: "text",
          icon: m ? t.createElement(m) : void 0,
          onClick: W,
          loading: _
        },
        "刷新"
      )
    },
    t.createElement(u, {
      current: S,
      size: "small",
      items: Gn.map((y) => {
        const ne = Zl[y];
        return {
          title: `${ne.icon} ${ne.label}`,
          description: y === "plan" ? "分析任务，创建任务分解" : y === "dispatch" ? "分派专家执行任务" : y === "verify" ? "交叉验证专家结果" : y === "synthesize" ? "综合形成最终报告" : "工作流完成"
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
      ...Q.map(
        (y, ne) => t.createElement(
          c,
          { key: `${y.name}-${ne}`, style: { fontSize: 11 } },
          `${y.emoji || ""} ${y.name}（${y.role}）`
        )
      )
    ),
    T.task ? t.createElement(
      g,
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
function nr({ team: e }) {
  const t = P().React, { Typography: l, Tag: n } = P().antd, { Text: a } = l, r = {
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
      ...c.length > 0 ? c.map((u, h) => [
        h > 0 && !s ? t.createElement(
          "div",
          {
            key: `arrow-${h}`,
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
            key: `step-${h}`,
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
              n,
              {
                ...u.passContext ? { color: "blue" } : {},
                style: { fontSize: 9, marginTop: 2 }
              },
              u.passContext ? "传递上下文" : "独立"
            )
          )
        )
      ]).flat() : e.members.map((u, h) => [
        h > 0 && !s ? t.createElement(
          "div",
          {
            key: `arrow-${h}`,
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
            key: `member-${h}`,
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
function wt(e) {
  const t = e.replace(/\s+/g, "").toLowerCase();
  return t.includes("测井") ? "log-analyst" : t.includes("地球物理") ? "geophysicist" : t.includes("油藏") ? "reservoir-engineer" : t.includes("钻井") ? "drilling-engineer" : t.includes("采油") || t.includes("生产") ? "production-engineer" : t.includes("pvt") || t.includes("物性") ? "pvt-analyst" : t.includes("审核") || t.includes("verifier") ? "domain-reviewer" : t.includes("master") || t.includes("planner") ? "planner" : "analyst";
}
const ar = [
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
function lr({
  open: e,
  onClose: t,
  agents: l,
  editingTeam: n,
  onSaved: a
}) {
  const r = P().React, { useState: o, useEffect: c, useCallback: s } = r, {
    Modal: d,
    Input: u,
    Button: h,
    Select: w,
    Tag: m,
    Typography: p,
    Switch: g,
    Empty: f,
    message: E,
    Divider: $,
    Steps: z
  } = P().antd, { PlusOutlined: _, DeleteOutlined: O, SaveOutlined: D, ArrowRightOutlined: H } = P().antdIcons || {}, { Text: L, Paragraph: I } = p, [G, W] = o(""), [T, x] = o("🤝"), [S, M] = o(""), [k, V] = o("pipeline"), [Q, j] = o(""), [R, y] = o(""), [ne, K] = o([]), [C, q] = o([]), [re, Y] = o(!1), [te, fe] = o(2), [B, oe] = o(""), [pe, se] = o(""), [le, Ee] = o({}), [he, Te] = o({}), [Oe, be] = o(
    ar
  ), ee = [
    { value: "pipeline", icon: "→", title: "顺序交接", description: "上一步产物成为下一位专家的上下文", topology: "A → B → C", accent: "#08979c" },
    { value: "roundtable", icon: "⇉", title: "并行汇聚", description: "独立并行分析，避免观点相互污染", topology: "A ∥ B ∥ C → 汇总", accent: "#531dab" },
    { value: "coordinator", icon: "◎", title: "主管协作", description: "主控专家拆解任务并按需组织成员", topology: "主管 → 专家组", accent: "#0958d9" },
    { value: "router", icon: "◇", title: "智能路由", description: "按任务能力需求选择最小充分专家集合", topology: "任务 → 路由 → 子集", accent: "#d46b08" },
    { value: "review_loop", icon: "↻", title: "评审迭代", description: "产出、独立审查、修订，直到满足标准", topology: "执行 ⇄ 评审", accent: "#389e0d" },
    { value: "debate", icon: "⚖", title: "多方论证", description: "独立立场、交叉质询，再由裁决者综合", topology: "观点 ⇄ 反驳 → 裁决", accent: "#c41d7f" }
  ];
  c(() => {
    e && (n ? (W(n.name), x(n.emoji), M(n.description), V(n.mode), j(n.coordinatorName || ""), y(n.taskTemplate), K(n.steps || []), q(n.members.map((b) => b.name)), fe(n.maxReviewRounds || 2), oe(n.successCriteria || ""), se(n.routingInstruction || ""), Ee(
      Object.fromEntries(
        n.members.map((b) => [
          b.name,
          b.bindingMode || (b.agentId ? "fixed" : "preferred")
        ])
      )
    ), Te(
      Object.fromEntries(
        n.members.map((b) => [
          b.name,
          b.roleKey || wt(b.name)
        ])
      )
    )) : (W(""), x("🤝"), M(""), V("pipeline"), j(""), y(`请执行以下任务：
任务描述：{任务描述}`), K([]), q([]), fe(2), oe(""), se(""), Ee({}), Te({})));
  }, [e, n]), c(() => {
    e && Ql().then((b) => {
      b != null && b.length && be(b);
    });
  }, [e]);
  const Se = s(() => {
    if (k === "roundtable" || k === "debate" || k === "router") {
      const b = C.map((me) => ({
        agentName: me,
        instruction: "请给出你的专业评估意见",
        passContext: !1
      }));
      K(b);
    } else if (k === "pipeline") {
      const b = new Map(ne.map((F) => [F.agentName, F])), me = C.map((F) => b.get(F) || {
        agentName: F,
        instruction: "请完成你的专业部分",
        passContext: !0
      });
      K(me);
    }
  }, [k, C, ne]), ye = (b) => {
    C.includes(b) || (q([...C, b]), Ee({ ...le, [b]: "fixed" }), Te({
      ...he,
      [b]: wt(b)
    }), (k === "coordinator" || k === "debate") && !Q && j(b));
  }, X = (b) => {
    const me = C.filter((ae) => ae !== b);
    q(me), K(ne.filter((ae) => ae.agentName !== b));
    const F = { ...le };
    delete F[b], Ee(F);
    const v = { ...he };
    delete v[b], Te(v), Q === b && j(me[0] || "");
  }, de = (b, me, F) => {
    const v = [...ne];
    v[b] = { ...v[b], [me]: F }, K(v);
  }, ge = async () => {
    if (!G.trim()) {
      E.warning("请输入团队名称");
      return;
    }
    if (C.length < 2) {
      E.warning("至少需要选择 2 个成员");
      return;
    }
    if (!R.trim()) {
      E.warning("请输入任务模板");
      return;
    }
    if ((k === "coordinator" || k === "debate") && !Q) {
      E.warning(k === "debate" ? "请选择裁决者" : "请选择主控专家");
      return;
    }
    Y(!0);
    try {
      let b = [...C];
      k === "coordinator" && Q ? b = [Q, ...b.filter((_e) => _e !== Q)] : k === "debate" && Q && (b = [...b.filter((_e) => _e !== Q), Q]);
      const me = b.map(
        (_e) => {
          var Ue;
          const Re = l.find((ke) => ke.name === _e), Be = le[_e] || "fixed", De = he[_e] || wt(_e), Fe = Oe.find((ke) => ke.key === De);
          return {
            name: _e,
            role: (Fe == null ? void 0 : Fe.display_name) || ((Ue = Re == null ? void 0 : Re.description) == null ? void 0 : Ue.slice(0, 30)) || "需求分析师",
            emoji: "",
            agentId: Be === "temporary" || Re == null ? void 0 : Re.id,
            roleKey: De,
            bindingMode: Be
          };
        }
      );
      let F = ne;
      (ne.length === 0 || ne.length !== C.length) && (F = C.map((_e) => ({
        agentName: _e,
        instruction: "请完成你的专业部分",
        passContext: k === "pipeline"
      })));
      const v = {
        id: (n == null ? void 0 : n.id) || `custom-${Date.now()}`,
        name: G.trim(),
        emoji: T,
        category: "自定义",
        description: S.trim() || `${G.trim()}（${C.length}人团队）`,
        mode: k,
        members: me,
        coordinatorName: k === "coordinator" || k === "debate" ? Q : void 0,
        taskTemplate: R.trim(),
        orchestrationPrompt: "",
        // Custom teams use steps-based instructions
        steps: F,
        custom: !0,
        createdAt: (n == null ? void 0 : n.createdAt) || Date.now(),
        maxReviewRounds: te,
        successCriteria: B.trim(),
        routingInstruction: pe.trim()
      }, ae = await ga(v), ce = ut(), ze = ce.findIndex((_e) => _e.id === ae.id);
      ze >= 0 ? ce[ze] = ae : ce.push(ae), cn(ce), E.success(n ? "团队已更新" : "团队已创建"), a(), t();
    } catch (b) {
      E.error(b.message || "保存失败");
    } finally {
      Y(!1);
    }
  }, J = l.filter(
    (b) => !C.includes(b.name)
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
      onOk: ge,
      okText: "保存专家团",
      confirmLoading: re,
      okButtonProps: {
        icon: D ? r.createElement(D) : void 0
      }
    },
    // Step 1: Basic info
    r.createElement(
      "div",
      { style: { marginBottom: 16 } },
      r.createElement(
        L,
        {
          strong: !0,
          style: { display: "block", marginBottom: 8, fontSize: 13 }
        },
        "1. 定义任务工作流"
      ),
      r.createElement(
        "div",
        { style: { display: "flex", gap: 8, marginBottom: 8, alignItems: "center" } },
        C.length > 0 ? r.createElement(sn, {
          members: C,
          size: 36
        }) : null,
        r.createElement(u, {
          placeholder: "专家团名称（如：储层评价与质量复核专家团）",
          value: G,
          onChange: (b) => W(b.target.value),
          style: { flex: 1 }
        })
      ),
      r.createElement(u.TextArea, {
        placeholder: "说明这个工作流解决什么问题、适用于什么场景",
        value: S,
        onChange: (b) => M(b.target.value),
        rows: 2,
        style: { marginBottom: 8 }
      }),
      r.createElement(
        L,
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
        ...ee.map((b) => {
          const me = k === b.value;
          return r.createElement(
            "button",
            {
              key: b.value,
              type: "button",
              onClick: () => {
                V(b.value), b.value !== "coordinator" && b.value !== "debate" && j("");
              },
              style: {
                textAlign: "left",
                padding: 10,
                borderRadius: 8,
                cursor: "pointer",
                background: me ? `${b.accent}0d` : "var(--ant-color-bg-container, #fff)",
                border: `1px solid ${me ? b.accent : "var(--ant-color-border, #d9d9d9)"}`,
                boxShadow: me ? `0 0 0 2px ${b.accent}1a` : "none"
              }
            },
            r.createElement(
              "div",
              { style: { display: "flex", alignItems: "center", gap: 7, color: b.accent, fontWeight: 600 } },
              r.createElement("span", { style: { fontSize: 18 } }, b.icon),
              b.title
            ),
            r.createElement("div", { style: { fontSize: 11, color: "#595959", marginTop: 5, lineHeight: 1.45 } }, b.description),
            r.createElement("div", { style: { fontSize: 10, color: b.accent, marginTop: 5, fontFamily: "monospace" } }, b.topology)
          );
        })
      )
    ),
    r.createElement($, { style: { margin: "12px 0" } }),
    // Step 2: Select members
    r.createElement(
      "div",
      { style: { marginBottom: 16 } },
      r.createElement(
        L,
        {
          strong: !0,
          style: { display: "block", marginBottom: 8, fontSize: 13 }
        },
        "2. 配置专家角色"
      ),
      // Available agents
      J.length > 0 ? r.createElement(
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
        ...J.map(
          (b) => r.createElement(
            h,
            {
              key: b.id,
              size: "small",
              icon: _ ? r.createElement(_) : void 0,
              onClick: () => ye(b.name)
            },
            b.name
          )
        )
      ) : null,
      // Selected members
      C.length === 0 ? r.createElement(f, {
        description: "请从上方添加团队成员",
        image: f.PRESENTED_IMAGE_SIMPLE
      }) : r.createElement(
        "div",
        { style: { display: "flex", flexDirection: "column", gap: 4 } },
        ...C.map(
          (b) => r.createElement(
            "div",
            {
              key: b,
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
              r.createElement(Ge, { name: b, size: 24 }),
              r.createElement(
                L,
                { strong: !0, style: { fontSize: 13 } },
                b
              ),
              (k === "coordinator" || k === "debate") && Q === b ? r.createElement(
                m,
                { color: "blue", style: { fontSize: 10 } },
                k === "debate" ? "裁决者" : "主控"
              ) : null
            ),
            r.createElement(
              "div",
              { style: { display: "flex", gap: 4 } },
              r.createElement(w, {
                size: "small",
                value: he[b] || wt(b),
                style: { width: 132 },
                onChange: (me) => Te({ ...he, [b]: me }),
                options: Oe.map((me) => ({
                  value: me.key,
                  label: me.display_name
                }))
              }),
              r.createElement(w, {
                size: "small",
                value: le[b] || "fixed",
                style: { width: 118 },
                onChange: (me) => Ee({ ...le, [b]: me }),
                options: [
                  { value: "fixed", label: "固定实例" },
                  { value: "preferred", label: "优先实例" },
                  { value: "temporary", label: "临时派生" }
                ]
              }),
              k === "coordinator" || k === "debate" ? r.createElement(
                h,
                {
                  size: "small",
                  type: "link",
                  onClick: () => j(b)
                },
                k === "debate" ? "设为裁决者" : "设为主控"
              ) : null,
              r.createElement(
                h,
                {
                  size: "small",
                  type: "link",
                  danger: !0,
                  icon: O ? r.createElement(O) : void 0,
                  onClick: () => X(b)
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
          border: "1px solid #f0f0f0"
        }
      },
      k === "review_loop" ? r.createElement(
        "div",
        { style: { display: "grid", gridTemplateColumns: "150px 1fr", gap: 10 } },
        r.createElement(w, {
          value: te,
          onChange: (b) => fe(b),
          options: [1, 2, 3, 4, 5].map((b) => ({ value: b, label: `最多 ${b} 轮` }))
        }),
        r.createElement(u, {
          value: B,
          onChange: (b) => oe(b.target.value),
          placeholder: "验收标准，例如：关键结论均有数据依据，且无高风险缺陷"
        })
      ) : r.createElement(u, {
        value: pe,
        onChange: (b) => se(b.target.value),
        placeholder: "路由偏好，例如：仅调用任务必需的专家；涉及模拟时优先油藏工程师"
      })
    ) : null,
    r.createElement($, { style: { margin: "12px 0" } }),
    // Step 3: Define execution steps (for pipeline/roundtable)
    C.length > 0 ? r.createElement(
      "div",
      { style: { marginBottom: 16 } },
      r.createElement(
        L,
        {
          strong: !0,
          style: { display: "block", marginBottom: 8, fontSize: 13 }
        },
        `3. 配置专家任务${k === "roundtable" ? "（并行独立）" : k === "pipeline" ? "（顺序交接）" : k === "router" ? "（作为候选能力）" : k === "review_loop" ? "（首位执行、末位评审）" : k === "debate" ? "（末位为裁决者）" : "（由主控动态编排）"}`
      ),
      // Auto-sync button
      r.createElement(
        h,
        {
          size: "small",
          type: "dashed",
          onClick: Se,
          style: { marginBottom: 8 }
        },
        "自动生成步骤"
      ),
      // Steps list
      ne.length === 0 ? r.createElement(
        L,
        { type: "secondary", style: { fontSize: 12 } },
        "点击「自动生成步骤」或手动配置每步的指令"
      ) : r.createElement(
        "div",
        { style: { display: "flex", flexDirection: "column", gap: 6 } },
        ...ne.map(
          (b, me) => r.createElement(
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
                m,
                { color: "blue", style: { fontSize: 11 } },
                b.agentName
              ),
              r.createElement(
                "div",
                { style: { flex: 1 } },
                r.createElement(u, {
                  placeholder: "请输入该步骤的指令...",
                  value: b.instruction,
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
              r.createElement(g, {
                size: "small",
                checked: b.passContext,
                onChange: (F) => de(me, "passContext", F)
              }),
              r.createElement(
                L,
                { type: "secondary", style: { fontSize: 11 } },
                b.passContext ? "传递上一步结果作为上下文" : "独立执行"
              )
            )
          )
        )
      )
    ) : null,
    r.createElement($, { style: { margin: "12px 0" } }),
    // Step 4: Task template
    r.createElement(
      "div",
      null,
      r.createElement(
        L,
        {
          strong: !0,
          style: { display: "block", marginBottom: 8, fontSize: 13 }
        },
        `${C.length > 0 ? "4" : "3"}. 任务模板`
      ),
      r.createElement(u.TextArea, {
        placeholder: `输入任务模板，可用 {参数名} 作为占位符...

例如：
请对区块 {区块名} 的井 {井号} 进行储层评价`,
        value: R,
        onChange: (b) => y(b.target.value),
        rows: 4,
        style: { fontFamily: "monospace", fontSize: 13 }
      }),
      r.createElement(
        L,
        {
          type: "secondary",
          style: { fontSize: 11, display: "block", marginTop: 4 }
        },
        "占位符 {参数名} 在发起任务时可由用户填写替换"
      )
    )
  );
}
function Hn({
  team: e,
  agents: t,
  onLaunch: l,
  onEdit: n,
  onDelete: a
}) {
  var x;
  const r = P().React, { useState: o } = r, { Card: c, Tag: s, Typography: d, Button: u, Tooltip: h, Popconfirm: w } = P().antd, {
    TeamOutlined: m,
    RocketOutlined: p,
    UserOutlined: g,
    EditOutlined: f,
    DeleteOutlined: E,
    DownOutlined: $,
    UpOutlined: z
  } = P().antdIcons || {}, { Text: _, Paragraph: O } = d, [D, H] = o(!1), L = {
    coordinator: { label: "主管协作", color: "blue" },
    pipeline: { label: "顺序交接", color: "cyan" },
    roundtable: { label: "并行汇聚", color: "purple" },
    router: { label: "智能路由", color: "orange" },
    review_loop: { label: "评审迭代", color: "green" },
    debate: { label: "多方论证", color: "magenta" }
  }, I = L[e.mode] || L.coordinator, G = e.members.map((S) => {
    const M = S.bindingMode === "temporary", k = M ? null : (S.agentId && t.some((V) => V.id === S.agentId) ? S.agentId : null) || fa(t, S.name);
    return { ...S, found: !!k, agentId: k, temporary: M };
  }), W = G.filter((S) => S.found).length, T = e.coordinatorName || ((x = e.members[0]) == null ? void 0 : x.name);
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
      r.createElement(sn, {
        members: e.members.map((S) => S.name),
        size: 36
      }),
      r.createElement(
        "div",
        { style: { flex: 1 } },
        r.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 6 } },
          r.createElement(
            _,
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
            { color: I.color, style: { fontSize: 10 } },
            I.label
          ),
          r.createElement(
            s,
            { color: "green", style: { fontSize: 10 } },
            `${e.members.length} 位专家`
          ),
          W < e.members.length ? r.createElement(
            h,
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
          h,
          { title: "编辑" },
          r.createElement(u, {
            type: "text",
            size: "small",
            icon: f ? r.createElement(f) : void 0,
            onClick: (S) => {
              S.stopPropagation(), n(e);
            }
          })
        ) : null,
        a ? r.createElement(
          h,
          { title: "删除" },
          r.createElement(
            w,
            {
              title: `删除专家团「${e.name}」？`,
              description: "此操作会删除后端定义，但不会删除既有讨论记录。",
              okText: "删除",
              cancelText: "取消",
              okButtonProps: { danger: !0 },
              onConfirm: () => a(e)
            },
            r.createElement(u, {
              type: "text",
              size: "small",
              danger: !0,
              icon: E ? r.createElement(E) : void 0,
              onClick: (S) => S.stopPropagation()
            })
          )
        ) : null
      ) : null
    ),
    // Description
    r.createElement(
      O,
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
      ...G.map(
        (S) => r.createElement(
          h,
          {
            key: S.name,
            title: `${S.name}（${S.role}）${S.temporary ? " - OMP 临时派生" : S.found ? " - 已绑定实例" : " - OMP 按角色派发"}`
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
                background: S.found ? "#f0f5ff" : "#f0f0ff",
                border: `1px solid ${S.found ? "#d6e4ff" : "#d3adf7"}`,
                fontSize: 11
              }
            },
            r.createElement(Ge, { name: S.name, size: 18 }),
            r.createElement(
              _,
              {
                style: { fontSize: 11, color: S.found ? "#1f4e8c" : "#531dab" }
              },
              S.name
            ),
            S.temporary ? r.createElement(
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
      u,
      {
        type: "link",
        size: "small",
        style: { padding: "0 0 4px 0", fontSize: 11, height: "auto" },
        onClick: (S) => {
          S.stopPropagation(), H(!D);
        },
        icon: D ? z ? r.createElement(z) : "▲" : $ ? r.createElement($) : "▼"
      },
      D ? "收起流程" : "查看执行流程"
    ),
    D ? r.createElement(nr, { team: e }) : null,
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
        _,
        { type: "secondary", style: { fontSize: 11 } },
        T ? `${e.mode === "debate" ? "裁决者" : "主控"}: ${T}` : "OMP 动态编排"
      ),
      r.createElement(
        u,
        {
          type: "primary",
          size: "small",
          icon: p ? r.createElement(p) : void 0,
          disabled: t.length === 0,
          onClick: () => l(e),
          style: je
        },
        "运行工作流"
      )
    )
  );
}
function rr({
  agents: e,
  onLaunch: t
}) {
  const l = P().React, { useMemo: n, useState: a, useCallback: r, useEffect: o } = l, {
    Row: c,
    Col: s,
    Input: d,
    Empty: u,
    Typography: h,
    Tag: w,
    Button: m,
    Divider: p,
    Tabs: g,
    message: f
  } = P().antd, { SearchOutlined: E, PlusOutlined: $, RocketOutlined: z } = P().antdIcons || {}, { Text: _ } = h, [O, D] = a(""), [H, L] = a([]), [I, G] = a([]), [W, T] = a(!1), [x, S] = a(null);
  o(() => {
    L(ut());
    let K = !0;
    return (async () => {
      try {
        await Jl();
        const C = await Xt();
        K && L(C);
      } catch (C) {
        console.warn("[ugsci] Failed to load backend expert teams:", C), K && f.warning("专家团后端同步失败，当前显示本地缓存");
      }
    })(), Yl().then((C) => {
      K && C && G(C);
    }), () => {
      K = !1;
    };
  }, []);
  const M = r(() => {
    Xt().then(L).catch((K) => {
      console.warn("[ugsci] Failed to refresh expert teams:", K), L(ut());
    });
  }, []), k = r(
    (K) => {
      Wl(K.id).then(() => {
        const q = ut().filter((re) => re.id !== K.id);
        cn(q), L(q), f.success(`团队「${K.name}」已删除`);
      }).catch((C) => f.error(C.message || "删除专家团失败"));
    },
    [f]
  ), V = r((K) => {
    S(K), T(!0);
  }, []), Q = r(() => {
    S(null), T(!0);
  }, []), j = n(() => [...H, ...I], [H, I]), R = n(() => {
    if (!O.trim()) return j;
    const K = O.toLowerCase();
    return j.filter(
      (C) => C.name.toLowerCase().includes(K) || C.description.toLowerCase().includes(K) || C.category.toLowerCase().includes(K)
    );
  }, [j, O]), y = R.filter((K) => K.custom), ne = R.filter((K) => !K.custom);
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
        prefix: E ? l.createElement(E) : void 0,
        value: O,
        onChange: (K) => D(K.target.value),
        allowClear: !0,
        style: { flex: "1 1 280px", maxWidth: 400 }
      }),
      l.createElement(
        m,
        {
          type: "primary",
          size: "small",
          icon: $ ? l.createElement($) : void 0,
          onClick: Q,
          style: je
        },
        "创建专家团"
      )
    ),
    // Tabs: preset teams vs custom teams
    l.createElement(
      g,
      {
        defaultActiveKey: "preset",
        items: [
          {
            key: "preset",
            label: `预设团队${ne.length ? ` (${ne.length})` : ""}`,
            children: l.createElement(
              "div",
              null,
              ne.length > 0 ? l.createElement(
                c,
                { gutter: [12, 12] },
                ...ne.map(
                  (K) => l.createElement(
                    s,
                    { key: K.id, xs: 24, sm: 12, md: 8 },
                    l.createElement(Hn, {
                      team: K,
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
            label: `自定义团队${y.length ? ` (${y.length})` : ""}`,
            children: l.createElement(
              "div",
              null,
              y.length > 0 ? l.createElement(
                c,
                { gutter: [12, 12] },
                ...y.map(
                  (K) => l.createElement(
                    s,
                    { key: K.id, xs: 24, sm: 12, md: 8 },
                    l.createElement(Hn, {
                      team: K,
                      agents: e,
                      onLaunch: t,
                      onEdit: V,
                      onDelete: k
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
              l.createElement(tr),
              l.createElement(Fn, { activeOnly: !0 })
            )
          },
          {
            key: "history",
            label: "讨论历史",
            children: l.createElement(Fn)
          }
        ]
      }
    ),
    // Team Builder Modal
    l.createElement(lr, {
      open: W,
      onClose: () => {
        T(!1), S(null);
      },
      agents: e,
      editingTeam: x,
      onSaved: M
    })
  );
}
const or = [
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
], sr = 5e3, ir = {
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
function cr(e) {
  window.history.pushState({}, "", e), window.dispatchEvent(new PopStateEvent("popstate"));
}
function Kt(e, t) {
  const l = new URLSearchParams();
  e && l.set("flow", e), t && l.set("run", t), cr(`/flowforge${l.size ? `?${l.toString()}` : ""}`);
}
function dr(e) {
  return e ? new Date(e * 1e3).toLocaleString("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  }) : "—";
}
function mr(e) {
  if (!e || e <= 0) return "—";
  if (e < 1e3) return `${e}ms`;
  const t = Math.floor(e / 1e3);
  if (t < 60) return `${t}s`;
  const l = Math.floor(t / 60), n = t % 60;
  return `${l}m${n}s`;
}
function ur(e) {
  if (!e) return "";
  const t = Object.keys(e).length;
  if (t === 0) return "";
  const l = Object.values(e).filter(
    (a) => a === "success" || a === "completed" || a === "skipped" || a === "cached"
  ).length, n = Object.values(e).filter(
    (a) => a === "error" || a === "failed"
  ).length;
  return n > 0 ? `${l}/${t} 节点完成 (${n} 失败)` : `${l}/${t} 节点完成`;
}
const St = /* @__PURE__ */ new Set(["running", "queued", "paused", "waiting_human"]);
function pr() {
  const e = P().React, { useCallback: t, useEffect: l, useRef: n, useState: a } = e, {
    Alert: r,
    Button: o,
    Card: c,
    Col: s,
    Empty: d,
    Input: u,
    Popconfirm: h,
    Row: w,
    Space: m,
    Spin: p,
    Tabs: g,
    Tag: f,
    Tooltip: E,
    Typography: $,
    message: z
  } = P().antd, {
    ApartmentOutlined: _,
    DeleteOutlined: O,
    ReloadOutlined: D,
    RocketOutlined: H,
    PlayCircleOutlined: L,
    StopOutlined: I
  } = P().antdIcons || {}, { Text: G, Paragraph: W, Title: T } = $, x = P().useSelectedAgent, S = x ? x() : { id: "default" }, M = (S == null ? void 0 : S.id) || "default", [k, V] = a([]), [Q, j] = a([]), [R, y] = a([]), [ne, K] = a(!0), [C, q] = a(!0), [re, Y] = a(null), [te, fe] = a(""), [B, oe] = a(""), [pe, se] = a("templates"), [le, Ee] = a(/* @__PURE__ */ new Set()), he = n(null), Te = Q.some((v) => St.has(v.status)), Oe = e.useMemo(() => {
    const v = {};
    return k.forEach((ae) => {
      v[ae.id] = ae.name;
    }), v;
  }, [k]), be = e.useMemo(() => {
    const v = {};
    return Q.forEach((ae) => {
      St.has(ae.status) && (v[ae.flow_id] = (v[ae.flow_id] || 0) + 1);
    }), v;
  }, [Q]), ee = t(async (v = !1) => {
    v || K(!0);
    try {
      const [ae, ce, ze] = await Promise.all([
        ie("/flowforge/flows", { bypassCache: !0 }),
        ie("/flowforge/runs", { bypassCache: !0 }),
        Ut().catch(() => [])
      ]);
      V(ae), j(ce), y(ze), q(!0);
    } catch (ae) {
      console.warn("[ugsci] FlowForge is unavailable:", ae), q(!1);
    } finally {
      v || K(!1);
    }
  }, []);
  l(() => {
    ee();
  }, [ee]), l(() => {
    if (!C || !Te) {
      he.current && (clearTimeout(he.current), he.current = null);
      return;
    }
    return he.current = setTimeout(() => {
      ee(!0);
    }, sr), () => {
      he.current && (clearTimeout(he.current), he.current = null);
    };
  }, [Te, C, ee]);
  const Se = t(
    async (v) => {
      if (!re) {
        Y(v.key);
        try {
          const ae = await ie(
            "/flowforge/generate",
            {
              method: "POST",
              body: JSON.stringify({
                prompt: v.sop,
                name: v.name,
                agent_id: M
              })
            }
          ), ce = {
            ...ae.nodes || {}
          }, ze = Object.entries(ce).filter(([Ue]) => /^step_\d+$/.test(Ue)).sort(([Ue], [ke]) => Number(Ue.slice(5)) - Number(ke.slice(5))), _e = {};
          let Re = 0, Be = 0;
          ze.forEach(([Ue, ke], Le) => {
            const Z = v.roleHints[Le] || "", Ae = v.roleKeys[Le] || "analyst", $e = R.find(
              (We) => `${We.name} ${We.id}`.toLowerCase().includes(Z.toLowerCase())
            );
            $e ? Re++ : Be++;
            const Me = ($e == null ? void 0 : $e.id) || M, He = { ...ke.inputs || {} };
            He.agent_id = Me, ce[Ue] = {
              ...ke,
              inputs: He,
              metadata: {
                ...ke.metadata || {},
                binding_policy: "fixed_instance",
                role_hint: Z,
                role_key: Ae,
                agent_id: Me
              }
            }, _e[Ue] = {
              binding_policy: "fixed_instance",
              role_hint: Z,
              role_key: Ae,
              agent_id: Me
            };
          });
          const De = {
            ...ae,
            nodes: ce,
            id: `${v.key}-${Date.now()}`,
            name: v.name,
            description: v.description,
            metadata: {
              ...ae.metadata || {},
              domain: "oil-gas",
              template_key: v.key,
              expert_binding_policy: "fixed_instance",
              controller_agent_id: M,
              node_bindings: _e
            }
          };
          await ie("/flowforge/flows", {
            method: "POST",
            body: JSON.stringify(De)
          });
          const Fe = ze.length > 0 ? `（${Re} 个专家已匹配，${Be} 个回退到控制器）` : "";
          z.success(`已创建工作流草稿「${v.name}」${Fe}`), await ee();
        } catch (ae) {
          z.error(ae.message || "创建工作流失败");
        } finally {
          Y(null);
        }
      }
    },
    [R, M, re, ee, z]
  ), ye = t(async () => {
    if (!re) {
      if (!B.trim()) {
        z.warning("请先描述工作流步骤和控制要求");
        return;
      }
      Y("natural-language");
      try {
        const v = await ie(
          "/flowforge/generate",
          {
            method: "POST",
            body: JSON.stringify({
              prompt: B.trim(),
              name: te.trim(),
              agent_id: M
            })
          }
        ), ae = {
          ...v,
          id: `natural-${Date.now()}`,
          metadata: {
            ...v.metadata || {},
            domain: "oil-gas",
            source: "natural-language",
            expert_binding_policy: "fixed_instance",
            controller_agent_id: M
          }
        };
        await ie("/flowforge/flows", {
          method: "POST",
          body: JSON.stringify(ae)
        }), z.success("已从自然语言生成可编辑工作流草稿"), fe(""), oe(""), await ee();
      } catch (v) {
        z.error(v.message || "自然语言生成失败");
      } finally {
        Y(null);
      }
    }
  }, [M, re, ee, z, te, B]), X = t(
    async (v, ae) => {
      try {
        await ie(`/flowforge/flows/${encodeURIComponent(v)}/run`, {
          method: "POST",
          body: JSON.stringify({ inputs: {} })
        }), z.success(`已启动工作流「${ae}」`), await ee(!0);
      } catch (ce) {
        z.error(ce.message || "启动工作流失败");
      }
    },
    [ee, z]
  ), de = t(
    async (v, ae) => {
      try {
        await ie(`/flowforge/flows/${encodeURIComponent(v)}`, {
          method: "DELETE"
        }), z.success(`已删除工作流「${ae}」`), await ee();
      } catch (ce) {
        z.error(ce.message || "删除工作流失败");
      }
    },
    [ee, z]
  ), ge = t(
    async (v) => {
      Ee((ae) => {
        const ce = new Set(ae);
        return ce.add(v), ce;
      });
      try {
        await ie(`/flowforge/runs/${encodeURIComponent(v)}/cancel`, {
          method: "POST"
        }), z.success("已请求取消运行"), await ee(!0);
      } catch (ae) {
        z.error(ae.message || "取消运行失败");
      } finally {
        Ee((ae) => {
          const ce = new Set(ae);
          return ce.delete(v), ce;
        });
      }
    },
    [ee, z]
  ), J = e.createElement(
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
        m,
        { direction: "vertical", style: { width: "100%" }, size: 10 },
        e.createElement(u, {
          value: te,
          onChange: (v) => fe(v.target.value),
          placeholder: "工作流名称（可选）",
          maxLength: 80
        }),
        e.createElement(u.TextArea, {
          value: B,
          onChange: (v) => oe(v.target.value),
          placeholder: "例如：先检查某储气库本周期压力和注采量数据，再由油藏工程师预测下周期能力，由独立完整性专家复核风险，最后形成带证据和不确定性的建议。",
          autoSize: { minRows: 3, maxRows: 8 }
        }),
        e.createElement(
          o,
          {
            type: "primary",
            onClick: () => void ye(),
            loading: re === "natural-language",
            disabled: !C || !!re,
            style: je
          },
          "生成可编辑草稿"
        )
      )
    ),
    e.createElement(
      w,
      { gutter: [12, 12] },
      ...or.map(
        (v) => e.createElement(
          s,
          { key: v.key, xs: 24, md: 8 },
          e.createElement(
            c,
            { style: { height: "100%" } },
            e.createElement(
              m,
              { align: "start", style: { width: "100%" } },
              e.createElement("span", { style: { fontSize: 28 } }, v.icon),
              e.createElement(
                "div",
                { style: { flex: 1 } },
                e.createElement(T, { level: 5, style: { margin: 0 } }, v.name),
                e.createElement(f, { color: "blue", style: { marginTop: 6 } }, v.category),
                e.createElement(
                  W,
                  { type: "secondary", style: { margin: "10px 0 14px" } },
                  v.description
                ),
                e.createElement(
                  o,
                  {
                    type: "primary",
                    loading: re === v.key,
                    disabled: !C || !!re,
                    onClick: () => void Se(v),
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
        w,
        { gutter: [12, 12] },
        ...[
          ["固定实例", "生产关键节点使用指定且已验证的专家实例", "当前可执行"],
          ["优先实例", "定义中记录首选实例和治理降级策略", "规划中"],
          ["模板派生", "由 OMP 控制节点按角色模板临时创建隔离角色", "规划中"],
          ["动态路由", "按能力、健康、权限和成本选择实例", "规划中"]
        ].map(
          ([v, ae, ce]) => e.createElement(
            s,
            { key: v, xs: 24, sm: 12, lg: 6 },
            e.createElement(G, { strong: !0 }, v),
            e.createElement(
              f,
              {
                color: ce === "当前可执行" ? "green" : "default",
                style: { marginLeft: 6, fontSize: 10 }
              },
              ce
            ),
            e.createElement("div", { style: { color: "var(--ant-color-text-tertiary, #8c8c8c)", fontSize: 12, marginTop: 4 } }, ae)
          )
        )
      )
    )
  ), b = ne ? e.createElement(p) : k.length === 0 ? e.createElement(d, { description: "暂无工作流，可从模板创建" }) : e.createElement(
    w,
    { gutter: [12, 12] },
    ...k.map((v) => {
      const ae = be[v.id] || 0;
      return e.createElement(
        s,
        { key: v.id, xs: 24, md: 12, xl: 8 },
        e.createElement(
          c,
          {
            size: "small",
            title: e.createElement(
              m,
              { size: 6 },
              e.createElement("span", null, v.name),
              ae > 0 ? e.createElement(
                f,
                { color: "blue" },
                `${ae} 个运行中`
              ) : null
            ),
            extra: e.createElement(f, null, `v${v.version}`)
          },
          e.createElement(W, { ellipsis: { rows: 2 } }, v.description || "暂无描述"),
          e.createElement(
            m,
            { size: 8, wrap: !0 },
            e.createElement(f, { color: "geekblue" }, `${v.node_count} 个节点`),
            e.createElement(o, {
              size: "small",
              type: "primary",
              icon: L ? e.createElement(L) : void 0,
              disabled: !C,
              onClick: () => void X(v.id, v.name)
            }, "运行"),
            e.createElement(o, {
              size: "small",
              onClick: () => Kt(v.id)
            }, "编辑"),
            e.createElement(
              h,
              {
                title: "确认删除",
                description: `确定要删除工作流「${v.name}」吗？此操作不可撤销。`,
                onConfirm: () => void de(v.id, v.name),
                okText: "删除",
                cancelText: "取消",
                okButtonProps: { danger: !0 }
              },
              e.createElement(o, {
                size: "small",
                danger: !0,
                icon: O ? e.createElement(O) : void 0
              }, "删除")
            )
          )
        )
      );
    })
  ), me = ne ? e.createElement(p) : Q.length === 0 ? e.createElement(d, { description: "暂无工作流运行记录" }) : e.createElement(
    "div",
    { style: { display: "flex", flexDirection: "column", gap: 8 } },
    ...Q.map((v) => {
      const ae = Oe[v.flow_id] || v.flow_id, ce = St.has(v.status), ze = ur(v.node_statuses), _e = v.duration_ms && v.duration_ms > 0 ? v.duration_ms : v.finished_at && v.started_at ? (v.finished_at - v.started_at) * 1e3 : ce && v.started_at ? (Date.now() / 1e3 - v.started_at) * 1e3 : 0;
      return e.createElement(
        c,
        { key: v.run_id, size: "small" },
        e.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" } },
          e.createElement(
            f,
            { color: ir[v.status] || "default" },
            v.status
          ),
          e.createElement(G, { strong: !0 }, ae),
          e.createElement(
            E,
            { title: v.run_id },
            e.createElement(
              G,
              { type: "secondary", style: { fontFamily: "monospace", fontSize: 11 } },
              v.run_id.slice(0, 8) + "…"
            )
          ),
          e.createElement(
            G,
            { type: "secondary", style: { fontSize: 12 } },
            dr(v.started_at)
          ),
          _e > 0 ? e.createElement(
            G,
            { type: "secondary", style: { fontSize: 12 } },
            `耗时 ${mr(_e)}`
          ) : null,
          ze ? e.createElement(f, { color: "geekblue", style: { fontSize: 11 } }, ze) : null,
          v.error ? e.createElement(
            E,
            { title: v.error },
            e.createElement(G, { type: "danger", style: { fontSize: 12 } }, "（有错误）")
          ) : null,
          e.createElement(
            "div",
            { style: { marginLeft: "auto", display: "flex", gap: 6 } },
            ce ? e.createElement(
              h,
              {
                title: "确认取消运行？",
                onConfirm: () => void ge(v.run_id),
                okText: "取消运行",
                cancelText: "保留",
                okButtonProps: { danger: !0 }
              },
              e.createElement(o, {
                size: "small",
                danger: !0,
                loading: le.has(v.run_id),
                icon: I ? e.createElement(I) : void 0
              }, "取消运行")
            ) : null,
            e.createElement(
              o,
              { size: "small", type: "link", onClick: () => Kt(void 0, v.run_id) },
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
      icon: D ? e.createElement(D) : void 0,
      onClick: () => void ee(),
      loading: ne
    }, "刷新"),
    pe !== "templates" ? e.createElement(o, {
      type: "primary",
      icon: _ ? e.createElement(_) : H ? e.createElement(H) : void 0,
      onClick: () => Kt(),
      disabled: !C,
      style: je
    }, "打开流程编辑器") : null
  );
  return e.createElement(
    "div",
    null,
    C ? null : e.createElement(r, {
      type: "warning",
      message: "FlowForge 引擎未启动",
      description: "协作工作流功能需要 FlowForge 后端引擎支持。请检查后端是否正常运行，或联系管理员。",
      showIcon: !0,
      style: { marginBottom: 16 }
    }),
    e.createElement(g, {
      items: [
        { key: "templates", label: "工作流模板", children: J },
        { key: "mine", label: `我的工作流 (${k.length})`, children: b },
        {
          key: "runs",
          label: e.createElement(
            "span",
            null,
            "运行中心 (",
            Q.length,
            Te ? e.createElement(
              "span",
              { style: { color: "#1677ff", marginLeft: 2 } },
              `·${Q.filter((v) => St.has(v.status)).length} 活跃`
            ) : null,
            ")"
          ),
          children: me
        }
      ],
      activeKey: pe,
      onChange: (v) => se(v),
      tabBarExtraContent: F
    })
  );
}
function Wn(e, t) {
  var a, r;
  const l = e.coordinatorName || ((a = e.members[0]) == null ? void 0 : a.name), n = e.members.find((o) => o.name === l) || e.members[0];
  if ((n == null ? void 0 : n.bindingMode) !== "temporary" && (n != null && n.agentId) && t.some((o) => o.id === n.agentId))
    return n.agentId;
  if (l && (n == null ? void 0 : n.bindingMode) !== "temporary") {
    const o = fa(t, l);
    if (o) return o;
  }
  return (n == null ? void 0 : n.bindingMode) === "fixed" ? null : ((r = t[0]) == null ? void 0 : r.id) || null;
}
function Jn() {
  const e = new URLSearchParams(window.location.search).get("section");
  return e === "teams" || e === "workflows" ? e : "experts";
}
function gr() {
  var de, ge;
  const e = P().React, { useState: t, useEffect: l, useCallback: n, useMemo: a } = e, {
    Spin: r,
    Empty: o,
    Input: c,
    Button: s,
    message: d,
    Row: u,
    Col: h,
    Tabs: w,
    Modal: m,
    Typography: p
  } = P().antd, {
    ReloadOutlined: g,
    PlusOutlined: f,
    SearchOutlined: E,
    TeamOutlined: $,
    UserOutlined: z
  } = P().antdIcons || {}, { Text: _, Paragraph: O } = p, [D, H] = t([]), [L, I] = t(!0), [G, W] = t(!1), [T, x] = t(null), [S, M] = t(""), [k, V] = t(!1), [Q, j] = t(Jn), [R, y] = t(
    null
  ), [ne, K] = t(""), [C, q] = t(!1), [re, Y] = t(!1), [te, fe] = t(null), [B, oe] = t([]), pe = n(async () => {
    I(!0);
    try {
      const J = await Ut(), b = await Promise.all(
        J.map(async (me) => {
          try {
            const [F, v, ae] = await Promise.all([
              nn(me.id).catch(() => null),
              jt(me.id).catch(() => []),
              rn(me.id).catch(() => [])
            ]);
            return {
              agent: me,
              config: F,
              skills: v,
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
      H(b), oe(J);
    } catch (J) {
      d.error(J.message || "加载专家列表失败"), H([]);
    } finally {
      I(!1);
    }
  }, []);
  l(() => {
    pe();
  }, [pe]), l(() => {
    const J = () => j(Jn());
    return window.addEventListener("popstate", J), () => window.removeEventListener("popstate", J);
  }, []), l(() => {
    if (te && re) {
      const J = D.find(
        (b) => b.agent.id === te.agent.id
      );
      J && J !== te && fe(J);
    }
  }, [D, te, re]);
  const se = n(
    async (J) => {
      var v;
      const b = J.coordinatorName || ((v = J.members[0]) == null ? void 0 : v.name), me = Wn(J, B);
      if (!me) {
        const ae = J.members.find(
          (ce) => ce.name === b
        );
        d.error(
          (ae == null ? void 0 : ae.bindingMode) === "fixed" ? `固定协调者「${b || "协调者"}」当前不可用，请修复绑定后再运行` : "没有可用的 Agent 作为工作流控制器"
        );
        return;
      }
      if (/\{.+?\}/.test(J.taskTemplate)) {
        K(J.taskTemplate), y(J);
        return;
      }
      await le(J, me, J.taskTemplate);
    },
    [B, d]
  ), le = n(
    async (J, b, me) => {
      q(!0);
      try {
        const F = me || J.taskTemplate, v = J.custom ? `@${J.id}` : J.name, ae = `/ugsci-team ${J.mode} ${v} ${F}`, ce = P();
        ce.setSelectedAgent && ce.setSelectedAgent(b);
        const ze = await ql(
          b,
          ae,
          J.name
        );
        d.success(
          `OMP 工作流已启动：${J.name}（${J.mode}模式）`
        ), y(null), Ee(`/chat/${ze}`);
      } catch (F) {
        d.error(F.message || "发起团队任务失败");
      } finally {
        q(!1);
      }
    },
    [d]
  ), Ee = (J) => {
    window.history.pushState({}, "", J), window.dispatchEvent(new PopStateEvent("popstate"));
  }, he = n((J) => {
    x(J), W(!0);
  }, []), Te = n((J) => {
    fe(J), Y(!0);
  }, []), Oe = n(
    (J) => {
      if (!J.agent.enabled) {
        d.warning(`专家「${J.agent.name}」未启用，请先启用`);
        return;
      }
      try {
        const b = P();
        b.setSelectedAgent && b.setSelectedAgent(J.agent.id);
      } catch (b) {
        console.warn("[ugsci] Failed to set selected agent:", b);
      }
      d.success(`已召唤专家「${J.agent.name}」，正在跳转至对话...`), Ee("/chat");
    },
    [d]
  ), be = a(() => {
    if (!S.trim()) return D;
    const J = S.toLowerCase();
    return D.filter(
      (b) => {
        var me;
        return b.agent.name.toLowerCase().includes(J) || ((me = b.agent.description) == null ? void 0 : me.toLowerCase().includes(J)) || b.agent.id.toLowerCase().includes(J) || b.skills.some((F) => F.name.toLowerCase().includes(J));
      }
    );
  }, [D, S]), ee = D.filter((J) => J.agent.enabled).length, Se = D.reduce(
    (J, b) => J + b.skills.filter((me) => me.enabled !== !1).length,
    0
  ), ye = D.reduce((J, b) => J + b.mcps.length, 0), X = [
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
            prefix: E ? e.createElement(E) : void 0,
            value: S,
            onChange: (J) => M(J.target.value),
            allowClear: !0,
            style: { flex: "1 1 280px", maxWidth: 400 }
          }),
          e.createElement(
            s,
            {
              type: "primary",
              icon: f ? e.createElement(f) : void 0,
              onClick: () => V(!0),
              style: je
            },
            "创建专家"
          )
        ),
        // Content
        L ? e.createElement(
          "div",
          { style: { textAlign: "center", padding: 60 } },
          e.createElement(r, { size: "large" })
        ) : be.length === 0 ? e.createElement(o, {
          description: S ? "未找到匹配的专家" : "暂无专家，点击「创建专家」添加"
        }) : e.createElement(
          u,
          { gutter: [12, 12], align: "stretch" },
          ...be.map(
            (J) => e.createElement(
              h,
              {
                key: J.agent.id,
                xs: 24,
                sm: 12,
                md: 8,
                lg: 6,
                style: { display: "flex" }
              },
              e.createElement(Bl, {
                expert: J,
                onClick: () => he(J),
                onSummon: () => Oe(J),
                onConfigure: () => Te(J)
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
        $ ? e.createElement($, { style: { fontSize: 14 } }) : null,
        "专家团"
      ),
      children: e.createElement(rr, {
        agents: B,
        onLaunch: se
      })
    },
    {
      key: "workflows",
      label: e.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        (de = P().antdIcons) != null && de.ApartmentOutlined ? e.createElement(P().antdIcons.ApartmentOutlined, {
          style: { fontSize: 14 }
        }) : null,
        "协作工作流"
      ),
      children: e.createElement(pr)
    }
  ];
  return e.createElement(
    "div",
    { style: { padding: 24 } },
    e.createElement(Bt, {
      title: "专家·协作",
      subtitle: Q === "experts" ? `共 ${D.length} 位专家（${ee} 位启用）· ${Se} 个技能 · ${ye} 个 MCP 客户端` : Q === "teams" ? "开放式多专家讨论、联合研判与 OMP 动态协作" : "流程化、可观测、可验证的油气与储气库协作流程",
      extra: e.createElement(
        e.Fragment,
        null,
        Q === "experts" ? e.createElement(
          s,
          {
            icon: g ? e.createElement(g) : void 0,
            onClick: () => {
              ft(), pe();
            },
            loading: L
          },
          "刷新"
        ) : null
      )
    }),
    e.createElement(w, {
      items: X,
      activeKey: Q,
      onChange: (J) => {
        j(J);
        const b = new URL(window.location.href);
        J === "experts" ? b.searchParams.delete("section") : b.searchParams.set("section", J), window.history.pushState({}, "", `${b.pathname}${b.search}`);
      }
    }),
    // Drawer
    e.createElement(Ul, {
      expert: T,
      open: G,
      onClose: () => W(!1),
      onRefresh: () => pe()
    }),
    // Template Modal
    e.createElement(jl, {
      open: k,
      onClose: () => V(!1),
      onCreated: () => pe()
    }),
    // Config Modal (gear icon)
    e.createElement(Ml, {
      expert: te,
      open: re,
      onClose: () => Y(!1),
      onRefresh: () => pe()
    }),
    // Team Launch Modal (for filling placeholders)
    R ? e.createElement(
      m,
      {
        open: !0,
        title: e.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 8 } },
          e.createElement(sn, {
            members: R.members.map((J) => J.name),
            size: 28
          }),
          e.createElement(
            "span",
            null,
            `发起团队任务 - ${R.name}`
          )
        ),
        onCancel: () => y(null),
        onOk: () => {
          const J = Wn(
            R,
            B
          );
          if (!J) {
            d.error("固定协调者不可用或没有可用的控制器 Agent");
            return;
          }
          const b = ne.trim() || R.taskTemplate;
          le(R, J, b);
        },
        confirmLoading: C,
        okText: "发起任务",
        width: 600
      },
      e.createElement(
        "div",
        null,
        e.createElement(
          _,
          {
            type: "secondary",
            style: { fontSize: 12, display: "block", marginBottom: 8 }
          },
          "任务内容（请替换 {参数名} 等占位符后发起）："
        ),
        e.createElement(c.TextArea, {
          value: ne,
          onChange: (J) => K(J.target.value),
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
          _,
          { style: { fontSize: 12, color: "#0958d9" } },
          `协调者: ${R.coordinatorName || ((ge = R.members[0]) == null ? void 0 : ge.name) || "—"} · 成员: ${R.members.map((J) => J.name).join("、")}`
        )
      )
    ) : null
  );
}
function fr({
  agentId: e,
  agentName: t,
  refreshKey: l = 0,
  onNavigate: n
}) {
  const a = P().React, { useState: r, useEffect: o, useCallback: c } = a, {
    Spin: s,
    Empty: d,
    Button: u,
    Row: h,
    Col: w,
    Card: m,
    Tag: p,
    Checkbox: g,
    Modal: f,
    Typography: E,
    Drawer: $,
    Descriptions: z,
    message: _
  } = P().antd, {
    ReloadOutlined: O,
    ThunderboltOutlined: D,
    SettingOutlined: H,
    CheckSquareOutlined: L,
    EyeOutlined: I,
    EyeInvisibleOutlined: G,
    DeleteOutlined: W,
    CloseOutlined: T
  } = P().antdIcons || {}, { Text: x, Paragraph: S } = E, [M, k] = r([]), [V, Q] = r(!0), [j, R] = r(!1), [y, ne] = r(null), [K, C] = r(!1), [q, re] = r(
    /* @__PURE__ */ new Set()
  ), [Y, te] = r(!1), [fe, B] = r(null), [oe, pe] = r(!1), se = c(async () => {
    if (e) {
      Q(!0);
      try {
        const X = await jt(e);
        k(X);
      } catch (X) {
        _.error(X.message || "加载技能失败"), k([]);
      } finally {
        Q(!1);
      }
    }
  }, [e]);
  o(() => {
    se();
  }, [se, l]);
  const le = (X) => {
    re((de) => {
      const ge = new Set(de);
      return ge.has(X) ? ge.delete(X) : ge.add(X), ge;
    });
  }, Ee = () => re(/* @__PURE__ */ new Set()), he = () => re(new Set(M.map((X) => X.name))), Te = () => {
    K ? (Ee(), C(!1)) : C(!0);
  }, Oe = async () => {
    const X = Array.from(q);
    if (X.length !== 0) {
      te(!0);
      try {
        const { results: de } = await ul(e, X), ge = Object.entries(de).filter(
          ([, b]) => b.success === !1
        ), J = X.length - ge.length;
        ge.length > 0 ? _.warning(
          `批量启用完成：成功 ${J} 个，失败 ${ge.length} 个`
        ) : _.success(`成功启用 ${X.length} 个技能`), Ee(), await se();
      } catch (de) {
        _.error(de.message || "批量启用失败");
      } finally {
        te(!1);
      }
    }
  }, be = async () => {
    const X = Array.from(q);
    if (X.length !== 0) {
      te(!0);
      try {
        const { results: de } = await pl(e, X), ge = Object.entries(de).filter(
          ([, b]) => b.success === !1
        ), J = X.length - ge.length;
        ge.length > 0 ? _.warning(
          `批量停用完成：成功 ${J} 个，失败 ${ge.length} 个`
        ) : _.success(`成功停用 ${X.length} 个技能`), Ee(), await se();
      } catch (de) {
        _.error(de.message || "批量停用失败");
      } finally {
        te(!1);
      }
    }
  }, ee = () => {
    const X = Array.from(q);
    X.length !== 0 && f.confirm({
      title: `确认删除 ${X.length} 个技能？`,
      content: "删除后技能将从当前专家工作区移除，此操作不可撤销。技能池中的原始技能不受影响。",
      okText: "确认删除",
      cancelText: "取消",
      okButtonProps: { danger: !0 },
      onOk: async () => {
        te(!0);
        try {
          const { results: de } = await gl(e, X), ge = Object.entries(de).filter(
            ([, b]) => b.success === !1
          ), J = X.length - ge.length;
          ge.length > 0 ? _.warning(
            `批量删除完成：成功 ${J} 个，失败 ${ge.length} 个`
          ) : _.success(`成功删除 ${X.length} 个技能`), Ee(), await se();
        } catch (de) {
          _.error(de.message || "批量删除失败");
        } finally {
          te(!1);
        }
      }
    });
  }, Se = async (X) => {
    pe(!0);
    try {
      X.enabled === !1 ? (await ra(e, X.name), _.success(`已启用技能「${X.name}」`)) : (await sa(e, X.name), _.success(`已禁用技能「${X.name}」`)), await se();
    } catch (de) {
      _.error(de.message || "操作失败");
    } finally {
      pe(!1);
    }
  }, ye = (X) => {
    f.confirm({
      title: `确认删除技能「${X.name}」？`,
      content: "删除后技能将从当前专家工作区移除，此操作不可撤销。技能池中的原始技能不受影响。",
      okText: "确认删除",
      cancelText: "取消",
      okButtonProps: { danger: !0 },
      onOk: async () => {
        pe(!0);
        try {
          await ln(e, X.name), _.success(`已删除技能「${X.name}」`), await se();
        } catch (de) {
          _.error(de.message || "删除失败");
        } finally {
          pe(!1);
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
        K ? `已选择 ${q.size} / ${M.length} 个技能` : `共 ${M.length} 个技能`
      ),
      a.createElement(
        "div",
        { style: { display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" } },
        K ? a.createElement(
          a.Fragment,
          null,
          a.createElement(
            u,
            { size: "small", onClick: he },
            "全选"
          ),
          a.createElement(
            u,
            {
              size: "small",
              icon: T ? a.createElement(T) : void 0,
              onClick: Ee
            },
            "取消选择"
          ),
          a.createElement(
            u,
            {
              size: "small",
              type: "default",
              icon: I ? a.createElement(I) : void 0,
              disabled: q.size === 0 || Y,
              loading: Y,
              onClick: Oe
            },
            "批量启用"
          ),
          a.createElement(
            u,
            {
              size: "small",
              danger: !0,
              icon: G ? a.createElement(G) : void 0,
              disabled: q.size === 0 || Y,
              loading: Y,
              onClick: be
            },
            "批量停用"
          ),
          a.createElement(
            u,
            {
              size: "small",
              danger: !0,
              icon: W ? a.createElement(W) : void 0,
              disabled: q.size === 0 || Y,
              loading: Y,
              onClick: ee
            },
            `删除 (${q.size})`
          ),
          a.createElement(
            u,
            {
              size: "small",
              type: "primary",
              onClick: Te
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
              icon: L ? a.createElement(L) : void 0,
              onClick: Te,
              disabled: M.length === 0
            },
            "批量管理"
          ),
          a.createElement(
            u,
            {
              icon: O ? a.createElement(O) : void 0,
              onClick: () => {
                ft(), se();
              }
            },
            "刷新"
          )
        )
      )
    ),
    V ? a.createElement(
      "div",
      { style: { textAlign: "center", padding: 60 } },
      a.createElement(s, { size: "large" })
    ) : M.length === 0 ? a.createElement(d, {
      description: "当前智能体未加载任何技能"
    }) : a.createElement(
      h,
      { gutter: [12, 12] },
      ...M.map(
        (X) => a.createElement(
          w,
          { key: X.name, xs: 24, sm: 12, md: 8, lg: 6 },
          a.createElement(
            m,
            {
              hoverable: !0,
              size: "small",
              style: {
                cursor: K ? "default" : "pointer",
                height: "100%",
                position: "relative",
                borderColor: K && q.has(X.name) ? "#0072f5" : void 0,
                borderWidth: K && q.has(X.name) ? 2 : 1
              },
              onClick: () => {
                K ? le(X.name) : (ne(X), R(!0));
              },
              onMouseEnter: () => {
                K || B(X.name);
              },
              onMouseLeave: () => B(null)
            },
            K ? a.createElement(
              "div",
              {
                style: {
                  position: "absolute",
                  top: 8,
                  right: 8,
                  zIndex: 1
                },
                onClick: (de) => {
                  de.stopPropagation(), le(X.name);
                }
              },
              a.createElement(g, {
                checked: q.has(X.name)
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
              X.emoji ? a.createElement(
                "span",
                { style: { fontSize: 18 } },
                X.emoji
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
                X.name
              ),
              X.enabled === !1 ? a.createElement(
                p,
                { color: "default", style: { fontSize: 10 } },
                "已禁用"
              ) : a.createElement(
                p,
                { color: "green", style: { fontSize: 10 } },
                "已启用"
              )
            ),
            X.description ? a.createElement(
              S,
              {
                type: "secondary",
                style: { fontSize: 11, margin: 0, lineHeight: 1.4 },
                ellipsis: { rows: 2 }
              },
              X.description
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
              X.version_text ? a.createElement(
                p,
                { style: { fontSize: 10 } },
                `v${X.version_text}`
              ) : null,
              ...(X.tags || []).slice(0, 3).map(
                (de, ge) => a.createElement(
                  p,
                  { key: ge, color: "blue", style: { fontSize: 10 } },
                  de
                )
              )
            ),
            // Hover action footer (not in batch mode)
            !K && fe === X.name ? a.createElement(
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
                  icon: X.enabled === !1 ? I ? a.createElement(I) : void 0 : G ? a.createElement(G) : void 0,
                  disabled: oe,
                  onClick: (de) => {
                    de.stopPropagation(), Se(X);
                  }
                },
                X.enabled === !1 ? "启用" : "禁用"
              ),
              a.createElement(
                u,
                {
                  size: "small",
                  danger: !0,
                  icon: W ? a.createElement(W) : void 0,
                  disabled: oe,
                  onClick: (de) => {
                    de.stopPropagation(), ye(X);
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
    y ? a.createElement(
      $,
      {
        title: a.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 8 } },
          a.createElement(
            "span",
            { style: { fontSize: 18 } },
            y.emoji || "⚡"
          ),
          a.createElement("span", null, y.name)
        ),
        open: j,
        onClose: () => R(!1),
        width: 520,
        extra: a.createElement(
          u,
          {
            type: "primary",
            size: "small",
            icon: H ? a.createElement(H) : void 0,
            onClick: () => n("/skills")
          },
          "管理技能"
        )
      },
      a.createElement(
        z,
        { column: 1, bordered: !0, size: "small" },
        a.createElement(
          z.Item,
          { label: "技能名称" },
          y.name
        ),
        a.createElement(
          z.Item,
          { label: "描述" },
          y.description || "-"
        ),
        y.version_text ? a.createElement(
          z.Item,
          { label: "版本" },
          y.version_text
        ) : null,
        a.createElement(
          z.Item,
          { label: "来源" },
          y.source || "-"
        ),
        a.createElement(
          z.Item,
          { label: "状态" },
          y.enabled === !1 ? "已禁用" : "已启用"
        ),
        y.installed_from ? a.createElement(
          z.Item,
          { label: "安装来源" },
          y.installed_from
        ) : null
      ),
      // Tags
      y.tags && y.tags.length > 0 ? a.createElement(
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
          ...y.tags.map(
            (X, de) => a.createElement(p, { key: de, color: "blue" }, X)
          )
        )
      ) : null,
      // Skill content preview
      y.content ? a.createElement(
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
          y.content.slice(0, 2e3) + (y.content.length > 2e3 ? `

... (内容已截断)` : "")
        )
      ) : null
    ) : null
  );
}
function yr({
  poolSkills: e,
  workspaceSkills: t,
  agents: l,
  loading: n,
  onReload: a,
  onSkillInstalled: r,
  agentId: o,
  agentName: c
}) {
  const s = P().React, { useState: d, useMemo: u, useCallback: h, useEffect: w, useRef: m } = s, {
    Spin: p,
    Empty: g,
    Input: f,
    Button: E,
    Row: $,
    Col: z,
    Card: _,
    Tag: O,
    Typography: D,
    Drawer: H,
    Descriptions: L,
    List: I,
    Modal: G,
    message: W
  } = P().antd, {
    ReloadOutlined: T,
    SearchOutlined: x,
    DownloadOutlined: S,
    ThunderboltOutlined: M,
    DeleteOutlined: k,
    PlusOutlined: V
  } = P().antdIcons || {}, { Text: Q, Paragraph: j } = D, [R, y] = d(""), [ne, K] = d(!1), [C, q] = d(null), [re, Y] = d([]), [te, fe] = d(!1), [B, oe] = d(24), [pe, se] = d(null), [le, Ee] = d(!1), he = m(0), Te = m(null), Oe = u(
    () => {
      var F;
      return new Set(
        ((F = t.find((v) => v.agent_id === o)) == null ? void 0 : F.skills.map((v) => v.name)) || []
      );
    },
    [t, o]
  ), be = u(() => {
    if (!R.trim()) return e;
    const F = R.toLowerCase();
    return e.filter(
      (v) => {
        var ae, ce;
        return v.name.toLowerCase().includes(F) || ((ae = v.description) == null ? void 0 : ae.toLowerCase().includes(F)) || ((ce = v.tags) == null ? void 0 : ce.some((ze) => ze.toLowerCase().includes(F)));
      }
    );
  }, [e, R]), ee = u(
    () => be.slice(0, B),
    [be, B]
  );
  w(() => {
    if (ee.length >= be.length) return;
    const F = Te.current;
    if (!F) return;
    const v = () => {
      oe(
        (ce) => Math.min(ce + 24, be.length)
      );
    };
    if (typeof IntersectionObserver < "u") {
      const ce = new IntersectionObserver(
        (ze) => {
          ze.some((_e) => _e.isIntersecting) && v();
        },
        { rootMargin: "240px 0px" }
      );
      return ce.observe(F), () => ce.disconnect();
    }
    const ae = () => {
      F.getBoundingClientRect().top <= window.innerHeight + 240 && v();
    };
    return window.addEventListener("scroll", ae, { passive: !0 }), ae(), () => window.removeEventListener("scroll", ae);
  }, [be.length, ee.length]);
  const Se = h((F) => {
    y(F), oe(24);
  }, []), ye = h(() => {
    const F = he.current;
    requestAnimationFrame(() => {
      window.scrollTo({ top: F, behavior: "auto" }), document.scrollingElement && (document.scrollingElement.scrollTop = F);
    });
  }, []), X = h(async () => {
    var F;
    he.current = ((F = document.scrollingElement) == null ? void 0 : F.scrollTop) ?? window.scrollY ?? 0;
    try {
      await a();
    } finally {
      ye();
    }
  }, [a, ye]), de = h(
    (F) => {
      const v = [];
      for (const ae of t)
        if (ae.skills.some((ce) => ce.name === F)) {
          const ce = l.find((ze) => ze.id === ae.agent_id);
          v.push((ce == null ? void 0 : ce.name) || ae.agent_name || ae.agent_id);
        }
      return v;
    },
    [t, l]
  ), ge = h(
    async (F) => {
      if (q(F), Y(de(F.name)), K(!0), !F.content) {
        fe(!0);
        try {
          const v = await rl(F.name);
          q({ ...F, content: v });
        } catch {
        } finally {
          fe(!1);
        }
      }
    },
    [de]
  );
  w(() => {
    C && Y(de(C.name));
  }, [C, de, t]);
  const J = async (F) => {
    Ee(!0);
    try {
      await an(o, F.name), W.success(
        `已将技能「${F.name}」加载到当前专家「${c}」`
      ), r(F);
    } catch (v) {
      W.error(v.message || "加载技能失败");
    } finally {
      Ee(!1);
    }
  }, b = (F) => {
    if (F.protected) {
      W.warning("内置技能不可删除");
      return;
    }
    G.confirm({
      title: `确认从技能池删除「${F.name}」？`,
      content: "删除后所有已安装此技能的专家将不受影响，但技能池中将不再包含此技能。此操作不可撤销。",
      okText: "确认删除",
      cancelText: "取消",
      okButtonProps: { danger: !0 },
      onOk: async () => {
        Ee(!0);
        try {
          await yl(F.name), W.success(`已从技能池删除「${F.name}」`), await X();
        } catch (v) {
          W.error(v.message || "删除失败");
        } finally {
          Ee(!1);
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
      s.createElement(f, {
        placeholder: "搜索技能名称、描述或标签...",
        prefix: x ? s.createElement(x) : void 0,
        value: R,
        onChange: (F) => Se(F.target.value),
        allowClear: !0,
        style: { maxWidth: 400 }
      }),
      s.createElement(
        "div",
        { style: { display: "flex", gap: 8 } },
        s.createElement(
          E,
          {
            icon: T ? s.createElement(T) : void 0,
            onClick: X,
            loading: n,
            size: "small"
          },
          "刷新"
        ),
        s.createElement(
          E,
          {
            type: "primary",
            icon: S ? s.createElement(S) : void 0,
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
      s.createElement(p, { size: "large" })
    ) : be.length === 0 ? s.createElement(g, {
      description: R ? "未找到匹配的技能" : "技能池为空"
    }) : s.createElement(
      s.Fragment,
      null,
      s.createElement(
        $,
        { gutter: [12, 12] },
        ...ee.map(
          (F) => s.createElement(
            z,
            { key: F.name, xs: 24, sm: 12, md: 8, lg: 6 },
            s.createElement(
              _,
              {
                hoverable: !0,
                size: "small",
                style: { cursor: "pointer", height: "100%" },
                onClick: () => ge(F),
                onMouseEnter: () => se(F.name),
                onMouseLeave: () => se(null)
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
                  Q,
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
                  O,
                  { color: "gold", style: { fontSize: 10 } },
                  "内置"
                ) : null
              ),
              F.description ? s.createElement(
                j,
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
                  O,
                  { style: { fontSize: 10 } },
                  `v${F.version_text}`
                ) : null,
                ...(F.tags || []).slice(0, 3).map(
                  (v, ae) => s.createElement(
                    O,
                    { key: ae, color: "cyan", style: { fontSize: 10 } },
                    v
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
                  E,
                  {
                    size: "small",
                    type: "primary",
                    icon: V ? s.createElement(V) : void 0,
                    disabled: le || Oe.has(F.name),
                    onClick: (v) => {
                      v.stopPropagation(), J(F);
                    }
                  },
                  Oe.has(F.name) ? "已加载" : "加载到当前Agent"
                ),
                s.createElement(
                  E,
                  {
                    size: "small",
                    danger: !0,
                    icon: k ? s.createElement(k) : void 0,
                    disabled: le || F.protected,
                    onClick: (v) => {
                      v.stopPropagation(), b(F);
                    }
                  },
                  "删除"
                )
              ) : null
            )
          )
        ),
        // Infinite-scroll sentinel
        ee.length < be.length ? s.createElement(
          "div",
          {
            ref: Te,
            style: {
              minHeight: 40,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginTop: 16
            }
          },
          s.createElement(
            Q,
            { type: "secondary", style: { fontSize: 12 } },
            `继续下滑自动加载 · 还剩 ${be.length - ee.length} 个`
          )
        ) : null
      )
    ),
    // Skill detail drawer
    C ? s.createElement(
      H,
      {
        title: s.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 8 } },
          s.createElement(
            "span",
            { style: { fontSize: 18 } },
            C.emoji || "⚡"
          ),
          s.createElement("span", null, C.name)
        ),
        open: ne,
        onClose: () => K(!1),
        width: 520,
        extra: s.createElement(
          E,
          {
            type: "primary",
            size: "small",
            icon: M ? s.createElement(M) : void 0,
            onClick: () => me("/skills")
          },
          "管理技能"
        )
      },
      s.createElement(
        L,
        { column: 1, bordered: !0, size: "small" },
        s.createElement(
          L.Item,
          { label: "技能名称" },
          C.name
        ),
        s.createElement(
          L.Item,
          { label: "描述" },
          C.description || "-"
        ),
        C.version_text ? s.createElement(
          L.Item,
          { label: "版本" },
          C.version_text
        ) : null,
        s.createElement(
          L.Item,
          { label: "来源" },
          C.source || "-"
        ),
        s.createElement(
          L.Item,
          { label: "受保护" },
          C.protected ? "是（内置）" : "否"
        ),
        C.sync_status ? s.createElement(
          L.Item,
          { label: "同步状态" },
          C.sync_status
        ) : null,
        C.installed_from ? s.createElement(
          L.Item,
          { label: "安装来源" },
          C.installed_from
        ) : null
      ),
      // Tags
      C.tags && C.tags.length > 0 ? s.createElement(
        "div",
        { style: { marginTop: 16 } },
        s.createElement(
          Q,
          {
            strong: !0,
            style: { display: "block", marginBottom: 8 }
          },
          "标签"
        ),
        s.createElement(
          "div",
          { style: { display: "flex", flexWrap: "wrap", gap: 4 } },
          ...C.tags.map(
            (F, v) => s.createElement(O, { key: v, color: "cyan" }, F)
          )
        )
      ) : null,
      // Installed agents
      s.createElement(
        "div",
        { style: { marginTop: 16 } },
        s.createElement(
          Q,
          { strong: !0, style: { display: "block", marginBottom: 8 } },
          `已安装此技能的专家 (${re.length})`
        ),
        re.length > 0 ? s.createElement(I, {
          size: "small",
          dataSource: re,
          renderItem: (F) => s.createElement(
            I.Item,
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
              s.createElement(Ge, { name: F, size: 20 }),
              s.createElement(
                Q,
                { style: { fontSize: 13 } },
                F
              )
            )
          )
        }) : s.createElement(
          Q,
          { type: "secondary", style: { fontSize: 12 } },
          "暂无专家安装此技能"
        )
      ),
      // Skill content preview (lazy-loaded)
      te ? s.createElement(
        "div",
        { style: { marginTop: 16, textAlign: "center" } },
        s.createElement(p, { size: "small" })
      ) : C.content ? s.createElement(
        "div",
        { style: { marginTop: 16 } },
        s.createElement(
          Q,
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
          C.content.slice(0, 2e3) + (C.content.length > 2e3 ? `

... (内容已截断)` : "")
        )
      ) : null
    ) : null
  );
}
function Er({
  embedded: e = !1
} = {}) {
  const t = P().React, { useState: l, useEffect: n, useCallback: a, useMemo: r } = t, { Tabs: o, message: c } = P().antd, { ThunderboltOutlined: s, AppstoreOutlined: d } = P().antdIcons || {}, h = P().useSelectedAgent, w = h ? h() : null, m = (w == null ? void 0 : w.id) || "default";
  n(() => {
    tn();
  }, [m]);
  const [p, g] = l([]), [f, E] = l([]), [$, z] = l([]), [_, O] = l(!0), [D, H] = l("agent-skills"), [L, I] = l(0), G = a(async () => {
    O(!0);
    try {
      const [k, V, Q] = await Promise.all([
        Nt(!0),
        Ut(),
        ol()
      ]);
      E(k), g(V), z(Q);
    } catch (k) {
      c.error(k.message || "加载技能列表失败"), E([]);
    } finally {
      O(!1);
    }
  }, []);
  n(() => {
    G();
  }, [G]);
  const W = r(() => {
    const k = p.find((V) => V.id === m);
    return (k == null ? void 0 : k.name) || m;
  }, [p, m]), T = a(
    (k) => {
      z(
        (V) => V.map((Q) => Q.agent_id !== m || Q.skills.some((j) => j.name === k.name) ? Q : {
          ...Q,
          skills: [
            ...Q.skills,
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
      ), I((V) => V + 1);
    },
    [m]
  ), x = (k) => {
    window.history.pushState({}, "", k), window.dispatchEvent(new PopStateEvent("popstate"));
  }, S = [
    {
      key: "agent-skills",
      label: t.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        s ? t.createElement(s, { style: { fontSize: 14 } }) : null,
        "当前专家"
      ),
      children: t.createElement(fr, {
        agentId: m,
        agentName: W,
        refreshKey: L,
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
      children: t.createElement(yr, {
        poolSkills: f,
        workspaceSkills: $,
        agents: p,
        loading: _,
        onReload: G,
        onSkillInstalled: T,
        agentId: m,
        agentName: W
      })
    }
  ], M = t.createElement(o, {
    items: S,
    activeKey: D,
    onChange: (k) => H(k)
  });
  return e ? M : t.createElement(
    "div",
    { style: { padding: 24 } },
    t.createElement(Bt, {
      title: "技能",
      subtitle: `技能池共 ${f.length} 个技能 · 当前智能体：${W}`
    }),
    M
  );
}
const Yt = {
  reservoir_simulation: "油藏数值模拟",
  geological_modeling: "地质建模",
  well_log_analysis: "测井分析",
  production_engineering: "采油工程",
  post_processing: "后处理与可视化",
  multiphysics: "多物理场仿真"
}, Ea = {
  reservoir_simulation: "🛢️",
  geological_modeling: "🏔️",
  well_log_analysis: "📡",
  production_engineering: "⚙️",
  post_processing: "📊",
  multiphysics: "🔬"
}, ha = /* @__PURE__ */ new Set(["cmg", "comsol", "tnavigator", "eclipse", "intersect", "visage"]);
function va(e) {
  return Lt(`/ugsci/engines/icon/${encodeURIComponent(e)}`);
}
async function hr() {
  return ie("/ugsci/engines/list");
}
async function vr(e) {
  return ie("/ugsci/engines/", {
    method: "POST",
    body: JSON.stringify(e)
  });
}
async function br(e, t) {
  return ie(`/ugsci/engines/${encodeURIComponent(e)}`, {
    method: "PUT",
    body: JSON.stringify(t)
  });
}
async function wr(e) {
  return ie(
    `/ugsci/engines/${encodeURIComponent(e)}`,
    { method: "DELETE" }
  );
}
async function Sr() {
  return ie("/ugsci/engines/detect/refresh", {
    method: "POST"
  });
}
function xr({
  engine: e,
  onClick: t
}) {
  const l = P().React, { Card: n, Tag: a, Typography: r } = P().antd, { Text: o } = r, c = e.status === "detected", s = Ea[e.category] || "📦", u = ha.has(e.id) ? l.createElement("img", {
    src: va(e.id),
    alt: e.name,
    style: { width: 24, height: 24, objectFit: "contain" }
  }) : l.createElement("span", { style: { fontSize: 20 } }, s);
  return l.createElement(
    n,
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
          a,
          { color: "success", style: { fontSize: 11 } },
          "✅ 已检测"
        ) : e.executable_path ? l.createElement(
          a,
          { color: "warning", style: { fontSize: 11 } },
          "⚠ 路径无效"
        ) : l.createElement(
          a,
          { style: { fontSize: 11 } },
          "🔧 待配置"
        ),
        e.is_default ? l.createElement(
          a,
          { color: "blue", style: { fontSize: 10 } },
          "默认"
        ) : e.is_custom ? l.createElement(
          a,
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
        a,
        { style: { fontSize: 11 } },
        Yt[e.category] || e.category
      ) : null,
      e.version ? l.createElement(
        a,
        { color: "blue", style: { fontSize: 11 } },
        `v${e.version}`
      ) : null,
      ...(e.modules || []).map(
        (h) => l.createElement(
          a,
          { key: h, color: "cyan", style: { fontSize: 10 } },
          h
        )
      )
    )
  );
}
function kr() {
  const e = P().React, { useState: t, useEffect: l, useCallback: n, useMemo: a } = e, {
    Spin: r,
    Empty: o,
    Button: c,
    message: s,
    Row: d,
    Col: u,
    Drawer: h,
    Descriptions: w,
    Tag: m,
    Typography: p,
    Modal: g,
    Input: f,
    Select: E,
    Popconfirm: $,
    Space: z
  } = P().antd, {
    ReloadOutlined: _,
    SearchOutlined: O,
    PlusOutlined: D,
    EditOutlined: H,
    DeleteOutlined: L,
    CopyOutlined: I,
    ExperimentOutlined: G
  } = P().antdIcons || {}, { Text: W, Paragraph: T } = p, [x, S] = t([]), [M, k] = t(!0), [V, Q] = t(""), [j, R] = t(!1), [y, ne] = t(null), [K, C] = t(!1), [q, re] = t(null), [Y, te] = t({}), [fe, B] = t(!1), oe = n(async () => {
    k(!0);
    try {
      const ee = await hr();
      S(ee.engines || []);
    } catch (ee) {
      s.error(ee.message || "加载引擎列表失败"), S([]);
    } finally {
      k(!1);
    }
  }, []);
  l(() => {
    oe();
  }, [oe]);
  const pe = a(() => {
    if (!V.trim()) return x;
    const ee = V.toLowerCase();
    return x.filter(
      (Se) => {
        var ye;
        return Se.name.toLowerCase().includes(ee) || Se.vendor.toLowerCase().includes(ee) || Se.category.toLowerCase().includes(ee) || ((ye = Se.description) == null ? void 0 : ye.toLowerCase().includes(ee));
      }
    );
  }, [x, V]);
  x.filter((ee) => ee.status === "detected").length;
  const se = n((ee) => {
    navigator.clipboard.writeText(ee).then(() => s.success("路径已复制")).catch(() => s.error("复制失败"));
  }, []), le = n(() => {
    re(null), te({
      name: "",
      vendor: "",
      version: "",
      executable_path: "",
      category: "",
      description: "",
      invocation_hint: ""
    }), C(!0);
  }, []), Ee = n((ee) => {
    re(ee), te({ ...ee }), C(!0), R(!1);
  }, []), he = n(async () => {
    var ee;
    if (!((ee = Y.name) != null && ee.trim())) {
      s.warning("请输入引擎名称");
      return;
    }
    B(!0);
    try {
      q ? (await br(q.id, Y), s.success("引擎已更新")) : (await vr(Y), s.success("引擎已添加")), C(!1), oe();
    } catch (Se) {
      s.error(Se.message || "保存失败");
    } finally {
      B(!1);
    }
  }, [Y, q, oe]), Te = n(
    async (ee) => {
      try {
        await wr(ee), s.success("引擎已删除"), R(!1), oe();
      } catch (Se) {
        s.error(Se.message || "删除失败");
      }
    },
    [oe]
  ), Oe = n(async () => {
    k(!0);
    try {
      const ee = await Sr();
      S(ee.engines || []), s.success("自动检测完成");
    } catch (ee) {
      s.error(ee.message || "检测失败");
    } finally {
      k(!1);
    }
  }, []), be = n(
    (ee, Se, ye) => {
      const X = Y[Se] || "";
      return e.createElement(
        "div",
        { style: { marginBottom: 12 } },
        e.createElement(
          W,
          { style: { fontSize: 13, display: "block", marginBottom: 4 } },
          ee
        ),
        ye != null && ye.select ? e.createElement(E, {
          value: X || void 0,
          onChange: (de) => te((ge) => ({ ...ge, [Se]: de })),
          style: { width: "100%" },
          options: ye.select.options,
          allowClear: !0,
          placeholder: `选择${ee}`
        }) : ye != null && ye.textarea ? e.createElement(f.TextArea, {
          value: X,
          onChange: (de) => te((ge) => ({ ...ge, [Se]: de.target.value })),
          rows: 3,
          placeholder: `输入${ee}`
        }) : e.createElement(f, {
          value: X,
          onChange: (de) => te((ge) => ({ ...ge, [Se]: de.target.value })),
          placeholder: `输入${ee}`
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
      e.createElement(f, {
        placeholder: "搜索引擎名称、厂商...",
        prefix: O ? e.createElement(O) : void 0,
        value: V,
        onChange: (ee) => Q(ee.target.value),
        allowClear: !0,
        style: { maxWidth: 280 }
      }),
      e.createElement(
        c,
        {
          icon: _ ? e.createElement(_) : void 0,
          onClick: Oe,
          loading: M
        },
        "自动检测"
      ),
      e.createElement(
        c,
        {
          type: "primary",
          icon: D ? e.createElement(D) : void 0,
          onClick: le,
          style: je
        },
        "添加引擎"
      )
    ),
    // Content
    M ? e.createElement(
      "div",
      { style: { textAlign: "center", padding: 60 } },
      e.createElement(r, {
        size: "large",
        tip: "正在加载引擎..."
      })
    ) : pe.length === 0 ? e.createElement(o, {
      description: V ? "无匹配引擎" : "暂无引擎，点击「添加引擎」开始"
    }) : e.createElement(
      d,
      { gutter: [12, 12], align: "stretch" },
      ...pe.map(
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
          e.createElement(xr, {
            engine: ee,
            onClick: () => {
              ne(ee), R(!0);
            }
          })
        )
      )
    ),
    // Detail drawer
    y ? e.createElement(
      h,
      {
        title: e.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 8 } },
          e.createElement(
            "span",
            { style: { display: "flex", alignItems: "center" } },
            ha.has(y.id) ? e.createElement("img", {
              src: va(y.id),
              alt: y.name,
              style: { width: 20, height: 20, objectFit: "contain" }
            }) : e.createElement(
              "span",
              { style: { fontSize: 18 } },
              Ea[y.category] || "📦"
            )
          ),
          e.createElement("span", null, y.name)
        ),
        open: j,
        onClose: () => R(!1),
        width: 520,
        extra: e.createElement(
          z,
          null,
          e.createElement(
            c,
            {
              size: "small",
              icon: H ? e.createElement(H) : void 0,
              onClick: () => Ee(y)
            },
            "编辑"
          ),
          y.is_default ? null : e.createElement(
            $,
            {
              title: "确认删除此引擎？",
              description: y.name,
              onConfirm: () => Te(y.id),
              okText: "删除",
              cancelText: "取消",
              okButtonProps: { danger: !0 }
            },
            e.createElement(
              c,
              {
                size: "small",
                danger: !0,
                icon: L ? e.createElement(L) : void 0
              },
              "删除"
            )
          )
        )
      },
      e.createElement(
        w,
        { column: 1, bordered: !0, size: "small" },
        e.createElement(
          w.Item,
          { label: "引擎名称" },
          y.name
        ),
        e.createElement(
          w.Item,
          { label: "厂商" },
          y.vendor || "—"
        ),
        e.createElement(
          w.Item,
          { label: "分类" },
          y.category ? Yt[y.category] || y.category : "—"
        ),
        e.createElement(
          w.Item,
          { label: "状态" },
          e.createElement(
            m,
            {
              color: y.status === "detected" ? "success" : y.status === "not_found" ? "error" : "default"
            },
            y.status === "detected" ? "✅ 已检测" : y.status === "not_found" ? "❌ 路径无效" : "🔧 待配置"
          )
        ),
        e.createElement(
          w.Item,
          { label: "版本" },
          y.version || "—"
        ),
        y.executable_path ? e.createElement(
          w.Item,
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
              y.executable_path
            ),
            e.createElement(
              c,
              {
                size: "small",
                type: "text",
                icon: I ? e.createElement(I) : void 0,
                onClick: () => se(y.executable_path)
              }
            )
          )
        ) : null,
        y.install_dir ? e.createElement(
          w.Item,
          { label: "安装目录" },
          e.createElement(
            "code",
            { style: { fontSize: 12, wordBreak: "break-all" } },
            y.install_dir
          )
        ) : null,
        // Display detected modules with paths
        y.modules && y.modules.length > 0 ? e.createElement(
          w.Item,
          { label: "已检测模块" },
          e.createElement(
            "div",
            { style: { display: "flex", flexDirection: "column", gap: 4 } },
            ...y.modules.map(
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
                y.module_paths && y.module_paths[ee] ? e.createElement(
                  "code",
                  { style: { fontSize: 11, wordBreak: "break-all" } },
                  y.module_paths[ee]
                ) : null
              )
            )
          )
        ) : null,
        y.license_server ? e.createElement(
          w.Item,
          { label: "许可证服务器" },
          y.license_server
        ) : null,
        e.createElement(
          w.Item,
          { label: "描述" },
          y.description || "—"
        )
      ),
      // Invocation hint
      y.invocation_hint ? e.createElement(
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
          y.invocation_hint
        )
      ) : null,
      // Type badge
      e.createElement(
        "div",
        { style: { marginTop: 12 } },
        y.is_default ? e.createElement(
          m,
          { color: "blue" },
          "默认引擎"
        ) : y.is_custom ? e.createElement(
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
        title: q ? "编辑引擎" : "添加引擎",
        open: K,
        onOk: he,
        onCancel: () => C(!1),
        okText: q ? "保存" : "添加",
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
            options: Object.entries(Yt).map(([ee, Se]) => ({
              label: Se,
              value: ee
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
const Cr = Er, ba = /* @__PURE__ */ new Set(["tools", "engines", "skills"]);
function Tr(e) {
  try {
    const t = new URLSearchParams(window.location.search).get("tab");
    return t && ba.has(t) ? t : e;
  } catch {
    return e;
  }
}
function Kn(e) {
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
function Qt({ page: e }) {
  const t = P().React, { useEffect: l, useState: n } = t, { Alert: a, Spin: r } = P().antd, [o, c] = n(null), [s, d] = n("");
  if (l(() => {
    let h = !0;
    const w = P().loadBuiltinPage;
    return c(null), w ? (d(""), w(e).then((m) => {
      h && c(() => m);
    }).catch((m) => {
      h && d(
        m instanceof Error ? m.message : "加载原生管理页面失败"
      );
    }), () => {
      h = !1;
    }) : (d("当前 QwenPaw 版本不支持原生页面嵌入"), () => {
      h = !1;
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
function _r() {
  const e = P().React, { Tabs: t } = P().antd;
  return e.createElement(t, {
    defaultActiveKey: "mcp",
    items: [
      {
        key: "mcp",
        label: "MCP 接入",
        children: e.createElement(Qt, { page: "mcp" })
      },
      {
        key: "builtin",
        label: "平台内置",
        children: e.createElement(Qt, { page: "tools" })
      }
    ]
  });
}
function Ir() {
  const e = P().React, { Empty: t, Typography: l } = P().antd, { Paragraph: n } = l;
  return e.createElement(
    "div",
    { style: { padding: "36px 12px" } },
    e.createElement(t, {
      description: e.createElement(
        "div",
        null,
        e.createElement("div", null, "暂无已注册的领域计算引擎"),
        e.createElement(
          n,
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
function zr() {
  const e = P().React, { Tabs: t } = P().antd;
  return e.createElement(t, {
    defaultActiveKey: "simulation",
    items: [
      {
        key: "simulation",
        label: "仿真软件",
        children: e.createElement(kr)
      },
      {
        key: "domain",
        label: "领域计算",
        children: e.createElement(Ir)
      },
      {
        key: "runtime",
        label: "运行服务",
        children: e.createElement(Qt, { page: "acp" })
      }
    ]
  });
}
function wa({
  initialTab: e = "engines"
} = {}) {
  var g, f;
  const t = P().React, { useEffect: l, useState: n } = t, { Tabs: a, Tag: r } = P().antd, { RocketOutlined: o, ToolOutlined: c, ThunderboltOutlined: s } = P().antdIcons || {}, d = (f = (g = P()).useSelectedAgent) == null ? void 0 : f.call(g), u = (d == null ? void 0 : d.id) || "default", [h, w] = n(
    () => Tr(e)
  );
  l(() => {
    try {
      const E = new URLSearchParams(window.location.search).get("tab");
      E && !ba.has(E) && Kn(h);
    } catch {
    }
  }, [h]);
  const m = (E) => {
    w(E), Kn(E);
  }, p = (E, $) => t.createElement(
    "span",
    { style: { display: "inline-flex", alignItems: "center", gap: 6 } },
    $ ? t.createElement($, { style: { fontSize: 14 } }) : null,
    E
  );
  return t.createElement(
    "div",
    { style: { padding: 24 } },
    t.createElement(Bt, {
      title: "工具·技能",
      subtitle: "管理当前专家可调用的引擎、工具、运行服务与专业技能",
      extra: t.createElement(
        r,
        { color: "blue" },
        `当前专家：${u}`
      )
    }),
    t.createElement(a, {
      activeKey: h,
      onChange: (E) => m(E),
      items: [
        {
          key: "engines",
          label: p("引擎", o),
          children: t.createElement(zr)
        },
        {
          key: "tools",
          label: p("工具", c),
          children: t.createElement(_r)
        },
        {
          key: "skills",
          label: p("技能", s),
          children: t.createElement(Cr, {
            embedded: !0
          })
        }
      ]
    })
  );
}
const Sa = wa;
function Ar() {
  return P().React.createElement(Sa, {
    initialTab: "tools"
  });
}
function $r() {
  return P().React.createElement(Sa, {
    initialTab: "skills"
  });
}
const qn = {
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
function Pr(e) {
  if (!e.env) return !1;
  const t = Object.entries(e.env);
  return t.length === 0 ? !1 : t.some(([, l]) => typeof l == "string" && l.length > 0);
}
const zt = "ugsci.market.githubSources", Vn = "https://github.com/anthropics/skills/tree/main/skills", xa = "https://ugsci-awesome-tools.oss-cn-beijing.aliyuncs.com", Or = `${xa}/skills`;
function Mr(e) {
  const t = e.replace(/^\/+/, "");
  return Lt(`/plugins/oss-proxy?path=${encodeURIComponent(t)}`);
}
function Pt(e) {
  const t = e.replace(/^\/+/, "");
  return Je(`/plugins/oss-proxy?path=${encodeURIComponent(t)}`);
}
async function mn(e) {
  const t = e.replace(/^\/+/, ""), l = await Pt(t);
  if (!l.ok)
    throw new Error(`OSS fetch failed (${l.status}): ${t}`);
  return await l.json();
}
function lt(e) {
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
function Lr(e) {
  var a, r;
  const t = {};
  if (e.env && e.env.length > 0)
    for (const o of e.env)
      t[o] = `your-${o.toLowerCase().replace(/_/g, "-")}`;
  let l = "🔌";
  const n = (e.icon || "").toLowerCase();
  return n.includes("folder") ? l = "📁" : n.includes("git") ? l = "🌿" : n.includes("github") ? l = "🐙" : n.includes("database") || n.includes("postgres") || n.includes("sqlite") ? l = "🗄️" : n.includes("search") || n.includes("brave") ? l = "🔍" : n.includes("browser") || n.includes("puppeteer") ? l = "🎭" : n.includes("memory") || n.includes("brain") ? l = "🧠" : n.includes("file") || n.includes("fetch") ? l = "🌐" : n.includes("slack") ? l = "💬" : n.includes("google") ? l = "📁" : n.includes("notion") ? l = "📝" : n.includes("jupyter") ? l = "📊" : n.includes("science") || n.includes("flask") ? l = "🔬" : n.includes("book") || n.includes("arxiv") ? l = "📚" : n.includes("patent") && (l = "📜"), {
    id: e.id,
    name: e.name,
    emoji: l,
    iconUrl: e.icon_url ? Mr(e.icon_url) : void 0,
    category: e.category ? lt(e.category) : "",
    description: e.description,
    transport: e.transport || "stdio",
    command: ((a = e.config) == null ? void 0 : a.command) || "",
    args: ((r = e.config) == null ? void 0 : r.args) || [],
    env: Object.keys(t).length > 0 ? t : void 0
  };
}
const ka = "ugsci.market.mcpSources", Ca = "ugsci.market.expertSources";
function Ta(e, t) {
  try {
    const l = localStorage.getItem(e);
    if (!l) return [];
    const n = JSON.parse(l);
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
function _a(e, t) {
  try {
    localStorage.setItem(e, JSON.stringify(t));
  } catch {
  }
}
function Rr() {
  return Ta(ka, "mcp");
}
function xt(e) {
  _a(ka, e);
}
function Br() {
  return Ta(Ca, "expert");
}
function kt(e) {
  _a(Ca, e);
}
function Ia(e) {
  try {
    const t = new URL(e.trim()), l = t.hostname.toLowerCase();
    let n;
    if (l === "github.com" || l === "www.github.com")
      n = "github";
    else if (l === "gitee.com" || l === "www.gitee.com")
      n = "gitee";
    else
      return null;
    const a = t.pathname.split("/").filter((d) => d.length > 0);
    if (a.length < 2) return null;
    const r = decodeURIComponent(a[0]), o = decodeURIComponent(a[1]);
    let c = "main", s = "";
    return a.length >= 4 && (a[2] === "tree" || a[2] === "blob") ? (c = decodeURIComponent(a[3]), a.length > 4 && (s = a.slice(4).map(decodeURIComponent).join("/"))) : a.length > 2 && (s = a.slice(2).map(decodeURIComponent).join("/")), s = s.replace(/\/+$/, "").replace(/^\/+/, ""), {
      owner: r,
      repo: o,
      ref: c || "main",
      skillsPath: s,
      label: `${r}/${o}`,
      platform: n
    };
  } catch {
    return null;
  }
}
function za(e, t, l, n = "github") {
  return n === "oss" ? `oss:${e}/${l || "/"}` : `${n}:${e}/${t}:${l || "/"}`;
}
function Ur(e) {
  try {
    const t = new URL(e.trim()), l = t.hostname.toLowerCase(), n = l.match(
      /^([a-z0-9][a-z0-9-]{1,61}[a-z0-9])\.oss-([a-z0-9-]+)\.aliyuncs\.com$/
    );
    if (!n) return null;
    const a = n[1], r = `${t.protocol}//${l}`, o = decodeURIComponent(t.pathname).replace(/^\/+/, "").replace(/\/+$/, "");
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
function jr() {
  try {
    const e = localStorage.getItem(zt);
    if (!e) {
      const n = [], a = Ia(Vn);
      return a && n.push({
        id: za(
          a.owner,
          a.repo,
          a.skillsPath,
          a.platform
        ),
        url: Vn,
        label: a.label,
        owner: a.owner,
        repo: a.repo,
        ref: a.ref,
        skillsPath: a.skillsPath,
        enabled: !1,
        platform: a.platform
      }), localStorage.setItem(zt, JSON.stringify(n)), n;
    }
    const t = JSON.parse(e);
    if (!Array.isArray(t)) return [];
    const l = t.filter(
      (n) => n && typeof n.id == "string" && (typeof n.owner == "string" || n.platform === "oss") && !(n.platform === "oss" && n.url === Or)
    ).map((n) => ({
      ...n,
      platform: n.platform || "github",
      owner: n.owner || "",
      repo: n.repo || "",
      ref: n.ref || "",
      skillsPath: n.skillsPath || ""
    }));
    return l.length !== t.length && localStorage.setItem(
      zt,
      JSON.stringify(l)
    ), l;
  } catch {
    return [];
  }
}
function Ct(e) {
  try {
    localStorage.setItem(
      zt,
      JSON.stringify(e)
    );
  } catch {
  }
}
function Nr(e) {
  const t = e.match(/^---\s*\n([\s\S]*?)\n---/);
  if (!t) return {};
  const l = t[1], n = {}, a = l.split(`
`);
  let r = "";
  for (const o of a) {
    const c = o.match(/^(\w[\w-]*)\s*:\s*(.*)$/);
    if (c) {
      r = c[1];
      let s = c[2].trim();
      (s.startsWith('"') && s.endsWith('"') || s.startsWith("'") && s.endsWith("'")) && (s = s.slice(1, -1)), r === "name" ? n.name = s : r === "description" ? n.description = s : r === "version" ? n.version = s : r === "author" && (n.author = s);
    }
  }
  return n;
}
async function Dr(e) {
  const t = e.platform === "gitee", l = e.skillsPath ? encodeURIComponent(e.skillsPath).replace(/%2F/g, "/") : "", n = t ? `https://gitee.com/api/v5/repos/${e.owner}/${e.repo}/contents/${l}?ref=${encodeURIComponent(e.ref)}` : `https://api.github.com/repos/${e.owner}/${e.repo}/contents/${l}?ref=${encodeURIComponent(e.ref)}`, a = {
    Accept: t ? "application/json" : "application/vnd.github+json"
  };
  t && e.accessToken && (a.Authorization = `token ${e.accessToken}`);
  const r = await fetch(n, {
    headers: a
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
      const u = e.skillsPath ? e.skillsPath + "/" : "", h = t ? `https://gitee.com/${e.owner}/${e.repo}/raw/${e.ref}/${u}${d.name}/SKILL.md` : `https://raw.githubusercontent.com/${e.owner}/${e.repo}/${e.ref}/${u}${d.name}/SKILL.md`, w = t ? `https://gitee.com/${e.owner}/${e.repo}/tree/${e.ref}/${u}${d.name}` : `https://github.com/${e.owner}/${e.repo}/tree/${e.ref}/${u}${d.name}`, m = {
        sourceId: e.id,
        sourceLabel: e.label,
        name: d.name,
        description: "",
        source_url: w,
        html_url: w,
        version: null,
        author: null
      };
      try {
        const p = {};
        t && e.accessToken && (p.Authorization = `token ${e.accessToken}`);
        const g = await fetch(h, {
          headers: p
        });
        if (!g.ok) return m;
        const f = await g.text(), E = Nr(f);
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
async function Fr(e) {
  const t = Ur(e.url);
  if (!t)
    throw new Error(`Invalid OSS URL: ${e.url}`);
  const { endpoint: l, prefix: n } = t, a = n.split("/").map(encodeURIComponent).join("/"), r = await Pt(
    `${a}/manifest.json`
  );
  if (!r.ok)
    throw new Error(
      `无法获取技能列表: manifest.json (${r.status})`
    );
  const o = await r.json(), c = [];
  if (o && o.tag_groups && typeof o.tag_groups == "object")
    for (const [u, h] of Object.entries(o.tag_groups))
      Array.isArray(h) && c.push({
        id: u,
        label: lt(u),
        tags: h
      });
  const s = [];
  function d(u, h) {
    for (const w of u) {
      if (w.type === "collection" && Array.isArray(w.children)) {
        d(w.children, w.name);
        continue;
      }
      const m = w.path || w.name || "";
      if (!m) continue;
      const p = m.split("/").map(encodeURIComponent).join("/"), g = `${l}/${a}/${p}`;
      let f = null;
      if (w.metadata) {
        const $ = w.metadata.match(/version:\s*"?([\d.]+)"?/);
        $ && (f = $[1]);
      }
      const E = h ? `${e.label}/${h}` : e.label;
      s.push({
        sourceId: e.id,
        sourceLabel: e.label,
        sourcePath: E,
        name: w.name || m.split("/").pop() || m,
        description: w.description || "",
        source_url: g,
        html_url: g,
        version: f,
        author: null,
        tag: w.tag || void 0,
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
  return { skills: s, categories: c };
}
async function Gr() {
  const e = await mn("mcp/manifest.json"), t = [], l = {};
  if (e.tag_groups && typeof e.tag_groups == "object")
    for (const [a, r] of Object.entries(e.tag_groups))
      Array.isArray(r) && (l[a] = r, t.push({
        id: a,
        label: lt(a),
        tags: r
      }));
  return { servers: (e.servers || []).map((a) => {
    let r = "";
    const o = a.tags || [];
    for (const [c, s] of Object.entries(l))
      if (s.some((d) => o.includes(d))) {
        r = c;
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
      category: r
    };
  }), categories: t };
}
async function Hr() {
  const e = await mn("skills/manifest.json"), t = [], l = /* @__PURE__ */ new Set();
  function n(a, r) {
    for (const o of a) {
      if ((o == null ? void 0 : o.type) === "collection" && Array.isArray(o.children)) {
        n(o.children, o.name || r);
        continue;
      }
      const c = String((o == null ? void 0 : o.path) || (o == null ? void 0 : o.name) || "").trim();
      if (!c) continue;
      const s = c.split("/").map(encodeURIComponent).join("/"), d = `${xa}/skills/${s}`, u = typeof o.tag == "string" && o.tag.trim() ? o.tag.trim() : void 0;
      u && l.add(u);
      let h = null;
      if (typeof o.metadata == "string") {
        const w = o.metadata.match(/version:\s*"?([\d.]+)"?/);
        w && (h = w[1]);
      }
      t.push({
        sourceId: "oss:ugsci-official",
        sourceLabel: "UGSci",
        sourcePath: r ? `UGSci/${r}` : "UGSci",
        name: o.name || c.split("/").pop() || c,
        description: o.description || "",
        source_url: d,
        html_url: d,
        version: h,
        author: null,
        tag: u,
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
    categories: Array.from(l).map((a) => ({
      id: a,
      label: a
    }))
  };
}
async function Wr() {
  const e = await mn("agents/manifest.json"), t = [], l = {};
  if (e.tag_groups && typeof e.tag_groups == "object")
    for (const [a, r] of Object.entries(e.tag_groups))
      Array.isArray(r) && (l[a] = r, t.push({
        id: a,
        label: lt(a),
        tags: r
      }));
  return { agents: (e.agents || []).map((a) => {
    let r = "";
    const o = a.tags || [];
    for (const [c, s] of Object.entries(l))
      if (s.some((d) => o.includes(d))) {
        r = c;
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
      category: r
    };
  }), categories: t };
}
async function Jr(e) {
  const t = e.filter((o) => o.enabled), l = await Promise.all(
    t.map(async (o) => {
      try {
        if (o.platform === "oss") {
          const { skills: c, categories: s } = await Fr(o);
          return { skills: c, categories: s, error: null, label: o.label };
        } else
          return { skills: await Dr(o), categories: [], error: null, label: o.label };
      } catch (c) {
        return {
          skills: [],
          categories: [],
          error: c.message || String(c),
          label: o.label
        };
      }
    })
  ), n = [], a = [], r = [];
  for (const o of l)
    n.push(...o.skills), a.push(...o.categories), o.error && r.push({ label: o.label, message: o.error });
  return { skills: n, errors: r, categories: a };
}
function Kr({
  open: e,
  onClose: t,
  sources: l,
  onChange: n
}) {
  const a = P().React, { useState: r } = a, {
    Modal: o,
    Input: c,
    Button: s,
    List: d,
    Tag: u,
    Switch: h,
    Typography: w,
    Tooltip: m,
    message: p
  } = P().antd, {
    PlusOutlined: g,
    DeleteOutlined: f,
    LinkOutlined: E,
    GithubOutlined: $
  } = P().antdIcons || {}, { Text: z } = w, [_, O] = r(""), [D, H] = r(""), L = () => {
    const T = _.trim();
    if (!T) return;
    const x = Ia(T);
    if (!x) {
      p.error("无效的仓库 URL，请输入类似 https://github.com/owner/repo/tree/main/skills 或 https://gitee.com/owner/repo/tree/master/skills 的链接");
      return;
    }
    const S = za(x.owner, x.repo, x.skillsPath, x.platform);
    if (l.some((V) => V.id === S)) {
      p.warning("该源已存在");
      return;
    }
    const M = {
      id: S,
      url: T,
      label: x.label,
      owner: x.owner,
      repo: x.repo,
      ref: x.ref,
      skillsPath: x.skillsPath,
      enabled: !0,
      platform: x.platform,
      accessToken: D.trim() || void 0
    }, k = [...l, M];
    Ct(k), n(k), O(""), H(""), p.success(`已添加源: ${x.label}`);
  }, I = (T, x) => {
    const S = l.map(
      (M) => M.id === T ? { ...M, enabled: x } : M
    );
    Ct(S), n(S);
  }, G = (T, x) => {
    const S = l.map(
      (M) => M.id === T ? { ...M, accessToken: x.trim() || void 0 } : M
    );
    Ct(S), n(S);
  }, W = (T) => {
    const x = l.filter((S) => S.id !== T);
    Ct(x), n(x), p.success("已移除源");
  };
  return a.createElement(
    o,
    {
      open: e,
      onCancel: t,
      title: a.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 8 } },
        $ ? a.createElement($, { style: { fontSize: 18 } }) : null,
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
        z,
        { type: "secondary", style: { fontSize: 12, display: "block", marginBottom: 8 } },
        "添加 GitHub 或 Gitee 仓库作为技能源，系统将从该仓库的指定目录获取技能列表。支持格式："
      ),
      a.createElement(
        "div",
        { style: { display: "flex", gap: 8, alignItems: "center" } },
        a.createElement(c, {
          placeholder: "https://github.com/owner/repo/tree/main/skills 或 https://gitee.com/owner/repo/tree/master/skills",
          value: _,
          onChange: (T) => O(T.target.value),
          onPressEnter: L,
          prefix: E ? a.createElement(E) : void 0,
          style: { flex: 1 }
        }),
        a.createElement(
          s,
          {
            type: "primary",
            icon: g ? a.createElement(g) : void 0,
            onClick: L
          },
          "添加"
        )
      ),
      // Gitee token input (shown when URL looks like a Gitee link)
      _.trim() && _.trim().toLowerCase().includes("gitee.com") ? a.createElement(
        "div",
        { style: { marginTop: 8, display: "flex", gap: 8, alignItems: "center" } },
        a.createElement(
          z,
          { type: "secondary", style: { fontSize: 12, whiteSpace: "nowrap" } },
          "Gitee Token:"
        ),
        a.createElement(c.Password, {
          placeholder: "私有仓库请填写 Gitee 私人令牌（可选）",
          value: D,
          onChange: (T) => H(T.target.value),
          style: { flex: 1 }
        })
      ) : null
    ),
    a.createElement(
      "div",
      { style: { marginBottom: 8, display: "flex", alignItems: "center", justifyContent: "space-between" } },
      a.createElement(z, { strong: !0 }, `已配置源 (${l.length})`)
    ),
    a.createElement(d, {
      size: "small",
      bordered: !0,
      dataSource: l,
      renderItem: (T) => a.createElement(
        d.Item,
        {
          actions: [
            a.createElement(
              m,
              { title: T.enabled ? "点击禁用" : "点击启用" },
              a.createElement(h, {
                size: "small",
                checked: T.enabled,
                onChange: (x) => I(T.id, x)
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
                  icon: f ? a.createElement(f) : void 0,
                  onClick: () => W(T.id)
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
              { color: T.platform === "gitee" ? "orange" : T.platform === "oss" ? "green" : "blue", style: { fontSize: 11 } },
              T.platform === "gitee" ? "Gitee" : T.platform === "oss" ? "OSS" : "GitHub"
            ),
            a.createElement(
              u,
              { style: { fontSize: 11 } },
              T.label
            ),
            T.skillsPath ? a.createElement(
              z,
              { type: "secondary", style: { fontSize: 11 } },
              `/${T.skillsPath}`
            ) : null,
            T.platform !== "oss" ? a.createElement(
              z,
              { type: "secondary", style: { fontSize: 11 } },
              `@${T.ref}`
            ) : null
          ),
          a.createElement(
            z,
            {
              type: "secondary",
              style: { fontSize: 11, wordBreak: "break-all" }
            },
            T.url
          ),
          // Gitee token input for existing Gitee sources
          T.platform === "gitee" ? a.createElement(
            "div",
            { style: { marginTop: 6, display: "flex", gap: 6, alignItems: "center" } },
            a.createElement(
              z,
              { type: "secondary", style: { fontSize: 11, whiteSpace: "nowrap" } },
              "Token:"
            ),
            a.createElement(c.Password, {
              size: "small",
              placeholder: "Gitee 私人令牌（可选，用于私有仓库）",
              value: T.accessToken || "",
              onChange: (x) => G(T.id, x.target.value),
              style: { flex: 1 }
            })
          ) : null
        )
      )
    })
  );
}
function Xn({
  open: e,
  onClose: t,
  sources: l,
  onChange: n,
  type: a
}) {
  const r = P().React, { useState: o } = r, {
    Modal: c,
    Input: s,
    Button: d,
    List: u,
    Tag: h,
    Switch: w,
    Typography: m,
    Tooltip: p,
    message: g
  } = P().antd, {
    PlusOutlined: f,
    DeleteOutlined: E,
    LinkOutlined: $,
    ApiOutlined: z,
    UserOutlined: _,
    ImportOutlined: O,
    ExportOutlined: D,
    CopyOutlined: H
  } = P().antdIcons || {}, { Text: L } = m, [I, G] = o(""), [W, T] = o(""), [x, S] = o(""), [M, k] = o(!1), V = a === "mcp" ? "MCP" : "专家模板", Q = a === "mcp" ? z ? r.createElement(z, { style: { fontSize: 18 } }) : null : _ ? r.createElement(_, { style: { fontSize: 18 } }) : null, j = () => {
    const C = I.trim(), q = W.trim();
    if (!C) return;
    const re = q || C.slice(0, 40), Y = `${a}:${C}`;
    if (l.some((B) => B.id === Y)) {
      g.warning("该源已存在");
      return;
    }
    const te = {
      id: Y,
      label: re,
      url: C,
      enabled: !0,
      type: a
    }, fe = [...l, te];
    a === "mcp" ? xt(fe) : kt(fe), n(fe), G(""), T(""), g.success(`已添加${V}源: ${re}`);
  }, R = (C, q) => {
    const re = l.map(
      (Y) => Y.id === C ? { ...Y, enabled: q } : Y
    );
    a === "mcp" ? xt(re) : kt(re), n(re);
  }, y = (C) => {
    const q = l.filter((re) => re.id !== C);
    a === "mcp" ? xt(q) : kt(q), n(q), g.success("已移除源");
  }, ne = () => {
    const C = JSON.stringify(
      { type: a, sources: l },
      null,
      2
    );
    try {
      navigator.clipboard.writeText(C), g.success(`${V}源已复制到剪贴板（${l.length} 个源）`);
    } catch {
      const q = document.createElement("textarea");
      q.value = C, document.body.appendChild(q), q.select(), document.execCommand("copy"), document.body.removeChild(q), g.success(`${V}源已复制到剪贴板（${l.length} 个源）`);
    }
  }, K = () => {
    const C = x.trim();
    if (!C) {
      g.warning("请粘贴 JSON 内容");
      return;
    }
    try {
      const q = JSON.parse(C);
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
        g.error("未找到有效的源数据");
        return;
      }
      const te = new Set(l.map((oe) => oe.id)), fe = [];
      for (const oe of Y) {
        const pe = oe.id || `${a}:${oe.url}`;
        te.has(pe) || fe.push({
          id: pe,
          label: oe.label,
          url: oe.url,
          enabled: oe.enabled !== !1,
          type: a
        });
      }
      if (fe.length === 0) {
        g.info("所有源均已存在，无新增");
        return;
      }
      const B = [...l, ...fe];
      a === "mcp" ? xt(B) : kt(B), n(B), S(""), k(!1), g.success(`成功导入 ${fe.length} 个${V}源`);
    } catch (q) {
      g.error(`JSON 解析失败: ${q.message || "格式错误"}`);
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
        Q,
        r.createElement("span", null, `配置${V}源`)
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
              icon: D ? r.createElement(D) : void 0,
              onClick: ne,
              disabled: l.length === 0,
              size: "small"
            },
            "导出到剪贴板"
          ),
          r.createElement(
            d,
            {
              icon: O ? r.createElement(O) : void 0,
              onClick: () => k(!M),
              size: "small"
            },
            M ? "隐藏导入" : "导入JSON"
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
      L,
      { type: "secondary", style: { fontSize: 12, display: "block", marginBottom: 12 } },
      `配置${V}源地址，支持从远程仓库或团队共享的 JSON 导入${V}配置。`
    ),
    // Import section (collapsible)
    M ? r.createElement(
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
        L,
        { strong: !0, style: { fontSize: 12, display: "block", marginBottom: 8 } },
        `粘贴${V}源 JSON（支持从导出的剪贴板内容粘贴）`
      ),
      r.createElement(s.TextArea, {
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
        onChange: (C) => S(C.target.value),
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
            onClick: K
          },
          "导入"
        ),
        r.createElement(
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
    r.createElement(
      "div",
      { style: { marginBottom: 16, display: "flex", gap: 8, alignItems: "center" } },
      r.createElement(s, {
        placeholder: "源名称（可选，如：团队MCP仓库）",
        value: W,
        onChange: (C) => T(C.target.value),
        style: { width: 200 }
      }),
      r.createElement(s, {
        placeholder: a === "mcp" ? "https://raw.githubusercontent.com/team/mcp-registry/main/mcp.json" : "https://raw.githubusercontent.com/team/expert-registry/main/experts.json",
        value: I,
        onChange: (C) => G(C.target.value),
        onPressEnter: j,
        prefix: $ ? r.createElement($) : void 0,
        style: { flex: 1 }
      }),
      r.createElement(
        d,
        {
          type: "primary",
          icon: f ? r.createElement(f) : void 0,
          onClick: j
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
        L,
        { strong: !0 },
        `已配置源 (${l.length})`
      )
    ),
    r.createElement(u, {
      size: "small",
      bordered: !0,
      dataSource: l,
      renderItem: (C) => r.createElement(
        u.Item,
        {
          actions: [
            r.createElement(
              p,
              { title: C.enabled ? "点击禁用" : "点击启用" },
              r.createElement(w, {
                size: "small",
                checked: C.enabled,
                onChange: (q) => R(C.id, q)
              })
            ),
            r.createElement(
              p,
              { title: "移除此源" },
              r.createElement(
                d,
                {
                  size: "small",
                  type: "text",
                  danger: !0,
                  icon: E ? r.createElement(E) : void 0,
                  onClick: () => y(C.id)
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
              h,
              {
                color: a === "mcp" ? "purple" : "blue",
                style: { fontSize: 11 }
              },
              C.label
            ),
            C.enabled ? null : r.createElement(
              h,
              { style: { fontSize: 10 } },
              "已禁用"
            )
          ),
          r.createElement(
            L,
            {
              type: "secondary",
              style: { fontSize: 11, wordBreak: "break-all" }
            },
            C.url
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
async function qr() {
  return ie("/market/providers");
}
async function Vr(e) {
  return ie(
    `/market/categories?lang=${encodeURIComponent(e)}`
  );
}
async function Xr(e, t, l, n, a) {
  return ie("/market/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: e,
      provider_pages: t,
      limit: l,
      lang: n,
      category: a || void 0
    })
  });
}
function Yn(e) {
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
async function Qn(e, t) {
  const l = { bundle_url: e };
  return t && (l.access_token = t), ie("/skills/pool/import", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(l)
  });
}
function Yr() {
  const e = P().React, { useState: t, useEffect: l, useCallback: n, useMemo: a, useRef: r } = e, {
    Spin: o,
    Empty: c,
    Input: s,
    Button: d,
    message: u,
    Row: h,
    Col: w,
    Card: m,
    Tag: p,
    Tooltip: g,
    Typography: f,
    Select: E,
    Drawer: $,
    Descriptions: z,
    Tabs: _,
    Badge: O,
    Progress: D,
    Modal: H,
    Alert: L
  } = P().antd, {
    ReloadOutlined: I,
    SearchOutlined: G,
    DownloadOutlined: W,
    AppstoreOutlined: T,
    ShopOutlined: x,
    CheckCircleOutlined: S,
    LoadingOutlined: M,
    UserOutlined: k,
    UserAddOutlined: V,
    SettingOutlined: Q,
    GithubOutlined: j,
    ApiOutlined: R
  } = P().antdIcons || {}, { Text: y, Paragraph: ne, Title: K } = f, [C, q] = t("skills"), [re, Y] = t([]), [te, fe] = t([]), [B, oe] = t([]), [pe, se] = t(""), [le, Ee] = t(""), [he, Te] = t(!1), [Oe, be] = t(!1), [ee, Se] = t(
    {}
  ), [ye, X] = t(null), [de, ge] = t({}), [J, b] = t([]), [me, F] = t(""), [v, ae] = t(""), [ce, ze] = t(""), [_e, Re] = t({}), [Be, De] = t(""), [Fe, Ue] = t(/* @__PURE__ */ new Set()), [ke, Le] = t(null), [Z, Ae] = t({}), [$e, Me] = t([]), [He, We] = t([]), [Ie, yt] = t([]), [Dt, ot] = t(""), [Ke, Et] = t(!1), [Ra, un] = t(!1), [Ba, pn] = t([]), [Ua, gn] = t(!1), [ja, fn] = t([]), [Na, yn] = t(!1), [En, hn] = t([]), [vn, bn] = t([]), [wn, Sn] = t(!1), [Qe, xn] = t(""), [kn, Cn] = t([]), [Tn, _n] = t([]), [In, zn] = t(!1), [Ze, An] = t(""), [Ft, $n] = t(!1), [Ne, ht] = t(null), [st, Da] = t([]), it = r(null);
  l(() => {
    Promise.all([
      qr().catch(() => []),
      Vr("zh").catch(() => []),
      Ut().catch(() => [])
    ]).then(([i, U, N]) => {
      Y(i), fe(U), b(N), N.length > 0 && (F(N[0].id), De(N[0].id));
    });
  }, []);
  const vt = n(async (i) => {
    const U = i ?? jr();
    if (Me(i || U), U.filter((ue) => ue.enabled).length === 0) {
      We([]);
      return;
    }
    Et(!0);
    try {
      const { skills: ue, errors: ve, categories: Pe } = await Jr(U);
      if (We(ue), Da(Pe), ve.length > 0) {
        for (const Ce of ve)
          console.warn(`[ugsci] GitHub source '${Ce.label}' error: ${Ce.message}`);
        u.warning(
          `部分源加载失败: ${ve.map((Ce) => Ce.label).join(", ")}`
        );
      }
    } catch (ue) {
      u.error(ue.message || "加载技能源失败"), We([]);
    } finally {
      Et(!1);
    }
  }, []), Gt = n(async () => {
    var ue, ve, Pe;
    Sn(!0), zn(!0), Et(!0);
    const [i, U, N] = await Promise.allSettled([
      Gr(),
      Wr(),
      Hr()
    ]);
    if (i.status === "fulfilled" ? (hn(i.value.servers), bn(i.value.categories)) : (console.warn(`[ugsci] MCP manifest error: ${((ue = i.reason) == null ? void 0 : ue.message) || i.reason}`), hn([]), bn([])), Sn(!1), U.status === "fulfilled" ? (Cn(U.value.agents), _n(U.value.categories)) : (console.warn(`[ugsci] Agents manifest error: ${((ve = U.reason) == null ? void 0 : ve.message) || U.reason}`), Cn([]), _n([])), zn(!1), N.status === "fulfilled")
      yt(N.value.skills), ot("");
    else {
      const Ce = ((Pe = N.reason) == null ? void 0 : Pe.message) || String(N.reason);
      console.warn(`[ugsci] Skills manifest error: ${Ce}`), yt([]), ot(Ce);
    }
    Et(!1);
  }, []);
  l(() => {
    vt(), Gt(), pn(Rr()), fn(Br());
  }, [vt, Gt]);
  const bt = n(
    async (i, U, N) => {
      Te(!0);
      try {
        const ue = await Xr(
          i,
          N,
          20,
          "zh",
          U || void 0
        );
        N === void 0 || Object.keys(N).length === 0 ? oe(ue.results) : oe((Ce) => [...Ce, ...ue.results]);
        const ve = Object.values(ue.by_provider || {}).some(
          (Ce) => Ce.has_more
        );
        be(ve);
        const Pe = {};
        for (const [Ce, qe] of Object.entries(ue.by_provider || {}))
          Pe[Ce] = (N[Ce] || 1) + 1;
        if (Se(Pe), ue.errors.length > 0)
          for (const Ce of ue.errors)
            console.warn(
              `[ugsci] Market provider '${Ce.provider}' error: ${Ce.message}`
            );
      } catch (ue) {
        u.error(ue.message || "搜索市场失败"), oe([]);
      } finally {
        Te(!1);
      }
    },
    []
  );
  l(() => (it.current && clearTimeout(it.current), it.current = setTimeout(() => {
    bt(pe, le, {});
  }, 400), () => {
    it.current && clearTimeout(it.current);
  }), [pe, le, bt]);
  const Fa = () => {
    bt(pe, le, ee);
  }, Pn = async (i) => {
    const U = `${i.source}:${i.slug}`;
    try {
      ge((ue) => ({ ...ue, [U]: "installing" }));
      const N = await Qn(i.source_url);
      N.installed && u.success(
        `技能「${N.name || i.name}」已安装到技能池，可在技能中心查看`
      ), ge((ue) => {
        const ve = { ...ue };
        return delete ve[U], ve;
      });
    } catch (N) {
      u.error(Yn(N) || "安装技能失败"), ge((ue) => {
        const ve = { ...ue };
        return delete ve[U], ve;
      });
    }
  }, Ga = (i) => {
    window.history.pushState({}, "", i), window.dispatchEvent(new PopStateEvent("popstate"));
  }, Ha = async (i) => {
    const U = `github:${i.sourceId}:${i.name}`, N = $e.find((ve) => ve.id === i.sourceId), ue = (N == null ? void 0 : N.accessToken) || void 0;
    try {
      ge((Pe) => ({ ...Pe, [U]: "installing" }));
      const ve = await Qn(i.source_url, ue);
      ve.installed && u.success(
        `技能「${ve.name || i.name}」已安装到技能池，可在技能中心查看`
      ), ge((Pe) => {
        const Ce = { ...Pe };
        return delete Ce[U], Ce;
      });
    } catch (ve) {
      u.error(Yn(ve) || "安装技能失败"), ge((Pe) => {
        const Ce = { ...Pe };
        return delete Ce[U], Ce;
      });
    }
  }, Ye = a(() => {
    const i = [], U = /* @__PURE__ */ new Set();
    for (const N of [...Ie, ...He]) {
      const ue = N.source_url || `${N.sourceLabel}:${N.name}`;
      U.has(ue) || (U.add(ue), i.push(N));
    }
    return i;
  }, [Ie, He]), On = a(() => {
    const i = [], U = /* @__PURE__ */ new Set();
    if (st.length > 0)
      for (const N of st)
        U.has(N.id) || (U.add(N.id), i.push(N));
    for (const N of Ye)
      N.tag && !U.has(N.tag) && (U.add(N.tag), i.push({ id: N.tag, label: N.tag }));
    for (const N of Ye)
      !N.isOfficial && N.sourceLabel && !U.has(N.sourceLabel) && (U.add(N.sourceLabel), i.push({ id: N.sourceLabel, label: N.sourceLabel }));
    return i;
  }, [Ye, st]), Ht = a(() => {
    let i = Ye;
    if (le) {
      const U = st.find((N) => N.id === le);
      U && U.tags ? i = i.filter(
        (N) => N.tag && U.tags.includes(N.tag) || N.sourceLabel === le
      ) : i = i.filter(
        (N) => N.tag === le || N.sourceLabel === le
      );
    }
    if (pe.trim()) {
      const U = pe.toLowerCase();
      i = i.filter(
        (N) => {
          var ue;
          return N.name.toLowerCase().includes(U) || ((ue = N.description) == null ? void 0 : ue.toLowerCase().includes(U));
        }
      );
    }
    return i;
  }, [Ye, pe, le, st]), Mn = re.filter((i) => i.available), et = a(() => le ? B.filter((i) => {
    const U = Mn.find((N) => N.key === i.source);
    return (U == null ? void 0 : U.label) === le;
  }) : B, [B, le, Mn]), Wa = e.createElement(
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
        prefix: G ? e.createElement(G) : void 0,
        value: pe,
        onChange: (i) => se(i.target.value),
        allowClear: !0,
        style: { flex: 1, minWidth: 200, maxWidth: 400 }
      }),
      // Pool install info
      e.createElement(
        y,
        { type: "secondary", style: { fontSize: 12 } },
        "安装后进入技能池"
      ),
      // Configure skill source button
      e.createElement(
        d,
        {
          icon: j ? e.createElement(j) : void 0,
          onClick: () => un(!0),
          size: "small"
        },
        "配置技能源"
      )
    ),
    // Dynamic category filter tags (from OSS manifest tags + imported sources)
    Dt && Ye.length === 0 ? e.createElement(L, {
      type: "warning",
      showIcon: !0,
      message: "UGSci 官方 OSS 技能库加载失败",
      description: "请检查网络或后端 OSS 代理服务，然后点击右上角“刷新”重试。",
      style: { marginBottom: 12 }
    }) : null,
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
        y,
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
          color: le === "" ? "blue" : void 0,
          onClick: () => Ee("")
        },
        "全部"
      ),
      ...On.map((i) => {
        const U = He.some(
          (N) => !N.isOfficial && N.sourceLabel === i.id
        );
        return e.createElement(
          p,
          {
            key: i.id,
            style: {
              fontSize: 11,
              cursor: "pointer",
              borderRadius: 12
            },
            color: le === i.id ? U ? "blue" : "geekblue" : void 0,
            icon: U && j ? e.createElement(j) : void 0,
            onClick: () => Ee(
              le === i.id ? "" : i.id
            )
          },
          i.label
        );
      })
    ) : null,
    // GitHub skills section
    Ke && Ye.length === 0 ? e.createElement(
      "div",
      { style: { textAlign: "center", padding: 40, marginBottom: 16 } },
      e.createElement(o, { size: "large" }, e.createElement("div", { style: { minHeight: 60, display: "flex", alignItems: "center", justifyContent: "center" } }, "正在加载技能..."))
    ) : Ht.length > 0 ? e.createElement(
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
          y,
          { strong: !0, style: { fontSize: 13 } },
          `技能市场 (${Ht.length})`
        )
      ),
      e.createElement(
        h,
        { gutter: [12, 12] },
        ...Ht.map((i) => {
          const U = `github:${i.sourceId}:${i.name}`, N = de[U];
          return e.createElement(
            w,
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
                j ? e.createElement(j, {
                  style: { fontSize: 18, color: "var(--ant-color-text-secondary, #57606a)" }
                }) : e.createElement(
                  "span",
                  { style: { fontSize: 18 } },
                  "📦"
                ),
                e.createElement(
                  g,
                  { title: i.name },
                  e.createElement(
                    y,
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
                ne,
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
                    R ? e.createElement(R, { style: { fontSize: 10 } }) : null,
                    i.sourcePath || i.sourceLabel
                  ) : null,
                  // Show tag as category badge
                  i.tag ? e.createElement(
                    p,
                    { color: "geekblue", style: { fontSize: 10 } },
                    i.tag
                  ) : null,
                  i.version ? e.createElement(
                    p,
                    { style: { fontSize: 10 } },
                    `v${i.version}`
                  ) : null
                ),
                N ? e.createElement(
                  d,
                  {
                    size: "small",
                    disabled: !0,
                    icon: M ? e.createElement(M) : void 0
                  },
                  "安装中"
                ) : e.createElement(
                  d,
                  {
                    type: "primary",
                    size: "small",
                    icon: W ? e.createElement(W) : void 0,
                    onClick: () => Ha(i)
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
    et.length > 0 || he ? e.createElement(
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
        y,
        { strong: !0, style: { fontSize: 13 } },
        `技能市场${et.length > 0 ? ` (${et.length})` : ""}`
      )
    ) : null,
    // Results grid
    he && et.length === 0 ? e.createElement(
      "div",
      { style: { textAlign: "center", padding: 60 } },
      e.createElement(o, { size: "large" })
    ) : et.length === 0 ? e.createElement(c, {
      description: pe ? `未找到匹配「${pe}」的技能` : "输入关键词搜索技能市场",
      image: c.PRESENTED_IMAGE_SIMPLE
    }) : e.createElement(
      h,
      { gutter: [12, 12] },
      ...et.map((i) => {
        const U = `${i.source}:${i.slug}`, N = de[U];
        return e.createElement(
          w,
          { key: U, xs: 24, sm: 12, md: 8, lg: 6 },
          e.createElement(
            m,
            {
              hoverable: !0,
              size: "small",
              style: { height: "100%", cursor: "pointer" },
              onClick: () => X(i)
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
                g,
                { title: i.name },
                e.createElement(
                  y,
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
              ne,
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
                  p,
                  { color: "geekblue", style: { fontSize: 10 } },
                  i.source
                ),
                i.version ? e.createElement(
                  p,
                  { style: { fontSize: 10 } },
                  `v${i.version}`
                ) : null
              ),
              N ? e.createElement(
                d,
                {
                  size: "small",
                  disabled: !0,
                  icon: M ? e.createElement(M) : void 0
                },
                "安装中"
              ) : e.createElement(
                d,
                {
                  type: "primary",
                  size: "small",
                  icon: W ? e.createElement(W) : void 0,
                  onClick: (ue) => {
                    ue.stopPropagation(), Pn(i);
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
    Oe && !he ? e.createElement(
      "div",
      { style: { textAlign: "center", marginTop: 16 } },
      e.createElement(
        d,
        { onClick: Fa, loading: he },
        "加载更多"
      )
    ) : null,
    // Detail Drawer
    ye ? e.createElement(
      $,
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
        onClose: () => X(null),
        width: 480,
        extra: e.createElement(
          d,
          {
            type: "primary",
            icon: W ? e.createElement(W) : void 0,
            onClick: () => {
              Pn(ye);
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
          y,
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
            ([i, U]) => e.createElement(
              "div",
              { key: i, style: { textAlign: "center" } },
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
                y,
                { type: "secondary", style: { fontSize: 11 } },
                i
              )
            )
          )
        )
      ) : null
    ) : null
  ), Wt = a(() => {
    let i = kn;
    if (Ze && (i = i.filter((U) => U.category === Ze)), v.trim()) {
      const U = v.toLowerCase();
      i = i.filter(
        (N) => N.name.toLowerCase().includes(U) || N.description.toLowerCase().includes(U) || N.tags.some((ue) => ue.toLowerCase().includes(U))
      );
    }
    return i;
  }, [kn, v, Ze]), Ja = async (i) => {
    if (!Ft) {
      $n(!0);
      try {
        let U = i.description;
        if (i.instructions)
          try {
            const ve = i.instructions.replace(/^\/+/, ""), Pe = await Pt(ve);
            Pe.ok && (U = await Pe.text());
          } catch {
          }
        let N = [];
        if (i.skills_manifest)
          try {
            const ve = i.skills_manifest.replace(/^\/+/, ""), Pe = await Pt(ve);
            if (Pe.ok) {
              const Ce = await Pe.json();
              Array.isArray(Ce) ? N = Ce.map((qe) => typeof qe == "string" ? qe : qe.name).filter(Boolean) : Ce.skills && (N = Ce.skills.map((qe) => typeof qe == "string" ? qe : qe.name).filter(Boolean));
            }
          } catch {
          }
        const ue = await ie("/agents", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: i.name,
            description: i.description,
            skill_names: N
          })
        });
        await $t(ue.id, "AGENTS.md", U), u.success(`专家「${i.name}」创建成功，已跳转至专家`), Ga("/ugsci-experts");
      } catch (U) {
        u.error(U.message || "创建专家失败");
      } finally {
        $n(!1);
      }
    }
  }, Ln = n(async (i) => {
    if (i)
      try {
        const U = await rn(i);
        Ue(new Set(U.map((N) => N.key)));
      } catch {
        Ue(/* @__PURE__ */ new Set());
      }
  }, []);
  l(() => {
    Be && Ln(Be);
  }, [Be, Ln]);
  const Ka = async (i) => {
    if (!Be) {
      u.warning("请先选择目标专家");
      return;
    }
    if (Pr(i)) {
      const U = Object.entries(i.env), N = {};
      for (const [ue] of U)
        N[ue] = "";
      Ae(N), Le(i);
      return;
    }
    await Rn(i, i.env || {});
  }, Rn = async (i, U) => {
    Re((N) => ({ ...N, [i.id]: !0 }));
    try {
      const N = i.id;
      await on(Be, {
        client_key: N,
        client: {
          name: i.name,
          description: i.description,
          enabled: !0,
          transport: i.transport,
          url: i.url || "",
          command: i.command || "",
          args: i.args || [],
          env: U,
          cwd: i.cwd || "",
          headers: i.headers || {}
        }
      }), u.success(`MCP「${i.name}」已添加到当前专家`), Ue((ue) => new Set(ue).add(N));
    } catch (N) {
      u.error(N.message || `添加 MCP「${i.name}」失败`);
    } finally {
      Re((N) => ({ ...N, [i.id]: !1 }));
    }
  }, qa = async () => {
    if (!ke) return;
    const i = [];
    for (const [N, ue] of Object.entries(Z))
      if (!ue || !ue.trim()) {
        const ve = qn[N];
        i.push((ve == null ? void 0 : ve.label) || N);
      }
    if (i.length > 0) {
      u.warning(`请填写以下配置项: ${i.join(", ")}`);
      return;
    }
    const U = ke;
    Le(null), Ae({}), await Rn(U, { ...Z });
  }, Jt = a(() => {
    let i = En;
    if (Qe && (i = i.filter((U) => U.category === Qe)), ce.trim()) {
      const U = ce.toLowerCase();
      i = i.filter(
        (N) => N.name.toLowerCase().includes(U) || N.description.toLowerCase().includes(U) || N.tags.some((ue) => ue.toLowerCase().includes(U))
      );
    }
    return i.map(Lr);
  }, [En, ce, Qe]), Va = e.createElement(
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
        prefix: G ? e.createElement(G) : void 0,
        value: ce,
        onChange: (i) => ze(i.target.value),
        allowClear: !0,
        style: { maxWidth: 300 }
      }),
      e.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        e.createElement(
          y,
          { type: "secondary", style: { fontSize: 12, whiteSpace: "nowrap" } },
          "安装到："
        ),
        e.createElement(E, {
          value: Be,
          onChange: (i) => De(i),
          style: { minWidth: 180 },
          size: "small",
          options: J.map((i) => ({ value: i.id, label: i.name }))
        })
      ),
      // Configure MCP source button
      e.createElement(
        d,
        {
          icon: R ? e.createElement(R) : void 0,
          onClick: () => gn(!0),
          size: "small"
        },
        "配置 MCP 源"
      )
    ),
    // Dynamic category tag row (from OSS manifest tag_groups)
    vn.length > 0 ? e.createElement(
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
        y,
        { type: "secondary", style: { fontSize: 12, marginRight: 4 } },
        "分类:"
      ),
      e.createElement(
        p,
        {
          style: { fontSize: 11, cursor: "pointer", borderRadius: 12 },
          color: Qe === "" ? "blue" : void 0,
          onClick: () => xn("")
        },
        "全部"
      ),
      ...vn.map(
        (i) => e.createElement(
          p,
          {
            key: i.id,
            style: { fontSize: 11, cursor: "pointer", borderRadius: 12 },
            color: Qe === i.id ? "geekblue" : void 0,
            onClick: () => xn(
              Qe === i.id ? "" : i.id
            )
          },
          i.label
        )
      )
    ) : null,
    // MCP server cards (dynamic from OSS)
    wn && Jt.length === 0 ? e.createElement(
      "div",
      { style: { textAlign: "center", padding: 40 } },
      e.createElement(o, { size: "large" }, e.createElement("div", { style: { minHeight: 60, display: "flex", alignItems: "center", justifyContent: "center" } }, "正在加载 MCP 服务器..."))
    ) : Jt.length === 0 ? e.createElement(c, {
      description: "未找到匹配的 MCP 服务器",
      image: c.PRESENTED_IMAGE_SIMPLE
    }) : e.createElement(
      h,
      { gutter: [12, 12] },
      ...Jt.map(
        (i) => e.createElement(
          w,
          { key: i.id, xs: 24, sm: 12, md: 8 },
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
                i.iconUrl ? e.createElement("img", {
                  src: i.iconUrl,
                  alt: i.name,
                  style: { width: 28, height: 28, objectFit: "contain" },
                  onError: (U) => {
                    U.target.style.display = "none";
                  }
                }) : i.emoji
              ),
              e.createElement(
                "div",
                { style: { flex: 1 } },
                e.createElement(
                  y,
                  { strong: !0, style: { fontSize: 14 } },
                  i.name
                ),
                e.createElement(
                  "div",
                  { style: { display: "flex", gap: 4, marginTop: 4, flexWrap: "wrap" } },
                  e.createElement(
                    p,
                    { color: "blue", style: { fontSize: 10 } },
                    i.category
                  ),
                  e.createElement(
                    p,
                    {
                      color: i.transport === "stdio" ? "purple" : "cyan",
                      style: { fontSize: 10 }
                    },
                    i.transport
                  ),
                  i.env && Object.keys(i.env).length > 0 ? e.createElement(
                    p,
                    { color: "orange", style: { fontSize: 10 } },
                    "需配置密钥"
                  ) : null
                )
              )
            ),
            // Description
            e.createElement(
              ne,
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
                  borderTop: "1px solid #f0f0f0",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center"
                }
              },
              e.createElement(
                y,
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
                  loading: !!_e[i.id],
                  icon: R ? e.createElement(R) : void 0,
                  onClick: () => Ka(i)
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
        y,
        { type: "secondary", style: { fontSize: 12 } },
        "MCP 服务器列表来自 UGSci 官方源，自动同步更新"
      )
    )
  ), Xa = ke ? e.createElement(
    H,
    {
      title: e.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 8 } },
        e.createElement("span", { style: { fontSize: 20, display: "inline-flex", alignItems: "center", justifyContent: "center", width: 24, height: 24 } }, ke.iconUrl ? e.createElement("img", { src: ke.iconUrl, alt: ke.name, style: { width: 22, height: 22, objectFit: "contain" }, onError: (i) => {
          i.target.style.display = "none";
        } }) : ke.emoji),
        e.createElement("span", null, `配置 ${ke.name} 密钥`)
      ),
      open: !!ke,
      onCancel: () => {
        Le(null), Ae({});
      },
      onOk: qa,
      okText: "安装",
      cancelText: "取消",
      width: 520,
      destroyOnClose: !0
    },
    // Description
    e.createElement(
      y,
      { type: "secondary", style: { display: "block", marginBottom: 16, fontSize: 12 } },
      ke.description
    ),
    ...Object.entries(ke.env || {}).map(([i]) => {
      const U = qn[i], N = (U == null ? void 0 : U.isSecret) !== !1;
      return e.createElement(
        "div",
        { key: i, style: { marginBottom: 16 } },
        e.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 6, marginBottom: 4 } },
          e.createElement(
            y,
            { strong: !0, style: { fontSize: 13 } },
            (U == null ? void 0 : U.label) || i
          ),
          e.createElement(
            p,
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
        N ? e.createElement(s.Password, {
          placeholder: `请输入 ${(U == null ? void 0 : U.label) || i}`,
          value: Z[i] || "",
          onChange: (ue) => Ae((ve) => ({
            ...ve,
            [i]: ue.target.value
          })),
          style: { width: "100%" }
        }) : e.createElement(s, {
          placeholder: `请输入 ${(U == null ? void 0 : U.label) || i}`,
          value: Z[i] || "",
          onChange: (ue) => Ae((ve) => ({
            ...ve,
            [i]: ue.target.value
          })),
          style: { width: "100%" }
        }),
        // Show env key name for reference
        e.createElement(
          y,
          { type: "secondary", style: { fontSize: 11, display: "block", marginTop: 2 } },
          `环境变量名: ${i}`
        )
      );
    })
  ) : null, Ya = e.createElement(
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
        prefix: G ? e.createElement(G) : void 0,
        value: v,
        onChange: (i) => ae(i.target.value),
        allowClear: !0,
        style: { maxWidth: 400, flex: 1, minWidth: 200 }
      }),
      e.createElement(
        d,
        {
          icon: k ? e.createElement(k) : void 0,
          onClick: () => yn(!0),
          size: "small"
        },
        "配置专家源"
      )
    ),
    // Dynamic category tag row (from OSS manifest tag_groups)
    Tn.length > 0 ? e.createElement(
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
        y,
        { type: "secondary", style: { fontSize: 12, marginRight: 4 } },
        "分类:"
      ),
      e.createElement(
        p,
        {
          style: { fontSize: 11, cursor: "pointer", borderRadius: 12 },
          color: Ze === "" ? "blue" : void 0,
          onClick: () => An("")
        },
        "全部"
      ),
      ...Tn.map(
        (i) => e.createElement(
          p,
          {
            key: i.id,
            style: { fontSize: 11, cursor: "pointer", borderRadius: 12 },
            color: Ze === i.id ? "geekblue" : void 0,
            onClick: () => An(
              Ze === i.id ? "" : i.id
            )
          },
          i.label
        )
      )
    ) : null,
    // Agent cards (dynamic from OSS)
    In && Wt.length === 0 ? e.createElement(
      "div",
      { style: { textAlign: "center", padding: 40 } },
      e.createElement(o, { size: "large" }, e.createElement("div", { style: { minHeight: 60, display: "flex", alignItems: "center", justifyContent: "center" } }, "正在加载人才市场..."))
    ) : Wt.length === 0 ? e.createElement(c, {
      description: "未找到匹配的人才",
      image: c.PRESENTED_IMAGE_SIMPLE
    }) : e.createElement(
      h,
      { gutter: [12, 12] },
      ...Wt.map(
        (i) => e.createElement(
          w,
          { key: i.id, xs: 24, sm: 12, md: 8 },
          e.createElement(
            m,
            {
              hoverable: !0,
              size: "small",
              style: { height: "100%", cursor: "pointer" },
              onClick: () => ht(i)
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
                  y,
                  { strong: !0, style: { fontSize: 14 } },
                  i.name
                ),
                e.createElement(
                  "div",
                  { style: { display: "flex", gap: 4, marginTop: 4, flexWrap: "wrap" } },
                  i.category ? e.createElement(
                    p,
                    { color: "blue", style: { fontSize: 10 } },
                    lt(i.category)
                  ) : null,
                  i.tags.includes("mcp") ? e.createElement(
                    p,
                    { color: "purple", style: { fontSize: 10 } },
                    "MCP"
                  ) : null
                )
              )
            ),
            e.createElement(
              ne,
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
                  borderTop: "1px solid #f0f0f0",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center"
                }
              },
              e.createElement(
                y,
                { type: "secondary", style: { fontSize: 11 } },
                i.tags.filter((U) => U !== "agent" && U !== "template" && U !== "workspace").slice(0, 3).join(" · ") || "人才模板"
              ),
              e.createElement(
                d,
                {
                  type: "primary",
                  size: "small",
                  icon: V ? e.createElement(V) : void 0
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
        y,
        { type: "secondary", style: { fontSize: 12 } },
        "人才市场来自 UGSci 官方源，自动同步更新"
      )
    )
  ), Qa = [
    {
      key: "skills",
      label: e.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        T ? e.createElement(T, { style: { fontSize: 14 } }) : null,
        "技能市场"
      ),
      children: Wa
    },
    {
      key: "mcp",
      label: e.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        R ? e.createElement(R, { style: { fontSize: 14 } }) : null,
        "MCP 市场"
      ),
      children: Va
    },
    {
      key: "experts",
      label: e.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        V ? e.createElement(V, { style: { fontSize: 14 } }) : null,
        "人才市场"
      ),
      children: Ya
    }
  ];
  return e.createElement(
    "div",
    { style: { padding: 24 } },
    e.createElement(Bt, {
      title: "市场",
      subtitle: "浏览技能市场 · 选择 MCP 服务器 · 人才市场 · 随时更新能力和专家",
      extra: e.createElement(
        "div",
        { style: { display: "flex", gap: 8 } },
        e.createElement(
          d,
          {
            type: "primary",
            icon: I ? e.createElement(I) : void 0,
            onClick: () => {
              bt(pe, le, {}), vt(), Gt();
            },
            loading: he || Ke || wn || In
          },
          "刷新"
        )
      )
    }),
    e.createElement(_, {
      items: Qa,
      activeKey: C,
      onChange: (i) => q(i)
    }),
    // Skill source config modal
    e.createElement(Kr, {
      open: Ra,
      onClose: () => un(!1),
      sources: $e,
      onChange: (i) => {
        Me(i), vt(i);
      }
    }),
    // MCP source config modal
    e.createElement(Xn, {
      open: Ua,
      onClose: () => gn(!1),
      sources: Ba,
      onChange: (i) => pn(i),
      type: "mcp"
    }),
    // MCP token config modal (for templates requiring secrets)
    Xa,
    // Expert source config modal
    e.createElement(Xn, {
      open: Na,
      onClose: () => yn(!1),
      sources: ja,
      onChange: (i) => fn(i),
      type: "expert"
    }),
    // ── Agent Detail Modal (click card to view details, then create) ──
    Ne ? e.createElement(
      H,
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
            name: Ne.name,
            size: 40
          }),
          e.createElement(
            "div",
            null,
            e.createElement(
              y,
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
                p,
                { color: "blue", style: { fontSize: 10 } },
                lt(Ne.category)
              ) : null,
              ...Ne.tags.filter(
                (i) => i !== "agent" && i !== "template" && i !== "workspace"
              ).slice(0, 5).map(
                (i) => e.createElement(
                  p,
                  { key: i, style: { fontSize: 10 } },
                  i
                )
              )
            )
          )
        ),
        open: !0,
        onCancel: () => ht(null),
        width: 640,
        footer: e.createElement(
          "div",
          { style: { textAlign: "right" } },
          e.createElement(
            d,
            {
              onClick: () => ht(null),
              style: { marginRight: 8 }
            },
            "取消"
          ),
          e.createElement(
            d,
            {
              type: "primary",
              loading: Ft,
              disabled: Ft,
              icon: V ? e.createElement(V) : void 0,
              style: je,
              onClick: async () => {
                await Ja(Ne), ht(null);
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
          y,
          { strong: !0, style: { display: "block", marginBottom: 6 } },
          "简介"
        ),
        e.createElement(
          ne,
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
          y,
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
          y,
          { style: { fontSize: 12, color: "#1677ff" } },
          "✓ 包含系统提示词，创建后将自动写入 AGENTS.md"
        )
      ) : null,
      // Drivers
      Ne.drivers && Object.keys(Ne.drivers).length > 0 ? e.createElement(
        "div",
        null,
        e.createElement(
          y,
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
            ([i, U]) => e.createElement(
              p,
              { key: i, color: "cyan", style: { fontSize: 11 } },
              `${i}${U && U.length > 0 ? ` (${U.join(", ")})` : ""}`
            )
          )
        )
      ) : null
    ) : null
  );
}
function Qr() {
  try {
    const t = localStorage.getItem("language") || "";
    if (t) return t.split("-")[0];
  } catch {
  }
  return ((typeof navigator < "u" ? navigator.language : "") || "").split("-")[0] || "en";
}
const Zn = {
  zh: "您好，UGSci 智能助手在线。无论是油气藏分析、数值模拟还是工程决策，描述您的场景，我来交付结果。",
  en: "UGSci AI assistant is online. From reservoir analysis to numerical simulation and engineering decisions — describe your scenario and I'll deliver results.",
  ja: "UGSci AIアシスタントがオンラインです。油層解析、数値シミュレーション、エンジニアリングの意思決定など、シナリオを描写してください。結果をお届けします。",
  ru: "UGSci AI-ассистент онлайн. От анализа пласта до численного моделирования и инженерных решений — опишите свой сценарий, и я предоставлю результат.",
  vi: "Trợ lý AI UGSci đang trực tuyến. Từ phân tích mỏ, mô phỏng số đến ra quyết định kỹ thuật — mô tả kịch bản của bạn, tôi sẽ giao kết quả.",
  id: "Asisten AI UGSci sedang online. Dari analisis reservoir, simulasi numerik hingga keputusan engineering — jelaskan skenario Anda, saya akan memberikan hasilnya."
}, ea = {
  zh: { label: "能告诉我你都能做点什么吗？", value: "能告诉我你都能做点什么吗" },
  en: { label: "Can you tell me what you can do?", value: "Can you tell me what you can do?" },
  ja: { label: "あなたができることを教えてください", value: "あなたができることを教えてください" },
  ru: { label: "Расскажи, что ты умеешь делать?", value: "Расскажи, что ты умеешь делать?" },
  vi: { label: "Bạn có thể cho tôi biết bạn làm được gì không?", value: "Bạn có thể cho tôi biết bạn làm được gì không?" },
  id: { label: "Bisa cerita apa saja yang bisa Anda lakukan?", value: "Bisa cerita apa saja yang bisa Anda lakukan?" }
};
function Zr() {
  const e = P(), t = e.React, { useEffect: l, useRef: n } = t, a = e.useSelectedAgent ? e.useSelectedAgent() : { id: "default" }, r = (a == null ? void 0 : a.id) || "default", o = n(null), c = n(null);
  return l(() => {
    if (o.current === r) return;
    o.current = r, tn();
    const s = Qr(), d = Zn[s] || Zn.en, u = ea[s] || ea.en;
    let h = !1;
    return (async () => {
      var w, m;
      try {
        const p = await jt(r);
        if (h) return;
        const g = la(p);
        if (c.current) {
          try {
            c.current();
          } catch {
          }
          c.current = null;
        }
        const f = window.QwenPaw;
        (w = f == null ? void 0 : f.chat) != null && w.welcome && (g.length > 0 ? (c.current = f.chat.welcome.set("ugsci", {
          description: d,
          prompts: g
        }), console.info(
          `[ugsci] Injected ${g.length} welcome prompts for agent "${r}"`
        )) : (c.current = f.chat.welcome.set("ugsci", {
          description: d,
          prompts: [u]
        }), console.info(
          `[ugsci] No skills for agent "${r}" — using default prompt`
        )));
      } catch (p) {
        console.warn(
          `[ugsci] Failed to inject welcome prompts for agent "${r}":`,
          p
        );
        const g = window.QwenPaw;
        if ((m = g == null ? void 0 : g.chat) != null && m.welcome && !h) {
          if (c.current) {
            try {
              c.current();
            } catch {
            }
            c.current = null;
          }
          c.current = g.chat.welcome.set("ugsci", {
            description: d,
            prompts: [u]
          });
        }
      }
    })(), () => {
      h = !0;
    };
  }, [r]), null;
}
let Tt = null;
function Aa() {
  var t, l;
  if (Tt) return Tt;
  const e = (l = (t = window.QwenPaw) == null ? void 0 : t.host) == null ? void 0 : l.React;
  return e ? (Tt = e.createContext(null), Tt) : null;
}
function mt(e, t) {
  return `${e}::${t}`;
}
function $a(e) {
  if (!e || typeof e != "string") return null;
  try {
    const t = JSON.parse(e);
    return t && typeof t == "object" && t.ok === !0 && (t.kind === "genui" || t.kind === "genui_patch") ? t : null;
  } catch {
    return console.warn("[ugsci.genui] Failed to parse tool result as JSON"), null;
  }
}
function Pa(e) {
  if (!e || typeof e != "string") return null;
  try {
    const t = JSON.parse(e);
    return t && typeof t == "object" && t.ok === !1 ? t : null;
  } catch {
    return null;
  }
}
const eo = /* @__PURE__ */ new Set([
  "plugin_call_output",
  "function_call_output",
  "tool_call_output",
  "mcp_call_output",
  "component_call_output"
]), to = /* @__PURE__ */ new Set(["emit_ui_tree", "emit_ui_patch"]);
function Oa(e) {
  if (!Array.isArray(e)) return [];
  const t = [];
  for (const l of e) {
    if (!l || typeof l != "object") continue;
    const n = l, a = n.type;
    if (!a || !eo.has(a)) continue;
    const r = n.content;
    if (!Array.isArray(r) || r.length === 0) continue;
    const o = r[0];
    if (!o || typeof o != "object") continue;
    const c = o.data;
    if (!c) continue;
    const s = c.name || "";
    if (to.has(s) && r.length > 1) {
      const d = r[1], u = d == null ? void 0 : d.data, h = u == null ? void 0 : u.output;
      if (h != null) {
        const w = typeof h == "string" ? h : JSON.stringify(h), m = $a(w);
        if (m) t.push(m);
        else {
          const p = Pa(w);
          p && t.push(p);
        }
      }
    }
  }
  return t;
}
function no({ children: e }) {
  var h, w;
  const t = (w = (h = window.QwenPaw) == null ? void 0 : h.host) == null ? void 0 : w.React;
  if (!t) return null;
  const [l, n] = t.useState({}), a = t.useCallback((m) => {
    const p = mt(m.sessionId, m.uiId);
    n((g) => {
      const f = g[p];
      return f && m.revision <= f.revision ? (console.warn(
        "[ugsci.genui] Ignoring stale snapshot: ui_id=%s, existing_revision=%d, new_revision=%d",
        m.uiId,
        f.revision,
        m.revision
      ), g) : { ...g, [p]: m };
    });
  }, []), r = t.useCallback(
    (m, p, g) => {
      var E, $, z;
      const f = mt(
        ((z = ($ = (E = window.QwenPaw) == null ? void 0 : E.host) == null ? void 0 : $.getCurrentSessionId) == null ? void 0 : z.call($)) || "",
        m.ui_id
      );
      n((_) => {
        const O = _[f];
        return O ? g <= O.revision ? (console.warn(
          "[ugsci.genui] applyPatch: ignoring stale revision %d (current: %d)",
          g,
          O.revision
        ), _) : {
          ..._,
          [f]: {
            ...O,
            tree: p,
            revision: g,
            updatedAt: Date.now()
          }
        } : (console.warn("[ugsci.genui] applyPatch: ui_id '%s' not found in store", m.ui_id), _);
      });
    },
    []
  ), o = t.useCallback(
    (m, p) => l[mt(m, p)],
    [l]
  ), c = t.useCallback((m) => {
    n((p) => {
      const g = {};
      for (const [f, E] of Object.entries(p))
        E.sessionId !== m && (g[f] = E);
      return g;
    });
  }, []), s = t.useCallback(
    (m, p) => {
      const g = Oa(p);
      for (const f of g)
        if (f.ui_id && f.tree) {
          const E = mt(m, f.ui_id), $ = f.revision || 1;
          n((z) => {
            var O;
            const _ = ((O = z[E]) == null ? void 0 : O.revision) || 0;
            return $ <= _ ? z : {
              ...z,
              [E]: {
                schemaVersion: "1",
                uiId: f.ui_id,
                revision: $,
                tree: f.tree,
                sessionId: m,
                sourceToolCallId: f.tool_call_id,
                updatedAt: Date.now()
              }
            };
          });
        }
    },
    []
  ), d = t.useMemo(
    () => ({ snapshots: l, setSnapshot: a, applyPatch: r, getSnapshot: o, clearSession: c, hydrateFromMessages: s }),
    [l, a, r, o, c, s]
  ), u = Aa();
  return u ? t.createElement(u.Provider, { value: d }, e) : null;
}
function ao() {
  var n, a;
  const e = (a = (n = window.QwenPaw) == null ? void 0 : n.host) == null ? void 0 : a.React, t = Aa();
  if (!e || !t) throw new Error("useGenUiStore: host React not available");
  const l = e.useContext(t);
  if (!l) throw new Error("useGenUiStore must be used within GenUiStoreProvider");
  return l;
}
function lo(e) {
  const t = e.data;
  if (!t) return { resultText: "", status: "calling", toolName: "" };
  const l = t.status || "calling", n = t.content;
  if (!Array.isArray(n) || n.length === 0)
    return { resultText: "", status: l, toolName: "" };
  const a = n[0], r = a == null ? void 0 : a.data, o = (r == null ? void 0 : r.name) || "";
  if (n.length > 1) {
    const c = n[1], s = c == null ? void 0 : c.data, d = s == null ? void 0 : s.output;
    if (typeof d == "string") return { resultText: d, status: l, toolName: o };
    if (d != null) return { resultText: JSON.stringify(d, null, 2), status: l, toolName: o };
  }
  if (r != null && r.output) {
    const c = r.output;
    return { resultText: typeof c == "string" ? c : JSON.stringify(c, null, 2), status: l, toolName: o };
  }
  return { resultText: "", status: l, toolName: o };
}
function _t(e) {
  var m, p, g;
  const t = (m = window.QwenPaw) == null ? void 0 : m.host, l = t == null ? void 0 : t.React;
  if (!l) return null;
  const { resultText: n, status: a, toolName: r } = lo(e), o = a === "in_progress" || a === "calling", c = a === "failed" || a === "error", s = $a(n), d = s ? null : Pa(n);
  let u = 0;
  (p = s == null ? void 0 : s.tree) != null && p.root && (u = Ma(s.tree.root));
  const h = r === "emit_ui_patch" || (s == null ? void 0 : s.kind) === "genui_patch", w = o ? h ? "📝 Patching UI Tree..." : "🎨 Generating UI Tree..." : c ? h ? "📝 UI Patch Error" : "🎨 UI Tree Error" : s ? h ? `📝 UI Patched (rev ${s.revision ?? "?"})` : `🎨 UI Tree (${u} nodes)` : h ? "📝 UI Patch" : "🎨 UI Tree";
  return l.createElement(
    "details",
    { open: o || c, style: { margin: "4px 0", border: "1px solid var(--ant-color-border, #d9d9d9)", borderRadius: 8, padding: "4px 8px", fontSize: 13 } },
    l.createElement(
      "summary",
      { style: { cursor: "pointer", display: "flex", alignItems: "center", gap: 6 } },
      l.createElement("span", null, h ? "📝" : "🎨"),
      l.createElement("span", null, w),
      s != null && s.ok ? l.createElement("span", { style: { fontSize: 11, color: "#999", marginLeft: "auto" } }, `ui_id: ${((g = s.ui_id) == null ? void 0 : g.slice(0, 16)) ?? ""}…`) : null
    ),
    c || d && !s ? l.createElement(
      "div",
      { style: { padding: "8px 12px", fontSize: 12 } },
      l.createElement("div", { style: { color: "var(--ant-color-error, #ff4d4f)", marginBottom: 4 } }, (d == null ? void 0 : d.message) || "Unknown error"),
      d != null && d.hint ? l.createElement("div", { style: { color: "#999" } }, `💡 ${d.hint}`) : null
    ) : s != null && s.ok ? l.createElement(
      "div",
      { style: { padding: "8px 12px", fontSize: 12, color: "#999" } },
      h ? `UI tree patched to revision ${s.revision ?? 1} (${u} nodes)` : `UI tree rendered below (${u} nodes, revision ${s.revision ?? 1})`
    ) : l.createElement("pre", { style: { fontSize: 12, padding: "8px 12px", background: "rgba(0,0,0,0.03)", borderRadius: 8, overflow: "auto", maxHeight: 200 } }, n || "(waiting for result...)")
  );
}
function Ma(e) {
  if (!e || typeof e != "object") return 0;
  let t = 1;
  if (Array.isArray(e.children)) for (const l of e.children) t += Ma(l);
  return t;
}
const ro = /* @__PURE__ */ new Set(["send_message"]), ta = 1e4, La = 500, Zt = {};
function oo() {
  var e;
  try {
    const t = window.QwenPaw, l = (e = t == null ? void 0 : t.genui) == null ? void 0 : e.config;
    if (l != null && l.allow_actions && Array.isArray(l.allow_actions)) {
      const n = l.allow_actions.filter(
        (a) => typeof a == "string" && a.length > 0
      );
      if (n.length > 0)
        return new Set(n);
    }
  } catch {
  }
  return new Set(ro);
}
function so(e) {
  const t = Date.now(), l = Zt[e] || 0;
  return t - l < La ? (console.warn("[ugsci.genui] Action '" + e + "' throttled"), !0) : (Zt[e] = t, !1);
}
function qt(e) {
  var n, a;
  let t;
  if (typeof e == "string") t = { type: e };
  else if (e && typeof e == "object") t = e;
  else return;
  const l = oo();
  if (!l.has(t.type)) {
    console.warn(
      "[ugsci.genui] Action '" + t.type + "' not allowed (allowed: " + Array.from(l).join(", ") + ")"
    );
    return;
  }
  if (!so(t.type) && t.type === "send_message") {
    const r = ((n = t.payload) == null ? void 0 : n.content) || ((a = t.payload) == null ? void 0 : a.message) || "";
    if (!r || !r.trim()) {
      console.warn("[ugsci.genui] send_message: content is empty");
      return;
    }
    if (r.length > ta) {
      console.warn("[ugsci.genui] send_message: content length " + r.length + " exceeds max " + ta);
      return;
    }
    co(r) || console.info("[ugsci.genui] send_message: could not find chat sender, content:", r);
  }
}
function io(e) {
  const t = Date.now(), l = Zt[e] || 0;
  return t - l < La;
}
function co(e) {
  var t;
  try {
    const l = document.querySelector('[class*="sender"]'), n = l == null ? void 0 : l.querySelector("textarea");
    if (!n) return !1;
    const a = (t = Object.getOwnPropertyDescriptor(
      window.HTMLTextAreaElement.prototype,
      "value"
    )) == null ? void 0 : t.set;
    return a ? a.call(n, e) : n.value = e, n.dispatchEvent(new Event("input", { bubbles: !0 })), n.dispatchEvent(
      new KeyboardEvent("keydown", {
        key: "Enter",
        code: "Enter",
        keyCode: 13,
        which: 13,
        bubbles: !0,
        cancelable: !0
      })
    ), !0;
  } catch (l) {
    return console.warn("[ugsci.genui] _sendViaTextarea failed:", l), !1;
  }
}
const At = /* @__PURE__ */ new Map(), It = /* @__PURE__ */ new Map();
function Ot(e) {
  return e.startsWith("http://") || e.startsWith("https://") || e.startsWith("data:") || e.startsWith("blob:");
}
function mo(e) {
  return e ? !!(e.startsWith("/") || /^[A-Za-z]:[\\/]/.test(e) || e.startsWith("\\\\")) : !1;
}
function uo(e) {
  return e.startsWith("workspace://");
}
function po(e) {
  return uo(e) ? e.slice(12) : e;
}
async function go(e) {
  if (!e) return null;
  if (Ot(e)) return e;
  if (At.has(e))
    return At.get(e) ?? null;
  if (It.has(e))
    return It.get(e);
  const t = fo(e);
  It.set(e, t);
  try {
    const l = await t;
    return At.set(e, l), l;
  } finally {
    It.delete(e);
  }
}
async function fo(e) {
  const t = window.QwenPaw, l = t == null ? void 0 : t.host;
  if (!l)
    return console.warn("[ugsci.genui] Host runtime not available for media resolution"), null;
  const n = po(e);
  if (typeof l.resolveWorkspaceBlob == "function")
    try {
      const a = await l.resolveWorkspaceBlob(n);
      if (a) return a;
    } catch (a) {
      console.warn("[ugsci.genui] host.resolveWorkspaceBlob failed:", a);
    }
  try {
    return await yo(n, l);
  } catch (a) {
    return console.warn(
      `[ugsci.genui] Failed to resolve media URL for '${e}':`,
      a
    ), null;
  }
}
async function yo(e, t) {
  let l = null;
  const n = t == null ? void 0 : t.workspaceApi, a = t == null ? void 0 : t.chatApi;
  if (mo(e) && (a != null && a.filePreviewUrl) ? l = a.filePreviewUrl(e) : n != null && n.getBinaryFileUrl && (l = n.getBinaryFileUrl(e)), !l)
    return e;
  const r = {}, o = t == null ? void 0 : t.buildAuthHeaders;
  if (typeof o == "function")
    try {
      const d = o();
      d && typeof d == "object" && Object.assign(r, d);
    } catch {
    }
  const c = await fetch(l, { headers: r });
  if (!c.ok)
    throw new Error(`HTTP ${c.status}: ${c.statusText}`);
  const s = await c.blob();
  return URL.createObjectURL(s);
}
function Mt(e) {
  return e ? Ot(e) ? e : At.get(e) ?? null : null;
}
const A = (e) => typeof e == "string" ? e : e != null ? String(e) : "", xe = (e) => typeof e == "number" ? e : typeof e == "string" && Number(e) || 0, tt = (e) => !!e, Xe = (e) => Array.isArray(e) ? e : [], na = { xs: "12px", sm: "13px", base: "14px", lg: "16px" }, we = {
  muted: "var(--ant-color-text-secondary, #8c8c8c)",
  default: "var(--ant-color-text, #000000d9)",
  primary: "var(--ant-color-primary, #1677ff)",
  success: "var(--ant-color-success, #52c41a)",
  warning: "var(--ant-color-warning, #faad14)",
  error: "var(--ant-color-error, #ff4d4f)"
};
function Eo({ node: e, children: t }) {
  var r;
  const l = (r = window.QwenPaw) == null ? void 0 : r.host, n = l == null ? void 0 : l.React;
  if (!n) return null;
  class a extends n.Component {
    constructor(c) {
      super(c), this.state = { hasError: !1 };
    }
    static getDerivedStateFromError() {
      return { hasError: !0 };
    }
    componentDidCatch(c) {
      console.error("[ugsci.genui] Component error for kind '%s':", this.props.node.kind, c);
    }
    render() {
      return this.state.hasError ? n.createElement("div", {
        style: { padding: 8, border: "1px dashed var(--ant-color-error, #ff4d4f)", borderRadius: 8, fontSize: 12, color: we.error, fontFamily: "monospace" }
      }, `⚠️ Component error: ${this.props.node.kind}`) : this.props.children;
    }
  }
  return n.createElement(a, { node: e }, t);
}
function pt({ node: e }) {
  var c;
  const t = (c = window.QwenPaw) == null ? void 0 : c.host;
  if (!(t != null && t.React)) return null;
  const l = t.React, n = t.antd || {}, a = e.props || {}, r = e.children || [], o = () => r.map(
    (s, d) => l.createElement(pt, { key: s.nodeId || d, node: s })
  );
  return l.createElement(
    Eo,
    { node: e },
    ho(l, n, e, a, r, o)
  );
}
function ho(e, t, l, n, a, r) {
  var o, c, s, d, u, h, w;
  switch (l.kind) {
    case "Stack":
      return e.createElement("div", { style: { display: "flex", flexDirection: "column", gap: `${xe(n.gap) || 12}px`, padding: n.padding ? `${xe(n.padding)}px` : void 0 } }, r());
    case "Row":
      return e.createElement("div", { style: { display: "flex", flexDirection: "row", gap: `${xe(n.gap) || 12}px`, alignItems: A(n.align) || void 0, justifyContent: A(n.justify) || void 0 } }, r());
    case "Grid":
      return e.createElement("div", { style: { display: "grid", gridTemplateColumns: `repeat(${Math.min(Math.max(xe(n.columns) || 2, 1), 6)}, 1fr)`, gap: `${xe(n.gap) || 12}px` } }, r());
    case "Spacer":
      return e.createElement("div", { style: { height: `${xe(n.size) || 16}px` } });
    case "ScrollArea":
      return e.createElement("div", { style: { maxHeight: n.maxHeight ? `${xe(n.maxHeight)}px` : "300px", overflowY: "auto", padding: n.padding ? `${xe(n.padding)}px` : void 0 } }, r());
    case "AspectBox": {
      const m = A(n.ratio) || "16:9", [p, g] = m.split(":").map(Number), f = p && g ? `${g}/${p}` : "9/16";
      return e.createElement("div", { style: { aspectRatio: f, overflow: "hidden", borderRadius: 8, display: "flex", justifyContent: "center", alignItems: "center" } }, r());
    }
    case "Text":
      return e.createElement("div", { style: { fontSize: na[A(n.size)] || na.base, color: we[A(n.color)] || we.default, fontWeight: tt(n.bold) ? "bold" : "normal", lineHeight: 1.6 } }, A(n.value));
    case "Heading": {
      const m = Math.min(Math.max(xe(n.level) || 2, 1), 4), p = { 1: "24px", 2: "20px", 3: "18px", 4: "16px" };
      return e.createElement("div", { style: { fontSize: p[m], fontWeight: "bold", margin: "4px 0" } }, A(n.value));
    }
    case "Divider":
      return e.createElement(t.Divider || "hr", n.label ? { children: A(n.label) } : {});
    case "Markdown": {
      const m = (o = window.QwenPaw) == null ? void 0 : o.host, p = m == null ? void 0 : m.ReactMarkdown;
      if (p) {
        const g = m != null && m.remarkGfm ? [m.remarkGfm] : [];
        return e.createElement(
          "div",
          { className: "qwenpaw-genui-markdown" },
          e.createElement(p, { children: A(n.content || n.value), remarkPlugins: g })
        );
      }
      return e.createElement("div", { style: { whiteSpace: "pre-wrap", lineHeight: 1.6 } }, A(n.content || n.value));
    }
    case "CodeBlock":
      return e.createElement("pre", { style: { padding: 12, background: "var(--ant-color-fill-tertiary, rgba(0,0,0,0.04))", borderRadius: 8, overflow: "auto", fontSize: 13, fontFamily: "monospace" } }, A(n.code));
    case "SectionHeader":
      return e.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8, marginBottom: 8 } }, n.icon ? e.createElement("span", { style: { fontSize: 20 } }, A(n.icon)) : null, e.createElement("div", null, e.createElement("div", { style: { fontSize: 16, fontWeight: 600 } }, A(n.title)), n.subtitle ? e.createElement("div", { style: { fontSize: 12, color: we.muted } }, A(n.subtitle)) : null));
    case "KeyValueList": {
      const m = Xe(n.items);
      return e.createElement(
        "div",
        { style: { display: "flex", flexDirection: "column", gap: 4 } },
        ...m.map((p, g) => e.createElement(
          "div",
          { key: g, style: { display: "flex", justifyContent: "space-between", padding: "2px 0", borderBottom: g < m.length - 1 ? "1px solid var(--ant-color-border-secondary, #f0f0f0)" : "none" } },
          e.createElement("span", { style: { color: we.muted, fontSize: 13 } }, A(p.key)),
          e.createElement("span", { style: { fontWeight: 500, fontSize: 13 } }, A(p.value))
        ))
      );
    }
    case "Badge":
      return e.createElement(t.Tag || "span", { color: A(n.variant) || "default", children: A(n.value) });
    case "Tag":
      return e.createElement(t.Tag || "span", { color: A(n.color) || "default", children: A(n.label) });
    case "Stat":
      return e.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 2 } }, e.createElement("span", { style: { fontSize: 12, color: we.muted } }, A(n.label)), e.createElement("span", { style: { fontSize: 20, fontWeight: "bold" } }, A(n.value)), n.delta ? e.createElement("span", { style: { fontSize: 12, color: A(n.trend) === "up" ? we.success : A(n.trend) === "down" ? we.error : we.muted } }, A(n.delta)) : null);
    case "Progress":
      return e.createElement(t.Progress || "div", { percent: xe(n.value), size: "small" });
    case "Skeleton": {
      const m = xe(n.rows) || 3;
      return e.createElement(
        "div",
        { style: { display: "flex", flexDirection: "column", gap: 8 } },
        ...Array.from({ length: m }).map(
          (p, g) => e.createElement(t.Skeleton || "div", { key: g, active: tt(n.active), title: !1, paragraph: { rows: 1 } })
        )
      );
    }
    case "Avatar":
      return e.createElement(t.Avatar || "div", { src: Mt(A(n.src)) || A(n.src), size: xe(n.size) || 32 }, ((s = (c = A(n.name)) == null ? void 0 : c.charAt(0)) == null ? void 0 : s.toUpperCase()) || "");
    case "Icon":
      return e.createElement("span", { style: { fontSize: xe(n.size) || 16, color: we[A(n.color)] || we.default } }, A(n.name));
    case "Card":
      return e.createElement(t.Card || "div", { title: n.title ? A(n.title) : void 0, size: "small", style: { margin: "4px 0" } }, r());
    case "DataCard":
      return e.createElement(t.Card || "div", { size: "small", style: { margin: "4px 0" } }, e.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center" } }, e.createElement("div", null, e.createElement("div", { style: { fontSize: 12, color: we.muted } }, A(n.title)), e.createElement("div", { style: { fontSize: 24, fontWeight: "bold" } }, A(n.value))), n.icon ? e.createElement("span", { style: { fontSize: 32 } }, A(n.icon)) : null));
    case "MetricCard":
      return e.createElement(t.Card || "div", { size: "small", style: { margin: "4px 0" } }, e.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center" } }, e.createElement("div", null, e.createElement("div", { style: { fontSize: 12, color: we.muted } }, A(n.title)), e.createElement("div", { style: { fontSize: 24, fontWeight: "bold" } }, A(n.value)), n.delta ? e.createElement("span", { style: { fontSize: 12, color: A(n.trend) === "up" ? we.success : A(n.trend) === "down" ? we.error : we.muted } }, `${A(n.delta)} ${n.period ? A(n.period) : ""}`.trim()) : null), n.icon ? e.createElement("span", { style: { fontSize: 32 } }, A(n.icon)) : null));
    case "AlertCard":
    case "Alert":
      return e.createElement(t.Alert || "div", { type: A(n.severity) === "success" ? "success" : A(n.severity) === "warning" ? "warning" : A(n.severity) === "error" ? "error" : "info", message: n.title ? A(n.title) : void 0, description: A(n.message), showIcon: !0, style: { margin: "4px 0" } });
    case "Callout":
      return e.createElement(t.Alert || "div", { type: A(n.variant) === "tip" ? "success" : A(n.variant) === "warning" ? "warning" : A(n.variant) === "important" ? "error" : "info", message: n.title ? A(n.title) : void 0, description: A(n.message), showIcon: !0 });
    case "WeatherCard":
      return e.createElement(t.Card || "div", { size: "small", style: { margin: "4px 0", display: "flex", alignItems: "center", gap: 16 } }, n.icon ? e.createElement("span", { style: { fontSize: 40 } }, A(n.icon)) : null, e.createElement("div", null, e.createElement("div", { style: { fontSize: 24, fontWeight: "bold" } }, A(n.temperature)), e.createElement("div", { style: { color: we.muted } }, A(n.condition)), e.createElement("div", { style: { fontSize: 12, color: we.muted } }, A(n.location))));
    case "ProfileCard":
      return e.createElement(t.Card || "div", { size: "small", style: { margin: "4px 0" } }, e.createElement("div", { style: { display: "flex", gap: 12, alignItems: "center" } }, e.createElement(t.Avatar || "div", { src: Mt(A(n.avatar)) || A(n.avatar), size: 48 }, (u = (d = A(n.name)) == null ? void 0 : d.charAt(0)) == null ? void 0 : u.toUpperCase()), e.createElement("div", null, e.createElement("div", { style: { fontWeight: 600 } }, A(n.name)), e.createElement("div", { style: { fontSize: 12, color: we.muted } }, A(n.role)), n.bio ? e.createElement("div", { style: { fontSize: 12, marginTop: 4 } }, A(n.bio)) : null)));
    case "MediaCard":
      return e.createElement(t.Card || "div", { size: "small", style: { margin: "4px 0", overflow: "hidden" } }, e.createElement(Vt, { src: A(n.src), alt: A(n.title), style: { width: "100%", maxHeight: 200, objectFit: "cover" } }), e.createElement("div", { style: { padding: "8px 12px" } }, e.createElement("div", { style: { fontWeight: 600 } }, A(n.title)), n.caption ? e.createElement("div", { style: { fontSize: 12, color: we.muted } }, A(n.caption)) : null));
    case "QuoteCard":
      return e.createElement(t.Card || "div", { size: "small", style: { margin: "4px 0", fontStyle: "italic" } }, e.createElement("div", { style: { fontSize: 14, lineHeight: 1.6 } }, `"${A(n.quote)}"`), e.createElement("div", { style: { fontSize: 12, color: we.muted, marginTop: 8 } }, `— ${A(n.author)}${n.role ? `, ${A(n.role)}` : ""}`));
    case "TimelineCard":
      return e.createElement(t.Card || "div", { size: "small", style: { margin: "4px 0" } }, e.createElement("div", { style: { display: "flex", gap: 8, alignItems: "flex-start" } }, e.createElement("div", { style: { width: 8, height: 8, borderRadius: "50%", background: A(n.status) === "done" ? we.success : A(n.status) === "pending" ? we.warning : we.primary, marginTop: 4, flexShrink: 0 } }), e.createElement("div", null, e.createElement("div", { style: { fontWeight: 600 } }, A(n.title)), n.date ? e.createElement("div", { style: { fontSize: 12, color: we.muted } }, A(n.date)) : null, n.description ? e.createElement("div", { style: { fontSize: 13, marginTop: 4 } }, A(n.description)) : null)));
    case "KpiBoard":
      return e.createElement("div", { style: { margin: "4px 0" } }, n.title ? e.createElement("div", { style: { fontSize: 16, fontWeight: 600, marginBottom: 8 } }, A(n.title)) : null, e.createElement("div", { style: { display: "grid", gridTemplateColumns: `repeat(${Math.min(Math.max(xe(n.columns) || 3, 1), 6)}, 1fr)`, gap: 12 } }, r()));
    case "FeatureGrid":
      return e.createElement("div", { style: { display: "grid", gridTemplateColumns: `repeat(${Math.min(Math.max(xe(n.columns) || 2, 1), 4)}, 1fr)`, gap: `${xe(n.gap) || 12}px`, margin: "4px 0" } }, r());
    case "Stepper": {
      const m = Xe(n.steps).map((g) => A(g)), p = xe(n.current);
      return e.createElement(
        t.Steps || "div",
        { current: p, size: "small", style: { margin: "4px 0" } },
        ...m.map((g, f) => {
          var E;
          return e.createElement(((E = t.Steps) == null ? void 0 : E.Item) || "div", { key: f, title: g });
        })
      );
    }
    case "Table": {
      const m = Xe(n.headers).map((E) => A(E)), g = a.filter((E) => E.kind === "TableRow").map((E, $) => {
        const z = (E.children || []).filter((O) => O.kind === "TableCell"), _ = { key: $ };
        return m.forEach((O, D) => {
          var H, L;
          _[O] = (L = (H = z[D]) == null ? void 0 : H.props) != null && L.value ? A(z[D].props.value) : "";
        }), _;
      }), f = m.map((E) => ({ title: E, dataIndex: E, key: E }));
      return e.createElement(t.Table || "table", { dataSource: g, columns: f, size: tt(n.compact) ? "small" : "middle", pagination: !1, style: { margin: "4px 0" } });
    }
    case "List": {
      const m = a.filter((p) => p.kind === "ListItem");
      return e.createElement(
        t.List || "ul",
        { size: "small", style: { margin: "4px 0" } },
        m.map((p, g) => {
          var f, E, $;
          return e.createElement(((f = t.List) == null ? void 0 : f.Item) || "li", { key: g }, (E = p.props) != null && E.icon ? e.createElement("span", { style: { marginRight: 6 } }, A(p.props.icon)) : null, A(($ = p.props) == null ? void 0 : $.value));
        })
      );
    }
    case "ImageGallery": {
      const m = a.filter((p) => p.kind === "Image");
      return e.createElement(
        "div",
        { style: { display: "grid", gridTemplateColumns: `repeat(${Math.min(Math.max(xe(n.columns) || 3, 1), 6)}, 1fr)`, gap: `${xe(n.gap) || 8}px`, margin: "4px 0" } },
        ...m.map((p, g) => {
          const f = p.props || {};
          return e.createElement(Vt, { key: g, src: A(f.src), alt: A(f.alt), style: { width: "100%", height: 120, objectFit: "cover", borderRadius: 8, cursor: "pointer" } });
        })
      );
    }
    case "Image":
      return e.createElement("div", null, e.createElement(Vt, { src: A(n.src), alt: A(n.alt), style: { maxWidth: "100%", borderRadius: tt(n.rounded) ? "8px" : void 0, maxHeight: n.maxHeight ? `${xe(n.maxHeight)}px` : void 0 } }), n.caption ? e.createElement("div", { style: { fontSize: 12, color: we.muted } }, A(n.caption)) : null);
    case "Chart":
      return e.createElement(vo, { props: n });
    case "Button":
    case "InteractiveButton": {
      const m = io("send_message");
      return e.createElement(t.Button || "button", {
        type: A(n.variant) === "primary" ? "primary" : "default",
        size: "small",
        children: A(n.label) || "Action",
        disabled: m,
        loading: m,
        onClick: () => {
          !m && n.action && typeof n.action == "object" && qt(n.action);
        }
      });
    }
    case "ToggleButton":
      return e.createElement(t.Button || "button", { type: tt(n.checked) ? "primary" : "default", size: "small", children: A(n.label), onClick: () => {
        n.action && typeof n.action == "object" && qt(n.action);
      } });
    case "LinkButton":
      return e.createElement(t.Button || "button", { type: "link", size: "small", children: A(n.label), onClick: () => {
        n.action && typeof n.action == "object" && qt(n.action);
      } });
    case "Input":
      return e.createElement(t.Input || "input", { placeholder: A(n.placeholder), value: A(n.value), disabled: !0, size: "small" });
    case "NumberInput":
      return e.createElement(t.InputNumber || "input", { value: xe(n.value), min: n.min !== void 0 ? xe(n.min) : void 0, max: n.max !== void 0 ? xe(n.max) : void 0, disabled: !0, size: "small" });
    case "Select":
      return e.createElement(t.Select || "select", { placeholder: A(n.placeholder), value: A(n.value) || void 0, disabled: !0, size: "small", style: { width: "100%" } }, Xe(n.options).map((m, p) => {
        var g;
        return e.createElement(((g = t.Select) == null ? void 0 : g.Option) || "option", { key: p, value: A(m) }, A(m));
      }));
    case "Textarea":
      return e.createElement(((h = t.Input) == null ? void 0 : h.TextArea) || "textarea", { placeholder: A(n.placeholder), value: A(n.value), rows: xe(n.rows) || 3, disabled: !0, size: "small", style: { width: "100%" } });
    case "Form":
      return e.createElement("div", { style: { margin: "4px 0" } }, n.title ? e.createElement("div", { style: { fontWeight: 600, marginBottom: 8 } }, A(n.title)) : null, r());
    case "Switch":
      return e.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8 } }, e.createElement(t.Switch || "input", { checked: tt(n.checked), disabled: !0, size: "small" }), e.createElement("span", { style: { fontSize: 13 } }, A(n.label)));
    case "Slider":
      return e.createElement("div", { style: { margin: "4px 0" } }, e.createElement("div", { style: { fontSize: 12, color: we.muted, marginBottom: 4 } }, A(n.label)), e.createElement(t.Slider || "input", { value: xe(n.value), min: n.min !== void 0 ? xe(n.min) : 0, max: n.max !== void 0 ? xe(n.max) : 100, step: n.step !== void 0 ? xe(n.step) : 1, disabled: !0 }));
    case "FileInput":
      return e.createElement(t.Upload || "div", { disabled: !0 }, e.createElement(t.Button || "button", { disabled: !0, size: "small" }, A(n.label) || "Upload"));
    case "Chip":
      return e.createElement(t.Tag || "span", { color: A(n.color) || "default", closable: !0, onClose: () => {
      }, children: A(n.label) });
    case "ChipGroup": {
      const m = Xe(n.items);
      return e.createElement("div", { style: { display: "flex", flexWrap: "wrap", gap: 4 } }, ...m.map((p, g) => e.createElement(t.Tag || "span", { key: g }, A(p))));
    }
    case "Tabs": {
      const p = a.filter((g) => g.kind === "TabItem").map((g) => {
        var f, E, $;
        return {
          key: A((f = g.props) == null ? void 0 : f.key) || A((E = g.props) == null ? void 0 : E.tab),
          label: A(($ = g.props) == null ? void 0 : $.tab),
          children: (g.children || []).map((z, _) => e.createElement(pt, { key: z.nodeId || _, node: z }))
        };
      });
      return t.Tabs ? e.createElement(t.Tabs, { items: p, defaultActiveKey: A(n.activeKey) || ((w = p[0]) == null ? void 0 : w.key) }) : e.createElement("div", null, ...p.map((g, f) => e.createElement("div", { key: f }, e.createElement("div", { style: { fontWeight: 600, marginBottom: 4 } }, g.label), g.children)));
    }
    case "TabItem":
      return e.createElement("div", null, r());
    case "Accordion": {
      const m = a.filter((p) => p.kind === "AccordionItem");
      if (t.Collapse) {
        const p = m.map((g) => {
          var f, E, $;
          return {
            key: A((f = g.props) == null ? void 0 : f.key) || A((E = g.props) == null ? void 0 : E.header),
            label: A(($ = g.props) == null ? void 0 : $.header),
            children: (g.children || []).map((z, _) => e.createElement(pt, { key: z.nodeId || _, node: z }))
          };
        });
        return e.createElement(t.Collapse, { items: p });
      }
      return e.createElement("div", null, ...m.map((p, g) => {
        var f;
        return e.createElement("details", { key: g }, e.createElement("summary", { style: { fontWeight: 600, cursor: "pointer", padding: "4px 0" } }, A((f = p.props) == null ? void 0 : f.header)), e.createElement("div", { style: { paddingLeft: 12 } }, (p.children || []).map((E, $) => e.createElement(pt, { key: E.nodeId || $, node: E }))));
      }));
    }
    case "AccordionItem":
      return e.createElement("div", null, r());
    case "JsonDebug":
      return e.createElement("details", { style: { margin: "4px 0", fontSize: 12 } }, e.createElement("summary", null, A(n.label) || "Debug JSON"), e.createElement("pre", { style: { fontSize: 12, padding: 8, background: "var(--ant-color-fill-tertiary, rgba(0,0,0,0.04))", borderRadius: 4, overflow: "auto" } }, JSON.stringify(n.data ?? n, null, 2)));
    default:
      return e.createElement("div", { style: { padding: 8, border: "1px dashed var(--ant-color-border, #d9d9d9)", borderRadius: 8, fontSize: 12, color: we.muted, fontFamily: "monospace" } }, `Unknown component: ${l.kind}`);
  }
}
const nt = ["#1677ff", "#52c41a", "#faad14", "#ff4d4f", "#722ed1", "#13c2c2", "#eb2f96"];
function vo({ props: e }) {
  var $, z;
  const t = (z = ($ = window.QwenPaw) == null ? void 0 : $.host) == null ? void 0 : z.React;
  if (!t) return null;
  const l = A(e.chart) || "line", n = A(e.title), a = Xe(e.categories).map((_) => A(_)), r = Xe(e.series), o = xe(e.height) || 200, c = e.showLegend !== !1, s = 400, d = r.map((_, O) => {
    const D = _, H = Xe(D.values).map((L) => xe(L));
    return { name: A(D.name) || `Series ${O + 1}`, values: H };
  });
  if (a.length === 0 || d.length === 0)
    return t.createElement("div", { style: { padding: 12, color: we.muted, fontSize: 12 } }, "Chart: no data");
  if (l === "pie") {
    const _ = d[0].values.map((W) => Math.abs(W)), O = _.reduce((W, T) => W + T, 0) || 1, D = s / 2, H = o / 2, L = Math.min(s, o) / 2 - 20;
    let I = -Math.PI / 2;
    const G = _.map((W, T) => {
      const x = W / O * 2 * Math.PI, S = D + L * Math.cos(I), M = H + L * Math.sin(I), k = D + L * Math.cos(I + x), V = H + L * Math.sin(I + x), Q = x > Math.PI ? 1 : 0, j = `M ${D} ${H} L ${S} ${M} A ${L} ${L} 0 ${Q} 1 ${k} ${V} Z`;
      return I += x, { path: j, color: nt[T % nt.length], label: a[T] || `#${T + 1}`, val: W };
    });
    return t.createElement(
      "div",
      { style: { margin: "4px 0" } },
      n ? t.createElement("div", { style: { fontSize: 13, fontWeight: 600, marginBottom: 4 } }, n) : null,
      t.createElement(
        "svg",
        { width: s, height: o, style: { maxWidth: "100%" } },
        ...G.map((W, T) => t.createElement("path", { key: T, d: W.path, fill: W.color, stroke: "#fff", strokeWidth: 1 }))
      ),
      c ? t.createElement(
        "div",
        { style: { display: "flex", flexWrap: "wrap", gap: 8, marginTop: 4, fontSize: 11 } },
        ...G.map((W, T) => t.createElement(
          "span",
          { key: T, style: { display: "flex", alignItems: "center", gap: 4 } },
          t.createElement("span", { style: { display: "inline-block", width: 10, height: 10, borderRadius: 2, background: W.color } }),
          `${W.label}: ${W.val}`
        ))
      ) : null
    );
  }
  const u = d.flatMap((_) => _.values), h = Math.max(...u, 0), w = Math.min(...u, 0), m = h - w || 1, p = a.length > 0 ? (s - 40) / (a.length * d.length) - 2 : 0, g = a.length > 1 ? (s - 40) / (a.length - 1) : 0, f = (_) => o - 20 - (_ - w) / m * (o - 40), E = (_) => 30 + _ * g;
  return t.createElement(
    "div",
    { style: { margin: "4px 0" } },
    n ? t.createElement("div", { style: { fontSize: 13, fontWeight: 600, marginBottom: 4 } }, n) : null,
    t.createElement(
      "svg",
      { width: s, height: o, style: { maxWidth: "100%" } },
      ...[0, 0.25, 0.5, 0.75, 1].map((_, O) => {
        const D = o - 20 - _ * (o - 40);
        return t.createElement("line", { key: `g${O}`, x1: 30, y1: D, x2: s - 10, y2: D, stroke: "var(--ant-color-border-secondary, #f0f0f0)", strokeWidth: 1 });
      }),
      ...a.map((_, O) => t.createElement("text", { key: `x${O}`, x: E(O), y: o - 6, fontSize: 10, fill: we.muted, textAnchor: "middle" }, _.length > 6 ? _.slice(0, 6) + "…" : _)),
      ...d.map((_, O) => {
        const D = nt[O % nt.length];
        if (l === "bar")
          return _.values.map((I, G) => t.createElement("rect", {
            key: `b${O}-${G}`,
            x: E(G) + O * (p + 2) - p / 2,
            y: f(I),
            width: p,
            height: o - 20 - f(I),
            fill: D,
            rx: 2
          }));
        const H = _.values.map((I, G) => `${E(G)},${f(I)}`).join(" "), L = [t.createElement("polyline", { key: `l${O}`, points: H, fill: "none", stroke: D, strokeWidth: 2 })];
        if (l === "area") {
          const I = `${E(0)},${o - 20} ${H} ${E(_.values.length - 1)},${o - 20}`;
          L.unshift(t.createElement("polygon", { key: `a${O}`, points: I, fill: D, opacity: 0.15 }));
        }
        return L;
      })
    ),
    c ? t.createElement(
      "div",
      { style: { display: "flex", flexWrap: "wrap", gap: 8, marginTop: 4, fontSize: 11 } },
      ...d.map((_, O) => t.createElement(
        "span",
        { key: O, style: { display: "flex", alignItems: "center", gap: 4 } },
        t.createElement("span", { style: { display: "inline-block", width: 10, height: 10, borderRadius: 2, background: nt[O % nt.length] } }),
        _.name
      ))
    ) : null
  );
}
function Vt(e) {
  var c;
  const t = (c = window.QwenPaw) == null ? void 0 : c.host, l = t == null ? void 0 : t.React;
  if (!l) return null;
  const { useState: n, useEffect: a } = l, [r, o] = n(
    Mt(e.src) || (Ot(e.src) ? e.src : null)
  );
  return a(() => {
    if (!e.src) return;
    if (Ot(e.src)) {
      o(e.src);
      return;
    }
    const s = Mt(e.src);
    if (s) {
      o(s);
      return;
    }
    let d = !1;
    return go(e.src).then((u) => {
      d || o(u);
    }), () => {
      d = !0;
    };
  }, [e.src]), r ? l.createElement("img", {
    src: r,
    alt: e.alt || "",
    style: e.style || {},
    onError: () => {
      console.warn("[ugsci.genui] Image failed to load:", e.src);
    }
  }) : l.createElement("div", {
    style: {
      ...e.style || {},
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      minHeight: 80,
      color: we.muted,
      fontSize: 12,
      background: "var(--ant-color-fill-tertiary, rgba(0,0,0,0.04))",
      borderRadius: 8
    }
  }, "Loading image…");
}
function bo({ data: e }) {
  var s, d;
  const t = (s = window.QwenPaw) == null ? void 0 : s.host, l = t == null ? void 0 : t.React;
  if (!l) return null;
  const n = ao(), a = ((d = t.getCurrentSessionId) == null ? void 0 : d.call(t)) || "", r = e.output, o = l.useMemo(
    () => Oa(r),
    [r]
  );
  l.useEffect(() => {
    o.length > 0 && a && n.hydrateFromMessages(a, r);
  }, [o, a]);
  const c = Object.values(n.snapshots).filter((u) => u.sessionId === a).filter(
    (u) => (
      // Only include snapshots whose ui_id appears in this response's results
      o.some((h) => h.ui_id === u.uiId)
    )
  ).sort((u, h) => u.updatedAt - h.updatedAt);
  return c.length === 0 ? null : l.createElement(
    "div",
    { className: "qwenpaw-genui-inline", style: { marginTop: 8, marginBottom: 8 } },
    ...c.map(
      (u) => l.createElement(
        "div",
        {
          key: mt(u.sessionId, u.uiId),
          className: "qwenpaw-genui-tree",
          style: { border: "1px solid var(--ant-color-border-secondary, #f0f0f0)", borderRadius: 12, padding: 16, marginBottom: 8, background: "var(--ant-color-bg-container, #fff)" }
        },
        l.createElement(pt, { node: u.tree.root })
      )
    )
  );
}
function wo(e, t) {
  var n, a, r;
  const l = "ugsci";
  (n = e.chat) != null && n.toolRender && (e.chat.toolRender(l, "emit_ui_tree", _t), e.chat.toolRender(l, "emit_ui_patch", _t), e.chat.toolRender(l, "list_ui_components", _t), e.chat.toolRender(l, "get_genui_guide", _t), console.info("[ugsci.genui] Registered 4 tool card renderers")), (r = (a = e.chat) == null ? void 0 : a.response) != null && r.append && (e.chat.response.append(
    l,
    (o) => t.createElement(no, null, t.createElement(bo, { data: o.data })),
    { id: "ugsci.genui.response-append", order: 50 }
  ), console.info("[ugsci.genui] Registered response.append slot"));
}
function So() {
  var s, d, u;
  const e = window.QwenPaw;
  if (!(e != null && e.menu) || !(e != null && e.route)) {
    console.warn(
      "[ugsci] QwenPaw.menu/route API not available — plugin disabled"
    );
    return;
  }
  const t = P().React, l = "ugsci";
  (d = (s = e.chat) == null ? void 0 : s.rightHeader) != null && d.add ? (e.chat.rightHeader.add(l, t.createElement(Zr), {
    id: "ugsci.welcome-injector",
    order: -1
    // render before other right-header items (invisible anyway)
  }), console.info("[ugsci] WelcomePromptsInjector registered via rightHeader")) : console.warn(
    "[ugsci] QP.chat.rightHeader.add not available — agent-specific welcome prompts disabled"
  );
  const n = P().antdIcons || {}, a = n.UserSwitchOutlined, r = n.ToolOutlined, o = n.ShopOutlined;
  e.route.add(l, {
    id: "ugsci.experts",
    path: "/ugsci-experts",
    component: gr
  }), e.menu.add(l, {
    id: "ugsci.experts",
    location: "primary.agentScoped",
    label: () => "专家·协作",
    icon: a ? t.createElement(a, { style: { fontSize: 16 } }) : void 0,
    route: "ugsci.experts",
    order: 5,
    visible: () => ct()
  }), e.route.add(l, {
    id: "ugsci.tools-skills",
    path: "/ugsci-tools-skills",
    component: wa
  }), e.menu.add(l, {
    id: "ugsci.tools-skills",
    location: "primary.agentScoped",
    label: () => "工具·技能",
    icon: r ? t.createElement(r, { style: { fontSize: 16 } }) : void 0,
    route: "ugsci.tools-skills",
    order: 6,
    visible: () => ct()
  }), e.route.add(l, {
    id: "ugsci.capabilities",
    path: "/ugsci-capabilities",
    component: Ar
  }), e.route.add(l, {
    id: "ugsci.skills-center",
    path: "/ugsci-skills",
    component: $r
  }), e.route.add(l, {
    id: "ugsci.market",
    path: "/ugsci-market",
    component: Yr
  }), e.menu.add(l, {
    id: "ugsci.market",
    location: "primary.agentScoped",
    label: () => "市场",
    icon: o ? t.createElement(o, { style: { fontSize: 16 } }) : void 0,
    route: "ugsci.market",
    order: 7,
    visible: () => ct()
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
  for (const h of c) {
    try {
      const m = e.menu.snapshot("primary.agentScoped").find((p) => p.id === h);
      m && e.menu.replace(l, h, {
        ...m,
        visible: () => !ct()
      });
    } catch {
    }
    try {
      const m = e.menu.snapshot("primary.settings").find((p) => p.id === h);
      m && e.menu.replace(l, h, {
        ...m,
        visible: () => !ct()
      });
    } catch {
    }
  }
  wo(e, t), console.info(
    "[ugsci] Plugin registered: unified Tools & Skills center + compatibility routes, simple-mode navigation active"
  );
}
function en() {
  try {
    So();
  } catch (e) {
    console.error("[ugsci] Failed to build plugin:", e), setTimeout(en, 500);
  }
}
var aa;
if ((aa = window.QwenPaw) != null && aa.host)
  en();
else {
  const e = setInterval(() => {
    var t;
    (t = window.QwenPaw) != null && t.host && (clearInterval(e), en());
  }, 200);
  setTimeout(() => clearInterval(e), 1e4);
}
