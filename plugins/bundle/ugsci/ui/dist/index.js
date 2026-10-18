function C() {
  var t;
  const e = (t = window.QwenPaw) == null ? void 0 : t.host;
  if (!e) throw new Error("[ugsci] QwenPaw.host not available");
  return e;
}
function vo() {
  try {
    return C().getApiToken() || "";
  } catch {
    return "";
  }
}
function bn(e) {
  return C().getApiUrl(e);
}
function wo(e) {
  const t = vo();
  return {
    "Content-Type": "application/json",
    ...t ? { Authorization: `Bearer ${t}` } : {},
    ...e
  };
}
function So(e) {
  const t = new Headers(e), n = {};
  return t.forEach((r, a) => {
    n[a] = r;
  }), n;
}
function tt(e, t) {
  const n = C(), r = So(t == null ? void 0 : t.headers);
  return n.fetch ? n.fetch(e, { ...t, headers: r }) : fetch(n.getApiUrl(e), {
    ...t,
    headers: { ...wo(), ...r }
  });
}
const Dt = /* @__PURE__ */ new Map(), xo = 15e3;
function ko(e) {
  return e ? e instanceof Headers ? e.get("X-Agent-Id") || e.get("x-agent-id") || "" : e["X-Agent-Id"] || e["x-agent-id"] || "" : "";
}
function Co(e, t, n) {
  return `${e}:${t}:${n}`;
}
function Vt() {
  Dt.clear();
}
function rr(e) {
  for (const [t, n] of Dt)
    (e ? n.agentId === e : n.agentId) && Dt.delete(t);
}
async function de(e, t) {
  const n = ((t == null ? void 0 : t.method) || "GET").toUpperCase(), { bypassCache: r, ...a } = t || {}, l = ko(
    a.headers
  ), i = Co(n, e, l);
  if (n !== "GET" && (l ? rr(l) : Vt()), n === "GET" && !r) {
    const c = Dt.get(i);
    if (c && Date.now() - c.ts < xo)
      return c.data;
  }
  const s = await tt(e, a);
  if (!s.ok) {
    const c = await s.text().catch(() => "");
    throw new Error(c || `HTTP ${s.status}`);
  }
  if (s.status === 204) return null;
  const o = await s.json();
  return n === "GET" && Dt.set(i, {
    data: o,
    ts: Date.now(),
    agentId: l || void 0
  }), o;
}
const qe = {
  background: "#0072f5",
  color: "#fff",
  fontSize: 13,
  fontWeight: 600,
  border: "none",
  borderRadius: 8
};
function vn(e, t) {
  const n = C();
  return n.ReactMarkdown && n.remarkGfm ? t.createElement(
    n.ReactMarkdown,
    { remarkPlugins: [n.remarkGfm] },
    e
  ) : e.replace(/\*\*(.+?)\*\*/g, "$1").replace(/\*(.+?)\*/g, "$1").replace(/`(.+?)`/g, "$1").replace(/^#+\s*/gm, "").replace(/^[-*]\s+/gm, "• ");
}
function wn({
  title: e,
  subtitle: t,
  extra: n
}) {
  const r = C().React, { Space: a } = C().antd;
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
async function Sn() {
  const e = await de("/agents");
  return (e == null ? void 0 : e.agents) || [];
}
async function ar(e) {
  return de(
    `/agents/${encodeURIComponent(e)}`
  );
}
async function xn(e) {
  return await de(
    `/agents/${encodeURIComponent(e)}/skills`
  ) || [];
}
async function kn(e = !1) {
  return await de(`/skills/pool${e ? "?summary=true" : ""}`) || [];
}
async function To(e) {
  const t = await de(
    `/skills/pool/${encodeURIComponent(e)}/content`
  );
  return (t == null ? void 0 : t.content) || "";
}
async function _o() {
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
function Tt(e, t = "") {
  return `/agents/${encodeURIComponent(e)}/skills${t}`;
}
function qa(e) {
  var n;
  const t = [];
  for (const r of e) {
    if (r.enabled === !1) continue;
    const a = (n = r.description) == null ? void 0 : n.trim();
    if (!a) continue;
    const l = (r.name || a).length > 20 ? (r.name || a).substring(0, 18) + "…" : r.name || a;
    let i = a;
    if (i = i.replace(/\*\*(.+?)\*\*/g, "$1").replace(/\*(.+?)\*/g, "$1").replace(/`(.+?)`/g, "$1").replace(/^#+\s*/gm, "").trim(), /^(用于|帮助|提供|支持|实现|完成|分析|计算|生成|创建|检查)/.test(i) ? i = `请${i}` : /^(a |an |the )/i.test(i) ? i = `Help me with ${i}` : /[。？！.?!]$/.test(i) || (i = `帮我${i}`), i.length > 80 && (i = i.substring(0, 77) + "..."), t.push({ label: l, value: i }), t.length >= 4) break;
  }
  return t;
}
async function Io(e) {
  return await de("/workspace/files", {
    headers: { "X-Agent-Id": e }
  }) || [];
}
async function vt(e, t, n) {
  return de(`/workspace/files/${encodeURIComponent(t)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify({ content: n })
  });
}
async function Ao(e, t, n, r) {
  return de("/workspace/prompt-files", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify({ filename: t, content: n, enable: r })
  });
}
const $o = /* @__PURE__ */ new Set([
  "CON",
  "PRN",
  "AUX",
  "NUL",
  ...Array.from({ length: 9 }, (e, t) => `COM${t + 1}`),
  ...Array.from({ length: 9 }, (e, t) => `LPT${t + 1}`)
]);
function zo(e) {
  let t = e.trim();
  if (!t) throw new Error("请输入文件名");
  if (/[\\/]/.test(t)) throw new Error("文件名不能包含路径分隔符");
  if (/[<>:\"|?*\u0000-\u001f]/.test(t))
    throw new Error("文件名包含系统不支持的字符");
  if (/[ .]$/.test(t)) throw new Error("文件名不能以空格或句点结尾");
  t.toLowerCase().endsWith(".md") ? t = `${t.slice(0, -3)}.md` : t += ".md";
  const n = t.split(".", 1)[0].toUpperCase();
  if (!t.slice(0, -3)) throw new Error("文件名不能为空");
  if ($o.has(n))
    throw new Error("该文件名是系统保留名称，请更换");
  if (new TextEncoder().encode(t).length > 255)
    throw new Error("文件名过长");
  return t;
}
async function Po(e, t) {
  const n = await ar(e);
  n.system_prompt_files = t, await de(`/agents/${encodeURIComponent(e)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(n)
  });
}
async function lr(e, t) {
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
async function Va(e, t) {
  await de(
    Tt(e, `/${encodeURIComponent(t)}/enable`),
    {
      method: "POST"
    }
  );
}
async function or(e, t) {
  await de(Tt(e, `/${encodeURIComponent(t)}`), {
    method: "DELETE"
  });
}
async function Ro(e, t) {
  return de(Tt(e, "/batch-enable"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(t)
  });
}
async function Oo(e, t) {
  return de(Tt(e, "/batch-disable"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(t)
  });
}
async function Mo(e, t) {
  return de(Tt(e, "/batch-delete"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(t)
  });
}
async function ir(e) {
  return await de("/mcp", {
    headers: { "X-Agent-Id": e }
  }) || [];
}
async function Ja(e, t) {
  await de(`/mcp/${encodeURIComponent(t)}`, {
    method: "DELETE",
    headers: { "X-Agent-Id": e }
  });
}
async function sr(e, t) {
  return de("/mcp", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify(t)
  });
}
async function Lo(e, t) {
  return de(
    `/mcp/toggle/${encodeURIComponent(t)}`,
    {
      method: "PATCH",
      headers: { "X-Agent-Id": e }
    }
  );
}
async function Ka(e, t) {
  await de(
    Tt(e, `/${encodeURIComponent(t)}/disable`),
    {
      method: "POST"
    }
  );
}
async function Bo(e) {
  await de(`/skills/pool/${encodeURIComponent(e)}`, {
    method: "DELETE"
  });
}
function Uo(e) {
  const t = (e || "").trim();
  if (!t) return { number: 6, unit: "h" };
  const n = t.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/i);
  if (!n) return { number: 6, unit: "h" };
  const r = parseInt(n[1] || "0", 10), a = parseInt(n[2] || "0", 10), l = parseInt(n[3] || "0", 10), i = r * 60 + a + Math.round(l / 60);
  return i <= 0 ? { number: 6, unit: "h" } : i >= 60 && i % 60 === 0 ? { number: i / 60, unit: "h" } : { number: i, unit: "m" };
}
function jo(e) {
  return e.unit === "h" ? `${e.number}h` : `${e.number}m`;
}
async function No(e) {
  return de("/config/heartbeat", {
    headers: { "X-Agent-Id": e }
  });
}
async function Do(e, t) {
  return de("/config/heartbeat", {
    method: "PUT",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify(t)
  });
}
async function Fo(e) {
  await de("/config/heartbeat/run", {
    method: "POST",
    headers: { "X-Agent-Id": e }
  });
}
async function Go(e) {
  return de("/workspace/running-config", {
    headers: { "X-Agent-Id": e }
  });
}
async function Ho(e, t) {
  return de("/workspace/running-config", {
    method: "PUT",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify(t)
  });
}
async function Wo(e) {
  return (await de("/workspace/language", {
    headers: { "X-Agent-Id": e }
  })).language || "zh";
}
async function qo(e, t) {
  await de("/workspace/language", {
    method: "PUT",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify({ language: t })
  });
}
async function Vo() {
  return (await de("/config/user-timezone")).timezone || "UTC";
}
async function Jo(e) {
  await de("/config/user-timezone", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ timezone: e })
  });
}
async function Ko(e) {
  return await de("/workspace/system-prompt-files", {
    headers: { "X-Agent-Id": e }
  }) || [];
}
const Vr = ["AGENTS.md", "SOUL.md", "PROFILE.md"];
function Xo({
  items: e,
  max: t = 5,
  color: n = "blue",
  emptyText: r = "无"
}) {
  const a = C().React, { Tag: l } = C().antd;
  return !e || e.length === 0 ? a.createElement(
    "span",
    { style: { fontSize: 12, color: "var(--ant-color-text-quaternary, #bfbfbf)" } },
    r
  ) : a.createElement(
    "div",
    { style: { display: "flex", flexWrap: "wrap", gap: 4 } },
    ...e.slice(0, t).map(
      (i, s) => a.createElement(
        l,
        { key: s, color: n, style: { fontSize: 11, marginRight: 0 } },
        i
      )
    ),
    e.length > t ? a.createElement(
      l,
      { style: { fontSize: 11, marginRight: 0 } },
      `+${e.length - t}`
    ) : null
  );
}
function Xa({
  open: e,
  onClose: t,
  poolSkills: n,
  installedSkillNames: r,
  loading: a,
  onInstall: l
}) {
  const i = C().React, { useState: s, useEffect: o, useMemo: c } = i, { Modal: d, Button: u, Empty: m, Spin: p, Input: w, Tag: h, Tooltip: y, Typography: f } = C().antd, { CheckOutlined: E, SearchOutlined: v } = C().antdIcons || {}, { Text: g } = f, [x, O] = s([]), [K, z] = s("");
  o(() => {
    e && (O([]), z(""));
  }, [e]);
  const R = c(() => {
    if (!K.trim()) return n;
    const T = K.toLowerCase();
    return n.filter(
      (k) => {
        var $, _;
        return k.name.toLowerCase().includes(T) || (($ = k.description) == null ? void 0 : $.toLowerCase().includes(T)) || ((_ = k.tags) == null ? void 0 : _.some((M) => M.toLowerCase().includes(T)));
      }
    );
  }, [n, K]), X = R.filter(
    (T) => !r.includes(T.name)
  ), W = (T) => {
    O(
      (k) => k.includes(T) ? k.filter(($) => $ !== T) : [...k, T]
    );
  }, N = async () => {
    x.length !== 0 && (await l(x), O([]));
  };
  return i.createElement(
    d,
    {
      open: e,
      onCancel: t,
      title: "从技能池选择技能",
      width: 680,
      footer: i.createElement(
        "div",
        {
          style: {
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }
        },
        i.createElement(
          g,
          { type: "secondary", style: { fontSize: 13 } },
          `已选择 ${x.length} 个技能`
        ),
        i.createElement(
          "div",
          { style: { display: "flex", gap: 8 } },
          i.createElement(u, { onClick: t }, "取消"),
          i.createElement(
            u,
            {
              type: "primary",
              onClick: N,
              disabled: x.length === 0
            },
            x.length > 0 ? `添加 (${x.length})` : "添加"
          )
        )
      )
    },
    // Search + bulk actions bar
    i.createElement(
      "div",
      {
        style: {
          marginBottom: 12,
          display: "flex",
          gap: 8,
          alignItems: "center"
        }
      },
      i.createElement(w, {
        placeholder: "搜索技能名称、描述或标签...",
        prefix: v ? i.createElement(v) : void 0,
        value: K,
        onChange: (T) => z(T.target.value),
        allowClear: !0,
        style: { flex: 1 }
      }),
      i.createElement(
        u,
        {
          size: "small",
          type: "primary",
          onClick: () => O(X.map((T) => T.name))
        },
        "全选"
      ),
      i.createElement(
        u,
        {
          size: "small",
          onClick: () => O([])
        },
        "清空"
      )
    ),
    // Skill grid (card style matching Skill Center)
    a ? i.createElement(
      "div",
      { style: { textAlign: "center", padding: 40 } },
      i.createElement(p, { size: "large" })
    ) : R.length === 0 ? i.createElement(m, {
      description: K ? "未找到匹配的技能" : "技能池暂无可用技能",
      image: m.PRESENTED_IMAGE_SIMPLE
    }) : i.createElement(
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
      ...R.map((T) => {
        const k = x.includes(T.name), $ = r.includes(T.name);
        return i.createElement(
          "div",
          {
            key: T.name,
            onClick: () => !$ && W(T.name),
            style: {
              position: "relative",
              padding: "10px 12px",
              border: `1px solid ${k ? "#0072f5" : "var(--ant-color-border-secondary, #e8e8e8)"}`,
              borderRadius: 6,
              cursor: $ ? "not-allowed" : "pointer",
              transition: "all 0.15s ease",
              background: k ? "rgba(0, 114, 245, 0.06)" : $ ? "var(--ant-color-fill-quaternary, #fafafa)" : "var(--ant-color-bg-container, #fff)",
              opacity: $ ? 0.5 : 1,
              minHeight: 64
            }
          },
          k ? i.createElement(
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
            E ? i.createElement(E) : "✓"
          ) : null,
          $ ? i.createElement(
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
          i.createElement(
            "div",
            {
              style: {
                display: "flex",
                alignItems: "center",
                gap: 6,
                marginBottom: 4,
                paddingRight: $ || k ? 24 : 0
              }
            },
            i.createElement(
              "span",
              { style: { fontSize: 16 } },
              T.emoji || "⚡"
            ),
            i.createElement(
              y,
              { title: T.name },
              i.createElement(
                g,
                {
                  strong: !0,
                  style: {
                    fontSize: 13,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap"
                  }
                },
                T.name
              )
            )
          ),
          T.description ? i.createElement(
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
            T.description
          ) : null,
          T.tags && T.tags.length > 0 ? i.createElement(
            "div",
            {
              style: {
                marginTop: 4,
                display: "flex",
                gap: 2,
                flexWrap: "wrap"
              }
            },
            ...T.tags.slice(0, 2).map(
              (_, M) => i.createElement(
                h,
                {
                  key: M,
                  color: "cyan",
                  style: { fontSize: 10, marginRight: 0 }
                },
                _
              )
            )
          ) : null
        );
      })
    )
  );
}
function Ya({
  agentId: e,
  systemPromptFiles: t,
  onRefresh: n
}) {
  const r = C().React, { useState: a, useEffect: l, useCallback: i, useRef: s } = r, {
    List: o,
    Tag: c,
    Switch: d,
    Button: u,
    Modal: m,
    Input: p,
    Spin: w,
    Empty: h,
    message: y,
    Typography: f,
    Segmented: E,
    Alert: v
  } = C().antd, { FileTextOutlined: g, PlusOutlined: x, EditOutlined: O, ReloadOutlined: K } = C().antdIcons || {}, { Text: z } = f, [R, X] = a([]), [W, N] = a(!0), [T, k] = a(
    t || []
  ), [$, _] = a(!1), [M, G] = a(null), [q, F] = a(""), [I, ne] = a(""), [le, D] = a(!1), [P, oe] = a("source"), re = s(0), Y = i(async () => {
    const A = ++re.current;
    N(!0);
    try {
      const S = await Io(e);
      A === re.current && X(S);
    } catch (S) {
      A === re.current && (y.error(S.message || "加载工作区文档失败"), X([]));
    } finally {
      A === re.current && N(!1);
    }
  }, [e]);
  l(() => {
    Y();
  }, [Y]), l(() => {
    k(t || []);
  }, [t]);
  const ue = async (A, S) => {
    const V = new Set(T);
    if (S)
      V.add(A);
    else {
      if (Vr.includes(A) && A === "AGENTS.md") {
        y.warning("AGENTS.md 是核心文件，不能停用");
        return;
      }
      V.delete(A);
    }
    const pe = Array.from(V);
    k(pe);
    try {
      await Po(e, pe), y.success(S ? "已启用记忆文件" : "已停用记忆文件"), n();
    } catch (Se) {
      y.error(Se.message || "更新失败"), k(t || []);
    }
  }, U = async (A) => {
    try {
      const S = await de(
        `/workspace/files/${encodeURIComponent(A)}`,
        { headers: { "X-Agent-Id": e } }
      );
      G(A), F(S.content || ""), oe("source"), _(!0);
    } catch (S) {
      y.error(S.message || "读取文件失败");
    }
  }, ie = () => {
    G(null), F(""), ne(""), oe("source"), _(!0);
  }, me = async () => {
    let A;
    try {
      A = zo(M || I);
    } catch (S) {
      y.warning(S.message || "文件名无效");
      return;
    }
    if (!q.trim()) {
      y.warning("Markdown 文档不能为空");
      return;
    }
    if (new TextEncoder().encode(q).length > 1024 * 1024) {
      y.warning("Markdown 文档不能超过 1 MB");
      return;
    }
    D(!0);
    try {
      if (M)
        await vt(e, A, q);
      else {
        const S = await Ao(
          e,
          A,
          q,
          !0
        );
        k(S.system_prompt_files);
      }
      y.success("保存成功"), _(!1), Y(), n();
    } catch (S) {
      const V = S != null && S.message ? `：${S.message}` : "";
      y.error(
        M ? (S == null ? void 0 : S.message) || "保存失败" : `创建并挂载失败，服务端已回滚文件${V}`
      );
    } finally {
      D(!1);
    }
  };
  return W ? r.createElement(
    "div",
    { style: { textAlign: "center", padding: 40 } },
    r.createElement(w, { size: "large" })
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
        g ? r.createElement(g, {
          style: { fontSize: 14, color: "#1677ff" }
        }) : null,
        r.createElement(
          z,
          { strong: !0 },
          `工作区文档 (${R.length})`
        ),
        r.createElement(
          z,
          { type: "secondary", style: { fontSize: 12 } },
          `· ${T.length} 个已挂载到系统提示`
        )
      ),
      r.createElement(
        "div",
        { style: { display: "flex", gap: 8 } },
        r.createElement(
          u,
          {
            size: "small",
            icon: K ? r.createElement(K) : void 0,
            onClick: Y
          },
          "刷新"
        ),
        r.createElement(
          u,
          {
            type: "primary",
            size: "small",
            icon: x ? r.createElement(x) : void 0,
            onClick: ie
          },
          "新建 Markdown 文档"
        )
      )
    ),
    R.length === 0 ? r.createElement(h, {
      description: "暂无 Markdown 文档，点击「新建 Markdown 文档」添加",
      image: h.PRESENTED_IMAGE_SIMPLE
    }) : r.createElement(o, {
      dataSource: R,
      renderItem: (A) => {
        const S = T.includes(A.filename), V = Vr.includes(A.filename);
        return r.createElement(
          o.Item,
          {
            actions: [
              r.createElement(
                u,
                {
                  type: "link",
                  size: "small",
                  icon: O ? r.createElement(O) : void 0,
                  onClick: () => U(A.filename)
                },
                "编辑"
              )
            ]
          },
          r.createElement(o.Item.Meta, {
            avatar: r.createElement(g, {
              style: {
                fontSize: 20,
                color: S ? "#1677ff" : "var(--ant-color-text-quaternary, #bfbfbf)"
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
              r.createElement(z, null, A.filename),
              V ? r.createElement(
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
              `${(A.size / 1024).toFixed(1)} KB · 修改于 ${new Date(A.modified_time).toLocaleString()}`
            )
          }),
          r.createElement(d, {
            checked: S,
            size: "small",
            onChange: (pe) => ue(A.filename, pe)
          })
        );
      }
    }),
    // Edit/New file modal
    r.createElement(
      m,
      {
        open: $,
        onCancel: () => _(!1),
        title: M ? `编辑 ${M}` : "新建 Markdown 文档",
        width: 700,
        onOk: me,
        confirmLoading: le,
        okText: "保存"
      },
      M ? null : r.createElement(
        "div",
        { style: { marginBottom: 12 } },
        r.createElement(p, {
          placeholder: "文件名（如：油藏工程记忆库.md）",
          value: I,
          onChange: (A) => ne(A.target.value),
          addonAfter: I.endsWith(".md") ? "" : ".md"
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
          value: P,
          options: [
            { label: "源码", value: "source" },
            { label: "预览", value: "preview" }
          ],
          onChange: (A) => oe(A)
        }),
        r.createElement(
          z,
          { type: "secondary", style: { fontSize: 12 } },
          `${q.length} 字符 · 约 ${Math.ceil(q.length / 4)} tokens · ${M && T.includes(M) ? "已挂载" : M ? "未挂载" : "保存后自动挂载"}`
        )
      ),
      q.trim() ? null : r.createElement(v, {
        type: "warning",
        showIcon: !0,
        message: "文档内容为空，保存前需要填写 Markdown 内容",
        style: { marginBottom: 10 }
      }),
      P === "source" ? r.createElement(p.TextArea, {
        value: q,
        onChange: (A) => F(A.target.value),
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
        vn(q, r)
      )
    )
  );
}
function Yo({
  skills: e,
  agentId: t
}) {
  const n = C().React, { useMemo: r } = n, {
    List: a,
    Tag: l,
    Typography: i,
    Empty: s,
    Button: o,
    message: c
  } = C().antd, { ThunderboltOutlined: d, CopyOutlined: u } = C().antdIcons || {}, { Text: m } = i, p = r(() => qa(e), [e]), w = (y) => {
    try {
      const f = C();
      f.setSelectedAgent && f.setSelectedAgent(t);
    } catch {
    }
    try {
      sessionStorage.setItem("ugsci_pending_prompt", y.value);
    } catch {
    }
    window.history.pushState({}, "", "/chat"), window.dispatchEvent(new PopStateEvent("popstate"));
  }, h = (y) => {
    var f;
    (f = navigator.clipboard) == null || f.writeText(y.value).then(() => {
      c.success("已复制到剪贴板");
    });
  };
  return p.length === 0 ? n.createElement(s, {
    description: "暂无推荐提问，请先为专家添加技能",
    image: s.PRESENTED_IMAGE_SIMPLE
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
      d ? n.createElement(d, {
        style: { fontSize: 14, color: "#1677ff" }
      }) : null,
      n.createElement(
        m,
        { strong: !0 },
        `推荐提问 (${p.length})`
      ),
      n.createElement(
        m,
        { type: "secondary", style: { fontSize: 12 } },
        "· 从技能描述中自动提取"
      )
    ),
    n.createElement(a, {
      dataSource: p,
      renderItem: (y, f) => n.createElement(
        a.Item,
        {
          actions: [
            n.createElement(
              o,
              {
                type: "link",
                size: "small",
                icon: u ? n.createElement(u) : void 0,
                onClick: () => h(y)
              },
              "复制"
            )
          ]
        },
        n.createElement(a.Item.Meta, {
          avatar: n.createElement(
            l,
            { color: "blue", style: { borderRadius: "50%" } },
            `${f + 1}`
          ),
          title: n.createElement(
            "div",
            {
              style: {
                cursor: "pointer",
                color: "#1677ff"
              },
              onClick: () => w(y)
            },
            y.value
          ),
          description: n.createElement(
            m,
            { type: "secondary", style: { fontSize: 12 } },
            y.label
          )
        })
      )
    })
  );
}
const St = {
  marginBottom: 4,
  fontSize: 13,
  fontWeight: 500,
  color: "rgba(0,0,0,0.85)",
  display: "flex",
  alignItems: "center",
  gap: 4
}, Qa = { marginBottom: 16 }, Za = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "0 16px",
  marginBottom: 16
}, lt = {
  fontSize: 13,
  fontWeight: 600,
  color: "rgba(0,0,0,0.85)",
  marginBottom: 12,
  paddingBottom: 8,
  borderBottom: "1px solid #f0f0f0"
}, el = {
  fontSize: 12,
  color: "rgba(0,0,0,0.45)",
  marginLeft: 8
};
function Qo({ agentId: e }) {
  const t = C().React, { useState: n, useEffect: r, useCallback: a } = t, {
    Switch: l,
    InputNumber: i,
    Select: s,
    Button: o,
    Spin: c,
    Space: d,
    Typography: u,
    message: m
  } = C().antd, { PlayCircleOutlined: p, SaveOutlined: w } = C().antdIcons || {}, { Text: h } = u, [y, f] = n(!0), [E, v] = n(!1), [g, x] = n(!1), [O, K] = n(!1), [z, R] = n(6), [X, W] = n("h"), [N, T] = n("main"), [k, $] = n(300), [_, M] = n(!1), [G, q] = n("08:00"), [F, I] = n("22:00"), ne = a(async () => {
    var Y, ue;
    f(!0);
    try {
      const U = await No(e), ie = Uo(U.every ?? "6h");
      K(U.enabled ?? !1), R(ie.number), W(ie.unit), T(U.target ?? "main"), $(U.timeoutSeconds ?? 300), M(!!U.activeHours), q(((Y = U.activeHours) == null ? void 0 : Y.start) ?? "08:00"), I(((ue = U.activeHours) == null ? void 0 : ue.end) ?? "22:00");
    } catch (U) {
      m.error(U.message || "加载心跳配置失败");
    } finally {
      f(!1);
    }
  }, [e]);
  r(() => {
    ne();
  }, [ne]);
  const le = async () => {
    v(!0);
    try {
      await Do(e, {
        enabled: O,
        every: jo({ number: z, unit: X }),
        target: N,
        timeoutSeconds: k,
        activeHours: _ && G && F ? { start: G, end: F } : void 0
      }), m.success("心跳配置已保存");
    } catch (Y) {
      m.error(Y.message || "保存心跳配置失败");
    } finally {
      v(!1);
    }
  }, D = async () => {
    x(!0);
    try {
      await Fo(e), m.success("已触发心跳检查");
    } catch (Y) {
      m.error(Y.message || "触发心跳失败");
    } finally {
      x(!1);
    }
  };
  if (y)
    return t.createElement(
      "div",
      { style: { textAlign: "center", padding: 40 } },
      t.createElement(c, { size: "large" })
    );
  const P = (Y, ue, U) => t.createElement(
    "div",
    { style: Qa },
    t.createElement("div", { style: St }, Y),
    ue,
    U ? t.createElement(
      h,
      { type: "secondary", style: el },
      U
    ) : null
  ), oe = (Y, ue, U, ie) => t.createElement(
    "div",
    { style: Za },
    t.createElement(
      "div",
      null,
      t.createElement("div", { style: St }, Y),
      ue
    ),
    t.createElement(
      "div",
      null,
      t.createElement("div", { style: St }, U),
      ie
    )
  ), { Divider: re } = C().antd;
  return t.createElement(
    "div",
    { style: { paddingBottom: 8 } },
    // ── Section: 基本设置 ──
    t.createElement("div", { style: lt }, "基本设置"),
    P(
      "启用心跳",
      t.createElement(l, {
        checked: O,
        onChange: (Y) => K(Y)
      }),
      O ? "已启用，专家将定期自检" : "已停用"
    ),
    oe(
      "检查频率",
      t.createElement(
        d,
        null,
        t.createElement(i, {
          min: 1,
          value: z,
          onChange: (Y) => R(Y ?? 1),
          style: { width: "100%" }
        }),
        t.createElement(s, {
          value: X,
          onChange: (Y) => W(Y),
          style: { width: 90 },
          options: [
            { value: "m", label: "分钟" },
            { value: "h", label: "小时" }
          ]
        })
      ),
      "心跳目标",
      t.createElement(s, {
        value: N,
        onChange: (Y) => T(Y),
        style: { width: "100%" },
        options: [
          { value: "main", label: "主会话 (main)" },
          { value: "last", label: "最近会话 (last)" },
          { value: "inbox", label: "收件箱 (inbox)" }
        ]
      })
    ),
    P(
      "超时时间 (秒)",
      t.createElement(i, {
        min: 1,
        max: 3600,
        value: k,
        onChange: (Y) => $(Y ?? 300),
        style: { width: 200 }
      })
    ),
    // ── Section: 活跃时段 ──
    t.createElement(re, { style: { margin: "8px 0 16px" } }),
    t.createElement("div", { style: lt }, "活跃时段"),
    P(
      "启用活跃时段限制",
      t.createElement(l, {
        checked: _,
        onChange: (Y) => M(Y)
      }),
      "仅在指定时段内触发心跳"
    ),
    _ ? oe(
      "开始时间",
      t.createElement("input", {
        type: "time",
        value: G,
        onChange: (Y) => q(Y.target.value),
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
        value: F,
        onChange: (Y) => I(Y.target.value),
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
          icon: w ? t.createElement(w) : void 0,
          loading: E,
          onClick: le,
          style: qe
        },
        "保存配置"
      ),
      t.createElement(
        o,
        {
          icon: p ? t.createElement(p) : void 0,
          loading: g,
          onClick: D
        },
        "立即执行"
      )
    )
  );
}
function Zo({
  agentId: e,
  onRefresh: t
}) {
  const n = C().React, { useState: r, useEffect: a, useCallback: l } = n, {
    List: i,
    Tag: s,
    Switch: o,
    Button: c,
    Empty: d,
    Spin: u,
    Typography: m,
    message: p
  } = C().antd, { PlusOutlined: w, ReloadOutlined: h, DeleteOutlined: y } = C().antdIcons || {}, { Text: f, Paragraph: E } = m, [v, g] = r([]), [x, O] = r(!0), [K, z] = r(!1), [R, X] = r([]), [W, N] = r(!1), T = l(async () => {
    O(!0);
    try {
      const q = await xn(e);
      g(q);
    } catch (q) {
      p.error(q.message || "加载技能失败"), g([]);
    } finally {
      O(!1);
    }
  }, [e]);
  a(() => {
    T();
  }, [T]);
  const k = async () => {
    z(!0), N(!0);
    try {
      const q = await kn(!0);
      X(q);
    } catch (q) {
      p.error(q.message || "加载技能池失败");
    } finally {
      N(!1);
    }
  }, $ = async (q) => {
    let F = 0, I = 0;
    for (const ne of q)
      try {
        await lr(e, ne), F++;
      } catch {
        I++;
      }
    F > 0 ? (p.success(
      `成功添加 ${F} 个技能${I > 0 ? `，${I} 个失败` : ""}`
    ), T(), t()) : I > 0 && p.error("添加技能失败"), z(!1);
  }, _ = async (q, F) => {
    try {
      F ? await Va(e, q.name) : await Ka(e, q.name), p.success(F ? "已启用" : "已停用"), T(), t();
    } catch (I) {
      p.error(I.message || "操作失败");
    }
  }, M = async (q) => {
    try {
      await or(e, q), p.success(`技能「${q}」已移除`), T(), t();
    } catch (F) {
      p.error(F.message || "移除技能失败");
    }
  };
  if (x)
    return n.createElement(
      "div",
      { style: { textAlign: "center", padding: 40 } },
      n.createElement(u, { size: "large" })
    );
  const G = v.filter((q) => q.enabled !== !1);
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
        f,
        { strong: !0 },
        `技能列表 (${v.length}，已启用 ${G.length})`
      ),
      n.createElement(
        "div",
        { style: { display: "flex", gap: 8 } },
        n.createElement(
          c,
          {
            size: "small",
            icon: h ? n.createElement(h) : void 0,
            onClick: () => {
              Vt(), T();
            }
          },
          "刷新"
        ),
        n.createElement(
          c,
          {
            type: "primary",
            size: "small",
            icon: w ? n.createElement(w) : void 0,
            onClick: k,
            style: qe
          },
          "从技能池添加"
        )
      )
    ),
    v.length === 0 ? n.createElement(d, {
      description: "该专家暂无技能",
      image: d.PRESENTED_IMAGE_SIMPLE
    }) : n.createElement(i, {
      dataSource: v,
      renderItem: (q) => n.createElement(
        i.Item,
        {
          actions: [
            n.createElement(o, {
              key: "toggle",
              size: "small",
              checked: q.enabled !== !1,
              onChange: (F) => _(q, F)
            }),
            n.createElement(
              c,
              {
                key: "del",
                type: "link",
                size: "small",
                danger: !0,
                icon: y ? n.createElement(y) : void 0,
                onClick: () => M(q.name)
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
            q.emoji ? n.createElement(
              "span",
              { style: { fontSize: 16 } },
              q.emoji
            ) : null,
            n.createElement(f, { strong: !0 }, q.name),
            q.version_text ? n.createElement(
              s,
              { style: { fontSize: 10 } },
              `v${q.version_text}`
            ) : null
          ),
          q.description ? n.createElement(
            E,
            {
              type: "secondary",
              style: { fontSize: 12, margin: 0 },
              ellipsis: { rows: 2 }
            },
            q.description
          ) : null
        )
      )
    }),
    n.createElement(Xa, {
      open: K,
      onClose: () => z(!1),
      poolSkills: R,
      installedSkillNames: v.map((q) => q.name),
      loading: W,
      onInstall: $
    })
  );
}
function ei({
  agentId: e,
  onRefresh: t,
  isActive: n
}) {
  const r = C().React, { useState: a, useEffect: l, useCallback: i } = r, {
    List: s,
    Tag: o,
    Button: c,
    Empty: d,
    Spin: u,
    Modal: m,
    Input: p,
    Typography: w,
    message: h
  } = C().antd, { PlusOutlined: y, ReloadOutlined: f, DeleteOutlined: E } = C().antdIcons || {}, { Text: v, Paragraph: g } = w, { TextArea: x } = p, [O, K] = a([]), [z, R] = a(!0), [X, W] = a(!1), [N, T] = a(`{
  "mcpServers": {
    "example-client": {
      "command": "npx",
      "args": ["-y", "@example/mcp-server"],
      "env": {}
    }
  }
}`), [k, $] = a(!1), _ = i(async () => {
    R(!0);
    try {
      const F = await ir(e);
      K(F);
    } catch (F) {
      h.error(F.message || "加载 MCP 失败"), K([]);
    } finally {
      R(!1);
    }
  }, [e]);
  l(() => {
    _();
  }, [_]), l(() => {
    n && _();
  }, [n, _]);
  const M = async (F) => {
    try {
      await Lo(e, F), h.success("已切换 MCP 状态"), _(), t();
    } catch (I) {
      h.error(I.message || "切换失败");
    }
  }, G = async (F) => {
    try {
      await Ja(e, F), h.success(`MCP「${F}」已移除`), _(), t();
    } catch (I) {
      h.error(I.message || "移除 MCP 失败");
    }
  }, q = async () => {
    $(!0);
    try {
      const F = JSON.parse(N), I = F.mcpServers || F, ne = Object.entries(I);
      if (ne.length === 0) {
        h.warning("未找到 MCP 客户端配置");
        return;
      }
      for (const [le, D] of ne) {
        const P = D, oe = P.url ? "streamable_http" : "stdio";
        await sr(e, {
          client_key: le,
          client: {
            name: P.name || le,
            description: P.description || "",
            enabled: !0,
            transport: oe,
            url: P.url || "",
            command: P.command || "",
            args: P.args || [],
            env: P.env || {},
            cwd: P.cwd || "",
            headers: P.headers || {}
          }
        });
      }
      h.success("MCP 客户端已创建"), W(!1), _(), t();
    } catch (F) {
      F instanceof SyntaxError ? h.error("JSON 格式错误：" + F.message) : h.error(F.message || "创建 MCP 失败");
    } finally {
      $(!1);
    }
  };
  return z ? r.createElement(
    "div",
    { style: { textAlign: "center", padding: 40 } },
    r.createElement(u, { size: "large" })
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
      r.createElement(v, { strong: !0 }, `MCP 客户端 (${O.length})`),
      r.createElement(
        "div",
        { style: { display: "flex", gap: 8 } },
        r.createElement(
          c,
          {
            size: "small",
            icon: f ? r.createElement(f) : void 0,
            onClick: () => {
              Vt(), _();
            }
          },
          "刷新"
        ),
        r.createElement(
          c,
          {
            type: "primary",
            size: "small",
            icon: y ? r.createElement(y) : void 0,
            onClick: () => W(!0),
            style: qe
          },
          "添加 MCP"
        )
      )
    ),
    O.length === 0 ? r.createElement(d, {
      description: "该专家暂无 MCP 客户端",
      image: d.PRESENTED_IMAGE_SIMPLE
    }) : r.createElement(s, {
      dataSource: O,
      renderItem: (F) => r.createElement(
        s.Item,
        {
          actions: [
            r.createElement(
              c,
              {
                key: "toggle",
                size: "small",
                onClick: () => M(F.key)
              },
              F.enabled ? "停用" : "启用"
            ),
            r.createElement(
              c,
              {
                key: "del",
                type: "link",
                size: "small",
                danger: !0,
                icon: E ? r.createElement(E) : void 0,
                onClick: () => G(F.key)
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
            r.createElement(v, { strong: !0 }, F.name || F.key),
            r.createElement(
              o,
              {
                color: F.enabled ? "green" : "default",
                style: { fontSize: 10 }
              },
              F.enabled ? "启用" : "停用"
            ),
            r.createElement(
              o,
              { color: "purple", style: { fontSize: 10 } },
              F.transport
            )
          ),
          F.description ? r.createElement(
            g,
            {
              type: "secondary",
              style: { fontSize: 12, margin: 0 },
              ellipsis: { rows: 2 }
            },
            F.description
          ) : null,
          F.tools && F.tools.length > 0 ? r.createElement(
            "div",
            { style: { marginTop: 4, fontSize: 11, color: "var(--ant-color-text-tertiary, #8c8c8c)" } },
            `提供 ${F.tools.length} 个工具`
          ) : null
        )
      )
    }),
    // Create MCP modal
    r.createElement(
      m,
      {
        open: X,
        title: "添加 MCP 客户端 (JSON)",
        onCancel: () => W(!1),
        onOk: q,
        confirmLoading: k,
        okText: "创建",
        width: 560
      },
      r.createElement(
        "div",
        { style: { marginBottom: 8, fontSize: 12, color: "var(--ant-color-text-tertiary, #8c8c8c)" } },
        "粘贴 MCP 配置 JSON（支持 mcpServers 格式），将创建到当前专家工作区："
      ),
      r.createElement(x, {
        value: N,
        onChange: (F) => T(F.target.value),
        rows: 12,
        style: { fontFamily: "monospace", fontSize: 12 }
      })
    )
  );
}
function ti({ agentId: e }) {
  const t = C().React, { useState: n, useEffect: r, useCallback: a, useRef: l } = t, {
    Card: i,
    InputNumber: s,
    Input: o,
    Select: c,
    Switch: d,
    Button: u,
    Spin: m,
    Space: p,
    Typography: w,
    Divider: h,
    message: y
  } = C().antd, { SaveOutlined: f } = C().antdIcons || {}, { Text: E } = w, [v, g] = n(!0), [x, O] = n(!1), K = l(null), [z, R] = n(60), [X, W] = n(""), [N, T] = n(!0), [k, $] = n(30), [_, M] = n("zh"), [G, q] = n("UTC"), [F, I] = n(!0), [ne, le] = n(100), [D, P] = n(!0), [oe, re] = n(3), [Y, ue] = n(1), [U, ie] = n(!0), [me, A] = n(3), [S, V] = n(2), [pe, Se] = n(60), [Le, ve] = n(1), [ce, xe] = n(0), [Ie, H] = n(1), [L, se] = n(0), [he, j] = n(30), [Ee, te] = n(50), [ge, we] = n("light"), [Re, B] = n("scroll"), [ye, _e] = n("remelight"), [Fe, Ae] = n("AUTO"), Qe = a(async () => {
    var ae, $e, Me, je, Be, Pe;
    g(!0);
    try {
      const [ke, ct, dt] = await Promise.all([
        Go(e),
        Wo(e).catch(() => "zh"),
        Vo().catch(() => "UTC")
      ]);
      K.current = ke, R(ke.shell_command_timeout ?? 60), W(ke.shell_command_executable ?? "");
      const Jt = ke.auto_title_config ?? { enabled: !0, timeout_seconds: 30 };
      T(Jt.enabled ?? !0), $(Jt.timeout_seconds ?? 30), M(ct), q(dt);
      const rt = ke.loop ?? {};
      I(((ae = rt.iteration) == null ? void 0 : ae.enabled) ?? !0), le((($e = rt.iteration) == null ? void 0 : $e.max_iterations) ?? ke.max_iters ?? 100), P(((Me = rt.doom_loop) == null ? void 0 : Me.enabled) ?? !0), re(((je = rt.doom_loop) == null ? void 0 : je.window_size) ?? 3), ue(((Be = rt.doom_loop) == null ? void 0 : Be.similarity_threshold) ?? 1), ie(ke.llm_retry_enabled ?? !0), A(ke.llm_max_retries ?? 3), V(ke.llm_backoff_base ?? 2), Se(ke.llm_backoff_cap ?? 60), ve(ke.llm_max_concurrent ?? 1), xe(ke.llm_max_qpm ?? 0), H(ke.llm_rate_limit_pause ?? 1), se(ke.llm_rate_limit_jitter ?? 0), j(ke.llm_acquire_timeout ?? 30), te(ke.history_max_length ?? 50), we(ke.context_manager_backend ?? "light"), B(((Pe = ke.light_context_config) == null ? void 0 : Pe.strategy) ?? "scroll"), _e(ke.memory_manager_backend ?? "remelight"), Ae(ke.approval_level ?? "AUTO");
    } catch (ke) {
      y.error(ke.message || "加载运行配置失败");
    } finally {
      g(!1);
    }
  }, [e]);
  r(() => {
    Qe();
  }, [Qe]);
  const et = async () => {
    var $e, Me;
    const ae = K.current;
    if (ae) {
      O(!0);
      try {
        const je = {
          ...ae,
          max_iters: ne,
          loop: {
            ...ae.loop ?? {},
            iteration: { enabled: F, max_iterations: ne },
            doom_loop: {
              enabled: D,
              window_size: oe,
              similarity_threshold: Y,
              stages: ((Me = ($e = ae.loop) == null ? void 0 : $e.doom_loop) == null ? void 0 : Me.stages) ?? []
            }
          },
          shell_command_timeout: z,
          shell_command_executable: X,
          auto_title_config: {
            enabled: N,
            timeout_seconds: k
          },
          llm_retry_enabled: U,
          llm_max_retries: me,
          llm_backoff_base: S,
          llm_backoff_cap: pe,
          llm_max_concurrent: Le,
          llm_max_qpm: ce,
          llm_rate_limit_pause: Ie,
          llm_rate_limit_jitter: L,
          llm_acquire_timeout: he,
          history_max_length: Ee,
          context_manager_backend: ge,
          light_context_config: {
            ...ae.light_context_config ?? {},
            strategy: Re
          },
          memory_manager_backend: ye,
          approval_level: Fe
        };
        await Ho(e, je), K.current = je, _ && await qo(e, _).catch(() => {
        }), G && await Jo(G).catch(() => {
        }), y.success("运行配置已保存");
      } catch (je) {
        y.error(je.message || "保存运行配置失败");
      } finally {
        O(!1);
      }
    }
  };
  if (v)
    return t.createElement(
      "div",
      { style: { textAlign: "center", padding: 40 } },
      t.createElement(m, { size: "large" })
    );
  const Ge = (ae, $e, Me) => t.createElement(
    "div",
    { style: Qa },
    t.createElement("div", { style: St }, ae),
    $e,
    Me ? t.createElement(
      E,
      { type: "secondary", style: el },
      Me
    ) : null
  ), Oe = (ae, $e, Me, je) => t.createElement(
    "div",
    { style: Za },
    t.createElement(
      "div",
      null,
      t.createElement("div", { style: St }, ae),
      $e
    ),
    t.createElement(
      "div",
      null,
      t.createElement("div", { style: St }, Me),
      je
    )
  );
  return t.createElement(
    "div",
    { style: { paddingBottom: 8 } },
    // ── Section: 基础设置 ──
    t.createElement(
      "div",
      { style: lt },
      "基础设置"
    ),
    Oe(
      "Shell 命令超时 (秒)",
      t.createElement(s, {
        min: 1,
        value: z,
        onChange: (ae) => R(ae ?? 60),
        style: { width: "100%" }
      }),
      "Shell 可执行文件",
      t.createElement(o, {
        value: X,
        onChange: (ae) => W(ae.target.value),
        placeholder: "留空使用系统默认",
        style: { width: "100%" }
      })
    ),
    Oe(
      "语言",
      t.createElement(c, {
        value: _,
        onChange: (ae) => M(ae),
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
        value: G,
        onChange: (ae) => q(ae),
        style: { width: "100%" },
        showSearch: !0,
        filterOption: (ae, $e) => {
          var Me;
          return (((Me = $e == null ? void 0 : $e.label) == null ? void 0 : Me.toString()) || "").toLowerCase().includes(ae.toLowerCase());
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
        ].map((ae) => ({ value: ae, label: ae }))
      })
    ),
    Oe(
      "自动生成会话标题",
      t.createElement(p, null, t.createElement(d, {
        checked: N,
        onChange: (ae) => T(ae)
      })),
      "标题生成超时 (秒)",
      t.createElement(s, {
        min: 5,
        value: k,
        onChange: (ae) => $(ae ?? 30),
        style: { width: "100%" },
        disabled: !N
      })
    ),
    // ── Section: 审批级别 ──
    t.createElement(h, { style: { margin: "8px 0 16px" } }),
    t.createElement("div", { style: lt }, "审批级别"),
    Ge(
      "工具执行审批",
      t.createElement(c, {
        value: Fe,
        onChange: (ae) => Ae(ae),
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
    t.createElement(h, { style: { margin: "8px 0 16px" } }),
    t.createElement("div", { style: lt }, "迭代与循环"),
    Ge(
      "启用迭代限制",
      t.createElement(d, {
        checked: F,
        onChange: (ae) => I(ae)
      }),
      "停止 Agent 前的最大循环轮次"
    ),
    F ? Ge(
      "最大迭代次数",
      t.createElement(s, {
        min: 1,
        max: 500,
        value: ne,
        onChange: (ae) => le(ae ?? 100),
        style: { width: "100%" }
      })
    ) : null,
    Ge(
      "启用重复循环保护",
      t.createElement(d, {
        checked: D,
        onChange: (ae) => P(ae)
      }),
      "检测并阻止重复操作循环"
    ),
    D ? Oe(
      "检测窗口大小",
      t.createElement(s, {
        min: 2,
        max: 20,
        value: oe,
        onChange: (ae) => re(ae ?? 3),
        style: { width: "100%" }
      }),
      "相似度阈值",
      t.createElement(s, {
        min: 0,
        max: 1,
        step: 0.05,
        value: Y,
        onChange: (ae) => ue(ae ?? 1),
        style: { width: "100%" }
      })
    ) : null,
    // ── Section: LLM 重试 ──
    t.createElement(h, { style: { margin: "8px 0 16px" } }),
    t.createElement("div", { style: lt }, "LLM 重试"),
    Ge(
      "启用 LLM 重试",
      t.createElement(d, {
        checked: U,
        onChange: (ae) => ie(ae)
      })
    ),
    Oe(
      "最大重试次数",
      t.createElement(s, {
        min: 1,
        value: me,
        onChange: (ae) => A(ae ?? 3),
        style: { width: "100%" },
        disabled: !U
      }),
      "退避基数 (秒)",
      t.createElement(s, {
        min: 0.1,
        step: 0.1,
        value: S,
        onChange: (ae) => V(ae ?? 2),
        style: { width: "100%" },
        disabled: !U
      })
    ),
    Ge(
      "退避上限 (秒)",
      t.createElement(s, {
        min: 0.5,
        step: 0.5,
        value: pe,
        onChange: (ae) => Se(ae ?? 60),
        style: { width: 200 },
        disabled: !U
      })
    ),
    // ── Section: LLM 限流 ──
    t.createElement(h, { style: { margin: "8px 0 16px" } }),
    t.createElement("div", { style: lt }, "LLM 限流"),
    Oe(
      "最大并发数",
      t.createElement(s, {
        min: 1,
        value: Le,
        onChange: (ae) => ve(ae ?? 1),
        style: { width: "100%" }
      }),
      "最大 QPM (0=不限)",
      t.createElement(s, {
        min: 0,
        step: 10,
        value: ce,
        onChange: (ae) => xe(ae ?? 0),
        style: { width: "100%" }
      })
    ),
    Oe(
      "限流暂停时间 (秒)",
      t.createElement(s, {
        min: 1,
        step: 0.5,
        value: Ie,
        onChange: (ae) => H(ae ?? 1),
        style: { width: "100%" }
      }),
      "限流抖动 (秒)",
      t.createElement(s, {
        min: 0,
        step: 0.5,
        value: L,
        onChange: (ae) => se(ae ?? 0),
        style: { width: "100%" }
      })
    ),
    Ge(
      "获取超时 (秒)",
      t.createElement(s, {
        min: 10,
        step: 10,
        value: he,
        onChange: (ae) => j(ae ?? 30),
        style: { width: 200 }
      }),
      "应大于 限流暂停 + 抖动"
    ),
    // ── Section: 上下文与记忆 ──
    t.createElement(h, { style: { margin: "8px 0 16px" } }),
    t.createElement("div", { style: lt }, "上下文与记忆"),
    Oe(
      "上下文管理后端",
      t.createElement(c, {
        value: ge,
        onChange: (ae) => we(ae),
        style: { width: "100%" },
        options: [{ value: "light", label: "light" }]
      }),
      "上下文策略",
      t.createElement(c, {
        value: Re,
        onChange: (ae) => B(ae),
        style: { width: "100%" },
        options: [
          { value: "scroll", label: "scroll (滚动窗口)" },
          { value: "native", label: "native (原生)" }
        ]
      })
    ),
    Oe(
      "记忆管理后端",
      t.createElement(c, {
        value: ye,
        onChange: (ae) => _e(ae),
        style: { width: "100%" },
        options: [
          { value: "remelight", label: "remelight" },
          { value: "adbpg", label: "adbpg" },
          { value: "none", label: "none (禁用)" }
        ]
      }),
      "历史消息最大长度",
      t.createElement(s, {
        min: 1,
        value: Ee,
        onChange: (ae) => te(ae ?? 50),
        style: { width: "100%" }
      })
    ),
    // ── Save button ──
    t.createElement(
      "div",
      { style: { display: "flex", justifyContent: "flex-end", marginTop: 16 } },
      t.createElement(
        u,
        {
          type: "primary",
          icon: f ? t.createElement(f) : void 0,
          loading: x,
          onClick: et,
          style: qe
        },
        "保存运行配置"
      )
    )
  );
}
function ni({
  expert: e,
  open: t,
  onClose: n,
  onRefresh: r
}) {
  const a = C().React, { useState: l, useEffect: i, useCallback: s } = a, { Modal: o, Tabs: c, Spin: d, Typography: u } = C().antd, { SettingOutlined: m } = C().antdIcons || {}, { Text: p } = u, [w, h] = l([]), [y, f] = l(!1), [E, v] = l("heartbeat"), g = s(async () => {
    if (e) {
      f(!0);
      try {
        const z = await Ko(e.agent.id);
        h(z);
      } catch {
        h([]);
      } finally {
        f(!1);
      }
    }
  }, [e]);
  if (i(() => {
    t && e && g();
  }, [t, e, g]), !e) return null;
  const { agent: x } = e, O = () => {
    g(), r();
  }, K = [
    {
      key: "heartbeat",
      label: "心跳",
      children: a.createElement(Qo, {
        agentId: x.id
      })
    },
    {
      key: "files",
      label: "文件",
      children: y ? a.createElement(
        "div",
        { style: { textAlign: "center", padding: 40 } },
        a.createElement(d, { size: "large" })
      ) : a.createElement(Ya, {
        agentId: x.id,
        systemPromptFiles: w,
        onRefresh: O
      })
    },
    {
      key: "skills",
      label: `技能 (${e.skills.filter((z) => z.enabled !== !1).length})`,
      children: a.createElement(Zo, {
        agentId: x.id,
        onRefresh: r
      })
    },
    {
      key: "mcp",
      label: `MCP (${e.mcps.length})`,
      children: a.createElement(ei, {
        agentId: x.id,
        onRefresh: r,
        isActive: E === "mcp"
      })
    },
    {
      key: "running",
      label: "运行配置",
      children: a.createElement(ti, {
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
        m ? a.createElement(m, { style: { fontSize: 18 } }) : null,
        a.createElement("span", null, `配置 - ${x.name}`),
        a.createElement(
          p,
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
      items: K,
      activeKey: E,
      onChange: (z) => v(z),
      size: "small",
      tabBarStyle: { marginBottom: 16 }
    })
  );
}
const tl = [
  {
    id: "storage-production-analyst",
    name: "储气库生产动态分析师",
    category: "储气库运行",
    description: "**储气库生产动态分析师** —— 从注采日记录分析库井动态、气年度、压力响应和复核线索，输出可追溯的分析报告与条件性短期基线。",
    version: "1.0.0",
    author: "UGSci Team",
    tags: ["储气库", "注采动态", "压力响应", "异常筛查", "数据审计"],
    avatar_seed: "储气库生产动态分析师",
    system_prompt: `# 储气库生产动态分析师

你是 UGSci 储气库生产动态分析专用 agent，服务于储气库运行与科研人员。
你的身份、风格与工作流程已初始化，直接处理领域任务，不再询问称呼或首次启动设定。
先使用 ugsci_storage_history_list 查已有数据，新文件使用 ugsci_storage_history_import 导入；使用 ugsci_storage_dynamics_analyze 完成确定性分析和报告。专用流程见 storage-production-dynamics 技能。
优先检查数据覆盖、日量单位、缺测、重复冲突及 XLS 65,536 行截断。数据日期不是当前实时工况。
区分计量日量与 24h 运行折算量；累计量只能来自原表日量。按照实际运行阶段与用户定义气年度比较，不跨停井、缺测和注采切换拟合普通递减。
记录数按注气、采气分别核对，汇总记录数不能称为全部采气记录。实测零、缺测与无记录日期必须分别表述。
井口油压保留原意，不用作地层压力；净计量变化不等于当前库存或工作气量。缺少期初库存、完整历史、气损、PVT、试井或设施边界时列出具体缺项。
异常只作为复核线索，结合调度、气嘴、计量、小时、压力、出水与备注解释，不声称已诊断故障。短期基线必须报告保持工况的条件与回测误差。
用户提供明确工程边界后可衔接平台库存评价、注采分配工具，历史最大气量不能充当允许操作上限。
输出结论、证据表、优先复核行动和报告路径；每个异常注明原文件、工作表、行号。给出引擎版本与数据指纹。不得发送现场控制指令。`,
    profile_prompt: `# 身份

名字：储气库生产动态分析师
定位：UGSci 储气库运行与科研分析助手
风格：中文、严谨、简洁，以数据证据和可追溯结果为依据。

身份已初始化，直接分析用户问题。
`,
    recommended_skills: [
      "storage-production-dynamics",
      "oil-gas-reservoir-production",
      "scada-timeseries",
      "statistical-analysis",
      "matplotlib"
    ],
    knowledge_files: [],
    mcp_clients: [],
    memory_seeds: [],
    approval_level: "AUTO",
    welcome_message: "提供注采记录目录，我会检查数据覆盖并分析库井生产动态。"
  },
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
], ri = tl;
function Jr(e) {
  return bn(`/ugsci/avatar/${encodeURIComponent(e)}`);
}
function Kr(e) {
  const t = e.map(encodeURIComponent).join(",");
  return bn(`/ugsci/avatar/team/${t}`);
}
function nt({
  name: e,
  size: t = 32,
  borderRadius: n = "50%"
}) {
  const r = C().React, [a, l] = r.useState(0), i = a === 0 ? Jr(e) : `${Jr(e)}?_r=${a}`;
  return r.createElement("img", {
    src: i,
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
function cr({
  members: e,
  size: t = 32,
  borderRadius: n = "50%"
}) {
  const r = C().React, [a, l] = r.useState(0);
  if (!e || e.length === 0)
    return r.createElement("span", {
      style: {
        width: t,
        height: t,
        display: "inline-block"
      }
    });
  const i = e.slice(0, 5), s = a === 0 ? Kr(i) : `${Kr(i)}?_r=${a}`;
  return r.createElement("img", {
    src: s,
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
async function Xr(e) {
  var n;
  const t = C();
  if (t.refreshAgents)
    try {
      await t.refreshAgents({ force: !0 });
    } catch (r) {
      console.warn("[ugsci] Failed to refresh newly created agent:", r);
      return;
    }
  (n = t.setSelectedAgent) == null || n.call(t, e);
}
function ai(e) {
  return e.slice(0, 2).join("、") + (e.length > 2 ? ` 等 ${e.length} 项` : "");
}
function li({
  expert: e,
  onClick: t,
  onSummon: n,
  onConfigure: r
}) {
  var g, x;
  const a = C().React, { Card: l, Badge: i, Button: s, Tooltip: o } = C().antd, { ThunderboltOutlined: c, SettingOutlined: d } = C().antdIcons || {}, { agent: u, skills: m } = e, p = u.enabled, w = m.filter((O) => O.enabled !== !1), h = tl.find(
    (O) => O.id === u.id || O.name === u.name
  ), y = Array.from(
    new Set(
      (g = h == null ? void 0 : h.tags) != null && g.length ? h.tags : w.flatMap((O) => O.tags || [])
    )
  ).slice(0, 3), f = (h == null ? void 0 : h.category) || (u.id === "default" ? "通用助手" : "自定义专家"), E = ((x = u.description) == null ? void 0 : x.trim()) || "", v = w.map((O) => O.name);
  return a.createElement(
    l,
    {
      hoverable: !0,
      onClick: t,
      size: "small",
      style: {
        cursor: "pointer",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
        borderColor: p ? void 0 : "var(--ant-color-border, #d9d9d9)",
        opacity: p ? 1 : 0.7,
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
          flex: 1,
          padding: 18
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
          gap: 8,
          marginBottom: 14
        }
      },
      a.createElement(
        "div",
        {
          style: {
            display: "flex",
            alignItems: "center",
            gap: 11,
            minWidth: 0
          }
        },
        a.createElement(nt, { name: u.name, size: 42 }),
        a.createElement(
          "div",
          { style: { minWidth: 0 } },
          a.createElement(
            "div",
            {
              style: {
                fontSize: 15,
                fontWeight: 650,
                lineHeight: 1.4,
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden"
              }
            },
            u.name
          ),
          a.createElement(
            "div",
            {
              style: {
                fontSize: 12,
                color: "var(--ant-color-text-secondary, #595959)",
                marginTop: 3
              }
            },
            f
          )
        )
      ),
      a.createElement(
        "span",
        { style: { flexShrink: 0, whiteSpace: "nowrap" } },
        a.createElement(i, {
          status: p ? "success" : "default",
          text: p ? "启用" : "停用"
        })
      )
    ),
    a.createElement(
      "div",
      { style: { minHeight: 48, marginBottom: 12 } },
      a.createElement(
        "div",
        {
          style: {
            fontSize: 11,
            color: "var(--ant-color-text-tertiary, #8c8c8c)",
            marginBottom: 6
          }
        },
        "能力标签"
      ),
      y.length > 0 ? a.createElement(Xo, {
        items: y,
        max: 3,
        color: "blue"
      }) : a.createElement(
        "span",
        {
          style: {
            fontSize: 12,
            color: "var(--ant-color-text-secondary, #595959)"
          }
        },
        v.length ? ai(v) : "尚未配置技能，可在专家配置中补充"
      )
    ),
    a.createElement(
      "div",
      { style: { marginTop: "auto", minHeight: 78 } },
      a.createElement(
        "div",
        {
          style: {
            fontSize: 11,
            color: "var(--ant-color-text-tertiary, #8c8c8c)",
            marginBottom: 6
          }
        },
        "智能体描述"
      ),
      a.createElement(
        "div",
        {
          style: {
            color: "var(--ant-color-text-secondary, #595959)",
            fontSize: 13,
            lineHeight: 1.5,
            maxHeight: 58,
            overflow: "hidden"
          },
          title: E
        },
        E ? vn(E, a) : "暂无描述"
      )
    ),
    a.createElement(
      "div",
      {
        style: {
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
          gap: 6,
          marginTop: 14,
          paddingTop: 12,
          borderTop: "1px solid var(--ant-color-border-secondary, #f0f0f0)"
        }
      },
      a.createElement(
        o,
        { title: "配置专家", placement: "top" },
        a.createElement(s, {
          type: "text",
          size: "small",
          "aria-label": `配置 ${u.name}`,
          icon: d ? a.createElement(d, {
            style: {
              fontSize: 16,
              color: "var(--ant-color-text-tertiary, #8c8c8c)"
            }
          }) : void 0,
          onClick: (O) => {
            O.stopPropagation(), r && r();
          }
        })
      ),
      a.createElement(
        s,
        {
          type: "link",
          size: "small",
          onClick: (O) => {
            O.stopPropagation(), t();
          }
        },
        "查看详情"
      ),
      a.createElement(
        s,
        {
          type: "primary",
          size: "small",
          icon: c ? a.createElement(c) : void 0,
          disabled: !p,
          onClick: (O) => {
            O.stopPropagation(), n && n();
          },
          style: qe
        },
        "召唤专家"
      )
    )
  );
}
function oi({
  expert: e,
  open: t,
  onClose: n,
  onRefresh: r
}) {
  const a = C().React, {
    Drawer: l,
    Descriptions: i,
    Tag: s,
    Typography: o,
    Space: c,
    Button: d,
    Empty: u,
    Tabs: m,
    List: p,
    Spin: w,
    Modal: h,
    message: y
  } = C().antd, { Text: f, Paragraph: E } = o, {
    EditOutlined: v,
    ThunderboltOutlined: g,
    FileTextOutlined: x,
    ToolOutlined: O,
    PlusOutlined: K
  } = C().antdIcons || {}, [z, R] = a.useState(!1), [X, W] = a.useState(
    []
  ), [N, T] = a.useState(!1);
  if (!e) return null;
  const { agent: k, config: $, skills: _, mcps: M, loading: G } = e, q = _.filter((U) => U.enabled !== !1), F = (U) => {
    window.history.pushState({}, "", U), window.dispatchEvent(new PopStateEvent("popstate"));
  }, I = a.createElement(
    "div",
    null,
    a.createElement(
      i,
      { column: 1, bordered: !0, size: "small" },
      a.createElement(i.Item, { label: "专家名称" }, k.name),
      a.createElement(
        i.Item,
        { label: "专家 ID" },
        a.createElement("code", { style: { fontSize: 12 } }, k.id)
      ),
      a.createElement(
        i.Item,
        { label: "状态" },
        a.createElement(
          s,
          { color: k.enabled ? "green" : "default" },
          k.enabled ? "启用" : "停用"
        )
      ),
      a.createElement(
        i.Item,
        { label: "功能简介" },
        k.description ? vn(k.description, a) : "暂无描述"
      ),
      a.createElement(
        i.Item,
        { label: "使用模型" },
        k.active_model ? `${k.active_model.provider_id} / ${k.active_model.model}` : "使用全局默认模型"
      ),
      $ != null && $.workspace_dir ? a.createElement(
        i.Item,
        { label: "工作区路径" },
        a.createElement(
          "code",
          { style: { fontSize: 11 } },
          $.workspace_dir
        )
      ) : null,
      $ != null && $.approval_level ? a.createElement(
        i.Item,
        { label: "审批级别" },
        $.approval_level
      ) : null
    ),
    // System prompt files
    $ != null && $.system_prompt_files && $.system_prompt_files.length > 0 ? a.createElement(
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
        a.createElement(f, { strong: !0 }, "系统提示词文件")
      ),
      a.createElement(
        c,
        { wrap: !0 },
        ...$.system_prompt_files.map(
          (U, ie) => a.createElement(
            s,
            {
              key: ie,
              icon: x ? a.createElement(x) : void 0,
              style: { fontSize: 12 }
            },
            U
          )
        )
      )
    ) : null
  ), ne = async () => {
    R(!0), T(!0);
    try {
      const U = await kn(!0);
      W(U);
    } catch (U) {
      y.error(U.message || "加载技能池失败");
    } finally {
      T(!1);
    }
  }, le = async (U) => {
    let ie = 0, me = 0;
    for (const A of U)
      try {
        await lr(k.id, A), ie++;
      } catch {
        me++;
      }
    ie > 0 ? (y.success(
      `成功添加 ${ie} 个技能${me > 0 ? `，${me} 个失败` : ""}`
    ), r()) : me > 0 && y.error("添加技能失败"), R(!1);
  }, D = async (U) => {
    try {
      await or(k.id, U), y.success(`技能「${U}」已移除`), r();
    } catch (ie) {
      y.error(ie.message || "移除技能失败");
    }
  }, P = async (U) => {
    try {
      await Ja(k.id, U), y.success(`MCP「${U}」已移除`), r();
    } catch (ie) {
      y.error(ie.message || "移除 MCP 失败");
    }
  }, oe = G ? a.createElement(
    "div",
    { style: { textAlign: "center", padding: 40 } },
    a.createElement(w, { size: "large" })
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
        f,
        { strong: !0 },
        `已启用技能 (${q.length})`
      ),
      a.createElement(
        d,
        {
          type: "primary",
          size: "small",
          icon: K ? a.createElement(K) : void 0,
          onClick: ne
        },
        "从技能池添加"
      )
    ),
    q.length === 0 ? a.createElement(u, {
      description: "该专家暂无已启用的技能",
      image: u.PRESENTED_IMAGE_SIMPLE
    }) : a.createElement(p, {
      dataSource: q,
      renderItem: (U) => a.createElement(
        p.Item,
        {
          actions: [
            a.createElement(
              d,
              {
                type: "link",
                size: "small",
                danger: !0,
                onClick: () => D(U.name)
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
            a.createElement(f, { strong: !0 }, U.name),
            U.version_text ? a.createElement(
              s,
              { style: { fontSize: 10 } },
              `v${U.version_text}`
            ) : null
          ),
          U.description ? a.createElement(
            E,
            {
              type: "secondary",
              style: { fontSize: 12, margin: 0 },
              ellipsis: { rows: 2 }
            },
            U.description
          ) : null,
          U.tags && U.tags.length > 0 ? a.createElement(
            "div",
            { style: { marginTop: 4 } },
            ...U.tags.map(
              (ie, me) => a.createElement(
                s,
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
    a.createElement(Xa, {
      open: z,
      onClose: () => R(!1),
      poolSkills: X,
      installedSkillNames: q.map((U) => U.name),
      loading: N,
      onInstall: le
    })
  ), re = G ? a.createElement(
    "div",
    { style: { textAlign: "center", padding: 40 } },
    a.createElement(w, { size: "large" })
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
        f,
        { strong: !0 },
        `MCP 客户端 (${M.length})`
      ),
      a.createElement(
        d,
        {
          type: "primary",
          size: "small",
          icon: K ? a.createElement(K) : void 0,
          onClick: () => {
            window.history.pushState({}, "", `/agents/${k.id}/mcp`), window.dispatchEvent(new PopStateEvent("popstate"));
          }
        },
        "配置 MCP"
      )
    ),
    M.length === 0 ? a.createElement(u, {
      description: "该专家暂无关联的 MCP 客户端，点击「配置 MCP」添加",
      image: u.PRESENTED_IMAGE_SIMPLE
    }) : a.createElement(p, {
      dataSource: M,
      renderItem: (U) => a.createElement(
        p.Item,
        {
          actions: [
            a.createElement(
              d,
              {
                type: "link",
                size: "small",
                danger: !0,
                onClick: () => P(U.key)
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
              f,
              { strong: !0 },
              U.name || U.key
            ),
            a.createElement(
              s,
              {
                color: U.enabled ? "green" : "default",
                style: { fontSize: 10 }
              },
              U.enabled ? "启用" : "停用"
            ),
            a.createElement(
              s,
              { color: "purple", style: { fontSize: 10 } },
              U.transport
            )
          ),
          U.description ? a.createElement(
            E,
            {
              type: "secondary",
              style: { fontSize: 12, margin: 0 },
              ellipsis: { rows: 2 }
            },
            U.description
          ) : null,
          U.tools && U.tools.length > 0 ? a.createElement(
            "div",
            {
              style: {
                marginTop: 4,
                fontSize: 11,
                color: "var(--ant-color-text-tertiary, #8c8c8c)"
              }
            },
            `提供 ${U.tools.length} 个工具`
          ) : null
        )
      )
    })
  ), Y = $ != null && $.tools ? a.createElement(
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
        O ? a.createElement(O, {
          style: { fontSize: 14, color: "#1677ff" }
        }) : null,
        a.createElement(f, { strong: !0 }, "工具配置")
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
        JSON.stringify($.tools, null, 2)
      )
    )
  ) : a.createElement(u, {
    description: "暂无工具配置",
    image: u.PRESENTED_IMAGE_SIMPLE
  }), ue = [
    { key: "basic", label: "基本信息", children: I },
    {
      key: "skills",
      label: `技能 (${q.length})`,
      children: oe
    },
    {
      key: "prompts",
      label: "推荐提问",
      children: a.createElement(Yo, {
        skills: q,
        agentId: k.id
      })
    },
    {
      key: "knowledge",
      label: "专家记忆",
      children: a.createElement(Ya, {
        agentId: k.id,
        systemPromptFiles: ($ == null ? void 0 : $.system_prompt_files) || [],
        onRefresh: () => r()
      })
    },
    { key: "mcp", label: `MCP (${M.length})`, children: re },
    { key: "tools", label: "工具配置", children: Y }
  ];
  return a.createElement(
    l,
    {
      title: a.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 8 } },
        a.createElement(nt, { name: k.name, size: 28 }),
        a.createElement("span", null, k.name)
      ),
      open: t,
      onClose: n,
      width: 560,
      extra: a.createElement(
        c,
        null,
        a.createElement(
          d,
          {
            size: "small",
            icon: v ? a.createElement(v) : void 0,
            onClick: () => {
              n();
              try {
                const U = C();
                U.setSelectedAgent && U.setSelectedAgent(k.id);
              } catch (U) {
                console.warn("[ugsci] Failed to set selected agent:", U);
              }
              setTimeout(() => F("/agents"), 0);
            }
          },
          "编辑专家"
        ),
        a.createElement(
          d,
          {
            type: "primary",
            size: "small",
            icon: g ? a.createElement(g) : void 0,
            onClick: () => {
              n();
              try {
                const U = C();
                U.setSelectedAgent && U.setSelectedAgent(k.id);
              } catch (U) {
                console.warn("[ugsci] Failed to set selected agent:", U);
              }
              setTimeout(() => F("/chat"), 0);
            }
          },
          "开始对话"
        )
      )
    },
    a.createElement(m, {
      items: ue,
      defaultActiveKey: "basic"
    })
  );
}
function ii({
  open: e,
  onClose: t,
  onCreated: n
}) {
  const r = C().React, { useState: a } = r, {
    Modal: l,
    Card: i,
    Tag: s,
    Input: o,
    Row: c,
    Col: d,
    Spin: u,
    message: m,
    Typography: p
  } = C().antd, { Text: w } = p, { FileAddOutlined: h } = C().antdIcons || {}, [y, f] = a(!1), [E, v] = a(""), [g, x] = a(!1), O = async (R) => {
    f(!0);
    try {
      const X = await de("/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: R.id || void 0,
          name: R.name,
          description: R.description,
          skill_names: R.skillNames
        })
      }), W = R.systemPrompt.trim() || `# ${R.name}

你是${R.name}。${R.description ? `

职责：${R.description}` : ""}
`, T = (await Promise.allSettled([
        vt(X.id, "AGENTS.md", W),
        ...R.mcpClients.map(
          ({ clientKey: k, client: $ }) => sr(X.id, {
            client_key: k,
            client: $
          })
        )
      ])).filter(
        (k) => k.status === "rejected"
      ).length;
      T > 0 ? m.warning(
        `专家「${R.name}」已创建，${T} 项初始配置失败，可在专家配置中重试`
      ) : m.success(`专家「${R.name}」创建成功`), await Xr(X.id), x(!1), setTimeout(() => {
        t(), n();
      }, 0);
    } catch (X) {
      m.error(X.message || "创建专家失败");
    } finally {
      f(!1);
    }
  }, K = ri.filter((R) => {
    if (!E.trim()) return !0;
    const X = E.toLowerCase();
    return R.name.toLowerCase().includes(X) || R.description.toLowerCase().includes(X) || R.category.toLowerCase().includes(X);
  }), z = async (R) => {
    f(!0);
    try {
      const X = await de("/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: R.name,
          description: R.description,
          skill_names: R.recommended_skills
        })
      });
      await vt(
        X.id,
        "AGENTS.md",
        R.system_prompt
      ), R.profile_prompt && (await vt(
        X.id,
        "PROFILE.md",
        R.profile_prompt
      ), await vt(
        X.id,
        "BOOTSTRAP.md",
        `# 初始化已完成

此专家已按 UGSci 模板设置身份、风格与领域技能。直接执行 AGENTS.md 的领域工作流程，无需再次询问称呼、风格或初始化设置。
`
      ));
      const W = await ar(X.id);
      W.approval_level = R.approval_level, await de(`/agents/${encodeURIComponent(X.id)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(W)
      }), await Xr(X.id), m.success(`专家「${R.name}」创建成功`), t(), n();
    } catch (X) {
      m.error(X.message || "创建专家失败");
    } finally {
      f(!1);
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
          onChange: (R) => v(R.target.value),
          allowClear: !0
        })
      ),
      y ? r.createElement(
        "div",
        { style: { textAlign: "center", padding: 60 } },
        r.createElement(u, { size: "large" }),
        r.createElement(
          "div",
          {
            style: {
              marginTop: 12,
              color: "var(--ant-color-text-tertiary, #8c8c8c)"
            }
          },
          "正在创建专家..."
        )
      ) : r.createElement(
        c,
        { gutter: [12, 12] },
        // ── Blank template card (always first) ──
        E.trim() ? null : r.createElement(
          d,
          { xs: 24, sm: 12 },
          r.createElement(
            i,
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
                {
                  style: {
                    fontSize: 28,
                    color: "var(--ant-color-text-tertiary, #8c8c8c)"
                  }
                },
                h ? r.createElement(h) : "📝"
              ),
              r.createElement(
                "div",
                { style: { flex: 1 } },
                r.createElement(
                  w,
                  { strong: !0, style: { fontSize: 15 } },
                  "从空白模版开始创建"
                ),
                r.createElement(
                  "div",
                  null,
                  r.createElement(
                    s,
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
        ...K.map(
          (R) => r.createElement(
            d,
            { key: R.id, xs: 24, sm: 12 },
            r.createElement(
              i,
              {
                hoverable: !0,
                size: "small",
                onClick: () => z(R),
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
                r.createElement(nt, {
                  name: R.name,
                  size: 40
                }),
                r.createElement(
                  "div",
                  { style: { flex: 1 } },
                  r.createElement(
                    w,
                    { strong: !0, style: { fontSize: 15 } },
                    R.name
                  ),
                  r.createElement(
                    "div",
                    null,
                    r.createElement(
                      s,
                      { color: "blue", style: { fontSize: 10 } },
                      R.category
                    ),
                    R.approval_level === "MANUAL" ? r.createElement(
                      s,
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
                vn(R.description, r)
              )
            )
          )
        )
      )
    ),
    // ── Blank template creation modal (sibling, not nested inside Modal) ──
    r.createElement(ci, {
      open: g,
      onCancel: () => x(!1),
      onCreate: O
    })
  );
}
function At(e) {
  return typeof e == "object" && e !== null && !Array.isArray(e);
}
function si(e) {
  const t = e.trim();
  if (!t) return [];
  const n = JSON.parse(t);
  if (!At(n))
    throw new Error("MCP 配置必须是 JSON 对象");
  const r = n.mcpServers ?? n;
  if (!At(r))
    throw new Error("mcpServers 必须是 JSON 对象");
  return Object.entries(r).map(([a, l]) => {
    const i = a.trim();
    if (!i || !At(l))
      throw new Error(`MCP「${a || "未命名"}」配置无效`);
    const s = typeof l.url == "string" ? l.url : "", o = typeof l.command == "string" ? l.command : "";
    if (!s && !o)
      throw new Error(`MCP「${i}」需要配置 url 或 command`);
    const d = (typeof l.transport == "string" ? l.transport : typeof l.type == "string" ? l.type : "") === "sse" ? "sse" : s ? "streamable_http" : "stdio";
    return {
      clientKey: i,
      client: {
        name: typeof l.name == "string" ? l.name : i,
        description: typeof l.description == "string" ? l.description : "",
        enabled: typeof l.enabled == "boolean" ? l.enabled : !0,
        transport: d,
        url: s,
        command: o,
        args: Array.isArray(l.args) ? l.args : [],
        env: At(l.env) ? l.env : {},
        cwd: typeof l.cwd == "string" ? l.cwd : "",
        headers: At(l.headers) ? l.headers : {}
      }
    };
  });
}
function ci({
  open: e,
  onCancel: t,
  onCreate: n
}) {
  const r = C().React, { useState: a, useEffect: l, useMemo: i } = r, {
    Modal: s,
    Input: o,
    Select: c,
    Button: d,
    Row: u,
    Col: m,
    Spin: p,
    Tag: w,
    Typography: h,
    message: y
  } = C().antd, { CheckCircleOutlined: f } = C().antdIcons || {}, { Text: E } = h, [v, g] = a(""), [x, O] = a(""), [K, z] = a(""), [R, X] = a(""), [W, N] = a([]), [T, k] = a([]), [$, _] = a(!1), [M, G] = a(""), [q, F] = a(!1);
  l(() => {
    e && (g(""), O(""), z(""), X(""), k([]), G(""), F(!1), _(!0), kn(!0).then(N).catch((re) => {
      N([]), y.error(re.message || "加载技能池失败");
    }).finally(() => _(!1)));
  }, [e]);
  const I = x.trim(), ne = i(() => I ? I.length < 2 || I.length > 64 ? "ID 长度需为 2-64 个字符" : /^[a-zA-Z0-9][a-zA-Z0-9_-]*[a-zA-Z0-9]$/.test(I) ? I === "default" ? "default 是系统保留 ID" : "" : "仅允许字母、数字、连字符和下划线，且不能以符号开头或结尾" : "", [I]), le = i(() => {
    try {
      return { clients: si(M), error: "" };
    } catch (re) {
      return {
        clients: [],
        error: re.message || "MCP 配置无效"
      };
    }
  }, [M]), D = () => {
    const re = v.trim();
    if (!re) {
      y.warning("请输入专家名称");
      return;
    }
    if (ne) {
      y.warning(ne);
      return;
    }
    if (le.error) {
      y.warning(le.error);
      return;
    }
    F(!0), Promise.resolve(
      n({
        id: I,
        name: re,
        description: K.trim(),
        systemPrompt: R,
        skillNames: T,
        mcpClients: le.clients
      })
    ).finally(() => F(!1));
  }, P = () => {
    k(
      W.filter((re) => re.source === "builtin").map((re) => re.name)
    );
  }, oe = (re, Y) => r.createElement(
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
    r.createElement(
      E,
      { strong: !0, style: { fontSize: 15 } },
      re
    ),
    Y ? r.createElement(
      E,
      { type: "secondary", style: { fontSize: 12 } },
      Y
    ) : null
  );
  return r.createElement(
    s,
    {
      open: e,
      title: "创建专家",
      onCancel: t,
      onOk: D,
      okText: "创建专家",
      cancelText: "取消",
      okButtonProps: { loading: q },
      maskClosable: !0,
      keyboard: !0,
      width: 880,
      styles: { body: { maxHeight: "72vh", overflowY: "auto", paddingTop: 8 } }
    },
    r.createElement(
      "div",
      { style: { paddingBottom: 20 } },
      oe("基本信息", "ID 留空时自动生成"),
      r.createElement(
        u,
        { gutter: [16, 12] },
        r.createElement(
          m,
          { xs: 24, md: 12 },
          r.createElement(
            "label",
            { style: { display: "block", fontSize: 13, marginBottom: 6 } },
            "专家名称",
            r.createElement(
              "span",
              { style: { color: "#ff4d4f", marginLeft: 4 } },
              "*"
            )
          ),
          r.createElement(o, {
            placeholder: "例如：合同审查专家",
            value: v,
            onChange: (re) => g(re.target.value),
            maxLength: 50
          })
        ),
        r.createElement(
          m,
          { xs: 24, md: 12 },
          r.createElement(
            "label",
            { style: { display: "block", fontSize: 13, marginBottom: 6 } },
            "智能体 ID（可选）"
          ),
          r.createElement(o, {
            placeholder: "例如：contract-reviewer",
            value: x,
            onChange: (re) => O(re.target.value),
            maxLength: 64,
            status: ne ? "error" : void 0
          }),
          ne ? r.createElement(
            "div",
            { style: { color: "#ff4d4f", fontSize: 12, marginTop: 4 } },
            ne
          ) : null
        ),
        r.createElement(
          m,
          { span: 24 },
          r.createElement(
            "label",
            { style: { display: "block", fontSize: 13, marginBottom: 6 } },
            "专家描述（可选）"
          ),
          r.createElement(o.TextArea, {
            placeholder: "简要描述该专家的职责和能力",
            value: K,
            onChange: (re) => z(re.target.value),
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
      oe("角色指令", "保存为 AGENTS.md"),
      r.createElement(o.TextArea, {
        placeholder: "定义专家的角色、目标、工作方式和输出要求；留空时将根据名称与描述生成基础指令",
        value: R,
        onChange: (re) => X(re.target.value),
        rows: 6,
        style: {
          fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
          fontSize: 12
        }
      })
    ),
    r.createElement(
      "div",
      { style: { borderTop: "1px solid #f0f0f0", paddingTop: 20 } },
      oe("初始能力"),
      r.createElement(
        u,
        { gutter: [20, 16], align: "top" },
        r.createElement(
          m,
          { xs: 24, md: 12 },
          r.createElement(
            "div",
            {
              style: {
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 8
              }
            },
            r.createElement(E, { strong: !0 }, "初始技能"),
            r.createElement(
              "div",
              { style: { display: "flex", gap: 4 } },
              r.createElement(
                d,
                {
                  size: "small",
                  onClick: P,
                  disabled: $
                },
                "内置"
              ),
              r.createElement(
                d,
                {
                  size: "small",
                  onClick: () => k([]),
                  disabled: T.length === 0
                },
                "清空"
              )
            )
          ),
          $ ? r.createElement(
            "div",
            { style: { textAlign: "center", padding: 32 } },
            r.createElement(p, { size: "small" })
          ) : r.createElement(c, {
            mode: "multiple",
            value: T,
            onChange: k,
            placeholder: "搜索并选择技能",
            showSearch: !0,
            allowClear: !0,
            optionFilterProp: "label",
            maxTagCount: "responsive",
            style: { width: "100%" },
            options: W.map((re) => ({
              value: re.name,
              label: re.name
            })),
            notFoundContent: "暂无可用技能"
          }),
          r.createElement(
            "div",
            { style: { marginTop: 8, minHeight: 22 } },
            T.length > 0 ? r.createElement(
              w,
              { color: "blue" },
              `已选择 ${T.length} 个技能`
            ) : r.createElement(
              E,
              { type: "secondary", style: { fontSize: 12 } },
              "暂不添加技能"
            )
          )
        ),
        r.createElement(
          m,
          { xs: 24, md: 12 },
          r.createElement(
            E,
            { strong: !0, style: { display: "block", marginBottom: 8 } },
            "初始 MCP"
          ),
          r.createElement(o.TextArea, {
            placeholder: `{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem"]
    }
  }
}`,
            value: M,
            onChange: (re) => G(re.target.value),
            rows: 8,
            status: le.error ? "error" : void 0,
            style: {
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
              fontSize: 12
            }
          }),
          r.createElement(
            "div",
            { style: { marginTop: 8, minHeight: 22 } },
            le.error ? r.createElement(
              E,
              { type: "danger", style: { fontSize: 12 } },
              le.error
            ) : le.clients.length > 0 ? r.createElement(
              w,
              {
                color: "green",
                icon: f ? r.createElement(f) : void 0
              },
              `已识别 ${le.clients.length} 个 MCP`
            ) : r.createElement(
              E,
              { type: "secondary", style: { fontSize: 12 } },
              "暂不添加 MCP"
            )
          )
        )
      )
    )
  );
}
const nl = "ugsci_custom_teams";
function di(e) {
  if (!e || typeof e != "object") return !1;
  const t = e;
  return typeof t.id == "string" && typeof t.name == "string" && typeof t.taskTemplate == "string" && typeof t.orchestrationPrompt == "string" && Array.isArray(t.members);
}
function ui() {
  try {
    const e = JSON.parse(
      localStorage.getItem(nl) || "[]"
    );
    return Array.isArray(e) ? e.filter(di) : [];
  } catch {
    return [];
  }
}
function mi(e) {
  try {
    localStorage.setItem(nl, JSON.stringify(e));
  } catch {
  }
}
function pi(e) {
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
function fi(e) {
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
async function Gn(e = !0) {
  const t = await tt("/ugsci/team/custom");
  if (!t.ok) {
    const a = await t.text().catch(() => "");
    throw new Error(a || `HTTP ${t.status}`);
  }
  const r = (await t.json()).map(fi);
  return e && mi(r), r;
}
async function rl(e) {
  const t = await tt("/ugsci/team/custom", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(pi(e))
  });
  if (!t.ok) {
    const r = await t.text().catch(() => "");
    throw new Error(r || `HTTP ${t.status}`);
  }
  const n = await t.json();
  return { ...e, id: n.team_id };
}
async function gi(e) {
  const t = await tt(
    `/ugsci/team/custom/${encodeURIComponent(e)}`,
    { method: "DELETE" }
  );
  if (!t.ok && t.status !== 404) {
    const n = await t.text().catch(() => "");
    throw new Error(n || `HTTP ${t.status}`);
  }
}
async function yi() {
  const e = ui();
  if (e.length === 0) return;
  const t = await Gn(!1), n = new Set(t.map((r) => r.id));
  await Promise.all(
    e.filter((r) => !n.has(r.id)).map((r) => rl(r))
  );
}
async function hi(e) {
  var a, l;
  const t = (a = e.body) == null ? void 0 : a.getReader();
  if (!t) return;
  const n = new TextDecoder();
  let r = "";
  try {
    for (; ; ) {
      const { done: i, value: s } = await t.read();
      if (i) break;
      r += n.decode(s, { stream: !0 });
      let o;
      for (; (o = r.indexOf(`

`)) >= 0; ) {
        const c = r.slice(0, o);
        r = r.slice(o + 2);
        for (const d of c.split(`
`)) {
          if (!d.startsWith("data: ")) continue;
          const u = d.slice(6);
          let m;
          try {
            m = JSON.parse(u);
          } catch {
            continue;
          }
          if (m.error) {
            const p = m.error, w = typeof p == "string" ? p : (p == null ? void 0 : p.message) || "工作流启动失败";
            throw new Error(w);
          }
          if (m.object === "response" || m.type === "response") {
            const p = m.status;
            if (p === "failed" || p === "error") {
              const w = ((l = m.error) == null ? void 0 : l.message) || "工作流启动失败";
              throw new Error(w);
            }
            return;
          }
          if (m.object === "content" || m.type === "message")
            return;
        }
      }
    }
  } finally {
    t.releaseLock();
  }
}
async function Ei(e, t, n) {
  const r = `console:default:team-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, a = await tt("/chats", {
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
  const i = (await a.json()).id, s = await tt("/console/chat", {
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
  if (!s.ok) {
    const o = await s.text().catch(() => "");
    throw new Error(o || `HTTP ${s.status}`);
  }
  return await hi(s), i;
}
function al(e, t) {
  var a;
  const n = t.replace(/\s+/g, ""), r = e.find(
    (l) => l.name === t || l.name.replace(/\s+/g, "") === n
  );
  return r ? r.id : ((a = e.find(
    (l) => l.name.includes(t) || t.includes(l.name) || l.name.replace(/\s+/g, "").includes(n)
  )) == null ? void 0 : a.id) || null;
}
function ll() {
  var t;
  const e = (t = window.QwenPaw) == null ? void 0 : t.host;
  if (!e) throw new Error("[ugsci] QwenPaw.host not available");
  return e;
}
async function ol(e, t) {
  const n = await e.text().catch(() => "");
  if (!n) return t;
  try {
    const r = JSON.parse(n);
    if (typeof r.detail == "string") return r.detail;
  } catch {
  }
  return n;
}
async function dr(e, t, n) {
  const r = await tt(e, {
    headers: t ? { "X-Agent-Id": t } : void 0,
    signal: n
  });
  if (!r.ok)
    throw new Error(
      await ol(r, `HTTP ${r.status}`)
    );
  return await r.json();
}
function bi(e, t) {
  return dr("/ugsci/team/state", e, t);
}
async function vi(e, t) {
  const n = await tt("/ugsci/team/runs", {
    headers: { "X-Agent-Id": e },
    signal: t
  });
  if (!n.ok)
    throw new Error(
      await ol(
        n,
        `Failed to load team runs: ${n.status}`
      )
    );
  return await n.json();
}
const wi = 5e3;
function Yr({
  activeOnly: e = !1,
  enabled: t = !0
}) {
  const n = ll(), r = n.React, { useCallback: a, useEffect: l, useRef: i, useState: s } = r, { Alert: o, Button: c, Card: d, Empty: u, Spin: m, Tag: p, Typography: w } = n.antd, { Text: h, Paragraph: y } = w, f = n.useSelectedAgent ? n.useSelectedAgent() : { id: "default" }, E = (f == null ? void 0 : f.id) || "default", [v, g] = s([]), [x, O] = s(!0), [K, z] = s(null), [R, X] = s(!1), W = i(null), N = i(0), T = i(!1), k = i(E), $ = a(
    async (G = !0, q = !0) => {
      var ne;
      if (!t || !q && T.current) return;
      (ne = W.current) == null || ne.abort();
      const F = new AbortController();
      W.current = F;
      const I = ++N.current;
      T.current = !0, G && O(!0);
      try {
        const le = await vi(E, F.signal);
        if (F.signal.aborted || I !== N.current)
          return;
        g(le), X(!0), z(null);
      } catch (le) {
        if (F.signal.aborted || I !== N.current)
          return;
        z(
          le instanceof Error ? le.message : "讨论运行记录加载失败"
        );
      } finally {
        !F.signal.aborted && I === N.current && (W.current = null, T.current = !1, O(!1));
      }
    },
    [E, t]
  );
  if (l(() => {
    var q;
    if (!t) {
      (q = W.current) == null || q.abort(), W.current = null, T.current = !1, N.current += 1;
      return;
    }
    k.current !== E && (k.current = E, g([]), z(null), X(!1)), $(!0, !0);
    const G = e ? window.setInterval(() => {
      $(!1, !1);
    }, wi) : null;
    return () => {
      var F;
      G !== null && window.clearInterval(G), (F = W.current) == null || F.abort(), W.current = null, T.current = !1, N.current += 1;
    };
  }, [e, E, t, $]), x && !R) return r.createElement(m);
  if (K && !R)
    return r.createElement(o, {
      type: "warning",
      message: "讨论运行记录加载失败",
      description: K,
      action: r.createElement(
        c,
        { size: "small", onClick: () => void $(!0, !0), loading: x },
        "重试"
      )
    });
  const _ = v.filter(
    (G) => e ? G.status === "active" : G.status !== "active"
  ), M = (G) => K ? r.createElement(
    r.Fragment,
    null,
    r.createElement(o, {
      type: "warning",
      message: "讨论运行记录更新失败，当前显示上次成功读取的结果",
      description: K,
      action: r.createElement(
        c,
        {
          size: "small",
          onClick: () => void $(!0, !0),
          loading: x
        },
        "重试"
      )
    }),
    G
  ) : G;
  return _.length === 0 ? M(
    r.createElement(
      u,
      {
        description: e ? "暂无进行中的专家团讨论" : "暂无历史讨论"
      },
      r.createElement(
        c,
        { size: "small", onClick: () => void $(!0, !0), loading: x },
        "刷新"
      )
    )
  ) : M(
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
          { size: "small", onClick: () => void $(!0, !0), loading: x },
          "刷新"
        )
      ),
      r.createElement(
        "div",
        { style: { display: "flex", flexDirection: "column", gap: 8 } },
        ..._.map(
          (G) => r.createElement(
            d,
            { key: G.instance_id, size: "small" },
            r.createElement(
              "div",
              { style: { display: "flex", alignItems: "center", gap: 8 } },
              r.createElement(
                h,
                { strong: !0 },
                G.team_name || G.team_id
              ),
              r.createElement(
                p,
                {
                  color: G.status === "completed" ? "green" : G.status === "terminated" ? "orange" : "blue"
                },
                G.status
              ),
              r.createElement(p, null, G.current_phase),
              r.createElement(
                h,
                { type: "secondary" },
                `迭代 ${G.iteration}`
              )
            ),
            r.createElement(
              y,
              { ellipsis: { rows: 2 }, style: { margin: "8px 0 0" } },
              G.task || "暂无任务描述"
            )
          )
        )
      )
    )
  );
}
async function Si() {
  try {
    return (await dr(
      "/ugsci/team/preset-teams"
    )).teams;
  } catch {
    return null;
  }
}
async function xi() {
  try {
    return (await dr(
      "/ugsci/team/roles"
    )).roles;
  } catch {
    return null;
  }
}
const ki = {
  plan: { label: "规划", color: "#1677ff", icon: "📋" },
  dispatch: { label: "分派", color: "#13c2c2", icon: "🚀" },
  verify: { label: "验证", color: "#fa8c16", icon: "🔍" },
  synthesize: { label: "综合", color: "#722ed1", icon: "📊" },
  completed: { label: "完成", color: "#52c41a", icon: "✅" }
}, Qr = [
  "plan",
  "dispatch",
  "verify",
  "synthesize",
  "completed"
], Zr = 5e3, Ci = 3e4;
function Ti({ enabled: e = !0 }) {
  const t = ll(), n = t.React, { useState: r, useEffect: a, useCallback: l, useRef: i } = n, { Card: s, Tag: o, Typography: c, Button: d, Steps: u, Empty: m, Alert: p, Spin: w } = t.antd, { ReloadOutlined: h } = t.antdIcons || {}, { Text: y, Paragraph: f } = c, E = t.useSelectedAgent ? t.useSelectedAgent() : { id: "default" }, v = (E == null ? void 0 : E.id) || "default", [g, x] = r(null), [O, K] = r(!1), [z, R] = r(null), X = i(null), W = i(0), N = i(0), T = i(0), k = i(null), $ = i(!1), _ = l(
    async (Y, ue = !0) => {
      var me;
      if (!e || !ue && $.current) return;
      (me = k.current) == null || me.abort();
      const U = new AbortController();
      k.current = U;
      const ie = ++T.current;
      $.current = !0, Y && K(!0);
      try {
        const A = await bi(v, U.signal);
        if (U.signal.aborted || ie !== T.current)
          return;
        W.current = 0, N.current = 0, X.current = A, x(A), R(null);
      } catch (A) {
        if (U.signal.aborted || ie !== T.current)
          return;
        W.current += 1;
        const S = Math.min(
          Ci,
          Zr * 2 ** (W.current - 1)
        );
        N.current = Date.now() + S, R(
          A instanceof Error ? A.message : "专家团状态加载失败"
        );
      } finally {
        !U.signal.aborted && ie === T.current && (k.current = null, $.current = !1, K(!1));
      }
    },
    [v, e]
  ), M = l(() => (W.current = 0, N.current = 0, _(!0)), [_]);
  if (a(() => {
    var ue;
    if ((ue = k.current) == null || ue.abort(), k.current = null, $.current = !1, T.current += 1, W.current = 0, N.current = 0, X.current = null, x(null), R(null), !e) return;
    M();
    const Y = window.setInterval(() => {
      var U, ie;
      Date.now() < N.current || ((U = X.current) == null ? void 0 : U.status) === "completed" || ((ie = X.current) == null ? void 0 : ie.status) === "terminated" || _(!1, !1);
    }, Zr);
    return () => {
      var U;
      window.clearInterval(Y), (U = k.current) == null || U.abort(), k.current = null, $.current = !1, T.current += 1;
    };
  }, [v, e, _, M]), O && !g && !z)
    return n.createElement(w);
  if (z && !g)
    return n.createElement(p, {
      type: "warning",
      showIcon: !0,
      message: "专家团状态加载失败",
      description: z,
      style: { marginBottom: 16 },
      action: n.createElement(
        d,
        { size: "small", onClick: M, loading: O },
        "重试"
      )
    });
  const G = (Y) => z ? n.createElement(
    n.Fragment,
    null,
    n.createElement(p, {
      type: "warning",
      showIcon: !0,
      message: "状态更新失败，当前显示上次成功读取的结果",
      description: z,
      style: { marginBottom: 16 },
      action: n.createElement(
        d,
        { size: "small", onClick: M, loading: O },
        "重试"
      )
    }),
    Y
  ) : Y;
  if ((g == null ? void 0 : g.status) === "unreadable")
    return G(
      n.createElement(p, {
        type: "warning",
        showIcon: !0,
        message: "专家团状态暂时无法读取",
        description: `实例 ${g.instance_id || "未知"} 的状态文件需要检查。`,
        style: { marginBottom: 16 },
        action: n.createElement(
          d,
          { size: "small", onClick: M, loading: O },
          "重试"
        )
      })
    );
  if (!g || !g.active) {
    if ((g == null ? void 0 : g.status) === "completed" || (g == null ? void 0 : g.status) === "terminated") {
      const Y = g.status === "completed";
      return G(
        n.createElement(p, {
          type: Y ? "success" : "info",
          showIcon: !0,
          message: Y ? "专家团工作流已完成" : "专家团工作流已终止",
          description: Y ? `实例 ${g.instance_id || "未知"} 已完成，结果文件保留在工作区。` : `原因：${g.state.termination_reason || "未知"}`,
          style: { marginBottom: 16 }
        })
      );
    }
    return G(
      n.createElement(m, {
        description: "暂无活跃的专家团工作流",
        style: { padding: 24 }
      })
    );
  }
  const q = g.state, F = q.current_phase || "plan", I = Qr.indexOf(F), ne = q.team_name || "未知团队", le = q.team_mode || "pipeline", D = q.iteration || 0, P = q.members || [], oe = q.verify_retries || 0, re = {
    pipeline: "顺序交接",
    coordinator: "主管协作",
    roundtable: "并行汇聚",
    router: "智能路由",
    review_loop: "评审迭代",
    debate: "多方论证"
  };
  return G(
    n.createElement(
      s,
      {
        size: "small",
        style: { marginBottom: 16 },
        title: n.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 8 } },
          n.createElement("span", { style: { fontSize: 16 } }, "🔄"),
          n.createElement(
            y,
            { strong: !0 },
            `${ne} — 工作流状态`
          ),
          n.createElement(
            o,
            { color: "blue", style: { fontSize: 10 } },
            re[le] || le
          ),
          n.createElement(
            o,
            { style: { fontSize: 10 } },
            `迭代 ${D}`
          ),
          oe > 0 ? n.createElement(
            o,
            { color: "orange", style: { fontSize: 10 } },
            `验证重试 ${oe}`
          ) : null
        ),
        extra: n.createElement(
          d,
          {
            size: "small",
            type: "text",
            icon: h ? n.createElement(h) : void 0,
            onClick: M,
            loading: O
          },
          "刷新"
        )
      },
      n.createElement(u, {
        current: I,
        size: "small",
        items: Qr.map((Y) => {
          const ue = ki[Y];
          return {
            title: `${ue.icon} ${ue.label}`,
            description: Y === "plan" ? "分析任务，创建任务分解" : Y === "dispatch" ? "分派专家执行任务" : Y === "verify" ? "交叉验证专家结果" : Y === "synthesize" ? "综合形成最终报告" : "工作流完成"
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
        ...P.map(
          (Y, ue) => n.createElement(
            o,
            { key: `${Y.name}-${ue}`, style: { fontSize: 11 } },
            `${Y.emoji || ""} ${Y.name}（${Y.role}）`
          )
        )
      ),
      q.task ? n.createElement(
        f,
        {
          style: {
            fontSize: 12,
            marginTop: 8,
            marginBottom: 0,
            color: "var(--ant-color-text-secondary, #666)"
          },
          ellipsis: { rows: 2 }
        },
        `任务: ${q.task}`
      ) : null
    )
  );
}
function _i({ team: e }) {
  const t = C().React, { Typography: n, Tag: r } = C().antd, { Text: a } = n, l = {
    pipeline: "→",
    roundtable: "⇄",
    coordinator: "⊙",
    router: "◇",
    review_loop: "↻",
    debate: "⇄"
  }, i = {
    pipeline: "#13c2c2",
    roundtable: "#722ed1",
    coordinator: "#1677ff",
    router: "#d46b08",
    review_loop: "#389e0d",
    debate: "#c41d7f"
  }, s = e.steps || [], o = e.mode === "roundtable" || e.mode === "router", c = {
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
      ...s.length > 0 ? s.map((d, u) => [
        u > 0 && !o ? t.createElement(
          "div",
          {
            key: `arrow-${u}`,
            style: {
              textAlign: "center",
              color: i[e.mode],
              fontSize: 14
            }
          },
          l[e.mode]
        ) : null,
        t.createElement(
          "div",
          {
            key: `step-${u}`,
            style: {
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "6px 10px",
              background: "var(--ant-color-bg-container, #fff)",
              borderRadius: 6,
              border: `1px solid ${i[e.mode]}33`,
              fontSize: 12,
              flex: o ? "1 1 200px" : "initial"
            }
          },
          t.createElement(nt, {
            name: d.agentName,
            size: 24
          }),
          t.createElement(
            "div",
            null,
            t.createElement(
              a,
              { strong: !0, style: { fontSize: 12 } },
              d.agentName
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
              d.instruction
            ),
            t.createElement(
              r,
              {
                ...d.passContext ? { color: "blue" } : {},
                style: { fontSize: 9, marginTop: 2 }
              },
              d.passContext ? "传递上下文" : "独立"
            )
          )
        )
      ]).flat() : e.members.map((d, u) => [
        u > 0 && !o ? t.createElement(
          "div",
          {
            key: `arrow-${u}`,
            style: {
              textAlign: "center",
              color: i[e.mode],
              fontSize: 14
            }
          },
          l[e.mode]
        ) : null,
        t.createElement(
          "div",
          {
            key: `member-${u}`,
            style: {
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "6px 10px",
              background: "var(--ant-color-bg-container, #fff)",
              borderRadius: 6,
              border: `1px solid ${i[e.mode]}33`,
              fontSize: 12,
              flex: o ? "1 1 150px" : "initial"
            }
          },
          t.createElement(nt, {
            name: d.name,
            size: 24
          }),
          t.createElement(
            "div",
            null,
            t.createElement(
              a,
              { strong: !0, style: { fontSize: 12 } },
              d.name
            ),
            t.createElement(
              "div",
              { style: { fontSize: 11, color: "var(--ant-color-text-tertiary, #8c8c8c)" } },
              d.role
            )
          )
        )
      ]).flat()
    )
  );
}
function Zt(e) {
  const t = e.replace(/\s+/g, "").toLowerCase();
  return t.includes("测井") ? "log-analyst" : t.includes("地球物理") ? "geophysicist" : t.includes("油藏") ? "reservoir-engineer" : t.includes("钻井") ? "drilling-engineer" : t.includes("采油") || t.includes("生产") ? "production-engineer" : t.includes("pvt") || t.includes("物性") ? "pvt-analyst" : t.includes("审核") || t.includes("verifier") ? "domain-reviewer" : t.includes("master") || t.includes("planner") ? "planner" : "analyst";
}
const Ii = [
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
function Ai({
  open: e,
  onClose: t,
  agents: n,
  editingTeam: r,
  onSaved: a
}) {
  const l = C().React, { useState: i, useEffect: s, useCallback: o } = l, {
    Modal: c,
    Input: d,
    Button: u,
    Select: m,
    Tag: p,
    Typography: w,
    Switch: h,
    Empty: y,
    message: f,
    Divider: E,
    Steps: v
  } = C().antd, { PlusOutlined: g, DeleteOutlined: x, SaveOutlined: O, ArrowRightOutlined: K } = C().antdIcons || {}, { Text: z, Paragraph: R } = w, [X, W] = i(""), [N, T] = i("🤝"), [k, $] = i(""), [_, M] = i("pipeline"), [G, q] = i(""), [F, I] = i(""), [ne, le] = i([]), [D, P] = i([]), [oe, re] = i(!1), [Y, ue] = i(2), [U, ie] = i(""), [me, A] = i(""), [S, V] = i({}), [pe, Se] = i({}), [Le, ve] = i(
    Ii
  ), ce = [
    { value: "pipeline", icon: "→", title: "顺序交接", description: "上一步产物成为下一位专家的上下文", topology: "A → B → C", accent: "#08979c" },
    { value: "roundtable", icon: "⇉", title: "并行汇聚", description: "独立并行分析，避免观点相互污染", topology: "A ∥ B ∥ C → 汇总", accent: "#531dab" },
    { value: "coordinator", icon: "◎", title: "主管协作", description: "主控专家拆解任务并按需组织成员", topology: "主管 → 专家组", accent: "#0958d9" },
    { value: "router", icon: "◇", title: "智能路由", description: "按任务能力需求选择最小充分专家集合", topology: "任务 → 路由 → 子集", accent: "#d46b08" },
    { value: "review_loop", icon: "↻", title: "评审迭代", description: "产出、独立审查、修订，直到满足标准", topology: "执行 ⇄ 评审", accent: "#389e0d" },
    { value: "debate", icon: "⚖", title: "多方论证", description: "独立立场、交叉质询，再由裁决者综合", topology: "观点 ⇄ 反驳 → 裁决", accent: "#c41d7f" }
  ];
  s(() => {
    e && (r ? (W(r.name), T(r.emoji), $(r.description), M(r.mode), q(r.coordinatorName || ""), I(r.taskTemplate), le(r.steps || []), P(r.members.map((j) => j.name)), ue(r.maxReviewRounds || 2), ie(r.successCriteria || ""), A(r.routingInstruction || ""), V(
      Object.fromEntries(
        r.members.map((j) => [
          j.name,
          j.bindingMode || (j.agentId ? "fixed" : "preferred")
        ])
      )
    ), Se(
      Object.fromEntries(
        r.members.map((j) => [
          j.name,
          j.roleKey || Zt(j.name)
        ])
      )
    )) : (W(""), T("🤝"), $(""), M("pipeline"), q(""), I(`请执行以下任务：
任务描述：{任务描述}`), le([]), P([]), ue(2), ie(""), A(""), V({}), Se({})));
  }, [e, r]), s(() => {
    e && xi().then((j) => {
      j != null && j.length && ve(j);
    });
  }, [e]);
  const xe = o(() => {
    if (_ === "roundtable" || _ === "debate" || _ === "router") {
      const j = D.map((Ee) => ({
        agentName: Ee,
        instruction: "请给出你的专业评估意见",
        passContext: !1
      }));
      le(j);
    } else if (_ === "pipeline") {
      const j = new Map(ne.map((te) => [te.agentName, te])), Ee = D.map((te) => j.get(te) || {
        agentName: te,
        instruction: "请完成你的专业部分",
        passContext: !0
      });
      le(Ee);
    }
  }, [_, D, ne]), Ie = (j) => {
    D.includes(j) || (P([...D, j]), V({ ...S, [j]: "fixed" }), Se({
      ...pe,
      [j]: Zt(j)
    }), (_ === "coordinator" || _ === "debate") && !G && q(j));
  }, H = (j) => {
    const Ee = D.filter((we) => we !== j);
    P(Ee), le(ne.filter((we) => we.agentName !== j));
    const te = { ...S };
    delete te[j], V(te);
    const ge = { ...pe };
    delete ge[j], Se(ge), G === j && q(Ee[0] || "");
  }, L = (j, Ee, te) => {
    const ge = [...ne];
    ge[j] = { ...ge[j], [Ee]: te }, le(ge);
  }, se = async () => {
    if (!X.trim()) {
      f.warning("请输入团队名称");
      return;
    }
    if (D.length < 2) {
      f.warning("至少需要选择 2 个成员");
      return;
    }
    if (!F.trim()) {
      f.warning("请输入任务模板");
      return;
    }
    if ((_ === "coordinator" || _ === "debate") && !G) {
      f.warning(_ === "debate" ? "请选择裁决者" : "请选择主控专家");
      return;
    }
    re(!0);
    try {
      let j = [...D];
      _ === "coordinator" && G ? j = [G, ...j.filter((we) => we !== G)] : _ === "debate" && G && (j = [...j.filter((we) => we !== G), G]);
      const Ee = j.map(
        (we) => {
          var Fe;
          const Re = n.find((Ae) => Ae.name === we), B = S[we] || "fixed", ye = pe[we] || Zt(we), _e = Le.find((Ae) => Ae.key === ye);
          return {
            name: we,
            role: (_e == null ? void 0 : _e.display_name) || ((Fe = Re == null ? void 0 : Re.description) == null ? void 0 : Fe.slice(0, 30)) || "需求分析师",
            emoji: "",
            agentId: B === "temporary" || Re == null ? void 0 : Re.id,
            roleKey: ye,
            bindingMode: B
          };
        }
      );
      let te = ne;
      (ne.length === 0 || ne.length !== D.length) && (te = D.map((we) => ({
        agentName: we,
        instruction: "请完成你的专业部分",
        passContext: _ === "pipeline"
      })));
      const ge = {
        id: (r == null ? void 0 : r.id) || `custom-${Date.now()}`,
        name: X.trim(),
        emoji: N,
        category: "自定义",
        description: k.trim() || `${X.trim()}（${D.length}人团队）`,
        mode: _,
        members: Ee,
        coordinatorName: _ === "coordinator" || _ === "debate" ? G : void 0,
        taskTemplate: F.trim(),
        orchestrationPrompt: "",
        // Custom teams use steps-based instructions
        steps: te,
        custom: !0,
        createdAt: (r == null ? void 0 : r.createdAt) || Date.now(),
        updatedAt: r == null ? void 0 : r.updatedAt,
        version: r == null ? void 0 : r.version,
        maxReviewRounds: Y,
        successCriteria: U.trim(),
        routingInstruction: me.trim()
      };
      await rl(ge), f.success(r ? "团队已更新" : "团队已创建"), a(), t();
    } catch (j) {
      f.error(j.message || "保存失败");
    } finally {
      re(!1);
    }
  }, he = n.filter(
    (j) => !D.includes(j.name)
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
      onOk: se,
      okText: "保存专家团",
      confirmLoading: oe,
      okButtonProps: {
        icon: O ? l.createElement(O) : void 0
      }
    },
    // Step 1: Basic info
    l.createElement(
      "div",
      { style: { marginBottom: 16 } },
      l.createElement(
        z,
        {
          strong: !0,
          style: { display: "block", marginBottom: 8, fontSize: 13 }
        },
        "1. 定义任务工作流"
      ),
      l.createElement(
        "div",
        { style: { display: "flex", gap: 8, marginBottom: 8, alignItems: "center" } },
        D.length > 0 ? l.createElement(cr, {
          members: D,
          size: 36
        }) : null,
        l.createElement(d, {
          placeholder: "专家团名称（如：储层评价与质量复核专家团）",
          value: X,
          onChange: (j) => W(j.target.value),
          style: { flex: 1 }
        })
      ),
      l.createElement(d.TextArea, {
        placeholder: "说明这个工作流解决什么问题、适用于什么场景",
        value: k,
        onChange: (j) => $(j.target.value),
        rows: 2,
        style: { marginBottom: 8 }
      }),
      l.createElement(
        z,
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
        ...ce.map((j) => {
          const Ee = _ === j.value;
          return l.createElement(
            "button",
            {
              key: j.value,
              type: "button",
              onClick: () => {
                M(j.value), j.value !== "coordinator" && j.value !== "debate" && q("");
              },
              style: {
                textAlign: "left",
                padding: 10,
                borderRadius: 8,
                cursor: "pointer",
                background: Ee ? `${j.accent}0d` : "var(--ant-color-bg-container, #fff)",
                border: `1px solid ${Ee ? j.accent : "var(--ant-color-border, #d9d9d9)"}`,
                boxShadow: Ee ? `0 0 0 2px ${j.accent}1a` : "none"
              }
            },
            l.createElement(
              "div",
              { style: { display: "flex", alignItems: "center", gap: 7, color: j.accent, fontWeight: 600 } },
              l.createElement("span", { style: { fontSize: 18 } }, j.icon),
              j.title
            ),
            l.createElement("div", { style: { fontSize: 11, color: "#595959", marginTop: 5, lineHeight: 1.45 } }, j.description),
            l.createElement("div", { style: { fontSize: 10, color: j.accent, marginTop: 5, fontFamily: "monospace" } }, j.topology)
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
        z,
        {
          strong: !0,
          style: { display: "block", marginBottom: 8, fontSize: 13 }
        },
        "2. 配置专家角色"
      ),
      // Available agents
      he.length > 0 ? l.createElement(
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
        ...he.map(
          (j) => l.createElement(
            u,
            {
              key: j.id,
              size: "small",
              icon: g ? l.createElement(g) : void 0,
              onClick: () => Ie(j.name)
            },
            j.name
          )
        )
      ) : null,
      // Selected members
      D.length === 0 ? l.createElement(y, {
        description: "请从上方添加团队成员",
        image: y.PRESENTED_IMAGE_SIMPLE
      }) : l.createElement(
        "div",
        { style: { display: "flex", flexDirection: "column", gap: 4 } },
        ...D.map(
          (j) => l.createElement(
            "div",
            {
              key: j,
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
              l.createElement(nt, { name: j, size: 24 }),
              l.createElement(
                z,
                { strong: !0, style: { fontSize: 13 } },
                j
              ),
              (_ === "coordinator" || _ === "debate") && G === j ? l.createElement(
                p,
                { color: "blue", style: { fontSize: 10 } },
                _ === "debate" ? "裁决者" : "主控"
              ) : null
            ),
            l.createElement(
              "div",
              { style: { display: "flex", gap: 4 } },
              l.createElement(m, {
                size: "small",
                value: pe[j] || Zt(j),
                style: { width: 132 },
                onChange: (Ee) => Se({ ...pe, [j]: Ee }),
                options: Le.map((Ee) => ({
                  value: Ee.key,
                  label: Ee.display_name
                }))
              }),
              l.createElement(m, {
                size: "small",
                value: S[j] || "fixed",
                style: { width: 118 },
                onChange: (Ee) => V({ ...S, [j]: Ee }),
                options: [
                  { value: "fixed", label: "固定实例" },
                  { value: "preferred", label: "优先实例" },
                  { value: "temporary", label: "临时派生" }
                ]
              }),
              _ === "coordinator" || _ === "debate" ? l.createElement(
                u,
                {
                  size: "small",
                  type: "link",
                  onClick: () => q(j)
                },
                _ === "debate" ? "设为裁决者" : "设为主控"
              ) : null,
              l.createElement(
                u,
                {
                  size: "small",
                  type: "link",
                  danger: !0,
                  icon: x ? l.createElement(x) : void 0,
                  onClick: () => H(j)
                },
                "移除"
              )
            )
          )
        )
      )
    ),
    _ === "review_loop" || _ === "router" ? l.createElement(
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
      _ === "review_loop" ? l.createElement(
        "div",
        { style: { display: "grid", gridTemplateColumns: "150px 1fr", gap: 10 } },
        l.createElement(m, {
          value: Y,
          onChange: (j) => ue(j),
          options: [1, 2, 3, 4, 5].map((j) => ({ value: j, label: `最多 ${j} 轮` }))
        }),
        l.createElement(d, {
          value: U,
          onChange: (j) => ie(j.target.value),
          placeholder: "验收标准，例如：关键结论均有数据依据，且无高风险缺陷"
        })
      ) : l.createElement(d, {
        value: me,
        onChange: (j) => A(j.target.value),
        placeholder: "路由偏好，例如：仅调用任务必需的专家；涉及模拟时优先油藏工程师"
      })
    ) : null,
    l.createElement(E, { style: { margin: "12px 0" } }),
    // Step 3: Define execution steps (for pipeline/roundtable)
    D.length > 0 ? l.createElement(
      "div",
      { style: { marginBottom: 16 } },
      l.createElement(
        z,
        {
          strong: !0,
          style: { display: "block", marginBottom: 8, fontSize: 13 }
        },
        `3. 配置专家任务${_ === "roundtable" ? "（并行独立）" : _ === "pipeline" ? "（顺序交接）" : _ === "router" ? "（作为候选能力）" : _ === "review_loop" ? "（首位执行、末位评审）" : _ === "debate" ? "（末位为裁决者）" : "（由主控动态编排）"}`
      ),
      // Auto-sync button
      l.createElement(
        u,
        {
          size: "small",
          type: "dashed",
          onClick: xe,
          style: { marginBottom: 8 }
        },
        "自动生成步骤"
      ),
      // Steps list
      ne.length === 0 ? l.createElement(
        z,
        { type: "secondary", style: { fontSize: 12 } },
        "点击「自动生成步骤」或手动配置每步的指令"
      ) : l.createElement(
        "div",
        { style: { display: "flex", flexDirection: "column", gap: 6 } },
        ...ne.map(
          (j, Ee) => l.createElement(
            "div",
            {
              key: Ee,
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
              _ === "pipeline" ? l.createElement(
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
                `${Ee + 1}`
              ) : l.createElement(
                "span",
                { style: { fontSize: 14 } },
                "🔀"
              ),
              l.createElement(
                p,
                { color: "blue", style: { fontSize: 11 } },
                j.agentName
              ),
              l.createElement(
                "div",
                { style: { flex: 1 } },
                l.createElement(d, {
                  placeholder: "请输入该步骤的指令...",
                  value: j.instruction,
                  onChange: (te) => L(Ee, "instruction", te.target.value),
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
              l.createElement(h, {
                size: "small",
                checked: j.passContext,
                onChange: (te) => L(Ee, "passContext", te)
              }),
              l.createElement(
                z,
                { type: "secondary", style: { fontSize: 11 } },
                j.passContext ? "传递上一步结果作为上下文" : "独立执行"
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
        z,
        {
          strong: !0,
          style: { display: "block", marginBottom: 8, fontSize: 13 }
        },
        `${D.length > 0 ? "4" : "3"}. 任务模板`
      ),
      l.createElement(d.TextArea, {
        placeholder: `输入任务模板，可用 {参数名} 作为占位符...

例如：
请对区块 {区块名} 的井 {井号} 进行储层评价`,
        value: F,
        onChange: (j) => I(j.target.value),
        rows: 4,
        style: { fontFamily: "monospace", fontSize: 13 }
      }),
      l.createElement(
        z,
        {
          type: "secondary",
          style: { fontSize: 11, display: "block", marginTop: 4 }
        },
        "占位符 {参数名} 在发起任务时可由用户填写替换"
      )
    )
  );
}
function ea({
  team: e,
  agents: t,
  onLaunch: n,
  onEdit: r,
  onDelete: a
}) {
  var T;
  const l = C().React, { useState: i } = l, { Card: s, Tag: o, Typography: c, Button: d, Tooltip: u, Popconfirm: m } = C().antd, {
    TeamOutlined: p,
    RocketOutlined: w,
    UserOutlined: h,
    EditOutlined: y,
    DeleteOutlined: f,
    DownOutlined: E,
    UpOutlined: v
  } = C().antdIcons || {}, { Text: g, Paragraph: x } = c, [O, K] = i(!1), z = {
    coordinator: { label: "主管协作", color: "blue" },
    pipeline: { label: "顺序交接", color: "cyan" },
    roundtable: { label: "并行汇聚", color: "purple" },
    router: { label: "智能路由", color: "orange" },
    review_loop: { label: "评审迭代", color: "green" },
    debate: { label: "多方论证", color: "magenta" }
  }, R = z[e.mode] || z.coordinator, X = e.members.map((k) => {
    const $ = k.bindingMode === "temporary", _ = $ ? null : (k.agentId && t.some((M) => M.id === k.agentId) ? k.agentId : null) || al(t, k.name);
    return { ...k, found: !!_, agentId: _, temporary: $ };
  }), W = X.filter((k) => k.found).length, N = e.coordinatorName || ((T = e.members[0]) == null ? void 0 : T.name);
  return l.createElement(
    s,
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
      l.createElement(cr, {
        members: e.members.map((k) => k.name),
        size: 36
      }),
      l.createElement(
        "div",
        { style: { flex: 1 } },
        l.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 6 } },
          l.createElement(
            g,
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
            { color: R.color, style: { fontSize: 10 } },
            R.label
          ),
          l.createElement(
            o,
            { color: "green", style: { fontSize: 10 } },
            `${e.members.length} 位专家`
          ),
          W < e.members.length ? l.createElement(
            u,
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
          u,
          { title: "编辑" },
          l.createElement(d, {
            type: "text",
            size: "small",
            icon: y ? l.createElement(y) : void 0,
            onClick: (k) => {
              k.stopPropagation(), r(e);
            }
          })
        ) : null,
        a ? l.createElement(
          u,
          { title: "删除" },
          l.createElement(
            m,
            {
              title: `删除专家团「${e.name}」？`,
              description: "此操作会删除后端定义，但不会删除既有讨论记录。",
              okText: "删除",
              cancelText: "取消",
              okButtonProps: { danger: !0 },
              onConfirm: () => a(e)
            },
            l.createElement(d, {
              type: "text",
              size: "small",
              danger: !0,
              icon: f ? l.createElement(f) : void 0,
              onClick: (k) => k.stopPropagation()
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
      ...X.map(
        (k) => l.createElement(
          u,
          {
            key: k.name,
            title: `${k.name}（${k.role}）${k.temporary ? " - OMP 临时派生" : k.found ? " - 已绑定实例" : " - OMP 按角色派发"}`
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
                background: k.found ? "#f0f5ff" : "#f0f0ff",
                border: `1px solid ${k.found ? "#d6e4ff" : "#d3adf7"}`,
                fontSize: 11
              }
            },
            l.createElement(nt, { name: k.name, size: 18 }),
            l.createElement(
              g,
              {
                style: { fontSize: 11, color: k.found ? "#1f4e8c" : "#531dab" }
              },
              k.name
            ),
            k.temporary ? l.createElement(
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
      d,
      {
        type: "link",
        size: "small",
        style: { padding: "0 0 4px 0", fontSize: 11, height: "auto" },
        onClick: (k) => {
          k.stopPropagation(), K(!O);
        },
        icon: O ? v ? l.createElement(v) : "▲" : E ? l.createElement(E) : "▼"
      },
      O ? "收起流程" : "查看执行流程"
    ),
    O ? l.createElement(_i, { team: e }) : null,
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
        g,
        { type: "secondary", style: { fontSize: 11 } },
        N ? `${e.mode === "debate" ? "裁决者" : "主控"}: ${N}` : "OMP 动态编排"
      ),
      l.createElement(
        d,
        {
          type: "primary",
          size: "small",
          icon: w ? l.createElement(w) : void 0,
          disabled: t.length === 0,
          onClick: () => n(e),
          style: qe
        },
        "运行工作流"
      )
    )
  );
}
function $i({
  agents: e,
  onLaunch: t
}) {
  const n = C().React, { useMemo: r, useState: a, useCallback: l, useEffect: i } = n, {
    Row: s,
    Col: o,
    Input: c,
    Empty: d,
    Typography: u,
    Tag: m,
    Button: p,
    Divider: w,
    Tabs: h,
    message: y
  } = C().antd, { SearchOutlined: f, PlusOutlined: E, RocketOutlined: v } = C().antdIcons || {}, { Text: g } = u, [x, O] = a(""), [K, z] = a([]), [R, X] = a([]), [W, N] = a(!1), [T, k] = a(null), [$, _] = a("preset");
  i(() => {
    let P = !0;
    return (async () => {
      try {
        await yi();
        const oe = await Gn();
        P && z(oe);
      } catch (oe) {
        console.warn("[ugsci] Failed to load backend expert teams:", oe), P && (z([]), y.warning("专家团后端加载失败，请检查服务后重试"));
      }
    })(), Si().then((oe) => {
      P && oe && X(oe);
    }), () => {
      P = !1;
    };
  }, []);
  const M = l(() => {
    Gn().then(z).catch((P) => {
      console.warn("[ugsci] Failed to refresh expert teams:", P), z([]), y.warning("专家团后端加载失败，请检查服务后重试");
    });
  }, [y]), G = l(
    (P) => {
      gi(P.id).then(() => {
        M(), y.success(`团队「${P.name}」已删除`);
      }).catch((oe) => y.error(oe.message || "删除专家团失败"));
    },
    [y, M]
  ), q = l((P) => {
    k(P), N(!0);
  }, []), F = l(() => {
    k(null), N(!0);
  }, []), I = r(() => [...K, ...R], [K, R]), ne = r(() => {
    if (!x.trim()) return I;
    const P = x.toLowerCase();
    return I.filter(
      (oe) => oe.name.toLowerCase().includes(P) || oe.description.toLowerCase().includes(P) || oe.category.toLowerCase().includes(P)
    );
  }, [I, x]), le = ne.filter((P) => P.custom), D = ne.filter((P) => !P.custom);
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
        prefix: f ? n.createElement(f) : void 0,
        value: x,
        onChange: (P) => O(P.target.value),
        allowClear: !0,
        style: { flex: "1 1 280px", maxWidth: 400 }
      }),
      n.createElement(
        p,
        {
          type: "primary",
          size: "small",
          icon: E ? n.createElement(E) : void 0,
          onClick: F,
          style: qe
        },
        "创建专家团"
      )
    ),
    // Tabs: preset teams vs custom teams
    n.createElement(
      h,
      {
        activeKey: $,
        onChange: _,
        items: [
          {
            key: "preset",
            label: `预设团队${D.length ? ` (${D.length})` : ""}`,
            children: n.createElement(
              "div",
              null,
              D.length > 0 ? n.createElement(
                s,
                { gutter: [12, 12] },
                ...D.map(
                  (P) => n.createElement(
                    o,
                    { key: P.id, xs: 24, sm: 12, md: 8 },
                    n.createElement(ea, {
                      team: P,
                      agents: e,
                      onLaunch: t
                    })
                  )
                )
              ) : n.createElement(d, {
                description: "未找到匹配的预设团队",
                image: d.PRESENTED_IMAGE_SIMPLE
              })
            )
          },
          {
            key: "custom",
            label: `自定义团队${le.length ? ` (${le.length})` : ""}`,
            children: n.createElement(
              "div",
              null,
              le.length > 0 ? n.createElement(
                s,
                { gutter: [12, 12] },
                ...le.map(
                  (P) => n.createElement(
                    o,
                    { key: P.id, xs: 24, sm: 12, md: 8 },
                    n.createElement(ea, {
                      team: P,
                      agents: e,
                      onLaunch: t,
                      onEdit: q,
                      onDelete: G
                    })
                  )
                )
              ) : n.createElement(d, {
                description: "暂无自定义团队，点击「创建专家团」自定义",
                image: d.PRESENTED_IMAGE_SIMPLE
              })
            )
          },
          {
            key: "active",
            label: "进行中的讨论",
            children: n.createElement(
              n.Fragment,
              null,
              n.createElement(Ti, {
                enabled: $ === "active"
              }),
              n.createElement(Yr, {
                activeOnly: !0,
                enabled: $ === "active"
              })
            )
          },
          {
            key: "history",
            label: "讨论历史",
            children: n.createElement(Yr, {
              enabled: $ === "history"
            })
          }
        ]
      }
    ),
    // Team Builder Modal
    n.createElement(Ai, {
      open: W,
      onClose: () => {
        N(!1), k(null);
      },
      agents: e,
      editingTeam: T,
      onSaved: M
    })
  );
}
const zi = [
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
], Pi = 5e3, Rn = {
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
function Ri(e) {
  window.history.pushState({}, "", e), window.dispatchEvent(new PopStateEvent("popstate"));
}
function On(e, t) {
  const n = new URLSearchParams();
  e && n.set("flow", e), t && n.set("run", t), Ri(`/flowforge${n.size ? `?${n.toString()}` : ""}`);
}
function Oi(e) {
  return e ? new Date(e * 1e3).toLocaleString("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  }) : "—";
}
function Mi(e) {
  if (!e || e <= 0) return "—";
  if (e < 1e3) return `${e}ms`;
  const t = Math.floor(e / 1e3);
  if (t < 60) return `${t}s`;
  const n = Math.floor(t / 60), r = t % 60;
  return `${n}m${r}s`;
}
function Li(e) {
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
function il(e) {
  return {
    success: "已完成",
    completed: "已完成",
    skipped: "已跳过",
    cached: "已缓存",
    running: "执行中",
    queued: "排队中",
    waiting: "等待中",
    pending: "待执行",
    error: "失败",
    failed: "失败",
    cancelled: "已取消"
  }[e] || e;
}
function $t(e) {
  return ["success", "completed", "skipped", "cached"].includes(e) ? "green" : ["error", "failed"].includes(e) ? "red" : ["running"].includes(e) ? "blue" : ["queued", "pending"].includes(e) ? "cyan" : "gold";
}
function Bi(e, t) {
  const n = typeof e.type == "string" ? e.type : "事件", r = typeof e.node_id == "string" ? ` · ${e.node_id}` : "", a = e.state && typeof e.state == "object" ? e.state : {}, l = e.data && typeof e.data == "object" ? e.data : {}, i = [e.message, a.message, a.error, l.message, l.error].find((c) => typeof c == "string" && c.length > 0) || "";
  if (i) return `${n}${r}: ${i}`;
  const s = typeof e.status == "string" ? e.status : typeof a.status == "string" ? a.status : "", o = s ? ` · ${il(s)}` : "";
  if (o) return `${n}${r}${o}`;
  try {
    const c = JSON.stringify(Object.keys(l).length > 0 ? l : e) || "{}", d = c.length > 240 ? `${c.slice(0, 237)}...` : c;
    return `${n}${r}: ${d}`;
  } catch {
    return `${n}${r} #${t + 1}`;
  }
}
const en = /* @__PURE__ */ new Set(["running", "queued", "paused", "waiting_human"]);
function Ui() {
  const e = C().React, { useCallback: t, useEffect: n, useRef: r, useState: a } = e, {
    Alert: l,
    Button: i,
    Card: s,
    Col: o,
    Empty: c,
    Input: d,
    Popconfirm: u,
    Row: m,
    Space: p,
    Spin: w,
    Tabs: h,
    Progress: y,
    Tag: f,
    Tooltip: E,
    Typography: v,
    message: g
  } = C().antd, {
    ApartmentOutlined: x,
    DeleteOutlined: O,
    ReloadOutlined: K,
    RocketOutlined: z,
    PlayCircleOutlined: R,
    StopOutlined: X
  } = C().antdIcons || {}, { Text: W, Paragraph: N, Title: T } = v, k = C().useSelectedAgent, $ = k ? k() : { id: "default" }, _ = ($ == null ? void 0 : $.id) || "default", [M, G] = a([]), [q, F] = a([]), [I, ne] = a([]), [le, D] = a(!0), [P, oe] = a(!0), [re, Y] = a(null), [ue, U] = a(""), [ie, me] = a(""), [A, S] = a("templates"), [V, pe] = a(/* @__PURE__ */ new Set()), [Se, Le] = a(/* @__PURE__ */ new Set()), ve = r(null), ce = q.some((B) => en.has(B.status)), xe = e.useMemo(() => {
    const B = {};
    return M.forEach((ye) => {
      B[ye.id] = ye.name;
    }), B;
  }, [M]), Ie = e.useMemo(() => {
    const B = {};
    return q.forEach((ye) => {
      en.has(ye.status) && (B[ye.flow_id] = (B[ye.flow_id] || 0) + 1);
    }), B;
  }, [q]), H = t(async (B = !1) => {
    B || D(!0);
    try {
      const [ye, _e, Fe] = await Promise.all([
        de("/flowforge/flows", { bypassCache: !0 }),
        de("/flowforge/runs", { bypassCache: !0 }),
        Sn().catch(() => [])
      ]);
      G(ye), F(_e), ne(Fe), oe(!0);
    } catch (ye) {
      console.warn("[ugsci] FlowForge is unavailable:", ye), oe(!1);
    } finally {
      B || D(!1);
    }
  }, []);
  n(() => {
    H();
  }, [H]), n(() => {
    if (!P || !ce) {
      ve.current && (clearTimeout(ve.current), ve.current = null);
      return;
    }
    return ve.current = setTimeout(() => {
      H(!0);
    }, Pi), () => {
      ve.current && (clearTimeout(ve.current), ve.current = null);
    };
  }, [ce, P, H]);
  const L = t(
    async (B) => {
      if (!re) {
        Y(B.key);
        try {
          const ye = await de(
            "/flowforge/generate",
            {
              method: "POST",
              body: JSON.stringify({
                prompt: B.sop,
                name: B.name,
                agent_id: _
              })
            }
          ), _e = {
            ...ye.nodes || {}
          }, Fe = Object.entries(_e).filter(([ae]) => /^step_\d+$/.test(ae)).sort(([ae], [$e]) => Number(ae.slice(5)) - Number($e.slice(5))), Ae = {};
          let Qe = 0, et = 0;
          Fe.forEach(([ae, $e], Me) => {
            const je = B.roleHints[Me] || "", Be = B.roleKeys[Me] || "analyst", Pe = I.find(
              (dt) => `${dt.name} ${dt.id}`.toLowerCase().includes(je.toLowerCase())
            );
            Pe ? Qe++ : et++;
            const ke = (Pe == null ? void 0 : Pe.id) || _, ct = { ...$e.inputs || {} };
            ct.agent_id = ke, _e[ae] = {
              ...$e,
              inputs: ct,
              metadata: {
                ...$e.metadata || {},
                binding_policy: "fixed_instance",
                role_hint: je,
                role_key: Be,
                agent_id: ke
              }
            }, Ae[ae] = {
              binding_policy: "fixed_instance",
              role_hint: je,
              role_key: Be,
              agent_id: ke
            };
          });
          const Ge = {
            ...ye,
            nodes: _e,
            id: `${B.key}-${Date.now()}`,
            name: B.name,
            description: B.description,
            metadata: {
              ...ye.metadata || {},
              domain: "oil-gas",
              template_key: B.key,
              expert_binding_policy: "fixed_instance",
              controller_agent_id: _,
              node_bindings: Ae
            }
          };
          await de("/flowforge/flows", {
            method: "POST",
            body: JSON.stringify(Ge)
          });
          const Oe = Fe.length > 0 ? `（${Qe} 个专家已匹配，${et} 个回退到控制器）` : "";
          g.success(`已创建工作流草稿「${B.name}」${Oe}`), await H();
        } catch (ye) {
          g.error(ye.message || "创建工作流失败");
        } finally {
          Y(null);
        }
      }
    },
    [I, _, re, H, g]
  ), se = t(async () => {
    if (!re) {
      if (!ie.trim()) {
        g.warning("请先描述工作流步骤和控制要求");
        return;
      }
      Y("natural-language");
      try {
        const B = await de(
          "/flowforge/generate",
          {
            method: "POST",
            body: JSON.stringify({
              prompt: ie.trim(),
              name: ue.trim(),
              agent_id: _
            })
          }
        ), ye = {
          ...B,
          id: `natural-${Date.now()}`,
          metadata: {
            ...B.metadata || {},
            domain: "oil-gas",
            source: "natural-language",
            expert_binding_policy: "fixed_instance",
            controller_agent_id: _
          }
        };
        await de("/flowforge/flows", {
          method: "POST",
          body: JSON.stringify(ye)
        }), g.success("已从自然语言生成可编辑工作流草稿"), U(""), me(""), await H();
      } catch (B) {
        g.error(B.message || "自然语言生成失败");
      } finally {
        Y(null);
      }
    }
  }, [_, re, H, g, ue, ie]), he = t(
    async (B, ye) => {
      try {
        await de(`/flowforge/flows/${encodeURIComponent(B)}/run`, {
          method: "POST",
          body: JSON.stringify({ inputs: {} })
        }), g.success(`已启动工作流「${ye}」`), await H(!0);
      } catch (_e) {
        g.error(_e.message || "启动工作流失败");
      }
    },
    [H, g]
  ), j = t(
    async (B, ye) => {
      try {
        await de(`/flowforge/flows/${encodeURIComponent(B)}`, {
          method: "DELETE"
        }), g.success(`已删除工作流「${ye}」`), await H();
      } catch (_e) {
        g.error(_e.message || "删除工作流失败");
      }
    },
    [H, g]
  ), Ee = t(
    async (B) => {
      pe((ye) => {
        const _e = new Set(ye);
        return _e.add(B), _e;
      });
      try {
        await de(`/flowforge/runs/${encodeURIComponent(B)}/cancel`, {
          method: "POST"
        }), g.success("已请求取消运行"), await H(!0);
      } catch (ye) {
        g.error(ye.message || "取消运行失败");
      } finally {
        pe((ye) => {
          const _e = new Set(ye);
          return _e.delete(B), _e;
        });
      }
    },
    [H, g]
  ), te = e.createElement(
    "div",
    null,
    e.createElement(
      s,
      {
        size: "small",
        title: "用自然语言生成工作流",
        style: { marginBottom: 16 }
      },
      e.createElement(
        p,
        { direction: "vertical", style: { width: "100%" }, size: 10 },
        e.createElement(d, {
          value: ue,
          onChange: (B) => U(B.target.value),
          placeholder: "工作流名称（可选）",
          maxLength: 80
        }),
        e.createElement(d.TextArea, {
          value: ie,
          onChange: (B) => me(B.target.value),
          placeholder: "例如：先检查某储气库本周期压力和注采量数据，再由油藏工程师预测下周期能力，由独立完整性专家复核风险，最后形成带证据和不确定性的建议。",
          autoSize: { minRows: 3, maxRows: 8 }
        }),
        e.createElement(
          i,
          {
            type: "primary",
            onClick: () => void se(),
            loading: re === "natural-language",
            disabled: !P || !!re,
            style: qe
          },
          "生成可编辑草稿"
        )
      )
    ),
    e.createElement(
      m,
      { gutter: [12, 12] },
      ...zi.map(
        (B) => e.createElement(
          o,
          { key: B.key, xs: 24, md: 8 },
          e.createElement(
            s,
            { style: { height: "100%" } },
            e.createElement(
              p,
              { align: "start", style: { width: "100%" } },
              e.createElement("span", { style: { fontSize: 28 } }, B.icon),
              e.createElement(
                "div",
                { style: { flex: 1 } },
                e.createElement(T, { level: 5, style: { margin: 0 } }, B.name),
                e.createElement(f, { color: "blue", style: { marginTop: 6 } }, B.category),
                e.createElement(
                  N,
                  { type: "secondary", style: { margin: "10px 0 14px" } },
                  B.description
                ),
                e.createElement(
                  i,
                  {
                    type: "primary",
                    loading: re === B.key,
                    disabled: !P || !!re,
                    onClick: () => void L(B),
                    style: qe
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
        m,
        { gutter: [12, 12] },
        ...[
          ["固定实例", "生产关键节点使用指定且已验证的专家实例", "当前可执行"],
          ["优先实例", "定义中记录首选实例和治理降级策略", "规划中"],
          ["模板派生", "由 OMP 控制节点按角色模板临时创建隔离角色", "规划中"],
          ["动态路由", "按能力、健康、权限和成本选择实例", "规划中"]
        ].map(
          ([B, ye, _e]) => e.createElement(
            o,
            { key: B, xs: 24, sm: 12, lg: 6 },
            e.createElement(W, { strong: !0 }, B),
            e.createElement(
              f,
              {
                color: _e === "当前可执行" ? "green" : "default",
                style: { marginLeft: 6, fontSize: 10 }
              },
              _e
            ),
            e.createElement("div", { style: { color: "var(--ant-color-text-tertiary, #8c8c8c)", fontSize: 12, marginTop: 4 } }, ye)
          )
        )
      )
    )
  ), ge = le ? e.createElement(w) : M.length === 0 ? e.createElement(c, { description: "暂无工作流，可从模板创建" }) : e.createElement(
    m,
    { gutter: [12, 12] },
    ...M.map((B) => {
      const ye = Ie[B.id] || 0;
      return e.createElement(
        o,
        { key: B.id, xs: 24, md: 12, xl: 8 },
        e.createElement(
          s,
          {
            size: "small",
            title: e.createElement(
              p,
              { size: 6 },
              e.createElement("span", null, B.name),
              ye > 0 ? e.createElement(
                f,
                { color: "blue" },
                `${ye} 个运行中`
              ) : null
            ),
            extra: e.createElement(f, null, `v${B.version}`)
          },
          e.createElement(N, { ellipsis: { rows: 2 } }, B.description || "暂无描述"),
          e.createElement(
            p,
            { size: 8, wrap: !0 },
            e.createElement(f, { color: "geekblue" }, `${B.node_count} 个节点`),
            e.createElement(i, {
              size: "small",
              type: "primary",
              icon: R ? e.createElement(R) : void 0,
              disabled: !P,
              onClick: () => void he(B.id, B.name)
            }, "运行"),
            e.createElement(i, {
              size: "small",
              onClick: () => On(B.id)
            }, "编辑"),
            e.createElement(
              u,
              {
                title: "确认删除",
                description: `确定要删除工作流「${B.name}」吗？此操作不可撤销。`,
                onConfirm: () => void j(B.id, B.name),
                okText: "删除",
                cancelText: "取消",
                okButtonProps: { danger: !0 }
              },
              e.createElement(i, {
                size: "small",
                danger: !0,
                icon: O ? e.createElement(O) : void 0
              }, "删除")
            )
          )
        )
      );
    })
  ), we = le ? e.createElement(w) : q.length === 0 ? e.createElement(c, { description: "暂无工作流运行记录" }) : e.createElement(
    "div",
    { style: { display: "flex", flexDirection: "column", gap: 8 } },
    ...q.map((B) => {
      const ye = xe[B.flow_id] || B.flow_id, _e = en.has(B.status), Fe = Li(B.node_statuses), Ae = Object.entries(B.node_statuses || {}), Qe = Ae.filter(([, Be]) => ["success", "completed", "skipped", "cached"].includes(Be)).length, et = Ae.filter(([, Be]) => ["error", "failed"].includes(Be)).length, Ge = Ae.length > 0, Oe = B.status === "completed" || B.status === "success", ae = Ge ? Math.round(Qe / Ae.length * 100) : _e ? 18 : Oe ? 100 : 0, $e = Array.isArray(B.events) ? B.events.filter(
        (Be) => !!Be && typeof Be == "object"
      ).slice(-100) : [], Me = Se.has(B.run_id), je = B.duration_ms && B.duration_ms > 0 ? B.duration_ms : B.finished_at && B.started_at ? (B.finished_at - B.started_at) * 1e3 : _e && B.started_at ? (Date.now() / 1e3 - B.started_at) * 1e3 : 0;
      return e.createElement(
        s,
        {
          key: B.run_id,
          size: "small",
          style: {
            borderLeft: `3px solid ${Rn[B.status] === "green" ? "#52c41a" : Rn[B.status] === "red" ? "#ff4d4f" : "#1677ff"}`,
            transition: "box-shadow .2s ease"
          }
        },
        e.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" } },
          e.createElement(
            f,
            { color: Rn[B.status] || "default" },
            B.status
          ),
          e.createElement(W, { strong: !0 }, ye),
          e.createElement(
            E,
            { title: B.run_id },
            e.createElement(
              W,
              { type: "secondary", style: { fontFamily: "monospace", fontSize: 11 } },
              B.run_id.slice(0, 8) + "…"
            )
          ),
          e.createElement(
            W,
            { type: "secondary", style: { fontSize: 12 } },
            Oi(B.started_at)
          ),
          je > 0 ? e.createElement(
            W,
            { type: "secondary", style: { fontSize: 12 } },
            `耗时 ${Mi(je)}`
          ) : null,
          Fe ? e.createElement(f, { color: "geekblue", style: { fontSize: 11 } }, Fe) : null,
          B.error ? e.createElement(
            E,
            { title: B.error },
            e.createElement(W, { type: "danger", style: { fontSize: 12 } }, "（有错误）")
          ) : null,
          e.createElement(
            "div",
            { style: { marginLeft: "auto", display: "flex", gap: 6 } },
            _e ? e.createElement(
              u,
              {
                title: "确认取消运行？",
                onConfirm: () => void Ee(B.run_id),
                okText: "取消运行",
                cancelText: "保留",
                okButtonProps: { danger: !0 }
              },
              e.createElement(i, {
                size: "small",
                danger: !0,
                loading: V.has(B.run_id),
                icon: X ? e.createElement(X) : void 0
              }, "取消运行")
            ) : null,
            e.createElement(
              i,
              {
                size: "small",
                type: "link",
                onClick: () => Le((Be) => {
                  const Pe = new Set(Be);
                  return Pe.has(B.run_id) ? Pe.delete(B.run_id) : Pe.add(B.run_id), Pe;
                })
              },
              Me ? "收起过程" : "查看过程"
            ),
            e.createElement(
              i,
              {
                size: "small",
                type: "link",
                onClick: () => On(void 0, B.run_id)
              },
              "查看详情"
            )
          )
        ),
        e.createElement(
          "div",
          { style: { marginTop: 10, display: "flex", alignItems: "center", gap: 10 } },
          e.createElement(y, { percent: ae, size: "small", status: et || B.status === "failed" || B.status === "error" ? "exception" : _e ? "active" : "success", showInfo: !1, style: { flex: 1, margin: 0 } }),
          e.createElement(W, { type: "secondary", style: { fontSize: 12, minWidth: 90, textAlign: "right" } }, Ge ? `${ae}%` : "暂无节点进度")
        ),
        Me && (Ae.length > 0 || $e.length > 0 || B.error) ? e.createElement(
          "div",
          { style: { marginTop: 12, padding: "10px 12px", borderRadius: 8, background: "var(--ant-color-fill-quaternary, #fafafa)" } },
          e.createElement(
            "div",
            { style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 } },
            e.createElement(W, { strong: !0 }, "协作过程"),
            e.createElement(W, { type: "secondary", style: { fontSize: 12 } }, Ae.length > 0 ? `${Qe}/${Ae.length} 个 Agent 节点完成${et ? ` · ${et} 个失败` : ""}` : "暂无节点状态")
          ),
          Ae.length > 0 ? e.createElement(
            "div",
            { style: { display: "grid", gap: 7 } },
            ...Ae.map(
              ([Be, Pe], ke) => e.createElement(
                "div",
                { key: Be, style: { display: "flex", alignItems: "center", gap: 8 } },
                e.createElement("span", { style: { width: 22, height: 22, borderRadius: "50%", display: "inline-flex", alignItems: "center", justifyContent: "center", background: $t(Pe) === "green" ? "#f6ffed" : $t(Pe) === "red" ? "#fff2f0" : "#e6f4ff", color: $t(Pe) === "green" ? "#389e0d" : $t(Pe) === "red" ? "#cf1322" : "#1677ff", fontSize: 11, fontWeight: 600 } }, ke + 1),
                e.createElement(W, { style: { flex: 1, fontSize: 12 } }, Be.replace(/^step[_-]?\d+[_-]?/, "") || `Agent ${ke + 1}`),
                ke < Ae.length - 1 ? e.createElement(W, { type: "secondary", style: { fontSize: 11 } }, "→") : null,
                e.createElement(f, { color: $t(Pe), style: { margin: 0, fontSize: 11 } }, il(Pe))
              )
            )
          ) : null,
          $e.length > 0 ? e.createElement(
            "div",
            { style: { display: "grid", gap: 5, marginTop: Ae.length > 0 ? 10 : 0 } },
            e.createElement(W, { strong: !0, style: { fontSize: 12 } }, "执行事件"),
            ...$e.map((Be, Pe) => e.createElement(W, { key: `event-${Pe}`, type: "secondary", style: { fontSize: 12 } }, Bi(Be, Pe)))
          ) : null,
          B.error ? e.createElement(l, { type: "error", showIcon: !0, message: "运行错误", description: B.error, style: { marginTop: 10 } }) : null
        ) : null
      );
    })
  ), Re = e.createElement(
    p,
    null,
    e.createElement(i, {
      icon: K ? e.createElement(K) : void 0,
      onClick: () => void H(),
      loading: le
    }, "刷新"),
    A !== "templates" ? e.createElement(i, {
      type: "primary",
      icon: x ? e.createElement(x) : z ? e.createElement(z) : void 0,
      onClick: () => On(),
      disabled: !P,
      style: qe
    }, "打开流程编辑器") : null
  );
  return e.createElement(
    "div",
    null,
    P ? null : e.createElement(l, {
      type: "warning",
      message: "FlowForge 引擎未启动",
      description: "协作工作流功能需要 FlowForge 后端引擎支持。请检查后端是否正常运行，或联系管理员。",
      showIcon: !0,
      style: { marginBottom: 16 }
    }),
    e.createElement(h, {
      items: [
        { key: "templates", label: "工作流模板", children: te },
        { key: "mine", label: `我的工作流 (${M.length})`, children: ge },
        {
          key: "runs",
          label: e.createElement(
            "span",
            null,
            "运行中心 (",
            q.length,
            ce ? e.createElement(
              "span",
              { style: { color: "#1677ff", marginLeft: 2 } },
              `·${q.filter((B) => en.has(B.status)).length} 活跃`
            ) : null,
            ")"
          ),
          children: we
        }
      ],
      activeKey: A,
      onChange: (B) => S(B),
      tabBarExtraContent: Re
    })
  );
}
function ta(e, t) {
  var a, l;
  const n = e.coordinatorName || ((a = e.members[0]) == null ? void 0 : a.name), r = e.members.find((i) => i.name === n) || e.members[0];
  if ((r == null ? void 0 : r.bindingMode) !== "temporary" && (r != null && r.agentId) && t.some((i) => i.id === r.agentId))
    return r.agentId;
  if (n && (r == null ? void 0 : r.bindingMode) !== "temporary") {
    const i = al(t, n);
    if (i) return i;
  }
  return (r == null ? void 0 : r.bindingMode) === "fixed" ? null : ((l = t[0]) == null ? void 0 : l.id) || null;
}
function na() {
  const e = new URLSearchParams(window.location.search).get("section");
  return e === "teams" || e === "workflows" ? e : "experts";
}
function ji() {
  var Ie, H;
  const e = C().React, { useState: t, useEffect: n, useCallback: r, useMemo: a } = e, {
    Spin: l,
    Empty: i,
    Input: s,
    Button: o,
    message: c,
    Tabs: d,
    Modal: u,
    Typography: m
  } = C().antd, {
    ReloadOutlined: p,
    PlusOutlined: w,
    SearchOutlined: h,
    TeamOutlined: y,
    UserOutlined: f
  } = C().antdIcons || {}, { Text: E, Paragraph: v } = m, [g, x] = t([]), [O, K] = t(!0), [z, R] = t(!1), [X, W] = t(null), [N, T] = t(""), [k, $] = t(!1), [_, M] = t(na), [G, q] = t(
    null
  ), [F, I] = t(""), [ne, le] = t(!1), [D, P] = t(!1), [oe, re] = t(null), [Y, ue] = t([]), U = r(async () => {
    K(!0);
    try {
      const L = await Sn(), se = await Promise.all(
        L.map(async (he) => {
          try {
            const [j, Ee, te] = await Promise.all([
              ar(he.id).catch(() => null),
              xn(he.id).catch(() => []),
              ir(he.id).catch(() => [])
            ]);
            return {
              agent: he,
              config: j,
              skills: Ee,
              mcps: te,
              loading: !1
            };
          } catch {
            return {
              agent: he,
              config: null,
              skills: [],
              mcps: [],
              loading: !1
            };
          }
        })
      );
      x(se), ue(L);
    } catch (L) {
      c.error(L.message || "加载专家列表失败"), x([]);
    } finally {
      K(!1);
    }
  }, []);
  n(() => {
    U();
  }, [U]), n(() => {
    const L = () => M(na());
    return window.addEventListener("popstate", L), () => window.removeEventListener("popstate", L);
  }, []), n(() => {
    if (oe && D) {
      const L = g.find((se) => se.agent.id === oe.agent.id);
      L && L !== oe && re(L);
    }
  }, [g, oe, D]);
  const ie = r(
    async (L) => {
      var Ee;
      const se = L.coordinatorName || ((Ee = L.members[0]) == null ? void 0 : Ee.name), he = ta(L, Y);
      if (!he) {
        const te = L.members.find(
          (ge) => ge.name === se
        );
        c.error(
          (te == null ? void 0 : te.bindingMode) === "fixed" ? `固定协调者「${se || "协调者"}」当前不可用，请修复绑定后再运行` : "没有可用的 Agent 作为工作流控制器"
        );
        return;
      }
      if (/\{.+?\}/.test(L.taskTemplate)) {
        I(L.taskTemplate), q(L);
        return;
      }
      await me(L, he, L.taskTemplate);
    },
    [Y, c]
  ), me = r(
    async (L, se, he) => {
      le(!0);
      try {
        const j = he || L.taskTemplate, Ee = L.custom ? `@${L.id}` : L.name, te = `/ugsci-team ${L.mode} ${Ee} ${j}`, ge = C();
        ge.setSelectedAgent && ge.setSelectedAgent(se);
        const we = await Ei(se, te, L.name);
        c.success(`OMP 工作流已启动：${L.name}（${L.mode}模式）`), q(null), A(`/chat/${we}`);
      } catch (j) {
        c.error(j.message || "发起团队任务失败");
      } finally {
        le(!1);
      }
    },
    [c]
  ), A = (L) => {
    window.history.pushState({}, "", L), window.dispatchEvent(new PopStateEvent("popstate"));
  }, S = r((L) => {
    W(L), R(!0);
  }, []), V = r((L) => {
    re(L), P(!0);
  }, []), pe = r(
    (L) => {
      if (!L.agent.enabled) {
        c.warning(`专家「${L.agent.name}」未启用，请先启用`);
        return;
      }
      try {
        const se = C();
        se.setSelectedAgent && se.setSelectedAgent(L.agent.id);
      } catch (se) {
        console.warn("[ugsci] Failed to set selected agent:", se);
      }
      c.success(`已召唤专家「${L.agent.name}」，正在跳转至对话...`), A("/chat");
    },
    [c]
  ), Se = a(() => {
    if (!N.trim()) return g;
    const L = N.toLowerCase();
    return g.filter(
      (se) => {
        var he;
        return se.agent.name.toLowerCase().includes(L) || ((he = se.agent.description) == null ? void 0 : he.toLowerCase().includes(L)) || se.agent.id.toLowerCase().includes(L) || se.skills.some((j) => j.name.toLowerCase().includes(L));
      }
    );
  }, [g, N]), Le = g.filter((L) => L.agent.enabled).length, ve = g.reduce(
    (L, se) => L + se.skills.filter((he) => he.enabled !== !1).length,
    0
  ), ce = g.reduce((L, se) => L + se.mcps.length, 0), xe = [
    {
      key: "experts",
      label: e.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        f ? e.createElement(f, { style: { fontSize: 14 } }) : null,
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
          e.createElement(s, {
            placeholder: "搜索专家名称、描述或技能...",
            prefix: h ? e.createElement(h) : void 0,
            value: N,
            onChange: (L) => T(L.target.value),
            allowClear: !0,
            style: { flex: "1 1 280px", maxWidth: 400 }
          }),
          e.createElement(
            o,
            {
              type: "primary",
              icon: w ? e.createElement(w) : void 0,
              onClick: () => $(!0),
              style: qe
            },
            "创建专家"
          )
        ),
        // Content
        O ? e.createElement(
          "div",
          { style: { textAlign: "center", padding: 60 } },
          e.createElement(l, { size: "large" })
        ) : Se.length === 0 ? e.createElement(i, {
          description: N ? "未找到匹配的专家" : "暂无专家，点击「创建专家」添加"
        }) : e.createElement(
          "div",
          {
            style: {
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 250px), 1fr))",
              gap: 14,
              alignItems: "stretch"
            }
          },
          ...Se.map(
            (L) => e.createElement(
              "div",
              {
                key: L.agent.id,
                style: { display: "flex", minWidth: 0 }
              },
              e.createElement(li, {
                expert: L,
                onClick: () => S(L),
                onSummon: () => pe(L),
                onConfigure: () => V(L)
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
        y ? e.createElement(y, { style: { fontSize: 14 } }) : null,
        "专家团"
      ),
      children: e.createElement($i, {
        agents: Y,
        onLaunch: ie
      })
    },
    {
      key: "workflows",
      label: e.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        (Ie = C().antdIcons) != null && Ie.ApartmentOutlined ? e.createElement(C().antdIcons.ApartmentOutlined, {
          style: { fontSize: 14 }
        }) : null,
        "协作工作流"
      ),
      children: e.createElement(Ui)
    }
  ];
  return e.createElement(
    "div",
    { style: { padding: 24 } },
    e.createElement(wn, {
      title: "专家·协作",
      subtitle: _ === "experts" ? `共 ${g.length} 位专家（${Le} 位启用）· ${ve} 个技能 · ${ce} 个 MCP 客户端` : _ === "teams" ? "开放式多专家讨论、联合研判与 OMP 动态协作" : "流程化、可观测、可验证的油气与储气库协作流程",
      extra: e.createElement(
        e.Fragment,
        null,
        _ === "experts" ? e.createElement(
          o,
          {
            icon: p ? e.createElement(p) : void 0,
            onClick: () => {
              Vt(), U();
            },
            loading: O
          },
          "刷新"
        ) : null
      )
    }),
    e.createElement(d, {
      items: xe,
      activeKey: _,
      onChange: (L) => {
        M(L);
        const se = new URL(window.location.href);
        L === "experts" ? se.searchParams.delete("section") : se.searchParams.set("section", L), window.history.pushState({}, "", `${se.pathname}${se.search}`);
      }
    }),
    // Drawer
    e.createElement(oi, {
      expert: X,
      open: z,
      onClose: () => R(!1),
      onRefresh: () => U()
    }),
    // Template Modal
    e.createElement(ii, {
      open: k,
      onClose: () => $(!1),
      onCreated: () => U()
    }),
    // Config Modal (gear icon)
    e.createElement(ni, {
      expert: oe,
      open: D,
      onClose: () => P(!1),
      onRefresh: () => U()
    }),
    // Team Launch Modal (for filling placeholders)
    G ? e.createElement(
      u,
      {
        open: !0,
        title: e.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 8 } },
          e.createElement(cr, {
            members: G.members.map((L) => L.name),
            size: 28
          }),
          e.createElement(
            "span",
            null,
            `发起团队任务 - ${G.name}`
          )
        ),
        onCancel: () => q(null),
        onOk: () => {
          const L = ta(
            G,
            Y
          );
          if (!L) {
            c.error("固定协调者不可用或没有可用的控制器 Agent");
            return;
          }
          const se = F.trim() || G.taskTemplate;
          me(G, L, se);
        },
        confirmLoading: ne,
        okText: "发起任务",
        width: 600
      },
      e.createElement(
        "div",
        null,
        e.createElement(
          E,
          {
            type: "secondary",
            style: { fontSize: 12, display: "block", marginBottom: 8 }
          },
          "任务内容（请替换 {参数名} 等占位符后发起）："
        ),
        e.createElement(s.TextArea, {
          value: F,
          onChange: (L) => I(L.target.value),
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
          E,
          { style: { fontSize: 12, color: "#0958d9" } },
          `协调者: ${G.coordinatorName || ((H = G.members[0]) == null ? void 0 : H.name) || "—"} · 成员: ${G.members.map((L) => L.name).join("、")}`
        )
      )
    ) : null
  );
}
function Ni({
  agentId: e,
  agentName: t,
  refreshKey: n = 0,
  onNavigate: r
}) {
  const a = C().React, { useState: l, useEffect: i, useCallback: s } = a, {
    Spin: o,
    Empty: c,
    Button: d,
    Row: u,
    Col: m,
    Card: p,
    Tag: w,
    Checkbox: h,
    Modal: y,
    Typography: f,
    Drawer: E,
    Descriptions: v,
    message: g
  } = C().antd, {
    ReloadOutlined: x,
    ThunderboltOutlined: O,
    SettingOutlined: K,
    CheckSquareOutlined: z,
    EyeOutlined: R,
    EyeInvisibleOutlined: X,
    DeleteOutlined: W,
    CloseOutlined: N
  } = C().antdIcons || {}, { Text: T, Paragraph: k } = f, [$, _] = l([]), [M, G] = l(!0), [q, F] = l(!1), [I, ne] = l(null), [le, D] = l(!1), [P, oe] = l(
    /* @__PURE__ */ new Set()
  ), [re, Y] = l(!1), [ue, U] = l(null), [ie, me] = l(!1), A = s(async () => {
    if (e) {
      G(!0);
      try {
        const H = await xn(e);
        _(H);
      } catch (H) {
        g.error(H.message || "加载技能失败"), _([]);
      } finally {
        G(!1);
      }
    }
  }, [e]);
  i(() => {
    A();
  }, [A, n]);
  const S = (H) => {
    oe((L) => {
      const se = new Set(L);
      return se.has(H) ? se.delete(H) : se.add(H), se;
    });
  }, V = () => oe(/* @__PURE__ */ new Set()), pe = () => oe(new Set($.map((H) => H.name))), Se = () => {
    le ? (V(), D(!1)) : D(!0);
  }, Le = async () => {
    const H = Array.from(P);
    if (H.length !== 0) {
      Y(!0);
      try {
        const { results: L } = await Ro(e, H), se = Object.entries(L).filter(
          ([, j]) => j.success === !1
        ), he = H.length - se.length;
        se.length > 0 ? g.warning(
          `批量启用完成：成功 ${he} 个，失败 ${se.length} 个`
        ) : g.success(`成功启用 ${H.length} 个技能`), V(), await A();
      } catch (L) {
        g.error(L.message || "批量启用失败");
      } finally {
        Y(!1);
      }
    }
  }, ve = async () => {
    const H = Array.from(P);
    if (H.length !== 0) {
      Y(!0);
      try {
        const { results: L } = await Oo(e, H), se = Object.entries(L).filter(
          ([, j]) => j.success === !1
        ), he = H.length - se.length;
        se.length > 0 ? g.warning(
          `批量停用完成：成功 ${he} 个，失败 ${se.length} 个`
        ) : g.success(`成功停用 ${H.length} 个技能`), V(), await A();
      } catch (L) {
        g.error(L.message || "批量停用失败");
      } finally {
        Y(!1);
      }
    }
  }, ce = () => {
    const H = Array.from(P);
    H.length !== 0 && y.confirm({
      title: `确认删除 ${H.length} 个技能？`,
      content: "删除后技能将从当前专家工作区移除，此操作不可撤销。技能池中的原始技能不受影响。",
      okText: "确认删除",
      cancelText: "取消",
      okButtonProps: { danger: !0 },
      onOk: async () => {
        Y(!0);
        try {
          const { results: L } = await Mo(e, H), se = Object.entries(L).filter(
            ([, j]) => j.success === !1
          ), he = H.length - se.length;
          se.length > 0 ? g.warning(
            `批量删除完成：成功 ${he} 个，失败 ${se.length} 个`
          ) : g.success(`成功删除 ${H.length} 个技能`), V(), await A();
        } catch (L) {
          g.error(L.message || "批量删除失败");
        } finally {
          Y(!1);
        }
      }
    });
  }, xe = async (H) => {
    me(!0);
    try {
      H.enabled === !1 ? (await Va(e, H.name), g.success(`已启用技能「${H.name}」`)) : (await Ka(e, H.name), g.success(`已禁用技能「${H.name}」`)), await A();
    } catch (L) {
      g.error(L.message || "操作失败");
    } finally {
      me(!1);
    }
  }, Ie = (H) => {
    y.confirm({
      title: `确认删除技能「${H.name}」？`,
      content: "删除后技能将从当前专家工作区移除，此操作不可撤销。技能池中的原始技能不受影响。",
      okText: "确认删除",
      cancelText: "取消",
      okButtonProps: { danger: !0 },
      onOk: async () => {
        me(!0);
        try {
          await or(e, H.name), g.success(`已删除技能「${H.name}」`), await A();
        } catch (L) {
          g.error(L.message || "删除失败");
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
        T,
        { type: "secondary", style: { fontSize: 13 } },
        le ? `已选择 ${P.size} / ${$.length} 个技能` : `共 ${$.length} 个技能`
      ),
      a.createElement(
        "div",
        { style: { display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" } },
        le ? a.createElement(
          a.Fragment,
          null,
          a.createElement(
            d,
            { size: "small", onClick: pe },
            "全选"
          ),
          a.createElement(
            d,
            {
              size: "small",
              icon: N ? a.createElement(N) : void 0,
              onClick: V
            },
            "取消选择"
          ),
          a.createElement(
            d,
            {
              size: "small",
              type: "default",
              icon: R ? a.createElement(R) : void 0,
              disabled: P.size === 0 || re,
              loading: re,
              onClick: Le
            },
            "批量启用"
          ),
          a.createElement(
            d,
            {
              size: "small",
              danger: !0,
              icon: X ? a.createElement(X) : void 0,
              disabled: P.size === 0 || re,
              loading: re,
              onClick: ve
            },
            "批量停用"
          ),
          a.createElement(
            d,
            {
              size: "small",
              danger: !0,
              icon: W ? a.createElement(W) : void 0,
              disabled: P.size === 0 || re,
              loading: re,
              onClick: ce
            },
            `删除 (${P.size})`
          ),
          a.createElement(
            d,
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
            d,
            {
              size: "small",
              icon: z ? a.createElement(z) : void 0,
              onClick: Se,
              disabled: $.length === 0
            },
            "批量管理"
          ),
          a.createElement(
            d,
            {
              icon: x ? a.createElement(x) : void 0,
              onClick: () => {
                Vt(), A();
              }
            },
            "刷新"
          )
        )
      )
    ),
    M ? a.createElement(
      "div",
      { style: { textAlign: "center", padding: 60 } },
      a.createElement(o, { size: "large" })
    ) : $.length === 0 ? a.createElement(c, {
      description: "当前智能体未加载任何技能"
    }) : a.createElement(
      u,
      { gutter: [12, 12] },
      ...$.map(
        (H) => a.createElement(
          m,
          { key: H.name, xs: 24, sm: 12, md: 8, lg: 6 },
          a.createElement(
            p,
            {
              hoverable: !0,
              size: "small",
              style: {
                cursor: le ? "default" : "pointer",
                height: "100%",
                position: "relative",
                borderColor: le && P.has(H.name) ? "#0072f5" : void 0,
                borderWidth: le && P.has(H.name) ? 2 : 1
              },
              onClick: () => {
                le ? S(H.name) : (ne(H), F(!0));
              },
              onMouseEnter: () => {
                le || U(H.name);
              },
              onMouseLeave: () => U(null)
            },
            le ? a.createElement(
              "div",
              {
                style: {
                  position: "absolute",
                  top: 8,
                  right: 8,
                  zIndex: 1
                },
                onClick: (L) => {
                  L.stopPropagation(), S(H.name);
                }
              },
              a.createElement(h, {
                checked: P.has(H.name)
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
              H.emoji ? a.createElement(
                "span",
                { style: { fontSize: 18 } },
                H.emoji
              ) : a.createElement(
                "span",
                { style: { fontSize: 18 } },
                "⚡"
              ),
              a.createElement(
                T,
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
                H.name
              ),
              H.enabled === !1 ? a.createElement(
                w,
                { color: "default", style: { fontSize: 10 } },
                "已禁用"
              ) : a.createElement(
                w,
                { color: "green", style: { fontSize: 10 } },
                "已启用"
              )
            ),
            H.description ? a.createElement(
              k,
              {
                type: "secondary",
                style: { fontSize: 11, margin: 0, lineHeight: 1.4 },
                ellipsis: { rows: 2 }
              },
              H.description
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
              H.version_text ? a.createElement(
                w,
                { style: { fontSize: 10 } },
                `v${H.version_text}`
              ) : null,
              ...(H.tags || []).slice(0, 3).map(
                (L, se) => a.createElement(
                  w,
                  { key: se, color: "blue", style: { fontSize: 10 } },
                  L
                )
              )
            ),
            // Hover action footer (not in batch mode)
            !le && ue === H.name ? a.createElement(
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
                d,
                {
                  size: "small",
                  type: "default",
                  icon: H.enabled === !1 ? R ? a.createElement(R) : void 0 : X ? a.createElement(X) : void 0,
                  disabled: ie,
                  onClick: (L) => {
                    L.stopPropagation(), xe(H);
                  }
                },
                H.enabled === !1 ? "启用" : "禁用"
              ),
              a.createElement(
                d,
                {
                  size: "small",
                  danger: !0,
                  icon: W ? a.createElement(W) : void 0,
                  disabled: ie,
                  onClick: (L) => {
                    L.stopPropagation(), Ie(H);
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
    I ? a.createElement(
      E,
      {
        title: a.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 8 } },
          a.createElement(
            "span",
            { style: { fontSize: 18 } },
            I.emoji || "⚡"
          ),
          a.createElement("span", null, I.name)
        ),
        open: q,
        onClose: () => F(!1),
        width: 520,
        extra: a.createElement(
          d,
          {
            type: "primary",
            size: "small",
            icon: K ? a.createElement(K) : void 0,
            onClick: () => r("/skills")
          },
          "管理技能"
        )
      },
      a.createElement(
        v,
        { column: 1, bordered: !0, size: "small" },
        a.createElement(
          v.Item,
          { label: "技能名称" },
          I.name
        ),
        a.createElement(
          v.Item,
          { label: "描述" },
          I.description || "-"
        ),
        I.version_text ? a.createElement(
          v.Item,
          { label: "版本" },
          I.version_text
        ) : null,
        a.createElement(
          v.Item,
          { label: "来源" },
          I.source || "-"
        ),
        a.createElement(
          v.Item,
          { label: "状态" },
          I.enabled === !1 ? "已禁用" : "已启用"
        ),
        I.installed_from ? a.createElement(
          v.Item,
          { label: "安装来源" },
          I.installed_from
        ) : null
      ),
      // Tags
      I.tags && I.tags.length > 0 ? a.createElement(
        "div",
        { style: { marginTop: 16 } },
        a.createElement(
          T,
          {
            strong: !0,
            style: { display: "block", marginBottom: 8 }
          },
          "标签"
        ),
        a.createElement(
          "div",
          { style: { display: "flex", flexWrap: "wrap", gap: 4 } },
          ...I.tags.map(
            (H, L) => a.createElement(w, { key: L, color: "blue" }, H)
          )
        )
      ) : null,
      // Skill content preview
      I.content ? a.createElement(
        "div",
        { style: { marginTop: 16 } },
        a.createElement(
          T,
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
          I.content.slice(0, 2e3) + (I.content.length > 2e3 ? `

... (内容已截断)` : "")
        )
      ) : null
    ) : null
  );
}
function Di({
  poolSkills: e,
  workspaceSkills: t,
  agents: n,
  loading: r,
  onReload: a,
  onSkillInstalled: l,
  agentId: i,
  agentName: s
}) {
  const o = C().React, { useState: c, useMemo: d, useCallback: u, useEffect: m, useRef: p } = o, {
    Spin: w,
    Empty: h,
    Input: y,
    Button: f,
    Row: E,
    Col: v,
    Card: g,
    Tag: x,
    Typography: O,
    Drawer: K,
    Descriptions: z,
    List: R,
    Modal: X,
    message: W
  } = C().antd, {
    ReloadOutlined: N,
    SearchOutlined: T,
    DownloadOutlined: k,
    ThunderboltOutlined: $,
    DeleteOutlined: _,
    PlusOutlined: M
  } = C().antdIcons || {}, { Text: G, Paragraph: q } = O, [F, I] = c(""), [ne, le] = c(!1), [D, P] = c(null), [oe, re] = c([]), [Y, ue] = c(!1), [U, ie] = c(24), [me, A] = c(null), [S, V] = c(!1), pe = p(0), Se = p(null), Le = d(
    () => {
      var te;
      return new Set(
        ((te = t.find((ge) => ge.agent_id === i)) == null ? void 0 : te.skill_names) || []
      );
    },
    [t, i]
  ), ve = d(() => {
    if (!F.trim()) return e;
    const te = F.toLowerCase();
    return e.filter(
      (ge) => {
        var we, Re;
        return ge.name.toLowerCase().includes(te) || ((we = ge.description) == null ? void 0 : we.toLowerCase().includes(te)) || ((Re = ge.tags) == null ? void 0 : Re.some((B) => B.toLowerCase().includes(te)));
      }
    );
  }, [e, F]), ce = d(
    () => ve.slice(0, U),
    [ve, U]
  );
  m(() => {
    if (ce.length >= ve.length) return;
    const te = Se.current;
    if (!te) return;
    const ge = () => {
      ie(
        (Re) => Math.min(Re + 24, ve.length)
      );
    };
    if (typeof IntersectionObserver < "u") {
      const Re = new IntersectionObserver(
        (B) => {
          B.some((ye) => ye.isIntersecting) && ge();
        },
        { rootMargin: "240px 0px" }
      );
      return Re.observe(te), () => Re.disconnect();
    }
    const we = () => {
      te.getBoundingClientRect().top <= window.innerHeight + 240 && ge();
    };
    return window.addEventListener("scroll", we, { passive: !0 }), we(), () => window.removeEventListener("scroll", we);
  }, [ve.length, ce.length]);
  const xe = u((te) => {
    I(te), ie(24);
  }, []), Ie = u(() => {
    const te = pe.current;
    requestAnimationFrame(() => {
      window.scrollTo({ top: te, behavior: "auto" }), document.scrollingElement && (document.scrollingElement.scrollTop = te);
    });
  }, []), H = u(async () => {
    var te;
    pe.current = ((te = document.scrollingElement) == null ? void 0 : te.scrollTop) ?? window.scrollY ?? 0;
    try {
      await a();
    } finally {
      Ie();
    }
  }, [a, Ie]), L = u(
    (te) => {
      const ge = [];
      for (const we of t)
        if (we.skill_names.includes(te)) {
          const Re = n.find((B) => B.id === we.agent_id);
          ge.push((Re == null ? void 0 : Re.name) || we.agent_name || we.agent_id);
        }
      return ge;
    },
    [t, n]
  ), se = u(
    async (te) => {
      if (P(te), re(L(te.name)), le(!0), !te.content) {
        ue(!0);
        try {
          const ge = await To(te.name);
          P({ ...te, content: ge });
        } catch {
        } finally {
          ue(!1);
        }
      }
    },
    [L]
  );
  m(() => {
    D && re(L(D.name));
  }, [D, L, t]);
  const he = async (te) => {
    V(!0);
    try {
      await lr(i, te.name), W.success(
        `已将技能「${te.name}」加载到当前专家「${s}」`
      ), l(te);
    } catch (ge) {
      W.error(ge.message || "加载技能失败");
    } finally {
      V(!1);
    }
  }, j = (te) => {
    if (te.protected) {
      W.warning("内置技能不可删除");
      return;
    }
    X.confirm({
      title: `确认从技能池删除「${te.name}」？`,
      content: "删除后所有已安装此技能的专家将不受影响，但技能池中将不再包含此技能。此操作不可撤销。",
      okText: "确认删除",
      cancelText: "取消",
      okButtonProps: { danger: !0 },
      onOk: async () => {
        V(!0);
        try {
          await Bo(te.name), W.success(`已从技能池删除「${te.name}」`), await H();
        } catch (ge) {
          W.error(ge.message || "删除失败");
        } finally {
          V(!1);
        }
      }
    });
  }, Ee = (te) => {
    window.history.pushState({}, "", te), window.dispatchEvent(new PopStateEvent("popstate"));
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
      o.createElement(y, {
        placeholder: "搜索技能名称、描述或标签...",
        prefix: T ? o.createElement(T) : void 0,
        value: F,
        onChange: (te) => xe(te.target.value),
        allowClear: !0,
        style: { maxWidth: 400 }
      }),
      o.createElement(
        "div",
        { style: { display: "flex", gap: 8 } },
        o.createElement(
          f,
          {
            icon: N ? o.createElement(N) : void 0,
            onClick: H,
            loading: r,
            size: "small"
          },
          "刷新"
        ),
        o.createElement(
          f,
          {
            type: "primary",
            icon: k ? o.createElement(k) : void 0,
            onClick: () => Ee("/skill-pool"),
            size: "small",
            style: qe
          },
          "管理技能池"
        )
      )
    ),
    r ? o.createElement(
      "div",
      { style: { textAlign: "center", padding: 60 } },
      o.createElement(w, { size: "large" })
    ) : ve.length === 0 ? o.createElement(h, {
      description: F ? "未找到匹配的技能" : "技能池为空"
    }) : o.createElement(
      o.Fragment,
      null,
      o.createElement(
        E,
        { gutter: [12, 12] },
        ...ce.map(
          (te) => o.createElement(
            v,
            { key: te.name, xs: 24, sm: 12, md: 8, lg: 6 },
            o.createElement(
              g,
              {
                hoverable: !0,
                size: "small",
                style: { cursor: "pointer", height: "100%" },
                onClick: () => se(te),
                onMouseEnter: () => A(te.name),
                onMouseLeave: () => A(null)
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
                te.emoji ? o.createElement(
                  "span",
                  { style: { fontSize: 18 } },
                  te.emoji
                ) : o.createElement(
                  "span",
                  { style: { fontSize: 18 } },
                  "⚡"
                ),
                o.createElement(
                  G,
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
                te.protected ? o.createElement(
                  x,
                  { color: "gold", style: { fontSize: 10 } },
                  "内置"
                ) : null
              ),
              te.description ? o.createElement(
                q,
                {
                  type: "secondary",
                  style: { fontSize: 11, margin: 0, lineHeight: 1.4 },
                  ellipsis: { rows: 2 }
                },
                te.description
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
                te.version_text ? o.createElement(
                  x,
                  { style: { fontSize: 10 } },
                  `v${te.version_text}`
                ) : null,
                ...(te.tags || []).slice(0, 3).map(
                  (ge, we) => o.createElement(
                    x,
                    { key: we, color: "cyan", style: { fontSize: 10 } },
                    ge
                  )
                )
              ),
              // Hover action footer
              me === te.name ? o.createElement(
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
                  f,
                  {
                    size: "small",
                    type: "primary",
                    icon: M ? o.createElement(M) : void 0,
                    disabled: S || Le.has(te.name),
                    onClick: (ge) => {
                      ge.stopPropagation(), he(te);
                    }
                  },
                  Le.has(te.name) ? "已加载" : "加载到当前Agent"
                ),
                o.createElement(
                  f,
                  {
                    size: "small",
                    danger: !0,
                    icon: _ ? o.createElement(_) : void 0,
                    disabled: S || te.protected,
                    onClick: (ge) => {
                      ge.stopPropagation(), j(te);
                    }
                  },
                  "删除"
                )
              ) : null
            )
          )
        ),
        // Infinite-scroll sentinel
        ce.length < ve.length ? o.createElement(
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
          o.createElement(
            G,
            { type: "secondary", style: { fontSize: 12 } },
            `继续下滑自动加载 · 还剩 ${ve.length - ce.length} 个`
          )
        ) : null
      )
    ),
    // Skill detail drawer
    D ? o.createElement(
      K,
      {
        title: o.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 8 } },
          o.createElement(
            "span",
            { style: { fontSize: 18 } },
            D.emoji || "⚡"
          ),
          o.createElement("span", null, D.name)
        ),
        open: ne,
        onClose: () => le(!1),
        width: 520,
        extra: o.createElement(
          f,
          {
            type: "primary",
            size: "small",
            icon: $ ? o.createElement($) : void 0,
            onClick: () => Ee("/skills")
          },
          "管理技能"
        )
      },
      o.createElement(
        z,
        { column: 1, bordered: !0, size: "small" },
        o.createElement(
          z.Item,
          { label: "技能名称" },
          D.name
        ),
        o.createElement(
          z.Item,
          { label: "描述" },
          D.description || "-"
        ),
        D.version_text ? o.createElement(
          z.Item,
          { label: "版本" },
          D.version_text
        ) : null,
        o.createElement(
          z.Item,
          { label: "来源" },
          D.source || "-"
        ),
        o.createElement(
          z.Item,
          { label: "受保护" },
          D.protected ? "是（内置）" : "否"
        ),
        D.sync_status ? o.createElement(
          z.Item,
          { label: "同步状态" },
          D.sync_status
        ) : null,
        D.installed_from ? o.createElement(
          z.Item,
          { label: "安装来源" },
          D.installed_from
        ) : null
      ),
      // Tags
      D.tags && D.tags.length > 0 ? o.createElement(
        "div",
        { style: { marginTop: 16 } },
        o.createElement(
          G,
          {
            strong: !0,
            style: { display: "block", marginBottom: 8 }
          },
          "标签"
        ),
        o.createElement(
          "div",
          { style: { display: "flex", flexWrap: "wrap", gap: 4 } },
          ...D.tags.map(
            (te, ge) => o.createElement(x, { key: ge, color: "cyan" }, te)
          )
        )
      ) : null,
      // Installed agents
      o.createElement(
        "div",
        { style: { marginTop: 16 } },
        o.createElement(
          G,
          { strong: !0, style: { display: "block", marginBottom: 8 } },
          `已安装此技能的专家 (${oe.length})`
        ),
        oe.length > 0 ? o.createElement(R, {
          size: "small",
          dataSource: oe,
          renderItem: (te) => o.createElement(
            R.Item,
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
              o.createElement(nt, { name: te, size: 20 }),
              o.createElement(
                G,
                { style: { fontSize: 13 } },
                te
              )
            )
          )
        }) : o.createElement(
          G,
          { type: "secondary", style: { fontSize: 12 } },
          "暂无专家安装此技能"
        )
      ),
      // Skill content preview (lazy-loaded)
      Y ? o.createElement(
        "div",
        { style: { marginTop: 16, textAlign: "center" } },
        o.createElement(w, { size: "small" })
      ) : D.content ? o.createElement(
        "div",
        { style: { marginTop: 16 } },
        o.createElement(
          G,
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
          D.content.slice(0, 2e3) + (D.content.length > 2e3 ? `

... (内容已截断)` : "")
        )
      ) : null
    ) : null
  );
}
function Fi({
  embedded: e = !1
} = {}) {
  const t = C().React, { useState: n, useEffect: r, useCallback: a, useMemo: l } = t, { Tabs: i, message: s } = C().antd, { ThunderboltOutlined: o, AppstoreOutlined: c } = C().antdIcons || {}, u = C().useSelectedAgent, m = u ? u() : null, p = (m == null ? void 0 : m.id) || "default";
  r(() => {
    rr();
  }, [p]);
  const [w, h] = n([]), [y, f] = n([]), [E, v] = n([]), [g, x] = n(!0), [O, K] = n("agent-skills"), [z, R] = n(0), X = a(async () => {
    x(!0);
    try {
      const [_, M, G] = await Promise.all([
        kn(!0),
        Sn(),
        _o()
      ]);
      f(_), h(M), v(G);
    } catch (_) {
      s.error(_.message || "加载技能列表失败"), f([]);
    } finally {
      x(!1);
    }
  }, []);
  r(() => {
    X();
  }, [X]);
  const W = l(() => {
    const _ = w.find((M) => M.id === p);
    return (_ == null ? void 0 : _.name) || p;
  }, [w, p]), N = a(
    (_) => {
      v(
        (M) => M.some((G) => G.agent_id === p) ? M.map((G) => G.agent_id !== p || G.skill_names.includes(_.name) ? G : {
          ...G,
          skill_names: [...G.skill_names, _.name]
        }) : [
          ...M,
          {
            agent_id: p,
            agent_name: W,
            skill_names: [_.name]
          }
        ]
      ), R((M) => M + 1);
    },
    [p, W]
  ), T = (_) => {
    window.history.pushState({}, "", _), window.dispatchEvent(new PopStateEvent("popstate"));
  }, k = [
    {
      key: "agent-skills",
      label: t.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        o ? t.createElement(o, { style: { fontSize: 14 } }) : null,
        "当前专家"
      ),
      children: t.createElement(Ni, {
        agentId: p,
        agentName: W,
        refreshKey: z,
        onNavigate: T
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
      children: t.createElement(Di, {
        poolSkills: y,
        workspaceSkills: E,
        agents: w,
        loading: g,
        onReload: X,
        onSkillInstalled: N,
        agentId: p,
        agentName: W
      })
    }
  ], $ = t.createElement(i, {
    items: k,
    activeKey: O,
    onChange: (_) => K(_)
  });
  return e ? $ : t.createElement(
    "div",
    { style: { padding: 24 } },
    t.createElement(wn, {
      title: "技能",
      subtitle: `技能池共 ${y.length} 个技能 · 当前智能体：${W}`
    }),
    $
  );
}
const Hn = {
  reservoir_simulation: "油藏数值模拟",
  geological_modeling: "地质建模",
  well_log_analysis: "测井分析",
  production_engineering: "采油工程",
  post_processing: "后处理与可视化",
  multiphysics: "多物理场仿真"
}, sl = {
  reservoir_simulation: "🛢️",
  geological_modeling: "🏔️",
  well_log_analysis: "📡",
  production_engineering: "⚙️",
  post_processing: "📊",
  multiphysics: "🔬"
}, cl = /* @__PURE__ */ new Set(["cmg", "comsol", "tnavigator", "eclipse", "intersect", "visage"]);
function dl(e) {
  return bn(`/ugsci/engines/icon/${encodeURIComponent(e)}`);
}
async function Gi() {
  return de("/ugsci/engines/list");
}
async function Hi(e) {
  return de("/ugsci/engines/", {
    method: "POST",
    body: JSON.stringify(e)
  });
}
async function Wi(e, t) {
  return de(`/ugsci/engines/${encodeURIComponent(e)}`, {
    method: "PUT",
    body: JSON.stringify(t)
  });
}
async function qi(e) {
  return de(
    `/ugsci/engines/${encodeURIComponent(e)}`,
    { method: "DELETE" }
  );
}
async function Vi() {
  return de("/ugsci/engines/detect/refresh", {
    method: "POST"
  });
}
function Ji({
  engine: e,
  onClick: t
}) {
  const n = C().React, { Card: r, Tag: a, Typography: l } = C().antd, { Text: i } = l, s = e.status === "detected", o = sl[e.category] || "📦", d = cl.has(e.id) ? n.createElement("img", {
    src: dl(e.id),
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
        borderColor: s ? void 0 : "var(--ant-color-border, #d9d9d9)",
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
        d,
        n.createElement(
          "div",
          null,
          n.createElement(
            i,
            { strong: !0, style: { fontSize: 14 } },
            e.name
          ),
          n.createElement("br"),
          n.createElement(
            i,
            { type: "secondary", style: { fontSize: 11 } },
            e.vendor || "—"
          )
        )
      ),
      n.createElement(
        "div",
        { style: { display: "flex", flexDirection: "column", gap: 4, alignItems: "flex-end" } },
        s ? n.createElement(
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
        i,
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
        Hn[e.category] || e.category
      ) : null,
      e.version ? n.createElement(
        a,
        { color: "blue", style: { fontSize: 11 } },
        `v${e.version}`
      ) : null,
      ...(e.modules || []).map(
        (u) => n.createElement(
          a,
          { key: u, color: "cyan", style: { fontSize: 10 } },
          u
        )
      )
    )
  );
}
function Ki() {
  const e = C().React, { useState: t, useEffect: n, useCallback: r, useMemo: a } = e, {
    Spin: l,
    Empty: i,
    Button: s,
    message: o,
    Row: c,
    Col: d,
    Drawer: u,
    Descriptions: m,
    Tag: p,
    Typography: w,
    Modal: h,
    Input: y,
    Select: f,
    Popconfirm: E,
    Space: v
  } = C().antd, {
    ReloadOutlined: g,
    SearchOutlined: x,
    PlusOutlined: O,
    EditOutlined: K,
    DeleteOutlined: z,
    CopyOutlined: R,
    ExperimentOutlined: X
  } = C().antdIcons || {}, { Text: W, Paragraph: N } = w, [T, k] = t([]), [$, _] = t(!0), [M, G] = t(""), [q, F] = t(!1), [I, ne] = t(null), [le, D] = t(!1), [P, oe] = t(null), [re, Y] = t({}), [ue, U] = t(!1), ie = r(async () => {
    _(!0);
    try {
      const ce = await Gi();
      k(ce.engines || []);
    } catch (ce) {
      o.error(ce.message || "加载引擎列表失败"), k([]);
    } finally {
      _(!1);
    }
  }, []);
  n(() => {
    ie();
  }, [ie]);
  const me = a(() => {
    if (!M.trim()) return T;
    const ce = M.toLowerCase();
    return T.filter(
      (xe) => {
        var Ie;
        return xe.name.toLowerCase().includes(ce) || xe.vendor.toLowerCase().includes(ce) || xe.category.toLowerCase().includes(ce) || ((Ie = xe.description) == null ? void 0 : Ie.toLowerCase().includes(ce));
      }
    );
  }, [T, M]);
  T.filter((ce) => ce.status === "detected").length;
  const A = r((ce) => {
    navigator.clipboard.writeText(ce).then(() => o.success("路径已复制")).catch(() => o.error("复制失败"));
  }, []), S = r(() => {
    oe(null), Y({
      name: "",
      vendor: "",
      version: "",
      executable_path: "",
      category: "",
      description: "",
      invocation_hint: ""
    }), D(!0);
  }, []), V = r((ce) => {
    oe(ce), Y({ ...ce }), D(!0), F(!1);
  }, []), pe = r(async () => {
    var ce;
    if (!((ce = re.name) != null && ce.trim())) {
      o.warning("请输入引擎名称");
      return;
    }
    U(!0);
    try {
      P ? (await Wi(P.id, re), o.success("引擎已更新")) : (await Hi(re), o.success("引擎已添加")), D(!1), ie();
    } catch (xe) {
      o.error(xe.message || "保存失败");
    } finally {
      U(!1);
    }
  }, [re, P, ie]), Se = r(
    async (ce) => {
      try {
        await qi(ce), o.success("引擎已删除"), F(!1), ie();
      } catch (xe) {
        o.error(xe.message || "删除失败");
      }
    },
    [ie]
  ), Le = r(async () => {
    _(!0);
    try {
      const ce = await Vi();
      k(ce.engines || []), o.success("自动检测完成");
    } catch (ce) {
      o.error(ce.message || "检测失败");
    } finally {
      _(!1);
    }
  }, []), ve = r(
    (ce, xe, Ie) => {
      const H = re[xe] || "";
      return e.createElement(
        "div",
        { style: { marginBottom: 12 } },
        e.createElement(
          W,
          { style: { fontSize: 13, display: "block", marginBottom: 4 } },
          ce
        ),
        Ie != null && Ie.select ? e.createElement(f, {
          value: H || void 0,
          onChange: (L) => Y((se) => ({ ...se, [xe]: L })),
          style: { width: "100%" },
          options: Ie.select.options,
          allowClear: !0,
          placeholder: `选择${ce}`
        }) : Ie != null && Ie.textarea ? e.createElement(y.TextArea, {
          value: H,
          onChange: (L) => Y((se) => ({ ...se, [xe]: L.target.value })),
          rows: 3,
          placeholder: `输入${ce}`
        }) : e.createElement(y, {
          value: H,
          onChange: (L) => Y((se) => ({ ...se, [xe]: L.target.value })),
          placeholder: `输入${ce}`
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
      e.createElement(y, {
        placeholder: "搜索引擎名称、厂商...",
        prefix: x ? e.createElement(x) : void 0,
        value: M,
        onChange: (ce) => G(ce.target.value),
        allowClear: !0,
        style: { maxWidth: 280 }
      }),
      e.createElement(
        s,
        {
          icon: g ? e.createElement(g) : void 0,
          onClick: Le,
          loading: $
        },
        "自动检测"
      ),
      e.createElement(
        s,
        {
          type: "primary",
          icon: O ? e.createElement(O) : void 0,
          onClick: S,
          style: qe
        },
        "添加引擎"
      )
    ),
    // Content
    $ ? e.createElement(
      "div",
      { style: { textAlign: "center", padding: 60 } },
      e.createElement(l, {
        size: "large",
        tip: "正在加载引擎..."
      })
    ) : me.length === 0 ? e.createElement(i, {
      description: M ? "无匹配引擎" : "暂无引擎，点击「添加引擎」开始"
    }) : e.createElement(
      c,
      { gutter: [12, 12], align: "stretch" },
      ...me.map(
        (ce) => e.createElement(
          d,
          {
            key: ce.id,
            xs: 24,
            sm: 12,
            md: 8,
            lg: 6,
            style: { display: "flex" }
          },
          e.createElement(Ji, {
            engine: ce,
            onClick: () => {
              ne(ce), F(!0);
            }
          })
        )
      )
    ),
    // Detail drawer
    I ? e.createElement(
      u,
      {
        title: e.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 8 } },
          e.createElement(
            "span",
            { style: { display: "flex", alignItems: "center" } },
            cl.has(I.id) ? e.createElement("img", {
              src: dl(I.id),
              alt: I.name,
              style: { width: 20, height: 20, objectFit: "contain" }
            }) : e.createElement(
              "span",
              { style: { fontSize: 18 } },
              sl[I.category] || "📦"
            )
          ),
          e.createElement("span", null, I.name)
        ),
        open: q,
        onClose: () => F(!1),
        width: 520,
        extra: e.createElement(
          v,
          null,
          e.createElement(
            s,
            {
              size: "small",
              icon: K ? e.createElement(K) : void 0,
              onClick: () => V(I)
            },
            "编辑"
          ),
          I.is_default ? null : e.createElement(
            E,
            {
              title: "确认删除此引擎？",
              description: I.name,
              onConfirm: () => Se(I.id),
              okText: "删除",
              cancelText: "取消",
              okButtonProps: { danger: !0 }
            },
            e.createElement(
              s,
              {
                size: "small",
                danger: !0,
                icon: z ? e.createElement(z) : void 0
              },
              "删除"
            )
          )
        )
      },
      e.createElement(
        m,
        { column: 1, bordered: !0, size: "small" },
        e.createElement(
          m.Item,
          { label: "引擎名称" },
          I.name
        ),
        e.createElement(
          m.Item,
          { label: "厂商" },
          I.vendor || "—"
        ),
        e.createElement(
          m.Item,
          { label: "分类" },
          I.category ? Hn[I.category] || I.category : "—"
        ),
        e.createElement(
          m.Item,
          { label: "状态" },
          e.createElement(
            p,
            {
              color: I.status === "detected" ? "success" : I.status === "not_found" ? "error" : "default"
            },
            I.status === "detected" ? "✅ 已检测" : I.status === "not_found" ? "❌ 路径无效" : "🔧 待配置"
          )
        ),
        e.createElement(
          m.Item,
          { label: "版本" },
          I.version || "—"
        ),
        I.executable_path ? e.createElement(
          m.Item,
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
              I.executable_path
            ),
            e.createElement(
              s,
              {
                size: "small",
                type: "text",
                icon: R ? e.createElement(R) : void 0,
                onClick: () => A(I.executable_path)
              }
            )
          )
        ) : null,
        I.install_dir ? e.createElement(
          m.Item,
          { label: "安装目录" },
          e.createElement(
            "code",
            { style: { fontSize: 12, wordBreak: "break-all" } },
            I.install_dir
          )
        ) : null,
        // Display detected modules with paths
        I.modules && I.modules.length > 0 ? e.createElement(
          m.Item,
          { label: "已检测模块" },
          e.createElement(
            "div",
            { style: { display: "flex", flexDirection: "column", gap: 4 } },
            ...I.modules.map(
              (ce) => e.createElement(
                "div",
                {
                  key: ce,
                  style: { display: "flex", alignItems: "center", gap: 8 }
                },
                e.createElement(
                  p,
                  { color: "cyan", style: { fontSize: 11 } },
                  ce
                ),
                I.module_paths && I.module_paths[ce] ? e.createElement(
                  "code",
                  { style: { fontSize: 11, wordBreak: "break-all" } },
                  I.module_paths[ce]
                ) : null
              )
            )
          )
        ) : null,
        I.license_server ? e.createElement(
          m.Item,
          { label: "许可证服务器" },
          I.license_server
        ) : null,
        e.createElement(
          m.Item,
          { label: "描述" },
          I.description || "—"
        )
      ),
      // Invocation hint
      I.invocation_hint ? e.createElement(
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
          I.invocation_hint
        )
      ) : null,
      // Type badge
      e.createElement(
        "div",
        { style: { marginTop: 12 } },
        I.is_default ? e.createElement(
          p,
          { color: "blue" },
          "默认引擎"
        ) : I.is_custom ? e.createElement(
          p,
          { color: "purple" },
          "自定义引擎"
        ) : null
      )
    ) : null,
    // Add/Edit modal
    e.createElement(
      h,
      {
        title: P ? "编辑引擎" : "添加引擎",
        open: le,
        onOk: pe,
        onCancel: () => D(!1),
        okText: P ? "保存" : "添加",
        cancelText: "取消",
        confirmLoading: ue,
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
            options: Object.entries(Hn).map(([ce, xe]) => ({
              label: xe,
              value: ce
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
async function Xi(e = !1) {
  const t = await de(
    "/ugsci/domain-engines/list",
    e ? { bypassCache: !0 } : void 0
  );
  return (t == null ? void 0 : t.engines) || [];
}
function Yi(e = !1) {
  return de(
    "/ugsci/domain-engines/neqsim/runtime",
    e ? { bypassCache: !0 } : void 0
  );
}
function Qi() {
  return de("/ugsci/domain-engines/neqsim/install", {
    method: "POST"
  });
}
function Zi(e) {
  return de(
    `/ugsci/domain-engines/neqsim/install/${encodeURIComponent(e)}`,
    { bypassCache: !0 }
  );
}
async function es(e, t = !1) {
  const n = await de("/tools", {
    headers: { "X-Agent-Id": e },
    ...t ? { bypassCache: !0 } : {}
  }) || [];
  return new Map(n.map((r) => [r.name, r]));
}
async function ts(e, t = !1) {
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
    const i = l.key;
    if (!l.enabled) {
      n.set(i, { key: i, enabled: !1, toolCount: 0, error: null });
      continue;
    }
    try {
      const s = await de(
        `/mcp/tools/${encodeURIComponent(i)}`,
        r
      ) || [];
      n.set(i, {
        key: i,
        enabled: !0,
        toolCount: s.filter((o) => o.enabled).length,
        error: null
      });
    } catch (s) {
      n.set(i, {
        key: i,
        enabled: !0,
        toolCount: 0,
        error: s instanceof Error ? s.message : "Tool query failed"
      });
    }
  }
  return n;
}
function ra(e) {
  return e ? e.overall === "available" ? "available" : e.overall === "unavailable" ? "unavailable" : "unknown" : "unknown";
}
function aa(e) {
  return e ? e.enabled ? e.error ? "error" : e.toolCount > 0 ? "available" : "error" : "unconfigured" : "unavailable";
}
function ns(e, t = null, n = /* @__PURE__ */ new Map()) {
  const r = e.engine, a = e.dependency_status;
  let l, i, s;
  if (r.provider.kind === "driver")
    a.overall === "unavailable" ? l = "needs_install" : l = aa(t), i = (t == null ? void 0 : t.toolCount) ?? 0, s = (t == null ? void 0 : t.key) ?? r.provider.id;
  else if (r.source === "builtin") {
    const o = ra(a), c = r.operations.flatMap((m) => m.tool_names), d = c.filter((m) => n.has(m)), u = d.filter(
      (m) => {
        var p;
        return (p = n.get(m)) == null ? void 0 : p.enabled;
      }
    );
    o !== "available" ? l = o : d.length !== c.length ? l = "error" : u.length === 0 ? l = "unconfigured" : l = "available", i = u.length, s = null;
  } else r.source === "mcp" ? (l = aa(t), i = (t == null ? void 0 : t.toolCount) ?? 0, s = (t == null ? void 0 : t.key) ?? r.provider.id) : (l = ra(a), i = 0, s = null);
  return {
    definition: r,
    dependencyStatus: a,
    checkedAt: e.checked_at,
    effectiveStatus: l,
    discoveredToolCount: i,
    mcpProviderKey: s
  };
}
function rs(e) {
  const t = /* @__PURE__ */ new Map();
  for (const n of e) {
    const r = n.definition.domain;
    t.has(r) || t.set(r, []), t.get(r).push(n);
  }
  return t;
}
const Wn = {
  available: "可用",
  unavailable: "不可用",
  unknown: "未知",
  needs_install: "待安装",
  unconfigured: "未配置",
  error: "错误"
}, qn = {
  available: "success",
  unavailable: "error",
  unknown: "default",
  needs_install: "warning",
  unconfigured: "warning",
  error: "error"
}, as = {
  geology_well_logging: "📡",
  production_engineering: "⚙️",
  fluid_thermodynamics: "🧪",
  scientific_computing: "🧮",
  data_modeling: "📊"
}, ls = {
  builtin: "内置",
  mcp: "MCP",
  library: "计算库"
}, os = {
  deterministic: "确定性",
  stochastic: "随机/概率",
  external: "外部 Provider",
  visualization: "可视化"
}, is = {
  deterministic: "green",
  stochastic: "purple",
  external: "blue",
  visualization: "cyan"
};
function ss({
  view: e,
  onClick: t
}) {
  const n = C().React, { Card: r, Tag: a, Typography: l } = C().antd, { Text: i } = l, s = e.definition, o = as[s.domain] || "📦", c = e.effectiveStatus, d = s.operations.length, u = e.discoveredToolCount;
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
            i,
            { strong: !0, style: { fontSize: 14 } },
            s.name
          ),
          n.createElement("br"),
          n.createElement(
            i,
            { type: "secondary", style: { fontSize: 11 } },
            s.provider.kind === "driver" ? "内置 · MCP" : ls[s.source] || s.source
          )
        )
      ),
      n.createElement(
        a,
        { color: qn[c] || "default", style: { fontSize: 11 } },
        Wn[c] || c
      )
    ),
    n.createElement(
      "div",
      { style: { flex: 1, minHeight: 32 } },
      n.createElement(
        i,
        { type: "secondary", style: { fontSize: 12 } },
        s.description
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
        `${d} 操作`
      ),
      n.createElement(
        a,
        {
          color: is[s.execution_class] || "default",
          style: { fontSize: 11 }
        },
        os[s.execution_class] || s.execution_class
      ),
      u > 0 ? n.createElement(
        a,
        { color: "blue", style: { fontSize: 11 } },
        `${u} 工具`
      ) : null,
      ...(s.tags || []).map(
        (m) => n.createElement(
          a,
          { key: m, color: "cyan", style: { fontSize: 10 } },
          m
        )
      )
    )
  );
}
function cs({
  view: e,
  open: t,
  onClose: n,
  onNavigateToMcp: r,
  onNavigateToTools: a,
  onNavigateToSkills: l,
  onInstallNeqsim: i,
  neqsimInstallState: s
}) {
  const o = C().React, { Drawer: c, Descriptions: d, Tag: u, Typography: m, Button: p, Space: w, Divider: h } = C().antd, { Text: y, Paragraph: f } = m;
  if (!e) return null;
  const E = e.definition, v = e.dependencyStatus;
  return o.createElement(
    c,
    {
      title: o.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 8 } },
        o.createElement("span", null, E.name),
        o.createElement(
          u,
          {
            color: qn[e.effectiveStatus] || "default",
            style: { fontSize: 11 }
          },
          Wn[e.effectiveStatus] || e.effectiveStatus
        )
      ),
      open: t,
      onClose: n,
      width: 560,
      rootClassName: "ugsci-domain-engine-detail-drawer"
    },
    // Overview
    o.createElement(
      d,
      { column: 1, bordered: !0, size: "small" },
      o.createElement(
        d.Item,
        { label: "领域" },
        E.domain
      ),
      o.createElement(
        d.Item,
        { label: "来源" },
        E.provider.kind === "driver" ? "内置能力 · MCP Driver" : E.source === "builtin" ? "内置工具" : E.source === "mcp" ? "MCP 服务" : "科学计算库 / 技能"
      ),
      o.createElement(
        d.Item,
        { label: "实现" },
        `${E.provider.kind}:${E.provider.id}`
      ),
      o.createElement(
        d.Item,
        { label: "计算类别" },
        E.execution_class === "deterministic" ? "确定性计算" : E.execution_class === "stochastic" ? "随机/概率计算" : E.execution_class === "external" ? "外部 Provider" : "可视化"
      ),
      o.createElement(
        d.Item,
        { label: "内核版本" },
        E.engine_version
      ),
      o.createElement(
        d.Item,
        { label: "描述" },
        E.description
      ),
      o.createElement(
        d.Item,
        { label: "检测时间" },
        e.checkedAt
      )
    ),
    // Operations
    o.createElement(
      "div",
      { style: { marginTop: 16, marginBottom: 8 } },
      o.createElement(y, { strong: !0 }, "领域操作")
    ),
    ...E.operations.map(
      (g) => o.createElement(
        "div",
        {
          key: g.id,
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
          o.createElement(y, { strong: !0, style: { fontSize: 13 } }, g.name),
          o.createElement(
            y,
            { type: "secondary", style: { fontSize: 11, marginLeft: 8 } },
            g.id
          )
        ),
        o.createElement(
          y,
          { type: "secondary", style: { fontSize: 12 } },
          g.description
        ),
        g.tool_names.length > 0 ? o.createElement(
          "div",
          { style: { marginTop: 4, display: "flex", gap: 4, flexWrap: "wrap" } },
          ...g.tool_names.map(
            (x) => o.createElement(
              u,
              { key: x, color: "blue", style: { fontSize: 10 } },
              x
            )
          )
        ) : null
      )
    ),
    // Dependencies
    o.createElement(h, null),
    o.createElement(y, { strong: !0 }, "实现与依赖"),
    v && v.dependencies.length > 0 ? o.createElement(
      "div",
      { style: { marginTop: 8 } },
      ...v.dependencies.map(
        (g) => o.createElement(
          "div",
          {
            key: g.name,
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
            o.createElement(y, { style: { fontSize: 13 } }, g.name),
            o.createElement(
              u,
              {
                color: qn[g.status] || "default",
                style: { fontSize: 11 }
              },
              Wn[g.status] || g.status
            )
          ),
          g.status !== "available" && g.reason ? o.createElement(
            y,
            { type: "secondary", style: { display: "block", fontSize: 12, marginTop: 4 } },
            g.reason
          ) : null,
          g.status !== "available" && g.install_hint ? o.createElement(
            y,
            { style: { display: "block", fontSize: 12, marginTop: 4 } },
            `安装：${g.install_hint}`
          ) : null,
          g.status !== "available" && g.enable_hint ? o.createElement(
            y,
            { style: { display: "block", fontSize: 12, marginTop: 2 } },
            `启用：${g.enable_hint}`
          ) : null
        )
      )
    ) : o.createElement(
      f,
      { type: "secondary", style: { fontSize: 12 } },
      "无外部依赖"
    ),
    // Actions
    o.createElement(h, null),
    o.createElement(y, { strong: !0 }, "问题处理"),
    o.createElement(
      "div",
      { style: { marginTop: 8, display: "flex", gap: 8, flexWrap: "wrap" } },
      E.id === "neqsim" && e.effectiveStatus === "needs_install" ? o.createElement(
        p,
        {
          size: "small",
          type: "primary",
          loading: (s == null ? void 0 : s.status) === "queued" || (s == null ? void 0 : s.status) === "running",
          onClick: i
        },
        (s == null ? void 0 : s.status) === "running" ? `${s.message} (${s.progress}%)` : "安装 NeqSim 运行环境"
      ) : null,
      E.provider.kind === "driver" ? o.createElement(
        p,
        { size: "small", onClick: r },
        "查看内置 MCP Driver"
      ) : E.source === "library" ? o.createElement(
        p,
        { size: "small", onClick: l },
        "查看相关技能"
      ) : o.createElement(
        p,
        { size: "small", onClick: () => a("builtin") },
        "查看内置工具"
      )
    ),
    E.id === "neqsim" && (s == null ? void 0 : s.status) === "failed" ? o.createElement(
      f,
      { type: "danger", style: { marginTop: 8, fontSize: 12 } },
      s.error || "安装失败"
    ) : null,
    E.id === "neqsim" && (s != null && s.warning) ? o.createElement(
      f,
      { type: "warning", style: { marginTop: 8, fontSize: 12 } },
      s.warning
    ) : null
  );
}
const ds = {
  geology_well_logging: "测井地质",
  production_engineering: "采油工程",
  fluid_thermodynamics: "流体热力学",
  scientific_computing: "科学计算",
  data_modeling: "数据建模"
};
function us(e) {
  return e instanceof Error ? /Install task not found|HTTP 404/i.test(e.message) : !1;
}
function ms({
  onNavigateToMcp: e,
  onNavigateToTools: t,
  onNavigateToSkills: n
} = {}) {
  var ie, me;
  const r = C().React, { useState: a, useEffect: l, useCallback: i, useMemo: s, useRef: o } = r, {
    Spin: c,
    Empty: d,
    Button: u,
    message: m,
    Row: p,
    Col: w,
    Input: h,
    Drawer: y,
    Typography: f
  } = C().antd, { ReloadOutlined: E, SearchOutlined: v } = C().antdIcons || {}, { Text: g } = f, x = (me = (ie = C()).useSelectedAgent) == null ? void 0 : me.call(ie), O = (x == null ? void 0 : x.id) || "default", [K, z] = a([]), [R, X] = a(!0), [W, N] = a(""), [T, k] = a(!1), [$, _] = a(null), [M, G] = a(null), q = o(O);
  q.current = O;
  const F = o($);
  F.current = $;
  const I = o(0);
  l(() => () => {
    I.current += 1;
  }, []);
  const ne = i(
    async (A = !1, S = !1) => {
      var Le, ve;
      S || X(!0);
      const V = S && typeof window < "u" ? {
        x: window.scrollX,
        y: window.scrollY,
        drawerBody: typeof document < "u" ? document.querySelector(
          ".ugsci-domain-engine-detail-drawer .ant-drawer-body"
        ) : null,
        drawerTop: typeof document < "u" && ((Le = document.querySelector(
          ".ugsci-domain-engine-detail-drawer .ant-drawer-body"
        )) == null ? void 0 : Le.scrollTop) || 0
      } : null, pe = () => {
        if (!V || typeof window > "u") return;
        const ce = () => {
          var xe;
          window.scrollTo(V.x, V.y), (xe = V.drawerBody) != null && xe.isConnected && (V.drawerBody.scrollTop = V.drawerTop);
        };
        typeof window.requestAnimationFrame == "function" ? window.requestAnimationFrame(ce) : ce();
      }, Se = q.current;
      try {
        const [ce, xe, Ie] = await Promise.all([
          Xi(A),
          ts(Se, A),
          es(Se, A)
        ]);
        if (Se !== q.current) return;
        const H = [];
        for (const se of ce)
          try {
            let he = null;
            if (se.engine.provider.kind === "driver") {
              const j = se.engine.provider.id;
              he = xe.get(j) || null;
            }
            H.push(ns(se, he, Ie));
          } catch {
          }
        z(H);
        const L = (ve = F.current) == null ? void 0 : ve.definition.id;
        if (L) {
          const se = H.find(
            (he) => he.definition.id === L
          );
          se && (F.current = se, _(se));
        }
        pe();
      } catch (ce) {
        const xe = ce instanceof Error ? ce.message : "加载领域引擎失败";
        m.error(xe), S || z([]);
      } finally {
        S || X(!1);
      }
    },
    []
  );
  l(() => {
    ne();
  }, [O, ne]);
  const le = s(() => {
    if (!W.trim()) return K;
    const A = W.toLowerCase();
    return K.filter(
      (S) => S.definition.name.toLowerCase().includes(A) || S.definition.domain.toLowerCase().includes(A) || S.definition.description.toLowerCase().includes(A) || S.definition.tags.some((V) => V.toLowerCase().includes(A))
    );
  }, [K, W]), D = s(
    () => rs(le),
    [le]
  ), P = i(() => {
    ne(!0);
  }, [ne]), oe = i((A) => {
    F.current = A, _(A), k(!0);
  }, []), re = i(() => {
    k(!1), e == null || e();
  }, [e]), Y = i(
    (A) => {
      k(!1), t == null || t(A);
    },
    [t]
  ), ue = i(() => {
    k(!1), n == null || n();
  }, [n]), U = i(async () => {
    const A = ++I.current, S = () => A === I.current;
    try {
      let V = await Qi();
      if (!S()) return;
      for (G(V); V.status === "queued" || V.status === "running"; ) {
        if (await new Promise((pe) => setTimeout(pe, 1e3)), !S()) return;
        try {
          V = await Zi(V.id);
        } catch (pe) {
          if (!us(pe)) throw pe;
          const Se = await Yi(!0);
          if (!S()) return;
          Se.ready ? V = {
            ...V,
            status: "completed",
            progress: 100,
            message: "后端重启后已恢复 NeqSim 运行环境状态",
            error: "",
            runtime: Se,
            recovered: !0
          } : V = {
            ...V,
            status: "failed",
            message: "安装进程因后端重启中断",
            error: "后端重启后未发现完整的 NeqSim 运行环境，请重新安装",
            runtime: Se,
            recovered: !0
          };
        }
        if (!S()) return;
        G(V);
      }
      if (!S()) return;
      V.status === "completed" ? (V.warning ? m.warning(V.warning) : m.success("NeqSim 运行环境已安装并启用"), await ne(!0, !0)) : m.error(V.error || "NeqSim 安装失败");
    } catch (V) {
      if (!S()) return;
      m.error(V instanceof Error ? V.message : "NeqSim 安装失败");
    }
  }, [ne]);
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
      r.createElement(h, {
        placeholder: "搜索领域引擎...",
        prefix: v ? r.createElement(v) : void 0,
        value: W,
        onChange: (A) => N(A.target.value),
        allowClear: !0,
        style: { maxWidth: 280 }
      }),
      r.createElement(
        u,
        {
          icon: E ? r.createElement(E) : void 0,
          onClick: P,
          loading: R
        },
        "刷新"
      )
    ),
    // Content
    R ? r.createElement(
      "div",
      { style: { textAlign: "center", padding: 60 } },
      r.createElement(c, {
        size: "large",
        tip: "正在加载领域引擎..."
      })
    ) : le.length === 0 ? r.createElement(d, {
      description: W ? "无匹配引擎" : "暂无领域引擎"
    }) : r.createElement(
      "div",
      null,
      ...Array.from(D.entries()).map(
        ([A, S]) => r.createElement(
          "div",
          { key: A, style: { marginBottom: 20 } },
          r.createElement(
            g,
            {
              strong: !0,
              style: {
                fontSize: 14,
                display: "block",
                marginBottom: 8
              }
            },
            ds[A] || A
          ),
          r.createElement(
            p,
            { gutter: [12, 12], align: "stretch" },
            ...S.map(
              (V) => r.createElement(
                w,
                {
                  key: V.definition.id,
                  xs: 24,
                  sm: 12,
                  md: 8,
                  lg: 6,
                  style: { display: "flex" }
                },
                r.createElement(ss, {
                  view: V,
                  onClick: () => oe(V)
                })
              )
            )
          )
        )
      )
    ),
    // Detail drawer
    r.createElement(cs, {
      view: $,
      open: T,
      onClose: () => k(!1),
      onNavigateToMcp: re,
      onNavigateToTools: Y,
      onNavigateToSkills: ue,
      onInstallNeqsim: U,
      neqsimInstallState: M
    })
  );
}
const ps = Fi, ul = /* @__PURE__ */ new Set(["tools", "engines", "skills"]);
function fs(e) {
  try {
    const t = new URLSearchParams(window.location.search).get("tab");
    return t && ul.has(t) ? t : e;
  } catch {
    return e;
  }
}
function la(e) {
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
function Vn({ page: e }) {
  const t = C().React, { useEffect: n, useState: r } = t, { Alert: a, Spin: l } = C().antd, [i, s] = r(null), [o, c] = r("");
  if (n(() => {
    let u = !0;
    const m = C().loadBuiltinPage;
    return s(null), m ? (c(""), m(e).then((p) => {
      u && s(() => p);
    }).catch((p) => {
      u && c(
        p instanceof Error ? p.message : "加载原生管理页面失败"
      );
    }), () => {
      u = !1;
    }) : (c("当前 QwenPaw 版本不支持原生页面嵌入"), () => {
      u = !1;
    });
  }, [e]), o)
    return t.createElement(a, {
      type: "error",
      showIcon: !0,
      message: "原生管理功能加载失败",
      description: o
    });
  if (!i)
    return t.createElement(
      "div",
      { style: { padding: 56, textAlign: "center" } },
      t.createElement(
        l,
        { tip: "正在加载原生管理功能..." },
        t.createElement("div", { style: { minHeight: 24 } })
      )
    );
  const d = e === "mcp" ? {
    title: "UGSci MCP",
    description: "连接外部工具、数据服务与计算能力，扩展当前专家的可调用范围",
    managedTitle: "已接入服务",
    managedDescription: "启用后可由当前专家调用，并可按工具配置访问权限",
    create: "接入 MCP 服务"
  } : void 0;
  return t.createElement(i, { embedded: !0, embeddedLabels: d });
}
function gs({
  activeSubTab: e,
  onSubTabChange: t
}) {
  const n = C().React, { Tabs: r } = C().antd;
  return n.createElement(r, {
    activeKey: e,
    onChange: t,
    items: [
      {
        key: "mcp",
        label: "MCP 接入",
        children: n.createElement(Vn, { page: "mcp" })
      },
      {
        key: "builtin",
        label: "平台内置",
        children: n.createElement(Vn, { page: "tools" })
      }
    ]
  });
}
function ys({
  onNavigateToMcp: e,
  onNavigateToTools: t,
  onNavigateToSkills: n
} = {}) {
  const r = C().React, { Tabs: a } = C().antd;
  return r.createElement(a, {
    defaultActiveKey: "simulation",
    items: [
      {
        key: "simulation",
        label: "仿真软件",
        children: r.createElement(Ki)
      },
      {
        key: "domain",
        label: "领域计算",
        children: r.createElement(
          ms,
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
        children: r.createElement(Vn, { page: "acp" })
      }
    ]
  });
}
function ml({
  initialTab: e = "engines"
} = {}) {
  var f, E;
  const t = C().React, { useEffect: n, useState: r } = t, { Tabs: a, Tag: l } = C().antd, { RocketOutlined: i, ToolOutlined: s, ThunderboltOutlined: o } = C().antdIcons || {}, c = (E = (f = C()).useSelectedAgent) == null ? void 0 : E.call(f), d = (c == null ? void 0 : c.id) || "default", [u, m] = r(
    () => fs(e)
  ), [p, w] = r("mcp");
  n(() => {
    try {
      const v = new URLSearchParams(window.location.search).get("tab");
      v && !ul.has(v) && la(u);
    } catch {
    }
  }, [u]);
  const h = (v) => {
    m(v), la(v);
  }, y = (v, g) => t.createElement(
    "span",
    { style: { display: "inline-flex", alignItems: "center", gap: 6 } },
    g ? t.createElement(g, { style: { fontSize: 14 } }) : null,
    v
  );
  return t.createElement(
    "div",
    { style: { padding: 24 } },
    t.createElement(wn, {
      title: "工具·技能",
      subtitle: "管理当前专家可调用的引擎、工具、运行服务与专业技能",
      extra: t.createElement(
        l,
        { color: "blue" },
        `当前专家：${d}`
      )
    }),
    t.createElement(a, {
      activeKey: u,
      onChange: (v) => h(v),
      items: [
        {
          key: "engines",
          label: y("引擎", i),
          children: t.createElement(
            ys,
            {
              onNavigateToMcp: () => {
                w("mcp"), h("tools");
              },
              onNavigateToTools: (v) => {
                w(v || "mcp"), h("tools");
              },
              onNavigateToSkills: () => h("skills")
            }
          )
        },
        {
          key: "tools",
          label: y("工具", s),
          children: t.createElement(gs, {
            activeSubTab: p,
            onSubTabChange: w
          })
        },
        {
          key: "skills",
          label: y("技能", o),
          children: t.createElement(ps, {
            embedded: !0
          })
        }
      ]
    })
  );
}
const pl = ml;
function hs() {
  return C().React.createElement(pl, {
    initialTab: "tools"
  });
}
function Es() {
  return C().React.createElement(pl, {
    initialTab: "skills"
  });
}
const oa = {
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
function bs(e) {
  if (!e.env) return !1;
  const t = Object.entries(e.env);
  return t.length === 0 ? !1 : t.some(([, n]) => typeof n == "string" && n.length > 0);
}
const dn = "ugsci.market.githubSources", ia = "https://github.com/anthropics/skills/tree/main/skills", fl = "https://ugsci-awesome-tools.oss-cn-beijing.aliyuncs.com", vs = `${fl}/skills`;
function ws(e) {
  const t = e.replace(/^\/+/, "");
  return bn(`/plugins/oss-proxy?path=${encodeURIComponent(t)}`);
}
function mn(e) {
  const t = e.replace(/^\/+/, "");
  return tt(`/plugins/oss-proxy?path=${encodeURIComponent(t)}`);
}
async function ur(e) {
  const t = e.replace(/^\/+/, ""), n = await mn(t);
  if (!n.ok)
    throw new Error(`OSS fetch failed (${n.status}): ${t}`);
  return await n.json();
}
function kt(e) {
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
function Ss(e) {
  var a, l;
  const t = {};
  if (e.env && e.env.length > 0)
    for (const i of e.env)
      t[i] = `your-${i.toLowerCase().replace(/_/g, "-")}`;
  let n = "🔌";
  const r = (e.icon || "").toLowerCase();
  return r.includes("folder") ? n = "📁" : r.includes("git") ? n = "🌿" : r.includes("github") ? n = "🐙" : r.includes("database") || r.includes("postgres") || r.includes("sqlite") ? n = "🗄️" : r.includes("search") || r.includes("brave") ? n = "🔍" : r.includes("browser") || r.includes("puppeteer") ? n = "🎭" : r.includes("memory") || r.includes("brain") ? n = "🧠" : r.includes("file") || r.includes("fetch") ? n = "🌐" : r.includes("slack") ? n = "💬" : r.includes("google") ? n = "📁" : r.includes("notion") ? n = "📝" : r.includes("jupyter") ? n = "📊" : r.includes("science") || r.includes("flask") ? n = "🔬" : r.includes("book") || r.includes("arxiv") ? n = "📚" : r.includes("patent") && (n = "📜"), {
    id: e.id,
    name: e.name,
    emoji: n,
    iconUrl: e.icon_url ? ws(e.icon_url) : void 0,
    category: e.category ? kt(e.category) : "",
    description: e.description,
    transport: e.transport || "stdio",
    command: ((a = e.config) == null ? void 0 : a.command) || "",
    args: ((l = e.config) == null ? void 0 : l.args) || [],
    env: Object.keys(t).length > 0 ? t : void 0
  };
}
const gl = "ugsci.market.mcpSources", yl = "ugsci.market.expertSources";
function hl(e, t) {
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
function El(e, t) {
  try {
    localStorage.setItem(e, JSON.stringify(t));
  } catch {
  }
}
function xs() {
  return hl(gl, "mcp");
}
function tn(e) {
  El(gl, e);
}
function ks() {
  return hl(yl, "expert");
}
function nn(e) {
  El(yl, e);
}
function bl(e) {
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
    const l = decodeURIComponent(a[0]), i = decodeURIComponent(a[1]);
    let s = "main", o = "";
    return a.length >= 4 && (a[2] === "tree" || a[2] === "blob") ? (s = decodeURIComponent(a[3]), a.length > 4 && (o = a.slice(4).map(decodeURIComponent).join("/"))) : a.length > 2 && (o = a.slice(2).map(decodeURIComponent).join("/")), o = o.replace(/\/+$/, "").replace(/^\/+/, ""), {
      owner: l,
      repo: i,
      ref: s || "main",
      skillsPath: o,
      label: `${l}/${i}`,
      platform: r
    };
  } catch {
    return null;
  }
}
function vl(e, t, n, r = "github") {
  return r === "oss" ? `oss:${e}/${n || "/"}` : `${r}:${e}/${t}:${n || "/"}`;
}
function Cs(e) {
  try {
    const t = new URL(e.trim()), n = t.hostname.toLowerCase(), r = n.match(
      /^([a-z0-9][a-z0-9-]{1,61}[a-z0-9])\.oss-([a-z0-9-]+)\.aliyuncs\.com$/
    );
    if (!r) return null;
    const a = r[1], l = `${t.protocol}//${n}`, i = decodeURIComponent(t.pathname).replace(/^\/+/, "").replace(/\/+$/, "");
    return i ? {
      endpoint: l,
      prefix: i,
      label: "UGSci",
      platform: "oss"
    } : null;
  } catch {
    return null;
  }
}
function Ts() {
  try {
    const e = localStorage.getItem(dn);
    if (!e) {
      const r = [], a = bl(ia);
      return a && r.push({
        id: vl(
          a.owner,
          a.repo,
          a.skillsPath,
          a.platform
        ),
        url: ia,
        label: a.label,
        owner: a.owner,
        repo: a.repo,
        ref: a.ref,
        skillsPath: a.skillsPath,
        enabled: !1,
        platform: a.platform
      }), localStorage.setItem(dn, JSON.stringify(r)), r;
    }
    const t = JSON.parse(e);
    if (!Array.isArray(t)) return [];
    const n = t.filter(
      (r) => r && typeof r.id == "string" && (typeof r.owner == "string" || r.platform === "oss") && !(r.platform === "oss" && r.url === vs)
    ).map((r) => ({
      ...r,
      platform: r.platform || "github",
      owner: r.owner || "",
      repo: r.repo || "",
      ref: r.ref || "",
      skillsPath: r.skillsPath || ""
    }));
    return n.length !== t.length && localStorage.setItem(
      dn,
      JSON.stringify(n)
    ), n;
  } catch {
    return [];
  }
}
function rn(e) {
  try {
    localStorage.setItem(
      dn,
      JSON.stringify(e)
    );
  } catch {
  }
}
function _s(e) {
  const t = e.match(/^---\s*\n([\s\S]*?)\n---/);
  if (!t) return {};
  const n = t[1], r = {}, a = n.split(`
`);
  let l = "";
  for (const i of a) {
    const s = i.match(/^(\w[\w-]*)\s*:\s*(.*)$/);
    if (s) {
      l = s[1];
      let o = s[2].trim();
      (o.startsWith('"') && o.endsWith('"') || o.startsWith("'") && o.endsWith("'")) && (o = o.slice(1, -1)), l === "name" ? r.name = o : l === "description" ? r.description = o : l === "version" ? r.version = o : l === "author" && (r.author = o);
    }
  }
  return r;
}
async function Is(e) {
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
  const i = await l.json();
  if (!Array.isArray(i)) return [];
  const s = i.filter(
    (c) => c.type === "dir" && c.name
  );
  return await Promise.all(
    s.map(async (c) => {
      const d = e.skillsPath ? e.skillsPath + "/" : "", u = t ? `https://gitee.com/${e.owner}/${e.repo}/raw/${e.ref}/${d}${c.name}/SKILL.md` : `https://raw.githubusercontent.com/${e.owner}/${e.repo}/${e.ref}/${d}${c.name}/SKILL.md`, m = t ? `https://gitee.com/${e.owner}/${e.repo}/tree/${e.ref}/${d}${c.name}` : `https://github.com/${e.owner}/${e.repo}/tree/${e.ref}/${d}${c.name}`, p = {
        sourceId: e.id,
        sourceLabel: e.label,
        name: c.name,
        description: "",
        source_url: m,
        html_url: m,
        version: null,
        author: null
      };
      try {
        const w = {};
        t && e.accessToken && (w.Authorization = `token ${e.accessToken}`);
        const h = await fetch(u, {
          headers: w
        });
        if (!h.ok) return p;
        const y = await h.text(), f = _s(y);
        return {
          ...p,
          name: f.name || c.name,
          description: f.description || "",
          version: f.version || null,
          author: f.author || null
        };
      } catch {
        return p;
      }
    })
  );
}
async function As(e) {
  const t = Cs(e.url);
  if (!t)
    throw new Error(`Invalid OSS URL: ${e.url}`);
  const { endpoint: n, prefix: r } = t, a = r.split("/").map(encodeURIComponent).join("/"), l = await mn(
    `${a}/manifest.json`
  );
  if (!l.ok)
    throw new Error(
      `无法获取技能列表: manifest.json (${l.status})`
    );
  const i = await l.json(), s = [];
  if (i && i.tag_groups && typeof i.tag_groups == "object")
    for (const [d, u] of Object.entries(i.tag_groups))
      Array.isArray(u) && s.push({
        id: d,
        label: kt(d),
        tags: u
      });
  const o = [];
  function c(d, u) {
    for (const m of d) {
      if (m.type === "collection" && Array.isArray(m.children)) {
        c(m.children, m.name);
        continue;
      }
      const p = m.path || m.name || "";
      if (!p) continue;
      const w = p.split("/").map(encodeURIComponent).join("/"), h = `${n}/${a}/${w}`;
      let y = null;
      if (m.metadata) {
        const E = m.metadata.match(/version:\s*"?([\d.]+)"?/);
        E && (y = E[1]);
      }
      const f = u ? `${e.label}/${u}` : e.label;
      o.push({
        sourceId: e.id,
        sourceLabel: e.label,
        sourcePath: f,
        name: m.name || p.split("/").pop() || p,
        description: m.description || "",
        source_url: h,
        html_url: h,
        version: y,
        author: null,
        tag: m.tag || void 0,
        isOfficial: !0
      });
    }
  }
  if (Array.isArray(i) ? c(
    i.map(
      (d) => typeof d == "string" ? { name: d, path: d } : d
    )
  ) : i && Array.isArray(i.skills) && c(i.skills), o.length === 0)
    throw new Error(
      `manifest.json 中未找到技能。请检查 ${e.url}/manifest.json`
    );
  return { skills: o, categories: s };
}
async function $s() {
  const e = await ur("mcp/manifest.json"), t = [], n = {};
  if (e.tag_groups && typeof e.tag_groups == "object")
    for (const [a, l] of Object.entries(e.tag_groups))
      Array.isArray(l) && (n[a] = l, t.push({
        id: a,
        label: kt(a),
        tags: l
      }));
  return { servers: (e.servers || []).map((a) => {
    let l = "";
    const i = a.tags || [];
    for (const [s, o] of Object.entries(n))
      if (o.some((c) => i.includes(c))) {
        l = s;
        break;
      }
    return {
      id: a.id || a.name,
      name: a.name || a.id,
      description: a.description || "",
      tags: i,
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
async function zs() {
  const e = await ur("skills/manifest.json"), t = [], n = /* @__PURE__ */ new Set();
  function r(a, l) {
    for (const i of a) {
      if ((i == null ? void 0 : i.type) === "collection" && Array.isArray(i.children)) {
        r(i.children, i.name || l);
        continue;
      }
      const s = String((i == null ? void 0 : i.path) || (i == null ? void 0 : i.name) || "").trim();
      if (!s) continue;
      const o = s.split("/").map(encodeURIComponent).join("/"), c = `${fl}/skills/${o}`, d = typeof i.tag == "string" && i.tag.trim() ? i.tag.trim() : void 0;
      d && n.add(d);
      let u = null;
      if (typeof i.metadata == "string") {
        const m = i.metadata.match(/version:\s*"?([\d.]+)"?/);
        m && (u = m[1]);
      }
      t.push({
        sourceId: "oss:ugsci-official",
        sourceLabel: "UGSci",
        sourcePath: l ? `UGSci/${l}` : "UGSci",
        name: i.name || s.split("/").pop() || s,
        description: i.description || "",
        source_url: c,
        html_url: c,
        version: u,
        author: null,
        tag: d,
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
async function Ps() {
  const e = await ur("agents/manifest.json"), t = [], n = {};
  if (e.tag_groups && typeof e.tag_groups == "object")
    for (const [a, l] of Object.entries(e.tag_groups))
      Array.isArray(l) && (n[a] = l, t.push({
        id: a,
        label: kt(a),
        tags: l
      }));
  return { agents: (e.agents || []).map((a) => {
    let l = "";
    const i = a.tags || [];
    for (const [s, o] of Object.entries(n))
      if (o.some((c) => i.includes(c))) {
        l = s;
        break;
      }
    return {
      id: a.id || a.name,
      name: a.name || a.id,
      description: a.description || "",
      path: a.path || "",
      tags: i,
      config: a.config,
      instructions: a.instructions,
      skills_manifest: a.skills_manifest,
      drivers: a.drivers,
      category: l
    };
  }), categories: t };
}
async function Rs(e) {
  const t = e.filter((i) => i.enabled), n = await Promise.all(
    t.map(async (i) => {
      try {
        if (i.platform === "oss") {
          const { skills: s, categories: o } = await As(i);
          return { skills: s, categories: o, error: null, label: i.label };
        } else
          return { skills: await Is(i), categories: [], error: null, label: i.label };
      } catch (s) {
        return {
          skills: [],
          categories: [],
          error: s.message || String(s),
          label: i.label
        };
      }
    })
  ), r = [], a = [], l = [];
  for (const i of n)
    r.push(...i.skills), a.push(...i.categories), i.error && l.push({ label: i.label, message: i.error });
  return { skills: r, errors: l, categories: a };
}
function Os({
  open: e,
  onClose: t,
  sources: n,
  onChange: r
}) {
  const a = C().React, { useState: l } = a, {
    Modal: i,
    Input: s,
    Button: o,
    List: c,
    Tag: d,
    Switch: u,
    Typography: m,
    Tooltip: p,
    message: w
  } = C().antd, {
    PlusOutlined: h,
    DeleteOutlined: y,
    LinkOutlined: f,
    GithubOutlined: E
  } = C().antdIcons || {}, { Text: v } = m, [g, x] = l(""), [O, K] = l(""), z = () => {
    const N = g.trim();
    if (!N) return;
    const T = bl(N);
    if (!T) {
      w.error("无效的仓库 URL，请输入类似 https://github.com/owner/repo/tree/main/skills 或 https://gitee.com/owner/repo/tree/master/skills 的链接");
      return;
    }
    const k = vl(T.owner, T.repo, T.skillsPath, T.platform);
    if (n.some((M) => M.id === k)) {
      w.warning("该源已存在");
      return;
    }
    const $ = {
      id: k,
      url: N,
      label: T.label,
      owner: T.owner,
      repo: T.repo,
      ref: T.ref,
      skillsPath: T.skillsPath,
      enabled: !0,
      platform: T.platform,
      accessToken: O.trim() || void 0
    }, _ = [...n, $];
    rn(_), r(_), x(""), K(""), w.success(`已添加源: ${T.label}`);
  }, R = (N, T) => {
    const k = n.map(
      ($) => $.id === N ? { ...$, enabled: T } : $
    );
    rn(k), r(k);
  }, X = (N, T) => {
    const k = n.map(
      ($) => $.id === N ? { ...$, accessToken: T.trim() || void 0 } : $
    );
    rn(k), r(k);
  }, W = (N) => {
    const T = n.filter((k) => k.id !== N);
    rn(T), r(T), w.success("已移除源");
  };
  return a.createElement(
    i,
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
        v,
        { type: "secondary", style: { fontSize: 12, display: "block", marginBottom: 8 } },
        "添加 GitHub 或 Gitee 仓库作为技能源，系统将从该仓库的指定目录获取技能列表。支持格式："
      ),
      a.createElement(
        "div",
        { style: { display: "flex", gap: 8, alignItems: "center" } },
        a.createElement(s, {
          placeholder: "https://github.com/owner/repo/tree/main/skills 或 https://gitee.com/owner/repo/tree/master/skills",
          value: g,
          onChange: (N) => x(N.target.value),
          onPressEnter: z,
          prefix: f ? a.createElement(f) : void 0,
          style: { flex: 1 }
        }),
        a.createElement(
          o,
          {
            type: "primary",
            icon: h ? a.createElement(h) : void 0,
            onClick: z
          },
          "添加"
        )
      ),
      // Gitee token input (shown when URL looks like a Gitee link)
      g.trim() && g.trim().toLowerCase().includes("gitee.com") ? a.createElement(
        "div",
        { style: { marginTop: 8, display: "flex", gap: 8, alignItems: "center" } },
        a.createElement(
          v,
          { type: "secondary", style: { fontSize: 12, whiteSpace: "nowrap" } },
          "Gitee Token:"
        ),
        a.createElement(s.Password, {
          placeholder: "私有仓库请填写 Gitee 私人令牌（可选）",
          value: O,
          onChange: (N) => K(N.target.value),
          style: { flex: 1 }
        })
      ) : null
    ),
    a.createElement(
      "div",
      { style: { marginBottom: 8, display: "flex", alignItems: "center", justifyContent: "space-between" } },
      a.createElement(v, { strong: !0 }, `已配置源 (${n.length})`)
    ),
    a.createElement(c, {
      size: "small",
      bordered: !0,
      dataSource: n,
      renderItem: (N) => a.createElement(
        c.Item,
        {
          actions: [
            a.createElement(
              p,
              { title: N.enabled ? "点击禁用" : "点击启用" },
              a.createElement(u, {
                size: "small",
                checked: N.enabled,
                onChange: (T) => R(N.id, T)
              })
            ),
            a.createElement(
              p,
              { title: "移除此源" },
              a.createElement(
                o,
                {
                  size: "small",
                  type: "text",
                  danger: !0,
                  icon: y ? a.createElement(y) : void 0,
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
              d,
              { color: N.platform === "gitee" ? "orange" : N.platform === "oss" ? "green" : "blue", style: { fontSize: 11 } },
              N.platform === "gitee" ? "Gitee" : N.platform === "oss" ? "OSS" : "GitHub"
            ),
            a.createElement(
              d,
              { style: { fontSize: 11 } },
              N.label
            ),
            N.skillsPath ? a.createElement(
              v,
              { type: "secondary", style: { fontSize: 11 } },
              `/${N.skillsPath}`
            ) : null,
            N.platform !== "oss" ? a.createElement(
              v,
              { type: "secondary", style: { fontSize: 11 } },
              `@${N.ref}`
            ) : null
          ),
          a.createElement(
            v,
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
              v,
              { type: "secondary", style: { fontSize: 11, whiteSpace: "nowrap" } },
              "Token:"
            ),
            a.createElement(s.Password, {
              size: "small",
              placeholder: "Gitee 私人令牌（可选，用于私有仓库）",
              value: N.accessToken || "",
              onChange: (T) => X(N.id, T.target.value),
              style: { flex: 1 }
            })
          ) : null
        )
      )
    })
  );
}
function sa({
  open: e,
  onClose: t,
  sources: n,
  onChange: r,
  type: a
}) {
  const l = C().React, { useState: i } = l, {
    Modal: s,
    Input: o,
    Button: c,
    List: d,
    Tag: u,
    Switch: m,
    Typography: p,
    Tooltip: w,
    message: h
  } = C().antd, {
    PlusOutlined: y,
    DeleteOutlined: f,
    LinkOutlined: E,
    ApiOutlined: v,
    UserOutlined: g,
    ImportOutlined: x,
    ExportOutlined: O,
    CopyOutlined: K
  } = C().antdIcons || {}, { Text: z } = p, [R, X] = i(""), [W, N] = i(""), [T, k] = i(""), [$, _] = i(!1), M = a === "mcp" ? "MCP" : "专家模板", G = a === "mcp" ? v ? l.createElement(v, { style: { fontSize: 18 } }) : null : g ? l.createElement(g, { style: { fontSize: 18 } }) : null, q = () => {
    const D = R.trim(), P = W.trim();
    if (!D) return;
    const oe = P || D.slice(0, 40), re = `${a}:${D}`;
    if (n.some((U) => U.id === re)) {
      h.warning("该源已存在");
      return;
    }
    const Y = {
      id: re,
      label: oe,
      url: D,
      enabled: !0,
      type: a
    }, ue = [...n, Y];
    a === "mcp" ? tn(ue) : nn(ue), r(ue), X(""), N(""), h.success(`已添加${M}源: ${oe}`);
  }, F = (D, P) => {
    const oe = n.map(
      (re) => re.id === D ? { ...re, enabled: P } : re
    );
    a === "mcp" ? tn(oe) : nn(oe), r(oe);
  }, I = (D) => {
    const P = n.filter((oe) => oe.id !== D);
    a === "mcp" ? tn(P) : nn(P), r(P), h.success("已移除源");
  }, ne = () => {
    const D = JSON.stringify(
      { type: a, sources: n },
      null,
      2
    );
    try {
      navigator.clipboard.writeText(D), h.success(`${M}源已复制到剪贴板（${n.length} 个源）`);
    } catch {
      const P = document.createElement("textarea");
      P.value = D, document.body.appendChild(P), P.select(), document.execCommand("copy"), document.body.removeChild(P), h.success(`${M}源已复制到剪贴板（${n.length} 个源）`);
    }
  }, le = () => {
    const D = T.trim();
    if (!D) {
      h.warning("请粘贴 JSON 内容");
      return;
    }
    try {
      const P = JSON.parse(D);
      let oe = [];
      if (Array.isArray(P))
        oe = P;
      else if (P && Array.isArray(P.sources))
        oe = P.sources;
      else if (P && typeof P == "object")
        oe = [P];
      else
        throw new Error("Invalid format");
      const re = oe.filter(
        (ie) => ie && typeof ie.url == "string" && typeof ie.label == "string"
      );
      if (re.length === 0) {
        h.error("未找到有效的源数据");
        return;
      }
      const Y = new Set(n.map((ie) => ie.id)), ue = [];
      for (const ie of re) {
        const me = ie.id || `${a}:${ie.url}`;
        Y.has(me) || ue.push({
          id: me,
          label: ie.label,
          url: ie.url,
          enabled: ie.enabled !== !1,
          type: a
        });
      }
      if (ue.length === 0) {
        h.info("所有源均已存在，无新增");
        return;
      }
      const U = [...n, ...ue];
      a === "mcp" ? tn(U) : nn(U), r(U), k(""), _(!1), h.success(`成功导入 ${ue.length} 个${M}源`);
    } catch (P) {
      h.error(`JSON 解析失败: ${P.message || "格式错误"}`);
    }
  };
  return l.createElement(
    s,
    {
      open: e,
      onCancel: t,
      title: l.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 8 } },
        G,
        l.createElement("span", null, `配置${M}源`)
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
              icon: O ? l.createElement(O) : void 0,
              onClick: ne,
              disabled: n.length === 0,
              size: "small"
            },
            "导出到剪贴板"
          ),
          l.createElement(
            c,
            {
              icon: x ? l.createElement(x) : void 0,
              onClick: () => _(!$),
              size: "small"
            },
            $ ? "隐藏导入" : "导入JSON"
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
      z,
      { type: "secondary", style: { fontSize: 12, display: "block", marginBottom: 12 } },
      `配置${M}源地址，支持从远程仓库或团队共享的 JSON 导入${M}配置。`
    ),
    // Import section (collapsible)
    $ ? l.createElement(
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
        z,
        { strong: !0, style: { fontSize: 12, display: "block", marginBottom: 8 } },
        `粘贴${M}源 JSON（支持从导出的剪贴板内容粘贴）`
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
        value: T,
        onChange: (D) => k(D.target.value),
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
            onClick: le
          },
          "导入"
        ),
        l.createElement(
          c,
          {
            size: "small",
            onClick: () => k("")
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
        value: W,
        onChange: (D) => N(D.target.value),
        style: { width: 200 }
      }),
      l.createElement(o, {
        placeholder: a === "mcp" ? "https://raw.githubusercontent.com/team/mcp-registry/main/mcp.json" : "https://raw.githubusercontent.com/team/expert-registry/main/experts.json",
        value: R,
        onChange: (D) => X(D.target.value),
        onPressEnter: q,
        prefix: E ? l.createElement(E) : void 0,
        style: { flex: 1 }
      }),
      l.createElement(
        c,
        {
          type: "primary",
          icon: y ? l.createElement(y) : void 0,
          onClick: q
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
        z,
        { strong: !0 },
        `已配置源 (${n.length})`
      )
    ),
    l.createElement(d, {
      size: "small",
      bordered: !0,
      dataSource: n,
      renderItem: (D) => l.createElement(
        d.Item,
        {
          actions: [
            l.createElement(
              w,
              { title: D.enabled ? "点击禁用" : "点击启用" },
              l.createElement(m, {
                size: "small",
                checked: D.enabled,
                onChange: (P) => F(D.id, P)
              })
            ),
            l.createElement(
              w,
              { title: "移除此源" },
              l.createElement(
                c,
                {
                  size: "small",
                  type: "text",
                  danger: !0,
                  icon: f ? l.createElement(f) : void 0,
                  onClick: () => I(D.id)
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
              u,
              {
                color: a === "mcp" ? "purple" : "blue",
                style: { fontSize: 11 }
              },
              D.label
            ),
            D.enabled ? null : l.createElement(
              u,
              { style: { fontSize: 10 } },
              "已禁用"
            )
          ),
          l.createElement(
            z,
            {
              type: "secondary",
              style: { fontSize: 11, wordBreak: "break-all" }
            },
            D.url
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
async function Ms() {
  return de("/market/providers");
}
async function Ls(e) {
  return de(
    `/market/categories?lang=${encodeURIComponent(e)}`
  );
}
async function Bs(e, t, n, r, a) {
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
function ca(e) {
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
async function da(e, t) {
  const n = { bundle_url: e };
  return t && (n.access_token = t), de("/skills/pool/import", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(n)
  });
}
function Us({ embedded: e = !1 } = {}) {
  const t = C().React, { useState: n, useEffect: r, useCallback: a, useMemo: l, useRef: i } = t, {
    Spin: s,
    Empty: o,
    Input: c,
    Button: d,
    message: u,
    Row: m,
    Col: p,
    Card: w,
    Tag: h,
    Tooltip: y,
    Typography: f,
    Select: E,
    Drawer: v,
    Descriptions: g,
    Tabs: x,
    Badge: O,
    Progress: K,
    Modal: z,
    Alert: R
  } = C().antd, {
    ReloadOutlined: X,
    SearchOutlined: W,
    DownloadOutlined: N,
    AppstoreOutlined: T,
    ShopOutlined: k,
    CheckCircleOutlined: $,
    LoadingOutlined: _,
    UserOutlined: M,
    UserAddOutlined: G,
    SettingOutlined: q,
    GithubOutlined: F,
    ApiOutlined: I
  } = C().antdIcons || {}, { Text: ne, Paragraph: le, Title: D } = f, [P, oe] = n("skills"), [re, Y] = n([]), [ue, U] = n([]), [ie, me] = n([]), [A, S] = n(""), [V, pe] = n(""), [Se, Le] = n(!1), [ve, ce] = n(!1), [xe, Ie] = n(
    {}
  ), [H, L] = n(null), [se, he] = n({}), [j, Ee] = n([]), [te, ge] = n(""), [we, Re] = n(""), [B, ye] = n(""), [_e, Fe] = n({}), [Ae, Qe] = n(""), [et, Ge] = n(/* @__PURE__ */ new Set()), [Oe, ae] = n(null), [$e, Me] = n({}), [je, Be] = n([]), [Pe, ke] = n([]), [ct, dt] = n([]), [Jt, rt] = n(""), [wr, Kt] = n(!1), [no, Sr] = n(!1), [ro, xr] = n([]), [ao, kr] = n(!1), [lo, Cr] = n([]), [oo, Tr] = n(!1), [_r, Ir] = n([]), [Ar, $r] = n([]), [zr, Pr] = n(!1), [ft, Rr] = n(""), [Or, Mr] = n([]), [Lr, Br] = n([]), [Ur, jr] = n(!1), [gt, Nr] = n(""), [In, Dr] = n(!1), [Je, Xt] = n(null), [_t, io] = n([]), It = i(null);
  r(() => {
    Promise.all([
      Ms().catch(() => []),
      Ls("zh").catch(() => []),
      Sn().catch(() => [])
    ]).then(([b, J, Q]) => {
      Y(b), U(J), Ee(Q), Q.length > 0 && (ge(Q[0].id), Qe(Q[0].id));
    });
  }, []);
  const Yt = a(async (b) => {
    const J = b ?? Ts();
    if (Be(b || J), J.filter((fe) => fe.enabled).length === 0) {
      ke([]);
      return;
    }
    Kt(!0);
    try {
      const { skills: fe, errors: Ce, categories: Ne } = await Rs(J);
      if (ke(fe), io(Ne), Ce.length > 0) {
        for (const ze of Ce)
          console.warn(`[ugsci] GitHub source '${ze.label}' error: ${ze.message}`);
        u.warning(
          `部分源加载失败: ${Ce.map((ze) => ze.label).join(", ")}`
        );
      }
    } catch (fe) {
      u.error(fe.message || "加载技能源失败"), ke([]);
    } finally {
      Kt(!1);
    }
  }, []), An = a(async () => {
    var fe, Ce, Ne;
    Pr(!0), jr(!0), Kt(!0);
    const [b, J, Q] = await Promise.allSettled([
      $s(),
      Ps(),
      zs()
    ]);
    if (b.status === "fulfilled" ? (Ir(b.value.servers), $r(b.value.categories)) : (console.warn(`[ugsci] MCP manifest error: ${((fe = b.reason) == null ? void 0 : fe.message) || b.reason}`), Ir([]), $r([])), Pr(!1), J.status === "fulfilled" ? (Mr(J.value.agents), Br(J.value.categories)) : (console.warn(`[ugsci] Agents manifest error: ${((Ce = J.reason) == null ? void 0 : Ce.message) || J.reason}`), Mr([]), Br([])), jr(!1), Q.status === "fulfilled")
      dt(Q.value.skills), rt("");
    else {
      const ze = ((Ne = Q.reason) == null ? void 0 : Ne.message) || String(Q.reason);
      console.warn(`[ugsci] Skills manifest error: ${ze}`), dt([]), rt(ze);
    }
    Kt(!1);
  }, []);
  r(() => {
    Yt(), An(), xr(xs()), Cr(ks());
  }, [Yt, An]);
  const Qt = a(
    async (b, J, Q) => {
      Le(!0);
      try {
        const fe = await Bs(
          b,
          Q,
          20,
          "zh",
          J || void 0
        );
        Q === void 0 || Object.keys(Q).length === 0 ? me(fe.results) : me((ze) => [...ze, ...fe.results]);
        const Ce = Object.values(fe.by_provider || {}).some(
          (ze) => ze.has_more
        );
        ce(Ce);
        const Ne = {};
        for (const [ze, at] of Object.entries(fe.by_provider || {}))
          Ne[ze] = (Q[ze] || 1) + 1;
        if (Ie(Ne), fe.errors.length > 0)
          for (const ze of fe.errors)
            console.warn(
              `[ugsci] Market provider '${ze.provider}' error: ${ze.message}`
            );
      } catch (fe) {
        u.error(fe.message || "搜索市场失败"), me([]);
      } finally {
        Le(!1);
      }
    },
    []
  );
  r(() => (It.current && clearTimeout(It.current), It.current = setTimeout(() => {
    Qt(A, V, {});
  }, 400), () => {
    It.current && clearTimeout(It.current);
  }), [A, V, Qt]);
  const so = () => {
    Qt(A, V, xe);
  }, Fr = async (b) => {
    const J = `${b.source}:${b.slug}`;
    try {
      he((fe) => ({ ...fe, [J]: "installing" }));
      const Q = await da(b.source_url);
      Q.installed && u.success(
        `技能「${Q.name || b.name}」已安装到技能池，可在技能中心查看`
      ), he((fe) => {
        const Ce = { ...fe };
        return delete Ce[J], Ce;
      });
    } catch (Q) {
      u.error(ca(Q) || "安装技能失败"), he((fe) => {
        const Ce = { ...fe };
        return delete Ce[J], Ce;
      });
    }
  }, co = (b) => {
    window.history.pushState({}, "", b), window.dispatchEvent(new PopStateEvent("popstate"));
  }, uo = async (b) => {
    const J = `github:${b.sourceId}:${b.name}`, Q = je.find((Ce) => Ce.id === b.sourceId), fe = (Q == null ? void 0 : Q.accessToken) || void 0;
    try {
      he((Ne) => ({ ...Ne, [J]: "installing" }));
      const Ce = await da(b.source_url, fe);
      Ce.installed && u.success(
        `技能「${Ce.name || b.name}」已安装到技能池，可在技能中心查看`
      ), he((Ne) => {
        const ze = { ...Ne };
        return delete ze[J], ze;
      });
    } catch (Ce) {
      u.error(ca(Ce) || "安装技能失败"), he((Ne) => {
        const ze = { ...Ne };
        return delete ze[J], ze;
      });
    }
  }, ut = l(() => {
    const b = [], J = /* @__PURE__ */ new Set();
    for (const Q of [...ct, ...Pe]) {
      const fe = Q.source_url || `${Q.sourceLabel}:${Q.name}`;
      J.has(fe) || (J.add(fe), b.push(Q));
    }
    return b;
  }, [ct, Pe]), Gr = l(() => {
    const b = [], J = /* @__PURE__ */ new Set();
    if (_t.length > 0)
      for (const Q of _t)
        J.has(Q.id) || (J.add(Q.id), b.push(Q));
    for (const Q of ut)
      Q.tag && !J.has(Q.tag) && (J.add(Q.tag), b.push({ id: Q.tag, label: Q.tag }));
    for (const Q of ut)
      !Q.isOfficial && Q.sourceLabel && !J.has(Q.sourceLabel) && (J.add(Q.sourceLabel), b.push({ id: Q.sourceLabel, label: Q.sourceLabel }));
    return b;
  }, [ut, _t]), $n = l(() => {
    let b = ut;
    if (V) {
      const J = _t.find((Q) => Q.id === V);
      J && J.tags ? b = b.filter(
        (Q) => Q.tag && J.tags.includes(Q.tag) || Q.sourceLabel === V
      ) : b = b.filter(
        (Q) => Q.tag === V || Q.sourceLabel === V
      );
    }
    if (A.trim()) {
      const J = A.toLowerCase();
      b = b.filter(
        (Q) => {
          var fe;
          return Q.name.toLowerCase().includes(J) || ((fe = Q.description) == null ? void 0 : fe.toLowerCase().includes(J));
        }
      );
    }
    return b;
  }, [ut, A, V, _t]), Hr = re.filter((b) => b.available), yt = l(() => V ? ie.filter((b) => {
    const J = Hr.find((Q) => Q.key === b.source);
    return (J == null ? void 0 : J.label) === V;
  }) : ie, [ie, V, Hr]), mo = t.createElement(
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
        prefix: W ? t.createElement(W) : void 0,
        value: A,
        onChange: (b) => S(b.target.value),
        allowClear: !0,
        style: { flex: 1, minWidth: 200, maxWidth: 400 }
      }),
      // Pool install info
      t.createElement(
        ne,
        { type: "secondary", style: { fontSize: 12 } },
        "安装后进入技能池"
      ),
      // Configure skill source button
      t.createElement(
        d,
        {
          icon: F ? t.createElement(F) : void 0,
          onClick: () => Sr(!0),
          size: "small"
        },
        "配置技能源"
      )
    ),
    // Dynamic category filter tags (from OSS manifest tags + imported sources)
    Jt && ut.length === 0 ? t.createElement(R, {
      type: "warning",
      showIcon: !0,
      message: "UGSci 官方 OSS 技能库加载失败",
      description: "请检查网络或后端 OSS 代理服务，然后点击右上角“刷新”重试。",
      style: { marginBottom: 12 }
    }) : null,
    Gr.length > 0 ? t.createElement(
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
        ne,
        { type: "secondary", style: { fontSize: 12, marginRight: 4 } },
        "分类:"
      ),
      t.createElement(
        h,
        {
          style: {
            fontSize: 11,
            cursor: "pointer",
            borderRadius: 12
          },
          color: V === "" ? "blue" : void 0,
          onClick: () => pe("")
        },
        "全部"
      ),
      ...Gr.map((b) => {
        const J = Pe.some(
          (Q) => !Q.isOfficial && Q.sourceLabel === b.id
        );
        return t.createElement(
          h,
          {
            key: b.id,
            style: {
              fontSize: 11,
              cursor: "pointer",
              borderRadius: 12
            },
            color: V === b.id ? J ? "blue" : "geekblue" : void 0,
            icon: J && F ? t.createElement(F) : void 0,
            onClick: () => pe(
              V === b.id ? "" : b.id
            )
          },
          b.label
        );
      })
    ) : null,
    // GitHub skills section
    wr && ut.length === 0 ? t.createElement(
      "div",
      { style: { textAlign: "center", padding: 40, marginBottom: 16 } },
      t.createElement(s, { size: "large" }, t.createElement("div", { style: { minHeight: 60, display: "flex", alignItems: "center", justifyContent: "center" } }, "正在加载技能..."))
    ) : $n.length > 0 ? t.createElement(
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
        F ? t.createElement(F, {
          style: { fontSize: 14, color: "#1677ff" }
        }) : null,
        t.createElement(
          ne,
          { strong: !0, style: { fontSize: 13 } },
          `技能市场 (${$n.length})`
        )
      ),
      t.createElement(
        m,
        { gutter: [12, 12] },
        ...$n.map((b) => {
          const J = `github:${b.sourceId}:${b.name}`, Q = se[J];
          return t.createElement(
            p,
            { key: J, xs: 24, sm: 12, md: 8, lg: 6 },
            t.createElement(
              w,
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
                F ? t.createElement(F, {
                  style: { fontSize: 18, color: "var(--ant-color-text-secondary, #57606a)" }
                }) : t.createElement(
                  "span",
                  { style: { fontSize: 18 } },
                  "📦"
                ),
                t.createElement(
                  y,
                  { title: b.name },
                  t.createElement(
                    ne,
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
                    b.name
                  )
                )
              ),
              t.createElement(
                le,
                {
                  type: "secondary",
                  style: { fontSize: 11, margin: 0, lineHeight: 1.4 },
                  ellipsis: { rows: 2 }
                },
                b.description || "暂无描述"
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
                  b.sourcePath || b.sourceLabel ? t.createElement(
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
                    I ? t.createElement(I, { style: { fontSize: 10 } }) : null,
                    b.sourcePath || b.sourceLabel
                  ) : null,
                  // Show tag as category badge
                  b.tag ? t.createElement(
                    h,
                    { color: "geekblue", style: { fontSize: 10 } },
                    b.tag
                  ) : null,
                  b.version ? t.createElement(
                    h,
                    { style: { fontSize: 10 } },
                    `v${b.version}`
                  ) : null
                ),
                Q ? t.createElement(
                  d,
                  {
                    size: "small",
                    disabled: !0,
                    icon: _ ? t.createElement(_) : void 0
                  },
                  "安装中"
                ) : t.createElement(
                  d,
                  {
                    type: "primary",
                    size: "small",
                    icon: N ? t.createElement(N) : void 0,
                    onClick: () => uo(b)
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
    yt.length > 0 || Se ? t.createElement(
      "div",
      {
        style: {
          marginBottom: 10,
          display: "flex",
          alignItems: "center",
          gap: 6
        }
      },
      k ? t.createElement(k, {
        style: { fontSize: 14, color: "#1677ff" }
      }) : null,
      t.createElement(
        ne,
        { strong: !0, style: { fontSize: 13 } },
        `技能市场${yt.length > 0 ? ` (${yt.length})` : ""}`
      )
    ) : null,
    // Results grid
    Se && yt.length === 0 ? t.createElement(
      "div",
      { style: { textAlign: "center", padding: 60 } },
      t.createElement(s, { size: "large" })
    ) : yt.length === 0 ? t.createElement(o, {
      description: A ? `未找到匹配「${A}」的技能` : "输入关键词搜索技能市场",
      image: o.PRESENTED_IMAGE_SIMPLE
    }) : t.createElement(
      m,
      { gutter: [12, 12] },
      ...yt.map((b) => {
        const J = `${b.source}:${b.slug}`, Q = se[J];
        return t.createElement(
          p,
          { key: J, xs: 24, sm: 12, md: 8, lg: 6 },
          t.createElement(
            w,
            {
              hoverable: !0,
              size: "small",
              style: { height: "100%", cursor: "pointer" },
              onClick: () => L(b)
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
              b.icon_url ? t.createElement("img", {
                src: b.icon_url,
                alt: b.name,
                style: { width: 24, height: 24, borderRadius: 4 }
              }) : t.createElement(
                "span",
                { style: { fontSize: 18 } },
                "📦"
              ),
              t.createElement(
                y,
                { title: b.name },
                t.createElement(
                  ne,
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
                  b.name
                )
              )
            ),
            t.createElement(
              le,
              {
                type: "secondary",
                style: { fontSize: 11, margin: 0, lineHeight: 1.4 },
                ellipsis: { rows: 2 }
              },
              b.description || "暂无描述"
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
                  h,
                  { color: "geekblue", style: { fontSize: 10 } },
                  b.source
                ),
                b.version ? t.createElement(
                  h,
                  { style: { fontSize: 10 } },
                  `v${b.version}`
                ) : null
              ),
              Q ? t.createElement(
                d,
                {
                  size: "small",
                  disabled: !0,
                  icon: _ ? t.createElement(_) : void 0
                },
                "安装中"
              ) : t.createElement(
                d,
                {
                  type: "primary",
                  size: "small",
                  icon: N ? t.createElement(N) : void 0,
                  onClick: (fe) => {
                    fe.stopPropagation(), Fr(b);
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
    ve && !Se ? t.createElement(
      "div",
      { style: { textAlign: "center", marginTop: 16 } },
      t.createElement(
        d,
        { onClick: so, loading: Se },
        "加载更多"
      )
    ) : null,
    // Detail Drawer
    H ? t.createElement(
      v,
      {
        title: t.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 8 } },
          H.icon_url ? t.createElement("img", {
            src: H.icon_url,
            alt: H.name,
            style: { width: 28, height: 28, borderRadius: 4 }
          }) : t.createElement(
            "span",
            { style: { fontSize: 20 } },
            "📦"
          ),
          t.createElement("span", null, H.name)
        ),
        open: !0,
        onClose: () => L(null),
        width: 480,
        extra: t.createElement(
          d,
          {
            type: "primary",
            icon: N ? t.createElement(N) : void 0,
            onClick: () => {
              Fr(H);
            }
          },
          "安装到技能池"
        )
      },
      t.createElement(
        g,
        { column: 1, bordered: !0, size: "small" },
        t.createElement(
          g.Item,
          { label: "来源" },
          H.source
        ),
        t.createElement(
          g.Item,
          { label: "描述" },
          H.description || "-"
        ),
        H.version ? t.createElement(
          g.Item,
          { label: "版本" },
          H.version
        ) : null,
        H.author ? t.createElement(
          g.Item,
          { label: "作者" },
          H.author
        ) : null,
        t.createElement(
          g.Item,
          { label: "来源链接" },
          t.createElement(
            "a",
            { href: H.source_url, target: "_blank" },
            H.source_url
          )
        )
      ),
      H.stats ? t.createElement(
        "div",
        { style: { marginTop: 16 } },
        t.createElement(
          ne,
          {
            strong: !0,
            style: { display: "block", marginBottom: 8 }
          },
          "统计"
        ),
        t.createElement(
          "div",
          { style: { display: "flex", gap: 12, flexWrap: "wrap" } },
          ...Object.entries(H.stats).map(
            ([b, J]) => t.createElement(
              "div",
              { key: b, style: { textAlign: "center" } },
              t.createElement(
                "div",
                {
                  style: {
                    fontSize: 18,
                    fontWeight: 600,
                    color: "#1677ff"
                  }
                },
                String(J)
              ),
              t.createElement(
                ne,
                { type: "secondary", style: { fontSize: 11 } },
                b
              )
            )
          )
        )
      ) : null
    ) : null
  ), zn = l(() => {
    let b = Or;
    if (gt && (b = b.filter((J) => J.category === gt)), we.trim()) {
      const J = we.toLowerCase();
      b = b.filter(
        (Q) => Q.name.toLowerCase().includes(J) || Q.description.toLowerCase().includes(J) || Q.tags.some((fe) => fe.toLowerCase().includes(J))
      );
    }
    return b;
  }, [Or, we, gt]), po = async (b) => {
    if (!In) {
      Dr(!0);
      try {
        let J = b.description;
        if (b.instructions)
          try {
            const Ce = b.instructions.replace(/^\/+/, ""), Ne = await mn(Ce);
            Ne.ok && (J = await Ne.text());
          } catch {
          }
        let Q = [];
        if (b.skills_manifest)
          try {
            const Ce = b.skills_manifest.replace(/^\/+/, ""), Ne = await mn(Ce);
            if (Ne.ok) {
              const ze = await Ne.json();
              Array.isArray(ze) ? Q = ze.map((at) => typeof at == "string" ? at : at.name).filter(Boolean) : ze.skills && (Q = ze.skills.map((at) => typeof at == "string" ? at : at.name).filter(Boolean));
            }
          } catch {
          }
        const fe = await de("/agents", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: b.name,
            description: b.description,
            skill_names: Q
          })
        });
        await vt(fe.id, "AGENTS.md", J), u.success(`专家「${b.name}」创建成功，已跳转至专家`), co("/ugsci-experts");
      } catch (J) {
        u.error(J.message || "创建专家失败");
      } finally {
        Dr(!1);
      }
    }
  }, Wr = a(async (b) => {
    if (b)
      try {
        const J = await ir(b);
        Ge(new Set(J.map((Q) => Q.key)));
      } catch {
        Ge(/* @__PURE__ */ new Set());
      }
  }, []);
  r(() => {
    Ae && Wr(Ae);
  }, [Ae, Wr]);
  const fo = async (b) => {
    if (!Ae) {
      u.warning("请先选择目标专家");
      return;
    }
    if (bs(b)) {
      const J = Object.entries(b.env), Q = {};
      for (const [fe] of J)
        Q[fe] = "";
      Me(Q), ae(b);
      return;
    }
    await qr(b, b.env || {});
  }, qr = async (b, J) => {
    Fe((Q) => ({ ...Q, [b.id]: !0 }));
    try {
      const Q = b.id;
      await sr(Ae, {
        client_key: Q,
        client: {
          name: b.name,
          description: b.description,
          enabled: !0,
          transport: b.transport,
          url: b.url || "",
          command: b.command || "",
          args: b.args || [],
          env: J,
          cwd: b.cwd || "",
          headers: b.headers || {}
        }
      }), u.success(`MCP「${b.name}」已添加到当前专家`), Ge((fe) => new Set(fe).add(Q));
    } catch (Q) {
      u.error(Q.message || `添加 MCP「${b.name}」失败`);
    } finally {
      Fe((Q) => ({ ...Q, [b.id]: !1 }));
    }
  }, go = async () => {
    if (!Oe) return;
    const b = [];
    for (const [Q, fe] of Object.entries($e))
      if (!fe || !fe.trim()) {
        const Ce = oa[Q];
        b.push((Ce == null ? void 0 : Ce.label) || Q);
      }
    if (b.length > 0) {
      u.warning(`请填写以下配置项: ${b.join(", ")}`);
      return;
    }
    const J = Oe;
    ae(null), Me({}), await qr(J, { ...$e });
  }, Pn = l(() => {
    let b = _r;
    if (ft && (b = b.filter((J) => J.category === ft)), B.trim()) {
      const J = B.toLowerCase();
      b = b.filter(
        (Q) => Q.name.toLowerCase().includes(J) || Q.description.toLowerCase().includes(J) || Q.tags.some((fe) => fe.toLowerCase().includes(J))
      );
    }
    return b.map(Ss);
  }, [_r, B, ft]), yo = t.createElement(
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
        prefix: W ? t.createElement(W) : void 0,
        value: B,
        onChange: (b) => ye(b.target.value),
        allowClear: !0,
        style: { maxWidth: 300 }
      }),
      t.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        t.createElement(
          ne,
          { type: "secondary", style: { fontSize: 12, whiteSpace: "nowrap" } },
          "安装到："
        ),
        t.createElement(E, {
          value: Ae,
          onChange: (b) => Qe(b),
          style: { minWidth: 180 },
          size: "small",
          options: j.map((b) => ({ value: b.id, label: b.name }))
        })
      ),
      // Configure MCP source button
      t.createElement(
        d,
        {
          icon: I ? t.createElement(I) : void 0,
          onClick: () => kr(!0),
          size: "small"
        },
        "配置 MCP 源"
      )
    ),
    // Dynamic category tag row (from OSS manifest tag_groups)
    Ar.length > 0 ? t.createElement(
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
        ne,
        { type: "secondary", style: { fontSize: 12, marginRight: 4 } },
        "分类:"
      ),
      t.createElement(
        h,
        {
          style: { fontSize: 11, cursor: "pointer", borderRadius: 12 },
          color: ft === "" ? "blue" : void 0,
          onClick: () => Rr("")
        },
        "全部"
      ),
      ...Ar.map(
        (b) => t.createElement(
          h,
          {
            key: b.id,
            style: { fontSize: 11, cursor: "pointer", borderRadius: 12 },
            color: ft === b.id ? "geekblue" : void 0,
            onClick: () => Rr(
              ft === b.id ? "" : b.id
            )
          },
          b.label
        )
      )
    ) : null,
    // MCP server cards (dynamic from OSS)
    zr && Pn.length === 0 ? t.createElement(
      "div",
      { style: { textAlign: "center", padding: 40 } },
      t.createElement(s, { size: "large" }, t.createElement("div", { style: { minHeight: 60, display: "flex", alignItems: "center", justifyContent: "center" } }, "正在加载 MCP 服务器..."))
    ) : Pn.length === 0 ? t.createElement(o, {
      description: "未找到匹配的 MCP 服务器",
      image: o.PRESENTED_IMAGE_SIMPLE
    }) : t.createElement(
      m,
      { gutter: [12, 12] },
      ...Pn.map(
        (b) => t.createElement(
          p,
          { key: b.id, xs: 24, sm: 12, md: 8 },
          t.createElement(
            w,
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
                b.iconUrl ? t.createElement("img", {
                  src: b.iconUrl,
                  alt: b.name,
                  style: { width: 28, height: 28, objectFit: "contain" },
                  onError: (J) => {
                    J.target.style.display = "none";
                  }
                }) : b.emoji
              ),
              t.createElement(
                "div",
                { style: { flex: 1 } },
                t.createElement(
                  ne,
                  { strong: !0, style: { fontSize: 14 } },
                  b.name
                ),
                t.createElement(
                  "div",
                  { style: { display: "flex", gap: 4, marginTop: 4, flexWrap: "wrap" } },
                  t.createElement(
                    h,
                    { color: "blue", style: { fontSize: 10 } },
                    b.category
                  ),
                  t.createElement(
                    h,
                    {
                      color: b.transport === "stdio" ? "purple" : "cyan",
                      style: { fontSize: 10 }
                    },
                    b.transport
                  ),
                  b.env && Object.keys(b.env).length > 0 ? t.createElement(
                    h,
                    { color: "orange", style: { fontSize: 10 } },
                    "需配置密钥"
                  ) : null
                )
              )
            ),
            // Description
            t.createElement(
              le,
              {
                type: "secondary",
                style: { fontSize: 12, margin: 0, lineHeight: 1.5 },
                ellipsis: { rows: 3 }
              },
              b.description
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
                ne,
                { type: "secondary", style: { fontSize: 11 } },
                b.transport === "stdio" ? `${b.command} ${(b.args || []).join(" ")}` : b.url || ""
              ),
              et.has(b.id) ? t.createElement(
                d,
                { size: "small", disabled: !0 },
                "已安装"
              ) : t.createElement(
                d,
                {
                  type: "primary",
                  size: "small",
                  loading: !!_e[b.id],
                  icon: I ? t.createElement(I) : void 0,
                  onClick: () => fo(b)
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
      k ? t.createElement(k, {
        style: { fontSize: 24, color: "var(--ant-color-text-quaternary, #bfbfbf)", marginBottom: 8 }
      }) : null,
      t.createElement(
        ne,
        { type: "secondary", style: { fontSize: 12 } },
        "MCP 服务器列表来自 UGSci 官方源，自动同步更新"
      )
    )
  ), ho = Oe ? t.createElement(
    z,
    {
      title: t.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 8 } },
        t.createElement("span", { style: { fontSize: 20, display: "inline-flex", alignItems: "center", justifyContent: "center", width: 24, height: 24 } }, Oe.iconUrl ? t.createElement("img", { src: Oe.iconUrl, alt: Oe.name, style: { width: 22, height: 22, objectFit: "contain" }, onError: (b) => {
          b.target.style.display = "none";
        } }) : Oe.emoji),
        t.createElement("span", null, `配置 ${Oe.name} 密钥`)
      ),
      open: !!Oe,
      onCancel: () => {
        ae(null), Me({});
      },
      onOk: go,
      okText: "安装",
      cancelText: "取消",
      width: 520,
      destroyOnClose: !0
    },
    // Description
    t.createElement(
      ne,
      { type: "secondary", style: { display: "block", marginBottom: 16, fontSize: 12 } },
      Oe.description
    ),
    ...Object.entries(Oe.env || {}).map(([b]) => {
      const J = oa[b], Q = (J == null ? void 0 : J.isSecret) !== !1;
      return t.createElement(
        "div",
        { key: b, style: { marginBottom: 16 } },
        t.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 6, marginBottom: 4 } },
          t.createElement(
            ne,
            { strong: !0, style: { fontSize: 13 } },
            (J == null ? void 0 : J.label) || b
          ),
          t.createElement(
            h,
            { color: "orange", style: { fontSize: 10 } },
            "必填"
          )
        ),
        // Help text with optional link
        J ? t.createElement(
          "div",
          { style: { marginBottom: 6, fontSize: 12, color: "var(--ant-color-text-tertiary, #8c8c8c)" } },
          J.help,
          J.link ? t.createElement(
            "a",
            {
              href: J.link,
              target: "_blank",
              rel: "noopener noreferrer",
              style: { marginLeft: 4, fontSize: 12 }
            },
            "获取方式 ↗"
          ) : null
        ) : null,
        // Input field
        Q ? t.createElement(c.Password, {
          placeholder: `请输入 ${(J == null ? void 0 : J.label) || b}`,
          value: $e[b] || "",
          onChange: (fe) => Me((Ce) => ({
            ...Ce,
            [b]: fe.target.value
          })),
          style: { width: "100%" }
        }) : t.createElement(c, {
          placeholder: `请输入 ${(J == null ? void 0 : J.label) || b}`,
          value: $e[b] || "",
          onChange: (fe) => Me((Ce) => ({
            ...Ce,
            [b]: fe.target.value
          })),
          style: { width: "100%" }
        }),
        // Show env key name for reference
        t.createElement(
          ne,
          { type: "secondary", style: { fontSize: 11, display: "block", marginTop: 2 } },
          `环境变量名: ${b}`
        )
      );
    })
  ) : null, Eo = t.createElement(
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
        prefix: W ? t.createElement(W) : void 0,
        value: we,
        onChange: (b) => Re(b.target.value),
        allowClear: !0,
        style: { maxWidth: 400, flex: 1, minWidth: 200 }
      }),
      t.createElement(
        d,
        {
          icon: M ? t.createElement(M) : void 0,
          onClick: () => Tr(!0),
          size: "small"
        },
        "配置专家源"
      )
    ),
    // Dynamic category tag row (from OSS manifest tag_groups)
    Lr.length > 0 ? t.createElement(
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
        ne,
        { type: "secondary", style: { fontSize: 12, marginRight: 4 } },
        "分类:"
      ),
      t.createElement(
        h,
        {
          style: { fontSize: 11, cursor: "pointer", borderRadius: 12 },
          color: gt === "" ? "blue" : void 0,
          onClick: () => Nr("")
        },
        "全部"
      ),
      ...Lr.map(
        (b) => t.createElement(
          h,
          {
            key: b.id,
            style: { fontSize: 11, cursor: "pointer", borderRadius: 12 },
            color: gt === b.id ? "geekblue" : void 0,
            onClick: () => Nr(
              gt === b.id ? "" : b.id
            )
          },
          b.label
        )
      )
    ) : null,
    // Agent cards (dynamic from OSS)
    Ur && zn.length === 0 ? t.createElement(
      "div",
      { style: { textAlign: "center", padding: 40 } },
      t.createElement(s, { size: "large" }, t.createElement("div", { style: { minHeight: 60, display: "flex", alignItems: "center", justifyContent: "center" } }, "正在加载人才市场..."))
    ) : zn.length === 0 ? t.createElement(o, {
      description: "未找到匹配的人才",
      image: o.PRESENTED_IMAGE_SIMPLE
    }) : t.createElement(
      m,
      { gutter: [12, 12] },
      ...zn.map(
        (b) => t.createElement(
          p,
          { key: b.id, xs: 24, sm: 12, md: 8 },
          t.createElement(
            w,
            {
              hoverable: !0,
              size: "small",
              style: { height: "100%", cursor: "pointer" },
              onClick: () => Xt(b)
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
              t.createElement(nt, {
                name: b.name,
                size: 40
              }),
              t.createElement(
                "div",
                { style: { flex: 1 } },
                t.createElement(
                  ne,
                  { strong: !0, style: { fontSize: 14 } },
                  b.name
                ),
                t.createElement(
                  "div",
                  { style: { display: "flex", gap: 4, marginTop: 4, flexWrap: "wrap" } },
                  b.category ? t.createElement(
                    h,
                    { color: "blue", style: { fontSize: 10 } },
                    kt(b.category)
                  ) : null,
                  b.tags.includes("mcp") ? t.createElement(
                    h,
                    { color: "purple", style: { fontSize: 10 } },
                    "MCP"
                  ) : null
                )
              )
            ),
            t.createElement(
              le,
              {
                type: "secondary",
                style: { fontSize: 12, margin: 0, lineHeight: 1.5 },
                ellipsis: { rows: 3 }
              },
              b.description
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
                ne,
                { type: "secondary", style: { fontSize: 11 } },
                b.tags.filter((J) => J !== "agent" && J !== "template" && J !== "workspace").slice(0, 3).join(" · ") || "人才模板"
              ),
              t.createElement(
                d,
                {
                  type: "primary",
                  size: "small",
                  icon: G ? t.createElement(G) : void 0
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
      k ? t.createElement(k, {
        style: { fontSize: 24, color: "var(--ant-color-text-quaternary, #bfbfbf)", marginBottom: 8 }
      }) : null,
      t.createElement(
        ne,
        { type: "secondary", style: { fontSize: 12 } },
        "人才市场来自 UGSci 官方源，自动同步更新"
      )
    )
  ), bo = [
    {
      key: "skills",
      label: t.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        T ? t.createElement(T, { style: { fontSize: 14 } }) : null,
        "技能市场"
      ),
      children: mo
    },
    {
      key: "mcp",
      label: t.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        I ? t.createElement(I, { style: { fontSize: 14 } }) : null,
        "MCP 市场"
      ),
      children: yo
    },
    {
      key: "experts",
      label: t.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        G ? t.createElement(G, { style: { fontSize: 14 } }) : null,
        "人才市场"
      ),
      children: Eo
    }
  ];
  return t.createElement(
    "div",
    { style: { padding: 24 } },
    e ? null : t.createElement(wn, {
      title: "市场",
      subtitle: "浏览技能市场 · 选择 MCP 服务器 · 人才市场 · 随时更新能力和专家",
      extra: t.createElement(
        "div",
        { style: { display: "flex", gap: 8 } },
        t.createElement(
          d,
          {
            type: "primary",
            icon: X ? t.createElement(X) : void 0,
            onClick: () => {
              Qt(A, V, {}), Yt(), An();
            },
            loading: Se || wr || zr || Ur
          },
          "刷新"
        )
      )
    }),
    t.createElement(x, {
      items: bo,
      activeKey: P,
      onChange: (b) => oe(b)
    }),
    // Skill source config modal
    t.createElement(Os, {
      open: no,
      onClose: () => Sr(!1),
      sources: je,
      onChange: (b) => {
        Be(b), Yt(b);
      }
    }),
    // MCP source config modal
    t.createElement(sa, {
      open: ao,
      onClose: () => kr(!1),
      sources: ro,
      onChange: (b) => xr(b),
      type: "mcp"
    }),
    // MCP token config modal (for templates requiring secrets)
    ho,
    // Expert source config modal
    t.createElement(sa, {
      open: oo,
      onClose: () => Tr(!1),
      sources: lo,
      onChange: (b) => Cr(b),
      type: "expert"
    }),
    // ── Agent Detail Modal (click card to view details, then create) ──
    Je ? t.createElement(
      z,
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
          t.createElement(nt, {
            name: Je.name,
            size: 40
          }),
          t.createElement(
            "div",
            null,
            t.createElement(
              ne,
              { strong: !0, style: { fontSize: 16 } },
              Je.name
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
              Je.category ? t.createElement(
                h,
                { color: "blue", style: { fontSize: 10 } },
                kt(Je.category)
              ) : null,
              ...Je.tags.filter(
                (b) => b !== "agent" && b !== "template" && b !== "workspace"
              ).slice(0, 5).map(
                (b) => t.createElement(
                  h,
                  { key: b, style: { fontSize: 10 } },
                  b
                )
              )
            )
          )
        ),
        open: !0,
        onCancel: () => Xt(null),
        width: 640,
        footer: t.createElement(
          "div",
          { style: { textAlign: "right" } },
          t.createElement(
            d,
            {
              onClick: () => Xt(null),
              style: { marginRight: 8 }
            },
            "取消"
          ),
          t.createElement(
            d,
            {
              type: "primary",
              loading: In,
              disabled: In,
              icon: G ? t.createElement(G) : void 0,
              style: qe,
              onClick: async () => {
                await po(Je), Xt(null);
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
          ne,
          { strong: !0, style: { display: "block", marginBottom: 6 } },
          "简介"
        ),
        t.createElement(
          le,
          {
            type: "secondary",
            style: { fontSize: 13, lineHeight: 1.7, margin: 0 }
          },
          Je.description
        )
      ),
      // Skills manifest hint
      Je.skills_manifest ? t.createElement(
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
          ne,
          { style: { fontSize: 12, color: "#52c41a" } },
          "✓ 包含技能清单，创建后将自动安装推荐技能"
        )
      ) : null,
      // Instructions hint
      Je.instructions ? t.createElement(
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
          ne,
          { style: { fontSize: 12, color: "#1677ff" } },
          "✓ 包含系统提示词，创建后将自动写入 AGENTS.md"
        )
      ) : null,
      // Drivers
      Je.drivers && Object.keys(Je.drivers).length > 0 ? t.createElement(
        "div",
        null,
        t.createElement(
          ne,
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
          ...Object.entries(Je.drivers).map(
            ([b, J]) => t.createElement(
              h,
              { key: b, color: "cyan", style: { fontSize: 11 } },
              `${b}${J && J.length > 0 ? ` (${J.join(", ")})` : ""}`
            )
          )
        )
      ) : null
    ) : null
  );
}
function js() {
  try {
    const t = localStorage.getItem("language") || "";
    if (t) return t.split("-")[0];
  } catch {
  }
  return ((typeof navigator < "u" ? navigator.language : "") || "").split("-")[0] || "en";
}
const ua = {
  zh: "您好，UGSci 智能助手在线。无论是油气藏分析、数值模拟还是工程决策，描述您的场景，我来交付结果。",
  en: "UGSci AI assistant is online. From reservoir analysis to numerical simulation and engineering decisions — describe your scenario and I'll deliver results.",
  ja: "UGSci AIアシスタントがオンラインです。油層解析、数値シミュレーション、エンジニアリングの意思決定など、シナリオを描写してください。結果をお届けします。",
  ru: "UGSci AI-ассистент онлайн. От анализа пласта до численного моделирования и инженерных решений — опишите свой сценарий, и я предоставлю результат.",
  vi: "Trợ lý AI UGSci đang trực tuyến. Từ phân tích mỏ, mô phỏng số đến ra quyết định kỹ thuật — mô tả kịch bản của bạn, tôi sẽ giao kết quả.",
  id: "Asisten AI UGSci sedang online. Dari analisis reservoir, simulasi numerik hingga keputusan engineering — jelaskan skenario Anda, saya akan memberikan hasilnya."
}, ma = {
  zh: { label: "能告诉我你都能做点什么吗？", value: "能告诉我你都能做点什么吗" },
  en: { label: "Can you tell me what you can do?", value: "Can you tell me what you can do?" },
  ja: { label: "あなたができることを教えてください", value: "あなたができることを教えてください" },
  ru: { label: "Расскажи, что ты умеешь делать?", value: "Расскажи, что ты умеешь делать?" },
  vi: { label: "Bạn có thể cho tôi biết bạn làm được gì không?", value: "Bạn có thể cho tôi biết bạn làm được gì không?" },
  id: { label: "Bisa cerita apa saja yang bisa Anda lakukan?", value: "Bisa cerita apa saja yang bisa Anda lakukan?" }
};
function Ns() {
  const e = C(), t = e.React, { useEffect: n, useRef: r } = t, a = e.useSelectedAgent ? e.useSelectedAgent() : { id: "default" }, l = (a == null ? void 0 : a.id) || "default", i = r(null), s = r(null);
  return n(() => {
    if (i.current === l) return;
    i.current = l, rr();
    const o = js(), c = ua[o] || ua.en, d = ma[o] || ma.en;
    let u = !1;
    return (async () => {
      var m, p;
      try {
        const w = await xn(l);
        if (u) return;
        const h = qa(w);
        if (s.current) {
          try {
            s.current();
          } catch {
          }
          s.current = null;
        }
        const y = window.QwenPaw;
        (m = y == null ? void 0 : y.chat) != null && m.welcome && (h.length > 0 ? (s.current = y.chat.welcome.set("ugsci", {
          description: c,
          prompts: h
        }), console.info(
          `[ugsci] Injected ${h.length} welcome prompts for agent "${l}"`
        )) : (s.current = y.chat.welcome.set("ugsci", {
          description: c,
          prompts: [d]
        }), console.info(
          `[ugsci] No skills for agent "${l}" — using default prompt`
        )));
      } catch (w) {
        console.warn(
          `[ugsci] Failed to inject welcome prompts for agent "${l}":`,
          w
        );
        const h = window.QwenPaw;
        if ((p = h == null ? void 0 : h.chat) != null && p.welcome && !u) {
          if (s.current) {
            try {
              s.current();
            } catch {
            }
            s.current = null;
          }
          s.current = h.chat.welcome.set("ugsci", {
            description: c,
            prompts: [d]
          });
        }
      }
    })(), () => {
      u = !0;
    };
  }, [l]), null;
}
const Ds = 256;
let We = {};
const Jn = /* @__PURE__ */ new Set(), pn = () => Jn.forEach((e) => e()), Fs = (e) => (Jn.add(e), () => Jn.delete(e)), Ft = /* @__PURE__ */ new Map();
function pa(e, t) {
  const n = [];
  for (const l of t) {
    if (!l) continue;
    const i = We[Ct(e, l)] || Object.values(We).find((s) => s.uiId === l);
    i && n.push(i);
  }
  const r = `${e}::${t.join("\0")}`, a = Ft.get(r);
  return a && a.length === n.length && a.every((l, i) => l === n[i]) ? a : (Ft.set(r, n), n);
}
function Ct(e, t) {
  return `${e}::${t}`;
}
function fn(e) {
  return !e || typeof e != "object" ? null : e.ok === !0 && (e.kind === "genui" || e.kind === "genui_patch") ? e : e.genui && typeof e.genui == "object" ? fn(e.genui) : e.ui && typeof e.ui == "object" ? fn(e.ui.genui) : null;
}
function Bt(e) {
  if (!e || typeof e != "string") return null;
  try {
    const t = JSON.parse(e);
    if (Array.isArray(t)) {
      for (const n of t) {
        const r = (n == null ? void 0 : n.type) === "text" ? n.text : void 0, a = typeof r == "string" ? Bt(r) : fn(n);
        if (a) return a;
      }
      return null;
    }
    return fn(t);
  } catch {
    return null;
  }
}
function Ut(e) {
  var t;
  if (!e || typeof e != "string") return null;
  try {
    const n = JSON.parse(e);
    if (Array.isArray(n)) {
      const r = (t = n.find((a) => (a == null ? void 0 : a.type) === "text")) == null ? void 0 : t.text;
      return typeof r == "string" ? Ut(r) : null;
    }
    return n && n.ok === !1 ? n : null;
  } catch {
    return null;
  }
}
const fa = /* @__PURE__ */ new Set(["plugin_call_output", "function_call_output", "tool_call_output", "mcp_call_output", "component_call_output"]), Mn = /* @__PURE__ */ new Set(["emit_ui_tree", "emit_ui_patch"]);
function wl(e) {
  var r, a, l, i;
  if (!Array.isArray(e)) return [];
  const t = [], n = (s, o = !1) => {
    var u, m, p;
    if (!s || typeof s != "object") return;
    if (Array.isArray(s)) {
      const w = o ? s.map((h) => {
        var y;
        return ((y = h == null ? void 0 : h.data) == null ? void 0 : y.name) ?? (h == null ? void 0 : h.name);
      }).filter((h) => !!h).map((h) => String(h)) : [];
      if (o && w.length) {
        const h = w.some((y) => Mn.has(y));
        for (const y of s) {
          const f = ((u = y == null ? void 0 : y.data) == null ? void 0 : u.output) ?? (y == null ? void 0 : y.output) ?? ((m = y == null ? void 0 : y.data) == null ? void 0 : m.result) ?? (y == null ? void 0 : y.result) ?? ((p = y == null ? void 0 : y.data) == null ? void 0 : p.content) ?? (y == null ? void 0 : y.content);
          if (f == null) continue;
          const E = typeof f == "string" ? f : JSON.stringify(f), v = Bt(E) || (h ? Ut(E) : null);
          v && t.push(v);
        }
      }
      s.forEach((h) => n(h));
      return;
    }
    const c = s;
    if (c.type === "tool_result") {
      const h = (Array.isArray(c.output) ? c.output : []).filter((E) => (E == null ? void 0 : E.type) === "text").map((E) => E.text), y = h.length ? h.join(`
`) : c.output, f = h.length ? h : [typeof y == "string" ? y : JSON.stringify(y)];
      for (const E of f) {
        const v = Bt(E) || (Mn.has(String(c.name || "")) ? Ut(E) : null);
        v && t.push(v);
      }
      return;
    }
    const d = fa.has(String(c.type || ""));
    Object.entries(c).forEach(
      ([w, h]) => n(h, d && w === "content")
    );
  };
  n(e);
  for (const s of e) {
    if (!s || typeof s != "object") continue;
    const o = s;
    if (!fa.has(String(o.type || "")) || !Array.isArray(o.content)) continue;
    const c = o.content, d = (a = (r = c[0]) == null ? void 0 : r.data) == null ? void 0 : a.name;
    if (!d) continue;
    const u = (i = (l = c[1]) == null ? void 0 : l.data) == null ? void 0 : i.output;
    if (u == null) continue;
    const m = typeof u == "string" ? u : JSON.stringify(u), p = Bt(m) || (Mn.has(String(d)) ? Ut(m) : null);
    p && t.push(p);
  }
  return Array.from(new Map(t.map((s) => [`${s.kind}:${s.ui_id}:${s.revision}`, s])).values());
}
function Sl(e) {
  var i;
  const t = Ct(e.sessionId, e.uiId), n = Object.entries(We).filter(([, s]) => s.uiId === e.uiId).sort(([, s], [, o]) => o.revision - s.revision), r = We[t] || ((i = n[0]) == null ? void 0 : i[1]);
  if (r && e.revision < r.revision) return;
  const a = { ...We };
  for (const [s] of n) s !== t && delete a[s];
  a[t] = r && e.revision === r.revision ? { ...r, ...e, tree: r.tree } : e;
  const l = Object.entries(a).sort(([, s], [, o]) => o.updatedAt - s.updatedAt);
  We = Object.fromEntries(l.slice(0, Ds)), pn();
}
function Gs(e, t) {
  for (const n of wl(t))
    !n.ui_id || !n.tree || Sl({
      schemaVersion: "1",
      uiId: n.ui_id,
      revision: n.revision || 1,
      tree: n.tree,
      sessionId: e,
      sourceToolCallId: n.tool_call_id,
      updatedAt: Date.now()
    });
}
const xl = {
  setSnapshot: Sl,
  applyPatch(e, t, n, r) {
    var c, d;
    const a = (c = window.QwenPaw) == null ? void 0 : c.host, l = r || ((d = a == null ? void 0 : a.getCurrentSessionId) == null ? void 0 : d.call(a)) || "", i = Ct(l, e.ui_id), s = We[i] || Object.values(We).find((u) => u.uiId === e.ui_id);
    if (!s || n <= s.revision) return;
    We = { ...Object.fromEntries(Object.entries(We).filter(([, u]) => u.uiId !== e.ui_id)), [i]: { ...s, sessionId: l, tree: t, revision: n, updatedAt: Date.now() } }, pn();
  },
  getSnapshot: (e, t) => We[Ct(e, t)],
  clearSession(e) {
    We = Object.fromEntries(Object.entries(We).filter(([, t]) => t.sessionId !== e));
    for (const t of [...Ft.keys()])
      t.startsWith(`${e}::`) && Ft.delete(t);
    pn();
  },
  hydrateFromMessages: Gs
};
function Hs({ children: e }) {
  return e;
}
function Ws() {
  return xl;
}
function qs(e, t) {
  var l, i;
  const n = (i = (l = window.QwenPaw) == null ? void 0 : l.host) == null ? void 0 : i.React;
  if (!n) throw new Error("useGenUiSnapshots: host React not available");
  const r = t.join("\0"), a = r === "" ? [] : r.split("\0");
  return n.useSyncExternalStore(
    Fs,
    () => pa(e, a),
    () => pa(e, a)
  );
}
function Vs(e) {
  xl.clearSession(e);
}
function Js() {
  We = {}, Ft.clear(), pn();
}
function jt(e) {
  var t;
  if (typeof e == "string") {
    if (e.trimStart().startsWith("["))
      try {
        return jt(JSON.parse(e));
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
    if (n.output !== void 0) return jt(n.output);
    if (n.content !== void 0) return jt(n.content);
  }
  return e == null ? "" : JSON.stringify(e);
}
function Ks(e) {
  const t = e.data;
  if (!t) return { resultText: "", status: "calling", toolName: "" };
  const n = t.status || "calling", r = t.content;
  if (!Array.isArray(r) || r.length === 0)
    return { resultText: "", status: n, toolName: "" };
  const a = r[0], l = a == null ? void 0 : a.data, i = (l == null ? void 0 : l.name) || "";
  if (r.length > 1) {
    const s = r[1], o = s == null ? void 0 : s.data, c = (o == null ? void 0 : o.output) ?? (o == null ? void 0 : o.content) ?? (s == null ? void 0 : s.output) ?? (s == null ? void 0 : s.content) ?? (o == null ? void 0 : o.result) ?? (s == null ? void 0 : s.result);
    if (c != null) return { resultText: jt(c), status: n, toolName: i };
  }
  if (l != null && l.output) {
    const s = l.output;
    return { resultText: jt(s), status: n, toolName: i };
  }
  return { resultText: "", status: n, toolName: i };
}
function ga(e) {
  var p, w, h, y;
  const t = (p = window.QwenPaw) == null ? void 0 : p.host, n = t == null ? void 0 : t.React;
  if (!n) return null;
  const { resultText: r, status: a, toolName: l } = Ks(e), i = a === "in_progress" || a === "calling", s = a === "failed" || a === "error", o = Bt(r), c = o ? null : Ut(r);
  let d = 0;
  (w = o == null ? void 0 : o.tree) != null && w.root && (d = kl(o.tree.root));
  const u = l === "emit_ui_patch" || (o == null ? void 0 : o.kind) === "genui_patch", m = i ? u ? "📝 Patching UI Tree..." : "🎨 Generating UI Tree..." : s ? u ? "📝 UI Patch Error" : "🎨 UI Tree Error" : o ? u ? `📝 UI Patched (rev ${o.revision ?? "?"})` : `🎨 UI Tree (${d} nodes)` : u ? "📝 UI Patch" : "🎨 UI Tree";
  return n.createElement(
    "details",
    { open: i || s, style: { margin: "4px 0", border: "1px solid var(--ant-color-border, #d9d9d9)", borderRadius: 8, padding: "4px 8px", fontSize: 13 } },
    n.createElement(
      "summary",
      { style: { cursor: "pointer", display: "flex", alignItems: "center", gap: 6 } },
      n.createElement("span", null, u ? "📝" : "🎨"),
      n.createElement("span", null, m),
      o != null && o.ok ? n.createElement("span", { style: { fontSize: 11, color: "#999", marginLeft: "auto" } }, `ui_id: ${((h = o.ui_id) == null ? void 0 : h.slice(0, 16)) ?? ""}…`) : null
    ),
    s || c && !o ? n.createElement(
      "div",
      { style: { padding: "8px 12px", fontSize: 12 } },
      n.createElement("div", { style: { color: "var(--ant-color-error, #ff4d4f)", marginBottom: 4 } }, (c == null ? void 0 : c.message) || "Unknown error"),
      c != null && c.hint ? n.createElement("div", { style: { color: "#999" } }, `💡 ${c.hint}`) : null
    ) : o != null && o.ok ? n.createElement(
      "div",
      { style: { padding: "8px 12px", fontSize: 12, color: "#999" } },
      (y = o.tree) != null && y.root ? `GenUI 已在回复正文中展示（${d} 个节点，revision ${o.revision ?? 1}）。` : "GenUI 工具已完成，但没有可展示的树。"
    ) : n.createElement("pre", { style: { fontSize: 12, padding: "8px 12px", background: "rgba(0,0,0,0.03)", borderRadius: 8, overflow: "auto", maxHeight: 200 } }, r || "(waiting for result...)")
  );
}
function kl(e) {
  if (!e || typeof e != "object") return 0;
  let t = 1;
  if (Array.isArray(e.children)) for (const n of e.children) t += kl(n);
  return t;
}
function un(e) {
  var t;
  if (typeof e == "string") {
    if (e.trimStart().startsWith("["))
      try {
        return un(JSON.parse(e));
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
    if (n.output !== void 0) return un(n.output);
    if (n.content !== void 0) return un(n.content);
  }
  return e == null ? "" : JSON.stringify(e);
}
function Xs(e) {
  var i;
  const t = e.data;
  if (!t) return { resultText: "", status: "calling", toolName: "" };
  const n = t.status || "calling", r = t.content;
  if (!Array.isArray(r) || r.length === 0)
    return { resultText: "", status: n, toolName: "" };
  const a = (i = r[0]) == null ? void 0 : i.data, l = (a == null ? void 0 : a.name) || "";
  if (r.length > 1) {
    const s = r[1], o = s == null ? void 0 : s.data, c = (o == null ? void 0 : o.output) ?? (o == null ? void 0 : o.content) ?? (s == null ? void 0 : s.output) ?? (s == null ? void 0 : s.content);
    if (c != null) return { resultText: un(c), status: n, toolName: l };
  }
  return { resultText: "", status: n, toolName: l };
}
function ya(e) {
  var d;
  const t = (d = window.QwenPaw) == null ? void 0 : d.host, n = t == null ? void 0 : t.React;
  if (!n) return null;
  const { resultText: r, status: a, toolName: l } = Xs(e), i = l === "get_genui_guide", s = a === "in_progress" || a === "calling";
  let o = i ? "GenUI 指南" : "组件目录", c = r;
  try {
    const u = r ? JSON.parse(r) : null;
    if (u && typeof u == "object") {
      const m = u.components;
      Array.isArray(m) ? (o = `组件目录（${m.length} 个 kind）`, c = m.map((p) => p == null ? void 0 : p.kind).filter(Boolean).join(" · ")) : (u.purpose || u.layout_structure) && (o = "GenUI 指南", c = String(u.purpose || "布局与语法说明已返回，模型可按此编写 emit_ui_tree。"));
    }
  } catch {
  }
  return n.createElement(
    "details",
    { style: { margin: "4px 0", border: "1px solid var(--ant-color-border, #d9d9d9)", borderRadius: 8, padding: "4px 8px", fontSize: 13 } },
    n.createElement("summary", { style: { cursor: "pointer" } }, s ? i ? "查阅 GenUI 指南…" : "查阅组件目录…" : o),
    n.createElement("div", { style: { padding: "8px 4px", fontSize: 12, color: "#666", lineHeight: 1.5 } }, c || "(waiting…)")
  );
}
const Ys = /* @__PURE__ */ new Set(["send_message"]), ha = 1e4, Qs = 500, Ea = {};
function Zs() {
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
  return new Set(Ys);
}
function ec(e) {
  const t = Date.now(), n = Ea[e] || 0;
  return t - n < Qs ? (console.warn("[ugsci.genui] Action '" + e + "' throttled"), !0) : (Ea[e] = t, !1);
}
function tc(e, t) {
  return e.replace(/\{\{\s*([\w.-]+)\s*\}\}/g, (n, r) => {
    const a = t[r];
    return a == null ? "" : typeof a == "string" ? a : JSON.stringify(a);
  });
}
function Kn(e, t = {}) {
  var l, i, s, o, c, d, u;
  let n;
  if (typeof e == "string") n = { type: e };
  else if (e && typeof e == "object") n = e;
  else return { ok: !1, message: "无效操作" };
  const r = n.type === "submit_form" ? "send_message" : n.type, a = Zs();
  if (!a.has(r))
    return console.warn(
      "[ugsci.genui] Action '" + n.type + "' not allowed (allowed: " + Array.from(a).join(", ") + ")"
    ), { ok: !1, message: "此操作未获允许" };
  if (ec(r)) return { ok: !1, message: "操作过于频繁，请稍后重试" };
  if (r === "send_message") {
    const m = t.formValues || {};
    let p = ((l = n.payload) == null ? void 0 : l.content) || ((i = n.payload) == null ? void 0 : i.message) || "";
    const w = /\{\{\s*[\w.-]+\s*\}\}/.test(p);
    return p = tc(p, m).trim(), p && !w && Object.keys(m).length > 0 && (p += `
${Object.entries(m).map(([y, f]) => `${y}: ${typeof f == "string" ? f : JSON.stringify(f)}`).join(`
`)}`), !p && Object.keys(m).length > 0 && (p = `${t.formId ? `提交表单 ${t.formId}` : "提交表单"}
${Object.entries(m).map(([f, E]) => `${f}: ${typeof E == "string" ? E : JSON.stringify(E)}`).join(`
`)}`), !p || !p.trim() ? (console.warn("[ugsci.genui] send_message: content is empty"), { ok: !1, message: "消息内容为空" }) : p.length > ha ? (console.warn("[ugsci.genui] send_message: content length " + p.length + " exceeds max " + ha), { ok: !1, message: "消息内容过长" }) : !((c = (o = (s = window.QwenPaw) == null ? void 0 : s.chat) == null ? void 0 : o.sendMessage) != null && c.call(o, p)) ? (console.info("[ugsci.genui] send_message: could not find chat sender, content:", p), { ok: !1, message: "当前无法发送消息" }) : { ok: !0, message: "已提交" };
  }
  if (r === "open_url") {
    const m = ((d = n.payload) == null ? void 0 : d.url) || ((u = n.payload) == null ? void 0 : u.href) || "", p = typeof m == "string" ? m.trim() : "";
    return /^https?:\/\//i.test(p) ? (window.open(p, "_blank", "noopener,noreferrer"), { ok: !0, message: "已打开链接" }) : (console.warn("[ugsci.genui] open_url: only http(s) URLs are allowed"), { ok: !1, message: "仅允许 http(s) 链接" });
  }
  return { ok: !1, message: "尚未实现此操作" };
}
const Ze = /* @__PURE__ */ new Map(), Gt = /* @__PURE__ */ new Map(), nc = 128, an = /* @__PURE__ */ new Map();
function gn(e) {
  return e.startsWith("http://") || e.startsWith("https://") || e.startsWith("data:") || e.startsWith("blob:");
}
function rc(e) {
  return e ? !!(e.startsWith("/") || /^[A-Za-z]:[\\/]/.test(e) || e.startsWith("\\\\")) : !1;
}
function ac(e) {
  return e.startsWith("workspace://");
}
function lc(e) {
  return ac(e) ? e.slice(12) : e;
}
async function oc(e) {
  if (!e) return null;
  if (gn(e)) return e;
  if (Ze.has(e))
    return Ze.get(e) ?? null;
  if (an.has(e))
    return an.get(e);
  const t = ic(e);
  an.set(e, t);
  try {
    const n = await t;
    if (!Ze.has(e) && Ze.size >= nc) {
      const r = Ze.keys().next().value;
      if (r !== void 0) {
        const a = Ze.get(r);
        a != null && a.startsWith("blob:") && URL.revokeObjectURL(a), Ze.delete(r);
      }
    }
    return Ze.set(e, n), n && Gt.delete(e), n;
  } finally {
    an.delete(e);
  }
}
async function ic(e) {
  const t = window.QwenPaw, n = t == null ? void 0 : t.host;
  if (!n) {
    const a = "宿主媒体 API 不可用。请在 QwenPaw 工作区中打开此内容，或改用 http(s)、data、blob URL。";
    return Gt.set(e, a), console.warn("[ugsci.genui]", a), null;
  }
  const r = lc(e);
  if (typeof n.resolveWorkspaceBlob == "function")
    try {
      const a = await n.resolveWorkspaceBlob(r);
      if (a) return a;
    } catch (a) {
      console.warn("[ugsci.genui] host.resolveWorkspaceBlob failed:", a);
    }
  try {
    return await sc(r, n);
  } catch (a) {
    const l = a instanceof Error ? a.message : String(a);
    return Gt.set(
      e,
      `无法读取本地媒体：${l}。请确认文件位于当前工作区且文件预览 API 已启用。`
    ), console.warn(
      `[ugsci.genui] Failed to resolve media URL for '${e}':`,
      a
    ), null;
  }
}
async function sc(e, t) {
  let n = null;
  const r = t == null ? void 0 : t.workspaceApi, a = t == null ? void 0 : t.chatApi;
  if (rc(e) && (a != null && a.filePreviewUrl) ? n = a.filePreviewUrl(e) : r != null && r.getBinaryFileUrl && (n = r.getBinaryFileUrl(e)), !n)
    throw new Error("宿主未提供 workspaceApi.getBinaryFileUrl 或 chatApi.filePreviewUrl");
  const l = {}, i = t == null ? void 0 : t.buildAuthHeaders;
  if (typeof i == "function")
    try {
      const c = i();
      c && typeof c == "object" && Object.assign(l, c);
    } catch {
    }
  const s = await fetch(n, { headers: l });
  if (!s.ok)
    throw new Error(`HTTP ${s.status}: ${s.statusText}`);
  const o = await s.blob();
  return URL.createObjectURL(o);
}
function ba(e) {
  return e ? gn(e) ? e : Ze.get(e) ?? null : null;
}
function va(e) {
  return Gt.get(e) ?? null;
}
function cc() {
  for (const e of Ze.values())
    if (e && e.startsWith("blob:"))
      try {
        URL.revokeObjectURL(e);
      } catch {
      }
  Ze.clear(), Gt.clear();
}
const Cl = [
  "Input",
  "NumberInput",
  "Select",
  "Textarea",
  "Switch",
  "Slider",
  "FileInput"
], ht = ["#1677ff", "#52c41a", "#faad14", "#ff4d4f", "#722ed1", "#13c2c2", "#eb2f96"], dc = /* @__PURE__ */ new Set([
  "Button",
  "InteractiveButton",
  "ToggleButton",
  "LinkButton"
]);
function be(e) {
  return typeof e == "string" ? e : e == null ? "" : String(e);
}
function Ye(e) {
  if (typeof e == "number" && Number.isFinite(e)) return e;
  if (typeof e == "string") {
    const t = Number(e);
    return Number.isFinite(t) ? t : 0;
  }
  return 0;
}
function Ot(e) {
  return Array.isArray(e) ? e : [];
}
function Nt(e) {
  return !!e;
}
function Ht(e) {
  const t = e.props || {}, n = be(t.name);
  if (n) return n;
  const r = be(t.label), a = r.match(/^\s*([a-e])(?:\b|\s|（|\()/i);
  return a ? a[1].toLowerCase() : r || be(e.nodeId);
}
function Tl(e) {
  return Cl.includes(e);
}
function _l(e) {
  return Math.min(Math.max(Ye(e) || 2, 1), 4);
}
function uc(e, t, n = 6) {
  const r = Ye(e);
  return Math.min(Math.max(r > 0 ? r : t, 1), n);
}
function mc(e) {
  const n = (be(e) || "16:9").split(":"), r = Number(n[0]), a = Number(n[1]);
  return r > 0 && a > 0 ? `${r} / ${a}` : "16 / 9";
}
function pc(e) {
  return /^https?:\/\//i.test(be(e).trim());
}
function Xe(e, t) {
  const n = {}, r = `${Ye(t.gap) || 12}px`;
  if (e === "Stack")
    n.display = "flex", n.flexDirection = "column", n.gap = r, t.padding != null && (n.padding = `${Ye(t.padding)}px`);
  else if (e === "Row")
    n.display = "flex", n.flexDirection = "row", n.gap = r, t.align && (n.alignItems = be(t.align)), t.justify && (n.justifyContent = be(t.justify));
  else if (e === "Grid" || e === "FeatureGrid" || e === "KpiBoard" || e === "ImageGallery") {
    const a = e === "KpiBoard" ? 3 : e === "FeatureGrid" ? 2 : e === "ImageGallery" ? 3 : 2, l = e === "FeatureGrid" ? 4 : 6;
    n.display = "grid", n.gridTemplateColumns = `repeat(${uc(t.columns, a, l)}, minmax(0, 1fr))`, n.gap = e === "ImageGallery" ? `${Ye(t.gap) || 8}px` : r;
  } else e === "ScrollArea" ? (n.maxHeight = `${Ye(t.maxHeight) || 300}px`, n.overflowY = "auto", t.padding != null && (n.padding = `${Ye(t.padding)}px`)) : e === "AspectBox" ? (n.aspectRatio = mc(t.ratio), n.overflow = "hidden", n.borderRadius = "8px", n.display = "flex", n.justifyContent = "center", n.alignItems = "center") : e === "Spacer" && (n.height = `${Ye(t.size) || 16}px`);
  return n;
}
function mr(e, t) {
  function n(u) {
    return typeof u == "string" ? u : u == null ? "" : String(u);
  }
  function r(u) {
    if (typeof u == "number" && Number.isFinite(u)) return u;
    if (typeof u == "string") {
      const m = Number(u);
      return Number.isFinite(m) ? m : 0;
    }
    return 0;
  }
  function a(u) {
    return Array.isArray(u) ? u : [];
  }
  const l = e.generator && typeof e.generator == "object" ? e.generator : {}, i = a(l.coefficients).map(n).filter(Boolean), s = n(l.type) === "polynomial" || i.length > 0;
  let o = a(e.categories).map(n), c = a(e.series);
  if (s && t) {
    const u = i.length > 0 ? i : ["a", "b", "c", "d", "e"], m = typeof l.xMin == "number" ? l.xMin : -3, p = typeof l.xMax == "number" ? l.xMax : 3, w = Math.min(Math.max(r(l.samples) || 61, 10), 400), h = Array.from({ length: w }, (f, E) => m + (p - m) * E / Math.max(w - 1, 1)), y = u.map((f) => r(t[f]));
    o = h.map((f) => Number(f.toFixed(2)).toString()), c = [{
      name: n(l.label) || "f(x)",
      values: h.map((f) => y.reduce((E, v, g) => E + v * Math.pow(f, y.length - g - 1), 0))
    }];
  }
  const d = c.map((u, m) => {
    const p = u && typeof u == "object" ? u : {};
    return {
      name: n(p.name) || `Series ${m + 1}`,
      values: a(p.values).map(r)
    };
  });
  return {
    title: n(e.title),
    chartType: n(e.chart) || "line",
    categories: o,
    series: d,
    height: r(e.height) || 200,
    showLegend: e.showLegend !== !1,
    empty: o.length === 0 || d.length === 0
  };
}
function Il(e, t, n = 640) {
  const r = ["#1677ff", "#52c41a", "#faad14", "#ff4d4f", "#722ed1", "#13c2c2", "#eb2f96"];
  if (e.replaceChildren(), t.title) {
    const p = document.createElement("div");
    p.className = "chart-title", p.textContent = t.title, e.appendChild(p);
  }
  if (t.empty) {
    const p = document.createElement("div");
    p.className = "muted", p.textContent = "Chart: no data", e.appendChild(p);
    return;
  }
  const a = t.height || 240, l = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  if (l.setAttribute("viewBox", `0 0 ${n} ${a}`), l.setAttribute("role", "img"), l.setAttribute("aria-label", t.title || "Chart"), t.chartType === "pie") {
    const p = t.series[0].values.map((v) => Math.abs(v)), w = p.reduce((v, g) => v + g, 0) || 1, h = n / 2, y = a / 2, f = Math.min(n, a) / 2 - 20;
    let E = -Math.PI / 2;
    if (p.forEach((v, g) => {
      const x = v / w * Math.PI * 2, O = h + f * Math.cos(E), K = y + f * Math.sin(E), z = h + f * Math.cos(E + x), R = y + f * Math.sin(E + x), X = document.createElementNS(l.namespaceURI, "path");
      X.setAttribute("d", `M ${h} ${y} L ${O} ${K} A ${f} ${f} 0 ${x > Math.PI ? 1 : 0} 1 ${z} ${R} Z`), X.setAttribute("fill", r[g % r.length]), l.appendChild(X), E += x;
    }), e.appendChild(l), t.showLegend) {
      const v = document.createElement("div");
      v.className = "legend", p.forEach((g, x) => {
        const O = document.createElement("span"), K = document.createElement("i");
        K.style.background = r[x % r.length], O.append(K, document.createTextNode(`${t.categories[x] || `#${x + 1}`}: ${g}`)), v.appendChild(O);
      }), e.appendChild(v);
    }
    return;
  }
  const i = t.series.flatMap((p) => p.values), s = Math.max(...i, 0), o = Math.min(...i, 0), c = s - o || 1, d = (p) => a - 24 - (p - o) / c * (a - 44), u = (p) => 30 + p * (n - 50) / Math.max(t.categories.length - 1, 1), m = document.createElementNS(l.namespaceURI, "line");
  if (m.setAttribute("x1", "30"), m.setAttribute("x2", String(n - 15)), m.setAttribute("y1", String(d(0))), m.setAttribute("y2", String(d(0))), m.setAttribute("stroke", "#d9d9d9"), l.appendChild(m), t.series.forEach((p, w) => {
    const h = r[w % r.length];
    if (t.chartType === "bar") {
      const E = (n - 50) / Math.max(t.categories.length, 1), v = Math.max(1, E / t.series.length - 3);
      p.values.forEach((g, x) => {
        const O = document.createElementNS(l.namespaceURI, "rect"), K = Math.min(d(g), d(0)), z = Math.max(d(g), d(0));
        O.setAttribute("x", String(30 + x * E + w * (v + 2))), O.setAttribute("y", String(K)), O.setAttribute("width", String(v)), O.setAttribute("height", String(Math.max(1, z - K))), O.setAttribute("fill", h), l.appendChild(O);
      });
      return;
    }
    const y = p.values.map((E, v) => `${u(v)},${d(E)}`).join(" "), f = document.createElementNS(l.namespaceURI, "polyline");
    f.setAttribute("points", y), f.setAttribute("fill", t.chartType === "area" ? `${h}22` : "none"), f.setAttribute("stroke", h), f.setAttribute("stroke-width", "2"), l.appendChild(f);
  }), e.appendChild(l), t.showLegend) {
    const p = document.createElement("div");
    p.className = "legend", t.series.forEach((w, h) => {
      const y = document.createElement("span"), f = document.createElement("i");
      f.style.background = r[h % r.length], y.append(f, document.createTextNode(w.name)), p.appendChild(y);
    }), e.appendChild(p);
  }
}
const fc = {
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
}, gc = {
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
function Al(e) {
  const t = be(e).trim();
  if (!t) return { kind: "empty" };
  const n = t.toLowerCase().replace(/\s+/g, "-"), r = gc[n];
  return r ? { kind: "svg", paths: fc[r] } : /^[\w.-]+$/.test(t) ? { kind: "empty" } : t.length <= 8 ? { kind: "emoji", text: t.slice(0, 8) } : { kind: "empty" };
}
function yc(e, t, n = {}) {
  const r = Al(t), a = n.size && n.size > 0 ? n.size : 16;
  if (e.setAttribute("aria-hidden", "true"), e.replaceChildren(), r.kind === "emoji") {
    e.textContent = r.text, e.style.fontSize = `${a}px`, n.color && (e.style.color = n.color);
    return;
  }
  if (r.kind === "empty") return;
  const l = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  l.setAttribute("width", String(a)), l.setAttribute("height", String(a)), l.setAttribute("viewBox", "0 0 24 24"), l.setAttribute("fill", "none"), l.setAttribute("stroke", n.color || "currentColor"), l.setAttribute("stroke-width", "2"), l.setAttribute("stroke-linecap", "round"), l.setAttribute("stroke-linejoin", "round"), l.setAttribute("focusable", "false"), l.style.display = "block";
  for (const i of r.paths) {
    const s = document.createElementNS("http://www.w3.org/2000/svg", "path");
    s.setAttribute("d", i), l.appendChild(s);
  }
  e.appendChild(l);
}
let Ln = null;
function Cn(e) {
  return Ln || (Ln = e.createContext(null)), Ln;
}
function $l(e, t = {}) {
  if (Tl(e.kind)) {
    const n = e.props || {}, r = n.value ?? n.checked;
    r !== void 0 && (t[Ht(e)] = r);
  }
  for (const n of e.children || []) $l(n, t);
  return t;
}
function hc({
  node: e,
  children: t,
  onValuesChange: n
}) {
  var o, c;
  const r = (c = (o = window.QwenPaw) == null ? void 0 : o.host) == null ? void 0 : c.React;
  if (!r) return null;
  const a = r.useMemo(() => $l(e), [e]), [l, i] = r.useState(a);
  r.useEffect(
    () => i((d) => ({ ...a, ...d })),
    [a]
  ), r.useEffect(() => {
    n == null || n(l);
  }, [l, n]);
  const s = r.useMemo(
    () => ({
      values: l,
      setValue: (d, u) => i((m) => ({ ...m, [d]: u }))
    }),
    [l]
  );
  return r.createElement(
    Cn(r).Provider,
    { value: s },
    t
  );
}
const Z = (e) => typeof e == "string" ? e : e != null ? String(e) : "", ot = (e) => typeof e == "number" ? e : typeof e == "string" && Number(e) || 0, it = (e) => !!e, Mt = (e) => Array.isArray(e) ? e : [], Ec = (e, t) => {
  const n = Object.keys(e), r = Object.keys(t);
  return n.length === r.length && n.every((a) => Object.is(e[a], t[a]));
}, wa = { xs: "12px", sm: "13px", base: "14px", lg: "16px" }, Te = {
  muted: "var(--ant-color-text-secondary, #8c8c8c)",
  default: "var(--ant-color-text, #000000d9)",
  primary: "var(--ant-color-primary, #1677ff)",
  success: "var(--ant-color-success, #52c41a)",
  warning: "var(--ant-color-warning, #faad14)",
  error: "var(--ant-color-error, #ff4d4f)"
}, bc = new Set(Cl);
function vc(e) {
  const t = [], n = (r) => {
    bc.has(r.kind) && t.push(r);
    for (const a of r.children || []) n(a);
  };
  for (const r of e.children || []) n(r);
  return t;
}
let Bn = null;
function pr(e) {
  return Bn || (Bn = e.createContext(null)), Bn;
}
function wc({ node: e }) {
  var w;
  const t = (w = window.QwenPaw) == null ? void 0 : w.host, n = t == null ? void 0 : t.React, r = (t == null ? void 0 : t.antd) || {};
  if (!n) return null;
  const a = e.props || {}, l = n.useContext(Cn(n)), [i, s] = n.useState({}), [o, c] = n.useState(null), d = n.useMemo(
    () => vc(e),
    [e]
  ), u = n.useMemo(() => {
    const h = {};
    for (const y of d) {
      const f = y.props || {}, E = Ht(y);
      f.value !== void 0 ? h[E] = f.value : f.checked !== void 0 && (h[E] = f.checked);
    }
    return h;
  }, [d]);
  n.useEffect(() => s((h) => {
    const y = { ...u, ...h, ...(l == null ? void 0 : l.values) || {} };
    return Ec(h, y) ? h : y;
  }), [u, l == null ? void 0 : l.values]);
  const m = n.useMemo(() => ({ values: i, setValue: (h, y) => {
    c(null), s((f) => ({ ...f, [h]: y })), l == null || l.setValue(h, y);
  } }), [i, l]), p = () => {
    var f, E;
    const h = d.filter((v) => {
      var g;
      return (g = v.props) == null ? void 0 : g.required;
    }).find((v) => {
      const g = Ht(v), x = i[g];
      return x == null || x === "" || Array.isArray(x) && x.length === 0;
    });
    if (h) {
      c({ ok: !1, message: `${Z((f = h.props) == null ? void 0 : f.label) || Z((E = h.props) == null ? void 0 : E.name) || "必填项"}不能为空` });
      return;
    }
    const y = a.action && typeof a.action == "object" ? a.action : { type: "submit_form", payload: {} };
    c(Kn(y, { formValues: i, formId: Z(a.formId) || e.nodeId }));
  };
  return n.createElement(
    pr(n).Provider,
    { value: m },
    n.createElement(
      "div",
      { style: { margin: "4px 0" } },
      a.title ? n.createElement("div", { style: { fontWeight: 600, marginBottom: 8 } }, Z(a.title)) : null,
      ...(e.children || []).map((h, y) => n.createElement(Wt(n), { key: h.nodeId || y, node: h })),
      n.createElement(r.Button || "button", { type: "primary", size: "small", style: { marginTop: 8 }, onClick: p }, Z(a.submitLabel) || "提交"),
      o ? n.createElement("div", { role: "status", style: { marginTop: 6, fontSize: 12, color: o.ok ? Te.success : Te.error } }, o.message) : null
    )
  );
}
function Sc({ node: e, fieldType: t }) {
  var f, E, v;
  const n = (f = window.QwenPaw) == null ? void 0 : f.host, r = n == null ? void 0 : n.React, a = (n == null ? void 0 : n.antd) || {};
  if (!r) return null;
  const l = e.props || {}, i = r.useContext(pr(r)), s = r.useContext(Cn(r)), o = i || s, [c, d] = r.useState(l.value ?? l.checked ?? ""), u = Ht(e), m = l.value ?? l.checked ?? "", p = o ? ((E = o.values) == null ? void 0 : E[u]) ?? m : c, w = (g) => {
    const x = g != null && g.target ? t === "Switch" ? g.target.checked : g.target.value : g;
    o ? o.setValue(u, x) : d(x);
  }, h = (g) => r.createElement(
    "div",
    { style: { display: "flex", flexDirection: "column", gap: 4, margin: "4px 0" } },
    l.label && t !== "Switch" ? r.createElement("label", { style: { fontSize: 12, color: Te.muted } }, Z(l.label), l.required ? r.createElement("span", { style: { color: Te.error } }, " *") : null) : null,
    g,
    l.description ? r.createElement("span", { style: { fontSize: 11, color: Te.muted } }, Z(l.description)) : null
  ), y = Z(l.label) || Z(l.placeholder) || u;
  return t === "Input" ? h(r.createElement(a.Input || "input", { "aria-label": y, placeholder: Z(l.placeholder), value: p, onChange: w, size: "small" })) : t === "NumberInput" ? h(r.createElement(a.InputNumber || "input", { "aria-label": y, value: p, min: l.min, max: l.max, step: l.step, onChange: w, size: "small", style: { width: "100%" } })) : t === "Textarea" ? h(r.createElement(((v = a.Input) == null ? void 0 : v.TextArea) || "textarea", { "aria-label": y, placeholder: Z(l.placeholder), value: p, rows: ot(l.rows) || 3, onChange: w, style: { width: "100%" } })) : t === "Select" ? h(r.createElement(a.Select || "select", { "aria-label": y, placeholder: Z(l.placeholder), value: p || void 0, onChange: w, size: "small", style: { width: "100%" } }, Mt(l.options).map((g, x) => {
    var O;
    return r.createElement(((O = a.Select) == null ? void 0 : O.Option) || "option", { key: x, value: Z(typeof g == "object" ? g.value : g) }, Z(typeof g == "object" ? g.label : g));
  }))) : t === "Switch" ? r.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8 } }, r.createElement(a.Switch || "input", { type: "checkbox", checked: !!p, onChange: w, size: "small" }), r.createElement("span", null, Z(l.label))) : t === "Slider" ? h(r.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8 } }, r.createElement(a.Slider || "input", { type: "range", value: ot(p), min: l.min ?? 0, max: l.max ?? 100, step: l.step ?? 1, onChange: w, style: { flex: 1 } }), r.createElement("span", { style: { minWidth: 32, fontSize: 12 } }, Z(p)))) : t === "FileInput" ? r.createElement(
    "label",
    { style: { display: "inline-flex", alignItems: "center", gap: 8, cursor: "pointer" } },
    r.createElement("span", null, Z(l.label) || "选择文件"),
    r.createElement("input", { type: "file", multiple: it(l.multiple), accept: Z(l.accept) || void 0, onChange: (g) => o == null ? void 0 : o.setValue(u, Array.from(g.target.files || []).map((x) => ({ name: x.name, size: x.size, type: x.type }))) })
  ) : null;
}
function Un({ node: e, link: t = !1, toggle: n = !1 }) {
  var p;
  const r = (p = window.QwenPaw) == null ? void 0 : p.host, a = r == null ? void 0 : r.React, l = (r == null ? void 0 : r.antd) || {};
  if (!a) return null;
  const i = e.props || {}, s = a.useContext(pr(a)), [o, c] = a.useState(it(i.checked)), [d, u] = a.useState(null), m = () => {
    n && c((w) => !w), i.action && typeof i.action == "object" ? u(Kn(i.action, { formValues: s == null ? void 0 : s.values, formId: s ? "form" : void 0 })) : t && typeof i.href == "string" && u(Kn({ type: "open_url", payload: { url: i.href } }));
  };
  return a.createElement(
    "span",
    { style: { display: "inline-flex", flexDirection: "column", gap: 3 } },
    a.createElement(l.Button || "button", { type: t ? "link" : (n ? o : Z(i.variant) === "primary") ? "primary" : "default", size: "small", disabled: it(i.disabled), loading: it(i.loading), onClick: m }, Z(i.label) || "Action"),
    d ? a.createElement("span", { role: "status", style: { fontSize: 11, color: d.ok ? Te.success : Te.error } }, d.message) : null
  );
}
let Sa = null, ln = null;
function xc(e) {
  return ln && Sa === e || (Sa = e, ln = class extends e.Component {
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
        style: { padding: 8, border: "1px dashed var(--ant-color-error, #ff4d4f)", borderRadius: 8, fontSize: 12, color: Te.error, fontFamily: "monospace" }
      }, `Component error: ${this.props.node.kind}`) : this.props.children;
    }
  }), ln;
}
function kc({ node: e }) {
  var o;
  const t = (o = window.QwenPaw) == null ? void 0 : o.host;
  if (!(t != null && t.React)) return null;
  const n = t.React, r = t.antd || {}, a = Wt(n), l = e.props || {}, i = e.children || [];
  return Tc(n, r, e, l, i, () => i.map(
    (c, d) => n.createElement(a, { key: c.nodeId || d, node: c })
  ));
}
let on = null, xa = null;
function Wt(e) {
  return on && xa === e || (on = e.memo(kc, (t, n) => t.node === n.node), xa = e), on;
}
function Cc({ node: e }) {
  var r;
  const t = (r = window.QwenPaw) == null ? void 0 : r.host;
  if (!(t != null && t.React)) return null;
  const n = t.React;
  return n.createElement(
    xc(n),
    { node: e },
    n.createElement(Wt(n), { node: e })
  );
}
function Tc(e, t, n, r, a, l) {
  var i, s;
  switch (n.kind) {
    case "Stack":
      return e.createElement("div", { style: Xe("Stack", r) }, l());
    case "Row":
      return e.createElement("div", { style: Xe("Row", r) }, l());
    case "Grid":
      return e.createElement("div", { style: Xe("Grid", r) }, l());
    case "Spacer":
      return e.createElement("div", { style: Xe("Spacer", r) });
    case "ScrollArea":
      return e.createElement("div", { style: Xe("ScrollArea", r) }, l());
    case "AspectBox":
      return e.createElement("div", { style: Xe("AspectBox", r) }, l());
    case "Text":
      return e.createElement("div", { style: { fontSize: wa[Z(r.size)] || wa.base, color: Te[Z(r.color)] || Te.default, fontWeight: it(r.bold) ? "bold" : "normal", lineHeight: 1.6 } }, Z(r.value));
    case "Heading": {
      const o = _l(r.level), c = { 1: "24px", 2: "20px", 3: "18px", 4: "16px" };
      return e.createElement(`h${o}`, { style: { fontSize: c[o], fontWeight: "bold", margin: "4px 0" } }, Z(r.value));
    }
    case "Divider":
      return e.createElement(t.Divider || "hr", r.label ? { children: Z(r.label) } : {});
    case "Markdown": {
      const o = (i = window.QwenPaw) == null ? void 0 : i.host, c = o == null ? void 0 : o.ReactMarkdown;
      if (c) {
        const d = o != null && o.remarkGfm ? [o.remarkGfm] : [];
        return e.createElement(
          "div",
          { className: "qwenpaw-genui-markdown" },
          e.createElement(c, { children: Z(r.content || r.value), remarkPlugins: d })
        );
      }
      return e.createElement("div", { style: { whiteSpace: "pre-wrap", lineHeight: 1.6 } }, Z(r.content || r.value));
    }
    case "CodeBlock":
      return e.createElement("pre", { style: { padding: 12, background: "var(--ant-color-fill-tertiary, rgba(0,0,0,0.04))", borderRadius: 8, overflow: "auto", fontSize: 13, fontFamily: "monospace" } }, Z(r.code));
    case "SectionHeader":
      return e.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8, marginBottom: 8 } }, r.icon ? e.createElement("span", { style: { fontSize: 20 } }, Z(r.icon)) : null, e.createElement("div", null, e.createElement("div", { style: { fontSize: 16, fontWeight: 600 } }, Z(r.title)), r.subtitle ? e.createElement("div", { style: { fontSize: 12, color: Te.muted } }, Z(r.subtitle)) : null));
    case "KeyValueList": {
      const o = Mt(r.items);
      return e.createElement(
        "div",
        { style: { display: "flex", flexDirection: "column", gap: 4 } },
        ...o.map((c, d) => e.createElement(
          "div",
          { key: d, style: { display: "flex", justifyContent: "space-between", padding: "2px 0", borderBottom: d < o.length - 1 ? "1px solid var(--ant-color-border-secondary, #f0f0f0)" : "none" } },
          e.createElement("span", { style: { color: Te.muted, fontSize: 13 } }, Z(c.key)),
          e.createElement("span", { style: { fontWeight: 500, fontSize: 13 } }, Z(c.value))
        ))
      );
    }
    case "Badge":
      return e.createElement(t.Tag || "span", { color: Z(r.variant) || "default", children: Z(r.value) });
    case "Tag":
      return e.createElement(t.Tag || "span", { color: Z(r.color) || "default", children: Z(r.label) });
    case "Stat":
      return e.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 2 } }, e.createElement("span", { style: { fontSize: 12, color: Te.muted } }, Z(r.label)), e.createElement("span", { style: { fontSize: 20, fontWeight: "bold" } }, Z(r.value)), r.delta ? e.createElement("span", { style: { fontSize: 12, color: Z(r.trend) === "up" ? Te.success : Z(r.trend) === "down" ? Te.error : Te.muted } }, Z(r.delta)) : null);
    case "Progress":
      return e.createElement(t.Progress || "div", { percent: ot(r.value), size: "small" });
    case "Skeleton": {
      const o = ot(r.rows) || 3;
      return e.createElement(
        "div",
        { style: { display: "flex", flexDirection: "column", gap: 8 } },
        ...Array.from({ length: o }).map(
          (c, d) => e.createElement(t.Skeleton || "div", { key: d, active: it(r.active), title: !1, paragraph: { rows: 1 } })
        )
      );
    }
    case "Avatar":
      return e.createElement(Ic, {
        src: Z(r.src),
        name: Z(r.name),
        size: ot(r.size) || 32
      });
    case "Icon": {
      const o = Al(r.name), c = ot(r.size) || 16, d = Te[Z(r.color)] || Te.default;
      return o.kind === "emoji" ? e.createElement("span", { "aria-hidden": !0, style: { fontSize: c, color: d, lineHeight: 1 } }, o.text) : o.kind === "svg" ? e.createElement("svg", {
        width: c,
        height: c,
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: d,
        strokeWidth: 2,
        strokeLinecap: "round",
        strokeLinejoin: "round",
        "aria-hidden": !0,
        focusable: "false",
        style: { display: "inline-block", verticalAlign: "middle" }
      }, ...o.paths.map((u, m) => e.createElement("path", { key: m, d: u }))) : e.createElement("span", { "aria-hidden": !0, style: { width: c, height: c, display: "inline-block" } });
    }
    case "Card":
      return e.createElement(t.Card || "div", { title: r.title ? Z(r.title) : void 0, size: "small", style: { margin: "4px 0" } }, l());
    case "DataCard":
      return e.createElement(t.Card || "div", { size: "small", style: { margin: "4px 0" } }, e.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center" } }, e.createElement("div", null, e.createElement("div", { style: { fontSize: 12, color: Te.muted } }, Z(r.title)), e.createElement("div", { style: { fontSize: 24, fontWeight: "bold" } }, Z(r.value))), r.icon ? e.createElement("span", { style: { fontSize: 32 } }, Z(r.icon)) : null));
    case "MetricCard":
      return e.createElement(t.Card || "div", { size: "small", style: { margin: "4px 0" } }, e.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center" } }, e.createElement("div", null, e.createElement("div", { style: { fontSize: 12, color: Te.muted } }, Z(r.title)), e.createElement("div", { style: { fontSize: 24, fontWeight: "bold" } }, Z(r.value)), r.delta ? e.createElement("span", { style: { fontSize: 12, color: Z(r.trend) === "up" ? Te.success : Z(r.trend) === "down" ? Te.error : Te.muted } }, `${Z(r.delta)} ${r.period ? Z(r.period) : ""}`.trim()) : null), r.icon ? e.createElement("span", { style: { fontSize: 32 } }, Z(r.icon)) : null));
    case "AlertCard":
    case "Alert":
      return e.createElement(t.Alert || "div", { type: Z(r.severity) === "success" ? "success" : Z(r.severity) === "warning" ? "warning" : Z(r.severity) === "error" ? "error" : "info", message: r.title ? Z(r.title) : void 0, description: Z(r.message), showIcon: !0, style: { margin: "4px 0" } });
    case "Callout":
      return e.createElement(t.Alert || "div", { type: Z(r.variant) === "tip" ? "success" : Z(r.variant) === "warning" ? "warning" : Z(r.variant) === "important" ? "error" : "info", message: r.title ? Z(r.title) : void 0, description: Z(r.message), showIcon: !0 });
    case "TimelineCard":
      return e.createElement(t.Card || "div", { size: "small", style: { margin: "4px 0" } }, e.createElement("div", { style: { display: "flex", gap: 8, alignItems: "flex-start" } }, e.createElement("div", { style: { width: 8, height: 8, borderRadius: "50%", background: Z(r.status) === "done" ? Te.success : Z(r.status) === "pending" ? Te.warning : Te.primary, marginTop: 4, flexShrink: 0 } }), e.createElement("div", null, e.createElement("div", { style: { fontWeight: 600 } }, Z(r.title)), r.date ? e.createElement("div", { style: { fontSize: 12, color: Te.muted } }, Z(r.date)) : null, r.description ? e.createElement("div", { style: { fontSize: 13, marginTop: 4 } }, Z(r.description)) : null)));
    case "KpiBoard":
      return e.createElement("div", { style: { margin: "4px 0" } }, r.title ? e.createElement("div", { style: { fontSize: 16, fontWeight: 600, marginBottom: 8 } }, Z(r.title)) : null, e.createElement("div", { style: Xe("KpiBoard", r) }, l()));
    case "FeatureGrid":
      return e.createElement("div", { style: { ...Xe("FeatureGrid", r), margin: "4px 0" } }, l());
    case "Stepper": {
      const o = Mt(r.steps).map((d) => Z(d)), c = ot(r.current);
      return e.createElement(
        t.Steps || "div",
        { current: c, size: "small", style: { margin: "4px 0" } },
        ...o.map((d, u) => {
          var m;
          return e.createElement(((m = t.Steps) == null ? void 0 : m.Item) || "div", { key: u, title: d });
        })
      );
    }
    case "Table": {
      const o = Mt(r.headers).map((m) => Z(m)), d = a.filter((m) => m.kind === "TableRow").map((m, p) => {
        const w = (m.children || []).filter((y) => y.kind === "TableCell"), h = { key: p };
        return o.forEach((y, f) => {
          var v, g;
          const E = (g = (v = w[f]) == null ? void 0 : v.props) == null ? void 0 : g.value;
          h[y] = E == null ? "" : Z(E);
        }), h;
      }), u = o.map((m) => ({ title: m, dataIndex: m, key: m }));
      return e.createElement(t.Table || "table", { dataSource: d, columns: u, size: it(r.compact) ? "small" : "middle", pagination: !1, style: { margin: "4px 0" } });
    }
    case "List": {
      const o = a.filter((c) => c.kind === "ListItem");
      return e.createElement(
        t.List || "ul",
        { size: "small", style: { margin: "4px 0" } },
        o.map((c, d) => {
          var u, m, p;
          return e.createElement(((u = t.List) == null ? void 0 : u.Item) || "li", { key: d }, (m = c.props) != null && m.icon ? e.createElement("span", { style: { marginRight: 6 } }, Z(c.props.icon)) : null, Z((p = c.props) == null ? void 0 : p.value));
        })
      );
    }
    case "ImageGallery": {
      const o = a.filter((c) => c.kind === "Image");
      return e.createElement(
        "div",
        { style: { ...Xe("ImageGallery", r), margin: "4px 0" } },
        ...o.map((c, d) => {
          const u = c.props || {};
          return e.createElement(Xn, { key: d, src: Z(u.src), alt: Z(u.alt), style: { width: "100%", height: 120, objectFit: "cover", borderRadius: 8, cursor: "pointer" } });
        })
      );
    }
    case "Image":
      return e.createElement("div", null, e.createElement(Xn, { src: Z(r.src), alt: Z(r.alt), style: { maxWidth: "100%", borderRadius: it(r.rounded) ? "8px" : void 0, maxHeight: r.maxHeight ? `${ot(r.maxHeight)}px` : void 0 } }), r.caption ? e.createElement("div", { style: { fontSize: 12, color: Te.muted } }, Z(r.caption)) : null);
    case "Chart":
      return e.createElement(_c, { props: r });
    case "Button":
    case "InteractiveButton":
      return e.createElement(Un, { node: n });
    case "ToggleButton":
      return e.createElement(Un, { node: n, toggle: !0 });
    case "LinkButton":
      return e.createElement(Un, { node: n, link: !0 });
    case "Input":
    case "NumberInput":
    case "Select":
    case "Textarea":
    case "Switch":
    case "Slider":
    case "FileInput":
      return e.createElement(Sc, { node: n, fieldType: n.kind });
    case "Form":
      return e.createElement(wc, { node: n });
    case "Chip":
      return e.createElement(t.Tag || "span", { color: Z(r.color) || "default", closable: !0, onClose: () => {
      }, children: Z(r.label) });
    case "ChipGroup": {
      const o = Mt(r.items);
      return e.createElement("div", { style: { display: "flex", flexWrap: "wrap", gap: 4 } }, ...o.map((c, d) => e.createElement(t.Tag || "span", { key: d }, Z(c))));
    }
    case "Tabs": {
      const o = Wt(e), d = a.filter((u) => u.kind === "TabItem").map((u) => {
        var m, p, w;
        return {
          key: Z((m = u.props) == null ? void 0 : m.key) || Z((p = u.props) == null ? void 0 : p.tab),
          label: Z((w = u.props) == null ? void 0 : w.tab),
          children: (u.children || []).map((h, y) => e.createElement(o, { key: h.nodeId || y, node: h }))
        };
      });
      return t.Tabs ? e.createElement(t.Tabs, { items: d, defaultActiveKey: Z(r.activeKey) || ((s = d[0]) == null ? void 0 : s.key) }) : e.createElement("div", null, ...d.map((u, m) => e.createElement("div", { key: m }, e.createElement("div", { style: { fontWeight: 600, marginBottom: 4 } }, u.label), u.children)));
    }
    case "TabItem":
      return e.createElement("div", null, l());
    case "Accordion": {
      const o = Wt(e), c = a.filter((d) => d.kind === "AccordionItem");
      if (t.Collapse) {
        const d = c.map((u) => {
          var m, p, w;
          return {
            key: Z((m = u.props) == null ? void 0 : m.key) || Z((p = u.props) == null ? void 0 : p.header),
            label: Z((w = u.props) == null ? void 0 : w.header),
            children: (u.children || []).map((h, y) => e.createElement(o, { key: h.nodeId || y, node: h }))
          };
        });
        return e.createElement(t.Collapse, { items: d });
      }
      return e.createElement("div", null, ...c.map((d, u) => {
        var m;
        return e.createElement("details", { key: u }, e.createElement("summary", { style: { fontWeight: 600, cursor: "pointer", padding: "4px 0" } }, Z((m = d.props) == null ? void 0 : m.header)), e.createElement("div", { style: { paddingLeft: 12 } }, (d.children || []).map((p, w) => e.createElement(o, { key: p.nodeId || w, node: p }))));
      }));
    }
    case "AccordionItem":
      return e.createElement("div", null, l());
    case "JsonDebug":
      return e.createElement("details", { style: { margin: "4px 0", fontSize: 12 } }, e.createElement("summary", null, Z(r.label) || "Debug JSON"), e.createElement("pre", { style: { fontSize: 12, padding: 8, background: "var(--ant-color-fill-tertiary, rgba(0,0,0,0.04))", borderRadius: 4, overflow: "auto" } }, JSON.stringify(r.data ?? r, null, 2)));
    default:
      return e.createElement("div", { style: { padding: 8, border: "1px dashed var(--ant-color-border, #d9d9d9)", borderRadius: 8, fontSize: 12, color: Te.muted, fontFamily: "monospace" } }, `Unknown component: ${n.kind}`);
  }
}
function _c({ props: e }) {
  var O, K;
  const t = (K = (O = window.QwenPaw) == null ? void 0 : O.host) == null ? void 0 : K.React;
  if (!t) return null;
  const n = t.useContext(Cn(t)), r = mr(e, n == null ? void 0 : n.values), a = r.chartType, l = r.title, i = r.categories, s = r.series, o = r.height, c = r.showLegend, d = 400;
  if (r.empty)
    return t.createElement("div", { style: { padding: 12, color: Te.muted, fontSize: 12 } }, "Chart: no data");
  if (a === "pie") {
    const z = s[0].values.map(($) => Math.abs($)), R = z.reduce(($, _) => $ + _, 0) || 1, X = d / 2, W = o / 2, N = Math.min(d, o) / 2 - 20;
    let T = -Math.PI / 2;
    const k = z.map(($, _) => {
      const M = $ / R * 2 * Math.PI, G = X + N * Math.cos(T), q = W + N * Math.sin(T), F = X + N * Math.cos(T + M), I = W + N * Math.sin(T + M), ne = M > Math.PI ? 1 : 0, le = `M ${X} ${W} L ${G} ${q} A ${N} ${N} 0 ${ne} 1 ${F} ${I} Z`;
      return T += M, { path: le, color: ht[_ % ht.length], label: i[_] || `#${_ + 1}`, val: $ };
    });
    return t.createElement(
      "div",
      { style: { margin: "4px 0" } },
      l ? t.createElement("div", { style: { fontSize: 13, fontWeight: 600, marginBottom: 4 } }, l) : null,
      t.createElement(
        "svg",
        { width: d, height: o, style: { maxWidth: "100%" } },
        ...k.map(($, _) => t.createElement("path", { key: _, d: $.path, fill: $.color, stroke: "#fff", strokeWidth: 1 }))
      ),
      c ? t.createElement(
        "div",
        { style: { display: "flex", flexWrap: "wrap", gap: 8, marginTop: 4, fontSize: 11 } },
        ...k.map(($, _) => t.createElement(
          "span",
          { key: _, style: { display: "flex", alignItems: "center", gap: 4 } },
          t.createElement("span", { style: { display: "inline-block", width: 10, height: 10, borderRadius: 2, background: $.color } }),
          `${$.label}: ${$.val}`
        ))
      ) : null
    );
  }
  const u = s.flatMap((z) => z.values), m = Math.max(...u, 0), p = Math.min(...u, 0), w = m - p || 1, h = i.length > 0 ? (d - 40) / i.length : 0, y = s.length > 0 ? Math.max(1, h / s.length - 2) : 0, f = i.length > 1 ? (d - 40) / (i.length - 1) : 0, E = Math.max(1, Math.ceil(i.length / 8)), v = (z) => o - 20 - (z - p) / w * (o - 40), g = v(0), x = (z) => 30 + z * f;
  return t.createElement(
    "div",
    { style: { margin: "4px 0" } },
    l ? t.createElement("div", { style: { fontSize: 13, fontWeight: 600, marginBottom: 4 } }, l) : null,
    t.createElement(
      "svg",
      { width: d, height: o, style: { maxWidth: "100%" } },
      ...[0, 0.25, 0.5, 0.75, 1].map((z, R) => {
        const X = o - 20 - z * (o - 40);
        return t.createElement("line", { key: `g${R}`, x1: 30, y1: X, x2: d - 10, y2: X, stroke: "var(--ant-color-border-secondary, #f0f0f0)", strokeWidth: 1 });
      }),
      ...i.map((z, R) => R % E === 0 || R === i.length - 1 ? t.createElement("text", { key: `x${R}`, x: x(R), y: o - 6, fontSize: 10, fill: Te.muted, textAnchor: "middle" }, z.length > 6 ? z.slice(0, 6) + "…" : z) : null),
      ...s.map((z, R) => {
        const X = ht[R % ht.length];
        if (a === "bar")
          return z.values.map((T, k) => t.createElement("rect", {
            key: `b${R}-${k}`,
            x: 30 + k * h + R * (y + 2) + 1,
            y: Math.min(v(T), g),
            width: y,
            height: Math.abs(g - v(T)),
            fill: X,
            rx: 2
          }));
        const W = z.values.map((T, k) => `${x(k)},${v(T)}`).join(" "), N = [t.createElement("polyline", { key: `l${R}`, points: W, fill: "none", stroke: X, strokeWidth: 2 })];
        if (a === "area") {
          const T = `${x(0)},${o - 20} ${W} ${x(z.values.length - 1)},${o - 20}`;
          N.unshift(t.createElement("polygon", { key: `a${R}`, points: T, fill: X, opacity: 0.15 }));
        }
        return N;
      })
    ),
    c ? t.createElement(
      "div",
      { style: { display: "flex", flexWrap: "wrap", gap: 8, marginTop: 4, fontSize: 11 } },
      ...s.map((z, R) => t.createElement(
        "span",
        { key: R, style: { display: "flex", alignItems: "center", gap: 4 } },
        t.createElement("span", { style: { display: "inline-block", width: 10, height: 10, borderRadius: 2, background: ht[R % ht.length] } }),
        z.name
      ))
    ) : null
  );
}
function Xn(e) {
  var c;
  const t = (c = window.QwenPaw) == null ? void 0 : c.host, n = t == null ? void 0 : t.React;
  if (!n) return null;
  const { useState: r, useEffect: a } = n, [l, i] = r(
    ba(e.src) || (gn(e.src) ? e.src : null)
  ), [s, o] = r(
    va(e.src)
  );
  return a(() => {
    if (!e.src) return;
    if (gn(e.src)) {
      i(e.src), o(null);
      return;
    }
    const d = ba(e.src);
    if (d) {
      i(d), o(null);
      return;
    }
    i(null), o(null);
    let u = !1;
    return oc(e.src).then((m) => {
      u || (i(m), o(m ? null : va(e.src)));
    }), () => {
      u = !0;
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
      role: s ? "alert" : "status",
      style: {
        ...e.style || {},
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: 80,
        padding: 12,
        textAlign: "center",
        color: s ? Te.error : Te.muted,
        fontSize: 12,
        background: "var(--ant-color-fill-tertiary, rgba(0,0,0,0.04))",
        borderRadius: 8
      }
    },
    s ? `媒体加载失败：${s}` : "正在解析图片…"
  );
}
function Ic(e) {
  var a, l, i;
  const t = (a = window.QwenPaw) == null ? void 0 : a.host, n = t == null ? void 0 : t.React, r = (t == null ? void 0 : t.antd) || {};
  return n ? e.src ? n.createElement(Xn, {
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
    ((i = (l = e.name) == null ? void 0 : l.charAt(0)) == null ? void 0 : i.toUpperCase()) || ""
  ) : null;
}
const Ac = `#genui-root { max-width: 960px; margin: auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px; background: #fff; box-shadow: 0 8px 30px rgba(0,0,0,.05); }
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
@media print { body { padding: 0; } }`, ka = {
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
function $c(e) {
  return e.replace(/[&<>"']/g, (t) => t === "&" ? "&amp;" : t === "<" ? "&lt;" : t === ">" ? "&gt;" : t === '"' ? "&quot;" : "&#39;");
}
function zc(e) {
  return JSON.stringify(e).replace(/</g, "\\u003c");
}
function ee(e, t = "", n) {
  const r = document.createElement(e);
  return t && (r.className = t), n != null && n !== "" && (r.textContent = be(n)), r;
}
function sn(e, t) {
  Object.assign(e.style, t);
}
function zt(e, t, n) {
  for (const r of t || []) e.appendChild(fr(r, n));
  return e;
}
function Ca(e, t, n) {
  return t && e.appendChild(ee("div", "muted small", t)), e.appendChild(ee("div", "display-value", n)), e;
}
function zl(e, t, n, r) {
  const a = be(e);
  if (r.missing.has(a)) {
    const i = ee("div", `media-unavailable ${n}`.trim(), "此媒体未能离线嵌入");
    return i.setAttribute("role", "img"), i.setAttribute("aria-label", be(t)), i;
  }
  const l = ee("img", n);
  return l.src = r.media[a] || a, l.alt = be(t), l;
}
function Pc(e, t, n) {
  return e ? zl(e, t, "avatar", n) : ee("span", "avatar avatar-fallback", be(t).charAt(0).toUpperCase());
}
function Rc(e) {
  const t = ee("div", "markdown");
  let n = null;
  for (const r of be(e).split(/\r?\n/)) {
    const a = r.match(/^(#{1,4})\s+(.*)$/), l = r.match(/^\s*[-*]\s+(.*)$/);
    a ? (n = null, t.appendChild(ee(`h${a[1].length}`, "", a[2]))) : l ? (n || (n = ee("ul"), t.appendChild(n)), n.appendChild(ee("li", "", l[1]))) : r.trim() ? (n = null, t.appendChild(ee("p", "", r))) : (n = null, t.appendChild(document.createElement("br")));
  }
  return t;
}
function Oc(e, t) {
  const n = e.props || {}, r = e.kind, a = Ht(e), l = ee("label", "field");
  n.label && r !== "Switch" && l.appendChild(ee("span", "field-label", `${be(n.label)}${n.required ? " *" : ""}`));
  let i;
  if (r === "Textarea") {
    const o = ee("textarea");
    o.rows = Ye(n.rows) || 3, o.placeholder = be(n.placeholder), i = o;
  } else if (r === "Select") {
    const o = ee("select");
    for (const c of Ot(n.options)) {
      const d = ee("option"), u = c && typeof c == "object" ? c : null;
      d.value = be(u ? u.value : c), d.textContent = be(u ? u.label : c), o.appendChild(d);
    }
    i = o;
  } else {
    const o = ee("input");
    o.type = r === "Slider" ? "range" : r === "Switch" ? "checkbox" : r === "NumberInput" ? "number" : r === "FileInput" ? "file" : "text", n.min != null && (o.min = be(n.min)), n.max != null && (o.max = be(n.max)), n.step != null && (o.step = be(n.step)), r === "FileInput" ? (n.accept && (o.accept = be(n.accept)), o.multiple = Nt(n.multiple)) : o.placeholder = be(n.placeholder), i = o;
  }
  const s = Object.prototype.hasOwnProperty.call(t.values, a) ? t.values[a] : n.value != null ? n.value : n.checked != null ? n.checked : "";
  if (r === "Switch") {
    const o = i;
    o.checked = Nt(s), o.checked ? o.setAttribute("checked", "") : o.removeAttribute("checked");
  } else if (r === "Textarea")
    i.value = be(s), i.textContent = be(s);
  else if (r === "Select") {
    const o = be(s);
    i.value = o;
    for (const c of Array.from(i.options))
      c.value === o ? c.setAttribute("selected", "") : c.removeAttribute("selected");
  } else r !== "FileInput" && (i.value = be(s), i.setAttribute("value", be(s)));
  if (i.setAttribute("data-genui-field", a), i.setAttribute("data-genui-kind", r), r === "Switch") {
    const o = ee("span", "switch-line");
    o.append(i, ee("span", "", n.label)), l.appendChild(o);
  } else if (r === "Slider") {
    const o = ee("span", "slider-line");
    o.append(i, ee("output", "slider-value", s)), l.appendChild(o);
  } else
    l.appendChild(i);
  return n.description && l.appendChild(ee("small", "description", n.description)), l;
}
function fr(e, t) {
  var l, i, s, o, c, d, u;
  if (!e || typeof e != "object") return ee("div");
  const n = e.props || {}, r = e.children || [];
  if (Tl(e.kind)) return Oc(e, t);
  if (e.kind === "Chart") {
    const m = ee("div", "chart");
    return m.setAttribute("data-genui-chart", JSON.stringify(n)), Il(m, mr(n, t.values)), m;
  }
  if (e.kind === "Heading") return ee(`h${_l(n.level)}`, "", n.value);
  if (e.kind === "Text") return ee("div", Nt(n.bold) ? "text bold" : "text", n.value);
  if (e.kind === "Markdown") return Rc(n.content || n.value);
  if (e.kind === "CodeBlock") return ee("pre", "code", n.code);
  if (e.kind === "SectionHeader") {
    const m = ee("div", "section-header");
    n.icon && m.appendChild(ee("span", "section-icon", n.icon));
    const p = ee("div");
    return p.appendChild(ee("strong", "", n.title)), n.subtitle && p.appendChild(ee("div", "muted small", n.subtitle)), m.appendChild(p), m;
  }
  if (e.kind === "KeyValueList") {
    const m = ee("dl", "key-values");
    for (const p of Ot(n.items)) {
      const w = p && typeof p == "object" ? p : {};
      m.append(ee("dt", "", w.key), ee("dd", "", w.value));
    }
    return m;
  }
  if (e.kind === "Divider") {
    const m = ee("div", "divider");
    return n.label && m.appendChild(ee("span", "", n.label)), m;
  }
  if (e.kind === "Spacer") {
    const m = ee("div");
    return sn(m, Xe("Spacer", n)), m;
  }
  if (e.kind === "Tabs") {
    const m = ee("div", "tabs");
    m.setAttribute("data-genui-tabs", "1");
    const p = ee("div", "tab-buttons"), w = ee("div");
    return r.filter((y) => y.kind === "TabItem").forEach((y, f) => {
      var E;
      p.appendChild(ee("button", f ? "" : "active", (E = y.props) == null ? void 0 : E.tab)), w.appendChild(zt(ee("div", f ? "tab-panel hidden" : "tab-panel"), y.children, t));
    }), m.append(p, w), m;
  }
  if (e.kind === "Accordion") {
    const m = ee("div");
    for (const p of r.filter((w) => w.kind === "AccordionItem")) {
      const w = ee("details");
      w.append(ee("summary", "", (l = p.props) == null ? void 0 : l.header), zt(ee("div", "accordion-body"), p.children, t)), m.appendChild(w);
    }
    return m;
  }
  if (e.kind === "Form") {
    const m = ee("div", "stack form");
    n.title && m.appendChild(ee("div", "card-title", n.title)), zt(m, r, t);
    const p = ee("button", "button", be(n.submitLabel) || "提交");
    return p.setAttribute("data-genui-submit", "1"), m.appendChild(p), m;
  }
  if (dc.has(e.kind)) {
    const m = ee("button", e.kind === "LinkButton" ? "link-button" : "button", be(n.label) || "Action");
    return Nt(n.disabled) && (m.disabled = !0), m.setAttribute("data-genui-action", e.kind), e.kind === "LinkButton" && pc(n.href) && m.setAttribute("data-genui-href", be(n.href).trim()), m;
  }
  if (e.kind === "Image") {
    const m = ee("figure");
    return m.appendChild(zl(n.src, n.alt, "", t)), n.caption && m.appendChild(ee("figcaption", "", n.caption)), m;
  }
  if (e.kind === "ImageGallery") {
    const m = ee("div", "image-gallery");
    sn(m, Xe("ImageGallery", n));
    for (const p of r.filter((w) => w.kind === "Image"))
      m.appendChild(fr(p, t));
    return m;
  }
  if (e.kind === "Avatar") return Pc(n.src, n.name, t);
  if (e.kind === "Badge" || e.kind === "Tag" || e.kind === "Chip")
    return ee("span", "tag", n.value || n.label);
  if (e.kind === "Progress") {
    const m = ee("progress");
    return m.max = 100, m.value = Ye(n.value), m;
  }
  if (e.kind === "Stat") {
    const m = ee("div", "stat");
    return m.append(ee("span", "muted small", n.label), ee("strong", "stat-value", n.value)), n.delta && m.appendChild(ee("span", `small trend-${be(n.trend)}`, n.delta)), m;
  }
  if (e.kind === "DataCard" || e.kind === "MetricCard") {
    const m = ee("div", "card metric-card"), p = Ca(ee("div"), n.title, n.value);
    return n.delta && p.appendChild(ee("div", `small trend-${be(n.trend)}`, `${be(n.delta)}${n.period ? ` ${be(n.period)}` : ""}`)), m.appendChild(p), n.icon && m.appendChild(ee("span", "metric-icon", n.icon)), m;
  }
  if (e.kind === "TimelineCard") {
    const m = ee("div", "card timeline");
    return m.append(ee("i", `timeline-dot status-${be(n.status)}`), Ca(ee("div"), n.title, n.date)), n.description && m.appendChild(ee("div", "small", n.description)), m;
  }
  if (e.kind === "Stepper") {
    const m = ee("ol", "stepper");
    return Ot(n.steps).forEach((p, w) => {
      m.appendChild(ee("li", w <= Ye(n.current) ? "active" : "", p));
    }), m;
  }
  if (e.kind === "Table") {
    const m = ee("table", "data-table"), p = ee("thead"), w = ee("tr");
    for (const y of Ot(n.headers)) w.appendChild(ee("th", "", y));
    p.appendChild(w);
    const h = ee("tbody");
    for (const y of r.filter((f) => f.kind === "TableRow")) {
      const f = ee("tr", (i = y.props) != null && i.highlight ? "highlight" : "");
      for (const E of (y.children || []).filter((v) => v.kind === "TableCell")) {
        const v = ee("td", (s = E.props) != null && s.bold ? "bold" : "", (o = E.props) == null ? void 0 : o.value);
        (c = E.props) != null && c.align && (v.style.textAlign = be(E.props.align)), f.appendChild(v);
      }
      h.appendChild(f);
    }
    return m.append(p, h), m;
  }
  if (e.kind === "List") {
    const m = ee(Nt(n.ordered) ? "ol" : "ul", "data-list");
    for (const p of r.filter((w) => w.kind === "ListItem"))
      m.appendChild(ee("li", "", `${(d = p.props) != null && d.icon ? `${be(p.props.icon)} ` : ""}${be((u = p.props) == null ? void 0 : u.value)}`));
    return m;
  }
  if (e.kind === "ChipGroup") {
    const m = ee("div", "chips");
    for (const p of Ot(n.items)) m.appendChild(ee("span", "tag", p));
    return m;
  }
  if (e.kind === "Skeleton") {
    const m = ee("div", "skeletons");
    for (let p = 0; p < (Ye(n.rows) || 3); p += 1) m.appendChild(ee("i", "skeleton"));
    return m;
  }
  if (e.kind === "Icon") {
    const m = ee("span", "icon");
    return yc(m, n.name, { size: Ye(n.size) || 16 }), m;
  }
  if (e.kind === "JsonDebug") {
    const m = ee("details");
    return m.append(
      ee("summary", "", be(n.label) || "Debug JSON"),
      ee("pre", "code", JSON.stringify(n.data == null ? n : n.data, null, 2))
    ), m;
  }
  if (e.kind === "KpiBoard") {
    const m = ee("div", "stack");
    n.title && m.appendChild(ee("div", "card-title", n.title));
    const p = ee("div", "grid");
    return sn(p, Xe("KpiBoard", n)), zt(p, r, t), m.appendChild(p), m;
  }
  if (!Object.prototype.hasOwnProperty.call(ka, e.kind))
    return ee("div", "unknown-component", `Unknown component: ${be(e.kind)}`);
  const a = ee("div", ka[e.kind]);
  return sn(a, Xe(e.kind, n)), e.kind === "Card" && n.title && a.appendChild(ee("div", "card-title", n.title)), e.kind === "Card" && n.subtitle && a.appendChild(ee("div", "muted small card-subtitle", n.subtitle)), (e.kind === "Alert" || e.kind === "AlertCard" || e.kind === "Callout") && (n.title || n.message) ? (n.title && a.appendChild(ee("strong", "", n.title)), n.message && a.appendChild(ee("div", "", n.message))) : zt(a, r, t), a;
}
function Ta(e, t) {
  const n = Function.prototype.toString.call(e).replace(/^export\s+/, "").trim();
  if (!n.includes("{")) throw new Error(`cannot serialize ${t}`);
  return `var ${t} = (${n});`;
}
function Mc() {
  return `(function () {
  "use strict";
  ${Ta(mr, "resolveChartModel")}
  ${Ta(Il, "paintChartElement")}
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
function Lc(e, t = {}, n = { sources: {}, missing: [] }) {
  const r = ee("main");
  return r.id = "genui-root", r.appendChild(fr(e, {
    values: t,
    media: n.sources || {},
    missing: new Set(n.missing || [])
  })), r;
}
function Pl(e, t = {}, n = { sources: {}, missing: [] }, r = "GenUI") {
  const a = Lc(e, t, n);
  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${$c(String(r || "GenUI").slice(0, 120))}</title>
  <style>
    :root { color-scheme: light; }
    html, body { margin: 0; padding: 0; background: #f5f7fa; color: #1f2329; }
    body { padding: 24px; font-family: system-ui, -apple-system, "Segoe UI", sans-serif; }
    *, *::before, *::after { box-sizing: border-box; }
    ${Ac}
  </style>
</head>
<body>${a.outerHTML}
<script id="genui-values-data" type="application/json">${zc(t)}<\/script>
<script>${Mc()}<\/script></body>
</html>`;
}
function Rl(e, t) {
  const n = document.createElement("a");
  n.download = t, n.href = e, n.click();
}
async function Bc(e, t) {
  const { toPng: n } = await Promise.resolve().then(() => xu), r = await n(e, {
    cacheBust: !0,
    pixelRatio: Math.min(window.devicePixelRatio || 1, 2),
    backgroundColor: "#ffffff"
  });
  Rl(r, `${t}.png`), console.info("[ugsci.genui] PNG export created", { filename: t, via: "html-to-image" });
}
function Uc(e) {
  return new Promise((t, n) => {
    const r = new FileReader();
    r.onload = () => t(String(r.result || "")), r.onerror = () => n(r.error || new Error("media encoding failed")), r.readAsDataURL(e);
  });
}
async function jc(e) {
  const t = e.currentSrc || e.src;
  if (!t) return null;
  if (t.startsWith("data:")) return t;
  try {
    const n = await fetch(t);
    return n.ok ? await Uc(await n.blob()) : null;
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
async function Ol(e) {
  const t = {}, n = [], r = Array.from(e.querySelectorAll("img[data-genui-media-source]"));
  return await Promise.all(r.map(async (a) => {
    const l = a.dataset.genuiMediaSource || "", i = await jc(a);
    l && (i ? t[l] = i : n.push(l));
  })), { sources: t, missing: Array.from(new Set(n)) };
}
async function Nc(e, t, n, r, a = r) {
  const l = await Ol(e), i = Pl(t, n, l, a), s = new Blob([i], { type: "text/html;charset=utf-8" }), o = URL.createObjectURL(s);
  Rl(o, `${r}.html`), setTimeout(() => URL.revokeObjectURL(o), 1e3), l.missing.length && console.warn("[ugsci.genui] HTML export has media that could not be embedded", { filename: r, missing: l.missing }), console.info("[ugsci.genui] HTML export created", { filename: r, bytes: s.size, embeddedMedia: Object.keys(l.sources).length, missingMedia: l.missing.length });
}
async function Dc(e, t, n, r) {
  const a = await Ol(e), l = Pl(t, n, a, r), i = window.open("", "_blank", "noopener,noreferrer");
  if (!i) throw new Error("print window was blocked");
  i.document.open(), i.document.write(l), i.document.close(), await new Promise((s) => {
    const o = () => s();
    if (i.document.readyState === "complete") {
      window.setTimeout(o, 50);
      return;
    }
    i.addEventListener("load", o, { once: !0 }), window.setTimeout(o, 400);
  }), i.focus(), i.print(), i.close(), a.missing.length && console.warn("[ugsci.genui] PDF print has media that could not be embedded", { missing: a.missing });
}
const He = "var(--ant-color-text, rgba(0, 0, 0, 0.88))", De = "var(--ant-color-text-secondary, rgba(0, 0, 0, 0.45))", wt = "var(--ant-color-border-secondary, #f0f0f0)", Yn = "var(--ant-color-bg-container, #fff)", Qn = "var(--ant-color-fill-quaternary, rgba(0, 0, 0, 0.02))", Ml = "var(--ant-color-success, #52c41a)", Fc = "var(--ant-color-success-bg, #f6ffed)", Gc = "var(--ant-color-warning, #faad14)", Hc = "var(--ant-color-warning-bg, #fffbe6)", Ll = "var(--ant-color-error, #ff4d4f)", Wc = "var(--ant-color-error-bg, #fff2f0)", _a = "var(--ant-color-primary, #1677ff)", qc = {
  derived_expression: "推导结果",
  effective_inventory: "有效库存",
  estimated_ogip: "估算原始储量",
  initial_p_over_z: "初始 p/z",
  current_p_over_z: "当前 p/z",
  recovery_factor: "采收率",
  remaining_gas: "剩余气量",
  result: "计算结果",
  transformed_expression: "变换结果"
}, Bl = {
  current_pressure: "当前压力",
  current_z_factor: "当前 z 因子",
  initial_pressure: "初始压力",
  initial_z_factor: "初始 z 因子",
  produced_gas: "累计产气量"
};
function qt(e) {
  return qc[e] || Bl[e] || e.replace(/[_.-]+/g, " ").replace(/\b\w/g, (t) => t.toUpperCase());
}
function Vc(e, t = "") {
  if (!Number.isFinite(e)) return String(e);
  if (/(factor|fraction|efficiency|ratio|rate)$/i.test(t) && Math.abs(e) <= 1)
    return `${new Intl.NumberFormat("zh-CN", {
      maximumFractionDigits: 2
    }).format(e * 100)}%`;
  const n = Math.abs(e);
  return n >= 1e9 || n > 0 && n < 1e-4 ? e.toExponential(4) : new Intl.NumberFormat("zh-CN", {
    maximumSignificantDigits: 7
  }).format(e);
}
function yn(e, t = "") {
  if (typeof e == "number") return Vc(e, t);
  if (typeof e == "boolean") return e ? "是" : "否";
  if (e == null) return "—";
  if (typeof e == "string") return e;
  try {
    return JSON.stringify(e);
  } catch {
    return String(e);
  }
}
function Ia(e) {
  const t = [
    "result",
    "estimated_ogip",
    "effective_inventory",
    "derived_expression",
    "transformed_expression",
    "remaining_gas",
    "recovery_factor"
  ], n = t.indexOf(e);
  return n < 0 ? t.length : n;
}
function Jc(e) {
  const t = e == null ? void 0 : e.result;
  return !t || typeof t != "object" || Array.isArray(t) ? [] : Object.entries(t).filter(
    ([, n]) => ["string", "number", "boolean"].includes(typeof n)
  ).sort(([n], [r]) => Ia(n) - Ia(r)).slice(0, 4).map(([n, r]) => {
    var a;
    return {
      key: n,
      label: qt(n),
      value: yn(r, n),
      unit: String(((a = e == null ? void 0 : e.units) == null ? void 0 : a[n]) || "")
    };
  });
}
function Kc(e) {
  var r, a;
  const t = Array.isArray((r = e == null ? void 0 : e.trace) == null ? void 0 : r.steps) ? e.trace.steps : [], n = t.find(
    (l) => (l == null ? void 0 : l.operation) === "solve" && ((l == null ? void 0 : l.unicode) || (l == null ? void 0 : l.expression))
  ) || t.find(
    (l) => (l == null ? void 0 : l.group) === "assemble" && ((l == null ? void 0 : l.unicode) || (l == null ? void 0 : l.expression))
  ) || t.find((l) => (l == null ? void 0 : l.unicode) || (l == null ? void 0 : l.expression));
  return String(
    (n == null ? void 0 : n.unicode) || (n == null ? void 0 : n.expression) || ((a = e == null ? void 0 : e.trace) == null ? void 0 : a.symbols) || (e == null ? void 0 : e.method) || "—"
  );
}
function Xc(e) {
  var r, a;
  const t = Array.isArray((r = e == null ? void 0 : e.trace) == null ? void 0 : r.variables) ? e.trace.variables.filter((l) => (l == null ? void 0 : l.source) === "input") : [];
  if (t.length)
    return t.slice(0, 8).map((l) => ({
      name: String(l.name || ""),
      label: String(
        Bl[String(l.name || "")] || l.display_name || qt(String(l.name || "参数"))
      ),
      value: `${yn(l.value, l.name)}${l.unit ? ` ${l.unit}` : ""}`,
      source: "用户输入"
    }));
  const n = ((a = e == null ? void 0 : e.provenance) == null ? void 0 : a.parameter_sources) || {};
  return Object.entries(n).filter(([, l]) => (l == null ? void 0 : l.source) === "user_input").slice(0, 8).map(([l, i]) => ({
    name: l,
    label: qt(l),
    value: `${yn(i == null ? void 0 : i.value, l)}${i != null && i.unit ? ` ${i.unit}` : ""}`,
    source: "用户输入"
  }));
}
function Tn(e) {
  var d, u, m, p;
  const t = (e == null ? void 0 : e.provenance) || {}, n = t.unit_audit, r = Object.values((n == null ? void 0 : n.per_symbol) || {}), a = typeof (n == null ? void 0 : n.ok) == "boolean" ? n.ok : null, l = t.source || ((d = e == null ? void 0 : e.trace) == null ? void 0 : d.source), i = Array.isArray(e == null ? void 0 : e.warnings) ? e.warnings.map(String) : [];
  let s = "success", o = "公式与单位已核验", c = "公式匹配、参数完整，计算证据链可追溯。";
  return a === !1 ? (s = "error", o = "单位检查未通过", c = "结果使用前需要修正单位不一致项。") : l === "freeform" ? (s = "warning", o = "AI 推导 · 建议复核", c = "符号步骤已通过安全校验，但公式并非审定公式库来源。") : i.length ? (s = "warning", o = "计算完成 · 存在提醒", c = "核心计算已完成，请同时阅读警告和适用条件。") : a === null && (o = "计算证据链已记录", c = "推导步骤和参数来源可追溯；此记录没有逐项单位审计。"), {
    title: ((u = e == null ? void 0 : e.trace) == null ? void 0 : u.formula_name) || ((m = e == null ? void 0 : e.trace) == null ? void 0 : m.title) || (e == null ? void 0 : e.operation) || "UGSci 数学计算",
    formula: Kc(e),
    trustLabel: o,
    trustDetail: c,
    trustTone: s,
    results: Jc(e),
    inputs: Xc(e),
    boundaries: [
      ...Array.isArray(e == null ? void 0 : e.applicability) ? e.applicability : [],
      ...Array.isArray(e == null ? void 0 : e.assumptions) ? e.assumptions : []
    ].map(String),
    warnings: i,
    stepCount: Array.isArray((p = e == null ? void 0 : e.trace) == null ? void 0 : p.steps) ? e.trace.steps.length : 0,
    passedGateCount: Array.isArray(t.gate) ? t.gate.length : 0,
    unitCheckCount: r.length,
    unitAuditOk: a
  };
}
function Yc(e) {
  return e === "error" ? { color: Ll, background: Wc } : e === "warning" ? { color: Gc, background: Hc } : { color: Ml, background: Fc };
}
function pt({ children: e }) {
  return C().React.createElement(
    "div",
    { style: { fontWeight: 600, color: He, marginBottom: 8 } },
    e
  );
}
function gr({
  payload: e,
  onOpenDerivation: t,
  onOpenEvidence: n,
  onReplay: r,
  compact: a = !1
}) {
  const l = C().React, i = Tn(e), s = Yc(i.trustTone), o = i.results[0], c = i.results.slice(1, a ? 2 : 4);
  return l.createElement(
    "div",
    { style: { display: "grid", gap: a ? 9 : 14 } },
    l.createElement(
      "div",
      {
        style: {
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 8,
          flexWrap: "wrap"
        }
      },
      l.createElement(
        "div",
        null,
        l.createElement(
          "div",
          { style: { color: De, fontSize: 12, marginBottom: 3 } },
          a ? "计算摘要" : i.title
        ),
        o ? l.createElement(
          "div",
          {
            style: {
              display: "flex",
              alignItems: "baseline",
              gap: 6,
              flexWrap: "wrap"
            }
          },
          l.createElement(
            "strong",
            {
              style: {
                color: He,
                fontSize: a ? 22 : 28,
                fontWeight: 600,
                overflowWrap: "anywhere"
              }
            },
            o.value
          ),
          o.unit ? l.createElement(
            "span",
            { style: { color: De, fontSize: 13 } },
            o.unit
          ) : null
        ) : l.createElement(
          "strong",
          { style: { color: He } },
          "计算已完成"
        ),
        o ? l.createElement(
          "div",
          { style: { color: De, fontSize: 12, marginTop: 3 } },
          o.label
        ) : null
      ),
      l.createElement(
        "span",
        {
          style: {
            display: "inline-flex",
            alignItems: "center",
            gap: 5,
            borderRadius: 999,
            padding: "4px 8px",
            color: s.color,
            background: s.background,
            fontSize: 12,
            whiteSpace: "nowrap"
          }
        },
        i.trustTone === "success" ? "✓" : "!",
        i.trustLabel
      )
    ),
    l.createElement(
      "p",
      {
        style: {
          margin: 0,
          color: a ? De : He,
          fontSize: 13,
          lineHeight: 1.65
        }
      },
      i.trustDetail
    ),
    c.length ? l.createElement(
      "div",
      {
        style: {
          display: "grid",
          gap: 6,
          paddingTop: 10,
          borderTop: `1px solid ${wt}`
        }
      },
      ...c.map(
        (d) => l.createElement(
          "div",
          {
            key: d.key,
            style: {
              display: "flex",
              justifyContent: "space-between",
              gap: 12,
              fontSize: 12
            }
          },
          l.createElement(
            "span",
            { style: { color: De } },
            d.label
          ),
          l.createElement(
            "span",
            { style: { color: He, textAlign: "right" } },
            `${d.value}${d.unit ? ` ${d.unit}` : ""}`
          )
        )
      )
    ) : null,
    a ? null : l.createElement(
      "div",
      {
        style: {
          display: "grid",
          gap: 7,
          paddingTop: 10,
          borderTop: `1px solid ${wt}`,
          fontSize: 12
        }
      },
      l.createElement(
        "div",
        {
          style: {
            display: "grid",
            gridTemplateColumns: "72px 1fr",
            gap: 8
          }
        },
        l.createElement(
          "span",
          { style: { color: De } },
          "使用公式"
        ),
        l.createElement(
          "code",
          { style: { color: He, overflowWrap: "anywhere" } },
          i.formula
        )
      ),
      l.createElement(
        "div",
        {
          style: {
            display: "grid",
            gridTemplateColumns: "72px 1fr",
            gap: 8
          }
        },
        l.createElement(
          "span",
          { style: { color: De } },
          "关键输入"
        ),
        l.createElement(
          "span",
          { style: { color: He } },
          i.inputs.length ? i.inputs.slice(0, 5).map((d) => `${d.label}=${d.value}`).join("；") : "未提供可展示的输入摘要"
        )
      ),
      l.createElement(
        "div",
        {
          style: {
            display: "grid",
            gridTemplateColumns: "72px 1fr",
            gap: 8
          }
        },
        l.createElement(
          "span",
          { style: { color: De } },
          "适用条件"
        ),
        l.createElement(
          "span",
          { style: { color: He } },
          i.boundaries.slice(0, 2).join("；") || "未声明额外适用条件"
        )
      )
    ),
    l.createElement(
      "div",
      { style: { display: "flex", gap: 8, flexWrap: "wrap" } },
      t ? l.createElement(
        "button",
        {
          type: "button",
          onClick: t,
          style: {
            border: `1px solid ${_a}`,
            borderRadius: 7,
            padding: "6px 10px",
            background: _a,
            color: "var(--ant-color-text-light-solid, #fff)",
            cursor: "pointer"
          }
        },
        "查看推导"
      ) : null,
      n ? l.createElement(
        "button",
        {
          type: "button",
          onClick: n,
          style: {
            border: `1px solid ${wt}`,
            borderRadius: 7,
            padding: "6px 10px",
            background: Yn,
            color: He,
            cursor: "pointer"
          }
        },
        "证据与来源"
      ) : null,
      r ? l.createElement(
        "button",
        {
          type: "button",
          onClick: r,
          style: {
            border: `1px solid ${wt}`,
            borderRadius: 7,
            padding: "6px 10px",
            background: Yn,
            color: He,
            cursor: "pointer"
          }
        },
        "复现计算"
      ) : null
    )
  );
}
function Qc({ payload: e }) {
  const t = C().React, n = Tn(e);
  return t.createElement(
    "div",
    { style: { display: "grid", gap: 18 } },
    t.createElement(
      "section",
      null,
      t.createElement(pt, null, "你最需要知道的"),
      t.createElement(
        "p",
        { style: { margin: 0, color: He, fontSize: 13, lineHeight: 1.7 } },
        `本次使用 ${n.title}，读取 ${n.inputs.length} 项输入，记录 ${n.stepCount} 个推导步骤`,
        n.passedGateCount ? `，并通过 ${n.passedGateCount} 项计算校验。` : "。"
      )
    ),
    t.createElement(
      "section",
      null,
      t.createElement(pt, null, "边界与提醒"),
      n.boundaries.length || n.warnings.length ? t.createElement(
        "ul",
        {
          style: {
            margin: 0,
            paddingLeft: 18,
            color: De,
            fontSize: 12,
            lineHeight: 1.7
          }
        },
        ...[...n.warnings, ...n.boundaries].slice(0, 4).map(
          (r, a) => t.createElement("li", { key: `${a}:${r}` }, r)
        )
      ) : t.createElement(
        "p",
        { style: { margin: 0, color: De, fontSize: 12 } },
        "未声明额外边界条件。"
      )
    )
  );
}
function Zc({ payload: e }) {
  var s, o, c;
  const t = C().React, n = Tn(e), r = (e == null ? void 0 : e.provenance) || {}, a = Object.entries(((s = r == null ? void 0 : r.unit_audit) == null ? void 0 : s.per_symbol) || {}), l = Object.entries((r == null ? void 0 : r.parameter_sources) || {}), i = (d, u, m = d) => t.createElement(
    "div",
    {
      key: m,
      style: {
        display: "grid",
        gridTemplateColumns: "90px minmax(0, 1fr)",
        gap: 10,
        padding: "8px 0",
        borderBottom: `1px solid ${wt}`,
        fontSize: 12
      }
    },
    t.createElement("span", { style: { color: De } }, d),
    t.createElement(
      "span",
      { style: { color: He, overflowWrap: "anywhere" } },
      u || "—"
    )
  );
  return t.createElement(
    "div",
    { style: { display: "grid", gap: 18 } },
    t.createElement(
      "section",
      null,
      t.createElement(pt, null, "公式身份"),
      i("公式来源", r.reference || n.title),
      i(
        "公式版本",
        `${r.formula_id || ((o = e == null ? void 0 : e.trace) == null ? void 0 : o.formula_id) || "—"} · ${r.formula_version || ((c = e == null ? void 0 : e.trace) == null ? void 0 : c.formula_version) || "—"}`
      ),
      i(
        "信任类型",
        r.source === "freeform" ? "AI 自由推导" : "UGSci 审定公式"
      )
    ),
    t.createElement(
      "section",
      null,
      t.createElement(
        pt,
        null,
        `参数来源（${l.length}）`
      ),
      l.length ? t.createElement(
        "div",
        { style: { display: "grid" } },
        ...l.map(
          ([d, u]) => i(
            qt(d),
            `${(u == null ? void 0 : u.source) === "user_input" ? "用户输入" : "推导生成"} · ${yn(u == null ? void 0 : u.value, d)}${u != null && u.unit ? ` ${u.unit}` : ""}`,
            d
          )
        )
      ) : t.createElement(
        "p",
        { style: { margin: 0, color: De, fontSize: 12 } },
        "没有参数来源记录。"
      )
    ),
    t.createElement(
      "section",
      null,
      t.createElement(
        pt,
        null,
        `单位审计（${n.unitCheckCount} 项）`
      ),
      t.createElement(
        "div",
        {
          style: {
            color: n.unitAuditOk === !1 ? Ll : n.unitAuditOk === !0 ? Ml : De,
            fontSize: 12,
            marginBottom: a.length ? 8 : 0
          }
        },
        n.unitAuditOk === !1 ? "存在不一致单位" : n.unitAuditOk === !0 ? "全部单位一致" : "此结果没有单位审计数据"
      ),
      a.length ? t.createElement(
        "details",
        null,
        t.createElement(
          "summary",
          { style: { cursor: "pointer", color: De, fontSize: 12 } },
          "查看逐项单位检查"
        ),
        t.createElement(
          "div",
          { style: { marginTop: 6 } },
          ...a.map(
            ([d, u]) => i(
              qt(d),
              `${u != null && u.ok ? "✓" : "✗"} ${(u == null ? void 0 : u.actual) || "无量纲"} → ${(u == null ? void 0 : u.expected) || "—"}`,
              `unit:${d}`
            )
          )
        )
      ) : null
    ),
    Array.isArray(r.gate) && r.gate.length ? t.createElement(
      "section",
      null,
      t.createElement(pt, null, "通过的计算校验"),
      t.createElement(
        "ul",
        {
          style: {
            margin: 0,
            paddingLeft: 18,
            color: De,
            fontSize: 12,
            lineHeight: 1.7
          }
        },
        ...r.gate.map(
          (d, u) => t.createElement(
            "li",
            { key: `${u}:${d}` },
            String(d)
          )
        )
      )
    ) : null,
    r.replay_token ? t.createElement(
      "section",
      null,
      t.createElement(pt, null, "复现身份"),
      t.createElement(
        "code",
        {
          style: {
            display: "block",
            padding: 10,
            borderRadius: 8,
            background: Qn,
            color: De,
            fontSize: 11,
            overflowWrap: "anywhere"
          }
        },
        String(
          r.input_fingerprint || r.replay_token
        ).slice(0, 96)
      )
    ) : null
  );
}
function ed({ payload: e }) {
  const t = C().React, n = Tn(e), [r, a] = t.useState(!1), l = e == null ? void 0 : e.replay, i = [
    [n.stepCount, "计算步骤"],
    [n.passedGateCount, "校验通过"],
    [(l == null ? void 0 : l.elapsedMs) != null ? `${l.elapsedMs} ms` : "—", "复现耗时"]
  ];
  return t.createElement(
    "div",
    { style: { display: "grid", gap: 12 } },
    t.createElement(
      "div",
      {
        style: {
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(90px, 1fr))",
          gap: 8
        }
      },
      ...i.map(
        ([s, o]) => t.createElement(
          "div",
          {
            key: String(o),
            style: { padding: 10, borderRadius: 8, background: Qn }
          },
          t.createElement(
            "strong",
            { style: { display: "block", color: He } },
            String(s)
          ),
          t.createElement(
            "span",
            { style: { color: De, fontSize: 11 } },
            String(o)
          )
        )
      )
    ),
    t.createElement(
      "button",
      {
        type: "button",
        onClick: () => a(!r),
        "aria-expanded": r,
        style: {
          justifySelf: "start",
          border: `1px solid ${wt}`,
          borderRadius: 7,
          padding: "6px 10px",
          background: Yn,
          color: He,
          cursor: "pointer"
        }
      },
      r ? "隐藏原始日志" : "显示原始日志"
    ),
    r ? t.createElement(
      "pre",
      {
        style: {
          margin: 0,
          padding: 12,
          borderRadius: 8,
          background: Qn,
          color: De,
          whiteSpace: "pre-wrap",
          overflowWrap: "anywhere",
          fontSize: 11,
          lineHeight: 1.55
        }
      },
      JSON.stringify(e, null, 2)
    ) : t.createElement(
      "p",
      { style: { margin: 0, color: De, fontSize: 12 } },
      "原始运行数据默认隐藏，需要诊断或审计时再展开。"
    )
  );
}
const td = 128;
let Zn = [], Ul = "";
const er = /* @__PURE__ */ new Set(), jl = () => er.forEach((e) => e()), Nl = (e) => (er.add(e), () => er.delete(e)), Aa = () => Zn;
function yr(e) {
  return !!(e && typeof e == "object" && e.trace && Array.isArray(e.trace.steps) && e.provenance && (e.operation || e.trace.formula_id));
}
function nd(e) {
  if (!e || typeof e != "object" || !e.replay_id || !e.status || !yr(e.result))
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
function hr(e, t) {
  var a, l, i, s, o;
  if (!yr(e)) return null;
  const n = (a = e.replay) != null && a.replayId ? `replay:${e.replay.replayId}` : `${((l = e.trace) == null ? void 0 : l.formula_id) || "derivation"}:${((i = e.provenance) == null ? void 0 : i.input_fingerprint) || e.operation || crypto.randomUUID()}`, r = {
    uiId: n,
    sessionId: t || ((o = (s = C()).getCurrentSessionId) == null ? void 0 : o.call(s)) || "",
    payload: e,
    updatedAt: Date.now()
  };
  return Zn = [r, ...Zn.filter((c) => c.uiId !== n)].slice(
    0,
    td
  ), jl(), r;
}
function Er(e) {
  Ul = e, jl();
}
function rd() {
  return C().React.useSyncExternalStore(
    Nl,
    () => Ul,
    () => ""
  );
}
function Dl(e) {
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
    const a = nd(r);
    if (a) {
      t.push(a);
      return;
    }
    yr(r) && t.push(r), Object.values(r).forEach(n);
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
function ad(e, t) {
  Dl(e).forEach(
    (n) => hr(n, t)
  );
}
function ld(e) {
  const t = C().React, n = t.useSyncExternalStore(Nl, Aa, Aa);
  return t.useMemo(
    () => n.filter((r) => r.sessionId === e),
    [n, e]
  );
}
const od = [], xt = /* @__PURE__ */ new Map();
function id(e) {
  xt.set(e, (xt.get(e) || 0) + 1);
}
function sd(e) {
  const t = (xt.get(e) || 1) - 1;
  t > 0 ? xt.set(e, t) : xt.delete(e);
}
function cd(e) {
  return (xt.get(e) || 0) > 0;
}
function $a(e) {
  const t = [], n = (r) => {
    t.push(r);
    for (const a of r.children || []) n(a);
  };
  return n(e), t;
}
function dd(e) {
  var c, d;
  const t = $a(e), n = String(
    ((d = (c = t.find(
      (u) => {
        var m;
        return u.kind === "Heading" && Number((m = u.props) == null ? void 0 : m.level) === 2;
      }
    )) == null ? void 0 : c.props) == null ? void 0 : d.value) || "公式计算"
  ), r = t.some(
    (u) => {
      var m;
      return u.kind === "Alert" && String(((m = u.props) == null ? void 0 : m.severity) || "") === "warning";
    }
  ), a = t.filter((u) => u.kind === "MetricCard").map((u) => {
    var m, p;
    return {
      label: String(((m = u.props) == null ? void 0 : m.title) || "结果"),
      value: String(((p = u.props) == null ? void 0 : p.value) ?? "—")
    };
  }), l = t.filter((u) => u.kind === "TableRow").map(
    (u) => (u.children || []).filter((m) => m.kind === "TableCell").map((m) => {
      var p;
      return String(((p = m.props) == null ? void 0 : p.value) ?? "");
    })
  ).filter((u) => u.length >= 4 && u[3] === "derived").map((u) => ({
    label: u[0] || "结果",
    value: [u[1], u[2]].filter(Boolean).join(" ")
  })).reverse(), i = t.filter((u) => u.kind === "NumberInput" || u.kind === "Slider").slice(0, 5).map(
    (u) => {
      var m, p, w;
      return `${String(((m = u.props) == null ? void 0 : m.label) || ((p = u.props) == null ? void 0 : p.name) || "输入")}=${String(
        ((w = u.props) == null ? void 0 : w.value) ?? "—"
      )}`;
    }
  ), s = t.filter((u) => u.kind === "AccordionItem").filter(
    (u) => {
      var m;
      return ["适用场景", "假设条件"].includes(String(((m = u.props) == null ? void 0 : m.header) || ""));
    }
  ).flatMap((u) => $a(u)).filter((u) => u.kind === "ListItem").map((u) => {
    var m;
    return String(((m = u.props) == null ? void 0 : m.value) || "");
  }).filter(Boolean).slice(0, 3), o = [...l, ...a].filter(
    (u, m, p) => p.findIndex(
      (w) => w.label === u.label && w.value === u.value
    ) === m
  );
  return { title: n, warning: r, inputs: i, conditions: s, results: o };
}
function ud({ data: e }) {
  var h, y;
  const t = (h = window.QwenPaw) == null ? void 0 : h.host, n = t == null ? void 0 : t.React;
  if (!n) return null;
  const r = Ws(), a = n.useRef(/* @__PURE__ */ new Map()), l = ((y = t.getCurrentSessionId) == null ? void 0 : y.call(t)) || "__current_chat__", i = Array.isArray(e.output) ? e.output : od, s = n.useMemo(
    () => wl(i),
    [i]
  ), o = n.useMemo(
    () => Dl(i),
    [i]
  );
  n.useEffect(() => {
    for (const f of s) {
      if (!f.ui_id || !f.tree) continue;
      const E = r.getSnapshot(l, f.ui_id);
      E && E.revision >= (f.revision || 1) || r.setSnapshot({
        schemaVersion: "1",
        uiId: f.ui_id,
        revision: f.revision || 1,
        tree: f.tree,
        sessionId: l,
        sourceToolCallId: f.tool_call_id,
        updatedAt: Date.now()
      });
    }
  }, [s, l]);
  const c = n.useMemo(
    () => s.filter((f) => f.kind === "genui" && !!f.ui_id).map((f) => f.ui_id),
    [s]
  ), d = c.join("\0");
  n.useEffect(() => {
    for (const f of c) id(f);
    return () => {
      for (const f of c) sd(f);
    };
  }, [d]);
  const u = n.useMemo(
    () => s.map((f) => f.ui_id).filter((f) => !!f),
    [s]
  ), p = qs(l, u).filter(
    (f) => (
      // Only include snapshots whose ui_id appears in this response's results
      s.some(
        (E) => E.ui_id === f.uiId && (E.kind === "genui" || E.kind === "genui_patch" && !cd(f.uiId))
      )
    )
  ).sort((f, E) => f.updatedAt - E.updatedAt);
  if (o.length > 0)
    return n.createElement(
      "div",
      {
        className: "qwenpaw-genui-inline qwenpaw-derivation-inline",
        style: { marginTop: 8, marginBottom: 8, display: "grid", gap: 8 }
      },
      ...o.map(
        (f, E) => {
          var v, g;
          return n.createElement(
            "div",
            {
              key: String(
                ((v = f.provenance) == null ? void 0 : v.replay_token) || ((g = f.trace) == null ? void 0 : g.formula_id) || E
              ),
              style: {
                border: "1px solid var(--ant-color-border-secondary, #f0f0f0)",
                borderRadius: 12,
                padding: 12,
                background: "var(--ant-color-bg-container, #fff)"
              }
            },
            n.createElement(gr, {
              payload: f,
              compact: !0,
              onOpenDerivation: () => {
                const x = hr(f, l);
                x != null && x.uiId && Er(x.uiId), window.dispatchEvent(
                  new CustomEvent("qwenpaw:open-compute-workbench", {
                    detail: { uiId: x == null ? void 0 : x.uiId }
                  })
                );
              }
            })
          );
        }
      )
    );
  if (p.length === 0) return null;
  const w = (f) => n.createElement(
    "div",
    {
      key: Ct(f.sessionId, f.uiId),
      className: "qwenpaw-genui-tree",
      "data-genui-id": f.uiId,
      style: {
        border: "1px solid var(--ant-color-border-secondary, #f0f0f0)",
        borderRadius: 12,
        padding: 16,
        marginBottom: 8,
        background: "var(--ant-color-bg-container, #fff)"
      },
      ref: (E) => {
        E && (E.__genuiId = f.uiId);
      }
    },
    n.createElement(
      "div",
      { className: "qwenpaw-genui-export-target" },
      n.createElement(hc, {
        node: f.tree.root,
        onValuesChange: (E) => a.current.set(f.uiId, E),
        children: n.createElement(Cc, {
          node: f.tree.root
        })
      })
    ),
    n.createElement(
      "div",
      {
        style: {
          display: "flex",
          justifyContent: "flex-end",
          gap: 6,
          marginTop: 8
        }
      },
      n.createElement(
        "button",
        {
          type: "button",
          title: "导出 PNG",
          onClick: (E) => {
            var g;
            const v = (g = E.currentTarget.closest(".qwenpaw-genui-tree")) == null ? void 0 : g.querySelector(
              ".qwenpaw-genui-export-target"
            );
            v && Bc(v, f.uiId).catch(
              (x) => console.warn("[ugsci.genui] PNG export failed", x)
            );
          }
        },
        "PNG"
      ),
      n.createElement(
        "button",
        {
          type: "button",
          title: "打印或另存为 PDF",
          onClick: (E) => {
            var g;
            const v = (g = E.currentTarget.closest(".qwenpaw-genui-tree")) == null ? void 0 : g.querySelector(
              ".qwenpaw-genui-export-target"
            );
            v && Dc(
              v,
              f.tree.root,
              a.current.get(f.uiId) || {},
              f.uiId
            ).catch(
              (x) => console.warn("[ugsci.genui] PDF print failed", x)
            );
          }
        },
        "PDF"
      ),
      n.createElement(
        "button",
        {
          type: "button",
          title: "导出 HTML",
          onClick: (E) => {
            var g;
            const v = (g = E.currentTarget.closest(".qwenpaw-genui-tree")) == null ? void 0 : g.querySelector(
              ".qwenpaw-genui-export-target"
            );
            v && Nc(
              v,
              f.tree.root,
              a.current.get(f.uiId) || {},
              f.uiId,
              f.uiId
            ).catch(
              (x) => console.warn("[ugsci.genui] HTML export failed", x)
            );
          }
        },
        "HTML"
      )
    )
  );
  return n.createElement(
    "div",
    {
      className: "qwenpaw-genui-inline",
      style: { marginTop: 8, marginBottom: 8 }
    },
    ...p.map((f) => {
      if (!f.uiId.startsWith("ui_trc_")) return w(f);
      const E = dd(f.tree.root), v = E.results[0] || {
        label: "计算结果",
        value: "已完成"
      };
      return n.createElement(
        "div",
        {
          key: Ct(f.sessionId, f.uiId),
          className: "qwenpaw-derivation-inline",
          "data-trace-ui-id": f.uiId,
          style: {
            border: "1px solid var(--ant-color-border-secondary, #f0f0f0)",
            borderRadius: 12,
            padding: 12,
            marginBottom: 8,
            display: "grid",
            gap: 10,
            background: "var(--ant-color-bg-container, #fff)"
          }
        },
        n.createElement(
          "div",
          {
            style: {
              display: "flex",
              justifyContent: "space-between",
              gap: 12,
              alignItems: "flex-start",
              flexWrap: "wrap"
            }
          },
          n.createElement(
            "div",
            { style: { minWidth: 0 } },
            n.createElement(
              "div",
              {
                style: {
                  color: "var(--ant-color-text-secondary, rgba(0,0,0,.45))",
                  fontSize: 12
                }
              },
              E.title
            ),
            n.createElement(
              "strong",
              {
                style: {
                  display: "block",
                  marginTop: 2,
                  fontSize: 22,
                  color: "var(--ant-color-text, rgba(0,0,0,.88))",
                  overflowWrap: "anywhere"
                }
              },
              v.value
            ),
            n.createElement(
              "span",
              {
                style: {
                  color: "var(--ant-color-text-secondary, rgba(0,0,0,.45))",
                  fontSize: 12
                }
              },
              v.label
            )
          ),
          n.createElement(
            "span",
            {
              style: {
                borderRadius: 999,
                padding: "4px 8px",
                fontSize: 12,
                color: E.warning ? "var(--ant-color-warning, #faad14)" : "var(--ant-color-success, #52c41a)",
                background: E.warning ? "var(--ant-color-warning-bg, #fffbe6)" : "var(--ant-color-success-bg, #f6ffed)"
              }
            },
            E.warning ? "需要人工复核" : "✓ 公式与单位已核验"
          )
        ),
        E.results.length > 1 ? n.createElement(
          "div",
          {
            style: {
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
              gap: 8
            }
          },
          ...E.results.slice(1, 4).map(
            (g) => n.createElement(
              "div",
              {
                key: `${g.label}:${g.value}`,
                style: {
                  padding: 8,
                  borderRadius: 8,
                  background: "var(--ant-color-fill-quaternary, rgba(0,0,0,.02))"
                }
              },
              n.createElement(
                "div",
                {
                  style: {
                    color: "var(--ant-color-text-secondary, rgba(0,0,0,.45))",
                    fontSize: 11
                  }
                },
                g.label
              ),
              n.createElement("strong", null, g.value)
            )
          )
        ) : null,
        E.inputs.length ? n.createElement(
          "div",
          {
            style: {
              color: "var(--ant-color-text-secondary, rgba(0,0,0,.45))",
              fontSize: 12,
              lineHeight: 1.6
            }
          },
          `关键输入：${E.inputs.join("；")}`
        ) : null,
        E.conditions.length ? n.createElement(
          "div",
          {
            style: {
              color: "var(--ant-color-text-secondary, rgba(0,0,0,.45))",
              fontSize: 12,
              lineHeight: 1.6
            }
          },
          `适用条件：${E.conditions.join("；")}`
        ) : null,
        n.createElement(
          "details",
          null,
          n.createElement(
            "summary",
            {
              style: {
                cursor: "pointer",
                color: "var(--ant-color-primary, #1677ff)",
                fontSize: 13,
                fontWeight: 600
              }
            },
            "查看推导"
          ),
          n.createElement(
            "div",
            { style: { marginTop: 10 } },
            w(f)
          )
        )
      );
    })
  );
}
function md({ payload: e }) {
  var s, o;
  const t = C().React, n = ((s = e == null ? void 0 : e.trace) == null ? void 0 : s.variables) || [], r = ((o = e == null ? void 0 : e.trace) == null ? void 0 : o.steps) || [], a = [
    ...n.map((c, d) => ({
      id: c.name,
      label: c.symbol || c.name,
      x: 20,
      y: 30 + d * 54,
      kind: "variable"
    })),
    ...r.map((c, d) => ({
      id: c.id,
      label: c.title,
      x: 380,
      y: 30 + d * 54,
      kind: "step",
      step: c
    }))
  ], l = new Map(a.map((c) => [c.id, c])), i = [];
  for (const c of r) {
    for (const d of c.reads || [])
      l.has(d) && i.push({ from: d, to: c.id });
    c.writes && l.has(c.writes) && i.push({ from: c.id, to: c.writes });
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
        t.createElement("path", {
          d: "M0,0 L0,6 L8,3 z",
          fill: "var(--ant-color-text-quaternary, #bfbfbf)"
        })
      )
    ),
    ...i.map((c, d) => {
      const u = l.get(c.from), m = l.get(c.to);
      return t.createElement("line", {
        key: `e${d}`,
        x1: u.x + 155,
        y1: u.y + 16,
        x2: m.x,
        y2: m.y + 16,
        stroke: "var(--ant-color-border, #d9d9d9)",
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
          fill: c.kind === "variable" ? "var(--ant-color-primary-bg, #e6f4ff)" : "var(--ant-color-fill-quaternary, #fafafa)",
          stroke: "var(--ant-color-border, #d9d9d9)"
        }),
        t.createElement(
          "text",
          {
            x: 8,
            y: 20,
            fill: "var(--ant-color-text, rgba(0,0,0,.88))",
            fontSize: 11
          },
          `${c.id} · ${String(c.label).slice(0, 18)}`
        )
      )
    )
  );
}
function pd({
  payload: e,
  compact: t = !1
}) {
  var c;
  const n = C().React, [r, a] = n.useState(!t), l = ((c = e == null ? void 0 : e.trace) == null ? void 0 : c.steps) || [], i = l.filter(
    (d) => d.kind !== "bind" || d.note !== "input"
  ), o = (r ? l : i).map(
    (d, u) => n.createElement(
      "article",
      {
        key: d.id,
        style: {
          display: "grid",
          gridTemplateColumns: "26px minmax(0, 1fr)",
          gap: 9,
          padding: "9px 0",
          borderBottom: "1px solid var(--ant-color-border-secondary, #f0f0f0)"
        }
      },
      n.createElement(
        "span",
        {
          style: {
            width: 24,
            height: 24,
            display: "grid",
            placeItems: "center",
            borderRadius: 999,
            background: "var(--ant-color-primary-bg, #e6f4ff)",
            color: "var(--ant-color-primary, #1677ff)",
            fontSize: 11
          }
        },
        u + 1
      ),
      n.createElement(
        "div",
        { style: { minWidth: 0 } },
        n.createElement(
          "strong",
          {
            style: {
              display: "block",
              color: "var(--ant-color-text, rgba(0,0,0,.88))",
              fontSize: 13
            }
          },
          d.title
        ),
        d.unicode || d.expression ? n.createElement(
          "code",
          {
            style: {
              display: "block",
              color: "var(--ant-color-text-secondary, rgba(0,0,0,.45))",
              fontSize: 11,
              marginTop: 4,
              overflowWrap: "anywhere"
            }
          },
          d.unicode || d.expression
        ) : null,
        d.value !== null && d.value !== void 0 ? n.createElement(
          "div",
          {
            style: {
              color: "var(--ant-color-text-secondary, rgba(0,0,0,.45))",
              fontSize: 11,
              marginTop: 3
            }
          },
          `${d.display_value ?? d.value} ${d.display_unit || d.unit || ""}`
        ) : null,
        d.description ? n.createElement(
          "div",
          {
            style: {
              color: "var(--ant-color-text-tertiary, rgba(0,0,0,.25))",
              fontSize: 11,
              marginTop: 3,
              lineHeight: 1.55
            }
          },
          d.description
        ) : null,
        d.kind === "assert" ? n.createElement(
          "span",
          {
            style: {
              display: "inline-block",
              color: d.value ? "var(--ant-color-success, #52c41a)" : "var(--ant-color-error, #ff4d4f)",
              fontSize: 11,
              marginTop: 4
            }
          },
          d.value ? "✓ 通过" : "✗ 失败"
        ) : null
      )
    )
  );
  return n.createElement(
    "div",
    { style: { display: "grid", gap: 8 } },
    ...o,
    t && l.length !== i.length ? n.createElement(
      "button",
      {
        type: "button",
        onClick: () => a((d) => !d),
        style: {
          justifySelf: "start",
          border: "1px solid var(--ant-color-border, #d9d9d9)",
          borderRadius: 7,
          padding: "5px 9px",
          background: "var(--ant-color-bg-container, #fff)",
          color: "var(--ant-color-text, rgba(0,0,0,.88))",
          cursor: "pointer"
        }
      },
      r ? "只看关键步骤" : `显示全部 ${l.length} 步`
    ) : null
  );
}
const cn = "var(--ant-color-text, rgba(0,0,0,.88))", jn = "var(--ant-color-text-secondary, rgba(0,0,0,.45))", za = "var(--ant-color-border, #d9d9d9)", Nn = "var(--ant-color-bg-container, #fff)", Pa = "var(--ant-color-primary, #1677ff)";
function fd() {
  var y, f, E;
  const e = C().React, t = ((f = (y = C()).getCurrentSessionId) == null ? void 0 : f.call(y)) || "", n = ld(t), r = rd(), [a, l] = e.useState(n[0]), [i, s] = e.useState("summary"), [o, c] = e.useState("steps");
  if (e.useEffect(() => {
    const v = n.find((g) => g.uiId === r);
    v && v !== a ? l(v) : n.some((g) => g.uiId === (a == null ? void 0 : a.uiId)) || l(n[0]);
  }, [n, r, a]), !n.length)
    return e.createElement(
      "div",
      { style: { padding: 20, color: jn } },
      "暂无推导记录。运行 UGSci 公式后可在此查看。"
    );
  const d = (a == null ? void 0 : a.payload) || n[0].payload, u = d.provenance || {}, m = d.replay, p = () => {
    var g, x, O;
    const v = u.replay_token;
    v && ((O = (x = (g = window.QwenPaw) == null ? void 0 : g.chat) == null ? void 0 : x.sendMessage) == null || O.call(
      x,
      `请调用 ugsci_replay_calculation 验证并重放以下令牌：
${v}`
    ));
  }, w = [
    ["summary", "摘要"],
    ["derivation", "推导"],
    ["evidence", "证据"],
    ["logs", "日志"]
  ], h = (v) => ({
    flex: "1 1 64px",
    minWidth: 0,
    border: "none",
    borderRadius: 7,
    padding: "6px 8px",
    background: v ? Nn : "transparent",
    color: v ? cn : jn,
    boxShadow: v ? "0 1px 4px rgba(0,0,0,.08)" : "none",
    cursor: "pointer"
  });
  return e.createElement(
    "div",
    {
      style: {
        display: "flex",
        flexDirection: "column",
        height: "100%",
        minHeight: 0,
        padding: 14,
        gap: 12,
        overflow: "auto"
      }
    },
    e.createElement(
      "div",
      {
        style: {
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 8,
          flexWrap: "wrap"
        }
      },
      e.createElement(
        "div",
        null,
        e.createElement(
          "strong",
          { style: { display: "block", color: cn } },
          "计算详情"
        ),
        e.createElement(
          "span",
          { style: { color: jn, fontSize: 11 } },
          ((E = d.trace) == null ? void 0 : E.formula_name) || d.operation || "UGSci 推导"
        )
      ),
      m ? e.createElement(
        "span",
        {
          style: {
            color: m.reproducible ? "var(--ant-color-success, #52c41a)" : "var(--ant-color-warning, #faad14)",
            fontSize: 12
          }
        },
        m.reproducible ? `✓ 可复现 · ${m.elapsedMs ?? "?"} ms` : "! 版本已变化"
      ) : null
    ),
    e.createElement(
      "div",
      {
        role: "tablist",
        "aria-label": "计算详情层级",
        style: {
          display: "flex",
          gap: 4,
          padding: 4,
          borderRadius: 9,
          background: "var(--ant-color-fill-quaternary, rgba(0,0,0,.02))"
        }
      },
      ...w.map(
        ([v, g]) => e.createElement(
          "button",
          {
            key: v,
            type: "button",
            role: "tab",
            onClick: () => s(v),
            "aria-selected": i === v,
            style: h(i === v)
          },
          g
        )
      )
    ),
    n.length > 1 ? e.createElement(
      "select",
      {
        "aria-label": "选择计算记录",
        value: (a == null ? void 0 : a.uiId) || n[0].uiId,
        onChange: (v) => {
          Er(v.target.value), l(
            n.find((g) => g.uiId === v.target.value)
          );
        },
        style: {
          width: "100%",
          padding: "7px 9px",
          border: `1px solid ${za}`,
          borderRadius: 7,
          color: cn,
          background: Nn
        }
      },
      ...n.map(
        (v) => {
          var g;
          return e.createElement(
            "option",
            { key: v.uiId, value: v.uiId },
            ((g = v.payload.trace) == null ? void 0 : g.formula_name) || v.uiId.slice(0, 18)
          );
        }
      )
    ) : null,
    i === "summary" ? e.createElement(
      "div",
      { role: "tabpanel", style: { display: "grid", gap: 18 } },
      e.createElement(gr, {
        payload: d,
        onOpenDerivation: () => s("derivation"),
        onOpenEvidence: () => s("evidence"),
        onReplay: u.replay_token ? p : void 0
      }),
      e.createElement(Qc, { payload: d })
    ) : i === "derivation" ? e.createElement(
      "div",
      { role: "tabpanel", style: { display: "grid", gap: 10 } },
      e.createElement(
        "div",
        { style: { display: "flex", gap: 6, flexWrap: "wrap" } },
        ...[
          ["steps", "关键步骤"],
          ["flow", "流程图"]
        ].map(
          ([v, g]) => e.createElement(
            "button",
            {
              key: v,
              type: "button",
              onClick: () => c(v),
              "aria-pressed": o === v,
              style: {
                border: `1px solid ${o === v ? Pa : za}`,
                borderRadius: 7,
                padding: "5px 9px",
                background: Nn,
                color: o === v ? Pa : cn,
                cursor: "pointer"
              }
            },
            g
          )
        )
      ),
      o === "flow" ? e.createElement(md, { payload: d }) : e.createElement(pd, { payload: d, compact: !0 })
    ) : i === "evidence" ? e.createElement(
      "div",
      { role: "tabpanel" },
      e.createElement(Zc, { payload: d })
    ) : e.createElement(
      "div",
      { role: "tabpanel" },
      e.createElement(ed, { payload: d })
    )
  );
}
function Lt(e) {
  var t;
  if (typeof e == "string")
    try {
      return Lt(JSON.parse(e));
    } catch {
      return null;
    }
  return Array.isArray(e) ? Lt((t = e.find((n) => (n == null ? void 0 : n.type) === "text")) == null ? void 0 : t.text) : e != null && e.status && (e != null && e.result) ? {
    ...e.result,
    replay: {
      replayId: String(e.replay_id || ""),
      status: String(e.status),
      reproducible: e.reproducible === !0,
      elapsedMs: typeof e.elapsed_ms == "number" ? e.elapsed_ms : void 0,
      diff: e.diff && typeof e.diff == "object" ? e.diff : {}
    }
  } : (e == null ? void 0 : e.output) !== void 0 ? Lt(e.output) : (e == null ? void 0 : e.content) !== void 0 ? Lt(e.content) : e;
}
function gd(e) {
  var o, c, d, u, m, p, w;
  const t = C().React, n = ((o = e == null ? void 0 : e.data) == null ? void 0 : o.content) || [], r = ((d = (c = n[1]) == null ? void 0 : c.data) == null ? void 0 : d.output) ?? ((m = (u = n[1]) == null ? void 0 : u.data) == null ? void 0 : m.content) ?? ((w = (p = n[0]) == null ? void 0 : p.data) == null ? void 0 : w.output), a = Lt(r), [l, i] = t.useState(null);
  t.useEffect(() => {
    a && i(hr(a));
  }, [r]);
  const s = () => {
    l != null && l.uiId && Er(l.uiId), window.dispatchEvent(
      new CustomEvent("qwenpaw:open-compute-workbench", {
        detail: { uiId: l == null ? void 0 : l.uiId }
      })
    );
  };
  return t.createElement(
    "div",
    {
      style: {
        border: "1px solid var(--ant-color-border-secondary, #f0f0f0)",
        borderRadius: 12,
        padding: 12,
        margin: "6px 0",
        background: "var(--ant-color-bg-container, #fff)"
      }
    },
    a ? t.createElement(gr, {
      payload: a,
      compact: !0,
      onOpenDerivation: s
    }) : t.createElement(
      "span",
      {
        style: {
          color: "var(--ant-color-text-secondary, rgba(0,0,0,.45))"
        }
      },
      "计算中…"
    )
  );
}
let mt = null;
function yd(e, t) {
  var a, l, i, s;
  const n = "ugsci";
  mt == null || mt();
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
      e.chat.toolRender(n, "emit_ui_tree", ga)
    ), r.push(
      e.chat.toolRender(n, "emit_ui_patch", ga)
    ), r.push(
      e.chat.toolRender(n, "list_ui_components", ya)
    ), r.push(
      e.chat.toolRender(n, "get_genui_guide", ya)
    );
    for (const o of [
      "ugsci_trace_calculation",
      "ugsci_replay_calculation",
      "ugsci_derive_formula",
      "ugsci_evaluate_formula",
      "ugsci_transform_formula",
      "ugsci_formula_preview"
    ])
      r.push(e.chat.toolRender(n, o, gd));
    console.info("[ugsci.genui] Registered emit/patch + catalog/guide cards");
  }
  return (l = e.slot) != null && l.fill && r.push(
    e.slot.fill(
      n,
      "chat.workbench.compute",
      () => t.createElement(fd)
    )
  ), (s = (i = e.chat) == null ? void 0 : i.response) != null && s.append && (r.push(
    e.chat.response.append(
      n,
      (o) => {
        const c = () => (t.useEffect(
          () => ad(o.data.output),
          [o.data.output]
        ), null);
        return t.createElement(
          Hs,
          null,
          t.createElement(c),
          t.createElement(ud, { data: o.data })
        );
      },
      { id: "ugsci.genui.response-append", order: 50 }
    )
  ), console.info("[ugsci.genui] Registered response.append slot")), mt = () => {
    var o;
    for (const c of r.reverse()) (o = c == null ? void 0 : c.dispose) == null || o.call(c);
    if (Js(), cc(), e.genui) {
      const c = { ...e.genui };
      delete c.dispose, delete c.clearSession, e.genui = c;
    }
    mt = null;
  }, e.genui = {
    ...e.genui || {},
    dispose: mt,
    clearSession: Vs
  }, mt;
}
const Ra = {
  enabled: !0,
  persisted_enabled: !0,
  overridden: !1,
  channels: ["response.append"],
  allow_html: !1,
  allow_actions: [],
  backend_unavailable: !0
};
function Dn(e) {
  const t = window.QwenPaw;
  t && (t.genui = { ...t.genui || {}, config: e });
}
function hd() {
  const e = C().React, { Alert: t, Card: n, Space: r, Spin: a, Switch: l, Typography: i, message: s } = C().antd, { useEffect: o, useState: c } = e, [d, u] = c(null), [m, p] = c(!1);
  o(() => {
    let h = !0, y = null;
    const f = (E = !1) => {
      de("/ugsci/genui/config").then((v) => {
        h && (u(v), Dn(v));
      }).catch((v) => {
        h && (u(Ra), Dn(Ra), E && s.error(String(v)), y = setTimeout(() => f(!1), 3e4));
      });
    };
    return f(!0), () => {
      h = !1, y && clearTimeout(y);
    };
  }, []);
  const w = async (h) => {
    p(!0);
    try {
      const y = await de("/ugsci/genui/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: h })
      });
      u(y), Dn(y), s.success(
        y.overridden ? "设置已保存，但环境变量或插件配置正在覆盖它" : h ? "GenUI 已开启" : "GenUI 已关闭"
      );
    } catch (y) {
      s.error(`保存 GenUI 设置失败：${String(y)}`);
    } finally {
      p(!1);
    }
  };
  return e.createElement(
    "section",
    { "aria-labelledby": "ugsci-genui-title" },
    e.createElement(
      i.Title,
      { level: 3, id: "ugsci-genui-title" },
      "GenUI"
    ),
    e.createElement(
      i.Paragraph,
      { type: "secondary" },
      "控制 UGSci 的生成式界面能力。该设置对所有 Agent 生效，新安装时默认开启。"
    ),
    e.createElement(
      n,
      null,
      d === null ? e.createElement(a) : e.createElement(
        r,
        { direction: "vertical", size: 16, style: { width: "100%" } },
        e.createElement(
          r,
          { style: { width: "100%", justifyContent: "space-between" } },
          e.createElement(
            "div",
            null,
            e.createElement(
              i.Text,
              { strong: !0 },
              "启用 GenUI"
            ),
            e.createElement(
              i.Paragraph,
              { type: "secondary", style: { margin: "4px 0 0" } },
              "允许 Agent 生成卡片、表格、图表、表单，并在对话中交互和增量更新。"
            )
          ),
          e.createElement(l, {
            "aria-label": "启用 GenUI",
            checked: d.persisted_enabled,
            loading: m,
            disabled: d.backend_unavailable,
            onChange: w
          })
        ),
        e.createElement(t, {
          type: d.backend_unavailable ? "error" : d.enabled ? "success" : "warning",
          showIcon: !0,
          message: d.backend_unavailable ? "UGSci 后端当前不可用，正在使用兼容降级模式；设置不会写入。" : d.enabled ? "GenUI 当前有效；各 Agent 仍可显式关闭自己的 GenUI 工具" : d.overridden ? "GenUI 当前被环境变量或插件配置关闭；本地设置已保存但暂不生效。" : "GenUI 已全局关闭；已有界面仍可查看，但 Agent 不会再生成或更新界面。"
        })
      )
    )
  );
}
function Ed() {
  const { React: e, antd: t } = C();
  return e.createElement(
    "div",
    { style: { width: "100%" } },
    e.createElement(t.Typography.Title, { level: 2 }, "UGSci 设置"),
    e.createElement(
      t.Typography.Paragraph,
      { type: "secondary", style: { marginBottom: 28 } },
      "集中管理 UGSci 的功能与偏好设置。"
    ),
    e.createElement(hd)
  );
}
function bd() {
  const { React: e } = C();
  return e.useEffect(() => {
    window.history.replaceState({}, "", "/settings/ugsci"), window.dispatchEvent(new PopStateEvent("popstate"));
  }, []), null;
}
let Pt = null;
function Fl() {
  return Pt || (Pt = (async () => {
    var r;
    const e = (r = window.QwenPaw) == null ? void 0 : r.host;
    if (!(e != null && e.getApiUrl))
      throw new Error("[oilgas-vis] QwenPaw.host.getApiUrl not available");
    const t = `${e.getApiUrl(
      "frontend_plugin/ugsci/files/ui/dist/viewer-runtime.js"
    )}?v=0.3.6`;
    console.info("[oilgas-vis] Loading viewer runtime from", t), await new Promise((a, l) => {
      const i = document.createElement("script");
      i.dataset.plugin = "ugsci", i.src = t, i.onload = () => a(), i.onerror = () => l(new Error("Viewer runtime failed to load")), document.head.appendChild(i);
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
    throw Pt = null, e;
  }), Pt);
}
function vd() {
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
function Oa(e, t) {
  var a;
  const n = ((a = e.getApiToken) == null ? void 0 : a.call(e)) || "", r = typeof e.buildAuthHeaders == "function" ? { ...e.buildAuthHeaders(t.agentId) } : n ? { Authorization: `Bearer ${n}` } : {};
  return t.agentId && (r["X-Agent-Id"] = t.agentId), t.chatId && (r["X-Chat-Id"] = t.chatId), !t.chatId && t.projectDirOverride && (r["X-Session-Project-Dir"] = t.projectDirOverride), r;
}
async function Ma(e, t, n) {
  if (typeof e.fetch == "function") return e.fetch(t, n);
  const r = t.replace(/^\/ugsci\/visualization/, "");
  return fetch(`${e.getApiUrl("ugsci/visualization")}${r}`, n);
}
async function wd(e, t) {
  var a;
  const n = await Ma(e, "/ugsci/visualization/imports/workspace", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...Oa(e, t)
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
    const i = await Ma(
      e,
      `/ugsci/visualization/imports/${r.job_id}`,
      { headers: Oa(e, t) }
    );
    if (!i.ok) throw new Error(`状态查询失败: HTTP ${i.status}`);
    const s = await i.json();
    if (s.status === "completed") {
      if (!((a = s.result) != null && a.id)) throw new Error("导入完成但未返回数据集 ID");
      return s.result.id;
    }
    if (s.status === "failed" || s.status === "cancelled")
      throw new Error(s.error || "导入任务未完成");
    await new Promise((o) => setTimeout(o, 750));
  }
  throw new Error("导入超时，请稍后重试");
}
async function Sd(e, t) {
  var r;
  let n;
  for (let a = 0; a < 20; a += 1)
    try {
      await ((r = e.executeCommand) == null ? void 0 : r.call(e, "open", { datasetId: t }));
      return;
    } catch (l) {
      n = l, await new Promise((i) => setTimeout(i, 250));
    }
  if (n) throw n;
}
function xd() {
  const e = C().React, { useEffect: t, useRef: n, useState: r } = e, { Spin: a, Alert: l, Button: i, Typography: s, message: o } = C().antd, { Text: c } = s, d = n(null), u = n(null), [m, p] = r(!0), [w, h] = r(null), [y, f] = r("正在加载三维可视化引擎...");
  return t(() => {
    let E = !1;
    async function v() {
      if (d.current)
        try {
          p(!0), h(null);
          const g = await Fl();
          if (E) return;
          const x = C(), K = {
            apiBase: x.getApiUrl("ugsci/visualization"),
            authToken: x.getApiToken() || void 0
          };
          u.current = g.mount(d.current, K);
          const z = vd();
          if (z) {
            f(`正在导入 ${z.name}...`);
            const R = await wd(x, z);
            if (E || !u.current || (f("正在打开三维网格..."), await Sd(u.current, R), E)) return;
          }
          E || p(!1);
        } catch (g) {
          if (!E) {
            const x = g instanceof Error ? g.message : "Failed to load viewer";
            h(x), p(!1), o.error(`可视化引擎加载失败: ${x}`);
          }
        }
    }
    return v(), () => {
      if (E = !0, u.current) {
        try {
          u.current.dispose();
        } catch (g) {
          console.warn("[oilgas-vis] Dispose error:", g);
        }
        u.current = null;
      }
    };
  }, []), w ? e.createElement(
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
      description: w,
      showIcon: !0,
      style: { maxWidth: 600 }
    }),
    e.createElement(
      i,
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
      ref: d,
      style: { width: "100%", height: "100%" }
    }),
    m && e.createElement(
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
        y
      )
    )
  );
}
function Gl(e, t) {
  var a;
  const n = ((a = e.getApiToken) == null ? void 0 : a.call(e)) || "", r = typeof e.buildAuthHeaders == "function" ? { ...e.buildAuthHeaders(t.agentId) } : n ? { Authorization: `Bearer ${n}` } : {};
  return t.agentId && (r["X-Agent-Id"] = t.agentId), t.chatId && (r["X-Chat-Id"] = t.chatId), !t.chatId && t.projectDirOverride && (r["X-Session-Project-Dir"] = t.projectDirOverride), r;
}
async function Hl(e, t, n) {
  if (typeof e.fetch == "function")
    return e.fetch(t, n);
  const r = t.replace(/^\/ugsci\/visualization/, "");
  return fetch(`${e.getApiUrl("ugsci/visualization")}${r}`, n);
}
function La(e) {
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
function kd({ jobId: e, file: t }) {
  const n = C().React, { useEffect: r, useRef: a, useState: l } = n, i = C(), s = a(null), o = a(null), [c, d] = l("queued"), [u, m] = l(0), [p, w] = l(null), [h, y] = l(null);
  return r(() => {
    let f = !1;
    return (async () => {
      var g;
      const v = `/ugsci/visualization/imports/${e}`;
      for (let x = 0; x < 240 && !f; x += 1) {
        try {
          const O = await Hl(i, v, {
            headers: { ...Gl(i, t) }
          });
          if (!O.ok) throw new Error(`状态查询失败: HTTP ${O.status}`);
          const K = await O.json();
          if (f) return;
          if (m(Number(K.progress || 0)), d(K.status), K.status === "completed") {
            if (!((g = K.result) != null && g.id)) throw new Error("导入完成但未返回数据集 ID");
            y(K.result.id);
            return;
          }
          if (K.status === "failed" || K.status === "cancelled") {
            w(K.error || La(K.status));
            return;
          }
        } catch (O) {
          if (x >= 239 && !f) {
            d("failed"), w(O instanceof Error ? O.message : String(O));
            return;
          }
        }
        await new Promise((O) => setTimeout(O, 750));
      }
    })(), () => {
      f = !0;
    };
  }, [e, t.agentId, t.chatId, t.projectDirOverride]), r(() => {
    if (c !== "completed" || !h || !s.current) return;
    let f = !1;
    return (async () => {
      var E, v;
      try {
        const g = await Fl();
        if (f || !s.current) return;
        o.current = g.mount(s.current, {
          apiBase: i.getApiUrl("ugsci/visualization"),
          authToken: i.getApiToken() || void 0
        });
        let x;
        for (let O = 0; O < 20 && !f; O += 1)
          try {
            await ((v = (E = o.current).executeCommand) == null ? void 0 : v.call(E, "open", { datasetId: h })), x = void 0;
            break;
          } catch (K) {
            x = K;
            const z = K instanceof Error ? K.message : String(K);
            if (!z.includes("数据集不存在") && !z.includes("dataset"))
              throw K;
            await new Promise((R) => setTimeout(R, 250));
          }
        if (x && !f) throw x;
      } catch (g) {
        f || (d("failed"), w(g instanceof Error ? g.message : String(g)));
      }
    })(), () => {
      var E;
      f = !0;
      try {
        (E = o.current) == null || E.dispose();
      } catch {
      }
      o.current = null;
    };
  }, [c, h]), n.createElement(
    "div",
    { style: { width: "100%", marginTop: 8 } },
    c === "completed" ? n.createElement("div", {
      ref: s,
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
      `${La(c)}${u > 0 ? `（${Math.round(u * 100)}%）` : ""}`
    ),
    p ? n.createElement(
      "div",
      { style: { marginTop: 6, color: "#ff7875", fontSize: 12 } },
      `预览状态：${p}`
    ) : null
  );
}
function Cd(e) {
  const t = C().React, { useEffect: n, useState: r } = t, { Button: a, Spin: l, Alert: i, Typography: s } = C().antd, { Text: o } = s, c = e.artifact || e.file || {}, d = c.filename || c.title || e.filename || "unknown", u = c.workspacePath || c.path || e.workspacePath, [m, p] = r("idle"), [w, h] = r(null), [y, f] = r(null);
  return n(() => {
    if (!u) return;
    let E = !1;
    return p("submitting"), h(null), f(null), (async () => {
      try {
        const v = C(), g = await Hl(v, "/ugsci/visualization/imports/workspace", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...Gl(v, c)
          },
          body: JSON.stringify({
            path: u,
            root: c.workspaceRoot || "project",
            name: d.replace(/\.[^.]+$/, "")
          })
        });
        if (!g.ok) throw new Error(`Import failed: HTTP ${g.status}`);
        const x = await g.json();
        E || (h(x.job_id), p("submitted"));
      } catch (v) {
        E || (f(v instanceof Error ? v.message : String(v)), p("failed"));
      }
    })(), () => {
      E = !0;
    };
  }, [u, d, c.workspaceRoot, c.agentId, c.chatId, c.projectDirOverride]), m === "submitting" ? t.createElement(
    "div",
    { style: { padding: 24, textAlign: "center" } },
    t.createElement(l, { size: "large" }),
    t.createElement(
      "div",
      { style: { marginTop: 8, color: "#8b949e" } },
      "正在提交工作区文件，浏览器不会复制大型文件..."
    )
  ) : m === "failed" ? t.createElement(
    "div",
    { style: { padding: 24 } },
    t.createElement(i, {
      type: "warning",
      message: "导入失败",
      description: y,
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
    t.createElement(o, { strong: !0 }, `文件: ${d}`),
    c.size ? t.createElement(o, { type: "secondary" }, `大小: ${(c.size / 1024 / 1024).toFixed(1)} MB`) : null,
    w ? t.createElement(kd, { jobId: w, file: c }) : t.createElement(o, { type: "secondary" }, "正在准备导入任务..."),
    t.createElement(a, {
      type: "primary",
      onClick: () => {
        window.history.pushState({}, "", "/oilgas-visualization"), window.dispatchEvent(new PopStateEvent("popstate"));
      }
    }, "打开油气可视化页面")
  );
}
function Td(e, t) {
  const n = "__ugsciVisualizationFrontendRegistered", r = window;
  if (r[n]) return;
  r[n] = !0;
  const a = C().antdIcons || {}, l = a.GlobalOutlined || a.AppstoreOutlined;
  e.route.add("ugsci", {
    id: "ugsci.visualization",
    path: "/oilgas-visualization",
    component: xd
  }), e.menu.add("ugsci", {
    id: "ugsci.visualization",
    location: "primary.agentScoped",
    label: () => "油气可视化",
    icon: l ? t.createElement(l, { style: { fontSize: 16 } }) : void 0,
    route: "ugsci.visualization",
    order: 7,
    visible: () => !0
  });
  const i = e.workspace;
  if (i != null && i.registerRenderer)
    try {
      i.registerRenderer({
        id: "ugsci.visualization",
        name: "UGSci 油气可视化",
        component: Cd,
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
    } catch (s) {
      console.warn("[ugsci] Visualization workspace renderer registration failed:", s);
    }
}
const Rt = "/ugsci/storage-dynamics", Ba = (e) => e === "injection" ? "注气" : "采气", Ue = (e) => e == null ? "缺测" : e.toLocaleString("zh-CN", { maximumFractionDigits: 2 }), _d = {
  xls_row_limit: "疑似 XLS 导出截断",
  invalid_range: "数值超出合法范围",
  invalid_number: "无法识别数值",
  invalid_identity: "日期或库井标识无效",
  duplicate_identical: "相同重复已去重",
  duplicate_conflict: "重复冲突已排除"
}, Id = {
  gas: "日气量",
  hours: "生产小时",
  pressure: "井口油压",
  casing: "套压",
  water: "日产水量",
  vent: "放空量"
};
function Ad({ rows: e }) {
  const t = C().React, n = [...new Set(e.map((o) => o.month))].sort(), r = n.map((o) => {
    const c = e.filter((u) => u.month === o), d = (u) => {
      const m = c.map((p) => p[u]).filter((p) => p != null);
      return m.length ? m.reduce((p, w) => p + w, 0) : null;
    };
    return {
      month: o,
      injection: d("injection"),
      withdrawal: d("withdrawal")
    };
  }), a = Math.max(
    1,
    ...r.flatMap((o) => [o.injection || 0, o.withdrawal || 0])
  ), l = (o) => 65 + o * 635 / Math.max(1, n.length - 1), i = (o) => 245 - o / a * 200, s = (o) => {
    let c = !1;
    return r.map((d, u) => {
      if (d[o] == null)
        return c = !1, "";
      const m = `${c ? "L" : "M"}${l(u)},${i(d[o])}`;
      return c = !0, m;
    }).join(" ");
  };
  return /* @__PURE__ */ t.createElement("div", { style: { overflowX: "auto" } }, /* @__PURE__ */ t.createElement("div", { style: { display: "flex", gap: 24, marginBottom: 8 } }, /* @__PURE__ */ t.createElement("span", { style: { color: "#1677ff" } }, "● 注气月量"), /* @__PURE__ */ t.createElement("span", { style: { color: "#e8684a" } }, "● 采气月量"), /* @__PURE__ */ t.createElement("span", null, "单位：万m³ / 月 · 空值断线")), /* @__PURE__ */ t.createElement(
    "svg",
    {
      viewBox: "0 0 750 290",
      role: "img",
      "aria-label": "注采气月度计量量趋势",
      style: { width: "100%", minWidth: 550, maxHeight: 350 }
    },
    [0, 0.25, 0.5, 0.75, 1].map((o) => /* @__PURE__ */ t.createElement("g", { key: o }, /* @__PURE__ */ t.createElement(
      "line",
      {
        x1: "65",
        x2: "700",
        y1: i(o * a),
        y2: i(o * a),
        stroke: "currentColor",
        opacity: ".12"
      }
    ), /* @__PURE__ */ t.createElement(
      "text",
      {
        x: "57",
        y: i(o * a) + 4,
        textAnchor: "end",
        fill: "currentColor",
        fontSize: "12"
      },
      Ue(o * a)
    ))),
    /* @__PURE__ */ t.createElement(
      "path",
      {
        d: s("injection"),
        stroke: "#1677ff",
        strokeWidth: "2.5",
        fill: "none"
      }
    ),
    /* @__PURE__ */ t.createElement(
      "path",
      {
        d: s("withdrawal"),
        stroke: "#e8684a",
        strokeWidth: "2.5",
        fill: "none"
      }
    ),
    r.map((o, c) => /* @__PURE__ */ t.createElement("g", { key: o.month }, c % Math.max(1, Math.ceil(n.length / 8)) === 0 && /* @__PURE__ */ t.createElement(
      "text",
      {
        x: l(c),
        y: "274",
        textAnchor: "middle",
        fill: "currentColor",
        fontSize: "12"
      },
      o.month
    ), /* @__PURE__ */ t.createElement("rect", { x: l(c) - 3, y: "40", width: "6", height: "205", fill: "transparent" }, /* @__PURE__ */ t.createElement("title", null, o.month, " 注气 ", Ue(o.injection), " / 采气 ", Ue(o.withdrawal), " ", "万m³"))))
  ));
}
function $d() {
  const e = C(), t = e.React, {
    Card: n,
    Select: r,
    Input: a,
    Button: l,
    Space: i,
    Alert: s,
    Table: o,
    Tabs: c,
    Statistic: d,
    Spin: u,
    DatePicker: m,
    InputNumber: p,
    Typography: w
  } = e.antd, [h, y] = t.useState([]), [f, E] = t.useState(""), [v, g] = t.useState(""), [x, O] = t.useState(""), [K, z] = t.useState(""), [R, X] = t.useState(""), [W, N] = t.useState(""), [T, k] = t.useState(4), [$, _] = t.useState(30), [M, G] = t.useState(null), [q, F] = t.useState(null), [I, ne] = t.useState(""), [le, D] = t.useState(""), P = t.useRef(!0), oe = async (S) => {
    var Se;
    const V = await de(`${Rt}/datasets`, {
      bypassCache: !0
    });
    if (!P.current) return;
    const pe = V.datasets.sort(
      (Le, ve) => ve.created_at.localeCompare(Le.created_at)
    );
    y(pe), E(S || ((Se = pe[0]) == null ? void 0 : Se.id) || "");
  };
  t.useEffect(() => (P.current = !0, oe().catch((S) => {
    P.current && D(String(S.message || S));
  }), () => {
    P.current = !1;
  }), []);
  const re = () => ({
    dataset_id: f,
    facility: x,
    well: K,
    start: R,
    end: W,
    cycle_start_month: T,
    drop_threshold_pct: $
  }), Y = async () => {
    D(""), ne("读取并审计数据…");
    try {
      const S = await de(`${Rt}/imports`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input_path: v })
      });
      for (; P.current; ) {
        await new Promise((pe) => setTimeout(pe, 1200));
        const V = await de(`${Rt}/imports/${S.id}`, {
          bypassCache: !0
        });
        if (V.status === "failed") throw new Error(V.error);
        if (V.status === "completed") {
          await oe(V.dataset.id), G(null), O(""), z("");
          break;
        }
      }
    } catch (S) {
      P.current && D(S.message || String(S));
    } finally {
      P.current && ne("");
    }
  }, ue = async () => {
    D(""), ne("分析注采动态…");
    const S = re();
    try {
      const V = await de(`${Rt}/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(S)
      });
      P.current && (G(V), F(S));
    } catch (V) {
      P.current && D(V.message || String(V));
    } finally {
      P.current && ne("");
    }
  }, U = async () => {
    if (q) {
      ne("生成报告…"), D("");
      try {
        const S = await tt(`${Rt}/export`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(q)
        });
        if (!S.ok) throw new Error(await S.text());
        const V = URL.createObjectURL(await S.blob()), pe = document.createElement("a");
        pe.href = V, pe.download = "储气库生产动态分析报告.md", pe.click(), setTimeout(() => URL.revokeObjectURL(V), 1e3);
      } catch (S) {
        D(S.message || String(S));
      } finally {
        P.current && ne("");
      }
    }
  }, ie = h.find((S) => S.id === f), me = (S, V, pe) => /* @__PURE__ */ t.createElement(
    o,
    {
      size: "small",
      dataSource: S,
      columns: V,
      rowKey: pe,
      pagination: { pageSize: 12, showSizeChanger: !0 },
      scroll: { x: "max-content" }
    }
  ), A = (S, V, pe) => ({ title: S, dataIndex: V, render: pe });
  return /* @__PURE__ */ t.createElement("div", { style: { padding: 24, maxWidth: 1600, margin: "0 auto" } }, /* @__PURE__ */ t.createElement(w.Title, { level: 2, style: { marginTop: 0 } }, "储气库生产动态分析"), /* @__PURE__ */ t.createElement(w.Paragraph, { type: "secondary" }, "从注采日记录到库井动态、运行阶段与复核线索。保留计量口径，每个异常可追溯到原表。"), /* @__PURE__ */ t.createElement(n, { title: "数据与分析范围", style: { marginBottom: 18 } }, /* @__PURE__ */ t.createElement(i.Compact, { style: { width: "100%", marginBottom: 16 } }, /* @__PURE__ */ t.createElement(
    a,
    {
      "aria-label": "注采数据路径",
      value: v,
      onChange: (S) => g(S.target.value),
      placeholder: "本地 XLS / XLSX / UTF-8 CSV 文件或目录的绝对路径",
      disabled: !!I
    }
  ), /* @__PURE__ */ t.createElement(l, { onClick: Y, disabled: !v.trim() || !!I }, "导入并检查")), /* @__PURE__ */ t.createElement(i, { wrap: !0, style: { marginBottom: 12 } }, /* @__PURE__ */ t.createElement(
    r,
    {
      "aria-label": "数据集",
      style: { minWidth: 260 },
      placeholder: "选择数据集",
      value: f || void 0,
      disabled: !!I,
      onChange: (S) => {
        E(S), O(""), z(""), G(null);
      },
      options: h.map((S) => ({
        label: `${S.name} · ${Ue(S.records)} 条`,
        value: S.id
      }))
    }
  ), /* @__PURE__ */ t.createElement(
    r,
    {
      "aria-label": "储气库",
      value: x,
      style: { minWidth: 145 },
      disabled: !!I,
      onChange: (S) => {
        O(S), z("");
      },
      options: [
        { label: "全部储气库", value: "" },
        ...((ie == null ? void 0 : ie.facilities) || []).map((S) => ({
          label: S.facility,
          value: S.facility
        }))
      ]
    }
  ), /* @__PURE__ */ t.createElement(
    a,
    {
      "aria-label": "井号",
      value: K,
      onChange: (S) => z(S.target.value),
      placeholder: "原始井号（可选）",
      style: { width: 150 },
      disabled: !!I
    }
  ), /* @__PURE__ */ t.createElement(
    a,
    {
      "aria-label": "起始日期",
      type: "date",
      value: R,
      onChange: (S) => X(S.target.value),
      disabled: !!I,
      style: { width: 155 }
    }
  ), /* @__PURE__ */ t.createElement("span", null, "至"), /* @__PURE__ */ t.createElement(
    a,
    {
      "aria-label": "截止日期",
      type: "date",
      value: W,
      onChange: (S) => N(S.target.value),
      disabled: !!I,
      style: { width: 155 }
    }
  )), /* @__PURE__ */ t.createElement(i, { wrap: !0 }, /* @__PURE__ */ t.createElement("span", null, "气年度起始月"), /* @__PURE__ */ t.createElement(
    p,
    {
      "aria-label": "气年度起始月份",
      min: 1,
      max: 12,
      value: T,
      disabled: !!I,
      onChange: (S) => k(S || 4)
    }
  ), /* @__PURE__ */ t.createElement("span", null, "折算量下降筛查阈值（%）"), /* @__PURE__ */ t.createElement(
    p,
    {
      "aria-label": "下降筛查阈值",
      min: 1,
      max: 100,
      value: $,
      disabled: !!I,
      onChange: (S) => _(S || 30)
    }
  ), /* @__PURE__ */ t.createElement(l, { type: "primary", onClick: ue, disabled: !f || !!I }, "分析动态"), /* @__PURE__ */ t.createElement(l, { onClick: U, disabled: !M || !!I }, "下载分析报告"))), le && /* @__PURE__ */ t.createElement(
    s,
    {
      type: "error",
      showIcon: !0,
      message: le,
      style: { marginBottom: 16 }
    }
  ), I && /* @__PURE__ */ t.createElement("div", { role: "status", style: { padding: 16 } }, /* @__PURE__ */ t.createElement(u, { size: "small" }), " ", I), !M && !I && /* @__PURE__ */ t.createElement(n, null, /* @__PURE__ */ t.createElement(w.Paragraph, null, "选择已导入数据集并点击“分析动态”。也可以在专家中心创建“储气库生产动态分析师”，通过对话调用相同的分析工具。"), /* @__PURE__ */ t.createElement(
    s,
    {
      type: "info",
      showIcon: !0,
      message: "源文件只读；空值不补零，井口油压不替代地层压力。"
    }
  )), M && /* @__PURE__ */ t.createElement(t.Fragment, null, /* @__PURE__ */ t.createElement(
    s,
    {
      type: "info",
      showIcon: !0,
      message: `分析截至数据日期 ${M.summary.as_of} · ${M.filters.facility || "全部库"} / ${M.filters.well || "全部井"} · ${M.summary.start} 起 · 气年度 ${M.parameters.cycle_start_month} 月起 · 筛查阈值 ${M.parameters.drop_threshold_pct}%`,
      style: { marginBottom: 16 }
    }
  ), /* @__PURE__ */ t.createElement(
    "div",
    {
      style: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
        gap: 14,
        marginBottom: 18
      }
    },
    [
      [
        "储气库 / 原始井号",
        `${M.summary.facilities} / ${M.summary.wells}`,
        ""
      ],
      ["已记录累计注气", Ue(M.summary.injection), "万m³"],
      ["已记录累计采气", Ue(M.summary.withdrawal), "万m³"],
      ["气量缺测日记录", Ue(M.summary.missing_gas), "条"],
      ["筛查线索", Ue(M.summary.anomaly_count), "项"]
    ].map(([S, V, pe]) => /* @__PURE__ */ t.createElement(n, { key: S, size: "small" }, /* @__PURE__ */ t.createElement(d, { title: S, value: V, suffix: pe })))
  ), /* @__PURE__ */ t.createElement(n, { title: "注采月度动态", style: { marginBottom: 18 } }, /* @__PURE__ */ t.createElement(Ad, { rows: M.monthly }), /* @__PURE__ */ t.createElement(w.Text, { type: "secondary" }, "未记录的一侧保持缺测。累计注采差额需要完整历史与期初库存才能参与库存核算。")), /* @__PURE__ */ t.createElement(n, null, /* @__PURE__ */ t.createElement(
    c,
    {
      items: [
        {
          key: "coverage",
          label: "数据覆盖与质量",
          children: /* @__PURE__ */ t.createElement(t.Fragment, null, me(
            M.coverage,
            [
              A("储气库", "facility"),
              A("方向", "mode", Ba),
              A("起始日期", "start"),
              A("截止日期", "end"),
              A("记录数", "records", Ue),
              A("气量缺测", "missing_gas", Ue),
              A("计量量 / 万m³", "observed_volume", Ue)
            ],
            (S) => `${S.facility}-${S.mode}`
          ), /* @__PURE__ */ t.createElement(
            s,
            {
              type: "warning",
              showIcon: !0,
              message: "分析口径与数据限制",
              description: /* @__PURE__ */ t.createElement("ul", null, M.warnings.map((S, V) => /* @__PURE__ */ t.createElement("li", { key: V }, S)))
            }
          ), /* @__PURE__ */ t.createElement(w.Paragraph, { style: { marginTop: 12 } }, "整个数据集导入检查：", Object.entries(M.quality.import_counts).map(([S, V]) => `${_d[S] || S} ${V} 项`).join("；") || "未发现已配置检查项中的问题", "。下方最多显示 100 条原表问题样例。"), me(
            M.quality.examples,
            [
              A("问题", "message"),
              A(
                "字段",
                "field",
                (S) => Id[S] || S || "—"
              ),
              A("文件", "file"),
              A("表", "sheet"),
              A("原行号", "row")
            ],
            (S) => `${S.file}-${S.sheet}-${S.row}-${S.code}-${S.field}`
          ))
        },
        {
          key: "cycles",
          label: "气年度与阶段",
          children: /* @__PURE__ */ t.createElement(t.Fragment, null, me(
            M.cycles,
            [
              A("储气库", "facility"),
              A("气年度", "gas_year"),
              A("注气 / 万m³", "injection", Ue),
              A("采气 / 万m³", "withdrawal", Ue),
              A("净计量变化 / 万m³", "net_metered_change", Ue),
              A(
                "水气质量比 / t/万m³",
                "water_gas_mass_ratio",
                Ue
              ),
              A("覆盖状态", "completeness")
            ],
            (S) => `${S.facility}-${S.gas_year}`
          ), /* @__PURE__ */ t.createElement(w.Title, { level: 5 }, "近期运行阶段（按实测记录）"), me(
            M.phases_recent,
            [
              A("库", "facility"),
              A(
                "状态",
                "state",
                (S) => ({
                  injection: "注气",
                  withdrawal: "采气",
                  mixed: "混合",
                  zero_observed: "已观测零气量",
                  unknown: "气量未知"
                })[S] || S
              ),
              A("起始", "start"),
              A("截止", "end"),
              A("连续观测日", "observed_days")
            ],
            (S) => `${S.facility}-${S.start}`
          ))
        },
        {
          key: "wells",
          label: "井动态与短期基线",
          children: /* @__PURE__ */ t.createElement(t.Fragment, null, me(
            M.wells,
            [
              A("库", "facility"),
              A("井号", "well"),
              A("方向", "mode", Ba),
              A("运行日", "active_days", Ue),
              A("累计计量 / 万m³", "observed_volume", Ue),
              A("最近运行日期", "last_active_date"),
              A("折算量变化 / %", "rate_change_pct", Ue),
              A("井口油压变化 / %", "pressure_change_pct", Ue),
              A(
                "条件性日量基线 / 万m³",
                "forecast",
                (S) => Ue(S == null ? void 0 : S.daily_volume)
              ),
              A(
                "滚动回测 MAE / 万m³",
                "forecast",
                (S) => Ue(S == null ? void 0 : S.backtest_mae)
              ),
              A("基线状态", "forecast_reason")
            ],
            (S) => `${S.facility}-${S.well}-${S.mode}`
          ), /* @__PURE__ */ t.createElement(w.Text, { type: "secondary" }, "短期基线仅限保持工况的 7 日分析；停井、缺测与日期断档会断开阶段。回测仅使用预测时点之前的记录。"))
        },
        {
          key: "anomalies",
          label: "复核线索",
          children: /* @__PURE__ */ t.createElement(t.Fragment, null, /* @__PURE__ */ t.createElement(w.Paragraph, null, "共 ", Ue(M.summary.anomaly_count), " ", "项筛查线索，显示最近 100 项。线索需要结合现场调度与工程资料复核。"), me(
            M.anomalies,
            [
              A("日期", "day"),
              A("库", "facility"),
              A("井号", "well"),
              A("线索", "message"),
              A("变化 / %", "rate_change_pct", Ue),
              A(
                "原表位置",
                "source",
                (S) => `${S.file} / ${S.sheet} / 第 ${S.row} 行`
              )
            ],
            (S) => `${S.facility}-${S.well}-${S.day}-${S.code}`
          ))
        }
      ]
    }
  ))));
}
function zd() {
  var o, c, d, u;
  const e = window.QwenPaw;
  if (!(e != null && e.menu) || !(e != null && e.route)) {
    console.warn(
      "[ugsci] QwenPaw.menu/route API not available — plugin disabled"
    );
    return;
  }
  const t = C().React, n = "ugsci";
  function r() {
    return C().React.createElement(Us, { embedded: !0 });
  }
  function a() {
    return C().React.useEffect(() => {
      window.history.replaceState({}, "", "/market?tab=ugsci"), window.dispatchEvent(new PopStateEvent("popstate"));
    }, []), null;
  }
  (c = (o = e.chat) == null ? void 0 : o.rightHeader) != null && c.add ? (e.chat.rightHeader.add(
    n,
    t.createElement(Ns),
    {
      id: "ugsci.welcome-injector",
      order: -1
      // render before other right-header items (invisible anyway)
    }
  ), console.info("[ugsci] WelcomePromptsInjector registered via rightHeader")) : console.warn(
    "[ugsci] QP.chat.rightHeader.add not available — agent-specific welcome prompts disabled"
  );
  const l = C().antdIcons || {}, i = l.UserSwitchOutlined, s = l.ToolOutlined;
  e.route.add(n, {
    id: "ugsci.storage-dynamics",
    path: "/ugsci-storage-dynamics",
    component: $d
  }), e.menu.add(n, {
    id: "ugsci.storage-dynamics",
    location: "primary.agentScoped",
    label: () => "储气库动态",
    icon: l.LineChartOutlined ? t.createElement(l.LineChartOutlined, {
      style: { fontSize: 16 }
    }) : void 0,
    route: "ugsci.storage-dynamics",
    order: 7
  }), e.route.add(n, {
    id: "ugsci.experts",
    path: "/ugsci-experts",
    component: ji
  }), e.menu.add(n, {
    id: "ugsci.experts",
    location: "primary.agentScoped",
    label: () => "专家·协作",
    icon: i ? t.createElement(i, { style: { fontSize: 16 } }) : void 0,
    route: "ugsci.experts",
    order: 5
  }), e.route.add(n, {
    id: "ugsci.settings",
    path: "/ugsci-settings",
    component: Ed
  }), e.route.add(n, {
    id: "ugsci.genui-settings",
    path: "/ugsci-genui-settings",
    component: bd
  }), e.route.add(n, {
    id: "ugsci.tools-skills",
    path: "/ugsci-tools-skills",
    component: ml
  }), e.menu.add(n, {
    id: "ugsci.tools-skills",
    location: "primary.agentScoped",
    label: () => "工具·技能",
    icon: s ? t.createElement(s, { style: { fontSize: 16 } }) : void 0,
    route: "ugsci.tools-skills",
    order: 6
  }), e.route.add(n, {
    id: "ugsci.capabilities",
    path: "/ugsci-capabilities",
    component: hs
  }), e.route.add(n, {
    id: "ugsci.skills-center",
    path: "/ugsci-skills",
    component: Es
  }), e.route.add(n, {
    id: "ugsci.market",
    path: "/ugsci-market",
    component: a
  }), (d = e.marketplace) == null || d.add(n, {
    id: "ugsci",
    label: "UGSci",
    component: r,
    order: 30
  }), (u = e.sidebar) != null && u.registerSimpleModeItems ? (e.sidebar.registerSimpleModeItems([
    "ugsci.experts",
    "ugsci.tools-skills",
    "ugsci.storage-dynamics"
  ]), console.info(
    "[ugsci] Registered 3 entries for legacy simple-mode compatibility"
  )) : console.warn(
    "[ugsci] window.QwenPaw.sidebar.registerSimpleModeItems not available — items will not appear in simple mode"
  );
  try {
    const p = e.menu.snapshot("primary.agentScoped").find((w) => w.id === "oilgas-vis.page");
    p && e.menu.replace(n, "oilgas-vis.page", {
      ...p,
      visible: () => !1
    });
  } catch {
  }
  yd(e, t), Td(e, t), console.info(
    "[ugsci] Plugin registered: unified Tools & Skills center + compatibility routes, host-managed navigation"
  );
}
function tr() {
  try {
    zd();
  } catch (e) {
    console.error("[ugsci] Failed to build plugin:", e), setTimeout(tr, 500);
  }
}
var Wa;
if ((Wa = window.QwenPaw) != null && Wa.host)
  tr();
else {
  const e = setInterval(() => {
    var t;
    (t = window.QwenPaw) != null && t.host && (clearInterval(e), tr());
  }, 200);
  setTimeout(() => clearInterval(e), 1e4);
}
function Pd(e, t) {
  if (e.match(/^[a-z]+:\/\//i))
    return e;
  if (e.match(/^\/\//))
    return window.location.protocol + e;
  if (e.match(/^[a-z]+:/i))
    return e;
  const n = document.implementation.createHTMLDocument(), r = n.createElement("base"), a = n.createElement("a");
  return n.head.appendChild(r), n.body.appendChild(a), t && (r.href = t), a.href = e, a.href;
}
const Rd = /* @__PURE__ */ (() => {
  let e = 0;
  const t = () => (
    // eslint-disable-next-line no-bitwise
    `0000${(Math.random() * 36 ** 4 << 0).toString(36)}`.slice(-4)
  );
  return () => (e += 1, `u${t()}${e}`);
})();
function st(e) {
  const t = [];
  for (let n = 0, r = e.length; n < r; n++)
    t.push(e[n]);
  return t;
}
let Et = null;
function Wl(e = {}) {
  return Et || (e.includeStyleProperties ? (Et = e.includeStyleProperties, Et) : (Et = st(window.getComputedStyle(document.documentElement)), Et));
}
function hn(e, t) {
  const r = (e.ownerDocument.defaultView || window).getComputedStyle(e).getPropertyValue(t);
  return r ? parseFloat(r.replace("px", "")) : 0;
}
function Od(e) {
  const t = hn(e, "border-left-width"), n = hn(e, "border-right-width");
  return e.clientWidth + t + n;
}
function Md(e) {
  const t = hn(e, "border-top-width"), n = hn(e, "border-bottom-width");
  return e.clientHeight + t + n;
}
function ql(e, t = {}) {
  const n = t.width || Od(e), r = t.height || Md(e);
  return { width: n, height: r };
}
function Ld() {
  let e, t;
  try {
    t = process;
  } catch {
  }
  const n = t && t.env ? t.env.devicePixelRatio : null;
  return n && (e = parseInt(n, 10), Number.isNaN(e) && (e = 1)), e || window.devicePixelRatio || 1;
}
const Ke = 16384;
function Bd(e) {
  (e.width > Ke || e.height > Ke) && (e.width > Ke && e.height > Ke ? e.width > e.height ? (e.height *= Ke / e.width, e.width = Ke) : (e.width *= Ke / e.height, e.height = Ke) : e.width > Ke ? (e.height *= Ke / e.width, e.width = Ke) : (e.width *= Ke / e.height, e.height = Ke));
}
function En(e) {
  return new Promise((t, n) => {
    const r = new Image();
    r.onload = () => {
      r.decode().then(() => {
        requestAnimationFrame(() => t(r));
      });
    }, r.onerror = n, r.crossOrigin = "anonymous", r.decoding = "async", r.src = e;
  });
}
async function Ud(e) {
  return Promise.resolve().then(() => new XMLSerializer().serializeToString(e)).then(encodeURIComponent).then((t) => `data:image/svg+xml;charset=utf-8,${t}`);
}
async function jd(e, t, n) {
  const r = "http://www.w3.org/2000/svg", a = document.createElementNS(r, "svg"), l = document.createElementNS(r, "foreignObject");
  return a.setAttribute("width", `${t}`), a.setAttribute("height", `${n}`), a.setAttribute("viewBox", `0 0 ${t} ${n}`), l.setAttribute("width", "100%"), l.setAttribute("height", "100%"), l.setAttribute("x", "0"), l.setAttribute("y", "0"), l.setAttribute("externalResourcesRequired", "true"), a.appendChild(l), l.appendChild(e), Ud(a);
}
const Ve = (e, t) => {
  if (e instanceof t)
    return !0;
  const n = Object.getPrototypeOf(e);
  return n === null ? !1 : n.constructor.name === t.name || Ve(n, t);
};
function Nd(e) {
  const t = e.getPropertyValue("content");
  return `${e.cssText} content: '${t.replace(/'|"/g, "")}';`;
}
function Dd(e, t) {
  return Wl(t).map((n) => {
    const r = e.getPropertyValue(n), a = e.getPropertyPriority(n);
    return `${n}: ${r}${a ? " !important" : ""};`;
  }).join(" ");
}
function Fd(e, t, n, r) {
  const a = `.${e}:${t}`, l = n.cssText ? Nd(n) : Dd(n, r);
  return document.createTextNode(`${a}{${l}}`);
}
function Ua(e, t, n, r) {
  const a = window.getComputedStyle(e, n), l = a.getPropertyValue("content");
  if (l === "" || l === "none")
    return;
  const i = Rd();
  try {
    t.className = `${t.className} ${i}`;
  } catch {
    return;
  }
  const s = document.createElement("style");
  s.appendChild(Fd(i, n, a, r)), t.appendChild(s);
}
function Gd(e, t, n) {
  Ua(e, t, ":before", n), Ua(e, t, ":after", n);
}
const ja = "application/font-woff", Na = "image/jpeg", Hd = {
  woff: ja,
  woff2: ja,
  ttf: "application/font-truetype",
  eot: "application/vnd.ms-fontobject",
  png: "image/png",
  jpg: Na,
  jpeg: Na,
  gif: "image/gif",
  tiff: "image/tiff",
  svg: "image/svg+xml",
  webp: "image/webp"
};
function Wd(e) {
  const t = /\.([^./]*?)$/g.exec(e);
  return t ? t[1] : "";
}
function br(e) {
  const t = Wd(e).toLowerCase();
  return Hd[t] || "";
}
function qd(e) {
  return e.split(/,/)[1];
}
function nr(e) {
  return e.search(/^(data:)/) !== -1;
}
function Vd(e, t) {
  return `data:${t};base64,${e}`;
}
async function Vl(e, t, n) {
  const r = await fetch(e, t);
  if (r.status === 404)
    throw new Error(`Resource "${r.url}" not found`);
  const a = await r.blob();
  return new Promise((l, i) => {
    const s = new FileReader();
    s.onerror = i, s.onloadend = () => {
      try {
        l(n({ res: r, result: s.result }));
      } catch (o) {
        i(o);
      }
    }, s.readAsDataURL(a);
  });
}
const Fn = {};
function Jd(e, t, n) {
  let r = e.replace(/\?.*/, "");
  return n && (r = e), /ttf|otf|eot|woff2?/i.test(r) && (r = r.replace(/.*\//, "")), t ? `[${t}]${r}` : r;
}
async function vr(e, t, n) {
  const r = Jd(e, t, n.includeQueryParams);
  if (Fn[r] != null)
    return Fn[r];
  n.cacheBust && (e += (/\?/.test(e) ? "&" : "?") + (/* @__PURE__ */ new Date()).getTime());
  let a;
  try {
    const l = await Vl(e, n.fetchRequestInit, ({ res: i, result: s }) => (t || (t = i.headers.get("Content-Type") || ""), qd(s)));
    a = Vd(l, t);
  } catch (l) {
    a = n.imagePlaceholder || "";
    let i = `Failed to fetch resource: ${e}`;
    l && (i = typeof l == "string" ? l : l.message), i && console.warn(i);
  }
  return Fn[r] = a, a;
}
async function Kd(e) {
  const t = e.toDataURL();
  return t === "data:," ? e.cloneNode(!1) : En(t);
}
async function Xd(e, t) {
  if (e.currentSrc) {
    const l = document.createElement("canvas"), i = l.getContext("2d");
    l.width = e.clientWidth, l.height = e.clientHeight, i == null || i.drawImage(e, 0, 0, l.width, l.height);
    const s = l.toDataURL();
    return En(s);
  }
  const n = e.poster, r = br(n), a = await vr(n, r, t);
  return En(a);
}
async function Yd(e, t) {
  var n;
  try {
    if (!((n = e == null ? void 0 : e.contentDocument) === null || n === void 0) && n.body)
      return await _n(e.contentDocument.body, t, !0);
  } catch {
  }
  return e.cloneNode(!1);
}
async function Qd(e, t) {
  return Ve(e, HTMLCanvasElement) ? Kd(e) : Ve(e, HTMLVideoElement) ? Xd(e, t) : Ve(e, HTMLIFrameElement) ? Yd(e, t) : e.cloneNode(Jl(e));
}
const Zd = (e) => e.tagName != null && e.tagName.toUpperCase() === "SLOT", Jl = (e) => e.tagName != null && e.tagName.toUpperCase() === "SVG";
async function eu(e, t, n) {
  var r, a;
  if (Jl(t))
    return t;
  let l = [];
  return Zd(e) && e.assignedNodes ? l = st(e.assignedNodes()) : Ve(e, HTMLIFrameElement) && (!((r = e.contentDocument) === null || r === void 0) && r.body) ? l = st(e.contentDocument.body.childNodes) : l = st(((a = e.shadowRoot) !== null && a !== void 0 ? a : e).childNodes), l.length === 0 || Ve(e, HTMLVideoElement) || await l.reduce((i, s) => i.then(() => _n(s, n)).then((o) => {
    o && t.appendChild(o);
  }), Promise.resolve()), t;
}
function tu(e, t, n) {
  const r = t.style;
  if (!r)
    return;
  const a = window.getComputedStyle(e);
  a.cssText ? (r.cssText = a.cssText, r.transformOrigin = a.transformOrigin) : Wl(n).forEach((l) => {
    let i = a.getPropertyValue(l);
    l === "font-size" && i.endsWith("px") && (i = `${Math.floor(parseFloat(i.substring(0, i.length - 2))) - 0.1}px`), Ve(e, HTMLIFrameElement) && l === "display" && i === "inline" && (i = "block"), l === "d" && t.getAttribute("d") && (i = `path(${t.getAttribute("d")})`), r.setProperty(l, i, a.getPropertyPriority(l));
  });
}
function nu(e, t) {
  Ve(e, HTMLTextAreaElement) && (t.innerHTML = e.value), Ve(e, HTMLInputElement) && t.setAttribute("value", e.value);
}
function ru(e, t) {
  if (Ve(e, HTMLSelectElement)) {
    const n = t, r = Array.from(n.children).find((a) => e.value === a.getAttribute("value"));
    r && r.setAttribute("selected", "");
  }
}
function au(e, t, n) {
  return Ve(t, Element) && (tu(e, t, n), Gd(e, t, n), nu(e, t), ru(e, t)), t;
}
async function lu(e, t) {
  const n = e.querySelectorAll ? e.querySelectorAll("use") : [];
  if (n.length === 0)
    return e;
  const r = {};
  for (let l = 0; l < n.length; l++) {
    const s = n[l].getAttribute("xlink:href");
    if (s) {
      const o = e.querySelector(s), c = document.querySelector(s);
      !o && c && !r[s] && (r[s] = await _n(c, t, !0));
    }
  }
  const a = Object.values(r);
  if (a.length) {
    const l = "http://www.w3.org/1999/xhtml", i = document.createElementNS(l, "svg");
    i.setAttribute("xmlns", l), i.style.position = "absolute", i.style.width = "0", i.style.height = "0", i.style.overflow = "hidden", i.style.display = "none";
    const s = document.createElementNS(l, "defs");
    i.appendChild(s);
    for (let o = 0; o < a.length; o++)
      s.appendChild(a[o]);
    e.appendChild(i);
  }
  return e;
}
async function _n(e, t, n) {
  return !n && t.filter && !t.filter(e) ? null : Promise.resolve(e).then((r) => Qd(r, t)).then((r) => eu(e, r, t)).then((r) => au(e, r, t)).then((r) => lu(r, t));
}
const Kl = /url\((['"]?)([^'"]+?)\1\)/g, ou = /url\([^)]+\)\s*format\((["']?)([^"']+)\1\)/g, iu = /src:\s*(?:url\([^)]+\)\s*format\([^)]+\)[,;]\s*)+/g;
function su(e) {
  const t = e.replace(/([.*+?^${}()|\[\]\/\\])/g, "\\$1");
  return new RegExp(`(url\\(['"]?)(${t})(['"]?\\))`, "g");
}
function cu(e) {
  const t = [];
  return e.replace(Kl, (n, r, a) => (t.push(a), n)), t.filter((n) => !nr(n));
}
async function du(e, t, n, r, a) {
  try {
    const l = n ? Pd(t, n) : t, i = br(t);
    let s;
    return a || (s = await vr(l, i, r)), e.replace(su(t), `$1${s}$3`);
  } catch {
  }
  return e;
}
function uu(e, { preferredFontFormat: t }) {
  return t ? e.replace(iu, (n) => {
    for (; ; ) {
      const [r, , a] = ou.exec(n) || [];
      if (!a)
        return "";
      if (a === t)
        return `src: ${r};`;
    }
  }) : e;
}
function Xl(e) {
  return e.search(Kl) !== -1;
}
async function Yl(e, t, n) {
  if (!Xl(e))
    return e;
  const r = uu(e, n);
  return cu(r).reduce((l, i) => l.then((s) => du(s, i, t, n)), Promise.resolve(r));
}
async function bt(e, t, n) {
  var r;
  const a = (r = t.style) === null || r === void 0 ? void 0 : r.getPropertyValue(e);
  if (a) {
    const l = await Yl(a, null, n);
    return t.style.setProperty(e, l, t.style.getPropertyPriority(e)), !0;
  }
  return !1;
}
async function mu(e, t) {
  await bt("background", e, t) || await bt("background-image", e, t), await bt("mask", e, t) || await bt("-webkit-mask", e, t) || await bt("mask-image", e, t) || await bt("-webkit-mask-image", e, t);
}
async function pu(e, t) {
  const n = Ve(e, HTMLImageElement);
  if (!(n && !nr(e.src)) && !(Ve(e, SVGImageElement) && !nr(e.href.baseVal)))
    return;
  const r = n ? e.src : e.href.baseVal, a = await vr(r, br(r), t);
  await new Promise((l, i) => {
    e.onload = l, e.onerror = t.onImageErrorHandler ? (...o) => {
      try {
        l(t.onImageErrorHandler(...o));
      } catch (c) {
        i(c);
      }
    } : i;
    const s = e;
    s.decode && (s.decode = l), s.loading === "lazy" && (s.loading = "eager"), n ? (e.srcset = "", e.src = a) : e.href.baseVal = a;
  });
}
async function fu(e, t) {
  const r = st(e.childNodes).map((a) => Ql(a, t));
  await Promise.all(r).then(() => e);
}
async function Ql(e, t) {
  Ve(e, Element) && (await mu(e, t), await pu(e, t), await fu(e, t));
}
function gu(e, t) {
  const { style: n } = e;
  t.backgroundColor && (n.backgroundColor = t.backgroundColor), t.width && (n.width = `${t.width}px`), t.height && (n.height = `${t.height}px`);
  const r = t.style;
  return r != null && Object.keys(r).forEach((a) => {
    n[a] = r[a];
  }), e;
}
const Da = {};
async function Fa(e) {
  let t = Da[e];
  if (t != null)
    return t;
  const r = await (await fetch(e)).text();
  return t = { url: e, cssText: r }, Da[e] = t, t;
}
async function Ga(e, t) {
  let n = e.cssText;
  const r = /url\(["']?([^"')]+)["']?\)/g, l = (n.match(/url\([^)]+\)/g) || []).map(async (i) => {
    let s = i.replace(r, "$1");
    return s.startsWith("https://") || (s = new URL(s, e.url).href), Vl(s, t.fetchRequestInit, ({ result: o }) => (n = n.replace(i, `url(${o})`), [i, o]));
  });
  return Promise.all(l).then(() => n);
}
function Ha(e) {
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
  const l = /@import[\s\S]*?url\([^)]*\)[\s\S]*?;/gi, i = "((\\s*?(?:\\/\\*[\\s\\S]*?\\*\\/)?\\s*?@media[\\s\\S]*?){([\\s\\S]*?)}\\s*?})|(([\\s\\S]*?){([\\s\\S]*?)})", s = new RegExp(i, "gi");
  for (; ; ) {
    let o = l.exec(r);
    if (o === null) {
      if (o = s.exec(r), o === null)
        break;
      l.lastIndex = s.lastIndex;
    } else
      s.lastIndex = l.lastIndex;
    t.push(o[0]);
  }
  return t;
}
async function yu(e, t) {
  const n = [], r = [];
  return e.forEach((a) => {
    if ("cssRules" in a)
      try {
        st(a.cssRules || []).forEach((l, i) => {
          if (l.type === CSSRule.IMPORT_RULE) {
            let s = i + 1;
            const o = l.href, c = Fa(o).then((d) => Ga(d, t)).then((d) => Ha(d).forEach((u) => {
              try {
                a.insertRule(u, u.startsWith("@import") ? s += 1 : a.cssRules.length);
              } catch (m) {
                console.error("Error inserting rule from remote css", {
                  rule: u,
                  error: m
                });
              }
            })).catch((d) => {
              console.error("Error loading remote css", d.toString());
            });
            r.push(c);
          }
        });
      } catch (l) {
        const i = e.find((s) => s.href == null) || document.styleSheets[0];
        a.href != null && r.push(Fa(a.href).then((s) => Ga(s, t)).then((s) => Ha(s).forEach((o) => {
          i.insertRule(o, i.cssRules.length);
        })).catch((s) => {
          console.error("Error loading remote stylesheet", s);
        })), console.error("Error inlining remote css file", l);
      }
  }), Promise.all(r).then(() => (e.forEach((a) => {
    if ("cssRules" in a)
      try {
        st(a.cssRules || []).forEach((l) => {
          n.push(l);
        });
      } catch (l) {
        console.error(`Error while reading CSS rules from ${a.href}`, l);
      }
  }), n));
}
function hu(e) {
  return e.filter((t) => t.type === CSSRule.FONT_FACE_RULE).filter((t) => Xl(t.style.getPropertyValue("src")));
}
async function Eu(e, t) {
  if (e.ownerDocument == null)
    throw new Error("Provided element is not within a Document");
  const n = st(e.ownerDocument.styleSheets), r = await yu(n, t);
  return hu(r);
}
function Zl(e) {
  return e.trim().replace(/["']/g, "");
}
function bu(e) {
  const t = /* @__PURE__ */ new Set();
  function n(r) {
    (r.style.fontFamily || getComputedStyle(r).fontFamily).split(",").forEach((l) => {
      t.add(Zl(l));
    }), Array.from(r.children).forEach((l) => {
      l instanceof HTMLElement && n(l);
    });
  }
  return n(e), t;
}
async function vu(e, t) {
  const n = await Eu(e, t), r = bu(e);
  return (await Promise.all(n.filter((l) => r.has(Zl(l.style.fontFamily))).map((l) => {
    const i = l.parentStyleSheet ? l.parentStyleSheet.href : null;
    return Yl(l.cssText, i, t);
  }))).join(`
`);
}
async function wu(e, t) {
  const n = t.fontEmbedCSS != null ? t.fontEmbedCSS : t.skipFonts ? null : await vu(e, t);
  if (n) {
    const r = document.createElement("style"), a = document.createTextNode(n);
    r.appendChild(a), e.firstChild ? e.insertBefore(r, e.firstChild) : e.appendChild(r);
  }
}
async function eo(e, t = {}) {
  const { width: n, height: r } = ql(e, t), a = await _n(e, t, !0);
  return await wu(a, t), await Ql(a, t), gu(a, t), await jd(a, n, r);
}
async function to(e, t = {}) {
  const { width: n, height: r } = ql(e, t), a = await eo(e, t), l = await En(a), i = document.createElement("canvas"), s = i.getContext("2d"), o = t.pixelRatio || Ld(), c = t.canvasWidth || n, d = t.canvasHeight || r;
  return i.width = c * o, i.height = d * o, t.skipAutoScale || Bd(i), i.style.width = `${c}`, i.style.height = `${d}`, t.backgroundColor && (s.fillStyle = t.backgroundColor, s.fillRect(0, 0, i.width, i.height)), s.drawImage(l, 0, 0, i.width, i.height), i;
}
async function Su(e, t = {}) {
  return (await to(e, t)).toDataURL();
}
const xu = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  toCanvas: to,
  toPng: Su,
  toSvg: eo
}, Symbol.toStringTag, { value: "Module" }));
