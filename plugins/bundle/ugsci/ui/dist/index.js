function R() {
  var t;
  const e = (t = window.QwenPaw) == null ? void 0 : t.host;
  if (!e) throw new Error("[ugsci] QwenPaw.host not available");
  return e;
}
function Wo() {
  try {
    return R().getApiToken() || "";
  } catch {
    return "";
  }
}
function On(e) {
  return R().getApiUrl(e);
}
function Ho(e) {
  const t = Wo();
  return {
    "Content-Type": "application/json",
    ...t ? { Authorization: `Bearer ${t}` } : {},
    ...e
  };
}
function qo(e) {
  const t = new Headers(e), n = {};
  return t.forEach((r, i) => {
    n[i] = r;
  }), n;
}
function ct(e, t) {
  const n = R(), r = qo(t == null ? void 0 : t.headers);
  return n.fetch ? n.fetch(e, { ...t, headers: r }) : fetch(n.getApiUrl(e), {
    ...t,
    headers: { ...Ho(), ...r }
  });
}
const rn = /* @__PURE__ */ new Map(), Jo = 15e3;
function Vo(e) {
  return e ? e instanceof Headers ? e.get("X-Agent-Id") || e.get("x-agent-id") || "" : e["X-Agent-Id"] || e["x-agent-id"] || "" : "";
}
function Ko(e, t, n) {
  return `${e}:${t}:${n}`;
}
function un() {
  rn.clear();
}
function wr(e) {
  for (const [t, n] of rn)
    (e ? n.agentId === e : n.agentId) && rn.delete(t);
}
async function me(e, t) {
  const n = ((t == null ? void 0 : t.method) || "GET").toUpperCase(), { bypassCache: r, ...i } = t || {}, a = Vo(
    i.headers
  ), o = Ko(n, e, a);
  if (n !== "GET" && (a ? wr(a) : un()), n === "GET" && !r) {
    const d = rn.get(o);
    if (d && Date.now() - d.ts < Jo)
      return d.data;
  }
  const l = await ct(e, i);
  if (!l.ok) {
    const d = await l.text().catch(() => "");
    throw new Error(d || `HTTP ${l.status}`);
  }
  if (l.status === 204) return null;
  const s = await l.json();
  return n === "GET" && rn.set(o, {
    data: s,
    ts: Date.now(),
    agentId: a || void 0
  }), s;
}
const Ke = {
  background: "#0072f5",
  color: "#fff",
  fontSize: 13,
  fontWeight: 600,
  border: "none",
  borderRadius: 8
};
function Mn(e, t) {
  const n = R();
  return n.ReactMarkdown && n.remarkGfm ? t.createElement(
    n.ReactMarkdown,
    { remarkPlugins: [n.remarkGfm] },
    e
  ) : e.replace(/\*\*(.+?)\*\*/g, "$1").replace(/\*(.+?)\*/g, "$1").replace(/`(.+?)`/g, "$1").replace(/^#+\s*/gm, "").replace(/^[-*]\s+/gm, "• ");
}
function Ln({
  title: e,
  subtitle: t,
  extra: n
}) {
  const r = R().React, { Space: i } = R().antd;
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
    n ? r.createElement(i, null, n) : null
  );
}
async function Bn() {
  const e = await me("/agents");
  return (e == null ? void 0 : e.agents) || [];
}
async function Sr(e) {
  return me(
    `/agents/${encodeURIComponent(e)}`
  );
}
async function jn(e) {
  return await me(
    `/agents/${encodeURIComponent(e)}/skills`
  ) || [];
}
async function Un(e = !1) {
  return await me(`/skills/pool${e ? "?summary=true" : ""}`) || [];
}
async function Xo(e) {
  const t = await me(
    `/skills/pool/${encodeURIComponent(e)}/content`
  );
  return (t == null ? void 0 : t.content) || "";
}
async function Yo() {
  return (await me(
    "/skills/workspaces"
  ) || []).map((t) => ({
    agent_id: t.agent_id,
    agent_name: t.agent_name || "",
    // Current hosts return skill_names. Keep the legacy fallback so the
    // plugin remains compatible with older QwenPaw releases.
    skill_names: Array.isArray(t.skill_names) ? t.skill_names : Array.isArray(t.skills) ? t.skills.map((n) => n.name) : []
  }));
}
function Bt(e, t = "") {
  return `/agents/${encodeURIComponent(e)}/skills${t}`;
}
function ci(e) {
  var n;
  const t = [];
  for (const r of e) {
    if (r.enabled === !1) continue;
    const i = (n = r.description) == null ? void 0 : n.trim();
    if (!i) continue;
    const a = (r.name || i).length > 20 ? (r.name || i).substring(0, 18) + "…" : r.name || i;
    let o = i;
    if (o = o.replace(/\*\*(.+?)\*\*/g, "$1").replace(/\*(.+?)\*/g, "$1").replace(/`(.+?)`/g, "$1").replace(/^#+\s*/gm, "").trim(), /^(用于|帮助|提供|支持|实现|完成|分析|计算|生成|创建|检查)/.test(o) ? o = `请${o}` : /^(a |an |the )/i.test(o) ? o = `Help me with ${o}` : /[。？！.?!]$/.test(o) || (o = `帮我${o}`), o.length > 80 && (o = o.substring(0, 77) + "..."), t.push({ label: a, value: o }), t.length >= 4) break;
  }
  return t;
}
async function Zo(e) {
  return await me("/workspace/files", {
    headers: { "X-Agent-Id": e }
  }) || [];
}
async function zt(e, t, n) {
  return me(`/workspace/files/${encodeURIComponent(t)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify({ content: n })
  });
}
async function Qo(e, t, n, r) {
  return me("/workspace/prompt-files", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify({ filename: t, content: n, enable: r })
  });
}
const es = /* @__PURE__ */ new Set([
  "CON",
  "PRN",
  "AUX",
  "NUL",
  ...Array.from({ length: 9 }, (e, t) => `COM${t + 1}`),
  ...Array.from({ length: 9 }, (e, t) => `LPT${t + 1}`)
]);
function ts(e) {
  let t = e.trim();
  if (!t) throw new Error("请输入文件名");
  if (/[\\/]/.test(t)) throw new Error("文件名不能包含路径分隔符");
  if (/[<>:\"|?*\u0000-\u001f]/.test(t))
    throw new Error("文件名包含系统不支持的字符");
  if (/[ .]$/.test(t)) throw new Error("文件名不能以空格或句点结尾");
  t.toLowerCase().endsWith(".md") ? t = `${t.slice(0, -3)}.md` : t += ".md";
  const n = t.split(".", 1)[0].toUpperCase();
  if (!t.slice(0, -3)) throw new Error("文件名不能为空");
  if (es.has(n))
    throw new Error("该文件名是系统保留名称，请更换");
  if (new TextEncoder().encode(t).length > 255)
    throw new Error("文件名过长");
  return t;
}
async function ns(e, t) {
  const n = await Sr(e);
  n.system_prompt_files = t, await me(`/agents/${encodeURIComponent(e)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(n)
  });
}
async function xr(e, t) {
  await me("/skills/pool/download", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      skill_name: t,
      targets: [{ workspace_id: e }],
      overwrite: !1
    })
  });
}
async function di(e, t) {
  await me(
    Bt(e, `/${encodeURIComponent(t)}/enable`),
    {
      method: "POST"
    }
  );
}
async function _r(e, t) {
  await me(Bt(e, `/${encodeURIComponent(t)}`), {
    method: "DELETE"
  });
}
async function rs(e, t) {
  return me(Bt(e, "/batch-enable"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(t)
  });
}
async function as(e, t) {
  return me(Bt(e, "/batch-disable"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(t)
  });
}
async function is(e, t) {
  return me(Bt(e, "/batch-delete"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(t)
  });
}
async function kr(e) {
  return await me("/mcp", {
    headers: { "X-Agent-Id": e }
  }) || [];
}
async function ui(e, t) {
  await me(`/mcp/${encodeURIComponent(t)}`, {
    method: "DELETE",
    headers: { "X-Agent-Id": e }
  });
}
async function Cr(e, t) {
  return me("/mcp", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify(t)
  });
}
async function os(e, t) {
  return me(
    `/mcp/toggle/${encodeURIComponent(t)}`,
    {
      method: "PATCH",
      headers: { "X-Agent-Id": e }
    }
  );
}
async function mi(e, t) {
  await me(
    Bt(e, `/${encodeURIComponent(t)}/disable`),
    {
      method: "POST"
    }
  );
}
async function ss(e) {
  await me(`/skills/pool/${encodeURIComponent(e)}`, {
    method: "DELETE"
  });
}
function ls(e) {
  const t = (e || "").trim();
  if (!t) return { number: 6, unit: "h" };
  const n = t.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/i);
  if (!n) return { number: 6, unit: "h" };
  const r = parseInt(n[1] || "0", 10), i = parseInt(n[2] || "0", 10), a = parseInt(n[3] || "0", 10), o = r * 60 + i + Math.round(a / 60);
  return o <= 0 ? { number: 6, unit: "h" } : o >= 60 && o % 60 === 0 ? { number: o / 60, unit: "h" } : { number: o, unit: "m" };
}
function cs(e) {
  return e.unit === "h" ? `${e.number}h` : `${e.number}m`;
}
async function ds(e) {
  return me("/config/heartbeat", {
    headers: { "X-Agent-Id": e }
  });
}
async function us(e, t) {
  return me("/config/heartbeat", {
    method: "PUT",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify(t)
  });
}
async function ms(e) {
  await me("/config/heartbeat/run", {
    method: "POST",
    headers: { "X-Agent-Id": e }
  });
}
async function ps(e) {
  return me("/workspace/running-config", {
    headers: { "X-Agent-Id": e }
  });
}
async function fs(e, t) {
  return me("/workspace/running-config", {
    method: "PUT",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify(t)
  });
}
async function gs(e) {
  return (await me("/workspace/language", {
    headers: { "X-Agent-Id": e }
  })).language || "zh";
}
async function ys(e, t) {
  await me("/workspace/language", {
    method: "PUT",
    headers: { "Content-Type": "application/json", "X-Agent-Id": e },
    body: JSON.stringify({ language: t })
  });
}
async function hs() {
  return (await me("/config/user-timezone")).timezone || "UTC";
}
async function Es(e) {
  await me("/config/user-timezone", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ timezone: e })
  });
}
async function bs(e) {
  return await me("/workspace/system-prompt-files", {
    headers: { "X-Agent-Id": e }
  }) || [];
}
const pa = ["AGENTS.md", "SOUL.md", "PROFILE.md"];
function vs({
  items: e,
  max: t = 5,
  color: n = "blue",
  emptyText: r = "无"
}) {
  const i = R().React, { Tag: a } = R().antd;
  return !e || e.length === 0 ? i.createElement(
    "span",
    { style: { fontSize: 12, color: "var(--ant-color-text-quaternary, #bfbfbf)" } },
    r
  ) : i.createElement(
    "div",
    { style: { display: "flex", flexWrap: "wrap", gap: 4 } },
    ...e.slice(0, t).map(
      (o, l) => i.createElement(
        a,
        { key: l, color: n, style: { fontSize: 11, marginRight: 0 } },
        o
      )
    ),
    e.length > t ? i.createElement(
      a,
      { style: { fontSize: 11, marginRight: 0 } },
      `+${e.length - t}`
    ) : null
  );
}
function pi({
  open: e,
  onClose: t,
  poolSkills: n,
  installedSkillNames: r,
  loading: i,
  onInstall: a
}) {
  const o = R().React, { useState: l, useEffect: s, useMemo: d } = o, { Modal: c, Button: m, Empty: u, Spin: p, Input: b, Tag: g, Tooltip: E, Typography: f } = R().antd, { CheckOutlined: h, SearchOutlined: v } = R().antdIcons || {}, { Text: w } = f, [x, j] = l([]), [X, T] = l("");
  s(() => {
    e && (j([]), T(""));
  }, [e]);
  const A = d(() => {
    if (!X.trim()) return n;
    const k = X.toLowerCase();
    return n.filter(
      (z) => {
        var B, _;
        return z.name.toLowerCase().includes(k) || ((B = z.description) == null ? void 0 : B.toLowerCase().includes(k)) || ((_ = z.tags) == null ? void 0 : _.some((L) => L.toLowerCase().includes(k)));
      }
    );
  }, [n, X]), F = A.filter(
    (k) => !r.includes(k.name)
  ), N = (k) => {
    j(
      (z) => z.includes(k) ? z.filter((B) => B !== k) : [...z, k]
    );
  }, C = async () => {
    x.length !== 0 && (await a(x), j([]));
  };
  return o.createElement(
    c,
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
          `已选择 ${x.length} 个技能`
        ),
        o.createElement(
          "div",
          { style: { display: "flex", gap: 8 } },
          o.createElement(m, { onClick: t }, "取消"),
          o.createElement(
            m,
            {
              type: "primary",
              onClick: C,
              disabled: x.length === 0
            },
            x.length > 0 ? `添加 (${x.length})` : "添加"
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
      o.createElement(b, {
        placeholder: "搜索技能名称、描述或标签...",
        prefix: v ? o.createElement(v) : void 0,
        value: X,
        onChange: (k) => T(k.target.value),
        allowClear: !0,
        style: { flex: 1 }
      }),
      o.createElement(
        m,
        {
          size: "small",
          type: "primary",
          onClick: () => j(F.map((k) => k.name))
        },
        "全选"
      ),
      o.createElement(
        m,
        {
          size: "small",
          onClick: () => j([])
        },
        "清空"
      )
    ),
    // Skill grid (card style matching Skill Center)
    i ? o.createElement(
      "div",
      { style: { textAlign: "center", padding: 40 } },
      o.createElement(p, { size: "large" })
    ) : A.length === 0 ? o.createElement(u, {
      description: X ? "未找到匹配的技能" : "技能池暂无可用技能",
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
      ...A.map((k) => {
        const z = x.includes(k.name), B = r.includes(k.name);
        return o.createElement(
          "div",
          {
            key: k.name,
            onClick: () => !B && N(k.name),
            style: {
              position: "relative",
              padding: "10px 12px",
              border: `1px solid ${z ? "#0072f5" : "var(--ant-color-border-secondary, #e8e8e8)"}`,
              borderRadius: 6,
              cursor: B ? "not-allowed" : "pointer",
              transition: "all 0.15s ease",
              background: z ? "rgba(0, 114, 245, 0.06)" : B ? "var(--ant-color-fill-quaternary, #fafafa)" : "var(--ant-color-bg-container, #fff)",
              opacity: B ? 0.5 : 1,
              minHeight: 64
            }
          },
          z ? o.createElement(
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
            h ? o.createElement(h) : "✓"
          ) : null,
          B ? o.createElement(
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
                paddingRight: B || z ? 24 : 0
              }
            },
            o.createElement(
              "span",
              { style: { fontSize: 16 } },
              k.emoji || "⚡"
            ),
            o.createElement(
              E,
              { title: k.name },
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
                k.name
              )
            )
          ),
          k.description ? o.createElement(
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
          k.tags && k.tags.length > 0 ? o.createElement(
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
              (_, L) => o.createElement(
                g,
                {
                  key: L,
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
function fi({
  agentId: e,
  systemPromptFiles: t,
  onRefresh: n
}) {
  const r = R().React, { useState: i, useEffect: a, useCallback: o, useRef: l } = r, {
    List: s,
    Tag: d,
    Switch: c,
    Button: m,
    Modal: u,
    Input: p,
    Spin: b,
    Empty: g,
    message: E,
    Typography: f,
    Segmented: h,
    Alert: v
  } = R().antd, { FileTextOutlined: w, PlusOutlined: x, EditOutlined: j, ReloadOutlined: X } = R().antdIcons || {}, { Text: T } = f, [A, F] = i([]), [N, C] = i(!0), [k, z] = i(
    t || []
  ), [B, _] = i(!1), [L, D] = i(null), [Y, O] = i(""), [I, q] = i(""), [H, U] = i(!1), [M, ne] = i("source"), re = l(0), K = o(async () => {
    const G = ++re.current;
    C(!0);
    try {
      const P = await Zo(e);
      G === re.current && F(P);
    } catch (P) {
      G === re.current && (E.error(P.message || "加载工作区文档失败"), F([]));
    } finally {
      G === re.current && C(!1);
    }
  }, [e]);
  a(() => {
    K();
  }, [K]), a(() => {
    z(t || []);
  }, [t]);
  const pe = async (G, P) => {
    const le = new Set(k);
    if (P)
      le.add(G);
    else {
      if (pa.includes(G) && G === "AGENTS.md") {
        E.warning("AGENTS.md 是核心文件，不能停用");
        return;
      }
      le.delete(G);
    }
    const Ee = Array.from(le);
    z(Ee);
    try {
      await ns(e, Ee), E.success(P ? "已启用记忆文件" : "已停用记忆文件"), n();
    } catch (_e) {
      E.error(_e.message || "更新失败"), z(t || []);
    }
  }, ae = async (G) => {
    try {
      const P = await me(
        `/workspace/files/${encodeURIComponent(G)}`,
        { headers: { "X-Agent-Id": e } }
      );
      D(G), O(P.content || ""), ne("source"), _(!0);
    } catch (P) {
      E.error(P.message || "读取文件失败");
    }
  }, J = () => {
    D(null), O(""), q(""), ne("source"), _(!0);
  }, de = async () => {
    let G;
    try {
      G = ts(L || I);
    } catch (P) {
      E.warning(P.message || "文件名无效");
      return;
    }
    if (!Y.trim()) {
      E.warning("Markdown 文档不能为空");
      return;
    }
    if (new TextEncoder().encode(Y).length > 1024 * 1024) {
      E.warning("Markdown 文档不能超过 1 MB");
      return;
    }
    U(!0);
    try {
      if (L)
        await zt(e, G, Y);
      else {
        const P = await Qo(
          e,
          G,
          Y,
          !0
        );
        z(P.system_prompt_files);
      }
      E.success("保存成功"), _(!1), K(), n();
    } catch (P) {
      const le = P != null && P.message ? `：${P.message}` : "";
      E.error(
        L ? (P == null ? void 0 : P.message) || "保存失败" : `创建并挂载失败，服务端已回滚文件${le}`
      );
    } finally {
      U(!1);
    }
  };
  return N ? r.createElement(
    "div",
    { style: { textAlign: "center", padding: 40 } },
    r.createElement(b, { size: "large" })
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
          T,
          { strong: !0 },
          `工作区文档 (${A.length})`
        ),
        r.createElement(
          T,
          { type: "secondary", style: { fontSize: 12 } },
          `· ${k.length} 个已挂载到系统提示`
        )
      ),
      r.createElement(
        "div",
        { style: { display: "flex", gap: 8 } },
        r.createElement(
          m,
          {
            size: "small",
            icon: X ? r.createElement(X) : void 0,
            onClick: K
          },
          "刷新"
        ),
        r.createElement(
          m,
          {
            type: "primary",
            size: "small",
            icon: x ? r.createElement(x) : void 0,
            onClick: J
          },
          "新建 Markdown 文档"
        )
      )
    ),
    A.length === 0 ? r.createElement(g, {
      description: "暂无 Markdown 文档，点击「新建 Markdown 文档」添加",
      image: g.PRESENTED_IMAGE_SIMPLE
    }) : r.createElement(s, {
      dataSource: A,
      renderItem: (G) => {
        const P = k.includes(G.filename), le = pa.includes(G.filename);
        return r.createElement(
          s.Item,
          {
            actions: [
              r.createElement(
                m,
                {
                  type: "link",
                  size: "small",
                  icon: j ? r.createElement(j) : void 0,
                  onClick: () => ae(G.filename)
                },
                "编辑"
              )
            ]
          },
          r.createElement(s.Item.Meta, {
            avatar: r.createElement(w, {
              style: {
                fontSize: 20,
                color: P ? "#1677ff" : "var(--ant-color-text-quaternary, #bfbfbf)"
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
              r.createElement(T, null, G.filename),
              le ? r.createElement(
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
              `${(G.size / 1024).toFixed(1)} KB · 修改于 ${new Date(G.modified_time).toLocaleString()}`
            )
          }),
          r.createElement(c, {
            checked: P,
            size: "small",
            onChange: (Ee) => pe(G.filename, Ee)
          })
        );
      }
    }),
    // Edit/New file modal
    r.createElement(
      u,
      {
        open: B,
        onCancel: () => _(!1),
        title: L ? `编辑 ${L}` : "新建 Markdown 文档",
        width: 700,
        onOk: de,
        confirmLoading: H,
        okText: "保存"
      },
      L ? null : r.createElement(
        "div",
        { style: { marginBottom: 12 } },
        r.createElement(p, {
          placeholder: "文件名（如：油藏工程记忆库.md）",
          value: I,
          onChange: (G) => q(G.target.value),
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
        r.createElement(h, {
          size: "small",
          value: M,
          options: [
            { label: "源码", value: "source" },
            { label: "预览", value: "preview" }
          ],
          onChange: (G) => ne(G)
        }),
        r.createElement(
          T,
          { type: "secondary", style: { fontSize: 12 } },
          `${Y.length} 字符 · 约 ${Math.ceil(Y.length / 4)} tokens · ${L && k.includes(L) ? "已挂载" : L ? "未挂载" : "保存后自动挂载"}`
        )
      ),
      Y.trim() ? null : r.createElement(v, {
        type: "warning",
        showIcon: !0,
        message: "文档内容为空，保存前需要填写 Markdown 内容",
        style: { marginBottom: 10 }
      }),
      M === "source" ? r.createElement(p.TextArea, {
        value: Y,
        onChange: (G) => O(G.target.value),
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
        Mn(Y, r)
      )
    )
  );
}
function ws({
  skills: e,
  agentId: t
}) {
  const n = R().React, { useMemo: r } = n, {
    List: i,
    Tag: a,
    Typography: o,
    Empty: l,
    Button: s,
    message: d
  } = R().antd, { ThunderboltOutlined: c, CopyOutlined: m } = R().antdIcons || {}, { Text: u } = o, p = r(() => ci(e), [e]), b = (E) => {
    try {
      const f = R();
      f.setSelectedAgent && f.setSelectedAgent(t);
    } catch {
    }
    try {
      sessionStorage.setItem("ugsci_pending_prompt", E.value);
    } catch {
    }
    window.history.pushState({}, "", "/chat"), window.dispatchEvent(new PopStateEvent("popstate"));
  }, g = (E) => {
    var f;
    (f = navigator.clipboard) == null || f.writeText(E.value).then(() => {
      d.success("已复制到剪贴板");
    });
  };
  return p.length === 0 ? n.createElement(l, {
    description: "暂无推荐提问，请先为专家添加技能",
    image: l.PRESENTED_IMAGE_SIMPLE
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
      c ? n.createElement(c, {
        style: { fontSize: 14, color: "#1677ff" }
      }) : null,
      n.createElement(
        u,
        { strong: !0 },
        `推荐提问 (${p.length})`
      ),
      n.createElement(
        u,
        { type: "secondary", style: { fontSize: 12 } },
        "· 从技能描述中自动提取"
      )
    ),
    n.createElement(i, {
      dataSource: p,
      renderItem: (E, f) => n.createElement(
        i.Item,
        {
          actions: [
            n.createElement(
              s,
              {
                type: "link",
                size: "small",
                icon: m ? n.createElement(m) : void 0,
                onClick: () => g(E)
              },
              "复制"
            )
          ]
        },
        n.createElement(i.Item.Meta, {
          avatar: n.createElement(
            a,
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
              onClick: () => b(E)
            },
            E.value
          ),
          description: n.createElement(
            u,
            { type: "secondary", style: { fontSize: 12 } },
            E.label
          )
        })
      )
    })
  );
}
const Rt = {
  marginBottom: 4,
  fontSize: 13,
  fontWeight: 500,
  color: "rgba(0,0,0,0.85)",
  display: "flex",
  alignItems: "center",
  gap: 4
}, gi = { marginBottom: 16 }, yi = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "0 16px",
  marginBottom: 16
}, pt = {
  fontSize: 13,
  fontWeight: 600,
  color: "rgba(0,0,0,0.85)",
  marginBottom: 12,
  paddingBottom: 8,
  borderBottom: "1px solid #f0f0f0"
}, hi = {
  fontSize: 12,
  color: "rgba(0,0,0,0.45)",
  marginLeft: 8
};
function Ss({ agentId: e }) {
  const t = R().React, { useState: n, useEffect: r, useCallback: i } = t, {
    Switch: a,
    InputNumber: o,
    Select: l,
    Button: s,
    Spin: d,
    Space: c,
    Typography: m,
    message: u
  } = R().antd, { PlayCircleOutlined: p, SaveOutlined: b } = R().antdIcons || {}, { Text: g } = m, [E, f] = n(!0), [h, v] = n(!1), [w, x] = n(!1), [j, X] = n(!1), [T, A] = n(6), [F, N] = n("h"), [C, k] = n("main"), [z, B] = n(300), [_, L] = n(!1), [D, Y] = n("08:00"), [O, I] = n("22:00"), q = i(async () => {
    var K, pe;
    f(!0);
    try {
      const ae = await ds(e), J = ls(ae.every ?? "6h");
      X(ae.enabled ?? !1), A(J.number), N(J.unit), k(ae.target ?? "main"), B(ae.timeoutSeconds ?? 300), L(!!ae.activeHours), Y(((K = ae.activeHours) == null ? void 0 : K.start) ?? "08:00"), I(((pe = ae.activeHours) == null ? void 0 : pe.end) ?? "22:00");
    } catch (ae) {
      u.error(ae.message || "加载心跳配置失败");
    } finally {
      f(!1);
    }
  }, [e]);
  r(() => {
    q();
  }, [q]);
  const H = async () => {
    v(!0);
    try {
      await us(e, {
        enabled: j,
        every: cs({ number: T, unit: F }),
        target: C,
        timeoutSeconds: z,
        activeHours: _ && D && O ? { start: D, end: O } : void 0
      }), u.success("心跳配置已保存");
    } catch (K) {
      u.error(K.message || "保存心跳配置失败");
    } finally {
      v(!1);
    }
  }, U = async () => {
    x(!0);
    try {
      await ms(e), u.success("已触发心跳检查");
    } catch (K) {
      u.error(K.message || "触发心跳失败");
    } finally {
      x(!1);
    }
  };
  if (E)
    return t.createElement(
      "div",
      { style: { textAlign: "center", padding: 40 } },
      t.createElement(d, { size: "large" })
    );
  const M = (K, pe, ae) => t.createElement(
    "div",
    { style: gi },
    t.createElement("div", { style: Rt }, K),
    pe,
    ae ? t.createElement(
      g,
      { type: "secondary", style: hi },
      ae
    ) : null
  ), ne = (K, pe, ae, J) => t.createElement(
    "div",
    { style: yi },
    t.createElement(
      "div",
      null,
      t.createElement("div", { style: Rt }, K),
      pe
    ),
    t.createElement(
      "div",
      null,
      t.createElement("div", { style: Rt }, ae),
      J
    )
  ), { Divider: re } = R().antd;
  return t.createElement(
    "div",
    { style: { paddingBottom: 8 } },
    // ── Section: 基本设置 ──
    t.createElement("div", { style: pt }, "基本设置"),
    M(
      "启用心跳",
      t.createElement(a, {
        checked: j,
        onChange: (K) => X(K)
      }),
      j ? "已启用，专家将定期自检" : "已停用"
    ),
    ne(
      "检查频率",
      t.createElement(
        c,
        null,
        t.createElement(o, {
          min: 1,
          value: T,
          onChange: (K) => A(K ?? 1),
          style: { width: "100%" }
        }),
        t.createElement(l, {
          value: F,
          onChange: (K) => N(K),
          style: { width: 90 },
          options: [
            { value: "m", label: "分钟" },
            { value: "h", label: "小时" }
          ]
        })
      ),
      "心跳目标",
      t.createElement(l, {
        value: C,
        onChange: (K) => k(K),
        style: { width: "100%" },
        options: [
          { value: "main", label: "主会话 (main)" },
          { value: "last", label: "最近会话 (last)" },
          { value: "inbox", label: "收件箱 (inbox)" }
        ]
      })
    ),
    M(
      "超时时间 (秒)",
      t.createElement(o, {
        min: 1,
        max: 3600,
        value: z,
        onChange: (K) => B(K ?? 300),
        style: { width: 200 }
      })
    ),
    // ── Section: 活跃时段 ──
    t.createElement(re, { style: { margin: "8px 0 16px" } }),
    t.createElement("div", { style: pt }, "活跃时段"),
    M(
      "启用活跃时段限制",
      t.createElement(a, {
        checked: _,
        onChange: (K) => L(K)
      }),
      "仅在指定时段内触发心跳"
    ),
    _ ? ne(
      "开始时间",
      t.createElement("input", {
        type: "time",
        value: D,
        onChange: (K) => Y(K.target.value),
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
        onChange: (K) => I(K.target.value),
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
          icon: b ? t.createElement(b) : void 0,
          loading: h,
          onClick: H,
          style: Ke
        },
        "保存配置"
      ),
      t.createElement(
        s,
        {
          icon: p ? t.createElement(p) : void 0,
          loading: w,
          onClick: U
        },
        "立即执行"
      )
    )
  );
}
function xs({
  agentId: e,
  onRefresh: t
}) {
  const n = R().React, { useState: r, useEffect: i, useCallback: a } = n, {
    List: o,
    Tag: l,
    Switch: s,
    Button: d,
    Empty: c,
    Spin: m,
    Typography: u,
    message: p
  } = R().antd, { PlusOutlined: b, ReloadOutlined: g, DeleteOutlined: E } = R().antdIcons || {}, { Text: f, Paragraph: h } = u, [v, w] = r([]), [x, j] = r(!0), [X, T] = r(!1), [A, F] = r([]), [N, C] = r(!1), k = a(async () => {
    j(!0);
    try {
      const Y = await jn(e);
      w(Y);
    } catch (Y) {
      p.error(Y.message || "加载技能失败"), w([]);
    } finally {
      j(!1);
    }
  }, [e]);
  i(() => {
    k();
  }, [k]);
  const z = async () => {
    T(!0), C(!0);
    try {
      const Y = await Un(!0);
      F(Y);
    } catch (Y) {
      p.error(Y.message || "加载技能池失败");
    } finally {
      C(!1);
    }
  }, B = async (Y) => {
    let O = 0, I = 0;
    for (const q of Y)
      try {
        await xr(e, q), O++;
      } catch {
        I++;
      }
    O > 0 ? (p.success(
      `成功添加 ${O} 个技能${I > 0 ? `，${I} 个失败` : ""}`
    ), k(), t()) : I > 0 && p.error("添加技能失败"), T(!1);
  }, _ = async (Y, O) => {
    try {
      O ? await di(e, Y.name) : await mi(e, Y.name), p.success(O ? "已启用" : "已停用"), k(), t();
    } catch (I) {
      p.error(I.message || "操作失败");
    }
  }, L = async (Y) => {
    try {
      await _r(e, Y), p.success(`技能「${Y}」已移除`), k(), t();
    } catch (O) {
      p.error(O.message || "移除技能失败");
    }
  };
  if (x)
    return n.createElement(
      "div",
      { style: { textAlign: "center", padding: 40 } },
      n.createElement(m, { size: "large" })
    );
  const D = v.filter((Y) => Y.enabled !== !1);
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
        `技能列表 (${v.length}，已启用 ${D.length})`
      ),
      n.createElement(
        "div",
        { style: { display: "flex", gap: 8 } },
        n.createElement(
          d,
          {
            size: "small",
            icon: g ? n.createElement(g) : void 0,
            onClick: () => {
              un(), k();
            }
          },
          "刷新"
        ),
        n.createElement(
          d,
          {
            type: "primary",
            size: "small",
            icon: b ? n.createElement(b) : void 0,
            onClick: z,
            style: Ke
          },
          "从技能池添加"
        )
      )
    ),
    v.length === 0 ? n.createElement(c, {
      description: "该专家暂无技能",
      image: c.PRESENTED_IMAGE_SIMPLE
    }) : n.createElement(o, {
      dataSource: v,
      renderItem: (Y) => n.createElement(
        o.Item,
        {
          actions: [
            n.createElement(s, {
              key: "toggle",
              size: "small",
              checked: Y.enabled !== !1,
              onChange: (O) => _(Y, O)
            }),
            n.createElement(
              d,
              {
                key: "del",
                type: "link",
                size: "small",
                danger: !0,
                icon: E ? n.createElement(E) : void 0,
                onClick: () => L(Y.name)
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
            Y.emoji ? n.createElement(
              "span",
              { style: { fontSize: 16 } },
              Y.emoji
            ) : null,
            n.createElement(f, { strong: !0 }, Y.name),
            Y.version_text ? n.createElement(
              l,
              { style: { fontSize: 10 } },
              `v${Y.version_text}`
            ) : null
          ),
          Y.description ? n.createElement(
            h,
            {
              type: "secondary",
              style: { fontSize: 12, margin: 0 },
              ellipsis: { rows: 2 }
            },
            Y.description
          ) : null
        )
      )
    }),
    n.createElement(pi, {
      open: X,
      onClose: () => T(!1),
      poolSkills: A,
      installedSkillNames: v.map((Y) => Y.name),
      loading: N,
      onInstall: B
    })
  );
}
function _s({
  agentId: e,
  onRefresh: t,
  isActive: n
}) {
  const r = R().React, { useState: i, useEffect: a, useCallback: o } = r, {
    List: l,
    Tag: s,
    Button: d,
    Empty: c,
    Spin: m,
    Modal: u,
    Input: p,
    Typography: b,
    message: g
  } = R().antd, { PlusOutlined: E, ReloadOutlined: f, DeleteOutlined: h } = R().antdIcons || {}, { Text: v, Paragraph: w } = b, { TextArea: x } = p, [j, X] = i([]), [T, A] = i(!0), [F, N] = i(!1), [C, k] = i(`{
  "mcpServers": {
    "example-client": {
      "command": "npx",
      "args": ["-y", "@example/mcp-server"],
      "env": {}
    }
  }
}`), [z, B] = i(!1), _ = o(async () => {
    A(!0);
    try {
      const O = await kr(e);
      X(O);
    } catch (O) {
      g.error(O.message || "加载 MCP 失败"), X([]);
    } finally {
      A(!1);
    }
  }, [e]);
  a(() => {
    _();
  }, [_]), a(() => {
    n && _();
  }, [n, _]);
  const L = async (O) => {
    try {
      await os(e, O), g.success("已切换 MCP 状态"), _(), t();
    } catch (I) {
      g.error(I.message || "切换失败");
    }
  }, D = async (O) => {
    try {
      await ui(e, O), g.success(`MCP「${O}」已移除`), _(), t();
    } catch (I) {
      g.error(I.message || "移除 MCP 失败");
    }
  }, Y = async () => {
    B(!0);
    try {
      const O = JSON.parse(C), I = O.mcpServers || O, q = Object.entries(I);
      if (q.length === 0) {
        g.warning("未找到 MCP 客户端配置");
        return;
      }
      for (const [H, U] of q) {
        const M = U, ne = M.url ? "streamable_http" : "stdio";
        await Cr(e, {
          client_key: H,
          client: {
            name: M.name || H,
            description: M.description || "",
            enabled: !0,
            transport: ne,
            url: M.url || "",
            command: M.command || "",
            args: M.args || [],
            env: M.env || {},
            cwd: M.cwd || "",
            headers: M.headers || {}
          }
        });
      }
      g.success("MCP 客户端已创建"), N(!1), _(), t();
    } catch (O) {
      O instanceof SyntaxError ? g.error("JSON 格式错误：" + O.message) : g.error(O.message || "创建 MCP 失败");
    } finally {
      B(!1);
    }
  };
  return T ? r.createElement(
    "div",
    { style: { textAlign: "center", padding: 40 } },
    r.createElement(m, { size: "large" })
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
      r.createElement(v, { strong: !0 }, `MCP 客户端 (${j.length})`),
      r.createElement(
        "div",
        { style: { display: "flex", gap: 8 } },
        r.createElement(
          d,
          {
            size: "small",
            icon: f ? r.createElement(f) : void 0,
            onClick: () => {
              un(), _();
            }
          },
          "刷新"
        ),
        r.createElement(
          d,
          {
            type: "primary",
            size: "small",
            icon: E ? r.createElement(E) : void 0,
            onClick: () => N(!0),
            style: Ke
          },
          "添加 MCP"
        )
      )
    ),
    j.length === 0 ? r.createElement(c, {
      description: "该专家暂无 MCP 客户端",
      image: c.PRESENTED_IMAGE_SIMPLE
    }) : r.createElement(l, {
      dataSource: j,
      renderItem: (O) => r.createElement(
        l.Item,
        {
          actions: [
            r.createElement(
              d,
              {
                key: "toggle",
                size: "small",
                onClick: () => L(O.key)
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
                icon: h ? r.createElement(h) : void 0,
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
            r.createElement(v, { strong: !0 }, O.name || O.key),
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
      u,
      {
        open: F,
        title: "添加 MCP 客户端 (JSON)",
        onCancel: () => N(!1),
        onOk: Y,
        confirmLoading: z,
        okText: "创建",
        width: 560
      },
      r.createElement(
        "div",
        { style: { marginBottom: 8, fontSize: 12, color: "var(--ant-color-text-tertiary, #8c8c8c)" } },
        "粘贴 MCP 配置 JSON（支持 mcpServers 格式），将创建到当前专家工作区："
      ),
      r.createElement(x, {
        value: C,
        onChange: (O) => k(O.target.value),
        rows: 12,
        style: { fontFamily: "monospace", fontSize: 12 }
      })
    )
  );
}
function ks({ agentId: e }) {
  const t = R().React, { useState: n, useEffect: r, useCallback: i, useRef: a } = t, {
    Card: o,
    InputNumber: l,
    Input: s,
    Select: d,
    Switch: c,
    Button: m,
    Spin: u,
    Space: p,
    Typography: b,
    Divider: g,
    message: E
  } = R().antd, { SaveOutlined: f } = R().antdIcons || {}, { Text: h } = b, [v, w] = n(!0), [x, j] = n(!1), X = a(null), [T, A] = n(60), [F, N] = n(""), [C, k] = n(!0), [z, B] = n(30), [_, L] = n("zh"), [D, Y] = n("UTC"), [O, I] = n(!0), [q, H] = n(100), [U, M] = n(!0), [ne, re] = n(3), [K, pe] = n(1), [ae, J] = n(!0), [de, G] = n(3), [P, le] = n(2), [Ee, _e] = n(60), [ke, Se] = n(1), [fe, Te] = n(0), [Ce, Q] = n(1), [Z, ce] = n(0), [he, y] = n(30), [V, $] = n(50), [ue, ye] = n("light"), [be, Ae] = n("scroll"), [Be, Le] = n("remelight"), [nt, Ge] = n("AUTO"), rt = i(async () => {
    var ie, Oe, $e, Ne, at, it;
    w(!0);
    try {
      const [ze, We, He] = await Promise.all([
        ps(e),
        gs(e).catch(() => "zh"),
        hs().catch(() => "UTC")
      ]);
      X.current = ze, A(ze.shell_command_timeout ?? 60), N(ze.shell_command_executable ?? "");
      const st = ze.auto_title_config ?? { enabled: !0, timeout_seconds: 30 };
      k(st.enabled ?? !0), B(st.timeout_seconds ?? 30), L(We), Y(He);
      const qe = ze.loop ?? {};
      I(((ie = qe.iteration) == null ? void 0 : ie.enabled) ?? !0), H(((Oe = qe.iteration) == null ? void 0 : Oe.max_iterations) ?? ze.max_iters ?? 100), M((($e = qe.doom_loop) == null ? void 0 : $e.enabled) ?? !0), re(((Ne = qe.doom_loop) == null ? void 0 : Ne.window_size) ?? 3), pe(((at = qe.doom_loop) == null ? void 0 : at.similarity_threshold) ?? 1), J(ze.llm_retry_enabled ?? !0), G(ze.llm_max_retries ?? 3), le(ze.llm_backoff_base ?? 2), _e(ze.llm_backoff_cap ?? 60), Se(ze.llm_max_concurrent ?? 1), Te(ze.llm_max_qpm ?? 0), Q(ze.llm_rate_limit_pause ?? 1), ce(ze.llm_rate_limit_jitter ?? 0), y(ze.llm_acquire_timeout ?? 30), $(ze.history_max_length ?? 50), ye(ze.context_manager_backend ?? "light"), Ae(((it = ze.light_context_config) == null ? void 0 : it.strategy) ?? "scroll"), Le(ze.memory_manager_backend ?? "remelight"), Ge(ze.approval_level ?? "AUTO");
    } catch (ze) {
      E.error(ze.message || "加载运行配置失败");
    } finally {
      w(!1);
    }
  }, [e]);
  r(() => {
    rt();
  }, [rt]);
  const Ye = async () => {
    var Oe, $e;
    const ie = X.current;
    if (ie) {
      j(!0);
      try {
        const Ne = {
          ...ie,
          max_iters: q,
          loop: {
            ...ie.loop ?? {},
            iteration: { enabled: O, max_iterations: q },
            doom_loop: {
              enabled: U,
              window_size: ne,
              similarity_threshold: K,
              stages: (($e = (Oe = ie.loop) == null ? void 0 : Oe.doom_loop) == null ? void 0 : $e.stages) ?? []
            }
          },
          shell_command_timeout: T,
          shell_command_executable: F,
          auto_title_config: {
            enabled: C,
            timeout_seconds: z
          },
          llm_retry_enabled: ae,
          llm_max_retries: de,
          llm_backoff_base: P,
          llm_backoff_cap: Ee,
          llm_max_concurrent: ke,
          llm_max_qpm: fe,
          llm_rate_limit_pause: Ce,
          llm_rate_limit_jitter: Z,
          llm_acquire_timeout: he,
          history_max_length: V,
          context_manager_backend: ue,
          light_context_config: {
            ...ie.light_context_config ?? {},
            strategy: be
          },
          memory_manager_backend: Be,
          approval_level: nt
        };
        await fs(e, Ne), X.current = Ne, _ && await ys(e, _).catch(() => {
        }), D && await Es(D).catch(() => {
        }), E.success("运行配置已保存");
      } catch (Ne) {
        E.error(Ne.message || "保存运行配置失败");
      } finally {
        j(!1);
      }
    }
  };
  if (v)
    return t.createElement(
      "div",
      { style: { textAlign: "center", padding: 40 } },
      t.createElement(u, { size: "large" })
    );
  const W = (ie, Oe, $e) => t.createElement(
    "div",
    { style: gi },
    t.createElement("div", { style: Rt }, ie),
    Oe,
    $e ? t.createElement(
      h,
      { type: "secondary", style: hi },
      $e
    ) : null
  ), ge = (ie, Oe, $e, Ne) => t.createElement(
    "div",
    { style: yi },
    t.createElement(
      "div",
      null,
      t.createElement("div", { style: Rt }, ie),
      Oe
    ),
    t.createElement(
      "div",
      null,
      t.createElement("div", { style: Rt }, $e),
      Ne
    )
  );
  return t.createElement(
    "div",
    { style: { paddingBottom: 8 } },
    // ── Section: 基础设置 ──
    t.createElement(
      "div",
      { style: pt },
      "基础设置"
    ),
    ge(
      "Shell 命令超时 (秒)",
      t.createElement(l, {
        min: 1,
        value: T,
        onChange: (ie) => A(ie ?? 60),
        style: { width: "100%" }
      }),
      "Shell 可执行文件",
      t.createElement(s, {
        value: F,
        onChange: (ie) => N(ie.target.value),
        placeholder: "留空使用系统默认",
        style: { width: "100%" }
      })
    ),
    ge(
      "语言",
      t.createElement(d, {
        value: _,
        onChange: (ie) => L(ie),
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
        onChange: (ie) => Y(ie),
        style: { width: "100%" },
        showSearch: !0,
        filterOption: (ie, Oe) => {
          var $e;
          return ((($e = Oe == null ? void 0 : Oe.label) == null ? void 0 : $e.toString()) || "").toLowerCase().includes(ie.toLowerCase());
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
        ].map((ie) => ({ value: ie, label: ie }))
      })
    ),
    ge(
      "自动生成会话标题",
      t.createElement(p, null, t.createElement(c, {
        checked: C,
        onChange: (ie) => k(ie)
      })),
      "标题生成超时 (秒)",
      t.createElement(l, {
        min: 5,
        value: z,
        onChange: (ie) => B(ie ?? 30),
        style: { width: "100%" },
        disabled: !C
      })
    ),
    // ── Section: 审批级别 ──
    t.createElement(g, { style: { margin: "8px 0 16px" } }),
    t.createElement("div", { style: pt }, "审批级别"),
    W(
      "工具执行审批",
      t.createElement(d, {
        value: nt,
        onChange: (ie) => Ge(ie),
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
    t.createElement("div", { style: pt }, "迭代与循环"),
    W(
      "启用迭代限制",
      t.createElement(c, {
        checked: O,
        onChange: (ie) => I(ie)
      }),
      "停止 Agent 前的最大循环轮次"
    ),
    O ? W(
      "最大迭代次数",
      t.createElement(l, {
        min: 1,
        max: 500,
        value: q,
        onChange: (ie) => H(ie ?? 100),
        style: { width: "100%" }
      })
    ) : null,
    W(
      "启用重复循环保护",
      t.createElement(c, {
        checked: U,
        onChange: (ie) => M(ie)
      }),
      "检测并阻止重复操作循环"
    ),
    U ? ge(
      "检测窗口大小",
      t.createElement(l, {
        min: 2,
        max: 20,
        value: ne,
        onChange: (ie) => re(ie ?? 3),
        style: { width: "100%" }
      }),
      "相似度阈值",
      t.createElement(l, {
        min: 0,
        max: 1,
        step: 0.05,
        value: K,
        onChange: (ie) => pe(ie ?? 1),
        style: { width: "100%" }
      })
    ) : null,
    // ── Section: LLM 重试 ──
    t.createElement(g, { style: { margin: "8px 0 16px" } }),
    t.createElement("div", { style: pt }, "LLM 重试"),
    W(
      "启用 LLM 重试",
      t.createElement(c, {
        checked: ae,
        onChange: (ie) => J(ie)
      })
    ),
    ge(
      "最大重试次数",
      t.createElement(l, {
        min: 1,
        value: de,
        onChange: (ie) => G(ie ?? 3),
        style: { width: "100%" },
        disabled: !ae
      }),
      "退避基数 (秒)",
      t.createElement(l, {
        min: 0.1,
        step: 0.1,
        value: P,
        onChange: (ie) => le(ie ?? 2),
        style: { width: "100%" },
        disabled: !ae
      })
    ),
    W(
      "退避上限 (秒)",
      t.createElement(l, {
        min: 0.5,
        step: 0.5,
        value: Ee,
        onChange: (ie) => _e(ie ?? 60),
        style: { width: 200 },
        disabled: !ae
      })
    ),
    // ── Section: LLM 限流 ──
    t.createElement(g, { style: { margin: "8px 0 16px" } }),
    t.createElement("div", { style: pt }, "LLM 限流"),
    ge(
      "最大并发数",
      t.createElement(l, {
        min: 1,
        value: ke,
        onChange: (ie) => Se(ie ?? 1),
        style: { width: "100%" }
      }),
      "最大 QPM (0=不限)",
      t.createElement(l, {
        min: 0,
        step: 10,
        value: fe,
        onChange: (ie) => Te(ie ?? 0),
        style: { width: "100%" }
      })
    ),
    ge(
      "限流暂停时间 (秒)",
      t.createElement(l, {
        min: 1,
        step: 0.5,
        value: Ce,
        onChange: (ie) => Q(ie ?? 1),
        style: { width: "100%" }
      }),
      "限流抖动 (秒)",
      t.createElement(l, {
        min: 0,
        step: 0.5,
        value: Z,
        onChange: (ie) => ce(ie ?? 0),
        style: { width: "100%" }
      })
    ),
    W(
      "获取超时 (秒)",
      t.createElement(l, {
        min: 10,
        step: 10,
        value: he,
        onChange: (ie) => y(ie ?? 30),
        style: { width: 200 }
      }),
      "应大于 限流暂停 + 抖动"
    ),
    // ── Section: 上下文与记忆 ──
    t.createElement(g, { style: { margin: "8px 0 16px" } }),
    t.createElement("div", { style: pt }, "上下文与记忆"),
    ge(
      "上下文管理后端",
      t.createElement(d, {
        value: ue,
        onChange: (ie) => ye(ie),
        style: { width: "100%" },
        options: [{ value: "light", label: "light" }]
      }),
      "上下文策略",
      t.createElement(d, {
        value: be,
        onChange: (ie) => Ae(ie),
        style: { width: "100%" },
        options: [
          { value: "scroll", label: "scroll (滚动窗口)" },
          { value: "native", label: "native (原生)" }
        ]
      })
    ),
    ge(
      "记忆管理后端",
      t.createElement(d, {
        value: Be,
        onChange: (ie) => Le(ie),
        style: { width: "100%" },
        options: [
          { value: "remelight", label: "remelight" },
          { value: "adbpg", label: "adbpg" },
          { value: "none", label: "none (禁用)" }
        ]
      }),
      "历史消息最大长度",
      t.createElement(l, {
        min: 1,
        value: V,
        onChange: (ie) => $(ie ?? 50),
        style: { width: "100%" }
      })
    ),
    // ── Save button ──
    t.createElement(
      "div",
      { style: { display: "flex", justifyContent: "flex-end", marginTop: 16 } },
      t.createElement(
        m,
        {
          type: "primary",
          icon: f ? t.createElement(f) : void 0,
          loading: x,
          onClick: Ye,
          style: Ke
        },
        "保存运行配置"
      )
    )
  );
}
function Cs({
  expert: e,
  open: t,
  onClose: n,
  onRefresh: r
}) {
  const i = R().React, { useState: a, useEffect: o, useCallback: l } = i, { Modal: s, Tabs: d, Spin: c, Typography: m } = R().antd, { SettingOutlined: u } = R().antdIcons || {}, { Text: p } = m, [b, g] = a([]), [E, f] = a(!1), [h, v] = a("heartbeat"), w = l(async () => {
    if (e) {
      f(!0);
      try {
        const T = await bs(e.agent.id);
        g(T);
      } catch {
        g([]);
      } finally {
        f(!1);
      }
    }
  }, [e]);
  if (o(() => {
    t && e && w();
  }, [t, e, w]), !e) return null;
  const { agent: x } = e, j = () => {
    w(), r();
  }, X = [
    {
      key: "heartbeat",
      label: "心跳",
      children: i.createElement(Ss, {
        agentId: x.id
      })
    },
    {
      key: "files",
      label: "文件",
      children: E ? i.createElement(
        "div",
        { style: { textAlign: "center", padding: 40 } },
        i.createElement(c, { size: "large" })
      ) : i.createElement(fi, {
        agentId: x.id,
        systemPromptFiles: b,
        onRefresh: j
      })
    },
    {
      key: "skills",
      label: `技能 (${e.skills.filter((T) => T.enabled !== !1).length})`,
      children: i.createElement(xs, {
        agentId: x.id,
        onRefresh: r
      })
    },
    {
      key: "mcp",
      label: `MCP (${e.mcps.length})`,
      children: i.createElement(_s, {
        agentId: x.id,
        onRefresh: r,
        isActive: h === "mcp"
      })
    },
    {
      key: "running",
      label: "运行配置",
      children: i.createElement(ks, {
        agentId: x.id
      })
    }
  ];
  return i.createElement(
    s,
    {
      open: t,
      title: i.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 8 } },
        u ? i.createElement(u, { style: { fontSize: 18 } }) : null,
        i.createElement("span", null, `配置 - ${x.name}`),
        i.createElement(
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
    i.createElement(d, {
      items: X,
      activeKey: h,
      onChange: (T) => v(T),
      size: "small",
      tabBarStyle: { marginBottom: 16 }
    })
  );
}
const Ei = [
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
], Ts = Ei;
function fa(e) {
  return On(`/ugsci/avatar/${encodeURIComponent(e)}`);
}
function ga(e) {
  const t = e.map(encodeURIComponent).join(",");
  return On(`/ugsci/avatar/team/${t}`);
}
function dt({
  name: e,
  size: t = 32,
  borderRadius: n = "50%"
}) {
  const r = R().React, [i, a] = r.useState(0), o = i === 0 ? fa(e) : `${fa(e)}?_r=${i}`;
  return r.createElement("img", {
    src: o,
    alt: e,
    onError: () => {
      i < 1 && a(i + 1);
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
function Tr({
  members: e,
  size: t = 32,
  borderRadius: n = "50%"
}) {
  const r = R().React, [i, a] = r.useState(0);
  if (!e || e.length === 0)
    return r.createElement("span", {
      style: {
        width: t,
        height: t,
        display: "inline-block"
      }
    });
  const o = e.slice(0, 5), l = i === 0 ? ga(o) : `${ga(o)}?_r=${i}`;
  return r.createElement("img", {
    src: l,
    alt: "team",
    onError: () => {
      i < 1 && a(i + 1);
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
async function ya(e) {
  var n;
  const t = R();
  if (t.refreshAgents)
    try {
      await t.refreshAgents({ force: !0 });
    } catch (r) {
      console.warn("[ugsci] Failed to refresh newly created agent:", r);
      return;
    }
  (n = t.setSelectedAgent) == null || n.call(t, e);
}
function Is(e) {
  return e.slice(0, 2).join("、") + (e.length > 2 ? ` 等 ${e.length} 项` : "");
}
function As({
  expert: e,
  onClick: t,
  onSummon: n,
  onConfigure: r
}) {
  var w, x;
  const i = R().React, { Card: a, Badge: o, Button: l, Tooltip: s } = R().antd, { ThunderboltOutlined: d, SettingOutlined: c } = R().antdIcons || {}, { agent: m, skills: u } = e, p = m.enabled, b = u.filter((j) => j.enabled !== !1), g = Ei.find(
    (j) => j.id === m.id || j.name === m.name
  ), E = Array.from(
    new Set(
      (w = g == null ? void 0 : g.tags) != null && w.length ? g.tags : b.flatMap((j) => j.tags || [])
    )
  ).slice(0, 3), f = m.managed_by_app ? "应用专属专家" : (g == null ? void 0 : g.category) || (m.id === "default" ? "通用助手" : "自定义专家"), h = ((x = m.description) == null ? void 0 : x.trim()) || "", v = b.map((j) => j.name);
  return i.createElement(
    a,
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
    i.createElement(
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
      i.createElement(
        "div",
        {
          style: {
            display: "flex",
            alignItems: "center",
            gap: 11,
            minWidth: 0
          }
        },
        i.createElement(dt, { name: m.name, size: 42 }),
        i.createElement(
          "div",
          { style: { minWidth: 0 } },
          i.createElement(
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
            m.name
          ),
          i.createElement(
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
      i.createElement(
        "span",
        { style: { flexShrink: 0, whiteSpace: "nowrap" } },
        i.createElement(o, {
          status: p ? "success" : "default",
          text: p ? "启用" : "停用"
        })
      )
    ),
    i.createElement(
      "div",
      { style: { minHeight: 48, marginBottom: 12 } },
      i.createElement(
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
      E.length > 0 ? i.createElement(vs, {
        items: E,
        max: 3,
        color: "blue"
      }) : i.createElement(
        "span",
        {
          style: {
            fontSize: 12,
            color: "var(--ant-color-text-secondary, #595959)"
          }
        },
        v.length ? Is(v) : "尚未配置技能，可在专家配置中补充"
      )
    ),
    i.createElement(
      "div",
      { style: { marginTop: "auto", minHeight: 78 } },
      i.createElement(
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
      i.createElement(
        "div",
        {
          style: {
            color: "var(--ant-color-text-secondary, #595959)",
            fontSize: 13,
            lineHeight: 1.5,
            maxHeight: 58,
            overflow: "hidden"
          },
          title: h
        },
        h ? Mn(h, i) : "暂无描述"
      )
    ),
    i.createElement(
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
      i.createElement(
        s,
        { title: "配置专家", placement: "top" },
        i.createElement(l, {
          type: "text",
          size: "small",
          "aria-label": `配置 ${m.name}`,
          icon: c ? i.createElement(c, {
            style: {
              fontSize: 16,
              color: "var(--ant-color-text-tertiary, #8c8c8c)"
            }
          }) : void 0,
          onClick: (j) => {
            j.stopPropagation(), r && r();
          }
        })
      ),
      i.createElement(
        l,
        {
          type: "link",
          size: "small",
          onClick: (j) => {
            j.stopPropagation(), t();
          }
        },
        "查看详情"
      ),
      i.createElement(
        l,
        {
          type: "primary",
          size: "small",
          icon: d ? i.createElement(d) : void 0,
          disabled: !p,
          onClick: (j) => {
            j.stopPropagation(), n && n();
          },
          style: Ke
        },
        m.managed_by_app ? "打开应用" : "召唤专家"
      )
    )
  );
}
function $s({
  expert: e,
  open: t,
  onClose: n,
  onRefresh: r,
  onSummon: i
}) {
  const a = R().React, {
    Drawer: o,
    Descriptions: l,
    Tag: s,
    Typography: d,
    Space: c,
    Button: m,
    Empty: u,
    Tabs: p,
    List: b,
    Spin: g,
    Modal: E,
    message: f
  } = R().antd, { Text: h, Paragraph: v } = d, {
    EditOutlined: w,
    ThunderboltOutlined: x,
    FileTextOutlined: j,
    ToolOutlined: X,
    PlusOutlined: T
  } = R().antdIcons || {}, [A, F] = a.useState(!1), [N, C] = a.useState(
    []
  ), [k, z] = a.useState(!1);
  if (!e) return null;
  const { agent: B, config: _, skills: L, mcps: D, loading: Y } = e, O = L.filter((J) => J.enabled !== !1), I = (J) => {
    window.history.pushState({}, "", J), window.dispatchEvent(new PopStateEvent("popstate"));
  }, q = a.createElement(
    "div",
    null,
    a.createElement(
      l,
      { column: 1, bordered: !0, size: "small" },
      a.createElement(l.Item, { label: "专家名称" }, B.name),
      a.createElement(
        l.Item,
        { label: "专家 ID" },
        a.createElement("code", { style: { fontSize: 12 } }, B.id)
      ),
      a.createElement(
        l.Item,
        { label: "状态" },
        a.createElement(
          s,
          { color: B.enabled ? "green" : "default" },
          B.enabled ? "启用" : "停用"
        )
      ),
      a.createElement(
        l.Item,
        { label: "功能简介" },
        B.description ? Mn(B.description, a) : "暂无描述"
      ),
      a.createElement(
        l.Item,
        { label: "使用模型" },
        B.active_model ? `${B.active_model.provider_id} / ${B.active_model.model}` : "使用全局默认模型"
      ),
      _ != null && _.workspace_dir ? a.createElement(
        l.Item,
        { label: "工作区路径" },
        a.createElement(
          "code",
          { style: { fontSize: 11 } },
          _.workspace_dir
        )
      ) : null,
      _ != null && _.approval_level ? a.createElement(
        l.Item,
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
        j ? a.createElement(j, {
          style: { fontSize: 14, color: "#1677ff" }
        }) : null,
        a.createElement(h, { strong: !0 }, "系统提示词文件")
      ),
      a.createElement(
        c,
        { wrap: !0 },
        ..._.system_prompt_files.map(
          (J, de) => a.createElement(
            s,
            {
              key: de,
              icon: j ? a.createElement(j) : void 0,
              style: { fontSize: 12 }
            },
            J
          )
        )
      )
    ) : null
  ), H = async () => {
    F(!0), z(!0);
    try {
      const J = await Un(!0);
      C(J);
    } catch (J) {
      f.error(J.message || "加载技能池失败");
    } finally {
      z(!1);
    }
  }, U = async (J) => {
    let de = 0, G = 0;
    for (const P of J)
      try {
        await xr(B.id, P), de++;
      } catch {
        G++;
      }
    de > 0 ? (f.success(
      `成功添加 ${de} 个技能${G > 0 ? `，${G} 个失败` : ""}`
    ), r()) : G > 0 && f.error("添加技能失败"), F(!1);
  }, M = async (J) => {
    try {
      await _r(B.id, J), f.success(`技能「${J}」已移除`), r();
    } catch (de) {
      f.error(de.message || "移除技能失败");
    }
  }, ne = async (J) => {
    try {
      await ui(B.id, J), f.success(`MCP「${J}」已移除`), r();
    } catch (de) {
      f.error(de.message || "移除 MCP 失败");
    }
  }, re = Y ? a.createElement(
    "div",
    { style: { textAlign: "center", padding: 40 } },
    a.createElement(g, { size: "large" })
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
        `已启用技能 (${O.length})`
      ),
      a.createElement(
        m,
        {
          type: "primary",
          size: "small",
          icon: T ? a.createElement(T) : void 0,
          onClick: H
        },
        "从技能池添加"
      )
    ),
    O.length === 0 ? a.createElement(u, {
      description: "该专家暂无已启用的技能",
      image: u.PRESENTED_IMAGE_SIMPLE
    }) : a.createElement(b, {
      dataSource: O,
      renderItem: (J) => a.createElement(
        b.Item,
        {
          actions: [
            a.createElement(
              m,
              {
                type: "link",
                size: "small",
                danger: !0,
                onClick: () => M(J.name)
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
            J.emoji ? a.createElement(
              "span",
              { style: { fontSize: 16 } },
              J.emoji
            ) : null,
            a.createElement(h, { strong: !0 }, J.name),
            J.version_text ? a.createElement(
              s,
              { style: { fontSize: 10 } },
              `v${J.version_text}`
            ) : null
          ),
          J.description ? a.createElement(
            v,
            {
              type: "secondary",
              style: { fontSize: 12, margin: 0 },
              ellipsis: { rows: 2 }
            },
            J.description
          ) : null,
          J.tags && J.tags.length > 0 ? a.createElement(
            "div",
            { style: { marginTop: 4 } },
            ...J.tags.map(
              (de, G) => a.createElement(
                s,
                {
                  key: G,
                  color: "cyan",
                  style: { fontSize: 10 }
                },
                de
              )
            )
          ) : null
        )
      )
    }),
    // Skill Picker Modal (card-grid style, consistent with Skill Center)
    a.createElement(pi, {
      open: A,
      onClose: () => F(!1),
      poolSkills: N,
      installedSkillNames: O.map((J) => J.name),
      loading: k,
      onInstall: U
    })
  ), K = Y ? a.createElement(
    "div",
    { style: { textAlign: "center", padding: 40 } },
    a.createElement(g, { size: "large" })
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
        `MCP 客户端 (${D.length})`
      ),
      a.createElement(
        m,
        {
          type: "primary",
          size: "small",
          icon: T ? a.createElement(T) : void 0,
          onClick: () => {
            window.history.pushState({}, "", `/agents/${B.id}/mcp`), window.dispatchEvent(new PopStateEvent("popstate"));
          }
        },
        "配置 MCP"
      )
    ),
    D.length === 0 ? a.createElement(u, {
      description: "该专家暂无关联的 MCP 客户端，点击「配置 MCP」添加",
      image: u.PRESENTED_IMAGE_SIMPLE
    }) : a.createElement(b, {
      dataSource: D,
      renderItem: (J) => a.createElement(
        b.Item,
        {
          actions: [
            a.createElement(
              m,
              {
                type: "link",
                size: "small",
                danger: !0,
                onClick: () => ne(J.key)
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
              J.name || J.key
            ),
            a.createElement(
              s,
              {
                color: J.enabled ? "green" : "default",
                style: { fontSize: 10 }
              },
              J.enabled ? "启用" : "停用"
            ),
            a.createElement(
              s,
              { color: "purple", style: { fontSize: 10 } },
              J.transport
            )
          ),
          J.description ? a.createElement(
            v,
            {
              type: "secondary",
              style: { fontSize: 12, margin: 0 },
              ellipsis: { rows: 2 }
            },
            J.description
          ) : null,
          J.tools && J.tools.length > 0 ? a.createElement(
            "div",
            {
              style: {
                marginTop: 4,
                fontSize: 11,
                color: "var(--ant-color-text-tertiary, #8c8c8c)"
              }
            },
            `提供 ${J.tools.length} 个工具`
          ) : null
        )
      )
    })
  ), pe = _ != null && _.tools ? a.createElement(
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
        X ? a.createElement(X, {
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
        JSON.stringify(_.tools, null, 2)
      )
    )
  ) : a.createElement(u, {
    description: "暂无工具配置",
    image: u.PRESENTED_IMAGE_SIMPLE
  }), ae = [
    { key: "basic", label: "基本信息", children: q },
    {
      key: "skills",
      label: `技能 (${O.length})`,
      children: re
    },
    {
      key: "prompts",
      label: "推荐提问",
      children: a.createElement(ws, {
        skills: O,
        agentId: B.id
      })
    },
    {
      key: "knowledge",
      label: "专家记忆",
      children: a.createElement(fi, {
        agentId: B.id,
        systemPromptFiles: (_ == null ? void 0 : _.system_prompt_files) || [],
        onRefresh: () => r()
      })
    },
    { key: "mcp", label: `MCP (${D.length})`, children: K },
    { key: "tools", label: "工具配置", children: pe }
  ];
  return a.createElement(
    o,
    {
      title: a.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 8 } },
        a.createElement(dt, { name: B.name, size: 28 }),
        a.createElement("span", null, B.name)
      ),
      open: t,
      onClose: n,
      width: 560,
      extra: a.createElement(
        c,
        null,
        a.createElement(
          m,
          {
            size: "small",
            icon: w ? a.createElement(w) : void 0,
            onClick: () => {
              n();
              try {
                const J = R();
                J.setSelectedAgent && J.setSelectedAgent(B.id);
              } catch (J) {
                console.warn("[ugsci] Failed to set selected agent:", J);
              }
              setTimeout(() => I("/agents"), 0);
            }
          },
          "编辑专家"
        ),
        a.createElement(
          m,
          {
            type: "primary",
            size: "small",
            icon: x ? a.createElement(x) : void 0,
            disabled: !B.enabled,
            onClick: () => {
              n(), i(e);
            }
          },
          B.managed_by_app ? "打开应用" : "开始对话"
        )
      )
    },
    a.createElement(p, {
      items: ae,
      defaultActiveKey: "basic"
    })
  );
}
function zs({
  open: e,
  onClose: t,
  onCreated: n
}) {
  const r = R().React, { useState: i } = r, {
    Modal: a,
    Card: o,
    Tag: l,
    Input: s,
    Row: d,
    Col: c,
    Spin: m,
    message: u,
    Typography: p
  } = R().antd, { Text: b } = p, { FileAddOutlined: g } = R().antdIcons || {}, [E, f] = i(!1), [h, v] = i(""), [w, x] = i(!1), j = async (A) => {
    f(!0);
    try {
      const F = await me("/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: A.id || void 0,
          name: A.name,
          description: A.description,
          skill_names: A.skillNames
        })
      }), N = A.systemPrompt.trim() || `# ${A.name}

你是${A.name}。${A.description ? `

职责：${A.description}` : ""}
`, k = (await Promise.allSettled([
        zt(F.id, "AGENTS.md", N),
        ...A.mcpClients.map(
          ({ clientKey: z, client: B }) => Cr(F.id, {
            client_key: z,
            client: B
          })
        )
      ])).filter(
        (z) => z.status === "rejected"
      ).length;
      k > 0 ? u.warning(
        `专家「${A.name}」已创建，${k} 项初始配置失败，可在专家配置中重试`
      ) : u.success(`专家「${A.name}」创建成功`), await ya(F.id), x(!1), setTimeout(() => {
        t(), n();
      }, 0);
    } catch (F) {
      u.error(F.message || "创建专家失败");
    } finally {
      f(!1);
    }
  }, X = Ts.filter((A) => {
    if (!h.trim()) return !0;
    const F = h.toLowerCase();
    return A.name.toLowerCase().includes(F) || A.description.toLowerCase().includes(F) || A.category.toLowerCase().includes(F);
  }), T = async (A) => {
    f(!0);
    try {
      const F = await me("/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: A.name,
          description: A.description,
          skill_names: A.recommended_skills
        })
      });
      await zt(
        F.id,
        "AGENTS.md",
        A.system_prompt
      ), A.profile_prompt && (await zt(
        F.id,
        "PROFILE.md",
        A.profile_prompt
      ), await zt(
        F.id,
        "BOOTSTRAP.md",
        `# 初始化已完成

此专家已按 UGSci 模板设置身份、风格与领域技能。直接执行 AGENTS.md 的领域工作流程，无需再次询问称呼、风格或初始化设置。
`
      ));
      const N = await Sr(F.id);
      N.approval_level = A.approval_level, await me(`/agents/${encodeURIComponent(F.id)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(N)
      }), await ya(F.id), u.success(`专家「${A.name}」创建成功`), t(), n();
    } catch (F) {
      u.error(F.message || "创建专家失败");
    } finally {
      f(!1);
    }
  };
  return r.createElement(
    r.Fragment,
    null,
    r.createElement(
      a,
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
          value: h,
          onChange: (A) => v(A.target.value),
          allowClear: !0
        })
      ),
      E ? r.createElement(
        "div",
        { style: { textAlign: "center", padding: 60 } },
        r.createElement(m, { size: "large" }),
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
        d,
        { gutter: [12, 12] },
        // ── Blank template card (always first) ──
        h.trim() ? null : r.createElement(
          c,
          { xs: 24, sm: 12 },
          r.createElement(
            o,
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
                g ? r.createElement(g) : "📝"
              ),
              r.createElement(
                "div",
                { style: { flex: 1 } },
                r.createElement(
                  b,
                  { strong: !0, style: { fontSize: 15 } },
                  "从空白模版开始创建"
                ),
                r.createElement(
                  "div",
                  null,
                  r.createElement(
                    l,
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
        ...X.map(
          (A) => r.createElement(
            c,
            { key: A.id, xs: 24, sm: 12 },
            r.createElement(
              o,
              {
                hoverable: !0,
                size: "small",
                onClick: () => T(A),
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
                r.createElement(dt, {
                  name: A.name,
                  size: 40
                }),
                r.createElement(
                  "div",
                  { style: { flex: 1 } },
                  r.createElement(
                    b,
                    { strong: !0, style: { fontSize: 15 } },
                    A.name
                  ),
                  r.createElement(
                    "div",
                    null,
                    r.createElement(
                      l,
                      { color: "blue", style: { fontSize: 10 } },
                      A.category
                    ),
                    A.approval_level === "MANUAL" ? r.createElement(
                      l,
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
                Mn(A.description, r)
              )
            )
          )
        )
      )
    ),
    // ── Blank template creation modal (sibling, not nested inside Modal) ──
    r.createElement(Rs, {
      open: w,
      onCancel: () => x(!1),
      onCreate: j
    })
  );
}
function Gt(e) {
  return typeof e == "object" && e !== null && !Array.isArray(e);
}
function Ps(e) {
  const t = e.trim();
  if (!t) return [];
  const n = JSON.parse(t);
  if (!Gt(n))
    throw new Error("MCP 配置必须是 JSON 对象");
  const r = n.mcpServers ?? n;
  if (!Gt(r))
    throw new Error("mcpServers 必须是 JSON 对象");
  return Object.entries(r).map(([i, a]) => {
    const o = i.trim();
    if (!o || !Gt(a))
      throw new Error(`MCP「${i || "未命名"}」配置无效`);
    const l = typeof a.url == "string" ? a.url : "", s = typeof a.command == "string" ? a.command : "";
    if (!l && !s)
      throw new Error(`MCP「${o}」需要配置 url 或 command`);
    const c = (typeof a.transport == "string" ? a.transport : typeof a.type == "string" ? a.type : "") === "sse" ? "sse" : l ? "streamable_http" : "stdio";
    return {
      clientKey: o,
      client: {
        name: typeof a.name == "string" ? a.name : o,
        description: typeof a.description == "string" ? a.description : "",
        enabled: typeof a.enabled == "boolean" ? a.enabled : !0,
        transport: c,
        url: l,
        command: s,
        args: Array.isArray(a.args) ? a.args : [],
        env: Gt(a.env) ? a.env : {},
        cwd: typeof a.cwd == "string" ? a.cwd : "",
        headers: Gt(a.headers) ? a.headers : {}
      }
    };
  });
}
function Rs({
  open: e,
  onCancel: t,
  onCreate: n
}) {
  const r = R().React, { useState: i, useEffect: a, useMemo: o } = r, {
    Modal: l,
    Input: s,
    Select: d,
    Button: c,
    Row: m,
    Col: u,
    Spin: p,
    Tag: b,
    Typography: g,
    message: E
  } = R().antd, { CheckCircleOutlined: f } = R().antdIcons || {}, { Text: h } = g, [v, w] = i(""), [x, j] = i(""), [X, T] = i(""), [A, F] = i(""), [N, C] = i([]), [k, z] = i([]), [B, _] = i(!1), [L, D] = i(""), [Y, O] = i(!1);
  a(() => {
    e && (w(""), j(""), T(""), F(""), z([]), D(""), O(!1), _(!0), Un(!0).then(C).catch((re) => {
      C([]), E.error(re.message || "加载技能池失败");
    }).finally(() => _(!1)));
  }, [e]);
  const I = x.trim(), q = o(() => I ? I.length < 2 || I.length > 64 ? "ID 长度需为 2-64 个字符" : /^[a-zA-Z0-9][a-zA-Z0-9_-]*[a-zA-Z0-9]$/.test(I) ? I === "default" ? "default 是系统保留 ID" : "" : "仅允许字母、数字、连字符和下划线，且不能以符号开头或结尾" : "", [I]), H = o(() => {
    try {
      return { clients: Ps(L), error: "" };
    } catch (re) {
      return {
        clients: [],
        error: re.message || "MCP 配置无效"
      };
    }
  }, [L]), U = () => {
    const re = v.trim();
    if (!re) {
      E.warning("请输入专家名称");
      return;
    }
    if (q) {
      E.warning(q);
      return;
    }
    if (H.error) {
      E.warning(H.error);
      return;
    }
    O(!0), Promise.resolve(
      n({
        id: I,
        name: re,
        description: X.trim(),
        systemPrompt: A,
        skillNames: k,
        mcpClients: H.clients
      })
    ).finally(() => O(!1));
  }, M = () => {
    z(
      N.filter((re) => re.source === "builtin").map((re) => re.name)
    );
  }, ne = (re, K) => r.createElement(
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
      h,
      { strong: !0, style: { fontSize: 15 } },
      re
    ),
    K ? r.createElement(
      h,
      { type: "secondary", style: { fontSize: 12 } },
      K
    ) : null
  );
  return r.createElement(
    l,
    {
      open: e,
      title: "创建专家",
      onCancel: t,
      onOk: U,
      okText: "创建专家",
      cancelText: "取消",
      okButtonProps: { loading: Y },
      maskClosable: !0,
      keyboard: !0,
      width: 880,
      styles: { body: { maxHeight: "72vh", overflowY: "auto", paddingTop: 8 } }
    },
    r.createElement(
      "div",
      { style: { paddingBottom: 20 } },
      ne("基本信息", "ID 留空时自动生成"),
      r.createElement(
        m,
        { gutter: [16, 12] },
        r.createElement(
          u,
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
          r.createElement(s, {
            placeholder: "例如：合同审查专家",
            value: v,
            onChange: (re) => w(re.target.value),
            maxLength: 50
          })
        ),
        r.createElement(
          u,
          { xs: 24, md: 12 },
          r.createElement(
            "label",
            { style: { display: "block", fontSize: 13, marginBottom: 6 } },
            "智能体 ID（可选）"
          ),
          r.createElement(s, {
            placeholder: "例如：contract-reviewer",
            value: x,
            onChange: (re) => j(re.target.value),
            maxLength: 64,
            status: q ? "error" : void 0
          }),
          q ? r.createElement(
            "div",
            { style: { color: "#ff4d4f", fontSize: 12, marginTop: 4 } },
            q
          ) : null
        ),
        r.createElement(
          u,
          { span: 24 },
          r.createElement(
            "label",
            { style: { display: "block", fontSize: 13, marginBottom: 6 } },
            "专家描述（可选）"
          ),
          r.createElement(s.TextArea, {
            placeholder: "简要描述该专家的职责和能力",
            value: X,
            onChange: (re) => T(re.target.value),
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
      ne("角色指令", "保存为 AGENTS.md"),
      r.createElement(s.TextArea, {
        placeholder: "定义专家的角色、目标、工作方式和输出要求；留空时将根据名称与描述生成基础指令",
        value: A,
        onChange: (re) => F(re.target.value),
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
      ne("初始能力"),
      r.createElement(
        m,
        { gutter: [20, 16], align: "top" },
        r.createElement(
          u,
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
            r.createElement(h, { strong: !0 }, "初始技能"),
            r.createElement(
              "div",
              { style: { display: "flex", gap: 4 } },
              r.createElement(
                c,
                {
                  size: "small",
                  onClick: M,
                  disabled: B
                },
                "内置"
              ),
              r.createElement(
                c,
                {
                  size: "small",
                  onClick: () => z([]),
                  disabled: k.length === 0
                },
                "清空"
              )
            )
          ),
          B ? r.createElement(
            "div",
            { style: { textAlign: "center", padding: 32 } },
            r.createElement(p, { size: "small" })
          ) : r.createElement(d, {
            mode: "multiple",
            value: k,
            onChange: z,
            placeholder: "搜索并选择技能",
            showSearch: !0,
            allowClear: !0,
            optionFilterProp: "label",
            maxTagCount: "responsive",
            style: { width: "100%" },
            options: N.map((re) => ({
              value: re.name,
              label: re.name
            })),
            notFoundContent: "暂无可用技能"
          }),
          r.createElement(
            "div",
            { style: { marginTop: 8, minHeight: 22 } },
            k.length > 0 ? r.createElement(
              b,
              { color: "blue" },
              `已选择 ${k.length} 个技能`
            ) : r.createElement(
              h,
              { type: "secondary", style: { fontSize: 12 } },
              "暂不添加技能"
            )
          )
        ),
        r.createElement(
          u,
          { xs: 24, md: 12 },
          r.createElement(
            h,
            { strong: !0, style: { display: "block", marginBottom: 8 } },
            "初始 MCP"
          ),
          r.createElement(s.TextArea, {
            placeholder: `{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem"]
    }
  }
}`,
            value: L,
            onChange: (re) => D(re.target.value),
            rows: 8,
            status: H.error ? "error" : void 0,
            style: {
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
              fontSize: 12
            }
          }),
          r.createElement(
            "div",
            { style: { marginTop: 8, minHeight: 22 } },
            H.error ? r.createElement(
              h,
              { type: "danger", style: { fontSize: 12 } },
              H.error
            ) : H.clients.length > 0 ? r.createElement(
              b,
              {
                color: "green",
                icon: f ? r.createElement(f) : void 0
              },
              `已识别 ${H.clients.length} 个 MCP`
            ) : r.createElement(
              h,
              { type: "secondary", style: { fontSize: 12 } },
              "暂不添加 MCP"
            )
          )
        )
      )
    )
  );
}
const bi = "ugsci_custom_teams";
function Os(e) {
  if (!e || typeof e != "object") return !1;
  const t = e;
  return typeof t.id == "string" && typeof t.name == "string" && typeof t.taskTemplate == "string" && typeof t.orchestrationPrompt == "string" && Array.isArray(t.members);
}
function Ms() {
  try {
    const e = JSON.parse(
      localStorage.getItem(bi) || "[]"
    );
    return Array.isArray(e) ? e.filter(Os) : [];
  } catch {
    return [];
  }
}
function Ls(e) {
  try {
    localStorage.setItem(bi, JSON.stringify(e));
  } catch {
  }
}
function Bs(e) {
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
function js(e) {
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
async function ir(e = !0) {
  const t = await ct("/ugsci/team/custom");
  if (!t.ok) {
    const i = await t.text().catch(() => "");
    throw new Error(i || `HTTP ${t.status}`);
  }
  const r = (await t.json()).map(js);
  return e && Ls(r), r;
}
async function vi(e) {
  const t = await ct("/ugsci/team/custom", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(Bs(e))
  });
  if (!t.ok) {
    const r = await t.text().catch(() => "");
    throw new Error(r || `HTTP ${t.status}`);
  }
  const n = await t.json();
  return { ...e, id: n.team_id };
}
async function Us(e) {
  const t = await ct(
    `/ugsci/team/custom/${encodeURIComponent(e)}`,
    { method: "DELETE" }
  );
  if (!t.ok && t.status !== 404) {
    const n = await t.text().catch(() => "");
    throw new Error(n || `HTTP ${t.status}`);
  }
}
async function Ns() {
  const e = Ms();
  if (e.length === 0) return;
  const t = await ir(!1), n = new Set(t.map((r) => r.id));
  await Promise.all(
    e.filter((r) => !n.has(r.id)).map((r) => vi(r))
  );
}
async function Ds(e) {
  var i, a;
  const t = (i = e.body) == null ? void 0 : i.getReader();
  if (!t) return;
  const n = new TextDecoder();
  let r = "";
  try {
    for (; ; ) {
      const { done: o, value: l } = await t.read();
      if (o) break;
      r += n.decode(l, { stream: !0 });
      let s;
      for (; (s = r.indexOf(`

`)) >= 0; ) {
        const d = r.slice(0, s);
        r = r.slice(s + 2);
        for (const c of d.split(`
`)) {
          if (!c.startsWith("data: ")) continue;
          const m = c.slice(6);
          let u;
          try {
            u = JSON.parse(m);
          } catch {
            continue;
          }
          if (u.error) {
            const p = u.error, b = typeof p == "string" ? p : (p == null ? void 0 : p.message) || "工作流启动失败";
            throw new Error(b);
          }
          if (u.object === "response" || u.type === "response") {
            const p = u.status;
            if (p === "failed" || p === "error") {
              const b = ((a = u.error) == null ? void 0 : a.message) || "工作流启动失败";
              throw new Error(b);
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
async function Fs(e, t, n) {
  const r = `console:default:team-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, i = await ct("/chats", {
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
  if (!i.ok) {
    const s = await i.text().catch(() => "");
    throw new Error(
      s || `创建会话失败 (HTTP ${i.status})`
    );
  }
  const o = (await i.json()).id, l = await ct("/console/chat", {
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
  if (!l.ok) {
    const s = await l.text().catch(() => "");
    throw new Error(s || `HTTP ${l.status}`);
  }
  return await Ds(l), o;
}
function wi(e, t) {
  var i;
  const n = t.replace(/\s+/g, ""), r = e.find(
    (a) => a.name === t || a.name.replace(/\s+/g, "") === n
  );
  return r ? r.id : ((i = e.find(
    (a) => a.name.includes(t) || t.includes(a.name) || a.name.replace(/\s+/g, "").includes(n)
  )) == null ? void 0 : i.id) || null;
}
function Si() {
  var t;
  const e = (t = window.QwenPaw) == null ? void 0 : t.host;
  if (!e) throw new Error("[ugsci] QwenPaw.host not available");
  return e;
}
async function xi(e, t) {
  const n = await e.text().catch(() => "");
  if (!n) return t;
  try {
    const r = JSON.parse(n);
    if (typeof r.detail == "string") return r.detail;
  } catch {
  }
  return n;
}
async function Ir(e, t, n) {
  const r = await ct(e, {
    headers: t ? { "X-Agent-Id": t } : void 0,
    signal: n
  });
  if (!r.ok)
    throw new Error(
      await xi(r, `HTTP ${r.status}`)
    );
  return await r.json();
}
function Gs(e, t) {
  return Ir("/ugsci/team/state", e, t);
}
async function Ws(e, t) {
  const n = await ct("/ugsci/team/runs", {
    headers: { "X-Agent-Id": e },
    signal: t
  });
  if (!n.ok)
    throw new Error(
      await xi(
        n,
        `Failed to load team runs: ${n.status}`
      )
    );
  return await n.json();
}
const Hs = 5e3;
function ha({
  activeOnly: e = !1,
  enabled: t = !0
}) {
  const n = Si(), r = n.React, { useCallback: i, useEffect: a, useRef: o, useState: l } = r, { Alert: s, Button: d, Card: c, Empty: m, Spin: u, Tag: p, Typography: b } = n.antd, { Text: g, Paragraph: E } = b, f = n.useSelectedAgent ? n.useSelectedAgent() : { id: "default" }, h = (f == null ? void 0 : f.id) || "default", [v, w] = l([]), [x, j] = l(!0), [X, T] = l(null), [A, F] = l(!1), N = o(null), C = o(0), k = o(!1), z = o(h), B = i(
    async (D = !0, Y = !0) => {
      var q;
      if (!t || !Y && k.current) return;
      (q = N.current) == null || q.abort();
      const O = new AbortController();
      N.current = O;
      const I = ++C.current;
      k.current = !0, D && j(!0);
      try {
        const H = await Ws(h, O.signal);
        if (O.signal.aborted || I !== C.current)
          return;
        w(H), F(!0), T(null);
      } catch (H) {
        if (O.signal.aborted || I !== C.current)
          return;
        T(
          H instanceof Error ? H.message : "讨论运行记录加载失败"
        );
      } finally {
        !O.signal.aborted && I === C.current && (N.current = null, k.current = !1, j(!1));
      }
    },
    [h, t]
  );
  if (a(() => {
    var Y;
    if (!t) {
      (Y = N.current) == null || Y.abort(), N.current = null, k.current = !1, C.current += 1;
      return;
    }
    z.current !== h && (z.current = h, w([]), T(null), F(!1)), B(!0, !0);
    const D = e ? window.setInterval(() => {
      B(!1, !1);
    }, Hs) : null;
    return () => {
      var O;
      D !== null && window.clearInterval(D), (O = N.current) == null || O.abort(), N.current = null, k.current = !1, C.current += 1;
    };
  }, [e, h, t, B]), x && !A) return r.createElement(u);
  if (X && !A)
    return r.createElement(s, {
      type: "warning",
      message: "讨论运行记录加载失败",
      description: X,
      action: r.createElement(
        d,
        { size: "small", onClick: () => void B(!0, !0), loading: x },
        "重试"
      )
    });
  const _ = v.filter(
    (D) => e ? D.status === "active" : D.status !== "active"
  ), L = (D) => X ? r.createElement(
    r.Fragment,
    null,
    r.createElement(s, {
      type: "warning",
      message: "讨论运行记录更新失败，当前显示上次成功读取的结果",
      description: X,
      action: r.createElement(
        d,
        {
          size: "small",
          onClick: () => void B(!0, !0),
          loading: x
        },
        "重试"
      )
    }),
    D
  ) : D;
  return _.length === 0 ? L(
    r.createElement(
      m,
      {
        description: e ? "暂无进行中的专家团讨论" : "暂无历史讨论"
      },
      r.createElement(
        d,
        { size: "small", onClick: () => void B(!0, !0), loading: x },
        "刷新"
      )
    )
  ) : L(
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
          { size: "small", onClick: () => void B(!0, !0), loading: x },
          "刷新"
        )
      ),
      r.createElement(
        "div",
        { style: { display: "flex", flexDirection: "column", gap: 8 } },
        ..._.map(
          (D) => r.createElement(
            c,
            { key: D.instance_id, size: "small" },
            r.createElement(
              "div",
              { style: { display: "flex", alignItems: "center", gap: 8 } },
              r.createElement(
                g,
                { strong: !0 },
                D.team_name || D.team_id
              ),
              r.createElement(
                p,
                {
                  color: D.status === "completed" ? "green" : D.status === "terminated" ? "orange" : "blue"
                },
                D.status
              ),
              r.createElement(p, null, D.current_phase),
              r.createElement(
                g,
                { type: "secondary" },
                `迭代 ${D.iteration}`
              )
            ),
            r.createElement(
              E,
              { ellipsis: { rows: 2 }, style: { margin: "8px 0 0" } },
              D.task || "暂无任务描述"
            )
          )
        )
      )
    )
  );
}
async function qs() {
  try {
    return (await Ir(
      "/ugsci/team/preset-teams"
    )).teams;
  } catch {
    return null;
  }
}
async function Js() {
  try {
    return (await Ir(
      "/ugsci/team/roles"
    )).roles;
  } catch {
    return null;
  }
}
const Vs = {
  plan: { label: "规划", color: "#1677ff", icon: "📋" },
  dispatch: { label: "分派", color: "#13c2c2", icon: "🚀" },
  verify: { label: "验证", color: "#fa8c16", icon: "🔍" },
  synthesize: { label: "综合", color: "#722ed1", icon: "📊" },
  completed: { label: "完成", color: "#52c41a", icon: "✅" }
}, Ea = [
  "plan",
  "dispatch",
  "verify",
  "synthesize",
  "completed"
], ba = 5e3, Ks = 3e4;
function Xs({ enabled: e = !0 }) {
  const t = Si(), n = t.React, { useState: r, useEffect: i, useCallback: a, useRef: o } = n, { Card: l, Tag: s, Typography: d, Button: c, Steps: m, Empty: u, Alert: p, Spin: b } = t.antd, { ReloadOutlined: g } = t.antdIcons || {}, { Text: E, Paragraph: f } = d, h = t.useSelectedAgent ? t.useSelectedAgent() : { id: "default" }, v = (h == null ? void 0 : h.id) || "default", [w, x] = r(null), [j, X] = r(!1), [T, A] = r(null), F = o(null), N = o(0), C = o(0), k = o(0), z = o(null), B = o(!1), _ = a(
    async (K, pe = !0) => {
      var de;
      if (!e || !pe && B.current) return;
      (de = z.current) == null || de.abort();
      const ae = new AbortController();
      z.current = ae;
      const J = ++k.current;
      B.current = !0, K && X(!0);
      try {
        const G = await Gs(v, ae.signal);
        if (ae.signal.aborted || J !== k.current)
          return;
        N.current = 0, C.current = 0, F.current = G, x(G), A(null);
      } catch (G) {
        if (ae.signal.aborted || J !== k.current)
          return;
        N.current += 1;
        const P = Math.min(
          Ks,
          ba * 2 ** (N.current - 1)
        );
        C.current = Date.now() + P, A(
          G instanceof Error ? G.message : "专家团状态加载失败"
        );
      } finally {
        !ae.signal.aborted && J === k.current && (z.current = null, B.current = !1, X(!1));
      }
    },
    [v, e]
  ), L = a(() => (N.current = 0, C.current = 0, _(!0)), [_]);
  if (i(() => {
    var pe;
    if ((pe = z.current) == null || pe.abort(), z.current = null, B.current = !1, k.current += 1, N.current = 0, C.current = 0, F.current = null, x(null), A(null), !e) return;
    L();
    const K = window.setInterval(() => {
      var ae, J;
      Date.now() < C.current || ((ae = F.current) == null ? void 0 : ae.status) === "completed" || ((J = F.current) == null ? void 0 : J.status) === "terminated" || _(!1, !1);
    }, ba);
    return () => {
      var ae;
      window.clearInterval(K), (ae = z.current) == null || ae.abort(), z.current = null, B.current = !1, k.current += 1;
    };
  }, [v, e, _, L]), j && !w && !T)
    return n.createElement(b);
  if (T && !w)
    return n.createElement(p, {
      type: "warning",
      showIcon: !0,
      message: "专家团状态加载失败",
      description: T,
      style: { marginBottom: 16 },
      action: n.createElement(
        c,
        { size: "small", onClick: L, loading: j },
        "重试"
      )
    });
  const D = (K) => T ? n.createElement(
    n.Fragment,
    null,
    n.createElement(p, {
      type: "warning",
      showIcon: !0,
      message: "状态更新失败，当前显示上次成功读取的结果",
      description: T,
      style: { marginBottom: 16 },
      action: n.createElement(
        c,
        { size: "small", onClick: L, loading: j },
        "重试"
      )
    }),
    K
  ) : K;
  if ((w == null ? void 0 : w.status) === "unreadable")
    return D(
      n.createElement(p, {
        type: "warning",
        showIcon: !0,
        message: "专家团状态暂时无法读取",
        description: `实例 ${w.instance_id || "未知"} 的状态文件需要检查。`,
        style: { marginBottom: 16 },
        action: n.createElement(
          c,
          { size: "small", onClick: L, loading: j },
          "重试"
        )
      })
    );
  if (!w || !w.active) {
    if ((w == null ? void 0 : w.status) === "completed" || (w == null ? void 0 : w.status) === "terminated") {
      const K = w.status === "completed";
      return D(
        n.createElement(p, {
          type: K ? "success" : "info",
          showIcon: !0,
          message: K ? "专家团工作流已完成" : "专家团工作流已终止",
          description: K ? `实例 ${w.instance_id || "未知"} 已完成，结果文件保留在工作区。` : `原因：${w.state.termination_reason || "未知"}`,
          style: { marginBottom: 16 }
        })
      );
    }
    return D(
      n.createElement(u, {
        description: "暂无活跃的专家团工作流",
        style: { padding: 24 }
      })
    );
  }
  const Y = w.state, O = Y.current_phase || "plan", I = Ea.indexOf(O), q = Y.team_name || "未知团队", H = Y.team_mode || "pipeline", U = Y.iteration || 0, M = Y.members || [], ne = Y.verify_retries || 0, re = {
    pipeline: "顺序交接",
    coordinator: "主管协作",
    roundtable: "并行汇聚",
    router: "智能路由",
    review_loop: "评审迭代",
    debate: "多方论证"
  };
  return D(
    n.createElement(
      l,
      {
        size: "small",
        style: { marginBottom: 16 },
        title: n.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 8 } },
          n.createElement("span", { style: { fontSize: 16 } }, "🔄"),
          n.createElement(
            E,
            { strong: !0 },
            `${q} — 工作流状态`
          ),
          n.createElement(
            s,
            { color: "blue", style: { fontSize: 10 } },
            re[H] || H
          ),
          n.createElement(
            s,
            { style: { fontSize: 10 } },
            `迭代 ${U}`
          ),
          ne > 0 ? n.createElement(
            s,
            { color: "orange", style: { fontSize: 10 } },
            `验证重试 ${ne}`
          ) : null
        ),
        extra: n.createElement(
          c,
          {
            size: "small",
            type: "text",
            icon: g ? n.createElement(g) : void 0,
            onClick: L,
            loading: j
          },
          "刷新"
        )
      },
      n.createElement(m, {
        current: I,
        size: "small",
        items: Ea.map((K) => {
          const pe = Vs[K];
          return {
            title: `${pe.icon} ${pe.label}`,
            description: K === "plan" ? "分析任务，创建任务分解" : K === "dispatch" ? "分派专家执行任务" : K === "verify" ? "交叉验证专家结果" : K === "synthesize" ? "综合形成最终报告" : "工作流完成"
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
        ...M.map(
          (K, pe) => n.createElement(
            s,
            { key: `${K.name}-${pe}`, style: { fontSize: 11 } },
            `${K.emoji || ""} ${K.name}（${K.role}）`
          )
        )
      ),
      Y.task ? n.createElement(
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
        `任务: ${Y.task}`
      ) : null
    )
  );
}
function Ys({ team: e }) {
  const t = R().React, { Typography: n, Tag: r } = R().antd, { Text: i } = n, a = {
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
  }, l = e.steps || [], s = e.mode === "roundtable" || e.mode === "router", d = {
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
      i,
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
      ...l.length > 0 ? l.map((c, m) => [
        m > 0 && !s ? t.createElement(
          "div",
          {
            key: `arrow-${m}`,
            style: {
              textAlign: "center",
              color: o[e.mode],
              fontSize: 14
            }
          },
          a[e.mode]
        ) : null,
        t.createElement(
          "div",
          {
            key: `step-${m}`,
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
          t.createElement(dt, {
            name: c.agentName,
            size: 24
          }),
          t.createElement(
            "div",
            null,
            t.createElement(
              i,
              { strong: !0, style: { fontSize: 12 } },
              c.agentName
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
              c.instruction
            ),
            t.createElement(
              r,
              {
                ...c.passContext ? { color: "blue" } : {},
                style: { fontSize: 9, marginTop: 2 }
              },
              c.passContext ? "传递上下文" : "独立"
            )
          )
        )
      ]).flat() : e.members.map((c, m) => [
        m > 0 && !s ? t.createElement(
          "div",
          {
            key: `arrow-${m}`,
            style: {
              textAlign: "center",
              color: o[e.mode],
              fontSize: 14
            }
          },
          a[e.mode]
        ) : null,
        t.createElement(
          "div",
          {
            key: `member-${m}`,
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
          t.createElement(dt, {
            name: c.name,
            size: 24
          }),
          t.createElement(
            "div",
            null,
            t.createElement(
              i,
              { strong: !0, style: { fontSize: 12 } },
              c.name
            ),
            t.createElement(
              "div",
              { style: { fontSize: 11, color: "var(--ant-color-text-tertiary, #8c8c8c)" } },
              c.role
            )
          )
        )
      ]).flat()
    )
  );
}
function fn(e) {
  const t = e.replace(/\s+/g, "").toLowerCase();
  return t.includes("测井") ? "log-analyst" : t.includes("地球物理") ? "geophysicist" : t.includes("油藏") ? "reservoir-engineer" : t.includes("钻井") ? "drilling-engineer" : t.includes("采油") || t.includes("生产") ? "production-engineer" : t.includes("pvt") || t.includes("物性") ? "pvt-analyst" : t.includes("审核") || t.includes("verifier") ? "domain-reviewer" : t.includes("master") || t.includes("planner") ? "planner" : "analyst";
}
const Zs = [
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
function Qs({
  open: e,
  onClose: t,
  agents: n,
  editingTeam: r,
  onSaved: i
}) {
  const a = R().React, { useState: o, useEffect: l, useCallback: s } = a, {
    Modal: d,
    Input: c,
    Button: m,
    Select: u,
    Tag: p,
    Typography: b,
    Switch: g,
    Empty: E,
    message: f,
    Divider: h,
    Steps: v
  } = R().antd, { PlusOutlined: w, DeleteOutlined: x, SaveOutlined: j, ArrowRightOutlined: X } = R().antdIcons || {}, { Text: T, Paragraph: A } = b, [F, N] = o(""), [C, k] = o("🤝"), [z, B] = o(""), [_, L] = o("pipeline"), [D, Y] = o(""), [O, I] = o(""), [q, H] = o([]), [U, M] = o([]), [ne, re] = o(!1), [K, pe] = o(2), [ae, J] = o(""), [de, G] = o(""), [P, le] = o({}), [Ee, _e] = o({}), [ke, Se] = o(
    Zs
  ), fe = [
    { value: "pipeline", icon: "→", title: "顺序交接", description: "上一步产物成为下一位专家的上下文", topology: "A → B → C", accent: "#08979c" },
    { value: "roundtable", icon: "⇉", title: "并行汇聚", description: "独立并行分析，避免观点相互污染", topology: "A ∥ B ∥ C → 汇总", accent: "#531dab" },
    { value: "coordinator", icon: "◎", title: "主管协作", description: "主控专家拆解任务并按需组织成员", topology: "主管 → 专家组", accent: "#0958d9" },
    { value: "router", icon: "◇", title: "智能路由", description: "按任务能力需求选择最小充分专家集合", topology: "任务 → 路由 → 子集", accent: "#d46b08" },
    { value: "review_loop", icon: "↻", title: "评审迭代", description: "产出、独立审查、修订，直到满足标准", topology: "执行 ⇄ 评审", accent: "#389e0d" },
    { value: "debate", icon: "⚖", title: "多方论证", description: "独立立场、交叉质询，再由裁决者综合", topology: "观点 ⇄ 反驳 → 裁决", accent: "#c41d7f" }
  ];
  l(() => {
    e && (r ? (N(r.name), k(r.emoji), B(r.description), L(r.mode), Y(r.coordinatorName || ""), I(r.taskTemplate), H(r.steps || []), M(r.members.map((y) => y.name)), pe(r.maxReviewRounds || 2), J(r.successCriteria || ""), G(r.routingInstruction || ""), le(
      Object.fromEntries(
        r.members.map((y) => [
          y.name,
          y.bindingMode || (y.agentId ? "fixed" : "preferred")
        ])
      )
    ), _e(
      Object.fromEntries(
        r.members.map((y) => [
          y.name,
          y.roleKey || fn(y.name)
        ])
      )
    )) : (N(""), k("🤝"), B(""), L("pipeline"), Y(""), I(`请执行以下任务：
任务描述：{任务描述}`), H([]), M([]), pe(2), J(""), G(""), le({}), _e({})));
  }, [e, r]), l(() => {
    e && Js().then((y) => {
      y != null && y.length && Se(y);
    });
  }, [e]);
  const Te = s(() => {
    if (_ === "roundtable" || _ === "debate" || _ === "router") {
      const y = U.map((V) => ({
        agentName: V,
        instruction: "请给出你的专业评估意见",
        passContext: !1
      }));
      H(y);
    } else if (_ === "pipeline") {
      const y = new Map(q.map(($) => [$.agentName, $])), V = U.map(($) => y.get($) || {
        agentName: $,
        instruction: "请完成你的专业部分",
        passContext: !0
      });
      H(V);
    }
  }, [_, U, q]), Ce = (y) => {
    U.includes(y) || (M([...U, y]), le({ ...P, [y]: "fixed" }), _e({
      ...Ee,
      [y]: fn(y)
    }), (_ === "coordinator" || _ === "debate") && !D && Y(y));
  }, Q = (y) => {
    const V = U.filter((ye) => ye !== y);
    M(V), H(q.filter((ye) => ye.agentName !== y));
    const $ = { ...P };
    delete $[y], le($);
    const ue = { ...Ee };
    delete ue[y], _e(ue), D === y && Y(V[0] || "");
  }, Z = (y, V, $) => {
    const ue = [...q];
    ue[y] = { ...ue[y], [V]: $ }, H(ue);
  }, ce = async () => {
    if (!F.trim()) {
      f.warning("请输入团队名称");
      return;
    }
    if (U.length < 2) {
      f.warning("至少需要选择 2 个成员");
      return;
    }
    if (!O.trim()) {
      f.warning("请输入任务模板");
      return;
    }
    if ((_ === "coordinator" || _ === "debate") && !D) {
      f.warning(_ === "debate" ? "请选择裁决者" : "请选择主控专家");
      return;
    }
    re(!0);
    try {
      let y = [...U];
      _ === "coordinator" && D ? y = [D, ...y.filter((ye) => ye !== D)] : _ === "debate" && D && (y = [...y.filter((ye) => ye !== D), D]);
      const V = y.map(
        (ye) => {
          var nt;
          const be = n.find((Ge) => Ge.name === ye), Ae = P[ye] || "fixed", Be = Ee[ye] || fn(ye), Le = ke.find((Ge) => Ge.key === Be);
          return {
            name: ye,
            role: (Le == null ? void 0 : Le.display_name) || ((nt = be == null ? void 0 : be.description) == null ? void 0 : nt.slice(0, 30)) || "需求分析师",
            emoji: "",
            agentId: Ae === "temporary" || be == null ? void 0 : be.id,
            roleKey: Be,
            bindingMode: Ae
          };
        }
      );
      let $ = q;
      (q.length === 0 || q.length !== U.length) && ($ = U.map((ye) => ({
        agentName: ye,
        instruction: "请完成你的专业部分",
        passContext: _ === "pipeline"
      })));
      const ue = {
        id: (r == null ? void 0 : r.id) || `custom-${Date.now()}`,
        name: F.trim(),
        emoji: C,
        category: "自定义",
        description: z.trim() || `${F.trim()}（${U.length}人团队）`,
        mode: _,
        members: V,
        coordinatorName: _ === "coordinator" || _ === "debate" ? D : void 0,
        taskTemplate: O.trim(),
        orchestrationPrompt: "",
        // Custom teams use steps-based instructions
        steps: $,
        custom: !0,
        createdAt: (r == null ? void 0 : r.createdAt) || Date.now(),
        updatedAt: r == null ? void 0 : r.updatedAt,
        version: r == null ? void 0 : r.version,
        maxReviewRounds: K,
        successCriteria: ae.trim(),
        routingInstruction: de.trim()
      };
      await vi(ue), f.success(r ? "团队已更新" : "团队已创建"), i(), t();
    } catch (y) {
      f.error(y.message || "保存失败");
    } finally {
      re(!1);
    }
  }, he = n.filter(
    (y) => !U.includes(y.name)
  );
  return a.createElement(
    d,
    {
      open: e,
      onCancel: t,
      title: a.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 8 } },
        a.createElement(
          "span",
          { style: { fontSize: 20 } },
          r ? "✏️" : "➕"
        ),
        a.createElement(
          "span",
          null,
          r ? "编辑专家团" : "创建专家团"
        )
      ),
      width: 860,
      onOk: ce,
      okText: "保存专家团",
      confirmLoading: ne,
      okButtonProps: {
        icon: j ? a.createElement(j) : void 0
      }
    },
    // Step 1: Basic info
    a.createElement(
      "div",
      { style: { marginBottom: 16 } },
      a.createElement(
        T,
        {
          strong: !0,
          style: { display: "block", marginBottom: 8, fontSize: 13 }
        },
        "1. 定义任务工作流"
      ),
      a.createElement(
        "div",
        { style: { display: "flex", gap: 8, marginBottom: 8, alignItems: "center" } },
        U.length > 0 ? a.createElement(Tr, {
          members: U,
          size: 36
        }) : null,
        a.createElement(c, {
          placeholder: "专家团名称（如：储层评价与质量复核专家团）",
          value: F,
          onChange: (y) => N(y.target.value),
          style: { flex: 1 }
        })
      ),
      a.createElement(c.TextArea, {
        placeholder: "说明这个工作流解决什么问题、适用于什么场景",
        value: z,
        onChange: (y) => B(y.target.value),
        rows: 2,
        style: { marginBottom: 8 }
      }),
      a.createElement(
        T,
        { strong: !0, style: { display: "block", margin: "12px 0 8px", fontSize: 13 } },
        "选择协同模式"
      ),
      a.createElement(
        "div",
        {
          style: {
            display: "grid",
            gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
            gap: 8
          }
        },
        ...fe.map((y) => {
          const V = _ === y.value;
          return a.createElement(
            "button",
            {
              key: y.value,
              type: "button",
              onClick: () => {
                L(y.value), y.value !== "coordinator" && y.value !== "debate" && Y("");
              },
              style: {
                textAlign: "left",
                padding: 10,
                borderRadius: 8,
                cursor: "pointer",
                background: V ? `${y.accent}0d` : "var(--ant-color-bg-container, #fff)",
                border: `1px solid ${V ? y.accent : "var(--ant-color-border, #d9d9d9)"}`,
                boxShadow: V ? `0 0 0 2px ${y.accent}1a` : "none"
              }
            },
            a.createElement(
              "div",
              { style: { display: "flex", alignItems: "center", gap: 7, color: y.accent, fontWeight: 600 } },
              a.createElement("span", { style: { fontSize: 18 } }, y.icon),
              y.title
            ),
            a.createElement("div", { style: { fontSize: 11, color: "#595959", marginTop: 5, lineHeight: 1.45 } }, y.description),
            a.createElement("div", { style: { fontSize: 10, color: y.accent, marginTop: 5, fontFamily: "monospace" } }, y.topology)
          );
        })
      )
    ),
    a.createElement(h, { style: { margin: "12px 0" } }),
    // Step 2: Select members
    a.createElement(
      "div",
      { style: { marginBottom: 16 } },
      a.createElement(
        T,
        {
          strong: !0,
          style: { display: "block", marginBottom: 8, fontSize: 13 }
        },
        "2. 配置专家角色"
      ),
      // Available agents
      he.length > 0 ? a.createElement(
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
          (y) => a.createElement(
            m,
            {
              key: y.id,
              size: "small",
              icon: w ? a.createElement(w) : void 0,
              onClick: () => Ce(y.name)
            },
            y.name
          )
        )
      ) : null,
      // Selected members
      U.length === 0 ? a.createElement(E, {
        description: "请从上方添加团队成员",
        image: E.PRESENTED_IMAGE_SIMPLE
      }) : a.createElement(
        "div",
        { style: { display: "flex", flexDirection: "column", gap: 4 } },
        ...U.map(
          (y) => a.createElement(
            "div",
            {
              key: y,
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
            a.createElement(
              "div",
              { style: { display: "flex", alignItems: "center", gap: 6 } },
              a.createElement(dt, { name: y, size: 24 }),
              a.createElement(
                T,
                { strong: !0, style: { fontSize: 13 } },
                y
              ),
              (_ === "coordinator" || _ === "debate") && D === y ? a.createElement(
                p,
                { color: "blue", style: { fontSize: 10 } },
                _ === "debate" ? "裁决者" : "主控"
              ) : null
            ),
            a.createElement(
              "div",
              { style: { display: "flex", gap: 4 } },
              a.createElement(u, {
                size: "small",
                value: Ee[y] || fn(y),
                style: { width: 132 },
                onChange: (V) => _e({ ...Ee, [y]: V }),
                options: ke.map((V) => ({
                  value: V.key,
                  label: V.display_name
                }))
              }),
              a.createElement(u, {
                size: "small",
                value: P[y] || "fixed",
                style: { width: 118 },
                onChange: (V) => le({ ...P, [y]: V }),
                options: [
                  { value: "fixed", label: "固定实例" },
                  { value: "preferred", label: "优先实例" },
                  { value: "temporary", label: "临时派生" }
                ]
              }),
              _ === "coordinator" || _ === "debate" ? a.createElement(
                m,
                {
                  size: "small",
                  type: "link",
                  onClick: () => Y(y)
                },
                _ === "debate" ? "设为裁决者" : "设为主控"
              ) : null,
              a.createElement(
                m,
                {
                  size: "small",
                  type: "link",
                  danger: !0,
                  icon: x ? a.createElement(x) : void 0,
                  onClick: () => Q(y)
                },
                "移除"
              )
            )
          )
        )
      )
    ),
    _ === "review_loop" || _ === "router" ? a.createElement(
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
      _ === "review_loop" ? a.createElement(
        "div",
        { style: { display: "grid", gridTemplateColumns: "150px 1fr", gap: 10 } },
        a.createElement(u, {
          value: K,
          onChange: (y) => pe(y),
          options: [1, 2, 3, 4, 5].map((y) => ({ value: y, label: `最多 ${y} 轮` }))
        }),
        a.createElement(c, {
          value: ae,
          onChange: (y) => J(y.target.value),
          placeholder: "验收标准，例如：关键结论均有数据依据，且无高风险缺陷"
        })
      ) : a.createElement(c, {
        value: de,
        onChange: (y) => G(y.target.value),
        placeholder: "路由偏好，例如：仅调用任务必需的专家；涉及模拟时优先油藏工程师"
      })
    ) : null,
    a.createElement(h, { style: { margin: "12px 0" } }),
    // Step 3: Define execution steps (for pipeline/roundtable)
    U.length > 0 ? a.createElement(
      "div",
      { style: { marginBottom: 16 } },
      a.createElement(
        T,
        {
          strong: !0,
          style: { display: "block", marginBottom: 8, fontSize: 13 }
        },
        `3. 配置专家任务${_ === "roundtable" ? "（并行独立）" : _ === "pipeline" ? "（顺序交接）" : _ === "router" ? "（作为候选能力）" : _ === "review_loop" ? "（首位执行、末位评审）" : _ === "debate" ? "（末位为裁决者）" : "（由主控动态编排）"}`
      ),
      // Auto-sync button
      a.createElement(
        m,
        {
          size: "small",
          type: "dashed",
          onClick: Te,
          style: { marginBottom: 8 }
        },
        "自动生成步骤"
      ),
      // Steps list
      q.length === 0 ? a.createElement(
        T,
        { type: "secondary", style: { fontSize: 12 } },
        "点击「自动生成步骤」或手动配置每步的指令"
      ) : a.createElement(
        "div",
        { style: { display: "flex", flexDirection: "column", gap: 6 } },
        ...q.map(
          (y, V) => a.createElement(
            "div",
            {
              key: V,
              style: {
                padding: 8,
                background: "var(--ant-color-bg-container, #fff)",
                borderRadius: 6,
                border: "1px solid #e8e8e8"
              }
            },
            a.createElement(
              "div",
              {
                style: {
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  marginBottom: 6
                }
              },
              _ === "pipeline" ? a.createElement(
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
                `${V + 1}`
              ) : a.createElement(
                "span",
                { style: { fontSize: 14 } },
                "🔀"
              ),
              a.createElement(
                p,
                { color: "blue", style: { fontSize: 11 } },
                y.agentName
              ),
              a.createElement(
                "div",
                { style: { flex: 1 } },
                a.createElement(c, {
                  placeholder: "请输入该步骤的指令...",
                  value: y.instruction,
                  onChange: ($) => Z(V, "instruction", $.target.value),
                  size: "small"
                })
              )
            ),
            a.createElement(
              "div",
              {
                style: {
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  paddingLeft: 28
                }
              },
              a.createElement(g, {
                size: "small",
                checked: y.passContext,
                onChange: ($) => Z(V, "passContext", $)
              }),
              a.createElement(
                T,
                { type: "secondary", style: { fontSize: 11 } },
                y.passContext ? "传递上一步结果作为上下文" : "独立执行"
              )
            )
          )
        )
      )
    ) : null,
    a.createElement(h, { style: { margin: "12px 0" } }),
    // Step 4: Task template
    a.createElement(
      "div",
      null,
      a.createElement(
        T,
        {
          strong: !0,
          style: { display: "block", marginBottom: 8, fontSize: 13 }
        },
        `${U.length > 0 ? "4" : "3"}. 任务模板`
      ),
      a.createElement(c.TextArea, {
        placeholder: `输入任务模板，可用 {参数名} 作为占位符...

例如：
请对区块 {区块名} 的井 {井号} 进行储层评价`,
        value: O,
        onChange: (y) => I(y.target.value),
        rows: 4,
        style: { fontFamily: "monospace", fontSize: 13 }
      }),
      a.createElement(
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
function va({
  team: e,
  agents: t,
  onLaunch: n,
  onEdit: r,
  onDelete: i
}) {
  var k;
  const a = R().React, { useState: o } = a, { Card: l, Tag: s, Typography: d, Button: c, Tooltip: m, Popconfirm: u } = R().antd, {
    TeamOutlined: p,
    RocketOutlined: b,
    UserOutlined: g,
    EditOutlined: E,
    DeleteOutlined: f,
    DownOutlined: h,
    UpOutlined: v
  } = R().antdIcons || {}, { Text: w, Paragraph: x } = d, [j, X] = o(!1), T = {
    coordinator: { label: "主管协作", color: "blue" },
    pipeline: { label: "顺序交接", color: "cyan" },
    roundtable: { label: "并行汇聚", color: "purple" },
    router: { label: "智能路由", color: "orange" },
    review_loop: { label: "评审迭代", color: "green" },
    debate: { label: "多方论证", color: "magenta" }
  }, A = T[e.mode] || T.coordinator, F = e.members.map((z) => {
    const B = z.bindingMode === "temporary", _ = B ? null : (z.agentId && t.some((L) => L.id === z.agentId) ? z.agentId : null) || wi(t, z.name);
    return { ...z, found: !!_, agentId: _, temporary: B };
  }), N = F.filter((z) => z.found).length, C = e.coordinatorName || ((k = e.members[0]) == null ? void 0 : k.name);
  return a.createElement(
    l,
    {
      hoverable: !0,
      size: "small",
      style: { height: "100%", display: "flex", flexDirection: "column" }
    },
    // Header: emoji + name + mode tag + custom badge
    a.createElement(
      "div",
      {
        style: {
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 10
        }
      },
      a.createElement(Tr, {
        members: e.members.map((z) => z.name),
        size: 36
      }),
      a.createElement(
        "div",
        { style: { flex: 1 } },
        a.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 6 } },
          a.createElement(
            w,
            { strong: !0, style: { fontSize: 14 } },
            e.name
          ),
          e.custom ? a.createElement(
            s,
            { color: "gold", style: { fontSize: 9 } },
            "自定义"
          ) : null
        ),
        a.createElement(
          "div",
          { style: { display: "flex", gap: 4, marginTop: 4 } },
          a.createElement(
            s,
            { color: A.color, style: { fontSize: 10 } },
            A.label
          ),
          a.createElement(
            s,
            { color: "green", style: { fontSize: 10 } },
            `${e.members.length} 位专家`
          ),
          N < e.members.length ? a.createElement(
            m,
            {
              title: `OMP 架构下，未创建的专家将通过 spawn_subagent 自动派发，
控制器会根据角色 prompt 创建子 agent 执行任务。`
            },
            a.createElement(
              s,
              { color: "blue", style: { fontSize: 10 } },
              "OMP 自动派发"
            )
          ) : a.createElement(
            s,
            { color: "green", style: { fontSize: 10 } },
            "全部就绪"
          )
        )
      ),
      // Edit/delete for custom teams
      e.custom ? a.createElement(
        "div",
        { style: { display: "flex", gap: 2 } },
        r ? a.createElement(
          m,
          { title: "编辑" },
          a.createElement(c, {
            type: "text",
            size: "small",
            icon: E ? a.createElement(E) : void 0,
            onClick: (z) => {
              z.stopPropagation(), r(e);
            }
          })
        ) : null,
        i ? a.createElement(
          m,
          { title: "删除" },
          a.createElement(
            u,
            {
              title: `删除专家团「${e.name}」？`,
              description: "此操作会删除后端定义，但不会删除既有讨论记录。",
              okText: "删除",
              cancelText: "取消",
              okButtonProps: { danger: !0 },
              onConfirm: () => i(e)
            },
            a.createElement(c, {
              type: "text",
              size: "small",
              danger: !0,
              icon: f ? a.createElement(f) : void 0,
              onClick: (z) => z.stopPropagation()
            })
          )
        ) : null
      ) : null
    ),
    // Description
    a.createElement(
      x,
      {
        type: "secondary",
        style: { fontSize: 12, margin: 0, marginBottom: 10, lineHeight: 1.5 },
        ellipsis: { rows: 2 }
      },
      e.description
    ),
    // Member avatars
    a.createElement(
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
        (z) => a.createElement(
          m,
          {
            key: z.name,
            title: `${z.name}（${z.role}）${z.temporary ? " - OMP 临时派生" : z.found ? " - 已绑定实例" : " - OMP 按角色派发"}`
          },
          a.createElement(
            "div",
            {
              style: {
                display: "flex",
                alignItems: "center",
                gap: 4,
                padding: "2px 8px",
                borderRadius: 12,
                background: z.found ? "#f0f5ff" : "#f0f0ff",
                border: `1px solid ${z.found ? "#d6e4ff" : "#d3adf7"}`,
                fontSize: 11
              }
            },
            a.createElement(dt, { name: z.name, size: 18 }),
            a.createElement(
              w,
              {
                style: { fontSize: 11, color: z.found ? "#1f4e8c" : "#531dab" }
              },
              z.name
            ),
            z.temporary ? a.createElement(
              s,
              { color: "purple", style: { fontSize: 9, marginInlineEnd: 0 } },
              "派生"
            ) : null
          )
        )
      )
    ),
    // Toggle flow diagram
    a.createElement(
      c,
      {
        type: "link",
        size: "small",
        style: { padding: "0 0 4px 0", fontSize: 11, height: "auto" },
        onClick: (z) => {
          z.stopPropagation(), X(!j);
        },
        icon: j ? v ? a.createElement(v) : "▲" : h ? a.createElement(h) : "▼"
      },
      j ? "收起流程" : "查看执行流程"
    ),
    j ? a.createElement(Ys, { team: e }) : null,
    // Footer: launch button
    a.createElement(
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
      a.createElement(
        w,
        { type: "secondary", style: { fontSize: 11 } },
        C ? `${e.mode === "debate" ? "裁决者" : "主控"}: ${C}` : "OMP 动态编排"
      ),
      a.createElement(
        c,
        {
          type: "primary",
          size: "small",
          icon: b ? a.createElement(b) : void 0,
          disabled: t.length === 0,
          onClick: () => n(e),
          style: Ke
        },
        "运行工作流"
      )
    )
  );
}
function el({
  agents: e,
  onLaunch: t
}) {
  const n = R().React, { useMemo: r, useState: i, useCallback: a, useEffect: o } = n, {
    Row: l,
    Col: s,
    Input: d,
    Empty: c,
    Typography: m,
    Tag: u,
    Button: p,
    Divider: b,
    Tabs: g,
    message: E
  } = R().antd, { SearchOutlined: f, PlusOutlined: h, RocketOutlined: v } = R().antdIcons || {}, { Text: w } = m, [x, j] = i(""), [X, T] = i([]), [A, F] = i([]), [N, C] = i(!1), [k, z] = i(null), [B, _] = i("preset");
  o(() => {
    let M = !0;
    return (async () => {
      try {
        await Ns();
        const ne = await ir();
        M && T(ne);
      } catch (ne) {
        console.warn("[ugsci] Failed to load backend expert teams:", ne), M && (T([]), E.warning("专家团后端加载失败，请检查服务后重试"));
      }
    })(), qs().then((ne) => {
      M && ne && F(ne);
    }), () => {
      M = !1;
    };
  }, []);
  const L = a(() => {
    ir().then(T).catch((M) => {
      console.warn("[ugsci] Failed to refresh expert teams:", M), T([]), E.warning("专家团后端加载失败，请检查服务后重试");
    });
  }, [E]), D = a(
    (M) => {
      Us(M.id).then(() => {
        L(), E.success(`团队「${M.name}」已删除`);
      }).catch((ne) => E.error(ne.message || "删除专家团失败"));
    },
    [E, L]
  ), Y = a((M) => {
    z(M), C(!0);
  }, []), O = a(() => {
    z(null), C(!0);
  }, []), I = r(() => [...X, ...A], [X, A]), q = r(() => {
    if (!x.trim()) return I;
    const M = x.toLowerCase();
    return I.filter(
      (ne) => ne.name.toLowerCase().includes(M) || ne.description.toLowerCase().includes(M) || ne.category.toLowerCase().includes(M)
    );
  }, [I, x]), H = q.filter((M) => M.custom), U = q.filter((M) => !M.custom);
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
        prefix: f ? n.createElement(f) : void 0,
        value: x,
        onChange: (M) => j(M.target.value),
        allowClear: !0,
        style: { flex: "1 1 280px", maxWidth: 400 }
      }),
      n.createElement(
        p,
        {
          type: "primary",
          size: "small",
          icon: h ? n.createElement(h) : void 0,
          onClick: O,
          style: Ke
        },
        "创建专家团"
      )
    ),
    // Tabs: preset teams vs custom teams
    n.createElement(
      g,
      {
        activeKey: B,
        onChange: _,
        items: [
          {
            key: "preset",
            label: `预设团队${U.length ? ` (${U.length})` : ""}`,
            children: n.createElement(
              "div",
              null,
              U.length > 0 ? n.createElement(
                l,
                { gutter: [12, 12] },
                ...U.map(
                  (M) => n.createElement(
                    s,
                    { key: M.id, xs: 24, sm: 12, md: 8 },
                    n.createElement(va, {
                      team: M,
                      agents: e,
                      onLaunch: t
                    })
                  )
                )
              ) : n.createElement(c, {
                description: "未找到匹配的预设团队",
                image: c.PRESENTED_IMAGE_SIMPLE
              })
            )
          },
          {
            key: "custom",
            label: `自定义团队${H.length ? ` (${H.length})` : ""}`,
            children: n.createElement(
              "div",
              null,
              H.length > 0 ? n.createElement(
                l,
                { gutter: [12, 12] },
                ...H.map(
                  (M) => n.createElement(
                    s,
                    { key: M.id, xs: 24, sm: 12, md: 8 },
                    n.createElement(va, {
                      team: M,
                      agents: e,
                      onLaunch: t,
                      onEdit: Y,
                      onDelete: D
                    })
                  )
                )
              ) : n.createElement(c, {
                description: "暂无自定义团队，点击「创建专家团」自定义",
                image: c.PRESENTED_IMAGE_SIMPLE
              })
            )
          },
          {
            key: "active",
            label: "进行中的讨论",
            children: n.createElement(
              n.Fragment,
              null,
              n.createElement(Xs, {
                enabled: B === "active"
              }),
              n.createElement(ha, {
                activeOnly: !0,
                enabled: B === "active"
              })
            )
          },
          {
            key: "history",
            label: "讨论历史",
            children: n.createElement(ha, {
              enabled: B === "history"
            })
          }
        ]
      }
    ),
    // Team Builder Modal
    n.createElement(Qs, {
      open: N,
      onClose: () => {
        C(!1), z(null);
      },
      agents: e,
      editingTeam: k,
      onSaved: L
    })
  );
}
const tl = [
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
], nl = 5e3, Xn = {
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
function rl(e) {
  window.history.pushState({}, "", e), window.dispatchEvent(new PopStateEvent("popstate"));
}
function Wt(e, t) {
  const n = new URLSearchParams();
  e && n.set("flow", e), t && n.set("run", t), rl(`/flowforge${n.size ? `?${n.toString()}` : ""}`);
}
function al(e) {
  return e ? new Date(e * 1e3).toLocaleString("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  }) : "—";
}
function il(e) {
  if (!e || e <= 0) return "—";
  if (e < 1e3) return `${e}ms`;
  const t = Math.floor(e / 1e3);
  if (t < 60) return `${t}s`;
  const n = Math.floor(t / 60), r = t % 60;
  return `${n}m${r}s`;
}
function ol(e) {
  if (!e) return "";
  const t = Object.keys(e).length;
  if (t === 0) return "";
  const n = Object.values(e).filter(
    (i) => i === "success" || i === "completed" || i === "skipped" || i === "cached"
  ).length, r = Object.values(e).filter(
    (i) => i === "error" || i === "failed"
  ).length;
  return r > 0 ? `${n}/${t} 节点完成 (${r} 失败)` : `${n}/${t} 节点完成`;
}
function _i(e) {
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
function Ht(e) {
  return ["success", "completed", "skipped", "cached"].includes(e) ? "green" : ["error", "failed"].includes(e) ? "red" : ["running"].includes(e) ? "blue" : ["queued", "pending"].includes(e) ? "cyan" : "gold";
}
function sl(e, t) {
  const n = typeof e.type == "string" ? e.type : "事件", r = typeof e.node_id == "string" ? ` · ${e.node_id}` : "", i = e.state && typeof e.state == "object" ? e.state : {}, a = e.data && typeof e.data == "object" ? e.data : {}, o = [e.message, i.message, i.error, a.message, a.error].find((d) => typeof d == "string" && d.length > 0) || "";
  if (o) return `${n}${r}: ${o}`;
  const l = typeof e.status == "string" ? e.status : typeof i.status == "string" ? i.status : "", s = l ? ` · ${_i(l)}` : "";
  if (s) return `${n}${r}${s}`;
  try {
    const d = JSON.stringify(Object.keys(a).length > 0 ? a : e) || "{}", c = d.length > 240 ? `${d.slice(0, 237)}...` : d;
    return `${n}${r}: ${c}`;
  } catch {
    return `${n}${r} #${t + 1}`;
  }
}
const ll = /* @__PURE__ */ new Set(["running", "queued", "paused", "waiting_human"]);
function gn(e) {
  return !e.resumed_by_run_id && ll.has(e.status);
}
function cl() {
  const e = R().React, { useCallback: t, useEffect: n, useRef: r, useState: i } = e, {
    Alert: a,
    Button: o,
    Card: l,
    Col: s,
    Empty: d,
    Input: c,
    Popconfirm: m,
    Modal: u,
    Row: p,
    Space: b,
    Spin: g,
    Tabs: E,
    Progress: f,
    Tag: h,
    Tooltip: v,
    Typography: w,
    message: x
  } = R().antd, {
    ApartmentOutlined: j,
    DeleteOutlined: X,
    ReloadOutlined: T,
    RocketOutlined: A,
    PlayCircleOutlined: F,
    StopOutlined: N
  } = R().antdIcons || {}, { Text: C, Paragraph: k, Title: z } = w, B = R().useSelectedAgent, _ = B ? B() : { id: "default" }, L = (_ == null ? void 0 : _.id) || "default", [D, Y] = i([]), [O, I] = i([]), [q, H] = i([]), [U, M] = i(!0), [ne, re] = i(!0), [K, pe] = i(null), [ae, J] = i(null), [de, G] = i(""), P = r(0), le = r(L);
  le.current = L;
  const [Ee, _e] = i(""), [ke, Se] = i(""), [fe, Te] = i("templates"), [Ce, Q] = i(/* @__PURE__ */ new Set()), [Z, ce] = i(/* @__PURE__ */ new Set()), he = r(null), y = O.some(gn), V = e.useMemo(() => {
    const W = {};
    return D.forEach((ge) => {
      W[ge.id] = ge.name;
    }), W;
  }, [D]), $ = e.useMemo(() => {
    const W = {};
    return O.forEach((ge) => {
      gn(ge) && (W[ge.flow_id] = (W[ge.flow_id] || 0) + 1);
    }), W;
  }, [O]), ue = t(async (W = !1) => {
    W || M(!0);
    try {
      const [ge, ie, Oe] = await Promise.all([
        me("/flowforge/flows", { bypassCache: !0 }),
        me("/flowforge/runs", { bypassCache: !0 }),
        Bn().catch(() => [])
      ]);
      Y(ge), I(ie), H(Oe), re(!0);
    } catch (ge) {
      console.warn("[ugsci] FlowForge is unavailable:", ge), W || re(!1);
    } finally {
      W || M(!1);
    }
  }, []);
  n(() => {
    ue();
  }, [ue]), n(() => {
    if (!ne || !y) {
      he.current && (clearInterval(he.current), he.current = null);
      return;
    }
    let W = !1;
    return he.current = setInterval(async () => {
      if (!W) {
        W = !0;
        try {
          await ue(!0);
        } finally {
          W = !1;
        }
      }
    }, nl), () => {
      he.current && (clearInterval(he.current), he.current = null);
    };
  }, [y, ne, ue]);
  const ye = t(
    async (W) => {
      if (!K) {
        pe(W.key);
        try {
          const ge = await me(
            "/flowforge/generate",
            {
              method: "POST",
              body: JSON.stringify({
                prompt: W.sop,
                name: W.name,
                agent_id: L
              })
            }
          ), ie = {
            ...ge.nodes || {}
          }, Oe = Object.entries(ie).filter(([We]) => /^step_\d+$/.test(We)).sort(([We], [He]) => Number(We.slice(5)) - Number(He.slice(5))), $e = {};
          let Ne = 0, at = 0;
          Oe.forEach(([We, He], st) => {
            const qe = W.roleHints[st] || "", De = W.roleKeys[st] || "analyst", je = q.find(
              (jt) => `${jt.name} ${jt.id}`.toLowerCase().includes(qe.toLowerCase())
            );
            je ? Ne++ : at++;
            const lt = (je == null ? void 0 : je.id) || L, St = { ...He.inputs || {} };
            St.agent_id = lt, ie[We] = {
              ...He,
              inputs: St,
              metadata: {
                ...He.metadata || {},
                binding_policy: "fixed_instance",
                role_hint: qe,
                role_key: De,
                agent_id: lt
              }
            }, $e[We] = {
              binding_policy: "fixed_instance",
              role_hint: qe,
              role_key: De,
              agent_id: lt
            };
          });
          const it = {
            ...ge,
            nodes: ie,
            id: `${W.key}-${Date.now()}`,
            name: W.name,
            description: W.description,
            metadata: {
              ...ge.metadata || {},
              domain: "oil-gas",
              template_key: W.key,
              expert_binding_policy: "fixed_instance",
              controller_agent_id: L,
              node_bindings: $e
            }
          };
          await me("/flowforge/flows", {
            method: "POST",
            body: JSON.stringify(it)
          });
          const ze = Oe.length > 0 ? `（${Ne} 个专家已匹配，${at} 个回退到控制器）` : "";
          x.success(`已创建工作流草稿「${W.name}」${ze}`), await ue();
        } catch (ge) {
          x.error(ge.message || "创建工作流失败");
        } finally {
          pe(null);
        }
      }
    },
    [q, L, K, ue, x]
  );
  n(() => {
    P.current++, J(null), G(""), pe(null);
  }, [L]);
  const be = t(async () => {
    if (K || !ke.trim()) return;
    const W = ++P.current;
    pe("natural-language"), G("");
    try {
      const ge = await me("/flowforge/authoring/proposals", {
        method: "POST",
        body: JSON.stringify({ prompt: ke.trim(), name: Ee.trim(), agent_id: L })
      });
      W === P.current && J(ge);
    } catch (ge) {
      W === P.current && G(ge.message || "生成失败，请检查模型配置后重试");
    } finally {
      W === P.current && pe(null);
    }
  }, [L, K, Ee, ke]), Ae = t(async () => {
    if (!(ae != null && ae.validation.ok) || K) return;
    const W = L;
    pe("apply"), G("");
    try {
      const ge = await me(`/flowforge/authoring/proposals/${encodeURIComponent(ae.proposal_id)}/apply`, {
        method: "POST",
        body: JSON.stringify({ expected_revision: ae.base_revision })
      });
      if (le.current !== W) return;
      J(null), _e(""), Se(""), x.success("方案已应用并保存"), Wt(ge.id);
    } catch (ge) {
      le.current === W && G(ge.message || "应用失败，请重新生成方案");
    } finally {
      le.current === W && pe(null);
    }
  }, [ae, K, L, x]), Be = t(
    async (W, ge) => {
      try {
        await me(`/flowforge/flows/${encodeURIComponent(W)}`, {
          method: "DELETE"
        }), x.success(`已删除工作流「${ge}」`), await ue();
      } catch (ie) {
        x.error(ie.message || "删除工作流失败");
      }
    },
    [ue, x]
  ), Le = t(
    async (W) => {
      Q((ge) => {
        const ie = new Set(ge);
        return ie.add(W), ie;
      });
      try {
        await me(`/flowforge/runs/${encodeURIComponent(W)}/cancel`, {
          method: "POST"
        }), x.success("已请求取消运行"), await ue(!0);
      } catch (ge) {
        x.error(ge.message || "取消运行失败");
      } finally {
        Q((ge) => {
          const ie = new Set(ge);
          return ie.delete(W), ie;
        });
      }
    },
    [ue, x]
  ), nt = e.createElement(
    "div",
    null,
    e.createElement(
      l,
      {
        size: "small",
        title: "用自然语言生成工作流",
        style: { marginBottom: 16 }
      },
      e.createElement(
        b,
        { direction: "vertical", style: { width: "100%" }, size: 10 },
        e.createElement(c, {
          "aria-label": "工作流名称",
          value: Ee,
          onChange: (W) => _e(W.target.value),
          placeholder: "工作流名称（可选）",
          maxLength: 80
        }),
        e.createElement(c.TextArea, {
          "aria-label": "工作流需求描述",
          value: ke,
          onChange: (W) => Se(W.target.value),
          placeholder: "例如：先检查某储气库本周期压力和注采量数据，再由油藏工程师预测下周期能力，由独立完整性专家复核风险，最后形成带证据和不确定性的建议。",
          autoSize: { minRows: 3, maxRows: 8 }
        }),
        e.createElement(
          o,
          {
            type: "primary",
            onClick: () => void be(),
            loading: K === "natural-language",
            disabled: !ne || !!K || !ke.trim(),
            style: Ke
          },
          "生成并预览方案"
        )
      )
    ),
    e.createElement(
      p,
      { gutter: [12, 12] },
      ...tl.map(
        (W) => e.createElement(
          s,
          { key: W.key, xs: 24, md: 8 },
          e.createElement(
            l,
            { style: { height: "100%" } },
            e.createElement(
              b,
              { align: "start", style: { width: "100%" } },
              e.createElement("span", { style: { fontSize: 28 } }, W.icon),
              e.createElement(
                "div",
                { style: { flex: 1 } },
                e.createElement(z, { level: 5, style: { margin: 0 } }, W.name),
                e.createElement(h, { color: "blue", style: { marginTop: 6 } }, W.category),
                e.createElement(
                  k,
                  { type: "secondary", style: { margin: "10px 0 14px" } },
                  W.description
                ),
                e.createElement(
                  o,
                  {
                    type: "primary",
                    loading: K === W.key,
                    disabled: !ne || !!K,
                    onClick: () => void ye(W),
                    style: Ke
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
      l,
      { size: "small", title: "专家节点绑定策略", style: { marginTop: 16 } },
      e.createElement(
        p,
        { gutter: [12, 12] },
        ...[
          ["固定实例", "生产关键节点使用指定且已验证的专家实例", "当前可执行"],
          ["优先实例", "定义中记录首选实例和治理降级策略", "规划中"],
          ["模板派生", "由 OMP 控制节点按角色模板临时创建隔离角色", "规划中"],
          ["动态路由", "按能力、健康、权限和成本选择实例", "规划中"]
        ].map(
          ([W, ge, ie]) => e.createElement(
            s,
            { key: W, xs: 24, sm: 12, lg: 6 },
            e.createElement(C, { strong: !0 }, W),
            e.createElement(
              h,
              {
                color: ie === "当前可执行" ? "green" : "default",
                style: { marginLeft: 6, fontSize: 10 }
              },
              ie
            ),
            e.createElement("div", { style: { color: "var(--ant-color-text-tertiary, #8c8c8c)", fontSize: 12, marginTop: 4 } }, ge)
          )
        )
      )
    )
  ), Ge = U ? e.createElement(g) : D.length === 0 ? e.createElement(d, { description: "暂无工作流，可从模板创建" }) : e.createElement(
    p,
    { gutter: [12, 12] },
    ...D.map((W) => {
      const ge = $[W.id] || 0;
      return e.createElement(
        s,
        { key: W.id, xs: 24, md: 12, xl: 8 },
        e.createElement(
          l,
          {
            size: "small",
            title: e.createElement(
              b,
              { size: 6 },
              e.createElement("span", null, W.name),
              ge > 0 ? e.createElement(
                h,
                { color: "blue" },
                `${ge} 个运行中`
              ) : null
            ),
            extra: e.createElement(h, null, `v${W.version}`)
          },
          e.createElement(k, { ellipsis: { rows: 2 } }, W.description || "暂无描述"),
          e.createElement(
            b,
            { size: 8, wrap: !0 },
            e.createElement(h, { color: "geekblue" }, `${W.node_count} 个节点`),
            e.createElement(o, {
              size: "small",
              type: "primary",
              icon: F ? e.createElement(F) : void 0,
              disabled: !ne,
              onClick: () => Wt(W.id)
            }, "配置并运行"),
            e.createElement(o, {
              size: "small",
              onClick: () => Wt(W.id)
            }, "编辑"),
            e.createElement(
              m,
              {
                title: "确认删除",
                description: `确定要删除工作流「${W.name}」吗？此操作不可撤销。`,
                onConfirm: () => void Be(W.id, W.name),
                okText: "删除",
                cancelText: "取消",
                okButtonProps: { danger: !0 }
              },
              e.createElement(o, {
                size: "small",
                danger: !0,
                icon: X ? e.createElement(X) : void 0
              }, "删除")
            )
          )
        )
      );
    })
  ), rt = U ? e.createElement(g) : O.length === 0 ? e.createElement(d, { description: "暂无工作流运行记录" }) : e.createElement(
    "div",
    { style: { display: "flex", flexDirection: "column", gap: 8 } },
    ...O.map((W) => {
      const ge = V[W.flow_id] || W.flow_id, ie = gn(W), Oe = ol(W.node_statuses), $e = Object.entries(W.node_statuses || {}), Ne = $e.filter(([, De]) => ["success", "completed", "skipped", "cached"].includes(De)).length, at = $e.filter(([, De]) => ["error", "failed"].includes(De)).length, it = $e.length > 0, ze = W.status === "completed" || W.status === "success", We = it ? Math.round(Ne / $e.length * 100) : ie ? 18 : ze ? 100 : 0, He = Array.isArray(W.events) ? W.events.filter(
        (De) => !!De && typeof De == "object"
      ).slice(-100) : [], st = Z.has(W.run_id), qe = W.duration_ms && W.duration_ms > 0 ? W.duration_ms : W.finished_at && W.started_at ? (W.finished_at - W.started_at) * 1e3 : ie && W.started_at ? (Date.now() / 1e3 - W.started_at) * 1e3 : 0;
      return e.createElement(
        l,
        {
          key: W.run_id,
          size: "small",
          style: {
            borderLeft: `3px solid ${Xn[W.status] === "green" ? "#52c41a" : Xn[W.status] === "red" ? "#ff4d4f" : "#1677ff"}`,
            transition: "box-shadow .2s ease"
          }
        },
        e.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" } },
          e.createElement(
            h,
            { color: Xn[W.status] || "default" },
            W.resumed_by_run_id ? "已恢复" : W.status
          ),
          e.createElement(C, { strong: !0 }, ge),
          e.createElement(
            v,
            { title: W.run_id },
            e.createElement(
              C,
              { type: "secondary", style: { fontFamily: "monospace", fontSize: 11 } },
              W.run_id.slice(0, 8) + "…"
            )
          ),
          e.createElement(
            C,
            { type: "secondary", style: { fontSize: 12 } },
            al(W.started_at)
          ),
          qe > 0 ? e.createElement(
            C,
            { type: "secondary", style: { fontSize: 12 } },
            `耗时 ${il(qe)}`
          ) : null,
          Oe ? e.createElement(h, { color: "geekblue", style: { fontSize: 11 } }, Oe) : null,
          W.error ? e.createElement(
            v,
            { title: W.error },
            e.createElement(C, { type: "danger", style: { fontSize: 12 } }, "（有错误）")
          ) : null,
          e.createElement(
            "div",
            { style: { marginLeft: "auto", display: "flex", gap: 6 } },
            ie ? e.createElement(
              m,
              {
                title: "确认取消运行？",
                onConfirm: () => void Le(W.run_id),
                okText: "取消运行",
                cancelText: "保留",
                okButtonProps: { danger: !0 }
              },
              e.createElement(o, {
                size: "small",
                danger: !0,
                loading: Ce.has(W.run_id),
                icon: N ? e.createElement(N) : void 0
              }, "取消运行")
            ) : null,
            e.createElement(
              o,
              {
                size: "small",
                type: "link",
                onClick: () => ce((De) => {
                  const je = new Set(De);
                  return je.has(W.run_id) ? je.delete(W.run_id) : je.add(W.run_id), je;
                })
              },
              st ? "收起过程" : "查看过程"
            ),
            e.createElement(
              o,
              {
                size: "small",
                type: "link",
                onClick: () => Wt(void 0, W.run_id)
              },
              "查看详情"
            )
          )
        ),
        e.createElement(
          "div",
          { style: { marginTop: 10, display: "flex", alignItems: "center", gap: 10 } },
          e.createElement(f, { percent: We, size: "small", status: at || W.status === "failed" || W.status === "error" ? "exception" : ie ? "active" : "success", showInfo: !1, style: { flex: 1, margin: 0 } }),
          e.createElement(C, { type: "secondary", style: { fontSize: 12, minWidth: 90, textAlign: "right" } }, it ? `${We}%` : "暂无节点进度")
        ),
        st && ($e.length > 0 || He.length > 0 || W.error) ? e.createElement(
          "div",
          { style: { marginTop: 12, padding: "10px 12px", borderRadius: 8, background: "var(--ant-color-fill-quaternary, #fafafa)" } },
          e.createElement(
            "div",
            { style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 } },
            e.createElement(C, { strong: !0 }, "协作过程"),
            e.createElement(C, { type: "secondary", style: { fontSize: 12 } }, $e.length > 0 ? `${Ne}/${$e.length} 个 Agent 节点完成${at ? ` · ${at} 个失败` : ""}` : "暂无节点状态")
          ),
          $e.length > 0 ? e.createElement(
            "div",
            { style: { display: "grid", gap: 7 } },
            ...$e.map(
              ([De, je], lt) => e.createElement(
                "div",
                { key: De, style: { display: "flex", alignItems: "center", gap: 8 } },
                e.createElement("span", { style: { width: 22, height: 22, borderRadius: "50%", display: "inline-flex", alignItems: "center", justifyContent: "center", background: Ht(je) === "green" ? "#f6ffed" : Ht(je) === "red" ? "#fff2f0" : "#e6f4ff", color: Ht(je) === "green" ? "#389e0d" : Ht(je) === "red" ? "#cf1322" : "#1677ff", fontSize: 11, fontWeight: 600 } }, lt + 1),
                e.createElement(C, { style: { flex: 1, fontSize: 12 } }, De.replace(/^step[_-]?\d+[_-]?/, "") || `Agent ${lt + 1}`),
                lt < $e.length - 1 ? e.createElement(C, { type: "secondary", style: { fontSize: 11 } }, "→") : null,
                e.createElement(h, { color: Ht(je), style: { margin: 0, fontSize: 11 } }, _i(je))
              )
            )
          ) : null,
          He.length > 0 ? e.createElement(
            "div",
            { style: { display: "grid", gap: 5, marginTop: $e.length > 0 ? 10 : 0 } },
            e.createElement(C, { strong: !0, style: { fontSize: 12 } }, "执行事件"),
            ...He.map((De, je) => e.createElement(C, { key: `event-${je}`, type: "secondary", style: { fontSize: 12 } }, sl(De, je)))
          ) : null,
          W.error ? e.createElement(a, { type: "error", showIcon: !0, message: "运行错误", description: W.error, style: { marginTop: 10 } }) : null
        ) : null
      );
    })
  ), Ye = e.createElement(
    b,
    null,
    e.createElement(o, {
      icon: T ? e.createElement(T) : void 0,
      onClick: () => void ue(),
      loading: U
    }, "刷新"),
    fe !== "templates" ? e.createElement(o, {
      type: "primary",
      icon: j ? e.createElement(j) : A ? e.createElement(A) : void 0,
      onClick: () => Wt(),
      disabled: !ne,
      style: Ke
    }, "打开流程编辑器") : null
  );
  return e.createElement(
    "div",
    null,
    ne ? null : e.createElement(a, {
      type: "warning",
      message: "FlowForge 引擎未启动",
      description: "协作工作流功能需要 FlowForge 后端引擎支持。请检查后端是否正常运行，或联系管理员。",
      showIcon: !0,
      style: { marginBottom: 16 }
    }),
    de ? e.createElement(a, { type: "error", showIcon: !0, message: "方案未应用", description: de, style: { marginBottom: 12 } }) : null,
    e.createElement(u, {
      title: "审查工作流方案",
      open: !!ae,
      width: 720,
      onCancel: () => {
        K || (J(null), G(""));
      },
      onOk: () => void Ae(),
      okText: "应用并打开编辑器",
      cancelText: "放弃方案",
      confirmLoading: K === "apply",
      okButtonProps: { disabled: !(ae != null && ae.validation.ok) || !!K },
      cancelButtonProps: { disabled: !!K },
      closable: !K,
      maskClosable: !K
    }, ae ? e.createElement(
      b,
      { direction: "vertical", style: { width: "100%" } },
      e.createElement(a, {
        type: ae.validation.ok ? "success" : "error",
        showIcon: !0,
        message: ae.validation.ok ? "结构验证通过，请检查业务逻辑" : "方案未通过验证",
        description: ae.validation.errors.join("；") || "确认后保存流程，可在编辑器配置业务输入并试运行。"
      }),
      ...ae.warnings.map((W, ge) => e.createElement(a, { key: `warning-${ge}`, type: "warning", message: W })),
      e.createElement("ul", null, ...ae.changes.map((W, ge) => e.createElement("li", { key: ge }, W.description))),
      de ? e.createElement(a, { type: "error", message: de }) : null
    ) : null),
    e.createElement(E, {
      items: [
        { key: "templates", label: "工作流模板", children: nt },
        { key: "mine", label: `我的工作流 (${D.length})`, children: Ge },
        {
          key: "runs",
          label: e.createElement(
            "span",
            null,
            "运行中心 (",
            O.length,
            y ? e.createElement(
              "span",
              { style: { color: "#1677ff", marginLeft: 2 } },
              `·${O.filter((W) => gn(W)).length} 活跃`
            ) : null,
            ")"
          ),
          children: rt
        }
      ],
      activeKey: fe,
      onChange: (W) => Te(W),
      tabBarExtraContent: Ye
    })
  );
}
function wa(e, t) {
  var i, a;
  const n = e.coordinatorName || ((i = e.members[0]) == null ? void 0 : i.name), r = e.members.find((o) => o.name === n) || e.members[0];
  if ((r == null ? void 0 : r.bindingMode) !== "temporary" && (r != null && r.agentId) && t.some((o) => o.id === r.agentId))
    return r.agentId;
  if (n && (r == null ? void 0 : r.bindingMode) !== "temporary") {
    const o = wi(t, n);
    if (o) return o;
  }
  return (r == null ? void 0 : r.bindingMode) === "fixed" ? null : ((a = t[0]) == null ? void 0 : a.id) || null;
}
function Sa() {
  const e = new URLSearchParams(window.location.search).get("section");
  return e === "teams" || e === "workflows" ? e : "experts";
}
function dl() {
  var Q, Z, ce, he;
  const e = R().React, { useState: t, useEffect: n, useCallback: r, useMemo: i } = e, a = (Z = (Q = R()).useNavigate) == null ? void 0 : Z.call(Q), o = r((y) => {
    a ? a(y) : window.location.assign(y);
  }, [a]), {
    Spin: l,
    Empty: s,
    Input: d,
    Button: c,
    message: m,
    Tabs: u,
    Modal: p,
    Typography: b
  } = R().antd, {
    ReloadOutlined: g,
    PlusOutlined: E,
    SearchOutlined: f,
    TeamOutlined: h,
    UserOutlined: v
  } = R().antdIcons || {}, { Text: w, Paragraph: x } = b, [j, X] = t([]), [T, A] = t(!0), [F, N] = t(!1), [C, k] = t(null), [z, B] = t(""), [_, L] = t(!1), [D, Y] = t(Sa), [O, I] = t(
    null
  ), [q, H] = t(""), [U, M] = t(!1), [ne, re] = t(!1), [K, pe] = t(null), [ae, J] = t([]), de = r(async () => {
    A(!0);
    try {
      const y = await Bn(), V = await Promise.all(
        y.map(async ($) => {
          try {
            const [ue, ye, be] = await Promise.all([
              Sr($.id).catch(() => null),
              jn($.id).catch(() => []),
              kr($.id).catch(() => [])
            ]);
            return {
              agent: $,
              config: ue,
              skills: ye,
              mcps: be,
              loading: !1
            };
          } catch {
            return {
              agent: $,
              config: null,
              skills: [],
              mcps: [],
              loading: !1
            };
          }
        })
      );
      X(V), J(y);
    } catch (y) {
      m.error(y.message || "加载专家列表失败"), X([]);
    } finally {
      A(!1);
    }
  }, []);
  n(() => {
    de();
  }, [de]), n(() => {
    const y = () => Y(Sa());
    return window.addEventListener("popstate", y), () => window.removeEventListener("popstate", y);
  }, []), n(() => {
    if (K && ne) {
      const y = j.find((V) => V.agent.id === K.agent.id);
      y && y !== K && pe(y);
    }
  }, [j, K, ne]);
  const G = r(
    async (y) => {
      var ye;
      const V = y.coordinatorName || ((ye = y.members[0]) == null ? void 0 : ye.name), $ = wa(y, ae);
      if (!$) {
        const be = y.members.find(
          (Ae) => Ae.name === V
        );
        m.error(
          (be == null ? void 0 : be.bindingMode) === "fixed" ? `固定协调者「${V || "协调者"}」当前不可用，请修复绑定后再运行` : "没有可用的 Agent 作为工作流控制器"
        );
        return;
      }
      if (/\{.+?\}/.test(y.taskTemplate)) {
        H(y.taskTemplate), I(y);
        return;
      }
      await P(y, $, y.taskTemplate);
    },
    [ae, m]
  ), P = r(
    async (y, V, $) => {
      M(!0);
      try {
        const ue = $ || y.taskTemplate, ye = y.custom ? `@${y.id}` : y.name, be = `/ugsci-team ${y.mode} ${ye} ${ue}`, Ae = R();
        Ae.setSelectedAgent && Ae.setSelectedAgent(V);
        const Be = await Fs(V, be, y.name);
        m.success(`OMP 工作流已启动：${y.name}（${y.mode}模式）`), I(null), o(`/chat/${Be}`);
      } catch (ue) {
        m.error(ue.message || "发起团队任务失败");
      } finally {
        M(!1);
      }
    },
    [m, o]
  ), le = r((y) => {
    k(y), N(!0);
  }, []), Ee = r((y) => {
    pe(y), re(!0);
  }, []), _e = r(
    (y) => {
      if (!y.agent.enabled) {
        m.warning(`专家「${y.agent.name}」未启用，请先启用`);
        return;
      }
      try {
        if (y.agent.managed_by_app) {
          o(`/apps/${encodeURIComponent(y.agent.managed_by_app)}`);
          return;
        }
        if (y.agent.available_in_chat === !1)
          throw new Error("此专家不支持通用聊天，请从所属应用打开");
        const V = R();
        if (!V.setSelectedAgent) throw new Error("当前版本不支持切换专家，请更新软件后重试");
        V.setSelectedAgent(y.agent.id), sessionStorage.setItem("qwenpaw_pending_new_chat", "1"), o("/chat"), m.success(`已召唤专家「${y.agent.name}」`);
      } catch (V) {
        sessionStorage.removeItem("qwenpaw_pending_new_chat"), console.warn("[ugsci] Failed to set selected agent:", V), m.error(V instanceof Error ? V.message : "召唤专家失败，请重试");
      }
    },
    [m, o]
  ), ke = i(() => {
    if (!z.trim()) return j;
    const y = z.toLowerCase();
    return j.filter(
      (V) => {
        var $;
        return V.agent.name.toLowerCase().includes(y) || (($ = V.agent.description) == null ? void 0 : $.toLowerCase().includes(y)) || V.agent.id.toLowerCase().includes(y) || V.skills.some((ue) => ue.name.toLowerCase().includes(y));
      }
    );
  }, [j, z]), Se = j.filter((y) => y.agent.enabled).length, fe = j.reduce(
    (y, V) => y + V.skills.filter(($) => $.enabled !== !1).length,
    0
  ), Te = j.reduce((y, V) => y + V.mcps.length, 0), Ce = [
    {
      key: "experts",
      label: e.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        v ? e.createElement(v, { style: { fontSize: 14 } }) : null,
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
          e.createElement(d, {
            placeholder: "搜索专家名称、描述或技能...",
            prefix: f ? e.createElement(f) : void 0,
            value: z,
            onChange: (y) => B(y.target.value),
            allowClear: !0,
            style: { flex: "1 1 280px", maxWidth: 400 }
          }),
          e.createElement(
            c,
            {
              type: "primary",
              icon: E ? e.createElement(E) : void 0,
              onClick: () => L(!0),
              style: Ke
            },
            "创建专家"
          )
        ),
        // Content
        T ? e.createElement(
          "div",
          { style: { textAlign: "center", padding: 60 } },
          e.createElement(l, { size: "large" })
        ) : ke.length === 0 ? e.createElement(s, {
          description: z ? "未找到匹配的专家" : "暂无专家，点击「创建专家」添加"
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
          ...ke.map(
            (y) => e.createElement(
              "div",
              {
                key: y.agent.id,
                style: { display: "flex", minWidth: 0 }
              },
              e.createElement(As, {
                expert: y,
                onClick: () => le(y),
                onSummon: () => _e(y),
                onConfigure: () => Ee(y)
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
        h ? e.createElement(h, { style: { fontSize: 14 } }) : null,
        "专家团"
      ),
      children: e.createElement(el, {
        agents: ae,
        onLaunch: G
      })
    },
    {
      key: "workflows",
      label: e.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        (ce = R().antdIcons) != null && ce.ApartmentOutlined ? e.createElement(R().antdIcons.ApartmentOutlined, {
          style: { fontSize: 14 }
        }) : null,
        "协作工作流"
      ),
      children: e.createElement(cl)
    }
  ];
  return e.createElement(
    "div",
    { style: { padding: 24 } },
    e.createElement(Ln, {
      title: "专家·协作",
      subtitle: D === "experts" ? `共 ${j.length} 位专家（${Se} 位启用）· ${fe} 个技能 · ${Te} 个 MCP 客户端` : D === "teams" ? "开放式多专家讨论、联合研判与 OMP 动态协作" : "流程化、可观测、可验证的油气与储气库协作流程",
      extra: e.createElement(
        e.Fragment,
        null,
        D === "experts" ? e.createElement(
          c,
          {
            icon: g ? e.createElement(g) : void 0,
            onClick: () => {
              un(), de();
            },
            loading: T
          },
          "刷新"
        ) : null
      )
    }),
    e.createElement(u, {
      items: Ce,
      activeKey: D,
      onChange: (y) => {
        Y(y);
        const V = new URL(window.location.href);
        y === "experts" ? V.searchParams.delete("section") : V.searchParams.set("section", y), window.history.pushState({}, "", `${V.pathname}${V.search}`);
      }
    }),
    // Drawer
    e.createElement($s, {
      onSummon: _e,
      expert: C,
      open: F,
      onClose: () => N(!1),
      onRefresh: () => de()
    }),
    // Template Modal
    e.createElement(zs, {
      open: _,
      onClose: () => L(!1),
      onCreated: () => de()
    }),
    // Config Modal (gear icon)
    e.createElement(Cs, {
      expert: K,
      open: ne,
      onClose: () => re(!1),
      onRefresh: () => de()
    }),
    // Team Launch Modal (for filling placeholders)
    O ? e.createElement(
      p,
      {
        open: !0,
        title: e.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 8 } },
          e.createElement(Tr, {
            members: O.members.map((y) => y.name),
            size: 28
          }),
          e.createElement(
            "span",
            null,
            `发起团队任务 - ${O.name}`
          )
        ),
        onCancel: () => I(null),
        onOk: () => {
          const y = wa(
            O,
            ae
          );
          if (!y) {
            m.error("固定协调者不可用或没有可用的控制器 Agent");
            return;
          }
          const V = q.trim() || O.taskTemplate;
          P(O, y, V);
        },
        confirmLoading: U,
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
        e.createElement(d.TextArea, {
          value: q,
          onChange: (y) => H(y.target.value),
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
          `协调者: ${O.coordinatorName || ((he = O.members[0]) == null ? void 0 : he.name) || "—"} · 成员: ${O.members.map((y) => y.name).join("、")}`
        )
      )
    ) : null
  );
}
function ul({
  agentId: e,
  agentName: t,
  refreshKey: n = 0,
  onNavigate: r
}) {
  const i = R().React, { useState: a, useEffect: o, useCallback: l } = i, {
    Spin: s,
    Empty: d,
    Button: c,
    Row: m,
    Col: u,
    Card: p,
    Tag: b,
    Checkbox: g,
    Modal: E,
    Typography: f,
    Drawer: h,
    Descriptions: v,
    message: w
  } = R().antd, {
    ReloadOutlined: x,
    ThunderboltOutlined: j,
    SettingOutlined: X,
    CheckSquareOutlined: T,
    EyeOutlined: A,
    EyeInvisibleOutlined: F,
    DeleteOutlined: N,
    CloseOutlined: C
  } = R().antdIcons || {}, { Text: k, Paragraph: z } = f, [B, _] = a([]), [L, D] = a(!0), [Y, O] = a(!1), [I, q] = a(null), [H, U] = a(!1), [M, ne] = a(
    /* @__PURE__ */ new Set()
  ), [re, K] = a(!1), [pe, ae] = a(null), [J, de] = a(!1), G = l(async () => {
    if (e) {
      D(!0);
      try {
        const Q = await jn(e);
        _(Q);
      } catch (Q) {
        w.error(Q.message || "加载技能失败"), _([]);
      } finally {
        D(!1);
      }
    }
  }, [e]);
  o(() => {
    G();
  }, [G, n]);
  const P = (Q) => {
    ne((Z) => {
      const ce = new Set(Z);
      return ce.has(Q) ? ce.delete(Q) : ce.add(Q), ce;
    });
  }, le = () => ne(/* @__PURE__ */ new Set()), Ee = () => ne(new Set(B.map((Q) => Q.name))), _e = () => {
    H ? (le(), U(!1)) : U(!0);
  }, ke = async () => {
    const Q = Array.from(M);
    if (Q.length !== 0) {
      K(!0);
      try {
        const { results: Z } = await rs(e, Q), ce = Object.entries(Z).filter(
          ([, y]) => y.success === !1
        ), he = Q.length - ce.length;
        ce.length > 0 ? w.warning(
          `批量启用完成：成功 ${he} 个，失败 ${ce.length} 个`
        ) : w.success(`成功启用 ${Q.length} 个技能`), le(), await G();
      } catch (Z) {
        w.error(Z.message || "批量启用失败");
      } finally {
        K(!1);
      }
    }
  }, Se = async () => {
    const Q = Array.from(M);
    if (Q.length !== 0) {
      K(!0);
      try {
        const { results: Z } = await as(e, Q), ce = Object.entries(Z).filter(
          ([, y]) => y.success === !1
        ), he = Q.length - ce.length;
        ce.length > 0 ? w.warning(
          `批量停用完成：成功 ${he} 个，失败 ${ce.length} 个`
        ) : w.success(`成功停用 ${Q.length} 个技能`), le(), await G();
      } catch (Z) {
        w.error(Z.message || "批量停用失败");
      } finally {
        K(!1);
      }
    }
  }, fe = () => {
    const Q = Array.from(M);
    Q.length !== 0 && E.confirm({
      title: `确认删除 ${Q.length} 个技能？`,
      content: "删除后技能将从当前专家工作区移除，此操作不可撤销。技能池中的原始技能不受影响。",
      okText: "确认删除",
      cancelText: "取消",
      okButtonProps: { danger: !0 },
      onOk: async () => {
        K(!0);
        try {
          const { results: Z } = await is(e, Q), ce = Object.entries(Z).filter(
            ([, y]) => y.success === !1
          ), he = Q.length - ce.length;
          ce.length > 0 ? w.warning(
            `批量删除完成：成功 ${he} 个，失败 ${ce.length} 个`
          ) : w.success(`成功删除 ${Q.length} 个技能`), le(), await G();
        } catch (Z) {
          w.error(Z.message || "批量删除失败");
        } finally {
          K(!1);
        }
      }
    });
  }, Te = async (Q) => {
    de(!0);
    try {
      Q.enabled === !1 ? (await di(e, Q.name), w.success(`已启用技能「${Q.name}」`)) : (await mi(e, Q.name), w.success(`已禁用技能「${Q.name}」`)), await G();
    } catch (Z) {
      w.error(Z.message || "操作失败");
    } finally {
      de(!1);
    }
  }, Ce = (Q) => {
    E.confirm({
      title: `确认删除技能「${Q.name}」？`,
      content: "删除后技能将从当前专家工作区移除，此操作不可撤销。技能池中的原始技能不受影响。",
      okText: "确认删除",
      cancelText: "取消",
      okButtonProps: { danger: !0 },
      onOk: async () => {
        de(!0);
        try {
          await _r(e, Q.name), w.success(`已删除技能「${Q.name}」`), await G();
        } catch (Z) {
          w.error(Z.message || "删除失败");
        } finally {
          de(!1);
        }
      }
    });
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
          marginBottom: 16,
          flexWrap: "wrap",
          gap: 8
        }
      },
      i.createElement(
        k,
        { type: "secondary", style: { fontSize: 13 } },
        H ? `已选择 ${M.size} / ${B.length} 个技能` : `共 ${B.length} 个技能`
      ),
      i.createElement(
        "div",
        { style: { display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" } },
        H ? i.createElement(
          i.Fragment,
          null,
          i.createElement(
            c,
            { size: "small", onClick: Ee },
            "全选"
          ),
          i.createElement(
            c,
            {
              size: "small",
              icon: C ? i.createElement(C) : void 0,
              onClick: le
            },
            "取消选择"
          ),
          i.createElement(
            c,
            {
              size: "small",
              type: "default",
              icon: A ? i.createElement(A) : void 0,
              disabled: M.size === 0 || re,
              loading: re,
              onClick: ke
            },
            "批量启用"
          ),
          i.createElement(
            c,
            {
              size: "small",
              danger: !0,
              icon: F ? i.createElement(F) : void 0,
              disabled: M.size === 0 || re,
              loading: re,
              onClick: Se
            },
            "批量停用"
          ),
          i.createElement(
            c,
            {
              size: "small",
              danger: !0,
              icon: N ? i.createElement(N) : void 0,
              disabled: M.size === 0 || re,
              loading: re,
              onClick: fe
            },
            `删除 (${M.size})`
          ),
          i.createElement(
            c,
            {
              size: "small",
              type: "primary",
              onClick: _e
            },
            "退出批量"
          )
        ) : i.createElement(
          i.Fragment,
          null,
          i.createElement(
            c,
            {
              size: "small",
              icon: T ? i.createElement(T) : void 0,
              onClick: _e,
              disabled: B.length === 0
            },
            "批量管理"
          ),
          i.createElement(
            c,
            {
              icon: x ? i.createElement(x) : void 0,
              onClick: () => {
                un(), G();
              }
            },
            "刷新"
          )
        )
      )
    ),
    L ? i.createElement(
      "div",
      { style: { textAlign: "center", padding: 60 } },
      i.createElement(s, { size: "large" })
    ) : B.length === 0 ? i.createElement(d, {
      description: "当前智能体未加载任何技能"
    }) : i.createElement(
      m,
      { gutter: [12, 12] },
      ...B.map(
        (Q) => i.createElement(
          u,
          { key: Q.name, xs: 24, sm: 12, md: 8, lg: 6 },
          i.createElement(
            p,
            {
              hoverable: !0,
              size: "small",
              style: {
                cursor: H ? "default" : "pointer",
                height: "100%",
                position: "relative",
                borderColor: H && M.has(Q.name) ? "#0072f5" : void 0,
                borderWidth: H && M.has(Q.name) ? 2 : 1
              },
              onClick: () => {
                H ? P(Q.name) : (q(Q), O(!0));
              },
              onMouseEnter: () => {
                H || ae(Q.name);
              },
              onMouseLeave: () => ae(null)
            },
            H ? i.createElement(
              "div",
              {
                style: {
                  position: "absolute",
                  top: 8,
                  right: 8,
                  zIndex: 1
                },
                onClick: (Z) => {
                  Z.stopPropagation(), P(Q.name);
                }
              },
              i.createElement(g, {
                checked: M.has(Q.name)
              })
            ) : null,
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
              Q.emoji ? i.createElement(
                "span",
                { style: { fontSize: 18 } },
                Q.emoji
              ) : i.createElement(
                "span",
                { style: { fontSize: 18 } },
                "⚡"
              ),
              i.createElement(
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
                Q.name
              ),
              Q.enabled === !1 ? i.createElement(
                b,
                { color: "default", style: { fontSize: 10 } },
                "已禁用"
              ) : i.createElement(
                b,
                { color: "green", style: { fontSize: 10 } },
                "已启用"
              )
            ),
            Q.description ? i.createElement(
              z,
              {
                type: "secondary",
                style: { fontSize: 11, margin: 0, lineHeight: 1.4 },
                ellipsis: { rows: 2 }
              },
              Q.description
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
              Q.version_text ? i.createElement(
                b,
                { style: { fontSize: 10 } },
                `v${Q.version_text}`
              ) : null,
              ...(Q.tags || []).slice(0, 3).map(
                (Z, ce) => i.createElement(
                  b,
                  { key: ce, color: "blue", style: { fontSize: 10 } },
                  Z
                )
              )
            ),
            // Hover action footer (not in batch mode)
            !H && pe === Q.name ? i.createElement(
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
                c,
                {
                  size: "small",
                  type: "default",
                  icon: Q.enabled === !1 ? A ? i.createElement(A) : void 0 : F ? i.createElement(F) : void 0,
                  disabled: J,
                  onClick: (Z) => {
                    Z.stopPropagation(), Te(Q);
                  }
                },
                Q.enabled === !1 ? "启用" : "禁用"
              ),
              i.createElement(
                c,
                {
                  size: "small",
                  danger: !0,
                  icon: N ? i.createElement(N) : void 0,
                  disabled: J,
                  onClick: (Z) => {
                    Z.stopPropagation(), Ce(Q);
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
    I ? i.createElement(
      h,
      {
        title: i.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 8 } },
          i.createElement(
            "span",
            { style: { fontSize: 18 } },
            I.emoji || "⚡"
          ),
          i.createElement("span", null, I.name)
        ),
        open: Y,
        onClose: () => O(!1),
        width: 520,
        extra: i.createElement(
          c,
          {
            type: "primary",
            size: "small",
            icon: X ? i.createElement(X) : void 0,
            onClick: () => r("/skills")
          },
          "管理技能"
        )
      },
      i.createElement(
        v,
        { column: 1, bordered: !0, size: "small" },
        i.createElement(
          v.Item,
          { label: "技能名称" },
          I.name
        ),
        i.createElement(
          v.Item,
          { label: "描述" },
          I.description || "-"
        ),
        I.version_text ? i.createElement(
          v.Item,
          { label: "版本" },
          I.version_text
        ) : null,
        i.createElement(
          v.Item,
          { label: "来源" },
          I.source || "-"
        ),
        i.createElement(
          v.Item,
          { label: "状态" },
          I.enabled === !1 ? "已禁用" : "已启用"
        ),
        I.installed_from ? i.createElement(
          v.Item,
          { label: "安装来源" },
          I.installed_from
        ) : null
      ),
      // Tags
      I.tags && I.tags.length > 0 ? i.createElement(
        "div",
        { style: { marginTop: 16 } },
        i.createElement(
          k,
          {
            strong: !0,
            style: { display: "block", marginBottom: 8 }
          },
          "标签"
        ),
        i.createElement(
          "div",
          { style: { display: "flex", flexWrap: "wrap", gap: 4 } },
          ...I.tags.map(
            (Q, Z) => i.createElement(b, { key: Z, color: "blue" }, Q)
          )
        )
      ) : null,
      // Skill content preview
      I.content ? i.createElement(
        "div",
        { style: { marginTop: 16 } },
        i.createElement(
          k,
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
          I.content.slice(0, 2e3) + (I.content.length > 2e3 ? `

... (内容已截断)` : "")
        )
      ) : null
    ) : null
  );
}
function ml({
  poolSkills: e,
  workspaceSkills: t,
  agents: n,
  loading: r,
  onReload: i,
  onSkillInstalled: a,
  agentId: o,
  agentName: l
}) {
  const s = R().React, { useState: d, useMemo: c, useCallback: m, useEffect: u, useRef: p } = s, {
    Spin: b,
    Empty: g,
    Input: E,
    Button: f,
    Row: h,
    Col: v,
    Card: w,
    Tag: x,
    Typography: j,
    Drawer: X,
    Descriptions: T,
    List: A,
    Modal: F,
    message: N
  } = R().antd, {
    ReloadOutlined: C,
    SearchOutlined: k,
    DownloadOutlined: z,
    ThunderboltOutlined: B,
    DeleteOutlined: _,
    PlusOutlined: L
  } = R().antdIcons || {}, { Text: D, Paragraph: Y } = j, [O, I] = d(""), [q, H] = d(!1), [U, M] = d(null), [ne, re] = d([]), [K, pe] = d(!1), [ae, J] = d(24), [de, G] = d(null), [P, le] = d(!1), Ee = p(0), _e = p(null), ke = c(
    () => {
      var $;
      return new Set(
        (($ = t.find((ue) => ue.agent_id === o)) == null ? void 0 : $.skill_names) || []
      );
    },
    [t, o]
  ), Se = c(() => {
    if (!O.trim()) return e;
    const $ = O.toLowerCase();
    return e.filter(
      (ue) => {
        var ye, be;
        return ue.name.toLowerCase().includes($) || ((ye = ue.description) == null ? void 0 : ye.toLowerCase().includes($)) || ((be = ue.tags) == null ? void 0 : be.some((Ae) => Ae.toLowerCase().includes($)));
      }
    );
  }, [e, O]), fe = c(
    () => Se.slice(0, ae),
    [Se, ae]
  );
  u(() => {
    if (fe.length >= Se.length) return;
    const $ = _e.current;
    if (!$) return;
    const ue = () => {
      J(
        (be) => Math.min(be + 24, Se.length)
      );
    };
    if (typeof IntersectionObserver < "u") {
      const be = new IntersectionObserver(
        (Ae) => {
          Ae.some((Be) => Be.isIntersecting) && ue();
        },
        { rootMargin: "240px 0px" }
      );
      return be.observe($), () => be.disconnect();
    }
    const ye = () => {
      $.getBoundingClientRect().top <= window.innerHeight + 240 && ue();
    };
    return window.addEventListener("scroll", ye, { passive: !0 }), ye(), () => window.removeEventListener("scroll", ye);
  }, [Se.length, fe.length]);
  const Te = m(($) => {
    I($), J(24);
  }, []), Ce = m(() => {
    const $ = Ee.current;
    requestAnimationFrame(() => {
      window.scrollTo({ top: $, behavior: "auto" }), document.scrollingElement && (document.scrollingElement.scrollTop = $);
    });
  }, []), Q = m(async () => {
    var $;
    Ee.current = (($ = document.scrollingElement) == null ? void 0 : $.scrollTop) ?? window.scrollY ?? 0;
    try {
      await i();
    } finally {
      Ce();
    }
  }, [i, Ce]), Z = m(
    ($) => {
      const ue = [];
      for (const ye of t)
        if (ye.skill_names.includes($)) {
          const be = n.find((Ae) => Ae.id === ye.agent_id);
          ue.push((be == null ? void 0 : be.name) || ye.agent_name || ye.agent_id);
        }
      return ue;
    },
    [t, n]
  ), ce = m(
    async ($) => {
      if (M($), re(Z($.name)), H(!0), !$.content) {
        pe(!0);
        try {
          const ue = await Xo($.name);
          M({ ...$, content: ue });
        } catch {
        } finally {
          pe(!1);
        }
      }
    },
    [Z]
  );
  u(() => {
    U && re(Z(U.name));
  }, [U, Z, t]);
  const he = async ($) => {
    le(!0);
    try {
      await xr(o, $.name), N.success(
        `已将技能「${$.name}」加载到当前专家「${l}」`
      ), a($);
    } catch (ue) {
      N.error(ue.message || "加载技能失败");
    } finally {
      le(!1);
    }
  }, y = ($) => {
    if ($.protected) {
      N.warning("内置技能不可删除");
      return;
    }
    F.confirm({
      title: `确认从技能池删除「${$.name}」？`,
      content: "删除后所有已安装此技能的专家将不受影响，但技能池中将不再包含此技能。此操作不可撤销。",
      okText: "确认删除",
      cancelText: "取消",
      okButtonProps: { danger: !0 },
      onOk: async () => {
        le(!0);
        try {
          await ss($.name), N.success(`已从技能池删除「${$.name}」`), await Q();
        } catch (ue) {
          N.error(ue.message || "删除失败");
        } finally {
          le(!1);
        }
      }
    });
  }, V = ($) => {
    window.history.pushState({}, "", $), window.dispatchEvent(new PopStateEvent("popstate"));
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
      s.createElement(E, {
        placeholder: "搜索技能名称、描述或标签...",
        prefix: k ? s.createElement(k) : void 0,
        value: O,
        onChange: ($) => Te($.target.value),
        allowClear: !0,
        style: { maxWidth: 400 }
      }),
      s.createElement(
        "div",
        { style: { display: "flex", gap: 8 } },
        s.createElement(
          f,
          {
            icon: C ? s.createElement(C) : void 0,
            onClick: Q,
            loading: r,
            size: "small"
          },
          "刷新"
        ),
        s.createElement(
          f,
          {
            type: "primary",
            icon: z ? s.createElement(z) : void 0,
            onClick: () => V("/skill-pool"),
            size: "small",
            style: Ke
          },
          "管理技能池"
        )
      )
    ),
    r ? s.createElement(
      "div",
      { style: { textAlign: "center", padding: 60 } },
      s.createElement(b, { size: "large" })
    ) : Se.length === 0 ? s.createElement(g, {
      description: O ? "未找到匹配的技能" : "技能池为空"
    }) : s.createElement(
      s.Fragment,
      null,
      s.createElement(
        h,
        { gutter: [12, 12] },
        ...fe.map(
          ($) => s.createElement(
            v,
            { key: $.name, xs: 24, sm: 12, md: 8, lg: 6 },
            s.createElement(
              w,
              {
                hoverable: !0,
                size: "small",
                style: { cursor: "pointer", height: "100%" },
                onClick: () => ce($),
                onMouseEnter: () => G($.name),
                onMouseLeave: () => G(null)
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
                $.emoji ? s.createElement(
                  "span",
                  { style: { fontSize: 18 } },
                  $.emoji
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
                  $.name
                ),
                $.protected ? s.createElement(
                  x,
                  { color: "gold", style: { fontSize: 10 } },
                  "内置"
                ) : null
              ),
              $.description ? s.createElement(
                Y,
                {
                  type: "secondary",
                  style: { fontSize: 11, margin: 0, lineHeight: 1.4 },
                  ellipsis: { rows: 2 }
                },
                $.description
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
                $.version_text ? s.createElement(
                  x,
                  { style: { fontSize: 10 } },
                  `v${$.version_text}`
                ) : null,
                ...($.tags || []).slice(0, 3).map(
                  (ue, ye) => s.createElement(
                    x,
                    { key: ye, color: "cyan", style: { fontSize: 10 } },
                    ue
                  )
                )
              ),
              // Hover action footer
              de === $.name ? s.createElement(
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
                  f,
                  {
                    size: "small",
                    type: "primary",
                    icon: L ? s.createElement(L) : void 0,
                    disabled: P || ke.has($.name),
                    onClick: (ue) => {
                      ue.stopPropagation(), he($);
                    }
                  },
                  ke.has($.name) ? "已加载" : "加载到当前Agent"
                ),
                s.createElement(
                  f,
                  {
                    size: "small",
                    danger: !0,
                    icon: _ ? s.createElement(_) : void 0,
                    disabled: P || $.protected,
                    onClick: (ue) => {
                      ue.stopPropagation(), y($);
                    }
                  },
                  "删除"
                )
              ) : null
            )
          )
        ),
        // Infinite-scroll sentinel
        fe.length < Se.length ? s.createElement(
          "div",
          {
            ref: _e,
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
            `继续下滑自动加载 · 还剩 ${Se.length - fe.length} 个`
          )
        ) : null
      )
    ),
    // Skill detail drawer
    U ? s.createElement(
      X,
      {
        title: s.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 8 } },
          s.createElement(
            "span",
            { style: { fontSize: 18 } },
            U.emoji || "⚡"
          ),
          s.createElement("span", null, U.name)
        ),
        open: q,
        onClose: () => H(!1),
        width: 520,
        extra: s.createElement(
          f,
          {
            type: "primary",
            size: "small",
            icon: B ? s.createElement(B) : void 0,
            onClick: () => V("/skills")
          },
          "管理技能"
        )
      },
      s.createElement(
        T,
        { column: 1, bordered: !0, size: "small" },
        s.createElement(
          T.Item,
          { label: "技能名称" },
          U.name
        ),
        s.createElement(
          T.Item,
          { label: "描述" },
          U.description || "-"
        ),
        U.version_text ? s.createElement(
          T.Item,
          { label: "版本" },
          U.version_text
        ) : null,
        s.createElement(
          T.Item,
          { label: "来源" },
          U.source || "-"
        ),
        s.createElement(
          T.Item,
          { label: "受保护" },
          U.protected ? "是（内置）" : "否"
        ),
        U.sync_status ? s.createElement(
          T.Item,
          { label: "同步状态" },
          U.sync_status
        ) : null,
        U.installed_from ? s.createElement(
          T.Item,
          { label: "安装来源" },
          U.installed_from
        ) : null
      ),
      // Tags
      U.tags && U.tags.length > 0 ? s.createElement(
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
          ...U.tags.map(
            ($, ue) => s.createElement(x, { key: ue, color: "cyan" }, $)
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
          `已安装此技能的专家 (${ne.length})`
        ),
        ne.length > 0 ? s.createElement(A, {
          size: "small",
          dataSource: ne,
          renderItem: ($) => s.createElement(
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
              s.createElement(dt, { name: $, size: 20 }),
              s.createElement(
                D,
                { style: { fontSize: 13 } },
                $
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
      K ? s.createElement(
        "div",
        { style: { marginTop: 16, textAlign: "center" } },
        s.createElement(b, { size: "small" })
      ) : U.content ? s.createElement(
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
          U.content.slice(0, 2e3) + (U.content.length > 2e3 ? `

... (内容已截断)` : "")
        )
      ) : null
    ) : null
  );
}
function pl({
  embedded: e = !1
} = {}) {
  const t = R().React, { useState: n, useEffect: r, useCallback: i, useMemo: a } = t, { Tabs: o, message: l } = R().antd, { ThunderboltOutlined: s, AppstoreOutlined: d } = R().antdIcons || {}, m = R().useSelectedAgent, u = m ? m() : null, p = (u == null ? void 0 : u.id) || "default";
  r(() => {
    wr();
  }, [p]);
  const [b, g] = n([]), [E, f] = n([]), [h, v] = n([]), [w, x] = n(!0), [j, X] = n("agent-skills"), [T, A] = n(0), F = i(async () => {
    x(!0);
    try {
      const [_, L, D] = await Promise.all([
        Un(!0),
        Bn(),
        Yo()
      ]);
      f(_), g(L), v(D);
    } catch (_) {
      l.error(_.message || "加载技能列表失败"), f([]);
    } finally {
      x(!1);
    }
  }, []);
  r(() => {
    F();
  }, [F]);
  const N = a(() => {
    const _ = b.find((L) => L.id === p);
    return (_ == null ? void 0 : _.name) || p;
  }, [b, p]), C = i(
    (_) => {
      v(
        (L) => L.some((D) => D.agent_id === p) ? L.map((D) => D.agent_id !== p || D.skill_names.includes(_.name) ? D : {
          ...D,
          skill_names: [...D.skill_names, _.name]
        }) : [
          ...L,
          {
            agent_id: p,
            agent_name: N,
            skill_names: [_.name]
          }
        ]
      ), A((L) => L + 1);
    },
    [p, N]
  ), k = (_) => {
    window.history.pushState({}, "", _), window.dispatchEvent(new PopStateEvent("popstate"));
  }, z = [
    {
      key: "agent-skills",
      label: t.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        s ? t.createElement(s, { style: { fontSize: 14 } }) : null,
        "当前专家"
      ),
      children: t.createElement(ul, {
        agentId: p,
        agentName: N,
        refreshKey: T,
        onNavigate: k
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
      children: t.createElement(ml, {
        poolSkills: E,
        workspaceSkills: h,
        agents: b,
        loading: w,
        onReload: F,
        onSkillInstalled: C,
        agentId: p,
        agentName: N
      })
    }
  ], B = t.createElement(o, {
    items: z,
    activeKey: j,
    onChange: (_) => X(_)
  });
  return e ? B : t.createElement(
    "div",
    { style: { padding: 24 } },
    t.createElement(Ln, {
      title: "技能",
      subtitle: `技能池共 ${E.length} 个技能 · 当前智能体：${N}`
    }),
    B
  );
}
const or = {
  reservoir_simulation: "油藏数值模拟",
  geological_modeling: "地质建模",
  well_log_analysis: "测井分析",
  production_engineering: "采油工程",
  post_processing: "后处理与可视化",
  multiphysics: "多物理场仿真"
}, ki = {
  reservoir_simulation: "🛢️",
  geological_modeling: "🏔️",
  well_log_analysis: "📡",
  production_engineering: "⚙️",
  post_processing: "📊",
  multiphysics: "🔬"
}, Ci = /* @__PURE__ */ new Set(["cmg", "comsol", "tnavigator", "eclipse", "intersect", "visage"]);
function Ti(e) {
  return On(`/ugsci/engines/icon/${encodeURIComponent(e)}`);
}
async function fl() {
  return me("/ugsci/engines/list");
}
async function gl(e) {
  return me("/ugsci/engines/", {
    method: "POST",
    body: JSON.stringify(e)
  });
}
async function yl(e, t) {
  return me(`/ugsci/engines/${encodeURIComponent(e)}`, {
    method: "PUT",
    body: JSON.stringify(t)
  });
}
async function hl(e) {
  return me(
    `/ugsci/engines/${encodeURIComponent(e)}`,
    { method: "DELETE" }
  );
}
async function El() {
  return me("/ugsci/engines/detect/refresh", {
    method: "POST"
  });
}
function bl({
  engine: e,
  onClick: t
}) {
  const n = R().React, { Card: r, Tag: i, Typography: a } = R().antd, { Text: o } = a, l = e.status === "detected", s = ki[e.category] || "📦", c = Ci.has(e.id) ? n.createElement("img", {
    src: Ti(e.id),
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
        borderColor: l ? void 0 : "var(--ant-color-border, #d9d9d9)",
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
        c,
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
        l ? n.createElement(
          i,
          { color: "success", style: { fontSize: 11 } },
          "✅ 已检测"
        ) : e.executable_path ? n.createElement(
          i,
          { color: "warning", style: { fontSize: 11 } },
          "⚠ 路径无效"
        ) : n.createElement(
          i,
          { style: { fontSize: 11 } },
          "🔧 待配置"
        ),
        e.is_default ? n.createElement(
          i,
          { color: "blue", style: { fontSize: 10 } },
          "默认"
        ) : e.is_custom ? n.createElement(
          i,
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
        i,
        { style: { fontSize: 11 } },
        or[e.category] || e.category
      ) : null,
      e.version ? n.createElement(
        i,
        { color: "blue", style: { fontSize: 11 } },
        `v${e.version}`
      ) : null,
      ...(e.modules || []).map(
        (m) => n.createElement(
          i,
          { key: m, color: "cyan", style: { fontSize: 10 } },
          m
        )
      )
    )
  );
}
function vl() {
  const e = R().React, { useState: t, useEffect: n, useCallback: r, useMemo: i } = e, {
    Spin: a,
    Empty: o,
    Button: l,
    message: s,
    Row: d,
    Col: c,
    Drawer: m,
    Descriptions: u,
    Tag: p,
    Typography: b,
    Modal: g,
    Input: E,
    Select: f,
    Popconfirm: h,
    Space: v
  } = R().antd, {
    ReloadOutlined: w,
    SearchOutlined: x,
    PlusOutlined: j,
    EditOutlined: X,
    DeleteOutlined: T,
    CopyOutlined: A,
    ExperimentOutlined: F
  } = R().antdIcons || {}, { Text: N, Paragraph: C } = b, [k, z] = t([]), [B, _] = t(!0), [L, D] = t(""), [Y, O] = t(!1), [I, q] = t(null), [H, U] = t(!1), [M, ne] = t(null), [re, K] = t({}), [pe, ae] = t(!1), J = r(async () => {
    _(!0);
    try {
      const fe = await fl();
      z(fe.engines || []);
    } catch (fe) {
      s.error(fe.message || "加载引擎列表失败"), z([]);
    } finally {
      _(!1);
    }
  }, []);
  n(() => {
    J();
  }, [J]);
  const de = i(() => {
    if (!L.trim()) return k;
    const fe = L.toLowerCase();
    return k.filter(
      (Te) => {
        var Ce;
        return Te.name.toLowerCase().includes(fe) || Te.vendor.toLowerCase().includes(fe) || Te.category.toLowerCase().includes(fe) || ((Ce = Te.description) == null ? void 0 : Ce.toLowerCase().includes(fe));
      }
    );
  }, [k, L]);
  k.filter((fe) => fe.status === "detected").length;
  const G = r((fe) => {
    navigator.clipboard.writeText(fe).then(() => s.success("路径已复制")).catch(() => s.error("复制失败"));
  }, []), P = r(() => {
    ne(null), K({
      name: "",
      vendor: "",
      version: "",
      executable_path: "",
      category: "",
      description: "",
      invocation_hint: ""
    }), U(!0);
  }, []), le = r((fe) => {
    ne(fe), K({ ...fe }), U(!0), O(!1);
  }, []), Ee = r(async () => {
    var fe;
    if (!((fe = re.name) != null && fe.trim())) {
      s.warning("请输入引擎名称");
      return;
    }
    ae(!0);
    try {
      M ? (await yl(M.id, re), s.success("引擎已更新")) : (await gl(re), s.success("引擎已添加")), U(!1), J();
    } catch (Te) {
      s.error(Te.message || "保存失败");
    } finally {
      ae(!1);
    }
  }, [re, M, J]), _e = r(
    async (fe) => {
      try {
        await hl(fe), s.success("引擎已删除"), O(!1), J();
      } catch (Te) {
        s.error(Te.message || "删除失败");
      }
    },
    [J]
  ), ke = r(async () => {
    _(!0);
    try {
      const fe = await El();
      z(fe.engines || []), s.success("自动检测完成");
    } catch (fe) {
      s.error(fe.message || "检测失败");
    } finally {
      _(!1);
    }
  }, []), Se = r(
    (fe, Te, Ce) => {
      const Q = re[Te] || "";
      return e.createElement(
        "div",
        { style: { marginBottom: 12 } },
        e.createElement(
          N,
          { style: { fontSize: 13, display: "block", marginBottom: 4 } },
          fe
        ),
        Ce != null && Ce.select ? e.createElement(f, {
          value: Q || void 0,
          onChange: (Z) => K((ce) => ({ ...ce, [Te]: Z })),
          style: { width: "100%" },
          options: Ce.select.options,
          allowClear: !0,
          placeholder: `选择${fe}`
        }) : Ce != null && Ce.textarea ? e.createElement(E.TextArea, {
          value: Q,
          onChange: (Z) => K((ce) => ({ ...ce, [Te]: Z.target.value })),
          rows: 3,
          placeholder: `输入${fe}`
        }) : e.createElement(E, {
          value: Q,
          onChange: (Z) => K((ce) => ({ ...ce, [Te]: Z.target.value })),
          placeholder: `输入${fe}`
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
      e.createElement(E, {
        placeholder: "搜索引擎名称、厂商...",
        prefix: x ? e.createElement(x) : void 0,
        value: L,
        onChange: (fe) => D(fe.target.value),
        allowClear: !0,
        style: { maxWidth: 280 }
      }),
      e.createElement(
        l,
        {
          icon: w ? e.createElement(w) : void 0,
          onClick: ke,
          loading: B
        },
        "自动检测"
      ),
      e.createElement(
        l,
        {
          type: "primary",
          icon: j ? e.createElement(j) : void 0,
          onClick: P,
          style: Ke
        },
        "添加引擎"
      )
    ),
    // Content
    B ? e.createElement(
      "div",
      { style: { textAlign: "center", padding: 60 } },
      e.createElement(a, {
        size: "large",
        tip: "正在加载引擎..."
      })
    ) : de.length === 0 ? e.createElement(o, {
      description: L ? "无匹配引擎" : "暂无引擎，点击「添加引擎」开始"
    }) : e.createElement(
      d,
      { gutter: [12, 12], align: "stretch" },
      ...de.map(
        (fe) => e.createElement(
          c,
          {
            key: fe.id,
            xs: 24,
            sm: 12,
            md: 8,
            lg: 6,
            style: { display: "flex" }
          },
          e.createElement(bl, {
            engine: fe,
            onClick: () => {
              q(fe), O(!0);
            }
          })
        )
      )
    ),
    // Detail drawer
    I ? e.createElement(
      m,
      {
        title: e.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 8 } },
          e.createElement(
            "span",
            { style: { display: "flex", alignItems: "center" } },
            Ci.has(I.id) ? e.createElement("img", {
              src: Ti(I.id),
              alt: I.name,
              style: { width: 20, height: 20, objectFit: "contain" }
            }) : e.createElement(
              "span",
              { style: { fontSize: 18 } },
              ki[I.category] || "📦"
            )
          ),
          e.createElement("span", null, I.name)
        ),
        open: Y,
        onClose: () => O(!1),
        width: 520,
        extra: e.createElement(
          v,
          null,
          e.createElement(
            l,
            {
              size: "small",
              icon: X ? e.createElement(X) : void 0,
              onClick: () => le(I)
            },
            "编辑"
          ),
          I.is_default ? null : e.createElement(
            h,
            {
              title: "确认删除此引擎？",
              description: I.name,
              onConfirm: () => _e(I.id),
              okText: "删除",
              cancelText: "取消",
              okButtonProps: { danger: !0 }
            },
            e.createElement(
              l,
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
        u,
        { column: 1, bordered: !0, size: "small" },
        e.createElement(
          u.Item,
          { label: "引擎名称" },
          I.name
        ),
        e.createElement(
          u.Item,
          { label: "厂商" },
          I.vendor || "—"
        ),
        e.createElement(
          u.Item,
          { label: "分类" },
          I.category ? or[I.category] || I.category : "—"
        ),
        e.createElement(
          u.Item,
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
          u.Item,
          { label: "版本" },
          I.version || "—"
        ),
        I.executable_path ? e.createElement(
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
              I.executable_path
            ),
            e.createElement(
              l,
              {
                size: "small",
                type: "text",
                icon: A ? e.createElement(A) : void 0,
                onClick: () => G(I.executable_path)
              }
            )
          )
        ) : null,
        I.install_dir ? e.createElement(
          u.Item,
          { label: "安装目录" },
          e.createElement(
            "code",
            { style: { fontSize: 12, wordBreak: "break-all" } },
            I.install_dir
          )
        ) : null,
        // Display detected modules with paths
        I.modules && I.modules.length > 0 ? e.createElement(
          u.Item,
          { label: "已检测模块" },
          e.createElement(
            "div",
            { style: { display: "flex", flexDirection: "column", gap: 4 } },
            ...I.modules.map(
              (fe) => e.createElement(
                "div",
                {
                  key: fe,
                  style: { display: "flex", alignItems: "center", gap: 8 }
                },
                e.createElement(
                  p,
                  { color: "cyan", style: { fontSize: 11 } },
                  fe
                ),
                I.module_paths && I.module_paths[fe] ? e.createElement(
                  "code",
                  { style: { fontSize: 11, wordBreak: "break-all" } },
                  I.module_paths[fe]
                ) : null
              )
            )
          )
        ) : null,
        I.license_server ? e.createElement(
          u.Item,
          { label: "许可证服务器" },
          I.license_server
        ) : null,
        e.createElement(
          u.Item,
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
          N,
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
      g,
      {
        title: M ? "编辑引擎" : "添加引擎",
        open: H,
        onOk: Ee,
        onCancel: () => U(!1),
        okText: M ? "保存" : "添加",
        cancelText: "取消",
        confirmLoading: pe,
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
            options: Object.entries(or).map(([fe, Te]) => ({
              label: Te,
              value: fe
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
async function wl(e = !1) {
  const t = await me(
    "/ugsci/domain-engines/list",
    e ? { bypassCache: !0 } : void 0
  );
  return (t == null ? void 0 : t.engines) || [];
}
function Sl(e = !1) {
  return me(
    "/ugsci/domain-engines/neqsim/runtime",
    e ? { bypassCache: !0 } : void 0
  );
}
function xl() {
  return me("/ugsci/domain-engines/neqsim/install", {
    method: "POST"
  });
}
function _l(e) {
  return me(
    `/ugsci/domain-engines/neqsim/install/${encodeURIComponent(e)}`,
    { bypassCache: !0 }
  );
}
function sr(e) {
  return me(
    `/ugsci/domain-engines/${encodeURIComponent(e)}/runtime`,
    { bypassCache: !0 }
  );
}
function kl(e) {
  return me(
    `/ugsci/domain-engines/${encodeURIComponent(e)}/install`,
    { method: "POST" }
  );
}
function Cl(e) {
  return me(
    `/ugsci/domain-engines/install-tasks/${encodeURIComponent(e)}`,
    { bypassCache: !0 }
  );
}
async function Tl(e, t = !1) {
  const n = await me("/tools", {
    headers: { "X-Agent-Id": e },
    ...t ? { bypassCache: !0 } : {}
  }) || [];
  return new Map(n.map((r) => [r.name, r]));
}
async function Il(e, t = !1) {
  const n = /* @__PURE__ */ new Map(), r = {
    headers: { "X-Agent-Id": e },
    ...t ? { bypassCache: !0 } : {}
  };
  let i;
  try {
    i = await me("/mcp", r) || [];
  } catch {
    return n;
  }
  for (const a of i) {
    const o = a.key;
    if (!a.enabled) {
      n.set(o, { key: o, enabled: !1, toolCount: 0, error: null });
      continue;
    }
    try {
      const l = await me(
        `/mcp/tools/${encodeURIComponent(o)}`,
        r
      ) || [];
      n.set(o, {
        key: o,
        enabled: !0,
        toolCount: l.filter((s) => s.enabled).length,
        error: null
      });
    } catch (l) {
      n.set(o, {
        key: o,
        enabled: !0,
        toolCount: 0,
        error: l instanceof Error ? l.message : "Tool query failed"
      });
    }
  }
  return n;
}
function xa(e) {
  return e ? e.overall === "available" ? "available" : e.overall === "unavailable" ? "unavailable" : "unknown" : "unknown";
}
function _a(e) {
  return e ? e.enabled ? e.error ? "error" : e.toolCount > 0 ? "available" : "error" : "unconfigured" : "unavailable";
}
function Al(e, t = null, n = /* @__PURE__ */ new Map()) {
  const r = e.engine, i = e.dependency_status;
  let a, o = "", l, s;
  if (r.provider.kind === "driver")
    i.overall === "unavailable" ? a = "needs_install" : i.overall !== "available" ? a = "unknown" : a = _a(t), l = (t == null ? void 0 : t.toolCount) ?? 0, s = (t == null ? void 0 : t.key) ?? r.provider.id;
  else if (r.source === "builtin") {
    const d = xa(i), c = [
      ...new Set(r.operations.flatMap((g) => g.tool_names))
    ], m = c.filter(
      (g) => n.has(g)
    ), u = m.filter(
      (g) => {
        var E;
        return (E = n.get(g)) == null ? void 0 : E.enabled;
      }
    );
    d !== "available" ? a = d : m.length !== c.length ? a = "error" : u.length === 0 ? a = "unconfigured" : u.length < c.length ? a = "partial" : a = "available", l = u.length, s = null;
    const p = c.filter((g) => !n.has(g)), b = m.filter(
      (g) => {
        var E;
        return !((E = n.get(g)) != null && E.enabled);
      }
    );
    d === "available" && (o = p.length ? `工具未完整注册：${p.join("、")}` : b.length ? `当前专家已启用 ${u.length}/${c.length} 个工具；未启用：${b.join("、")}` : c.length ? `依赖检测通过，当前专家已启用全部 ${c.length} 个工具。` : "该能力未声明可调用工具。");
  } else r.source === "mcp" ? (a = _a(t), l = (t == null ? void 0 : t.toolCount) ?? 0, s = (t == null ? void 0 : t.key) ?? r.provider.id) : (a = xa(i), l = 0, s = null, o = "依据运行依赖检测结果判断，尚未校验当前专家的调用工具。");
  if (i.overall !== "available") {
    const d = i.dependencies.filter(
      (c) => c.status !== "available"
    );
    o = d.length ? d.map(
      (c) => `${c.name}：${c.status === "unavailable" ? "未检测到可用依赖" : "尚未确认"}${c.reason ? `（${c.reason}）` : ""}`
    ).join("；") : "尚未确认运行依赖状态，请刷新检测。";
  } else o || (o = t ? t.enabled ? t.error ? `MCP 工具查询失败：${t.error}` : t.toolCount > 0 ? `依赖检测通过，MCP 服务已启用并发现 ${t.toolCount} 个已启用工具；具体函数以服务实际提供为准。` : "MCP 服务已启用，但未发现已启用的工具。" : "当前专家尚未启用该 MCP 服务。" : "未发现当前专家的 MCP 服务配置，或服务状态查询未成功。");
  return {
    definition: r,
    dependencyStatus: i,
    checkedAt: e.checked_at,
    effectiveStatus: a,
    statusDescription: o,
    discoveredToolCount: l,
    mcpProviderKey: s
  };
}
const lr = {
  available: "可用",
  unavailable: "不可用",
  unknown: "未知",
  needs_install: "待安装",
  unconfigured: "未配置",
  partial: "部分可用",
  error: "错误"
}, cr = {
  available: "success",
  unavailable: "error",
  unknown: "default",
  needs_install: "warning",
  unconfigured: "warning",
  partial: "warning",
  error: "error"
}, xe = (e, t, n, r) => ({ inputs: e, outputs: t, description: n, limitations: r }), Ii = {
  "welllog.las.read": xe(
    "path：LAS 文件路径；encoding：文件编码（默认自动）；sample_rows：首尾采样行数（默认 20，最大 200）。",
    "包含井/曲线元数据、曲线摘要、采样数据和 QC 警告的 JSON。",
    "读取 LAS 文件并返回元数据和采样行。"
  ),
  "welllog.quality.validate": xe(
    "path：LAS 文件路径；encoding：文件编码（默认自动）。",
    "包含通过/失败状态、错误、警告和逐项检查结果的 QC 报告 JSON。",
    "校验 LAS 文件质量。"
  ),
  "welllog.las.export": xe(
    "input_path：源 LAS 路径；output_path：目标 LAS 路径（须与源路径不同）；encoding：读写编码（默认 utf-8）。",
    "包含输出路径和工件引用的 JSON。",
    "规范化导出 .las 文件。",
    "仅支持 .las，输入和输出路径必须不同。"
  ),
  "production.decline.fit": xe(
    "time：相对时间数值数组；rate：对应产量数组；time_unit：时间单位（如 month/day/year）；rate_unit：产量单位（如 bbl/d、m3/d）；model：auto/exponential/harmonic/hyperbolic（默认 auto）。",
    "fits（各模型的 model/qi/di/b、RMSE、MAE、R²、AIC、fit_start、fit_end）、recommended、is_auto、warnings。",
    "对给定时间和产量数组拟合 Arps 递减曲线。",
    "time 与 rate 数组须一一对应。"
  ),
  "production.decline.forecast": xe(
    "model：exponential/harmonic/hyperbolic；qi：初始产量；di：初始递减率；b：双曲指数（双曲模型必需，其余忽略）；forecast_time：预测时间数组；time_unit、rate_unit：单位。",
    "result：model、qi、di、b、forecast（每项含 time、rate）；领域结果外层还含 units、metrics、assumptions、warnings、tolerances、applicability、provenance、artifacts。",
    "按递减模型参数预测指定时点产量。"
  ),
  "production.decline.eur": xe(
    "model、qi、di、b、time_unit、rate_unit；forecast_end：预测截止时间（可选）；economic_limit：经济极限产量（可选，二者按工具约束使用）。",
    "result：model、qi、di、b、effective_end、final_rate、cumulative_production、economic_limit_used、forecast_end_used；外层含 units、metrics、assumptions、warnings 等领域结果字段。",
    "按时间边界或经济极限估算最终采收量。"
  ),
  "fluid.flash": xe(
    "components：组分名到摩尔分数的映射；temperature：温度（默认单位 C）；pressure：压力（默认 bara）；temperature_unit（默认 C）、pressure_unit（默认 bara）、eos（默认 SRK）、flash_type（默认 TP）。",
    "NeqSim runFlash 返回值；集成不可用时返回 ok=false、error_type、message 等错误字段。",
    "调用已发现的 NeqSim runFlash 工具。",
    "需要工作区 NeqSim Driver 和服务端 runFlash 能力。"
  ),
  "fluid.pvt": xe(
    "specification：PVT 实验规格对象或 JSON 字符串，原样序列化为 pvtJson。",
    "NeqSim runPVT 返回值；失败时返回 ok=false、error_type、message 和可选 metadata。",
    "调用 NeqSim runPVT 实验。",
    "需工作区 NeqSim Driver 提供 runPVT。"
  ),
  "fluid.phase_envelope": xe(
    "components：组分名到摩尔分数的映射；eos：状态方程名称（默认 SRK）。",
    "NeqSim getPhaseEnvelope 返回值；失败时包含 ok=false、error_type、message。",
    "调用 NeqSim getPhaseEnvelope。",
    "需工作区 NeqSim Driver 提供 getPhaseEnvelope。"
  ),
  "process.simulation": xe(
    "process：流程规格对象或 JSON 字符串，序列化后传给 processJson。",
    "NeqSim runProcess 返回值；失败时包含 ok=false、error_type、message。",
    "调用 NeqSim runProcess 流程模拟。",
    "需工作区 NeqSim Driver 提供 runProcess。"
  ),
  "pipeline.flow": xe(
    "specification：管道规格对象或 JSON 字符串，序列化后传给 pipelineJson。",
    "NeqSim runPipeline 返回值；失败时包含 ok=false、error_type、message。",
    "调用 NeqSim runPipeline 多相流计算。",
    "需工作区 NeqSim Driver 提供 runPipeline。"
  ),
  "math.symbolic": xe(
    "coefficients：按最高次项到常数项排列的系数数组；首项不得为 0，至少 2 项。",
    "所有实根和复根及计算状态/诊断。",
    "求解多项式的数值根。",
    "最高次数不超过 20。"
  ),
  "statistics.bayesian": xe(
    "observations：观测数值数组；prior_mean、prior_std：正态先验均值/标准差；observation_std：观测标准差；draws、tune：抽样数和调优步数；seed：随机种子。",
    "posterior_mean、posterior_std、credible_interval_95、sample_count。",
    "对正态均值模型执行贝叶斯估计。",
    "当前工具限定为正态均值估计模型。"
  ),
  "optimization.multi_objective": xe(
    "centers：二次目标中心点数组；bounds：各变量上下界；population_size、generations：种群规模和迭代代数；seed：随机种子。",
    "result：solutions（每项含 variables、objectives）及 solution_count。",
    "优化工具定义的多目标二次问题。",
    "目标函数形式固定为工具实现的二次模型。"
  ),
  "simulation.discrete_event": xe(
    "arrival_interval：到达间隔；service_time：服务时间；servers：服务台数量（默认 1，范围 1–100）；duration：仿真时长（默认 100，须为正；时间单位一致）。",
    "arrivals、completed、average_wait、maximum_wait、servers。",
    "模拟固定间隔到达、固定服务时长的 FIFO 队列。",
    "不计算利用率；到达间隔、服务时间和仿真时长须为正。"
  ),
  "graph.analysis": xe(
    "nodes：节点名称数组；edges：由起点、终点组成的边数组；directed：是否有向；source、target：路径查询端点（可为空）。",
    "节点/边统计、连通性及可用的路径分析结果。",
    "分析给定图结构。",
    "仅分析传入的图，不自动读取外部网络数据。"
  ),
  "geospatial.analysis": xe(
    "points：坐标数组，每项为 [x,y]；crs：输入坐标参考系（默认 EPSG:4326）。",
    "point_count、crs、bounds、centroid。",
    "对输入点集执行工具实现的空间分析。",
    "当前工具只接收点集，不能据此推断支持任意矢量处理。"
  ),
  "machine_learning.modeling": xe(
    "features：训练特征二维数组；targets：目标值数组；predict_features：待预测特征二维数组。",
    "coefficients、intercept、training_r_squared、training_rmse、predictions。",
    "执行工具实现的回归建模与预测。",
    "当前接口是回归任务，不代表 scikit-learn 的分类、聚类等全部能力。"
  ),
  "statistics.modeling": xe(
    "features：特征二维数组；targets：目标值数组；feature_names：特征名称数组。",
    "coefficients、standard_errors、p_values、r_squared、adjusted_r_squared、observation_count。",
    "执行工具实现的统计回归。",
    "当前接口限定于已实现的回归分析。"
  ),
  "units.convert": xe(
    "value：标量数值；from_unit、to_unit：源单位和目标单位字符串。",
    "标准领域计算结果，result 中包含 value、from_unit、to_unit；外层含 units 和 applicability。",
    "在 UGSci 显式单位表内换算标量。",
    "源单位和目标单位必须属于同一受支持物理量纲。"
  ),
  "reservoir.volumetrics.oil_in_place": xe(
    "area：面积；net_pay：净厚度；porosity、water_saturation：孔隙度/含水饱和度（比例）；oil_fvf：原油体积系数；area_unit（默认 acre）、length_unit（默认 ft）、output_unit（默认 stb）。",
    "OOIP 数值、输出单位及计算依据/输入摘要。",
    "容积法计算原始地质储量。"
  ),
  "reservoir.material_balance.oil": xe(
    "必填 produced_oil、initial_oil_fvf、current_oil_fvf、initial_pressure、current_pressure；可选 produced_gor、initial_solution_gor、current_solution_gor、gas_fvf、produced_water、water_fvf、water_influx、initial_water_saturation、water_compressibility、rock_compressibility；volume_unit（默认 stb）、pressure_unit（psi）、compressibility_unit（1/psi）。",
    "估算 OOIP、物质平衡各项及计算状态。",
    "按输入 PVT 和水侵/压缩项执行油藏物质平衡。",
    "未提供的可选项使用模型默认值；结果取决于输入 PVT 与单位的一致性。"
  ),
  "reservoir.material_balance.gas_pz": xe(
    "produced_gas、initial_pressure、initial_z_factor、current_pressure、current_z_factor；gas_volume_unit（默认 scf）、pressure_unit（默认 psi）。",
    "OGIP 估算及 p/z 计算量/状态。",
    "按 p/z 衰竭关系估算气藏原始地质储量。"
  ),
  "fluid.pvt.standing_black_oil": xe(
    "pressure、temperature、oil_api、gas_specific_gravity、solution_gor_at_bubble_point；pressure_unit（默认 psi）、temperature_unit（默认 F）、gor_unit（默认 scf/stb）。",
    "Standing 关联式计算的泡点压力、溶解气油比和油体积系数。",
    "计算本地黑油 PVT 近似性质。",
    "采用 Standing 关联式，不是通用状态方程或组分模拟。"
  ),
  "production.ipr.vogel": xe(
    "reservoir_pressure、test_flowing_pressure、test_rate；target_flowing_pressures：目标流压数组；pressure_unit（默认 psi）、rate_unit（默认 stb/d）。",
    "Vogel IPR 参数及各目标流压对应产能。",
    "基于测试点构建 Vogel 油井 IPR。"
  ),
  "production.nodal_analysis": xe(
    "reservoir_pressure、test_flowing_pressure、test_rate、wellhead_pressure、hydrostatic_pressure、friction_pressure_at_test_rate；pressure_unit（psi）、rate_unit（stb/d）；tolerance（默认 1e-6）、max_iterations（默认 100）。",
    "求得的工作点产量/压力、迭代状态及节点计算摘要。",
    "求解当前简化 IPR/VLP 交点。",
    "VLP 由提供的压力项和工具模型表示，不替代完整多相管流模拟。"
  ),
  "validation.conservation_check": xe(
    "initial_inventory、final_inventory：期初/期末库存；inflows、outflows：流入/流出数值数组；tolerance（默认 1e-6）；unit（默认 rb）。",
    "闭合误差、相对误差、是否在容差内及各项汇总。",
    "检查给定边界的质量/体积守恒。"
  ),
  "storage.inventory.accounting": xe(
    "initial_inventory、cumulative_injected、cumulative_produced：库存及累计注采量；gas_volume_unit（默认 1e8_sm3）。",
    "期末账面库存、注采平衡量及校核信息。",
    "按统一体积单位执行库存计量平衡。"
  ),
  "storage.inventory.effective_controlled": xe(
    "layers：分层数组，每层含 name、produced_gas、injection_end_pressure、injection_end_z、evaluation_pressure、evaluation_z；cycle_id、injection_end_state_id、evaluation_state_id；gas_volume_unit（1e8_sm3）、pressure_unit（MPa）、pressure_basis（absolute/apparent_formation/report_defined）；可选 denominator_relative_tolerance、maximum_inverse_withdrawal_fraction。",
    "result：effective_inventory、layers（逐层 name、produced_gas、injection_end_p_over_z、evaluation_p_over_z、p_over_z_depletion、withdrawal_fraction、inverse_withdrawal_fraction、effective_inventory）、cycle_id、injection_end_state_id、evaluation_state_id、pressure_basis、equation、quantity_definition、quality_gate；外层含 units、metrics、assumptions、warnings、applicability。",
    "按分层 p/Z 采气段公式计算有效控制库存。",
    "依赖输入压力基准与 Z 值；异常分母或超限反向采气比例会触发校验。"
  ),
  "storage.inventory.evaluate": xe(
    "layers：分层数组，每层含 name、produced_gas、injection_end_pressure、injection_end_z、evaluation_pressure、evaluation_z；cycle_id、injection_end_state_id、evaluation_state_id、design_capacity 必填；book_inventory 与 initial_inventory/cumulative_injected/cumulative_produced 二选一；working_gas 与 design_working_gas 成对可选；peak_daily_rate 与 design_peak_daily_rate 成对可选；gas_volume_unit（默认 1e8_sm3）、pressure_unit（默认 MPa）、pressure_basis（默认 absolute；可选 apparent_formation/report_defined）、daily_rate_unit（默认 1e4_sm3/d）。",
    "effective_inventory、book_inventory、book_minus_effective_inventory、effective_minus_book_percent、design_capacity、effective_inventory_design_compliance_percent、book_inventory_fill_percent、effective_to_book_percent、book_inventory_source、review_status、review_reference、layers、quantity_separation、quality_gate；按输入条件附加 book_inventory_accounting、working_gas/design_working_gas/working_gas_compliance_percent、peak_daily_rate/design_peak_daily_rate/peak_daily_compliance_percent。",
    "分离计算账面库存、有效控制库存及可选工作气/冲峰指标，并标记待审核。",
    "结果始终为待审核计算建议，不表示已审批。"
  ),
  "storage.capacity.evaluate": xe(
    "layers：每层 name、pore_volume、maximum_pressure、maximum_z、minimum_pressure、minimum_z、temperature；pore_volume_unit（m3）、pressure_unit（MPa）、temperature_unit（K）；standard_pressure（默认 0.101325）、standard_temperature（默认 288.15）、gas_volume_unit（1e8_sm3）。",
    "result：total_capacity、cushion_gas、working_gas、working_gas_fraction、layers（逐层 maximum_capacity/minimum_inventory/working_gas 等）、pressure_window、method、review_status、review_reference；外层含 units、metrics、assumptions、warnings、applicability。",
    "按孔隙体积和压力/Z 边界换算标准气量。",
    "属于边界筛选；不包含水侵、地质力学或产能能力模型。"
  ),
  "storage.injection_allocation.optimize": xe(
    "wells：井组数组，含 name、maximum_rate、可选 minimum_rate（默认 0）、weight（默认 1）、available（默认 true）；target_rate；rate_unit（1e4_sm3/d）；require_feasible（默认 false）。",
    "目标/请求量、分配总量、未满足量、超配量、feasible、逐井 allocated_rate/constraint_status、method、review_status；并附单位、井数指标、假设、警告和适用范围。",
    "按可用井的最低量和权重上限填充分配目标。",
    "不计算井筒/地层物理响应；结果是边界内的分配方案。"
  ),
  "storage.production_allocation.optimize": xe(
    "wells：井组数组，含 name、maximum_rate、可选 minimum_rate（默认 0）、weight（默认 1）、available（默认 true）；demand_rate；rate_unit（1e4_sm3/d）；require_feasible（默认 false）。",
    "需求/请求量、分配总量、未满足量、超配量、feasible、逐井 allocated_rate/constraint_status、method、review_status；并附单位、井数指标、假设、警告和适用范围。",
    "按可用井的最低量和权重上限填充分配需求。",
    "井组产能上下限由调用方提供；工具不计算井筒或地层产能。"
  ),
  "storage.scenario.optimize": xe(
    "scenarios：候选数组，每项含 name、metrics（指标名到数值），metadata（可选字符串映射）；objectives：指标 key、direction（maximize/minimize）、weight；constraints（可选，key/operator/limit）；metric_unit（可选）。",
    "可行方案排序、目标评分、约束筛选与非支配 Pareto 方案。",
    "按显式目标和约束做透明方案比较。",
    "仅比较提供的标量指标，不运行储层仿真。"
  ),
  "visualization.open": xe(
    "dataset_id：数据集标识（默认空字符串，表示不指定数据集）。",
    "排队命令回执：kind、commandId、command=open、datasetId；配置/队列异常时返回 kind=error 和 error。",
    "请求打开三维查看器并可选加载数据集。"
  ),
  "visualization.property": xe(
    "property：属性名；dataset_id：数据集标识（默认空字符串）。",
    "排队命令回执：kind、commandId、command=set-property、property；异常时 kind=error/error。",
    "向查看器发送属性着色切换命令。"
  ),
  "visualization.benchmark": xe(
    "无参数。",
    "排队基准命令回执：kind、commandId、command=benchmark；实际基准数据需查询/由查看器执行。",
    "请求查看器运行五秒渲染基准。"
  ),
  "storage.history.import": xe(
    "input_path：本地文件或目录的路径。",
    "ok、dataset_id、records、facilities、quality_counts、quality_examples（最多 20 条）、source_columns、reused。",
    "导入本地储气库注采历史数据并检查质量。",
    "接受 XLS/XLSX/UTF-8 CSV 文件或目录；原件保留。"
  ),
  "storage.dynamics.analyze": xe(
    "dataset_id：数据集 ID；facility、well：储气库/井原名（默认空，表示全部）；start、end：YYYY-MM-DD 起止日期（默认空，取全范围）；cycle_start_month：气年度起始月 1–12（默认 4）；drop_threshold_pct：同阶段末 7 日与前 7 日折算量下降筛查阈值百分比（默认 30）。",
    "ok、summary、coverage、cycles_recent、anomalies、forecast_wells、warnings、parameters、quality_counts、quality_examples、report_path、analysis_path。",
    "生成并保存可追溯的储气库动态分析报告。"
  ),
  "storage.history.list": xe(
    "无参数。",
    "ok、datasets（每项含 id、name、records、facilities、quality_counts、quality_examples）及 quality_code_meaning。",
    "列出已导入储气库历史数据集。"
  )
}, Zt = {
  "well-log-processing": {
    description: "读取 LAS 2.0 测井文件，提供曲线摘要、质量检查和规范化导出。",
    inputs: "LAS 文件路径及读取、检查或导出选项。",
    outputs: "井与曲线元数据、采样摘要、质量问题或导出工件。"
  },
  "decline-analysis": {
    description: "对生产点拟合 Arps 指数、调和或双曲递减模型，并按拟合参数预测和估算 EUR。",
    inputs: "带时间/产量单位的生产点，或模型参数、预测时点/终止条件。",
    outputs: "拟合参数与误差指标、预测产量或 EUR 估算。"
  },
  "petroleum-deterministic-core": {
    description: "执行确定性的单位换算、容积法 OOIP、油/气物质平衡、Standing 黑油 PVT、Vogel IPR、简化节点分析和守恒检查。",
    inputs: "明确单位的工程参数、PVT 与压力/流量数据。",
    outputs: "换算值、储量/PVT/IPR/节点计算结果及守恒校核。"
  },
  "storage-inventory-evaluation": {
    description: "基于输入数据进行储气库库存计量、分层 p/Z 有效库存、压力边界库容筛选、井组注采分配及方案排序。",
    inputs: "注采库存、分层压力/Z/孔隙体积、井组边界或候选方案指标。",
    outputs: "账面与有效库存、库容边界量、分配候选、约束短缺及 Pareto 结果。"
  },
  "storage-production-dynamics": {
    description: "导入和审计储气库注采历史数据，查询数据集并生成动态分析。",
    inputs: "XLS/XLSX/CSV 路径、已导入数据集标识及分析选项。",
    outputs: "数据集目录、覆盖与质量审计、动态/周期/异常及条件性基线报告。"
  },
  neqsim: {
    description: "通过外部 NeqSim Driver 服务请求闪蒸、PVT、相包络、流程和管道计算。",
    inputs: "各工具接受的组成、状态条件、流程或管道 specification 对象/JSON。",
    outputs: "由 NeqSim 服务返回的相态、性质、流程或管道结果。"
  },
  "reservoir-visualization": {
    description: "向三维查看器发送打开数据集、切换属性和启动性能基准的命令。",
    inputs: "dataset_id（可选）、property 或无参数基准命令。",
    outputs: "带 commandId 的查看器命令回执；基准数据由查看器执行，不由该工具直接返回。"
  },
  sympy: {
    description: "提供最高 20 次多项式的数值求根工具。",
    inputs: "按最高次项到常数项排列的非零首项系数数组。",
    outputs: "degree 及 roots 数组，每个根含 real、imag。"
  },
  pymc: {
    description: "对观测标准差已知的正态均值模型执行贝叶斯估计。",
    inputs: "observations、prior_mean（0）、prior_std（10）、observation_std（1）、draws（1000）、tune（500）、seed（42）。",
    outputs: "posterior_mean、posterior_std、credible_interval_95、sample_count。"
  },
  pymoo: {
    description: "用 NSGA-II 搜索结构化二次多目标函数。",
    inputs: "centers、bounds、population_size（80）、generations（100）、seed（42）。",
    outputs: "solutions（每项含 variables、objectives）及 solution_count。"
  },
  simpy: {
    description: "运行固定到达间隔、固定服务时间的多服务台 FIFO 队列仿真。",
    inputs: "arrival_interval、service_time、servers（默认 1）和 duration（默认 100）。",
    outputs: "arrivals、completed、average_wait、maximum_wait、servers。"
  },
  networkx: {
    description: "分析输入图的连通分量、密度、度中心性和可选最短路径。",
    inputs: "nodes、edges、directed（默认 false）；source/target 可选但须同时提供。",
    outputs: "node_count、edge_count、component_count、density、degree_centrality、shortest_path。"
  },
  geopandas: {
    description: "计算输入点集的边界框和质心。",
    inputs: "points：二维 [x,y] 数组；crs（默认 EPSG:4326）。",
    outputs: "point_count、crs、bounds、centroid。"
  },
  "scikit-learn": {
    description: "拟合普通最小二乘线性回归并预测给定样本。",
    inputs: "features、targets、predict_features。",
    outputs: "coefficients、intercept、training_r_squared、training_rmse、predictions。"
  },
  statsmodels: {
    description: "拟合带截距的 OLS 回归并返回推断统计量。",
    inputs: "features、targets、feature_names（可选，默认 x1…）。",
    outputs: "coefficients、standard_errors、p_values、r_squared、adjusted_r_squared、observation_count。"
  }
};
function Ai(e) {
  const t = Ii[e.id];
  return {
    description: (t == null ? void 0 : t.description) || e.description || "暂无说明",
    inputs: (t == null ? void 0 : t.inputs) || "输入信息未提供",
    outputs: (t == null ? void 0 : t.outputs) || "输出信息未提供",
    limitations: t == null ? void 0 : t.limitations
  };
}
function $i({
  operations: e
}) {
  const t = R().React, { Tag: n, Typography: r } = R().antd, { Text: i } = r;
  return t.createElement(
    "div",
    { style: { display: "grid", gap: 8, minWidth: 0 } },
    ...e.map((a) => {
      const o = Ai(a);
      return t.createElement(
        "div",
        {
          key: a.id,
          style: {
            padding: "10px 12px",
            border: "1px solid var(--ant-color-border-secondary, #f0f0f0)",
            borderRadius: 6,
            minWidth: 0
          }
        },
        t.createElement(
          i,
          { strong: !0, style: { overflowWrap: "anywhere" } },
          a.name
        ),
        t.createElement(
          i,
          {
            type: "secondary",
            style: { display: "block", fontSize: 11, overflowWrap: "anywhere" }
          },
          a.tool_names.length ? `工具：${a.tool_names.join("、")}` : "工具：未声明"
        ),
        t.createElement(
          i,
          {
            style: {
              display: "block",
              marginTop: 6,
              fontSize: 12,
              overflowWrap: "anywhere"
            }
          },
          o.description
        ),
        t.createElement(
          i,
          {
            type: "secondary",
            style: {
              display: "block",
              marginTop: 4,
              fontSize: 12,
              overflowWrap: "anywhere"
            }
          },
          `输入：${o.inputs}`
        ),
        t.createElement(
          i,
          {
            type: "secondary",
            style: { display: "block", fontSize: 12, overflowWrap: "anywhere" }
          },
          `输出：${o.outputs}`
        ),
        o.limitations ? t.createElement(
          i,
          {
            type: "warning",
            style: {
              display: "block",
              fontSize: 12,
              overflowWrap: "anywhere"
            }
          },
          `限制：${o.limitations}`
        ) : null,
        Ii[a.id] ? null : t.createElement(
          n,
          { style: { marginTop: 4 } },
          "详细说明待补充"
        )
      );
    })
  );
}
const $l = {
  geology_well_logging: "📡",
  production_engineering: "⚙️",
  reservoir_engineering: "🛢️",
  underground_gas_storage: "🛢️",
  gas_storage: "🛢️",
  fluid_thermodynamics: "🧪",
  scientific_computing: "🧮",
  data_modeling: "📊"
};
function zl({
  view: e,
  onDetails: t,
  onInstall: n,
  onConfigure: r,
  onRefresh: i,
  installTask: a
}) {
  const o = R().React, { Card: l, Tag: s, Typography: d, Button: c, Modal: m, Tooltip: u } = R().antd, { Text: p } = d, [b, g] = o.useState(!1), E = e.definition, f = Zt[E.id], h = (a == null ? void 0 : a.status) === "queued" || (a == null ? void 0 : a.status) === "running", v = E.id !== "neqsim" && e.effectiveStatus === "unavailable" && E.dependencies.length > 0 && E.dependencies.every((x) => !/(three\.js|java|neqsim)/i.test(x)), w = h ? { label: "查看安装进度", action: n, disabled: !1 } : E.id === "neqsim" && e.effectiveStatus === "needs_install" ? {
    label: "安装 NeqSim 运行环境",
    action: n,
    disabled: !1
  } : e.effectiveStatus === "needs_install" || v ? {
    label: "安装运行环境",
    action: n,
    disabled: !1
  } : e.effectiveStatus === "unconfigured" || e.effectiveStatus === "partial" ? { label: "启用工具", action: r, disabled: !1 } : e.effectiveStatus === "error" || e.effectiveStatus === "unknown" ? { label: "重新检测", action: i, disabled: !1 } : null;
  return o.createElement(
    l,
    {
      size: "small",
      style: { width: "100%", minWidth: 0 },
      styles: {
        body: { minWidth: 0, display: "flex", flexDirection: "column" }
      }
    },
    o.createElement(
      "div",
      {
        style: {
          display: "flex",
          alignItems: "flex-start",
          gap: 10,
          minWidth: 0
        }
      },
      o.createElement(
        "span",
        {
          "aria-hidden": !0,
          style: {
            display: "grid",
            placeItems: "center",
            flex: "0 0 36px",
            width: 36,
            height: 36,
            borderRadius: 9,
            fontSize: 20,
            background: "var(--ant-color-fill-tertiary, rgba(127,127,127,.12))"
          }
        },
        $l[E.domain] || "📦"
      ),
      o.createElement(
        "div",
        { style: { flex: 1, minWidth: 0 } },
        o.createElement(
          p,
          {
            strong: !0,
            style: {
              display: "block",
              fontSize: 14,
              lineHeight: "21px",
              overflowWrap: "anywhere"
            }
          },
          E.name
        ),
        o.createElement(
          "div",
          { style: { marginTop: 3 } },
          o.createElement(
            u,
            { title: `${e.statusDescription} 该状态未包含实际试算验证。` },
            o.createElement(
              s,
              {
                color: cr[e.effectiveStatus] || "default",
                tabIndex: 0
              },
              lr[e.effectiveStatus] || e.effectiveStatus
            )
          )
        )
      )
    ),
    o.createElement(
      p,
      {
        type: "secondary",
        style: {
          display: "block",
          marginTop: 10,
          fontSize: 13,
          lineHeight: "20px",
          overflowWrap: "anywhere"
        }
      },
      (f == null ? void 0 : f.description) || E.description || "暂无领域说明"
    ),
    o.createElement(
      "div",
      {
        style: {
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr)",
          gap: 5,
          marginTop: 10,
          padding: "8px 10px",
          borderRadius: 8,
          background: "var(--ant-color-fill-quaternary, rgba(127,127,127,.07))"
        }
      },
      o.createElement(
        p,
        {
          type: "secondary",
          style: { fontSize: 12, lineHeight: "18px", overflowWrap: "anywhere" }
        },
        `输入 · ${(f == null ? void 0 : f.inputs) || "输入信息未提供"}`
      ),
      o.createElement(
        p,
        {
          type: "secondary",
          style: { fontSize: 12, lineHeight: "18px", overflowWrap: "anywhere" }
        },
        `输出 · ${(f == null ? void 0 : f.outputs) || "输出信息未提供"}`
      )
    ),
    a && h ? o.createElement(
      p,
      {
        type: "secondary",
        role: "status",
        style: { marginTop: 8, fontSize: 12, lineHeight: "18px" }
      },
      a.message || "运行环境安装中…"
    ) : null,
    o.createElement(
      "div",
      {
        style: {
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 8,
          marginTop: "auto",
          paddingTop: 10
        }
      },
      o.createElement(
        c,
        {
          type: "link",
          size: "small",
          "aria-label": `查看 ${E.name} 的函数`,
          onClick: () => g(!0)
        },
        `查看函数 · ${E.operations.length}`
      ),
      o.createElement(
        "div",
        {
          style: {
            display: "flex",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 4,
            marginLeft: "auto"
          }
        },
        w ? o.createElement(
          c,
          {
            size: "small",
            type: "primary",
            disabled: w.disabled || !w.action,
            loading: !1,
            "aria-label": w.label,
            onClick: w.action
          },
          w.label
        ) : null,
        o.createElement(
          c,
          {
            size: "small",
            "aria-label": `查看 ${E.name} 详情`,
            onClick: t
          },
          "查看详情"
        )
      )
    ),
    o.createElement(
      m,
      {
        title: `${E.name} · 函数说明`,
        open: b,
        onCancel: () => g(!1),
        width: "min(720px, calc(100vw - 32px))",
        destroyOnHidden: !0,
        footer: o.createElement(
          c,
          {
            onClick: () => g(!1),
            "aria-label": "关闭函数说明"
          },
          "关闭"
        ),
        styles: { body: { maxHeight: "65vh", overflowY: "auto" } }
      },
      o.createElement($i, { operations: E.operations })
    )
  );
}
const _n = [
  {
    key: "storage",
    title: "储气库工程",
    domains: ["underground_gas_storage", "gas_storage"]
  },
  {
    key: "reservoir",
    title: "油气藏与生产工程",
    domains: ["reservoir_engineering", "production_engineering"]
  },
  { key: "geology", title: "测井与地质", domains: ["geology_well_logging"] },
  { key: "fluids", title: "流体性质", domains: ["fluid_thermodynamics"] },
  {
    key: "general",
    title: "通用科学计算",
    domains: ["scientific_computing", "data_modeling"]
  },
  { key: "other", title: "其他领域", domains: [] }
];
function dr(e, t) {
  return t === "reservoir-visualization" ? _n[2] : _n.find((n) => n.domains.includes(e)) || _n[5];
}
function Pl({
  view: e,
  open: t,
  onClose: n,
  onNavigateToMcp: r,
  onNavigateToTools: i,
  onNavigateToSkills: a,
  onInstallNeqsim: o,
  neqsimInstallState: l
}) {
  const s = R().React, { Drawer: d, Descriptions: c, Tag: m, Typography: u, Button: p, Divider: b } = R().antd, { Text: g, Paragraph: E } = u;
  if (!e) return null;
  const f = e.definition, h = e.dependencyStatus, v = Zt[f.id], w = dr(f.domain, f.id).title;
  return s.createElement(
    d,
    {
      title: s.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 8 } },
        s.createElement("span", null, f.name),
        s.createElement(
          m,
          {
            color: cr[e.effectiveStatus] || "default",
            style: { fontSize: 11 }
          },
          lr[e.effectiveStatus] || e.effectiveStatus
        )
      ),
      open: t,
      onClose: n,
      width: 560,
      rootClassName: "ugsci-domain-engine-detail-drawer"
    },
    // Overview
    s.createElement(
      c,
      { column: 1, bordered: !0, size: "small" },
      s.createElement(c.Item, { label: "领域" }, w),
      s.createElement(
        c.Item,
        { label: "状态依据" },
        e.statusDescription
      ),
      s.createElement(
        c.Item,
        { label: "检测范围" },
        "检查运行依赖、工具注册和当前专家的启用配置；未执行试算，不代表计算结果已验证。"
      ),
      s.createElement(
        c.Item,
        { label: "来源" },
        f.provider.kind === "driver" ? "内置能力 · MCP Driver" : f.source === "builtin" ? "内置工具" : f.source === "mcp" ? "MCP 服务" : "科学计算库 / 技能"
      ),
      s.createElement(
        c.Item,
        { label: "实现" },
        `${f.provider.kind}:${f.provider.id}`
      ),
      s.createElement(
        c.Item,
        { label: "计算类别" },
        f.execution_class === "deterministic" ? "确定性计算" : f.execution_class === "stochastic" ? "随机/概率计算" : f.execution_class === "external" ? "外部 Provider" : "可视化"
      ),
      s.createElement(
        c.Item,
        { label: "内核版本" },
        f.engine_version
      ),
      s.createElement(
        c.Item,
        { label: "描述" },
        (v == null ? void 0 : v.description) || f.description || "暂无领域说明"
      ),
      s.createElement(
        c.Item,
        { label: "总输入" },
        (v == null ? void 0 : v.inputs) || "输入信息未提供"
      ),
      s.createElement(
        c.Item,
        { label: "总输出" },
        (v == null ? void 0 : v.outputs) || "输出信息未提供"
      ),
      s.createElement(
        c.Item,
        { label: "已发现工具" },
        e.discoveredToolCount
      ),
      s.createElement(
        c.Item,
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
    s.createElement($i, { operations: f.operations }),
    s.createElement(
      "div",
      { style: { marginTop: 16, display: "flex", gap: 4, flexWrap: "wrap" } },
      ...f.tags.map(
        (x) => s.createElement(m, { key: x, color: "cyan" }, x)
      )
    ),
    // Dependencies
    s.createElement(b, null),
    s.createElement(g, { strong: !0 }, "实现与依赖"),
    h && h.dependencies.length > 0 ? s.createElement(
      "div",
      { style: { marginTop: 8 } },
      ...h.dependencies.map(
        (x) => s.createElement(
          "div",
          {
            key: x.name,
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
            s.createElement(
              g,
              { style: { fontSize: 13 } },
              x.name
            ),
            s.createElement(
              m,
              {
                color: cr[x.status] || "default",
                style: { fontSize: 11 }
              },
              lr[x.status] || x.status
            )
          ),
          x.status !== "available" && x.reason ? s.createElement(
            g,
            {
              type: "secondary",
              style: { display: "block", fontSize: 12, marginTop: 4 }
            },
            x.reason
          ) : null,
          x.status !== "available" && x.install_hint ? s.createElement(
            g,
            { style: { display: "block", fontSize: 12, marginTop: 4 } },
            `安装：${x.install_hint}`
          ) : null,
          x.status !== "available" && x.enable_hint ? s.createElement(
            g,
            { style: { display: "block", fontSize: 12, marginTop: 2 } },
            `启用：${x.enable_hint}`
          ) : null
        )
      )
    ) : s.createElement(
      E,
      { type: "secondary", style: { fontSize: 12 } },
      "无外部依赖"
    ),
    // Actions
    s.createElement(b, null),
    s.createElement(g, { strong: !0 }, "问题处理"),
    s.createElement(
      "div",
      { style: { marginTop: 8, display: "flex", gap: 8, flexWrap: "wrap" } },
      f.id === "neqsim" && e.effectiveStatus === "needs_install" ? s.createElement(
        p,
        {
          size: "small",
          type: "primary",
          loading: (l == null ? void 0 : l.status) === "queued" || (l == null ? void 0 : l.status) === "running",
          onClick: o
        },
        (l == null ? void 0 : l.status) === "running" ? `${l.message} (${l.progress}%)` : "安装 NeqSim 运行环境"
      ) : null,
      f.provider.kind === "driver" ? s.createElement(
        p,
        { size: "small", onClick: r },
        "查看内置 MCP Driver"
      ) : f.source === "library" ? s.createElement(
        p,
        { size: "small", onClick: a },
        "查看相关技能"
      ) : s.createElement(
        p,
        { size: "small", onClick: () => i("builtin") },
        "查看内置工具"
      )
    ),
    f.id === "neqsim" && (l == null ? void 0 : l.status) === "failed" ? s.createElement(
      E,
      { type: "danger", style: { marginTop: 8, fontSize: 12 } },
      l.error || "安装失败"
    ) : null,
    f.id === "neqsim" && (l != null && l.warning) ? s.createElement(
      E,
      { type: "warning", style: { marginTop: 8, fontSize: 12 } },
      l.warning
    ) : null
  );
}
function Rl({
  open: e,
  engineName: t,
  plan: n,
  task: r,
  error: i,
  onClose: a,
  onTaskChange: o,
  onRetry: l,
  onCompleted: s,
  onManage: d
}) {
  const c = R().React, { Modal: m, Button: u, Typography: p, Alert: b, Progress: g, Tag: E, Space: f } = R().antd, { Text: h, Paragraph: v } = p, w = c.useRef(0), x = c.useRef(!0), j = `${e}:${(n == null ? void 0 : n.engine_id) || ""}`, X = c.useRef(j);
  X.current = j;
  const [T, A] = c.useState(!1), [F, N] = c.useState(""), [C, k] = c.useState(0), z = (r == null ? void 0 : r.status) === "queued" || (r == null ? void 0 : r.status) === "running";
  c.useEffect(() => {
    A(!1), N("");
  }, [j]), c.useEffect(() => (x.current = !0, () => {
    x.current = !1, w.current += 1;
  }), []), c.useEffect(() => {
    if (!e || !z || !r) return;
    const O = ++w.current;
    let I = !1;
    return (async () => {
      for (; !I && O === w.current; ) {
        if (await new Promise((H) => setTimeout(H, 1e3)), I || O !== w.current) return;
        try {
          const H = await Cl(r.id);
          if (I || O !== w.current) return;
          if (N(""), o(H), H.status === "completed") {
            s();
            return;
          }
          if (H.status === "failed") return;
        } catch (H) {
          if (I || O !== w.current) return;
          const U = H instanceof Error ? H.message : "连接安装任务失败";
          if (/HTTP 404|not found|未找到/i.test(U))
            try {
              const M = await sr(r.engine_id);
              if (I || O !== w.current) return;
              M.state === "ready" ? (o({
                ...r,
                status: "completed",
                progress: 100,
                message: "依赖已就绪，已恢复安装状态。",
                error: ""
              }), s()) : M.active_task ? (o(M.active_task), k((ne) => ne + 1)) : o({
                ...r,
                status: "failed",
                error: "未找到此安装任务，且依赖尚未就绪，请重新发起安装。"
              });
            } catch {
              if (I || O !== w.current) return;
              N("暂时无法确认安装结果，请重新检测以恢复进度。");
            }
          else
            N(
              `连接安装任务时遇到问题。安装可能仍在后台继续，请重新检测以恢复进度。（${U}）`
            );
          return;
        }
      }
    })(), () => {
      I = !0, w.current += 1;
    };
  }, [e, z, r == null ? void 0 : r.id, C, o, s]);
  const B = async () => {
    if (!(n != null && n.installable) || T || z) return;
    const O = X.current;
    A(!0);
    try {
      const I = await kl(n.engine_id);
      if (!x.current || X.current !== O) return;
      o(I), I.status === "completed" && s();
    } catch (I) {
      if (!x.current || X.current !== O) return;
      l(I instanceof Error ? I.message : "无法开始安装，请重试");
    } finally {
      x.current && X.current === O && A(!1);
    }
  }, _ = !!(n != null && n.installable) && !z && (r == null ? void 0 : r.status) !== "completed", L = (r == null ? void 0 : r.status) === "completed", D = (r == null ? void 0 : r.status) === "failed", Y = L ? c.createElement(b, {
    type: "success",
    showIcon: !0,
    message: "安装完成",
    description: (r == null ? void 0 : r.message) || "运行环境安装完成。请关闭弹窗查看刷新后的工具状态。"
  }) : D ? c.createElement(b, {
    type: "error",
    showIcon: !0,
    message: "安装失败",
    description: (r == null ? void 0 : r.error) || (r == null ? void 0 : r.message) || "安装失败，请重试。"
  }) : r ? c.createElement(
    "div",
    { role: "status", "aria-live": "polite", style: { marginTop: 16 } },
    c.createElement(
      f,
      { size: 8 },
      c.createElement(
        E,
        { color: z ? "processing" : "default" },
        r.status === "queued" ? "排队中" : r.status === "running" ? "安装中" : r.status
      ),
      c.createElement(h, null, r.message || "正在准备安装…")
    ),
    z ? c.createElement(
      c.Fragment,
      null,
      c.createElement(
        h,
        {
          type: "secondary",
          style: { display: "block", marginTop: 8, fontSize: 12 }
        },
        "阶段进度（非下载百分比）"
      ),
      c.createElement(g, {
        percent: r.progress ?? void 0,
        status: "active",
        showInfo: !1,
        style: { marginTop: 2, marginBottom: 0 }
      })
    ) : null,
    r.warning ? c.createElement(b, {
      style: { marginTop: 10 },
      type: "warning",
      showIcon: !0,
      message: r.warning
    }) : null
  ) : null;
  return c.createElement(
    m,
    {
      title: `${t} · 运行环境`,
      open: e,
      onCancel: a,
      width: "min(520px, calc(100vw - 32px))",
      destroyOnHidden: !1,
      footer: L ? c.createElement(
        u,
        {
          type: "primary",
          onClick: a,
          "aria-label": "关闭安装完成提示"
        },
        "关闭"
      ) : D ? c.createElement(
        f,
        null,
        c.createElement(u, { onClick: a }, "关闭"),
        c.createElement(
          u,
          {
            type: "primary",
            onClick: B,
            disabled: !(n != null && n.installable),
            loading: T,
            "aria-label": "重试安装"
          },
          "重试安装"
        )
      ) : r ? c.createElement(
        u,
        { onClick: a, "aria-label": "关闭安装进度" },
        "后台继续，关闭窗口"
      ) : n && !n.installable && n.state !== "ready" ? c.createElement(
        c.Fragment,
        null,
        c.createElement(u, { onClick: a }, "关闭"),
        c.createElement(
          u,
          { onClick: d, "aria-label": "前往工具或技能管理入口" },
          "前往管理入口"
        )
      ) : (n == null ? void 0 : n.state) === "ready" ? c.createElement(
        u,
        { type: "primary", onClick: a },
        "关闭"
      ) : c.createElement(
        f,
        null,
        c.createElement(u, { onClick: a }, "取消"),
        c.createElement(
          u,
          {
            type: "primary",
            disabled: !_ || T,
            loading: T,
            onClick: B,
            "aria-label": "开始安装运行环境"
          },
          "开始安装"
        )
      )
    },
    i ? c.createElement(b, {
      type: "error",
      showIcon: !0,
      message: "运行环境操作未完成",
      description: i,
      action: c.createElement(
        u,
        {
          size: "small",
          onClick: () => l(),
          "aria-label": "重新检测运行环境"
        },
        "重新检测"
      )
    }) : null,
    F ? c.createElement(b, {
      style: { marginTop: 12 },
      type: "warning",
      showIcon: !0,
      message: F,
      action: c.createElement(
        u,
        {
          size: "small",
          onClick: () => {
            N(""), k((O) => O + 1), l();
          },
          "aria-label": "重新检测安装任务"
        },
        "重新检测"
      )
    }) : null,
    n ? c.createElement(
      c.Fragment,
      null,
      c.createElement(
        v,
        { style: { marginBottom: 12 } },
        n.state === "ready" ? "运行依赖已就绪。你可以关闭窗口并刷新状态。" : n.installable ? "将把以下依赖安装到 QwenPaw 软件使用的 Python 环境中。安装耗时和下载量取决于所需依赖。" : n.message || "此运行环境当前无法由软件安装。"
      ),
      n.packages.length ? c.createElement(
        "div",
        {
          style: {
            padding: 12,
            borderRadius: 8,
            background: "var(--ant-color-fill-quaternary, rgba(127,127,127,.07))"
          }
        },
        c.createElement(
          h,
          {
            strong: !0,
            style: { display: "block", marginBottom: 6 }
          },
          "依赖清单"
        ),
        ...n.packages.map(
          (O) => c.createElement(
            "div",
            {
              key: O,
              style: {
                fontFamily: "monospace",
                fontSize: 13,
                lineHeight: "21px",
                overflowWrap: "anywhere"
              }
            },
            O
          )
        )
      ) : c.createElement(b, {
        type: n.installable ? "info" : "warning",
        showIcon: !0,
        message: n.message || "没有可列出的安装依赖。"
      }),
      L || n.state === "ready" ? c.createElement(b, {
        style: { marginTop: 12 },
        type: "success",
        showIcon: !0,
        message: "运行环境已就绪"
      }) : null,
      !n.installable && n.state !== "ready" ? c.createElement(b, {
        style: { marginTop: 12 },
        type: "warning",
        showIcon: !0,
        message: n.message || "当前环境不支持自动安装，请前往工具或技能管理入口处理。"
      }) : null
    ) : null,
    Y
  );
}
function Ol(e) {
  return e instanceof Error ? /Install task not found|HTTP 404/i.test(e.message) : !1;
}
function Ml({
  onNavigateToMcp: e,
  onNavigateToTools: t,
  onNavigateToSkills: n
} = {}) {
  var ce, he;
  const r = R().React, { useState: i, useEffect: a, useCallback: o, useMemo: l, useRef: s } = r, {
    Spin: d,
    Empty: c,
    Button: m,
    message: u,
    Row: p,
    Col: b,
    Input: g
  } = R().antd, { ReloadOutlined: E, SearchOutlined: f } = R().antdIcons || {}, h = (he = (ce = R()).useSelectedAgent) == null ? void 0 : he.call(ce), v = (h == null ? void 0 : h.id) || "default", [w, x] = i([]), [j, X] = i(!0), [T, A] = i(""), [F, N] = i(!1), [C, k] = i(null), [z, B] = i({ general: !0 }), [_, L] = i(null), [D, Y] = i(null), [O, I] = i(
    null
  ), [q, H] = i(
    null
  ), [U, M] = i(""), [ne, re] = i(!1), K = s(v);
  K.current = v;
  const pe = s(C);
  pe.current = C;
  const ae = s(0), J = s(0);
  a(
    () => () => {
      ae.current += 1, J.current += 1;
    },
    []
  );
  const de = o(async (y = !1, V = !1) => {
    var be, Ae;
    V || X(!0);
    const $ = V && typeof window < "u" ? {
      x: window.scrollX,
      y: window.scrollY,
      drawerBody: typeof document < "u" ? document.querySelector(
        ".ugsci-domain-engine-detail-drawer .ant-drawer-body"
      ) : null,
      drawerTop: typeof document < "u" && ((be = document.querySelector(
        ".ugsci-domain-engine-detail-drawer .ant-drawer-body"
      )) == null ? void 0 : be.scrollTop) || 0
    } : null, ue = () => {
      if (!$ || typeof window > "u") return;
      const Be = () => {
        var Le;
        window.scrollTo($.x, $.y), (Le = $.drawerBody) != null && Le.isConnected && ($.drawerBody.scrollTop = $.drawerTop);
      };
      typeof window.requestAnimationFrame == "function" ? window.requestAnimationFrame(Be) : Be();
    }, ye = K.current;
    try {
      const [Be, Le, nt] = await Promise.all([
        wl(y),
        Il(ye, y),
        Tl(ye, y)
      ]);
      if (ye !== K.current) return;
      const Ge = [];
      for (const Ye of Be)
        try {
          let W = null;
          if (Ye.engine.provider.kind === "driver") {
            const ge = Ye.engine.provider.id;
            W = Le.get(ge) || null;
          }
          Ge.push(Al(Ye, W, nt));
        } catch {
        }
      x(Ge);
      const rt = (Ae = pe.current) == null ? void 0 : Ae.definition.id;
      if (rt) {
        const Ye = Ge.find((W) => W.definition.id === rt);
        Ye && (pe.current = Ye, k(Ye));
      }
      ue();
    } catch (Be) {
      const Le = Be instanceof Error ? Be.message : "加载领域引擎失败";
      u.error(Le), V || x([]);
    } finally {
      V || X(!1);
    }
  }, []);
  a(() => {
    de();
  }, [v, de]);
  const G = l(() => {
    if (!T.trim()) return w;
    const y = T.trim().toLowerCase();
    return w.filter(
      (V) => {
        var $, ue, ye;
        return dr(V.definition.domain, V.definition.id).title.toLowerCase().includes(y) || V.definition.name.toLowerCase().includes(y) || V.definition.domain.toLowerCase().includes(y) || V.definition.description.toLowerCase().includes(y) || [
          (($ = Zt[V.definition.id]) == null ? void 0 : $.description) || "",
          ((ue = Zt[V.definition.id]) == null ? void 0 : ue.inputs) || "",
          ((ye = Zt[V.definition.id]) == null ? void 0 : ye.outputs) || ""
        ].some((be) => be.toLowerCase().includes(y)) || V.definition.tags.some((be) => be.toLowerCase().includes(y)) || V.definition.operations.some((be) => {
          const Ae = Ai(be);
          return [
            be.name,
            be.id,
            be.description,
            ...be.tool_names,
            Ae.description,
            Ae.inputs,
            Ae.outputs,
            Ae.limitations || ""
          ].some((Be) => Be.toLowerCase().includes(y));
        });
      }
    );
  }, [w, T]), P = l(
    () => _n.map((y) => ({
      ...y,
      views: G.filter(
        (V) => dr(V.definition.domain, V.definition.id).key === y.key
      )
    })).filter((y) => y.views.length > 0),
    [G]
  ), le = o(() => {
    de(!0);
  }, [de]), Ee = o((y) => {
    pe.current = y, k(y), N(!0);
  }, []), _e = o(() => {
    N(!1), e == null || e();
  }, [e]), ke = o(
    (y) => {
      N(!1), t == null || t(y);
    },
    [t]
  ), Se = o(() => {
    N(!1), n == null || n();
  }, [n]), fe = o(async () => {
    if ((_ == null ? void 0 : _.status) === "queued" || (_ == null ? void 0 : _.status) === "running")
      return;
    const y = ++ae.current, V = () => y === ae.current;
    try {
      let $ = await xl();
      if (!V()) return;
      for (L($); $.status === "queued" || $.status === "running"; ) {
        if (await new Promise((ue) => setTimeout(ue, 1e3)), !V()) return;
        try {
          $ = await _l($.id);
        } catch (ue) {
          if (!Ol(ue)) throw ue;
          const ye = await Sl(!0);
          if (!V()) return;
          ye.ready ? $ = {
            ...$,
            status: "completed",
            progress: 100,
            message: "后端重启后已恢复 NeqSim 运行环境状态",
            error: "",
            runtime: ye,
            recovered: !0
          } : $ = {
            ...$,
            status: "failed",
            message: "安装进程因后端重启中断",
            error: "后端重启后未发现完整的 NeqSim 运行环境，请重新安装",
            runtime: ye,
            recovered: !0
          };
        }
        if (!V()) return;
        L($);
      }
      if (!V()) return;
      $.status === "completed" ? ($.warning ? u.warning($.warning) : u.success("NeqSim 运行环境已安装并启用"), await de(!0, !0)) : u.error($.error || "NeqSim 安装失败");
    } catch ($) {
      if (!V()) return;
      u.error($ instanceof Error ? $.message : "NeqSim 安装失败");
    }
  }, [de, _]), Te = o(
    async (y) => {
      if (y.definition.id === "neqsim") {
        (_ == null ? void 0 : _.status) === "queued" || (_ == null ? void 0 : _.status) === "running" ? (pe.current = y, k(y), N(!0)) : fe();
        return;
      }
      Y(y), I(null), H(null), M(""), re(!0);
      const V = ++J.current;
      try {
        const $ = await sr(y.definition.id);
        if (V !== J.current) return;
        I($), H($.active_task);
      } catch ($) {
        if (V !== J.current) return;
        M(
          $ instanceof Error ? $.message : "读取运行环境失败"
        );
      }
    },
    [fe, _]
  ), Ce = o(
    async (y) => {
      if (y) {
        M(y);
        return;
      }
      if (!D) return;
      M("");
      const V = ++J.current;
      try {
        const $ = await sr(
          D.definition.id
        );
        if (V !== J.current) return;
        I($), H($.active_task);
      } catch ($) {
        if (V !== J.current) return;
        M(
          $ instanceof Error ? $.message : "读取运行环境失败"
        );
      }
    },
    [D]
  ), Q = o(() => {
    de(!0, !0);
  }, [de]), Z = o(
    (y) => {
      y.definition.provider.kind === "driver" || y.definition.source === "mcp" ? _e() : y.definition.source === "library" || y.definition.provider.kind === "skill" ? Se() : ke("builtin");
    },
    [_e, Se, ke]
  );
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
        prefix: f ? r.createElement(f) : void 0,
        value: T,
        onChange: (y) => {
          const V = y.target.value;
          A(V), B(V.trim() ? {} : { general: !0 });
        },
        allowClear: !0,
        style: { maxWidth: 280 }
      }),
      r.createElement(
        m,
        {
          icon: E ? r.createElement(E) : void 0,
          onClick: le,
          loading: j
        },
        "刷新"
      )
    ),
    // Content
    j ? r.createElement(
      "div",
      { style: { textAlign: "center", padding: 60 } },
      r.createElement(d, {
        size: "large",
        tip: "正在加载领域引擎..."
      })
    ) : G.length === 0 ? r.createElement(c, {
      description: T ? "无匹配引擎" : "暂无领域引擎"
    }) : r.createElement(
      "div",
      null,
      ...P.map((y) => {
        const V = !!z[y.key];
        return r.createElement(
          "div",
          { key: y.key, style: { marginBottom: 20 } },
          r.createElement(
            m,
            {
              type: "text",
              onClick: () => B(($) => ({
                ...$,
                [y.key]: !$[y.key]
              })),
              "aria-expanded": !V,
              style: {
                fontWeight: 600,
                fontSize: 14,
                marginBottom: 8,
                paddingInline: 0
              }
            },
            `${V ? "▸" : "▾"} ${y.title} (${y.views.length})`
          ),
          V ? null : r.createElement(
            p,
            { gutter: [12, 12], align: "top" },
            ...y.views.map(
              ($) => r.createElement(
                b,
                {
                  key: $.definition.id,
                  xs: 24,
                  sm: 12,
                  md: 12,
                  lg: 12,
                  style: { display: "flex", minWidth: 0 }
                },
                r.createElement(zl, {
                  view: $,
                  onDetails: () => Ee($),
                  onInstall: () => void Te($),
                  onConfigure: () => Z($),
                  onRefresh: () => void de(!0),
                  installTask: $.definition.id === "neqsim" ? _ ? {
                    id: _.id,
                    engine_id: "neqsim",
                    status: _.status,
                    progress: _.progress,
                    message: _.message,
                    error: _.error,
                    warning: _.warning
                  } : null : (D == null ? void 0 : D.definition.id) === $.definition.id ? q : null
                })
              )
            )
          )
        );
      })
    ),
    // Detail drawer
    r.createElement(Pl, {
      view: C,
      open: F,
      onClose: () => N(!1),
      onNavigateToMcp: _e,
      onNavigateToTools: ke,
      onNavigateToSkills: Se,
      onInstallNeqsim: fe,
      neqsimInstallState: _
    }),
    r.createElement(Rl, {
      open: ne,
      engineName: (D == null ? void 0 : D.definition.name) || "领域引擎",
      plan: O,
      task: q,
      error: U,
      onClose: () => {
        J.current += 1, re(!1);
      },
      onTaskChange: H,
      onRetry: Ce,
      onCompleted: Q,
      onManage: () => {
        J.current += 1, re(!1), D && Z(D);
      }
    })
  );
}
const Ll = pl, zi = /* @__PURE__ */ new Set(["tools", "engines", "skills"]);
function Bl(e) {
  try {
    const t = new URLSearchParams(window.location.search).get("tab");
    return t && zi.has(t) ? t : e;
  } catch {
    return e;
  }
}
function ka(e) {
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
function ur({ page: e }) {
  const t = R().React, { useEffect: n, useState: r } = t, { Alert: i, Spin: a } = R().antd, [o, l] = r(null), [s, d] = r("");
  if (n(() => {
    let m = !0;
    const u = R().loadBuiltinPage;
    return l(null), u ? (d(""), u(e).then((p) => {
      m && l(() => p);
    }).catch((p) => {
      m && d(
        p instanceof Error ? p.message : "加载原生管理页面失败"
      );
    }), () => {
      m = !1;
    }) : (d("当前 QwenPaw 版本不支持原生页面嵌入"), () => {
      m = !1;
    });
  }, [e]), s)
    return t.createElement(i, {
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
        a,
        { tip: "正在加载原生管理功能..." },
        t.createElement("div", { style: { minHeight: 24 } })
      )
    );
  const c = e === "mcp" ? {
    title: "UGSci MCP",
    description: "连接外部工具、数据服务与计算能力，扩展当前专家的可调用范围",
    managedTitle: "已接入服务",
    managedDescription: "启用后可由当前专家调用，并可按工具配置访问权限",
    create: "接入 MCP 服务"
  } : void 0;
  return t.createElement(o, { embedded: !0, embeddedLabels: c });
}
function jl({
  activeSubTab: e,
  onSubTabChange: t
}) {
  const n = R().React, { Tabs: r } = R().antd;
  return n.createElement(r, {
    activeKey: e,
    onChange: t,
    items: [
      {
        key: "mcp",
        label: "MCP 接入",
        children: n.createElement(ur, { page: "mcp" })
      },
      {
        key: "builtin",
        label: "平台内置",
        children: n.createElement(ur, { page: "tools" })
      }
    ]
  });
}
function Ul({
  onNavigateToMcp: e,
  onNavigateToTools: t,
  onNavigateToSkills: n
} = {}) {
  const r = R().React, { Tabs: i } = R().antd;
  return r.createElement(i, {
    defaultActiveKey: "simulation",
    items: [
      {
        key: "simulation",
        label: "仿真软件",
        children: r.createElement(vl)
      },
      {
        key: "domain",
        label: "领域计算",
        children: r.createElement(
          Ml,
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
        children: r.createElement(ur, { page: "acp" })
      }
    ]
  });
}
function Pi({
  initialTab: e = "engines"
} = {}) {
  var f, h;
  const t = R().React, { useEffect: n, useState: r } = t, { Tabs: i, Tag: a } = R().antd, { RocketOutlined: o, ToolOutlined: l, ThunderboltOutlined: s } = R().antdIcons || {}, d = (h = (f = R()).useSelectedAgent) == null ? void 0 : h.call(f), c = (d == null ? void 0 : d.id) || "default", [m, u] = r(
    () => Bl(e)
  ), [p, b] = r("mcp");
  n(() => {
    try {
      const v = new URLSearchParams(window.location.search).get("tab");
      v && !zi.has(v) && ka(m);
    } catch {
    }
  }, [m]);
  const g = (v) => {
    u(v), ka(v);
  }, E = (v, w) => t.createElement(
    "span",
    { style: { display: "inline-flex", alignItems: "center", gap: 6 } },
    w ? t.createElement(w, { style: { fontSize: 14 } }) : null,
    v
  );
  return t.createElement(
    "div",
    { style: { padding: 24 } },
    t.createElement(Ln, {
      title: "工具·技能",
      subtitle: "管理当前专家可调用的引擎、工具、运行服务与专业技能",
      extra: t.createElement(
        a,
        { color: "blue" },
        `当前专家：${c}`
      )
    }),
    t.createElement(i, {
      activeKey: m,
      onChange: (v) => g(v),
      items: [
        {
          key: "engines",
          label: E("引擎", o),
          children: t.createElement(
            Ul,
            {
              onNavigateToMcp: () => {
                b("mcp"), g("tools");
              },
              onNavigateToTools: (v) => {
                b(v || "mcp"), g("tools");
              },
              onNavigateToSkills: () => g("skills")
            }
          )
        },
        {
          key: "tools",
          label: E("工具", l),
          children: t.createElement(jl, {
            activeSubTab: p,
            onSubTabChange: b
          })
        },
        {
          key: "skills",
          label: E("技能", s),
          children: t.createElement(Ll, {
            embedded: !0
          })
        }
      ]
    })
  );
}
const Ri = Pi;
function Nl() {
  return R().React.createElement(Ri, {
    initialTab: "tools"
  });
}
function Dl() {
  return R().React.createElement(Ri, {
    initialTab: "skills"
  });
}
function vt(e) {
  if (e)
    try {
      const t = new URL(e);
      if (t.username || t.password) return;
      if (t.protocol === "https:" || t.protocol === "http:" && ["localhost", "127.0.0.1", "[::1]"].includes(t.hostname)) return t.href;
    } catch {
    }
}
function Fl(e, t = !1) {
  const n = String(e || "").trim().toLowerCase().replace(/[-_]/g, "");
  if (n === "sse") return "sse";
  if (n === "stdio") return "stdio";
  if (n === "streamablehttp" || n === "http" || !n && t) return "streamable_http";
  if (!n) return "stdio";
  throw new Error("不支持的 MCP 连接方式，请检查目录配置");
}
function Gl(e) {
  return [...new Set([...JSON.stringify(e).matchAll(/\$\{([A-Za-z_][A-Za-z0-9_]*)\}/g)].map((t) => t[1]))];
}
function Wl(e, t) {
  const n = (a, o = !1) => a.replace(/\$\{([A-Za-z_][A-Za-z0-9_]*)\}/g, (l, s) => {
    const d = t[s];
    if (!(d != null && d.trim())) throw new Error(`请填写配置项：${s}`);
    return o ? encodeURIComponent(d) : d;
  });
  let r = e.url;
  if (r) {
    const a = r.indexOf("?");
    r = a < 0 ? n(r) : n(r.slice(0, a)) + "?" + n(r.slice(a + 1), !0);
    const o = new URL(r);
    if (!["https:", "http:"].includes(o.protocol) || o.username || o.password) throw new Error("请输入有效的 HTTP MCP 地址");
    if (o.protocol === "http:" && !["localhost", "127.0.0.1", "[::1]"].includes(o.hostname)) throw new Error("远程 MCP 请使用 HTTPS 地址");
    if (o.hash) throw new Error("MCP 地址不能包含片段标识");
  }
  const i = Object.fromEntries(Object.entries(e.headers || {}).map(([a, o]) => {
    const l = n(o);
    if (/[\r\n]/.test(a + l)) throw new Error("请求头不能包含换行");
    return [a, l];
  }));
  return {
    ...e,
    url: r,
    command: n(e.command || ""),
    args: (e.args || []).map((a) => n(a)),
    cwd: n(e.cwd || ""),
    headers: i,
    env: Object.fromEntries(Object.entries(e.env || {}).map(([a, o]) => [a, n(o)]))
  };
}
function Hl(e, t = Date.now, n = 6e4) {
  const r = /* @__PURE__ */ new Map(), i = /* @__PURE__ */ new Map(), a = /* @__PURE__ */ new Set();
  function o(l, s, d) {
    const c = i.get(l);
    if (c)
      return !s || c.refresh ? c.promise : c.promise.then(
        () => o(l, !0, d),
        () => o(l, !0, d)
      );
    let m = !1;
    const u = Promise.resolve().then(async () => {
      const p = await e(l, s);
      if (!p.ok) throw new Error(`OSS fetch failed (${p.status}): ${l}`);
      const b = await p.text(), g = JSON.parse(b), E = r.get(l);
      if (r.set(l, { value: g, text: b, at: t() }), m = !s && p.headers.get("X-QwenPaw-Cache") === "stale", d && (E == null ? void 0 : E.text) !== b)
        for (const f of a) f();
      return g;
    }).catch((p) => {
      const b = r.get(l);
      throw b && (b.at = t() - n + Math.min(15e3, n)), p;
    }).finally(() => {
      var p;
      ((p = i.get(l)) == null ? void 0 : p.promise) === u && i.delete(l), m && o(l, !0, !0).catch(() => {
      });
    });
    return i.set(l, { promise: u, refresh: s }), u;
  }
  return {
    get(l, s = !1) {
      const d = r.get(l);
      return d && !s ? (t() - d.at >= n && o(l, !0, !0).catch(() => {
      }), Promise.resolve(d.value)) : o(l, s, !1);
    },
    subscribe(l) {
      return a.add(l), () => {
        a.delete(l);
      };
    }
  };
}
const Ca = {
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
}, kn = "ugsci.market.githubSources", Ta = "https://github.com/anthropics/skills/tree/main/skills", Oi = "https://ugsci-awesome-tools.oss-cn-beijing.aliyuncs.com", ql = `${Oi}/skills`;
function Jl(e) {
  const t = e.replace(/^\/+/, "");
  return On(`/plugins/oss-proxy?path=${encodeURIComponent(t)}`);
}
function an(e, t = !1) {
  const n = e.replace(/^\/+/, "");
  return ct(`/plugins/oss-proxy?path=${encodeURIComponent(n)}${t ? "&refresh=true" : ""}`, { cache: t ? "no-store" : "no-cache" });
}
const Mi = Hl(an), Vl = Mi.subscribe;
async function Ar(e, t = !1) {
  const n = e.replace(/^\/+/, "");
  if (/^(skills|mcp|agents)\/manifest\.json$/.test(n))
    return Mi.get(n, t);
  const r = await an(n, t);
  if (!r.ok)
    throw new Error(`OSS fetch failed (${r.status}): ${n}`);
  return await r.json();
}
function Mt(e) {
  return {
    domain: "领域",
    research: "科研与文献",
    workflow: "工作流",
    computation: "计算与数据",
    integration: "集成与工具",
    type: "类型",
    capability: "能力",
    tooling: "工具链"
  }[e] || e;
}
function Kl(e) {
  var a, o, l, s;
  const t = {}, n = e.config || {};
  for (const d of /* @__PURE__ */ new Set([...e.env || [], ...Gl(n)]))
    t[d] = `your-${d.toLowerCase().replace(/_/g, "-")}`;
  for (const [d, c] of Object.entries(n.env || {}))
    t[d] || (t[d] = c);
  let r = "🔌";
  const i = (e.icon || "").toLowerCase();
  return i.includes("folder") ? r = "📁" : i.includes("git") ? r = "🌿" : i.includes("github") ? r = "🐙" : i.includes("database") || i.includes("postgres") || i.includes("sqlite") ? r = "🗄️" : i.includes("search") || i.includes("brave") ? r = "🔍" : i.includes("browser") || i.includes("puppeteer") ? r = "🎭" : i.includes("memory") || i.includes("brain") ? r = "🧠" : i.includes("file") || i.includes("fetch") ? r = "🌐" : i.includes("slack") ? r = "💬" : i.includes("google") ? r = "📁" : i.includes("notion") ? r = "📝" : i.includes("jupyter") ? r = "📊" : i.includes("science") || i.includes("flask") ? r = "🔬" : i.includes("book") || i.includes("arxiv") ? r = "📚" : i.includes("patent") && (r = "📜"), {
    id: e.id,
    name: e.name,
    emoji: r,
    iconUrl: e.icon_url ? Jl(e.icon_url) : void 0,
    category: e.category ? Mt(e.category) : "",
    description: e.description,
    transport: Fl(e.transport || n.transport || n.type, !!n.url),
    url: n.url,
    headers: n.headers,
    cwd: n.cwd,
    source: e.source,
    authType: (a = e.auth) == null ? void 0 : a.type,
    setupUrl: (o = e.auth) == null ? void 0 : o.setup_url,
    availability: e.availability,
    requirements: e.requirements,
    limitations: e.limitations,
    inputHints: e.input_hints,
    command: ((l = e.config) == null ? void 0 : l.command) || "",
    args: ((s = e.config) == null ? void 0 : s.args) || [],
    env: Object.keys(t).length > 0 ? t : void 0
  };
}
const Li = "ugsci.market.mcpSources", Bi = "ugsci.market.expertSources";
function ji(e, t) {
  try {
    const n = localStorage.getItem(e);
    if (!n) return [];
    const r = JSON.parse(n);
    return Array.isArray(r) ? r.filter(
      (i) => i && typeof i.id == "string" && typeof i.label == "string" && typeof i.url == "string"
    ).map((i) => ({
      id: i.id,
      label: i.label,
      url: i.url,
      enabled: i.enabled !== !1,
      type: t
    })) : [];
  } catch {
    return [];
  }
}
function Ui(e, t) {
  try {
    localStorage.setItem(e, JSON.stringify(t));
  } catch {
  }
}
function Xl() {
  return ji(Li, "mcp");
}
function yn(e) {
  Ui(Li, e);
}
function Yl() {
  return ji(Bi, "expert");
}
function hn(e) {
  Ui(Bi, e);
}
function Ni(e) {
  try {
    const t = new URL(e.trim()), n = t.hostname.toLowerCase();
    let r;
    if (n === "github.com" || n === "www.github.com")
      r = "github";
    else if (n === "gitee.com" || n === "www.gitee.com")
      r = "gitee";
    else
      return null;
    const i = t.pathname.split("/").filter((d) => d.length > 0);
    if (i.length < 2) return null;
    const a = decodeURIComponent(i[0]), o = decodeURIComponent(i[1]);
    let l = "main", s = "";
    return i.length >= 4 && (i[2] === "tree" || i[2] === "blob") ? (l = decodeURIComponent(i[3]), i.length > 4 && (s = i.slice(4).map(decodeURIComponent).join("/"))) : i.length > 2 && (s = i.slice(2).map(decodeURIComponent).join("/")), s = s.replace(/\/+$/, "").replace(/^\/+/, ""), {
      owner: a,
      repo: o,
      ref: l || "main",
      skillsPath: s,
      label: `${a}/${o}`,
      platform: r
    };
  } catch {
    return null;
  }
}
function Di(e, t, n, r = "github") {
  return r === "oss" ? `oss:${e}/${n || "/"}` : `${r}:${e}/${t}:${n || "/"}`;
}
function Zl(e) {
  try {
    const t = new URL(e.trim()), n = t.hostname.toLowerCase(), r = n.match(
      /^([a-z0-9][a-z0-9-]{1,61}[a-z0-9])\.oss-([a-z0-9-]+)\.aliyuncs\.com$/
    );
    if (!r) return null;
    const i = r[1], a = `${t.protocol}//${n}`, o = decodeURIComponent(t.pathname).replace(/^\/+/, "").replace(/\/+$/, "");
    return o ? {
      endpoint: a,
      prefix: o,
      label: "UGSci",
      platform: "oss"
    } : null;
  } catch {
    return null;
  }
}
function Ql() {
  try {
    const e = localStorage.getItem(kn);
    if (!e) {
      const r = [], i = Ni(Ta);
      return i && r.push({
        id: Di(
          i.owner,
          i.repo,
          i.skillsPath,
          i.platform
        ),
        url: Ta,
        label: i.label,
        owner: i.owner,
        repo: i.repo,
        ref: i.ref,
        skillsPath: i.skillsPath,
        enabled: !1,
        platform: i.platform
      }), localStorage.setItem(kn, JSON.stringify(r)), r;
    }
    const t = JSON.parse(e);
    if (!Array.isArray(t)) return [];
    const n = t.filter(
      (r) => r && typeof r.id == "string" && (typeof r.owner == "string" || r.platform === "oss") && !(r.platform === "oss" && r.url === ql)
    ).map((r) => ({
      ...r,
      platform: r.platform || "github",
      owner: r.owner || "",
      repo: r.repo || "",
      ref: r.ref || "",
      skillsPath: r.skillsPath || ""
    }));
    return n.length !== t.length && localStorage.setItem(
      kn,
      JSON.stringify(n)
    ), n;
  } catch {
    return [];
  }
}
function En(e) {
  try {
    localStorage.setItem(
      kn,
      JSON.stringify(e)
    );
  } catch {
  }
}
function ec(e) {
  const t = e.match(/^---\s*\n([\s\S]*?)\n---/);
  if (!t) return {};
  const n = t[1], r = {}, i = n.split(`
`);
  let a = "";
  for (const o of i) {
    const l = o.match(/^(\w[\w-]*)\s*:\s*(.*)$/);
    if (l) {
      a = l[1];
      let s = l[2].trim();
      (s.startsWith('"') && s.endsWith('"') || s.startsWith("'") && s.endsWith("'")) && (s = s.slice(1, -1)), a === "name" ? r.name = s : a === "description" ? r.description = s : a === "version" ? r.version = s : a === "author" && (r.author = s);
    }
  }
  return r;
}
async function tc(e) {
  const t = e.platform === "gitee", n = e.skillsPath ? encodeURIComponent(e.skillsPath).replace(/%2F/g, "/") : "", r = t ? `https://gitee.com/api/v5/repos/${e.owner}/${e.repo}/contents/${n}?ref=${encodeURIComponent(e.ref)}` : `https://api.github.com/repos/${e.owner}/${e.repo}/contents/${n}?ref=${encodeURIComponent(e.ref)}`, i = {
    Accept: t ? "application/json" : "application/vnd.github+json"
  };
  t && e.accessToken && (i.Authorization = `token ${e.accessToken}`);
  const a = await fetch(r, {
    headers: i
  });
  if (!a.ok)
    throw new Error(
      `${t ? "Gitee" : "GitHub"} API ${a.status}: ${e.label} (${e.skillsPath || "/"})`
    );
  const o = await a.json();
  if (!Array.isArray(o)) return [];
  const l = o.filter(
    (d) => d.type === "dir" && d.name
  );
  return await Promise.all(
    l.map(async (d) => {
      const c = e.skillsPath ? e.skillsPath + "/" : "", m = t ? `https://gitee.com/${e.owner}/${e.repo}/raw/${e.ref}/${c}${d.name}/SKILL.md` : `https://raw.githubusercontent.com/${e.owner}/${e.repo}/${e.ref}/${c}${d.name}/SKILL.md`, u = t ? `https://gitee.com/${e.owner}/${e.repo}/tree/${e.ref}/${c}${d.name}` : `https://github.com/${e.owner}/${e.repo}/tree/${e.ref}/${c}${d.name}`, p = {
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
        const b = {};
        t && e.accessToken && (b.Authorization = `token ${e.accessToken}`);
        const g = await fetch(m, {
          headers: b
        });
        if (!g.ok) return p;
        const E = await g.text(), f = ec(E);
        return {
          ...p,
          name: f.name || d.name,
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
async function nc(e) {
  const t = Zl(e.url);
  if (!t)
    throw new Error(`Invalid OSS URL: ${e.url}`);
  const { endpoint: n, prefix: r } = t, i = r.split("/").map(encodeURIComponent).join("/"), a = await an(
    `${i}/manifest.json`
  );
  if (!a.ok)
    throw new Error(
      `无法获取技能列表: manifest.json (${a.status})`
    );
  const o = await a.json(), l = [];
  if (o && o.tag_groups && typeof o.tag_groups == "object")
    for (const [c, m] of Object.entries(o.tag_groups))
      Array.isArray(m) && l.push({
        id: c,
        label: Mt(c),
        tags: m
      });
  const s = [];
  function d(c, m) {
    for (const u of c) {
      if (u.type === "collection" && Array.isArray(u.children)) {
        d(u.children, u.name);
        continue;
      }
      const p = u.path || u.name || "";
      if (!p) continue;
      const b = p.split("/").map(encodeURIComponent).join("/"), g = `${n}/${i}/${b}`;
      let E = null;
      if (u.metadata) {
        const h = u.metadata.match(/version:\s*"?([\d.]+)"?/);
        h && (E = h[1]);
      }
      const f = m ? `${e.label}/${m}` : e.label;
      s.push({
        sourceId: e.id,
        sourceLabel: e.label,
        sourcePath: f,
        name: u.name || p.split("/").pop() || p,
        description: u.description || "",
        source_url: g,
        html_url: g,
        version: E,
        author: null,
        tag: u.tag || void 0,
        isOfficial: !0
      });
    }
  }
  if (Array.isArray(o) ? d(
    o.map(
      (c) => typeof c == "string" ? { name: c, path: c } : c
    )
  ) : o && Array.isArray(o.skills) && d(o.skills), s.length === 0)
    throw new Error(
      `manifest.json 中未找到技能。请检查 ${e.url}/manifest.json`
    );
  return { skills: s, categories: l };
}
async function rc(e = !1) {
  const t = await Ar("mcp/manifest.json", e), n = [], r = {};
  if (t.tag_groups && typeof t.tag_groups == "object")
    for (const [a, o] of Object.entries(t.tag_groups))
      Array.isArray(o) && (r[a] = o, n.push({
        id: a,
        label: Mt(a),
        tags: o
      }));
  return { servers: (t.servers || []).map((a) => {
    var s, d, c;
    let o = "";
    const l = a.tags || [];
    for (const [m, u] of Object.entries(r))
      if (u.some((p) => l.includes(p))) {
        o = m;
        break;
      }
    return {
      id: a.id || a.name,
      name: a.name || a.id,
      description: a.description || "",
      tags: l,
      transport: a.transport || ((s = a.config) == null ? void 0 : s.transport) || ((d = a.config) == null ? void 0 : d.type) || ((c = a.config) != null && c.url ? "streamable_http" : "stdio"),
      input_hints: a.input_hints,
      requirements: a.requirements,
      limitations: a.limitations,
      auth: a.auth,
      availability: a.availability,
      config: a.config,
      env: Array.isArray(a.env) ? a.env : void 0,
      source: a.source,
      icon: a.icon,
      icon_url: a.icon_url || a.icon_path || void 0,
      category: o
    };
  }), categories: n };
}
async function ac(e = !1) {
  const t = await Ar("skills/manifest.json", e), n = [], r = /* @__PURE__ */ new Set();
  function i(a, o) {
    for (const l of a) {
      if ((l == null ? void 0 : l.type) === "collection" && Array.isArray(l.children)) {
        i(l.children, l.name || o);
        continue;
      }
      const s = String((l == null ? void 0 : l.path) || (l == null ? void 0 : l.name) || "").trim();
      if (!s) continue;
      const d = s.split("/").map(encodeURIComponent).join("/"), c = `${Oi}/skills/${d}`, m = typeof l.tag == "string" && l.tag.trim() ? l.tag.trim() : void 0;
      m && r.add(m);
      let u = null;
      if (typeof l.metadata == "string") {
        const p = l.metadata.match(/version:\s*"?([\d.]+)"?/);
        p && (u = p[1]);
      }
      n.push({
        sourceId: "oss:ugsci-official",
        sourceLabel: "UGSci",
        sourcePath: o ? `UGSci/${o}` : "UGSci",
        name: l.name || s.split("/").pop() || s,
        description: l.description || "",
        source_url: c,
        html_url: c,
        version: u,
        author: null,
        tag: m,
        isOfficial: !0
      });
    }
  }
  if (Array.isArray(t) ? i(
    t.map(
      (a) => typeof a == "string" ? { name: a, path: a } : a
    )
  ) : t && Array.isArray(t.skills) && i(t.skills), n.length === 0)
    throw new Error("OSS 技能清单中没有可用技能");
  return {
    skills: n,
    categories: Array.from(r).map((a) => ({
      id: a,
      label: a
    }))
  };
}
async function Fi(e = !1) {
  const t = await Ar("agents/manifest.json", e), n = [], r = {};
  if (t.tag_groups && typeof t.tag_groups == "object")
    for (const [a, o] of Object.entries(t.tag_groups))
      Array.isArray(o) && (r[a] = o, n.push({
        id: a,
        label: Mt(a),
        tags: o
      }));
  return { agents: (t.agents || []).map((a) => {
    let o = "";
    const l = a.tags || [];
    for (const [s, d] of Object.entries(r))
      if (d.some((c) => l.includes(c))) {
        o = s;
        break;
      }
    return {
      id: a.id || a.name,
      name: a.name || a.id,
      description: a.description || "",
      path: a.path || "",
      tags: l,
      config: a.config,
      instructions: a.instructions,
      skills_manifest: a.skills_manifest,
      drivers: a.drivers,
      category: o
    };
  }), categories: n };
}
async function ic(e) {
  const t = e.filter((o) => o.enabled), n = await Promise.all(
    t.map(async (o) => {
      try {
        if (o.platform === "oss") {
          const { skills: l, categories: s } = await nc(o);
          return { skills: l, categories: s, error: null, label: o.label };
        } else
          return { skills: await tc(o), categories: [], error: null, label: o.label };
      } catch (l) {
        return {
          skills: [],
          categories: [],
          error: l.message || String(l),
          label: o.label
        };
      }
    })
  ), r = [], i = [], a = [];
  for (const o of n)
    r.push(...o.skills), i.push(...o.categories), o.error && a.push({ label: o.label, message: o.error });
  return { skills: r, errors: a, categories: i };
}
function oc({
  open: e,
  onClose: t,
  sources: n,
  onChange: r
}) {
  const i = R().React, { useState: a } = i, {
    Modal: o,
    Input: l,
    Button: s,
    List: d,
    Tag: c,
    Switch: m,
    Typography: u,
    Tooltip: p,
    message: b
  } = R().antd, {
    PlusOutlined: g,
    DeleteOutlined: E,
    LinkOutlined: f,
    GithubOutlined: h
  } = R().antdIcons || {}, { Text: v } = u, [w, x] = a(""), [j, X] = a(""), T = () => {
    const C = w.trim();
    if (!C) return;
    const k = Ni(C);
    if (!k) {
      b.error("无效的仓库 URL，请输入类似 https://github.com/owner/repo/tree/main/skills 或 https://gitee.com/owner/repo/tree/master/skills 的链接");
      return;
    }
    const z = Di(k.owner, k.repo, k.skillsPath, k.platform);
    if (n.some((L) => L.id === z)) {
      b.warning("该源已存在");
      return;
    }
    const B = {
      id: z,
      url: C,
      label: k.label,
      owner: k.owner,
      repo: k.repo,
      ref: k.ref,
      skillsPath: k.skillsPath,
      enabled: !0,
      platform: k.platform,
      accessToken: j.trim() || void 0
    }, _ = [...n, B];
    En(_), r(_), x(""), X(""), b.success(`已添加源: ${k.label}`);
  }, A = (C, k) => {
    const z = n.map(
      (B) => B.id === C ? { ...B, enabled: k } : B
    );
    En(z), r(z);
  }, F = (C, k) => {
    const z = n.map(
      (B) => B.id === C ? { ...B, accessToken: k.trim() || void 0 } : B
    );
    En(z), r(z);
  }, N = (C) => {
    const k = n.filter((z) => z.id !== C);
    En(k), r(k), b.success("已移除源");
  };
  return i.createElement(
    o,
    {
      open: e,
      onCancel: t,
      title: i.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 8 } },
        h ? i.createElement(h, { style: { fontSize: 18 } }) : null,
        i.createElement("span", null, "配置技能源")
      ),
      footer: i.createElement(
        s,
        { onClick: t },
        "关闭"
      ),
      width: 640
    },
    i.createElement(
      "div",
      { style: { marginBottom: 16 } },
      i.createElement(
        v,
        { type: "secondary", style: { fontSize: 12, display: "block", marginBottom: 8 } },
        "添加 GitHub 或 Gitee 仓库作为技能源，系统将从该仓库的指定目录获取技能列表。支持格式："
      ),
      i.createElement(
        "div",
        { style: { display: "flex", gap: 8, alignItems: "center" } },
        i.createElement(l, {
          placeholder: "https://github.com/owner/repo/tree/main/skills 或 https://gitee.com/owner/repo/tree/master/skills",
          value: w,
          onChange: (C) => x(C.target.value),
          onPressEnter: T,
          prefix: f ? i.createElement(f) : void 0,
          style: { flex: 1 }
        }),
        i.createElement(
          s,
          {
            type: "primary",
            icon: g ? i.createElement(g) : void 0,
            onClick: T
          },
          "添加"
        )
      ),
      // Gitee token input (shown when URL looks like a Gitee link)
      w.trim() && w.trim().toLowerCase().includes("gitee.com") ? i.createElement(
        "div",
        { style: { marginTop: 8, display: "flex", gap: 8, alignItems: "center" } },
        i.createElement(
          v,
          { type: "secondary", style: { fontSize: 12, whiteSpace: "nowrap" } },
          "Gitee Token:"
        ),
        i.createElement(l.Password, {
          placeholder: "私有仓库请填写 Gitee 私人令牌（可选）",
          value: j,
          onChange: (C) => X(C.target.value),
          style: { flex: 1 }
        })
      ) : null
    ),
    i.createElement(
      "div",
      { style: { marginBottom: 8, display: "flex", alignItems: "center", justifyContent: "space-between" } },
      i.createElement(v, { strong: !0 }, `已配置源 (${n.length})`)
    ),
    i.createElement(d, {
      size: "small",
      bordered: !0,
      dataSource: n,
      renderItem: (C) => i.createElement(
        d.Item,
        {
          actions: [
            i.createElement(
              p,
              { title: C.enabled ? "点击禁用" : "点击启用" },
              i.createElement(m, {
                size: "small",
                checked: C.enabled,
                onChange: (k) => A(C.id, k)
              })
            ),
            i.createElement(
              p,
              { title: "移除此源" },
              i.createElement(
                s,
                {
                  size: "small",
                  type: "text",
                  danger: !0,
                  icon: E ? i.createElement(E) : void 0,
                  onClick: () => N(C.id)
                }
              )
            )
          ]
        },
        i.createElement(
          "div",
          { style: { flex: 1, minWidth: 0 } },
          i.createElement(
            "div",
            { style: { display: "flex", alignItems: "center", gap: 6, marginBottom: 4 } },
            i.createElement(
              c,
              { color: C.platform === "gitee" ? "orange" : C.platform === "oss" ? "green" : "blue", style: { fontSize: 11 } },
              C.platform === "gitee" ? "Gitee" : C.platform === "oss" ? "OSS" : "GitHub"
            ),
            i.createElement(
              c,
              { style: { fontSize: 11 } },
              C.label
            ),
            C.skillsPath ? i.createElement(
              v,
              { type: "secondary", style: { fontSize: 11 } },
              `/${C.skillsPath}`
            ) : null,
            C.platform !== "oss" ? i.createElement(
              v,
              { type: "secondary", style: { fontSize: 11 } },
              `@${C.ref}`
            ) : null
          ),
          i.createElement(
            v,
            {
              type: "secondary",
              style: { fontSize: 11, wordBreak: "break-all" }
            },
            C.url
          ),
          // Gitee token input for existing Gitee sources
          C.platform === "gitee" ? i.createElement(
            "div",
            { style: { marginTop: 6, display: "flex", gap: 6, alignItems: "center" } },
            i.createElement(
              v,
              { type: "secondary", style: { fontSize: 11, whiteSpace: "nowrap" } },
              "Token:"
            ),
            i.createElement(l.Password, {
              size: "small",
              placeholder: "Gitee 私人令牌（可选，用于私有仓库）",
              value: C.accessToken || "",
              onChange: (k) => F(C.id, k.target.value),
              style: { flex: 1 }
            })
          ) : null
        )
      )
    })
  );
}
function Ia({
  open: e,
  onClose: t,
  sources: n,
  onChange: r,
  type: i
}) {
  const a = R().React, { useState: o } = a, {
    Modal: l,
    Input: s,
    Button: d,
    List: c,
    Tag: m,
    Switch: u,
    Typography: p,
    Tooltip: b,
    message: g
  } = R().antd, {
    PlusOutlined: E,
    DeleteOutlined: f,
    LinkOutlined: h,
    ApiOutlined: v,
    UserOutlined: w,
    ImportOutlined: x,
    ExportOutlined: j,
    CopyOutlined: X
  } = R().antdIcons || {}, { Text: T } = p, [A, F] = o(""), [N, C] = o(""), [k, z] = o(""), [B, _] = o(!1), L = i === "mcp" ? "MCP" : "专家模板", D = i === "mcp" ? v ? a.createElement(v, { style: { fontSize: 18 } }) : null : w ? a.createElement(w, { style: { fontSize: 18 } }) : null, Y = () => {
    const U = A.trim(), M = N.trim();
    if (!U) return;
    const ne = M || U.slice(0, 40), re = `${i}:${U}`;
    if (n.some((ae) => ae.id === re)) {
      g.warning("该源已存在");
      return;
    }
    const K = {
      id: re,
      label: ne,
      url: U,
      enabled: !0,
      type: i
    }, pe = [...n, K];
    i === "mcp" ? yn(pe) : hn(pe), r(pe), F(""), C(""), g.success(`已添加${L}源: ${ne}`);
  }, O = (U, M) => {
    const ne = n.map(
      (re) => re.id === U ? { ...re, enabled: M } : re
    );
    i === "mcp" ? yn(ne) : hn(ne), r(ne);
  }, I = (U) => {
    const M = n.filter((ne) => ne.id !== U);
    i === "mcp" ? yn(M) : hn(M), r(M), g.success("已移除源");
  }, q = () => {
    const U = JSON.stringify(
      { type: i, sources: n },
      null,
      2
    );
    try {
      navigator.clipboard.writeText(U), g.success(`${L}源已复制到剪贴板（${n.length} 个源）`);
    } catch {
      const M = document.createElement("textarea");
      M.value = U, document.body.appendChild(M), M.select(), document.execCommand("copy"), document.body.removeChild(M), g.success(`${L}源已复制到剪贴板（${n.length} 个源）`);
    }
  }, H = () => {
    const U = k.trim();
    if (!U) {
      g.warning("请粘贴 JSON 内容");
      return;
    }
    try {
      const M = JSON.parse(U);
      let ne = [];
      if (Array.isArray(M))
        ne = M;
      else if (M && Array.isArray(M.sources))
        ne = M.sources;
      else if (M && typeof M == "object")
        ne = [M];
      else
        throw new Error("Invalid format");
      const re = ne.filter(
        (J) => J && typeof J.url == "string" && typeof J.label == "string"
      );
      if (re.length === 0) {
        g.error("未找到有效的源数据");
        return;
      }
      const K = new Set(n.map((J) => J.id)), pe = [];
      for (const J of re) {
        const de = J.id || `${i}:${J.url}`;
        K.has(de) || pe.push({
          id: de,
          label: J.label,
          url: J.url,
          enabled: J.enabled !== !1,
          type: i
        });
      }
      if (pe.length === 0) {
        g.info("所有源均已存在，无新增");
        return;
      }
      const ae = [...n, ...pe];
      i === "mcp" ? yn(ae) : hn(ae), r(ae), z(""), _(!1), g.success(`成功导入 ${pe.length} 个${L}源`);
    } catch (M) {
      g.error(`JSON 解析失败: ${M.message || "格式错误"}`);
    }
  };
  return a.createElement(
    l,
    {
      open: e,
      onCancel: t,
      title: a.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 8 } },
        D,
        a.createElement("span", null, `配置${L}源`)
      ),
      footer: a.createElement(
        "div",
        { style: { display: "flex", justifyContent: "space-between" } },
        a.createElement(
          "div",
          { style: { display: "flex", gap: 8 } },
          a.createElement(
            d,
            {
              icon: j ? a.createElement(j) : void 0,
              onClick: q,
              disabled: n.length === 0,
              size: "small"
            },
            "导出到剪贴板"
          ),
          a.createElement(
            d,
            {
              icon: x ? a.createElement(x) : void 0,
              onClick: () => _(!B),
              size: "small"
            },
            B ? "隐藏导入" : "导入JSON"
          )
        ),
        a.createElement(
          d,
          { onClick: t },
          "关闭"
        )
      ),
      width: 680
    },
    // Description
    a.createElement(
      T,
      { type: "secondary", style: { fontSize: 12, display: "block", marginBottom: 12 } },
      `配置${L}源地址，支持从远程仓库或团队共享的 JSON 导入${L}配置。`
    ),
    // Import section (collapsible)
    B ? a.createElement(
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
      a.createElement(
        T,
        { strong: !0, style: { fontSize: 12, display: "block", marginBottom: 8 } },
        `粘贴${L}源 JSON（支持从导出的剪贴板内容粘贴）`
      ),
      a.createElement(s.TextArea, {
        placeholder: i === "mcp" ? `{
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
        onChange: (U) => z(U.target.value),
        autoSize: { minRows: 4, maxRows: 10 },
        style: { fontFamily: "monospace", fontSize: 12 }
      }),
      a.createElement(
        "div",
        { style: { marginTop: 8, display: "flex", gap: 8 } },
        a.createElement(
          d,
          {
            type: "primary",
            size: "small",
            onClick: H
          },
          "导入"
        ),
        a.createElement(
          d,
          {
            size: "small",
            onClick: () => z("")
          },
          "清空"
        )
      )
    ) : null,
    // Add new source
    a.createElement(
      "div",
      { style: { marginBottom: 16, display: "flex", gap: 8, alignItems: "center" } },
      a.createElement(s, {
        placeholder: "源名称（可选，如：团队MCP仓库）",
        value: N,
        onChange: (U) => C(U.target.value),
        style: { width: 200 }
      }),
      a.createElement(s, {
        placeholder: i === "mcp" ? "https://raw.githubusercontent.com/team/mcp-registry/main/mcp.json" : "https://raw.githubusercontent.com/team/expert-registry/main/experts.json",
        value: A,
        onChange: (U) => F(U.target.value),
        onPressEnter: Y,
        prefix: h ? a.createElement(h) : void 0,
        style: { flex: 1 }
      }),
      a.createElement(
        d,
        {
          type: "primary",
          icon: E ? a.createElement(E) : void 0,
          onClick: Y
        },
        "添加"
      )
    ),
    // Source list
    a.createElement(
      "div",
      {
        style: {
          marginBottom: 8,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between"
        }
      },
      a.createElement(
        T,
        { strong: !0 },
        `已配置源 (${n.length})`
      )
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
              b,
              { title: U.enabled ? "点击禁用" : "点击启用" },
              a.createElement(u, {
                size: "small",
                checked: U.enabled,
                onChange: (M) => O(U.id, M)
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
                  icon: f ? a.createElement(f) : void 0,
                  onClick: () => I(U.id)
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
            {
              style: {
                display: "flex",
                alignItems: "center",
                gap: 6,
                marginBottom: 4
              }
            },
            a.createElement(
              m,
              {
                color: i === "mcp" ? "purple" : "blue",
                style: { fontSize: 11 }
              },
              U.label
            ),
            U.enabled ? null : a.createElement(
              m,
              { style: { fontSize: 10 } },
              "已禁用"
            )
          ),
          a.createElement(
            T,
            {
              type: "secondary",
              style: { fontSize: 11, wordBreak: "break-all" }
            },
            U.url
          )
        )
      )
    }),
    // Share hint
    a.createElement(
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
      a.createElement(
        "span",
        null,
        "💡 ",
        "点击「导出到剪贴板」可复制所有源配置，分享给团队成员后粘贴到「导入JSON」即可快速配置。"
      )
    )
  );
}
function sc({ template: e, agentId: t, agentName: n, existing: r, onSaved: i, onConnected: a, onClose: o }) {
  var Q;
  const { React: l, antd: s, openExternalLink: d } = R(), { useState: c, useRef: m, useEffect: u } = l, { Modal: p, Button: b, Input: g, Alert: E, Tag: f } = s, h = l.createElement, v = e.authType === "oauth2", w = Object.entries(e.env || {}).filter(([, Z]) => Z.startsWith("your-") || Z.includes("${")), [x, j] = c({}), [X, T] = c(r), [A, F] = c(r ? "saved" : "config"), [N, C] = c(""), [k, z] = c(""), [B, _] = c(""), [L, D] = c(!1), [Y, O] = c(""), [I, q] = c(""), [H, U] = c(0), M = m(!0), ne = m(0), re = m(""), K = { "Content-Type": "application/json", "X-Agent-Id": t }, pe = encodeURIComponent(e.id), ae = (Z, ce = {}) => me(Z, { ...ce, headers: K, cache: "no-store", bypassCache: !0 }), J = (Z) => Z ? ae(`/mcp/oauth/session/${pe}?session_id=${encodeURIComponent(Z)}`, { method: "DELETE" }).then(() => !0, () => !1) : Promise.resolve(!0);
  u(() => (M.current = !0, () => {
    M.current = !1, ne.current += 1, J(re.current);
  }), []);
  const de = (Z) => M.current && ne.current === Z, G = (Z) => {
    const ce = vt(Z);
    if (!ce) throw new Error("授权服务返回的登录地址无效，请联系服务提供方。");
    d ? d(ce) : window.open(ce, "_blank", "noopener,noreferrer");
  }, P = async (Z, ce = ++ne.current) => {
    C(""), F("checking");
    try {
      if (v) {
        const V = await ae(`/mcp/oauth/status/${pe}`);
        if (!de(ce)) return;
        if (!V.authorized) {
          F("saved"), C("账号尚未授权或授权已过期，请点击登录授权。");
          return;
        }
      }
      const he = await ae(`/mcp/${pe}`, { method: "PUT", body: JSON.stringify({ enabled: !0 }) });
      if (!de(ce)) return;
      T({ ...Z, ...he, enabled: !0 }), i({ ...Z, ...he, enabled: !0 });
      const y = await ae(`/mcp/tools/${pe}`);
      if (!de(ce)) return;
      if (!Array.isArray(y) || y.length === 0) {
        C("配置已启用，但服务尚未返回可用工具。可稍后重新检测，或检查账号权限和服务接入要求。"), F("error");
        return;
      }
      U(y.length), F("connected"), a();
    } catch {
      if (!de(ce)) return;
      F("error"), C(v ? "账号授权后，工具连接检测未通过。请检查网络或服务账号权限后重试；授权失效可重新登录。" : "配置已保存，工具连接检测未通过。请检查网络、密钥权限或本地运行环境后重试。");
    }
  }, le = async (Z, ce = ++ne.current) => {
    F("starting"), C(""), z("");
    const he = re.current;
    if (re.current = "", _(""), await J(he), !!de(ce))
      try {
        const y = await ae(`/mcp/oauth/start/${pe}`, {
          // The backend uses the saved endpoint, including securely stored URL credentials.
          method: "POST",
          body: JSON.stringify({ url: "", client_id: Y.trim(), scope: I.trim() })
        });
        if (!de(ce)) {
          J(y.session_id);
          return;
        }
        if (!y.session_id || !vt(y.auth_url)) throw new Error("Invalid authorization response");
        re.current = y.session_id, _(y.session_id), z(y.auth_url), F("waiting"), G(y.auth_url);
      } catch {
        if (!de(ce)) return;
        F("error"), C("无法发起登录授权。请确认服务支持标准 MCP OAuth；若服务要求预先注册客户端，可在高级设置填写客户端 ID，或查看服务接入说明后重试。");
      }
  };
  u(() => {
    if (A !== "waiting" || !B || !X) return;
    const Z = ne.current;
    let ce = !1, he = !1, y, V = 0;
    const $ = Date.now() + 5 * 6e4, ue = async () => {
      if (!(ce || he || !de(Z))) {
        if (clearTimeout(y), Date.now() >= $) {
          J(B), F("error"), C("等待授权超时。配置已保留，请重新登录授权。");
          return;
        }
        he = !0;
        try {
          const ye = await ae(`/mcp/oauth/status/${pe}?session_id=${encodeURIComponent(B)}`);
          if (ce || !de(Z)) return;
          if (V = 0, ye.authorized && ye.phase === "authorized") {
            re.current = "", _(""), P(X, Z);
            return;
          }
          if (["denied", "failed", "cancelled", "expired"].includes(ye.phase || "")) {
            F("error"), C(ye.phase === "denied" ? "授权未获同意。你可以重新登录并选择允许的权限。" : "本次授权未完成或已失效，配置已保留，可重新登录授权。");
            return;
          }
        } catch {
          if (++V >= 3 && !ce && de(Z)) {
            F("error"), C("暂时无法查询授权状态，请检查网络后重试。");
            return;
          }
        } finally {
          he = !1;
        }
        !ce && de(Z) && (y = setTimeout(ue, 2e3));
      }
    };
    return ue(), window.addEventListener("focus", ue), () => {
      ce = !0, clearTimeout(y), window.removeEventListener("focus", ue);
    };
  }, [A, B, X]);
  const Ee = async () => {
    const Z = w.filter(([y]) => {
      var V;
      return !((V = x[y]) != null && V.trim());
    });
    if (Z.length) {
      C(`请填写：${Z.map(([y]) => {
        var V, $;
        return (($ = ((V = e.inputHints) == null ? void 0 : V[y]) || Ca[y]) == null ? void 0 : $.label) || y;
      }).join("、")}`);
      return;
    }
    let ce;
    try {
      ce = Wl({ url: e.url, command: e.command, args: e.args, headers: e.headers, cwd: e.cwd, env: { ...e.env, ...x } }, x);
    } catch (y) {
      C(y instanceof Error ? y.message : "请检查连接配置");
      return;
    }
    const he = ++ne.current;
    F("saving"), C("");
    try {
      const y = { name: e.name, description: e.description, enabled: !v, transport: e.transport, ...ce }, V = X ? await ae(`/mcp/${pe}`, { method: "PUT", body: JSON.stringify(y) }) : await Cr(t, { client_key: e.id, client: y });
      if (!de(he)) return;
      const $ = { ...V, key: e.id, enabled: !v };
      T($), j({}), i($), v ? await le($, he) : await P($, he);
    } catch {
      if (!de(he)) return;
      F("config"), C("配置未能保存，请检查服务配置或是否已有同名连接后重试。填写内容暂时保留在此窗口。");
    }
  }, _e = async () => {
    ne.current += 1, F("saved"), C("已取消本次授权等待，配置已保留。尚未完成授权的连接保持未启用。"), !await J(re.current) && M.current && C("已停止等待，但暂时无法取消服务端授权流程。请关闭授权网页；连接不会在此窗口自动启用。"), re.current = "", _(""), z("");
  }, ke = ["saving", "starting", "waiting", "checking"].includes(A), Se = vt(e.source), fe = vt(e.setupUrl), Te = A === "connected" ? `已连接 · 已读取 ${H} 个工具` : A === "waiting" ? "等待浏览器登录授权" : A === "starting" ? "正在准备安全登录" : A === "checking" ? "正在检测可用工具" : A === "saving" ? "正在保存连接配置" : X ? v ? "已保存 · 账号授权与连接待确认" : "已保存 · 连接待检测" : "填写接入信息", Ce = [h(b, { key: "close", onClick: o }, ke ? "关闭并停止等待" : "关闭")];
  return A === "config" ? Ce.push(h(b, { key: "save", type: "primary", onClick: Ee }, X ? "更新凭证并连接" : "添加连接")) : A === "waiting" ? Ce.push(h(b, { key: "cancel", onClick: _e }, "取消授权"), h(b, { key: "reopen", type: "primary", onClick: () => G(k) }, "重新打开授权页")) : !ke && X && (w.length && Ce.push(h(b, { key: "edit", onClick: () => {
    j({}), C(""), F("config");
  } }, "更新凭证")), Ce.push(h(b, { key: "check", onClick: () => P(X) }, "重新检测")), v && Ce.push(h(b, { key: "auth", type: "primary", onClick: () => le() }, "登录授权"))), h(
    p,
    { title: `连接 ${e.name}`, open: !0, onCancel: o, footer: Ce, width: 560, destroyOnClose: !0 },
    h("p", { style: { color: "var(--ant-color-text-secondary)" } }, e.description),
    h("p", null, `目标专家：${n}`),
    h(f, { color: A === "connected" ? "green" : "blue" }, Te),
    v ? h(E, { style: { margin: "12px 0" }, type: "info", showIcon: !0, message: "在服务提供方页面登录并确认权限，返回这里自动完成连接检测。UGSci 不需要你的账号密码。" }) : null,
    N ? h(E, { role: "alert", style: { margin: "12px 0" }, type: "warning", showIcon: !0, message: N }) : null,
    ...(e.requirements || []).map((Z, ce) => h("p", { key: `req-${ce}` }, Z)),
    fe ? h("p", null, h("a", { href: fe, target: "_blank", rel: "noopener noreferrer", onClick: d ? (Z) => {
      Z.preventDefault(), d(fe);
    } : void 0 }, "开通账号 / 获取授权信息 ↗")) : null,
    Se ? h("a", { href: Se, target: "_blank", rel: "noopener noreferrer", onClick: d ? (Z) => {
      Z.preventDefault(), d(Se);
    } : void 0 }, "查看服务接入说明 ↗") : null,
    A === "config" ? h("div", { style: { marginTop: 16 } }, ...w.map(([Z]) => {
      var V;
      const ce = ((V = e.inputHints) == null ? void 0 : V[Z]) || Ca[Z], he = vt(ce == null ? void 0 : ce.link), y = (ce == null ? void 0 : ce.label) || Z;
      return h(
        "div",
        { key: Z, style: { marginBottom: 16 } },
        h("label", { htmlFor: `mcp-input-${Z}`, style: { display: "block", marginBottom: 6 } }, `${y}（必填）`),
        ce != null && ce.help ? h("p", { style: { fontSize: 12, margin: "4px 0" } }, ce.help) : null,
        he ? h("a", { href: he, target: "_blank", rel: "noopener noreferrer", onClick: d ? ($) => {
          $.preventDefault(), d(he);
        } : void 0 }, "获取密钥 / 查看设置 ↗") : null,
        h((ce == null ? void 0 : ce.isSecret) === !1 ? g : g.Password, { id: `mcp-input-${Z}`, placeholder: `请输入 ${y}`, value: x[Z] || "", autoComplete: "off", onChange: ($) => j((ue) => ({ ...ue, [Z]: $.target.value })) })
      );
    })) : null,
    v ? h(
      "div",
      { style: { marginTop: 12 } },
      h(b, { type: "link", size: "small", disabled: ke, onClick: () => D(!L) }, L ? "收起高级设置" : "高级设置（服务要求时填写）"),
      L ? h(
        "div",
        null,
        h(g, { "aria-label": "OAuth 客户端 ID", placeholder: "客户端 ID（通常自动获取）", value: Y, disabled: ke, onChange: (Z) => O(Z.target.value) }),
        h(g, { "aria-label": "OAuth 权限范围", placeholder: "权限范围（按服务文档填写，可留空）", value: I, disabled: ke, style: { marginTop: 8 }, onChange: (Z) => q(Z.target.value) })
      ) : null
    ) : null,
    (Q = e.limitations) != null && Q.length ? h("details", { style: { marginTop: 12 } }, h("summary", null, "使用限制"), ...e.limitations.map((Z, ce) => h("p", { key: ce }, Z))) : null
  );
}
function lc({
  open: e,
  onClose: t
}) {
  const { React: n, antd: r } = R(), i = n.createElement, { Modal: a, Input: o, Button: l, Alert: s, Checkbox: d, Radio: c, Space: m } = r, [u, p] = n.useState({
    id: "",
    name: "",
    version: "1.0.0",
    description: "",
    author: "",
    system_prompt: "",
    tags: "",
    recommended_skills: ""
  }), [b, g] = n.useState(""), [E, f] = n.useState("submission"), [h, v] = n.useState(null), [w, x] = n.useState(""), [j, X] = n.useState(!1), [T, A] = n.useState(""), [F, N] = n.useState(""), [C, k] = n.useState(null);
  n.useEffect(() => {
    if (!e) {
      g("");
      return;
    }
    let q = !0;
    return x(""), X(!1), k(null), N(""), v(null), me("/publisher/status").then((H) => {
      q && v(H);
    }).catch(() => {
      q && N("无法读取发布服务配置，请稍后重试");
    }), () => {
      q = !1;
    };
  }, [e]);
  const z = {
    ...u,
    tags: u.tags.split(/[,，]/).map((q) => q.trim()).filter(Boolean),
    recommended_skills: u.recommended_skills.split(/[,，]/).map((q) => q.trim()).filter(Boolean)
  }, B = JSON.stringify({ expert: z, mode: E }), _ = B + b, L = E === "release" ? h == null ? void 0 : h.direct_publish_configured : h == null ? void 0 : h.submission_configured, D = async (q) => {
    N(""), k(null), A(q);
    try {
      const H = await me(`/publisher/expert/${q}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-UGSci-Publisher-Token": b
        },
        body: B
      });
      q === "inspect" && x(_), k(H), H.status === "published" && Fi(!0).catch(() => {
      });
    } catch (H) {
      x("");
      let U = (H == null ? void 0 : H.message) || "提交失败，请重试";
      try {
        U = JSON.parse(U).detail || U;
      } catch {
      }
      N(String(U));
    } finally {
      A("");
    }
  }, Y = async (q) => {
    if (q) {
      N(""), k(null), x(""), X(!1);
      try {
        if (q.size > 1024 * 1024) throw new Error("专家 JSON 不能超过 1 MB");
        const H = JSON.parse(await q.text()), U = [
          "id",
          "name",
          "version",
          "description",
          "author",
          "system_prompt",
          "tags",
          "recommended_skills"
        ];
        if (!H || typeof H != "object" || Array.isArray(H) || Object.keys(H).some((M) => !U.includes(M)))
          throw new Error(
            "仅支持公开专家模板字段；请移除记忆、知识文件、凭证和其他运行配置"
          );
        for (const M of U)
          if (H[M] !== void 0 && (["tags", "recommended_skills"].includes(M) ? !Array.isArray(H[M]) || H[M].some((ne) => typeof ne != "string") : typeof H[M] != "string"))
            throw new Error(`字段 ${M} 格式无效`);
        p({
          id: H.id || "",
          name: H.name || "",
          version: H.version || "1.0.0",
          description: H.description || "",
          author: H.author || "",
          system_prompt: H.system_prompt || "",
          tags: (H.tags || []).join(", "),
          recommended_skills: (H.recommended_skills || []).join(", ")
        });
      } catch (H) {
        N((H == null ? void 0 : H.message) || "模板导入失败");
      }
    }
  }, O = () => {
    const q = {
      id: "yourname-expert",
      name: "公开专家",
      version: "1.0.0",
      description: "专家职责",
      author: "团队名",
      system_prompt: "填写可公开分享的专家提示词。",
      tags: ["科研"],
      recommended_skills: []
    }, H = URL.createObjectURL(
      new Blob([JSON.stringify(q, null, 2)], { type: "application/json" })
    ), U = document.createElement("a");
    U.href = H, U.download = "ugsci-expert-template.json", U.click(), setTimeout(() => URL.revokeObjectURL(H), 1e3);
  }, I = (q, H, U, M = !1) => i(
    "label",
    { key: q, style: { display: "block", marginBottom: 12 } },
    i("div", { style: { marginBottom: 4 } }, H),
    i(M ? o.TextArea : o, {
      "aria-label": H,
      value: u[q],
      placeholder: U,
      rows: q === "system_prompt" ? 7 : 2,
      onChange: (ne) => {
        p((re) => ({ ...re, [q]: ne.target.value })), k(null);
      }
    })
  );
  return i(
    a,
    {
      open: e,
      title: "发布 / 更新专家到 UGSci",
      width: 720,
      destroyOnHidden: !0,
      closable: !T,
      maskClosable: !T,
      onCancel: () => {
        T || (g(""), t());
      },
      footer: null
    },
    i(s, {
      type: "info",
      showIcon: !0,
      message: "编写可公开分享的专家模板",
      description: "填写公开提示词与推荐技能名称。此入口不读取本机专家的聊天、记忆、知识文件或账号配置。更新时保留 ID、提高版本号；投稿审核通过后市场可见。",
      style: { marginBottom: 16 }
    }),
    i(
      m,
      { style: { marginBottom: 16 }, wrap: !0 },
      i(
        "label",
        null,
        "导入专家 JSON ",
        i("input", {
          type: "file",
          accept: ".json,application/json",
          "aria-label": "导入专家 JSON",
          disabled: !!T,
          onChange: (q) => {
            var H;
            Y((H = q.target.files) == null ? void 0 : H[0]), q.target.value = "";
          }
        })
      ),
      i(l, { onClick: O }, "下载空白模板")
    ),
    I(
      "id",
      "专家 ID",
      "例如 alice-reservoir，须以管理员分配的命名空间开头"
    ),
    i(
      "div",
      { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 } },
      I("name", "专家名称", "公开显示的名称"),
      I("version", "版本号", "例如 1.0.0")
    ),
    I("description", "简介", "专家擅长什么", !0),
    I("author", "公开作者", "可使用团队名或笔名"),
    I(
      "system_prompt",
      "公开提示词",
      "填写专家职责、流程与输出要求；勿填写私人资料或密钥",
      !0
    ),
    I("tags", "标签", "科研, 油藏工程"),
    I(
      "recommended_skills",
      "推荐技能名称",
      "多个名称以逗号分隔，不上传技能文件"
    ),
    i(
      "label",
      null,
      "投稿凭证（仅本次使用）",
      i(o.Password, {
        "aria-label": "投稿凭证",
        value: b,
        autoComplete: "off",
        onChange: (q) => g(q.target.value),
        placeholder: "管理员分配的投稿凭证，无需 OSS AccessKey"
      })
    ),
    i(c.Group, {
      value: E,
      style: { margin: "12px 0" },
      onChange: (q) => {
        f(q.target.value), k(null);
      },
      options: [
        { label: "投稿待审核", value: "submission" },
        {
          label: "管理员发布",
          value: "release",
          disabled: !(h != null && h.direct_publish_configured)
        }
      ]
    }),
    i(
      "div",
      { style: { marginBottom: 12 } },
      i(
        d,
        {
          checked: j,
          onChange: (q) => X(q.target.checked)
        },
        "我确认以上内容可公开分享，不含私人数据或账号密钥"
      )
    ),
    h && !L && i(s, {
      type: "warning",
      message: "管理员尚未配置远端发布服务，当前无法上传 OSS。请联系管理员开通投稿服务。",
      style: { marginBottom: 12 }
    }),
    F && i(s, {
      type: "error",
      showIcon: !0,
      message: F,
      style: { marginBottom: 12 }
    }),
    C && i(s, {
      showIcon: !0,
      type: C.status === "checked" ? "info" : "success",
      message: C.status === "checked" ? `服务端检查通过：${C.operation === "update" ? "更新现有专家" : "新增专家"}` : C.status === "published" ? "已发布，OSS 内容与目录已校验" : "已上传 OSS，等待管理员审核",
      description: i(
        "div",
        { style: { overflowWrap: "anywhere" } },
        i("div", null, `回执：${C.receipt_id}`),
        i("div", null, `SHA-256：${C.sha256}`)
      ),
      style: { marginBottom: 12 }
    }),
    i(
      m,
      null,
      i(
        l,
        {
          disabled: !!T || !L || !b.trim() || !u.id || !u.name || !u.system_prompt,
          loading: T === "inspect",
          onClick: () => D("inspect")
        },
        "检查归属与版本"
      ),
      i(
        l,
        {
          type: "primary",
          disabled: !!T || !L || !j || w !== _,
          loading: T === "publish",
          onClick: () => D("publish")
        },
        E === "release" ? "发布新版本" : "上传到 OSS 待审核"
      )
    ),
    T && i(
      "div",
      { role: "status", style: { marginTop: 12 } },
      T === "inspect" ? "正在校验身份、命名空间与版本…" : "正在写入 OSS 并核验回执，请稍候…"
    )
  );
}
async function cc() {
  return me("/market/providers");
}
async function dc(e) {
  return me(
    `/market/categories?lang=${encodeURIComponent(e)}`
  );
}
async function uc(e, t, n, r, i) {
  return me("/market/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: e,
      provider_pages: t,
      limit: n,
      lang: r,
      category: i || void 0
    })
  });
}
function Aa(e) {
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
async function $a(e, t) {
  const n = { bundle_url: e };
  return t && (n.access_token = t), me("/skills/pool/import", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(n)
  });
}
function mc({ embedded: e = !1 } = {}) {
  var ma;
  const t = R().React, { useState: n, useEffect: r, useCallback: i, useMemo: a, useRef: o } = t, {
    Spin: l,
    Empty: s,
    Input: d,
    Button: c,
    message: m,
    Row: u,
    Col: p,
    Card: b,
    Tag: g,
    Tooltip: E,
    Typography: f,
    Select: h,
    Drawer: v,
    Descriptions: w,
    Tabs: x,
    Badge: j,
    Progress: X,
    Modal: T,
    Alert: A
  } = R().antd, {
    ReloadOutlined: F,
    SearchOutlined: N,
    DownloadOutlined: C,
    AppstoreOutlined: k,
    ShopOutlined: z,
    CheckCircleOutlined: B,
    LoadingOutlined: _,
    UserOutlined: L,
    UserAddOutlined: D,
    SettingOutlined: Y,
    GithubOutlined: O,
    ApiOutlined: I
  } = R().antdIcons || {}, { Text: q, Paragraph: H, Title: U } = f, [M, ne] = n("skills"), [re, K] = n([]), [pe, ae] = n([]), [J, de] = n([]), [G, P] = n(""), [le, Ee] = n(""), [_e, ke] = n(!1), [Se, fe] = n(!1), [Te, Ce] = n(
    {}
  ), [Q, Z] = n(null), [ce, he] = n({}), [y, V] = n([]), [$, ue] = n(""), [ye, be] = n(""), [Ae, Be] = n(""), [Le, nt] = n(""), [Ge, rt] = n({}), [Ye, W] = n(/* @__PURE__ */ new Set()), [ge, ie] = n(null), [Oe, $e] = n(24), Ne = o(Le);
  Ne.current = Le;
  const [at, it] = n([]), [ze, We] = n([]), [He, st] = n([]), [qe, De] = n(""), [je, lt] = n(!1), [St, jt] = n(24), [Wn, Dr] = n(24), [Fr, Hn] = n(!1), [xo, Gr] = n(!1), [_o, Wr] = n([]), [ko, Hr] = n(!1), [Co, qr] = n([]), [To, Jr] = n(!1), [Io, Vr] = n(!1), [Kr, Ao] = n([]), [Xr, $o] = n([]), [qn, Yr] = n(!1), [Zr, Qr] = n(""), [ht, ea] = n(""), [ta, zo] = n([]), [na, Po] = n([]), [Jn, ra] = n(!1), [aa, ia] = n(""), [Et, oa] = n(""), [Vn, sa] = n(!1), [Ze, mn] = n(null), [Ut, Ro] = n([]), Nt = o(null), Kn = o(0), Dt = o(0);
  r(() => {
    let S = !0;
    return cc().then((se) => {
      S && K(se);
    }).catch(() => {
    }), dc("zh").then((se) => {
      S && ae(se);
    }).catch(() => {
    }), Bn().then((se) => {
      S && (V(se), se.length > 0 && (ue(se[0].id), nt(se[0].id)));
    }).catch(() => {
    }), () => {
      S = !1;
    };
  }, []);
  const Ft = i(async (S) => {
    const se = ++Dt.current, oe = S ?? Ql();
    if (it(S || oe), oe.filter((Pe) => Pe.enabled).length === 0) {
      We([]), Hn(!1);
      return;
    }
    Hn(!0);
    try {
      const { skills: Pe, errors: Re } = await ic(oe);
      if (se !== Dt.current) return;
      if (We(Pe), Re.length > 0) {
        for (const Me of Re)
          console.warn(`[ugsci] GitHub source '${Me.label}' error: ${Me.message}`);
        m.warning(
          `部分源加载失败: ${Re.map((Me) => Me.label).join(", ")}`
        );
      }
    } catch (Pe) {
      if (se !== Dt.current) return;
      m.error(Pe.message || "加载技能源失败");
    } finally {
      se === Dt.current && Hn(!1);
    }
  }, []), mt = i(async (S = !1) => {
    const se = ++Kn.current, oe = () => se === Kn.current;
    Yr(!0), ra(!0), lt(!0), await Promise.allSettled([
      rc(S).then((ve) => {
        oe() && (Ao(ve.servers), $o(ve.categories), Qr(""));
      }).catch(() => {
        oe() && Qr("MCP 目录暂时无法更新，已有内容仍可浏览。");
      }).finally(() => {
        oe() && Yr(!1);
      }),
      Fi(S).then((ve) => {
        oe() && (zo(ve.agents), Po(ve.categories), ia(""));
      }).catch(() => {
        oe() && ia("人才目录暂时无法更新，已有内容仍可浏览。");
      }).finally(() => {
        oe() && ra(!1);
      }),
      ac(S).then((ve) => {
        oe() && (st(ve.skills), Ro(ve.categories), De(""));
      }).catch(() => {
        oe() && De("技能目录暂时无法更新，已有内容仍可浏览。");
      }).finally(() => {
        oe() && lt(!1);
      })
    ]);
  }, []);
  r(() => {
    Ft(), mt(), Wr(Xl()), qr(Yl());
    const S = Vl(() => {
      mt();
    });
    return () => {
      S(), Kn.current += 1, Dt.current += 1;
    };
  }, [Ft, mt]), r(() => {
    jt(24);
  }, [G, le]), r(() => {
    Dr(24);
  }, [ye, Et]);
  const pn = i(
    async (S, se, oe) => {
      ke(!0);
      try {
        const ve = await uc(
          S,
          oe,
          20,
          "zh",
          se || void 0
        );
        oe === void 0 || Object.keys(oe).length === 0 ? de(ve.results) : de((Me) => [...Me, ...ve.results]);
        const Pe = Object.values(ve.by_provider || {}).some(
          (Me) => Me.has_more
        );
        fe(Pe);
        const Re = {};
        for (const [Me, ut] of Object.entries(ve.by_provider || {}))
          Re[Me] = (oe[Me] || 1) + 1;
        if (Ce(Re), ve.errors.length > 0)
          for (const Me of ve.errors)
            console.warn(
              `[ugsci] Market provider '${Me.provider}' error: ${Me.message}`
            );
      } catch (ve) {
        m.error(ve.message || "搜索市场失败"), de([]);
      } finally {
        ke(!1);
      }
    },
    []
  );
  r(() => (Nt.current && clearTimeout(Nt.current), Nt.current = setTimeout(() => {
    pn(G, le, {});
  }, 400), () => {
    Nt.current && clearTimeout(Nt.current);
  }), [G, le, pn]);
  const Oo = () => {
    pn(G, le, Te);
  }, la = async (S) => {
    const se = `${S.source}:${S.slug}`;
    try {
      he((ve) => ({ ...ve, [se]: "installing" }));
      const oe = await $a(S.source_url);
      oe.installed && m.success(
        `技能「${oe.name || S.name}」已安装到技能池，可在技能中心查看`
      ), he((ve) => {
        const Pe = { ...ve };
        return delete Pe[se], Pe;
      });
    } catch (oe) {
      m.error(Aa(oe) || "安装技能失败"), he((ve) => {
        const Pe = { ...ve };
        return delete Pe[se], Pe;
      });
    }
  }, Mo = (S) => {
    window.history.pushState({}, "", S), window.dispatchEvent(new PopStateEvent("popstate"));
  }, Lo = async (S) => {
    const se = `github:${S.sourceId}:${S.name}`, oe = at.find((Pe) => Pe.id === S.sourceId), ve = (oe == null ? void 0 : oe.accessToken) || void 0;
    try {
      he((Re) => ({ ...Re, [se]: "installing" }));
      const Pe = await $a(S.source_url, ve);
      Pe.installed && m.success(
        `技能「${Pe.name || S.name}」已安装到技能池，可在技能中心查看`
      ), he((Re) => {
        const Me = { ...Re };
        return delete Me[se], Me;
      });
    } catch (Pe) {
      m.error(Aa(Pe) || "安装技能失败"), he((Re) => {
        const Me = { ...Re };
        return delete Me[se], Me;
      });
    }
  }, xt = a(() => {
    const S = [], se = /* @__PURE__ */ new Set();
    for (const oe of [...He, ...ze]) {
      const ve = oe.source_url || `${oe.sourceLabel}:${oe.name}`;
      se.has(ve) || (se.add(ve), S.push(oe));
    }
    return S;
  }, [He, ze]), ca = a(() => {
    const S = [], se = /* @__PURE__ */ new Set();
    if (Ut.length > 0)
      for (const oe of Ut)
        se.has(oe.id) || (se.add(oe.id), S.push(oe));
    for (const oe of xt)
      oe.tag && !se.has(oe.tag) && (se.add(oe.tag), S.push({ id: oe.tag, label: oe.tag }));
    for (const oe of xt)
      !oe.isOfficial && oe.sourceLabel && !se.has(oe.sourceLabel) && (se.add(oe.sourceLabel), S.push({ id: oe.sourceLabel, label: oe.sourceLabel }));
    return S;
  }, [xt, Ut]), _t = a(() => {
    let S = xt;
    if (le) {
      const se = Ut.find((oe) => oe.id === le);
      se && se.tags ? S = S.filter(
        (oe) => oe.tag && se.tags.includes(oe.tag) || oe.sourceLabel === le
      ) : S = S.filter(
        (oe) => oe.tag === le || oe.sourceLabel === le
      );
    }
    if (G.trim()) {
      const se = G.toLowerCase();
      S = S.filter(
        (oe) => {
          var ve;
          return oe.name.toLowerCase().includes(se) || ((ve = oe.description) == null ? void 0 : ve.toLowerCase().includes(se));
        }
      );
    }
    return S;
  }, [xt, G, le, Ut]), da = re.filter((S) => S.available), kt = a(() => le ? J.filter((S) => {
    const se = da.find((oe) => oe.key === S.source);
    return (se == null ? void 0 : se.label) === le;
  }) : J, [J, le, da]), Bo = M === "skills" ? t.createElement(
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
      t.createElement(d, {
        placeholder: "搜索技能市场...",
        prefix: N ? t.createElement(N) : void 0,
        value: G,
        onChange: (S) => P(S.target.value),
        allowClear: !0,
        style: { flex: 1, minWidth: 200, maxWidth: 400 }
      }),
      // Pool install info
      t.createElement(
        q,
        { type: "secondary", style: { fontSize: 12 } },
        "安装后进入技能池"
      ),
      // Configure skill source button
      t.createElement(
        c,
        {
          icon: O ? t.createElement(O) : void 0,
          onClick: () => Gr(!0),
          size: "small"
        },
        "配置技能源"
      ),
      t.createElement(c, {
        size: "small",
        loading: je,
        onClick: () => {
          mt(!0), Ft();
        }
      }, "刷新技能目录")
    ),
    // Dynamic category filter tags (from OSS manifest tags + imported sources)
    qe ? t.createElement(A, {
      type: "warning",
      showIcon: !0,
      message: "UGSci 官方 OSS 技能库加载失败",
      description: "请检查网络后点击“刷新技能目录”重试，已加载的技能仍可浏览。",
      style: { marginBottom: 12 }
    }) : null,
    ca.length > 0 ? t.createElement(
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
        q,
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
          color: le === "" ? "blue" : void 0,
          onClick: () => Ee("")
        },
        "全部"
      ),
      ...ca.map((S) => {
        const se = ze.some(
          (oe) => !oe.isOfficial && oe.sourceLabel === S.id
        );
        return t.createElement(
          g,
          {
            key: S.id,
            style: {
              fontSize: 11,
              cursor: "pointer",
              borderRadius: 12
            },
            color: le === S.id ? se ? "blue" : "geekblue" : void 0,
            icon: se && O ? t.createElement(O) : void 0,
            onClick: () => Ee(
              le === S.id ? "" : S.id
            )
          },
          S.label
        );
      })
    ) : null,
    // GitHub skills section
    (Fr || je) && xt.length === 0 ? t.createElement(
      "div",
      { style: { textAlign: "center", padding: 40, marginBottom: 16 } },
      t.createElement(l, { size: "large" }, t.createElement("div", { style: { minHeight: 60, display: "flex", alignItems: "center", justifyContent: "center" } }, "正在加载技能..."))
    ) : _t.length > 0 ? t.createElement(
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
          q,
          { strong: !0, style: { fontSize: 13 } },
          `技能市场 (${_t.length})`
        )
      ),
      t.createElement(
        u,
        { gutter: [12, 12] },
        ..._t.slice(0, St).map((S) => {
          const se = `github:${S.sourceId}:${S.name}`, oe = ce[se];
          return t.createElement(
            p,
            { key: se, xs: 24, sm: 12, md: 8, lg: 6 },
            t.createElement(
              b,
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
                  E,
                  { title: S.name },
                  t.createElement(
                    q,
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
                  )
                )
              ),
              t.createElement(
                H,
                {
                  type: "secondary",
                  style: { fontSize: 11, margin: 0, lineHeight: 1.4 },
                  ellipsis: { rows: 2 }
                },
                S.description || "暂无描述"
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
                  S.sourcePath || S.sourceLabel ? t.createElement(
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
                    S.sourcePath || S.sourceLabel
                  ) : null,
                  // Show tag as category badge
                  S.tag ? t.createElement(
                    g,
                    { color: "geekblue", style: { fontSize: 10 } },
                    S.tag
                  ) : null,
                  S.version ? t.createElement(
                    g,
                    { style: { fontSize: 10 } },
                    `v${S.version}`
                  ) : null
                ),
                oe ? t.createElement(
                  c,
                  {
                    size: "small",
                    disabled: !0,
                    icon: _ ? t.createElement(_) : void 0
                  },
                  "安装中"
                ) : t.createElement(
                  c,
                  {
                    type: "primary",
                    size: "small",
                    icon: C ? t.createElement(C) : void 0,
                    onClick: () => Lo(S)
                  },
                  "安装"
                )
              )
            )
          );
        })
      )
    ) : null,
    _t.length > St ? t.createElement(
      "div",
      { style: { textAlign: "center", marginBottom: 20 } },
      t.createElement(
        c,
        { onClick: () => jt((S) => S + 24) },
        `显示更多技能（已显示 ${Math.min(St, _t.length)} / ${_t.length}）`
      )
    ) : null,
    // Market results section title
    kt.length > 0 || _e ? t.createElement(
      "div",
      {
        style: {
          marginBottom: 10,
          display: "flex",
          alignItems: "center",
          gap: 6
        }
      },
      z ? t.createElement(z, {
        style: { fontSize: 14, color: "#1677ff" }
      }) : null,
      t.createElement(
        q,
        { strong: !0, style: { fontSize: 13 } },
        `技能市场${kt.length > 0 ? ` (${kt.length})` : ""}`
      )
    ) : null,
    // Results grid
    _e && kt.length === 0 ? t.createElement(
      "div",
      { style: { textAlign: "center", padding: 60 } },
      t.createElement(l, { size: "large" })
    ) : kt.length === 0 ? t.createElement(s, {
      description: G ? `未找到匹配「${G}」的技能` : "输入关键词搜索技能市场",
      image: s.PRESENTED_IMAGE_SIMPLE
    }) : t.createElement(
      u,
      { gutter: [12, 12] },
      ...kt.map((S) => {
        const se = `${S.source}:${S.slug}`, oe = ce[se];
        return t.createElement(
          p,
          { key: se, xs: 24, sm: 12, md: 8, lg: 6 },
          t.createElement(
            b,
            {
              hoverable: !0,
              size: "small",
              style: { height: "100%", cursor: "pointer" },
              onClick: () => Z(S)
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
              S.icon_url ? t.createElement("img", {
                src: S.icon_url,
                alt: S.name,
                style: { width: 24, height: 24, borderRadius: 4 }
              }) : t.createElement(
                "span",
                { style: { fontSize: 18 } },
                "📦"
              ),
              t.createElement(
                E,
                { title: S.name },
                t.createElement(
                  q,
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
                )
              )
            ),
            t.createElement(
              H,
              {
                type: "secondary",
                style: { fontSize: 11, margin: 0, lineHeight: 1.4 },
                ellipsis: { rows: 2 }
              },
              S.description || "暂无描述"
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
                  S.source
                ),
                S.version ? t.createElement(
                  g,
                  { style: { fontSize: 10 } },
                  `v${S.version}`
                ) : null
              ),
              oe ? t.createElement(
                c,
                {
                  size: "small",
                  disabled: !0,
                  icon: _ ? t.createElement(_) : void 0
                },
                "安装中"
              ) : t.createElement(
                c,
                {
                  type: "primary",
                  size: "small",
                  icon: C ? t.createElement(C) : void 0,
                  onClick: (ve) => {
                    ve.stopPropagation(), la(S);
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
    Se && !_e ? t.createElement(
      "div",
      { style: { textAlign: "center", marginTop: 16 } },
      t.createElement(
        c,
        { onClick: Oo, loading: _e },
        "加载更多"
      )
    ) : null,
    // Detail Drawer
    Q ? t.createElement(
      v,
      {
        title: t.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 8 } },
          Q.icon_url ? t.createElement("img", {
            src: Q.icon_url,
            alt: Q.name,
            style: { width: 28, height: 28, borderRadius: 4 }
          }) : t.createElement(
            "span",
            { style: { fontSize: 20 } },
            "📦"
          ),
          t.createElement("span", null, Q.name)
        ),
        open: !0,
        onClose: () => Z(null),
        width: 480,
        extra: t.createElement(
          c,
          {
            type: "primary",
            icon: C ? t.createElement(C) : void 0,
            onClick: () => {
              la(Q);
            }
          },
          "安装到技能池"
        )
      },
      t.createElement(
        w,
        { column: 1, bordered: !0, size: "small" },
        t.createElement(
          w.Item,
          { label: "来源" },
          Q.source
        ),
        t.createElement(
          w.Item,
          { label: "描述" },
          Q.description || "-"
        ),
        Q.version ? t.createElement(
          w.Item,
          { label: "版本" },
          Q.version
        ) : null,
        Q.author ? t.createElement(
          w.Item,
          { label: "作者" },
          Q.author
        ) : null,
        t.createElement(
          w.Item,
          { label: "来源链接" },
          t.createElement(
            "a",
            { href: Q.source_url, target: "_blank" },
            Q.source_url
          )
        )
      ),
      Q.stats ? t.createElement(
        "div",
        { style: { marginTop: 16 } },
        t.createElement(
          q,
          {
            strong: !0,
            style: { display: "block", marginBottom: 8 }
          },
          "统计"
        ),
        t.createElement(
          "div",
          { style: { display: "flex", gap: 12, flexWrap: "wrap" } },
          ...Object.entries(Q.stats).map(
            ([S, se]) => t.createElement(
              "div",
              { key: S, style: { textAlign: "center" } },
              t.createElement(
                "div",
                {
                  style: {
                    fontSize: 18,
                    fontWeight: 600,
                    color: "#1677ff"
                  }
                },
                String(se)
              ),
              t.createElement(
                q,
                { type: "secondary", style: { fontSize: 11 } },
                S
              )
            )
          )
        )
      ) : null
    ) : null
  ) : null, Ct = a(() => {
    let S = ta;
    if (Et && (S = S.filter((se) => se.category === Et)), ye.trim()) {
      const se = ye.toLowerCase();
      S = S.filter(
        (oe) => oe.name.toLowerCase().includes(se) || oe.description.toLowerCase().includes(se) || oe.tags.some((ve) => ve.toLowerCase().includes(se))
      );
    }
    return S;
  }, [ta, ye, Et]), jo = async (S) => {
    if (!Vn) {
      sa(!0);
      try {
        const [se, oe] = await Promise.all([
          S.instructions ? (async () => {
            const Pe = await an(S.instructions.replace(/^\/+/, ""));
            if (!Pe.ok) throw new Error("专家提示词加载失败，请重试后再创建");
            const Re = await Pe.text();
            if (!Re.trim()) throw new Error("专家提示词为空，无法创建");
            return Re;
          })() : Promise.resolve(S.description),
          S.skills_manifest ? (async () => {
            const Pe = await an(S.skills_manifest.replace(/^\/+/, ""));
            if (!Pe.ok) throw new Error("专家技能清单加载失败，请重试后再创建");
            const Re = await Pe.json(), Me = Array.isArray(Re) ? Re : Re.skills;
            if (!Array.isArray(Me)) throw new Error("专家技能清单格式无效");
            return Me.map((ut) => typeof ut == "string" ? ut : ut == null ? void 0 : ut.name).filter((ut) => typeof ut == "string" && ut.trim());
          })() : Promise.resolve([])
        ]), ve = await me("/agents", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: S.name,
            description: S.description,
            skill_names: oe
          })
        });
        await zt(ve.id, "AGENTS.md", se), m.success(`专家「${S.name}」创建成功，已跳转至专家`), Mo("/ugsci-experts");
      } catch (se) {
        m.error(se.message || "创建专家失败");
      } finally {
        sa(!1);
      }
    }
  }, ua = i(async (S) => {
    if (S)
      try {
        const se = await kr(S);
        if (Ne.current !== S) return;
        rt(Object.fromEntries(se.map((oe) => [oe.key, oe])));
      } catch {
        Ne.current === S && rt({});
      }
  }, []);
  r(() => {
    rt({}), W(/* @__PURE__ */ new Set()), Le && ua(Le);
  }, [Le, ua]), r(() => {
    $e(24);
  }, [Ae, ht]);
  const Uo = (S) => {
    if (!Le) {
      m.warning("请先选择目标专家");
      return;
    }
    ie({ template: S, agentId: Le, existing: Ge[S.id] });
  }, Tt = a(() => {
    let S = Kr;
    if (ht && (S = S.filter((se) => se.category === ht)), Ae.trim()) {
      const se = Ae.toLowerCase();
      S = S.filter(
        (oe) => oe.name.toLowerCase().includes(se) || oe.description.toLowerCase().includes(se) || oe.tags.some((ve) => ve.toLowerCase().includes(se))
      );
    }
    return S.map(Kl);
  }, [Kr, Ae, ht]), No = M === "mcp" ? t.createElement(
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
      t.createElement(d, {
        placeholder: "搜索 MCP 服务器...",
        prefix: N ? t.createElement(N) : void 0,
        value: Ae,
        onChange: (S) => Be(S.target.value),
        allowClear: !0,
        style: { maxWidth: 300 }
      }),
      t.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        t.createElement(
          q,
          { type: "secondary", style: { fontSize: 12, whiteSpace: "nowrap" } },
          "安装到："
        ),
        t.createElement(h, {
          value: Le,
          onChange: (S) => nt(S),
          style: { minWidth: 180 },
          size: "small",
          options: y.map((S) => ({ value: S.id, label: S.name }))
        })
      ),
      // Configure MCP source button
      t.createElement(
        c,
        {
          icon: I ? t.createElement(I) : void 0,
          onClick: () => Hr(!0),
          size: "small"
        },
        "配置 MCP 源"
      ),
      t.createElement(c, { size: "small", loading: qn, onClick: () => mt(!0) }, "刷新目录")
    ),
    Zr ? t.createElement(A, { type: "warning", showIcon: !0, message: Zr, style: { marginBottom: 12 } }) : null,
    // Dynamic category tag row (from OSS manifest tag_groups)
    Xr.length > 0 ? t.createElement(
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
        q,
        { type: "secondary", style: { fontSize: 12, marginRight: 4 } },
        "分类:"
      ),
      t.createElement(
        g,
        {
          style: { fontSize: 11, cursor: "pointer", borderRadius: 12 },
          color: ht === "" ? "blue" : void 0,
          onClick: () => ea("")
        },
        "全部"
      ),
      ...Xr.map(
        (S) => t.createElement(
          g,
          {
            key: S.id,
            style: { fontSize: 11, cursor: "pointer", borderRadius: 12 },
            color: ht === S.id ? "geekblue" : void 0,
            onClick: () => ea(
              ht === S.id ? "" : S.id
            )
          },
          S.label
        )
      )
    ) : null,
    // MCP server cards (dynamic from OSS)
    qn && Tt.length === 0 ? t.createElement(
      "div",
      { style: { textAlign: "center", padding: 40 } },
      t.createElement(l, { size: "large" }, t.createElement("div", { style: { minHeight: 60, display: "flex", alignItems: "center", justifyContent: "center" } }, "正在加载 MCP 服务器..."))
    ) : Tt.length === 0 ? t.createElement(s, {
      description: "未找到匹配的 MCP 服务器",
      image: s.PRESENTED_IMAGE_SIMPLE
    }) : t.createElement(
      u,
      { gutter: [12, 12] },
      ...Tt.slice(0, Oe).map(
        (S, se) => {
          var oe, ve, Pe;
          return t.createElement(
            p,
            { key: S.id, xs: 24, sm: 12, md: 8 },
            t.createElement(
              b,
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
                  S.iconUrl ? t.createElement("img", {
                    src: S.iconUrl,
                    alt: S.name,
                    width: 28,
                    height: 28,
                    decoding: "async",
                    loading: se < 12 ? "eager" : "lazy",
                    style: { width: 28, height: 28, objectFit: "contain" },
                    onError: (Re) => {
                      Re.target.style.display = "none";
                    }
                  }) : S.emoji
                ),
                t.createElement(
                  "div",
                  { style: { flex: 1 } },
                  t.createElement(
                    q,
                    { strong: !0, style: { fontSize: 14 } },
                    S.name
                  ),
                  t.createElement(
                    "div",
                    { style: { display: "flex", gap: 4, marginTop: 4, flexWrap: "wrap" } },
                    t.createElement(
                      g,
                      { color: "blue", style: { fontSize: 10 } },
                      S.category
                    ),
                    t.createElement(
                      g,
                      {
                        color: S.transport === "stdio" ? "purple" : "cyan",
                        style: { fontSize: 10 }
                      },
                      S.transport
                    ),
                    S.authType === "oauth2" ? t.createElement(g, { color: "geekblue", style: { fontSize: 10 } }, "账号登录授权") : null,
                    S.env && Object.values(S.env).some((Re) => Re.startsWith("your-") || Re.includes("${")) ? t.createElement(
                      g,
                      { color: "orange", style: { fontSize: 10 } },
                      "需配置密钥"
                    ) : null
                  )
                )
              ),
              // Description
              t.createElement(
                H,
                {
                  type: "secondary",
                  style: { fontSize: 12, margin: 0, lineHeight: 1.5 },
                  ellipsis: { rows: 3 }
                },
                S.description
              ),
              (oe = S.requirements) != null && oe.length || (ve = S.limitations) != null && ve.length ? t.createElement(
                "details",
                { style: { marginTop: 8, fontSize: 12 } },
                t.createElement("summary", { style: { cursor: "pointer", color: "var(--ant-color-primary, #1677ff)" } }, "接入要求与限制"),
                ...[...S.requirements || [], ...S.limitations || []].map((Re, Me) => t.createElement("p", { key: Me, style: { margin: "6px 0" } }, Re)),
                vt(S.source) ? t.createElement("a", { href: vt(S.source), target: "_blank", rel: "noopener noreferrer" }, "查看来源说明 ↗") : null
              ) : null,
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
                  q,
                  { type: "secondary", style: { fontSize: 11 } },
                  Ye.has(S.id) ? "已连接 · 工具检测通过" : Ge[S.id] ? S.authType === "oauth2" && !((Pe = Ge[S.id].oauth_status) != null && Pe.authorized) ? "已保存 · 待登录授权" : "已保存 · 连接待检测" : S.transport === "stdio" ? `${S.command} ${(S.args || []).join(" ")}` : S.authType === "oauth2" ? "浏览器登录 · 自动检测连接" : "远程服务 · 按账号权限连接"
                ),
                t.createElement(
                  c,
                  {
                    type: "primary",
                    size: "small",
                    icon: I ? t.createElement(I) : void 0,
                    onClick: () => Uo(S)
                  },
                  Ge[S.id] ? "管理连接" : S.transport === "stdio" ? "添加工具" : "连接"
                )
              )
            )
          );
        }
      )
    ),
    Tt.length > Oe ? t.createElement("div", { style: { textAlign: "center", marginTop: 16 } }, t.createElement(c, { onClick: () => $e((S) => S + 24) }, `加载更多 MCP（已显示 ${Math.min(Oe, Tt.length)} / ${Tt.length}）`)) : null,
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
      z ? t.createElement(z, {
        style: { fontSize: 24, color: "var(--ant-color-text-quaternary, #bfbfbf)", marginBottom: 8 }
      }) : null,
      t.createElement(
        q,
        { type: "secondary", style: { fontSize: 12 } },
        "MCP 服务器列表来自 UGSci 官方源，自动同步更新"
      )
    )
  ) : null, Do = ge ? t.createElement(sc, {
    key: `${ge.agentId}:${ge.template.id}`,
    template: ge.template,
    agentId: ge.agentId,
    agentName: ((ma = y.find((S) => S.id === ge.agentId)) == null ? void 0 : ma.name) || ge.agentId,
    existing: ge.existing,
    onSaved: (S) => {
      Ne.current === ge.agentId && (rt((se) => ({ ...se, [S.key]: S })), W((se) => {
        const oe = new Set(se);
        return oe.delete(S.key), oe;
      }));
    },
    onConnected: () => {
      Ne.current === ge.agentId && W((S) => new Set(S).add(ge.template.id));
    },
    onClose: () => ie(null)
  }) : null, Fo = M === "experts" ? t.createElement(
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
      t.createElement(d, {
        placeholder: "搜索人才...",
        prefix: N ? t.createElement(N) : void 0,
        value: ye,
        onChange: (S) => be(S.target.value),
        allowClear: !0,
        style: { maxWidth: 400, flex: 1, minWidth: 200 }
      }),
      t.createElement(
        c,
        {
          icon: L ? t.createElement(L) : void 0,
          onClick: () => Jr(!0),
          size: "small"
        },
        "配置专家源"
      ),
      t.createElement(c, { size: "small", loading: Jn, onClick: () => mt(!0) }, "刷新人才目录"),
      t.createElement(c, { type: "primary", size: "small", onClick: () => Vr(!0) }, "发布 / 更新专家")
    ),
    aa ? t.createElement(A, { type: "warning", showIcon: !0, message: aa, style: { marginBottom: 12 } }) : null,
    // Dynamic category tag row (from OSS manifest tag_groups)
    na.length > 0 ? t.createElement(
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
        q,
        { type: "secondary", style: { fontSize: 12, marginRight: 4 } },
        "分类:"
      ),
      t.createElement(
        g,
        {
          style: { fontSize: 11, cursor: "pointer", borderRadius: 12 },
          color: Et === "" ? "blue" : void 0,
          onClick: () => oa("")
        },
        "全部"
      ),
      ...na.map(
        (S) => t.createElement(
          g,
          {
            key: S.id,
            style: { fontSize: 11, cursor: "pointer", borderRadius: 12 },
            color: Et === S.id ? "geekblue" : void 0,
            onClick: () => oa(
              Et === S.id ? "" : S.id
            )
          },
          S.label
        )
      )
    ) : null,
    // Agent cards (dynamic from OSS)
    Jn && Ct.length === 0 ? t.createElement(
      "div",
      { style: { textAlign: "center", padding: 40 } },
      t.createElement(l, { size: "large" }, t.createElement("div", { style: { minHeight: 60, display: "flex", alignItems: "center", justifyContent: "center" } }, "正在加载人才市场..."))
    ) : Ct.length === 0 ? t.createElement(s, {
      description: "未找到匹配的人才",
      image: s.PRESENTED_IMAGE_SIMPLE
    }) : t.createElement(
      u,
      { gutter: [12, 12] },
      ...Ct.slice(0, Wn).map(
        (S) => t.createElement(
          p,
          { key: S.id, xs: 24, sm: 12, md: 8 },
          t.createElement(
            b,
            {
              hoverable: !0,
              size: "small",
              style: { height: "100%", cursor: "pointer" },
              onClick: () => mn(S)
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
              t.createElement(dt, {
                name: S.name,
                size: 40
              }),
              t.createElement(
                "div",
                { style: { flex: 1 } },
                t.createElement(
                  q,
                  { strong: !0, style: { fontSize: 14 } },
                  S.name
                ),
                t.createElement(
                  "div",
                  { style: { display: "flex", gap: 4, marginTop: 4, flexWrap: "wrap" } },
                  S.category ? t.createElement(
                    g,
                    { color: "blue", style: { fontSize: 10 } },
                    Mt(S.category)
                  ) : null,
                  S.tags.includes("mcp") ? t.createElement(
                    g,
                    { color: "purple", style: { fontSize: 10 } },
                    "MCP"
                  ) : null
                )
              )
            ),
            t.createElement(
              H,
              {
                type: "secondary",
                style: { fontSize: 12, margin: 0, lineHeight: 1.5 },
                ellipsis: { rows: 3 }
              },
              S.description
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
                q,
                { type: "secondary", style: { fontSize: 11 } },
                S.tags.filter((se) => se !== "agent" && se !== "template" && se !== "workspace").slice(0, 3).join(" · ") || "人才模板"
              ),
              t.createElement(
                c,
                {
                  type: "primary",
                  size: "small",
                  icon: D ? t.createElement(D) : void 0
                },
                "查看详情"
              )
            )
          )
        )
      )
    ),
    Ct.length > Wn ? t.createElement(
      "div",
      { style: { textAlign: "center", marginTop: 16 } },
      t.createElement(
        c,
        { onClick: () => Dr((S) => S + 24) },
        `显示更多人才（已显示 ${Math.min(Wn, Ct.length)} / ${Ct.length}）`
      )
    ) : null,
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
      z ? t.createElement(z, {
        style: { fontSize: 24, color: "var(--ant-color-text-quaternary, #bfbfbf)", marginBottom: 8 }
      }) : null,
      t.createElement(
        q,
        { type: "secondary", style: { fontSize: 12 } },
        "人才市场来自 UGSci 官方源，自动同步更新"
      )
    )
  ) : null, Go = [
    {
      key: "skills",
      label: t.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        k ? t.createElement(k, { style: { fontSize: 14 } }) : null,
        "技能市场"
      ),
      children: Bo
    },
    {
      key: "mcp",
      label: t.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        I ? t.createElement(I, { style: { fontSize: 14 } }) : null,
        "MCP 市场"
      ),
      children: No
    },
    {
      key: "experts",
      label: t.createElement(
        "span",
        { style: { display: "flex", alignItems: "center", gap: 6 } },
        D ? t.createElement(D, { style: { fontSize: 14 } }) : null,
        "人才市场"
      ),
      children: Fo
    }
  ];
  return t.createElement(
    "div",
    { style: { padding: 24 } },
    e ? null : t.createElement(Ln, {
      title: "市场",
      subtitle: "浏览技能市场 · 选择 MCP 服务器 · 人才市场 · 随时更新能力和专家",
      extra: t.createElement(
        "div",
        { style: { display: "flex", gap: 8 } },
        t.createElement(
          c,
          {
            type: "primary",
            icon: F ? t.createElement(F) : void 0,
            onClick: () => {
              pn(G, le, {}), Ft(), mt(!0);
            },
            loading: _e || Fr || je || qn || Jn
          },
          "刷新"
        )
      )
    }),
    t.createElement(x, {
      items: Go,
      activeKey: M,
      onChange: (S) => ne(S)
    }),
    // Skill source config modal
    t.createElement(oc, {
      open: xo,
      onClose: () => Gr(!1),
      sources: at,
      onChange: (S) => {
        it(S), Ft(S);
      }
    }),
    // MCP source config modal
    t.createElement(Ia, {
      open: ko,
      onClose: () => Hr(!1),
      sources: _o,
      onChange: (S) => Wr(S),
      type: "mcp"
    }),
    // MCP token config modal (for templates requiring secrets)
    Do,
    // Expert source config modal
    t.createElement(lc, { open: Io, onClose: () => {
      Vr(!1), mt();
    } }),
    t.createElement(Ia, {
      open: To,
      onClose: () => Jr(!1),
      sources: Co,
      onChange: (S) => qr(S),
      type: "expert"
    }),
    // ── Agent Detail Modal (click card to view details, then create) ──
    Ze ? t.createElement(
      T,
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
          t.createElement(dt, {
            name: Ze.name,
            size: 40
          }),
          t.createElement(
            "div",
            null,
            t.createElement(
              q,
              { strong: !0, style: { fontSize: 16 } },
              Ze.name
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
              Ze.category ? t.createElement(
                g,
                { color: "blue", style: { fontSize: 10 } },
                Mt(Ze.category)
              ) : null,
              ...Ze.tags.filter(
                (S) => S !== "agent" && S !== "template" && S !== "workspace"
              ).slice(0, 5).map(
                (S) => t.createElement(
                  g,
                  { key: S, style: { fontSize: 10 } },
                  S
                )
              )
            )
          )
        ),
        open: !0,
        onCancel: () => mn(null),
        width: 640,
        footer: t.createElement(
          "div",
          { style: { textAlign: "right" } },
          t.createElement(
            c,
            {
              onClick: () => mn(null),
              style: { marginRight: 8 }
            },
            "取消"
          ),
          t.createElement(
            c,
            {
              type: "primary",
              loading: Vn,
              disabled: Vn,
              icon: D ? t.createElement(D) : void 0,
              style: Ke,
              onClick: async () => {
                await jo(Ze), mn(null);
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
          q,
          { strong: !0, style: { display: "block", marginBottom: 6 } },
          "简介"
        ),
        t.createElement(
          H,
          {
            type: "secondary",
            style: { fontSize: 13, lineHeight: 1.7, margin: 0 }
          },
          Ze.description
        )
      ),
      // Skills manifest hint
      Ze.skills_manifest ? t.createElement(
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
          q,
          { style: { fontSize: 12, color: "#52c41a" } },
          "✓ 包含技能清单，创建后将自动安装推荐技能"
        )
      ) : null,
      // Instructions hint
      Ze.instructions ? t.createElement(
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
          q,
          { style: { fontSize: 12, color: "#1677ff" } },
          "✓ 包含系统提示词，创建后将自动写入 AGENTS.md"
        )
      ) : null,
      // Drivers
      Ze.drivers && Object.keys(Ze.drivers).length > 0 ? t.createElement(
        "div",
        null,
        t.createElement(
          q,
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
          ...Object.entries(Ze.drivers).map(
            ([S, se]) => t.createElement(
              g,
              { key: S, color: "cyan", style: { fontSize: 11 } },
              `${S}${se && se.length > 0 ? ` (${se.join(", ")})` : ""}`
            )
          )
        )
      ) : null
    ) : null
  );
}
function pc() {
  try {
    const t = localStorage.getItem("language") || "";
    if (t) return t.split("-")[0];
  } catch {
  }
  return ((typeof navigator < "u" ? navigator.language : "") || "").split("-")[0] || "en";
}
const za = {
  zh: "您好，UGSci 智能助手在线。无论是油气藏分析、数值模拟还是工程决策，描述您的场景，我来交付结果。",
  en: "UGSci AI assistant is online. From reservoir analysis to numerical simulation and engineering decisions — describe your scenario and I'll deliver results.",
  ja: "UGSci AIアシスタントがオンラインです。油層解析、数値シミュレーション、エンジニアリングの意思決定など、シナリオを描写してください。結果をお届けします。",
  ru: "UGSci AI-ассистент онлайн. От анализа пласта до численного моделирования и инженерных решений — опишите свой сценарий, и я предоставлю результат.",
  vi: "Trợ lý AI UGSci đang trực tuyến. Từ phân tích mỏ, mô phỏng số đến ra quyết định kỹ thuật — mô tả kịch bản của bạn, tôi sẽ giao kết quả.",
  id: "Asisten AI UGSci sedang online. Dari analisis reservoir, simulasi numerik hingga keputusan engineering — jelaskan skenario Anda, saya akan memberikan hasilnya."
}, Pa = {
  zh: { label: "能告诉我你都能做点什么吗？", value: "能告诉我你都能做点什么吗" },
  en: { label: "Can you tell me what you can do?", value: "Can you tell me what you can do?" },
  ja: { label: "あなたができることを教えてください", value: "あなたができることを教えてください" },
  ru: { label: "Расскажи, что ты умеешь делать?", value: "Расскажи, что ты умеешь делать?" },
  vi: { label: "Bạn có thể cho tôi biết bạn làm được gì không?", value: "Bạn có thể cho tôi biết bạn làm được gì không?" },
  id: { label: "Bisa cerita apa saja yang bisa Anda lakukan?", value: "Bisa cerita apa saja yang bisa Anda lakukan?" }
};
function fc() {
  const e = R(), t = e.React, { useEffect: n, useRef: r } = t, i = e.useSelectedAgent ? e.useSelectedAgent() : { id: "default" }, a = (i == null ? void 0 : i.id) || "default", o = r(null), l = r(null);
  return n(() => {
    if (o.current === a) return;
    o.current = a, wr();
    const s = pc(), d = za[s] || za.en, c = Pa[s] || Pa.en;
    let m = !1;
    return (async () => {
      var u, p;
      try {
        const b = await jn(a);
        if (m) return;
        const g = ci(b);
        if (l.current) {
          try {
            l.current();
          } catch {
          }
          l.current = null;
        }
        const E = window.QwenPaw;
        (u = E == null ? void 0 : E.chat) != null && u.welcome && (g.length > 0 ? (l.current = E.chat.welcome.set("ugsci", {
          description: d,
          prompts: g
        }), console.info(
          `[ugsci] Injected ${g.length} welcome prompts for agent "${a}"`
        )) : (l.current = E.chat.welcome.set("ugsci", {
          description: d,
          prompts: [c]
        }), console.info(
          `[ugsci] No skills for agent "${a}" — using default prompt`
        )));
      } catch (b) {
        console.warn(
          `[ugsci] Failed to inject welcome prompts for agent "${a}":`,
          b
        );
        const g = window.QwenPaw;
        if ((p = g == null ? void 0 : g.chat) != null && p.welcome && !m) {
          if (l.current) {
            try {
              l.current();
            } catch {
            }
            l.current = null;
          }
          l.current = g.chat.welcome.set("ugsci", {
            description: d,
            prompts: [c]
          });
        }
      }
    })(), () => {
      m = !0;
    };
  }, [a]), null;
}
const gc = 256;
let Ve = {};
const mr = /* @__PURE__ */ new Set(), Tn = () => mr.forEach((e) => e()), yc = (e) => (mr.add(e), () => mr.delete(e)), on = /* @__PURE__ */ new Map();
function Ra(e, t) {
  const n = [];
  for (const a of t) {
    if (!a) continue;
    const o = Ve[Lt(e, a)] || Object.values(Ve).find((l) => l.uiId === a);
    o && n.push(o);
  }
  const r = `${e}::${t.join("\0")}`, i = on.get(r);
  return i && i.length === n.length && i.every((a, o) => a === n[o]) ? i : (on.set(r, n), n);
}
function Lt(e, t) {
  return `${e}::${t}`;
}
function In(e) {
  return !e || typeof e != "object" ? null : e.ok === !0 && (e.kind === "genui" || e.kind === "genui_patch") ? e : e.genui && typeof e.genui == "object" ? In(e.genui) : e.ui && typeof e.ui == "object" ? In(e.ui.genui) : null;
}
function Qt(e) {
  if (!e || typeof e != "string") return null;
  try {
    const t = JSON.parse(e);
    if (Array.isArray(t)) {
      for (const n of t) {
        const r = (n == null ? void 0 : n.type) === "text" ? n.text : void 0, i = typeof r == "string" ? Qt(r) : In(n);
        if (i) return i;
      }
      return null;
    }
    return In(t);
  } catch {
    return null;
  }
}
function en(e) {
  var t;
  if (!e || typeof e != "string") return null;
  try {
    const n = JSON.parse(e);
    if (Array.isArray(n)) {
      const r = (t = n.find((i) => (i == null ? void 0 : i.type) === "text")) == null ? void 0 : t.text;
      return typeof r == "string" ? en(r) : null;
    }
    return n && n.ok === !1 ? n : null;
  } catch {
    return null;
  }
}
const Oa = /* @__PURE__ */ new Set(["plugin_call_output", "function_call_output", "tool_call_output", "mcp_call_output", "component_call_output"]), Yn = /* @__PURE__ */ new Set(["emit_ui_tree", "emit_ui_patch"]);
function Gi(e) {
  var r, i, a, o;
  if (!Array.isArray(e)) return [];
  const t = [], n = (l, s = !1) => {
    var m, u, p;
    if (!l || typeof l != "object") return;
    if (Array.isArray(l)) {
      const b = s ? l.map((g) => {
        var E;
        return ((E = g == null ? void 0 : g.data) == null ? void 0 : E.name) ?? (g == null ? void 0 : g.name);
      }).filter((g) => !!g).map((g) => String(g)) : [];
      if (s && b.length) {
        const g = b.some((E) => Yn.has(E));
        for (const E of l) {
          const f = ((m = E == null ? void 0 : E.data) == null ? void 0 : m.output) ?? (E == null ? void 0 : E.output) ?? ((u = E == null ? void 0 : E.data) == null ? void 0 : u.result) ?? (E == null ? void 0 : E.result) ?? ((p = E == null ? void 0 : E.data) == null ? void 0 : p.content) ?? (E == null ? void 0 : E.content);
          if (f == null) continue;
          const h = typeof f == "string" ? f : JSON.stringify(f), v = Qt(h) || (g ? en(h) : null);
          v && t.push(v);
        }
      }
      l.forEach((g) => n(g));
      return;
    }
    const d = l;
    if (d.type === "tool_result") {
      const g = (Array.isArray(d.output) ? d.output : []).filter((h) => (h == null ? void 0 : h.type) === "text").map((h) => h.text), E = g.length ? g.join(`
`) : d.output, f = g.length ? g : [typeof E == "string" ? E : JSON.stringify(E)];
      for (const h of f) {
        const v = Qt(h) || (Yn.has(String(d.name || "")) ? en(h) : null);
        v && t.push(v);
      }
      return;
    }
    const c = Oa.has(String(d.type || ""));
    Object.entries(d).forEach(
      ([b, g]) => n(g, c && b === "content")
    );
  };
  n(e);
  for (const l of e) {
    if (!l || typeof l != "object") continue;
    const s = l;
    if (!Oa.has(String(s.type || "")) || !Array.isArray(s.content)) continue;
    const d = s.content, c = (i = (r = d[0]) == null ? void 0 : r.data) == null ? void 0 : i.name;
    if (!c) continue;
    const m = (o = (a = d[1]) == null ? void 0 : a.data) == null ? void 0 : o.output;
    if (m == null) continue;
    const u = typeof m == "string" ? m : JSON.stringify(m), p = Qt(u) || (Yn.has(String(c)) ? en(u) : null);
    p && t.push(p);
  }
  return Array.from(new Map(t.map((l) => [`${l.kind}:${l.ui_id}:${l.revision}`, l])).values());
}
function Wi(e) {
  var o;
  const t = Lt(e.sessionId, e.uiId), n = Object.entries(Ve).filter(([, l]) => l.uiId === e.uiId).sort(([, l], [, s]) => s.revision - l.revision), r = Ve[t] || ((o = n[0]) == null ? void 0 : o[1]);
  if (r && e.revision < r.revision) return;
  const i = { ...Ve };
  for (const [l] of n) l !== t && delete i[l];
  i[t] = r && e.revision === r.revision ? { ...r, ...e, tree: r.tree } : e;
  const a = Object.entries(i).sort(([, l], [, s]) => s.updatedAt - l.updatedAt);
  Ve = Object.fromEntries(a.slice(0, gc)), Tn();
}
function hc(e, t) {
  for (const n of Gi(t))
    !n.ui_id || !n.tree || Wi({
      schemaVersion: "1",
      uiId: n.ui_id,
      revision: n.revision || 1,
      tree: n.tree,
      sessionId: e,
      sourceToolCallId: n.tool_call_id,
      updatedAt: Date.now()
    });
}
const Hi = {
  setSnapshot: Wi,
  applyPatch(e, t, n, r) {
    var d, c;
    const i = (d = window.QwenPaw) == null ? void 0 : d.host, a = r || ((c = i == null ? void 0 : i.getCurrentSessionId) == null ? void 0 : c.call(i)) || "", o = Lt(a, e.ui_id), l = Ve[o] || Object.values(Ve).find((m) => m.uiId === e.ui_id);
    if (!l || n <= l.revision) return;
    Ve = { ...Object.fromEntries(Object.entries(Ve).filter(([, m]) => m.uiId !== e.ui_id)), [o]: { ...l, sessionId: a, tree: t, revision: n, updatedAt: Date.now() } }, Tn();
  },
  getSnapshot: (e, t) => Ve[Lt(e, t)],
  clearSession(e) {
    Ve = Object.fromEntries(Object.entries(Ve).filter(([, t]) => t.sessionId !== e));
    for (const t of [...on.keys()])
      t.startsWith(`${e}::`) && on.delete(t);
    Tn();
  },
  hydrateFromMessages: hc
};
function Ec({ children: e }) {
  return e;
}
function bc() {
  return Hi;
}
function vc(e, t) {
  var a, o;
  const n = (o = (a = window.QwenPaw) == null ? void 0 : a.host) == null ? void 0 : o.React;
  if (!n) throw new Error("useGenUiSnapshots: host React not available");
  const r = t.join("\0"), i = r === "" ? [] : r.split("\0");
  return n.useSyncExternalStore(
    yc,
    () => Ra(e, i),
    () => Ra(e, i)
  );
}
function wc(e) {
  Hi.clearSession(e);
}
function Sc() {
  Ve = {}, on.clear(), Tn();
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
function xc(e) {
  const t = e.data;
  if (!t) return { resultText: "", status: "calling", toolName: "" };
  const n = t.status || "calling", r = t.content;
  if (!Array.isArray(r) || r.length === 0)
    return { resultText: "", status: n, toolName: "" };
  const i = r[0], a = i == null ? void 0 : i.data, o = (a == null ? void 0 : a.name) || "";
  if (r.length > 1) {
    const l = r[1], s = l == null ? void 0 : l.data, d = (s == null ? void 0 : s.output) ?? (s == null ? void 0 : s.content) ?? (l == null ? void 0 : l.output) ?? (l == null ? void 0 : l.content) ?? (s == null ? void 0 : s.result) ?? (l == null ? void 0 : l.result);
    if (d != null) return { resultText: tn(d), status: n, toolName: o };
  }
  if (a != null && a.output) {
    const l = a.output;
    return { resultText: tn(l), status: n, toolName: o };
  }
  return { resultText: "", status: n, toolName: o };
}
function Ma(e) {
  var p, b, g, E;
  const t = (p = window.QwenPaw) == null ? void 0 : p.host, n = t == null ? void 0 : t.React;
  if (!n) return null;
  const { resultText: r, status: i, toolName: a } = xc(e), o = i === "in_progress" || i === "calling", l = i === "failed" || i === "error", s = Qt(r), d = s ? null : en(r);
  let c = 0;
  (b = s == null ? void 0 : s.tree) != null && b.root && (c = qi(s.tree.root));
  const m = a === "emit_ui_patch" || (s == null ? void 0 : s.kind) === "genui_patch", u = o ? m ? "📝 Patching UI Tree..." : "🎨 Generating UI Tree..." : l ? m ? "📝 UI Patch Error" : "🎨 UI Tree Error" : s ? m ? `📝 UI Patched (rev ${s.revision ?? "?"})` : `🎨 UI Tree (${c} nodes)` : m ? "📝 UI Patch" : "🎨 UI Tree";
  return n.createElement(
    "details",
    { open: o || l, style: { margin: "4px 0", border: "1px solid var(--ant-color-border, #d9d9d9)", borderRadius: 8, padding: "4px 8px", fontSize: 13 } },
    n.createElement(
      "summary",
      { style: { cursor: "pointer", display: "flex", alignItems: "center", gap: 6 } },
      n.createElement("span", null, m ? "📝" : "🎨"),
      n.createElement("span", null, u),
      s != null && s.ok ? n.createElement("span", { style: { fontSize: 11, color: "#999", marginLeft: "auto" } }, `ui_id: ${((g = s.ui_id) == null ? void 0 : g.slice(0, 16)) ?? ""}…`) : null
    ),
    l || d && !s ? n.createElement(
      "div",
      { style: { padding: "8px 12px", fontSize: 12 } },
      n.createElement("div", { style: { color: "var(--ant-color-error, #ff4d4f)", marginBottom: 4 } }, (d == null ? void 0 : d.message) || "Unknown error"),
      d != null && d.hint ? n.createElement("div", { style: { color: "#999" } }, `💡 ${d.hint}`) : null
    ) : s != null && s.ok ? n.createElement(
      "div",
      { style: { padding: "8px 12px", fontSize: 12, color: "#999" } },
      (E = s.tree) != null && E.root ? `GenUI 已在回复正文中展示（${c} 个节点，revision ${s.revision ?? 1}）。` : "GenUI 工具已完成，但没有可展示的树。"
    ) : n.createElement("pre", { style: { fontSize: 12, padding: "8px 12px", background: "rgba(0,0,0,0.03)", borderRadius: 8, overflow: "auto", maxHeight: 200 } }, r || "(waiting for result...)")
  );
}
function qi(e) {
  if (!e || typeof e != "object") return 0;
  let t = 1;
  if (Array.isArray(e.children)) for (const n of e.children) t += qi(n);
  return t;
}
function Cn(e) {
  var t;
  if (typeof e == "string") {
    if (e.trimStart().startsWith("["))
      try {
        return Cn(JSON.parse(e));
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
    if (n.output !== void 0) return Cn(n.output);
    if (n.content !== void 0) return Cn(n.content);
  }
  return e == null ? "" : JSON.stringify(e);
}
function _c(e) {
  var o;
  const t = e.data;
  if (!t) return { resultText: "", status: "calling", toolName: "" };
  const n = t.status || "calling", r = t.content;
  if (!Array.isArray(r) || r.length === 0)
    return { resultText: "", status: n, toolName: "" };
  const i = (o = r[0]) == null ? void 0 : o.data, a = (i == null ? void 0 : i.name) || "";
  if (r.length > 1) {
    const l = r[1], s = l == null ? void 0 : l.data, d = (s == null ? void 0 : s.output) ?? (s == null ? void 0 : s.content) ?? (l == null ? void 0 : l.output) ?? (l == null ? void 0 : l.content);
    if (d != null) return { resultText: Cn(d), status: n, toolName: a };
  }
  return { resultText: "", status: n, toolName: a };
}
function La(e) {
  var c;
  const t = (c = window.QwenPaw) == null ? void 0 : c.host, n = t == null ? void 0 : t.React;
  if (!n) return null;
  const { resultText: r, status: i, toolName: a } = _c(e), o = a === "get_genui_guide", l = i === "in_progress" || i === "calling";
  let s = o ? "GenUI 指南" : "组件目录", d = r;
  try {
    const m = r ? JSON.parse(r) : null;
    if (m && typeof m == "object") {
      const u = m.components;
      Array.isArray(u) ? (s = `组件目录（${u.length} 个 kind）`, d = u.map((p) => p == null ? void 0 : p.kind).filter(Boolean).join(" · ")) : (m.purpose || m.layout_structure) && (s = "GenUI 指南", d = String(m.purpose || "布局与语法说明已返回，模型可按此编写 emit_ui_tree。"));
    }
  } catch {
  }
  return n.createElement(
    "details",
    { style: { margin: "4px 0", border: "1px solid var(--ant-color-border, #d9d9d9)", borderRadius: 8, padding: "4px 8px", fontSize: 13 } },
    n.createElement("summary", { style: { cursor: "pointer" } }, l ? o ? "查阅 GenUI 指南…" : "查阅组件目录…" : s),
    n.createElement("div", { style: { padding: "8px 4px", fontSize: 12, color: "#666", lineHeight: 1.5 } }, d || "(waiting…)")
  );
}
const kc = /* @__PURE__ */ new Set(["send_message"]), Ba = 1e4, Cc = 500, ja = {};
function Tc() {
  var e;
  try {
    const t = window.QwenPaw, n = (e = t == null ? void 0 : t.genui) == null ? void 0 : e.config;
    if (n != null && n.allow_actions && Array.isArray(n.allow_actions)) {
      const r = n.allow_actions.filter(
        (i) => typeof i == "string" && i.length > 0
      );
      if (r.length > 0)
        return new Set(r);
    }
  } catch {
  }
  return new Set(kc);
}
function Ic(e) {
  const t = Date.now(), n = ja[e] || 0;
  return t - n < Cc ? (console.warn("[ugsci.genui] Action '" + e + "' throttled"), !0) : (ja[e] = t, !1);
}
function Ac(e, t) {
  return e.replace(/\{\{\s*([\w.-]+)\s*\}\}/g, (n, r) => {
    const i = t[r];
    return i == null ? "" : typeof i == "string" ? i : JSON.stringify(i);
  });
}
function pr(e, t = {}) {
  var a, o, l, s, d, c, m;
  let n;
  if (typeof e == "string") n = { type: e };
  else if (e && typeof e == "object") n = e;
  else return { ok: !1, message: "无效操作" };
  const r = n.type === "submit_form" ? "send_message" : n.type, i = Tc();
  if (!i.has(r))
    return console.warn(
      "[ugsci.genui] Action '" + n.type + "' not allowed (allowed: " + Array.from(i).join(", ") + ")"
    ), { ok: !1, message: "此操作未获允许" };
  if (Ic(r)) return { ok: !1, message: "操作过于频繁，请稍后重试" };
  if (r === "send_message") {
    const u = t.formValues || {};
    let p = ((a = n.payload) == null ? void 0 : a.content) || ((o = n.payload) == null ? void 0 : o.message) || "";
    const b = /\{\{\s*[\w.-]+\s*\}\}/.test(p);
    return p = Ac(p, u).trim(), p && !b && Object.keys(u).length > 0 && (p += `
${Object.entries(u).map(([E, f]) => `${E}: ${typeof f == "string" ? f : JSON.stringify(f)}`).join(`
`)}`), !p && Object.keys(u).length > 0 && (p = `${t.formId ? `提交表单 ${t.formId}` : "提交表单"}
${Object.entries(u).map(([f, h]) => `${f}: ${typeof h == "string" ? h : JSON.stringify(h)}`).join(`
`)}`), !p || !p.trim() ? (console.warn("[ugsci.genui] send_message: content is empty"), { ok: !1, message: "消息内容为空" }) : p.length > Ba ? (console.warn("[ugsci.genui] send_message: content length " + p.length + " exceeds max " + Ba), { ok: !1, message: "消息内容过长" }) : !((d = (s = (l = window.QwenPaw) == null ? void 0 : l.chat) == null ? void 0 : s.sendMessage) != null && d.call(s, p)) ? (console.info("[ugsci.genui] send_message: could not find chat sender, content:", p), { ok: !1, message: "当前无法发送消息" }) : { ok: !0, message: "已提交" };
  }
  if (r === "open_url") {
    const u = ((c = n.payload) == null ? void 0 : c.url) || ((m = n.payload) == null ? void 0 : m.href) || "", p = typeof u == "string" ? u.trim() : "";
    return /^https?:\/\//i.test(p) ? (window.open(p, "_blank", "noopener,noreferrer"), { ok: !0, message: "已打开链接" }) : (console.warn("[ugsci.genui] open_url: only http(s) URLs are allowed"), { ok: !1, message: "仅允许 http(s) 链接" });
  }
  return { ok: !1, message: "尚未实现此操作" };
}
const ot = /* @__PURE__ */ new Map(), sn = /* @__PURE__ */ new Map(), $c = 128, bn = /* @__PURE__ */ new Map();
function An(e) {
  return e.startsWith("http://") || e.startsWith("https://") || e.startsWith("data:") || e.startsWith("blob:");
}
function zc(e) {
  return e ? !!(e.startsWith("/") || /^[A-Za-z]:[\\/]/.test(e) || e.startsWith("\\\\")) : !1;
}
function Pc(e) {
  return e.startsWith("workspace://");
}
function Rc(e) {
  return Pc(e) ? e.slice(12) : e;
}
async function Oc(e) {
  if (!e) return null;
  if (An(e)) return e;
  if (ot.has(e))
    return ot.get(e) ?? null;
  if (bn.has(e))
    return bn.get(e);
  const t = Mc(e);
  bn.set(e, t);
  try {
    const n = await t;
    if (!ot.has(e) && ot.size >= $c) {
      const r = ot.keys().next().value;
      if (r !== void 0) {
        const i = ot.get(r);
        i != null && i.startsWith("blob:") && URL.revokeObjectURL(i), ot.delete(r);
      }
    }
    return ot.set(e, n), n && sn.delete(e), n;
  } finally {
    bn.delete(e);
  }
}
async function Mc(e) {
  const t = window.QwenPaw, n = t == null ? void 0 : t.host;
  if (!n) {
    const i = "宿主媒体 API 不可用。请在 QwenPaw 工作区中打开此内容，或改用 http(s)、data、blob URL。";
    return sn.set(e, i), console.warn("[ugsci.genui]", i), null;
  }
  const r = Rc(e);
  if (typeof n.resolveWorkspaceBlob == "function")
    try {
      const i = await n.resolveWorkspaceBlob(r);
      if (i) return i;
    } catch (i) {
      console.warn("[ugsci.genui] host.resolveWorkspaceBlob failed:", i);
    }
  try {
    return await Lc(r, n);
  } catch (i) {
    const a = i instanceof Error ? i.message : String(i);
    return sn.set(
      e,
      `无法读取本地媒体：${a}。请确认文件位于当前工作区且文件预览 API 已启用。`
    ), console.warn(
      `[ugsci.genui] Failed to resolve media URL for '${e}':`,
      i
    ), null;
  }
}
async function Lc(e, t) {
  let n = null;
  const r = t == null ? void 0 : t.workspaceApi, i = t == null ? void 0 : t.chatApi;
  if (zc(e) && (i != null && i.filePreviewUrl) ? n = i.filePreviewUrl(e) : r != null && r.getBinaryFileUrl && (n = r.getBinaryFileUrl(e)), !n)
    throw new Error("宿主未提供 workspaceApi.getBinaryFileUrl 或 chatApi.filePreviewUrl");
  const a = {}, o = t == null ? void 0 : t.buildAuthHeaders;
  if (typeof o == "function")
    try {
      const d = o();
      d && typeof d == "object" && Object.assign(a, d);
    } catch {
    }
  const l = await fetch(n, { headers: a });
  if (!l.ok)
    throw new Error(`HTTP ${l.status}: ${l.statusText}`);
  const s = await l.blob();
  return URL.createObjectURL(s);
}
function Ua(e) {
  return e ? An(e) ? e : ot.get(e) ?? null : null;
}
function Na(e) {
  return sn.get(e) ?? null;
}
function Bc() {
  for (const e of ot.values())
    if (e && e.startsWith("blob:"))
      try {
        URL.revokeObjectURL(e);
      } catch {
      }
  ot.clear(), sn.clear();
}
const Ji = [
  "Input",
  "NumberInput",
  "Select",
  "Textarea",
  "Switch",
  "Slider",
  "FileInput"
], It = ["#1677ff", "#52c41a", "#faad14", "#ff4d4f", "#722ed1", "#13c2c2", "#eb2f96"], jc = /* @__PURE__ */ new Set([
  "Button",
  "InteractiveButton",
  "ToggleButton",
  "LinkButton"
]);
function we(e) {
  return typeof e == "string" ? e : e == null ? "" : String(e);
}
function tt(e) {
  if (typeof e == "number" && Number.isFinite(e)) return e;
  if (typeof e == "string") {
    const t = Number(e);
    return Number.isFinite(t) ? t : 0;
  }
  return 0;
}
function Kt(e) {
  return Array.isArray(e) ? e : [];
}
function nn(e) {
  return !!e;
}
function ln(e) {
  const t = e.props || {}, n = we(t.name);
  if (n) return n;
  const r = we(t.label), i = r.match(/^\s*([a-e])(?:\b|\s|（|\()/i);
  return i ? i[1].toLowerCase() : r || we(e.nodeId);
}
function Vi(e) {
  return Ji.includes(e);
}
function Ki(e) {
  return Math.min(Math.max(tt(e) || 2, 1), 4);
}
function Uc(e, t, n = 6) {
  const r = tt(e);
  return Math.min(Math.max(r > 0 ? r : t, 1), n);
}
function Nc(e) {
  const n = (we(e) || "16:9").split(":"), r = Number(n[0]), i = Number(n[1]);
  return r > 0 && i > 0 ? `${r} / ${i}` : "16 / 9";
}
function Dc(e) {
  return /^https?:\/\//i.test(we(e).trim());
}
function et(e, t) {
  const n = {}, r = `${tt(t.gap) || 12}px`;
  if (e === "Stack")
    n.display = "flex", n.flexDirection = "column", n.gap = r, t.padding != null && (n.padding = `${tt(t.padding)}px`);
  else if (e === "Row")
    n.display = "flex", n.flexDirection = "row", n.gap = r, t.align && (n.alignItems = we(t.align)), t.justify && (n.justifyContent = we(t.justify));
  else if (e === "Grid" || e === "FeatureGrid" || e === "KpiBoard" || e === "ImageGallery") {
    const i = e === "KpiBoard" ? 3 : e === "FeatureGrid" ? 2 : e === "ImageGallery" ? 3 : 2, a = e === "FeatureGrid" ? 4 : 6;
    n.display = "grid", n.gridTemplateColumns = `repeat(${Uc(t.columns, i, a)}, minmax(0, 1fr))`, n.gap = e === "ImageGallery" ? `${tt(t.gap) || 8}px` : r;
  } else e === "ScrollArea" ? (n.maxHeight = `${tt(t.maxHeight) || 300}px`, n.overflowY = "auto", t.padding != null && (n.padding = `${tt(t.padding)}px`)) : e === "AspectBox" ? (n.aspectRatio = Nc(t.ratio), n.overflow = "hidden", n.borderRadius = "8px", n.display = "flex", n.justifyContent = "center", n.alignItems = "center") : e === "Spacer" && (n.height = `${tt(t.size) || 16}px`);
  return n;
}
function $r(e, t) {
  function n(m) {
    return typeof m == "string" ? m : m == null ? "" : String(m);
  }
  function r(m) {
    if (typeof m == "number" && Number.isFinite(m)) return m;
    if (typeof m == "string") {
      const u = Number(m);
      return Number.isFinite(u) ? u : 0;
    }
    return 0;
  }
  function i(m) {
    return Array.isArray(m) ? m : [];
  }
  const a = e.generator && typeof e.generator == "object" ? e.generator : {}, o = i(a.coefficients).map(n).filter(Boolean), l = n(a.type) === "polynomial" || o.length > 0;
  let s = i(e.categories).map(n), d = i(e.series);
  if (l && t) {
    const m = o.length > 0 ? o : ["a", "b", "c", "d", "e"], u = typeof a.xMin == "number" ? a.xMin : -3, p = typeof a.xMax == "number" ? a.xMax : 3, b = Math.min(Math.max(r(a.samples) || 61, 10), 400), g = Array.from({ length: b }, (f, h) => u + (p - u) * h / Math.max(b - 1, 1)), E = m.map((f) => r(t[f]));
    s = g.map((f) => Number(f.toFixed(2)).toString()), d = [{
      name: n(a.label) || "f(x)",
      values: g.map((f) => E.reduce((h, v, w) => h + v * Math.pow(f, E.length - w - 1), 0))
    }];
  }
  const c = d.map((m, u) => {
    const p = m && typeof m == "object" ? m : {};
    return {
      name: n(p.name) || `Series ${u + 1}`,
      values: i(p.values).map(r)
    };
  });
  return {
    title: n(e.title),
    chartType: n(e.chart) || "line",
    categories: s,
    series: c,
    height: r(e.height) || 200,
    showLegend: e.showLegend !== !1,
    empty: s.length === 0 || c.length === 0
  };
}
function Xi(e, t, n = 640) {
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
  const i = t.height || 240, a = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  if (a.setAttribute("viewBox", `0 0 ${n} ${i}`), a.setAttribute("role", "img"), a.setAttribute("aria-label", t.title || "Chart"), t.chartType === "pie") {
    const p = t.series[0].values.map((v) => Math.abs(v)), b = p.reduce((v, w) => v + w, 0) || 1, g = n / 2, E = i / 2, f = Math.min(n, i) / 2 - 20;
    let h = -Math.PI / 2;
    if (p.forEach((v, w) => {
      const x = v / b * Math.PI * 2, j = g + f * Math.cos(h), X = E + f * Math.sin(h), T = g + f * Math.cos(h + x), A = E + f * Math.sin(h + x), F = document.createElementNS(a.namespaceURI, "path");
      F.setAttribute("d", `M ${g} ${E} L ${j} ${X} A ${f} ${f} 0 ${x > Math.PI ? 1 : 0} 1 ${T} ${A} Z`), F.setAttribute("fill", r[w % r.length]), a.appendChild(F), h += x;
    }), e.appendChild(a), t.showLegend) {
      const v = document.createElement("div");
      v.className = "legend", p.forEach((w, x) => {
        const j = document.createElement("span"), X = document.createElement("i");
        X.style.background = r[x % r.length], j.append(X, document.createTextNode(`${t.categories[x] || `#${x + 1}`}: ${w}`)), v.appendChild(j);
      }), e.appendChild(v);
    }
    return;
  }
  const o = t.series.flatMap((p) => p.values), l = Math.max(...o, 0), s = Math.min(...o, 0), d = l - s || 1, c = (p) => i - 24 - (p - s) / d * (i - 44), m = (p) => 30 + p * (n - 50) / Math.max(t.categories.length - 1, 1), u = document.createElementNS(a.namespaceURI, "line");
  if (u.setAttribute("x1", "30"), u.setAttribute("x2", String(n - 15)), u.setAttribute("y1", String(c(0))), u.setAttribute("y2", String(c(0))), u.setAttribute("stroke", "#d9d9d9"), a.appendChild(u), t.series.forEach((p, b) => {
    const g = r[b % r.length];
    if (t.chartType === "bar") {
      const h = (n - 50) / Math.max(t.categories.length, 1), v = Math.max(1, h / t.series.length - 3);
      p.values.forEach((w, x) => {
        const j = document.createElementNS(a.namespaceURI, "rect"), X = Math.min(c(w), c(0)), T = Math.max(c(w), c(0));
        j.setAttribute("x", String(30 + x * h + b * (v + 2))), j.setAttribute("y", String(X)), j.setAttribute("width", String(v)), j.setAttribute("height", String(Math.max(1, T - X))), j.setAttribute("fill", g), a.appendChild(j);
      });
      return;
    }
    const E = p.values.map((h, v) => `${m(v)},${c(h)}`).join(" "), f = document.createElementNS(a.namespaceURI, "polyline");
    f.setAttribute("points", E), f.setAttribute("fill", t.chartType === "area" ? `${g}22` : "none"), f.setAttribute("stroke", g), f.setAttribute("stroke-width", "2"), a.appendChild(f);
  }), e.appendChild(a), t.showLegend) {
    const p = document.createElement("div");
    p.className = "legend", t.series.forEach((b, g) => {
      const E = document.createElement("span"), f = document.createElement("i");
      f.style.background = r[g % r.length], E.append(f, document.createTextNode(b.name)), p.appendChild(E);
    }), e.appendChild(p);
  }
}
const Fc = {
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
}, Gc = {
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
function Yi(e) {
  const t = we(e).trim();
  if (!t) return { kind: "empty" };
  const n = t.toLowerCase().replace(/\s+/g, "-"), r = Gc[n];
  return r ? { kind: "svg", paths: Fc[r] } : /^[\w.-]+$/.test(t) ? { kind: "empty" } : t.length <= 8 ? { kind: "emoji", text: t.slice(0, 8) } : { kind: "empty" };
}
function Wc(e, t, n = {}) {
  const r = Yi(t), i = n.size && n.size > 0 ? n.size : 16;
  if (e.setAttribute("aria-hidden", "true"), e.replaceChildren(), r.kind === "emoji") {
    e.textContent = r.text, e.style.fontSize = `${i}px`, n.color && (e.style.color = n.color);
    return;
  }
  if (r.kind === "empty") return;
  const a = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  a.setAttribute("width", String(i)), a.setAttribute("height", String(i)), a.setAttribute("viewBox", "0 0 24 24"), a.setAttribute("fill", "none"), a.setAttribute("stroke", n.color || "currentColor"), a.setAttribute("stroke-width", "2"), a.setAttribute("stroke-linecap", "round"), a.setAttribute("stroke-linejoin", "round"), a.setAttribute("focusable", "false"), a.style.display = "block";
  for (const o of r.paths) {
    const l = document.createElementNS("http://www.w3.org/2000/svg", "path");
    l.setAttribute("d", o), a.appendChild(l);
  }
  e.appendChild(a);
}
let Zn = null;
function Nn(e) {
  return Zn || (Zn = e.createContext(null)), Zn;
}
function Zi(e, t = {}) {
  if (Vi(e.kind)) {
    const n = e.props || {}, r = n.value ?? n.checked;
    r !== void 0 && (t[ln(e)] = r);
  }
  for (const n of e.children || []) Zi(n, t);
  return t;
}
function Hc({
  node: e,
  children: t,
  onValuesChange: n
}) {
  var s, d;
  const r = (d = (s = window.QwenPaw) == null ? void 0 : s.host) == null ? void 0 : d.React;
  if (!r) return null;
  const i = r.useMemo(() => Zi(e), [e]), [a, o] = r.useState(i);
  r.useEffect(
    () => o((c) => ({ ...i, ...c })),
    [i]
  ), r.useEffect(() => {
    n == null || n(a);
  }, [a, n]);
  const l = r.useMemo(
    () => ({
      values: a,
      setValue: (c, m) => o((u) => ({ ...u, [c]: m }))
    }),
    [a]
  );
  return r.createElement(
    Nn(r).Provider,
    { value: l },
    t
  );
}
const ee = (e) => typeof e == "string" ? e : e != null ? String(e) : "", ft = (e) => typeof e == "number" ? e : typeof e == "string" && Number(e) || 0, gt = (e) => !!e, Xt = (e) => Array.isArray(e) ? e : [], qc = (e, t) => {
  const n = Object.keys(e), r = Object.keys(t);
  return n.length === r.length && n.every((i) => Object.is(e[i], t[i]));
}, Da = { xs: "12px", sm: "13px", base: "14px", lg: "16px" }, Ie = {
  muted: "var(--ant-color-text-secondary, #8c8c8c)",
  default: "var(--ant-color-text, #000000d9)",
  primary: "var(--ant-color-primary, #1677ff)",
  success: "var(--ant-color-success, #52c41a)",
  warning: "var(--ant-color-warning, #faad14)",
  error: "var(--ant-color-error, #ff4d4f)"
}, Jc = new Set(Ji);
function Vc(e) {
  const t = [], n = (r) => {
    Jc.has(r.kind) && t.push(r);
    for (const i of r.children || []) n(i);
  };
  for (const r of e.children || []) n(r);
  return t;
}
let Qn = null;
function zr(e) {
  return Qn || (Qn = e.createContext(null)), Qn;
}
function Kc({ node: e }) {
  var b;
  const t = (b = window.QwenPaw) == null ? void 0 : b.host, n = t == null ? void 0 : t.React, r = (t == null ? void 0 : t.antd) || {};
  if (!n) return null;
  const i = e.props || {}, a = n.useContext(Nn(n)), [o, l] = n.useState({}), [s, d] = n.useState(null), c = n.useMemo(
    () => Vc(e),
    [e]
  ), m = n.useMemo(() => {
    const g = {};
    for (const E of c) {
      const f = E.props || {}, h = ln(E);
      f.value !== void 0 ? g[h] = f.value : f.checked !== void 0 && (g[h] = f.checked);
    }
    return g;
  }, [c]);
  n.useEffect(() => l((g) => {
    const E = { ...m, ...g, ...(a == null ? void 0 : a.values) || {} };
    return qc(g, E) ? g : E;
  }), [m, a == null ? void 0 : a.values]);
  const u = n.useMemo(() => ({ values: o, setValue: (g, E) => {
    d(null), l((f) => ({ ...f, [g]: E })), a == null || a.setValue(g, E);
  } }), [o, a]), p = () => {
    var f, h;
    const g = c.filter((v) => {
      var w;
      return (w = v.props) == null ? void 0 : w.required;
    }).find((v) => {
      const w = ln(v), x = o[w];
      return x == null || x === "" || Array.isArray(x) && x.length === 0;
    });
    if (g) {
      d({ ok: !1, message: `${ee((f = g.props) == null ? void 0 : f.label) || ee((h = g.props) == null ? void 0 : h.name) || "必填项"}不能为空` });
      return;
    }
    const E = i.action && typeof i.action == "object" ? i.action : { type: "submit_form", payload: {} };
    d(pr(E, { formValues: o, formId: ee(i.formId) || e.nodeId }));
  };
  return n.createElement(
    zr(n).Provider,
    { value: u },
    n.createElement(
      "div",
      { style: { margin: "4px 0" } },
      i.title ? n.createElement("div", { style: { fontWeight: 600, marginBottom: 8 } }, ee(i.title)) : null,
      ...(e.children || []).map((g, E) => n.createElement(cn(n), { key: g.nodeId || E, node: g })),
      n.createElement(r.Button || "button", { type: "primary", size: "small", style: { marginTop: 8 }, onClick: p }, ee(i.submitLabel) || "提交"),
      s ? n.createElement("div", { role: "status", style: { marginTop: 6, fontSize: 12, color: s.ok ? Ie.success : Ie.error } }, s.message) : null
    )
  );
}
function Xc({ node: e, fieldType: t }) {
  var f, h, v;
  const n = (f = window.QwenPaw) == null ? void 0 : f.host, r = n == null ? void 0 : n.React, i = (n == null ? void 0 : n.antd) || {};
  if (!r) return null;
  const a = e.props || {}, o = r.useContext(zr(r)), l = r.useContext(Nn(r)), s = o || l, [d, c] = r.useState(a.value ?? a.checked ?? ""), m = ln(e), u = a.value ?? a.checked ?? "", p = s ? ((h = s.values) == null ? void 0 : h[m]) ?? u : d, b = (w) => {
    const x = w != null && w.target ? t === "Switch" ? w.target.checked : w.target.value : w;
    s ? s.setValue(m, x) : c(x);
  }, g = (w) => r.createElement(
    "div",
    { style: { display: "flex", flexDirection: "column", gap: 4, margin: "4px 0" } },
    a.label && t !== "Switch" ? r.createElement("label", { style: { fontSize: 12, color: Ie.muted } }, ee(a.label), a.required ? r.createElement("span", { style: { color: Ie.error } }, " *") : null) : null,
    w,
    a.description ? r.createElement("span", { style: { fontSize: 11, color: Ie.muted } }, ee(a.description)) : null
  ), E = ee(a.label) || ee(a.placeholder) || m;
  return t === "Input" ? g(r.createElement(i.Input || "input", { "aria-label": E, placeholder: ee(a.placeholder), value: p, onChange: b, size: "small" })) : t === "NumberInput" ? g(r.createElement(i.InputNumber || "input", { "aria-label": E, value: p, min: a.min, max: a.max, step: a.step, onChange: b, size: "small", style: { width: "100%" } })) : t === "Textarea" ? g(r.createElement(((v = i.Input) == null ? void 0 : v.TextArea) || "textarea", { "aria-label": E, placeholder: ee(a.placeholder), value: p, rows: ft(a.rows) || 3, onChange: b, style: { width: "100%" } })) : t === "Select" ? g(r.createElement(i.Select || "select", { "aria-label": E, placeholder: ee(a.placeholder), value: p || void 0, onChange: b, size: "small", style: { width: "100%" } }, Xt(a.options).map((w, x) => {
    var j;
    return r.createElement(((j = i.Select) == null ? void 0 : j.Option) || "option", { key: x, value: ee(typeof w == "object" ? w.value : w) }, ee(typeof w == "object" ? w.label : w));
  }))) : t === "Switch" ? r.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8 } }, r.createElement(i.Switch || "input", { type: "checkbox", checked: !!p, onChange: b, size: "small" }), r.createElement("span", null, ee(a.label))) : t === "Slider" ? g(r.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8 } }, r.createElement(i.Slider || "input", { type: "range", value: ft(p), min: a.min ?? 0, max: a.max ?? 100, step: a.step ?? 1, onChange: b, style: { flex: 1 } }), r.createElement("span", { style: { minWidth: 32, fontSize: 12 } }, ee(p)))) : t === "FileInput" ? r.createElement(
    "label",
    { style: { display: "inline-flex", alignItems: "center", gap: 8, cursor: "pointer" } },
    r.createElement("span", null, ee(a.label) || "选择文件"),
    r.createElement("input", { type: "file", multiple: gt(a.multiple), accept: ee(a.accept) || void 0, onChange: (w) => s == null ? void 0 : s.setValue(m, Array.from(w.target.files || []).map((x) => ({ name: x.name, size: x.size, type: x.type }))) })
  ) : null;
}
function er({ node: e, link: t = !1, toggle: n = !1 }) {
  var p;
  const r = (p = window.QwenPaw) == null ? void 0 : p.host, i = r == null ? void 0 : r.React, a = (r == null ? void 0 : r.antd) || {};
  if (!i) return null;
  const o = e.props || {}, l = i.useContext(zr(i)), [s, d] = i.useState(gt(o.checked)), [c, m] = i.useState(null), u = () => {
    n && d((b) => !b), o.action && typeof o.action == "object" ? m(pr(o.action, { formValues: l == null ? void 0 : l.values, formId: l ? "form" : void 0 })) : t && typeof o.href == "string" && m(pr({ type: "open_url", payload: { url: o.href } }));
  };
  return i.createElement(
    "span",
    { style: { display: "inline-flex", flexDirection: "column", gap: 3 } },
    i.createElement(a.Button || "button", { type: t ? "link" : (n ? s : ee(o.variant) === "primary") ? "primary" : "default", size: "small", disabled: gt(o.disabled), loading: gt(o.loading), onClick: u }, ee(o.label) || "Action"),
    c ? i.createElement("span", { role: "status", style: { fontSize: 11, color: c.ok ? Ie.success : Ie.error } }, c.message) : null
  );
}
let Fa = null, vn = null;
function Yc(e) {
  return vn && Fa === e || (Fa = e, vn = class extends e.Component {
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
        style: { padding: 8, border: "1px dashed var(--ant-color-error, #ff4d4f)", borderRadius: 8, fontSize: 12, color: Ie.error, fontFamily: "monospace" }
      }, `Component error: ${this.props.node.kind}`) : this.props.children;
    }
  }), vn;
}
function Zc({ node: e }) {
  var s;
  const t = (s = window.QwenPaw) == null ? void 0 : s.host;
  if (!(t != null && t.React)) return null;
  const n = t.React, r = t.antd || {}, i = cn(n), a = e.props || {}, o = e.children || [];
  return ed(n, r, e, a, o, () => o.map(
    (d, c) => n.createElement(i, { key: d.nodeId || c, node: d })
  ));
}
let wn = null, Ga = null;
function cn(e) {
  return wn && Ga === e || (wn = e.memo(Zc, (t, n) => t.node === n.node), Ga = e), wn;
}
function Qc({ node: e }) {
  var r;
  const t = (r = window.QwenPaw) == null ? void 0 : r.host;
  if (!(t != null && t.React)) return null;
  const n = t.React;
  return n.createElement(
    Yc(n),
    { node: e },
    n.createElement(cn(n), { node: e })
  );
}
function ed(e, t, n, r, i, a) {
  var o, l;
  switch (n.kind) {
    case "Stack":
      return e.createElement("div", { style: et("Stack", r) }, a());
    case "Row":
      return e.createElement("div", { style: et("Row", r) }, a());
    case "Grid":
      return e.createElement("div", { style: et("Grid", r) }, a());
    case "Spacer":
      return e.createElement("div", { style: et("Spacer", r) });
    case "ScrollArea":
      return e.createElement("div", { style: et("ScrollArea", r) }, a());
    case "AspectBox":
      return e.createElement("div", { style: et("AspectBox", r) }, a());
    case "Text":
      return e.createElement("div", { style: { fontSize: Da[ee(r.size)] || Da.base, color: Ie[ee(r.color)] || Ie.default, fontWeight: gt(r.bold) ? "bold" : "normal", lineHeight: 1.6 } }, ee(r.value));
    case "Heading": {
      const s = Ki(r.level), d = { 1: "24px", 2: "20px", 3: "18px", 4: "16px" };
      return e.createElement(`h${s}`, { style: { fontSize: d[s], fontWeight: "bold", margin: "4px 0" } }, ee(r.value));
    }
    case "Divider":
      return e.createElement(t.Divider || "hr", r.label ? { children: ee(r.label) } : {});
    case "Markdown": {
      const s = (o = window.QwenPaw) == null ? void 0 : o.host, d = s == null ? void 0 : s.ReactMarkdown;
      if (d) {
        const c = s != null && s.remarkGfm ? [s.remarkGfm] : [];
        return e.createElement(
          "div",
          { className: "qwenpaw-genui-markdown" },
          e.createElement(d, { children: ee(r.content || r.value), remarkPlugins: c })
        );
      }
      return e.createElement("div", { style: { whiteSpace: "pre-wrap", lineHeight: 1.6 } }, ee(r.content || r.value));
    }
    case "CodeBlock":
      return e.createElement("pre", { style: { padding: 12, background: "var(--ant-color-fill-tertiary, rgba(0,0,0,0.04))", borderRadius: 8, overflow: "auto", fontSize: 13, fontFamily: "monospace" } }, ee(r.code));
    case "SectionHeader":
      return e.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8, marginBottom: 8 } }, r.icon ? e.createElement("span", { style: { fontSize: 20 } }, ee(r.icon)) : null, e.createElement("div", null, e.createElement("div", { style: { fontSize: 16, fontWeight: 600 } }, ee(r.title)), r.subtitle ? e.createElement("div", { style: { fontSize: 12, color: Ie.muted } }, ee(r.subtitle)) : null));
    case "KeyValueList": {
      const s = Xt(r.items);
      return e.createElement(
        "div",
        { style: { display: "flex", flexDirection: "column", gap: 4 } },
        ...s.map((d, c) => e.createElement(
          "div",
          { key: c, style: { display: "flex", justifyContent: "space-between", padding: "2px 0", borderBottom: c < s.length - 1 ? "1px solid var(--ant-color-border-secondary, #f0f0f0)" : "none" } },
          e.createElement("span", { style: { color: Ie.muted, fontSize: 13 } }, ee(d.key)),
          e.createElement("span", { style: { fontWeight: 500, fontSize: 13 } }, ee(d.value))
        ))
      );
    }
    case "Badge":
      return e.createElement(t.Tag || "span", { color: ee(r.variant) || "default", children: ee(r.value) });
    case "Tag":
      return e.createElement(t.Tag || "span", { color: ee(r.color) || "default", children: ee(r.label) });
    case "Stat":
      return e.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 2 } }, e.createElement("span", { style: { fontSize: 12, color: Ie.muted } }, ee(r.label)), e.createElement("span", { style: { fontSize: 20, fontWeight: "bold" } }, ee(r.value)), r.delta ? e.createElement("span", { style: { fontSize: 12, color: ee(r.trend) === "up" ? Ie.success : ee(r.trend) === "down" ? Ie.error : Ie.muted } }, ee(r.delta)) : null);
    case "Progress":
      return e.createElement(t.Progress || "div", { percent: ft(r.value), size: "small" });
    case "Skeleton": {
      const s = ft(r.rows) || 3;
      return e.createElement(
        "div",
        { style: { display: "flex", flexDirection: "column", gap: 8 } },
        ...Array.from({ length: s }).map(
          (d, c) => e.createElement(t.Skeleton || "div", { key: c, active: gt(r.active), title: !1, paragraph: { rows: 1 } })
        )
      );
    }
    case "Avatar":
      return e.createElement(nd, {
        src: ee(r.src),
        name: ee(r.name),
        size: ft(r.size) || 32
      });
    case "Icon": {
      const s = Yi(r.name), d = ft(r.size) || 16, c = Ie[ee(r.color)] || Ie.default;
      return s.kind === "emoji" ? e.createElement("span", { "aria-hidden": !0, style: { fontSize: d, color: c, lineHeight: 1 } }, s.text) : s.kind === "svg" ? e.createElement("svg", {
        width: d,
        height: d,
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: c,
        strokeWidth: 2,
        strokeLinecap: "round",
        strokeLinejoin: "round",
        "aria-hidden": !0,
        focusable: "false",
        style: { display: "inline-block", verticalAlign: "middle" }
      }, ...s.paths.map((m, u) => e.createElement("path", { key: u, d: m }))) : e.createElement("span", { "aria-hidden": !0, style: { width: d, height: d, display: "inline-block" } });
    }
    case "Card":
      return e.createElement(t.Card || "div", { title: r.title ? ee(r.title) : void 0, size: "small", style: { margin: "4px 0" } }, a());
    case "DataCard":
      return e.createElement(t.Card || "div", { size: "small", style: { margin: "4px 0" } }, e.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center" } }, e.createElement("div", null, e.createElement("div", { style: { fontSize: 12, color: Ie.muted } }, ee(r.title)), e.createElement("div", { style: { fontSize: 24, fontWeight: "bold" } }, ee(r.value))), r.icon ? e.createElement("span", { style: { fontSize: 32 } }, ee(r.icon)) : null));
    case "MetricCard":
      return e.createElement(t.Card || "div", { size: "small", style: { margin: "4px 0" } }, e.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center" } }, e.createElement("div", null, e.createElement("div", { style: { fontSize: 12, color: Ie.muted } }, ee(r.title)), e.createElement("div", { style: { fontSize: 24, fontWeight: "bold" } }, ee(r.value)), r.delta ? e.createElement("span", { style: { fontSize: 12, color: ee(r.trend) === "up" ? Ie.success : ee(r.trend) === "down" ? Ie.error : Ie.muted } }, `${ee(r.delta)} ${r.period ? ee(r.period) : ""}`.trim()) : null), r.icon ? e.createElement("span", { style: { fontSize: 32 } }, ee(r.icon)) : null));
    case "AlertCard":
    case "Alert":
      return e.createElement(t.Alert || "div", { type: ee(r.severity) === "success" ? "success" : ee(r.severity) === "warning" ? "warning" : ee(r.severity) === "error" ? "error" : "info", message: r.title ? ee(r.title) : void 0, description: ee(r.message), showIcon: !0, style: { margin: "4px 0" } });
    case "Callout":
      return e.createElement(t.Alert || "div", { type: ee(r.variant) === "tip" ? "success" : ee(r.variant) === "warning" ? "warning" : ee(r.variant) === "important" ? "error" : "info", message: r.title ? ee(r.title) : void 0, description: ee(r.message), showIcon: !0 });
    case "TimelineCard":
      return e.createElement(t.Card || "div", { size: "small", style: { margin: "4px 0" } }, e.createElement("div", { style: { display: "flex", gap: 8, alignItems: "flex-start" } }, e.createElement("div", { style: { width: 8, height: 8, borderRadius: "50%", background: ee(r.status) === "done" ? Ie.success : ee(r.status) === "pending" ? Ie.warning : Ie.primary, marginTop: 4, flexShrink: 0 } }), e.createElement("div", null, e.createElement("div", { style: { fontWeight: 600 } }, ee(r.title)), r.date ? e.createElement("div", { style: { fontSize: 12, color: Ie.muted } }, ee(r.date)) : null, r.description ? e.createElement("div", { style: { fontSize: 13, marginTop: 4 } }, ee(r.description)) : null)));
    case "KpiBoard":
      return e.createElement("div", { style: { margin: "4px 0" } }, r.title ? e.createElement("div", { style: { fontSize: 16, fontWeight: 600, marginBottom: 8 } }, ee(r.title)) : null, e.createElement("div", { style: et("KpiBoard", r) }, a()));
    case "FeatureGrid":
      return e.createElement("div", { style: { ...et("FeatureGrid", r), margin: "4px 0" } }, a());
    case "Stepper": {
      const s = Xt(r.steps).map((c) => ee(c)), d = ft(r.current);
      return e.createElement(
        t.Steps || "div",
        { current: d, size: "small", style: { margin: "4px 0" } },
        ...s.map((c, m) => {
          var u;
          return e.createElement(((u = t.Steps) == null ? void 0 : u.Item) || "div", { key: m, title: c });
        })
      );
    }
    case "Table": {
      const s = Xt(r.headers).map((u) => ee(u)), c = i.filter((u) => u.kind === "TableRow").map((u, p) => {
        const b = (u.children || []).filter((E) => E.kind === "TableCell"), g = { key: p };
        return s.forEach((E, f) => {
          var v, w;
          const h = (w = (v = b[f]) == null ? void 0 : v.props) == null ? void 0 : w.value;
          g[E] = h == null ? "" : ee(h);
        }), g;
      }), m = s.map((u) => ({ title: u, dataIndex: u, key: u }));
      return e.createElement(t.Table || "table", { dataSource: c, columns: m, size: gt(r.compact) ? "small" : "middle", pagination: !1, style: { margin: "4px 0" } });
    }
    case "List": {
      const s = i.filter((d) => d.kind === "ListItem");
      return e.createElement(
        t.List || "ul",
        { size: "small", style: { margin: "4px 0" } },
        s.map((d, c) => {
          var m, u, p;
          return e.createElement(((m = t.List) == null ? void 0 : m.Item) || "li", { key: c }, (u = d.props) != null && u.icon ? e.createElement("span", { style: { marginRight: 6 } }, ee(d.props.icon)) : null, ee((p = d.props) == null ? void 0 : p.value));
        })
      );
    }
    case "ImageGallery": {
      const s = i.filter((d) => d.kind === "Image");
      return e.createElement(
        "div",
        { style: { ...et("ImageGallery", r), margin: "4px 0" } },
        ...s.map((d, c) => {
          const m = d.props || {};
          return e.createElement(fr, { key: c, src: ee(m.src), alt: ee(m.alt), style: { width: "100%", height: 120, objectFit: "cover", borderRadius: 8, cursor: "pointer" } });
        })
      );
    }
    case "Image":
      return e.createElement("div", null, e.createElement(fr, { src: ee(r.src), alt: ee(r.alt), style: { maxWidth: "100%", borderRadius: gt(r.rounded) ? "8px" : void 0, maxHeight: r.maxHeight ? `${ft(r.maxHeight)}px` : void 0 } }), r.caption ? e.createElement("div", { style: { fontSize: 12, color: Ie.muted } }, ee(r.caption)) : null);
    case "Chart":
      return e.createElement(td, { props: r });
    case "Button":
    case "InteractiveButton":
      return e.createElement(er, { node: n });
    case "ToggleButton":
      return e.createElement(er, { node: n, toggle: !0 });
    case "LinkButton":
      return e.createElement(er, { node: n, link: !0 });
    case "Input":
    case "NumberInput":
    case "Select":
    case "Textarea":
    case "Switch":
    case "Slider":
    case "FileInput":
      return e.createElement(Xc, { node: n, fieldType: n.kind });
    case "Form":
      return e.createElement(Kc, { node: n });
    case "Chip":
      return e.createElement(t.Tag || "span", { color: ee(r.color) || "default", closable: !0, onClose: () => {
      }, children: ee(r.label) });
    case "ChipGroup": {
      const s = Xt(r.items);
      return e.createElement("div", { style: { display: "flex", flexWrap: "wrap", gap: 4 } }, ...s.map((d, c) => e.createElement(t.Tag || "span", { key: c }, ee(d))));
    }
    case "Tabs": {
      const s = cn(e), c = i.filter((m) => m.kind === "TabItem").map((m) => {
        var u, p, b;
        return {
          key: ee((u = m.props) == null ? void 0 : u.key) || ee((p = m.props) == null ? void 0 : p.tab),
          label: ee((b = m.props) == null ? void 0 : b.tab),
          children: (m.children || []).map((g, E) => e.createElement(s, { key: g.nodeId || E, node: g }))
        };
      });
      return t.Tabs ? e.createElement(t.Tabs, { items: c, defaultActiveKey: ee(r.activeKey) || ((l = c[0]) == null ? void 0 : l.key) }) : e.createElement("div", null, ...c.map((m, u) => e.createElement("div", { key: u }, e.createElement("div", { style: { fontWeight: 600, marginBottom: 4 } }, m.label), m.children)));
    }
    case "TabItem":
      return e.createElement("div", null, a());
    case "Accordion": {
      const s = cn(e), d = i.filter((c) => c.kind === "AccordionItem");
      if (t.Collapse) {
        const c = d.map((m) => {
          var u, p, b;
          return {
            key: ee((u = m.props) == null ? void 0 : u.key) || ee((p = m.props) == null ? void 0 : p.header),
            label: ee((b = m.props) == null ? void 0 : b.header),
            children: (m.children || []).map((g, E) => e.createElement(s, { key: g.nodeId || E, node: g }))
          };
        });
        return e.createElement(t.Collapse, { items: c });
      }
      return e.createElement("div", null, ...d.map((c, m) => {
        var u;
        return e.createElement("details", { key: m }, e.createElement("summary", { style: { fontWeight: 600, cursor: "pointer", padding: "4px 0" } }, ee((u = c.props) == null ? void 0 : u.header)), e.createElement("div", { style: { paddingLeft: 12 } }, (c.children || []).map((p, b) => e.createElement(s, { key: p.nodeId || b, node: p }))));
      }));
    }
    case "AccordionItem":
      return e.createElement("div", null, a());
    case "JsonDebug":
      return e.createElement("details", { style: { margin: "4px 0", fontSize: 12 } }, e.createElement("summary", null, ee(r.label) || "Debug JSON"), e.createElement("pre", { style: { fontSize: 12, padding: 8, background: "var(--ant-color-fill-tertiary, rgba(0,0,0,0.04))", borderRadius: 4, overflow: "auto" } }, JSON.stringify(r.data ?? r, null, 2)));
    default:
      return e.createElement("div", { style: { padding: 8, border: "1px dashed var(--ant-color-border, #d9d9d9)", borderRadius: 8, fontSize: 12, color: Ie.muted, fontFamily: "monospace" } }, `Unknown component: ${n.kind}`);
  }
}
function td({ props: e }) {
  var j, X;
  const t = (X = (j = window.QwenPaw) == null ? void 0 : j.host) == null ? void 0 : X.React;
  if (!t) return null;
  const n = t.useContext(Nn(t)), r = $r(e, n == null ? void 0 : n.values), i = r.chartType, a = r.title, o = r.categories, l = r.series, s = r.height, d = r.showLegend, c = 400;
  if (r.empty)
    return t.createElement("div", { style: { padding: 12, color: Ie.muted, fontSize: 12 } }, "Chart: no data");
  if (i === "pie") {
    const T = l[0].values.map((B) => Math.abs(B)), A = T.reduce((B, _) => B + _, 0) || 1, F = c / 2, N = s / 2, C = Math.min(c, s) / 2 - 20;
    let k = -Math.PI / 2;
    const z = T.map((B, _) => {
      const L = B / A * 2 * Math.PI, D = F + C * Math.cos(k), Y = N + C * Math.sin(k), O = F + C * Math.cos(k + L), I = N + C * Math.sin(k + L), q = L > Math.PI ? 1 : 0, H = `M ${F} ${N} L ${D} ${Y} A ${C} ${C} 0 ${q} 1 ${O} ${I} Z`;
      return k += L, { path: H, color: It[_ % It.length], label: o[_] || `#${_ + 1}`, val: B };
    });
    return t.createElement(
      "div",
      { style: { margin: "4px 0" } },
      a ? t.createElement("div", { style: { fontSize: 13, fontWeight: 600, marginBottom: 4 } }, a) : null,
      t.createElement(
        "svg",
        { width: c, height: s, style: { maxWidth: "100%" } },
        ...z.map((B, _) => t.createElement("path", { key: _, d: B.path, fill: B.color, stroke: "#fff", strokeWidth: 1 }))
      ),
      d ? t.createElement(
        "div",
        { style: { display: "flex", flexWrap: "wrap", gap: 8, marginTop: 4, fontSize: 11 } },
        ...z.map((B, _) => t.createElement(
          "span",
          { key: _, style: { display: "flex", alignItems: "center", gap: 4 } },
          t.createElement("span", { style: { display: "inline-block", width: 10, height: 10, borderRadius: 2, background: B.color } }),
          `${B.label}: ${B.val}`
        ))
      ) : null
    );
  }
  const m = l.flatMap((T) => T.values), u = Math.max(...m, 0), p = Math.min(...m, 0), b = u - p || 1, g = o.length > 0 ? (c - 40) / o.length : 0, E = l.length > 0 ? Math.max(1, g / l.length - 2) : 0, f = o.length > 1 ? (c - 40) / (o.length - 1) : 0, h = Math.max(1, Math.ceil(o.length / 8)), v = (T) => s - 20 - (T - p) / b * (s - 40), w = v(0), x = (T) => 30 + T * f;
  return t.createElement(
    "div",
    { style: { margin: "4px 0" } },
    a ? t.createElement("div", { style: { fontSize: 13, fontWeight: 600, marginBottom: 4 } }, a) : null,
    t.createElement(
      "svg",
      { width: c, height: s, style: { maxWidth: "100%" } },
      ...[0, 0.25, 0.5, 0.75, 1].map((T, A) => {
        const F = s - 20 - T * (s - 40);
        return t.createElement("line", { key: `g${A}`, x1: 30, y1: F, x2: c - 10, y2: F, stroke: "var(--ant-color-border-secondary, #f0f0f0)", strokeWidth: 1 });
      }),
      ...o.map((T, A) => A % h === 0 || A === o.length - 1 ? t.createElement("text", { key: `x${A}`, x: x(A), y: s - 6, fontSize: 10, fill: Ie.muted, textAnchor: "middle" }, T.length > 6 ? T.slice(0, 6) + "…" : T) : null),
      ...l.map((T, A) => {
        const F = It[A % It.length];
        if (i === "bar")
          return T.values.map((k, z) => t.createElement("rect", {
            key: `b${A}-${z}`,
            x: 30 + z * g + A * (E + 2) + 1,
            y: Math.min(v(k), w),
            width: E,
            height: Math.abs(w - v(k)),
            fill: F,
            rx: 2
          }));
        const N = T.values.map((k, z) => `${x(z)},${v(k)}`).join(" "), C = [t.createElement("polyline", { key: `l${A}`, points: N, fill: "none", stroke: F, strokeWidth: 2 })];
        if (i === "area") {
          const k = `${x(0)},${s - 20} ${N} ${x(T.values.length - 1)},${s - 20}`;
          C.unshift(t.createElement("polygon", { key: `a${A}`, points: k, fill: F, opacity: 0.15 }));
        }
        return C;
      })
    ),
    d ? t.createElement(
      "div",
      { style: { display: "flex", flexWrap: "wrap", gap: 8, marginTop: 4, fontSize: 11 } },
      ...l.map((T, A) => t.createElement(
        "span",
        { key: A, style: { display: "flex", alignItems: "center", gap: 4 } },
        t.createElement("span", { style: { display: "inline-block", width: 10, height: 10, borderRadius: 2, background: It[A % It.length] } }),
        T.name
      ))
    ) : null
  );
}
function fr(e) {
  var d;
  const t = (d = window.QwenPaw) == null ? void 0 : d.host, n = t == null ? void 0 : t.React;
  if (!n) return null;
  const { useState: r, useEffect: i } = n, [a, o] = r(
    Ua(e.src) || (An(e.src) ? e.src : null)
  ), [l, s] = r(
    Na(e.src)
  );
  return i(() => {
    if (!e.src) return;
    if (An(e.src)) {
      o(e.src), s(null);
      return;
    }
    const c = Ua(e.src);
    if (c) {
      o(c), s(null);
      return;
    }
    o(null), s(null);
    let m = !1;
    return Oc(e.src).then((u) => {
      m || (o(u), s(u ? null : Na(e.src)));
    }), () => {
      m = !0;
    };
  }, [e.src]), a ? n.createElement("img", {
    src: a,
    alt: e.alt || "",
    "data-genui-media-source": e.src,
    style: e.style || {},
    onError: () => {
      console.warn("[ugsci.genui] Image failed to load:", e.src);
    }
  }) : n.createElement(
    "div",
    {
      role: l ? "alert" : "status",
      style: {
        ...e.style || {},
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: 80,
        padding: 12,
        textAlign: "center",
        color: l ? Ie.error : Ie.muted,
        fontSize: 12,
        background: "var(--ant-color-fill-tertiary, rgba(0,0,0,0.04))",
        borderRadius: 8
      }
    },
    l ? `媒体加载失败：${l}` : "正在解析图片…"
  );
}
function nd(e) {
  var i, a, o;
  const t = (i = window.QwenPaw) == null ? void 0 : i.host, n = t == null ? void 0 : t.React, r = (t == null ? void 0 : t.antd) || {};
  return n ? e.src ? n.createElement(fr, {
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
    ((o = (a = e.name) == null ? void 0 : a.charAt(0)) == null ? void 0 : o.toUpperCase()) || ""
  ) : null;
}
const rd = `#genui-root { max-width: 960px; margin: auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px; background: #fff; box-shadow: 0 8px 30px rgba(0,0,0,.05); }
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
@media print { body { padding: 0; } }`, Wa = {
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
function ad(e) {
  return e.replace(/[&<>"']/g, (t) => t === "&" ? "&amp;" : t === "<" ? "&lt;" : t === ">" ? "&gt;" : t === '"' ? "&quot;" : "&#39;");
}
function id(e) {
  return JSON.stringify(e).replace(/</g, "\\u003c");
}
function te(e, t = "", n) {
  const r = document.createElement(e);
  return t && (r.className = t), n != null && n !== "" && (r.textContent = we(n)), r;
}
function Sn(e, t) {
  Object.assign(e.style, t);
}
function qt(e, t, n) {
  for (const r of t || []) e.appendChild(Pr(r, n));
  return e;
}
function Ha(e, t, n) {
  return t && e.appendChild(te("div", "muted small", t)), e.appendChild(te("div", "display-value", n)), e;
}
function Qi(e, t, n, r) {
  const i = we(e);
  if (r.missing.has(i)) {
    const o = te("div", `media-unavailable ${n}`.trim(), "此媒体未能离线嵌入");
    return o.setAttribute("role", "img"), o.setAttribute("aria-label", we(t)), o;
  }
  const a = te("img", n);
  return a.src = r.media[i] || i, a.alt = we(t), a;
}
function od(e, t, n) {
  return e ? Qi(e, t, "avatar", n) : te("span", "avatar avatar-fallback", we(t).charAt(0).toUpperCase());
}
function sd(e) {
  const t = te("div", "markdown");
  let n = null;
  for (const r of we(e).split(/\r?\n/)) {
    const i = r.match(/^(#{1,4})\s+(.*)$/), a = r.match(/^\s*[-*]\s+(.*)$/);
    i ? (n = null, t.appendChild(te(`h${i[1].length}`, "", i[2]))) : a ? (n || (n = te("ul"), t.appendChild(n)), n.appendChild(te("li", "", a[1]))) : r.trim() ? (n = null, t.appendChild(te("p", "", r))) : (n = null, t.appendChild(document.createElement("br")));
  }
  return t;
}
function ld(e, t) {
  const n = e.props || {}, r = e.kind, i = ln(e), a = te("label", "field");
  n.label && r !== "Switch" && a.appendChild(te("span", "field-label", `${we(n.label)}${n.required ? " *" : ""}`));
  let o;
  if (r === "Textarea") {
    const s = te("textarea");
    s.rows = tt(n.rows) || 3, s.placeholder = we(n.placeholder), o = s;
  } else if (r === "Select") {
    const s = te("select");
    for (const d of Kt(n.options)) {
      const c = te("option"), m = d && typeof d == "object" ? d : null;
      c.value = we(m ? m.value : d), c.textContent = we(m ? m.label : d), s.appendChild(c);
    }
    o = s;
  } else {
    const s = te("input");
    s.type = r === "Slider" ? "range" : r === "Switch" ? "checkbox" : r === "NumberInput" ? "number" : r === "FileInput" ? "file" : "text", n.min != null && (s.min = we(n.min)), n.max != null && (s.max = we(n.max)), n.step != null && (s.step = we(n.step)), r === "FileInput" ? (n.accept && (s.accept = we(n.accept)), s.multiple = nn(n.multiple)) : s.placeholder = we(n.placeholder), o = s;
  }
  const l = Object.prototype.hasOwnProperty.call(t.values, i) ? t.values[i] : n.value != null ? n.value : n.checked != null ? n.checked : "";
  if (r === "Switch") {
    const s = o;
    s.checked = nn(l), s.checked ? s.setAttribute("checked", "") : s.removeAttribute("checked");
  } else if (r === "Textarea")
    o.value = we(l), o.textContent = we(l);
  else if (r === "Select") {
    const s = we(l);
    o.value = s;
    for (const d of Array.from(o.options))
      d.value === s ? d.setAttribute("selected", "") : d.removeAttribute("selected");
  } else r !== "FileInput" && (o.value = we(l), o.setAttribute("value", we(l)));
  if (o.setAttribute("data-genui-field", i), o.setAttribute("data-genui-kind", r), r === "Switch") {
    const s = te("span", "switch-line");
    s.append(o, te("span", "", n.label)), a.appendChild(s);
  } else if (r === "Slider") {
    const s = te("span", "slider-line");
    s.append(o, te("output", "slider-value", l)), a.appendChild(s);
  } else
    a.appendChild(o);
  return n.description && a.appendChild(te("small", "description", n.description)), a;
}
function Pr(e, t) {
  var a, o, l, s, d, c, m;
  if (!e || typeof e != "object") return te("div");
  const n = e.props || {}, r = e.children || [];
  if (Vi(e.kind)) return ld(e, t);
  if (e.kind === "Chart") {
    const u = te("div", "chart");
    return u.setAttribute("data-genui-chart", JSON.stringify(n)), Xi(u, $r(n, t.values)), u;
  }
  if (e.kind === "Heading") return te(`h${Ki(n.level)}`, "", n.value);
  if (e.kind === "Text") return te("div", nn(n.bold) ? "text bold" : "text", n.value);
  if (e.kind === "Markdown") return sd(n.content || n.value);
  if (e.kind === "CodeBlock") return te("pre", "code", n.code);
  if (e.kind === "SectionHeader") {
    const u = te("div", "section-header");
    n.icon && u.appendChild(te("span", "section-icon", n.icon));
    const p = te("div");
    return p.appendChild(te("strong", "", n.title)), n.subtitle && p.appendChild(te("div", "muted small", n.subtitle)), u.appendChild(p), u;
  }
  if (e.kind === "KeyValueList") {
    const u = te("dl", "key-values");
    for (const p of Kt(n.items)) {
      const b = p && typeof p == "object" ? p : {};
      u.append(te("dt", "", b.key), te("dd", "", b.value));
    }
    return u;
  }
  if (e.kind === "Divider") {
    const u = te("div", "divider");
    return n.label && u.appendChild(te("span", "", n.label)), u;
  }
  if (e.kind === "Spacer") {
    const u = te("div");
    return Sn(u, et("Spacer", n)), u;
  }
  if (e.kind === "Tabs") {
    const u = te("div", "tabs");
    u.setAttribute("data-genui-tabs", "1");
    const p = te("div", "tab-buttons"), b = te("div");
    return r.filter((E) => E.kind === "TabItem").forEach((E, f) => {
      var h;
      p.appendChild(te("button", f ? "" : "active", (h = E.props) == null ? void 0 : h.tab)), b.appendChild(qt(te("div", f ? "tab-panel hidden" : "tab-panel"), E.children, t));
    }), u.append(p, b), u;
  }
  if (e.kind === "Accordion") {
    const u = te("div");
    for (const p of r.filter((b) => b.kind === "AccordionItem")) {
      const b = te("details");
      b.append(te("summary", "", (a = p.props) == null ? void 0 : a.header), qt(te("div", "accordion-body"), p.children, t)), u.appendChild(b);
    }
    return u;
  }
  if (e.kind === "Form") {
    const u = te("div", "stack form");
    n.title && u.appendChild(te("div", "card-title", n.title)), qt(u, r, t);
    const p = te("button", "button", we(n.submitLabel) || "提交");
    return p.setAttribute("data-genui-submit", "1"), u.appendChild(p), u;
  }
  if (jc.has(e.kind)) {
    const u = te("button", e.kind === "LinkButton" ? "link-button" : "button", we(n.label) || "Action");
    return nn(n.disabled) && (u.disabled = !0), u.setAttribute("data-genui-action", e.kind), e.kind === "LinkButton" && Dc(n.href) && u.setAttribute("data-genui-href", we(n.href).trim()), u;
  }
  if (e.kind === "Image") {
    const u = te("figure");
    return u.appendChild(Qi(n.src, n.alt, "", t)), n.caption && u.appendChild(te("figcaption", "", n.caption)), u;
  }
  if (e.kind === "ImageGallery") {
    const u = te("div", "image-gallery");
    Sn(u, et("ImageGallery", n));
    for (const p of r.filter((b) => b.kind === "Image"))
      u.appendChild(Pr(p, t));
    return u;
  }
  if (e.kind === "Avatar") return od(n.src, n.name, t);
  if (e.kind === "Badge" || e.kind === "Tag" || e.kind === "Chip")
    return te("span", "tag", n.value || n.label);
  if (e.kind === "Progress") {
    const u = te("progress");
    return u.max = 100, u.value = tt(n.value), u;
  }
  if (e.kind === "Stat") {
    const u = te("div", "stat");
    return u.append(te("span", "muted small", n.label), te("strong", "stat-value", n.value)), n.delta && u.appendChild(te("span", `small trend-${we(n.trend)}`, n.delta)), u;
  }
  if (e.kind === "DataCard" || e.kind === "MetricCard") {
    const u = te("div", "card metric-card"), p = Ha(te("div"), n.title, n.value);
    return n.delta && p.appendChild(te("div", `small trend-${we(n.trend)}`, `${we(n.delta)}${n.period ? ` ${we(n.period)}` : ""}`)), u.appendChild(p), n.icon && u.appendChild(te("span", "metric-icon", n.icon)), u;
  }
  if (e.kind === "TimelineCard") {
    const u = te("div", "card timeline");
    return u.append(te("i", `timeline-dot status-${we(n.status)}`), Ha(te("div"), n.title, n.date)), n.description && u.appendChild(te("div", "small", n.description)), u;
  }
  if (e.kind === "Stepper") {
    const u = te("ol", "stepper");
    return Kt(n.steps).forEach((p, b) => {
      u.appendChild(te("li", b <= tt(n.current) ? "active" : "", p));
    }), u;
  }
  if (e.kind === "Table") {
    const u = te("table", "data-table"), p = te("thead"), b = te("tr");
    for (const E of Kt(n.headers)) b.appendChild(te("th", "", E));
    p.appendChild(b);
    const g = te("tbody");
    for (const E of r.filter((f) => f.kind === "TableRow")) {
      const f = te("tr", (o = E.props) != null && o.highlight ? "highlight" : "");
      for (const h of (E.children || []).filter((v) => v.kind === "TableCell")) {
        const v = te("td", (l = h.props) != null && l.bold ? "bold" : "", (s = h.props) == null ? void 0 : s.value);
        (d = h.props) != null && d.align && (v.style.textAlign = we(h.props.align)), f.appendChild(v);
      }
      g.appendChild(f);
    }
    return u.append(p, g), u;
  }
  if (e.kind === "List") {
    const u = te(nn(n.ordered) ? "ol" : "ul", "data-list");
    for (const p of r.filter((b) => b.kind === "ListItem"))
      u.appendChild(te("li", "", `${(c = p.props) != null && c.icon ? `${we(p.props.icon)} ` : ""}${we((m = p.props) == null ? void 0 : m.value)}`));
    return u;
  }
  if (e.kind === "ChipGroup") {
    const u = te("div", "chips");
    for (const p of Kt(n.items)) u.appendChild(te("span", "tag", p));
    return u;
  }
  if (e.kind === "Skeleton") {
    const u = te("div", "skeletons");
    for (let p = 0; p < (tt(n.rows) || 3); p += 1) u.appendChild(te("i", "skeleton"));
    return u;
  }
  if (e.kind === "Icon") {
    const u = te("span", "icon");
    return Wc(u, n.name, { size: tt(n.size) || 16 }), u;
  }
  if (e.kind === "JsonDebug") {
    const u = te("details");
    return u.append(
      te("summary", "", we(n.label) || "Debug JSON"),
      te("pre", "code", JSON.stringify(n.data == null ? n : n.data, null, 2))
    ), u;
  }
  if (e.kind === "KpiBoard") {
    const u = te("div", "stack");
    n.title && u.appendChild(te("div", "card-title", n.title));
    const p = te("div", "grid");
    return Sn(p, et("KpiBoard", n)), qt(p, r, t), u.appendChild(p), u;
  }
  if (!Object.prototype.hasOwnProperty.call(Wa, e.kind))
    return te("div", "unknown-component", `Unknown component: ${we(e.kind)}`);
  const i = te("div", Wa[e.kind]);
  return Sn(i, et(e.kind, n)), e.kind === "Card" && n.title && i.appendChild(te("div", "card-title", n.title)), e.kind === "Card" && n.subtitle && i.appendChild(te("div", "muted small card-subtitle", n.subtitle)), (e.kind === "Alert" || e.kind === "AlertCard" || e.kind === "Callout") && (n.title || n.message) ? (n.title && i.appendChild(te("strong", "", n.title)), n.message && i.appendChild(te("div", "", n.message))) : qt(i, r, t), i;
}
function qa(e, t) {
  const n = Function.prototype.toString.call(e).replace(/^export\s+/, "").trim();
  if (!n.includes("{")) throw new Error(`cannot serialize ${t}`);
  return `var ${t} = (${n});`;
}
function cd() {
  return `(function () {
  "use strict";
  ${qa($r, "resolveChartModel")}
  ${qa(Xi, "paintChartElement")}
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
function dd(e, t = {}, n = { sources: {}, missing: [] }) {
  const r = te("main");
  return r.id = "genui-root", r.appendChild(Pr(e, {
    values: t,
    media: n.sources || {},
    missing: new Set(n.missing || [])
  })), r;
}
function eo(e, t = {}, n = { sources: {}, missing: [] }, r = "GenUI") {
  const i = dd(e, t, n);
  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${ad(String(r || "GenUI").slice(0, 120))}</title>
  <style>
    :root { color-scheme: light; }
    html, body { margin: 0; padding: 0; background: #f5f7fa; color: #1f2329; }
    body { padding: 24px; font-family: system-ui, -apple-system, "Segoe UI", sans-serif; }
    *, *::before, *::after { box-sizing: border-box; }
    ${rd}
  </style>
</head>
<body>${i.outerHTML}
<script id="genui-values-data" type="application/json">${id(t)}<\/script>
<script>${cd()}<\/script></body>
</html>`;
}
function to(e, t) {
  const n = document.createElement("a");
  n.download = t, n.href = e, n.click();
}
async function ud(e, t) {
  const { toPng: n } = await Promise.resolve().then(() => nm), r = await n(e, {
    cacheBust: !0,
    pixelRatio: Math.min(window.devicePixelRatio || 1, 2),
    backgroundColor: "#ffffff"
  });
  to(r, `${t}.png`), console.info("[ugsci.genui] PNG export created", { filename: t, via: "html-to-image" });
}
function md(e) {
  return new Promise((t, n) => {
    const r = new FileReader();
    r.onload = () => t(String(r.result || "")), r.onerror = () => n(r.error || new Error("media encoding failed")), r.readAsDataURL(e);
  });
}
async function pd(e) {
  const t = e.currentSrc || e.src;
  if (!t) return null;
  if (t.startsWith("data:")) return t;
  try {
    const n = await fetch(t);
    return n.ok ? await md(await n.blob()) : null;
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
async function no(e) {
  const t = {}, n = [], r = Array.from(e.querySelectorAll("img[data-genui-media-source]"));
  return await Promise.all(r.map(async (i) => {
    const a = i.dataset.genuiMediaSource || "", o = await pd(i);
    a && (o ? t[a] = o : n.push(a));
  })), { sources: t, missing: Array.from(new Set(n)) };
}
async function fd(e, t, n, r, i = r) {
  const a = await no(e), o = eo(t, n, a, i), l = new Blob([o], { type: "text/html;charset=utf-8" }), s = URL.createObjectURL(l);
  to(s, `${r}.html`), setTimeout(() => URL.revokeObjectURL(s), 1e3), a.missing.length && console.warn("[ugsci.genui] HTML export has media that could not be embedded", { filename: r, missing: a.missing }), console.info("[ugsci.genui] HTML export created", { filename: r, bytes: l.size, embeddedMedia: Object.keys(a.sources).length, missingMedia: a.missing.length });
}
async function gd(e, t, n, r) {
  const i = await no(e), a = eo(t, n, i, r), o = window.open("", "_blank", "noopener,noreferrer");
  if (!o) throw new Error("print window was blocked");
  o.document.open(), o.document.write(a), o.document.close(), await new Promise((l) => {
    const s = () => l();
    if (o.document.readyState === "complete") {
      window.setTimeout(s, 50);
      return;
    }
    o.addEventListener("load", s, { once: !0 }), window.setTimeout(s, 400);
  }), o.focus(), o.print(), o.close(), i.missing.length && console.warn("[ugsci.genui] PDF print has media that could not be embedded", { missing: i.missing });
}
const Je = "var(--ant-color-text, rgba(0, 0, 0, 0.88))", Fe = "var(--ant-color-text-secondary, rgba(0, 0, 0, 0.45))", Pt = "var(--ant-color-border-secondary, #f0f0f0)", gr = "var(--ant-color-bg-container, #fff)", yr = "var(--ant-color-fill-quaternary, rgba(0, 0, 0, 0.02))", ro = "var(--ant-color-success, #52c41a)", yd = "var(--ant-color-success-bg, #f6ffed)", hd = "var(--ant-color-warning, #faad14)", Ed = "var(--ant-color-warning-bg, #fffbe6)", ao = "var(--ant-color-error, #ff4d4f)", bd = "var(--ant-color-error-bg, #fff2f0)", Ja = "var(--ant-color-primary, #1677ff)", vd = {
  derived_expression: "推导结果",
  effective_inventory: "有效库存",
  estimated_ogip: "估算原始储量",
  initial_p_over_z: "初始 p/z",
  current_p_over_z: "当前 p/z",
  recovery_factor: "采收率",
  remaining_gas: "剩余气量",
  result: "计算结果",
  transformed_expression: "变换结果"
}, io = {
  current_pressure: "当前压力",
  current_z_factor: "当前 z 因子",
  initial_pressure: "初始压力",
  initial_z_factor: "初始 z 因子",
  produced_gas: "累计产气量"
};
function dn(e) {
  return vd[e] || io[e] || e.replace(/[_.-]+/g, " ").replace(/\b\w/g, (t) => t.toUpperCase());
}
function wd(e, t = "") {
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
function $n(e, t = "") {
  if (typeof e == "number") return wd(e, t);
  if (typeof e == "boolean") return e ? "是" : "否";
  if (e == null) return "—";
  if (typeof e == "string") return e;
  try {
    return JSON.stringify(e);
  } catch {
    return String(e);
  }
}
function Va(e) {
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
function Sd(e) {
  const t = e == null ? void 0 : e.result;
  return !t || typeof t != "object" || Array.isArray(t) ? [] : Object.entries(t).filter(
    ([, n]) => ["string", "number", "boolean"].includes(typeof n)
  ).sort(([n], [r]) => Va(n) - Va(r)).slice(0, 4).map(([n, r]) => {
    var i;
    return {
      key: n,
      label: dn(n),
      value: $n(r, n),
      unit: String(((i = e == null ? void 0 : e.units) == null ? void 0 : i[n]) || "")
    };
  });
}
function xd(e) {
  var r, i;
  const t = Array.isArray((r = e == null ? void 0 : e.trace) == null ? void 0 : r.steps) ? e.trace.steps : [], n = t.find(
    (a) => (a == null ? void 0 : a.operation) === "solve" && ((a == null ? void 0 : a.unicode) || (a == null ? void 0 : a.expression))
  ) || t.find(
    (a) => (a == null ? void 0 : a.group) === "assemble" && ((a == null ? void 0 : a.unicode) || (a == null ? void 0 : a.expression))
  ) || t.find((a) => (a == null ? void 0 : a.unicode) || (a == null ? void 0 : a.expression));
  return String(
    (n == null ? void 0 : n.unicode) || (n == null ? void 0 : n.expression) || ((i = e == null ? void 0 : e.trace) == null ? void 0 : i.symbols) || (e == null ? void 0 : e.method) || "—"
  );
}
function _d(e) {
  var r, i;
  const t = Array.isArray((r = e == null ? void 0 : e.trace) == null ? void 0 : r.variables) ? e.trace.variables.filter((a) => (a == null ? void 0 : a.source) === "input") : [];
  if (t.length)
    return t.slice(0, 8).map((a) => ({
      name: String(a.name || ""),
      label: String(
        io[String(a.name || "")] || a.display_name || dn(String(a.name || "参数"))
      ),
      value: `${$n(a.value, a.name)}${a.unit ? ` ${a.unit}` : ""}`,
      source: "用户输入"
    }));
  const n = ((i = e == null ? void 0 : e.provenance) == null ? void 0 : i.parameter_sources) || {};
  return Object.entries(n).filter(([, a]) => (a == null ? void 0 : a.source) === "user_input").slice(0, 8).map(([a, o]) => ({
    name: a,
    label: dn(a),
    value: `${$n(o == null ? void 0 : o.value, a)}${o != null && o.unit ? ` ${o.unit}` : ""}`,
    source: "用户输入"
  }));
}
function Dn(e) {
  var c, m, u, p;
  const t = (e == null ? void 0 : e.provenance) || {}, n = t.unit_audit, r = Object.values((n == null ? void 0 : n.per_symbol) || {}), i = typeof (n == null ? void 0 : n.ok) == "boolean" ? n.ok : null, a = t.source || ((c = e == null ? void 0 : e.trace) == null ? void 0 : c.source), o = Array.isArray(e == null ? void 0 : e.warnings) ? e.warnings.map(String) : [];
  let l = "success", s = "公式与单位已核验", d = "公式匹配、参数完整，计算证据链可追溯。";
  return i === !1 ? (l = "error", s = "单位检查未通过", d = "结果使用前需要修正单位不一致项。") : a === "freeform" ? (l = "warning", s = "AI 推导 · 建议复核", d = "符号步骤已通过安全校验，但公式并非审定公式库来源。") : o.length ? (l = "warning", s = "计算完成 · 存在提醒", d = "核心计算已完成，请同时阅读警告和适用条件。") : i === null && (s = "计算证据链已记录", d = "推导步骤和参数来源可追溯；此记录没有逐项单位审计。"), {
    title: ((m = e == null ? void 0 : e.trace) == null ? void 0 : m.formula_name) || ((u = e == null ? void 0 : e.trace) == null ? void 0 : u.title) || (e == null ? void 0 : e.operation) || "UGSci 数学计算",
    formula: xd(e),
    trustLabel: s,
    trustDetail: d,
    trustTone: l,
    results: Sd(e),
    inputs: _d(e),
    boundaries: [
      ...Array.isArray(e == null ? void 0 : e.applicability) ? e.applicability : [],
      ...Array.isArray(e == null ? void 0 : e.assumptions) ? e.assumptions : []
    ].map(String),
    warnings: o,
    stepCount: Array.isArray((p = e == null ? void 0 : e.trace) == null ? void 0 : p.steps) ? e.trace.steps.length : 0,
    passedGateCount: Array.isArray(t.gate) ? t.gate.length : 0,
    unitCheckCount: r.length,
    unitAuditOk: i
  };
}
function kd(e) {
  return e === "error" ? { color: ao, background: bd } : e === "warning" ? { color: hd, background: Ed } : { color: ro, background: yd };
}
function wt({ children: e }) {
  return R().React.createElement(
    "div",
    { style: { fontWeight: 600, color: Je, marginBottom: 8 } },
    e
  );
}
function Rr({
  payload: e,
  onOpenDerivation: t,
  onOpenEvidence: n,
  onReplay: r,
  compact: i = !1
}) {
  const a = R().React, o = Dn(e), l = kd(o.trustTone), s = o.results[0], d = o.results.slice(1, i ? 2 : 4);
  return a.createElement(
    "div",
    { style: { display: "grid", gap: i ? 9 : 14 } },
    a.createElement(
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
      a.createElement(
        "div",
        null,
        a.createElement(
          "div",
          { style: { color: Fe, fontSize: 12, marginBottom: 3 } },
          i ? "计算摘要" : o.title
        ),
        s ? a.createElement(
          "div",
          {
            style: {
              display: "flex",
              alignItems: "baseline",
              gap: 6,
              flexWrap: "wrap"
            }
          },
          a.createElement(
            "strong",
            {
              style: {
                color: Je,
                fontSize: i ? 22 : 28,
                fontWeight: 600,
                overflowWrap: "anywhere"
              }
            },
            s.value
          ),
          s.unit ? a.createElement(
            "span",
            { style: { color: Fe, fontSize: 13 } },
            s.unit
          ) : null
        ) : a.createElement(
          "strong",
          { style: { color: Je } },
          "计算已完成"
        ),
        s ? a.createElement(
          "div",
          { style: { color: Fe, fontSize: 12, marginTop: 3 } },
          s.label
        ) : null
      ),
      a.createElement(
        "span",
        {
          style: {
            display: "inline-flex",
            alignItems: "center",
            gap: 5,
            borderRadius: 999,
            padding: "4px 8px",
            color: l.color,
            background: l.background,
            fontSize: 12,
            whiteSpace: "nowrap"
          }
        },
        o.trustTone === "success" ? "✓" : "!",
        o.trustLabel
      )
    ),
    a.createElement(
      "p",
      {
        style: {
          margin: 0,
          color: i ? Fe : Je,
          fontSize: 13,
          lineHeight: 1.65
        }
      },
      o.trustDetail
    ),
    d.length ? a.createElement(
      "div",
      {
        style: {
          display: "grid",
          gap: 6,
          paddingTop: 10,
          borderTop: `1px solid ${Pt}`
        }
      },
      ...d.map(
        (c) => a.createElement(
          "div",
          {
            key: c.key,
            style: {
              display: "flex",
              justifyContent: "space-between",
              gap: 12,
              fontSize: 12
            }
          },
          a.createElement(
            "span",
            { style: { color: Fe } },
            c.label
          ),
          a.createElement(
            "span",
            { style: { color: Je, textAlign: "right" } },
            `${c.value}${c.unit ? ` ${c.unit}` : ""}`
          )
        )
      )
    ) : null,
    i ? null : a.createElement(
      "div",
      {
        style: {
          display: "grid",
          gap: 7,
          paddingTop: 10,
          borderTop: `1px solid ${Pt}`,
          fontSize: 12
        }
      },
      a.createElement(
        "div",
        {
          style: {
            display: "grid",
            gridTemplateColumns: "72px 1fr",
            gap: 8
          }
        },
        a.createElement(
          "span",
          { style: { color: Fe } },
          "使用公式"
        ),
        a.createElement(
          "code",
          { style: { color: Je, overflowWrap: "anywhere" } },
          o.formula
        )
      ),
      a.createElement(
        "div",
        {
          style: {
            display: "grid",
            gridTemplateColumns: "72px 1fr",
            gap: 8
          }
        },
        a.createElement(
          "span",
          { style: { color: Fe } },
          "关键输入"
        ),
        a.createElement(
          "span",
          { style: { color: Je } },
          o.inputs.length ? o.inputs.slice(0, 5).map((c) => `${c.label}=${c.value}`).join("；") : "未提供可展示的输入摘要"
        )
      ),
      a.createElement(
        "div",
        {
          style: {
            display: "grid",
            gridTemplateColumns: "72px 1fr",
            gap: 8
          }
        },
        a.createElement(
          "span",
          { style: { color: Fe } },
          "适用条件"
        ),
        a.createElement(
          "span",
          { style: { color: Je } },
          o.boundaries.slice(0, 2).join("；") || "未声明额外适用条件"
        )
      )
    ),
    a.createElement(
      "div",
      { style: { display: "flex", gap: 8, flexWrap: "wrap" } },
      t ? a.createElement(
        "button",
        {
          type: "button",
          onClick: t,
          style: {
            border: `1px solid ${Ja}`,
            borderRadius: 7,
            padding: "6px 10px",
            background: Ja,
            color: "var(--ant-color-text-light-solid, #fff)",
            cursor: "pointer"
          }
        },
        "查看推导"
      ) : null,
      n ? a.createElement(
        "button",
        {
          type: "button",
          onClick: n,
          style: {
            border: `1px solid ${Pt}`,
            borderRadius: 7,
            padding: "6px 10px",
            background: gr,
            color: Je,
            cursor: "pointer"
          }
        },
        "证据与来源"
      ) : null,
      r ? a.createElement(
        "button",
        {
          type: "button",
          onClick: r,
          style: {
            border: `1px solid ${Pt}`,
            borderRadius: 7,
            padding: "6px 10px",
            background: gr,
            color: Je,
            cursor: "pointer"
          }
        },
        "复现计算"
      ) : null
    )
  );
}
function Cd({ payload: e }) {
  const t = R().React, n = Dn(e);
  return t.createElement(
    "div",
    { style: { display: "grid", gap: 18 } },
    t.createElement(
      "section",
      null,
      t.createElement(wt, null, "你最需要知道的"),
      t.createElement(
        "p",
        { style: { margin: 0, color: Je, fontSize: 13, lineHeight: 1.7 } },
        `本次使用 ${n.title}，读取 ${n.inputs.length} 项输入，记录 ${n.stepCount} 个推导步骤`,
        n.passedGateCount ? `，并通过 ${n.passedGateCount} 项计算校验。` : "。"
      )
    ),
    t.createElement(
      "section",
      null,
      t.createElement(wt, null, "边界与提醒"),
      n.boundaries.length || n.warnings.length ? t.createElement(
        "ul",
        {
          style: {
            margin: 0,
            paddingLeft: 18,
            color: Fe,
            fontSize: 12,
            lineHeight: 1.7
          }
        },
        ...[...n.warnings, ...n.boundaries].slice(0, 4).map(
          (r, i) => t.createElement("li", { key: `${i}:${r}` }, r)
        )
      ) : t.createElement(
        "p",
        { style: { margin: 0, color: Fe, fontSize: 12 } },
        "未声明额外边界条件。"
      )
    )
  );
}
function Td({ payload: e }) {
  var l, s, d;
  const t = R().React, n = Dn(e), r = (e == null ? void 0 : e.provenance) || {}, i = Object.entries(((l = r == null ? void 0 : r.unit_audit) == null ? void 0 : l.per_symbol) || {}), a = Object.entries((r == null ? void 0 : r.parameter_sources) || {}), o = (c, m, u = c) => t.createElement(
    "div",
    {
      key: u,
      style: {
        display: "grid",
        gridTemplateColumns: "90px minmax(0, 1fr)",
        gap: 10,
        padding: "8px 0",
        borderBottom: `1px solid ${Pt}`,
        fontSize: 12
      }
    },
    t.createElement("span", { style: { color: Fe } }, c),
    t.createElement(
      "span",
      { style: { color: Je, overflowWrap: "anywhere" } },
      m || "—"
    )
  );
  return t.createElement(
    "div",
    { style: { display: "grid", gap: 18 } },
    t.createElement(
      "section",
      null,
      t.createElement(wt, null, "公式身份"),
      o("公式来源", r.reference || n.title),
      o(
        "公式版本",
        `${r.formula_id || ((s = e == null ? void 0 : e.trace) == null ? void 0 : s.formula_id) || "—"} · ${r.formula_version || ((d = e == null ? void 0 : e.trace) == null ? void 0 : d.formula_version) || "—"}`
      ),
      o(
        "信任类型",
        r.source === "freeform" ? "AI 自由推导" : "UGSci 审定公式"
      )
    ),
    t.createElement(
      "section",
      null,
      t.createElement(
        wt,
        null,
        `参数来源（${a.length}）`
      ),
      a.length ? t.createElement(
        "div",
        { style: { display: "grid" } },
        ...a.map(
          ([c, m]) => o(
            dn(c),
            `${(m == null ? void 0 : m.source) === "user_input" ? "用户输入" : "推导生成"} · ${$n(m == null ? void 0 : m.value, c)}${m != null && m.unit ? ` ${m.unit}` : ""}`,
            c
          )
        )
      ) : t.createElement(
        "p",
        { style: { margin: 0, color: Fe, fontSize: 12 } },
        "没有参数来源记录。"
      )
    ),
    t.createElement(
      "section",
      null,
      t.createElement(
        wt,
        null,
        `单位审计（${n.unitCheckCount} 项）`
      ),
      t.createElement(
        "div",
        {
          style: {
            color: n.unitAuditOk === !1 ? ao : n.unitAuditOk === !0 ? ro : Fe,
            fontSize: 12,
            marginBottom: i.length ? 8 : 0
          }
        },
        n.unitAuditOk === !1 ? "存在不一致单位" : n.unitAuditOk === !0 ? "全部单位一致" : "此结果没有单位审计数据"
      ),
      i.length ? t.createElement(
        "details",
        null,
        t.createElement(
          "summary",
          { style: { cursor: "pointer", color: Fe, fontSize: 12 } },
          "查看逐项单位检查"
        ),
        t.createElement(
          "div",
          { style: { marginTop: 6 } },
          ...i.map(
            ([c, m]) => o(
              dn(c),
              `${m != null && m.ok ? "✓" : "✗"} ${(m == null ? void 0 : m.actual) || "无量纲"} → ${(m == null ? void 0 : m.expected) || "—"}`,
              `unit:${c}`
            )
          )
        )
      ) : null
    ),
    Array.isArray(r.gate) && r.gate.length ? t.createElement(
      "section",
      null,
      t.createElement(wt, null, "通过的计算校验"),
      t.createElement(
        "ul",
        {
          style: {
            margin: 0,
            paddingLeft: 18,
            color: Fe,
            fontSize: 12,
            lineHeight: 1.7
          }
        },
        ...r.gate.map(
          (c, m) => t.createElement(
            "li",
            { key: `${m}:${c}` },
            String(c)
          )
        )
      )
    ) : null,
    r.replay_token ? t.createElement(
      "section",
      null,
      t.createElement(wt, null, "复现身份"),
      t.createElement(
        "code",
        {
          style: {
            display: "block",
            padding: 10,
            borderRadius: 8,
            background: yr,
            color: Fe,
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
function Id({ payload: e }) {
  const t = R().React, n = Dn(e), [r, i] = t.useState(!1), a = e == null ? void 0 : e.replay, o = [
    [n.stepCount, "计算步骤"],
    [n.passedGateCount, "校验通过"],
    [(a == null ? void 0 : a.elapsedMs) != null ? `${a.elapsedMs} ms` : "—", "复现耗时"]
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
      ...o.map(
        ([l, s]) => t.createElement(
          "div",
          {
            key: String(s),
            style: { padding: 10, borderRadius: 8, background: yr }
          },
          t.createElement(
            "strong",
            { style: { display: "block", color: Je } },
            String(l)
          ),
          t.createElement(
            "span",
            { style: { color: Fe, fontSize: 11 } },
            String(s)
          )
        )
      )
    ),
    t.createElement(
      "button",
      {
        type: "button",
        onClick: () => i(!r),
        "aria-expanded": r,
        style: {
          justifySelf: "start",
          border: `1px solid ${Pt}`,
          borderRadius: 7,
          padding: "6px 10px",
          background: gr,
          color: Je,
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
          background: yr,
          color: Fe,
          whiteSpace: "pre-wrap",
          overflowWrap: "anywhere",
          fontSize: 11,
          lineHeight: 1.55
        }
      },
      JSON.stringify(e, null, 2)
    ) : t.createElement(
      "p",
      { style: { margin: 0, color: Fe, fontSize: 12 } },
      "原始运行数据默认隐藏，需要诊断或审计时再展开。"
    )
  );
}
const Ad = 128;
let hr = [], oo = "";
const Er = /* @__PURE__ */ new Set(), so = () => Er.forEach((e) => e()), lo = (e) => (Er.add(e), () => Er.delete(e)), Ka = () => hr;
function Or(e) {
  return !!(e && typeof e == "object" && e.trace && Array.isArray(e.trace.steps) && e.provenance && (e.operation || e.trace.formula_id));
}
function $d(e) {
  if (!e || typeof e != "object" || !e.replay_id || !e.status || !Or(e.result))
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
function Mr(e, t) {
  var i, a, o, l, s;
  if (!Or(e)) return null;
  const n = (i = e.replay) != null && i.replayId ? `replay:${e.replay.replayId}` : `${((a = e.trace) == null ? void 0 : a.formula_id) || "derivation"}:${((o = e.provenance) == null ? void 0 : o.input_fingerprint) || e.operation || crypto.randomUUID()}`, r = {
    uiId: n,
    sessionId: t || ((s = (l = R()).getCurrentSessionId) == null ? void 0 : s.call(l)) || "",
    payload: e,
    updatedAt: Date.now()
  };
  return hr = [r, ...hr.filter((d) => d.uiId !== n)].slice(
    0,
    Ad
  ), so(), r;
}
function Lr(e) {
  oo = e, so();
}
function zd() {
  return R().React.useSyncExternalStore(
    lo,
    () => oo,
    () => ""
  );
}
function co(e) {
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
    const i = $d(r);
    if (i) {
      t.push(i);
      return;
    }
    Or(r) && t.push(r), Object.values(r).forEach(n);
  };
  return n(e), Array.from(
    new Map(
      t.map((r) => {
        var i, a;
        return [
          String(((i = r.provenance) == null ? void 0 : i.replay_token) || ((a = r.trace) == null ? void 0 : a.formula_id)) + JSON.stringify(r.result || {}),
          r
        ];
      })
    ).values()
  );
}
function Pd(e, t) {
  co(e).forEach(
    (n) => Mr(n, t)
  );
}
function Rd(e) {
  const t = R().React, n = t.useSyncExternalStore(lo, Ka, Ka);
  return t.useMemo(
    () => n.filter((r) => r.sessionId === e),
    [n, e]
  );
}
const Od = [], Ot = /* @__PURE__ */ new Map();
function Md(e) {
  Ot.set(e, (Ot.get(e) || 0) + 1);
}
function Ld(e) {
  const t = (Ot.get(e) || 1) - 1;
  t > 0 ? Ot.set(e, t) : Ot.delete(e);
}
function Bd(e) {
  return (Ot.get(e) || 0) > 0;
}
function Xa(e) {
  const t = [], n = (r) => {
    t.push(r);
    for (const i of r.children || []) n(i);
  };
  return n(e), t;
}
function jd(e) {
  var d, c;
  const t = Xa(e), n = String(
    ((c = (d = t.find(
      (m) => {
        var u;
        return m.kind === "Heading" && Number((u = m.props) == null ? void 0 : u.level) === 2;
      }
    )) == null ? void 0 : d.props) == null ? void 0 : c.value) || "公式计算"
  ), r = t.some(
    (m) => {
      var u;
      return m.kind === "Alert" && String(((u = m.props) == null ? void 0 : u.severity) || "") === "warning";
    }
  ), i = t.filter((m) => m.kind === "MetricCard").map((m) => {
    var u, p;
    return {
      label: String(((u = m.props) == null ? void 0 : u.title) || "结果"),
      value: String(((p = m.props) == null ? void 0 : p.value) ?? "—")
    };
  }), a = t.filter((m) => m.kind === "TableRow").map(
    (m) => (m.children || []).filter((u) => u.kind === "TableCell").map((u) => {
      var p;
      return String(((p = u.props) == null ? void 0 : p.value) ?? "");
    })
  ).filter((m) => m.length >= 4 && m[3] === "derived").map((m) => ({
    label: m[0] || "结果",
    value: [m[1], m[2]].filter(Boolean).join(" ")
  })).reverse(), o = t.filter((m) => m.kind === "NumberInput" || m.kind === "Slider").slice(0, 5).map(
    (m) => {
      var u, p, b;
      return `${String(((u = m.props) == null ? void 0 : u.label) || ((p = m.props) == null ? void 0 : p.name) || "输入")}=${String(
        ((b = m.props) == null ? void 0 : b.value) ?? "—"
      )}`;
    }
  ), l = t.filter((m) => m.kind === "AccordionItem").filter(
    (m) => {
      var u;
      return ["适用场景", "假设条件"].includes(String(((u = m.props) == null ? void 0 : u.header) || ""));
    }
  ).flatMap((m) => Xa(m)).filter((m) => m.kind === "ListItem").map((m) => {
    var u;
    return String(((u = m.props) == null ? void 0 : u.value) || "");
  }).filter(Boolean).slice(0, 3), s = [...a, ...i].filter(
    (m, u, p) => p.findIndex(
      (b) => b.label === m.label && b.value === m.value
    ) === u
  );
  return { title: n, warning: r, inputs: o, conditions: l, results: s };
}
function Ud({ data: e }) {
  var g, E;
  const t = (g = window.QwenPaw) == null ? void 0 : g.host, n = t == null ? void 0 : t.React;
  if (!n) return null;
  const r = bc(), i = n.useRef(/* @__PURE__ */ new Map()), a = ((E = t.getCurrentSessionId) == null ? void 0 : E.call(t)) || "__current_chat__", o = Array.isArray(e.output) ? e.output : Od, l = n.useMemo(
    () => Gi(o),
    [o]
  ), s = n.useMemo(
    () => co(o),
    [o]
  );
  n.useEffect(() => {
    for (const f of l) {
      if (!f.ui_id || !f.tree) continue;
      const h = r.getSnapshot(a, f.ui_id);
      h && h.revision >= (f.revision || 1) || r.setSnapshot({
        schemaVersion: "1",
        uiId: f.ui_id,
        revision: f.revision || 1,
        tree: f.tree,
        sessionId: a,
        sourceToolCallId: f.tool_call_id,
        updatedAt: Date.now()
      });
    }
  }, [l, a]);
  const d = n.useMemo(
    () => l.filter((f) => f.kind === "genui" && !!f.ui_id).map((f) => f.ui_id),
    [l]
  ), c = d.join("\0");
  n.useEffect(() => {
    for (const f of d) Md(f);
    return () => {
      for (const f of d) Ld(f);
    };
  }, [c]);
  const m = n.useMemo(
    () => l.map((f) => f.ui_id).filter((f) => !!f),
    [l]
  ), p = vc(a, m).filter(
    (f) => (
      // Only include snapshots whose ui_id appears in this response's results
      l.some(
        (h) => h.ui_id === f.uiId && (h.kind === "genui" || h.kind === "genui_patch" && !Bd(f.uiId))
      )
    )
  ).sort((f, h) => f.updatedAt - h.updatedAt);
  if (s.length > 0)
    return n.createElement(
      "div",
      {
        className: "qwenpaw-genui-inline qwenpaw-derivation-inline",
        style: { marginTop: 8, marginBottom: 8, display: "grid", gap: 8 }
      },
      ...s.map(
        (f, h) => {
          var v, w;
          return n.createElement(
            "div",
            {
              key: String(
                ((v = f.provenance) == null ? void 0 : v.replay_token) || ((w = f.trace) == null ? void 0 : w.formula_id) || h
              ),
              style: {
                border: "1px solid var(--ant-color-border-secondary, #f0f0f0)",
                borderRadius: 12,
                padding: 12,
                background: "var(--ant-color-bg-container, #fff)"
              }
            },
            n.createElement(Rr, {
              payload: f,
              compact: !0,
              onOpenDerivation: () => {
                const x = Mr(f, a);
                x != null && x.uiId && Lr(x.uiId), window.dispatchEvent(
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
  const b = (f) => n.createElement(
    "div",
    {
      key: Lt(f.sessionId, f.uiId),
      className: "qwenpaw-genui-tree",
      "data-genui-id": f.uiId,
      style: {
        border: "1px solid var(--ant-color-border-secondary, #f0f0f0)",
        borderRadius: 12,
        padding: 16,
        marginBottom: 8,
        background: "var(--ant-color-bg-container, #fff)"
      },
      ref: (h) => {
        h && (h.__genuiId = f.uiId);
      }
    },
    n.createElement(
      "div",
      { className: "qwenpaw-genui-export-target" },
      n.createElement(Hc, {
        node: f.tree.root,
        onValuesChange: (h) => i.current.set(f.uiId, h),
        children: n.createElement(Qc, {
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
          onClick: (h) => {
            var w;
            const v = (w = h.currentTarget.closest(".qwenpaw-genui-tree")) == null ? void 0 : w.querySelector(
              ".qwenpaw-genui-export-target"
            );
            v && ud(v, f.uiId).catch(
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
          onClick: (h) => {
            var w;
            const v = (w = h.currentTarget.closest(".qwenpaw-genui-tree")) == null ? void 0 : w.querySelector(
              ".qwenpaw-genui-export-target"
            );
            v && gd(
              v,
              f.tree.root,
              i.current.get(f.uiId) || {},
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
          onClick: (h) => {
            var w;
            const v = (w = h.currentTarget.closest(".qwenpaw-genui-tree")) == null ? void 0 : w.querySelector(
              ".qwenpaw-genui-export-target"
            );
            v && fd(
              v,
              f.tree.root,
              i.current.get(f.uiId) || {},
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
      if (!f.uiId.startsWith("ui_trc_")) return b(f);
      const h = jd(f.tree.root), v = h.results[0] || {
        label: "计算结果",
        value: "已完成"
      };
      return n.createElement(
        "div",
        {
          key: Lt(f.sessionId, f.uiId),
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
              h.title
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
                color: h.warning ? "var(--ant-color-warning, #faad14)" : "var(--ant-color-success, #52c41a)",
                background: h.warning ? "var(--ant-color-warning-bg, #fffbe6)" : "var(--ant-color-success-bg, #f6ffed)"
              }
            },
            h.warning ? "需要人工复核" : "✓ 公式与单位已核验"
          )
        ),
        h.results.length > 1 ? n.createElement(
          "div",
          {
            style: {
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
              gap: 8
            }
          },
          ...h.results.slice(1, 4).map(
            (w) => n.createElement(
              "div",
              {
                key: `${w.label}:${w.value}`,
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
                w.label
              ),
              n.createElement("strong", null, w.value)
            )
          )
        ) : null,
        h.inputs.length ? n.createElement(
          "div",
          {
            style: {
              color: "var(--ant-color-text-secondary, rgba(0,0,0,.45))",
              fontSize: 12,
              lineHeight: 1.6
            }
          },
          `关键输入：${h.inputs.join("；")}`
        ) : null,
        h.conditions.length ? n.createElement(
          "div",
          {
            style: {
              color: "var(--ant-color-text-secondary, rgba(0,0,0,.45))",
              fontSize: 12,
              lineHeight: 1.6
            }
          },
          `适用条件：${h.conditions.join("；")}`
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
            b(f)
          )
        )
      );
    })
  );
}
function Nd({ payload: e }) {
  var l, s;
  const t = R().React, n = ((l = e == null ? void 0 : e.trace) == null ? void 0 : l.variables) || [], r = ((s = e == null ? void 0 : e.trace) == null ? void 0 : s.steps) || [], i = [
    ...n.map((d, c) => ({
      id: d.name,
      label: d.symbol || d.name,
      x: 20,
      y: 30 + c * 54,
      kind: "variable"
    })),
    ...r.map((d, c) => ({
      id: d.id,
      label: d.title,
      x: 380,
      y: 30 + c * 54,
      kind: "step",
      step: d
    }))
  ], a = new Map(i.map((d) => [d.id, d])), o = [];
  for (const d of r) {
    for (const c of d.reads || [])
      a.has(c) && o.push({ from: c, to: d.id });
    d.writes && a.has(d.writes) && o.push({ from: d.id, to: d.writes });
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
    ...o.map((d, c) => {
      const m = a.get(d.from), u = a.get(d.to);
      return t.createElement("line", {
        key: `e${c}`,
        x1: m.x + 155,
        y1: m.y + 16,
        x2: u.x,
        y2: u.y + 16,
        stroke: "var(--ant-color-border, #d9d9d9)",
        markerEnd: "url(#arrow)"
      });
    }),
    ...i.map(
      (d) => t.createElement(
        "g",
        { key: d.id, transform: `translate(${d.x} ${d.y})` },
        t.createElement("rect", {
          width: 155,
          height: 32,
          rx: 6,
          fill: d.kind === "variable" ? "var(--ant-color-primary-bg, #e6f4ff)" : "var(--ant-color-fill-quaternary, #fafafa)",
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
          `${d.id} · ${String(d.label).slice(0, 18)}`
        )
      )
    )
  );
}
function Dd({
  payload: e,
  compact: t = !1
}) {
  var d;
  const n = R().React, [r, i] = n.useState(!t), a = ((d = e == null ? void 0 : e.trace) == null ? void 0 : d.steps) || [], o = a.filter(
    (c) => c.kind !== "bind" || c.note !== "input"
  ), s = (r ? a : o).map(
    (c, m) => n.createElement(
      "article",
      {
        key: c.id,
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
        m + 1
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
          c.title
        ),
        c.unicode || c.expression ? n.createElement(
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
          c.unicode || c.expression
        ) : null,
        c.value !== null && c.value !== void 0 ? n.createElement(
          "div",
          {
            style: {
              color: "var(--ant-color-text-secondary, rgba(0,0,0,.45))",
              fontSize: 11,
              marginTop: 3
            }
          },
          `${c.display_value ?? c.value} ${c.display_unit || c.unit || ""}`
        ) : null,
        c.description ? n.createElement(
          "div",
          {
            style: {
              color: "var(--ant-color-text-tertiary, rgba(0,0,0,.25))",
              fontSize: 11,
              marginTop: 3,
              lineHeight: 1.55
            }
          },
          c.description
        ) : null,
        c.kind === "assert" ? n.createElement(
          "span",
          {
            style: {
              display: "inline-block",
              color: c.value ? "var(--ant-color-success, #52c41a)" : "var(--ant-color-error, #ff4d4f)",
              fontSize: 11,
              marginTop: 4
            }
          },
          c.value ? "✓ 通过" : "✗ 失败"
        ) : null
      )
    )
  );
  return n.createElement(
    "div",
    { style: { display: "grid", gap: 8 } },
    ...s,
    t && a.length !== o.length ? n.createElement(
      "button",
      {
        type: "button",
        onClick: () => i((c) => !c),
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
      r ? "只看关键步骤" : `显示全部 ${a.length} 步`
    ) : null
  );
}
const xn = "var(--ant-color-text, rgba(0,0,0,.88))", tr = "var(--ant-color-text-secondary, rgba(0,0,0,.45))", Ya = "var(--ant-color-border, #d9d9d9)", nr = "var(--ant-color-bg-container, #fff)", Za = "var(--ant-color-primary, #1677ff)";
function Fd() {
  var E, f, h;
  const e = R().React, t = ((f = (E = R()).getCurrentSessionId) == null ? void 0 : f.call(E)) || "", n = Rd(t), r = zd(), [i, a] = e.useState(n[0]), [o, l] = e.useState("summary"), [s, d] = e.useState("steps");
  if (e.useEffect(() => {
    const v = n.find((w) => w.uiId === r);
    v && v !== i ? a(v) : n.some((w) => w.uiId === (i == null ? void 0 : i.uiId)) || a(n[0]);
  }, [n, r, i]), !n.length)
    return e.createElement(
      "div",
      { style: { padding: 20, color: tr } },
      "暂无推导记录。运行 UGSci 公式后可在此查看。"
    );
  const c = (i == null ? void 0 : i.payload) || n[0].payload, m = c.provenance || {}, u = c.replay, p = () => {
    var w, x, j;
    const v = m.replay_token;
    v && ((j = (x = (w = window.QwenPaw) == null ? void 0 : w.chat) == null ? void 0 : x.sendMessage) == null || j.call(
      x,
      `请调用 ugsci_replay_calculation 验证并重放以下令牌：
${v}`
    ));
  }, b = [
    ["summary", "摘要"],
    ["derivation", "推导"],
    ["evidence", "证据"],
    ["logs", "日志"]
  ], g = (v) => ({
    flex: "1 1 64px",
    minWidth: 0,
    border: "none",
    borderRadius: 7,
    padding: "6px 8px",
    background: v ? nr : "transparent",
    color: v ? xn : tr,
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
          { style: { display: "block", color: xn } },
          "计算详情"
        ),
        e.createElement(
          "span",
          { style: { color: tr, fontSize: 11 } },
          ((h = c.trace) == null ? void 0 : h.formula_name) || c.operation || "UGSci 推导"
        )
      ),
      u ? e.createElement(
        "span",
        {
          style: {
            color: u.reproducible ? "var(--ant-color-success, #52c41a)" : "var(--ant-color-warning, #faad14)",
            fontSize: 12
          }
        },
        u.reproducible ? `✓ 可复现 · ${u.elapsedMs ?? "?"} ms` : "! 版本已变化"
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
      ...b.map(
        ([v, w]) => e.createElement(
          "button",
          {
            key: v,
            type: "button",
            role: "tab",
            onClick: () => l(v),
            "aria-selected": o === v,
            style: g(o === v)
          },
          w
        )
      )
    ),
    n.length > 1 ? e.createElement(
      "select",
      {
        "aria-label": "选择计算记录",
        value: (i == null ? void 0 : i.uiId) || n[0].uiId,
        onChange: (v) => {
          Lr(v.target.value), a(
            n.find((w) => w.uiId === v.target.value)
          );
        },
        style: {
          width: "100%",
          padding: "7px 9px",
          border: `1px solid ${Ya}`,
          borderRadius: 7,
          color: xn,
          background: nr
        }
      },
      ...n.map(
        (v) => {
          var w;
          return e.createElement(
            "option",
            { key: v.uiId, value: v.uiId },
            ((w = v.payload.trace) == null ? void 0 : w.formula_name) || v.uiId.slice(0, 18)
          );
        }
      )
    ) : null,
    o === "summary" ? e.createElement(
      "div",
      { role: "tabpanel", style: { display: "grid", gap: 18 } },
      e.createElement(Rr, {
        payload: c,
        onOpenDerivation: () => l("derivation"),
        onOpenEvidence: () => l("evidence"),
        onReplay: m.replay_token ? p : void 0
      }),
      e.createElement(Cd, { payload: c })
    ) : o === "derivation" ? e.createElement(
      "div",
      { role: "tabpanel", style: { display: "grid", gap: 10 } },
      e.createElement(
        "div",
        { style: { display: "flex", gap: 6, flexWrap: "wrap" } },
        ...[
          ["steps", "关键步骤"],
          ["flow", "流程图"]
        ].map(
          ([v, w]) => e.createElement(
            "button",
            {
              key: v,
              type: "button",
              onClick: () => d(v),
              "aria-pressed": s === v,
              style: {
                border: `1px solid ${s === v ? Za : Ya}`,
                borderRadius: 7,
                padding: "5px 9px",
                background: nr,
                color: s === v ? Za : xn,
                cursor: "pointer"
              }
            },
            w
          )
        )
      ),
      s === "flow" ? e.createElement(Nd, { payload: c }) : e.createElement(Dd, { payload: c, compact: !0 })
    ) : o === "evidence" ? e.createElement(
      "div",
      { role: "tabpanel" },
      e.createElement(Td, { payload: c })
    ) : e.createElement(
      "div",
      { role: "tabpanel" },
      e.createElement(Id, { payload: c })
    )
  );
}
function Yt(e) {
  var t;
  if (typeof e == "string")
    try {
      return Yt(JSON.parse(e));
    } catch {
      return null;
    }
  return Array.isArray(e) ? Yt((t = e.find((n) => (n == null ? void 0 : n.type) === "text")) == null ? void 0 : t.text) : e != null && e.status && (e != null && e.result) ? {
    ...e.result,
    replay: {
      replayId: String(e.replay_id || ""),
      status: String(e.status),
      reproducible: e.reproducible === !0,
      elapsedMs: typeof e.elapsed_ms == "number" ? e.elapsed_ms : void 0,
      diff: e.diff && typeof e.diff == "object" ? e.diff : {}
    }
  } : (e == null ? void 0 : e.output) !== void 0 ? Yt(e.output) : (e == null ? void 0 : e.content) !== void 0 ? Yt(e.content) : e;
}
function Gd(e) {
  var s, d, c, m, u, p, b;
  const t = R().React, n = ((s = e == null ? void 0 : e.data) == null ? void 0 : s.content) || [], r = ((c = (d = n[1]) == null ? void 0 : d.data) == null ? void 0 : c.output) ?? ((u = (m = n[1]) == null ? void 0 : m.data) == null ? void 0 : u.content) ?? ((b = (p = n[0]) == null ? void 0 : p.data) == null ? void 0 : b.output), i = Yt(r), [a, o] = t.useState(null);
  t.useEffect(() => {
    i && o(Mr(i));
  }, [r]);
  const l = () => {
    a != null && a.uiId && Lr(a.uiId), window.dispatchEvent(
      new CustomEvent("qwenpaw:open-compute-workbench", {
        detail: { uiId: a == null ? void 0 : a.uiId }
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
    i ? t.createElement(Rr, {
      payload: i,
      compact: !0,
      onOpenDerivation: l
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
let bt = null;
function Wd(e, t) {
  var i, a, o, l;
  const n = "ugsci";
  bt == null || bt();
  const r = [];
  if (me("/ugsci/genui/config", {
    bypassCache: !0
  }).then((s) => {
    e.genui = { ...e.genui || {}, config: s };
  }).catch((s) => {
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
      s
    );
  }), (i = e.chat) != null && i.toolRender) {
    r.push(
      e.chat.toolRender(n, "emit_ui_tree", Ma)
    ), r.push(
      e.chat.toolRender(n, "emit_ui_patch", Ma)
    ), r.push(
      e.chat.toolRender(n, "list_ui_components", La)
    ), r.push(
      e.chat.toolRender(n, "get_genui_guide", La)
    );
    for (const s of [
      "ugsci_trace_calculation",
      "ugsci_replay_calculation",
      "ugsci_derive_formula",
      "ugsci_evaluate_formula",
      "ugsci_transform_formula",
      "ugsci_formula_preview"
    ])
      r.push(e.chat.toolRender(n, s, Gd));
    console.info("[ugsci.genui] Registered emit/patch + catalog/guide cards");
  }
  return (a = e.slot) != null && a.fill && r.push(
    e.slot.fill(
      n,
      "chat.workbench.compute",
      () => t.createElement(Fd)
    )
  ), (l = (o = e.chat) == null ? void 0 : o.response) != null && l.append && (r.push(
    e.chat.response.append(
      n,
      (s) => {
        const d = () => (t.useEffect(
          () => Pd(s.data.output),
          [s.data.output]
        ), null);
        return t.createElement(
          Ec,
          null,
          t.createElement(d),
          t.createElement(Ud, { data: s.data })
        );
      },
      { id: "ugsci.genui.response-append", order: 50 }
    )
  ), console.info("[ugsci.genui] Registered response.append slot")), bt = () => {
    var s;
    for (const d of r.reverse()) (s = d == null ? void 0 : d.dispose) == null || s.call(d);
    if (Sc(), Bc(), e.genui) {
      const d = { ...e.genui };
      delete d.dispose, delete d.clearSession, e.genui = d;
    }
    bt = null;
  }, e.genui = {
    ...e.genui || {},
    dispose: bt,
    clearSession: wc
  }, bt;
}
const Qa = {
  enabled: !0,
  persisted_enabled: !0,
  overridden: !1,
  channels: ["response.append"],
  allow_html: !1,
  allow_actions: [],
  backend_unavailable: !0
};
function rr(e) {
  const t = window.QwenPaw;
  t && (t.genui = { ...t.genui || {}, config: e });
}
function Hd() {
  const e = R().React, { Alert: t, Card: n, Space: r, Spin: i, Switch: a, Typography: o, message: l } = R().antd, { useEffect: s, useState: d } = e, [c, m] = d(null), [u, p] = d(!1);
  s(() => {
    let g = !0, E = null;
    const f = (h = !1) => {
      me("/ugsci/genui/config").then((v) => {
        g && (m(v), rr(v));
      }).catch((v) => {
        g && (m(Qa), rr(Qa), h && l.error(String(v)), E = setTimeout(() => f(!1), 3e4));
      });
    };
    return f(!0), () => {
      g = !1, E && clearTimeout(E);
    };
  }, []);
  const b = async (g) => {
    p(!0);
    try {
      const E = await me("/ugsci/genui/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: g })
      });
      m(E), rr(E), l.success(
        E.overridden ? "设置已保存，但环境变量或插件配置正在覆盖它" : g ? "GenUI 已开启" : "GenUI 已关闭"
      );
    } catch (E) {
      l.error(`保存 GenUI 设置失败：${String(E)}`);
    } finally {
      p(!1);
    }
  };
  return e.createElement(
    "section",
    { "aria-labelledby": "ugsci-genui-title" },
    e.createElement(
      o.Title,
      { level: 3, id: "ugsci-genui-title" },
      "GenUI"
    ),
    e.createElement(
      o.Paragraph,
      { type: "secondary" },
      "控制 UGSci 的生成式界面能力。该设置对所有 Agent 生效，新安装时默认开启。"
    ),
    e.createElement(
      n,
      null,
      c === null ? e.createElement(i) : e.createElement(
        r,
        { direction: "vertical", size: 16, style: { width: "100%" } },
        e.createElement(
          r,
          { style: { width: "100%", justifyContent: "space-between" } },
          e.createElement(
            "div",
            null,
            e.createElement(
              o.Text,
              { strong: !0 },
              "启用 GenUI"
            ),
            e.createElement(
              o.Paragraph,
              { type: "secondary", style: { margin: "4px 0 0" } },
              "允许 Agent 生成卡片、表格、图表、表单，并在对话中交互和增量更新。"
            )
          ),
          e.createElement(a, {
            "aria-label": "启用 GenUI",
            checked: c.persisted_enabled,
            loading: u,
            disabled: c.backend_unavailable,
            onChange: b
          })
        ),
        e.createElement(t, {
          type: c.backend_unavailable ? "error" : c.enabled ? "success" : "warning",
          showIcon: !0,
          message: c.backend_unavailable ? "UGSci 后端当前不可用，正在使用兼容降级模式；设置不会写入。" : c.enabled ? "GenUI 当前有效；各 Agent 仍可显式关闭自己的 GenUI 工具" : c.overridden ? "GenUI 当前被环境变量或插件配置关闭；本地设置已保存但暂不生效。" : "GenUI 已全局关闭；已有界面仍可查看，但 Agent 不会再生成或更新界面。"
        })
      )
    )
  );
}
function qd() {
  const { React: e, antd: t } = R();
  return e.createElement(
    "div",
    { style: { width: "100%" } },
    e.createElement(t.Typography.Title, { level: 2 }, "UGSci 设置"),
    e.createElement(
      t.Typography.Paragraph,
      { type: "secondary", style: { marginBottom: 28 } },
      "集中管理 UGSci 的功能与偏好设置。"
    ),
    e.createElement(Hd)
  );
}
function Jd() {
  const { React: e } = R();
  return e.useEffect(() => {
    window.history.replaceState({}, "", "/settings/ugsci"), window.dispatchEvent(new PopStateEvent("popstate"));
  }, []), null;
}
let Jt = null;
function Br() {
  return Jt || (Jt = (async () => {
    var r;
    const e = (r = window.QwenPaw) == null ? void 0 : r.host;
    if (!(e != null && e.getApiUrl))
      throw new Error("[oilgas-vis] QwenPaw.host.getApiUrl not available");
    const t = `${e.getApiUrl(
      "frontend_plugin/ugsci/files/ui/dist/viewer-runtime.js"
    )}`;
    console.info("[oilgas-vis] Loading viewer runtime from", t), await new Promise((i, a) => {
      const o = document.createElement("script");
      o.dataset.plugin = "ugsci", o.src = t;
      const l = (d) => {
        clearTimeout(s), o.onload = null, o.onerror = null, d ? (o.remove(), a(d)) : i();
      }, s = setTimeout(() => l(new Error("可视化引擎加载超时，请重试")), 3e4);
      o.onload = () => l(), o.onerror = () => l(new Error("可视化引擎脚本加载失败，请检查服务连接")), document.head.appendChild(o);
    });
    const n = window.OilGasViewerRuntime;
    if (!n || typeof n.mount != "function")
      throw new Error(
        "[oilgas-vis] window.OilGasViewerRuntime not found after script load"
      );
    return console.info(
      "[oilgas-vis] Viewer runtime loaded, version:",
      n.version
    ), n;
  })().catch((e) => {
    throw Jt = null, e;
  }), Jt);
}
function Fn(e, t = {}) {
  var l;
  const n = e.getApiUrl("ugsci/visualization").replace(/\/$/, ""), r = new URL(n, window.location.href), i = new URL(e.getApiUrl("workspace/tree"), window.location.href), a = t.agentId || ((l = e.getSelectedAgentId) == null ? void 0 : l.call(e)), o = {};
  return a && (o["X-Agent-Id"] = a), t.chatId ? o["X-Chat-Id"] = t.chatId : t.projectDirOverride && (o["X-Session-Project-Dir"] = t.projectDirOverride), {
    apiBase: n,
    headers: o,
    request: async (s, d) => {
      const c = new URL(s instanceof Request ? s.url : String(s), window.location.href), m = c.origin === r.origin && c.pathname.startsWith(`${r.pathname}/`), u = c.origin === i.origin && c.pathname === i.pathname && ((d == null ? void 0 : d.method) || "GET").toUpperCase() === "GET";
      if (!m && !u || c.username || c.password) throw new Error("可视化请求超出当前数据服务范围");
      const p = new Headers(d == null ? void 0 : d.headers);
      Object.entries(o).forEach(([E, f]) => p.set(E, f));
      const b = e.getApiToken();
      b ? p.set("Authorization", `Bearer ${b}`) : p.delete("Authorization");
      const g = { ...d, headers: p };
      return e.fetch ? e.fetch(u ? `/workspace/tree${c.search}` : `/ugsci/visualization${c.pathname.slice(r.pathname.length)}${c.search}`, g) : fetch(c.href, g);
    }
  };
}
class jr {
  constructor(t, n, r = {}) {
    this.options = { apiBase: t, authToken: n, ...r };
  }
  update(t) {
    this.options = { ...this.options, ...t };
  }
  async request(t, n = {}) {
    const r = this.options.apiBase.replace(/\/$/, ""), i = t.startsWith(`${r}/`) ? t : `${r}/${t.replace(/^\//, "")}`, a = new Headers(this.options.headers);
    this.options.authToken && !a.has("Authorization") && a.set("Authorization", `Bearer ${this.options.authToken}`), new Headers(n.headers).forEach((l, s) => a.set(s, l));
    const o = await (this.options.request || fetch)(i, { ...n, headers: a });
    if (!o.ok) {
      let l = "";
      try {
        const s = await o.json();
        l = typeof s.detail == "string" ? s.detail : typeof s.error == "string" ? s.error : "";
      } catch {
      }
      throw new Error(`请求失败（HTTP ${o.status}）${l ? `：${l}` : ""}`);
    }
    return o;
  }
  async fetchJson(t, n) {
    return (await this.request(t, { signal: n })).json();
  }
  async getCapabilities() {
    return (await this.fetchJson("/capabilities")).capabilities;
  }
  getManifest(t) {
    return this.fetchJson("/manifest", t);
  }
  async fetchBinary(t, n) {
    const r = t.replace(/\\/g, "/").split("/");
    if (r.some((i) => !i || i === "." || i === "..") || /[:?#]/.test(t)) throw new Error("数据资源路径无效");
    return (await this.request(`/resource/${r.map(encodeURIComponent).join("/")}`, { signal: n })).arrayBuffer();
  }
  async createImport(t, n, r, i) {
    const a = new FormData();
    return a.append("file", t), a.append("name", n), r && a.append("property_file", r), i && a.append("companion_file", i), (await this.request("/imports", { method: "POST", body: a })).json();
  }
  async createWorkspaceImport(t, n = "project", r = "", i) {
    const a = await (await this.request("/imports/workspace", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: t, root: n, name: r }),
      signal: i
    })).json();
    if (typeof a.job_id != "string" || !a.job_id) throw new Error("导入请求未返回有效任务编号");
    return a;
  }
  async deleteDataset(t) {
    return (await this.request(`/datasets/${encodeURIComponent(t)}`, { method: "DELETE" })).json();
  }
  async restoreExamples() {
    return (await this.request("/catalog/restore-examples", { method: "POST" })).json();
  }
  getJobStatus(t, n) {
    return this.fetchJson(`/imports/${encodeURIComponent(t)}`, n);
  }
  async cancelJob(t) {
    await this.request(`/imports/${encodeURIComponent(t)}/cancel`, { method: "POST" });
  }
  async *subscribeToJobEvents(t, n) {
    const r = await this.request(`/imports/${encodeURIComponent(t)}/events`, { signal: n });
    if (!r.body) throw new Error("服务器未返回任务事件流");
    const i = r.body.getReader(), a = new TextDecoder();
    let o = "";
    try {
      for (; ; ) {
        const { done: l, value: s } = await i.read();
        o += l ? a.decode() : a.decode(s, { stream: !0 });
        const d = o.split(`
`);
        o = d.pop() || "", l && o && d.push(o);
        for (const c of d) {
          if (!c.startsWith("data:")) continue;
          let m;
          try {
            m = JSON.parse(c.slice(5).trim());
          } catch {
            continue;
          }
          if (yield m, m.type === "done") return;
        }
        if (l) return;
      }
    } finally {
      try {
        await i.cancel();
      } catch {
      }
      i.releaseLock();
    }
  }
}
class zn extends Error {
  constructor(t) {
    super(t), this.name = "WorkspaceImportFailedError";
  }
}
function Vd(e, t) {
  return new Promise((n, r) => {
    const i = () => {
      clearTimeout(a), r(new DOMException("已停止等待导入", "AbortError"));
    }, a = setTimeout(() => {
      t == null || t.removeEventListener("abort", i), n();
    }, e);
    t != null && t.aborted ? i() : t == null || t.addEventListener("abort", i, { once: !0 });
  });
}
async function uo(e, t, n = {}) {
  var l;
  const { signal: r, onProgress: i, attempts: a = 240, intervalMs: o = 750 } = n;
  for (let s = 0; s < a; s++) {
    r == null || r.throwIfAborted();
    const d = await e.getJobStatus(t, r);
    if (r == null || r.throwIfAborted(), !["queued", "running", "completed", "failed", "cancelled"].includes(d.status)) throw new Error("导入任务返回未知状态");
    if (i == null || i({ ...d, progress: Number.isFinite(d.progress) ? Math.max(0, Math.min(1, d.progress)) : 0 }), d.status === "completed") {
      if (typeof ((l = d.result) == null ? void 0 : l.id) != "string" || !d.result.id.trim()) throw new zn("导入完成但未返回数据集编号");
      return d.result.id;
    }
    if (d.status === "failed" || d.status === "cancelled") throw new zn(d.error || (d.status === "cancelled" ? "导入任务已取消" : "导入失败"));
    s + 1 < a && await Vd(o, r);
  }
  throw new Error("等待导入超时，后台任务可能仍在处理；请稍后重试查询");
}
function Kd() {
  var x, j, X;
  const e = R(), t = e.React, { useEffect: n, useRef: r, useState: i } = t, { Spin: a, Alert: o, Button: l } = e.antd, s = r(null), d = r(null), c = r(null), [m, u] = i(!0), [p, b] = i(null), [g, E] = i(0), [f, h] = i("正在加载三维可视化引擎…"), v = ((x = e.useSelectedAgent) == null ? void 0 : x.call(e).id) || ((j = e.getSelectedAgentId) == null ? void 0 : j.call(e)), w = ((X = e.useLocation) == null ? void 0 : X.call(e).search) ?? window.location.search;
  return n(() => {
    const T = new AbortController();
    let A = null;
    return (async () => {
      var N, C;
      u(!0), b(null), h("正在加载三维可视化引擎…");
      try {
        const k = new URLSearchParams(w), z = (N = k.get("path")) == null ? void 0 : N.trim(), B = {
          agentId: k.get("agentId") || v,
          chatId: k.get("chatId") || void 0,
          projectDirOverride: k.get("projectDirOverride") || void 0
        }, _ = Fn(e, B);
        let L = k.get("datasetId") || void 0;
        if (z && !L) {
          const Y = new jr(_.apiBase, _.authToken, _), O = k.get("name") || z.replace(/\\/g, "/").split("/").pop() || z;
          h(`正在导入 ${O}…`);
          const I = k.get("root") === "workspace" ? "workspace" : "project", q = JSON.stringify([_.apiBase, _.headers, z, I]);
          if (((C = c.current) == null ? void 0 : C.scope) !== q) {
            c.current = null;
            const H = await Y.createWorkspaceImport(z, I, O.replace(/\.[^.]+$/, ""), T.signal);
            T.signal.throwIfAborted(), c.current = { scope: q, id: H.job_id };
          }
          L = await uo(Y, c.current.id, { signal: T.signal });
        }
        const D = await Br();
        if (T.signal.aborted || !s.current) return;
        h("正在加载场景…"), A = D.mount(s.current, { ..._, initialDatasetId: L, enableCommands: !0 }), d.current = A, await A.ready, T.signal.aborted || u(!1);
      } catch (k) {
        if (T.signal.aborted) return;
        k instanceof zn && (c.current = null), A == null || A.dispose(), A = null, d.current = null, b(k instanceof Error ? k.message : "可视化引擎加载失败"), u(!1);
      }
    })(), () => {
      T.abort(), A == null || A.dispose(), d.current === A && (d.current = null);
    };
  }, [g, v, w]), t.createElement(
    "div",
    { style: { width: "100%", height: "100%", minHeight: 300, position: "relative", overflow: "hidden" } },
    t.createElement("div", { ref: s, style: { width: "100%", height: "100%" } }),
    m && t.createElement("div", {
      role: "status",
      style: { position: "absolute", inset: 0, display: "grid", placeContent: "center", textAlign: "center", background: "#0d1117e8", color: "#dce5ef", zIndex: 100 }
    }, t.createElement(a, { size: "large" }), t.createElement("div", { style: { marginTop: 16 } }, f)),
    p && t.createElement(
      "div",
      { style: { position: "absolute", inset: 0, display: "grid", placeContent: "center", padding: 24, gap: 16, background: "#0d1117", zIndex: 100 } },
      t.createElement(o, { type: "error", message: "可视化引擎加载失败", description: p, showIcon: !0 }),
      t.createElement(l, { type: "primary", onClick: () => E((T) => T + 1) }, "重试")
    )
  );
}
function Xd({ jobId: e, file: t, onOpen: n, onRetryImport: r }) {
  const i = R(), a = i.React, { useEffect: o, useRef: l, useState: s } = a, { Button: d, Alert: c } = i.antd, m = l(null), [u, p] = s("等待后台处理…"), [b, g] = s(null), [E, f] = s(null), [h, v] = s(!1), [w, x] = s(0), [j, X] = s(!1);
  return o(() => {
    const T = new AbortController();
    let A = null;
    g(null), X(!1), v(!1), f(null);
    const F = Fn(i, t), N = new jr(F.apiBase, F.authToken, F);
    return (async () => {
      try {
        const C = await uo(N, e, {
          signal: T.signal,
          onProgress: (z) => p(`${z.status === "queued" ? "等待后台处理" : "正在解析数据"}（${Math.round(z.progress * 100)}%）`)
        });
        if (T.signal.aborted) return;
        f(C), p("正在加载场景…");
        const k = await Br();
        if (T.signal.aborted || !m.current) return;
        A = k.mount(m.current, { ...F, initialDatasetId: C, autoLoad: !1, compact: !0, enableCommands: !1 }), await A.ready, T.signal.aborted || v(!0);
      } catch (C) {
        if (T.signal.aborted) return;
        A == null || A.dispose(), A = null, X(C instanceof zn), g(C instanceof Error ? C.message : String(C));
      }
    })(), () => {
      T.abort(), A == null || A.dispose();
    };
  }, [e, w, t.agentId, t.chatId, t.projectDirOverride]), a.createElement(
    "div",
    { style: { width: "100%", marginTop: 8 } },
    a.createElement("div", { ref: m, "aria-label": "油气三维预览", style: {
      position: "relative",
      isolation: "isolate",
      width: "100%",
      height: 360,
      minHeight: 0,
      border: "1px solid #30363d",
      borderRadius: 8,
      overflow: "hidden",
      contain: "layout paint style",
      display: b ? "none" : "block"
    } }),
    !h && !b && a.createElement("div", { role: "status", style: { padding: 12 } }, u),
    b && a.createElement(c, { type: "warning", message: "预览失败", description: b, showIcon: !0 }),
    b && a.createElement(d, { onClick: () => j ? r() : x((T) => T + 1), style: { marginTop: 8 } }, j ? "重新导入" : "重试预览"),
    E && a.createElement(d, { type: "primary", onClick: () => n(E), style: { marginTop: 8 } }, "在可视化页面展开")
  );
}
function Yd(e) {
  var T, A, F;
  const t = R(), n = t.React, { useEffect: r, useState: i } = n, { Button: a, Spin: o, Alert: l, Typography: s } = t.antd, d = (T = t.useNavigate) == null ? void 0 : T.call(t), c = ((A = t.useSelectedAgent) == null ? void 0 : A.call(t).id) || ((F = t.getSelectedAgentId) == null ? void 0 : F.call(t)), m = e.artifact || e.file || {}, u = { ...m, agentId: m.agentId || c }, p = u.filename || u.title || e.filename || "未命名文件", b = u.workspacePath || u.path || e.workspacePath, g = JSON.stringify([b, p, u.workspaceRoot, u.agentId, u.chatId, u.projectDirOverride]), [E, f] = i(null), h = (E == null ? void 0 : E.key) === g ? E.id : null, [v, w] = i(null), [x, j] = i(0);
  r(() => {
    const N = new AbortController();
    if (f(null), w(null), !b) {
      w("文件缺少工作区路径，无法导入预览");
      return;
    }
    const C = Fn(t, u);
    return new jr(C.apiBase, C.authToken, C).createWorkspaceImport(b, u.workspaceRoot || "project", p.replace(/\.[^.]+$/, ""), N.signal).then((z) => {
      N.signal.aborted || f({ id: z.job_id, key: g });
    }).catch((z) => {
      N.signal.aborted || w(z instanceof Error ? z.message : String(z));
    }), () => N.abort();
  }, [g, x]);
  const X = (N) => {
    if (!d) {
      w("当前宿主未提供页面导航，请从侧栏打开油气可视化");
      return;
    }
    const C = new URLSearchParams({ datasetId: N }), k = u.agentId;
    k && C.set("agentId", k), u.chatId ? C.set("chatId", u.chatId) : u.projectDirOverride && C.set("projectDirOverride", u.projectDirOverride), d(`/oilgas-visualization?${C}`);
  };
  return n.createElement(
    "div",
    { style: { padding: 16, display: "flex", flexDirection: "column", gap: 12, alignItems: "center", width: "100%", boxSizing: "border-box" } },
    n.createElement(s.Text, { strong: !0 }, `文件：${p}`),
    !h && !v && n.createElement(o, { tip: "正在提交工作区文件…" }),
    v && n.createElement(l, { type: "warning", message: "预览提示", description: v, showIcon: !0 }),
    v && !h && b && n.createElement(a, { onClick: () => j((N) => N + 1) }, "重试导入"),
    h && n.createElement(Xd, { key: `${h}:${u.agentId || ""}:${u.chatId || ""}:${u.projectDirOverride || ""}`, jobId: h, file: u, onOpen: X, onRetryImport: () => j((N) => N + 1) })
  );
}
async function Zd(e, t = {}) {
  const { scope: n, signal: r, ...i } = t;
  r == null || r.throwIfAborted();
  const a = Fn(R(), n), o = await Br();
  return r == null || r.throwIfAborted(), o.mount(e, { ...a, autoLoad: !1, enableCommands: !1, ...i });
}
function Qd(e, t) {
  const n = "__ugsciVisualizationFrontendRegistered", r = window;
  if (r[n]) return;
  r[n] = !0, e.ugsci = { ...e.ugsci, visualization: { version: 1, mount: Zd } };
  const i = R().antdIcons || {}, a = i.GlobalOutlined || i.AppstoreOutlined;
  e.route.add("ugsci", {
    id: "ugsci.visualization",
    path: "/oilgas-visualization",
    component: Kd,
    meta: {
      domain: "workspace",
      title: "油气可视化",
      description: "地质气藏、井筒与地面管网的统一可视化工作台",
      scope: "agent",
      layout: "workbench",
      navigation: "rail"
    }
  }), e.menu.add("ugsci", {
    id: "ugsci.visualization",
    location: "primary.agentScoped",
    label: () => "油气可视化",
    icon: a ? t.createElement(a, { style: { fontSize: 16 } }) : void 0,
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
        component: Yd,
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
    } catch (l) {
      console.warn("[ugsci] Visualization workspace renderer registration failed:", l);
    }
}
const eu = /* @__PURE__ */ new Set([
  "launch_simulation",
  "check_simulation_status",
  "wait_for_simulation",
  "read_simulation_results",
  "analyze_simulation"
]), tu = /* @__PURE__ */ new Set([
  "plugin_call_output",
  "function_call_output",
  "tool_call_output",
  "mcp_call_output",
  "component_call_output",
  "tool_result"
]);
function nu(e) {
  const t = /* @__PURE__ */ new Map(), n = (i, a = 0) => {
    if (!(a > 16 || i == null)) {
      if (typeof i == "string") {
        if (i.length > 2e5) return;
        try {
          n(JSON.parse(i), a + 1);
        } catch {
          for (const o of i.matchAll(/<ugsci-simulation-ref>([\s\S]{1,4096}?)<\/ugsci-simulation-ref>/g))
            try {
              n(JSON.parse(o[1]), a + 1);
            } catch {
            }
        }
      } else if (Array.isArray(i))
        i.forEach((o) => n(o, a + 1));
      else if (typeof i == "object")
        if (i.kind === "ugsci_simulation" && i.schema_version === 1 && typeof i.run_id == "string" && /^[\w:.-]{1,160}$/.test(i.run_id))
          t.set(i.run_id, {
            kind: "ugsci_simulation",
            run_id: i.run_id,
            simulator: typeof i.simulator == "string" ? i.simulator : void 0,
            agent_id: typeof i.agent_id == "string" ? i.agent_id : void 0,
            session_id: typeof i.session_id == "string" ? i.session_id : void 0
          });
        else
          for (const o of ["text", "output", "content", "result", "data", "metadata"])
            n(i[o], a + 1);
    }
  }, r = (i, a = 0) => {
    var o;
    if (!(!i || typeof i != "object" || a > 16)) {
      if (Array.isArray(i)) {
        i.forEach((l) => r(l, a + 1));
        return;
      }
      if (!(i.role === "user" || i.role === "system")) {
        if (tu.has(i.type)) {
          const l = Array.isArray(i.content) ? i.content : [];
          [(o = i.data) == null ? void 0 : o.name, ...l.map((d) => {
            var c;
            return (c = d == null ? void 0 : d.data) == null ? void 0 : c.name;
          }), i.name].some((d) => eu.has(d)) && n(i);
          return;
        }
        for (const l of ["output", "content", "data"]) r(i[l], a + 1);
      }
    }
  };
  return r(e), [...t.values()];
}
function ru({ reference: e }) {
  var b, g, E, f, h, v;
  const t = R(), n = t.React, [r, i] = n.useState(!1), [, a] = n.useState(0), o = (b = t.useNavigate) == null ? void 0 : b.call(t), l = ((E = (g = t.useSelectedAgent) == null ? void 0 : g.call(t)) == null ? void 0 : E.id) || ((f = t.getSelectedAgentId) == null ? void 0 : f.call(t)) || "default", s = ((h = t.getCurrentSessionId) == null ? void 0 : h.call(t)) || "", d = e.agent_id || l, c = l === d;
  n.useEffect(() => {
    const w = () => a((x) => x + 1);
    return window.addEventListener("qwenpaw:simulation-monitor-ready", w), () => window.removeEventListener("qwenpaw:simulation-monitor-ready", w);
  }, []);
  const m = window.QwenPaw, u = (v = m == null ? void 0 : m.runCenter) == null ? void 0 : v.SimulationMonitor, p = () => window.dispatchEvent(new CustomEvent("qwenpaw:open-simulation-workbench", {
    detail: { runId: e.run_id, agentId: d, sessionId: s }
  }));
  return n.createElement(
    "section",
    {
      "aria-label": `数模任务 ${e.run_id}`,
      style: { padding: 14, margin: "10px 0", border: "1px solid var(--ant-color-border, #d9e2ec)", borderRadius: 10 }
    },
    n.createElement("strong", null, `数模任务 · ${e.simulator || "模拟计算"}`),
    n.createElement("div", { style: { fontSize: 12, color: "var(--ant-color-text-secondary, #64748b)", margin: "6px 0" } }, e.run_id),
    !c && n.createElement("p", null, "请切换到该任务所属智能体后查看结果。"),
    n.createElement(
      "div",
      { style: { display: "flex", flexWrap: "wrap", gap: 8 } },
      n.createElement("button", { type: "button", disabled: !c, onClick: p }, "在侧栏监测"),
      n.createElement("button", { type: "button", disabled: !c, "aria-expanded": r, onClick: () => i(!r) }, r ? "收起结果" : "查看实时结果"),
      o && n.createElement("button", { type: "button", disabled: !c, onClick: () => o(`/run-center?run_id=${encodeURIComponent(e.run_id)}`) }, "打开运行中心")
    ),
    r && c && (u ? n.createElement(u, { runId: e.run_id, compact: !0, scope: { agentId: d, chatId: s } }) : n.createElement("p", { role: "status" }, "运行中心监测组件尚未加载，请启用运行中心插件。"))
  );
}
function au({ data: e }) {
  const t = R().React;
  return t.createElement(
    t.Fragment,
    null,
    ...nu(e.output).map((n) => t.createElement(ru, { key: n.run_id, reference: n }))
  );
}
function iu(e, t) {
  var r, i, a, o;
  (r = e.ugsciSimulationDispose) == null || r.call(e);
  const n = (o = (a = (i = e.chat) == null ? void 0 : i.response) == null ? void 0 : a.append) == null ? void 0 : o.call(
    a,
    "ugsci",
    ({ data: l }) => t.createElement(au, { data: l }),
    { id: "ugsci.simulation.response-append", order: 60 }
  );
  e.ugsciSimulationDispose = () => {
    var l;
    return (l = n == null ? void 0 : n.dispose) == null ? void 0 : l.call(n);
  };
}
const Vt = "/ugsci/storage-dynamics", ei = (e) => e === "injection" ? "注气" : "采气", Ue = (e) => e == null ? "缺测" : e.toLocaleString("zh-CN", { maximumFractionDigits: 2 }), ou = {
  xls_row_limit: "疑似 XLS 导出截断",
  invalid_range: "数值超出合法范围",
  invalid_number: "无法识别数值",
  invalid_identity: "日期或库井标识无效",
  duplicate_identical: "相同重复已去重",
  duplicate_conflict: "重复冲突已排除"
}, su = {
  gas: "日气量",
  hours: "生产小时",
  pressure: "井口油压",
  casing: "套压",
  water: "日产水量",
  vent: "放空量"
};
function lu({ rows: e }) {
  const t = R().React, n = [...new Set(e.map((s) => s.month))].sort(), r = n.map((s) => {
    const d = e.filter((m) => m.month === s), c = (m) => {
      const u = d.map((p) => p[m]).filter((p) => p != null);
      return u.length ? u.reduce((p, b) => p + b, 0) : null;
    };
    return {
      month: s,
      injection: c("injection"),
      withdrawal: c("withdrawal")
    };
  }), i = Math.max(
    1,
    ...r.flatMap((s) => [s.injection || 0, s.withdrawal || 0])
  ), a = (s) => 65 + s * 635 / Math.max(1, n.length - 1), o = (s) => 245 - s / i * 200, l = (s) => {
    let d = !1;
    return r.map((c, m) => {
      if (c[s] == null)
        return d = !1, "";
      const u = `${d ? "L" : "M"}${a(m)},${o(c[s])}`;
      return d = !0, u;
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
    [0, 0.25, 0.5, 0.75, 1].map((s) => /* @__PURE__ */ t.createElement("g", { key: s }, /* @__PURE__ */ t.createElement(
      "line",
      {
        x1: "65",
        x2: "700",
        y1: o(s * i),
        y2: o(s * i),
        stroke: "currentColor",
        opacity: ".12"
      }
    ), /* @__PURE__ */ t.createElement(
      "text",
      {
        x: "57",
        y: o(s * i) + 4,
        textAnchor: "end",
        fill: "currentColor",
        fontSize: "12"
      },
      Ue(s * i)
    ))),
    /* @__PURE__ */ t.createElement(
      "path",
      {
        d: l("injection"),
        stroke: "#1677ff",
        strokeWidth: "2.5",
        fill: "none"
      }
    ),
    /* @__PURE__ */ t.createElement(
      "path",
      {
        d: l("withdrawal"),
        stroke: "#e8684a",
        strokeWidth: "2.5",
        fill: "none"
      }
    ),
    r.map((s, d) => /* @__PURE__ */ t.createElement("g", { key: s.month }, d % Math.max(1, Math.ceil(n.length / 8)) === 0 && /* @__PURE__ */ t.createElement(
      "text",
      {
        x: a(d),
        y: "274",
        textAnchor: "middle",
        fill: "currentColor",
        fontSize: "12"
      },
      s.month
    ), /* @__PURE__ */ t.createElement("rect", { x: a(d) - 3, y: "40", width: "6", height: "205", fill: "transparent" }, /* @__PURE__ */ t.createElement("title", null, s.month, " 注气 ", Ue(s.injection), " / 采气 ", Ue(s.withdrawal), " ", "万m³"))))
  ));
}
function cu() {
  const e = R(), t = e.React, {
    Card: n,
    Select: r,
    Input: i,
    Button: a,
    Space: o,
    Alert: l,
    Table: s,
    Tabs: d,
    Statistic: c,
    Spin: m,
    DatePicker: u,
    InputNumber: p,
    Typography: b
  } = e.antd, [g, E] = t.useState([]), [f, h] = t.useState(""), [v, w] = t.useState(""), [x, j] = t.useState(""), [X, T] = t.useState(""), [A, F] = t.useState(""), [N, C] = t.useState(""), [k, z] = t.useState(4), [B, _] = t.useState(30), [L, D] = t.useState(null), [Y, O] = t.useState(null), [I, q] = t.useState(""), [H, U] = t.useState(""), M = t.useRef(!0), ne = async (P) => {
    var _e;
    const le = await me(`${Vt}/datasets`, {
      bypassCache: !0
    });
    if (!M.current) return;
    const Ee = le.datasets.sort(
      (ke, Se) => Se.created_at.localeCompare(ke.created_at)
    );
    E(Ee), h(P || ((_e = Ee[0]) == null ? void 0 : _e.id) || "");
  };
  t.useEffect(() => (M.current = !0, ne().catch((P) => {
    M.current && U(String(P.message || P));
  }), () => {
    M.current = !1;
  }), []);
  const re = () => ({
    dataset_id: f,
    facility: x,
    well: X,
    start: A,
    end: N,
    cycle_start_month: k,
    drop_threshold_pct: B
  }), K = async () => {
    U(""), q("读取并审计数据…");
    try {
      const P = await me(`${Vt}/imports`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input_path: v })
      });
      for (; M.current; ) {
        await new Promise((Ee) => setTimeout(Ee, 1200));
        const le = await me(`${Vt}/imports/${P.id}`, {
          bypassCache: !0
        });
        if (le.status === "failed") throw new Error(le.error);
        if (le.status === "completed") {
          await ne(le.dataset.id), D(null), j(""), T("");
          break;
        }
      }
    } catch (P) {
      M.current && U(P.message || String(P));
    } finally {
      M.current && q("");
    }
  }, pe = async () => {
    U(""), q("分析注采动态…");
    const P = re();
    try {
      const le = await me(`${Vt}/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(P)
      });
      M.current && (D(le), O(P));
    } catch (le) {
      M.current && U(le.message || String(le));
    } finally {
      M.current && q("");
    }
  }, ae = async () => {
    if (Y) {
      q("生成报告…"), U("");
      try {
        const P = await ct(`${Vt}/export`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(Y)
        });
        if (!P.ok) throw new Error(await P.text());
        const le = URL.createObjectURL(await P.blob()), Ee = document.createElement("a");
        Ee.href = le, Ee.download = "储气库生产动态分析报告.md", Ee.click(), setTimeout(() => URL.revokeObjectURL(le), 1e3);
      } catch (P) {
        U(P.message || String(P));
      } finally {
        M.current && q("");
      }
    }
  }, J = g.find((P) => P.id === f), de = (P, le, Ee) => /* @__PURE__ */ t.createElement(
    s,
    {
      size: "small",
      dataSource: P,
      columns: le,
      rowKey: Ee,
      pagination: { pageSize: 12, showSizeChanger: !0 },
      scroll: { x: "max-content" }
    }
  ), G = (P, le, Ee) => ({ title: P, dataIndex: le, render: Ee });
  return /* @__PURE__ */ t.createElement("div", { style: { padding: 24, maxWidth: 1600, margin: "0 auto" } }, /* @__PURE__ */ t.createElement(b.Title, { level: 2, style: { marginTop: 0 } }, "储气库生产动态分析"), /* @__PURE__ */ t.createElement(b.Paragraph, { type: "secondary" }, "从注采日记录到库井动态、运行阶段与复核线索。保留计量口径，每个异常可追溯到原表。"), /* @__PURE__ */ t.createElement(n, { title: "数据与分析范围", style: { marginBottom: 18 } }, /* @__PURE__ */ t.createElement(o.Compact, { style: { width: "100%", marginBottom: 16 } }, /* @__PURE__ */ t.createElement(
    i,
    {
      "aria-label": "注采数据路径",
      value: v,
      onChange: (P) => w(P.target.value),
      placeholder: "本地 XLS / XLSX / UTF-8 CSV 文件或目录的绝对路径",
      disabled: !!I
    }
  ), /* @__PURE__ */ t.createElement(a, { onClick: K, disabled: !v.trim() || !!I }, "导入并检查")), /* @__PURE__ */ t.createElement(o, { wrap: !0, style: { marginBottom: 12 } }, /* @__PURE__ */ t.createElement(
    r,
    {
      "aria-label": "数据集",
      style: { minWidth: 260 },
      placeholder: "选择数据集",
      value: f || void 0,
      disabled: !!I,
      onChange: (P) => {
        h(P), j(""), T(""), D(null);
      },
      options: g.map((P) => ({
        label: `${P.name} · ${Ue(P.records)} 条`,
        value: P.id
      }))
    }
  ), /* @__PURE__ */ t.createElement(
    r,
    {
      "aria-label": "储气库",
      value: x,
      style: { minWidth: 145 },
      disabled: !!I,
      onChange: (P) => {
        j(P), T("");
      },
      options: [
        { label: "全部储气库", value: "" },
        ...((J == null ? void 0 : J.facilities) || []).map((P) => ({
          label: P.facility,
          value: P.facility
        }))
      ]
    }
  ), /* @__PURE__ */ t.createElement(
    i,
    {
      "aria-label": "井号",
      value: X,
      onChange: (P) => T(P.target.value),
      placeholder: "原始井号（可选）",
      style: { width: 150 },
      disabled: !!I
    }
  ), /* @__PURE__ */ t.createElement(
    i,
    {
      "aria-label": "起始日期",
      type: "date",
      value: A,
      onChange: (P) => F(P.target.value),
      disabled: !!I,
      style: { width: 155 }
    }
  ), /* @__PURE__ */ t.createElement("span", null, "至"), /* @__PURE__ */ t.createElement(
    i,
    {
      "aria-label": "截止日期",
      type: "date",
      value: N,
      onChange: (P) => C(P.target.value),
      disabled: !!I,
      style: { width: 155 }
    }
  )), /* @__PURE__ */ t.createElement(o, { wrap: !0 }, /* @__PURE__ */ t.createElement("span", null, "气年度起始月"), /* @__PURE__ */ t.createElement(
    p,
    {
      "aria-label": "气年度起始月份",
      min: 1,
      max: 12,
      value: k,
      disabled: !!I,
      onChange: (P) => z(P || 4)
    }
  ), /* @__PURE__ */ t.createElement("span", null, "折算量下降筛查阈值（%）"), /* @__PURE__ */ t.createElement(
    p,
    {
      "aria-label": "下降筛查阈值",
      min: 1,
      max: 100,
      value: B,
      disabled: !!I,
      onChange: (P) => _(P || 30)
    }
  ), /* @__PURE__ */ t.createElement(a, { type: "primary", onClick: pe, disabled: !f || !!I }, "分析动态"), /* @__PURE__ */ t.createElement(a, { onClick: ae, disabled: !L || !!I }, "下载分析报告"))), H && /* @__PURE__ */ t.createElement(
    l,
    {
      type: "error",
      showIcon: !0,
      message: H,
      style: { marginBottom: 16 }
    }
  ), I && /* @__PURE__ */ t.createElement("div", { role: "status", style: { padding: 16 } }, /* @__PURE__ */ t.createElement(m, { size: "small" }), " ", I), !L && !I && /* @__PURE__ */ t.createElement(n, null, /* @__PURE__ */ t.createElement(b.Paragraph, null, "选择已导入数据集并点击“分析动态”。也可以在专家中心创建“储气库生产动态分析师”，通过对话调用相同的分析工具。"), /* @__PURE__ */ t.createElement(
    l,
    {
      type: "info",
      showIcon: !0,
      message: "源文件只读；空值不补零，井口油压不替代地层压力。"
    }
  )), L && /* @__PURE__ */ t.createElement(t.Fragment, null, /* @__PURE__ */ t.createElement(
    l,
    {
      type: "info",
      showIcon: !0,
      message: `分析截至数据日期 ${L.summary.as_of} · ${L.filters.facility || "全部库"} / ${L.filters.well || "全部井"} · ${L.summary.start} 起 · 气年度 ${L.parameters.cycle_start_month} 月起 · 筛查阈值 ${L.parameters.drop_threshold_pct}%`,
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
        `${L.summary.facilities} / ${L.summary.wells}`,
        ""
      ],
      ["已记录累计注气", Ue(L.summary.injection), "万m³"],
      ["已记录累计采气", Ue(L.summary.withdrawal), "万m³"],
      ["气量缺测日记录", Ue(L.summary.missing_gas), "条"],
      ["筛查线索", Ue(L.summary.anomaly_count), "项"]
    ].map(([P, le, Ee]) => /* @__PURE__ */ t.createElement(n, { key: P, size: "small" }, /* @__PURE__ */ t.createElement(c, { title: P, value: le, suffix: Ee })))
  ), /* @__PURE__ */ t.createElement(n, { title: "注采月度动态", style: { marginBottom: 18 } }, /* @__PURE__ */ t.createElement(lu, { rows: L.monthly }), /* @__PURE__ */ t.createElement(b.Text, { type: "secondary" }, "未记录的一侧保持缺测。累计注采差额需要完整历史与期初库存才能参与库存核算。")), /* @__PURE__ */ t.createElement(n, null, /* @__PURE__ */ t.createElement(
    d,
    {
      items: [
        {
          key: "coverage",
          label: "数据覆盖与质量",
          children: /* @__PURE__ */ t.createElement(t.Fragment, null, de(
            L.coverage,
            [
              G("储气库", "facility"),
              G("方向", "mode", ei),
              G("起始日期", "start"),
              G("截止日期", "end"),
              G("记录数", "records", Ue),
              G("气量缺测", "missing_gas", Ue),
              G("计量量 / 万m³", "observed_volume", Ue)
            ],
            (P) => `${P.facility}-${P.mode}`
          ), /* @__PURE__ */ t.createElement(
            l,
            {
              type: "warning",
              showIcon: !0,
              message: "分析口径与数据限制",
              description: /* @__PURE__ */ t.createElement("ul", null, L.warnings.map((P, le) => /* @__PURE__ */ t.createElement("li", { key: le }, P)))
            }
          ), /* @__PURE__ */ t.createElement(b.Paragraph, { style: { marginTop: 12 } }, "整个数据集导入检查：", Object.entries(L.quality.import_counts).map(([P, le]) => `${ou[P] || P} ${le} 项`).join("；") || "未发现已配置检查项中的问题", "。下方最多显示 100 条原表问题样例。"), de(
            L.quality.examples,
            [
              G("问题", "message"),
              G(
                "字段",
                "field",
                (P) => su[P] || P || "—"
              ),
              G("文件", "file"),
              G("表", "sheet"),
              G("原行号", "row")
            ],
            (P) => `${P.file}-${P.sheet}-${P.row}-${P.code}-${P.field}`
          ))
        },
        {
          key: "cycles",
          label: "气年度与阶段",
          children: /* @__PURE__ */ t.createElement(t.Fragment, null, de(
            L.cycles,
            [
              G("储气库", "facility"),
              G("气年度", "gas_year"),
              G("注气 / 万m³", "injection", Ue),
              G("采气 / 万m³", "withdrawal", Ue),
              G("净计量变化 / 万m³", "net_metered_change", Ue),
              G(
                "水气质量比 / t/万m³",
                "water_gas_mass_ratio",
                Ue
              ),
              G("覆盖状态", "completeness")
            ],
            (P) => `${P.facility}-${P.gas_year}`
          ), /* @__PURE__ */ t.createElement(b.Title, { level: 5 }, "近期运行阶段（按实测记录）"), de(
            L.phases_recent,
            [
              G("库", "facility"),
              G(
                "状态",
                "state",
                (P) => ({
                  injection: "注气",
                  withdrawal: "采气",
                  mixed: "混合",
                  zero_observed: "已观测零气量",
                  unknown: "气量未知"
                })[P] || P
              ),
              G("起始", "start"),
              G("截止", "end"),
              G("连续观测日", "observed_days")
            ],
            (P) => `${P.facility}-${P.start}`
          ))
        },
        {
          key: "wells",
          label: "井动态与短期基线",
          children: /* @__PURE__ */ t.createElement(t.Fragment, null, de(
            L.wells,
            [
              G("库", "facility"),
              G("井号", "well"),
              G("方向", "mode", ei),
              G("运行日", "active_days", Ue),
              G("累计计量 / 万m³", "observed_volume", Ue),
              G("最近运行日期", "last_active_date"),
              G("折算量变化 / %", "rate_change_pct", Ue),
              G("井口油压变化 / %", "pressure_change_pct", Ue),
              G(
                "条件性日量基线 / 万m³",
                "forecast",
                (P) => Ue(P == null ? void 0 : P.daily_volume)
              ),
              G(
                "滚动回测 MAE / 万m³",
                "forecast",
                (P) => Ue(P == null ? void 0 : P.backtest_mae)
              ),
              G("基线状态", "forecast_reason")
            ],
            (P) => `${P.facility}-${P.well}-${P.mode}`
          ), /* @__PURE__ */ t.createElement(b.Text, { type: "secondary" }, "短期基线仅限保持工况的 7 日分析；停井、缺测与日期断档会断开阶段。回测仅使用预测时点之前的记录。"))
        },
        {
          key: "anomalies",
          label: "复核线索",
          children: /* @__PURE__ */ t.createElement(t.Fragment, null, /* @__PURE__ */ t.createElement(b.Paragraph, null, "共 ", Ue(L.summary.anomaly_count), " ", "项筛查线索，显示最近 100 项。线索需要结合现场调度与工程资料复核。"), de(
            L.anomalies,
            [
              G("日期", "day"),
              G("库", "facility"),
              G("井号", "well"),
              G("线索", "message"),
              G("变化 / %", "rate_change_pct", Ue),
              G(
                "原表位置",
                "source",
                (P) => `${P.file} / ${P.sheet} / 第 ${P.row} 行`
              )
            ],
            (P) => `${P.facility}-${P.well}-${P.day}-${P.code}`
          ))
        }
      ]
    }
  ))));
}
function du() {
  var s, d, c, m;
  const e = window.QwenPaw;
  if (!(e != null && e.menu) || !(e != null && e.route)) {
    console.warn(
      "[ugsci] QwenPaw.menu/route API not available — plugin disabled"
    );
    return;
  }
  const t = R().React, n = "ugsci";
  iu(e, t);
  function r() {
    return R().React.createElement(mc, { embedded: !0 });
  }
  function i() {
    return R().React.useEffect(() => {
      window.history.replaceState({}, "", "/market?tab=ugsci"), window.dispatchEvent(new PopStateEvent("popstate"));
    }, []), null;
  }
  (d = (s = e.chat) == null ? void 0 : s.rightHeader) != null && d.add ? (e.chat.rightHeader.add(
    n,
    t.createElement(fc),
    {
      id: "ugsci.welcome-injector",
      order: -1
      // render before other right-header items (invisible anyway)
    }
  ), console.info("[ugsci] WelcomePromptsInjector registered via rightHeader")) : console.warn(
    "[ugsci] QP.chat.rightHeader.add not available — agent-specific welcome prompts disabled"
  );
  const a = R().antdIcons || {}, o = a.UserSwitchOutlined, l = a.ToolOutlined;
  e.route.add(n, {
    id: "ugsci.storage-dynamics",
    path: "/ugsci-storage-dynamics",
    component: cu
  }), e.menu.add(n, {
    id: "ugsci.storage-dynamics",
    location: "primary.agentScoped",
    label: () => "储气库动态",
    icon: a.LineChartOutlined ? t.createElement(a.LineChartOutlined, {
      style: { fontSize: 16 }
    }) : void 0,
    route: "ugsci.storage-dynamics",
    order: 7
  }), e.route.add(n, {
    id: "ugsci.experts",
    path: "/ugsci-experts",
    component: dl
  }), e.menu.add(n, {
    id: "ugsci.experts",
    location: "primary.agentScoped",
    label: () => "专家·协作",
    icon: o ? t.createElement(o, { style: { fontSize: 16 } }) : void 0,
    route: "ugsci.experts",
    order: 5
  }), e.route.add(n, {
    id: "ugsci.settings",
    path: "/ugsci-settings",
    component: qd
  }), e.route.add(n, {
    id: "ugsci.genui-settings",
    path: "/ugsci-genui-settings",
    component: Jd
  }), e.route.add(n, {
    id: "ugsci.tools-skills",
    path: "/ugsci-tools-skills",
    component: Pi
  }), e.menu.add(n, {
    id: "ugsci.tools-skills",
    location: "primary.agentScoped",
    label: () => "工具·技能",
    icon: l ? t.createElement(l, { style: { fontSize: 16 } }) : void 0,
    route: "ugsci.tools-skills",
    order: 6
  }), e.route.add(n, {
    id: "ugsci.capabilities",
    path: "/ugsci-capabilities",
    component: Nl
  }), e.route.add(n, {
    id: "ugsci.skills-center",
    path: "/ugsci-skills",
    component: Dl
  }), e.route.add(n, {
    id: "ugsci.market",
    path: "/ugsci-market",
    component: i
  }), (c = e.marketplace) == null || c.add(n, {
    id: "ugsci",
    label: "UGSci",
    component: r,
    order: 30
  }), (m = e.sidebar) != null && m.registerSimpleModeItems ? (e.sidebar.registerSimpleModeItems([
    "ugsci.experts",
    "ugsci.tools-skills",
    "ugsci.storage-dynamics"
  ]), console.info(
    "[ugsci] Registered 3 entries for legacy simple-mode compatibility"
  )) : console.warn(
    "[ugsci] window.QwenPaw.sidebar.registerSimpleModeItems not available — items will not appear in simple mode"
  );
  try {
    const p = e.menu.snapshot("primary.agentScoped").find((b) => b.id === "oilgas-vis.page");
    p && e.menu.replace(n, "oilgas-vis.page", {
      ...p,
      visible: () => !1
    });
  } catch {
  }
  Wd(e, t), Qd(e, t), console.info(
    "[ugsci] Plugin registered: unified Tools & Skills center + compatibility routes, host-managed navigation"
  );
}
function br() {
  try {
    du();
  } catch (e) {
    console.error("[ugsci] Failed to build plugin:", e), setTimeout(br, 500);
  }
}
var li;
if ((li = window.QwenPaw) != null && li.host)
  br();
else {
  const e = setInterval(() => {
    var t;
    (t = window.QwenPaw) != null && t.host && (clearInterval(e), br());
  }, 200);
  setTimeout(() => clearInterval(e), 1e4);
}
function uu(e, t) {
  if (e.match(/^[a-z]+:\/\//i))
    return e;
  if (e.match(/^\/\//))
    return window.location.protocol + e;
  if (e.match(/^[a-z]+:/i))
    return e;
  const n = document.implementation.createHTMLDocument(), r = n.createElement("base"), i = n.createElement("a");
  return n.head.appendChild(r), n.body.appendChild(i), t && (r.href = t), i.href = e, i.href;
}
const mu = /* @__PURE__ */ (() => {
  let e = 0;
  const t = () => (
    // eslint-disable-next-line no-bitwise
    `0000${(Math.random() * 36 ** 4 << 0).toString(36)}`.slice(-4)
  );
  return () => (e += 1, `u${t()}${e}`);
})();
function yt(e) {
  const t = [];
  for (let n = 0, r = e.length; n < r; n++)
    t.push(e[n]);
  return t;
}
let At = null;
function mo(e = {}) {
  return At || (e.includeStyleProperties ? (At = e.includeStyleProperties, At) : (At = yt(window.getComputedStyle(document.documentElement)), At));
}
function Pn(e, t) {
  const r = (e.ownerDocument.defaultView || window).getComputedStyle(e).getPropertyValue(t);
  return r ? parseFloat(r.replace("px", "")) : 0;
}
function pu(e) {
  const t = Pn(e, "border-left-width"), n = Pn(e, "border-right-width");
  return e.clientWidth + t + n;
}
function fu(e) {
  const t = Pn(e, "border-top-width"), n = Pn(e, "border-bottom-width");
  return e.clientHeight + t + n;
}
function po(e, t = {}) {
  const n = t.width || pu(e), r = t.height || fu(e);
  return { width: n, height: r };
}
function gu() {
  let e, t;
  try {
    t = process;
  } catch {
  }
  const n = t && t.env ? t.env.devicePixelRatio : null;
  return n && (e = parseInt(n, 10), Number.isNaN(e) && (e = 1)), e || window.devicePixelRatio || 1;
}
const Qe = 16384;
function yu(e) {
  (e.width > Qe || e.height > Qe) && (e.width > Qe && e.height > Qe ? e.width > e.height ? (e.height *= Qe / e.width, e.width = Qe) : (e.width *= Qe / e.height, e.height = Qe) : e.width > Qe ? (e.height *= Qe / e.width, e.width = Qe) : (e.width *= Qe / e.height, e.height = Qe));
}
function Rn(e) {
  return new Promise((t, n) => {
    const r = new Image();
    r.onload = () => {
      r.decode().then(() => {
        requestAnimationFrame(() => t(r));
      });
    }, r.onerror = n, r.crossOrigin = "anonymous", r.decoding = "async", r.src = e;
  });
}
async function hu(e) {
  return Promise.resolve().then(() => new XMLSerializer().serializeToString(e)).then(encodeURIComponent).then((t) => `data:image/svg+xml;charset=utf-8,${t}`);
}
async function Eu(e, t, n) {
  const r = "http://www.w3.org/2000/svg", i = document.createElementNS(r, "svg"), a = document.createElementNS(r, "foreignObject");
  return i.setAttribute("width", `${t}`), i.setAttribute("height", `${n}`), i.setAttribute("viewBox", `0 0 ${t} ${n}`), a.setAttribute("width", "100%"), a.setAttribute("height", "100%"), a.setAttribute("x", "0"), a.setAttribute("y", "0"), a.setAttribute("externalResourcesRequired", "true"), i.appendChild(a), a.appendChild(e), hu(i);
}
const Xe = (e, t) => {
  if (e instanceof t)
    return !0;
  const n = Object.getPrototypeOf(e);
  return n === null ? !1 : n.constructor.name === t.name || Xe(n, t);
};
function bu(e) {
  const t = e.getPropertyValue("content");
  return `${e.cssText} content: '${t.replace(/'|"/g, "")}';`;
}
function vu(e, t) {
  return mo(t).map((n) => {
    const r = e.getPropertyValue(n), i = e.getPropertyPriority(n);
    return `${n}: ${r}${i ? " !important" : ""};`;
  }).join(" ");
}
function wu(e, t, n, r) {
  const i = `.${e}:${t}`, a = n.cssText ? bu(n) : vu(n, r);
  return document.createTextNode(`${i}{${a}}`);
}
function ti(e, t, n, r) {
  const i = window.getComputedStyle(e, n), a = i.getPropertyValue("content");
  if (a === "" || a === "none")
    return;
  const o = mu();
  try {
    t.className = `${t.className} ${o}`;
  } catch {
    return;
  }
  const l = document.createElement("style");
  l.appendChild(wu(o, n, i, r)), t.appendChild(l);
}
function Su(e, t, n) {
  ti(e, t, ":before", n), ti(e, t, ":after", n);
}
const ni = "application/font-woff", ri = "image/jpeg", xu = {
  woff: ni,
  woff2: ni,
  ttf: "application/font-truetype",
  eot: "application/vnd.ms-fontobject",
  png: "image/png",
  jpg: ri,
  jpeg: ri,
  gif: "image/gif",
  tiff: "image/tiff",
  svg: "image/svg+xml",
  webp: "image/webp"
};
function _u(e) {
  const t = /\.([^./]*?)$/g.exec(e);
  return t ? t[1] : "";
}
function Ur(e) {
  const t = _u(e).toLowerCase();
  return xu[t] || "";
}
function ku(e) {
  return e.split(/,/)[1];
}
function vr(e) {
  return e.search(/^(data:)/) !== -1;
}
function Cu(e, t) {
  return `data:${t};base64,${e}`;
}
async function fo(e, t, n) {
  const r = await fetch(e, t);
  if (r.status === 404)
    throw new Error(`Resource "${r.url}" not found`);
  const i = await r.blob();
  return new Promise((a, o) => {
    const l = new FileReader();
    l.onerror = o, l.onloadend = () => {
      try {
        a(n({ res: r, result: l.result }));
      } catch (s) {
        o(s);
      }
    }, l.readAsDataURL(i);
  });
}
const ar = {};
function Tu(e, t, n) {
  let r = e.replace(/\?.*/, "");
  return n && (r = e), /ttf|otf|eot|woff2?/i.test(r) && (r = r.replace(/.*\//, "")), t ? `[${t}]${r}` : r;
}
async function Nr(e, t, n) {
  const r = Tu(e, t, n.includeQueryParams);
  if (ar[r] != null)
    return ar[r];
  n.cacheBust && (e += (/\?/.test(e) ? "&" : "?") + (/* @__PURE__ */ new Date()).getTime());
  let i;
  try {
    const a = await fo(e, n.fetchRequestInit, ({ res: o, result: l }) => (t || (t = o.headers.get("Content-Type") || ""), ku(l)));
    i = Cu(a, t);
  } catch (a) {
    i = n.imagePlaceholder || "";
    let o = `Failed to fetch resource: ${e}`;
    a && (o = typeof a == "string" ? a : a.message), o && console.warn(o);
  }
  return ar[r] = i, i;
}
async function Iu(e) {
  const t = e.toDataURL();
  return t === "data:," ? e.cloneNode(!1) : Rn(t);
}
async function Au(e, t) {
  if (e.currentSrc) {
    const a = document.createElement("canvas"), o = a.getContext("2d");
    a.width = e.clientWidth, a.height = e.clientHeight, o == null || o.drawImage(e, 0, 0, a.width, a.height);
    const l = a.toDataURL();
    return Rn(l);
  }
  const n = e.poster, r = Ur(n), i = await Nr(n, r, t);
  return Rn(i);
}
async function $u(e, t) {
  var n;
  try {
    if (!((n = e == null ? void 0 : e.contentDocument) === null || n === void 0) && n.body)
      return await Gn(e.contentDocument.body, t, !0);
  } catch {
  }
  return e.cloneNode(!1);
}
async function zu(e, t) {
  return Xe(e, HTMLCanvasElement) ? Iu(e) : Xe(e, HTMLVideoElement) ? Au(e, t) : Xe(e, HTMLIFrameElement) ? $u(e, t) : e.cloneNode(go(e));
}
const Pu = (e) => e.tagName != null && e.tagName.toUpperCase() === "SLOT", go = (e) => e.tagName != null && e.tagName.toUpperCase() === "SVG";
async function Ru(e, t, n) {
  var r, i;
  if (go(t))
    return t;
  let a = [];
  return Pu(e) && e.assignedNodes ? a = yt(e.assignedNodes()) : Xe(e, HTMLIFrameElement) && (!((r = e.contentDocument) === null || r === void 0) && r.body) ? a = yt(e.contentDocument.body.childNodes) : a = yt(((i = e.shadowRoot) !== null && i !== void 0 ? i : e).childNodes), a.length === 0 || Xe(e, HTMLVideoElement) || await a.reduce((o, l) => o.then(() => Gn(l, n)).then((s) => {
    s && t.appendChild(s);
  }), Promise.resolve()), t;
}
function Ou(e, t, n) {
  const r = t.style;
  if (!r)
    return;
  const i = window.getComputedStyle(e);
  i.cssText ? (r.cssText = i.cssText, r.transformOrigin = i.transformOrigin) : mo(n).forEach((a) => {
    let o = i.getPropertyValue(a);
    a === "font-size" && o.endsWith("px") && (o = `${Math.floor(parseFloat(o.substring(0, o.length - 2))) - 0.1}px`), Xe(e, HTMLIFrameElement) && a === "display" && o === "inline" && (o = "block"), a === "d" && t.getAttribute("d") && (o = `path(${t.getAttribute("d")})`), r.setProperty(a, o, i.getPropertyPriority(a));
  });
}
function Mu(e, t) {
  Xe(e, HTMLTextAreaElement) && (t.innerHTML = e.value), Xe(e, HTMLInputElement) && t.setAttribute("value", e.value);
}
function Lu(e, t) {
  if (Xe(e, HTMLSelectElement)) {
    const n = t, r = Array.from(n.children).find((i) => e.value === i.getAttribute("value"));
    r && r.setAttribute("selected", "");
  }
}
function Bu(e, t, n) {
  return Xe(t, Element) && (Ou(e, t, n), Su(e, t, n), Mu(e, t), Lu(e, t)), t;
}
async function ju(e, t) {
  const n = e.querySelectorAll ? e.querySelectorAll("use") : [];
  if (n.length === 0)
    return e;
  const r = {};
  for (let a = 0; a < n.length; a++) {
    const l = n[a].getAttribute("xlink:href");
    if (l) {
      const s = e.querySelector(l), d = document.querySelector(l);
      !s && d && !r[l] && (r[l] = await Gn(d, t, !0));
    }
  }
  const i = Object.values(r);
  if (i.length) {
    const a = "http://www.w3.org/1999/xhtml", o = document.createElementNS(a, "svg");
    o.setAttribute("xmlns", a), o.style.position = "absolute", o.style.width = "0", o.style.height = "0", o.style.overflow = "hidden", o.style.display = "none";
    const l = document.createElementNS(a, "defs");
    o.appendChild(l);
    for (let s = 0; s < i.length; s++)
      l.appendChild(i[s]);
    e.appendChild(o);
  }
  return e;
}
async function Gn(e, t, n) {
  return !n && t.filter && !t.filter(e) ? null : Promise.resolve(e).then((r) => zu(r, t)).then((r) => Ru(e, r, t)).then((r) => Bu(e, r, t)).then((r) => ju(r, t));
}
const yo = /url\((['"]?)([^'"]+?)\1\)/g, Uu = /url\([^)]+\)\s*format\((["']?)([^"']+)\1\)/g, Nu = /src:\s*(?:url\([^)]+\)\s*format\([^)]+\)[,;]\s*)+/g;
function Du(e) {
  const t = e.replace(/([.*+?^${}()|\[\]\/\\])/g, "\\$1");
  return new RegExp(`(url\\(['"]?)(${t})(['"]?\\))`, "g");
}
function Fu(e) {
  const t = [];
  return e.replace(yo, (n, r, i) => (t.push(i), n)), t.filter((n) => !vr(n));
}
async function Gu(e, t, n, r, i) {
  try {
    const a = n ? uu(t, n) : t, o = Ur(t);
    let l;
    return i || (l = await Nr(a, o, r)), e.replace(Du(t), `$1${l}$3`);
  } catch {
  }
  return e;
}
function Wu(e, { preferredFontFormat: t }) {
  return t ? e.replace(Nu, (n) => {
    for (; ; ) {
      const [r, , i] = Uu.exec(n) || [];
      if (!i)
        return "";
      if (i === t)
        return `src: ${r};`;
    }
  }) : e;
}
function ho(e) {
  return e.search(yo) !== -1;
}
async function Eo(e, t, n) {
  if (!ho(e))
    return e;
  const r = Wu(e, n);
  return Fu(r).reduce((a, o) => a.then((l) => Gu(l, o, t, n)), Promise.resolve(r));
}
async function $t(e, t, n) {
  var r;
  const i = (r = t.style) === null || r === void 0 ? void 0 : r.getPropertyValue(e);
  if (i) {
    const a = await Eo(i, null, n);
    return t.style.setProperty(e, a, t.style.getPropertyPriority(e)), !0;
  }
  return !1;
}
async function Hu(e, t) {
  await $t("background", e, t) || await $t("background-image", e, t), await $t("mask", e, t) || await $t("-webkit-mask", e, t) || await $t("mask-image", e, t) || await $t("-webkit-mask-image", e, t);
}
async function qu(e, t) {
  const n = Xe(e, HTMLImageElement);
  if (!(n && !vr(e.src)) && !(Xe(e, SVGImageElement) && !vr(e.href.baseVal)))
    return;
  const r = n ? e.src : e.href.baseVal, i = await Nr(r, Ur(r), t);
  await new Promise((a, o) => {
    e.onload = a, e.onerror = t.onImageErrorHandler ? (...s) => {
      try {
        a(t.onImageErrorHandler(...s));
      } catch (d) {
        o(d);
      }
    } : o;
    const l = e;
    l.decode && (l.decode = a), l.loading === "lazy" && (l.loading = "eager"), n ? (e.srcset = "", e.src = i) : e.href.baseVal = i;
  });
}
async function Ju(e, t) {
  const r = yt(e.childNodes).map((i) => bo(i, t));
  await Promise.all(r).then(() => e);
}
async function bo(e, t) {
  Xe(e, Element) && (await Hu(e, t), await qu(e, t), await Ju(e, t));
}
function Vu(e, t) {
  const { style: n } = e;
  t.backgroundColor && (n.backgroundColor = t.backgroundColor), t.width && (n.width = `${t.width}px`), t.height && (n.height = `${t.height}px`);
  const r = t.style;
  return r != null && Object.keys(r).forEach((i) => {
    n[i] = r[i];
  }), e;
}
const ai = {};
async function ii(e) {
  let t = ai[e];
  if (t != null)
    return t;
  const r = await (await fetch(e)).text();
  return t = { url: e, cssText: r }, ai[e] = t, t;
}
async function oi(e, t) {
  let n = e.cssText;
  const r = /url\(["']?([^"')]+)["']?\)/g, a = (n.match(/url\([^)]+\)/g) || []).map(async (o) => {
    let l = o.replace(r, "$1");
    return l.startsWith("https://") || (l = new URL(l, e.url).href), fo(l, t.fetchRequestInit, ({ result: s }) => (n = n.replace(o, `url(${s})`), [o, s]));
  });
  return Promise.all(a).then(() => n);
}
function si(e) {
  if (e == null)
    return [];
  const t = [], n = /(\/\*[\s\S]*?\*\/)/gi;
  let r = e.replace(n, "");
  const i = new RegExp("((@.*?keyframes [\\s\\S]*?){([\\s\\S]*?}\\s*?)})", "gi");
  for (; ; ) {
    const s = i.exec(r);
    if (s === null)
      break;
    t.push(s[0]);
  }
  r = r.replace(i, "");
  const a = /@import[\s\S]*?url\([^)]*\)[\s\S]*?;/gi, o = "((\\s*?(?:\\/\\*[\\s\\S]*?\\*\\/)?\\s*?@media[\\s\\S]*?){([\\s\\S]*?)}\\s*?})|(([\\s\\S]*?){([\\s\\S]*?)})", l = new RegExp(o, "gi");
  for (; ; ) {
    let s = a.exec(r);
    if (s === null) {
      if (s = l.exec(r), s === null)
        break;
      a.lastIndex = l.lastIndex;
    } else
      l.lastIndex = a.lastIndex;
    t.push(s[0]);
  }
  return t;
}
async function Ku(e, t) {
  const n = [], r = [];
  return e.forEach((i) => {
    if ("cssRules" in i)
      try {
        yt(i.cssRules || []).forEach((a, o) => {
          if (a.type === CSSRule.IMPORT_RULE) {
            let l = o + 1;
            const s = a.href, d = ii(s).then((c) => oi(c, t)).then((c) => si(c).forEach((m) => {
              try {
                i.insertRule(m, m.startsWith("@import") ? l += 1 : i.cssRules.length);
              } catch (u) {
                console.error("Error inserting rule from remote css", {
                  rule: m,
                  error: u
                });
              }
            })).catch((c) => {
              console.error("Error loading remote css", c.toString());
            });
            r.push(d);
          }
        });
      } catch (a) {
        const o = e.find((l) => l.href == null) || document.styleSheets[0];
        i.href != null && r.push(ii(i.href).then((l) => oi(l, t)).then((l) => si(l).forEach((s) => {
          o.insertRule(s, o.cssRules.length);
        })).catch((l) => {
          console.error("Error loading remote stylesheet", l);
        })), console.error("Error inlining remote css file", a);
      }
  }), Promise.all(r).then(() => (e.forEach((i) => {
    if ("cssRules" in i)
      try {
        yt(i.cssRules || []).forEach((a) => {
          n.push(a);
        });
      } catch (a) {
        console.error(`Error while reading CSS rules from ${i.href}`, a);
      }
  }), n));
}
function Xu(e) {
  return e.filter((t) => t.type === CSSRule.FONT_FACE_RULE).filter((t) => ho(t.style.getPropertyValue("src")));
}
async function Yu(e, t) {
  if (e.ownerDocument == null)
    throw new Error("Provided element is not within a Document");
  const n = yt(e.ownerDocument.styleSheets), r = await Ku(n, t);
  return Xu(r);
}
function vo(e) {
  return e.trim().replace(/["']/g, "");
}
function Zu(e) {
  const t = /* @__PURE__ */ new Set();
  function n(r) {
    (r.style.fontFamily || getComputedStyle(r).fontFamily).split(",").forEach((a) => {
      t.add(vo(a));
    }), Array.from(r.children).forEach((a) => {
      a instanceof HTMLElement && n(a);
    });
  }
  return n(e), t;
}
async function Qu(e, t) {
  const n = await Yu(e, t), r = Zu(e);
  return (await Promise.all(n.filter((a) => r.has(vo(a.style.fontFamily))).map((a) => {
    const o = a.parentStyleSheet ? a.parentStyleSheet.href : null;
    return Eo(a.cssText, o, t);
  }))).join(`
`);
}
async function em(e, t) {
  const n = t.fontEmbedCSS != null ? t.fontEmbedCSS : t.skipFonts ? null : await Qu(e, t);
  if (n) {
    const r = document.createElement("style"), i = document.createTextNode(n);
    r.appendChild(i), e.firstChild ? e.insertBefore(r, e.firstChild) : e.appendChild(r);
  }
}
async function wo(e, t = {}) {
  const { width: n, height: r } = po(e, t), i = await Gn(e, t, !0);
  return await em(i, t), await bo(i, t), Vu(i, t), await Eu(i, n, r);
}
async function So(e, t = {}) {
  const { width: n, height: r } = po(e, t), i = await wo(e, t), a = await Rn(i), o = document.createElement("canvas"), l = o.getContext("2d"), s = t.pixelRatio || gu(), d = t.canvasWidth || n, c = t.canvasHeight || r;
  return o.width = d * s, o.height = c * s, t.skipAutoScale || yu(o), o.style.width = `${d}`, o.style.height = `${c}`, t.backgroundColor && (l.fillStyle = t.backgroundColor, l.fillRect(0, 0, o.width, o.height)), l.drawImage(a, 0, 0, o.width, o.height), o;
}
async function tm(e, t = {}) {
  return (await So(e, t)).toDataURL();
}
const nm = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  toCanvas: So,
  toPng: tm,
  toSvg: wo
}, Symbol.toStringTag, { value: "Module" }));
