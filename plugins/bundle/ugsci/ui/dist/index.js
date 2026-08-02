function x() {
  var t;
  const e = (t = window.QwenPaw) == null ? void 0 : t.host;
  if (!e) throw new Error("[ugsci] QwenPaw.host not available");
  return e;
}
function ka() {
  try {
    return x().getApiToken() || "";
  } catch {
    return "";
  }
}
function ht(e) {
  return x().getApiUrl(e);
}
function Ca(e) {
  const t = ka();
  return {
    "Content-Type": "application/json",
    ...t ? { Authorization: `Bearer ${t}` } : {},
    ...e
  };
}
function Ta(e) {
  const t = new Headers(e), l = {};
  return t.forEach((n, a) => {
    l[a] = n;
  }), l;
}
function je(e, t) {
  const l = x(), n = Ta(t == null ? void 0 : t.headers);
  return l.fetch ? l.fetch(e, { ...t, headers: n }) : fetch(l.getApiUrl(e), {
    ...t,
    headers: { ...Ca(), ...n }
  });
}
const lt = /* @__PURE__ */ new Map(), _a = 15e3;
function Ia(e) {
  return e ? e instanceof Headers ? e.get("X-Agent-Id") || e.get("x-agent-id") || "" : e["X-Agent-Id"] || e["x-agent-id"] || "" : "";
}
function za(e, t, l) {
  return `${e}:${t}:${l}`;
}
function rt() {
  lt.clear();
}
function Rt(e) {
  for (const [t, l] of lt)
    (e ? l.agentId === e : l.agentId) && lt.delete(t);
}
async function se(e, t) {
  const l = ((t == null ? void 0 : t.method) || "GET").toUpperCase(), { bypassCache: n, ...a } = t || {}, r = Ia(
    a.headers
  ), s = za(l, e, r);
  if (l !== "GET" && (r ? Rt(r) : rt()), l === "GET" && !n) {
    const c = lt.get(s);
    if (c && Date.now() - c.ts < _a)
      return c.data;
  }
  const o = await je(e, a);
  if (!o.ok) {
    const c = await o.text().catch(() => "");
    throw new Error(c || `HTTP ${o.status}`);
  }
  if (o.status === 204) return null;
  const d = await o.json();
  return l === "GET" && lt.set(s, {
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
function nt() {
  try {
    return localStorage.getItem("qwenpaw_sidebar_mode") === "simple";
  } catch {
    return !1;
  }
}
function vt(e, t) {
  const l = x();
  return l.ReactMarkdown && l.remarkGfm ? t.createElement(
    l.ReactMarkdown,
    { remarkPlugins: [l.remarkGfm] },
    e
  ) : e.replace(/\*\*(.+?)\*\*/g, "$1").replace(/\*(.+?)\*/g, "$1").replace(/`(.+?)`/g, "$1").replace(/^#+\s*/gm, "").replace(/^[-*]\s+/gm, "• ");
}
function bt({
  title: e,
  subtitle: t,
  extra: l
}) {
  const n = x().React, { Space: a } = x().antd;
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
async function Mt(e) {
  return se(
    `/agents/${encodeURIComponent(e)}`
  );
}
async function St(e) {
  return await se("/skills", {
    headers: { "X-Agent-Id": e }
  }) || [];
}
async function Lt(e = !1) {
  return await se(`/skills/pool${e ? "?summary=true" : ""}`) || [];
}
async function Aa(e) {
  const t = await se(
    `/skills/pool/${encodeURIComponent(e)}/content`
  );
  return (t == null ? void 0 : t.content) || "";
}
async function Pa() {
  return await se(
    "/skills/workspaces"
  ) || [];
}
function Rn(e) {
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
async function Oa(e) {
  return await se("/workspace/files", {
    headers: { "X-Agent-Id": e }
  }) || [];
}
async function yt(e, t, l) {
  return se(`/workspace/files/${encodeURIComponent(t)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify({ content: l })
  });
}
async function $a(e, t, l, n) {
  return se("/workspace/prompt-files", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify({ filename: t, content: l, enable: n })
  });
}
const Ra = /* @__PURE__ */ new Set([
  "CON",
  "PRN",
  "AUX",
  "NUL",
  ...Array.from({ length: 9 }, (e, t) => `COM${t + 1}`),
  ...Array.from({ length: 9 }, (e, t) => `LPT${t + 1}`)
]);
function Ma(e) {
  let t = e.trim();
  if (!t) throw new Error("请输入文件名");
  if (/[\\/]/.test(t)) throw new Error("文件名不能包含路径分隔符");
  if (/[<>:\"|?*\u0000-\u001f]/.test(t))
    throw new Error("文件名包含系统不支持的字符");
  if (/[ .]$/.test(t)) throw new Error("文件名不能以空格或句点结尾");
  t.toLowerCase().endsWith(".md") ? t = `${t.slice(0, -3)}.md` : t += ".md";
  const l = t.split(".", 1)[0].toUpperCase();
  if (!t.slice(0, -3)) throw new Error("文件名不能为空");
  if (Ra.has(l))
    throw new Error("该文件名是系统保留名称，请更换");
  if (new TextEncoder().encode(t).length > 255)
    throw new Error("文件名过长");
  return t;
}
async function La(e, t) {
  const l = await Mt(e);
  l.system_prompt_files = t, await se(`/agents/${encodeURIComponent(e)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(l)
  });
}
async function Bt(e, t) {
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
async function Mn(e, t) {
  await se(`/skills/${encodeURIComponent(t)}/enable`, {
    method: "POST",
    headers: { "X-Agent-Id": e }
  });
}
async function jt(e, t) {
  await se(`/skills/${encodeURIComponent(t)}`, {
    method: "DELETE",
    headers: { "X-Agent-Id": e }
  });
}
async function Ba(e, t) {
  return se("/skills/batch-enable", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify(t)
  });
}
async function ja(e, t) {
  return se("/skills/batch-disable", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify(t)
  });
}
async function Ua(e, t) {
  return se("/skills/batch-delete", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify(t)
  });
}
async function Ut(e) {
  return await se("/mcp", {
    headers: { "X-Agent-Id": e }
  }) || [];
}
async function Ln(e, t) {
  await se(`/mcp/${encodeURIComponent(t)}`, {
    method: "DELETE",
    headers: { "X-Agent-Id": e }
  });
}
async function Bn(e, t) {
  return se("/mcp", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify(t)
  });
}
async function Na(e, t) {
  return se(
    `/mcp/toggle/${encodeURIComponent(t)}`,
    {
      method: "PATCH",
      headers: { "X-Agent-Id": e }
    }
  );
}
async function jn(e, t) {
  await se(`/skills/${encodeURIComponent(t)}/disable`, {
    method: "POST",
    headers: { "X-Agent-Id": e }
  });
}
async function Da(e) {
  await se(`/skills/pool/${encodeURIComponent(e)}`, {
    method: "DELETE"
  });
}
function Fa(e) {
  const t = (e || "").trim();
  if (!t) return { number: 6, unit: "h" };
  const l = t.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/i);
  if (!l) return { number: 6, unit: "h" };
  const n = parseInt(l[1] || "0", 10), a = parseInt(l[2] || "0", 10), r = parseInt(l[3] || "0", 10), s = n * 60 + a + Math.round(r / 60);
  return s <= 0 ? { number: 6, unit: "h" } : s >= 60 && s % 60 === 0 ? { number: s / 60, unit: "h" } : { number: s, unit: "m" };
}
function Ga(e) {
  return e.unit === "h" ? `${e.number}h` : `${e.number}m`;
}
async function Ha(e) {
  return se("/config/heartbeat", {
    headers: { "X-Agent-Id": e }
  });
}
async function Wa(e, t) {
  return se("/config/heartbeat", {
    method: "PUT",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify(t)
  });
}
async function Ja(e) {
  await se("/config/heartbeat/run", {
    method: "POST",
    headers: { "X-Agent-Id": e }
  });
}
async function Ka(e) {
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
async function qa(e) {
  return (await se("/workspace/language", {
    headers: { "X-Agent-Id": e }
  })).language || "zh";
}
async function Va(e, t) {
  await se("/workspace/language", {
    method: "PUT",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify({ language: t })
  });
}
async function Ya() {
  return (await se("/config/user-timezone")).timezone || "UTC";
}
async function Qa(e) {
  await se("/config/user-timezone", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ timezone: e })
  });
}
async function Za(e) {
  return await se("/workspace/system-prompt-files", {
    headers: { "X-Agent-Id": e }
  }) || [];
}
const yn = ["AGENTS.md", "SOUL.md", "PROFILE.md"];
function En({
  items: e,
  max: t = 5,
  color: l = "blue",
  emptyText: n = "无"
}) {
  const a = x().React, { Tag: r } = x().antd;
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
function Un({
  open: e,
  onClose: t,
  poolSkills: l,
  installedSkillNames: n,
  loading: a,
  onInstall: r
}) {
  const s = x().React, { useState: o, useEffect: d, useMemo: c } = s, { Modal: u, Button: b, Empty: y, Spin: h, Input: k, Tag: z, Tooltip: C, Typography: B } = x().antd, { CheckOutlined: U, SearchOutlined: j } = x().antdIcons || {}, { Text: Y } = B, [G, N] = o([]), [J, R] = o("");
  d(() => {
    e && (N([]), R(""));
  }, [e]);
  const T = c(() => {
    if (!J.trim()) return l;
    const f = J.toLowerCase();
    return l.filter(
      (g) => {
        var P, $;
        return g.name.toLowerCase().includes(f) || ((P = g.description) == null ? void 0 : P.toLowerCase().includes(f)) || (($ = g.tags) == null ? void 0 : $.some((W) => W.toLowerCase().includes(f)));
      }
    );
  }, [l, J]), K = T.filter(
    (f) => !n.includes(f.name)
  ), Q = (f) => {
    N(
      (g) => g.includes(f) ? g.filter((P) => P !== f) : [...g, f]
    );
  }, S = async () => {
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
          s.createElement(b, { onClick: t }, "取消"),
          s.createElement(
            b,
            {
              type: "primary",
              onClick: S,
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
      s.createElement(k, {
        placeholder: "搜索技能名称、描述或标签...",
        prefix: j ? s.createElement(j) : void 0,
        value: J,
        onChange: (f) => R(f.target.value),
        allowClear: !0,
        style: { flex: 1 }
      }),
      s.createElement(
        b,
        {
          size: "small",
          type: "primary",
          onClick: () => N(K.map((f) => f.name))
        },
        "全选"
      ),
      s.createElement(
        b,
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
      s.createElement(h, { size: "large" })
    ) : T.length === 0 ? s.createElement(y, {
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
      ...T.map((f) => {
        const g = G.includes(f.name), P = n.includes(f.name);
        return s.createElement(
          "div",
          {
            key: f.name,
            onClick: () => !P && Q(f.name),
            style: {
              position: "relative",
              padding: "10px 12px",
              border: `1px solid ${g ? "#0072f5" : "#e8e8e8"}`,
              borderRadius: 6,
              cursor: P ? "not-allowed" : "pointer",
              transition: "all 0.15s ease",
              background: g ? "rgba(0, 114, 245, 0.06)" : P ? "#fafafa" : "#fff",
              opacity: P ? 0.5 : 1,
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
            U ? s.createElement(U) : "✓"
          ) : null,
          P ? s.createElement(
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
                paddingRight: P || g ? 24 : 0
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
              ($, W) => s.createElement(
                z,
                {
                  key: W,
                  color: "cyan",
                  style: { fontSize: 10, marginRight: 0 }
                },
                $
              )
            )
          ) : null
        );
      })
    )
  );
}
function Nn({
  agentId: e,
  systemPromptFiles: t,
  onRefresh: l
}) {
  const n = x().React, { useState: a, useEffect: r, useCallback: s, useRef: o } = n, {
    List: d,
    Tag: c,
    Switch: u,
    Button: b,
    Modal: y,
    Input: h,
    Spin: k,
    Empty: z,
    message: C,
    Typography: B,
    Segmented: U,
    Alert: j
  } = x().antd, { FileTextOutlined: Y, PlusOutlined: G, EditOutlined: N, ReloadOutlined: J } = x().antdIcons || {}, { Text: R } = B, [T, K] = a([]), [Q, S] = a(!0), [f, g] = a(
    t || []
  ), [P, $] = a(!1), [W, re] = a(null), [M, w] = a(""), [m, q] = a(""), [ie, A] = a(!1), [H, D] = a("source"), Z = o(0), X = s(async () => {
    const ne = ++Z.current;
    S(!0);
    try {
      const v = await Oa(e);
      ne === Z.current && K(v);
    } catch (v) {
      ne === Z.current && (C.error(v.message || "加载工作区文档失败"), K([]));
    } finally {
      ne === Z.current && S(!1);
    }
  }, [e]);
  r(() => {
    X();
  }, [X]), r(() => {
    g(t || []);
  }, [t]);
  const me = async (ne, v) => {
    const ue = new Set(f);
    if (v)
      ue.add(ne);
    else {
      if (yn.includes(ne) && ne === "AGENTS.md") {
        C.warning("AGENTS.md 是核心文件，不能停用");
        return;
      }
      ue.delete(ne);
    }
    const pe = Array.from(ue);
    g(pe);
    try {
      await La(e, pe), C.success(v ? "已启用记忆文件" : "已停用记忆文件"), l();
    } catch (we) {
      C.error(we.message || "更新失败"), g(t || []);
    }
  }, _ = async (ne) => {
    try {
      const v = await se(
        `/workspace/files/${encodeURIComponent(ne)}`,
        { headers: { "X-Agent-Id": e } }
      );
      re(ne), w(v.content || ""), D("source"), $(!0);
    } catch (v) {
      C.error(v.message || "读取文件失败");
    }
  }, te = () => {
    re(null), w(""), q(""), D("source"), $(!0);
  }, le = async () => {
    let ne;
    try {
      ne = Ma(W || m);
    } catch (v) {
      C.warning(v.message || "文件名无效");
      return;
    }
    if (!M.trim()) {
      C.warning("Markdown 文档不能为空");
      return;
    }
    if (new TextEncoder().encode(M).length > 1024 * 1024) {
      C.warning("Markdown 文档不能超过 1 MB");
      return;
    }
    A(!0);
    try {
      if (W)
        await yt(e, ne, M);
      else {
        const v = await $a(
          e,
          ne,
          M,
          !0
        );
        g(v.system_prompt_files);
      }
      C.success("保存成功"), $(!1), X(), l();
    } catch (v) {
      const ue = v != null && v.message ? `：${v.message}` : "";
      C.error(
        W ? (v == null ? void 0 : v.message) || "保存失败" : `创建并挂载失败，服务端已回滚文件${ue}`
      );
    } finally {
      A(!1);
    }
  };
  return Q ? n.createElement(
    "div",
    { style: { textAlign: "center", padding: 40 } },
    n.createElement(k, { size: "large" })
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
          R,
          { strong: !0 },
          `工作区文档 (${T.length})`
        ),
        n.createElement(
          R,
          { type: "secondary", style: { fontSize: 12 } },
          `· ${f.length} 个已挂载到系统提示`
        )
      ),
      n.createElement(
        "div",
        { style: { display: "flex", gap: 8 } },
        n.createElement(
          b,
          {
            size: "small",
            icon: J ? n.createElement(J) : void 0,
            onClick: X
          },
          "刷新"
        ),
        n.createElement(
          b,
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
    T.length === 0 ? n.createElement(z, {
      description: "暂无 Markdown 文档，点击「新建 Markdown 文档」添加",
      image: z.PRESENTED_IMAGE_SIMPLE
    }) : n.createElement(d, {
      dataSource: T,
      renderItem: (ne) => {
        const v = f.includes(ne.filename), ue = yn.includes(ne.filename);
        return n.createElement(
          d.Item,
          {
            actions: [
              n.createElement(
                b,
                {
                  type: "link",
                  size: "small",
                  icon: N ? n.createElement(N) : void 0,
                  onClick: () => _(ne.filename)
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
              n.createElement(R, null, ne.filename),
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
      y,
      {
        open: P,
        onCancel: () => $(!1),
        title: W ? `编辑 ${W}` : "新建 Markdown 文档",
        width: 700,
        onOk: le,
        confirmLoading: ie,
        okText: "保存"
      },
      W ? null : n.createElement(
        "div",
        { style: { marginBottom: 12 } },
        n.createElement(h, {
          placeholder: "文件名（如：油藏工程记忆库.md）",
          value: m,
          onChange: (ne) => q(ne.target.value),
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
        n.createElement(U, {
          size: "small",
          value: H,
          options: [
            { label: "源码", value: "source" },
            { label: "预览", value: "preview" }
          ],
          onChange: (ne) => D(ne)
        }),
        n.createElement(
          R,
          { type: "secondary", style: { fontSize: 12 } },
          `${M.length} 字符 · 约 ${Math.ceil(M.length / 4)} tokens · ${W && f.includes(W) ? "已挂载" : W ? "未挂载" : "保存后自动挂载"}`
        )
      ),
      M.trim() ? null : n.createElement(j, {
        type: "warning",
        showIcon: !0,
        message: "文档内容为空，保存前需要填写 Markdown 内容",
        style: { marginBottom: 10 }
      }),
      H === "source" ? n.createElement(h.TextArea, {
        value: M,
        onChange: (ne) => w(ne.target.value),
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
        vt(M, n)
      )
    )
  );
}
function el({
  skills: e,
  agentId: t
}) {
  const l = x().React, { useMemo: n } = l, {
    List: a,
    Tag: r,
    Typography: s,
    Empty: o,
    Button: d,
    message: c
  } = x().antd, { ThunderboltOutlined: u, CopyOutlined: b } = x().antdIcons || {}, { Text: y } = s, h = n(() => Rn(e), [e]), k = (C) => {
    try {
      const B = x();
      B.setSelectedAgent && B.setSelectedAgent(t);
    } catch {
    }
    try {
      sessionStorage.setItem("ugsci_pending_prompt", C.value);
    } catch {
    }
    window.history.pushState({}, "", "/chat"), window.dispatchEvent(new PopStateEvent("popstate"));
  }, z = (C) => {
    var B;
    (B = navigator.clipboard) == null || B.writeText(C.value).then(() => {
      c.success("已复制到剪贴板");
    });
  };
  return h.length === 0 ? l.createElement(o, {
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
        y,
        { strong: !0 },
        `推荐提问 (${h.length})`
      ),
      l.createElement(
        y,
        { type: "secondary", style: { fontSize: 12 } },
        "· 从技能描述中自动提取"
      )
    ),
    l.createElement(a, {
      dataSource: h,
      renderItem: (C, B) => l.createElement(
        a.Item,
        {
          actions: [
            l.createElement(
              d,
              {
                type: "link",
                size: "small",
                icon: b ? l.createElement(b) : void 0,
                onClick: () => z(C)
              },
              "复制"
            )
          ]
        },
        l.createElement(a.Item.Meta, {
          avatar: l.createElement(
            r,
            { color: "blue", style: { borderRadius: "50%" } },
            `${B + 1}`
          ),
          title: l.createElement(
            "div",
            {
              style: {
                cursor: "pointer",
                color: "#1677ff"
              },
              onClick: () => k(C)
            },
            C.value
          ),
          description: l.createElement(
            y,
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
}, Dn = { marginBottom: 16 }, Fn = {
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
}, Gn = {
  fontSize: 12,
  color: "rgba(0,0,0,0.45)",
  marginLeft: 8
};
function tl({ agentId: e }) {
  const t = x().React, { useState: l, useEffect: n, useCallback: a } = t, {
    Switch: r,
    InputNumber: s,
    Select: o,
    Button: d,
    Spin: c,
    Space: u,
    Typography: b,
    message: y
  } = x().antd, { PlayCircleOutlined: h, SaveOutlined: k } = x().antdIcons || {}, { Text: z } = b, [C, B] = l(!0), [U, j] = l(!1), [Y, G] = l(!1), [N, J] = l(!1), [R, T] = l(6), [K, Q] = l("h"), [S, f] = l("main"), [g, P] = l(300), [$, W] = l(!1), [re, M] = l("08:00"), [w, m] = l("22:00"), q = a(async () => {
    var X, me;
    B(!0);
    try {
      const _ = await Ha(e), te = Fa(_.every ?? "6h");
      J(_.enabled ?? !1), T(te.number), Q(te.unit), f(_.target ?? "main"), P(_.timeoutSeconds ?? 300), W(!!_.activeHours), M(((X = _.activeHours) == null ? void 0 : X.start) ?? "08:00"), m(((me = _.activeHours) == null ? void 0 : me.end) ?? "22:00");
    } catch (_) {
      y.error(_.message || "加载心跳配置失败");
    } finally {
      B(!1);
    }
  }, [e]);
  n(() => {
    q();
  }, [q]);
  const ie = async () => {
    j(!0);
    try {
      await Wa(e, {
        enabled: N,
        every: Ga({ number: R, unit: K }),
        target: S,
        timeoutSeconds: g,
        activeHours: $ && re && w ? { start: re, end: w } : void 0
      }), y.success("心跳配置已保存");
    } catch (X) {
      y.error(X.message || "保存心跳配置失败");
    } finally {
      j(!1);
    }
  }, A = async () => {
    G(!0);
    try {
      await Ja(e), y.success("已触发心跳检查");
    } catch (X) {
      y.error(X.message || "触发心跳失败");
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
  const H = (X, me, _) => t.createElement(
    "div",
    { style: Dn },
    t.createElement("div", { style: Ye }, X),
    me,
    _ ? t.createElement(
      z,
      { type: "secondary", style: Gn },
      _
    ) : null
  ), D = (X, me, _, te) => t.createElement(
    "div",
    { style: Fn },
    t.createElement(
      "div",
      null,
      t.createElement("div", { style: Ye }, X),
      me
    ),
    t.createElement(
      "div",
      null,
      t.createElement("div", { style: Ye }, _),
      te
    )
  ), { Divider: Z } = x().antd;
  return t.createElement(
    "div",
    { style: { paddingBottom: 8 } },
    // ── Section: 基本设置 ──
    t.createElement("div", { style: He }, "基本设置"),
    H(
      "启用心跳",
      t.createElement(r, {
        checked: N,
        onChange: (X) => J(X)
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
          value: R,
          onChange: (X) => T(X ?? 1),
          style: { width: "100%" }
        }),
        t.createElement(o, {
          value: K,
          onChange: (X) => Q(X),
          style: { width: 90 },
          options: [
            { value: "m", label: "分钟" },
            { value: "h", label: "小时" }
          ]
        })
      ),
      "心跳目标",
      t.createElement(o, {
        value: S,
        onChange: (X) => f(X),
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
        onChange: (X) => P(X ?? 300),
        style: { width: 200 }
      })
    ),
    // ── Section: 活跃时段 ──
    t.createElement(Z, { style: { margin: "8px 0 16px" } }),
    t.createElement("div", { style: He }, "活跃时段"),
    H(
      "启用活跃时段限制",
      t.createElement(r, {
        checked: $,
        onChange: (X) => W(X)
      }),
      "仅在指定时段内触发心跳"
    ),
    $ ? D(
      "开始时间",
      t.createElement("input", {
        type: "time",
        value: re,
        onChange: (X) => M(X.target.value),
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
        value: w,
        onChange: (X) => m(X.target.value),
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
          icon: k ? t.createElement(k) : void 0,
          loading: U,
          onClick: ie,
          style: Ae
        },
        "保存配置"
      ),
      t.createElement(
        d,
        {
          icon: h ? t.createElement(h) : void 0,
          loading: Y,
          onClick: A
        },
        "立即执行"
      )
    )
  );
}
function nl({
  agentId: e,
  onRefresh: t
}) {
  const l = x().React, { useState: n, useEffect: a, useCallback: r } = l, {
    List: s,
    Tag: o,
    Switch: d,
    Button: c,
    Empty: u,
    Spin: b,
    Typography: y,
    message: h
  } = x().antd, { PlusOutlined: k, ReloadOutlined: z, DeleteOutlined: C } = x().antdIcons || {}, { Text: B, Paragraph: U } = y, [j, Y] = n([]), [G, N] = n(!0), [J, R] = n(!1), [T, K] = n([]), [Q, S] = n(!1), f = r(async () => {
    N(!0);
    try {
      const M = await St(e);
      Y(M);
    } catch (M) {
      h.error(M.message || "加载技能失败"), Y([]);
    } finally {
      N(!1);
    }
  }, [e]);
  a(() => {
    f();
  }, [f]);
  const g = async () => {
    R(!0), S(!0);
    try {
      const M = await Lt(!0);
      K(M);
    } catch (M) {
      h.error(M.message || "加载技能池失败");
    } finally {
      S(!1);
    }
  }, P = async (M) => {
    let w = 0, m = 0;
    for (const q of M)
      try {
        await Bt(e, q), w++;
      } catch {
        m++;
      }
    w > 0 ? (h.success(
      `成功添加 ${w} 个技能${m > 0 ? `，${m} 个失败` : ""}`
    ), f(), t()) : m > 0 && h.error("添加技能失败"), R(!1);
  }, $ = async (M, w) => {
    try {
      w ? await Mn(e, M.name) : await jn(e, M.name), h.success(w ? "已启用" : "已停用"), f(), t();
    } catch (m) {
      h.error(m.message || "操作失败");
    }
  }, W = async (M) => {
    try {
      await jt(e, M), h.success(`技能「${M}」已移除`), f(), t();
    } catch (w) {
      h.error(w.message || "移除技能失败");
    }
  };
  if (G)
    return l.createElement(
      "div",
      { style: { textAlign: "center", padding: 40 } },
      l.createElement(b, { size: "large" })
    );
  const re = j.filter((M) => M.enabled !== !1);
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
        B,
        { strong: !0 },
        `技能列表 (${j.length}，已启用 ${re.length})`
      ),
      l.createElement(
        "div",
        { style: { display: "flex", gap: 8 } },
        l.createElement(
          c,
          {
            size: "small",
            icon: z ? l.createElement(z) : void 0,
            onClick: () => {
              rt(), f();
            }
          },
          "刷新"
        ),
        l.createElement(
          c,
          {
            type: "primary",
            size: "small",
            icon: k ? l.createElement(k) : void 0,
            onClick: g,
            style: Ae
          },
          "从技能池添加"
        )
      )
    ),
    j.length === 0 ? l.createElement(u, {
      description: "该专家暂无技能",
      image: u.PRESENTED_IMAGE_SIMPLE
    }) : l.createElement(s, {
      dataSource: j,
      renderItem: (M) => l.createElement(
        s.Item,
        {
          actions: [
            l.createElement(d, {
              key: "toggle",
              size: "small",
              checked: M.enabled !== !1,
              onChange: (w) => $(M, w)
            }),
            l.createElement(
              c,
              {
                key: "del",
                type: "link",
                size: "small",
                danger: !0,
                icon: C ? l.createElement(C) : void 0,
                onClick: () => W(M.name)
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
            l.createElement(B, { strong: !0 }, M.name),
            M.version_text ? l.createElement(
              o,
              { style: { fontSize: 10 } },
              `v${M.version_text}`
            ) : null
          ),
          M.description ? l.createElement(
            U,
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
    l.createElement(Un, {
      open: J,
      onClose: () => R(!1),
      poolSkills: T,
      installedSkillNames: j.map((M) => M.name),
      loading: Q,
      onInstall: P
    })
  );
}
function al({
  agentId: e,
  onRefresh: t,
  isActive: l
}) {
  const n = x().React, { useState: a, useEffect: r, useCallback: s } = n, {
    List: o,
    Tag: d,
    Button: c,
    Empty: u,
    Spin: b,
    Modal: y,
    Input: h,
    Typography: k,
    message: z
  } = x().antd, { PlusOutlined: C, ReloadOutlined: B, DeleteOutlined: U } = x().antdIcons || {}, { Text: j, Paragraph: Y } = k, { TextArea: G } = h, [N, J] = a([]), [R, T] = a(!0), [K, Q] = a(!1), [S, f] = a(`{
  "mcpServers": {
    "example-client": {
      "command": "npx",
      "args": ["-y", "@example/mcp-server"],
      "env": {}
    }
  }
}`), [g, P] = a(!1), $ = s(async () => {
    T(!0);
    try {
      const w = await Ut(e);
      J(w);
    } catch (w) {
      z.error(w.message || "加载 MCP 失败"), J([]);
    } finally {
      T(!1);
    }
  }, [e]);
  r(() => {
    $();
  }, [$]), r(() => {
    l && $();
  }, [l, $]);
  const W = async (w) => {
    try {
      await Na(e, w), z.success("已切换 MCP 状态"), $(), t();
    } catch (m) {
      z.error(m.message || "切换失败");
    }
  }, re = async (w) => {
    try {
      await Ln(e, w), z.success(`MCP「${w}」已移除`), $(), t();
    } catch (m) {
      z.error(m.message || "移除 MCP 失败");
    }
  }, M = async () => {
    P(!0);
    try {
      const w = JSON.parse(S), m = w.mcpServers || w, q = Object.entries(m);
      if (q.length === 0) {
        z.warning("未找到 MCP 客户端配置");
        return;
      }
      for (const [ie, A] of q) {
        const H = A, D = H.url ? "streamable_http" : "stdio";
        await Bn(e, {
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
      z.success("MCP 客户端已创建"), Q(!1), $(), t();
    } catch (w) {
      w instanceof SyntaxError ? z.error("JSON 格式错误：" + w.message) : z.error(w.message || "创建 MCP 失败");
    } finally {
      P(!1);
    }
  };
  return R ? n.createElement(
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
      n.createElement(j, { strong: !0 }, `MCP 客户端 (${N.length})`),
      n.createElement(
        "div",
        { style: { display: "flex", gap: 8 } },
        n.createElement(
          c,
          {
            size: "small",
            icon: B ? n.createElement(B) : void 0,
            onClick: () => {
              rt(), $();
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
      renderItem: (w) => n.createElement(
        o.Item,
        {
          actions: [
            n.createElement(
              c,
              {
                key: "toggle",
                size: "small",
                onClick: () => W(w.key)
              },
              w.enabled ? "停用" : "启用"
            ),
            n.createElement(
              c,
              {
                key: "del",
                type: "link",
                size: "small",
                danger: !0,
                icon: U ? n.createElement(U) : void 0,
                onClick: () => re(w.key)
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
            n.createElement(j, { strong: !0 }, w.name || w.key),
            n.createElement(
              d,
              {
                color: w.enabled ? "green" : "default",
                style: { fontSize: 10 }
              },
              w.enabled ? "启用" : "停用"
            ),
            n.createElement(
              d,
              { color: "purple", style: { fontSize: 10 } },
              w.transport
            )
          ),
          w.description ? n.createElement(
            Y,
            {
              type: "secondary",
              style: { fontSize: 12, margin: 0 },
              ellipsis: { rows: 2 }
            },
            w.description
          ) : null,
          w.tools && w.tools.length > 0 ? n.createElement(
            "div",
            { style: { marginTop: 4, fontSize: 11, color: "#8c8c8c" } },
            `提供 ${w.tools.length} 个工具`
          ) : null
        )
      )
    }),
    // Create MCP modal
    n.createElement(
      y,
      {
        open: K,
        title: "添加 MCP 客户端 (JSON)",
        onCancel: () => Q(!1),
        onOk: M,
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
        value: S,
        onChange: (w) => f(w.target.value),
        rows: 12,
        style: { fontFamily: "monospace", fontSize: 12 }
      })
    )
  );
}
function ll({ agentId: e }) {
  const t = x().React, { useState: l, useEffect: n, useCallback: a, useRef: r } = t, {
    Card: s,
    InputNumber: o,
    Input: d,
    Select: c,
    Switch: u,
    Button: b,
    Spin: y,
    Space: h,
    Typography: k,
    Divider: z,
    message: C
  } = x().antd, { SaveOutlined: B } = x().antdIcons || {}, { Text: U } = k, [j, Y] = l(!0), [G, N] = l(!1), J = r(null), [R, T] = l(60), [K, Q] = l(""), [S, f] = l(!0), [g, P] = l(30), [$, W] = l("zh"), [re, M] = l("UTC"), [w, m] = l(!0), [q, ie] = l(100), [A, H] = l(!0), [D, Z] = l(3), [X, me] = l(1), [_, te] = l(!0), [le, ne] = l(3), [v, ue] = l(2), [pe, we] = l(60), [Te, he] = l(1), [ee, F] = l(0), [E, ae] = l(1), [de, ge] = l(0), [L, p] = l(30), [ce, ye] = l(50), [be, xe] = l("light"), [Ie, Be] = l("scroll"), [_e, Re] = l("remelight"), [Me, Ue] = l("AUTO"), Ne = a(async () => {
    var V, ke, ze, Oe, Je, Ke;
    Y(!0);
    try {
      const [ve, st, xt] = await Promise.all([
        Ka(e),
        qa(e).catch(() => "zh"),
        Ya().catch(() => "UTC")
      ]);
      J.current = ve, T(ve.shell_command_timeout ?? 60), Q(ve.shell_command_executable ?? "");
      const Ze = ve.auto_title_config ?? { enabled: !0, timeout_seconds: 30 };
      f(Ze.enabled ?? !0), P(Ze.timeout_seconds ?? 30), W(st), M(xt);
      const Fe = ve.loop ?? {};
      m(((V = Fe.iteration) == null ? void 0 : V.enabled) ?? !0), ie(((ke = Fe.iteration) == null ? void 0 : ke.max_iterations) ?? ve.max_iters ?? 100), H(((ze = Fe.doom_loop) == null ? void 0 : ze.enabled) ?? !0), Z(((Oe = Fe.doom_loop) == null ? void 0 : Oe.window_size) ?? 3), me(((Je = Fe.doom_loop) == null ? void 0 : Je.similarity_threshold) ?? 1), te(ve.llm_retry_enabled ?? !0), ne(ve.llm_max_retries ?? 3), ue(ve.llm_backoff_base ?? 2), we(ve.llm_backoff_cap ?? 60), he(ve.llm_max_concurrent ?? 1), F(ve.llm_max_qpm ?? 0), ae(ve.llm_rate_limit_pause ?? 1), ge(ve.llm_rate_limit_jitter ?? 0), p(ve.llm_acquire_timeout ?? 30), ye(ve.history_max_length ?? 50), xe(ve.context_manager_backend ?? "light"), Be(((Ke = ve.light_context_config) == null ? void 0 : Ke.strategy) ?? "scroll"), Re(ve.memory_manager_backend ?? "remelight"), Ue(ve.approval_level ?? "AUTO");
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
          max_iters: q,
          loop: {
            ...V.loop ?? {},
            iteration: { enabled: w, max_iterations: q },
            doom_loop: {
              enabled: A,
              window_size: D,
              similarity_threshold: X,
              stages: ((ze = (ke = V.loop) == null ? void 0 : ke.doom_loop) == null ? void 0 : ze.stages) ?? []
            }
          },
          shell_command_timeout: R,
          shell_command_executable: K,
          auto_title_config: {
            enabled: S,
            timeout_seconds: g
          },
          llm_retry_enabled: _,
          llm_max_retries: le,
          llm_backoff_base: v,
          llm_backoff_cap: pe,
          llm_max_concurrent: Te,
          llm_max_qpm: ee,
          llm_rate_limit_pause: E,
          llm_rate_limit_jitter: de,
          llm_acquire_timeout: L,
          history_max_length: ce,
          context_manager_backend: be,
          light_context_config: {
            ...V.light_context_config ?? {},
            strategy: Ie
          },
          memory_manager_backend: _e,
          approval_level: Me
        };
        await Xa(e, Oe), J.current = Oe, $ && await Va(e, $).catch(() => {
        }), re && await Qa(re).catch(() => {
        }), C.success("运行配置已保存");
      } catch (Oe) {
        C.error(Oe.message || "保存运行配置失败");
      } finally {
        N(!1);
      }
    }
  };
  if (j)
    return t.createElement(
      "div",
      { style: { textAlign: "center", padding: 40 } },
      t.createElement(y, { size: "large" })
    );
  const Se = (V, ke, ze) => t.createElement(
    "div",
    { style: Dn },
    t.createElement("div", { style: Ye }, V),
    ke,
    ze ? t.createElement(
      U,
      { type: "secondary", style: Gn },
      ze
    ) : null
  ), Pe = (V, ke, ze, Oe) => t.createElement(
    "div",
    { style: Fn },
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
        value: R,
        onChange: (V) => T(V ?? 60),
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
        value: $,
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
        onChange: (V) => M(V),
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
      t.createElement(h, null, t.createElement(u, {
        checked: S,
        onChange: (V) => f(V)
      })),
      "标题生成超时 (秒)",
      t.createElement(o, {
        min: 5,
        value: g,
        onChange: (V) => P(V ?? 30),
        style: { width: "100%" },
        disabled: !S
      })
    ),
    // ── Section: 审批级别 ──
    t.createElement(z, { style: { margin: "8px 0 16px" } }),
    t.createElement("div", { style: He }, "审批级别"),
    Se(
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
    t.createElement(z, { style: { margin: "8px 0 16px" } }),
    t.createElement("div", { style: He }, "迭代与循环"),
    Se(
      "启用迭代限制",
      t.createElement(u, {
        checked: w,
        onChange: (V) => m(V)
      }),
      "停止 Agent 前的最大循环轮次"
    ),
    w ? Se(
      "最大迭代次数",
      t.createElement(o, {
        min: 1,
        max: 500,
        value: q,
        onChange: (V) => ie(V ?? 100),
        style: { width: "100%" }
      })
    ) : null,
    Se(
      "启用重复循环保护",
      t.createElement(u, {
        checked: A,
        onChange: (V) => H(V)
      }),
      "检测并阻止重复操作循环"
    ),
    A ? Pe(
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
        value: X,
        onChange: (V) => me(V ?? 1),
        style: { width: "100%" }
      })
    ) : null,
    // ── Section: LLM 重试 ──
    t.createElement(z, { style: { margin: "8px 0 16px" } }),
    t.createElement("div", { style: He }, "LLM 重试"),
    Se(
      "启用 LLM 重试",
      t.createElement(u, {
        checked: _,
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
        disabled: !_
      }),
      "退避基数 (秒)",
      t.createElement(o, {
        min: 0.1,
        step: 0.1,
        value: v,
        onChange: (V) => ue(V ?? 2),
        style: { width: "100%" },
        disabled: !_
      })
    ),
    Se(
      "退避上限 (秒)",
      t.createElement(o, {
        min: 0.5,
        step: 0.5,
        value: pe,
        onChange: (V) => we(V ?? 60),
        style: { width: 200 },
        disabled: !_
      })
    ),
    // ── Section: LLM 限流 ──
    t.createElement(z, { style: { margin: "8px 0 16px" } }),
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
        value: E,
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
    Se(
      "获取超时 (秒)",
      t.createElement(o, {
        min: 10,
        step: 10,
        value: L,
        onChange: (V) => p(V ?? 30),
        style: { width: 200 }
      }),
      "应大于 限流暂停 + 抖动"
    ),
    // ── Section: 上下文与记忆 ──
    t.createElement(z, { style: { margin: "8px 0 16px" } }),
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
        b,
        {
          type: "primary",
          icon: B ? t.createElement(B) : void 0,
          loading: G,
          onClick: De,
          style: Ae
        },
        "保存运行配置"
      )
    )
  );
}
function rl({
  expert: e,
  open: t,
  onClose: l,
  onRefresh: n
}) {
  const a = x().React, { useState: r, useEffect: s, useCallback: o } = a, { Modal: d, Tabs: c, Spin: u, Typography: b } = x().antd, { SettingOutlined: y } = x().antdIcons || {}, { Text: h } = b, [k, z] = r([]), [C, B] = r(!1), [U, j] = r("heartbeat"), Y = o(async () => {
    if (e) {
      B(!0);
      try {
        const R = await Za(e.agent.id);
        z(R);
      } catch {
        z([]);
      } finally {
        B(!1);
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
      children: a.createElement(tl, {
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
      ) : a.createElement(Nn, {
        agentId: G.id,
        systemPromptFiles: k,
        onRefresh: N
      })
    },
    {
      key: "skills",
      label: `技能 (${e.skills.filter((R) => R.enabled !== !1).length})`,
      children: a.createElement(nl, {
        agentId: G.id,
        onRefresh: n
      })
    },
    {
      key: "mcp",
      label: `MCP (${e.mcps.length})`,
      children: a.createElement(al, {
        agentId: G.id,
        onRefresh: n,
        isActive: U === "mcp"
      })
    },
    {
      key: "running",
      label: "运行配置",
      children: a.createElement(ll, {
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
        y ? a.createElement(y, { style: { fontSize: 18 } }) : null,
        a.createElement("span", null, `配置 - ${G.name}`),
        a.createElement(
          h,
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
      activeKey: U,
      onChange: (R) => j(R),
      size: "small",
      tabBarStyle: { marginBottom: 16 }
    })
  );
}
const sl = [
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
], ol = sl;
function hn(e) {
  return ht(`/ugsci/avatar/${encodeURIComponent(e)}`);
}
function vn(e) {
  const t = e.map(encodeURIComponent).join(",");
  return ht(`/ugsci/avatar/team/${t}`);
}
function Le({
  name: e,
  size: t = 32,
  borderRadius: l = "50%"
}) {
  const n = x().React, [a, r] = n.useState(0), s = a === 0 ? hn(e) : `${hn(e)}?_r=${a}`;
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
function Nt({
  members: e,
  size: t = 32,
  borderRadius: l = "50%"
}) {
  const n = x().React, [a, r] = n.useState(0);
  if (!e || e.length === 0)
    return n.createElement("span", {
      style: {
        width: t,
        height: t,
        display: "inline-block"
      }
    });
  const s = e.slice(0, 5), o = a === 0 ? vn(s) : `${vn(s)}?_r=${a}`;
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
function il({
  expert: e,
  onClick: t,
  onSummon: l,
  onConfigure: n
}) {
  const a = x().React, { Card: r, Tag: s, Badge: o, Typography: d, Spin: c, Button: u, Tooltip: b } = x().antd, { Text: y } = d, { ThunderboltOutlined: h, SettingOutlined: k } = x().antdIcons || {}, { agent: z, skills: C, mcps: B, loading: U } = e, j = z.enabled, Y = C.filter((J) => J.enabled !== !1).map((J) => J.name), G = B.map((J) => J.name || J.key), N = z.active_model ? `${z.active_model.provider_id}/${z.active_model.model}` : null;
  return a.createElement(
    r,
    {
      hoverable: !0,
      onClick: t,
      size: "small",
      style: {
        cursor: "pointer",
        transition: "all 0.2s ease",
        borderColor: j ? void 0 : "#d9d9d9",
        opacity: j ? 1 : 0.7,
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
        a.createElement(Le, { name: z.name, size: 36 }),
        a.createElement(
          "div",
          null,
          a.createElement(
            y,
            { strong: !0, style: { fontSize: 15 } },
            z.name
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
            z.id
          )
        )
      ),
      a.createElement(o, {
        status: j ? "success" : "default",
        text: j ? "启用" : "停用"
      })
    ),
    // Description (rendered as markdown)
    z.description ? a.createElement(
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
      vt(z.description, a)
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
    U ? a.createElement(c, { size: "small" }) : a.createElement(
      "div",
      { style: { marginBottom: 6 } },
      a.createElement(
        "div",
        { style: { fontSize: 11, color: "#8c8c8c", marginBottom: 4 } },
        `技能 (${Y.length})`
      ),
      a.createElement(En, {
        items: Y,
        max: 4,
        color: "cyan",
        emptyText: "未配置技能"
      })
    ),
    // MCP
    !U && G.length > 0 ? a.createElement(
      "div",
      { style: { marginTop: "auto" } },
      a.createElement(
        "div",
        { style: { fontSize: 11, color: "#8c8c8c", marginBottom: 4 } },
        `MCP (${G.length})`
      ),
      a.createElement(En, {
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
        b,
        { title: "配置专家", placement: "top" },
        a.createElement(
          u,
          {
            type: "text",
            size: "small",
            icon: k ? a.createElement(k, {
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
          icon: h ? a.createElement(h) : void 0,
          disabled: !j,
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
function cl({
  expert: e,
  open: t,
  onClose: l,
  onRefresh: n
}) {
  const a = x().React, {
    Drawer: r,
    Descriptions: s,
    Tag: o,
    Typography: d,
    Space: c,
    Button: u,
    Empty: b,
    Tabs: y,
    List: h,
    Spin: k,
    Modal: z,
    message: C
  } = x().antd, { Text: B, Paragraph: U } = d, {
    EditOutlined: j,
    ThunderboltOutlined: Y,
    FileTextOutlined: G,
    ToolOutlined: N,
    PlusOutlined: J
  } = x().antdIcons || {}, [R, T] = a.useState(!1), [K, Q] = a.useState(
    []
  ), [S, f] = a.useState(!1);
  if (!e) return null;
  const { agent: g, config: P, skills: $, mcps: W, loading: re } = e, M = $.filter((_) => _.enabled !== !1), w = (_) => {
    window.history.pushState({}, "", _), window.dispatchEvent(new PopStateEvent("popstate"));
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
        g.description ? vt(g.description, a) : "暂无描述"
      ),
      a.createElement(
        s.Item,
        { label: "使用模型" },
        g.active_model ? `${g.active_model.provider_id} / ${g.active_model.model}` : "使用全局默认模型"
      ),
      P != null && P.workspace_dir ? a.createElement(
        s.Item,
        { label: "工作区路径" },
        a.createElement(
          "code",
          { style: { fontSize: 11 } },
          P.workspace_dir
        )
      ) : null,
      P != null && P.approval_level ? a.createElement(
        s.Item,
        { label: "审批级别" },
        P.approval_level
      ) : null
    ),
    // System prompt files
    P != null && P.system_prompt_files && P.system_prompt_files.length > 0 ? a.createElement(
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
        a.createElement(B, { strong: !0 }, "系统提示词文件")
      ),
      a.createElement(
        c,
        { wrap: !0 },
        ...P.system_prompt_files.map(
          (_, te) => a.createElement(
            o,
            {
              key: te,
              icon: G ? a.createElement(G) : void 0,
              style: { fontSize: 12 }
            },
            _
          )
        )
      )
    ) : null
  ), q = async () => {
    T(!0), f(!0);
    try {
      const _ = await Lt(!0);
      Q(_);
    } catch (_) {
      C.error(_.message || "加载技能池失败");
    } finally {
      f(!1);
    }
  }, ie = async (_) => {
    let te = 0, le = 0;
    for (const ne of _)
      try {
        await Bt(g.id, ne), te++;
      } catch {
        le++;
      }
    te > 0 ? (C.success(
      `成功添加 ${te} 个技能${le > 0 ? `，${le} 个失败` : ""}`
    ), n()) : le > 0 && C.error("添加技能失败"), T(!1);
  }, A = async (_) => {
    try {
      await jt(g.id, _), C.success(`技能「${_}」已移除`), n();
    } catch (te) {
      C.error(te.message || "移除技能失败");
    }
  }, H = async (_) => {
    try {
      await Ln(g.id, _), C.success(`MCP「${_}」已移除`), n();
    } catch (te) {
      C.error(te.message || "移除 MCP 失败");
    }
  }, D = re ? a.createElement(
    "div",
    { style: { textAlign: "center", padding: 40 } },
    a.createElement(k, { size: "large" })
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
        B,
        { strong: !0 },
        `已启用技能 (${M.length})`
      ),
      a.createElement(
        u,
        {
          type: "primary",
          size: "small",
          icon: J ? a.createElement(J) : void 0,
          onClick: q
        },
        "从技能池添加"
      )
    ),
    M.length === 0 ? a.createElement(b, {
      description: "该专家暂无已启用的技能",
      image: b.PRESENTED_IMAGE_SIMPLE
    }) : a.createElement(h, {
      dataSource: M,
      renderItem: (_) => a.createElement(
        h.Item,
        {
          actions: [
            a.createElement(
              u,
              {
                type: "link",
                size: "small",
                danger: !0,
                onClick: () => A(_.name)
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
            _.emoji ? a.createElement(
              "span",
              { style: { fontSize: 16 } },
              _.emoji
            ) : null,
            a.createElement(B, { strong: !0 }, _.name),
            _.version_text ? a.createElement(
              o,
              { style: { fontSize: 10 } },
              `v${_.version_text}`
            ) : null
          ),
          _.description ? a.createElement(
            U,
            {
              type: "secondary",
              style: { fontSize: 12, margin: 0 },
              ellipsis: { rows: 2 }
            },
            _.description
          ) : null,
          _.tags && _.tags.length > 0 ? a.createElement(
            "div",
            { style: { marginTop: 4 } },
            ..._.tags.map(
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
    a.createElement(Un, {
      open: R,
      onClose: () => T(!1),
      poolSkills: K,
      installedSkillNames: M.map((_) => _.name),
      loading: S,
      onInstall: ie
    })
  ), Z = re ? a.createElement(
    "div",
    { style: { textAlign: "center", padding: 40 } },
    a.createElement(k, { size: "large" })
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
        B,
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
    W.length === 0 ? a.createElement(b, {
      description: "该专家暂无关联的 MCP 客户端，点击「配置 MCP」添加",
      image: b.PRESENTED_IMAGE_SIMPLE
    }) : a.createElement(h, {
      dataSource: W,
      renderItem: (_) => a.createElement(
        h.Item,
        {
          actions: [
            a.createElement(
              u,
              {
                type: "link",
                size: "small",
                danger: !0,
                onClick: () => H(_.key)
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
              B,
              { strong: !0 },
              _.name || _.key
            ),
            a.createElement(
              o,
              {
                color: _.enabled ? "green" : "default",
                style: { fontSize: 10 }
              },
              _.enabled ? "启用" : "停用"
            ),
            a.createElement(
              o,
              { color: "purple", style: { fontSize: 10 } },
              _.transport
            )
          ),
          _.description ? a.createElement(
            U,
            {
              type: "secondary",
              style: { fontSize: 12, margin: 0 },
              ellipsis: { rows: 2 }
            },
            _.description
          ) : null,
          _.tools && _.tools.length > 0 ? a.createElement(
            "div",
            {
              style: {
                marginTop: 4,
                fontSize: 11,
                color: "#8c8c8c"
              }
            },
            `提供 ${_.tools.length} 个工具`
          ) : null
        )
      )
    })
  ), X = P != null && P.tools ? a.createElement(
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
        a.createElement(B, { strong: !0 }, "工具配置")
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
        JSON.stringify(P.tools, null, 2)
      )
    )
  ) : a.createElement(b, {
    description: "暂无工具配置",
    image: b.PRESENTED_IMAGE_SIMPLE
  }), me = [
    { key: "basic", label: "基本信息", children: m },
    {
      key: "skills",
      label: `技能 (${M.length})`,
      children: D
    },
    {
      key: "prompts",
      label: "推荐提问",
      children: a.createElement(el, {
        skills: M,
        agentId: g.id
      })
    },
    {
      key: "knowledge",
      label: "专家记忆",
      children: a.createElement(Nn, {
        agentId: g.id,
        systemPromptFiles: (P == null ? void 0 : P.system_prompt_files) || [],
        onRefresh: () => n()
      })
    },
    { key: "mcp", label: `MCP (${W.length})`, children: Z },
    { key: "tools", label: "工具配置", children: X }
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
            icon: j ? a.createElement(j) : void 0,
            onClick: () => {
              l();
              try {
                const _ = x();
                _.setSelectedAgent && _.setSelectedAgent(g.id);
              } catch (_) {
                console.warn("[ugsci] Failed to set selected agent:", _);
              }
              setTimeout(() => w("/agents"), 0);
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
                const _ = x();
                _.setSelectedAgent && _.setSelectedAgent(g.id);
              } catch (_) {
                console.warn("[ugsci] Failed to set selected agent:", _);
              }
              setTimeout(() => w("/chat"), 0);
            }
          },
          "开始对话"
        )
      )
    },
    a.createElement(y, {
      items: me,
      defaultActiveKey: "basic"
    })
  );
}
function dl({
  open: e,
  onClose: t,
  onCreated: l
}) {
  const n = x().React, { useState: a } = n, {
    Modal: r,
    Card: s,
    Tag: o,
    Input: d,
    Row: c,
    Col: u,
    Spin: b,
    message: y,
    Typography: h
  } = x().antd, { Text: k } = h, { FileAddOutlined: z } = x().antdIcons || {}, [C, B] = a(!1), [U, j] = a(""), [Y, G] = a(!1), N = async (T, K) => {
    B(!0);
    try {
      const Q = await se("/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: T || "新专家",
          description: K || "",
          skill_names: []
        })
      });
      await yt(
        Q.id,
        "AGENTS.md",
        `# ${T || "新专家"}

请在此处编写该专家的系统提示词。
`
      ), y.success("专家「" + (T || "新专家") + "」创建成功"), G(!1), setTimeout(() => {
        t(), l();
      }, 0);
    } catch (Q) {
      y.error(Q.message || "创建专家失败");
    } finally {
      B(!1);
    }
  }, J = ol.filter((T) => {
    if (!U.trim()) return !0;
    const K = U.toLowerCase();
    return T.name.toLowerCase().includes(K) || T.description.toLowerCase().includes(K) || T.category.toLowerCase().includes(K);
  }), R = async (T) => {
    B(!0);
    try {
      const K = await se("/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: T.name,
          description: T.description,
          skill_names: T.recommended_skills
        })
      });
      await yt(K.id, "AGENTS.md", T.system_prompt);
      const Q = await Mt(K.id);
      Q.approval_level = T.approval_level, await se(`/agents/${encodeURIComponent(K.id)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Q)
      }), y.success(`专家「${T.name}」创建成功`), t(), l();
    } catch (K) {
      y.error(K.message || "创建专家失败");
    } finally {
      B(!1);
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
          value: U,
          onChange: (T) => j(T.target.value),
          allowClear: !0
        })
      ),
      C ? n.createElement(
        "div",
        { style: { textAlign: "center", padding: 60 } },
        n.createElement(b, { size: "large" }),
        n.createElement(
          "div",
          { style: { marginTop: 12, color: "#8c8c8c" } },
          "正在创建专家..."
        )
      ) : n.createElement(
        c,
        { gutter: [12, 12] },
        // ── Blank template card (always first) ──
        U.trim() ? null : n.createElement(
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
                z ? n.createElement(z) : "📝"
              ),
              n.createElement(
                "div",
                { style: { flex: 1 } },
                n.createElement(
                  k,
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
          (T) => n.createElement(
            u,
            { key: T.id, xs: 24, sm: 12 },
            n.createElement(
              s,
              {
                hoverable: !0,
                size: "small",
                onClick: () => R(T),
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
                  name: T.name,
                  size: 40
                }),
                n.createElement(
                  "div",
                  { style: { flex: 1 } },
                  n.createElement(
                    k,
                    { strong: !0, style: { fontSize: 15 } },
                    T.name
                  ),
                  n.createElement(
                    "div",
                    null,
                    n.createElement(
                      o,
                      { color: "blue", style: { fontSize: 10 } },
                      T.category
                    ),
                    T.approval_level === "MANUAL" ? n.createElement(
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
                vt(T.description, n)
              )
            )
          )
        )
      )
    ),
    // ── Blank template creation modal (sibling, not nested inside Modal) ──
    n.createElement(ml, {
      open: Y,
      onCancel: () => G(!1),
      onCreate: N
    })
  );
}
function ml({
  open: e,
  onCancel: t,
  onCreate: l
}) {
  const n = x().React, { useState: a, useEffect: r } = n, { Modal: s, Input: o, message: d } = x().antd, [c, u] = a(""), [b, y] = a(""), [h, k] = a(!1);
  return r(() => {
    e && (u(""), y(""), k(!1));
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
        k(!0), Promise.resolve(l(c.trim(), b.trim())).finally(() => {
          k(!1);
        });
      },
      okText: "创建",
      cancelText: "取消",
      okButtonProps: { loading: h },
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
        onChange: (z) => u(z.target.value),
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
        value: b,
        onChange: (z) => y(z.target.value),
        rows: 3,
        maxLength: 200
      })
    )
  );
}
const Hn = "ugsci_custom_teams";
function ul(e) {
  if (!e || typeof e != "object") return !1;
  const t = e;
  return typeof t.id == "string" && typeof t.name == "string" && typeof t.taskTemplate == "string" && typeof t.orchestrationPrompt == "string" && Array.isArray(t.members);
}
function at() {
  try {
    const e = JSON.parse(
      localStorage.getItem(Hn) || "[]"
    );
    return Array.isArray(e) ? e.filter(ul) : [];
  } catch {
    return [];
  }
}
function Dt(e) {
  try {
    localStorage.setItem(Hn, JSON.stringify(e));
  } catch {
  }
}
function pl(e) {
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
function gl(e) {
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
async function At(e = !0) {
  const t = await je("/ugsci/team/custom");
  if (!t.ok) {
    const a = await t.text().catch(() => "");
    throw new Error(a || `HTTP ${t.status}`);
  }
  const n = (await t.json()).map(gl);
  return e && Dt(n), n;
}
async function Wn(e) {
  const t = await je("/ugsci/team/custom", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(pl(e))
  });
  if (!t.ok) {
    const n = await t.text().catch(() => "");
    throw new Error(n || `HTTP ${t.status}`);
  }
  const l = await t.json();
  return { ...e, id: l.team_id };
}
async function fl(e) {
  const t = await je(
    `/ugsci/team/custom/${encodeURIComponent(e)}`,
    { method: "DELETE" }
  );
  if (!t.ok && t.status !== 404) {
    const l = await t.text().catch(() => "");
    throw new Error(l || `HTTP ${t.status}`);
  }
}
async function yl() {
  const e = at();
  if (e.length === 0) return;
  const t = await At(!1), l = new Set(t.map((n) => n.id));
  await Promise.all(
    e.filter((n) => !l.has(n.id)).map((n) => Wn(n))
  );
}
async function El(e) {
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
          const b = u.slice(6);
          let y;
          try {
            y = JSON.parse(b);
          } catch {
            continue;
          }
          if (y.error) {
            const h = y.error, k = typeof h == "string" ? h : (h == null ? void 0 : h.message) || "工作流启动失败";
            throw new Error(k);
          }
          if (y.object === "response" || y.type === "response") {
            const h = y.status;
            if (h === "failed" || h === "error") {
              const k = ((r = y.error) == null ? void 0 : r.message) || "工作流启动失败";
              throw new Error(k);
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
async function hl(e, t, l) {
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
  return await El(o), s;
}
function Jn(e, t) {
  var a;
  const l = t.replace(/\s+/g, ""), n = e.find(
    (r) => r.name === t || r.name.replace(/\s+/g, "") === l
  );
  return n ? n.id : ((a = e.find(
    (r) => r.name.includes(t) || t.includes(r.name) || r.name.replace(/\s+/g, "").includes(l)
  )) == null ? void 0 : a.id) || null;
}
function Kn() {
  var t;
  const e = (t = window.QwenPaw) == null ? void 0 : t.host;
  if (!e) throw new Error("[ugsci] QwenPaw.host not available");
  return e;
}
async function Ft(e, t, l) {
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
function vl(e, t) {
  return Ft("/ugsci/team/state", e, t);
}
async function bl(e, t) {
  const l = await je("/ugsci/team/runs", {
    headers: { "X-Agent-Id": e },
    signal: t
  });
  if (!l.ok)
    throw new Error(`Failed to load team runs: ${l.status}`);
  return await l.json();
}
function bn({ activeOnly: e = !1 }) {
  const t = Kn(), l = t.React, { useCallback: n, useEffect: a, useRef: r, useState: s } = l, { Alert: o, Button: d, Card: c, Empty: u, Spin: b, Tag: y, Typography: h } = t.antd, { Text: k, Paragraph: z } = h, C = t.useSelectedAgent ? t.useSelectedAgent() : { id: "default" }, B = (C == null ? void 0 : C.id) || "default", [U, j] = s([]), [Y, G] = s(!0), [N, J] = s(!1), R = r(null), T = r(0), K = n(async () => {
    var g;
    (g = R.current) == null || g.abort();
    const S = new AbortController();
    R.current = S;
    const f = ++T.current;
    G(!0);
    try {
      const P = await bl(B, S.signal);
      if (S.signal.aborted || f !== T.current) return;
      j(P), J(!1);
    } catch {
      if (S.signal.aborted || f !== T.current) return;
      J(!0);
    } finally {
      !S.signal.aborted && f === T.current && G(!1);
    }
  }, [B]);
  if (a(() => (K(), () => {
    var S;
    (S = R.current) == null || S.abort(), T.current += 1;
  }), [K]), Y) return l.createElement(b);
  if (N)
    return l.createElement(o, {
      type: "warning",
      message: "讨论运行记录加载失败",
      action: l.createElement(d, { size: "small", onClick: () => void K() }, "重试")
    });
  const Q = U.filter(
    (S) => e ? S.status === "active" : S.status !== "active"
  );
  return Q.length === 0 ? l.createElement(u, {
    description: e ? "暂无进行中的专家团讨论" : "暂无历史讨论"
  }) : l.createElement(
    "div",
    { style: { display: "flex", flexDirection: "column", gap: 8 } },
    ...Q.map(
      (S) => l.createElement(
        c,
        { key: S.instance_id, size: "small" },
        l.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 8 } },
          l.createElement(k, { strong: !0 }, S.team_name || S.team_id),
          l.createElement(y, { color: S.status === "completed" ? "green" : S.status === "terminated" ? "orange" : "blue" }, S.status),
          l.createElement(y, null, S.current_phase),
          l.createElement(k, { type: "secondary" }, `迭代 ${S.iteration}`)
        ),
        l.createElement(z, { ellipsis: { rows: 2 }, style: { margin: "8px 0 0" } }, S.task || "暂无任务描述")
      )
    )
  );
}
async function wl() {
  const e = await Ft(
    "/ugsci/team/preset-teams"
  );
  return (e == null ? void 0 : e.teams) ?? null;
}
async function Sl() {
  const e = await Ft(
    "/ugsci/team/roles"
  );
  return (e == null ? void 0 : e.roles) ?? null;
}
const xl = {
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
], kl = 3;
function Cl() {
  const e = Kn(), t = e.React, { useState: l, useEffect: n, useCallback: a, useRef: r } = t, { Card: s, Tag: o, Typography: d, Button: c, Steps: u, Empty: b, Alert: y } = e.antd, { ReloadOutlined: h } = e.antdIcons || {}, { Text: k, Paragraph: z } = d, C = e.useSelectedAgent ? e.useSelectedAgent() : { id: "default" }, B = (C == null ? void 0 : C.id) || "default", [U, j] = l(null), [Y, G] = l(!1), N = r(null), J = r(0), R = r(0), T = r(null), K = a(
    async (m) => {
      var H;
      (H = T.current) == null || H.abort();
      const q = new AbortController();
      T.current = q;
      const ie = ++R.current;
      m && G(!0);
      const A = await vl(B, q.signal);
      q.signal.aborted || ie !== R.current || (A ? (J.current = 0, N.current = A, j(A)) : J.current += 1, G(!1));
    },
    [B]
  ), Q = a(() => K(!0), [K]);
  if (n(() => {
    var q;
    (q = T.current) == null || q.abort(), R.current += 1, J.current = 0, N.current = null, j(null), Q();
    const m = window.setInterval(() => {
      var ie, A;
      J.current >= kl || ((ie = N.current) == null ? void 0 : ie.status) === "completed" || ((A = N.current) == null ? void 0 : A.status) === "terminated" || K(!1);
    }, 5e3);
    return () => {
      var ie;
      window.clearInterval(m), (ie = T.current) == null || ie.abort(), R.current += 1;
    };
  }, [B, K, Q]), (U == null ? void 0 : U.status) === "unreadable")
    return t.createElement(y, {
      type: "warning",
      showIcon: !0,
      message: "专家团状态暂时无法读取",
      description: `实例 ${U.instance_id || "未知"} 的状态文件需要检查。`,
      style: { marginBottom: 16 },
      action: t.createElement(
        c,
        { size: "small", onClick: Q, loading: Y },
        "重试"
      )
    });
  if (!U || !U.active) {
    if ((U == null ? void 0 : U.status) === "completed" || (U == null ? void 0 : U.status) === "terminated") {
      const m = U.status === "completed";
      return t.createElement(y, {
        type: m ? "success" : "info",
        showIcon: !0,
        message: m ? "专家团工作流已完成" : "专家团工作流已终止",
        description: m ? `实例 ${U.instance_id || "未知"} 已完成，结果文件保留在工作区。` : `原因：${U.state.termination_reason || "未知"}`,
        style: { marginBottom: 16 }
      });
    }
    return t.createElement(b, {
      description: "暂无活跃的专家团工作流",
      style: { padding: 24 }
    });
  }
  const S = U.state, f = S.current_phase || "plan", g = wn.indexOf(f), P = S.team_name || "未知团队", $ = S.team_mode || "pipeline", W = S.iteration || 0, re = S.members || [], M = S.verify_retries || 0, w = {
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
        t.createElement(k, { strong: !0 }, `${P} — 工作流状态`),
        t.createElement(
          o,
          { color: "blue", style: { fontSize: 10 } },
          w[$] || $
        ),
        t.createElement(
          o,
          { style: { fontSize: 10 } },
          `迭代 ${W}`
        ),
        M > 0 ? t.createElement(
          o,
          { color: "orange", style: { fontSize: 10 } },
          `验证重试 ${M}`
        ) : null
      ),
      extra: t.createElement(
        c,
        {
          size: "small",
          type: "text",
          icon: h ? t.createElement(h) : void 0,
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
        const q = xl[m];
        return {
          title: `${q.icon} ${q.label}`,
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
        (m, q) => t.createElement(
          o,
          { key: `${m.name}-${q}`, style: { fontSize: 11 } },
          `${m.emoji || ""} ${m.name}（${m.role}）`
        )
      )
    ),
    S.task ? t.createElement(
      z,
      {
        style: {
          fontSize: 12,
          marginTop: 8,
          marginBottom: 0,
          color: "#666"
        },
        ellipsis: { rows: 2 }
      },
      `任务: ${S.task}`
    ) : null
  );
}
function Tl({ team: e }) {
  const t = x().React, { Typography: l, Tag: n } = x().antd, { Text: a } = l, r = {
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
      ...o.length > 0 ? o.map((u, b) => [
        b > 0 && !d ? t.createElement(
          "div",
          {
            key: `arrow-${b}`,
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
            key: `step-${b}`,
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
      ]).flat() : e.members.map((u, b) => [
        b > 0 && !d ? t.createElement(
          "div",
          {
            key: `arrow-${b}`,
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
            key: `member-${b}`,
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
function mt(e) {
  const t = e.replace(/\s+/g, "").toLowerCase();
  return t.includes("测井") ? "log-analyst" : t.includes("地球物理") ? "geophysicist" : t.includes("油藏") ? "reservoir-engineer" : t.includes("钻井") ? "drilling-engineer" : t.includes("采油") || t.includes("生产") ? "production-engineer" : t.includes("pvt") || t.includes("物性") ? "pvt-analyst" : t.includes("审核") || t.includes("verifier") ? "domain-reviewer" : t.includes("master") || t.includes("planner") ? "planner" : "analyst";
}
const _l = [
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
function Il({
  open: e,
  onClose: t,
  agents: l,
  editingTeam: n,
  onSaved: a
}) {
  const r = x().React, { useState: s, useEffect: o, useCallback: d } = r, {
    Modal: c,
    Input: u,
    Button: b,
    Select: y,
    Tag: h,
    Typography: k,
    Switch: z,
    Empty: C,
    message: B,
    Divider: U,
    Steps: j
  } = x().antd, { PlusOutlined: Y, DeleteOutlined: G, SaveOutlined: N, ArrowRightOutlined: J } = x().antdIcons || {}, { Text: R, Paragraph: T } = k, [K, Q] = s(""), [S, f] = s("🤝"), [g, P] = s(""), [$, W] = s("pipeline"), [re, M] = s(""), [w, m] = s(""), [q, ie] = s([]), [A, H] = s([]), [D, Z] = s(!1), [X, me] = s(2), [_, te] = s(""), [le, ne] = s(""), [v, ue] = s({}), [pe, we] = s({}), [Te, he] = s(
    _l
  ), ee = [
    { value: "pipeline", icon: "→", title: "顺序交接", description: "上一步产物成为下一位专家的上下文", topology: "A → B → C", accent: "#08979c" },
    { value: "roundtable", icon: "⇉", title: "并行汇聚", description: "独立并行分析，避免观点相互污染", topology: "A ∥ B ∥ C → 汇总", accent: "#531dab" },
    { value: "coordinator", icon: "◎", title: "主管协作", description: "主控专家拆解任务并按需组织成员", topology: "主管 → 专家组", accent: "#0958d9" },
    { value: "router", icon: "◇", title: "智能路由", description: "按任务能力需求选择最小充分专家集合", topology: "任务 → 路由 → 子集", accent: "#d46b08" },
    { value: "review_loop", icon: "↻", title: "评审迭代", description: "产出、独立审查、修订，直到满足标准", topology: "执行 ⇄ 评审", accent: "#389e0d" },
    { value: "debate", icon: "⚖", title: "多方论证", description: "独立立场、交叉质询，再由裁决者综合", topology: "观点 ⇄ 反驳 → 裁决", accent: "#c41d7f" }
  ];
  o(() => {
    e && (n ? (Q(n.name), f(n.emoji), P(n.description), W(n.mode), M(n.coordinatorName || ""), m(n.taskTemplate), ie(n.steps || []), H(n.members.map((p) => p.name)), me(n.maxReviewRounds || 2), te(n.successCriteria || ""), ne(n.routingInstruction || ""), ue(
      Object.fromEntries(
        n.members.map((p) => [
          p.name,
          p.bindingMode || (p.agentId ? "fixed" : "preferred")
        ])
      )
    ), we(
      Object.fromEntries(
        n.members.map((p) => [
          p.name,
          p.roleKey || mt(p.name)
        ])
      )
    )) : (Q(""), f("🤝"), P(""), W("pipeline"), M(""), m(`请执行以下任务：
任务描述：{任务描述}`), ie([]), H([]), me(2), te(""), ne(""), ue({}), we({})));
  }, [e, n]), o(() => {
    e && Sl().then((p) => {
      p != null && p.length && he(p);
    });
  }, [e]);
  const F = d(() => {
    if ($ === "roundtable" || $ === "debate" || $ === "router") {
      const p = A.map((ce) => ({
        agentName: ce,
        instruction: "请给出你的专业评估意见",
        passContext: !1
      }));
      ie(p);
    } else if ($ === "pipeline") {
      const p = new Map(q.map((ye) => [ye.agentName, ye])), ce = A.map((ye) => p.get(ye) || {
        agentName: ye,
        instruction: "请完成你的专业部分",
        passContext: !0
      });
      ie(ce);
    }
  }, [$, A, q]), E = (p) => {
    A.includes(p) || (H([...A, p]), ue({ ...v, [p]: "fixed" }), we({
      ...pe,
      [p]: mt(p)
    }), ($ === "coordinator" || $ === "debate") && !re && M(p));
  }, ae = (p) => {
    const ce = A.filter((xe) => xe !== p);
    H(ce), ie(q.filter((xe) => xe.agentName !== p));
    const ye = { ...v };
    delete ye[p], ue(ye);
    const be = { ...pe };
    delete be[p], we(be), re === p && M(ce[0] || "");
  }, de = (p, ce, ye) => {
    const be = [...q];
    be[p] = { ...be[p], [ce]: ye }, ie(be);
  }, ge = async () => {
    if (!K.trim()) {
      B.warning("请输入团队名称");
      return;
    }
    if (A.length < 2) {
      B.warning("至少需要选择 2 个成员");
      return;
    }
    if (!w.trim()) {
      B.warning("请输入任务模板");
      return;
    }
    if (($ === "coordinator" || $ === "debate") && !re) {
      B.warning($ === "debate" ? "请选择裁决者" : "请选择主控专家");
      return;
    }
    Z(!0);
    try {
      let p = [...A];
      $ === "coordinator" && re ? p = [re, ...p.filter((_e) => _e !== re)] : $ === "debate" && re && (p = [...p.filter((_e) => _e !== re), re]);
      const ce = p.map(
        (_e) => {
          var De;
          const Re = l.find((Se) => Se.name === _e), Me = v[_e] || "fixed", Ue = pe[_e] || mt(_e), Ne = Te.find((Se) => Se.key === Ue);
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
      let ye = q;
      (q.length === 0 || q.length !== A.length) && (ye = A.map((_e) => ({
        agentName: _e,
        instruction: "请完成你的专业部分",
        passContext: $ === "pipeline"
      })));
      const be = {
        id: (n == null ? void 0 : n.id) || `custom-${Date.now()}`,
        name: K.trim(),
        emoji: S,
        category: "自定义",
        description: g.trim() || `${K.trim()}（${A.length}人团队）`,
        mode: $,
        members: ce,
        coordinatorName: $ === "coordinator" || $ === "debate" ? re : void 0,
        taskTemplate: w.trim(),
        orchestrationPrompt: "",
        // Custom teams use steps-based instructions
        steps: ye,
        custom: !0,
        createdAt: (n == null ? void 0 : n.createdAt) || Date.now(),
        maxReviewRounds: X,
        successCriteria: _.trim(),
        routingInstruction: le.trim()
      }, xe = await Wn(be), Ie = at(), Be = Ie.findIndex((_e) => _e.id === xe.id);
      Be >= 0 ? Ie[Be] = xe : Ie.push(xe), Dt(Ie), B.success(n ? "团队已更新" : "团队已创建"), a(), t();
    } catch (p) {
      B.error(p.message || "保存失败");
    } finally {
      Z(!1);
    }
  }, L = l.filter(
    (p) => !A.includes(p.name)
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
        R,
        {
          strong: !0,
          style: { display: "block", marginBottom: 8, fontSize: 13 }
        },
        "1. 定义任务工作流"
      ),
      r.createElement(
        "div",
        { style: { display: "flex", gap: 8, marginBottom: 8, alignItems: "center" } },
        A.length > 0 ? r.createElement(Nt, {
          members: A,
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
        onChange: (p) => P(p.target.value),
        rows: 2,
        style: { marginBottom: 8 }
      }),
      r.createElement(
        R,
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
          const ce = $ === p.value;
          return r.createElement(
            "button",
            {
              key: p.value,
              type: "button",
              onClick: () => {
                W(p.value), p.value !== "coordinator" && p.value !== "debate" && M("");
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
    r.createElement(U, { style: { margin: "12px 0" } }),
    // Step 2: Select members
    r.createElement(
      "div",
      { style: { marginBottom: 16 } },
      r.createElement(
        R,
        {
          strong: !0,
          style: { display: "block", marginBottom: 8, fontSize: 13 }
        },
        "2. 配置专家角色"
      ),
      // Available agents
      L.length > 0 ? r.createElement(
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
        ...L.map(
          (p) => r.createElement(
            b,
            {
              key: p.id,
              size: "small",
              icon: Y ? r.createElement(Y) : void 0,
              onClick: () => E(p.name)
            },
            p.name
          )
        )
      ) : null,
      // Selected members
      A.length === 0 ? r.createElement(C, {
        description: "请从上方添加团队成员",
        image: C.PRESENTED_IMAGE_SIMPLE
      }) : r.createElement(
        "div",
        { style: { display: "flex", flexDirection: "column", gap: 4 } },
        ...A.map(
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
                R,
                { strong: !0, style: { fontSize: 13 } },
                p
              ),
              ($ === "coordinator" || $ === "debate") && re === p ? r.createElement(
                h,
                { color: "blue", style: { fontSize: 10 } },
                $ === "debate" ? "裁决者" : "主控"
              ) : null
            ),
            r.createElement(
              "div",
              { style: { display: "flex", gap: 4 } },
              r.createElement(y, {
                size: "small",
                value: pe[p] || mt(p),
                style: { width: 132 },
                onChange: (ce) => we({ ...pe, [p]: ce }),
                options: Te.map((ce) => ({
                  value: ce.key,
                  label: ce.display_name
                }))
              }),
              r.createElement(y, {
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
              $ === "coordinator" || $ === "debate" ? r.createElement(
                b,
                {
                  size: "small",
                  type: "link",
                  onClick: () => M(p)
                },
                $ === "debate" ? "设为裁决者" : "设为主控"
              ) : null,
              r.createElement(
                b,
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
    $ === "review_loop" || $ === "router" ? r.createElement(
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
      $ === "review_loop" ? r.createElement(
        "div",
        { style: { display: "grid", gridTemplateColumns: "150px 1fr", gap: 10 } },
        r.createElement(y, {
          value: X,
          onChange: (p) => me(p),
          options: [1, 2, 3, 4, 5].map((p) => ({ value: p, label: `最多 ${p} 轮` }))
        }),
        r.createElement(u, {
          value: _,
          onChange: (p) => te(p.target.value),
          placeholder: "验收标准，例如：关键结论均有数据依据，且无高风险缺陷"
        })
      ) : r.createElement(u, {
        value: le,
        onChange: (p) => ne(p.target.value),
        placeholder: "路由偏好，例如：仅调用任务必需的专家；涉及模拟时优先油藏工程师"
      })
    ) : null,
    r.createElement(U, { style: { margin: "12px 0" } }),
    // Step 3: Define execution steps (for pipeline/roundtable)
    A.length > 0 ? r.createElement(
      "div",
      { style: { marginBottom: 16 } },
      r.createElement(
        R,
        {
          strong: !0,
          style: { display: "block", marginBottom: 8, fontSize: 13 }
        },
        `3. 配置专家任务${$ === "roundtable" ? "（并行独立）" : $ === "pipeline" ? "（顺序交接）" : $ === "router" ? "（作为候选能力）" : $ === "review_loop" ? "（首位执行、末位评审）" : $ === "debate" ? "（末位为裁决者）" : "（由主控动态编排）"}`
      ),
      // Auto-sync button
      r.createElement(
        b,
        {
          size: "small",
          type: "dashed",
          onClick: F,
          style: { marginBottom: 8 }
        },
        "自动生成步骤"
      ),
      // Steps list
      q.length === 0 ? r.createElement(
        R,
        { type: "secondary", style: { fontSize: 12 } },
        "点击「自动生成步骤」或手动配置每步的指令"
      ) : r.createElement(
        "div",
        { style: { display: "flex", flexDirection: "column", gap: 6 } },
        ...q.map(
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
              $ === "pipeline" ? r.createElement(
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
                h,
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
              r.createElement(z, {
                size: "small",
                checked: p.passContext,
                onChange: (ye) => de(ce, "passContext", ye)
              }),
              r.createElement(
                R,
                { type: "secondary", style: { fontSize: 11 } },
                p.passContext ? "传递上一步结果作为上下文" : "独立执行"
              )
            )
          )
        )
      )
    ) : null,
    r.createElement(U, { style: { margin: "12px 0" } }),
    // Step 4: Task template
    r.createElement(
      "div",
      null,
      r.createElement(
        R,
        {
          strong: !0,
          style: { display: "block", marginBottom: 8, fontSize: 13 }
        },
        `${A.length > 0 ? "4" : "3"}. 任务模板`
      ),
      r.createElement(u.TextArea, {
        placeholder: `输入任务模板，可用 {参数名} 作为占位符...

例如：
请对区块 {区块名} 的井 {井号} 进行储层评价`,
        value: w,
        onChange: (p) => m(p.target.value),
        rows: 4,
        style: { fontFamily: "monospace", fontSize: 13 }
      }),
      r.createElement(
        R,
        {
          type: "secondary",
          style: { fontSize: 11, display: "block", marginTop: 4 }
        },
        "占位符 {参数名} 在发起任务时可由用户填写替换"
      )
    )
  );
}
function Sn({
  team: e,
  agents: t,
  onLaunch: l,
  onEdit: n,
  onDelete: a
}) {
  var f;
  const r = x().React, { useState: s } = r, { Card: o, Tag: d, Typography: c, Button: u, Tooltip: b, Popconfirm: y } = x().antd, {
    TeamOutlined: h,
    RocketOutlined: k,
    UserOutlined: z,
    EditOutlined: C,
    DeleteOutlined: B,
    DownOutlined: U,
    UpOutlined: j
  } = x().antdIcons || {}, { Text: Y, Paragraph: G } = c, [N, J] = s(!1), R = {
    coordinator: { label: "主管协作", color: "blue" },
    pipeline: { label: "顺序交接", color: "cyan" },
    roundtable: { label: "并行汇聚", color: "purple" },
    router: { label: "智能路由", color: "orange" },
    review_loop: { label: "评审迭代", color: "green" },
    debate: { label: "多方论证", color: "magenta" }
  }, T = R[e.mode] || R.coordinator, K = e.members.map((g) => {
    const P = g.bindingMode === "temporary", $ = P ? null : (g.agentId && t.some((W) => W.id === g.agentId) ? g.agentId : null) || Jn(t, g.name);
    return { ...g, found: !!$, agentId: $, temporary: P };
  }), Q = K.filter((g) => g.found).length, S = e.coordinatorName || ((f = e.members[0]) == null ? void 0 : f.name);
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
      r.createElement(Nt, {
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
            { color: T.color, style: { fontSize: 10 } },
            T.label
          ),
          r.createElement(
            d,
            { color: "green", style: { fontSize: 10 } },
            `${e.members.length} 位专家`
          ),
          Q < e.members.length ? r.createElement(
            b,
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
          b,
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
              onConfirm: () => a(e)
            },
            r.createElement(u, {
              type: "text",
              size: "small",
              danger: !0,
              icon: B ? r.createElement(B) : void 0,
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
          b,
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
        icon: N ? j ? r.createElement(j) : "▲" : U ? r.createElement(U) : "▼"
      },
      N ? "收起流程" : "查看执行流程"
    ),
    N ? r.createElement(Tl, { team: e }) : null,
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
        S ? `${e.mode === "debate" ? "裁决者" : "主控"}: ${S}` : "OMP 动态编排"
      ),
      r.createElement(
        u,
        {
          type: "primary",
          size: "small",
          icon: k ? r.createElement(k) : void 0,
          disabled: t.length === 0,
          onClick: () => l(e),
          style: Ae
        },
        "运行工作流"
      )
    )
  );
}
function zl({
  agents: e,
  onLaunch: t
}) {
  const l = x().React, { useMemo: n, useState: a, useCallback: r, useEffect: s } = l, {
    Row: o,
    Col: d,
    Input: c,
    Empty: u,
    Typography: b,
    Tag: y,
    Button: h,
    Divider: k,
    Tabs: z,
    message: C
  } = x().antd, { SearchOutlined: B, TeamOutlined: U, PlusOutlined: j, RocketOutlined: Y } = x().antdIcons || {}, { Text: G } = b, [N, J] = a(""), [R, T] = a([]), [K, Q] = a([]), [S, f] = a(!1), [g, P] = a(!1), [$, W] = a(null);
  s(() => {
    T(at());
    let D = !0;
    return (async () => {
      try {
        await yl();
        const Z = await At();
        D && T(Z);
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
    At().then(T).catch((D) => {
      console.warn("[ugsci] Failed to refresh expert teams:", D), T(at());
    });
  }, []), M = r(
    (D) => {
      fl(D.id).then(() => {
        const X = at().filter((me) => me.id !== D.id);
        Dt(X), T(X), C.success(`团队「${D.name}」已删除`);
      }).catch((Z) => C.error(Z.message || "删除专家团失败"));
    },
    [C]
  ), w = r((D) => {
    W(D), P(!0);
  }, []), m = r(() => {
    W(null), P(!0);
  }, []), q = n(() => [...R, ...K], [R, K]), ie = n(() => {
    if (!N.trim()) return q;
    const D = N.toLowerCase();
    return q.filter(
      (Z) => Z.name.toLowerCase().includes(D) || Z.description.toLowerCase().includes(D) || Z.category.toLowerCase().includes(D)
    );
  }, [q, N]), A = ie.filter((D) => D.custom), H = ie.filter((D) => !D.custom);
  return l.createElement(
    "div",
    null,
    S ? l.createElement(x().antd.Alert, {
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
        h,
        {
          type: "primary",
          size: "small",
          icon: j ? l.createElement(j) : void 0,
          onClick: m,
          style: Ae
        },
        "创建专家团"
      )
    ),
    // Search
    l.createElement(c, {
      placeholder: "搜索团队名称、描述或类别...",
      prefix: B ? l.createElement(B) : void 0,
      value: N,
      onChange: (D) => J(D.target.value),
      allowClear: !0,
      style: { marginBottom: 16, maxWidth: 400 }
    }),
    // Tabs: preset teams vs custom teams
    l.createElement(
      z,
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
                    l.createElement(Sn, {
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
            label: `自定义团队${A.length ? ` (${A.length})` : ""}`,
            children: l.createElement(
              "div",
              null,
              A.length > 0 ? l.createElement(
                o,
                { gutter: [12, 12] },
                ...A.map(
                  (D) => l.createElement(
                    d,
                    { key: D.id, xs: 24, sm: 12, md: 8 },
                    l.createElement(Sn, {
                      team: D,
                      agents: e,
                      onLaunch: t,
                      onEdit: w,
                      onDelete: M
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
              l.createElement(Cl),
              l.createElement(bn, { activeOnly: !0 })
            )
          },
          {
            key: "history",
            label: "讨论历史",
            children: l.createElement(bn)
          }
        ]
      }
    ),
    // Team Builder Modal
    l.createElement(Il, {
      open: g,
      onClose: () => {
        P(!1), W(null);
      },
      agents: e,
      editingTeam: $,
      onSaved: re
    })
  );
}
const Al = [
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
function Pl(e) {
  window.history.pushState({}, "", e), window.dispatchEvent(new PopStateEvent("popstate"));
}
function zt(e, t) {
  const l = new URLSearchParams();
  e && l.set("flow", e), t && l.set("run", t), Pl(`/flowforge${l.size ? `?${l.toString()}` : ""}`);
}
function Ol() {
  const e = x().React, { useCallback: t, useEffect: l, useState: n } = e, {
    Alert: a,
    Button: r,
    Card: s,
    Col: o,
    Empty: d,
    Input: c,
    Row: u,
    Space: b,
    Spin: y,
    Tabs: h,
    Tag: k,
    Typography: z,
    message: C
  } = x().antd, { ApartmentOutlined: B, ReloadOutlined: U, RocketOutlined: j } = x().antdIcons || {}, { Text: Y, Paragraph: G, Title: N } = z, J = x().useSelectedAgent, R = J ? J() : { id: "default" }, T = (R == null ? void 0 : R.id) || "default", K = (R == null ? void 0 : R.name) || T, Q = K === T ? T : `${K}（${T}）`, [S, f] = n([]), [g, P] = n([]), [$, W] = n([]), [re, M] = n(!0), [w, m] = n(!0), [q, ie] = n(null), [A, H] = n(""), [D, Z] = n(""), X = t(async () => {
    M(!0);
    try {
      const [v, ue, pe] = await Promise.all([
        se("/flowforge/flows", { bypassCache: !0 }),
        se("/flowforge/runs", { bypassCache: !0 }),
        wt().catch(() => [])
      ]);
      f(v), P(ue), W(pe), m(!0);
    } catch (v) {
      console.warn("[ugsci] FlowForge is unavailable:", v), m(!1);
    } finally {
      M(!1);
    }
  }, []);
  l(() => {
    X();
  }, [X]);
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
              agent_id: T
            })
          }
        ), pe = {
          ...ue.nodes || {}
        }, we = Object.entries(pe).filter(([ee]) => /^step_\d+$/.test(ee)).sort(([ee], [F]) => Number(ee.slice(5)) - Number(F.slice(5))), Te = {};
        we.forEach(([ee, F], E) => {
          const ae = v.roleHints[E] || "", de = v.roleKeys[E] || "analyst", ge = $.find(
            (ce) => `${ce.name} ${ce.id}`.toLowerCase().includes(ae.toLowerCase())
          ), L = (ge == null ? void 0 : ge.id) || T, p = { ...F.inputs || {} };
          p.agent_id = L, pe[ee] = {
            ...F,
            inputs: p,
            metadata: {
              ...F.metadata || {},
              binding_policy: "fixed_instance",
              role_hint: ae,
              role_key: de,
              agent_id: L
            }
          }, Te[ee] = {
            binding_policy: "fixed_instance",
            role_hint: ae,
            role_key: de,
            agent_id: L
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
            controller_agent_id: T,
            node_bindings: Te
          }
        };
        await se("/flowforge/flows", {
          method: "POST",
          body: JSON.stringify(he)
        }), C.success(`已创建工作流草稿「${v.name}」`), await X();
      } catch (ue) {
        C.error(ue.message || "创建工作流失败");
      } finally {
        ie(null);
      }
    },
    [$, T, X, C]
  ), _ = t(async () => {
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
            name: A.trim(),
            agent_id: T
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
          controller_agent_id: T
        }
      };
      await se("/flowforge/flows", {
        method: "POST",
        body: JSON.stringify(ue)
      }), C.success("已从自然语言生成可编辑工作流草稿"), H(""), Z(""), await X();
    } catch (v) {
      C.error(v.message || "自然语言生成失败");
    } finally {
      ie(null);
    }
  }, [T, X, C, A, D]), te = e.createElement(
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
        b,
        { direction: "vertical", style: { width: "100%" }, size: 10 },
        e.createElement(c, {
          value: A,
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
            onClick: () => void _(),
            loading: q === "natural-language",
            disabled: !w,
            style: Ae
          },
          "生成可编辑草稿"
        )
      )
    ),
    e.createElement(
      u,
      { gutter: [12, 12] },
      ...Al.map(
        (v) => e.createElement(
          o,
          { key: v.key, xs: 24, md: 8 },
          e.createElement(
            s,
            { style: { height: "100%" } },
            e.createElement(
              b,
              { align: "start", style: { width: "100%" } },
              e.createElement("span", { style: { fontSize: 28 } }, v.icon),
              e.createElement(
                "div",
                { style: { flex: 1 } },
                e.createElement(N, { level: 5, style: { margin: 0 } }, v.name),
                e.createElement(k, { color: "blue", style: { marginTop: 6 } }, v.category),
                e.createElement(
                  G,
                  { type: "secondary", style: { margin: "10px 0 14px" } },
                  v.description
                ),
                e.createElement(
                  r,
                  {
                    type: "primary",
                    loading: q === v.key,
                    disabled: !w,
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
              k,
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
  ), le = re ? e.createElement(y) : S.length === 0 ? e.createElement(d, { description: "暂无工作流，可从模板创建" }) : e.createElement(
    u,
    { gutter: [12, 12] },
    ...S.map(
      (v) => e.createElement(
        o,
        { key: v.id, xs: 24, md: 12, xl: 8 },
        e.createElement(
          s,
          {
            size: "small",
            title: v.name,
            extra: e.createElement(k, null, `v${v.version}`)
          },
          e.createElement(G, { ellipsis: { rows: 2 } }, v.description || "暂无描述"),
          e.createElement(
            b,
            null,
            e.createElement(k, { color: "geekblue" }, `${v.node_count} 个节点`),
            e.createElement(r, { size: "small", onClick: () => zt(v.id) }, "打开编辑器")
          )
        )
      )
    )
  ), ne = re ? e.createElement(y) : g.length === 0 ? e.createElement(d, { description: "暂无工作流运行记录" }) : e.createElement(
    "div",
    { style: { display: "flex", flexDirection: "column", gap: 8 } },
    ...g.map(
      (v) => e.createElement(
        s,
        { key: v.run_id, size: "small" },
        e.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 10 } },
          e.createElement(k, { color: v.status === "completed" ? "green" : v.status === "failed" ? "red" : "blue" }, v.status),
          e.createElement(Y, { strong: !0 }, v.flow_id),
          e.createElement(Y, { type: "secondary", style: { fontFamily: "monospace" } }, v.run_id),
          v.error ? e.createElement(Y, { type: "danger" }, v.error) : null,
          e.createElement(
            r,
            { size: "small", type: "link", onClick: () => zt(void 0, v.run_id) },
            "查看详情"
          )
        )
      )
    )
  );
  return e.createElement(
    "div",
    null,
    w ? null : e.createElement(a, {
      type: "warning",
      showIcon: !0,
      message: "协作工作流引擎当前不可用",
      description: "请确认 FlowForge 插件已启用。专家和专家团功能不受影响。",
      action: e.createElement(r, { size: "small", onClick: () => void X() }, "重试"),
      style: { marginBottom: 16 }
    }),
    e.createElement(h, {
      items: [
        { key: "templates", label: "工作流模板", children: te },
        { key: "mine", label: `我的工作流 (${S.length})`, children: le },
        { key: "runs", label: `运行中心 (${g.length})`, children: ne }
      ],
      tabBarExtraContent: e.createElement(
        b,
        null,
        e.createElement(r, {
          icon: U ? e.createElement(U) : void 0,
          onClick: () => void X(),
          loading: re
        }, "刷新"),
        e.createElement(r, {
          type: "primary",
          icon: B ? e.createElement(B) : j ? e.createElement(j) : void 0,
          onClick: () => zt(),
          disabled: !w,
          style: Ae
        }, "打开流程编辑器")
      )
    })
  );
}
function xn(e, t) {
  var a, r;
  const l = e.coordinatorName || ((a = e.members[0]) == null ? void 0 : a.name), n = e.members.find((s) => s.name === l) || e.members[0];
  if ((n == null ? void 0 : n.bindingMode) !== "temporary" && (n != null && n.agentId) && t.some((s) => s.id === n.agentId))
    return n.agentId;
  if (l && (n == null ? void 0 : n.bindingMode) !== "temporary") {
    const s = Jn(t, l);
    if (s) return s;
  }
  return (n == null ? void 0 : n.bindingMode) === "fixed" ? null : ((r = t[0]) == null ? void 0 : r.id) || null;
}
function kn() {
  const e = new URLSearchParams(window.location.search).get("section");
  return e === "teams" || e === "workflows" ? e : "experts";
}
function $l() {
  var de, ge;
  const e = x().React, { useState: t, useEffect: l, useCallback: n, useMemo: a } = e, {
    Spin: r,
    Empty: s,
    Input: o,
    Button: d,
    message: c,
    Row: u,
    Col: b,
    Tabs: y,
    Modal: h,
    Typography: k
  } = x().antd, {
    ReloadOutlined: z,
    PlusOutlined: C,
    SearchOutlined: B,
    TeamOutlined: U,
    UserOutlined: j
  } = x().antdIcons || {}, { Text: Y, Paragraph: G } = k, [N, J] = t([]), [R, T] = t(!0), [K, Q] = t(!1), [S, f] = t(null), [g, P] = t(""), [$, W] = t(!1), [re, M] = t(kn), [w, m] = t(
    null
  ), [q, ie] = t(""), [A, H] = t(!1), [D, Z] = t(!1), [X, me] = t(null), [_, te] = t([]), le = n(async () => {
    T(!0);
    try {
      const L = await wt(), p = await Promise.all(
        L.map(async (ce) => {
          try {
            const [ye, be, xe] = await Promise.all([
              Mt(ce.id).catch(() => null),
              St(ce.id).catch(() => []),
              Ut(ce.id).catch(() => [])
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
      J(p), te(L);
    } catch (L) {
      c.error(L.message || "加载专家列表失败"), J([]);
    } finally {
      T(!1);
    }
  }, []);
  l(() => {
    le();
  }, [le]), l(() => {
    const L = () => M(kn());
    return window.addEventListener("popstate", L), () => window.removeEventListener("popstate", L);
  }, []), l(() => {
    if (X && D) {
      const L = N.find(
        (p) => p.agent.id === X.agent.id
      );
      L && L !== X && me(L);
    }
  }, [N, X, D]);
  const ne = n(
    async (L) => {
      var be;
      const p = L.coordinatorName || ((be = L.members[0]) == null ? void 0 : be.name), ce = xn(L, _);
      if (!ce) {
        const xe = L.members.find(
          (Ie) => Ie.name === p
        );
        c.error(
          (xe == null ? void 0 : xe.bindingMode) === "fixed" ? `固定协调者「${p || "协调者"}」当前不可用，请修复绑定后再运行` : "没有可用的 Agent 作为工作流控制器"
        );
        return;
      }
      if (/\{.+?\}/.test(L.taskTemplate)) {
        ie(L.taskTemplate), m(L);
        return;
      }
      await v(L, ce, L.taskTemplate);
    },
    [_, c]
  ), v = n(
    async (L, p, ce) => {
      H(!0);
      try {
        const ye = ce || L.taskTemplate, be = L.custom ? `@${L.id}` : L.name, xe = `/ugsci-team ${L.mode} ${be} ${ye}`, Ie = x();
        Ie.setSelectedAgent && Ie.setSelectedAgent(p);
        const Be = await hl(
          p,
          xe,
          L.name
        );
        c.success(
          `OMP 工作流已启动：${L.name}（${L.mode}模式）`
        ), m(null), ue(`/chat/${Be}`);
      } catch (ye) {
        c.error(ye.message || "发起团队任务失败");
      } finally {
        H(!1);
      }
    },
    [c]
  ), ue = (L) => {
    window.history.pushState({}, "", L), window.dispatchEvent(new PopStateEvent("popstate"));
  }, pe = n((L) => {
    f(L), Q(!0);
  }, []), we = n((L) => {
    me(L), Z(!0);
  }, []), Te = n(
    (L) => {
      if (!L.agent.enabled) {
        c.warning(`专家「${L.agent.name}」未启用，请先启用`);
        return;
      }
      try {
        const p = x();
        p.setSelectedAgent && p.setSelectedAgent(L.agent.id);
      } catch (p) {
        console.warn("[ugsci] Failed to set selected agent:", p);
      }
      c.success(`已召唤专家「${L.agent.name}」，正在跳转至对话...`), ue("/chat");
    },
    [c]
  ), he = a(() => {
    if (!g.trim()) return N;
    const L = g.toLowerCase();
    return N.filter(
      (p) => {
        var ce;
        return p.agent.name.toLowerCase().includes(L) || ((ce = p.agent.description) == null ? void 0 : ce.toLowerCase().includes(L)) || p.agent.id.toLowerCase().includes(L) || p.skills.some((ye) => ye.name.toLowerCase().includes(L));
      }
    );
  }, [N, g]), ee = N.filter((L) => L.agent.enabled).length, F = N.reduce(
    (L, p) => L + p.skills.filter((ce) => ce.enabled !== !1).length,
    0
  ), E = N.reduce((L, p) => L + p.mcps.length, 0), ae = [
    {
      key: "experts",
      label: e.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        j ? e.createElement(j, { style: { fontSize: 14 } }) : null,
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
            prefix: B ? e.createElement(B) : void 0,
            value: g,
            onChange: (L) => P(L.target.value),
            allowClear: !0,
            style: { maxWidth: 400 }
          })
        ),
        // Content
        R ? e.createElement(
          "div",
          { style: { textAlign: "center", padding: 60 } },
          e.createElement(r, { size: "large" })
        ) : he.length === 0 ? e.createElement(s, {
          description: g ? "未找到匹配的专家" : "暂无专家，点击「创建专家」添加"
        }) : e.createElement(
          u,
          { gutter: [12, 12], align: "stretch" },
          ...he.map(
            (L) => e.createElement(
              b,
              {
                key: L.agent.id,
                xs: 24,
                sm: 12,
                md: 8,
                lg: 6,
                style: { display: "flex" }
              },
              e.createElement(il, {
                expert: L,
                onClick: () => pe(L),
                onSummon: () => Te(L),
                onConfigure: () => we(L)
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
        U ? e.createElement(U, { style: { fontSize: 14 } }) : null,
        "专家团"
      ),
      children: e.createElement(zl, {
        agents: _,
        onLaunch: ne
      })
    },
    {
      key: "workflows",
      label: e.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        (de = x().antdIcons) != null && de.ApartmentOutlined ? e.createElement(x().antdIcons.ApartmentOutlined, {
          style: { fontSize: 14 }
        }) : null,
        "协作工作流"
      ),
      children: e.createElement(Ol)
    }
  ];
  return e.createElement(
    "div",
    { style: { padding: 24 } },
    e.createElement(bt, {
      title: "专家·协作",
      subtitle: re === "experts" ? `共 ${N.length} 位专家（${ee} 位启用）· ${F} 个技能 · ${E} 个 MCP 客户端` : re === "teams" ? "开放式多专家讨论、联合研判与 OMP 动态协作" : "流程化、可观测、可验证的油气与储气库协作流程",
      extra: e.createElement(
        e.Fragment,
        null,
        re === "experts" ? e.createElement(
          d,
          {
            icon: z ? e.createElement(z) : void 0,
            onClick: () => {
              rt(), le();
            },
            loading: R
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
    e.createElement(y, {
      items: ae,
      activeKey: re,
      onChange: (L) => {
        M(L);
        const p = new URL(window.location.href);
        L === "experts" ? p.searchParams.delete("section") : p.searchParams.set("section", L), window.history.pushState({}, "", `${p.pathname}${p.search}`);
      }
    }),
    // Drawer
    e.createElement(cl, {
      expert: S,
      open: K,
      onClose: () => Q(!1),
      onRefresh: () => le()
    }),
    // Template Modal
    e.createElement(dl, {
      open: $,
      onClose: () => W(!1),
      onCreated: () => le()
    }),
    // Config Modal (gear icon)
    e.createElement(rl, {
      expert: X,
      open: D,
      onClose: () => Z(!1),
      onRefresh: () => le()
    }),
    // Team Launch Modal (for filling placeholders)
    w ? e.createElement(
      h,
      {
        open: !0,
        title: e.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 8 } },
          e.createElement(Nt, {
            members: w.members.map((L) => L.name),
            size: 28
          }),
          e.createElement(
            "span",
            null,
            `发起团队任务 - ${w.name}`
          )
        ),
        onCancel: () => m(null),
        onOk: () => {
          const L = xn(
            w,
            _
          );
          if (!L) {
            c.error("固定协调者不可用或没有可用的控制器 Agent");
            return;
          }
          const p = q.trim() || w.taskTemplate;
          v(w, L, p);
        },
        confirmLoading: A,
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
          value: q,
          onChange: (L) => ie(L.target.value),
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
          `协调者: ${w.coordinatorName || ((ge = w.members[0]) == null ? void 0 : ge.name) || "—"} · 成员: ${w.members.map((L) => L.name).join("、")}`
        )
      )
    ) : null
  );
}
function Rl({
  agentId: e,
  agentName: t,
  onNavigate: l
}) {
  const n = x().React, { useState: a, useEffect: r, useCallback: s } = n, {
    Spin: o,
    Empty: d,
    Button: c,
    Row: u,
    Col: b,
    Card: y,
    Tag: h,
    Checkbox: k,
    Modal: z,
    Typography: C,
    Drawer: B,
    Descriptions: U,
    message: j
  } = x().antd, {
    ReloadOutlined: Y,
    ThunderboltOutlined: G,
    SettingOutlined: N,
    CheckSquareOutlined: J,
    EyeOutlined: R,
    EyeInvisibleOutlined: T,
    DeleteOutlined: K,
    CloseOutlined: Q
  } = x().antdIcons || {}, { Text: S, Paragraph: f } = C, [g, P] = a([]), [$, W] = a(!0), [re, M] = a(!1), [w, m] = a(null), [q, ie] = a(!1), [A, H] = a(
    /* @__PURE__ */ new Set()
  ), [D, Z] = a(!1), [X, me] = a(null), [_, te] = a(!1), le = s(async () => {
    if (e) {
      W(!0);
      try {
        const E = await St(e);
        P(E);
      } catch (E) {
        j.error(E.message || "加载技能失败"), P([]);
      } finally {
        W(!1);
      }
    }
  }, [e]);
  r(() => {
    le();
  }, [le]);
  const ne = (E) => {
    H((ae) => {
      const de = new Set(ae);
      return de.has(E) ? de.delete(E) : de.add(E), de;
    });
  }, v = () => H(/* @__PURE__ */ new Set()), ue = () => H(new Set(g.map((E) => E.name))), pe = () => {
    q ? (v(), ie(!1)) : ie(!0);
  }, we = async () => {
    const E = Array.from(A);
    if (E.length !== 0) {
      Z(!0);
      try {
        const { results: ae } = await Ba(e, E), de = Object.entries(ae).filter(
          ([, L]) => L.success === !1
        ), ge = E.length - de.length;
        de.length > 0 ? j.warning(
          `批量启用完成：成功 ${ge} 个，失败 ${de.length} 个`
        ) : j.success(`成功启用 ${E.length} 个技能`), v(), await le();
      } catch (ae) {
        j.error(ae.message || "批量启用失败");
      } finally {
        Z(!1);
      }
    }
  }, Te = async () => {
    const E = Array.from(A);
    if (E.length !== 0) {
      Z(!0);
      try {
        const { results: ae } = await ja(e, E), de = Object.entries(ae).filter(
          ([, L]) => L.success === !1
        ), ge = E.length - de.length;
        de.length > 0 ? j.warning(
          `批量停用完成：成功 ${ge} 个，失败 ${de.length} 个`
        ) : j.success(`成功停用 ${E.length} 个技能`), v(), await le();
      } catch (ae) {
        j.error(ae.message || "批量停用失败");
      } finally {
        Z(!1);
      }
    }
  }, he = () => {
    const E = Array.from(A);
    E.length !== 0 && z.confirm({
      title: `确认删除 ${E.length} 个技能？`,
      content: "删除后技能将从当前专家工作区移除，此操作不可撤销。技能池中的原始技能不受影响。",
      okText: "确认删除",
      cancelText: "取消",
      okButtonProps: { danger: !0 },
      onOk: async () => {
        Z(!0);
        try {
          const { results: ae } = await Ua(e, E), de = Object.entries(ae).filter(
            ([, L]) => L.success === !1
          ), ge = E.length - de.length;
          de.length > 0 ? j.warning(
            `批量删除完成：成功 ${ge} 个，失败 ${de.length} 个`
          ) : j.success(`成功删除 ${E.length} 个技能`), v(), await le();
        } catch (ae) {
          j.error(ae.message || "批量删除失败");
        } finally {
          Z(!1);
        }
      }
    });
  }, ee = async (E) => {
    te(!0);
    try {
      E.enabled === !1 ? (await Mn(e, E.name), j.success(`已启用技能「${E.name}」`)) : (await jn(e, E.name), j.success(`已禁用技能「${E.name}」`)), await le();
    } catch (ae) {
      j.error(ae.message || "操作失败");
    } finally {
      te(!1);
    }
  }, F = (E) => {
    z.confirm({
      title: `确认删除技能「${E.name}」？`,
      content: "删除后技能将从当前专家工作区移除，此操作不可撤销。技能池中的原始技能不受影响。",
      okText: "确认删除",
      cancelText: "取消",
      okButtonProps: { danger: !0 },
      onOk: async () => {
        te(!0);
        try {
          await jt(e, E.name), j.success(`已删除技能「${E.name}」`), await le();
        } catch (ae) {
          j.error(ae.message || "删除失败");
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
        S,
        { type: "secondary", style: { fontSize: 13 } },
        q ? `已选择 ${A.size} / ${g.length} 个技能` : `共 ${g.length} 个技能`
      ),
      n.createElement(
        "div",
        { style: { display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" } },
        q ? n.createElement(
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
              icon: R ? n.createElement(R) : void 0,
              disabled: A.size === 0 || D,
              loading: D,
              onClick: we
            },
            "批量启用"
          ),
          n.createElement(
            c,
            {
              size: "small",
              danger: !0,
              icon: T ? n.createElement(T) : void 0,
              disabled: A.size === 0 || D,
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
              disabled: A.size === 0 || D,
              loading: D,
              onClick: he
            },
            `删除 (${A.size})`
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
                rt(), le();
              }
            },
            "刷新"
          )
        )
      )
    ),
    $ ? n.createElement(
      "div",
      { style: { textAlign: "center", padding: 60 } },
      n.createElement(o, { size: "large" })
    ) : g.length === 0 ? n.createElement(d, {
      description: "当前智能体未加载任何技能"
    }) : n.createElement(
      u,
      { gutter: [12, 12] },
      ...g.map(
        (E) => n.createElement(
          b,
          { key: E.name, xs: 24, sm: 12, md: 8, lg: 6 },
          n.createElement(
            y,
            {
              hoverable: !0,
              size: "small",
              style: {
                cursor: q ? "default" : "pointer",
                height: "100%",
                position: "relative",
                borderColor: q && A.has(E.name) ? "#0072f5" : void 0,
                borderWidth: q && A.has(E.name) ? 2 : 1
              },
              onClick: () => {
                q ? ne(E.name) : (m(E), M(!0));
              },
              onMouseEnter: () => {
                q || me(E.name);
              },
              onMouseLeave: () => me(null)
            },
            q ? n.createElement(
              "div",
              {
                style: {
                  position: "absolute",
                  top: 8,
                  right: 8,
                  zIndex: 1
                },
                onClick: (ae) => {
                  ae.stopPropagation(), ne(E.name);
                }
              },
              n.createElement(k, {
                checked: A.has(E.name)
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
              E.emoji ? n.createElement(
                "span",
                { style: { fontSize: 18 } },
                E.emoji
              ) : n.createElement(
                "span",
                { style: { fontSize: 18 } },
                "⚡"
              ),
              n.createElement(
                S,
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
                E.name
              ),
              E.enabled === !1 ? n.createElement(
                h,
                { color: "default", style: { fontSize: 10 } },
                "已禁用"
              ) : n.createElement(
                h,
                { color: "green", style: { fontSize: 10 } },
                "已启用"
              )
            ),
            E.description ? n.createElement(
              f,
              {
                type: "secondary",
                style: { fontSize: 11, margin: 0, lineHeight: 1.4 },
                ellipsis: { rows: 2 }
              },
              E.description
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
              E.version_text ? n.createElement(
                h,
                { style: { fontSize: 10 } },
                `v${E.version_text}`
              ) : null,
              ...(E.tags || []).slice(0, 3).map(
                (ae, de) => n.createElement(
                  h,
                  { key: de, color: "blue", style: { fontSize: 10 } },
                  ae
                )
              )
            ),
            // Hover action footer (not in batch mode)
            !q && X === E.name ? n.createElement(
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
                  icon: E.enabled === !1 ? R ? n.createElement(R) : void 0 : T ? n.createElement(T) : void 0,
                  disabled: _,
                  onClick: (ae) => {
                    ae.stopPropagation(), ee(E);
                  }
                },
                E.enabled === !1 ? "启用" : "禁用"
              ),
              n.createElement(
                c,
                {
                  size: "small",
                  danger: !0,
                  icon: K ? n.createElement(K) : void 0,
                  disabled: _,
                  onClick: (ae) => {
                    ae.stopPropagation(), F(E);
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
    w ? n.createElement(
      B,
      {
        title: n.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 8 } },
          n.createElement(
            "span",
            { style: { fontSize: 18 } },
            w.emoji || "⚡"
          ),
          n.createElement("span", null, w.name)
        ),
        open: re,
        onClose: () => M(!1),
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
        U,
        { column: 1, bordered: !0, size: "small" },
        n.createElement(
          U.Item,
          { label: "技能名称" },
          w.name
        ),
        n.createElement(
          U.Item,
          { label: "描述" },
          w.description || "-"
        ),
        w.version_text ? n.createElement(
          U.Item,
          { label: "版本" },
          w.version_text
        ) : null,
        n.createElement(
          U.Item,
          { label: "来源" },
          w.source || "-"
        ),
        n.createElement(
          U.Item,
          { label: "状态" },
          w.enabled === !1 ? "已禁用" : "已启用"
        ),
        w.installed_from ? n.createElement(
          U.Item,
          { label: "安装来源" },
          w.installed_from
        ) : null
      ),
      // Tags
      w.tags && w.tags.length > 0 ? n.createElement(
        "div",
        { style: { marginTop: 16 } },
        n.createElement(
          S,
          {
            strong: !0,
            style: { display: "block", marginBottom: 8 }
          },
          "标签"
        ),
        n.createElement(
          "div",
          { style: { display: "flex", flexWrap: "wrap", gap: 4 } },
          ...w.tags.map(
            (E, ae) => n.createElement(h, { key: ae, color: "blue" }, E)
          )
        )
      ) : null,
      // Skill content preview
      w.content ? n.createElement(
        "div",
        { style: { marginTop: 16 } },
        n.createElement(
          S,
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
          w.content.slice(0, 2e3) + (w.content.length > 2e3 ? `

... (内容已截断)` : "")
        )
      ) : null
    ) : null
  );
}
function Ml({
  poolSkills: e,
  workspaceSkills: t,
  agents: l,
  loading: n,
  onReload: a,
  agentId: r,
  agentName: s
}) {
  const o = x().React, { useState: d, useMemo: c, useCallback: u } = o, {
    Spin: b,
    Empty: y,
    Input: h,
    Button: k,
    Row: z,
    Col: C,
    Card: B,
    Tag: U,
    Typography: j,
    Drawer: Y,
    Descriptions: G,
    List: N,
    Modal: J,
    message: R
  } = x().antd, {
    ReloadOutlined: T,
    SearchOutlined: K,
    DownloadOutlined: Q,
    ThunderboltOutlined: S,
    DeleteOutlined: f,
    PlusOutlined: g
  } = x().antdIcons || {}, { Text: P, Paragraph: $ } = j, [W, re] = d(""), [M, w] = d(!1), [m, q] = d(null), [ie, A] = d([]), [H, D] = d(!1), [Z, X] = d(24), [me, _] = d(null), [te, le] = d(!1), ne = c(() => {
    if (!W.trim()) return e;
    const F = W.toLowerCase();
    return e.filter(
      (E) => {
        var ae, de;
        return E.name.toLowerCase().includes(F) || ((ae = E.description) == null ? void 0 : ae.toLowerCase().includes(F)) || ((de = E.tags) == null ? void 0 : de.some((ge) => ge.toLowerCase().includes(F)));
      }
    );
  }, [e, W]), v = c(
    () => ne.slice(0, Z),
    [ne, Z]
  ), ue = u((F) => {
    re(F), X(24);
  }, []), pe = u(
    (F) => {
      const E = [];
      for (const ae of t)
        if (ae.skills.some((de) => de.name === F)) {
          const de = l.find((ge) => ge.id === ae.agent_id);
          E.push((de == null ? void 0 : de.name) || ae.agent_name || ae.agent_id);
        }
      return E;
    },
    [t, l]
  ), we = u(
    async (F) => {
      if (q(F), A(pe(F.name)), w(!0), !F.content) {
        D(!0);
        try {
          const E = await Aa(F.name);
          q({ ...F, content: E });
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
      await Bt(r, F.name), R.success(
        `已将技能「${F.name}」加载到当前专家「${s}」`
      ), a();
    } catch (E) {
      R.error(E.message || "加载技能失败");
    } finally {
      le(!1);
    }
  }, he = (F) => {
    if (F.protected) {
      R.warning("内置技能不可删除");
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
          await Da(F.name), R.success(`已从技能池删除「${F.name}」`), a();
        } catch (E) {
          R.error(E.message || "删除失败");
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
      o.createElement(h, {
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
          k,
          {
            icon: T ? o.createElement(T) : void 0,
            onClick: a,
            loading: n,
            size: "small"
          },
          "刷新"
        ),
        o.createElement(
          k,
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
      o.createElement(b, { size: "large" })
    ) : ne.length === 0 ? o.createElement(y, {
      description: W ? "未找到匹配的技能" : "技能池为空"
    }) : o.createElement(
      o.Fragment,
      null,
      o.createElement(
        z,
        { gutter: [12, 12] },
        ...v.map(
          (F) => o.createElement(
            C,
            { key: F.name, xs: 24, sm: 12, md: 8, lg: 6 },
            o.createElement(
              B,
              {
                hoverable: !0,
                size: "small",
                style: { cursor: "pointer", height: "100%" },
                onClick: () => we(F),
                onMouseEnter: () => _(F.name),
                onMouseLeave: () => _(null)
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
                  F.name
                ),
                F.protected ? o.createElement(
                  U,
                  { color: "gold", style: { fontSize: 10 } },
                  "内置"
                ) : null
              ),
              F.description ? o.createElement(
                $,
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
                  U,
                  { style: { fontSize: 10 } },
                  `v${F.version_text}`
                ) : null,
                ...(F.tags || []).slice(0, 3).map(
                  (E, ae) => o.createElement(
                    U,
                    { key: ae, color: "cyan", style: { fontSize: 10 } },
                    E
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
                  k,
                  {
                    size: "small",
                    type: "primary",
                    icon: g ? o.createElement(g) : void 0,
                    disabled: te,
                    onClick: (E) => {
                      E.stopPropagation(), Te(F);
                    }
                  },
                  "加载到当前Agent"
                ),
                o.createElement(
                  k,
                  {
                    size: "small",
                    danger: !0,
                    icon: f ? o.createElement(f) : void 0,
                    disabled: te || F.protected,
                    onClick: (E) => {
                      E.stopPropagation(), he(F);
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
            k,
            {
              onClick: () => X((F) => F + 24),
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
        open: M,
        onClose: () => w(!1),
        width: 520,
        extra: o.createElement(
          k,
          {
            type: "primary",
            size: "small",
            icon: S ? o.createElement(S) : void 0,
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
          P,
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
            (F, E) => o.createElement(U, { key: E, color: "cyan" }, F)
          )
        )
      ) : null,
      // Installed agents
      o.createElement(
        "div",
        { style: { marginTop: 16 } },
        o.createElement(
          P,
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
                P,
                { style: { fontSize: 13 } },
                F
              )
            )
          )
        }) : o.createElement(
          P,
          { type: "secondary", style: { fontSize: 12 } },
          "暂无专家安装此技能"
        )
      ),
      // Skill content preview (lazy-loaded)
      H ? o.createElement(
        "div",
        { style: { marginTop: 16, textAlign: "center" } },
        o.createElement(b, { size: "small" })
      ) : m.content ? o.createElement(
        "div",
        { style: { marginTop: 16 } },
        o.createElement(
          P,
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
function Ll({
  embedded: e = !1
} = {}) {
  const t = x().React, { useState: l, useEffect: n, useCallback: a, useMemo: r } = t, { Tabs: s, message: o } = x().antd, { ThunderboltOutlined: d, AppstoreOutlined: c } = x().antdIcons || {}, b = x().useSelectedAgent, y = b ? b() : null, h = (y == null ? void 0 : y.id) || "default";
  n(() => {
    Rt();
  }, [h]);
  const [k, z] = l([]), [C, B] = l([]), [U, j] = l([]), [Y, G] = l(!0), [N, J] = l("agent-skills"), R = a(async () => {
    G(!0);
    try {
      const [f, g, P] = await Promise.all([
        Lt(!0),
        wt(),
        Pa()
      ]);
      B(f), z(g), j(P);
    } catch (f) {
      o.error(f.message || "加载技能列表失败"), B([]);
    } finally {
      G(!1);
    }
  }, []);
  n(() => {
    R();
  }, [R]);
  const T = r(() => {
    const f = k.find((g) => g.id === h);
    return (f == null ? void 0 : f.name) || h;
  }, [k, h]), K = (f) => {
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
      children: t.createElement(Rl, {
        agentId: h,
        agentName: T,
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
      children: t.createElement(Ml, {
        poolSkills: C,
        workspaceSkills: U,
        agents: k,
        loading: Y,
        onReload: R,
        agentId: h,
        agentName: T
      })
    }
  ], S = t.createElement(s, {
    items: Q,
    activeKey: N,
    onChange: (f) => J(f)
  });
  return e ? S : t.createElement(
    "div",
    { style: { padding: 24 } },
    t.createElement(bt, {
      title: "技能",
      subtitle: `技能池共 ${C.length} 个技能 · 当前智能体：${T}`
    }),
    S
  );
}
const Pt = {
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
}, qn = /* @__PURE__ */ new Set(["cmg", "comsol", "tnavigator", "eclipse", "intersect", "visage"]);
function Vn(e) {
  return ht(`/ugsci/engines/icon/${encodeURIComponent(e)}`);
}
async function Bl() {
  return se("/ugsci/engines/list");
}
async function jl(e) {
  return se("/ugsci/engines/", {
    method: "POST",
    body: JSON.stringify(e)
  });
}
async function Ul(e, t) {
  return se(`/ugsci/engines/${encodeURIComponent(e)}`, {
    method: "PUT",
    body: JSON.stringify(t)
  });
}
async function Nl(e) {
  return se(
    `/ugsci/engines/${encodeURIComponent(e)}`,
    { method: "DELETE" }
  );
}
async function Dl() {
  return se("/ugsci/engines/detect/refresh", {
    method: "POST"
  });
}
function Fl({
  engine: e,
  onClick: t
}) {
  const l = x().React, { Card: n, Tag: a, Typography: r } = x().antd, { Text: s } = r, o = e.status === "detected", d = Xn[e.category] || "📦", u = qn.has(e.id) ? l.createElement("img", {
    src: Vn(e.id),
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
        Pt[e.category] || e.category
      ) : null,
      e.version ? l.createElement(
        a,
        { color: "blue", style: { fontSize: 11 } },
        `v${e.version}`
      ) : null,
      ...(e.modules || []).map(
        (b) => l.createElement(
          a,
          { key: b, color: "cyan", style: { fontSize: 10 } },
          b
        )
      )
    )
  );
}
function Gl() {
  const e = x().React, { useState: t, useEffect: l, useCallback: n, useMemo: a } = e, {
    Spin: r,
    Empty: s,
    Button: o,
    message: d,
    Row: c,
    Col: u,
    Drawer: b,
    Descriptions: y,
    Tag: h,
    Typography: k,
    Modal: z,
    Input: C,
    Select: B,
    Popconfirm: U,
    Space: j
  } = x().antd, {
    ReloadOutlined: Y,
    SearchOutlined: G,
    PlusOutlined: N,
    EditOutlined: J,
    DeleteOutlined: R,
    CopyOutlined: T,
    ExperimentOutlined: K
  } = x().antdIcons || {}, { Text: Q, Paragraph: S } = k, [f, g] = t([]), [P, $] = t(!0), [W, re] = t(""), [M, w] = t(!1), [m, q] = t(null), [ie, A] = t(!1), [H, D] = t(null), [Z, X] = t({}), [me, _] = t(!1), te = n(async () => {
    $(!0);
    try {
      const ee = await Bl();
      g(ee.engines || []);
    } catch (ee) {
      d.error(ee.message || "加载引擎列表失败"), g([]);
    } finally {
      $(!1);
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
        var E;
        return F.name.toLowerCase().includes(ee) || F.vendor.toLowerCase().includes(ee) || F.category.toLowerCase().includes(ee) || ((E = F.description) == null ? void 0 : E.toLowerCase().includes(ee));
      }
    );
  }, [f, W]);
  f.filter((ee) => ee.status === "detected").length;
  const ne = n((ee) => {
    navigator.clipboard.writeText(ee).then(() => d.success("路径已复制")).catch(() => d.error("复制失败"));
  }, []), v = n(() => {
    D(null), X({
      name: "",
      vendor: "",
      version: "",
      executable_path: "",
      category: "",
      description: "",
      invocation_hint: ""
    }), A(!0);
  }, []), ue = n((ee) => {
    D(ee), X({ ...ee }), A(!0), w(!1);
  }, []), pe = n(async () => {
    var ee;
    if (!((ee = Z.name) != null && ee.trim())) {
      d.warning("请输入引擎名称");
      return;
    }
    _(!0);
    try {
      H ? (await Ul(H.id, Z), d.success("引擎已更新")) : (await jl(Z), d.success("引擎已添加")), A(!1), te();
    } catch (F) {
      d.error(F.message || "保存失败");
    } finally {
      _(!1);
    }
  }, [Z, H, te]), we = n(
    async (ee) => {
      try {
        await Nl(ee), d.success("引擎已删除"), w(!1), te();
      } catch (F) {
        d.error(F.message || "删除失败");
      }
    },
    [te]
  ), Te = n(async () => {
    $(!0);
    try {
      const ee = await Dl();
      g(ee.engines || []), d.success("自动检测完成");
    } catch (ee) {
      d.error(ee.message || "检测失败");
    } finally {
      $(!1);
    }
  }, []), he = n(
    (ee, F, E) => {
      const ae = Z[F] || "";
      return e.createElement(
        "div",
        { style: { marginBottom: 12 } },
        e.createElement(
          Q,
          { style: { fontSize: 13, display: "block", marginBottom: 4 } },
          ee
        ),
        E != null && E.select ? e.createElement(B, {
          value: ae || void 0,
          onChange: (de) => X((ge) => ({ ...ge, [F]: de })),
          style: { width: "100%" },
          options: E.select.options,
          allowClear: !0,
          placeholder: `选择${ee}`
        }) : E != null && E.textarea ? e.createElement(C.TextArea, {
          value: ae,
          onChange: (de) => X((ge) => ({ ...ge, [F]: de.target.value })),
          rows: 3,
          placeholder: `输入${ee}`
        }) : e.createElement(C, {
          value: ae,
          onChange: (de) => X((ge) => ({ ...ge, [F]: de.target.value })),
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
          loading: P
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
    P ? e.createElement(
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
          e.createElement(Fl, {
            engine: ee,
            onClick: () => {
              q(ee), w(!0);
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
            qn.has(m.id) ? e.createElement("img", {
              src: Vn(m.id),
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
        open: M,
        onClose: () => w(!1),
        width: 520,
        extra: e.createElement(
          j,
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
            U,
            {
              title: "确认删除此引擎？",
              description: m.name,
              onConfirm: () => we(m.id),
              okText: "删除",
              cancelText: "取消",
              okButtonProps: { danger: !0 }
            },
            e.createElement(
              o,
              {
                size: "small",
                danger: !0,
                icon: R ? e.createElement(R) : void 0
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
          m.category ? Pt[m.category] || m.category : "—"
        ),
        e.createElement(
          y.Item,
          { label: "状态" },
          e.createElement(
            h,
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
              o,
              {
                size: "small",
                type: "text",
                icon: T ? e.createElement(T) : void 0,
                onClick: () => ne(m.executable_path)
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
              (ee) => e.createElement(
                "div",
                {
                  key: ee,
                  style: { display: "flex", alignItems: "center", gap: 8 }
                },
                e.createElement(
                  h,
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
          h,
          { color: "blue" },
          "默认引擎"
        ) : m.is_custom ? e.createElement(
          h,
          { color: "purple" },
          "自定义引擎"
        ) : null
      )
    ) : null,
    // Add/Edit modal
    e.createElement(
      z,
      {
        title: H ? "编辑引擎" : "添加引擎",
        open: ie,
        onOk: pe,
        onCancel: () => A(!1),
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
            options: Object.entries(Pt).map(([ee, F]) => ({
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
const Hl = Ll, Yn = /* @__PURE__ */ new Set(["tools", "engines", "skills"]);
function Wl(e) {
  try {
    const t = new URLSearchParams(window.location.search).get("tab");
    return t && Yn.has(t) ? t : e;
  } catch {
    return e;
  }
}
function Cn(e) {
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
function Ot({ page: e }) {
  const t = x().React, { useEffect: l, useState: n } = t, { Alert: a, Spin: r } = x().antd, [s, o] = n(null), [d, c] = n("");
  return l(() => {
    let u = !0;
    const b = x().loadBuiltinPage;
    return o(null), b ? (c(""), b(e).then((y) => {
      u && o(() => y);
    }).catch((y) => {
      u && c(
        y instanceof Error ? y.message : "加载原生管理页面失败"
      );
    }), () => {
      u = !1;
    }) : (c("当前 QwenPaw 版本不支持原生页面嵌入"), () => {
      u = !1;
    });
  }, [e]), d ? t.createElement(a, {
    type: "error",
    showIcon: !0,
    message: "原生管理功能加载失败",
    description: d
  }) : s ? t.createElement(s, { embedded: !0 }) : t.createElement(
    "div",
    { style: { padding: 56, textAlign: "center" } },
    t.createElement(
      r,
      { tip: "正在加载原生管理功能..." },
      t.createElement("div", { style: { minHeight: 24 } })
    )
  );
}
function Jl() {
  const e = x().React, { Tabs: t } = x().antd;
  return e.createElement(t, {
    defaultActiveKey: "mcp",
    items: [
      {
        key: "mcp",
        label: "MCP 接入",
        children: e.createElement(Ot, { page: "mcp" })
      },
      {
        key: "builtin",
        label: "平台内置",
        children: e.createElement(Ot, { page: "tools" })
      }
    ]
  });
}
function Kl() {
  const e = x().React, { Empty: t, Typography: l } = x().antd, { Paragraph: n } = l;
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
  const e = x().React, { Tabs: t } = x().antd;
  return e.createElement(t, {
    defaultActiveKey: "simulation",
    items: [
      {
        key: "simulation",
        label: "仿真软件",
        children: e.createElement(Gl)
      },
      {
        key: "domain",
        label: "领域计算",
        children: e.createElement(Kl)
      },
      {
        key: "runtime",
        label: "运行服务",
        children: e.createElement(Ot, { page: "acp" })
      }
    ]
  });
}
function Qn({
  initialTab: e = "tools"
} = {}) {
  var b, y;
  const t = x().React, { useEffect: l, useState: n } = t, { Tabs: a, Tag: r } = x().antd, s = (y = (b = x()).useSelectedAgent) == null ? void 0 : y.call(b), o = (s == null ? void 0 : s.id) || "default", [d, c] = n(
    () => Wl(e)
  );
  l(() => {
    try {
      const h = new URLSearchParams(window.location.search).get("tab");
      h && !Yn.has(h) && Cn(d);
    } catch {
    }
  }, [d]);
  const u = (h) => {
    c(h), Cn(h);
  };
  return t.createElement(
    "div",
    { style: { padding: 24 } },
    t.createElement(bt, {
      title: "工具·技能",
      subtitle: "管理当前专家可调用的工具、引擎、运行服务与专业技能",
      extra: t.createElement(
        r,
        { color: "blue" },
        `当前专家：${o}`
      )
    }),
    t.createElement(a, {
      activeKey: d,
      onChange: (h) => u(h),
      items: [
        {
          key: "tools",
          label: "工具",
          children: t.createElement(Jl)
        },
        {
          key: "engines",
          label: "引擎",
          children: t.createElement(Xl)
        },
        {
          key: "skills",
          label: "技能",
          children: t.createElement(Hl, {
            embedded: !0
          })
        }
      ]
    })
  );
}
const Zn = Qn;
function ql() {
  return x().React.createElement(Zn, {
    initialTab: "tools"
  });
}
function Vl() {
  return x().React.createElement(Zn, {
    initialTab: "skills"
  });
}
const Tn = {
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
function Yl(e) {
  if (!e.env) return !1;
  const t = Object.entries(e.env);
  return t.length === 0 ? !1 : t.some(([, l]) => typeof l == "string" && l.length > 0);
}
const ft = "ugsci.market.githubSources", _n = "https://github.com/anthropics/skills/tree/main/skills", ea = "https://ugsci-awesome-tools.oss-cn-beijing.aliyuncs.com", Ql = `${ea}/skills`;
function Zl(e) {
  const t = e.replace(/^\/+/, "");
  return ht(`/plugins/oss-proxy?path=${encodeURIComponent(t)}`);
}
function Et(e) {
  const t = e.replace(/^\/+/, "");
  return je(`/plugins/oss-proxy?path=${encodeURIComponent(t)}`);
}
async function Gt(e) {
  const t = e.replace(/^\/+/, ""), l = await Et(t);
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
function er(e) {
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
    iconUrl: e.icon_url ? Zl(e.icon_url) : void 0,
    category: e.category ? Qe(e.category) : "",
    description: e.description,
    transport: e.transport || "stdio",
    command: ((a = e.config) == null ? void 0 : a.command) || "",
    args: ((r = e.config) == null ? void 0 : r.args) || [],
    env: Object.keys(t).length > 0 ? t : void 0
  };
}
const ta = "ugsci.market.mcpSources", na = "ugsci.market.expertSources";
function aa(e, t) {
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
function la(e, t) {
  try {
    localStorage.setItem(e, JSON.stringify(t));
  } catch {
  }
}
function tr() {
  return aa(ta, "mcp");
}
function ut(e) {
  la(ta, e);
}
function nr() {
  return aa(na, "expert");
}
function pt(e) {
  la(na, e);
}
function ra(e) {
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
function sa(e, t, l, n = "github") {
  return n === "oss" ? `oss:${e}/${l || "/"}` : `${n}:${e}/${t}:${l || "/"}`;
}
function ar(e) {
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
function lr() {
  try {
    const e = localStorage.getItem(ft);
    if (!e) {
      const n = [], a = ra(_n);
      return a && n.push({
        id: sa(
          a.owner,
          a.repo,
          a.skillsPath,
          a.platform
        ),
        url: _n,
        label: a.label,
        owner: a.owner,
        repo: a.repo,
        ref: a.ref,
        skillsPath: a.skillsPath,
        enabled: !1,
        platform: a.platform
      }), localStorage.setItem(ft, JSON.stringify(n)), n;
    }
    const t = JSON.parse(e);
    if (!Array.isArray(t)) return [];
    const l = t.filter(
      (n) => n && typeof n.id == "string" && (typeof n.owner == "string" || n.platform === "oss") && !(n.platform === "oss" && n.url === Ql)
    ).map((n) => ({
      ...n,
      platform: n.platform || "github",
      owner: n.owner || "",
      repo: n.repo || "",
      ref: n.ref || "",
      skillsPath: n.skillsPath || ""
    }));
    return l.length !== t.length && localStorage.setItem(
      ft,
      JSON.stringify(l)
    ), l;
  } catch {
    return [];
  }
}
function gt(e) {
  try {
    localStorage.setItem(
      ft,
      JSON.stringify(e)
    );
  } catch {
  }
}
function rr(e) {
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
async function sr(e) {
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
      const u = e.skillsPath ? e.skillsPath + "/" : "", b = t ? `https://gitee.com/${e.owner}/${e.repo}/raw/${e.ref}/${u}${c.name}/SKILL.md` : `https://raw.githubusercontent.com/${e.owner}/${e.repo}/${e.ref}/${u}${c.name}/SKILL.md`, y = t ? `https://gitee.com/${e.owner}/${e.repo}/tree/${e.ref}/${u}${c.name}` : `https://github.com/${e.owner}/${e.repo}/tree/${e.ref}/${u}${c.name}`, h = {
        sourceId: e.id,
        sourceLabel: e.label,
        name: c.name,
        description: "",
        source_url: y,
        html_url: y,
        version: null,
        author: null
      };
      try {
        const k = {};
        t && e.accessToken && (k.Authorization = `token ${e.accessToken}`);
        const z = await fetch(b, {
          headers: k
        });
        if (!z.ok) return h;
        const C = await z.text(), B = rr(C);
        return {
          ...h,
          name: B.name || c.name,
          description: B.description || "",
          version: B.version || null,
          author: B.author || null
        };
      } catch {
        return h;
      }
    })
  );
}
async function or(e) {
  const t = ar(e.url);
  if (!t)
    throw new Error(`Invalid OSS URL: ${e.url}`);
  const { endpoint: l, prefix: n } = t, a = n.split("/").map(encodeURIComponent).join("/"), r = await Et(
    `${a}/manifest.json`
  );
  if (!r.ok)
    throw new Error(
      `无法获取技能列表: manifest.json (${r.status})`
    );
  const s = await r.json(), o = [];
  if (s && s.tag_groups && typeof s.tag_groups == "object")
    for (const [u, b] of Object.entries(s.tag_groups))
      Array.isArray(b) && o.push({
        id: u,
        label: Qe(u),
        tags: b
      });
  const d = [];
  function c(u, b) {
    for (const y of u) {
      if (y.type === "collection" && Array.isArray(y.children)) {
        c(y.children, y.name);
        continue;
      }
      const h = y.path || y.name || "";
      if (!h) continue;
      const k = h.split("/").map(encodeURIComponent).join("/"), z = `${l}/${a}/${k}`;
      let C = null;
      if (y.metadata) {
        const U = y.metadata.match(/version:\s*"?([\d.]+)"?/);
        U && (C = U[1]);
      }
      const B = b ? `${e.label}/${b}` : e.label;
      d.push({
        sourceId: e.id,
        sourceLabel: e.label,
        sourcePath: B,
        name: y.name || h.split("/").pop() || h,
        description: y.description || "",
        source_url: z,
        html_url: z,
        version: C,
        author: null,
        tag: y.tag || void 0,
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
async function ir() {
  const e = await Gt("mcp/manifest.json"), t = [], l = {};
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
async function cr() {
  const e = await Gt("skills/manifest.json"), t = [], l = /* @__PURE__ */ new Set();
  function n(a, r) {
    for (const s of a) {
      if ((s == null ? void 0 : s.type) === "collection" && Array.isArray(s.children)) {
        n(s.children, s.name || r);
        continue;
      }
      const o = String((s == null ? void 0 : s.path) || (s == null ? void 0 : s.name) || "").trim();
      if (!o) continue;
      const d = o.split("/").map(encodeURIComponent).join("/"), c = `${ea}/skills/${d}`, u = typeof s.tag == "string" && s.tag.trim() ? s.tag.trim() : void 0;
      u && l.add(u);
      let b = null;
      if (typeof s.metadata == "string") {
        const y = s.metadata.match(/version:\s*"?([\d.]+)"?/);
        y && (b = y[1]);
      }
      t.push({
        sourceId: "oss:ugsci-official",
        sourceLabel: "UGSci",
        sourcePath: r ? `UGSci/${r}` : "UGSci",
        name: s.name || o.split("/").pop() || o,
        description: s.description || "",
        source_url: c,
        html_url: c,
        version: b,
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
async function dr() {
  const e = await Gt("agents/manifest.json"), t = [], l = {};
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
async function mr(e) {
  const t = e.filter((s) => s.enabled), l = await Promise.all(
    t.map(async (s) => {
      try {
        if (s.platform === "oss") {
          const { skills: o, categories: d } = await or(s);
          return { skills: o, categories: d, error: null, label: s.label };
        } else
          return { skills: await sr(s), categories: [], error: null, label: s.label };
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
function ur({
  open: e,
  onClose: t,
  sources: l,
  onChange: n
}) {
  const a = x().React, { useState: r } = a, {
    Modal: s,
    Input: o,
    Button: d,
    List: c,
    Tag: u,
    Switch: b,
    Typography: y,
    Tooltip: h,
    message: k
  } = x().antd, {
    PlusOutlined: z,
    DeleteOutlined: C,
    LinkOutlined: B,
    GithubOutlined: U
  } = x().antdIcons || {}, { Text: j } = y, [Y, G] = r(""), [N, J] = r(""), R = () => {
    const S = Y.trim();
    if (!S) return;
    const f = ra(S);
    if (!f) {
      k.error("无效的仓库 URL，请输入类似 https://github.com/owner/repo/tree/main/skills 或 https://gitee.com/owner/repo/tree/master/skills 的链接");
      return;
    }
    const g = sa(f.owner, f.repo, f.skillsPath, f.platform);
    if (l.some((W) => W.id === g)) {
      k.warning("该源已存在");
      return;
    }
    const P = {
      id: g,
      url: S,
      label: f.label,
      owner: f.owner,
      repo: f.repo,
      ref: f.ref,
      skillsPath: f.skillsPath,
      enabled: !0,
      platform: f.platform,
      accessToken: N.trim() || void 0
    }, $ = [...l, P];
    gt($), n($), G(""), J(""), k.success(`已添加源: ${f.label}`);
  }, T = (S, f) => {
    const g = l.map(
      (P) => P.id === S ? { ...P, enabled: f } : P
    );
    gt(g), n(g);
  }, K = (S, f) => {
    const g = l.map(
      (P) => P.id === S ? { ...P, accessToken: f.trim() || void 0 } : P
    );
    gt(g), n(g);
  }, Q = (S) => {
    const f = l.filter((g) => g.id !== S);
    gt(f), n(f), k.success("已移除源");
  };
  return a.createElement(
    s,
    {
      open: e,
      onCancel: t,
      title: a.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 8 } },
        U ? a.createElement(U, { style: { fontSize: 18 } }) : null,
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
        j,
        { type: "secondary", style: { fontSize: 12, display: "block", marginBottom: 8 } },
        "添加 GitHub 或 Gitee 仓库作为技能源，系统将从该仓库的指定目录获取技能列表。支持格式："
      ),
      a.createElement(
        "div",
        { style: { display: "flex", gap: 8, alignItems: "center" } },
        a.createElement(o, {
          placeholder: "https://github.com/owner/repo/tree/main/skills 或 https://gitee.com/owner/repo/tree/master/skills",
          value: Y,
          onChange: (S) => G(S.target.value),
          onPressEnter: R,
          prefix: B ? a.createElement(B) : void 0,
          style: { flex: 1 }
        }),
        a.createElement(
          d,
          {
            type: "primary",
            icon: z ? a.createElement(z) : void 0,
            onClick: R
          },
          "添加"
        )
      ),
      // Gitee token input (shown when URL looks like a Gitee link)
      Y.trim() && Y.trim().toLowerCase().includes("gitee.com") ? a.createElement(
        "div",
        { style: { marginTop: 8, display: "flex", gap: 8, alignItems: "center" } },
        a.createElement(
          j,
          { type: "secondary", style: { fontSize: 12, whiteSpace: "nowrap" } },
          "Gitee Token:"
        ),
        a.createElement(o.Password, {
          placeholder: "私有仓库请填写 Gitee 私人令牌（可选）",
          value: N,
          onChange: (S) => J(S.target.value),
          style: { flex: 1 }
        })
      ) : null
    ),
    a.createElement(
      "div",
      { style: { marginBottom: 8, display: "flex", alignItems: "center", justifyContent: "space-between" } },
      a.createElement(j, { strong: !0 }, `已配置源 (${l.length})`)
    ),
    a.createElement(c, {
      size: "small",
      bordered: !0,
      dataSource: l,
      renderItem: (S) => a.createElement(
        c.Item,
        {
          actions: [
            a.createElement(
              h,
              { title: S.enabled ? "点击禁用" : "点击启用" },
              a.createElement(b, {
                size: "small",
                checked: S.enabled,
                onChange: (f) => T(S.id, f)
              })
            ),
            a.createElement(
              h,
              { title: "移除此源" },
              a.createElement(
                d,
                {
                  size: "small",
                  type: "text",
                  danger: !0,
                  icon: C ? a.createElement(C) : void 0,
                  onClick: () => Q(S.id)
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
              { color: S.platform === "gitee" ? "orange" : S.platform === "oss" ? "green" : "blue", style: { fontSize: 11 } },
              S.platform === "gitee" ? "Gitee" : S.platform === "oss" ? "OSS" : "GitHub"
            ),
            a.createElement(
              u,
              { style: { fontSize: 11 } },
              S.label
            ),
            S.skillsPath ? a.createElement(
              j,
              { type: "secondary", style: { fontSize: 11 } },
              `/${S.skillsPath}`
            ) : null,
            S.platform !== "oss" ? a.createElement(
              j,
              { type: "secondary", style: { fontSize: 11 } },
              `@${S.ref}`
            ) : null
          ),
          a.createElement(
            j,
            {
              type: "secondary",
              style: { fontSize: 11, wordBreak: "break-all" }
            },
            S.url
          ),
          // Gitee token input for existing Gitee sources
          S.platform === "gitee" ? a.createElement(
            "div",
            { style: { marginTop: 6, display: "flex", gap: 6, alignItems: "center" } },
            a.createElement(
              j,
              { type: "secondary", style: { fontSize: 11, whiteSpace: "nowrap" } },
              "Token:"
            ),
            a.createElement(o.Password, {
              size: "small",
              placeholder: "Gitee 私人令牌（可选，用于私有仓库）",
              value: S.accessToken || "",
              onChange: (f) => K(S.id, f.target.value),
              style: { flex: 1 }
            })
          ) : null
        )
      )
    })
  );
}
function In({
  open: e,
  onClose: t,
  sources: l,
  onChange: n,
  type: a
}) {
  const r = x().React, { useState: s } = r, {
    Modal: o,
    Input: d,
    Button: c,
    List: u,
    Tag: b,
    Switch: y,
    Typography: h,
    Tooltip: k,
    message: z
  } = x().antd, {
    PlusOutlined: C,
    DeleteOutlined: B,
    LinkOutlined: U,
    ApiOutlined: j,
    UserOutlined: Y,
    ImportOutlined: G,
    ExportOutlined: N,
    CopyOutlined: J
  } = x().antdIcons || {}, { Text: R } = h, [T, K] = s(""), [Q, S] = s(""), [f, g] = s(""), [P, $] = s(!1), W = a === "mcp" ? "MCP" : "专家模板", re = a === "mcp" ? j ? r.createElement(j, { style: { fontSize: 18 } }) : null : Y ? r.createElement(Y, { style: { fontSize: 18 } }) : null, M = () => {
    const A = T.trim(), H = Q.trim();
    if (!A) return;
    const D = H || A.slice(0, 40), Z = `${a}:${A}`;
    if (l.some((_) => _.id === Z)) {
      z.warning("该源已存在");
      return;
    }
    const X = {
      id: Z,
      label: D,
      url: A,
      enabled: !0,
      type: a
    }, me = [...l, X];
    a === "mcp" ? ut(me) : pt(me), n(me), K(""), S(""), z.success(`已添加${W}源: ${D}`);
  }, w = (A, H) => {
    const D = l.map(
      (Z) => Z.id === A ? { ...Z, enabled: H } : Z
    );
    a === "mcp" ? ut(D) : pt(D), n(D);
  }, m = (A) => {
    const H = l.filter((D) => D.id !== A);
    a === "mcp" ? ut(H) : pt(H), n(H), z.success("已移除源");
  }, q = () => {
    const A = JSON.stringify(
      { type: a, sources: l },
      null,
      2
    );
    try {
      navigator.clipboard.writeText(A), z.success(`${W}源已复制到剪贴板（${l.length} 个源）`);
    } catch {
      const H = document.createElement("textarea");
      H.value = A, document.body.appendChild(H), H.select(), document.execCommand("copy"), document.body.removeChild(H), z.success(`${W}源已复制到剪贴板（${l.length} 个源）`);
    }
  }, ie = () => {
    const A = f.trim();
    if (!A) {
      z.warning("请粘贴 JSON 内容");
      return;
    }
    try {
      const H = JSON.parse(A);
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
        z.error("未找到有效的源数据");
        return;
      }
      const X = new Set(l.map((te) => te.id)), me = [];
      for (const te of Z) {
        const le = te.id || `${a}:${te.url}`;
        X.has(le) || me.push({
          id: le,
          label: te.label,
          url: te.url,
          enabled: te.enabled !== !1,
          type: a
        });
      }
      if (me.length === 0) {
        z.info("所有源均已存在，无新增");
        return;
      }
      const _ = [...l, ...me];
      a === "mcp" ? ut(_) : pt(_), n(_), g(""), $(!1), z.success(`成功导入 ${me.length} 个${W}源`);
    } catch (H) {
      z.error(`JSON 解析失败: ${H.message || "格式错误"}`);
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
              onClick: q,
              disabled: l.length === 0,
              size: "small"
            },
            "导出到剪贴板"
          ),
          r.createElement(
            c,
            {
              icon: G ? r.createElement(G) : void 0,
              onClick: () => $(!P),
              size: "small"
            },
            P ? "隐藏导入" : "导入JSON"
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
      R,
      { type: "secondary", style: { fontSize: 12, display: "block", marginBottom: 12 } },
      `配置${W}源地址，支持从远程仓库或团队共享的 JSON 导入${W}配置。`
    ),
    // Import section (collapsible)
    P ? r.createElement(
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
        R,
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
        onChange: (A) => g(A.target.value),
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
        onChange: (A) => S(A.target.value),
        style: { width: 200 }
      }),
      r.createElement(d, {
        placeholder: a === "mcp" ? "https://raw.githubusercontent.com/team/mcp-registry/main/mcp.json" : "https://raw.githubusercontent.com/team/expert-registry/main/experts.json",
        value: T,
        onChange: (A) => K(A.target.value),
        onPressEnter: M,
        prefix: U ? r.createElement(U) : void 0,
        style: { flex: 1 }
      }),
      r.createElement(
        c,
        {
          type: "primary",
          icon: C ? r.createElement(C) : void 0,
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
        R,
        { strong: !0 },
        `已配置源 (${l.length})`
      )
    ),
    r.createElement(u, {
      size: "small",
      bordered: !0,
      dataSource: l,
      renderItem: (A) => r.createElement(
        u.Item,
        {
          actions: [
            r.createElement(
              k,
              { title: A.enabled ? "点击禁用" : "点击启用" },
              r.createElement(y, {
                size: "small",
                checked: A.enabled,
                onChange: (H) => w(A.id, H)
              })
            ),
            r.createElement(
              k,
              { title: "移除此源" },
              r.createElement(
                c,
                {
                  size: "small",
                  type: "text",
                  danger: !0,
                  icon: B ? r.createElement(B) : void 0,
                  onClick: () => m(A.id)
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
                color: a === "mcp" ? "purple" : "blue",
                style: { fontSize: 11 }
              },
              A.label
            ),
            A.enabled ? null : r.createElement(
              b,
              { style: { fontSize: 10 } },
              "已禁用"
            )
          ),
          r.createElement(
            R,
            {
              type: "secondary",
              style: { fontSize: 11, wordBreak: "break-all" }
            },
            A.url
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
async function pr() {
  return se("/market/providers");
}
async function gr(e) {
  return se(
    `/market/categories?lang=${encodeURIComponent(e)}`
  );
}
async function fr(e, t, l, n, a) {
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
function zn(e) {
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
async function An(e, t) {
  const l = { bundle_url: e };
  return t && (l.access_token = t), se("/skills/pool/import", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(l)
  });
}
function yr() {
  const e = x().React, { useState: t, useEffect: l, useCallback: n, useMemo: a, useRef: r } = e, {
    Spin: s,
    Empty: o,
    Input: d,
    Button: c,
    message: u,
    Row: b,
    Col: y,
    Card: h,
    Tag: k,
    Tooltip: z,
    Typography: C,
    Select: B,
    Drawer: U,
    Descriptions: j,
    Tabs: Y,
    Badge: G,
    Progress: N,
    Modal: J,
    Alert: R
  } = x().antd, {
    ReloadOutlined: T,
    SearchOutlined: K,
    DownloadOutlined: Q,
    AppstoreOutlined: S,
    ShopOutlined: f,
    CheckCircleOutlined: g,
    LoadingOutlined: P,
    UserOutlined: $,
    UserAddOutlined: W,
    SettingOutlined: re,
    GithubOutlined: M,
    ApiOutlined: w
  } = x().antdIcons || {}, { Text: m, Paragraph: q, Title: ie } = C, [A, H] = t("skills"), [D, Z] = t([]), [X, me] = t([]), [_, te] = t([]), [le, ne] = t(""), [v, ue] = t(""), [pe, we] = t(!1), [Te, he] = t(!1), [ee, F] = t(
    {}
  ), [E, ae] = t(null), [de, ge] = t({}), [L, p] = t([]), [ce, ye] = t(""), [be, xe] = t(""), [Ie, Be] = t(""), [_e, Re] = t({}), [Me, Ue] = t(""), [Ne, De] = t(/* @__PURE__ */ new Set()), [Se, Pe] = t(null), [V, ke] = t({}), [ze, Oe] = t([]), [Je, Ke] = t([]), [ve, st] = t([]), [xt, Ze] = t(""), [Fe, ot] = t(!1), [oa, Ht] = t(!1), [ia, Wt] = t([]), [ca, Jt] = t(!1), [da, Kt] = t([]), [ma, Xt] = t(!1), [qt, Vt] = t([]), [Yt, Qt] = t([]), [Zt, en] = t(!1), [Xe, tn] = t(""), [nn, an] = t([]), [ln, rn] = t([]), [sn, on] = t(!1), [qe, cn] = t(""), [kt, dn] = t(!1), [$e, it] = t(null), [et, ua] = t([]), tt = r(null);
  l(() => {
    Promise.all([
      pr().catch(() => []),
      gr("zh").catch(() => []),
      wt().catch(() => [])
    ]).then(([i, I, O]) => {
      Z(i), me(I), p(O), O.length > 0 && (ye(O[0].id), Ue(O[0].id));
    });
  }, []);
  const ct = n(async (i) => {
    const I = i ?? lr();
    if (Oe(i || I), I.filter((oe) => oe.enabled).length === 0) {
      Ke([]);
      return;
    }
    ot(!0);
    try {
      const { skills: oe, errors: fe, categories: Ce } = await mr(I);
      if (Ke(oe), ua(Ce), fe.length > 0) {
        for (const Ee of fe)
          console.warn(`[ugsci] GitHub source '${Ee.label}' error: ${Ee.message}`);
        u.warning(
          `部分源加载失败: ${fe.map((Ee) => Ee.label).join(", ")}`
        );
      }
    } catch (oe) {
      u.error(oe.message || "加载技能源失败"), Ke([]);
    } finally {
      ot(!1);
    }
  }, []), Ct = n(async () => {
    var oe, fe, Ce;
    en(!0), on(!0), ot(!0);
    const [i, I, O] = await Promise.allSettled([
      ir(),
      dr(),
      cr()
    ]);
    if (i.status === "fulfilled" ? (Vt(i.value.servers), Qt(i.value.categories)) : (console.warn(`[ugsci] MCP manifest error: ${((oe = i.reason) == null ? void 0 : oe.message) || i.reason}`), Vt([]), Qt([])), en(!1), I.status === "fulfilled" ? (an(I.value.agents), rn(I.value.categories)) : (console.warn(`[ugsci] Agents manifest error: ${((fe = I.reason) == null ? void 0 : fe.message) || I.reason}`), an([]), rn([])), on(!1), O.status === "fulfilled")
      st(O.value.skills), Ze("");
    else {
      const Ee = ((Ce = O.reason) == null ? void 0 : Ce.message) || String(O.reason);
      console.warn(`[ugsci] Skills manifest error: ${Ee}`), st([]), Ze(Ee);
    }
    ot(!1);
  }, []);
  l(() => {
    ct(), Ct(), Wt(tr()), Kt(nr());
  }, [ct, Ct]);
  const dt = n(
    async (i, I, O) => {
      we(!0);
      try {
        const oe = await fr(
          i,
          O,
          20,
          "zh",
          I || void 0
        );
        O === void 0 || Object.keys(O).length === 0 ? te(oe.results) : te((Ee) => [...Ee, ...oe.results]);
        const fe = Object.values(oe.by_provider || {}).some(
          (Ee) => Ee.has_more
        );
        he(fe);
        const Ce = {};
        for (const [Ee, Ge] of Object.entries(oe.by_provider || {}))
          Ce[Ee] = (O[Ee] || 1) + 1;
        if (F(Ce), oe.errors.length > 0)
          for (const Ee of oe.errors)
            console.warn(
              `[ugsci] Market provider '${Ee.provider}' error: ${Ee.message}`
            );
      } catch (oe) {
        u.error(oe.message || "搜索市场失败"), te([]);
      } finally {
        we(!1);
      }
    },
    []
  );
  l(() => (tt.current && clearTimeout(tt.current), tt.current = setTimeout(() => {
    dt(le, v, {});
  }, 400), () => {
    tt.current && clearTimeout(tt.current);
  }), [le, v, dt]);
  const pa = () => {
    dt(le, v, ee);
  }, mn = async (i) => {
    const I = `${i.source}:${i.slug}`;
    try {
      ge((oe) => ({ ...oe, [I]: "installing" }));
      const O = await An(i.source_url);
      O.installed && u.success(
        `技能「${O.name || i.name}」已安装到技能池，可在技能中心查看`
      ), ge((oe) => {
        const fe = { ...oe };
        return delete fe[I], fe;
      });
    } catch (O) {
      u.error(zn(O) || "安装技能失败"), ge((oe) => {
        const fe = { ...oe };
        return delete fe[I], fe;
      });
    }
  }, ga = (i) => {
    window.history.pushState({}, "", i), window.dispatchEvent(new PopStateEvent("popstate"));
  }, fa = async (i) => {
    const I = `github:${i.sourceId}:${i.name}`, O = ze.find((fe) => fe.id === i.sourceId), oe = (O == null ? void 0 : O.accessToken) || void 0;
    try {
      ge((Ce) => ({ ...Ce, [I]: "installing" }));
      const fe = await An(i.source_url, oe);
      fe.installed && u.success(
        `技能「${fe.name || i.name}」已安装到技能池，可在技能中心查看`
      ), ge((Ce) => {
        const Ee = { ...Ce };
        return delete Ee[I], Ee;
      });
    } catch (fe) {
      u.error(zn(fe) || "安装技能失败"), ge((Ce) => {
        const Ee = { ...Ce };
        return delete Ee[I], Ee;
      });
    }
  }, We = a(() => {
    const i = [], I = /* @__PURE__ */ new Set();
    for (const O of [...ve, ...Je]) {
      const oe = O.source_url || `${O.sourceLabel}:${O.name}`;
      I.has(oe) || (I.add(oe), i.push(O));
    }
    return i;
  }, [ve, Je]), un = a(() => {
    const i = [], I = /* @__PURE__ */ new Set();
    if (et.length > 0)
      for (const O of et)
        I.has(O.id) || (I.add(O.id), i.push(O));
    for (const O of We)
      O.tag && !I.has(O.tag) && (I.add(O.tag), i.push({ id: O.tag, label: O.tag }));
    for (const O of We)
      !O.isOfficial && O.sourceLabel && !I.has(O.sourceLabel) && (I.add(O.sourceLabel), i.push({ id: O.sourceLabel, label: O.sourceLabel }));
    return i;
  }, [We, et]), Tt = a(() => {
    let i = We;
    if (v) {
      const I = et.find((O) => O.id === v);
      I && I.tags ? i = i.filter(
        (O) => O.tag && I.tags.includes(O.tag) || O.sourceLabel === v
      ) : i = i.filter(
        (O) => O.tag === v || O.sourceLabel === v
      );
    }
    if (le.trim()) {
      const I = le.toLowerCase();
      i = i.filter(
        (O) => {
          var oe;
          return O.name.toLowerCase().includes(I) || ((oe = O.description) == null ? void 0 : oe.toLowerCase().includes(I));
        }
      );
    }
    return i;
  }, [We, le, v, et]), pn = D.filter((i) => i.available), Ve = a(() => v ? _.filter((i) => {
    const I = pn.find((O) => O.key === i.source);
    return (I == null ? void 0 : I.label) === v;
  }) : _, [_, v, pn]), ya = e.createElement(
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
          icon: M ? e.createElement(M) : void 0,
          onClick: () => Ht(!0),
          size: "small"
        },
        "配置技能源"
      )
    ),
    // Dynamic category filter tags (from OSS manifest tags + imported sources)
    xt && We.length === 0 ? e.createElement(R, {
      type: "warning",
      showIcon: !0,
      message: "UGSci 官方 OSS 技能库加载失败",
      description: "请检查网络或后端 OSS 代理服务，然后点击右上角“刷新”重试。",
      style: { marginBottom: 12 }
    }) : null,
    un.length > 0 ? e.createElement(
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
        k,
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
      ...un.map((i) => {
        const I = Je.some(
          (O) => !O.isOfficial && O.sourceLabel === i.id
        );
        return e.createElement(
          k,
          {
            key: i.id,
            style: {
              fontSize: 11,
              cursor: "pointer",
              borderRadius: 12
            },
            color: v === i.id ? I ? "blue" : "geekblue" : void 0,
            icon: I && M ? e.createElement(M) : void 0,
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
    ) : Tt.length > 0 ? e.createElement(
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
          m,
          { strong: !0, style: { fontSize: 13 } },
          `技能市场 (${Tt.length})`
        )
      ),
      e.createElement(
        b,
        { gutter: [12, 12] },
        ...Tt.map((i) => {
          const I = `github:${i.sourceId}:${i.name}`, O = de[I];
          return e.createElement(
            y,
            { key: I, xs: 24, sm: 12, md: 8, lg: 6 },
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
                M ? e.createElement(M, {
                  style: { fontSize: 18, color: "#57606a" }
                }) : e.createElement(
                  "span",
                  { style: { fontSize: 18 } },
                  "📦"
                ),
                e.createElement(
                  z,
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
                q,
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
                    w ? e.createElement(w, { style: { fontSize: 10 } }) : null,
                    i.sourcePath || i.sourceLabel
                  ) : null,
                  // Show tag as category badge
                  i.tag ? e.createElement(
                    k,
                    { color: "geekblue", style: { fontSize: 10 } },
                    i.tag
                  ) : null,
                  i.version ? e.createElement(
                    k,
                    { style: { fontSize: 10 } },
                    `v${i.version}`
                  ) : null
                ),
                O ? e.createElement(
                  c,
                  {
                    size: "small",
                    disabled: !0,
                    icon: P ? e.createElement(P) : void 0
                  },
                  "安装中"
                ) : e.createElement(
                  c,
                  {
                    type: "primary",
                    size: "small",
                    icon: Q ? e.createElement(Q) : void 0,
                    onClick: () => fa(i)
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
      b,
      { gutter: [12, 12] },
      ...Ve.map((i) => {
        const I = `${i.source}:${i.slug}`, O = de[I];
        return e.createElement(
          y,
          { key: I, xs: 24, sm: 12, md: 8, lg: 6 },
          e.createElement(
            h,
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
                z,
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
              q,
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
                  k,
                  { color: "geekblue", style: { fontSize: 10 } },
                  i.source
                ),
                i.version ? e.createElement(
                  k,
                  { style: { fontSize: 10 } },
                  `v${i.version}`
                ) : null
              ),
              O ? e.createElement(
                c,
                {
                  size: "small",
                  disabled: !0,
                  icon: P ? e.createElement(P) : void 0
                },
                "安装中"
              ) : e.createElement(
                c,
                {
                  type: "primary",
                  size: "small",
                  icon: Q ? e.createElement(Q) : void 0,
                  onClick: (oe) => {
                    oe.stopPropagation(), mn(i);
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
        { onClick: pa, loading: pe },
        "加载更多"
      )
    ) : null,
    // Detail Drawer
    E ? e.createElement(
      U,
      {
        title: e.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 8 } },
          E.icon_url ? e.createElement("img", {
            src: E.icon_url,
            alt: E.name,
            style: { width: 28, height: 28, borderRadius: 4 }
          }) : e.createElement(
            "span",
            { style: { fontSize: 20 } },
            "📦"
          ),
          e.createElement("span", null, E.name)
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
              mn(E);
            }
          },
          "安装到技能池"
        )
      },
      e.createElement(
        j,
        { column: 1, bordered: !0, size: "small" },
        e.createElement(
          j.Item,
          { label: "来源" },
          E.source
        ),
        e.createElement(
          j.Item,
          { label: "描述" },
          E.description || "-"
        ),
        E.version ? e.createElement(
          j.Item,
          { label: "版本" },
          E.version
        ) : null,
        E.author ? e.createElement(
          j.Item,
          { label: "作者" },
          E.author
        ) : null,
        e.createElement(
          j.Item,
          { label: "来源链接" },
          e.createElement(
            "a",
            { href: E.source_url, target: "_blank" },
            E.source_url
          )
        )
      ),
      E.stats ? e.createElement(
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
          ...Object.entries(E.stats).map(
            ([i, I]) => e.createElement(
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
                String(I)
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
  ), _t = a(() => {
    let i = nn;
    if (qe && (i = i.filter((I) => I.category === qe)), be.trim()) {
      const I = be.toLowerCase();
      i = i.filter(
        (O) => O.name.toLowerCase().includes(I) || O.description.toLowerCase().includes(I) || O.tags.some((oe) => oe.toLowerCase().includes(I))
      );
    }
    return i;
  }, [nn, be, qe]), Ea = async (i) => {
    if (!kt) {
      dn(!0);
      try {
        let I = i.description;
        if (i.instructions)
          try {
            const fe = i.instructions.replace(/^\/+/, ""), Ce = await Et(fe);
            Ce.ok && (I = await Ce.text());
          } catch {
          }
        let O = [];
        if (i.skills_manifest)
          try {
            const fe = i.skills_manifest.replace(/^\/+/, ""), Ce = await Et(fe);
            if (Ce.ok) {
              const Ee = await Ce.json();
              Array.isArray(Ee) ? O = Ee.map((Ge) => typeof Ge == "string" ? Ge : Ge.name).filter(Boolean) : Ee.skills && (O = Ee.skills.map((Ge) => typeof Ge == "string" ? Ge : Ge.name).filter(Boolean));
            }
          } catch {
          }
        const oe = await se("/agents", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: i.name,
            description: i.description,
            skill_names: O
          })
        });
        await yt(oe.id, "AGENTS.md", I), u.success(`专家「${i.name}」创建成功，已跳转至专家`), ga("/ugsci-experts");
      } catch (I) {
        u.error(I.message || "创建专家失败");
      } finally {
        dn(!1);
      }
    }
  }, gn = n(async (i) => {
    if (i)
      try {
        const I = await Ut(i);
        De(new Set(I.map((O) => O.key)));
      } catch {
        De(/* @__PURE__ */ new Set());
      }
  }, []);
  l(() => {
    Me && gn(Me);
  }, [Me, gn]);
  const ha = async (i) => {
    if (!Me) {
      u.warning("请先选择目标专家");
      return;
    }
    if (Yl(i)) {
      const I = Object.entries(i.env), O = {};
      for (const [oe] of I)
        O[oe] = "";
      ke(O), Pe(i);
      return;
    }
    await fn(i, i.env || {});
  }, fn = async (i, I) => {
    Re((O) => ({ ...O, [i.id]: !0 }));
    try {
      const O = i.id;
      await Bn(Me, {
        client_key: O,
        client: {
          name: i.name,
          description: i.description,
          enabled: !0,
          transport: i.transport,
          url: i.url || "",
          command: i.command || "",
          args: i.args || [],
          env: I,
          cwd: i.cwd || "",
          headers: i.headers || {}
        }
      }), u.success(`MCP「${i.name}」已添加到当前专家`), De((oe) => new Set(oe).add(O));
    } catch (O) {
      u.error(O.message || `添加 MCP「${i.name}」失败`);
    } finally {
      Re((O) => ({ ...O, [i.id]: !1 }));
    }
  }, va = async () => {
    if (!Se) return;
    const i = [];
    for (const [O, oe] of Object.entries(V))
      if (!oe || !oe.trim()) {
        const fe = Tn[O];
        i.push((fe == null ? void 0 : fe.label) || O);
      }
    if (i.length > 0) {
      u.warning(`请填写以下配置项: ${i.join(", ")}`);
      return;
    }
    const I = Se;
    Pe(null), ke({}), await fn(I, { ...V });
  }, It = a(() => {
    let i = qt;
    if (Xe && (i = i.filter((I) => I.category === Xe)), Ie.trim()) {
      const I = Ie.toLowerCase();
      i = i.filter(
        (O) => O.name.toLowerCase().includes(I) || O.description.toLowerCase().includes(I) || O.tags.some((oe) => oe.toLowerCase().includes(I))
      );
    }
    return i.map(er);
  }, [qt, Ie, Xe]), ba = e.createElement(
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
        e.createElement(B, {
          value: Me,
          onChange: (i) => Ue(i),
          style: { minWidth: 180 },
          size: "small",
          options: L.map((i) => ({ value: i.id, label: i.name }))
        })
      ),
      // Configure MCP source button
      e.createElement(
        c,
        {
          icon: w ? e.createElement(w) : void 0,
          onClick: () => Jt(!0),
          size: "small"
        },
        "配置 MCP 源"
      )
    ),
    // Dynamic category tag row (from OSS manifest tag_groups)
    Yt.length > 0 ? e.createElement(
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
        k,
        {
          style: { fontSize: 11, cursor: "pointer", borderRadius: 12 },
          color: Xe === "" ? "blue" : void 0,
          onClick: () => tn("")
        },
        "全部"
      ),
      ...Yt.map(
        (i) => e.createElement(
          k,
          {
            key: i.id,
            style: { fontSize: 11, cursor: "pointer", borderRadius: 12 },
            color: Xe === i.id ? "geekblue" : void 0,
            onClick: () => tn(
              Xe === i.id ? "" : i.id
            )
          },
          i.label
        )
      )
    ) : null,
    // MCP server cards (dynamic from OSS)
    Zt && It.length === 0 ? e.createElement(
      "div",
      { style: { textAlign: "center", padding: 40 } },
      e.createElement(s, { size: "large" }, e.createElement("div", { style: { minHeight: 60, display: "flex", alignItems: "center", justifyContent: "center" } }, "正在加载 MCP 服务器..."))
    ) : It.length === 0 ? e.createElement(o, {
      description: "未找到匹配的 MCP 服务器",
      image: o.PRESENTED_IMAGE_SIMPLE
    }) : e.createElement(
      b,
      { gutter: [12, 12] },
      ...It.map(
        (i) => e.createElement(
          y,
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
                  onError: (I) => {
                    I.target.style.display = "none";
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
                    k,
                    { color: "blue", style: { fontSize: 10 } },
                    i.category
                  ),
                  e.createElement(
                    k,
                    {
                      color: i.transport === "stdio" ? "purple" : "cyan",
                      style: { fontSize: 10 }
                    },
                    i.transport
                  ),
                  i.env && Object.keys(i.env).length > 0 ? e.createElement(
                    k,
                    { color: "orange", style: { fontSize: 10 } },
                    "需配置密钥"
                  ) : null
                )
              )
            ),
            // Description
            e.createElement(
              q,
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
                  icon: w ? e.createElement(w) : void 0,
                  onClick: () => ha(i)
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
  ), wa = Se ? e.createElement(
    J,
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
        Pe(null), ke({});
      },
      onOk: va,
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
    ...Object.entries(Se.env || {}).map(([i]) => {
      const I = Tn[i], O = (I == null ? void 0 : I.isSecret) !== !1;
      return e.createElement(
        "div",
        { key: i, style: { marginBottom: 16 } },
        e.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 6, marginBottom: 4 } },
          e.createElement(
            m,
            { strong: !0, style: { fontSize: 13 } },
            (I == null ? void 0 : I.label) || i
          ),
          e.createElement(
            k,
            { color: "orange", style: { fontSize: 10 } },
            "必填"
          )
        ),
        // Help text with optional link
        I ? e.createElement(
          "div",
          { style: { marginBottom: 6, fontSize: 12, color: "#8c8c8c" } },
          I.help,
          I.link ? e.createElement(
            "a",
            {
              href: I.link,
              target: "_blank",
              rel: "noopener noreferrer",
              style: { marginLeft: 4, fontSize: 12 }
            },
            "获取方式 ↗"
          ) : null
        ) : null,
        // Input field
        O ? e.createElement(d.Password, {
          placeholder: `请输入 ${(I == null ? void 0 : I.label) || i}`,
          value: V[i] || "",
          onChange: (oe) => ke((fe) => ({
            ...fe,
            [i]: oe.target.value
          })),
          style: { width: "100%" }
        }) : e.createElement(d, {
          placeholder: `请输入 ${(I == null ? void 0 : I.label) || i}`,
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
  ) : null, Sa = e.createElement(
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
          icon: $ ? e.createElement($) : void 0,
          onClick: () => Xt(!0),
          size: "small"
        },
        "配置专家源"
      )
    ),
    // Dynamic category tag row (from OSS manifest tag_groups)
    ln.length > 0 ? e.createElement(
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
        k,
        {
          style: { fontSize: 11, cursor: "pointer", borderRadius: 12 },
          color: qe === "" ? "blue" : void 0,
          onClick: () => cn("")
        },
        "全部"
      ),
      ...ln.map(
        (i) => e.createElement(
          k,
          {
            key: i.id,
            style: { fontSize: 11, cursor: "pointer", borderRadius: 12 },
            color: qe === i.id ? "geekblue" : void 0,
            onClick: () => cn(
              qe === i.id ? "" : i.id
            )
          },
          i.label
        )
      )
    ) : null,
    // Agent cards (dynamic from OSS)
    sn && _t.length === 0 ? e.createElement(
      "div",
      { style: { textAlign: "center", padding: 40 } },
      e.createElement(s, { size: "large" }, e.createElement("div", { style: { minHeight: 60, display: "flex", alignItems: "center", justifyContent: "center" } }, "正在加载人才市场..."))
    ) : _t.length === 0 ? e.createElement(o, {
      description: "未找到匹配的人才",
      image: o.PRESENTED_IMAGE_SIMPLE
    }) : e.createElement(
      b,
      { gutter: [12, 12] },
      ..._t.map(
        (i) => e.createElement(
          y,
          { key: i.id, xs: 24, sm: 12, md: 8 },
          e.createElement(
            h,
            {
              hoverable: !0,
              size: "small",
              style: { height: "100%", cursor: "pointer" },
              onClick: () => it(i)
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
                    k,
                    { color: "blue", style: { fontSize: 10 } },
                    Qe(i.category)
                  ) : null,
                  i.tags.includes("mcp") ? e.createElement(
                    k,
                    { color: "purple", style: { fontSize: 10 } },
                    "MCP"
                  ) : null
                )
              )
            ),
            e.createElement(
              q,
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
                i.tags.filter((I) => I !== "agent" && I !== "template" && I !== "workspace").slice(0, 3).join(" · ") || "人才模板"
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
  ), xa = [
    {
      key: "skills",
      label: e.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        S ? e.createElement(S, { style: { fontSize: 14 } }) : null,
        "技能市场"
      ),
      children: ya
    },
    {
      key: "mcp",
      label: e.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        w ? e.createElement(w, { style: { fontSize: 14 } }) : null,
        "MCP 市场"
      ),
      children: ba
    },
    {
      key: "experts",
      label: e.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        W ? e.createElement(W, { style: { fontSize: 14 } }) : null,
        "人才市场"
      ),
      children: Sa
    }
  ];
  return e.createElement(
    "div",
    { style: { padding: 24 } },
    e.createElement(bt, {
      title: "市场",
      subtitle: "浏览技能市场 · 选择 MCP 服务器 · 人才市场 · 随时更新能力和专家",
      extra: e.createElement(
        "div",
        { style: { display: "flex", gap: 8 } },
        e.createElement(
          c,
          {
            type: "primary",
            icon: T ? e.createElement(T) : void 0,
            onClick: () => {
              dt(le, v, {}), ct(), Ct();
            },
            loading: pe || Fe || Zt || sn
          },
          "刷新"
        )
      )
    }),
    e.createElement(Y, {
      items: xa,
      activeKey: A,
      onChange: (i) => H(i)
    }),
    // Skill source config modal
    e.createElement(ur, {
      open: oa,
      onClose: () => Ht(!1),
      sources: ze,
      onChange: (i) => {
        Oe(i), ct(i);
      }
    }),
    // MCP source config modal
    e.createElement(In, {
      open: ca,
      onClose: () => Jt(!1),
      sources: ia,
      onChange: (i) => Wt(i),
      type: "mcp"
    }),
    // MCP token config modal (for templates requiring secrets)
    wa,
    // Expert source config modal
    e.createElement(In, {
      open: ma,
      onClose: () => Xt(!1),
      sources: da,
      onChange: (i) => Kt(i),
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
                k,
                { color: "blue", style: { fontSize: 10 } },
                Qe($e.category)
              ) : null,
              ...$e.tags.filter(
                (i) => i !== "agent" && i !== "template" && i !== "workspace"
              ).slice(0, 5).map(
                (i) => e.createElement(
                  k,
                  { key: i, style: { fontSize: 10 } },
                  i
                )
              )
            )
          )
        ),
        open: !0,
        onCancel: () => it(null),
        width: 640,
        footer: e.createElement(
          "div",
          { style: { textAlign: "right" } },
          e.createElement(
            c,
            {
              onClick: () => it(null),
              style: { marginRight: 8 }
            },
            "取消"
          ),
          e.createElement(
            c,
            {
              type: "primary",
              loading: kt,
              disabled: kt,
              icon: W ? e.createElement(W) : void 0,
              style: Ae,
              onClick: async () => {
                await Ea($e), it(null);
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
          q,
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
            ([i, I]) => e.createElement(
              k,
              { key: i, color: "cyan", style: { fontSize: 11 } },
              `${i}${I && I.length > 0 ? ` (${I.join(", ")})` : ""}`
            )
          )
        )
      ) : null
    ) : null
  );
}
function Er() {
  try {
    const t = localStorage.getItem("language") || "";
    if (t) return t.split("-")[0];
  } catch {
  }
  return ((typeof navigator < "u" ? navigator.language : "") || "").split("-")[0] || "en";
}
const Pn = {
  zh: "您好，UGSci 智能助手在线。无论是油气藏分析、数值模拟还是工程决策，描述您的场景，我来交付结果。",
  en: "UGSci AI assistant is online. From reservoir analysis to numerical simulation and engineering decisions — describe your scenario and I'll deliver results.",
  ja: "UGSci AIアシスタントがオンラインです。油層解析、数値シミュレーション、エンジニアリングの意思決定など、シナリオを描写してください。結果をお届けします。",
  ru: "UGSci AI-ассистент онлайн. От анализа пласта до численного моделирования и инженерных решений — опишите свой сценарий, и я предоставлю результат.",
  vi: "Trợ lý AI UGSci đang trực tuyến. Từ phân tích mỏ, mô phỏng số đến ra quyết định kỹ thuật — mô tả kịch bản của bạn, tôi sẽ giao kết quả.",
  id: "Asisten AI UGSci sedang online. Dari analisis reservoir, simulasi numerik hingga keputusan engineering — jelaskan skenario Anda, saya akan memberikan hasilnya."
}, On = {
  zh: { label: "能告诉我你都能做点什么吗？", value: "能告诉我你都能做点什么吗" },
  en: { label: "Can you tell me what you can do?", value: "Can you tell me what you can do?" },
  ja: { label: "あなたができることを教えてください", value: "あなたができることを教えてください" },
  ru: { label: "Расскажи, что ты умеешь делать?", value: "Расскажи, что ты умеешь делать?" },
  vi: { label: "Bạn có thể cho tôi biết bạn làm được gì không?", value: "Bạn có thể cho tôi biết bạn làm được gì không?" },
  id: { label: "Bisa cerita apa saja yang bisa Anda lakukan?", value: "Bisa cerita apa saja yang bisa Anda lakukan?" }
};
function hr() {
  const e = x(), t = e.React, { useEffect: l, useRef: n } = t, a = e.useSelectedAgent ? e.useSelectedAgent() : { id: "default" }, r = (a == null ? void 0 : a.id) || "default", s = n(null), o = n(null);
  return l(() => {
    if (s.current === r) return;
    s.current = r, Rt();
    const d = Er(), c = Pn[d] || Pn.en, u = On[d] || On.en;
    let b = !1;
    return (async () => {
      var y, h;
      try {
        const k = await St(r);
        if (b) return;
        const z = Rn(k);
        if (o.current) {
          try {
            o.current();
          } catch {
          }
          o.current = null;
        }
        const C = window.QwenPaw;
        (y = C == null ? void 0 : C.chat) != null && y.welcome && (z.length > 0 ? (o.current = C.chat.welcome.set("ugsci", {
          description: c,
          prompts: z
        }), console.info(
          `[ugsci] Injected ${z.length} welcome prompts for agent "${r}"`
        )) : (o.current = C.chat.welcome.set("ugsci", {
          description: c,
          prompts: [u]
        }), console.info(
          `[ugsci] No skills for agent "${r}" — using default prompt`
        )));
      } catch (k) {
        console.warn(
          `[ugsci] Failed to inject welcome prompts for agent "${r}":`,
          k
        );
        const z = window.QwenPaw;
        if ((h = z == null ? void 0 : z.chat) != null && h.welcome && !b) {
          if (o.current) {
            try {
              o.current();
            } catch {
            }
            o.current = null;
          }
          o.current = z.chat.welcome.set("ugsci", {
            description: c,
            prompts: [u]
          });
        }
      }
    })(), () => {
      b = !0;
    };
  }, [r]), null;
}
function vr() {
  var d, c, u;
  const e = window.QwenPaw;
  if (!(e != null && e.menu) || !(e != null && e.route)) {
    console.warn(
      "[ugsci] QwenPaw.menu/route API not available — plugin disabled"
    );
    return;
  }
  const t = x().React, l = "ugsci";
  (c = (d = e.chat) == null ? void 0 : d.rightHeader) != null && c.add ? (e.chat.rightHeader.add(l, t.createElement(hr), {
    id: "ugsci.welcome-injector",
    order: -1
    // render before other right-header items (invisible anyway)
  }), console.info("[ugsci] WelcomePromptsInjector registered via rightHeader")) : console.warn(
    "[ugsci] QP.chat.rightHeader.add not available — agent-specific welcome prompts disabled"
  );
  const n = x().antdIcons || {}, a = n.UserSwitchOutlined, r = n.ToolOutlined, s = n.ShopOutlined;
  e.route.add(l, {
    id: "ugsci.experts",
    path: "/ugsci-experts",
    component: $l
  }), e.menu.add(l, {
    id: "ugsci.experts",
    location: "primary.agentScoped",
    label: () => "专家·协作",
    icon: a ? t.createElement(a, { style: { fontSize: 16 } }) : void 0,
    route: "ugsci.experts",
    order: 5,
    visible: () => nt()
  }), e.route.add(l, {
    id: "ugsci.tools-skills",
    path: "/ugsci-tools-skills",
    component: Qn
  }), e.menu.add(l, {
    id: "ugsci.tools-skills",
    location: "primary.agentScoped",
    label: () => "工具·技能",
    icon: r ? t.createElement(r, { style: { fontSize: 16 } }) : void 0,
    route: "ugsci.tools-skills",
    order: 6,
    visible: () => nt()
  }), e.route.add(l, {
    id: "ugsci.capabilities",
    path: "/ugsci-capabilities",
    component: ql
  }), e.route.add(l, {
    id: "ugsci.skills-center",
    path: "/ugsci-skills",
    component: Vl
  }), e.route.add(l, {
    id: "ugsci.market",
    path: "/ugsci-market",
    component: yr
  }), e.menu.add(l, {
    id: "ugsci.market",
    location: "primary.agentScoped",
    label: () => "市场",
    icon: s ? t.createElement(s, { style: { fontSize: 16 } }) : void 0,
    route: "ugsci.market",
    order: 7,
    visible: () => nt()
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
  for (const b of o) {
    try {
      const h = e.menu.snapshot("primary.agentScoped").find((k) => k.id === b);
      h && e.menu.replace(l, b, {
        ...h,
        visible: () => !nt()
      });
    } catch {
    }
    try {
      const h = e.menu.snapshot("primary.settings").find((k) => k.id === b);
      h && e.menu.replace(l, b, {
        ...h,
        visible: () => !nt()
      });
    } catch {
    }
  }
  console.info(
    "[ugsci] Plugin registered: unified Tools & Skills center + compatibility routes, simple-mode navigation active"
  );
}
function $t() {
  try {
    vr();
  } catch (e) {
    console.error("[ugsci] Failed to build plugin:", e), setTimeout($t, 500);
  }
}
var $n;
if (($n = window.QwenPaw) != null && $n.host)
  $t();
else {
  const e = setInterval(() => {
    var t;
    (t = window.QwenPaw) != null && t.host && (clearInterval(e), $t());
  }, 200);
  setTimeout(() => clearInterval(e), 1e4);
}
