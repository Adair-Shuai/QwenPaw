function w() {
  var t;
  const e = (t = window.QwenPaw) == null ? void 0 : t.host;
  if (!e) throw new Error("[ugsci] QwenPaw.host not available");
  return e;
}
function Ca() {
  try {
    return w().getApiToken() || "";
  } catch {
    return "";
  }
}
function vt(e) {
  return w().getApiUrl(e);
}
function Ta(e) {
  const t = Ca();
  return {
    "Content-Type": "application/json",
    ...t ? { Authorization: `Bearer ${t}` } : {},
    ...e
  };
}
function _a(e) {
  const t = new Headers(e), l = {};
  return t.forEach((n, a) => {
    l[a] = n;
  }), l;
}
function je(e, t) {
  const l = w(), n = _a(t == null ? void 0 : t.headers);
  return l.fetch ? l.fetch(e, { ...t, headers: n }) : fetch(l.getApiUrl(e), {
    ...t,
    headers: { ...Ta(), ...n }
  });
}
const rt = /* @__PURE__ */ new Map(), Ia = 15e3;
function za(e) {
  return e ? e instanceof Headers ? e.get("X-Agent-Id") || e.get("x-agent-id") || "" : e["X-Agent-Id"] || e["x-agent-id"] || "" : "";
}
function Aa(e, t, l) {
  return `${e}:${t}:${l}`;
}
function st() {
  rt.clear();
}
function Mt(e) {
  for (const [t, l] of rt)
    (e ? l.agentId === e : l.agentId) && rt.delete(t);
}
async function se(e, t) {
  const l = ((t == null ? void 0 : t.method) || "GET").toUpperCase(), { bypassCache: n, ...a } = t || {}, r = za(
    a.headers
  ), s = Aa(l, e, r);
  if (l !== "GET" && (r ? Mt(r) : st()), l === "GET" && !n) {
    const c = rt.get(s);
    if (c && Date.now() - c.ts < Ia)
      return c.data;
  }
  const o = await je(e, a);
  if (!o.ok) {
    const c = await o.text().catch(() => "");
    throw new Error(c || `HTTP ${o.status}`);
  }
  if (o.status === 204) return null;
  const d = await o.json();
  return l === "GET" && rt.set(s, {
    data: d,
    ts: Date.now(),
    agentId: r || void 0
  }), d;
}
const Ae = {
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
function bt(e, t) {
  const l = w();
  return l.ReactMarkdown && l.remarkGfm ? t.createElement(
    l.ReactMarkdown,
    { remarkPlugins: [l.remarkGfm] },
    e
  ) : e.replace(/\*\*(.+?)\*\*/g, "$1").replace(/\*(.+?)\*/g, "$1").replace(/`(.+?)`/g, "$1").replace(/^#+\s*/gm, "").replace(/^[-*]\s+/gm, "• ");
}
function St({
  title: e,
  subtitle: t,
  extra: l
}) {
  const n = w().React, { Space: a } = w().antd;
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
        { style: { marginTop: 4, fontSize: 13, color: "#8c8c8c" } },
        t
      ) : null
    ),
    l ? n.createElement(a, null, l) : null
  );
}
async function wt() {
  const e = await se("/agents");
  return (e == null ? void 0 : e.agents) || [];
}
async function Lt(e) {
  return se(
    `/agents/${encodeURIComponent(e)}`
  );
}
async function xt(e) {
  return await se(
    `/agents/${encodeURIComponent(e)}/skills`
  ) || [];
}
async function Bt(e = !1) {
  return await se(`/skills/pool${e ? "?summary=true" : ""}`) || [];
}
async function Pa(e) {
  const t = await se(
    `/skills/pool/${encodeURIComponent(e)}/content`
  );
  return (t == null ? void 0 : t.content) || "";
}
async function Oa() {
  return await se(
    "/skills/workspaces"
  ) || [];
}
function Ze(e, t = "") {
  return `/agents/${encodeURIComponent(e)}/skills${t}`;
}
function Mn(e) {
  var l;
  const t = [];
  for (const n of e) {
    if (n.enabled === !1) continue;
    const a = (l = n.description) == null ? void 0 : l.trim();
    if (!a) continue;
    const r = (n.name || a).length > 20 ? (n.name || a).substring(0, 18) + "…" : n.name || a;
    let s = a;
    if (s = s.replace(/\*\*(.+?)\*\*/g, "$1").replace(/\*(.+?)\*/g, "$1").replace(/`(.+?)`/g, "$1").replace(/^#+\s*/gm, "").trim(), /^(用于|帮助|提供|支持|实现|完成|分析|计算|生成|创建|检查)/.test(s) ? s = `请${s}` : /^(a |an |the )/i.test(s) ? s = `Help me with ${s}` : /[。？！.?!]$/.test(s) || (s = `帮我${s}`), s.length > 80 && (s = s.substring(0, 77) + "..."), t.push({ label: r, value: s }), t.length >= 4) break;
  }
  return t;
}
async function $a(e) {
  return await se("/workspace/files", {
    headers: { "X-Agent-Id": e }
  }) || [];
}
async function Et(e, t, l) {
  return se(`/workspace/files/${encodeURIComponent(t)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify({ content: l })
  });
}
async function Ra(e, t, l, n) {
  return se("/workspace/prompt-files", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify({ filename: t, content: l, enable: n })
  });
}
const Ma = /* @__PURE__ */ new Set([
  "CON",
  "PRN",
  "AUX",
  "NUL",
  ...Array.from({ length: 9 }, (e, t) => `COM${t + 1}`),
  ...Array.from({ length: 9 }, (e, t) => `LPT${t + 1}`)
]);
function La(e) {
  let t = e.trim();
  if (!t) throw new Error("请输入文件名");
  if (/[\\/]/.test(t)) throw new Error("文件名不能包含路径分隔符");
  if (/[<>:\"|?*\u0000-\u001f]/.test(t))
    throw new Error("文件名包含系统不支持的字符");
  if (/[ .]$/.test(t)) throw new Error("文件名不能以空格或句点结尾");
  t.toLowerCase().endsWith(".md") ? t = `${t.slice(0, -3)}.md` : t += ".md";
  const l = t.split(".", 1)[0].toUpperCase();
  if (!t.slice(0, -3)) throw new Error("文件名不能为空");
  if (Ma.has(l))
    throw new Error("该文件名是系统保留名称，请更换");
  if (new TextEncoder().encode(t).length > 255)
    throw new Error("文件名过长");
  return t;
}
async function Ba(e, t) {
  const l = await Lt(e);
  l.system_prompt_files = t, await se(`/agents/${encodeURIComponent(e)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(l)
  });
}
async function jt(e, t) {
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
async function Ln(e, t) {
  await se(
    Ze(e, `/${encodeURIComponent(t)}/enable`),
    {
      method: "POST"
    }
  );
}
async function Ut(e, t) {
  await se(Ze(e, `/${encodeURIComponent(t)}`), {
    method: "DELETE"
  });
}
async function ja(e, t) {
  return se(Ze(e, "/batch-enable"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(t)
  });
}
async function Ua(e, t) {
  return se(Ze(e, "/batch-disable"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(t)
  });
}
async function Na(e, t) {
  return se(Ze(e, "/batch-delete"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(t)
  });
}
async function Nt(e) {
  return await se("/mcp", {
    headers: { "X-Agent-Id": e }
  }) || [];
}
async function Bn(e, t) {
  await se(`/mcp/${encodeURIComponent(t)}`, {
    method: "DELETE",
    headers: { "X-Agent-Id": e }
  });
}
async function jn(e, t) {
  return se("/mcp", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify(t)
  });
}
async function Da(e, t) {
  return se(
    `/mcp/toggle/${encodeURIComponent(t)}`,
    {
      method: "PATCH",
      headers: { "X-Agent-Id": e }
    }
  );
}
async function Un(e, t) {
  await se(
    Ze(e, `/${encodeURIComponent(t)}/disable`),
    {
      method: "POST"
    }
  );
}
async function Fa(e) {
  await se(`/skills/pool/${encodeURIComponent(e)}`, {
    method: "DELETE"
  });
}
function Ga(e) {
  const t = (e || "").trim();
  if (!t) return { number: 6, unit: "h" };
  const l = t.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/i);
  if (!l) return { number: 6, unit: "h" };
  const n = parseInt(l[1] || "0", 10), a = parseInt(l[2] || "0", 10), r = parseInt(l[3] || "0", 10), s = n * 60 + a + Math.round(r / 60);
  return s <= 0 ? { number: 6, unit: "h" } : s >= 60 && s % 60 === 0 ? { number: s / 60, unit: "h" } : { number: s, unit: "m" };
}
function Ha(e) {
  return e.unit === "h" ? `${e.number}h` : `${e.number}m`;
}
async function Wa(e) {
  return se("/config/heartbeat", {
    headers: { "X-Agent-Id": e }
  });
}
async function Ja(e, t) {
  return se("/config/heartbeat", {
    method: "PUT",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify(t)
  });
}
async function Ka(e) {
  await se("/config/heartbeat/run", {
    method: "POST",
    headers: { "X-Agent-Id": e }
  });
}
async function qa(e) {
  return se("/workspace/running-config", {
    headers: { "X-Agent-Id": e }
  });
}
async function Xa(e, t) {
  return se("/workspace/running-config", {
    method: "PUT",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify(t)
  });
}
async function Va(e) {
  return (await se("/workspace/language", {
    headers: { "X-Agent-Id": e }
  })).language || "zh";
}
async function Ya(e, t) {
  await se("/workspace/language", {
    method: "PUT",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify({ language: t })
  });
}
async function Qa() {
  return (await se("/config/user-timezone")).timezone || "UTC";
}
async function Za(e) {
  await se("/config/user-timezone", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ timezone: e })
  });
}
async function el(e) {
  return await se("/workspace/system-prompt-files", {
    headers: { "X-Agent-Id": e }
  }) || [];
}
const En = ["AGENTS.md", "SOUL.md", "PROFILE.md"];
function hn({
  items: e,
  max: t = 5,
  color: l = "blue",
  emptyText: n = "无"
}) {
  const a = w().React, { Tag: r } = w().antd;
  return !e || e.length === 0 ? a.createElement(
    "span",
    { style: { fontSize: 12, color: "#bfbfbf" } },
    n
  ) : a.createElement(
    "div",
    { style: { display: "flex", flexWrap: "wrap", gap: 4 } },
    ...e.slice(0, t).map(
      (s, o) => a.createElement(
        r,
        { key: o, color: l, style: { fontSize: 11, marginRight: 0 } },
        s
      )
    ),
    e.length > t ? a.createElement(
      r,
      { style: { fontSize: 11, marginRight: 0 } },
      `+${e.length - t}`
    ) : null
  );
}
function Nn({
  open: e,
  onClose: t,
  poolSkills: l,
  installedSkillNames: n,
  loading: a,
  onInstall: r
}) {
  const s = w().React, { useState: o, useEffect: d, useMemo: c } = s, { Modal: u, Button: y, Empty: E, Spin: b, Input: x, Tag: T, Tooltip: C, Typography: A } = w().antd, { CheckOutlined: B, SearchOutlined: U } = w().antdIcons || {}, { Text: Y } = A, [G, N] = o([]), [J, M] = o("");
  d(() => {
    e && (N([]), M(""));
  }, [e]);
  const _ = c(() => {
    if (!J.trim()) return l;
    const f = J.toLowerCase();
    return l.filter(
      (g) => {
        var O, R;
        return g.name.toLowerCase().includes(f) || ((O = g.description) == null ? void 0 : O.toLowerCase().includes(f)) || ((R = g.tags) == null ? void 0 : R.some((W) => W.toLowerCase().includes(f)));
      }
    );
  }, [l, J]), K = _.filter(
    (f) => !n.includes(f.name)
  ), Q = (f) => {
    N(
      (g) => g.includes(f) ? g.filter((O) => O !== f) : [...g, f]
    );
  }, k = async () => {
    G.length !== 0 && (await r(G), N([]));
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
          Y,
          { type: "secondary", style: { fontSize: 13 } },
          `已选择 ${G.length} 个技能`
        ),
        s.createElement(
          "div",
          { style: { display: "flex", gap: 8 } },
          s.createElement(y, { onClick: t }, "取消"),
          s.createElement(
            y,
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
      s.createElement(x, {
        placeholder: "搜索技能名称、描述或标签...",
        prefix: U ? s.createElement(U) : void 0,
        value: J,
        onChange: (f) => M(f.target.value),
        allowClear: !0,
        style: { flex: 1 }
      }),
      s.createElement(
        y,
        {
          size: "small",
          type: "primary",
          onClick: () => N(K.map((f) => f.name))
        },
        "全选"
      ),
      s.createElement(
        y,
        {
          size: "small",
          onClick: () => N([])
        },
        "清空"
      )
    ),
    // Skill grid (card style matching Skill Center)
    a ? s.createElement(
      "div",
      { style: { textAlign: "center", padding: 40 } },
      s.createElement(b, { size: "large" })
    ) : _.length === 0 ? s.createElement(E, {
      description: J ? "未找到匹配的技能" : "技能池暂无可用技能",
      image: E.PRESENTED_IMAGE_SIMPLE
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
      ..._.map((f) => {
        const g = G.includes(f.name), O = n.includes(f.name);
        return s.createElement(
          "div",
          {
            key: f.name,
            onClick: () => !O && Q(f.name),
            style: {
              position: "relative",
              padding: "10px 12px",
              border: `1px solid ${g ? "#0072f5" : "#e8e8e8"}`,
              borderRadius: 6,
              cursor: O ? "not-allowed" : "pointer",
              transition: "all 0.15s ease",
              background: g ? "rgba(0, 114, 245, 0.06)" : O ? "#fafafa" : "#fff",
              opacity: O ? 0.5 : 1,
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
            B ? s.createElement(B) : "✓"
          ) : null,
          O ? s.createElement(
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
                paddingRight: O || g ? 24 : 0
              }
            },
            s.createElement(
              "span",
              { style: { fontSize: 16 } },
              f.emoji || "⚡"
            ),
            s.createElement(
              C,
              { title: f.name },
              s.createElement(
                Y,
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
              (R, W) => s.createElement(
                T,
                {
                  key: W,
                  color: "cyan",
                  style: { fontSize: 10, marginRight: 0 }
                },
                R
              )
            )
          ) : null
        );
      })
    )
  );
}
function Dn({
  agentId: e,
  systemPromptFiles: t,
  onRefresh: l
}) {
  const n = w().React, { useState: a, useEffect: r, useCallback: s, useRef: o } = n, {
    List: d,
    Tag: c,
    Switch: u,
    Button: y,
    Modal: E,
    Input: b,
    Spin: x,
    Empty: T,
    message: C,
    Typography: A,
    Segmented: B,
    Alert: U
  } = w().antd, { FileTextOutlined: Y, PlusOutlined: G, EditOutlined: N, ReloadOutlined: J } = w().antdIcons || {}, { Text: M } = A, [_, K] = a([]), [Q, k] = a(!0), [f, g] = a(
    t || []
  ), [O, R] = a(!1), [W, re] = a(null), [L, S] = a(""), [m, X] = a(""), [ie, P] = a(!1), [H, D] = a("source"), Z = o(0), q = s(async () => {
    const ne = ++Z.current;
    k(!0);
    try {
      const v = await $a(e);
      ne === Z.current && K(v);
    } catch (v) {
      ne === Z.current && (C.error(v.message || "加载工作区文档失败"), K([]));
    } finally {
      ne === Z.current && k(!1);
    }
  }, [e]);
  r(() => {
    q();
  }, [q]), r(() => {
    g(t || []);
  }, [t]);
  const me = async (ne, v) => {
    const ue = new Set(f);
    if (v)
      ue.add(ne);
    else {
      if (En.includes(ne) && ne === "AGENTS.md") {
        C.warning("AGENTS.md 是核心文件，不能停用");
        return;
      }
      ue.delete(ne);
    }
    const pe = Array.from(ue);
    g(pe);
    try {
      await Ba(e, pe), C.success(v ? "已启用记忆文件" : "已停用记忆文件"), l();
    } catch (Se) {
      C.error(Se.message || "更新失败"), g(t || []);
    }
  }, I = async (ne) => {
    try {
      const v = await se(
        `/workspace/files/${encodeURIComponent(ne)}`,
        { headers: { "X-Agent-Id": e } }
      );
      re(ne), S(v.content || ""), D("source"), R(!0);
    } catch (v) {
      C.error(v.message || "读取文件失败");
    }
  }, te = () => {
    re(null), S(""), X(""), D("source"), R(!0);
  }, le = async () => {
    let ne;
    try {
      ne = La(W || m);
    } catch (v) {
      C.warning(v.message || "文件名无效");
      return;
    }
    if (!L.trim()) {
      C.warning("Markdown 文档不能为空");
      return;
    }
    if (new TextEncoder().encode(L).length > 1024 * 1024) {
      C.warning("Markdown 文档不能超过 1 MB");
      return;
    }
    P(!0);
    try {
      if (W)
        await Et(e, ne, L);
      else {
        const v = await Ra(
          e,
          ne,
          L,
          !0
        );
        g(v.system_prompt_files);
      }
      C.success("保存成功"), R(!1), q(), l();
    } catch (v) {
      const ue = v != null && v.message ? `：${v.message}` : "";
      C.error(
        W ? (v == null ? void 0 : v.message) || "保存失败" : `创建并挂载失败，服务端已回滚文件${ue}`
      );
    } finally {
      P(!1);
    }
  };
  return Q ? n.createElement(
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
        "div",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        Y ? n.createElement(Y, {
          style: { fontSize: 14, color: "#1677ff" }
        }) : null,
        n.createElement(
          M,
          { strong: !0 },
          `工作区文档 (${_.length})`
        ),
        n.createElement(
          M,
          { type: "secondary", style: { fontSize: 12 } },
          `· ${f.length} 个已挂载到系统提示`
        )
      ),
      n.createElement(
        "div",
        { style: { display: "flex", gap: 8 } },
        n.createElement(
          y,
          {
            size: "small",
            icon: J ? n.createElement(J) : void 0,
            onClick: q
          },
          "刷新"
        ),
        n.createElement(
          y,
          {
            type: "primary",
            size: "small",
            icon: G ? n.createElement(G) : void 0,
            onClick: te
          },
          "新建 Markdown 文档"
        )
      )
    ),
    _.length === 0 ? n.createElement(T, {
      description: "暂无 Markdown 文档，点击「新建 Markdown 文档」添加",
      image: T.PRESENTED_IMAGE_SIMPLE
    }) : n.createElement(d, {
      dataSource: _,
      renderItem: (ne) => {
        const v = f.includes(ne.filename), ue = En.includes(ne.filename);
        return n.createElement(
          d.Item,
          {
            actions: [
              n.createElement(
                y,
                {
                  type: "link",
                  size: "small",
                  icon: N ? n.createElement(N) : void 0,
                  onClick: () => I(ne.filename)
                },
                "编辑"
              )
            ]
          },
          n.createElement(d.Item.Meta, {
            avatar: n.createElement(Y, {
              style: {
                fontSize: 20,
                color: v ? "#1677ff" : "#bfbfbf"
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
              n.createElement(M, null, ne.filename),
              ue ? n.createElement(
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
              `${(ne.size / 1024).toFixed(1)} KB · 修改于 ${new Date(ne.modified_time).toLocaleString()}`
            )
          }),
          n.createElement(u, {
            checked: v,
            size: "small",
            onChange: (pe) => me(ne.filename, pe)
          })
        );
      }
    }),
    // Edit/New file modal
    n.createElement(
      E,
      {
        open: O,
        onCancel: () => R(!1),
        title: W ? `编辑 ${W}` : "新建 Markdown 文档",
        width: 700,
        onOk: le,
        confirmLoading: ie,
        okText: "保存"
      },
      W ? null : n.createElement(
        "div",
        { style: { marginBottom: 12 } },
        n.createElement(b, {
          placeholder: "文件名（如：油藏工程记忆库.md）",
          value: m,
          onChange: (ne) => X(ne.target.value),
          addonAfter: m.endsWith(".md") ? "" : ".md"
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
        n.createElement(B, {
          size: "small",
          value: H,
          options: [
            { label: "源码", value: "source" },
            { label: "预览", value: "preview" }
          ],
          onChange: (ne) => D(ne)
        }),
        n.createElement(
          M,
          { type: "secondary", style: { fontSize: 12 } },
          `${L.length} 字符 · 约 ${Math.ceil(L.length / 4)} tokens · ${W && f.includes(W) ? "已挂载" : W ? "未挂载" : "保存后自动挂载"}`
        )
      ),
      L.trim() ? null : n.createElement(U, {
        type: "warning",
        showIcon: !0,
        message: "文档内容为空，保存前需要填写 Markdown 内容",
        style: { marginBottom: 10 }
      }),
      H === "source" ? n.createElement(b.TextArea, {
        value: L,
        onChange: (ne) => S(ne.target.value),
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
            border: "1px solid #d9d9d9",
            borderRadius: 6,
            background: "var(--ant-color-bg-container, #fff)"
          }
        },
        bt(L, n)
      )
    )
  );
}
function tl({
  skills: e,
  agentId: t
}) {
  const l = w().React, { useMemo: n } = l, {
    List: a,
    Tag: r,
    Typography: s,
    Empty: o,
    Button: d,
    message: c
  } = w().antd, { ThunderboltOutlined: u, CopyOutlined: y } = w().antdIcons || {}, { Text: E } = s, b = n(() => Mn(e), [e]), x = (C) => {
    try {
      const A = w();
      A.setSelectedAgent && A.setSelectedAgent(t);
    } catch {
    }
    try {
      sessionStorage.setItem("ugsci_pending_prompt", C.value);
    } catch {
    }
    window.history.pushState({}, "", "/chat"), window.dispatchEvent(new PopStateEvent("popstate"));
  }, T = (C) => {
    var A;
    (A = navigator.clipboard) == null || A.writeText(C.value).then(() => {
      c.success("已复制到剪贴板");
    });
  };
  return b.length === 0 ? l.createElement(o, {
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
      u ? l.createElement(u, {
        style: { fontSize: 14, color: "#1677ff" }
      }) : null,
      l.createElement(
        E,
        { strong: !0 },
        `推荐提问 (${b.length})`
      ),
      l.createElement(
        E,
        { type: "secondary", style: { fontSize: 12 } },
        "· 从技能描述中自动提取"
      )
    ),
    l.createElement(a, {
      dataSource: b,
      renderItem: (C, A) => l.createElement(
        a.Item,
        {
          actions: [
            l.createElement(
              d,
              {
                type: "link",
                size: "small",
                icon: y ? l.createElement(y) : void 0,
                onClick: () => T(C)
              },
              "复制"
            )
          ]
        },
        l.createElement(a.Item.Meta, {
          avatar: l.createElement(
            r,
            { color: "blue", style: { borderRadius: "50%" } },
            `${A + 1}`
          ),
          title: l.createElement(
            "div",
            {
              style: {
                cursor: "pointer",
                color: "#1677ff"
              },
              onClick: () => x(C)
            },
            C.value
          ),
          description: l.createElement(
            E,
            { type: "secondary", style: { fontSize: 12 } },
            C.label
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
}, Fn = { marginBottom: 16 }, Gn = {
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
}, Hn = {
  fontSize: 12,
  color: "rgba(0,0,0,0.45)",
  marginLeft: 8
};
function nl({ agentId: e }) {
  const t = w().React, { useState: l, useEffect: n, useCallback: a } = t, {
    Switch: r,
    InputNumber: s,
    Select: o,
    Button: d,
    Spin: c,
    Space: u,
    Typography: y,
    message: E
  } = w().antd, { PlayCircleOutlined: b, SaveOutlined: x } = w().antdIcons || {}, { Text: T } = y, [C, A] = l(!0), [B, U] = l(!1), [Y, G] = l(!1), [N, J] = l(!1), [M, _] = l(6), [K, Q] = l("h"), [k, f] = l("main"), [g, O] = l(300), [R, W] = l(!1), [re, L] = l("08:00"), [S, m] = l("22:00"), X = a(async () => {
    var q, me;
    A(!0);
    try {
      const I = await Wa(e), te = Ga(I.every ?? "6h");
      J(I.enabled ?? !1), _(te.number), Q(te.unit), f(I.target ?? "main"), O(I.timeoutSeconds ?? 300), W(!!I.activeHours), L(((q = I.activeHours) == null ? void 0 : q.start) ?? "08:00"), m(((me = I.activeHours) == null ? void 0 : me.end) ?? "22:00");
    } catch (I) {
      E.error(I.message || "加载心跳配置失败");
    } finally {
      A(!1);
    }
  }, [e]);
  n(() => {
    X();
  }, [X]);
  const ie = async () => {
    U(!0);
    try {
      await Ja(e, {
        enabled: N,
        every: Ha({ number: M, unit: K }),
        target: k,
        timeoutSeconds: g,
        activeHours: R && re && S ? { start: re, end: S } : void 0
      }), E.success("心跳配置已保存");
    } catch (q) {
      E.error(q.message || "保存心跳配置失败");
    } finally {
      U(!1);
    }
  }, P = async () => {
    G(!0);
    try {
      await Ka(e), E.success("已触发心跳检查");
    } catch (q) {
      E.error(q.message || "触发心跳失败");
    } finally {
      G(!1);
    }
  };
  if (C)
    return t.createElement(
      "div",
      { style: { textAlign: "center", padding: 40 } },
      t.createElement(c, { size: "large" })
    );
  const H = (q, me, I) => t.createElement(
    "div",
    { style: Fn },
    t.createElement("div", { style: Ye }, q),
    me,
    I ? t.createElement(
      T,
      { type: "secondary", style: Hn },
      I
    ) : null
  ), D = (q, me, I, te) => t.createElement(
    "div",
    { style: Gn },
    t.createElement(
      "div",
      null,
      t.createElement("div", { style: Ye }, q),
      me
    ),
    t.createElement(
      "div",
      null,
      t.createElement("div", { style: Ye }, I),
      te
    )
  ), { Divider: Z } = w().antd;
  return t.createElement(
    "div",
    { style: { paddingBottom: 8 } },
    // ── Section: 基本设置 ──
    t.createElement("div", { style: He }, "基本设置"),
    H(
      "启用心跳",
      t.createElement(r, {
        checked: N,
        onChange: (q) => J(q)
      }),
      N ? "已启用，专家将定期自检" : "已停用"
    ),
    D(
      "检查频率",
      t.createElement(
        u,
        null,
        t.createElement(s, {
          min: 1,
          value: M,
          onChange: (q) => _(q ?? 1),
          style: { width: "100%" }
        }),
        t.createElement(o, {
          value: K,
          onChange: (q) => Q(q),
          style: { width: 90 },
          options: [
            { value: "m", label: "分钟" },
            { value: "h", label: "小时" }
          ]
        })
      ),
      "心跳目标",
      t.createElement(o, {
        value: k,
        onChange: (q) => f(q),
        style: { width: "100%" },
        options: [
          { value: "main", label: "主会话 (main)" },
          { value: "last", label: "最近会话 (last)" },
          { value: "inbox", label: "收件箱 (inbox)" }
        ]
      })
    ),
    H(
      "超时时间 (秒)",
      t.createElement(s, {
        min: 1,
        max: 3600,
        value: g,
        onChange: (q) => O(q ?? 300),
        style: { width: 200 }
      })
    ),
    // ── Section: 活跃时段 ──
    t.createElement(Z, { style: { margin: "8px 0 16px" } }),
    t.createElement("div", { style: He }, "活跃时段"),
    H(
      "启用活跃时段限制",
      t.createElement(r, {
        checked: R,
        onChange: (q) => W(q)
      }),
      "仅在指定时段内触发心跳"
    ),
    R ? D(
      "开始时间",
      t.createElement("input", {
        type: "time",
        value: re,
        onChange: (q) => L(q.target.value),
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
        value: S,
        onChange: (q) => m(q.target.value),
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
        d,
        {
          type: "primary",
          icon: x ? t.createElement(x) : void 0,
          loading: B,
          onClick: ie,
          style: Ae
        },
        "保存配置"
      ),
      t.createElement(
        d,
        {
          icon: b ? t.createElement(b) : void 0,
          loading: Y,
          onClick: P
        },
        "立即执行"
      )
    )
  );
}
function al({
  agentId: e,
  onRefresh: t
}) {
  const l = w().React, { useState: n, useEffect: a, useCallback: r } = l, {
    List: s,
    Tag: o,
    Switch: d,
    Button: c,
    Empty: u,
    Spin: y,
    Typography: E,
    message: b
  } = w().antd, { PlusOutlined: x, ReloadOutlined: T, DeleteOutlined: C } = w().antdIcons || {}, { Text: A, Paragraph: B } = E, [U, Y] = n([]), [G, N] = n(!0), [J, M] = n(!1), [_, K] = n([]), [Q, k] = n(!1), f = r(async () => {
    N(!0);
    try {
      const L = await xt(e);
      Y(L);
    } catch (L) {
      b.error(L.message || "加载技能失败"), Y([]);
    } finally {
      N(!1);
    }
  }, [e]);
  a(() => {
    f();
  }, [f]);
  const g = async () => {
    M(!0), k(!0);
    try {
      const L = await Bt(!0);
      K(L);
    } catch (L) {
      b.error(L.message || "加载技能池失败");
    } finally {
      k(!1);
    }
  }, O = async (L) => {
    let S = 0, m = 0;
    for (const X of L)
      try {
        await jt(e, X), S++;
      } catch {
        m++;
      }
    S > 0 ? (b.success(
      `成功添加 ${S} 个技能${m > 0 ? `，${m} 个失败` : ""}`
    ), f(), t()) : m > 0 && b.error("添加技能失败"), M(!1);
  }, R = async (L, S) => {
    try {
      S ? await Ln(e, L.name) : await Un(e, L.name), b.success(S ? "已启用" : "已停用"), f(), t();
    } catch (m) {
      b.error(m.message || "操作失败");
    }
  }, W = async (L) => {
    try {
      await Ut(e, L), b.success(`技能「${L}」已移除`), f(), t();
    } catch (S) {
      b.error(S.message || "移除技能失败");
    }
  };
  if (G)
    return l.createElement(
      "div",
      { style: { textAlign: "center", padding: 40 } },
      l.createElement(y, { size: "large" })
    );
  const re = U.filter((L) => L.enabled !== !1);
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
        A,
        { strong: !0 },
        `技能列表 (${U.length}，已启用 ${re.length})`
      ),
      l.createElement(
        "div",
        { style: { display: "flex", gap: 8 } },
        l.createElement(
          c,
          {
            size: "small",
            icon: T ? l.createElement(T) : void 0,
            onClick: () => {
              st(), f();
            }
          },
          "刷新"
        ),
        l.createElement(
          c,
          {
            type: "primary",
            size: "small",
            icon: x ? l.createElement(x) : void 0,
            onClick: g,
            style: Ae
          },
          "从技能池添加"
        )
      )
    ),
    U.length === 0 ? l.createElement(u, {
      description: "该专家暂无技能",
      image: u.PRESENTED_IMAGE_SIMPLE
    }) : l.createElement(s, {
      dataSource: U,
      renderItem: (L) => l.createElement(
        s.Item,
        {
          actions: [
            l.createElement(d, {
              key: "toggle",
              size: "small",
              checked: L.enabled !== !1,
              onChange: (S) => R(L, S)
            }),
            l.createElement(
              c,
              {
                key: "del",
                type: "link",
                size: "small",
                danger: !0,
                icon: C ? l.createElement(C) : void 0,
                onClick: () => W(L.name)
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
            l.createElement(A, { strong: !0 }, L.name),
            L.version_text ? l.createElement(
              o,
              { style: { fontSize: 10 } },
              `v${L.version_text}`
            ) : null
          ),
          L.description ? l.createElement(
            B,
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
    l.createElement(Nn, {
      open: J,
      onClose: () => M(!1),
      poolSkills: _,
      installedSkillNames: U.map((L) => L.name),
      loading: Q,
      onInstall: O
    })
  );
}
function ll({
  agentId: e,
  onRefresh: t,
  isActive: l
}) {
  const n = w().React, { useState: a, useEffect: r, useCallback: s } = n, {
    List: o,
    Tag: d,
    Button: c,
    Empty: u,
    Spin: y,
    Modal: E,
    Input: b,
    Typography: x,
    message: T
  } = w().antd, { PlusOutlined: C, ReloadOutlined: A, DeleteOutlined: B } = w().antdIcons || {}, { Text: U, Paragraph: Y } = x, { TextArea: G } = b, [N, J] = a([]), [M, _] = a(!0), [K, Q] = a(!1), [k, f] = a(`{
  "mcpServers": {
    "example-client": {
      "command": "npx",
      "args": ["-y", "@example/mcp-server"],
      "env": {}
    }
  }
}`), [g, O] = a(!1), R = s(async () => {
    _(!0);
    try {
      const S = await Nt(e);
      J(S);
    } catch (S) {
      T.error(S.message || "加载 MCP 失败"), J([]);
    } finally {
      _(!1);
    }
  }, [e]);
  r(() => {
    R();
  }, [R]), r(() => {
    l && R();
  }, [l, R]);
  const W = async (S) => {
    try {
      await Da(e, S), T.success("已切换 MCP 状态"), R(), t();
    } catch (m) {
      T.error(m.message || "切换失败");
    }
  }, re = async (S) => {
    try {
      await Bn(e, S), T.success(`MCP「${S}」已移除`), R(), t();
    } catch (m) {
      T.error(m.message || "移除 MCP 失败");
    }
  }, L = async () => {
    O(!0);
    try {
      const S = JSON.parse(k), m = S.mcpServers || S, X = Object.entries(m);
      if (X.length === 0) {
        T.warning("未找到 MCP 客户端配置");
        return;
      }
      for (const [ie, P] of X) {
        const H = P, D = H.url ? "streamable_http" : "stdio";
        await jn(e, {
          client_key: ie,
          client: {
            name: H.name || ie,
            description: H.description || "",
            enabled: !0,
            transport: D,
            url: H.url || "",
            command: H.command || "",
            args: H.args || [],
            env: H.env || {},
            cwd: H.cwd || "",
            headers: H.headers || {}
          }
        });
      }
      T.success("MCP 客户端已创建"), Q(!1), R(), t();
    } catch (S) {
      S instanceof SyntaxError ? T.error("JSON 格式错误：" + S.message) : T.error(S.message || "创建 MCP 失败");
    } finally {
      O(!1);
    }
  };
  return M ? n.createElement(
    "div",
    { style: { textAlign: "center", padding: 40 } },
    n.createElement(y, { size: "large" })
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
      n.createElement(U, { strong: !0 }, `MCP 客户端 (${N.length})`),
      n.createElement(
        "div",
        { style: { display: "flex", gap: 8 } },
        n.createElement(
          c,
          {
            size: "small",
            icon: A ? n.createElement(A) : void 0,
            onClick: () => {
              st(), R();
            }
          },
          "刷新"
        ),
        n.createElement(
          c,
          {
            type: "primary",
            size: "small",
            icon: C ? n.createElement(C) : void 0,
            onClick: () => Q(!0),
            style: Ae
          },
          "添加 MCP"
        )
      )
    ),
    N.length === 0 ? n.createElement(u, {
      description: "该专家暂无 MCP 客户端",
      image: u.PRESENTED_IMAGE_SIMPLE
    }) : n.createElement(o, {
      dataSource: N,
      renderItem: (S) => n.createElement(
        o.Item,
        {
          actions: [
            n.createElement(
              c,
              {
                key: "toggle",
                size: "small",
                onClick: () => W(S.key)
              },
              S.enabled ? "停用" : "启用"
            ),
            n.createElement(
              c,
              {
                key: "del",
                type: "link",
                size: "small",
                danger: !0,
                icon: B ? n.createElement(B) : void 0,
                onClick: () => re(S.key)
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
            n.createElement(U, { strong: !0 }, S.name || S.key),
            n.createElement(
              d,
              {
                color: S.enabled ? "green" : "default",
                style: { fontSize: 10 }
              },
              S.enabled ? "启用" : "停用"
            ),
            n.createElement(
              d,
              { color: "purple", style: { fontSize: 10 } },
              S.transport
            )
          ),
          S.description ? n.createElement(
            Y,
            {
              type: "secondary",
              style: { fontSize: 12, margin: 0 },
              ellipsis: { rows: 2 }
            },
            S.description
          ) : null,
          S.tools && S.tools.length > 0 ? n.createElement(
            "div",
            { style: { marginTop: 4, fontSize: 11, color: "#8c8c8c" } },
            `提供 ${S.tools.length} 个工具`
          ) : null
        )
      )
    }),
    // Create MCP modal
    n.createElement(
      E,
      {
        open: K,
        title: "添加 MCP 客户端 (JSON)",
        onCancel: () => Q(!1),
        onOk: L,
        confirmLoading: g,
        okText: "创建",
        width: 560
      },
      n.createElement(
        "div",
        { style: { marginBottom: 8, fontSize: 12, color: "#8c8c8c" } },
        "粘贴 MCP 配置 JSON（支持 mcpServers 格式），将创建到当前专家工作区："
      ),
      n.createElement(G, {
        value: k,
        onChange: (S) => f(S.target.value),
        rows: 12,
        style: { fontFamily: "monospace", fontSize: 12 }
      })
    )
  );
}
function rl({ agentId: e }) {
  const t = w().React, { useState: l, useEffect: n, useCallback: a, useRef: r } = t, {
    Card: s,
    InputNumber: o,
    Input: d,
    Select: c,
    Switch: u,
    Button: y,
    Spin: E,
    Space: b,
    Typography: x,
    Divider: T,
    message: C
  } = w().antd, { SaveOutlined: A } = w().antdIcons || {}, { Text: B } = x, [U, Y] = l(!0), [G, N] = l(!1), J = r(null), [M, _] = l(60), [K, Q] = l(""), [k, f] = l(!0), [g, O] = l(30), [R, W] = l("zh"), [re, L] = l("UTC"), [S, m] = l(!0), [X, ie] = l(100), [P, H] = l(!0), [D, Z] = l(3), [q, me] = l(1), [I, te] = l(!0), [le, ne] = l(3), [v, ue] = l(2), [pe, Se] = l(60), [Te, he] = l(1), [ee, F] = l(0), [h, ae] = l(1), [de, ge] = l(0), [j, p] = l(30), [ce, ye] = l(50), [be, xe] = l("light"), [Ie, Be] = l("scroll"), [_e, Re] = l("remelight"), [Me, Ue] = l("AUTO"), Ne = a(async () => {
    var V, ke, ze, Oe, Je, Ke;
    Y(!0);
    try {
      const [ve, ot, kt] = await Promise.all([
        qa(e),
        Va(e).catch(() => "zh"),
        Qa().catch(() => "UTC")
      ]);
      J.current = ve, _(ve.shell_command_timeout ?? 60), Q(ve.shell_command_executable ?? "");
      const et = ve.auto_title_config ?? { enabled: !0, timeout_seconds: 30 };
      f(et.enabled ?? !0), O(et.timeout_seconds ?? 30), W(ot), L(kt);
      const Fe = ve.loop ?? {};
      m(((V = Fe.iteration) == null ? void 0 : V.enabled) ?? !0), ie(((ke = Fe.iteration) == null ? void 0 : ke.max_iterations) ?? ve.max_iters ?? 100), H(((ze = Fe.doom_loop) == null ? void 0 : ze.enabled) ?? !0), Z(((Oe = Fe.doom_loop) == null ? void 0 : Oe.window_size) ?? 3), me(((Je = Fe.doom_loop) == null ? void 0 : Je.similarity_threshold) ?? 1), te(ve.llm_retry_enabled ?? !0), ne(ve.llm_max_retries ?? 3), ue(ve.llm_backoff_base ?? 2), Se(ve.llm_backoff_cap ?? 60), he(ve.llm_max_concurrent ?? 1), F(ve.llm_max_qpm ?? 0), ae(ve.llm_rate_limit_pause ?? 1), ge(ve.llm_rate_limit_jitter ?? 0), p(ve.llm_acquire_timeout ?? 30), ye(ve.history_max_length ?? 50), xe(ve.context_manager_backend ?? "light"), Be(((Ke = ve.light_context_config) == null ? void 0 : Ke.strategy) ?? "scroll"), Re(ve.memory_manager_backend ?? "remelight"), Ue(ve.approval_level ?? "AUTO");
    } catch (ve) {
      C.error(ve.message || "加载运行配置失败");
    } finally {
      Y(!1);
    }
  }, [e]);
  n(() => {
    Ne();
  }, [Ne]);
  const De = async () => {
    var ke, ze;
    const V = J.current;
    if (V) {
      N(!0);
      try {
        const Oe = {
          ...V,
          max_iters: X,
          loop: {
            ...V.loop ?? {},
            iteration: { enabled: S, max_iterations: X },
            doom_loop: {
              enabled: P,
              window_size: D,
              similarity_threshold: q,
              stages: ((ze = (ke = V.loop) == null ? void 0 : ke.doom_loop) == null ? void 0 : ze.stages) ?? []
            }
          },
          shell_command_timeout: M,
          shell_command_executable: K,
          auto_title_config: {
            enabled: k,
            timeout_seconds: g
          },
          llm_retry_enabled: I,
          llm_max_retries: le,
          llm_backoff_base: v,
          llm_backoff_cap: pe,
          llm_max_concurrent: Te,
          llm_max_qpm: ee,
          llm_rate_limit_pause: h,
          llm_rate_limit_jitter: de,
          llm_acquire_timeout: j,
          history_max_length: ce,
          context_manager_backend: be,
          light_context_config: {
            ...V.light_context_config ?? {},
            strategy: Ie
          },
          memory_manager_backend: _e,
          approval_level: Me
        };
        await Xa(e, Oe), J.current = Oe, R && await Ya(e, R).catch(() => {
        }), re && await Za(re).catch(() => {
        }), C.success("运行配置已保存");
      } catch (Oe) {
        C.error(Oe.message || "保存运行配置失败");
      } finally {
        N(!1);
      }
    }
  };
  if (U)
    return t.createElement(
      "div",
      { style: { textAlign: "center", padding: 40 } },
      t.createElement(E, { size: "large" })
    );
  const we = (V, ke, ze) => t.createElement(
    "div",
    { style: Fn },
    t.createElement("div", { style: Ye }, V),
    ke,
    ze ? t.createElement(
      B,
      { type: "secondary", style: Hn },
      ze
    ) : null
  ), Pe = (V, ke, ze, Oe) => t.createElement(
    "div",
    { style: Gn },
    t.createElement(
      "div",
      null,
      t.createElement("div", { style: Ye }, V),
      ke
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
    Pe(
      "Shell 命令超时 (秒)",
      t.createElement(o, {
        min: 1,
        value: M,
        onChange: (V) => _(V ?? 60),
        style: { width: "100%" }
      }),
      "Shell 可执行文件",
      t.createElement(d, {
        value: K,
        onChange: (V) => Q(V.target.value),
        placeholder: "留空使用系统默认",
        style: { width: "100%" }
      })
    ),
    Pe(
      "语言",
      t.createElement(c, {
        value: R,
        onChange: (V) => W(V),
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
        value: re,
        onChange: (V) => L(V),
        style: { width: "100%" },
        showSearch: !0,
        filterOption: (V, ke) => {
          var ze;
          return (((ze = ke == null ? void 0 : ke.label) == null ? void 0 : ze.toString()) || "").toLowerCase().includes(V.toLowerCase());
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
        ].map((V) => ({ value: V, label: V }))
      })
    ),
    Pe(
      "自动生成会话标题",
      t.createElement(b, null, t.createElement(u, {
        checked: k,
        onChange: (V) => f(V)
      })),
      "标题生成超时 (秒)",
      t.createElement(o, {
        min: 5,
        value: g,
        onChange: (V) => O(V ?? 30),
        style: { width: "100%" },
        disabled: !k
      })
    ),
    // ── Section: 审批级别 ──
    t.createElement(T, { style: { margin: "8px 0 16px" } }),
    t.createElement("div", { style: He }, "审批级别"),
    we(
      "工具执行审批",
      t.createElement(c, {
        value: Me,
        onChange: (V) => Ue(V),
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
    t.createElement(T, { style: { margin: "8px 0 16px" } }),
    t.createElement("div", { style: He }, "迭代与循环"),
    we(
      "启用迭代限制",
      t.createElement(u, {
        checked: S,
        onChange: (V) => m(V)
      }),
      "停止 Agent 前的最大循环轮次"
    ),
    S ? we(
      "最大迭代次数",
      t.createElement(o, {
        min: 1,
        max: 500,
        value: X,
        onChange: (V) => ie(V ?? 100),
        style: { width: "100%" }
      })
    ) : null,
    we(
      "启用重复循环保护",
      t.createElement(u, {
        checked: P,
        onChange: (V) => H(V)
      }),
      "检测并阻止重复操作循环"
    ),
    P ? Pe(
      "检测窗口大小",
      t.createElement(o, {
        min: 2,
        max: 20,
        value: D,
        onChange: (V) => Z(V ?? 3),
        style: { width: "100%" }
      }),
      "相似度阈值",
      t.createElement(o, {
        min: 0,
        max: 1,
        step: 0.05,
        value: q,
        onChange: (V) => me(V ?? 1),
        style: { width: "100%" }
      })
    ) : null,
    // ── Section: LLM 重试 ──
    t.createElement(T, { style: { margin: "8px 0 16px" } }),
    t.createElement("div", { style: He }, "LLM 重试"),
    we(
      "启用 LLM 重试",
      t.createElement(u, {
        checked: I,
        onChange: (V) => te(V)
      })
    ),
    Pe(
      "最大重试次数",
      t.createElement(o, {
        min: 1,
        value: le,
        onChange: (V) => ne(V ?? 3),
        style: { width: "100%" },
        disabled: !I
      }),
      "退避基数 (秒)",
      t.createElement(o, {
        min: 0.1,
        step: 0.1,
        value: v,
        onChange: (V) => ue(V ?? 2),
        style: { width: "100%" },
        disabled: !I
      })
    ),
    we(
      "退避上限 (秒)",
      t.createElement(o, {
        min: 0.5,
        step: 0.5,
        value: pe,
        onChange: (V) => Se(V ?? 60),
        style: { width: 200 },
        disabled: !I
      })
    ),
    // ── Section: LLM 限流 ──
    t.createElement(T, { style: { margin: "8px 0 16px" } }),
    t.createElement("div", { style: He }, "LLM 限流"),
    Pe(
      "最大并发数",
      t.createElement(o, {
        min: 1,
        value: Te,
        onChange: (V) => he(V ?? 1),
        style: { width: "100%" }
      }),
      "最大 QPM (0=不限)",
      t.createElement(o, {
        min: 0,
        step: 10,
        value: ee,
        onChange: (V) => F(V ?? 0),
        style: { width: "100%" }
      })
    ),
    Pe(
      "限流暂停时间 (秒)",
      t.createElement(o, {
        min: 1,
        step: 0.5,
        value: h,
        onChange: (V) => ae(V ?? 1),
        style: { width: "100%" }
      }),
      "限流抖动 (秒)",
      t.createElement(o, {
        min: 0,
        step: 0.5,
        value: de,
        onChange: (V) => ge(V ?? 0),
        style: { width: "100%" }
      })
    ),
    we(
      "获取超时 (秒)",
      t.createElement(o, {
        min: 10,
        step: 10,
        value: j,
        onChange: (V) => p(V ?? 30),
        style: { width: 200 }
      }),
      "应大于 限流暂停 + 抖动"
    ),
    // ── Section: 上下文与记忆 ──
    t.createElement(T, { style: { margin: "8px 0 16px" } }),
    t.createElement("div", { style: He }, "上下文与记忆"),
    Pe(
      "上下文管理后端",
      t.createElement(c, {
        value: be,
        onChange: (V) => xe(V),
        style: { width: "100%" },
        options: [{ value: "light", label: "light" }]
      }),
      "上下文策略",
      t.createElement(c, {
        value: Ie,
        onChange: (V) => Be(V),
        style: { width: "100%" },
        options: [
          { value: "scroll", label: "scroll (滚动窗口)" },
          { value: "native", label: "native (原生)" }
        ]
      })
    ),
    Pe(
      "记忆管理后端",
      t.createElement(c, {
        value: _e,
        onChange: (V) => Re(V),
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
        value: ce,
        onChange: (V) => ye(V ?? 50),
        style: { width: "100%" }
      })
    ),
    // ── Save button ──
    t.createElement(
      "div",
      { style: { display: "flex", justifyContent: "flex-end", marginTop: 16 } },
      t.createElement(
        y,
        {
          type: "primary",
          icon: A ? t.createElement(A) : void 0,
          loading: G,
          onClick: De,
          style: Ae
        },
        "保存运行配置"
      )
    )
  );
}
function sl({
  expert: e,
  open: t,
  onClose: l,
  onRefresh: n
}) {
  const a = w().React, { useState: r, useEffect: s, useCallback: o } = a, { Modal: d, Tabs: c, Spin: u, Typography: y } = w().antd, { SettingOutlined: E } = w().antdIcons || {}, { Text: b } = y, [x, T] = r([]), [C, A] = r(!1), [B, U] = r("heartbeat"), Y = o(async () => {
    if (e) {
      A(!0);
      try {
        const M = await el(e.agent.id);
        T(M);
      } catch {
        T([]);
      } finally {
        A(!1);
      }
    }
  }, [e]);
  if (s(() => {
    t && e && Y();
  }, [t, e, Y]), !e) return null;
  const { agent: G } = e, N = () => {
    Y(), n();
  }, J = [
    {
      key: "heartbeat",
      label: "心跳",
      children: a.createElement(nl, {
        agentId: G.id
      })
    },
    {
      key: "files",
      label: "文件",
      children: C ? a.createElement(
        "div",
        { style: { textAlign: "center", padding: 40 } },
        a.createElement(u, { size: "large" })
      ) : a.createElement(Dn, {
        agentId: G.id,
        systemPromptFiles: x,
        onRefresh: N
      })
    },
    {
      key: "skills",
      label: `技能 (${e.skills.filter((M) => M.enabled !== !1).length})`,
      children: a.createElement(al, {
        agentId: G.id,
        onRefresh: n
      })
    },
    {
      key: "mcp",
      label: `MCP (${e.mcps.length})`,
      children: a.createElement(ll, {
        agentId: G.id,
        onRefresh: n,
        isActive: B === "mcp"
      })
    },
    {
      key: "running",
      label: "运行配置",
      children: a.createElement(rl, {
        agentId: G.id
      })
    }
  ];
  return a.createElement(
    d,
    {
      open: t,
      title: a.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 8 } },
        E ? a.createElement(E, { style: { fontSize: 18 } }) : null,
        a.createElement("span", null, `配置 - ${G.name}`),
        a.createElement(
          b,
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
    a.createElement(c, {
      items: J,
      activeKey: B,
      onChange: (M) => U(M),
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
], il = ol;
function vn(e) {
  return vt(`/ugsci/avatar/${encodeURIComponent(e)}`);
}
function bn(e) {
  const t = e.map(encodeURIComponent).join(",");
  return vt(`/ugsci/avatar/team/${t}`);
}
function Le({
  name: e,
  size: t = 32,
  borderRadius: l = "50%"
}) {
  const n = w().React, [a, r] = n.useState(0), s = a === 0 ? vn(e) : `${vn(e)}?_r=${a}`;
  return n.createElement("img", {
    src: s,
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
function Dt({
  members: e,
  size: t = 32,
  borderRadius: l = "50%"
}) {
  const n = w().React, [a, r] = n.useState(0);
  if (!e || e.length === 0)
    return n.createElement("span", {
      style: {
        width: t,
        height: t,
        display: "inline-block"
      }
    });
  const s = e.slice(0, 5), o = a === 0 ? bn(s) : `${bn(s)}?_r=${a}`;
  return n.createElement("img", {
    src: o,
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
function cl({
  expert: e,
  onClick: t,
  onSummon: l,
  onConfigure: n
}) {
  const a = w().React, { Card: r, Tag: s, Badge: o, Typography: d, Spin: c, Button: u, Tooltip: y } = w().antd, { Text: E } = d, { ThunderboltOutlined: b, SettingOutlined: x } = w().antdIcons || {}, { agent: T, skills: C, mcps: A, loading: B } = e, U = T.enabled, Y = C.filter((J) => J.enabled !== !1).map((J) => J.name), G = A.map((J) => J.name || J.key), N = T.active_model ? `${T.active_model.provider_id}/${T.active_model.model}` : null;
  return a.createElement(
    r,
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
        a.createElement(Le, { name: T.name, size: 36 }),
        a.createElement(
          "div",
          null,
          a.createElement(
            E,
            { strong: !0, style: { fontSize: 15 } },
            T.name
          ),
          a.createElement(
            "div",
            {
              style: {
                fontSize: 11,
                color: "#bfbfbf",
                fontFamily: "monospace"
              }
            },
            T.id
          )
        )
      ),
      a.createElement(o, {
        status: U ? "success" : "default",
        text: U ? "启用" : "停用"
      })
    ),
    // Description (rendered as markdown)
    T.description ? a.createElement(
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
      bt(T.description, a)
    ) : a.createElement(
      "div",
      { style: { fontSize: 12, color: "#bfbfbf", marginBottom: 10, minHeight: 54, flex: "1 0 auto" } },
      "暂无描述"
    ),
    // Model info
    N ? a.createElement(
      "div",
      { style: { marginBottom: 8 } },
      a.createElement(
        s,
        { color: "geekblue", style: { fontSize: 11 } },
        `🤖 ${N}`
      )
    ) : null,
    // Skills
    B ? a.createElement(c, { size: "small" }) : a.createElement(
      "div",
      { style: { marginBottom: 6 } },
      a.createElement(
        "div",
        { style: { fontSize: 11, color: "#8c8c8c", marginBottom: 4 } },
        `技能 (${Y.length})`
      ),
      a.createElement(hn, {
        items: Y,
        max: 4,
        color: "cyan",
        emptyText: "未配置技能"
      })
    ),
    // MCP
    !B && G.length > 0 ? a.createElement(
      "div",
      { style: { marginTop: "auto" } },
      a.createElement(
        "div",
        { style: { fontSize: 11, color: "#8c8c8c", marginBottom: 4 } },
        `MCP (${G.length})`
      ),
      a.createElement(hn, {
        items: G,
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
        y,
        { title: "配置专家", placement: "top" },
        a.createElement(
          u,
          {
            type: "text",
            size: "small",
            icon: x ? a.createElement(x, {
              style: { fontSize: 16, color: "#8c8c8c" }
            }) : void 0,
            onClick: (J) => {
              J.stopPropagation(), n && n();
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
          icon: b ? a.createElement(b) : void 0,
          disabled: !U,
          onClick: (J) => {
            J.stopPropagation(), l && l();
          },
          style: Ae
        },
        "召唤专家"
      )
    )
  );
}
function dl({
  expert: e,
  open: t,
  onClose: l,
  onRefresh: n
}) {
  const a = w().React, {
    Drawer: r,
    Descriptions: s,
    Tag: o,
    Typography: d,
    Space: c,
    Button: u,
    Empty: y,
    Tabs: E,
    List: b,
    Spin: x,
    Modal: T,
    message: C
  } = w().antd, { Text: A, Paragraph: B } = d, {
    EditOutlined: U,
    ThunderboltOutlined: Y,
    FileTextOutlined: G,
    ToolOutlined: N,
    PlusOutlined: J
  } = w().antdIcons || {}, [M, _] = a.useState(!1), [K, Q] = a.useState(
    []
  ), [k, f] = a.useState(!1);
  if (!e) return null;
  const { agent: g, config: O, skills: R, mcps: W, loading: re } = e, L = R.filter((I) => I.enabled !== !1), S = (I) => {
    window.history.pushState({}, "", I), window.dispatchEvent(new PopStateEvent("popstate"));
  }, m = a.createElement(
    "div",
    null,
    a.createElement(
      s,
      { column: 1, bordered: !0, size: "small" },
      a.createElement(s.Item, { label: "专家名称" }, g.name),
      a.createElement(
        s.Item,
        { label: "专家 ID" },
        a.createElement("code", { style: { fontSize: 12 } }, g.id)
      ),
      a.createElement(
        s.Item,
        { label: "状态" },
        a.createElement(
          o,
          { color: g.enabled ? "green" : "default" },
          g.enabled ? "启用" : "停用"
        )
      ),
      a.createElement(
        s.Item,
        { label: "功能简介" },
        g.description ? bt(g.description, a) : "暂无描述"
      ),
      a.createElement(
        s.Item,
        { label: "使用模型" },
        g.active_model ? `${g.active_model.provider_id} / ${g.active_model.model}` : "使用全局默认模型"
      ),
      O != null && O.workspace_dir ? a.createElement(
        s.Item,
        { label: "工作区路径" },
        a.createElement(
          "code",
          { style: { fontSize: 11 } },
          O.workspace_dir
        )
      ) : null,
      O != null && O.approval_level ? a.createElement(
        s.Item,
        { label: "审批级别" },
        O.approval_level
      ) : null
    ),
    // System prompt files
    O != null && O.system_prompt_files && O.system_prompt_files.length > 0 ? a.createElement(
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
        G ? a.createElement(G, {
          style: { fontSize: 14, color: "#1677ff" }
        }) : null,
        a.createElement(A, { strong: !0 }, "系统提示词文件")
      ),
      a.createElement(
        c,
        { wrap: !0 },
        ...O.system_prompt_files.map(
          (I, te) => a.createElement(
            o,
            {
              key: te,
              icon: G ? a.createElement(G) : void 0,
              style: { fontSize: 12 }
            },
            I
          )
        )
      )
    ) : null
  ), X = async () => {
    _(!0), f(!0);
    try {
      const I = await Bt(!0);
      Q(I);
    } catch (I) {
      C.error(I.message || "加载技能池失败");
    } finally {
      f(!1);
    }
  }, ie = async (I) => {
    let te = 0, le = 0;
    for (const ne of I)
      try {
        await jt(g.id, ne), te++;
      } catch {
        le++;
      }
    te > 0 ? (C.success(
      `成功添加 ${te} 个技能${le > 0 ? `，${le} 个失败` : ""}`
    ), n()) : le > 0 && C.error("添加技能失败"), _(!1);
  }, P = async (I) => {
    try {
      await Ut(g.id, I), C.success(`技能「${I}」已移除`), n();
    } catch (te) {
      C.error(te.message || "移除技能失败");
    }
  }, H = async (I) => {
    try {
      await Bn(g.id, I), C.success(`MCP「${I}」已移除`), n();
    } catch (te) {
      C.error(te.message || "移除 MCP 失败");
    }
  }, D = re ? a.createElement(
    "div",
    { style: { textAlign: "center", padding: 40 } },
    a.createElement(x, { size: "large" })
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
        A,
        { strong: !0 },
        `已启用技能 (${L.length})`
      ),
      a.createElement(
        u,
        {
          type: "primary",
          size: "small",
          icon: J ? a.createElement(J) : void 0,
          onClick: X
        },
        "从技能池添加"
      )
    ),
    L.length === 0 ? a.createElement(y, {
      description: "该专家暂无已启用的技能",
      image: y.PRESENTED_IMAGE_SIMPLE
    }) : a.createElement(b, {
      dataSource: L,
      renderItem: (I) => a.createElement(
        b.Item,
        {
          actions: [
            a.createElement(
              u,
              {
                type: "link",
                size: "small",
                danger: !0,
                onClick: () => P(I.name)
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
            I.emoji ? a.createElement(
              "span",
              { style: { fontSize: 16 } },
              I.emoji
            ) : null,
            a.createElement(A, { strong: !0 }, I.name),
            I.version_text ? a.createElement(
              o,
              { style: { fontSize: 10 } },
              `v${I.version_text}`
            ) : null
          ),
          I.description ? a.createElement(
            B,
            {
              type: "secondary",
              style: { fontSize: 12, margin: 0 },
              ellipsis: { rows: 2 }
            },
            I.description
          ) : null,
          I.tags && I.tags.length > 0 ? a.createElement(
            "div",
            { style: { marginTop: 4 } },
            ...I.tags.map(
              (te, le) => a.createElement(
                o,
                {
                  key: le,
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
    a.createElement(Nn, {
      open: M,
      onClose: () => _(!1),
      poolSkills: K,
      installedSkillNames: L.map((I) => I.name),
      loading: k,
      onInstall: ie
    })
  ), Z = re ? a.createElement(
    "div",
    { style: { textAlign: "center", padding: 40 } },
    a.createElement(x, { size: "large" })
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
        A,
        { strong: !0 },
        `MCP 客户端 (${W.length})`
      ),
      a.createElement(
        u,
        {
          type: "primary",
          size: "small",
          icon: J ? a.createElement(J) : void 0,
          onClick: () => {
            window.history.pushState({}, "", `/agents/${g.id}/mcp`), window.dispatchEvent(new PopStateEvent("popstate"));
          }
        },
        "配置 MCP"
      )
    ),
    W.length === 0 ? a.createElement(y, {
      description: "该专家暂无关联的 MCP 客户端，点击「配置 MCP」添加",
      image: y.PRESENTED_IMAGE_SIMPLE
    }) : a.createElement(b, {
      dataSource: W,
      renderItem: (I) => a.createElement(
        b.Item,
        {
          actions: [
            a.createElement(
              u,
              {
                type: "link",
                size: "small",
                danger: !0,
                onClick: () => H(I.key)
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
              A,
              { strong: !0 },
              I.name || I.key
            ),
            a.createElement(
              o,
              {
                color: I.enabled ? "green" : "default",
                style: { fontSize: 10 }
              },
              I.enabled ? "启用" : "停用"
            ),
            a.createElement(
              o,
              { color: "purple", style: { fontSize: 10 } },
              I.transport
            )
          ),
          I.description ? a.createElement(
            B,
            {
              type: "secondary",
              style: { fontSize: 12, margin: 0 },
              ellipsis: { rows: 2 }
            },
            I.description
          ) : null,
          I.tools && I.tools.length > 0 ? a.createElement(
            "div",
            {
              style: {
                marginTop: 4,
                fontSize: 11,
                color: "#8c8c8c"
              }
            },
            `提供 ${I.tools.length} 个工具`
          ) : null
        )
      )
    })
  ), q = O != null && O.tools ? a.createElement(
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
        N ? a.createElement(N, {
          style: { fontSize: 14, color: "#1677ff" }
        }) : null,
        a.createElement(A, { strong: !0 }, "工具配置")
      ),
      a.createElement(
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
        JSON.stringify(O.tools, null, 2)
      )
    )
  ) : a.createElement(y, {
    description: "暂无工具配置",
    image: y.PRESENTED_IMAGE_SIMPLE
  }), me = [
    { key: "basic", label: "基本信息", children: m },
    {
      key: "skills",
      label: `技能 (${L.length})`,
      children: D
    },
    {
      key: "prompts",
      label: "推荐提问",
      children: a.createElement(tl, {
        skills: L,
        agentId: g.id
      })
    },
    {
      key: "knowledge",
      label: "专家记忆",
      children: a.createElement(Dn, {
        agentId: g.id,
        systemPromptFiles: (O == null ? void 0 : O.system_prompt_files) || [],
        onRefresh: () => n()
      })
    },
    { key: "mcp", label: `MCP (${W.length})`, children: Z },
    { key: "tools", label: "工具配置", children: q }
  ];
  return a.createElement(
    r,
    {
      title: a.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 8 } },
        a.createElement(Le, { name: g.name, size: 28 }),
        a.createElement("span", null, g.name)
      ),
      open: t,
      onClose: l,
      width: 560,
      extra: a.createElement(
        c,
        null,
        a.createElement(
          u,
          {
            size: "small",
            icon: U ? a.createElement(U) : void 0,
            onClick: () => {
              l();
              try {
                const I = w();
                I.setSelectedAgent && I.setSelectedAgent(g.id);
              } catch (I) {
                console.warn("[ugsci] Failed to set selected agent:", I);
              }
              setTimeout(() => S("/agents"), 0);
            }
          },
          "编辑专家"
        ),
        a.createElement(
          u,
          {
            type: "primary",
            size: "small",
            icon: Y ? a.createElement(Y) : void 0,
            onClick: () => {
              l();
              try {
                const I = w();
                I.setSelectedAgent && I.setSelectedAgent(g.id);
              } catch (I) {
                console.warn("[ugsci] Failed to set selected agent:", I);
              }
              setTimeout(() => S("/chat"), 0);
            }
          },
          "开始对话"
        )
      )
    },
    a.createElement(E, {
      items: me,
      defaultActiveKey: "basic"
    })
  );
}
function ml({
  open: e,
  onClose: t,
  onCreated: l
}) {
  const n = w().React, { useState: a } = n, {
    Modal: r,
    Card: s,
    Tag: o,
    Input: d,
    Row: c,
    Col: u,
    Spin: y,
    message: E,
    Typography: b
  } = w().antd, { Text: x } = b, { FileAddOutlined: T } = w().antdIcons || {}, [C, A] = a(!1), [B, U] = a(""), [Y, G] = a(!1), N = async (_, K) => {
    A(!0);
    try {
      const Q = await se("/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: _ || "新专家",
          description: K || "",
          skill_names: []
        })
      });
      await Et(
        Q.id,
        "AGENTS.md",
        `# ${_ || "新专家"}

请在此处编写该专家的系统提示词。
`
      ), E.success("专家「" + (_ || "新专家") + "」创建成功"), G(!1), setTimeout(() => {
        t(), l();
      }, 0);
    } catch (Q) {
      E.error(Q.message || "创建专家失败");
    } finally {
      A(!1);
    }
  }, J = il.filter((_) => {
    if (!B.trim()) return !0;
    const K = B.toLowerCase();
    return _.name.toLowerCase().includes(K) || _.description.toLowerCase().includes(K) || _.category.toLowerCase().includes(K);
  }), M = async (_) => {
    A(!0);
    try {
      const K = await se("/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: _.name,
          description: _.description,
          skill_names: _.recommended_skills
        })
      });
      await Et(K.id, "AGENTS.md", _.system_prompt);
      const Q = await Lt(K.id);
      Q.approval_level = _.approval_level, await se(`/agents/${encodeURIComponent(K.id)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Q)
      }), E.success(`专家「${_.name}」创建成功`), t(), l();
    } catch (K) {
      E.error(K.message || "创建专家失败");
    } finally {
      A(!1);
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
        n.createElement(d, {
          placeholder: "搜索模板名称或类别...",
          value: B,
          onChange: (_) => U(_.target.value),
          allowClear: !0
        })
      ),
      C ? n.createElement(
        "div",
        { style: { textAlign: "center", padding: 60 } },
        n.createElement(y, { size: "large" }),
        n.createElement(
          "div",
          { style: { marginTop: 12, color: "#8c8c8c" } },
          "正在创建专家..."
        )
      ) : n.createElement(
        c,
        { gutter: [12, 12] },
        // ── Blank template card (always first) ──
        B.trim() ? null : n.createElement(
          u,
          { xs: 24, sm: 12 },
          n.createElement(
            s,
            {
              hoverable: !0,
              size: "small",
              onClick: () => G(!0),
              style: {
                cursor: "pointer",
                height: "100%",
                border: "2px dashed #d9d9d9",
                background: "#fafafa"
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
                { style: { fontSize: 28, color: "#8c8c8c" } },
                T ? n.createElement(T) : "📝"
              ),
              n.createElement(
                "div",
                { style: { flex: 1 } },
                n.createElement(
                  x,
                  { strong: !0, style: { fontSize: 15 } },
                  "从空白模版开始创建"
                ),
                n.createElement(
                  "div",
                  null,
                  n.createElement(
                    o,
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
        ...J.map(
          (_) => n.createElement(
            u,
            { key: _.id, xs: 24, sm: 12 },
            n.createElement(
              s,
              {
                hoverable: !0,
                size: "small",
                onClick: () => M(_),
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
                n.createElement(Le, {
                  name: _.name,
                  size: 40
                }),
                n.createElement(
                  "div",
                  { style: { flex: 1 } },
                  n.createElement(
                    x,
                    { strong: !0, style: { fontSize: 15 } },
                    _.name
                  ),
                  n.createElement(
                    "div",
                    null,
                    n.createElement(
                      o,
                      { color: "blue", style: { fontSize: 10 } },
                      _.category
                    ),
                    _.approval_level === "MANUAL" ? n.createElement(
                      o,
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
                bt(_.description, n)
              )
            )
          )
        )
      )
    ),
    // ── Blank template creation modal (sibling, not nested inside Modal) ──
    n.createElement(ul, {
      open: Y,
      onCancel: () => G(!1),
      onCreate: N
    })
  );
}
function ul({
  open: e,
  onCancel: t,
  onCreate: l
}) {
  const n = w().React, { useState: a, useEffect: r } = n, { Modal: s, Input: o, message: d } = w().antd, [c, u] = a(""), [y, E] = a(""), [b, x] = a(!1);
  return r(() => {
    e && (u(""), E(""), x(!1));
  }, [e]), n.createElement(
    s,
    {
      open: e,
      title: "从空白模版创建专家",
      onCancel: t,
      onOk: () => {
        if (!c.trim()) {
          d.warning("请输入专家名称");
          return;
        }
        x(!0), Promise.resolve(l(c.trim(), y.trim())).finally(() => {
          x(!1);
        });
      },
      okText: "创建",
      cancelText: "取消",
      okButtonProps: { loading: b },
      maskClosable: !0,
      keyboard: !0
    },
    n.createElement(
      "div",
      { style: { marginBottom: 16 } },
      n.createElement(
        "div",
        { style: { fontSize: 13, marginBottom: 6, color: "#595959" } },
        "专家名称"
      ),
      n.createElement(o, {
        placeholder: "输入专家名称",
        value: c,
        onChange: (T) => u(T.target.value),
        maxLength: 50
      })
    ),
    n.createElement(
      "div",
      null,
      n.createElement(
        "div",
        { style: { fontSize: 13, marginBottom: 6, color: "#595959" } },
        "专家描述（可选）"
      ),
      n.createElement(o.TextArea, {
        placeholder: "简要描述该专家的职责和能力...",
        value: y,
        onChange: (T) => E(T.target.value),
        rows: 3,
        maxLength: 200
      })
    )
  );
}
const Wn = "ugsci_custom_teams";
function pl(e) {
  if (!e || typeof e != "object") return !1;
  const t = e;
  return typeof t.id == "string" && typeof t.name == "string" && typeof t.taskTemplate == "string" && typeof t.orchestrationPrompt == "string" && Array.isArray(t.members);
}
function lt() {
  try {
    const e = JSON.parse(
      localStorage.getItem(Wn) || "[]"
    );
    return Array.isArray(e) ? e.filter(pl) : [];
  } catch {
    return [];
  }
}
function Ft(e) {
  try {
    localStorage.setItem(Wn, JSON.stringify(e));
  } catch {
  }
}
function gl(e) {
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
function fl(e) {
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
async function Pt(e = !0) {
  const t = await je("/ugsci/team/custom");
  if (!t.ok) {
    const a = await t.text().catch(() => "");
    throw new Error(a || `HTTP ${t.status}`);
  }
  const n = (await t.json()).map(fl);
  return e && Ft(n), n;
}
async function Jn(e) {
  const t = await je("/ugsci/team/custom", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(gl(e))
  });
  if (!t.ok) {
    const n = await t.text().catch(() => "");
    throw new Error(n || `HTTP ${t.status}`);
  }
  const l = await t.json();
  return { ...e, id: l.team_id };
}
async function yl(e) {
  const t = await je(
    `/ugsci/team/custom/${encodeURIComponent(e)}`,
    { method: "DELETE" }
  );
  if (!t.ok && t.status !== 404) {
    const l = await t.text().catch(() => "");
    throw new Error(l || `HTTP ${t.status}`);
  }
}
async function El() {
  const e = lt();
  if (e.length === 0) return;
  const t = await Pt(!1), l = new Set(t.map((n) => n.id));
  await Promise.all(
    e.filter((n) => !l.has(n.id)).map((n) => Jn(n))
  );
}
async function hl(e) {
  var a, r;
  const t = (a = e.body) == null ? void 0 : a.getReader();
  if (!t) return;
  const l = new TextDecoder();
  let n = "";
  try {
    for (; ; ) {
      const { done: s, value: o } = await t.read();
      if (s) break;
      n += l.decode(o, { stream: !0 });
      let d;
      for (; (d = n.indexOf(`

`)) >= 0; ) {
        const c = n.slice(0, d);
        n = n.slice(d + 2);
        for (const u of c.split(`
`)) {
          if (!u.startsWith("data: ")) continue;
          const y = u.slice(6);
          let E;
          try {
            E = JSON.parse(y);
          } catch {
            continue;
          }
          if (E.error) {
            const b = E.error, x = typeof b == "string" ? b : (b == null ? void 0 : b.message) || "工作流启动失败";
            throw new Error(x);
          }
          if (E.object === "response" || E.type === "response") {
            const b = E.status;
            if (b === "failed" || b === "error") {
              const x = ((r = E.error) == null ? void 0 : r.message) || "工作流启动失败";
              throw new Error(x);
            }
            return;
          }
          if (E.object === "content" || E.type === "message")
            return;
        }
      }
    }
  } finally {
    t.releaseLock();
  }
}
async function vl(e, t, l) {
  const n = `console:default:team-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, a = await je("/chats", {
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
    const d = await a.text().catch(() => "");
    throw new Error(
      d || `创建会话失败 (HTTP ${a.status})`
    );
  }
  const s = (await a.json()).id, o = await je("/console/chat", {
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
  if (!o.ok) {
    const d = await o.text().catch(() => "");
    throw new Error(d || `HTTP ${o.status}`);
  }
  return await hl(o), s;
}
function Kn(e, t) {
  var a;
  const l = t.replace(/\s+/g, ""), n = e.find(
    (r) => r.name === t || r.name.replace(/\s+/g, "") === l
  );
  return n ? n.id : ((a = e.find(
    (r) => r.name.includes(t) || t.includes(r.name) || r.name.replace(/\s+/g, "").includes(l)
  )) == null ? void 0 : a.id) || null;
}
function qn() {
  var t;
  const e = (t = window.QwenPaw) == null ? void 0 : t.host;
  if (!e) throw new Error("[ugsci] QwenPaw.host not available");
  return e;
}
async function Gt(e, t, l) {
  try {
    const n = await je(e, {
      headers: t ? { "X-Agent-Id": t } : void 0,
      signal: l
    });
    return n.ok ? await n.json() : null;
  } catch {
    return null;
  }
}
function bl(e, t) {
  return Gt("/ugsci/team/state", e, t);
}
async function Sl(e, t) {
  const l = await je("/ugsci/team/runs", {
    headers: { "X-Agent-Id": e },
    signal: t
  });
  if (!l.ok)
    throw new Error(`Failed to load team runs: ${l.status}`);
  return await l.json();
}
function Sn({ activeOnly: e = !1 }) {
  const t = qn(), l = t.React, { useCallback: n, useEffect: a, useRef: r, useState: s } = l, { Alert: o, Button: d, Card: c, Empty: u, Spin: y, Tag: E, Typography: b } = t.antd, { Text: x, Paragraph: T } = b, C = t.useSelectedAgent ? t.useSelectedAgent() : { id: "default" }, A = (C == null ? void 0 : C.id) || "default", [B, U] = s([]), [Y, G] = s(!0), [N, J] = s(!1), M = r(null), _ = r(0), K = n(async () => {
    var g;
    (g = M.current) == null || g.abort();
    const k = new AbortController();
    M.current = k;
    const f = ++_.current;
    G(!0);
    try {
      const O = await Sl(A, k.signal);
      if (k.signal.aborted || f !== _.current) return;
      U(O), J(!1);
    } catch {
      if (k.signal.aborted || f !== _.current) return;
      J(!0);
    } finally {
      !k.signal.aborted && f === _.current && G(!1);
    }
  }, [A]);
  if (a(() => (K(), () => {
    var k;
    (k = M.current) == null || k.abort(), _.current += 1;
  }), [K]), Y) return l.createElement(y);
  if (N)
    return l.createElement(o, {
      type: "warning",
      message: "讨论运行记录加载失败",
      action: l.createElement(d, { size: "small", onClick: () => void K() }, "重试")
    });
  const Q = B.filter(
    (k) => e ? k.status === "active" : k.status !== "active"
  );
  return Q.length === 0 ? l.createElement(u, {
    description: e ? "暂无进行中的专家团讨论" : "暂无历史讨论"
  }) : l.createElement(
    "div",
    { style: { display: "flex", flexDirection: "column", gap: 8 } },
    ...Q.map(
      (k) => l.createElement(
        c,
        { key: k.instance_id, size: "small" },
        l.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 8 } },
          l.createElement(x, { strong: !0 }, k.team_name || k.team_id),
          l.createElement(E, { color: k.status === "completed" ? "green" : k.status === "terminated" ? "orange" : "blue" }, k.status),
          l.createElement(E, null, k.current_phase),
          l.createElement(x, { type: "secondary" }, `迭代 ${k.iteration}`)
        ),
        l.createElement(T, { ellipsis: { rows: 2 }, style: { margin: "8px 0 0" } }, k.task || "暂无任务描述")
      )
    )
  );
}
async function wl() {
  const e = await Gt(
    "/ugsci/team/preset-teams"
  );
  return (e == null ? void 0 : e.teams) ?? null;
}
async function xl() {
  const e = await Gt(
    "/ugsci/team/roles"
  );
  return (e == null ? void 0 : e.roles) ?? null;
}
const kl = {
  plan: { label: "规划", color: "#1677ff", icon: "📋" },
  dispatch: { label: "分派", color: "#13c2c2", icon: "🚀" },
  verify: { label: "验证", color: "#fa8c16", icon: "🔍" },
  synthesize: { label: "综合", color: "#722ed1", icon: "📊" },
  completed: { label: "完成", color: "#52c41a", icon: "✅" }
}, wn = [
  "plan",
  "dispatch",
  "verify",
  "synthesize",
  "completed"
], Cl = 3;
function Tl() {
  const e = qn(), t = e.React, { useState: l, useEffect: n, useCallback: a, useRef: r } = t, { Card: s, Tag: o, Typography: d, Button: c, Steps: u, Empty: y, Alert: E } = e.antd, { ReloadOutlined: b } = e.antdIcons || {}, { Text: x, Paragraph: T } = d, C = e.useSelectedAgent ? e.useSelectedAgent() : { id: "default" }, A = (C == null ? void 0 : C.id) || "default", [B, U] = l(null), [Y, G] = l(!1), N = r(null), J = r(0), M = r(0), _ = r(null), K = a(
    async (m) => {
      var H;
      (H = _.current) == null || H.abort();
      const X = new AbortController();
      _.current = X;
      const ie = ++M.current;
      m && G(!0);
      const P = await bl(A, X.signal);
      X.signal.aborted || ie !== M.current || (P ? (J.current = 0, N.current = P, U(P)) : J.current += 1, G(!1));
    },
    [A]
  ), Q = a(() => K(!0), [K]);
  if (n(() => {
    var X;
    (X = _.current) == null || X.abort(), M.current += 1, J.current = 0, N.current = null, U(null), Q();
    const m = window.setInterval(() => {
      var ie, P;
      J.current >= Cl || ((ie = N.current) == null ? void 0 : ie.status) === "completed" || ((P = N.current) == null ? void 0 : P.status) === "terminated" || K(!1);
    }, 5e3);
    return () => {
      var ie;
      window.clearInterval(m), (ie = _.current) == null || ie.abort(), M.current += 1;
    };
  }, [A, K, Q]), (B == null ? void 0 : B.status) === "unreadable")
    return t.createElement(E, {
      type: "warning",
      showIcon: !0,
      message: "专家团状态暂时无法读取",
      description: `实例 ${B.instance_id || "未知"} 的状态文件需要检查。`,
      style: { marginBottom: 16 },
      action: t.createElement(
        c,
        { size: "small", onClick: Q, loading: Y },
        "重试"
      )
    });
  if (!B || !B.active) {
    if ((B == null ? void 0 : B.status) === "completed" || (B == null ? void 0 : B.status) === "terminated") {
      const m = B.status === "completed";
      return t.createElement(E, {
        type: m ? "success" : "info",
        showIcon: !0,
        message: m ? "专家团工作流已完成" : "专家团工作流已终止",
        description: m ? `实例 ${B.instance_id || "未知"} 已完成，结果文件保留在工作区。` : `原因：${B.state.termination_reason || "未知"}`,
        style: { marginBottom: 16 }
      });
    }
    return t.createElement(y, {
      description: "暂无活跃的专家团工作流",
      style: { padding: 24 }
    });
  }
  const k = B.state, f = k.current_phase || "plan", g = wn.indexOf(f), O = k.team_name || "未知团队", R = k.team_mode || "pipeline", W = k.iteration || 0, re = k.members || [], L = k.verify_retries || 0, S = {
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
        t.createElement(x, { strong: !0 }, `${O} — 工作流状态`),
        t.createElement(
          o,
          { color: "blue", style: { fontSize: 10 } },
          S[R] || R
        ),
        t.createElement(
          o,
          { style: { fontSize: 10 } },
          `迭代 ${W}`
        ),
        L > 0 ? t.createElement(
          o,
          { color: "orange", style: { fontSize: 10 } },
          `验证重试 ${L}`
        ) : null
      ),
      extra: t.createElement(
        c,
        {
          size: "small",
          type: "text",
          icon: b ? t.createElement(b) : void 0,
          onClick: Q,
          loading: Y
        },
        "刷新"
      )
    },
    t.createElement(u, {
      current: g,
      size: "small",
      items: wn.map((m) => {
        const X = kl[m];
        return {
          title: `${X.icon} ${X.label}`,
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
      ...re.map(
        (m, X) => t.createElement(
          o,
          { key: `${m.name}-${X}`, style: { fontSize: 11 } },
          `${m.emoji || ""} ${m.name}（${m.role}）`
        )
      )
    ),
    k.task ? t.createElement(
      T,
      {
        style: {
          fontSize: 12,
          marginTop: 8,
          marginBottom: 0,
          color: "#666"
        },
        ellipsis: { rows: 2 }
      },
      `任务: ${k.task}`
    ) : null
  );
}
function _l({ team: e }) {
  const t = w().React, { Typography: l, Tag: n } = w().antd, { Text: a } = l, r = {
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
  }, o = e.steps || [], d = e.mode === "roundtable" || e.mode === "router", c = {
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
          flexDirection: d ? "row" : "column",
          gap: 8,
          alignItems: d ? "flex-start" : "stretch",
          flexWrap: "wrap"
        }
      },
      ...o.length > 0 ? o.map((u, y) => [
        y > 0 && !d ? t.createElement(
          "div",
          {
            key: `arrow-${y}`,
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
            key: `step-${y}`,
            style: {
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "6px 10px",
              background: "#fff",
              borderRadius: 6,
              border: `1px solid ${s[e.mode]}33`,
              fontSize: 12,
              flex: d ? "1 1 200px" : "initial"
            }
          },
          t.createElement(Le, {
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
                  color: "#8c8c8c",
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
      ]).flat() : e.members.map((u, y) => [
        y > 0 && !d ? t.createElement(
          "div",
          {
            key: `arrow-${y}`,
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
            key: `member-${y}`,
            style: {
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "6px 10px",
              background: "#fff",
              borderRadius: 6,
              border: `1px solid ${s[e.mode]}33`,
              fontSize: 12,
              flex: d ? "1 1 150px" : "initial"
            }
          },
          t.createElement(Le, {
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
              { style: { fontSize: 11, color: "#8c8c8c" } },
              u.role
            )
          )
        )
      ]).flat()
    )
  );
}
function ut(e) {
  const t = e.replace(/\s+/g, "").toLowerCase();
  return t.includes("测井") ? "log-analyst" : t.includes("地球物理") ? "geophysicist" : t.includes("油藏") ? "reservoir-engineer" : t.includes("钻井") ? "drilling-engineer" : t.includes("采油") || t.includes("生产") ? "production-engineer" : t.includes("pvt") || t.includes("物性") ? "pvt-analyst" : t.includes("审核") || t.includes("verifier") ? "domain-reviewer" : t.includes("master") || t.includes("planner") ? "planner" : "analyst";
}
const Il = [
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
function zl({
  open: e,
  onClose: t,
  agents: l,
  editingTeam: n,
  onSaved: a
}) {
  const r = w().React, { useState: s, useEffect: o, useCallback: d } = r, {
    Modal: c,
    Input: u,
    Button: y,
    Select: E,
    Tag: b,
    Typography: x,
    Switch: T,
    Empty: C,
    message: A,
    Divider: B,
    Steps: U
  } = w().antd, { PlusOutlined: Y, DeleteOutlined: G, SaveOutlined: N, ArrowRightOutlined: J } = w().antdIcons || {}, { Text: M, Paragraph: _ } = x, [K, Q] = s(""), [k, f] = s("🤝"), [g, O] = s(""), [R, W] = s("pipeline"), [re, L] = s(""), [S, m] = s(""), [X, ie] = s([]), [P, H] = s([]), [D, Z] = s(!1), [q, me] = s(2), [I, te] = s(""), [le, ne] = s(""), [v, ue] = s({}), [pe, Se] = s({}), [Te, he] = s(
    Il
  ), ee = [
    { value: "pipeline", icon: "→", title: "顺序交接", description: "上一步产物成为下一位专家的上下文", topology: "A → B → C", accent: "#08979c" },
    { value: "roundtable", icon: "⇉", title: "并行汇聚", description: "独立并行分析，避免观点相互污染", topology: "A ∥ B ∥ C → 汇总", accent: "#531dab" },
    { value: "coordinator", icon: "◎", title: "主管协作", description: "主控专家拆解任务并按需组织成员", topology: "主管 → 专家组", accent: "#0958d9" },
    { value: "router", icon: "◇", title: "智能路由", description: "按任务能力需求选择最小充分专家集合", topology: "任务 → 路由 → 子集", accent: "#d46b08" },
    { value: "review_loop", icon: "↻", title: "评审迭代", description: "产出、独立审查、修订，直到满足标准", topology: "执行 ⇄ 评审", accent: "#389e0d" },
    { value: "debate", icon: "⚖", title: "多方论证", description: "独立立场、交叉质询，再由裁决者综合", topology: "观点 ⇄ 反驳 → 裁决", accent: "#c41d7f" }
  ];
  o(() => {
    e && (n ? (Q(n.name), f(n.emoji), O(n.description), W(n.mode), L(n.coordinatorName || ""), m(n.taskTemplate), ie(n.steps || []), H(n.members.map((p) => p.name)), me(n.maxReviewRounds || 2), te(n.successCriteria || ""), ne(n.routingInstruction || ""), ue(
      Object.fromEntries(
        n.members.map((p) => [
          p.name,
          p.bindingMode || (p.agentId ? "fixed" : "preferred")
        ])
      )
    ), Se(
      Object.fromEntries(
        n.members.map((p) => [
          p.name,
          p.roleKey || ut(p.name)
        ])
      )
    )) : (Q(""), f("🤝"), O(""), W("pipeline"), L(""), m(`请执行以下任务：
任务描述：{任务描述}`), ie([]), H([]), me(2), te(""), ne(""), ue({}), Se({})));
  }, [e, n]), o(() => {
    e && xl().then((p) => {
      p != null && p.length && he(p);
    });
  }, [e]);
  const F = d(() => {
    if (R === "roundtable" || R === "debate" || R === "router") {
      const p = P.map((ce) => ({
        agentName: ce,
        instruction: "请给出你的专业评估意见",
        passContext: !1
      }));
      ie(p);
    } else if (R === "pipeline") {
      const p = new Map(X.map((ye) => [ye.agentName, ye])), ce = P.map((ye) => p.get(ye) || {
        agentName: ye,
        instruction: "请完成你的专业部分",
        passContext: !0
      });
      ie(ce);
    }
  }, [R, P, X]), h = (p) => {
    P.includes(p) || (H([...P, p]), ue({ ...v, [p]: "fixed" }), Se({
      ...pe,
      [p]: ut(p)
    }), (R === "coordinator" || R === "debate") && !re && L(p));
  }, ae = (p) => {
    const ce = P.filter((xe) => xe !== p);
    H(ce), ie(X.filter((xe) => xe.agentName !== p));
    const ye = { ...v };
    delete ye[p], ue(ye);
    const be = { ...pe };
    delete be[p], Se(be), re === p && L(ce[0] || "");
  }, de = (p, ce, ye) => {
    const be = [...X];
    be[p] = { ...be[p], [ce]: ye }, ie(be);
  }, ge = async () => {
    if (!K.trim()) {
      A.warning("请输入团队名称");
      return;
    }
    if (P.length < 2) {
      A.warning("至少需要选择 2 个成员");
      return;
    }
    if (!S.trim()) {
      A.warning("请输入任务模板");
      return;
    }
    if ((R === "coordinator" || R === "debate") && !re) {
      A.warning(R === "debate" ? "请选择裁决者" : "请选择主控专家");
      return;
    }
    Z(!0);
    try {
      let p = [...P];
      R === "coordinator" && re ? p = [re, ...p.filter((_e) => _e !== re)] : R === "debate" && re && (p = [...p.filter((_e) => _e !== re), re]);
      const ce = p.map(
        (_e) => {
          var De;
          const Re = l.find((we) => we.name === _e), Me = v[_e] || "fixed", Ue = pe[_e] || ut(_e), Ne = Te.find((we) => we.key === Ue);
          return {
            name: _e,
            role: (Ne == null ? void 0 : Ne.display_name) || ((De = Re == null ? void 0 : Re.description) == null ? void 0 : De.slice(0, 30)) || "需求分析师",
            emoji: "",
            agentId: Me === "temporary" || Re == null ? void 0 : Re.id,
            roleKey: Ue,
            bindingMode: Me
          };
        }
      );
      let ye = X;
      (X.length === 0 || X.length !== P.length) && (ye = P.map((_e) => ({
        agentName: _e,
        instruction: "请完成你的专业部分",
        passContext: R === "pipeline"
      })));
      const be = {
        id: (n == null ? void 0 : n.id) || `custom-${Date.now()}`,
        name: K.trim(),
        emoji: k,
        category: "自定义",
        description: g.trim() || `${K.trim()}（${P.length}人团队）`,
        mode: R,
        members: ce,
        coordinatorName: R === "coordinator" || R === "debate" ? re : void 0,
        taskTemplate: S.trim(),
        orchestrationPrompt: "",
        // Custom teams use steps-based instructions
        steps: ye,
        custom: !0,
        createdAt: (n == null ? void 0 : n.createdAt) || Date.now(),
        maxReviewRounds: q,
        successCriteria: I.trim(),
        routingInstruction: le.trim()
      }, xe = await Jn(be), Ie = lt(), Be = Ie.findIndex((_e) => _e.id === xe.id);
      Be >= 0 ? Ie[Be] = xe : Ie.push(xe), Ft(Ie), A.success(n ? "团队已更新" : "团队已创建"), a(), t();
    } catch (p) {
      A.error(p.message || "保存失败");
    } finally {
      Z(!1);
    }
  }, j = l.filter(
    (p) => !P.includes(p.name)
  );
  return r.createElement(
    c,
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
      confirmLoading: D,
      okButtonProps: {
        icon: N ? r.createElement(N) : void 0
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
        P.length > 0 ? r.createElement(Dt, {
          members: P,
          size: 36
        }) : null,
        r.createElement(u, {
          placeholder: "专家团名称（如：储层评价与质量复核专家团）",
          value: K,
          onChange: (p) => Q(p.target.value),
          style: { flex: 1 }
        })
      ),
      r.createElement(u.TextArea, {
        placeholder: "说明这个工作流解决什么问题、适用于什么场景",
        value: g,
        onChange: (p) => O(p.target.value),
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
        ...ee.map((p) => {
          const ce = R === p.value;
          return r.createElement(
            "button",
            {
              key: p.value,
              type: "button",
              onClick: () => {
                W(p.value), p.value !== "coordinator" && p.value !== "debate" && L("");
              },
              style: {
                textAlign: "left",
                padding: 10,
                borderRadius: 8,
                cursor: "pointer",
                background: ce ? `${p.accent}0d` : "#fff",
                border: `1px solid ${ce ? p.accent : "#d9d9d9"}`,
                boxShadow: ce ? `0 0 0 2px ${p.accent}1a` : "none"
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
    r.createElement(B, { style: { margin: "12px 0" } }),
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
      j.length > 0 ? r.createElement(
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
        ...j.map(
          (p) => r.createElement(
            y,
            {
              key: p.id,
              size: "small",
              icon: Y ? r.createElement(Y) : void 0,
              onClick: () => h(p.name)
            },
            p.name
          )
        )
      ) : null,
      // Selected members
      P.length === 0 ? r.createElement(C, {
        description: "请从上方添加团队成员",
        image: C.PRESENTED_IMAGE_SIMPLE
      }) : r.createElement(
        "div",
        { style: { display: "flex", flexDirection: "column", gap: 4 } },
        ...P.map(
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
              r.createElement(Le, { name: p, size: 24 }),
              r.createElement(
                M,
                { strong: !0, style: { fontSize: 13 } },
                p
              ),
              (R === "coordinator" || R === "debate") && re === p ? r.createElement(
                b,
                { color: "blue", style: { fontSize: 10 } },
                R === "debate" ? "裁决者" : "主控"
              ) : null
            ),
            r.createElement(
              "div",
              { style: { display: "flex", gap: 4 } },
              r.createElement(E, {
                size: "small",
                value: pe[p] || ut(p),
                style: { width: 132 },
                onChange: (ce) => Se({ ...pe, [p]: ce }),
                options: Te.map((ce) => ({
                  value: ce.key,
                  label: ce.display_name
                }))
              }),
              r.createElement(E, {
                size: "small",
                value: v[p] || "fixed",
                style: { width: 118 },
                onChange: (ce) => ue({ ...v, [p]: ce }),
                options: [
                  { value: "fixed", label: "固定实例" },
                  { value: "preferred", label: "优先实例" },
                  { value: "temporary", label: "临时派生" }
                ]
              }),
              R === "coordinator" || R === "debate" ? r.createElement(
                y,
                {
                  size: "small",
                  type: "link",
                  onClick: () => L(p)
                },
                R === "debate" ? "设为裁决者" : "设为主控"
              ) : null,
              r.createElement(
                y,
                {
                  size: "small",
                  type: "link",
                  danger: !0,
                  icon: G ? r.createElement(G) : void 0,
                  onClick: () => ae(p)
                },
                "移除"
              )
            )
          )
        )
      )
    ),
    R === "review_loop" || R === "router" ? r.createElement(
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
      R === "review_loop" ? r.createElement(
        "div",
        { style: { display: "grid", gridTemplateColumns: "150px 1fr", gap: 10 } },
        r.createElement(E, {
          value: q,
          onChange: (p) => me(p),
          options: [1, 2, 3, 4, 5].map((p) => ({ value: p, label: `最多 ${p} 轮` }))
        }),
        r.createElement(u, {
          value: I,
          onChange: (p) => te(p.target.value),
          placeholder: "验收标准，例如：关键结论均有数据依据，且无高风险缺陷"
        })
      ) : r.createElement(u, {
        value: le,
        onChange: (p) => ne(p.target.value),
        placeholder: "路由偏好，例如：仅调用任务必需的专家；涉及模拟时优先油藏工程师"
      })
    ) : null,
    r.createElement(B, { style: { margin: "12px 0" } }),
    // Step 3: Define execution steps (for pipeline/roundtable)
    P.length > 0 ? r.createElement(
      "div",
      { style: { marginBottom: 16 } },
      r.createElement(
        M,
        {
          strong: !0,
          style: { display: "block", marginBottom: 8, fontSize: 13 }
        },
        `3. 配置专家任务${R === "roundtable" ? "（并行独立）" : R === "pipeline" ? "（顺序交接）" : R === "router" ? "（作为候选能力）" : R === "review_loop" ? "（首位执行、末位评审）" : R === "debate" ? "（末位为裁决者）" : "（由主控动态编排）"}`
      ),
      // Auto-sync button
      r.createElement(
        y,
        {
          size: "small",
          type: "dashed",
          onClick: F,
          style: { marginBottom: 8 }
        },
        "自动生成步骤"
      ),
      // Steps list
      X.length === 0 ? r.createElement(
        M,
        { type: "secondary", style: { fontSize: 12 } },
        "点击「自动生成步骤」或手动配置每步的指令"
      ) : r.createElement(
        "div",
        { style: { display: "flex", flexDirection: "column", gap: 6 } },
        ...X.map(
          (p, ce) => r.createElement(
            "div",
            {
              key: ce,
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
              R === "pipeline" ? r.createElement(
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
                `${ce + 1}`
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
                  onChange: (ye) => de(ce, "instruction", ye.target.value),
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
              r.createElement(T, {
                size: "small",
                checked: p.passContext,
                onChange: (ye) => de(ce, "passContext", ye)
              }),
              r.createElement(
                M,
                { type: "secondary", style: { fontSize: 11 } },
                p.passContext ? "传递上一步结果作为上下文" : "独立执行"
              )
            )
          )
        )
      )
    ) : null,
    r.createElement(B, { style: { margin: "12px 0" } }),
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
        `${P.length > 0 ? "4" : "3"}. 任务模板`
      ),
      r.createElement(u.TextArea, {
        placeholder: `输入任务模板，可用 {参数名} 作为占位符...

例如：
请对区块 {区块名} 的井 {井号} 进行储层评价`,
        value: S,
        onChange: (p) => m(p.target.value),
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
function xn({
  team: e,
  agents: t,
  onLaunch: l,
  onEdit: n,
  onDelete: a
}) {
  var f;
  const r = w().React, { useState: s } = r, { Card: o, Tag: d, Typography: c, Button: u, Tooltip: y, Popconfirm: E } = w().antd, {
    TeamOutlined: b,
    RocketOutlined: x,
    UserOutlined: T,
    EditOutlined: C,
    DeleteOutlined: A,
    DownOutlined: B,
    UpOutlined: U
  } = w().antdIcons || {}, { Text: Y, Paragraph: G } = c, [N, J] = s(!1), M = {
    coordinator: { label: "主管协作", color: "blue" },
    pipeline: { label: "顺序交接", color: "cyan" },
    roundtable: { label: "并行汇聚", color: "purple" },
    router: { label: "智能路由", color: "orange" },
    review_loop: { label: "评审迭代", color: "green" },
    debate: { label: "多方论证", color: "magenta" }
  }, _ = M[e.mode] || M.coordinator, K = e.members.map((g) => {
    const O = g.bindingMode === "temporary", R = O ? null : (g.agentId && t.some((W) => W.id === g.agentId) ? g.agentId : null) || Kn(t, g.name);
    return { ...g, found: !!R, agentId: R, temporary: O };
  }), Q = K.filter((g) => g.found).length, k = e.coordinatorName || ((f = e.members[0]) == null ? void 0 : f.name);
  return r.createElement(
    o,
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
      r.createElement(Dt, {
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
            Y,
            { strong: !0, style: { fontSize: 14 } },
            e.name
          ),
          e.custom ? r.createElement(
            d,
            { color: "gold", style: { fontSize: 9 } },
            "自定义"
          ) : null
        ),
        r.createElement(
          "div",
          { style: { display: "flex", gap: 4, marginTop: 4 } },
          r.createElement(
            d,
            { color: _.color, style: { fontSize: 10 } },
            _.label
          ),
          r.createElement(
            d,
            { color: "green", style: { fontSize: 10 } },
            `${e.members.length} 位专家`
          ),
          Q < e.members.length ? r.createElement(
            y,
            {
              title: `OMP 架构下，未创建的专家将通过 spawn_subagent 自动派发，
控制器会根据角色 prompt 创建子 agent 执行任务。`
            },
            r.createElement(
              d,
              { color: "blue", style: { fontSize: 10 } },
              "OMP 自动派发"
            )
          ) : r.createElement(
            d,
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
          y,
          { title: "编辑" },
          r.createElement(u, {
            type: "text",
            size: "small",
            icon: C ? r.createElement(C) : void 0,
            onClick: (g) => {
              g.stopPropagation(), n(e);
            }
          })
        ) : null,
        a ? r.createElement(
          y,
          { title: "删除" },
          r.createElement(
            E,
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
              icon: A ? r.createElement(A) : void 0,
              onClick: (g) => g.stopPropagation()
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
      ...K.map(
        (g) => r.createElement(
          y,
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
            r.createElement(Le, { name: g.name, size: 18 }),
            r.createElement(
              Y,
              {
                style: { fontSize: 11, color: g.found ? "#1f4e8c" : "#531dab" }
              },
              g.name
            ),
            g.temporary ? r.createElement(
              d,
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
          g.stopPropagation(), J(!N);
        },
        icon: N ? U ? r.createElement(U) : "▲" : B ? r.createElement(B) : "▼"
      },
      N ? "收起流程" : "查看执行流程"
    ),
    N ? r.createElement(_l, { team: e }) : null,
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
        Y,
        { type: "secondary", style: { fontSize: 11 } },
        k ? `${e.mode === "debate" ? "裁决者" : "主控"}: ${k}` : "OMP 动态编排"
      ),
      r.createElement(
        u,
        {
          type: "primary",
          size: "small",
          icon: x ? r.createElement(x) : void 0,
          disabled: t.length === 0,
          onClick: () => l(e),
          style: Ae
        },
        "运行工作流"
      )
    )
  );
}
function Al({
  agents: e,
  onLaunch: t
}) {
  const l = w().React, { useMemo: n, useState: a, useCallback: r, useEffect: s } = l, {
    Row: o,
    Col: d,
    Input: c,
    Empty: u,
    Typography: y,
    Tag: E,
    Button: b,
    Divider: x,
    Tabs: T,
    message: C
  } = w().antd, { SearchOutlined: A, TeamOutlined: B, PlusOutlined: U, RocketOutlined: Y } = w().antdIcons || {}, { Text: G } = y, [N, J] = a(""), [M, _] = a([]), [K, Q] = a([]), [k, f] = a(!1), [g, O] = a(!1), [R, W] = a(null);
  s(() => {
    _(lt());
    let D = !0;
    return (async () => {
      try {
        await El();
        const Z = await Pt();
        D && _(Z);
      } catch (Z) {
        console.warn("[ugsci] Failed to load backend expert teams:", Z), D && C.warning("专家团后端同步失败，当前显示本地缓存");
      }
    })(), wl().then((Z) => {
      D && (Z ? (Q(Z), f(!1)) : f(!0));
    }), () => {
      D = !1;
    };
  }, []);
  const re = r(() => {
    Pt().then(_).catch((D) => {
      console.warn("[ugsci] Failed to refresh expert teams:", D), _(lt());
    });
  }, []), L = r(
    (D) => {
      yl(D.id).then(() => {
        const q = lt().filter((me) => me.id !== D.id);
        Ft(q), _(q), C.success(`团队「${D.name}」已删除`);
      }).catch((Z) => C.error(Z.message || "删除专家团失败"));
    },
    [C]
  ), S = r((D) => {
    W(D), O(!0);
  }, []), m = r(() => {
    W(null), O(!0);
  }, []), X = n(() => [...M, ...K], [M, K]), ie = n(() => {
    if (!N.trim()) return X;
    const D = N.toLowerCase();
    return X.filter(
      (Z) => Z.name.toLowerCase().includes(D) || Z.description.toLowerCase().includes(D) || Z.category.toLowerCase().includes(D)
    );
  }, [X, N]), P = ie.filter((D) => D.custom), H = ie.filter((D) => !D.custom);
  return l.createElement(
    "div",
    null,
    k ? l.createElement(w().antd.Alert, {
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
        G,
        { style: { fontSize: 13, color: "#389e0d" } },
        "OMP 协作工作流 — 专家是可组合的角色节点，可按顺序、并行、路由、评审闭环或多方论证运行，并由统一状态机负责交接、验证与失败恢复。"
      ),
      l.createElement(
        b,
        {
          type: "primary",
          size: "small",
          icon: U ? l.createElement(U) : void 0,
          onClick: m,
          style: Ae
        },
        "创建专家团"
      )
    ),
    // Search
    l.createElement(c, {
      placeholder: "搜索团队名称、描述或类别...",
      prefix: A ? l.createElement(A) : void 0,
      value: N,
      onChange: (D) => J(D.target.value),
      allowClear: !0,
      style: { marginBottom: 16, maxWidth: 400 }
    }),
    // Tabs: preset teams vs custom teams
    l.createElement(
      T,
      {
        defaultActiveKey: "preset",
        items: [
          {
            key: "preset",
            label: `预设团队${H.length ? ` (${H.length})` : ""}`,
            children: l.createElement(
              "div",
              null,
              H.length > 0 ? l.createElement(
                o,
                { gutter: [12, 12] },
                ...H.map(
                  (D) => l.createElement(
                    d,
                    { key: D.id, xs: 24, sm: 12, md: 8 },
                    l.createElement(xn, {
                      team: D,
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
            label: `自定义团队${P.length ? ` (${P.length})` : ""}`,
            children: l.createElement(
              "div",
              null,
              P.length > 0 ? l.createElement(
                o,
                { gutter: [12, 12] },
                ...P.map(
                  (D) => l.createElement(
                    d,
                    { key: D.id, xs: 24, sm: 12, md: 8 },
                    l.createElement(xn, {
                      team: D,
                      agents: e,
                      onLaunch: t,
                      onEdit: S,
                      onDelete: L
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
              l.createElement(Tl),
              l.createElement(Sn, { activeOnly: !0 })
            )
          },
          {
            key: "history",
            label: "讨论历史",
            children: l.createElement(Sn)
          }
        ]
      }
    ),
    // Team Builder Modal
    l.createElement(zl, {
      open: g,
      onClose: () => {
        O(!1), W(null);
      },
      agents: e,
      editingTeam: R,
      onSaved: re
    })
  );
}
const Pl = [
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
function Ol(e) {
  window.history.pushState({}, "", e), window.dispatchEvent(new PopStateEvent("popstate"));
}
function At(e, t) {
  const l = new URLSearchParams();
  e && l.set("flow", e), t && l.set("run", t), Ol(`/flowforge${l.size ? `?${l.toString()}` : ""}`);
}
function $l() {
  const e = w().React, { useCallback: t, useEffect: l, useState: n } = e, {
    Alert: a,
    Button: r,
    Card: s,
    Col: o,
    Empty: d,
    Input: c,
    Row: u,
    Space: y,
    Spin: E,
    Tabs: b,
    Tag: x,
    Typography: T,
    message: C
  } = w().antd, { ApartmentOutlined: A, ReloadOutlined: B, RocketOutlined: U } = w().antdIcons || {}, { Text: Y, Paragraph: G, Title: N } = T, J = w().useSelectedAgent, M = J ? J() : { id: "default" }, _ = (M == null ? void 0 : M.id) || "default", K = (M == null ? void 0 : M.name) || _, Q = K === _ ? _ : `${K}（${_}）`, [k, f] = n([]), [g, O] = n([]), [R, W] = n([]), [re, L] = n(!0), [S, m] = n(!0), [X, ie] = n(null), [P, H] = n(""), [D, Z] = n(""), q = t(async () => {
    L(!0);
    try {
      const [v, ue, pe] = await Promise.all([
        se("/flowforge/flows", { bypassCache: !0 }),
        se("/flowforge/runs", { bypassCache: !0 }),
        wt().catch(() => [])
      ]);
      f(v), O(ue), W(pe), m(!0);
    } catch (v) {
      console.warn("[ugsci] FlowForge is unavailable:", v), m(!1);
    } finally {
      L(!1);
    }
  }, []);
  l(() => {
    q();
  }, [q]);
  const me = t(
    async (v) => {
      ie(v.key);
      try {
        const ue = await se(
          "/flowforge/generate",
          {
            method: "POST",
            body: JSON.stringify({
              prompt: v.sop,
              name: v.name,
              agent_id: _
            })
          }
        ), pe = {
          ...ue.nodes || {}
        }, Se = Object.entries(pe).filter(([ee]) => /^step_\d+$/.test(ee)).sort(([ee], [F]) => Number(ee.slice(5)) - Number(F.slice(5))), Te = {};
        Se.forEach(([ee, F], h) => {
          const ae = v.roleHints[h] || "", de = v.roleKeys[h] || "analyst", ge = R.find(
            (ce) => `${ce.name} ${ce.id}`.toLowerCase().includes(ae.toLowerCase())
          ), j = (ge == null ? void 0 : ge.id) || _, p = { ...F.inputs || {} };
          p.agent_id = j, pe[ee] = {
            ...F,
            inputs: p,
            metadata: {
              ...F.metadata || {},
              binding_policy: "fixed_instance",
              role_hint: ae,
              role_key: de,
              agent_id: j
            }
          }, Te[ee] = {
            binding_policy: "fixed_instance",
            role_hint: ae,
            role_key: de,
            agent_id: j
          };
        });
        const he = {
          ...ue,
          nodes: pe,
          id: `${v.key}-${Date.now()}`,
          name: v.name,
          description: v.description,
          metadata: {
            ...ue.metadata || {},
            domain: "oil-gas",
            template_key: v.key,
            expert_binding_policy: "fixed_instance",
            controller_agent_id: _,
            node_bindings: Te
          }
        };
        await se("/flowforge/flows", {
          method: "POST",
          body: JSON.stringify(he)
        }), C.success(`已创建工作流草稿「${v.name}」`), await q();
      } catch (ue) {
        C.error(ue.message || "创建工作流失败");
      } finally {
        ie(null);
      }
    },
    [R, _, q, C]
  ), I = t(async () => {
    if (!D.trim()) {
      C.warning("请先描述工作流步骤和控制要求");
      return;
    }
    ie("natural-language");
    try {
      const v = await se(
        "/flowforge/generate",
        {
          method: "POST",
          body: JSON.stringify({
            prompt: D.trim(),
            name: P.trim(),
            agent_id: _
          })
        }
      ), ue = {
        ...v,
        id: `natural-${Date.now()}`,
        metadata: {
          ...v.metadata || {},
          domain: "oil-gas",
          source: "natural-language",
          expert_binding_policy: "fixed_instance",
          controller_agent_id: _
        }
      };
      await se("/flowforge/flows", {
        method: "POST",
        body: JSON.stringify(ue)
      }), C.success("已从自然语言生成可编辑工作流草稿"), H(""), Z(""), await q();
    } catch (v) {
      C.error(v.message || "自然语言生成失败");
    } finally {
      ie(null);
    }
  }, [_, q, C, P, D]), te = e.createElement(
    "div",
    null,
    e.createElement(
      a,
      {
        type: "info",
        showIcon: !0,
        message: "领域协作工作流",
        description: `工作流使用 FlowForge 确定性 DAG 调度；新建草稿默认将节点绑定到当前控制器「${Q}」，可在编辑器中调整节点 Agent ID。开放研判可嵌入专家团讨论步骤。`,
        style: { marginBottom: 16 }
      }
    ),
    e.createElement(
      s,
      {
        size: "small",
        title: "用自然语言生成工作流",
        style: { marginBottom: 16 }
      },
      e.createElement(
        y,
        { direction: "vertical", style: { width: "100%" }, size: 10 },
        e.createElement(c, {
          value: P,
          onChange: (v) => H(v.target.value),
          placeholder: "工作流名称（可选）",
          maxLength: 80
        }),
        e.createElement(c.TextArea, {
          value: D,
          onChange: (v) => Z(v.target.value),
          placeholder: "例如：先检查某储气库本周期压力和注采量数据，再由油藏工程师预测下周期能力，由独立完整性专家复核风险，最后形成带证据和不确定性的建议。",
          autoSize: { minRows: 3, maxRows: 8 }
        }),
        e.createElement(
          r,
          {
            type: "primary",
            onClick: () => void I(),
            loading: X === "natural-language",
            disabled: !S,
            style: Ae
          },
          "生成可编辑草稿"
        )
      )
    ),
    e.createElement(
      u,
      { gutter: [12, 12] },
      ...Pl.map(
        (v) => e.createElement(
          o,
          { key: v.key, xs: 24, md: 8 },
          e.createElement(
            s,
            { style: { height: "100%" } },
            e.createElement(
              y,
              { align: "start", style: { width: "100%" } },
              e.createElement("span", { style: { fontSize: 28 } }, v.icon),
              e.createElement(
                "div",
                { style: { flex: 1 } },
                e.createElement(N, { level: 5, style: { margin: 0 } }, v.name),
                e.createElement(x, { color: "blue", style: { marginTop: 6 } }, v.category),
                e.createElement(
                  G,
                  { type: "secondary", style: { margin: "10px 0 14px" } },
                  v.description
                ),
                e.createElement(
                  r,
                  {
                    type: "primary",
                    loading: X === v.key,
                    disabled: !S,
                    onClick: () => void me(v),
                    style: Ae
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
          ([v, ue, pe]) => e.createElement(
            o,
            { key: v, xs: 24, sm: 12, lg: 6 },
            e.createElement(Y, { strong: !0 }, v),
            e.createElement(
              x,
              {
                color: pe === "当前可执行" ? "green" : "default",
                style: { marginLeft: 6, fontSize: 10 }
              },
              pe
            ),
            e.createElement("div", { style: { color: "#8c8c8c", fontSize: 12, marginTop: 4 } }, ue)
          )
        )
      )
    )
  ), le = re ? e.createElement(E) : k.length === 0 ? e.createElement(d, { description: "暂无工作流，可从模板创建" }) : e.createElement(
    u,
    { gutter: [12, 12] },
    ...k.map(
      (v) => e.createElement(
        o,
        { key: v.id, xs: 24, md: 12, xl: 8 },
        e.createElement(
          s,
          {
            size: "small",
            title: v.name,
            extra: e.createElement(x, null, `v${v.version}`)
          },
          e.createElement(G, { ellipsis: { rows: 2 } }, v.description || "暂无描述"),
          e.createElement(
            y,
            null,
            e.createElement(x, { color: "geekblue" }, `${v.node_count} 个节点`),
            e.createElement(r, { size: "small", onClick: () => At(v.id) }, "打开编辑器")
          )
        )
      )
    )
  ), ne = re ? e.createElement(E) : g.length === 0 ? e.createElement(d, { description: "暂无工作流运行记录" }) : e.createElement(
    "div",
    { style: { display: "flex", flexDirection: "column", gap: 8 } },
    ...g.map(
      (v) => e.createElement(
        s,
        { key: v.run_id, size: "small" },
        e.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 10 } },
          e.createElement(x, { color: v.status === "completed" ? "green" : v.status === "failed" ? "red" : "blue" }, v.status),
          e.createElement(Y, { strong: !0 }, v.flow_id),
          e.createElement(Y, { type: "secondary", style: { fontFamily: "monospace" } }, v.run_id),
          v.error ? e.createElement(Y, { type: "danger" }, v.error) : null,
          e.createElement(
            r,
            { size: "small", type: "link", onClick: () => At(void 0, v.run_id) },
            "查看详情"
          )
        )
      )
    )
  );
  return e.createElement(
    "div",
    null,
    S ? null : e.createElement(a, {
      type: "warning",
      showIcon: !0,
      message: "协作工作流引擎当前不可用",
      description: "请确认 FlowForge 插件已启用。专家和专家团功能不受影响。",
      action: e.createElement(r, { size: "small", onClick: () => void q() }, "重试"),
      style: { marginBottom: 16 }
    }),
    e.createElement(b, {
      items: [
        { key: "templates", label: "工作流模板", children: te },
        { key: "mine", label: `我的工作流 (${k.length})`, children: le },
        { key: "runs", label: `运行中心 (${g.length})`, children: ne }
      ],
      tabBarExtraContent: e.createElement(
        y,
        null,
        e.createElement(r, {
          icon: B ? e.createElement(B) : void 0,
          onClick: () => void q(),
          loading: re
        }, "刷新"),
        e.createElement(r, {
          type: "primary",
          icon: A ? e.createElement(A) : U ? e.createElement(U) : void 0,
          onClick: () => At(),
          disabled: !S,
          style: Ae
        }, "打开流程编辑器")
      )
    })
  );
}
function kn(e, t) {
  var a, r;
  const l = e.coordinatorName || ((a = e.members[0]) == null ? void 0 : a.name), n = e.members.find((s) => s.name === l) || e.members[0];
  if ((n == null ? void 0 : n.bindingMode) !== "temporary" && (n != null && n.agentId) && t.some((s) => s.id === n.agentId))
    return n.agentId;
  if (l && (n == null ? void 0 : n.bindingMode) !== "temporary") {
    const s = Kn(t, l);
    if (s) return s;
  }
  return (n == null ? void 0 : n.bindingMode) === "fixed" ? null : ((r = t[0]) == null ? void 0 : r.id) || null;
}
function Cn() {
  const e = new URLSearchParams(window.location.search).get("section");
  return e === "teams" || e === "workflows" ? e : "experts";
}
function Rl() {
  var de, ge;
  const e = w().React, { useState: t, useEffect: l, useCallback: n, useMemo: a } = e, {
    Spin: r,
    Empty: s,
    Input: o,
    Button: d,
    message: c,
    Row: u,
    Col: y,
    Tabs: E,
    Modal: b,
    Typography: x
  } = w().antd, {
    ReloadOutlined: T,
    PlusOutlined: C,
    SearchOutlined: A,
    TeamOutlined: B,
    UserOutlined: U
  } = w().antdIcons || {}, { Text: Y, Paragraph: G } = x, [N, J] = t([]), [M, _] = t(!0), [K, Q] = t(!1), [k, f] = t(null), [g, O] = t(""), [R, W] = t(!1), [re, L] = t(Cn), [S, m] = t(
    null
  ), [X, ie] = t(""), [P, H] = t(!1), [D, Z] = t(!1), [q, me] = t(null), [I, te] = t([]), le = n(async () => {
    _(!0);
    try {
      const j = await wt(), p = await Promise.all(
        j.map(async (ce) => {
          try {
            const [ye, be, xe] = await Promise.all([
              Lt(ce.id).catch(() => null),
              xt(ce.id).catch(() => []),
              Nt(ce.id).catch(() => [])
            ]);
            return {
              agent: ce,
              config: ye,
              skills: be,
              mcps: xe,
              loading: !1
            };
          } catch {
            return {
              agent: ce,
              config: null,
              skills: [],
              mcps: [],
              loading: !1
            };
          }
        })
      );
      J(p), te(j);
    } catch (j) {
      c.error(j.message || "加载专家列表失败"), J([]);
    } finally {
      _(!1);
    }
  }, []);
  l(() => {
    le();
  }, [le]), l(() => {
    const j = () => L(Cn());
    return window.addEventListener("popstate", j), () => window.removeEventListener("popstate", j);
  }, []), l(() => {
    if (q && D) {
      const j = N.find(
        (p) => p.agent.id === q.agent.id
      );
      j && j !== q && me(j);
    }
  }, [N, q, D]);
  const ne = n(
    async (j) => {
      var be;
      const p = j.coordinatorName || ((be = j.members[0]) == null ? void 0 : be.name), ce = kn(j, I);
      if (!ce) {
        const xe = j.members.find(
          (Ie) => Ie.name === p
        );
        c.error(
          (xe == null ? void 0 : xe.bindingMode) === "fixed" ? `固定协调者「${p || "协调者"}」当前不可用，请修复绑定后再运行` : "没有可用的 Agent 作为工作流控制器"
        );
        return;
      }
      if (/\{.+?\}/.test(j.taskTemplate)) {
        ie(j.taskTemplate), m(j);
        return;
      }
      await v(j, ce, j.taskTemplate);
    },
    [I, c]
  ), v = n(
    async (j, p, ce) => {
      H(!0);
      try {
        const ye = ce || j.taskTemplate, be = j.custom ? `@${j.id}` : j.name, xe = `/ugsci-team ${j.mode} ${be} ${ye}`, Ie = w();
        Ie.setSelectedAgent && Ie.setSelectedAgent(p);
        const Be = await vl(
          p,
          xe,
          j.name
        );
        c.success(
          `OMP 工作流已启动：${j.name}（${j.mode}模式）`
        ), m(null), ue(`/chat/${Be}`);
      } catch (ye) {
        c.error(ye.message || "发起团队任务失败");
      } finally {
        H(!1);
      }
    },
    [c]
  ), ue = (j) => {
    window.history.pushState({}, "", j), window.dispatchEvent(new PopStateEvent("popstate"));
  }, pe = n((j) => {
    f(j), Q(!0);
  }, []), Se = n((j) => {
    me(j), Z(!0);
  }, []), Te = n(
    (j) => {
      if (!j.agent.enabled) {
        c.warning(`专家「${j.agent.name}」未启用，请先启用`);
        return;
      }
      try {
        const p = w();
        p.setSelectedAgent && p.setSelectedAgent(j.agent.id);
      } catch (p) {
        console.warn("[ugsci] Failed to set selected agent:", p);
      }
      c.success(`已召唤专家「${j.agent.name}」，正在跳转至对话...`), ue("/chat");
    },
    [c]
  ), he = a(() => {
    if (!g.trim()) return N;
    const j = g.toLowerCase();
    return N.filter(
      (p) => {
        var ce;
        return p.agent.name.toLowerCase().includes(j) || ((ce = p.agent.description) == null ? void 0 : ce.toLowerCase().includes(j)) || p.agent.id.toLowerCase().includes(j) || p.skills.some((ye) => ye.name.toLowerCase().includes(j));
      }
    );
  }, [N, g]), ee = N.filter((j) => j.agent.enabled).length, F = N.reduce(
    (j, p) => j + p.skills.filter((ce) => ce.enabled !== !1).length,
    0
  ), h = N.reduce((j, p) => j + p.mcps.length, 0), ae = [
    {
      key: "experts",
      label: e.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        U ? e.createElement(U, { style: { fontSize: 14 } }) : null,
        "专家"
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
            prefix: A ? e.createElement(A) : void 0,
            value: g,
            onChange: (j) => O(j.target.value),
            allowClear: !0,
            style: { maxWidth: 400 }
          })
        ),
        // Content
        M ? e.createElement(
          "div",
          { style: { textAlign: "center", padding: 60 } },
          e.createElement(r, { size: "large" })
        ) : he.length === 0 ? e.createElement(s, {
          description: g ? "未找到匹配的专家" : "暂无专家，点击「创建专家」添加"
        }) : e.createElement(
          u,
          { gutter: [12, 12], align: "stretch" },
          ...he.map(
            (j) => e.createElement(
              y,
              {
                key: j.agent.id,
                xs: 24,
                sm: 12,
                md: 8,
                lg: 6,
                style: { display: "flex" }
              },
              e.createElement(cl, {
                expert: j,
                onClick: () => pe(j),
                onSummon: () => Te(j),
                onConfigure: () => Se(j)
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
      children: e.createElement(Al, {
        agents: I,
        onLaunch: ne
      })
    },
    {
      key: "workflows",
      label: e.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        (de = w().antdIcons) != null && de.ApartmentOutlined ? e.createElement(w().antdIcons.ApartmentOutlined, {
          style: { fontSize: 14 }
        }) : null,
        "协作工作流"
      ),
      children: e.createElement($l)
    }
  ];
  return e.createElement(
    "div",
    { style: { padding: 24 } },
    e.createElement(St, {
      title: "专家·协作",
      subtitle: re === "experts" ? `共 ${N.length} 位专家（${ee} 位启用）· ${F} 个技能 · ${h} 个 MCP 客户端` : re === "teams" ? "开放式多专家讨论、联合研判与 OMP 动态协作" : "流程化、可观测、可验证的油气与储气库协作流程",
      extra: e.createElement(
        e.Fragment,
        null,
        re === "experts" ? e.createElement(
          d,
          {
            icon: T ? e.createElement(T) : void 0,
            onClick: () => {
              st(), le();
            },
            loading: M
          },
          "刷新"
        ) : null,
        re === "experts" ? e.createElement(
          d,
          {
            type: "primary",
            icon: C ? e.createElement(C) : void 0,
            onClick: () => W(!0),
            style: Ae
          },
          "创建专家"
        ) : null
      )
    }),
    e.createElement(E, {
      items: ae,
      activeKey: re,
      onChange: (j) => {
        L(j);
        const p = new URL(window.location.href);
        j === "experts" ? p.searchParams.delete("section") : p.searchParams.set("section", j), window.history.pushState({}, "", `${p.pathname}${p.search}`);
      }
    }),
    // Drawer
    e.createElement(dl, {
      expert: k,
      open: K,
      onClose: () => Q(!1),
      onRefresh: () => le()
    }),
    // Template Modal
    e.createElement(ml, {
      open: R,
      onClose: () => W(!1),
      onCreated: () => le()
    }),
    // Config Modal (gear icon)
    e.createElement(sl, {
      expert: q,
      open: D,
      onClose: () => Z(!1),
      onRefresh: () => le()
    }),
    // Team Launch Modal (for filling placeholders)
    S ? e.createElement(
      b,
      {
        open: !0,
        title: e.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 8 } },
          e.createElement(Dt, {
            members: S.members.map((j) => j.name),
            size: 28
          }),
          e.createElement(
            "span",
            null,
            `发起团队任务 - ${S.name}`
          )
        ),
        onCancel: () => m(null),
        onOk: () => {
          const j = kn(
            S,
            I
          );
          if (!j) {
            c.error("固定协调者不可用或没有可用的控制器 Agent");
            return;
          }
          const p = X.trim() || S.taskTemplate;
          v(S, j, p);
        },
        confirmLoading: P,
        okText: "发起任务",
        width: 600
      },
      e.createElement(
        "div",
        null,
        e.createElement(
          Y,
          {
            type: "secondary",
            style: { fontSize: 12, display: "block", marginBottom: 8 }
          },
          "任务内容（请替换 {参数名} 等占位符后发起）："
        ),
        e.createElement(o.TextArea, {
          value: X,
          onChange: (j) => ie(j.target.value),
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
          Y,
          { style: { fontSize: 12, color: "#0958d9" } },
          `协调者: ${S.coordinatorName || ((ge = S.members[0]) == null ? void 0 : ge.name) || "—"} · 成员: ${S.members.map((j) => j.name).join("、")}`
        )
      )
    ) : null
  );
}
function Ml({
  agentId: e,
  agentName: t,
  onNavigate: l
}) {
  const n = w().React, { useState: a, useEffect: r, useCallback: s } = n, {
    Spin: o,
    Empty: d,
    Button: c,
    Row: u,
    Col: y,
    Card: E,
    Tag: b,
    Checkbox: x,
    Modal: T,
    Typography: C,
    Drawer: A,
    Descriptions: B,
    message: U
  } = w().antd, {
    ReloadOutlined: Y,
    ThunderboltOutlined: G,
    SettingOutlined: N,
    CheckSquareOutlined: J,
    EyeOutlined: M,
    EyeInvisibleOutlined: _,
    DeleteOutlined: K,
    CloseOutlined: Q
  } = w().antdIcons || {}, { Text: k, Paragraph: f } = C, [g, O] = a([]), [R, W] = a(!0), [re, L] = a(!1), [S, m] = a(null), [X, ie] = a(!1), [P, H] = a(
    /* @__PURE__ */ new Set()
  ), [D, Z] = a(!1), [q, me] = a(null), [I, te] = a(!1), le = s(async () => {
    if (e) {
      W(!0);
      try {
        const h = await xt(e);
        O(h);
      } catch (h) {
        U.error(h.message || "加载技能失败"), O([]);
      } finally {
        W(!1);
      }
    }
  }, [e]);
  r(() => {
    le();
  }, [le]);
  const ne = (h) => {
    H((ae) => {
      const de = new Set(ae);
      return de.has(h) ? de.delete(h) : de.add(h), de;
    });
  }, v = () => H(/* @__PURE__ */ new Set()), ue = () => H(new Set(g.map((h) => h.name))), pe = () => {
    X ? (v(), ie(!1)) : ie(!0);
  }, Se = async () => {
    const h = Array.from(P);
    if (h.length !== 0) {
      Z(!0);
      try {
        const { results: ae } = await ja(e, h), de = Object.entries(ae).filter(
          ([, j]) => j.success === !1
        ), ge = h.length - de.length;
        de.length > 0 ? U.warning(
          `批量启用完成：成功 ${ge} 个，失败 ${de.length} 个`
        ) : U.success(`成功启用 ${h.length} 个技能`), v(), await le();
      } catch (ae) {
        U.error(ae.message || "批量启用失败");
      } finally {
        Z(!1);
      }
    }
  }, Te = async () => {
    const h = Array.from(P);
    if (h.length !== 0) {
      Z(!0);
      try {
        const { results: ae } = await Ua(e, h), de = Object.entries(ae).filter(
          ([, j]) => j.success === !1
        ), ge = h.length - de.length;
        de.length > 0 ? U.warning(
          `批量停用完成：成功 ${ge} 个，失败 ${de.length} 个`
        ) : U.success(`成功停用 ${h.length} 个技能`), v(), await le();
      } catch (ae) {
        U.error(ae.message || "批量停用失败");
      } finally {
        Z(!1);
      }
    }
  }, he = () => {
    const h = Array.from(P);
    h.length !== 0 && T.confirm({
      title: `确认删除 ${h.length} 个技能？`,
      content: "删除后技能将从当前专家工作区移除，此操作不可撤销。技能池中的原始技能不受影响。",
      okText: "确认删除",
      cancelText: "取消",
      okButtonProps: { danger: !0 },
      onOk: async () => {
        Z(!0);
        try {
          const { results: ae } = await Na(e, h), de = Object.entries(ae).filter(
            ([, j]) => j.success === !1
          ), ge = h.length - de.length;
          de.length > 0 ? U.warning(
            `批量删除完成：成功 ${ge} 个，失败 ${de.length} 个`
          ) : U.success(`成功删除 ${h.length} 个技能`), v(), await le();
        } catch (ae) {
          U.error(ae.message || "批量删除失败");
        } finally {
          Z(!1);
        }
      }
    });
  }, ee = async (h) => {
    te(!0);
    try {
      h.enabled === !1 ? (await Ln(e, h.name), U.success(`已启用技能「${h.name}」`)) : (await Un(e, h.name), U.success(`已禁用技能「${h.name}」`)), await le();
    } catch (ae) {
      U.error(ae.message || "操作失败");
    } finally {
      te(!1);
    }
  }, F = (h) => {
    T.confirm({
      title: `确认删除技能「${h.name}」？`,
      content: "删除后技能将从当前专家工作区移除，此操作不可撤销。技能池中的原始技能不受影响。",
      okText: "确认删除",
      cancelText: "取消",
      okButtonProps: { danger: !0 },
      onOk: async () => {
        te(!0);
        try {
          await Ut(e, h.name), U.success(`已删除技能「${h.name}」`), await le();
        } catch (ae) {
          U.error(ae.message || "删除失败");
        } finally {
          te(!1);
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
        k,
        { type: "secondary", style: { fontSize: 13 } },
        X ? `已选择 ${P.size} / ${g.length} 个技能` : `共 ${g.length} 个技能`
      ),
      n.createElement(
        "div",
        { style: { display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" } },
        X ? n.createElement(
          n.Fragment,
          null,
          n.createElement(
            c,
            { size: "small", onClick: ue },
            "全选"
          ),
          n.createElement(
            c,
            {
              size: "small",
              icon: Q ? n.createElement(Q) : void 0,
              onClick: v
            },
            "取消选择"
          ),
          n.createElement(
            c,
            {
              size: "small",
              type: "default",
              icon: M ? n.createElement(M) : void 0,
              disabled: P.size === 0 || D,
              loading: D,
              onClick: Se
            },
            "批量启用"
          ),
          n.createElement(
            c,
            {
              size: "small",
              danger: !0,
              icon: _ ? n.createElement(_) : void 0,
              disabled: P.size === 0 || D,
              loading: D,
              onClick: Te
            },
            "批量停用"
          ),
          n.createElement(
            c,
            {
              size: "small",
              danger: !0,
              icon: K ? n.createElement(K) : void 0,
              disabled: P.size === 0 || D,
              loading: D,
              onClick: he
            },
            `删除 (${P.size})`
          ),
          n.createElement(
            c,
            {
              size: "small",
              type: "primary",
              onClick: pe
            },
            "退出批量"
          )
        ) : n.createElement(
          n.Fragment,
          null,
          n.createElement(
            c,
            {
              size: "small",
              icon: J ? n.createElement(J) : void 0,
              onClick: pe,
              disabled: g.length === 0
            },
            "批量管理"
          ),
          n.createElement(
            c,
            {
              icon: Y ? n.createElement(Y) : void 0,
              onClick: () => {
                st(), le();
              }
            },
            "刷新"
          )
        )
      )
    ),
    R ? n.createElement(
      "div",
      { style: { textAlign: "center", padding: 60 } },
      n.createElement(o, { size: "large" })
    ) : g.length === 0 ? n.createElement(d, {
      description: "当前智能体未加载任何技能"
    }) : n.createElement(
      u,
      { gutter: [12, 12] },
      ...g.map(
        (h) => n.createElement(
          y,
          { key: h.name, xs: 24, sm: 12, md: 8, lg: 6 },
          n.createElement(
            E,
            {
              hoverable: !0,
              size: "small",
              style: {
                cursor: X ? "default" : "pointer",
                height: "100%",
                position: "relative",
                borderColor: X && P.has(h.name) ? "#0072f5" : void 0,
                borderWidth: X && P.has(h.name) ? 2 : 1
              },
              onClick: () => {
                X ? ne(h.name) : (m(h), L(!0));
              },
              onMouseEnter: () => {
                X || me(h.name);
              },
              onMouseLeave: () => me(null)
            },
            X ? n.createElement(
              "div",
              {
                style: {
                  position: "absolute",
                  top: 8,
                  right: 8,
                  zIndex: 1
                },
                onClick: (ae) => {
                  ae.stopPropagation(), ne(h.name);
                }
              },
              n.createElement(x, {
                checked: P.has(h.name)
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
              h.emoji ? n.createElement(
                "span",
                { style: { fontSize: 18 } },
                h.emoji
              ) : n.createElement(
                "span",
                { style: { fontSize: 18 } },
                "⚡"
              ),
              n.createElement(
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
                h.name
              ),
              h.enabled === !1 ? n.createElement(
                b,
                { color: "default", style: { fontSize: 10 } },
                "已禁用"
              ) : n.createElement(
                b,
                { color: "green", style: { fontSize: 10 } },
                "已启用"
              )
            ),
            h.description ? n.createElement(
              f,
              {
                type: "secondary",
                style: { fontSize: 11, margin: 0, lineHeight: 1.4 },
                ellipsis: { rows: 2 }
              },
              h.description
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
              h.version_text ? n.createElement(
                b,
                { style: { fontSize: 10 } },
                `v${h.version_text}`
              ) : null,
              ...(h.tags || []).slice(0, 3).map(
                (ae, de) => n.createElement(
                  b,
                  { key: de, color: "blue", style: { fontSize: 10 } },
                  ae
                )
              )
            ),
            // Hover action footer (not in batch mode)
            !X && q === h.name ? n.createElement(
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
                c,
                {
                  size: "small",
                  type: "default",
                  icon: h.enabled === !1 ? M ? n.createElement(M) : void 0 : _ ? n.createElement(_) : void 0,
                  disabled: I,
                  onClick: (ae) => {
                    ae.stopPropagation(), ee(h);
                  }
                },
                h.enabled === !1 ? "启用" : "禁用"
              ),
              n.createElement(
                c,
                {
                  size: "small",
                  danger: !0,
                  icon: K ? n.createElement(K) : void 0,
                  disabled: I,
                  onClick: (ae) => {
                    ae.stopPropagation(), F(h);
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
    S ? n.createElement(
      A,
      {
        title: n.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 8 } },
          n.createElement(
            "span",
            { style: { fontSize: 18 } },
            S.emoji || "⚡"
          ),
          n.createElement("span", null, S.name)
        ),
        open: re,
        onClose: () => L(!1),
        width: 520,
        extra: n.createElement(
          c,
          {
            type: "primary",
            size: "small",
            icon: N ? n.createElement(N) : void 0,
            onClick: () => l("/skills")
          },
          "管理技能"
        )
      },
      n.createElement(
        B,
        { column: 1, bordered: !0, size: "small" },
        n.createElement(
          B.Item,
          { label: "技能名称" },
          S.name
        ),
        n.createElement(
          B.Item,
          { label: "描述" },
          S.description || "-"
        ),
        S.version_text ? n.createElement(
          B.Item,
          { label: "版本" },
          S.version_text
        ) : null,
        n.createElement(
          B.Item,
          { label: "来源" },
          S.source || "-"
        ),
        n.createElement(
          B.Item,
          { label: "状态" },
          S.enabled === !1 ? "已禁用" : "已启用"
        ),
        S.installed_from ? n.createElement(
          B.Item,
          { label: "安装来源" },
          S.installed_from
        ) : null
      ),
      // Tags
      S.tags && S.tags.length > 0 ? n.createElement(
        "div",
        { style: { marginTop: 16 } },
        n.createElement(
          k,
          {
            strong: !0,
            style: { display: "block", marginBottom: 8 }
          },
          "标签"
        ),
        n.createElement(
          "div",
          { style: { display: "flex", flexWrap: "wrap", gap: 4 } },
          ...S.tags.map(
            (h, ae) => n.createElement(b, { key: ae, color: "blue" }, h)
          )
        )
      ) : null,
      // Skill content preview
      S.content ? n.createElement(
        "div",
        { style: { marginTop: 16 } },
        n.createElement(
          k,
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
          S.content.slice(0, 2e3) + (S.content.length > 2e3 ? `

... (内容已截断)` : "")
        )
      ) : null
    ) : null
  );
}
function Ll({
  poolSkills: e,
  workspaceSkills: t,
  agents: l,
  loading: n,
  onReload: a,
  agentId: r,
  agentName: s
}) {
  const o = w().React, { useState: d, useMemo: c, useCallback: u } = o, {
    Spin: y,
    Empty: E,
    Input: b,
    Button: x,
    Row: T,
    Col: C,
    Card: A,
    Tag: B,
    Typography: U,
    Drawer: Y,
    Descriptions: G,
    List: N,
    Modal: J,
    message: M
  } = w().antd, {
    ReloadOutlined: _,
    SearchOutlined: K,
    DownloadOutlined: Q,
    ThunderboltOutlined: k,
    DeleteOutlined: f,
    PlusOutlined: g
  } = w().antdIcons || {}, { Text: O, Paragraph: R } = U, [W, re] = d(""), [L, S] = d(!1), [m, X] = d(null), [ie, P] = d([]), [H, D] = d(!1), [Z, q] = d(24), [me, I] = d(null), [te, le] = d(!1), ne = c(() => {
    if (!W.trim()) return e;
    const F = W.toLowerCase();
    return e.filter(
      (h) => {
        var ae, de;
        return h.name.toLowerCase().includes(F) || ((ae = h.description) == null ? void 0 : ae.toLowerCase().includes(F)) || ((de = h.tags) == null ? void 0 : de.some((ge) => ge.toLowerCase().includes(F)));
      }
    );
  }, [e, W]), v = c(
    () => ne.slice(0, Z),
    [ne, Z]
  ), ue = u((F) => {
    re(F), q(24);
  }, []), pe = u(
    (F) => {
      const h = [];
      for (const ae of t)
        if (ae.skills.some((de) => de.name === F)) {
          const de = l.find((ge) => ge.id === ae.agent_id);
          h.push((de == null ? void 0 : de.name) || ae.agent_name || ae.agent_id);
        }
      return h;
    },
    [t, l]
  ), Se = u(
    async (F) => {
      if (X(F), P(pe(F.name)), S(!0), !F.content) {
        D(!0);
        try {
          const h = await Pa(F.name);
          X({ ...F, content: h });
        } catch {
        } finally {
          D(!1);
        }
      }
    },
    [pe]
  ), Te = async (F) => {
    le(!0);
    try {
      await jt(r, F.name), M.success(
        `已将技能「${F.name}」加载到当前专家「${s}」`
      ), a();
    } catch (h) {
      M.error(h.message || "加载技能失败");
    } finally {
      le(!1);
    }
  }, he = (F) => {
    if (F.protected) {
      M.warning("内置技能不可删除");
      return;
    }
    J.confirm({
      title: `确认从技能池删除「${F.name}」？`,
      content: "删除后所有已安装此技能的专家将不受影响，但技能池中将不再包含此技能。此操作不可撤销。",
      okText: "确认删除",
      cancelText: "取消",
      okButtonProps: { danger: !0 },
      onOk: async () => {
        le(!0);
        try {
          await Fa(F.name), M.success(`已从技能池删除「${F.name}」`), a();
        } catch (h) {
          M.error(h.message || "删除失败");
        } finally {
          le(!1);
        }
      }
    });
  }, ee = (F) => {
    window.history.pushState({}, "", F), window.dispatchEvent(new PopStateEvent("popstate"));
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
      o.createElement(b, {
        placeholder: "搜索技能名称、描述或标签...",
        prefix: K ? o.createElement(K) : void 0,
        value: W,
        onChange: (F) => ue(F.target.value),
        allowClear: !0,
        style: { maxWidth: 400 }
      }),
      o.createElement(
        "div",
        { style: { display: "flex", gap: 8 } },
        o.createElement(
          x,
          {
            icon: _ ? o.createElement(_) : void 0,
            onClick: a,
            loading: n,
            size: "small"
          },
          "刷新"
        ),
        o.createElement(
          x,
          {
            type: "primary",
            icon: Q ? o.createElement(Q) : void 0,
            onClick: () => ee("/skill-pool"),
            size: "small",
            style: Ae
          },
          "管理技能池"
        )
      )
    ),
    n ? o.createElement(
      "div",
      { style: { textAlign: "center", padding: 60 } },
      o.createElement(y, { size: "large" })
    ) : ne.length === 0 ? o.createElement(E, {
      description: W ? "未找到匹配的技能" : "技能池为空"
    }) : o.createElement(
      o.Fragment,
      null,
      o.createElement(
        T,
        { gutter: [12, 12] },
        ...v.map(
          (F) => o.createElement(
            C,
            { key: F.name, xs: 24, sm: 12, md: 8, lg: 6 },
            o.createElement(
              A,
              {
                hoverable: !0,
                size: "small",
                style: { cursor: "pointer", height: "100%" },
                onClick: () => Se(F),
                onMouseEnter: () => I(F.name),
                onMouseLeave: () => I(null)
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
                F.emoji ? o.createElement(
                  "span",
                  { style: { fontSize: 18 } },
                  F.emoji
                ) : o.createElement(
                  "span",
                  { style: { fontSize: 18 } },
                  "⚡"
                ),
                o.createElement(
                  O,
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
                F.protected ? o.createElement(
                  B,
                  { color: "gold", style: { fontSize: 10 } },
                  "内置"
                ) : null
              ),
              F.description ? o.createElement(
                R,
                {
                  type: "secondary",
                  style: { fontSize: 11, margin: 0, lineHeight: 1.4 },
                  ellipsis: { rows: 2 }
                },
                F.description
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
                F.version_text ? o.createElement(
                  B,
                  { style: { fontSize: 10 } },
                  `v${F.version_text}`
                ) : null,
                ...(F.tags || []).slice(0, 3).map(
                  (h, ae) => o.createElement(
                    B,
                    { key: ae, color: "cyan", style: { fontSize: 10 } },
                    h
                  )
                )
              ),
              // Hover action footer
              me === F.name ? o.createElement(
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
                  x,
                  {
                    size: "small",
                    type: "primary",
                    icon: g ? o.createElement(g) : void 0,
                    disabled: te,
                    onClick: (h) => {
                      h.stopPropagation(), Te(F);
                    }
                  },
                  "加载到当前Agent"
                ),
                o.createElement(
                  x,
                  {
                    size: "small",
                    danger: !0,
                    icon: f ? o.createElement(f) : void 0,
                    disabled: te || F.protected,
                    onClick: (h) => {
                      h.stopPropagation(), he(F);
                    }
                  },
                  "删除"
                )
              ) : null
            )
          )
        ),
        // Load more button
        v.length < ne.length ? o.createElement(
          "div",
          { style: { textAlign: "center", marginTop: 16 } },
          o.createElement(
            x,
            {
              onClick: () => q((F) => F + 24),
              size: "small"
            },
            `加载更多 (剩余 ${ne.length - v.length} 个)`
          )
        ) : null
      )
    ),
    // Skill detail drawer
    m ? o.createElement(
      Y,
      {
        title: o.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 8 } },
          o.createElement(
            "span",
            { style: { fontSize: 18 } },
            m.emoji || "⚡"
          ),
          o.createElement("span", null, m.name)
        ),
        open: L,
        onClose: () => S(!1),
        width: 520,
        extra: o.createElement(
          x,
          {
            type: "primary",
            size: "small",
            icon: k ? o.createElement(k) : void 0,
            onClick: () => ee("/skills")
          },
          "管理技能"
        )
      },
      o.createElement(
        G,
        { column: 1, bordered: !0, size: "small" },
        o.createElement(
          G.Item,
          { label: "技能名称" },
          m.name
        ),
        o.createElement(
          G.Item,
          { label: "描述" },
          m.description || "-"
        ),
        m.version_text ? o.createElement(
          G.Item,
          { label: "版本" },
          m.version_text
        ) : null,
        o.createElement(
          G.Item,
          { label: "来源" },
          m.source || "-"
        ),
        o.createElement(
          G.Item,
          { label: "受保护" },
          m.protected ? "是（内置）" : "否"
        ),
        m.sync_status ? o.createElement(
          G.Item,
          { label: "同步状态" },
          m.sync_status
        ) : null,
        m.installed_from ? o.createElement(
          G.Item,
          { label: "安装来源" },
          m.installed_from
        ) : null
      ),
      // Tags
      m.tags && m.tags.length > 0 ? o.createElement(
        "div",
        { style: { marginTop: 16 } },
        o.createElement(
          O,
          {
            strong: !0,
            style: { display: "block", marginBottom: 8 }
          },
          "标签"
        ),
        o.createElement(
          "div",
          { style: { display: "flex", flexWrap: "wrap", gap: 4 } },
          ...m.tags.map(
            (F, h) => o.createElement(B, { key: h, color: "cyan" }, F)
          )
        )
      ) : null,
      // Installed agents
      o.createElement(
        "div",
        { style: { marginTop: 16 } },
        o.createElement(
          O,
          { strong: !0, style: { display: "block", marginBottom: 8 } },
          `已安装此技能的专家 (${ie.length})`
        ),
        ie.length > 0 ? o.createElement(N, {
          size: "small",
          dataSource: ie,
          renderItem: (F) => o.createElement(
            N.Item,
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
              o.createElement(Le, { name: F, size: 20 }),
              o.createElement(
                O,
                { style: { fontSize: 13 } },
                F
              )
            )
          )
        }) : o.createElement(
          O,
          { type: "secondary", style: { fontSize: 12 } },
          "暂无专家安装此技能"
        )
      ),
      // Skill content preview (lazy-loaded)
      H ? o.createElement(
        "div",
        { style: { marginTop: 16, textAlign: "center" } },
        o.createElement(y, { size: "small" })
      ) : m.content ? o.createElement(
        "div",
        { style: { marginTop: 16 } },
        o.createElement(
          O,
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
          m.content.slice(0, 2e3) + (m.content.length > 2e3 ? `

... (内容已截断)` : "")
        )
      ) : null
    ) : null
  );
}
function Bl({
  embedded: e = !1
} = {}) {
  const t = w().React, { useState: l, useEffect: n, useCallback: a, useMemo: r } = t, { Tabs: s, message: o } = w().antd, { ThunderboltOutlined: d, AppstoreOutlined: c } = w().antdIcons || {}, y = w().useSelectedAgent, E = y ? y() : null, b = (E == null ? void 0 : E.id) || "default";
  n(() => {
    Mt();
  }, [b]);
  const [x, T] = l([]), [C, A] = l([]), [B, U] = l([]), [Y, G] = l(!0), [N, J] = l("agent-skills"), M = a(async () => {
    G(!0);
    try {
      const [f, g, O] = await Promise.all([
        Bt(!0),
        wt(),
        Oa()
      ]);
      A(f), T(g), U(O);
    } catch (f) {
      o.error(f.message || "加载技能列表失败"), A([]);
    } finally {
      G(!1);
    }
  }, []);
  n(() => {
    M();
  }, [M]);
  const _ = r(() => {
    const f = x.find((g) => g.id === b);
    return (f == null ? void 0 : f.name) || b;
  }, [x, b]), K = (f) => {
    window.history.pushState({}, "", f), window.dispatchEvent(new PopStateEvent("popstate"));
  }, Q = [
    {
      key: "agent-skills",
      label: t.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        d ? t.createElement(d, { style: { fontSize: 14 } }) : null,
        "当前专家"
      ),
      children: t.createElement(Ml, {
        agentId: b,
        agentName: _,
        onNavigate: K
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
      children: t.createElement(Ll, {
        poolSkills: C,
        workspaceSkills: B,
        agents: x,
        loading: Y,
        onReload: M,
        agentId: b,
        agentName: _
      })
    }
  ], k = t.createElement(s, {
    items: Q,
    activeKey: N,
    onChange: (f) => J(f)
  });
  return e ? k : t.createElement(
    "div",
    { style: { padding: 24 } },
    t.createElement(St, {
      title: "技能",
      subtitle: `技能池共 ${C.length} 个技能 · 当前智能体：${_}`
    }),
    k
  );
}
const Ot = {
  reservoir_simulation: "油藏数值模拟",
  geological_modeling: "地质建模",
  well_log_analysis: "测井分析",
  production_engineering: "采油工程",
  post_processing: "后处理与可视化",
  multiphysics: "多物理场仿真"
}, Xn = {
  reservoir_simulation: "🛢️",
  geological_modeling: "🏔️",
  well_log_analysis: "📡",
  production_engineering: "⚙️",
  post_processing: "📊",
  multiphysics: "🔬"
}, Vn = /* @__PURE__ */ new Set(["cmg", "comsol", "tnavigator", "eclipse", "intersect", "visage"]);
function Yn(e) {
  return vt(`/ugsci/engines/icon/${encodeURIComponent(e)}`);
}
async function jl() {
  return se("/ugsci/engines/list");
}
async function Ul(e) {
  return se("/ugsci/engines/", {
    method: "POST",
    body: JSON.stringify(e)
  });
}
async function Nl(e, t) {
  return se(`/ugsci/engines/${encodeURIComponent(e)}`, {
    method: "PUT",
    body: JSON.stringify(t)
  });
}
async function Dl(e) {
  return se(
    `/ugsci/engines/${encodeURIComponent(e)}`,
    { method: "DELETE" }
  );
}
async function Fl() {
  return se("/ugsci/engines/detect/refresh", {
    method: "POST"
  });
}
function Gl({
  engine: e,
  onClick: t
}) {
  const l = w().React, { Card: n, Tag: a, Typography: r } = w().antd, { Text: s } = r, o = e.status === "detected", d = Xn[e.category] || "📦", u = Vn.has(e.id) ? l.createElement("img", {
    src: Yn(e.id),
    alt: e.name,
    style: { width: 24, height: 24, objectFit: "contain" }
  }) : l.createElement("span", { style: { fontSize: 20 } }, d);
  return l.createElement(
    n,
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
        o ? l.createElement(
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
        a,
        { style: { fontSize: 11 } },
        Ot[e.category] || e.category
      ) : null,
      e.version ? l.createElement(
        a,
        { color: "blue", style: { fontSize: 11 } },
        `v${e.version}`
      ) : null,
      ...(e.modules || []).map(
        (y) => l.createElement(
          a,
          { key: y, color: "cyan", style: { fontSize: 10 } },
          y
        )
      )
    )
  );
}
function Hl() {
  const e = w().React, { useState: t, useEffect: l, useCallback: n, useMemo: a } = e, {
    Spin: r,
    Empty: s,
    Button: o,
    message: d,
    Row: c,
    Col: u,
    Drawer: y,
    Descriptions: E,
    Tag: b,
    Typography: x,
    Modal: T,
    Input: C,
    Select: A,
    Popconfirm: B,
    Space: U
  } = w().antd, {
    ReloadOutlined: Y,
    SearchOutlined: G,
    PlusOutlined: N,
    EditOutlined: J,
    DeleteOutlined: M,
    CopyOutlined: _,
    ExperimentOutlined: K
  } = w().antdIcons || {}, { Text: Q, Paragraph: k } = x, [f, g] = t([]), [O, R] = t(!0), [W, re] = t(""), [L, S] = t(!1), [m, X] = t(null), [ie, P] = t(!1), [H, D] = t(null), [Z, q] = t({}), [me, I] = t(!1), te = n(async () => {
    R(!0);
    try {
      const ee = await jl();
      g(ee.engines || []);
    } catch (ee) {
      d.error(ee.message || "加载引擎列表失败"), g([]);
    } finally {
      R(!1);
    }
  }, []);
  l(() => {
    te();
  }, [te]);
  const le = a(() => {
    if (!W.trim()) return f;
    const ee = W.toLowerCase();
    return f.filter(
      (F) => {
        var h;
        return F.name.toLowerCase().includes(ee) || F.vendor.toLowerCase().includes(ee) || F.category.toLowerCase().includes(ee) || ((h = F.description) == null ? void 0 : h.toLowerCase().includes(ee));
      }
    );
  }, [f, W]);
  f.filter((ee) => ee.status === "detected").length;
  const ne = n((ee) => {
    navigator.clipboard.writeText(ee).then(() => d.success("路径已复制")).catch(() => d.error("复制失败"));
  }, []), v = n(() => {
    D(null), q({
      name: "",
      vendor: "",
      version: "",
      executable_path: "",
      category: "",
      description: "",
      invocation_hint: ""
    }), P(!0);
  }, []), ue = n((ee) => {
    D(ee), q({ ...ee }), P(!0), S(!1);
  }, []), pe = n(async () => {
    var ee;
    if (!((ee = Z.name) != null && ee.trim())) {
      d.warning("请输入引擎名称");
      return;
    }
    I(!0);
    try {
      H ? (await Nl(H.id, Z), d.success("引擎已更新")) : (await Ul(Z), d.success("引擎已添加")), P(!1), te();
    } catch (F) {
      d.error(F.message || "保存失败");
    } finally {
      I(!1);
    }
  }, [Z, H, te]), Se = n(
    async (ee) => {
      try {
        await Dl(ee), d.success("引擎已删除"), S(!1), te();
      } catch (F) {
        d.error(F.message || "删除失败");
      }
    },
    [te]
  ), Te = n(async () => {
    R(!0);
    try {
      const ee = await Fl();
      g(ee.engines || []), d.success("自动检测完成");
    } catch (ee) {
      d.error(ee.message || "检测失败");
    } finally {
      R(!1);
    }
  }, []), he = n(
    (ee, F, h) => {
      const ae = Z[F] || "";
      return e.createElement(
        "div",
        { style: { marginBottom: 12 } },
        e.createElement(
          Q,
          { style: { fontSize: 13, display: "block", marginBottom: 4 } },
          ee
        ),
        h != null && h.select ? e.createElement(A, {
          value: ae || void 0,
          onChange: (de) => q((ge) => ({ ...ge, [F]: de })),
          style: { width: "100%" },
          options: h.select.options,
          allowClear: !0,
          placeholder: `选择${ee}`
        }) : h != null && h.textarea ? e.createElement(C.TextArea, {
          value: ae,
          onChange: (de) => q((ge) => ({ ...ge, [F]: de.target.value })),
          rows: 3,
          placeholder: `输入${ee}`
        }) : e.createElement(C, {
          value: ae,
          onChange: (de) => q((ge) => ({ ...ge, [F]: de.target.value })),
          placeholder: `输入${ee}`
        })
      );
    },
    [Z]
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
      e.createElement(C, {
        placeholder: "搜索引擎名称、厂商...",
        prefix: G ? e.createElement(G) : void 0,
        value: W,
        onChange: (ee) => re(ee.target.value),
        allowClear: !0,
        style: { maxWidth: 280 }
      }),
      e.createElement(
        o,
        {
          icon: Y ? e.createElement(Y) : void 0,
          onClick: Te,
          loading: O
        },
        "自动检测"
      ),
      e.createElement(
        o,
        {
          type: "primary",
          icon: N ? e.createElement(N) : void 0,
          onClick: v,
          style: Ae
        },
        "添加引擎"
      )
    ),
    // Content
    O ? e.createElement(
      "div",
      { style: { textAlign: "center", padding: 60 } },
      e.createElement(r, {
        size: "large",
        tip: "正在加载引擎..."
      })
    ) : le.length === 0 ? e.createElement(s, {
      description: W ? "无匹配引擎" : "暂无引擎，点击「添加引擎」开始"
    }) : e.createElement(
      c,
      { gutter: [12, 12], align: "stretch" },
      ...le.map(
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
          e.createElement(Gl, {
            engine: ee,
            onClick: () => {
              X(ee), S(!0);
            }
          })
        )
      )
    ),
    // Detail drawer
    m ? e.createElement(
      y,
      {
        title: e.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 8 } },
          e.createElement(
            "span",
            { style: { display: "flex", alignItems: "center" } },
            Vn.has(m.id) ? e.createElement("img", {
              src: Yn(m.id),
              alt: m.name,
              style: { width: 20, height: 20, objectFit: "contain" }
            }) : e.createElement(
              "span",
              { style: { fontSize: 18 } },
              Xn[m.category] || "📦"
            )
          ),
          e.createElement("span", null, m.name)
        ),
        open: L,
        onClose: () => S(!1),
        width: 520,
        extra: e.createElement(
          U,
          null,
          e.createElement(
            o,
            {
              size: "small",
              icon: J ? e.createElement(J) : void 0,
              onClick: () => ue(m)
            },
            "编辑"
          ),
          m.is_default ? null : e.createElement(
            B,
            {
              title: "确认删除此引擎？",
              description: m.name,
              onConfirm: () => Se(m.id),
              okText: "删除",
              cancelText: "取消",
              okButtonProps: { danger: !0 }
            },
            e.createElement(
              o,
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
        E,
        { column: 1, bordered: !0, size: "small" },
        e.createElement(
          E.Item,
          { label: "引擎名称" },
          m.name
        ),
        e.createElement(
          E.Item,
          { label: "厂商" },
          m.vendor || "—"
        ),
        e.createElement(
          E.Item,
          { label: "分类" },
          m.category ? Ot[m.category] || m.category : "—"
        ),
        e.createElement(
          E.Item,
          { label: "状态" },
          e.createElement(
            b,
            {
              color: m.status === "detected" ? "success" : m.status === "not_found" ? "error" : "default"
            },
            m.status === "detected" ? "✅ 已检测" : m.status === "not_found" ? "❌ 路径无效" : "🔧 待配置"
          )
        ),
        e.createElement(
          E.Item,
          { label: "版本" },
          m.version || "—"
        ),
        m.executable_path ? e.createElement(
          E.Item,
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
              o,
              {
                size: "small",
                type: "text",
                icon: _ ? e.createElement(_) : void 0,
                onClick: () => ne(m.executable_path)
              }
            )
          )
        ) : null,
        m.install_dir ? e.createElement(
          E.Item,
          { label: "安装目录" },
          e.createElement(
            "code",
            { style: { fontSize: 12, wordBreak: "break-all" } },
            m.install_dir
          )
        ) : null,
        // Display detected modules with paths
        m.modules && m.modules.length > 0 ? e.createElement(
          E.Item,
          { label: "已检测模块" },
          e.createElement(
            "div",
            { style: { display: "flex", flexDirection: "column", gap: 4 } },
            ...m.modules.map(
              (ee) => e.createElement(
                "div",
                {
                  key: ee,
                  style: { display: "flex", alignItems: "center", gap: 8 }
                },
                e.createElement(
                  b,
                  { color: "cyan", style: { fontSize: 11 } },
                  ee
                ),
                m.module_paths && m.module_paths[ee] ? e.createElement(
                  "code",
                  { style: { fontSize: 11, wordBreak: "break-all" } },
                  m.module_paths[ee]
                ) : null
              )
            )
          )
        ) : null,
        m.license_server ? e.createElement(
          E.Item,
          { label: "许可证服务器" },
          m.license_server
        ) : null,
        e.createElement(
          E.Item,
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
          Q,
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
          b,
          { color: "blue" },
          "默认引擎"
        ) : m.is_custom ? e.createElement(
          b,
          { color: "purple" },
          "自定义引擎"
        ) : null
      )
    ) : null,
    // Add/Edit modal
    e.createElement(
      T,
      {
        title: H ? "编辑引擎" : "添加引擎",
        open: ie,
        onOk: pe,
        onCancel: () => P(!1),
        okText: H ? "保存" : "添加",
        cancelText: "取消",
        confirmLoading: me,
        width: 560
      },
      e.createElement(
        "div",
        { style: { maxHeight: 480, overflow: "auto", paddingRight: 8 } },
        he("引擎名称 *", "name"),
        he("厂商", "vendor"),
        he("版本", "version"),
        he("可执行文件路径", "executable_path"),
        he("安装目录", "install_dir"),
        he("分类", "category", {
          select: {
            options: Object.entries(Ot).map(([ee, F]) => ({
              label: F,
              value: ee
            }))
          }
        }),
        he("描述", "description", { textarea: !0 }),
        he("调用方式提示", "invocation_hint", { textarea: !0 }),
        he("许可证服务器", "license_server")
      )
    )
  );
}
const Wl = Bl, Qn = /* @__PURE__ */ new Set(["tools", "engines", "skills"]);
function Jl(e) {
  try {
    const t = new URLSearchParams(window.location.search).get("tab");
    return t && Qn.has(t) ? t : e;
  } catch {
    return e;
  }
}
function Tn(e) {
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
function $t({ page: e }) {
  const t = w().React, { useEffect: l, useState: n } = t, { Alert: a, Spin: r } = w().antd, [s, o] = n(null), [d, c] = n("");
  if (l(() => {
    let y = !0;
    const E = w().loadBuiltinPage;
    return o(null), E ? (c(""), E(e).then((b) => {
      y && o(() => b);
    }).catch((b) => {
      y && c(
        b instanceof Error ? b.message : "加载原生管理页面失败"
      );
    }), () => {
      y = !1;
    }) : (c("当前 QwenPaw 版本不支持原生页面嵌入"), () => {
      y = !1;
    });
  }, [e]), d)
    return t.createElement(a, {
      type: "error",
      showIcon: !0,
      message: "原生管理功能加载失败",
      description: d
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
function Kl() {
  const e = w().React, { Tabs: t } = w().antd;
  return e.createElement(t, {
    defaultActiveKey: "mcp",
    items: [
      {
        key: "mcp",
        label: "MCP 接入",
        children: e.createElement($t, { page: "mcp" })
      },
      {
        key: "builtin",
        label: "平台内置",
        children: e.createElement($t, { page: "tools" })
      }
    ]
  });
}
function ql() {
  const e = w().React, { Empty: t, Typography: l } = w().antd, { Paragraph: n } = l;
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
function Xl() {
  const e = w().React, { Tabs: t } = w().antd;
  return e.createElement(t, {
    defaultActiveKey: "simulation",
    items: [
      {
        key: "simulation",
        label: "仿真软件",
        children: e.createElement(Hl)
      },
      {
        key: "domain",
        label: "领域计算",
        children: e.createElement(ql)
      },
      {
        key: "runtime",
        label: "运行服务",
        children: e.createElement($t, { page: "acp" })
      }
    ]
  });
}
function Zn({
  initialTab: e = "engines"
} = {}) {
  var T, C;
  const t = w().React, { useEffect: l, useState: n } = t, { Tabs: a, Tag: r } = w().antd, { RocketOutlined: s, ToolOutlined: o, ThunderboltOutlined: d } = w().antdIcons || {}, c = (C = (T = w()).useSelectedAgent) == null ? void 0 : C.call(T), u = (c == null ? void 0 : c.id) || "default", [y, E] = n(
    () => Jl(e)
  );
  l(() => {
    try {
      const A = new URLSearchParams(window.location.search).get("tab");
      A && !Qn.has(A) && Tn(y);
    } catch {
    }
  }, [y]);
  const b = (A) => {
    E(A), Tn(A);
  }, x = (A, B) => t.createElement(
    "span",
    { style: { display: "inline-flex", alignItems: "center", gap: 6 } },
    B ? t.createElement(B, { style: { fontSize: 14 } }) : null,
    A
  );
  return t.createElement(
    "div",
    { style: { padding: 24 } },
    t.createElement(St, {
      title: "工具·技能",
      subtitle: "管理当前专家可调用的引擎、工具、运行服务与专业技能",
      extra: t.createElement(
        r,
        { color: "blue" },
        `当前专家：${u}`
      )
    }),
    t.createElement(a, {
      activeKey: y,
      onChange: (A) => b(A),
      items: [
        {
          key: "engines",
          label: x("引擎", s),
          children: t.createElement(Xl)
        },
        {
          key: "tools",
          label: x("工具", o),
          children: t.createElement(Kl)
        },
        {
          key: "skills",
          label: x("技能", d),
          children: t.createElement(Wl, {
            embedded: !0
          })
        }
      ]
    })
  );
}
const ea = Zn;
function Vl() {
  return w().React.createElement(ea, {
    initialTab: "tools"
  });
}
function Yl() {
  return w().React.createElement(ea, {
    initialTab: "skills"
  });
}
const _n = {
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
function Ql(e) {
  if (!e.env) return !1;
  const t = Object.entries(e.env);
  return t.length === 0 ? !1 : t.some(([, l]) => typeof l == "string" && l.length > 0);
}
const yt = "ugsci.market.githubSources", In = "https://github.com/anthropics/skills/tree/main/skills", ta = "https://ugsci-awesome-tools.oss-cn-beijing.aliyuncs.com", Zl = `${ta}/skills`;
function er(e) {
  const t = e.replace(/^\/+/, "");
  return vt(`/plugins/oss-proxy?path=${encodeURIComponent(t)}`);
}
function ht(e) {
  const t = e.replace(/^\/+/, "");
  return je(`/plugins/oss-proxy?path=${encodeURIComponent(t)}`);
}
async function Ht(e) {
  const t = e.replace(/^\/+/, ""), l = await ht(t);
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
function tr(e) {
  var a, r;
  const t = {};
  if (e.env && e.env.length > 0)
    for (const s of e.env)
      t[s] = `your-${s.toLowerCase().replace(/_/g, "-")}`;
  let l = "🔌";
  const n = (e.icon || "").toLowerCase();
  return n.includes("folder") ? l = "📁" : n.includes("git") ? l = "🌿" : n.includes("github") ? l = "🐙" : n.includes("database") || n.includes("postgres") || n.includes("sqlite") ? l = "🗄️" : n.includes("search") || n.includes("brave") ? l = "🔍" : n.includes("browser") || n.includes("puppeteer") ? l = "🎭" : n.includes("memory") || n.includes("brain") ? l = "🧠" : n.includes("file") || n.includes("fetch") ? l = "🌐" : n.includes("slack") ? l = "💬" : n.includes("google") ? l = "📁" : n.includes("notion") ? l = "📝" : n.includes("jupyter") ? l = "📊" : n.includes("science") || n.includes("flask") ? l = "🔬" : n.includes("book") || n.includes("arxiv") ? l = "📚" : n.includes("patent") && (l = "📜"), {
    id: e.id,
    name: e.name,
    emoji: l,
    iconUrl: e.icon_url ? er(e.icon_url) : void 0,
    category: e.category ? Qe(e.category) : "",
    description: e.description,
    transport: e.transport || "stdio",
    command: ((a = e.config) == null ? void 0 : a.command) || "",
    args: ((r = e.config) == null ? void 0 : r.args) || [],
    env: Object.keys(t).length > 0 ? t : void 0
  };
}
const na = "ugsci.market.mcpSources", aa = "ugsci.market.expertSources";
function la(e, t) {
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
function ra(e, t) {
  try {
    localStorage.setItem(e, JSON.stringify(t));
  } catch {
  }
}
function nr() {
  return la(na, "mcp");
}
function pt(e) {
  ra(na, e);
}
function ar() {
  return la(aa, "expert");
}
function gt(e) {
  ra(aa, e);
}
function sa(e) {
  try {
    const t = new URL(e.trim()), l = t.hostname.toLowerCase();
    let n;
    if (l === "github.com" || l === "www.github.com")
      n = "github";
    else if (l === "gitee.com" || l === "www.gitee.com")
      n = "gitee";
    else
      return null;
    const a = t.pathname.split("/").filter((c) => c.length > 0);
    if (a.length < 2) return null;
    const r = decodeURIComponent(a[0]), s = decodeURIComponent(a[1]);
    let o = "main", d = "";
    return a.length >= 4 && (a[2] === "tree" || a[2] === "blob") ? (o = decodeURIComponent(a[3]), a.length > 4 && (d = a.slice(4).map(decodeURIComponent).join("/"))) : a.length > 2 && (d = a.slice(2).map(decodeURIComponent).join("/")), d = d.replace(/\/+$/, "").replace(/^\/+/, ""), {
      owner: r,
      repo: s,
      ref: o || "main",
      skillsPath: d,
      label: `${r}/${s}`,
      platform: n
    };
  } catch {
    return null;
  }
}
function oa(e, t, l, n = "github") {
  return n === "oss" ? `oss:${e}/${l || "/"}` : `${n}:${e}/${t}:${l || "/"}`;
}
function lr(e) {
  try {
    const t = new URL(e.trim()), l = t.hostname.toLowerCase(), n = l.match(
      /^([a-z0-9][a-z0-9-]{1,61}[a-z0-9])\.oss-([a-z0-9-]+)\.aliyuncs\.com$/
    );
    if (!n) return null;
    const a = n[1], r = `${t.protocol}//${l}`, s = decodeURIComponent(t.pathname).replace(/^\/+/, "").replace(/\/+$/, "");
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
function rr() {
  try {
    const e = localStorage.getItem(yt);
    if (!e) {
      const n = [], a = sa(In);
      return a && n.push({
        id: oa(
          a.owner,
          a.repo,
          a.skillsPath,
          a.platform
        ),
        url: In,
        label: a.label,
        owner: a.owner,
        repo: a.repo,
        ref: a.ref,
        skillsPath: a.skillsPath,
        enabled: !1,
        platform: a.platform
      }), localStorage.setItem(yt, JSON.stringify(n)), n;
    }
    const t = JSON.parse(e);
    if (!Array.isArray(t)) return [];
    const l = t.filter(
      (n) => n && typeof n.id == "string" && (typeof n.owner == "string" || n.platform === "oss") && !(n.platform === "oss" && n.url === Zl)
    ).map((n) => ({
      ...n,
      platform: n.platform || "github",
      owner: n.owner || "",
      repo: n.repo || "",
      ref: n.ref || "",
      skillsPath: n.skillsPath || ""
    }));
    return l.length !== t.length && localStorage.setItem(
      yt,
      JSON.stringify(l)
    ), l;
  } catch {
    return [];
  }
}
function ft(e) {
  try {
    localStorage.setItem(
      yt,
      JSON.stringify(e)
    );
  } catch {
  }
}
function sr(e) {
  const t = e.match(/^---\s*\n([\s\S]*?)\n---/);
  if (!t) return {};
  const l = t[1], n = {}, a = l.split(`
`);
  let r = "";
  for (const s of a) {
    const o = s.match(/^(\w[\w-]*)\s*:\s*(.*)$/);
    if (o) {
      r = o[1];
      let d = o[2].trim();
      (d.startsWith('"') && d.endsWith('"') || d.startsWith("'") && d.endsWith("'")) && (d = d.slice(1, -1)), r === "name" ? n.name = d : r === "description" ? n.description = d : r === "version" ? n.version = d : r === "author" && (n.author = d);
    }
  }
  return n;
}
async function or(e) {
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
  const s = await r.json();
  if (!Array.isArray(s)) return [];
  const o = s.filter(
    (c) => c.type === "dir" && c.name
  );
  return await Promise.all(
    o.map(async (c) => {
      const u = e.skillsPath ? e.skillsPath + "/" : "", y = t ? `https://gitee.com/${e.owner}/${e.repo}/raw/${e.ref}/${u}${c.name}/SKILL.md` : `https://raw.githubusercontent.com/${e.owner}/${e.repo}/${e.ref}/${u}${c.name}/SKILL.md`, E = t ? `https://gitee.com/${e.owner}/${e.repo}/tree/${e.ref}/${u}${c.name}` : `https://github.com/${e.owner}/${e.repo}/tree/${e.ref}/${u}${c.name}`, b = {
        sourceId: e.id,
        sourceLabel: e.label,
        name: c.name,
        description: "",
        source_url: E,
        html_url: E,
        version: null,
        author: null
      };
      try {
        const x = {};
        t && e.accessToken && (x.Authorization = `token ${e.accessToken}`);
        const T = await fetch(y, {
          headers: x
        });
        if (!T.ok) return b;
        const C = await T.text(), A = sr(C);
        return {
          ...b,
          name: A.name || c.name,
          description: A.description || "",
          version: A.version || null,
          author: A.author || null
        };
      } catch {
        return b;
      }
    })
  );
}
async function ir(e) {
  const t = lr(e.url);
  if (!t)
    throw new Error(`Invalid OSS URL: ${e.url}`);
  const { endpoint: l, prefix: n } = t, a = n.split("/").map(encodeURIComponent).join("/"), r = await ht(
    `${a}/manifest.json`
  );
  if (!r.ok)
    throw new Error(
      `无法获取技能列表: manifest.json (${r.status})`
    );
  const s = await r.json(), o = [];
  if (s && s.tag_groups && typeof s.tag_groups == "object")
    for (const [u, y] of Object.entries(s.tag_groups))
      Array.isArray(y) && o.push({
        id: u,
        label: Qe(u),
        tags: y
      });
  const d = [];
  function c(u, y) {
    for (const E of u) {
      if (E.type === "collection" && Array.isArray(E.children)) {
        c(E.children, E.name);
        continue;
      }
      const b = E.path || E.name || "";
      if (!b) continue;
      const x = b.split("/").map(encodeURIComponent).join("/"), T = `${l}/${a}/${x}`;
      let C = null;
      if (E.metadata) {
        const B = E.metadata.match(/version:\s*"?([\d.]+)"?/);
        B && (C = B[1]);
      }
      const A = y ? `${e.label}/${y}` : e.label;
      d.push({
        sourceId: e.id,
        sourceLabel: e.label,
        sourcePath: A,
        name: E.name || b.split("/").pop() || b,
        description: E.description || "",
        source_url: T,
        html_url: T,
        version: C,
        author: null,
        tag: E.tag || void 0,
        isOfficial: !0
      });
    }
  }
  if (Array.isArray(s) ? c(
    s.map(
      (u) => typeof u == "string" ? { name: u, path: u } : u
    )
  ) : s && Array.isArray(s.skills) && c(s.skills), d.length === 0)
    throw new Error(
      `manifest.json 中未找到技能。请检查 ${e.url}/manifest.json`
    );
  return { skills: d, categories: o };
}
async function cr() {
  const e = await Ht("mcp/manifest.json"), t = [], l = {};
  if (e.tag_groups && typeof e.tag_groups == "object")
    for (const [a, r] of Object.entries(e.tag_groups))
      Array.isArray(r) && (l[a] = r, t.push({
        id: a,
        label: Qe(a),
        tags: r
      }));
  return { servers: (e.servers || []).map((a) => {
    let r = "";
    const s = a.tags || [];
    for (const [o, d] of Object.entries(l))
      if (d.some((c) => s.includes(c))) {
        r = o;
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
      category: r
    };
  }), categories: t };
}
async function dr() {
  const e = await Ht("skills/manifest.json"), t = [], l = /* @__PURE__ */ new Set();
  function n(a, r) {
    for (const s of a) {
      if ((s == null ? void 0 : s.type) === "collection" && Array.isArray(s.children)) {
        n(s.children, s.name || r);
        continue;
      }
      const o = String((s == null ? void 0 : s.path) || (s == null ? void 0 : s.name) || "").trim();
      if (!o) continue;
      const d = o.split("/").map(encodeURIComponent).join("/"), c = `${ta}/skills/${d}`, u = typeof s.tag == "string" && s.tag.trim() ? s.tag.trim() : void 0;
      u && l.add(u);
      let y = null;
      if (typeof s.metadata == "string") {
        const E = s.metadata.match(/version:\s*"?([\d.]+)"?/);
        E && (y = E[1]);
      }
      t.push({
        sourceId: "oss:ugsci-official",
        sourceLabel: "UGSci",
        sourcePath: r ? `UGSci/${r}` : "UGSci",
        name: s.name || o.split("/").pop() || o,
        description: s.description || "",
        source_url: c,
        html_url: c,
        version: y,
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
async function mr() {
  const e = await Ht("agents/manifest.json"), t = [], l = {};
  if (e.tag_groups && typeof e.tag_groups == "object")
    for (const [a, r] of Object.entries(e.tag_groups))
      Array.isArray(r) && (l[a] = r, t.push({
        id: a,
        label: Qe(a),
        tags: r
      }));
  return { agents: (e.agents || []).map((a) => {
    let r = "";
    const s = a.tags || [];
    for (const [o, d] of Object.entries(l))
      if (d.some((c) => s.includes(c))) {
        r = o;
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
      category: r
    };
  }), categories: t };
}
async function ur(e) {
  const t = e.filter((s) => s.enabled), l = await Promise.all(
    t.map(async (s) => {
      try {
        if (s.platform === "oss") {
          const { skills: o, categories: d } = await ir(s);
          return { skills: o, categories: d, error: null, label: s.label };
        } else
          return { skills: await or(s), categories: [], error: null, label: s.label };
      } catch (o) {
        return {
          skills: [],
          categories: [],
          error: o.message || String(o),
          label: s.label
        };
      }
    })
  ), n = [], a = [], r = [];
  for (const s of l)
    n.push(...s.skills), a.push(...s.categories), s.error && r.push({ label: s.label, message: s.error });
  return { skills: n, errors: r, categories: a };
}
function pr({
  open: e,
  onClose: t,
  sources: l,
  onChange: n
}) {
  const a = w().React, { useState: r } = a, {
    Modal: s,
    Input: o,
    Button: d,
    List: c,
    Tag: u,
    Switch: y,
    Typography: E,
    Tooltip: b,
    message: x
  } = w().antd, {
    PlusOutlined: T,
    DeleteOutlined: C,
    LinkOutlined: A,
    GithubOutlined: B
  } = w().antdIcons || {}, { Text: U } = E, [Y, G] = r(""), [N, J] = r(""), M = () => {
    const k = Y.trim();
    if (!k) return;
    const f = sa(k);
    if (!f) {
      x.error("无效的仓库 URL，请输入类似 https://github.com/owner/repo/tree/main/skills 或 https://gitee.com/owner/repo/tree/master/skills 的链接");
      return;
    }
    const g = oa(f.owner, f.repo, f.skillsPath, f.platform);
    if (l.some((W) => W.id === g)) {
      x.warning("该源已存在");
      return;
    }
    const O = {
      id: g,
      url: k,
      label: f.label,
      owner: f.owner,
      repo: f.repo,
      ref: f.ref,
      skillsPath: f.skillsPath,
      enabled: !0,
      platform: f.platform,
      accessToken: N.trim() || void 0
    }, R = [...l, O];
    ft(R), n(R), G(""), J(""), x.success(`已添加源: ${f.label}`);
  }, _ = (k, f) => {
    const g = l.map(
      (O) => O.id === k ? { ...O, enabled: f } : O
    );
    ft(g), n(g);
  }, K = (k, f) => {
    const g = l.map(
      (O) => O.id === k ? { ...O, accessToken: f.trim() || void 0 } : O
    );
    ft(g), n(g);
  }, Q = (k) => {
    const f = l.filter((g) => g.id !== k);
    ft(f), n(f), x.success("已移除源");
  };
  return a.createElement(
    s,
    {
      open: e,
      onCancel: t,
      title: a.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 8 } },
        B ? a.createElement(B, { style: { fontSize: 18 } }) : null,
        a.createElement("span", null, "配置技能源")
      ),
      footer: a.createElement(
        d,
        { onClick: t },
        "关闭"
      ),
      width: 640
    },
    a.createElement(
      "div",
      { style: { marginBottom: 16 } },
      a.createElement(
        U,
        { type: "secondary", style: { fontSize: 12, display: "block", marginBottom: 8 } },
        "添加 GitHub 或 Gitee 仓库作为技能源，系统将从该仓库的指定目录获取技能列表。支持格式："
      ),
      a.createElement(
        "div",
        { style: { display: "flex", gap: 8, alignItems: "center" } },
        a.createElement(o, {
          placeholder: "https://github.com/owner/repo/tree/main/skills 或 https://gitee.com/owner/repo/tree/master/skills",
          value: Y,
          onChange: (k) => G(k.target.value),
          onPressEnter: M,
          prefix: A ? a.createElement(A) : void 0,
          style: { flex: 1 }
        }),
        a.createElement(
          d,
          {
            type: "primary",
            icon: T ? a.createElement(T) : void 0,
            onClick: M
          },
          "添加"
        )
      ),
      // Gitee token input (shown when URL looks like a Gitee link)
      Y.trim() && Y.trim().toLowerCase().includes("gitee.com") ? a.createElement(
        "div",
        { style: { marginTop: 8, display: "flex", gap: 8, alignItems: "center" } },
        a.createElement(
          U,
          { type: "secondary", style: { fontSize: 12, whiteSpace: "nowrap" } },
          "Gitee Token:"
        ),
        a.createElement(o.Password, {
          placeholder: "私有仓库请填写 Gitee 私人令牌（可选）",
          value: N,
          onChange: (k) => J(k.target.value),
          style: { flex: 1 }
        })
      ) : null
    ),
    a.createElement(
      "div",
      { style: { marginBottom: 8, display: "flex", alignItems: "center", justifyContent: "space-between" } },
      a.createElement(U, { strong: !0 }, `已配置源 (${l.length})`)
    ),
    a.createElement(c, {
      size: "small",
      bordered: !0,
      dataSource: l,
      renderItem: (k) => a.createElement(
        c.Item,
        {
          actions: [
            a.createElement(
              b,
              { title: k.enabled ? "点击禁用" : "点击启用" },
              a.createElement(y, {
                size: "small",
                checked: k.enabled,
                onChange: (f) => _(k.id, f)
              })
            ),
            a.createElement(
              b,
              { title: "移除此源" },
              a.createElement(
                d,
                {
                  size: "small",
                  type: "text",
                  danger: !0,
                  icon: C ? a.createElement(C) : void 0,
                  onClick: () => Q(k.id)
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
              { color: k.platform === "gitee" ? "orange" : k.platform === "oss" ? "green" : "blue", style: { fontSize: 11 } },
              k.platform === "gitee" ? "Gitee" : k.platform === "oss" ? "OSS" : "GitHub"
            ),
            a.createElement(
              u,
              { style: { fontSize: 11 } },
              k.label
            ),
            k.skillsPath ? a.createElement(
              U,
              { type: "secondary", style: { fontSize: 11 } },
              `/${k.skillsPath}`
            ) : null,
            k.platform !== "oss" ? a.createElement(
              U,
              { type: "secondary", style: { fontSize: 11 } },
              `@${k.ref}`
            ) : null
          ),
          a.createElement(
            U,
            {
              type: "secondary",
              style: { fontSize: 11, wordBreak: "break-all" }
            },
            k.url
          ),
          // Gitee token input for existing Gitee sources
          k.platform === "gitee" ? a.createElement(
            "div",
            { style: { marginTop: 6, display: "flex", gap: 6, alignItems: "center" } },
            a.createElement(
              U,
              { type: "secondary", style: { fontSize: 11, whiteSpace: "nowrap" } },
              "Token:"
            ),
            a.createElement(o.Password, {
              size: "small",
              placeholder: "Gitee 私人令牌（可选，用于私有仓库）",
              value: k.accessToken || "",
              onChange: (f) => K(k.id, f.target.value),
              style: { flex: 1 }
            })
          ) : null
        )
      )
    })
  );
}
function zn({
  open: e,
  onClose: t,
  sources: l,
  onChange: n,
  type: a
}) {
  const r = w().React, { useState: s } = r, {
    Modal: o,
    Input: d,
    Button: c,
    List: u,
    Tag: y,
    Switch: E,
    Typography: b,
    Tooltip: x,
    message: T
  } = w().antd, {
    PlusOutlined: C,
    DeleteOutlined: A,
    LinkOutlined: B,
    ApiOutlined: U,
    UserOutlined: Y,
    ImportOutlined: G,
    ExportOutlined: N,
    CopyOutlined: J
  } = w().antdIcons || {}, { Text: M } = b, [_, K] = s(""), [Q, k] = s(""), [f, g] = s(""), [O, R] = s(!1), W = a === "mcp" ? "MCP" : "专家模板", re = a === "mcp" ? U ? r.createElement(U, { style: { fontSize: 18 } }) : null : Y ? r.createElement(Y, { style: { fontSize: 18 } }) : null, L = () => {
    const P = _.trim(), H = Q.trim();
    if (!P) return;
    const D = H || P.slice(0, 40), Z = `${a}:${P}`;
    if (l.some((I) => I.id === Z)) {
      T.warning("该源已存在");
      return;
    }
    const q = {
      id: Z,
      label: D,
      url: P,
      enabled: !0,
      type: a
    }, me = [...l, q];
    a === "mcp" ? pt(me) : gt(me), n(me), K(""), k(""), T.success(`已添加${W}源: ${D}`);
  }, S = (P, H) => {
    const D = l.map(
      (Z) => Z.id === P ? { ...Z, enabled: H } : Z
    );
    a === "mcp" ? pt(D) : gt(D), n(D);
  }, m = (P) => {
    const H = l.filter((D) => D.id !== P);
    a === "mcp" ? pt(H) : gt(H), n(H), T.success("已移除源");
  }, X = () => {
    const P = JSON.stringify(
      { type: a, sources: l },
      null,
      2
    );
    try {
      navigator.clipboard.writeText(P), T.success(`${W}源已复制到剪贴板（${l.length} 个源）`);
    } catch {
      const H = document.createElement("textarea");
      H.value = P, document.body.appendChild(H), H.select(), document.execCommand("copy"), document.body.removeChild(H), T.success(`${W}源已复制到剪贴板（${l.length} 个源）`);
    }
  }, ie = () => {
    const P = f.trim();
    if (!P) {
      T.warning("请粘贴 JSON 内容");
      return;
    }
    try {
      const H = JSON.parse(P);
      let D = [];
      if (Array.isArray(H))
        D = H;
      else if (H && Array.isArray(H.sources))
        D = H.sources;
      else if (H && typeof H == "object")
        D = [H];
      else
        throw new Error("Invalid format");
      const Z = D.filter(
        (te) => te && typeof te.url == "string" && typeof te.label == "string"
      );
      if (Z.length === 0) {
        T.error("未找到有效的源数据");
        return;
      }
      const q = new Set(l.map((te) => te.id)), me = [];
      for (const te of Z) {
        const le = te.id || `${a}:${te.url}`;
        q.has(le) || me.push({
          id: le,
          label: te.label,
          url: te.url,
          enabled: te.enabled !== !1,
          type: a
        });
      }
      if (me.length === 0) {
        T.info("所有源均已存在，无新增");
        return;
      }
      const I = [...l, ...me];
      a === "mcp" ? pt(I) : gt(I), n(I), g(""), R(!1), T.success(`成功导入 ${me.length} 个${W}源`);
    } catch (H) {
      T.error(`JSON 解析失败: ${H.message || "格式错误"}`);
    }
  };
  return r.createElement(
    o,
    {
      open: e,
      onCancel: t,
      title: r.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 8 } },
        re,
        r.createElement("span", null, `配置${W}源`)
      ),
      footer: r.createElement(
        "div",
        { style: { display: "flex", justifyContent: "space-between" } },
        r.createElement(
          "div",
          { style: { display: "flex", gap: 8 } },
          r.createElement(
            c,
            {
              icon: N ? r.createElement(N) : void 0,
              onClick: X,
              disabled: l.length === 0,
              size: "small"
            },
            "导出到剪贴板"
          ),
          r.createElement(
            c,
            {
              icon: G ? r.createElement(G) : void 0,
              onClick: () => R(!O),
              size: "small"
            },
            O ? "隐藏导入" : "导入JSON"
          )
        ),
        r.createElement(
          c,
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
      `配置${W}源地址，支持从远程仓库或团队共享的 JSON 导入${W}配置。`
    ),
    // Import section (collapsible)
    O ? r.createElement(
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
        M,
        { strong: !0, style: { fontSize: 12, display: "block", marginBottom: 8 } },
        `粘贴${W}源 JSON（支持从导出的剪贴板内容粘贴）`
      ),
      r.createElement(d.TextArea, {
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
        value: f,
        onChange: (P) => g(P.target.value),
        autoSize: { minRows: 4, maxRows: 10 },
        style: { fontFamily: "monospace", fontSize: 12 }
      }),
      r.createElement(
        "div",
        { style: { marginTop: 8, display: "flex", gap: 8 } },
        r.createElement(
          c,
          {
            type: "primary",
            size: "small",
            onClick: ie
          },
          "导入"
        ),
        r.createElement(
          c,
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
      r.createElement(d, {
        placeholder: "源名称（可选，如：团队MCP仓库）",
        value: Q,
        onChange: (P) => k(P.target.value),
        style: { width: 200 }
      }),
      r.createElement(d, {
        placeholder: a === "mcp" ? "https://raw.githubusercontent.com/team/mcp-registry/main/mcp.json" : "https://raw.githubusercontent.com/team/expert-registry/main/experts.json",
        value: _,
        onChange: (P) => K(P.target.value),
        onPressEnter: L,
        prefix: B ? r.createElement(B) : void 0,
        style: { flex: 1 }
      }),
      r.createElement(
        c,
        {
          type: "primary",
          icon: C ? r.createElement(C) : void 0,
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
        M,
        { strong: !0 },
        `已配置源 (${l.length})`
      )
    ),
    r.createElement(u, {
      size: "small",
      bordered: !0,
      dataSource: l,
      renderItem: (P) => r.createElement(
        u.Item,
        {
          actions: [
            r.createElement(
              x,
              { title: P.enabled ? "点击禁用" : "点击启用" },
              r.createElement(E, {
                size: "small",
                checked: P.enabled,
                onChange: (H) => S(P.id, H)
              })
            ),
            r.createElement(
              x,
              { title: "移除此源" },
              r.createElement(
                c,
                {
                  size: "small",
                  type: "text",
                  danger: !0,
                  icon: A ? r.createElement(A) : void 0,
                  onClick: () => m(P.id)
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
              y,
              {
                color: a === "mcp" ? "purple" : "blue",
                style: { fontSize: 11 }
              },
              P.label
            ),
            P.enabled ? null : r.createElement(
              y,
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
            P.url
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
async function gr() {
  return se("/market/providers");
}
async function fr(e) {
  return se(
    `/market/categories?lang=${encodeURIComponent(e)}`
  );
}
async function yr(e, t, l, n, a) {
  return se("/market/search", {
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
function An(e) {
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
async function Pn(e, t) {
  const l = { bundle_url: e };
  return t && (l.access_token = t), se("/skills/pool/import", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(l)
  });
}
function Er() {
  const e = w().React, { useState: t, useEffect: l, useCallback: n, useMemo: a, useRef: r } = e, {
    Spin: s,
    Empty: o,
    Input: d,
    Button: c,
    message: u,
    Row: y,
    Col: E,
    Card: b,
    Tag: x,
    Tooltip: T,
    Typography: C,
    Select: A,
    Drawer: B,
    Descriptions: U,
    Tabs: Y,
    Badge: G,
    Progress: N,
    Modal: J,
    Alert: M
  } = w().antd, {
    ReloadOutlined: _,
    SearchOutlined: K,
    DownloadOutlined: Q,
    AppstoreOutlined: k,
    ShopOutlined: f,
    CheckCircleOutlined: g,
    LoadingOutlined: O,
    UserOutlined: R,
    UserAddOutlined: W,
    SettingOutlined: re,
    GithubOutlined: L,
    ApiOutlined: S
  } = w().antdIcons || {}, { Text: m, Paragraph: X, Title: ie } = C, [P, H] = t("skills"), [D, Z] = t([]), [q, me] = t([]), [I, te] = t([]), [le, ne] = t(""), [v, ue] = t(""), [pe, Se] = t(!1), [Te, he] = t(!1), [ee, F] = t(
    {}
  ), [h, ae] = t(null), [de, ge] = t({}), [j, p] = t([]), [ce, ye] = t(""), [be, xe] = t(""), [Ie, Be] = t(""), [_e, Re] = t({}), [Me, Ue] = t(""), [Ne, De] = t(/* @__PURE__ */ new Set()), [we, Pe] = t(null), [V, ke] = t({}), [ze, Oe] = t([]), [Je, Ke] = t([]), [ve, ot] = t([]), [kt, et] = t(""), [Fe, it] = t(!1), [ia, Wt] = t(!1), [ca, Jt] = t([]), [da, Kt] = t(!1), [ma, qt] = t([]), [ua, Xt] = t(!1), [Vt, Yt] = t([]), [Qt, Zt] = t([]), [en, tn] = t(!1), [qe, nn] = t(""), [an, ln] = t([]), [rn, sn] = t([]), [on, cn] = t(!1), [Xe, dn] = t(""), [Ct, mn] = t(!1), [$e, ct] = t(null), [tt, pa] = t([]), nt = r(null);
  l(() => {
    Promise.all([
      gr().catch(() => []),
      fr("zh").catch(() => []),
      wt().catch(() => [])
    ]).then(([i, z, $]) => {
      Z(i), me(z), p($), $.length > 0 && (ye($[0].id), Ue($[0].id));
    });
  }, []);
  const dt = n(async (i) => {
    const z = i ?? rr();
    if (Oe(i || z), z.filter((oe) => oe.enabled).length === 0) {
      Ke([]);
      return;
    }
    it(!0);
    try {
      const { skills: oe, errors: fe, categories: Ce } = await ur(z);
      if (Ke(oe), pa(Ce), fe.length > 0) {
        for (const Ee of fe)
          console.warn(`[ugsci] GitHub source '${Ee.label}' error: ${Ee.message}`);
        u.warning(
          `部分源加载失败: ${fe.map((Ee) => Ee.label).join(", ")}`
        );
      }
    } catch (oe) {
      u.error(oe.message || "加载技能源失败"), Ke([]);
    } finally {
      it(!1);
    }
  }, []), Tt = n(async () => {
    var oe, fe, Ce;
    tn(!0), cn(!0), it(!0);
    const [i, z, $] = await Promise.allSettled([
      cr(),
      mr(),
      dr()
    ]);
    if (i.status === "fulfilled" ? (Yt(i.value.servers), Zt(i.value.categories)) : (console.warn(`[ugsci] MCP manifest error: ${((oe = i.reason) == null ? void 0 : oe.message) || i.reason}`), Yt([]), Zt([])), tn(!1), z.status === "fulfilled" ? (ln(z.value.agents), sn(z.value.categories)) : (console.warn(`[ugsci] Agents manifest error: ${((fe = z.reason) == null ? void 0 : fe.message) || z.reason}`), ln([]), sn([])), cn(!1), $.status === "fulfilled")
      ot($.value.skills), et("");
    else {
      const Ee = ((Ce = $.reason) == null ? void 0 : Ce.message) || String($.reason);
      console.warn(`[ugsci] Skills manifest error: ${Ee}`), ot([]), et(Ee);
    }
    it(!1);
  }, []);
  l(() => {
    dt(), Tt(), Jt(nr()), qt(ar());
  }, [dt, Tt]);
  const mt = n(
    async (i, z, $) => {
      Se(!0);
      try {
        const oe = await yr(
          i,
          $,
          20,
          "zh",
          z || void 0
        );
        $ === void 0 || Object.keys($).length === 0 ? te(oe.results) : te((Ee) => [...Ee, ...oe.results]);
        const fe = Object.values(oe.by_provider || {}).some(
          (Ee) => Ee.has_more
        );
        he(fe);
        const Ce = {};
        for (const [Ee, Ge] of Object.entries(oe.by_provider || {}))
          Ce[Ee] = ($[Ee] || 1) + 1;
        if (F(Ce), oe.errors.length > 0)
          for (const Ee of oe.errors)
            console.warn(
              `[ugsci] Market provider '${Ee.provider}' error: ${Ee.message}`
            );
      } catch (oe) {
        u.error(oe.message || "搜索市场失败"), te([]);
      } finally {
        Se(!1);
      }
    },
    []
  );
  l(() => (nt.current && clearTimeout(nt.current), nt.current = setTimeout(() => {
    mt(le, v, {});
  }, 400), () => {
    nt.current && clearTimeout(nt.current);
  }), [le, v, mt]);
  const ga = () => {
    mt(le, v, ee);
  }, un = async (i) => {
    const z = `${i.source}:${i.slug}`;
    try {
      ge((oe) => ({ ...oe, [z]: "installing" }));
      const $ = await Pn(i.source_url);
      $.installed && u.success(
        `技能「${$.name || i.name}」已安装到技能池，可在技能中心查看`
      ), ge((oe) => {
        const fe = { ...oe };
        return delete fe[z], fe;
      });
    } catch ($) {
      u.error(An($) || "安装技能失败"), ge((oe) => {
        const fe = { ...oe };
        return delete fe[z], fe;
      });
    }
  }, fa = (i) => {
    window.history.pushState({}, "", i), window.dispatchEvent(new PopStateEvent("popstate"));
  }, ya = async (i) => {
    const z = `github:${i.sourceId}:${i.name}`, $ = ze.find((fe) => fe.id === i.sourceId), oe = ($ == null ? void 0 : $.accessToken) || void 0;
    try {
      ge((Ce) => ({ ...Ce, [z]: "installing" }));
      const fe = await Pn(i.source_url, oe);
      fe.installed && u.success(
        `技能「${fe.name || i.name}」已安装到技能池，可在技能中心查看`
      ), ge((Ce) => {
        const Ee = { ...Ce };
        return delete Ee[z], Ee;
      });
    } catch (fe) {
      u.error(An(fe) || "安装技能失败"), ge((Ce) => {
        const Ee = { ...Ce };
        return delete Ee[z], Ee;
      });
    }
  }, We = a(() => {
    const i = [], z = /* @__PURE__ */ new Set();
    for (const $ of [...ve, ...Je]) {
      const oe = $.source_url || `${$.sourceLabel}:${$.name}`;
      z.has(oe) || (z.add(oe), i.push($));
    }
    return i;
  }, [ve, Je]), pn = a(() => {
    const i = [], z = /* @__PURE__ */ new Set();
    if (tt.length > 0)
      for (const $ of tt)
        z.has($.id) || (z.add($.id), i.push($));
    for (const $ of We)
      $.tag && !z.has($.tag) && (z.add($.tag), i.push({ id: $.tag, label: $.tag }));
    for (const $ of We)
      !$.isOfficial && $.sourceLabel && !z.has($.sourceLabel) && (z.add($.sourceLabel), i.push({ id: $.sourceLabel, label: $.sourceLabel }));
    return i;
  }, [We, tt]), _t = a(() => {
    let i = We;
    if (v) {
      const z = tt.find(($) => $.id === v);
      z && z.tags ? i = i.filter(
        ($) => $.tag && z.tags.includes($.tag) || $.sourceLabel === v
      ) : i = i.filter(
        ($) => $.tag === v || $.sourceLabel === v
      );
    }
    if (le.trim()) {
      const z = le.toLowerCase();
      i = i.filter(
        ($) => {
          var oe;
          return $.name.toLowerCase().includes(z) || ((oe = $.description) == null ? void 0 : oe.toLowerCase().includes(z));
        }
      );
    }
    return i;
  }, [We, le, v, tt]), gn = D.filter((i) => i.available), Ve = a(() => v ? I.filter((i) => {
    const z = gn.find(($) => $.key === i.source);
    return (z == null ? void 0 : z.label) === v;
  }) : I, [I, v, gn]), Ea = e.createElement(
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
      e.createElement(d, {
        placeholder: "搜索技能市场...",
        prefix: K ? e.createElement(K) : void 0,
        value: le,
        onChange: (i) => ne(i.target.value),
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
        c,
        {
          icon: L ? e.createElement(L) : void 0,
          onClick: () => Wt(!0),
          size: "small"
        },
        "配置技能源"
      )
    ),
    // Dynamic category filter tags (from OSS manifest tags + imported sources)
    kt && We.length === 0 ? e.createElement(M, {
      type: "warning",
      showIcon: !0,
      message: "UGSci 官方 OSS 技能库加载失败",
      description: "请检查网络或后端 OSS 代理服务，然后点击右上角“刷新”重试。",
      style: { marginBottom: 12 }
    }) : null,
    pn.length > 0 ? e.createElement(
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
        x,
        {
          style: {
            fontSize: 11,
            cursor: "pointer",
            borderRadius: 12
          },
          color: v === "" ? "blue" : void 0,
          onClick: () => ue("")
        },
        "全部"
      ),
      ...pn.map((i) => {
        const z = Je.some(
          ($) => !$.isOfficial && $.sourceLabel === i.id
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
            color: v === i.id ? z ? "blue" : "geekblue" : void 0,
            icon: z && L ? e.createElement(L) : void 0,
            onClick: () => ue(
              v === i.id ? "" : i.id
            )
          },
          i.label
        );
      })
    ) : null,
    // GitHub skills section
    Fe && We.length === 0 ? e.createElement(
      "div",
      { style: { textAlign: "center", padding: 40, marginBottom: 16 } },
      e.createElement(s, { size: "large" }, e.createElement("div", { style: { minHeight: 60, display: "flex", alignItems: "center", justifyContent: "center" } }, "正在加载技能..."))
    ) : _t.length > 0 ? e.createElement(
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
          `技能市场 (${_t.length})`
        )
      ),
      e.createElement(
        y,
        { gutter: [12, 12] },
        ..._t.map((i) => {
          const z = `github:${i.sourceId}:${i.name}`, $ = de[z];
          return e.createElement(
            E,
            { key: z, xs: 24, sm: 12, md: 8, lg: 6 },
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
                L ? e.createElement(L, {
                  style: { fontSize: 18, color: "#57606a" }
                }) : e.createElement(
                  "span",
                  { style: { fontSize: 18 } },
                  "📦"
                ),
                e.createElement(
                  T,
                  { title: i.name },
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
                    i.name
                  )
                )
              ),
              e.createElement(
                X,
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
                    S ? e.createElement(S, { style: { fontSize: 10 } }) : null,
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
                $ ? e.createElement(
                  c,
                  {
                    size: "small",
                    disabled: !0,
                    icon: O ? e.createElement(O) : void 0
                  },
                  "安装中"
                ) : e.createElement(
                  c,
                  {
                    type: "primary",
                    size: "small",
                    icon: Q ? e.createElement(Q) : void 0,
                    onClick: () => ya(i)
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
    Ve.length > 0 || pe ? e.createElement(
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
        m,
        { strong: !0, style: { fontSize: 13 } },
        `技能市场${Ve.length > 0 ? ` (${Ve.length})` : ""}`
      )
    ) : null,
    // Results grid
    pe && Ve.length === 0 ? e.createElement(
      "div",
      { style: { textAlign: "center", padding: 60 } },
      e.createElement(s, { size: "large" })
    ) : Ve.length === 0 ? e.createElement(o, {
      description: le ? `未找到匹配「${le}」的技能` : "输入关键词搜索技能市场",
      image: o.PRESENTED_IMAGE_SIMPLE
    }) : e.createElement(
      y,
      { gutter: [12, 12] },
      ...Ve.map((i) => {
        const z = `${i.source}:${i.slug}`, $ = de[z];
        return e.createElement(
          E,
          { key: z, xs: 24, sm: 12, md: 8, lg: 6 },
          e.createElement(
            b,
            {
              hoverable: !0,
              size: "small",
              style: { height: "100%", cursor: "pointer" },
              onClick: () => ae(i)
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
                T,
                { title: i.name },
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
                  i.name
                )
              )
            ),
            e.createElement(
              X,
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
              $ ? e.createElement(
                c,
                {
                  size: "small",
                  disabled: !0,
                  icon: O ? e.createElement(O) : void 0
                },
                "安装中"
              ) : e.createElement(
                c,
                {
                  type: "primary",
                  size: "small",
                  icon: Q ? e.createElement(Q) : void 0,
                  onClick: (oe) => {
                    oe.stopPropagation(), un(i);
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
    Te && !pe ? e.createElement(
      "div",
      { style: { textAlign: "center", marginTop: 16 } },
      e.createElement(
        c,
        { onClick: ga, loading: pe },
        "加载更多"
      )
    ) : null,
    // Detail Drawer
    h ? e.createElement(
      B,
      {
        title: e.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 8 } },
          h.icon_url ? e.createElement("img", {
            src: h.icon_url,
            alt: h.name,
            style: { width: 28, height: 28, borderRadius: 4 }
          }) : e.createElement(
            "span",
            { style: { fontSize: 20 } },
            "📦"
          ),
          e.createElement("span", null, h.name)
        ),
        open: !0,
        onClose: () => ae(null),
        width: 480,
        extra: e.createElement(
          c,
          {
            type: "primary",
            icon: Q ? e.createElement(Q) : void 0,
            onClick: () => {
              un(h);
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
          h.source
        ),
        e.createElement(
          U.Item,
          { label: "描述" },
          h.description || "-"
        ),
        h.version ? e.createElement(
          U.Item,
          { label: "版本" },
          h.version
        ) : null,
        h.author ? e.createElement(
          U.Item,
          { label: "作者" },
          h.author
        ) : null,
        e.createElement(
          U.Item,
          { label: "来源链接" },
          e.createElement(
            "a",
            { href: h.source_url, target: "_blank" },
            h.source_url
          )
        )
      ),
      h.stats ? e.createElement(
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
          ...Object.entries(h.stats).map(
            ([i, z]) => e.createElement(
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
                String(z)
              ),
              e.createElement(
                m,
                { type: "secondary", style: { fontSize: 11 } },
                i
              )
            )
          )
        )
      ) : null
    ) : null
  ), It = a(() => {
    let i = an;
    if (Xe && (i = i.filter((z) => z.category === Xe)), be.trim()) {
      const z = be.toLowerCase();
      i = i.filter(
        ($) => $.name.toLowerCase().includes(z) || $.description.toLowerCase().includes(z) || $.tags.some((oe) => oe.toLowerCase().includes(z))
      );
    }
    return i;
  }, [an, be, Xe]), ha = async (i) => {
    if (!Ct) {
      mn(!0);
      try {
        let z = i.description;
        if (i.instructions)
          try {
            const fe = i.instructions.replace(/^\/+/, ""), Ce = await ht(fe);
            Ce.ok && (z = await Ce.text());
          } catch {
          }
        let $ = [];
        if (i.skills_manifest)
          try {
            const fe = i.skills_manifest.replace(/^\/+/, ""), Ce = await ht(fe);
            if (Ce.ok) {
              const Ee = await Ce.json();
              Array.isArray(Ee) ? $ = Ee.map((Ge) => typeof Ge == "string" ? Ge : Ge.name).filter(Boolean) : Ee.skills && ($ = Ee.skills.map((Ge) => typeof Ge == "string" ? Ge : Ge.name).filter(Boolean));
            }
          } catch {
          }
        const oe = await se("/agents", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: i.name,
            description: i.description,
            skill_names: $
          })
        });
        await Et(oe.id, "AGENTS.md", z), u.success(`专家「${i.name}」创建成功，已跳转至专家`), fa("/ugsci-experts");
      } catch (z) {
        u.error(z.message || "创建专家失败");
      } finally {
        mn(!1);
      }
    }
  }, fn = n(async (i) => {
    if (i)
      try {
        const z = await Nt(i);
        De(new Set(z.map(($) => $.key)));
      } catch {
        De(/* @__PURE__ */ new Set());
      }
  }, []);
  l(() => {
    Me && fn(Me);
  }, [Me, fn]);
  const va = async (i) => {
    if (!Me) {
      u.warning("请先选择目标专家");
      return;
    }
    if (Ql(i)) {
      const z = Object.entries(i.env), $ = {};
      for (const [oe] of z)
        $[oe] = "";
      ke($), Pe(i);
      return;
    }
    await yn(i, i.env || {});
  }, yn = async (i, z) => {
    Re(($) => ({ ...$, [i.id]: !0 }));
    try {
      const $ = i.id;
      await jn(Me, {
        client_key: $,
        client: {
          name: i.name,
          description: i.description,
          enabled: !0,
          transport: i.transport,
          url: i.url || "",
          command: i.command || "",
          args: i.args || [],
          env: z,
          cwd: i.cwd || "",
          headers: i.headers || {}
        }
      }), u.success(`MCP「${i.name}」已添加到当前专家`), De((oe) => new Set(oe).add($));
    } catch ($) {
      u.error($.message || `添加 MCP「${i.name}」失败`);
    } finally {
      Re(($) => ({ ...$, [i.id]: !1 }));
    }
  }, ba = async () => {
    if (!we) return;
    const i = [];
    for (const [$, oe] of Object.entries(V))
      if (!oe || !oe.trim()) {
        const fe = _n[$];
        i.push((fe == null ? void 0 : fe.label) || $);
      }
    if (i.length > 0) {
      u.warning(`请填写以下配置项: ${i.join(", ")}`);
      return;
    }
    const z = we;
    Pe(null), ke({}), await yn(z, { ...V });
  }, zt = a(() => {
    let i = Vt;
    if (qe && (i = i.filter((z) => z.category === qe)), Ie.trim()) {
      const z = Ie.toLowerCase();
      i = i.filter(
        ($) => $.name.toLowerCase().includes(z) || $.description.toLowerCase().includes(z) || $.tags.some((oe) => oe.toLowerCase().includes(z))
      );
    }
    return i.map(tr);
  }, [Vt, Ie, qe]), Sa = e.createElement(
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
      e.createElement(d, {
        placeholder: "搜索 MCP 服务器...",
        prefix: K ? e.createElement(K) : void 0,
        value: Ie,
        onChange: (i) => Be(i.target.value),
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
        e.createElement(A, {
          value: Me,
          onChange: (i) => Ue(i),
          style: { minWidth: 180 },
          size: "small",
          options: j.map((i) => ({ value: i.id, label: i.name }))
        })
      ),
      // Configure MCP source button
      e.createElement(
        c,
        {
          icon: S ? e.createElement(S) : void 0,
          onClick: () => Kt(!0),
          size: "small"
        },
        "配置 MCP 源"
      )
    ),
    // Dynamic category tag row (from OSS manifest tag_groups)
    Qt.length > 0 ? e.createElement(
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
        x,
        {
          style: { fontSize: 11, cursor: "pointer", borderRadius: 12 },
          color: qe === "" ? "blue" : void 0,
          onClick: () => nn("")
        },
        "全部"
      ),
      ...Qt.map(
        (i) => e.createElement(
          x,
          {
            key: i.id,
            style: { fontSize: 11, cursor: "pointer", borderRadius: 12 },
            color: qe === i.id ? "geekblue" : void 0,
            onClick: () => nn(
              qe === i.id ? "" : i.id
            )
          },
          i.label
        )
      )
    ) : null,
    // MCP server cards (dynamic from OSS)
    en && zt.length === 0 ? e.createElement(
      "div",
      { style: { textAlign: "center", padding: 40 } },
      e.createElement(s, { size: "large" }, e.createElement("div", { style: { minHeight: 60, display: "flex", alignItems: "center", justifyContent: "center" } }, "正在加载 MCP 服务器..."))
    ) : zt.length === 0 ? e.createElement(o, {
      description: "未找到匹配的 MCP 服务器",
      image: o.PRESENTED_IMAGE_SIMPLE
    }) : e.createElement(
      y,
      { gutter: [12, 12] },
      ...zt.map(
        (i) => e.createElement(
          E,
          { key: i.id, xs: 24, sm: 12, md: 8 },
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
                i.iconUrl ? e.createElement("img", {
                  src: i.iconUrl,
                  alt: i.name,
                  style: { width: 28, height: 28, objectFit: "contain" },
                  onError: (z) => {
                    z.target.style.display = "none";
                  }
                }) : i.emoji
              ),
              e.createElement(
                "div",
                { style: { flex: 1 } },
                e.createElement(
                  m,
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
              X,
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
                m,
                { type: "secondary", style: { fontSize: 11 } },
                i.transport === "stdio" ? `${i.command} ${(i.args || []).join(" ")}` : i.url || ""
              ),
              Ne.has(i.id) ? e.createElement(
                c,
                { size: "small", disabled: !0 },
                "已安装"
              ) : e.createElement(
                c,
                {
                  type: "primary",
                  size: "small",
                  loading: !!_e[i.id],
                  icon: S ? e.createElement(S) : void 0,
                  onClick: () => va(i)
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
        m,
        { type: "secondary", style: { fontSize: 12 } },
        "MCP 服务器列表来自 UGSci 官方源，自动同步更新"
      )
    )
  ), wa = we ? e.createElement(
    J,
    {
      title: e.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 8 } },
        e.createElement("span", { style: { fontSize: 20, display: "inline-flex", alignItems: "center", justifyContent: "center", width: 24, height: 24 } }, we.iconUrl ? e.createElement("img", { src: we.iconUrl, alt: we.name, style: { width: 22, height: 22, objectFit: "contain" }, onError: (i) => {
          i.target.style.display = "none";
        } }) : we.emoji),
        e.createElement("span", null, `配置 ${we.name} 密钥`)
      ),
      open: !!we,
      onCancel: () => {
        Pe(null), ke({});
      },
      onOk: ba,
      okText: "安装",
      cancelText: "取消",
      width: 520,
      destroyOnClose: !0
    },
    // Description
    e.createElement(
      m,
      { type: "secondary", style: { display: "block", marginBottom: 16, fontSize: 12 } },
      we.description
    ),
    ...Object.entries(we.env || {}).map(([i]) => {
      const z = _n[i], $ = (z == null ? void 0 : z.isSecret) !== !1;
      return e.createElement(
        "div",
        { key: i, style: { marginBottom: 16 } },
        e.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 6, marginBottom: 4 } },
          e.createElement(
            m,
            { strong: !0, style: { fontSize: 13 } },
            (z == null ? void 0 : z.label) || i
          ),
          e.createElement(
            x,
            { color: "orange", style: { fontSize: 10 } },
            "必填"
          )
        ),
        // Help text with optional link
        z ? e.createElement(
          "div",
          { style: { marginBottom: 6, fontSize: 12, color: "#8c8c8c" } },
          z.help,
          z.link ? e.createElement(
            "a",
            {
              href: z.link,
              target: "_blank",
              rel: "noopener noreferrer",
              style: { marginLeft: 4, fontSize: 12 }
            },
            "获取方式 ↗"
          ) : null
        ) : null,
        // Input field
        $ ? e.createElement(d.Password, {
          placeholder: `请输入 ${(z == null ? void 0 : z.label) || i}`,
          value: V[i] || "",
          onChange: (oe) => ke((fe) => ({
            ...fe,
            [i]: oe.target.value
          })),
          style: { width: "100%" }
        }) : e.createElement(d, {
          placeholder: `请输入 ${(z == null ? void 0 : z.label) || i}`,
          value: V[i] || "",
          onChange: (oe) => ke((fe) => ({
            ...fe,
            [i]: oe.target.value
          })),
          style: { width: "100%" }
        }),
        // Show env key name for reference
        e.createElement(
          m,
          { type: "secondary", style: { fontSize: 11, display: "block", marginTop: 2 } },
          `环境变量名: ${i}`
        )
      );
    })
  ) : null, xa = e.createElement(
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
      e.createElement(d, {
        placeholder: "搜索人才...",
        prefix: K ? e.createElement(K) : void 0,
        value: be,
        onChange: (i) => xe(i.target.value),
        allowClear: !0,
        style: { maxWidth: 400, flex: 1, minWidth: 200 }
      }),
      e.createElement(
        c,
        {
          icon: R ? e.createElement(R) : void 0,
          onClick: () => Xt(!0),
          size: "small"
        },
        "配置专家源"
      )
    ),
    // Dynamic category tag row (from OSS manifest tag_groups)
    rn.length > 0 ? e.createElement(
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
        x,
        {
          style: { fontSize: 11, cursor: "pointer", borderRadius: 12 },
          color: Xe === "" ? "blue" : void 0,
          onClick: () => dn("")
        },
        "全部"
      ),
      ...rn.map(
        (i) => e.createElement(
          x,
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
    // Agent cards (dynamic from OSS)
    on && It.length === 0 ? e.createElement(
      "div",
      { style: { textAlign: "center", padding: 40 } },
      e.createElement(s, { size: "large" }, e.createElement("div", { style: { minHeight: 60, display: "flex", alignItems: "center", justifyContent: "center" } }, "正在加载人才市场..."))
    ) : It.length === 0 ? e.createElement(o, {
      description: "未找到匹配的人才",
      image: o.PRESENTED_IMAGE_SIMPLE
    }) : e.createElement(
      y,
      { gutter: [12, 12] },
      ...It.map(
        (i) => e.createElement(
          E,
          { key: i.id, xs: 24, sm: 12, md: 8 },
          e.createElement(
            b,
            {
              hoverable: !0,
              size: "small",
              style: { height: "100%", cursor: "pointer" },
              onClick: () => ct(i)
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
              e.createElement(Le, {
                name: i.name,
                size: 40
              }),
              e.createElement(
                "div",
                { style: { flex: 1 } },
                e.createElement(
                  m,
                  { strong: !0, style: { fontSize: 14 } },
                  i.name
                ),
                e.createElement(
                  "div",
                  { style: { display: "flex", gap: 4, marginTop: 4, flexWrap: "wrap" } },
                  i.category ? e.createElement(
                    x,
                    { color: "blue", style: { fontSize: 10 } },
                    Qe(i.category)
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
              X,
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
                m,
                { type: "secondary", style: { fontSize: 11 } },
                i.tags.filter((z) => z !== "agent" && z !== "template" && z !== "workspace").slice(0, 3).join(" · ") || "人才模板"
              ),
              e.createElement(
                c,
                {
                  type: "primary",
                  size: "small",
                  icon: W ? e.createElement(W) : void 0
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
        m,
        { type: "secondary", style: { fontSize: 12 } },
        "人才市场来自 UGSci 官方源，自动同步更新"
      )
    )
  ), ka = [
    {
      key: "skills",
      label: e.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        k ? e.createElement(k, { style: { fontSize: 14 } }) : null,
        "技能市场"
      ),
      children: Ea
    },
    {
      key: "mcp",
      label: e.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        S ? e.createElement(S, { style: { fontSize: 14 } }) : null,
        "MCP 市场"
      ),
      children: Sa
    },
    {
      key: "experts",
      label: e.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        W ? e.createElement(W, { style: { fontSize: 14 } }) : null,
        "人才市场"
      ),
      children: xa
    }
  ];
  return e.createElement(
    "div",
    { style: { padding: 24 } },
    e.createElement(St, {
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
              mt(le, v, {}), dt(), Tt();
            },
            loading: pe || Fe || en || on
          },
          "刷新"
        )
      )
    }),
    e.createElement(Y, {
      items: ka,
      activeKey: P,
      onChange: (i) => H(i)
    }),
    // Skill source config modal
    e.createElement(pr, {
      open: ia,
      onClose: () => Wt(!1),
      sources: ze,
      onChange: (i) => {
        Oe(i), dt(i);
      }
    }),
    // MCP source config modal
    e.createElement(zn, {
      open: da,
      onClose: () => Kt(!1),
      sources: ca,
      onChange: (i) => Jt(i),
      type: "mcp"
    }),
    // MCP token config modal (for templates requiring secrets)
    wa,
    // Expert source config modal
    e.createElement(zn, {
      open: ua,
      onClose: () => Xt(!1),
      sources: ma,
      onChange: (i) => qt(i),
      type: "expert"
    }),
    // ── Agent Detail Modal (click card to view details, then create) ──
    $e ? e.createElement(
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
          e.createElement(Le, {
            name: $e.name,
            size: 40
          }),
          e.createElement(
            "div",
            null,
            e.createElement(
              m,
              { strong: !0, style: { fontSize: 16 } },
              $e.name
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
              $e.category ? e.createElement(
                x,
                { color: "blue", style: { fontSize: 10 } },
                Qe($e.category)
              ) : null,
              ...$e.tags.filter(
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
        onCancel: () => ct(null),
        width: 640,
        footer: e.createElement(
          "div",
          { style: { textAlign: "right" } },
          e.createElement(
            c,
            {
              onClick: () => ct(null),
              style: { marginRight: 8 }
            },
            "取消"
          ),
          e.createElement(
            c,
            {
              type: "primary",
              loading: Ct,
              disabled: Ct,
              icon: W ? e.createElement(W) : void 0,
              style: Ae,
              onClick: async () => {
                await ha($e), ct(null);
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
          X,
          {
            type: "secondary",
            style: { fontSize: 13, lineHeight: 1.7, margin: 0 }
          },
          $e.description
        )
      ),
      // Skills manifest hint
      $e.skills_manifest ? e.createElement(
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
      $e.instructions ? e.createElement(
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
      $e.drivers && Object.keys($e.drivers).length > 0 ? e.createElement(
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
          ...Object.entries($e.drivers).map(
            ([i, z]) => e.createElement(
              x,
              { key: i, color: "cyan", style: { fontSize: 11 } },
              `${i}${z && z.length > 0 ? ` (${z.join(", ")})` : ""}`
            )
          )
        )
      ) : null
    ) : null
  );
}
function hr() {
  try {
    const t = localStorage.getItem("language") || "";
    if (t) return t.split("-")[0];
  } catch {
  }
  return ((typeof navigator < "u" ? navigator.language : "") || "").split("-")[0] || "en";
}
const On = {
  zh: "您好，UGSci 智能助手在线。无论是油气藏分析、数值模拟还是工程决策，描述您的场景，我来交付结果。",
  en: "UGSci AI assistant is online. From reservoir analysis to numerical simulation and engineering decisions — describe your scenario and I'll deliver results.",
  ja: "UGSci AIアシスタントがオンラインです。油層解析、数値シミュレーション、エンジニアリングの意思決定など、シナリオを描写してください。結果をお届けします。",
  ru: "UGSci AI-ассистент онлайн. От анализа пласта до численного моделирования и инженерных решений — опишите свой сценарий, и я предоставлю результат.",
  vi: "Trợ lý AI UGSci đang trực tuyến. Từ phân tích mỏ, mô phỏng số đến ra quyết định kỹ thuật — mô tả kịch bản của bạn, tôi sẽ giao kết quả.",
  id: "Asisten AI UGSci sedang online. Dari analisis reservoir, simulasi numerik hingga keputusan engineering — jelaskan skenario Anda, saya akan memberikan hasilnya."
}, $n = {
  zh: { label: "能告诉我你都能做点什么吗？", value: "能告诉我你都能做点什么吗" },
  en: { label: "Can you tell me what you can do?", value: "Can you tell me what you can do?" },
  ja: { label: "あなたができることを教えてください", value: "あなたができることを教えてください" },
  ru: { label: "Расскажи, что ты умеешь делать?", value: "Расскажи, что ты умеешь делать?" },
  vi: { label: "Bạn có thể cho tôi biết bạn làm được gì không?", value: "Bạn có thể cho tôi biết bạn làm được gì không?" },
  id: { label: "Bisa cerita apa saja yang bisa Anda lakukan?", value: "Bisa cerita apa saja yang bisa Anda lakukan?" }
};
function vr() {
  const e = w(), t = e.React, { useEffect: l, useRef: n } = t, a = e.useSelectedAgent ? e.useSelectedAgent() : { id: "default" }, r = (a == null ? void 0 : a.id) || "default", s = n(null), o = n(null);
  return l(() => {
    if (s.current === r) return;
    s.current = r, Mt();
    const d = hr(), c = On[d] || On.en, u = $n[d] || $n.en;
    let y = !1;
    return (async () => {
      var E, b;
      try {
        const x = await xt(r);
        if (y) return;
        const T = Mn(x);
        if (o.current) {
          try {
            o.current();
          } catch {
          }
          o.current = null;
        }
        const C = window.QwenPaw;
        (E = C == null ? void 0 : C.chat) != null && E.welcome && (T.length > 0 ? (o.current = C.chat.welcome.set("ugsci", {
          description: c,
          prompts: T
        }), console.info(
          `[ugsci] Injected ${T.length} welcome prompts for agent "${r}"`
        )) : (o.current = C.chat.welcome.set("ugsci", {
          description: c,
          prompts: [u]
        }), console.info(
          `[ugsci] No skills for agent "${r}" — using default prompt`
        )));
      } catch (x) {
        console.warn(
          `[ugsci] Failed to inject welcome prompts for agent "${r}":`,
          x
        );
        const T = window.QwenPaw;
        if ((b = T == null ? void 0 : T.chat) != null && b.welcome && !y) {
          if (o.current) {
            try {
              o.current();
            } catch {
            }
            o.current = null;
          }
          o.current = T.chat.welcome.set("ugsci", {
            description: c,
            prompts: [u]
          });
        }
      }
    })(), () => {
      y = !0;
    };
  }, [r]), null;
}
function br() {
  var d, c, u;
  const e = window.QwenPaw;
  if (!(e != null && e.menu) || !(e != null && e.route)) {
    console.warn(
      "[ugsci] QwenPaw.menu/route API not available — plugin disabled"
    );
    return;
  }
  const t = w().React, l = "ugsci";
  (c = (d = e.chat) == null ? void 0 : d.rightHeader) != null && c.add ? (e.chat.rightHeader.add(l, t.createElement(vr), {
    id: "ugsci.welcome-injector",
    order: -1
    // render before other right-header items (invisible anyway)
  }), console.info("[ugsci] WelcomePromptsInjector registered via rightHeader")) : console.warn(
    "[ugsci] QP.chat.rightHeader.add not available — agent-specific welcome prompts disabled"
  );
  const n = w().antdIcons || {}, a = n.UserSwitchOutlined, r = n.ToolOutlined, s = n.ShopOutlined;
  e.route.add(l, {
    id: "ugsci.experts",
    path: "/ugsci-experts",
    component: Rl
  }), e.menu.add(l, {
    id: "ugsci.experts",
    location: "primary.agentScoped",
    label: () => "专家·协作",
    icon: a ? t.createElement(a, { style: { fontSize: 16 } }) : void 0,
    route: "ugsci.experts",
    order: 5,
    visible: () => at()
  }), e.route.add(l, {
    id: "ugsci.tools-skills",
    path: "/ugsci-tools-skills",
    component: Zn
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
    component: Vl
  }), e.route.add(l, {
    id: "ugsci.skills-center",
    path: "/ugsci-skills",
    component: Yl
  }), e.route.add(l, {
    id: "ugsci.market",
    path: "/ugsci-market",
    component: Er
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
  const o = [
    "core.skills",
    "core.tools",
    "core.acp",
    "core.agent-config",
    "core.agent-stats",
    "core.skill-pool"
  ];
  for (const y of o) {
    try {
      const b = e.menu.snapshot("primary.agentScoped").find((x) => x.id === y);
      b && e.menu.replace(l, y, {
        ...b,
        visible: () => !at()
      });
    } catch {
    }
    try {
      const b = e.menu.snapshot("primary.settings").find((x) => x.id === y);
      b && e.menu.replace(l, y, {
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
function Rt() {
  try {
    br();
  } catch (e) {
    console.error("[ugsci] Failed to build plugin:", e), setTimeout(Rt, 500);
  }
}
var Rn;
if ((Rn = window.QwenPaw) != null && Rn.host)
  Rt();
else {
  const e = setInterval(() => {
    var t;
    (t = window.QwenPaw) != null && t.host && (clearInterval(e), Rt());
  }, 200);
  setTimeout(() => clearInterval(e), 1e4);
}
