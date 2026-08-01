function A() {
  var t;
  const e = (t = window.QwenPaw) == null ? void 0 : t.host;
  if (!e) throw new Error("[ugsci] QwenPaw.host not available");
  return e;
}
function $a() {
  try {
    return A().getApiToken() || "";
  } catch {
    return "";
  }
}
function Ne(e) {
  return A().getApiUrl(e);
}
function Ct(e) {
  const t = $a();
  return {
    "Content-Type": "application/json",
    ...t ? { Authorization: `Bearer ${t}` } : {},
    ...e
  };
}
const ct = /* @__PURE__ */ new Map(), Ma = 15e3;
function Ra(e) {
  return e ? e instanceof Headers ? e.get("X-Agent-Id") || e.get("x-agent-id") || "" : e["X-Agent-Id"] || e["x-agent-id"] || "" : "";
}
function La(e, t, l) {
  return `${e}:${t}:${l}`;
}
function tt() {
  ct.clear();
}
function Tt(e) {
  for (const [t, l] of ct)
    (e ? l.agentId === e : l.agentId) && ct.delete(t);
}
async function oe(e, t) {
  const l = ((t == null ? void 0 : t.method) || "GET").toUpperCase(), { bypassCache: a, ...n } = t || {}, s = Ra(
    n.headers
  ), r = La(l, e, s);
  if (l !== "GET" && (s ? Tt(s) : tt()), l === "GET" && !a) {
    const c = ct.get(r);
    if (c && Date.now() - c.ts < Ma)
      return c.data;
  }
  const o = await fetch(Ne(e), {
    ...n,
    headers: { ...Ct(), ...n.headers || {} }
  });
  if (!o.ok) {
    const c = await o.text().catch(() => "");
    throw new Error(c || `HTTP ${o.status}`);
  }
  if (o.status === 204) return null;
  const m = await o.json();
  return l === "GET" && ct.set(r, {
    data: m,
    ts: Date.now(),
    agentId: s || void 0
  }), m;
}
const Oe = {
  background: "#0072f5",
  color: "#fff",
  fontSize: 13,
  fontWeight: 600,
  border: "none",
  borderRadius: 8
};
function Ve() {
  try {
    return localStorage.getItem("qwenpaw_sidebar_mode") === "simple";
  } catch {
    return !1;
  }
}
function zt(e, t) {
  const l = A();
  return l.ReactMarkdown && l.remarkGfm ? t.createElement(
    l.ReactMarkdown,
    { remarkPlugins: [l.remarkGfm] },
    e
  ) : e.replace(/\*\*(.+?)\*\*/g, "$1").replace(/\*(.+?)\*/g, "$1").replace(/`(.+?)`/g, "$1").replace(/^#+\s*/gm, "").replace(/^[-*]\s+/gm, "• ");
}
function It({
  title: e,
  subtitle: t,
  extra: l
}) {
  const a = A().React, { Space: n } = A().antd;
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
async function Gt() {
  const e = await oe("/agents");
  return (e == null ? void 0 : e.agents) || [];
}
async function Ht(e) {
  return oe(
    `/agents/${encodeURIComponent(e)}`
  );
}
async function Ot(e) {
  return await oe("/skills", {
    headers: { "X-Agent-Id": e }
  }) || [];
}
async function Wt(e = !1) {
  return await oe(`/skills/pool${e ? "?summary=true" : ""}`) || [];
}
async function ja(e) {
  const t = await oe(
    `/skills/pool/${encodeURIComponent(e)}/content`
  );
  return (t == null ? void 0 : t.content) || "";
}
async function Ba() {
  return await oe(
    "/skills/workspaces"
  ) || [];
}
async function Ua(e) {
  return await oe("/mcp", {
    headers: { "X-Agent-Id": e }
  }) || [];
}
async function Na(e, t) {
  return oe(
    `/mcp/toggle/${encodeURIComponent(t)}`,
    {
      method: "PATCH",
      headers: { "X-Agent-Id": e }
    }
  );
}
async function Da(e, t) {
  await oe(`/mcp/${encodeURIComponent(t)}`, {
    method: "DELETE",
    headers: { "X-Agent-Id": e }
  });
}
async function Fa(e, t, l) {
  return oe("/mcp", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify({ client_key: t, client: l })
  });
}
async function Ga(e, t, l) {
  return oe(
    `/mcp/${encodeURIComponent(t)}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json", "X-Agent-Id": e },
      body: JSON.stringify(l)
    }
  );
}
async function Ha(e, t) {
  return await oe(
    `/mcp/tools/${encodeURIComponent(t)}`,
    { headers: { "X-Agent-Id": e } }
  ) || [];
}
async function Wa(e, t) {
  return oe(
    `/mcp/policy/${encodeURIComponent(t)}`,
    { headers: { "X-Agent-Id": e } }
  );
}
async function Ja(e, t, l) {
  return oe(
    `/mcp/policy/${encodeURIComponent(t)}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json", "X-Agent-Id": e },
      body: JSON.stringify(l)
    }
  );
}
async function Xa(e) {
  return await oe(
    "/mcp/access-principals",
    { headers: { "X-Agent-Id": e } }
  ) || [];
}
async function Ka(e, t, l) {
  return oe(
    `/mcp/oauth/start/${encodeURIComponent(t)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Agent-Id": e },
      body: JSON.stringify(l)
    }
  );
}
async function qa(e, t) {
  return oe(`/mcp/oauth/status/${encodeURIComponent(t)}`, {
    headers: { "X-Agent-Id": e }
  });
}
async function Va(e, t) {
  await oe(
    `/mcp/oauth/${encodeURIComponent(t)}`,
    {
      method: "DELETE",
      headers: { "X-Agent-Id": e }
    }
  );
}
function Nn(e) {
  var l;
  const t = [];
  for (const a of e) {
    if (a.enabled === !1) continue;
    const n = (l = a.description) == null ? void 0 : l.trim();
    if (!n) continue;
    const s = (a.name || n).length > 20 ? (a.name || n).substring(0, 18) + "…" : a.name || n;
    let r = n;
    if (r = r.replace(/\*\*(.+?)\*\*/g, "$1").replace(/\*(.+?)\*/g, "$1").replace(/`(.+?)`/g, "$1").replace(/^#+\s*/gm, "").trim(), /^(用于|帮助|提供|支持|实现|完成|分析|计算|生成|创建|检查)/.test(r) ? r = `请${r}` : /^(a |an |the )/i.test(r) ? r = `Help me with ${r}` : /[。？！.?!]$/.test(r) || (r = `帮我${r}`), r.length > 80 && (r = r.substring(0, 77) + "..."), t.push({ label: s, value: r }), t.length >= 4) break;
  }
  return t;
}
async function Ya(e) {
  return await oe("/workspace/files", {
    headers: { "X-Agent-Id": e }
  }) || [];
}
async function xt(e, t, l) {
  return oe(`/workspace/files/${encodeURIComponent(t)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify({ content: l })
  });
}
async function Qa(e, t, l, a) {
  return oe("/workspace/prompt-files", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify({ filename: t, content: l, enable: a })
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
  const l = t.split(".", 1)[0].toUpperCase();
  if (!t.slice(0, -3)) throw new Error("文件名不能为空");
  if (Za.has(l))
    throw new Error("该文件名是系统保留名称，请更换");
  if (new TextEncoder().encode(t).length > 255)
    throw new Error("文件名过长");
  return t;
}
async function tl(e, t) {
  const l = await Ht(e);
  l.system_prompt_files = t, await oe(`/agents/${encodeURIComponent(e)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(l)
  });
}
async function Jt(e, t) {
  await oe("/skills/pool/download", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      skill_name: t,
      targets: [{ workspace_id: e }],
      overwrite: !1
    })
  });
}
async function Dn(e, t) {
  await oe(`/skills/${encodeURIComponent(t)}/enable`, {
    method: "POST",
    headers: { "X-Agent-Id": e }
  });
}
async function Xt(e, t) {
  await oe(`/skills/${encodeURIComponent(t)}`, {
    method: "DELETE",
    headers: { "X-Agent-Id": e }
  });
}
async function nl(e, t) {
  return oe("/skills/batch-enable", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify(t)
  });
}
async function al(e, t) {
  return oe("/skills/batch-disable", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify(t)
  });
}
async function ll(e, t) {
  return oe("/skills/batch-delete", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify(t)
  });
}
async function Kt(e) {
  return await oe("/mcp", {
    headers: { "X-Agent-Id": e }
  }) || [];
}
async function Fn(e, t) {
  await oe(`/mcp/${encodeURIComponent(t)}`, {
    method: "DELETE",
    headers: { "X-Agent-Id": e }
  });
}
async function Gn(e, t) {
  return oe("/mcp", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify(t)
  });
}
async function sl(e, t) {
  return oe(
    `/mcp/toggle/${encodeURIComponent(t)}`,
    {
      method: "PATCH",
      headers: { "X-Agent-Id": e }
    }
  );
}
async function Hn(e, t) {
  await oe(`/skills/${encodeURIComponent(t)}/disable`, {
    method: "POST",
    headers: { "X-Agent-Id": e }
  });
}
async function ol(e) {
  await oe(`/skills/pool/${encodeURIComponent(e)}`, {
    method: "DELETE"
  });
}
function rl(e) {
  const t = (e || "").trim();
  if (!t) return { number: 6, unit: "h" };
  const l = t.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/i);
  if (!l) return { number: 6, unit: "h" };
  const a = parseInt(l[1] || "0", 10), n = parseInt(l[2] || "0", 10), s = parseInt(l[3] || "0", 10), r = a * 60 + n + Math.round(s / 60);
  return r <= 0 ? { number: 6, unit: "h" } : r >= 60 && r % 60 === 0 ? { number: r / 60, unit: "h" } : { number: r, unit: "m" };
}
function il(e) {
  return e.unit === "h" ? `${e.number}h` : `${e.number}m`;
}
async function cl(e) {
  return oe("/config/heartbeat", {
    headers: { "X-Agent-Id": e }
  });
}
async function ml(e, t) {
  return oe("/config/heartbeat", {
    method: "PUT",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify(t)
  });
}
async function dl(e) {
  await oe("/config/heartbeat/run", {
    method: "POST",
    headers: { "X-Agent-Id": e }
  });
}
async function ul(e) {
  return oe("/workspace/running-config", {
    headers: { "X-Agent-Id": e }
  });
}
async function pl(e, t) {
  return oe("/workspace/running-config", {
    method: "PUT",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify(t)
  });
}
async function gl(e) {
  return (await oe("/workspace/language", {
    headers: { "X-Agent-Id": e }
  })).language || "zh";
}
async function fl(e, t) {
  await oe("/workspace/language", {
    method: "PUT",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify({ language: t })
  });
}
async function yl() {
  return (await oe("/config/user-timezone")).timezone || "UTC";
}
async function El(e) {
  await oe("/config/user-timezone", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ timezone: e })
  });
}
async function hl(e) {
  return await oe("/workspace/system-prompt-files", {
    headers: { "X-Agent-Id": e }
  }) || [];
}
const kn = ["AGENTS.md", "SOUL.md", "PROFILE.md"];
function _n({
  items: e,
  max: t = 5,
  color: l = "blue",
  emptyText: a = "无"
}) {
  const n = A().React, { Tag: s } = A().antd;
  return !e || e.length === 0 ? n.createElement(
    "span",
    { style: { fontSize: 12, color: "#bfbfbf" } },
    a
  ) : n.createElement(
    "div",
    { style: { display: "flex", flexWrap: "wrap", gap: 4 } },
    ...e.slice(0, t).map(
      (r, o) => n.createElement(
        s,
        { key: o, color: l, style: { fontSize: 11, marginRight: 0 } },
        r
      )
    ),
    e.length > t ? n.createElement(
      s,
      { style: { fontSize: 11, marginRight: 0 } },
      `+${e.length - t}`
    ) : null
  );
}
function Wn({
  open: e,
  onClose: t,
  poolSkills: l,
  installedSkillNames: a,
  loading: n,
  onInstall: s
}) {
  const r = A().React, { useState: o, useEffect: m, useMemo: c } = r, { Modal: g, Button: C, Empty: w, Spin: v, Input: b, Tag: y, Tooltip: x, Typography: j } = A().antd, { CheckOutlined: B, SearchOutlined: U } = A().antdIcons || {}, { Text: Z } = j, [W, X] = o([]), [M, T] = o("");
  m(() => {
    e && (X([]), T(""));
  }, [e]);
  const _ = c(() => {
    if (!M.trim()) return l;
    const E = M.toLowerCase();
    return l.filter(
      (p) => {
        var R, q;
        return p.name.toLowerCase().includes(E) || ((R = p.description) == null ? void 0 : R.toLowerCase().includes(E)) || ((q = p.tags) == null ? void 0 : q.some((H) => H.toLowerCase().includes(E)));
      }
    );
  }, [l, M]), F = _.filter(
    (E) => !a.includes(E.name)
  ), G = (E) => {
    X(
      (p) => p.includes(E) ? p.filter((R) => R !== E) : [...p, E]
    );
  }, P = async () => {
    W.length !== 0 && (await s(W), X([]));
  };
  return r.createElement(
    g,
    {
      open: e,
      onCancel: t,
      title: "从技能池选择技能",
      width: 680,
      footer: r.createElement(
        "div",
        {
          style: {
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }
        },
        r.createElement(
          Z,
          { type: "secondary", style: { fontSize: 13 } },
          `已选择 ${W.length} 个技能`
        ),
        r.createElement(
          "div",
          { style: { display: "flex", gap: 8 } },
          r.createElement(C, { onClick: t }, "取消"),
          r.createElement(
            C,
            {
              type: "primary",
              onClick: P,
              disabled: W.length === 0
            },
            W.length > 0 ? `添加 (${W.length})` : "添加"
          )
        )
      )
    },
    // Search + bulk actions bar
    r.createElement(
      "div",
      {
        style: {
          marginBottom: 12,
          display: "flex",
          gap: 8,
          alignItems: "center"
        }
      },
      r.createElement(b, {
        placeholder: "搜索技能名称、描述或标签...",
        prefix: U ? r.createElement(U) : void 0,
        value: M,
        onChange: (E) => T(E.target.value),
        allowClear: !0,
        style: { flex: 1 }
      }),
      r.createElement(
        C,
        {
          size: "small",
          type: "primary",
          onClick: () => X(F.map((E) => E.name))
        },
        "全选"
      ),
      r.createElement(
        C,
        {
          size: "small",
          onClick: () => X([])
        },
        "清空"
      )
    ),
    // Skill grid (card style matching Skill Center)
    n ? r.createElement(
      "div",
      { style: { textAlign: "center", padding: 40 } },
      r.createElement(v, { size: "large" })
    ) : _.length === 0 ? r.createElement(w, {
      description: M ? "未找到匹配的技能" : "技能池暂无可用技能",
      image: w.PRESENTED_IMAGE_SIMPLE
    }) : r.createElement(
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
      ..._.map((E) => {
        const p = W.includes(E.name), R = a.includes(E.name);
        return r.createElement(
          "div",
          {
            key: E.name,
            onClick: () => !R && G(E.name),
            style: {
              position: "relative",
              padding: "10px 12px",
              border: `1px solid ${p ? "#0072f5" : "#e8e8e8"}`,
              borderRadius: 6,
              cursor: R ? "not-allowed" : "pointer",
              transition: "all 0.15s ease",
              background: p ? "rgba(0, 114, 245, 0.06)" : R ? "#fafafa" : "#fff",
              opacity: R ? 0.5 : 1,
              minHeight: 64
            }
          },
          p ? r.createElement(
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
            B ? r.createElement(B) : "✓"
          ) : null,
          R ? r.createElement(
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
          r.createElement(
            "div",
            {
              style: {
                display: "flex",
                alignItems: "center",
                gap: 6,
                marginBottom: 4,
                paddingRight: R || p ? 24 : 0
              }
            },
            r.createElement(
              "span",
              { style: { fontSize: 16 } },
              E.emoji || "⚡"
            ),
            r.createElement(
              x,
              { title: E.name },
              r.createElement(
                Z,
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
          E.description ? r.createElement(
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
            E.description
          ) : null,
          E.tags && E.tags.length > 0 ? r.createElement(
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
              (q, H) => r.createElement(
                y,
                {
                  key: H,
                  color: "cyan",
                  style: { fontSize: 10, marginRight: 0 }
                },
                q
              )
            )
          ) : null
        );
      })
    )
  );
}
function Jn({
  agentId: e,
  systemPromptFiles: t,
  onRefresh: l
}) {
  const a = A().React, { useState: n, useEffect: s, useCallback: r, useRef: o } = a, {
    List: m,
    Tag: c,
    Switch: g,
    Button: C,
    Modal: w,
    Input: v,
    Spin: b,
    Empty: y,
    message: x,
    Typography: j,
    Segmented: B,
    Alert: U
  } = A().antd, { FileTextOutlined: Z, PlusOutlined: W, EditOutlined: X, ReloadOutlined: M } = A().antdIcons || {}, { Text: T } = j, [_, F] = n([]), [G, P] = n(!0), [E, p] = n(
    t || []
  ), [R, q] = n(!1), [H, ie] = n(null), [z, f] = n(""), [d, I] = n(""), [ae, $] = n(!1), [K, le] = n("source"), J = o(0), Y = r(async () => {
    const Q = ++J.current;
    P(!0);
    try {
      const h = await Ya(e);
      Q === J.current && F(h);
    } catch (h) {
      Q === J.current && (x.error(h.message || "加载工作区文档失败"), F([]));
    } finally {
      Q === J.current && P(!1);
    }
  }, [e]);
  s(() => {
    Y();
  }, [Y]), s(() => {
    p(t || []);
  }, [t]);
  const ue = async (Q, h) => {
    const me = new Set(E);
    if (h)
      me.add(Q);
    else {
      if (kn.includes(Q) && Q === "AGENTS.md") {
        x.warning("AGENTS.md 是核心文件，不能停用");
        return;
      }
      me.delete(Q);
    }
    const u = Array.from(me);
    p(u);
    try {
      await tl(e, u), x.success(h ? "已启用记忆文件" : "已停用记忆文件"), l();
    } catch (ce) {
      x.error(ce.message || "更新失败"), p(t || []);
    }
  }, k = async (Q) => {
    try {
      const h = await oe(
        `/workspace/files/${encodeURIComponent(Q)}`,
        { headers: { "X-Agent-Id": e } }
      );
      ie(Q), f(h.content || ""), le("source"), q(!0);
    } catch (h) {
      x.error(h.message || "读取文件失败");
    }
  }, te = () => {
    ie(null), f(""), I(""), le("source"), q(!0);
  }, D = async () => {
    let Q;
    try {
      Q = el(H || d);
    } catch (h) {
      x.warning(h.message || "文件名无效");
      return;
    }
    if (!z.trim()) {
      x.warning("Markdown 文档不能为空");
      return;
    }
    if (new TextEncoder().encode(z).length > 1024 * 1024) {
      x.warning("Markdown 文档不能超过 1 MB");
      return;
    }
    $(!0);
    try {
      if (H)
        await xt(e, Q, z);
      else {
        const h = await Qa(
          e,
          Q,
          z,
          !0
        );
        p(h.system_prompt_files);
      }
      x.success("保存成功"), q(!1), Y(), l();
    } catch (h) {
      const me = h != null && h.message ? `：${h.message}` : "";
      x.error(
        H ? (h == null ? void 0 : h.message) || "保存失败" : `创建并挂载失败，服务端已回滚文件${me}`
      );
    } finally {
      $(!1);
    }
  };
  return G ? a.createElement(
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
      a.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        Z ? a.createElement(Z, {
          style: { fontSize: 14, color: "#1677ff" }
        }) : null,
        a.createElement(
          T,
          { strong: !0 },
          `工作区文档 (${_.length})`
        ),
        a.createElement(
          T,
          { type: "secondary", style: { fontSize: 12 } },
          `· ${E.length} 个已挂载到系统提示`
        )
      ),
      a.createElement(
        "div",
        { style: { display: "flex", gap: 8 } },
        a.createElement(
          C,
          {
            size: "small",
            icon: M ? a.createElement(M) : void 0,
            onClick: Y
          },
          "刷新"
        ),
        a.createElement(
          C,
          {
            type: "primary",
            size: "small",
            icon: W ? a.createElement(W) : void 0,
            onClick: te
          },
          "新建 Markdown 文档"
        )
      )
    ),
    _.length === 0 ? a.createElement(y, {
      description: "暂无 Markdown 文档，点击「新建 Markdown 文档」添加",
      image: y.PRESENTED_IMAGE_SIMPLE
    }) : a.createElement(m, {
      dataSource: _,
      renderItem: (Q) => {
        const h = E.includes(Q.filename), me = kn.includes(Q.filename);
        return a.createElement(
          m.Item,
          {
            actions: [
              a.createElement(
                C,
                {
                  type: "link",
                  size: "small",
                  icon: X ? a.createElement(X) : void 0,
                  onClick: () => k(Q.filename)
                },
                "编辑"
              )
            ]
          },
          a.createElement(m.Item.Meta, {
            avatar: a.createElement(Z, {
              style: {
                fontSize: 20,
                color: h ? "#1677ff" : "#bfbfbf"
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
              a.createElement(T, null, Q.filename),
              me ? a.createElement(
                c,
                { color: "default", style: { fontSize: 10 } },
                "内置"
              ) : a.createElement(
                c,
                { color: "cyan", style: { fontSize: 10 } },
                "工作文档"
              )
            ),
            description: a.createElement(
              "div",
              { style: { fontSize: 12 } },
              `${(Q.size / 1024).toFixed(1)} KB · 修改于 ${new Date(Q.modified_time).toLocaleString()}`
            )
          }),
          a.createElement(g, {
            checked: h,
            size: "small",
            onChange: (u) => ue(Q.filename, u)
          })
        );
      }
    }),
    // Edit/New file modal
    a.createElement(
      w,
      {
        open: R,
        onCancel: () => q(!1),
        title: H ? `编辑 ${H}` : "新建 Markdown 文档",
        width: 700,
        onOk: D,
        confirmLoading: ae,
        okText: "保存"
      },
      H ? null : a.createElement(
        "div",
        { style: { marginBottom: 12 } },
        a.createElement(v, {
          placeholder: "文件名（如：油藏工程记忆库.md）",
          value: d,
          onChange: (Q) => I(Q.target.value),
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
        a.createElement(B, {
          size: "small",
          value: K,
          options: [
            { label: "源码", value: "source" },
            { label: "预览", value: "preview" }
          ],
          onChange: (Q) => le(Q)
        }),
        a.createElement(
          T,
          { type: "secondary", style: { fontSize: 12 } },
          `${z.length} 字符 · 约 ${Math.ceil(z.length / 4)} tokens · ${H && E.includes(H) ? "已挂载" : H ? "未挂载" : "保存后自动挂载"}`
        )
      ),
      z.trim() ? null : a.createElement(U, {
        type: "warning",
        showIcon: !0,
        message: "文档内容为空，保存前需要填写 Markdown 内容",
        style: { marginBottom: 10 }
      }),
      K === "source" ? a.createElement(v.TextArea, {
        value: z,
        onChange: (Q) => f(Q.target.value),
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
        zt(z, a)
      )
    )
  );
}
function vl({
  skills: e,
  agentId: t
}) {
  const l = A().React, { useMemo: a } = l, {
    List: n,
    Tag: s,
    Typography: r,
    Empty: o,
    Button: m,
    message: c
  } = A().antd, { ThunderboltOutlined: g, CopyOutlined: C } = A().antdIcons || {}, { Text: w } = r, v = a(() => Nn(e), [e]), b = (x) => {
    try {
      const j = A();
      j.setSelectedAgent && j.setSelectedAgent(t);
    } catch {
    }
    try {
      sessionStorage.setItem("ugsci_pending_prompt", x.value);
    } catch {
    }
    window.history.pushState({}, "", "/chat"), window.dispatchEvent(new PopStateEvent("popstate"));
  }, y = (x) => {
    var j;
    (j = navigator.clipboard) == null || j.writeText(x.value).then(() => {
      c.success("已复制到剪贴板");
    });
  };
  return v.length === 0 ? l.createElement(o, {
    description: "暂无推荐提问，请先为专家添加技能",
    image: o.PRESENTED_IMAGE_SIMPLE
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
      g ? l.createElement(g, {
        style: { fontSize: 14, color: "#1677ff" }
      }) : null,
      l.createElement(
        w,
        { strong: !0 },
        `推荐提问 (${v.length})`
      ),
      l.createElement(
        w,
        { type: "secondary", style: { fontSize: 12 } },
        "· 从技能描述中自动提取"
      )
    ),
    l.createElement(n, {
      dataSource: v,
      renderItem: (x, j) => l.createElement(
        n.Item,
        {
          actions: [
            l.createElement(
              m,
              {
                type: "link",
                size: "small",
                icon: C ? l.createElement(C) : void 0,
                onClick: () => y(x)
              },
              "复制"
            )
          ]
        },
        l.createElement(n.Item.Meta, {
          avatar: l.createElement(
            s,
            { color: "blue", style: { borderRadius: "50%" } },
            `${j + 1}`
          ),
          title: l.createElement(
            "div",
            {
              style: {
                cursor: "pointer",
                color: "#1677ff"
              },
              onClick: () => b(x)
            },
            x.value
          ),
          description: l.createElement(
            w,
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
}, Xn = { marginBottom: 16 }, Kn = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "0 16px",
  marginBottom: 16
}, Ue = {
  fontSize: 13,
  fontWeight: 600,
  color: "rgba(0,0,0,0.85)",
  marginBottom: 12,
  paddingBottom: 8,
  borderBottom: "1px solid #f0f0f0"
}, qn = {
  fontSize: 12,
  color: "rgba(0,0,0,0.45)",
  marginLeft: 8
};
function bl({ agentId: e }) {
  const t = A().React, { useState: l, useEffect: a, useCallback: n } = t, {
    Switch: s,
    InputNumber: r,
    Select: o,
    Button: m,
    Spin: c,
    Space: g,
    Typography: C,
    message: w
  } = A().antd, { PlayCircleOutlined: v, SaveOutlined: b } = A().antdIcons || {}, { Text: y } = C, [x, j] = l(!0), [B, U] = l(!1), [Z, W] = l(!1), [X, M] = l(!1), [T, _] = l(6), [F, G] = l("h"), [P, E] = l("main"), [p, R] = l(300), [q, H] = l(!1), [ie, z] = l("08:00"), [f, d] = l("22:00"), I = n(async () => {
    var Y, ue;
    j(!0);
    try {
      const k = await cl(e), te = rl(k.every ?? "6h");
      M(k.enabled ?? !1), _(te.number), G(te.unit), E(k.target ?? "main"), R(k.timeoutSeconds ?? 300), H(!!k.activeHours), z(((Y = k.activeHours) == null ? void 0 : Y.start) ?? "08:00"), d(((ue = k.activeHours) == null ? void 0 : ue.end) ?? "22:00");
    } catch (k) {
      w.error(k.message || "加载心跳配置失败");
    } finally {
      j(!1);
    }
  }, [e]);
  a(() => {
    I();
  }, [I]);
  const ae = async () => {
    U(!0);
    try {
      await ml(e, {
        enabled: X,
        every: il({ number: T, unit: F }),
        target: P,
        timeoutSeconds: p,
        activeHours: q && ie && f ? { start: ie, end: f } : void 0
      }), w.success("心跳配置已保存");
    } catch (Y) {
      w.error(Y.message || "保存心跳配置失败");
    } finally {
      U(!1);
    }
  }, $ = async () => {
    W(!0);
    try {
      await dl(e), w.success("已触发心跳检查");
    } catch (Y) {
      w.error(Y.message || "触发心跳失败");
    } finally {
      W(!1);
    }
  };
  if (x)
    return t.createElement(
      "div",
      { style: { textAlign: "center", padding: 40 } },
      t.createElement(c, { size: "large" })
    );
  const K = (Y, ue, k) => t.createElement(
    "div",
    { style: Xn },
    t.createElement("div", { style: Ye }, Y),
    ue,
    k ? t.createElement(
      y,
      { type: "secondary", style: qn },
      k
    ) : null
  ), le = (Y, ue, k, te) => t.createElement(
    "div",
    { style: Kn },
    t.createElement(
      "div",
      null,
      t.createElement("div", { style: Ye }, Y),
      ue
    ),
    t.createElement(
      "div",
      null,
      t.createElement("div", { style: Ye }, k),
      te
    )
  ), { Divider: J } = A().antd;
  return t.createElement(
    "div",
    { style: { paddingBottom: 8 } },
    // ── Section: 基本设置 ──
    t.createElement("div", { style: Ue }, "基本设置"),
    K(
      "启用心跳",
      t.createElement(s, {
        checked: X,
        onChange: (Y) => M(Y)
      }),
      X ? "已启用，专家将定期自检" : "已停用"
    ),
    le(
      "检查频率",
      t.createElement(
        g,
        null,
        t.createElement(r, {
          min: 1,
          value: T,
          onChange: (Y) => _(Y ?? 1),
          style: { width: "100%" }
        }),
        t.createElement(o, {
          value: F,
          onChange: (Y) => G(Y),
          style: { width: 90 },
          options: [
            { value: "m", label: "分钟" },
            { value: "h", label: "小时" }
          ]
        })
      ),
      "心跳目标",
      t.createElement(o, {
        value: P,
        onChange: (Y) => E(Y),
        style: { width: "100%" },
        options: [
          { value: "main", label: "主会话 (main)" },
          { value: "last", label: "最近会话 (last)" },
          { value: "inbox", label: "收件箱 (inbox)" }
        ]
      })
    ),
    K(
      "超时时间 (秒)",
      t.createElement(r, {
        min: 1,
        max: 3600,
        value: p,
        onChange: (Y) => R(Y ?? 300),
        style: { width: 200 }
      })
    ),
    // ── Section: 活跃时段 ──
    t.createElement(J, { style: { margin: "8px 0 16px" } }),
    t.createElement("div", { style: Ue }, "活跃时段"),
    K(
      "启用活跃时段限制",
      t.createElement(s, {
        checked: q,
        onChange: (Y) => H(Y)
      }),
      "仅在指定时段内触发心跳"
    ),
    q ? le(
      "开始时间",
      t.createElement("input", {
        type: "time",
        value: ie,
        onChange: (Y) => z(Y.target.value),
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
        value: f,
        onChange: (Y) => d(Y.target.value),
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
        m,
        {
          type: "primary",
          icon: b ? t.createElement(b) : void 0,
          loading: B,
          onClick: ae,
          style: Oe
        },
        "保存配置"
      ),
      t.createElement(
        m,
        {
          icon: v ? t.createElement(v) : void 0,
          loading: Z,
          onClick: $
        },
        "立即执行"
      )
    )
  );
}
function Sl({
  agentId: e,
  onRefresh: t
}) {
  const l = A().React, { useState: a, useEffect: n, useCallback: s } = l, {
    List: r,
    Tag: o,
    Switch: m,
    Button: c,
    Empty: g,
    Spin: C,
    Typography: w,
    message: v
  } = A().antd, { PlusOutlined: b, ReloadOutlined: y, DeleteOutlined: x } = A().antdIcons || {}, { Text: j, Paragraph: B } = w, [U, Z] = a([]), [W, X] = a(!0), [M, T] = a(!1), [_, F] = a([]), [G, P] = a(!1), E = s(async () => {
    X(!0);
    try {
      const z = await Ot(e);
      Z(z);
    } catch (z) {
      v.error(z.message || "加载技能失败"), Z([]);
    } finally {
      X(!1);
    }
  }, [e]);
  n(() => {
    E();
  }, [E]);
  const p = async () => {
    T(!0), P(!0);
    try {
      const z = await Wt(!0);
      F(z);
    } catch (z) {
      v.error(z.message || "加载技能池失败");
    } finally {
      P(!1);
    }
  }, R = async (z) => {
    let f = 0, d = 0;
    for (const I of z)
      try {
        await Jt(e, I), f++;
      } catch {
        d++;
      }
    f > 0 ? (v.success(
      `成功添加 ${f} 个技能${d > 0 ? `，${d} 个失败` : ""}`
    ), E(), t()) : d > 0 && v.error("添加技能失败"), T(!1);
  }, q = async (z, f) => {
    try {
      f ? await Dn(e, z.name) : await Hn(e, z.name), v.success(f ? "已启用" : "已停用"), E(), t();
    } catch (d) {
      v.error(d.message || "操作失败");
    }
  }, H = async (z) => {
    try {
      await Xt(e, z), v.success(`技能「${z}」已移除`), E(), t();
    } catch (f) {
      v.error(f.message || "移除技能失败");
    }
  };
  if (W)
    return l.createElement(
      "div",
      { style: { textAlign: "center", padding: 40 } },
      l.createElement(C, { size: "large" })
    );
  const ie = U.filter((z) => z.enabled !== !1);
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
        j,
        { strong: !0 },
        `技能列表 (${U.length}，已启用 ${ie.length})`
      ),
      l.createElement(
        "div",
        { style: { display: "flex", gap: 8 } },
        l.createElement(
          c,
          {
            size: "small",
            icon: y ? l.createElement(y) : void 0,
            onClick: () => {
              tt(), E();
            }
          },
          "刷新"
        ),
        l.createElement(
          c,
          {
            type: "primary",
            size: "small",
            icon: b ? l.createElement(b) : void 0,
            onClick: p,
            style: Oe
          },
          "从技能池添加"
        )
      )
    ),
    U.length === 0 ? l.createElement(g, {
      description: "该专家暂无技能",
      image: g.PRESENTED_IMAGE_SIMPLE
    }) : l.createElement(r, {
      dataSource: U,
      renderItem: (z) => l.createElement(
        r.Item,
        {
          actions: [
            l.createElement(m, {
              key: "toggle",
              size: "small",
              checked: z.enabled !== !1,
              onChange: (f) => q(z, f)
            }),
            l.createElement(
              c,
              {
                key: "del",
                type: "link",
                size: "small",
                danger: !0,
                icon: x ? l.createElement(x) : void 0,
                onClick: () => H(z.name)
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
            z.emoji ? l.createElement(
              "span",
              { style: { fontSize: 16 } },
              z.emoji
            ) : null,
            l.createElement(j, { strong: !0 }, z.name),
            z.version_text ? l.createElement(
              o,
              { style: { fontSize: 10 } },
              `v${z.version_text}`
            ) : null
          ),
          z.description ? l.createElement(
            B,
            {
              type: "secondary",
              style: { fontSize: 12, margin: 0 },
              ellipsis: { rows: 2 }
            },
            z.description
          ) : null
        )
      )
    }),
    l.createElement(Wn, {
      open: M,
      onClose: () => T(!1),
      poolSkills: _,
      installedSkillNames: U.map((z) => z.name),
      loading: G,
      onInstall: R
    })
  );
}
function wl({
  agentId: e,
  onRefresh: t,
  isActive: l
}) {
  const a = A().React, { useState: n, useEffect: s, useCallback: r } = a, {
    List: o,
    Tag: m,
    Button: c,
    Empty: g,
    Spin: C,
    Modal: w,
    Input: v,
    Typography: b,
    message: y
  } = A().antd, { PlusOutlined: x, ReloadOutlined: j, DeleteOutlined: B } = A().antdIcons || {}, { Text: U, Paragraph: Z } = b, { TextArea: W } = v, [X, M] = n([]), [T, _] = n(!0), [F, G] = n(!1), [P, E] = n(`{
  "mcpServers": {
    "example-client": {
      "command": "npx",
      "args": ["-y", "@example/mcp-server"],
      "env": {}
    }
  }
}`), [p, R] = n(!1), q = r(async () => {
    _(!0);
    try {
      const f = await Kt(e);
      M(f);
    } catch (f) {
      y.error(f.message || "加载 MCP 失败"), M([]);
    } finally {
      _(!1);
    }
  }, [e]);
  s(() => {
    q();
  }, [q]), s(() => {
    l && q();
  }, [l, q]);
  const H = async (f) => {
    try {
      await sl(e, f), y.success("已切换 MCP 状态"), q(), t();
    } catch (d) {
      y.error(d.message || "切换失败");
    }
  }, ie = async (f) => {
    try {
      await Fn(e, f), y.success(`MCP「${f}」已移除`), q(), t();
    } catch (d) {
      y.error(d.message || "移除 MCP 失败");
    }
  }, z = async () => {
    R(!0);
    try {
      const f = JSON.parse(P), d = f.mcpServers || f, I = Object.entries(d);
      if (I.length === 0) {
        y.warning("未找到 MCP 客户端配置");
        return;
      }
      for (const [ae, $] of I) {
        const K = $, le = K.url ? "streamable_http" : "stdio";
        await Gn(e, {
          client_key: ae,
          client: {
            name: K.name || ae,
            description: K.description || "",
            enabled: !0,
            transport: le,
            url: K.url || "",
            command: K.command || "",
            args: K.args || [],
            env: K.env || {},
            cwd: K.cwd || "",
            headers: K.headers || {}
          }
        });
      }
      y.success("MCP 客户端已创建"), G(!1), q(), t();
    } catch (f) {
      f instanceof SyntaxError ? y.error("JSON 格式错误：" + f.message) : y.error(f.message || "创建 MCP 失败");
    } finally {
      R(!1);
    }
  };
  return T ? a.createElement(
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
      a.createElement(U, { strong: !0 }, `MCP 客户端 (${X.length})`),
      a.createElement(
        "div",
        { style: { display: "flex", gap: 8 } },
        a.createElement(
          c,
          {
            size: "small",
            icon: j ? a.createElement(j) : void 0,
            onClick: () => {
              tt(), q();
            }
          },
          "刷新"
        ),
        a.createElement(
          c,
          {
            type: "primary",
            size: "small",
            icon: x ? a.createElement(x) : void 0,
            onClick: () => G(!0),
            style: Oe
          },
          "添加 MCP"
        )
      )
    ),
    X.length === 0 ? a.createElement(g, {
      description: "该专家暂无 MCP 客户端",
      image: g.PRESENTED_IMAGE_SIMPLE
    }) : a.createElement(o, {
      dataSource: X,
      renderItem: (f) => a.createElement(
        o.Item,
        {
          actions: [
            a.createElement(
              c,
              {
                key: "toggle",
                size: "small",
                onClick: () => H(f.key)
              },
              f.enabled ? "停用" : "启用"
            ),
            a.createElement(
              c,
              {
                key: "del",
                type: "link",
                size: "small",
                danger: !0,
                icon: B ? a.createElement(B) : void 0,
                onClick: () => ie(f.key)
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
            a.createElement(U, { strong: !0 }, f.name || f.key),
            a.createElement(
              m,
              {
                color: f.enabled ? "green" : "default",
                style: { fontSize: 10 }
              },
              f.enabled ? "启用" : "停用"
            ),
            a.createElement(
              m,
              { color: "purple", style: { fontSize: 10 } },
              f.transport
            )
          ),
          f.description ? a.createElement(
            Z,
            {
              type: "secondary",
              style: { fontSize: 12, margin: 0 },
              ellipsis: { rows: 2 }
            },
            f.description
          ) : null,
          f.tools && f.tools.length > 0 ? a.createElement(
            "div",
            { style: { marginTop: 4, fontSize: 11, color: "#8c8c8c" } },
            `提供 ${f.tools.length} 个工具`
          ) : null
        )
      )
    }),
    // Create MCP modal
    a.createElement(
      w,
      {
        open: F,
        title: "添加 MCP 客户端 (JSON)",
        onCancel: () => G(!1),
        onOk: z,
        confirmLoading: p,
        okText: "创建",
        width: 560
      },
      a.createElement(
        "div",
        { style: { marginBottom: 8, fontSize: 12, color: "#8c8c8c" } },
        "粘贴 MCP 配置 JSON（支持 mcpServers 格式），将创建到当前专家工作区："
      ),
      a.createElement(W, {
        value: P,
        onChange: (f) => E(f.target.value),
        rows: 12,
        style: { fontFamily: "monospace", fontSize: 12 }
      })
    )
  );
}
function Cl({ agentId: e }) {
  const t = A().React, { useState: l, useEffect: a, useCallback: n, useRef: s } = t, {
    Card: r,
    InputNumber: o,
    Input: m,
    Select: c,
    Switch: g,
    Button: C,
    Spin: w,
    Space: v,
    Typography: b,
    Divider: y,
    message: x
  } = A().antd, { SaveOutlined: j } = A().antdIcons || {}, { Text: B } = b, [U, Z] = l(!0), [W, X] = l(!1), M = s(null), [T, _] = l(60), [F, G] = l(""), [P, E] = l(!0), [p, R] = l(30), [q, H] = l("zh"), [ie, z] = l("UTC"), [f, d] = l(!0), [I, ae] = l(100), [$, K] = l(!0), [le, J] = l(3), [Y, ue] = l(1), [k, te] = l(!0), [D, Q] = l(3), [h, me] = l(2), [u, ce] = l(60), [ge, fe] = l(1), [ne, V] = l(0), [S, re] = l(1), [pe, N] = l(0), [ye, se] = l(30), [ve, Ie] = l(50), [ke, Fe] = l("light"), [Pe, nt] = l("scroll"), [dt, at] = l("remelight"), [$e, lt] = l("AUTO"), ut = n(async () => {
    var ee, we, xe, Te, We, Je;
    Z(!0);
    try {
      const [be, pt, Pt] = await Promise.all([
        ul(e),
        gl(e).catch(() => "zh"),
        yl().catch(() => "UTC")
      ]);
      M.current = be, _(be.shell_command_timeout ?? 60), G(be.shell_command_executable ?? "");
      const ot = be.auto_title_config ?? { enabled: !0, timeout_seconds: 30 };
      E(ot.enabled ?? !0), R(ot.timeout_seconds ?? 30), H(pt), z(Pt);
      const je = be.loop ?? {};
      d(((ee = je.iteration) == null ? void 0 : ee.enabled) ?? !0), ae(((we = je.iteration) == null ? void 0 : we.max_iterations) ?? be.max_iters ?? 100), K(((xe = je.doom_loop) == null ? void 0 : xe.enabled) ?? !0), J(((Te = je.doom_loop) == null ? void 0 : Te.window_size) ?? 3), ue(((We = je.doom_loop) == null ? void 0 : We.similarity_threshold) ?? 1), te(be.llm_retry_enabled ?? !0), Q(be.llm_max_retries ?? 3), me(be.llm_backoff_base ?? 2), ce(be.llm_backoff_cap ?? 60), fe(be.llm_max_concurrent ?? 1), V(be.llm_max_qpm ?? 0), re(be.llm_rate_limit_pause ?? 1), N(be.llm_rate_limit_jitter ?? 0), se(be.llm_acquire_timeout ?? 30), Ie(be.history_max_length ?? 50), Fe(be.context_manager_backend ?? "light"), nt(((Je = be.light_context_config) == null ? void 0 : Je.strategy) ?? "scroll"), at(be.memory_manager_backend ?? "remelight"), lt(be.approval_level ?? "AUTO");
    } catch (be) {
      x.error(be.message || "加载运行配置失败");
    } finally {
      Z(!1);
    }
  }, [e]);
  a(() => {
    ut();
  }, [ut]);
  const st = async () => {
    var we, xe;
    const ee = M.current;
    if (ee) {
      X(!0);
      try {
        const Te = {
          ...ee,
          max_iters: I,
          loop: {
            ...ee.loop ?? {},
            iteration: { enabled: f, max_iterations: I },
            doom_loop: {
              enabled: $,
              window_size: le,
              similarity_threshold: Y,
              stages: ((xe = (we = ee.loop) == null ? void 0 : we.doom_loop) == null ? void 0 : xe.stages) ?? []
            }
          },
          shell_command_timeout: T,
          shell_command_executable: F,
          auto_title_config: {
            enabled: P,
            timeout_seconds: p
          },
          llm_retry_enabled: k,
          llm_max_retries: D,
          llm_backoff_base: h,
          llm_backoff_cap: u,
          llm_max_concurrent: ge,
          llm_max_qpm: ne,
          llm_rate_limit_pause: S,
          llm_rate_limit_jitter: pe,
          llm_acquire_timeout: ye,
          history_max_length: ve,
          context_manager_backend: ke,
          light_context_config: {
            ...ee.light_context_config ?? {},
            strategy: Pe
          },
          memory_manager_backend: dt,
          approval_level: $e
        };
        await pl(e, Te), M.current = Te, q && await fl(e, q).catch(() => {
        }), ie && await El(ie).catch(() => {
        }), x.success("运行配置已保存");
      } catch (Te) {
        x.error(Te.message || "保存运行配置失败");
      } finally {
        X(!1);
      }
    }
  };
  if (U)
    return t.createElement(
      "div",
      { style: { textAlign: "center", padding: 40 } },
      t.createElement(w, { size: "large" })
    );
  const Se = (ee, we, xe) => t.createElement(
    "div",
    { style: Xn },
    t.createElement("div", { style: Ye }, ee),
    we,
    xe ? t.createElement(
      B,
      { type: "secondary", style: qn },
      xe
    ) : null
  ), _e = (ee, we, xe, Te) => t.createElement(
    "div",
    { style: Kn },
    t.createElement(
      "div",
      null,
      t.createElement("div", { style: Ye }, ee),
      we
    ),
    t.createElement(
      "div",
      null,
      t.createElement("div", { style: Ye }, xe),
      Te
    )
  );
  return t.createElement(
    "div",
    { style: { paddingBottom: 8 } },
    // ── Section: 基础设置 ──
    t.createElement(
      "div",
      { style: Ue },
      "基础设置"
    ),
    _e(
      "Shell 命令超时 (秒)",
      t.createElement(o, {
        min: 1,
        value: T,
        onChange: (ee) => _(ee ?? 60),
        style: { width: "100%" }
      }),
      "Shell 可执行文件",
      t.createElement(m, {
        value: F,
        onChange: (ee) => G(ee.target.value),
        placeholder: "留空使用系统默认",
        style: { width: "100%" }
      })
    ),
    _e(
      "语言",
      t.createElement(c, {
        value: q,
        onChange: (ee) => H(ee),
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
        value: ie,
        onChange: (ee) => z(ee),
        style: { width: "100%" },
        showSearch: !0,
        filterOption: (ee, we) => {
          var xe;
          return (((xe = we == null ? void 0 : we.label) == null ? void 0 : xe.toString()) || "").toLowerCase().includes(ee.toLowerCase());
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
        ].map((ee) => ({ value: ee, label: ee }))
      })
    ),
    _e(
      "自动生成会话标题",
      t.createElement(v, null, t.createElement(g, {
        checked: P,
        onChange: (ee) => E(ee)
      })),
      "标题生成超时 (秒)",
      t.createElement(o, {
        min: 5,
        value: p,
        onChange: (ee) => R(ee ?? 30),
        style: { width: "100%" },
        disabled: !P
      })
    ),
    // ── Section: 审批级别 ──
    t.createElement(y, { style: { margin: "8px 0 16px" } }),
    t.createElement("div", { style: Ue }, "审批级别"),
    Se(
      "工具执行审批",
      t.createElement(c, {
        value: $e,
        onChange: (ee) => lt(ee),
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
    t.createElement("div", { style: Ue }, "迭代与循环"),
    Se(
      "启用迭代限制",
      t.createElement(g, {
        checked: f,
        onChange: (ee) => d(ee)
      }),
      "停止 Agent 前的最大循环轮次"
    ),
    f ? Se(
      "最大迭代次数",
      t.createElement(o, {
        min: 1,
        max: 500,
        value: I,
        onChange: (ee) => ae(ee ?? 100),
        style: { width: "100%" }
      })
    ) : null,
    Se(
      "启用重复循环保护",
      t.createElement(g, {
        checked: $,
        onChange: (ee) => K(ee)
      }),
      "检测并阻止重复操作循环"
    ),
    $ ? _e(
      "检测窗口大小",
      t.createElement(o, {
        min: 2,
        max: 20,
        value: le,
        onChange: (ee) => J(ee ?? 3),
        style: { width: "100%" }
      }),
      "相似度阈值",
      t.createElement(o, {
        min: 0,
        max: 1,
        step: 0.05,
        value: Y,
        onChange: (ee) => ue(ee ?? 1),
        style: { width: "100%" }
      })
    ) : null,
    // ── Section: LLM 重试 ──
    t.createElement(y, { style: { margin: "8px 0 16px" } }),
    t.createElement("div", { style: Ue }, "LLM 重试"),
    Se(
      "启用 LLM 重试",
      t.createElement(g, {
        checked: k,
        onChange: (ee) => te(ee)
      })
    ),
    _e(
      "最大重试次数",
      t.createElement(o, {
        min: 1,
        value: D,
        onChange: (ee) => Q(ee ?? 3),
        style: { width: "100%" },
        disabled: !k
      }),
      "退避基数 (秒)",
      t.createElement(o, {
        min: 0.1,
        step: 0.1,
        value: h,
        onChange: (ee) => me(ee ?? 2),
        style: { width: "100%" },
        disabled: !k
      })
    ),
    Se(
      "退避上限 (秒)",
      t.createElement(o, {
        min: 0.5,
        step: 0.5,
        value: u,
        onChange: (ee) => ce(ee ?? 60),
        style: { width: 200 },
        disabled: !k
      })
    ),
    // ── Section: LLM 限流 ──
    t.createElement(y, { style: { margin: "8px 0 16px" } }),
    t.createElement("div", { style: Ue }, "LLM 限流"),
    _e(
      "最大并发数",
      t.createElement(o, {
        min: 1,
        value: ge,
        onChange: (ee) => fe(ee ?? 1),
        style: { width: "100%" }
      }),
      "最大 QPM (0=不限)",
      t.createElement(o, {
        min: 0,
        step: 10,
        value: ne,
        onChange: (ee) => V(ee ?? 0),
        style: { width: "100%" }
      })
    ),
    _e(
      "限流暂停时间 (秒)",
      t.createElement(o, {
        min: 1,
        step: 0.5,
        value: S,
        onChange: (ee) => re(ee ?? 1),
        style: { width: "100%" }
      }),
      "限流抖动 (秒)",
      t.createElement(o, {
        min: 0,
        step: 0.5,
        value: pe,
        onChange: (ee) => N(ee ?? 0),
        style: { width: "100%" }
      })
    ),
    Se(
      "获取超时 (秒)",
      t.createElement(o, {
        min: 10,
        step: 10,
        value: ye,
        onChange: (ee) => se(ee ?? 30),
        style: { width: 200 }
      }),
      "应大于 限流暂停 + 抖动"
    ),
    // ── Section: 上下文与记忆 ──
    t.createElement(y, { style: { margin: "8px 0 16px" } }),
    t.createElement("div", { style: Ue }, "上下文与记忆"),
    _e(
      "上下文管理后端",
      t.createElement(c, {
        value: ke,
        onChange: (ee) => Fe(ee),
        style: { width: "100%" },
        options: [{ value: "light", label: "light" }]
      }),
      "上下文策略",
      t.createElement(c, {
        value: Pe,
        onChange: (ee) => nt(ee),
        style: { width: "100%" },
        options: [
          { value: "scroll", label: "scroll (滚动窗口)" },
          { value: "native", label: "native (原生)" }
        ]
      })
    ),
    _e(
      "记忆管理后端",
      t.createElement(c, {
        value: dt,
        onChange: (ee) => at(ee),
        style: { width: "100%" },
        options: [
          { value: "remelight", label: "remelight" },
          { value: "adbpg", label: "adbpg" },
          { value: "none", label: "none (禁用)" }
        ]
      }),
      "历史消息最大长度",
      t.createElement(o, {
        min: 1,
        value: ve,
        onChange: (ee) => Ie(ee ?? 50),
        style: { width: "100%" }
      })
    ),
    // ── Save button ──
    t.createElement(
      "div",
      { style: { display: "flex", justifyContent: "flex-end", marginTop: 16 } },
      t.createElement(
        C,
        {
          type: "primary",
          icon: j ? t.createElement(j) : void 0,
          loading: W,
          onClick: st,
          style: Oe
        },
        "保存运行配置"
      )
    )
  );
}
function xl({
  expert: e,
  open: t,
  onClose: l,
  onRefresh: a
}) {
  const n = A().React, { useState: s, useEffect: r, useCallback: o } = n, { Modal: m, Tabs: c, Spin: g, Typography: C } = A().antd, { SettingOutlined: w } = A().antdIcons || {}, { Text: v } = C, [b, y] = s([]), [x, j] = s(!1), [B, U] = s("heartbeat"), Z = o(async () => {
    if (e) {
      j(!0);
      try {
        const T = await hl(e.agent.id);
        y(T);
      } catch {
        y([]);
      } finally {
        j(!1);
      }
    }
  }, [e]);
  if (r(() => {
    t && e && Z();
  }, [t, e, Z]), !e) return null;
  const { agent: W } = e, X = () => {
    Z(), a();
  }, M = [
    {
      key: "heartbeat",
      label: "心跳",
      children: n.createElement(bl, {
        agentId: W.id
      })
    },
    {
      key: "files",
      label: "文件",
      children: x ? n.createElement(
        "div",
        { style: { textAlign: "center", padding: 40 } },
        n.createElement(g, { size: "large" })
      ) : n.createElement(Jn, {
        agentId: W.id,
        systemPromptFiles: b,
        onRefresh: X
      })
    },
    {
      key: "skills",
      label: `技能 (${e.skills.filter((T) => T.enabled !== !1).length})`,
      children: n.createElement(Sl, {
        agentId: W.id,
        onRefresh: a
      })
    },
    {
      key: "mcp",
      label: `MCP (${e.mcps.length})`,
      children: n.createElement(wl, {
        agentId: W.id,
        onRefresh: a,
        isActive: B === "mcp"
      })
    },
    {
      key: "running",
      label: "运行配置",
      children: n.createElement(Cl, {
        agentId: W.id
      })
    }
  ];
  return n.createElement(
    m,
    {
      open: t,
      title: n.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 8 } },
        w ? n.createElement(w, { style: { fontSize: 18 } }) : null,
        n.createElement("span", null, `配置 - ${W.name}`),
        n.createElement(
          v,
          { type: "secondary", style: { fontSize: 12, fontWeight: 400 } },
          W.id
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
    n.createElement(c, {
      items: M,
      activeKey: B,
      onChange: (T) => U(T),
      size: "small",
      tabBarStyle: { marginBottom: 16 }
    })
  );
}
const kl = [
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
], _l = kl;
function Tn(e) {
  return Ne(`/ugsci/avatar/${encodeURIComponent(e)}`);
}
function zn(e) {
  const t = e.map(encodeURIComponent).join(",");
  return Ne(`/ugsci/avatar/team/${t}`);
}
function Ae({
  name: e,
  size: t = 32,
  borderRadius: l = "50%"
}) {
  const a = A().React, [n, s] = a.useState(0), r = n === 0 ? Tn(e) : `${Tn(e)}?_r=${n}`;
  return a.createElement("img", {
    src: r,
    alt: e,
    onError: () => {
      n < 1 && s(n + 1);
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
function qt({
  members: e,
  size: t = 32,
  borderRadius: l = "50%"
}) {
  const a = A().React, [n, s] = a.useState(0);
  if (!e || e.length === 0)
    return a.createElement("span", {
      style: {
        width: t,
        height: t,
        display: "inline-block"
      }
    });
  const r = e.slice(0, 5), o = n === 0 ? zn(r) : `${zn(r)}?_r=${n}`;
  return a.createElement("img", {
    src: o,
    alt: "team",
    onError: () => {
      n < 1 && s(n + 1);
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
function Tl({
  expert: e,
  onClick: t,
  onSummon: l,
  onConfigure: a
}) {
  const n = A().React, { Card: s, Tag: r, Badge: o, Typography: m, Spin: c, Button: g, Tooltip: C } = A().antd, { Text: w } = m, { ThunderboltOutlined: v, SettingOutlined: b } = A().antdIcons || {}, { agent: y, skills: x, mcps: j, loading: B } = e, U = y.enabled, Z = x.filter((M) => M.enabled !== !1).map((M) => M.name), W = j.map((M) => M.name || M.key), X = y.active_model ? `${y.active_model.provider_id}/${y.active_model.model}` : null;
  return n.createElement(
    s,
    {
      hoverable: !0,
      onClick: t,
      size: "small",
      style: {
        cursor: "pointer",
        transition: "all 0.2s ease",
        borderColor: U ? void 0 : "#d9d9d9",
        opacity: U ? 1 : 0.7,
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
        n.createElement(Ae, { name: y.name, size: 36 }),
        n.createElement(
          "div",
          null,
          n.createElement(
            w,
            { strong: !0, style: { fontSize: 15 } },
            y.name
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
            y.id
          )
        )
      ),
      n.createElement(o, {
        status: U ? "success" : "default",
        text: U ? "启用" : "停用"
      })
    ),
    // Description (rendered as markdown)
    y.description ? n.createElement(
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
      zt(y.description, n)
    ) : n.createElement(
      "div",
      { style: { fontSize: 12, color: "#bfbfbf", marginBottom: 10, minHeight: 54, flex: "1 0 auto" } },
      "暂无描述"
    ),
    // Model info
    X ? n.createElement(
      "div",
      { style: { marginBottom: 8 } },
      n.createElement(
        r,
        { color: "geekblue", style: { fontSize: 11 } },
        `🤖 ${X}`
      )
    ) : null,
    // Skills
    B ? n.createElement(c, { size: "small" }) : n.createElement(
      "div",
      { style: { marginBottom: 6 } },
      n.createElement(
        "div",
        { style: { fontSize: 11, color: "#8c8c8c", marginBottom: 4 } },
        `技能 (${Z.length})`
      ),
      n.createElement(_n, {
        items: Z,
        max: 4,
        color: "cyan",
        emptyText: "未配置技能"
      })
    ),
    // MCP
    !B && W.length > 0 ? n.createElement(
      "div",
      { style: { marginTop: "auto" } },
      n.createElement(
        "div",
        { style: { fontSize: 11, color: "#8c8c8c", marginBottom: 4 } },
        `MCP (${W.length})`
      ),
      n.createElement(_n, {
        items: W,
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
        C,
        { title: "配置专家", placement: "top" },
        n.createElement(
          g,
          {
            type: "text",
            size: "small",
            icon: b ? n.createElement(b, {
              style: { fontSize: 16, color: "#8c8c8c" }
            }) : void 0,
            onClick: (M) => {
              M.stopPropagation(), a && a();
            }
          }
        )
      ),
      // Summon button (bottom-right)
      n.createElement(
        g,
        {
          type: "primary",
          size: "small",
          icon: v ? n.createElement(v) : void 0,
          disabled: !U,
          onClick: (M) => {
            M.stopPropagation(), l && l();
          },
          style: Oe
        },
        "召唤专家"
      )
    )
  );
}
function zl({
  expert: e,
  open: t,
  onClose: l,
  onRefresh: a
}) {
  const n = A().React, {
    Drawer: s,
    Descriptions: r,
    Tag: o,
    Typography: m,
    Space: c,
    Button: g,
    Empty: C,
    Tabs: w,
    List: v,
    Spin: b,
    Modal: y,
    message: x
  } = A().antd, { Text: j, Paragraph: B } = m, {
    EditOutlined: U,
    ThunderboltOutlined: Z,
    FileTextOutlined: W,
    ToolOutlined: X,
    PlusOutlined: M
  } = A().antdIcons || {}, [T, _] = n.useState(!1), [F, G] = n.useState(
    []
  ), [P, E] = n.useState(!1);
  if (!e) return null;
  const { agent: p, config: R, skills: q, mcps: H, loading: ie } = e, z = q.filter((k) => k.enabled !== !1), f = (k) => {
    window.history.pushState({}, "", k), window.dispatchEvent(new PopStateEvent("popstate"));
  }, d = n.createElement(
    "div",
    null,
    n.createElement(
      r,
      { column: 1, bordered: !0, size: "small" },
      n.createElement(r.Item, { label: "专家名称" }, p.name),
      n.createElement(
        r.Item,
        { label: "专家 ID" },
        n.createElement("code", { style: { fontSize: 12 } }, p.id)
      ),
      n.createElement(
        r.Item,
        { label: "状态" },
        n.createElement(
          o,
          { color: p.enabled ? "green" : "default" },
          p.enabled ? "启用" : "停用"
        )
      ),
      n.createElement(
        r.Item,
        { label: "功能简介" },
        p.description ? zt(p.description, n) : "暂无描述"
      ),
      n.createElement(
        r.Item,
        { label: "使用模型" },
        p.active_model ? `${p.active_model.provider_id} / ${p.active_model.model}` : "使用全局默认模型"
      ),
      R != null && R.workspace_dir ? n.createElement(
        r.Item,
        { label: "工作区路径" },
        n.createElement(
          "code",
          { style: { fontSize: 11 } },
          R.workspace_dir
        )
      ) : null,
      R != null && R.approval_level ? n.createElement(
        r.Item,
        { label: "审批级别" },
        R.approval_level
      ) : null
    ),
    // System prompt files
    R != null && R.system_prompt_files && R.system_prompt_files.length > 0 ? n.createElement(
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
        W ? n.createElement(W, {
          style: { fontSize: 14, color: "#1677ff" }
        }) : null,
        n.createElement(j, { strong: !0 }, "系统提示词文件")
      ),
      n.createElement(
        c,
        { wrap: !0 },
        ...R.system_prompt_files.map(
          (k, te) => n.createElement(
            o,
            {
              key: te,
              icon: W ? n.createElement(W) : void 0,
              style: { fontSize: 12 }
            },
            k
          )
        )
      )
    ) : null
  ), I = async () => {
    _(!0), E(!0);
    try {
      const k = await Wt(!0);
      G(k);
    } catch (k) {
      x.error(k.message || "加载技能池失败");
    } finally {
      E(!1);
    }
  }, ae = async (k) => {
    let te = 0, D = 0;
    for (const Q of k)
      try {
        await Jt(p.id, Q), te++;
      } catch {
        D++;
      }
    te > 0 ? (x.success(
      `成功添加 ${te} 个技能${D > 0 ? `，${D} 个失败` : ""}`
    ), a()) : D > 0 && x.error("添加技能失败"), _(!1);
  }, $ = async (k) => {
    try {
      await Xt(p.id, k), x.success(`技能「${k}」已移除`), a();
    } catch (te) {
      x.error(te.message || "移除技能失败");
    }
  }, K = async (k) => {
    try {
      await Fn(p.id, k), x.success(`MCP「${k}」已移除`), a();
    } catch (te) {
      x.error(te.message || "移除 MCP 失败");
    }
  }, le = ie ? n.createElement(
    "div",
    { style: { textAlign: "center", padding: 40 } },
    n.createElement(b, { size: "large" })
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
        j,
        { strong: !0 },
        `已启用技能 (${z.length})`
      ),
      n.createElement(
        g,
        {
          type: "primary",
          size: "small",
          icon: M ? n.createElement(M) : void 0,
          onClick: I
        },
        "从技能池添加"
      )
    ),
    z.length === 0 ? n.createElement(C, {
      description: "该专家暂无已启用的技能",
      image: C.PRESENTED_IMAGE_SIMPLE
    }) : n.createElement(v, {
      dataSource: z,
      renderItem: (k) => n.createElement(
        v.Item,
        {
          actions: [
            n.createElement(
              g,
              {
                type: "link",
                size: "small",
                danger: !0,
                onClick: () => $(k.name)
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
            k.emoji ? n.createElement(
              "span",
              { style: { fontSize: 16 } },
              k.emoji
            ) : null,
            n.createElement(j, { strong: !0 }, k.name),
            k.version_text ? n.createElement(
              o,
              { style: { fontSize: 10 } },
              `v${k.version_text}`
            ) : null
          ),
          k.description ? n.createElement(
            B,
            {
              type: "secondary",
              style: { fontSize: 12, margin: 0 },
              ellipsis: { rows: 2 }
            },
            k.description
          ) : null,
          k.tags && k.tags.length > 0 ? n.createElement(
            "div",
            { style: { marginTop: 4 } },
            ...k.tags.map(
              (te, D) => n.createElement(
                o,
                {
                  key: D,
                  color: "cyan",
                  style: { fontSize: 10 }
                },
                te
              )
            )
          ) : null
        )
      )
    }),
    // Skill Picker Modal (card-grid style, consistent with Skill Center)
    n.createElement(Wn, {
      open: T,
      onClose: () => _(!1),
      poolSkills: F,
      installedSkillNames: z.map((k) => k.name),
      loading: P,
      onInstall: ae
    })
  ), J = ie ? n.createElement(
    "div",
    { style: { textAlign: "center", padding: 40 } },
    n.createElement(b, { size: "large" })
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
        j,
        { strong: !0 },
        `MCP 客户端 (${H.length})`
      ),
      n.createElement(
        g,
        {
          type: "primary",
          size: "small",
          icon: M ? n.createElement(M) : void 0,
          onClick: () => {
            window.history.pushState({}, "", `/agents/${p.id}/mcp`), window.dispatchEvent(new PopStateEvent("popstate"));
          }
        },
        "配置 MCP"
      )
    ),
    H.length === 0 ? n.createElement(C, {
      description: "该专家暂无关联的 MCP 客户端，点击「配置 MCP」添加",
      image: C.PRESENTED_IMAGE_SIMPLE
    }) : n.createElement(v, {
      dataSource: H,
      renderItem: (k) => n.createElement(
        v.Item,
        {
          actions: [
            n.createElement(
              g,
              {
                type: "link",
                size: "small",
                danger: !0,
                onClick: () => K(k.key)
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
              j,
              { strong: !0 },
              k.name || k.key
            ),
            n.createElement(
              o,
              {
                color: k.enabled ? "green" : "default",
                style: { fontSize: 10 }
              },
              k.enabled ? "启用" : "停用"
            ),
            n.createElement(
              o,
              { color: "purple", style: { fontSize: 10 } },
              k.transport
            )
          ),
          k.description ? n.createElement(
            B,
            {
              type: "secondary",
              style: { fontSize: 12, margin: 0 },
              ellipsis: { rows: 2 }
            },
            k.description
          ) : null,
          k.tools && k.tools.length > 0 ? n.createElement(
            "div",
            {
              style: {
                marginTop: 4,
                fontSize: 11,
                color: "#8c8c8c"
              }
            },
            `提供 ${k.tools.length} 个工具`
          ) : null
        )
      )
    })
  ), Y = R != null && R.tools ? n.createElement(
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
        X ? n.createElement(X, {
          style: { fontSize: 14, color: "#1677ff" }
        }) : null,
        n.createElement(j, { strong: !0 }, "工具配置")
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
        JSON.stringify(R.tools, null, 2)
      )
    )
  ) : n.createElement(C, {
    description: "暂无工具配置",
    image: C.PRESENTED_IMAGE_SIMPLE
  }), ue = [
    { key: "basic", label: "基本信息", children: d },
    {
      key: "skills",
      label: `技能 (${z.length})`,
      children: le
    },
    {
      key: "prompts",
      label: "推荐提问",
      children: n.createElement(vl, {
        skills: z,
        agentId: p.id
      })
    },
    {
      key: "knowledge",
      label: "专家记忆",
      children: n.createElement(Jn, {
        agentId: p.id,
        systemPromptFiles: (R == null ? void 0 : R.system_prompt_files) || [],
        onRefresh: () => a()
      })
    },
    { key: "mcp", label: `MCP (${H.length})`, children: J },
    { key: "tools", label: "工具配置", children: Y }
  ];
  return n.createElement(
    s,
    {
      title: n.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 8 } },
        n.createElement(Ae, { name: p.name, size: 28 }),
        n.createElement("span", null, p.name)
      ),
      open: t,
      onClose: l,
      width: 560,
      extra: n.createElement(
        c,
        null,
        n.createElement(
          g,
          {
            size: "small",
            icon: U ? n.createElement(U) : void 0,
            onClick: () => {
              l();
              try {
                const k = A();
                k.setSelectedAgent && k.setSelectedAgent(p.id);
              } catch (k) {
                console.warn("[ugsci] Failed to set selected agent:", k);
              }
              setTimeout(() => f("/agents"), 0);
            }
          },
          "编辑专家"
        ),
        n.createElement(
          g,
          {
            type: "primary",
            size: "small",
            icon: Z ? n.createElement(Z) : void 0,
            onClick: () => {
              l();
              try {
                const k = A();
                k.setSelectedAgent && k.setSelectedAgent(p.id);
              } catch (k) {
                console.warn("[ugsci] Failed to set selected agent:", k);
              }
              setTimeout(() => f("/chat"), 0);
            }
          },
          "开始对话"
        )
      )
    },
    n.createElement(w, {
      items: ue,
      defaultActiveKey: "basic"
    })
  );
}
function Il({
  open: e,
  onClose: t,
  onCreated: l
}) {
  const a = A().React, { useState: n } = a, {
    Modal: s,
    Card: r,
    Tag: o,
    Input: m,
    Row: c,
    Col: g,
    Spin: C,
    message: w,
    Typography: v
  } = A().antd, { Text: b } = v, { FileAddOutlined: y } = A().antdIcons || {}, [x, j] = n(!1), [B, U] = n(""), [Z, W] = n(!1), X = async (_, F) => {
    j(!0);
    try {
      const G = await oe("/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: _ || "新专家",
          description: F || "",
          skill_names: []
        })
      });
      await xt(
        G.id,
        "AGENTS.md",
        `# ${_ || "新专家"}

请在此处编写该专家的系统提示词。
`
      ), w.success("专家「" + (_ || "新专家") + "」创建成功"), W(!1), setTimeout(() => {
        t(), l();
      }, 0);
    } catch (G) {
      w.error(G.message || "创建专家失败");
    } finally {
      j(!1);
    }
  }, M = _l.filter((_) => {
    if (!B.trim()) return !0;
    const F = B.toLowerCase();
    return _.name.toLowerCase().includes(F) || _.description.toLowerCase().includes(F) || _.category.toLowerCase().includes(F);
  }), T = async (_) => {
    j(!0);
    try {
      const F = await oe("/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: _.name,
          description: _.description,
          skill_names: _.recommended_skills
        })
      });
      await xt(F.id, "AGENTS.md", _.system_prompt);
      const G = await Ht(F.id);
      G.approval_level = _.approval_level, await oe(`/agents/${encodeURIComponent(F.id)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(G)
      }), w.success(`专家「${_.name}」创建成功`), t(), l();
    } catch (F) {
      w.error(F.message || "创建专家失败");
    } finally {
      j(!1);
    }
  };
  return a.createElement(
    a.Fragment,
    null,
    a.createElement(
      s,
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
        a.createElement(m, {
          placeholder: "搜索模板名称或类别...",
          value: B,
          onChange: (_) => U(_.target.value),
          allowClear: !0
        })
      ),
      x ? a.createElement(
        "div",
        { style: { textAlign: "center", padding: 60 } },
        a.createElement(C, { size: "large" }),
        a.createElement(
          "div",
          { style: { marginTop: 12, color: "#8c8c8c" } },
          "正在创建专家..."
        )
      ) : a.createElement(
        c,
        { gutter: [12, 12] },
        // ── Blank template card (always first) ──
        B.trim() ? null : a.createElement(
          g,
          { xs: 24, sm: 12 },
          a.createElement(
            r,
            {
              hoverable: !0,
              size: "small",
              onClick: () => W(!0),
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
                y ? a.createElement(y) : "📝"
              ),
              a.createElement(
                "div",
                { style: { flex: 1 } },
                a.createElement(
                  b,
                  { strong: !0, style: { fontSize: 15 } },
                  "从空白模版开始创建"
                ),
                a.createElement(
                  "div",
                  null,
                  a.createElement(
                    o,
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
        ...M.map(
          (_) => a.createElement(
            g,
            { key: _.id, xs: 24, sm: 12 },
            a.createElement(
              r,
              {
                hoverable: !0,
                size: "small",
                onClick: () => T(_),
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
                a.createElement(Ae, {
                  name: _.name,
                  size: 40
                }),
                a.createElement(
                  "div",
                  { style: { flex: 1 } },
                  a.createElement(
                    b,
                    { strong: !0, style: { fontSize: 15 } },
                    _.name
                  ),
                  a.createElement(
                    "div",
                    null,
                    a.createElement(
                      o,
                      { color: "blue", style: { fontSize: 10 } },
                      _.category
                    ),
                    _.approval_level === "MANUAL" ? a.createElement(
                      o,
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
                zt(_.description, a)
              )
            )
          )
        )
      )
    ),
    // ── Blank template creation modal (sibling, not nested inside Modal) ──
    a.createElement(Ol, {
      open: Z,
      onCancel: () => W(!1),
      onCreate: X
    })
  );
}
function Ol({
  open: e,
  onCancel: t,
  onCreate: l
}) {
  const a = A().React, { useState: n, useEffect: s } = a, { Modal: r, Input: o, message: m } = A().antd, [c, g] = n(""), [C, w] = n(""), [v, b] = n(!1);
  return s(() => {
    e && (g(""), w(""), b(!1));
  }, [e]), a.createElement(
    r,
    {
      open: e,
      title: "从空白模版创建专家",
      onCancel: t,
      onOk: () => {
        if (!c.trim()) {
          m.warning("请输入专家名称");
          return;
        }
        b(!0), Promise.resolve(l(c.trim(), C.trim())).finally(() => {
          b(!1);
        });
      },
      okText: "创建",
      cancelText: "取消",
      okButtonProps: { loading: v },
      maskClosable: !0,
      keyboard: !0
    },
    a.createElement(
      "div",
      { style: { marginBottom: 16 } },
      a.createElement(
        "div",
        { style: { fontSize: 13, marginBottom: 6, color: "#595959" } },
        "专家名称"
      ),
      a.createElement(o, {
        placeholder: "输入专家名称",
        value: c,
        onChange: (y) => g(y.target.value),
        maxLength: 50
      })
    ),
    a.createElement(
      "div",
      null,
      a.createElement(
        "div",
        { style: { fontSize: 13, marginBottom: 6, color: "#595959" } },
        "专家描述（可选）"
      ),
      a.createElement(o.TextArea, {
        placeholder: "简要描述该专家的职责和能力...",
        value: C,
        onChange: (y) => w(y.target.value),
        rows: 3,
        maxLength: 200
      })
    )
  );
}
const Vn = "ugsci_custom_teams";
function Al(e) {
  if (!e || typeof e != "object") return !1;
  const t = e;
  return typeof t.id == "string" && typeof t.name == "string" && typeof t.taskTemplate == "string" && typeof t.orchestrationPrompt == "string" && Array.isArray(t.members);
}
function St() {
  try {
    const e = JSON.parse(
      localStorage.getItem(Vn) || "[]"
    );
    return Array.isArray(e) ? e.filter(Al) : [];
  } catch {
    return [];
  }
}
function Yn(e) {
  try {
    localStorage.setItem(Vn, JSON.stringify(e));
  } catch {
  }
}
async function Pl(e) {
  var n, s;
  const t = (n = e.body) == null ? void 0 : n.getReader();
  if (!t) return;
  const l = new TextDecoder();
  let a = "";
  try {
    for (; ; ) {
      const { done: r, value: o } = await t.read();
      if (r) break;
      a += l.decode(o, { stream: !0 });
      let m;
      for (; (m = a.indexOf(`

`)) >= 0; ) {
        const c = a.slice(0, m);
        a = a.slice(m + 2);
        for (const g of c.split(`
`)) {
          if (!g.startsWith("data: ")) continue;
          const C = g.slice(6);
          let w;
          try {
            w = JSON.parse(C);
          } catch {
            continue;
          }
          if (w.error) {
            const v = w.error, b = typeof v == "string" ? v : (v == null ? void 0 : v.message) || "工作流启动失败";
            throw new Error(b);
          }
          if (w.object === "response" || w.type === "response") {
            const v = w.status;
            if (v === "failed" || v === "error") {
              const b = ((s = w.error) == null ? void 0 : s.message) || "工作流启动失败";
              throw new Error(b);
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
async function $l(e, t, l) {
  const a = `console:default:team-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, n = await fetch(Ne("/chats"), {
    method: "POST",
    headers: {
      ...Ct(),
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
    const m = await n.text().catch(() => "");
    throw new Error(
      m || `创建会话失败 (HTTP ${n.status})`
    );
  }
  const r = (await n.json()).id, o = await fetch(Ne("/console/chat"), {
    method: "POST",
    headers: {
      ...Ct(),
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
  if (!o.ok) {
    const m = await o.text().catch(() => "");
    throw new Error(m || `HTTP ${o.status}`);
  }
  return await Pl(o), r;
}
async function Ml(e) {
  const t = await fetch(Ne("/ugsci/team/custom"), {
    method: "POST",
    headers: { ...Ct(), "Content-Type": "application/json" },
    body: JSON.stringify({
      name: e.name,
      mode: e.mode,
      members: e.members,
      steps: e.steps || [],
      orchestrationPrompt: e.orchestrationPrompt,
      coordinatorName: e.coordinatorName || void 0,
      taskTemplate: e.taskTemplate
    })
  });
  if (!t.ok) {
    const a = await t.text().catch(() => "");
    throw new Error(a || `HTTP ${t.status}`);
  }
  return (await t.json()).team_id;
}
function kt(e, t) {
  var n;
  const l = t.replace(/\s+/g, ""), a = e.find(
    (s) => s.name === t || s.name.replace(/\s+/g, "") === l
  );
  return a ? a.id : ((n = e.find(
    (s) => s.name.includes(t) || t.includes(s.name) || s.name.replace(/\s+/g, "").includes(l)
  )) == null ? void 0 : n.id) || null;
}
function Vt() {
  var t;
  const e = (t = window.QwenPaw) == null ? void 0 : t.host;
  if (!e) throw new Error("[ugsci] QwenPaw.host not available");
  return e;
}
function Rl(e) {
  const t = Vt().getApiToken() || "";
  return {
    "Content-Type": "application/json",
    ...t ? { Authorization: `Bearer ${t}` } : {},
    ...e ? { "X-Agent-Id": e } : {}
  };
}
async function Qn(e, t, l) {
  try {
    const a = await fetch(Vt().getApiUrl(e), {
      headers: Rl(t),
      signal: l
    });
    return a.ok ? await a.json() : null;
  } catch {
    return null;
  }
}
function Ll(e, t) {
  return Qn("/ugsci/team/state", e, t);
}
async function jl() {
  const e = await Qn(
    "/ugsci/team/preset-teams"
  );
  return (e == null ? void 0 : e.teams) ?? null;
}
const Bl = {
  plan: { label: "规划", color: "#1677ff", icon: "📋" },
  dispatch: { label: "分派", color: "#13c2c2", icon: "🚀" },
  verify: { label: "验证", color: "#fa8c16", icon: "🔍" },
  synthesize: { label: "综合", color: "#722ed1", icon: "📊" },
  completed: { label: "完成", color: "#52c41a", icon: "✅" }
}, In = [
  "plan",
  "dispatch",
  "verify",
  "synthesize",
  "completed"
], Ul = 3;
function Nl() {
  const e = Vt(), t = e.React, { useState: l, useEffect: a, useCallback: n, useRef: s } = t, { Card: r, Tag: o, Typography: m, Button: c, Steps: g, Empty: C, Alert: w } = e.antd, { ReloadOutlined: v } = e.antdIcons || {}, { Text: b, Paragraph: y } = m, x = e.useSelectedAgent ? e.useSelectedAgent() : { id: "default" }, j = (x == null ? void 0 : x.id) || "default", [B, U] = l(null), [Z, W] = l(!1), X = s(null), M = s(0), T = s(0), _ = s(null), F = n(
    async (d) => {
      var K;
      (K = _.current) == null || K.abort();
      const I = new AbortController();
      _.current = I;
      const ae = ++T.current;
      d && W(!0);
      const $ = await Ll(j, I.signal);
      I.signal.aborted || ae !== T.current || ($ ? (M.current = 0, X.current = $, U($)) : M.current += 1, W(!1));
    },
    [j]
  ), G = n(() => F(!0), [F]);
  if (a(() => {
    var I;
    (I = _.current) == null || I.abort(), T.current += 1, M.current = 0, X.current = null, U(null), G();
    const d = window.setInterval(() => {
      var ae, $;
      M.current >= Ul || ((ae = X.current) == null ? void 0 : ae.status) === "completed" || (($ = X.current) == null ? void 0 : $.status) === "terminated" || F(!1);
    }, 5e3);
    return () => {
      var ae;
      window.clearInterval(d), (ae = _.current) == null || ae.abort(), T.current += 1;
    };
  }, [j, F, G]), (B == null ? void 0 : B.status) === "unreadable")
    return t.createElement(w, {
      type: "warning",
      showIcon: !0,
      message: "专家团状态暂时无法读取",
      description: `实例 ${B.instance_id || "未知"} 的状态文件需要检查。`,
      style: { marginBottom: 16 },
      action: t.createElement(
        c,
        { size: "small", onClick: G, loading: Z },
        "重试"
      )
    });
  if (!B || !B.active) {
    if ((B == null ? void 0 : B.status) === "completed" || (B == null ? void 0 : B.status) === "terminated") {
      const d = B.status === "completed";
      return t.createElement(w, {
        type: d ? "success" : "info",
        showIcon: !0,
        message: d ? "专家团工作流已完成" : "专家团工作流已终止",
        description: d ? `实例 ${B.instance_id || "未知"} 已完成，结果文件保留在工作区。` : `原因：${B.state.termination_reason || "未知"}`,
        style: { marginBottom: 16 }
      });
    }
    return t.createElement(C, {
      description: "暂无活跃的专家团工作流",
      style: { padding: 24 }
    });
  }
  const P = B.state, E = P.current_phase || "plan", p = In.indexOf(E), R = P.team_name || "未知团队", q = P.team_mode || "pipeline", H = P.iteration || 0, ie = P.members || [], z = P.verify_retries || 0, f = {
    pipeline: "流水线模式",
    coordinator: "协调者模式",
    roundtable: "圆桌讨论"
  };
  return t.createElement(
    r,
    {
      size: "small",
      style: { marginBottom: 16 },
      title: t.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 8 } },
        t.createElement("span", { style: { fontSize: 16 } }, "🔄"),
        t.createElement(b, { strong: !0 }, `${R} — 工作流状态`),
        t.createElement(
          o,
          { color: "blue", style: { fontSize: 10 } },
          f[q] || q
        ),
        t.createElement(
          o,
          { style: { fontSize: 10 } },
          `迭代 ${H}`
        ),
        z > 0 ? t.createElement(
          o,
          { color: "orange", style: { fontSize: 10 } },
          `验证重试 ${z}`
        ) : null
      ),
      extra: t.createElement(
        c,
        {
          size: "small",
          type: "text",
          icon: v ? t.createElement(v) : void 0,
          onClick: G,
          loading: Z
        },
        "刷新"
      )
    },
    t.createElement(g, {
      current: p,
      size: "small",
      items: In.map((d) => {
        const I = Bl[d];
        return {
          title: `${I.icon} ${I.label}`,
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
      ...ie.map(
        (d, I) => t.createElement(
          o,
          { key: `${d.name}-${I}`, style: { fontSize: 11 } },
          `${d.emoji || ""} ${d.name}（${d.role}）`
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
          color: "#666"
        },
        ellipsis: { rows: 2 }
      },
      `任务: ${P.task}`
    ) : null
  );
}
function Dl({ team: e }) {
  const t = A().React, { Typography: l, Tag: a } = A().antd, { Text: n } = l, s = {
    pipeline: "→",
    roundtable: "⇄",
    coordinator: "⊙"
  }, r = {
    pipeline: "#13c2c2",
    roundtable: "#722ed1",
    coordinator: "#1677ff"
  }, o = e.steps || [];
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
      `执行流程 (${e.mode === "pipeline" ? "流水线" : e.mode === "roundtable" ? "圆桌讨论" : "协调者模式"})`
    ),
    t.createElement(
      "div",
      {
        style: {
          display: "flex",
          flexDirection: e.mode === "roundtable" ? "row" : "column",
          gap: 8,
          alignItems: e.mode === "roundtable" ? "flex-start" : "stretch",
          flexWrap: "wrap"
        }
      },
      ...o.length > 0 ? o.map((m, c) => [
        c > 0 && e.mode !== "roundtable" ? t.createElement(
          "div",
          {
            key: `arrow-${c}`,
            style: {
              textAlign: "center",
              color: r[e.mode],
              fontSize: 14
            }
          },
          s[e.mode]
        ) : null,
        t.createElement(
          "div",
          {
            key: `step-${c}`,
            style: {
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "6px 10px",
              background: "#fff",
              borderRadius: 6,
              border: `1px solid ${r[e.mode]}33`,
              fontSize: 12,
              flex: e.mode === "roundtable" ? "1 1 200px" : "initial"
            }
          },
          t.createElement(Ae, {
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
                  color: "#8c8c8c",
                  maxWidth: 250
                }
              },
              m.instruction
            ),
            t.createElement(
              a,
              {
                ...m.passContext ? { color: "blue" } : {},
                style: { fontSize: 9, marginTop: 2 }
              },
              m.passContext ? "传递上下文" : "独立"
            )
          )
        )
      ]).flat() : e.members.map((m, c) => [
        c > 0 && e.mode !== "roundtable" ? t.createElement(
          "div",
          {
            key: `arrow-${c}`,
            style: {
              textAlign: "center",
              color: r[e.mode],
              fontSize: 14
            }
          },
          s[e.mode]
        ) : null,
        t.createElement(
          "div",
          {
            key: `member-${c}`,
            style: {
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "6px 10px",
              background: "#fff",
              borderRadius: 6,
              border: `1px solid ${r[e.mode]}33`,
              fontSize: 12,
              flex: e.mode === "roundtable" ? "1 1 150px" : "initial"
            }
          },
          t.createElement(Ae, {
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
              { style: { fontSize: 11, color: "#8c8c8c" } },
              m.role
            )
          )
        )
      ]).flat()
    )
  );
}
function Fl({
  open: e,
  onClose: t,
  agents: l,
  editingTeam: a,
  onSaved: n
}) {
  const s = A().React, { useState: r, useEffect: o, useCallback: m } = s, {
    Modal: c,
    Input: g,
    Button: C,
    Select: w,
    Tag: v,
    Typography: b,
    Switch: y,
    Empty: x,
    message: j,
    Divider: B,
    Steps: U
  } = A().antd, { PlusOutlined: Z, DeleteOutlined: W, SaveOutlined: X, ArrowRightOutlined: M } = A().antdIcons || {}, { Text: T, Paragraph: _ } = b, [F, G] = r(""), [P, E] = r("🤝"), [p, R] = r(""), [q, H] = r(
    "pipeline"
  ), [ie, z] = r(""), [f, d] = r(""), [I, ae] = r([]), [$, K] = r([]), [le, J] = r(!1);
  o(() => {
    e && (a ? (G(a.name), E(a.emoji), R(a.description), H(a.mode), z(a.coordinatorName || ""), d(a.taskTemplate), ae(a.steps || []), K(a.members.map((h) => h.name))) : (G(""), E("🤝"), R(""), H("pipeline"), z(""), d(`请执行以下任务：
任务描述：{任务描述}`), ae([]), K([])));
  }, [e, a]);
  const Y = m(() => {
    if (q === "roundtable") {
      const h = $.map((me) => ({
        agentName: me,
        instruction: "请给出你的专业评估意见",
        passContext: !1
      }));
      ae(h);
    } else if (q === "pipeline") {
      const h = new Map(I.map((u) => [u.agentName, u])), me = $.map((u) => h.get(u) || {
        agentName: u,
        instruction: "请完成你的专业部分",
        passContext: !0
      });
      ae(me);
    }
  }, [q, $, I]), ue = (h) => {
    $.includes(h) || (K([...$, h]), q === "coordinator" && !ie && z(h));
  }, k = (h) => {
    K($.filter((me) => me !== h)), ae(I.filter((me) => me.agentName !== h)), ie === h && z($[0] || "");
  }, te = (h, me, u) => {
    const ce = [...I];
    ce[h] = { ...ce[h], [me]: u }, ae(ce);
  }, D = () => {
    if (!F.trim()) {
      j.warning("请输入团队名称");
      return;
    }
    if ($.length < 2) {
      j.warning("至少需要选择 2 个成员");
      return;
    }
    if (!f.trim()) {
      j.warning("请输入任务模板");
      return;
    }
    if (q === "coordinator" && !ie) {
      j.warning("请选择协调者");
      return;
    }
    J(!0);
    try {
      const h = $.map(
        (fe) => {
          var V;
          const ne = l.find((S) => S.name === fe);
          return {
            name: fe,
            role: ((V = ne == null ? void 0 : ne.description) == null ? void 0 : V.slice(0, 30)) || "团队成员",
            emoji: ""
          };
        }
      );
      let me = I;
      (I.length === 0 || I.length !== $.length) && (me = $.map((fe) => ({
        agentName: fe,
        instruction: "请完成你的专业部分",
        passContext: q === "pipeline"
      })));
      const u = {
        id: (a == null ? void 0 : a.id) || `custom-${Date.now()}`,
        name: F.trim(),
        emoji: P,
        category: "自定义",
        description: p.trim() || `${F.trim()}（${$.length}人团队）`,
        mode: q,
        members: h,
        coordinatorName: q === "coordinator" ? ie : void 0,
        taskTemplate: f.trim(),
        orchestrationPrompt: "",
        // Custom teams use steps-based instructions
        steps: me,
        custom: !0,
        createdAt: (a == null ? void 0 : a.createdAt) || Date.now()
      }, ce = St(), ge = ce.findIndex((fe) => fe.id === u.id);
      ge >= 0 ? ce[ge] = u : ce.push(u), Yn(ce), j.success(a ? "团队已更新" : "团队已创建"), n(), t();
    } catch (h) {
      j.error(h.message || "保存失败");
    } finally {
      J(!1);
    }
  }, Q = l.filter(
    (h) => !$.includes(h.name)
  );
  return s.createElement(
    c,
    {
      open: e,
      onCancel: t,
      title: s.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 8 } },
        s.createElement(
          "span",
          { style: { fontSize: 20 } },
          a ? "✏️" : "➕"
        ),
        s.createElement(
          "span",
          null,
          a ? "编辑专家团" : "创建专家团"
        )
      ),
      width: 720,
      onOk: D,
      okText: "保存团队",
      confirmLoading: le,
      okButtonProps: {
        icon: X ? s.createElement(X) : void 0
      }
    },
    // Step 1: Basic info
    s.createElement(
      "div",
      { style: { marginBottom: 16 } },
      s.createElement(
        T,
        {
          strong: !0,
          style: { display: "block", marginBottom: 8, fontSize: 13 }
        },
        "1. 基本信息"
      ),
      s.createElement(
        "div",
        { style: { display: "flex", gap: 8, marginBottom: 8, alignItems: "center" } },
        $.length > 0 ? s.createElement(qt, {
          members: $,
          size: 36
        }) : null,
        s.createElement(g, {
          placeholder: "团队名称（如：储层评价团队）",
          value: F,
          onChange: (h) => G(h.target.value),
          style: { flex: 1 }
        })
      ),
      s.createElement(g.TextArea, {
        placeholder: "团队描述（简述团队的目标和适用场景）",
        value: p,
        onChange: (h) => R(h.target.value),
        rows: 2,
        style: { marginBottom: 8 }
      }),
      s.createElement(
        "div",
        { style: { display: "flex", gap: 8, alignItems: "center" } },
        s.createElement(
          T,
          { type: "secondary", style: { fontSize: 12 } },
          "协同模式："
        ),
        s.createElement(w, {
          value: q,
          onChange: (h) => H(h),
          style: { width: 160 },
          options: [
            { value: "pipeline", label: "🔄 流水线（依次执行）" },
            { value: "roundtable", label: "🔀 圆桌讨论（独立评估）" },
            { value: "coordinator", label: "🎯 协调者（由协调者主导）" }
          ]
        })
      )
    ),
    s.createElement(B, { style: { margin: "12px 0" } }),
    // Step 2: Select members
    s.createElement(
      "div",
      { style: { marginBottom: 16 } },
      s.createElement(
        T,
        {
          strong: !0,
          style: { display: "block", marginBottom: 8, fontSize: 13 }
        },
        "2. 选择团队成员"
      ),
      // Available agents
      Q.length > 0 ? s.createElement(
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
        ...Q.map(
          (h) => s.createElement(
            C,
            {
              key: h.id,
              size: "small",
              icon: Z ? s.createElement(Z) : void 0,
              onClick: () => ue(h.name)
            },
            h.name
          )
        )
      ) : null,
      // Selected members
      $.length === 0 ? s.createElement(x, {
        description: "请从上方添加团队成员",
        image: x.PRESENTED_IMAGE_SIMPLE
      }) : s.createElement(
        "div",
        { style: { display: "flex", flexDirection: "column", gap: 4 } },
        ...$.map(
          (h) => s.createElement(
            "div",
            {
              key: h,
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
            s.createElement(
              "div",
              { style: { display: "flex", alignItems: "center", gap: 6 } },
              s.createElement(Ae, { name: h, size: 24 }),
              s.createElement(
                T,
                { strong: !0, style: { fontSize: 13 } },
                h
              ),
              q === "coordinator" && ie === h ? s.createElement(
                v,
                { color: "blue", style: { fontSize: 10 } },
                "协调者"
              ) : null
            ),
            s.createElement(
              "div",
              { style: { display: "flex", gap: 4 } },
              q === "coordinator" ? s.createElement(
                C,
                {
                  size: "small",
                  type: "link",
                  onClick: () => z(h)
                },
                "设为协调者"
              ) : null,
              s.createElement(
                C,
                {
                  size: "small",
                  type: "link",
                  danger: !0,
                  icon: W ? s.createElement(W) : void 0,
                  onClick: () => k(h)
                },
                "移除"
              )
            )
          )
        )
      )
    ),
    s.createElement(B, { style: { margin: "12px 0" } }),
    // Step 3: Define execution steps (for pipeline/roundtable)
    $.length > 0 ? s.createElement(
      "div",
      { style: { marginBottom: 16 } },
      s.createElement(
        T,
        {
          strong: !0,
          style: { display: "block", marginBottom: 8, fontSize: 13 }
        },
        `3. 编排执行步骤${q === "roundtable" ? "（各步独立执行）" : q === "pipeline" ? "（依次执行，可传递上下文）" : "（由协调者决定调用顺序）"}`
      ),
      // Auto-sync button
      s.createElement(
        C,
        {
          size: "small",
          type: "dashed",
          onClick: Y,
          style: { marginBottom: 8 }
        },
        "自动生成步骤"
      ),
      // Steps list
      I.length === 0 ? s.createElement(
        T,
        { type: "secondary", style: { fontSize: 12 } },
        "点击「自动生成步骤」或手动配置每步的指令"
      ) : s.createElement(
        "div",
        { style: { display: "flex", flexDirection: "column", gap: 6 } },
        ...I.map(
          (h, me) => s.createElement(
            "div",
            {
              key: me,
              style: {
                padding: 8,
                background: "#fff",
                borderRadius: 6,
                border: "1px solid #e8e8e8"
              }
            },
            s.createElement(
              "div",
              {
                style: {
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  marginBottom: 6
                }
              },
              q === "pipeline" ? s.createElement(
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
              ) : s.createElement(
                "span",
                { style: { fontSize: 14 } },
                "🔀"
              ),
              s.createElement(
                v,
                { color: "blue", style: { fontSize: 11 } },
                h.agentName
              ),
              s.createElement(
                "div",
                { style: { flex: 1 } },
                s.createElement(g, {
                  placeholder: "请输入该步骤的指令...",
                  value: h.instruction,
                  onChange: (u) => te(me, "instruction", u.target.value),
                  size: "small"
                })
              )
            ),
            s.createElement(
              "div",
              {
                style: {
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  paddingLeft: 28
                }
              },
              s.createElement(y, {
                size: "small",
                checked: h.passContext,
                onChange: (u) => te(me, "passContext", u)
              }),
              s.createElement(
                T,
                { type: "secondary", style: { fontSize: 11 } },
                h.passContext ? "传递上一步结果作为上下文" : "独立执行"
              )
            )
          )
        )
      )
    ) : null,
    s.createElement(B, { style: { margin: "12px 0" } }),
    // Step 4: Task template
    s.createElement(
      "div",
      null,
      s.createElement(
        T,
        {
          strong: !0,
          style: { display: "block", marginBottom: 8, fontSize: 13 }
        },
        `${$.length > 0 ? "4" : "3"}. 任务模板`
      ),
      s.createElement(g.TextArea, {
        placeholder: `输入任务模板，可用 {参数名} 作为占位符...

例如：
请对区块 {区块名} 的井 {井号} 进行储层评价`,
        value: f,
        onChange: (h) => d(h.target.value),
        rows: 4,
        style: { fontFamily: "monospace", fontSize: 13 }
      }),
      s.createElement(
        T,
        {
          type: "secondary",
          style: { fontSize: 11, display: "block", marginTop: 4 }
        },
        "占位符 {参数名} 在发起任务时可由用户填写替换"
      )
    )
  );
}
function On({
  team: e,
  agents: t,
  onLaunch: l,
  onEdit: a,
  onDelete: n
}) {
  var E;
  const s = A().React, { useState: r } = s, { Card: o, Tag: m, Typography: c, Button: g, Tooltip: C } = A().antd, {
    TeamOutlined: w,
    RocketOutlined: v,
    UserOutlined: b,
    EditOutlined: y,
    DeleteOutlined: x,
    DownOutlined: j,
    UpOutlined: B
  } = A().antdIcons || {}, { Text: U, Paragraph: Z } = c, [W, X] = r(!1), M = {
    coordinator: { label: "协调者模式", color: "blue" },
    pipeline: { label: "流水线模式", color: "cyan" },
    roundtable: { label: "圆桌讨论", color: "purple" }
  }, T = M[e.mode] || M.coordinator, _ = e.members.map((p) => {
    const R = kt(t, p.name);
    return { ...p, found: !!R, agentId: R };
  }), F = _.filter((p) => p.found).length, G = e.coordinatorName || ((E = e.members[0]) == null ? void 0 : E.name), P = G ? kt(t, G) : null;
  return s.createElement(
    o,
    {
      hoverable: !0,
      size: "small",
      style: { height: "100%", display: "flex", flexDirection: "column" }
    },
    // Header: emoji + name + mode tag + custom badge
    s.createElement(
      "div",
      {
        style: {
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 10
        }
      },
      s.createElement(qt, {
        members: e.members.map((p) => p.name),
        size: 36
      }),
      s.createElement(
        "div",
        { style: { flex: 1 } },
        s.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 6 } },
          s.createElement(
            U,
            { strong: !0, style: { fontSize: 14 } },
            e.name
          ),
          e.custom ? s.createElement(
            m,
            { color: "gold", style: { fontSize: 9 } },
            "自定义"
          ) : null
        ),
        s.createElement(
          "div",
          { style: { display: "flex", gap: 4, marginTop: 4 } },
          s.createElement(
            m,
            { color: T.color, style: { fontSize: 10 } },
            T.label
          ),
          s.createElement(
            m,
            { color: "green", style: { fontSize: 10 } },
            `${e.members.length} 位专家`
          ),
          F < e.members.length ? s.createElement(
            C,
            {
              title: `OMP 架构下，未创建的专家将通过 spawn_subagent 自动派发，
控制器会根据角色 prompt 创建子 agent 执行任务。`
            },
            s.createElement(
              m,
              { color: "blue", style: { fontSize: 10 } },
              "OMP 自动派发"
            )
          ) : s.createElement(
            m,
            { color: "green", style: { fontSize: 10 } },
            "全部就绪"
          )
        )
      ),
      // Edit/delete for custom teams
      e.custom ? s.createElement(
        "div",
        { style: { display: "flex", gap: 2 } },
        a ? s.createElement(
          C,
          { title: "编辑" },
          s.createElement(g, {
            type: "text",
            size: "small",
            icon: y ? s.createElement(y) : void 0,
            onClick: (p) => {
              p.stopPropagation(), a(e);
            }
          })
        ) : null,
        n ? s.createElement(
          C,
          { title: "删除" },
          s.createElement(g, {
            type: "text",
            size: "small",
            danger: !0,
            icon: x ? s.createElement(x) : void 0,
            onClick: (p) => {
              p.stopPropagation(), n(e);
            }
          })
        ) : null
      ) : null
    ),
    // Description
    s.createElement(
      Z,
      {
        type: "secondary",
        style: { fontSize: 12, margin: 0, marginBottom: 10, lineHeight: 1.5 },
        ellipsis: { rows: 2 }
      },
      e.description
    ),
    // Member avatars
    s.createElement(
      "div",
      {
        style: {
          display: "flex",
          gap: 6,
          marginBottom: 10,
          flexWrap: "wrap"
        }
      },
      ..._.map(
        (p) => s.createElement(
          C,
          {
            key: p.name,
            title: `${p.name}（${p.role}）${p.found ? "" : " - 未创建"}`
          },
          s.createElement(
            "div",
            {
              style: {
                display: "flex",
                alignItems: "center",
                gap: 4,
                padding: "2px 8px",
                borderRadius: 12,
                background: p.found ? "#f0f5ff" : "#f0f0ff",
                border: `1px solid ${p.found ? "#d6e4ff" : "#d3adf7"}`,
                fontSize: 11
              }
            },
            s.createElement(Ae, { name: p.name, size: 18 }),
            s.createElement(
              U,
              {
                style: { fontSize: 11, color: p.found ? "#1f4e8c" : "#531dab" }
              },
              p.name
            )
          )
        )
      )
    ),
    // Toggle flow diagram
    s.createElement(
      g,
      {
        type: "link",
        size: "small",
        style: { padding: "0 0 4px 0", fontSize: 11, height: "auto" },
        onClick: (p) => {
          p.stopPropagation(), X(!W);
        },
        icon: W ? B ? s.createElement(B) : "▲" : j ? s.createElement(j) : "▼"
      },
      W ? "收起流程" : "查看执行流程"
    ),
    W ? s.createElement(Dl, { team: e }) : null,
    // Footer: launch button
    s.createElement(
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
      s.createElement(
        U,
        { type: "secondary", style: { fontSize: 11 } },
        G ? `协调者: ${G}` : ""
      ),
      s.createElement(
        g,
        {
          type: "primary",
          size: "small",
          icon: v ? s.createElement(v) : void 0,
          disabled: !P,
          onClick: () => l(e),
          style: Oe
        },
        "发起团队任务"
      )
    )
  );
}
function Gl({
  agents: e,
  onLaunch: t
}) {
  const l = A().React, { useMemo: a, useState: n, useCallback: s, useEffect: r } = l, {
    Row: o,
    Col: m,
    Input: c,
    Empty: g,
    Typography: C,
    Tag: w,
    Button: v,
    Divider: b,
    Tabs: y,
    message: x,
    Popconfirm: j
  } = A().antd, { SearchOutlined: B, TeamOutlined: U, PlusOutlined: Z, RocketOutlined: W } = A().antdIcons || {}, { Text: X } = C, [M, T] = n(""), [_, F] = n([]), [G, P] = n([]), [E, p] = n(!1), [R, q] = n(!1), [H, ie] = n(null);
  r(() => {
    F(St());
    let J = !0;
    return jl().then((Y) => {
      J && (Y ? (P(Y), p(!1)) : p(!0));
    }), () => {
      J = !1;
    };
  }, []);
  const z = s(() => {
    F(St());
  }, []), f = s(
    (J) => {
      const ue = St().filter((k) => k.id !== J.id);
      Yn(ue), F(ue), x.success(`团队「${J.name}」已删除`);
    },
    [x]
  ), d = s((J) => {
    ie(J), q(!0);
  }, []), I = s(() => {
    ie(null), q(!0);
  }, []), ae = a(() => [..._, ...G], [_, G]), $ = a(() => {
    if (!M.trim()) return ae;
    const J = M.toLowerCase();
    return ae.filter(
      (Y) => Y.name.toLowerCase().includes(J) || Y.description.toLowerCase().includes(J) || Y.category.toLowerCase().includes(J)
    );
  }, [ae, M]), K = $.filter((J) => J.custom), le = $.filter((J) => !J.custom);
  return l.createElement(
    "div",
    null,
    // Workflow status card (OMP-backed)
    l.createElement(Nl),
    E ? l.createElement(A().antd.Alert, {
      type: "warning",
      showIcon: !0,
      message: "预设专家团加载失败",
      description: "请确认 UGSci 后端插件已启用，然后刷新页面。",
      style: { marginBottom: 16 }
    }) : null,
    // Info banner
    l.createElement(
      "div",
      {
        style: {
          marginBottom: 16,
          padding: "12px 16px",
          background: "linear-gradient(135deg, #f6ffed 0%, #f0fff0 100%)",
          borderRadius: 8,
          border: "1px solid #b7eb8f",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }
      },
      l.createElement(
        X,
        { style: { fontSize: 13, color: "#389e0d" } },
        "OMP 驱动的专家团工作流 — 5 阶段状态机（规划→分派→验证→综合→完成），支持结构化交接、角色工具隔离、fork 并行执行和自动重试。"
      ),
      l.createElement(
        v,
        {
          type: "primary",
          size: "small",
          icon: Z ? l.createElement(Z) : void 0,
          onClick: I,
          style: Oe
        },
        "创建专家团"
      )
    ),
    // Search
    l.createElement(c, {
      placeholder: "搜索团队名称、描述或类别...",
      prefix: B ? l.createElement(B) : void 0,
      value: M,
      onChange: (J) => T(J.target.value),
      allowClear: !0,
      style: { marginBottom: 16, maxWidth: 400 }
    }),
    // Tabs: preset teams vs custom teams
    l.createElement(
      y,
      {
        defaultActiveKey: "preset",
        items: [
          {
            key: "preset",
            label: `预设团队${le.length ? ` (${le.length})` : ""}`,
            children: l.createElement(
              "div",
              null,
              le.length > 0 ? l.createElement(
                o,
                { gutter: [12, 12] },
                ...le.map(
                  (J) => l.createElement(
                    m,
                    { key: J.id, xs: 24, sm: 12, md: 8 },
                    l.createElement(On, {
                      team: J,
                      agents: e,
                      onLaunch: t
                    })
                  )
                )
              ) : l.createElement(g, {
                description: "未找到匹配的预设团队",
                image: g.PRESENTED_IMAGE_SIMPLE
              })
            )
          },
          {
            key: "custom",
            label: `自定义团队${K.length ? ` (${K.length})` : ""}`,
            children: l.createElement(
              "div",
              null,
              K.length > 0 ? l.createElement(
                o,
                { gutter: [12, 12] },
                ...K.map(
                  (J) => l.createElement(
                    m,
                    { key: J.id, xs: 24, sm: 12, md: 8 },
                    l.createElement(On, {
                      team: J,
                      agents: e,
                      onLaunch: t,
                      onEdit: d,
                      onDelete: f
                    })
                  )
                )
              ) : l.createElement(g, {
                description: "暂无自定义团队，点击「创建专家团」自定义",
                image: g.PRESENTED_IMAGE_SIMPLE
              })
            )
          }
        ]
      }
    ),
    // Team Builder Modal
    l.createElement(Fl, {
      open: R,
      onClose: () => {
        q(!1), ie(null);
      },
      agents: e,
      editingTeam: H,
      onSaved: z
    })
  );
}
function Hl() {
  var pe;
  const e = A().React, { useState: t, useEffect: l, useCallback: a, useMemo: n } = e, {
    Spin: s,
    Empty: r,
    Input: o,
    Button: m,
    message: c,
    Row: g,
    Col: C,
    Tabs: w,
    Modal: v,
    Typography: b
  } = A().antd, {
    ReloadOutlined: y,
    PlusOutlined: x,
    SearchOutlined: j,
    TeamOutlined: B,
    UserOutlined: U
  } = A().antdIcons || {}, { Text: Z, Paragraph: W } = b, [X, M] = t([]), [T, _] = t(!0), [F, G] = t(!1), [P, E] = t(null), [p, R] = t(""), [q, H] = t(!1), [ie, z] = t("experts"), [f, d] = t(
    null
  ), [I, ae] = t(""), [$, K] = t(!1), [le, J] = t(!1), [Y, ue] = t(null), [k, te] = t([]), D = a(async () => {
    _(!0);
    try {
      const N = await Gt(), ye = await Promise.all(
        N.map(async (se) => {
          try {
            const [ve, Ie, ke] = await Promise.all([
              Ht(se.id).catch(() => null),
              Ot(se.id).catch(() => []),
              Kt(se.id).catch(() => [])
            ]);
            return {
              agent: se,
              config: ve,
              skills: Ie,
              mcps: ke,
              loading: !1
            };
          } catch {
            return {
              agent: se,
              config: null,
              skills: [],
              mcps: [],
              loading: !1
            };
          }
        })
      );
      M(ye), te(N);
    } catch (N) {
      c.error(N.message || "加载专家列表失败"), M([]);
    } finally {
      _(!1);
    }
  }, []);
  l(() => {
    D();
  }, [D]), l(() => {
    if (Y && le) {
      const N = X.find(
        (ye) => ye.agent.id === Y.agent.id
      );
      N && N !== Y && ue(N);
    }
  }, [X, Y, le]);
  const Q = a(
    async (N) => {
      var Ie;
      const ye = N.coordinatorName || ((Ie = N.members[0]) == null ? void 0 : Ie.name);
      let se = null;
      if (ye && (se = kt(k, ye)), !se) {
        const ke = k[0];
        if (ke)
          se = ke.id, c.warning(
            `未找到专家「${ye || "协调者"}」，将使用「${ke.name}」作为工作流控制器。控制器将通过 spawn_subagent 分派子任务。`
          );
        else {
          c.error("没有可用的 Agent 作为工作流控制器");
          return;
        }
      }
      if (/\{.+?\}/.test(N.taskTemplate)) {
        ae(N.taskTemplate), d(N);
        return;
      }
      await h(N, se, N.taskTemplate);
    },
    [k, c]
  ), h = a(
    async (N, ye, se) => {
      K(!0);
      try {
        const ve = se || N.taskTemplate;
        let Ie = N.name;
        N.custom && (Ie = `@${await Ml(N)}`);
        const ke = `/ugsci-team ${N.mode} ${Ie} ${ve}`, Fe = A();
        Fe.setSelectedAgent && Fe.setSelectedAgent(ye);
        const Pe = await $l(
          ye,
          ke,
          N.name
        );
        c.success(
          `OMP 工作流已启动：${N.name}（${N.mode}模式）`
        ), d(null), me(`/chat/${Pe}`);
      } catch (ve) {
        c.error(ve.message || "发起团队任务失败");
      } finally {
        K(!1);
      }
    },
    [c]
  ), me = (N) => {
    window.history.pushState({}, "", N), window.dispatchEvent(new PopStateEvent("popstate"));
  }, u = a((N) => {
    E(N), G(!0);
  }, []), ce = a((N) => {
    ue(N), J(!0);
  }, []), ge = a(
    (N) => {
      if (!N.agent.enabled) {
        c.warning(`专家「${N.agent.name}」未启用，请先启用`);
        return;
      }
      try {
        const ye = A();
        ye.setSelectedAgent && ye.setSelectedAgent(N.agent.id);
      } catch (ye) {
        console.warn("[ugsci] Failed to set selected agent:", ye);
      }
      c.success(`已召唤专家「${N.agent.name}」，正在跳转至对话...`), me("/chat");
    },
    [c]
  ), fe = n(() => {
    if (!p.trim()) return X;
    const N = p.toLowerCase();
    return X.filter(
      (ye) => {
        var se;
        return ye.agent.name.toLowerCase().includes(N) || ((se = ye.agent.description) == null ? void 0 : se.toLowerCase().includes(N)) || ye.agent.id.toLowerCase().includes(N) || ye.skills.some((ve) => ve.name.toLowerCase().includes(N));
      }
    );
  }, [X, p]), ne = X.filter((N) => N.agent.enabled).length, V = X.reduce(
    (N, ye) => N + ye.skills.filter((se) => se.enabled !== !1).length,
    0
  ), S = X.reduce((N, ye) => N + ye.mcps.length, 0), re = [
    {
      key: "experts",
      label: e.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        U ? e.createElement(U, { style: { fontSize: 14 } }) : null,
        "专家列表"
      ),
      children: e.createElement(
        "div",
        null,
        // Search bar
        e.createElement(
          "div",
          { style: { marginBottom: 16 } },
          e.createElement(o, {
            placeholder: "搜索专家名称、描述或技能...",
            prefix: j ? e.createElement(j) : void 0,
            value: p,
            onChange: (N) => R(N.target.value),
            allowClear: !0,
            style: { maxWidth: 400 }
          })
        ),
        // Content
        T ? e.createElement(
          "div",
          { style: { textAlign: "center", padding: 60 } },
          e.createElement(s, { size: "large" })
        ) : fe.length === 0 ? e.createElement(r, {
          description: p ? "未找到匹配的专家" : "暂无专家，点击「创建专家」添加"
        }) : e.createElement(
          g,
          { gutter: [12, 12], align: "stretch" },
          ...fe.map(
            (N) => e.createElement(
              C,
              {
                key: N.agent.id,
                xs: 24,
                sm: 12,
                md: 8,
                lg: 6,
                style: { display: "flex" }
              },
              e.createElement(Tl, {
                expert: N,
                onClick: () => u(N),
                onSummon: () => ge(N),
                onConfigure: () => ce(N)
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
        B ? e.createElement(B, { style: { fontSize: 14 } }) : null,
        "专家团"
      ),
      children: e.createElement(Gl, {
        agents: k,
        onLaunch: Q
      })
    }
  ];
  return e.createElement(
    "div",
    { style: { padding: 24 } },
    e.createElement(It, {
      title: "专家",
      subtitle: `共 ${X.length} 位专家（${ne} 位启用）· ${V} 个技能 · ${S} 个 MCP 客户端`,
      extra: e.createElement(
        e.Fragment,
        null,
        e.createElement(
          m,
          {
            icon: y ? e.createElement(y) : void 0,
            onClick: () => {
              tt(), D();
            },
            loading: T
          },
          "刷新"
        ),
        e.createElement(
          m,
          {
            type: "primary",
            icon: x ? e.createElement(x) : void 0,
            onClick: () => H(!0),
            style: Oe
          },
          "创建专家"
        )
      )
    }),
    e.createElement(w, {
      items: re,
      activeKey: ie,
      onChange: (N) => z(N)
    }),
    // Drawer
    e.createElement(zl, {
      expert: P,
      open: F,
      onClose: () => G(!1),
      onRefresh: () => D()
    }),
    // Template Modal
    e.createElement(Il, {
      open: q,
      onClose: () => H(!1),
      onCreated: () => D()
    }),
    // Config Modal (gear icon)
    e.createElement(xl, {
      expert: Y,
      open: le,
      onClose: () => J(!1),
      onRefresh: () => D()
    }),
    // Team Launch Modal (for filling placeholders)
    f ? e.createElement(
      v,
      {
        open: !0,
        title: e.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 8 } },
          e.createElement(qt, {
            members: f.members.map((N) => N.name),
            size: 28
          }),
          e.createElement(
            "span",
            null,
            `发起团队任务 - ${f.name}`
          )
        ),
        onCancel: () => d(null),
        onOk: () => {
          var ve;
          const N = f.coordinatorName || ((ve = f.members[0]) == null ? void 0 : ve.name), ye = N ? kt(k, N) : null;
          if (!ye) {
            c.error("无法找到协调者专家");
            return;
          }
          const se = I.trim() || f.taskTemplate;
          h(f, ye, se);
        },
        confirmLoading: $,
        okText: "发起任务",
        width: 600
      },
      e.createElement(
        "div",
        null,
        e.createElement(
          Z,
          {
            type: "secondary",
            style: { fontSize: 12, display: "block", marginBottom: 8 }
          },
          "任务内容（请替换 {参数名} 等占位符后发起）："
        ),
        e.createElement(o.TextArea, {
          value: I,
          onChange: (N) => ae(N.target.value),
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
          Z,
          { style: { fontSize: 12, color: "#0958d9" } },
          `协调者: ${f.coordinatorName || ((pe = f.members[0]) == null ? void 0 : pe.name) || "—"} · 成员: ${f.members.map((N) => N.name).join("、")}`
        )
      )
    ) : null
  );
}
const Zn = [
  "console",
  "dingtalk",
  "feishu",
  "wechat",
  "wecom",
  "discord",
  "telegram",
  "qq",
  "imessage",
  "mattermost",
  "matrix",
  "onebot",
  "mqtt",
  "voice",
  "sip",
  "xiaoyi"
], Wl = {
  console: "Console",
  dingtalk: "DingTalk",
  feishu: "Feishu",
  wechat: "WeChat",
  wecom: "WeCom",
  discord: "Discord",
  telegram: "Telegram",
  qq: "QQ",
  imessage: "iMessage",
  mattermost: "Mattermost",
  matrix: "Matrix",
  onebot: "OneBot",
  mqtt: "MQTT",
  voice: "Voice",
  sip: "SIP",
  xiaoyi: "XiaoYi"
};
function He(e) {
  return (e || "").trim() || "channel";
}
function Qe(e) {
  return (e || "").trim();
}
function ea(e) {
  const t = Qe(e);
  return t === "" || t === "*";
}
function At(e) {
  return e === "user" ? "user" : "all";
}
function De(e) {
  const t = At(e.subject_type);
  return {
    source_type: He(e.source_type),
    source_value: Qe(e.source_value),
    subject_type: t,
    subject_value: t === "all" ? "" : (e.subject_value || "").trim(),
    effect: e.effect
  };
}
function Ze(e) {
  return { tool_name: e.tool_name || "*", ...De(e) };
}
function ta(e) {
  return { tool_name: e.tool_name || "*", effect: e.effect };
}
function na(e) {
  return [...e].map(De).sort(
    (t, l) => t.source_type.localeCompare(l.source_type) || t.source_value.localeCompare(l.source_value) || t.subject_type.localeCompare(l.subject_type) || t.subject_value.localeCompare(l.subject_value)
  );
}
function _t(e) {
  return [...e].map(Ze).sort(
    (t, l) => t.tool_name.localeCompare(l.tool_name) || t.source_type.localeCompare(l.source_type) || t.source_value.localeCompare(l.source_value) || t.subject_type.localeCompare(l.subject_type) || t.subject_value.localeCompare(l.subject_value)
  );
}
function aa(e) {
  return [...e].map(ta).sort((t, l) => t.tool_name.localeCompare(l.tool_name));
}
function Le(e) {
  return {
    default_effect: e.default_effect || "deny",
    client_overrides: na(e.client_overrides || []),
    tool_defaults: aa(e.tool_defaults || []),
    tool_overrides: _t(e.tool_overrides || []),
    unmanaged_rules_count: e.unmanaged_rules_count || 0
  };
}
function Me(e) {
  return [He(e.source_type), Qe(e.source_value), At(e.subject_type), e.subject_type === "all" ? "" : (e.subject_value || "").trim()].join("\0");
}
function Re(e) {
  return [e.tool_name || "*", He(e.source_type), Qe(e.source_value), At(e.subject_type), e.subject_type === "all" ? "" : (e.subject_value || "").trim()].join("\0");
}
function Jl(e, t) {
  const l = Le(t), a = /* @__PURE__ */ new Map();
  l.tool_overrides.forEach((c) => {
    const g = Ze(c), C = a.get(g.tool_name) || [];
    C.push(g), a.set(g.tool_name, C);
  });
  const n = new Map(l.tool_defaults.map((c) => [c.tool_name, ta(c)])), s = new Set(e.map((c) => c.name)), r = e.map((c) => {
    var g;
    return {
      toolName: c.name,
      description: c.description,
      inputSchema: c.input_schema,
      stale: !1,
      defaultEffect: ((g = n.get(c.name)) == null ? void 0 : g.effect) || l.default_effect,
      hasExplicitDefault: n.has(c.name),
      rules: _t(a.get(c.name) || [])
    };
  }), o = /* @__PURE__ */ new Set([...a.keys(), ...n.keys()]), m = Array.from(o).filter((c) => c !== "*" && !s.has(c)).map((c) => {
    var g;
    return {
      toolName: c,
      description: "",
      inputSchema: {},
      stale: !0,
      defaultEffect: ((g = n.get(c)) == null ? void 0 : g.effect) || l.default_effect,
      hasExplicitDefault: n.has(c),
      rules: _t(a.get(c) || [])
    };
  });
  return [...r, ...m];
}
function la(e, t) {
  const l = Le(e), a = new Set(
    t === null ? l.client_overrides.map((n) => Me(De(n))) : l.tool_overrides.filter((n) => n.tool_name === t).map((n) => Re(Ze(n)))
  );
  for (const n of Zn) {
    const s = t === null ? Me({ source_type: "channel", source_value: n, subject_type: "all", subject_value: "" }) : Re({ tool_name: t, source_type: "channel", source_value: n, subject_type: "all", subject_value: "" });
    if (!a.has(s)) return n;
  }
  return "console";
}
function Xl(e) {
  return Ut(e, { source_type: "channel", source_value: la(e, null), subject_type: "all", subject_value: "", effect: "ask" });
}
function Kl(e, t) {
  return Nt(e, { tool_name: t, source_type: "channel", source_value: la(e, t), subject_type: "all", subject_value: "", effect: "ask" });
}
function Ut(e, t, l) {
  const a = Le(e), n = De(t), s = Me(l || n), r = Me(n), o = a.client_overrides.filter((m) => {
    const c = Me(De(m));
    return c !== s && c !== r;
  });
  return o.push(n), { ...a, client_overrides: na(o) };
}
function Nt(e, t, l) {
  const a = Le(e), n = Ze(t), s = Re(l || n), r = Re(n), o = a.tool_overrides.filter((m) => {
    const c = Re(Ze(m));
    return c !== s && c !== r;
  });
  return o.push(n), { ...a, tool_overrides: _t(o) };
}
function ql(e, t, l) {
  const a = Le(e), n = a.tool_defaults.filter((s) => s.tool_name !== t);
  return n.push({ tool_name: t, effect: l }), { ...a, tool_defaults: aa(n) };
}
function Vl(e, t) {
  const l = Le(e), a = Me(t);
  return { ...l, client_overrides: l.client_overrides.filter((n) => Me(De(n)) !== a) };
}
function Yl(e, t) {
  const l = Le(e), a = Re(t);
  return { ...l, tool_overrides: l.tool_overrides.filter((n) => Re(Ze(n)) !== a) };
}
function sa(e, t) {
  const l = He(t.source_type), a = Qe(t.source_value);
  if (ea(a)) return [];
  const n = /* @__PURE__ */ new Map();
  return e.forEach((s) => {
    if (He(s.source_type) !== l || Qe(s.source_value) !== a) return;
    const r = (s.subject_value || "").trim();
    !r || n.has(r) || n.set(r, s);
  }), Array.from(n.values());
}
function Ql(e, t) {
  return sa(e, t).map((l) => ({ label: l.subject_value, value: l.subject_value }));
}
function Yt(e) {
  return He(e.source_type) === "channel" && ea(e.source_value) && At(e.subject_type) === "user" && !!(e.subject_value || "").trim();
}
function Zl(e, t) {
  const l = De(t);
  return l.subject_type === "user" && !!l.subject_value && l.subject_value !== "*" && e.some((a) => He(a.source_type) === l.source_type) && !Yt(l) && !sa(e, l).some((a) => a.subject_value === l.subject_value);
}
function es(e) {
  const t = [...e.client_overrides || [], ...e.tool_overrides || []];
  for (const l of t) {
    const a = De(l);
    if (a.subject_type === "user") {
      if (!a.subject_value || a.subject_value === "*" || !a.source_value) return { reason: "missingUserValue", rule: l };
      if (Yt(a)) return { reason: "ambiguousUserSource", rule: l };
    }
  }
  return null;
}
function An(e, t) {
  const l = { ...e, ...t };
  return t.subject_type && (l.subject_value = ""), (t.source_type !== void 0 || t.source_value !== void 0) && t.subject_value === void 0 && l.subject_type === "user" && (l.subject_value = ""), l;
}
function Bt(e) {
  return JSON.stringify(Le(e));
}
function ts({
  client: e,
  agentId: t,
  open: l,
  onClose: a,
  onSave: n
}) {
  const s = A().React, { useState: r, useEffect: o, useMemo: m, useCallback: c } = s, { Modal: g, Spin: C, Empty: w, Button: v, Tag: b, Segmented: y, Select: x, Input: j, AutoComplete: B, Typography: U, message: Z } = A().antd, { PlusOutlined: W, DeleteOutlined: X, ReloadOutlined: M } = A().antdIcons || {}, { Text: T } = U, [_, F] = r(null), [G, P] = r([]), [E, p] = r([]), [R, q] = r(!1), [H, ie] = r(!1), [z, f] = r(""), [d, I] = r(!1), [ae, $] = r(""), K = c(async () => {
    if (!e.enabled) {
      f("MCP 客户端未启用，无法获取工具列表");
      return;
    }
    I(!0), f("");
    try {
      const u = await Ha(t, e.key);
      P(u);
    } catch (u) {
      f((u == null ? void 0 : u.message) || "无法加载工具列表"), P([]);
    } finally {
      I(!1);
    }
  }, [t, e.key, e.enabled]);
  o(() => {
    if (!l) return;
    let u = !1;
    return (async () => {
      q(!0), P([]), p([]), f("");
      try {
        const ge = await Wa(t, e.key);
        if (!u) {
          const fe = Le(ge);
          F(fe), $(Bt(fe));
        }
        try {
          const fe = await Xa(t);
          u || p(fe);
        } catch {
          u || p([]);
        }
      } catch {
        u || (F(null), $(""), f("加载访问策略失败"));
      } finally {
        u || q(!1);
      }
    })(), () => {
      u = !0;
    };
  }, [l, e.key, e.enabled, t]);
  const le = m(() => _ ? Jl(G, _) : [], [G, _]), J = m(() => !!(_ && Bt(_) !== ae), [_, ae]), Y = (u) => Wl[u] || u, ue = c((u) => {
    F((ce) => ce && { ...ce, default_effect: u });
  }, []), k = c((u, ce) => {
    F((ge) => ge && Ut(ge, An(u, ce), { source_type: u.source_type, source_value: u.source_value, subject_type: u.subject_type, subject_value: u.subject_value }));
  }, []), te = c((u, ce) => {
    F((ge) => ge && Nt(ge, An(u, ce), { tool_name: u.tool_name, source_type: u.source_type, source_value: u.source_value, subject_type: u.subject_type, subject_value: u.subject_value }));
  }, []), D = c(async () => {
    if (!_) return;
    const u = es(_);
    if (u) {
      Z.error(u.reason === "missingUserValue" ? "用户规则缺少用户标识" : "用户来源不明确");
      return;
    }
    ie(!0);
    try {
      await n(e.key, _) && ($(Bt(_)), a());
    } finally {
      ie(!1);
    }
  }, [_, e.key, n, a, Z]), Q = c(() => {
    if (!J || H) {
      a();
      return;
    }
    g.confirm({
      title: "放弃修改",
      content: "确定要放弃未保存的修改吗？",
      okText: "确认",
      cancelText: "取消",
      onOk: a
    });
  }, [J, H, a]), h = c((u, ce) => {
    const ge = Ql(E, u), fe = Yt(u), ne = Zl(E, u), V = [{ label: "所有渠道", value: "*" }, ...Zn.map((se) => ({ label: Y(se), value: se }))], S = [{ label: "所有人", value: "all" }, { label: "指定用户", value: "user" }], re = (se) => {
      ce ? te(u, se) : k(u, se);
    }, pe = (se) => {
      F(ce ? (ve) => ve && Nt(ve, { ...u, effect: se }) : (ve) => ve && Ut(ve, { ...u, effect: se }));
    }, N = () => {
      F(ce ? (se) => se && Yl(se, { tool_name: u.tool_name, source_type: u.source_type, source_value: u.source_value, subject_type: u.subject_type, subject_value: u.subject_value }) : (se) => se && Vl(se, { source_type: u.source_type, source_value: u.source_value, subject_type: u.subject_type, subject_value: u.subject_value }));
    }, ye = ce ? Re(u) : Me(u);
    return s.createElement(
      "div",
      { key: ye, style: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr auto", gap: 6, alignItems: "end", padding: "6px 0", borderBottom: "1px solid #f5f5f5" } },
      // source_type
      s.createElement(
        "div",
        null,
        s.createElement(T, { style: { fontSize: 11, color: "#999", display: "block", marginBottom: 2 } }, "来源类型"),
        s.createElement(x, {
          size: "small",
          style: { width: "100%" },
          value: u.source_type || "channel",
          onChange: (se) => re({ source_type: se, source_value: se === "channel" ? u.source_value || "*" : u.source_value }),
          options: [{ label: "渠道", value: "channel" }, ...u.source_type && u.source_type !== "channel" ? [{ label: u.source_type, value: u.source_type }] : []]
        })
      ),
      // source_value
      s.createElement(
        "div",
        null,
        s.createElement(T, { style: { fontSize: 11, color: "#999", display: "block", marginBottom: 2 } }, "来源"),
        u.source_type === "channel" ? s.createElement(x, { size: "small", style: { width: "100%" }, value: u.source_value || "*", onChange: (se) => re({ source_value: se }), options: V }) : s.createElement(j, { size: "small", placeholder: "来源标识", value: u.source_value, onChange: (se) => re({ source_value: se.target.value }) })
      ),
      // subject_type
      s.createElement(
        "div",
        null,
        s.createElement(T, { style: { fontSize: 11, color: "#999", display: "block", marginBottom: 2 } }, "对象类型"),
        s.createElement(x, { size: "small", style: { width: "100%" }, value: u.subject_type, onChange: (se) => re({ subject_type: se }), options: S })
      ),
      // subject_value
      s.createElement(
        "div",
        null,
        s.createElement(T, { style: { fontSize: 11, color: "#999", display: "block", marginBottom: 2 } }, "对象"),
        u.subject_type === "user" ? s.createElement(
          "div",
          null,
          s.createElement(B, {
            size: "small",
            style: { width: "100%" },
            value: u.subject_value,
            options: ge,
            placeholder: ge.length > 0 ? "用户 ID" : "无近期用户",
            onChange: (se) => re({ subject_value: se }),
            onSelect: (se) => re({ subject_value: se }),
            filterOption: (se, ve) => String((ve == null ? void 0 : ve.value) || "").toLowerCase().includes(se.toLowerCase())
          }),
          fe ? s.createElement(T, { style: { fontSize: 10, color: "#fa8c16", display: "block" } }, "请先选择具体渠道") : null,
          ne ? s.createElement(T, { style: { fontSize: 10, color: "#fa8c16", display: "block" } }, "未知的用户标识") : null
        ) : s.createElement(j, { size: "small", disabled: !0, value: "所有人" })
      ),
      // effect
      s.createElement(
        "div",
        null,
        s.createElement(T, { style: { fontSize: 11, color: "#999", display: "block", marginBottom: 2 } }, "效果"),
        s.createElement(x, {
          size: "small",
          style: { width: "100%" },
          value: u.effect,
          onChange: (se) => pe(se),
          options: [{ label: "允许", value: "allow" }, { label: "询问", value: "ask" }, { label: "拒绝", value: "deny" }]
        })
      ),
      // delete
      s.createElement(v, { size: "small", type: "text", icon: s.createElement(X), onClick: N, title: "删除规则" })
    );
  }, [E, k, te]), me = (u, ce) => {
    const fe = {
      ask: { bg: "rgba(245,158,11,0.24)", border: "rgba(217,119,6,0.36)", text: "#8a4b00" },
      allow: { bg: "rgba(34,197,94,0.22)", border: "rgba(22,163,74,0.35)", text: "#17643a" },
      deny: { bg: "rgba(239,68,68,0.2)", border: "rgba(220,38,38,0.34)", text: "#9f1f26" }
    }[u];
    return s.createElement(y, {
      size: "small",
      value: u,
      onChange: (ne) => ce(ne),
      style: { "--mcp-policy-segment-bg": fe.bg, "--mcp-policy-segment-border": fe.border, "--mcp-policy-segment-text": fe.text },
      options: [{ label: "询问", value: "ask" }, { label: "允许", value: "allow" }, { label: "拒绝", value: "deny" }]
    });
  };
  return s.createElement(
    g,
    {
      title: `${e.name || e.key} - 工具与访问策略`,
      open: l,
      onCancel: Q,
      width: "min(1040px, calc(100vw - 32px))",
      styles: {
        body: {
          maxHeight: "min(520px, calc(100vh - 280px))",
          overflowY: "auto",
          overflowX: "hidden"
        }
      },
      footer: s.createElement(
        "div",
        { style: { textAlign: "right" } },
        s.createElement(v, { onClick: Q, style: { marginRight: 8 } }, "取消"),
        s.createElement(v, { type: "primary", onClick: D, loading: H, disabled: !_ || R }, "保存")
      )
    },
    R && !_ ? s.createElement("div", { style: { textAlign: "center", padding: 40 } }, s.createElement(C)) : _ ? s.createElement(
      "div",
      null,
      // ── Client-level panel ──
      s.createElement(
        "div",
        { style: { marginBottom: 16, padding: "12px 16px", background: "#fafafa", borderRadius: 8, border: "1px solid #f0f0f0" } },
        s.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 } },
          s.createElement(T, { strong: !0 }, "客户端访问策略"),
          s.createElement(
            "div",
            { style: { display: "flex", alignItems: "center", gap: 8 } },
            s.createElement(T, { style: { fontSize: 12, color: "#666" } }, "默认:"),
            me(_.default_effect, ue),
            s.createElement(v, { size: "small", icon: s.createElement(W), onClick: () => F((u) => u && Xl(u)) }, "添加规则")
          )
        ),
        _.client_overrides.length === 0 ? s.createElement(T, { style: { fontSize: 12, color: "#999" } }, "暂无客户端级覆盖规则") : s.createElement("div", null, ..._.client_overrides.map((u) => h(u, !1)))
      ),
      // ── Error message with retry button ──
      z ? s.createElement(
        "div",
        {
          style: {
            color: "#ff4d4f",
            fontSize: 12,
            marginBottom: 8,
            display: "flex",
            alignItems: "center",
            gap: 8
          }
        },
        s.createElement("span", null, z),
        s.createElement(
          v,
          {
            size: "small",
            icon: M ? s.createElement(M) : void 0,
            onClick: K,
            loading: d
          },
          "重试"
        )
      ) : null,
      // ── Tool-level panel ──
      s.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 } },
        s.createElement(T, { strong: !0 }, "工具访问策略"),
        s.createElement(
          v,
          {
            size: "small",
            type: "text",
            icon: M ? s.createElement(M) : void 0,
            onClick: K,
            loading: d
          },
          "刷新工具"
        )
      ),
      le.length === 0 ? s.createElement(w, {
        description: d ? "正在加载工具..." : "点击「刷新工具」加载工具列表"
      }) : s.createElement(
        "div",
        null,
        ...le.map(
          (u) => s.createElement(
            "div",
            { key: u.toolName, style: { marginBottom: 12, padding: "10px 12px", background: "#fafafa", borderRadius: 6, border: "1px solid #f0f0f0" } },
            s.createElement(
              "div",
              { style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 } },
              s.createElement(
                "div",
                { style: { display: "flex", alignItems: "center", gap: 6 } },
                s.createElement(b, { color: u.stale ? "default" : "blue" }, u.toolName),
                u.stale ? s.createElement(b, { color: "orange" }, "已失效") : null
              ),
              s.createElement(
                "div",
                { style: { display: "flex", alignItems: "center", gap: 8 } },
                s.createElement(T, { style: { fontSize: 12, color: "#666" } }, "默认:"),
                me(u.defaultEffect, (ce) => F((ge) => ge && ql(ge, u.toolName, ce))),
                s.createElement(v, { size: "small", icon: s.createElement(W), onClick: () => F((ce) => ce && Kl(ce, u.toolName)) }, "添加规则")
              )
            ),
            // Tool schema
            u.description || u.inputSchema && Object.keys(u.inputSchema).length > 0 ? s.createElement(
              "details",
              { style: { marginBottom: 6, fontSize: 12 } },
              s.createElement("summary", { style: { cursor: "pointer", color: "#888" } }, "工具详情"),
              u.description ? s.createElement("div", { style: { padding: "4px 0", color: "#666" } }, u.description) : null,
              u.inputSchema && Object.keys(u.inputSchema).length > 0 ? s.createElement("pre", { style: { background: "#f5f5f5", padding: 8, borderRadius: 4, fontSize: 11, overflow: "auto", maxHeight: 200 } }, JSON.stringify(u.inputSchema, null, 2)) : null
            ) : null,
            // Tool rules
            u.rules.length === 0 ? s.createElement(T, { style: { fontSize: 12, color: "#999" } }, "暂无工具级覆盖规则") : s.createElement("div", null, ...u.rules.map((ce) => h(ce, !0)))
          )
        )
      )
    ) : s.createElement("div", { style: { color: "#ff4d4f" } }, "加载访问策略失败")
  );
}
function ns({
  client: e,
  agentId: t,
  open: l,
  onClose: a,
  onAuthChanged: n
}) {
  var H, ie, z, f, d;
  const s = A().React, { useState: r, useCallback: o, useEffect: m } = s, { Modal: c, Button: g, Input: C, Typography: w, message: v } = A().antd, { Text: b } = w, [y, x] = r("idle"), [j, B] = r(""), [U, Z] = r(!1), [W, X] = r(((H = e.oauth_status) == null ? void 0 : H.client_id) || ""), [M, T] = r(((ie = e.oauth_status) == null ? void 0 : ie.scope) || ""), [_, F] = r(""), [G, P] = r("");
  m(() => {
    if (y !== "waiting") return;
    const I = setInterval(async () => {
      try {
        (await qa(t, e.key)).authorized && (x("success"), n());
      } catch {
      }
    }, 2e3);
    return () => clearInterval(I);
  }, [y, e.key, t, n]);
  const E = y === "success" || y === "idle" && ((z = e.oauth_status) == null ? void 0 : z.authorized) === !0, p = y === "idle" && ((f = e.oauth_status) == null ? void 0 : f.authorized) && e.oauth_status.expires_at > 0 && e.oauth_status.expires_at < Date.now() / 1e3, R = o(async () => {
    var I;
    if (!((I = e.url) != null && I.trim())) {
      B("缺少 URL");
      return;
    }
    x("starting"), B("");
    try {
      const ae = await Ka(t, e.key, {
        url: e.url,
        scope: M,
        client_id: W,
        auth_endpoint: _,
        token_endpoint: G
      });
      x("waiting"), window.open(ae.auth_url, "_blank", "popup,width=600,height=700");
    } catch (ae) {
      x("error"), B((ae == null ? void 0 : ae.message) || "OAuth 启动失败");
    }
  }, [t, e.key, e.url, M, W, _, G]), q = o(async () => {
    x("revoking");
    try {
      await Va(t, e.key), x("idle"), n();
    } catch {
      x("idle");
    }
  }, [t, e.key, n]);
  return s.createElement(
    c,
    {
      title: `${e.name || e.key} — OAuth 授权管理`,
      open: l,
      onCancel: a,
      footer: s.createElement("div", { style: { textAlign: "right" } }, s.createElement(g, { onClick: a }, "关闭")),
      width: 560
    },
    s.createElement(
      "div",
      { style: { background: "#f8f9fa", border: "1px solid #e9ecef", borderRadius: 8, padding: "12px 14px" } },
      // Status
      s.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 8 } },
        s.createElement(
          "span",
          { style: { fontSize: 12, padding: "2px 8px", borderRadius: 12, border: "1px solid", color: p ? "#e67e22" : E ? "#27ae60" : "#7f8c8d", borderColor: p ? "#e67e22" : E ? "#27ae60" : "#7f8c8d", background: "white" } },
          p ? "已过期" : E ? "已授权" : y === "waiting" ? "等待授权..." : y === "error" ? "授权失败" : "未授权"
        ),
        s.createElement(
          "div",
          { style: { display: "flex", gap: 8 } },
          E || p ? s.createElement(g, { size: "small", onClick: q, loading: String(y) === "revoking" }, "撤销") : null,
          s.createElement(g, { size: "small", type: E && !p ? "default" : "primary", onClick: R, loading: y === "starting" || y === "waiting", disabled: !((d = e.url) != null && d.trim()) }, E && !p ? "重新授权" : "授权")
        )
      ),
      j ? s.createElement("p", { style: { color: "#c0392b", fontSize: 12 } }, j) : null,
      // Advanced
      s.createElement(
        "div",
        { style: { marginTop: 8, cursor: "pointer", color: "#888", fontSize: 12 }, onClick: () => Z((I) => !I) },
        U ? "收起高级设置" : "展开高级设置"
      ),
      U ? s.createElement(
        "div",
        { style: { marginTop: 8, padding: "10px 12px", background: "white", borderRadius: 6, border: "1px solid #e9ecef" } },
        s.createElement(b, { style: { fontSize: 11, color: "#888", display: "block", marginBottom: 2 } }, "Client ID"),
        s.createElement(C, { size: "small", placeholder: "留空则使用动态注册", value: W, onChange: (I) => X(I.target.value) }),
        s.createElement(b, { style: { fontSize: 11, color: "#888", display: "block", marginBottom: 2, marginTop: 8 } }, "Scope"),
        s.createElement(C, { size: "small", placeholder: "OAuth scope", value: M, onChange: (I) => T(I.target.value) }),
        s.createElement(b, { style: { fontSize: 11, color: "#888", display: "block", marginBottom: 2, marginTop: 8 } }, "授权端点"),
        s.createElement(C, { size: "small", placeholder: "https://auth.example.com/authorize", value: _, onChange: (I) => F(I.target.value) }),
        s.createElement(b, { style: { fontSize: 11, color: "#888", display: "block", marginBottom: 2, marginTop: 8 } }, "令牌端点"),
        s.createElement(C, { size: "small", placeholder: "https://auth.example.com/token", value: G, onChange: (I) => P(I.target.value) })
      ) : null
    )
  );
}
function as({
  mcp: e,
  agentId: t,
  onToggle: l,
  onDelete: a,
  onUpdate: n,
  onUpdatePolicy: s,
  onRefresh: r
}) {
  const o = A().React, { useState: m } = o, { Card: c, Tag: g, Tooltip: C, Modal: w, Input: v, Button: b, Typography: y } = A().antd, { Text: x } = y, {
    EyeOutlined: j,
    EyeInvisibleOutlined: B,
    DeleteOutlined: U,
    ToolOutlined: Z
  } = A().antdIcons || {}, [W, X] = m(!1), [M, T] = m(!1), [_, F] = m(!1), [G, P] = m(""), [E, p] = m(!1), [R, q] = m(!1), H = e.transport === "streamable_http" || e.transport === "sse", ie = H ? "Remote" : "Local", z = e.oauth_status, f = Date.now() / 1e3, d = !!(z != null && z.authorized) && z.expires_at > f, I = !!(z != null && z.authorized) && z.expires_at <= f, ae = !!z, $ = () => {
    P(JSON.stringify(e, null, 2)), p(!1), X(!0);
  }, K = async () => {
    try {
      const J = JSON.parse(G), Y = [
        "name",
        "description",
        "command",
        "enabled",
        "transport",
        "url",
        "headers",
        "args",
        "env",
        "cwd"
      ], ue = {};
      for (const te of Y)
        te in J && (ue[te] = J[te]);
      await n(e.key, ue) && (X(!1), p(!1));
    } catch {
      alert("JSON 格式错误");
    }
  }, le = JSON.stringify(e, null, 2);
  return o.createElement(
    o.Fragment,
    null,
    o.createElement(
      c,
      {
        hoverable: !0,
        onClick: $,
        size: "small",
        style: {
          cursor: "pointer",
          borderColor: e.enabled ? void 0 : "#d9d9d9",
          opacity: e.enabled ? 1 : 0.7,
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
      // ── Header: name + type badge + oauth icons + status ──
      o.createElement(
        "div",
        { style: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 } },
        o.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 6, minWidth: 0 } },
          o.createElement(
            C,
            { title: e.name },
            o.createElement(x, { strong: !0, style: { fontSize: 14, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" } }, e.name || e.key)
          ),
          o.createElement(
            "span",
            { style: { fontSize: 10, padding: "1px 6px", borderRadius: 4, background: H ? "#e6f4ff" : "#f9f0ff", color: H ? "#1677ff" : "#722ed1", flexShrink: 0 } },
            ie
          ),
          // OAuth status icons
          ae && I ? o.createElement("span", { style: { fontSize: 11, color: "#e67e22", flexShrink: 0 } }, "⚠") : null,
          ae && d ? o.createElement("span", { style: { fontSize: 11, color: "#27ae60", flexShrink: 0 } }, "✓") : null,
          ae && !d && !I ? o.createElement("span", { style: { fontSize: 11, color: "#7f8c8d", flexShrink: 0 } }, "🔒") : null
        ),
        o.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 4, fontSize: 11, flexShrink: 0 } },
          o.createElement("span", { style: { width: 6, height: 6, borderRadius: "50%", background: e.enabled ? "#52c41a" : "#d9d9d9" } }),
          e.enabled ? "启用" : "停用"
        )
      ),
      // ── Description ──
      o.createElement(
        "p",
        { style: { fontSize: 12, color: "#666", margin: "6px 0 8px", lineHeight: 1.6, minHeight: 36, overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" } },
        e.description || "-"
      ),
      // ── Footer: tools button + secondary actions ──
      o.createElement(
        "div",
        { style: { display: "flex", flexDirection: "column", gap: 8, marginTop: "auto", paddingTop: 12, borderTop: "1px solid #f0f0f0" } },
        // Tools button
        o.createElement(
          b,
          {
            size: "small",
            icon: Z ? o.createElement(Z) : void 0,
            onClick: (J) => {
              J.stopPropagation(), F(!0);
            },
            style: { width: "100%" }
          },
          "工具与访问策略"
        ),
        // Secondary actions: oauth (remote only) + toggle + delete
        o.createElement(
          "div",
          { style: { display: "grid", gridTemplateColumns: H ? "1fr 1fr 1fr" : "1fr 1fr", gap: 8 } },
          H ? o.createElement(
            b,
            {
              size: "small",
              onClick: (J) => {
                J.stopPropagation(), q(!0);
              },
              style: {
                color: d ? "#27ae60" : I ? "#e67e22" : void 0,
                borderColor: d ? "#27ae60" : I ? "#e67e22" : void 0,
                background: d ? "rgba(39,174,96,0.06)" : I ? "rgba(230,126,34,0.06)" : void 0
              }
            },
            d ? "已授权" : I ? "已过期" : "授权"
          ) : null,
          o.createElement(
            b,
            {
              size: "small",
              icon: e.enabled ? B ? o.createElement(B) : void 0 : j ? o.createElement(j) : void 0,
              onClick: l
            },
            e.enabled ? "禁用" : "启用"
          ),
          o.createElement(
            b,
            {
              size: "small",
              danger: !0,
              icon: U ? o.createElement(U) : void 0,
              onClick: (J) => {
                J.stopPropagation(), T(!0);
              }
            },
            "删除"
          )
        )
      )
    ),
    // ── Delete Confirmation Modal ──
    o.createElement(
      w,
      {
        title: "确认删除",
        open: M,
        onOk: () => {
          T(!1), a();
        },
        onCancel: () => T(!1),
        okText: "确认删除",
        cancelText: "取消",
        okButtonProps: { danger: !0 }
      },
      o.createElement("p", null, `确定要删除 MCP 客户端「${e.name || e.key}」吗？此操作不可撤销。`)
    ),
    // ── JSON Config Modal (click card to view/edit) ──
    o.createElement(
      w,
      {
        title: `${e.name || e.key} - 配置`,
        open: W,
        onCancel: () => {
          X(!1), p(!1);
        },
        footer: o.createElement(
          "div",
          { style: { textAlign: "right" } },
          o.createElement(b, { onClick: () => {
            X(!1), p(!1);
          }, style: { marginRight: 8 } }, "取消"),
          E ? o.createElement(b, { type: "primary", onClick: K }, "保存") : o.createElement(b, { type: "primary", onClick: () => p(!0) }, "编辑")
        ),
        width: 700
      },
      o.createElement(
        "div",
        { style: { marginBottom: 8, fontSize: 12, color: "#8c8c8c" } },
        "密钥类字段（如 API_KEY）可能已被后端脱敏，保存时不会覆盖脱敏值。"
      ),
      E ? o.createElement(v.TextArea, {
        value: G,
        onChange: (J) => P(J.target.value),
        autoSize: { minRows: 15, maxRows: 25 },
        style: { fontFamily: "Monaco, Courier New, monospace", fontSize: 13 }
      }) : o.createElement(
        "pre",
        { style: { backgroundColor: "#f5f5f5", padding: 16, borderRadius: 8, maxHeight: 400, overflow: "auto", fontSize: 13, fontFamily: "Monaco, Courier New, monospace" } },
        le
      )
    ),
    // ── Access Modal (tools + access policy) ──
    o.createElement(ts, {
      client: e,
      agentId: t,
      open: _,
      onClose: () => F(!1),
      onSave: s
    }),
    // ── OAuth Modal (remote clients only) ──
    H ? o.createElement(ns, {
      client: e,
      agentId: t,
      open: R,
      onClose: () => q(!1),
      onAuthChanged: async () => {
        await (r == null ? void 0 : r());
      }
    }) : null
  );
}
const Dt = {
  reservoir_simulation: "油藏数值模拟",
  geological_modeling: "地质建模",
  well_log_analysis: "测井分析",
  production_engineering: "采油工程",
  post_processing: "后处理与可视化",
  multiphysics: "多物理场仿真"
}, oa = {
  reservoir_simulation: "🛢️",
  geological_modeling: "🏔️",
  well_log_analysis: "📡",
  production_engineering: "⚙️",
  post_processing: "📊",
  multiphysics: "🔬"
}, ra = /* @__PURE__ */ new Set(["cmg", "comsol", "tnavigator", "eclipse", "intersect", "visage"]);
function ia(e) {
  return Ne(`/ugsci/engines/icon/${encodeURIComponent(e)}`);
}
async function ls() {
  return oe("/ugsci/engines/list");
}
async function ss(e) {
  return oe("/ugsci/engines/", {
    method: "POST",
    body: JSON.stringify(e)
  });
}
async function os(e, t) {
  return oe(`/ugsci/engines/${encodeURIComponent(e)}`, {
    method: "PUT",
    body: JSON.stringify(t)
  });
}
async function rs(e) {
  return oe(
    `/ugsci/engines/${encodeURIComponent(e)}`,
    { method: "DELETE" }
  );
}
async function is() {
  return oe("/ugsci/engines/detect/refresh", {
    method: "POST"
  });
}
function cs({
  engine: e,
  onClick: t
}) {
  const l = A().React, { Card: a, Tag: n, Typography: s } = A().antd, { Text: r } = s, o = e.status === "detected", m = oa[e.category] || "📦", g = ra.has(e.id) ? l.createElement("img", {
    src: ia(e.id),
    alt: e.name,
    style: { width: 24, height: 24, objectFit: "contain" }
  }) : l.createElement("span", { style: { fontSize: 20 } }, m);
  return l.createElement(
    a,
    {
      hoverable: !0,
      onClick: t,
      size: "small",
      style: {
        cursor: "pointer",
        borderColor: o ? void 0 : "#d9d9d9",
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
        g,
        l.createElement(
          "div",
          null,
          l.createElement(
            r,
            { strong: !0, style: { fontSize: 14 } },
            e.name
          ),
          l.createElement("br"),
          l.createElement(
            r,
            { type: "secondary", style: { fontSize: 11 } },
            e.vendor || "—"
          )
        )
      ),
      l.createElement(
        "div",
        { style: { display: "flex", flexDirection: "column", gap: 4, alignItems: "flex-end" } },
        o ? l.createElement(
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
        r,
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
        Dt[e.category] || e.category
      ) : null,
      e.version ? l.createElement(
        n,
        { color: "blue", style: { fontSize: 11 } },
        `v${e.version}`
      ) : null,
      ...(e.modules || []).map(
        (C) => l.createElement(
          n,
          { key: C, color: "cyan", style: { fontSize: 10 } },
          C
        )
      )
    )
  );
}
function ms() {
  const e = A().React, { useState: t, useEffect: l, useCallback: a, useMemo: n } = e, {
    Spin: s,
    Empty: r,
    Button: o,
    message: m,
    Row: c,
    Col: g,
    Drawer: C,
    Descriptions: w,
    Tag: v,
    Typography: b,
    Modal: y,
    Input: x,
    Select: j,
    Popconfirm: B,
    Space: U
  } = A().antd, {
    ReloadOutlined: Z,
    SearchOutlined: W,
    PlusOutlined: X,
    EditOutlined: M,
    DeleteOutlined: T,
    CopyOutlined: _,
    ExperimentOutlined: F
  } = A().antdIcons || {}, { Text: G, Paragraph: P } = b, [E, p] = t([]), [R, q] = t(!0), [H, ie] = t(""), [z, f] = t(!1), [d, I] = t(null), [ae, $] = t(!1), [K, le] = t(null), [J, Y] = t({}), [ue, k] = t(!1), te = a(async () => {
    q(!0);
    try {
      const ne = await ls();
      p(ne.engines || []);
    } catch (ne) {
      m.error(ne.message || "加载引擎列表失败"), p([]);
    } finally {
      q(!1);
    }
  }, []);
  l(() => {
    te();
  }, [te]);
  const D = n(() => {
    if (!H.trim()) return E;
    const ne = H.toLowerCase();
    return E.filter(
      (V) => {
        var S;
        return V.name.toLowerCase().includes(ne) || V.vendor.toLowerCase().includes(ne) || V.category.toLowerCase().includes(ne) || ((S = V.description) == null ? void 0 : S.toLowerCase().includes(ne));
      }
    );
  }, [E, H]);
  E.filter((ne) => ne.status === "detected").length;
  const Q = a((ne) => {
    navigator.clipboard.writeText(ne).then(() => m.success("路径已复制")).catch(() => m.error("复制失败"));
  }, []), h = a(() => {
    le(null), Y({
      name: "",
      vendor: "",
      version: "",
      executable_path: "",
      category: "",
      description: "",
      invocation_hint: ""
    }), $(!0);
  }, []), me = a((ne) => {
    le(ne), Y({ ...ne }), $(!0), f(!1);
  }, []), u = a(async () => {
    var ne;
    if (!((ne = J.name) != null && ne.trim())) {
      m.warning("请输入引擎名称");
      return;
    }
    k(!0);
    try {
      K ? (await os(K.id, J), m.success("引擎已更新")) : (await ss(J), m.success("引擎已添加")), $(!1), te();
    } catch (V) {
      m.error(V.message || "保存失败");
    } finally {
      k(!1);
    }
  }, [J, K, te]), ce = a(
    async (ne) => {
      try {
        await rs(ne), m.success("引擎已删除"), f(!1), te();
      } catch (V) {
        m.error(V.message || "删除失败");
      }
    },
    [te]
  ), ge = a(async () => {
    q(!0);
    try {
      const ne = await is();
      p(ne.engines || []), m.success("自动检测完成");
    } catch (ne) {
      m.error(ne.message || "检测失败");
    } finally {
      q(!1);
    }
  }, []), fe = a(
    (ne, V, S) => {
      const re = J[V] || "";
      return e.createElement(
        "div",
        { style: { marginBottom: 12 } },
        e.createElement(
          G,
          { style: { fontSize: 13, display: "block", marginBottom: 4 } },
          ne
        ),
        S != null && S.select ? e.createElement(j, {
          value: re || void 0,
          onChange: (pe) => Y((N) => ({ ...N, [V]: pe })),
          style: { width: "100%" },
          options: S.select.options,
          allowClear: !0,
          placeholder: `选择${ne}`
        }) : S != null && S.textarea ? e.createElement(x.TextArea, {
          value: re,
          onChange: (pe) => Y((N) => ({ ...N, [V]: pe.target.value })),
          rows: 3,
          placeholder: `输入${ne}`
        }) : e.createElement(x, {
          value: re,
          onChange: (pe) => Y((N) => ({ ...N, [V]: pe.target.value })),
          placeholder: `输入${ne}`
        })
      );
    },
    [J]
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
        prefix: W ? e.createElement(W) : void 0,
        value: H,
        onChange: (ne) => ie(ne.target.value),
        allowClear: !0,
        style: { maxWidth: 280 }
      }),
      e.createElement(
        o,
        {
          icon: Z ? e.createElement(Z) : void 0,
          onClick: ge,
          loading: R
        },
        "自动检测"
      ),
      e.createElement(
        o,
        {
          type: "primary",
          icon: X ? e.createElement(X) : void 0,
          onClick: h,
          style: Oe
        },
        "添加引擎"
      )
    ),
    // Content
    R ? e.createElement(
      "div",
      { style: { textAlign: "center", padding: 60 } },
      e.createElement(s, {
        size: "large",
        tip: "正在加载计算引擎..."
      })
    ) : D.length === 0 ? e.createElement(r, {
      description: H ? "无匹配引擎" : "暂无引擎，点击「添加引擎」开始"
    }) : e.createElement(
      c,
      { gutter: [12, 12], align: "stretch" },
      ...D.map(
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
          e.createElement(cs, {
            engine: ne,
            onClick: () => {
              I(ne), f(!0);
            }
          })
        )
      )
    ),
    // Detail drawer
    d ? e.createElement(
      C,
      {
        title: e.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 8 } },
          e.createElement(
            "span",
            { style: { display: "flex", alignItems: "center" } },
            ra.has(d.id) ? e.createElement("img", {
              src: ia(d.id),
              alt: d.name,
              style: { width: 20, height: 20, objectFit: "contain" }
            }) : e.createElement(
              "span",
              { style: { fontSize: 18 } },
              oa[d.category] || "📦"
            )
          ),
          e.createElement("span", null, d.name)
        ),
        open: z,
        onClose: () => f(!1),
        width: 520,
        extra: e.createElement(
          U,
          null,
          e.createElement(
            o,
            {
              size: "small",
              icon: M ? e.createElement(M) : void 0,
              onClick: () => me(d)
            },
            "编辑"
          ),
          d.is_default ? null : e.createElement(
            B,
            {
              title: "确认删除此引擎？",
              description: d.name,
              onConfirm: () => ce(d.id),
              okText: "删除",
              cancelText: "取消",
              okButtonProps: { danger: !0 }
            },
            e.createElement(
              o,
              {
                size: "small",
                danger: !0,
                icon: T ? e.createElement(T) : void 0
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
          d.name
        ),
        e.createElement(
          w.Item,
          { label: "厂商" },
          d.vendor || "—"
        ),
        e.createElement(
          w.Item,
          { label: "分类" },
          d.category ? Dt[d.category] || d.category : "—"
        ),
        e.createElement(
          w.Item,
          { label: "状态" },
          e.createElement(
            v,
            {
              color: d.status === "detected" ? "success" : d.status === "not_found" ? "error" : "default"
            },
            d.status === "detected" ? "✅ 已检测" : d.status === "not_found" ? "❌ 路径无效" : "🔧 待配置"
          )
        ),
        e.createElement(
          w.Item,
          { label: "版本" },
          d.version || "—"
        ),
        d.executable_path ? e.createElement(
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
              d.executable_path
            ),
            e.createElement(
              o,
              {
                size: "small",
                type: "text",
                icon: _ ? e.createElement(_) : void 0,
                onClick: () => Q(d.executable_path)
              }
            )
          )
        ) : null,
        d.install_dir ? e.createElement(
          w.Item,
          { label: "安装目录" },
          e.createElement(
            "code",
            { style: { fontSize: 12, wordBreak: "break-all" } },
            d.install_dir
          )
        ) : null,
        // Display detected modules with paths
        d.modules && d.modules.length > 0 ? e.createElement(
          w.Item,
          { label: "已检测模块" },
          e.createElement(
            "div",
            { style: { display: "flex", flexDirection: "column", gap: 4 } },
            ...d.modules.map(
              (ne) => e.createElement(
                "div",
                {
                  key: ne,
                  style: { display: "flex", alignItems: "center", gap: 8 }
                },
                e.createElement(
                  v,
                  { color: "cyan", style: { fontSize: 11 } },
                  ne
                ),
                d.module_paths && d.module_paths[ne] ? e.createElement(
                  "code",
                  { style: { fontSize: 11, wordBreak: "break-all" } },
                  d.module_paths[ne]
                ) : null
              )
            )
          )
        ) : null,
        d.license_server ? e.createElement(
          w.Item,
          { label: "许可证服务器" },
          d.license_server
        ) : null,
        e.createElement(
          w.Item,
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
          G,
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
          v,
          { color: "blue" },
          "默认引擎"
        ) : d.is_custom ? e.createElement(
          v,
          { color: "purple" },
          "自定义引擎"
        ) : null
      )
    ) : null,
    // Add/Edit modal
    e.createElement(
      y,
      {
        title: K ? "编辑引擎" : "添加计算引擎",
        open: ae,
        onOk: u,
        onCancel: () => $(!1),
        okText: K ? "保存" : "添加",
        cancelText: "取消",
        confirmLoading: ue,
        width: 560
      },
      e.createElement(
        "div",
        { style: { maxHeight: 480, overflow: "auto", paddingRight: 8 } },
        fe("引擎名称 *", "name"),
        fe("厂商", "vendor"),
        fe("版本", "version"),
        fe("可执行文件路径", "executable_path"),
        fe("安装目录", "install_dir"),
        fe("分类", "category", {
          select: {
            options: Object.entries(Dt).map(([ne, V]) => ({
              label: V,
              value: ne
            }))
          }
        }),
        fe("描述", "description", { textarea: !0 }),
        fe("调用方式提示", "invocation_hint", { textarea: !0 }),
        fe("许可证服务器", "license_server")
      )
    )
  );
}
function ds() {
  const e = A().React, { useState: t, useEffect: l, useCallback: a, useMemo: n } = e, {
    Spin: s,
    Empty: r,
    Input: o,
    Button: m,
    message: c,
    Row: g,
    Col: C,
    Tabs: w,
    Modal: v
  } = A().antd, {
    ReloadOutlined: b,
    PlusOutlined: y,
    SearchOutlined: x,
    ApiOutlined: j,
    RocketOutlined: B
  } = A().antdIcons || {}, { TextArea: U } = o, W = A().useSelectedAgent, X = W ? W() : null, M = (X == null ? void 0 : X.id) || "default";
  l(() => {
    Tt();
  }, [M]);
  const [T, _] = t([]), [F, G] = t(!0), [P, E] = t(""), [p, R] = t("mcp"), [q, H] = t(!1), [ie, z] = t(`{
  "mcpServers": {
    "example-client": {
      "command": "npx",
      "args": ["-y", "@example/mcp-server"],
      "env": {}
    }
  }
}`), [f, d] = t(!1), I = a(async () => {
    G(!0);
    try {
      const D = await Ua(M);
      _(D);
    } catch (D) {
      c.error(D.message || "加载 MCP 列表失败"), _([]);
    } finally {
      G(!1);
    }
  }, [M]);
  l(() => {
    I();
  }, [I]);
  const ae = a(
    async (D) => {
      try {
        await Na(M, D.key), c.success(D.enabled ? "已禁用" : "已启用"), I();
      } catch (Q) {
        c.error(Q.message || "切换状态失败");
      }
    },
    [M, I]
  ), $ = a(async (D) => {
    try {
      await Da(M, D.key), c.success(`MCP「${D.key}」已删除`), I();
    } catch (Q) {
      c.error(Q.message || "删除失败");
    }
  }, [M, I]), K = a(async () => {
    d(!0);
    try {
      const D = JSON.parse(ie), Q = D.mcpServers || D, h = Object.entries(Q);
      if (h.length === 0) {
        c.warning("未找到 MCP 客户端配置");
        return;
      }
      let me = !0;
      for (const [u, ce] of h) {
        const ge = ce, fe = ge.url ? "streamable_http" : "stdio", ne = {
          name: ge.name || u,
          description: ge.description || "",
          enabled: !0,
          transport: fe,
          url: ge.url || "",
          command: ge.command || "",
          args: ge.args || [],
          env: ge.env || {},
          cwd: ge.cwd || "",
          headers: ge.headers || {}
        };
        try {
          await Fa(
            M,
            u,
            ne
          );
        } catch {
          me = !1;
        }
      }
      me && (c.success("MCP 客户端已创建"), H(!1), I());
    } catch (D) {
      D instanceof SyntaxError ? c.error("JSON 格式错误：" + D.message) : c.error(D.message || "创建 MCP 失败");
    } finally {
      d(!1);
    }
  }, [ie, M, I]), le = n(() => {
    if (!P.trim()) return T;
    const D = P.toLowerCase();
    return T.filter(
      (Q) => {
        var h;
        return Q.name.toLowerCase().includes(D) || Q.key.toLowerCase().includes(D) || ((h = Q.description) == null ? void 0 : h.toLowerCase().includes(D)) || Q.transport.toLowerCase().includes(D);
      }
    );
  }, [T, P]), J = T.filter((D) => D.enabled).length, Y = T.reduce((D, Q) => {
    var h;
    return D + (((h = Q.tools) == null ? void 0 : h.length) || 0);
  }, 0), ue = (D) => {
    window.history.pushState({}, "", D), window.dispatchEvent(new PopStateEvent("popstate"));
  }, k = e.createElement(
    e.Fragment,
    null,
    e.createElement(
      "div",
      {
        style: {
          marginBottom: 16,
          display: "flex",
          gap: 8,
          alignItems: "center"
        }
      },
      e.createElement(o, {
        placeholder: "搜索能力名称、描述...",
        prefix: x ? e.createElement(x) : void 0,
        value: P,
        onChange: (D) => E(D.target.value),
        allowClear: !0,
        style: { maxWidth: 400 }
      }),
      e.createElement(
        m,
        {
          type: "primary",
          icon: y ? e.createElement(y) : void 0,
          onClick: () => H(!0),
          style: Oe
        },
        "添加 MCP"
      ),
      e.createElement(
        m,
        {
          icon: j ? e.createElement(j) : void 0,
          onClick: () => ue("/mcp")
        },
        "前往 MCP 管理"
      )
    ),
    F ? e.createElement(
      "div",
      { style: { textAlign: "center", padding: 60 } },
      e.createElement(s, { size: "large" })
    ) : le.length === 0 ? e.createElement(r, {
      description: P ? "未找到匹配的能力" : "暂无 MCP 客户端，点击「添加 MCP」创建"
    }) : e.createElement(
      g,
      { gutter: [12, 12], align: "stretch" },
      ...le.map(
        (D) => e.createElement(
          C,
          {
            key: D.key,
            xs: 24,
            sm: 12,
            md: 8,
            lg: 6,
            style: { display: "flex" }
          },
          e.createElement(as, {
            mcp: D,
            agentId: M,
            onToggle: (Q) => {
              Q.stopPropagation(), ae(D);
            },
            onDelete: () => {
              $(D);
            },
            onUpdate: async (Q, h) => {
              try {
                return await Ga(M, Q, h), c.success("MCP 配置已更新"), I(), !0;
              } catch (me) {
                return c.error(me.message || "更新 MCP 失败"), !1;
              }
            },
            onUpdatePolicy: async (Q, h) => {
              try {
                return await Ja(M, Q, h), c.success("访问策略已保存"), I(), !0;
              } catch (me) {
                return c.error(me.message || "保存访问策略失败"), !1;
              }
            },
            onRefresh: async () => {
              I();
            }
          })
        )
      )
    )
  ), te = [
    {
      key: "mcp",
      label: e.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        j ? e.createElement(j, { style: { fontSize: 14 } }) : null,
        "MCP 客户端"
      ),
      children: k
    },
    {
      key: "software",
      label: e.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        B ? e.createElement(B, { style: { fontSize: 14 } }) : null,
        "计算引擎"
      ),
      children: e.createElement(ms)
    }
  ];
  return e.createElement(
    "div",
    { style: { padding: 24 } },
    e.createElement(It, {
      title: "工具",
      subtitle: `MCP: ${T.length} 个客户端（${J} 个启用）· ${Y} 个工具`,
      extra: e.createElement(
        e.Fragment,
        null,
        e.createElement(
          m,
          {
            icon: b ? e.createElement(b) : void 0,
            onClick: () => {
              tt(), I();
            },
            loading: F
          },
          "刷新"
        )
      )
    }),
    e.createElement(w, {
      items: te,
      activeKey: p,
      onChange: (D) => R(D)
    }),
    // ── Create MCP Modal (mirror console /mcp JSON import) ──
    e.createElement(
      v,
      {
        title: "添加 MCP 客户端 (JSON)",
        open: q,
        onCancel: () => H(!1),
        onOk: K,
        confirmLoading: f,
        okText: "创建",
        cancelText: "取消",
        width: 700
      },
      e.createElement(
        "div",
        { style: { marginBottom: 8, fontSize: 12, color: "#8c8c8c" } },
        "支持格式: ",
        e.createElement("code", null, '{ "mcpServers": { "key": {...} } }'),
        " 或 ",
        e.createElement("code", null, '{ "key": {...} }')
      ),
      e.createElement(U, {
        value: ie,
        onChange: (D) => z(D.target.value),
        autoSize: { minRows: 12, maxRows: 20 },
        style: { fontFamily: "Monaco, Courier New, monospace", fontSize: 13 }
      })
    )
  );
}
function us({
  agentId: e,
  agentName: t,
  onNavigate: l
}) {
  const a = A().React, { useState: n, useEffect: s, useCallback: r } = a, {
    Spin: o,
    Empty: m,
    Button: c,
    Row: g,
    Col: C,
    Card: w,
    Tag: v,
    Checkbox: b,
    Modal: y,
    Typography: x,
    Drawer: j,
    Descriptions: B,
    message: U
  } = A().antd, {
    ReloadOutlined: Z,
    ThunderboltOutlined: W,
    SettingOutlined: X,
    CheckSquareOutlined: M,
    EyeOutlined: T,
    EyeInvisibleOutlined: _,
    DeleteOutlined: F,
    CloseOutlined: G
  } = A().antdIcons || {}, { Text: P, Paragraph: E } = x, [p, R] = n([]), [q, H] = n(!0), [ie, z] = n(!1), [f, d] = n(null), [I, ae] = n(!1), [$, K] = n(
    /* @__PURE__ */ new Set()
  ), [le, J] = n(!1), [Y, ue] = n(null), [k, te] = n(!1), D = r(async () => {
    if (e) {
      H(!0);
      try {
        const S = await Ot(e);
        R(S);
      } catch (S) {
        U.error(S.message || "加载技能失败"), R([]);
      } finally {
        H(!1);
      }
    }
  }, [e]);
  s(() => {
    D();
  }, [D]);
  const Q = (S) => {
    K((re) => {
      const pe = new Set(re);
      return pe.has(S) ? pe.delete(S) : pe.add(S), pe;
    });
  }, h = () => K(/* @__PURE__ */ new Set()), me = () => K(new Set(p.map((S) => S.name))), u = () => {
    I ? (h(), ae(!1)) : ae(!0);
  }, ce = async () => {
    const S = Array.from($);
    if (S.length !== 0) {
      J(!0);
      try {
        const { results: re } = await nl(e, S), pe = Object.entries(re).filter(
          ([, ye]) => ye.success === !1
        ), N = S.length - pe.length;
        pe.length > 0 ? U.warning(
          `批量启用完成：成功 ${N} 个，失败 ${pe.length} 个`
        ) : U.success(`成功启用 ${S.length} 个技能`), h(), await D();
      } catch (re) {
        U.error(re.message || "批量启用失败");
      } finally {
        J(!1);
      }
    }
  }, ge = async () => {
    const S = Array.from($);
    if (S.length !== 0) {
      J(!0);
      try {
        const { results: re } = await al(e, S), pe = Object.entries(re).filter(
          ([, ye]) => ye.success === !1
        ), N = S.length - pe.length;
        pe.length > 0 ? U.warning(
          `批量停用完成：成功 ${N} 个，失败 ${pe.length} 个`
        ) : U.success(`成功停用 ${S.length} 个技能`), h(), await D();
      } catch (re) {
        U.error(re.message || "批量停用失败");
      } finally {
        J(!1);
      }
    }
  }, fe = () => {
    const S = Array.from($);
    S.length !== 0 && y.confirm({
      title: `确认删除 ${S.length} 个技能？`,
      content: "删除后技能将从当前专家工作区移除，此操作不可撤销。技能池中的原始技能不受影响。",
      okText: "确认删除",
      cancelText: "取消",
      okButtonProps: { danger: !0 },
      onOk: async () => {
        J(!0);
        try {
          const { results: re } = await ll(e, S), pe = Object.entries(re).filter(
            ([, ye]) => ye.success === !1
          ), N = S.length - pe.length;
          pe.length > 0 ? U.warning(
            `批量删除完成：成功 ${N} 个，失败 ${pe.length} 个`
          ) : U.success(`成功删除 ${S.length} 个技能`), h(), await D();
        } catch (re) {
          U.error(re.message || "批量删除失败");
        } finally {
          J(!1);
        }
      }
    });
  }, ne = async (S) => {
    te(!0);
    try {
      S.enabled === !1 ? (await Dn(e, S.name), U.success(`已启用技能「${S.name}」`)) : (await Hn(e, S.name), U.success(`已禁用技能「${S.name}」`)), await D();
    } catch (re) {
      U.error(re.message || "操作失败");
    } finally {
      te(!1);
    }
  }, V = (S) => {
    y.confirm({
      title: `确认删除技能「${S.name}」？`,
      content: "删除后技能将从当前专家工作区移除，此操作不可撤销。技能池中的原始技能不受影响。",
      okText: "确认删除",
      cancelText: "取消",
      okButtonProps: { danger: !0 },
      onOk: async () => {
        te(!0);
        try {
          await Xt(e, S.name), U.success(`已删除技能「${S.name}」`), await D();
        } catch (re) {
          U.error(re.message || "删除失败");
        } finally {
          te(!1);
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
        P,
        { type: "secondary", style: { fontSize: 13 } },
        I ? `已选择 ${$.size} / ${p.length} 个技能` : `共 ${p.length} 个技能`
      ),
      a.createElement(
        "div",
        { style: { display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" } },
        I ? a.createElement(
          a.Fragment,
          null,
          a.createElement(
            c,
            { size: "small", onClick: me },
            "全选"
          ),
          a.createElement(
            c,
            {
              size: "small",
              icon: G ? a.createElement(G) : void 0,
              onClick: h
            },
            "取消选择"
          ),
          a.createElement(
            c,
            {
              size: "small",
              type: "default",
              icon: T ? a.createElement(T) : void 0,
              disabled: $.size === 0 || le,
              loading: le,
              onClick: ce
            },
            "批量启用"
          ),
          a.createElement(
            c,
            {
              size: "small",
              danger: !0,
              icon: _ ? a.createElement(_) : void 0,
              disabled: $.size === 0 || le,
              loading: le,
              onClick: ge
            },
            "批量停用"
          ),
          a.createElement(
            c,
            {
              size: "small",
              danger: !0,
              icon: F ? a.createElement(F) : void 0,
              disabled: $.size === 0 || le,
              loading: le,
              onClick: fe
            },
            `删除 (${$.size})`
          ),
          a.createElement(
            c,
            {
              size: "small",
              type: "primary",
              onClick: u
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
              icon: M ? a.createElement(M) : void 0,
              onClick: u,
              disabled: p.length === 0
            },
            "批量管理"
          ),
          a.createElement(
            c,
            {
              icon: Z ? a.createElement(Z) : void 0,
              onClick: () => {
                tt(), D();
              }
            },
            "刷新"
          )
        )
      )
    ),
    q ? a.createElement(
      "div",
      { style: { textAlign: "center", padding: 60 } },
      a.createElement(o, { size: "large" })
    ) : p.length === 0 ? a.createElement(m, {
      description: "当前智能体未加载任何技能"
    }) : a.createElement(
      g,
      { gutter: [12, 12] },
      ...p.map(
        (S) => a.createElement(
          C,
          { key: S.name, xs: 24, sm: 12, md: 8, lg: 6 },
          a.createElement(
            w,
            {
              hoverable: !0,
              size: "small",
              style: {
                cursor: I ? "default" : "pointer",
                height: "100%",
                position: "relative",
                borderColor: I && $.has(S.name) ? "#0072f5" : void 0,
                borderWidth: I && $.has(S.name) ? 2 : 1
              },
              onClick: () => {
                I ? Q(S.name) : (d(S), z(!0));
              },
              onMouseEnter: () => {
                I || ue(S.name);
              },
              onMouseLeave: () => ue(null)
            },
            I ? a.createElement(
              "div",
              {
                style: {
                  position: "absolute",
                  top: 8,
                  right: 8,
                  zIndex: 1
                },
                onClick: (re) => {
                  re.stopPropagation(), Q(S.name);
                }
              },
              a.createElement(b, {
                checked: $.has(S.name)
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
              S.emoji ? a.createElement(
                "span",
                { style: { fontSize: 18 } },
                S.emoji
              ) : a.createElement(
                "span",
                { style: { fontSize: 18 } },
                "⚡"
              ),
              a.createElement(
                P,
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
                S.name
              ),
              S.enabled === !1 ? a.createElement(
                v,
                { color: "default", style: { fontSize: 10 } },
                "已禁用"
              ) : a.createElement(
                v,
                { color: "green", style: { fontSize: 10 } },
                "已启用"
              )
            ),
            S.description ? a.createElement(
              E,
              {
                type: "secondary",
                style: { fontSize: 11, margin: 0, lineHeight: 1.4 },
                ellipsis: { rows: 2 }
              },
              S.description
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
              S.version_text ? a.createElement(
                v,
                { style: { fontSize: 10 } },
                `v${S.version_text}`
              ) : null,
              ...(S.tags || []).slice(0, 3).map(
                (re, pe) => a.createElement(
                  v,
                  { key: pe, color: "blue", style: { fontSize: 10 } },
                  re
                )
              )
            ),
            // Hover action footer (not in batch mode)
            !I && Y === S.name ? a.createElement(
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
                  icon: S.enabled === !1 ? T ? a.createElement(T) : void 0 : _ ? a.createElement(_) : void 0,
                  disabled: k,
                  onClick: (re) => {
                    re.stopPropagation(), ne(S);
                  }
                },
                S.enabled === !1 ? "启用" : "禁用"
              ),
              a.createElement(
                c,
                {
                  size: "small",
                  danger: !0,
                  icon: F ? a.createElement(F) : void 0,
                  disabled: k,
                  onClick: (re) => {
                    re.stopPropagation(), V(S);
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
    f ? a.createElement(
      j,
      {
        title: a.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 8 } },
          a.createElement(
            "span",
            { style: { fontSize: 18 } },
            f.emoji || "⚡"
          ),
          a.createElement("span", null, f.name)
        ),
        open: ie,
        onClose: () => z(!1),
        width: 520,
        extra: a.createElement(
          c,
          {
            type: "primary",
            size: "small",
            icon: X ? a.createElement(X) : void 0,
            onClick: () => l("/skills")
          },
          "管理技能"
        )
      },
      a.createElement(
        B,
        { column: 1, bordered: !0, size: "small" },
        a.createElement(
          B.Item,
          { label: "技能名称" },
          f.name
        ),
        a.createElement(
          B.Item,
          { label: "描述" },
          f.description || "-"
        ),
        f.version_text ? a.createElement(
          B.Item,
          { label: "版本" },
          f.version_text
        ) : null,
        a.createElement(
          B.Item,
          { label: "来源" },
          f.source || "-"
        ),
        a.createElement(
          B.Item,
          { label: "状态" },
          f.enabled === !1 ? "已禁用" : "已启用"
        ),
        f.installed_from ? a.createElement(
          B.Item,
          { label: "安装来源" },
          f.installed_from
        ) : null
      ),
      // Tags
      f.tags && f.tags.length > 0 ? a.createElement(
        "div",
        { style: { marginTop: 16 } },
        a.createElement(
          P,
          {
            strong: !0,
            style: { display: "block", marginBottom: 8 }
          },
          "标签"
        ),
        a.createElement(
          "div",
          { style: { display: "flex", flexWrap: "wrap", gap: 4 } },
          ...f.tags.map(
            (S, re) => a.createElement(v, { key: re, color: "blue" }, S)
          )
        )
      ) : null,
      // Skill content preview
      f.content ? a.createElement(
        "div",
        { style: { marginTop: 16 } },
        a.createElement(
          P,
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
              background: "#f5f5f5",
              borderRadius: 6,
              fontSize: 12,
              whiteSpace: "pre-wrap"
            }
          },
          f.content.slice(0, 2e3) + (f.content.length > 2e3 ? `

... (内容已截断)` : "")
        )
      ) : null
    ) : null
  );
}
function ps({
  poolSkills: e,
  workspaceSkills: t,
  agents: l,
  loading: a,
  onReload: n,
  agentId: s,
  agentName: r
}) {
  const o = A().React, { useState: m, useMemo: c, useCallback: g } = o, {
    Spin: C,
    Empty: w,
    Input: v,
    Button: b,
    Row: y,
    Col: x,
    Card: j,
    Tag: B,
    Typography: U,
    Drawer: Z,
    Descriptions: W,
    List: X,
    Modal: M,
    message: T
  } = A().antd, {
    ReloadOutlined: _,
    SearchOutlined: F,
    DownloadOutlined: G,
    ThunderboltOutlined: P,
    DeleteOutlined: E,
    PlusOutlined: p
  } = A().antdIcons || {}, { Text: R, Paragraph: q } = U, [H, ie] = m(""), [z, f] = m(!1), [d, I] = m(null), [ae, $] = m([]), [K, le] = m(!1), [J, Y] = m(24), [ue, k] = m(null), [te, D] = m(!1), Q = c(() => {
    if (!H.trim()) return e;
    const V = H.toLowerCase();
    return e.filter(
      (S) => {
        var re, pe;
        return S.name.toLowerCase().includes(V) || ((re = S.description) == null ? void 0 : re.toLowerCase().includes(V)) || ((pe = S.tags) == null ? void 0 : pe.some((N) => N.toLowerCase().includes(V)));
      }
    );
  }, [e, H]), h = c(
    () => Q.slice(0, J),
    [Q, J]
  ), me = g((V) => {
    ie(V), Y(24);
  }, []), u = g(
    (V) => {
      const S = [];
      for (const re of t)
        if (re.skills.some((pe) => pe.name === V)) {
          const pe = l.find((N) => N.id === re.agent_id);
          S.push((pe == null ? void 0 : pe.name) || re.agent_name || re.agent_id);
        }
      return S;
    },
    [t, l]
  ), ce = g(
    async (V) => {
      if (I(V), $(u(V.name)), f(!0), !V.content) {
        le(!0);
        try {
          const S = await ja(V.name);
          I({ ...V, content: S });
        } catch {
        } finally {
          le(!1);
        }
      }
    },
    [u]
  ), ge = async (V) => {
    D(!0);
    try {
      await Jt(s, V.name), T.success(
        `已将技能「${V.name}」加载到当前专家「${r}」`
      ), n();
    } catch (S) {
      T.error(S.message || "加载技能失败");
    } finally {
      D(!1);
    }
  }, fe = (V) => {
    if (V.protected) {
      T.warning("内置技能不可删除");
      return;
    }
    M.confirm({
      title: `确认从技能池删除「${V.name}」？`,
      content: "删除后所有已安装此技能的专家将不受影响，但技能池中将不再包含此技能。此操作不可撤销。",
      okText: "确认删除",
      cancelText: "取消",
      okButtonProps: { danger: !0 },
      onOk: async () => {
        D(!0);
        try {
          await ol(V.name), T.success(`已从技能池删除「${V.name}」`), n();
        } catch (S) {
          T.error(S.message || "删除失败");
        } finally {
          D(!1);
        }
      }
    });
  }, ne = (V) => {
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
      o.createElement(v, {
        placeholder: "搜索技能名称、描述或标签...",
        prefix: F ? o.createElement(F) : void 0,
        value: H,
        onChange: (V) => me(V.target.value),
        allowClear: !0,
        style: { maxWidth: 400 }
      }),
      o.createElement(
        "div",
        { style: { display: "flex", gap: 8 } },
        o.createElement(
          b,
          {
            icon: _ ? o.createElement(_) : void 0,
            onClick: n,
            loading: a,
            size: "small"
          },
          "刷新"
        ),
        o.createElement(
          b,
          {
            type: "primary",
            icon: G ? o.createElement(G) : void 0,
            onClick: () => ne("/skill-pool"),
            size: "small",
            style: Oe
          },
          "管理技能池"
        )
      )
    ),
    a ? o.createElement(
      "div",
      { style: { textAlign: "center", padding: 60 } },
      o.createElement(C, { size: "large" })
    ) : Q.length === 0 ? o.createElement(w, {
      description: H ? "未找到匹配的技能" : "技能池为空"
    }) : o.createElement(
      o.Fragment,
      null,
      o.createElement(
        y,
        { gutter: [12, 12] },
        ...h.map(
          (V) => o.createElement(
            x,
            { key: V.name, xs: 24, sm: 12, md: 8, lg: 6 },
            o.createElement(
              j,
              {
                hoverable: !0,
                size: "small",
                style: { cursor: "pointer", height: "100%" },
                onClick: () => ce(V),
                onMouseEnter: () => k(V.name),
                onMouseLeave: () => k(null)
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
                  R,
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
                  B,
                  { color: "gold", style: { fontSize: 10 } },
                  "内置"
                ) : null
              ),
              V.description ? o.createElement(
                q,
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
                  B,
                  { style: { fontSize: 10 } },
                  `v${V.version_text}`
                ) : null,
                ...(V.tags || []).slice(0, 3).map(
                  (S, re) => o.createElement(
                    B,
                    { key: re, color: "cyan", style: { fontSize: 10 } },
                    S
                  )
                )
              ),
              // Hover action footer
              ue === V.name ? o.createElement(
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
                  b,
                  {
                    size: "small",
                    type: "primary",
                    icon: p ? o.createElement(p) : void 0,
                    disabled: te,
                    onClick: (S) => {
                      S.stopPropagation(), ge(V);
                    }
                  },
                  "加载到当前Agent"
                ),
                o.createElement(
                  b,
                  {
                    size: "small",
                    danger: !0,
                    icon: E ? o.createElement(E) : void 0,
                    disabled: te || V.protected,
                    onClick: (S) => {
                      S.stopPropagation(), fe(V);
                    }
                  },
                  "删除"
                )
              ) : null
            )
          )
        ),
        // Load more button
        h.length < Q.length ? o.createElement(
          "div",
          { style: { textAlign: "center", marginTop: 16 } },
          o.createElement(
            b,
            {
              onClick: () => Y((V) => V + 24),
              size: "small"
            },
            `加载更多 (剩余 ${Q.length - h.length} 个)`
          )
        ) : null
      )
    ),
    // Skill detail drawer
    d ? o.createElement(
      Z,
      {
        title: o.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 8 } },
          o.createElement(
            "span",
            { style: { fontSize: 18 } },
            d.emoji || "⚡"
          ),
          o.createElement("span", null, d.name)
        ),
        open: z,
        onClose: () => f(!1),
        width: 520,
        extra: o.createElement(
          b,
          {
            type: "primary",
            size: "small",
            icon: P ? o.createElement(P) : void 0,
            onClick: () => ne("/skills")
          },
          "管理技能"
        )
      },
      o.createElement(
        W,
        { column: 1, bordered: !0, size: "small" },
        o.createElement(
          W.Item,
          { label: "技能名称" },
          d.name
        ),
        o.createElement(
          W.Item,
          { label: "描述" },
          d.description || "-"
        ),
        d.version_text ? o.createElement(
          W.Item,
          { label: "版本" },
          d.version_text
        ) : null,
        o.createElement(
          W.Item,
          { label: "来源" },
          d.source || "-"
        ),
        o.createElement(
          W.Item,
          { label: "受保护" },
          d.protected ? "是（内置）" : "否"
        ),
        d.sync_status ? o.createElement(
          W.Item,
          { label: "同步状态" },
          d.sync_status
        ) : null,
        d.installed_from ? o.createElement(
          W.Item,
          { label: "安装来源" },
          d.installed_from
        ) : null
      ),
      // Tags
      d.tags && d.tags.length > 0 ? o.createElement(
        "div",
        { style: { marginTop: 16 } },
        o.createElement(
          R,
          {
            strong: !0,
            style: { display: "block", marginBottom: 8 }
          },
          "标签"
        ),
        o.createElement(
          "div",
          { style: { display: "flex", flexWrap: "wrap", gap: 4 } },
          ...d.tags.map(
            (V, S) => o.createElement(B, { key: S, color: "cyan" }, V)
          )
        )
      ) : null,
      // Installed agents
      o.createElement(
        "div",
        { style: { marginTop: 16 } },
        o.createElement(
          R,
          { strong: !0, style: { display: "block", marginBottom: 8 } },
          `已安装此技能的专家 (${ae.length})`
        ),
        ae.length > 0 ? o.createElement(X, {
          size: "small",
          dataSource: ae,
          renderItem: (V) => o.createElement(
            X.Item,
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
              o.createElement(Ae, { name: V, size: 20 }),
              o.createElement(
                R,
                { style: { fontSize: 13 } },
                V
              )
            )
          )
        }) : o.createElement(
          R,
          { type: "secondary", style: { fontSize: 12 } },
          "暂无专家安装此技能"
        )
      ),
      // Skill content preview (lazy-loaded)
      K ? o.createElement(
        "div",
        { style: { marginTop: 16, textAlign: "center" } },
        o.createElement(C, { size: "small" })
      ) : d.content ? o.createElement(
        "div",
        { style: { marginTop: 16 } },
        o.createElement(
          R,
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
function gs() {
  const e = A().React, { useState: t, useEffect: l, useCallback: a, useMemo: n } = e, { Tabs: s, message: r } = A().antd, { ThunderboltOutlined: o, AppstoreOutlined: m } = A().antdIcons || {}, g = A().useSelectedAgent, C = g ? g() : null, w = (C == null ? void 0 : C.id) || "default";
  l(() => {
    Tt();
  }, [w]);
  const [v, b] = t([]), [y, x] = t([]), [j, B] = t([]), [U, Z] = t(!0), [W, X] = t("agent-skills"), M = a(async () => {
    Z(!0);
    try {
      const [G, P, E] = await Promise.all([
        Wt(!0),
        Gt(),
        Ba()
      ]);
      x(G), b(P), B(E);
    } catch (G) {
      r.error(G.message || "加载技能列表失败"), x([]);
    } finally {
      Z(!1);
    }
  }, []);
  l(() => {
    M();
  }, [M]);
  const T = n(() => {
    const G = v.find((P) => P.id === w);
    return (G == null ? void 0 : G.name) || w;
  }, [v, w]), _ = (G) => {
    window.history.pushState({}, "", G), window.dispatchEvent(new PopStateEvent("popstate"));
  }, F = [
    {
      key: "agent-skills",
      label: e.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        o ? e.createElement(o, { style: { fontSize: 14 } }) : null,
        "当前Agent加载技能"
      ),
      children: e.createElement(us, {
        agentId: w,
        agentName: T,
        onNavigate: _
      })
    },
    {
      key: "skill-pool",
      label: e.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        m ? e.createElement(m, { style: { fontSize: 14 } }) : null,
        "技能池"
      ),
      children: e.createElement(ps, {
        poolSkills: y,
        workspaceSkills: j,
        agents: v,
        loading: U,
        onReload: M,
        agentId: w,
        agentName: T
      })
    }
  ];
  return e.createElement(
    "div",
    { style: { padding: 24 } },
    e.createElement(It, {
      title: "技能",
      subtitle: `技能池共 ${y.length} 个技能 · 当前智能体：${T}`
    }),
    e.createElement(s, {
      items: F,
      activeKey: W,
      onChange: (G) => X(G)
    })
  );
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
function fs(e) {
  if (!e.env) return !1;
  const t = Object.entries(e.env);
  return t.length === 0 ? !1 : t.some(([, l]) => typeof l == "string" && l.length > 0);
}
const wt = "ugsci.market.githubSources", $n = "https://github.com/anthropics/skills/tree/main/skills", ca = "https://ugsci-awesome-tools.oss-cn-beijing.aliyuncs.com", ys = `${ca}/skills`;
function mt(e) {
  const t = e.replace(/^\/+/, "");
  return Ne(`/plugins/oss-proxy?path=${encodeURIComponent(t)}`);
}
async function Qt(e) {
  const t = e.replace(/^\/+/, ""), l = await fetch(mt(t));
  if (!l.ok)
    throw new Error(`OSS fetch failed (${l.status}): ${t}`);
  return await l.json();
}
function et(e) {
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
function Es(e) {
  var n, s;
  const t = {};
  if (e.env && e.env.length > 0)
    for (const r of e.env)
      t[r] = `your-${r.toLowerCase().replace(/_/g, "-")}`;
  let l = "🔌";
  const a = (e.icon || "").toLowerCase();
  return a.includes("folder") ? l = "📁" : a.includes("git") ? l = "🌿" : a.includes("github") ? l = "🐙" : a.includes("database") || a.includes("postgres") || a.includes("sqlite") ? l = "🗄️" : a.includes("search") || a.includes("brave") ? l = "🔍" : a.includes("browser") || a.includes("puppeteer") ? l = "🎭" : a.includes("memory") || a.includes("brain") ? l = "🧠" : a.includes("file") || a.includes("fetch") ? l = "🌐" : a.includes("slack") ? l = "💬" : a.includes("google") ? l = "📁" : a.includes("notion") ? l = "📝" : a.includes("jupyter") ? l = "📊" : a.includes("science") || a.includes("flask") ? l = "🔬" : a.includes("book") || a.includes("arxiv") ? l = "📚" : a.includes("patent") && (l = "📜"), {
    id: e.id,
    name: e.name,
    emoji: l,
    iconUrl: e.icon_url ? mt(e.icon_url) : void 0,
    category: e.category ? et(e.category) : "",
    description: e.description,
    transport: e.transport || "stdio",
    command: ((n = e.config) == null ? void 0 : n.command) || "",
    args: ((s = e.config) == null ? void 0 : s.args) || [],
    env: Object.keys(t).length > 0 ? t : void 0
  };
}
const ma = "ugsci.market.mcpSources", da = "ugsci.market.expertSources";
function ua(e, t) {
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
function pa(e, t) {
  try {
    localStorage.setItem(e, JSON.stringify(t));
  } catch {
  }
}
function hs() {
  return ua(ma, "mcp");
}
function ht(e) {
  pa(ma, e);
}
function vs() {
  return ua(da, "expert");
}
function vt(e) {
  pa(da, e);
}
function ga(e) {
  try {
    const t = new URL(e.trim()), l = t.hostname.toLowerCase();
    let a;
    if (l === "github.com" || l === "www.github.com")
      a = "github";
    else if (l === "gitee.com" || l === "www.gitee.com")
      a = "gitee";
    else
      return null;
    const n = t.pathname.split("/").filter((c) => c.length > 0);
    if (n.length < 2) return null;
    const s = decodeURIComponent(n[0]), r = decodeURIComponent(n[1]);
    let o = "main", m = "";
    return n.length >= 4 && (n[2] === "tree" || n[2] === "blob") ? (o = decodeURIComponent(n[3]), n.length > 4 && (m = n.slice(4).map(decodeURIComponent).join("/"))) : n.length > 2 && (m = n.slice(2).map(decodeURIComponent).join("/")), m = m.replace(/\/+$/, "").replace(/^\/+/, ""), {
      owner: s,
      repo: r,
      ref: o || "main",
      skillsPath: m,
      label: `${s}/${r}`,
      platform: a
    };
  } catch {
    return null;
  }
}
function fa(e, t, l, a = "github") {
  return a === "oss" ? `oss:${e}/${l || "/"}` : `${a}:${e}/${t}:${l || "/"}`;
}
function bs(e) {
  try {
    const t = new URL(e.trim()), l = t.hostname.toLowerCase(), a = l.match(
      /^([a-z0-9][a-z0-9-]{1,61}[a-z0-9])\.oss-([a-z0-9-]+)\.aliyuncs\.com$/
    );
    if (!a) return null;
    const n = a[1], s = `${t.protocol}//${l}`, r = decodeURIComponent(t.pathname).replace(/^\/+/, "").replace(/\/+$/, "");
    return r ? {
      endpoint: s,
      prefix: r,
      label: "UGSci",
      platform: "oss"
    } : null;
  } catch {
    return null;
  }
}
function Ss() {
  try {
    const e = localStorage.getItem(wt);
    if (!e) {
      const a = [], n = ga($n);
      return n && a.push({
        id: fa(
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
      }), localStorage.setItem(wt, JSON.stringify(a)), a;
    }
    const t = JSON.parse(e);
    if (!Array.isArray(t)) return [];
    const l = t.filter(
      (a) => a && typeof a.id == "string" && (typeof a.owner == "string" || a.platform === "oss") && !(a.platform === "oss" && a.url === ys)
    ).map((a) => ({
      ...a,
      platform: a.platform || "github",
      owner: a.owner || "",
      repo: a.repo || "",
      ref: a.ref || "",
      skillsPath: a.skillsPath || ""
    }));
    return l.length !== t.length && localStorage.setItem(
      wt,
      JSON.stringify(l)
    ), l;
  } catch {
    return [];
  }
}
function bt(e) {
  try {
    localStorage.setItem(
      wt,
      JSON.stringify(e)
    );
  } catch {
  }
}
function ws(e) {
  const t = e.match(/^---\s*\n([\s\S]*?)\n---/);
  if (!t) return {};
  const l = t[1], a = {}, n = l.split(`
`);
  let s = "";
  for (const r of n) {
    const o = r.match(/^(\w[\w-]*)\s*:\s*(.*)$/);
    if (o) {
      s = o[1];
      let m = o[2].trim();
      (m.startsWith('"') && m.endsWith('"') || m.startsWith("'") && m.endsWith("'")) && (m = m.slice(1, -1)), s === "name" ? a.name = m : s === "description" ? a.description = m : s === "version" ? a.version = m : s === "author" && (a.author = m);
    }
  }
  return a;
}
async function Cs(e) {
  const t = e.platform === "gitee", l = e.skillsPath ? encodeURIComponent(e.skillsPath).replace(/%2F/g, "/") : "", a = t ? `https://gitee.com/api/v5/repos/${e.owner}/${e.repo}/contents/${l}?ref=${encodeURIComponent(e.ref)}` : `https://api.github.com/repos/${e.owner}/${e.repo}/contents/${l}?ref=${encodeURIComponent(e.ref)}`, n = {
    Accept: t ? "application/json" : "application/vnd.github+json"
  };
  t && e.accessToken && (n.Authorization = `token ${e.accessToken}`);
  const s = await fetch(a, {
    headers: n
  });
  if (!s.ok)
    throw new Error(
      `${t ? "Gitee" : "GitHub"} API ${s.status}: ${e.label} (${e.skillsPath || "/"})`
    );
  const r = await s.json();
  if (!Array.isArray(r)) return [];
  const o = r.filter(
    (c) => c.type === "dir" && c.name
  );
  return await Promise.all(
    o.map(async (c) => {
      const g = e.skillsPath ? e.skillsPath + "/" : "", C = t ? `https://gitee.com/${e.owner}/${e.repo}/raw/${e.ref}/${g}${c.name}/SKILL.md` : `https://raw.githubusercontent.com/${e.owner}/${e.repo}/${e.ref}/${g}${c.name}/SKILL.md`, w = t ? `https://gitee.com/${e.owner}/${e.repo}/tree/${e.ref}/${g}${c.name}` : `https://github.com/${e.owner}/${e.repo}/tree/${e.ref}/${g}${c.name}`, v = {
        sourceId: e.id,
        sourceLabel: e.label,
        name: c.name,
        description: "",
        source_url: w,
        html_url: w,
        version: null,
        author: null
      };
      try {
        const b = {};
        t && e.accessToken && (b.Authorization = `token ${e.accessToken}`);
        const y = await fetch(C, {
          headers: b
        });
        if (!y.ok) return v;
        const x = await y.text(), j = ws(x);
        return {
          ...v,
          name: j.name || c.name,
          description: j.description || "",
          version: j.version || null,
          author: j.author || null
        };
      } catch {
        return v;
      }
    })
  );
}
async function xs(e) {
  const t = bs(e.url);
  if (!t)
    throw new Error(`Invalid OSS URL: ${e.url}`);
  const { endpoint: l, prefix: a } = t, n = a.split("/").map(encodeURIComponent).join("/"), s = mt(`${n}/manifest.json`), r = await fetch(s);
  if (!r.ok)
    throw new Error(
      `无法获取技能列表: manifest.json (${r.status})`
    );
  const o = await r.json(), m = [];
  if (o && o.tag_groups && typeof o.tag_groups == "object")
    for (const [C, w] of Object.entries(o.tag_groups))
      Array.isArray(w) && m.push({
        id: C,
        label: et(C),
        tags: w
      });
  const c = [];
  function g(C, w) {
    for (const v of C) {
      if (v.type === "collection" && Array.isArray(v.children)) {
        g(v.children, v.name);
        continue;
      }
      const b = v.path || v.name || "";
      if (!b) continue;
      const y = b.split("/").map(encodeURIComponent).join("/"), x = `${l}/${n}/${y}`;
      let j = null;
      if (v.metadata) {
        const U = v.metadata.match(/version:\s*"?([\d.]+)"?/);
        U && (j = U[1]);
      }
      const B = w ? `${e.label}/${w}` : e.label;
      c.push({
        sourceId: e.id,
        sourceLabel: e.label,
        sourcePath: B,
        name: v.name || b.split("/").pop() || b,
        description: v.description || "",
        source_url: x,
        html_url: x,
        version: j,
        author: null,
        tag: v.tag || void 0,
        isOfficial: !0
      });
    }
  }
  if (Array.isArray(o) ? g(
    o.map(
      (C) => typeof C == "string" ? { name: C, path: C } : C
    )
  ) : o && Array.isArray(o.skills) && g(o.skills), c.length === 0)
    throw new Error(
      `manifest.json 中未找到技能。请检查 ${e.url}/manifest.json`
    );
  return { skills: c, categories: m };
}
async function ks() {
  const e = await Qt("mcp/manifest.json"), t = [], l = {};
  if (e.tag_groups && typeof e.tag_groups == "object")
    for (const [n, s] of Object.entries(e.tag_groups))
      Array.isArray(s) && (l[n] = s, t.push({
        id: n,
        label: et(n),
        tags: s
      }));
  return { servers: (e.servers || []).map((n) => {
    let s = "";
    const r = n.tags || [];
    for (const [o, m] of Object.entries(l))
      if (m.some((c) => r.includes(c))) {
        s = o;
        break;
      }
    return {
      id: n.id || n.name,
      name: n.name || n.id,
      description: n.description || "",
      tags: r,
      transport: n.transport || "stdio",
      config: n.config,
      env: Array.isArray(n.env) ? n.env : void 0,
      source: n.source,
      icon: n.icon,
      icon_url: n.icon_url || n.icon_path || void 0,
      category: s
    };
  }), categories: t };
}
async function _s() {
  const e = await Qt("skills/manifest.json"), t = [], l = /* @__PURE__ */ new Set();
  function a(n, s) {
    for (const r of n) {
      if ((r == null ? void 0 : r.type) === "collection" && Array.isArray(r.children)) {
        a(r.children, r.name || s);
        continue;
      }
      const o = String((r == null ? void 0 : r.path) || (r == null ? void 0 : r.name) || "").trim();
      if (!o) continue;
      const m = o.split("/").map(encodeURIComponent).join("/"), c = `${ca}/skills/${m}`, g = typeof r.tag == "string" && r.tag.trim() ? r.tag.trim() : void 0;
      g && l.add(g);
      let C = null;
      if (typeof r.metadata == "string") {
        const w = r.metadata.match(/version:\s*"?([\d.]+)"?/);
        w && (C = w[1]);
      }
      t.push({
        sourceId: "oss:ugsci-official",
        sourceLabel: "UGSci",
        sourcePath: s ? `UGSci/${s}` : "UGSci",
        name: r.name || o.split("/").pop() || o,
        description: r.description || "",
        source_url: c,
        html_url: c,
        version: C,
        author: null,
        tag: g,
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
async function Ts() {
  const e = await Qt("agents/manifest.json"), t = [], l = {};
  if (e.tag_groups && typeof e.tag_groups == "object")
    for (const [n, s] of Object.entries(e.tag_groups))
      Array.isArray(s) && (l[n] = s, t.push({
        id: n,
        label: et(n),
        tags: s
      }));
  return { agents: (e.agents || []).map((n) => {
    let s = "";
    const r = n.tags || [];
    for (const [o, m] of Object.entries(l))
      if (m.some((c) => r.includes(c))) {
        s = o;
        break;
      }
    return {
      id: n.id || n.name,
      name: n.name || n.id,
      description: n.description || "",
      path: n.path || "",
      tags: r,
      config: n.config,
      instructions: n.instructions,
      skills_manifest: n.skills_manifest,
      drivers: n.drivers,
      category: s
    };
  }), categories: t };
}
async function zs(e) {
  const t = e.filter((r) => r.enabled), l = await Promise.all(
    t.map(async (r) => {
      try {
        if (r.platform === "oss") {
          const { skills: o, categories: m } = await xs(r);
          return { skills: o, categories: m, error: null, label: r.label };
        } else
          return { skills: await Cs(r), categories: [], error: null, label: r.label };
      } catch (o) {
        return {
          skills: [],
          categories: [],
          error: o.message || String(o),
          label: r.label
        };
      }
    })
  ), a = [], n = [], s = [];
  for (const r of l)
    a.push(...r.skills), n.push(...r.categories), r.error && s.push({ label: r.label, message: r.error });
  return { skills: a, errors: s, categories: n };
}
function Is({
  open: e,
  onClose: t,
  sources: l,
  onChange: a
}) {
  const n = A().React, { useState: s } = n, {
    Modal: r,
    Input: o,
    Button: m,
    List: c,
    Tag: g,
    Switch: C,
    Typography: w,
    Tooltip: v,
    message: b
  } = A().antd, {
    PlusOutlined: y,
    DeleteOutlined: x,
    LinkOutlined: j,
    GithubOutlined: B
  } = A().antdIcons || {}, { Text: U } = w, [Z, W] = s(""), [X, M] = s(""), T = () => {
    const P = Z.trim();
    if (!P) return;
    const E = ga(P);
    if (!E) {
      b.error("无效的仓库 URL，请输入类似 https://github.com/owner/repo/tree/main/skills 或 https://gitee.com/owner/repo/tree/master/skills 的链接");
      return;
    }
    const p = fa(E.owner, E.repo, E.skillsPath, E.platform);
    if (l.some((H) => H.id === p)) {
      b.warning("该源已存在");
      return;
    }
    const R = {
      id: p,
      url: P,
      label: E.label,
      owner: E.owner,
      repo: E.repo,
      ref: E.ref,
      skillsPath: E.skillsPath,
      enabled: !0,
      platform: E.platform,
      accessToken: X.trim() || void 0
    }, q = [...l, R];
    bt(q), a(q), W(""), M(""), b.success(`已添加源: ${E.label}`);
  }, _ = (P, E) => {
    const p = l.map(
      (R) => R.id === P ? { ...R, enabled: E } : R
    );
    bt(p), a(p);
  }, F = (P, E) => {
    const p = l.map(
      (R) => R.id === P ? { ...R, accessToken: E.trim() || void 0 } : R
    );
    bt(p), a(p);
  }, G = (P) => {
    const E = l.filter((p) => p.id !== P);
    bt(E), a(E), b.success("已移除源");
  };
  return n.createElement(
    r,
    {
      open: e,
      onCancel: t,
      title: n.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 8 } },
        B ? n.createElement(B, { style: { fontSize: 18 } }) : null,
        n.createElement("span", null, "配置技能源")
      ),
      footer: n.createElement(
        m,
        { onClick: t },
        "关闭"
      ),
      width: 640
    },
    n.createElement(
      "div",
      { style: { marginBottom: 16 } },
      n.createElement(
        U,
        { type: "secondary", style: { fontSize: 12, display: "block", marginBottom: 8 } },
        "添加 GitHub 或 Gitee 仓库作为技能源，系统将从该仓库的指定目录获取技能列表。支持格式："
      ),
      n.createElement(
        "div",
        { style: { display: "flex", gap: 8, alignItems: "center" } },
        n.createElement(o, {
          placeholder: "https://github.com/owner/repo/tree/main/skills 或 https://gitee.com/owner/repo/tree/master/skills",
          value: Z,
          onChange: (P) => W(P.target.value),
          onPressEnter: T,
          prefix: j ? n.createElement(j) : void 0,
          style: { flex: 1 }
        }),
        n.createElement(
          m,
          {
            type: "primary",
            icon: y ? n.createElement(y) : void 0,
            onClick: T
          },
          "添加"
        )
      ),
      // Gitee token input (shown when URL looks like a Gitee link)
      Z.trim() && Z.trim().toLowerCase().includes("gitee.com") ? n.createElement(
        "div",
        { style: { marginTop: 8, display: "flex", gap: 8, alignItems: "center" } },
        n.createElement(
          U,
          { type: "secondary", style: { fontSize: 12, whiteSpace: "nowrap" } },
          "Gitee Token:"
        ),
        n.createElement(o.Password, {
          placeholder: "私有仓库请填写 Gitee 私人令牌（可选）",
          value: X,
          onChange: (P) => M(P.target.value),
          style: { flex: 1 }
        })
      ) : null
    ),
    n.createElement(
      "div",
      { style: { marginBottom: 8, display: "flex", alignItems: "center", justifyContent: "space-between" } },
      n.createElement(U, { strong: !0 }, `已配置源 (${l.length})`)
    ),
    n.createElement(c, {
      size: "small",
      bordered: !0,
      dataSource: l,
      renderItem: (P) => n.createElement(
        c.Item,
        {
          actions: [
            n.createElement(
              v,
              { title: P.enabled ? "点击禁用" : "点击启用" },
              n.createElement(C, {
                size: "small",
                checked: P.enabled,
                onChange: (E) => _(P.id, E)
              })
            ),
            n.createElement(
              v,
              { title: "移除此源" },
              n.createElement(
                m,
                {
                  size: "small",
                  type: "text",
                  danger: !0,
                  icon: x ? n.createElement(x) : void 0,
                  onClick: () => G(P.id)
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
              g,
              { color: P.platform === "gitee" ? "orange" : P.platform === "oss" ? "green" : "blue", style: { fontSize: 11 } },
              P.platform === "gitee" ? "Gitee" : P.platform === "oss" ? "OSS" : "GitHub"
            ),
            n.createElement(
              g,
              { style: { fontSize: 11 } },
              P.label
            ),
            P.skillsPath ? n.createElement(
              U,
              { type: "secondary", style: { fontSize: 11 } },
              `/${P.skillsPath}`
            ) : null,
            P.platform !== "oss" ? n.createElement(
              U,
              { type: "secondary", style: { fontSize: 11 } },
              `@${P.ref}`
            ) : null
          ),
          n.createElement(
            U,
            {
              type: "secondary",
              style: { fontSize: 11, wordBreak: "break-all" }
            },
            P.url
          ),
          // Gitee token input for existing Gitee sources
          P.platform === "gitee" ? n.createElement(
            "div",
            { style: { marginTop: 6, display: "flex", gap: 6, alignItems: "center" } },
            n.createElement(
              U,
              { type: "secondary", style: { fontSize: 11, whiteSpace: "nowrap" } },
              "Token:"
            ),
            n.createElement(o.Password, {
              size: "small",
              placeholder: "Gitee 私人令牌（可选，用于私有仓库）",
              value: P.accessToken || "",
              onChange: (E) => F(P.id, E.target.value),
              style: { flex: 1 }
            })
          ) : null
        )
      )
    })
  );
}
function Mn({
  open: e,
  onClose: t,
  sources: l,
  onChange: a,
  type: n
}) {
  const s = A().React, { useState: r } = s, {
    Modal: o,
    Input: m,
    Button: c,
    List: g,
    Tag: C,
    Switch: w,
    Typography: v,
    Tooltip: b,
    message: y
  } = A().antd, {
    PlusOutlined: x,
    DeleteOutlined: j,
    LinkOutlined: B,
    ApiOutlined: U,
    UserOutlined: Z,
    ImportOutlined: W,
    ExportOutlined: X,
    CopyOutlined: M
  } = A().antdIcons || {}, { Text: T } = v, [_, F] = r(""), [G, P] = r(""), [E, p] = r(""), [R, q] = r(!1), H = n === "mcp" ? "MCP" : "专家模板", ie = n === "mcp" ? U ? s.createElement(U, { style: { fontSize: 18 } }) : null : Z ? s.createElement(Z, { style: { fontSize: 18 } }) : null, z = () => {
    const $ = _.trim(), K = G.trim();
    if (!$) return;
    const le = K || $.slice(0, 40), J = `${n}:${$}`;
    if (l.some((k) => k.id === J)) {
      y.warning("该源已存在");
      return;
    }
    const Y = {
      id: J,
      label: le,
      url: $,
      enabled: !0,
      type: n
    }, ue = [...l, Y];
    n === "mcp" ? ht(ue) : vt(ue), a(ue), F(""), P(""), y.success(`已添加${H}源: ${le}`);
  }, f = ($, K) => {
    const le = l.map(
      (J) => J.id === $ ? { ...J, enabled: K } : J
    );
    n === "mcp" ? ht(le) : vt(le), a(le);
  }, d = ($) => {
    const K = l.filter((le) => le.id !== $);
    n === "mcp" ? ht(K) : vt(K), a(K), y.success("已移除源");
  }, I = () => {
    const $ = JSON.stringify(
      { type: n, sources: l },
      null,
      2
    );
    try {
      navigator.clipboard.writeText($), y.success(`${H}源已复制到剪贴板（${l.length} 个源）`);
    } catch {
      const K = document.createElement("textarea");
      K.value = $, document.body.appendChild(K), K.select(), document.execCommand("copy"), document.body.removeChild(K), y.success(`${H}源已复制到剪贴板（${l.length} 个源）`);
    }
  }, ae = () => {
    const $ = E.trim();
    if (!$) {
      y.warning("请粘贴 JSON 内容");
      return;
    }
    try {
      const K = JSON.parse($);
      let le = [];
      if (Array.isArray(K))
        le = K;
      else if (K && Array.isArray(K.sources))
        le = K.sources;
      else if (K && typeof K == "object")
        le = [K];
      else
        throw new Error("Invalid format");
      const J = le.filter(
        (te) => te && typeof te.url == "string" && typeof te.label == "string"
      );
      if (J.length === 0) {
        y.error("未找到有效的源数据");
        return;
      }
      const Y = new Set(l.map((te) => te.id)), ue = [];
      for (const te of J) {
        const D = te.id || `${n}:${te.url}`;
        Y.has(D) || ue.push({
          id: D,
          label: te.label,
          url: te.url,
          enabled: te.enabled !== !1,
          type: n
        });
      }
      if (ue.length === 0) {
        y.info("所有源均已存在，无新增");
        return;
      }
      const k = [...l, ...ue];
      n === "mcp" ? ht(k) : vt(k), a(k), p(""), q(!1), y.success(`成功导入 ${ue.length} 个${H}源`);
    } catch (K) {
      y.error(`JSON 解析失败: ${K.message || "格式错误"}`);
    }
  };
  return s.createElement(
    o,
    {
      open: e,
      onCancel: t,
      title: s.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 8 } },
        ie,
        s.createElement("span", null, `配置${H}源`)
      ),
      footer: s.createElement(
        "div",
        { style: { display: "flex", justifyContent: "space-between" } },
        s.createElement(
          "div",
          { style: { display: "flex", gap: 8 } },
          s.createElement(
            c,
            {
              icon: X ? s.createElement(X) : void 0,
              onClick: I,
              disabled: l.length === 0,
              size: "small"
            },
            "导出到剪贴板"
          ),
          s.createElement(
            c,
            {
              icon: W ? s.createElement(W) : void 0,
              onClick: () => q(!R),
              size: "small"
            },
            R ? "隐藏导入" : "导入JSON"
          )
        ),
        s.createElement(
          c,
          { onClick: t },
          "关闭"
        )
      ),
      width: 680
    },
    // Description
    s.createElement(
      T,
      { type: "secondary", style: { fontSize: 12, display: "block", marginBottom: 12 } },
      `配置${H}源地址，支持从远程仓库或团队共享的 JSON 导入${H}配置。`
    ),
    // Import section (collapsible)
    R ? s.createElement(
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
      s.createElement(
        T,
        { strong: !0, style: { fontSize: 12, display: "block", marginBottom: 8 } },
        `粘贴${H}源 JSON（支持从导出的剪贴板内容粘贴）`
      ),
      s.createElement(m.TextArea, {
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
        onChange: ($) => p($.target.value),
        autoSize: { minRows: 4, maxRows: 10 },
        style: { fontFamily: "monospace", fontSize: 12 }
      }),
      s.createElement(
        "div",
        { style: { marginTop: 8, display: "flex", gap: 8 } },
        s.createElement(
          c,
          {
            type: "primary",
            size: "small",
            onClick: ae
          },
          "导入"
        ),
        s.createElement(
          c,
          {
            size: "small",
            onClick: () => p("")
          },
          "清空"
        )
      )
    ) : null,
    // Add new source
    s.createElement(
      "div",
      { style: { marginBottom: 16, display: "flex", gap: 8, alignItems: "center" } },
      s.createElement(m, {
        placeholder: "源名称（可选，如：团队MCP仓库）",
        value: G,
        onChange: ($) => P($.target.value),
        style: { width: 200 }
      }),
      s.createElement(m, {
        placeholder: n === "mcp" ? "https://raw.githubusercontent.com/team/mcp-registry/main/mcp.json" : "https://raw.githubusercontent.com/team/expert-registry/main/experts.json",
        value: _,
        onChange: ($) => F($.target.value),
        onPressEnter: z,
        prefix: B ? s.createElement(B) : void 0,
        style: { flex: 1 }
      }),
      s.createElement(
        c,
        {
          type: "primary",
          icon: x ? s.createElement(x) : void 0,
          onClick: z
        },
        "添加"
      )
    ),
    // Source list
    s.createElement(
      "div",
      {
        style: {
          marginBottom: 8,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between"
        }
      },
      s.createElement(
        T,
        { strong: !0 },
        `已配置源 (${l.length})`
      )
    ),
    s.createElement(g, {
      size: "small",
      bordered: !0,
      dataSource: l,
      renderItem: ($) => s.createElement(
        g.Item,
        {
          actions: [
            s.createElement(
              b,
              { title: $.enabled ? "点击禁用" : "点击启用" },
              s.createElement(w, {
                size: "small",
                checked: $.enabled,
                onChange: (K) => f($.id, K)
              })
            ),
            s.createElement(
              b,
              { title: "移除此源" },
              s.createElement(
                c,
                {
                  size: "small",
                  type: "text",
                  danger: !0,
                  icon: j ? s.createElement(j) : void 0,
                  onClick: () => d($.id)
                }
              )
            )
          ]
        },
        s.createElement(
          "div",
          { style: { flex: 1, minWidth: 0 } },
          s.createElement(
            "div",
            {
              style: {
                display: "flex",
                alignItems: "center",
                gap: 6,
                marginBottom: 4
              }
            },
            s.createElement(
              C,
              {
                color: n === "mcp" ? "purple" : "blue",
                style: { fontSize: 11 }
              },
              $.label
            ),
            $.enabled ? null : s.createElement(
              C,
              { style: { fontSize: 10 } },
              "已禁用"
            )
          ),
          s.createElement(
            T,
            {
              type: "secondary",
              style: { fontSize: 11, wordBreak: "break-all" }
            },
            $.url
          )
        )
      )
    }),
    // Share hint
    s.createElement(
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
      s.createElement(
        "span",
        null,
        "💡 ",
        "点击「导出到剪贴板」可复制所有源配置，分享给团队成员后粘贴到「导入JSON」即可快速配置。"
      )
    )
  );
}
async function Os() {
  return oe("/market/providers");
}
async function As(e) {
  return oe(
    `/market/categories?lang=${encodeURIComponent(e)}`
  );
}
async function Ps(e, t, l, a, n) {
  return oe("/market/search", {
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
async function Ln(e, t) {
  const l = { bundle_url: e };
  return t && (l.access_token = t), oe("/skills/pool/import", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(l)
  });
}
function $s() {
  const e = A().React, { useState: t, useEffect: l, useCallback: a, useMemo: n, useRef: s } = e, {
    Spin: r,
    Empty: o,
    Input: m,
    Button: c,
    message: g,
    Row: C,
    Col: w,
    Card: v,
    Tag: b,
    Tooltip: y,
    Typography: x,
    Select: j,
    Drawer: B,
    Descriptions: U,
    Tabs: Z,
    Badge: W,
    Progress: X,
    Modal: M,
    Alert: T
  } = A().antd, {
    ReloadOutlined: _,
    SearchOutlined: F,
    DownloadOutlined: G,
    AppstoreOutlined: P,
    ShopOutlined: E,
    CheckCircleOutlined: p,
    LoadingOutlined: R,
    UserOutlined: q,
    UserAddOutlined: H,
    SettingOutlined: ie,
    GithubOutlined: z,
    ApiOutlined: f
  } = A().antdIcons || {}, { Text: d, Paragraph: I, Title: ae } = x, [$, K] = t("skills"), [le, J] = t([]), [Y, ue] = t([]), [k, te] = t([]), [D, Q] = t(""), [h, me] = t(""), [u, ce] = t(!1), [ge, fe] = t(!1), [ne, V] = t(
    {}
  ), [S, re] = t(null), [pe, N] = t({}), [ye, se] = t([]), [ve, Ie] = t(""), [ke, Fe] = t(""), [Pe, nt] = t(""), [dt, at] = t({}), [$e, lt] = t(""), [ut, st] = t(/* @__PURE__ */ new Set()), [Se, _e] = t(null), [ee, we] = t({}), [xe, Te] = t([]), [We, Je] = t([]), [be, pt] = t([]), [Pt, ot] = t(""), [je, gt] = t(!1), [ya, Zt] = t(!1), [Ea, en] = t([]), [ha, tn] = t(!1), [va, nn] = t([]), [ba, an] = t(!1), [ln, sn] = t([]), [on, rn] = t([]), [cn, mn] = t(!1), [Xe, dn] = t(""), [un, pn] = t([]), [gn, fn] = t([]), [yn, En] = t(!1), [Ke, hn] = t(""), [$t, vn] = t(!1), [ze, ft] = t(null), [rt, Sa] = t([]), it = s(null);
  l(() => {
    Promise.all([
      Os().catch(() => []),
      As("zh").catch(() => []),
      Gt().catch(() => [])
    ]).then(([i, O, L]) => {
      J(i), ue(O), se(L), L.length > 0 && (Ie(L[0].id), lt(L[0].id));
    });
  }, []);
  const yt = a(async (i) => {
    const O = i ?? Ss();
    if (Te(i || O), O.filter((de) => de.enabled).length === 0) {
      Je([]);
      return;
    }
    gt(!0);
    try {
      const { skills: de, errors: Ee, categories: Ce } = await zs(O);
      if (Je(de), Sa(Ce), Ee.length > 0) {
        for (const he of Ee)
          console.warn(`[ugsci] GitHub source '${he.label}' error: ${he.message}`);
        g.warning(
          `部分源加载失败: ${Ee.map((he) => he.label).join(", ")}`
        );
      }
    } catch (de) {
      g.error(de.message || "加载技能源失败"), Je([]);
    } finally {
      gt(!1);
    }
  }, []), Mt = a(async () => {
    var de, Ee, Ce;
    mn(!0), En(!0), gt(!0);
    const [i, O, L] = await Promise.allSettled([
      ks(),
      Ts(),
      _s()
    ]);
    if (i.status === "fulfilled" ? (sn(i.value.servers), rn(i.value.categories)) : (console.warn(`[ugsci] MCP manifest error: ${((de = i.reason) == null ? void 0 : de.message) || i.reason}`), sn([]), rn([])), mn(!1), O.status === "fulfilled" ? (pn(O.value.agents), fn(O.value.categories)) : (console.warn(`[ugsci] Agents manifest error: ${((Ee = O.reason) == null ? void 0 : Ee.message) || O.reason}`), pn([]), fn([])), En(!1), L.status === "fulfilled")
      pt(L.value.skills), ot("");
    else {
      const he = ((Ce = L.reason) == null ? void 0 : Ce.message) || String(L.reason);
      console.warn(`[ugsci] Skills manifest error: ${he}`), pt([]), ot(he);
    }
    gt(!1);
  }, []);
  l(() => {
    yt(), Mt(), en(hs()), nn(vs());
  }, [yt, Mt]);
  const Et = a(
    async (i, O, L) => {
      ce(!0);
      try {
        const de = await Ps(
          i,
          L,
          20,
          "zh",
          O || void 0
        );
        L === void 0 || Object.keys(L).length === 0 ? te(de.results) : te((he) => [...he, ...de.results]);
        const Ee = Object.values(de.by_provider || {}).some(
          (he) => he.has_more
        );
        fe(Ee);
        const Ce = {};
        for (const [he, Be] of Object.entries(de.by_provider || {}))
          Ce[he] = (L[he] || 1) + 1;
        if (V(Ce), de.errors.length > 0)
          for (const he of de.errors)
            console.warn(
              `[ugsci] Market provider '${he.provider}' error: ${he.message}`
            );
      } catch (de) {
        g.error(de.message || "搜索市场失败"), te([]);
      } finally {
        ce(!1);
      }
    },
    []
  );
  l(() => (it.current && clearTimeout(it.current), it.current = setTimeout(() => {
    Et(D, h, {});
  }, 400), () => {
    it.current && clearTimeout(it.current);
  }), [D, h, Et]);
  const wa = () => {
    Et(D, h, ne);
  }, bn = async (i) => {
    const O = `${i.source}:${i.slug}`;
    try {
      N((de) => ({ ...de, [O]: "installing" }));
      const L = await Ln(i.source_url);
      L.installed && g.success(
        `技能「${L.name || i.name}」已安装到技能池，可在技能中心查看`
      ), N((de) => {
        const Ee = { ...de };
        return delete Ee[O], Ee;
      });
    } catch (L) {
      g.error(Rn(L) || "安装技能失败"), N((de) => {
        const Ee = { ...de };
        return delete Ee[O], Ee;
      });
    }
  }, Ca = (i) => {
    window.history.pushState({}, "", i), window.dispatchEvent(new PopStateEvent("popstate"));
  }, xa = async (i) => {
    const O = `github:${i.sourceId}:${i.name}`, L = xe.find((Ee) => Ee.id === i.sourceId), de = (L == null ? void 0 : L.accessToken) || void 0;
    try {
      N((Ce) => ({ ...Ce, [O]: "installing" }));
      const Ee = await Ln(i.source_url, de);
      Ee.installed && g.success(
        `技能「${Ee.name || i.name}」已安装到技能池，可在技能中心查看`
      ), N((Ce) => {
        const he = { ...Ce };
        return delete he[O], he;
      });
    } catch (Ee) {
      g.error(Rn(Ee) || "安装技能失败"), N((Ce) => {
        const he = { ...Ce };
        return delete he[O], he;
      });
    }
  }, Ge = n(() => {
    const i = [], O = /* @__PURE__ */ new Set();
    for (const L of [...be, ...We]) {
      const de = L.source_url || `${L.sourceLabel}:${L.name}`;
      O.has(de) || (O.add(de), i.push(L));
    }
    return i;
  }, [be, We]), Sn = n(() => {
    const i = [], O = /* @__PURE__ */ new Set();
    if (rt.length > 0)
      for (const L of rt)
        O.has(L.id) || (O.add(L.id), i.push(L));
    for (const L of Ge)
      L.tag && !O.has(L.tag) && (O.add(L.tag), i.push({ id: L.tag, label: L.tag }));
    for (const L of Ge)
      !L.isOfficial && L.sourceLabel && !O.has(L.sourceLabel) && (O.add(L.sourceLabel), i.push({ id: L.sourceLabel, label: L.sourceLabel }));
    return i;
  }, [Ge, rt]), Rt = n(() => {
    let i = Ge;
    if (h) {
      const O = rt.find((L) => L.id === h);
      O && O.tags ? i = i.filter(
        (L) => L.tag && O.tags.includes(L.tag) || L.sourceLabel === h
      ) : i = i.filter(
        (L) => L.tag === h || L.sourceLabel === h
      );
    }
    if (D.trim()) {
      const O = D.toLowerCase();
      i = i.filter(
        (L) => {
          var de;
          return L.name.toLowerCase().includes(O) || ((de = L.description) == null ? void 0 : de.toLowerCase().includes(O));
        }
      );
    }
    return i;
  }, [Ge, D, h, rt]), wn = le.filter((i) => i.available), qe = n(() => h ? k.filter((i) => {
    const O = wn.find((L) => L.key === i.source);
    return (O == null ? void 0 : O.label) === h;
  }) : k, [k, h, wn]), ka = e.createElement(
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
      e.createElement(m, {
        placeholder: "搜索技能市场...",
        prefix: F ? e.createElement(F) : void 0,
        value: D,
        onChange: (i) => Q(i.target.value),
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
        c,
        {
          icon: z ? e.createElement(z) : void 0,
          onClick: () => Zt(!0),
          size: "small"
        },
        "配置技能源"
      )
    ),
    // Dynamic category filter tags (from OSS manifest tags + imported sources)
    Pt && Ge.length === 0 ? e.createElement(T, {
      type: "warning",
      showIcon: !0,
      message: "UGSci 官方 OSS 技能库加载失败",
      description: "请检查网络或后端 OSS 代理服务，然后点击右上角“刷新”重试。",
      style: { marginBottom: 12 }
    }) : null,
    Sn.length > 0 ? e.createElement(
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
        b,
        {
          style: {
            fontSize: 11,
            cursor: "pointer",
            borderRadius: 12
          },
          color: h === "" ? "blue" : void 0,
          onClick: () => me("")
        },
        "全部"
      ),
      ...Sn.map((i) => {
        const O = We.some(
          (L) => !L.isOfficial && L.sourceLabel === i.id
        );
        return e.createElement(
          b,
          {
            key: i.id,
            style: {
              fontSize: 11,
              cursor: "pointer",
              borderRadius: 12
            },
            color: h === i.id ? O ? "blue" : "geekblue" : void 0,
            icon: O && z ? e.createElement(z) : void 0,
            onClick: () => me(
              h === i.id ? "" : i.id
            )
          },
          i.label
        );
      })
    ) : null,
    // GitHub skills section
    je && Ge.length === 0 ? e.createElement(
      "div",
      { style: { textAlign: "center", padding: 40, marginBottom: 16 } },
      e.createElement(r, { size: "large" }, e.createElement("div", { style: { minHeight: 60, display: "flex", alignItems: "center", justifyContent: "center" } }, "正在加载技能..."))
    ) : Rt.length > 0 ? e.createElement(
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
        z ? e.createElement(z, {
          style: { fontSize: 14, color: "#1677ff" }
        }) : null,
        e.createElement(
          d,
          { strong: !0, style: { fontSize: 13 } },
          `技能市场 (${Rt.length})`
        )
      ),
      e.createElement(
        C,
        { gutter: [12, 12] },
        ...Rt.map((i) => {
          const O = `github:${i.sourceId}:${i.name}`, L = pe[O];
          return e.createElement(
            w,
            { key: O, xs: 24, sm: 12, md: 8, lg: 6 },
            e.createElement(
              v,
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
                z ? e.createElement(z, {
                  style: { fontSize: 18, color: "#57606a" }
                }) : e.createElement(
                  "span",
                  { style: { fontSize: 18 } },
                  "📦"
                ),
                e.createElement(
                  y,
                  { title: i.name },
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
                    i.name
                  )
                )
              ),
              e.createElement(
                I,
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
                        color: "#999",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 2
                      }
                    },
                    f ? e.createElement(f, { style: { fontSize: 10 } }) : null,
                    i.sourcePath || i.sourceLabel
                  ) : null,
                  // Show tag as category badge
                  i.tag ? e.createElement(
                    b,
                    { color: "geekblue", style: { fontSize: 10 } },
                    i.tag
                  ) : null,
                  i.version ? e.createElement(
                    b,
                    { style: { fontSize: 10 } },
                    `v${i.version}`
                  ) : null
                ),
                L ? e.createElement(
                  c,
                  {
                    size: "small",
                    disabled: !0,
                    icon: R ? e.createElement(R) : void 0
                  },
                  "安装中"
                ) : e.createElement(
                  c,
                  {
                    type: "primary",
                    size: "small",
                    icon: G ? e.createElement(G) : void 0,
                    onClick: () => xa(i)
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
    qe.length > 0 || u ? e.createElement(
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
        d,
        { strong: !0, style: { fontSize: 13 } },
        `技能市场${qe.length > 0 ? ` (${qe.length})` : ""}`
      )
    ) : null,
    // Results grid
    u && qe.length === 0 ? e.createElement(
      "div",
      { style: { textAlign: "center", padding: 60 } },
      e.createElement(r, { size: "large" })
    ) : qe.length === 0 ? e.createElement(o, {
      description: D ? `未找到匹配「${D}」的技能` : "输入关键词搜索技能市场",
      image: o.PRESENTED_IMAGE_SIMPLE
    }) : e.createElement(
      C,
      { gutter: [12, 12] },
      ...qe.map((i) => {
        const O = `${i.source}:${i.slug}`, L = pe[O];
        return e.createElement(
          w,
          { key: O, xs: 24, sm: 12, md: 8, lg: 6 },
          e.createElement(
            v,
            {
              hoverable: !0,
              size: "small",
              style: { height: "100%", cursor: "pointer" },
              onClick: () => re(i)
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
                y,
                { title: i.name },
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
                  i.name
                )
              )
            ),
            e.createElement(
              I,
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
                  b,
                  { color: "geekblue", style: { fontSize: 10 } },
                  i.source
                ),
                i.version ? e.createElement(
                  b,
                  { style: { fontSize: 10 } },
                  `v${i.version}`
                ) : null
              ),
              L ? e.createElement(
                c,
                {
                  size: "small",
                  disabled: !0,
                  icon: R ? e.createElement(R) : void 0
                },
                "安装中"
              ) : e.createElement(
                c,
                {
                  type: "primary",
                  size: "small",
                  icon: G ? e.createElement(G) : void 0,
                  onClick: (de) => {
                    de.stopPropagation(), bn(i);
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
    ge && !u ? e.createElement(
      "div",
      { style: { textAlign: "center", marginTop: 16 } },
      e.createElement(
        c,
        { onClick: wa, loading: u },
        "加载更多"
      )
    ) : null,
    // Detail Drawer
    S ? e.createElement(
      B,
      {
        title: e.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 8 } },
          S.icon_url ? e.createElement("img", {
            src: S.icon_url,
            alt: S.name,
            style: { width: 28, height: 28, borderRadius: 4 }
          }) : e.createElement(
            "span",
            { style: { fontSize: 20 } },
            "📦"
          ),
          e.createElement("span", null, S.name)
        ),
        open: !0,
        onClose: () => re(null),
        width: 480,
        extra: e.createElement(
          c,
          {
            type: "primary",
            icon: G ? e.createElement(G) : void 0,
            onClick: () => {
              bn(S);
            }
          },
          "安装到技能池"
        )
      },
      e.createElement(
        U,
        { column: 1, bordered: !0, size: "small" },
        e.createElement(
          U.Item,
          { label: "来源" },
          S.source
        ),
        e.createElement(
          U.Item,
          { label: "描述" },
          S.description || "-"
        ),
        S.version ? e.createElement(
          U.Item,
          { label: "版本" },
          S.version
        ) : null,
        S.author ? e.createElement(
          U.Item,
          { label: "作者" },
          S.author
        ) : null,
        e.createElement(
          U.Item,
          { label: "来源链接" },
          e.createElement(
            "a",
            { href: S.source_url, target: "_blank" },
            S.source_url
          )
        )
      ),
      S.stats ? e.createElement(
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
          ...Object.entries(S.stats).map(
            ([i, O]) => e.createElement(
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
                String(O)
              ),
              e.createElement(
                d,
                { type: "secondary", style: { fontSize: 11 } },
                i
              )
            )
          )
        )
      ) : null
    ) : null
  ), Lt = n(() => {
    let i = un;
    if (Ke && (i = i.filter((O) => O.category === Ke)), ke.trim()) {
      const O = ke.toLowerCase();
      i = i.filter(
        (L) => L.name.toLowerCase().includes(O) || L.description.toLowerCase().includes(O) || L.tags.some((de) => de.toLowerCase().includes(O))
      );
    }
    return i;
  }, [un, ke, Ke]), _a = async (i) => {
    if (!$t) {
      vn(!0);
      try {
        let O = i.description;
        if (i.instructions)
          try {
            const Ee = i.instructions.replace(/^\/+/, ""), Ce = await fetch(mt(Ee));
            Ce.ok && (O = await Ce.text());
          } catch {
          }
        let L = [];
        if (i.skills_manifest)
          try {
            const Ee = i.skills_manifest.replace(/^\/+/, ""), Ce = await fetch(mt(Ee));
            if (Ce.ok) {
              const he = await Ce.json();
              Array.isArray(he) ? L = he.map((Be) => typeof Be == "string" ? Be : Be.name).filter(Boolean) : he.skills && (L = he.skills.map((Be) => typeof Be == "string" ? Be : Be.name).filter(Boolean));
            }
          } catch {
          }
        const de = await oe("/agents", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: i.name,
            description: i.description,
            skill_names: L
          })
        });
        await xt(de.id, "AGENTS.md", O), g.success(`专家「${i.name}」创建成功，已跳转至专家`), Ca("/ugsci-experts");
      } catch (O) {
        g.error(O.message || "创建专家失败");
      } finally {
        vn(!1);
      }
    }
  }, Cn = a(async (i) => {
    if (i)
      try {
        const O = await Kt(i);
        st(new Set(O.map((L) => L.key)));
      } catch {
        st(/* @__PURE__ */ new Set());
      }
  }, []);
  l(() => {
    $e && Cn($e);
  }, [$e, Cn]);
  const Ta = async (i) => {
    if (!$e) {
      g.warning("请先选择目标专家");
      return;
    }
    if (fs(i)) {
      const O = Object.entries(i.env), L = {};
      for (const [de] of O)
        L[de] = "";
      we(L), _e(i);
      return;
    }
    await xn(i, i.env || {});
  }, xn = async (i, O) => {
    at((L) => ({ ...L, [i.id]: !0 }));
    try {
      const L = i.id;
      await Gn($e, {
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
      }), g.success(`MCP「${i.name}」已添加到当前专家`), st((de) => new Set(de).add(L));
    } catch (L) {
      g.error(L.message || `添加 MCP「${i.name}」失败`);
    } finally {
      at((L) => ({ ...L, [i.id]: !1 }));
    }
  }, za = async () => {
    if (!Se) return;
    const i = [];
    for (const [L, de] of Object.entries(ee))
      if (!de || !de.trim()) {
        const Ee = Pn[L];
        i.push((Ee == null ? void 0 : Ee.label) || L);
      }
    if (i.length > 0) {
      g.warning(`请填写以下配置项: ${i.join(", ")}`);
      return;
    }
    const O = Se;
    _e(null), we({}), await xn(O, { ...ee });
  }, jt = n(() => {
    let i = ln;
    if (Xe && (i = i.filter((O) => O.category === Xe)), Pe.trim()) {
      const O = Pe.toLowerCase();
      i = i.filter(
        (L) => L.name.toLowerCase().includes(O) || L.description.toLowerCase().includes(O) || L.tags.some((de) => de.toLowerCase().includes(O))
      );
    }
    return i.map(Es);
  }, [ln, Pe, Xe]), Ia = e.createElement(
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
      e.createElement(m, {
        placeholder: "搜索 MCP 服务器...",
        prefix: F ? e.createElement(F) : void 0,
        value: Pe,
        onChange: (i) => nt(i.target.value),
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
        e.createElement(j, {
          value: $e,
          onChange: (i) => lt(i),
          style: { minWidth: 180 },
          size: "small",
          options: ye.map((i) => ({ value: i.id, label: i.name }))
        })
      ),
      // Configure MCP source button
      e.createElement(
        c,
        {
          icon: f ? e.createElement(f) : void 0,
          onClick: () => tn(!0),
          size: "small"
        },
        "配置 MCP 源"
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
        b,
        {
          style: { fontSize: 11, cursor: "pointer", borderRadius: 12 },
          color: Xe === "" ? "blue" : void 0,
          onClick: () => dn("")
        },
        "全部"
      ),
      ...on.map(
        (i) => e.createElement(
          b,
          {
            key: i.id,
            style: { fontSize: 11, cursor: "pointer", borderRadius: 12 },
            color: Xe === i.id ? "geekblue" : void 0,
            onClick: () => dn(
              Xe === i.id ? "" : i.id
            )
          },
          i.label
        )
      )
    ) : null,
    // MCP server cards (dynamic from OSS)
    cn && jt.length === 0 ? e.createElement(
      "div",
      { style: { textAlign: "center", padding: 40 } },
      e.createElement(r, { size: "large" }, e.createElement("div", { style: { minHeight: 60, display: "flex", alignItems: "center", justifyContent: "center" } }, "正在加载 MCP 服务器..."))
    ) : jt.length === 0 ? e.createElement(o, {
      description: "未找到匹配的 MCP 服务器",
      image: o.PRESENTED_IMAGE_SIMPLE
    }) : e.createElement(
      C,
      { gutter: [12, 12] },
      ...jt.map(
        (i) => e.createElement(
          w,
          { key: i.id, xs: 24, sm: 12, md: 8 },
          e.createElement(
            v,
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
                  d,
                  { strong: !0, style: { fontSize: 14 } },
                  i.name
                ),
                e.createElement(
                  "div",
                  { style: { display: "flex", gap: 4, marginTop: 4, flexWrap: "wrap" } },
                  e.createElement(
                    b,
                    { color: "blue", style: { fontSize: 10 } },
                    i.category
                  ),
                  e.createElement(
                    b,
                    {
                      color: i.transport === "stdio" ? "purple" : "cyan",
                      style: { fontSize: 10 }
                    },
                    i.transport
                  ),
                  i.env && Object.keys(i.env).length > 0 ? e.createElement(
                    b,
                    { color: "orange", style: { fontSize: 10 } },
                    "需配置密钥"
                  ) : null
                )
              )
            ),
            // Description
            e.createElement(
              I,
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
                d,
                { type: "secondary", style: { fontSize: 11 } },
                i.transport === "stdio" ? `${i.command} ${(i.args || []).join(" ")}` : i.url || ""
              ),
              ut.has(i.id) ? e.createElement(
                c,
                { size: "small", disabled: !0 },
                "已安装"
              ) : e.createElement(
                c,
                {
                  type: "primary",
                  size: "small",
                  loading: !!dt[i.id],
                  icon: f ? e.createElement(f) : void 0,
                  onClick: () => Ta(i)
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
      E ? e.createElement(E, {
        style: { fontSize: 24, color: "#bfbfbf", marginBottom: 8 }
      }) : null,
      e.createElement(
        d,
        { type: "secondary", style: { fontSize: 12 } },
        "MCP 服务器列表来自 UGSci 官方源，自动同步更新"
      )
    )
  ), Oa = Se ? e.createElement(
    M,
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
        _e(null), we({});
      },
      onOk: za,
      okText: "安装",
      cancelText: "取消",
      width: 520,
      destroyOnClose: !0
    },
    // Description
    e.createElement(
      d,
      { type: "secondary", style: { display: "block", marginBottom: 16, fontSize: 12 } },
      Se.description
    ),
    ...Object.entries(Se.env || {}).map(([i]) => {
      const O = Pn[i], L = (O == null ? void 0 : O.isSecret) !== !1;
      return e.createElement(
        "div",
        { key: i, style: { marginBottom: 16 } },
        e.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 6, marginBottom: 4 } },
          e.createElement(
            d,
            { strong: !0, style: { fontSize: 13 } },
            (O == null ? void 0 : O.label) || i
          ),
          e.createElement(
            b,
            { color: "orange", style: { fontSize: 10 } },
            "必填"
          )
        ),
        // Help text with optional link
        O ? e.createElement(
          "div",
          { style: { marginBottom: 6, fontSize: 12, color: "#8c8c8c" } },
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
        L ? e.createElement(m.Password, {
          placeholder: `请输入 ${(O == null ? void 0 : O.label) || i}`,
          value: ee[i] || "",
          onChange: (de) => we((Ee) => ({
            ...Ee,
            [i]: de.target.value
          })),
          style: { width: "100%" }
        }) : e.createElement(m, {
          placeholder: `请输入 ${(O == null ? void 0 : O.label) || i}`,
          value: ee[i] || "",
          onChange: (de) => we((Ee) => ({
            ...Ee,
            [i]: de.target.value
          })),
          style: { width: "100%" }
        }),
        // Show env key name for reference
        e.createElement(
          d,
          { type: "secondary", style: { fontSize: 11, display: "block", marginTop: 2 } },
          `环境变量名: ${i}`
        )
      );
    })
  ) : null, Aa = e.createElement(
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
      e.createElement(m, {
        placeholder: "搜索人才...",
        prefix: F ? e.createElement(F) : void 0,
        value: ke,
        onChange: (i) => Fe(i.target.value),
        allowClear: !0,
        style: { maxWidth: 400, flex: 1, minWidth: 200 }
      }),
      e.createElement(
        c,
        {
          icon: q ? e.createElement(q) : void 0,
          onClick: () => an(!0),
          size: "small"
        },
        "配置专家源"
      )
    ),
    // Dynamic category tag row (from OSS manifest tag_groups)
    gn.length > 0 ? e.createElement(
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
        b,
        {
          style: { fontSize: 11, cursor: "pointer", borderRadius: 12 },
          color: Ke === "" ? "blue" : void 0,
          onClick: () => hn("")
        },
        "全部"
      ),
      ...gn.map(
        (i) => e.createElement(
          b,
          {
            key: i.id,
            style: { fontSize: 11, cursor: "pointer", borderRadius: 12 },
            color: Ke === i.id ? "geekblue" : void 0,
            onClick: () => hn(
              Ke === i.id ? "" : i.id
            )
          },
          i.label
        )
      )
    ) : null,
    // Agent cards (dynamic from OSS)
    yn && Lt.length === 0 ? e.createElement(
      "div",
      { style: { textAlign: "center", padding: 40 } },
      e.createElement(r, { size: "large" }, e.createElement("div", { style: { minHeight: 60, display: "flex", alignItems: "center", justifyContent: "center" } }, "正在加载人才市场..."))
    ) : Lt.length === 0 ? e.createElement(o, {
      description: "未找到匹配的人才",
      image: o.PRESENTED_IMAGE_SIMPLE
    }) : e.createElement(
      C,
      { gutter: [12, 12] },
      ...Lt.map(
        (i) => e.createElement(
          w,
          { key: i.id, xs: 24, sm: 12, md: 8 },
          e.createElement(
            v,
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
              e.createElement(Ae, {
                name: i.name,
                size: 40
              }),
              e.createElement(
                "div",
                { style: { flex: 1 } },
                e.createElement(
                  d,
                  { strong: !0, style: { fontSize: 14 } },
                  i.name
                ),
                e.createElement(
                  "div",
                  { style: { display: "flex", gap: 4, marginTop: 4, flexWrap: "wrap" } },
                  i.category ? e.createElement(
                    b,
                    { color: "blue", style: { fontSize: 10 } },
                    et(i.category)
                  ) : null,
                  i.tags.includes("mcp") ? e.createElement(
                    b,
                    { color: "purple", style: { fontSize: 10 } },
                    "MCP"
                  ) : null
                )
              )
            ),
            e.createElement(
              I,
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
                d,
                { type: "secondary", style: { fontSize: 11 } },
                i.tags.filter((O) => O !== "agent" && O !== "template" && O !== "workspace").slice(0, 3).join(" · ") || "人才模板"
              ),
              e.createElement(
                c,
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
          border: "1px dashed #d9d9d9",
          borderRadius: 8,
          background: "#fafafa"
        }
      },
      E ? e.createElement(E, {
        style: { fontSize: 24, color: "#bfbfbf", marginBottom: 8 }
      }) : null,
      e.createElement(
        d,
        { type: "secondary", style: { fontSize: 12 } },
        "人才市场来自 UGSci 官方源，自动同步更新"
      )
    )
  ), Pa = [
    {
      key: "skills",
      label: e.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        P ? e.createElement(P, { style: { fontSize: 14 } }) : null,
        "技能市场"
      ),
      children: ka
    },
    {
      key: "mcp",
      label: e.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        f ? e.createElement(f, { style: { fontSize: 14 } }) : null,
        "MCP 市场"
      ),
      children: Ia
    },
    {
      key: "experts",
      label: e.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        H ? e.createElement(H, { style: { fontSize: 14 } }) : null,
        "人才市场"
      ),
      children: Aa
    }
  ];
  return e.createElement(
    "div",
    { style: { padding: 24 } },
    e.createElement(It, {
      title: "市场",
      subtitle: "浏览技能市场 · 选择 MCP 服务器 · 人才市场 · 随时更新能力和专家",
      extra: e.createElement(
        "div",
        { style: { display: "flex", gap: 8 } },
        e.createElement(
          c,
          {
            type: "primary",
            icon: _ ? e.createElement(_) : void 0,
            onClick: () => {
              Et(D, h, {}), yt(), Mt();
            },
            loading: u || je || cn || yn
          },
          "刷新"
        )
      )
    }),
    e.createElement(Z, {
      items: Pa,
      activeKey: $,
      onChange: (i) => K(i)
    }),
    // Skill source config modal
    e.createElement(Is, {
      open: ya,
      onClose: () => Zt(!1),
      sources: xe,
      onChange: (i) => {
        Te(i), yt(i);
      }
    }),
    // MCP source config modal
    e.createElement(Mn, {
      open: ha,
      onClose: () => tn(!1),
      sources: Ea,
      onChange: (i) => en(i),
      type: "mcp"
    }),
    // MCP token config modal (for templates requiring secrets)
    Oa,
    // Expert source config modal
    e.createElement(Mn, {
      open: ba,
      onClose: () => an(!1),
      sources: va,
      onChange: (i) => nn(i),
      type: "expert"
    }),
    // ── Agent Detail Modal (click card to view details, then create) ──
    ze ? e.createElement(
      M,
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
          e.createElement(Ae, {
            name: ze.name,
            size: 40
          }),
          e.createElement(
            "div",
            null,
            e.createElement(
              d,
              { strong: !0, style: { fontSize: 16 } },
              ze.name
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
              ze.category ? e.createElement(
                b,
                { color: "blue", style: { fontSize: 10 } },
                et(ze.category)
              ) : null,
              ...ze.tags.filter(
                (i) => i !== "agent" && i !== "template" && i !== "workspace"
              ).slice(0, 5).map(
                (i) => e.createElement(
                  b,
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
            c,
            {
              onClick: () => ft(null),
              style: { marginRight: 8 }
            },
            "取消"
          ),
          e.createElement(
            c,
            {
              type: "primary",
              loading: $t,
              disabled: $t,
              icon: H ? e.createElement(H) : void 0,
              style: Oe,
              onClick: async () => {
                await _a(ze), ft(null);
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
          I,
          {
            type: "secondary",
            style: { fontSize: 13, lineHeight: 1.7, margin: 0 }
          },
          ze.description
        )
      ),
      // Skills manifest hint
      ze.skills_manifest ? e.createElement(
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
      ze.instructions ? e.createElement(
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
      ze.drivers && Object.keys(ze.drivers).length > 0 ? e.createElement(
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
          ...Object.entries(ze.drivers).map(
            ([i, O]) => e.createElement(
              b,
              { key: i, color: "cyan", style: { fontSize: 11 } },
              `${i}${O && O.length > 0 ? ` (${O.join(", ")})` : ""}`
            )
          )
        )
      ) : null
    ) : null
  );
}
function Ms() {
  try {
    const t = localStorage.getItem("language") || "";
    if (t) return t.split("-")[0];
  } catch {
  }
  return ((typeof navigator < "u" ? navigator.language : "") || "").split("-")[0] || "en";
}
const jn = {
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
function Rs() {
  const e = A(), t = e.React, { useEffect: l, useRef: a } = t, n = e.useSelectedAgent ? e.useSelectedAgent() : { id: "default" }, s = (n == null ? void 0 : n.id) || "default", r = a(null), o = a(null);
  return l(() => {
    if (r.current === s) return;
    r.current = s, Tt();
    const m = Ms(), c = jn[m] || jn.en, g = Bn[m] || Bn.en;
    let C = !1;
    return (async () => {
      var w, v;
      try {
        const b = await Ot(s);
        if (C) return;
        const y = Nn(b);
        if (o.current) {
          try {
            o.current();
          } catch {
          }
          o.current = null;
        }
        const x = window.QwenPaw;
        (w = x == null ? void 0 : x.chat) != null && w.welcome && (y.length > 0 ? (o.current = x.chat.welcome.set("ugsci", {
          description: c,
          prompts: y
        }), console.info(
          `[ugsci] Injected ${y.length} welcome prompts for agent "${s}"`
        )) : (o.current = x.chat.welcome.set("ugsci", {
          description: c,
          prompts: [g]
        }), console.info(
          `[ugsci] No skills for agent "${s}" — using default prompt`
        )));
      } catch (b) {
        console.warn(
          `[ugsci] Failed to inject welcome prompts for agent "${s}":`,
          b
        );
        const y = window.QwenPaw;
        if ((v = y == null ? void 0 : y.chat) != null && v.welcome && !C) {
          if (o.current) {
            try {
              o.current();
            } catch {
            }
            o.current = null;
          }
          o.current = y.chat.welcome.set("ugsci", {
            description: c,
            prompts: [g]
          });
        }
      }
    })(), () => {
      C = !0;
    };
  }, [s]), null;
}
function Ls() {
  var c, g, C;
  const e = window.QwenPaw;
  if (!(e != null && e.menu) || !(e != null && e.route)) {
    console.warn(
      "[ugsci] QwenPaw.menu/route API not available — plugin disabled"
    );
    return;
  }
  const t = A().React, l = "ugsci";
  (g = (c = e.chat) == null ? void 0 : c.rightHeader) != null && g.add ? (e.chat.rightHeader.add(l, t.createElement(Rs), {
    id: "ugsci.welcome-injector",
    order: -1
    // render before other right-header items (invisible anyway)
  }), console.info("[ugsci] WelcomePromptsInjector registered via rightHeader")) : console.warn(
    "[ugsci] QP.chat.rightHeader.add not available — agent-specific welcome prompts disabled"
  );
  const a = A().antdIcons || {}, n = a.UserSwitchOutlined, s = a.ToolOutlined, r = a.ThunderboltOutlined, o = a.ShopOutlined;
  e.route.add(l, {
    id: "ugsci.experts",
    path: "/ugsci-experts",
    component: Hl
  }), e.menu.add(l, {
    id: "ugsci.experts",
    location: "primary.agentScoped",
    label: () => "专家",
    icon: n ? t.createElement(n, { style: { fontSize: 16 } }) : void 0,
    route: "ugsci.experts",
    order: 5,
    visible: () => Ve()
  }), e.route.add(l, {
    id: "ugsci.capabilities",
    path: "/ugsci-capabilities",
    component: ds
  }), e.menu.add(l, {
    id: "ugsci.capabilities",
    location: "primary.agentScoped",
    label: () => "工具",
    icon: s ? t.createElement(s, { style: { fontSize: 16 } }) : void 0,
    route: "ugsci.capabilities",
    order: 6,
    visible: () => Ve()
  }), e.route.add(l, {
    id: "ugsci.skills-center",
    path: "/ugsci-skills",
    component: gs
  }), e.menu.add(l, {
    id: "ugsci.skills-center",
    location: "primary.agentScoped",
    label: () => "技能",
    icon: r ? t.createElement(r, { style: { fontSize: 16 } }) : void 0,
    route: "ugsci.skills-center",
    order: 7,
    visible: () => Ve()
  }), e.route.add(l, {
    id: "ugsci.market",
    path: "/ugsci-market",
    component: $s
  }), e.menu.add(l, {
    id: "ugsci.market",
    location: "primary.agentScoped",
    label: () => "市场",
    icon: o ? t.createElement(o, { style: { fontSize: 16 } }) : void 0,
    route: "ugsci.market",
    order: 8,
    visible: () => Ve()
  }), (C = e.sidebar) != null && C.registerSimpleModeItems ? (e.sidebar.registerSimpleModeItems([
    "ugsci.experts",
    "ugsci.capabilities",
    "ugsci.skills-center",
    "ugsci.market"
  ]), console.info("[ugsci] Registered 4 items for simple-mode visibility")) : console.warn(
    "[ugsci] window.QwenPaw.sidebar.registerSimpleModeItems not available — items will not appear in simple mode"
  );
  const m = [
    "core.skills",
    "core.tools",
    "core.acp",
    "core.agent-config",
    "core.agent-stats",
    "core.skill-pool"
  ];
  for (const w of m) {
    try {
      const b = e.menu.snapshot("primary.agentScoped").find((y) => y.id === w);
      b && e.menu.replace(l, w, {
        ...b,
        visible: () => !Ve()
      });
    } catch {
    }
    try {
      const b = e.menu.snapshot("primary.settings").find((y) => y.id === w);
      b && e.menu.replace(l, w, {
        ...b,
        visible: () => !Ve()
      });
    } catch {
    }
  }
  console.info(
    "[ugsci] Plugin registered: 4 routes + menu items, simple-mode whitelist + simplified navigation active"
  );
}
function Ft() {
  try {
    Ls();
  } catch (e) {
    console.error("[ugsci] Failed to build plugin:", e), setTimeout(Ft, 500);
  }
}
var Un;
if ((Un = window.QwenPaw) != null && Un.host)
  Ft();
else {
  const e = setInterval(() => {
    var t;
    (t = window.QwenPaw) != null && t.host && (clearInterval(e), Ft());
  }, 200);
  setTimeout(() => clearInterval(e), 1e4);
}
