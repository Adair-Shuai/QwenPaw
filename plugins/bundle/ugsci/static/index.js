function S() {
  var t;
  const e = (t = window.QwenPaw) == null ? void 0 : t.host;
  if (!e) throw new Error("[ugsci] QwenPaw.host not available");
  return e;
}
function _a() {
  try {
    return S().getApiToken() || "";
  } catch {
    return "";
  }
}
function bt(e) {
  return S().getApiUrl(e);
}
function Ia(e) {
  const t = _a();
  return {
    "Content-Type": "application/json",
    ...t ? { Authorization: `Bearer ${t}` } : {},
    ...e
  };
}
function za(e) {
  const t = new Headers(e), l = {};
  return t.forEach((a, n) => {
    l[n] = a;
  }), l;
}
function je(e, t) {
  const l = S(), a = za(t == null ? void 0 : t.headers);
  return l.fetch ? l.fetch(e, { ...t, headers: a }) : fetch(l.getApiUrl(e), {
    ...t,
    headers: { ...Ia(), ...a }
  });
}
const st = /* @__PURE__ */ new Map(), Aa = 15e3;
function Pa(e) {
  return e ? e instanceof Headers ? e.get("X-Agent-Id") || e.get("x-agent-id") || "" : e["X-Agent-Id"] || e["x-agent-id"] || "" : "";
}
function $a(e, t, l) {
  return `${e}:${t}:${l}`;
}
function ot() {
  st.clear();
}
function Bt(e) {
  for (const [t, l] of st)
    (e ? l.agentId === e : l.agentId) && st.delete(t);
}
async function ie(e, t) {
  const l = ((t == null ? void 0 : t.method) || "GET").toUpperCase(), { bypassCache: a, ...n } = t || {}, r = Pa(
    n.headers
  ), s = $a(l, e, r);
  if (l !== "GET" && (r ? Bt(r) : ot()), l === "GET" && !a) {
    const m = st.get(s);
    if (m && Date.now() - m.ts < Aa)
      return m.data;
  }
  const c = await je(e, n);
  if (!c.ok) {
    const m = await c.text().catch(() => "");
    throw new Error(m || `HTTP ${c.status}`);
  }
  if (c.status === 204) return null;
  const i = await c.json();
  return l === "GET" && st.set(s, {
    data: i,
    ts: Date.now(),
    agentId: r || void 0
  }), i;
}
const Pe = {
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
function St(e, t) {
  const l = S();
  return l.ReactMarkdown && l.remarkGfm ? t.createElement(
    l.ReactMarkdown,
    { remarkPlugins: [l.remarkGfm] },
    e
  ) : e.replace(/\*\*(.+?)\*\*/g, "$1").replace(/\*(.+?)\*/g, "$1").replace(/`(.+?)`/g, "$1").replace(/^#+\s*/gm, "").replace(/^[-*]\s+/gm, "• ");
}
function wt({
  title: e,
  subtitle: t,
  extra: l
}) {
  const a = S().React, { Space: n } = S().antd;
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
        { style: { marginTop: 4, fontSize: 13, color: "#8c8c8c" } },
        t
      ) : null
    ),
    l ? a.createElement(n, null, l) : null
  );
}
async function xt() {
  const e = await ie("/agents");
  return (e == null ? void 0 : e.agents) || [];
}
async function jt(e) {
  return ie(
    `/agents/${encodeURIComponent(e)}`
  );
}
async function kt(e) {
  return await ie(
    `/agents/${encodeURIComponent(e)}/skills`
  ) || [];
}
async function Ct(e = !1) {
  return await ie(`/skills/pool${e ? "?summary=true" : ""}`) || [];
}
async function Oa(e) {
  const t = await ie(
    `/skills/pool/${encodeURIComponent(e)}/content`
  );
  return (t == null ? void 0 : t.content) || "";
}
async function Ra() {
  return await ie(
    "/skills/workspaces"
  ) || [];
}
function Ze(e, t = "") {
  return `/agents/${encodeURIComponent(e)}/skills${t}`;
}
function jn(e) {
  var l;
  const t = [];
  for (const a of e) {
    if (a.enabled === !1) continue;
    const n = (l = a.description) == null ? void 0 : l.trim();
    if (!n) continue;
    const r = (a.name || n).length > 20 ? (a.name || n).substring(0, 18) + "…" : a.name || n;
    let s = n;
    if (s = s.replace(/\*\*(.+?)\*\*/g, "$1").replace(/\*(.+?)\*/g, "$1").replace(/`(.+?)`/g, "$1").replace(/^#+\s*/gm, "").trim(), /^(用于|帮助|提供|支持|实现|完成|分析|计算|生成|创建|检查)/.test(s) ? s = `请${s}` : /^(a |an |the )/i.test(s) ? s = `Help me with ${s}` : /[。？！.?!]$/.test(s) || (s = `帮我${s}`), s.length > 80 && (s = s.substring(0, 77) + "..."), t.push({ label: r, value: s }), t.length >= 4) break;
  }
  return t;
}
async function Ma(e) {
  return await ie("/workspace/files", {
    headers: { "X-Agent-Id": e }
  }) || [];
}
async function ht(e, t, l) {
  return ie(`/workspace/files/${encodeURIComponent(t)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify({ content: l })
  });
}
async function La(e, t, l, a) {
  return ie("/workspace/prompt-files", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify({ filename: t, content: l, enable: a })
  });
}
const Ba = /* @__PURE__ */ new Set([
  "CON",
  "PRN",
  "AUX",
  "NUL",
  ...Array.from({ length: 9 }, (e, t) => `COM${t + 1}`),
  ...Array.from({ length: 9 }, (e, t) => `LPT${t + 1}`)
]);
function ja(e) {
  let t = e.trim();
  if (!t) throw new Error("请输入文件名");
  if (/[\\/]/.test(t)) throw new Error("文件名不能包含路径分隔符");
  if (/[<>:\"|?*\u0000-\u001f]/.test(t))
    throw new Error("文件名包含系统不支持的字符");
  if (/[ .]$/.test(t)) throw new Error("文件名不能以空格或句点结尾");
  t.toLowerCase().endsWith(".md") ? t = `${t.slice(0, -3)}.md` : t += ".md";
  const l = t.split(".", 1)[0].toUpperCase();
  if (!t.slice(0, -3)) throw new Error("文件名不能为空");
  if (Ba.has(l))
    throw new Error("该文件名是系统保留名称，请更换");
  if (new TextEncoder().encode(t).length > 255)
    throw new Error("文件名过长");
  return t;
}
async function Ua(e, t) {
  const l = await jt(e);
  l.system_prompt_files = t, await ie(`/agents/${encodeURIComponent(e)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(l)
  });
}
async function Ut(e, t) {
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
async function Un(e, t) {
  await ie(
    Ze(e, `/${encodeURIComponent(t)}/enable`),
    {
      method: "POST"
    }
  );
}
async function Nt(e, t) {
  await ie(Ze(e, `/${encodeURIComponent(t)}`), {
    method: "DELETE"
  });
}
async function Na(e, t) {
  return ie(Ze(e, "/batch-enable"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(t)
  });
}
async function Da(e, t) {
  return ie(Ze(e, "/batch-disable"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(t)
  });
}
async function Fa(e, t) {
  return ie(Ze(e, "/batch-delete"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(t)
  });
}
async function Dt(e) {
  return await ie("/mcp", {
    headers: { "X-Agent-Id": e }
  }) || [];
}
async function Nn(e, t) {
  await ie(`/mcp/${encodeURIComponent(t)}`, {
    method: "DELETE",
    headers: { "X-Agent-Id": e }
  });
}
async function Ft(e, t) {
  return ie("/mcp", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify(t)
  });
}
async function Ga(e, t) {
  return ie(
    `/mcp/toggle/${encodeURIComponent(t)}`,
    {
      method: "PATCH",
      headers: { "X-Agent-Id": e }
    }
  );
}
async function Dn(e, t) {
  await ie(
    Ze(e, `/${encodeURIComponent(t)}/disable`),
    {
      method: "POST"
    }
  );
}
async function Ha(e) {
  await ie(`/skills/pool/${encodeURIComponent(e)}`, {
    method: "DELETE"
  });
}
function Wa(e) {
  const t = (e || "").trim();
  if (!t) return { number: 6, unit: "h" };
  const l = t.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/i);
  if (!l) return { number: 6, unit: "h" };
  const a = parseInt(l[1] || "0", 10), n = parseInt(l[2] || "0", 10), r = parseInt(l[3] || "0", 10), s = a * 60 + n + Math.round(r / 60);
  return s <= 0 ? { number: 6, unit: "h" } : s >= 60 && s % 60 === 0 ? { number: s / 60, unit: "h" } : { number: s, unit: "m" };
}
function Ja(e) {
  return e.unit === "h" ? `${e.number}h` : `${e.number}m`;
}
async function Ka(e) {
  return ie("/config/heartbeat", {
    headers: { "X-Agent-Id": e }
  });
}
async function qa(e, t) {
  return ie("/config/heartbeat", {
    method: "PUT",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify(t)
  });
}
async function Xa(e) {
  await ie("/config/heartbeat/run", {
    method: "POST",
    headers: { "X-Agent-Id": e }
  });
}
async function Va(e) {
  return ie("/workspace/running-config", {
    headers: { "X-Agent-Id": e }
  });
}
async function Ya(e, t) {
  return ie("/workspace/running-config", {
    method: "PUT",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify(t)
  });
}
async function Qa(e) {
  return (await ie("/workspace/language", {
    headers: { "X-Agent-Id": e }
  })).language || "zh";
}
async function Za(e, t) {
  await ie("/workspace/language", {
    method: "PUT",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify({ language: t })
  });
}
async function el() {
  return (await ie("/config/user-timezone")).timezone || "UTC";
}
async function tl(e) {
  await ie("/config/user-timezone", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ timezone: e })
  });
}
async function nl(e) {
  return await ie("/workspace/system-prompt-files", {
    headers: { "X-Agent-Id": e }
  }) || [];
}
const vn = ["AGENTS.md", "SOUL.md", "PROFILE.md"];
function bn({
  items: e,
  max: t = 5,
  color: l = "blue",
  emptyText: a = "无"
}) {
  const n = S().React, { Tag: r } = S().antd;
  return !e || e.length === 0 ? n.createElement(
    "span",
    { style: { fontSize: 12, color: "#bfbfbf" } },
    a
  ) : n.createElement(
    "div",
    { style: { display: "flex", flexWrap: "wrap", gap: 4 } },
    ...e.slice(0, t).map(
      (s, c) => n.createElement(
        r,
        { key: c, color: l, style: { fontSize: 11, marginRight: 0 } },
        s
      )
    ),
    e.length > t ? n.createElement(
      r,
      { style: { fontSize: 11, marginRight: 0 } },
      `+${e.length - t}`
    ) : null
  );
}
function Fn({
  open: e,
  onClose: t,
  poolSkills: l,
  installedSkillNames: a,
  loading: n,
  onInstall: r
}) {
  const s = S().React, { useState: c, useEffect: i, useMemo: m } = s, { Modal: u, Button: E, Empty: y, Spin: b, Input: T, Tag: C, Tooltip: x, Typography: I } = S().antd, { CheckOutlined: j, SearchOutlined: F } = S().antdIcons || {}, { Text: G } = I, [H, q] = c([]), [J, O] = c("");
  i(() => {
    e && (q([]), O(""));
  }, [e]);
  const z = m(() => {
    if (!J.trim()) return l;
    const f = J.toLowerCase();
    return l.filter(
      (g) => {
        var $, h;
        return g.name.toLowerCase().includes(f) || (($ = g.description) == null ? void 0 : $.toLowerCase().includes(f)) || ((h = g.tags) == null ? void 0 : h.some((D) => D.toLowerCase().includes(f)));
      }
    );
  }, [l, J]), W = z.filter(
    (f) => !a.includes(f.name)
  ), X = (f) => {
    q(
      (g) => g.includes(f) ? g.filter(($) => $ !== f) : [...g, f]
    );
  }, w = async () => {
    H.length !== 0 && (await r(H), q([]));
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
          G,
          { type: "secondary", style: { fontSize: 13 } },
          `已选择 ${H.length} 个技能`
        ),
        s.createElement(
          "div",
          { style: { display: "flex", gap: 8 } },
          s.createElement(E, { onClick: t }, "取消"),
          s.createElement(
            E,
            {
              type: "primary",
              onClick: w,
              disabled: H.length === 0
            },
            H.length > 0 ? `添加 (${H.length})` : "添加"
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
      s.createElement(T, {
        placeholder: "搜索技能名称、描述或标签...",
        prefix: F ? s.createElement(F) : void 0,
        value: J,
        onChange: (f) => O(f.target.value),
        allowClear: !0,
        style: { flex: 1 }
      }),
      s.createElement(
        E,
        {
          size: "small",
          type: "primary",
          onClick: () => q(W.map((f) => f.name))
        },
        "全选"
      ),
      s.createElement(
        E,
        {
          size: "small",
          onClick: () => q([])
        },
        "清空"
      )
    ),
    // Skill grid (card style matching Skill Center)
    n ? s.createElement(
      "div",
      { style: { textAlign: "center", padding: 40 } },
      s.createElement(b, { size: "large" })
    ) : z.length === 0 ? s.createElement(y, {
      description: J ? "未找到匹配的技能" : "技能池暂无可用技能",
      image: y.PRESENTED_IMAGE_SIMPLE
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
      ...z.map((f) => {
        const g = H.includes(f.name), $ = a.includes(f.name);
        return s.createElement(
          "div",
          {
            key: f.name,
            onClick: () => !$ && X(f.name),
            style: {
              position: "relative",
              padding: "10px 12px",
              border: `1px solid ${g ? "#0072f5" : "#e8e8e8"}`,
              borderRadius: 6,
              cursor: $ ? "not-allowed" : "pointer",
              transition: "all 0.15s ease",
              background: g ? "rgba(0, 114, 245, 0.06)" : $ ? "#fafafa" : "#fff",
              opacity: $ ? 0.5 : 1,
              minHeight: 64
            }
          },
          g ? s.createElement(
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
            j ? s.createElement(j) : "✓"
          ) : null,
          $ ? s.createElement(
            "span",
            {
              style: {
                position: "absolute",
                top: 6,
                right: 8,
                fontSize: 10,
                color: "#bbb"
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
                paddingRight: $ || g ? 24 : 0
              }
            },
            s.createElement(
              "span",
              { style: { fontSize: 16 } },
              f.emoji || "⚡"
            ),
            s.createElement(
              x,
              { title: f.name },
              s.createElement(
                G,
                {
                  strong: !0,
                  style: {
                    fontSize: 13,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap"
                  }
                },
                f.name
              )
            )
          ),
          f.description ? s.createElement(
            "div",
            {
              style: {
                fontSize: 11,
                color: "#8c8c8c",
                overflow: "hidden",
                textOverflow: "ellipsis",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                lineHeight: "1.4"
              }
            },
            f.description
          ) : null,
          f.tags && f.tags.length > 0 ? s.createElement(
            "div",
            {
              style: {
                marginTop: 4,
                display: "flex",
                gap: 2,
                flexWrap: "wrap"
              }
            },
            ...f.tags.slice(0, 2).map(
              (h, D) => s.createElement(
                C,
                {
                  key: D,
                  color: "cyan",
                  style: { fontSize: 10, marginRight: 0 }
                },
                h
              )
            )
          ) : null
        );
      })
    )
  );
}
function Gn({
  agentId: e,
  systemPromptFiles: t,
  onRefresh: l
}) {
  const a = S().React, { useState: n, useEffect: r, useCallback: s, useRef: c } = a, {
    List: i,
    Tag: m,
    Switch: u,
    Button: E,
    Modal: y,
    Input: b,
    Spin: T,
    Empty: C,
    message: x,
    Typography: I,
    Segmented: j,
    Alert: F
  } = S().antd, { FileTextOutlined: G, PlusOutlined: H, EditOutlined: q, ReloadOutlined: J } = S().antdIcons || {}, { Text: O } = I, [z, W] = n([]), [X, w] = n(!0), [f, g] = n(
    t || []
  ), [$, h] = n(!1), [D, Z] = n(null), [M, k] = n(""), [d, ee] = n(""), [U, v] = n(!1), [B, re] = n("source"), V = c(0), Q = s(async () => {
    const te = ++V.current;
    w(!0);
    try {
      const ne = await Ma(e);
      te === V.current && W(ne);
    } catch (ne) {
      te === V.current && (x.error(ne.message || "加载工作区文档失败"), W([]));
    } finally {
      te === V.current && w(!1);
    }
  }, [e]);
  r(() => {
    Q();
  }, [Q]), r(() => {
    g(t || []);
  }, [t]);
  const pe = async (te, ne) => {
    const ge = new Set(f);
    if (ne)
      ge.add(te);
    else {
      if (vn.includes(te) && te === "AGENTS.md") {
        x.warning("AGENTS.md 是核心文件，不能停用");
        return;
      }
      ge.delete(te);
    }
    const be = Array.from(ge);
    g(be);
    try {
      await Ua(e, be), x.success(ne ? "已启用记忆文件" : "已停用记忆文件"), l();
    } catch (Se) {
      x.error(Se.message || "更新失败"), g(t || []);
    }
  }, A = async (te) => {
    try {
      const ne = await ie(
        `/workspace/files/${encodeURIComponent(te)}`,
        { headers: { "X-Agent-Id": e } }
      );
      Z(te), k(ne.content || ""), re("source"), h(!0);
    } catch (ne) {
      x.error(ne.message || "读取文件失败");
    }
  }, _ = () => {
    Z(null), k(""), ee(""), re("source"), h(!0);
  }, le = async () => {
    let te;
    try {
      te = ja(D || d);
    } catch (ne) {
      x.warning(ne.message || "文件名无效");
      return;
    }
    if (!M.trim()) {
      x.warning("Markdown 文档不能为空");
      return;
    }
    if (new TextEncoder().encode(M).length > 1024 * 1024) {
      x.warning("Markdown 文档不能超过 1 MB");
      return;
    }
    v(!0);
    try {
      if (D)
        await ht(e, te, M);
      else {
        const ne = await La(
          e,
          te,
          M,
          !0
        );
        g(ne.system_prompt_files);
      }
      x.success("保存成功"), h(!1), Q(), l();
    } catch (ne) {
      const ge = ne != null && ne.message ? `：${ne.message}` : "";
      x.error(
        D ? (ne == null ? void 0 : ne.message) || "保存失败" : `创建并挂载失败，服务端已回滚文件${ge}`
      );
    } finally {
      v(!1);
    }
  };
  return X ? a.createElement(
    "div",
    { style: { textAlign: "center", padding: 40 } },
    a.createElement(T, { size: "large" })
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
        G ? a.createElement(G, {
          style: { fontSize: 14, color: "#1677ff" }
        }) : null,
        a.createElement(
          O,
          { strong: !0 },
          `工作区文档 (${z.length})`
        ),
        a.createElement(
          O,
          { type: "secondary", style: { fontSize: 12 } },
          `· ${f.length} 个已挂载到系统提示`
        )
      ),
      a.createElement(
        "div",
        { style: { display: "flex", gap: 8 } },
        a.createElement(
          E,
          {
            size: "small",
            icon: J ? a.createElement(J) : void 0,
            onClick: Q
          },
          "刷新"
        ),
        a.createElement(
          E,
          {
            type: "primary",
            size: "small",
            icon: H ? a.createElement(H) : void 0,
            onClick: _
          },
          "新建 Markdown 文档"
        )
      )
    ),
    z.length === 0 ? a.createElement(C, {
      description: "暂无 Markdown 文档，点击「新建 Markdown 文档」添加",
      image: C.PRESENTED_IMAGE_SIMPLE
    }) : a.createElement(i, {
      dataSource: z,
      renderItem: (te) => {
        const ne = f.includes(te.filename), ge = vn.includes(te.filename);
        return a.createElement(
          i.Item,
          {
            actions: [
              a.createElement(
                E,
                {
                  type: "link",
                  size: "small",
                  icon: q ? a.createElement(q) : void 0,
                  onClick: () => A(te.filename)
                },
                "编辑"
              )
            ]
          },
          a.createElement(i.Item.Meta, {
            avatar: a.createElement(G, {
              style: {
                fontSize: 20,
                color: ne ? "#1677ff" : "#bfbfbf"
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
              a.createElement(O, null, te.filename),
              ge ? a.createElement(
                m,
                { color: "default", style: { fontSize: 10 } },
                "内置"
              ) : a.createElement(
                m,
                { color: "cyan", style: { fontSize: 10 } },
                "工作文档"
              )
            ),
            description: a.createElement(
              "div",
              { style: { fontSize: 12 } },
              `${(te.size / 1024).toFixed(1)} KB · 修改于 ${new Date(te.modified_time).toLocaleString()}`
            )
          }),
          a.createElement(u, {
            checked: ne,
            size: "small",
            onChange: (be) => pe(te.filename, be)
          })
        );
      }
    }),
    // Edit/New file modal
    a.createElement(
      y,
      {
        open: $,
        onCancel: () => h(!1),
        title: D ? `编辑 ${D}` : "新建 Markdown 文档",
        width: 700,
        onOk: le,
        confirmLoading: U,
        okText: "保存"
      },
      D ? null : a.createElement(
        "div",
        { style: { marginBottom: 12 } },
        a.createElement(b, {
          placeholder: "文件名（如：油藏工程记忆库.md）",
          value: d,
          onChange: (te) => ee(te.target.value),
          addonAfter: d.endsWith(".md") ? "" : ".md"
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
          value: B,
          options: [
            { label: "源码", value: "source" },
            { label: "预览", value: "preview" }
          ],
          onChange: (te) => re(te)
        }),
        a.createElement(
          O,
          { type: "secondary", style: { fontSize: 12 } },
          `${M.length} 字符 · 约 ${Math.ceil(M.length / 4)} tokens · ${D && f.includes(D) ? "已挂载" : D ? "未挂载" : "保存后自动挂载"}`
        )
      ),
      M.trim() ? null : a.createElement(F, {
        type: "warning",
        showIcon: !0,
        message: "文档内容为空，保存前需要填写 Markdown 内容",
        style: { marginBottom: 10 }
      }),
      B === "source" ? a.createElement(b.TextArea, {
        value: M,
        onChange: (te) => k(te.target.value),
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
            border: "1px solid #d9d9d9",
            borderRadius: 6,
            background: "var(--ant-color-bg-container, #fff)"
          }
        },
        St(M, a)
      )
    )
  );
}
function al({
  skills: e,
  agentId: t
}) {
  const l = S().React, { useMemo: a } = l, {
    List: n,
    Tag: r,
    Typography: s,
    Empty: c,
    Button: i,
    message: m
  } = S().antd, { ThunderboltOutlined: u, CopyOutlined: E } = S().antdIcons || {}, { Text: y } = s, b = a(() => jn(e), [e]), T = (x) => {
    try {
      const I = S();
      I.setSelectedAgent && I.setSelectedAgent(t);
    } catch {
    }
    try {
      sessionStorage.setItem("ugsci_pending_prompt", x.value);
    } catch {
    }
    window.history.pushState({}, "", "/chat"), window.dispatchEvent(new PopStateEvent("popstate"));
  }, C = (x) => {
    var I;
    (I = navigator.clipboard) == null || I.writeText(x.value).then(() => {
      m.success("已复制到剪贴板");
    });
  };
  return b.length === 0 ? l.createElement(c, {
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
        `推荐提问 (${b.length})`
      ),
      l.createElement(
        y,
        { type: "secondary", style: { fontSize: 12 } },
        "· 从技能描述中自动提取"
      )
    ),
    l.createElement(n, {
      dataSource: b,
      renderItem: (x, I) => l.createElement(
        n.Item,
        {
          actions: [
            l.createElement(
              i,
              {
                type: "link",
                size: "small",
                icon: E ? l.createElement(E) : void 0,
                onClick: () => C(x)
              },
              "复制"
            )
          ]
        },
        l.createElement(n.Item.Meta, {
          avatar: l.createElement(
            r,
            { color: "blue", style: { borderRadius: "50%" } },
            `${I + 1}`
          ),
          title: l.createElement(
            "div",
            {
              style: {
                cursor: "pointer",
                color: "#1677ff"
              },
              onClick: () => T(x)
            },
            x.value
          ),
          description: l.createElement(
            y,
            { type: "secondary", style: { fontSize: 12 } },
            x.label
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
}, Hn = { marginBottom: 16 }, Wn = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "0 16px",
  marginBottom: 16
}, He = {
  fontSize: 13,
  fontWeight: 600,
  color: "rgba(0,0,0,0.85)",
  marginBottom: 12,
  paddingBottom: 8,
  borderBottom: "1px solid #f0f0f0"
}, Jn = {
  fontSize: 12,
  color: "rgba(0,0,0,0.45)",
  marginLeft: 8
};
function ll({ agentId: e }) {
  const t = S().React, { useState: l, useEffect: a, useCallback: n } = t, {
    Switch: r,
    InputNumber: s,
    Select: c,
    Button: i,
    Spin: m,
    Space: u,
    Typography: E,
    message: y
  } = S().antd, { PlayCircleOutlined: b, SaveOutlined: T } = S().antdIcons || {}, { Text: C } = E, [x, I] = l(!0), [j, F] = l(!1), [G, H] = l(!1), [q, J] = l(!1), [O, z] = l(6), [W, X] = l("h"), [w, f] = l("main"), [g, $] = l(300), [h, D] = l(!1), [Z, M] = l("08:00"), [k, d] = l("22:00"), ee = n(async () => {
    var Q, pe;
    I(!0);
    try {
      const A = await Ka(e), _ = Wa(A.every ?? "6h");
      J(A.enabled ?? !1), z(_.number), X(_.unit), f(A.target ?? "main"), $(A.timeoutSeconds ?? 300), D(!!A.activeHours), M(((Q = A.activeHours) == null ? void 0 : Q.start) ?? "08:00"), d(((pe = A.activeHours) == null ? void 0 : pe.end) ?? "22:00");
    } catch (A) {
      y.error(A.message || "加载心跳配置失败");
    } finally {
      I(!1);
    }
  }, [e]);
  a(() => {
    ee();
  }, [ee]);
  const U = async () => {
    F(!0);
    try {
      await qa(e, {
        enabled: q,
        every: Ja({ number: O, unit: W }),
        target: w,
        timeoutSeconds: g,
        activeHours: h && Z && k ? { start: Z, end: k } : void 0
      }), y.success("心跳配置已保存");
    } catch (Q) {
      y.error(Q.message || "保存心跳配置失败");
    } finally {
      F(!1);
    }
  }, v = async () => {
    H(!0);
    try {
      await Xa(e), y.success("已触发心跳检查");
    } catch (Q) {
      y.error(Q.message || "触发心跳失败");
    } finally {
      H(!1);
    }
  };
  if (x)
    return t.createElement(
      "div",
      { style: { textAlign: "center", padding: 40 } },
      t.createElement(m, { size: "large" })
    );
  const B = (Q, pe, A) => t.createElement(
    "div",
    { style: Hn },
    t.createElement("div", { style: Ye }, Q),
    pe,
    A ? t.createElement(
      C,
      { type: "secondary", style: Jn },
      A
    ) : null
  ), re = (Q, pe, A, _) => t.createElement(
    "div",
    { style: Wn },
    t.createElement(
      "div",
      null,
      t.createElement("div", { style: Ye }, Q),
      pe
    ),
    t.createElement(
      "div",
      null,
      t.createElement("div", { style: Ye }, A),
      _
    )
  ), { Divider: V } = S().antd;
  return t.createElement(
    "div",
    { style: { paddingBottom: 8 } },
    // ── Section: 基本设置 ──
    t.createElement("div", { style: He }, "基本设置"),
    B(
      "启用心跳",
      t.createElement(r, {
        checked: q,
        onChange: (Q) => J(Q)
      }),
      q ? "已启用，专家将定期自检" : "已停用"
    ),
    re(
      "检查频率",
      t.createElement(
        u,
        null,
        t.createElement(s, {
          min: 1,
          value: O,
          onChange: (Q) => z(Q ?? 1),
          style: { width: "100%" }
        }),
        t.createElement(c, {
          value: W,
          onChange: (Q) => X(Q),
          style: { width: 90 },
          options: [
            { value: "m", label: "分钟" },
            { value: "h", label: "小时" }
          ]
        })
      ),
      "心跳目标",
      t.createElement(c, {
        value: w,
        onChange: (Q) => f(Q),
        style: { width: "100%" },
        options: [
          { value: "main", label: "主会话 (main)" },
          { value: "last", label: "最近会话 (last)" },
          { value: "inbox", label: "收件箱 (inbox)" }
        ]
      })
    ),
    B(
      "超时时间 (秒)",
      t.createElement(s, {
        min: 1,
        max: 3600,
        value: g,
        onChange: (Q) => $(Q ?? 300),
        style: { width: 200 }
      })
    ),
    // ── Section: 活跃时段 ──
    t.createElement(V, { style: { margin: "8px 0 16px" } }),
    t.createElement("div", { style: He }, "活跃时段"),
    B(
      "启用活跃时段限制",
      t.createElement(r, {
        checked: h,
        onChange: (Q) => D(Q)
      }),
      "仅在指定时段内触发心跳"
    ),
    h ? re(
      "开始时间",
      t.createElement("input", {
        type: "time",
        value: Z,
        onChange: (Q) => M(Q.target.value),
        style: {
          width: "100%",
          padding: "4px 11px",
          borderRadius: 6,
          border: "1px solid #d9d9d9",
          fontSize: 14
        }
      }),
      "结束时间",
      t.createElement("input", {
        type: "time",
        value: k,
        onChange: (Q) => d(Q.target.value),
        style: {
          width: "100%",
          padding: "4px 11px",
          borderRadius: 6,
          border: "1px solid #d9d9d9",
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
          icon: T ? t.createElement(T) : void 0,
          loading: j,
          onClick: U,
          style: Pe
        },
        "保存配置"
      ),
      t.createElement(
        i,
        {
          icon: b ? t.createElement(b) : void 0,
          loading: G,
          onClick: v
        },
        "立即执行"
      )
    )
  );
}
function rl({
  agentId: e,
  onRefresh: t
}) {
  const l = S().React, { useState: a, useEffect: n, useCallback: r } = l, {
    List: s,
    Tag: c,
    Switch: i,
    Button: m,
    Empty: u,
    Spin: E,
    Typography: y,
    message: b
  } = S().antd, { PlusOutlined: T, ReloadOutlined: C, DeleteOutlined: x } = S().antdIcons || {}, { Text: I, Paragraph: j } = y, [F, G] = a([]), [H, q] = a(!0), [J, O] = a(!1), [z, W] = a([]), [X, w] = a(!1), f = r(async () => {
    q(!0);
    try {
      const M = await kt(e);
      G(M);
    } catch (M) {
      b.error(M.message || "加载技能失败"), G([]);
    } finally {
      q(!1);
    }
  }, [e]);
  n(() => {
    f();
  }, [f]);
  const g = async () => {
    O(!0), w(!0);
    try {
      const M = await Ct(!0);
      W(M);
    } catch (M) {
      b.error(M.message || "加载技能池失败");
    } finally {
      w(!1);
    }
  }, $ = async (M) => {
    let k = 0, d = 0;
    for (const ee of M)
      try {
        await Ut(e, ee), k++;
      } catch {
        d++;
      }
    k > 0 ? (b.success(
      `成功添加 ${k} 个技能${d > 0 ? `，${d} 个失败` : ""}`
    ), f(), t()) : d > 0 && b.error("添加技能失败"), O(!1);
  }, h = async (M, k) => {
    try {
      k ? await Un(e, M.name) : await Dn(e, M.name), b.success(k ? "已启用" : "已停用"), f(), t();
    } catch (d) {
      b.error(d.message || "操作失败");
    }
  }, D = async (M) => {
    try {
      await Nt(e, M), b.success(`技能「${M}」已移除`), f(), t();
    } catch (k) {
      b.error(k.message || "移除技能失败");
    }
  };
  if (H)
    return l.createElement(
      "div",
      { style: { textAlign: "center", padding: 40 } },
      l.createElement(E, { size: "large" })
    );
  const Z = F.filter((M) => M.enabled !== !1);
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
        I,
        { strong: !0 },
        `技能列表 (${F.length}，已启用 ${Z.length})`
      ),
      l.createElement(
        "div",
        { style: { display: "flex", gap: 8 } },
        l.createElement(
          m,
          {
            size: "small",
            icon: C ? l.createElement(C) : void 0,
            onClick: () => {
              ot(), f();
            }
          },
          "刷新"
        ),
        l.createElement(
          m,
          {
            type: "primary",
            size: "small",
            icon: T ? l.createElement(T) : void 0,
            onClick: g,
            style: Pe
          },
          "从技能池添加"
        )
      )
    ),
    F.length === 0 ? l.createElement(u, {
      description: "该专家暂无技能",
      image: u.PRESENTED_IMAGE_SIMPLE
    }) : l.createElement(s, {
      dataSource: F,
      renderItem: (M) => l.createElement(
        s.Item,
        {
          actions: [
            l.createElement(i, {
              key: "toggle",
              size: "small",
              checked: M.enabled !== !1,
              onChange: (k) => h(M, k)
            }),
            l.createElement(
              m,
              {
                key: "del",
                type: "link",
                size: "small",
                danger: !0,
                icon: x ? l.createElement(x) : void 0,
                onClick: () => D(M.name)
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
            M.emoji ? l.createElement(
              "span",
              { style: { fontSize: 16 } },
              M.emoji
            ) : null,
            l.createElement(I, { strong: !0 }, M.name),
            M.version_text ? l.createElement(
              c,
              { style: { fontSize: 10 } },
              `v${M.version_text}`
            ) : null
          ),
          M.description ? l.createElement(
            j,
            {
              type: "secondary",
              style: { fontSize: 12, margin: 0 },
              ellipsis: { rows: 2 }
            },
            M.description
          ) : null
        )
      )
    }),
    l.createElement(Fn, {
      open: J,
      onClose: () => O(!1),
      poolSkills: z,
      installedSkillNames: F.map((M) => M.name),
      loading: X,
      onInstall: $
    })
  );
}
function sl({
  agentId: e,
  onRefresh: t,
  isActive: l
}) {
  const a = S().React, { useState: n, useEffect: r, useCallback: s } = a, {
    List: c,
    Tag: i,
    Button: m,
    Empty: u,
    Spin: E,
    Modal: y,
    Input: b,
    Typography: T,
    message: C
  } = S().antd, { PlusOutlined: x, ReloadOutlined: I, DeleteOutlined: j } = S().antdIcons || {}, { Text: F, Paragraph: G } = T, { TextArea: H } = b, [q, J] = n([]), [O, z] = n(!0), [W, X] = n(!1), [w, f] = n(`{
  "mcpServers": {
    "example-client": {
      "command": "npx",
      "args": ["-y", "@example/mcp-server"],
      "env": {}
    }
  }
}`), [g, $] = n(!1), h = s(async () => {
    z(!0);
    try {
      const k = await Dt(e);
      J(k);
    } catch (k) {
      C.error(k.message || "加载 MCP 失败"), J([]);
    } finally {
      z(!1);
    }
  }, [e]);
  r(() => {
    h();
  }, [h]), r(() => {
    l && h();
  }, [l, h]);
  const D = async (k) => {
    try {
      await Ga(e, k), C.success("已切换 MCP 状态"), h(), t();
    } catch (d) {
      C.error(d.message || "切换失败");
    }
  }, Z = async (k) => {
    try {
      await Nn(e, k), C.success(`MCP「${k}」已移除`), h(), t();
    } catch (d) {
      C.error(d.message || "移除 MCP 失败");
    }
  }, M = async () => {
    $(!0);
    try {
      const k = JSON.parse(w), d = k.mcpServers || k, ee = Object.entries(d);
      if (ee.length === 0) {
        C.warning("未找到 MCP 客户端配置");
        return;
      }
      for (const [U, v] of ee) {
        const B = v, re = B.url ? "streamable_http" : "stdio";
        await Ft(e, {
          client_key: U,
          client: {
            name: B.name || U,
            description: B.description || "",
            enabled: !0,
            transport: re,
            url: B.url || "",
            command: B.command || "",
            args: B.args || [],
            env: B.env || {},
            cwd: B.cwd || "",
            headers: B.headers || {}
          }
        });
      }
      C.success("MCP 客户端已创建"), X(!1), h(), t();
    } catch (k) {
      k instanceof SyntaxError ? C.error("JSON 格式错误：" + k.message) : C.error(k.message || "创建 MCP 失败");
    } finally {
      $(!1);
    }
  };
  return O ? a.createElement(
    "div",
    { style: { textAlign: "center", padding: 40 } },
    a.createElement(E, { size: "large" })
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
      a.createElement(F, { strong: !0 }, `MCP 客户端 (${q.length})`),
      a.createElement(
        "div",
        { style: { display: "flex", gap: 8 } },
        a.createElement(
          m,
          {
            size: "small",
            icon: I ? a.createElement(I) : void 0,
            onClick: () => {
              ot(), h();
            }
          },
          "刷新"
        ),
        a.createElement(
          m,
          {
            type: "primary",
            size: "small",
            icon: x ? a.createElement(x) : void 0,
            onClick: () => X(!0),
            style: Pe
          },
          "添加 MCP"
        )
      )
    ),
    q.length === 0 ? a.createElement(u, {
      description: "该专家暂无 MCP 客户端",
      image: u.PRESENTED_IMAGE_SIMPLE
    }) : a.createElement(c, {
      dataSource: q,
      renderItem: (k) => a.createElement(
        c.Item,
        {
          actions: [
            a.createElement(
              m,
              {
                key: "toggle",
                size: "small",
                onClick: () => D(k.key)
              },
              k.enabled ? "停用" : "启用"
            ),
            a.createElement(
              m,
              {
                key: "del",
                type: "link",
                size: "small",
                danger: !0,
                icon: j ? a.createElement(j) : void 0,
                onClick: () => Z(k.key)
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
            a.createElement(F, { strong: !0 }, k.name || k.key),
            a.createElement(
              i,
              {
                color: k.enabled ? "green" : "default",
                style: { fontSize: 10 }
              },
              k.enabled ? "启用" : "停用"
            ),
            a.createElement(
              i,
              { color: "purple", style: { fontSize: 10 } },
              k.transport
            )
          ),
          k.description ? a.createElement(
            G,
            {
              type: "secondary",
              style: { fontSize: 12, margin: 0 },
              ellipsis: { rows: 2 }
            },
            k.description
          ) : null,
          k.tools && k.tools.length > 0 ? a.createElement(
            "div",
            { style: { marginTop: 4, fontSize: 11, color: "#8c8c8c" } },
            `提供 ${k.tools.length} 个工具`
          ) : null
        )
      )
    }),
    // Create MCP modal
    a.createElement(
      y,
      {
        open: W,
        title: "添加 MCP 客户端 (JSON)",
        onCancel: () => X(!1),
        onOk: M,
        confirmLoading: g,
        okText: "创建",
        width: 560
      },
      a.createElement(
        "div",
        { style: { marginBottom: 8, fontSize: 12, color: "#8c8c8c" } },
        "粘贴 MCP 配置 JSON（支持 mcpServers 格式），将创建到当前专家工作区："
      ),
      a.createElement(H, {
        value: w,
        onChange: (k) => f(k.target.value),
        rows: 12,
        style: { fontFamily: "monospace", fontSize: 12 }
      })
    )
  );
}
function ol({ agentId: e }) {
  const t = S().React, { useState: l, useEffect: a, useCallback: n, useRef: r } = t, {
    Card: s,
    InputNumber: c,
    Input: i,
    Select: m,
    Switch: u,
    Button: E,
    Spin: y,
    Space: b,
    Typography: T,
    Divider: C,
    message: x
  } = S().antd, { SaveOutlined: I } = S().antdIcons || {}, { Text: j } = T, [F, G] = l(!0), [H, q] = l(!1), J = r(null), [O, z] = l(60), [W, X] = l(""), [w, f] = l(!0), [g, $] = l(30), [h, D] = l("zh"), [Z, M] = l("UTC"), [k, d] = l(!0), [ee, U] = l(100), [v, B] = l(!0), [re, V] = l(3), [Q, pe] = l(1), [A, _] = l(!0), [le, te] = l(3), [ne, ge] = l(2), [be, Se] = l(60), [Ce, ye] = l(1), [ae, he] = l(0), [ue, K] = l(1), [se, me] = l(0), [N, p] = l(30), [de, L] = l(50), [oe, fe] = l("light"), [ve, Ae] = l("scroll"), [Te, Me] = l("remelight"), [Le, Ue] = l("AUTO"), Ne = n(async () => {
    var Y, _e, ze, Oe, Je, Ke;
    G(!0);
    try {
      const [xe, it, Tt] = await Promise.all([
        Va(e),
        Qa(e).catch(() => "zh"),
        el().catch(() => "UTC")
      ]);
      J.current = xe, z(xe.shell_command_timeout ?? 60), X(xe.shell_command_executable ?? "");
      const et = xe.auto_title_config ?? { enabled: !0, timeout_seconds: 30 };
      f(et.enabled ?? !0), $(et.timeout_seconds ?? 30), D(it), M(Tt);
      const Fe = xe.loop ?? {};
      d(((Y = Fe.iteration) == null ? void 0 : Y.enabled) ?? !0), U(((_e = Fe.iteration) == null ? void 0 : _e.max_iterations) ?? xe.max_iters ?? 100), B(((ze = Fe.doom_loop) == null ? void 0 : ze.enabled) ?? !0), V(((Oe = Fe.doom_loop) == null ? void 0 : Oe.window_size) ?? 3), pe(((Je = Fe.doom_loop) == null ? void 0 : Je.similarity_threshold) ?? 1), _(xe.llm_retry_enabled ?? !0), te(xe.llm_max_retries ?? 3), ge(xe.llm_backoff_base ?? 2), Se(xe.llm_backoff_cap ?? 60), ye(xe.llm_max_concurrent ?? 1), he(xe.llm_max_qpm ?? 0), K(xe.llm_rate_limit_pause ?? 1), me(xe.llm_rate_limit_jitter ?? 0), p(xe.llm_acquire_timeout ?? 30), L(xe.history_max_length ?? 50), fe(xe.context_manager_backend ?? "light"), Ae(((Ke = xe.light_context_config) == null ? void 0 : Ke.strategy) ?? "scroll"), Me(xe.memory_manager_backend ?? "remelight"), Ue(xe.approval_level ?? "AUTO");
    } catch (xe) {
      x.error(xe.message || "加载运行配置失败");
    } finally {
      G(!1);
    }
  }, [e]);
  a(() => {
    Ne();
  }, [Ne]);
  const De = async () => {
    var _e, ze;
    const Y = J.current;
    if (Y) {
      q(!0);
      try {
        const Oe = {
          ...Y,
          max_iters: ee,
          loop: {
            ...Y.loop ?? {},
            iteration: { enabled: k, max_iterations: ee },
            doom_loop: {
              enabled: v,
              window_size: re,
              similarity_threshold: Q,
              stages: ((ze = (_e = Y.loop) == null ? void 0 : _e.doom_loop) == null ? void 0 : ze.stages) ?? []
            }
          },
          shell_command_timeout: O,
          shell_command_executable: W,
          auto_title_config: {
            enabled: w,
            timeout_seconds: g
          },
          llm_retry_enabled: A,
          llm_max_retries: le,
          llm_backoff_base: ne,
          llm_backoff_cap: be,
          llm_max_concurrent: Ce,
          llm_max_qpm: ae,
          llm_rate_limit_pause: ue,
          llm_rate_limit_jitter: se,
          llm_acquire_timeout: N,
          history_max_length: de,
          context_manager_backend: oe,
          light_context_config: {
            ...Y.light_context_config ?? {},
            strategy: ve
          },
          memory_manager_backend: Te,
          approval_level: Le
        };
        await Ya(e, Oe), J.current = Oe, h && await Za(e, h).catch(() => {
        }), Z && await tl(Z).catch(() => {
        }), x.success("运行配置已保存");
      } catch (Oe) {
        x.error(Oe.message || "保存运行配置失败");
      } finally {
        q(!1);
      }
    }
  };
  if (F)
    return t.createElement(
      "div",
      { style: { textAlign: "center", padding: 40 } },
      t.createElement(y, { size: "large" })
    );
  const ke = (Y, _e, ze) => t.createElement(
    "div",
    { style: Hn },
    t.createElement("div", { style: Ye }, Y),
    _e,
    ze ? t.createElement(
      j,
      { type: "secondary", style: Jn },
      ze
    ) : null
  ), $e = (Y, _e, ze, Oe) => t.createElement(
    "div",
    { style: Wn },
    t.createElement(
      "div",
      null,
      t.createElement("div", { style: Ye }, Y),
      _e
    ),
    t.createElement(
      "div",
      null,
      t.createElement("div", { style: Ye }, ze),
      Oe
    )
  );
  return t.createElement(
    "div",
    { style: { paddingBottom: 8 } },
    // ── Section: 基础设置 ──
    t.createElement(
      "div",
      { style: He },
      "基础设置"
    ),
    $e(
      "Shell 命令超时 (秒)",
      t.createElement(c, {
        min: 1,
        value: O,
        onChange: (Y) => z(Y ?? 60),
        style: { width: "100%" }
      }),
      "Shell 可执行文件",
      t.createElement(i, {
        value: W,
        onChange: (Y) => X(Y.target.value),
        placeholder: "留空使用系统默认",
        style: { width: "100%" }
      })
    ),
    $e(
      "语言",
      t.createElement(m, {
        value: h,
        onChange: (Y) => D(Y),
        style: { width: "100%" },
        options: [
          { value: "zh", label: "中文" },
          { value: "en", label: "English" },
          { value: "id", label: "Bahasa Indonesia" },
          { value: "ru", label: "Русский" }
        ]
      }),
      "时区",
      t.createElement(m, {
        value: Z,
        onChange: (Y) => M(Y),
        style: { width: "100%" },
        showSearch: !0,
        filterOption: (Y, _e) => {
          var ze;
          return (((ze = _e == null ? void 0 : _e.label) == null ? void 0 : ze.toString()) || "").toLowerCase().includes(Y.toLowerCase());
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
      t.createElement(b, null, t.createElement(u, {
        checked: w,
        onChange: (Y) => f(Y)
      })),
      "标题生成超时 (秒)",
      t.createElement(c, {
        min: 5,
        value: g,
        onChange: (Y) => $(Y ?? 30),
        style: { width: "100%" },
        disabled: !w
      })
    ),
    // ── Section: 审批级别 ──
    t.createElement(C, { style: { margin: "8px 0 16px" } }),
    t.createElement("div", { style: He }, "审批级别"),
    ke(
      "工具执行审批",
      t.createElement(m, {
        value: Le,
        onChange: (Y) => Ue(Y),
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
    t.createElement("div", { style: He }, "迭代与循环"),
    ke(
      "启用迭代限制",
      t.createElement(u, {
        checked: k,
        onChange: (Y) => d(Y)
      }),
      "停止 Agent 前的最大循环轮次"
    ),
    k ? ke(
      "最大迭代次数",
      t.createElement(c, {
        min: 1,
        max: 500,
        value: ee,
        onChange: (Y) => U(Y ?? 100),
        style: { width: "100%" }
      })
    ) : null,
    ke(
      "启用重复循环保护",
      t.createElement(u, {
        checked: v,
        onChange: (Y) => B(Y)
      }),
      "检测并阻止重复操作循环"
    ),
    v ? $e(
      "检测窗口大小",
      t.createElement(c, {
        min: 2,
        max: 20,
        value: re,
        onChange: (Y) => V(Y ?? 3),
        style: { width: "100%" }
      }),
      "相似度阈值",
      t.createElement(c, {
        min: 0,
        max: 1,
        step: 0.05,
        value: Q,
        onChange: (Y) => pe(Y ?? 1),
        style: { width: "100%" }
      })
    ) : null,
    // ── Section: LLM 重试 ──
    t.createElement(C, { style: { margin: "8px 0 16px" } }),
    t.createElement("div", { style: He }, "LLM 重试"),
    ke(
      "启用 LLM 重试",
      t.createElement(u, {
        checked: A,
        onChange: (Y) => _(Y)
      })
    ),
    $e(
      "最大重试次数",
      t.createElement(c, {
        min: 1,
        value: le,
        onChange: (Y) => te(Y ?? 3),
        style: { width: "100%" },
        disabled: !A
      }),
      "退避基数 (秒)",
      t.createElement(c, {
        min: 0.1,
        step: 0.1,
        value: ne,
        onChange: (Y) => ge(Y ?? 2),
        style: { width: "100%" },
        disabled: !A
      })
    ),
    ke(
      "退避上限 (秒)",
      t.createElement(c, {
        min: 0.5,
        step: 0.5,
        value: be,
        onChange: (Y) => Se(Y ?? 60),
        style: { width: 200 },
        disabled: !A
      })
    ),
    // ── Section: LLM 限流 ──
    t.createElement(C, { style: { margin: "8px 0 16px" } }),
    t.createElement("div", { style: He }, "LLM 限流"),
    $e(
      "最大并发数",
      t.createElement(c, {
        min: 1,
        value: Ce,
        onChange: (Y) => ye(Y ?? 1),
        style: { width: "100%" }
      }),
      "最大 QPM (0=不限)",
      t.createElement(c, {
        min: 0,
        step: 10,
        value: ae,
        onChange: (Y) => he(Y ?? 0),
        style: { width: "100%" }
      })
    ),
    $e(
      "限流暂停时间 (秒)",
      t.createElement(c, {
        min: 1,
        step: 0.5,
        value: ue,
        onChange: (Y) => K(Y ?? 1),
        style: { width: "100%" }
      }),
      "限流抖动 (秒)",
      t.createElement(c, {
        min: 0,
        step: 0.5,
        value: se,
        onChange: (Y) => me(Y ?? 0),
        style: { width: "100%" }
      })
    ),
    ke(
      "获取超时 (秒)",
      t.createElement(c, {
        min: 10,
        step: 10,
        value: N,
        onChange: (Y) => p(Y ?? 30),
        style: { width: 200 }
      }),
      "应大于 限流暂停 + 抖动"
    ),
    // ── Section: 上下文与记忆 ──
    t.createElement(C, { style: { margin: "8px 0 16px" } }),
    t.createElement("div", { style: He }, "上下文与记忆"),
    $e(
      "上下文管理后端",
      t.createElement(m, {
        value: oe,
        onChange: (Y) => fe(Y),
        style: { width: "100%" },
        options: [{ value: "light", label: "light" }]
      }),
      "上下文策略",
      t.createElement(m, {
        value: ve,
        onChange: (Y) => Ae(Y),
        style: { width: "100%" },
        options: [
          { value: "scroll", label: "scroll (滚动窗口)" },
          { value: "native", label: "native (原生)" }
        ]
      })
    ),
    $e(
      "记忆管理后端",
      t.createElement(m, {
        value: Te,
        onChange: (Y) => Me(Y),
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
        onChange: (Y) => L(Y ?? 50),
        style: { width: "100%" }
      })
    ),
    // ── Save button ──
    t.createElement(
      "div",
      { style: { display: "flex", justifyContent: "flex-end", marginTop: 16 } },
      t.createElement(
        E,
        {
          type: "primary",
          icon: I ? t.createElement(I) : void 0,
          loading: H,
          onClick: De,
          style: Pe
        },
        "保存运行配置"
      )
    )
  );
}
function il({
  expert: e,
  open: t,
  onClose: l,
  onRefresh: a
}) {
  const n = S().React, { useState: r, useEffect: s, useCallback: c } = n, { Modal: i, Tabs: m, Spin: u, Typography: E } = S().antd, { SettingOutlined: y } = S().antdIcons || {}, { Text: b } = E, [T, C] = r([]), [x, I] = r(!1), [j, F] = r("heartbeat"), G = c(async () => {
    if (e) {
      I(!0);
      try {
        const O = await nl(e.agent.id);
        C(O);
      } catch {
        C([]);
      } finally {
        I(!1);
      }
    }
  }, [e]);
  if (s(() => {
    t && e && G();
  }, [t, e, G]), !e) return null;
  const { agent: H } = e, q = () => {
    G(), a();
  }, J = [
    {
      key: "heartbeat",
      label: "心跳",
      children: n.createElement(ll, {
        agentId: H.id
      })
    },
    {
      key: "files",
      label: "文件",
      children: x ? n.createElement(
        "div",
        { style: { textAlign: "center", padding: 40 } },
        n.createElement(u, { size: "large" })
      ) : n.createElement(Gn, {
        agentId: H.id,
        systemPromptFiles: T,
        onRefresh: q
      })
    },
    {
      key: "skills",
      label: `技能 (${e.skills.filter((O) => O.enabled !== !1).length})`,
      children: n.createElement(rl, {
        agentId: H.id,
        onRefresh: a
      })
    },
    {
      key: "mcp",
      label: `MCP (${e.mcps.length})`,
      children: n.createElement(sl, {
        agentId: H.id,
        onRefresh: a,
        isActive: j === "mcp"
      })
    },
    {
      key: "running",
      label: "运行配置",
      children: n.createElement(ol, {
        agentId: H.id
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
        n.createElement("span", null, `配置 - ${H.name}`),
        n.createElement(
          b,
          { type: "secondary", style: { fontSize: 12, fontWeight: 400 } },
          H.id
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
    n.createElement(m, {
      items: J,
      activeKey: j,
      onChange: (O) => F(O),
      size: "small",
      tabBarStyle: { marginBottom: 16 }
    })
  );
}
const cl = [
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
], dl = cl;
function Sn(e) {
  return bt(`/ugsci/avatar/${encodeURIComponent(e)}`);
}
function wn(e) {
  const t = e.map(encodeURIComponent).join(",");
  return bt(`/ugsci/avatar/team/${t}`);
}
function Be({
  name: e,
  size: t = 32,
  borderRadius: l = "50%"
}) {
  const a = S().React, [n, r] = a.useState(0), s = n === 0 ? Sn(e) : `${Sn(e)}?_r=${n}`;
  return a.createElement("img", {
    src: s,
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
function Gt({
  members: e,
  size: t = 32,
  borderRadius: l = "50%"
}) {
  const a = S().React, [n, r] = a.useState(0);
  if (!e || e.length === 0)
    return a.createElement("span", {
      style: {
        width: t,
        height: t,
        display: "inline-block"
      }
    });
  const s = e.slice(0, 5), c = n === 0 ? wn(s) : `${wn(s)}?_r=${n}`;
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
async function xn(e) {
  var l;
  const t = S();
  if (t.refreshAgents)
    try {
      await t.refreshAgents({ force: !0 });
    } catch (a) {
      console.warn("[ugsci] Failed to refresh newly created agent:", a);
      return;
    }
  (l = t.setSelectedAgent) == null || l.call(t, e);
}
function ml({
  expert: e,
  onClick: t,
  onSummon: l,
  onConfigure: a
}) {
  const n = S().React, { Card: r, Tag: s, Badge: c, Typography: i, Spin: m, Button: u, Tooltip: E } = S().antd, { Text: y } = i, { ThunderboltOutlined: b, SettingOutlined: T } = S().antdIcons || {}, { agent: C, skills: x, mcps: I, loading: j } = e, F = C.enabled, G = x.filter((J) => J.enabled !== !1).map((J) => J.name), H = I.map((J) => J.name || J.key), q = C.active_model ? `${C.active_model.provider_id}/${C.active_model.model}` : null;
  return n.createElement(
    r,
    {
      hoverable: !0,
      onClick: t,
      size: "small",
      style: {
        cursor: "pointer",
        transition: "all 0.2s ease",
        borderColor: F ? void 0 : "#d9d9d9",
        opacity: F ? 1 : 0.7,
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
        n.createElement(Be, { name: C.name, size: 36 }),
        n.createElement(
          "div",
          null,
          n.createElement(
            y,
            { strong: !0, style: { fontSize: 15 } },
            C.name
          ),
          n.createElement(
            "div",
            {
              style: {
                fontSize: 11,
                color: "#bfbfbf",
                fontFamily: "monospace"
              }
            },
            C.id
          )
        )
      ),
      n.createElement(c, {
        status: F ? "success" : "default",
        text: F ? "启用" : "停用"
      })
    ),
    // Description (rendered as markdown)
    C.description ? n.createElement(
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
      St(C.description, n)
    ) : n.createElement(
      "div",
      { style: { fontSize: 12, color: "#bfbfbf", marginBottom: 10, minHeight: 54, flex: "1 0 auto" } },
      "暂无描述"
    ),
    // Model info
    q ? n.createElement(
      "div",
      { style: { marginBottom: 8 } },
      n.createElement(
        s,
        { color: "geekblue", style: { fontSize: 11 } },
        `🤖 ${q}`
      )
    ) : null,
    // Skills
    j ? n.createElement(m, { size: "small" }) : n.createElement(
      "div",
      { style: { marginBottom: 6 } },
      n.createElement(
        "div",
        { style: { fontSize: 11, color: "#8c8c8c", marginBottom: 4 } },
        `技能 (${G.length})`
      ),
      n.createElement(bn, {
        items: G,
        max: 4,
        color: "cyan",
        emptyText: "未配置技能"
      })
    ),
    // MCP
    !j && H.length > 0 ? n.createElement(
      "div",
      { style: { marginTop: "auto" } },
      n.createElement(
        "div",
        { style: { fontSize: 11, color: "#8c8c8c", marginBottom: 4 } },
        `MCP (${H.length})`
      ),
      n.createElement(bn, {
        items: H,
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
        E,
        { title: "配置专家", placement: "top" },
        n.createElement(
          u,
          {
            type: "text",
            size: "small",
            icon: T ? n.createElement(T, {
              style: { fontSize: 16, color: "#8c8c8c" }
            }) : void 0,
            onClick: (J) => {
              J.stopPropagation(), a && a();
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
          icon: b ? n.createElement(b) : void 0,
          disabled: !F,
          onClick: (J) => {
            J.stopPropagation(), l && l();
          },
          style: Pe
        },
        "召唤专家"
      )
    )
  );
}
function ul({
  expert: e,
  open: t,
  onClose: l,
  onRefresh: a
}) {
  const n = S().React, {
    Drawer: r,
    Descriptions: s,
    Tag: c,
    Typography: i,
    Space: m,
    Button: u,
    Empty: E,
    Tabs: y,
    List: b,
    Spin: T,
    Modal: C,
    message: x
  } = S().antd, { Text: I, Paragraph: j } = i, {
    EditOutlined: F,
    ThunderboltOutlined: G,
    FileTextOutlined: H,
    ToolOutlined: q,
    PlusOutlined: J
  } = S().antdIcons || {}, [O, z] = n.useState(!1), [W, X] = n.useState(
    []
  ), [w, f] = n.useState(!1);
  if (!e) return null;
  const { agent: g, config: $, skills: h, mcps: D, loading: Z } = e, M = h.filter((A) => A.enabled !== !1), k = (A) => {
    window.history.pushState({}, "", A), window.dispatchEvent(new PopStateEvent("popstate"));
  }, d = n.createElement(
    "div",
    null,
    n.createElement(
      s,
      { column: 1, bordered: !0, size: "small" },
      n.createElement(s.Item, { label: "专家名称" }, g.name),
      n.createElement(
        s.Item,
        { label: "专家 ID" },
        n.createElement("code", { style: { fontSize: 12 } }, g.id)
      ),
      n.createElement(
        s.Item,
        { label: "状态" },
        n.createElement(
          c,
          { color: g.enabled ? "green" : "default" },
          g.enabled ? "启用" : "停用"
        )
      ),
      n.createElement(
        s.Item,
        { label: "功能简介" },
        g.description ? St(g.description, n) : "暂无描述"
      ),
      n.createElement(
        s.Item,
        { label: "使用模型" },
        g.active_model ? `${g.active_model.provider_id} / ${g.active_model.model}` : "使用全局默认模型"
      ),
      $ != null && $.workspace_dir ? n.createElement(
        s.Item,
        { label: "工作区路径" },
        n.createElement(
          "code",
          { style: { fontSize: 11 } },
          $.workspace_dir
        )
      ) : null,
      $ != null && $.approval_level ? n.createElement(
        s.Item,
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
        H ? n.createElement(H, {
          style: { fontSize: 14, color: "#1677ff" }
        }) : null,
        n.createElement(I, { strong: !0 }, "系统提示词文件")
      ),
      n.createElement(
        m,
        { wrap: !0 },
        ...$.system_prompt_files.map(
          (A, _) => n.createElement(
            c,
            {
              key: _,
              icon: H ? n.createElement(H) : void 0,
              style: { fontSize: 12 }
            },
            A
          )
        )
      )
    ) : null
  ), ee = async () => {
    z(!0), f(!0);
    try {
      const A = await Ct(!0);
      X(A);
    } catch (A) {
      x.error(A.message || "加载技能池失败");
    } finally {
      f(!1);
    }
  }, U = async (A) => {
    let _ = 0, le = 0;
    for (const te of A)
      try {
        await Ut(g.id, te), _++;
      } catch {
        le++;
      }
    _ > 0 ? (x.success(
      `成功添加 ${_} 个技能${le > 0 ? `，${le} 个失败` : ""}`
    ), a()) : le > 0 && x.error("添加技能失败"), z(!1);
  }, v = async (A) => {
    try {
      await Nt(g.id, A), x.success(`技能「${A}」已移除`), a();
    } catch (_) {
      x.error(_.message || "移除技能失败");
    }
  }, B = async (A) => {
    try {
      await Nn(g.id, A), x.success(`MCP「${A}」已移除`), a();
    } catch (_) {
      x.error(_.message || "移除 MCP 失败");
    }
  }, re = Z ? n.createElement(
    "div",
    { style: { textAlign: "center", padding: 40 } },
    n.createElement(T, { size: "large" })
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
        I,
        { strong: !0 },
        `已启用技能 (${M.length})`
      ),
      n.createElement(
        u,
        {
          type: "primary",
          size: "small",
          icon: J ? n.createElement(J) : void 0,
          onClick: ee
        },
        "从技能池添加"
      )
    ),
    M.length === 0 ? n.createElement(E, {
      description: "该专家暂无已启用的技能",
      image: E.PRESENTED_IMAGE_SIMPLE
    }) : n.createElement(b, {
      dataSource: M,
      renderItem: (A) => n.createElement(
        b.Item,
        {
          actions: [
            n.createElement(
              u,
              {
                type: "link",
                size: "small",
                danger: !0,
                onClick: () => v(A.name)
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
            A.emoji ? n.createElement(
              "span",
              { style: { fontSize: 16 } },
              A.emoji
            ) : null,
            n.createElement(I, { strong: !0 }, A.name),
            A.version_text ? n.createElement(
              c,
              { style: { fontSize: 10 } },
              `v${A.version_text}`
            ) : null
          ),
          A.description ? n.createElement(
            j,
            {
              type: "secondary",
              style: { fontSize: 12, margin: 0 },
              ellipsis: { rows: 2 }
            },
            A.description
          ) : null,
          A.tags && A.tags.length > 0 ? n.createElement(
            "div",
            { style: { marginTop: 4 } },
            ...A.tags.map(
              (_, le) => n.createElement(
                c,
                {
                  key: le,
                  color: "cyan",
                  style: { fontSize: 10 }
                },
                _
              )
            )
          ) : null
        )
      )
    }),
    // Skill Picker Modal (card-grid style, consistent with Skill Center)
    n.createElement(Fn, {
      open: O,
      onClose: () => z(!1),
      poolSkills: W,
      installedSkillNames: M.map((A) => A.name),
      loading: w,
      onInstall: U
    })
  ), V = Z ? n.createElement(
    "div",
    { style: { textAlign: "center", padding: 40 } },
    n.createElement(T, { size: "large" })
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
        I,
        { strong: !0 },
        `MCP 客户端 (${D.length})`
      ),
      n.createElement(
        u,
        {
          type: "primary",
          size: "small",
          icon: J ? n.createElement(J) : void 0,
          onClick: () => {
            window.history.pushState({}, "", `/agents/${g.id}/mcp`), window.dispatchEvent(new PopStateEvent("popstate"));
          }
        },
        "配置 MCP"
      )
    ),
    D.length === 0 ? n.createElement(E, {
      description: "该专家暂无关联的 MCP 客户端，点击「配置 MCP」添加",
      image: E.PRESENTED_IMAGE_SIMPLE
    }) : n.createElement(b, {
      dataSource: D,
      renderItem: (A) => n.createElement(
        b.Item,
        {
          actions: [
            n.createElement(
              u,
              {
                type: "link",
                size: "small",
                danger: !0,
                onClick: () => B(A.key)
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
              I,
              { strong: !0 },
              A.name || A.key
            ),
            n.createElement(
              c,
              {
                color: A.enabled ? "green" : "default",
                style: { fontSize: 10 }
              },
              A.enabled ? "启用" : "停用"
            ),
            n.createElement(
              c,
              { color: "purple", style: { fontSize: 10 } },
              A.transport
            )
          ),
          A.description ? n.createElement(
            j,
            {
              type: "secondary",
              style: { fontSize: 12, margin: 0 },
              ellipsis: { rows: 2 }
            },
            A.description
          ) : null,
          A.tools && A.tools.length > 0 ? n.createElement(
            "div",
            {
              style: {
                marginTop: 4,
                fontSize: 11,
                color: "#8c8c8c"
              }
            },
            `提供 ${A.tools.length} 个工具`
          ) : null
        )
      )
    })
  ), Q = $ != null && $.tools ? n.createElement(
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
        q ? n.createElement(q, {
          style: { fontSize: 14, color: "#1677ff" }
        }) : null,
        n.createElement(I, { strong: !0 }, "工具配置")
      ),
      n.createElement(
        "pre",
        {
          style: {
            background: "#fafafa",
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
  ) : n.createElement(E, {
    description: "暂无工具配置",
    image: E.PRESENTED_IMAGE_SIMPLE
  }), pe = [
    { key: "basic", label: "基本信息", children: d },
    {
      key: "skills",
      label: `技能 (${M.length})`,
      children: re
    },
    {
      key: "prompts",
      label: "推荐提问",
      children: n.createElement(al, {
        skills: M,
        agentId: g.id
      })
    },
    {
      key: "knowledge",
      label: "专家记忆",
      children: n.createElement(Gn, {
        agentId: g.id,
        systemPromptFiles: ($ == null ? void 0 : $.system_prompt_files) || [],
        onRefresh: () => a()
      })
    },
    { key: "mcp", label: `MCP (${D.length})`, children: V },
    { key: "tools", label: "工具配置", children: Q }
  ];
  return n.createElement(
    r,
    {
      title: n.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 8 } },
        n.createElement(Be, { name: g.name, size: 28 }),
        n.createElement("span", null, g.name)
      ),
      open: t,
      onClose: l,
      width: 560,
      extra: n.createElement(
        m,
        null,
        n.createElement(
          u,
          {
            size: "small",
            icon: F ? n.createElement(F) : void 0,
            onClick: () => {
              l();
              try {
                const A = S();
                A.setSelectedAgent && A.setSelectedAgent(g.id);
              } catch (A) {
                console.warn("[ugsci] Failed to set selected agent:", A);
              }
              setTimeout(() => k("/agents"), 0);
            }
          },
          "编辑专家"
        ),
        n.createElement(
          u,
          {
            type: "primary",
            size: "small",
            icon: G ? n.createElement(G) : void 0,
            onClick: () => {
              l();
              try {
                const A = S();
                A.setSelectedAgent && A.setSelectedAgent(g.id);
              } catch (A) {
                console.warn("[ugsci] Failed to set selected agent:", A);
              }
              setTimeout(() => k("/chat"), 0);
            }
          },
          "开始对话"
        )
      )
    },
    n.createElement(y, {
      items: pe,
      defaultActiveKey: "basic"
    })
  );
}
function pl({
  open: e,
  onClose: t,
  onCreated: l
}) {
  const a = S().React, { useState: n } = a, {
    Modal: r,
    Card: s,
    Tag: c,
    Input: i,
    Row: m,
    Col: u,
    Spin: E,
    message: y,
    Typography: b
  } = S().antd, { Text: T } = b, { FileAddOutlined: C } = S().antdIcons || {}, [x, I] = n(!1), [j, F] = n(""), [G, H] = n(!1), q = async (z) => {
    I(!0);
    try {
      const W = await ie("/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: z.id || void 0,
          name: z.name,
          description: z.description,
          skill_names: z.skillNames
        })
      }), X = z.systemPrompt.trim() || `# ${z.name}

你是${z.name}。${z.description ? `

职责：${z.description}` : ""}
`, f = (await Promise.allSettled([
        ht(W.id, "AGENTS.md", X),
        ...z.mcpClients.map(
          ({ clientKey: g, client: $ }) => Ft(W.id, {
            client_key: g,
            client: $
          })
        )
      ])).filter(
        (g) => g.status === "rejected"
      ).length;
      f > 0 ? y.warning(
        `专家「${z.name}」已创建，${f} 项初始配置失败，可在专家配置中重试`
      ) : y.success(`专家「${z.name}」创建成功`), await xn(W.id), H(!1), setTimeout(() => {
        t(), l();
      }, 0);
    } catch (W) {
      y.error(W.message || "创建专家失败");
    } finally {
      I(!1);
    }
  }, J = dl.filter((z) => {
    if (!j.trim()) return !0;
    const W = j.toLowerCase();
    return z.name.toLowerCase().includes(W) || z.description.toLowerCase().includes(W) || z.category.toLowerCase().includes(W);
  }), O = async (z) => {
    I(!0);
    try {
      const W = await ie("/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: z.name,
          description: z.description,
          skill_names: z.recommended_skills
        })
      });
      await ht(W.id, "AGENTS.md", z.system_prompt);
      const X = await jt(W.id);
      X.approval_level = z.approval_level, await ie(`/agents/${encodeURIComponent(W.id)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(X)
      }), await xn(W.id), y.success(`专家「${z.name}」创建成功`), t(), l();
    } catch (W) {
      y.error(W.message || "创建专家失败");
    } finally {
      I(!1);
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
          onChange: (z) => F(z.target.value),
          allowClear: !0
        })
      ),
      x ? a.createElement(
        "div",
        { style: { textAlign: "center", padding: 60 } },
        a.createElement(E, { size: "large" }),
        a.createElement(
          "div",
          { style: { marginTop: 12, color: "#8c8c8c" } },
          "正在创建专家..."
        )
      ) : a.createElement(
        m,
        { gutter: [12, 12] },
        // ── Blank template card (always first) ──
        j.trim() ? null : a.createElement(
          u,
          { xs: 24, sm: 12 },
          a.createElement(
            s,
            {
              hoverable: !0,
              size: "small",
              onClick: () => H(!0),
              style: {
                cursor: "pointer",
                height: "100%",
                border: "2px dashed #d9d9d9",
                background: "#fafafa"
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
                { style: { fontSize: 28, color: "#8c8c8c" } },
                C ? a.createElement(C) : "📝"
              ),
              a.createElement(
                "div",
                { style: { flex: 1 } },
                a.createElement(
                  T,
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
        ...J.map(
          (z) => a.createElement(
            u,
            { key: z.id, xs: 24, sm: 12 },
            a.createElement(
              s,
              {
                hoverable: !0,
                size: "small",
                onClick: () => O(z),
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
                a.createElement(Be, {
                  name: z.name,
                  size: 40
                }),
                a.createElement(
                  "div",
                  { style: { flex: 1 } },
                  a.createElement(
                    T,
                    { strong: !0, style: { fontSize: 15 } },
                    z.name
                  ),
                  a.createElement(
                    "div",
                    null,
                    a.createElement(
                      c,
                      { color: "blue", style: { fontSize: 10 } },
                      z.category
                    ),
                    z.approval_level === "MANUAL" ? a.createElement(
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
                St(z.description, a)
              )
            )
          )
        )
      )
    ),
    // ── Blank template creation modal (sibling, not nested inside Modal) ──
    a.createElement(fl, {
      open: G,
      onCancel: () => H(!1),
      onCreate: q
    })
  );
}
function lt(e) {
  return typeof e == "object" && e !== null && !Array.isArray(e);
}
function gl(e) {
  const t = e.trim();
  if (!t) return [];
  const l = JSON.parse(t);
  if (!lt(l))
    throw new Error("MCP 配置必须是 JSON 对象");
  const a = l.mcpServers ?? l;
  if (!lt(a))
    throw new Error("mcpServers 必须是 JSON 对象");
  return Object.entries(a).map(([n, r]) => {
    const s = n.trim();
    if (!s || !lt(r))
      throw new Error(`MCP「${n || "未命名"}」配置无效`);
    const c = typeof r.url == "string" ? r.url : "", i = typeof r.command == "string" ? r.command : "";
    if (!c && !i)
      throw new Error(`MCP「${s}」需要配置 url 或 command`);
    const u = (typeof r.transport == "string" ? r.transport : typeof r.type == "string" ? r.type : "") === "sse" ? "sse" : c ? "streamable_http" : "stdio";
    return {
      clientKey: s,
      client: {
        name: typeof r.name == "string" ? r.name : s,
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
function fl({
  open: e,
  onCancel: t,
  onCreate: l
}) {
  const a = S().React, { useState: n, useEffect: r, useMemo: s } = a, {
    Modal: c,
    Input: i,
    Select: m,
    Button: u,
    Row: E,
    Col: y,
    Spin: b,
    Tag: T,
    Typography: C,
    message: x
  } = S().antd, { CheckCircleOutlined: I } = S().antdIcons || {}, { Text: j } = C, [F, G] = n(""), [H, q] = n(""), [J, O] = n(""), [z, W] = n(""), [X, w] = n([]), [f, g] = n([]), [$, h] = n(!1), [D, Z] = n(""), [M, k] = n(!1);
  r(() => {
    e && (G(""), q(""), O(""), W(""), g([]), Z(""), k(!1), h(!0), Ct(!0).then(w).catch((V) => {
      w([]), x.error(V.message || "加载技能池失败");
    }).finally(() => h(!1)));
  }, [e]);
  const d = H.trim(), ee = s(() => d ? d.length < 2 || d.length > 64 ? "ID 长度需为 2-64 个字符" : /^[a-zA-Z0-9][a-zA-Z0-9_-]*[a-zA-Z0-9]$/.test(d) ? d === "default" ? "default 是系统保留 ID" : "" : "仅允许字母、数字、连字符和下划线，且不能以符号开头或结尾" : "", [d]), U = s(() => {
    try {
      return { clients: gl(D), error: "" };
    } catch (V) {
      return { clients: [], error: V.message || "MCP 配置无效" };
    }
  }, [D]), v = () => {
    const V = F.trim();
    if (!V) {
      x.warning("请输入专家名称");
      return;
    }
    if (ee) {
      x.warning(ee);
      return;
    }
    if (U.error) {
      x.warning(U.error);
      return;
    }
    k(!0), Promise.resolve(
      l({
        id: d,
        name: V,
        description: J.trim(),
        systemPrompt: z,
        skillNames: f,
        mcpClients: U.clients
      })
    ).finally(() => k(!1));
  }, B = () => {
    g(
      X.filter((V) => V.source === "builtin").map((V) => V.name)
    );
  }, re = (V, Q) => a.createElement(
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
    Q ? a.createElement(j, { type: "secondary", style: { fontSize: 12 } }, Q) : null
  );
  return a.createElement(
    c,
    {
      open: e,
      title: "创建专家",
      onCancel: t,
      onOk: v,
      okText: "创建专家",
      cancelText: "取消",
      okButtonProps: { loading: M },
      maskClosable: !0,
      keyboard: !0,
      width: 880,
      styles: { body: { maxHeight: "72vh", overflowY: "auto", paddingTop: 8 } }
    },
    a.createElement(
      "div",
      { style: { paddingBottom: 20 } },
      re("基本信息", "ID 留空时自动生成"),
      a.createElement(
        E,
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
            value: F,
            onChange: (V) => G(V.target.value),
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
            value: H,
            onChange: (V) => q(V.target.value),
            maxLength: 64,
            status: ee ? "error" : void 0
          }),
          ee ? a.createElement("div", { style: { color: "#ff4d4f", fontSize: 12, marginTop: 4 } }, ee) : null
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
            value: J,
            onChange: (V) => O(V.target.value),
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
      re("角色指令", "保存为 AGENTS.md"),
      a.createElement(i.TextArea, {
        placeholder: "定义专家的角色、目标、工作方式和输出要求；留空时将根据名称与描述生成基础指令",
        value: z,
        onChange: (V) => W(V.target.value),
        rows: 6,
        style: { fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", fontSize: 12 }
      })
    ),
    a.createElement(
      "div",
      { style: { borderTop: "1px solid #f0f0f0", paddingTop: 20 } },
      re("初始能力"),
      a.createElement(
        E,
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
              a.createElement(u, { size: "small", onClick: B, disabled: $ }, "内置"),
              a.createElement(u, { size: "small", onClick: () => g([]), disabled: f.length === 0 }, "清空")
            )
          ),
          $ ? a.createElement("div", { style: { textAlign: "center", padding: 32 } }, a.createElement(b, { size: "small" })) : a.createElement(m, {
            mode: "multiple",
            value: f,
            onChange: g,
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
            f.length > 0 ? a.createElement(T, { color: "blue" }, `已选择 ${f.length} 个技能`) : a.createElement(j, { type: "secondary", style: { fontSize: 12 } }, "暂不添加技能")
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
            value: D,
            onChange: (V) => Z(V.target.value),
            rows: 8,
            status: U.error ? "error" : void 0,
            style: { fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", fontSize: 12 }
          }),
          a.createElement(
            "div",
            { style: { marginTop: 8, minHeight: 22 } },
            U.error ? a.createElement(j, { type: "danger", style: { fontSize: 12 } }, U.error) : U.clients.length > 0 ? a.createElement(
              T,
              {
                color: "green",
                icon: I ? a.createElement(I) : void 0
              },
              `已识别 ${U.clients.length} 个 MCP`
            ) : a.createElement(j, { type: "secondary", style: { fontSize: 12 } }, "暂不添加 MCP")
          )
        )
      )
    )
  );
}
const Kn = "ugsci_custom_teams";
function yl(e) {
  if (!e || typeof e != "object") return !1;
  const t = e;
  return typeof t.id == "string" && typeof t.name == "string" && typeof t.taskTemplate == "string" && typeof t.orchestrationPrompt == "string" && Array.isArray(t.members);
}
function rt() {
  try {
    const e = JSON.parse(
      localStorage.getItem(Kn) || "[]"
    );
    return Array.isArray(e) ? e.filter(yl) : [];
  } catch {
    return [];
  }
}
function Ht(e) {
  try {
    localStorage.setItem(Kn, JSON.stringify(e));
  } catch {
  }
}
function El(e) {
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
    custom: !0
  };
}
async function Ot(e = !0) {
  const t = await je("/ugsci/team/custom");
  if (!t.ok) {
    const n = await t.text().catch(() => "");
    throw new Error(n || `HTTP ${t.status}`);
  }
  const a = (await t.json()).map(hl);
  return e && Ht(a), a;
}
async function qn(e) {
  const t = await je("/ugsci/team/custom", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(El(e))
  });
  if (!t.ok) {
    const a = await t.text().catch(() => "");
    throw new Error(a || `HTTP ${t.status}`);
  }
  const l = await t.json();
  return { ...e, id: l.team_id };
}
async function vl(e) {
  const t = await je(
    `/ugsci/team/custom/${encodeURIComponent(e)}`,
    { method: "DELETE" }
  );
  if (!t.ok && t.status !== 404) {
    const l = await t.text().catch(() => "");
    throw new Error(l || `HTTP ${t.status}`);
  }
}
async function bl() {
  const e = rt();
  if (e.length === 0) return;
  const t = await Ot(!1), l = new Set(t.map((a) => a.id));
  await Promise.all(
    e.filter((a) => !l.has(a.id)).map((a) => qn(a))
  );
}
async function Sl(e) {
  var n, r;
  const t = (n = e.body) == null ? void 0 : n.getReader();
  if (!t) return;
  const l = new TextDecoder();
  let a = "";
  try {
    for (; ; ) {
      const { done: s, value: c } = await t.read();
      if (s) break;
      a += l.decode(c, { stream: !0 });
      let i;
      for (; (i = a.indexOf(`

`)) >= 0; ) {
        const m = a.slice(0, i);
        a = a.slice(i + 2);
        for (const u of m.split(`
`)) {
          if (!u.startsWith("data: ")) continue;
          const E = u.slice(6);
          let y;
          try {
            y = JSON.parse(E);
          } catch {
            continue;
          }
          if (y.error) {
            const b = y.error, T = typeof b == "string" ? b : (b == null ? void 0 : b.message) || "工作流启动失败";
            throw new Error(T);
          }
          if (y.object === "response" || y.type === "response") {
            const b = y.status;
            if (b === "failed" || b === "error") {
              const T = ((r = y.error) == null ? void 0 : r.message) || "工作流启动失败";
              throw new Error(T);
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
async function wl(e, t, l) {
  const a = `console:default:team-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, n = await je("/chats", {
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
  const s = (await n.json()).id, c = await je("/console/chat", {
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
  return await Sl(c), s;
}
function Xn(e, t) {
  var n;
  const l = t.replace(/\s+/g, ""), a = e.find(
    (r) => r.name === t || r.name.replace(/\s+/g, "") === l
  );
  return a ? a.id : ((n = e.find(
    (r) => r.name.includes(t) || t.includes(r.name) || r.name.replace(/\s+/g, "").includes(l)
  )) == null ? void 0 : n.id) || null;
}
function Vn() {
  var t;
  const e = (t = window.QwenPaw) == null ? void 0 : t.host;
  if (!e) throw new Error("[ugsci] QwenPaw.host not available");
  return e;
}
async function Wt(e, t, l) {
  try {
    const a = await je(e, {
      headers: t ? { "X-Agent-Id": t } : void 0,
      signal: l
    });
    return a.ok ? await a.json() : null;
  } catch {
    return null;
  }
}
function xl(e, t) {
  return Wt("/ugsci/team/state", e, t);
}
async function kl(e, t) {
  const l = await je("/ugsci/team/runs", {
    headers: { "X-Agent-Id": e },
    signal: t
  });
  if (!l.ok)
    throw new Error(`Failed to load team runs: ${l.status}`);
  return await l.json();
}
function kn({ activeOnly: e = !1 }) {
  const t = Vn(), l = t.React, { useCallback: a, useEffect: n, useRef: r, useState: s } = l, { Alert: c, Button: i, Card: m, Empty: u, Spin: E, Tag: y, Typography: b } = t.antd, { Text: T, Paragraph: C } = b, x = t.useSelectedAgent ? t.useSelectedAgent() : { id: "default" }, I = (x == null ? void 0 : x.id) || "default", [j, F] = s([]), [G, H] = s(!0), [q, J] = s(!1), O = r(null), z = r(0), W = a(async () => {
    var g;
    (g = O.current) == null || g.abort();
    const w = new AbortController();
    O.current = w;
    const f = ++z.current;
    H(!0);
    try {
      const $ = await kl(I, w.signal);
      if (w.signal.aborted || f !== z.current) return;
      F($), J(!1);
    } catch {
      if (w.signal.aborted || f !== z.current) return;
      J(!0);
    } finally {
      !w.signal.aborted && f === z.current && H(!1);
    }
  }, [I]);
  if (n(() => (W(), () => {
    var w;
    (w = O.current) == null || w.abort(), z.current += 1;
  }), [W]), G) return l.createElement(E);
  if (q)
    return l.createElement(c, {
      type: "warning",
      message: "讨论运行记录加载失败",
      action: l.createElement(i, { size: "small", onClick: () => void W() }, "重试")
    });
  const X = j.filter(
    (w) => e ? w.status === "active" : w.status !== "active"
  );
  return X.length === 0 ? l.createElement(u, {
    description: e ? "暂无进行中的专家团讨论" : "暂无历史讨论"
  }) : l.createElement(
    "div",
    { style: { display: "flex", flexDirection: "column", gap: 8 } },
    ...X.map(
      (w) => l.createElement(
        m,
        { key: w.instance_id, size: "small" },
        l.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 8 } },
          l.createElement(T, { strong: !0 }, w.team_name || w.team_id),
          l.createElement(y, { color: w.status === "completed" ? "green" : w.status === "terminated" ? "orange" : "blue" }, w.status),
          l.createElement(y, null, w.current_phase),
          l.createElement(T, { type: "secondary" }, `迭代 ${w.iteration}`)
        ),
        l.createElement(C, { ellipsis: { rows: 2 }, style: { margin: "8px 0 0" } }, w.task || "暂无任务描述")
      )
    )
  );
}
async function Cl() {
  const e = await Wt(
    "/ugsci/team/preset-teams"
  );
  return (e == null ? void 0 : e.teams) ?? null;
}
async function Tl() {
  const e = await Wt(
    "/ugsci/team/roles"
  );
  return (e == null ? void 0 : e.roles) ?? null;
}
const _l = {
  plan: { label: "规划", color: "#1677ff", icon: "📋" },
  dispatch: { label: "分派", color: "#13c2c2", icon: "🚀" },
  verify: { label: "验证", color: "#fa8c16", icon: "🔍" },
  synthesize: { label: "综合", color: "#722ed1", icon: "📊" },
  completed: { label: "完成", color: "#52c41a", icon: "✅" }
}, Cn = [
  "plan",
  "dispatch",
  "verify",
  "synthesize",
  "completed"
], Il = 3;
function zl() {
  const e = Vn(), t = e.React, { useState: l, useEffect: a, useCallback: n, useRef: r } = t, { Card: s, Tag: c, Typography: i, Button: m, Steps: u, Empty: E, Alert: y } = e.antd, { ReloadOutlined: b } = e.antdIcons || {}, { Text: T, Paragraph: C } = i, x = e.useSelectedAgent ? e.useSelectedAgent() : { id: "default" }, I = (x == null ? void 0 : x.id) || "default", [j, F] = l(null), [G, H] = l(!1), q = r(null), J = r(0), O = r(0), z = r(null), W = n(
    async (d) => {
      var B;
      (B = z.current) == null || B.abort();
      const ee = new AbortController();
      z.current = ee;
      const U = ++O.current;
      d && H(!0);
      const v = await xl(I, ee.signal);
      ee.signal.aborted || U !== O.current || (v ? (J.current = 0, q.current = v, F(v)) : J.current += 1, H(!1));
    },
    [I]
  ), X = n(() => W(!0), [W]);
  if (a(() => {
    var ee;
    (ee = z.current) == null || ee.abort(), O.current += 1, J.current = 0, q.current = null, F(null), X();
    const d = window.setInterval(() => {
      var U, v;
      J.current >= Il || ((U = q.current) == null ? void 0 : U.status) === "completed" || ((v = q.current) == null ? void 0 : v.status) === "terminated" || W(!1);
    }, 5e3);
    return () => {
      var U;
      window.clearInterval(d), (U = z.current) == null || U.abort(), O.current += 1;
    };
  }, [I, W, X]), (j == null ? void 0 : j.status) === "unreadable")
    return t.createElement(y, {
      type: "warning",
      showIcon: !0,
      message: "专家团状态暂时无法读取",
      description: `实例 ${j.instance_id || "未知"} 的状态文件需要检查。`,
      style: { marginBottom: 16 },
      action: t.createElement(
        m,
        { size: "small", onClick: X, loading: G },
        "重试"
      )
    });
  if (!j || !j.active) {
    if ((j == null ? void 0 : j.status) === "completed" || (j == null ? void 0 : j.status) === "terminated") {
      const d = j.status === "completed";
      return t.createElement(y, {
        type: d ? "success" : "info",
        showIcon: !0,
        message: d ? "专家团工作流已完成" : "专家团工作流已终止",
        description: d ? `实例 ${j.instance_id || "未知"} 已完成，结果文件保留在工作区。` : `原因：${j.state.termination_reason || "未知"}`,
        style: { marginBottom: 16 }
      });
    }
    return t.createElement(E, {
      description: "暂无活跃的专家团工作流",
      style: { padding: 24 }
    });
  }
  const w = j.state, f = w.current_phase || "plan", g = Cn.indexOf(f), $ = w.team_name || "未知团队", h = w.team_mode || "pipeline", D = w.iteration || 0, Z = w.members || [], M = w.verify_retries || 0, k = {
    pipeline: "顺序交接",
    coordinator: "主管协作",
    roundtable: "并行汇聚",
    router: "智能路由",
    review_loop: "评审迭代",
    debate: "多方论证"
  };
  return t.createElement(
    s,
    {
      size: "small",
      style: { marginBottom: 16 },
      title: t.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 8 } },
        t.createElement("span", { style: { fontSize: 16 } }, "🔄"),
        t.createElement(T, { strong: !0 }, `${$} — 工作流状态`),
        t.createElement(
          c,
          { color: "blue", style: { fontSize: 10 } },
          k[h] || h
        ),
        t.createElement(
          c,
          { style: { fontSize: 10 } },
          `迭代 ${D}`
        ),
        M > 0 ? t.createElement(
          c,
          { color: "orange", style: { fontSize: 10 } },
          `验证重试 ${M}`
        ) : null
      ),
      extra: t.createElement(
        m,
        {
          size: "small",
          type: "text",
          icon: b ? t.createElement(b) : void 0,
          onClick: X,
          loading: G
        },
        "刷新"
      )
    },
    t.createElement(u, {
      current: g,
      size: "small",
      items: Cn.map((d) => {
        const ee = _l[d];
        return {
          title: `${ee.icon} ${ee.label}`,
          description: d === "plan" ? "分析任务，创建任务分解" : d === "dispatch" ? "分派专家执行任务" : d === "verify" ? "交叉验证专家结果" : d === "synthesize" ? "综合形成最终报告" : "工作流完成"
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
        (d, ee) => t.createElement(
          c,
          { key: `${d.name}-${ee}`, style: { fontSize: 11 } },
          `${d.emoji || ""} ${d.name}（${d.role}）`
        )
      )
    ),
    w.task ? t.createElement(
      C,
      {
        style: {
          fontSize: 12,
          marginTop: 8,
          marginBottom: 0,
          color: "#666"
        },
        ellipsis: { rows: 2 }
      },
      `任务: ${w.task}`
    ) : null
  );
}
function Al({ team: e }) {
  const t = S().React, { Typography: l, Tag: a } = S().antd, { Text: n } = l, r = {
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
  }, c = e.steps || [], i = e.mode === "roundtable" || e.mode === "router", m = {
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
        background: "#fafafa",
        borderRadius: 8,
        border: "1px dashed #d9d9d9"
      }
    },
    t.createElement(
      n,
      {
        type: "secondary",
        style: { fontSize: 12, display: "block", marginBottom: 8 }
      },
      `OMP 编排拓扑 · ${m[e.mode] || e.mode}`
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
      ...c.length > 0 ? c.map((u, E) => [
        E > 0 && !i ? t.createElement(
          "div",
          {
            key: `arrow-${E}`,
            style: {
              textAlign: "center",
              color: s[e.mode],
              fontSize: 14
            }
          },
          r[e.mode]
        ) : null,
        t.createElement(
          "div",
          {
            key: `step-${E}`,
            style: {
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "6px 10px",
              background: "#fff",
              borderRadius: 6,
              border: `1px solid ${s[e.mode]}33`,
              fontSize: 12,
              flex: i ? "1 1 200px" : "initial"
            }
          },
          t.createElement(Be, {
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
                  color: "#8c8c8c",
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
      ]).flat() : e.members.map((u, E) => [
        E > 0 && !i ? t.createElement(
          "div",
          {
            key: `arrow-${E}`,
            style: {
              textAlign: "center",
              color: s[e.mode],
              fontSize: 14
            }
          },
          r[e.mode]
        ) : null,
        t.createElement(
          "div",
          {
            key: `member-${E}`,
            style: {
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "6px 10px",
              background: "#fff",
              borderRadius: 6,
              border: `1px solid ${s[e.mode]}33`,
              fontSize: 12,
              flex: i ? "1 1 150px" : "initial"
            }
          },
          t.createElement(Be, {
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
              { style: { fontSize: 11, color: "#8c8c8c" } },
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
const Pl = [
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
  agents: l,
  editingTeam: a,
  onSaved: n
}) {
  const r = S().React, { useState: s, useEffect: c, useCallback: i } = r, {
    Modal: m,
    Input: u,
    Button: E,
    Select: y,
    Tag: b,
    Typography: T,
    Switch: C,
    Empty: x,
    message: I,
    Divider: j,
    Steps: F
  } = S().antd, { PlusOutlined: G, DeleteOutlined: H, SaveOutlined: q, ArrowRightOutlined: J } = S().antdIcons || {}, { Text: O, Paragraph: z } = T, [W, X] = s(""), [w, f] = s("🤝"), [g, $] = s(""), [h, D] = s("pipeline"), [Z, M] = s(""), [k, d] = s(""), [ee, U] = s([]), [v, B] = s([]), [re, V] = s(!1), [Q, pe] = s(2), [A, _] = s(""), [le, te] = s(""), [ne, ge] = s({}), [be, Se] = s({}), [Ce, ye] = s(
    Pl
  ), ae = [
    { value: "pipeline", icon: "→", title: "顺序交接", description: "上一步产物成为下一位专家的上下文", topology: "A → B → C", accent: "#08979c" },
    { value: "roundtable", icon: "⇉", title: "并行汇聚", description: "独立并行分析，避免观点相互污染", topology: "A ∥ B ∥ C → 汇总", accent: "#531dab" },
    { value: "coordinator", icon: "◎", title: "主管协作", description: "主控专家拆解任务并按需组织成员", topology: "主管 → 专家组", accent: "#0958d9" },
    { value: "router", icon: "◇", title: "智能路由", description: "按任务能力需求选择最小充分专家集合", topology: "任务 → 路由 → 子集", accent: "#d46b08" },
    { value: "review_loop", icon: "↻", title: "评审迭代", description: "产出、独立审查、修订，直到满足标准", topology: "执行 ⇄ 评审", accent: "#389e0d" },
    { value: "debate", icon: "⚖", title: "多方论证", description: "独立立场、交叉质询，再由裁决者综合", topology: "观点 ⇄ 反驳 → 裁决", accent: "#c41d7f" }
  ];
  c(() => {
    e && (a ? (X(a.name), f(a.emoji), $(a.description), D(a.mode), M(a.coordinatorName || ""), d(a.taskTemplate), U(a.steps || []), B(a.members.map((p) => p.name)), pe(a.maxReviewRounds || 2), _(a.successCriteria || ""), te(a.routingInstruction || ""), ge(
      Object.fromEntries(
        a.members.map((p) => [
          p.name,
          p.bindingMode || (p.agentId ? "fixed" : "preferred")
        ])
      )
    ), Se(
      Object.fromEntries(
        a.members.map((p) => [
          p.name,
          p.roleKey || pt(p.name)
        ])
      )
    )) : (X(""), f("🤝"), $(""), D("pipeline"), M(""), d(`请执行以下任务：
任务描述：{任务描述}`), U([]), B([]), pe(2), _(""), te(""), ge({}), Se({})));
  }, [e, a]), c(() => {
    e && Tl().then((p) => {
      p != null && p.length && ye(p);
    });
  }, [e]);
  const he = i(() => {
    if (h === "roundtable" || h === "debate" || h === "router") {
      const p = v.map((de) => ({
        agentName: de,
        instruction: "请给出你的专业评估意见",
        passContext: !1
      }));
      U(p);
    } else if (h === "pipeline") {
      const p = new Map(ee.map((L) => [L.agentName, L])), de = v.map((L) => p.get(L) || {
        agentName: L,
        instruction: "请完成你的专业部分",
        passContext: !0
      });
      U(de);
    }
  }, [h, v, ee]), ue = (p) => {
    v.includes(p) || (B([...v, p]), ge({ ...ne, [p]: "fixed" }), Se({
      ...be,
      [p]: pt(p)
    }), (h === "coordinator" || h === "debate") && !Z && M(p));
  }, K = (p) => {
    const de = v.filter((fe) => fe !== p);
    B(de), U(ee.filter((fe) => fe.agentName !== p));
    const L = { ...ne };
    delete L[p], ge(L);
    const oe = { ...be };
    delete oe[p], Se(oe), Z === p && M(de[0] || "");
  }, se = (p, de, L) => {
    const oe = [...ee];
    oe[p] = { ...oe[p], [de]: L }, U(oe);
  }, me = async () => {
    if (!W.trim()) {
      I.warning("请输入团队名称");
      return;
    }
    if (v.length < 2) {
      I.warning("至少需要选择 2 个成员");
      return;
    }
    if (!k.trim()) {
      I.warning("请输入任务模板");
      return;
    }
    if ((h === "coordinator" || h === "debate") && !Z) {
      I.warning(h === "debate" ? "请选择裁决者" : "请选择主控专家");
      return;
    }
    V(!0);
    try {
      let p = [...v];
      h === "coordinator" && Z ? p = [Z, ...p.filter((Te) => Te !== Z)] : h === "debate" && Z && (p = [...p.filter((Te) => Te !== Z), Z]);
      const de = p.map(
        (Te) => {
          var De;
          const Me = l.find((ke) => ke.name === Te), Le = ne[Te] || "fixed", Ue = be[Te] || pt(Te), Ne = Ce.find((ke) => ke.key === Ue);
          return {
            name: Te,
            role: (Ne == null ? void 0 : Ne.display_name) || ((De = Me == null ? void 0 : Me.description) == null ? void 0 : De.slice(0, 30)) || "需求分析师",
            emoji: "",
            agentId: Le === "temporary" || Me == null ? void 0 : Me.id,
            roleKey: Ue,
            bindingMode: Le
          };
        }
      );
      let L = ee;
      (ee.length === 0 || ee.length !== v.length) && (L = v.map((Te) => ({
        agentName: Te,
        instruction: "请完成你的专业部分",
        passContext: h === "pipeline"
      })));
      const oe = {
        id: (a == null ? void 0 : a.id) || `custom-${Date.now()}`,
        name: W.trim(),
        emoji: w,
        category: "自定义",
        description: g.trim() || `${W.trim()}（${v.length}人团队）`,
        mode: h,
        members: de,
        coordinatorName: h === "coordinator" || h === "debate" ? Z : void 0,
        taskTemplate: k.trim(),
        orchestrationPrompt: "",
        // Custom teams use steps-based instructions
        steps: L,
        custom: !0,
        createdAt: (a == null ? void 0 : a.createdAt) || Date.now(),
        maxReviewRounds: Q,
        successCriteria: A.trim(),
        routingInstruction: le.trim()
      }, fe = await qn(oe), ve = rt(), Ae = ve.findIndex((Te) => Te.id === fe.id);
      Ae >= 0 ? ve[Ae] = fe : ve.push(fe), Ht(ve), I.success(a ? "团队已更新" : "团队已创建"), n(), t();
    } catch (p) {
      I.error(p.message || "保存失败");
    } finally {
      V(!1);
    }
  }, N = l.filter(
    (p) => !v.includes(p.name)
  );
  return r.createElement(
    m,
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
      onOk: me,
      okText: "保存专家团",
      confirmLoading: re,
      okButtonProps: {
        icon: q ? r.createElement(q) : void 0
      }
    },
    // Step 1: Basic info
    r.createElement(
      "div",
      { style: { marginBottom: 16 } },
      r.createElement(
        O,
        {
          strong: !0,
          style: { display: "block", marginBottom: 8, fontSize: 13 }
        },
        "1. 定义任务工作流"
      ),
      r.createElement(
        "div",
        { style: { display: "flex", gap: 8, marginBottom: 8, alignItems: "center" } },
        v.length > 0 ? r.createElement(Gt, {
          members: v,
          size: 36
        }) : null,
        r.createElement(u, {
          placeholder: "专家团名称（如：储层评价与质量复核专家团）",
          value: W,
          onChange: (p) => X(p.target.value),
          style: { flex: 1 }
        })
      ),
      r.createElement(u.TextArea, {
        placeholder: "说明这个工作流解决什么问题、适用于什么场景",
        value: g,
        onChange: (p) => $(p.target.value),
        rows: 2,
        style: { marginBottom: 8 }
      }),
      r.createElement(
        O,
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
        ...ae.map((p) => {
          const de = h === p.value;
          return r.createElement(
            "button",
            {
              key: p.value,
              type: "button",
              onClick: () => {
                D(p.value), p.value !== "coordinator" && p.value !== "debate" && M("");
              },
              style: {
                textAlign: "left",
                padding: 10,
                borderRadius: 8,
                cursor: "pointer",
                background: de ? `${p.accent}0d` : "#fff",
                border: `1px solid ${de ? p.accent : "#d9d9d9"}`,
                boxShadow: de ? `0 0 0 2px ${p.accent}1a` : "none"
              }
            },
            r.createElement(
              "div",
              { style: { display: "flex", alignItems: "center", gap: 7, color: p.accent, fontWeight: 600 } },
              r.createElement("span", { style: { fontSize: 18 } }, p.icon),
              p.title
            ),
            r.createElement("div", { style: { fontSize: 11, color: "#595959", marginTop: 5, lineHeight: 1.45 } }, p.description),
            r.createElement("div", { style: { fontSize: 10, color: p.accent, marginTop: 5, fontFamily: "monospace" } }, p.topology)
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
        O,
        {
          strong: !0,
          style: { display: "block", marginBottom: 8, fontSize: 13 }
        },
        "2. 配置专家角色"
      ),
      // Available agents
      N.length > 0 ? r.createElement(
        "div",
        {
          style: {
            display: "flex",
            gap: 6,
            flexWrap: "wrap",
            marginBottom: 8,
            padding: 8,
            background: "#f5f5f5",
            borderRadius: 6
          }
        },
        ...N.map(
          (p) => r.createElement(
            E,
            {
              key: p.id,
              size: "small",
              icon: G ? r.createElement(G) : void 0,
              onClick: () => ue(p.name)
            },
            p.name
          )
        )
      ) : null,
      // Selected members
      v.length === 0 ? r.createElement(x, {
        description: "请从上方添加团队成员",
        image: x.PRESENTED_IMAGE_SIMPLE
      }) : r.createElement(
        "div",
        { style: { display: "flex", flexDirection: "column", gap: 4 } },
        ...v.map(
          (p) => r.createElement(
            "div",
            {
              key: p,
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
              r.createElement(Be, { name: p, size: 24 }),
              r.createElement(
                O,
                { strong: !0, style: { fontSize: 13 } },
                p
              ),
              (h === "coordinator" || h === "debate") && Z === p ? r.createElement(
                b,
                { color: "blue", style: { fontSize: 10 } },
                h === "debate" ? "裁决者" : "主控"
              ) : null
            ),
            r.createElement(
              "div",
              { style: { display: "flex", gap: 4 } },
              r.createElement(y, {
                size: "small",
                value: be[p] || pt(p),
                style: { width: 132 },
                onChange: (de) => Se({ ...be, [p]: de }),
                options: Ce.map((de) => ({
                  value: de.key,
                  label: de.display_name
                }))
              }),
              r.createElement(y, {
                size: "small",
                value: ne[p] || "fixed",
                style: { width: 118 },
                onChange: (de) => ge({ ...ne, [p]: de }),
                options: [
                  { value: "fixed", label: "固定实例" },
                  { value: "preferred", label: "优先实例" },
                  { value: "temporary", label: "临时派生" }
                ]
              }),
              h === "coordinator" || h === "debate" ? r.createElement(
                E,
                {
                  size: "small",
                  type: "link",
                  onClick: () => M(p)
                },
                h === "debate" ? "设为裁决者" : "设为主控"
              ) : null,
              r.createElement(
                E,
                {
                  size: "small",
                  type: "link",
                  danger: !0,
                  icon: H ? r.createElement(H) : void 0,
                  onClick: () => K(p)
                },
                "移除"
              )
            )
          )
        )
      )
    ),
    h === "review_loop" || h === "router" ? r.createElement(
      "div",
      {
        style: {
          margin: "0 0 16px",
          padding: 12,
          borderRadius: 8,
          background: "#fafafa",
          border: "1px solid #f0f0f0"
        }
      },
      h === "review_loop" ? r.createElement(
        "div",
        { style: { display: "grid", gridTemplateColumns: "150px 1fr", gap: 10 } },
        r.createElement(y, {
          value: Q,
          onChange: (p) => pe(p),
          options: [1, 2, 3, 4, 5].map((p) => ({ value: p, label: `最多 ${p} 轮` }))
        }),
        r.createElement(u, {
          value: A,
          onChange: (p) => _(p.target.value),
          placeholder: "验收标准，例如：关键结论均有数据依据，且无高风险缺陷"
        })
      ) : r.createElement(u, {
        value: le,
        onChange: (p) => te(p.target.value),
        placeholder: "路由偏好，例如：仅调用任务必需的专家；涉及模拟时优先油藏工程师"
      })
    ) : null,
    r.createElement(j, { style: { margin: "12px 0" } }),
    // Step 3: Define execution steps (for pipeline/roundtable)
    v.length > 0 ? r.createElement(
      "div",
      { style: { marginBottom: 16 } },
      r.createElement(
        O,
        {
          strong: !0,
          style: { display: "block", marginBottom: 8, fontSize: 13 }
        },
        `3. 配置专家任务${h === "roundtable" ? "（并行独立）" : h === "pipeline" ? "（顺序交接）" : h === "router" ? "（作为候选能力）" : h === "review_loop" ? "（首位执行、末位评审）" : h === "debate" ? "（末位为裁决者）" : "（由主控动态编排）"}`
      ),
      // Auto-sync button
      r.createElement(
        E,
        {
          size: "small",
          type: "dashed",
          onClick: he,
          style: { marginBottom: 8 }
        },
        "自动生成步骤"
      ),
      // Steps list
      ee.length === 0 ? r.createElement(
        O,
        { type: "secondary", style: { fontSize: 12 } },
        "点击「自动生成步骤」或手动配置每步的指令"
      ) : r.createElement(
        "div",
        { style: { display: "flex", flexDirection: "column", gap: 6 } },
        ...ee.map(
          (p, de) => r.createElement(
            "div",
            {
              key: de,
              style: {
                padding: 8,
                background: "#fff",
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
              h === "pipeline" ? r.createElement(
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
                b,
                { color: "blue", style: { fontSize: 11 } },
                p.agentName
              ),
              r.createElement(
                "div",
                { style: { flex: 1 } },
                r.createElement(u, {
                  placeholder: "请输入该步骤的指令...",
                  value: p.instruction,
                  onChange: (L) => se(de, "instruction", L.target.value),
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
                checked: p.passContext,
                onChange: (L) => se(de, "passContext", L)
              }),
              r.createElement(
                O,
                { type: "secondary", style: { fontSize: 11 } },
                p.passContext ? "传递上一步结果作为上下文" : "独立执行"
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
        O,
        {
          strong: !0,
          style: { display: "block", marginBottom: 8, fontSize: 13 }
        },
        `${v.length > 0 ? "4" : "3"}. 任务模板`
      ),
      r.createElement(u.TextArea, {
        placeholder: `输入任务模板，可用 {参数名} 作为占位符...

例如：
请对区块 {区块名} 的井 {井号} 进行储层评价`,
        value: k,
        onChange: (p) => d(p.target.value),
        rows: 4,
        style: { fontFamily: "monospace", fontSize: 13 }
      }),
      r.createElement(
        O,
        {
          type: "secondary",
          style: { fontSize: 11, display: "block", marginTop: 4 }
        },
        "占位符 {参数名} 在发起任务时可由用户填写替换"
      )
    )
  );
}
function Tn({
  team: e,
  agents: t,
  onLaunch: l,
  onEdit: a,
  onDelete: n
}) {
  var f;
  const r = S().React, { useState: s } = r, { Card: c, Tag: i, Typography: m, Button: u, Tooltip: E, Popconfirm: y } = S().antd, {
    TeamOutlined: b,
    RocketOutlined: T,
    UserOutlined: C,
    EditOutlined: x,
    DeleteOutlined: I,
    DownOutlined: j,
    UpOutlined: F
  } = S().antdIcons || {}, { Text: G, Paragraph: H } = m, [q, J] = s(!1), O = {
    coordinator: { label: "主管协作", color: "blue" },
    pipeline: { label: "顺序交接", color: "cyan" },
    roundtable: { label: "并行汇聚", color: "purple" },
    router: { label: "智能路由", color: "orange" },
    review_loop: { label: "评审迭代", color: "green" },
    debate: { label: "多方论证", color: "magenta" }
  }, z = O[e.mode] || O.coordinator, W = e.members.map((g) => {
    const $ = g.bindingMode === "temporary", h = $ ? null : (g.agentId && t.some((D) => D.id === g.agentId) ? g.agentId : null) || Xn(t, g.name);
    return { ...g, found: !!h, agentId: h, temporary: $ };
  }), X = W.filter((g) => g.found).length, w = e.coordinatorName || ((f = e.members[0]) == null ? void 0 : f.name);
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
      r.createElement(Gt, {
        members: e.members.map((g) => g.name),
        size: 36
      }),
      r.createElement(
        "div",
        { style: { flex: 1 } },
        r.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 6 } },
          r.createElement(
            G,
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
            { color: z.color, style: { fontSize: 10 } },
            z.label
          ),
          r.createElement(
            i,
            { color: "green", style: { fontSize: 10 } },
            `${e.members.length} 位专家`
          ),
          X < e.members.length ? r.createElement(
            E,
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
          E,
          { title: "编辑" },
          r.createElement(u, {
            type: "text",
            size: "small",
            icon: x ? r.createElement(x) : void 0,
            onClick: (g) => {
              g.stopPropagation(), a(e);
            }
          })
        ) : null,
        n ? r.createElement(
          E,
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
              icon: I ? r.createElement(I) : void 0,
              onClick: (g) => g.stopPropagation()
            })
          )
        ) : null
      ) : null
    ),
    // Description
    r.createElement(
      H,
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
        (g) => r.createElement(
          E,
          {
            key: g.name,
            title: `${g.name}（${g.role}）${g.temporary ? " - OMP 临时派生" : g.found ? " - 已绑定实例" : " - OMP 按角色派发"}`
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
                background: g.found ? "#f0f5ff" : "#f0f0ff",
                border: `1px solid ${g.found ? "#d6e4ff" : "#d3adf7"}`,
                fontSize: 11
              }
            },
            r.createElement(Be, { name: g.name, size: 18 }),
            r.createElement(
              G,
              {
                style: { fontSize: 11, color: g.found ? "#1f4e8c" : "#531dab" }
              },
              g.name
            ),
            g.temporary ? r.createElement(
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
        onClick: (g) => {
          g.stopPropagation(), J(!q);
        },
        icon: q ? F ? r.createElement(F) : "▲" : j ? r.createElement(j) : "▼"
      },
      q ? "收起流程" : "查看执行流程"
    ),
    q ? r.createElement(Al, { team: e }) : null,
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
        G,
        { type: "secondary", style: { fontSize: 11 } },
        w ? `${e.mode === "debate" ? "裁决者" : "主控"}: ${w}` : "OMP 动态编排"
      ),
      r.createElement(
        u,
        {
          type: "primary",
          size: "small",
          icon: T ? r.createElement(T) : void 0,
          disabled: t.length === 0,
          onClick: () => l(e),
          style: Pe
        },
        "运行工作流"
      )
    )
  );
}
function Ol({
  agents: e,
  onLaunch: t
}) {
  const l = S().React, { useMemo: a, useState: n, useCallback: r, useEffect: s } = l, {
    Row: c,
    Col: i,
    Input: m,
    Empty: u,
    Typography: E,
    Tag: y,
    Button: b,
    Divider: T,
    Tabs: C,
    message: x
  } = S().antd, { SearchOutlined: I, PlusOutlined: j, RocketOutlined: F } = S().antdIcons || {}, { Text: G } = E, [H, q] = n(""), [J, O] = n([]), [z, W] = n([]), [X, w] = n(!1), [f, g] = n(null);
  s(() => {
    O(rt());
    let U = !0;
    return (async () => {
      try {
        await bl();
        const v = await Ot();
        U && O(v);
      } catch (v) {
        console.warn("[ugsci] Failed to load backend expert teams:", v), U && x.warning("专家团后端同步失败，当前显示本地缓存");
      }
    })(), Cl().then((v) => {
      U && v && W(v);
    }), () => {
      U = !1;
    };
  }, []);
  const $ = r(() => {
    Ot().then(O).catch((U) => {
      console.warn("[ugsci] Failed to refresh expert teams:", U), O(rt());
    });
  }, []), h = r(
    (U) => {
      vl(U.id).then(() => {
        const B = rt().filter((re) => re.id !== U.id);
        Ht(B), O(B), x.success(`团队「${U.name}」已删除`);
      }).catch((v) => x.error(v.message || "删除专家团失败"));
    },
    [x]
  ), D = r((U) => {
    g(U), w(!0);
  }, []), Z = r(() => {
    g(null), w(!0);
  }, []), M = a(() => [...J, ...z], [J, z]), k = a(() => {
    if (!H.trim()) return M;
    const U = H.toLowerCase();
    return M.filter(
      (v) => v.name.toLowerCase().includes(U) || v.description.toLowerCase().includes(U) || v.category.toLowerCase().includes(U)
    );
  }, [M, H]), d = k.filter((U) => U.custom), ee = k.filter((U) => !U.custom);
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
      l.createElement(m, {
        placeholder: "搜索团队名称、描述或类别...",
        prefix: I ? l.createElement(I) : void 0,
        value: H,
        onChange: (U) => q(U.target.value),
        allowClear: !0,
        style: { flex: "1 1 280px", maxWidth: 400 }
      }),
      l.createElement(
        b,
        {
          type: "primary",
          size: "small",
          icon: j ? l.createElement(j) : void 0,
          onClick: Z,
          style: Pe
        },
        "创建专家团"
      )
    ),
    // Tabs: preset teams vs custom teams
    l.createElement(
      C,
      {
        defaultActiveKey: "preset",
        items: [
          {
            key: "preset",
            label: `预设团队${ee.length ? ` (${ee.length})` : ""}`,
            children: l.createElement(
              "div",
              null,
              ee.length > 0 ? l.createElement(
                c,
                { gutter: [12, 12] },
                ...ee.map(
                  (U) => l.createElement(
                    i,
                    { key: U.id, xs: 24, sm: 12, md: 8 },
                    l.createElement(Tn, {
                      team: U,
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
            label: `自定义团队${d.length ? ` (${d.length})` : ""}`,
            children: l.createElement(
              "div",
              null,
              d.length > 0 ? l.createElement(
                c,
                { gutter: [12, 12] },
                ...d.map(
                  (U) => l.createElement(
                    i,
                    { key: U.id, xs: 24, sm: 12, md: 8 },
                    l.createElement(Tn, {
                      team: U,
                      agents: e,
                      onLaunch: t,
                      onEdit: D,
                      onDelete: h
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
              l.createElement(zl),
              l.createElement(kn, { activeOnly: !0 })
            )
          },
          {
            key: "history",
            label: "讨论历史",
            children: l.createElement(kn)
          }
        ]
      }
    ),
    // Team Builder Modal
    l.createElement($l, {
      open: X,
      onClose: () => {
        w(!1), g(null);
      },
      agents: e,
      editingTeam: f,
      onSaved: $
    })
  );
}
const Rl = [
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
];
function Ml(e) {
  window.history.pushState({}, "", e), window.dispatchEvent(new PopStateEvent("popstate"));
}
function $t(e, t) {
  const l = new URLSearchParams();
  e && l.set("flow", e), t && l.set("run", t), Ml(`/flowforge${l.size ? `?${l.toString()}` : ""}`);
}
function Ll() {
  const e = S().React, { useCallback: t, useEffect: l, useState: a } = e, {
    Button: n,
    Card: r,
    Col: s,
    Empty: c,
    Input: i,
    Row: m,
    Space: u,
    Spin: E,
    Tabs: y,
    Tag: b,
    Typography: T,
    message: C
  } = S().antd, { ApartmentOutlined: x, ReloadOutlined: I, RocketOutlined: j } = S().antdIcons || {}, { Text: F, Paragraph: G, Title: H } = T, q = S().useSelectedAgent, J = q ? q() : { id: "default" }, O = (J == null ? void 0 : J.id) || "default", [z, W] = a([]), [X, w] = a([]), [f, g] = a([]), [$, h] = a(!0), [D, Z] = a(!0), [M, k] = a(null), [d, ee] = a(""), [U, v] = a(""), B = t(async () => {
    h(!0);
    try {
      const [_, le, te] = await Promise.all([
        ie("/flowforge/flows", { bypassCache: !0 }),
        ie("/flowforge/runs", { bypassCache: !0 }),
        xt().catch(() => [])
      ]);
      W(_), w(le), g(te), Z(!0);
    } catch (_) {
      console.warn("[ugsci] FlowForge is unavailable:", _), Z(!1);
    } finally {
      h(!1);
    }
  }, []);
  l(() => {
    B();
  }, [B]);
  const re = t(
    async (_) => {
      k(_.key);
      try {
        const le = await ie(
          "/flowforge/generate",
          {
            method: "POST",
            body: JSON.stringify({
              prompt: _.sop,
              name: _.name,
              agent_id: O
            })
          }
        ), te = {
          ...le.nodes || {}
        }, ne = Object.entries(te).filter(([Se]) => /^step_\d+$/.test(Se)).sort(([Se], [Ce]) => Number(Se.slice(5)) - Number(Ce.slice(5))), ge = {};
        ne.forEach(([Se, Ce], ye) => {
          const ae = _.roleHints[ye] || "", he = _.roleKeys[ye] || "analyst", ue = f.find(
            (me) => `${me.name} ${me.id}`.toLowerCase().includes(ae.toLowerCase())
          ), K = (ue == null ? void 0 : ue.id) || O, se = { ...Ce.inputs || {} };
          se.agent_id = K, te[Se] = {
            ...Ce,
            inputs: se,
            metadata: {
              ...Ce.metadata || {},
              binding_policy: "fixed_instance",
              role_hint: ae,
              role_key: he,
              agent_id: K
            }
          }, ge[Se] = {
            binding_policy: "fixed_instance",
            role_hint: ae,
            role_key: he,
            agent_id: K
          };
        });
        const be = {
          ...le,
          nodes: te,
          id: `${_.key}-${Date.now()}`,
          name: _.name,
          description: _.description,
          metadata: {
            ...le.metadata || {},
            domain: "oil-gas",
            template_key: _.key,
            expert_binding_policy: "fixed_instance",
            controller_agent_id: O,
            node_bindings: ge
          }
        };
        await ie("/flowforge/flows", {
          method: "POST",
          body: JSON.stringify(be)
        }), C.success(`已创建工作流草稿「${_.name}」`), await B();
      } catch (le) {
        C.error(le.message || "创建工作流失败");
      } finally {
        k(null);
      }
    },
    [f, O, B, C]
  ), V = t(async () => {
    if (!U.trim()) {
      C.warning("请先描述工作流步骤和控制要求");
      return;
    }
    k("natural-language");
    try {
      const _ = await ie(
        "/flowforge/generate",
        {
          method: "POST",
          body: JSON.stringify({
            prompt: U.trim(),
            name: d.trim(),
            agent_id: O
          })
        }
      ), le = {
        ..._,
        id: `natural-${Date.now()}`,
        metadata: {
          ..._.metadata || {},
          domain: "oil-gas",
          source: "natural-language",
          expert_binding_policy: "fixed_instance",
          controller_agent_id: O
        }
      };
      await ie("/flowforge/flows", {
        method: "POST",
        body: JSON.stringify(le)
      }), C.success("已从自然语言生成可编辑工作流草稿"), ee(""), v(""), await B();
    } catch (_) {
      C.error(_.message || "自然语言生成失败");
    } finally {
      k(null);
    }
  }, [O, B, C, d, U]), Q = e.createElement(
    "div",
    null,
    e.createElement(
      r,
      {
        size: "small",
        title: "用自然语言生成工作流",
        style: { marginBottom: 16 }
      },
      e.createElement(
        u,
        { direction: "vertical", style: { width: "100%" }, size: 10 },
        e.createElement(i, {
          value: d,
          onChange: (_) => ee(_.target.value),
          placeholder: "工作流名称（可选）",
          maxLength: 80
        }),
        e.createElement(i.TextArea, {
          value: U,
          onChange: (_) => v(_.target.value),
          placeholder: "例如：先检查某储气库本周期压力和注采量数据，再由油藏工程师预测下周期能力，由独立完整性专家复核风险，最后形成带证据和不确定性的建议。",
          autoSize: { minRows: 3, maxRows: 8 }
        }),
        e.createElement(
          n,
          {
            type: "primary",
            onClick: () => void V(),
            loading: M === "natural-language",
            disabled: !D,
            style: Pe
          },
          "生成可编辑草稿"
        )
      )
    ),
    e.createElement(
      m,
      { gutter: [12, 12] },
      ...Rl.map(
        (_) => e.createElement(
          s,
          { key: _.key, xs: 24, md: 8 },
          e.createElement(
            r,
            { style: { height: "100%" } },
            e.createElement(
              u,
              { align: "start", style: { width: "100%" } },
              e.createElement("span", { style: { fontSize: 28 } }, _.icon),
              e.createElement(
                "div",
                { style: { flex: 1 } },
                e.createElement(H, { level: 5, style: { margin: 0 } }, _.name),
                e.createElement(b, { color: "blue", style: { marginTop: 6 } }, _.category),
                e.createElement(
                  G,
                  { type: "secondary", style: { margin: "10px 0 14px" } },
                  _.description
                ),
                e.createElement(
                  n,
                  {
                    type: "primary",
                    loading: M === _.key,
                    disabled: !D,
                    onClick: () => void re(_),
                    style: Pe
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
      r,
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
          ([_, le, te]) => e.createElement(
            s,
            { key: _, xs: 24, sm: 12, lg: 6 },
            e.createElement(F, { strong: !0 }, _),
            e.createElement(
              b,
              {
                color: te === "当前可执行" ? "green" : "default",
                style: { marginLeft: 6, fontSize: 10 }
              },
              te
            ),
            e.createElement("div", { style: { color: "#8c8c8c", fontSize: 12, marginTop: 4 } }, le)
          )
        )
      )
    )
  ), pe = $ ? e.createElement(E) : z.length === 0 ? e.createElement(c, { description: "暂无工作流，可从模板创建" }) : e.createElement(
    m,
    { gutter: [12, 12] },
    ...z.map(
      (_) => e.createElement(
        s,
        { key: _.id, xs: 24, md: 12, xl: 8 },
        e.createElement(
          r,
          {
            size: "small",
            title: _.name,
            extra: e.createElement(b, null, `v${_.version}`)
          },
          e.createElement(G, { ellipsis: { rows: 2 } }, _.description || "暂无描述"),
          e.createElement(
            u,
            null,
            e.createElement(b, { color: "geekblue" }, `${_.node_count} 个节点`),
            e.createElement(n, { size: "small", onClick: () => $t(_.id) }, "打开编辑器")
          )
        )
      )
    )
  ), A = $ ? e.createElement(E) : X.length === 0 ? e.createElement(c, { description: "暂无工作流运行记录" }) : e.createElement(
    "div",
    { style: { display: "flex", flexDirection: "column", gap: 8 } },
    ...X.map(
      (_) => e.createElement(
        r,
        { key: _.run_id, size: "small" },
        e.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 10 } },
          e.createElement(b, { color: _.status === "completed" ? "green" : _.status === "failed" ? "red" : "blue" }, _.status),
          e.createElement(F, { strong: !0 }, _.flow_id),
          e.createElement(F, { type: "secondary", style: { fontFamily: "monospace" } }, _.run_id),
          _.error ? e.createElement(F, { type: "danger" }, _.error) : null,
          e.createElement(
            n,
            { size: "small", type: "link", onClick: () => $t(void 0, _.run_id) },
            "查看详情"
          )
        )
      )
    )
  );
  return e.createElement(
    "div",
    null,
    e.createElement(y, {
      items: [
        { key: "templates", label: "工作流模板", children: Q },
        { key: "mine", label: `我的工作流 (${z.length})`, children: pe },
        { key: "runs", label: `运行中心 (${X.length})`, children: A }
      ],
      tabBarExtraContent: e.createElement(
        u,
        null,
        e.createElement(n, {
          icon: I ? e.createElement(I) : void 0,
          onClick: () => void B(),
          loading: $
        }, "刷新"),
        e.createElement(n, {
          type: "primary",
          icon: x ? e.createElement(x) : j ? e.createElement(j) : void 0,
          onClick: () => $t(),
          disabled: !D,
          style: Pe
        }, "打开流程编辑器")
      )
    })
  );
}
function _n(e, t) {
  var n, r;
  const l = e.coordinatorName || ((n = e.members[0]) == null ? void 0 : n.name), a = e.members.find((s) => s.name === l) || e.members[0];
  if ((a == null ? void 0 : a.bindingMode) !== "temporary" && (a != null && a.agentId) && t.some((s) => s.id === a.agentId))
    return a.agentId;
  if (l && (a == null ? void 0 : a.bindingMode) !== "temporary") {
    const s = Xn(t, l);
    if (s) return s;
  }
  return (a == null ? void 0 : a.bindingMode) === "fixed" ? null : ((r = t[0]) == null ? void 0 : r.id) || null;
}
function In() {
  const e = new URLSearchParams(window.location.search).get("section");
  return e === "teams" || e === "workflows" ? e : "experts";
}
function Bl() {
  var se, me;
  const e = S().React, { useState: t, useEffect: l, useCallback: a, useMemo: n } = e, {
    Spin: r,
    Empty: s,
    Input: c,
    Button: i,
    message: m,
    Row: u,
    Col: E,
    Tabs: y,
    Modal: b,
    Typography: T
  } = S().antd, {
    ReloadOutlined: C,
    PlusOutlined: x,
    SearchOutlined: I,
    TeamOutlined: j,
    UserOutlined: F
  } = S().antdIcons || {}, { Text: G, Paragraph: H } = T, [q, J] = t([]), [O, z] = t(!0), [W, X] = t(!1), [w, f] = t(null), [g, $] = t(""), [h, D] = t(!1), [Z, M] = t(In), [k, d] = t(
    null
  ), [ee, U] = t(""), [v, B] = t(!1), [re, V] = t(!1), [Q, pe] = t(null), [A, _] = t([]), le = a(async () => {
    z(!0);
    try {
      const N = await xt(), p = await Promise.all(
        N.map(async (de) => {
          try {
            const [L, oe, fe] = await Promise.all([
              jt(de.id).catch(() => null),
              kt(de.id).catch(() => []),
              Dt(de.id).catch(() => [])
            ]);
            return {
              agent: de,
              config: L,
              skills: oe,
              mcps: fe,
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
      J(p), _(N);
    } catch (N) {
      m.error(N.message || "加载专家列表失败"), J([]);
    } finally {
      z(!1);
    }
  }, []);
  l(() => {
    le();
  }, [le]), l(() => {
    const N = () => M(In());
    return window.addEventListener("popstate", N), () => window.removeEventListener("popstate", N);
  }, []), l(() => {
    if (Q && re) {
      const N = q.find(
        (p) => p.agent.id === Q.agent.id
      );
      N && N !== Q && pe(N);
    }
  }, [q, Q, re]);
  const te = a(
    async (N) => {
      var oe;
      const p = N.coordinatorName || ((oe = N.members[0]) == null ? void 0 : oe.name), de = _n(N, A);
      if (!de) {
        const fe = N.members.find(
          (ve) => ve.name === p
        );
        m.error(
          (fe == null ? void 0 : fe.bindingMode) === "fixed" ? `固定协调者「${p || "协调者"}」当前不可用，请修复绑定后再运行` : "没有可用的 Agent 作为工作流控制器"
        );
        return;
      }
      if (/\{.+?\}/.test(N.taskTemplate)) {
        U(N.taskTemplate), d(N);
        return;
      }
      await ne(N, de, N.taskTemplate);
    },
    [A, m]
  ), ne = a(
    async (N, p, de) => {
      B(!0);
      try {
        const L = de || N.taskTemplate, oe = N.custom ? `@${N.id}` : N.name, fe = `/ugsci-team ${N.mode} ${oe} ${L}`, ve = S();
        ve.setSelectedAgent && ve.setSelectedAgent(p);
        const Ae = await wl(
          p,
          fe,
          N.name
        );
        m.success(
          `OMP 工作流已启动：${N.name}（${N.mode}模式）`
        ), d(null), ge(`/chat/${Ae}`);
      } catch (L) {
        m.error(L.message || "发起团队任务失败");
      } finally {
        B(!1);
      }
    },
    [m]
  ), ge = (N) => {
    window.history.pushState({}, "", N), window.dispatchEvent(new PopStateEvent("popstate"));
  }, be = a((N) => {
    f(N), X(!0);
  }, []), Se = a((N) => {
    pe(N), V(!0);
  }, []), Ce = a(
    (N) => {
      if (!N.agent.enabled) {
        m.warning(`专家「${N.agent.name}」未启用，请先启用`);
        return;
      }
      try {
        const p = S();
        p.setSelectedAgent && p.setSelectedAgent(N.agent.id);
      } catch (p) {
        console.warn("[ugsci] Failed to set selected agent:", p);
      }
      m.success(`已召唤专家「${N.agent.name}」，正在跳转至对话...`), ge("/chat");
    },
    [m]
  ), ye = n(() => {
    if (!g.trim()) return q;
    const N = g.toLowerCase();
    return q.filter(
      (p) => {
        var de;
        return p.agent.name.toLowerCase().includes(N) || ((de = p.agent.description) == null ? void 0 : de.toLowerCase().includes(N)) || p.agent.id.toLowerCase().includes(N) || p.skills.some((L) => L.name.toLowerCase().includes(N));
      }
    );
  }, [q, g]), ae = q.filter((N) => N.agent.enabled).length, he = q.reduce(
    (N, p) => N + p.skills.filter((de) => de.enabled !== !1).length,
    0
  ), ue = q.reduce((N, p) => N + p.mcps.length, 0), K = [
    {
      key: "experts",
      label: e.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        F ? e.createElement(F, { style: { fontSize: 14 } }) : null,
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
            prefix: I ? e.createElement(I) : void 0,
            value: g,
            onChange: (N) => $(N.target.value),
            allowClear: !0,
            style: { flex: "1 1 280px", maxWidth: 400 }
          }),
          e.createElement(
            i,
            {
              type: "primary",
              icon: x ? e.createElement(x) : void 0,
              onClick: () => D(!0),
              style: Pe
            },
            "创建专家"
          )
        ),
        // Content
        O ? e.createElement(
          "div",
          { style: { textAlign: "center", padding: 60 } },
          e.createElement(r, { size: "large" })
        ) : ye.length === 0 ? e.createElement(s, {
          description: g ? "未找到匹配的专家" : "暂无专家，点击「创建专家」添加"
        }) : e.createElement(
          u,
          { gutter: [12, 12], align: "stretch" },
          ...ye.map(
            (N) => e.createElement(
              E,
              {
                key: N.agent.id,
                xs: 24,
                sm: 12,
                md: 8,
                lg: 6,
                style: { display: "flex" }
              },
              e.createElement(ml, {
                expert: N,
                onClick: () => be(N),
                onSummon: () => Ce(N),
                onConfigure: () => Se(N)
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
      children: e.createElement(Ol, {
        agents: A,
        onLaunch: te
      })
    },
    {
      key: "workflows",
      label: e.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        (se = S().antdIcons) != null && se.ApartmentOutlined ? e.createElement(S().antdIcons.ApartmentOutlined, {
          style: { fontSize: 14 }
        }) : null,
        "协作工作流"
      ),
      children: e.createElement(Ll)
    }
  ];
  return e.createElement(
    "div",
    { style: { padding: 24 } },
    e.createElement(wt, {
      title: "专家·协作",
      subtitle: Z === "experts" ? `共 ${q.length} 位专家（${ae} 位启用）· ${he} 个技能 · ${ue} 个 MCP 客户端` : Z === "teams" ? "开放式多专家讨论、联合研判与 OMP 动态协作" : "流程化、可观测、可验证的油气与储气库协作流程",
      extra: e.createElement(
        e.Fragment,
        null,
        Z === "experts" ? e.createElement(
          i,
          {
            icon: C ? e.createElement(C) : void 0,
            onClick: () => {
              ot(), le();
            },
            loading: O
          },
          "刷新"
        ) : null
      )
    }),
    e.createElement(y, {
      items: K,
      activeKey: Z,
      onChange: (N) => {
        M(N);
        const p = new URL(window.location.href);
        N === "experts" ? p.searchParams.delete("section") : p.searchParams.set("section", N), window.history.pushState({}, "", `${p.pathname}${p.search}`);
      }
    }),
    // Drawer
    e.createElement(ul, {
      expert: w,
      open: W,
      onClose: () => X(!1),
      onRefresh: () => le()
    }),
    // Template Modal
    e.createElement(pl, {
      open: h,
      onClose: () => D(!1),
      onCreated: () => le()
    }),
    // Config Modal (gear icon)
    e.createElement(il, {
      expert: Q,
      open: re,
      onClose: () => V(!1),
      onRefresh: () => le()
    }),
    // Team Launch Modal (for filling placeholders)
    k ? e.createElement(
      b,
      {
        open: !0,
        title: e.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 8 } },
          e.createElement(Gt, {
            members: k.members.map((N) => N.name),
            size: 28
          }),
          e.createElement(
            "span",
            null,
            `发起团队任务 - ${k.name}`
          )
        ),
        onCancel: () => d(null),
        onOk: () => {
          const N = _n(
            k,
            A
          );
          if (!N) {
            m.error("固定协调者不可用或没有可用的控制器 Agent");
            return;
          }
          const p = ee.trim() || k.taskTemplate;
          ne(k, N, p);
        },
        confirmLoading: v,
        okText: "发起任务",
        width: 600
      },
      e.createElement(
        "div",
        null,
        e.createElement(
          G,
          {
            type: "secondary",
            style: { fontSize: 12, display: "block", marginBottom: 8 }
          },
          "任务内容（请替换 {参数名} 等占位符后发起）："
        ),
        e.createElement(c.TextArea, {
          value: ee,
          onChange: (N) => U(N.target.value),
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
          G,
          { style: { fontSize: 12, color: "#0958d9" } },
          `协调者: ${k.coordinatorName || ((me = k.members[0]) == null ? void 0 : me.name) || "—"} · 成员: ${k.members.map((N) => N.name).join("、")}`
        )
      )
    ) : null
  );
}
function jl({
  agentId: e,
  agentName: t,
  refreshKey: l = 0,
  onNavigate: a
}) {
  const n = S().React, { useState: r, useEffect: s, useCallback: c } = n, {
    Spin: i,
    Empty: m,
    Button: u,
    Row: E,
    Col: y,
    Card: b,
    Tag: T,
    Checkbox: C,
    Modal: x,
    Typography: I,
    Drawer: j,
    Descriptions: F,
    message: G
  } = S().antd, {
    ReloadOutlined: H,
    ThunderboltOutlined: q,
    SettingOutlined: J,
    CheckSquareOutlined: O,
    EyeOutlined: z,
    EyeInvisibleOutlined: W,
    DeleteOutlined: X,
    CloseOutlined: w
  } = S().antdIcons || {}, { Text: f, Paragraph: g } = I, [$, h] = r([]), [D, Z] = r(!0), [M, k] = r(!1), [d, ee] = r(null), [U, v] = r(!1), [B, re] = r(
    /* @__PURE__ */ new Set()
  ), [V, Q] = r(!1), [pe, A] = r(null), [_, le] = r(!1), te = c(async () => {
    if (e) {
      Z(!0);
      try {
        const K = await kt(e);
        h(K);
      } catch (K) {
        G.error(K.message || "加载技能失败"), h([]);
      } finally {
        Z(!1);
      }
    }
  }, [e]);
  s(() => {
    te();
  }, [te, l]);
  const ne = (K) => {
    re((se) => {
      const me = new Set(se);
      return me.has(K) ? me.delete(K) : me.add(K), me;
    });
  }, ge = () => re(/* @__PURE__ */ new Set()), be = () => re(new Set($.map((K) => K.name))), Se = () => {
    U ? (ge(), v(!1)) : v(!0);
  }, Ce = async () => {
    const K = Array.from(B);
    if (K.length !== 0) {
      Q(!0);
      try {
        const { results: se } = await Na(e, K), me = Object.entries(se).filter(
          ([, p]) => p.success === !1
        ), N = K.length - me.length;
        me.length > 0 ? G.warning(
          `批量启用完成：成功 ${N} 个，失败 ${me.length} 个`
        ) : G.success(`成功启用 ${K.length} 个技能`), ge(), await te();
      } catch (se) {
        G.error(se.message || "批量启用失败");
      } finally {
        Q(!1);
      }
    }
  }, ye = async () => {
    const K = Array.from(B);
    if (K.length !== 0) {
      Q(!0);
      try {
        const { results: se } = await Da(e, K), me = Object.entries(se).filter(
          ([, p]) => p.success === !1
        ), N = K.length - me.length;
        me.length > 0 ? G.warning(
          `批量停用完成：成功 ${N} 个，失败 ${me.length} 个`
        ) : G.success(`成功停用 ${K.length} 个技能`), ge(), await te();
      } catch (se) {
        G.error(se.message || "批量停用失败");
      } finally {
        Q(!1);
      }
    }
  }, ae = () => {
    const K = Array.from(B);
    K.length !== 0 && x.confirm({
      title: `确认删除 ${K.length} 个技能？`,
      content: "删除后技能将从当前专家工作区移除，此操作不可撤销。技能池中的原始技能不受影响。",
      okText: "确认删除",
      cancelText: "取消",
      okButtonProps: { danger: !0 },
      onOk: async () => {
        Q(!0);
        try {
          const { results: se } = await Fa(e, K), me = Object.entries(se).filter(
            ([, p]) => p.success === !1
          ), N = K.length - me.length;
          me.length > 0 ? G.warning(
            `批量删除完成：成功 ${N} 个，失败 ${me.length} 个`
          ) : G.success(`成功删除 ${K.length} 个技能`), ge(), await te();
        } catch (se) {
          G.error(se.message || "批量删除失败");
        } finally {
          Q(!1);
        }
      }
    });
  }, he = async (K) => {
    le(!0);
    try {
      K.enabled === !1 ? (await Un(e, K.name), G.success(`已启用技能「${K.name}」`)) : (await Dn(e, K.name), G.success(`已禁用技能「${K.name}」`)), await te();
    } catch (se) {
      G.error(se.message || "操作失败");
    } finally {
      le(!1);
    }
  }, ue = (K) => {
    x.confirm({
      title: `确认删除技能「${K.name}」？`,
      content: "删除后技能将从当前专家工作区移除，此操作不可撤销。技能池中的原始技能不受影响。",
      okText: "确认删除",
      cancelText: "取消",
      okButtonProps: { danger: !0 },
      onOk: async () => {
        le(!0);
        try {
          await Nt(e, K.name), G.success(`已删除技能「${K.name}」`), await te();
        } catch (se) {
          G.error(se.message || "删除失败");
        } finally {
          le(!1);
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
        f,
        { type: "secondary", style: { fontSize: 13 } },
        U ? `已选择 ${B.size} / ${$.length} 个技能` : `共 ${$.length} 个技能`
      ),
      n.createElement(
        "div",
        { style: { display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" } },
        U ? n.createElement(
          n.Fragment,
          null,
          n.createElement(
            u,
            { size: "small", onClick: be },
            "全选"
          ),
          n.createElement(
            u,
            {
              size: "small",
              icon: w ? n.createElement(w) : void 0,
              onClick: ge
            },
            "取消选择"
          ),
          n.createElement(
            u,
            {
              size: "small",
              type: "default",
              icon: z ? n.createElement(z) : void 0,
              disabled: B.size === 0 || V,
              loading: V,
              onClick: Ce
            },
            "批量启用"
          ),
          n.createElement(
            u,
            {
              size: "small",
              danger: !0,
              icon: W ? n.createElement(W) : void 0,
              disabled: B.size === 0 || V,
              loading: V,
              onClick: ye
            },
            "批量停用"
          ),
          n.createElement(
            u,
            {
              size: "small",
              danger: !0,
              icon: X ? n.createElement(X) : void 0,
              disabled: B.size === 0 || V,
              loading: V,
              onClick: ae
            },
            `删除 (${B.size})`
          ),
          n.createElement(
            u,
            {
              size: "small",
              type: "primary",
              onClick: Se
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
              icon: O ? n.createElement(O) : void 0,
              onClick: Se,
              disabled: $.length === 0
            },
            "批量管理"
          ),
          n.createElement(
            u,
            {
              icon: H ? n.createElement(H) : void 0,
              onClick: () => {
                ot(), te();
              }
            },
            "刷新"
          )
        )
      )
    ),
    D ? n.createElement(
      "div",
      { style: { textAlign: "center", padding: 60 } },
      n.createElement(i, { size: "large" })
    ) : $.length === 0 ? n.createElement(m, {
      description: "当前智能体未加载任何技能"
    }) : n.createElement(
      E,
      { gutter: [12, 12] },
      ...$.map(
        (K) => n.createElement(
          y,
          { key: K.name, xs: 24, sm: 12, md: 8, lg: 6 },
          n.createElement(
            b,
            {
              hoverable: !0,
              size: "small",
              style: {
                cursor: U ? "default" : "pointer",
                height: "100%",
                position: "relative",
                borderColor: U && B.has(K.name) ? "#0072f5" : void 0,
                borderWidth: U && B.has(K.name) ? 2 : 1
              },
              onClick: () => {
                U ? ne(K.name) : (ee(K), k(!0));
              },
              onMouseEnter: () => {
                U || A(K.name);
              },
              onMouseLeave: () => A(null)
            },
            U ? n.createElement(
              "div",
              {
                style: {
                  position: "absolute",
                  top: 8,
                  right: 8,
                  zIndex: 1
                },
                onClick: (se) => {
                  se.stopPropagation(), ne(K.name);
                }
              },
              n.createElement(C, {
                checked: B.has(K.name)
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
              K.emoji ? n.createElement(
                "span",
                { style: { fontSize: 18 } },
                K.emoji
              ) : n.createElement(
                "span",
                { style: { fontSize: 18 } },
                "⚡"
              ),
              n.createElement(
                f,
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
              K.enabled === !1 ? n.createElement(
                T,
                { color: "default", style: { fontSize: 10 } },
                "已禁用"
              ) : n.createElement(
                T,
                { color: "green", style: { fontSize: 10 } },
                "已启用"
              )
            ),
            K.description ? n.createElement(
              g,
              {
                type: "secondary",
                style: { fontSize: 11, margin: 0, lineHeight: 1.4 },
                ellipsis: { rows: 2 }
              },
              K.description
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
              K.version_text ? n.createElement(
                T,
                { style: { fontSize: 10 } },
                `v${K.version_text}`
              ) : null,
              ...(K.tags || []).slice(0, 3).map(
                (se, me) => n.createElement(
                  T,
                  { key: me, color: "blue", style: { fontSize: 10 } },
                  se
                )
              )
            ),
            // Hover action footer (not in batch mode)
            !U && pe === K.name ? n.createElement(
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
                  icon: K.enabled === !1 ? z ? n.createElement(z) : void 0 : W ? n.createElement(W) : void 0,
                  disabled: _,
                  onClick: (se) => {
                    se.stopPropagation(), he(K);
                  }
                },
                K.enabled === !1 ? "启用" : "禁用"
              ),
              n.createElement(
                u,
                {
                  size: "small",
                  danger: !0,
                  icon: X ? n.createElement(X) : void 0,
                  disabled: _,
                  onClick: (se) => {
                    se.stopPropagation(), ue(K);
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
    d ? n.createElement(
      j,
      {
        title: n.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 8 } },
          n.createElement(
            "span",
            { style: { fontSize: 18 } },
            d.emoji || "⚡"
          ),
          n.createElement("span", null, d.name)
        ),
        open: M,
        onClose: () => k(!1),
        width: 520,
        extra: n.createElement(
          u,
          {
            type: "primary",
            size: "small",
            icon: J ? n.createElement(J) : void 0,
            onClick: () => a("/skills")
          },
          "管理技能"
        )
      },
      n.createElement(
        F,
        { column: 1, bordered: !0, size: "small" },
        n.createElement(
          F.Item,
          { label: "技能名称" },
          d.name
        ),
        n.createElement(
          F.Item,
          { label: "描述" },
          d.description || "-"
        ),
        d.version_text ? n.createElement(
          F.Item,
          { label: "版本" },
          d.version_text
        ) : null,
        n.createElement(
          F.Item,
          { label: "来源" },
          d.source || "-"
        ),
        n.createElement(
          F.Item,
          { label: "状态" },
          d.enabled === !1 ? "已禁用" : "已启用"
        ),
        d.installed_from ? n.createElement(
          F.Item,
          { label: "安装来源" },
          d.installed_from
        ) : null
      ),
      // Tags
      d.tags && d.tags.length > 0 ? n.createElement(
        "div",
        { style: { marginTop: 16 } },
        n.createElement(
          f,
          {
            strong: !0,
            style: { display: "block", marginBottom: 8 }
          },
          "标签"
        ),
        n.createElement(
          "div",
          { style: { display: "flex", flexWrap: "wrap", gap: 4 } },
          ...d.tags.map(
            (K, se) => n.createElement(T, { key: se, color: "blue" }, K)
          )
        )
      ) : null,
      // Skill content preview
      d.content ? n.createElement(
        "div",
        { style: { marginTop: 16 } },
        n.createElement(
          f,
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
              background: "#f5f5f5",
              borderRadius: 6,
              fontSize: 12,
              whiteSpace: "pre-wrap"
            }
          },
          d.content.slice(0, 2e3) + (d.content.length > 2e3 ? `

... (内容已截断)` : "")
        )
      ) : null
    ) : null
  );
}
function Ul({
  poolSkills: e,
  workspaceSkills: t,
  agents: l,
  loading: a,
  onReload: n,
  onSkillInstalled: r,
  agentId: s,
  agentName: c
}) {
  const i = S().React, { useState: m, useMemo: u, useCallback: E, useEffect: y, useRef: b } = i, {
    Spin: T,
    Empty: C,
    Input: x,
    Button: I,
    Row: j,
    Col: F,
    Card: G,
    Tag: H,
    Typography: q,
    Drawer: J,
    Descriptions: O,
    List: z,
    Modal: W,
    message: X
  } = S().antd, {
    ReloadOutlined: w,
    SearchOutlined: f,
    DownloadOutlined: g,
    ThunderboltOutlined: $,
    DeleteOutlined: h,
    PlusOutlined: D
  } = S().antdIcons || {}, { Text: Z, Paragraph: M } = q, [k, d] = m(""), [ee, U] = m(!1), [v, B] = m(null), [re, V] = m([]), [Q, pe] = m(!1), [A, _] = m(24), [le, te] = m(null), [ne, ge] = m(!1), be = b(0), Se = b(null), Ce = u(
    () => {
      var L;
      return new Set(
        ((L = t.find((oe) => oe.agent_id === s)) == null ? void 0 : L.skills.map((oe) => oe.name)) || []
      );
    },
    [t, s]
  ), ye = u(() => {
    if (!k.trim()) return e;
    const L = k.toLowerCase();
    return e.filter(
      (oe) => {
        var fe, ve;
        return oe.name.toLowerCase().includes(L) || ((fe = oe.description) == null ? void 0 : fe.toLowerCase().includes(L)) || ((ve = oe.tags) == null ? void 0 : ve.some((Ae) => Ae.toLowerCase().includes(L)));
      }
    );
  }, [e, k]), ae = u(
    () => ye.slice(0, A),
    [ye, A]
  );
  y(() => {
    if (ae.length >= ye.length) return;
    const L = Se.current;
    if (!L) return;
    const oe = () => {
      _(
        (ve) => Math.min(ve + 24, ye.length)
      );
    };
    if (typeof IntersectionObserver < "u") {
      const ve = new IntersectionObserver(
        (Ae) => {
          Ae.some((Te) => Te.isIntersecting) && oe();
        },
        { rootMargin: "240px 0px" }
      );
      return ve.observe(L), () => ve.disconnect();
    }
    const fe = () => {
      L.getBoundingClientRect().top <= window.innerHeight + 240 && oe();
    };
    return window.addEventListener("scroll", fe, { passive: !0 }), fe(), () => window.removeEventListener("scroll", fe);
  }, [ye.length, ae.length]);
  const he = E((L) => {
    d(L), _(24);
  }, []), ue = E(() => {
    const L = be.current;
    requestAnimationFrame(() => {
      window.scrollTo({ top: L, behavior: "auto" }), document.scrollingElement && (document.scrollingElement.scrollTop = L);
    });
  }, []), K = E(async () => {
    var L;
    be.current = ((L = document.scrollingElement) == null ? void 0 : L.scrollTop) ?? window.scrollY ?? 0;
    try {
      await n();
    } finally {
      ue();
    }
  }, [n, ue]), se = E(
    (L) => {
      const oe = [];
      for (const fe of t)
        if (fe.skills.some((ve) => ve.name === L)) {
          const ve = l.find((Ae) => Ae.id === fe.agent_id);
          oe.push((ve == null ? void 0 : ve.name) || fe.agent_name || fe.agent_id);
        }
      return oe;
    },
    [t, l]
  ), me = E(
    async (L) => {
      if (B(L), V(se(L.name)), U(!0), !L.content) {
        pe(!0);
        try {
          const oe = await Oa(L.name);
          B({ ...L, content: oe });
        } catch {
        } finally {
          pe(!1);
        }
      }
    },
    [se]
  );
  y(() => {
    v && V(se(v.name));
  }, [v, se, t]);
  const N = async (L) => {
    ge(!0);
    try {
      await Ut(s, L.name), X.success(
        `已将技能「${L.name}」加载到当前专家「${c}」`
      ), r(L);
    } catch (oe) {
      X.error(oe.message || "加载技能失败");
    } finally {
      ge(!1);
    }
  }, p = (L) => {
    if (L.protected) {
      X.warning("内置技能不可删除");
      return;
    }
    W.confirm({
      title: `确认从技能池删除「${L.name}」？`,
      content: "删除后所有已安装此技能的专家将不受影响，但技能池中将不再包含此技能。此操作不可撤销。",
      okText: "确认删除",
      cancelText: "取消",
      okButtonProps: { danger: !0 },
      onOk: async () => {
        ge(!0);
        try {
          await Ha(L.name), X.success(`已从技能池删除「${L.name}」`), await K();
        } catch (oe) {
          X.error(oe.message || "删除失败");
        } finally {
          ge(!1);
        }
      }
    });
  }, de = (L) => {
    window.history.pushState({}, "", L), window.dispatchEvent(new PopStateEvent("popstate"));
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
      i.createElement(x, {
        placeholder: "搜索技能名称、描述或标签...",
        prefix: f ? i.createElement(f) : void 0,
        value: k,
        onChange: (L) => he(L.target.value),
        allowClear: !0,
        style: { maxWidth: 400 }
      }),
      i.createElement(
        "div",
        { style: { display: "flex", gap: 8 } },
        i.createElement(
          I,
          {
            icon: w ? i.createElement(w) : void 0,
            onClick: K,
            loading: a,
            size: "small"
          },
          "刷新"
        ),
        i.createElement(
          I,
          {
            type: "primary",
            icon: g ? i.createElement(g) : void 0,
            onClick: () => de("/skill-pool"),
            size: "small",
            style: Pe
          },
          "管理技能池"
        )
      )
    ),
    a ? i.createElement(
      "div",
      { style: { textAlign: "center", padding: 60 } },
      i.createElement(T, { size: "large" })
    ) : ye.length === 0 ? i.createElement(C, {
      description: k ? "未找到匹配的技能" : "技能池为空"
    }) : i.createElement(
      i.Fragment,
      null,
      i.createElement(
        j,
        { gutter: [12, 12] },
        ...ae.map(
          (L) => i.createElement(
            F,
            { key: L.name, xs: 24, sm: 12, md: 8, lg: 6 },
            i.createElement(
              G,
              {
                hoverable: !0,
                size: "small",
                style: { cursor: "pointer", height: "100%" },
                onClick: () => me(L),
                onMouseEnter: () => te(L.name),
                onMouseLeave: () => te(null)
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
                L.emoji ? i.createElement(
                  "span",
                  { style: { fontSize: 18 } },
                  L.emoji
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
                  L.name
                ),
                L.protected ? i.createElement(
                  H,
                  { color: "gold", style: { fontSize: 10 } },
                  "内置"
                ) : null
              ),
              L.description ? i.createElement(
                M,
                {
                  type: "secondary",
                  style: { fontSize: 11, margin: 0, lineHeight: 1.4 },
                  ellipsis: { rows: 2 }
                },
                L.description
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
                L.version_text ? i.createElement(
                  H,
                  { style: { fontSize: 10 } },
                  `v${L.version_text}`
                ) : null,
                ...(L.tags || []).slice(0, 3).map(
                  (oe, fe) => i.createElement(
                    H,
                    { key: fe, color: "cyan", style: { fontSize: 10 } },
                    oe
                  )
                )
              ),
              // Hover action footer
              le === L.name ? i.createElement(
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
                  I,
                  {
                    size: "small",
                    type: "primary",
                    icon: D ? i.createElement(D) : void 0,
                    disabled: ne || Ce.has(L.name),
                    onClick: (oe) => {
                      oe.stopPropagation(), N(L);
                    }
                  },
                  Ce.has(L.name) ? "已加载" : "加载到当前Agent"
                ),
                i.createElement(
                  I,
                  {
                    size: "small",
                    danger: !0,
                    icon: h ? i.createElement(h) : void 0,
                    disabled: ne || L.protected,
                    onClick: (oe) => {
                      oe.stopPropagation(), p(L);
                    }
                  },
                  "删除"
                )
              ) : null
            )
          )
        ),
        // Infinite-scroll sentinel
        ae.length < ye.length ? i.createElement(
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
          i.createElement(
            Z,
            { type: "secondary", style: { fontSize: 12 } },
            `继续下滑自动加载 · 还剩 ${ye.length - ae.length} 个`
          )
        ) : null
      )
    ),
    // Skill detail drawer
    v ? i.createElement(
      J,
      {
        title: i.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 8 } },
          i.createElement(
            "span",
            { style: { fontSize: 18 } },
            v.emoji || "⚡"
          ),
          i.createElement("span", null, v.name)
        ),
        open: ee,
        onClose: () => U(!1),
        width: 520,
        extra: i.createElement(
          I,
          {
            type: "primary",
            size: "small",
            icon: $ ? i.createElement($) : void 0,
            onClick: () => de("/skills")
          },
          "管理技能"
        )
      },
      i.createElement(
        O,
        { column: 1, bordered: !0, size: "small" },
        i.createElement(
          O.Item,
          { label: "技能名称" },
          v.name
        ),
        i.createElement(
          O.Item,
          { label: "描述" },
          v.description || "-"
        ),
        v.version_text ? i.createElement(
          O.Item,
          { label: "版本" },
          v.version_text
        ) : null,
        i.createElement(
          O.Item,
          { label: "来源" },
          v.source || "-"
        ),
        i.createElement(
          O.Item,
          { label: "受保护" },
          v.protected ? "是（内置）" : "否"
        ),
        v.sync_status ? i.createElement(
          O.Item,
          { label: "同步状态" },
          v.sync_status
        ) : null,
        v.installed_from ? i.createElement(
          O.Item,
          { label: "安装来源" },
          v.installed_from
        ) : null
      ),
      // Tags
      v.tags && v.tags.length > 0 ? i.createElement(
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
          ...v.tags.map(
            (L, oe) => i.createElement(H, { key: oe, color: "cyan" }, L)
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
          `已安装此技能的专家 (${re.length})`
        ),
        re.length > 0 ? i.createElement(z, {
          size: "small",
          dataSource: re,
          renderItem: (L) => i.createElement(
            z.Item,
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
              i.createElement(Be, { name: L, size: 20 }),
              i.createElement(
                Z,
                { style: { fontSize: 13 } },
                L
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
      Q ? i.createElement(
        "div",
        { style: { marginTop: 16, textAlign: "center" } },
        i.createElement(T, { size: "small" })
      ) : v.content ? i.createElement(
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
              background: "#f5f5f5",
              borderRadius: 6,
              fontSize: 12,
              whiteSpace: "pre-wrap"
            }
          },
          v.content.slice(0, 2e3) + (v.content.length > 2e3 ? `

... (内容已截断)` : "")
        )
      ) : null
    ) : null
  );
}
function Nl({
  embedded: e = !1
} = {}) {
  const t = S().React, { useState: l, useEffect: a, useCallback: n, useMemo: r } = t, { Tabs: s, message: c } = S().antd, { ThunderboltOutlined: i, AppstoreOutlined: m } = S().antdIcons || {}, E = S().useSelectedAgent, y = E ? E() : null, b = (y == null ? void 0 : y.id) || "default";
  a(() => {
    Bt();
  }, [b]);
  const [T, C] = l([]), [x, I] = l([]), [j, F] = l([]), [G, H] = l(!0), [q, J] = l("agent-skills"), [O, z] = l(0), W = n(async () => {
    H(!0);
    try {
      const [h, D, Z] = await Promise.all([
        Ct(!0),
        xt(),
        Ra()
      ]);
      I(h), C(D), F(Z);
    } catch (h) {
      c.error(h.message || "加载技能列表失败"), I([]);
    } finally {
      H(!1);
    }
  }, []);
  a(() => {
    W();
  }, [W]);
  const X = r(() => {
    const h = T.find((D) => D.id === b);
    return (h == null ? void 0 : h.name) || b;
  }, [T, b]), w = n(
    (h) => {
      F(
        (D) => D.map((Z) => Z.agent_id !== b || Z.skills.some((M) => M.name === h.name) ? Z : {
          ...Z,
          skills: [
            ...Z.skills,
            {
              name: h.name,
              description: h.description,
              version_text: h.version_text,
              content: h.content || "",
              source: h.source || "pool",
              enabled: !0,
              tags: h.tags,
              emoji: h.emoji,
              installed_from: h.installed_from
            }
          ]
        })
      ), z((D) => D + 1);
    },
    [b]
  ), f = (h) => {
    window.history.pushState({}, "", h), window.dispatchEvent(new PopStateEvent("popstate"));
  }, g = [
    {
      key: "agent-skills",
      label: t.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        i ? t.createElement(i, { style: { fontSize: 14 } }) : null,
        "当前专家"
      ),
      children: t.createElement(jl, {
        agentId: b,
        agentName: X,
        refreshKey: O,
        onNavigate: f
      })
    },
    {
      key: "skill-pool",
      label: t.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        m ? t.createElement(m, { style: { fontSize: 14 } }) : null,
        "技能库"
      ),
      children: t.createElement(Ul, {
        poolSkills: x,
        workspaceSkills: j,
        agents: T,
        loading: G,
        onReload: W,
        onSkillInstalled: w,
        agentId: b,
        agentName: X
      })
    }
  ], $ = t.createElement(s, {
    items: g,
    activeKey: q,
    onChange: (h) => J(h)
  });
  return e ? $ : t.createElement(
    "div",
    { style: { padding: 24 } },
    t.createElement(wt, {
      title: "技能",
      subtitle: `技能池共 ${x.length} 个技能 · 当前智能体：${X}`
    }),
    $
  );
}
const Rt = {
  reservoir_simulation: "油藏数值模拟",
  geological_modeling: "地质建模",
  well_log_analysis: "测井分析",
  production_engineering: "采油工程",
  post_processing: "后处理与可视化",
  multiphysics: "多物理场仿真"
}, Yn = {
  reservoir_simulation: "🛢️",
  geological_modeling: "🏔️",
  well_log_analysis: "📡",
  production_engineering: "⚙️",
  post_processing: "📊",
  multiphysics: "🔬"
}, Qn = /* @__PURE__ */ new Set(["cmg", "comsol", "tnavigator", "eclipse", "intersect", "visage"]);
function Zn(e) {
  return bt(`/ugsci/engines/icon/${encodeURIComponent(e)}`);
}
async function Dl() {
  return ie("/ugsci/engines/list");
}
async function Fl(e) {
  return ie("/ugsci/engines/", {
    method: "POST",
    body: JSON.stringify(e)
  });
}
async function Gl(e, t) {
  return ie(`/ugsci/engines/${encodeURIComponent(e)}`, {
    method: "PUT",
    body: JSON.stringify(t)
  });
}
async function Hl(e) {
  return ie(
    `/ugsci/engines/${encodeURIComponent(e)}`,
    { method: "DELETE" }
  );
}
async function Wl() {
  return ie("/ugsci/engines/detect/refresh", {
    method: "POST"
  });
}
function Jl({
  engine: e,
  onClick: t
}) {
  const l = S().React, { Card: a, Tag: n, Typography: r } = S().antd, { Text: s } = r, c = e.status === "detected", i = Yn[e.category] || "📦", u = Qn.has(e.id) ? l.createElement("img", {
    src: Zn(e.id),
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
        borderColor: c ? void 0 : "#d9d9d9",
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
            s,
            { strong: !0, style: { fontSize: 14 } },
            e.name
          ),
          l.createElement("br"),
          l.createElement(
            s,
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
        s,
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
        Rt[e.category] || e.category
      ) : null,
      e.version ? l.createElement(
        n,
        { color: "blue", style: { fontSize: 11 } },
        `v${e.version}`
      ) : null,
      ...(e.modules || []).map(
        (E) => l.createElement(
          n,
          { key: E, color: "cyan", style: { fontSize: 10 } },
          E
        )
      )
    )
  );
}
function Kl() {
  const e = S().React, { useState: t, useEffect: l, useCallback: a, useMemo: n } = e, {
    Spin: r,
    Empty: s,
    Button: c,
    message: i,
    Row: m,
    Col: u,
    Drawer: E,
    Descriptions: y,
    Tag: b,
    Typography: T,
    Modal: C,
    Input: x,
    Select: I,
    Popconfirm: j,
    Space: F
  } = S().antd, {
    ReloadOutlined: G,
    SearchOutlined: H,
    PlusOutlined: q,
    EditOutlined: J,
    DeleteOutlined: O,
    CopyOutlined: z,
    ExperimentOutlined: W
  } = S().antdIcons || {}, { Text: X, Paragraph: w } = T, [f, g] = t([]), [$, h] = t(!0), [D, Z] = t(""), [M, k] = t(!1), [d, ee] = t(null), [U, v] = t(!1), [B, re] = t(null), [V, Q] = t({}), [pe, A] = t(!1), _ = a(async () => {
    h(!0);
    try {
      const ae = await Dl();
      g(ae.engines || []);
    } catch (ae) {
      i.error(ae.message || "加载引擎列表失败"), g([]);
    } finally {
      h(!1);
    }
  }, []);
  l(() => {
    _();
  }, [_]);
  const le = n(() => {
    if (!D.trim()) return f;
    const ae = D.toLowerCase();
    return f.filter(
      (he) => {
        var ue;
        return he.name.toLowerCase().includes(ae) || he.vendor.toLowerCase().includes(ae) || he.category.toLowerCase().includes(ae) || ((ue = he.description) == null ? void 0 : ue.toLowerCase().includes(ae));
      }
    );
  }, [f, D]);
  f.filter((ae) => ae.status === "detected").length;
  const te = a((ae) => {
    navigator.clipboard.writeText(ae).then(() => i.success("路径已复制")).catch(() => i.error("复制失败"));
  }, []), ne = a(() => {
    re(null), Q({
      name: "",
      vendor: "",
      version: "",
      executable_path: "",
      category: "",
      description: "",
      invocation_hint: ""
    }), v(!0);
  }, []), ge = a((ae) => {
    re(ae), Q({ ...ae }), v(!0), k(!1);
  }, []), be = a(async () => {
    var ae;
    if (!((ae = V.name) != null && ae.trim())) {
      i.warning("请输入引擎名称");
      return;
    }
    A(!0);
    try {
      B ? (await Gl(B.id, V), i.success("引擎已更新")) : (await Fl(V), i.success("引擎已添加")), v(!1), _();
    } catch (he) {
      i.error(he.message || "保存失败");
    } finally {
      A(!1);
    }
  }, [V, B, _]), Se = a(
    async (ae) => {
      try {
        await Hl(ae), i.success("引擎已删除"), k(!1), _();
      } catch (he) {
        i.error(he.message || "删除失败");
      }
    },
    [_]
  ), Ce = a(async () => {
    h(!0);
    try {
      const ae = await Wl();
      g(ae.engines || []), i.success("自动检测完成");
    } catch (ae) {
      i.error(ae.message || "检测失败");
    } finally {
      h(!1);
    }
  }, []), ye = a(
    (ae, he, ue) => {
      const K = V[he] || "";
      return e.createElement(
        "div",
        { style: { marginBottom: 12 } },
        e.createElement(
          X,
          { style: { fontSize: 13, display: "block", marginBottom: 4 } },
          ae
        ),
        ue != null && ue.select ? e.createElement(I, {
          value: K || void 0,
          onChange: (se) => Q((me) => ({ ...me, [he]: se })),
          style: { width: "100%" },
          options: ue.select.options,
          allowClear: !0,
          placeholder: `选择${ae}`
        }) : ue != null && ue.textarea ? e.createElement(x.TextArea, {
          value: K,
          onChange: (se) => Q((me) => ({ ...me, [he]: se.target.value })),
          rows: 3,
          placeholder: `输入${ae}`
        }) : e.createElement(x, {
          value: K,
          onChange: (se) => Q((me) => ({ ...me, [he]: se.target.value })),
          placeholder: `输入${ae}`
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
      e.createElement(x, {
        placeholder: "搜索引擎名称、厂商...",
        prefix: H ? e.createElement(H) : void 0,
        value: D,
        onChange: (ae) => Z(ae.target.value),
        allowClear: !0,
        style: { maxWidth: 280 }
      }),
      e.createElement(
        c,
        {
          icon: G ? e.createElement(G) : void 0,
          onClick: Ce,
          loading: $
        },
        "自动检测"
      ),
      e.createElement(
        c,
        {
          type: "primary",
          icon: q ? e.createElement(q) : void 0,
          onClick: ne,
          style: Pe
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
    ) : le.length === 0 ? e.createElement(s, {
      description: D ? "无匹配引擎" : "暂无引擎，点击「添加引擎」开始"
    }) : e.createElement(
      m,
      { gutter: [12, 12], align: "stretch" },
      ...le.map(
        (ae) => e.createElement(
          u,
          {
            key: ae.id,
            xs: 24,
            sm: 12,
            md: 8,
            lg: 6,
            style: { display: "flex" }
          },
          e.createElement(Jl, {
            engine: ae,
            onClick: () => {
              ee(ae), k(!0);
            }
          })
        )
      )
    ),
    // Detail drawer
    d ? e.createElement(
      E,
      {
        title: e.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 8 } },
          e.createElement(
            "span",
            { style: { display: "flex", alignItems: "center" } },
            Qn.has(d.id) ? e.createElement("img", {
              src: Zn(d.id),
              alt: d.name,
              style: { width: 20, height: 20, objectFit: "contain" }
            }) : e.createElement(
              "span",
              { style: { fontSize: 18 } },
              Yn[d.category] || "📦"
            )
          ),
          e.createElement("span", null, d.name)
        ),
        open: M,
        onClose: () => k(!1),
        width: 520,
        extra: e.createElement(
          F,
          null,
          e.createElement(
            c,
            {
              size: "small",
              icon: J ? e.createElement(J) : void 0,
              onClick: () => ge(d)
            },
            "编辑"
          ),
          d.is_default ? null : e.createElement(
            j,
            {
              title: "确认删除此引擎？",
              description: d.name,
              onConfirm: () => Se(d.id),
              okText: "删除",
              cancelText: "取消",
              okButtonProps: { danger: !0 }
            },
            e.createElement(
              c,
              {
                size: "small",
                danger: !0,
                icon: O ? e.createElement(O) : void 0
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
          d.name
        ),
        e.createElement(
          y.Item,
          { label: "厂商" },
          d.vendor || "—"
        ),
        e.createElement(
          y.Item,
          { label: "分类" },
          d.category ? Rt[d.category] || d.category : "—"
        ),
        e.createElement(
          y.Item,
          { label: "状态" },
          e.createElement(
            b,
            {
              color: d.status === "detected" ? "success" : d.status === "not_found" ? "error" : "default"
            },
            d.status === "detected" ? "✅ 已检测" : d.status === "not_found" ? "❌ 路径无效" : "🔧 待配置"
          )
        ),
        e.createElement(
          y.Item,
          { label: "版本" },
          d.version || "—"
        ),
        d.executable_path ? e.createElement(
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
              d.executable_path
            ),
            e.createElement(
              c,
              {
                size: "small",
                type: "text",
                icon: z ? e.createElement(z) : void 0,
                onClick: () => te(d.executable_path)
              }
            )
          )
        ) : null,
        d.install_dir ? e.createElement(
          y.Item,
          { label: "安装目录" },
          e.createElement(
            "code",
            { style: { fontSize: 12, wordBreak: "break-all" } },
            d.install_dir
          )
        ) : null,
        // Display detected modules with paths
        d.modules && d.modules.length > 0 ? e.createElement(
          y.Item,
          { label: "已检测模块" },
          e.createElement(
            "div",
            { style: { display: "flex", flexDirection: "column", gap: 4 } },
            ...d.modules.map(
              (ae) => e.createElement(
                "div",
                {
                  key: ae,
                  style: { display: "flex", alignItems: "center", gap: 8 }
                },
                e.createElement(
                  b,
                  { color: "cyan", style: { fontSize: 11 } },
                  ae
                ),
                d.module_paths && d.module_paths[ae] ? e.createElement(
                  "code",
                  { style: { fontSize: 11, wordBreak: "break-all" } },
                  d.module_paths[ae]
                ) : null
              )
            )
          )
        ) : null,
        d.license_server ? e.createElement(
          y.Item,
          { label: "许可证服务器" },
          d.license_server
        ) : null,
        e.createElement(
          y.Item,
          { label: "描述" },
          d.description || "—"
        )
      ),
      // Invocation hint
      d.invocation_hint ? e.createElement(
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
          d.invocation_hint
        )
      ) : null,
      // Type badge
      e.createElement(
        "div",
        { style: { marginTop: 12 } },
        d.is_default ? e.createElement(
          b,
          { color: "blue" },
          "默认引擎"
        ) : d.is_custom ? e.createElement(
          b,
          { color: "purple" },
          "自定义引擎"
        ) : null
      )
    ) : null,
    // Add/Edit modal
    e.createElement(
      C,
      {
        title: B ? "编辑引擎" : "添加引擎",
        open: U,
        onOk: be,
        onCancel: () => v(!1),
        okText: B ? "保存" : "添加",
        cancelText: "取消",
        confirmLoading: pe,
        width: 560
      },
      e.createElement(
        "div",
        { style: { maxHeight: 480, overflow: "auto", paddingRight: 8 } },
        ye("引擎名称 *", "name"),
        ye("厂商", "vendor"),
        ye("版本", "version"),
        ye("可执行文件路径", "executable_path"),
        ye("安装目录", "install_dir"),
        ye("分类", "category", {
          select: {
            options: Object.entries(Rt).map(([ae, he]) => ({
              label: he,
              value: ae
            }))
          }
        }),
        ye("描述", "description", { textarea: !0 }),
        ye("调用方式提示", "invocation_hint", { textarea: !0 }),
        ye("许可证服务器", "license_server")
      )
    )
  );
}
const ql = Nl, ea = /* @__PURE__ */ new Set(["tools", "engines", "skills"]);
function Xl(e) {
  try {
    const t = new URLSearchParams(window.location.search).get("tab");
    return t && ea.has(t) ? t : e;
  } catch {
    return e;
  }
}
function zn(e) {
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
function Mt({ page: e }) {
  const t = S().React, { useEffect: l, useState: a } = t, { Alert: n, Spin: r } = S().antd, [s, c] = a(null), [i, m] = a("");
  if (l(() => {
    let E = !0;
    const y = S().loadBuiltinPage;
    return c(null), y ? (m(""), y(e).then((b) => {
      E && c(() => b);
    }).catch((b) => {
      E && m(
        b instanceof Error ? b.message : "加载原生管理页面失败"
      );
    }), () => {
      E = !1;
    }) : (m("当前 QwenPaw 版本不支持原生页面嵌入"), () => {
      E = !1;
    });
  }, [e]), i)
    return t.createElement(n, {
      type: "error",
      showIcon: !0,
      message: "原生管理功能加载失败",
      description: i
    });
  if (!s)
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
  return t.createElement(s, { embedded: !0, embeddedLabels: u });
}
function Vl() {
  const e = S().React, { Tabs: t } = S().antd;
  return e.createElement(t, {
    defaultActiveKey: "mcp",
    items: [
      {
        key: "mcp",
        label: "MCP 接入",
        children: e.createElement(Mt, { page: "mcp" })
      },
      {
        key: "builtin",
        label: "平台内置",
        children: e.createElement(Mt, { page: "tools" })
      }
    ]
  });
}
function Yl() {
  const e = S().React, { Empty: t, Typography: l } = S().antd, { Paragraph: a } = l;
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
function Ql() {
  const e = S().React, { Tabs: t } = S().antd;
  return e.createElement(t, {
    defaultActiveKey: "simulation",
    items: [
      {
        key: "simulation",
        label: "仿真软件",
        children: e.createElement(Kl)
      },
      {
        key: "domain",
        label: "领域计算",
        children: e.createElement(Yl)
      },
      {
        key: "runtime",
        label: "运行服务",
        children: e.createElement(Mt, { page: "acp" })
      }
    ]
  });
}
function ta({
  initialTab: e = "engines"
} = {}) {
  var C, x;
  const t = S().React, { useEffect: l, useState: a } = t, { Tabs: n, Tag: r } = S().antd, { RocketOutlined: s, ToolOutlined: c, ThunderboltOutlined: i } = S().antdIcons || {}, m = (x = (C = S()).useSelectedAgent) == null ? void 0 : x.call(C), u = (m == null ? void 0 : m.id) || "default", [E, y] = a(
    () => Xl(e)
  );
  l(() => {
    try {
      const I = new URLSearchParams(window.location.search).get("tab");
      I && !ea.has(I) && zn(E);
    } catch {
    }
  }, [E]);
  const b = (I) => {
    y(I), zn(I);
  }, T = (I, j) => t.createElement(
    "span",
    { style: { display: "inline-flex", alignItems: "center", gap: 6 } },
    j ? t.createElement(j, { style: { fontSize: 14 } }) : null,
    I
  );
  return t.createElement(
    "div",
    { style: { padding: 24 } },
    t.createElement(wt, {
      title: "工具·技能",
      subtitle: "管理当前专家可调用的引擎、工具、运行服务与专业技能",
      extra: t.createElement(
        r,
        { color: "blue" },
        `当前专家：${u}`
      )
    }),
    t.createElement(n, {
      activeKey: E,
      onChange: (I) => b(I),
      items: [
        {
          key: "engines",
          label: T("引擎", s),
          children: t.createElement(Ql)
        },
        {
          key: "tools",
          label: T("工具", c),
          children: t.createElement(Vl)
        },
        {
          key: "skills",
          label: T("技能", i),
          children: t.createElement(ql, {
            embedded: !0
          })
        }
      ]
    })
  );
}
const na = ta;
function Zl() {
  return S().React.createElement(na, {
    initialTab: "tools"
  });
}
function er() {
  return S().React.createElement(na, {
    initialTab: "skills"
  });
}
const An = {
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
function tr(e) {
  if (!e.env) return !1;
  const t = Object.entries(e.env);
  return t.length === 0 ? !1 : t.some(([, l]) => typeof l == "string" && l.length > 0);
}
const Et = "ugsci.market.githubSources", Pn = "https://github.com/anthropics/skills/tree/main/skills", aa = "https://ugsci-awesome-tools.oss-cn-beijing.aliyuncs.com", nr = `${aa}/skills`;
function ar(e) {
  const t = e.replace(/^\/+/, "");
  return bt(`/plugins/oss-proxy?path=${encodeURIComponent(t)}`);
}
function vt(e) {
  const t = e.replace(/^\/+/, "");
  return je(`/plugins/oss-proxy?path=${encodeURIComponent(t)}`);
}
async function Jt(e) {
  const t = e.replace(/^\/+/, ""), l = await vt(t);
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
function lr(e) {
  var n, r;
  const t = {};
  if (e.env && e.env.length > 0)
    for (const s of e.env)
      t[s] = `your-${s.toLowerCase().replace(/_/g, "-")}`;
  let l = "🔌";
  const a = (e.icon || "").toLowerCase();
  return a.includes("folder") ? l = "📁" : a.includes("git") ? l = "🌿" : a.includes("github") ? l = "🐙" : a.includes("database") || a.includes("postgres") || a.includes("sqlite") ? l = "🗄️" : a.includes("search") || a.includes("brave") ? l = "🔍" : a.includes("browser") || a.includes("puppeteer") ? l = "🎭" : a.includes("memory") || a.includes("brain") ? l = "🧠" : a.includes("file") || a.includes("fetch") ? l = "🌐" : a.includes("slack") ? l = "💬" : a.includes("google") ? l = "📁" : a.includes("notion") ? l = "📝" : a.includes("jupyter") ? l = "📊" : a.includes("science") || a.includes("flask") ? l = "🔬" : a.includes("book") || a.includes("arxiv") ? l = "📚" : a.includes("patent") && (l = "📜"), {
    id: e.id,
    name: e.name,
    emoji: l,
    iconUrl: e.icon_url ? ar(e.icon_url) : void 0,
    category: e.category ? Qe(e.category) : "",
    description: e.description,
    transport: e.transport || "stdio",
    command: ((n = e.config) == null ? void 0 : n.command) || "",
    args: ((r = e.config) == null ? void 0 : r.args) || [],
    env: Object.keys(t).length > 0 ? t : void 0
  };
}
const la = "ugsci.market.mcpSources", ra = "ugsci.market.expertSources";
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
function oa(e, t) {
  try {
    localStorage.setItem(e, JSON.stringify(t));
  } catch {
  }
}
function rr() {
  return sa(la, "mcp");
}
function gt(e) {
  oa(la, e);
}
function sr() {
  return sa(ra, "expert");
}
function ft(e) {
  oa(ra, e);
}
function ia(e) {
  try {
    const t = new URL(e.trim()), l = t.hostname.toLowerCase();
    let a;
    if (l === "github.com" || l === "www.github.com")
      a = "github";
    else if (l === "gitee.com" || l === "www.gitee.com")
      a = "gitee";
    else
      return null;
    const n = t.pathname.split("/").filter((m) => m.length > 0);
    if (n.length < 2) return null;
    const r = decodeURIComponent(n[0]), s = decodeURIComponent(n[1]);
    let c = "main", i = "";
    return n.length >= 4 && (n[2] === "tree" || n[2] === "blob") ? (c = decodeURIComponent(n[3]), n.length > 4 && (i = n.slice(4).map(decodeURIComponent).join("/"))) : n.length > 2 && (i = n.slice(2).map(decodeURIComponent).join("/")), i = i.replace(/\/+$/, "").replace(/^\/+/, ""), {
      owner: r,
      repo: s,
      ref: c || "main",
      skillsPath: i,
      label: `${r}/${s}`,
      platform: a
    };
  } catch {
    return null;
  }
}
function ca(e, t, l, a = "github") {
  return a === "oss" ? `oss:${e}/${l || "/"}` : `${a}:${e}/${t}:${l || "/"}`;
}
function or(e) {
  try {
    const t = new URL(e.trim()), l = t.hostname.toLowerCase(), a = l.match(
      /^([a-z0-9][a-z0-9-]{1,61}[a-z0-9])\.oss-([a-z0-9-]+)\.aliyuncs\.com$/
    );
    if (!a) return null;
    const n = a[1], r = `${t.protocol}//${l}`, s = decodeURIComponent(t.pathname).replace(/^\/+/, "").replace(/\/+$/, "");
    return s ? {
      endpoint: r,
      prefix: s,
      label: "UGSci",
      platform: "oss"
    } : null;
  } catch {
    return null;
  }
}
function ir() {
  try {
    const e = localStorage.getItem(Et);
    if (!e) {
      const a = [], n = ia(Pn);
      return n && a.push({
        id: ca(
          n.owner,
          n.repo,
          n.skillsPath,
          n.platform
        ),
        url: Pn,
        label: n.label,
        owner: n.owner,
        repo: n.repo,
        ref: n.ref,
        skillsPath: n.skillsPath,
        enabled: !1,
        platform: n.platform
      }), localStorage.setItem(Et, JSON.stringify(a)), a;
    }
    const t = JSON.parse(e);
    if (!Array.isArray(t)) return [];
    const l = t.filter(
      (a) => a && typeof a.id == "string" && (typeof a.owner == "string" || a.platform === "oss") && !(a.platform === "oss" && a.url === nr)
    ).map((a) => ({
      ...a,
      platform: a.platform || "github",
      owner: a.owner || "",
      repo: a.repo || "",
      ref: a.ref || "",
      skillsPath: a.skillsPath || ""
    }));
    return l.length !== t.length && localStorage.setItem(
      Et,
      JSON.stringify(l)
    ), l;
  } catch {
    return [];
  }
}
function yt(e) {
  try {
    localStorage.setItem(
      Et,
      JSON.stringify(e)
    );
  } catch {
  }
}
function cr(e) {
  const t = e.match(/^---\s*\n([\s\S]*?)\n---/);
  if (!t) return {};
  const l = t[1], a = {}, n = l.split(`
`);
  let r = "";
  for (const s of n) {
    const c = s.match(/^(\w[\w-]*)\s*:\s*(.*)$/);
    if (c) {
      r = c[1];
      let i = c[2].trim();
      (i.startsWith('"') && i.endsWith('"') || i.startsWith("'") && i.endsWith("'")) && (i = i.slice(1, -1)), r === "name" ? a.name = i : r === "description" ? a.description = i : r === "version" ? a.version = i : r === "author" && (a.author = i);
    }
  }
  return a;
}
async function dr(e) {
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
  const s = await r.json();
  if (!Array.isArray(s)) return [];
  const c = s.filter(
    (m) => m.type === "dir" && m.name
  );
  return await Promise.all(
    c.map(async (m) => {
      const u = e.skillsPath ? e.skillsPath + "/" : "", E = t ? `https://gitee.com/${e.owner}/${e.repo}/raw/${e.ref}/${u}${m.name}/SKILL.md` : `https://raw.githubusercontent.com/${e.owner}/${e.repo}/${e.ref}/${u}${m.name}/SKILL.md`, y = t ? `https://gitee.com/${e.owner}/${e.repo}/tree/${e.ref}/${u}${m.name}` : `https://github.com/${e.owner}/${e.repo}/tree/${e.ref}/${u}${m.name}`, b = {
        sourceId: e.id,
        sourceLabel: e.label,
        name: m.name,
        description: "",
        source_url: y,
        html_url: y,
        version: null,
        author: null
      };
      try {
        const T = {};
        t && e.accessToken && (T.Authorization = `token ${e.accessToken}`);
        const C = await fetch(E, {
          headers: T
        });
        if (!C.ok) return b;
        const x = await C.text(), I = cr(x);
        return {
          ...b,
          name: I.name || m.name,
          description: I.description || "",
          version: I.version || null,
          author: I.author || null
        };
      } catch {
        return b;
      }
    })
  );
}
async function mr(e) {
  const t = or(e.url);
  if (!t)
    throw new Error(`Invalid OSS URL: ${e.url}`);
  const { endpoint: l, prefix: a } = t, n = a.split("/").map(encodeURIComponent).join("/"), r = await vt(
    `${n}/manifest.json`
  );
  if (!r.ok)
    throw new Error(
      `无法获取技能列表: manifest.json (${r.status})`
    );
  const s = await r.json(), c = [];
  if (s && s.tag_groups && typeof s.tag_groups == "object")
    for (const [u, E] of Object.entries(s.tag_groups))
      Array.isArray(E) && c.push({
        id: u,
        label: Qe(u),
        tags: E
      });
  const i = [];
  function m(u, E) {
    for (const y of u) {
      if (y.type === "collection" && Array.isArray(y.children)) {
        m(y.children, y.name);
        continue;
      }
      const b = y.path || y.name || "";
      if (!b) continue;
      const T = b.split("/").map(encodeURIComponent).join("/"), C = `${l}/${n}/${T}`;
      let x = null;
      if (y.metadata) {
        const j = y.metadata.match(/version:\s*"?([\d.]+)"?/);
        j && (x = j[1]);
      }
      const I = E ? `${e.label}/${E}` : e.label;
      i.push({
        sourceId: e.id,
        sourceLabel: e.label,
        sourcePath: I,
        name: y.name || b.split("/").pop() || b,
        description: y.description || "",
        source_url: C,
        html_url: C,
        version: x,
        author: null,
        tag: y.tag || void 0,
        isOfficial: !0
      });
    }
  }
  if (Array.isArray(s) ? m(
    s.map(
      (u) => typeof u == "string" ? { name: u, path: u } : u
    )
  ) : s && Array.isArray(s.skills) && m(s.skills), i.length === 0)
    throw new Error(
      `manifest.json 中未找到技能。请检查 ${e.url}/manifest.json`
    );
  return { skills: i, categories: c };
}
async function ur() {
  const e = await Jt("mcp/manifest.json"), t = [], l = {};
  if (e.tag_groups && typeof e.tag_groups == "object")
    for (const [n, r] of Object.entries(e.tag_groups))
      Array.isArray(r) && (l[n] = r, t.push({
        id: n,
        label: Qe(n),
        tags: r
      }));
  return { servers: (e.servers || []).map((n) => {
    let r = "";
    const s = n.tags || [];
    for (const [c, i] of Object.entries(l))
      if (i.some((m) => s.includes(m))) {
        r = c;
        break;
      }
    return {
      id: n.id || n.name,
      name: n.name || n.id,
      description: n.description || "",
      tags: s,
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
async function pr() {
  const e = await Jt("skills/manifest.json"), t = [], l = /* @__PURE__ */ new Set();
  function a(n, r) {
    for (const s of n) {
      if ((s == null ? void 0 : s.type) === "collection" && Array.isArray(s.children)) {
        a(s.children, s.name || r);
        continue;
      }
      const c = String((s == null ? void 0 : s.path) || (s == null ? void 0 : s.name) || "").trim();
      if (!c) continue;
      const i = c.split("/").map(encodeURIComponent).join("/"), m = `${aa}/skills/${i}`, u = typeof s.tag == "string" && s.tag.trim() ? s.tag.trim() : void 0;
      u && l.add(u);
      let E = null;
      if (typeof s.metadata == "string") {
        const y = s.metadata.match(/version:\s*"?([\d.]+)"?/);
        y && (E = y[1]);
      }
      t.push({
        sourceId: "oss:ugsci-official",
        sourceLabel: "UGSci",
        sourcePath: r ? `UGSci/${r}` : "UGSci",
        name: s.name || c.split("/").pop() || c,
        description: s.description || "",
        source_url: m,
        html_url: m,
        version: E,
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
async function gr() {
  const e = await Jt("agents/manifest.json"), t = [], l = {};
  if (e.tag_groups && typeof e.tag_groups == "object")
    for (const [n, r] of Object.entries(e.tag_groups))
      Array.isArray(r) && (l[n] = r, t.push({
        id: n,
        label: Qe(n),
        tags: r
      }));
  return { agents: (e.agents || []).map((n) => {
    let r = "";
    const s = n.tags || [];
    for (const [c, i] of Object.entries(l))
      if (i.some((m) => s.includes(m))) {
        r = c;
        break;
      }
    return {
      id: n.id || n.name,
      name: n.name || n.id,
      description: n.description || "",
      path: n.path || "",
      tags: s,
      config: n.config,
      instructions: n.instructions,
      skills_manifest: n.skills_manifest,
      drivers: n.drivers,
      category: r
    };
  }), categories: t };
}
async function fr(e) {
  const t = e.filter((s) => s.enabled), l = await Promise.all(
    t.map(async (s) => {
      try {
        if (s.platform === "oss") {
          const { skills: c, categories: i } = await mr(s);
          return { skills: c, categories: i, error: null, label: s.label };
        } else
          return { skills: await dr(s), categories: [], error: null, label: s.label };
      } catch (c) {
        return {
          skills: [],
          categories: [],
          error: c.message || String(c),
          label: s.label
        };
      }
    })
  ), a = [], n = [], r = [];
  for (const s of l)
    a.push(...s.skills), n.push(...s.categories), s.error && r.push({ label: s.label, message: s.error });
  return { skills: a, errors: r, categories: n };
}
function yr({
  open: e,
  onClose: t,
  sources: l,
  onChange: a
}) {
  const n = S().React, { useState: r } = n, {
    Modal: s,
    Input: c,
    Button: i,
    List: m,
    Tag: u,
    Switch: E,
    Typography: y,
    Tooltip: b,
    message: T
  } = S().antd, {
    PlusOutlined: C,
    DeleteOutlined: x,
    LinkOutlined: I,
    GithubOutlined: j
  } = S().antdIcons || {}, { Text: F } = y, [G, H] = r(""), [q, J] = r(""), O = () => {
    const w = G.trim();
    if (!w) return;
    const f = ia(w);
    if (!f) {
      T.error("无效的仓库 URL，请输入类似 https://github.com/owner/repo/tree/main/skills 或 https://gitee.com/owner/repo/tree/master/skills 的链接");
      return;
    }
    const g = ca(f.owner, f.repo, f.skillsPath, f.platform);
    if (l.some((D) => D.id === g)) {
      T.warning("该源已存在");
      return;
    }
    const $ = {
      id: g,
      url: w,
      label: f.label,
      owner: f.owner,
      repo: f.repo,
      ref: f.ref,
      skillsPath: f.skillsPath,
      enabled: !0,
      platform: f.platform,
      accessToken: q.trim() || void 0
    }, h = [...l, $];
    yt(h), a(h), H(""), J(""), T.success(`已添加源: ${f.label}`);
  }, z = (w, f) => {
    const g = l.map(
      ($) => $.id === w ? { ...$, enabled: f } : $
    );
    yt(g), a(g);
  }, W = (w, f) => {
    const g = l.map(
      ($) => $.id === w ? { ...$, accessToken: f.trim() || void 0 } : $
    );
    yt(g), a(g);
  }, X = (w) => {
    const f = l.filter((g) => g.id !== w);
    yt(f), a(f), T.success("已移除源");
  };
  return n.createElement(
    s,
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
        F,
        { type: "secondary", style: { fontSize: 12, display: "block", marginBottom: 8 } },
        "添加 GitHub 或 Gitee 仓库作为技能源，系统将从该仓库的指定目录获取技能列表。支持格式："
      ),
      n.createElement(
        "div",
        { style: { display: "flex", gap: 8, alignItems: "center" } },
        n.createElement(c, {
          placeholder: "https://github.com/owner/repo/tree/main/skills 或 https://gitee.com/owner/repo/tree/master/skills",
          value: G,
          onChange: (w) => H(w.target.value),
          onPressEnter: O,
          prefix: I ? n.createElement(I) : void 0,
          style: { flex: 1 }
        }),
        n.createElement(
          i,
          {
            type: "primary",
            icon: C ? n.createElement(C) : void 0,
            onClick: O
          },
          "添加"
        )
      ),
      // Gitee token input (shown when URL looks like a Gitee link)
      G.trim() && G.trim().toLowerCase().includes("gitee.com") ? n.createElement(
        "div",
        { style: { marginTop: 8, display: "flex", gap: 8, alignItems: "center" } },
        n.createElement(
          F,
          { type: "secondary", style: { fontSize: 12, whiteSpace: "nowrap" } },
          "Gitee Token:"
        ),
        n.createElement(c.Password, {
          placeholder: "私有仓库请填写 Gitee 私人令牌（可选）",
          value: q,
          onChange: (w) => J(w.target.value),
          style: { flex: 1 }
        })
      ) : null
    ),
    n.createElement(
      "div",
      { style: { marginBottom: 8, display: "flex", alignItems: "center", justifyContent: "space-between" } },
      n.createElement(F, { strong: !0 }, `已配置源 (${l.length})`)
    ),
    n.createElement(m, {
      size: "small",
      bordered: !0,
      dataSource: l,
      renderItem: (w) => n.createElement(
        m.Item,
        {
          actions: [
            n.createElement(
              b,
              { title: w.enabled ? "点击禁用" : "点击启用" },
              n.createElement(E, {
                size: "small",
                checked: w.enabled,
                onChange: (f) => z(w.id, f)
              })
            ),
            n.createElement(
              b,
              { title: "移除此源" },
              n.createElement(
                i,
                {
                  size: "small",
                  type: "text",
                  danger: !0,
                  icon: x ? n.createElement(x) : void 0,
                  onClick: () => X(w.id)
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
              { color: w.platform === "gitee" ? "orange" : w.platform === "oss" ? "green" : "blue", style: { fontSize: 11 } },
              w.platform === "gitee" ? "Gitee" : w.platform === "oss" ? "OSS" : "GitHub"
            ),
            n.createElement(
              u,
              { style: { fontSize: 11 } },
              w.label
            ),
            w.skillsPath ? n.createElement(
              F,
              { type: "secondary", style: { fontSize: 11 } },
              `/${w.skillsPath}`
            ) : null,
            w.platform !== "oss" ? n.createElement(
              F,
              { type: "secondary", style: { fontSize: 11 } },
              `@${w.ref}`
            ) : null
          ),
          n.createElement(
            F,
            {
              type: "secondary",
              style: { fontSize: 11, wordBreak: "break-all" }
            },
            w.url
          ),
          // Gitee token input for existing Gitee sources
          w.platform === "gitee" ? n.createElement(
            "div",
            { style: { marginTop: 6, display: "flex", gap: 6, alignItems: "center" } },
            n.createElement(
              F,
              { type: "secondary", style: { fontSize: 11, whiteSpace: "nowrap" } },
              "Token:"
            ),
            n.createElement(c.Password, {
              size: "small",
              placeholder: "Gitee 私人令牌（可选，用于私有仓库）",
              value: w.accessToken || "",
              onChange: (f) => W(w.id, f.target.value),
              style: { flex: 1 }
            })
          ) : null
        )
      )
    })
  );
}
function $n({
  open: e,
  onClose: t,
  sources: l,
  onChange: a,
  type: n
}) {
  const r = S().React, { useState: s } = r, {
    Modal: c,
    Input: i,
    Button: m,
    List: u,
    Tag: E,
    Switch: y,
    Typography: b,
    Tooltip: T,
    message: C
  } = S().antd, {
    PlusOutlined: x,
    DeleteOutlined: I,
    LinkOutlined: j,
    ApiOutlined: F,
    UserOutlined: G,
    ImportOutlined: H,
    ExportOutlined: q,
    CopyOutlined: J
  } = S().antdIcons || {}, { Text: O } = b, [z, W] = s(""), [X, w] = s(""), [f, g] = s(""), [$, h] = s(!1), D = n === "mcp" ? "MCP" : "专家模板", Z = n === "mcp" ? F ? r.createElement(F, { style: { fontSize: 18 } }) : null : G ? r.createElement(G, { style: { fontSize: 18 } }) : null, M = () => {
    const v = z.trim(), B = X.trim();
    if (!v) return;
    const re = B || v.slice(0, 40), V = `${n}:${v}`;
    if (l.some((A) => A.id === V)) {
      C.warning("该源已存在");
      return;
    }
    const Q = {
      id: V,
      label: re,
      url: v,
      enabled: !0,
      type: n
    }, pe = [...l, Q];
    n === "mcp" ? gt(pe) : ft(pe), a(pe), W(""), w(""), C.success(`已添加${D}源: ${re}`);
  }, k = (v, B) => {
    const re = l.map(
      (V) => V.id === v ? { ...V, enabled: B } : V
    );
    n === "mcp" ? gt(re) : ft(re), a(re);
  }, d = (v) => {
    const B = l.filter((re) => re.id !== v);
    n === "mcp" ? gt(B) : ft(B), a(B), C.success("已移除源");
  }, ee = () => {
    const v = JSON.stringify(
      { type: n, sources: l },
      null,
      2
    );
    try {
      navigator.clipboard.writeText(v), C.success(`${D}源已复制到剪贴板（${l.length} 个源）`);
    } catch {
      const B = document.createElement("textarea");
      B.value = v, document.body.appendChild(B), B.select(), document.execCommand("copy"), document.body.removeChild(B), C.success(`${D}源已复制到剪贴板（${l.length} 个源）`);
    }
  }, U = () => {
    const v = f.trim();
    if (!v) {
      C.warning("请粘贴 JSON 内容");
      return;
    }
    try {
      const B = JSON.parse(v);
      let re = [];
      if (Array.isArray(B))
        re = B;
      else if (B && Array.isArray(B.sources))
        re = B.sources;
      else if (B && typeof B == "object")
        re = [B];
      else
        throw new Error("Invalid format");
      const V = re.filter(
        (_) => _ && typeof _.url == "string" && typeof _.label == "string"
      );
      if (V.length === 0) {
        C.error("未找到有效的源数据");
        return;
      }
      const Q = new Set(l.map((_) => _.id)), pe = [];
      for (const _ of V) {
        const le = _.id || `${n}:${_.url}`;
        Q.has(le) || pe.push({
          id: le,
          label: _.label,
          url: _.url,
          enabled: _.enabled !== !1,
          type: n
        });
      }
      if (pe.length === 0) {
        C.info("所有源均已存在，无新增");
        return;
      }
      const A = [...l, ...pe];
      n === "mcp" ? gt(A) : ft(A), a(A), g(""), h(!1), C.success(`成功导入 ${pe.length} 个${D}源`);
    } catch (B) {
      C.error(`JSON 解析失败: ${B.message || "格式错误"}`);
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
        r.createElement("span", null, `配置${D}源`)
      ),
      footer: r.createElement(
        "div",
        { style: { display: "flex", justifyContent: "space-between" } },
        r.createElement(
          "div",
          { style: { display: "flex", gap: 8 } },
          r.createElement(
            m,
            {
              icon: q ? r.createElement(q) : void 0,
              onClick: ee,
              disabled: l.length === 0,
              size: "small"
            },
            "导出到剪贴板"
          ),
          r.createElement(
            m,
            {
              icon: H ? r.createElement(H) : void 0,
              onClick: () => h(!$),
              size: "small"
            },
            $ ? "隐藏导入" : "导入JSON"
          )
        ),
        r.createElement(
          m,
          { onClick: t },
          "关闭"
        )
      ),
      width: 680
    },
    // Description
    r.createElement(
      O,
      { type: "secondary", style: { fontSize: 12, display: "block", marginBottom: 12 } },
      `配置${D}源地址，支持从远程仓库或团队共享的 JSON 导入${D}配置。`
    ),
    // Import section (collapsible)
    $ ? r.createElement(
      "div",
      {
        style: {
          marginBottom: 16,
          padding: 12,
          background: "#fafafa",
          borderRadius: 8,
          border: "1px solid #f0f0f0"
        }
      },
      r.createElement(
        O,
        { strong: !0, style: { fontSize: 12, display: "block", marginBottom: 8 } },
        `粘贴${D}源 JSON（支持从导出的剪贴板内容粘贴）`
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
        value: f,
        onChange: (v) => g(v.target.value),
        autoSize: { minRows: 4, maxRows: 10 },
        style: { fontFamily: "monospace", fontSize: 12 }
      }),
      r.createElement(
        "div",
        { style: { marginTop: 8, display: "flex", gap: 8 } },
        r.createElement(
          m,
          {
            type: "primary",
            size: "small",
            onClick: U
          },
          "导入"
        ),
        r.createElement(
          m,
          {
            size: "small",
            onClick: () => g("")
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
        onChange: (v) => w(v.target.value),
        style: { width: 200 }
      }),
      r.createElement(i, {
        placeholder: n === "mcp" ? "https://raw.githubusercontent.com/team/mcp-registry/main/mcp.json" : "https://raw.githubusercontent.com/team/expert-registry/main/experts.json",
        value: z,
        onChange: (v) => W(v.target.value),
        onPressEnter: M,
        prefix: j ? r.createElement(j) : void 0,
        style: { flex: 1 }
      }),
      r.createElement(
        m,
        {
          type: "primary",
          icon: x ? r.createElement(x) : void 0,
          onClick: M
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
        O,
        { strong: !0 },
        `已配置源 (${l.length})`
      )
    ),
    r.createElement(u, {
      size: "small",
      bordered: !0,
      dataSource: l,
      renderItem: (v) => r.createElement(
        u.Item,
        {
          actions: [
            r.createElement(
              T,
              { title: v.enabled ? "点击禁用" : "点击启用" },
              r.createElement(y, {
                size: "small",
                checked: v.enabled,
                onChange: (B) => k(v.id, B)
              })
            ),
            r.createElement(
              T,
              { title: "移除此源" },
              r.createElement(
                m,
                {
                  size: "small",
                  type: "text",
                  danger: !0,
                  icon: I ? r.createElement(I) : void 0,
                  onClick: () => d(v.id)
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
              E,
              {
                color: n === "mcp" ? "purple" : "blue",
                style: { fontSize: 11 }
              },
              v.label
            ),
            v.enabled ? null : r.createElement(
              E,
              { style: { fontSize: 10 } },
              "已禁用"
            )
          ),
          r.createElement(
            O,
            {
              type: "secondary",
              style: { fontSize: 11, wordBreak: "break-all" }
            },
            v.url
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
async function Er() {
  return ie("/market/providers");
}
async function hr(e) {
  return ie(
    `/market/categories?lang=${encodeURIComponent(e)}`
  );
}
async function vr(e, t, l, a, n) {
  return ie("/market/search", {
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
function On(e) {
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
async function Rn(e, t) {
  const l = { bundle_url: e };
  return t && (l.access_token = t), ie("/skills/pool/import", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(l)
  });
}
function br() {
  const e = S().React, { useState: t, useEffect: l, useCallback: a, useMemo: n, useRef: r } = e, {
    Spin: s,
    Empty: c,
    Input: i,
    Button: m,
    message: u,
    Row: E,
    Col: y,
    Card: b,
    Tag: T,
    Tooltip: C,
    Typography: x,
    Select: I,
    Drawer: j,
    Descriptions: F,
    Tabs: G,
    Badge: H,
    Progress: q,
    Modal: J,
    Alert: O
  } = S().antd, {
    ReloadOutlined: z,
    SearchOutlined: W,
    DownloadOutlined: X,
    AppstoreOutlined: w,
    ShopOutlined: f,
    CheckCircleOutlined: g,
    LoadingOutlined: $,
    UserOutlined: h,
    UserAddOutlined: D,
    SettingOutlined: Z,
    GithubOutlined: M,
    ApiOutlined: k
  } = S().antdIcons || {}, { Text: d, Paragraph: ee, Title: U } = x, [v, B] = t("skills"), [re, V] = t([]), [Q, pe] = t([]), [A, _] = t([]), [le, te] = t(""), [ne, ge] = t(""), [be, Se] = t(!1), [Ce, ye] = t(!1), [ae, he] = t(
    {}
  ), [ue, K] = t(null), [se, me] = t({}), [N, p] = t([]), [de, L] = t(""), [oe, fe] = t(""), [ve, Ae] = t(""), [Te, Me] = t({}), [Le, Ue] = t(""), [Ne, De] = t(/* @__PURE__ */ new Set()), [ke, $e] = t(null), [Y, _e] = t({}), [ze, Oe] = t([]), [Je, Ke] = t([]), [xe, it] = t([]), [Tt, et] = t(""), [Fe, ct] = t(!1), [da, Kt] = t(!1), [ma, qt] = t([]), [ua, Xt] = t(!1), [pa, Vt] = t([]), [ga, Yt] = t(!1), [Qt, Zt] = t([]), [en, tn] = t([]), [nn, an] = t(!1), [qe, ln] = t(""), [rn, sn] = t([]), [on, cn] = t([]), [dn, mn] = t(!1), [Xe, un] = t(""), [_t, pn] = t(!1), [Re, dt] = t(null), [tt, fa] = t([]), nt = r(null);
  l(() => {
    Promise.all([
      Er().catch(() => []),
      hr("zh").catch(() => []),
      xt().catch(() => [])
    ]).then(([o, P, R]) => {
      V(o), pe(P), p(R), R.length > 0 && (L(R[0].id), Ue(R[0].id));
    });
  }, []);
  const mt = a(async (o) => {
    const P = o ?? ir();
    if (Oe(o || P), P.filter((ce) => ce.enabled).length === 0) {
      Ke([]);
      return;
    }
    ct(!0);
    try {
      const { skills: ce, errors: Ee, categories: Ie } = await fr(P);
      if (Ke(ce), fa(Ie), Ee.length > 0) {
        for (const we of Ee)
          console.warn(`[ugsci] GitHub source '${we.label}' error: ${we.message}`);
        u.warning(
          `部分源加载失败: ${Ee.map((we) => we.label).join(", ")}`
        );
      }
    } catch (ce) {
      u.error(ce.message || "加载技能源失败"), Ke([]);
    } finally {
      ct(!1);
    }
  }, []), It = a(async () => {
    var ce, Ee, Ie;
    an(!0), mn(!0), ct(!0);
    const [o, P, R] = await Promise.allSettled([
      ur(),
      gr(),
      pr()
    ]);
    if (o.status === "fulfilled" ? (Zt(o.value.servers), tn(o.value.categories)) : (console.warn(`[ugsci] MCP manifest error: ${((ce = o.reason) == null ? void 0 : ce.message) || o.reason}`), Zt([]), tn([])), an(!1), P.status === "fulfilled" ? (sn(P.value.agents), cn(P.value.categories)) : (console.warn(`[ugsci] Agents manifest error: ${((Ee = P.reason) == null ? void 0 : Ee.message) || P.reason}`), sn([]), cn([])), mn(!1), R.status === "fulfilled")
      it(R.value.skills), et("");
    else {
      const we = ((Ie = R.reason) == null ? void 0 : Ie.message) || String(R.reason);
      console.warn(`[ugsci] Skills manifest error: ${we}`), it([]), et(we);
    }
    ct(!1);
  }, []);
  l(() => {
    mt(), It(), qt(rr()), Vt(sr());
  }, [mt, It]);
  const ut = a(
    async (o, P, R) => {
      Se(!0);
      try {
        const ce = await vr(
          o,
          R,
          20,
          "zh",
          P || void 0
        );
        R === void 0 || Object.keys(R).length === 0 ? _(ce.results) : _((we) => [...we, ...ce.results]);
        const Ee = Object.values(ce.by_provider || {}).some(
          (we) => we.has_more
        );
        ye(Ee);
        const Ie = {};
        for (const [we, Ge] of Object.entries(ce.by_provider || {}))
          Ie[we] = (R[we] || 1) + 1;
        if (he(Ie), ce.errors.length > 0)
          for (const we of ce.errors)
            console.warn(
              `[ugsci] Market provider '${we.provider}' error: ${we.message}`
            );
      } catch (ce) {
        u.error(ce.message || "搜索市场失败"), _([]);
      } finally {
        Se(!1);
      }
    },
    []
  );
  l(() => (nt.current && clearTimeout(nt.current), nt.current = setTimeout(() => {
    ut(le, ne, {});
  }, 400), () => {
    nt.current && clearTimeout(nt.current);
  }), [le, ne, ut]);
  const ya = () => {
    ut(le, ne, ae);
  }, gn = async (o) => {
    const P = `${o.source}:${o.slug}`;
    try {
      me((ce) => ({ ...ce, [P]: "installing" }));
      const R = await Rn(o.source_url);
      R.installed && u.success(
        `技能「${R.name || o.name}」已安装到技能池，可在技能中心查看`
      ), me((ce) => {
        const Ee = { ...ce };
        return delete Ee[P], Ee;
      });
    } catch (R) {
      u.error(On(R) || "安装技能失败"), me((ce) => {
        const Ee = { ...ce };
        return delete Ee[P], Ee;
      });
    }
  }, Ea = (o) => {
    window.history.pushState({}, "", o), window.dispatchEvent(new PopStateEvent("popstate"));
  }, ha = async (o) => {
    const P = `github:${o.sourceId}:${o.name}`, R = ze.find((Ee) => Ee.id === o.sourceId), ce = (R == null ? void 0 : R.accessToken) || void 0;
    try {
      me((Ie) => ({ ...Ie, [P]: "installing" }));
      const Ee = await Rn(o.source_url, ce);
      Ee.installed && u.success(
        `技能「${Ee.name || o.name}」已安装到技能池，可在技能中心查看`
      ), me((Ie) => {
        const we = { ...Ie };
        return delete we[P], we;
      });
    } catch (Ee) {
      u.error(On(Ee) || "安装技能失败"), me((Ie) => {
        const we = { ...Ie };
        return delete we[P], we;
      });
    }
  }, We = n(() => {
    const o = [], P = /* @__PURE__ */ new Set();
    for (const R of [...xe, ...Je]) {
      const ce = R.source_url || `${R.sourceLabel}:${R.name}`;
      P.has(ce) || (P.add(ce), o.push(R));
    }
    return o;
  }, [xe, Je]), fn = n(() => {
    const o = [], P = /* @__PURE__ */ new Set();
    if (tt.length > 0)
      for (const R of tt)
        P.has(R.id) || (P.add(R.id), o.push(R));
    for (const R of We)
      R.tag && !P.has(R.tag) && (P.add(R.tag), o.push({ id: R.tag, label: R.tag }));
    for (const R of We)
      !R.isOfficial && R.sourceLabel && !P.has(R.sourceLabel) && (P.add(R.sourceLabel), o.push({ id: R.sourceLabel, label: R.sourceLabel }));
    return o;
  }, [We, tt]), zt = n(() => {
    let o = We;
    if (ne) {
      const P = tt.find((R) => R.id === ne);
      P && P.tags ? o = o.filter(
        (R) => R.tag && P.tags.includes(R.tag) || R.sourceLabel === ne
      ) : o = o.filter(
        (R) => R.tag === ne || R.sourceLabel === ne
      );
    }
    if (le.trim()) {
      const P = le.toLowerCase();
      o = o.filter(
        (R) => {
          var ce;
          return R.name.toLowerCase().includes(P) || ((ce = R.description) == null ? void 0 : ce.toLowerCase().includes(P));
        }
      );
    }
    return o;
  }, [We, le, ne, tt]), yn = re.filter((o) => o.available), Ve = n(() => ne ? A.filter((o) => {
    const P = yn.find((R) => R.key === o.source);
    return (P == null ? void 0 : P.label) === ne;
  }) : A, [A, ne, yn]), va = e.createElement(
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
        prefix: W ? e.createElement(W) : void 0,
        value: le,
        onChange: (o) => te(o.target.value),
        allowClear: !0,
        style: { flex: 1, minWidth: 200, maxWidth: 400 }
      }),
      // Pool install info
      e.createElement(
        d,
        { type: "secondary", style: { fontSize: 12 } },
        "安装后进入技能池"
      ),
      // Configure skill source button
      e.createElement(
        m,
        {
          icon: M ? e.createElement(M) : void 0,
          onClick: () => Kt(!0),
          size: "small"
        },
        "配置技能源"
      )
    ),
    // Dynamic category filter tags (from OSS manifest tags + imported sources)
    Tt && We.length === 0 ? e.createElement(O, {
      type: "warning",
      showIcon: !0,
      message: "UGSci 官方 OSS 技能库加载失败",
      description: "请检查网络或后端 OSS 代理服务，然后点击右上角“刷新”重试。",
      style: { marginBottom: 12 }
    }) : null,
    fn.length > 0 ? e.createElement(
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
        d,
        { type: "secondary", style: { fontSize: 12, marginRight: 4 } },
        "分类:"
      ),
      e.createElement(
        T,
        {
          style: {
            fontSize: 11,
            cursor: "pointer",
            borderRadius: 12
          },
          color: ne === "" ? "blue" : void 0,
          onClick: () => ge("")
        },
        "全部"
      ),
      ...fn.map((o) => {
        const P = Je.some(
          (R) => !R.isOfficial && R.sourceLabel === o.id
        );
        return e.createElement(
          T,
          {
            key: o.id,
            style: {
              fontSize: 11,
              cursor: "pointer",
              borderRadius: 12
            },
            color: ne === o.id ? P ? "blue" : "geekblue" : void 0,
            icon: P && M ? e.createElement(M) : void 0,
            onClick: () => ge(
              ne === o.id ? "" : o.id
            )
          },
          o.label
        );
      })
    ) : null,
    // GitHub skills section
    Fe && We.length === 0 ? e.createElement(
      "div",
      { style: { textAlign: "center", padding: 40, marginBottom: 16 } },
      e.createElement(s, { size: "large" }, e.createElement("div", { style: { minHeight: 60, display: "flex", alignItems: "center", justifyContent: "center" } }, "正在加载技能..."))
    ) : zt.length > 0 ? e.createElement(
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
        M ? e.createElement(M, {
          style: { fontSize: 14, color: "#1677ff" }
        }) : null,
        e.createElement(
          d,
          { strong: !0, style: { fontSize: 13 } },
          `技能市场 (${zt.length})`
        )
      ),
      e.createElement(
        E,
        { gutter: [12, 12] },
        ...zt.map((o) => {
          const P = `github:${o.sourceId}:${o.name}`, R = se[P];
          return e.createElement(
            y,
            { key: P, xs: 24, sm: 12, md: 8, lg: 6 },
            e.createElement(
              b,
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
                M ? e.createElement(M, {
                  style: { fontSize: 18, color: "#57606a" }
                }) : e.createElement(
                  "span",
                  { style: { fontSize: 18 } },
                  "📦"
                ),
                e.createElement(
                  C,
                  { title: o.name },
                  e.createElement(
                    d,
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
                    o.name
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
                o.description || "暂无描述"
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
                  o.sourcePath || o.sourceLabel ? e.createElement(
                    "span",
                    {
                      style: {
                        fontSize: 10,
                        color: "#999",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 2
                      }
                    },
                    k ? e.createElement(k, { style: { fontSize: 10 } }) : null,
                    o.sourcePath || o.sourceLabel
                  ) : null,
                  // Show tag as category badge
                  o.tag ? e.createElement(
                    T,
                    { color: "geekblue", style: { fontSize: 10 } },
                    o.tag
                  ) : null,
                  o.version ? e.createElement(
                    T,
                    { style: { fontSize: 10 } },
                    `v${o.version}`
                  ) : null
                ),
                R ? e.createElement(
                  m,
                  {
                    size: "small",
                    disabled: !0,
                    icon: $ ? e.createElement($) : void 0
                  },
                  "安装中"
                ) : e.createElement(
                  m,
                  {
                    type: "primary",
                    size: "small",
                    icon: X ? e.createElement(X) : void 0,
                    onClick: () => ha(o)
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
    Ve.length > 0 || be ? e.createElement(
      "div",
      {
        style: {
          marginBottom: 10,
          display: "flex",
          alignItems: "center",
          gap: 6
        }
      },
      f ? e.createElement(f, {
        style: { fontSize: 14, color: "#1677ff" }
      }) : null,
      e.createElement(
        d,
        { strong: !0, style: { fontSize: 13 } },
        `技能市场${Ve.length > 0 ? ` (${Ve.length})` : ""}`
      )
    ) : null,
    // Results grid
    be && Ve.length === 0 ? e.createElement(
      "div",
      { style: { textAlign: "center", padding: 60 } },
      e.createElement(s, { size: "large" })
    ) : Ve.length === 0 ? e.createElement(c, {
      description: le ? `未找到匹配「${le}」的技能` : "输入关键词搜索技能市场",
      image: c.PRESENTED_IMAGE_SIMPLE
    }) : e.createElement(
      E,
      { gutter: [12, 12] },
      ...Ve.map((o) => {
        const P = `${o.source}:${o.slug}`, R = se[P];
        return e.createElement(
          y,
          { key: P, xs: 24, sm: 12, md: 8, lg: 6 },
          e.createElement(
            b,
            {
              hoverable: !0,
              size: "small",
              style: { height: "100%", cursor: "pointer" },
              onClick: () => K(o)
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
              o.icon_url ? e.createElement("img", {
                src: o.icon_url,
                alt: o.name,
                style: { width: 24, height: 24, borderRadius: 4 }
              }) : e.createElement(
                "span",
                { style: { fontSize: 18 } },
                "📦"
              ),
              e.createElement(
                C,
                { title: o.name },
                e.createElement(
                  d,
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
                  o.name
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
              o.description || "暂无描述"
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
                  T,
                  { color: "geekblue", style: { fontSize: 10 } },
                  o.source
                ),
                o.version ? e.createElement(
                  T,
                  { style: { fontSize: 10 } },
                  `v${o.version}`
                ) : null
              ),
              R ? e.createElement(
                m,
                {
                  size: "small",
                  disabled: !0,
                  icon: $ ? e.createElement($) : void 0
                },
                "安装中"
              ) : e.createElement(
                m,
                {
                  type: "primary",
                  size: "small",
                  icon: X ? e.createElement(X) : void 0,
                  onClick: (ce) => {
                    ce.stopPropagation(), gn(o);
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
    Ce && !be ? e.createElement(
      "div",
      { style: { textAlign: "center", marginTop: 16 } },
      e.createElement(
        m,
        { onClick: ya, loading: be },
        "加载更多"
      )
    ) : null,
    // Detail Drawer
    ue ? e.createElement(
      j,
      {
        title: e.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 8 } },
          ue.icon_url ? e.createElement("img", {
            src: ue.icon_url,
            alt: ue.name,
            style: { width: 28, height: 28, borderRadius: 4 }
          }) : e.createElement(
            "span",
            { style: { fontSize: 20 } },
            "📦"
          ),
          e.createElement("span", null, ue.name)
        ),
        open: !0,
        onClose: () => K(null),
        width: 480,
        extra: e.createElement(
          m,
          {
            type: "primary",
            icon: X ? e.createElement(X) : void 0,
            onClick: () => {
              gn(ue);
            }
          },
          "安装到技能池"
        )
      },
      e.createElement(
        F,
        { column: 1, bordered: !0, size: "small" },
        e.createElement(
          F.Item,
          { label: "来源" },
          ue.source
        ),
        e.createElement(
          F.Item,
          { label: "描述" },
          ue.description || "-"
        ),
        ue.version ? e.createElement(
          F.Item,
          { label: "版本" },
          ue.version
        ) : null,
        ue.author ? e.createElement(
          F.Item,
          { label: "作者" },
          ue.author
        ) : null,
        e.createElement(
          F.Item,
          { label: "来源链接" },
          e.createElement(
            "a",
            { href: ue.source_url, target: "_blank" },
            ue.source_url
          )
        )
      ),
      ue.stats ? e.createElement(
        "div",
        { style: { marginTop: 16 } },
        e.createElement(
          d,
          {
            strong: !0,
            style: { display: "block", marginBottom: 8 }
          },
          "统计"
        ),
        e.createElement(
          "div",
          { style: { display: "flex", gap: 12, flexWrap: "wrap" } },
          ...Object.entries(ue.stats).map(
            ([o, P]) => e.createElement(
              "div",
              { key: o, style: { textAlign: "center" } },
              e.createElement(
                "div",
                {
                  style: {
                    fontSize: 18,
                    fontWeight: 600,
                    color: "#1677ff"
                  }
                },
                String(P)
              ),
              e.createElement(
                d,
                { type: "secondary", style: { fontSize: 11 } },
                o
              )
            )
          )
        )
      ) : null
    ) : null
  ), At = n(() => {
    let o = rn;
    if (Xe && (o = o.filter((P) => P.category === Xe)), oe.trim()) {
      const P = oe.toLowerCase();
      o = o.filter(
        (R) => R.name.toLowerCase().includes(P) || R.description.toLowerCase().includes(P) || R.tags.some((ce) => ce.toLowerCase().includes(P))
      );
    }
    return o;
  }, [rn, oe, Xe]), ba = async (o) => {
    if (!_t) {
      pn(!0);
      try {
        let P = o.description;
        if (o.instructions)
          try {
            const Ee = o.instructions.replace(/^\/+/, ""), Ie = await vt(Ee);
            Ie.ok && (P = await Ie.text());
          } catch {
          }
        let R = [];
        if (o.skills_manifest)
          try {
            const Ee = o.skills_manifest.replace(/^\/+/, ""), Ie = await vt(Ee);
            if (Ie.ok) {
              const we = await Ie.json();
              Array.isArray(we) ? R = we.map((Ge) => typeof Ge == "string" ? Ge : Ge.name).filter(Boolean) : we.skills && (R = we.skills.map((Ge) => typeof Ge == "string" ? Ge : Ge.name).filter(Boolean));
            }
          } catch {
          }
        const ce = await ie("/agents", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: o.name,
            description: o.description,
            skill_names: R
          })
        });
        await ht(ce.id, "AGENTS.md", P), u.success(`专家「${o.name}」创建成功，已跳转至专家`), Ea("/ugsci-experts");
      } catch (P) {
        u.error(P.message || "创建专家失败");
      } finally {
        pn(!1);
      }
    }
  }, En = a(async (o) => {
    if (o)
      try {
        const P = await Dt(o);
        De(new Set(P.map((R) => R.key)));
      } catch {
        De(/* @__PURE__ */ new Set());
      }
  }, []);
  l(() => {
    Le && En(Le);
  }, [Le, En]);
  const Sa = async (o) => {
    if (!Le) {
      u.warning("请先选择目标专家");
      return;
    }
    if (tr(o)) {
      const P = Object.entries(o.env), R = {};
      for (const [ce] of P)
        R[ce] = "";
      _e(R), $e(o);
      return;
    }
    await hn(o, o.env || {});
  }, hn = async (o, P) => {
    Me((R) => ({ ...R, [o.id]: !0 }));
    try {
      const R = o.id;
      await Ft(Le, {
        client_key: R,
        client: {
          name: o.name,
          description: o.description,
          enabled: !0,
          transport: o.transport,
          url: o.url || "",
          command: o.command || "",
          args: o.args || [],
          env: P,
          cwd: o.cwd || "",
          headers: o.headers || {}
        }
      }), u.success(`MCP「${o.name}」已添加到当前专家`), De((ce) => new Set(ce).add(R));
    } catch (R) {
      u.error(R.message || `添加 MCP「${o.name}」失败`);
    } finally {
      Me((R) => ({ ...R, [o.id]: !1 }));
    }
  }, wa = async () => {
    if (!ke) return;
    const o = [];
    for (const [R, ce] of Object.entries(Y))
      if (!ce || !ce.trim()) {
        const Ee = An[R];
        o.push((Ee == null ? void 0 : Ee.label) || R);
      }
    if (o.length > 0) {
      u.warning(`请填写以下配置项: ${o.join(", ")}`);
      return;
    }
    const P = ke;
    $e(null), _e({}), await hn(P, { ...Y });
  }, Pt = n(() => {
    let o = Qt;
    if (qe && (o = o.filter((P) => P.category === qe)), ve.trim()) {
      const P = ve.toLowerCase();
      o = o.filter(
        (R) => R.name.toLowerCase().includes(P) || R.description.toLowerCase().includes(P) || R.tags.some((ce) => ce.toLowerCase().includes(P))
      );
    }
    return o.map(lr);
  }, [Qt, ve, qe]), xa = e.createElement(
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
        prefix: W ? e.createElement(W) : void 0,
        value: ve,
        onChange: (o) => Ae(o.target.value),
        allowClear: !0,
        style: { maxWidth: 300 }
      }),
      e.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        e.createElement(
          d,
          { type: "secondary", style: { fontSize: 12, whiteSpace: "nowrap" } },
          "安装到："
        ),
        e.createElement(I, {
          value: Le,
          onChange: (o) => Ue(o),
          style: { minWidth: 180 },
          size: "small",
          options: N.map((o) => ({ value: o.id, label: o.name }))
        })
      ),
      // Configure MCP source button
      e.createElement(
        m,
        {
          icon: k ? e.createElement(k) : void 0,
          onClick: () => Xt(!0),
          size: "small"
        },
        "配置 MCP 源"
      )
    ),
    // Dynamic category tag row (from OSS manifest tag_groups)
    en.length > 0 ? e.createElement(
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
        d,
        { type: "secondary", style: { fontSize: 12, marginRight: 4 } },
        "分类:"
      ),
      e.createElement(
        T,
        {
          style: { fontSize: 11, cursor: "pointer", borderRadius: 12 },
          color: qe === "" ? "blue" : void 0,
          onClick: () => ln("")
        },
        "全部"
      ),
      ...en.map(
        (o) => e.createElement(
          T,
          {
            key: o.id,
            style: { fontSize: 11, cursor: "pointer", borderRadius: 12 },
            color: qe === o.id ? "geekblue" : void 0,
            onClick: () => ln(
              qe === o.id ? "" : o.id
            )
          },
          o.label
        )
      )
    ) : null,
    // MCP server cards (dynamic from OSS)
    nn && Pt.length === 0 ? e.createElement(
      "div",
      { style: { textAlign: "center", padding: 40 } },
      e.createElement(s, { size: "large" }, e.createElement("div", { style: { minHeight: 60, display: "flex", alignItems: "center", justifyContent: "center" } }, "正在加载 MCP 服务器..."))
    ) : Pt.length === 0 ? e.createElement(c, {
      description: "未找到匹配的 MCP 服务器",
      image: c.PRESENTED_IMAGE_SIMPLE
    }) : e.createElement(
      E,
      { gutter: [12, 12] },
      ...Pt.map(
        (o) => e.createElement(
          y,
          { key: o.id, xs: 24, sm: 12, md: 8 },
          e.createElement(
            b,
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
                o.iconUrl ? e.createElement("img", {
                  src: o.iconUrl,
                  alt: o.name,
                  style: { width: 28, height: 28, objectFit: "contain" },
                  onError: (P) => {
                    P.target.style.display = "none";
                  }
                }) : o.emoji
              ),
              e.createElement(
                "div",
                { style: { flex: 1 } },
                e.createElement(
                  d,
                  { strong: !0, style: { fontSize: 14 } },
                  o.name
                ),
                e.createElement(
                  "div",
                  { style: { display: "flex", gap: 4, marginTop: 4, flexWrap: "wrap" } },
                  e.createElement(
                    T,
                    { color: "blue", style: { fontSize: 10 } },
                    o.category
                  ),
                  e.createElement(
                    T,
                    {
                      color: o.transport === "stdio" ? "purple" : "cyan",
                      style: { fontSize: 10 }
                    },
                    o.transport
                  ),
                  o.env && Object.keys(o.env).length > 0 ? e.createElement(
                    T,
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
              o.description
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
                d,
                { type: "secondary", style: { fontSize: 11 } },
                o.transport === "stdio" ? `${o.command} ${(o.args || []).join(" ")}` : o.url || ""
              ),
              Ne.has(o.id) ? e.createElement(
                m,
                { size: "small", disabled: !0 },
                "已安装"
              ) : e.createElement(
                m,
                {
                  type: "primary",
                  size: "small",
                  loading: !!Te[o.id],
                  icon: k ? e.createElement(k) : void 0,
                  onClick: () => Sa(o)
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
          border: "1px dashed #d9d9d9",
          borderRadius: 8,
          background: "#fafafa"
        }
      },
      f ? e.createElement(f, {
        style: { fontSize: 24, color: "#bfbfbf", marginBottom: 8 }
      }) : null,
      e.createElement(
        d,
        { type: "secondary", style: { fontSize: 12 } },
        "MCP 服务器列表来自 UGSci 官方源，自动同步更新"
      )
    )
  ), ka = ke ? e.createElement(
    J,
    {
      title: e.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 8 } },
        e.createElement("span", { style: { fontSize: 20, display: "inline-flex", alignItems: "center", justifyContent: "center", width: 24, height: 24 } }, ke.iconUrl ? e.createElement("img", { src: ke.iconUrl, alt: ke.name, style: { width: 22, height: 22, objectFit: "contain" }, onError: (o) => {
          o.target.style.display = "none";
        } }) : ke.emoji),
        e.createElement("span", null, `配置 ${ke.name} 密钥`)
      ),
      open: !!ke,
      onCancel: () => {
        $e(null), _e({});
      },
      onOk: wa,
      okText: "安装",
      cancelText: "取消",
      width: 520,
      destroyOnClose: !0
    },
    // Description
    e.createElement(
      d,
      { type: "secondary", style: { display: "block", marginBottom: 16, fontSize: 12 } },
      ke.description
    ),
    ...Object.entries(ke.env || {}).map(([o]) => {
      const P = An[o], R = (P == null ? void 0 : P.isSecret) !== !1;
      return e.createElement(
        "div",
        { key: o, style: { marginBottom: 16 } },
        e.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 6, marginBottom: 4 } },
          e.createElement(
            d,
            { strong: !0, style: { fontSize: 13 } },
            (P == null ? void 0 : P.label) || o
          ),
          e.createElement(
            T,
            { color: "orange", style: { fontSize: 10 } },
            "必填"
          )
        ),
        // Help text with optional link
        P ? e.createElement(
          "div",
          { style: { marginBottom: 6, fontSize: 12, color: "#8c8c8c" } },
          P.help,
          P.link ? e.createElement(
            "a",
            {
              href: P.link,
              target: "_blank",
              rel: "noopener noreferrer",
              style: { marginLeft: 4, fontSize: 12 }
            },
            "获取方式 ↗"
          ) : null
        ) : null,
        // Input field
        R ? e.createElement(i.Password, {
          placeholder: `请输入 ${(P == null ? void 0 : P.label) || o}`,
          value: Y[o] || "",
          onChange: (ce) => _e((Ee) => ({
            ...Ee,
            [o]: ce.target.value
          })),
          style: { width: "100%" }
        }) : e.createElement(i, {
          placeholder: `请输入 ${(P == null ? void 0 : P.label) || o}`,
          value: Y[o] || "",
          onChange: (ce) => _e((Ee) => ({
            ...Ee,
            [o]: ce.target.value
          })),
          style: { width: "100%" }
        }),
        // Show env key name for reference
        e.createElement(
          d,
          { type: "secondary", style: { fontSize: 11, display: "block", marginTop: 2 } },
          `环境变量名: ${o}`
        )
      );
    })
  ) : null, Ca = e.createElement(
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
        prefix: W ? e.createElement(W) : void 0,
        value: oe,
        onChange: (o) => fe(o.target.value),
        allowClear: !0,
        style: { maxWidth: 400, flex: 1, minWidth: 200 }
      }),
      e.createElement(
        m,
        {
          icon: h ? e.createElement(h) : void 0,
          onClick: () => Yt(!0),
          size: "small"
        },
        "配置专家源"
      )
    ),
    // Dynamic category tag row (from OSS manifest tag_groups)
    on.length > 0 ? e.createElement(
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
        d,
        { type: "secondary", style: { fontSize: 12, marginRight: 4 } },
        "分类:"
      ),
      e.createElement(
        T,
        {
          style: { fontSize: 11, cursor: "pointer", borderRadius: 12 },
          color: Xe === "" ? "blue" : void 0,
          onClick: () => un("")
        },
        "全部"
      ),
      ...on.map(
        (o) => e.createElement(
          T,
          {
            key: o.id,
            style: { fontSize: 11, cursor: "pointer", borderRadius: 12 },
            color: Xe === o.id ? "geekblue" : void 0,
            onClick: () => un(
              Xe === o.id ? "" : o.id
            )
          },
          o.label
        )
      )
    ) : null,
    // Agent cards (dynamic from OSS)
    dn && At.length === 0 ? e.createElement(
      "div",
      { style: { textAlign: "center", padding: 40 } },
      e.createElement(s, { size: "large" }, e.createElement("div", { style: { minHeight: 60, display: "flex", alignItems: "center", justifyContent: "center" } }, "正在加载人才市场..."))
    ) : At.length === 0 ? e.createElement(c, {
      description: "未找到匹配的人才",
      image: c.PRESENTED_IMAGE_SIMPLE
    }) : e.createElement(
      E,
      { gutter: [12, 12] },
      ...At.map(
        (o) => e.createElement(
          y,
          { key: o.id, xs: 24, sm: 12, md: 8 },
          e.createElement(
            b,
            {
              hoverable: !0,
              size: "small",
              style: { height: "100%", cursor: "pointer" },
              onClick: () => dt(o)
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
              e.createElement(Be, {
                name: o.name,
                size: 40
              }),
              e.createElement(
                "div",
                { style: { flex: 1 } },
                e.createElement(
                  d,
                  { strong: !0, style: { fontSize: 14 } },
                  o.name
                ),
                e.createElement(
                  "div",
                  { style: { display: "flex", gap: 4, marginTop: 4, flexWrap: "wrap" } },
                  o.category ? e.createElement(
                    T,
                    { color: "blue", style: { fontSize: 10 } },
                    Qe(o.category)
                  ) : null,
                  o.tags.includes("mcp") ? e.createElement(
                    T,
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
              o.description
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
                d,
                { type: "secondary", style: { fontSize: 11 } },
                o.tags.filter((P) => P !== "agent" && P !== "template" && P !== "workspace").slice(0, 3).join(" · ") || "人才模板"
              ),
              e.createElement(
                m,
                {
                  type: "primary",
                  size: "small",
                  icon: D ? e.createElement(D) : void 0
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
          border: "1px dashed #d9d9d9",
          borderRadius: 8,
          background: "#fafafa"
        }
      },
      f ? e.createElement(f, {
        style: { fontSize: 24, color: "#bfbfbf", marginBottom: 8 }
      }) : null,
      e.createElement(
        d,
        { type: "secondary", style: { fontSize: 12 } },
        "人才市场来自 UGSci 官方源，自动同步更新"
      )
    )
  ), Ta = [
    {
      key: "skills",
      label: e.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        w ? e.createElement(w, { style: { fontSize: 14 } }) : null,
        "技能市场"
      ),
      children: va
    },
    {
      key: "mcp",
      label: e.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        k ? e.createElement(k, { style: { fontSize: 14 } }) : null,
        "MCP 市场"
      ),
      children: xa
    },
    {
      key: "experts",
      label: e.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        D ? e.createElement(D, { style: { fontSize: 14 } }) : null,
        "人才市场"
      ),
      children: Ca
    }
  ];
  return e.createElement(
    "div",
    { style: { padding: 24 } },
    e.createElement(wt, {
      title: "市场",
      subtitle: "浏览技能市场 · 选择 MCP 服务器 · 人才市场 · 随时更新能力和专家",
      extra: e.createElement(
        "div",
        { style: { display: "flex", gap: 8 } },
        e.createElement(
          m,
          {
            type: "primary",
            icon: z ? e.createElement(z) : void 0,
            onClick: () => {
              ut(le, ne, {}), mt(), It();
            },
            loading: be || Fe || nn || dn
          },
          "刷新"
        )
      )
    }),
    e.createElement(G, {
      items: Ta,
      activeKey: v,
      onChange: (o) => B(o)
    }),
    // Skill source config modal
    e.createElement(yr, {
      open: da,
      onClose: () => Kt(!1),
      sources: ze,
      onChange: (o) => {
        Oe(o), mt(o);
      }
    }),
    // MCP source config modal
    e.createElement($n, {
      open: ua,
      onClose: () => Xt(!1),
      sources: ma,
      onChange: (o) => qt(o),
      type: "mcp"
    }),
    // MCP token config modal (for templates requiring secrets)
    ka,
    // Expert source config modal
    e.createElement($n, {
      open: ga,
      onClose: () => Yt(!1),
      sources: pa,
      onChange: (o) => Vt(o),
      type: "expert"
    }),
    // ── Agent Detail Modal (click card to view details, then create) ──
    Re ? e.createElement(
      J,
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
          e.createElement(Be, {
            name: Re.name,
            size: 40
          }),
          e.createElement(
            "div",
            null,
            e.createElement(
              d,
              { strong: !0, style: { fontSize: 16 } },
              Re.name
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
              Re.category ? e.createElement(
                T,
                { color: "blue", style: { fontSize: 10 } },
                Qe(Re.category)
              ) : null,
              ...Re.tags.filter(
                (o) => o !== "agent" && o !== "template" && o !== "workspace"
              ).slice(0, 5).map(
                (o) => e.createElement(
                  T,
                  { key: o, style: { fontSize: 10 } },
                  o
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
            m,
            {
              onClick: () => dt(null),
              style: { marginRight: 8 }
            },
            "取消"
          ),
          e.createElement(
            m,
            {
              type: "primary",
              loading: _t,
              disabled: _t,
              icon: D ? e.createElement(D) : void 0,
              style: Pe,
              onClick: async () => {
                await ba(Re), dt(null);
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
          d,
          { strong: !0, style: { display: "block", marginBottom: 6 } },
          "简介"
        ),
        e.createElement(
          ee,
          {
            type: "secondary",
            style: { fontSize: 13, lineHeight: 1.7, margin: 0 }
          },
          Re.description
        )
      ),
      // Skills manifest hint
      Re.skills_manifest ? e.createElement(
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
          d,
          { style: { fontSize: 12, color: "#52c41a" } },
          "✓ 包含技能清单，创建后将自动安装推荐技能"
        )
      ) : null,
      // Instructions hint
      Re.instructions ? e.createElement(
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
          d,
          { style: { fontSize: 12, color: "#1677ff" } },
          "✓ 包含系统提示词，创建后将自动写入 AGENTS.md"
        )
      ) : null,
      // Drivers
      Re.drivers && Object.keys(Re.drivers).length > 0 ? e.createElement(
        "div",
        null,
        e.createElement(
          d,
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
          ...Object.entries(Re.drivers).map(
            ([o, P]) => e.createElement(
              T,
              { key: o, color: "cyan", style: { fontSize: 11 } },
              `${o}${P && P.length > 0 ? ` (${P.join(", ")})` : ""}`
            )
          )
        )
      ) : null
    ) : null
  );
}
function Sr() {
  try {
    const t = localStorage.getItem("language") || "";
    if (t) return t.split("-")[0];
  } catch {
  }
  return ((typeof navigator < "u" ? navigator.language : "") || "").split("-")[0] || "en";
}
const Mn = {
  zh: "您好，UGSci 智能助手在线。无论是油气藏分析、数值模拟还是工程决策，描述您的场景，我来交付结果。",
  en: "UGSci AI assistant is online. From reservoir analysis to numerical simulation and engineering decisions — describe your scenario and I'll deliver results.",
  ja: "UGSci AIアシスタントがオンラインです。油層解析、数値シミュレーション、エンジニアリングの意思決定など、シナリオを描写してください。結果をお届けします。",
  ru: "UGSci AI-ассистент онлайн. От анализа пласта до численного моделирования и инженерных решений — опишите свой сценарий, и я предоставлю результат.",
  vi: "Trợ lý AI UGSci đang trực tuyến. Từ phân tích mỏ, mô phỏng số đến ra quyết định kỹ thuật — mô tả kịch bản của bạn, tôi sẽ giao kết quả.",
  id: "Asisten AI UGSci sedang online. Dari analisis reservoir, simulasi numerik hingga keputusan engineering — jelaskan skenario Anda, saya akan memberikan hasilnya."
}, Ln = {
  zh: { label: "能告诉我你都能做点什么吗？", value: "能告诉我你都能做点什么吗" },
  en: { label: "Can you tell me what you can do?", value: "Can you tell me what you can do?" },
  ja: { label: "あなたができることを教えてください", value: "あなたができることを教えてください" },
  ru: { label: "Расскажи, что ты умеешь делать?", value: "Расскажи, что ты умеешь делать?" },
  vi: { label: "Bạn có thể cho tôi biết bạn làm được gì không?", value: "Bạn có thể cho tôi biết bạn làm được gì không?" },
  id: { label: "Bisa cerita apa saja yang bisa Anda lakukan?", value: "Bisa cerita apa saja yang bisa Anda lakukan?" }
};
function wr() {
  const e = S(), t = e.React, { useEffect: l, useRef: a } = t, n = e.useSelectedAgent ? e.useSelectedAgent() : { id: "default" }, r = (n == null ? void 0 : n.id) || "default", s = a(null), c = a(null);
  return l(() => {
    if (s.current === r) return;
    s.current = r, Bt();
    const i = Sr(), m = Mn[i] || Mn.en, u = Ln[i] || Ln.en;
    let E = !1;
    return (async () => {
      var y, b;
      try {
        const T = await kt(r);
        if (E) return;
        const C = jn(T);
        if (c.current) {
          try {
            c.current();
          } catch {
          }
          c.current = null;
        }
        const x = window.QwenPaw;
        (y = x == null ? void 0 : x.chat) != null && y.welcome && (C.length > 0 ? (c.current = x.chat.welcome.set("ugsci", {
          description: m,
          prompts: C
        }), console.info(
          `[ugsci] Injected ${C.length} welcome prompts for agent "${r}"`
        )) : (c.current = x.chat.welcome.set("ugsci", {
          description: m,
          prompts: [u]
        }), console.info(
          `[ugsci] No skills for agent "${r}" — using default prompt`
        )));
      } catch (T) {
        console.warn(
          `[ugsci] Failed to inject welcome prompts for agent "${r}":`,
          T
        );
        const C = window.QwenPaw;
        if ((b = C == null ? void 0 : C.chat) != null && b.welcome && !E) {
          if (c.current) {
            try {
              c.current();
            } catch {
            }
            c.current = null;
          }
          c.current = C.chat.welcome.set("ugsci", {
            description: m,
            prompts: [u]
          });
        }
      }
    })(), () => {
      E = !0;
    };
  }, [r]), null;
}
function xr() {
  var i, m, u;
  const e = window.QwenPaw;
  if (!(e != null && e.menu) || !(e != null && e.route)) {
    console.warn(
      "[ugsci] QwenPaw.menu/route API not available — plugin disabled"
    );
    return;
  }
  const t = S().React, l = "ugsci";
  (m = (i = e.chat) == null ? void 0 : i.rightHeader) != null && m.add ? (e.chat.rightHeader.add(l, t.createElement(wr), {
    id: "ugsci.welcome-injector",
    order: -1
    // render before other right-header items (invisible anyway)
  }), console.info("[ugsci] WelcomePromptsInjector registered via rightHeader")) : console.warn(
    "[ugsci] QP.chat.rightHeader.add not available — agent-specific welcome prompts disabled"
  );
  const a = S().antdIcons || {}, n = a.UserSwitchOutlined, r = a.ToolOutlined, s = a.ShopOutlined;
  e.route.add(l, {
    id: "ugsci.experts",
    path: "/ugsci-experts",
    component: Bl
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
    component: ta
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
    component: Zl
  }), e.route.add(l, {
    id: "ugsci.skills-center",
    path: "/ugsci-skills",
    component: er
  }), e.route.add(l, {
    id: "ugsci.market",
    path: "/ugsci-market",
    component: br
  }), e.menu.add(l, {
    id: "ugsci.market",
    location: "primary.agentScoped",
    label: () => "市场",
    icon: s ? t.createElement(s, { style: { fontSize: 16 } }) : void 0,
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
  for (const E of c) {
    try {
      const b = e.menu.snapshot("primary.agentScoped").find((T) => T.id === E);
      b && e.menu.replace(l, E, {
        ...b,
        visible: () => !at()
      });
    } catch {
    }
    try {
      const b = e.menu.snapshot("primary.settings").find((T) => T.id === E);
      b && e.menu.replace(l, E, {
        ...b,
        visible: () => !at()
      });
    } catch {
    }
  }
  console.info(
    "[ugsci] Plugin registered: unified Tools & Skills center + compatibility routes, simple-mode navigation active"
  );
}
function Lt() {
  try {
    xr();
  } catch (e) {
    console.error("[ugsci] Failed to build plugin:", e), setTimeout(Lt, 500);
  }
}
var Bn;
if ((Bn = window.QwenPaw) != null && Bn.host)
  Lt();
else {
  const e = setInterval(() => {
    var t;
    (t = window.QwenPaw) != null && t.host && (clearInterval(e), Lt());
  }, 200);
  setTimeout(() => clearInterval(e), 1e4);
}
